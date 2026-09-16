import React from 'react';
import { Languages } from 'lucide-react';
import { useI18n } from '../../core/i18n/I18nContext';

interface LanguageToggleProps {
  compact?: boolean;
  showIcon?: boolean;
  style?: React.CSSProperties;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  compact = false,
  showIcon = true,
  style,
}) => {
  const { language, setLanguage, toggleLanguage, t } = useI18n();

  if (compact) {
    return (
      <button
        onClick={toggleLanguage}
        title={t('header.langTooltip')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '5px 9px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-main)',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          ...style,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
        }}
      >
        {showIcon && <Languages size={14} color="#818cf8" />}
        <span style={{ fontFamily: 'var(--font-mono)' }}>
          {language === 'zh' ? '中 / EN' : 'EN / 中'}
        </span>
      </button>
    );
  }

  // Segmented Pill Style
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px',
        background: 'rgba(0, 0, 0, 0.35)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '999px',
        ...style,
      }}
    >
      <button
        onClick={() => setLanguage('zh')}
        style={{
          padding: '4px 10px',
          fontSize: '12px',
          fontWeight: language === 'zh' ? 600 : 400,
          borderRadius: '999px',
          border: 'none',
          background: language === 'zh' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
          color: language === 'zh' ? '#ffffff' : 'var(--text-dim)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        中文
      </button>
      <button
        onClick={() => setLanguage('en')}
        style={{
          padding: '4px 10px',
          fontSize: '12px',
          fontWeight: language === 'en' ? 600 : 400,
          borderRadius: '999px',
          border: 'none',
          background: language === 'en' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
          color: language === 'en' ? '#ffffff' : 'var(--text-dim)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        English
      </button>
    </div>
  );
};
