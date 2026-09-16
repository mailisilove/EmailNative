/**
 * MIME & HTML Parser
 * 提取邮件正文纯文本、清理样式、抽取验证码与签名
 */

export interface ParsedMailBody {
  plainText: string;
  cleanHtml: string;
  snippet: string;
  hasHtml: boolean;
}

export class MimeParser {
  /**
   * 将 HTML 转化为适合展示与 Agent 阅读的纯文本并生成摘要
   */
  static parseBody(rawHtmlOrText: string): ParsedMailBody {
    if (!rawHtmlOrText) {
      return {
        plainText: '',
        cleanHtml: '',
        snippet: '',
        hasHtml: false,
      };
    }

    const hasHtml = /<[a-z][\s\S]*>/i.test(rawHtmlOrText);

    let plainText = rawHtmlOrText;
    let cleanHtml = rawHtmlOrText;

    if (hasHtml) {
      // 简单剥离 script, style 标签
      const sanitized = rawHtmlOrText
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

      cleanHtml = sanitized;
      // 提取纯文本
      plainText = sanitized
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
    }

    // 生成不超过 120 字的 snippet
    const snippet = plainText
      .replace(/\s+/g, ' ')
      .slice(0, 120)
      .trim() + (plainText.length > 120 ? '...' : '');

    return {
      plainText,
      cleanHtml,
      snippet,
      hasHtml,
    };
  }

  /**
   * 快速提取 4-8 位数字/字母验证码启发式正则
   */
  static extractVerificationCodeFast(text: string): string | null {
    const patterns = [
      /(?:code|验证码|校验码|PIN|token|verification\s*code)[^\d\n\r]{0,25}[:：\s]?([A-Za-z0-9]{4,8})\b/i,
      /\b([0-9]{4,8})\b(?=.*(?:验证码|verification|valid for|expires|有效))/i,
      /(?:code is|code:)\s*([0-9]{4,8})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }
}
