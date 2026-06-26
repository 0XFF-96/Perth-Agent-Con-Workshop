import { z } from "zod";

export const FlightCardProps = z.object({
  airline: z.string().describe("Airline name"),
  origin: z.string().describe("Departure airport/city code"),
  destination: z.string().describe("Arrival airport/city code"),
  departure_time: z.string().describe("Departure time, e.g. 08:30"),
  arrival_time: z.string().describe("Arrival time, e.g. 16:55"),
  price: z.string().describe("Price display, e.g. $249"),
  stops: z.number().describe("Number of stops (0 = nonstop)"),
});

type FlightCardProps = z.infer<typeof FlightCardProps>;

// Inline styles (not Tailwind): this project ships no Tailwind, so utility
// classes are dead — match the inline-style convention used across src/components.
export function FlightCard({
  airline = "",
  origin = "",
  destination = "",
  departure_time = "",
  arrival_time = "",
  price = "",
  stops = 0,
}: Partial<FlightCardProps>) {
  const legLabel = `${airline} · ${stops === 0 ? "nonstop" : `${stops} stop${stops > 1 ? "s" : ""}`}`;

  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 12,
        background: "var(--surface)",
        padding: 16,
        maxWidth: 420,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Header: route + price */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>
          {origin} → {destination}
        </div>
        <div style={{ fontWeight: 700, fontSize: 18, color: "var(--accent)" }}>{price}</div>
      </div>

      {/* Timeline: departure ── airline · stops ──▸ arrival */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 700, fontSize: 22 }}>{departure_time}</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{origin}</div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>{legLabel}</div>
          <div
            style={{
              width: "100%",
              height: 1,
              background: "var(--line)",
              position: "relative",
              marginTop: 4,
            }}
          >
            <span style={{ position: "absolute", right: -1, top: -4, color: "var(--line)", fontSize: 10 }}>▸</span>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, fontSize: 22 }}>{arrival_time}</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{destination}</div>
        </div>
      </div>
    </div>
  );
}
