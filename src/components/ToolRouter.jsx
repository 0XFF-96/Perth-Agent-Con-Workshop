import { formatCurrency } from '../agent/workshopAgent.js';

export default function ToolRouter({ account }) {
  return (
    <section className="tool-grid" aria-label="L5 routed tools">
      <article className="tool-surface">
        <span className="eyebrow">Opened tool</span>
        <h3>Call notes editor</h3>
        <textarea
          defaultValue={`Renewal call prep for ${account.name}\n\n- Lead with APAC usage drop\n- Attach SSO evidence\n- Ask Priya to confirm executive sponsor\n- Align discount rationale with finance`}
          aria-label="Call notes editor"
        />
      </article>

      <article className="tool-surface">
        <span className="eyebrow">Opened tool</span>
        <h3>Revenue explorer</h3>
        <table>
          <thead>
            <tr>
              <th>Region</th>
              <th>Q3 revenue</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {account.regions.map((region) => (
              <tr key={region.name}>
                <td>{region.name}</td>
                <td>{formatCurrency(region.revenue)}</td>
                <td>{region.delta > 0 ? '+' : ''}{region.delta}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
