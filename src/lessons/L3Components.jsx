import { createL3Cards } from '../agent/workshopAgent.js';
import AgentCards from '../components/AgentCards.jsx';

export default function L3Components({ account, prompt }) {
  const cards = createL3Cards(account);

  return (
    <div className="lesson-layout">
      <section className="lesson-copy">
        <span className="eyebrow">L3 Components as Tools</span>
        <h2>Your design system becomes callable</h2>
        <p>
          The agent selects approved CRM components: account brief, deal risk,
          follow-up email, and revenue delta.
        </p>
        <div className="prompt-chip">{prompt}</div>
      </section>
      <AgentCards cards={cards} />
    </div>
  );
}
