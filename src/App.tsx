import { useState } from "react";
import type { ReactElement } from "react";
import L2PlainChat from "@/lessons/L2PlainChat";
import L3Components from "@/lessons/L3Components";
import L4Declarative from "@/lessons/L4Declarative";

type Tab = { id: string; label: string; render: () => ReactElement };

const tabs: Tab[] = [
  { id: "l2", label: "L2 Chat", render: () => <L2PlainChat /> },
  { id: "l3", label: "L3 Components", render: () => <L3Components /> },
  { id: "l4", label: "L4 Declarative", render: () => <L4Declarative /> },
];

export default function App() {
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Agentic Generative-UI Workshop</h1>
        <p>Same intent, different placement — L2 → L6.</p>
      </header>
      <nav className="tab-bar" aria-label="Workshop levels">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={t.id === active ? "is-active" : ""}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {current.render()}
    </main>
  );
}
