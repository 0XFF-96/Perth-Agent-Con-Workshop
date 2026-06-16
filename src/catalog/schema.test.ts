import { describe, it, expect } from "vitest";
import { CATALOG_ID } from "./catalog-id";
import { inlineCatalogSchema } from "./schema";
describe("inlineCatalogSchema", () => {
  it("is the object form keyed by CATALOG_ID with all 17 components", () => {
    expect(inlineCatalogSchema.catalogId).toBe(CATALOG_ID);
    expect(Object.keys(inlineCatalogSchema.components)).toHaveLength(17);
    expect(inlineCatalogSchema.components.DashboardCard).toBeDefined();
  });
});
