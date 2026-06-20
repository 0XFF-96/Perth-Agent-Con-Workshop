# Reinvent Old Software in an Agentic Way

Slide document for a 38-slide AgentCon Perth workshop deck.

This document is the source of truth before PPTX production. Each slide captures the key opinion, audience belief, supporting evidence, visual direction, speaker script, and transition.

## Deck Thesis

Chat is a feature. UI is the product. Do not bolt AI onto old software; redesign the workflow so humans and agents can share intent, context, tools, UI, and state.

## Core Definitions

Old software is not bad software. It is software designed around fixed human navigation: screens, menus, forms, tables, filters, dashboards, approval queues, and workflows where the user translates intent into clicks.

The agentic way means designing software so the user directs the system instead of manually operating every step. The product can understand intent, read context, call tools, generate or choose UI, update state, ask for approval, recover when wrong, and leave an audit trail.

---

## Slide 1 - Title

Title: Reinvent Old Software in an Agentic Way

Key opinion: AI should not be added as a chatbot layer. It should force us to redesign the software surface itself.

Audience belief: This is not a vendor demo or generic AI talk. This is a product design argument.

Supporting evidence: Workshop repo, live demos, L2-L6 spectrum.

Visual: Minimal title slide. Large title, Jimmy Li, AgentCon Perth 2026, repo or LinkedIn QR.

Speaker script:
"Hi, I'm Jimmy. Three things before we start. One, there are zero vendor pitches in the next 90 minutes. Two, the real work is in a public GitHub repo. Three, I want one thing from you when we're done. I will tell you what at minute 89."

Transition: "Before we talk about reinventing old software, I want to show you how fast the interface has already changed."

## Slide 2 - A Clear History of Generative UI

Title: A Clear History of Generative UI

Key opinion: The history of generative AI is not just model improvement. It is a history of the interface escaping the chat box.

Audience belief: Generative UI has a direction: from text, to tools, to multimodal, to workspace, to agentic interfaces.

Supporting evidence:
- ChatGPT launched November 30, 2022.
- ChatGPT plugins were announced March 23, 2023.
- GPT-4o was announced May 13, 2024.
- Canvas was introduced October 3, 2024.
- Notion and Box are moving toward agent-aware workspace and headless software patterns.

Visual: Editable timeline inspired by the reference image. Light background, blue-to-purple progression, milestone cards: Text-only chat, Tools and plugins, Code Interpreter, Vision/Voice/Custom GPTs, GPT-4o real-time multimodal, Canvas to agentic UI. Bottom trend bar: Text -> Tools -> Multimodal -> Workspace -> Agentic UI.

Speaker script:
"Most people tell the story of generative AI as a model story: GPT-3.5, GPT-4, GPT-4o, bigger context windows, better reasoning. That story is true, but it is not the story I want you to pay attention to today. I want you to see this as a UI history. Text became tools. Tools became multimodal. Multimodal became workspace. Workspace becomes agentic UI. The overall trend is that generative UI is becoming more visual, more interactive, and more autonomous."

Transition: "So today I do not want to ask, 'How do we add AI to our product?' I want to ask a harder question: what does our product become when the agent is part of the interface?"

## Slide 3 - What Is Old Software?

Title: What is old software?

Key opinion: Old software is not bad software. It is software designed around fixed human navigation.

Audience belief: Old software was designed for human operators navigating fixed screens, not agents collaborating around intent.

Supporting evidence: Enterprise product patterns: forms, tables, dashboards, filters, menus, approval queues, settings panels.

Visual: Dense but clean enterprise UI collage: table, filter bar, dashboard card, form, approval queue. Bottom line: "User intent -> user translates intent into clicks -> software executes fixed workflow."

Speaker script:
"When I say old software, I do not mean bad software. I mean software designed for a world where the computer could not understand intent. The user had to do the translation. If I want Q3 sales by region, I need to know where reports live, which filters to apply, how to group the data, and how to export or visualize it. That translation work became the product experience."

Transition: "Agentic software changes that assumption."

## Slide 4 - What Is The Agentic Way?

Title: What is the agentic way?

Key opinion: The agentic way means designing software so the user directs the system instead of manually operating every step.

Audience belief: Agentic software is not simply software with AI added. It is software designed for intent, context, tools, UI, and state.

Supporting evidence: Agent capabilities: understand intent, read context, call tools, choose UI, update state, ask for approval, recover when wrong.

Visual: Flow diagram: User intent -> context -> tools/APIs -> generated or selected UI -> shared state -> user review. Bottom line: "User intent -> agent interprets context -> tools / UI / state -> user reviews or collaborates."

Speaker script:
"The agentic way does not mean 'add AI.' It means the product can support agent-like behavior. The user expresses intent. The system reads context, chooses tools, creates or changes UI, updates state, and asks for confirmation when needed. The user is no longer just operating the software. The user is directing the software."

Transition: "That gives us the real paradigm shift."

## Slide 5 - From Operating Software To Directing Software

Title: From operating software to directing software

Key opinion: Software is moving from navigation-first to intent-first.

Audience belief: Agentic software changes the primary interaction model.

Supporting evidence:
- Software 3.0 framing: natural language becomes a control surface.
- Notion is positioning its workspace as a hub for agents, tools, workflows, and databases.
- Box is preparing for software used through agents and APIs, not only human UI.

Visual: Two-column contrast. Left: Old software, navigation-first, screens/menus/forms/filters, user translates intent into clicks. Right: Agentic software, intent-first, context/tools/generated UI/shared state, agent helps translate intent into action.

Speaker script:
"Old software is navigation-first. It asks: which screen, which menu, which filter, which button? Agentic software is intent-first. It asks: what are you trying to do, what context do we have, what tools are available, what should change, and what interface should appear now? This is why Software 3.0 matters. If natural language becomes a control surface for software, then the interface is no longer only a set of fixed screens."

Transition: "And once you see that shift, the common AI product mistake becomes obvious."

## Slide 6 - The Common Mistake

Title: The common mistake

Key opinion: Most teams respond to an intent-first shift by adding a navigation-first chatbot.

Audience belief: A chatbot bolted onto old software often preserves the old workflow instead of reinventing it.

Supporting evidence: Common enterprise AI patterns: bottom-right chatbot, "Ask AI" sidebar, empty-state prompt suggestions, assistant that cannot act on product state.

Visual: Legacy dashboard with a small chat widget attached. Label: "New intelligence. Old structure."

Speaker script:
"The industry moves toward intent-first software, and most teams respond by taking their old navigation-first product and adding a chatbot to the corner. The dashboard stays the same. The table stays the same. The form stays the same. The workflow stays the same. Now there is a little box that says 'Ask me anything.' So we have new intelligence sitting beside an old structure. That is why many AI features feel impressive in a demo and useless in the product."

Transition: "So here is the claim for today."

## Slide 7 - The Claim

Title: Chat is a feature. UI is the product.

Key opinion: AI placement is a structural product decision, not a UI polish decision.

Audience belief: The workshop has a clear thesis and challenge.

Supporting evidence: Opening timeline, old software definition, paradigm shift, common chatbot mistake.

Visual: Dark slide, huge typography: "Chat is a feature. UI is the product." Subtitle: "Don't bolt on. Redesign."

Speaker script:
"Chat is a feature. UI is the product. Do not bolt on. Redesign. That does not mean chat is bad. Chat is useful. Chat is powerful. Chat is sometimes exactly the right interface. But chat is not the product strategy. The product strategy is deciding where intelligence should live."

Transition: "For the rest of this workshop, I am going to give you a spectrum for making that decision."

## Slide 8 - What You Will Build And See

Title: What you will build and see

Key opinion: The workshop is not a tour of AI features. It is a controlled comparison of the same old-software workflow across multiple agentic UI placements.

Audience belief: They understand the hands-on structure before the demo begins.

Supporting evidence: The code demo will use one CRM/Sales Ops workflow and show it as old software, L2 chat, L3 components, L4 composed workspace, L5 routed tools, and L6 shared state.

Visual: Workshop map with six stops: Old CRM -> L2 Chat -> L3 Cards -> L4 Workspace -> L5 Tools -> L6 Shared State. Bottom line: "Same user intent. Different placement."

Speaker script:
"Before I show you the spectrum, here is what you are going to see. We will use one old-software workflow: a CRM account follow-up. Same account, same user intent, same business context. Then we will move that intent through several UI placements. First old software. Then plain chat. Then components. Then a composed workspace. Then routed tools. Then shared state. This is not six unrelated demos. It is one product decision shown six ways."

Transition: "The repeated prompt is simple."

## Slide 9 - The Repeated Prompt

Title: Same intent. Six surfaces.

Key opinion: Holding the user intent constant reveals that the real design decision is interface placement.

Audience belief: They know what to watch for in the demo: not whether the model answers, but where the answer lives.

Supporting evidence: Workshop design spec uses a repeated question as the narrative device. The code demo will use a CRM version of that same technique.

Visual: Large prompt chip:
"Prepare my Q3 follow-up for Acme Corp and show me what changed."
Under it, six output destinations: old CRM screen, chat answer, account card, generated workspace, external tool, shared account plan.

Speaker script:
"The prompt will barely change: prepare my Q3 follow-up for Acme Corp and show me what changed. The reason we keep it constant is that I do not want you comparing prompts. I want you comparing placements. Same intent. Six surfaces. Where does the intelligence live?"

Transition: "We start with the software most teams already have."

## Slide 10 - Demo Baseline: Old CRM

Title: Baseline - Old CRM

Key opinion: Old software makes the user translate intent into navigation, inspection, and manual updates.

Audience belief: They can see the old workflow before it gets reinvented.

Supporting evidence: CRM/Sales Ops is a strong old-software domain: account records, opportunities, notes, tasks, follow-ups, dashboards, approvals.

Visual: Static CRM screen: account record, opportunity table, Q3 revenue chart, notes, tasks, follow-up draft area. Annotation: "User does the translation work."

Speaker script:
"Here is the baseline. A normal CRM screen. Records, tables, notes, tasks, a chart, maybe an email draft area. Nothing here is bad. This is how software has worked for decades. But if the user wants to prepare a Q3 follow-up, they have to inspect the account, read the notes, compare revenue, decide the risk, create tasks, and draft the message. The software stores the work. The user operates it."

Transition: "Now we move the same intent through the generative UI spectrum."

## Slide 11 - How The Hands-On Works

Title: How the hands-on works

Key opinion: Participants should change one behavior knob, not build the whole system during the workshop.

Audience belief: The workshop is approachable even if they are not frontend experts.

Supporting evidence: Existing L3 tutorial pattern: change one action description and observe the agent's behavior change.

Visual: Three-part instruction: 1. Run the app. 2. Watch L2-L6. 3. Edit one description / rule and observe behavior. Include file path placeholder: `frontend/src/lessons/L3Components.jsx`.

Speaker script:
"You do not need to build this whole app during the workshop. The repo is the proof object. The hands-on moment is intentionally small: you will change one behavior knob and watch the agent change its decision. In L3, that knob is the tool description. That is enough to feel the important idea: natural language in the product can steer what UI the agent chooses."

Transition: "Now the spectrum has a concrete demo behind it."

## Slide 12 - The Generative UI Spectrum

Title: The Generative UI Spectrum

Key opinion: There is no single AI UI. There are different placements for intelligence, each with different trade-offs.

Audience belief: They now have vocabulary: L2, L3, L4, L5, L6.

Supporting evidence: Repo lessons L2-L6.

Visual: Horizontal spectrum: L2 Plain chat -> L3 Components as tools -> L4 Catalog + composition -> L5 Route to apps -> L6 Shared state.

Speaker script:
"If chat is only one placement, what are the others? This is the map we will use for the rest of the workshop. L2 is pure chat. L3 is registered components. L4 is catalog and composition. L5 is routing to apps. L6 is shared state. The point is not that L6 is always better than L2. The point is that each level makes a different structural bet."

Transition: "We will start with the one almost everyone ships first."

## Slide 13 - L2 Plain Chat

Title: L2 - Plain Chat

Key opinion: Plain chat is useful, but it is usually the easiest version of AI to ship and the easiest version for users to ignore.

Audience belief: L2 is not wrong, but it is limited.

Supporting evidence: L2 lesson: basic CopilotChat connected to an agent backend.

Visual: Simple chat interface with prompt "What can you help me with?" Label: "Fast to ship. Weak product context."

Speaker script:
"L2 is where most AI features start. A chat input. A streaming response. Maybe some suggested prompts. To be clear, L2 is not bad. It is good for support, internal knowledge search, brainstorming, and open-ended questions. But the user has to know what to ask, and if they need to act, they usually still go back into the old software and click through the workflow."

Demo: Open L2 tab. Try "What can you help me with?" and "Summarize last quarter's metrics."

Transition: "So where does plain chat actually work, and where does it fail?"

## Slide 14 - Discussion: Where Does Chat Work?

Title: Where is pure chat actually the right answer?

Key opinion: Chat works when the user knows the question and the output can safely be text.

Audience belief: They start applying the framework to their own products.

Supporting evidence: Audience examples.

Visual: Large prompt: "Where is pure chat actually the right answer? Where does it fail?" Add 90-second timer.

Speaker script:
"Talk to the person next to you. Two questions. One: where is plain chat actually the right answer? Two: where does it fail? Be specific. Do not say 'customer support' as a category. Say the actual moment. You have ninety seconds."

Transition: "Most of the rest of this workshop is about solving the failure modes you just named."

## Slide 15 - L3 Components As Tools

Title: L3 - Components as Tools

Key opinion: Your design system becomes the agent's vocabulary.

Audience belief: The agent does not need arbitrary UI freedom to feel useful. It can choose from approved components.

Supporting evidence: L3 lesson, `useCopilotAction`, `showFlightCard`, `showPieChart`.

Visual: Diagram: User prompt -> agent tool call -> React component. Include `showFlightCard({ airline, from, to, departure, price })`.

Speaker script:
"L3 is the first real step off the bolt-on baseline. You build components. You register them as tools. The agent decides when to call them. The agent is not inventing arbitrary UI. It is not writing React on the fly. It can only use the components you gave it. That makes L3 powerful for product teams."

Transition: "Let's see it."

## Slide 16 - L3 Demo: Flight Card

Title: L3 Demo - Flight Card

Key opinion: A small registered component can turn a chat reply into product UI.

Audience belief: They understand the difference between text about a flight and a real rendered product component.

Supporting evidence: `frontend/src/lessons/L3Chat.jsx`, `showFlightCard`, `FlightCard.jsx`.

Visual: Flight card screenshot or mockup, with small `useCopilotAction` snippet.

Speaker script:
"Same chat input. Different output. I am going to ask for a flight card. That is not a markdown table. That is a React component. The model read my request, selected the action, extracted the arguments, and rendered the component inside the conversation."

Demo prompt: "Show me a flight card for Pacific Air, SFO to JFK, departure 08:30, $249"

Transition: "Now let's show that this is not only for cards."

## Slide 17 - L3 Demo: Pie Chart

Title: L3 Demo - Pie Chart

Key opinion: L3 works when your agent needs a small number of polished, predictable output types.

Audience belief: They see L3 as a repeatable pattern, not a one-off flight-card trick.

Supporting evidence: `showPieChart` registered in L3.

Visual: Pie chart UI, prompt chip: "Pie chart of my time..."

Speaker script:
"Different component, same pattern. I did not write a special if-statement for this prompt. The model matched the user request to the registered component. It parsed labels and values and passed the props. If your product needs five or ten specific AI outputs, register the outputs you care about and make them good."

Demo prompt: "Pie chart of my time: 40% coding, 30% meetings, 20% email, 10% other"

Transition: "The surprising part is that the most important thing in this demo is not the component. It is the description."

## Slide 18 - Hands-On: Change One Sentence

Title: Hands-on - Change one sentence

Key opinion: In agentic UI, product behavior can be shaped by natural-language tool descriptions.

Audience belief: PMs can influence agent behavior without owning the full implementation.

Supporting evidence: L3 tutorial checkpoint: change `showFlightCard` description.

Visual: Instruction card: open `frontend/src/lessons/L3Chat.jsx`, find `showFlightCard`, change description to "Only call this for international flights.", try SFO -> JFK again.

Speaker script:
"Now you do one thing. Not ten files. Not a new component. One sentence. Change the description to 'Only call this for international flights.' Save. Then ask the same SFO-to-JFK question again. What changed? The model read your description and decided the tool no longer applied. That means the description is not documentation. It is behavioral design."

Transition: "L3 is great while the number of outputs is small. But what happens when the number of possible interfaces explodes?"

## Slide 19 - L3 Takeaway

Title: L3 in one breath

Key opinion: L3 is the best first upgrade from chat when you need polish, predictability, and a small set of known UI patterns.

Audience belief: They know when to pick L3.

Supporting evidence: Flight card, pie chart, description behavior.

Visual: Three statements: Components are tools. Descriptions are product behavior. The agent does the dispatch. Use when there are ten or fewer distinct UI patterns and polish matters.

Speaker script:
"L3 in one breath: your components become tools, your descriptions become product behavior, and the agent does the dispatch. Use L3 when you have a small number of distinct UI patterns and you care about visual polish. If you know the shape ahead of time, L3 is usually the right answer."

Transition: "But if you need the agent to assemble many different layouts, L3 becomes expensive. That is where L4 comes in."

## Slide 20 - L4 Catalog + Composition

Title: L4 - Catalog + Composition

Key opinion: When fixed components stop scaling, give the agent a constrained design system instead of unlimited freedom.

Audience belief: L4 is not "AI makes any UI." L4 is "AI composes approved primitives."

Supporting evidence: L4 docs: component catalog, schema, renderer, primitives.

Visual: Diagram: Catalog primitives -> agent-generated schema -> renderer -> dashboard UI.

Speaker script:
"L4 changes the abstraction. Instead of giving the agent finished components, you give it a catalog of primitives: Container, Grid, Card, Stat, Text, Table, Badge. These are the Lego bricks. The agent produces a schema that says how to arrange them, and your renderer turns that schema into real UI. The agent composes the interface, but your product owns the vocabulary."

Transition: "Let's see what that looks like with a dashboard."

## Slide 21 - L4 Demo: Sales Dashboard

Title: L4 Demo - A dashboard that did not exist before the prompt

Key opinion: Declarative UI lets the agent generate task-specific screens without hand-building each one.

Audience belief: They understand why L4 matters for dashboards, reports, admin panels, and enterprise workflows.

Supporting evidence: L4 dashboard prompt and A2UI renderer.

Visual: Generated dashboard screenshot or mockup, plus tiny schema snippet `{ "type": "Grid", "children": [...] }`.

Speaker script:
"In L3, I ask for a known component. In L4, I ask for a layout. This dashboard did not exist before the prompt. There was no SalesDashboard.jsx. The agent selected primitives, arranged the layout, filled in the data, and represented positive and negative movement inside the catalog we gave it. L4 is constrained composition."

Demo prompt: "Build me a sales dashboard with revenue $48k (+12%), 312 signups (-4%), 2.1% churn, and a small table of top 3 customers by revenue."

Transition: "But sometimes the right move is not to compose UI at all."

## Slide 22 - L4 Takeaway

Title: Use L4 when the layout space is bigger than your component list

Key opinion: L4 trades pixel-perfect predictability for scalable variation.

Audience belief: They know L4's benefit and cost.

Supporting evidence: L3 vs L4 comparison.

Visual: Two columns. L3: known shapes, high polish, easy QA. L4: many shapes, catalog reuse, schema validation, more unpredictability.

Speaker script:
"Use L4 when the layout space is bigger than your component list. If you have five known outputs, L3 is probably better. If users can ask for many combinations of data, metrics, comparisons, and summaries, L4 starts to make sense. You are no longer designing every final screen. You are designing the grammar the agent is allowed to speak."

Transition: "Now let's go one step further. What if the best UI is not inside your product at all?"

## Slide 23 - L5 Route To Existing Apps

Title: L5 - Route to Existing Apps

Key opinion: Agentic software should not reinvent every interface. Sometimes the best UI is a tool the user already understands.

Audience belief: L5 is about orchestration, not generation.

Supporting evidence: L5 docs: `openApp`, sketchpad, pivot table, MCP Apps concept.

Visual: User intent -> agent -> app registry -> sketchpad / pivot table / external tool.

Speaker script:
"L5 is philosophically different. L3 and L4 are about building UI for the agent to use. L5 asks: what if we should not build the UI? If a user wants to sketch a diagram, should your enterprise app invent a whiteboard? Probably not. The agent's job might be to route the user into the right tool."

Transition: "Let's see two examples."

## Slide 24 - L5 Demo: Sketchpad + Pivot Table

Title: L5 Demo - The right interface already exists

Key opinion: Routing can be more valuable than generating.

Audience belief: They see L5 as a practical product strategy, not just a technical integration pattern.

Supporting evidence: Demo prompts for sketchpad and pivot table.

Visual: Split screen: sketchpad and pivot table.

Speaker script:
"The agent did not describe a diagram in text. It opened a sketchpad. That is a better product decision. Then a different intent opens a different surface: a pivot table. The user expressed a goal. The agent routed them to a tool-shaped interface."

Demo prompts:
- "I want to sketch a system diagram for our new feature."
- "I want to explore some sales data interactively."

Transition: "L5 gives the user the right tool. L6 goes further: the agent and user work on the same object."

## Slide 25 - L6 Shared State / Canvas

Title: L6 - Shared State / Canvas

Key opinion: The biggest shift happens when the agent stops answering and starts co-editing the product state.

Audience belief: L6 is not richer output. It is a different relationship between user, agent, and software.

Supporting evidence: L6 docs: `useCopilotReadable`, `useCopilotAction`, todos state.

Visual: User <-> shared state <-> agent. UI renders from the same state.

Speaker script:
"L6 is the most important level for reinventing old software because this is where the agent stops being a respondent and becomes a collaborator. In L6, the agent and I share the same object. I can edit it. The agent can read it. The agent can update it. The UI reflects the same source of truth."

Transition: "Here is the simplest possible version: a todo list."

## Slide 26 - L6 Demo: Same State, Two Editors

Title: L6 Demo - Same state, two editors

Key opinion: Shared state turns the agent from a helper beside the product into a participant inside the product.

Audience belief: They understand why L6 cannot be faked with a prettier chat response.

Supporting evidence: Todo demo: agent adds todos, user checks one, agent reads changed state, agent highlights items.

Visual: Todo panel plus chat panel. Arrows: user edit -> shared state -> agent sees it.

Speaker script:
"I am going to ask the agent to create state. Notice the agent does not just say 'Here are three todos.' It changes the UI state. Now I edit the state myself. The agent knows because it is reading the same state. It is not looking at a screenshot. It is not guessing from the chat history."

Demo prompts:
- "Add three todos about preparing for next quarter's launch."
- "Which one did I just mark done?"
- "Highlight any todo that mentions a deadline."

Transition: "And it comes with a serious product cost."

## Slide 27 - L6 Takeaway: Co-Author, Not Co-Pilot

Title: Co-author, not co-pilot

Key opinion: Shared state is powerful because it lets the agent act, but dangerous because every exposed state field becomes a trust, privacy, and audit decision.

Audience belief: L6 is high-value but must be designed carefully.

Supporting evidence: Product risk examples: CRM records, financial approvals, medical notes, HR workflows, customer support actions.

Visual: Three columns: Value, Risk, Design question. Design question: "What state should the agent see or mutate?"

Speaker script:
"L6 is powerful because the agent can act on real product state. But that is also why L6 is dangerous. Every piece of state you expose becomes a product decision. Can the agent read this field? Can it modify this field? Does the user approve before mutation? Is there an audit log? Can we roll back?"

Transition: "So let's make this concrete for your product."

## Slide 28 - Discussion: What Needs Shared State?

Title: What in your product needs shared state?

Key opinion: The best L6 candidates are specific screens where user editing and agent assistance overlap.

Audience belief: They can identify a real L6 candidate in their own product.

Supporting evidence: Audience examples.

Visual: Prompt: "Name one screen where the user edits something the agent should understand." Examples: proposal editor, CRM opportunity, support ticket, onboarding checklist, analytics dashboard filters, configuration panel.

Speaker script:
"Talk to your neighbor. What is the first thing in your product that would benefit from shared state with an agent? Do not pick something vague like 'our dashboard.' Name the screen, name the object, and name what the user edits."

Transition: "Now we have all five levels. Let's put them back on one map."

## Slide 29 - The Spectrum Revisited

Title: Same model. Different placements.

Key opinion: The right AI UI depends on where intelligence should live in the workflow.

Audience belief: They see L2-L6 as product choices, not a maturity ladder.

Supporting evidence: All demos: L2 chat, L3 card/chart, L4 dashboard, L5 app embed, L6 shared canvas.

Visual: Spectrum again with screenshot above each level.

Speaker script:
"Same model category. Different placements. L2: intelligence lives in chat. L3: intelligence chooses a component. L4: intelligence composes a layout. L5: intelligence routes to an app. L6: intelligence shares product state. The question is not which level is best. The question is where intelligence should live for this specific feature."

Transition: "Before we choose, let me make a two-year prediction."

## Slide 30 - Two-Year Prediction

Title: In two years, agents will not live in one place

Key opinion: The future of agentic software is not one universal chatbot. It is a mix of agent surfaces embedded across workflows, data, documents, tools, and state.

Audience belief: Agentic UI will spread into product surfaces, not replace every app with chat.

Supporting evidence: OpenAI Canvas and Apps direction, Notion agent workspace direction, Box headless software direction.
Salesforce POV: Salesforce's Agentforce leadership frames the next enterprise phase as multi-agent orchestration, not isolated single-agent assistants.

Visual: Product map with agents living in chat sidebar, document canvas, dashboard, CRM record, workflow automation, external tool, API/MCP layer.

Speaker script:
"In two years, agents will not live in one place. They will not only live in a chat sidebar. And they will not magically replace every app with one universal interface. Instead, agents will show up across the product surface: sometimes as chat, sometimes as a component, sometimes as a dashboard, sometimes as a workspace, sometimes as automation behind the scenes, and sometimes as an API user."

Speaker add-on:
"Salesforce is making a similar bet from the enterprise side. Their Agentforce leadership argues that single agents become dead-end islands unless they can interoperate, share context, and be governed. That is exactly why UI placement, state, tools, and permissions matter."

Transition: "So which products change first?"

## Slide 31 - Where Agentic UI Lands First

Title: Where agentic UI lands first

Key opinion: Agentic systems will first reshape products where work is repetitive, context-heavy, and stateful.

Audience belief: They can identify likely product categories for agentic transformation.

Supporting evidence: Industry movement in coding, productivity, CRM, support, analytics, project management, operations, design. Salesforce's Agentforce Sales positioning is a concrete CRM example: sellers work alongside AI agents that handle prospecting, research, lead nurturing, and operational follow-up while humans focus on relationships and closing.

Visual: Grid of product categories: coding tools, documents and knowledge work, CRM and sales workflows, customer support, analytics/BI, project management, back-office operations, design/whiteboarding.

Speaker script:
"My bet: products where the user is doing repetitive, context-heavy, stateful work. Coding is already there. Documents and knowledge work are next. CRM and sales workflows are obvious candidates. Customer support will change quickly because the workflow is structured. Analytics and BI will change because users know the business question but not the dashboard path. Project management and operations tools will change because they are full of state."

Speaker add-on:
"Salesforce is already positioning CRM this way: not as a chatbot for sales reps, but as a digital workforce around sales workflows. That is a useful industry signal because CRM is one of the clearest examples of old software: lots of records, state, approvals, follow-ups, and context."

Transition: "And these products will need more than a prompt box."

## Slide 32 - The New Agentic UI Stack Is Emerging

Title: The new agentic UI stack is emerging

Key opinion: Agentic UI is becoming an engineering stack, not only a design idea.

Audience belief: This workshop is grounded in a broader research and tooling shift, not just one repo or one product opinion.

Supporting evidence:
- Research: papers are starting to frame the shift from human interfaces to agent interfaces, and plain-text chat as a bottleneck for complex personal agents.
- Protocols: AG-UI, MCP Apps, and A2UI define how agents connect to user-facing apps, open interactive app surfaces, and return structured UI.
- Product frameworks: CopilotKit, OpenAI Apps SDK, and Vercel AI SDK show generative UI becoming buildable in real frontend stacks.
- Salesforce POV: enterprise agent systems require interoperability, shared context, governance, security, and observability before they can scale beyond isolated assistants.

Visual: Three-layer evidence stack.
1. Research: Human interfaces -> agent interfaces; generative UI as interface layer.
2. Protocols: AG-UI, MCP Apps, A2UI.
3. Product frameworks: CopilotKit, OpenAI Apps SDK, Vercel AI SDK.

Speaker script:
"This is not only a product opinion. The stack is starting to form. Research is naming the shift from human interfaces to agent interfaces. New protocols are appearing: AG-UI for agent-user interaction, MCP Apps for interactive app surfaces, A2UI for declarative generated UI. Product frameworks are making it buildable: CopilotKit, OpenAI Apps SDK, Vercel AI SDK. Salesforce's CTO-level view adds the enterprise layer: agents need open interoperability, shared context, governance, security, and observability before they can scale. That means agentic UI is moving from demo language into engineering language."

Transition: "And if this becomes a stack, then products need to be designed as systems."

## Slide 33 - The Agentic System Stack

Title: The agentic system stack

Key opinion: Future AI products will be judged less by chatbot quality and more by context, tools, permissions, memory, state, and recovery.

Audience belief: Agentic software is a system design problem, not a prompt box.

Supporting evidence: Box headless software direction, Notion workspace agents, Salesforce Agentforce multi-agent enterprise view, MCP/tool ecosystem.

Visual: Layered stack: user intent, context/memory, tools/APIs/MCP, permissions/audit, generated UI/workspace, shared product state, fallback/recovery.

Speaker script:
"A real agentic system has layers. It needs user intent. It needs context and memory. It needs tools: APIs, MCP servers, product actions. It needs permissions: what can this agent read, write, delete, approve? It needs generated UI or workspace surfaces. It needs shared product state. And it needs recovery when the agent is wrong. A chatbot can be added at the edge, but context, tools, permissions, state, and recovery have to be designed into the product."

Speaker add-on:
"This matches the Salesforce enterprise point of view: scaling agents is blocked less by the model demo and more by foundations like interoperability, unified context, governance, security, and observability."

Transition: "Now we need to make this actionable."

## Slide 34 - Decision Tool

Title: Where does this feature live?

Key opinion: Choosing an AI UI pattern should be a product decision, not a trend decision.

Audience belief: They can choose L2-L6 by answering a few practical questions.

Supporting evidence: L2-L6 demos and trade-offs.

Visual: Decision tree:
1. Does the user know what to type?
2. Is the output one known UI shape or many possible shapes?
3. Does a better existing tool already exist?
4. Is the user actively editing state the agent needs to read or change?

Speaker script:
"If you walk into work on Monday and say 'I saw a cool talk about agentic UI,' nothing will happen. So here is the decision tool. Does the user know what to type? Is the output one known shape or many possible shapes? Does a better tool already exist? Is the user actively editing something the agent needs to understand or change? These questions are not perfect, but they are good enough to stop the default answer from being 'just add a chatbot.'"

Transition: "Now you are going to run one of your own features through this."

## Slide 35 - Solo Exercise

Title: Pick one real feature

Key opinion: The framework only matters when applied to an actual product decision.

Audience belief: They must choose a real feature, not discuss AI abstractly.

Supporting evidence: Their own product roadmap or current software.

Visual: Worksheet: "Feature ______ should be L__ because ______." Add solo 3-minute timer.

Speaker script:
"Pick one real feature in your product. Not your AI strategy. One feature: a report builder, a customer profile, an approval queue, a dashboard, a ticket screen, a configuration flow. Run it through the questions. Then write one sentence: Feature blank should be L blank because blank."

Transition: "Now make someone disagree with you."

## Slide 36 - Pair Exercise

Title: Make someone disagree with you

Key opinion: The value of the framework appears when people debate the level.

Audience belief: Disagreement exposes assumptions about intent, UI variety, and state.

Supporting evidence: Pair discussion.

Visual: Pair instructions: tell your neighbor your sentence. Neighbor asks: "Why not one level lower?" and "Why not one level higher?"

Speaker script:
"Tell your neighbor your sentence. Their job is not to be polite. Their job is to ask why not one level lower and why not one level higher. If you said L6, does the agent really need shared state? If you said L2, does the user really know what to type? Once you say the L-number out loud, people can disagree with it. That is progress."

Transition: "Let's hear two."

## Slide 37 - Public Harvest

Title: Two product bets

Key opinion: A useful AI strategy can start as one specific feature-level decision.

Audience belief: They can take this exact conversation back to work.

Supporting evidence: Audience examples.

Visual: Two empty slots: Feature, Level, Because.

Speaker script:
"I am going to pick, not ask for volunteers, because otherwise the same brave three people do all the work. What feature did you pick, what level did you choose, and why? This is the conversation I want you to have at work. Not 'should we add AI?' but 'this feature should be L3, L4, or L6 because of this user need.'"

Transition: "And that is the ask."

## Slide 38 - The Ask

Title: Monday morning. One sentence. Out loud.

Key opinion: The workshop succeeds only if the audience makes one structural product bet after leaving.

Audience belief: They know the action to take.

Supporting evidence: The whole workshop.

Visual: Dark callback to the claim slide. Large: "Chat is a feature. UI is the product." Below: "Feature X should be L__ because __." Add repo QR and LinkedIn QR.

Speaker script:
"At the start I said I would ask one thing of you when we were done. Here it is. Monday morning, walk into your standup, your product review, your design crit, or your team Slack. Say one sentence out loud: Feature X should be L-something because blank. Do not say 'we should use AI more.' Do not say 'we need to be more agentic.' Make the structural bet visible. Make someone disagree with you. That is how this stops being a slide deck and starts becoming a product decision. The repo is on screen. Fork it. Break it. Use it to challenge one old piece of software. Thank you."

Transition: Do not invite stage Q&A. Move questions to the hallway.

---

## Source Notes

- OpenAI, "Introducing ChatGPT", November 30, 2022.
- OpenAI, "ChatGPT plugins", March 23, 2023.
- OpenAI, "Introducing GPT-4o and more tools to ChatGPT free users", May 13, 2024.
- OpenAI, "Introducing canvas", October 3, 2024.
- TechCrunch, "Notion just turned its workspace into a hub for AI agents", May 13, 2026.
- Computerworld, "Box CEO embraces shift to 'headless' software in the agentic AI era", May 28, 2026.
- Salesforce Newsroom, "The Future of AI Agents: Top Predictions and Trends to Watch in 2026", including Muralidhar Krishnaprasad (MK), President & CTO, C360 Platform, Apps, Industries & Agentforce, on multi-agent interoperability, unified context, governance, security, and observability.
- Salesforce Newsroom, "Agentforce Sales: Agents Handle The Grind, Sellers Focus on the Win", March 16, 2026.
- Hugging Face community article summarizing Andrej Karpathy's Software 3.0 framing, June 19, 2025.
- arXiv, "From Human Interfaces to Agent Interfaces: Rethinking Software Design in the Age of AI-Native Systems", 2026.
- arXiv, "Macaron-A2UI: A Model for Generative UI in Personal Agents", 2026.
- arXiv, "Portal UX Agent - A Plug-and-Play Engine for Rendering UIs from Natural Language Specifications", 2025.
- IBM Research, "Empirical Evidence on Conversational Control of GUI in Semantic Automation", IUI 2024.
- ACL Anthology, "The Art of Tool Interface Design", REALM 2025.
- AG-UI official docs, "Agent User Interaction Protocol".
- CopilotKit docs, "Generative UI" and "A2UI".
- Google Developers Blog, "A2UI v0.9: The New Standard for Portable, Framework-Agnostic Generative UI".
- Model Context Protocol docs, "MCP Apps".
- OpenAI, "Introducing apps in ChatGPT and the new Apps SDK".
- Vercel, "Introducing AI SDK 3.0 with Generative UI support".
- Local workshop sources: `docs/workshop-talk-script.md`, `docs/lessons/L3.md`, `docs/lessons/L4.md`, `docs/lessons/L5.md`, `docs/superpowers/specs/2026-05-28-workshop-design.md`.
