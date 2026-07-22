import assert from 'node:assert';
import { test } from 'node:test';
import { AgyRunner } from '../src/agyRunner.js';

test('AgyRunner initializes with CWD and Model', () => {
  const runner = new AgyRunner({ cwd: '/test/dir', model: 'gemini-2.5-pro' });
  assert.strictEqual(runner.getCwd(), '/test/dir');
  assert.strictEqual(runner.getModel(), 'gemini-2.5-pro');
  assert.strictEqual(runner.isRunning(), false);

  runner.setCwd('/new/dir');
  runner.setModel('claude-3-5-sonnet');
  assert.strictEqual(runner.getCwd(), '/new/dir');
  assert.strictEqual(runner.getModel(), 'claude-3-5-sonnet');
});

test('AgyRunner default constructor parameters', () => {
  const runner = new AgyRunner();
  assert.strictEqual(runner.getCwd(), process.cwd());
  assert.strictEqual(runner.getModel(), 'Gemini 3.6 Flash (High)');
  assert.strictEqual(runner.isRunning(), false);
});

test('AgyRunner stop returns false when process is not running', () => {
  const runner = new AgyRunner();
  assert.strictEqual(runner.stop(), false);
});

test('AgyRunner runCommand throws if process is already running', () => {
  const runner = new AgyRunner();
  // Simulate a running process mock
  runner.process = { killed: false };
  assert.strictEqual(runner.isRunning(), true);
  assert.throws(
    () => runner.runCommand('test', () => {}, () => {}),
    /An AGY process is already running/
  );
});
