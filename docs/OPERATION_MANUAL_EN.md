# EmailNative: User Operations & Architecture Manual

<p align="center">
  <img src="../public/favicon.svg" width="96" height="96" alt="EmailNative Logo" />
</p>

<p align="center">
  <strong>The Next-Gen Local-First Multi-Domain Email Hub powered by Cloudflare Inbound, Resend Outbound, and DeepSeek-R1 Intelligence</strong>
</p>

<p align="center">
  <em>Zero Server Relay · Local-First Privacy · Infinite Dynamic Aliases · $0/month for Unlimited Domains</em>
</p>

---

## 1. Product Overview & Core Philosophy

### 1.1 The Challenge
Modern developers, indie makers, SaaS founders, and marketing teams often operate dozens of custom domain names (`company.ai`, `product.dev`, `brand.io`, etc.). Under conventional business email providers (Google Workspace, Microsoft 365, Fastmail):
- Each domain and mailbox costs **$6 to $12 per user/month**.
- Managing 10 domains can rapidly escalate email expenses to **$60 – $150+ monthly** ($720 – $1,800 annually).
- Switching between multiple web tabs and logins is cumbersome and fragmented.
- Cloud providers hold full unencrypted custody of emails, logs, and sensitive credentials.

### 1.2 The EmailNative Solution
EmailNative disrupts this paradigm by uniting three world-class infrastructures into a unified native desktop and web client:
1. **Cloudflare Email Routing (Inbound)**: Free, enterprise-grade MX receiving with dynamic Catch-all capabilities. Any alias (`billing@domain.com`, `support@domain.com`, `custom@domain.com`) is accepted and ingested automatically.
2. **Resend API / SMTP (Outbound)**: High-deliverability outbound delivery (3,000 free emails/month permanently) with strict DKIM, SPF, and DMARC anti-spam verification.
3. **DeepSeek-R1 Reasoning Engine (AI Co-Pilot)**: Deep cognitive analysis (`deepseek-reasoner` / `deepseek-chat`) displaying real-time `<think>` chains, automated 2FA code extraction, sentiment/urgency grading, and context-aware reply generation.
4. **Local-First & Zero-Server Relay**: Your credentials (Resend API keys, DeepSeek keys, Cloudflare tokens) and email archives are persisted strictly inside local client storage. Zero middleman server.

---

## 2. Architecture & Data Flow

```
   ┌───────────────────────────────────┐               ┌───────────────────────────────────┐
   │      Inbound Email Ingestion      │               │     Outbound High-Deliverability  │
   │      Cloudflare Email Routing     │               │              Resend API           │
   │  (Wildcard Catch-all / Any Prefix)│               │   (DKIM / SPF Signed Deliveries)  │
   └─────────────────┬─────────────────┘               └─────────────────▲─────────────────┘
                     │                                                   │
                     ▼                                                   │
   ┌───────────────────────────────────┐                                 │
   │      Cloudflare Email Worker      │                                 │
   │  • Parses MIME envelope & payload │                                 │
   │  • Saves to D1 SQLite Database    │                                 │
   │  • Optional Master Gmail forward  │                                 │
   └─────────────────┬─────────────────┘                                 │
                     │ (Encrypted Direct Pull)                           │ (Direct TLS Outbound)
                     ▼                                                   │
┌────────────────────────────────────────────────────────────────────────┴──────────────────────────┐
│                               EmailNative Native Workspace (Mac / Web / iOS)                      │
│                                                                                                   │
│  🔒 Privacy Sandbox: API Keys stored strictly in Local Keychain / LocalStorage                    │
│  ⚡ Instant Search & Multi-Domain Categorization in milliseconds                                   │
│  🧠 DeepSeek-R1 Engine: On-demand reasoning, 2FA code parsing, professional draft generation       │
│  🛡️ One-Click DNS Inspector: Live DoH validation of MX, SPF, DKIM, and DMARC records              │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Getting Started: 5-Minute Quick Setup

### 3.1 Step 1: Configure Cloudflare Email Routing
1. Sign in to your [Cloudflare Dashboard](https://dash.cloudflare.com/) and select your custom domain.
2. Navigate to **Email** $\to$ **Email Routing** and click **Enable Email Routing**.
3. Add the required DNS records automatically or manually:
   - **MX Records**:
     - `isaac.mx.cloudflare.net` (Priority: 13)
     - `linda.mx.cloudflare.net` (Priority: 57)
     - `amir.mx.cloudflare.net` (Priority: 98)
   - **SPF Record**:
     - `v=spf1 include:_spf.mx.cloudflare.net include:resend.com ~all`
   - **DMARC Record**:
     - Host: `_dmarc`
     - Value: `v=DMARC1; p=none;`

### 3.2 Step 2: Deploy Cloudflare Inbound Worker
1. In Cloudflare, navigate to **Compute (Workers & Pages)** $\to$ **Create Application** $\to$ **Worker**.
2. Name your worker (e.g., `emailnative-gateway`).
3. In Worker **Settings** $\to$ **Bindings**, bind a D1 database named **`DB`** (must be uppercase `DB`).
4. Set an Environment Variable named **`ADMIN_TOKEN`** with a secure random secret token.
5. Deploy the provided Worker script (`cloudflare/worker.js`).
6. Back in **Email Routing** $\to$ **Routing Rules**, set the **Catch-all** rule to send to your newly deployed Worker.

### 3.3 Step 3: Configure Outbound Channel (Resend)
1. Register a free account at [Resend.com](https://resend.com).
2. Add your domain in the **Domains** section and verify the DKIM CNAME/TXT records in Cloudflare DNS.
3. Generate an API Key under **API Keys** with "Sending access".
4. Open EmailNative **Settings (<kbd>Cmd</kbd>+<kbd>,</kbd>)** $\to$ **Outbound** tab, paste your Resend API Key, and save.

---

## 4. Multi-Domain & Inboxes Management

### 4.1 Adding Custom Domains
1. Open the **Domains** management screen via the left sidebar.
2. Choose between two domain hosting modes:
   - **Cloudflare Email Routing Domain (Infinite Aliases)**: Enter your registered domain name (`brand.com`) and click **Bind Cloudflare Domain**.
   - **Standard Business Mailbox (IMAP/SMTP)**: Connect traditional mail providers (Google Workspace, Microsoft 365, Tencent Enterprise, NetEase, Alibaba, or custom self-hosted servers) using standard server host, port, and app credentials.

### 4.2 Dynamic Aliases & Dedicated Inboxes
- Under any Cloudflare-managed domain, you can create dedicated aliases (e.g., `support@`, `billing@`, `founders@`, `security@`).
- Any newly incoming email to an unlisted alias will be automatically captured, organized, and visible in the client.
- You can toggle individual aliases between Active/Inactive states or assign specialized AI personas and signatures per alias.

### 4.3 Central Master Backup (Optional Dual Backup)
- In **Settings** $\to$ **Cloudflare** or on the Domain screen, you can specify a **Central Master Forwarding Mailbox** (e.g., `my-personal@gmail.com`).
- When populated, every incoming message received across all your custom domains will be silently forwarded to your primary Gmail/Outlook inbox as a redundant historical backup before being indexed into your client D1 database.

---

## 5. AI Co-Pilot: DeepSeek-R1 Intelligence

EmailNative features deep integration with the **DeepSeek-R1** cognitive architecture.

### 5.1 On-Demand Analysis & Cost Protection
- **No Wasteful Background Token Consumption**: Inbound emails arrive without automatically triggering billable API calls.
- **On-Demand "AI Analysis" Button**: When reviewing high-priority feedback, enterprise inquiries, or complex user correspondence, click **"AI Analysis"** to inspect the email intent.
- **Emergency Circuit Breaker**: You can configure a **Max Cost Per Run** (e.g. $0.05) and a **Daily Budget Limit** (e.g. $1.00). If daily token expenditure hits the watermark, AI processing halts automatically to protect your funds.
- **Emergency Stop**: If an ongoing reasoning query is taking too long or was triggered accidentally, click **Emergency Stop** to instantly abort the network stream and freeze token metering.

### 5.2 Deep Cognitive Reasoning (`<think>`)
When using `deepseek-reasoner`, the client showcases the complete chain-of-thought in real-time (styled after DSCode / modern agentic IDEs):
- Analysis of customer intent, emotional sentiment, and urgency score (High / Medium / Low).
- Automatic identification of follow-up requirements and suggested actions.
- Auto-drafted professional reply based on the specific domain's brand persona.

### 5.3 One-Click 2FA / Verification Code Extraction
- For transactional emails containing one-time passwords (OTP) or authentication codes (e.g. GitHub, AWS, Stripe), EmailNative isolates the numeric/alphanumeric code into an illuminated high-contrast card.
- A single click copies the verification code directly to your clipboard.

---

## 6. One-Click DNS & Deliverability Audit

Email deliverability is critical. Emails landing in spam folders typically result from missing or misconfigured DNS records. EmailNative provides a built-in **DNS Health Inspector**:

- **MX Records Check**: Validates whether your domain points properly to active receiving mail exchangers.
- **SPF (Sender Policy Framework)**: Verifies that your authorized outbound sender IP/include directives (`include:resend.com`) are present in DNS TXT records.
- **DKIM (DomainKeys Identified Mail)**: Confirms that cryptographic public keys are published correctly to prevent sender spoofing.
- **DMARC (Domain-based Message Authentication)**: Validates your domain reporting and enforcement policies.
- **Overall Health Score**: Delivers a graded scorecard (Excellent / Good / Needs Improvement) with precise copy-paste DNS correction snippets.

---

## 7. Keyboard Shortcuts & Native Controls

| Shortcut | Function | Description |
| :--- | :--- | :--- |
| <kbd>Cmd</kbd> + <kbd>N</kbd> | Compose Email | Opens clean modal composer with domain selector |
| <kbd>Cmd</kbd> + <kbd>,</kbd> | Preferences | Opens Settings (LLM, Cloudflare, Outbound, Appearance) |
| <kbd>Cmd</kbd> + <kbd>R</kbd> | Sync Inbound | Pulls latest live messages from Cloudflare Worker D1 |
| <kbd>Cmd</kbd> + <kbd>T</kbd> | Toggle Theme | Switches instantly between Dark Glass and Pure Light |
| <kbd>Esc</kbd> | Close Modal | Closes active modal, preview drawer, or composer |

---

## 8. Troubleshooting & FAQ

### Q1: Inbound emails are not appearing after clicking "Sync Inbound".
1. Verify in Cloudflare Worker **Settings $\to$ Bindings** that your D1 database is named exactly **`DB`** (all caps).
2. Check Cloudflare **Email Routing $\to$ Routing Rules** to ensure your Catch-all rule routes directly to the Worker.
3. In EmailNative **Settings $\to$ Cloudflare**, click **"Test Worker Connectivity"**. If the cloud shows 0 emails, check Cloudflare Worker **Logs (Real-time stream)** during a test email delivery.

### Q2: Outbound emails are rejected or going to spam.
1. Run the **One-Click DNS Health Inspector** in EmailNative.
2. Confirm that `include:resend.com` is present in your root SPF TXT record.
3. Confirm that the DKIM CNAME record supplied by Resend is marked as **DNS Only** (Grey Cloud) in Cloudflare, rather than Proxied (Orange Cloud).

### Q3: Are my API keys safe?
Yes. EmailNative operates under a strict **Zero-Server Relay** architecture. All API credentials and communications flow directly between your client machine and the official APIs (Cloudflare, Resend, DeepSeek). No proprietary intermediate servers are ever contacted.

---

## 9. License & Open Source

EmailNative is released under the **MIT License**.
Contributions, pull requests, and bug reports are warmly welcomed on [GitHub](https://github.com/mailisilove/EmailNative).
