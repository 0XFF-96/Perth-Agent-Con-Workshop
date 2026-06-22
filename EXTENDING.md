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
