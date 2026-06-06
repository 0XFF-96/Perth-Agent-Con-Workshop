# Troubleshooting — CopilotKit Version Mismatch & Blank Page

**First version · 2026-05-15**

This doc captures one specific failure mode and how to diagnose it, because it took several wrong turns to find and the symptoms are misleading.

## The symptom

Open http://localhost:5176 → blank white page. No tab bar. No chat. No visible error on the page itself. Network panel shows everything loading with `200` / `304`.

## The actual root cause

`package.json` declares:

```json
"@copilotkit/react-core": "^1.8.0",
"@copilotkit/react-ui":   "^1.8.0"
```

But npm resolves `^1.8.0` to the **latest 1.x** — which is currently **`1.57.1`**, 49 minor versions ahead of what the lesson code was written against. The API has changed substantially in that gap, so code that looks correct against the v1.x docs fails at runtime.

The specific breaking change that hit us:

In `1.57.x`, `useCopilotAction` requires that every action declare **one of** these fields:

| Field | Meaning |
|---|---|
| `handler` | Frontend tool — runs a function, returns result to the LLM |
| `renderAndWait` / `renderAndWaitForResponse` | Human-in-the-loop — UI waits for user input |
| `available: 'frontend'` \| `'disabled'` | Render-only — just shows UI from tool args, no return value |
| `available: 'enabled'` \| `'remote'` | Frontend tool variant |

A bare `{ name, description, parameters, render }` (the old v1.x shape) does **not** match any branch and throws `Error: Invalid action configuration` from `getActionConfig` — at hook-call time, on mount.

Because L3 is the default tab in `App.jsx` (`useState('L3')`) and the error fires during render, the whole React tree crashes inside `CopilotErrorBoundary` → blank page.

## Why it was misleading

1. **The error never appears on the page.** It's thrown inside a CopilotKit error boundary that swallows the UI without showing a fallback. The page just goes white.
2. **Network panel looks healthy.** All files load. There's no failed request to suggest a problem.
3. **`L6Canvas.tsx` was a red herring.** It imported from `@copilotkit/react-core/v2`, which I initially assumed didn't exist. It does — the v2 subpath is present in `1.57.1`. The original `L6Canvas.tsx` would have worked; the real blocker was L3 (the default tab) blowing up first.
4. **The version drift wasn't obvious.** Until you actually inspect `node_modules/@copilotkit/react-core/package.json`, there's nothing in the repo telling you the installed version is 1.57.1 instead of 1.8.x.

## How to diagnose this class of bug next time

Order matters — each step takes seconds and rules out a category:

1. **Open the browser Console**, not just Network. Blank pages are almost always JS runtime errors, and Network won't show them. Look for the red error count badge in DevTools.
2. **Read the stack trace top to bottom.** The first frame in user code (`L3Chat.jsx:7:3` in our case) tells you which component crashed.
3. **Check actually installed versions vs declared:**
   ```bash
   cat frontend/node_modules/@copilotkit/react-core/package.json | grep '"version"'
   ```
   If this differs significantly from `package.json`, treat the docs/examples you were following as suspect.
4. **Find the error string in the bundled code.** The thrown message (`"Invalid action configuration"`) is a literal string in the library source. `grep` it inside `node_modules` to find the validation function and read what shape it actually expects.

## The fix that was applied

Added `available: 'frontend'` to every render-only action:

- [frontend/src/lessons/L3Chat.jsx](frontend/src/lessons/L3Chat.jsx): `showFlightCard`, `showPieChart`
- [frontend/src/lessons/L4Chat.jsx](frontend/src/lessons/L4Chat.jsx): `renderLayout`
- [frontend/src/lessons/L5Chat.jsx](frontend/src/lessons/L5Chat.jsx): `openApp`

L6 was rewritten as [frontend/src/lessons/L6Chat.jsx](frontend/src/lessons/L6Chat.jsx) using v1 hooks (`useCopilotReadable` + `useCopilotAction` with `handler`), replacing the v2-API [frontend/src/lessons/L6Canvas.tsx](frontend/src/lessons/L6Canvas.tsx). The old file is still in the repo and could be revived — it's not broken, just written against the v2 API surface.

Example of the change:

```jsx
useCopilotAction({
  name: 'showFlightCard',
  description: '...',
  available: 'frontend',        // <- this line is the fix
  parameters: [ /* ... */ ],
  render: ({ args }) => <FlightCard {...args} />,
});
```

## Recommendation: pin the versions

Change `frontend/package.json` from:

```json
"@copilotkit/react-core": "^1.8.0",
"@copilotkit/react-ui":   "^1.8.0"
```

to exact pins:

```json
"@copilotkit/react-core": "1.57.1",
"@copilotkit/react-ui":   "1.57.1"
```

The lesson briefs in `L2.md` – `L6.md` describe APIs that have evolved across CopilotKit's release history. Allowing `^` ranges means a fresh `npm install` on a new machine could pull a newer version with further API changes, reintroducing this same class of failure with different symptoms. Pinning makes the dev environment reproducible and matches the assumption baked into the lesson code.

If you later want to upgrade intentionally, do it as a deliberate step: read the CopilotKit changelog for the new range, run through every `useCopilotAction` / `useCopilotReadable` / `useFrontendTool` call site in `frontend/src/lessons/`, and update shapes to match.

## Open follow-ups

- [ ] Decide whether to revive [L6Canvas.tsx](frontend/src/lessons/L6Canvas.tsx) (v2 API, LangGraph-style shared state) or keep [L6Chat.jsx](frontend/src/lessons/L6Chat.jsx) (v1 API, matches the CLAUDE.md description).
- [ ] Pin `@copilotkit/*` versions in `frontend/package.json`.
- [ ] Audit L4's `renderLayout` and L5's `openApp` flows end-to-end against 1.57.x — the validation passes now, but argument shapes streamed from the LLM may behave differently than the v1.x examples assume.
