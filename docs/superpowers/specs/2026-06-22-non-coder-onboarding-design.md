# Design — Non-Coder Onboarding: 30-Minute Path to Writing Code via the Harness

**Date:** 2026-06-22 · **Status:** approved (design), pending spec review

## Problem

The repo ships a working CopilotKit v2 + A2UI app plus a committed Claude Code
harness (`CLAUDE.md`, `/run` `/add-component` `/verify`, a secret-guard hook, a
`copilotkit-reviewer` subagent). But it is packaged for **developers**. We want a
**complete non-coder** to clone-or-open it and, in **~30 minutes**, understand
what it does and produce a real change by *directing the agent through the
harness* — "a new way of writing code" where you steer intent rather than hand-
write implementation.

### Grounded assessment (why 30 min is hard today)

- A non-coder **cannot** read the raw TSX/CopilotKit implementation
  (`server.ts`, `src/lessons/*.tsx`, the catalog). They **can** read the plain-
  English layer (README, `CLAUDE.md` architecture, lesson briefs) — enough mental
  model to *direct* changes without reading code line-by-line.
- From a **cold laptop, 30 min is not achievable**: installing Node + Claude Code,
  cloning, a **~797 MB `npm install`**, and configuring a key consume the budget,
  and any hiccup kills it.
- With a **pre-provisioned environment + a guided first task, 30 min is realistic.**

### Ranked obstacles (and how this design removes each)

1. **Toolchain setup** (the #1 killer) → one-command setup + auto-provisioned cloud env.
2. **No non-coder entry point** (README is dev-facing) → a `START-HERE.md` + a `/start-here` guided command.
3. **Abstract concepts** (generative UI / A2UI) → the tour explains an English mental model; no code-reading required.
4. **No trust/verification loop** ("did the agent get it right?") → `/verify` + the `copilotkit-reviewer` subagent.
5. **Permission/guard prompts can spook a newcomer** → `/start-here` pre-explains that interceptions are normal protection.

## Goals

- Collapse **environment setup to ≈0 human effort** via a single command that
  works both locally and in the cloud.
- Give a non-coder a **guided path**: understand → see it run → make a real change
  via the agent → verify — inside ~30 min once the environment is ready.
- Treat "reading the code" as **building a mental model from the English layer**,
  not comprehending implementation.

## Non-Goals

- Teaching the non-coder to hand-write React/TypeScript.
- Rewriting the app or the existing developer-facing README quick-start.
- Removing the two irreducible human steps: (a) supplying an API key, (b) having
  *some* entry point (a GitHub account for cloud, or terminal + Node locally).

## Design

Four components. Components 1–3 are new artifacts; component 4 is a cross-cutting
property verified against the others.

### 1. One-command environment setup

**`scripts/setup.mjs`** (plain Node ESM, cross-platform), wired as
`"setup": "node scripts/setup.mjs"` in `package.json`. Behavior, in order:

1. Check Node ≥ 20; if lower, print a clear message and exit non-zero.
2. If `node_modules` is absent, run `npm install`.
3. Key handling:
   - If `process.env.OPENAI_API_KEY` (or `ANTHROPIC_API_KEY`) is already set
     (e.g. a Codespaces secret), do nothing.
   - Else if `.env` is missing, copy `.env.example` → `.env`.
   - Else if running in an interactive TTY and the key in `.env` is empty,
     **prompt the user to paste their key** and write it into `.env` locally.
     (The human pastes their own secret into their own local file; the script
     never fetches a key from elsewhere.)
   - Else print exactly how to add the key to `.env`.
4. Run a fast health check (`npm run typecheck`); report pass/fail without failing
   the whole setup on a type error.
5. Print the next step: `✅ Setup done — run \`claude\`, then type \`/start-here\`.`

The script is **idempotent** and safe to re-run.

**`.devcontainer/devcontainer.json`** — for the cloud path:

- Base image with the Node 20 dev-container feature.
- Install Claude Code (dev-container feature or a `postCreate` install step).
- `"postCreateCommand": "npm install && npm run setup"` so a fresh Codespace is
  ready automatically.
- Document a **Codespaces secret** `OPENAI_API_KEY` so the key is injected without
  an interactive prompt (which `postCreateCommand` cannot do).

The two paths share the same `setup.mjs`; the dev-container simply runs it.

**Verified on a real Codespace (2026-06-22).** The devcontainer builds,
`claude-code` installs (v2.1.185), and `npm install` + `npm run setup` complete;
in-Codespace `node:test` passes 16/16. Two issues surfaced from the real-machine
test and were fixed:

1. **postCreate hung on the key prompt.** Codespaces runs `postCreateCommand`
   with a TTY attached and sets `CODESPACES=true`, so `stdin.isTTY` alone wrongly
   signalled "interactive" — `npm run setup` blocked forever on the prompt and
   "Setup done" never printed. Fixed with a tested `isInteractive({isTTY, env})`
   that also requires `!CI && !CODESPACES` (commit on the onboarding branch).
2. **`gh codespace ssh` could not connect** (the base image has no SSH server) —
   added the `ghcr.io/devcontainers/features/sshd` feature. The browser
   "Open in Codespaces" path does not need it.

**Remaining manual step (expected, not a defect):** Claude Code installs but is
not auto-authenticated; the user runs `claude` once in the Codespace terminal and
signs in (OAuth, supported by the browser VS Code terminal). The local
`npm run setup` path remains a fully-working fallback.

### 2. `/start-here` — guided walkthrough + first build

New `.claude/commands/start-here.md`. It is the live demonstration of the "new
way of writing code." Flow:

1. **English tour** — summarize, from `CLAUDE.md`/`README`, what the app is, the
   L2 → L4 idea ("same intent, different placement"), and where things live. Do
   **not** ask the user to read TSX.
2. **See it run** — guide the user through `/run` so they watch L2/L3/L4 work in
   the browser.
3. **First change (confidence-first)** — start with the existing L3 "change the
   `description`" hands-on (edit one sentence, observe the agent's behavior shift).
   Then offer `/add-component` to have the agent scaffold a brand-new component
   from a plain-English description — the user supplies intent, the agent writes
   the code.
4. **Verify** — run `/verify` and explain the go/no-go so the user learns how to
   trust a change. Mention they can ask the `copilotkit-reviewer` to review.
5. **Reassure about guards** — note up front that a blocked command (secret guard)
   or a `git push` prompt is the harness protecting them, not an error.

### 3. `START-HERE.md` — the non-coder entry point

A new top-level doc that assumes **zero** programming background:

- One line on the premise: *you don't need to write code — you direct an AI that
  writes it, and the project's "harness" keeps it safe and on-track.*
- The cloud path: an **"Open in Codespaces"** button/link; the only thing to
  prepare is an API key (added as a Codespaces secret).
- The local path: install Node + Claude Code, clone, run **`npm run setup`**.
- The single next action either way: open Claude Code and type **`/start-here`**.
- A one-line pointer from the **top of `README.md`**: "New to coding? Start with
  `START-HERE.md`." The existing developer quick-start stays as-is below.

### 4. 30-minute budget & residual friction (honest)

Budget once the environment is ready: tour ~5 · see it run ~5 · agent writes the
first change ~12 · verify + celebrate ~3 ≈ **25 min**, with ~5 min buffer.

Irreducible residual friction to state plainly in `START-HERE.md`: a GitHub
account (cloud) or terminal + Node (local); a personal API key; and a true
beginner may still need someone to point out where the Codespaces button is.

## Decisions / defaults (open to change at spec review)

- **First "write code" task** starts with the gentle L3 `description` edit, then
  offers `/add-component`. Rationale: build confidence before generating new files.
- **Both** environment paths ship (local `npm run setup` + cloud dev-container);
  `setup.mjs` is the shared core.
- **Key is never auto-fetched**; the user supplies it (TTY prompt locally,
  Codespaces secret in the cloud).

## Testing / verification

- `scripts/setup.mjs`: unit-style checks for the branch logic (key already in env
  / `.env` missing / empty key non-interactive) run from a script file so the
  live secret-guard hook does not trip on test strings; manual run of
  `npm run setup` on a clean checkout.
- `.devcontainer`: validate JSON; a real Codespace boot is the acceptance test.
- `/start-here` and `START-HERE.md`: a dry read-through following the steps as a
  non-coder would; confirm `/run`, `/add-component`, `/verify` references are
  accurate. The existing harness commands already pass their checks.
- Whole-repo gate unchanged: `npm run typecheck`, `npx vitest run`, `npm run build`.

## Out of scope

- Auto-installing Node/Claude Code on a bare local machine (the `curl | bash`
  approach) — rejected for cross-platform fragility and trust concerns.
- Any change to the app's runtime behavior or the L2–L4 lessons themselves.
