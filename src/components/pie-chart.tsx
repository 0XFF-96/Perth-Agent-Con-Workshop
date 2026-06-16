import { z } from "zod";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export const PieChartProps = z.object({
  title: z.string().describe("Chart title"),
  slices: z
    .array(
      z.object({
        label: z.string().describe("Slice label"),
        value: z.number().describe("Slice value"),
      }),
    )
    .describe("The pie slices to display"),
});

type PieChartProps = z.infer<typeof PieChartProps>;

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#6b7280"];

export function PieChart({ title, slices }: PieChartProps) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="font-semibold">{title}</div>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <RePieChart>
            <Pie data={slices} dataKey="value" nameKey="label" outerRadius={80}>
              {slices.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </RePieChart>
        </ResponsiveContainer>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13 }}>
        {slices.map((s, i) => (
          <li key={s.label} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span
              aria-hidden="true"
              style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length] }}
            />
            <span>{s.label}</span>
            <span>— {s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
