# START HERE — no coding required

You don't need to know how to write code. Here, **you tell an AI what you want and
it writes the code** — and this project ships a "harness" (guardrails + shortcuts)
that keeps that safe and on track.

You need two things: a way to run it, and an API key.

## Fastest: in the cloud (GitHub Codespaces)

1. On this repo's GitHub page, click the green **Code** button → **Codespaces** →
   **Create codespace on main**.
2. Add your API key as a **Codespaces secret** named `OPENAI_API_KEY`
   (GitHub → Settings → Codespaces → New secret), then rebuild the codespace.
3. Wait for it to finish setting up — it installs everything for you.
4. In the terminal, run `claude` (sign in if it asks), then type **`/start-here`**.

## Or: on your own computer

1. Install [Node.js 20+](https://nodejs.org) and
   [Claude Code](https://claude.com/claude-code).
2. Download this project (green **Code** button → **Download ZIP**, or `git clone`).
3. Open a terminal in the project folder and run:
   ```bash
   npm run setup
   ```
   It installs everything and asks you to paste your API key (kept only on your
   machine, never committed).
4. Run `claude`, then type **`/start-here`**.

## What you'll do in ~30 minutes

`/start-here` walks you through it: a plain-English tour, seeing the app run, then
making a real change by *describing it to the AI* — and checking it with `/verify`.

> Heads up: if a command gets blocked (for safety) or a push asks for confirmation,
> that's the harness protecting you — not an error.

---
Developers: the technical quick-start is in [README.md](README.md).
