import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { EmailList } from './components/Email/EmailList';
import { EmailDetail } from './components/Email/EmailDetail';
import { EmailComposer } from './components/Email/EmailComposer';
import { DomainManager } from './components/Domains/DomainManager';
import { AgentDashboard } from './components/Agent/AgentDashboard';
import { SettingsModal } from './components/Settings/SettingsModal';
import { MobileTabBar } from './components/Layout/MobileTabBar';
import { MobileDrawer } from './components/Layout/MobileDrawer';

import { 
  EmailMessage, 
  ManagedDomain, 
  DomainAlias,
  AgentPipelineRun, 
  LLMConfig, 
  CloudflareConfig, 
  OutboundMailConfig, 
  AutomationLevel,
  DomainProtocolType,
  TraditionalIMAPConfig
} from './core/types';
import { LocalStorageDB } from './core/store/local-storage-db';
import { PipelineCoordinator } from './core/orchestrator/pipeline-coordinator';
import { OutboundSender } from './core/email-gateway/sender';
import { generateRandomMockEmail } from './core/email-gateway/mock-mail-generator';
import { CloudflareWorkerClient } from './core/email-gateway/cf-worker-client';

export function App() {
  // 核心数据状态
  const [emails, setEmails] = useState<EmailMessage[]>(() => LocalStorageDB.getEmails());
  const [domains, setDomains] = useState<ManagedDomain[]>(() => LocalStorageDB.getDomains());
  const [pipelineRuns, setPipelineRuns] = useState<AgentPipelineRun[]>(() => LocalStorageDB.getPipelineRuns());
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(() => LocalStorageDB.getLLMConfig());
  const [cfConfig, setCfConfig] = useState<CloudflareConfig>(() => LocalStorageDB.getCFConfig());
  const [outboundConfig, setOutboundConfig] = useState<OutboundMailConfig>(() => LocalStorageDB.getOutboundConfig());

  // UI 导航与选择状态
  const [currentView, setCurrentView] = useState<'inbox' | 'domains' | 'agent' | 'analytics'>('inbox');
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [selectedAliasId, setSelectedAliasId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(emails[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');

  // 移动端响应式与抽屉导航
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  });
  const [mobileActiveEmail, setMobileActiveEmail] = useState<EmailMessage | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 弹窗与加载态
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProcessingAgent, setIsProcessingAgent] = useState(false);
  const [isSyncingProduction, setIsSyncingProduction] = useState(false);

  // 引擎单例
  const coordinator = useMemo(() => new PipelineCoordinator(llmConfig), [llmConfig]);
  const sender = useMemo(() => new OutboundSender(outboundConfig, cfConfig), [outboundConfig, cfConfig]);

  // 选中的域名与别名实体
  const selectedDomain = useMemo(() => {
    return domains.find(d => d.id === selectedDomainId);
  }, [domains, selectedDomainId]);

  const selectedAlias = useMemo(() => {
    if (!selectedDomain || !selectedAliasId) return null;
    return selectedDomain.aliases.find(a => a.id === selectedAliasId) || null;
  }, [selectedDomain, selectedAliasId]);

  // 各分类邮件数量统计
  const categoryCounts = useMemo(() => {
    let unread = 0;
    let starred = 0;
    let verification = 0;
    let transactional = 0;
    let business = 0;

    emails.forEach(e => {
      if (!e.isRead) unread++;
      if (e.isStarred) starred++;
      if (e.agentInsight?.category === 'verification') verification++;
      if (e.agentInsight?.category === 'transactional') transactional++;
      if (e.agentInsight?.category === 'business') business++;
    });

    return {
      all: emails.length,
      unread,
      starred,
      verification,
      transactional,
      business
    };
  }, [emails]);

  // 邮件过滤与检索
  const filteredEmails = useMemo(() => {
    return emails.filter(m => {
      // 分类过滤
      if (selectedCategory === 'unread' && m.isRead) return false;
      if (selectedCategory === 'starred' && !m.isStarred) return false;
      if (selectedCategory === 'verification' && m.agentInsight?.category !== 'verification') return false;
      if (selectedCategory === 'transactional' && m.agentInsight?.category !== 'transactional') return false;
      if (selectedCategory === 'business' && m.agentInsight?.category !== 'business') return false;

      // 域名过滤
      if (selectedDomain && !m.toAddress.endsWith(`@${selectedDomain.domain}`)) {
        return false;
      }
      // 别名过滤
      if (selectedAlias && m.toAddress !== selectedAlias.fullAddress) {
        return false;
      }
      // 搜索过滤
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText = (m.subject + ' ' + m.snippet + ' ' + m.fromAddress + ' ' + (m.agentInsight?.verificationCode?.code || '')).toLowerCase();
        return matchText.includes(q);
      }
      return true;
    });
  }, [emails, selectedDomain, selectedAlias, selectedCategory, searchQuery]);

  const selectedEmail = useMemo(() => {
    return emails.find(e => e.id === selectedEmailId) || null;
  }, [emails, selectedEmailId]);

  const unreadCount = useMemo(() => {
    return emails.filter(e => !e.isRead).length;
  }, [emails]);

  // 各别名专属收件箱未读数
  const unreadCountsByAlias = useMemo(() => {
    const counts: Record<string, number> = {};
    emails.forEach(e => {
      if (!e.isRead) {
        counts[e.toAddress] = (counts[e.toAddress] || 0) + 1;
      }
    });
    return counts;
  }, [emails]);

  // 各域名汇总未读数
  const unreadCountsByDomain = useMemo(() => {
    const counts: Record<string, number> = {};
    emails.forEach(e => {
      if (!e.isRead) {
        const domPart = e.toAddress.split('@')[1];
        if (domPart) {
          counts[domPart] = (counts[domPart] || 0) + 1;
        }
      }
    });
    return counts;
  }, [emails]);

  // 当前激活收件箱标题 (融合域名与分类状态)
  const currentInboxTitle = useMemo(() => {
    const categoryLabels: Record<string, string> = {
      unread: '未读邮件',
      starred: '星标邮件',
      verification: '验证码',
      transactional: '财务账单',
      business: '重要沟通',
    };

    const catPrefix = categoryLabels[selectedCategory] ? `${categoryLabels[selectedCategory]} · ` : '';

    if (selectedAlias) {
      return `${catPrefix}${selectedAlias.displayName || selectedAlias.prefix}`;
    }
    if (selectedDomain) {
      return `${catPrefix}${selectedDomain.displayName || selectedDomain.domain}`;
    }
    return `${catPrefix}${categoryLabels[selectedCategory] || '全部邮件'}`;
  }, [selectedDomain, selectedAlias, selectedCategory]);

  // 提取特定邮件对应的域名知识库上下文与签名
  const getEmailDomainContext = (email: EmailMessage) => {
    const domPart = email.toAddress.split('@')[1];
    const dom = domains.find(d => d.domain === domPart);
    const alias = dom?.aliases.find(a => a.fullAddress === email.toAddress);

    return {
      aiPersona: alias?.aiPersona || dom?.aiPersona,
      signature: alias?.signature || dom?.signature,
      displayName: alias?.displayName || dom?.displayName || domPart,
    };
  };

  const totalTokensConsumed = useMemo(() => {
    return pipelineRuns.reduce((sum, r) => sum + r.tokensConsumed, 0);
  }, [pipelineRuns]);

  const totalCostUsd = useMemo(() => {
    return pipelineRuns.reduce((sum, r) => sum + r.costEstimateUsd, 0);
  }, [pipelineRuns]);

  // ---------------- 动作处理 ----------------

  // 标记邮件已读与选中
  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
    const updated = LocalStorageDB.updateEmail(id, { isRead: true });
    setEmails(updated);
    if (isMobile) {
      const found = updated.find(e => e.id === id) || null;
      setMobileActiveEmail(found);
    }
  };

  // 收藏与取消收藏
  const handleToggleStar = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const mail = emails.find(m => m.id === id);
    if (!mail) return;
    const updated = LocalStorageDB.updateEmail(id, { isStarred: !mail.isStarred });
    setEmails(updated);
  };

  // 归档邮件
  const handleArchive = (id: string) => {
    const updated = LocalStorageDB.updateEmail(id, { isArchived: true });
    setEmails(updated);
  };

  // 触发 Agent 研判特定邮件（注入专属域名知识库）
  const handleRunAgentForEmail = async (email: EmailMessage, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsProcessingAgent(true);
    const domainCtx = getEmailDomainContext(email);
    try {
      const { insight, run } = await coordinator.runPipeline(
        email, 
        (interimRun) => {
          setPipelineRuns(prev => [interimRun, ...prev.filter(r => r.runId !== interimRun.runId)]);
        },
        domainCtx
      );

      const updatedRuns = LocalStorageDB.addPipelineRun(run);
      setPipelineRuns(updatedRuns);

      const updatedEmails = LocalStorageDB.updateEmail(email.id, {
        agentProcessed: true,
        agentInsight: insight,
      });
      setEmails(updatedEmails);
    } finally {
      setIsProcessingAgent(false);
    }
  };

  // 模拟来信到达：自动注入 Agent 流水线与业务知识库
  const handleSimulateInbound = async () => {
    const targetDomain = selectedDomain ? selectedDomain.domain : (domains[0]?.domain || 'cutready.app');
    const targetAlias = selectedAlias ? selectedAlias.fullAddress : undefined;
    const newMail = generateRandomMockEmail(targetDomain, targetAlias);

    // 首先入库
    const withNew = LocalStorageDB.addEmail(newMail);
    setEmails(withNew);
    setSelectedEmailId(newMail.id);

    // 启动 Agent 自动处理流水线
    setIsProcessingAgent(true);
    const domainCtx = getEmailDomainContext(newMail);
    try {
      const { insight, run } = await coordinator.runPipeline(
        newMail, 
        (interimRun) => {
          setPipelineRuns(prev => [interimRun, ...prev.filter(r => r.runId !== interimRun.runId)]);
        },
        domainCtx
      );

      const updatedRuns = LocalStorageDB.addPipelineRun(run);
      setPipelineRuns(updatedRuns);

      const finalUpdated = LocalStorageDB.updateEmail(newMail.id, {
        agentProcessed: true,
        agentInsight: insight,
      });
      setEmails(finalUpdated);
    } finally {
      setIsProcessingAgent(false);
    }
  };

  // 从 Cloudflare 生产 Worker 同步真实生产邮件
  const handleSyncProduction = async () => {
    if (!cfConfig.workerDomain) {
      alert('请先在设置中填写 Cloudflare Worker 生产域名地址');
      setIsSettingsOpen(true);
      return;
    }

    setIsSyncingProduction(true);
    try {
      const client = new CloudflareWorkerClient(cfConfig.workerDomain, cfConfig.apiToken);
      const knownIds = new Set(emails.map(e => e.id));
      const liveMails = await client.syncProductionEmails(knownIds);

      if (liveMails.length === 0) {
        const health = await client.checkHealth();
        if (health.ok) {
          alert('✅ 已连通 Cloudflare 生产服务！当前暂无未同步的最新邮件。');
        } else {
          alert(`⚠️ Cloudflare 连通性提示: ${health.message}`);
        }
        return;
      }

      let currentEmails = emails;
      let currentDomains = domains;
      for (const newMail of liveMails) {
        currentEmails = LocalStorageDB.addEmail(newMail);
        setEmails(currentEmails);

        // 自动识别新域名并加入管理列表
        const domPart = newMail.toAddress.split('@')[1];
        if (domPart && !currentDomains.some(d => d.domain === domPart)) {
          currentDomains = LocalStorageDB.addDomain(domPart, 'cloudflare');
          setDomains(currentDomains);
        }

        // 送入 DeepSeek-R1 流水线研判（注入对应域名知识库）
        try {
          const domainCtx = getEmailDomainContext(newMail);
          const { insight, run } = await coordinator.runPipeline(
            newMail, 
            (interimRun) => {
              setPipelineRuns(prev => [interimRun, ...prev.filter(r => r.runId !== interimRun.runId)]);
            },
            domainCtx
          );
          LocalStorageDB.addPipelineRun(run);
          currentEmails = LocalStorageDB.updateEmail(newMail.id, {
            agentProcessed: true,
            agentInsight: insight,
          });
          setEmails(currentEmails);
        } catch (err) {
          console.error('Agent pipeline error for live mail:', err);
        }
      }

      alert(`🎉 成功从 Cloudflare 同步 ${liveMails.length} 封生产邮件，DeepSeek-R1 已完成自动研判！`);
    } catch (err: any) {
      alert(`⚠️ Cloudflare 同步提示: ${err?.message || '网络连接超时'}`);
    } finally {
      setIsSyncingProduction(false);
    }
  };

  // 监听 macOS 原生菜单事件 (Cmd+N, Cmd+T, Cmd+, 等)
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.onMenuTrigger) {
      (window as any).electronAPI.onMenuTrigger((action: string) => {
        if (action === 'open-settings') setIsSettingsOpen(true);
        if (action === 'new-email') setIsComposerOpen(true);
        if (action === 'simulate-mail') handleSimulateInbound();
      });
    }
  }, []);

  // 发送回复（严格锁定原收件地址为发信人，自动附加产品显示名）
  const handleSendReply = async (
    toAddress: string, 
    subject: string, 
    bodyText: string, 
    fromAddress?: string, 
    fromName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!selectedEmail) return { success: false, error: '未选择邮件' };
    const actualFrom = fromAddress || selectedEmail.toAddress;
    const ctx = getEmailDomainContext(selectedEmail);
    const res = await sender.send({
      fromAddress: actualFrom,
      fromName: fromName || ctx.displayName,
      toAddress,
      subject,
      bodyText,
    });
    return { success: res.success, error: res.error };
  };

  // 撰写出站邮件
  const handleSendNewMail = async (
    from: string, 
    to: string, 
    subject: string, 
    body: string, 
    fromName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await sender.send({
      fromAddress: from,
      fromName: fromName,
      toAddress: to,
      subject,
      bodyText: body,
    });
    return { success: res.success, error: res.error };
  };

  // 域名与别名管理操作
  const handleAddDomain = (domainName: string, provider: DomainProtocolType = 'cloudflare', traditionalConfig?: TraditionalIMAPConfig) => {
    const updated = LocalStorageDB.addDomain(domainName, provider, traditionalConfig);
    setDomains(updated);
  };

  const handleDeleteDomain = (domainId: string, deleteEmails = false) => {
    const updated = LocalStorageDB.deleteDomain(domainId, deleteEmails);
    setDomains(updated);

    if (deleteEmails) {
      const refreshedEmails = LocalStorageDB.getEmails();
      setEmails(refreshedEmails);
      if (selectedEmail && selectedEmail.domainId === domainId) {
        setSelectedEmailId(refreshedEmails[0]?.id || null);
      }
    }

    if (selectedDomainId === domainId) {
      setSelectedDomainId(null);
      setSelectedAliasId(null);
    }
  };

  const handleUpdateDomain = (domainId: string, updates: Partial<ManagedDomain>) => {
    const updated = LocalStorageDB.updateDomain(domainId, updates);
    setDomains(updated);
  };

  const handleAddAlias = (domainId: string, prefix: string, description: string) => {
    const updated = LocalStorageDB.addAlias(domainId, prefix, description);
    setDomains(updated);
  };

  const handleUpdateAlias = (domainId: string, aliasId: string, updates: Partial<DomainAlias>) => {
    const updated = LocalStorageDB.updateAlias(domainId, aliasId, updates);
    setDomains(updated);
  };

  const handleDeleteAlias = (domainId: string, aliasId: string) => {
    const updated = LocalStorageDB.deleteAlias(domainId, aliasId);
    setDomains(updated);
    if (selectedAliasId === aliasId) {
      setSelectedAliasId(null);
    }
  };

  const handleToggleAliasAutoReply = (domainId: string, aliasId: string) => {
    const updated = domains.map(d => {
      if (d.id !== domainId) return d;
      return {
        ...d,
        aliases: d.aliases.map(a => a.id === aliasId ? { ...a, autoReplyEnabled: !a.autoReplyEnabled } : a)
      };
    });
    LocalStorageDB.saveDomains(updated);
    setDomains(updated);
  };

  const handleChangeDomainAutomationLevel = (domainId: string, level: AutomationLevel) => {
    const updated = domains.map(d => (d.id === domainId ? { ...d, defaultAutomationLevel: level } : d));
    LocalStorageDB.saveDomains(updated);
    setDomains(updated);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: 'var(--bg-main)',
      overflow: 'hidden'
    }}>
      {/* 桌面端专属侧边栏 */}
      {!isMobile && (
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          domains={domains}
          selectedDomainId={selectedDomainId}
          setSelectedDomainId={setSelectedDomainId}
          selectedAliasId={selectedAliasId}
          setSelectedAliasId={setSelectedAliasId}
          unreadCount={unreadCount}
          unreadCountsByAlias={unreadCountsByAlias}
          unreadCountsByDomain={unreadCountsByDomain}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onNewEmail={() => setIsComposerOpen(true)}
        />
      )}

      {/* 主工作区 */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        overflow: 'hidden',
        paddingBottom: isMobile ? 'calc(58px + env(safe-area-inset-bottom, 0px))' : '0' 
      }}>
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedDomain={selectedDomain}
          selectedAliasPrefix={selectedAlias?.prefix}
          totalTokensConsumed={totalTokensConsumed}
          totalCostUsd={totalCostUsd}
          isProcessing={isProcessingAgent}
          onSimulateInbound={handleSimulateInbound}
          onRefresh={() => setEmails(LocalStorageDB.getEmails())}
          onSyncProduction={handleSyncProduction}
          isSyncingProduction={isSyncingProduction}
          isMobile={isMobile}
          onNewEmail={() => setIsComposerOpen(true)}
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        />

        {/* 视图切换 */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {currentView === 'inbox' && (
            isMobile ? (
              // 移动端单栏推栈：详情或列表
              mobileActiveEmail ? (
                <EmailDetail
                  email={mobileActiveEmail}
                  onBack={() => setMobileActiveEmail(null)}
                  onSendReply={handleSendReply}
                  onToggleStar={handleToggleStar}
                  onArchive={(id) => {
                    handleArchive(id);
                    setMobileActiveEmail(null);
                  }}
                  onRunAgent={handleRunAgentForEmail}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              ) : (
                <EmailList
                  isMobile={true}
                  emails={filteredEmails}
                  selectedEmailId={selectedEmailId}
                  onSelectEmail={handleSelectEmail}
                  onToggleStar={handleToggleStar}
                  onRunAgentForEmail={handleRunAgentForEmail}
                  currentInboxTitle={currentInboxTitle}
                />
              )
            ) : (
              // 桌面端经典双栏
              <>
                <EmailList
                  emails={filteredEmails}
                  selectedEmailId={selectedEmailId}
                  onSelectEmail={handleSelectEmail}
                  onToggleStar={handleToggleStar}
                  onRunAgentForEmail={handleRunAgentForEmail}
                  currentInboxTitle={currentInboxTitle}
                />
                <EmailDetail
                  email={selectedEmail}
                  onSendReply={handleSendReply}
                  onToggleStar={handleToggleStar}
                  onArchive={handleArchive}
                  onRunAgent={handleRunAgentForEmail}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              </>
            )
          )}

          {currentView === 'domains' && (
            <DomainManager
              domains={domains}
              masterForwardEmail={cfConfig.masterForwardEmail || ''}
              onUpdateMasterForwardEmail={(newEmail) => {
                const updated = { ...cfConfig, masterForwardEmail: newEmail };
                setCfConfig(updated);
                LocalStorageDB.saveCFConfig(updated);
              }}
              onAddDomain={handleAddDomain}
              onDeleteDomain={handleDeleteDomain}
              onUpdateDomain={handleUpdateDomain}
              onAddAlias={handleAddAlias}
              onUpdateAlias={handleUpdateAlias}
              onDeleteAlias={handleDeleteAlias}
              onToggleAliasAutoReply={handleToggleAliasAutoReply}
              onChangeDomainAutomationLevel={handleChangeDomainAutomationLevel}
              isMobile={isMobile}
            />
          )}

          {currentView === 'agent' && (
            <AgentDashboard
              runs={pipelineRuns}
              llmConfig={llmConfig}
              totalTokens={totalTokensConsumed}
              totalCost={totalCostUsd}
              onClearRuns={() => {
                LocalStorageDB.saveEmails([]);
                setPipelineRuns([]);
              }}
              onOpenSettings={() => setIsSettingsOpen(true)}
              isMobile={isMobile}
            />
          )}
        </div>
      </div>

      {/* 移动端 iOS 底部导航 TabBar */}
      {isMobile && (
        <MobileTabBar
          currentTab={currentView === 'domains' || currentView === 'agent' ? currentView : 'inbox'}
          onTabChange={(tab) => {
            if (tab === 'settings') {
              setIsSettingsOpen(true);
            } else {
              setCurrentView(tab as any);
              setMobileActiveEmail(null);
            }
          }}
          unreadCount={unreadCount}
        />
      )}

      {/* 移动端左侧抽屉侧边栏 (选择域名与分类筛选) */}
      {isMobile && (
        <MobileDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          domains={domains}
          selectedDomainId={selectedDomainId}
          onSelectDomain={setSelectedDomainId}
          selectedAliasId={selectedAliasId}
          onSelectAlias={setSelectedAliasId}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          unreadCount={unreadCount}
          unreadCountsByDomain={unreadCountsByDomain}
          unreadCountsByAlias={unreadCountsByAlias}
          categoryCounts={categoryCounts}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onNewEmail={() => setIsComposerOpen(true)}
        />
      )}

      {/* 写信弹窗 */}
      <EmailComposer
        domains={domains}
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSend={handleSendNewMail}
        onOpenSettings={() => setIsSettingsOpen(true)}
        defaultSenderAddress={selectedAlias?.fullAddress || (selectedDomain ? (selectedDomain.aliases[0]?.fullAddress || `support@${selectedDomain.domain}`) : undefined)}
      />

      {/* 设置弹窗 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        llmConfig={llmConfig}
        onSaveLLMConfig={(cfg) => {
          setLlmConfig(cfg);
          LocalStorageDB.saveLLMConfig(cfg);
        }}
        cfConfig={cfConfig}
        onSaveCFConfig={(cfg) => {
          setCfConfig(cfg);
          LocalStorageDB.saveCFConfig(cfg);
        }}
        outboundConfig={outboundConfig}
        onSaveOutboundConfig={(cfg) => {
          setOutboundConfig(cfg);
          LocalStorageDB.saveOutboundConfig(cfg);
        }}
      />
    </div>
  );
}
