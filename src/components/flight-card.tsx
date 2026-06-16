import { z } from "zod";

export const FlightCardProps = z.object({
  title: z.string().describe("Flight card title"),
  airline: z.string().describe("Airline name"),
  origin: z.string().describe("Departure airport/city"),
  destination: z.string().describe("Arrival airport/city"),
  departure_time: z.string().describe("Departure time"),
  price: z.string().describe("Price display"),
});

type FlightCardProps = z.infer<typeof FlightCardProps>;

export function FlightCard({
  title,
  airline,
  origin,
  destination,
  departure_time,
  price,
}: FlightCardProps) {
  return (
    <div className="rounded-lg border bg-white p-3 space-y-2">
      <div className="font-semibold">{title}</div>
      <div className="rounded border p-2 text-sm">
        <div className="font-medium">{airline}</div>
        <div>
          {origin} → {destination}
        </div>
        <div>Departs: {departure_time}</div>
        <div className="font-semibold">{price}</div>
      </div>
    </div>
  );
}
