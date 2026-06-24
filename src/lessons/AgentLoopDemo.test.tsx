// src/lessons/AgentLoopDemo.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AgentLoopDemo from "./AgentLoopDemo";

describe("AgentLoopDemo", () => {
  it("lists the registered loop tools and an example prompt", () => {
    render(<AgentLoopDemo />);
    expect(screen.getByText("get_sales_data")).toBeInTheDocument();
    expect(screen.getByText("make_pie_chart")).toBeInTheDocument();
    expect(screen.getByText(/pie chart/i)).toBeInTheDocument();
  });
});
