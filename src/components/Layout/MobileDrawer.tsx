import React from 'react';
import { 
  Inbox, 
  Star, 
  ShieldCheck, 
  Receipt, 
  Briefcase, 
  Mail, 
  X, 
  ChevronRight, 
  Settings, 
  Plus, 
  Globe,
  CircleDot
} from 'lucide-react';
import { ManagedDomain } from '../../core/types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  domains: ManagedDomain[];
  selectedDomainId: string | null;
  onSelectDomain: (id: string | null) => void;
  selectedAliasId: string | null;
  onSelectAlias: (id: string | null) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  unreadCount: number;
  unreadCountsByDomain: Record<string, number>;
  unreadCountsByAlias: Record<string, number>;
  categoryCounts: {
    all: number;
    unread: number;
    starred: number;
    verification: number;
    transactional: number;
    business: number;
  };
  onOpenSettings: () => void;
  onNewEmail: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  domains,
  selectedDomainId,
  onSelectDomain,
  selectedAliasId,
  onSelectAlias,
  selectedCategory,
  onSelectCategory,
  unreadCount,
  unreadCountsByDomain,
  unreadCountsByAlias,
  categoryCounts,
  onOpenSettings,
  onNewEmail,
}) => {
  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: '全部邮件', icon: Inbox, count: categoryCounts.all, color: '#818cf8' },
    { id: 'unread', label: '未读邮件', icon: CircleDot, count: categoryCounts.unread, color: '#38bdf8' },
    { id: 'starred', label: '星标收藏', icon: Star, count: categoryCounts.starred, color: '#f59e0b' },
    { id: 'verification', label: '验证码', icon: ShieldCheck, count: categoryCounts.verification, color: '#6366f1' },
    { id: 'transactional', label: '财务账单', icon: Receipt, count: categoryCounts.transactional, color: '#10b981' },
    { id: 'business', label: '重要沟通', icon: Briefcase, count: categoryCounts.business, color: '#c084fc' },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
    }}>
      {/* 背景遮罩 */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* 侧边滑出面板 */}
      <div style={{
        position: 'relative',
        width: '82%',
        maxWidth: '320px',
        height: '100%',
        background: '#090d16',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5)',
        paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 1,
      }}>
        {/* 顶部标题与关闭按钮 */}
        <div style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Mail size={15} color="#fff" />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
              邮箱与分类
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              background: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 滚动内容区 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
          {/* 分类筛选板块 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', padding: '0 8px 8px', letterSpacing: '0.04em' }}>
              邮件分类
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {categories.map(cat => {
                const isSelected = selectedCategory === cat.id;
                const Icon = cat.icon;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onClose();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 10px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      color: isSelected ? '#fff' : 'var(--text-muted)',
                      fontSize: '13px',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'background 0.12s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <Icon size={15} color={isSelected ? cat.color : 'currentColor'} />
                      <span>{cat.label}</span>
                    </div>
                    {cat.count > 0 && (
                      <span style={{
                        fontSize: '11px',
                        color: isSelected ? '#fff' : 'var(--text-dim)',
                        background: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.06)',
                        padding: '1px 6px',
                        borderRadius: '999px',
                        fontWeight: 600,
                      }}>
                        {cat.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 域名与别名收件箱板块 */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-dim)',
              padding: '0 8px 8px',
              letterSpacing: '0.04em',
            }}>
              <span>域名收件箱</span>
              <span style={{ fontSize: '10px' }}>{domains.length} 个域名</span>
            </div>

            {/* 全部聚合 */}
            <button
              onClick={() => {
                onSelectDomain(null);
                onSelectAlias(null);
                onClose();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 10px',
                borderRadius: '8px',
                marginBottom: '4px',
                background: !selectedDomainId ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: !selectedDomainId ? '#fff' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: !selectedDomainId ? 600 : 400,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={15} color={!selectedDomainId ? '#818cf8' : 'currentColor'} />
                <span>全部域名聚合</span>
              </div>
              {unreadCount > 0 && (
                <span style={{
                  background: 'var(--accent-primary)',
                  color: '#fff',
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  fontWeight: 600,
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* 各域名 */}
            {domains.map(dom => {
              const isDomSelected = selectedDomainId === dom.id;
              const domUnread = unreadCountsByDomain[dom.domain] || 0;

              return (
                <div key={dom.id} style={{ marginBottom: '8px' }}>
                  <button
                    onClick={() => {
                      onSelectDomain(dom.id);
                      onSelectAlias(null);
                      onClose();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: isDomSelected && !selectedAliasId ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      color: isDomSelected && !selectedAliasId ? '#fff' : 'var(--text-main)',
                      fontSize: '12px',
                      fontWeight: isDomSelected && !selectedAliasId ? 600 : 500,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: dom.status === 'active' ? '#10b981' : '#f59e0b',
                      }} />
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{dom.domain}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {domUnread > 0 && (
                        <span style={{
                          background: 'rgba(99, 102, 241, 0.25)',
                          color: '#a5b4fc',
                          fontSize: '10px',
                          padding: '0 5px',
                          borderRadius: '999px',
                          fontWeight: 600,
                        }}>
                          {domUnread}
                        </span>
                      )}
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                        {dom.aliases.length} 邮箱
                      </span>
                    </div>
                  </button>

                  {/* 域名别名 */}
                  <div style={{ paddingLeft: '14px', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {dom.aliases.map(al => {
                      const isAliasSelected = selectedAliasId === al.id;
                      const aliasUnread = unreadCountsByAlias[al.fullAddress] || 0;

                      return (
                        <button
                          key={al.id}
                          onClick={() => {
                            onSelectDomain(dom.id);
                            onSelectAlias(al.id);
                            onClose();
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            background: isAliasSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                            color: isAliasSelected ? '#fff' : 'var(--text-muted)',
                            fontWeight: isAliasSelected ? 600 : 400,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                            <Mail size={11} color={isAliasSelected ? '#818cf8' : 'currentColor'} />
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {al.prefix}@
                            </span>
                          </div>
                          {aliasUnread > 0 && (
                            <span style={{
                              background: '#ef4444',
                              color: '#fff',
                              fontSize: '9px',
                              padding: '0 4px',
                              borderRadius: '999px',
                              fontWeight: 700,
                            }}>
                              {aliasUnread}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部按钮栏 */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.2)',
        }}>
          <button
            onClick={() => {
              onClose();
              onNewEmail();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <Plus size={14} />
            <span>写信</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              background: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
