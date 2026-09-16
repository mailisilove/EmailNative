import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  RotateCw, 
  Coins, 
  Plus, 
  Cloud, 
  X, 
  Edit3,
  Menu
} from 'lucide-react';
import { ManagedDomain } from '../../core/types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedDomain?: ManagedDomain;
  selectedAliasPrefix?: string;
  totalTokensConsumed: number;
  totalCostUsd: number;
  isProcessing: boolean;
  onSimulateInbound: () => void;
  onRefresh: () => void;
  onSyncProduction?: () => Promise<void>;
  isSyncingProduction?: boolean;
  isMobile?: boolean;
  onNewEmail?: () => void;
  onOpenMobileDrawer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  selectedDomain,
  selectedAliasPrefix,
  totalTokensConsumed,
  totalCostUsd,
  isProcessing,
  onSimulateInbound,
  onRefresh,
  onSyncProduction,
  isSyncingProduction,
  isMobile = false,
  onNewEmail,
  onOpenMobileDrawer,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
                title="选择域名与邮件分类"
              >
                <Menu size={18} />
              </button>
            )}

            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              {selectedAliasPrefix 
                ? `${selectedAliasPrefix}@` 
                : (selectedDomain?.displayName || selectedDomain?.domain || '收件箱')}
            </h1>
            {isProcessing && (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c084fc', boxShadow: '0 0 8px #c084fc' }} />
            )}
          </div>

          {/* 右侧轻量动作区 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              placeholder="搜索邮件..."
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
        height: '56px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(15, 22, 41, 0.75)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        userSelect: 'none',
        zIndex: 10,
      }}
    >
      {/* 当前视图标题与面包屑 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
          {selectedDomain ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text-dim)' }}>域名:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#818cf8' }}>{selectedDomain.domain}</span>
              {selectedAliasPrefix && (
                <>
                  <span style={{ color: 'var(--text-dim)' }}>/</span>
                  <span style={{ color: '#c084fc' }}>{selectedAliasPrefix}@</span>
                </>
              )}
            </span>
          ) : (
            <span>全部聚合邮箱</span>
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
            <span>Agent 正在分析邮件...</span>
          </div>
        )}
      </div>

      {/* 中部搜索框 */}
      <div 
        className="app-region-no-drag"
        style={{
          position: 'relative',
          width: '320px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Search size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '10px' }} />
        <input
          type="text"
          placeholder="搜索主题、发件人或提取的验证码..."
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

      {/* 右侧控制栏：Token 统计与模拟新邮件 */}
      <div 
        className="app-region-no-drag"
        style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
      >
        {/* Token 消耗徽章 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '11px',
          color: 'var(--text-muted)'
        }} title="累计大模型 Token 消耗及推理成本">
          <Coins size={13} color="#f59e0b" />
          <span style={{ fontFamily: 'var(--font-mono)' }}>{totalTokensConsumed.toLocaleString()} Tok</span>
          <span style={{ color: 'var(--text-dim)' }}>|</span>
          <span style={{ color: '#10b981', fontWeight: 600 }}>${totalCostUsd.toFixed(4)}</span>
        </div>

        {/* 同步 Cloudflare 生产邮件 */}
        {onSyncProduction && (
          <button
            onClick={onSyncProduction}
            disabled={isSyncingProduction}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              fontSize: '12px',
              fontWeight: 600,
            }}
            title="直连生产 Cloudflare Worker API 拉取最新真实域名邮件并由 DeepSeek-R1 研判"
          >
            <Cloud size={13} className={isSyncingProduction ? "animate-spin-slow" : ""} />
            <span>{isSyncingProduction ? '同步生产邮件中...' : '同步 Cloudflare'}</span>
          </button>
        )}

        {/* 模拟新邮件到达 (快速测试 Agent 流水线) */}
        <button
          onClick={onSimulateInbound}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '6px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            color: '#a5b4fc',
            fontSize: '12px',
            fontWeight: 500,
          }}
          title="生成一封模拟来信，即刻体验 Agent 自动分类与提取验证码/起草流水线"
        >
          <Plus size={13} />
          <span>模拟来信</span>
        </button>

        {/* 刷新同步 */}
        <button
          onClick={onRefresh}
          style={{
            padding: '6px',
            borderRadius: '6px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="拉取最新邮件"
        >
          <RotateCw size={15} />
        </button>
      </div>
    </header>
  );
};
