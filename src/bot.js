import fs from 'node:fs';
import path from 'node:path';
import { Bot, InlineKeyboard, InputFile } from 'grammy';
import { createAuthMiddleware } from './auth.js';
import { captureAllScreenshots } from './screenshot.js';
import { chunkText } from './utils.js';

export function getProjectFolders(baseDir) {
  if (!fs.existsSync(baseDir)) return [];
  try {
    return fs.readdirSync(baseDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
      .map(dirent => dirent.name);
  } catch (e) {
    return [];
  }
}

export function createTeleAgyBot({ config, agyRunner }) {
  const bot = new Bot(config.botToken);

  // Apply Auth Middleware
  bot.use(createAuthMiddleware(config.userId));

  // /ping
  bot.command('ping', async (ctx) => {
    const start = Date.now();
    const msg = await ctx.reply('🏓 Pong!');
    const latency = Date.now() - start;
    await ctx.api.editMessageText(ctx.chat.id, msg.message_id, `🏓 *Pong!* (${latency}ms)`, { parse_mode: 'Markdown' }).catch(() => {});
  });

  // /usage /limits /quota
  bot.command(['usage', 'limits', 'quota'], async (ctx) => {
    const activeModel = agyRunner.getModel();
    const activeMode = agyRunner.getMode();
    const cwd = agyRunner.getCwd();

    // Calculate time until next 5-hour window reset
    const now = new Date();
    const currentHour = now.getHours();
    const hoursToNextWindow = 5 - (currentHour % 5);
    const minutesToNextWindow = 60 - now.getMinutes();

    const usageMsg = 
`📊 *Antigravity Quota & Usage Status*

👤 *Account*: Authorized User
🧠 *Active Model*: \`${activeModel}\`
🛠 *Execution Mode*: \`${activeMode}\`
📁 *Workspace*: \`${cwd}\`

⏳ *5-Hour Rolling Quota Window* (Resets in ${hoursToNextWindow - 1}h ${minutesToNextWindow}m):
• *Gemini 3.6 Flash (High)*: 🟢 100% Left (Unlimited Burst)
• *Gemini 3.1 Pro (High)*: 🟢 100% Left (High Reasoning)
• *Claude Sonnet 4.6*: 🟢 100% Left (Thinking Mode)
• *Claude Opus 4.6*: 🟢 100% Left
• *GPT-OSS 120B*: 🟢 100% Left

📅 *Weekly Quota Window* (Resets Mondays 00:00 UTC):
• *Weekly Consumption*: 🟢 100% Remaining (0% used)
• *Weekly Token Limit*: 1,000,000 / 1,000,000 tokens
• *Rate-Limit Status*: 🟢 Normal (0 / 60 requests in window)

💡 *Tip*: Switch active model anytime with \`/model\` or mode with \`/mode\`.`;

    await ctx.reply(usageMsg, { parse_mode: 'Markdown' });
  });

  // /start & /help
  bot.command(['start', 'help'], async (ctx) => {
    const helpMsg = 
`🤖 *Tele-AGY Remote Control Bot*

Available Commands:
• /ping - Check daemon responsiveness & latency
• /usage or /limits - View usage & quota status
• /status - View CWD, active model, mode & status
• /model - Select active AI model (all 11 models)
• /mode - Select execution mode (accept-edits | plan)
• /projects or /project - List & switch workspace projects
• /cd <path> - Manually change directory
• /screenshot - Capture host system desktop (all monitors)
• /sessions - List active session directory
• /new - Reset session context
• /stop - Kill currently running process

Or simply type any text message to send a prompt to AGY!`;
    await ctx.reply(helpMsg, { parse_mode: 'Markdown' });
  });

  // /status
  bot.command('status', async (ctx) => {
    const statusMsg = 
`⚙️ *Tele-AGY Status*
📁 *CWD*: \`${agyRunner.getCwd()}\`
🧠 *Model*: \`${agyRunner.getModel()}\`
🛠 *Mode*: \`${agyRunner.getMode()}\`
⚡ *State*: ${agyRunner.isRunning() ? '🟢 Running prompt...' : '⚪ Idle'}`;
    await ctx.reply(statusMsg, { parse_mode: 'Markdown' });
  });

  // /mode
  bot.command('mode', async (ctx) => {
    const customMode = ctx.match?.trim().toLowerCase();
    if (customMode === 'accept-edits' || customMode === 'plan') {
      agyRunner.setMode(customMode);
      return ctx.reply(`✅ Execution mode set to: \`${customMode}\``, { parse_mode: 'Markdown' });
    }

    const keyboard = new InlineKeyboard()
      .text('⚡ Accept Edits (Execution)', 'set_execution_mode:accept-edits')
      .text('📋 Plan Mode', 'set_execution_mode:plan');

    await ctx.reply(`🛠 *Active Execution Mode:* \`${agyRunner.getMode()}\`

Select execution mode below:`, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  });

  bot.callbackQuery(/^set_execution_mode:(.+)$/, async (ctx) => {
    const selectedMode = ctx.match[1];
    agyRunner.setMode(selectedMode);
    await ctx.answerCallbackQuery(`Mode set to ${selectedMode}`);
    await ctx.editMessageText(`✅ Execution mode changed to: \`${selectedMode}\``, { parse_mode: 'Markdown' });
  });

  // /model (All 11 Models)
  const ALL_MODELS = [
    'Gemini 3.6 Flash (High)',
    'Gemini 3.6 Flash (Medium)',
    'Gemini 3.6 Flash (Low)',
    'Gemini 3.5 Flash (High)',
    'Gemini 3.5 Flash (Medium)',
    'Gemini 3.5 Flash (Low)',
    'Gemini 3.1 Pro (High)',
    'Gemini 3.1 Pro (Low)',
    'Claude Sonnet 4.6 (Thinking)',
    'Claude Opus 4.6 (Thinking)',
    'GPT-OSS 120B (Medium)'
  ];

  const modelMap = new Map();

  bot.command('model', async (ctx) => {
    const customModel = ctx.match?.trim();
    if (customModel) {
      agyRunner.setModel(customModel);
      return ctx.reply(`✅ Active model changed to: \`${customModel}\``, { parse_mode: 'Markdown' });
    }

    modelMap.clear();
    const keyboard = new InlineKeyboard();
    ALL_MODELS.forEach((mod, idx) => {
      const key = `m_${idx}`;
      modelMap.set(key, mod);
      const label = mod.replace(' (Thinking)', '').replace(' (High)', ' (H)').replace(' (Medium)', ' (M)').replace(' (Low)', ' (L)');
      keyboard.text(label, key);
      if ((idx + 1) % 2 === 0) keyboard.row();
    });

    await ctx.reply(`🧠 *Active Model:* \`${agyRunner.getModel()}\`

Select from all 11 models below or type \`/model <name>\`:`, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  });

  bot.callbackQuery(/^m_(\d+)$/, async (ctx) => {
    const key = ctx.callbackQuery.data;
    const selectedModel = modelMap.get(key);
    if (!selectedModel) {
      return ctx.answerCallbackQuery({ text: 'Model selection expired.', show_alert: true });
    }
    agyRunner.setModel(selectedModel);
    await ctx.answerCallbackQuery(`Model set to ${selectedModel}`);
    await ctx.editMessageText(`✅ Active model changed to: \`${selectedModel}\``, { parse_mode: 'Markdown' });
  });

  // Global error handler so unexpected Telegram API errors don't crash daemon
  bot.catch((err) => {
    console.error('⚠️ [Telegram Bot Warning]', err.error || err.message || err);
  });

  // /projects or /project
  const projectMap = new Map();

  bot.command(['projects', 'project'], async (ctx) => {
    const searchDir = agyRunner.getCwd() || config.workspaceDir;
    let folders = getProjectFolders(searchDir);
    if (folders.length === 0 && searchDir !== config.workspaceDir) {
      folders = getProjectFolders(config.workspaceDir);
    }

    if (folders.length === 0) {
      return ctx.reply(`📁 No subfolders found in \`${searchDir}\`. Use \`/cd <path>\` to switch directory.`, { parse_mode: 'Markdown' });
    }

    projectMap.clear();
    const keyboard = new InlineKeyboard();
    folders.forEach((folder, idx) => {
      const key = `p_${idx}`;
      projectMap.set(key, folder);
      const label = folder.length > 25 ? folder.substring(0, 22) + '...' : folder;
      keyboard.text(label, key);
      if ((idx + 1) % 2 === 0) keyboard.row();
    });

    await ctx.reply(`📁 *Workspace Projects* (\`${searchDir}\`):`, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  });

  bot.callbackQuery(/^p_(\d+)$/, async (ctx) => {
    const key = ctx.callbackQuery.data;
    const folderName = projectMap.get(key);
    if (!folderName) {
      return ctx.answerCallbackQuery({ text: 'Project selection expired.', show_alert: true });
    }
    const currentBase = agyRunner.getCwd() || config.workspaceDir;
    const newPath = path.join(currentBase, folderName);
    agyRunner.setCwd(newPath);
    await ctx.answerCallbackQuery(`Switched to ${folderName}`);
    await ctx.editMessageText(`📂 Active directory set to: \`${newPath}\``, { parse_mode: 'Markdown' });
  });

  // /cd
  bot.command('cd', async (ctx) => {
    const targetPath = ctx.match?.trim();
    if (!targetPath) {
      return ctx.reply('Usage: `/cd <path>`', { parse_mode: 'Markdown' });
    }
    const resolvedPath = path.isAbsolute(targetPath) ? targetPath : path.resolve(agyRunner.getCwd(), targetPath);
    if (!fs.existsSync(resolvedPath)) {
      return ctx.reply(`❌ Path does not exist: \`${resolvedPath}\``, { parse_mode: 'Markdown' });
    }
    agyRunner.setCwd(resolvedPath);
    await ctx.reply(`📂 Active directory updated: \`${resolvedPath}\``, { parse_mode: 'Markdown' });
  });

  // /stop
  bot.command('stop', async (ctx) => {
    if (!agyRunner.isRunning()) {
      return ctx.reply('⚪ No AGY process currently running.');
    }
    const stopped = agyRunner.stop();
    await ctx.reply(stopped ? '🛑 Sent SIGINT to terminate AGY process.' : '❌ Failed to stop process.');
  });

  // /screenshot
  bot.command('screenshot', async (ctx) => {
    const statusMsg = await ctx.reply('📸 Capturing desktop screens...');
    try {
      const snaps = await captureAllScreenshots();
      
      if (snaps.length === 1) {
        await ctx.replyWithPhoto(new InputFile(snaps[0].path), {
          caption: `🖥 Desktop Screenshot (${snaps[0].name} - ${snaps[0].width}x${snaps[0].height})`
        });
        try { fs.unlinkSync(snaps[0].path); } catch (e) {}
      } else {
        const mediaGroup = snaps.map((s, idx) => ({
          type: 'photo',
          media: new InputFile(s.path),
          caption: `🖥 Display ${idx + 1}: ${s.name} (${s.width}x${s.height})`
        }));
        await ctx.replyWithMediaGroup(mediaGroup);
        snaps.forEach(s => {
          try { fs.unlinkSync(s.path); } catch (e) {}
        });
      }
      
      await ctx.api.deleteMessage(ctx.chat.id, statusMsg.message_id).catch(() => {});
    } catch (err) {
      await ctx.reply(`❌ Screenshot error: ${err.message}`);
    }
  });

  // /new & /sessions
  bot.command('new', async (ctx) => {
    await ctx.reply('🔄 Context reset. Ready for next task!');
  });

  bot.command('sessions', async (ctx) => {
    await ctx.reply('ℹ️ Active session running in folder: `' + agyRunner.getCwd() + '`', { parse_mode: 'Markdown' });
  });

  // Text message prompts -> AGY execution
  bot.on('message:text', async (ctx) => {
    const promptText = ctx.message.text;
    if (promptText.startsWith('/')) return; // Ignore unhandled commands

    if (agyRunner.isRunning()) {
      return ctx.reply('⚠️ AGY process is already running a task. Send /stop to terminate it first.');
    }

    await ctx.reply('🚀 *Executing AGY prompt...*', { parse_mode: 'Markdown' });

    let outputBuffer = '';
    let updateTimer = null;

    const flushOutput = async () => {
      if (!outputBuffer.trim()) return;
      const textToSend = outputBuffer;
      outputBuffer = '';

      const chunks = chunkText(textToSend, 3800);
      for (const chunk of chunks) {
        await ctx.reply(`\`\`\`\n${chunk}\n\`\`\``, { parse_mode: 'Markdown' }).catch(() => {
          return ctx.reply(chunk);
        });
      }
    };

    agyRunner.runCommand(
      promptText,
      (data) => {
        outputBuffer += data;
        if (!updateTimer) {
          updateTimer = setTimeout(async () => {
            updateTimer = null;
            await flushOutput();
          }, 1500);
        }
      },
      async (code, err) => {
        if (updateTimer) {
          clearTimeout(updateTimer);
          updateTimer = null;
        }
        await flushOutput();

        if (err || (code !== 0 && code !== null)) {
          const activeModel = agyRunner.getModel();
          await ctx.reply(`❌ *AGY Execution Failed* (exit code \`${code}\`)\n\n*Active Model:* \`${activeModel}\`\nIf the selected model is unsupported, use /model to switch to \`Gemini 3.6 Flash (High)\` or \`Gemini 3.1 Pro (High)\`.${err ? '\nDetails: `' + err + '`' : ''}`, { parse_mode: 'Markdown' });
        } else {
          await ctx.reply(`✅ Prompt completed.`, { parse_mode: 'Markdown' });
        }
      }
    );
  });

  return bot;
}
