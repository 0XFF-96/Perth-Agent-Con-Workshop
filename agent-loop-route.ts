// agent-loop-route.ts — server-only. The thin HTTP/SSE adapter for the 🔁 Agent
// Loop endpoint. All loop logic lives in src/agent-loop/agent-loop.ts; this file
// only resolves config, binds the model call, and streams each yielded event.
import type { Hono } from "hono";
import type { Context } from "hono";
import { streamSSE } from "hono/streaming";
import { loopTools, buildOpenAITools } from "./src/agent-loop/loop-tools";
import { runAgentLoop } from "./src/agent-loop/agent-loop";
import type { ChatCompletion, ChatMessage, CompleteFn } from "./src/agent-loop/agent-loop";

const OPENAI_TOOLS = buildOpenAITools(loopTools);

function resolveModel() {
  const llm = process.env.LLM_MODEL ?? "openai/gpt-4.1";
  const slash = llm.indexOf("/");
  const provider = slash === -1 ? "openai" : llm.slice(0, slash);
  const model = slash === -1 ? llm : llm.slice(slash + 1);
  const endpoint = process.env.LLM_API_ENDPOINT ?? "https://api.openai.com/v1/chat/completions";
  return { provider, model, endpoint };
}

/** Bind one OpenAI-compatible chat call the loop can invoke each turn. */
function createCompleter(endpoint: string, apiKey: string | undefined, model: string): CompleteFn {
  return async (messages: ChatMessage[]) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, tools: OPENAI_TOOLS, tool_choice: "auto", temperature: 0.2 }),
    });
    if (!res.ok) throw new Error(`model ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return res.json() as Promise<ChatCompletion>;
  };
}

async function readPrompt(c: Context): Promise<string> {
  try {
    const body = (await c.req.json()) as { prompt?: unknown };
    return typeof body.prompt === "string" ? body.prompt : "";
  } catch {
    return "";
  }
}

export function registerAgentLoopRoute(app: Hono) {
  app.post("/api/agent-loop", (c) =>
    streamSSE(c, async (stream) => {
      const { provider, model, endpoint } = resolveModel();
      const apiKey = process.env.OPENAI_API_KEY;

      const events = runAgentLoop({
        prompt: await readPrompt(c),
        apiKey,
        provider,
        hasCustomEndpoint: Boolean(process.env.LLM_API_ENDPOINT),
        complete: createCompleter(endpoint, apiKey, model),
      });

      for await (const event of events) {
        await stream.writeSSE({ data: JSON.stringify(event) });
      }
    }),
  );
}
