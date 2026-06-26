import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FlightCard } from "./flight-card";

describe("FlightCard", () => {
  it("renders airline, route, times, price, and stops", () => {
    render(
      <FlightCard
        airline="Pacific Air"
        origin="SFO"
        destination="JFK"
        departure_time="08:30"
        arrival_time="16:55"
        price="$249"
        stops={0}
      />,
    );
    expect(screen.getByText("Pacific Air · nonstop")).toBeInTheDocument();
    expect(screen.getByText("SFO → JFK")).toBeInTheDocument();
    expect(screen.getByText("08:30")).toBeInTheDocument();
    expect(screen.getByText("16:55")).toBeInTheDocument();
    expect(screen.getByText("$249")).toBeInTheDocument();
  });

  it("pluralizes stops", () => {
    render(<FlightCard airline="Pacific Air" origin="SFO" destination="JFK" stops={2} />);
    expect(screen.getByText("Pacific Air · 2 stops")).toBeInTheDocument();
  });
});
