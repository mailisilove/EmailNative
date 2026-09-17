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
  CheckSquare,
  ShieldCheck
} from 'lucide-react';
import { EmailMessage } from '../../core/types';
import { VerificationCodeCard } from './VerificationCodeCard';
import { DeepSeekReasoningBox } from './DeepSeekReasoningBox';
import { useI18n } from '../../core/i18n/I18nContext';
import { MimeParser } from '../../core/email-gateway/mime-parser';

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

  // 严格清洗邮件头部、发件人和正文（彻底剥离所有网络头与 Base64 乱码）
  const cleanSubject = MimeParser.decodeWords(email.subject || t('emailDetail.noSubject'));
  const cleanFromName = MimeParser.decodeWords(email.fromName || (email.fromAddress ? email.fromAddress.split('@')[0] : t('emailDetail.senderLabel')));
  const parsedBody = MimeParser.parseBody(email.bodyText || '');
  const cleanBodyText = parsedBody.plainText;

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
        background: 'var(--bg-surface)',
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
                color: 'var(--text-white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.04)'
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
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#fca5a5',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.25)',
            }}
            className="animate-pulse"
            title={t('emailDetail.stopAnalysisTooltip')}
          >
            <Square size={12} fill="#f87171" color="#f87171" />
            <span>{t('emailDetail.stopAnalysis')}</span>
          </button>
        ) : (
          <button
            onClick={() => onRunAgent(email)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.3) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.45)',
              color: '#e0e7ff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(168, 85, 247, 0.15)',
              transition: 'all 0.2s ease'
            }}
            title={t('emailDetail.aiAnalyzeTooltip')}
          >
            <Sparkles size={13} color="#c084fc" />
            <span>{insight ? t('emailDetail.reanalyzeBtn') : t('emailDetail.aiAnalyzeBtn')}</span>
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
            color: 'var(--text-white)',
            lineHeight: 1.3,
            marginBottom: '10px'
          }}>
            {cleanSubject}
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
                {(cleanFromName || email.fromAddress)[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-white)' }}>
                  {cleanFromName}
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
              {new Date(email.receivedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
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
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="#818cf8" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-white)' }}>{t('emailDetail.aiExtractHeader')}</span>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: insight.actionItems && insight.actionItems.length > 0 ? '12px' : 0 }}>
              {insight.summary}
            </div>

            {/* 待办/日程清单 */}
            {insight.actionItems && insight.actionItems.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', color: '#818cf8', fontWeight: 600, marginBottom: '6px' }}>
                  {t('emailDetail.actionSummary')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {insight.actionItems.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: 'var(--text-main)',
                        background: 'var(--bg-surface)',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <CheckSquare size={13} color="#818cf8" />
                      <span>{item.title}</span>
                      {item.dueDate && (
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                          {item.dueDate}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 邮件纯净正文呈现 */}
        <div style={{
          fontSize: '14px',
          lineHeight: 1.65,
          color: 'var(--text-main)',
          whiteSpace: 'pre-wrap',
          marginBottom: '24px',
          wordBreak: 'break-word',
          fontFamily: 'inherit'
        }}>
          {cleanBodyText}
        </div>

        {/* 若未进行过 AI 分析，提供按需分析卡片引导 */}
        {!insight && !isAgentRunning && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.05)',
            border: '1px dashed rgba(99, 102, 241, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#c7d2fe' }}>
              <Sparkles size={14} color="#818cf8" style={{ flexShrink: 0 }} />
              <span>{t('emailDetail.aiExtractPrompt')}</span>
            </div>
            <button
              onClick={() => onRunAgent(email)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                border: 'none',
                color: '#fff',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {t('emailDetail.aiAnalyzeSmallBtn')}
            </button>
          </div>
        )}

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
                    color: 'var(--text-white)'
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
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-white)' }}>{t('emailDetail.reply')}</span>
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
                  background: 'var(--bg-surface)',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  marginBottom: '10px'
                }}
              />
            ) : (
              <div style={{
                background: 'var(--bg-surface)',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                fontSize: '13px',
                lineHeight: 1.5,
                color: 'var(--text-main)',
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
