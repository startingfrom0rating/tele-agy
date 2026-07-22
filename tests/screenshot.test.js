import assert from 'node:assert';
import { test } from 'node:test';
import { captureAllScreenshots, captureScreenshot } from '../src/screenshot.js';

test('captureAllScreenshots is exported as an async function', () => {
  assert.strictEqual(typeof captureAllScreenshots, 'function');
  assert.strictEqual(typeof captureScreenshot, 'function');
});
