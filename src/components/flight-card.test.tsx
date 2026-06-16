import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FlightCard } from "./flight-card";

describe("FlightCard", () => {
  it("renders airline, route, time, and price", () => {
    render(
      <FlightCard
        title="Morning departure"
        airline="Pacific Air"
        origin="SFO"
        destination="JFK"
        departure_time="08:30"
        price="$249"
      />,
    );
    expect(screen.getByText("Morning departure")).toBeInTheDocument();
    expect(screen.getByText("Pacific Air")).toBeInTheDocument();
    expect(screen.getByText("SFO → JFK")).toBeInTheDocument();
    expect(screen.getByText("Departs: 08:30")).toBeInTheDocument();
    expect(screen.getByText("$249")).toBeInTheDocument();
  });
});
