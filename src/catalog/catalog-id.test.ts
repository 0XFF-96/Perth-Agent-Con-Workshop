import { describe, it, expect } from "vitest";
import { CATALOG_ID, SALES_SURFACE_ID, FLIGHT_SURFACE_ID } from "./catalog-id";
describe("catalog-id", () => {
  it("pins the client/server invariants", () => {
    expect(CATALOG_ID).toBe("copilotkit://app-dashboard-catalog");
    expect(SALES_SURFACE_ID).toBe("sales-dashboard");
    expect(FLIGHT_SURFACE_ID).toBe("flight-search-results");
  });
});
