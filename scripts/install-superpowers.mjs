#!/usr/bin/env node
// Vendor obra/Superpowers skills into this repo so they're available to BOTH
// harnesses — Claude Code (.claude/skills/) and pi (.pi/skills/) — including
// /brainstorming, /writing-plans, /executing-plans, TDD, systematic-debugging, …
// (Superpowers is multi-agent and ships a pi tool mapping; pi invokes skills via
// /skill:name.)
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
// Vendor into both harnesses' skill dirs. Attribution (LICENSE/NOTICE) is written
// to the first entry only — pi's discovery treats every folder as a skill, so we
// keep loose files out of .pi/skills.
const DESTS = ['.claude/skills', '.pi/skills'];

if (!existsSync('.claude') && !existsSync('.pi')) {
  console.error('Run this from the repo root (no .claude/ or .pi/ here).');
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

  const skills = readdirSync(src, { withFileTypes: true }).filter((d) => d.isDirectory());
  for (const dest of DESTS) {
    mkdirSync(dest, { recursive: true });
    for (const skill of skills) {
      cpSync(join(src, skill.name), join(dest, skill.name), { recursive: true });
    }
  }

  // Keep the MIT attribution alongside the vendored copy (Claude Code dir only —
  // pi treats every entry in .pi/skills as a skill, so no loose files there).
  cpSync(join(tmp, 'LICENSE'), join(DESTS[0], 'SUPERPOWERS-LICENSE'));
  writeFileSync(
    join(DESTS[0], 'SUPERPOWERS-NOTICE.md'),
    `# Vendored skills: obra/Superpowers\n\n` +
      `Source: ${REPO.replace('.git', '')}\nPinned ref: \`${REF}\`\nLicense: MIT (see SUPERPOWERS-LICENSE)\n\n` +
      `These ${skills.length} skill folders are a vendored snapshot, installed into ` +
      `${DESTS.join(' and ')}. Re-run \`make superpowers\` to update.\n`,
  );

  console.log(`✅ Installed ${skills.length} Superpowers skills into ${DESTS.join(' and ')}/:`);
  console.log('   ' + skills.map((s) => s.name).sort().join(', '));
  console.log('\nClaude Code: restart, then `/brainstorming`. pi: `/skill:brainstorming`.');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
