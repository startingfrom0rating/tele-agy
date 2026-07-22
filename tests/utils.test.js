import assert from 'node:assert';
import { test } from 'node:test';
import { stripAnsi, chunkText } from '../src/utils.js';

test('stripAnsi removes ANSI escape codes', () => {
  const colored = '\u001b[31mHello\u001b[0m \u001b[1mWorld\u001b[0m';
  assert.strictEqual(stripAnsi(colored), 'Hello World');
});

test('chunkText splits text by character limit', () => {
  const text = 'abcdefghij';
  const chunks = chunkText(text, 4);
  assert.deepStrictEqual(chunks, ['abcd', 'efgh', 'ij']);
});
