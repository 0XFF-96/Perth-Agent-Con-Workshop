#!/usr/bin/env node
// Stage 1 of the issue→ticket→code pipeline: analyze a labeled issue and post a
// detailed implementation plan as a comment, then move the ticket to
// `needs-approval`. Uses DeepSeek's OpenAI-compatible API. See docs/ticket-system.md.
import { execSync } from 'node:child_process';

const {
  DEEPSEEK_API_KEY,
  GITHUB_TOKEN,
  GITHUB_REPOSITORY,
  ISSUE_NUMBER,
  LLM_API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions',
  LLM_MODEL = 'deepseek-chat',
} = process.env;

if (!DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY is not set (add it as a repo secret).');
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

async function llm(messages) {
  const res = await fetch(LLM_API_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: LLM_MODEL, messages, temperature: 0.2 }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 500)}`);
  return (await res.json()).choices[0].message.content;
}

const issue = await gh(`/issues/${ISSUE_NUMBER}`);
const fileTree = execSync('git ls-files', { encoding: 'utf8' })
  .split('\n').filter(Boolean).slice(0, 500).join('\n');

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

const analysis = (await llm([
  { role: 'system', content: system },
  { role: 'user', content: user },
]))?.trim() || '_(the model returned no analysis)_';

const body = [
  '## 🎫 Ticket analysis',
  '',
  analysis,
  '',
  '---',
  `<sub>Automated analysis · model \`${LLM_MODEL}\`. Review it, then comment **\`/approve\`** to trigger ` +
    'implementation. The agent will open a PR — nothing is merged automatically.</sub>',
].join('\n');

await gh(`/issues/${ISSUE_NUMBER}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
await gh(`/issues/${ISSUE_NUMBER}/labels`, { method: 'POST', body: JSON.stringify({ labels: ['needs-approval'] }) });
await gh(`/issues/${ISSUE_NUMBER}/labels/ticket`, { method: 'DELETE' }).catch(() => {});

console.log(`Posted analysis on issue #${ISSUE_NUMBER}; comment /approve to implement.`);
