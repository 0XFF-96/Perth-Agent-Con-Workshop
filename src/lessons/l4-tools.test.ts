import { describe, it, expect } from "vitest";
import { getSalesData, searchFlights, displayFlights, FLIGHT_OPERATIONS, displayDashboard } from "./l4-tools";
import { validateA2UIComponents } from "@ag-ui/a2ui-toolkit";
import { inlineCatalogSchema } from "../catalog/schema";
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

  it("displayDashboard yields a valid a2ui_operations envelope for the sales surface", async () => {
    const salesData = {
      totalRevenue: "$1.2M",
      newCustomers: 3842,
      conversionRate: "3.6%",
      revenueByCategory: [{ label: "Electronics", value: 420000 }],
      monthlySales: [{ label: "Jan", value: 85000 }],
    };
    const result = await displayDashboard.execute({ salesData });
    const parsed = typeof result === "string" ? JSON.parse(result) : result;

    // Envelope shape
    expect(Array.isArray(parsed.a2ui_operations)).toBe(true);

    // Find the updateComponents op
    const updateComponentsOp = parsed.a2ui_operations.find(
      (op: Record<string, unknown>) => op["updateComponents"] !== undefined,
    ) as { updateComponents: { components: Array<Record<string, unknown>> } } | undefined;
    expect(updateComponentsOp).toBeDefined();
    const components = updateComponentsOp!.updateComponents.components;

    // id:'root' node must exist
    const root = components.find((c) => c["id"] === "root");
    expect(root).toBeDefined();

    // Metric values are INLINED from salesData as literal strings (root-level
    // {path} bindings do not resolve for Metric.value in this catalog).
    expect(components.find((c) => c["id"] === "m1")!["value"]).toBe("$1.2M");
    expect(components.find((c) => c["id"] === "m2")!["value"]).toBe("3842");
    expect(components.find((c) => c["id"] === "m3")!["value"]).toBe("3.6%");

    // Every node must have a string component type
    for (const node of components) {
      expect(typeof node["component"]).toBe("string");
    }

    // Each Metric must have label and value
    const metrics = components.filter((c) => c["component"] === "Metric");
    for (const m of metrics) {
      expect(m["label"]).toBeDefined();
      expect(m["value"]).toBeDefined();
    }

    // Each DashboardCard must have title
    const cards = components.filter((c) => c["component"] === "DashboardCard");
    for (const card of cards) {
      expect(typeof card["title"]).toBe("string");
    }

    // validateA2UIComponents (validateBindings:false because data paths need runtime resolution)
    const validation = validateA2UIComponents({
      components: components as Array<Record<string, unknown>>,
      catalog: inlineCatalogSchema,
      validateBindings: false,
    });
    expect(validation.valid).toBe(true);
    if (!validation.valid) {
      // Surface errors for easier debugging
      console.error("A2UI validation errors:", validation.errors);
    }
  });
});
