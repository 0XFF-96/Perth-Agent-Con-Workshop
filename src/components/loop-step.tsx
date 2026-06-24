import type { LoopEvent } from "@/agent-loop/loop-events";
import { renderLoopUi } from "@/agent-loop/loop-component-registry";

const card: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: "10px 12px",
  marginBottom: 10,
  background: "#fff",
  fontSize: 14,
};
const tag = (bg: string): React.CSSProperties => ({
  display: "inline-block",
  background: bg,
  borderRadius: 6,
  padding: "1px 8px",
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
});

export function LoopStep({ event }: { event: LoopEvent }): JSX.Element {
  switch (event.type) {
    case "start":
      return <div style={{ ...card, color: "#6b7280" }}>▶ Loop started · cap {event.maxTurns} turns</div>;
    case "model_step":
      return (
        <div style={card}>
          <span style={tag("#eef2ff")}>turn {event.turn} · model</span>
          <div>{event.text}</div>
        </div>
      );
    case "tool_call":
      return (
        <div style={card}>
          <span style={tag("#fef9c3")}>→ tool call</span>
          <div>
            <code>{event.name}({JSON.stringify(event.args)})</code>
          </div>
        </div>
      );
    case "tool_result":
      return (
        <div style={card}>
          <span style={tag("#dcfce7")}>← {event.name} result</span>
          {event.kind === "ui" && event.ui ? (
            renderLoopUi(event.ui)
          ) : (
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(event.data ?? {}, null, 2)}</pre>
          )}
        </div>
      );
    case "tool_error":
      return (
        <div style={{ ...card, borderColor: "#fca5a5" }}>
          <span style={tag("#fee2e2")}>✗ {event.name} error</span>
          <div>{event.message}</div>
        </div>
      );
    case "final":
      return (
        <div style={{ ...card, borderColor: "#86efac" }}>
          <span style={tag("#dcfce7")}>✓ final{event.reason === "max_turns" ? " · hit step limit" : ""}</span>
          <div>{event.text || (event.reason === "max_turns" ? "Reached the step limit." : "")}</div>
        </div>
      );
    case "error":
      return (
        <div style={{ ...card, borderColor: "#fca5a5", color: "#b91c1c" }}>
          <span style={tag("#fee2e2")}>error</span>
          <div>{event.message}</div>
        </div>
      );
    case "done":
      return <div style={{ ...card, color: "#6b7280" }}>■ Done</div>;
  }
}
