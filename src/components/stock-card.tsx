import { z } from "zod";

export const StockCardProps = z.object({
  symbol: z.string().describe("Ticker symbol, e.g. AAPL"),
  company: z.string().describe("Company name"),
  price: z.string().describe("Current price display, e.g. $189.21"),
  change: z.string().describe("Absolute change, e.g. +1.34 or -2.10"),
  change_percent: z.string().describe("Percent change, e.g. +0.71% or -1.10%"),
});

type StockCardProps = z.infer<typeof StockCardProps>;

// Treat the stock as "up" unless the change clearly starts with a minus sign.
// `change` may arrive empty/partial during streaming, so guard before reading it.
function isDown(change: string) {
  return change.trim().startsWith("-");
}

export function StockCard({
  symbol,
  company,
  price,
  change = "",
  change_percent = "",
}: StockCardProps) {
  const down = isDown(change);
  const color = down ? "#ef4444" : "#10b981";
  const arrow = down ? "▼" : "▲";
  return (
    <div className="rounded-lg border bg-white p-3 space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="font-semibold">{symbol}</span>
        <span className="text-sm text-gray-500">{company}</span>
      </div>
      <div className="rounded border p-2 text-sm">
        <div className="text-lg font-semibold">{price}</div>
        <div style={{ color }}>
          {arrow} {change} ({change_percent})
        </div>
      </div>
    </div>
  );
}
