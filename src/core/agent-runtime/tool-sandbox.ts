/**
 * Agent Tool Sandbox
 * 借鉴 fastclaw 的工具沙箱系统：提供受控、无副作用/隔离的动作执行环境
 */
import { ExtractedActionItem, VerificationCodeInfo } from '../types';

export interface ToolExecutionResult {
  toolName: string;
  success: boolean;
  output: any;
  error?: string;
  executionTimeMs: number;
}

export class ToolSandbox {
  /**
   * 工具 1：提取并标准化安全验证码
   */
  static extractVerificationCode(text: string, fromAddress: string): VerificationCodeInfo | null {
    const codeMatch = text.match(/(?:code|验证码|token|PIN)[^\d\n\r]{0,20}[:：\s]?([A-Za-z0-9]{4,8})\b/i)
      || text.match(/\b([0-9]{4,8})\b(?=.*(?:verify|expire|有效))/i);
    
    if (!codeMatch) return null;

    let service = fromAddress.replace(/^.*@/, '').replace(/\..+$/, '');
    if (/github/i.test(text) || /github/i.test(fromAddress)) service = 'GitHub';
    else if (/stripe/i.test(text) || /stripe/i.test(fromAddress)) service = 'Stripe';
    else if (/google/i.test(text) || /google/i.test(fromAddress)) service = 'Google';
    else if (/aws|amazon/i.test(text)) service = 'AWS';

    const expireMatch = text.match(/(\d+)\s*(?:minutes?|mins?|分钟)/i);
    const expire = expireMatch ? parseInt(expireMatch[1], 10) : 10;

    return {
      code: codeMatch[1].trim(),
      serviceName: service.toUpperCase(),
      expiresInMinutes: expire,
      extractedAt: new Date().toISOString(),
    };
  }

  /**
   * 工具 2：抽取待办、日程与账单动作项
   */
  static extractActionItems(text: string, subject: string): ExtractedActionItem[] {
    const items: ExtractedActionItem[] = [];

    // 账单/支付检测
    const amountMatch = text.match(/(\$\s*\d+(?:\.\d{2})?|\b\d+(?:\.\d{2})?\s*(?:USD|RMB|EUR|CNY))/i);
    if (/invoice|bill|receipt|payment|账单|发票|付款/i.test(subject + ' ' + text) && amountMatch) {
      items.push({
        id: `act_${Date.now()}_bill`,
        title: `处理 ${amountMatch[1]} 费用对账与发票入账`,
        type: 'payment',
        amount: amountMatch[1],
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        completed: false,
      });
    }

    // 会议/日程检测
    if (/sync|call|meeting|schedule|开会|预约|zoom|google meet/i.test(subject + ' ' + text)) {
      items.push({
        id: `act_${Date.now()}_cal`,
        title: `安排会议: ${subject.replace(/^re:\s*/i, '').slice(0, 30)}`,
        type: 'calendar',
        dueDate: '近几天建议时隙',
        completed: false,
      });
    }

    return items;
  }

  /**
   * 工具 3：向桌面发出系统通知 (带降级策略)
   */
  static async sendDesktopNotification(title: string, body: string): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/mail-icon.svg' });
          return true;
        } else if (Notification.permission !== 'denied') {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            new Notification(title, { body });
            return true;
          }
        }
      }
    } catch {
      // ignore
    }
    return false;
  }

  /**
   * 工具 4：触发外部 Webhook 转发 (飞书/企微/Telegram/Slack)
   */
  static async triggerWebhook(webhookUrl: string, payload: any): Promise<boolean> {
    if (!webhookUrl) return false;
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
