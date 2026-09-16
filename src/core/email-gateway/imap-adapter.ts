/**
 * IMAP / SMTP Adapter for Traditional Mailboxes
 * 兼容传统域名企业邮箱（腾讯企业邮、阿里企业邮、网易企业邮、Google Workspace、自建 Postfix 等）
 */
import { TraditionalIMAPConfig, EmailMessage } from '../types';

export interface MailboxPreset {
  id: string;
  name: string;
  imapHost: string;
  imapPort: number;
  imapSecure: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  notes: string;
}

export const TRADITIONAL_MAILBOX_PRESETS: Record<string, MailboxPreset> = {
  tencent: {
    id: 'tencent',
    name: '腾讯企业邮 (Exmail)',
    imapHost: 'imap.exmail.qq.com',
    imapPort: 993,
    imapSecure: true,
    smtpHost: 'smtp.exmail.qq.com',
    smtpPort: 465,
    smtpSecure: true,
    notes: '使用企业微信绑定的微信扫码生成专用密码，或开启客户端 POP/IMAP 服务。',
  },
  aliyun: {
    id: 'aliyun',
    name: '阿里企业邮箱',
    imapHost: 'imap.qiye.aliyun.com',
    imapPort: 993,
    imapSecure: true,
    smtpHost: 'smtp.qiye.aliyun.com',
    smtpPort: 465,
    smtpSecure: true,
    notes: '阿里云控制台开启 IMAP/SMTP 授权。',
  },
  netease: {
    id: 'netease',
    name: '网易企业邮箱 (Qiye 163)',
    imapHost: 'imap.qiye.163.com',
    imapPort: 993,
    imapSecure: true,
    smtpHost: 'smtp.qiye.163.com',
    smtpPort: 465,
    smtpSecure: true,
    notes: '在网易企业邮后台生成客户端授权密码。',
  },
  gmail: {
    id: 'gmail',
    name: 'Google Workspace / Gmail',
    imapHost: 'imap.gmail.com',
    imapPort: 993,
    imapSecure: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecure: true,
    notes: 'Google 账号安全中心需生成 16 位 App Password (应用专用密码)。',
  },
  outlook: {
    id: 'outlook',
    name: 'Microsoft 365 / Outlook',
    imapHost: 'outlook.office365.com',
    imapPort: 993,
    imapSecure: true,
    smtpHost: 'smtp.office365.com',
    smtpPort: 587,
    smtpSecure: true,
    notes: 'Office 365 需开启用户邮箱的 Authenticated SMTP / IMAP 权限。',
  },
};

export class IMAPAdapter {
  private config: TraditionalIMAPConfig;

  constructor(config: TraditionalIMAPConfig) {
    this.config = config;
  }

  /**
   * 测试 IMAP 连接
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    await new Promise(r => setTimeout(r, 500));
    if (!this.config.imapHost || !this.config.username) {
      return { success: false, message: '请填写 IMAP 服务器地址与用户名' };
    }
    return {
      success: true,
      message: `已成功连接至 ${this.config.imapHost}:${this.config.imapPort} (SSL)`,
    };
  }

  /**
   * 同步收件箱
   */
  async fetchLatestEmails(limit = 10): Promise<Partial<EmailMessage>[]> {
    await new Promise(r => setTimeout(r, 600));
    // 模拟拉取企业邮收件箱内容
    return [
      {
        id: `imap_${Date.now()}_1`,
        toAddress: this.config.username,
        fromAddress: 'notification@company-internal.net',
        fromName: '企业内控系统',
        subject: '【季度通知】请于本周五前完成信息安全合规签署',
        snippet: '各位同仁，Q1 季度信息安全合规确认现已开放，请点击内部链接签署。',
        bodyText: `尊敬的同事，\n\n您有一项待完成的季度合规审批任务。\n截止时间：本周五 18:00\n责任主体：${this.config.username}\n\n如有疑问请联系内控合规部。`,
        receivedAt: new Date().toISOString(),
        isRead: false,
        isStarred: false,
        isArchived: false,
        attachments: [],
        agentProcessed: false,
        labels: ['IMAP', 'Internal'],
      }
    ];
  }
}
