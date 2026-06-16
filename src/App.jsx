import { useState } from 'react';
import { acmeAccount, repeatedPrompt } from './data/crmData.js';
import OldSoftware from './lessons/OldSoftware.jsx';
import L2PlainChat from './lessons/L2PlainChat.jsx';
import L3Components from './lessons/L3Components.jsx';
import L4Compose from './lessons/L4Compose.jsx';
import L5Tools from './lessons/L5Tools.jsx';
import L6SharedState from './lessons/L6SharedState.jsx';

const tabs = [
  { id: 'old', label: 'Old Software', component: OldSoftware },
  { id: 'l2', label: 'L2 Chat', component: L2PlainChat },
  { id: 'l3', label: 'L3 Components', component: L3Components },
  { id: 'l4', label: 'L4 Compose', component: L4Compose },
  { id: 'l5', label: 'L5 Tools', component: L5Tools },
  { id: 'l6', label: 'L6 Shared State', component: L6SharedState },
];

export default function App() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const ActiveLesson = tabs.find((tab) => tab.id === activeTab).component;

  return (
    <main className="app-shell">
      <header className="hero">
        <span className="eyebrow">AgentCon Perth workshop proof object</span>
        <h1>Agentic CRM Workshop Demo</h1>
        <p>Same user intent. Different placement.</p>
      </header>

      <nav className="tab-bar" aria-label="Workshop sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? 'is-active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <ActiveLesson account={acmeAccount} prompt={repeatedPrompt} />
    </main>
  );
}
