import { serve } from "@hono/node-server";
import { CopilotRuntime, createCopilotEndpoint } from "@copilotkit/runtime/v2";
import { BuiltInAgent } from "@copilotkit/runtime/v2";

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

const app = createCopilotEndpoint({ runtime, basePath: "/api/copilotkit" });
const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`✓ CopilotKit runtime on http://localhost:${port}/api/copilotkit  (model: ${model})`);
});
