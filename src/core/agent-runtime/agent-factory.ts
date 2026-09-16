/**
 * Agent Factory & Session Manager
 * 借鉴 fastclaw 的轻量化 Agent 工厂模式：多角色 Agent 动态实例化与会话生命周期隔离
 */
import { EmailMessage, LLMConfig } from '../types';

export interface SpecializedAgent {
  name: string;
  role: 'guard' | 'extractor' | 'drafter' | 'action_runner';
  systemPrompt: string;
  temperature: number;
}

export class AgentFactory {
  static createGuardAgent(): SpecializedAgent {
    return {
      name: 'SecurityGuardAgent',
      role: 'guard',
      temperature: 0.1,
      systemPrompt: `你是一个专业的企业邮件安全与垃圾研判智能体。
任务：分析邮件来源与正文，快速判断是否属于垃圾邮件、钓鱼攻击或合法邮件。`,
    };
  }

  static createExtractorAgent(): SpecializedAgent {
    return {
      name: 'EntityExtractorAgent',
      role: 'extractor',
      temperature: 0.2,
      systemPrompt: `你是一个结构化信息抽取智能体。
任务：从邮件中提取时效性验证码（2FA/Code）、财务金额与发票、待办事项、会议邀约等核心实体。`,
    };
  }

  static createDrafterAgent(persona?: string): SpecializedAgent {
    return {
      name: 'SmartDrafterAgent',
      role: 'drafter',
      temperature: 0.5,
      systemPrompt: `你是一个专业的邮件智能拟复秘书。${persona ? `你的背景设定：${persona}` : ''}
任务：根据来信意图，以专业、诚恳、得体的商务口吻撰写回复草稿，并给出拟复理由与置信度评估。`,
    };
  }
}

export class SessionManager {
  private activeSessions = new Map<string, { emailId: string; logs: string[]; startedAt: number }>();

  startSession(emailId: string): string {
    const sessionId = `sess_${emailId}_${Date.now()}`;
    this.activeSessions.set(sessionId, {
      emailId,
      logs: [],
      startedAt: Date.now(),
    });
    return sessionId;
  }

  appendLog(sessionId: string, message: string): void {
    const s = this.activeSessions.get(sessionId);
    if (s) {
      s.logs.push(`[${new Date().toLocaleTimeString()}] ${message}`);
    }
  }

  getSessionLogs(sessionId: string): string[] {
    return this.activeSessions.get(sessionId)?.logs || [];
  }

  finishSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
  }
}
