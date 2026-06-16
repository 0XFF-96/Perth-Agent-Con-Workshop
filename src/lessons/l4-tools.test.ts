import { describe, it, expect } from "vitest";
import { getSalesData, searchFlights, displayFlights, FLIGHT_OPERATIONS } from "./l4-tools";
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

  it("displayFlights yields an a2ui_operations envelope for the flight surface", async () => {
    const flights = [{ id: "f1", airline: "Delta", origin: "SFO", destination: "JFK", airlineLogo: "x", flightNumber: "DL1", date: "2026-07-01", departureTime: "08:00", arrivalTime: "16:00", duration: "5h", status: "On time", price: "$299" }];
    const result = await displayFlights.execute({ flights });
    // normalize to the on-the-wire object regardless of whether execute returns object or string
    const parsed = typeof result === "string" ? JSON.parse(result) : result;
    expect(Array.isArray(parsed.a2ui_operations)).toBe(true);
    expect(JSON.stringify(FLIGHT_OPERATIONS)).toContain('"root"');
  });
});
