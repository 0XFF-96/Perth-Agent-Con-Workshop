#!/usr/bin/env node
// Vendor obra/Superpowers skills into this repo's .claude/skills/ so they're
// available to anyone using Claude Code here (including /brainstorming,
// /writing-plans, /executing-plans, TDD, systematic-debugging, …).
//
// Superpowers is MIT-licensed (© Jesse Vincent). We vendor a pinned snapshot of
// its `skills/` tree rather than depend on the plugin marketplace, so the skills
// are committed, offline-usable, and reproducible. Re-run to update.
//
//   node scripts/install-superpowers.mjs            # pinned ref (default)
//   SUPERPOWERS_REF=main node scripts/install-superpowers.mjs   # track a branch/tag/sha
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, cpSync, existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const REPO = 'https://github.com/obra/superpowers.git';
// Pinned for reproducibility / supply-chain safety. Override with SUPERPOWERS_REF.
const REF = process.env.SUPERPOWERS_REF || '896224c4b1879920ab573417e68fd51d2ccc9072';
const DEST = '.claude/skills';

if (!existsSync('.claude')) {
  console.error('Run this from the repo root (no .claude/ here).');
  process.exit(1);
}

const tmp = mkdtempSync(join(tmpdir(), 'superpowers-'));
try {
  console.log(`📥 Fetching Superpowers @ ${REF}…`);
  // Shallow clone, then check out the pinned ref (works for sha, tag, or branch).
  execSync(`git clone --quiet --depth 1 ${REF.length === 40 ? '' : `--branch ${REF}`} ${REPO} "${tmp}"`, {
    stdio: 'inherit',
  });
  if (REF.length === 40) {
    execSync(`git -C "${tmp}" fetch --quiet --depth 1 origin ${REF}`, { stdio: 'inherit' });
    execSync(`git -C "${tmp}" checkout --quiet ${REF}`, { stdio: 'inherit' });
  }

  const src = join(tmp, 'skills');
  if (!existsSync(src)) {
    console.error('Upstream layout changed — no skills/ directory found.');
    process.exit(1);
  }

  mkdirSync(DEST, { recursive: true });
  const skills = readdirSync(src, { withFileTypes: true }).filter((d) => d.isDirectory());
  for (const skill of skills) {
    cpSync(join(src, skill.name), join(DEST, skill.name), { recursive: true });
  }

  // Keep the MIT attribution alongside the vendored copy.
  cpSync(join(tmp, 'LICENSE'), join(DEST, 'SUPERPOWERS-LICENSE'));
  writeFileSync(
    join(DEST, 'SUPERPOWERS-NOTICE.md'),
    `# Vendored skills: obra/Superpowers\n\n` +
      `Source: ${REPO.replace('.git', '')}\nPinned ref: \`${REF}\`\nLicense: MIT (see SUPERPOWERS-LICENSE)\n\n` +
      `These ${skills.length} skill folders are a vendored snapshot. Re-run \`make superpowers\` to update.\n`,
  );

  console.log(`✅ Installed ${skills.length} Superpowers skills into ${DEST}/:`);
  console.log('   ' + skills.map((s) => s.name).sort().join(', '));
  console.log('\nRestart Claude Code, then try `/brainstorming` (and /writing-plans, /executing-plans).');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
