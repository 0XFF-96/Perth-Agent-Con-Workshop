# A2UI Workshop App — L4 Declarative Generative UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the L4 "Declarative Generative UI" lesson — the agent composes dashboards from an A2UI catalog (dynamic `generate_a2ui`) and renders a host-authored fixed-schema flight carousel (`{a2ui_operations}`) — to the existing all-Node CopilotKit v2 app, without touching L2/L3.

**Architecture:** A2UI is a *different* mechanism from L3's `useComponent` (controlled generative UI). For L4, the Node `CopilotRuntime` gets an `a2ui` config (`injectA2UITool: 'generate_a2ui'`, `agents: ['l4']` allow-list, `defaultCatalogId`, `schema`), which activates `A2UIMiddleware` *only* on a new `l4` `BuiltInAgent`. The agent composes UI from a TS catalog (definitions + renderers via `@copilotkit/a2ui-renderer`'s `createCatalog`); the provider's built-in A2UI renderer paints surfaces from activity events. A server tool returning `{a2ui_operations:[...]}` paints a host-authored fixed surface (the Node equivalent of the notebook's Python `a2ui.render()`). L3's `useComponent` flight card / pie chart and the `l2`/`l3` agents are untouched.

**Tech Stack:** Adds `@copilotkit/a2ui-renderer@^1.60.1` (promoted from transitive to explicit). Reuses Vite + React 18 + TS, `@copilotkit/runtime/v2` (`BuiltInAgent`, `defineTool`, `ToolDefinition`, `CopilotRuntime.a2ui`), `@copilotkit/react-core/v2` (`<CopilotKit a2ui={{catalog}}>`), `recharts`, `zod`, `vitest`.

**Source of truth:** `ipynb/L4.ipynb` (the catalog, renderers, sales/flight tools, and `FLIGHT_SCHEMA` are ported from its `%%writefile` cells). Architecture verified against installed compiled source — see `docs/superpowers/` research notes below.

**Verified facts (read from installed compiled source at 1.60.1, not memory):**
- `A2UIMiddleware` IS wired: `node_modules/@copilotkit/runtime/dist/v2/runtime/handlers/shared/agent-utils.mjs` reads `runtime.a2ui` and applies `agent.use(new A2UIMiddleware(...))` per request, gated by `(!targetAgents || targetAgents.includes(agentId))`. So `a2ui.agents:['l4']` activates it on `l4` only; `l2`/`l3` stay clean.
- Injected tool name `render_a2ui` is renameable via `injectA2UITool: 'generate_a2ui'` (a string).
- A domain tool returning `{a2ui_operations:[...]}` hits the middleware's `TOOL_CALL_RESULT` parse branch (`tryParseA2UIOperations` → `createA2UIActivityEvents`) for non-`generate_a2ui` tools — the fixed-schema path.
- The deprecated basic-catalog `A2UI_PROMPT` (url/tabItems/h4/h5) is NEVER injected; only `a2ui.schema` (when set) + tool guidelines are. So the server agent learns the catalog ONLY if `a2ui.schema` is set on the runtime (`injectSchemaContext` early-returns when falsy).
- `<CopilotKit a2ui={{catalog,includeSchema(default true),theme}}>` is accepted (`react-core` `CopilotKitProviderProps.a2ui`).
- `createCatalog`, `CatalogRenderers`, `extractSchema`, `RendererProps` are exported from `@copilotkit/a2ui-renderer`. `RendererProps.children` is typed `(id)=>ReactNode` but the runtime `buildChild` is really `(childId, basePath)=>ReactNode` — the notebook's `(children as any)(id, basePath)` two-arg call is correct.
- Custom `catalogId` `copilotkit://app-dashboard-catalog` round-trips IFF `createCatalog`'s `catalogId` === `a2ui.defaultCatalogId` === the client-registered catalog id.
- `maxSteps:5` is sufficient for the 2-tool-round flows; `toolChoice` defaults to `'auto'` (allows reaching the render tool).

---

## File Structure

New files:
- `src/catalog/catalog-id.ts` — `CATALOG_ID`, `SALES_SURFACE_ID`, `FLIGHT_SURFACE_ID` constants (client/server invariant).
- `src/catalog/definitions.ts` — the 17-component A2UI catalog (Zod props + descriptions), ported verbatim from `ipynb/L4.ipynb`. Exports `demonstrationCatalogDefinitions` + `DemonstrationCatalogDefinitions` type.
- `src/catalog/schema.ts` — the `A2UIInlineCatalogSchema` object (`{catalogId, components}`) for `runtime.a2ui.schema`.
- `src/catalog/renderers.tsx` — `CatalogRenderers<DemonstrationCatalogDefinitions>` + `export const demonstrationCatalog = createCatalog(...)`. Ported from the notebook.
- `src/lessons/l4-tools.ts` — `getSalesData`, `searchFlights`, `displayFlights` (`defineTool`), `FLIGHT_OPERATIONS`, static data.
- `src/lessons/L4Declarative.tsx` — the L4 tab: copy + `ExamplePrompts` + `<CopilotChat agentId="l4" />` (NO `useComponent`).

Modified files:
- `package.json` — add `@copilotkit/a2ui-renderer@^1.60.1`.
- `server.ts` — add the `l4` agent (with tools) + `CopilotRuntime` `a2ui` config.
- `src/main.tsx` — add `a2ui={{ catalog: demonstrationCatalog }}` to `<CopilotKit>`.
- `src/App.tsx` — add the `l4` tab.
- `README.md` — L4 section.

Test files: `*.test.ts(x)` alongside catalog + tools.

---

## Task 1: Add the a2ui-renderer dependency and catalog id constants

**Files:**
- Modify: `package.json`
- Create: `src/catalog/catalog-id.ts`
- Test: `src/catalog/catalog-id.test.ts`

- [ ] **Step 1: Promote `@copilotkit/a2ui-renderer` to an explicit dependency**

Run:
```bash
npm install @copilotkit/a2ui-renderer@^1.60.1
```
Then verify it resolves to 1.60.x and exports the needed symbols:
```bash
npm ls @copilotkit/a2ui-renderer
node -e "const m=require('@copilotkit/a2ui-renderer'); console.log(['createCatalog','extractSchema','CatalogRenderers'].map(k=>k+':'+(k in m)))"
```
Expected: `@copilotkit/a2ui-renderer@1.60.1`; `createCatalog` and `extractSchema` present (they are runtime values; `CatalogRenderers` is a type and may be `false` at runtime — that's fine, confirm via the `.d.ts`: `grep -rE "createCatalog|extractSchema|CatalogRenderers|RendererProps" node_modules/@copilotkit/a2ui-renderer/dist/*.d.* | head`).

- [ ] **Step 2: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { CATALOG_ID, SALES_SURFACE_ID, FLIGHT_SURFACE_ID } from "./catalog-id";

describe("catalog-id", () => {
  it("pins the client/server catalog + surface invariants", () => {
    expect(CATALOG_ID).toBe("copilotkit://app-dashboard-catalog");
    expect(SALES_SURFACE_ID).toBe("sales-dashboard");
    expect(FLIGHT_SURFACE_ID).toBe("flight-search-results");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- --run src/catalog/catalog-id.test.ts`
Expected: FAIL — cannot resolve `./catalog-id`.

- [ ] **Step 4: Write `src/catalog/catalog-id.ts`**

```ts
// Single source of truth for the A2UI catalog + surface ids.
// VERIFIED-CRITICAL: createCatalog's catalogId, the runtime's a2ui.defaultCatalogId,
// and the client-registered catalog must all use CATALOG_ID, or surfaces fail to
// match and the client throws "Catalog not found".
export const CATALOG_ID = "copilotkit://app-dashboard-catalog";
export const SALES_SURFACE_ID = "sales-dashboard";
export const FLIGHT_SURFACE_ID = "flight-search-results";
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- --run src/catalog/catalog-id.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/catalog/catalog-id.ts src/catalog/catalog-id.test.ts
git commit -m "feat(L4): add a2ui-renderer dep and catalog id constants"
```

---

## Task 2: Port the A2UI catalog definitions (17 components)

**Files:**
- Create: `src/catalog/definitions.ts`
- Test: `src/catalog/definitions.test.ts`

Port the catalog **verbatim** from the `%%writefile frontend/src/catalog/definitions.ts` cell in `ipynb/L4.ipynb`. The 17 components are: `Title, Text, Icon, Image, Divider, Card, List, Tabs, Row, Column, DashboardCard, Metric, PieChart, BarChart, Badge, DataTable, Button`. Keep the notebook's prop conventions verbatim (no renaming — the basic-catalog vocabulary is NOT injected, so there is no contamination risk): `Image` uses `src` (`z.union([z.string(), z.object({ path: z.string() })])`), `Tabs` uses `tabs: z.array(z.object({ label, child }))`, `Text` uses `variant: z.enum(["h1","h2","h3","body","caption"])`. Container children use the notebook's `z.union([z.array(z.string()), z.object({ componentId, path })])` data-binding shape. Each definition is `{ description?: string, props: ZodObject }`.

- [ ] **Step 1: Open `ipynb/L4.ipynb`, locate the `definitions.ts` `%%writefile` cell, and copy its full content into `src/catalog/definitions.ts`.** Adjust only the import paths if needed (the notebook imports `z` from `zod` — keep). Ensure it exports `demonstrationCatalogDefinitions` and `export type DemonstrationCatalogDefinitions = typeof demonstrationCatalogDefinitions`.

- [ ] **Step 2: Write the test (it will fail until Step 1's file exists)**

```ts
import { describe, it, expect } from "vitest";
import { extractSchema } from "@copilotkit/a2ui-renderer";
import { demonstrationCatalogDefinitions } from "./definitions";

const EXPECTED = [
  "Title","Text","Icon","Image","Divider","Card","List","Tabs","Row","Column",
  "DashboardCard","Metric","PieChart","BarChart","Badge","DataTable","Button",
];

describe("catalog definitions", () => {
  it("defines all 17 components with extractable schema", () => {
    const schema = extractSchema(demonstrationCatalogDefinitions);
    const names = schema.map((c: { name: string }) => c.name).sort();
    expect(names).toEqual([...EXPECTED].sort());
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npm test -- --run src/catalog/definitions.test.ts`
Expected: PASS. If `extractSchema`'s output shape differs (e.g. not `{name}`), inspect `node_modules/@copilotkit/a2ui-renderer/dist/react-renderer/create-catalog.d.mts` (`extractSchema` returns `Array<{name, description?, props?}>`) and adjust the test's accessor. If a component name is missing, the notebook port is incomplete — fix `definitions.ts`.

- [ ] **Step 4: Typecheck + commit**

```bash
npm run typecheck
git add src/catalog/definitions.ts src/catalog/definitions.test.ts
git commit -m "feat(L4): port 17-component A2UI catalog definitions from notebook"
```

---

## Task 3: Port the catalog renderers and assemble the catalog

**Files:**
- Create: `src/catalog/renderers.tsx`
- Test: `src/catalog/renderers.test.tsx`

Port the `%%writefile frontend/src/catalog/renderers.tsx` cell from `ipynb/L4.ipynb`. It declares `const demonstrationCatalogRenderers: CatalogRenderers<DemonstrationCatalogDefinitions> = { ... }` (one renderer per component, each receiving `{ props, children, dispatch }`), a `resolveText(value)` helper (unwraps `{path}` bindings), uses `recharts` for `PieChart`/`BarChart`, and ends with the assembled catalog.

- [ ] **Step 1: Copy the notebook's `renderers.tsx` content into `src/catalog/renderers.tsx`.** Fix imports to this repo:
  - `import { createCatalog, type CatalogRenderers } from "@copilotkit/a2ui-renderer";`
  - `import { type DemonstrationCatalogDefinitions, demonstrationCatalogDefinitions } from "./definitions";`
  - `import { CATALOG_ID } from "./catalog-id";`
  - recharts imports as in `src/components/pie-chart.tsx`.
  Keep the data-bound container renderers' two-arg child calls `(children as any)(item.id, item.basePath)` — VERIFIED correct (runtime `buildChild` is `(childId, basePath)=>ReactNode`; the `.d.ts` under-declares it). End with:
  ```tsx
  export const demonstrationCatalog = createCatalog(
    demonstrationCatalogDefinitions,
    demonstrationCatalogRenderers,
    { catalogId: CATALOG_ID, includeBasicCatalog: false },
  );
  ```

- [ ] **Step 2: Write the test (fails until the file exists)**

```tsx
import { describe, it, expect } from "vitest";
import { CATALOG_ID } from "./catalog-id";
import { demonstrationCatalog } from "./renderers";

describe("demonstrationCatalog", () => {
  it("is assembled under the shared CATALOG_ID", () => {
    // createCatalog returns a Catalog whose id is the catalogId option (types.js sets this.id).
    expect((demonstrationCatalog as { id: string }).id).toBe(CATALOG_ID);
  });
});
```

- [ ] **Step 3: Run + adjust**

Run: `npm test -- --run src/catalog/renderers.test.tsx`
Expected: PASS. If the assembled object exposes the id under a different property than `.id`, inspect `node_modules/@copilotkit/a2ui-renderer/dist/.../create-catalog.*` / `types.*` and adjust the accessor. If `ResponsiveContainer` (recharts) warns in jsdom, ignore (the `ResizeObserver` stub in `src/setupTests.ts` already handles it).

- [ ] **Step 4: Typecheck + commit**

```bash
npm run typecheck
git add src/catalog/renderers.tsx src/catalog/renderers.test.tsx
git commit -m "feat(L4): port catalog renderers and assemble demonstrationCatalog"
```

---

## Task 4: Build the inline catalog schema (object form)

**Files:**
- Create: `src/catalog/schema.ts`
- Test: `src/catalog/schema.test.ts`

`runtime.a2ui.schema` must be set so the **server** agent learns the custom catalog (`injectSchemaContext` early-returns when falsy). Use the object form `A2UIInlineCatalogSchema = { catalogId: string, components: Record<string, Record<string, unknown>> }` so semantic validation (`unknown_component`, `missing_required_prop`) is active (the `extractSchema` array form only gives structural validation).

- [ ] **Step 1: Decide the build path (resolved fork — object form).** Convert the Zod definitions to the object-form components map. Prefer reusing `extractSchema(demonstrationCatalogDefinitions)` and reshaping its array into `{ [name]: propsJsonSchema }`; if `extractSchema`'s entries don't carry JSON-Schema props, add `zod-to-json-schema` (`npm i -D zod-to-json-schema`) and derive props from `demonstrationCatalogDefinitions[name].props`. Inspect `extractSchema` output first: `node -e "..."` to see whether `.props` is already JSON-Schema-shaped.

- [ ] **Step 2: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { CATALOG_ID } from "./catalog-id";
import { inlineCatalogSchema } from "./schema";

describe("inlineCatalogSchema", () => {
  it("is the object form keyed by CATALOG_ID with all 17 components", () => {
    expect(inlineCatalogSchema.catalogId).toBe(CATALOG_ID);
    expect(Object.keys(inlineCatalogSchema.components)).toHaveLength(17);
    expect(inlineCatalogSchema.components.DashboardCard).toBeDefined();
  });
});
```

- [ ] **Step 3: Run (fail), implement `src/catalog/schema.ts`, run (pass).**

The shape:
```ts
import { CATALOG_ID } from "./catalog-id";
import { demonstrationCatalogDefinitions } from "./definitions";
// ...derive components map from the definitions (see Step 1)...
export const inlineCatalogSchema = {
  catalogId: CATALOG_ID,
  components: /* { [name]: <props json-schema> } for all 17 */,
};
```
Run: `npm test -- --run src/catalog/schema.test.ts` → PASS.

- [ ] **Step 4: Typecheck + commit**

```bash
npm run typecheck
git add package.json package-lock.json src/catalog/schema.ts src/catalog/schema.test.ts
git commit -m "feat(L4): inline A2UI catalog schema for server-side middleware"
```

---

## Task 5: L4 server tools — getSalesData and searchFlights

**Files:**
- Create: `src/lessons/l4-tools.ts`
- Test: `src/lessons/l4-tools.test.ts`

`defineTool` / `ToolDefinition` come from `@copilotkit/runtime/v2` (the agent subpath; confirm exact import: `grep -rE "defineTool|ToolDefinition" node_modules/@copilotkit/runtime/dist/agent/index.d.*`). A `ToolDefinition` is `{ name, description, parameters (zod), execute: (args) => Promise<unknown> }`.

Static data is ported from `ipynb/L4.ipynb`'s `get_sales_data` (totalRevenue, newCustomers, conversionRate, revenueByCategory[], monthlySales[]) and `search_flights` (4 flights: Delta/United/JetBlue/American with the `Flight` fields `id, airline, airlineLogo, flightNumber, origin, destination, date, departureTime, arrivalTime, duration, status, price`).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { getSalesData, searchFlights } from "./l4-tools";

describe("l4 tools", () => {
  it("getSalesData returns the static metrics", async () => {
    const data = (await getSalesData.execute({})) as { totalRevenue: unknown; revenueByCategory: unknown[] };
    expect(data.totalRevenue).toBeDefined();
    expect(Array.isArray(data.revenueByCategory)).toBe(true);
  });

  it("searchFlights returns 4 flights echoing the route", async () => {
    const flights = (await searchFlights.execute({ origin: "SFO", destination: "JFK" })) as Array<{ origin: string; destination: string }>;
    expect(flights).toHaveLength(4);
    expect(flights[0].origin).toBe("SFO");
    expect(flights[0].destination).toBe("JFK");
  });
});
```

- [ ] **Step 2: Run (fail). Implement `src/lessons/l4-tools.ts`** with `getSalesData` and `searchFlights` as `defineTool({...})`, porting the static data from the notebook. (Leave `displayFlights` + `FLIGHT_OPERATIONS` for Task 7.) Export both tools.

- [ ] **Step 3: Run (pass) + typecheck + commit**

```bash
npm test -- --run src/lessons/l4-tools.test.ts && npm run typecheck
git add src/lessons/l4-tools.ts src/lessons/l4-tools.test.ts
git commit -m "feat(L4): getSalesData and searchFlights server tools"
```

---

## Task 6: Lock the exact v0.9 `a2ui_operations` envelope

**Files:**
- Create: `src/lessons/a2ui-operations.md` (a short note recording the confirmed shape) — OR inline the finding as a comment in `l4-tools.ts`.

This is a **research/verification task** (residual unknown): the notebook's operations came from Python helpers (`a2ui.create_surface` / `update_components` / `update_data_model`); the Node middleware's `tryParseA2UIOperations` / `createA2UIActivityEvents` may expect a specific envelope (key placement of `version`, `surfaceId` vs `surface_id` casing, op key names like `createSurface` vs `create_surface`).

- [ ] **Step 1: Read the compiled middleware to determine the exact accepted op shape.**

```bash
node -e "const fs=require('fs');const p=require.resolve('@ag-ui/a2ui-middleware');console.log(p)"
grep -RnoE "tryParseA2UIOperations|createA2UIActivityEvents|createSurface|create_surface|updateComponents|update_components|updateDataModel|surfaceId|surface_id|a2ui_operations" node_modules/@ag-ui/a2ui-middleware/dist/index.mjs | head -40
```
Read the relevant functions. Record the confirmed envelope (e.g. `{ version:"v0.9", createSurface:{ surfaceId, catalogId } }` vs snake_case) as a comment block in `l4-tools.ts` and proceed to Task 7 using the confirmed shape. If the parser accepts multiple shapes, prefer the one the notebook used.

- [ ] **Step 2: Commit the note (if a standalone file).**

```bash
git add -A && git commit -m "docs(L4): lock the verified a2ui_operations op envelope"
```

---

## Task 7: displayFlights tool (host-authored fixed schema)

**Files:**
- Modify: `src/lessons/l4-tools.ts`
- Modify: `src/lessons/l4-tools.test.ts`

`FLIGHT_OPERATIONS` = the notebook `FLIGHT_SCHEMA` verbatim (a flat list of component dicts: `{id:'root', component:'List', children:{componentId:'flight-card', path:'/flights'}}`, plus `flight-card` Card/Column/Row with `Image src:{path:'airlineLogo'}`, `Text text:{path}`, `Divider`, `Badge`, `Button`). Use the Task 6 envelope.

- [ ] **Step 1: Add the failing test**

```ts
import { displayFlights, FLIGHT_OPERATIONS } from "./l4-tools";

it("displayFlights returns an a2ui_operations envelope painting the flight surface", async () => {
  const flights = [{ id: "f1", airline: "Delta", origin: "SFO", destination: "JFK" }];
  const raw = (await displayFlights.execute({ flights })) as string;
  const parsed = JSON.parse(raw);
  expect(Array.isArray(parsed.a2ui_operations)).toBe(true);
  // root component id is 'root' per the notebook FLIGHT_SCHEMA
  expect(JSON.stringify(FLIGHT_OPERATIONS)).toContain('"root"');
});
```

- [ ] **Step 2: Run (fail). Implement `displayFlights` + `FLIGHT_OPERATIONS`** in `l4-tools.ts`:
```ts
// RELATIVE import (not @/): l4-tools.ts is loaded by server.ts via tsx, which
// does not reliably resolve the @/ alias. All catalog/tools files imported
// server-side must use relative paths among themselves.
import { CATALOG_ID, FLIGHT_SURFACE_ID } from "../catalog/catalog-id";
export const FLIGHT_OPERATIONS = [ /* notebook FLIGHT_SCHEMA verbatim */ ];
export const displayFlights = defineTool({
  name: "displayFlights",
  description: "Render the flight search results as a fixed UI surface.",
  parameters: z.object({ flights: z.array(z.any()) }),
  execute: async ({ flights }) =>
    JSON.stringify({
      a2ui_operations: [
        /* { version, createSurface:{ surfaceId: FLIGHT_SURFACE_ID, catalogId: CATALOG_ID } }, */
        /* { version, updateComponents:{ surfaceId, components: FLIGHT_OPERATIONS } }, */
        /* { version, updateDataModel:{ surfaceId, path:"/", value:{ flights } } }, */
        /* — use the exact shape locked in Task 6 — */
      ],
    }),
});
```

- [ ] **Step 3: Run (pass) + typecheck + commit**

```bash
npm test -- --run src/lessons/l4-tools.test.ts && npm run typecheck
git add src/lessons/l4-tools.ts src/lessons/l4-tools.test.ts
git commit -m "feat(L4): displayFlights host-authored fixed-schema a2ui surface"
```

---

## Task 8: Wire the l4 agent and runtime a2ui config in server.ts

**Files:**
- Modify: `server.ts`

- [ ] **Step 1: Add a tools-accepting agent factory + the `l4` agent + the runtime a2ui config.**

In `server.ts`, add an `l4` agent built with tools, and the runtime `a2ui` config. Keep `default`/`l2`/`l3` exactly as-is.

```ts
import { getSalesData, searchFlights, displayFlights } from "./src/lessons/l4-tools";
import { inlineCatalogSchema } from "./src/catalog/schema";
import { CATALOG_ID } from "./src/catalog/catalog-id";

function makeAgentWithTools(prompt: string, tools: unknown[]) {
  return new BuiltInAgent({ model, apiKey, maxSteps: 5, prompt, tools, overridableProperties: ["model", "temperature", "prompt"] });
}
```
Add to the `agents` map:
```ts
    l4: makeAgentWithTools(
      "You build UI, not text. For sales/metrics/dashboard requests: call getSalesData, " +
        "then call generate_a2ui to compose a dashboard from the catalog. For flight requests: " +
        "call searchFlights then displayFlights — NEVER use generate_a2ui for flights. " +
        "After a tool renders UI, do NOT repeat the data in text.",
      [getSalesData, searchFlights, displayFlights],
    ),
```
Add the `a2ui` option to the `new CopilotRuntime({...})`:
```ts
  a2ui: {
    injectA2UITool: "generate_a2ui",
    agents: ["l4"],
    defaultCatalogId: CATALOG_ID,
    schema: inlineCatalogSchema,
  },
```

> Verify the exact `tools` option name on `BuiltInAgent` and the `a2ui` field names against `node_modules/@copilotkit/runtime/dist/agent/index.d.*` and `.../v2/runtime/core/runtime.d.mts` if typecheck complains; correct and record here.

- [ ] **Step 2: Typecheck + boot guard**

Run:
```bash
npm run typecheck
# boot with a dummy key to confirm it starts and the a2ui config is accepted (no real model call at boot)
OPENAI_API_KEY=sk-dummy LLM_MODEL=openai/gpt-4.1 npx tsx server.ts
```
Expected: typecheck passes; the runtime prints the startup line. Stop it (Ctrl-C).

- [ ] **Step 3: Commit**

```bash
git add server.ts
git commit -m "feat(L4): wire l4 agent with tools and runtime a2ui config (agents allow-list)"
```

---

## Task 9: Wire the client — catalog prop, L4 tab, lesson component

**Files:**
- Modify: `src/main.tsx`
- Create: `src/lessons/L4Declarative.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add the a2ui catalog to the provider in `src/main.tsx`.**

```tsx
import { demonstrationCatalog } from "@/catalog/renderers";
// ...
<CopilotKit useSingleEndpoint={false} runtimeUrl="/api/copilotkit" a2ui={{ catalog: demonstrationCatalog }}>
```

- [ ] **Step 2: Create `src/lessons/L4Declarative.tsx`** (mirror `L3Components.tsx`, but NO `useComponent` — A2UI surfaces paint via the provider):

```tsx
import { CopilotChat } from "@copilotkit/react-core/v2";
import { ExamplePrompts } from "@/components/example-prompts";

export default function L4Declarative() {
  return (
    <section className="lesson">
      <div className="lesson-copy">
        <h2>L4 · Declarative Generative UI (A2UI)</h2>
        <p>The agent composes a UI from a catalog of primitives. Dashboards are generated; the flight carousel is a host-authored fixed layout.</p>
      </div>
      <ExamplePrompts
        prompts={[
          "Show me a sales dashboard with total revenue, new customers, and conversion rate metrics",
          "Find flights from SFO to JFK",
        ]}
      />
      <div className="chat-region">
        <CopilotChat agentId="l4" />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Register the L4 tab in `src/App.tsx`** — add the import and the tabs entry:

```tsx
import L4Declarative from "@/lessons/L4Declarative";
// in tabs array, after the l3 entry:
  { id: "l4", label: "L4 Declarative", render: () => <L4Declarative /> },
```

- [ ] **Step 4: Add a render test for the tab**

In `src/App.test.tsx` (or a new test), assert the "L4 Declarative" tab renders. Mirror the existing app/tab test pattern. Run `npm test -- --run` and `npm run typecheck` → all green.

- [ ] **Step 5: Commit**

```bash
git add src/main.tsx src/lessons/L4Declarative.tsx src/App.tsx src/App.test.tsx
git commit -m "feat(L4): client catalog prop, L4 tab, and declarative lesson component"
```

---

## Task 10: Live end-to-end verification (real model)

**Files:** none (verification + possible fallback edit)

Unit tests + typecheck + build verify structure but NOT the live A2UI rendering (residual unknowns: exact op envelope, render_a2ui prop drift, client renderer auto-registration). This task is the real proof. **Needs a real API key in `.env`.**

- [ ] **Step 1: Build + run**

```bash
npm run build   # must succeed
npm run dev     # both processes; reload once if the first-load runtime-info race shows
```

- [ ] **Step 2: Sales dashboard (dynamic `generate_a2ui`)** — open the L4 tab, send "Show me a sales dashboard with total revenue, new customers, and conversion rate metrics". Expected: a composed dashboard surface paints (cards/metrics/chart) — NOT a plain-text dump. If the model dumps text instead, strengthen the system prompt's "do NOT repeat data in text" and "always call generate_a2ui".

- [ ] **Step 3: Flight carousel (fixed schema)** — send "Find flights from SFO to JFK". Expected: `searchFlights` → `displayFlights` → a fixed flight-card list paints from `{a2ui_operations}`. **If nothing paints**, the op envelope (Task 6) is wrong — re-read `createA2UIActivityEvents` and correct `FLIGHT_OPERATIONS`/envelope, OR switch to the **fallback (fork b)**: have the `l4` agent emit `FLIGHT_OPERATIONS` via `generate_a2ui` (reuses the verified dynamic path); update the system prompt accordingly. Re-verify.

- [ ] **Step 4: Confirm L2/L3 still work** — switch to L2 (text reply) and L3 (flight card + pie chart still render via `useComponent`), confirming the `a2ui.agents:['l4']` allow-list kept them clean.

- [ ] **Step 5: Record the verified behavior** (which fork shipped for flights) in the README/plan.

---

## Task 11: Final verification + README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Full verification**

```bash
npm test -- --run    # all tests (L2/L3/L4) pass, no API key needed
npm run typecheck
npm run build
```

- [ ] **Step 2: README L4 section** — add L4 to "What runs today": the agent composes a sales dashboard from the A2UI catalog (declarative GenUI), and renders a host-authored fixed flight carousel; note the L3 (controlled `useComponent`) vs L4 (declarative A2UI catalog) teaching contrast.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(L4): README section and L3-vs-L4 teaching contrast"
```

---

## Self-Review notes (for the implementer)

- **Spec coverage:** Resolves spec `2026-06-16-...-design.md` §5 (L4 row) and §8 R2 (the Node A2UI render equivalent — CONFIRMED via `{a2ui_operations}` tool results). The dynamic dashboard + fixed flight carousel both ship.
- **Resolved design forks (from research):** flights = host-authored fixed schema (fork a; fork b is the live fallback in Task 10); injected tool renamed to `generate_a2ui`; `a2ui.schema` = object form for semantic validation; catalog prop names kept verbatim (no contamination); new `l4` tab; single-runtime/single-port retained.
- **Verification gates inside tasks:** a2ui-renderer exports resolve (1.4); `extractSchema` output shape (2.3); assembled catalog id accessor (3.3); `defineTool`/`ToolDefinition` import path (5); the exact `a2ui_operations` envelope (Task 6 — gates Task 7); `BuiltInAgent.tools` + `CopilotRuntime.a2ui` field names (8.1); live rendering of both surfaces (Task 10, with the fork-b fallback).
- **Isolation:** L4 is additive — `agents:['l4']` keeps L2/L3 untouched; the only shared-file edits are `server.ts` (add agent + a2ui), `main.tsx` (add prop), `App.tsx` (add tab), `package.json`, `README.md`.
- **Biggest risk:** the fixed-schema op envelope (Task 6/7). Mitigated by reading compiled source first and the Task 10 fork-b fallback (model-authored via `generate_a2ui`), which the research verified as guaranteed-once-dashboards-work.
