# Design Spec — A2UI Generative UI Workshop App (all-Node, audience-runnable)

**Conference:** AgentCon Perth 2026
**Speaker:** Jimmy Li
**Spec author:** Jimmy + Claude · brainstorming session 2026-06-16
**Status:** Approved design · ready for implementation planning

---

## 1 · Summary

Rebuild the workshop's live-demo app so that **what the audience runs and what the speaker narrates are the same thing**.

Today there are two diverging artifacts:

- `Doc/workshop-talk-script.md` (the talk) narrates a **sales-analytics / Generative-UI** demo: flight cards, pie charts, an agent-composed sales dashboard, an embedded sketchpad, and a shared todo list. It assumes a **real LLM** via CopilotKit (the L3 hands-on requires the agent to genuinely change behavior when a component `description` changes).
- `src/` (the current code) is a **deterministic CRM proof object** ("Prepare my Q3 follow-up for Acme Corp"). It has no real LLM and no CopilotKit. It cannot perform the L3 hands-on.

The source of truth for the *code* is the `ipynb/` notebooks (`L3`–`L6`), which contain the real CopilotKit v2 + A2UI implementation in a DeepLearning.AI-style Jupyter/Python course format.

This spec defines a **standalone, all-Node/TypeScript web app** — extracted from the notebooks and aligned to the talk — that the **audience pulls and runs themselves** with one `npm install`, a shared API key, and one `npm run dev`.

**Decision:** *Code follows the talk.* The deterministic CRM demo is replaced.

---

## 2 · Decisions locked during brainstorming

| # | Decision | Choice |
|---|---|---|
| D1 | Alignment direction | **Code follows talk** (rebuild the demo to match the talk's sales-analytics scenario) |
| D2 | Agent driver | **Real LLM via CopilotKit v2** (deterministic mock is dropped) |
| D3 | Source of truth for code | The `ipynb/` notebooks (`L3`–`L6`) |
| D4 | Deliverable form | **Standalone runnable web app** (`npm run dev`), not a Jupyter course |
| D5 | App structure | **Unified app + level navigation** (one frontend, tabs L2–L6; one backend) |
| D6 | Model | **Switchable via `LLM_MODEL` env var**; default `openai:gpt-4.1`, e.g. `anthropic:claude-sonnet-4-6` |
| D7 | Who runs it | **The audience runs it themselves** (pull repo, install, run) |
| D8 | Backend stack | **All Node/TypeScript** — no Python; agent + runtime in TS |
| D9 | API key strategy | **Speaker provides a temporary, rate-limited shared key**, revoked after the workshop |

These nine decisions are binding for the implementation plan. Anything not covered here defaults to following the notebooks.

---

## 3 · Goals & non-goals

### Goals

1. A single repo the audience can run in **under 5 minutes on a fresh machine** (per the original spec's acceptance criterion) with only Node installed.
2. Live demos for **L2 → L6** that match the talk beat-for-beat, including the **L3 hands-on** (change a component `description`, watch the agent stop calling it).
3. **One language (TypeScript)**, **two processes** (Vite dev server + Node CopilotKit runtime), one start command.
4. **Model-agnostic** backend: switch OpenAI ↔ Claude with one env var.
5. Every live demo has a **recorded fallback** (keystroke-switchable) for stage safety.

### Non-goals (YAGNI)

- No Python backend, no LangGraph, no `helper.py` Jupyter orchestration.
- No "Old Software" tab — it is a slide/concept in the talk, not an in-app demo.
- No Act I slide deck, Hook video, decision matrix, or handout production — those are tracked in `2026-05-28-workshop-design.md`, out of scope here.
- No multi-tenant hosting, auth, or persistence beyond in-session state.
- No re-theming to a different business domain (e.g. wealth management) — the scenario stays the talk's sales-analytics one.

---

## 4 · Architecture

Two processes, one language, one start command:

```
Browser (Vite dev server, :5173)
  └─ /api/copilotkit            (Vite proxy)
       └─ server.ts             Node CopilotKit v2 runtime (Hono)  :4000
            ├─ BuiltInAgent     directly calls the model provider (OpenAI / Anthropic)
            ├─ TS tools         get_sales_data, search_flights, manage_todos, get_todos, …
            ├─ a2ui             { injectA2UITool: true } + catalog
            └─ openGenerativeUI (+ optional Excalidraw MCP, default off)
                 └─ model provider  ← LLM_MODEL + shared API key from .env
```

### 4.1 Repo layout (target)

```
Perth-Agent-Con-Workshop/
  package.json            # single workspace; scripts: dev (concurrently), build, test, lint
  .env.example            # LLM_MODEL, OPENAI_API_KEY, ANTHROPIC_API_KEY
  vite.config.ts          # @/ alias → src; proxy /api/copilotkit → :4000
  server.ts               # Node CopilotKit runtime + BuiltInAgent + tools
  src/
    main.tsx              # <CopilotKit runtimeUrl="/api/copilotkit" a2ui={{catalog}}>
    App.tsx               # tab shell, L2–L6 navigation
    lessons/              # L2PlainChat, L3Components, L4Compose, L5Tools, L6SharedState
    components/           # flight-card, pie-chart, todo-app-layout, todo-list
    catalog/              # definitions.ts (A2UI primitives), renderers.tsx
    hooks/                # use-example-suggestions
    agent/                # tools.ts (TS port of notebook tools), agents.ts (per-level config)
    globals.css
  ipynb/                  # KEPT as reference source (not executed)
  Doc/                    # talk script + lesson docs (narrative source of truth)
  docs/superpowers/       # specs + plans
```

The current deterministic `src/` (App.jsx, lessons/*.jsx, agent/workshopAgent.js, data/crmData.js, components/*.jsx) is **removed**. It is currently **untracked** in git, so the plan's first step must **commit it before removing** — this keeps the deterministic proof object recoverable from history (and usable as an emergency offline fallback). `ipynb/` is retained read-only as the code source.

### 4.2 Unified multi-agent model

One CopilotKit runtime registers a per-level agent so each tab gets exactly the capability it teaches:

- `agents: { l2, l3, l4, l5, l6 }` in the runtime — each a `BuiltInAgent` with its own system prompt and tool set.
- The frontend `<CopilotKit>` provider is mounted once with the a2ui catalog and `runtimeUrl`. Each lesson tab selects its agent (CopilotKit v2 agent selection) and registers any frontend-only hooks (`useComponent`, `useAgent`, `useFrontendTool`).
- Runtime-level capabilities (`injectA2UITool`, `openGenerativeUI`, optional `mcpApps`) are enabled globally; levels that don't use them simply don't trigger them.

### 4.3 Process orchestration

`npm run dev` runs **both** processes via `concurrently`:

1. `vite` — frontend dev server (default :5173), proxies `/api/copilotkit` → :4000.
2. `tsx server.ts` (or equivalent) — the Node runtime on :4000.

`npm run build` builds the frontend; the runtime can run via `node`/`tsx` in preview. A `Makefile`/npm script wraps both so a fresh clone is `npm install && npm run dev`.

---

## 5 · Per-level specification

All demo prompt strings are taken verbatim from the notebooks (see `ipynb/`). The unifying narrative is the talk's sales-analytics scenario.

> **Note — prompt wording sync:** The talk's design spec (`2026-05-28-workshop-design.md` §6.3) names a single "non-negotiable" repeated question — *"Show me Q3 sales by region."* The notebooks instead use *"Summarize the last quarter's metrics"* (L2) and *"Show me a sales dashboard…"* (L4). Since this project is *code follows talk* but the notebooks are the code source, build with the **notebook prompts** and flag the talk's literal wording to reconcile during rehearsal (a one-line talk edit, not a code change).

| Level | Frontend | Agent / tools (TS) | Demo prompts (verbatim) |
|---|---|---|---|
| **L2 — Plain chat** | `<CopilotChat />` | `l2`: `BuiltInAgent`, no tools | "Summarize the last quarter's metrics." |
| **L3 — Controlled GenUI** | `useComponent` × (showMyName, pieChart, flightCard) + `FlightCard`, `PieChart` components + `useExampleSuggestions` | `l3`: base agent (no server tools; components are frontend) | "Show a flight card for Pacific Air from SFO to JFK departing at 08:30 for $249" · "Please show me the distribution of our revenue by category in a pie chart" |
| **L4 — Declarative A2UI** | a2ui catalog (`definitions.ts` + `renderers.tsx`) + `useExampleDynamicSuggestions`/`useExampleFixedSuggestions` | `l4`: tools `get_sales_data`, `search_flights`, `display_flights`; runtime `injectA2UITool` | "Show me a sales dashboard with total revenue, new customers, and conversion rate metrics." · "Display flight information" |
| **L5 — Open GenUI** | none new | `l5`: base agent; capability in runtime config (`openGenerativeUI: true`; optional `mcpApps` Excalidraw) | "Make it rain tacos!" · (optional) "Show a network diagram of three routers… using excalidraw" |
| **L6 — Shared state** | `useAgent` + `useFrontendTool(openOrCloseTodos)` + `TodoAppLayout`, `TodoList` | `l6`: tools `manage_todos`, `get_todos`; agent shared state `{ todos }` | "Add three todos about learning CopilotKit" · "What's on my list?" · "Remove all completed todos" |

### 5.1 L3 hands-on (the one interactive moment)

The audience opens the L3 component registration (in `lessons/L3Components.tsx` or `App.tsx`), changes the `description` on the `flightCard` `useComponent` registration to e.g. *"Only call this for international flights"*, saves (Vite HMR), and re-issues the SFO→JFK prompt. The agent should **stop** rendering the flight card. This requires the real LLM (D2) and is validated by **manual QA**, not an automated test.

### 5.2 A2UI catalog (L4)

Port the notebook's `definitions.ts` (≈19 primitives: Title, Text, Icon, Image, Divider, Card, List, Tabs, Row, Column, DashboardCard, Metric, PieChart, BarChart, Badge, DataTable, Button) and `renderers.tsx` (`CatalogRenderers` + `createCatalog`, `recharts` for charts) as-is — these are frontend TS and language-independent. The agent receives `definitions` as its vocabulary; `renderers` draw the chosen tree; `createCatalog(catalogId: "copilotkit://app-dashboard-catalog")` is registered in `main.tsx`.

The fixed-schema `display_flights` path (Python `a2ui.render` in the notebook) is re-expressed using the **Node/TS A2UI rendering equivalent** — verified against CopilotKit v2 docs during implementation (see §8 R2). If no clean Node equivalent exists, fall back to the dynamic `generate_a2ui` path for flights too.

### 5.3 L6 shared state

Two-way binding: the agent's tools update a `{ todos }` state; the frontend reads `agent.state.todos` and writes `agent.setState({ todos })` via `useAgent`. Demo flow: agent adds todos → user checks one in the panel → agent reads the user-edited state on the next turn. The Node `BuiltInAgent` shared-state API is verified during implementation (see §8 R3); fallback is frontend-owned state synchronized through tool results.

---

## 6 · Audience-runnability (the load-bearing requirement)

Because the audience runs the app themselves (D7), these deliverables are first-class, not afterthoughts:

1. **`README` Quick Start** — exactly three steps: `npm install` → copy `.env.example` to `.env` and paste the shared key → `npm run dev`. Node version stated (≥20). One printed URL.
2. **`.env.example`** — `LLM_MODEL=openai:gpt-4.1`, `OPENAI_API_KEY=`, `ANTHROPIC_API_KEY=`, with comments.
3. **Shared key distribution (D9)** — a dedicated, low-rate-limit key shown on a slide / handout, revoked after the session. The README notes "use your own key after the workshop."
4. **One-command start** — `npm run dev` starts both processes; no separate terminal choreography.
5. **Recorded fallback per demo** — keystroke-switchable, for when venue Wi-Fi or rate limits bite.
6. **Pre-distribute** the repo link ≥24h before so early arrivers can `npm install`.

---

## 7 · Testing strategy

Real LLM output is non-deterministic, so testing is layered:

### Deterministic unit tests (CI, no API key) — Vitest + Testing Library

- **Components**: `FlightCard`, `PieChart`, `TodoList`, `TodoAppLayout` render correctly for given props.
- **Catalog**: every primitive in `definitions.ts` has a matching renderer in `renderers.tsx`; Zod schemas validate representative payloads; `resolveText`/data-binding helpers behave.
- **Tools (pure logic)**: `get_sales_data`, `search_flights`, `manage_todos` (bulk-replace + id-fill), `get_todos` return expected shapes for given inputs.

### Manual / optional smoke (needs the shared key, not in CI)

- End-to-end: each level's demo prompt produces the expected tool call / rendered surface. This is the speaker's **T-60 on-site smoke test** (L2→L6, one message each).
- **L3 hands-on**: change `description`, confirm the agent stops calling the component.

### Build verification

- `npm run build` succeeds; `npm test -- --run` green; type-check passes.

---

## 8 · Risks & implementation-time verifications

CopilotKit v2 is recent and the notebooks pin **no** `@copilotkit/*` versions, so the implementation plan must verify the API against official docs (source-driven) and pin versions.

| # | Risk / unknown | Mitigation |
|---|---|---|
| R1 | `BuiltInAgent` tool + system-prompt config differs from the notebook's Python LangGraph agent | Verify `@copilotkit/runtime/v2` `BuiltInAgent` API vs docs; the `Doc/L2-tutorial.md` already uses `BuiltInAgent`, so the pattern exists. Pin a known-good version. |
| R2 | L4 fixed-schema `display_flights` used Python `a2ui.render`; Node equivalent unconfirmed | Verify Node A2UI render API; if absent, route flights through dynamic `generate_a2ui`. |
| R3 | L6 shared state via Node `BuiltInAgent` may differ from LangGraph `AgentState`/`Command` | Verify v2 agent-state API; fallback = frontend-owned state synced via tool results. |
| R4 | L5 Excalidraw MCP is external network (150 people on venue Wi-Fi) | Default **off**; `openGenerativeUI` ("raining tacos") is the primary L5 demo; Excalidraw is opt-in with a recorded fallback. |
| R5 | Shared key abuse / rate-limit during live demos | Dedicated low-limit key, revoked after; recorded fallbacks; model switch to a backup provider via `LLM_MODEL`. |
| R6 | Files referenced but never defined in notebooks (L2 base agent, `pie-chart.tsx`, todo components, suggestion hooks, vite proxy/alias) | Recreate from the notebook patterns + L3 recap (FlightCard body is given); enumerated as concrete tasks in the plan. |
| R7 | Audience on mixed OS / Node versions | State Node ≥20; keep deps minimal; test a clean clone. |

---

## 9 · Acceptance criteria

The rebuild is "done" when:

- [ ] A fresh clone runs with `npm install` → set `.env` → `npm run dev` in **under 5 minutes**, Node-only.
- [ ] All five tabs (L2–L6) load and each runs its talk demo prompt successfully against a real model.
- [ ] The **L3 hands-on** works: editing the `flightCard` `description` changes whether the agent renders it.
- [ ] `LLM_MODEL` switches OpenAI ↔ Claude with no code change.
- [ ] Deterministic unit tests (components + catalog + tools) pass in CI without an API key; `npm run build` succeeds.
- [ ] Each demo has a recorded fallback.
- [ ] README Quick Start is accurate on a machine that never saw the project.
- [ ] No Python, no `helper.py`, no "Old Software" tab remain; `ipynb/` retained as reference.

---

## 10 · Implementation sequencing (for the plan)

Incremental, each step independently runnable:

0. **Foundation** — remove deterministic `src/`; scaffold all-Node app (`package.json`, `vite.config.ts` with alias+proxy, `server.ts` with one `BuiltInAgent`, `.env.example`, `main.tsx`, `App.tsx` tab shell); L2 empty chat talks to the model. Verify model switch.
1. **L3** (main course + hands-on) — `FlightCard`, `PieChart`, `useComponent` registrations, suggestions hook; verify the description-change behavior.
2. **L4** — port `definitions.ts` + `renderers.tsx`; `get_sales_data`/`search_flights`/`display_flights` tools; `injectA2UITool`; dashboard demo.
3. **L5** — runtime `openGenerativeUI`; optional Excalidraw `mcpApps` (default off).
4. **L6** — `manage_todos`/`get_todos` tools + shared state; `TodoAppLayout`, `TodoList`, `useAgent`, `useFrontendTool`.
5. **Polish** — README Quick Start, one-command `dev`, recorded-fallback hooks, final test + build pass.

---

## 11 · Handoff

On approval of this spec, the next step is the **writing-plans** skill to produce an ordered, dependency-aware implementation plan from §10, with verification steps and the §8 source-driven checks built in as explicit tasks.
