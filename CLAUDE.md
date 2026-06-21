# CLAUDE.md — AgentCon Perth 2026 · Agentic Generative-UI Workshop

A runnable **CopilotKit v2 + A2UI** workshop app showing one user intent rendered
across the Generative-UI spectrum (L2 → L4). All-Node/TypeScript — no Python.

## Run it
1. `npm install`
2. Copy `.env.example` → `.env` and set `OPENAI_API_KEY` (or `ANTHROPIC_API_KEY`
   and point `LLM_MODEL` at Anthropic). **Never commit `.env`.**
3. `npm run dev` — starts the Vite frontend (http://localhost:5173) **and** the
   CopilotKit runtime (http://localhost:4000) together via `concurrently`.
   - Blank page / 404 on first load = the frontend booted before the runtime.
     **Reload once.**

## Commands
| Command | What |
|---|---|
| `npm run dev` | Frontend + runtime together |
| `npm run server` | Runtime only (`tsx watch server.ts`) |
| `npm test` | Vitest (watch). For one-shot use `npx vitest run`. |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Production build |

Harness shortcuts (this repo's `.claude/`): **`/run`**, **`/add-component`**, **`/verify`**.

## Architecture (unified app)
- **`server.ts`** — Hono server hosting the CopilotKit v2 runtime at
  `/api/copilotkit`. One `BuiltInAgent` per level (`l2`, `l3`, `l4`) plus
  `default`. Model is switchable via `LLM_MODEL` (`provider/model`, default
  `openai/gpt-4.1`).
- **`src/`** — Vite + React 18 + TypeScript.
  - `App.tsx` — tab shell (L2 → L4).
  - `src/lessons/` — one component per level (`L2PlainChat`, `L3Components`, `L4Declarative`) + `l4-tools.ts`.
  - `src/components/` — reusable GenUI components (`flight-card`, `pie-chart`, `example-prompts`).
  - `src/catalog/` — the A2UI catalog (definitions, renderers, schema) used by L4.
  - `src/main.tsx` — the `<CopilotKit>` provider.

## Conventions
- TypeScript throughout; match the style of the file you're editing.
- New controlled-GenUI component (L3): add `src/components/<name>.tsx`
  **with a default value for every array/object prop**, a colocated
  `<name>.test.tsx`, and register it via
  `useComponent({ name, description, parameters: zodSchema, render })` in the
  lesson. `/add-component` scaffolds exactly this.
- L4 surfaces are **host-authored** by tools returning `{ a2ui_operations: [...] }`
  (see `src/lessons/l4-tools.ts`).
- Run **`/verify`** (typecheck + test + build) before calling anything done.

## CopilotKit v2 gotchas (verified against `@copilotkit/*@1.60.1`)
- **"v2" is a `/v2` subpath of the 1.60.1 packages** — not a 2.x major. Import
  from `@copilotkit/runtime/v2`, `@copilotkit/react-core/v2`.
- **Model format is slash**: `openai/gpt-4.1`, `anthropic/claude-sonnet-4-6` — not a colon.
- **`server.ts` must `import "dotenv/config"` first**, or the key won't load.
- **`<CopilotKit useSingleEndpoint={false} runtimeUrl="/api/copilotkit" …>`** —
  without `useSingleEndpoint={false}` the chat POSTs to the bare base path and 404s.
- **Select the agent with `agentId`**: `<CopilotChat agentId="l3" />`.
- **Default every array prop** in a `useComponent`/A2UI-rendered component —
  streaming delivers partial props and `undefined.map` white-screens the page.
- **L4 dashboards are host-authored** via a `{a2ui_operations}` tool with
  **inlined literal values** — root-level `{path}` bindings don't resolve for `Metric.value`.

## Docs
- `docs/lessons/` — lesson briefs (L3–L5).
- `docs/workshop-talk-script.md` — speaker script · `docs/presentation/` — slide doc + cheat-sheet.
- `docs/superpowers/specs/` & `plans/` — design specs and implementation plans.

## Safety
- Keys live in **local `.env` only** (gitignored). Never paste a key into chat, a
  command, or a tracked file. The `PreToolUse` hook `.claude/hooks/guard-secrets.sh`
  blocks any command containing an API key or trying to commit `.env`.
- The committed `.claude/settings.json` allowlists safe build/test/read commands
  and denies `git push` / `rm` / writing `.env`. Personal overrides go in
  `.claude/settings.local.json` (gitignored).
