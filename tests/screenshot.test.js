import assert from 'node:assert';
import { test } from 'node:test';
import { captureScreenshot } from '../src/screenshot.js';

test('captureScreenshot is exported as an async function', () => {
  assert.strictEqual(typeof captureScreenshot, 'function');
});
