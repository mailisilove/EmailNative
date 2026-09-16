import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../core/theme/useTheme';
import { useI18n } from '../../core/i18n/useI18n';

interface ThemeToggleProps {
  compact?: boolean;
  showIcon?: boolean;
  style?: React.CSSProperties;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  compact = false,
  showIcon = true,
  style,
}) => {
  const { theme, setTheme, toggleTheme } = useTheme();
  const { t } = useI18n();

  const isDark = theme === 'dark';

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        title={t('common.themeTooltip', '切换主题 (深色 / 浅色白色)')}
        aria-label="Toggle theme"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '5px 9px',
          borderRadius: '8px',
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-main)',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          ...style,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
        }}
      >
        {showIcon && (
          isDark ? (
            <Moon size={14} color="#38bdf8" />
          ) : (
            <Sun size={14} color="#f59e0b" />
          )
        )}
        <span style={{ fontSize: '11px', fontWeight: 600 }}>
          {isDark ? t('common.themeDark', '深色') : t('common.themeLight', '浅色')}
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
        background: isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.05)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '999px',
        ...style,
      }}
    >
      <button
        onClick={() => setTheme('dark')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: isDark ? 700 : 500,
          background: isDark ? 'var(--accent-primary)' : 'transparent',
          color: isDark ? '#ffffff' : 'var(--text-muted)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <Moon size={13} color={isDark ? '#ffffff' : 'currentColor'} />
        <span>{t('common.themeDark', '深色')}</span>
      </button>

      <button
        onClick={() => setTheme('light')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: !isDark ? 700 : 500,
          background: !isDark ? 'var(--accent-primary)' : 'transparent',
          color: !isDark ? '#ffffff' : 'var(--text-muted)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <Sun size={13} color={!isDark ? '#ffffff' : 'currentColor'} />
        <span>{t('common.themeLight', '浅色')}</span>
      </button>
    </div>
  );
};
