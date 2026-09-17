/**
 * Local-First Data Store
 * 借鉴 mkagent 的本地状态优先理念，实现离线可读写、内存缓存与持久化同步
 */
import { 
  EmailMessage, 
  ManagedDomain, 
  DomainAlias, 
  AgentPipelineRun, 
  LLMConfig, 
  CloudflareConfig, 
  OutboundMailConfig,
  DomainProtocolType,
  TraditionalIMAPConfig
} from '../types';
import { INITIAL_MOCK_EMAILS } from '../email-gateway/mock-mail-generator';
import { DEFAULT_DOMAINS, DEFAULT_LLM_CONFIG, DEFAULT_CLOUDFLARE_CONFIG, DEFAULT_OUTBOUND_CONFIG } from './default-data';
import { MimeParser } from '../email-gateway/mime-parser';

const STORAGE_KEYS = {
  EMAILS: 'emailnative_emails_v1',
  DOMAINS: 'emailnative_domains_v1',
  PIPELINE_RUNS: 'emailnative_pipeline_runs_v1',
  LLM_CONFIG: 'emailnative_llm_config_v1',
  CF_CONFIG: 'emailnative_cf_config_v1',
  OUTBOUND_CONFIG: 'emailnative_outbound_config_v1',
  LANGUAGE: 'emailnative_lang_v1',
  THEME: 'emailnative_theme_v1',
};

export class LocalStorageDB {
  private static load<T>(key: string, fallback: T): T {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return fallback;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private static save<T>(key: string, value: T): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (err) {
      console.error('Save to local store failed', err);
    }
  }

  // ----------------- 邮件操作 -----------------
  static getEmails(): EmailMessage[] {
    const raw = this.load<EmailMessage[]>(STORAGE_KEYS.EMAILS, INITIAL_MOCK_EMAILS);
    return raw.map(m => {
      const cleanTo = MimeParser.cleanEmailAddress(m.toAddress);
      const cleanFrom = MimeParser.cleanEmailAddress(m.fromAddress);

      // 自动清洗可能残存的原始 EML 网络头或 Base64 乱码
      if (m.bodyText && (/^(?:Received:|ARC-|DKIM-|Return-Path:|From:|Subject:|Date:|Mime-Version:)/im.test(m.bodyText) || /^[A-Za-z0-9+/=\r\n\s]{40,}$/.test(m.bodyText.trim()))) {
        const parsed = MimeParser.parseBody(m.bodyText);
        return {
          ...m,
          toAddress: cleanTo || m.toAddress,
          fromAddress: cleanFrom || m.fromAddress,
          subject: MimeParser.decodeWords(m.subject),
          fromName: MimeParser.decodeWords(m.fromName || m.fromAddress.split('@')[0]),
          bodyText: parsed.plainText,
          snippet: parsed.snippet || m.snippet,
        };
      }
      return {
        ...m,
        toAddress: cleanTo || m.toAddress,
        fromAddress: cleanFrom || m.fromAddress,
      };
    });
  }

  static saveEmails(emails: EmailMessage[]): void {
    this.save(STORAGE_KEYS.EMAILS, emails);
  }

  static addEmail(email: EmailMessage): EmailMessage[] {
    const emails = this.getEmails();
    const cleanMail: EmailMessage = {
      ...email,
      toAddress: MimeParser.cleanEmailAddress(email.toAddress) || email.toAddress,
      fromAddress: MimeParser.cleanEmailAddress(email.fromAddress) || email.fromAddress,
    };
    const updated = [cleanMail, ...emails];
    this.saveEmails(updated);
    return updated;
  }

  static updateEmail(id: string, partial: Partial<EmailMessage>): EmailMessage[] {
    const emails = this.getEmails();
    const updated = emails.map(m => (m.id === id ? { ...m, ...partial } : m));
    this.saveEmails(updated);
    return updated;
  }

  // ----------------- 域名与别名管理 -----------------
  static getDomains(): ManagedDomain[] {
    return this.load<ManagedDomain[]>(STORAGE_KEYS.DOMAINS, DEFAULT_DOMAINS);
  }

  static saveDomains(domains: ManagedDomain[]): void {
    this.save(STORAGE_KEYS.DOMAINS, domains);
  }

  static addDomain(
    domainName: string, 
    provider: DomainProtocolType = 'cloudflare',
    traditionalConfig?: TraditionalIMAPConfig
  ): ManagedDomain[] {
    const domains = this.getDomains();
    const cleanDomain = domainName.toLowerCase().trim()
      .replace(/^https?:\/\//, '')
      .replace(/^.*@/, '')
      .replace(/\/.*$/, '')
      .trim();

    const initialPrefix = traditionalConfig ? traditionalConfig.username.split('@')[0] : 'contact';
    const initialAddress = traditionalConfig ? traditionalConfig.username : `${initialPrefix}@${cleanDomain}`;

    const newDomain: ManagedDomain = {
      id: `dom_${Date.now()}`,
      domain: cleanDomain,
      status: 'active',
      provider,
      traditionalConfig,
      totalReceived: 0,
      createdAt: new Date().toISOString(),
      defaultAutomationLevel: 'balanced',
      aliases: [
        {
          id: `alias_${Date.now()}_main`,
          domainId: `dom_${Date.now()}`,
          prefix: initialPrefix,
          fullAddress: initialAddress,
          description: traditionalConfig ? '主企业邮箱账户' : '默认联系人邮箱',
          createdAt: new Date().toISOString(),
          emailCount: 0,
          isActive: true,
          autoReplyEnabled: true,
        }
      ],
    };
    const updated = [...domains, newDomain];
    this.saveDomains(updated);
    return updated;
  }

  static updateDomain(domainId: string, updates: Partial<ManagedDomain>): ManagedDomain[] {
    const domains = this.getDomains();
    const updated = domains.map(d => (d.id === domainId ? { ...d, ...updates } : d));
    this.saveDomains(updated);
    return updated;
  }

  static deleteDomain(domainId: string, deleteAssociatedEmails = false): ManagedDomain[] {
    const domains = this.getDomains();
    const updated = domains.filter(d => d.id !== domainId);
    this.saveDomains(updated);

    if (deleteAssociatedEmails) {
      const emails = this.getEmails();
      const filteredEmails = emails.filter(m => m.domainId !== domainId);
      this.saveEmails(filteredEmails);
    }
    return updated;
  }

  static addAlias(domainId: string, prefix: string, description: string): ManagedDomain[] {
    const domains = this.getDomains();
    const updated = domains.map(d => {
      if (d.id !== domainId) return d;
      let cleanPrefix = prefix.toLowerCase().trim();
      if (cleanPrefix.includes('@')) {
        cleanPrefix = cleanPrefix.split('@')[0];
      }
      cleanPrefix = cleanPrefix.replace(/[^a-z0-9_.-]/g, '');
      const newAlias: DomainAlias = {
        id: `alias_${Date.now()}`,
        domainId: d.id,
        prefix: cleanPrefix,
        fullAddress: `${cleanPrefix}@${d.domain}`,
        description,
        createdAt: new Date().toISOString(),
        emailCount: 0,
        isActive: true,
        autoReplyEnabled: false,
      };
      return {
        ...d,
        aliases: [...d.aliases, newAlias],
      };
    });
    this.saveDomains(updated);
    return updated;
  }

  /**
   * 自动根据邮件来信地址发现域名和别名（支持 Catch-all 全收模式下的邮箱自动识别入册）
   */
  static autoDiscoverDomainsAndAliases(emails: EmailMessage[]): ManagedDomain[] {
    let domains = this.getDomains();
    let changed = false;

    for (const mail of emails) {
      const cleanTo = MimeParser.cleanEmailAddress(mail.toAddress);
      const toDomain = MimeParser.extractEmailDomain(cleanTo);
      const toPrefix = MimeParser.extractEmailPrefix(cleanTo);

      if (!toDomain || !toPrefix) continue;

      let dom = domains.find(d => d.domain.toLowerCase() === toDomain.toLowerCase());
      if (!dom) {
        const domainId = `dom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const newDomain: ManagedDomain = {
          id: domainId,
          domain: toDomain,
          status: 'active',
          provider: 'cloudflare',
          displayName: toDomain,
          totalReceived: 1,
          createdAt: new Date().toISOString(),
          defaultAutomationLevel: 'balanced',
          aliases: [
            {
              id: `alias_${Date.now()}_${toPrefix}`,
              domainId: domainId,
              prefix: toPrefix,
              fullAddress: `${toPrefix}@${toDomain}`,
              displayName: toPrefix,
              description: '自动归集收信邮箱',
              createdAt: new Date().toISOString(),
              emailCount: 1,
              isActive: true,
              autoReplyEnabled: false,
            }
          ]
        };
        domains = [...domains, newDomain];
        changed = true;
      } else {
        const aliasExists = dom.aliases.some(a => 
          a.prefix.toLowerCase() === toPrefix.toLowerCase() ||
          MimeParser.cleanEmailAddress(a.fullAddress) === cleanTo
        );
        if (!aliasExists) {
          const newAlias: DomainAlias = {
            id: `alias_${Date.now()}_${toPrefix}`,
            domainId: dom.id,
            prefix: toPrefix,
            fullAddress: `${toPrefix}@${dom.domain}`,
            displayName: toPrefix,
            description: '自动归集收信邮箱',
            createdAt: new Date().toISOString(),
            emailCount: 1,
            isActive: true,
            autoReplyEnabled: false,
          };
          domains = domains.map(d => d.id === dom!.id ? { ...d, aliases: [...d.aliases, newAlias] } : d);
          changed = true;
        }
      }
    }

    if (changed) {
      this.saveDomains(domains);
    }
    return domains;
  }

  static updateAlias(domainId: string, aliasId: string, updates: Partial<DomainAlias>): ManagedDomain[] {
    const domains = this.getDomains();
    const updated = domains.map(d => {
      if (d.id !== domainId) return d;
      return {
        ...d,
        aliases: d.aliases.map(a => (a.id === aliasId ? { ...a, ...updates } : a)),
      };
    });
    this.saveDomains(updated);
    return updated;
  }

  static deleteAlias(domainId: string, aliasId: string): ManagedDomain[] {
    const domains = this.getDomains();
    const updated = domains.map(d => {
      if (d.id !== domainId) return d;
      return {
        ...d,
        aliases: d.aliases.filter(a => a.id !== aliasId),
      };
    });
    this.saveDomains(updated);
    return updated;
  }

  // ----------------- Agent 运行日志 -----------------
  static getPipelineRuns(): AgentPipelineRun[] {
    return this.load<AgentPipelineRun[]>(STORAGE_KEYS.PIPELINE_RUNS, []);
  }

  static addPipelineRun(run: AgentPipelineRun): AgentPipelineRun[] {
    const runs = this.getPipelineRuns();
    const updated = [run, ...runs.filter(r => r.runId !== run.runId)].slice(0, 50); // 保留最新 50 次
    this.save(STORAGE_KEYS.PIPELINE_RUNS, updated);
    return updated;
  }

  // ----------------- 配置存取 -----------------
  static getLLMConfig(): LLMConfig {
    return this.load<LLMConfig>(STORAGE_KEYS.LLM_CONFIG, DEFAULT_LLM_CONFIG);
  }

  static saveLLMConfig(config: LLMConfig): void {
    this.save(STORAGE_KEYS.LLM_CONFIG, config);
  }

  static getCFConfig(): CloudflareConfig {
    return this.load<CloudflareConfig>(STORAGE_KEYS.CF_CONFIG, DEFAULT_CLOUDFLARE_CONFIG);
  }

  static saveCFConfig(config: CloudflareConfig): void {
    this.save(STORAGE_KEYS.CF_CONFIG, config);
  }

  static getOutboundConfig(): OutboundMailConfig {
    return this.load<OutboundMailConfig>(STORAGE_KEYS.OUTBOUND_CONFIG, DEFAULT_OUTBOUND_CONFIG);
  }

  static saveOutboundConfig(config: OutboundMailConfig): void {
    this.save(STORAGE_KEYS.OUTBOUND_CONFIG, config);
  }

  // ----------------- 界面语言 -----------------
  static getLanguage(): 'zh' | 'en' {
    if (typeof window === 'undefined') return 'zh';
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (stored === 'zh' || stored === 'en') return stored;
      return navigator.language.startsWith('zh') ? 'zh' : 'en';
    } catch {
      return 'zh';
    }
  }

  static saveLanguage(lang: 'zh' | 'en'): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
      }
    } catch (err) {
      console.error('Save language failed', err);
    }
  }

  // ----------------- 界面主题 -----------------
  static getTheme(): 'dark' | 'light' {
    if (typeof window === 'undefined') return 'dark';
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored === 'dark' || stored === 'light') return stored;
      return 'dark'; // 默认保留科技感深色暗黑，用户可随时切换浅色白色
    } catch {
      return 'dark';
    }
  }

  static saveTheme(theme: 'dark' | 'light'): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
      }
    } catch (err) {
      console.error('Save theme failed', err);
    }
  }
}
