#!/usr/bin/env node
// One-command setup for the workshop: deps + .env + key + health check.
// Safe to run non-interactively (CI / devcontainer / agent): it never blocks
// on a prompt and never fetches a key.
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { decideKeyAction, hasKey, keyVarForModel } from './setup-logic.mjs';

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
  if (!existsSync('.env.example')) {
    console.error('Missing .env.example — re-clone or re-download the project.');
    process.exit(1);
  }
  copyFileSync('.env.example', '.env');
  console.log('📝 Created .env from .env.example');
}

const keyInEnv = Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
const dotenvKeyPresent = hasKey(readFileSync('.env', 'utf8'));
const action = decideKeyAction({ keyInEnv, dotenvKeyPresent, isTTY: stdin.isTTY === true });

if (action === 'skip') {
  console.log('🔑 API key already configured.');
} else if (action === 'prompt') {
  const envText = readFileSync('.env', 'utf8');
  const model =
    process.env.LLM_MODEL ||
    (envText.match(/^LLM_MODEL=(.*)$/m)?.[1] ?? '') ||
    'openai/gpt-4.1';
  const varName = keyVarForModel(model);
  const label = varName === 'ANTHROPIC_API_KEY' ? 'Anthropic' : 'OpenAI';
  const rl = createInterface({ input: stdin, output: stdout });
  const key = (await rl.question(`🔑 Paste your ${label} API key (or press Enter to add it later): `)).trim();
  rl.close();
  if (key) {
    const next = new RegExp(`^${varName}=.*$`, 'm').test(envText)
      ? envText.replace(new RegExp(`^${varName}=.*$`, 'm'), `${varName}=${key}`)
      : `${envText.trimEnd()}\n${varName}=${key}\n`;
    writeFileSync('.env', next);
    console.log('🔑 Saved to .env (local only — never committed).');
  } else {
    console.log(`⏭️  Add your key to ${varName} in .env when ready.`);
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
