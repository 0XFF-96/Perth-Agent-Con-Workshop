import { z } from "zod";

export const WeatherCardProps = z.object({
  city: z.string().describe("City name"),
  temperature: z.number().describe("Current temperature in degrees"),
  condition: z.string().describe("Weather condition emoji (e.g. ☀️, 🌧️, ⛅, ❄️)"),
});

type WeatherCardProps = z.infer<typeof WeatherCardProps>;

export function WeatherCard({
  city = "Unknown",
  temperature = 0,
  condition = "❓",
}: WeatherCardProps) {
  return (
    <div className="rounded-lg border bg-white p-3 space-y-2">
      <div className="font-semibold">{city}</div>
      <div className="rounded border p-2 text-sm">
        <div className="text-2xl">{condition}</div>
        <div className="text-lg font-medium">
          {temperature}°C
        </div>
        <div className="text-gray-500">{condition === "☀️" ? "Sunny" : condition === "🌧️" ? "Rainy" : condition === "⛅" ? "Cloudy" : condition === "❄️" ? "Snowy" : "Unknown"}</div>
      </div>
    </div>
  );
}
