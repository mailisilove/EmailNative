import React, { useState } from 'react';
import { X, Send, Sparkles, AlertCircle } from 'lucide-react';
import { ManagedDomain } from '../../core/types';

interface SenderOption {
  address: string;
  label: string;
  displayName: string;
  signature?: string;
}

interface EmailComposerProps {
  domains: ManagedDomain[];
  isOpen: boolean;
  onClose: () => void;
  onSend: (from: string, to: string, subject: string, body: string, fromName?: string) => Promise<{ success: boolean; error?: string }>;
  onOpenSettings?: () => void;
  defaultSenderAddress?: string;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({
  domains,
  isOpen,
  onClose,
  onSend,
  onOpenSettings,
  defaultSenderAddress,
}) => {
  // 整理所有可选的发信身份（含显示名与签名）
  const senderOptions: SenderOption[] = [];
  domains.forEach(d => {
    d.aliases.forEach(a => {
      const disp = a.displayName || d.displayName || `${a.prefix} @ ${d.domain}`;
      senderOptions.push({
        address: a.fullAddress,
        label: `${disp} <${a.fullAddress}>`,
        displayName: disp,
        signature: a.signature || d.signature,
      });
    });
    const defaultContact = `contact@${d.domain}`;
    if (!senderOptions.some(s => s.address === defaultContact)) {
      const disp = d.displayName || d.domain;
      senderOptions.push({
        address: defaultContact,
        label: `${disp} <${defaultContact}>`,
        displayName: disp,
        signature: d.signature,
      });
    }
  });

  // 默认发件人优先使用当前选中的收件箱地址
  const initialOption = senderOptions.find(s => s.address === defaultSenderAddress) || senderOptions[0];

  const [selectedSender, setSelectedSender] = useState<SenderOption>(
    initialOption || { address: 'support@cutready.app', label: 'support@cutready.app', displayName: 'Support' }
  );
  const [toAddress, setToAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState(() => {
    return initialOption?.signature ? `\n\n${initialOption.signature}` : '';
  });
  const [isAiPolishing, setIsAiPolishing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSenderChange = (address: string) => {
    const found = senderOptions.find(s => s.address === address);
    if (!found) return;
    setSelectedSender(found);
    if (!body || body.trim() === '' || senderOptions.some(s => s.signature && body.includes(s.signature))) {
      // 自动替换/填充新域名的签名
      setBody(found.signature ? `\n\n${found.signature}` : '');
    }
  };

  const handleAiPolish = async () => {
    if (!body && !subject) return;
    setIsAiPolishing(true);
    await new Promise(r => setTimeout(r, 600));
    setBody(prev => {
      const sign = selectedSender.signature || `\n\nBest regards,\n${selectedSender.displayName}`;
      const cleanPrev = prev.replace(sign, '').trim();
      return `您好！\n\n关于 ${subject || '相关事宜'}：\n${cleanPrev || '希望与您沟通并探讨进一步合作细节。'}\n\n期待您的回复，祝一切顺利！\n\n${sign}`;
    });
    setIsAiPolishing(false);
  };

  const handleSend = async () => {
    if (!toAddress) {
      setErrorMsg('请填写收件人邮箱');
      return;
    }
    if (!subject) {
      setErrorMsg('请填写邮件主题');
      return;
    }
    setErrorMsg('');
    setIsSending(true);
    const res = await onSend(selectedSender.address, toAddress, subject, body, selectedSender.displayName);
    setIsSending(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || '发送失败，请检查发信提供商配置');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    }}>
      <div style={{
        width: '640px',
        maxHeight: '90vh',
        background: '#0f172a',
        border: '1px solid var(--border-highlight)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-glass)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* 标题栏 */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
            撰写出站邮件
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-dim)' }}>
            <X size={18} />
          </button>
        </div>

        {/* 表单内容 */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
          {errorMsg && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              color: '#fda4af',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 发信地址选择 */}
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              发件域名邮箱 (FROM)
            </label>
            <select
              value={selectedSender.address}
              onChange={(e) => handleSenderChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                color: '#818cf8',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px'
              }}
            >
              {domains.map(d => {
                const isCf = d.provider === 'cloudflare';
                const domainTitle = d.displayName ? `${d.displayName} (${d.domain})` : d.domain;
                return (
                  <optgroup 
                    key={d.id} 
                    label={`🌐 ${domainTitle} [${isCf ? 'Cloudflare' : 'IMAP'}]`}
                    style={{ background: '#090d16', color: '#94a3b8', fontWeight: 600 }}
                  >
                    {d.aliases.map(a => {
                      const labelText = a.displayName ? `${a.displayName} <${a.fullAddress}>` : a.fullAddress;
                      return (
                        <option key={a.id} value={a.fullAddress} style={{ background: '#0f172a', color: '#fff', fontWeight: 400 }}>
                          {labelText} {a.description ? `— ${a.description}` : ''}
                        </option>
                      );
                    })}
                    {!d.aliases.some(a => a.prefix === 'contact') && (
                      <option value={`contact@${d.domain}`} style={{ background: '#0f172a', color: '#fff', fontWeight: 400 }}>
                        {d.displayName || 'Official'} &lt;contact@{d.domain}&gt;
                      </option>
                    )}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {/* 收件地址 */}
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              收件人 (TO)
            </label>
            <input
              type="email"
              placeholder="recipient@example.com"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '13px'
              }}
            />
          </div>

          {/* 主题 */}
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              邮件主题
            </label>
            <input
              type="text"
              placeholder="邮件主题..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '13px'
              }}
            />
          </div>

          {/* 正文 */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
                邮件正文
              </label>
              <button
                type="button"
                onClick={handleAiPolish}
                disabled={isAiPolishing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: '#a78bfa',
                  background: 'rgba(139, 92, 246, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}
              >
                <Sparkles size={12} />
                <span>{isAiPolishing ? 'AI 扩写中...' : 'Agent 扩写润色'}</span>
              </button>
            </div>
            <textarea
              rows={8}
              placeholder="输入正文，或简写要点后点击右上角 Agent 扩写润色..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '13px',
                lineHeight: 1.6,
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* 底部按钮栏 */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {errorMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#fca5a5',
                fontSize: '12px',
                background: 'rgba(239, 68, 68, 0.12)',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(239, 68, 68, 0.25)',
              }}>
                <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {errorMsg}
                </span>
                {onOpenSettings && (
                  <button
                    onClick={onOpenSettings}
                    style={{
                      color: '#a5b4fc',
                      textDecoration: 'underline',
                      fontSize: '11px',
                      flexShrink: 0,
                      fontWeight: 600,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    配置发信
                  </button>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--text-muted)'
              }}
            >
              取消
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)'
              }}
            >
              <Send size={14} />
              <span>{isSending ? '发送中...' : '立即发送'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
