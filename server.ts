import "dotenv/config";
import { serve } from "@hono/node-server";
import { CopilotRuntime, createCopilotHonoHandler, BuiltInAgent } from "@copilotkit/runtime/v2";
import { getSalesData, searchFlights, displayFlights, displayDashboard } from "./src/lessons/l4-tools";
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
        "SALES / BUSINESS / METRICS / DASHBOARD requests: first call getSalesData, then call displayDashboard with that result (pass the full salesData object). NEVER use generate_a2ui for dashboards.",
        "",
        "FLIGHT requests: call searchFlights then displayFlights — NEVER use generate_a2ui for flights.",
        "",
        "After a tool renders UI, do NOT repeat the data in text.",
      ].join("\n"),
      [getSalesData, searchFlights, displayFlights, displayDashboard],
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
