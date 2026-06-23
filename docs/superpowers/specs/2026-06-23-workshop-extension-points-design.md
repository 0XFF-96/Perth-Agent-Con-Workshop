# Design — Workshop Extension Points

**Date:** 2026-06-23 · **Status:** approved (design), pending spec review

## Problem

Workshop attendees should be able to *extend* the app live without hand-writing
code — they **direct the agent** (Claude Code via the harness) to fill a
pre-marked seam, then confirm with `/verify`. We want clearly-marked extension
points plus guided commands for five axes:

1. Write a component
2. Introduce a new component (L3 component **or** L4 catalog primitive)
3. Add a new skill (a new slash command)
4. Plan mode — an in-app *plan → approve → act* surface
5. Write your own tool-usage method (a host tool the agent can call)

## Goals

- A **discoverable extension surface**: a `🪁` marker convention + an
  `EXTENDING.md` map, so any seam is one `grep` (or one `/extend`) away.
- **Guided commands** that scaffold each axis safely on rails (read pattern →
  fill seam → `/verify` → report how to trigger).
- A **pre-built plan-mode demo** that also serves as an extension seam.
- Everything runs through the existing harness safety (guard hook, `/verify`,
  permission allowlist). Extensions are **local by default**; attendees commit
  only if they choose to.

## Non-Goals

- Teaching attendees to hand-write React/TypeScript.
- Changing the L2–L4 lessons or their deck-aligned framing.
- A general plugin runtime — these are repo-scoped seams, not a marketplace.

## Current extension surface (survey)

**Harness layer (`.claude/`)** — extends the *agent*:
- Hooks: `hooks/guard-secrets.sh` (PreToolUse·Bash) + `settings.json` registration.
- Commands: `/run`, `/add-component`, `/verify`, `/start-here`.
- Subagents: `agents/copilotkit-reviewer.md`.
- `settings.json`: permission allowlist + hooks. (No `.claude/skills/` dir; commands are the "skills".)

**App layer (`src/` + `server.ts`)** — extends the *product*:
- **L3 component seam** — `useComponent({ name, description, parameters: <zod>, render })`
  in `src/lessons/L3Components.tsx`; component lives in `src/components/<name>.tsx`
  (exports a zod `Props` + the React component). Already carries a `🪁 HANDS-ON KNOB` comment.
- **L4 catalog seam** — `src/catalog/definitions.ts` (component defs) + `renderers.tsx`
  (`createCatalog`).
- **Server tool seam** — `server.ts` `makeAgentWithTools(prompt, [...tools])` +
  `src/lessons/l4-tools.ts`.
- **Agents map / Tabs** — `server.ts` `agents:{default,l2,l3,l4}` + `a2ui.agents`;
  `src/App.tsx` `tabs[]`.

## Design

### 1. The framework spine — `🪁` markers + `EXTENDING.md`

- **Marker convention:** a one-line comment `🪁 EXTENSION POINT: <axis> — <how to extend>`
  placed at each seam (generalizing the existing `🪁 HANDS-ON KNOB`). Always the
  kite emoji so `grep -rn "🪁"` lists every extensible spot.
- **`EXTENDING.md`** (repo root): the extension-point map. One section per axis,
  each with: *what it is · where the seam is (`file:line`) · the guided command ·
  what to say to the agent (a copy-paste example prompt)*. Linked from `README.md`
  and `CLAUDE.md`; `/start-here` ends by pointing here.

### 2. Guided commands (`.claude/commands/`)

| Command | Axis | Lands in | Status |
|---|---|---|---|
| `/add-component` | write / introduce an L3 component | `src/components/<name>.tsx` + `useComponent` in `L3Components.tsx` | exists |
| `/add-tool` | write your own tool-usage method | `src/lessons/l4-tools.ts` host tool + wire into `makeAgentWithTools` in `server.ts` | new |
| `/add-skill` | add a new skill | scaffold a new `.claude/commands/<name>.md` (frontmatter + body), following the existing commands' shape | new |
| `/add-catalog-item` | introduce an L4 catalog primitive | `src/catalog/definitions.ts` def + `renderers.tsx` renderer | new (separate, per decision) |
| `/extend` | quick-reference + router | runs `grep -rn "🪁"`, summarizes the axes from `EXTENDING.md`, asks which axis, then hands off to the matching `/add-*` command | new |

Every `/add-*` command carries the implementer rails: read the existing pattern
first, fill only the seam, run `npm run typecheck` + `npx vitest run`, then report
what was added and an example prompt to trigger it. None of them write secrets or
commit automatically (the guard hook + local-by-default still apply).

`/add-tool` specifics: scaffold a plain function returning a JSON-serializable
object (data, or `{ a2ui_operations: [...] }` for a surface), register it in the
`l4` agent's tool array, and add a one-line system-prompt hint so the agent knows
when to call it — mirroring `getSalesData` / `displayFlights` in `l4-tools.ts`.

`/add-skill` specifics: write `.claude/commands/<name>.md` with a `description`
(and `allowed-tools` if needed) and a clear body, matching `run.md` / `verify.md`.
The new command shows up in Claude Code's `/` menu next session.

### 3. Plan-mode pre-built demo (`plan → approve → act`)

Demonstrates the deck's *You review* loop and doubles as an extension seam.

- **Placement:** a new **`🪁 Extend` tab** in `src/App.tsx` (a new
  `src/lessons/ExtendDemo.tsx`), kept separate from the deck-aligned L2–L4 tabs.
  The tab also hosts links to `EXTENDING.md` / the `/extend` command as the visible
  "home" for extensions.
- **Mechanism (primary — known to work with all-Node `BuiltInAgent`):**
  a **two-turn host-authored** flow, NOT a blocking client wait.
  - Turn 1: user asks → the `l*` agent calls a host tool `proposePlan(goal)` that
    returns `{ plan: [{ step, detail }], planId }`. The UI renders a **plan card**
    with the steps and **Approve / Reject** buttons.
  - The buttons are plain UI: clicking **Approve** sends a normal chat message
    (e.g. `"Approve plan <planId>"`); the agent then calls the action tool(s) to
    execute. **Reject** sends `"Reject plan <planId>"`.
  - This uses only ordinary tool calls + a follow-up user message — the same shape
    L2–L4 already prove works.
- **Known risk (must be verified before choosing the alternative):** the
  "ideal" mechanism is CopilotKit's blocking human-in-the-loop
  (`renderAndWaitForResponse`), but that is a **client-side tool that waits**, and
  the all-Node `BuiltInAgent` did **not** emit `TOOL_CALL_END` for client tools —
  the exact failure that parked L5's sandboxed-HTML path. The primary design above
  deliberately avoids the blocking wait. If a later spike shows
  `renderAndWaitForResponse` works with this runtime, it can replace the two-turn
  flow; until verified, the two-turn host-authored flow is the design.
- **As an extension seam:** a `🪁 EXTENSION POINT` on the plan's action list +
  an `EXTENDING.md` entry: "add a new action that goes through approve" (define a
  new action tool, add it to the plan vocabulary).

### 4. Wiring

- `README.md`: an **"Extend this workshop"** section pointing to `EXTENDING.md`
  and listing the `/add-*` + `/extend` commands.
- `CLAUDE.md`: document the `🪁` marker convention and the extension axes under a
  short "Extension points" heading.
- `/start-here`: final step points attendees to `/extend`.

## The five axes → where they land

| Axis | Seam | Vehicle |
|---|---|---|
| 1 Write a component | L3 `useComponent` | `/add-component` (exists) |
| 2 Introduce a component | L3 component **or** L4 catalog | `/add-component` / `/add-catalog-item` |
| 3 Add a skill | `.claude/commands/` | `/add-skill` |
| 4 Plan mode | `🪁 Extend` tab, `proposePlan` host tool | pre-built demo + seam |
| 5 Tool-usage method | `server.ts` tools + `l4-tools.ts` | `/add-tool` |

## Decisions / defaults (open to change at spec review)

- **Plan mode lives on a new `🪁 Extend` tab** (defaulted; not folded into an L2–L4 lesson).
- **`/add-catalog-item` is its own command** (not folded into `/add-component`).
- **`/extend` quick-reference command is included.**
- **Plan-mode uses the two-turn host-authored flow**, not blocking
  `renderAndWaitForResponse`, until the latter is verified against the all-Node runtime.
- Extensions are **local by default**; the guard hook + `/verify` keep them safe.

## Testing / verification

- New commands: dry-read each for accurate seam references (the `🪁`/file paths
  must resolve); `/add-component` already passes. After authoring, run each
  command's scaffold once and confirm `npm run typecheck` + `npx vitest run` stay green.
- Plan-mode demo: live test the two-turn flow end-to-end with a real key — propose
  a plan, click Approve, confirm execution; click Reject, confirm no action. New
  components get colocated tests per repo convention.
- `/extend`: confirm `grep -rn "🪁"` lists every marked seam and the router maps to
  the right `/add-*` command.
- Whole-repo gate unchanged: `npm run typecheck`, `npx vitest run`, `npm run build`.

## Out of scope

- A blocking human-in-the-loop (`renderAndWaitForResponse`) plan mode — only if a
  separate spike proves it works with the all-Node `BuiltInAgent`.
- Auto-committing or publishing attendee extensions.
- Any change to L2–L4 lesson behavior.
