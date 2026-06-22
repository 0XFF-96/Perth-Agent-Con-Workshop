// Pure, I/O-free helpers for scripts/setup.mjs — unit-tested via node:test.

/** True if .env text declares a non-empty OPENAI_API_KEY or ANTHROPIC_API_KEY. */
export function hasKey(envText) {
  return /^(OPENAI_API_KEY|ANTHROPIC_API_KEY)=.*\S.*$/m.test(envText ?? '');
}

/**
 * Decide what setup should do about the API key.
 * @param {{ keyInEnv: boolean, dotenvKeyPresent: boolean, isTTY: boolean }} state
 * @returns {'skip'|'prompt'|'instruct'}
 */
export function decideKeyAction({ keyInEnv, dotenvKeyPresent, isTTY }) {
  if (keyInEnv || dotenvKeyPresent) return 'skip';
  return isTTY ? 'prompt' : 'instruct';
}

/** The .env variable name for the key the given model needs. */
export function keyVarForModel(model) {
  return String(model ?? '').startsWith('anthropic') ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
}
