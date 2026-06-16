import { createL4Layout } from '../agent/workshopAgent.js';
import ComposableWorkspace from '../components/ComposableWorkspace.jsx';

export default function L4Compose({ account, prompt }) {
  const layout = createL4Layout(account);

  return (
    <div className="lesson-layout">
      <section className="lesson-copy">
        <span className="eyebrow">L4 Catalog + Composition</span>
        <h2>The agent assembles a workspace from approved primitives</h2>
        <p>
          This screen is rendered from a schema: KPI row, insight panel, region
          chart, and task table.
        </p>
        <div className="prompt-chip">{prompt}</div>
      </section>
      <ComposableWorkspace layout={layout} />
    </div>
  );
}
