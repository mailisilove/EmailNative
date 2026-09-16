/**
 * Default Seed Data
 * 系统初次启动时的默认配置、域名与别名数据
 * 支持：Cloudflare Email Routing 与 传统企业邮箱 (IMAP / SMTP) 双轨并行
 */
import { CloudflareConfig, LLMConfig, ManagedDomain, OutboundMailConfig } from '../types';
import { TRADITIONAL_MAILBOX_PRESETS } from '../email-gateway/imap-adapter';

export const DEFAULT_DOMAINS: ManagedDomain[] = [
  {
    id: 'dom_saas_demo',
    domain: 'saas-demo.com',
    status: 'active',
    provider: 'cloudflare',
    displayName: 'SaaS Demo Team',
    aiPersona: '你代表 SaaS Demo 智能云平台。支持企业级云工作流与团队协作自动化；7天内未深度使用的客户支持工单咨询与退款保障。回复时态度诚恳专业，高效解答客户关于产品功能、API集成或订阅方案的提问。',
    signature: '--\nSaaS Demo Support Team\nWebsite: https://saas-demo.com | Cloud Intelligence Platform',
    totalReceived: 18,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    defaultAutomationLevel: 'balanced',
    aliases: [
      {
        id: 'alias_sd_support',
        domainId: 'dom_saas_demo',
        prefix: 'support',
        fullAddress: 'support@saas-demo.com',
        displayName: 'SaaS Demo Support',
        description: '客户技术支持、工单与系统集成咨询',
        createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
        emailCount: 12,
        isActive: true,
        autoReplyEnabled: true,
        aiPersona: '你是 SaaS Demo 首席支持专家。重点处理技术对接、订阅升级等咨询，给出清晰操作指引。',
        signature: 'Best regards,\nSaaS Demo Technical Support\nEmail: support@saas-demo.com\nWeb: https://saas-demo.com',
      },
      {
        id: 'alias_sd_billing',
        domainId: 'dom_saas_demo',
        prefix: 'billing',
        fullAddress: 'billing@saas-demo.com',
        displayName: 'SaaS Demo Billing',
        description: '订阅账单、发票收据自动归集',
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        emailCount: 6,
        isActive: true,
        autoReplyEnabled: false,
      }
    ],
  },
  {
    id: 'dom_cloud_stack',
    domain: 'cloud-stack.dev',
    status: 'active',
    provider: 'cloudflare',
    displayName: 'CloudStack Team',
    aiPersona: '你代表 CloudStack (现代开发者工具与微服务组件中心)。产品政策：支持一键部署高可用服务与无服务器函数；回复语气现代极客、高效专业。',
    signature: '--\nCloudStack Developer Relations\nWebsite: https://cloud-stack.dev | Next-Gen Cloud Platform',
    totalReceived: 15,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    defaultAutomationLevel: 'balanced',
    aliases: [
      {
        id: 'alias_cs_support',
        domainId: 'dom_cloud_stack',
        prefix: 'support',
        fullAddress: 'support@cloud-stack.dev',
        displayName: 'CloudStack Dev Support',
        description: '开发者 API 接入答疑与技术支持',
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        emailCount: 10,
        isActive: true,
        autoReplyEnabled: true,
        aiPersona: '你是 CloudStack 开发者工程师，负责解答开发者的 API 架构与调用问题。',
        signature: 'Cheers,\nCloudStack Care Team\nEmail: support@cloud-stack.dev\nWeb: https://cloud-stack.dev',
      }
    ],
  },
  {
    id: 'dom_1',
    domain: 'tech-corp.org',
    status: 'active',
    provider: 'cloudflare',
    cloudflareZoneId: 'zone_cf_9021820192',
    totalReceived: 38,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    defaultAutomationLevel: 'balanced',
    aliases: [
      {
        id: 'alias_1',
        domainId: 'dom_1',
        prefix: 'auth',
        fullAddress: 'auth@tech-corp.org',
        description: '专用 2FA / 注册验证码接收，Agent 自动高亮提取',
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        emailCount: 14,
        isActive: true,
        autoReplyEnabled: false,
      },
      {
        id: 'alias_2',
        domainId: 'dom_1',
        prefix: 'billing',
        fullAddress: 'billing@tech-corp.org',
        description: 'SaaS 账单与发票自动提取归档',
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        emailCount: 9,
        isActive: true,
        autoReplyEnabled: false,
      },
    ],
  },
];

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: 'deepseek',
  apiKey: '',
  model: 'deepseek-reasoner', // 默认原生启用 DeepSeek-R1 深度推理模型
  apiEndpoint: 'https://api.deepseek.com',
  temperature: 0.3,
  autoProcessInbound: false, // 默认关闭来信自动研判，由用户精准手动控制，避免产生意外开销
  automationLevel: 'balanced',
  enableReasoningStream: true, // 默认开启 DSCode 风格的思维链流
  maxCostPerRunUsd: 0.05,     // 单封邮件研判最高限额 $0.05
  dailyBudgetUsd: 1.00,       // 单日预算保护上限 $1.00
  requireManualConfirm: false,
};

export const DEFAULT_CLOUDFLARE_CONFIG: CloudflareConfig = {
  apiToken: '',
  accountId: '',
  workerDomain: 'https://mail-worker.yourdomain.workers.dev',
  masterForwardEmail: '', // 可选集中归集主邮箱
  isConfigured: false,
};

export const DEFAULT_OUTBOUND_CONFIG: OutboundMailConfig = {
  provider: 'resend',
  defaultFromName: 'Support Team',
  resendApiKey: '',
};
