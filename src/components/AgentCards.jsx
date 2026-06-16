export function AccountBriefCard({ card }) {
  return (
    <article className="agent-card">
      <span className="eyebrow">L3 component</span>
      <h3>{card.title}</h3>
      <p>{card.detail}</p>
      <strong className="status-chip">{card.status}</strong>
    </article>
  );
}

export function DealRiskCard({ card }) {
  return (
    <article className="agent-card agent-card--risk">
      <span className="eyebrow">L3 component</span>
      <h3>{card.title}</h3>
      <ul className="stack-list">
        {card.risks.map((risk) => (
          <li key={risk}>{risk}</li>
        ))}
      </ul>
    </article>
  );
}

export function FollowUpEmailCard({ card }) {
  return (
    <article className="agent-card">
      <span className="eyebrow">L3 component</span>
      <h3>{card.subject}</h3>
      <p>{card.body}</p>
      <button type="button">Copy draft</button>
    </article>
  );
}

export function RevenueDeltaCard({ card }) {
  const tone = card.value < 0 ? 'danger' : 'success';
  return (
    <article className={`agent-card agent-card--${tone}`}>
      <span className="eyebrow">L3 component</span>
      <h3>{card.title}</h3>
      <strong className="delta-value">{card.value}%</strong>
      <p>{card.label}</p>
    </article>
  );
}

export default function AgentCards({ cards }) {
  return (
    <div className="agent-card-grid">
      {cards.map((card) => {
        if (card.type === 'accountBrief') return <AccountBriefCard key={card.type} card={card} />;
        if (card.type === 'dealRisk') return <DealRiskCard key={card.type} card={card} />;
        if (card.type === 'followUpEmail') return <FollowUpEmailCard key={card.type} card={card} />;
        if (card.type === 'revenueDelta') return <RevenueDeltaCard key={card.type} card={card} />;
        return null;
      })}
    </div>
  );
}
