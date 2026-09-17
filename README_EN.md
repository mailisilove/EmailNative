# EmailNative ⚡ Intelligent Multi-Domain Email Workstation

<p align="center">
  <img src="public/favicon.svg" width="96" height="96" alt="EmailNative Logo" />
</p>

<p align="center">
  <strong>The Next-Gen Multi-Domain Email Client powered by Cloudflare Email Routing (Free Inbound), Resend (Stable Outbound), and DeepSeek-R1 (Deep Cognitive Reasoning)</strong>
</p>

<p align="center">
  <a href="#-license"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT"></a>
  <a href="#-architecture"><img src="https://img.shields.io/badge/Architecture-Local--First%20Zero--Server-blue.svg" alt="Zero-Server Relay"></a>
  <a href="#-core-highlights"><img src="https://img.shields.io/badge/Engine-DeepSeek--R1%20Reasoning-purple.svg" alt="DeepSeek-R1"></a>
  <a href="https://github.com/mailisilove/EmailNative"><img src="https://img.shields.io/badge/GitHub-EmailNative-black?logo=github" alt="GitHub"></a>
</p>

<p align="center">
  <a href="README.md">简体中文</a> | <strong>English</strong> | <a href="docs/OPERATION_MANUAL_EN.md">Operations Manual (EN)</a> | <a href="docs/EmailNative_User_Manual_EN.doc">Word Manual (.DOC)</a>
</p>

---

## ⚡ The Problem: Stop Paying $6/Month for Every Custom Domain

Do you manage 5, 10, or dozens of custom domains for your SaaS products, personal projects, or agency clients?
Subscribing each domain to Google Workspace, Microsoft 365, or traditional corporate suites easily runs **$60 to $300+ every single month**!

> 💡 **The Solution**: **Cloudflare Free Inbound + Resend 3,000 free monthly emails + EmailNative Local-First Client**, providing a $0/month, infinite-domain, dynamic-alias email solution with zero privacy compromise!

### 📊 Traditional Commercial Email vs. EmailNative

| Dimension | Traditional Email (Google / M365) | EmailNative Open-Source Solution |
| :--- | :--- | :--- |
| **Monthly Cost (10 Domains)** | **$60 ~ $120 / month** 💸 ($6/user/domain) | **$0 / Lifetime Free** 🚀 (Generous free quotas) |
| **Aliases & Prefixes** | Limited by vendor plan, manual setup | **Infinite Dynamic Aliases** (`Catch-all` wildcard) |
| **Keys & Data Privacy** | Hosted on vendor servers in plain text | **Local-First (Zero Server Relay)**, keys never leave device |
| **AI Automation** | Basic spam filter | **Native DeepSeek-R1** reasoning chain, instant 2FA parsing |
| **Multi-Domain Experience**| Constantly switching logins and tabs | **Unified desktop client with 1ms instant inbox switching** |

---

## 🏛️ Architecture: Zero-Server Relay

```
       ┌───────────────────────────────┐               ┌───────────────────────────────┐
       │     Inbound (Free & Fast)     │               │    Outbound (High Delivery)   │
       │   Cloudflare Email Routing    │               │          Resend API           │
       │  (Catch-all / Domain Wildcard)│               │   (DKIM / SPF Signed Mails)   │
       └───────────────┬───────────────┘               └───────────────▲───────────────┘
                       │                                               │
                       ▼                                               │
       ┌───────────────────────────────┐                               │
       │    Cloudflare Email Worker    │                               │
       │   • Parse MIME & write to D1  │                               │
       │   • Optional silent backup    │                               │
       └───────────────┬───────────────┘                               │
                       │ (Direct client pull)                          │ (Direct TLS Outbound)
                       ▼                                               │
   ┌───────────────────────────────────────────────────────────────────┴───────────────────────────────┐
   │                                EmailNative Client (Mac Native / Web / iOS)                        │
   │                                                                                                   │
   │  🔒 Absolute Privacy: All API Keys (Resend/DeepSeek/Cloudflare) stored strictly in local device   │
   │  📂 Local-First persistent storage with instant search across all domains                         │
   │  🧠 DeepSeek-R1 engine: Real-time reasoning chain, 2FA code extraction & draft composition        │
   │  ⚡ One-Click DNS & Deliverability Audit: Automated check for MX / SPF / DKIM / DMARC records     │
   └───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Core Highlights

- 🛡️ **Dual-Engine Protocol Support**:
  - **Cloudflare Routing Domains**: Native integration with Cloudflare Email Routing & Workers, dynamic wildcard Catch-all, unlimited addresses.
  - **Traditional Business Mailboxes (IMAP/SMTP)**: Connect standard corporate email accounts (Google Workspace, M365, Tencent, Alibaba, NetEase, custom servers).
- 🧠 **Native DeepSeek-R1 Reasoning Co-Pilot**:
  - Full display of cognitive thinking chains (`<think> ... </think>`).
  - Sentiment and urgency grading, context-aware reply suggestions.
  - **Cost protection**: On-demand execution with daily budget circuit-breakers.
- ⚡ **One-Click DNS & Delivery Health Audit**:
  - Client-side DoH inspection verifying MX, SPF, DKIM, and DMARC records to ensure your emails never end up in spam.
- 🔐 **Local-First & Zero-Server Relay**:
  - All API keys and email archives remain strictly on your local machine. No proprietary backend proxy.
- 🖥️ **macOS Native Polish**:
  - Seamless traffic-light window title integration, glassmorphic dark theme, crisp light theme, and keyboard shortcuts (<kbd>Cmd</kbd>+<kbd>N</kbd>, <kbd>Cmd</kbd>+<kbd>,</kbd>, <kbd>Cmd</kbd>+<kbd>R</kbd>).

---

## 🚀 5-Minute Quickstart

### 1. Cloudflare DNS & Email Routing
1. In Cloudflare Dashboard, open your domain and navigate to **Email** $\to$ **Email Routing**.
2. Enable Email Routing and add the standard MX, SPF, and DMARC records:
   - MX: `isaac.mx.cloudflare.net` (13), `linda.mx.cloudflare.net` (57), `amir.mx.cloudflare.net` (98)
   - SPF: `v=spf1 include:_spf.mx.cloudflare.net include:resend.com ~all`
   - DMARC: `v=DMARC1; p=none;`

### 2. Deploy Inbound Worker
1. Deploy `cloudflare/worker.js` as a Cloudflare Worker.
2. Bind a D1 database named **`DB`** (uppercase).
3. Set an Environment Variable **`ADMIN_TOKEN`**.
4. Set the Email Routing Catch-all rule to send to your Worker.

### 3. Configure Resend for Outbound
1. Add your domain in [Resend](https://resend.com) and verify DNS records.
2. Create an API Key and save it in EmailNative **Settings (<kbd>Cmd</kbd>+<kbd>,</kbd>)** $\to$ **Outbound**.

---

## 📖 Complete Documentation

- [English User Operations Manual](docs/OPERATION_MANUAL_EN.md)
- [Microsoft Word Compatible Manual (.DOC)](docs/EmailNative_User_Manual_EN.doc)
- [Cloudflare Inbound Deployment Guide](cloudflare_production_guide.md)

---

## 📜 License

Licensed under the [MIT License](LICENSE).
Contributions and feature suggestions are warmly welcomed!
