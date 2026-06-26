#!/usr/bin/env node
// WorkMate — the Makefile-driven, agent-operable progress companion for the
// workshop learner. Confirms each step with evidence where possible (so it
// can't be faked by a checkbox), surfaces "which stage am I at", and guides the
// next move. All pure decisions live in ./workmate-logic.mjs; this file holds
// the impure evidence probes, the progress-file I/O, and the CLI.
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { connect } from 'node:net';
import { createHash } from 'node:crypto';
import { hasKey } from './setup-logic.mjs';
import {
  STAGES,
  SELF_REPORT_STEPS,
  isValidStep,
  isSelfReportStep,
  nextStage,
  computeProgress,
  renderChecklist,
  ANSI,
  paint,
} from './workmate-logic.mjs';

const PROGRESS_FILE = '.workmate-progress.json';

// Color only on a real terminal, and honor the NO_COLOR convention.
const USE_COLOR = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const paintC = (s, ...codes) => paint(s, codes, USE_COLOR);


// ── progress file (tolerant: missing/corrupt → {}) ────────────────────────────

/** Read the progress file, returning {} on missing or corrupt JSON. */
function readProgress() {
  if (!existsSync(PROGRESS_FILE)) return {};
  try {
    const parsed = JSON.parse(readFileSync(PROGRESS_FILE, 'utf8'));
    // Must be a plain object: an array also satisfies `typeof === 'object'` but
    // silently drops string-keyed ticks on write, so reject it.
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/** Write the progress object back as pretty JSON. */
function writeProgress(progress) {
  writeFileSync(PROGRESS_FILE, `${JSON.stringify(progress, null, 2)}\n`);
}

// ── evidence probes ───────────────────────────────────────────────────────────

/** env: a key set in the process env, or a non-empty key in .env. */
function probeEnv() {
  if (process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY) return true;
  try {
    return hasKey(readFileSync('.env', 'utf8'));
  } catch {
    return false;
  }
}

/** deps: node_modules present. */
function probeDeps() {
  return existsSync('node_modules');
}

/** agent: `pi` on PATH, or running inside Claude Code (CLAUDECODE set). */
function probeAgent() {
  if (process.env.CLAUDECODE) return true;
  const r = spawnSync('sh', ['-c', 'command -v pi'], { stdio: 'ignore' });
  return r.status === 0;
}

/** Resolve true if a TCP connection to the port succeeds within the timeout. */
function canConnect(port, host = '127.0.0.1', timeoutMs = 600) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (ok) => {
      if (settled) return;
      settled = true;
      try {
        socket.destroy();
      } catch {
        /* ignore */
      }
      resolve(ok);
    };
    const socket = connect({ port, host });
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

/**
 * True if the port accepts TCP on either loopback stack. Vite often binds
 * IPv6-only (`[::1]`) on macOS while the runtime binds both, so probing only
 * 127.0.0.1 gives a false "not booted". Try IPv4 and IPv6.
 */
async function canConnectLoopback(port) {
  const [v4, v6] = await Promise.all([canConnect(port, '127.0.0.1'), canConnect(port, '::1')]);
  return v4 || v6;
}

/** app: both the Vite dev server (:5173) and the runtime (:4000) accept TCP. */
async function probeApp() {
  const [web, api] = await Promise.all([canConnectLoopback(5173), canConnectLoopback(4000)]);
  return web && api;
}

// ── working-tree fingerprint (verify) ─────────────────────────────────────────

/**
 * A content fingerprint of the working tree: HEAD commit + a hash of the
 * tracked-file diff (`git diff HEAD`) and the untracked/changed path list
 * (`git status --porcelain`). Editing any tracked file changes the diff — so a
 * stale verify stamp is invalidated even when the tree was already dirty
 * (a boolean dirty flag would miss that). Reverting to the verified state
 * restores the fingerprint, which is the intended behaviour.
 */
function workingTreeFingerprint() {
  const head = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });
  const status = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
  const diff = spawnSync('git', ['diff', 'HEAD'], { encoding: 'utf8' });
  const commit = head.status === 0 ? head.stdout.trim() : 'no-head';
  const material = `${status.stdout ?? ''}\0${diff.stdout ?? ''}`;
  const treeHash = createHash('sha256').update(material).digest('hex').slice(0, 12);
  return `${commit}:${treeHash}`;
}

/** verify: the stored stamp's fingerprint matches the tree right now. */
function probeVerify(progress) {
  const stamp = progress?.verify;
  if (!stamp || typeof stamp !== 'object' || !stamp.fingerprint) return false;
  return stamp.fingerprint === workingTreeFingerprint();
}

// ── doneMap ───────────────────────────────────────────────────────────────────

/** Build the id→done map across all ten stages from probes + the progress file. */
async function buildDoneMap(progress) {
  const app = await probeApp();
  return {
    env: probeEnv(),
    deps: probeDeps(),
    agent: probeAgent(),
    app,
    l2: Boolean(progress.l2),
    l3: Boolean(progress.l3),
    l4: Boolean(progress.l4),
    extend: Boolean(progress.extend),
    verify: probeVerify(progress),
    capstone: Boolean(progress.capstone),
  };
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const BANNER = 'WorkMate · AgentCon workshop companion';

const USAGE = `${BANNER}

Usage: node scripts/workmate.mjs <command>

  status          Show the checklist + progress bar + current step
  next            Print the next not-done stage (title + guide)
  tick <id>       Mark a self-report stage done (${SELF_REPORT_STEPS.join(', ')}); 'verify' records a fingerprint
  untick <id>     Clear a previously-ticked stage
  reset           Clear all saved progress
  json            Machine-readable progress (for agents)
  workmate        Banner + status + next (default)

Evidence stages (env, deps, agent, app, l3) are proven automatically — they
can't be ticked by hand.`;

function cmdStatus(doneMap) {
  console.log(renderChecklist(doneMap, { color: USE_COLOR }));
}

function cmdNext(doneMap) {
  const stage = nextStage(doneMap);
  if (!stage) {
    console.log(paintC('🎉 All 10 stages complete! Nothing left to do.', ANSI.green, ANSI.bold));
    return;
  }
  const n = STAGES.findIndex((s) => s.id === stage.id) + 1;
  const hint =
    stage.kind === 'self'
      ? `When you've done it: make tick STEP=${stage.id}`
      : 'Auto-detected once done — no need to tick.';
  console.log(paintC(`→ Step ${n}: ${stage.title}`, ANSI.cyan, ANSI.bold));
  console.log(`  ${stage.guide}`);
  console.log(paintC(`  ${hint}`, ANSI.dim));
}

function cmdJson(doneMap) {
  const { done, total, percent } = computeProgress(doneMap);
  const stages = STAGES.map((s) => ({ id: s.id, title: s.title, done: Boolean(doneMap[s.id]) }));
  console.log(JSON.stringify({ stages, done, total, percent }));
}

function cmdTick(id, progress) {
  if (!isValidStep(id)) {
    console.error(`Unknown stage '${id}'. Valid stages: ${STAGES.map((s) => s.id).join(', ')}.`);
    return 1;
  }
  if (id === 'verify') {
    progress.verify = { at: new Date().toISOString(), fingerprint: workingTreeFingerprint() };
    writeProgress(progress);
    console.log('✓ Recorded a verify pass for the current working tree.');
    return 0;
  }
  if (!isSelfReportStep(id)) {
    console.error(
      `'${id}' is an evidence stage — it's proven automatically, not ticked. ` +
        `Self-report stages are: ${SELF_REPORT_STEPS.join(', ')}.`,
    );
    return 1;
  }
  progress[id] = new Date().toISOString();
  writeProgress(progress);
  console.log(`✓ Marked '${id}' done.`);
  return 0;
}

function cmdUntick(id, progress) {
  if (!isValidStep(id)) {
    console.error(`Unknown stage '${id}'. Valid stages: ${STAGES.map((s) => s.id).join(', ')}.`);
    return 1;
  }
  if (id in progress) {
    delete progress[id];
    writeProgress(progress);
    console.log(`○ Cleared '${id}'.`);
  } else {
    console.log(`'${id}' was not set.`);
  }
  return 0;
}

function cmdReset() {
  try {
    rmSync(PROGRESS_FILE, { force: true });
  } catch {
    writeProgress({});
  }
  console.log('🧹 Progress reset.');
}

async function main() {
  const [command = 'workmate', arg] = process.argv.slice(2);
  const progress = readProgress();

  switch (command) {
    case 'tick':
      return cmdTick(arg, progress);
    case 'untick':
      return cmdUntick(arg, progress);
    case 'reset':
      cmdReset();
      return 0;
    case 'help':
    case '--help':
    case '-h':
      console.log(USAGE);
      return 0;
    default:
      break;
  }

  // Remaining commands need the (probe-backed) doneMap.
  const doneMap = await buildDoneMap(progress);

  switch (command) {
    case 'status':
      cmdStatus(doneMap);
      return 0;
    case 'next':
      cmdNext(doneMap);
      return 0;
    case 'json':
      cmdJson(doneMap);
      return 0;
    case 'workmate':
      console.log(paintC(BANNER, ANSI.cyan, ANSI.bold));
      console.log('');
      cmdStatus(doneMap);
      console.log('');
      cmdNext(doneMap);
      return 0;
    default:
      console.error(`Unknown command '${command}'.\n`);
      console.log(USAGE);
      return 2;
  }
}

main()
  .then((code) => process.exit(typeof code === 'number' ? code : 0))
  .catch((err) => {
    console.error(err?.stack || String(err));
    process.exit(1);
  });
