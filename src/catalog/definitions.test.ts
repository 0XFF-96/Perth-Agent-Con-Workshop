import { describe, it, expect } from "vitest";
import { extractSchema } from "@copilotkit/a2ui-renderer";
import { demonstrationCatalogDefinitions } from "./definitions";
const EXPECTED = ["Title","Text","Icon","Image","Divider","Card","List","Tabs","Row","Column","DashboardCard","Metric","PieChart","BarChart","Badge","DataTable","Button"];
describe("catalog definitions", () => {
  it("defines all 17 components", () => {
    const names = extractSchema(demonstrationCatalogDefinitions).map((c: { name: string }) => c.name).sort();
    expect(names).toEqual([...EXPECTED].sort());
  });
});
