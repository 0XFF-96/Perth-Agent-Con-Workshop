import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decideKeyAction, hasKey, keyVarForModel, isInteractive } from './setup-logic.mjs';

test('decideKeyAction: key already in env → skip', () => {
  assert.equal(decideKeyAction({ keyInEnv: true, dotenvKeyPresent: false, interactive:true }), 'skip');
});
test('decideKeyAction: .env already has a key → skip', () => {
  assert.equal(decideKeyAction({ keyInEnv: false, dotenvKeyPresent: true, interactive:true }), 'skip');
});
test('decideKeyAction: no key, interactive → prompt', () => {
  assert.equal(decideKeyAction({ keyInEnv: false, dotenvKeyPresent: false, interactive:true }), 'prompt');
});
test('decideKeyAction: no key, non-interactive → instruct', () => {
  assert.equal(decideKeyAction({ keyInEnv: false, dotenvKeyPresent: false, interactive:false }), 'instruct');
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
test('keyVarForModel: openai model → OPENAI_API_KEY', () => {
  assert.equal(keyVarForModel('openai/gpt-4.1'), 'OPENAI_API_KEY');
});
test('keyVarForModel: anthropic model → ANTHROPIC_API_KEY', () => {
  assert.equal(keyVarForModel('anthropic/claude-sonnet-4-6'), 'ANTHROPIC_API_KEY');
});
test('keyVarForModel: empty string → OPENAI_API_KEY', () => {
  assert.equal(keyVarForModel(''), 'OPENAI_API_KEY');
});
test('keyVarForModel: undefined → OPENAI_API_KEY', () => {
  assert.equal(keyVarForModel(undefined), 'OPENAI_API_KEY');
});
test('isInteractive: TTY and no CI/Codespaces → true', () => {
  assert.equal(isInteractive({ isTTY: true, env: {} }), true);
});
test('isInteractive: TTY but CODESPACES set → false (postCreate has a TTY but no input)', () => {
  assert.equal(isInteractive({ isTTY: true, env: { CODESPACES: 'true' } }), false);
});
test('isInteractive: TTY but CI set → false', () => {
  assert.equal(isInteractive({ isTTY: true, env: { CI: 'true' } }), false);
});
test('isInteractive: no TTY → false', () => {
  assert.equal(isInteractive({ isTTY: false, env: {} }), false);
});
