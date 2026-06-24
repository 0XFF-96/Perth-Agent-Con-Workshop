---
name: workmate
description: Show the workshop learner's progress and drive them to the next step via the Makefile-driven WorkMate companion. Use when the user asks where they are in the workshop, what to do next, or to track / tick off progress.
---

# WorkMate (workshop progress companion)

WorkMate is the Makefile-driven progress companion for the workshop learner.

1. Run `make workmate` to print the banner, the 10-stage checklist + progress
   bar, and the next not-done step. Read it back to the user in plain words:
   where they are and what to do next.
2. Between steps, run `make next` to surface just the next stage and its guide.
3. Mark a self-report stage done with `make tick STEP=<id>` — and ONLY after the
   user genuinely did it. The tickable stages are `l2`, `l4`, `extend`, and
   `capstone`. The evidence stages (`env`, `deps`, `agent`, `app`, `l3`, `verify`)
   are proven automatically by probes — never tick those; they update themselves.
4. `make status` re-shows the full checklist; `make reset` clears saved progress.

Keep this skill about *progress mechanics*. Defer the actual teaching of the
L2 → L4 spectrum to `/skill:workshop-learning`.
