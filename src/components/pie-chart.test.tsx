import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PieChart } from "./pie-chart";

describe("PieChart", () => {
  it("renders the title and a legend label per slice", () => {
    render(
      <PieChart
        title="Revenue by category"
        slices={[
          { label: "Hardware", value: 40 },
          { label: "Software", value: 35 },
          { label: "Services", value: 25 },
        ]}
      />,
    );
    expect(screen.getByText("Revenue by category")).toBeInTheDocument();
    expect(screen.getByText("Hardware")).toBeInTheDocument();
    expect(screen.getByText("Software")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
  });
});
