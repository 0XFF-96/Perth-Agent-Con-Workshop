import { describe, it, expect } from "vitest";
import { loopTools, findLoopTool, buildOpenAITools, makePieChart, calculate } from "./loop-tools";

describe("loop-tools", () => {
  it("ships the three seed tools", () => {
    expect(loopTools.map((t) => t.name).sort()).toEqual(["calculate", "get_sales_data", "make_pie_chart"]);
  });

  it("calculate executes one operation", () => {
    expect(calculate.execute({ a: 6, b: 3, op: "/" })).toEqual({ a: 6, b: 3, op: "/", result: 2 });
  });

  it("make_pie_chart returns a pieChart UI spec with slices (PieChart prop name)", () => {
    const out = makePieChart.execute({ title: "Rev", slices: [{ label: "A", value: 1 }] });
    expect(out).toEqual({ component: "pieChart", props: { title: "Rev", slices: [{ label: "A", value: 1 }] } });
  });

  it("findLoopTool resolves by name", () => {
    expect(findLoopTool("calculate")?.name).toBe("calculate");
    expect(findLoopTool("nope")).toBeUndefined();
  });

  it("buildOpenAITools emits a JSON-schema function spec per tool", () => {
    const specs = buildOpenAITools(loopTools);
    expect(specs).toHaveLength(3);
    const calc = specs.find((s) => s.function.name === "calculate")!;
    expect(calc.type).toBe("function");
    expect(calc.function.parameters).toMatchObject({ type: "object" });
    expect((calc.function.parameters as any).properties).toHaveProperty("op");
  });
});
