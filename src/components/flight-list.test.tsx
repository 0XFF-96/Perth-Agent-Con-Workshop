import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FlightList } from "./flight-list";

describe("FlightList", () => {
  it("renders with no props without crashing", () => {
    // Streaming delivers partial props first; this must not throw.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<FlightList {...({} as any)} />);
  });

  it("does not crash when flights is undefined (streaming partial props)", () => {
    // CopilotKit renders with partial args while the tool call streams in,
    // so `flights` can be undefined before the array arrives.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<FlightList {...({ title: "Loading flights" } as any)} />);
    expect(screen.getByText("Loading flights")).toBeInTheDocument();
    expect(screen.getByText("No flights to show.")).toBeInTheDocument();
  });

  it("renders one row per flight", () => {
    render(
      <FlightList
        title="Flights SFO → JFK"
        flights={[
          {
            airline: "Pacific Air",
            origin: "SFO",
            destination: "JFK",
            departure_time: "08:30",
            price: "$249",
          },
          {
            airline: "Coast Jet",
            origin: "SFO",
            destination: "JFK",
            departure_time: "13:15",
            price: "$312",
          },
        ]}
      />,
    );
    expect(screen.getByText("Flights SFO → JFK")).toBeInTheDocument();
    expect(screen.getByText("Pacific Air")).toBeInTheDocument();
    expect(screen.getByText("$249")).toBeInTheDocument();
    expect(screen.getByText("Coast Jet")).toBeInTheDocument();
    expect(screen.getByText("Departs: 13:15")).toBeInTheDocument();
  });
});
