/**
 * Inline A2UI catalog schema (object form) for server-side middleware.
 *
 * A2UIInlineCatalogSchema = { catalogId: string, components: Record<string, Record<string, unknown>> }
 *
 * Each component entry is a proper JSON Schema object derived from the Zod
 * props schema via zod-to-json-schema.  This is the preferred form for
 * semantic validation server-side (vs the legacy Array<{name, props}> form
 * returned by extractSchema, whose "props" entries carry internal Zod type
 * strings rather than JSON Schema).
 */
import { zodToJsonSchema } from "zod-to-json-schema";
import { CATALOG_ID } from "./catalog-id";
import { demonstrationCatalogDefinitions } from "./definitions";

type InlineCatalogSchema = {
  catalogId: string;
  components: Record<string, Record<string, unknown>>;
};

function buildInlineCatalogSchema(): InlineCatalogSchema {
  const components: Record<string, Record<string, unknown>> = {};
  for (const [name, def] of Object.entries(demonstrationCatalogDefinitions)) {
    components[name] = zodToJsonSchema(def.props, {
      target: "jsonSchema7",
    }) as Record<string, unknown>;
  }
  return { catalogId: CATALOG_ID, components };
}

export const inlineCatalogSchema: InlineCatalogSchema = buildInlineCatalogSchema();
