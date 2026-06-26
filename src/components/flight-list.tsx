import { z } from "zod";

export const FlightListProps = z.object({
  title: z.string().describe("List title, e.g. Flights SFO → JFK"),
  flights: z
    .array(
      z.object({
        airline: z.string().describe("Airline name"),
        origin: z.string().describe("Departure airport/city"),
        destination: z.string().describe("Arrival airport/city"),
        departure_time: z.string().describe("Departure time"),
        price: z.string().describe("Price display, e.g. $249"),
      }),
    )
    .describe("The flight options to list"),
});

type FlightListProps = z.infer<typeof FlightListProps>;

// `flights` defaults to [] because CopilotKit streams tool-call args: during
// streaming the component renders with partial/undefined props before the full
// array arrives. Without this guard, `flights.map` throws and white-screens the app.
export function FlightList({ title, flights = [] }: FlightListProps) {
  return (
    <div className="rounded-lg border bg-white p-3 space-y-2">
      <div className="font-semibold">{title}</div>
      {flights.length === 0 ? (
        <div className="text-sm text-gray-500">No flights to show.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="space-y-2">
          {flights.map((f, i) => (
            <li key={i} className="rounded border p-2 text-sm">
              <div className="flex items-baseline justify-between">
                <span className="font-medium">{f.airline}</span>
                <span className="font-semibold">{f.price}</span>
              </div>
              <div>
                {f.origin} → {f.destination}
              </div>
              <div className="text-gray-500">Departs: {f.departure_time}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
