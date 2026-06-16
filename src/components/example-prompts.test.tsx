import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ExamplePrompts } from "./example-prompts";

describe("ExamplePrompts", () => {
  it("lists every provided prompt", () => {
    render(<ExamplePrompts prompts={["First prompt", "Second prompt"]} />);
    expect(screen.getByText("First prompt")).toBeInTheDocument();
    expect(screen.getByText("Second prompt")).toBeInTheDocument();
  });
});
