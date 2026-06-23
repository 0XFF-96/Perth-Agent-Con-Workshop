# Depending on the ticket system

This explains what the [issue → ticket → code pipeline](ticket-system.md) **depends
on** to work, and what it's safe (and not safe) for *you* to depend on it for.

## What the pipeline depends on

For the workflows to run end-to-end, all of these must hold:

| Dependency | Why | If missing |
|---|---|---|
| **`DEEPSEEK_API_KEY` repo secret** | Both agents call DeepSeek's API | Analyze/implement jobs fail immediately |
| **"Allow GitHub Actions to create and approve pull requests" enabled** (Settings → Actions → General) | The implement stage opens the PR via `GITHUB_TOKEN` | Branch is pushed but PR creation fails (403) |
| **Workflows live on the default branch (`main`)** | `issues`/`issue_comment` events only run workflows defined on the default branch | Labeling/`/approve` does nothing until merged to `main` |
| **GitHub Actions enabled** + the workflows' `permissions` (issues/contents/PR write) | Posting comments, pushing branches, opening PRs | Jobs error on the first API/git call |
| **A working quality gate** (`npm run typecheck`, `npx vitest run`) | The implement agent's `verify` tool runs these | Agent can't self-check; PRs are lower quality but still open |
| **`CLAUDE.md`** | The implement agent reads it for conventions | Output drifts from repo style |
| **The PR review pipeline** (CI + DeepSeek/principled review) | Reviews the agent's PR — the real safety net | Agent PRs land unreviewed if you merge without it |

> The implement stage is **layered on the same `DEEPSEEK_API_KEY`** as the PR-review
> workflows — adopting it adds no new secret.

## What you can depend on it for

- **A consistent intake → plan → PR contract.** Label `ticket` → a plan comment;
  `/approve` → a PR linked to the issue. The states (`ticket` → `needs-approval` →
  `in-review`) are a reliable, auditable trail.
- **A first draft, not a finished feature.** Treat the PR as a starting point that
  always goes through human review and CI — same bar as any other contributor.

## What NOT to depend on it for

- **Don't depend on it to merge anything.** It only ever opens a PR; a human merges.
- **Don't depend on it for large or ambiguous work.** The agent is bounded (capped
  turns, repo-confined file tools, no shell). Well-scoped issues succeed; sweeping
  refactors will be partial — it may comment "no changes" and stop.
- **Don't depend on determinism or cost-free runs.** Each `/approve` spends API
  budget and may produce different output run-to-run. Anyone who can comment can
  `/approve`, so gate via repo permissions if budget matters.

## Adopting it in another repo

1. Copy `.github/workflows/ticket-*.yml` and `.github/scripts/ticket-*.mjs`.
2. Add a `DEEPSEEK_API_KEY` secret (or point `LLM_API_ENDPOINT`/`LLM_MODEL` at any
   OpenAI-compatible provider).
3. Enable **Settings → Actions → General → Workflow permissions → "Allow GitHub
   Actions to create and approve pull requests"** (required for PR creation in the
   implement stage).
4. Ensure the repo has a `verify`-style gate the agent can run, and a `CLAUDE.md`.
5. Merge to the default branch — the pipeline is then live.
