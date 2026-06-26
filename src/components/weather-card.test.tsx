import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { WeatherCard } from "./weather-card";

describe("WeatherCard", () => {
  it("renders city, temperature, and condition", () => {
    render(
      <WeatherCard
        city="Tokyo"
        temperature={28}
        condition="☀️"
      />,
    );
    expect(screen.getByText("Tokyo")).toBeInTheDocument();
    expect(screen.getByText("28°C")).toBeInTheDocument();
    expect(screen.getByText("☀️")).toBeInTheDocument();
  });

  it("renders with default values when props are missing (streaming partial props)", () => {
    // CopilotKit renders the component with partial args while the tool call
    // streams in, so props can be undefined before they arrive.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<WeatherCard {...({} as any)} />);
    // "Unknown" appears twice (city + condition description), so use getAllByText
    const unknowns = screen.getAllByText("Unknown");
    expect(unknowns).toHaveLength(2);
    expect(screen.getByText("0°C")).toBeInTheDocument();
    expect(screen.getByText("❓")).toBeInTheDocument();
  });

  it("renders temperature with degree symbol", () => {
    render(
      <WeatherCard
        city="Sydney"
        temperature={22}
        condition="⛅"
      />,
    );
    expect(screen.getByText("22°C")).toBeInTheDocument();
  });
});
