import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  RefreshCw, 
  Coins, 
  Cloud, 
  X, 
  Edit3, 
  Menu, 
  Square,
  ChevronDown
} from 'lucide-react';
import { ManagedDomain } from '../../core/types';
import { useI18n } from '../../core/i18n/I18nContext';
import { LanguageToggle } from '../Common/LanguageToggle';
import { ThemeToggle } from '../Common/ThemeToggle';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedDomain?: ManagedDomain;
  selectedAliasPrefix?: string;
  totalTokensConsumed: number;
  totalCostUsd: number;
  isProcessing: boolean;
  onSimulateInbound?: () => void;
  onRefresh?: () => void;
  onSyncProduction?: () => Promise<void>;
  isSyncingProduction?: boolean;
  isMobile?: boolean;
  onNewEmail?: () => void;
  onOpenMobileDrawer?: () => void;
  onEmergencyStop?: () => void;
  activeEmailSubject?: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  selectedDomain,
  selectedAliasPrefix,
  totalTokensConsumed,
  totalCostUsd,
  isProcessing,
  onSyncProduction,
  isSyncingProduction,
  isMobile = false,
  onNewEmail,
  onOpenMobileDrawer,
  onEmergencyStop,
  activeEmailSubject,
}) => {
  const { t } = useI18n();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showTokenMenu, setShowTokenMenu] = useState(false);
  const tokenMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showTokenMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (tokenMenuRef.current && !tokenMenuRef.current.contains(e.target as Node)) {
        setShowTokenMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTokenMenu]);

  const tokensDisplay = (typeof totalTokensConsumed === 'number' && !isNaN(totalTokensConsumed))
    ? totalTokensConsumed.toLocaleString()
    : '0';
  const costDisplay = (typeof totalCostUsd === 'number' && !isNaN(totalCostUsd))
    ? totalCostUsd.toFixed(4)
    : '0.0000';

  // 移动端极简顶栏
  if (isMobile) {
    return (
      <header
        style={{
          paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))',
          paddingBottom: '10px',
          paddingLeft: '16px',
          paddingRight: '16px',
          background: 'rgba(6, 9, 16, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {/* 左侧菜单抽屉按钮 + 大标题 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onOpenMobileDrawer && (
              <button
                onClick={onOpenMobileDrawer}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={t('mobile.selectDomainAndCategory')}
              >
                <Menu size={18} />
              </button>
            )}

            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-white)', margin: 0, letterSpacing: '-0.02em' }}>
              {selectedAliasPrefix 
                ? `${selectedAliasPrefix}@` 
                : (selectedDomain?.displayName || selectedDomain?.domain || t('header.inbox'))}
            </h1>
            {isProcessing && (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c084fc', boxShadow: '0 0 8px #c084fc' }} />
            )}
          </div>

          {/* 右侧轻量动作区 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isProcessing && onEmergencyStop && (
              <button
                onClick={onEmergencyStop}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                className="animate-pulse"
                title={`${t('header.emergencyStop')}${activeEmailSubject ? `: ${activeEmailSubject}` : ''}`}
              >
                <Square size={10} fill="#f87171" />
                <span>{t('header.emergencyStop')}</span>
              </button>
            )}

            <ThemeToggle compact />
            <LanguageToggle compact />

            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: mobileSearchOpen ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                color: mobileSearchOpen ? '#818cf8' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {mobileSearchOpen ? <X size={16} /> : <Search size={16} />}
            </button>

            {onSyncProduction && (
              <button
                onClick={onSyncProduction}
                disabled={isSyncingProduction}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: isSyncingProduction ? '#fbbf24' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Cloud size={16} className={isSyncingProduction ? "animate-spin-slow" : ""} />
              </button>
            )}

            {onNewEmail && (
              <button
                onClick={onNewEmail}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)'
                }}
              >
                <Edit3 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* 展开的移动端搜索框 */}
        {mobileSearchOpen && (
          <div style={{ width: '100%', position: 'relative' }}>
            <Search size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder={t('header.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-subtle)',
                fontSize: '13px',
                color: '#fff',
              }}
            />
          </div>
        )}
      </header>
    );
  }
  return (
    <header 
      className="app-region-drag"
      style={{
        position: 'relative',
        height: '56px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-glass, rgba(15, 22, 41, 0.85))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        userSelect: 'none',
        zIndex: 50,
      }}
    >
      {/* 1. 左侧：搜索框 (与原域名显示互换位置) */}
      <div 
        className="app-region-no-drag"
        style={{
          position: 'relative',
          width: '280px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Search size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '10px' }} />
        <input
          type="text"
          placeholder={t('header.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '7px 12px 7px 32px',
            borderRadius: '8px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-subtle)',
            fontSize: '12px',
            color: '#fff',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
        />
      </div>

      {/* 2. 中部：当前域名与邮箱视图显示 (与搜索框互换位置) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
          {selectedDomain ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text-dim)' }}>{t('header.domainLabel')}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#818cf8' }}>{selectedDomain.domain}</span>
              {selectedAliasPrefix && (
                <>
                  <span style={{ color: 'var(--text-dim)' }}>/</span>
                  <span style={{ color: '#c084fc' }}>{selectedAliasPrefix}@</span>
                </>
              )}
            </span>
          ) : (
            <span>{t('header.allMailboxes')}</span>
          )}
        </div>

        {isProcessing && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '999px',
            padding: '2px 10px',
            fontSize: '11px',
            color: '#c4b5fd'
          }}>
            <Sparkles size={12} className="animate-spin-slow" color="#c084fc" />
            <span>{t('header.agentAnalyzing')}</span>
          </div>
        )}
      </div>

      {/* 3. 右侧控制栏：主题切换、语言切换、Token下拉按钮与同步按钮 */}
      <div 
        className="app-region-no-drag"
        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        {/* 主题切换与语言切换 (均已转为极简小图标) */}
        <ThemeToggle compact />
        <LanguageToggle compact />

        {/* Token 消耗下拉按钮 */}
        <div ref={tokenMenuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTokenMenu((prev) => !prev);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: showTokenMenu ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 255, 255, 0.05)',
              border: showTokenMenu ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '6px 11px',
              fontSize: '12px',
              color: 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={t('agent.totalTokens', '累计 Tokens')}
          >
            <Coins size={14} color="#f59e0b" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-main)' }}>
              {tokensDisplay} Tok
            </span>
            <ChevronDown 
              size={12} 
              color="var(--text-muted)" 
              style={{
                transform: showTokenMenu ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s ease',
              }} 
            />
          </button>

          {/* 下拉两行详情菜单 */}
          {showTokenMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '240px',
                background: 'var(--bg-surface)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--border-highlight)',
                borderRadius: '10px',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
                padding: '14px 16px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* 第一行：Token 消耗 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Coins size={14} color="#f59e0b" />
                  <span style={{ fontWeight: 500 }}>{t('agent.totalTokens', '累计 Tokens')}</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-main)', fontSize: '12.5px' }}>
                  {tokensDisplay}
                </span>
              </div>

              {/* 第二行：预估费用 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#10b981', fontWeight: 700, fontSize: '14px', lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '14px' }}>$</span>
                  <span style={{ fontWeight: 500 }}>{t('agent.totalCost', '累计消耗预估')}</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#10b981', fontSize: '12.5px' }}>
                  ${costDisplay} USD
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 紧急止损按钮 */}
        {isProcessing && onEmergencyStop && (
          <button
            onClick={onEmergencyStop}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 11px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#f87171',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(239, 68, 68, 0.3)',
            }}
            className="animate-pulse"
            title={`${t('header.emergencyStop')}${activeEmailSubject ? `: ${activeEmailSubject}` : ''}`}
          >
            <Square size={11} fill="#f87171" />
            <span>{t('header.emergencyStop')}</span>
          </button>
        )}

        {/* 同步按钮 (替代原生产入站同步按钮) */}
        {onSyncProduction && (
          <button
            onClick={onSyncProduction}
            disabled={isSyncingProduction}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: isSyncingProduction 
                ? 'rgba(99, 102, 241, 0.25)' 
                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.85) 0%, rgba(139, 92, 246, 0.95) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isSyncingProduction ? 'not-allowed' : 'pointer',
              boxShadow: isSyncingProduction ? 'none' : '0 2px 8px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.15s ease'
            }}
            title={t('header.syncTooltip')}
          >
            <RefreshCw size={13} className={isSyncingProduction ? "animate-spin" : ""} />
            <span>{isSyncingProduction ? t('header.syncing') : t('header.syncBtn')}</span>
          </button>
        )}
      </div>
    </header>
  );
};
