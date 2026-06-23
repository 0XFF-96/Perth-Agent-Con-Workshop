import { z } from "zod";

export const PlanResultProps = z.object({
  status: z.enum(["done", "cancelled"]).default("done"),
  summary: z.string().default(""),
});

export function PlanResult({ status = "done", summary = "" }: Partial<z.infer<typeof PlanResultProps>>) {
  const cancelled = status === "cancelled";
  return (
    <div
      style={{
        border: `1px solid ${cancelled ? "#f0d9d2" : "#cfe5d6"}`,
        background: cancelled ? "#fdf4f2" : "#eef6f0",
        borderRadius: 12,
        padding: 16,
        maxWidth: 560,
      }}
    >
      <strong>{cancelled ? "Plan cancelled" : "Plan executed"}</strong>
      <p style={{ margin: "6px 0 0", color: "#374151" }}>
        {summary || (cancelled ? "No changes made." : "Done.")}
      </p>
    </div>
  );
}
