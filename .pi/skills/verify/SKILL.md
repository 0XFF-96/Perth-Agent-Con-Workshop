---
name: verify
description: Run this repo's full quality gate (typecheck + tests + build) and report a clear go/no-go. Use before committing or calling work done, or when the user asks to verify, check, or validate their changes.
---

# Verify (quality gate)

Run this repo's quality gate and report a clear go/no-go.

Run all three even if an earlier one fails (so the user sees the full picture):

1. `npm run typecheck`
2. `npx vitest run`
3. `npm run build`

Then give a one-line verdict: **GO** (all three green) or **NO-GO** with the exact
failing output quoted. Do not fix anything unless asked — just report.
