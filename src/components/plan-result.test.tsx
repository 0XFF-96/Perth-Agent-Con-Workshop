import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PlanResult } from "./plan-result";

describe("PlanResult", () => {
  it("renders with no props without crashing", () => {
    render(<PlanResult />);
    expect(screen.getByText(/plan/i)).toBeInTheDocument();
  });
  it("shows a done summary", () => {
    render(<PlanResult status="done" summary="Marked 3 accounts at-risk." />);
    expect(screen.getByText("Marked 3 accounts at-risk.")).toBeInTheDocument();
  });
  it("shows a cancelled state", () => {
    render(<PlanResult status="cancelled" summary="No changes made." />);
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });
});
