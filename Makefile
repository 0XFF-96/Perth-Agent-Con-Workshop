# Makefile — one-command environment check + install for the AgentCon workshop.
#
#   make setup     →  detect what's missing, then install everything (start here)
#   make doctor    →  just diagnose the environment (no changes)
#   make           →  show this help
#
# Recipes must be TAB-indented. This wraps the existing `scripts/setup.mjs`
# so there's a single source of truth for the npm-side logic.

SHELL := /bin/bash
.DEFAULT_GOAL := help

NODE_MIN := 20

# Pretty markers
OK   := \033[32m✓\033[0m
WARN := \033[33m!\033[0m
BAD  := \033[31m✗\033[0m

.PHONY: help setup doctor install dev verify clean

help: ## Show available commands
	@echo ""
	@echo "  AgentCon Perth 2026 — Agentic Generative-UI workshop"
	@echo ""
	@grep -hE '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'
	@echo ""

setup: doctor install ## Detect what's missing + install everything (one command)
	@echo ""
	@echo "Running project setup (.env + API key + typecheck)…"
	@node scripts/setup.mjs

doctor: ## Detect what your environment may be missing (read-only)
	@echo ""
	@echo "🩺 Environment doctor"
	@echo "---------------------"
	@# --- Node.js (required, $(NODE_MIN)+) ---
	@if command -v node >/dev/null 2>&1; then \
		ver=$$(node -v | sed 's/v//'); major=$${ver%%.*}; \
		if [ "$$major" -ge "$(NODE_MIN)" ]; then \
			printf "  $(OK) Node.js       $$ver\n"; \
		else \
			printf "  $(BAD) Node.js       $$ver  (need $(NODE_MIN)+ — see https://nodejs.org)\n"; \
		fi; \
	else \
		printf "  $(BAD) Node.js       missing  (install $(NODE_MIN)+ from https://nodejs.org)\n"; \
	fi
	@# --- npm (required) ---
	@if command -v npm >/dev/null 2>&1; then \
		printf "  $(OK) npm          $$(npm -v)\n"; \
	else \
		printf "  $(BAD) npm          missing  (ships with Node.js)\n"; \
	fi
	@# --- git (recommended) ---
	@if command -v git >/dev/null 2>&1; then \
		printf "  $(OK) git          $$(git --version | awk '{print $$3}')\n"; \
	else \
		printf "  $(WARN) git          missing  (recommended: https://git-scm.com)\n"; \
	fi
	@# --- dependencies installed? ---
	@if [ -d node_modules ]; then \
		printf "  $(OK) node_modules installed\n"; \
	else \
		printf "  $(WARN) node_modules not installed  (run: make install)\n"; \
	fi
	@# --- .env file ---
	@if [ -f .env ]; then \
		printf "  $(OK) .env         present\n"; \
	else \
		printf "  $(WARN) .env         missing  (setup will copy it from .env.example)\n"; \
	fi
	@# --- API key (env var or .env) ---
	@if [ -n "$$OPENAI_API_KEY" ] || [ -n "$$ANTHROPIC_API_KEY" ]; then \
		printf "  $(OK) API key      found in environment\n"; \
	elif [ -f .env ] && grep -Eq '^(OPENAI|ANTHROPIC)_API_KEY=.+' .env; then \
		printf "  $(OK) API key      set in .env\n"; \
	else \
		printf "  $(WARN) API key      not set  (add OPENAI_API_KEY or ANTHROPIC_API_KEY to .env)\n"; \
	fi
	@echo ""

install: ## Install npm dependencies
	@if ! command -v npm >/dev/null 2>&1; then \
		echo "$(BAD) npm not found — install Node.js $(NODE_MIN)+ first (https://nodejs.org)"; \
		exit 1; \
	fi
	@echo "📦 Installing dependencies…"
	@npm install

dev: ## Run the app (Vite frontend + CopilotKit runtime)
	@npm run dev

verify: ## Quality gate: typecheck + tests + build
	@npm run typecheck && npx vitest run && npm run build

clean: ## Remove installed dependencies and build output
	@rm -rf node_modules dist
	@echo "🧹 Removed node_modules and dist"
