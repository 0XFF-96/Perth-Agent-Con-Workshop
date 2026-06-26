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
    title: 'Do the L3 hands-on (toggle the flightCard description)',
    kind: 'self',
    guide:
      "In the L3 tab, click the '…only international' chip, re-send the SFO->JFK prompt, and watch the agent decline to render the card. Then: make tick STEP=l3.",
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
export const SELF_REPORT_STEPS = ['l2', 'l3', 'l4', 'extend', 'capstone'];

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

/** ANSI styling codes — used only when callers opt into color. */
export const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/** Wrap `s` in the given ANSI `codes` when `enabled`, else return it unchanged. */
export function paint(s, codes = [], enabled = true) {
  return enabled && codes.length ? `${codes.join('')}${s}${ANSI.reset}` : s;
}

/**
 * Render a checklist for the terminal — one line per stage, a progress bar, and
 * a "current step" hint. Plain text by default (deterministic + testable); pass
 * `{ color: true }` to wrap markers, the bar, and the footer in ANSI styling.
 * @param {Record<string, unknown>} doneMap
 * @param {{ color?: boolean }} [opts]
 * @returns {string}
 */
export function renderChecklist(doneMap = {}, { color = false } = {}) {
  const { done, total, percent, currentIndex } = computeProgress(doneMap);
  const c = (s, ...codes) => paint(s, codes, color);

  const lines = STAGES.map((stage, i) => {
    const label = `Step ${i + 1}: ${stage.title}`;
    if (doneMap?.[stage.id]) return `${c('✓', ANSI.green)} ${c(label, ANSI.dim)}`;
    if (i === currentIndex) return `${c('→', ANSI.cyan, ANSI.bold)} ${c(label, ANSI.bold)}`;
    return `${c('○', ANSI.gray)} ${c(label, ANSI.gray)}`;
  });

  const filled = c('█'.repeat(done), ANSI.green);
  const empty = c('░'.repeat(total - done), ANSI.dim);
  const bar = `[${filled}${empty}] ${c(`${done}/${total}`, ANSI.bold)} (${percent}%)`;

  const allDone = currentIndex >= total;
  const footer = allDone
    ? c('🎉 All 10 stages complete!', ANSI.green, ANSI.bold)
    : `${c('Current:', ANSI.yellow, ANSI.bold)} ${STAGES[currentIndex].title} — ${c(STAGES[currentIndex].guide, ANSI.dim)}`;

  return [...lines, '', bar, footer].join('\n');
}
