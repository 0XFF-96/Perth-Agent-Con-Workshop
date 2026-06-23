/**
 * L4 server-side tools: getSalesData + searchFlights + displayFlights
 *
 * Implemented using defineTool from @copilotkit/runtime/v2.
 * Static data ported faithfully from ipynb/L4.ipynb.
 *
 * NOTE: This file is imported by server.ts (tsx) which does NOT reliably
 * resolve the @/ path alias — use relative imports for all local modules.
 */
import { z } from "zod";
import { defineTool } from "@copilotkit/runtime/v2";
import { CATALOG_ID, FLIGHT_SURFACE_ID, SALES_SURFACE_ID } from "../catalog/catalog-id";

// ── getSalesData ─────────────────────────────────────────────────────

// 🪁 EXTENSION POINT: add a host tool the agent can call — run /add-tool, or copy a
// defineTool({ name, description, parameters, execute }) block and register it in server.ts.
export const getSalesData = defineTool({
  name: "get_sales_data",
  description:
    "Fetch current sales metrics and revenue data. Returns sales data including revenue, customers, conversion rates, and breakdowns by category and month.",
  parameters: z.object({}),
  execute: async (_args) => {
    return {
      totalRevenue: "$1.2M",
      newCustomers: 3842,
      conversionRate: "3.6%",
      revenueByCategory: [
        { label: "Electronics", value: 420000 },
        { label: "Clothing", value: 310000 },
        { label: "Home & Garden", value: 185000 },
        { label: "Sports", value: 160000 },
        { label: "Books", value: 125000 },
      ],
      monthlySales: [
        { label: "Jan", value: 85000 },
        { label: "Feb", value: 92000 },
        { label: "Mar", value: 108000 },
        { label: "Apr", value: 95000 },
        { label: "May", value: 115000 },
        { label: "Jun", value: 125000 },
      ],
    };
  },
});

// ── searchFlights ────────────────────────────────────────────────────

export const searchFlights = defineTool({
  name: "search_flights",
  description:
    "Search for available flights between two airports. Returns a list of available flights with airline, times, duration, status, and price.",
  parameters: z.object({
    origin: z.string().describe('Origin airport IATA code (e.g. "SFO").'),
    destination: z
      .string()
      .describe('Destination airport IATA code (e.g. "JFK").'),
  }),
  execute: async ({ origin, destination }) => {
    return [
      {
        id: "1",
        airline: "Delta Air Lines",
        airlineLogo:
          "https://www.gstatic.com/flights/airline_logos/70px/DL.png",
        flightNumber: "DL 520",
        origin,
        destination,
        date: "2026-04-11",
        departureTime: "08:00",
        arrivalTime: "16:35",
        duration: "5h 35m",
        status: "On Time",
        price: "$389",
      },
      {
        id: "2",
        airline: "United Airlines",
        airlineLogo:
          "https://www.gstatic.com/flights/airline_logos/70px/UA.png",
        flightNumber: "UA 1583",
        origin,
        destination,
        date: "2026-04-11",
        departureTime: "10:15",
        arrivalTime: "18:42",
        duration: "5h 27m",
        status: "On Time",
        price: "$412",
      },
      {
        id: "3",
        airline: "JetBlue",
        airlineLogo:
          "https://www.gstatic.com/flights/airline_logos/70px/B6.png",
        flightNumber: "B6 416",
        origin,
        destination,
        date: "2026-04-11",
        departureTime: "14:30",
        arrivalTime: "23:05",
        duration: "5h 35m",
        status: "On Time",
        price: "$345",
      },
      {
        id: "4",
        airline: "American Airlines",
        airlineLogo:
          "https://www.gstatic.com/flights/airline_logos/70px/AA.png",
        flightNumber: "AA 178",
        origin,
        destination,
        date: "2026-04-11",
        departureTime: "17:00",
        arrivalTime: "01:20+1",
        duration: "5h 20m",
        status: "On Time",
        price: "$398",
      },
    ];
  },
});

// ── displayFlights ───────────────────────────────────────────────────
//
// TASK 6 FINDINGS — locked from compiled middleware source:
//
// 1. OP ENVELOPE SHAPE (node_modules/@ag-ui/a2ui-middleware/dist/index.js, line 280)
//    tryParseA2UIOperations does:
//      const t = JSON.parse(r)          // r = TOOL_CALL_RESULT content string
//      if (Array.isArray(t["a2ui_operations"])) → valid
//    So the on-the-wire JSON must be: {"a2ui_operations": [...ops]}
//
//    Each op is camelCase (NOT snake_case), one operation key per object:
//      createSurface:   { "version": "v0.9", "createSurface":   { "surfaceId": "...", "catalogId": "..." } }
//      updateComponents:{ "version": "v0.9", "updateComponents":{ "surfaceId": "...", "components": [...] } }
//      updateDataModel: { "version": "v0.9", "updateDataModel": { "surfaceId": "...", "path": "/", "value": {...} } }
//    Evidence: index.js lines 64–79 (schema docstring examples), lines 228–240 (JSON Schema Reference),
//    and createA2UIActivityEvents at lines ~284+ which builds these exact shapes.
//
// 2. BUILTIN AGENT RETURN TYPE (node_modules/@copilotkit/runtime/dist/agent/index.mjs, line 689)
//    The "tool-result" branch does:
//      serializedResult = JSON.stringify(toolResult)   // ← always stringifies
//      content: serializedResult                       // ← goes on the wire
//    Therefore execute() MUST return a plain OBJECT. If execute returned a pre-stringified
//    string, BuiltInAgent would stringify it again → double-encoded → tryParseA2UIOperations
//    would receive a JSON string whose JSON.parse gives a string, not an object → null → no render.
//    Decision: execute() returns { a2ui_operations: [...] } (plain object).

/**
 * Flat A2UI v0.9 component tree for the flight card surface.
 * Verbatim port of FLIGHT_SCHEMA from ipynb/L4.ipynb (cell 35).
 * Root id must be "root"; children use the repeater pattern
 * { componentId, path } to fan out one card per flight.
 */
export const FLIGHT_OPERATIONS = [
  {
    id: "root",
    component: "List",
    children: { componentId: "flight-card", path: "/flights" },
    direction: "horizontal",
    gap: 16,
  },
  { id: "flight-card", component: "Card", child: "main-col" },
  {
    id: "main-col",
    component: "Column",
    children: [
      "airline-img",
      "header-row",
      "meta-row",
      "divider-1",
      "times-row",
      "route-row",
      "divider-2",
      "status-row",
      "divider-3",
      "book-btn",
    ],
    align: "stretch",
    gap: 8,
  },
  {
    id: "airline-img",
    component: "Image",
    src: { path: "airlineLogo" },
    alt: { path: "airline" },
    height: 32,
  },
  {
    id: "header-row",
    component: "Row",
    children: ["airline-name", "price-text"],
    justify: "spaceBetween",
    align: "center",
  },
  { id: "airline-name", component: "Text", text: { path: "airline" }, variant: "h3" },
  { id: "price-text",   component: "Text", text: { path: "price" },   variant: "h2" },
  {
    id: "meta-row",
    component: "Row",
    children: ["flight-number", "date-text"],
    justify: "spaceBetween",
    align: "center",
  },
  { id: "flight-number", component: "Text", text: { path: "flightNumber" }, variant: "caption" },
  { id: "date-text",     component: "Text", text: { path: "date" },         variant: "caption" },
  { id: "divider-1", component: "Divider" },
  {
    id: "times-row",
    component: "Row",
    children: ["depart-time", "duration-text", "arrive-time"],
    justify: "spaceBetween",
    align: "center",
  },
  { id: "depart-time",   component: "Text", text: { path: "departureTime" }, variant: "h2" },
  { id: "duration-text", component: "Text", text: { path: "duration" },      variant: "caption" },
  { id: "arrive-time",   component: "Text", text: { path: "arrivalTime" },   variant: "h2" },
  {
    id: "route-row",
    component: "Row",
    children: ["origin-code", "arrow-text", "dest-code"],
    justify: "spaceBetween",
    align: "center",
  },
  { id: "origin-code", component: "Text", text: { path: "origin" },      variant: "h3" },
  { id: "arrow-text",  component: "Text", text: "→",                variant: "h3" },
  { id: "dest-code",   component: "Text", text: { path: "destination" }, variant: "h3" },
  { id: "divider-2", component: "Divider" },
  {
    id: "status-row",
    component: "Row",
    children: ["status-text"],
    align: "center",
  },
  { id: "status-text", component: "Text", text: { path: "status" }, variant: "caption" },
  { id: "divider-3", component: "Divider" },
  {
    id: "book-btn",
    component: "Button",
    label: "Book Flight",
    variant: "primary",
    action: { event: { name: "bookFlight" } },
  },
];

// ── SALES_DASHBOARD_OPERATIONS ───────────────────────────────────────
//
// Host-authored component tree for the sales dashboard surface.
// Mirrors the FLIGHT_OPERATIONS pattern — every node has all required props,
// id:'root' is the tree root, all referenced child ids exist.
//
// LIVE FINDING: root-level {path:...} data bindings do NOT resolve for
// Metric.value in this catalog (the surface painted but showed the literal
// path string "totalRevenue" instead of the value). The flight List works
// because its bindings are repeater-scoped per item; the dashboard metrics
// are not in a repeater. Fix: INLINE the real getSalesData values as literal
// strings (resolveText on a literal is a no-op, so this renders reliably).
export function buildSalesDashboard(
  salesData: {
    totalRevenue?: unknown;
    newCustomers?: unknown;
    conversionRate?: unknown;
  } = {},
) {
  const text = (v: unknown) => (v === undefined || v === null ? "—" : String(v));
  return [
    { id: "root",    component: "Column",        gap: 16, children: ["heading", "metrics"] },
    { id: "heading", component: "Text",          text: "Sales Overview", variant: "h2" },
    { id: "metrics", component: "Row",           gap: 16, children: ["c1", "c2", "c3"] },
    { id: "c1",      component: "DashboardCard", title: "Total Revenue",   child: "m1" },
    { id: "c2",      component: "DashboardCard", title: "New Customers",   child: "m2" },
    { id: "c3",      component: "DashboardCard", title: "Conversion Rate", child: "m3" },
    { id: "m1",      component: "Metric",        label: "Total Revenue",   value: text(salesData.totalRevenue) },
    { id: "m2",      component: "Metric",        label: "New Customers",   value: text(salesData.newCustomers) },
    { id: "m3",      component: "Metric",        label: "Conversion Rate", value: text(salesData.conversionRate) },
  ];
}

// Default (placeholder) tree — structurally valid for unit tests.
export const SALES_DASHBOARD_OPERATIONS = buildSalesDashboard();

export const displayDashboard = defineTool({
  name: "displayDashboard",
  description:
    "Render the sales metrics as a fixed dashboard UI surface. " +
    "Call this after getSalesData to paint the dashboard. " +
    "Pass the full salesData object returned by getSalesData.",
  parameters: z.object({
    salesData: z.any().describe("The sales data object from getSalesData."),
  }),
  execute: async ({ salesData }) => ({
    a2ui_operations: [
      {
        version: "v0.9",
        createSurface: {
          surfaceId: SALES_SURFACE_ID,
          catalogId: CATALOG_ID,
        },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: SALES_SURFACE_ID,
          components: buildSalesDashboard(salesData),
        },
      },
      {
        version: "v0.9",
        updateDataModel: {
          surfaceId: SALES_SURFACE_ID,
          path: "/",
          value: salesData,
        },
      },
    ],
  }),
});

export const displayFlights = defineTool({
  name: "displayFlights",
  description:
    "Render flight search results as a fixed UI surface. " +
    "Call this after search_flights to paint the flight cards. " +
    "Pass the full flights array returned by search_flights.",
  parameters: z.object({
    flights: z.array(z.any()).describe("Array of flight objects from search_flights."),
  }),
  execute: async ({ flights }) => {
    // Returns a plain object — BuiltInAgent will JSON.stringify it once to produce
    // the TOOL_CALL_RESULT content string. tryParseA2UIOperations then parses that
    // string and checks for the a2ui_operations array key.
    return {
      a2ui_operations: [
        {
          version: "v0.9",
          createSurface: {
            surfaceId: FLIGHT_SURFACE_ID,
            catalogId: CATALOG_ID,
          },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: FLIGHT_SURFACE_ID,
            components: FLIGHT_OPERATIONS,
          },
        },
        {
          version: "v0.9",
          updateDataModel: {
            surfaceId: FLIGHT_SURFACE_ID,
            path: "/",
            value: { flights },
          },
        },
      ],
    };
  },
});
