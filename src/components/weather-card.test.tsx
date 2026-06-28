import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WeatherCard } from "./weather-card";

describe("WeatherCard", () => {
  it("renders with no props without crashing", () => {
    // Streaming delivers partial props first; this must not throw.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<WeatherCard {...({} as any)} />);
  });

  it("renders with partial props without crashing", () => {
    // CopilotKit renders the component with partial args while the tool call
    // streams in, so `conditions`/`high`/`low` can be undefined at first.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<WeatherCard {...({ city: "Perth" } as any)} />);
    expect(screen.getByText("Perth")).toBeInTheDocument();
  });

  it("renders representative weather data", () => {
    render(
      <WeatherCard
        city="Perth"
        temperature="22°C"
        conditions="Partly cloudy"
        high="25°C"
        low="14°C"
      />,
    );
    expect(screen.getByText("Perth")).toBeInTheDocument();
    expect(screen.getByText("22°C")).toBeInTheDocument();
    expect(screen.getByText("Partly cloudy")).toBeInTheDocument();
    expect(screen.getByText("H: 25°C · L: 14°C")).toBeInTheDocument();
  });
});
