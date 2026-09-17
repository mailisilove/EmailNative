/**
 * Robust MIME & HTML Parser
 * 支持 RFC 2047 头部解码、MIME Header/Body 分离、Base64/Quoted-Printable 解码与干净正文提取
 */

export interface ParsedMailBody {
  plainText: string;
  cleanHtml: string;
  snippet: string;
  hasHtml: boolean;
}

export class MimeParser {
  /**
   * 解码 RFC 2047 编码的邮件头字段 (如: =?utf-8?B?5rWL6K+V6YKu5Lu2?=)
   */
  static decodeWords(encodedStr: string): string {
    if (!encodedStr || typeof encodedStr !== 'string') return '';
    return encodedStr.replace(/=\?([a-zA-Z0-9_-]+)\?([bBqQ])\?([^\?]+)\?=/g, (_, charset, encoding, text) => {
      try {
        const isBase64 = encoding.toUpperCase() === 'B';
        if (isBase64) {
          return this.decodeBase64(text, charset);
        } else {
          return this.decodeQuotedPrintable(text.replace(/_/g, ' '), charset);
        }
      } catch {
        return text;
      }
    });
  }

  /**
   * 解码 Base64 字节并转换为指定编码的字符串 (默认 UTF-8)
   */
  static decodeBase64(b64: string, charset = 'utf-8'): string {
    try {
      const clean = b64.replace(/\s+/g, '');
      const binary = atob(clean);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder(charset.toLowerCase() === 'gb2312' ? 'gbk' : charset).decode(bytes);
    } catch {
      return b64;
    }
  }

  /**
   * 解码 Quoted-Printable 字符串 (如: =E4=BD=A0=E5=A5=BD)
   */
  static decodeQuotedPrintable(qp: string, charset = 'utf-8'): string {
    try {
      const unsoft = qp.replace(/=\r?\n/g, '');
      const bytes: number[] = [];
      for (let i = 0; i < unsoft.length; i++) {
        if (unsoft[i] === '=' && i + 2 < unsoft.length) {
          const hex = unsoft.substr(i + 1, 2);
          if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
            bytes.push(parseInt(hex, 16));
            i += 2;
            continue;
          }
        }
        bytes.push(unsoft.charCodeAt(i));
      }
      return new TextDecoder(charset.toLowerCase() === 'gb2312' ? 'gbk' : charset).decode(new Uint8Array(bytes));
    } catch {
      return qp;
    }
  }

  /**
   * 从原始 MIME / EML 报文中彻底分离 Headers 和 Body，并解包正文
   */
  static parseBody(rawMimeOrText: string): ParsedMailBody {
    if (!rawMimeOrText) {
      return { plainText: '', cleanHtml: '', snippet: '', hasHtml: false };
    }

    let bodyContent = rawMimeOrText;
    let contentType = 'text/plain';
    let transferEncoding = '7bit';
    let charset = 'utf-8';

    // 检查是否包含原始 EML 头部特征
    const headerSplitMatch = rawMimeOrText.match(/^(?:[\s\S]*?\r?\n)\r?\n([\s\S]*)$/);
    const looksLikeRawEml = /^(Received:|ARC-|DKIM-|Return-Path:|From:|Subject:|Date:|Mime-Version:)/im.test(rawMimeOrText);

    if (looksLikeRawEml && headerSplitMatch) {
      const headerBlock = rawMimeOrText.substring(0, rawMimeOrText.length - headerSplitMatch[1].length);
      const rawBody = headerSplitMatch[1];

      // 提取 Content-Type
      const ctMatch = headerBlock.match(/Content-Type:\s*([a-zA-Z0-9_\/-]+)(?:;\s*charset="?([^";\r\n]+)"?)?/i);
      if (ctMatch) {
        contentType = ctMatch[1].toLowerCase();
        if (ctMatch[2]) charset = ctMatch[2];
      }

      // 提取 boundary
      const boundaryMatch = headerBlock.match(/boundary="?([^";\r\n]+)"?/i);
      const boundary = boundaryMatch ? boundaryMatch[1] : null;

      // 提取 Content-Transfer-Encoding
      const cteMatch = headerBlock.match(/Content-Transfer-Encoding:\s*([a-zA-Z0-9_-]+)/i);
      if (cteMatch) {
        transferEncoding = cteMatch[1].toLowerCase();
      }

      if (boundary) {
        // 多部分复合邮件解析
        bodyContent = this.extractFromMultipart(rawBody, boundary);
      } else {
        // 单部分邮件，根据编码解码正文
        bodyContent = this.decodePartBody(rawBody, transferEncoding, charset);
      }
    } else if (/^[A-Za-z0-9+/=\r\n\s]{40,}$/.test(rawMimeOrText.trim()) && !rawMimeOrText.includes(' ')) {
      // 纯 Base64 块探测
      bodyContent = this.decodeBase64(rawMimeOrText.trim());
    }

    // 处理 HTML 标签与纯文本提取
    const hasHtml = /<[a-z][\s\S]*>/i.test(bodyContent);
    let plainText = bodyContent;
    let cleanHtml = bodyContent;

    if (hasHtml) {
      // 清理脚本、样式、不可见区块与客户端签名容器
      const sanitized = bodyContent
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

      cleanHtml = sanitized;

      plainText = sanitized
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<hr[^>]*>/gi, '\n---\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    } else {
      plainText = plainText.trim();
    }

    // 生成简明摘要
    const snippet = plainText
      .replace(/\s+/g, ' ')
      .slice(0, 140)
      .trim() + (plainText.length > 140 ? '...' : '');

    return {
      plainText: plainText || '(邮件内容为空)',
      cleanHtml,
      snippet,
      hasHtml,
    };
  }

  /**
   * 解码指定编码的内容体
   */
  private static decodePartBody(content: string, encoding: string, charset = 'utf-8'): string {
    const enc = (encoding || '').toLowerCase().trim();
    if (enc === 'base64') {
      return this.decodeBase64(content, charset);
    }
    if (enc === 'quoted-printable') {
      return this.decodeQuotedPrintable(content, charset);
    }
    return content;
  }

  /**
   * 解析 Multipart boundary 分块并提取最优质正文
   */
  private static extractFromMultipart(body: string, boundary: string): string {
    const parts = body.split(new RegExp(`--${boundary}(?:--)?`));
    let plainCandidate = '';
    let htmlCandidate = '';

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      const splitMatch = trimmed.match(/^(?:[\s\S]*?\r?\n)\r?\n([\s\S]*)$/);
      if (!splitMatch) continue;

      const header = trimmed.substring(0, trimmed.length - splitMatch[1].length);
      const partBody = splitMatch[1];

      const ctMatch = header.match(/Content-Type:\s*([a-zA-Z0-9_\/-]+)(?:;\s*charset="?([^";\r\n]+)"?)?/i);
      const cteMatch = header.match(/Content-Transfer-Encoding:\s*([a-zA-Z0-9_-]+)/i);

      const partCt = ctMatch ? ctMatch[1].toLowerCase() : 'text/plain';
      const partCharset = ctMatch && ctMatch[2] ? ctMatch[2] : 'utf-8';
      const partCte = cteMatch ? cteMatch[1].toLowerCase() : '7bit';

      const decoded = this.decodePartBody(partBody, partCte, partCharset);

      if (partCt.includes('text/html')) {
        htmlCandidate = decoded;
      } else if (partCt.includes('text/plain')) {
        plainCandidate = decoded;
      }
    }

    return htmlCandidate || plainCandidate || body;
  }

  /**
   * 快速提取 4-8 位数字/字母验证码
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

  /**
   * 彻底规范化并提取干净的标准邮箱地址 (小写、去除 < >、引号、前后空格及多余字符)
   * 例: "<HelloMaiverse@Maiverse.cc>" -> "hellomaiverse@maiverse.cc"
   */
  static cleanEmailAddress(addr: string | undefined | null): string {
    if (!addr) return '';
    let s = String(addr).trim();
    const angleMatch = s.match(/<([^>]+)>/);
    if (angleMatch && angleMatch[1]) {
      s = angleMatch[1];
    }
    return s.replace(/^["']|["']$/g, '').trim().toLowerCase();
  }

  /**
   * 从地址中精准提取域名部分
   * 例: "hellomaiverse@maiverse.cc" -> "maiverse.cc"
   */
  static extractEmailDomain(addr: string | undefined | null): string {
    const clean = this.cleanEmailAddress(addr);
    if (!clean.includes('@')) return '';
    return clean.split('@')[1].trim().toLowerCase();
  }

  /**
   * 从地址中精准提取用户名前缀部分
   * 例: "hellomaiverse@maiverse.cc" -> "hellomaiverse"
   */
  static extractEmailPrefix(addr: string | undefined | null): string {
    const clean = this.cleanEmailAddress(addr);
    if (!clean.includes('@')) return clean;
    return clean.split('@')[0].trim().toLowerCase();
  }
}
