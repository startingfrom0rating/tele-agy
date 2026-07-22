import assert from 'node:assert';
import { test } from 'node:test';
import { isUserAllowed } from '../src/auth.js';

test('isUserAllowed validates exact numerical user ID match', () => {
  assert.strictEqual(isUserAllowed(12345, 12345), true);
  assert.strictEqual(isUserAllowed(99999, 12345), false);
  assert.strictEqual(isUserAllowed(undefined, 12345), false);
});
