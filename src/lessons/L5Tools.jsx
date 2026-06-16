import ToolRouter from '../components/ToolRouter.jsx';

export default function L5Tools({ account, prompt }) {
  return (
    <div className="lesson-layout">
      <section className="lesson-copy">
        <span className="eyebrow">L5 Route to Tools</span>
        <h2>The agent opens the right tool-shaped surface</h2>
        <p>
          Instead of building every interface, the agent routes the CRM workflow
          into a call notes editor and revenue explorer.
        </p>
        <div className="prompt-chip">{prompt}</div>
      </section>
      <ToolRouter account={account} />
    </div>
  );
}
