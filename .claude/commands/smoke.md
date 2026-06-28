---
description: Start the dev server and verify all workshop tabs (L2–L4, 🪁 Extend, 🔁 Agent Loop) load successfully
allowed-tools: Bash, Read
---
Smoke-test the workshop app by starting the dev server and checking that every tab's content is present in the initial page load.

1. Check that `.env` exists and has a non-empty `OPENAI_API_KEY` (or
   `ANTHROPIC_API_KEY` if `LLM_MODEL` points at Anthropic). If it's missing, tell
   me to set it — **do NOT write the key yourself.**

2. Run `npm run dev` (starts Vite on http://localhost:5173 and the CopilotKit
   runtime on http://localhost:4000 via `concurrently`).

3. Wait for the Vite dev server to be ready (poll `http://localhost:5173` every
   2 seconds, up to 30 seconds — exit with error if it never responds).

4. Fetch the page HTML with `curl -s http://localhost:5173` and check for each
   tab's unique content. Report each as **PASS** or **FAIL**:

   | Tab | Unique text to find |
   |---|---|
   | **L2 · Plain chat** | `L2 · Plain chat` |
   | **L3 · Controlled Generative UI** | `L3 · Controlled Generative UI` |
   | **L4 · Declarative Generative UI (A2UI)** | `L4 · Declarative Generative UI` |
   | **🪁 Extend · Plan → approve → act** | `🪁 Extend · Plan → approve → act` |
   | **🔁 Agent Loop · model → tool → re-decide** | `🔁 Agent Loop · model → tool → re-decide` |

5. Print a summary table with all results. If any tab FAILs, exit with a non-zero
   status. If all PASS, print a green **ALL TABS OK** message.

6. Leave the dev server running (the user can stop it with Ctrl+C).

Do not push, and do not edit `.env`.
