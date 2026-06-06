# Workshop Talk Script — "Reinvent Old Software in an Agentic Way"

**AgentCon Perth 2026 · 90 min · Jimmy Li**

Speaker script with slide cues, stage directions, and timing markers.
Italicized text in quotes = what you say. Brackets = stage direction.

---

## ACT I · The Awakening (0:00 – 15:00)

### [S2] Hook 1 video · 0:00 – 0:30

```
On screen: 30s screen recording. Full-screen. No sound.
           Same agent prompt → output morphs across 5 UI patterns.
           Ends on a freeze-frame, no text, fade to black.
You: standing to the side of the screen, silent. Hands at sides.
     Do not move during the video. Audience watches.
```

Why silence: the visual must land alone. Don't apologize for what they're watching, don't explain it yet, don't smile at people in the front row. Stand still and let it work.

---

### [S1] Title slide · 0:30 – 2:00

```
On screen: Title slide — your name, LinkedIn handle, the AgentCon 2026 mark.
           No company logo. No product pitch.
You: step forward, center stage.
```

> *"Hi. I'm Jimmy."*

[pause 2 seconds]

> *"Three things before we start."*

[hold up fingers as you count them out]

> *"One — there are zero vendor pitches in the next 90 minutes. I don't work for OpenAI, Anthropic, or CopilotKit. I won't try to sell you anything."*

> *"Two — you'll see slides, but the real work is in a public GitHub repo. Link is in the description of this session and on my LinkedIn — that QR code in the corner. Pull it now if you haven't. I'll wait 30 seconds."*

[Beat. Genuinely wait. Look at the back of the room. People will be opening laptops.]

> *"Three — I want one thing from you when we're done. I'll tell you what at minute 89. For now: just be willing to disagree with me out loud, or with the person next to you. Workshops die in silence."*

[1 second pause]

> *"Okay. Let's start."*

---

### [S3] "Let's rewind 4 years." · 2:00 – 4:00

```
On screen: Pure black slide. One line of italic serif:
           "Let's rewind 4 years."
You: walk slowly across the front of the stage as you talk. Movement
     signals "transitioning to a new mode."
```

> *"I'm not going to start with my workshop. I'm going to start with something you already lived through. The last 4 years of LLMs."*

> *"You don't need me to tell you the dates. You used these things. You watched them get added. But I want to walk you through them in a specific order — not because the order is news, but because the **pattern** is."*

[approach center stage, stop walking]

> *"Seven steps. I'll go fast. After each one, I'll ask you to raise a hand. Be honest — these are not trick questions."*

---

### [S4] Step 1 — Text-only LLM · 4:00 – 5:00

```
On screen: Step slide. Step 1 mockup on left: simple chat UI,
           user message "Show me Q3 sales by region",
           AI replies in plain text only.
           Right metadata: ERA 2020–2022 · CAPABILITY Text in, text out ·
           REPRESENTATIVE GPT-3, ChatGPT launch · BOUNDARY Machines
           start producing fluent language.
You: gesture at the left side of the screen.
```

> *"Step one. Text-only LLM. You type, it types back. This is November 2022, when most of the world met ChatGPT for the first time. The mockup on the left — that's the entire product surface area. One input, one output."*

[brief pause]

> *"It's the starting point. Nothing more, nothing less. Hold that picture."*

[advance slide]

---

### [S5] Step 2 — + Tool calling · 5:00 – 6:00

```
On screen: Step 2 mockup. Same user question. Same chat container.
           AI message now has a small tool-call indicator on top
           (▸ called get_sales(...)) before the text reply.
           Right metadata: ERA 2023 · CAPABILITY LLM picks a function with
           structured arguments · REPRESENTATIVE OpenAI function calling,
           Anthropic tool use · BOUNDARY From speaking to invoking.
You: point at the tool-call indicator specifically.
```

> *"Step two. The model stops just talking and starts calling functions. Mid-2023, OpenAI ships function calling. The chat UI looks almost identical — but underneath, the model now decides which tool to invoke and with what arguments."*

> *"Visually, the only change is this small block at the top showing the call. Conceptually, the change is enormous: the model is no longer a typewriter. It's a switchboard."*

[advance slide]

---

### [S6] Step 3 — + Rich output in chat · 6:00 – 7:30

```
On screen: Step 3 mockup. Same question. AI response now contains
           an inline bar chart for Q3 sales by region.
           Right metadata: ERA 2023 · CAPABILITY Output is no longer
           just text — charts, cards, widgets appear inside the chat ·
           REPRESENTATIVE DALL·E 3, markdown rendering, GenUI demos ·
           BOUNDARY Output bursts past text.
You: lean in toward the screen. This is the first audience-engagement step.
```

> *"Step three. Output stops being text. You ask the same question, but the model can now answer with a chart inside the chat."*

[turn to face the audience]

> *"Show of hands — who's seen ChatGPT emit a chart, or a table, or an image inline?"*

[Almost every hand goes up. Smile. Look around.]

> *"Right. So we all live in Step 3 already, at least as users."*

[2 second pause]

> *"Hold onto that."*

[advance slide]

---

### [S7] Step 4 — + Sandboxed execution · 7:30 – 9:00

```
On screen: Step 4 mockup. Same question. The AI message now contains:
           - "Running analysis..." with a small spinner
           - A monospace code block (df.groupby('region')...) on dark
           - "executed in sandbox · 1.2s" footer
           - The same chart from Step 3, but generated by the code
           - A follow-up question with [Drill in] / [No thanks] buttons.
           Right metadata: ERA 2023–2024 · CAPABILITY LLM runs real
           code in a sandbox and returns artifacts · REPRESENTATIVE
           Code Interpreter, Advanced Data Analysis ·
           BOUNDARY From describing to doing (in a box).
You: gesture at the code block specifically.
```

> *"Step four. The model isn't just describing the answer anymore — it's computing it. Look at this. Real Python. Real sandbox. The chart on the bottom isn't a static response. It came out of a `df.groupby` that ran 1.2 seconds before you saw it."*

> *"And notice the follow-up question at the bottom. The model can now branch. It can say: 'Hey, I noticed something weird in your data — want me to dig in?' That's not a chat reply. That's a colleague."*

[turn to audience]

> *"Show of hands — who's used Code Interpreter, or Advanced Data Analysis, or whatever they're calling it this quarter?"*

[Most hands go up — but visibly fewer than Step 3. Note this aloud.]

> *"Okay. Still a lot of hands. But fewer than the last question. Hold onto that too."*

[advance slide]

---

### [S8] Step 5 — + Control external software · 9:00 – 10:30

```
On screen: Step 5 mockup — DIFFERENT layout from Steps 1–4.
           Left 80%: a stylized Salesforce-style dashboard being
           operated by an agent cursor. Filter pills active, drill-down
           expanded on "Brazil." Slightly desaturated.
           Right 20%: chat sidebar shrunk to a vertical strip with
           user prompt at top and timeline of agent actions below.
           Right metadata folds to one inline row at bottom of slide:
           ERA 2024–2025 · Operator / Computer Use · "Chat shrinks
           to a remote control."
You: take a step back from the screen so the audience can take in the
     SIZE INVERSION. Don't talk over it for 3 seconds.
```

> *"Step five. Look at the proportions on this screen."*

[3 second pause. Let them see it.]

> *"The chat is now a narrow strip. The big real estate is something that isn't chat. It's a real piece of software — in this case a CRM dashboard — being driven by the agent. You typed your question on the right. The model is on the left, clicking buttons. Filtering. Drilling in."*

> *"This is the moment where the chat container starts to dissolve. It's not the surface anymore. It's the remote control."*

[turn to audience, slower now]

> *"Show of hands — who's tried Operator, or Anthropic's Computer Use?"*

[Very few hands. 5–10% of the room. Acknowledge it.]

> *"Right. Maybe a tenth of you. And that's the point. Step five is happening, in production, today — but most of us are still living a few steps behind."*

[advance slide]

---

### [S9] Step 6 — + Agent-orchestrated UI · 10:30 – 11:30

```
On screen: Step 6 mockup. NO chat anywhere on screen.
           A bespoke dashboard: header "Q3 Sales Review", KPI strip
           ($10.7M, +11% YoY), two cards (By Region, Forecast Q4),
           one anomaly alert row at bottom ("Brazil –12%") with action chips.
           Right metadata: ERA 2025–2026 · CAPABILITY Frontend is generated
           by the agent in real time, not predesigned · REPRESENTATIVE
           AG-UI, CopilotKit, ChatGPT Apps · BOUNDARY The interface
           itself becomes generative.
You: gesture broadly at the whole slide. No specific element.
```

> *"Step six. Look at what's *not* on this screen."*

[2 second pause]

> *"No chat bubbles. No input box. No 'AI assistant' icon in the corner. The frontend you're looking at — the cards, the KPIs, the anomaly alert — was not designed in Figma. The agent assembled it, just now, in response to one question."*

> *"This is where the UI itself becomes the thing the model emits. Not text, not charts inside a chat — the **entire interface**."*

[no hand-raise on this step — intentional, builds anticipation for Step 7]

[advance slide slowly]

---

### [S10] Step 7 — No more "LLM in chat" · 11:30 – 12:30

```
On screen: Step 7 — mostly empty slide.
           Center: a large thin outlined question mark.
           Below it, small italic gray text: "Where does it live now?"
           No metadata. No mockup. Nothing else.
You: stop talking. Step back from the lectern. Hands down.
```

[Stand silently for **5 full seconds.** This is the longest pause in the talk. Resist filling it.]

[If the room is >80 people and the silence feels unbearable, soften with: *"Turn to the person next to you. One sentence. Where do you think the LLM lives now? You have 30 seconds."* Then time them and bring them back.]

[If the room is small, just hold the silence.]

> *"That's the question I want you to hold for the next 60 minutes. If the model is no longer in the chat — where is it?"*

[1 second pause]

> *"I'll come back to this."*

---

### [S11] Overview · "Same question. Seven placements." · 12:30 – 13:00

```
On screen: Overview slide — all 7 step mockups tiled side by side
           at thumbnail size (280×200 each). Below them, one italic line:
           "Same question. Seven placements."
You: gesture across all 7 at once with an open hand.
```

> *"One more thing before we move on. Look at all seven together."*

[3 second pause — let them scan]

> *"Seven different ways the model can answer the same question. The question never changed. The placement did."*

[advance slide]

---

### [S12] Comparison — ChatGPT 2026 vs polished bolt-on empty states · 13:00 – 13:45

```
On screen: Comparison slide. Dark background. Vertical amber divider.
           Left half: collage of 2026 ChatGPT capabilities (Canvas, Apps,
           Operator, Code Interpreter, Voice, Tasks). Caption: "15+
           capabilities beyond text."
           Right half: three side-by-side polished chat empty states
           (A·Minimal, B·Editorial, C·Petal accent). Caption:
           "3 design directions. 1 structural bet."
           Bottom center, italic amber: "polish ≠ placement"
You: turn slightly toward the right half of the screen.
```

> *"I know what some of you are thinking right now. You're thinking, 'My company isn't shipping ugly bolt-on chatbots. Our design team is good. Our empty states look beautiful.'"*

> *"Look at the right side."*

[3 second pause]

> *"These three mockups are from teams with world-class design polish. Editorial typography. Petal accent. Custom illustrations. They are not the enemy. They're the state of the art."*

> *"They are also three slightly different designs for the **same structural mistake**. The mistake is: putting the user in front of a chat box and waiting for them to know what to type."*

[turn back to the room]

> *"Polish doesn't equal placement. You are not making a design decision. You are making a structural decision. Today, most teams ship the structural decision first and then ask the designer to make it pretty."*

> *"That's what I want us to talk about."*

---

### [S13] The Claim · 13:45 – 15:00

```
On screen: Pure black slide. Four lines of massive type, centered:
              Chat
              is a feature.
              UI
              is the product.
           A thin amber divider below.
           Below the divider, italic smaller:
              "Don't bolt on. Redesign."
           One amber period at the end.
You: walk to the center of the stage. Stand still. Wait for the slide
     to land. Don't speak until the audience has had 3 seconds to read.
```

[3 second pause]

> *"Chat is a feature. UI is the product. Don't bolt on. Redesign."*

[1 second pause]

> *"That's the whole workshop in one sentence."*

[walk back to lectern]

> *"The next 60 minutes, I'm going to give you five concrete patterns for what 'redesign' actually looks like. Not 'use AI more.' Not 'be more agentic.' Five patterns, with code you can read, with trade-offs you can explain to your engineer."*

> *"And at minute 75, I'm going to give you a tool to decide which pattern fits which feature in your product."*

[pause, smile slightly for the first time]

> *"Let's go."*

---

## Speaker timing reference for Act I

| Slide | Start | End | Duration | Critical beat |
|---|---|---|---|---|
| S2 Hook video | 0:00 | 0:30 | 30s | Stand still, no commentary |
| S1 Title | 0:30 | 2:00 | 90s | "Zero vendor pitches" promise |
| S3 Rewind | 2:00 | 4:00 | 2:00 | Walk across stage |
| S4 Step 1 | 4:00 | 5:00 | 60s | No hand raise |
| S5 Step 2 | 5:00 | 6:00 | 60s | No hand raise |
| S6 Step 3 | 6:00 | 7:30 | 90s | Hand raise #1 (most hands) |
| S7 Step 4 | 7:30 | 9:00 | 90s | Hand raise #2 (fewer hands) |
| S8 Step 5 | 9:00 | 10:30 | 90s | Hand raise #3 (10% of room) |
| S9 Step 6 | 10:30 | 11:30 | 60s | No hand raise (saving energy) |
| S10 Step 7 | 11:30 | 12:30 | 60s | **5-second silence** |
| S11 Overview | 12:30 | 13:00 | 30s | Wide gesture |
| S12 Comparison | 13:00 | 13:45 | 45s | "Polish ≠ placement" |
| S13 Claim | 13:45 | 15:00 | 75s | Walk to center, hold |

**Buffer if running long:** Steps 1, 2, 6 can each compress to 45s. Don't shorten 5, 7, or the claim.

**Buffer if running short:** Linger at S11 overview (the visual lands harder the longer you let it sit). Add 15 seconds of audience eye-contact at the claim.

---

---

## ACT II · The Spectrum (15:00 – 75:00)

### [S14] The Spectrum slide · 15:00 – 17:00

```
On screen: horizontal axis with 5 dots labeled L2 · L3 · L4 · L5 · L6.
           Above the axis, a label: "Where the LLM lives now."
           Below the axis, tiny captions under each dot:
             L2 "plain chat"
             L3 "registered components"
             L4 "catalog + composition"
             L5 "external apps"
             L6 "shared state"
           Far right, after L6, a question mark — to remind the audience
           the spectrum is open-ended.
You: walk to the screen, point at the spectrum.
```

> *"Twelve minutes ago, I left you with a question. Where does the LLM live, if not in chat?"*

[1 second pause]

> *"This is my answer."*

[gesture along the axis from left to right]

> *"Five placements. None of them are 'chat with extra steps.' Each one is a different structural bet about how the model lives inside your product."*

> *"L2 — pure chat. The baseline. Almost everyone in this room has shipped this.
> L3 — registered components. The model picks from a library of UI you built.
> L4 — catalog and composition. The model assembles the layout itself.
> L5 — external apps. The model routes to software you didn't build.
> L6 — shared state. The model edits the same canvas the user is editing."*

[turn to audience]

> *"I'm not going to teach you each one as a checkbox. I'm going to show you each one with code that's already running on your laptop. Then I'm going to ask you, for each, when you'd pick it. Because the lesson is not 'use L4.' The lesson is 'know which one this feature needs.'"*

[advance slide]

---

### [S15] L2 backdrop + L2 demo · 17:00 – 20:30

```
On screen: backdrop slide — "L2 · Plain chat — The home of bolt-on"
           with a small inset of the L2 tab UI.
You: switch from slides to your browser, localhost:5176, click L2 tab.
     Position laptop so audience sees the chat UI on the main screen.
```

> *"Let's start at the left of the spectrum. L2. This is what almost every 'AI feature' in production today is — a chat sidebar bolted onto an existing product. I'm going to show it to you, and I want you to notice how unremarkable it feels."*

[type into the chat]

```
Prompt to type: "What can you help me with?"
```

[wait for streaming response]

> *"Streaming reply. Looks fine. Feels like ChatGPT. Costs you about three days of engineering work to wire up."*

[type a second prompt]

```
Prompt to type: "Summarize the last quarter's metrics."
```

[response will be vague, since there's no data — narrate this]

> *"Notice — the model doesn't know anything about your business. It will guess, or hedge, or hallucinate. That's the limit of L2. You shipped a chat. You did not ship a product."*

[switch back to slides]

> *"This is the L2 trap. It's easy, it looks AI-ish, it ships. And six months later your metrics show 90% of users tried it once and never came back."*

[short pause]

> *"Don't take my word for it. Talk to your neighbor for ninety seconds."*

---

### Discussion 1 · 20:30 – 22:00

```
On screen: Slide with one question, large type:
           "Where is pure chat actually the right answer?
            Where does it fail?"
           Bottom right: 90s countdown timer (start when you give the cue).
You: hold up two fingers — "two parts to this question."
```

> *"Two questions. One: where is plain chat actually the right answer — give me a real product scenario. Two: where does it fail. Ninety seconds. Pair up with whoever's next to you. Go."*

[Stop talking. Start the timer. Walk to the side of the stage. Do not interrupt.]

[At 60s remaining, raise a hand to signal "wrap it up in 30."]

[At 0s, ring a bell / clap once.]

> *"Okay. Bring it back. Two or three of you — quickly — where was plain chat the right answer?"*

[Take 2 voices. Keep it under 60 seconds total. Common answers: customer support, internal Q&A, code search.]

> *"And where does it fail?"*

[Take 1 voice. Common answers: when the user doesn't know what to ask, when the answer needs a chart, when the model needs context the user can't paste in.]

> *"Good. Hold those answers. Most of what we'll cover next is just other ways of solving the failure modes you just named."*

[advance slide]

---

### [S16] L3 backdrop + concept · 22:00 – 25:00

```
On screen: backdrop slide — "L3 · Controlled GenUI — Components as tools"
           with a small inset of a flight card.
You: stay at the lectern. This is the longest deep dive.
```

> *"L3. The first real step off the bolt-on baseline. The idea is: you write a few React components, you register them with the agent runtime, and now the model can call them as tools."*

> *"Two examples on your laptop. One — a flight card. Two — a pie chart. You don't have to build everything; you build the *patterns* you care about. The agent picks which one to use and fills in the data."*

[gesture broadly]

> *"This is where you stop being a chat product and start being an actual product that happens to use AI."*

[pause]

> *"Let me show you."*

---

### L3 demo 1 — Flight card · 25:00 – 28:00

```
On screen: switch to browser, L3 tab.
You: speak while typing. Keep your eyes on the screen so the audience
     watches the screen, not your face.
```

> *"Same chat input. Watch what comes back."*

```
Prompt to type:
"Show me a flight card for Pacific Air, SFO to JFK, departure 08:30, $249"
```

[Card renders. Stop and let the audience see it for 2 seconds.]

> *"That's a React component. Not a markdown table that looks like a card — a real component with its own props, its own styling, that I built before this workshop. The model decided to render it. It picked the parameters from my prompt and called it."*

[switch to your editor, open `frontend/src/lessons/L3Chat.jsx`]

> *"Twenty lines of code. Look — `useCopilotAction`. I gave it a name: `showFlightCard`. I gave it a description — that's the instruction to the model. I gave it parameter names with types. I gave it a render function that returns my React component."*

> *"That's the whole pattern. Once you have that, the model can call this component any time my description matches a user request."*

---

### L3 demo 2 — Pie chart · 28:00 – 30:00

```
On screen: switch back to browser, L3 tab.
You: clear the chat or scroll down for a clean view.
```

> *"Different component, same pattern. Watch."*

```
Prompt to type:
"Pie chart of my time: 40% coding, 30% meetings, 20% email, 10% other"
```

[Pie chart renders. Pause.]

> *"Notice — I didn't say 'render a pie chart.' I said 'pie chart of my time.' The model parsed the slices, mapped them to my component's `slices` prop, picked the colors itself."*

> *"This is L3. You build the parts. The model orchestrates the whole."*

[switch back to slides briefly]

---

### Mini hands-on 1 · 30:00 – 35:00

```
On screen: Instructions slide:
           "Open frontend/src/lessons/L3Chat.jsx in your editor.
            Find the `description` field for `showFlightCard`.
            Change it to: 'Only call this for international flights.'
            Save. Try: 'Show me a flight for Pacific Air, SFO to JFK, $249.'
            What changed?"
           Bottom right: 5-minute countdown.
You: ask the audience to open their laptops if they haven't yet.
```

> *"Your turn. I'm not asking you to build a component. I'm asking you to change *one line of text*. The description."*

> *"Open `L3Chat.jsx`. Find the `showFlightCard` action. Change its description from what's there now to: 'Only call this for international flights.' Save the file. Then try the same SFO-to-JFK prompt I just used."*

> *"Five minutes. Help your neighbor if they're stuck. If you're on Windows and can't get hot reload to work, watch your neighbor's screen — it's the same observation either way."*

[Start the timer. Walk through the audience. Answer questions in a low voice.]

[At 4 minutes: announce "one more minute."]

[At 5 minutes: bring them back.]

> *"What did you see?"*

[Take 2-3 voices. The expected observation is: the model stops calling `showFlightCard` for SFO-to-JFK, and instead replies in plain text.]

> *"Right. The model read your description, decided SFO-to-JFK is domestic, and didn't call the tool. It chose to fall back to text."*

[lean forward]

> *"That description is your only knob as a PM. You don't have to ship a new component. You don't have to retrain a model. You don't even have to deploy. You change one English sentence and the agent's behavior changes."*

---

### L3 wrap · 35:00 – 40:00

```
On screen: slide with three bullets:
           "L3 in one breath:
              · The component library is your design system, but callable.
              · The description is your prompt engineering.
              · The agent does the dispatch."
           Below: "Use L3 when: ≤10 distinct UI patterns, high visual polish needed."
You: step center stage.
```

> *"Three things to remember about L3, and then we'll move on."*

[count on fingers]

> *"One. Your component library is your design system, but callable. Every component you register is a tool the agent can use. If your design system is small and clean, your agent's vocabulary is small and clean."*

> *"Two. The description is your prompt engineering. You just felt this yourself. The text in the description is what the model reads when it decides whether to call your component. It's not just documentation. It's product copy with consequences."*

> *"Three. The agent does the dispatch. You don't write 'if user asks about flights, call FlightCard.' You write *good descriptions* and let the model match."*

[pause]

> *"When does L3 fit your product? When you have a small number of distinct UI patterns — under ten, in my experience — and you care about visual polish. Every output looks exactly the way your designer drew it. Nothing surprises the user."*

> *"When does L3 *not* fit? When the number of possible UI outputs explodes. Which brings us to L4."*

[advance slide]

---

### [S17] L4 backdrop + L4 demo · 40:00 – 48:00

```
On screen: backdrop slide — "L4 · Declarative GenUI — Catalog + composition"
           with a small inset of a multi-card dashboard.
You: stay at the lectern. This is the most visually dramatic demo.
```

> *"L4 is what you reach for when you stop having ten components and start having a hundred. Or when you can't know in advance what layout your user will need."*

> *"The idea: don't register every possible UI. Register a *catalog* of primitives — containers, grids, cards, stats, tables, badges. Then give the agent one big tool: 'render this layout.' The agent composes the layout itself from your catalog."*

> *"Watch. This is going to feel different from L3."*

[switch to browser, L4 tab]

```
Prompt to type:
"Build me a sales dashboard with revenue $48k (+12%),
 312 signups (-4%), 2.1% churn, and a small table of top
 3 customers by revenue."
```

[Dashboard renders. Pause for 3 full seconds.]

> *"Look at this for a second."*

[3 second pause]

> *"That layout did not exist before this prompt. It is not a Figma file. It is not a route in your app. The agent picked the grid, picked the cards, picked the typography hierarchy, picked the colors of the deltas. Three percent up gets green. Four percent down gets red. The agent decided that."*

[switch to editor, open `frontend/src/a2ui/catalog.js`]

> *"Here's the catalog the agent is working from. Seven primitives. Container, Grid, Card, Stat, Text, Table, Badge. That's it. No flight card. No pie chart. No bespoke dashboard component. Seven Lego bricks."*

[scroll down to `Renderer.jsx`]

> *"And here's the renderer — about 150 lines. It recursively walks the tree the agent produces and renders each node."*

[switch back to slides]

> *"This is L4. You ship a small, expressive primitives library — your Lego set. The agent does the assembly. The cost of adding 'support a new layout' drops from 'build a component' to 'maybe extend the catalog by one primitive.'"*

> *"PM angle: when you have a small product, L3 is cheaper. When you have a sprawling product where you can't predict the layouts, L4 is cheaper. Most teams get this backwards — they pick L4 for a tiny product and end up with garbage layouts the agent invented, or they pick L3 for a sprawling product and ship thirty components nobody calls."*

[advance slide]

---

### [S18] L5 backdrop + L5 demo · 48:00 – 55:00

```
On screen: backdrop slide — "L5 · Open GenUI — Route to existing apps"
           with a small inset of an embedded sketchpad.
You: stay at the lectern.
```

> *"L5. This one's the most philosophically interesting."*

> *"L3 and L4 are about *building* UI for the agent to use. L5 is about *not* building UI. About routing the user to software that already exists."*

> *"In our repo we have a local sketchpad and a local pivot table. Both built into the app. The agent decides when to open them based on what the user is asking."*

[switch to browser, L5 tab]

```
Prompt to type:
"I want to sketch a system diagram for our new feature."
```

[Sketchpad embeds inline. Show that it's interactive — draw a quick line.]

> *"The model decided 'this is a drawing task' and routed to the sketchpad. It didn't try to describe a diagram in text. It didn't try to render a fake whiteboard with markdown. It just opened a real one."*

[type a second prompt]

```
Prompt to type:
"I want to explore some sales data interactively."
```

[Pivot table embeds. Show it's clickable.]

> *"Different request. Same pattern. The agent picked the right tool from the apps you registered."*

[switch back to slides]

> *"PM angle: this is the lever you pull when your team's instinct is 'we should build an editor.' The honest question is — does someone already make a better one? If yes, L5 says embed it. Don't reinvent."*

> *"This is the pattern that ChatGPT Apps and Anthropic's MCP-Apps use. The agent stops thinking of itself as the surface. It becomes an orchestrator that hands the user to the right tool."*

[1 second pause]

> *"Cost: you give up some visual consistency. The sketchpad doesn't look like your product. That's a trade-off you make consciously, not by accident."*

[advance slide]

---

### [S19] L6 backdrop + L6 demo · 55:00 – 62:00

```
On screen: backdrop slide — "L6 · Canvas — Shared state"
           with a small inset of a todo list with one highlighted item.
You: stay at the lectern. This is the most subtle of the five.
```

> *"L6 is the most quietly powerful of the five. And it's the one most PMs miss."*

> *"In L2, L3, L4 — the agent does something, the user looks at it, the user types again. It's a turn-based relationship."*

> *"In L6, the user and the agent share a piece of state. Both can read it. Both can write to it. Same canvas. At the same time."*

[switch to browser, L6 tab]

> *"Here's a todo list. I'm going to ask the agent to add some items, and you're going to watch the UI update in real time, alongside the chat."*

```
Prompt to type:
"Add three todos about preparing for next quarter's launch."
```

[Three todos appear in the left panel. Point at them.]

> *"Look at the left panel. The agent didn't reply with text saying 'I added three todos.' It actually mutated the state. The UI re-rendered. Nothing in the chat panel matters here — the chat is a side channel."*

[click a todo's checkbox manually]

> *"Now watch me — *I* edit the state. The agent will see this on its next turn."*

```
Prompt to type:
"Which one did I just mark done?"
```

[Agent correctly identifies which todo was checked.]

> *"The agent read the state I mutated. It's not parsing my screen. It's reading the same state I'm editing. Same source of truth."*

[demo highlighting]

```
Prompt to type:
"Highlight any todo that mentions a deadline."
```

[Agent highlights specific items.]

> *"Two-way binding between user and agent. This is what Cursor and GitHub Copilot do at the file level. This is what Anthropic's Claude does in artifacts. This is what every product that feels 'genuinely co-piloted' actually is, underneath."*

[switch back to slides]

> *"PM angle: don't try to fake L6 with L3. If your user is editing something and the agent needs to read it, register the state with `useCopilotReadable`. Don't ask the agent to re-fetch or re-parse on every turn."*

> *"L6 cost: every state mutation is a privacy decision and an audit decision. The agent can now see everything in that shared canvas. Choose what's in it carefully."*

[advance slide]

---

### Discussion 2 · 62:00 – 64:00

```
On screen: Slide with one question, large type:
           "What's the first thing in your product that would
            benefit from shared state with an agent?"
           Bottom right: 90s countdown timer.
You: face the audience.
```

> *"One more discussion. Ninety seconds. Find your neighbor."*

> *"What's the first thing in your product that would benefit from shared state with an agent? Don't pick L6 because it sounds cool. Pick something where the user is actively editing, and the agent can genuinely help in real time. Be specific. Name a screen."*

[Start timer. Walk to the side.]

[At 60s remaining: hand up.]

[At 0s: ring bell.]

> *"Bring it back. One or two voices, what did you land on?"*

[Take 1-2 voices. Common answers: writing/editor surfaces, calendar/scheduling, configuration panels, dashboards with filters, code editors.]

> *"Hold those. We'll come back to them in the Action section."*

[advance slide]

---

### The spectrum revisited · 64:00 – 67:00

```
On screen: The Spectrum slide returns (S14) — but now each dot has a
           tiny demo screenshot floating above it (flight card on L3,
           dashboard on L4, sketchpad on L5, todo on L6).
You: walk to the screen, gesture across the whole spectrum.
```

> *"Recap. Same axis I showed you fifty minutes ago. But now every dot has a real demo behind it, on your laptop, that you've seen me run."*

[point at each dot in turn]

> *"L2 — plain chat. The trap.
> L3 — controlled. The first real step off.
> L4 — declarative. Scales to N components.
> L5 — open. Routes to apps you didn't build.
> L6 — shared state. Co-author, not co-pilot."*

[turn to audience, slow down]

> *"The question that should be in your head right now is not 'which one is best.' That's the wrong question, and if I see you ask your engineer that question on Monday, I will be sad."*

> *"The right question is: 'For this specific feature in our product — which one fits?'"*

> *"That's what the next fifteen minutes are about. How to pick."*

---

### Buffer / transition · 67:00 – 75:00

```
On screen: Hold the Spectrum slide.
You: this is your timing buffer. Use it as needed.
```

This 8-minute window absorbs slip from earlier sections. If you ran exactly on time, use this block to:

- **Re-take a question from earlier** that you cut short (Discussion 1 answers — "where does plain chat fail" — are gold material here)
- **Tell a brief story** about a real product decision where the spectrum framework would have changed the outcome
- **Add a fourth example for L6** if Discussion 2's harvest was thin

If you're running short on time, **skip this section entirely**. Go straight to Act III.

If you're running long, **shorten the L4 catalog walkthrough**. L4's demo is what people remember; the code tour is what they forget.

[At 75:00 sharp: advance to S20 — decision matrix slide. Act III begins.]

---

## Speaker timing reference for Act II

| Slide | Start | End | Duration | Critical beat |
|---|---|---|---|---|
| S14 Spectrum | 15:00 | 17:00 | 2:00 | Walk + gesture |
| S15 L2 demo | 17:00 | 20:30 | 3:30 | Plain chat, show streaming |
| Discussion 1 | 20:30 | 22:00 | 1:30 | Two-question prompt |
| S16 L3 concept | 22:00 | 25:00 | 3:00 | "Components as tools" |
| L3 demo 1 (flight) | 25:00 | 28:00 | 3:00 | Show component + code |
| L3 demo 2 (pie) | 28:00 | 30:00 | 2:00 | Same pattern, different shape |
| Hands-on 1 | 30:00 | 35:00 | 5:00 | **Audience changes description** |
| L3 wrap | 35:00 | 40:00 | 5:00 | Three takeaways |
| S17 L4 + demo | 40:00 | 48:00 | 8:00 | Dashboard appears live |
| S18 L5 + demo | 48:00 | 55:00 | 7:00 | Sketchpad + pivot embed |
| S19 L6 + demo | 55:00 | 62:00 | 7:00 | Shared state two-way |
| Discussion 2 | 62:00 | 64:00 | 2:00 | "What in your product?" |
| Spectrum recap | 64:00 | 67:00 | 3:00 | Same axis, now with demos |
| Buffer / slack | 67:00 | 75:00 | 8:00 | Adjust to actual pace |

**Critical paths:**
- L3 hands-on (30:00–35:00) is the workshop's only laptop activity. If it slips badly, cut L4's code tour, not the hands-on.
- L6 demo (55:00–62:00) must show the **user-mutates-state-then-agent-reads-it** beat. If you skip that, L6 looks like L3 to the audience.
- Discussion 2 must produce real product examples. If the harvest is silent or generic, the Act III callback won't land.

**Demo recovery cues:**
- If any live demo hangs >5s waiting for OpenAI: speak through it. *"While we wait for the model — here's what's about to happen and why it matters..."*
- If a demo hard-fails: keystroke-switch to the pre-recorded fallback. Don't try to debug live. *"Recording it is — same result, different reliability."*
- If the wifi drops mid-Act-II: switch laptop to mobile hotspot, finish the current demo from recording, restart the live demos after Discussion 2.

---

---

## ACT III · The Decision (75:00 – 90:00)

### [S20] The Decision Tool · 75:00 – 78:00

```
On screen: Single-page decision tree slide. Three questions stacked
           vertically, each with Yes/No arrows leading to L2/L3/L4/L6.
           Separate "escape hatch" box on the right pointing to L5.
           Title above: "Where does THIS feature live?"
           No animation. Static. Audience will be reading it for 3 minutes.
You: walk to the screen, gesture at each question in turn.
```

> *"Seventy-five minutes ago I promised you a tool. Here it is. One slide. Three questions. And one escape hatch on the right."*

[gesture at Q1]

> *"Question one — does your user know what to type? If no, plain chat is dead on arrival. If they don't know what to ask, an input box just makes them anxious. That's where ninety percent of bolt-on chat features fail. So if your answer is no, L2 is out."*

[gesture at Q2]

> *"Question two — do you need more than ten distinct UI patterns to answer the things this feature will be asked? If yes, L4 — declarative, catalog and composition, the agent assembles the layout. If no, L3 — register your handful of components and let the agent dispatch."*

[gesture at Q3]

> *"Question three — is the user actively editing something the agent needs to read? Not 'looking at' — editing. If yes, you need L6. Shared state. Two-way binding. Don't fake it with L3."*

[gesture at the escape hatch box on the right]

> *"And the escape hatch. Before you build anything from L3 to L6 — ask: does someone already make a better tool for this? If yes, L5. Embed it. Don't reinvent the sketchpad."*

[step back from the screen]

> *"That's the entire framework. Three questions and a sanity check. Print it. Tape it to your monitor. The next time someone says 'we should add AI to feature X,' you have a thirty-second answer instead of a six-week design sprint."*

[advance slide]

---

### [S21] Solo + Pair · 78:00 – 85:00

```
On screen: Two-column instruction slide.
           LEFT half — "Solo · 3 min"
             1. Name one feature in your product.
             2. Run it through the three questions.
             3. Write down: "Feature ___ should be L___."
           RIGHT half — "Pair · 4 min"
             Tell your neighbor your sentence.
             They tell you theirs.
             If you disagree about the level — say so.
           Bottom right: 7-minute countdown timer (start on the cue).
You: face the audience, hold up an index card or notebook so they see
     you expect them to physically write.
```

> *"Now you do it. Two parts."*

[hold up one finger]

> *"Solo, three minutes. Pick one real feature in your product — not a hypothetical, something that's actually in your roadmap or in production today. Run it through the three questions. Write one sentence: 'Feature X should be L-something.'"*

[hold up two fingers]

> *"Then four minutes with your neighbor. Tell them your sentence. They tell you theirs. If you disagree about the level — say so. That disagreement is where the actual learning happens."*

> *"Seven minutes total. Go."*

[Start the timer. Walk slowly through the room. Do not coach unless someone is visibly stuck — then ask which *question* they're failing on, not which *level* they want.]

[At 3:00 elapsed: announce *"switch to pair mode, four minutes."*]

[At 60 seconds remaining: hand up — signal "wrap it up."]

[At 0: ring a bell or single clap.]

> *"Bring it back."*

---

### Public harvest · 85:00 – 88:00

```
On screen: Hold S20 (the decision tree) — visible while you collect answers.
You: walk to center stage. Make eye contact with the back row first.
     Random selection is the credibility move here — do not let it default
     to the same three front-row people who've been answering all day.
```

> *"Quick note before we share. Some of you, when you walked through the three questions, landed on the same feature you named at minute sixty-three — when I asked what would benefit from shared state. The framework just gave you the L-number to defend it."*

[1 second pause]

> *"Two voices. I'm picking — don't volunteer. I want the ones who didn't raise a hand earlier."*

[Pick someone in the back third of the room. Ideally not the obvious dev row.]

> *"You. What's your feature, and what level did you land on?"*

[Listen. Repeat back briefly: *"Okay — checkout flow, you picked L4."*]

[React in one of three ways — pick whichever fits in one sentence:]

- *"Good fit. Here's why: [question N anchors it]."*
- *"I'd push you to L?. Question N — you said yes, but I think it's actually no, and here's why."*
- *"That's the harder version of question N — let me come back to it after the next answer."*

[Take one more. Same pattern. Total time: under three minutes for both voices combined.]

> *"What you just heard is the conversation I want you to have on Monday with one engineer or one PM. Not 'should we use AI.' Not 'should we be agentic.' Three questions. One sentence. One decision."*

[advance slide]

---

### [S22] The Ask · 88:00 – 90:00

```
On screen: Callback to S13. Same black background. Same massive type:
              Chat
              is a feature.
              UI
              is the product.
           Amber divider below. This time, below the divider:
              "Monday morning. One sentence. Out loud."
           Bottom of slide, smaller: GitHub repo URL + QR code.
You: walk back to center stage. Stand still. Wait for the slide to land —
     the audience needs to recognize it from minute 14.
```

[3 second pause]

> *"At minute one I promised I'd ask one thing of you when we're done. Here it is."*

[1 second pause]

> *"Monday morning. Walk into your standup, or your one-on-one, or your team Slack. And say one sentence — 'Feature X should be L-something, because [one of the three questions].'"*

> *"Don't say 'we should use AI more.' Don't say 'we should be more agentic.' Those sentences die in a roadmap doc and never come back."*

> *"Say the L-number. Make the structural bet visible. Make someone disagree with you out loud. That's how this stops being a slide deck and starts being a product."*

[pause, look around the room slowly — back row, then mid, then front]

> *"The repo's on screen. Every prompt, every component, every line of the catalog you watched today is in it. Fork it. Break it. Ship something on it."*

[1 second pause, allow a small smile for the first and only time]

> *"Thank you, AgentCon."*

[Step away from the lectern. Do NOT invite questions from the stage — invite them in the hallway. Stage Q&A kills the close.]

---

## Speaker timing reference for Act III

| Slide | Start | End | Duration | Critical beat |
|---|---|---|---|---|
| S20 Decision Tool | 75:00 | 78:00 | 3:00 | Walk the three questions + escape hatch |
| S21 Solo + Pair | 78:00 | 85:00 | 7:00 | **Audience writes a sentence about their own product** |
| Public harvest (S20 held) | 85:00 | 88:00 | 3:00 | Pick from non-volunteers; react in one sentence |
| S22 The Ask | 88:00 | 90:00 | 2:00 | Callback to S13 typography; minute-89 promise lands |

**Critical paths:**

- **S21 is the payoff.** If the audience writes nothing here, the previous 78 minutes were a lecture. Walk the room; don't let anyone sit blank. If someone says *"I don't have a product to write about,"* tell them to pick a feature in any product they use daily — the framework still works.
- **The public harvest must include one push-back.** If both voices get *"good fit,"* you taught a framework with no edges. Pick one to challenge — politely, by flipping the question they answered.
- **S22 must reuse S13's exact typography.** The callback is the close. Different fonts kill the loop. If the slide deck has drifted, fix S22 before fixing anything else.

**Recovery cues:**

- **Solo runs over:** cut Pair from 4 to 2 minutes. *"Your neighbor, ninety seconds each way."* Do not cut the harvest — it's the validation moment.
- **Nobody writes a sentence** (rare, but possible with a passive crowd): pick one person, walk over, ask them aloud *"name a feature."* Solve it on stage together. The room will start writing once they see it's safe to be specific.
- **Running long** (you hit 89:30 with no Ask delivered): cut harvest to one voice. Never skip S22 — the minute-89 promise is the entire reason they came.
- **Running short** (you hit 87:00 with everything done): pause longer at S22 before speaking. The slide does the work. Five extra seconds of silence on the Ask lands harder than five extra words.

**What you do NOT do in Act III:**

- Do not introduce a sixth level. The spectrum is closed at L6.
- Do not show new code. The decision tool is the only Act III artifact.
- Do not take stage Q&A. Move questions to the hallway after the close.
- Do not summarize Act II. The audience just lived it — restating the spectrum from the lectern undoes the work S21 just did.
