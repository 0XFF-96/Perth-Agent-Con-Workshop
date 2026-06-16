import SharedAccountPlan from '../components/SharedAccountPlan.jsx';

export default function L6SharedState({ account, prompt }) {
  return (
    <div className="lesson-layout">
      <section className="lesson-copy">
        <span className="eyebrow">L6 Shared State</span>
        <h2>The agent and user work on the same account plan</h2>
        <p>
          Check an item manually. The agent summary reads the same state and
          explains what changed.
        </p>
        <div className="prompt-chip">{prompt}</div>
      </section>
      <SharedAccountPlan account={account} />
    </div>
  );
}
