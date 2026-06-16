# CRM Agentic Workshop Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable local React workshop demo that shows one old CRM workflow transformed through Old Software, L2, L3, L4, L5, and L6 agentic UI placements.

**Architecture:** The demo is a Vite React app with deterministic browser-side agent behavior so it works on stage without API keys or network calls. Shared CRM data lives in focused data and helper modules; tabs render each workshop level with reusable CRM UI components.

**Tech Stack:** React, Vite, Vitest, Testing Library, CSS modules via plain CSS.

---

## File Structure

- Create `package.json`: npm scripts and dependencies.
- Create `index.html`, `src/main.jsx`: Vite app entrypoint.
- Create `src/App.jsx`: tab shell and workshop framing.
- Create `src/styles.css`: full app visual system.
- Create `src/data/crmData.js`: Acme CRM seed data.
- Create `src/agent/workshopAgent.js`: deterministic agent responses, L3 component selection, L4 layout schema, L6 state helpers.
- Create `src/agent/workshopAgent.test.js`: behavior tests.
- Create `src/components/`: shared CRM cards, charts, old CRM screen, tool surfaces.
- Create `src/lessons/`: Old Software and L2-L6 tab screens.

## Task 1: Scaffold React App And Agent Tests

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/data/crmData.js`
- Create: `src/agent/workshopAgent.js`
- Test: `src/agent/workshopAgent.test.js`

- [ ] **Step 1: Write failing agent behavior tests**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/agent/workshopAgent.test.js`

Expected: command fails because the project and modules do not exist yet.

- [ ] **Step 3: Create minimal project files and agent helpers**

Create Vite/React project files, CRM seed data, and deterministic agent helpers that satisfy the tests.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/agent/workshopAgent.test.js`

Expected: all four tests pass.

## Task 2: Build Old Software, L2, And L3 Screens

**Files:**
- Create: `src/components/OldCrmScreen.jsx`
- Create: `src/components/MetricCard.jsx`
- Create: `src/components/AgentCards.jsx`
- Create: `src/lessons/OldSoftware.jsx`
- Create: `src/lessons/L2PlainChat.jsx`
- Create: `src/lessons/L3Components.jsx`
- Modify: `src/App.jsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Add component rendering test**

Add a test that renders the app and verifies the Old Software, L2, and L3 tabs exist.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/App.test.jsx`

Expected: fail because the UI components do not exist yet.

- [ ] **Step 3: Implement the three screens**

Build an Old CRM baseline screen, a text-only chat panel, and L3 cards for Account Brief, Deal Risk, Follow-Up Email, and Revenue Delta.

- [ ] **Step 4: Run tests**

Run: `npm test -- --run`

Expected: all tests pass.

## Task 3: Build L4, L5, And L6 Screens

**Files:**
- Create: `src/components/ComposableWorkspace.jsx`
- Create: `src/components/ToolRouter.jsx`
- Create: `src/components/SharedAccountPlan.jsx`
- Create: `src/lessons/L4Compose.jsx`
- Create: `src/lessons/L5Tools.jsx`
- Create: `src/lessons/L6SharedState.jsx`
- Modify: `src/App.jsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Add rendering tests for L4-L6 tab labels**

Extend the app test to verify the L4, L5, and L6 tabs are present and that the repeated prompt is visible.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/App.test.jsx`

Expected: fail because L4-L6 screens do not exist yet.

- [ ] **Step 3: Implement L4-L6**

Build the composed workspace from schema, routed tool surfaces for call notes and revenue explorer, and a shared account plan where user edits are summarized by the agent helper.

- [ ] **Step 4: Run tests**

Run: `npm test -- --run`

Expected: all tests pass.

## Task 4: Verify Stage Readiness

**Files:**
- Modify: `README.md`
- Modify: `docs/presentation/agentic-workshop-slide-doc.md` if paths need correction.

- [ ] **Step 1: Run production build**

Run: `npm run build`

Expected: Vite build succeeds.

- [ ] **Step 2: Start local server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: local URL is printed.

- [ ] **Step 3: Browser QA**

Open the app, click each tab, verify the repeated prompt and CRM story are visible, and check mobile/desktop layout.

- [ ] **Step 4: Final test**

Run: `npm test -- --run`

Expected: all tests pass.
