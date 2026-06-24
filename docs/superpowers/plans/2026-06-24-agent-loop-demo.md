# 🔁 Agent Loop Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `🔁 Agent Loop` tab that visualizes a real, model-driven tool-calling loop (model → tool → re-decide) step-by-step, with a shared tool registry + `/add-loop-tool` command so attendees can add their own tools.

**Architecture:** A server-only Hono route `POST /api/agent-loop` runs a bounded OpenAI-compatible tool-calling loop and streams one SSE event per step. A shared, secret-free registry declares the tools (server executes them, client lists them). The client tab parses the SSE stream and renders a timeline; UI tools render through a small component registry (reusing `PieChart`).

**Tech Stack:** TypeScript, React 18, Hono (`streamSSE`), Zod + `zod-to-json-schema`, Vite, Vitest + Testing Library, `node:fetch`.

## Global Constraints

- TypeScript throughout; match the style of the file being edited.
- Server-imported modules under `src/` must use **relative imports** (the `@/` alias isn't resolved under tsx) — see `src/lessons/l4-tools.ts`.
- Any component rendering an array/object prop **must default it** (streaming/partial props) — see `src/components/pie-chart.tsx`.
- Model format is `provider/model` (slash). Default `LLM_MODEL=openai/gpt-4.1`; key from `.env` (`OPENAI_API_KEY`). Never print or commit a key.
- Vitest is scoped to `src/**/*.{test,spec}.{ts,tsx}`. Run one-shot tests with `npx vitest run`.
- `🪁 EXTENSION POINT` markers tag attendee-extensible seams.
- Commit after each task.

---

### Task 1: SSE event contract + parser

**Files:**
- Create: `src/agent-loop/loop-events.ts`
- Test: `src/agent-loop/loop-events.test.ts`

**Interfaces:**
- Produces: `type LoopEvent` (discriminated union on `type`), `type ToolResultUi = { component: string; props: Record<string, unknown> }`, and `parseSSE(buffer: string): { events: LoopEvent[]; rest: string }`.

- [ ] **Step 1: Write the failing test**

```ts
// src/agent-loop/loop-events.test.ts
import { describe, it, expect } from "vitest";
import { parseSSE, type LoopEvent } from "./loop-events";

describe("parseSSE", () => {
  it("parses complete frames and returns no remainder", () => {
    const buf = `data: ${JSON.stringify({ type: "start", maxTurns: 8 })}\n\n`;
    const { events, rest } = parseSSE(buf);
    expect(events).toEqual([{ type: "start", maxTurns: 8 }]);
    expect(rest).toBe("");
  });

  it("keeps a trailing partial frame in rest", () => {
    const whole = `data: ${JSON.stringify({ type: "done" })}\n\n`;
    const partial = `data: {"type":"mod`;
    const { events, rest } = parseSSE(whole + partial);
    expect(events).toEqual([{ type: "done" }]);
    expect(rest).toBe(partial);
  });

  it("ignores malformed frames without throwing", () => {
    const { events } = parseSSE(`data: not-json\n\n`);
    expect(events).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/agent-loop/loop-events.test.ts`
Expected: FAIL — cannot find module `./loop-events`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/agent-loop/loop-events.ts
export type ToolResultUi = { component: string; props: Record<string, unknown> };

export type LoopEvent =
  | { type: "start"; maxTurns: number }
  | { type: "model_step"; turn: number; text: string }
  | { type: "tool_call"; turn: number; callId: string; name: string; args: Record<string, unknown> }
  | { type: "tool_result"; turn: number; callId: string; name: string; kind: "data" | "ui"; data?: unknown; ui?: ToolResultUi }
  | { type: "tool_error"; turn: number; callId: string; name: string; message: string }
  | { type: "final"; turn: number; text?: string; reason: "stop" | "max_turns" }
  | { type: "error"; message: string }
  | { type: "done" };

// Pure parser for our SSE protocol: frames are separated by a blank line and
// each frame carries one `data: <json>` line. Returns the events parsed so far
// plus any trailing partial frame to carry into the next chunk.
export function parseSSE(buffer: string): { events: LoopEvent[]; rest: string } {
  const events: LoopEvent[] = [];
  const frames = buffer.split("\n\n");
  const rest = frames.pop() ?? "";
  for (const frame of frames) {
    const line = frame.split("\n").find((l) => l.startsWith("data:"));
    if (!line) continue;
    const json = line.slice("data:".length).trim();
    if (!json) continue;
    try {
      events.push(JSON.parse(json) as LoopEvent);
    } catch {
      // skip malformed frame
    }
  }
  return { events, rest };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/agent-loop/loop-events.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/agent-loop/loop-events.ts src/agent-loop/loop-events.test.ts
git commit -m "feat(agent-loop): SSE event contract + pure parser"
```

---

### Task 2: Loop tools registry + seed tools + OpenAI tool specs

**Files:**
- Create: `src/agent-loop/loop-tools.ts`
- Test: `src/agent-loop/loop-tools.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `type LoopTool`, `defineLoopTool(t): LoopTool`, `loopTools: LoopTool[]`, `findLoopTool(name): LoopTool | undefined`, `buildOpenAITools(tools): {type:"function"; function:{name;description;parameters}}[]`, and seed tools `getSalesData`, `calculate`, `makePieChart`. `makePieChart.execute` returns `{ component: "pieChart", props: { title, slices } }` (matches `PieChartProps`).

- [ ] **Step 1: Write the failing test**

```ts
// src/agent-loop/loop-tools.test.ts
import { describe, it, expect } from "vitest";
import { loopTools, findLoopTool, buildOpenAITools, makePieChart, calculate } from "./loop-tools";

describe("loop-tools", () => {
  it("ships the three seed tools", () => {
    expect(loopTools.map((t) => t.name).sort()).toEqual(["calculate", "get_sales_data", "make_pie_chart"]);
  });

  it("calculate executes one operation", () => {
    expect(calculate.execute({ a: 6, b: 3, op: "/" })).toEqual({ a: 6, b: 3, op: "/", result: 2 });
  });

  it("make_pie_chart returns a pieChart UI spec with slices (PieChart prop name)", () => {
    const out = makePieChart.execute({ title: "Rev", slices: [{ label: "A", value: 1 }] });
    expect(out).toEqual({ component: "pieChart", props: { title: "Rev", slices: [{ label: "A", value: 1 }] } });
  });

  it("findLoopTool resolves by name", () => {
    expect(findLoopTool("calculate")?.name).toBe("calculate");
    expect(findLoopTool("nope")).toBeUndefined();
  });

  it("buildOpenAITools emits a JSON-schema function spec per tool", () => {
    const specs = buildOpenAITools(loopTools);
    expect(specs).toHaveLength(3);
    const calc = specs.find((s) => s.function.name === "calculate")!;
    expect(calc.type).toBe("function");
    expect(calc.function.parameters).toMatchObject({ type: "object" });
    expect((calc.function.parameters as any).properties).toHaveProperty("op");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/agent-loop/loop-tools.test.ts`
Expected: FAIL — cannot find module `./loop-tools`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/agent-loop/loop-tools.ts
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export type LoopToolResult = unknown | { component: string; props: Record<string, unknown> };

export type LoopTool = {
  name: string;
  description: string;
  parameters: z.ZodObject<z.ZodRawShape>;
  kind: "data" | "ui";
  execute: (args: Record<string, unknown>) => LoopToolResult;
};

export function defineLoopTool(tool: LoopTool): LoopTool {
  return tool;
}

// Same figures L4 uses (kept local so the loop registry stays a plain, shared,
// secret-free module — do not import the CopilotKit defineTool from l4-tools).
export const SALES_FIGURES = {
  totalRevenue: "$1.2M",
  newCustomers: 3842,
  conversionRate: "3.6%",
  revenueByCategory: [
    { label: "Electronics", value: 420000 },
    { label: "Clothing", value: 310000 },
    { label: "Home & Garden", value: 185000 },
    { label: "Sports", value: 160000 },
    { label: "Books", value: 125000 },
  ],
} as const;

export const getSalesData = defineLoopTool({
  name: "get_sales_data",
  description:
    "Fetch current sales metrics: total revenue, new customers, conversion rate, and revenue broken down by category.",
  parameters: z.object({}),
  kind: "data",
  execute: () => SALES_FIGURES,
});

export const calculate = defineLoopTool({
  name: "calculate",
  description:
    "Do ONE arithmetic operation on two numbers. Use this for any math instead of computing it yourself.",
  parameters: z.object({
    a: z.number().describe("Left operand"),
    b: z.number().describe("Right operand"),
    op: z.enum(["+", "-", "*", "/"]).describe("The operation"),
  }),
  kind: "data",
  execute: (args) => {
    const { a, b, op } = args as { a: number; b: number; op: "+" | "-" | "*" | "/" };
    const result =
      op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : b === 0 ? null : a / b;
    return { a, b, op, result };
  },
});

export const makePieChart = defineLoopTool({
  name: "make_pie_chart",
  description:
    "Render a pie chart from labeled values to VISUALIZE a breakdown. Do not repeat the chart data in text afterward.",
  parameters: z.object({
    title: z.string().describe("Chart title"),
    slices: z
      .array(z.object({ label: z.string(), value: z.number() }))
      .describe("Pie slices: each a label and a numeric value"),
  }),
  kind: "ui",
  execute: (args) => {
    const { title, slices } = args as { title: string; slices: { label: string; value: number }[] };
    return { component: "pieChart", props: { title, slices } };
  },
});

// 🪁 EXTENSION POINT: add your own tool — run /add-loop-tool, or copy a
// defineLoopTool({ name, description, parameters, kind, execute }) block and add
// it to the array below. The real model decides when to call it; UI tools
// (kind:"ui") must return { component, props } where `component` is a key in
// src/agent-loop/loop-component-registry.tsx.
export const loopTools: LoopTool[] = [getSalesData, calculate, makePieChart];

export function findLoopTool(name: string): LoopTool | undefined {
  return loopTools.find((t) => t.name === name);
}

export function buildOpenAITools(tools: LoopTool[]) {
  return tools.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: zodToJsonSchema(t.parameters, { target: "jsonSchema7" }) as Record<string, unknown>,
    },
  }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/agent-loop/loop-tools.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/agent-loop/loop-tools.ts src/agent-loop/loop-tools.test.ts
git commit -m "feat(agent-loop): tool registry, seed tools, OpenAI tool specs"
```

---

### Task 3: Server route — the loop + SSE + wiring

**Files:**
- Create: `agent-loop-route.ts` (repo root, server-only)
- Modify: `server.ts` (compose the route with the CopilotKit handler)
- Modify: `vite.config.ts` (proxy `/api/agent-loop`)

**Interfaces:**
- Consumes: `loopTools`, `findLoopTool`, `buildOpenAITools` (Task 2); `LoopEvent` (Task 1).
- Produces: `registerAgentLoopRoute(app: Hono): void`, registering `POST /api/agent-loop` that streams `LoopEvent`s as SSE.

- [ ] **Step 1: Write the route module**

```ts
// agent-loop-route.ts — server-only. The 🔁 Agent Loop endpoint: a bounded,
// model-driven tool-calling loop that streams each step as SSE. OpenAI-compatible.
import type { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { loopTools, findLoopTool, buildOpenAITools } from "./src/agent-loop/loop-tools";
import type { LoopEvent } from "./src/agent-loop/loop-events";

const MAX_TURNS = 8;

function resolveModel() {
  const llm = process.env.LLM_MODEL ?? "openai/gpt-4.1";
  const slash = llm.indexOf("/");
  const provider = slash === -1 ? "openai" : llm.slice(0, slash);
  const model = slash === -1 ? llm : llm.slice(slash + 1);
  const endpoint = process.env.LLM_API_ENDPOINT ?? "https://api.openai.com/v1/chat/completions";
  return { provider, model, endpoint };
}

async function chat(endpoint: string, apiKey: string, body: unknown) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`model ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json() as Promise<any>;
}

export function registerAgentLoopRoute(app: Hono) {
  app.post("/api/agent-loop", (c) =>
    streamSSE(c, async (stream) => {
      const send = (e: LoopEvent) => stream.writeSSE({ data: JSON.stringify(e) });

      let prompt = "";
      try {
        const body = (await c.req.json()) as { prompt?: unknown };
        if (typeof body.prompt === "string") prompt = body.prompt;
      } catch {
        // empty body
      }

      const { provider, model, endpoint } = resolveModel();
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        await send({ type: "error", message: "Set OPENAI_API_KEY in .env to run the Agent Loop demo." });
        await send({ type: "done" });
        return;
      }
      if (provider === "anthropic" && !process.env.LLM_API_ENDPOINT) {
        await send({
          type: "error",
          message:
            "The Agent Loop runs on an OpenAI-compatible model. Set LLM_MODEL=openai/* or point LLM_API_ENDPOINT at a compatible provider.",
        });
        await send({ type: "done" });
        return;
      }
      if (!prompt.trim()) {
        await send({ type: "error", message: "Type a prompt to start the loop." });
        await send({ type: "done" });
        return;
      }

      const tools = buildOpenAITools(loopTools);
      const messages: any[] = [
        {
          role: "system",
          content:
            "You are an agent demonstrating a tool-calling loop. Prefer calling a tool over guessing. " +
            "When you render UI with a tool, do not repeat its data in text. Stop when the task is done.",
        },
        { role: "user", content: prompt },
      ];

      await send({ type: "start", maxTurns: MAX_TURNS });
      try {
        for (let turn = 0; turn < MAX_TURNS; turn++) {
          const data = await chat(endpoint, apiKey, { model, messages, tools, tool_choice: "auto", temperature: 0.2 });
          const msg = data.choices?.[0]?.message ?? {};
          messages.push(msg);
          if (msg.content) await send({ type: "model_step", turn, text: msg.content });

          const calls = msg.tool_calls ?? [];
          if (calls.length === 0) {
            await send({ type: "final", turn, text: msg.content ?? "", reason: "stop" });
            await send({ type: "done" });
            return;
          }

          for (const call of calls) {
            const name: string = call.function?.name ?? "";
            let args: Record<string, unknown> = {};
            try {
              args = JSON.parse(call.function?.arguments || "{}");
            } catch {
              // keep {}
            }
            await send({ type: "tool_call", turn, callId: call.id, name, args });

            const tool = findLoopTool(name);
            let content: string;
            if (!tool) {
              await send({ type: "tool_error", turn, callId: call.id, name, message: "unknown tool" });
              content = JSON.stringify({ error: "unknown tool" });
            } else {
              try {
                const out = tool.execute(args);
                if (tool.kind === "ui") {
                  await send({ type: "tool_result", turn, callId: call.id, name, kind: "ui", ui: out as any });
                } else {
                  await send({ type: "tool_result", turn, callId: call.id, name, kind: "data", data: out });
                }
                content = JSON.stringify(out);
              } catch (e: any) {
                await send({ type: "tool_error", turn, callId: call.id, name, message: String(e?.message ?? e) });
                content = JSON.stringify({ error: String(e?.message ?? e) });
              }
            }
            messages.push({ role: "tool", tool_call_id: call.id, content });
          }

          if (turn === MAX_TURNS - 1) await send({ type: "final", turn, reason: "max_turns" });
        }
        await send({ type: "done" });
      } catch (e: any) {
        await send({ type: "error", message: String(e?.message ?? e) });
        await send({ type: "done" });
      }
    }),
  );
}
```

- [ ] **Step 2: Wire it into `server.ts`**

Replace the app-construction + serve block. The current code is:

```ts
const app = createCopilotHonoHandler({ runtime, basePath: "/api/copilotkit" });
const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`✓ CopilotKit runtime on http://localhost:${port}/api/copilotkit  (model: ${model})`);
});
```

Change it to compose a parent Hono app so our route and the CopilotKit handler coexist:

```ts
import { Hono } from "hono";
import { registerAgentLoopRoute } from "./agent-loop-route";

const copilot = createCopilotHonoHandler({ runtime, basePath: "/api/copilotkit" });
const app = new Hono();
registerAgentLoopRoute(app);          // POST /api/agent-loop
app.mount("/", copilot.fetch);        // everything else → CopilotKit handler
const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`✓ CopilotKit runtime on http://localhost:${port}/api/copilotkit  (model: ${model})`);
  console.log(`✓ Agent Loop on        http://localhost:${port}/api/agent-loop`);
});
```

(Add the two `import` lines at the top of `server.ts` with the other imports.)

- [ ] **Step 3: Proxy the route in `vite.config.ts`**

In `server.proxy`, add an entry next to `/api/copilotkit`:

```ts
    proxy: {
      "/api/copilotkit": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/api/agent-loop": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: PASS (no type errors). If `c.req.json()`/`streamSSE` types complain, ensure `hono` is imported from `"hono"` and `streamSSE` from `"hono/streaming"`.

- [ ] **Step 5: Runtime smoke — both endpoints alive**

Run (in one shell): `npm run server`
Then in another shell:

```bash
# CopilotKit endpoint still mounted (any non-500 response = route exists):
curl -s -o /dev/null -w "copilotkit:%{http_code}\n" -X POST http://localhost:4000/api/copilotkit
# Agent-loop endpoint streams an SSE error event when no key/prompt:
curl -s -N -X POST http://localhost:4000/api/agent-loop -H 'Content-Type: application/json' -d '{}' | head -5
```

Expected: `copilotkit:` prints a code (not `000`); the agent-loop curl prints at least one `data: {"type":"error",...}` then `data: {"type":"done"}`. Stop the server (Ctrl-C) when confirmed.

> If `app.mount("/", copilot.fetch)` does not forward `/api/copilotkit` (copilotkit smoke returns `000`/404), instead register the route directly on the returned handler: `const app = createCopilotHonoHandler(...); registerAgentLoopRoute(app as unknown as Hono);` and serve `app.fetch`. Re-run this smoke.

- [ ] **Step 6: Commit**

```bash
git add agent-loop-route.ts server.ts vite.config.ts
git commit -m "feat(agent-loop): server SSE loop route + wiring + vite proxy"
```

---

### Task 4: UI component registry for tool results

**Files:**
- Create: `src/agent-loop/loop-component-registry.tsx`
- Test: `src/agent-loop/loop-component-registry.test.tsx`

**Interfaces:**
- Consumes: `PieChart` from `@/components/pie-chart`; `ToolResultUi` from `./loop-events`.
- Produces: `renderLoopUi(ui: ToolResultUi): JSX.Element` — looks up `ui.component` in a registry, renders the mapped component with `ui.props`, or a generic JSON card for unknown components.

- [ ] **Step 1: Write the failing test**

```tsx
// src/agent-loop/loop-component-registry.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderLoopUi } from "./loop-component-registry";

describe("renderLoopUi", () => {
  it("renders a known component (pieChart) by title", () => {
    render(renderLoopUi({ component: "pieChart", props: { title: "Revenue", slices: [] } }));
    expect(screen.getByText("Revenue")).toBeInTheDocument();
  });

  it("falls back to a JSON card for an unknown component", () => {
    render(renderLoopUi({ component: "mystery", props: { a: 1 } }));
    expect(screen.getByText(/mystery/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/agent-loop/loop-component-registry.test.tsx`
Expected: FAIL — cannot find module `./loop-component-registry`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/agent-loop/loop-component-registry.tsx
import type { ComponentType } from "react";
import { PieChart } from "@/components/pie-chart";
import type { ToolResultUi } from "./loop-events";

// 🪁 EXTENSION POINT: map a UI tool's `component` name to a React component.
// Add an entry here when your /add-loop-tool tool returns kind:"ui".
const registry: Record<string, ComponentType<any>> = {
  pieChart: PieChart,
};

export function renderLoopUi(ui: ToolResultUi) {
  const Component = registry[ui.component];
  if (Component) return <Component {...ui.props} />;
  return (
    <div className="rounded-lg border bg-white p-3" style={{ fontSize: 13 }}>
      <div style={{ fontWeight: 600 }}>Unknown UI component: {ui.component}</div>
      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(ui.props, null, 2)}</pre>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/agent-loop/loop-component-registry.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/agent-loop/loop-component-registry.tsx src/agent-loop/loop-component-registry.test.tsx
git commit -m "feat(agent-loop): UI component registry for tool results"
```

---

### Task 5: LoopStep card component

**Files:**
- Create: `src/components/loop-step.tsx`
- Test: `src/components/loop-step.test.tsx`

**Interfaces:**
- Consumes: `LoopEvent` (Task 1); `renderLoopUi` (Task 4).
- Produces: `LoopStep({ event }: { event: LoopEvent }): JSX.Element` — one card per event variant; UI tool results render via `renderLoopUi`. Renders safely with partial props.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/loop-step.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoopStep } from "./loop-step";

describe("LoopStep", () => {
  it("renders a tool_call with the tool name", () => {
    render(<LoopStep event={{ type: "tool_call", turn: 0, callId: "1", name: "get_sales_data", args: {} }} />);
    expect(screen.getByText(/get_sales_data/)).toBeInTheDocument();
  });

  it("renders a data tool_result as JSON", () => {
    render(<LoopStep event={{ type: "tool_result", turn: 0, callId: "1", name: "calculate", kind: "data", data: { result: 2 } }} />);
    expect(screen.getByText(/"result": 2/)).toBeInTheDocument();
  });

  it("renders a ui tool_result via the component registry", () => {
    render(
      <LoopStep
        event={{ type: "tool_result", turn: 0, callId: "1", name: "make_pie_chart", kind: "ui", ui: { component: "pieChart", props: { title: "Rev", slices: [] } } }}
      />,
    );
    expect(screen.getByText("Rev")).toBeInTheDocument();
  });

  it("renders a final answer", () => {
    render(<LoopStep event={{ type: "final", turn: 1, text: "All done", reason: "stop" }} />);
    expect(screen.getByText(/All done/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/loop-step.test.tsx`
Expected: FAIL — cannot find module `./loop-step`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/loop-step.tsx
import type { LoopEvent } from "@/agent-loop/loop-events";
import { renderLoopUi } from "@/agent-loop/loop-component-registry";

const card: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: "10px 12px",
  marginBottom: 10,
  background: "#fff",
  fontSize: 14,
};
const tag = (bg: string): React.CSSProperties => ({
  display: "inline-block",
  background: bg,
  borderRadius: 6,
  padding: "1px 8px",
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
});

export function LoopStep({ event }: { event: LoopEvent }) {
  switch (event.type) {
    case "start":
      return <div style={{ ...card, color: "#6b7280" }}>▶ Loop started · cap {event.maxTurns} turns</div>;
    case "model_step":
      return (
        <div style={card}>
          <span style={tag("#eef2ff")}>turn {event.turn} · model</span>
          <div>{event.text}</div>
        </div>
      );
    case "tool_call":
      return (
        <div style={card}>
          <span style={tag("#fef9c3")}>→ tool call</span>
          <div>
            <code>{event.name}({JSON.stringify(event.args)})</code>
          </div>
        </div>
      );
    case "tool_result":
      return (
        <div style={card}>
          <span style={tag("#dcfce7")}>← {event.name} result</span>
          {event.kind === "ui" && event.ui ? (
            renderLoopUi(event.ui)
          ) : (
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(event.data ?? {}, null, 2)}</pre>
          )}
        </div>
      );
    case "tool_error":
      return (
        <div style={{ ...card, borderColor: "#fca5a5" }}>
          <span style={tag("#fee2e2")}>✗ {event.name} error</span>
          <div>{event.message}</div>
        </div>
      );
    case "final":
      return (
        <div style={{ ...card, borderColor: "#86efac" }}>
          <span style={tag("#dcfce7")}>✓ final{event.reason === "max_turns" ? " · hit step limit" : ""}</span>
          <div>{event.text || (event.reason === "max_turns" ? "Reached the step limit." : "")}</div>
        </div>
      );
    case "error":
      return (
        <div style={{ ...card, borderColor: "#fca5a5", color: "#b91c1c" }}>
          <span style={tag("#fee2e2")}>error</span>
          <div>{event.message}</div>
        </div>
      );
    case "done":
      return <div style={{ ...card, color: "#6b7280" }}>■ Done</div>;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/loop-step.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/loop-step.tsx src/components/loop-step.test.tsx
git commit -m "feat(agent-loop): LoopStep card component"
```

---

### Task 6: AgentLoopDemo tab + App wiring

**Files:**
- Create: `src/lessons/AgentLoopDemo.tsx`
- Test: `src/lessons/AgentLoopDemo.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `parseSSE`, `LoopEvent` (Task 1); `loopTools` (Task 2); `LoopStep` (Task 5); `ExamplePrompts` from `@/components/example-prompts`.
- Produces: default-exported `AgentLoopDemo` React component; a new tab in `App.tsx`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/lessons/AgentLoopDemo.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AgentLoopDemo from "./AgentLoopDemo";

describe("AgentLoopDemo", () => {
  it("lists the registered loop tools and an example prompt", () => {
    render(<AgentLoopDemo />);
    expect(screen.getByText("get_sales_data")).toBeInTheDocument();
    expect(screen.getByText("make_pie_chart")).toBeInTheDocument();
    expect(screen.getByText(/pie chart/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lessons/AgentLoopDemo.test.tsx`
Expected: FAIL — cannot find module `./AgentLoopDemo`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/lessons/AgentLoopDemo.tsx
import { useState } from "react";
import { parseSSE, type LoopEvent } from "@/agent-loop/loop-events";
import { loopTools } from "@/agent-loop/loop-tools";
import { LoopStep } from "@/components/loop-step";
import { ExamplePrompts } from "@/components/example-prompts";

export default function AgentLoopDemo() {
  const [prompt, setPrompt] = useState("Show our revenue by category as a pie chart");
  const [events, setEvents] = useState<LoopEvent[]>([]);
  const [running, setRunning] = useState(false);
  const turns = events.filter((e) => e.type === "model_step").length;

  async function run() {
    if (running || !prompt.trim()) return;
    setEvents([]);
    setRunning(true);
    try {
      const res = await fetch("/api/agent-loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const { events: parsed, rest } = parseSSE(buf);
        buf = rest;
        if (parsed.length) setEvents((prev) => [...prev, ...parsed]);
      }
    } catch (e: any) {
      setEvents((prev) => [...prev, { type: "error", message: String(e?.message ?? e) }]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="lesson">
      <div className="lesson-copy">
        <h2>🔁 Agent Loop · model → tool → re-decide</h2>
        <p>
          A real, model-driven loop. Each step is streamed live: the model decides, calls a
          tool, sees the result, and decides again — until it answers. Tools can return data
          or render UI. Add your own with <code>/add-loop-tool</code>.
        </p>
      </div>

      <ExamplePrompts prompts={["Show our revenue by category as a pie chart", "What is 420000 divided by 1200000 as a percent?"]} />

      <div style={{ display: "flex", gap: 8, padding: "0 24px 12px" }}>
        <input
          aria-label="Prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8 }}
        />
        <button type="button" onClick={run} disabled={running}>
          {running ? "Running…" : "Run loop"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 16, padding: "0 24px 24px", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 8 }}>
            Turns: {turns} / 8
          </div>
          {events.length === 0 && !running ? (
            <p style={{ color: "#6b7280" }}>Run the loop to see each step appear here.</p>
          ) : (
            events.map((e, i) => <LoopStep key={i} event={e} />)
          )}
        </div>
        <aside style={{ width: 220, flexShrink: 0 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Available tools</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13 }}>
            {loopTools.map((t) => (
              <li key={t.name} style={{ marginBottom: 8 }}>
                <code>{t.name}</code>
                <div style={{ color: "#6b7280" }}>{t.description}</div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lessons/AgentLoopDemo.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Add the tab to `src/App.tsx`**

Add the import with the other lesson imports:

```tsx
import AgentLoopDemo from "@/lessons/AgentLoopDemo";
```

Add the tab to the `tabs` array, after the `extend` entry:

```tsx
  { id: "agentLoop", label: "🔁 Agent Loop", render: () => <AgentLoopDemo /> },
```

- [ ] **Step 6: Verify App still renders**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS (existing App tests still green).

- [ ] **Step 7: Commit**

```bash
git add src/lessons/AgentLoopDemo.tsx src/lessons/AgentLoopDemo.test.tsx src/App.tsx
git commit -m "feat(agent-loop): AgentLoopDemo tab + timeline UI + App wiring"
```

---

### Task 7: `/add-loop-tool` command + docs

**Files:**
- Create: `.claude/commands/add-loop-tool.md`
- Modify: `EXTENDING.md` (add an axis)
- Modify: `README.md` (one "What runs today" bullet + mention the command)
- Modify: `CLAUDE.md` (one line under conventions/extension points)

**Interfaces:** none (docs/harness only).

- [ ] **Step 1: Write the command**

```markdown
<!-- .claude/commands/add-loop-tool.md -->
---
description: Scaffold a tool for the 🔁 Agent Loop demo (the model decides when to call it)
---

Add a new tool the 🔁 Agent Loop can call. Arguments: `$ARGUMENTS` (a tool name and a short description of what it does).

Steps:

1. Open `src/agent-loop/loop-tools.ts`.
2. Add a `defineLoopTool({ ... })` block near the seed tools, following the existing pattern:
   - `name`: snake_case, unique.
   - `description`: write it for the MODEL — say clearly when to call it.
   - `parameters`: a `z.object({...})` with `.describe()` on each field.
   - `kind`: `"data"` (returns JSON) or `"ui"` (returns `{ component, props }`).
   - `execute(args)`: pure, no secrets, no shell, no filesystem.
3. Add it to the exported `loopTools` array (at the `🪁 EXTENSION POINT` marker).
4. If `kind: "ui"`, add a renderer:
   - pick a `component` key (e.g. `"flightCard"`),
   - in `src/agent-loop/loop-component-registry.tsx`, import the component and add it to the `registry` map (also at its `🪁 EXTENSION POINT`).
5. Add a unit test in `src/agent-loop/loop-tools.test.ts` asserting `execute` returns the expected shape.
6. Run `npx vitest run src/agent-loop/` — make sure it passes.
7. Run `npm run dev`, open the 🔁 Agent Loop tab, and confirm the new tool appears in "Available tools" and the model calls it for a fitting prompt.

Keep it the smallest tool that demonstrates the idea. Show the diff and the test result.
```

- [ ] **Step 2: Add an axis to `EXTENDING.md`**

Append a row/section consistent with the existing axes (match the file's format):

```markdown
- **Agent-loop tool** — a function the real model drives in the 🔁 Agent Loop tab.
  Add it with `/add-loop-tool <name> <what it does>` (registry: `src/agent-loop/loop-tools.ts`;
  UI renderers: `src/agent-loop/loop-component-registry.tsx`).
```

- [ ] **Step 3: Mention it in `README.md`**

Under "What runs today", add after the L4 bullet:

```markdown
- **🔁 Agent Loop** — a real, model-driven tool-calling loop, visualized step by step
  (model → tool → re-decide). Tools return data or render UI.
  Try: *"Show our revenue by category as a pie chart"*. Add your own tool with
  **`/add-loop-tool`**.
```

And in "Extend this workshop", add to the command list:

```markdown
- `/add-loop-tool` — a tool the 🔁 Agent Loop model can call
```

- [ ] **Step 4: Mention it in `CLAUDE.md`**

Under the extension points / architecture notes, add one line:

```markdown
- **🔁 Agent Loop** (`src/agent-loop/` + `agent-loop-route.ts`): a host-owned SSE loop
  (`/api/agent-loop`) that streams each tool-calling step. Tools live in
  `loop-tools.ts` (`defineLoopTool`); `/add-loop-tool` scaffolds one.
```

- [ ] **Step 5: Commit**

```bash
git add .claude/commands/add-loop-tool.md EXTENDING.md README.md CLAUDE.md
git commit -m "docs(agent-loop): /add-loop-tool command + README/CLAUDE/EXTENDING"
```

---

### Task 8: Full gate + live smoke + branch wrap

**Files:** none (verification only).

- [ ] **Step 1: Run the full quality gate**

Run: `npm run typecheck && npx vitest run && npm run build`
Expected: typecheck clean; all tests pass (existing 21 + the new loop-events/loop-tools/loop-component-registry/loop-step/AgentLoopDemo tests); build succeeds.

- [ ] **Step 2: Live smoke (needs a real key in `.env`)**

Run: `npm run dev`, open the printed URL, click **🔁 Agent Loop**, keep the default prompt, click **Run loop**.
Expected: a timeline appears — a `model` step, a `→ tool call` to `get_sales_data`, its `← result`, a `→ tool call` to `make_pie_chart`, a rendered pie chart, then a `✓ final`. The turn counter advances. (If no key: a single red `error` card with the "set OPENAI_API_KEY" guidance — that's correct behavior.)

- [ ] **Step 3: Confirm the extension loop**

Add a trivial tool via the steps in `.claude/commands/add-loop-tool.md` (e.g. a `data` tool `reverse_string`), reload, confirm it shows under "Available tools" and the model calls it for a fitting prompt. Revert the throwaway tool.

- [ ] **Step 4: Push and open a PR**

```bash
git push -u origin feat/agent-loop-demo
gh pr create --base main --head feat/agent-loop-demo \
  --title "feat: 🔁 Agent Loop demo + per-attendee loop tools" \
  --body "See docs/superpowers/specs/2026-06-24-agent-loop-demo-design.md and docs/superpowers/plans/2026-06-24-agent-loop-demo.md."
```

Report the PR URL.

---

## Self-Review

**Spec coverage:** D1 server endpoint → T3 · D2 registry + command → T2/T7 · D3 GenUI render → T4/T5 · D4 OpenAI-compatible → T3 (`resolveModel`/`chat`) · D5 component registry reusing PieChart → T4 · D6 tab name/placement → T6 · D7 `MAX_TURNS=8` → T3 + T6 counter. SSE contract → T1. Tests → T1/T2/T4/T5/T6 + manual live (T8). Vite proxy + wiring → T3. Errors/guardrails → T3 (no-key/anthropic/tool-error/max-turns) + T6 (client catch). Extensibility → T7. No gaps.

**Type consistency:** `LoopEvent` (T1) used identically in T3/T5/T6. `LoopTool`/`loopTools`/`findLoopTool`/`buildOpenAITools` (T2) used in T3. `ToolResultUi` (T1) used in T4. `renderLoopUi` (T4) used in T5. `makePieChart` emits `{component:"pieChart", props:{title, slices}}` matching `PieChartProps` and the T4 registry. Tab id `agentLoop` (T6) — self-contained.

**Placeholder scan:** every code step shows complete code; commands have expected output; no TBD/TODO.
