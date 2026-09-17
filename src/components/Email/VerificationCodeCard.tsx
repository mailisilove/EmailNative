import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, Clock } from 'lucide-react';
import { VerificationCodeInfo } from '../../core/types';
import { useI18n } from '../../core/i18n/I18nContext';

interface VerificationCodeCardProps {
  info: VerificationCodeInfo;
}

export const VerificationCodeCard: React.FC<VerificationCodeCardProps> = ({ info }) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(info.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
      border: '1px solid rgba(99, 102, 241, 0.35)',
      borderRadius: '12px',
      padding: '14px 18px',
      marginBottom: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.12)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'rgba(99, 102, 241, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#818cf8'
        }}>
          <ShieldCheck size={22} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600, letterSpacing: '0.03em' }}>
            {info.serviceName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#ffffff',
            }}>
              {info.code}
            </span>
            {info.expiresInMinutes && (
              <span style={{
                fontSize: '11px',
                color: 'var(--text-dim)',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}>
                <Clock size={10} /> {info.expiresInMinutes}m
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleCopy}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '7px 14px',
          borderRadius: '8px',
          background: copied ? '#10b981' : 'var(--accent-primary)',
          color: '#fff',
          fontWeight: 600,
          fontSize: '12px',
          boxShadow: copied ? '0 0 10px rgba(16, 185, 129, 0.4)' : '0 2px 8px rgba(99, 102, 241, 0.3)'
        }}
      >
        {copied ? (
          <>
            <Check size={13} />
            <span>{t('common.copied')}</span>
          </>
        ) : (
          <>
            <Copy size={13} />
            <span>{t('common.copy')}</span>
          </>
        )}
      </button>
    </div>
  );
};
