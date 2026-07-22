import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log('');
  console.log('🚀 Tele-AGY Setup Wizard');
  console.log('========================');
  console.log('');

  // Check Node version
  const nodeVersion = parseInt(process.versions.node.split('.')[0], 10);
  if (nodeVersion < 18) {
    console.error(`❌ Node.js v18+ is required. You have v${process.versions.node}`);
    process.exit(1);
  }
  console.log(`✅ Node.js v${process.versions.node}`);

  // Check agy CLI
  try {
    execSync('agy --version', { stdio: 'ignore' });
    console.log('✅ Antigravity CLI (agy) found');
  } catch {
    console.log('⚠️  Antigravity CLI (agy) not found in PATH — make sure it is installed');
  }

  // Check for existing .env
  if (fs.existsSync(envPath)) {
    const overwrite = await ask('\n⚠️  .env already exists. Overwrite? [y/N]: ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled. Your existing .env was preserved.');
      rl.close();
      return;
    }
  }

  console.log('');
  console.log('🔧 Configuration');
  console.log('-----------------');
  console.log('You\'ll need:');
  console.log('  • Bot Token from @BotFather on Telegram');
  console.log('  • Your User ID from @userinfobot on Telegram');
  console.log('');

  const botToken = await ask('Telegram Bot Token (from @BotFather): ');
  if (!botToken.trim()) {
    console.error('❌ Bot token is required.');
    process.exit(1);
  }

  const userId = await ask('Your Telegram User ID (from @userinfobot): ');
  if (!userId.trim() || isNaN(Number(userId.trim()))) {
    console.error('❌ A valid numeric User ID is required.');
    process.exit(1);
  }

  const defaultWorkspace = process.cwd();
  const workspace = (await ask(`Workspace directory [${defaultWorkspace}]: `)).trim() || defaultWorkspace;

  const defaultModel = 'Gemini 3.6 Flash (High)';
  const model = (await ask(`Default model [${defaultModel}]: `)).trim() || defaultModel;

  // Write .env
  const envContent = [
    `TELEGRAM_BOT_TOKEN="${botToken.trim()}"`,
    `TELEGRAM_USER_ID="${userId.trim()}"`,
    `WORKSPACE_DIR="${workspace}"`,
    `DEFAULT_MODEL="${model}"`,
    ''
  ].join('\n');

  fs.writeFileSync(envPath, envContent, 'utf8');

  console.log('');
  console.log('✅ Configuration saved to .env');
  console.log('');
  console.log('┌─────────────────────────────────────────┐');
  console.log('│  Tele-AGY is ready!                     │');
  console.log('│                                         │');
  console.log('│  Start the bot:  npm start              │');
  console.log('└─────────────────────────────────────────┘');
  console.log('');

  const startNow = await ask('Start the bot now? [Y/n]: ');
  rl.close();

  if (startNow.toLowerCase() !== 'n') {
    const { createTeleAgyBot } = await import('../src/bot.js');
    const { AgyRunner } = await import('../src/agyRunner.js');
    const { loadConfig } = await import('../src/config.js');

    const config = loadConfig();
    const agyRunner = new AgyRunner({ cwd: config.workspaceDir, model: config.defaultModel });
    const bot = createTeleAgyBot({ config, agyRunner });

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    console.log(`✅ Tele-AGY daemon running! Authorized User ID: ${config.userId}`);
    await bot.start({
      onStart: (botInfo) => console.log(`🤖 Telegram Bot @${botInfo.username} listening for commands.`)
    });
  }
}

main().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
