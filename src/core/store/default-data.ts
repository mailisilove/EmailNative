/**
 * Default Seed Data
 * 系统初次启动时的默认配置、域名与别名数据
 * 支持：Cloudflare Email Routing 与 传统企业邮箱 (IMAP / SMTP) 双轨并行
 */
import { CloudflareConfig, LLMConfig, ManagedDomain, OutboundMailConfig } from '../types';
import { TRADITIONAL_MAILBOX_PRESETS } from '../email-gateway/imap-adapter';

export const DEFAULT_DOMAINS: ManagedDomain[] = [
  {
    id: 'dom_cutready',
    domain: 'cutready.app',
    status: 'active',
    provider: 'cloudflare',
    displayName: 'CutReady Team',
    aiPersona: '你代表 CutReady (一款 AI 自动化专业抠图与切图软件)。产品政策：支持一键透明背景、发丝级抠图与批量切图导出；7天内未消耗超过50次处理可全额退款；API 接口文档位于 docs.cutready.app。回复时态度诚恳专业，积极解答客户关于图像格式、抠图质量或订阅退款的问题。',
    signature: '--\nCutReady Support Team\nWebsite: https://cutready.app | Fast & Accurate AI Image Cutout',
    totalReceived: 18,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    defaultAutomationLevel: 'balanced',
    aliases: [
      {
        id: 'alias_cr_support',
        domainId: 'dom_cutready',
        prefix: 'support',
        fullAddress: 'support@cutready.app',
        displayName: 'CutReady Support',
        description: 'CutReady 客户技术支持、工单与退款申诉',
        createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
        emailCount: 12,
        isActive: true,
        autoReplyEnabled: true,
        aiPersona: '你是 CutReady 首席技术支持。重点处理扣费退款、抠图边缘模糊、批量导出失败等工单，给出清晰的操作指引。',
        signature: 'Best regards,\nCutReady Technical Support\nEmail: support@cutready.app\nWeb: https://cutready.app',
      },
      {
        id: 'alias_cr_billing',
        domainId: 'dom_cutready',
        prefix: 'billing',
        fullAddress: 'billing@cutready.app',
        displayName: 'CutReady Billing',
        description: 'Stripe 订阅账单与发票自动提取',
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        emailCount: 6,
        isActive: true,
        autoReplyEnabled: false,
      }
    ],
  },
  {
    id: 'dom_imagelayered',
    domain: 'image-layered.app',
    status: 'active',
    provider: 'cloudflare',
    displayName: 'Image Layered Team',
    aiPersona: '你代表 Image-Layered (智能图像分层与 PSD 生成设计工具)。产品政策：支持一键将扁平图片解构为分层设计稿并导出 PSD；Pro 会员享 4K 分辨率深度图层分离；若用户反馈图层重叠或文字未分出，请引导在高级设置开启 OCR 辅助。回复语气现代极客、高效专业。',
    signature: '--\nImage Layered Success Team\nWebsite: https://image-layered.app | AI-Powered Image Deconstruction',
    totalReceived: 15,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    defaultAutomationLevel: 'balanced',
    aliases: [
      {
        id: 'alias_il_support',
        domainId: 'dom_imagelayered',
        prefix: 'support',
        fullAddress: 'support@image-layered.app',
        displayName: 'Image Layered Support',
        description: 'Image Layered 用户设计答疑与产品功能咨询',
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        emailCount: 10,
        isActive: true,
        autoReplyEnabled: true,
        aiPersona: '你是 Image-Layered 专家支持，指导设计师如何将 AI 生成的图拆解成 Photoshop 可编辑的独立图层。',
        signature: 'Cheers,\nImage Layered Customer Care\nEmail: support@image-layered.app\nWeb: https://image-layered.app',
      }
    ],
  },
  {
    id: 'dom_1',
    domain: 'mytech.dev',
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
        fullAddress: 'auth@mytech.dev',
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
        fullAddress: 'billing@mytech.dev',
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
