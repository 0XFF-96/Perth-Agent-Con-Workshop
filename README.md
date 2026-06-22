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

## Project layout

- `server.ts` — Node CopilotKit runtime + model-switchable `BuiltInAgent`.
- `src/main.tsx` — `<CopilotKit>` provider.
- `src/App.tsx` — tab shell (L2 → L4 navigation).
- `src/lessons/` — one component per workshop level.
- `src/components/` — `flight-card`, `pie-chart`, `example-prompts`.
- `ipynb/` — the original DeepLearning.AI-style notebooks (reference source).
- `docs/superpowers/` — design spec and implementation plan.
- `CLAUDE.md` — project context for Claude Code (architecture, run steps, gotchas).
- `.claude/` — the Claude Code harness (see below).

## Extend this workshop

Attendees extend the app by **directing the agent**, not hand-coding. Every seam is
tagged `🪁 EXTENSION POINT` (`grep -rn "🪁" .`), and `EXTENDING.md` maps each axis.
Start with **`/extend`** for a guided menu, or jump straight to:

- `/add-component` — a controlled UI component (L3)
- `/add-catalog-item` — an A2UI catalog primitive (L4)
- `/add-tool` — a tool the agent can call
- `/add-skill` — a new slash command
- the **🪁 Extend** tab — a live plan → approve → act demo

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

> **Optional quality gate:** to auto-run `npm run typecheck` when Claude finishes a
> turn, add a `Stop` hook to `.claude/settings.json`:
> ```json
> "Stop": [{ "matcher": "*", "hooks": [{ "type": "command", "command": "npm run typecheck" }] }]
> ```
> Off by default — useful when reviewing, noisy during active hands-on.
