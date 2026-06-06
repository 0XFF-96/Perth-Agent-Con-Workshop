# A2UI Demo — Generative UI with CopilotKit + AG-UI

A runnable walk-through of the **A2UI / CopilotKit / AG-UI** curriculum (lessons L2 → L6) as a single tabbed React app backed by a Node.js agent.

Each tab shows a different point on the generative-UI spectrum, all talking to the **same** agent over the AG-UI protocol.

| Tab | Pattern | What to try |
| --- | --- | --- |
| **L2 · Basic** | Plain streaming chat | "Hi, what can you do?" |
| **L3 · Controlled** | Registered components as tools | "Show a flight card for Pacific Air from SFO to JFK at 08:30 for $249"<br>"Pie chart of my time: 40% coding, 30% meetings, 20% email, 10% other" |
| **L4 · Declarative** | Catalog of primitives, agent composes layouts via a schema | "Build a sales dashboard with revenue $48k (+12%), 312 signups (-4%), 2.1% churn"<br>"Show a 3-row pricing comparison: Free, Pro, Enterprise" |
| **L5 · Open** | Agent routes to full external apps | "Open a whiteboard so I can sketch a system diagram"<br>"I want to explore some sales data interactively" |
| **L6 · Canvas** | Shared state between agent and UI | "Add a todo to ship the demo"<br>"Mark the first one done"<br>"Highlight anything mentioning dashboard" |

## Quick start

Requires Node.js 20+ and an OpenAI API key.

```bash
make install                        # installs backend + frontend, copies .env.example
$EDITOR backend/.env                # paste your OPENAI_API_KEY
make dev                            # backend :4000 + frontend :5176
```

Open http://localhost:5176.

## Architecture in one diagram

```
┌──────────────────────────────────────┐         ┌──────────────────────────────────────┐
│ React + CopilotKit (Vite, :5176)     │         │ Express + CopilotRuntime (:4000)     │
│                                      │         │                                      │
│  <CopilotKit runtimeUrl=…/copilotkit>│         │  /copilotkit  ── BuiltInAgent        │
│   └─ <CopilotChat>                   │ ◄─────► │                  └─ OpenAI gpt-4o    │
│      useCopilotAction({ render })    │ AG-UI   │                                      │
│      useCopilotReadable(state)       │ stream  │  tools ← from frontend (auto-bound)  │
└──────────────────────────────────────┘         └──────────────────────────────────────┘
```

**The boundary at `/copilotkit` is the load-bearing piece.**

- Every tool the agent calls (`showFlightCard`, `renderLayout`, `addTodo`, …) is **registered on the frontend** via `useCopilotAction` and automatically appears in the LLM's tool list — the backend doesn't need to know about UI components.
- Swapping the LLM (OpenAI → Anthropic → Gemini) is a one-line change to the `model` string in [backend/index.js](backend/index.js); the frontend doesn't change.

## How each lesson is implemented

- **L2** — [frontend/src/lessons/L2Chat.jsx](frontend/src/lessons/L2Chat.jsx). Just `<CopilotChat>`.
- **L3** — [frontend/src/lessons/L3Chat.jsx](frontend/src/lessons/L3Chat.jsx). Registers `showFlightCard` and `showPieChart` with `render` that returns a React component. The agent receives them as tools; CopilotKit streams the tool-call args into `render` inline.
- **L4** — [frontend/src/a2ui/catalog.js](frontend/src/a2ui/catalog.js) defines primitives (Container, Grid, Card, Stat, Text, Table, Badge). [frontend/src/a2ui/Renderer.jsx](frontend/src/a2ui/Renderer.jsx) is a recursive renderer. The agent calls a single `renderLayout(schema)` tool with a tree of `{ type, props, children }` nodes.
- **L5** — [frontend/src/lessons/L5Chat.jsx](frontend/src/lessons/L5Chat.jsx). An `openApp` tool with a small registry of embeddable apps (Excalidraw, tldraw, pivot table). The component renders the chosen app in a sandboxed iframe. The lesson's formal MCP Apps protocol would replace the registry with MCP server discovery — this captures the open-ended UX without requiring an external server.
- **L6** — [frontend/src/lessons/L6Chat.jsx](frontend/src/lessons/L6Chat.jsx). Local React state for the todo list, exposed to the agent with `useCopilotReadable`. Mutations go through `useCopilotAction` handlers that call `setTodos`. The original lesson does this with a LangGraph state graph and `Command(update={...})`; this demo achieves the same shared-state UX without the graph layer.

## Sharing this demo

The frontend listens on port 5176 and the backend on 4000. To show this off without standing up infrastructure, run `make dev` locally and screen-share the browser. The five tabs walk through the full generative-UI spectrum in roughly 5 minutes.

If you want to publish it, the easiest path is:
1. Deploy the backend (any Node host: Render, Fly, Railway) with `OPENAI_API_KEY` set.
2. Change `runtimeUrl` in [frontend/src/App.jsx](frontend/src/App.jsx) to the deployed backend URL.
3. Build the frontend with `cd frontend && npm run build` and host the `dist/` folder anywhere static (Vercel, Netlify, S3, GitHub Pages).
