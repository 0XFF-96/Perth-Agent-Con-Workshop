import { formatCurrency } from '../agent/workshopAgent.js';
import MetricCard from './MetricCard.jsx';

function RegionChart({ regions }) {
  const maxRevenue = Math.max(...regions.map((region) => region.revenue));

  return (
    <div className="region-chart">
      {regions.map((region) => (
        <div key={region.name} className="region-row">
          <span>{region.name}</span>
          <div className="bar-track">
            <div
              className={region.delta < 0 ? 'bar bar--danger' : 'bar'}
              style={{ width: `${Math.max(16, (region.revenue / maxRevenue) * 100)}%` }}
            />
          </div>
          <strong>{formatCurrency(region.revenue)}</strong>
          <small>{region.delta > 0 ? '+' : ''}{region.delta}%</small>
        </div>
      ))}
    </div>
  );
}

export default function ComposableWorkspace({ layout }) {
  return (
    <section className="workspace-panel" aria-label="L4 composed workspace">
      <div className="workspace-header">
        <span className="eyebrow">Agent-generated schema</span>
        <h2>{layout.title}</h2>
      </div>

      {layout.children.map((node) => {
        if (node.type === 'kpiRow') {
          return (
            <div key={node.type} className="metric-grid">
              {node.items.map((item) => (
                <MetricCard key={item.label} {...item} />
              ))}
            </div>
          );
        }

        if (node.type === 'insightPanel') {
          return (
            <article key={node.type} className="panel panel--accent">
              <h3>{node.title}</h3>
              <p>{node.body}</p>
            </article>
          );
        }

        if (node.type === 'regionChart') {
          return (
            <article key={node.type} className="panel">
              <h3>{node.title}</h3>
              <RegionChart regions={node.regions} />
            </article>
          );
        }

        if (node.type === 'taskTable') {
          return (
            <article key={node.type} className="panel">
              <h3>{node.title}</h3>
              <ul className="stack-list">
                {node.tasks.map((task) => (
                  <li key={task.id}>
                    <span>{task.label}</span>
                    <small>{task.owner}</small>
                  </li>
                ))}
              </ul>
            </article>
          );
        }

        return null;
      })}
    </section>
  );
}
