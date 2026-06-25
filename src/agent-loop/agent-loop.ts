// src/agent-loop/agent-loop.ts — the pure agent loop, with NO transport or
// server dependencies. It is the runnable form of the core pattern:
//
//   while the model keeps calling tools:
//     ask the model → run each tool → feed the results back
//
// The loop is an async generator: it *yields* LoopEvents and lets the caller
// decide how to deliver them (SSE, WebSocket, a test buffer). The model call is
// injected (`complete`) so the loop runs without a network or an API key —
// which is what makes it unit-testable. See agent-loop-route.ts for the thin
// HTTP/SSE adapter that wires this to a real OpenAI-compatible endpoint.
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
 */
export async function* runAgentLoop(input: AgentLoopInput): AsyncGenerator<LoopEvent> {
  const { prompt, apiKey, provider, hasCustomEndpoint, complete, findTool = findLoopTool } = input;

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
    for (let turn = 0; turn < MAX_TURNS; turn++) {
      // No message on the completion → treat it as an empty assistant turn.
      const message: ChatMessage = (await complete(messages)).choices?.[0]?.message ?? { role: "assistant" };
      messages.push(message);
      if (message.content) yield { type: "model_step", turn, text: message.content };

      const calls = message.tool_calls ?? [];
      if (calls.length === 0) {
        yield { type: "final", turn, text: message.content ?? "", reason: "stop" };
        yield { type: "done" };
        return;
      }

      for (const call of calls) {
        // `yield* gen` forwards every LoopEvent gen yields to OUR caller — so each
        // step still streams live — then evaluates to gen's RETURN value (the
        // `string` in AsyncGenerator<LoopEvent, string>): the tool message we feed
        // back to the model.
        const content = yield* runToolCall(turn, call, findTool);
        messages.push({ role: "tool", tool_call_id: call.id, content });
      }

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
 * Run one tool call: emit its `tool_call`, then its `tool_result`/`tool_error`,
 * and return the JSON string to feed back to the model as the tool message.
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
