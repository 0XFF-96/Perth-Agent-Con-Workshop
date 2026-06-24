import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STAGES,
  SELF_REPORT_STEPS,
  isValidStep,
  isSelfReportStep,
  computeProgress,
  nextStage,
  renderChecklist,
} from './workmate-logic.mjs';

const ALL_DONE = Object.fromEntries(STAGES.map((s) => [s.id, '2026-01-01T00:00:00.000Z']));

test('STAGES: ten stages with stable ids in order', () => {
  assert.equal(STAGES.length, 10);
  assert.deepEqual(
    STAGES.map((s) => s.id),
    ['env', 'deps', 'agent', 'app', 'l2', 'l3', 'l4', 'extend', 'verify', 'capstone'],
  );
});

test('SELF_REPORT_STEPS: exactly the tickable ids', () => {
  assert.deepEqual(SELF_REPORT_STEPS, ['l2', 'l4', 'extend', 'capstone']);
});

test('computeProgress: empty map → 0 done, currentIndex 0', () => {
  const p = computeProgress({});
  assert.equal(p.done, 0);
  assert.equal(p.total, 10);
  assert.equal(p.percent, 0);
  assert.equal(p.currentIndex, 0);
});

test('computeProgress: partial map → percent + currentIndex at first gap', () => {
  // env + deps done, agent not → currentIndex points at agent (index 2).
  const p = computeProgress({ env: 'x', deps: 'x' });
  assert.equal(p.done, 2);
  assert.equal(p.percent, 20);
  assert.equal(p.currentIndex, 2);
});

test('computeProgress: counts done even past a gap', () => {
  // env done, deps NOT, l2 done → 2 done, but currentIndex is the deps gap (1).
  const p = computeProgress({ env: 'x', l2: 'x' });
  assert.equal(p.done, 2);
  assert.equal(p.percent, 20);
  assert.equal(p.currentIndex, 1);
});

test('computeProgress: full map → 100% and currentIndex === total', () => {
  const p = computeProgress(ALL_DONE);
  assert.equal(p.done, 10);
  assert.equal(p.percent, 100);
  assert.equal(p.currentIndex, 10);
});

test('computeProgress: no-arg defaults to empty', () => {
  assert.equal(computeProgress().done, 0);
});

test('nextStage: empty map → env', () => {
  assert.equal(nextStage({}).id, 'env');
});

test('nextStage: full map → null', () => {
  assert.equal(nextStage(ALL_DONE), null);
});

test('nextStage: skips completed leading stages', () => {
  assert.equal(nextStage({ env: 'x', deps: 'x' }).id, 'agent');
});

test('isValidStep: known id → true, unknown → false', () => {
  assert.equal(isValidStep('env'), true);
  assert.equal(isValidStep('capstone'), true);
  assert.equal(isValidStep('nope'), false);
});

test('isSelfReportStep: self-report → true, evidence → false', () => {
  assert.equal(isSelfReportStep('l2'), true);
  assert.equal(isSelfReportStep('capstone'), true);
  assert.equal(isSelfReportStep('env'), false);
  assert.equal(isSelfReportStep('verify'), false);
});

test('renderChecklist: contains the progress bar substring', () => {
  const out = renderChecklist({ env: 'x', deps: 'x' });
  assert.match(out, /\[##--------\] 2\/10 \(20%\)/);
});

test('renderChecklist: ✓ for a done step, → for the current step', () => {
  const out = renderChecklist({ env: 'x', deps: 'x' });
  // env is done.
  assert.match(out, /✓ Set your API key in \.env/);
  // agent is the first not-done stage → current marker.
  assert.match(out, /→ Have an agent harness ready/);
  // a later stage is still pending.
  assert.match(out, /○ Try L2 plain chat/);
});

test('renderChecklist: includes a Current line with the guide', () => {
  const out = renderChecklist({});
  assert.match(out, /Current: Set your API key in \.env — Copy \.env\.example/);
});

test('renderChecklist: all done → celebration footer, no Current line', () => {
  const out = renderChecklist(ALL_DONE);
  assert.match(out, /🎉 All 10 stages complete!/);
  assert.doesNotMatch(out, /Current:/);
  assert.match(out, /\[##########\] 10\/10 \(100%\)/);
});
