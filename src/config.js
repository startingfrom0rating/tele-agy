import dotenv from 'dotenv';
dotenv.config();

export function loadConfig(env = process.env) {
  const botToken = env.TELEGRAM_BOT_TOKEN;
  const userIdRaw = env.TELEGRAM_USER_ID;
  const workspaceDir = env.WORKSPACE_DIR || process.cwd();
  const defaultModel = env.DEFAULT_MODEL || 'Gemini 3.6 Flash (High)';

  if (!botToken) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN in environment');
  }
  if (!userIdRaw) {
    throw new Error('Missing TELEGRAM_USER_ID in environment');
  }

  const userId = Number(userIdRaw);
  if (Number.isNaN(userId)) {
    throw new Error('TELEGRAM_USER_ID must be a valid number');
  }

  return {
    botToken,
    userId,
    workspaceDir,
    defaultModel
  };
}
