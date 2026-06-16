# Agentic CRM Workshop Demo

A runnable workshop proof object for **"Reinvent Old Software in an Agentic Way"**.

The demo shows one old CRM workflow transformed across several agentic UI placements:

> **Same user intent. Different placement.**

Repeated prompt:

```text
Prepare my Q3 follow-up for Acme Corp and show me what changed.
```

## What This Demonstrates

| Tab | Pattern | Workshop point |
| --- | --- | --- |
| **Old Software** | Fixed CRM screen | The user translates intent into navigation, inspection, and manual updates. |
| **L2 Chat** | Text-only assistant | Useful advice, but detached from product state and workflow. |
| **L3 Components** | Components as tools | The agent chooses approved CRM cards from the design system. |
| **L4 Compose** | Catalog + composition | The agent assembles a workspace from structured UI primitives. |
| **L5 Tools** | Route to tools | The agent opens tool-shaped surfaces instead of reinventing every UI. |
| **L6 Shared State** | Shared account plan | The user and agent work from the same state; checking a task updates the agent summary. |

This version is deterministic and browser-local by design. It does **not** require an OpenAI API key, so it is safe for live workshop demos.

## Quick Start

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open the printed local URL, usually:

```text
http://127.0.0.1:5173/
```

## Verification

```bash
npm test -- --run
npm run build
```

## Workshop Docs

- Slide/source document: [docs/presentation/agentic-workshop-slide-doc.md](docs/presentation/agentic-workshop-slide-doc.md)
- Implementation plan: [docs/superpowers/plans/2026-06-06-crm-agentic-workshop-demo.md](docs/superpowers/plans/2026-06-06-crm-agentic-workshop-demo.md)
- Original workshop design spec: [docs/superpowers/specs/2026-05-28-workshop-design.md](docs/superpowers/specs/2026-05-28-workshop-design.md)

## Demo Script

1. Start on **Old Software** and explain that all data exists, but the user operates the system manually.
2. Move to **L2 Chat** and show that the agent gives advice but does not reshape or update the workflow.
3. Move to **L3 Components** and explain that the design system becomes callable.
4. Move to **L4 Compose** and explain catalog-driven composition.
5. Move to **L5 Tools** and explain routing to the right surface.
6. Move to **L6 Shared State**, check a task, and show that the agent summary reads the same changed state.
