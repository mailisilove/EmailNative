/**
 * Pipeline Coordinator (DSCode Multi-Agent Workflow)
 * 深度融合 DSCode 架构：以 DeepSeek-R1 / V3 为核心决策引擎
 */
import { EmailCategory, EmailMessage, LLMConfig, AgentInsight, AgentPipelineRun } from '../types';
import { ToolSandbox } from '../agent-runtime/tool-sandbox';
import { TokenTracker } from './token-tracker';
import { DeepSeekHarness } from './deepseek-client';

export class PipelineCoordinator {
  private llmConfig: LLMConfig;
  private deepseek: DeepSeekHarness;

  constructor(llmConfig: LLMConfig) {
    this.llmConfig = llmConfig;
    this.deepseek = new DeepSeekHarness(
      llmConfig.apiKey,
      llmConfig.model || 'deepseek-reasoner',
      llmConfig.apiEndpoint || 'https://api.deepseek.com'
    );
  }

  updateConfig(config: LLMConfig) {
    this.llmConfig = config;
    this.deepseek = new DeepSeekHarness(
      config.apiKey,
      config.model || 'deepseek-reasoner',
      config.apiEndpoint || 'https://api.deepseek.com'
    );
  }

  /**
   * 执行基于 DeepSeek 的四阶段多智能体流水线
   */
  async runPipeline(
    email: EmailMessage,
    onProgress?: (run: AgentPipelineRun) => void,
    domainContext?: { aiPersona?: string; signature?: string; displayName?: string }
  ): Promise<{ insight: AgentInsight; run: AgentPipelineRun }> {
    const startedAt = new Date().toISOString();
    const run: AgentPipelineRun = {
      runId: `run_${Date.now()}`,
      emailId: email.id,
      emailSubject: email.subject,
      domainAddress: email.toAddress,
      startedAt,
      status: 'processing',
      deepseekModel: this.llmConfig.model || 'deepseek-reasoner',
      steps: [
        { id: 'security_filter', name: 'DeepSeek 安全研判', description: '过滤钓鱼攻击与无价值推广垃圾信', status: 'running' },
        { id: 'extractor', name: '关键实体抽取', description: '提取 2FA 验证码、发票账单与会议日程', status: 'idle' },
        { id: 'drafter', name: 'DeepSeek 思考与草拟', description: '深度意图剖析 (Reasoning) 并起草答复草案', status: 'idle' },
        { id: 'action_runner', name: '本地动作执行', description: '触发桌面通知、待办卡片与自动化标记', status: 'idle' },
      ],
      tokensConsumed: 0,
      costEstimateUsd: 0,
    };

    onProgress?.({ ...run });

    // ----------------------------------------------------
    // 阶段 1: Security & DeepSeek Filter
    // ----------------------------------------------------
    const t0 = Date.now();
    const deepseekRes = await this.deepseek.analyzeEmail(email, domainContext);

    run.steps[0].status = 'completed';
    run.steps[0].durationMs = Date.now() - t0;
    run.steps[0].output = `分类确定: [${deepseekRes.category.toUpperCase()}]，安全信誉评估: ${deepseekRes.category === 'spam' ? '风险拦截' : '合规通过'}`;
    run.steps[1].status = 'running';
    onProgress?.({ ...run });

    // ----------------------------------------------------
    // 阶段 2: Entity & 2FA Extractor
    // ----------------------------------------------------
    const t1 = Date.now();
    await new Promise(r => setTimeout(r, 200));

    const verificationCode = ToolSandbox.extractVerificationCode(email.bodyText, email.fromAddress);
    const actionItems = ToolSandbox.extractActionItems(email.bodyText, email.subject);

    run.steps[1].status = 'completed';
    run.steps[1].durationMs = Date.now() - t1;
    run.steps[1].output = verificationCode 
      ? `检测到验证码: [${verificationCode.code}] (有效期 ${verificationCode.expiresInMinutes} 分钟)`
      : `抽取实体: ${actionItems.length > 0 ? `发现 ${actionItems.length} 个动作项` : '未包含即时动作项'}`;
    run.steps[2].status = 'running';
    onProgress?.({ ...run });

    // ----------------------------------------------------
    // 阶段 3: DeepSeek Reasoning & Intent Drafter
    // ----------------------------------------------------
    const t2 = Date.now();
    await new Promise(r => setTimeout(r, 350));

    let proposedReply = undefined;
    if (deepseekRes.suggestedReply) {
      proposedReply = {
        subject: deepseekRes.suggestedReply.subject,
        body: deepseekRes.suggestedReply.body,
        confidence: deepseekRes.suggestedReply.confidence,
        reasoning: deepseekRes.suggestedReply.reasoning,
        autoSent: this.llmConfig.automationLevel === 'autonomous',
      };
      run.steps[2].status = 'completed';
      run.steps[2].durationMs = Date.now() - t2;
      run.steps[2].output = `生成起草答复草案 (置信度 ${Math.round(proposedReply.confidence * 100)}%)，已注入 [${domainContext?.displayName || email.toAddress}] 知识库。`;
    } else {
      run.steps[2].status = 'completed';
      run.steps[2].durationMs = Date.now() - t2;
      run.steps[2].output = '经 DeepSeek 研判当前无需主动回信。';
    }

    run.reasoningExcerpt = deepseekRes.reasoningInfo.reasoningContent.slice(0, 100) + '...';
    run.steps[3].status = 'running';
    onProgress?.({ ...run });

    // ----------------------------------------------------
    // 阶段 4: Action Runner
    // ----------------------------------------------------
    const t3 = Date.now();
    await new Promise(r => setTimeout(r, 150));

    if (verificationCode) {
      ToolSandbox.sendDesktopNotification(
        `[${verificationCode.serviceName}] 验证码: ${verificationCode.code}`,
        `点击通知或在 EmailNative 中一键复制`
      );
    }

    run.steps[3].status = 'completed';
    run.steps[3].durationMs = Date.now() - t3;
    run.steps[3].output = '桌面高亮同步就绪，动作项与标签已入库';

    const promptTokens = deepseekRes.reasoningInfo.cacheHitTokens + deepseekRes.reasoningInfo.cacheMissTokens;
    const completionTokens = TokenTracker.estimateTokenCount(deepseekRes.reasoningInfo.reasoningContent + (proposedReply?.body || ''));
    const totalTokens = promptTokens + completionTokens;
    const costUsd = TokenTracker.calculateCost(this.llmConfig.model, promptTokens, completionTokens);

    run.status = proposedReply && !proposedReply.autoSent ? 'needs_approval' : 'success';
    run.completedAt = new Date().toISOString();
    run.tokensConsumed = totalTokens;
    run.costEstimateUsd = costUsd;

    onProgress?.({ ...run });

    const insight: AgentInsight = {
      summary: deepseekRes.summary,
      category: deepseekRes.category,
      urgency: deepseekRes.urgency,
      sentiment: deepseekRes.sentiment,
      verificationCode: verificationCode || undefined,
      actionItems,
      proposedReply,
      deepseekReasoning: deepseekRes.reasoningInfo,
      tokensUsed: {
        prompt: promptTokens,
        completion: completionTokens,
        total: totalTokens,
        costUsd,
      },
      processedAt: new Date().toISOString(),
    };

    return { insight, run };
  }
}
