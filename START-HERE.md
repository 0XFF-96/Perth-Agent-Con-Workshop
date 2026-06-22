# START HERE — no coding required

You don't need to know how to write code. Here, **you tell an AI what you want and
it writes the code** — and this project ships a "harness" (guardrails + shortcuts)
that keeps that safe and on track.

You need two things: a way to run it, and an API key.

## Pick your AI assistant

This workshop works with **either** of two terminal coding agents — use whichever
you like, they're equal options:

- **[Claude Code](https://claude.com/claude-code)** — run `claude`, then `/start-here`.
- **[pi](https://pi.dev)** — run `pi`, then `/skill:run` or `/skill:verify`.

Both read this project's `CLAUDE.md` instructions and the same API key from `.env`,
so anything below works the same for both. Where a step says `claude`, you can run
`pi` instead.

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
3. Open a terminal in the project folder and run **one** of these — they install
   everything and ask you to paste your API key (kept only on your machine, never
   committed):
   ```bash
   npm run setup       # if you'll use Claude Code
   make setup-pi       # if you'll use pi (also installs pi for you)
   ```
4. Start your assistant: run `claude` then type **`/start-here`**, or run `pi`
   then type **`/skill:run`**.

## What you'll do in ~30 minutes

`/start-here` walks you through it: a plain-English tour, seeing the app run, then
making a real change by *describing it to the AI* — and checking it with `/verify`.

> Heads up: if a command gets blocked (for safety) or a push asks for confirmation,
> that's the harness protecting you — not an error.

---
Developers: the technical quick-start is in [README.md](README.md).
