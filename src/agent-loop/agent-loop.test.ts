import { describe, it, expect } from "vitest";
import { runAgentLoop, MAX_TURNS } from "./agent-loop";
import type { ChatCompletion, ChatMessage, CompleteFn, ToolCall } from "./agent-loop";
import type { LoopEvent } from "./loop-events";
import type { LoopTool } from "./loop-tools";

async function collect(gen: AsyncGenerator<LoopEvent>): Promise<LoopEvent[]> {
  const out: LoopEvent[] = [];
  for await (const e of gen) out.push(e);
  return out;
}

/** Returns scripted completions in order, recording the transcript each call saw. */
function scripted(steps: ChatCompletion[]): { complete: CompleteFn; seen: ChatMessage[][] } {
  const seen: ChatMessage[][] = [];
  let i = 0;
  const complete: CompleteFn = async (messages) => {
    seen.push(structuredClone(messages));
    return steps[Math.min(i++, steps.length - 1)];
  };
  return { complete, seen };
}

const ok = { apiKey: "k", provider: "openai", hasCustomEndpoint: false };
const assistant = (fields: { content?: string | null; tool_calls?: ToolCall[] }): ChatCompletion => ({
  choices: [{ message: { role: "assistant", ...fields } }],
});

describe("runAgentLoop — validation (no start, no model call)", () => {
  it("refuses with no API key", async () => {
    const { complete, seen } = scripted([]);
    const events = await collect(runAgentLoop({ ...ok, apiKey: undefined, prompt: "hi", complete }));
    expect(events).toEqual([
      { type: "error", message: "Set OPENAI_API_KEY in .env to run the Agent Loop demo." },
      { type: "done" },
    ]);
    expect(seen).toHaveLength(0);
  });

  it("refuses Anthropic without a custom endpoint", async () => {
    const { complete } = scripted([]);
    const events = await collect(runAgentLoop({ ...ok, provider: "anthropic", prompt: "hi", complete }));
    expect(events[0]).toMatchObject({ type: "error" });
    expect((events[0] as { message: string }).message).toContain("OpenAI-compatible");
    expect(events[1]).toEqual({ type: "done" });
  });

  it("allows Anthropic when a custom endpoint is set", async () => {
    const { complete } = scripted([assistant({ content: "hi" })]);
    const events = await collect(
      runAgentLoop({ ...ok, provider: "anthropic", hasCustomEndpoint: true, prompt: "hi", complete }),
    );
    expect(events[0]).toEqual({ type: "start", maxTurns: MAX_TURNS });
  });

  it("refuses a blank prompt", async () => {
    const { complete } = scripted([]);
    const events = await collect(runAgentLoop({ ...ok, prompt: "   ", complete }));
    expect(events).toEqual([
      { type: "error", message: "Type a prompt to start the loop." },
      { type: "done" },
    ]);
  });
});

describe("runAgentLoop — happy paths", () => {
  it("stops immediately when the model returns text and no tools", async () => {
    const { complete } = scripted([assistant({ content: "all done" })]);
    const events = await collect(runAgentLoop({ ...ok, prompt: "hi", complete }));
    expect(events).toEqual([
      { type: "start", maxTurns: MAX_TURNS },
      { type: "model_step", turn: 0, text: "all done" },
      { type: "final", turn: 0, text: "all done", reason: "stop" },
      { type: "done" },
    ]);
  });

  it("runs a data tool, feeds the result back, then stops", async () => {
    const { complete, seen } = scripted([
      assistant({
        tool_calls: [
          { id: "c1", function: { name: "calculate", arguments: '{"a":2,"b":3,"op":"+"}' } },
        ],
      }),
      assistant({ content: "5" }),
    ]);
    const events = await collect(runAgentLoop({ ...ok, prompt: "add", complete }));

    expect(events).toEqual([
      { type: "start", maxTurns: MAX_TURNS },
      { type: "tool_call", turn: 0, callId: "c1", name: "calculate", args: { a: 2, b: 3, op: "+" } },
      {
        type: "tool_result",
        turn: 0,
        callId: "c1",
        name: "calculate",
        kind: "data",
        data: { a: 2, b: 3, op: "+", result: 5 },
      },
      { type: "model_step", turn: 1, text: "5" },
      { type: "final", turn: 1, text: "5", reason: "stop" },
      { type: "done" },
    ]);

    // The second model call must have seen the tool result fed back.
    const toolMsg = seen[1].find((m) => m.role === "tool");
    expect(toolMsg).toEqual({
      role: "tool",
      tool_call_id: "c1",
      content: JSON.stringify({ a: 2, b: 3, op: "+", result: 5 }),
    });
  });

  it("emits a UI tool_result for a kind:'ui' tool", async () => {
    const { complete } = scripted([
      assistant({
        tool_calls: [
          {
            id: "c1",
            function: { name: "make_pie_chart", arguments: '{"title":"Rev","slices":[]}' },
          },
        ],
      }),
      assistant({ content: "rendered" }),
    ]);
    const events = await collect(runAgentLoop({ ...ok, prompt: "chart", complete }));
    expect(events).toContainEqual({
      type: "tool_result",
      turn: 0,
      callId: "c1",
      name: "make_pie_chart",
      kind: "ui",
      ui: { component: "pieChart", props: { title: "Rev", slices: [] } },
    });
  });

  it("does not emit model_step when the model returns no text", async () => {
    const { complete } = scripted([
      assistant({ tool_calls: [{ id: "c1", function: { name: "get_sales_data", arguments: "{}" } }] }),
      assistant({ content: "" }),
    ]);
    const events = await collect(runAgentLoop({ ...ok, prompt: "data", complete }));
    expect(events.some((e) => e.type === "model_step")).toBe(false);
  });
});

describe("runAgentLoop — error & bound paths", () => {
  it("reports an unknown tool and feeds an error back", async () => {
    const { complete, seen } = scripted([
      assistant({ tool_calls: [{ id: "c1", function: { name: "nope", arguments: "{}" } }] }),
      assistant({ content: "ok" }),
    ]);
    const events = await collect(runAgentLoop({ ...ok, prompt: "x", complete }));
    expect(events).toContainEqual({
      type: "tool_error",
      turn: 0,
      callId: "c1",
      name: "nope",
      message: "unknown tool",
    });
    const toolMsg = seen[1].find((m) => m.role === "tool");
    expect(toolMsg?.content).toBe(JSON.stringify({ error: "unknown tool" }));
  });

  it("reports a thrown tool, feeds the error back, then continues the loop", async () => {
    // A fake tool the injected resolver returns for any name — lets us exercise
    // the execute-throws path the real (non-throwing) registry tools can't reach.
    const exploding = {
      name: "boom",
      kind: "data",
      execute: () => {
        throw new Error("kaboom");
      },
    } as unknown as LoopTool;
    const { complete, seen } = scripted([
      assistant({ tool_calls: [{ id: "c1", function: { name: "boom", arguments: "{}" } }] }),
      assistant({ content: "recovered" }),
    ]);
    const events = await collect(runAgentLoop({ ...ok, prompt: "x", complete, findTool: () => exploding }));

    expect(events).toContainEqual({
      type: "tool_error",
      turn: 0,
      callId: "c1",
      name: "boom",
      message: "kaboom",
    });
    // The error is fed back as the tool message, and the loop runs a second turn.
    expect(seen[1].find((m) => m.role === "tool")?.content).toBe(JSON.stringify({ error: "kaboom" }));
    expect(events).toContainEqual({ type: "final", turn: 1, text: "recovered", reason: "stop" });
    expect(events.at(-1)).toEqual({ type: "done" });
  });

  it("falls back to empty args when arguments are not valid JSON", async () => {
    const { complete } = scripted([
      assistant({ tool_calls: [{ id: "c1", function: { name: "get_sales_data", arguments: "{not json" } }] }),
      assistant({ content: "done" }),
    ]);
    const events = await collect(runAgentLoop({ ...ok, prompt: "x", complete }));
    expect(events).toContainEqual({
      type: "tool_call",
      turn: 0,
      callId: "c1",
      name: "get_sales_data",
      args: {},
    });
  });

  it("surfaces a thrown model call as an error after start", async () => {
    const complete: CompleteFn = async () => {
      throw new Error("model 500: boom");
    };
    const events = await collect(runAgentLoop({ ...ok, prompt: "x", complete }));
    expect(events).toEqual([
      { type: "start", maxTurns: MAX_TURNS },
      { type: "error", message: "model 500: boom" },
      { type: "done" },
    ]);
  });

  it("stops at MAX_TURNS with reason 'max_turns' when the model never settles", async () => {
    // Always asks for a tool → never hits the no-tool stop branch.
    const loop = assistant({
      tool_calls: [{ id: "c", function: { name: "get_sales_data", arguments: "{}" } }],
    });
    const { complete } = scripted([loop]);
    const events = await collect(runAgentLoop({ ...ok, prompt: "loop", complete }));

    const toolCalls = events.filter((e) => e.type === "tool_call");
    expect(toolCalls).toHaveLength(MAX_TURNS);
    expect(events.at(-2)).toEqual({ type: "final", turn: MAX_TURNS - 1, reason: "max_turns" });
    expect(events.at(-1)).toEqual({ type: "done" });
    expect(events.some((e) => e.type === "final" && e.reason === "stop")).toBe(false);
  });
});
