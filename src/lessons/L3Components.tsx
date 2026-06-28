import { CopilotChat, useComponent } from "@copilotkit/react-core/v2";
import { FlightCard, FlightCardProps } from "@/components/flight-card";
import { PieChart, PieChartProps } from "@/components/pie-chart";
import { StockCard, StockCardProps } from "@/components/stock-card";
import { WeatherCard, WeatherCardProps } from "@/components/weather-card";
import { FlightList, FlightListProps } from "@/components/flight-list";
import { ExamplePrompts } from "@/components/example-prompts";

export default function L3Components() {
  // 🪁 HANDS-ON KNOB: change this description to "Only call this for
  // international flights" and the agent should stop rendering the card for
  // a domestic SFO→JFK request.
  // 🪁 EXTENSION POINT: add a controlled L3 component — run /add-component, or
  // register another useComponent({ name, description, parameters, render }) below.
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

  useComponent({
    name: "stockCard",
    description: "Display a single stock quote card with price and change.",
    parameters: StockCardProps,
    render: StockCard,
  });

  useComponent({
    name: "weatherCard",
    description: "Display a single city's weather: temperature, conditions, and high/low.",
    parameters: WeatherCardProps,
    render: WeatherCard,
  });

  useComponent({
    name: "flightList",
    description: "Display a list of flight options for a route.",
    parameters: FlightListProps,
    render: FlightList,
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
          "Show a stock card for Apple (AAPL) trading at $189.21, up +1.34 (+0.71%)",
          "Show a weather card for Perth: 22°C, partly cloudy, high 25°C, low 14°C",
          "List 3 flight options from SFO to JFK with airlines, times, and prices",
        ]}
      />
      <div className="chat-region">
        <CopilotChat agentId="l3" />
      </div>
    </section>
  );
}
