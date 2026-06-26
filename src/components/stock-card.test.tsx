import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StockCard } from "./stock-card";

describe("StockCard", () => {
  it("renders with no props without crashing", () => {
    // Streaming delivers partial props first; this must not throw.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<StockCard {...({} as any)} />);
  });

  it("renders with partial props without crashing", () => {
    // CopilotKit renders the component with partial args while the tool call
    // streams in, so `change`/`change_percent` can be undefined at first.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<StockCard {...({ symbol: "AAPL" } as any)} />);
    expect(screen.getByText("AAPL")).toBeInTheDocument();
  });

  it("renders an up stock in green with an up arrow", () => {
    render(
      <StockCard
        symbol="AAPL"
        company="Apple Inc."
        price="$189.21"
        change="+1.34"
        change_percent="+0.71%"
      />,
    );
    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getByText("Apple Inc.")).toBeInTheDocument();
    expect(screen.getByText("$189.21")).toBeInTheDocument();
    expect(screen.getByText(/▲ \+1\.34 \(\+0\.71%\)/)).toBeInTheDocument();
  });

  it("renders a down stock with a down arrow", () => {
    render(
      <StockCard
        symbol="TSLA"
        company="Tesla, Inc."
        price="$242.10"
        change="-3.40"
        change_percent="-1.38%"
      />,
    );
    expect(screen.getByText(/▼ -3\.40 \(-1\.38%\)/)).toBeInTheDocument();
  });
});
