import "dotenv/config";
import { serve } from "@hono/node-server";
import { CopilotRuntime, createCopilotHonoHandler, BuiltInAgent } from "@copilotkit/runtime/v2";
import { getSalesData, searchFlights, displayFlights } from "./src/lessons/l4-tools";
import { inlineCatalogSchema } from "./src/catalog/schema";
import { CATALOG_ID } from "./src/catalog/catalog-id";

// BuiltInAgentModel format is "provider/model" (e.g. "openai/gpt-4.1", "anthropic/claude-sonnet-4")
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

function makeAgent(prompt: string) {
  return new BuiltInAgent({
    model,
    apiKey,
    maxSteps: 5,
    prompt,
    overridableProperties: ["model", "temperature", "prompt"],
  });
}

function makeAgentWithTools(prompt: string, tools: unknown[]) {
  return new BuiltInAgent({
    model,
    apiKey,
    maxSteps: 5,
    prompt,
    tools,
    overridableProperties: ["model", "temperature", "prompt"],
  } as ConstructorParameters<typeof BuiltInAgent>[0]);
}

const runtime = new CopilotRuntime({
  agents: {
    default: makeAgent("You are a helpful assistant for a product analytics demo."),
    l2: makeAgent("You are a helpful assistant. Answer concisely in text."),
    l3: makeAgent(
      "You are a helpful assistant. When the user asks to see a flight or a " +
        "chart, call the matching UI component tool with structured data. " +
        "If they ask for a chart or visualization without giving specific " +
        "numbers, invent reasonable representative sample data and render it " +
        "immediately instead of asking them for the data.",
    ),
    l4: makeAgentWithTools(
      [
        "You build UI, not text.",
        "",
        "SALES / BUSINESS / METRICS / DASHBOARD requests: first call getSalesData, then call generate_a2ui to visualize the results as a dashboard using the real numbers.",
        "",
        "generate_a2ui takes { surfaceId, components, data }. Each item in `components` is a FLAT object: { id, component, ...that component's own props, children:[childIds] for containers (Row/Column), child:childId for single-child wrappers (Card/DashboardCard) }. The FIRST component is the root; containers reference children by id. NEVER emit empty {} components — every one MUST have id, component, and its props.",
        "",
        "Example dashboard (copy this structure, substitute the real getSalesData numbers):",
        '{ "surfaceId": "sales-dashboard", "components": [',
        '  { "id": "root", "component": "Column", "gap": 16, "children": ["heading","metrics"] },',
        '  { "id": "heading", "component": "Text", "text": "Q2 Sales", "variant": "h2" },',
        '  { "id": "metrics", "component": "Row", "gap": 16, "children": ["c1","c2","c3"] },',
        '  { "id": "c1", "component": "DashboardCard", "title": "Total Revenue", "child": "m1" },',
        '  { "id": "m1", "component": "Metric", "label": "Revenue", "value": "$1.2M", "trend": "up", "trendValue": "+12%" },',
        '  { "id": "c2", "component": "DashboardCard", "title": "New Customers", "child": "m2" },',
        '  { "id": "m2", "component": "Metric", "label": "Customers", "value": "320", "trend": "up", "trendValue": "+8%" },',
        '  { "id": "c3", "component": "DashboardCard", "title": "Conversion", "child": "m3" },',
        '  { "id": "m3", "component": "Metric", "label": "Conversion Rate", "value": "3.2%", "trend": "down", "trendValue": "-0.4%" }',
        '], "data": {} }',
        "",
        "Keep dashboards CONCISE: a heading + ONE Row of 3-4 DashboardCard/Metric pairs — about 8-12 components total. Do NOT add tables, extra rows, or repeated sections. Emit each component exactly once, then STOP and call the tool.",
        "",
        "FLIGHT requests: call searchFlights then displayFlights — NEVER use generate_a2ui for flights.",
        "After a tool renders UI, do NOT repeat the data in text.",
      ].join("\n"),
      [getSalesData, searchFlights, displayFlights],
    ),
  },
  a2ui: {
    injectA2UITool: "generate_a2ui",
    agents: ["l4"],
    defaultCatalogId: CATALOG_ID,
    schema: inlineCatalogSchema,
  },
});

const app = createCopilotHonoHandler({ runtime, basePath: "/api/copilotkit" });
const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`✓ CopilotKit runtime on http://localhost:${port}/api/copilotkit  (model: ${model})`);
});
