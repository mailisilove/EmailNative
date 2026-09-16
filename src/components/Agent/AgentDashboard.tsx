import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  BrainCircuit, 
  Send, 
  Coins, 
  Zap,
  Activity,
  Square
} from 'lucide-react';
import { AgentPipelineRun, LLMConfig } from '../../core/types';
import { Settings, Sliders, Cpu, CheckCircle } from 'lucide-react';
import { useI18n } from '../../core/i18n/I18nContext';

interface AgentDashboardProps {
  runs: AgentPipelineRun[];
  llmConfig: LLMConfig;
  totalTokens: number;
  totalCost: number;
  onClearRuns: () => void;
  onOpenSettings?: () => void;
  isMobile?: boolean;
  isProcessing?: boolean;
  onEmergencyStop?: () => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({
  runs,
  llmConfig,
  totalTokens,
  totalCost,
  onClearRuns,
  onOpenSettings,
  isMobile = false,
  isProcessing = false,
  onEmergencyStop,
}) => {
  const { t } = useI18n();
  return (
    <div style={{
      flex: 1,
      height: '100%',
      overflowY: 'auto',
      padding: isMobile ? '16px' : '24px 32px',
      background: 'var(--bg-surface)'
    }}>
      {/* 顶部标题栏 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '20px' : '22px',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={isMobile ? 20 : 24} color="#a855f7" />
            <span>{t('agent.dashboardTitle')}</span>
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t('agent.dashboardSubtitle')}
          </p>
        </div>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: '#c7d2fe',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <Settings size={14} />
            <span>{t('agent.settingsBtn')}</span>
          </button>
        )}
      </div>

      {/* 实时研判中提示条与紧急终止断路器 */}
      {isProcessing && onEmergencyStop && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          marginBottom: '20px',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          boxShadow: '0 0 16px rgba(239, 68, 68, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#f87171',
              boxShadow: '0 0 10px #ef4444'
            }} className="animate-pulse" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fca5a5' }}>
                {t('agent.activeAnalysis')}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(254, 202, 202, 0.8)' }}>
                {t('settings.costProtectionNotice')}
              </div>
            </div>
          </div>
          <button
            onClick={onEmergencyStop}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.3)',
              border: '1px solid rgba(239, 68, 68, 0.6)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Square size={12} fill="#fff" />
            <span>{t('agent.emergencyStop')}</span>
          </button>
        </div>
      )}

      {/* 核心指标统计：花费、任务总数、Token (自适应移动端) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {/* 累计花费 */}
        <div style={{
          background: 'rgba(18, 26, 48, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Coins size={19} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>{t('agent.totalCost')} (USD)</div>
            <div style={{ fontSize: isMobile ? '17px' : '20px', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
              ${totalCost.toFixed(5)}
            </div>
          </div>
        </div>

        {/* 任务总数 */}
        <div style={{
          background: 'rgba(18, 26, 48, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Activity size={19} color="#34d399" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>{t('agent.totalRuns')}</div>
            <div style={{ fontSize: isMobile ? '17px' : '20px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
              {runs.length}
            </div>
          </div>
        </div>

        {/* 累计处理 Token */}
        <div style={{
          background: 'rgba(18, 26, 48, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          gridColumn: isMobile ? 'span 2' : 'auto'
        }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={19} color="#818cf8" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>{t('agent.totalTokens')}</div>
            <div style={{ fontSize: isMobile ? '17px' : '20px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
              {totalTokens.toLocaleString()} <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Tokens</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agent 调用设置与设置项板块 */}
      <div style={{
        background: 'rgba(18, 26, 48, 0.6)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        padding: isMobile ? '14px 16px' : '18px 20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#e0e7ff' }}>
            <Sliders size={16} color="#818cf8" />
            <span>Agent 调用设置与参数</span>
          </div>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              style={{ fontSize: '11px', color: '#a5b4fc', textDecoration: 'underline' }}
            >
              更改 API 配置
            </button>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '10px',
        }}>
          {/* 当前模型 */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '10px 12px',
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '3px' }}>推理模型引擎</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={14} color="#a855f7" />
              <span>{llmConfig.model}</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              供应商: {llmConfig.provider.toUpperCase()}
            </div>
          </div>

          {/* 自动化响应模式 */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '10px 12px',
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '3px' }}>决策模式</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#38bdf8" />
              <span>人机协同 (Human-in-the-loop)</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              AI 智能草拟 + 人工一键发送
            </div>
          </div>

          {/* API 密钥状态 */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '10px 12px',
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '3px' }}>API 密钥接入</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} color="#10b981" />
              <span>{llmConfig.apiKey ? '已配置 (sk-...)' : '未配置 (将使用模拟)'}</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              {llmConfig.apiEndpoint || 'https://api.deepseek.com'}
            </div>
          </div>
        </div>
      </div>

      {/* 四智能体流水线架构 */}
      <div style={{
        background: 'rgba(18, 26, 48, 0.6)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        padding: isMobile ? '14px 16px' : '18px 20px',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '12px', letterSpacing: '0.04em' }}>
          四智能体协同流水线架构
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '10px',
        }}>
          {/* Stage 1 */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '10px',
            padding: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <ShieldCheck size={16} color="#818cf8" />
              <span style={{ fontSize: '9px', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '1px 5px', borderRadius: '4px' }}>Stage 1</span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>安全与垃圾研判</div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>甄别钓鱼与信誉</div>
          </div>

          {/* Stage 2 */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '10px',
            padding: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <BrainCircuit size={16} color="#38bdf8" />
              <span style={{ fontSize: '9px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '1px 5px', borderRadius: '4px' }}>Stage 2</span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>实体与验证码提取</div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>毫秒级提取 2FA/账单</div>
          </div>

          {/* Stage 3 */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            borderRadius: '10px',
            padding: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <Sparkles size={16} color="#c084fc" />
              <span style={{ fontSize: '9px', color: '#c084fc', background: 'rgba(168, 85, 247, 0.12)', padding: '1px 5px', borderRadius: '4px' }}>Stage 3</span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>智能草拟答复</div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>商务语气深度拟复</div>
          </div>

          {/* Stage 4 */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '10px',
            padding: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <Send size={16} color="#34d399" />
              <span style={{ fontSize: '9px', color: '#34d399', background: 'rgba(16, 185, 129, 0.12)', padding: '1px 5px', borderRadius: '4px' }}>Stage 4</span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>动作与审批闭环</div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>高亮提示与一键发送</div>
          </div>
        </div>
      </div>

      {/* 实时处理历史流 (Pipeline Runs Log) */}
      <div style={{
        background: 'rgba(18, 26, 48, 0.5)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '20px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
            最近自动化处理轨迹 ({runs.length})
          </div>
          {runs.length > 0 && (
            <button
              onClick={onClearRuns}
              style={{ fontSize: '12px', color: 'var(--text-dim)' }}
            >
              清空记录
            </button>
          )}
        </div>

        {runs.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
            暂无运行轨迹。点击顶部“模拟来信”触发新邮件分析。
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {runs.map(r => (
              <div
                key={r.runId}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '14px 18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: r.status === 'success' ? '#10b981' : (r.status === 'needs_approval' ? '#f59e0b' : (r.status === 'stopped' ? '#ef4444' : '#38bdf8'))
                    }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{r.emailSubject}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>({r.domainAddress})</span>
                    {r.status === 'stopped' && (
                      <span style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        fontWeight: 600,
                      }}>
                        {t('agent.statusStopped')}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{r.tokensConsumed} Tok</span>
                    <span>·</span>
                    <span style={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}>${r.costEstimateUsd.toFixed(5)}</span>
                    <span>·</span>
                    <span>{new Date(r.startedAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* 4 步执行产物 */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {r.steps.map(s => (
                    <div
                      key={s.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <span style={{ color: '#818cf8', fontWeight: 600 }}>{s.name}: </span>
                      <span>{s.output || '处理中'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
