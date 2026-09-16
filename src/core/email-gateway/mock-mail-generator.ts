/**
 * Mock Email Generator
 * 用于开箱即用体验、展示与自动化测试的多场景真实邮件模板库
 */
import { EmailMessage, EmailCategory } from '../types';

export const INITIAL_MOCK_EMAILS: EmailMessage[] = [
  {
    id: 'mail_cr_001',
    domainId: 'dom_cutready',
    toAddress: 'support@cutready.app',
    fromAddress: 'emily.design@studio9.com',
    fromName: 'Emily Watson',
    subject: '[CutReady Support] 批量抠图透明边缘发黑问题咨询 & 退款申诉',
    snippet: '您好！我们今天在 CutReady 批量处理了 20 张模特白底图，导出后发现透明边缘有黑色发丝羽化瑕疵，请问是否有高质量模式？如果无法解决是否可申请退款？',
    bodyText: `CutReady 客服团队好：

我们设计工作室今天购买了 CutReady Pro 订阅（订单号 #CR-89210）。
在尝试对一批电商模特发丝图片进行一键抠图并导出 PNG 时，发现半透明边缘存在明显的黑色发丝边缘羽化。

想请教一下：
1. 客户端是否有“发丝细化”或“无反光 Alpha 通道”的高级渲染参数？
2. 如果目前暂不支持此类型复杂高反光背景，且我们只处理了 8 张图，是否符合你们 7 天内的全额退款政策？

期待技术支持尽快答复，感谢！

Emily Watson
Design Lead @ Studio9`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    isRead: false,
    isStarred: true,
    isArchived: false,
    attachments: [],
    agentProcessed: true,
    agentInsight: {
      summary: 'Studio9 设计总监咨询 CutReady 批量抠图发丝边缘瑕疵解决方案，并咨询 7 天未超 50 次全额退款政策。',
      category: 'business',
      urgency: 'high',
      sentiment: 'neutral',
      actionItems: [
        { id: 'act_cr_1', title: '回复 CutReady 发丝边缘模式操作指引并核对 8 张图退款资质', type: 'todo', completed: false }
      ],
      proposedReply: {
        subject: 'Re: [CutReady Support] 批量抠图透明边缘发黑问题咨询 & 退款申诉',
        body: `Emily 您好：

感谢您使用 CutReady！针对您反馈的发丝边缘反光与羽化瑕疵问题，建议您在导出面板勾选「高级发丝边缘抗锯齿 (Hairline Refine)」，该模式针对浅色高光背景会进行智能去色溢出处理。

关于退款政策：根据 CutReady 政策，购买 7 天内且总处理张数未满 50 次的用户，均可享受无条件全额退款。您当前处理了 8 张，完全符合退款资格。如您测试高级模式后仍不满意，可随时回复此邮件，我们将立即为您原路退款。

祝创作顺利！

Best regards,
CutReady Technical Support
Email: support@cutready.app
Web: https://cutready.app`,
        confidence: 0.95,
        reasoning: '基于 CutReady 专属知识库：命中 7 天退款政策（未超 50 次可全额退款）及导出高级发丝模式指引。',
        autoSent: false,
      },
      tokensUsed: { prompt: 410, completion: 180, total: 590, costUsd: 0.0006 },
      processedAt: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
    },
    labels: ['Customer Support', 'Refund', 'CutReady'],
  },
  {
    id: 'mail_il_001',
    domainId: 'dom_imagelayered',
    toAddress: 'support@image-layered.app',
    fromAddress: 'kenji.sato@creative-art.jp',
    fromName: 'Kenji Sato',
    subject: '[Image-Layered] 导出分层 PSD 文件中文本图层能否保持可编辑？',
    snippet: '您好！我们测试了 Image-Layered 将 AI 插画分解为 PSD 的功能，效果非常惊艳！想咨询一下图片里的海报文字在导出 PSD 后能否自动变成 Photoshop 矢量文字图层？',
    bodyText: `Image-Layered Support Team:

Hello! We recently tried your AI-powered image deconstruction tool to convert flat posters into layered PSD files. The object segmentation is remarkably accurate!

We have a feature question:
When the source image contains title text and slogans, does Image-Layered support recognizing the text and exporting it as editable Photoshop Type Layers (with detected font match), or are they currently exported as bitmap raster masks?

Looking forward to hearing from you.

Best,
Kenji Sato
Art Director, Creative Art Tokyo`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isRead: false,
    isStarred: false,
    isArchived: false,
    attachments: [],
    agentProcessed: true,
    agentInsight: {
      summary: '日本创意总监 Kenji 咨询 Image-Layered 在导出 PSD 时是否支持将文字图层转为可编辑文字图层。',
      category: 'business',
      urgency: 'medium',
      sentiment: 'positive',
      actionItems: [
        { id: 'act_il_1', title: '告知 Image-Layered 当前文字图层导出机制及 OCR 矢量文字规划', type: 'todo', completed: false }
      ],
      proposedReply: {
        subject: 'Re: [Image-Layered] 导出分层 PSD 文件中文本图层能否保持可编辑？',
        body: `Hi Kenji,

Thank you for reaching out and for your wonderful feedback on Image-Layered!

Currently, text elements are deconstructed into isolated, high-precision transparent bitmap layers within the generated PSD. 

However, we have OCR-based editable Type Layer synthesis currently in private beta, which detects Google Fonts matches and exports true editable PSD text layers. We'd love to invite your team to the beta trial if you're interested!

Cheers,
Image Layered Customer Care
Email: support@image-layered.app
Web: https://image-layered.app`,
        confidence: 0.92,
        reasoning: '基于 Image-Layered 专属知识库：当前版本图层拆分为位图掩膜，OCR 矢量文字处于内测，积极引导试用。',
        autoSent: false,
      },
      tokensUsed: { prompt: 380, completion: 150, total: 530, costUsd: 0.0005 },
      processedAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    },
    labels: ['Feature Request', 'PSD', 'ImageLayered'],
  },
  {
    id: 'mail_001',
    domainId: 'dom_1',
    toAddress: 'auth@mytech.dev',
    fromAddress: 'noreply@github.com',
    fromName: 'GitHub Security',
    subject: '[GitHub] Please verify your device: 839201',
    snippet: 'Hey! A sign-in attempt requires additional verification. Your device verification code is 839201. It will expire in 10 minutes.',
    bodyText: `Hey there!

A sign-in attempt from a new browser or location requires your verification.

Verification Code: 839201
Expires: 10 minutes
IP Address: 198.51.100.42
Location: Tokyo, Japan

If this was not you, please immediately lock your account and revoke your credentials.

Best,
The GitHub Security Team`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    isRead: false,
    isStarred: true,
    isArchived: false,
    attachments: [],
    agentProcessed: true,
    agentInsight: {
      summary: 'GitHub 新设备登录二次验证，包含 6 位时效性安全验证码。',
      category: 'verification',
      urgency: 'urgent',
      sentiment: 'neutral',
      verificationCode: {
        code: '839201',
        serviceName: 'GitHub',
        expiresInMinutes: 10,
        extractedAt: new Date(Date.now() - 1000 * 60 * 39).toISOString(),
      },
      actionItems: [],
      tokensUsed: { prompt: 210, completion: 45, total: 255, costUsd: 0.0003 },
      processedAt: new Date(Date.now() - 1000 * 60 * 39).toISOString(),
    },
    labels: ['2FA', 'Security', 'GitHub'],
  },
  {
    id: 'mail_002',
    domainId: 'dom_1',
    toAddress: 'billing@mytech.dev',
    fromAddress: 'no-reply-aws@amazon.com',
    fromName: 'Amazon Web Services',
    subject: 'Amazon Web Services Invoice Available [Account: 9481-2291-0012]',
    snippet: 'Greetings from Amazon Web Services. Your invoice for the billing period March 2026 is now available. Amount Due: $148.50 USD.',
    bodyText: `Dear AWS Customer,

Your latest invoice for the billing period March 1 - March 31, 2026 is ready for viewing.

Summary of Charges:
- Elastic Compute Cloud (EC2): $92.30
- Simple Storage Service (S3): $18.20
- CloudFront CDN & Data Transfer: $38.00
Total Amount Charged: $148.50 USD
Payment Method: Visa ending in 8820
Status: Paid Successfully

You can download the full PDF breakdown from the AWS Billing Console.

Thank you for using Amazon Web Services.`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isRead: false,
    isStarred: false,
    isArchived: false,
    attachments: [
      { id: 'att_1', name: 'AWS-Invoice-2026-03.pdf', size: 245000, type: 'application/pdf' },
    ],
    agentProcessed: true,
    agentInsight: {
      summary: 'AWS 3月份账单，已自动扣款 $148.50 USD，主要支出为 EC2 与 CDN。',
      category: 'transactional',
      urgency: 'low',
      sentiment: 'positive',
      actionItems: [
        { id: 'act_1', title: '将 3 月 AWS 发票归档至财务台账', type: 'payment', amount: '$148.50', dueDate: '2026-04-05', completed: false }
      ],
      tokensUsed: { prompt: 340, completion: 82, total: 422, costUsd: 0.0005 },
      processedAt: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
    },
    labels: ['Invoice', 'AWS', 'Finance'],
  },
  {
    id: 'mail_003',
    domainId: 'dom_2',
    toAddress: 'ceo@corp.ai-enterprise.com',
    fromAddress: 'marcus.vance@nexuscapital.vc',
    fromName: 'Marcus Vance',
    subject: 'Partnership Inquiry / Seed Round Sync with Nexus Capital',
    snippet: 'Hi team, I came across your domain email agent product and was genuinely impressed by the architecture. We would love to schedule a quick 20-min intro call next Tuesday.',
    bodyText: `Hi Team,

I'm Marcus, Principal at Nexus Capital. We specialize in backing early-stage developer tools and enterprise AI workflows.

I came across your domain email native agent project and was thoroughly impressed by your hybrid local-first architecture and multi-agent email parsing pipeline.

Do you have 20 minutes open next Tuesday or Wednesday (between 2:00 PM - 5:00 PM PST) for a brief intro sync? We'd love to learn more about your traction and explore potential investment/pilot collaboration.

Looking forward to connecting!

Best regards,
Marcus Vance
Principal | Nexus Capital
nexuscapital.vc`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isRead: true,
    isStarred: true,
    isArchived: false,
    attachments: [],
    agentProcessed: true,
    agentInsight: {
      summary: 'Nexus Capital 投资总监 Marcus 商务与种子轮融资接洽，提议下周二/周三下午进行 20 分钟线上会议。',
      category: 'business',
      urgency: 'high',
      sentiment: 'positive',
      deepseekReasoning: {
        model: 'deepseek-reasoner',
        thoughtDurationMs: 680,
        cacheHitTokens: 412,
        cacheMissTokens: 148,
        cacheHitRatio: 0.73,
        reasoningContent: `1. 身份与意图研判：
   - 发信方为海外头部创投 Nexus Capital 投资人 Marcus Vance。
   - 信件核心诉求：对团队的 Local-First 域名邮箱架构表示高度认可，主动邀约 20 分钟线上会议探讨种子轮融资与业务合作。
2. 优先级评估：
   - 商业价值极高（High Priority / Business），需在 24 小时内以规范、专业且热情的商务敬语予以答复。
3. 答复草拟逻辑：
   - 表达真诚谢意并锁定对方建议的“下周二下午 3 点 PST”。
   - 预留会议沟通入口，由创始团队身份出面回复。`
      },
      actionItems: [
        { id: 'act_2', title: '安排与 Nexus Capital Marcus 的 20分钟 Intro 会议', type: 'calendar', dueDate: '下周二/三 14:00-17:00 PST', completed: false }
      ],
      proposedReply: {
        subject: 'Re: Partnership Inquiry / Seed Round Sync with Nexus Capital',
        body: `Hi Marcus,

Thank you for reaching out and for your kind words regarding our local-first AI email agent!

We would be delighted to connect. Next Tuesday at 3:00 PM PST works great for our team. Here is our calendar link or feel free to send a Google Meet invite directly to this address.

Looking forward to our conversation!

Best regards,
Founding Team`,
        confidence: 0.94,
        reasoning: '信件来自知名风投机构且态度积极明确，已起草专业、热情的答复模板并锁定建议时隙。',
        autoSent: false,
      },
      tokensUsed: { prompt: 560, completion: 185, total: 745, costUsd: 0.0010 },
      processedAt: new Date(Date.now() - 1000 * 60 * 118).toISOString(),
    },
    labels: ['IMAP', 'Investor', 'Partnership', 'DeepSeek-R1'],
  },
  {
    id: 'mail_004',
    domainId: 'dom_1',
    toAddress: 'dev@mytech.dev',
    fromAddress: 'promo@cloud-offers-daily.xyz',
    fromName: 'Cloud Mega Deals',
    subject: '🔥 80% OFF Dedicated GPU Servers for 24 Hours Only!',
    snippet: 'Claim your bare metal H100 GPU instance today with coupon code SUPERCLOUD. Hurry, limited stock remaining.',
    bodyText: `Unsubscribe link below.
Get cheap GPU servers now! No KYC required. Click here to claim 80% discount coupon: http://suspicious-link.xyz/deal`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    isRead: true,
    isStarred: false,
    isArchived: true,
    attachments: [],
    agentProcessed: true,
    agentInsight: {
      summary: '非请求促销垃圾邮件，包含疑似低信誉跳转链接。',
      category: 'spam',
      urgency: 'low',
      sentiment: 'negative',
      actionItems: [],
      tokensUsed: { prompt: 160, completion: 30, total: 190, costUsd: 0.0002 },
      processedAt: new Date(Date.now() - 1000 * 60 * 299).toISOString(),
    },
    labels: ['Spam', 'Promo'],
  }
];

interface MockTemplate {
  from: string;
  fromName: string;
  subject: string;
  body: string;
  category: EmailCategory;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
}

export function generateRandomMockEmail(domain: string, alias?: string): EmailMessage {
  const genericTemplates: MockTemplate[] = [
    {
      from: 'verify@stripe.com',
      fromName: 'Stripe Security',
      subject: 'Your Stripe verification code: ' + Math.floor(100000 + Math.random() * 900000),
      body: `Your Stripe authentication code is ${Math.floor(100000 + Math.random() * 900000)}. This code expires in 5 minutes. Never share this code with anyone.`,
      category: 'verification',
      urgency: 'urgent',
    },
    {
      from: 'notifications@linear.app',
      fromName: 'Linear Team',
      subject: '[DEV-2094] New pull request review requested by Alex',
      body: 'Alex requested your review on "Implement local SQLite persistence layer with migration support". Please review the diff when you have time.',
      category: 'business',
      urgency: 'medium',
    },
  ];

  const cutreadyTemplates: MockTemplate[] = [
    {
      from: 'designer.mark@ecomgrowth.io',
      fromName: 'Mark Chen',
      subject: '[CutReady] 批量处理电商白底图发丝去反光咨询',
      body: '你好，我们网店近期需要批量处理 500 张服饰模特图，请问 CutReady API 是否支持通过 Webhook 异步回调结果？另外是否有企业并发加速通道？',
      category: 'business',
      urgency: 'high',
    },
    {
      from: 'support@payment-gateway.com',
      fromName: 'Billing Service',
      subject: 'CutReady Pro 订阅扣费通知（$19.00 USD）',
      body: '您的 CutReady Pro 月度计划已成功扣费 $19.00 USD。交易凭据可在控制台随时下载。',
      category: 'transactional',
      urgency: 'low',
    }
  ];

  const imageLayeredTemplates: MockTemplate[] = [
    {
      from: 'sarah.ux@fintechapp.com',
      fromName: 'Sarah Jenkins',
      subject: '[Image-Layered] UI 界面截屏转 PSD 图层分组反馈',
      body: 'Hi Image Layered team! We tried converting app screenshots to editable PSD files. The button and icon layer hierarchy is very clean. Can we expect Figma plugin support soon?',
      category: 'business',
      urgency: 'medium',
    }
  ];

  let pool: MockTemplate[] = genericTemplates;
  if (domain.includes('cutready')) {
    pool = cutreadyTemplates;
  } else if (domain.includes('image-layered')) {
    pool = imageLayeredTemplates;
  }

  const t = pool[Math.floor(Math.random() * pool.length)];
  const to = alias || `support@${domain}`;

  return {
    id: `mail_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    domainId: domain,
    toAddress: to,
    fromAddress: t.from,
    fromName: t.fromName,
    subject: t.subject,
    snippet: t.body.slice(0, 100),
    bodyText: t.body,
    receivedAt: new Date().toISOString(),
    isRead: false,
    isStarred: false,
    isArchived: false,
    attachments: [],
    agentProcessed: false,
    labels: [domain.split('.')[0]],
  };
}
