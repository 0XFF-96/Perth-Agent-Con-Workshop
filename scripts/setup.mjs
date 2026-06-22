#!/usr/bin/env node
// One-command setup for the workshop: deps + .env + key + health check.
// Safe to run non-interactively (CI / devcontainer / agent): it never blocks
// on a prompt and never fetches a key.
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { decideKeyAction, hasKey } from './setup-logic.mjs';

const major = Number(process.versions.node.split('.')[0]);
if (major < 20) {
  console.error(`Node ${process.versions.node} found — this project needs Node 20+. See https://nodejs.org`);
  process.exit(1);
}

if (!existsSync('node_modules')) {
  console.log('📦 Installing dependencies (first run downloads ~797 MB)…');
  execSync('npm install', { stdio: 'inherit' });
}

if (!existsSync('.env')) {
  copyFileSync('.env.example', '.env');
  console.log('📝 Created .env from .env.example');
}

const keyInEnv = Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
const dotenvKeyPresent = hasKey(readFileSync('.env', 'utf8'));
const action = decideKeyAction({ keyInEnv, dotenvKeyPresent, isTTY: stdin.isTTY === true });

if (action === 'skip') {
  console.log('🔑 API key already configured.');
} else if (action === 'prompt') {
  const rl = createInterface({ input: stdin, output: stdout });
  const key = (await rl.question('🔑 Paste your OpenAI API key (or press Enter to add it later): ')).trim();
  rl.close();
  if (key) {
    const env = readFileSync('.env', 'utf8');
    const next = /^OPENAI_API_KEY=.*$/m.test(env)
      ? env.replace(/^OPENAI_API_KEY=.*$/m, `OPENAI_API_KEY=${key}`)
      : `${env.trimEnd()}\nOPENAI_API_KEY=${key}\n`;
    writeFileSync('.env', next);
    console.log('🔑 Saved to .env (local only — never committed).');
  } else {
    console.log('⏭️  Add your key to OPENAI_API_KEY in .env when ready.');
  }
} else {
  console.log('🔑 Add your key to OPENAI_API_KEY in .env before running the app.');
}

console.log('🩺 Running typecheck…');
try {
  execSync('npm run typecheck', { stdio: 'inherit' });
  console.log('✅ Typecheck passed.');
} catch {
  console.log('⚠️  Typecheck reported issues (the app may still run). See output above.');
}

console.log('\n✅ Setup done — run `claude`, then type `/start-here`.');
