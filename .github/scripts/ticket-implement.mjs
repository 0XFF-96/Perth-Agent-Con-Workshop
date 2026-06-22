#!/usr/bin/env node
// Stage 2 of the issue→ticket→code pipeline: once a ticket is `approved`, run a
// bounded Claude tool-use loop that reads/edits files in the checked-out repo,
// verifies, commits to a branch, and opens a PR. Nothing is merged automatically —
// the PR (and the repo's CI + reviews) are the human gate. See docs/ticket-system.md.
import Anthropic from '@anthropic-ai/sdk';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, relative, isAbsolute } from 'node:path';

const {
  ANTHROPIC_API_KEY,
  GITHUB_TOKEN,
  GITHUB_REPOSITORY,
  ISSUE_NUMBER,
  LLM_MODEL = 'claude-opus-4-8',
} = process.env;

if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set (add it as a repo secret).');
const [owner, repo] = GITHUB_REPOSITORY.split('/');
const ROOT = process.cwd();
const MAX_TURNS = 40;

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

// Confine all file access to the repo root — reject path traversal.
function safePath(p) {
  const abs = resolve(ROOT, p);
  const rel = relative(ROOT, abs);
  if (rel.startsWith('..') || isAbsolute(rel)) throw new Error(`Path escapes the repo: ${p}`);
  return abs;
}

const issue = await gh(`/issues/${ISSUE_NUMBER}`);
const comments = await gh(`/issues/${ISSUE_NUMBER}/comments?per_page=100`);
const plan = (comments.find((c) => c.body?.includes('🎫 Ticket analysis'))?.body || '(no analysis comment found)')
  .replace(/<sub>[\s\S]*?<\/sub>/g, '')
  .trim();

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const tools = [
  { name: 'list_files', description: 'List repository files (git-tracked).', input_schema: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'read_file', description: 'Read a UTF-8 file relative to the repo root.', input_schema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'], additionalProperties: false } },
  { name: 'write_file', description: 'Create or overwrite a UTF-8 file relative to the repo root.', input_schema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'], additionalProperties: false } },
  { name: 'verify', description: 'Run the quality gate (typecheck + tests). Returns combined output.', input_schema: { type: 'object', properties: {}, additionalProperties: false } },
];

function runTool(name, input) {
  switch (name) {
    case 'list_files':
      return execSync('git ls-files', { encoding: 'utf8' });
    case 'read_file':
      return readFileSync(safePath(input.path), 'utf8');
    case 'write_file': {
      const abs = safePath(input.path);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, input.content);
      return `Wrote ${input.path} (${input.content.length} bytes).`;
    }
    case 'verify':
      try {
        const out = execSync('npm run typecheck && npx vitest run', { encoding: 'utf8', stdio: 'pipe' });
        return `PASS\n${out}`.slice(0, 8000);
      } catch (e) {
        return `FAIL\n${(e.stdout || '') + (e.stderr || '')}`.slice(0, 8000);
      }
    default:
      return `Unknown tool: ${name}`;
  }
}

const system =
  'You are an autonomous coding agent implementing an approved ticket in this repository. ' +
  'Follow the approved plan. Make the smallest change that fully satisfies the goal; do not refactor ' +
  'unrelated code. Follow the conventions in CLAUDE.md (read it first). Add or update tests, and run ' +
  '`verify` before finishing. When done, stop with a short summary — do not ask questions; you are running ' +
  'unattended and a human reviews the resulting PR.';

const messages = [{
  role: 'user',
  content:
    `Implement this approved ticket.\n\n# Issue #${ISSUE_NUMBER}: ${issue.title}\n\n${issue.body || ''}\n\n` +
    `## Approved plan\n${plan}\n\nStart by reading CLAUDE.md and the files the plan names.`,
}];

let summary = '';
for (let turn = 0; turn < MAX_TURNS; turn++) {
  const res = await anthropic.messages.create({
    model: LLM_MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high' },
    system,
    tools,
    messages,
  });
  messages.push({ role: 'assistant', content: res.content });

  const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  if (text) summary = text;

  if (res.stop_reason !== 'tool_use') break;

  const toolResults = res.content
    .filter((b) => b.type === 'tool_use')
    .map((b) => {
      let content, is_error = false;
      try { content = String(runTool(b.name, b.input)); }
      catch (e) { content = `Error: ${e.message}`; is_error = true; }
      return { type: 'tool_result', tool_use_id: b.id, content, is_error };
    });
  messages.push({ role: 'user', content: toolResults });
}

// Did the agent actually change anything?
const changed = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
if (!changed) {
  await gh(`/issues/${ISSUE_NUMBER}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body: `## 🤖 Implementation\n\nThe agent made no file changes. Summary:\n\n${summary || '(none)'}` }),
  });
  console.log('No changes produced; commented on the issue.');
  process.exit(0);
}

// Commit on a fresh branch and push (checkout already configured the token remote).
const slug = issue.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'ticket';
const branch = `ticket/${ISSUE_NUMBER}-${slug}`;
execSync('git config user.name "ticket-agent[bot]"');
execSync('git config user.email "ticket-agent@users.noreply.github.com"');
execSync(`git checkout -b ${branch}`);
execSync('git add -A');
execSync(`git commit -m ${JSON.stringify(`feat: implement ticket #${ISSUE_NUMBER} — ${issue.title}`)}`);
execSync(`git push -u origin ${branch}`);

const { default_branch } = await gh('');
const pr = await gh('/pulls', {
  method: 'POST',
  body: JSON.stringify({
    title: `Implement #${ISSUE_NUMBER}: ${issue.title}`,
    head: branch,
    base: default_branch,
    body: `Automated implementation of #${ISSUE_NUMBER} (custom Claude API agent, model \`${LLM_MODEL}\`).\n\n` +
      `## Agent summary\n${summary || '(none)'}\n\nCloses #${ISSUE_NUMBER}\n\n` +
      `> ⚠️ Generated by an autonomous agent — review carefully before merging. CI and the repo's PR reviewers run on this PR.`,
  }),
});

await gh(`/issues/${ISSUE_NUMBER}/comments`, {
  method: 'POST',
  body: JSON.stringify({ body: `## 🤖 Implementation opened as a PR\n\n${pr.html_url}\n\n${summary || ''}` }),
});
await gh(`/issues/${ISSUE_NUMBER}/labels`, { method: 'POST', body: JSON.stringify({ labels: ['in-review'] }) });
await gh(`/issues/${ISSUE_NUMBER}/labels/approved`, { method: 'DELETE' }).catch(() => {});

console.log(`Opened ${pr.html_url}`);
