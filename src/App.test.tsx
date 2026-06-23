import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "@/App";

// CopilotChat and useComponent require a live CopilotKit provider context,
// which is not available in unit tests. Stub the entire v2 entry point so we
// can render <App /> and verify the tab chrome without spinning up a runtime.
vi.mock("@copilotkit/react-core/v2", () => ({
  CopilotChat: () => <div data-testid="copilot-chat" />,
  useComponent: () => {},
}));

describe("App", () => {
  it("renders the L2 tab button", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "L2 Chat" })).toBeInTheDocument();
  });

  it("renders the L3 tab button", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "L3 Components" })).toBeInTheDocument();
  });

  it("renders the L4 Declarative tab button", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "L4 Declarative" })).toBeInTheDocument();
  });

  it("renders the Extend tab button", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "🪁 Extend" })).toBeInTheDocument();
  });
});
