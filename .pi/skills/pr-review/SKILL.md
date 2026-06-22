---
name: pr-review
description: Review a pull request with this repo's methodology (CI gate + AI-comment triage + CopilotKit/A2UI domain rubric) and post a single GO/NO-GO verdict comment on the PR. Use when asked to review a PR by number.
---

# PR review

Review the pull request the user names, using the methodology in
`docs/cloud-container-guide.md`, then post a single verdict comment on the PR.
Use the available GitHub tools (there is no `gh` CLI here).

1. **Gate on CI.** Read the PR's check runs. If `verify` is failing, fetch the log,
   diagnose, and report it — do **not** post a GO verdict on a red build. CI
   failures are often environment issues, not the diff.
2. **Triage automated reviews.** Read the DeepSeek and Copilot comments. Classify
   each as **actionable** (fix it, note the commit), **no-op** (dismiss with a
   one-line reason — it's wrong or contradicts a deliberate decision), or **defer**
   (out of scope). Don't blindly act on every suggestion; each push re-triggers the
   reviewers and can loop.
3. **Run the domain rubric** (CopilotKit v2 + A2UI): default array/object props,
   `/v2` subpath imports, slash model format, `dotenv/config` first in `server.ts`,
   `useSingleEndpoint={false}` + `agentId`, host-authored L4 with inlined literals,
   colocated tests for new L3 components, and no secrets/`.env` committed.
4. **Post the verdict comment** using the template in
   `docs/cloud-container-guide.md` (GO / NO-GO + CI + triage + checklist).

Post exactly one summary comment. Review only — don't push code changes unless
asked.
