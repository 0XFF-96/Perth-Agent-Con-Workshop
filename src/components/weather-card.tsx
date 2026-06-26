import { z } from "zod";

export const WeatherCardProps = z.object({
  city: z.string().describe("City name, e.g. Perth"),
  temperature: z.string().describe("Current temperature display, e.g. 22°C"),
  conditions: z.string().describe("Short conditions text, e.g. Partly cloudy"),
  high: z.string().describe("Forecast high, e.g. 25°C"),
  low: z.string().describe("Forecast low, e.g. 14°C"),
});

type WeatherCardProps = z.infer<typeof WeatherCardProps>;

// Pick a glyph from the conditions text. `conditions` may arrive empty/partial
// during streaming, so guard before reading it.
function iconFor(conditions: string) {
  const c = conditions.toLowerCase();
  if (c.includes("storm") || c.includes("thunder")) return "⛈️";
  if (c.includes("rain") || c.includes("shower")) return "🌧️";
  if (c.includes("snow")) return "❄️";
  if (c.includes("cloud")) return "⛅";
  if (c.includes("clear") || c.includes("sun")) return "☀️";
  return "🌡️";
}

export function WeatherCard({
  city,
  temperature,
  conditions = "",
  high = "",
  low = "",
}: WeatherCardProps) {
  return (
    <div className="rounded-lg border bg-gray-200 p-3 space-y-2 shadow-md max-w-xs">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold">{city}</span>
        <span className="text-2xl" aria-hidden="true">
          {iconFor(conditions)}
        </span>
      </div>
      <div className="space-y-0.5">
        <div className="text-xl font-semibold">{temperature}</div>
        <div className="text-gray-600">{conditions}</div>
        <div className="text-sm text-gray-500">
          H: {high} · L: {low}
        </div>
      </div>
    </div>
  );
}
