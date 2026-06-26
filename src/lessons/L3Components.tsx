import { useState } from "react";
import { CopilotChat, useComponent } from "@copilotkit/react-core/v2";
import { FlightCard, FlightCardProps } from "@/components/flight-card";
import { PieChart, PieChartProps } from "@/components/pie-chart";
import { ExamplePrompts } from "@/components/example-prompts";
import { ToolDescriptionEditor } from "@/components/tool-description-editor";

const ANY_FLIGHT = "Show a flight card for any flight the user asks about.";
const ONLY_INTERNATIONAL = "Only call this for international flights.";

export default function L3Components() {
  // 🪁 HANDS-ON KNOB: the flightCard description is editable live in the panel
  // below. A tool's description isn't documentation — it's behavioral design:
  // switch it to "only international" and the agent stops rendering the card for
  // a domestic SFO→JFK request.
  const [flightDesc, setFlightDesc] = useState(ANY_FLIGHT);

  useComponent({
    name: "flightCard",
    description: flightDesc,
    parameters: FlightCardProps,
    render: FlightCard,
  });

  // 🪁 EXTENSION POINT: add a controlled L3 component — run /add-component, or
  // register another useComponent({ name, description, parameters, render }) below.
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

      <ToolDescriptionEditor
        toolName="flightCard"
        value={flightDesc}
        onChange={setFlightDesc}
        presets={[
          { label: "…any flight", value: ANY_FLIGHT },
          { label: "…only international", value: ONLY_INTERNATIONAL },
        ]}
      />

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
