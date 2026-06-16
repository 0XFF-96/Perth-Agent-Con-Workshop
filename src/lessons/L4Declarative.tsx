import { CopilotChat } from "@copilotkit/react-core/v2";
import { ExamplePrompts } from "@/components/example-prompts";

export default function L4Declarative() {
  return (
    <section className="lesson">
      <div className="lesson-copy">
        <h2>L4 · Declarative Generative UI (A2UI)</h2>
        <p>The agent composes UI from a catalog of primitives. Dashboards are generated dynamically; the flight carousel is a host-authored fixed layout.</p>
      </div>
      <ExamplePrompts
        prompts={[
          "Show me a sales dashboard with total revenue, new customers, and conversion rate metrics",
          "Find flights from SFO to JFK",
        ]}
      />
      <div className="chat-region">
        <CopilotChat agentId="l4" />
      </div>
    </section>
  );
}
