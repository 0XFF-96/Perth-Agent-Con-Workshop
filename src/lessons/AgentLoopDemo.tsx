// src/lessons/AgentLoopDemo.tsx
import { useState } from "react";
import { parseSSE, type LoopEvent } from "@/agent-loop/loop-events";
import { loopTools } from "@/agent-loop/loop-tools";
import { LoopStep } from "@/components/loop-step";
import { ExamplePrompts } from "@/components/example-prompts";

export default function AgentLoopDemo() {
  const [prompt, setPrompt] = useState("Show our revenue by category as a pie chart");
  const [events, setEvents] = useState<LoopEvent[]>([]);
  const [running, setRunning] = useState(false);
  const turns = events.filter((e) => e.type === "model_step").length;

  async function run() {
    if (running || !prompt.trim()) return;
    setEvents([]);
    setRunning(true);
    try {
      const res = await fetch("/api/agent-loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const { events: parsed, rest } = parseSSE(buf);
        buf = rest;
        if (parsed.length) setEvents((prev) => [...prev, ...parsed]);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setEvents((prev) => [...prev, { type: "error", message }]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="lesson">
      <div className="lesson-copy">
        <h2>🔁 Agent Loop · model → tool → re-decide</h2>
        <p>
          A real, model-driven loop. Each step is streamed live: the model decides, calls a
          tool, sees the result, and decides again — until it answers. Tools can return data
          or render UI. Add your own with <code>/add-loop-tool</code>.
        </p>
      </div>

      <ExamplePrompts prompts={["Show our revenue by category as a pie chart", "What is 420000 divided by 1200000 as a percent?"]} />

      <div style={{ display: "flex", gap: 8, padding: "0 24px 12px" }}>
        <input
          aria-label="Prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8 }}
        />
        <button type="button" onClick={run} disabled={running}>
          {running ? "Running…" : "Run loop"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 16, padding: "0 24px 24px", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 8 }}>
            Turns: {turns} / 8
          </div>
          {events.length === 0 && !running ? (
            <p style={{ color: "#6b7280" }}>Run the loop to see each step appear here.</p>
          ) : (
            events.map((e, i) => <LoopStep key={i} event={e} />)
          )}
        </div>
        <aside style={{ width: 220, flexShrink: 0 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Available tools</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13 }}>
            {loopTools.map((t) => (
              <li key={t.name} style={{ marginBottom: 8 }} title={t.description}>
                <code>{t.name}</code>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
