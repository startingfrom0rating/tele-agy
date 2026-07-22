import { loadConfig } from './config.js';
import { AgyRunner } from './agyRunner.js';
import { createTeleAgyBot } from './bot.js';

async function main() {
  console.log('🚀 Starting Tele-AGY daemon...');
  
  let config;
  try {
    config = loadConfig();
  } catch (err) {
    console.error(`❌ Configuration Error: ${err.message}`);
    console.error('Please ensure .env is created with TELEGRAM_BOT_TOKEN and TELEGRAM_USER_ID.');
    process.exit(1);
  }

  const agyRunner = new AgyRunner({
    cwd: config.workspaceDir,
    model: config.defaultModel
  });

  const bot = createTeleAgyBot({ config, agyRunner });

  // Handle graceful shutdown
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  console.log(`✅ Tele-AGY daemon running! Authorized User ID: ${config.userId}`);
  console.log(`📁 Default Workspace: ${config.workspaceDir}`);
  console.log(`🧠 Default Model: ${config.defaultModel}`);

  await bot.start({
    onStart: (botInfo) => {
      console.log(`🤖 Telegram Bot @${botInfo.username} listening for commands.`);
    }
  });
}

main().catch((err) => {
  console.error('Fatal daemon error:', err);
  process.exit(1);
});
