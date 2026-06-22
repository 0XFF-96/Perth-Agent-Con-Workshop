# Non-Coder Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a non-coder go from clone-or-open to making a real change via the agent in ~30 minutes — by collapsing environment setup to one command and adding a guided first-run.

**Architecture:** A shared cross-platform Node setup script (`scripts/setup.mjs`, pure logic split into `scripts/setup-logic.mjs`) wired as `npm run setup`; a `.devcontainer/` that auto-runs it for the cloud path; a `/start-here` guided harness command; and a `START-HERE.md` non-coder entry doc. No app runtime changes.

**Tech Stack:** Plain Node.js ESM (no new deps), Dev Containers / GitHub Codespaces, Claude Code harness (commands), `node:test` for the one unit-tested helper.

## Global Constraints

- **No new npm dependencies** — `scripts/setup.mjs` uses only Node built-ins.
- **Node ≥ 20** — the setup script and devcontainer target Node 20+.
- **Cross-platform** — setup is plain Node (no bash-only syntax).
- **The API key is never auto-fetched** — the human supplies it (interactive paste locally, Codespaces secret in the cloud). Scripts only prompt or instruct.
- **Do not change app runtime or the L2–L4 lessons** — onboarding artifacts only.
- **Match existing style; commit per task.** The live secret-guard hook blocks any *command* containing an API-key literal or `git add .env`; keep commit commands clean.

---

## File Structure

- `scripts/setup-logic.mjs` (new) — pure, testable helpers: `decideKeyAction`, `hasKey`.
- `scripts/setup-logic.test.mjs` (new) — `node:test` unit tests for the helpers.
- `scripts/setup.mjs` (new) — orchestrator: Node check → install → ensure `.env` → key action → health check → next-step message.
- `package.json` (modify) — add `"setup": "node scripts/setup.mjs"`.
- `.devcontainer/devcontainer.json` (new) — Node 20 image, install Claude Code, `postCreateCommand` runs setup, forward ports.
- `.claude/commands/start-here.md` (new) — guided first-run command.
- `START-HERE.md` (new) — non-coder entry doc (cloud + local paths).
- `README.md` (modify) — one-line pointer to `START-HERE.md` near the top.

---

### Task 1: Setup script (`npm run setup`)

**Files:**
- Create: `scripts/setup-logic.mjs`
- Test: `scripts/setup-logic.test.mjs`
- Create: `scripts/setup.mjs`
- Modify: `package.json` (scripts block)

**Interfaces:**
- Produces: `decideKeyAction({ keyInEnv: boolean, dotenvKeyPresent: boolean, isTTY: boolean }) => 'skip' | 'prompt' | 'instruct'` and `hasKey(envText: string) => boolean`, both exported from `scripts/setup-logic.mjs`.
- Produces: `npm run setup` runnable entry point.

- [ ] **Step 1: Write the failing test**

Create `scripts/setup-logic.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test scripts/setup-logic.test.mjs`
Expected: FAIL — `Cannot find module './setup-logic.mjs'`.

- [ ] **Step 3: Implement the helpers**

Create `scripts/setup-logic.mjs`:

```js
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test scripts/setup-logic.test.mjs`
Expected: PASS — 8 tests pass.

- [ ] **Step 5: Write the orchestrator**

Create `scripts/setup.mjs`:

```js
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
```

- [ ] **Step 6: Wire the npm script**

In `package.json`, add to the `"scripts"` block (after `"dev"`):

```json
    "setup": "node scripts/setup.mjs",
```

- [ ] **Step 7: Smoke-test (non-interactive, must not hang)**

Run: `npm run setup`
Expected: with deps already installed and `.env` present, prints `🔑 API key already configured.` (or the instruct line), runs typecheck, ends with `✅ Setup done — run \`claude\`, then type \`/start-here\`.` and exits — no prompt, no hang.

- [ ] **Step 8: Commit**

```bash
git add scripts/setup-logic.mjs scripts/setup-logic.test.mjs scripts/setup.mjs package.json
git commit -m "feat(onboarding): one-command npm run setup (deps + env + key + health check)"
```

---

### Task 2: Dev container for the cloud path

**Files:**
- Create: `.devcontainer/devcontainer.json`

**Interfaces:**
- Consumes: `npm run setup` from Task 1.
- Produces: a Codespace/dev-container that boots ready-to-use.

- [ ] **Step 1: Write the devcontainer config**

Create `.devcontainer/devcontainer.json`:

```json
{
  "name": "AgentCon Generative-UI Workshop",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "postCreateCommand": "npm install -g @anthropic-ai/claude-code && npm install && npm run setup",
  "forwardPorts": [5173, 4000],
  "portsAttributes": {
    "5173": { "label": "Workshop UI" },
    "4000": { "label": "CopilotKit runtime" }
  },
  "customizations": {
    "vscode": { "extensions": ["esbenp.prettier-vscode"] }
  }
}
```

- [ ] **Step 2: Validate the JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('.devcontainer/devcontainer.json','utf8')); console.log('valid JSON')"`
Expected: `valid JSON`.

- [ ] **Step 3: Record the known auth risk inline**

This config installs Claude Code, but **authenticating Claude Code inside a headless Codespace is the open risk** (per the spec). Acceptance test = a real Codespace boot; if `claude` login is too rough for a beginner, the local `npm run setup` path is the primary. Note this in the Task 4 `START-HERE.md` (cloud step says "run `claude` and sign in if prompted"). No code change here beyond the config.

- [ ] **Step 4: Commit**

```bash
git add .devcontainer/devcontainer.json
git commit -m "feat(onboarding): devcontainer that auto-runs setup for Codespaces"
```

---

### Task 3: `/start-here` guided command

**Files:**
- Create: `.claude/commands/start-here.md`

**Interfaces:**
- Consumes: existing `/run`, `/add-component`, `/verify` commands; `copilotkit-reviewer` agent; `CLAUDE.md`; `src/lessons/L3Components.tsx`.

- [ ] **Step 1: Write the command**

Create `.claude/commands/start-here.md`:

```markdown
---
description: Guided first-run for newcomers — tour the app in plain English, run it, make a first change via the agent, and verify
allowed-tools: Read, Edit, Bash
---
You are guiding someone who may have NEVER written code. Be warm and concrete.
Go ONE numbered step at a time and wait for them after each — never dump it all at once.

1. **Welcome + the big idea.** In 3–4 plain sentences, no jargon: this is a demo
   where one request to an AI is shown as plain chat (L2), as pre-built cards (L3),
   and as an AI-composed dashboard (L4) — "same intent, different placement." Tell
   them they will NOT hand-write code; they describe what they want and the AI
   writes it, with this repo's harness keeping it safe.
2. **Tour from the English layer.** Read `CLAUDE.md` and summarize the architecture
   in plain words (a front end you see + a small server that talks to the AI model).
   Do NOT show or ask them to read `.tsx` files.
3. **See it run.** Tell them you'll start the app, then follow the `/run` flow. When
   it's up, point out the L2/L3/L4 tabs and the example prompts.
4. **First change — confidence first.** Walk them through the existing L3 hands-on:
   open `src/lessons/L3Components.tsx`, change the `flightCard` `description` to
   "Only call this for international flights.", save, re-send an SFO→JFK prompt, and
   show how the agent's behavior changes. Explain what happened in one line.
5. **Make something new (optional).** If they want more, use `/add-component` and
   let them describe a component in plain English; the agent writes it.
6. **Verify + trust.** Run `/verify` and explain GO/NO-GO. Mention they can ask the
   `copilotkit-reviewer` agent to double-check a change.
7. **About the guardrails.** Reassure them: if a command is blocked (a key, or
   staging `.env`) or a `git push` asks first, that's the harness protecting them —
   expected, not an error.

Check in after each numbered step before moving on. Keep code-talk minimal.
```

- [ ] **Step 2: Verify references are real**

Run: `ls .claude/commands/run.md .claude/commands/add-component.md .claude/commands/verify.md .claude/agents/copilotkit-reviewer.md src/lessons/L3Components.tsx CLAUDE.md`
Expected: all six paths exist (no "No such file").

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/start-here.md
git commit -m "feat(onboarding): /start-here guided first-run command"
```

---

### Task 4: `START-HERE.md` entry doc + README pointer

**Files:**
- Create: `START-HERE.md`
- Modify: `README.md` (add a pointer line under the intro)

**Interfaces:**
- Consumes: `npm run setup` (Task 1), the devcontainer (Task 2), `/start-here` (Task 3).

- [ ] **Step 1: Write `START-HERE.md`**

Create `START-HERE.md`:

```markdown
# START HERE — no coding required

You don't need to know how to write code. Here, **you tell an AI what you want and
it writes the code** — and this project ships a "harness" (guardrails + shortcuts)
that keeps that safe and on track.

You need two things: a way to run it, and an API key.

## Fastest: in the cloud (GitHub Codespaces)

1. On this repo's GitHub page, click the green **Code** button → **Codespaces** →
   **Create codespace on main**.
2. Add your API key as a **Codespaces secret** named `OPENAI_API_KEY`
   (GitHub → Settings → Codespaces → New secret), then rebuild the codespace.
3. Wait for it to finish setting up — it installs everything for you.
4. In the terminal, run `claude` (sign in if it asks), then type **`/start-here`**.

## Or: on your own computer

1. Install [Node.js 20+](https://nodejs.org) and
   [Claude Code](https://claude.com/claude-code).
2. Download this project (green **Code** button → **Download ZIP**, or `git clone`).
3. Open a terminal in the project folder and run:
   ```bash
   npm run setup
   ```
   It installs everything and asks you to paste your API key (kept only on your
   machine, never committed).
4. Run `claude`, then type **`/start-here`**.

## What you'll do in ~30 minutes

`/start-here` walks you through it: a plain-English tour, seeing the app run, then
making a real change by *describing it to the AI* — and checking it with `/verify`.

> Heads up: if a command gets blocked (for safety) or a push asks for confirmation,
> that's the harness protecting you — not an error.

---
Developers: the technical quick-start is in [README.md](README.md).
```

- [ ] **Step 2: Add the pointer to the top of `README.md`**

In `README.md`, immediately after the `> **Same intent. Different placement.**` line, add a blank line then:

```markdown
> **New to coding?** Start with **[START-HERE.md](START-HERE.md)** — no coding required.
```

- [ ] **Step 3: Verify links resolve**

Run: `ls START-HERE.md README.md && grep -n "START-HERE.md" README.md`
Expected: both files exist and the grep prints the new pointer line.

- [ ] **Step 4: Commit**

```bash
git add START-HERE.md README.md
git commit -m "docs(onboarding): START-HERE.md non-coder entry point + README pointer"
```

---

## Self-Review

**Spec coverage:** one-command setup → Task 1; devcontainer/Codespaces → Task 2; `/start-here` walkthrough → Task 3; `START-HERE.md` + README pointer → Task 4; obstacle mitigations (guard reassurance, verify loop, English-only tour) → Task 3; key-never-auto-fetched → Task 1 logic; Codespaces auth risk → Task 2 Step 3 + Task 4 cloud step. All covered.

**Placeholder scan:** every step has concrete code/commands and expected output. None remain.

**Type/name consistency:** `decideKeyAction` / `hasKey` signatures match between `setup-logic.mjs`, its test, and `setup.mjs`. `/start-here` references only commands/files created in this plan or already in the repo (verified in Task 3 Step 2).

**Note:** `scripts/setup-logic.test.mjs` runs via `node --test` (not the vitest app suite), so it is intentionally outside `/verify`. The app gate (`npm run typecheck`, `npx vitest run`, `npm run build`) is unaffected.
