---
name: run
description: Start the AgentCon workshop app (Vite frontend + CopilotKit runtime) and smoke-test that the L2-L4 tabs load and respond. Use when the user wants to run, start, boot, or demo the app, or asks "does it work".
---

# Run the workshop app

Start the AgentCon workshop app and confirm it works:

1. Check that `.env` exists and has a non-empty `OPENAI_API_KEY` (or
   `ANTHROPIC_API_KEY` if `LLM_MODEL` points at Anthropic). If it's missing, tell
   the user to set it — **do NOT write the key yourself.**
2. Run `npm run dev` (starts Vite on http://localhost:5173 and the CopilotKit
   runtime on http://localhost:4000 via `concurrently`).
3. Wait for both to be ready. If the page is blank/404 on first load, that's the
   known startup race — reload once.
4. Smoke-test: confirm the tab bar shows L2, L3, L4. Try a chat in L2 ("hello")
   and check for a streamed reply; in L3 try "show me a flight from Perth to
   Sydney"; in L4 try "show me the sales dashboard".
5. Report what worked and surface any console / runtime errors verbatim.

Do not push, and do not edit `.env`.
