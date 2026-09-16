import { OutboundMailConfig, CloudflareConfig } from '../types';

export interface SendMailParams {
  fromAddress: string;
  fromName?: string;
  toAddress: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}

export interface SendMailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

export class OutboundSender {
  private config: OutboundMailConfig;
  private cfConfig?: CloudflareConfig;

  constructor(config: OutboundMailConfig, cfConfig?: CloudflareConfig) {
    this.config = config;
    this.cfConfig = cfConfig;
  }

  async send(params: SendMailParams): Promise<SendMailResult> {
    const from = params.fromName 
      ? `"${params.fromName}" <${params.fromAddress}>`
      : params.fromAddress;

    // 1. Resend API 直连发信
    if (this.config.provider === 'resend') {
      if (!this.config.resendApiKey || this.config.resendApiKey.trim() === '') {
        return {
          success: false,
          error: '尚未配置 Resend API Key！请点击右上角「设置」->「发信通道」，填入 Resend 密钥 (re_...)。'
        };
      }

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.resendApiKey.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: from,
            to: [params.toAddress],
            subject: params.subject,
            text: params.bodyText,
            html: params.bodyHtml || `<div style="font-family:sans-serif;line-height:1.6;">${params.bodyText.replace(/\n/g, '<br/>')}</div>`,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          return { success: true, messageId: data.id };
        } else {
          let errorHint = data.message || 'Resend 发送错误';
          if (errorHint.includes('domain is not verified') || errorHint.includes('not verified')) {
            errorHint = `发件域名未在 Resend 验证！请先在 resend.com 控制台添加域名 ${params.fromAddress.split('@')[1]} 并配置 DNS TXT 记录。`;
          } else if (errorHint.includes('API key') || res.status === 401) {
            errorHint = 'Resend API Key 无效或未授权，请检查密钥是否正确。';
          }
          return { success: false, error: errorHint };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || '无法连接 Resend 官方发信服务器，请检查网络连接' };
      }
    }

    // 2. Cloudflare Worker 代理出站发信
    if (this.config.provider === 'cloudflare') {
      if (!this.cfConfig?.workerDomain) {
        return {
          success: false,
          error: '尚未配置 Cloudflare Worker 地址！请前往「设置」->「Cloudflare」填写生产 Worker 域名。'
        };
      }

      try {
        let base = this.cfConfig.workerDomain.trim().replace(/\/+$/, '');
        if (!base.startsWith('http://') && !base.startsWith('https://')) {
          base = `https://${base}`;
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (this.cfConfig.apiToken) {
          headers['x-custom-auth'] = this.cfConfig.apiToken.trim();
        }

        const res = await fetch(`${base}/api/send_mail`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            from: from,
            to: params.toAddress,
            subject: params.subject,
            text: params.bodyText,
            html: params.bodyHtml,
          }),
        });

        const data = await res.json();
        if (res.ok && (data.id || data.success)) {
          return { success: true, messageId: data.id || 'cf_sent' };
        } else {
          return { success: false, error: data.error || data.message || 'Cloudflare Worker 发信失败' };
        }
      } catch (err: any) {
        return { success: false, error: `Cloudflare Worker 连接失败: ${err?.message}` };
      }
    }

    // 3. 本地模拟模式（仅当显式指定其他 provider 时 fallback）
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      messageId: `msg_${Date.now()}_simulated`,
      simulated: true,
    };
  }
}
