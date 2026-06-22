# Agentic Generative-UI Workshop (AgentCon Perth 2026)

A runnable CopilotKit v2 + A2UI demo showing one intent rendered across the
Generative-UI spectrum (L2 → L4 today; L5–L6 in later iterations). All-Node/TypeScript:
one `npm install`, one `npm run dev`.

> **Same intent. Different placement.**

> **New to coding?** Start with **[START-HERE.md](START-HERE.md)** — no coding required.

## Quick Start (under 5 minutes)

Requires Node.js 20+.

1. Install:
   ```bash
   npm install
   ```
2. Configure your key:
   ```bash
   cp .env.example .env
   ```
   Paste the workshop's shared key into `OPENAI_API_KEY` in `.env`.
   (After the workshop, use your own key. To use Claude instead, set
   `LLM_MODEL=anthropic/claude-sonnet-4-6` and fill `ANTHROPIC_API_KEY`.)
3. Run:
   ```bash
   npm run dev
   ```
   This starts both the Vite frontend (http://localhost:5173) and the
   CopilotKit runtime (http://localhost:4000). Open the printed URL.

   > If the page shows a "Runtime info request failed" error on first load, the
   > frontend booted before the runtime did — just **reload once**.

## Architecture

Two processes, one language:

```
Browser (Vite :5173)
  └─ /api/copilotkit            (Vite proxy)
       └─ server.ts             Node CopilotKit v2 runtime (:4000)
            └─ BuiltInAgent     calls the model provider directly
                 └─ model        ← LLM_MODEL (provider/model) + key from .env
```

The model is switchable with one env var: `LLM_MODEL=openai/gpt-4.1` (default)
or `LLM_MODEL=anthropic/claude-sonnet-4-6`.

## What runs today

- **L2 Chat** — plain text assistant (the bolt-on baseline).
  Try: *"Summarize the last quarter's metrics."*
- **L3 Components** — the agent renders typed React components you registered
  with `useComponent` (a flight card, a pie chart).
  Try: *"Show a flight card for Pacific Air from SFO to JFK departing at 08:30 for $249"*
  or *"Please show me the distribution of our revenue by category in a pie chart"*.
  - **Hands-on:** open `src/lessons/L3Components.tsx`, change the `flightCard`
    `description` to `"Only call this for international flights."`, save, and
    re-send the SFO→JFK prompt — the agent stops rendering the card for a
    domestic flight.
- **L4 Declarative** — the agent paints UI from an **A2UI catalog** of 17
  primitives (declarative generative UI), not pre-built React components. Two
  surfaces:
  - Try: *"Show me a sales dashboard with total revenue, new customers, and
    conversion rate metrics"* → a metrics dashboard surface.
  - Try: *"Find flights from SFO to JFK"* → a host-authored flight-card carousel.
  - **L3 vs L4:** L3 registers fixed React components (`useComponent`); L4
    composes surfaces from a shared catalog rendered by the A2UI renderer. Both
    L4 surfaces are host-authored (`{a2ui_operations}` tools) for reliable
    rendering; the fully-dynamic `generate_a2ui` tool stays registered to
    demonstrate the dynamic concept.

L5 (open generative UI) and L6 (shared state) land in later iterations.

## Verify

```bash
npm test -- --run   # deterministic component tests (no API key needed)
npm run build       # production build
npm run typecheck   # tsc --noEmit
```

## CI & automated PR review

> Working in a remote/web session? See
> **[docs/cloud-container-guide.md](docs/cloud-container-guide.md)** for the
> push-or-lose-it workflow and the PR review methodology.

Three things in `.github/` keep pull requests honest:

1. **CI quality gate** (`.github/workflows/ci.yml`) — runs `typecheck` + `vitest`
   + `build` on every PR and push to `main`. No secrets needed.
2. **GitHub Copilot code review** — Copilot can review every PR automatically.
   It's a *repo setting*, not a workflow file: go to **Settings → Rules →
   Rulesets → New ruleset**, target your default branch, and enable **"Request
   automatic Copilot code review"** (sub-options: run on each push / on drafts).
   Requires Copilot to be enabled for the repo. Copilot follows the conventions
   in [`.github/copilot-instructions.md`](.github/copilot-instructions.md).
3. **DeepSeek AI review** (`.github/workflows/ai-pr-review.yml`) — posts an AI
   review on each PR via DeepSeek's OpenAI-compatible API. **Add a repo secret
   `DEEPSEEK_API_KEY`** (Settings → Secrets and variables → Actions). To swap in
   another provider (OpenAI, GitHub Models, etc.), just change `OPENAI_API_ENDPOINT`
   + `MODEL` in the workflow and point the secret at that provider.

## Project layout

- `server.ts` — Node CopilotKit runtime + model-switchable `BuiltInAgent`.
- `src/main.tsx` — `<CopilotKit>` provider.
- `src/App.tsx` — tab shell (L2 → L4 navigation).
- `src/lessons/` — one component per workshop level.
- `src/components/` — `flight-card`, `pie-chart`, `example-prompts`.
- `ipynb/` — the original DeepLearning.AI-style notebooks (reference source).
- `docs/superpowers/` — design spec and implementation plan.
- `CLAUDE.md` — project context, read by **both** Claude Code and pi.
- `.claude/` — the Claude Code harness (see below).
- `.pi/` — the [pi](https://pi.dev) harness (`/skill:run`, `/skill:verify`).

## Claude Code harness

This repo ships a small **Claude Code harness** so the project is pleasant — and
safe — to extend with an AI agent. It doubles as a worked example of *harness
engineering*: wrapping a codebase with project context, shortcuts, guardrails, and
a domain reviewer.

- **`CLAUDE.md`** — project context loaded into every Claude Code session:
  architecture, how to run, conventions, and the CopilotKit v2 gotchas that bite
  at runtime.
- **Slash commands** (`.claude/commands/`):
  - `/run` — start the app and smoke-test that L2–L4 load.
  - `/add-component <name> <what it renders>` — scaffold a new controlled-GenUI
    (L3) component + test, following the flight-card / pie-chart pattern.
  - `/verify` — run typecheck + tests + build and report a go/no-go.
  - `/pr-review <pr-number>` — review a PR with the repo's methodology (CI gate +
    AI-comment triage + domain rubric) and post the verdict as a GitHub comment.
    See [docs/cloud-container-guide.md](docs/cloud-container-guide.md).
- **Guardrails** (`.claude/settings.json` + `.claude/hooks/`):
  - A permission allowlist for safe build/test/read commands (fewer approval
    prompts). `rm` and writing `.env` are denied; `git push` prompts for approval.
  - A `PreToolUse` hook (`guard-secrets.sh`) that **blocks any command containing
    an API key or trying to commit `.env`** — turning this repo's #1 footgun into
    a hard stop.
- **Subagent** (`.claude/agents/copilotkit-reviewer.md`) — a reviewer that knows
  this stack's pitfalls; ask Claude to *"review my changes with
  copilotkit-reviewer"* before committing.

Personal overrides go in `.claude/settings.local.json` (gitignored).

### Superpowers skills

This repo vendors [obra/Superpowers](https://github.com/obra/superpowers) (MIT) — a
methodology of composable skills — into `.claude/skills/`, so they're available to
any Claude Code session here:

```bash
make superpowers   # install/update the vendored skills (pinned snapshot)
```

You get `/brainstorming`, `/writing-plans`, `/executing-plans`,
`/test-driven-development`, `/systematic-debugging`, and more. They're a pinned
snapshot vendored by `scripts/install-superpowers.mjs`; re-run `make superpowers`
(optionally `SUPERPOWERS_REF=main`) to update. See `.claude/skills/SUPERPOWERS-NOTICE.md`.

## pi harness (alternative)

Prefer a different agent? This repo also ships a [**pi**](https://pi.dev) harness,
offered as an equal alternative to Claude Code. pi reads the same `CLAUDE.md`
project context and the same `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` from `.env`, so
no extra configuration is needed.

```bash
make setup-pi   # installs deps + .env + key, then installs pi
pi              # start it in this folder (trust the project when prompted)
```

The two highest-value Claude Code commands are ported as pi **skills**
(`.pi/skills/`), invoked with the `/skill:` prefix:

- `/skill:run` — start the app and smoke-test that L2–L4 load.
- `/skill:verify` — run typecheck + tests + build and report a go/no-go.
- `/skill:pr-review <pr-number>` — review a PR and post the verdict comment.

`/add-component`, the guard-secrets hook, and the copilotkit-reviewer subagent are
Claude Code-only for now.

> **Optional quality gate:** to auto-run `npm run typecheck` when Claude finishes a
> turn, add a `Stop` hook to `.claude/settings.json`:
> ```json
> "Stop": [{ "matcher": "*", "hooks": [{ "type": "command", "command": "npm run typecheck" }] }]
> ```
> Off by default — useful when reviewing, noisy during active hands-on.
