import assert from 'node:assert';
import { test } from 'node:test';
import { stripAnsi, chunkText, parseModelIntent } from '../src/utils.js';

test('stripAnsi removes ANSI escape codes', () => {
  const colored = '\u001b[31mHello\u001b[0m \u001b[1mWorld\u001b[0m';
  assert.strictEqual(stripAnsi(colored), 'Hello World');
});

test('chunkText splits text by character limit', () => {
  const text = 'abcdefghij';
  const chunks = chunkText(text, 4);
  assert.deepStrictEqual(chunks, ['abcd', 'efgh', 'ij']);
});

test('parseModelIntent detects natural language model change requests', () => {
  const models = [
    'Gemini 3.6 Flash (High)',
    'Gemini 3.5 Flash (High)',
    'Gemini 3.1 Pro (High)',
    'Claude Sonnet 4.6 (Thinking)',
    'Claude Opus 4.6 (Thinking)',
    'GPT-OSS 120B (Medium)'
  ];

  assert.strictEqual(parseModelIntent('switch model to gemini flash 3.5 high', models), 'Gemini 3.5 Flash (High)');
  assert.strictEqual(parseModelIntent('change model to claude opus', models), 'Claude Opus 4.6 (Thinking)');
  assert.strictEqual(parseModelIntent('use model gpt oss', models), 'GPT-OSS 120B (Medium)');
  assert.strictEqual(parseModelIntent('set model to 3.1 pro', models), 'Gemini 3.1 Pro (High)');
  assert.strictEqual(parseModelIntent('please write a function in python', models), null);
});
