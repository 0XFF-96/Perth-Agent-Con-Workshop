import { describe, it, expect } from "vitest";
import { CATALOG_ID } from "./catalog-id";
import { demonstrationCatalog } from "./renderers";
describe("demonstrationCatalog", () => {
  it("is assembled under the shared CATALOG_ID", () => {
    expect((demonstrationCatalog as { id: string }).id).toBe(CATALOG_ID);
  });
});
