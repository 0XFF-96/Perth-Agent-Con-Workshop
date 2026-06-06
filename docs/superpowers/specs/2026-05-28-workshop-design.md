# Workshop Design Spec — "Reinvent Old Software in an Agentic Way"

**Conference:** AgentCon Perth 2026
**Duration:** 90 minutes
**Speaker:** Jimmy Li
**Spec author:** Jimmy + Claude · brainstorming session 2026-05-28
**Status:** Draft v1 · awaiting Jimmy's review

---

## 1 · Summary

A 90-minute conference workshop teaching Product Managers that **"Chat is a feature. UI is the product."** The session uses a 7-step ladder of LLM capability evolution as Act I to dismantle the audience's default "bolt-on chatbot" mental model, then uses the L2–L6 Generative UI spectrum (already implemented in the speaker's A2UI repo) as Act II to demonstrate alternatives, and closes with a decision framework + 5 actionable questions in Act III.

The workshop is **demo-heavy + light hands-on**. Audience pulls the complete A2UI repo at the start. The single dominant visual artifact is a series of 7 chat UI mockups showing the **same user question** ("Show me Q3 sales by region") handled at 7 different evolutionary stages — culminating in an intentionally blank Step 7.

---

## 2 · Foundations

| | |
|---|---|
| Audience | Product Managers (majority), some PMM/Design-PM hybrid |
| Format | Demo + discussion primarily; light hands-on ("change one prop") |
| Setup | Full A2UI repo pulled and running before workshop start |
| Central claim | **"Chat is a feature. UI is the product. Don't bolt on. Redesign."** |
| Story arc | Classical 3-act: Problem (15 min) · Reveal (60 min) · Action (15 min) |
| Approach | "The Awakening" — audience is protagonist; second-person voice |
| Hook | 30s screen recording: same agent, output morphs across 5 UI patterns |
| Act I device | 7-step LLM evolution ladder (text → tool-call → rich output → execution → external control → agentic UI → ???) |
| Act II device | The Generative UI Spectrum (L2 → L6, mapped to the A2UI repo) |
| Act III device | Decision matrix + "5 questions for your engineer Monday" |
| Target outcomes | (1) LinkedIn connection (2) "Chat is a feature" becomes a phrase the audience repeats |

---

## 3 · Central claim & emotional arc

### The claim
> **"Chat is a feature. UI is the product. Don't bolt on. Redesign."**

This is a **challenge claim**, not an empathy claim. The workshop is structurally a confrontation with the audience's current professional practice, softened by:

- A self-deprecating early disclosure ("I shipped a bolt-on chatbot too")
- Letting the audience reach the claim themselves through Act I evidence before it's stated explicitly
- Action-oriented closure that gives them a concrete path forward

### The transformation arc

```
BEFORE state (minute 0)
  Audience believes: "Adding AI = adding a chat surface to my product"
  Audience does: ships chatbot sidebars, A/B-tests welcome copy
  Audience feels: confident they're on the AI roadmap

AFTER state (minute 90)
  Audience believes: "AI placement is a structural product decision, not a UI polish decision"
  Audience does: questions whether chat is the right surface for the agent
  Audience feels: humbled but equipped (has a framework + vocabulary + Monday actions)
```

The single sentence audience should be able to recite 24 hours later: **"Chat is a feature. UI is the product."**

---

## 4 · Narrative architecture

### Act I — Problem (0–15 min) · "Awakening"

The audience is brought into common ground through a fact-heavy timeline they all share. **No opinions stated until minute 13:30.**

#### Beat-by-beat

| Time | Beat | Visual | Audience action |
|---|---|---|---|
| 0:00–0:30 | Hook 1 video (30s, no sound) | Full-screen video: same agent, output morphs across L2→L6 | Watch silently |
| 0:30–2:00 | Title + speaker | Title slide, minimalist | Settle |
| 2:00–4:00 | Pivot to history | Black slide, italic "Let's rewind 4 years." | Reorient |
| 4:00–11:00 | **7-step ladder** (7 slides, ~1 min each) | See §5 for each | Hand-raise × 3 |
| 11:00–12:30 | Step 7 freeze + silence | Step 7 slide (intentionally blank with "?") | Sit with the question |
| 12:30–13:30 | Comparison reveal | Slide 10: ChatGPT 2026 vs polished bolt-on empty states | Recognize |
| 13:30–15:00 | Claim drop + transition | Slide 11: the full claim, large type | Lock in |

#### The 7-step ladder (concept)

| # | Step title | One-line | Hand-raise prompt |
|---|---|---|---|
| 1 | Text-only LLM | You type, it types back. The starting point. | — |
| 2 | + Tool calling | The LLM stops just talking, starts invoking functions. | — |
| 3 | + Rich output (charts / cards / widgets) in chat | Output breaks past plain text. Chat container becomes a viewport. | "Have you seen ChatGPT emit a chart or table?" |
| 4 | + Sandboxed execution | The LLM runs real code. From "describing" to "doing" (in a box). | "Have you used Code Interpreter / Advanced Data Analysis?" |
| 5 | + Control external software | Chat shrinks to a sidebar. The app is the real surface. | "Tried Operator / Computer Use?" |
| 6 | + Agent-orchestrated UI | The frontend itself is generated in real time, not predesigned. | — |
| 7 | No more "LLM in chat" | (Intentionally blank slide. The pause is the message.) | — |

The 3 hand-raise prompts are timed so participation **decreases** through Steps 3 → 4 → 5, creating a curve where the audience visibly realizes "I'm only caught up to 3 of 7 patterns."

#### Why the unifying user question matters

Steps 1–6 all show **the same user prompt**: *"Show me Q3 sales by region."* Step 7 has no prompt because chat is no longer the surface. This is the central narrative device of Act I — apples-to-apples comparison of UI placements.

### Act II — Reveal (15–75 min) · "The Spectrum"

Act II answers the question Act I left dangling: *"If the LLM doesn't live in chat, where does it live?"* — by walking the audience through the **same 5 lessons (L2–L6) implemented in the A2UI repo**.

#### Structure

```
15:00–22:00   The Spectrum slide + L2 baseline demo + Discussion 1
22:00–48:00   L3 hands-on deep dive (★ main course)
48:00–60:00   L4 walkthrough (demo + code segments)
60:00–72:00   L5 + L6 lightning demos
72:00–75:00   Buffer / transition to Act III
```

#### Per-level beats

| Level | Live demo | PM-angle insight | Discussion / hands-on |
|---|---|---|---|
| **L2** | Plain chat: ask anything, get text streaming reply | "This is the home of bolt-on. Your product is probably here." | Discussion 1 (90s neighbor-pair): *"Where is pure chat actually the right answer? Where does it fail?"* |
| **L3** | Flight card + pie chart appear inline in chat | "You're not picking components — you're picking which structured outputs your agent can render. That's a PM decision." | Mini-hands-on 1 (5 min): change `description` of `showFlightCard` to "international flights only" — observe agent stop calling it for SFO→JFK |
| **L4** | Agent composes a sales dashboard from catalog primitives | "Catalog = your design system, but callable. Once you invest in this, agent UI cost grows logarithmically not linearly." | Demo only |
| **L5** | Agent embeds a local sketchpad + pivot table mini-app | "Sometimes the right move isn't building UI — it's routing to one that exists." | Live demo |
| **L6** | Agent adds/completes/highlights todos in shared canvas | "Shared state is when the agent stops being a co-pilot and becomes a co-author. Hidden cost: every state mutation is a privacy + audit decision." | Discussion 2 (90s): *"What's the first thing in your product that would benefit from shared state with an agent?"* |

#### Production note on L5

L5 currently demos external iframes (Excalidraw, tldraw, pivottable). These are being replaced with **local mini-apps** (sketchpad + pivot table built into the repo) — see §8 Production Checklist. By workshop day, L5 must run with zero external network dependencies.

### Act III — Action (75–90 min) · "Monday Morning"

The 15-minute payoff: turn insight into next-week actions. **PM audiences forget concepts but keep checklists.**

#### Beat-by-beat

| Time | Beat | Visual |
|---|---|---|
| 75:00–78:00 | "Remember these three?" callback | Slide 10 right half (the polished bolt-on empty states) returns |
| 78:00–81:00 | Discussion 3 (3 min, neighbor pairs): *"Pick one of these three. Using the spectrum, redesign its empty state. What does L3 / L4 / L6 look like?"* | Same slide |
| 81:00–84:00 | The decision matrix | Slide: 4×5 matrix mapping UI variety / agent autonomy / dev cost / visual consistency → spectrum point |
| 84:00–87:00 | "5 questions for your engineer Monday" | Single slide listing 5 questions (see below) |
| 87:00–89:30 | CTA + claim recap | Final slide: LinkedIn QR + repo QR + the claim restated + a question ("DM me your spectrum point") |
| 89:30–90:00 | 1 public Q&A | — |

#### The 5 questions (Act III takeaway artifact)

```
□ Is our agent's output 1 type of UI or N types?
   → 1 type: L3 is enough. N types: consider L4.

□ Does the agent need to modify content the user is actively editing?
   → Yes: L6 (shared state). Don't try to bolt L3 onto this need.

□ Do we need to build the UI, or can we route to an existing one?
   → If embeddable, embed (L5). Don't reinvent.

□ Can the user predict what UI they'll see each time?
   → Yes: lean L3 (visual consistency wins). No: accept L4's flexibility cost.

□ When the agent fails, can the user fall back to a familiar UI?
   → There must be a fallback. L3 + a text fallback is the default safety net.
```

This list is also distributed as a printable A4 handout with the LinkedIn + repo QR codes on the back.

---

## 5 · Slide deck spine

14 main slides + 7 Step slides + 1 overview slide = 22 slides total.

| # | Title | One-line content |
|---|---|---|
| S1 | Title | Speaker name + LinkedIn handle. No company logo. |
| S2 | Hook 1 video | 30s screen recording, fullscreen, no sound |
| S3 | "Let's rewind 4 years." | Black background, single italic line |
| S4–S10 | The 7 step slides | See §6 visual system |
| S11 | "Same question. Seven placements." | Overview slide: 7 mocks horizontally |
| S12 | Comparison: ChatGPT 2026 vs bolt-on empty states | Asymmetric split, dark bg |
| S13 | The claim, large type | "Chat is a feature. UI is the product. Don't bolt on. Redesign." |
| S14 | The Spectrum | L2–L6 horizontal axis with descriptive captions |
| S15 | (L2 demo backdrop) | "You are here. The home of bolt-on." |
| S16 | (L3 demo backdrop) | "Pick which structured outputs your agent can render." |
| S17 | (L4 demo backdrop) | "Catalog = your design system, but callable." |
| S18 | (L5 demo backdrop) | "Route to UI that already exists." |
| S19 | (L6 demo backdrop) | "Co-pilot becomes co-author." |
| S20 | Decision matrix | 4×5 table |
| S21 | 5 questions for Monday | Numbered list, large type |
| S22 | Final CTA | LinkedIn QR + repo QR + claim restated + "DM me your spectrum point" |

Demo backdrops (S15–S19) are minimal title cards — actual demos run from the repo, not from slides.

---

## 6 · Visual design system

> Full self-contained brief. Can be handed to a designer, fed to v0 / Figma AI, or used by Jimmy directly.

### 6.1 Intent

Make the "same user question rendered in 7 placements" comparison **visually unmistakable in 60 seconds with the audio muted**. Slides must carry 80% of the message without speaker narration, because attention will wander.

### 6.2 Design principles

| # | Principle | Decision rule |
|---|---|---|
| P1 | Evolution must be visible | Step N+1 has visibly higher density / capability than Step N |
| P2 | Chat container gradually dissolves | Steps 1–4: chat container fills up. Step 5: shrinks to sidebar. Step 6: gone. Step 7: everything gone. |
| P3 | One user question unchanged | "Show me Q3 sales by region" is a non-negotiable token across Steps 1–6 |
| P4 | No brand impersonation | No mockup may resemble ChatGPT / Claude / Notion / etc. We teach patterns, not products. |
| P5 | Silence has weight | Step 7 must be genuinely empty. "Empty" is a component, not a design failure. |

### 6.3 Design tokens

```
/* Surfaces */
--bg-canvas:        #fafafa
--bg-canvas-dark:   #0a0e1a
--surface-card:     #ffffff
--surface-elev-2:   #f3f4f6

/* Text */
--text-primary:     #0f172a
--text-secondary:   #6b7280
--text-tertiary:    #9ca3af
--text-on-dark:     #f5f5f0

/* Chat-specific */
--bubble-user-bg:   #eef2ff
--bubble-user-text: #1e1b4b
--bubble-ai-bg:     #ffffff
--bubble-ai-text:   #0f172a

/* Semantic accents (used sparingly) */
--accent-primary:   #f59e0b   /* progress, emphasis, reveal */
--accent-agent:     #10b981   /* "agent is doing something" */
--accent-warn:      #ef4444   /* anomalies, alerts */
--accent-tool:      #fef3c7   /* tool call background */

/* Lines */
--line-soft:        #e5e7eb
--line-strong:      #d1d5db
--line-dotted:      stroke-dasharray: 4 4   /* sandbox boundary */
```

### 6.4 Typography

```
Family:        Inter (sans) · JetBrains Mono (code/labels)
Optional:      Source Serif (transition slides only)

Scale (16:9 @ 1920×1080):
  Display     160pt / 700 weight   — claim slide
  Headline    100pt / 700           — Step titles
  Title        36pt / 600           — in-mock headers
  Body Large   28pt / 400           — AI message body
  Body         20pt / 400           — user messages, metadata values
  Caption      16pt / 500 / UPPERCASE / 0.08em tracking
                                     — metadata labels, page indicators
  Code         18pt / monospace     — tool calls, code blocks
```

### 6.5 Spacing & grid

```
Base unit:        8px (everything aligns)
Slide padding:    80px outer
Section gap:      48px between blocks
Mock container:   720×540 (fits left 48% of slide)
Border radius:    16 (chat container) · 8 (cards/code) · 4 (badges)
Drop shadow:      0 2px 4px rgba(15,23,42,0.04)   (elev-1)
                  0 8px 16px rgba(15,23,42,0.08)  (elev-2)
```

### 6.6 Component library

Reusable patterns that compose into the 7 mocks:

| Component | Used in | Rule |
|---|---|---|
| `<UserBubble>` | Steps 1–5 | Right-aligned · indigo bg · 12px radius · max 60% width |
| `<AIMessage>` | Steps 1–4 | Left-aligned · white card · 12px radius · max 80% width |
| `<ToolCallBlock>` | Steps 2, 4, 5 | Inset gray · 1px amber top border · monospace · collapsible style |
| `<CodeBlock>` | Step 4 | Dark editor (#1e293b) · syntax-tinted · footer timestamp |
| `<InlineChart>` | Steps 3, 4 | Horizontal bars · 4 rows · proportional widths · semantic color |
| `<RichCardGrid>` | Step 6 | 2-column · 16px gap · 12px radius · KPI strip at top |
| `<AnomalyAlert>` | Step 6 | Amber half-opaque bg · warning icon · 2 action chips |
| `<AppShell>` | Step 5 | 80% width · toolbar with pivot pills · agent cursor visible |
| `<ChatSidebar>` | Step 5 | 20% width · right-docked · agent timeline (monospace) |
| `<EmptyState>` | Step 7 | Single outline `?` · one italic subline · everything else MUST be empty |

### 6.7 Composition of the 7 mocks

| Step | UserBubble | AIMessage | ToolCall | Code | Chart | CardGrid | Anomaly | AppShell | Sidebar | Empty |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ✓ | ✓ (text only) | | | | | | | | |
| 2 | ✓ | ✓ | ✓ | | | | | | | |
| 3 | ✓ | ✓ | | | ✓ | | | | | |
| 4 | ✓ | ✓ | ✓ | ✓ | ✓ | | | | | |
| 5 | | | | | | | | ✓ | ✓ | |
| 6 | | | | | ✓ | ✓ | ✓ | | | |
| 7 | | | | | | | | | | ✓ |

### 6.8 Slide wrapper template (Steps 1–6)

```
┌─────────────────────────────────────────────────────────┐
│ STEP N/7                                  [progress 1/7] │
│                                                          │
│ Step N — {Title}                          (100pt bold)   │
│ ───── hairline divider 60% ─────                         │
│                                                          │
│ ┌──────────────────────┐    ┌──────────────────────┐     │
│ │  [the mock 720×540]  │    │  ERA                 │     │
│ │                      │    │  CAPABILITY          │     │
│ │                      │    │  REPRESENTATIVE      │     │
│ │                      │    │  BOUNDARY CROSSED    │     │
│ └──────────────────────┘    └──────────────────────┘     │
│                                                          │
│ "{Chinese caption}"               🙋 {prompt if any}     │
└─────────────────────────────────────────────────────────┘
```

Exceptions:
- **Step 5** breaks the 48% mock width and consumes 80% (the size inversion is the visual signal). Metadata collapses to one inline row at the bottom.
- **Step 7** drops the metadata entirely and centers only `<EmptyState>`.

### 6.9 The overview slide (S11)

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                     │
│  │S1│ │S2│ │S3│ │S4│ │S5│ │S6│ │S7│                     │
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘                     │
│                                                          │
│         "Same question. Seven placements."               │
└─────────────────────────────────────────────────────────┘
```

Each thumb is 280×200 — the actual Step mock scaled down, not redesigned.

### 6.10 Non-goals

- Real product screenshots (ChatGPT / Claude UIs) — locks viewer into specific brands
- Animation / video transitions — production cost + runtime risk
- Character avatars / personification — distracts attention
- Multi-accent color systems — by Step 6 the noise > signal
- External icon libraries (Lucide / FontAwesome) — outlines + type carry the language
- Precise dollar values like "$4,231,873" — "$4.2M" reads in 1 second

---

## 7 · Hands-on & discussion moments

Three neighbor-pair discussions form the structural spine of audience participation. Two mini-hands-on moments are optional and time-boxed.

| # | Moment | Time | Duration | Prompt |
|---|---|---|---|---|
| Discussion 1 | After L2 baseline | ~21:00 | 90s | "Where is pure chat actually the right answer? Where does it fail?" |
| Mini-hands-on 1 | L3 mid-demo | ~35:00 | 5 min | Change description on `showFlightCard`. Observe agent behavior change. |
| Discussion 2 | After L6 demo | ~71:00 | 90s | "What's the first thing in your product that would benefit from shared state with an agent?" |
| Discussion 3 | Act III callback | ~78:00 | 3 min | "Redesign one of the three polished empty states from Slide 10 using the spectrum." |

**Reasoning:** PM-heavy audiences engage 10× more through neighbor talk than through speaker prompts. "Turn to your neighbor" scales from 30 to 150 attendees with no adjustment needed. Discussion 3 is the workshop's primary creative moment; the audience leaves having done structured product thinking, not just listened.

---

## 8 · Production checklist

### Highest priority (workshop-blocker)

```
□ Hook 1 — 30s screen recording (the deck's most important asset)
□ 7 chat UI mocks (Steps 1–7) following §6 design system
□ Overview slide (S11) — 7 thumbs side-by-side
□ Comparison slide (S12) — ChatGPT collage vs 3 polished empty states
□ Claim slide (S13) — large type
□ Spectrum slide (S14)
□ Decision matrix (S20)
□ 5 questions slide (S21)
□ Final CTA (S22) — LinkedIn + repo QRs
□ A4 printable handout — 5 questions + QR codes (back)
□ L5 local mini-apps replacement (Sketchpad + PivotTable) — kill external iframe risk
```

### Workshop logistics

```
□ Backup OpenAI API key (separate from primary, dedicated to demo day)
□ Mobile hotspot tested as backup network
□ Fallback recording for each live demo (Step 5 / L4 / L5 / L6)
   — keystroke-switchable from main demo
□ Pre-warm: open localhost:5176 on L5 tab 15 min before start
□ T-60 min on-site smoke test: run L2 → L6 with one message each
```

### Speaker prep

```
□ Rehearse with timer (PM audiences expand discussions; control aggressively)
□ Prepare follow-up DM reply template for "spectrum point" responses
□ LinkedIn profile updated with workshop-friendly framing
□ Pre-distribute repo link 24h before (let early arrivers npm install)
```

### Pre-workshop repo hygiene (separate from this spec)

```
□ Revoke leaked OpenAI key (security)
□ Cleanup git history (rm -rf .git && git init since only 2 commits + no remote)
□ Publish public GitHub repo 1 week before workshop
□ Update README with workshop section + prerequisites
```

---

## 9 · Risk register & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| OpenAI rate-limit during live demos | Medium | High | Backup key + reduced demo count if hit |
| Excalidraw / tldraw CSP changes break L5 iframes | Medium | Medium | Replace with local mini-apps (see Production §8) |
| Venue Wi-Fi drops during live demo | Medium | High | Mobile hotspot ready, pre-tested |
| Step 7 silence is awkward in a large room (>80 ppl) | Medium | Low | Replace silence with 30s neighbor whisper: "What's missing?" |
| Audience finds repo answers before lesson lands | Medium | Low | Speaker reframes from "how" to "why & when" — repo as proof, not as spoiler |
| 90 minutes runs over | High | Medium | Discussions are strictly timed; L5/L6 demos cut first if running long |
| Audience pushback: "but my chatbot drove revenue" | Low | Medium | Pre-prep response: "great — that's the feature working. The product is bigger." |
| `@copilotkit/*` fresh install pulls a newer breaking version | Low | High | Versions pinned to 1.57.1 (already committed) |
| Live demo crashes during the workshop | Medium | High | Fallback recording for every demo, keystroke-switchable |

---

## 10 · Acceptance criteria

The workshop is "ready" when these tests pass:

### Spec-level
- [ ] A designer who has never met Jimmy can produce all visual assets from this spec alone
- [ ] A reader of the spec can describe the workshop's central claim, structure, and key moments in 3 sentences

### Visual design (from §6.10)
- [ ] **Silent test:** A non-technical person, watching the 7 Step slides muted for 60 seconds, can articulate "these show the same thing in different stages"
- [ ] **Thumb test:** All 7 mocks scaled to 280×200 are still distinguishable in 5 seconds
- [ ] **Recall test:** The day after a rehearsal, the rehearsal listener recalls Step 7 (empty) or the overview slide — NOT the L3 chart (which would mean the chart upstaged the message)

### Production-level
- [ ] Repo runs end-to-end from `make install && make dev` on a fresh machine in under 5 minutes
- [ ] Every live demo has a recorded fallback that's keystroke-switchable
- [ ] All workshop-blocker items from §8 are checked off 7 days before the conference
- [ ] Two on-site rehearsals completed under timer

### Speaker readiness
- [ ] Hook 1 video and Slide 11 (overview) can be triggered without looking at the laptop
- [ ] The claim can be delivered at minute 13:30 without notes
- [ ] Each "turn to your neighbor" instruction takes <15 seconds to deliver

---

## 11 · Open questions / decisions TBD

Things this spec does not yet fully resolve. Should be closed before implementation planning:

1. **Discussion 3's room-size variant.** For >80 attendees, the "redesign the empty state in 3 minutes with your neighbor" exercise may underdeliver (large rooms get whispery and unstructured). Backup: shrink to 90s of "name one alternative placement out loud to your neighbor." Decision needed when room size is confirmed.

2. **The unifying question.** Current choice: *"Show me Q3 sales by region."* If Jimmy wants a more universal/less business-y example, candidates include "Analyze last week's signups" or "Plan a team offsite." Decision affects all 7 mocks.

3. **Hook 1 production.** Specs in §6 assume the 30s video exists. Approach: screen-record the actual A2UI repo cycling through L2 → L6 with a single prompt? Or storyboarded post-production?

4. **Discussion 3 callback artifact.** Should each pair leave with something written (sticky note, shared doc, none)? Affects whether to provide pre-printed templates.

5. **Slide 12 (comparison) — the 3 polished empty states.** Should these be (a) real screenshots from a design exploration tool Jimmy has access to, (b) commissioned from a designer, or (c) generated via image-gen? Affects production cost.

---

## 12 · Implementation handoff

Once Jimmy approves this spec, the next step is invoking the **writing-plans** skill to break this into an ordered, dependency-aware implementation plan. Likely streams:

1. **Visual assets** (slides + 7 mocks + Hook 1 video) — biggest stream, largest external dependency (potentially a designer)
2. **A2UI repo finalization** (L5 local apps + workshop README + version pin verification)
3. **Speaker prep** (rehearsal schedule + handout materials + Q&A prep)
4. **Logistics** (on-site backup plan + dry run + day-of checklist)

These can run in parallel after spec approval.
