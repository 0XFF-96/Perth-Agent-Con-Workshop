# Issue → Ticket → Code (GitHub Issues as a ticketing system)

Turn a GitHub issue into an AI-driven "ticket" that gets analyzed, approved by a
human, then implemented as a PR — all in CI, powered by DeepSeek's OpenAI-compatible
API. Labels are the ticket states; there's no external Jira.

```
Issue labeled `ticket`
   │  .github/workflows/ticket-analyze.yml
   ▼
① ANALYZE — DeepSeek reads the issue + repo, posts an implementation plan as a
            comment, and relabels the issue `needs-approval`
   ▼  (human gate — you read the plan)
② APPROVE — you comment `/approve` on the issue
   ▼  .github/workflows/ticket-implement.yml
③ IMPLEMENT — a bounded DeepSeek tool-calling agent edits files, runs the quality
              gate, commits to a branch, opens a PR, and relabels `in-review`
   ▼
④ REVIEW — the repo's existing CI + AI reviewers run on the PR; you review & merge
```

## Setup (one time)

1. Add a repo secret **`DEEPSEEK_API_KEY`** (Settings → Secrets and variables →
   Actions) — the same secret the PR-review workflows use.
2. That's it — the `ticket`, `needs-approval`, and `in-review` labels are created
   automatically the first time they're applied.

## Using it

1. Open an issue describing what you want. The clearer the issue, the better the plan.
2. Add the **`ticket`** label → within a minute, an analysis/plan comment appears and
   the label flips to `needs-approval`.
3. Read the plan. If it's right, comment **`/approve`** on the issue.
4. The agent implements it and opens a PR linked to the issue (label → `in-review`).
5. Review the PR like any other — **nothing is merged automatically.**

## Design notes & safety

- **Model:** `deepseek-chat` via DeepSeek's OpenAI-compatible API. Endpoint/model are
  overridable per workflow (`LLM_API_ENDPOINT` / `LLM_MODEL`), so you can point the
  scripts at any OpenAI-compatible provider and reuse the same gating.
- **Custom API workflow** (your choice): the agents call the chat-completions API
  directly with `fetch` — no SDK dependency added to the app. Logic lives in
  `.github/scripts/ticket-*.mjs`.
- **Human-in-the-loop is mandatory** — analysis and the `/approve` confirmation are
  separate steps, and implementation produces a PR, never a direct push to `main`.
- **Bounded agent:** the implementer is capped at a fixed number of turns, its file
  access is confined to the repo root (path-traversal is rejected), and it only has
  `list_files` / `read_file` / `write_file` / `verify` tools — no arbitrary shell.

## Cost

Each `/approve` runs an agentic loop (multiple model calls). Keep `ticket` for work
you actually want built, and prefer well-specified issues — they need fewer turns.
Anyone who can comment can `/approve`, so it spends API budget; restrict who can
label/comment via repo permissions if that matters.

## Depending on it

See **[depending-on-the-ticket-system.md](depending-on-the-ticket-system.md)** for
what the pipeline depends on (secrets, the `main`-branch requirement, the quality
gate) and what it's safe — and not safe — to rely on it for.
