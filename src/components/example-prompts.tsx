type ExamplePromptsProps = { prompts: string[] };

export function ExamplePrompts({ prompts }: ExamplePromptsProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "0 24px 12px" }}>
      {prompts.map((p) => (
        <code
          key={p}
          style={{
            background: "#f3f4f6",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: "6px 12px",
            fontSize: 13,
          }}
        >
          {p}
        </code>
      ))}
    </div>
  );
}
