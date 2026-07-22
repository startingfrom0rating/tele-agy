# 🚀 Tele-AGY: Remote Telegram Bridge for Antigravity CLI

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Antigravity CLI](https://img.shields.io/badge/CLI-Antigravity%20(agy)-blue.svg)](https://antigravity.google)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Tele-AGY** is a lightweight, secure Node.js daemon that bridges the official **Google Antigravity CLI (`agy`)** into a remote-controlled Telegram bot. Run prompts, switch AI models, navigate projects, inspect token quotas, and capture live desktop screenshots — all from your phone.

---

## ⚡ One-Command Install

**Windows** — open PowerShell and run:
```powershell
git clone https://github.com/startingfrom0rating/tele-agy.git; cd tele-agy; npm install; npm run setup
```

**macOS / Linux** — open a terminal and run:
```bash
git clone https://github.com/startingfrom0rating/tele-agy.git && cd tele-agy && npm install && npm run setup
```

The interactive setup wizard will walk you through configuration and offer to start the bot immediately.

---

## 📐 Architecture

```text
┌───────────────────────────┐
│   Telegram Phone App      │
└─────────────┬─────────────┘
              │ (Commands, Text Prompts)
              ▼
┌───────────────────────────┐
│   Telegram Bot API        │
└─────────────┬─────────────┘
              │ (HTTPS Long Polling)
              ▼
┌─────────────────────────────────────────────────────────────┐
│   tele-agy Local Daemon (Node.js)                           │
│                                                             │
│   ├── 🔒 Whitelist Auth Guard (TELEGRAM_USER_ID)            │
│   ├── 📁 Project & Workspace Directory Manager              │
│   ├── 📸 Multi-Monitor Screen Capture Engine               │
│   └── ⚡ AGY Subprocess Controller                          │
└─────────────┬───────────────────────────────────────────────┘
              │ (stdio)
              ▼
┌───────────────────────────┐
│    agy CLI Process        │
└───────────────────────────┘
```

---

## ✨ Features

- 🔒 **Security Lock**: Only responds to your configured Telegram User ID
- 🧠 **All 11 Models** (`/model`): Gemini 3.6 Flash, Gemini 3.1 Pro, Claude Sonnet/Opus 4.6, GPT-OSS 120B
- 🛠 **Execution Modes** (`/mode`): `accept-edits` or `plan`
- 📊 **Quota Monitor** (`/usage`): 5-hour rolling window & weekly token limits
- 📸 **Desktop Capture** (`/screenshot`): Full multi-monitor screenshot to Telegram
- 📁 **Project Switcher** (`/projects`): Browse & switch workspace directories
- 🏓 **Health Check** (`/ping`): Verify daemon latency

---

## 🤖 Commands

| Command | Description |
| :--- | :--- |
| `/start` `/help` | Show command menu |
| `/ping` | Check latency |
| `/usage` `/limits` | View quota & usage |
| `/status` | Active model, mode, CWD |
| `/model` | Switch AI model (11 options) |
| `/mode` | Switch execution mode |
| `/projects` | Browse & switch project folders |
| `/cd <path>` | Set working directory |
| `/screenshot` | Capture desktop |
| `/stop` | Kill running prompt |
| `/new` | Reset session |

Or just type any message to send a prompt to AGY.

---

## 🔧 Manual Setup

If you prefer to configure manually instead of using the setup wizard:

```bash
git clone https://github.com/startingfrom0rating/tele-agy.git
cd tele-agy
npm install
cp .env.example .env
```

Edit `.env`:
```env
TELEGRAM_BOT_TOKEN="your-token-from-botfather"
TELEGRAM_USER_ID="your-numeric-user-id"
WORKSPACE_DIR="/path/to/your/projects"
DEFAULT_MODEL="Gemini 3.6 Flash (High)"
```

Start:
```bash
npm start
```

---

## 🧪 Tests

```bash
npm test
```

---

## 📄 License

[MIT](LICENSE)
