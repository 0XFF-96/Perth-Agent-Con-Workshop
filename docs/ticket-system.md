# Issue → Ticket → Code (GitHub Issues as a ticketing system)

Turn a GitHub issue into an AI-driven "ticket" that gets analyzed, approved by a
human, then implemented as a PR — all in CI, powered by the Claude API. Labels are
the ticket states; there's no external Jira.

```
Issue labeled `ticket`
   │  .github/workflows/ticket-analyze.yml
   ▼
① ANALYZE — Claude reads the issue + repo, posts an implementation plan as a
            comment, and relabels the issue `needs-approval`
   ▼  (human gate — you read the plan)
② APPROVE — you add the `approved` label
   ▼  .github/workflows/ticket-implement.yml
③ IMPLEMENT — a bounded Claude tool-use agent edits files, runs the quality gate,
              commits to a branch, opens a PR, and relabels the issue `in-review`
   ▼
④ REVIEW — the repo's existing CI + AI reviewers run on the PR; you review & merge
```

## Setup (one time)

1. Add a repo secret **`ANTHROPIC_API_KEY`** (Settings → Secrets and variables →
   Actions → New repository secret).
2. That's it — the `ticket`, `needs-approval`, `approved`, and `in-review` labels
   are created automatically the first time they're applied.

## Using it

1. Open an issue describing what you want. The clearer the issue, the better the plan.
2. Add the **`ticket`** label → within a minute, an analysis/plan comment appears and
   the label flips to `needs-approval`.
3. Read the plan. If it's right, add the **`approved`** label.
4. The agent implements it and opens a PR linked to the issue (label → `in-review`).
5. Review the PR like any other — **nothing is merged automatically.**

## Design notes & safety

- **Model:** `claude-opus-4-8` (override per workflow via the `LLM_MODEL` env).
- **Custom API workflow** (your choice): the agents call the Anthropic Messages API
  directly via the official SDK (installed with `--no-save`, so the app's
  dependencies are untouched). Logic lives in `.github/scripts/ticket-*.mjs`.
- **Human-in-the-loop is mandatory** — analysis and approval are separate steps, and
  implementation produces a PR, never a direct push to `main`.
- **Bounded agent:** the implementer is capped at a fixed number of turns, its file
  access is confined to the repo root (path-traversal is rejected), and it only has
  `list_files` / `read_file` / `write_file` / `verify` tools — no arbitrary shell.
- **Swappable provider:** the scripts use the Anthropic SDK. To use a different
  provider you'd adapt the two scripts (the workflows and gating stay the same).

## Cost

Each approved ticket runs an agentic loop (multiple model calls) at `effort: high`.
Keep `ticket` for work you actually want built, and prefer well-specified issues —
they need fewer turns.
