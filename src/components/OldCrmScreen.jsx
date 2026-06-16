import MetricCard from './MetricCard.jsx';
import { formatCurrency } from '../agent/workshopAgent.js';

export default function OldCrmScreen({ account }) {
  return (
    <section className="crm-screen" aria-label="Old CRM baseline">
      <div className="crm-toolbar">
        <div>
          <span className="eyebrow">Account record</span>
          <h2>{account.name}</h2>
        </div>
        <div className="toolbar-actions">
          <button type="button">Reports</button>
          <button type="button">Tasks</button>
          <button type="button">Email</button>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard label="ARR" value={formatCurrency(account.arr)} detail={account.stage} />
        <MetricCard label="Q3 revenue" value={formatCurrency(account.q3Revenue)} tone="warning" detail="Down from Q2" />
        <MetricCard label="Health" value={account.health} tone="danger" detail={account.renewalDate} />
      </div>

      <div className="crm-grid">
        <div className="panel">
          <h3>Opportunities</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Stage</th>
              </tr>
            </thead>
            <tbody>
              {account.opportunities.map((opportunity) => (
                <tr key={opportunity.name}>
                  <td>{opportunity.name}</td>
                  <td>{formatCurrency(opportunity.amount)}</td>
                  <td>{opportunity.stage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h3>Notes</h3>
          <ul className="stack-list">
            {account.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h3>Tasks</h3>
          <ul className="stack-list">
            {account.tasks.map((task) => (
              <li key={task.id}>
                <span>{task.label}</span>
                <small>{task.owner}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
