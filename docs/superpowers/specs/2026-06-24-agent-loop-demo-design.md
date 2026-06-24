# Design: 🔁 Agent Loop demo + per-attendee loop tools

**Date:** 2026-06-24 · **Status:** approved (brainstorming) → ready for writing-plans

## 1. Goal

Add a new App tab, **🔁 Agent Loop**, that makes the agentic loop *visible*: a real,
model-driven loop streams each step — **model decides → calls a tool → result feeds
back → model re-decides** — rendered as a live timeline. The loop can call tools that
return plain data *or* renderable GenUI. After the demo, every attendee can add their
own tool that the real model will then decide to call.

This is the browser-native sibling of the hand-written loop in
`.github/scripts/ticket-implement.mjs`.

## 2. Non-goals (YAGNI)

- **Not** observing CopilotKit's `BuiltInAgent` loop (its per-step tool events aren't
  observable client-side — the limitation that parked L5). We own our own loop + stream.
- **Not** multi-provider in this loop. OpenAI-compatible chat/completions only
  (covers the default `openai/gpt-4.1`, the shared workshop key, and any
  OpenAI-compatible endpoint via `LLM_API_ENDPOINT`). Anthropic-native is a follow-up.
- **Not** token-level streaming of the model's text. We call the model once per turn
  (non-streaming) and emit our own step events. Token streaming can come later.
- **Not** a new persistence/shared-state layer (that's the L6 concept).

## 3. Decisions (resolved during brainstorming)

| # | Decision |
|---|---|
| D1 | Real model-driven loop via a **dedicated server endpoint** we control. |
| D2 | Extensibility = a **tool registry** + a **`/add-loop-tool`** guided command. |
| D3 | The loop **can render GenUI** (UI tools), feasible because we own the SSE stream. |
| D4 | Model path = **OpenAI-compatible** chat/completions (`fetch`, like ticket-implement.mjs). |
| D5 | UI tools render via a **lightweight component registry** reusing `FlightCard` / `PieChart` + a generic data card. |
| D6 | New top-level tab **🔁 Agent Loop** after 🪁 Extend. **Not** named L5 (L5 is a different, parked concept). |
| D7 | Loop guardrail: **`MAX_TURNS = 8`**. |

## 4. Architecture & data flow

New server route **`POST /api/agent-loop`** (body `{ prompt: string }`) runs a bounded
loop and streams Server-Sent Events, one per step:

```
messages = [system, user(prompt)]
emit start { maxTurns }
for turn in 0..MAX_TURNS-1:
  resp = chatCompletions(messages, toolSpecs)        // OpenAI-compatible, non-streaming
  msg  = resp.choices[0].message;  messages.push(msg)
  if msg.content:  emit model_step { turn, text }    // the model's reasoning/decision
  calls = msg.tool_calls ?? []
  if calls.empty:  emit final { turn, text, reason:"stop" };  break
  for call in calls:
    emit tool_call { turn, callId, name, args }
    try   { out = registry[name].execute(args) }
          emit tool_result { turn, callId, name, kind, data|ui }
    catch { emit tool_error { turn, callId, name, message };  out = { error } }
    messages.push(toolResultMessage(callId, out))     // feed back
  if last turn:  emit final { turn, reason:"max_turns" }
emit done
```

### SSE event contract (`LoopEvent`, discriminated on `type`)

| type | payload | meaning |
|---|---|---|
| `start` | `{ maxTurns }` | loop began |
| `model_step` | `{ turn, text }` | model's assistant text for this turn |
| `tool_call` | `{ turn, callId, name, args }` | model chose a tool |
| `tool_result` | `{ turn, callId, name, kind:"data"\|"ui", data?, ui?:{component,props} }` | tool output |
| `tool_error` | `{ turn, callId, name, message }` | tool threw; error fed back |
| `final` | `{ turn, text?, reason:"stop"\|"max_turns" }` | model stopped or hit the cap |
| `error` | `{ message }` | setup/model failure (no key, wrong provider, HTTP error) |
| `done` | `{}` | stream end |

### Model call

- Endpoint: `LLM_API_ENDPOINT` if set, else `https://api.openai.com/v1/chat/completions`.
- Model field: strip the provider prefix from `LLM_MODEL` (`openai/gpt-4.1` → `gpt-4.1`).
- Key: `OPENAI_API_KEY`. If absent → emit `error` ("set OPENAI_API_KEY in .env").
- If `LLM_MODEL` starts with `anthropic/` and no `LLM_API_ENDPOINT` → emit `error`
  ("Agent Loop runs on an OpenAI-compatible model; set LLM_MODEL=openai/* or point
  LLM_API_ENDPOINT at a compatible provider"). (Per D4 — explicit, not silent.)
- Tool specs built from each tool's Zod `parameters` via **`zod-to-json-schema`**
  (already a dependency, used by `src/catalog/schema.ts`).

## 5. The loop-tools registry (the core extension point)

`src/agent-loop/loop-tools.ts` — shared by server (executes) and client (lists). No secrets.

```ts
export type LoopTool = {
  name: string;
  description: string;             // the model reads this to decide
  parameters: z.ZodObject<any>;    // → JSON Schema for the tool spec
  kind: "data" | "ui";
  execute: (args: any) => unknown | { component: string; props: object };
};
export function defineLoopTool(t: LoopTool): LoopTool { return t; }

// 🪁 EXTENSION POINT: add your own tool here (or run /add-loop-tool). The real
// model will decide when to call it, and the loop timeline shows each step.
export const loopTools: LoopTool[] = [ getSalesData, calculate, makePieChart ];
```

**Seed tools** (chosen so the very first run shows ≥2 turns):

- `get_sales_data` (`data`) — returns the static sales metrics. Reuse the *figures*
  from `l4-tools.ts` (extract them to a shared constant if cleaner); do **not** wrap the
  CopilotKit `defineTool` — a `LoopTool` is its own plain shape.
- `calculate` (`data`) — params `{ a:number, b:number, op:"+"|"-"|"*"|"/" }`; a pure
  compute tool the model can chain (e.g. a growth %).
- `make_pie_chart` (`ui`) — params `{ title:string, data:{label,value}[] }`; returns
  `{ component:"pieChart", props:{ title, data } }`.

Example prompt *"Show our revenue by category as a pie chart"* →
`get_sales_data` → `make_pie_chart` → `final`. A clean two-step loop out of the box.

## 6. Client tab

- **`src/lessons/AgentLoopDemo.tsx`** — prompt input + `ExamplePrompts`; on submit,
  `fetch` POST to `/api/agent-loop`, read the `ReadableStream`, parse SSE lines into
  `LoopEvent`s, render the timeline. Shows a **turn counter / `MAX_TURNS`** and a side
  **"Available tools"** panel auto-listed from `loopTools` (so an attendee sees their
  new tool appear). No API key → render the `error` event's guidance.
- **`src/agent-loop/loop-events.ts`** — the `LoopEvent` union + **pure** helpers
  `parseSSE(chunk, buffer)` and `reduceEvents(events)` → timeline state. Unit-tested.
- **`src/components/loop-step.tsx`** — renders one step card, variant by event `type`;
  **default-prop-safe** (no `.map` on possibly-undefined). Unit-tested.
- **`src/agent-loop/loop-component-registry.tsx`** — `{ flightCard: FlightCard,
  pieChart: PieChart }` + a generic JSON/data card fallback for unknown `component`.
  A `tool_result` with `kind:"ui"` renders via this map.

## 7. Error handling & guardrails

- **No key / wrong provider / model HTTP error** → `error` event → tab shows guidance.
- **Tool throws** → `tool_error` event + the error is fed back to the model; loop continues (matches `ticket-implement.mjs`).
- **Hits `MAX_TURNS`** → `final { reason:"max_turns" }` with a "reached step limit" note.
- **Client stream/network failure** → timeline shows an error state + a retry button.
- **Safety:** seed tools are pure/mock (no secrets, no shell, no fs). The route never
  echoes the key. `prompt` is the only client input and only reaches the model.

## 8. Testing strategy

- `src/agent-loop/loop-tools.test.ts` (vitest) — each seed tool's `execute` returns the
  expected shape; `zod-to-json-schema` yields a valid spec for every tool.
- `src/agent-loop/loop-events.test.ts` (vitest) — `parseSSE` turns raw `data: …` chunks
  (incl. split across reads) into typed events; `reduceEvents` groups by turn correctly.
- `src/components/loop-step.test.tsx` (vitest + RTL) — renders each event variant; a
  `ui` result renders the mapped component; renders safely with empty/partial props.
- **Live loop** (real model, multi-turn) — manual verification with a key, like L4-F.

## 9. Extensibility surface

- **`.claude/commands/add-loop-tool.md`** — `/add-loop-tool <name> <what it does>`:
  scaffolds a `defineLoopTool({ name, description, parameters, kind, execute })` block in
  `loop-tools.ts`; for a `ui` tool, also adds a registry entry + a small renderer. Mirrors
  `/add-tool`.
- **`EXTENDING.md`** — new axis row: *Agent-loop tool — a function the model drives in the
  🔁 Agent Loop tab.*
- 🪁 EXTENSION POINT markers at the `loopTools` array and the component registry.

## 10. Wiring

- **`vite.config.ts`** — add a `/api/agent-loop` proxy entry (target `:4000`,
  `changeOrigin: true`) alongside `/api/copilotkit`.
- **`server.ts`** — register the `POST /api/agent-loop` route on the same Hono app that
  hosts the CopilotKit handler. (Route logic lives in a server-only module,
  `agent-loop-route.ts`, importing the shared registry/events via relative paths — the
  `@/` alias isn't resolved under tsx, per the `l4-tools.ts` note.)
- **`src/App.tsx`** — add `{ id: "agentLoop", label: "🔁 Agent Loop", render: () => <AgentLoopDemo /> }` after the Extend tab.
- **`README.md` / `CLAUDE.md`** — a short "What runs today" entry + mention `/add-loop-tool`.

## 11. Units & boundaries

| Unit | Does | Depends on | Tested |
|---|---|---|---|
| `loop-tools.ts` | declares tools + how to run one | zod | execute shapes + schema |
| `loop-events.ts` | wire contract + SSE parsing/reduce | — (pure) | parse + reduce |
| `agent-loop-route.ts` | orchestrates model+tools+SSE (server-only) | loop-tools, loop-events, env, fetch | manual (live) |
| `AgentLoopDemo` + `loop-step` + registry | presentation | loop-events (types), loop-tools (list), components | RTL render |

Server-only code (the key + model call) stays out of the client bundle; the shared
registry/events carry no secrets.

## 12. Risks / open questions (resolve in planning)

- **Hono composition:** confirm `createCopilotHonoHandler(...)` returns a Hono app we can
  add a route to, else wrap both under a parent Hono app. (Resolve in plan T1.)
- **SSE through the Vite proxy:** set `Content-Type: text/event-stream`,
  `Cache-Control: no-cache`; verify Vite's proxy streams rather than buffers.
- **Model-field stripping** and the Anthropic-path error message must be covered by the
  live smoke (no automated model test).
