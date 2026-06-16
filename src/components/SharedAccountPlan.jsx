import { useMemo, useState } from 'react';
import {
  completePlanItem,
  createInitialAccountPlan,
  summarizePlanChange,
} from '../agent/workshopAgent.js';

export default function SharedAccountPlan({ account }) {
  const initialPlan = useMemo(() => createInitialAccountPlan(account), [account]);
  const [previousPlan, setPreviousPlan] = useState(initialPlan);
  const [plan, setPlan] = useState(initialPlan);

  function handleComplete(itemId) {
    setPreviousPlan(plan);
    setPlan((currentPlan) => completePlanItem(currentPlan, itemId));
  }

  return (
    <section className="shared-state-grid" aria-label="L6 shared account plan">
      <article className="panel">
        <span className="eyebrow">Shared state</span>
        <h3>{plan.account} account plan</h3>
        <ul className="plan-list">
          {plan.items.map((item) => (
            <li key={item.id} className={item.done ? 'is-done' : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => handleComplete(item.id)}
                />
                <span>{item.label}</span>
              </label>
              <small>{item.owner}</small>
            </li>
          ))}
        </ul>
      </article>

      <article className="panel">
        <span className="eyebrow">Agent reads same state</span>
        <h3>What changed?</h3>
        <p>{summarizePlanChange(previousPlan, plan)}</p>
        <h3>Email draft</h3>
        <pre>{plan.emailDraft}</pre>
      </article>
    </section>
  );
}
