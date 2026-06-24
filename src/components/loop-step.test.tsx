import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoopStep } from "./loop-step";

describe("LoopStep", () => {
  it("renders a tool_call with the tool name", () => {
    render(<LoopStep event={{ type: "tool_call", turn: 0, callId: "1", name: "get_sales_data", args: {} }} />);
    expect(screen.getByText(/get_sales_data/)).toBeInTheDocument();
  });

  it("renders a data tool_result as JSON", () => {
    render(<LoopStep event={{ type: "tool_result", turn: 0, callId: "1", name: "calculate", kind: "data", data: { result: 2 } }} />);
    expect(screen.getByText(/"result": 2/)).toBeInTheDocument();
  });

  it("renders a ui tool_result via the component registry", () => {
    render(
      <LoopStep
        event={{ type: "tool_result", turn: 0, callId: "1", name: "make_pie_chart", kind: "ui", ui: { component: "pieChart", props: { title: "Rev", slices: [] } } }}
      />,
    );
    expect(screen.getByText("Rev")).toBeInTheDocument();
  });

  it("renders a final answer", () => {
    render(<LoopStep event={{ type: "final", turn: 1, text: "All done", reason: "stop" }} />);
    expect(screen.getByText(/All done/)).toBeInTheDocument();
  });
});
