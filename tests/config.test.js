import assert from 'node:assert';
import { test } from 'node:test';
import { loadConfig } from '../src/config.js';

test('loadConfig throws when required env variables are missing', () => {
  assert.throws(() => loadConfig({}), /TELEGRAM_BOT_TOKEN/);
});

test('loadConfig parses valid env variables', () => {
  const cfg = loadConfig({
    TELEGRAM_BOT_TOKEN: '1234:ABC',
    TELEGRAM_USER_ID: '987654321',
    WORKSPACE_DIR: '/tmp',
    DEFAULT_MODEL: 'gemini-2.5-pro'
  });
  assert.strictEqual(cfg.botToken, '1234:ABC');
  assert.strictEqual(cfg.userId, 987654321);
  assert.strictEqual(cfg.workspaceDir, '/tmp');
  assert.strictEqual(cfg.defaultModel, 'gemini-2.5-pro');
});
