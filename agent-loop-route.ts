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
