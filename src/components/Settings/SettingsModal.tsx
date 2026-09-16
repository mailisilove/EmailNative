import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Cloud, 
  Send, 
  Copy, 
  Check, 
  ShieldCheck, 
  Code, 
  Sparkles, 
  Mail, 
  Lock, 
  Database, 
  RefreshCw, 
  Globe 
} from 'lucide-react';
import { CloudflareConfig, LLMConfig, OutboundMailConfig } from '../../core/types';
import { CloudflareWorkerClient } from '../../core/email-gateway/cf-worker-client';
import { DnsInspectorModal } from '../Domains/DnsInspectorModal';
import { useI18n } from '../../core/i18n/I18nContext';
import { LanguageToggle } from '../Common/LanguageToggle';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  llmConfig: LLMConfig;
  onSaveLLMConfig: (cfg: LLMConfig) => void;
  cfConfig: CloudflareConfig;
  onSaveCFConfig: (cfg: CloudflareConfig) => void;
  outboundConfig: OutboundMailConfig;
  onSaveOutboundConfig: (cfg: OutboundMailConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  llmConfig,
  onSaveLLMConfig,
  cfConfig,
  onSaveCFConfig,
  outboundConfig,
  onSaveOutboundConfig,
}) => {
  const { t, language, setLanguage } = useI18n();
  const [activeTab, setActiveTab] = useState<'general' | 'llm' | 'cloudflare' | 'outbound' | 'worker_code'>('general');

  // 本地表单状态
  const [llm, setLlm] = useState<LLMConfig>({ ...llmConfig });
  const [cf, setCf] = useState<CloudflareConfig>({ ...cfConfig });
  const [outbound, setOutbound] = useState<OutboundMailConfig>({ ...outboundConfig });

  const [copiedCode, setCopiedCode] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [cfTesting, setCfTesting] = useState(false);
  const [cfTestResult, setCfTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  // D1 一键初始化状态
  const [initDbLoading, setInitDbLoading] = useState(false);
  const [initDbMsg, setInitDbMsg] = useState<{ ok: boolean; message: string } | null>(null);

  // DNS 连通性体检弹窗状态
  const [dnsTestDomain, setDnsTestDomain] = useState('cutready.app');
  const [showDnsModal, setShowDnsModal] = useState(false);

  const handleTestCloudflare = async () => {
    setCfTesting(true);
    setCfTestResult(null);
    try {
      const client = new CloudflareWorkerClient(cf.workerDomain, cf.apiToken);
      const res = await client.checkHealth();
      setCfTestResult({ ok: res.ok, message: res.message });
    } finally {
      setCfTesting(false);
    }
  };

  const handleInitDatabase = async () => {
    setInitDbLoading(true);
    setInitDbMsg(null);
    try {
      const client = new CloudflareWorkerClient(cf.workerDomain, cf.apiToken);
      const res = await client.initDatabase();
      setInitDbMsg(res);
    } finally {
      setInitDbLoading(false);
    }
  };

  const workerScriptCode = `/**
 * Cloudflare Worker for EmailNative (Open Source Edition)
 * 接收邮件路由、D1 自动建表持久化、Webhook 推送与 REST API
 */
async function autoInitDatabase(db) {
  if (!db) return false;
  try {
    await db.exec(\`
      CREATE TABLE IF NOT EXISTS emails (
        id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        address TEXT NOT NULL,
        subject TEXT,
        message TEXT,
        raw TEXT,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_emails_address ON emails(address);
      CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at DESC);
    \`);
    return true;
  } catch (err) {
    return false;
  }
}

export default {
  async email(message, env, ctx) {
    // 步骤 1: 若配置了集中归集邮箱，必须在消费 stream 之前执行 forward()
    const forwardTo = env.FORWARD_TO_GMAIL || '${cf.masterForwardEmail || ""}';
    if (forwardTo && forwardTo.trim() !== '') {
      try {
        await message.forward(forwardTo.trim());
      } catch (fwdErr) {
        console.warn('Forwarding failed (destination address may not be verified in Cloudflare):', fwdErr);
      }
    }

    // 步骤 2: 提取 MIME 原始内容并持久化至 D1
    const rawEmail = await new Response(message.raw).text();
    const id = 'cf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const snippet = rawEmail.replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').slice(0, 200).trim();

    if (env.DB) {
      try {
        await env.DB.prepare(
          'INSERT INTO emails (id, source, address, subject, message, raw, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)'
        ).bind(id, message.from, message.to, message.headers.get('subject') || '(无主题)', snippet, rawEmail, new Date().toISOString()).run();
      } catch (dbErr) {
        if (dbErr.message && dbErr.message.includes('no such table')) {
          await autoInitDatabase(env.DB);
          await env.DB.prepare(
            'INSERT INTO emails (id, source, address, subject, message, raw, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)'
          ).bind(id, message.from, message.to, message.headers.get('subject') || '(无主题)', snippet, rawEmail, new Date().toISOString()).run();
        }
      }
    }
  },
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/health') return new Response(JSON.stringify({ ok: true, d1_bound: !!env.DB }));
    if (url.pathname === '/api/init_db' && env.DB) {
      const ok = await autoInitDatabase(env.DB);
      return new Response(JSON.stringify({ ok, message: ok ? 'Database initialized' : 'Init failed' }));
    }
    if (url.pathname === '/api/mails' && env.DB) {
      const { results } = await env.DB.prepare('SELECT * FROM emails ORDER BY created_at DESC LIMIT 50').all();
      return new Response(JSON.stringify({ results }), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response('EmailNative Gateway Ready', { status: 200 });
  }
};`;

  const handleSaveAll = () => {
    onSaveLLMConfig(llm);
    onSaveCFConfig(cf);
    onSaveOutboundConfig(outbound);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleCopyWorkerCode = () => {
    navigator.clipboard.writeText(workerScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 120
    }}>
      <div style={{
        width: '680px',
        maxHeight: '85vh',
        background: '#0f172a',
        border: '1px solid var(--border-highlight)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-glass)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* 顶部标题栏 */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
            {t('settings.modalTitle')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LanguageToggle compact />
            <button onClick={onClose} style={{ color: 'var(--text-dim)' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 选项卡导航 */}
        <div style={{
          display: 'flex',
          padding: '0 24px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          {[
            { id: 'general', label: t('settings.tabGeneral'), icon: Globe },
            { id: 'llm', label: t('settings.tabLlm'), icon: Key },
            { id: 'cloudflare', label: t('settings.tabCloudflare'), icon: Cloud },
            { id: 'outbound', label: t('settings.tabOutbound'), icon: Send },
            { id: 'worker_code', label: t('settings.tabWorkerCode'), icon: Code },
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent ? '#818cf8' : 'var(--text-muted)',
                  borderBottom: isCurrent ? '2px solid #818cf8' : '2px solid transparent',
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 面板内容 */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          {/* 纯客户端零中转安全隐私横幅 */}
          <div style={{
            marginBottom: '18px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12px',
            color: '#a7f3d0'
          }}>
            <Lock size={15} style={{ color: '#34d399', flexShrink: 0 }} />
            <div>
              <strong>{t('settings.zeroRelayTitle')}</strong>：
              {t('settings.zeroRelayDesc')}
            </div>
          </div>

          {/* TAB 0: GENERAL & LANGUAGE */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '13px', color: '#fff', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  {t('settings.langSelectTitle')}
                </label>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '14px', lineHeight: 1.5 }}>
                  {t('settings.langSelectDesc')}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* 中文选项卡 */}
                  <button
                    type="button"
                    onClick={() => setLanguage('zh')}
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      border: language === 'zh' ? '2px solid #818cf8' : '1px solid var(--border-subtle)',
                      background: language === 'zh' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: language === 'zh' ? '#fff' : 'var(--text-muted)' }}>
                        简体中文
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                        Chinese (Simplified)
                      </div>
                    </div>
                    {language === 'zh' && (
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={12} color="#fff" />
                      </div>
                    )}
                  </button>

                  {/* English 选项卡 */}
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      border: language === 'en' ? '2px solid #818cf8' : '1px solid var(--border-subtle)',
                      background: language === 'en' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: language === 'en' ? '#fff' : 'var(--text-muted)' }}>
                        English
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                        English (US)
                      </div>
                    </div>
                    {language === 'en' && (
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={12} color="#fff" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* 协议与开源信息 */}
              <div style={{
                marginTop: '10px',
                padding: '14px 16px',
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
                  EmailNative Open Source Edition (v0.1.0)
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                  MIT License · Free & Open-Source Community Edition.<br />
                  GitHub: <a href="https://github.com/mailisilove/EmailNative" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>github.com/mailisilove/EmailNative</a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: LLM */}
          {activeTab === 'llm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  模型供应商 (Provider)
                </label>
                <select
                  value={llm.provider}
                  onChange={(e) => {
                    const prov = e.target.value as any;
                    let model = 'deepseek-chat';
                    if (prov === 'anthropic') model = 'claude-3-5-sonnet-20241022';
                    if (prov === 'openai') model = 'gpt-4o';
                    if (prov === 'ollama') model = 'llama3.2';
                    setLlm({ ...llm, provider: prov, model });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                >
                  <option value="deepseek">DeepSeek (推荐，性价比之王)</option>
                  <option value="anthropic">Anthropic Claude</option>
                  <option value="openai">OpenAI (GPT-4o)</option>
                  <option value="ollama">Ollama (本地私有化部署，免费)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  API Key 密钥
                </label>
                <input
                  type="password"
                  placeholder={llm.provider === 'ollama' ? '本地模式无需填写 Key' : 'sk-...'}
                  value={llm.apiKey}
                  onChange={(e) => setLlm({ ...llm, apiKey: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px'
                  }}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  密钥仅加密保存在本地安全存储（Local-First Keychain），不经过任何第三方服务器。
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  模型版本 (Model)
                </label>
                {llm.provider === 'deepseek' ? (
                  <select
                    value={llm.model}
                    onChange={(e) => setLlm({ ...llm, model: e.target.value })}
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
                    <option value="deepseek-reasoner">deepseek-reasoner (DeepSeek-R1 深度长思维链模型)</option>
                    <option value="deepseek-chat">deepseek-chat (DeepSeek-V3 极速高性价比模型)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={llm.model}
                    onChange={(e) => setLlm({ ...llm, model: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px'
                    }}
                  />
                )}
              </div>

              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '8px'
                }}>
                  <input
                    type="checkbox"
                    checked={llm.enableReasoningStream ?? true}
                    onChange={(e) => setLlm({ ...llm, enableReasoningStream: e.target.checked })}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <span>在邮件界面实时展示 DeepSeek 深度思考过程 (DSCode 体验)</span>
                </label>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  自定义 API Endpoint (可选)
                </label>
                <input
                  type="text"
                  placeholder="https://api.deepseek.com"
                  value={llm.apiEndpoint || ''}
                  onChange={(e) => setLlm({ ...llm, apiEndpoint: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: Cloudflare */}
          {activeTab === 'cloudflare' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 集中归集主邮箱卡片 */}
              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={15} />
                    <span>集中归集主邮箱 (Central Master Forwarding)</span>
                  </label>
                  <span style={{
                    fontSize: '11px',
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

                <input
                  type="email"
                  placeholder="例如: backup@yourdomain.com (选填)"
                  value={cf.masterForwardEmail || ''}
                  onChange={(e) => setCf({ ...cf, masterForwardEmail: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 500
                  }}
                />

                <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
                  填入此邮箱后，所有托管域名（如 <code>support@cutready.app</code>）收到的邮件均会自动静默抄送一份至该地址备份；若留空则仅存入 Cloudflare D1。
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Cloudflare Worker 部署服务地址
                </label>
                <input
                  type="text"
                  placeholder="https://emailnative-mail-gateway.yourname.workers.dev"
                  value={cf.workerDomain}
                  onChange={(e) => setCf({ ...cf, workerDomain: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  访问安全 Token (ADMIN_TOKEN)
                </label>
                <input
                  type="password"
                  placeholder="与 Worker 环境变量 ADMIN_TOKEN 一致"
                  value={cf.apiToken}
                  onChange={(e) => setCf({ ...cf, apiToken: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleTestCloudflare}
                    disabled={cfTesting || !cf.workerDomain}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.2)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      color: '#a5b4fc',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: cfTesting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Cloud size={14} className={cfTesting ? "animate-spin-slow" : ""} />
                    <span>{cfTesting ? '正在探测生产服务...' : '测试生产 Worker 连通性'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleInitDatabase}
                    disabled={initDbLoading || !cf.workerDomain}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      color: '#38bdf8',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: initDbLoading ? 'not-allowed' : 'pointer'
                    }}
                    title="在 Worker 绑定的 D1 数据库中自动建表，无需命令行"
                  >
                    <Database size={14} className={initDbLoading ? "animate-spin-slow" : ""} />
                    <span>{initDbLoading ? '正在初始化...' : '一键初始化 D1 数据表'}</span>
                  </button>
                </div>

                {cfTestResult && (
                  <div style={{
                    fontSize: '12px',
                    color: cfTestResult.ok ? '#34d399' : '#fda4af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '4px'
                  }}>
                    {cfTestResult.ok ? <Check size={14} /> : null}
                    <span>{cfTestResult.message}</span>
                  </div>
                )}

                {initDbMsg && (
                  <div style={{
                    fontSize: '12px',
                    color: initDbMsg.ok ? '#34d399' : '#fda4af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {initDbMsg.ok ? <Check size={14} /> : null}
                    <span>D1 初始化结果: {initDbMsg.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Outbound 发信 */}
          {activeTab === 'outbound' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 温馨提示卡片 */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '10px',
                padding: '14px 16px',
                fontSize: '12px',
                lineHeight: '1.6',
                color: '#c7d2fe'
              }}>
                <div style={{ fontWeight: 600, color: '#fff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="#818cf8" />
                  <span>为什么需要配置发信通道？</span>
                </div>
                <div>
                  <strong>Cloudflare Email Routing</strong> 官方只提供邮件的<strong>“入站转发（只收不发）”</strong>，并没有对外发信的 SMTP 服务器。因此真实向外发信需要搭配出站通道：
                  <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                    <li>
                      <strong>推荐首选：Resend API</strong>（每月 <strong>3,000 封永久免费</strong>，送达率极高，带 DKIM/SPF 防垃圾箱认证）。
                    </li>
                    <li>
                      <strong>步骤</strong>：在 <span style={{ color: '#38bdf8' }}>resend.com</span> 注册并添加你的域名，在 Cloudflare DNS 填入验证记录后，创建 API Key 粘贴于下方即可！
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  发信通道 (Outbound Engine)
                </label>
                <select
                  value={outbound.provider}
                  onChange={(e) => setOutbound({ ...outbound, provider: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                >
                  <option value="resend">Resend API (推荐，每月 3000 封免费)</option>
                  <option value="cloudflare">Cloudflare Worker 代理发信 (需配置 Worker 环境变量)</option>
                </select>
              </div>

              {outbound.provider === 'resend' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>
                        Resend API Key
                      </label>
                      <span style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        fontWeight: 600
                      }}>
                        🔒 本地优先存储 · 零中转
                      </span>
                    </div>
                    <a
                      href="https://resend.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '11px', color: '#818cf8', textDecoration: 'underline' }}
                    >
                      获取免费 Resend API Key ↗
                    </a>
                  </div>
                  <input
                    type="password"
                    placeholder="re_xxxxxxxxxxxxxx"
                    value={outbound.resendApiKey || ''}
                    onChange={(e) => setOutbound({ ...outbound, resendApiKey: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px'
                    }}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    请确保您的域名已在 Resend 控制台通过 DNS 验证，否则邮件发件人将无法通过校验。
                  </div>

                  {/* 一键 DNS (SPF/DKIM/DMARC) 与连通性体检卡片 */}
                  <div style={{
                    marginTop: '14px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={16} color="#38bdf8" />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>
                          连通性与 DNS (SPF / DKIM / DMARC) 自动化诊断
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          一键排查发信是否受阻或进垃圾箱，校验 Resend 域名激活状态
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="输入域名 (如 cutready.app)"
                        value={dnsTestDomain}
                        onChange={(e) => setDnsTestDomain(e.target.value)}
                        style={{
                          width: '160px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(0, 0, 0, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#fff',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowDnsModal(true)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <RefreshCw size={12} />
                        <span>一键体检</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {outbound.provider === 'cloudflare' && (
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                  color: 'var(--text-muted)'
                }}>
                  使用此选项将把发信请求委托给 Cloudflare Worker 的 <code>/api/send_mail</code> 接口。
                  请在 Worker 环境变量中设置 <code>RESEND_API_KEY</code> 秘密凭证。
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Worker 源码 */}
          {activeTab === 'worker_code' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  将此代码部署至 Cloudflare Workers 即可完成全部后端收信搭建
                </span>
                <button
                  onClick={handleCopyWorkerCode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: copiedCode ? '#10b981' : 'var(--accent-primary)',
                    color: '#fff'
                  }}
                >
                  {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedCode ? t('settings.copiedCode') : t('settings.copyCode')}</span>
                </button>
              </div>
              <pre style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: '#93c5fd',
                overflowX: 'auto',
                maxHeight: '300px'
              }}>
                {workerScriptCode}
              </pre>
            </div>
          )}
        </div>

        {/* 底部确认栏 */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', color: 'var(--text-muted)' }}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSaveAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 20px',
              borderRadius: '8px',
              background: savedSuccess ? '#10b981' : 'var(--accent-primary)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)'
            }}
          >
            {savedSuccess ? <Check size={14} /> : null}
            <span>{savedSuccess ? t('common.saved') : t('settings.saveAll')}</span>
          </button>
        </div>
      </div>

      {/* DNS 连通性与健康度诊断弹窗 */}
      <DnsInspectorModal
        domain={dnsTestDomain}
        resendApiKey={outbound.resendApiKey}
        isOpen={showDnsModal}
        onClose={() => setShowDnsModal(false)}
      />
    </div>
  );
};
