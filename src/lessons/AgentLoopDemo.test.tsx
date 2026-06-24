// src/lessons/AgentLoopDemo.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AgentLoopDemo from "./AgentLoopDemo";

describe("AgentLoopDemo", () => {
  it("lists the registered loop tools and an example prompt", () => {
    render(<AgentLoopDemo />);
    expect(screen.getByText("get_sales_data")).toBeInTheDocument();
    expect(screen.getByText("make_pie_chart")).toBeInTheDocument();
    expect(screen.getByText("calculate")).toBeInTheDocument();
    // an example prompt chip (unique substring, won't collide with any tool description):
    expect(screen.getByText(/divided by 1200000/i)).toBeInTheDocument();
  });
});
