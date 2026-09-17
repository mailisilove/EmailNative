import React from 'react';
import { 
  Inbox, 
  Sparkles, 
  Globe, 
  Settings, 
  PlusCircle, 
  Mail
} from 'lucide-react';
import { ManagedDomain } from '../../core/types';
import { useI18n } from '../../core/i18n/I18nContext';
import { MimeParser } from '../../core/email-gateway/mime-parser';

interface SidebarProps {
  currentView: 'inbox' | 'domains' | 'agent' | 'analytics';
  setCurrentView: (view: 'inbox' | 'domains' | 'agent' | 'analytics') => void;
  domains: ManagedDomain[];
  selectedDomainId: string | null;
  setSelectedDomainId: (id: string | null) => void;
  selectedAliasId: string | null;
  setSelectedAliasId: (id: string | null) => void;
  selectedCategory?: string;
  setSelectedCategory?: (category: string) => void;
  unreadCount: number;
  unreadCountsByAlias?: Record<string, number>;
  unreadCountsByDomain?: Record<string, number>;
  onOpenSettings: () => void;
  onNewEmail: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  domains,
  selectedDomainId,
  setSelectedDomainId,
  selectedAliasId,
  setSelectedAliasId,
  selectedCategory = 'all',
  setSelectedCategory,
  unreadCount,
  unreadCountsByAlias = {},
  unreadCountsByDomain = {},
  onOpenSettings,
  onNewEmail,
}) => {
  const { t } = useI18n();
  return (
    <aside style={{
      width: '270px',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      userSelect: 'none',
      flexShrink: 0
    }}>
      {/* 顶部品牌区 (为 macOS 原生红绿灯留出 38px 边距并支持窗口拖拽) */}
      <div 
        className="app-region-drag"
        style={{
          padding: '40px 18px 18px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
          }}>
            <Mail size={18} color="#fff" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '15px',
              letterSpacing: '-0.02em',
              color: 'var(--text-white)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              EmailNative
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '999px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                fontWeight: 600,
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>AGENT</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              {t('sidebar.brandSubtitle')}
            </div>
          </div>
        </div>
      </div>

      {/* 写信快速按钮 */}
      <div style={{ padding: '14px 16px 8px' }}>
        <button
          onClick={onNewEmail}
          style={{
            width: '100%',
            padding: '9px 14px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <Mail size={15} />
          {t('sidebar.compose')}
        </button>
      </div>

      {/* 导航菜单 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        {/* 主要工作区 */}
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', padding: '6px 8px', letterSpacing: '0.05em' }}>
          {t('sidebar.workspace')}
        </div>

        <button
          onClick={() => {
            setCurrentView('inbox');
            setSelectedDomainId(null);
            setSelectedAliasId(null);
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: '6px',
            marginBottom: '3px',
            background: currentView === 'inbox' && !selectedDomainId ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: currentView === 'inbox' && !selectedDomainId ? 'var(--text-white)' : 'var(--text-muted)',
            fontWeight: currentView === 'inbox' && !selectedDomainId ? 600 : 400,
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <Inbox size={16} color={currentView === 'inbox' && !selectedDomainId ? '#818cf8' : 'currentColor'} />
            <span>{t('sidebar.allInboxes')}</span>
          </div>
          {unreadCount > 0 && (
            <span style={{
              background: 'var(--accent-primary)',
              color: '#fff',
              fontSize: '11px',
              padding: '1px 6px',
              borderRadius: '999px',
              fontWeight: 600
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentView('agent')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: '6px',
            marginBottom: '3px',
            background: currentView === 'agent' ? 'rgba(139, 92, 246, 0.18)' : 'transparent',
            color: currentView === 'agent' ? 'var(--accent-primary)' : 'var(--text-muted)',
            fontWeight: currentView === 'agent' ? 600 : 400,
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <Sparkles size={16} color="#c084fc" />
            <span>{t('sidebar.agentFlow')}</span>
          </div>
          <span style={{
            fontSize: '10px',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#34d399',
              boxShadow: '0 0 6px #34d399'
            }} />
            {t('sidebar.activeCount')}
          </span>
        </button>

        <button
          onClick={() => setCurrentView('domains')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: '6px',
            marginBottom: '3px',
            background: currentView === 'domains' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: currentView === 'domains' ? 'var(--text-white)' : 'var(--text-muted)',
            fontWeight: currentView === 'domains' ? 600 : 400,
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <Globe size={16} color="#38bdf8" />
            <span>{t('sidebar.domainManage')}</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            {domains.length}
          </span>
        </button>

        {/* 我的托管域名分列表 */}
        <div style={{
          marginTop: '18px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-dim)',
            padding: '4px 8px 8px',
            letterSpacing: '0.05em'
          }}>
            <span>{t('sidebar.managedDomains')}</span>
            <button
              onClick={() => setCurrentView('domains')}
              style={{ color: 'var(--accent-primary)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              <PlusCircle size={12} /> {t('common.edit')}
            </button>
          </div>

          {domains.map(dom => {
            const isDomSelected = currentView === 'inbox' && selectedDomainId === dom.id;
            const cleanDomName = dom.domain.toLowerCase().trim();
            const domainUnread = unreadCountsByDomain[cleanDomName] || unreadCountsByDomain[dom.domain] || 0;

            return (
              <div key={dom.id} style={{ marginBottom: '8px' }}>
                <button
                  onClick={() => {
                    setCurrentView('inbox');
                    setSelectedCategory?.('all');
                    setSelectedDomainId(dom.id);
                    setSelectedAliasId(null);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    background: isDomSelected && !selectedAliasId ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    color: isDomSelected && !selectedAliasId ? 'var(--text-white)' : 'var(--text-main)',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                  title={t('sidebar.viewDomainEmails').replace('{domain}', dom.domain)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: dom.status === 'active' ? '#10b981' : '#f59e0b'
                    }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>{dom.domain}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {domainUnread > 0 && !selectedAliasId && (
                      <span style={{
                        background: 'rgba(99, 102, 241, 0.25)',
                        color: '#a5b4fc',
                        fontSize: '10px',
                        padding: '1px 5px',
                        borderRadius: '999px',
                        fontWeight: 600,
                        border: '1px solid rgba(99, 102, 241, 0.3)'
                      }}>
                        {domainUnread}
                      </span>
                    )}
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      {t('sidebar.mailboxesCount').replace('{count}', String(dom.aliases.length))}
                    </span>
                  </div>
                </button>

                {/* 专属收件箱别名列表 */}
                <div style={{ paddingLeft: '14px', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {dom.aliases.map(al => {
                    const isAliasSelected = currentView === 'inbox' && selectedAliasId === al.id;
                    const cleanAliasAddr = MimeParser.cleanEmailAddress(al.fullAddress);
                    const aliasUnread = unreadCountsByAlias[cleanAliasAddr] || unreadCountsByAlias[al.fullAddress] || 0;

                    return (
                      <button
                        key={al.id}
                        onClick={() => {
                          setCurrentView('inbox');
                          setSelectedCategory?.('all');
                          setSelectedDomainId(dom.id);
                          setSelectedAliasId(al.id);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '5px 8px',
                          borderRadius: '5px',
                          fontSize: '11px',
                          color: isAliasSelected ? 'var(--text-white)' : al.isActive === false ? 'rgba(128,128,128,0.35)' : 'var(--text-muted)',
                          background: isAliasSelected ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.15) 100%)' : 'transparent',
                          border: isAliasSelected ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                          opacity: al.isActive === false ? 0.6 : 1,
                          transition: 'all 0.15s ease'
                        }}
                        title={al.description || al.fullAddress}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                          <Mail size={12} color={isAliasSelected ? '#818cf8' : 'currentColor'} />
                          <span style={{ 
                            textOverflow: 'ellipsis', 
                            overflow: 'hidden', 
                            whiteSpace: 'nowrap',
                            fontWeight: isAliasSelected ? 600 : 400
                          }}>
                            {al.displayName ? `${al.prefix}@ (${al.displayName.split(' ')[0]})` : al.fullAddress}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {aliasUnread > 0 ? (
                            <span style={{ 
                              fontSize: '10px', 
                              color: 'var(--text-white)', 
                              background: '#ef4444', 
                              padding: '0 5px', 
                              borderRadius: '999px',
                              fontWeight: 700,
                              lineHeight: '14px'
                            }}>
                              {aliasUnread}
                            </span>
                          ) : al.autoReplyEnabled ? (
                            <span style={{ fontSize: '8px', color: '#a78bfa', background: 'rgba(167, 139, 250, 0.15)', padding: '1px 3px', borderRadius: '3px' }}>
                              AI
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部系统状态与设置 */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {t('sidebar.agentStandingBy')}
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          style={{
            padding: '6px',
            borderRadius: '6px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-white)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          title={t('sidebar.settings')}
        >
          <Settings size={16} />
        </button>
      </div>
    </aside>
  );
};
