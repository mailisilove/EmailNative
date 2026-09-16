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

const STORAGE_KEYS = {
  EMAILS: 'emailnative_emails_v1',
  DOMAINS: 'emailnative_domains_v1',
  PIPELINE_RUNS: 'emailnative_pipeline_runs_v1',
  LLM_CONFIG: 'emailnative_llm_config_v1',
  CF_CONFIG: 'emailnative_cf_config_v1',
  OUTBOUND_CONFIG: 'emailnative_outbound_config_v1',
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
    return this.load<EmailMessage[]>(STORAGE_KEYS.EMAILS, INITIAL_MOCK_EMAILS);
  }

  static saveEmails(emails: EmailMessage[]): void {
    this.save(STORAGE_KEYS.EMAILS, emails);
  }

  static addEmail(email: EmailMessage): EmailMessage[] {
    const emails = this.getEmails();
    const updated = [email, ...emails];
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
    const cleanDomain = domainName.toLowerCase().trim();
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
      const cleanPrefix = prefix.toLowerCase().replace(/[^a-z0-9_-]/g, '');
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
}
