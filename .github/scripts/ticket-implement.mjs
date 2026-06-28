#!/usr/bin/env node
// Stage 2 of the issue→ticket→code pipeline: triggered by a `/approve` comment, run
// a bounded DeepSeek tool-calling loop that reads/edits files in the checked-out
// repo, verifies, commits to a branch, and opens a PR. Nothing is merged
// automatically — the PR + the repo's CI/reviews are the human gate.
// Uses DeepSeek's OpenAI-compatible API. See docs/ticket-system.md.
//
// SECURITY: Only the repository owner (0XFF-96) is allowed to trigger
// implementation via /approve. Any other user's /approve comment is silently
// ignored.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, relative, isAbsolute } from 'node:path';

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
const ROOT = process.cwd();
const MAX_TURNS = 40;

// ── Security gate: only 0XFF-96 may /approve ──────────────────────────────
const ALLOWED_USER = '0XFF-96';

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

// Fetch all comments on the issue and find the one that triggered this run
// (the most recent /approve comment by a non-bot user).
const allComments = await gh(`/issues/${ISSUE_NUMBER}/comments?per_page=100`);
const approveComments = allComments.filter(
  (c) => c.body?.trim().startsWith('/approve') && c.user?.type !== 'Bot',
);
if (approveComments.length === 0) {
  console.log('No /approve comment found; exiting.');
  process.exit(0);
}
// The workflow triggers on each comment creation, so the last matching comment
// is the one that triggered this run.
const triggerComment = approveComments[approveComments.length - 1];
const author = triggerComment.user?.login;
if (author !== ALLOWED_USER) {
  console.log(`/approve comment by @${author} rejected — only @${ALLOWED_USER} may trigger implementation.`);
  await gh(`/issues/${ISSUE_NUMBER}/comments`, {
    method: 'POST',
    body: JSON.stringify({
      body: `## ⛔ Unauthorized /approve\n\n@${author} is not allowed to trigger ticket implementation. Only @${ALLOWED_USER} may do so.`,
    }),
  });
  process.exit(0);
}

// ── End security gate ─────────────────────────────────────────────────────

async function llm(messages) {
  const res = await fetch(LLM_API_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: LLM_MODEL, messages, tools, tool_choice: 'auto', temperature: 0.2 }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 500)}`);
  return (await res.json()).choices[0];
}

// Confine all file access to the repo root — reject path traversal.
function safePath(p) {
  const abs = resolve(ROOT, p);
  const rel = relative(ROOT, abs);
  if (rel.startsWith('..') || isAbsolute(rel)) throw new Error(`Path escapes the repo: ${p}`);
  return abs;
}

const fn = (name, description, properties = {}, required = []) => ({
  type: 'function',
  function: { name, description, parameters: { type: 'object', properties, required, additionalProperties: false } },
});
const tools = [
  fn('list_files', 'List repository files (git-tracked).'),
  fn('read_file', 'Read a UTF-8 file relative to the repo root.', { path: { type: 'string' } }, ['path']),
  fn('write_file', 'Create or overwrite a UTF-8 file relative to the repo root.', { path: { type: 'string' }, content: { type: 'string' } }, ['path', 'content']),
  fn('verify', 'Run the quality gate (typecheck + tests). Returns combined output.'),
];

function runTool(name, args) {
  switch (name) {
    case 'list_files':
      return execSync('git ls-files', { encoding: 'utf8' });
    case 'read_file':
      return readFileSync(safePath(args.path), 'utf8');
    case 'write_file': {
      const abs = safePath(args.path);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, args.content);
      return `Wrote ${args.path} (${args.content.length} bytes).`;
    }
    case 'verify':
      try {
        return `PASS\n${execSync('npm run typecheck && npx vitest run', { encoding: 'utf8', stdio: 'pipe' })}`.slice(0, 8000);
      } catch (e) {
        return `FAIL\n${(e.stdout || '') + (e.stderr || '')}`.slice(0, 8000);
      }
    default:
      return `Unknown tool: ${name}`;
  }
}

const issue = await gh(`/issues/${ISSUE_NUMBER}`);
const comments = await gh(`/issues/${ISSUE_NUMBER}/comments?per_page=100`);

// --- Authorization gate: only 0XFF-96 may /approve ---
const approveComment = comments.find((c) => c.body?.trim().startsWith('/approve'));
if (!approveComment) {
  console.log('No /approve comment found; exiting.');
  process.exit(0);
}
const APPROVED_AUTHOR = '0XFF-96';
if (approveComment.user?.login !== APPROVED_AUTHOR) {
  const msg = `## 🚫 Unauthorized\n\nUser \`${approveComment.user?.login}\` attempted to \`/approve\` but only \`${APPROVED_AUTHOR}\` is authorized. This implementation has been blocked.`;
  await gh(`/issues/${ISSUE_NUMBER}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body: msg }),
  });
  console.log(`Blocked /approve from unauthorized user ${approveComment.user?.login}.`);
  process.exit(0);
}
// --- End authorization gate ---

const plan = (comments.find((c) => c.body?.includes('🎫 Ticket analysis'))?.body || '(no analysis comment found)')
  .replace(/<sub>[\s\S]*?<\/sub>/g, '')
  .trim();

const system =
  'You are an autonomous coding agent implementing an approved ticket in this repository. ' +
  'Follow the approved plan. Make the smallest change that fully satisfies the goal; do not refactor ' +
  'unrelated code. Follow the conventions in CLAUDE.md (read it first). Add or update tests, and call ' +
  'the `verify` tool before finishing. When done, reply with a short summary and stop calling tools — ' +
  'you are running unattended and a human reviews the resulting PR.';

const messages = [
  { role: 'system', content: system },
  {
    role: 'user',
    content:
      `Implement this approved ticket.\n\n# Issue #${ISSUE_NUMBER}: ${issue.title}\n\n${issue.body || ''}\n\n` +
      `## Approved plan\n${plan}\n\nStart by reading CLAUDE.md and the files the plan names.`,
  },
];

let summary = '';
for (let turn = 0; turn < MAX_TURNS; turn++) {
  const choice = await llm(messages);
  const msg = choice.message;
  messages.push(msg);
  if (msg.content) summary = msg.content;

  const calls = msg.tool_calls || [];
  if (calls.length === 0) break;

  for (const call of calls) {
    let content;
    try {
      content = String(runTool(call.function.name, JSON.parse(call.function.arguments || '{}')));
    } catch (e) {
      content = `Error: ${e.message}`;
    }
    messages.push({ role: 'tool', tool_call_id: call.id, content });
  }
}

const changed = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
if (!changed) {
  await gh(`/issues/${ISSUE_NUMBER}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body: `## 🤖 Implementation\n\nThe agent made no file changes. Summary:\n\n${summary || '(none)'}` }),
  });
  console.log('No changes produced; commented on the issue.');
  process.exit(0);
}

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
    body: `Automated implementation of #${ISSUE_NUMBER} (custom DeepSeek agent, model \`${LLM_MODEL}\`).\n\n` +
      `## Agent summary\n${summary || '(none)'}\n\nCloses #${ISSUE_NUMBER}\n\n` +
      `> ⚠️ Generated by an autonomous agent — review carefully before merging. CI and the repo's PR reviewers run on this PR.`,
  }),
});

await gh(`/issues/${ISSUE_NUMBER}/comments`, {
  method: 'POST',
  body: JSON.stringify({ body: `## 🤖 Implementation opened as a PR\n\n${pr.html_url}\n\n${summary || ''}` }),
});
await gh(`/issues/${ISSUE_NUMBER}/labels`, { method: 'POST', body: JSON.stringify({ labels: ['in-review'] }) });
await gh(`/issues/${ISSUE_NUMBER}/labels/needs-approval`, { method: 'DELETE' }).catch(() => {});

console.log(`Opened ${pr.html_url}`);
