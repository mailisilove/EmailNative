-- Cloudflare D1 生产数据库建表脚本 (schema.sql)
-- 用于存放多域名邮件、MIME 原始内容与索引

CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,          -- 发件人地址 (From)
  address TEXT NOT NULL,         -- 接收邮箱别名 (To)
  subject TEXT,                  -- 邮件主题
  message TEXT,                  -- 纯文本正文摘要
  raw TEXT,                      -- 完整 MIME / EML 原始数据
  is_read INTEGER DEFAULT 0,     -- 是否已读
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_emails_address ON emails(address);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_source ON emails(source);
