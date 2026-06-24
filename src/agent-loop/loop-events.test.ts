import { describe, it, expect } from "vitest";
import { parseSSE, type LoopEvent } from "./loop-events";

describe("parseSSE", () => {
  it("parses complete frames and returns no remainder", () => {
    const buf = `data: ${JSON.stringify({ type: "start", maxTurns: 8 })}\n\n`;
    const { events, rest } = parseSSE(buf);
    expect(events).toEqual([{ type: "start", maxTurns: 8 }]);
    expect(rest).toBe("");
  });

  it("keeps a trailing partial frame in rest", () => {
    const whole = `data: ${JSON.stringify({ type: "done" })}\n\n`;
    const partial = `data: {"type":"mod`;
    const { events, rest } = parseSSE(whole + partial);
    expect(events).toEqual([{ type: "done" }]);
    expect(rest).toBe(partial);
  });

  it("ignores malformed frames without throwing", () => {
    const { events } = parseSSE(`data: not-json\n\n`);
    expect(events).toEqual([]);
  });
});
