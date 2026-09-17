/**
 * Cloudflare Worker Client (Production Edition)
 * 基于 dreamhunter2333/cloudflare_temp_email API 规范的邮件服务客户端
 */
import { EmailMessage } from '../types';
import { MimeParser } from './mime-parser';

export interface CFWorkerEmailItem {
  id: string;
  source: string;
  address: string;
  raw?: string;
  subject?: string;
  message?: string;
  created_at: string;
}

export class CloudflareWorkerClient {
  private workerDomain: string;
  private apiToken: string;

  constructor(workerDomain: string, apiToken: string) {
    this.workerDomain = (workerDomain || '').replace(/\/+$/, '');
    this.apiToken = apiToken || '';
  }

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-custom-auth': this.apiToken,
      'Authorization': `Bearer ${this.apiToken}`
    };
  }

  /**
   * 探测生产 Worker 连通性与健康状态
   */
  async checkHealth(): Promise<{ ok: boolean; message: string; version?: string; d1Bound?: boolean; emailCount?: number; recentEmails?: any[] }> {
    if (!this.workerDomain || !this.workerDomain.startsWith('http')) {
      return { ok: false, message: '未配置合法的 Cloudflare Worker 域名 (需以 http:// 或 https:// 开头)' };
    }

    try {
      const res = await fetch(`${this.workerDomain}/api/health`, {
        headers: this.headers,
      });

      if (!res.ok) {
        return { ok: false, message: `HTTP ${res.status}: 无法连接至 Worker 服务，请确认 Worker 是否已成功 deploy` };
      }

      const data = await res.json();

      // 诊断 1: 检查鉴权密钥是否匹配
      if (data.token_configured && data.token_matched === false) {
        return {
          ok: false,
          message: '⚠️ Worker 服务已连通，但 ADMIN_TOKEN 密钥不匹配！请核对设置中的安全 Token 是否与 wrangler.toml 一致。',
          version: data.version,
          d1Bound: data.d1_bound,
        };
      }

      // 诊断 2: 检查 D1 是否绑定
      if (data.d1_bound === false) {
        return {
          ok: false,
          message: '⚠️ Worker 已在线，但未检测到 D1 数据库绑定！请在 Cloudflare 控制台确认 Worker 是否添加了名为 "DB" 的 D1 绑定。',
          version: data.version,
          d1Bound: false,
        };
      }

      return { 
        ok: true, 
        message: `✅ Cloudflare 网关运行正常 (D1 数据库就绪，云端已存储 ${data.d1_emails_count || 0} 封真实来信)`,
        version: data.version,
        d1Bound: data.d1_bound,
        emailCount: data.d1_emails_count ?? 0,
        recentEmails: data.recent_emails || [],
      };
    } catch (err: any) {
      return { ok: false, message: err?.message || '网络连接超时或无法解析域名' };
    }
  }

  /**
   * 一键初始化远程 D1 数据库表
   */
  async initDatabase(): Promise<{ ok: boolean; message: string }> {
    if (!this.workerDomain) return { ok: false, message: '未配置 Worker 域名' };
    try {
      const res = await fetch(`${this.workerDomain}/api/init_db`, {
        headers: this.headers,
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        return { 
          ok: false, 
          message: `线上 Worker 未更新最新代码，未识别 /api/init_db 路由（返回了: "${text.slice(0, 40)}"）。请在 Cloudflare D1 Console 直接执行建表 SQL，或将本地 worker.js 重新部署至线上。` 
        };
      }
      return { ok: res.ok && data.ok, message: data.message || '初始化完成' };
    } catch (err: any) {
      return { ok: false, message: err?.message || '请求初始化失败' };
    }
  }

  /**
   * 从生产 Cloudflare D1 拉取真实邮件并转换为桌面客户端消息模型
   */
  async syncProductionEmails(knownEmailIds: Set<string>, limit = 50): Promise<EmailMessage[]> {
    if (!this.workerDomain) return [];

    try {
      const url = new URL(`${this.workerDomain}/api/mails`);
      url.searchParams.set('limit', String(limit));

      const res = await fetch(url.toString(), {
        headers: this.headers,
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('鉴权失败 (401 Unauthorized)：请核对设置中的 Cloudflare Token 是否与 wrangler.toml 中的 ADMIN_TOKEN 一致。');
        }
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || `Worker HTTP ${res.status}`);
      }

      const json = await res.json();
      const rawList: CFWorkerEmailItem[] = Array.isArray(json.results) ? json.results : [];
      
      const newMessages: EmailMessage[] = [];

      for (const item of rawList) {
        if (knownEmailIds.has(item.id)) {
          continue; // 已同步过的本地邮件，跳过
        }

        const raw = item.raw || item.message || '';
        const parsed = MimeParser.parseBody(raw);

        const cleanTo = MimeParser.cleanEmailAddress(item.address);
        const cleanFrom = MimeParser.cleanEmailAddress(item.source);
        const domainPart = MimeParser.extractEmailDomain(cleanTo);
        const cleanSubject = MimeParser.decodeWords(item.subject || '(无主题)');
        const cleanSourceName = MimeParser.decodeWords(item.source ? item.source.split('@')[0] : '未知发件人');

        const msg: EmailMessage = {
          id: item.id,
          domainId: domainPart || 'cf_domain',
          toAddress: cleanTo || item.address,
          fromAddress: cleanFrom || item.source,
          fromName: cleanSourceName,
          subject: cleanSubject,
          snippet: parsed.snippet,
          bodyText: parsed.plainText,
          bodyHtml: parsed.cleanHtml || undefined,
          receivedAt: item.created_at || new Date().toISOString(),
          isRead: false,
          isStarred: false,
          isArchived: false,
          attachments: [],
          agentProcessed: false,
          labels: ['Live', 'Cloudflare'],
        };

        newMessages.push(msg);
      }

      return newMessages;
    } catch (err: any) {
      console.warn('[CFWorkerClient] Sync production failed:', err);
      throw err;
    }
  }

  /**
   * 通过生产 Worker 发送真实邮件
   */
  async sendMail(payload: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const res = await fetch(`${this.workerDomain}/api/send_mail`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      return {
        success: res.ok,
        messageId: json.id || json.messageId,
        error: json.error,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || '网络请求错误',
      };
    }
  }
}
