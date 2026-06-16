/**
 * L4 server-side tools: getSalesData + searchFlights
 *
 * Implemented using defineTool from @copilotkit/runtime/v2.
 * Static data ported faithfully from ipynb/L4.ipynb.
 *
 * NOTE: This file is imported by server.ts (tsx) which does NOT reliably
 * resolve the @/ path alias — use relative imports for all local modules.
 */
import { z } from "zod";
import { defineTool } from "@copilotkit/runtime/v2";

// ── getSalesData ─────────────────────────────────────────────────────

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
