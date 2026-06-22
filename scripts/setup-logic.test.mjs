import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decideKeyAction, hasKey } from './setup-logic.mjs';

test('decideKeyAction: key already in env → skip', () => {
  assert.equal(decideKeyAction({ keyInEnv: true, dotenvKeyPresent: false, isTTY: true }), 'skip');
});
test('decideKeyAction: .env already has a key → skip', () => {
  assert.equal(decideKeyAction({ keyInEnv: false, dotenvKeyPresent: true, isTTY: true }), 'skip');
});
test('decideKeyAction: no key, interactive → prompt', () => {
  assert.equal(decideKeyAction({ keyInEnv: false, dotenvKeyPresent: false, isTTY: true }), 'prompt');
});
test('decideKeyAction: no key, non-interactive → instruct', () => {
  assert.equal(decideKeyAction({ keyInEnv: false, dotenvKeyPresent: false, isTTY: false }), 'instruct');
});
test('hasKey: non-empty key present → true', () => {
  assert.equal(hasKey('LLM_MODEL=openai/gpt-4.1\nOPENAI_API_KEY=test-value\n'), true);
});
test('hasKey: empty key → false', () => {
  assert.equal(hasKey('OPENAI_API_KEY=\nANTHROPIC_API_KEY=\n'), false);
});
test('hasKey: whitespace-only key → false', () => {
  assert.equal(hasKey('OPENAI_API_KEY=   \n'), false);
});
test('hasKey: anthropic key present → true', () => {
  assert.equal(hasKey('ANTHROPIC_API_KEY=test-value\n'), true);
});
