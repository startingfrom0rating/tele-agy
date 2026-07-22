import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { getProjectFolders, createTeleAgyBot } from '../src/bot.js';

test('getProjectFolders lists subdirectories in target folder', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tele-agy-test-'));
  fs.mkdirSync(path.join(tmpDir, 'proj-a'));
  fs.mkdirSync(path.join(tmpDir, 'proj-b'));
  fs.writeFileSync(path.join(tmpDir, 'file.txt'), 'hello');

  const folders = getProjectFolders(tmpDir);
  assert.deepStrictEqual(folders.sort(), ['proj-a', 'proj-b']);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('getProjectFolders returns empty array for non-existent directory', () => {
  const folders = getProjectFolders('/non/existent/path/for/sure/12345');
  assert.deepStrictEqual(folders, []);
});

test('createTeleAgyBot initializes a Bot instance', () => {
  const mockConfig = {
    botToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
    userId: 123456789,
    workspaceDir: os.tmpdir()
  };
  const mockAgyRunner = {
    getCwd: () => os.tmpdir(),
    getModel: () => 'gemini-2.5-pro',
    isRunning: () => false,
    setModel: () => {},
    setCwd: () => {},
    stop: () => true,
    runCommand: () => {}
  };

  const bot = createTeleAgyBot({ config: mockConfig, agyRunner: mockAgyRunner });
  assert.ok(bot);
  assert.strictEqual(typeof bot.command, 'function');
  assert.strictEqual(typeof bot.on, 'function');
});
