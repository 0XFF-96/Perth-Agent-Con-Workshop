import { describe, expect, it } from 'vitest';
import { acmeAccount } from '../data/crmData';
import {
  createL2Response,
  createL3Cards,
  createL4Layout,
  createInitialAccountPlan,
  completePlanItem,
  summarizePlanChange,
} from './workshopAgent';

describe('workshopAgent', () => {
  it('creates a text-only L2 response for the repeated CRM intent', () => {
    const response = createL2Response(acmeAccount);
    expect(response.title).toBe('Text-only CRM advice');
    expect(response.body).toContain('Acme Corp');
    expect(response.body).toContain('Q3');
  });

  it('selects predictable L3 CRM cards from the same account context', () => {
    const cards = createL3Cards(acmeAccount);
    expect(cards.map((card) => card.type)).toEqual([
      'accountBrief',
      'dealRisk',
      'followUpEmail',
      'revenueDelta',
    ]);
  });

  it('creates an L4 workspace schema from CRM primitives', () => {
    const layout = createL4Layout(acmeAccount);
    expect(layout.type).toBe('workspace');
    expect(layout.children.map((child) => child.type)).toContain('kpiRow');
    expect(layout.children.map((child) => child.type)).toContain('taskTable');
  });

  it('tracks shared-state changes in the L6 account plan', () => {
    const plan = createInitialAccountPlan(acmeAccount);
    const updated = completePlanItem(plan, plan.items[0].id);
    expect(updated.items[0].done).toBe(true);
    expect(summarizePlanChange(plan, updated)).toContain(plan.items[0].label);
  });
});
