# A2UI Workshop App — Foundation + L3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the all-Node/TypeScript CopilotKit v2 app skeleton (one Vite frontend + one Node runtime, one `npm run dev`) and ship the L2 plain-chat baseline plus the L3 Controlled-Generative-UI demo (flight card + pie chart) including the audience hands-on.

**Architecture:** Two processes — a Vite React+TS dev server (`:5173`) that proxies `/api/copilotkit` to a Node CopilotKit v2 runtime (`:4000`). The runtime hosts a `BuiltInAgent` that calls the model provider directly; the model is chosen by the `LLM_MODEL` env var (default `openai/gpt-4.1`). L3 components are registered on the frontend with `useComponent`, so the agent renders typed React components in chat.

**Tech Stack:** Vite, React 18 + TypeScript, `@copilotkit/react-core/v2`, `@copilotkit/runtime` (`/v2`), `@hono/node-server`, `recharts`, `zod`, `vitest` + `@testing-library/react`, `tsx`, `concurrently`.

**Scope note:** This is plan 1 of a series. It covers spec §10 phases 0–1 (Foundation + L3). L4 (A2UI catalog), L5 (open GenUI), and L6 (shared state) are deferred to follow-up plans because their CopilotKit v2 APIs (server-side `ToolDefinition` shape, Node A2UI render, agent shared state) require their own source-driven verification before code can be written without guessing. Source of truth for code: the `ipynb/` notebooks and `Doc/L2-tutorial.md`. Spec: `docs/superpowers/specs/2026-06-16-a2ui-genui-workshop-app-design.md`.

**Version caveat (verified 2026-06-16):** The CopilotKit "v2" API ships as a **`/v2` subpath export inside the 1.x packages**, NOT as a 2.x package major. `npm` `latest` for `@copilotkit/runtime`, `@copilotkit/react-core`, and `@copilotkit/a2ui-renderer` is **`1.60.1`**, and that version's `exports` map includes `./v2`, `./v2/hono`, `./v2/node` (runtime) and `./v2`, `./v2/styles.css` (react-core). So pin packages to `^1.60.1` and import from `@copilotkit/runtime/v2` / `@copilotkit/react-core/v2`. If an import path or symbol differs from what is written here, STOP and check `https://docs.copilotkit.ai` before improvising — record the corrected signature in this plan.

---

## File Structure

New files (created in this plan):

- `package.json` — single-workspace manifest: deps + `dev`/`build`/`test`/`server` scripts. (replaces the current deterministic-demo manifest)
- `tsconfig.json` — TS config with `@/*` → `src/*` path alias.
- `vite.config.ts` — React plugin, `@` alias, dev-server proxy `/api/copilotkit` → `http://localhost:4000`, Vitest config.
- `index.html` — Vite entry, mounts `src/main.tsx`.
- `.env.example` — `LLM_MODEL`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`.
- `server.ts` — Node CopilotKit v2 runtime: `CopilotRuntime` + `BuiltInAgent` (model from env) + `createCopilotEndpoint` + `@hono/node-server` `serve`.
- `src/main.tsx` — React entry, `<CopilotKit runtimeUrl="/api/copilotkit">` provider + styles import.
- `src/App.tsx` — tab shell with L2/L3 navigation (L4–L6 tabs added in later plans).
- `src/globals.css` — minimal app styling.
- `src/lessons/L2PlainChat.tsx` — L2 baseline: just `<CopilotChat />`.
- `src/lessons/L3Components.tsx` — L3: registers components via `useComponent`, renders `<CopilotChat />` + example prompts.
- `src/components/flight-card.tsx` — `FlightCard` + `FlightCardProps` (Zod). (body given verbatim in `ipynb/L3.ipynb` recap)
- `src/components/pie-chart.tsx` — `PieChart` + `PieChartProps` (Zod) using `recharts`. (notebook references it but never defines a body — we author it)
- `src/components/example-prompts.tsx` — presentational list of example prompt chips (replaces the notebooks' undefined `useExampleSuggestions` hook with a display-only component; no unverified API).
- `src/setupTests.ts` — Testing Library jest-dom matchers.
- Test files alongside: `src/components/flight-card.test.tsx`, `src/components/pie-chart.test.tsx`, `src/components/example-prompts.test.tsx`.

Removed (the deterministic CRM proof object, preserved in git history by Task 1):

- `src/App.jsx`, `src/main.jsx`, `src/App.test.jsx`, `src/styles.css`
- `src/agent/`, `src/data/`, `src/components/*.jsx`, `src/lessons/*.jsx`
- The old `vite.config.js` (replaced by `vite.config.ts`).

---

## Task 1: Preserve current demo, then reset project manifest

**Files:**
- Commit (no change): all currently-untracked files
- Modify/replace: `package.json`
- Delete: `package-lock.json` (regenerated), old deterministic `src/` tree, `vite.config.js`

- [ ] **Step 1: Preserve the existing deterministic demo in git history**

The current deterministic CRM demo is untracked. Commit it so it stays recoverable (and usable as an emergency offline fallback) before we replace it.

Run:
```bash
git add -A
git commit -m "chore: preserve deterministic CRM demo before A2UI rebuild"
```
Expected: a commit is created capturing `src/`, `index.html`, the old `package.json`, `vite.config.js`, etc.

- [ ] **Step 2: Remove the deterministic app source and old config**

Run:
```bash
git rm -r src vite.config.js package-lock.json
git rm index.html
```
Expected: files staged for deletion. (We recreate `index.html` and `src/` fresh below; `ipynb/`, `Doc/`, `docs/` are untouched.)

- [ ] **Step 3: Write the new `package.json`**

```json
{
  "name": "perth-agentcon-a2ui-workshop",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "concurrently -n web,api -c blue,green \"vite\" \"npm:server\"",
    "server": "tsx watch server.ts",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@copilotkit/react-core": "^1.60.1",
    "@copilotkit/runtime": "^1.60.1",
    "@hono/node-server": "^1.13.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.13.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.4",
    "concurrently": "^9.1.0",
    "jsdom": "^25.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.10",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 4: Install and verify CopilotKit v2 resolves**

Run:
```bash
npm install
npm ls @copilotkit/runtime @copilotkit/react-core
npm view @copilotkit/runtime@$(node -p "require('@copilotkit/runtime/package.json').version") exports
```
Expected: both resolve to `1.60.x` (or a newer `1.x`), and the runtime's `exports` map includes a `./v2` and `./v2/hono` entry. The "v2" API is a subpath of the 1.x package — there is no 2.x package. If `./v2` is absent from `exports`, STOP and check `https://docs.copilotkit.ai`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: reset to all-Node A2UI workshop manifest"
```

---

## Task 2: Build config — TypeScript, Vite proxy, env, HTML

**Files:**
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `.env.example`

- [ ] **Step 1: Write `tsconfig.json` (single config — no project references)**

A single tsconfig covering both the browser (`src`) and Node (`server.ts`, `vite.config.ts`) sides. We deliberately avoid the Vite default's two-config `references`/`composite` split — with `noEmit` + `tsc --noEmit` it produces a spurious `TS6305` because `vite.config.ts` ends up owned by two projects. `@types/node` (added to devDeps in Task 1) types `process.env`/`node:url`.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["node", "vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "server.ts", "vite.config.ts"]
}
```

- [ ] **Step 3: Write `vite.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: 5173,
    proxy: {
      "/api/copilotkit": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
  },
});
```

- [ ] **Step 4: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>A2UI Generative UI Workshop</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Write `.env.example`**

```bash
# Which model the BuiltInAgent uses. Format: provider/model
# Default matches the workshop notebooks. Switch to Claude with: anthropic/claude-sonnet-4-6
LLM_MODEL=openai/gpt-4.1

# Provide the key for whichever provider LLM_MODEL points at.
# At the workshop, paste the shared temporary key here.
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

- [ ] **Step 6: Commit**

```bash
git add tsconfig.json vite.config.ts index.html .env.example
git commit -m "chore: add TS + Vite config with copilotkit proxy and env template"
```

(If `tsconfig.node.json` was created by an earlier attempt, remove it: `git rm tsconfig.node.json`.)

---

## Task 3: Backend runtime — `server.ts` with model-switchable BuiltInAgent

**Files:**
- Create: `server.ts`

The endpoint pattern (`createCopilotEndpoint` + `@hono/node-server` `serve`) is taken verbatim from `ipynb/L4.ipynb` / `L5.ipynb`. The `BuiltInAgent` constructor (`model`, `apiKey`, `maxSteps`, `prompt`, `overridableProperties`) is from `Doc/L2-tutorial.md` and `https://docs.copilotkit.ai/built-in-agent/advanced-configuration`.

- [ ] **Step 1: Write `server.ts`**

```ts
import { serve } from "@hono/node-server";
import { CopilotRuntime, createCopilotHonoHandler, BuiltInAgent } from "@copilotkit/runtime/v2";

// Note: in @copilotkit/runtime@1.60.1, `createCopilotEndpoint` is a deprecated
// alias for `createCopilotHonoHandler`; use the canonical name.
const model = process.env.LLM_MODEL ?? "openai/gpt-4.1";
const apiKey = model.startsWith("anthropic")
  ? process.env.ANTHROPIC_API_KEY
  : process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error(
    `Missing API key for model "${model}". Copy .env.example to .env and set ` +
      (model.startsWith("anthropic") ? "ANTHROPIC_API_KEY." : "OPENAI_API_KEY."),
  );
  process.exit(1);
}

// One BuiltInAgent per workshop level. For Foundation + L3 the L2 and L3
// agents are identical plain chat agents (L3's UI components live on the
// frontend). Later plans add per-level tools/prompts here.
function makeAgent(prompt: string) {
  return new BuiltInAgent({
    model,
    apiKey,
    maxSteps: 5,
    prompt,
    overridableProperties: ["model", "temperature", "prompt"],
  });
}

const runtime = new CopilotRuntime({
  agents: {
    default: makeAgent("You are a helpful assistant for a product analytics demo."),
    l2: makeAgent("You are a helpful assistant. Answer concisely in text."),
    l3: makeAgent(
      "You are a helpful assistant. When the user asks to see a flight or a " +
        "chart, call the matching UI component tool with structured data.",
    ),
  },
});

const app = createCopilotHonoHandler({ runtime, basePath: "/api/copilotkit" });
const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`✓ CopilotKit runtime on http://localhost:${port}/api/copilotkit  (model: ${model})`);
});
```

- [ ] **Step 2: Verify it type-checks**

Run:
```bash
npm run typecheck
```
Expected: no errors. If `createCopilotEndpoint` or `BuiltInAgent` is reported missing from `@copilotkit/runtime/v2`, check the package's exported entrypoints (`npm ls`, inspect `node_modules/@copilotkit/runtime/package.json` `exports`) and correct the import path; record the fix here.

- [ ] **Step 3: Verify it boots and rejects missing keys**

Run (no `.env` yet):
```bash
npx tsx server.ts
```
Expected: exits with the "Missing API key" message.

Then create `.env` from the template with any non-empty placeholder key and run again:
```bash
cp .env.example .env
# put a dummy value in OPENAI_API_KEY just to pass the guard
npx tsx server.ts
```
Expected: prints `✓ CopilotKit runtime on http://localhost:4000/...`. Stop it with Ctrl-C. (Real model calls are exercised in Task 4 manual QA.)

- [ ] **Step 4: Commit**

```bash
git add server.ts
git commit -m "feat: add all-Node copilotkit runtime with model-switchable BuiltInAgent"
```

---

## Task 4: Frontend shell — provider, App tabs, L2 baseline, runnable end-to-end

**Files:**
- Create: `src/setupTests.ts`
- Create: `src/globals.css`
- Create: `src/main.tsx`
- Create: `src/lessons/L2PlainChat.tsx`
- Create: `src/App.tsx`

- [ ] **Step 1: Write `src/setupTests.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 2: Write `src/globals.css`**

```css
:root {
  --bg: #fafafa;
  --surface: #ffffff;
  --line: #e5e7eb;
  --text: #0f172a;
  --muted: #6b7280;
  --accent: #4f46e5;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--text);
}

* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); }

.app-shell { display: flex; flex-direction: column; height: 100vh; }
.app-header { padding: 16px 24px; border-bottom: 1px solid var(--line); }
.app-header h1 { margin: 0; font-size: 18px; }
.app-header p { margin: 4px 0 0; color: var(--muted); font-size: 14px; }

.tab-bar { display: flex; gap: 4px; padding: 8px 24px; border-bottom: 1px solid var(--line); }
.tab-bar button {
  border: 1px solid var(--line); background: var(--surface);
  border-radius: 8px; padding: 6px 14px; cursor: pointer; font-size: 14px;
}
.tab-bar button.is-active { background: var(--accent); color: #fff; border-color: var(--accent); }

.lesson { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.lesson-copy { padding: 12px 24px; }
.lesson-copy h2 { margin: 0 0 4px; font-size: 16px; }
.lesson-copy p { margin: 0; color: var(--muted); font-size: 14px; }
.chat-region { flex: 1; min-height: 0; }
```

- [ ] **Step 3: Write `src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CopilotKit } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import "./globals.css";
import App from "@/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CopilotKit runtimeUrl="/api/copilotkit">
      <App />
    </CopilotKit>
  </StrictMode>,
);
```

- [ ] **Step 4: Write `src/lessons/L2PlainChat.tsx`**

```tsx
import { CopilotChat } from "@copilotkit/react-core/v2";

export default function L2PlainChat() {
  return (
    <section className="lesson">
      <div className="lesson-copy">
        <h2>L2 · Plain chat</h2>
        <p>Text-only assistant. The home of the "bolt-on chatbot". Try: "Summarize the last quarter's metrics."</p>
      </div>
      <div className="chat-region">
        <CopilotChat agent="l2" />
      </div>
    </section>
  );
}
```

> If `<CopilotChat>` does not accept an `agent` prop in the installed version, render `<CopilotChat />` and select the agent at the provider level instead; verify against the chat component docs and record the correct selection mechanism here.

- [ ] **Step 5: Write `src/App.tsx`**

```tsx
import { useState } from "react";
import L2PlainChat from "@/lessons/L2PlainChat";

type Tab = { id: string; label: string; render: () => JSX.Element };

const tabs: Tab[] = [
  { id: "l2", label: "L2 Chat", render: () => <L2PlainChat /> },
  // L3 added in Task 7; L4–L6 in later plans.
];

export default function App() {
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Agentic Generative-UI Workshop</h1>
        <p>Same intent, different placement — L2 → L6.</p>
      </header>
      <nav className="tab-bar" aria-label="Workshop levels">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={t.id === active ? "is-active" : ""}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {current.render()}
    </main>
  );
}
```

- [ ] **Step 6: Type-check**

Run:
```bash
npm run typecheck
```
Expected: no errors.

- [ ] **Step 7: Manual end-to-end QA (needs a real key)**

Put a real (shared/dev) key in `.env`, then run:
```bash
npm run dev
```
Open `http://localhost:5173`. Expected: the L2 tab shows a chat; typing "Summarize the last quarter's metrics" streams a text reply. This confirms the proxy → runtime → model path works end-to-end.

- [ ] **Step 8: Commit**

```bash
git add src/setupTests.ts src/globals.css src/main.tsx src/App.tsx src/lessons/L2PlainChat.tsx
git commit -m "feat: copilotkit provider, app tab shell, and L2 plain-chat baseline"
```

---

## Task 5: FlightCard component (TDD)

**Files:**
- Create: `src/components/flight-card.tsx`
- Test: `src/components/flight-card.test.tsx`

Component body is taken verbatim from the `ipynb/L3.ipynb` recap cell.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FlightCard } from "./flight-card";

describe("FlightCard", () => {
  it("renders airline, route, time, and price", () => {
    render(
      <FlightCard
        title="Pacific Air"
        airline="Pacific Air"
        origin="SFO"
        destination="JFK"
        departure_time="08:30"
        price="$249"
      />,
    );
    expect(screen.getByText("Pacific Air")).toBeInTheDocument();
    expect(screen.getByText("SFO → JFK")).toBeInTheDocument();
    expect(screen.getByText("Departs: 08:30")).toBeInTheDocument();
    expect(screen.getByText("$249")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/flight-card.test.tsx`
Expected: FAIL — cannot resolve `./flight-card`.

- [ ] **Step 3: Write `src/components/flight-card.tsx`**

```tsx
import { z } from "zod";

export const FlightCardProps = z.object({
  title: z.string().describe("Flight card title"),
  airline: z.string().describe("Airline name"),
  origin: z.string().describe("Departure airport/city"),
  destination: z.string().describe("Arrival airport/city"),
  departure_time: z.string().describe("Departure time"),
  price: z.string().describe("Price display"),
});

type FlightCardProps = z.infer<typeof FlightCardProps>;

export function FlightCard({
  title,
  airline,
  origin,
  destination,
  departure_time,
  price,
}: FlightCardProps) {
  return (
    <div className="rounded-lg border bg-white p-3 space-y-2">
      <div className="font-semibold">{title}</div>
      <div className="rounded border p-2 text-sm">
        <div className="font-medium">{airline}</div>
        <div>
          {origin} → {destination}
        </div>
        <div>Departs: {departure_time}</div>
        <div className="font-semibold">{price}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/components/flight-card.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/flight-card.tsx src/components/flight-card.test.tsx
git commit -m "feat: add FlightCard component with zod props"
```

---

## Task 6: PieChart component (TDD)

**Files:**
- Create: `src/components/pie-chart.tsx`
- Test: `src/components/pie-chart.test.tsx`

The notebooks reference `PieChart`/`PieChartProps` but never define a body; we author one using `recharts` with a `slices` array shaped to the L3 "revenue by category" demo.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PieChart } from "./pie-chart";

describe("PieChart", () => {
  it("renders the title and a legend label per slice", () => {
    render(
      <PieChart
        title="Revenue by category"
        slices={[
          { label: "Hardware", value: 40 },
          { label: "Software", value: 35 },
          { label: "Services", value: 25 },
        ]}
      />,
    );
    expect(screen.getByText("Revenue by category")).toBeInTheDocument();
    expect(screen.getByText("Hardware")).toBeInTheDocument();
    expect(screen.getByText("Software")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/pie-chart.test.tsx`
Expected: FAIL — cannot resolve `./pie-chart`.

- [ ] **Step 3: Write `src/components/pie-chart.tsx`**

We render an explicit legend (`<ul>`) so the slice labels assert deterministically in jsdom, where `recharts`' SVG label layout does not compute.

```tsx
import { z } from "zod";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export const PieChartProps = z.object({
  title: z.string().describe("Chart title"),
  slices: z
    .array(
      z.object({
        label: z.string().describe("Slice label"),
        value: z.number().describe("Slice value"),
      }),
    )
    .describe("The pie slices to display"),
});

type PieChartProps = z.infer<typeof PieChartProps>;

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#6b7280"];

export function PieChart({ title, slices }: PieChartProps) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="font-semibold">{title}</div>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <RePieChart>
            <Pie data={slices} dataKey="value" nameKey="label" outerRadius={80}>
              {slices.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </RePieChart>
        </ResponsiveContainer>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13 }}>
        {slices.map((s, i) => (
          <li key={s.label} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span
              style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length] }}
            />
            {s.label} — {s.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/components/pie-chart.test.tsx`
Expected: PASS. (If `ResponsiveContainer` warns about zero dimensions in jsdom, the assertions still pass because the legend `<ul>` is independent of the SVG; ignore the warning.)

- [ ] **Step 5: Commit**

```bash
git add src/components/pie-chart.tsx src/components/pie-chart.test.tsx
git commit -m "feat: add PieChart component with zod props and deterministic legend"
```

---

## Task 7: ExamplePrompts + L3 lesson with useComponent registrations

**Files:**
- Create: `src/components/example-prompts.tsx`
- Test: `src/components/example-prompts.test.tsx`
- Create: `src/lessons/L3Components.tsx`
- Modify: `src/App.tsx` (add the L3 tab)

- [ ] **Step 1: Write the failing test for ExamplePrompts**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ExamplePrompts } from "./example-prompts";

describe("ExamplePrompts", () => {
  it("lists every provided prompt", () => {
    render(<ExamplePrompts prompts={["First prompt", "Second prompt"]} />);
    expect(screen.getByText("First prompt")).toBeInTheDocument();
    expect(screen.getByText("Second prompt")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/example-prompts.test.tsx`
Expected: FAIL — cannot resolve `./example-prompts`.

- [ ] **Step 3: Write `src/components/example-prompts.tsx`**

```tsx
type ExamplePromptsProps = { prompts: string[] };

export function ExamplePrompts({ prompts }: ExamplePromptsProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "0 24px 12px" }}>
      {prompts.map((p) => (
        <code
          key={p}
          style={{
            background: "#f3f4f6",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: "6px 12px",
            fontSize: 13,
          }}
        >
          {p}
        </code>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/components/example-prompts.test.tsx`
Expected: PASS.

- [ ] **Step 5: Write `src/lessons/L3Components.tsx`**

The `useComponent` signature (`{ name, description, parameters, render }`) is verbatim from `ipynb/L3.ipynb`. The `flightCard` `description` is the hands-on knob (Task 8).

```tsx
import { z } from "zod";
import { CopilotChat, useComponent } from "@copilotkit/react-core/v2";
import { FlightCard, FlightCardProps } from "@/components/flight-card";
import { PieChart, PieChartProps } from "@/components/pie-chart";
import { ExamplePrompts } from "@/components/example-prompts";

export default function L3Components() {
  // 🪁 HANDS-ON KNOB: change this description to "Only call this for
  // international flights" and the agent should stop rendering the card for
  // a domestic SFO→JFK request.
  useComponent({
    name: "flightCard",
    description: "Display a single flight summary card.",
    parameters: FlightCardProps,
    render: FlightCard,
  });

  useComponent({
    name: "pieChart",
    description: "Display data as a pie chart.",
    parameters: PieChartProps,
    render: PieChart,
  });

  return (
    <section className="lesson">
      <div className="lesson-copy">
        <h2>L3 · Controlled Generative UI</h2>
        <p>The agent renders typed React components you registered. Try the prompts below.</p>
      </div>
      <ExamplePrompts
        prompts={[
          "Show a flight card for Pacific Air from SFO to JFK departing at 08:30 for $249",
          "Please show me the distribution of our revenue by category in a pie chart",
        ]}
      />
      <div className="chat-region">
        <CopilotChat agent="l3" />
      </div>
    </section>
  );
}
```

> Verify the `useComponent` import path and the `render` contract against the installed version (the notebook used `render: FlightCard` passing props directly). If the installed API differs, record the correction here.

- [ ] **Step 6: Add the L3 tab to `src/App.tsx`**

Replace the imports and `tabs` array:

```tsx
import { useState } from "react";
import L2PlainChat from "@/lessons/L2PlainChat";
import L3Components from "@/lessons/L3Components";

type Tab = { id: string; label: string; render: () => JSX.Element };

const tabs: Tab[] = [
  { id: "l2", label: "L2 Chat", render: () => <L2PlainChat /> },
  { id: "l3", label: "L3 Components", render: () => <L3Components /> },
];
```

(The rest of `App.tsx` is unchanged.)

- [ ] **Step 7: Type-check and run unit tests**

Run:
```bash
npm run typecheck
npm test -- --run
```
Expected: no type errors; all component tests pass.

- [ ] **Step 8: Manual QA — L3 renders components (needs a real key)**

Run `npm run dev`, open the L3 tab, and send each example prompt.
Expected: the flight-card prompt renders a `FlightCard`; the pie-chart prompt renders a `PieChart`.

- [ ] **Step 9: Commit**

```bash
git add src/components/example-prompts.tsx src/components/example-prompts.test.tsx src/lessons/L3Components.tsx src/App.tsx
git commit -m "feat: L3 controlled generative UI with flight card and pie chart"
```

---

## Task 8: Verify the L3 hands-on and write the README Quick Start

**Files:**
- Create/Modify: `README.md`

- [ ] **Step 1: Verify the hands-on behavior manually (needs a real key)**

With `npm run dev` running and the L3 tab open:
1. Send: `Show a flight card for Pacific Air from SFO to JFK departing at 08:30 for $249` → confirm the card renders.
2. In `src/lessons/L3Components.tsx`, change the `flightCard` `description` to `"Only call this for international flights."` and save (Vite HMR reloads).
3. Send the same SFO→JFK prompt again → expected: the agent now declines to render the flight card (it answers in text or asks to clarify), because SFO→JFK is domestic.
4. Revert the description.

Record the observed behavior. This is the workshop's audience hands-on; it is validated manually, not by an automated test.

- [ ] **Step 2: Write `README.md` Quick Start**

```markdown
# Agentic Generative-UI Workshop (AgentCon Perth 2026)

A runnable CopilotKit v2 + A2UI demo showing one intent rendered across the
Generative-UI spectrum (L2 → L6). All-Node/TypeScript: one `npm install`,
one `npm run dev`.

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
   Open the printed URL (default http://localhost:5173).

## What runs today

- **L2 Chat** — plain text assistant (the bolt-on baseline).
- **L3 Components** — the agent renders typed React components (flight card,
  pie chart) you registered with `useComponent`.
  - **Hands-on:** edit the `flightCard` `description` in
    `src/lessons/L3Components.tsx` and watch the agent stop rendering it for a
    domestic flight.

L4–L6 land in later iterations.

## Verify

```bash
npm test -- --run   # deterministic component tests (no key needed)
npm run build       # production build
```
```

- [ ] **Step 3: Final verification**

Run:
```bash
npm test -- --run
npm run build
```
Expected: tests pass; build succeeds.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: README quick start and L3 hands-on instructions"
```

---

## Self-Review notes (for the implementer)

- **Spec coverage (this plan):** §10 phase 0 (Foundation) = Tasks 1–4; phase 1 (L3) = Tasks 5–8. §6 runnability deliverables: README Quick Start (Task 8), `.env.example` (Task 2), one-command `dev` (Task 1 scripts). §7 testing: deterministic component tests (Tasks 5–7); manual LLM smoke + L3 hands-on (Tasks 4, 7, 8). Model switch (§ D6): Task 3. Preserve-before-delete (§4.1): Task 1.
- **Deferred to later plans:** L4 (catalog + server tools + a2ui render), L5 (openGenerativeUI + optional Excalidraw MCP), L6 (shared state). Each needs source-driven verification of its CopilotKit v2 API before its plan is written.
- **Known verification gates inside tasks:** CopilotKit packages resolve to `1.60.x` with a `./v2` subpath export (Task 1.4 — verified: there is no 2.x major; `/v2` is a subpath of the 1.x package); `createCopilotEndpoint`/`BuiltInAgent` exist on `@copilotkit/runtime/v2` (Task 3.2); `<CopilotChat agent=...>` selection mechanism (Task 4.4); `useComponent` import + render contract (Task 7.5). Each says: verify against docs and record the correction rather than improvise.
```
