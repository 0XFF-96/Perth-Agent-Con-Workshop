// Pure, I/O-free logic for WorkMate — the Makefile-driven workshop progress
// system. Unit-tested via node:test (see workmate-logic.test.mjs). All evidence
// probes and file I/O live in scripts/workmate.mjs; this module is deterministic.

/**
 * The ten workshop stages, in order. `kind` is how "done" is decided:
 *   'self'     — the learner ticks it (`make tick-<id>`), stored in the progress file.
 *   'evidence' — proven by a probe in workmate.mjs (cannot be faked by a checkbox).
 */
export const STAGES = [
  {
    id: 'env',
    title: 'Set your API key in .env',
    kind: 'evidence',
    guide: 'Copy .env.example to .env and add OPENAI_API_KEY (or ANTHROPIC_API_KEY).',
  },
  {
    id: 'deps',
    title: 'Install dependencies',
    kind: 'evidence',
    guide: 'Run: make install',
  },
  {
    id: 'agent',
    title: 'Have an agent harness ready',
    kind: 'evidence',
    guide: 'Run: make setup-pi  (or use Claude Code).',
  },
  {
    id: 'app',
    title: 'Boot the app',
    kind: 'evidence',
    guide: 'Run: make dev  (or /skill:run). Vite :5173 + runtime :4000.',
  },
  {
    id: 'l2',
    title: 'Try L2 plain chat',
    kind: 'self',
    guide: "In the L2 tab, send: Summarize the last quarter's metrics.",
  },
  {
    id: 'l3',
    title: 'Do the L3 hands-on (edit the flightCard desc)',
    kind: 'evidence',
    guide:
      "In src/lessons/L3Components.tsx change the flightCard description to 'Only call this for international flights.', save, re-send the SFO->JFK prompt.",
  },
  {
    id: 'l4',
    title: 'Try L4 declarative dashboard',
    kind: 'self',
    guide:
      'In the L4 tab, send: Show me a sales dashboard with total revenue, new customers, and conversion rate metrics.',
  },
  {
    id: 'extend',
    title: 'Explore the Extend tab',
    kind: 'self',
    guide: "Open the 🪁 Extend tab; try 'Flag my at-risk Q3 accounts', then type approve.",
  },
  {
    id: 'verify',
    title: 'Pass the quality gate',
    kind: 'evidence',
    guide: 'Run: make verify',
  },
  {
    id: 'capstone',
    title: 'Write your decision sentence',
    kind: 'self',
    guide: "Write one sentence: 'Feature X in my product should be L__ because ___.'",
  },
];

/** Self-report (tickable) stage ids, in order. */
export const SELF_REPORT_STEPS = ['l2', 'l4', 'extend', 'capstone'];

/** True if `id` is one of the ten stage ids. */
export function isValidStep(id) {
  return STAGES.some((s) => s.id === id);
}

/** True if `id` is a self-report (learner-tickable) stage. */
export function isSelfReportStep(id) {
  return SELF_REPORT_STEPS.includes(id);
}

/**
 * Summarise progress over the ten stages.
 * @param {Record<string, unknown>} doneMap — id → truthy when that stage is done.
 * @returns {{ done: number, total: number, percent: number, currentIndex: number }}
 *   `percent` is 0–100 (integer). `currentIndex` is the index of the first
 *   not-done stage, or `total` when every stage is done.
 */
export function computeProgress(doneMap = {}) {
  const total = STAGES.length;
  const done = STAGES.filter((s) => Boolean(doneMap?.[s.id])).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const firstNotDone = STAGES.findIndex((s) => !doneMap?.[s.id]);
  const currentIndex = firstNotDone === -1 ? total : firstNotDone;
  return { done, total, percent, currentIndex };
}

/**
 * The first not-done stage object, or null when all stages are done.
 * @param {Record<string, unknown>} doneMap
 */
export function nextStage(doneMap = {}) {
  return STAGES.find((s) => !doneMap?.[s.id]) ?? null;
}

/**
 * Render a plain-text checklist for the terminal — one line per stage, a
 * progress bar, and a "current step" hint. No hard ANSI dependency.
 * @param {Record<string, unknown>} doneMap
 * @returns {string}
 */
export function renderChecklist(doneMap = {}) {
  const { done, total, percent, currentIndex } = computeProgress(doneMap);

  const lines = STAGES.map((stage, i) => {
    let marker;
    if (doneMap?.[stage.id]) marker = '✓';
    else if (i === currentIndex) marker = '→';
    else marker = '○';
    return `${marker} ${stage.title}`;
  });

  const filled = '#'.repeat(done);
  const empty = '-'.repeat(total - done);
  const bar = `[${filled}${empty}] ${done}/${total} (${percent}%)`;

  const allDone = currentIndex >= total;
  const footer = allDone
    ? '🎉 All 10 stages complete!'
    : `Current: ${STAGES[currentIndex].title} — ${STAGES[currentIndex].guide}`;

  return [...lines, '', bar, footer].join('\n');
}
