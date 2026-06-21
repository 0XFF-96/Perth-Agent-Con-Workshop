#!/usr/bin/env bash
# PreToolUse(Bash) guard for the workshop repo.
# Blocks any Bash command that would leak an API key or commit the local .env.
# Contract: exit 2 = block; stderr is shown to Claude. Wired in .claude/settings.json.
#
# Teaching note: this is the smallest useful "harness" guard — a single hook that
# turns the repo's #1 footgun (a pasted key / committed .env) into a hard stop.

payload="$(cat)"

# 1) An API key pasted into the command itself
#    (OpenAI sk-... / sk-proj-..., Anthropic sk-ant-...).
if printf '%s' "$payload" | grep -Eq 'sk-(proj-|ant-)?[A-Za-z0-9_-]{16,}'; then
  echo "BLOCKED by guard-secrets: that command contains what looks like an API key. Never inline a key — put it in .env (gitignored) and let the app read it via dotenv." >&2
  exit 2
fi

# 2) Adding the local .env as a `git add` pathspec. Tight on purpose: it must be
#    `.env` (or ./.env, or after -f) right after `git add`, so it allows
#    `.env.example` and does NOT trip on commit MESSAGES that merely mention .env.
if printf '%s' "$payload" | grep -Eq 'git[[:space:]]+add[[:space:]]+(--?[A-Za-z][A-Za-z-]*[[:space:]]+)*\.?/?\.env([^.A-Za-z0-9]|$)'; then
  echo "BLOCKED by guard-secrets: refusing to 'git add' .env — it holds your key and must stay local + gitignored. (.env.example is fine.)" >&2
  exit 2
fi

exit 0
