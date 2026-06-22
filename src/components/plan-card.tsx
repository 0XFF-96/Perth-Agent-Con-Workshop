import { z } from "zod";

export const PlanCardProps = z.object({
  goal: z.string().default(""),
  steps: z
    .array(
      z.object({
        title: z.string().default(""),
        detail: z.string().default(""),
      }),
    )
    .default([]),
});

export function PlanCard({ goal = "", steps = [] }: z.infer<typeof PlanCardProps>) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, maxWidth: 560 }}>
      <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "#6d28d9", fontWeight: 700 }}>
        Plan · review before it runs
      </div>
      <h3 style={{ margin: "4px 0 12px" }}>{goal || "Proposed plan"}</h3>
      <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map((s, i) => (
          <li key={i}>
            <strong>{s.title}</strong>
            {s.detail ? <span style={{ color: "#6b7280" }}> — {s.detail}</span> : null}
          </li>
        ))}
      </ol>
      <p style={{ marginTop: 12, fontSize: 13, color: "#374151" }}>
        Type <strong>approve</strong> to run this, or <strong>reject</strong> to cancel.
      </p>
    </div>
  );
}
