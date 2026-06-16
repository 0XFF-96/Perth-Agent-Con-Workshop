import { describe, it, expect } from "vitest";
import { getSalesData, searchFlights } from "./l4-tools";
describe("l4 tools", () => {
  it("getSalesData returns the static metrics", async () => {
    const d = (await getSalesData.execute({})) as { totalRevenue: unknown; revenueByCategory: unknown[] };
    expect(d.totalRevenue).toBeDefined();
    expect(Array.isArray(d.revenueByCategory)).toBe(true);
  });
  it("searchFlights returns 4 flights echoing the route", async () => {
    const f = (await searchFlights.execute({ origin: "SFO", destination: "JFK" })) as Array<{ origin: string; destination: string }>;
    expect(f).toHaveLength(4);
    expect(f[0].origin).toBe("SFO");
    expect(f[0].destination).toBe("JFK");
  });
});
