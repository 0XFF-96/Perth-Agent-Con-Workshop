#!/usr/bin/env node
// Stage 1 of the issue→ticket→code pipeline: analyze a labeled issue with Claude
// and post a detailed implementation plan back as an issue comment, then move the
// ticket to the `needs-approval` state. See docs/ticket-system.md.
import Anthropic from '@anthropic-ai/sdk';
import { execSync } from 'node:child_process';

const {
  ANTHROPIC_API_KEY,
  GITHUB_TOKEN,
  GITHUB_REPOSITORY,
  ISSUE_NUMBER,
  LLM_MODEL = 'claude-opus-4-8',
} = process.env;

if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set (add it as a repo secret).');
const [owner, repo] = GITHUB_REPOSITORY.split('/');

async function gh(path, init = {}) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`GitHub ${init.method || 'GET'} ${path} → ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

const issue = await gh(`/issues/${ISSUE_NUMBER}`);
// A compact view of the codebase so the plan is grounded in real paths.
const fileTree = execSync('git ls-files', { encoding: 'utf8' })
  .split('\n').filter(Boolean).slice(0, 500).join('\n');

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const system =
  'You are a senior engineer triaging a GitHub issue into an actionable ticket for THIS repository. ' +
  'Ground every step in real files from the provided tree. Be concrete and concise — a teammate should ' +
  'be able to implement from your plan without re-discovering the codebase. Do not write the code; plan it.';

const user = [
  `# Issue #${ISSUE_NUMBER}: ${issue.title}`,
  '',
  issue.body || '(no description provided)',
  '',
  '## Repository files',
  fileTree,
  '',
  'Produce a markdown plan with these sections:',
  '1. **Goal** — restate what success looks like in 1–2 sentences.',
  '2. **Impacted areas** — the specific files/modules to touch (cite paths).',
  '3. **Implementation plan** — concrete, ordered steps.',
  '4. **Tests** — what to add/run to prove it works.',
  '5. **Risks / open questions** — anything ambiguous or worth confirming.',
].join('\n');

const msg = await anthropic.messages.create({
  model: LLM_MODEL,
  max_tokens: 8000,
  thinking: { type: 'adaptive' },
  output_config: { effort: 'high' },
  system,
  messages: [{ role: 'user', content: user }],
});

const analysis = msg.content
  .filter((b) => b.type === 'text')
  .map((b) => b.text)
  .join('\n')
  .trim() || '_(the model returned no analysis)_';

const body = [
  '## 🎫 Ticket analysis',
  '',
  analysis,
  '',
  '---',
  `<sub>Automated analysis · model \`${LLM_MODEL}\`. Review it, then add the **\`approved\`** label to ` +
    'trigger implementation. The agent will open a PR — nothing is merged automatically.</sub>',
].join('\n');

await gh(`/issues/${ISSUE_NUMBER}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
await gh(`/issues/${ISSUE_NUMBER}/labels`, { method: 'POST', body: JSON.stringify({ labels: ['needs-approval'] }) });
await gh(`/issues/${ISSUE_NUMBER}/labels/ticket`, { method: 'DELETE' }).catch(() => {});

console.log(`Posted analysis on issue #${ISSUE_NUMBER} and moved it to needs-approval.`);
