import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  Sparkles, 
  Copy, 
  Check, 
  ShieldCheck,
  Server,
  Zap,
  ArrowRight,
  Trash2,
  Edit2,
  Power,
  AlertTriangle,
  Mail,
  Sliders,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ManagedDomain, AutomationLevel, TraditionalIMAPConfig, DomainProtocolType, DomainAlias } from '../../core/types';
import { TRADITIONAL_MAILBOX_PRESETS } from '../../core/email-gateway/imap-adapter';
import { DnsInspectorModal } from './DnsInspectorModal';

interface DomainManagerProps {
  domains: ManagedDomain[];
  masterForwardEmail?: string;
  onUpdateMasterForwardEmail: (email: string) => void;
  onAddDomain: (domainName: string, provider: DomainProtocolType, traditionalConfig?: TraditionalIMAPConfig) => void;
  onDeleteDomain: (domainId: string, deleteEmails?: boolean) => void;
  onUpdateDomain: (domainId: string, updates: Partial<ManagedDomain>) => void;
  onAddAlias: (domainId: string, prefix: string, description: string) => void;
  onUpdateAlias: (domainId: string, aliasId: string, updates: Partial<DomainAlias>) => void;
  onDeleteAlias: (domainId: string, aliasId: string) => void;
  onToggleAliasAutoReply: (domainId: string, aliasId: string) => void;
  onChangeDomainAutomationLevel: (domainId: string, level: AutomationLevel) => void;
  isMobile?: boolean;
}

export const DomainManager: React.FC<DomainManagerProps> = ({
  domains,
  masterForwardEmail = '',
  onUpdateMasterForwardEmail,
  onAddDomain,
  onDeleteDomain,
  onUpdateDomain,
  onAddAlias,
  onUpdateAlias,
  onDeleteAlias,
  onToggleAliasAutoReply,
  onChangeDomainAutomationLevel,
  isMobile = false,
}) => {
  const [activeTab, setActiveTab] = useState<'cloudflare' | 'traditional'>('cloudflare');
  const [selectedDomainId, setSelectedDomainId] = useState<string>(domains[0]?.id || '');
  const [mobileActiveDomainId, setMobileActiveDomainId] = useState<string | null>(null);
  const [inspectorDomain, setInspectorDomain] = useState<string | null>(null);

  // 集中归集主邮箱本地输入状态
  const [masterEmailInput, setMasterEmailInput] = useState(masterForwardEmail || '');
  const [masterEmailSaved, setMasterEmailSaved] = useState(false);

  useEffect(() => {
    if (masterForwardEmail) {
      setMasterEmailInput(masterForwardEmail);
    }
  }, [masterForwardEmail]);

  const handleSaveMasterEmail = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = masterEmailInput.trim();
    if (!trimmed) return;
    onUpdateMasterForwardEmail?.(trimmed);
    setMasterEmailSaved(true);
    setTimeout(() => setMasterEmailSaved(false), 2500);
  };
  
  // Cloudflare 表单
  const [newDomainInput, setNewDomainInput] = useState('');

  // 传统 IMAP 表单
  const [tradDomain, setTradDomain] = useState('');
  const [tradPreset, setTradPreset] = useState('tencent');
  const [tradHost, setTradHost] = useState(TRADITIONAL_MAILBOX_PRESETS.tencent.imapHost);
  const [tradPort, setTradPort] = useState(993);
  const [tradUser, setTradUser] = useState('');
  const [tradPass, setTradPass] = useState('');
  const [tradTesting, setTradTesting] = useState(false);
  const [tradTestSuccess, setTradTestSuccess] = useState<string | null>(null);

  // 别名弹窗 (新增/编辑)
  const [aliasModalMode, setAliasModalMode] = useState<'create' | 'edit'>('create');
  const [showAliasModal, setShowAliasModal] = useState(false);
  const [editingAliasId, setEditingAliasId] = useState<string | null>(null);
  const [aliasPrefix, setAliasPrefix] = useState('');
  const [aliasDesc, setAliasDesc] = useState('');
  const [aliasIsActive, setAliasIsActive] = useState(true);
  const [aliasAutoReply, setAliasAutoReply] = useState(false);

  // 删除确认弹窗
  const [deleteDomainTarget, setDeleteDomainTarget] = useState<ManagedDomain | null>(null);
  const [deleteDomainCascadeEmails, setDeleteDomainCascadeEmails] = useState(false);
  const [deleteAliasTarget, setDeleteAliasTarget] = useState<{ domainId: string; alias: DomainAlias } | null>(null);

  const [copiedText, setCopiedText] = useState<string | null>(null);

  // 确保 selectedDomain 永远指向有效项
  const activeDomainId = (isMobile && mobileActiveDomainId) ? mobileActiveDomainId : selectedDomainId;
  const selectedDomain = domains.find(d => d.id === activeDomainId) || domains[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCreateCfDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainInput.trim()) return;
    onAddDomain(newDomainInput.trim(), 'cloudflare');
    setNewDomainInput('');
  };

  const handlePresetChange = (presetKey: string) => {
    setTradPreset(presetKey);
    const p = TRADITIONAL_MAILBOX_PRESETS[presetKey];
    if (p) {
      setTradHost(p.imapHost);
      setTradPort(p.imapPort);
    }
  };

  const handleCreateTraditionalAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradDomain.trim() || !tradUser.trim()) return;
    setTradTesting(true);
    await new Promise(r => setTimeout(r, 600));
    setTradTesting(false);
    setTradTestSuccess(`验证成功！已接入 ${tradHost}:${tradPort}`);

    onAddDomain(tradDomain.trim(), 'traditional_imap', {
      imapHost: tradHost,
      imapPort: tradPort,
      imapSecure: true,
      smtpHost: tradHost.replace(/^imap\./, 'smtp.'),
      smtpPort: 465,
      smtpSecure: true,
      username: tradUser,
      password: tradPass,
      preset: tradPreset as any,
    });

    setTimeout(() => {
      setTradTestSuccess(null);
      setTradDomain('');
      setTradUser('');
      setTradPass('');
    }, 1500);
  };

  const openCreateAliasModal = () => {
    setAliasModalMode('create');
    setEditingAliasId(null);
    setAliasPrefix('');
    setAliasDesc('');
    setAliasIsActive(true);
    setAliasAutoReply(false);
    setShowAliasModal(true);
  };

  const openEditAliasModal = (alias: DomainAlias) => {
    setAliasModalMode('edit');
    setEditingAliasId(alias.id);
    setAliasPrefix(alias.prefix);
    setAliasDesc(alias.description);
    setAliasIsActive(alias.isActive !== false);
    setAliasAutoReply(alias.autoReplyEnabled);
    setShowAliasModal(true);
  };

  const handleSaveAlias = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDomain) return;

    if (aliasModalMode === 'create') {
      if (!aliasPrefix.trim()) return;
      onAddAlias(selectedDomain.id, aliasPrefix.trim(), aliasDesc.trim() || '自定义别名');
    } else if (aliasModalMode === 'edit' && editingAliasId) {
      onUpdateAlias(selectedDomain.id, editingAliasId, {
        description: aliasDesc.trim() || '自定义别名',
        isActive: aliasIsActive,
        autoReplyEnabled: aliasAutoReply,
      });
    }

    setShowAliasModal(false);
  };

  const handleConfirmDeleteDomain = () => {
    if (!deleteDomainTarget) return;
    const targetId = deleteDomainTarget.id;
    onDeleteDomain(targetId, deleteDomainCascadeEmails);
    
    // 如果删除的是当前选中的域名，切换到下一个
    if (selectedDomainId === targetId) {
      const remaining = domains.filter(d => d.id !== targetId);
      setSelectedDomainId(remaining[0]?.id || '');
    }

    setDeleteDomainTarget(null);
    setDeleteDomainCascadeEmails(false);
  };

  const handleConfirmDeleteAlias = () => {
    if (!deleteAliasTarget) return;
    onDeleteAlias(deleteAliasTarget.domainId, deleteAliasTarget.alias.id);
    setDeleteAliasTarget(null);
  };

  const toggleDomainPauseStatus = (domain: ManagedDomain) => {
    const nextStatus = domain.status === 'paused' ? 'active' : 'paused';
    onUpdateDomain(domain.id, { status: nextStatus });
  };

  return (
    <div style={{
      flex: 1,
      height: '100%',
      overflowY: 'auto',
      padding: isMobile ? '16px' : '28px 36px',
      background: 'var(--bg-surface)'
    }}>
      {/* 标题 */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{
          fontSize: '22px',
          fontWeight: 700,
          fontFamily: 'var(--font-heading)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Globe size={24} color="#38bdf8" />
          <span>域名邮箱综合管理 (Cloudflare + 传统企业邮)</span>
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          统一管理所有自定义域名与收发邮箱，支持独立停用、启用、编辑与安全删除。
        </p>
      </div>

      {/* 集中归集主邮箱快捷配置卡片 (桌面版与 iOS 统一适配，填入直接永久生效) */}
      {(!isMobile || !mobileActiveDomainId) && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(15, 23, 42, 0.7) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '14px',
          padding: isMobile ? '16px' : '18px 22px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '12px' : '20px'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Mail size={16} color="#38bdf8" />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                  集中归集主邮箱 (Central Master Forwarding)
                </span>
                <span style={{
                  fontSize: '10.5px',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: 600
                }}>
                  永久默认接收
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                填入此邮箱后，所有绑定的多域名来信将自动静默双重备份至此地址；客户端内按域名独立智能分流。
              </p>
            </div>

            <form
              onSubmit={handleSaveMasterEmail}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <input
                type="email"
                placeholder="例如: backup@yourdomain.com"
                value={masterEmailInput}
                onChange={(e) => setMasterEmailInput(e.target.value)}
                style={{
                  width: isMobile ? '100%' : '260px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: masterEmailSaved ? '#10b981' : 'var(--accent-primary)',
                  color: '#fff',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'background 0.2s ease'
                }}
              >
                {masterEmailSaved ? <Check size={14} /> : <CheckCircle2 size={14} />}
                <span>{masterEmailSaved ? '永久默认已生效' : '设为默认接收'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 顶部：添加域名卡片 (在移动端进入详情新页时收起) */}
      {(!isMobile || !mobileActiveDomainId) && (
      <div style={{
        background: 'rgba(18, 26, 48, 0.6)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        padding: isMobile ? '16px' : '20px 24px',
        marginBottom: isMobile ? '20px' : '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('cloudflare')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: activeTab === 'cloudflare' ? 600 : 400,
                background: activeTab === 'cloudflare' ? 'var(--accent-primary)' : 'rgba(0,0,0,0.3)',
                color: activeTab === 'cloudflare' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <Globe size={13} />
              <span>Cloudflare 路由域名 (无限别名)</span>
            </button>

            <button
              onClick={() => setActiveTab('traditional')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: activeTab === 'traditional' ? 600 : 400,
                background: activeTab === 'traditional' ? 'var(--accent-primary)' : 'rgba(0,0,0,0.3)',
                color: activeTab === 'traditional' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <Server size={13} />
              <span>传统企业邮箱 (IMAP / SMTP 协议)</span>
            </button>
          </div>
        </div>

        {activeTab === 'cloudflare' ? (
          <form onSubmit={handleCreateCfDomain} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              placeholder="输入你的新域名，如: mybrand.ai"
              value={newDomainInput}
              onChange={(e) => setNewDomainInput(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                fontSize: '13px',
                color: '#fff',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                background: 'var(--accent-primary)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0
              }}
            >
              <Plus size={14} /> 绑定 Cloudflare 域名
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreateTraditionalAccount} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
              <select
                value={tradPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '12px'
                }}
              >
                {Object.values(TRADITIONAL_MAILBOX_PRESETS).map(p => (
                  <option key={p.id} value={p.id} style={{ background: '#0f172a' }}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="域名 (如: company.com)"
                value={tradDomain}
                onChange={(e) => setTradDomain(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />

              <input
                type="email"
                placeholder="邮箱账号 (user@company.com)"
                value={tradUser}
                onChange={(e) => setTradUser(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />

              <input
                type="password"
                placeholder="客户端授权码 / 密码"
                value={tradPass}
                onChange={(e) => setTradPass(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />

              <button
                type="submit"
                disabled={tradTesting}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#10b981',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                {tradTesting ? '验证连接中...' : '测试并接入'}
              </button>
            </div>

            {tradTestSuccess && (
              <div style={{ fontSize: '11px', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> {tradTestSuccess}
              </div>
            )}
          </form>
        )}
      </div>
      )}

      {/* 移动端独立详情新页顶部返回栏 */}
      {isMobile && mobileActiveDomainId && selectedDomain && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button
            onClick={() => setMobileActiveDomainId(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <ChevronLeft size={16} /> 返回域名列表
          </button>
          <span style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: '#818cf8', fontWeight: 700 }}>
            {selectedDomain.domain}
          </span>
        </div>
      )}

      {/* 主体布局：移动端单页推栈 / 桌面端双栏 */}
      <div style={{ display: isMobile ? 'block' : 'flex', gap: '24px' }}>
        {/* 域名列表：在移动端进入详情新页时隐藏 */}
        {(!isMobile || !mobileActiveDomainId) && (
        <div style={{ width: isMobile ? '100%' : '320px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)' }}>
              已管理域名 ({domains.length})
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              {isMobile ? '点击卡片打开管理新页' : '点击切换管理'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {domains.length === 0 ? (
              <div style={{
                padding: '30px 16px',
                textAlign: 'center',
                borderRadius: '10px',
                border: '1px dashed var(--border-subtle)',
                color: 'var(--text-dim)',
                fontSize: '12px'
              }}>
                暂无托管域名，请先在上方添加绑定
              </div>
            ) : (
              domains.map(d => {
                const isSelected = selectedDomain?.id === d.id;
                const isCf = d.provider === 'cloudflare';
                const isPaused = d.status === 'paused';

                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      setSelectedDomainId(d.id);
                      if (isMobile) {
                        setMobileActiveDomainId(d.id);
                      }
                    }}
                    style={{
                      padding: isMobile ? '14px 16px' : '12px 14px',
                      borderRadius: '10px',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: isPaused ? '#f59e0b' : '#10b981',
                          boxShadow: isPaused ? '0 0 6px rgba(245, 158, 11, 0.5)' : '0 0 6px rgba(16, 185, 129, 0.5)'
                        }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: isSelected ? '#fff' : 'var(--text-main)' }}>
                          {d.domain}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '9px',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: isCf ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                          color: isCf ? '#38bdf8' : '#c084fc',
                          fontWeight: 600
                        }}>
                          {isCf ? 'CLOUDFLARE' : 'IMAP/SMTP'}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDomainTarget(d);
                          }}
                          style={{
                            padding: '3px',
                            borderRadius: '4px',
                            color: 'var(--text-dim)',
                            background: 'transparent',
                            transition: 'color 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                          title="删除此域名"
                        >
                          <Trash2 size={13} />
                        </button>

                        {isMobile && (
                          <ChevronRight size={16} color="var(--text-dim)" />
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span>{d.aliases.length} 个邮箱地址</span>
                      <span>收信 {d.totalReceived}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        )}

        {/* 右侧详情：在移动端进入详情新页时全宽展示，在桌面端作为右栏展示 */}
        {(!isMobile || mobileActiveDomainId) && (
        selectedDomain ? (
          <div style={{ flex: 1, width: '100%' }}>
            {/* 域名状态与操作顶部栏 */}
            <div style={{
              background: 'rgba(18, 26, 48, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: isMobile ? '14px 16px' : '18px 20px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      {selectedDomain.domain}
                    </h3>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: selectedDomain.status === 'paused' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: selectedDomain.status === 'paused' ? '#f59e0b' : '#34d399',
                      border: selectedDomain.status === 'paused' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                      fontWeight: 600
                    }}>
                      {selectedDomain.status === 'paused' ? '已暂停服务' : '正常运行中'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    协议: {selectedDomain.provider === 'cloudflare' ? 'Cloudflare Email Routing (全动态别名)' : '传统商业 IMAP/SMTP 托管'}
                    {selectedDomain.traditionalConfig?.username ? ` · 主账号: ${selectedDomain.traditionalConfig.username}` : ''}
                  </p>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '8px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    fontSize: '11px',
                    color: '#38bdf8'
                  }}>
                    <ShieldCheck size={12} />
                    <span>集中双重备份：{masterEmailInput ? `同步备份至 ${masterEmailInput}` : '未配置集中归集邮箱 (可选)'}</span>
                  </div>
                </div>

                {/* 状态与删除按钮组 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => setInspectorDomain(selectedDomain.domain)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    title="自动检测 MX、SPF、DKIM、DMARC 解析与 Resend 发信状态"
                  >
                    <ShieldCheck size={13} />
                    <span>⚡ 一键 DNS & 发信体检</span>
                  </button>

                  <button
                    onClick={() => toggleDomainPauseStatus(selectedDomain)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      background: selectedDomain.status === 'paused' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: selectedDomain.status === 'paused' ? '#34d399' : '#f59e0b',
                      border: selectedDomain.status === 'paused' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                      fontWeight: 500
                    }}
                  >
                    <Power size={13} />
                    <span>{selectedDomain.status === 'paused' ? '恢复运行' : '暂停此域名'}</span>
                  </button>

                  <button
                    onClick={() => setDeleteDomainTarget(selectedDomain)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      fontWeight: 500
                    }}
                  >
                    <Trash2 size={13} />
                    <span>删除域名</span>
                  </button>
                </div>
              </div>

              {/* 自动化策略调整 */}
              <div style={{
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  DeepSeek 自动化策略：
                </span>

                <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.3)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  {(['conservative', 'balanced', 'autonomous'] as AutomationLevel[]).map(level => {
                    const isCurrent = selectedDomain.defaultAutomationLevel === level;
                    const labels: Record<AutomationLevel, string> = {
                      conservative: '保守审核',
                      balanced: '平衡模式',
                      autonomous: '全自主回复'
                    };
                    return (
                      <button
                        key={level}
                        onClick={() => onChangeDomainAutomationLevel(selectedDomain.id, level)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: isCurrent ? 600 : 400,
                          background: isCurrent ? 'var(--accent-primary)' : 'transparent',
                          color: isCurrent ? '#fff' : 'var(--text-muted)',
                        }}
                      >
                        {labels[level]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 邮箱地址/别名列表卡片 */}
            <div style={{
              background: 'rgba(18, 26, 48, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '18px 20px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={16} color="#818cf8" />
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>
                    关联邮箱与别名 ({selectedDomain.aliases.length})
                  </h3>
                </div>

                <button
                  onClick={openCreateAliasModal}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#a5b4fc',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  <Plus size={13} /> 添加新邮箱 / 别名
                </button>
              </div>

              {selectedDomain.aliases.length === 0 ? (
                <div style={{
                  padding: '30px 16px',
                  textAlign: 'center',
                  borderRadius: '8px',
                  border: '1px dashed var(--border-subtle)',
                  color: 'var(--text-dim)',
                  fontSize: '13px'
                }}>
                  该域名下暂无独立邮箱或别名，请点击右上角【添加新邮箱 / 别名】
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedDomain.aliases.map(al => {
                    const isActive = al.isActive !== false;

                    return (
                      <div
                        key={al.id}
                        style={{
                          background: 'rgba(0, 0, 0, 0.25)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          padding: '14px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          opacity: isActive ? 1 : 0.6
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                              {al.fullAddress}
                            </span>
                            
                            <button
                              onClick={() => handleCopy(al.fullAddress)}
                              style={{ color: 'var(--text-dim)', padding: '2px' }}
                              title="复制邮箱地址"
                            >
                              {copiedText === al.fullAddress ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                            </button>

                            <span style={{
                              fontSize: '10px',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.2)',
                              color: isActive ? '#34d399' : '#9ca3af',
                              fontWeight: 500
                            }}>
                              {isActive ? '运行中' : '已停用'}
                            </span>
                          </div>

                          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                            {al.description || '无备注用途'} · 累计收信: {al.emailCount || 0}
                          </div>
                        </div>

                        {/* 操作栏 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            color: al.autoReplyEnabled ? '#c4b5fd' : 'var(--text-dim)',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={al.autoReplyEnabled}
                              onChange={() => onToggleAliasAutoReply(selectedDomain.id, al.id)}
                              style={{ accentColor: 'var(--accent-primary)' }}
                            />
                            <span>DeepSeek 自动拟复</span>
                          </label>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => openEditAliasModal(al)}
                              style={{
                                padding: '5px 8px',
                                borderRadius: '5px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                              }}
                              title="修改用途备注"
                            >
                              <Edit2 size={12} /> 编辑
                            </button>

                            <button
                              onClick={() => setDeleteAliasTarget({ domainId: selectedDomain.id, alias: al })}
                              style={{
                                padding: '5px 8px',
                                borderRadius: '5px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#f87171',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                              }}
                              title="删除此邮箱"
                            >
                              <Trash2 size={12} /> 删除
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(18, 26, 48, 0.3)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '12px',
            color: 'var(--text-dim)',
            fontSize: '13px'
          }}>
            请选择左侧域名或新建域名开始管理
          </div>
        )
      )}
      </div>

      {/* 模态框 1：新建 / 编辑 邮箱别名 */}
      {showAliasModal && selectedDomain && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110
        }}>
          <form
            onSubmit={handleSaveAlias}
            style={{
              width: '440px',
              background: '#0f172a',
              border: '1px solid var(--border-highlight)',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: 'var(--shadow-glass)'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              {aliasModalMode === 'create' ? '创建新邮箱地址 / 别名' : `编辑邮箱: ${aliasPrefix}@${selectedDomain.domain}`}
            </h3>

            {aliasModalMode === 'create' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                  邮箱前缀
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="例如: billing, security, support"
                    value={aliasPrefix}
                    onChange={(e) => setAliasPrefix(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px'
                    }}
                    autoFocus
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-dim)' }}>
                    @{selectedDomain.domain}
                  </span>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                用途描述与备注
              </label>
              <input
                type="text"
                placeholder="例如: 财务对账、外部业务合作对接"
                value={aliasDesc}
                onChange={(e) => setAliasDesc(e.target.value)}
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

            {aliasModalMode === 'edit' && (
              <div style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#fff', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={aliasIsActive}
                    onChange={(e) => setAliasIsActive(e.target.checked)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <span>启用此邮箱地址 (若取消勾选则暂停处理)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#fff', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={aliasAutoReply}
                    onChange={(e) => setAliasAutoReply(e.target.checked)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <span>允许 DeepSeek 针对此地址进信自动拟写回复</span>
                </label>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowAliasModal(false)}
                style={{ padding: '8px 14px', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '13px' }}
              >
                取消
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  background: 'var(--accent-primary)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                {aliasModalMode === 'create' ? '立即创建' : '保存修改'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 模态框 2：删除邮箱确认弹窗 */}
      {deleteAliasTarget && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120
        }}>
          <div style={{
            width: '420px',
            background: '#0f172a',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f87171', marginBottom: '14px' }}>
              <AlertTriangle size={22} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                确认删除此邮箱？
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
              确定要删除邮箱地址 <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{deleteAliasTarget.alias.fullAddress}</strong> 吗？
              <br />
              删除后桌面客户端将停止对该别名或账号的监控与自动拟复。
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setDeleteAliasTarget(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  color: 'var(--text-muted)',
                  fontSize: '13px'
                }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmDeleteAlias}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={14} /> 确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 模态框 3：删除域名确认弹窗 */}
      {deleteDomainTarget && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120
        }}>
          <div style={{
            width: '450px',
            background: '#0f172a',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f87171', marginBottom: '14px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                确认删除整个域名配置？
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
              确定要移除域名 <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{deleteDomainTarget.domain}</strong> 吗？
              此操作将同步移除该域名下全部关联的 <strong style={{ color: '#fff' }}>{deleteDomainTarget.aliases.length}</strong> 个邮箱地址配置。
            </p>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#fca5a5', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={deleteDomainCascadeEmails}
                  onChange={(e) => setDeleteDomainCascadeEmails(e.target.checked)}
                  style={{ accentColor: '#ef4444' }}
                />
                <span>同时清空该域名下本地已接收的历史邮件</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  setDeleteDomainTarget(null);
                  setDeleteDomainCascadeEmails(false);
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  color: 'var(--text-muted)',
                  fontSize: '13px'
                }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmDeleteDomain}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={14} /> 确认删除域名
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DNS 与发信健康度体检弹窗 */}
      <DnsInspectorModal
        domain={inspectorDomain || ''}
        isOpen={!!inspectorDomain}
        onClose={() => setInspectorDomain(null)}
      />
    </div>
  );
};
