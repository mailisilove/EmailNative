/**
 * DNS & Delivery Inspector for EmailNative
 * 基于公开权威 DNS-over-HTTPS (Cloudflare DoH) 纯前端无后端检测 MX、SPF、DKIM、DMARC 状态
 * 并支持直连 Resend API 验证发信域名状态
 */

export interface DnsCheckItem {
  id: 'mx' | 'spf' | 'dkim' | 'dmarc' | 'resend_api';
  name: string;
  status: 'passed' | 'warning' | 'failed' | 'checking';
  title: string;
  currentValue?: string;
  expectedValue?: string;
  suggestion: string;
}

export interface DomainHealthReport {
  domain: string;
  timestamp: string;
  score: number; // 0 - 100
  checks: DnsCheckItem[];
  allPassed: boolean;
}

export class DnsInspector {
  private static DOH_ENDPOINT = 'https://cloudflare-dns.com/dns-query';

  /**
   * 使用 Cloudflare DoH 查询特定 DNS 记录
   */
  private static async queryDoh(name: string, type: string): Promise<any[]> {
    try {
      const url = new URL(this.DOH_ENDPOINT);
      url.searchParams.set('name', name);
      url.searchParams.set('type', type);

      const res = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/dns-json',
        },
      });

      if (!res.ok) return [];
      const data = await res.json();
      return data.Answer || [];
    } catch (err) {
      console.warn(`[DnsInspector] DoH query failed for ${name} ${type}:`, err);
      return [];
    }
  }

  /**
   * 一键全面体检域名的收发信 DNS 与 Resend 状态
   */
  static async inspectDomain(domain: string, resendApiKey?: string): Promise<DomainHealthReport> {
    const cleanDomain = (domain || '').trim().toLowerCase().replace(/^@+/, '');
    if (!cleanDomain) {
      throw new Error('请输入有效的域名');
    }

    const checks: DnsCheckItem[] = [];

    // 1. 检查 MX 记录 (入站核心：Cloudflare Email Routing)
    const mxAnswers = await this.queryDoh(cleanDomain, 'MX');
    const mxValues = mxAnswers.map((a: any) => (a.data || '').toLowerCase());
    const hasCfMx = mxValues.some(v => v.includes('mx.cloudflare.net'));
    const conflictingMx = mxValues.filter(v => 
      v.includes('google') || v.includes('outlook') || v.includes('qq.com') || v.includes('163.com') || v.includes('zoho')
    );

    if (hasCfMx) {
      checks.push({
        id: 'mx',
        name: 'MX 记录 (Cloudflare Email Routing 入站)',
        status: conflictingMx.length > 0 ? 'warning' : 'passed',
        title: conflictingMx.length > 0 ? '检测到 Cloudflare MX，但存在冲突记录' : 'Cloudflare Email Routing MX 已正确解析',
        currentValue: mxValues.join(', ') || '无',
        expectedValue: 'isaac.mx.cloudflare.net (13), linda.mx.cloudflare.net (57), amir.mx.cloudflare.net (98)',
        suggestion: conflictingMx.length > 0 
          ? `检测到存在其他商业邮箱记录 (${conflictingMx.join(', ')})，这会导致部分邮件分流或被 Cloudflare 判定为配置异常，建议移除旧 MX 记录。`
          : 'MX 记录配置完美，发送到该域名的任意邮件将被 Cloudflare 正常捕获拦截。',
      });
    } else if (mxValues.length > 0) {
      checks.push({
        id: 'mx',
        name: 'MX 记录 (Cloudflare Email Routing 入站)',
        status: 'failed',
        title: '未检测到 Cloudflare Email Routing MX 记录',
        currentValue: mxValues.join(', '),
        expectedValue: '*.mx.cloudflare.net',
        suggestion: '当前域名指向了其他邮件提供商。请在 Cloudflare 控制台该域名的「电子邮件」->「Email Routing」中开启并点击自动添加 MX 记录。',
      });
    } else {
      checks.push({
        id: 'mx',
        name: 'MX 记录 (Cloudflare Email Routing 入站)',
        status: 'failed',
        title: '域名未配置任何 MX 记录',
        currentValue: '无',
        expectedValue: '*.mx.cloudflare.net (优先级 13, 57, 98)',
        suggestion: '请前往 Cloudflare 仪表盘 -> 域名 -> Email Routing -> 启用该服务，系统将一键自动添加所需 MX 记录。',
      });
    }

    // 2. 检查 SPF 记录 (出站送达率与防冒名认证)
    const txtAnswers = await this.queryDoh(cleanDomain, 'TXT');
    const txtValues = txtAnswers.map((a: any) => (a.data || '').replace(/^"|"$/g, ''));
    const spfRecord = txtValues.find(v => v.toLowerCase().startsWith('v=spf1'));

    if (spfRecord) {
      const includesResend = spfRecord.toLowerCase().includes('include:resend.com');
      const includesCf = spfRecord.toLowerCase().includes('include:_spf.mx.cloudflare.net');

      if (includesResend) {
        checks.push({
          id: 'spf',
          name: 'SPF 记录 (TXT - 出站防进垃圾箱认证)',
          status: 'passed',
          title: 'SPF 记录已成功授权 Resend 发信',
          currentValue: spfRecord,
          expectedValue: 'v=spf1 include:resend.com ~all',
          suggestion: 'SPF 策略健全，收件方邮箱（Gmail/Outlook）将认可来自 Resend 的邮件为合法外发。',
        });
      } else {
        checks.push({
          id: 'spf',
          name: 'SPF 记录 (TXT - 出站防进垃圾箱认证)',
          status: 'warning',
          title: '存在 SPF 记录，但未包含 include:resend.com',
          currentValue: spfRecord,
          expectedValue: 'v=spf1 include:resend.com ~all',
          suggestion: '请在 DNS 的 SPF TXT 记录中加入 `include:resend.com`，例如：`v=spf1 include:resend.com ~all`，否则通过 Resend 发出的邮件可能被标记为垃圾邮件或拒收。',
        });
      }
    } else {
      checks.push({
        id: 'spf',
        name: 'SPF 记录 (TXT - 出站防进垃圾箱认证)',
        status: 'failed',
        title: '未配置 SPF TXT 记录',
        currentValue: '无',
        expectedValue: 'v=spf1 include:resend.com ~all',
        suggestion: '请在 Cloudflare DNS 中新增一条 TXT 记录：名称为 `@`，内容为 `v=spf1 include:resend.com ~all`。',
      });
    }

    // 3. 检查 DKIM 记录 (Resend 核心数字签名)
    const dkimSelector = `resend._domainkey.${cleanDomain}`;
    const dkimTxt = await this.queryDoh(dkimSelector, 'TXT');
    const dkimCname = await this.queryDoh(dkimSelector, 'CNAME');
    const hasDkim = dkimTxt.length > 0 || dkimCname.length > 0;

    if (hasDkim) {
      const val = dkimTxt.length > 0 ? dkimTxt[0].data : dkimCname[0].data;
      checks.push({
        id: 'dkim',
        name: 'DKIM 数字签名 (resend._domainkey)',
        status: 'passed',
        title: 'DKIM 密钥记录已正常生效',
        currentValue: val,
        expectedValue: 'p=MIGf... 或 CNAME dkim.resend.com',
        suggestion: 'DKIM 签名已就绪，可有效抵御邮件伪造篡改，显著提升商业沟通进件率。',
      });
    } else {
      checks.push({
        id: 'dkim',
        name: 'DKIM 数字签名 (resend._domainkey)',
        status: 'warning',
        title: '未查询到 resend._domainkey 的 DKIM 记录',
        currentValue: '未检测到记录',
        expectedValue: '在 resend.com 添加域名后生成的 DKIM TXT 记录',
        suggestion: '登录 resend.com 控制台进入该域名，复制对应的 DKIM TXT/CNAME 记录并添加至 Cloudflare DNS 中。',
      });
    }

    // 4. 检查 DMARC 记录
    const dmarcDomain = `_dmarc.${cleanDomain}`;
    const dmarcAnswers = await this.queryDoh(dmarcDomain, 'TXT');
    const dmarcRecord = dmarcAnswers.map((a: any) => (a.data || '').replace(/^"|"$/g, '')).find(v => v.toLowerCase().startsWith('v=dmarc1'));

    if (dmarcRecord) {
      checks.push({
        id: 'dmarc',
        name: 'DMARC 邮件安全策略 (_dmarc)',
        status: 'passed',
        title: 'DMARC 策略已生效',
        currentValue: dmarcRecord,
        expectedValue: 'v=DMARC1; p=none;',
        suggestion: 'DMARC 保护有效，符合 2024 年 Gmail 与 Yahoo 最新的发信人强制安全合规标准。',
      });
    } else {
      checks.push({
        id: 'dmarc',
        name: 'DMARC 邮件安全策略 (_dmarc)',
        status: 'warning',
        title: '未配置 DMARC 策略 (建议配置)',
        currentValue: '无',
        expectedValue: 'v=DMARC1; p=none; rua=mailto:dmarc@' + cleanDomain,
        suggestion: '为防止发信被 Gmail / Outlook 拦截，建议在 DNS 新增 TXT 记录：名称为 `_dmarc`，内容填入 `v=DMARC1; p=none;`。',
      });
    }

    // 5. 检查 Resend API 连通性与该域名验证状态
    if (resendApiKey && resendApiKey.trim().startsWith('re_')) {
      try {
        const res = await fetch('https://api.resend.com/domains', {
          headers: {
            'Authorization': `Bearer ${resendApiKey.trim()}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          const domainsList: any[] = Array.isArray(data.data) ? data.data : [];
          const matched = domainsList.find(d => (d.name || '').toLowerCase() === cleanDomain);

          if (matched) {
            const status = matched.status;
            if (status === 'verified') {
              checks.push({
                id: 'resend_api',
                name: 'Resend 官方域名激活状态',
                status: 'passed',
                title: 'Resend 控制台已完成该域名验证 (Verified)',
                currentValue: `状态: verified | 区域: ${matched.region || 'us-east-1'}`,
                suggestion: '该域名已在 Resend 官方发信引擎完全激活，支持 100% 真实出站发信！',
              });
            } else {
              checks.push({
                id: 'resend_api',
                name: 'Resend 官方域名激活状态',
                status: 'warning',
                title: `域名已添加至 Resend，但状态为「${status}」`,
                currentValue: `状态: ${status}`,
                suggestion: 'DNS 记录添加后通常需要 2~10 分钟生效。可在 resend.com 控制台点击「Verify Domain」触发重新校验。',
              });
            }
          } else {
            checks.push({
              id: 'resend_api',
              name: 'Resend 官方域名激活状态',
              status: 'warning',
              title: 'Resend API Key 有效，但该域名尚未添加到 Resend',
              currentValue: '未在当前 Resend 账户域名列表中找到',
              expectedValue: cleanDomain,
              suggestion: `请前往 resend.com/domains 点击「Add Domain」，填入 ${cleanDomain}，然后根据其提示同步补充 DNS 记录。`,
            });
          }
        } else {
          checks.push({
            id: 'resend_api',
            name: 'Resend 官方 API 连通性',
            status: 'failed',
            title: `Resend API 返回 HTTP ${res.status}`,
            suggestion: '请核对设置中的 Resend API Key 是否拼写正确，并确保该 Key 具有 Domains 读取与发信权限。',
          });
        }
      } catch (err: any) {
        checks.push({
          id: 'resend_api',
          name: 'Resend 官方 API 连通性',
          status: 'warning',
          title: '网络请求超时或受浏览器同源策略限制',
          suggestion: '在桌面 Electron 客户端中将获得原生无跨域请求支持；在纯 Web 模式下可直接在 resend.com 控制台核对状态。',
        });
      }
    } else {
      checks.push({
        id: 'resend_api',
        name: 'Resend 发信通道配置',
        status: 'warning',
        title: '尚未配置 Resend API Key',
        suggestion: '前往「设置」->「出站发信渠道」填入 Resend 密钥 (re_...)，即可启用每月 3,000 封免费稳定出站发信。',
      });
    }

    // 计算总得分
    let score = 0;
    checks.forEach(c => {
      if (c.status === 'passed') score += 20;
      else if (c.status === 'warning') score += 10;
    });

    return {
      domain: cleanDomain,
      timestamp: new Date().toISOString(),
      score: Math.min(100, score),
      checks,
      allPassed: checks.every(c => c.status === 'passed'),
    };
  }
}
