// src/agent-loop/agent-loop.ts
//
// ═══ CHECKPOINT 1 · The seam: pure loop vs. transport ═══════════ slide ⟨#⟩
//   THIS file = the pure agent loop: it only *yields* LoopEvents and has NO
//   server/transport dependencies. agent-loop-route.ts = the other half of the
//   seam — it forwards each yielded event to the SSE stream.
//   The model call is *injected* (`complete`), so the loop runs with no network
//   or API key — which is exactly what makes it unit-testable.
//
//   The runnable form of the core pattern (walk CHECKPOINT 2 → 5):
//     while the model keeps calling tools:
//       ask the model → decide → run each tool → feed the results back
import { findLoopTool, type LoopTool } from "./loop-tools";
import type { LoopEvent, ToolResultUi } from "./loop-events";

export const MAX_TURNS = 8;

const SYSTEM_PROMPT =
  "You are an agent demonstrating a tool-calling loop. Prefer calling a tool over guessing. " +
  "When you render UI with a tool, do not repeat its data in text. Stop when the task is done.";

// Minimal subset of the OpenAI chat-completions shapes we depend on.
export type ToolCall = { id: string; function?: { name?: string; arguments?: string } };

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
};

export type ChatCompletion = { choices?: { message?: ChatMessage }[] };

/** Injected model call: takes the running transcript, returns one completion. */
export type CompleteFn = (messages: ChatMessage[]) => Promise<ChatCompletion>;

export type AgentLoopInput = {
  prompt: string;
  apiKey: string | undefined;
  provider: string;
  hasCustomEndpoint: boolean;
  complete: CompleteFn;
  /** Resolves a tool by name; defaults to the shared registry. Injected for tests. */
  findTool?: (name: string) => LoopTool | undefined;
};

/**
 * The core model→tool→re-decide loop. Yields one LoopEvent per observable step
 * and terminates with a `done` event on every path. Bounded by MAX_TURNS.
 *
 * The five teaching checkpoints below map to the presentation slides; run
 * `grep CHECKPOINT` to list them.
 */
export async function* runAgentLoop(input: AgentLoopInput): AsyncGenerator<LoopEvent> {
  const { prompt, apiKey, provider, hasCustomEndpoint, complete, findTool = findLoopTool } = input;

  // ── Setup (pre-loop scaffolding): guard the request, then seed the transcript.
  const refusal = validate({ apiKey, provider, hasCustomEndpoint, prompt });
  if (refusal) {
    yield { type: "error", message: refusal };
    yield { type: "done" };
    return;
  }

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ];

  yield { type: "start", maxTurns: MAX_TURNS };

  try {
    // The bounded loop: at most MAX_TURNS model calls. Each pass is CP2 → CP5.
    for (let turn = 0; turn < MAX_TURNS; turn++) {
      // ═══ CHECKPOINT 2 · Ask the model ═══════════════════════════ slide ⟨#⟩
      //   `complete` sees the transcript + tools and replies. Push the reply;
      //   surface any prose as a model_step. (No message → empty assistant turn.)
      const message: ChatMessage = (await complete(messages)).choices?.[0]?.message ?? { role: "assistant" };
      messages.push(message);
      if (message.content) yield { type: "model_step", turn, text: message.content };

      // ═══ CHECKPOINT 3 · Decide: stop or keep going ══════════════ slide ⟨#⟩
      //   No tool calls → the model is done: emit final/stop and return.
      //   Otherwise there is work to do — fall through to run the tools.
      const calls = message.tool_calls ?? [];
      if (calls.length === 0) {
        yield { type: "final", turn, text: message.content ?? "", reason: "stop" };
        yield { type: "done" };
        return;
      }

      // ═══ CHECKPOINT 4 · Run each tool & stream the step live ════ slide ⟨#⟩
      //   Per call: tool_call → execute → tool_result. `yield*` delegates those
      //   events to our caller live (so each step streams), then evaluates to the
      //   generator's RETURN value — the tool message we feed back. See runToolCall.
      for (const call of calls) {
        const content = yield* runToolCall(turn, call, findTool);

        // ═══ CHECKPOINT 5 · Feed results back → loop ══════════════ slide ⟨#⟩
        //   Append each result to the transcript. The bounded for-loop then
        //   re-asks the model at CHECKPOINT 2 — closing the cycle.
        messages.push({ role: "tool", tool_call_id: call.id, content });
      }

      // Bound hit with the model still calling tools → stop and say so.
      if (turn === MAX_TURNS - 1) yield { type: "final", turn, reason: "max_turns" };
    }
    yield { type: "done" };
  } catch (e) {
    yield { type: "error", message: errorText(e) };
    yield { type: "done" };
  }
}

/** Returns a refusal message if the request can't run, otherwise null. */
function validate(opts: {
  apiKey: string | undefined;
  provider: string;
  hasCustomEndpoint: boolean;
  prompt: string;
}): string | null {
  if (!opts.apiKey) return "Set OPENAI_API_KEY in .env to run the Agent Loop demo.";
  if (opts.provider === "anthropic" && !opts.hasCustomEndpoint) {
    return (
      "The Agent Loop runs on an OpenAI-compatible model. Set LLM_MODEL=openai/* or point " +
      "LLM_API_ENDPOINT at a compatible provider."
    );
  }
  if (!opts.prompt.trim()) return "Type a prompt to start the loop.";
  return null;
}

/**
 * CHECKPOINT 4, expanded — the body of one tool call. Emit `tool_call`, then
 * `tool_result`/`tool_error`, and return the JSON string fed back to the model.
 */
async function* runToolCall(
  turn: number,
  call: ToolCall,
  findTool: (name: string) => LoopTool | undefined,
): AsyncGenerator<LoopEvent, string> {
  const name = call.function?.name ?? "";
  const args = parseArgs(call.function?.arguments);
  yield { type: "tool_call", turn, callId: call.id, name, args };

  const tool = findTool(name);
  if (!tool) {
    yield { type: "tool_error", turn, callId: call.id, name, message: "unknown tool" };
    return toolError("unknown tool");
  }

  try {
    const output = await tool.execute(args);
    yield tool.kind === "ui"
      ? { type: "tool_result", turn, callId: call.id, name, kind: "ui", ui: output as ToolResultUi }
      : { type: "tool_result", turn, callId: call.id, name, kind: "data", data: output };
    return JSON.stringify(output);
  } catch (e) {
    const message = errorText(e);
    yield { type: "tool_error", turn, callId: call.id, name, message };
    return toolError(message);
  }
}

/** The JSON envelope fed back to the model when a tool call fails. */
function toolError(message: string): string {
  return JSON.stringify({ error: message });
}

function parseArgs(raw: string | undefined): Record<string, unknown> {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

function errorText(e: unknown): string {
  const message = (e as { message?: unknown })?.message;
  return String(message ?? e);
}
