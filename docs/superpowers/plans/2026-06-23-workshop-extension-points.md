# Workshop Extension Points Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give workshop attendees clearly-marked, agent-fillable extension points (a `🪁` marker convention + `EXTENDING.md` map, guided `/add-*` commands, an `/extend` router, and a pre-built plan→approve→act demo) so they extend the app by directing the agent, not hand-coding.

**Architecture:** A marker convention + docs make seams discoverable; small markdown slash commands scaffold each axis on rails; the plan-mode demo reuses the proven L3 client-component mechanism (`useComponent` render-only `planCard`/`planResult` + a dedicated `extend` agent), so the user reviews a plan and approves by typing — no blocking client wait, no new SDK API.

**Tech Stack:** Claude Code commands/markdown, CopilotKit v2 (`@copilotkit/react-core/v2` `useComponent`, `@copilotkit/runtime/v2` `BuiltInAgent`), React 18 + TS, zod, vitest.

## Global Constraints

- **No new npm dependencies** — use what the repo already has.
- **No hand-coding required of attendees** — every axis is driven by directing the agent (a `/add-*` command or a plain-English prompt against a marked seam).
- **Plan-mode uses the L3 client-component mechanism**, NOT blocking `renderAndWaitForResponse` and NOT a client send-message API (the all-Node `BuiltInAgent` did not emit `TOOL_CALL_END` for client tools — the failure that parked L5). User approval is a typed follow-up message.
- **Do not change L2–L4 lesson behavior**; the deck-aligned tabs stay as-is. The new tab is `🪁 Extend`, not an L-level.
- **Marker is always the kite emoji** `🪁` so `grep -rn "🪁"` lists every seam.
- **Every component rendered by `useComponent` defaults all array/object props** (streaming sends partial props; an undefined `.map` white-screens the page).
- **`l4-tools.ts`/`server.ts` use relative imports** (tsx does not resolve the `@/` alias server-side); `src/**` uses the `@/` alias.
- Match existing style; commit per task; extensions are local by default.

---

## File Structure

- `EXTENDING.md` (new, root) — the extension-point map (5 axes).
- `.claude/commands/add-tool.md`, `add-skill.md`, `add-catalog-item.md`, `extend.md` (new).
- `src/components/plan-card.tsx` + `plan-card.test.tsx` (new) — plan display component.
- `src/components/plan-result.tsx` + `plan-result.test.tsx` (new) — outcome component.
- `src/lessons/ExtendDemo.tsx` (new) — registers `planCard`/`planResult` + `CopilotChat agentId="extend"`.
- `server.ts` (modify) — add the `extend` agent.
- `src/App.tsx` (modify) — add the `🪁 Extend` tab.
- `README.md`, `CLAUDE.md` (modify) — "Extend this workshop" + marker convention.
- `🪁 EXTENSION POINT` comments added at: `L3Components.tsx`, `l4-tools.ts`, `src/catalog/definitions.ts`, `server.ts`, `ExtendDemo.tsx`.

---

### Task 1: `🪁` markers + `EXTENDING.md` map

**Files:**
- Modify: `src/lessons/L3Components.tsx`, `src/lessons/l4-tools.ts`, `src/catalog/definitions.ts`, `server.ts`
- Create: `EXTENDING.md`

**Interfaces:**
- Produces: the `🪁 EXTENSION POINT:` comment convention and `EXTENDING.md`, referenced by later command tasks and the docs task.

- [ ] **Step 1: Add a marker at each existing seam**

In `src/lessons/L3Components.tsx`, add above the first `useComponent(` call (keep the existing 🪁 HANDS-ON KNOB comment):

```tsx
  // 🪁 EXTENSION POINT: add a controlled L3 component — run /add-component, or
  // register another useComponent({ name, description, parameters, render }) below.
```

In `src/lessons/l4-tools.ts`, add above `export const getSalesData`:

```ts
// 🪁 EXTENSION POINT: add a host tool the agent can call — run /add-tool, or copy a
// defineTool({ name, description, parameters, execute }) block and register it in server.ts.
```

In `src/catalog/definitions.ts`, add above `export const demonstrationCatalogDefinitions`:

```ts
// 🪁 EXTENSION POINT: add an L4 catalog primitive — run /add-catalog-item, then add a
// matching renderer in renderers.tsx.
```

In `server.ts`, add above the `agents: {` line:

```ts
  // 🪁 EXTENSION POINT: add an agent (a new level/tab) here, and give it tools via
  // makeAgentWithTools(prompt, [tool1, tool2]).
```

- [ ] **Step 2: Create `EXTENDING.md`**

Create `EXTENDING.md`:

````markdown
# Extending this workshop

You don't write code by hand here — you **tell the agent what you want** and it
fills a marked seam. Every seam is tagged `🪁 EXTENSION POINT`; list them all with:

```bash
grep -rn "🪁" .
```

or just run **`/extend`** in Claude Code for a guided menu.

| You want to… | Command | Seam | Say to the agent |
|---|---|---|---|
| Add a controlled UI component (L3) | `/add-component` | `src/components/` + `useComponent` in `src/lessons/L3Components.tsx` | "Add a weather card component that shows city, temp, and conditions." |
| Add an A2UI catalog primitive (L4) | `/add-catalog-item` | `src/catalog/definitions.ts` + `renderers.tsx` | "Add a Stat primitive with a label and a big value." |
| Add a tool the agent can call | `/add-tool` | `src/lessons/l4-tools.ts` + `server.ts` | "Add a tool that returns the current weather for a city." |
| Add a new skill (slash command) | `/add-skill` | `.claude/commands/` | "Add a /smoke skill that starts the app and checks the tabs load." |
| Add a plan→approve→act action | (edit the `extend` agent + `planResult`) | `src/lessons/ExtendDemo.tsx` + the `extend` agent in `server.ts` | "Make 'archive my old accounts' go through a plan I approve first." |

After any change, run **`/verify`** (typecheck + tests + build). Extensions stay
local unless you commit them.
````

- [ ] **Step 3: Verify the markers are discoverable**

Run: `grep -rn "🪁" src server.ts EXTENDING.md`
Expected: at least 5 hits — `L3Components.tsx` (HANDS-ON KNOB + EXTENSION POINT), `l4-tools.ts`, `definitions.ts`, `server.ts`, plus `EXTENDING.md`.

- [ ] **Step 4: Commit**

```bash
git add EXTENDING.md src/lessons/L3Components.tsx src/lessons/l4-tools.ts src/catalog/definitions.ts server.ts
git commit -m "feat(extend): 🪁 extension-point markers + EXTENDING.md map"
```

---

### Task 2: Guided commands `/add-tool`, `/add-skill`, `/add-catalog-item`

**Files:**
- Create: `.claude/commands/add-tool.md`, `.claude/commands/add-skill.md`, `.claude/commands/add-catalog-item.md`

**Interfaces:**
- Consumes: the seams marked in Task 1.
- Produces: three Claude Code slash commands (filename → command name).

- [ ] **Step 1: Create `/add-tool`**

Create `.claude/commands/add-tool.md`:

```markdown
---
description: Scaffold a host tool the agent can call, following the l4-tools.ts defineTool pattern
argument-hint: <tool-name> <what the tool does>
allowed-tools: Read, Edit, Write, Bash
---
Arguments: `$ARGUMENTS`
Treat the **first token** as the tool name and **the rest** as what it does. If no
arguments were given, ask me for them.

Add a new server-side tool the agent can call, following the existing pattern exactly.

Steps:
1. Read `src/lessons/l4-tools.ts` (the `defineTool({ name, description, parameters, execute })`
   pattern; note it uses relative imports and `execute` returns a plain object) and
   `server.ts` (how tools are passed to `makeAgentWithTools`).
2. Add a `defineTool(...)` export to `src/lessons/l4-tools.ts`: a zod `parameters`
   schema and an `execute` that returns a plain JSON-serializable object (data, or
   `{ a2ui_operations: [...] }` for an A2UI surface).
3. In `server.ts`, import the new tool and add it to the `l4` agent's tool array in
   `makeAgentWithTools(...)`, and add a one-line hint to that agent's prompt so the
   model knows when to call it.
4. Run `npm run typecheck` and `npx vitest run`; fix anything red.
5. Summarize what you added and a chat prompt I can use to trigger it (on the L4 tab).

Do not add new dependencies. Do not commit unless I ask.
```

- [ ] **Step 2: Create `/add-skill`**

Create `.claude/commands/add-skill.md`:

```markdown
---
description: Scaffold a new Claude Code slash command (skill) in .claude/commands/
argument-hint: <skill-name> <what it should do>
allowed-tools: Read, Write
---
Arguments: `$ARGUMENTS`
Treat the **first token** as the skill name and **the rest** as what it should do.
If no arguments were given, ask me for them.

Create a new slash command, following the existing commands' shape.

Steps:
1. Read `.claude/commands/verify.md` and `.claude/commands/run.md` to match the
   frontmatter (`description`, optional `allowed-tools`) and body style.
2. Create `.claude/commands/<skill-name>.md` with a clear `description` and a body
   that tells the agent exactly what to do, in numbered steps.
3. Tell me to start a new Claude Code session (or that it's available now) and that
   the command will appear in the `/` menu as `/<skill-name>`.

Keep it focused. Do not commit unless I ask.
```

- [ ] **Step 3: Create `/add-catalog-item`**

Create `.claude/commands/add-catalog-item.md`:

```markdown
---
description: Add an A2UI catalog primitive (L4) — a definition plus a renderer
argument-hint: <PrimitiveName> <what it renders>
allowed-tools: Read, Edit, Bash
---
Arguments: `$ARGUMENTS`
Treat the **first token** as the primitive name (PascalCase) and **the rest** as
what it renders. If no arguments were given, ask me for them.

Add a new primitive to the A2UI catalog, following the existing pattern exactly.

Steps:
1. Read `src/catalog/definitions.ts` (the shape of each primitive definition) and
   `src/catalog/renderers.tsx` (how each definition maps to a React renderer via
   `createCatalog`).
2. Add the primitive's definition to `demonstrationCatalogDefinitions` in
   `definitions.ts`, mirroring an existing entry (e.g. `Card` or `Text`).
3. Add the matching renderer in `renderers.tsx` so the primitive paints real UI.
   Default every array/object field.
4. Run `npm run typecheck` and `npx vitest run`; fix anything red.
5. Summarize what you added and an L4 prompt that would make the agent compose with it.

Do not add new dependencies. Do not commit unless I ask.
```

- [ ] **Step 4: Verify the commands' seam references resolve**

Run: `ls src/lessons/l4-tools.ts server.ts .claude/commands/verify.md .claude/commands/run.md src/catalog/definitions.ts src/catalog/renderers.tsx`
Expected: all six paths exist (no "No such file").

- [ ] **Step 5: Commit**

```bash
git add .claude/commands/add-tool.md .claude/commands/add-skill.md .claude/commands/add-catalog-item.md
git commit -m "feat(extend): /add-tool, /add-skill, /add-catalog-item guided commands"
```

---

### Task 3: `/extend` router command

**Files:**
- Create: `.claude/commands/extend.md`

**Interfaces:**
- Consumes: the `🪁` markers (Task 1), `EXTENDING.md` (Task 1), and the `/add-*` commands (Task 2 + existing `/add-component`).

- [ ] **Step 1: Create `/extend`**

Create `.claude/commands/extend.md`:

```markdown
---
description: List every extension point and route me to the right one (start here to extend the app)
allowed-tools: Bash, Read
---
Help me extend this workshop app. I will NOT hand-write code — you do it.

Steps:
1. Run `grep -rn "🪁" . --include=*.ts --include=*.tsx --include=*.md` to list every
   marked extension point.
2. Read `EXTENDING.md` and present the five axes as a short numbered menu:
   1) a UI component (L3) → `/add-component`
   2) an A2UI catalog primitive (L4) → `/add-catalog-item`
   3) a tool the agent can call → `/add-tool`
   4) a new skill / slash command → `/add-skill`
   5) a plan→approve→act action → edit the `extend` agent + `planResult`
3. Ask which one I want and what it should do.
4. Hand off by running the matching `/add-*` command with my answer, or (for #5)
   guide the edit to `src/lessons/ExtendDemo.tsx` + the `extend` agent in `server.ts`.

Keep it friendly and concrete — assume I've never written code.
```

- [ ] **Step 2: Verify the router's grep works**

Run: `grep -rn "🪁" . --include=*.ts --include=*.tsx --include=*.md`
Expected: lists the Task-1 markers and the EXTENDING.md table — non-empty output.

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/extend.md
git commit -m "feat(extend): /extend router command (lists 🪁 points + routes to /add-*)"
```

---

### Task 4: Plan-mode components — `PlanCard` + `PlanResult` (TDD)

**Files:**
- Create: `src/components/plan-card.tsx`, `src/components/plan-card.test.tsx`
- Create: `src/components/plan-result.tsx`, `src/components/plan-result.test.tsx`

**Interfaces:**
- Produces: `PlanCardProps` (zod), `PlanCard` (React) and `PlanResultProps` (zod), `PlanResult` (React), consumed by `ExtendDemo.tsx` in Task 5. Mirror `src/components/flight-card.tsx` (zod `Props` export + component with defaulted array props).

- [ ] **Step 1: Write the failing tests**

Create `src/components/plan-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PlanCard } from "./plan-card";

describe("PlanCard", () => {
  it("renders with no props without crashing", () => {
    render(<PlanCard />);
    expect(screen.getByText(/plan/i)).toBeInTheDocument();
  });
  it("renders the goal and each step", () => {
    render(
      <PlanCard
        goal="Flag at-risk Q3 accounts"
        steps={[
          { title: "Query", detail: "Find accounts with no contact in 60 days" },
          { title: "Mark", detail: "Set status to at-risk" },
        ]}
      />,
    );
    expect(screen.getByText("Flag at-risk Q3 accounts")).toBeInTheDocument();
    expect(screen.getByText("Query")).toBeInTheDocument();
    expect(screen.getByText("Mark")).toBeInTheDocument();
    expect(screen.getByText(/type .*approve/i)).toBeInTheDocument();
  });
});
```

Create `src/components/plan-result.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PlanResult } from "./plan-result";

describe("PlanResult", () => {
  it("renders with no props without crashing", () => {
    render(<PlanResult />);
    expect(screen.getByText(/plan/i)).toBeInTheDocument();
  });
  it("shows a done summary", () => {
    render(<PlanResult status="done" summary="Marked 3 accounts at-risk." />);
    expect(screen.getByText("Marked 3 accounts at-risk.")).toBeInTheDocument();
  });
  it("shows a cancelled state", () => {
    render(<PlanResult status="cancelled" summary="No changes made." />);
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/plan-card.test.tsx src/components/plan-result.test.tsx`
Expected: FAIL — cannot resolve `./plan-card` / `./plan-result`.

- [ ] **Step 3: Implement `PlanCard`**

Create `src/components/plan-card.tsx`:

```tsx
import { z } from "zod";

export const PlanCardProps = z.object({
  goal: z.string().default(""),
  steps: z
    .array(
      z.object({
        title: z.string().default(""),
        detail: z.string().default(""),
      }),
    )
    .default([]),
});

export function PlanCard({ goal = "", steps = [] }: z.infer<typeof PlanCardProps>) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, maxWidth: 560 }}>
      <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "#6d28d9", fontWeight: 700 }}>
        Plan · review before it runs
      </div>
      <h3 style={{ margin: "4px 0 12px" }}>{goal || "Proposed plan"}</h3>
      <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map((s, i) => (
          <li key={i}>
            <strong>{s.title}</strong>
            {s.detail ? <span style={{ color: "#6b7280" }}> — {s.detail}</span> : null}
          </li>
        ))}
      </ol>
      <p style={{ marginTop: 12, fontSize: 13, color: "#374151" }}>
        Type <strong>approve</strong> to run this, or <strong>reject</strong> to cancel.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Implement `PlanResult`**

Create `src/components/plan-result.tsx`:

```tsx
import { z } from "zod";

export const PlanResultProps = z.object({
  status: z.enum(["done", "cancelled"]).default("done"),
  summary: z.string().default(""),
});

export function PlanResult({ status = "done", summary = "" }: z.infer<typeof PlanResultProps>) {
  const cancelled = status === "cancelled";
  return (
    <div
      style={{
        border: `1px solid ${cancelled ? "#f0d9d2" : "#cfe5d6"}`,
        background: cancelled ? "#fdf4f2" : "#eef6f0",
        borderRadius: 12,
        padding: 16,
        maxWidth: 560,
      }}
    >
      <strong>{cancelled ? "Plan cancelled" : "Plan executed"}</strong>
      <p style={{ margin: "6px 0 0", color: "#374151" }}>
        {summary || (cancelled ? "No changes made." : "Done.")}
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/components/plan-card.test.tsx src/components/plan-result.test.tsx`
Expected: PASS — 5 tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/plan-card.tsx src/components/plan-card.test.tsx src/components/plan-result.tsx src/components/plan-result.test.tsx
git commit -m "feat(extend): PlanCard + PlanResult components for plan-mode (TDD)"
```

---

### Task 5: Plan-mode wiring — `extend` agent + `ExtendDemo` lesson + tab

**Files:**
- Modify: `server.ts` (add the `extend` agent)
- Create: `src/lessons/ExtendDemo.tsx`
- Modify: `src/App.tsx` (add the `🪁 Extend` tab)

**Interfaces:**
- Consumes: `PlanCard`/`PlanCardProps`, `PlanResult`/`PlanResultProps` (Task 4); `makeAgent` (existing in `server.ts`); `useComponent`, `CopilotChat` (`@copilotkit/react-core/v2`); `ExamplePrompts` (`@/components/example-prompts`).

- [ ] **Step 1: Add the `extend` agent in `server.ts`**

In `server.ts`, inside the `agents: {` object (after the `l4:` entry), add:

```ts
    extend: makeAgent(
      [
        "You run a plan → approve → act loop. NEVER take the action immediately.",
        "When the user states a goal, FIRST call the planCard component with the goal",
        "and 2–4 concrete steps, and stop — let the user review.",
        "When the user approves (e.g. 'approve', 'yes', 'do it'), call planResult with",
        "status 'done' and a one-line summary of what you did.",
        "If the user rejects (e.g. 'reject', 'no', 'cancel'), call planResult with",
        "status 'cancelled'. Only call planResult after the user has approved or rejected.",
      ].join(" "),
    ),
```

- [ ] **Step 2: Create the `ExtendDemo` lesson**

Create `src/lessons/ExtendDemo.tsx`:

```tsx
import { CopilotChat, useComponent } from "@copilotkit/react-core/v2";
import { PlanCard, PlanCardProps } from "@/components/plan-card";
import { PlanResult, PlanResultProps } from "@/components/plan-result";
import { ExamplePrompts } from "@/components/example-prompts";

export default function ExtendDemo() {
  // 🪁 EXTENSION POINT: add a plan→approve→act action — give the `extend` agent
  // (server.ts) a new goal to plan for, and the planResult below renders the outcome.
  useComponent({
    name: "planCard",
    description:
      "Lay out a plan of 2-4 steps for the user to review BEFORE acting. Call this " +
      "first when the user states a goal; do not take the action until they approve.",
    parameters: PlanCardProps,
    render: PlanCard,
  });

  useComponent({
    name: "planResult",
    description:
      "Render the outcome after the user approves (status 'done') or rejects " +
      "(status 'cancelled') a plan.",
    parameters: PlanResultProps,
    render: PlanResult,
  });

  return (
    <section className="lesson">
      <div className="lesson-copy">
        <h2>🪁 Extend · Plan → approve → act</h2>
        <p>
          State a goal. The agent proposes a plan and waits — it only acts after you
          type <strong>approve</strong>. This is the deck's "You review" loop, and a
          live extension point. See <code>EXTENDING.md</code> or run <code>/extend</code>.
        </p>
      </div>
      <ExamplePrompts
        prompts={[
          "Flag my at-risk Q3 accounts",
          "approve",
          "reject",
        ]}
      />
      <div className="chat-region">
        <CopilotChat agentId="extend" />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add the `🪁 Extend` tab in `src/App.tsx`**

In `src/App.tsx`, add the import after the `L4Declarative` import:

```tsx
import ExtendDemo from "@/lessons/ExtendDemo";
```

and add this entry at the end of the `tabs` array (after the `l4` entry):

```tsx
  { id: "extend", label: "🪁 Extend", render: () => <ExtendDemo /> },
```

- [ ] **Step 4: Verify build + tab renders**

Run: `npm run typecheck && npx vitest run && npm run build 2>&1 | tail -3`
Expected: typecheck clean; all tests pass (App test still green with the new tab); build succeeds.

- [ ] **Step 5: Live smoke (needs a key)**

Run `npm run dev`, open the **🪁 Extend** tab, send "Flag my at-risk Q3 accounts" → a PlanCard with steps appears and the agent does NOT act. Type "approve" → a PlanResult ("done") appears. (In a fresh run, "reject" → PlanResult "cancelled".) Report what happened; if the agent acts before approval, tighten the agent prompt and re-test.

- [ ] **Step 6: Commit**

```bash
git add server.ts src/lessons/ExtendDemo.tsx src/App.tsx
git commit -m "feat(extend): plan-mode demo — extend agent + ExtendDemo tab (plan→approve→act)"
```

---

### Task 6: Docs wiring — README + CLAUDE.md + /start-here

**Files:**
- Modify: `README.md`, `CLAUDE.md`, `.claude/commands/start-here.md`

**Interfaces:**
- Consumes: `EXTENDING.md` (Task 1), the `/add-*` + `/extend` commands (Tasks 2–3).

- [ ] **Step 1: Add an "Extend this workshop" section to `README.md`**

In `README.md`, immediately before the `## Claude Code harness` heading, add:

```markdown
## Extend this workshop

Attendees extend the app by **directing the agent**, not hand-coding. Every seam is
tagged `🪁 EXTENSION POINT` (`grep -rn "🪁" .`), and `EXTENDING.md` maps each axis.
Start with **`/extend`** for a guided menu, or jump straight to:

- `/add-component` — a controlled UI component (L3)
- `/add-catalog-item` — an A2UI catalog primitive (L4)
- `/add-tool` — a tool the agent can call
- `/add-skill` — a new slash command
- the **🪁 Extend** tab — a live plan → approve → act demo

```

- [ ] **Step 2: Add an "Extension points" note to `CLAUDE.md`**

In `CLAUDE.md`, immediately before the `## Safety` heading, add:

```markdown
## Extension points
Seams attendees can have the agent fill are tagged `🪁 EXTENSION POINT` (one
`grep -rn "🪁"` lists them). Axes + guided commands live in `EXTENDING.md`:
`/add-component` (L3 component), `/add-catalog-item` (L4 primitive), `/add-tool`
(host tool), `/add-skill` (slash command), and the `🪁 Extend` tab (plan→approve→act
via the `extend` agent + `planCard`/`planResult`). `/extend` is the router.

```

- [ ] **Step 3: Point `/start-here` at `/extend`**

In `.claude/commands/start-here.md`, change step 5 ("Make something new (optional)") so its last sentence reads:

```markdown
5. **Make something new (optional).** If they want more, run `/extend` — it lists
   every 🪁 extension point and routes them to the right `/add-*` command (or use
   `/add-component` directly). The agent writes it; they describe it.
```

- [ ] **Step 4: Verify links resolve**

Run: `ls EXTENDING.md README.md CLAUDE.md .claude/commands/extend.md && grep -n "EXTENDING.md\|/extend\|🪁" README.md CLAUDE.md`
Expected: files exist; grep prints the new README + CLAUDE.md references.

- [ ] **Step 5: Commit**

```bash
git add README.md CLAUDE.md .claude/commands/start-here.md
git commit -m "docs(extend): README + CLAUDE.md extension-points + /start-here → /extend"
```

---

## Self-Review

**Spec coverage:** 🪁 markers + EXTENDING.md → Task 1; `/add-tool` `/add-skill` `/add-catalog-item` → Task 2; `/extend` → Task 3; plan-mode (components) → Task 4; plan-mode (agent + tab) → Task 5; README/CLAUDE.md/start-here wiring → Task 6. The five axes (component, catalog item, skill, tool, plan-mode) are each covered. The spec's "two-turn host-authored" plan-mode is realized via the proven L3 client-component mechanism (documented in Global Constraints + the task) — a refinement toward the same goal that avoids the named `TOOL_CALL_END` risk.

**Placeholder scan:** every code step has complete code; every command file is written in full; commands + expected outputs are concrete. None remain.

**Type/name consistency:** `PlanCardProps`/`PlanCard` and `PlanResultProps`/`PlanResult` are defined in Task 4 and consumed by exactly those names in Task 5's `ExtendDemo.tsx` and the `useComponent` registrations (`planCard`, `planResult`) match the `extend` agent prompt's tool names in Task 5 Step 1. Tab id `extend` / `agentId="extend"` are consistent. `add-tool`/`add-skill`/`add-catalog-item`/`extend` filenames map to the `/`-command names referenced in EXTENDING.md and README.

**Note:** the `extend` agent uses client `useComponent` tools (L3 mechanism), so it is a plain `makeAgent` and is intentionally NOT added to `a2ui.agents` (which stays `["l4"]`).
