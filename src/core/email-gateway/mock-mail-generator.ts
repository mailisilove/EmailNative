/**
 * Mock Email Generator
 * 用于开箱即用体验、展示与自动化测试的多场景真实邮件模板库
 */
import { EmailMessage, EmailCategory } from '../types';

export const INITIAL_MOCK_EMAILS: EmailMessage[] = [
  {
    id: 'mail_sd_001',
    domainId: 'dom_saas_demo',
    toAddress: 'support@saas-demo.com',
    fromAddress: 'alex.dev@partner-studio.com',
    fromName: 'Alex Turner',
    subject: '[SaaS Demo] API 并发速率与企业 Webhook 架构咨询',
    snippet: '您好！我们正在评估 SaaS Demo 平台的自动化流水线集成能力，请问企业版是否支持自定义 Webhook 重试与高吞吐队列？',
    bodyText: `SaaS Demo 技术团队好：

我们技术团队正在调研贵平台的 API 架构与自动化流程集成方案。
在测试批量事件处理时，有几个系统集成问题想向工程师请教：

1. 贵平台对外提供的 Webhook 事件推送，是否支持配置 HMAC 签名验证与自动指数退避重试？
2. 如果我们预计在活动日有每分钟数千次的突发并发请求，是否有专用的企业高吞吐通道？

期待技术支持专家答复，感谢！

Alex Turner
Engineering Lead @ Partner Studio`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    isRead: false,
    isStarred: true,
    isArchived: false,
    attachments: [],
    agentProcessed: true,
    agentInsight: {
      summary: 'Partner Studio 研发主管 Alex 咨询 SaaS Demo 平台的高并发 Webhook 签名安全机制与突发流量通道。',
      category: 'business',
      urgency: 'high',
      sentiment: 'neutral',
      actionItems: [
        { id: 'act_sd_1', title: '回复 Webhook HMAC 验签规范与企业并发配额文档', type: 'todo', completed: false }
      ],
      proposedReply: {
        subject: 'Re: [SaaS Demo] API 并发速率与企业 Webhook 架构咨询',
        body: `Alex 您好：

感谢您关注 SaaS Demo！针对您咨询的系统集成问题，回复如下：

1. Webhook 安全性：所有外部推送事件均包含 X-Signature-256 请求头，支持通过您的 API 密钥计算 HMAC-SHA256 验签；若目标服务暂时不可达，系统将自动执行最多 5 次指数退避重试。
2. 企业高吞吐：企业专线通道支持每分钟 10,000+ 次高并发事件派发，并提供专属静态出口 IP 白名单支持。

若需要申请企业沙箱环境，欢迎随时回复此邮件！

Best regards,
SaaS Demo Technical Support
Email: support@saas-demo.com
Web: https://saas-demo.com`,
        confidence: 0.96,
        reasoning: '基于 SaaS Demo 专属知识库：精准匹配 Webhook 安全验签规范与高并发企业方案。',
        autoSent: false,
      },
      tokensUsed: { prompt: 410, completion: 180, total: 590, costUsd: 0.0006 },
      processedAt: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
    },
    labels: ['Customer Support', 'API', 'SaaSDemo'],
  },
  {
    id: 'mail_cs_001',
    domainId: 'dom_cloud_stack',
    toAddress: 'support@cloud-stack.dev',
    fromAddress: 'kenji.sato@creative-tech.jp',
    fromName: 'Kenji Sato',
    subject: '[CloudStack] 无服务器微服务架构冷启动延迟咨询',
    snippet: 'Hello! We recently evaluated CloudStack serverless functions for our latency-sensitive API gateway. Could you share benchmarks on cold-start mitigation?',
    bodyText: `CloudStack Support Team:

Hello! We are evaluating CloudStack for our APAC edge API layer. The automated deployment pipeline is remarkably intuitive!

We have a performance architecture question:
What is the typical P99 cold-start latency for TypeScript Edge functions across Tokyo and Singapore nodes? Does CloudStack support warm worker pooling?

Looking forward to your technical response.

Best,
Kenji Sato
Tech Lead, Creative Tech Tokyo`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isRead: false,
    isStarred: false,
    isArchived: false,
    attachments: [],
    agentProcessed: true,
    agentInsight: {
      summary: '东京架构师 Kenji 咨询 CloudStack 边缘 Serverless 函数的 P99 冷启动时延与预热池支持。',
      category: 'business',
      urgency: 'medium',
      sentiment: 'positive',
      actionItems: [
        { id: 'act_cs_1', title: '回复 CloudStack 亚太边缘节点延迟指标与预热池配置说明', type: 'todo', completed: false }
      ],
      proposedReply: {
        subject: 'Re: [CloudStack] 无服务器微服务架构冷启动延迟咨询',
        body: `Hi Kenji,

Thank you for reaching out and evaluating CloudStack!

Regarding your performance question: Our V8 isolate-based Edge runtime maintains median cold-start times under 5ms across Tokyo (NRT) and Singapore (SIN) regions. 

Additionally, Enterprise plans support Warm Worker Pooling, which pre-warms instances to achieve zero-latency responses for mission-critical endpoints.

Feel free to reply if you'd like to test this on an APAC trial account!

Cheers,
CloudStack Dev Support
Email: support@cloud-stack.dev
Web: https://cloud-stack.dev`,
        confidence: 0.94,
        reasoning: '基于 CloudStack 专属知识库：准确解答 V8 Isolate 冷启动性能与预热池特性。',
        autoSent: false,
      },
      tokensUsed: { prompt: 380, completion: 150, total: 530, costUsd: 0.0005 },
      processedAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    },
    labels: ['Architecture', 'Performance', 'CloudStack'],
  },
  {
    id: 'mail_001',
    domainId: 'dom_1',
    toAddress: 'auth@tech-corp.org',
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

  const saasDemoTemplates: MockTemplate[] = [
    {
      from: 'alex.lead@devteam.io',
      fromName: 'Alex Turner',
      subject: '[SaaS Demo] 企业版高并发 API 配额咨询',
      body: '你好，我们近期计划接入 SaaS Demo 的云端服务，预计日均请求量在 50 万次以上，请问是否有企业级并发通道与 SLA 保障？',
      category: 'business',
      urgency: 'high',
    },
    {
      from: 'billing@cloud-gateway.com',
      fromName: 'Billing Service',
      subject: 'SaaS Demo Pro 订阅扣费通知（$29.00 USD）',
      body: '您的 SaaS Demo Pro 月度计划已成功扣费 $29.00 USD。电子收据已归档入库。',
      category: 'transactional',
      urgency: 'low',
    }
  ];

  const cloudStackTemplates: MockTemplate[] = [
    {
      from: 'sarah.cloud@fintech.io',
      fromName: 'Sarah Jenkins',
      subject: '[CloudStack] 亚太边缘节点低延迟评测反馈',
      body: 'Hi CloudStack team! We tested the Edge function routing across Tokyo and Singapore. Cold-start times are very impressive! Do you provide Terraform providers?',
      category: 'business',
      urgency: 'medium',
    }
  ];

  let pool: MockTemplate[] = genericTemplates;
  if (domain.includes('saas-demo') || domain.includes('demo')) {
    pool = saasDemoTemplates;
  } else if (domain.includes('cloud-stack')) {
    pool = cloudStackTemplates;
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
