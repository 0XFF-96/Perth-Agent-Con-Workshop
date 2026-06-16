import OldCrmScreen from '../components/OldCrmScreen.jsx';

export default function OldSoftware({ account, prompt }) {
  return (
    <div className="lesson-layout">
      <section className="lesson-copy">
        <span className="eyebrow">Baseline</span>
        <h2>Old software: the user operates the system</h2>
        <p>
          The account data is all here, but the user has to translate the intent
          into navigation, inspection, decisions, and manual updates.
        </p>
        <div className="prompt-chip">{prompt}</div>
      </section>
      <OldCrmScreen account={account} />
    </div>
  );
}
