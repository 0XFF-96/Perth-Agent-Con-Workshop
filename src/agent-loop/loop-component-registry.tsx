import type { ComponentType } from "react";
import { PieChart } from "@/components/pie-chart";
import type { ToolResultUi } from "./loop-events";

// 🪁 EXTENSION POINT: map a UI tool's `component` name to a React component.
// Add an entry here when your /add-loop-tool tool returns kind:"ui".
const registry: Record<string, ComponentType<any>> = {
  pieChart: PieChart,
};

export function renderLoopUi(ui: ToolResultUi) {
  const Component = registry[ui.component];
  if (Component) return <Component {...ui.props} />;
  return (
    <div className="rounded-lg border bg-white p-3" style={{ fontSize: 13 }}>
      <div style={{ fontWeight: 600 }}>Unknown UI component: {ui.component}</div>
      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(ui.props, null, 2)}</pre>
    </div>
  );
}
