import React, { useState } from 'react';
import { 
  Star, 
  Archive, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  CreditCard, 
  Edit3, 
  FileText,
  ChevronLeft,
  Square,
  ShieldCheck
} from 'lucide-react';
import { EmailMessage } from '../../core/types';
import { VerificationCodeCard } from './VerificationCodeCard';
import { DeepSeekReasoningBox } from './DeepSeekReasoningBox';
import { useI18n } from '../../core/i18n/I18nContext';

interface EmailDetailProps {
  email: EmailMessage | null;
  onSendReply: (toAddress: string, subject: string, bodyText: string, fromAddress?: string, fromName?: string) => Promise<{ success: boolean; error?: string }>;
  onToggleStar: (id: string) => void;
  onArchive: (id: string) => void;
  onRunAgent: (email: EmailMessage) => void;
  onOpenSettings?: () => void;
  onBack?: () => void;
  isAgentRunning?: boolean;
  onStopAgent?: () => void;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({
  email,
  onSendReply,
  onToggleStar,
  onArchive,
  onRunAgent,
  onOpenSettings,
  onBack,
  isAgentRunning = false,
  onStopAgent,
}) => {
  const { t } = useI18n();
  const [replyText, setReplyText] = useState('');
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  if (!email) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-dim)',
        background: 'var(--bg-surface)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px'
        }}>
          <Sparkles size={24} color="#6366f1" />
        </div>
        <p style={{ fontSize: '14px', fontWeight: 500 }}>{t('emailDetail.emptyPrompt')}</p>
      </div>
    );
  }

  const insight = email.agentInsight;
  const proposedReply = insight?.proposedReply;

  const handleApproveDraft = async () => {
    if (!proposedReply) return;
    setIsSending(true);
    setReplyError(null);
    const textToSend = isEditingDraft ? replyText : proposedReply.body;
    const res = await onSendReply(
      email.fromAddress, 
      proposedReply.subject, 
      textToSend,
      email.toAddress // 锁定出站发件人地址，杜绝跨域名串号
    );
    setIsSending(false);
    if (res.success) {
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 3000);
    } else {
      setReplyError(res.error || t('emailDetail.sendFailed'));
    }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-surface)',
      overflowY: 'auto'
    }}>
      {/* 顶部工具栏 */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15, 22, 41, 0.65)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.06)'
              }}
              title={t('common.back')}
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <button
            onClick={() => onToggleStar(email.id)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              color: email.isStarred ? '#f59e0b' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.04)'
            }}
            title={email.isStarred ? t('emailList.unmarkStar') : t('emailList.markStar')}
          >
            <Star size={15} fill={email.isStarred ? '#f59e0b' : 'none'} />
          </button>

          <button
            onClick={() => onArchive(email.id)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.04)'
            }}
            title={t('emailDetail.archive')}
          >
            <Archive size={15} />
          </button>
        </div>

        {isAgentRunning ? (
          <button
            onClick={() => onStopAgent ? onStopAgent() : onRunAgent(email)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#fca5a5',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.25)',
            }}
            className="animate-pulse"
            title={t('emailDetail.stopAgent')}
          >
            <Square size={12} fill="#f87171" color="#f87171" />
            <span>{t('emailDetail.stopAgent')}</span>
          </button>
        ) : (
          <button
            onClick={() => onRunAgent(email)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#c7d2fe',
              fontSize: '11px',
              fontWeight: 500
            }}
          >
            <Sparkles size={12} color="#a78bfa" />
            <span>{t('emailList.runAgent')}</span>
          </button>
        )}
      </div>

      {/* 邮件正文区域 */}
      <div style={{ padding: '16px 20px', flex: 1 }}>
        {/* 正在研判中横幅 - 提供随时终止提示 */}
        {isAgentRunning && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            marginBottom: '16px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#fca5a5',
            fontSize: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} className="animate-spin-slow" color="#f87171" />
              <span>{t('emailDetail.analyzingNotice')}</span>
            </div>
            <button
              onClick={onStopAgent}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.3)',
                border: '1px solid rgba(239, 68, 68, 0.6)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              <Square size={10} fill="#fff" />
              <span>{t('emailDetail.stopAgent')}</span>
            </button>
          </div>
        )}

        {/* 若此邮件此前被用户手动终止过，展示安全保护提示 */}
        {insight?.isStopped && !isAgentRunning && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            borderRadius: '8px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#fde68a',
            fontSize: '12px',
          }}>
            <ShieldCheck size={15} color="#f59e0b" />
            <span>{t('emailDetail.stoppedNotice')}</span>
          </div>
        )}

        {/* 验证码高光卡片 (如果存在) */}
        {insight?.verificationCode && (
          <VerificationCodeCard info={insight.verificationCode} />
        )}

        {/* 邮件基本头信息 */}
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            color: '#ffffff',
            lineHeight: 1.3,
            marginBottom: '10px'
          }}>
            {email.subject}
          </h1>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                color: '#fff'
              }}>
                {(email.fromName || email.fromAddress)[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                  {email.fromName || email.fromAddress}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{email.fromAddress}</span>
                  <span>→</span>
                  <span style={{ 
                    fontFamily: 'var(--font-mono)', 
                    color: '#818cf8',
                  }}>
                    {email.toAddress}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              {new Date(email.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* DeepSeek 思考过程 (默认折叠极简) */}
        {insight?.deepseekReasoning && (
          <DeepSeekReasoningBox reasoning={insight.deepseekReasoning} />
        )}

        {/* AI 提炼看板：纯净无噪音 */}
        {insight && (
          <div style={{
            background: 'rgba(18, 26, 48, 0.5)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#c4b5fd', marginBottom: '8px' }}>
              <Sparkles size={12} color="#a78bfa" />
              <span>AI 提炼</span>
            </div>

            <div style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.5 }}>
              {insight.summary}
            </div>

            {/* 待办/日程清单 */}
            {insight.actionItems.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                {insight.actionItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      color: '#f8fafc'
                    }}
                  >
                    {item.type === 'payment' && <CreditCard size={12} color="#10b981" />}
                    {item.type === 'calendar' && <Calendar size={12} color="#38bdf8" />}
                    {item.type === 'todo' && <CheckCircle2 size={12} color="#f59e0b" />}
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 邮件正文呈现 */}
        <div style={{
          fontSize: '14px',
          lineHeight: 1.7,
          color: '#cbd5e1',
          whiteSpace: 'pre-wrap',
          background: 'rgba(0, 0, 0, 0.15)',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '24px'
        }}>
          {email.bodyText}
        </div>

        {/* 附件展示 */}
        {email.attachments.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
              附件 ({email.attachments.length})
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {email.attachments.map(att => (
                <div
                  key={att.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                >
                  <FileText size={16} color="#818cf8" />
                  <span>{att.name}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>
                    ({(att.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 建议回复草案 */}
        {proposedReply && (
          <div style={{
            background: 'rgba(99, 102, 241, 0.06)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="#818cf8" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{t('emailDetail.reply')}</span>
              </div>

              <button
                onClick={() => {
                  setIsEditingDraft(!isEditingDraft);
                  if (!isEditingDraft) setReplyText(proposedReply.body);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: '#a5b4fc',
                  padding: '3px 6px'
                }}
              >
                <Edit3 size={11} />
                <span>{isEditingDraft ? t('common.cancel') : t('common.edit')}</span>
              </button>
            </div>

            {isEditingDraft ? (
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  color: '#fff',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  marginBottom: '10px'
                }}
              />
            ) : (
              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                fontSize: '13px',
                lineHeight: 1.5,
                color: '#e2e8f0',
                whiteSpace: 'pre-wrap',
                marginBottom: '10px'
              }}>
                {proposedReply.body}
              </div>
            )}

            {replyError && (
              <div style={{
                marginBottom: '10px',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fca5a5', fontSize: '11px' }}>
                  <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                  <span>{replyError}</span>
                </div>
                {onOpenSettings && (
                  <button
                    onClick={onOpenSettings}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: 'rgba(99, 102, 241, 0.25)',
                      color: '#c7d2fe',
                      fontSize: '10px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {t('common.status')}
                  </button>
                )}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              {sentSuccess ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '12px', fontWeight: 600 }}>
                  <CheckCircle2 size={14} /> {t('common.saved')}
                </div>
              ) : (
                <button
                  onClick={handleApproveDraft}
                  disabled={isSending}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 16px',
                    borderRadius: '7px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '12px',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <Send size={12} />
                  <span>{isSending ? t('emailDetail.sending') : t('emailDetail.approveAndSend')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
