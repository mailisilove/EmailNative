# emailnative - Cloudflare 生产环境接入实战指引

本文档为您详细讲解如何将 **emailnative MacBook 原生桌面端** 与 **Cloudflare 生产环境** 正式连通，托管您的真实域名，实现实时收件、D1 存储、DeepSeek-R1 自动分析与出站发信。

---

## 🌟 联动架构总览

```
[外部发信人] 
     │ 发送邮件至任意别名 (例如 auth@yourdomain.com 或 hello@yourdomain.com)
     ▼
[Cloudflare Email Routing] 
     │ (根据 Catch-all 规则拦截并触发 Worker)
     ▼
[Cloudflare Worker (cloudflare/worker.js)]
     │ 
     ├──> 存入 Cloudflare D1 生产数据库 (emails 表，含完整 raw MIME)
     │
[MacBook 桌面客户端 (emailnative)]
     │ 
     ├──> 点击顶部“同步 Cloudflare” (直连 Worker /api/mails 拉取最新真实邮件)
     │ 
     ├──> DeepSeek-R1 自动分析流水线 (提取 2FA 验证码、账单、会议、生成起草答复)
     │ 
     └──> 出站发信 (通过 Resend API 或 SMTP 真实对外发信)
```

---

## 🚀 生产部署 4 步走实战操作

### 第一步：在 Cloudflare 开启 Email Routing
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，进入您绑定的自定义域名（如 `yourdomain.com`）。
2. 在左侧菜单点击 **电子邮件 (Email)** $\to$ **Email Routing**。
3. 点击 **启用 Email Routing**，Cloudflare 会自动为您一键添加所需的 MX 记录（优先级 13, 57, 98 指向 `isaac.mx.cloudflare.net` 等）。

---

### 第二步：部署生产级 Cloudflare Worker 与 D1 数据库

我们在项目 [`cloudflare/`](file:///Users/melis/workspace/02_TESTING_SITES/emailnative/cloudflare/) 目录中已为您准备好了完整的生产部署文件：
- [`cloudflare/worker.js`](file:///Users/melis/workspace/02_TESTING_SITES/emailnative/cloudflare/worker.js)（生产级接收、解析与 API 网关）
- [`cloudflare/schema.sql`](file:///Users/melis/workspace/02_TESTING_SITES/emailnative/cloudflare/schema.sql)（D1 数据库建表脚本）
- [`cloudflare/wrangler.toml`](file:///Users/melis/workspace/02_TESTING_SITES/emailnative/cloudflare/wrangler.toml)（部署配置）

在终端进入 `cloudflare` 目录执行以下命令：

```bash
cd /Users/melis/workspace/02_TESTING_SITES/emailnative/cloudflare

# 1. 登录您的 Cloudflare 账户
npx wrangler login

# 2. 创建一个 D1 生产数据库
npx wrangler d1 create emailnative-db

# 命令行会输出类似：
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
# 请将此 ID 填入 cloudflare/wrangler.toml 中的 database_id 字段

# 3. 初始化数据库表结构
npx wrangler d1 execute emailnative-db --file=schema.sql --remote

# 4. 发布部署 Worker 到生产环境
npx wrangler deploy
```

部署完成后，控制台将输出您的生产 Worker URL，例如：
`https://emailnative-mail-gateway.yourname.workers.dev`

---

### 第三步：在 Email Routing 中绑定该 Worker
1. 回到 Cloudflare 控制台的 **Email Routing** 页面。
2. 切换到 **路由规则 (Routing Rules)** 选项卡。
3. 点击 **Catch-all 地址 (Catch-all Address)** 旁的编辑按钮：
   - **操作 (Action)**：选择 **发送到 Worker (Send to a Worker)**
   - **目标 Worker**：选择刚刚部署的 `emailnative-mail-gateway`
   - 保存并启用。

> 💡 **至此，所有发送到 `@yourdomain.com` 任何地址的邮件，都会全自动进入您的生产 Worker 并写入 D1 数据库！**

---

### 第四步：在 MacBook 桌面端完成生产连通

1. 启动桌面应用：
   ```bash
   npm run app:dev
   ```
2. 按快捷键 <kbd>Cmd</kbd> + <kbd>,</kbd> 或点击左下角 ⚙️ **设置**：
   - 切换到 **Cloudflare 邮件网关** 选项卡：
     - **服务地址**：填入您的 Worker 生产域名（例如 `https://emailnative-mail-gateway.yourname.workers.dev`）
     - **安全 Token (ADMIN_TOKEN)**：填入在 `wrangler.toml` 中配置的密钥
     - 点击 **“测试生产 Worker 连通性”**，显示绿色 `✅ 生产 Worker 运行正常` 即可！
   - 切换到 **AI 模型推理** 选项卡：
     - 填入您的 **DeepSeek API Key**（首选 `deepseek-reasoner`）。
   - 切换到 **出站发信渠道** 选项卡：
     - 填入您的 **Resend API Key** 或企业邮箱 SMTP 凭证。
   - 点击 **保存设置**。

---

## 🎯 验证生产邮件闭环

1. **真实发信测试**：
   - 用您的个人邮箱（如 QQ、163 或 Gmail）向您的域名别名发送一封测试邮件，例如发送给：`auth@yourdomain.com`，正文包含“您的验证码是 982103”。
2. **桌面端一键同步**：
   - 在 MacBook 桌面应用顶部栏点击 **【同步 Cloudflare】**。
   - 桌面客户端将直接从 Cloudflare D1 拉取新入库的真实邮件。
   - 立即触发 **DeepSeek-R1 深度研判流水线**：
     - 自动归类为 `2FA 验证码`
     - 毫秒级提取验证码 `982103` 并弹出高亮卡片与桌面通知
     - 支持一键复制。
3. **真实对外发信**：
   - 点击顶部 <kbd>撰写出站邮件</kbd> 或在商业邮件下方点击 <kbd>审核通过并发送</kbd>，邮件即通过 Resend 或 SMTP 真实发出并送达对方邮箱！

---

## 🔍 常见排查：为什么 Cloudflare Email Routing 收不到信？

若您向域名发送邮件后，客户端拉取不到或发信方收到退信，请按以下 4 步排查：

### 1. 检查 Cloudflare Email Routing 路由规则 (Routing Rules)
- 进入 Cloudflare 控制台 $\to$ 您的域名 $\to$ **Email Routing** $\to$ **Routing Rules**。
- **Catch-all 规则必须开启**，且 **Action** 必须设置为 **Send to a Worker**，目标 Worker 必须为 `emailnative-mail-gateway`。
- 若 Action 被误设为“Drop”或“Forward to an email address”，Worker 的 `email()` 触发器将不会执行！

### 2. 检查 DNS MX 记录冲突
- 在客户端中点击 **“⚡ 一键 DNS & 发信体检”**，查看 MX 记录是否全部指向 `*.mx.cloudflare.net`。
- **注意**：如果该域名之前绑定过 Google Workspace、腾讯企业邮、阿里邮箱或网易企业邮，**旧的 MX 记录必须全部删除**！若存在多厂商 MX 记录，公网发信方会把邮件路由到旧服务商，导致 Cloudflare 完全收不到信。

### 3. 检查备份邮箱 (FORWARD_TO_GMAIL) 是否已验证
- 若在 `wrangler.toml` 中配置了 `FORWARD_TO_GMAIL`，Cloudflare 规定**转发的目标邮箱必须先在控制台验证**。
- 前往 Cloudflare $\to$ **Email Routing** $\to$ **Destination Addresses**，添加您的目标邮箱并点击邮箱中收到的确认链接。若未验证，Worker 转发会报错；但最新版 `worker.js` 已增加隔离保护，转发失败不会影响 D1 数据库写入。

### 4. 检查 Worker 鉴权密钥 (ADMIN_TOKEN) 是否一致
- 客户端「设置」中的 **安全 Token (ADMIN_TOKEN)** 必须与 `cloudflare/wrangler.toml` 中的 `ADMIN_TOKEN` 完全一致。
- 若不一致，请求 `/api/mails` 会返回 `401 Unauthorized`，桌面端已支持智能提示“Token 不匹配”。
