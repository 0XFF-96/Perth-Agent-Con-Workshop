import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PlanCard } from "./plan-card";

describe("PlanCard", () => {
  it("renders with no props without crashing", () => {
    render(<PlanCard />);
    expect(screen.getByText(/plan · review/i)).toBeInTheDocument();
  });
  it("renders the goal and each step", () => {
    const { container } = render(
      <PlanCard
        goal="Flag at-risk Q3 accounts"
        steps={[
          { title: "Query", detail: "Find accounts with no contact in 60 days" },
          { title: "Mark", detail: "Set status to at-risk" },
        ]}
      />,
    );
    expect(screen.getByText("Flag at-risk Q3 accounts")).toBeInTheDocument();
    expect(screen.getByText("Query")).toBeInTheDocument();
    expect(screen.getByText("Mark")).toBeInTheDocument();
    expect(container).toHaveTextContent(/type\s+approve\s+to run this/i);
  });
});
