import React from 'react';
import { Inbox, Sparkles, Globe, Settings } from 'lucide-react';

interface MobileTabBarProps {
  currentTab: 'inbox' | 'domains' | 'agent' | 'settings';
  onTabChange: (tab: 'inbox' | 'domains' | 'agent' | 'settings') => void;
  unreadCount: number;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  currentTab,
  onTabChange,
  unreadCount,
}) => {
  const tabs = [
    { id: 'inbox' as const, label: '收件箱', icon: Inbox, badge: unreadCount },
    { id: 'agent' as const, label: 'Agent', icon: Sparkles },
    { id: 'domains' as const, label: '多域名', icon: Globe },
    { id: 'settings' as const, label: '设置', icon: Settings },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(58px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(6, 9, 16, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        userSelect: 'none',
      }}
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '6px 16px',
              color: isActive ? '#818cf8' : 'var(--text-dim)',
              position: 'relative',
              transition: 'color 0.15s ease',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={20} color={isActive ? '#818cf8' : 'currentColor'} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '0 4px',
                    borderRadius: '999px',
                    minWidth: '14px',
                    height: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #060910',
                  }}
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>
            <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 400 }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
