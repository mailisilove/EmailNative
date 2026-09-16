export type EmailCategory = 
  | 'verification'   // 验证码 / 2FA
  | 'transactional'  // 账单 / 交易 / 发票
  | 'business'       // 重要业务沟通 / 合作
  | 'marketing'      // 推广促销 / 周报
  | 'personal'       // 个人往来
  | 'spam';          // 垃圾 / 风险邮件

export type AutomationLevel = 'conservative' | 'balanced' | 'autonomous';

export type DomainProtocolType = 'cloudflare' | 'traditional_imap';

export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface VerificationCodeInfo {
  code: string;
  serviceName: string;
  expiresInMinutes?: number;
  extractedAt: string;
}

export interface ExtractedActionItem {
  id: string;
  title: string;
  type: 'todo' | 'calendar' | 'payment';
  dueDate?: string;
  amount?: string;
  completed: boolean;
}

export interface DeepSeekReasoningInfo {
  model: 'deepseek-chat' | 'deepseek-reasoner';
  reasoningContent: string;
  thoughtDurationMs: number;
  cacheHitTokens: number;
  cacheMissTokens: number;
  cacheHitRatio: number;
}

export interface AgentInsight {
  summary: string;
  category: EmailCategory;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  sentiment: 'positive' | 'neutral' | 'negative';
  verificationCode?: VerificationCodeInfo;
  actionItems: ExtractedActionItem[];
  proposedReply?: {
    subject: string;
    body: string;
    confidence: number;
    reasoning: string;
    autoSent: boolean;
  };
  deepseekReasoning?: DeepSeekReasoningInfo;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
    costUsd: number;
  };
  processedAt: string;
  isStopped?: boolean;
}

export interface EmailMessage {
  id: string;
  domainId: string;
  toAddress: string;
  fromAddress: string;
  fromName: string;
  subject: string;
  snippet: string;
  bodyText: string;
  bodyHtml?: string;
  receivedAt: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  attachments: EmailAttachment[];
  agentProcessed: boolean;
  agentInsight?: AgentInsight;
  labels: string[];
}

export interface DomainAlias {
  id: string;
  domainId: string;
  prefix: string;
  fullAddress: string;
  description: string;
  createdAt: string;
  emailCount: number;
  isActive: boolean;
  autoReplyEnabled: boolean;
  displayName?: string;    // 发信显示名，如 "CutReady Support"
  aiPersona?: string;      // 专属客服人设与知识库 Prompt
  signature?: string;      // 专属邮件 HTML 签名
}

export interface TraditionalIMAPConfig {
  imapHost: string;
  imapPort: number;
  imapSecure: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  username: string;
  password?: string;
  preset?: 'tencent' | 'netease' | 'aliyun' | 'gmail' | 'outlook' | 'custom';
}

export interface ManagedDomain {
  id: string;
  domain: string;
  status: 'active' | 'pending_dns' | 'paused' | 'error';
  provider: DomainProtocolType;
  cloudflareZoneId?: string;
  traditionalConfig?: TraditionalIMAPConfig;
  aliases: DomainAlias[];
  totalReceived: number;
  createdAt: string;
  defaultAutomationLevel: AutomationLevel;
  displayName?: string;    // 域名默认发信名
  aiPersona?: string;      // 域名级通用 AI 客服知识库 Prompt
  signature?: string;      // 域名默认邮件签名
}

export interface AgentPipelineStep {
  id: 'security_filter' | 'extractor' | 'drafter' | 'action_runner';
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'skipped' | 'stopped';
  output?: string;
  durationMs?: number;
}

export interface AgentPipelineRun {
  runId: string;
  emailId: string;
  emailSubject: string;
  domainAddress: string;
  startedAt: string;
  completedAt?: string;
  status: 'processing' | 'success' | 'needs_approval' | 'error' | 'stopped';
  steps: AgentPipelineStep[];
  tokensConsumed: number;
  costEstimateUsd: number;
  deepseekModel?: string;
  reasoningExcerpt?: string;
}

export interface LLMConfig {
  provider: 'deepseek' | 'anthropic' | 'openai' | 'ollama';
  apiKey: string;
  model: 'deepseek-chat' | 'deepseek-reasoner' | string;
  apiEndpoint?: string;
  temperature: number;
  autoProcessInbound: boolean;
  automationLevel: AutomationLevel;
  enableReasoningStream: boolean; // 是否展示 DeepSeek-R1 思维链
  maxCostPerRunUsd?: number;      // 单封邮件研判最高限额（美元，如 0.05）
  dailyBudgetUsd?: number;        // 单日累计预算上限（美元，如 1.00）
  requireManualConfirm?: boolean; // 研判前提示确认
}

export interface CloudflareConfig {
  apiToken: string;
  accountId: string;
  workerDomain: string;
  masterForwardEmail?: string; // 集中归集主邮箱，如 backup@yourdomain.com
  d1DatabaseId?: string;
  isConfigured: boolean;
}

export interface OutboundMailConfig {
  provider: 'resend' | 'smtp' | 'cloudflare';
  resendApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  defaultFromName: string;
}
