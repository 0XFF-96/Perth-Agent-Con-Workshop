import { useState } from "react";
import type { ReactElement } from "react";
import L2PlainChat from "@/lessons/L2PlainChat";

type Tab = { id: string; label: string; render: () => ReactElement };

const tabs: Tab[] = [
  { id: "l2", label: "L2 Chat", render: () => <L2PlainChat /> },
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
