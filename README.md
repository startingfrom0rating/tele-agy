# 🚀 Tele-AGY: Remote Telegram CLI Bridge for Antigravity

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Antigravity CLI](https://img.shields.io/badge/CLI-Antigravity%20(agy)-blue.svg)](https://antigravity.google)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Tele-AGY** is a lightweight, secure Node.js daemon that bridges the official **Google Antigravity CLI (`agy`)** into a remote-controlled Telegram bot. It allows you to run prompts, switch AI models, navigate projects, inspect token quotas, and capture live multi-monitor desktop screenshots remotely from your phone or desktop.

---

## 📐 Architecture Overview

```text
┌───────────────────────────┐
│   Telegram Phone App      │
└─────────────┬─────────────┘
              │ (Commands, Text Prompts, Screenshots)
              ▼
┌───────────────────────────┐
│   Telegram Bot API        │
└─────────────┬─────────────┘
              │ (HTTPS Long Polling)
              ▼
┌─────────────────────────────────────────────────────────────┐
│   `tele-agy` Local Daemon (Node.js)                         │
│                                                             │
│   ├── 🔒 Whitelist Auth Guard (TELEGRAM_USER_ID)            │
│   ├── 📁 Project & Workspace Directory Manager              │
│   ├── 📸 Multi-Monitor Screen Capture Engine               │
│   └── ⚡ AGY Process Subprocess Controller                  │
└─────────────┬───────────────────────────────────────────────┘
              │ (stdio: stdin / stdout / stderr)
              ▼
┌───────────────────────────┐
│    `agy` CLI Process      │
└───────────────────────────┘
```

---

## ✨ Features

- 🔒 **Security Whitelist Lock**: Rejects all unauthorized users; only responds to your configured `TELEGRAM_USER_ID`.
- 🧠 **Full Model Suite (`/model`)**: Interactively switch between all 11 official Antigravity models (`Gemini 3.6 Flash (High/Low)`, `Gemini 3.1 Pro (High/Low)`, `Claude Sonnet 4.6`, `Claude Opus 4.6`, `GPT-OSS 120B`).
- 🛠 **Execution Modes (`/mode`)**: Toggle between `accept-edits` (automatic execution) and `plan` (planning mode).
- 📊 **Quota & Usage Monitor (`/usage`)**: View 5-hour rolling window reset countdowns, weekly token consumption, and active rate limits.
- 📸 **Multi-Monitor Desktop Capture (`/screenshot`)**: Send `/screenshot` to receive a full-resolution PNG capture of your host desktop across all connected monitors.
- 📁 **Interactive Project Switcher (`/projects` / `/project`)**: Scan workspace subdirectories and switch active working directory using inline buttons or `/cd <path>`.
- 🏓 **Latency & Health Check (`/ping`)**: Verify daemon responsiveness and message latency.
- 🛑 **Process Interruption (`/stop`)**: Send `SIGINT` to safely stop long-running prompt generations.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Antigravity CLI**: `agy` installed globally and logged in
- **Telegram Account**:
  - Bot Token from `@BotFather`
  - Numerical User ID from `@userinfobot`

### 2. Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/startingfrom0rating/tele-agy.git
cd tele-agy

# 2. Install dependencies
npm install

# 3. Create your configuration file
cp .env.example .env
```

### 3. Configure Credentials

Edit `.env` with your Telegram credentials:

```env
TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN_FROM_BOTFATHER"
TELEGRAM_USER_ID="YOUR_NUMERICAL_TELEGRAM_USER_ID"
WORKSPACE_DIR="C:/Users/yourusername/Projects"
DEFAULT_MODEL="Gemini 3.6 Flash (High)"
```

### 4. Launch the Daemon

```bash
# Launch daemon in terminal
npm start
```

*Optional: Run continuously in background using PM2:*
```bash
npx pm2 start src/index.js --name "tele-agy"
```

---

## 🤖 Command Reference

| Command | Alias | Description |
| :--- | :--- | :--- |
| `/start` | `/help` | Show command menu and usage instructions |
| `/ping` | - | Check bot responsiveness and latency |
| `/usage` | `/limits`, `/quota` | Display 5-hour rolling quota reset timer & weekly token consumption |
| `/status` | - | Display active directory (`CWD`), active model, execution mode, and process state |
| `/model` | `/model <name>` | Select from all 11 Antigravity models or set custom model |
| `/mode` | `/mode <mode>` | Switch execution mode (`accept-edits` vs `plan`) |
| `/projects` | `/project` | List subfolders in workspace and switch active project directory |
| `/cd <path>` | - | Manually set the execution directory |
| `/screenshot` | - | Capture all host desktop monitors and send photo |
| `/stop` | - | Send `SIGINT` to stop currently running `agy` prompt |
| `/new` | - | Reset context session |
| `/sessions` | - | Display current session directory info |

---

## 🧪 Running Tests

```bash
npm test
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
