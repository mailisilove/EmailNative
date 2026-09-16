/**
 * Cindy Protocol & Human-in-the-loop Approval
 * 借鉴 makecindy/cindy-protocol：定义 Agent 提案、审批确认与执行的统一 RPC 事件
 */
import { EmailMessage, ExtractedActionItem } from '../types';

export type CindyEventType = 
  | 'AGENT_PROPOSED_REPLY'
  | 'AGENT_EXTRACTED_ACTION'
  | 'USER_APPROVED_REPLY'
  | 'USER_REJECTED_REPLY'
  | 'USER_MODIFIED_REPLY'
  | 'ACTION_EXECUTED';

export interface CindyProposal {
  proposalId: string;
  emailId: string;
  type: 'draft_reply' | 'forward_webhook' | 'create_todo';
  confidence: number;
  reasoning: string;
  data: {
    to: string;
    subject: string;
    body: string;
    actionItem?: ExtractedActionItem;
  };
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  createdAt: string;
}

export class CindyProtocol {
  private static listeners: Array<(event: CindyEventType, payload: any) => void> = [];

  static subscribe(listener: (event: CindyEventType, payload: any) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static emit(event: CindyEventType, payload: any) {
    this.listeners.forEach(fn => {
      try {
        fn(event, payload);
      } catch (err) {
        console.error('Cindy listener error:', err);
      }
    });
  }

  /**
   * 生成回复提案
   */
  static createReplyProposal(email: EmailMessage): CindyProposal | null {
    if (!email.agentInsight?.proposedReply) return null;

    const reply = email.agentInsight.proposedReply;
    return {
      proposalId: `prop_${Date.now()}`,
      emailId: email.id,
      type: 'draft_reply',
      confidence: reply.confidence,
      reasoning: reply.reasoning,
      data: {
        to: email.fromAddress,
        subject: reply.subject,
        body: reply.body,
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }
}
