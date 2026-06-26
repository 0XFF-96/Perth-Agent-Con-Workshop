import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ToolDescriptionEditor } from "./tool-description-editor";

const PRESETS = [
  { label: "…any flight", value: "Show a flight card for any flight the user asks about." },
  { label: "…only international", value: "Only call this for international flights." },
];

describe("ToolDescriptionEditor", () => {
  it("emits the preset value when a chip is clicked", () => {
    const onChange = vi.fn();
    render(<ToolDescriptionEditor toolName="flightCard" value={PRESETS[0].value} presets={PRESETS} onChange={onChange} />);

    fireEvent.click(screen.getByText("…only international"));
    expect(onChange).toHaveBeenCalledWith(PRESETS[1].value);
  });

  it("marks the active preset via aria-pressed", () => {
    render(<ToolDescriptionEditor value={PRESETS[1].value} presets={PRESETS} />);
    expect(screen.getByText("…only international")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("…any flight")).toHaveAttribute("aria-pressed", "false");
  });

  it("emits typed edits", () => {
    const onChange = vi.fn();
    render(<ToolDescriptionEditor toolName="flightCard" value="" presets={PRESETS} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("flightCard description"), { target: { value: "x" } });
    expect(onChange).toHaveBeenCalledWith("x");
  });
});
