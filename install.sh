#!/usr/bin/env bash
set -e

echo ""
echo "🚀 Tele-AGY Installer"
echo "====================="
echo ""

# Check prerequisites
if ! command -v node &>/dev/null; then
  echo "❌ Node.js is required. Install from https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js v18+ is required. You have $(node -v)"
  exit 1
fi

if ! command -v git &>/dev/null; then
  echo "❌ Git is required."
  exit 1
fi

if ! command -v agy &>/dev/null; then
  echo "⚠️  Warning: 'agy' CLI not found in PATH. Make sure Antigravity CLI is installed."
fi

# Clone
INSTALL_DIR="${1:-tele-agy}"
if [ ! -d "$INSTALL_DIR" ]; then
  echo "📥 Cloning tele-agy..."
  git clone https://github.com/startingfrom0rating/tele-agy.git "$INSTALL_DIR"
else
  echo "📁 Directory '$INSTALL_DIR' already exists, skipping clone."
fi
cd "$INSTALL_DIR"

# Install deps
echo ""
echo "📦 Installing dependencies..."
npm install --silent

# Interactive .env setup
echo ""
echo "🔧 Configuration"
echo "-----------------"
echo "You'll need:"
echo "  • Bot Token from @BotFather on Telegram"
echo "  • Your User ID from @userinfobot on Telegram"
echo ""

read -rp "Telegram Bot Token (from @BotFather): " BOT_TOKEN
if [ -z "$BOT_TOKEN" ]; then
  echo "❌ Bot token is required."
  exit 1
fi

read -rp "Your Telegram User ID (from @userinfobot): " USER_ID
if [ -z "$USER_ID" ]; then
  echo "❌ User ID is required."
  exit 1
fi

read -rp "Workspace directory [$(pwd)]: " WORKSPACE
WORKSPACE="${WORKSPACE:-$(pwd)}"

read -rp "Default model [Gemini 3.6 Flash (High)]: " MODEL
MODEL="${MODEL:-Gemini 3.6 Flash (High)}"

cat > .env << EOF
TELEGRAM_BOT_TOKEN="$BOT_TOKEN"
TELEGRAM_USER_ID="$USER_ID"
WORKSPACE_DIR="$WORKSPACE"
DEFAULT_MODEL="$MODEL"
EOF

echo ""
echo "✅ Configuration saved to .env"
echo ""
echo "┌─────────────────────────────────────┐"
echo "│  Tele-AGY installed successfully!   │"
echo "│                                     │"
echo "│  To start:  cd $INSTALL_DIR && npm start  │"
echo "└─────────────────────────────────────┘"
echo ""

read -rp "Start the bot now? [Y/n]: " START
if [ "$START" != "n" ] && [ "$START" != "N" ]; then
  npm start
fi
