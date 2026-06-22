# Working in the Cloud Container

This repo is often driven by an AI coding agent (Claude Code or [pi](https://pi.dev))
running in a **managed remote execution environment** — "the Cloud Container" —
e.g. [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web),
started from a phone, desktop, or GitHub. This guide is how to work in it without
losing work or shipping un-reviewed changes.

## 1. The container is ephemeral — push or lose it

- The repo is **cloned fresh** when the container starts, and the container is
  **reclaimed** after a period of inactivity (or when the session ends).
- Outbound network access is governed by the environment's **network policy**.
- GitHub access is through the **GitHub MCP tools**, scoped to this one repo —
  there is no `gh` CLI.

> **Golden rule: if it isn't committed *and* pushed, it's gone.** Treat the
> container as disposable scratch space; the remote branch is the only durable
> record.

## 2. The push workflow

1. **Develop on the session branch** (`claude/<…>`), never directly on `main`.
   Create it locally if it doesn't exist.
2. **Commit per logical change** with a clear message.
3. **Push with retry** — network blips happen, so push and, on a network error,
   retry with backoff (2s → 4s → 8s → 16s):
   ```bash
   git push -u origin <branch>
   ```
4. **End-of-session checklist:**
   - `git status` → working tree clean
   - `git rev-list --left-right --count origin/<branch>...HEAD` → `0  0` (in sync)
5. The `Stop` hook (`stop-hook-git-check.sh`) nags if untracked files remain — that
   nudge means *commit and push before you stop*.
6. **Don't open a PR unless asked.** When you do, push the branch first.

## 3. PR review methodology

Three things run automatically on every PR (see [README](../README.md#ci--automated-pr-review)):

- **CI `verify`** — typecheck + tests + build (`.github/workflows/ci.yml`).
- **DeepSeek AI review** — `.github/workflows/ai-pr-review.yml` (needs the
  `DEEPSEEK_API_KEY` repo secret).
- **GitHub Copilot review** — if the automatic-review ruleset is enabled.

Turn that raw output into one decision with this pipeline (also runnable as
`/pr-review`):

1. **Gate on CI.** If `verify` is red, fix it *first* — reviewing a broken build is
   premature. CI failures are usually environment issues (e.g. lockfile/optional-dep
   bugs), not your code; read the log before assuming.
2. **Triage the automated comments.** For each DeepSeek/Copilot comment, classify:
   - **actionable** → make the fix, reference the commit;
   - **no-op** → dismiss with a one-line reason (it's wrong, or contradicts a
     deliberate decision);
   - **defer** → out of scope; note a follow-up.

   > Don't reflexively act on AI suggestions. They can contradict deliberate
   > choices, and because each push re-triggers the reviewers, blindly "fixing"
   > every comment can loop forever. Decide, then move on.
3. **Run the domain rubric** (CopilotKit v2 + A2UI — see the checklist below).
4. **Post one verdict comment** to the PR using the template.

### Verdict comment template

```md
## 🔍 Review summary
**Verdict:** GO / NO-GO

**CI (verify):** ✅/❌ · **DeepSeek:** ✅ · **Copilot:** ✅/n.a.

### Triage of automated comments
- [actionable] file:line — <what> → fixed in <sha>
- [no-op] file:line — <why dismissed>

### Domain checklist (CopilotKit v2 + A2UI)
- [ ] Array/object props defaulted (streaming safety)
- [ ] v2 subpath imports · model in slash format (`openai/gpt-4.1`)
- [ ] `dotenv/config` imported first in `server.ts`
- [ ] `<CopilotKit useSingleEndpoint={false} …>` + `agentId`
- [ ] L4 surfaces host-authored with inlined literal values
- [ ] New L3 component has a colocated `.test.tsx`
- [ ] No secrets / `.env` committed

### Notes
<free text>
```

## 4. The `/pr-review` command

A reusable shortcut that runs the methodology end-to-end and posts the verdict:

- **Claude Code:** `/pr-review <pr-number>`
- **pi:** `/skill:pr-review <pr-number>`

It reads the PR's CI status and automated review comments, triages them, runs the
domain rubric, and posts the verdict comment on the PR.
