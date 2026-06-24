import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderLoopUi } from "./loop-component-registry";

describe("renderLoopUi", () => {
  it("renders a known component (pieChart) by title", () => {
    render(renderLoopUi({ component: "pieChart", props: { title: "Revenue", slices: [] } }));
    expect(screen.getByText("Revenue")).toBeInTheDocument();
  });

  it("falls back to a JSON card for an unknown component", () => {
    render(renderLoopUi({ component: "mystery", props: { a: 1 } }));
    expect(screen.getByText(/mystery/)).toBeInTheDocument();
  });
});
