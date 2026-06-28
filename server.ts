import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { CopilotRuntime, createCopilotHonoHandler, BuiltInAgent } from "@copilotkit/runtime/v2";
import { registerAgentLoopRoute } from "./agent-loop-route";
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
  // 🪁 EXTENSION POINT: add an agent (a new level/tab) here, and give it tools via
  // makeAgentWithTools(prompt, [tool1, tool2]).
  agents: {
    default: makeAgent("You are a helpful assistant for a product analytics demo."),
    l2: makeAgent("You are a helpful assistant. Answer concisely in text."),
    l3: makeAgent(
      "You build UI, not text. Whenever a registered UI component matches the " +
        "user's request, ALWAYS call that component tool with structured data " +
        "instead of answering in plain text. Available components include: a " +
        "single flight card, a list of flight options, a pie chart, a stock " +
        "quote card, and a weather card — call the closest match. " +
        "If the user does not give specific numbers, invent reasonable " +
        "representative sample data and render the component immediately " +
        "instead of asking them for the data. After a component renders, do " +
        "NOT repeat the same data back in text.",
    ),
    extend: makeAgent(
      [
        "You run a plan → approve → act loop. NEVER take the action immediately.",
        "When the user states a goal, FIRST call the planCard component with the goal",
        "and 2–4 concrete steps, and stop — let the user review.",
        "When the user approves (e.g. 'approve', 'yes', 'do it'), call planResult with",
        "status 'done' and a one-line summary of what you did.",
        "If the user rejects (e.g. 'reject', 'no', 'cancel'), call planResult with",
        "status 'cancelled'. Only call planResult after the user has approved or rejected.",
      ].join(" "),
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
    // NOTE: the `extend` agent uses client useComponent tools (L3 mechanism) — do NOT add it here.
    agents: ["l4"],
    defaultCatalogId: CATALOG_ID,
    schema: inlineCatalogSchema,
  },
});

// createCopilotHonoHandler returns a basePath-scoped Hono chain (basePath applied),
// so app.mount("/", copilot.fetch) does not forward routes correctly. Instead we
// create a parent Hono app, register our route first, then delegate everything
// else to the CopilotKit handler's fetch function via a catch-all.
const copilot = createCopilotHonoHandler({ runtime, basePath: "/api/copilotkit" });
const app = new Hono();
registerAgentLoopRoute(app);                              // POST /api/agent-loop
app.all("*", (c) => copilot.fetch(c.req.raw, c.env));   // everything else → CopilotKit
const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`✓ CopilotKit runtime on http://localhost:${port}/api/copilotkit  (model: ${model})`);
  console.log(`✓ Agent Loop on        http://localhost:${port}/api/agent-loop`);
});
