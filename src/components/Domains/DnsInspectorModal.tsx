import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  Lock, 
  X 
} from 'lucide-react';
import { DnsInspector, DomainHealthReport } from '../../core/email-gateway/dns-inspector';
import { useI18n } from '../../core/i18n/I18nContext';

interface DnsInspectorModalProps {
  domain: string;
  resendApiKey?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DnsInspectorModal: React.FC<DnsInspectorModalProps> = ({
  domain,
  resendApiKey,
  isOpen,
  onClose,
}) => {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DomainHealthReport | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const runInspection = async () => {
    if (!domain) return;
    setLoading(true);
    try {
      const res = await DnsInspector.inspectDomain(domain, resendApiKey);
      setReport(res);
    } catch (err) {
      console.error('DNS inspection failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && domain) {
      runInspection();
    }
  }, [isOpen, domain]);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: '#12151e',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}>
                {t('dnsInspector.title')}
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                {domain}
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              {t('dnsInspector.subtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={runInspection}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '6px 12px',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>{loading ? t('dnsInspector.reinspecting') : t('dnsInspector.reinspect')}</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* 隐私与安全声明 Banner */}
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '12px',
            lineHeight: 1.5,
            color: '#c7d2fe',
          }}>
            <Lock size={16} style={{ marginTop: '2px', flexShrink: 0, color: '#818cf8' }} />
            <div>
              <strong>{t('settings.zeroRelayTitle')}</strong>：
              {t('dnsInspector.zeroRelayNotice')}
            </div>
          </div>

          {/* 综合得分与概览卡片 */}
          {report && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderRadius: '12px',
              background: report.score >= 80 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.02) 100%)'
                : 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.02) 100%)',
              border: report.score >= 80 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
            }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('dnsInspector.healthScore')}</div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: report.score >= 80 ? '#34d399' : report.score >= 50 ? '#fbbf24' : '#f87171',
                  marginTop: '2px'
                }}>
                  {report.score} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-dim)' }}>/ 100</span>
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '12px' }}>
                <div style={{
                  fontWeight: 600,
                  color: report.allPassed ? '#34d399' : '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  justifyContent: 'flex-end'
                }}>
                  {report.allPassed ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{report.allPassed ? t('dnsInspector.scoreExcellent') : t('dnsInspector.scoreIssues')}</span>
                </div>
                <div style={{ color: 'var(--text-dim)', marginTop: '4px' }}>
                  {new Date(report.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}

          {/* 逐项检测卡片 */}
          {loading && !report ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px auto', display: 'block', color: '#38bdf8' }} />
              正在通过 DNS-over-HTTPS 实时解析 DNS 记录与认证状态...
            </div>
          ) : report ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {report.checks.map((item) => {
                const isPassed = item.status === 'passed';
                const isWarn = item.status === 'warning';
                const isFailed = item.status === 'failed';

                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.025)',
                      border: isPassed 
                        ? '1px solid rgba(16, 185, 129, 0.25)'
                        : isWarn
                        ? '1px solid rgba(245, 158, 11, 0.3)'
                        : '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isPassed && <CheckCircle2 size={16} color="#34d399" />}
                        {isWarn && <AlertTriangle size={16} color="#fbbf24" />}
                        {isFailed && <XCircle size={16} color="#f87171" />}
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                          {item.name}
                        </span>
                      </div>

                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        background: isPassed ? 'rgba(16, 185, 129, 0.15)' : isWarn ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isPassed ? '#34d399' : isWarn ? '#fbbf24' : '#f87171',
                      }}>
                        {isPassed ? '已达标' : isWarn ? '建议优化' : '未就绪'}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#e2e8f0', marginBottom: '6px' }}>
                      {item.title}
                    </div>

                    {item.currentValue && (
                      <div style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        background: 'rgba(0, 0, 0, 0.4)',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        color: '#94a3b8',
                        wordBreak: 'break-all',
                        marginBottom: '8px',
                      }}>
                        当前解析值: {item.currentValue}
                      </div>
                    )}

                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      💡 {item.suggestion}
                    </div>

                    {item.expectedValue && !isPassed && (
                      <div style={{
                        marginTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(56, 189, 248, 0.08)',
                        border: '1px dashed rgba(56, 189, 248, 0.3)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                      }}>
                        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                          建议配置值: {item.expectedValue}
                        </div>
                        <button
                          onClick={() => handleCopy(item.id, item.expectedValue!)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(56, 189, 248, 0.2)',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            color: '#38bdf8',
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          {copiedKey === item.id ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedKey === item.id ? '已复制' : '复制'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a
              href="https://dash.cloudflare.com"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#38bdf8', textDecoration: 'none' }}
            >
              <span>Cloudflare 控制台</span>
              <ExternalLink size={12} />
            </a>
            <a
              href="https://resend.com/domains"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#818cf8', textDecoration: 'none' }}
            >
              <span>Resend 域名控制台</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px 18px',
              borderRadius: '8px',
              background: 'var(--accent-primary)',
              color: '#fff',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            完成排查
          </button>
        </div>
      </div>
    </div>
  );
};
