# EmailNative ⚡ 域名邮箱智能工作台

<p align="center">
  <img src="public/favicon.svg" width="96" height="96" alt="EmailNative Logo" />
</p>

<p align="center">
  <strong>基于「Cloudflare Email Routing (免费入站) + Resend (稳定出站) + DeepSeek-R1 (深度研判)」的现代化多域名邮箱工作台</strong>
</p>

<p align="center">
  <a href="#-开源协议"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT"></a>
  <a href="#-架构图解"><img src="https://img.shields.io/badge/Architecture-Local--First%20Zero--Server-blue.svg" alt="Zero-Server Relay"></a>
  <a href="#-核心特性"><img src="https://img.shields.io/badge/Engine-DeepSeek--R1%20Reasoning-purple.svg" alt="DeepSeek-R1"></a>
  <a href="https://github.com/mailisilove/EmailNative"><img src="https://img.shields.io/badge/GitHub-EmailNative-black?logo=github" alt="GitHub"></a>
</p>

---

## ⚡ 15 秒直击痛点：告别每月每个域名 $6 的商业邮箱账单

你是否拥有 5 个、10 个甚至几十个域名（独立独立开发者、出海 SaaS、自媒体矩阵）？
若每个域名都在 Google Workspace、Microsoft 365 或商业企业邮开通账号，**每月仅邮箱固定开销就高达 $60 ~ $300+**！

> 💡 **一句话总结**：**「用 Cloudflare 免费入站 + Resend 每月 3,000 封免费额度稳定出站 + EmailNative 客户端本地零中转分拣」，实现 0 成本、无限多域名、全动态别名的高品质收发闭环！**

### 📊 传统商业邮箱 vs EmailNative 方案

| 核心维度 | 传统商业企业邮 (Google / M365) | EmailNative 开源方案 |
| :--- | :--- | :--- |
| **月度账单 (10个域名)** | **$60 ~ $120 / 月** 💸 (按域名/人头计费) | **$0 / 永久免费** 🚀 (充裕免费配额) |
| **别名与前缀** | 需在后台逐个配置，受数量限制 | **无限动态别名** (`Catch-all` 拦截任意前缀) |
| **密钥与数据隐私** | 邮件与日志托管于云端服务商 | **本地优先 (Local-First)**，密钥零云端中转 |
| **AI 自动化与研判** | 仅基础垃圾过滤 | **原生 DeepSeek-R1 思考链**，秒级提取 2FA/账单/起草拟复 |
| **多域名切换体验** | 网页反复登出登入多个账号 | **原生桌面客户端 1 毫秒极速切换矩阵收件箱** |

---

## 🏛️ 架构图解：零服务器中转 (Zero-Server Relay)

```
       ┌───────────────────────────────┐               ┌───────────────────────────────┐
       │     Inbound (免费极速入站)     │               │     Outbound (高送达率出站)    │
       │   Cloudflare Email Routing    │               │          Resend API           │
       │  (Catch-all / 全域名 MX 拦截)  │               │   (DKIM / SPF 顶级防伪认证)   │
       └───────────────┬───────────────┘               └───────────────▲───────────────┘
                       │                                               │
                       ▼                                               │
       ┌───────────────────────────────┐                               │
       │    Cloudflare Email Worker    │                               │
       │   • 自动创建/写入 D1 数据库   │                               │
       │   • 可选 Webhook / Gmail 静默备份│                            │
       └───────────────┬───────────────┘                               │
                       │ (直连 pull / push)                            │ (直连发送)
                       ▼                                               │
   ┌───────────────────────────────────────────────────────────────────┴───────────────────────────────┐
   │                                EmailNative 客户端 (Mac Native / Web)                              │
   │                                                                                                   │
   │  🔒 绝对隐私架构：所有 API Key (Resend / DeepSeek / Cloudflare) 均仅保存在本地设备，不经任何第三方服务器  │
   │  📂 Local-First 本地持久化缓存，离线毫秒级搜索与极速多域名分拣                                      │
   │  🧠 DeepSeek-R1 深度推理引擎：意图研判、2FA 验证码瞬时提取与智能答复草拟                            │
   │  ⚡ 内置「一键 DNS & 发信健康度体检」：自动诊断 MX / SPF / DKIM / DMARC 记录与配置合规度             │
   └───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 核心亮点

- 🛡️ **双轨邮件协议全面兼容**：
  - **Cloudflare 路由域名**：原生适配 Cloudflare Email Routing 与 Workers，自动 Catch-all 拦截，任意 `xxx@yourdomain.com` 动态别名随发随收。
  - **传统商业企业邮 (IMAP/SMTP)**：内置腾讯企业邮、阿里邮箱、网易企业邮、Google Workspace、Microsoft 365 及自建 Mailcow / Postfix 快速接入。
- 🧠 **原生 DeepSeek-R1 思考链推理**：
  - 首选以 **DeepSeek-R1 (`deepseek-reasoner`)** 为推理核心。
  - 阅读器中完整呈现 **DeepSeek 思考链 (`<think> ... </think>`)**、决策理由与发信人真实意图。
- ⚡ **一键 DNS / SPF / DKIM / DMARC 自动化体检**：
  - 基于 Cloudflare 权威 DoH (DNS-over-HTTPS)，纯客户端一键体检域名的 MX、SPF、DKIM、DMARC 解析与 Resend 激活状态，排查发信为何进垃圾箱或被拒。
- 🔐 **本地优先与零云端中转 (Zero-Server Relay)**：
  - 所有 API Key 与邮件全部存储在本地浏览器 LocalStorage 或原生持久化介质中，零后端中间层，彻底消除密钥泄露顾虑。
- 🖥️ **MacBook 原生体验**：
  - 支持 macOS 原生红绿灯无缝融合、毛玻璃材质、快捷键（<kbd>Cmd</kbd>+<kbd>N</kbd> 撰写、<kbd>Cmd</kbd>+<kbd>,</kbd> 设置、快捷复制 2FA）。

---

## 🚀 5 分钟快速上手指南

### 第一步：Cloudflare DNS 与 Email Routing 配置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) 进入您的域名。
2. 进入 **电子邮件 (Email)** $\to$ **Email Routing**，点击 **启用 Email Routing**。
3. 检查 DNS 记录（确保无旧服务商的冲突 MX 记录）：

| 类型 | 名称 | 内容 / 目标值 | 优先级 | 用途 |
| :--- | :--- | :--- | :--- | :--- |
| **MX** | `@` | `isaac.mx.cloudflare.net` | `13` | Cloudflare 入站接收 |
| **MX** | `@` | `linda.mx.cloudflare.net` | `57` | Cloudflare 入站接收 |
| **MX** | `@` | `amir.mx.cloudflare.net` | `98` | Cloudflare 入站接收 |
| **TXT** | `@` | `v=spf1 include:resend.com ~all` | - | SPF 防进垃圾箱授权 |
| **TXT** | `_dmarc` | `v=DMARC1; p=none;` | - | DMARC 安全合规标准 |
| **TXT/CNAME**| `resend._domainkey` | 在 [Resend 控制台](https://resend.com/domains) 添加域名后提供的公钥 | - | DKIM 数字签名 |

---

### 第二步：一键部署 Cloudflare Worker 与 D1 数据库

在项目根目录执行以下命令：

```bash
cd cloudflare

# 1. 登录 Cloudflare 账号
npx wrangler login

# 2. 创建 D1 数据库
npx wrangler d1 create emailnative-db

# 命令行将输出类似：database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
# 请将此 ID 填入 cloudflare/wrangler.toml 中的 database_id 字段

# 3. 部署 Worker
npx wrangler deploy
```

> 💡 **部署完成后**：
> 1. 回到 Cloudflare 控制台的 **Email Routing** $\to$ **路由规则 (Routing Rules)**。
> 2. 编辑 **Catch-all 地址**：操作选择 **发送到 Worker** $\to$ 选择 `emailnative-mail-gateway` 并保存。
> 3. 所有发送到该域名任意前缀的邮件，都会全自动进入 Worker 并自动持久化至 D1 数据库！

---

### 第三步：配置 Resend 出站发信通道

1. 在 [resend.com](https://resend.com/) 免费注册账号并获取 API Key（格式为 `re_...`）。
2. 在 Resend 控制台点击 **Domains** $\to$ **Add Domain**，填入你的域名并添加提示的 DNS 验证记录。
3. 每月享有 **3,000 封高送达率出站邮件**免费额度。

---

### 第四步：启动 EmailNative 客户端

```bash
# 安装依赖
npm install

# 方式 A：启动 MacBook 原生桌面客户端 (推荐)
npm run app:dev

# 方式 B：启动 Web 端进行浏览器体验
npm run dev
```

启动后按快捷键 <kbd>Cmd</kbd> + <kbd>,</kbd> 打开 **「设置」**：
1. **Cloudflare 邮件网关**：填入你的 Worker 域名与 `ADMIN_TOKEN`，点击 **“测试生产 Worker 连通性”** 与 **“一键初始化 D1 数据表”**。
2. **出站发信渠道**：填入 Resend API Key，点击 **“一键体检”** 测试域名 DNS 解析。
3. **AI 模型推理**：填入 DeepSeek API Key（支持 `deepseek-reasoner` / `deepseek-chat`）。

点击顶部栏的 **【同步 Cloudflare】**，即可秒级拉取所有最新邮件并启动 DeepSeek 自动研判！

---

## 🛠️ 技术栈与架构参考

本项目的诞生离不开以下优秀的开源项目与技术规范启发：
- **[dreamhunter2333/cloudflare_temp_email](https://github.com/dreamhunter2333/cloudflare_temp_email)**：优秀的 Cloudflare Email Worker 接口设计
- **[thinkany-ai/dscode](https://github.com/thinkany-ai/dscode)**：优雅的思考链呈现与 DSCode 极简交互
- **[fastclaw-ai/fastclaw](https://github.com/fastclaw-ai/fastclaw)**：轻量多角色 Agent 流水线与工具沙箱
- **[makecindy/cindy](https://github.com/makecindy/cindy)**：人机协同审批闭环协议
- **[MkThingsHQ/mkagent](https://github.com/MkThingsHQ/mkagent)**：本地优先 (Local-First) 离线数据存储哲学

---

## 🤝 参与共建 (Contributing)

我们非常欢迎开发者参与共建！无论是提交 Issue、改进 Worker 性能、增加新邮件协议还是优化 UI 体验：
1. Fork 本仓库并创建特性分支：`git checkout -b feature/my-cool-feature`
2. 提交代码更改并确保格式合规：`npm run build && npm run lint`
3. 提交 PR 并详细描述改动点与测试结果。

---

## 📄 开源协议

本项目基于 **[MIT License](LICENSE)** 协议开源，允许个人与商业自由使用、修改和再分发。
