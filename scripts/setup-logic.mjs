// Pure, I/O-free helpers for scripts/setup.mjs — unit-tested via node:test.

/** True if .env text declares a non-empty OPENAI_API_KEY or ANTHROPIC_API_KEY. */
export function hasKey(envText) {
  return /^(OPENAI_API_KEY|ANTHROPIC_API_KEY)=.*\S.*$/m.test(envText ?? '');
}

/**
 * Whether setup may prompt interactively. A TTY alone is NOT enough: automated
 * contexts attach a TTY but supply no input, so prompting there hangs forever.
 * Codespaces runs postCreateCommand with a TTY and sets CODESPACES=true; CI sets
 * CI. Treat both as non-interactive.
 * @param {{ isTTY: boolean, env: Record<string, string | undefined> }} state
 */
export function isInteractive({ isTTY, env }) {
  return isTTY === true && !env.CI && !env.CODESPACES;
}

/**
 * Decide what setup should do about the API key.
 * @param {{ keyInEnv: boolean, dotenvKeyPresent: boolean, interactive: boolean }} state
 * @returns {'skip'|'prompt'|'instruct'}
 */
export function decideKeyAction({ keyInEnv, dotenvKeyPresent, interactive }) {
  if (keyInEnv || dotenvKeyPresent) return 'skip';
  return interactive ? 'prompt' : 'instruct';
}

/** The .env variable name for the key the given model needs. */
export function keyVarForModel(model) {
  return String(model ?? '').startsWith('anthropic') ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
}
