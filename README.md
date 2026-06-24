# Agentic Generative-UI Workshop (AgentCon Perth 2026)

A runnable CopilotKit v2 + A2UI demo: **one user intent rendered across the
Generative-UI spectrum** (L2 → L4 today; L5–L6 later). All-Node/TypeScript — one
`npm install`, one `npm run dev`.

> **Same intent. Different placement.**
>
> **New to coding?** Start with **[START-HERE.md](START-HERE.md)** — no coding required.

## Quick start (under 5 min)

Requires Node.js 20+.

```bash
npm install
cp .env.example .env     # paste the workshop's shared key into OPENAI_API_KEY
npm run dev              # Vite frontend :5173 + CopilotKit runtime :4000
```

Open the printed URL. To use Claude instead, set
`LLM_MODEL=anthropic/claude-sonnet-4-6` and fill `ANTHROPIC_API_KEY`.

> First load shows *"Runtime info request failed"*? The frontend booted before the
> runtime — **reload once.**

## Architecture

```
Browser (Vite :5173)
  └─ /api/copilotkit          (Vite proxy)
       └─ server.ts           Node CopilotKit v2 runtime (:4000)
            └─ BuiltInAgent    calls the model provider directly
                 └─ model       ← LLM_MODEL (provider/model) + key from .env
```

One env var switches the model: `LLM_MODEL=openai/gpt-4.1` (default) or
`anthropic/claude-sonnet-4-6`.

## What runs today

- **L2 Chat** — plain-text baseline. *"Summarize the last quarter's metrics."*
- **L3 Components** — the agent renders typed React components registered with
  `useComponent` (flight card, pie chart).
  *"Show a flight card for Pacific Air from SFO to JFK departing 08:30 for $249"* ·
  *"Show our revenue by category as a pie chart."*
  **Hands-on:** in `src/lessons/L3Components.tsx`, change the `flightCard`
  `description` to `"Only call this for international flights."`, save, and re-send
  the SFO→JFK prompt — the card stops rendering for a domestic flight.
- **L4 Declarative** — the agent paints UI from an **A2UI catalog** of 17
  primitives, not pre-built components.
  *"Show a sales dashboard with revenue, new customers, conversion rate"* (metrics
  surface) · *"Find flights from SFO to JFK"* (host-authored carousel).
  *L3 vs L4:* L3 registers fixed React components; L4 composes surfaces from a
  shared catalog. Both L4 surfaces are host-authored (`{a2ui_operations}`) for
  reliable rendering; `generate_a2ui` stays registered to show the dynamic concept.
- **🔁 Agent Loop** — a real, model-driven tool-calling loop, visualized step by step
  (model → tool → re-decide). Tools return data or render UI.
  Try: *"Show our revenue by category as a pie chart"*. Add your own tool with
  **`/add-loop-tool`**.

L5 (open generative UI) and L6 (shared state) land in later iterations.

## Verify

```bash
npm run typecheck   # tsc --noEmit
npm test -- --run   # component tests (no API key needed)
npm run build       # production build
```

## Project layout

- `server.ts` — CopilotKit runtime + model-switchable `BuiltInAgent`.
- `src/main.tsx` — `<CopilotKit>` provider · `src/App.tsx` — tab shell (L2 → L4).
- `src/lessons/` — one component per level · `src/components/` — `flight-card`,
  `pie-chart`, `example-prompts`.
- `docs/superpowers/` — design spec + plan · `CLAUDE.md` — project context (read by
  **both** harnesses) · `.claude/` + `.pi/` — the two harnesses.

## Extend this workshop

Attendees extend by **directing the agent**, not hand-coding. Every seam is tagged
`🪁 EXTENSION POINT` (`grep -rn "🪁" .`), and `EXTENDING.md` maps each axis. Start
with **`/extend`** for a guided menu, or jump straight to:

- `/add-component` — a controlled UI component (L3)
- `/add-catalog-item` — an A2UI catalog primitive (L4)
- `/add-tool` — a tool the agent can call
- `/add-loop-tool` — a tool the 🔁 Agent Loop model can call
- `/add-skill` — a new slash command
- the **🪁 Extend** tab — a live plan → approve → act demo

## CI & PR automation

> Working in a remote/web session? See
> **[docs/cloud-container-guide.md](docs/cloud-container-guide.md)** for the
> push-or-lose-it workflow and the PR-review methodology.

Everything in `.github/` keeps pull requests honest:

- **CI quality gate** (`ci.yml`) — `typecheck` + `vitest` + `build` on every PR and
  push to `main`. No secrets needed.
- **Copilot review** — a repo *setting* (Settings → Rules → Rulesets → enable
  "Request automatic Copilot code review"), not a workflow file; follows
  [`.github/copilot-instructions.md`](.github/copilot-instructions.md).
- **DeepSeek AI review** (`ai-pr-review.yml`) and **Principled review**
  (`principled-review.yml`, scores the diff against SOLID / KISS / clarity) — both
  need the **`DEEPSEEK_API_KEY`** secret; endpoint/model are swappable via
  `LLM_API_ENDPOINT` / `LLM_MODEL`.

> Without branch protection, the `verify` check is only advisory. Apply
> [`.github/ruleset.json`](.github/ruleset.json) to require it — see
> **[docs/branch-protection.md](docs/branch-protection.md)**.

## Issue → Ticket → Code

Label an issue **`ticket`** → DeepSeek posts an implementation plan; comment
**`/approve`** → a bounded agent implements it and opens a PR (nothing auto-merges).
Labels are the ticket states; reuses the **`DEEPSEEK_API_KEY`** secret. Flow +
safety: **[docs/ticket-system.md](docs/ticket-system.md)** · diagrams + operating
runbook: **[docs/ticket-runbook.md](docs/ticket-runbook.md)**.

## Harnesses

This repo ships **two** agent harnesses as a worked example of *harness
engineering* — both read the same `CLAUDE.md` and the same `.env` key, so neither
needs extra config.

**Claude Code** (`.claude/`):

- **`CLAUDE.md`** — architecture, how to run, conventions, and the CopilotKit v2
  gotchas that bite at runtime.
- **Commands** — `/run` (boot + smoke-test L2–L4), `/add-component`, `/verify`,
  `/pr-review <n>` (review a PR and post the verdict).
- **Guardrails** (`.claude/settings.json` + `.claude/hooks/`) — a permission
  allowlist (`rm` and writing `.env` denied, `git push` prompts) plus a `PreToolUse`
  hook (`guard-secrets.sh`) that **blocks any command containing an API key or
  committing `.env`**. Personal overrides → `.claude/settings.local.json` (gitignored).
- **Subagent** — `copilotkit-reviewer` knows this stack's pitfalls; *"review my
  changes with copilotkit-reviewer"* before committing.

**[pi](https://pi.dev)** (`.pi/`) — an equal alternative. `make setup-pi`, then `pi`. The top commands
are ported as skills: `/skill:run`, `/skill:verify`, `/skill:pr-review <n>`.
(`/add-component`, the guard hook, and the reviewer subagent are Claude Code-only.)

**Superpowers skills** — vendors [obra/Superpowers](https://github.com/obra/superpowers)
(MIT) into both skill dirs, zero-setup. Run `make superpowers` to update (pinned
snapshot). Gives `brainstorming`, `writing-plans`, `test-driven-development`,
`systematic-debugging`, and more — `/brainstorming` (Claude Code) or
`/skill:brainstorming` (pi). See `.claude/skills/SUPERPOWERS-NOTICE.md`.

> **Optional auto-typecheck:** add a `Stop` hook to `.claude/settings.json` —
> `"Stop": [{ "matcher": "*", "hooks": [{ "type": "command", "command": "npm run typecheck" }] }]`.
> Off by default — handy when reviewing, noisy during hands-on.
