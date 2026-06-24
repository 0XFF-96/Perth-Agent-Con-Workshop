export type ToolResultUi = { component: string; props: Record<string, unknown> };

export type LoopEvent =
  | { type: "start"; maxTurns: number }
  | { type: "model_step"; turn: number; text: string }
  | { type: "tool_call"; turn: number; callId: string; name: string; args: Record<string, unknown> }
  | { type: "tool_result"; turn: number; callId: string; name: string; kind: "data" | "ui"; data?: unknown; ui?: ToolResultUi }
  | { type: "tool_error"; turn: number; callId: string; name: string; message: string }
  | { type: "final"; turn: number; text?: string; reason: "stop" | "max_turns" }
  | { type: "error"; message: string }
  | { type: "done" };

// Pure parser for our SSE protocol: frames are separated by a blank line and
// each frame carries one `data: <json>` line. Returns the events parsed so far
// plus any trailing partial frame to carry into the next chunk.
export function parseSSE(buffer: string): { events: LoopEvent[]; rest: string } {
  const events: LoopEvent[] = [];
  const frames = buffer.split("\n\n");
  const rest = frames.pop() ?? "";
  for (const frame of frames) {
    const line = frame.split("\n").find((l) => l.startsWith("data:"));
    if (!line) continue;
    const json = line.slice("data:".length).trim();
    if (!json) continue;
    try {
      events.push(JSON.parse(json) as LoopEvent);
    } catch {
      // skip malformed frame
    }
  }
  return { events, rest };
}
