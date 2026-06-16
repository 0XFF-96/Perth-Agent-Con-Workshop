import { CopilotChat, useComponent } from "@copilotkit/react-core/v2";
import { FlightCard, FlightCardProps } from "@/components/flight-card";
import { PieChart, PieChartProps } from "@/components/pie-chart";
import { ExamplePrompts } from "@/components/example-prompts";

export default function L3Components() {
  // 🪁 HANDS-ON KNOB: change this description to "Only call this for
  // international flights" and the agent should stop rendering the card for
  // a domestic SFO→JFK request.
  useComponent({
    name: "flightCard",
    description: "Display a single flight summary card.",
    parameters: FlightCardProps,
    render: FlightCard,
  });

  useComponent({
    name: "pieChart",
    description: "Display data as a pie chart.",
    parameters: PieChartProps,
    render: PieChart,
  });

  return (
    <section className="lesson">
      <div className="lesson-copy">
        <h2>L3 · Controlled Generative UI</h2>
        <p>The agent renders typed React components you registered. Try the prompts below.</p>
      </div>
      <ExamplePrompts
        prompts={[
          "Show a flight card for Pacific Air from SFO to JFK departing at 08:30 for $249",
          "Please show me the distribution of our revenue by category in a pie chart",
        ]}
      />
      <div className="chat-region">
        <CopilotChat agentId="l3" />
      </div>
    </section>
  );
}
