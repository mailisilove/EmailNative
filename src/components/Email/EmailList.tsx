import React from 'react';
import { 
  Star, 
  Sparkles, 
  Paperclip, 
  ShieldCheck, 
  Receipt, 
  Briefcase, 
  AlertTriangle,
  MailCheck,
  Tag
} from 'lucide-react';
import { EmailCategory, EmailMessage } from '../../core/types';

interface EmailListProps {
  emails: EmailMessage[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  onRunAgentForEmail: (email: EmailMessage, e: React.MouseEvent) => void;
  currentInboxTitle?: string;
  isMobile?: boolean;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  onToggleStar,
  onRunAgentForEmail,
  currentInboxTitle = '所有域名聚合收件箱',
  isMobile = false,
}) => {
  const getCategoryBadge = (category?: EmailCategory) => {
    switch (category) {
      case 'verification':
        return { label: '验证码', bg: 'rgba(99, 102, 241, 0.18)', text: '#a5b4fc', border: 'rgba(99, 102, 241, 0.3)', icon: ShieldCheck };
      case 'transactional':
        return { label: '账单', bg: 'rgba(16, 185, 129, 0.15)', text: '#6ee7b7', border: 'rgba(16, 185, 129, 0.3)', icon: Receipt };
      case 'business':
        return { label: '重要', bg: 'rgba(139, 92, 246, 0.18)', text: '#c4b5fd', border: 'rgba(139, 92, 246, 0.35)', icon: Briefcase };
      case 'spam':
        return { label: '垃圾', bg: 'rgba(244, 63, 94, 0.15)', text: '#fda4af', border: 'rgba(244, 63, 94, 0.3)', icon: AlertTriangle };
      default:
        return null; // 通用邮件无需添加多余标签干扰视觉
    }
  };

  const getProductBadge = (toAddress: string) => {
    if (toAddress.includes('cutready')) {
      return { name: 'CutReady', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' };
    }
    if (toAddress.includes('image-layered')) {
      return { name: 'ImageLayered', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.12)', border: 'rgba(192, 132, 252, 0.3)' };
    }
    return { name: toAddress.split('@')[1] || 'Domain', color: '#94a3b8', bg: 'rgba(255, 255, 255, 0.06)', border: 'rgba(255, 255, 255, 0.12)' };
  };

  if (emails.length === 0) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-dim)',
        padding: '40px'
      }}>
        <MailCheck size={40} strokeWidth={1.2} style={{ marginBottom: '12px', opacity: 0.4 }} />
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-dim)' }}>暂无邮件</div>
      </div>
    );
  }

  return (
    <div style={{
      width: isMobile ? '100%' : '380px',
      borderRight: isMobile ? 'none' : '1px solid var(--border-subtle)',
      overflowY: 'auto',
      background: 'var(--bg-main)',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* 仅在桌面端显示的收件箱上下文标识条 */}
      {!isMobile && (
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--text-dim)',
          position: 'sticky',
          top: 0,
          zIndex: 5,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-muted)' }}>
            <span style={{ color: '#818cf8' }}>●</span>
            <span>{currentInboxTitle}</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{emails.length} 封</span>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
      {emails.map((email) => {
        const isSelected = selectedEmailId === email.id;
        const badge = getCategoryBadge(email.agentInsight?.category);
        const prod = getProductBadge(email.toAddress);
        const BadgeIcon = badge?.icon;
        const timeStr = new Date(email.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
          <div
            key={email.id}
            onClick={() => onSelectEmail(email.id)}
            style={{
              padding: isMobile ? '14px 18px' : '12px 16px',
              borderBottom: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              background: isSelected ? 'rgba(99, 102, 241, 0.12)' : (email.isRead ? 'transparent' : 'rgba(255, 255, 255, 0.02)'),
              borderLeft: isSelected ? '3px solid var(--accent-primary)' : '3px solid transparent',
              transition: 'background 0.12s ease',
            }}
          >
            {/* 第一行：发件人、产品标识、时间与星标 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                {!email.isRead && (
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    boxShadow: '0 0 8px var(--accent-primary)',
                    flexShrink: 0
                  }} />
                )}
                <span style={{
                  fontSize: isMobile ? '15px' : '13px',
                  fontWeight: email.isRead ? 500 : 700,
                  color: email.isRead ? 'var(--text-muted)' : '#ffffff',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}>
                  {email.fromName || email.fromAddress}
                </span>

                {/* 产品线胶囊徽标：无 redundant to: 前缀 */}
                <span style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: prod.color,
                  background: prod.bg,
                  border: `1px solid ${prod.border}`,
                  padding: '1px 5px',
                  borderRadius: '4px',
                  flexShrink: 0
                }}>
                  {prod.name}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{timeStr}</span>
                <button
                  onClick={(e) => onToggleStar(email.id, e)}
                  style={{ color: email.isStarred ? '#f59e0b' : 'var(--text-dim)', padding: '2px' }}
                >
                  <Star size={13} fill={email.isStarred ? '#f59e0b' : 'none'} />
                </button>
              </div>
            </div>

            {/* 第二行：主题 */}
            <div style={{
              fontSize: isMobile ? '14px' : '13px',
              fontWeight: email.isRead ? 400 : 600,
              color: 'var(--text-main)',
              marginBottom: '4px',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden'
            }}>
              {email.subject}
            </div>

            {/* 第三行：摘要 */}
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
              marginBottom: '8px',
              display: '-webkit-box',
              WebkitLineClamp: isMobile ? 1 : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {email.agentInsight?.summary || email.snippet}
            </div>

            {/* 底部徽章栏 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {/* 分类标签 */}
                {badge && BadgeIcon && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '999px',
                    background: badge.bg,
                    color: badge.text,
                    border: `1px solid ${badge.border}`,
                    fontWeight: 600
                  }}>
                    <BadgeIcon size={10} />
                    {badge.label}
                  </span>
                )}

                {/* 验证码预览 */}
                {email.agentInsight?.verificationCode && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: 'rgba(99, 102, 241, 0.25)',
                    color: '#c7d2fe',
                    border: '1px solid rgba(99, 102, 241, 0.4)'
                  }}>
                    {email.agentInsight.verificationCode.code}
                  </span>
                )}

                {email.attachments.length > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '10px', color: 'var(--text-dim)' }}>
                    <Paperclip size={11} /> {email.attachments.length}
                  </span>
                )}
              </div>

              {/* 仅在未处理时显示极轻量 Agent 图标 */}
              {!email.agentProcessed && (
                <button
                  onClick={(e) => onRunAgentForEmail(email, e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '3px 6px',
                    borderRadius: '4px',
                    color: '#c4b5fd',
                    background: 'rgba(139, 92, 246, 0.15)',
                  }}
                  title="Agent 分析"
                >
                  <Sparkles size={11} />
                </button>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};
