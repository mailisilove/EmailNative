/**
 * Cloudflare Worker for EmailNative (Open Source Edition)
 * 高性能生产级邮件网关：支持 D1 自动建表持久化、Webhook 推送、静默转发与 REST API
 */

// CORS 响应头
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-custom-auth',
};

// 自动初始化 D1 数据库表结构（防小白忘记执行 schema.sql）
async function autoInitDatabase(db) {
  if (!db) return false;
  try {
    await db.exec(`
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
      CREATE INDEX IF NOT EXISTS idx_emails_source ON emails(source);
    `);
    return true;
  } catch (err) {
    console.error('[Worker D1 Auto-Init Error]', err);
    return false;
  }
}

export default {
  // 1. 处理邮件接收事件 (Email Worker Trigger)
  async email(message, env, ctx) {
    try {
      let to = (message.to || '').trim().toLowerCase();
      const toMatch = to.match(/<([^>]+)>/);
      if (toMatch && toMatch[1]) to = toMatch[1].trim().toLowerCase();
      to = to.replace(/^["']|["']$/g, '').trim();

      let from = (message.from || '').trim().toLowerCase();
      const fromMatch = from.match(/<([^>]+)>/);
      if (fromMatch && fromMatch[1]) from = fromMatch[1].trim().toLowerCase();
      from = from.replace(/^["']|["']$/g, '').trim();

      const subject = (message.headers && message.headers.get('subject')) || '(无主题)';
      const id = 'cf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

      // 关键：安全提取 MIME 原始内容，绝不因 stream 问题崩溃
      let rawEmail = '';
      try {
        if (message.raw) {
          rawEmail = await new Response(message.raw).text();
        }
      } catch (rawErr) {
        console.warn('[Worker] Failed to read message.raw, fallback to headers:', rawErr);
        rawEmail = `From: ${from}\nTo: ${to}\nSubject: ${subject}\n\n[Content body unreadable via stream]`;
      }

      // 提取正文纯文本摘要（分离 Header，防止将 Received / DKIM 等网络头写入摘要）
      let bodyForSnippet = rawEmail;
      const headerSplit = rawEmail.match(/^(?:[\s\S]*?\r?\n)\r?\n([\s\S]*)$/);
      if (headerSplit && headerSplit[1]) {
        bodyForSnippet = headerSplit[1];
        if (/^[A-Za-z0-9+/=\r\n\s]{30,}$/.test(bodyForSnippet.trim())) {
          try {
            bodyForSnippet = atob(bodyForSnippet.replace(/\s+/g, ''));
          } catch {}
        }
      }

      let snippet = bodyForSnippet
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 200)
        .trim();
      if (!snippet || snippet.length < 2) snippet = subject;

      // D1 参数大小安全保护（SQLite 单变量限制，避免过大附件导致写入报错）
      const maxRawLength = 600 * 1024; // 600KB
      const safeRawEmail = rawEmail.length > maxRawLength 
        ? rawEmail.slice(0, maxRawLength) + '\n\n[Warning: Content truncated by worker due to D1 size limit]'
        : rawEmail;

      // 核心第一优先级：必须确保 100% 存入 Cloudflare D1 数据库！
      if (env.DB) {
        try {
          await env.DB.prepare(
            'INSERT INTO emails (id, source, address, subject, message, raw, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)'
          ).bind(id, from, to, subject, snippet, safeRawEmail, new Date().toISOString()).run();
          console.log(`[Worker D1] Email saved successfully! ID: ${id}, To: ${to}`);
        } catch (dbErr) {
          console.error('[Worker D1 Error]', dbErr);
          // 容错 1: 表不存在时自动建表重试
          if (dbErr.message && dbErr.message.includes('no such table')) {
            console.log('[Cloudflare Worker] Emails table missing, initializing automatically...');
            await autoInitDatabase(env.DB);
            try {
              await env.DB.prepare(
                'INSERT INTO emails (id, source, address, subject, message, raw, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)'
              ).bind(id, from, to, subject, snippet, safeRawEmail, new Date().toISOString()).run();
            } catch (retryErr) {
              console.error('[Worker D1 Retry Error]', retryErr);
            }
          } else {
            // 容错 2: 降级为只存纯文本摘要（防止 rawEmail 包含非法字节或超限）
            try {
              await env.DB.prepare(
                'INSERT INTO emails (id, source, address, subject, message, raw, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)'
              ).bind(id, from, to, subject, snippet, snippet, new Date().toISOString()).run();
            } catch (fallbackErr) {
              console.error('[Worker D1 Fallback Save Error]', fallbackErr);
            }
          }
        }
      } else {
        console.warn('[Cloudflare Worker] env.DB is not bound! Please bind D1 with variable name "DB" in worker settings.');
      }

      // 可选第二优先级：静默抄送转发备份（绝不影响 D1 存库结果）
      if (env.FORWARD_TO_GMAIL && env.FORWARD_TO_GMAIL.trim() !== '') {
        try {
          await message.forward(env.FORWARD_TO_GMAIL.trim());
        } catch (fwdErr) {
          console.warn('[Cloudflare Worker] Forwarding skipped or failed (check if destination email is verified in Cloudflare Email Routing):', fwdErr);
        }
      }

      // 可选第三优先级：Webhook 事件推送
      if (env.WEBHOOK_URL && env.WEBHOOK_URL.trim() !== '') {
        ctx.waitUntil(
          fetch(env.WEBHOOK_URL.trim(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${env.ADMIN_TOKEN || ''}`
            },
            body: JSON.stringify({ 
              id, 
              from, 
              to, 
              subject, 
              snippet, 
              created_at: new Date().toISOString() 
            })
          }).catch(err => console.error('[Worker Webhook Error]', err))
        );
      }
    } catch (err) {
      console.error('[Worker Inbound Email Fatal Error]', err);
    }
  },

  // 2. HTTP REST API 提供给桌面端拉取与发信
  async fetch(request, env, ctx) {
    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // 鉴权校验
    const authHeader = request.headers.get('x-custom-auth') || request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : null;
    const tokenMatched = env.ADMIN_TOKEN ? token === env.ADMIN_TOKEN : true;

    // 1. 健康检查与连通性深度体检接口（桌面端探测）
    if (url.pathname === '/api/health') {
      let tableReady = false;
      let emailCount = 0;
      let recentEmails = [];

      if (env.DB) {
        try {
          const res = await env.DB.prepare('SELECT COUNT(*) as count FROM emails').first();
          tableReady = true;
          emailCount = res ? (res.count || 0) : 0;

          const recent = await env.DB.prepare('SELECT id, address, source, subject, created_at FROM emails ORDER BY created_at DESC LIMIT 3').all();
          recentEmails = recent?.results || [];
        } catch (e) {
          tableReady = false;
        }
      }

      return new Response(JSON.stringify({ 
        ok: true, 
        version: '1.4.0-opensource',
        d1_bound: !!env.DB,
        d1_table_ready: tableReady,
        d1_emails_count: emailCount,
        recent_emails: recentEmails,
        token_configured: !!env.ADMIN_TOKEN,
        token_matched: token ? tokenMatched : null,
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    // 2. 一键自动初始化数据库表接口
    if (url.pathname === '/api/init_db') {
      if (!env.DB) {
        return new Response(JSON.stringify({ ok: false, message: 'D1 binding (DB) not configured in wrangler.toml' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
      }
      const success = await autoInitDatabase(env.DB);
      return new Response(JSON.stringify({ ok: success, message: success ? 'Database initialized successfully' : 'Init failed' }), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    // 鉴权拦截
    if (env.ADMIN_TOKEN && !tokenMatched) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid ADMIN_TOKEN' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    // 3. GET /api/mails - 分页拉取真实邮件列表
    if (url.pathname === '/api/mails' && request.method === 'GET') {
      if (!env.DB) {
        return new Response(JSON.stringify({ results: [], message: 'D1 database not bound yet' }), {
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
      }

      const address = url.searchParams.get('address');
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);

      try {
        let query = 'SELECT id, source, address, subject, message, raw, is_read, created_at FROM emails ORDER BY created_at DESC LIMIT ? OFFSET ?';
        let stmt;

        if (address) {
          query = 'SELECT id, source, address, subject, message, raw, is_read, created_at FROM emails WHERE address = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
          stmt = env.DB.prepare(query).bind(address, limit, offset);
        } else {
          stmt = env.DB.prepare(query).bind(limit, offset);
        }

        const { results } = await stmt.all();
        return new Response(JSON.stringify({ results: results || [], count: results ? results.length : 0 }), {
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
      }
    }

    // 4. POST /api/send_mail - 生产出站发信 (可通过 Resend API 转发)
    if (url.pathname === '/api/send_mail' && request.method === 'POST') {
      try {
        const body = await request.json();
        const resendKey = env.RESEND_API_KEY;

        if (resendKey) {
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: body.from,
              to: [body.to],
              subject: body.subject,
              text: body.text,
              html: body.html,
            }),
          });
          const resendJson = await resendRes.json();
          return new Response(JSON.stringify(resendJson), {
            status: resendRes.status,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
          });
        }

        return new Response(JSON.stringify({ success: true, message: 'Simulated send in Cloudflare Worker' }), {
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
      }
    }

    return new Response('EmailNative Cloudflare Gateway is Online.', {
      status: 200,
      headers: { 'Content-Type': 'text/plain', ...CORS_HEADERS }
    });
  }
};
