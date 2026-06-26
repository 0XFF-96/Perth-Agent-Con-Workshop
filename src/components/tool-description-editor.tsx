type Preset = { label: string; value: string };

type ToolDescriptionEditorProps = {
  toolName?: string;
  value?: string;
  presets?: Preset[];
  onChange?: (value: string) => void;
};

// The L3 "behavioral design" knob: a tool's description is what the model reads
// to decide WHEN to call it. Editing this sentence live re-registers the tool
// (see L3Components) and changes the agent's behavior.
export function ToolDescriptionEditor({
  toolName = "flightCard",
  value = "",
  presets = [],
  onChange = () => {},
}: ToolDescriptionEditorProps) {
  const panel: React.CSSProperties = {
    border: "1px solid var(--line)",
    borderRadius: 12,
    background: "var(--surface)",
    padding: 16,
    margin: "0 24px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };

  return (
    <div style={panel}>
      <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)" }}>
        Tool definition
      </div>
      <div style={{ fontWeight: 600, color: "var(--accent)" }}>🛢 {toolName}</div>

      <label style={{ fontSize: 12, color: "var(--muted)" }}>description ↓ change this one sentence</label>
      <textarea
        aria-label={`${toolName} description`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        style={{
          width: "100%",
          resize: "vertical",
          border: "1px solid var(--line)",
          borderRadius: 8,
          padding: 10,
          font: "inherit",
          fontSize: 14,
        }}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {presets.map((p) => {
          const active = value === p.value;
          return (
            <button
              key={p.label}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(p.value)}
              style={{
                border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                background: active ? "var(--accent)" : "var(--surface)",
                color: active ? "#fff" : "var(--text)",
                borderRadius: 16,
                padding: "6px 12px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 12, color: "var(--muted)" }}>
        The description isn’t documentation — <strong>it’s behavioral design.</strong>
      </div>
    </div>
  );
}
