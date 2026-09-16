/**
 * Token & Cost Tracker
 * 借鉴 dscode 的精准 Token 计量与成本追踪引擎
 */

export interface TokenUsageRecord {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  timestamp: string;
}

export class TokenTracker {
  // 模型每百万 Token 定价标准 (输入 / 输出 USD)
  private static readonly PRICING: Record<string, { inputPerM: number; outputPerM: number }> = {
    'deepseek-chat': { inputPerM: 0.27, outputPerM: 1.10 },
    'deepseek-reasoner': { inputPerM: 0.55, outputPerM: 2.19 },
    'claude-3-5-sonnet-20241022': { inputPerM: 3.00, outputPerM: 15.00 },
    'gpt-4o': { inputPerM: 2.50, outputPerM: 10.00 },
    'gpt-4o-mini': { inputPerM: 0.15, outputPerM: 0.60 },
    'ollama': { inputPerM: 0.0, outputPerM: 0.0 }, // 本地模型免费
  };

  /**
   * 预估或计算给定模型的花费
   */
  static calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const key = Object.keys(this.PRICING).find(k => model.toLowerCase().includes(k)) || 'deepseek-chat';
    const rates = this.PRICING[key];

    const inputCost = (promptTokens / 1_000_000) * rates.inputPerM;
    const outputCost = (completionTokens / 1_000_000) * rates.outputPerM;
    return Number((inputCost + outputCost).toFixed(6));
  }

  /**
   * 粗略估算文本的 Token 数量 (用于离线及预估)
   */
  static estimateTokenCount(text: string): number {
    if (!text) return 0;
    // 英文平均 4 字符 1 token，中文字符约 1 字符 0.7~1.5 token
    const cjkMatches = text.match(/[\u4e00-\u9fa5]/g) || [];
    const latinText = text.replace(/[\u4e00-\u9fa5]/g, '');
    const cjkTokens = Math.ceil(cjkMatches.length * 1.3);
    const latinTokens = Math.ceil(latinText.length / 3.8);
    return Math.max(1, cjkTokens + latinTokens);
  }
}
