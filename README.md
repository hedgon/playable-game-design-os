# Playable — a game design operating system for the AI era

A single self-contained HTML file that teaches how to think, decide, experiment
and collaborate with AI to make a game people actually want to play.

Open `playable.html` in any modern browser. No server, no build step, no network
access, no external libraries. Reference-game art lives in a small local
`assets/games/` folder beside the file; everything else is embedded. Everything
you type into the tools and every checkbox you tick is saved in your browser's
localStorage and never leaves your machine. Works on desktop, tablet and phone.

Navigation is three persistent panes: the **index** on the left (domains and topics,
named, counted, collapsible), the **mind map** in the centre (a horizontal tidy tree
that expands in place and is always visible), and the **content** panel on the right
(the topic, domain or tool you are reading). Panels are resized by dragging the
dividers and collapsed from the toolbar; on phones the index and content become
slide-over drawers. The ideation surface is the **Idea Lab** (`#/lab`). The
architecture, the ideation method and the AI collaboration model are written up in
`DESIGN-SECOND-BRAIN.md`.

Nineteen domains, 133 topics. Every topic carries a tab strip: **Overview** (the
practical eight-part argument), **Godot** and **Unity** (the engine-native term,
the nodes or APIs to reach for, a short real snippet, a pitfall and a mapping
between the two engines, where a client-side counterpart exists), and
**Interview** (six to ten junior/mid/senior questions with model answers, follow-ups
and red flags, plus a private "your story" note that stays in your browser). The
**Experience** view (`#/experience`) walks through three anonymised, shipped
projects the way an interview actually asks for them: architecture, decisions and
their trade-offs, what went wrong, and STAR interview stories, linked back into
the relevant topics.

## What is inside

| View | What it is for |
| --- | --- |
| **Idea Lab** | The ideation surface, and the first door. An idea is treated as a chain of reasoning, not a filled-in form. Five entry modes (I noticed something / I want players to feel something / I like a game but / I have a constraint / I do not know what to make) feed small artifacts: Signal, Tension, Opportunity, Design question, Design space, Mechanisms, Critique, Experiment. Each artifact carries an evidence level (observed / reported / inferred / hypothesized / simulated / validated), an example, and a stage-specific AI prompt. The chain compresses into an **Idea Card** (player, promise, mechanism, core verb, fantasy, constraints, hypothesis) that opens in the Idea Shaper. Works without AI. |
| **Map** | The always-visible mind map, drawn as a horizontal tidy tree: the goal in the middle, with the nineteen domains split into two balanced groups, one to its left and one to its right, and a domain's topics on the next layer while it is open. A selected topic grows another layer of smaller nodes: the concepts it relates to, the design smells it helps diagnose and the tools it points to. Nodes are labelled cards joined by smooth curves, so names never depend on hover. Faint dashed cross-branch links connect domains to each other, an open topic to a related concept's domain, and a leaf back to its home domain; hovering a node highlights its links. Click a domain to expand or collapse it in place, click a topic to read it in the right panel, click a leaf to travel. Drag a node to nudge its whole branch wherever you like (it persists in this browser); **drag** puts the nodes back in the tidy layout and **default** returns the map to the overview (branches collapsed, camera fit). Drag empty space to pan, wheel or pinch to zoom, **fit** to reset the camera. Every gesture works with mouse and touch. The tree stacks and pans as content grows instead of shrinking. Routes: `#/map/d/<domain>`, `#/map/t/<topic>`, `#/map/s/<smell>`, `#/map/home`. |
| **Explore** | A list view of the same 133 topics for people who prefer lists. Every link opens the topic on the map. Every topic has the same eight parts: What is it, Why it matters, How a human should think about it, How to actually do it, What AI should and should not do, How to prompt AI, How to verify AI output, What to playtest, behind an **Overview** tab. Most topics add a **Godot** and a **Unity** tab (the engine-native term, the APIs to reach for, a short snippet, a pitfall, a same-idea-different-name mapping) and every topic adds an **Interview** tab (junior/mid/senior questions with model answers and red flags, plus a private story note). Topics with a real implementation decision also carry a **Techniques to compare** section (how each technique works, when it fits, what it costs, what to watch out for). Related concepts always say *why* they connect. |
| **Experience** | Three anonymised, shipped projects (`#/experience`) told the way an interview actually asks for them: stack, architecture, five to eight decisions each with a trade-off, what went wrong and the lesson, three to five STAR interview stories, and related topics with a reason. The technique travels; the project, company, colleague and internal names never do. |
| **Diagnose** | Start from a symptom. 33 design smells (each with likely causes, an experiment per cause and a diagnostic prompt), the Fun Diagnostic (19 dimensions of fun), the Core Loop diagnostic (Action → Feedback → Decision → Consequence → New situation), the Unfairness diagnostic, the Depth-vs-Complexity rule audit, and the Content-or-Mechanic decision tree. |
| **Build** | Eleven working tools. **Reference Dissection** (is my idea actually good? Pick the games your player already plays from a library of fifteen dissected successes or add your own; each is taken apart with one template: want served, core verb, first 30 seconds, decision per minute, why it worked, what players complain about, what copies miss; then seven cross-reference questions produce a verdict: promising, derivative, unproven, undeliverable, or needs work, with the next test), **Idea Shaper** (for people who do not yet know what to make: read a market you already watch, find what players praise, complain about and work around, classify the gap as an exit reason, an unmet want, a tolerated cost or your own taste, name the structural reason incumbents have not closed it, then shape the one rule only your constraints allow; outputs a positioning sentence, a hypothesis, four observation tests, and prompts for complaint mining, a structural moat, five rules and a genericness audit), Game Loop Builder, Core Experience Canvas, Behavior Ladder (feature → behavior → system → mechanic → feature), Should We Build This? (nine questions → BUILD / PROTOTYPE FIRST / SIMPLIFY / DEFER / REMOVE), Playtest Hypothesis Builder, AI Delegation Planner, System Relationship Map, AI Prompt Generator, In-game AI Technique Chooser (decision shape + team + budget → primary technique, trade-offs, debug view). Each exports Markdown. |
| **AI Workflow** | The 12-step AI-era development loop (mark where your project is), the bottleneck-shift philosophy, nine AI roles with use / do-not-use conditions and starter prompts, the Human-vs-AI responsibility matrix, the prompting formula, and the catalogue "When AI makes your game worse" (14 failure modes with symptom, cause, detector, correction). |
| **Playtest** | The truth machine: say versus do versus context, the question bank, methods and what each is blind to, the session flow, and analysis prompts that keep AI out of the decision. |
| **Prompts** | 17 reusable prompt templates with fill-in variables, for example brainstorming, critique, systems, economy, progression, level design, UX audit, narrative, playtest analysis, balancing, scope reduction, prototype brief, implementation, refactor, postmortem and verification. |
| **Checklists** | Design review, silent onboarding audit, AI output verification, pre-prototype, playtest preparation, monthly scope sanity. State persists; export to Markdown. |
| **Search** | `Ctrl/⌘ K` or `/` searches topics, smells, prompts, tools, roles, failure modes, loop steps, fun dimensions and sources. |

Footer link **Sources and lineage** lists the frameworks synthesized and marks
each as research-backed, practitioner heuristic, practice, or contested.

## Look and feel

Deliberately not a generic web-app dashboard. The visual identity is a field
manual crossed with a technology tree: condensed display type for headings,
monospace micro-labels, a dot-grid ground, sharp corners with hard offset
shadows in the domain colour, dashed knowledge-graph edges, a charcoal dark
mode and a paper-and-ink light mode. It uses only system fonts (Bahnschrift or
Avenir Next Condensed where available, Cascadia or Consolas for mono), so it
renders identically offline.

On phones the index and the content panel become slide-over drawers opened from the
toolbar, with a tap-away scrim to close them; the mind map fills the width and pans and
pinches to zoom; every tool is single column.

## How to use it

The intended path when you have a real problem:

1. **Diagnose** → pick the smell you observe → read the likely causes.
2. Choose the cause you believe most → open its topic (linked) if you need depth.
3. **Build → Hypothesis Builder** → write *We believe [player] will [behavior] because [reason]; we will know when [signal]; we will kill it if [criterion]*.
4. Copy the prototype brief and observation protocol it generates; give them to your AI.
5. Run the smallest experiment with matched players. Observe; do not explain.
6. Paste notes into the **Playtest analysis** prompt (analysis only, no recommendations).
7. Decide: keep, change, simplify, kill. Log it. Mark the step in the **12-step loop**.

When you have a feature idea instead: **Build → Behavior Ladder**, then **Should We Build This?**

When you have no idea what to make: **Build → Idea Shaper**. Choose a market you
already watch and three to five shipped games to observe. Read what their players
praise, complain about and work around, then classify the gap as an exit reason, an
unmet want, a tolerated cost or your own taste. Name why no incumbent has closed it,
write the promise in the player words, and shape the single rule that keeps it and
that the incumbents cannot copy. Test it by observation, not by survey. Continue into
the Core Experience Canvas and the Hypothesis Builder.

## Keyboard

`Ctrl/⌘ K` or `/` search · `1`–`9` switch views · `[` `]` previous / next topic ·
`E` expand or collapse all sections · `M` fit the mind map · `T` theme · `?` help · `Esc` close.

## Do I need the build script?

No. `playable.html` is complete and self-contained; nothing in `src/` is needed to
use it, host it, or share it. You can delete `src/` and keep the one file.

`src/` exists only for maintenance. The guide is about 2.2 MB of content and code
in one file, so the source is split into readable parts: one data file per group of
domains, the map geometry, the app, and the map view. Editing a topic in a 60 KB
data file is easier than in a 2.2 MB HTML file. `build.js` concatenates the parts in
order (the file list lives in one place, `manifest.js`) and then runs `validate.js`
(every cross-link resolves, every topic has all eight parts), `check-layout.js`
(every map state is rendered and label overlaps are checked) and a syntax check, so
a typo in a topic id or an overlap in the map fails the build loudly instead of
producing a dead link or a collision. All scripts are plain Node with no
dependencies.

Two valid ways to edit:

- **Small tweak**: edit `playable.html` directly in any editor and reload.
- **Content work**: edit the files in `src/`, run `node src/build.js`, reload.

## Files

```
playable.html          the deliverable: open this
README.md              this file
DESIGN-AUDIT.md        what the guide covers, its mental models, tools, limitations
DESIGN-SECOND-BRAIN.md the second-brain architecture, ideation method and AI model
assets/games/          local reference-game art referenced by the reference library
src/                   optional: sources and maintenance scripts (see above)
  01-head.html         CSS and page shell
  10-data-domains.js   domains + Player, Experience, Core Gameplay topics
  11-data-topics-systems.js   Systems, Content, Level Design topics
  12-data-topics-ux.js        UX, Narrative, Presentation topics
  13-data-topics-product-ai.js Product, Production, AI Collaboration topics
  14-data-diagnostics.js      smells, fun dimensions, core-loop and unfairness diagnostics
  15-data-ai.js               roles, failure modes, matrix, loop steps, prompt templates, checklists, feature tree
  16-data-references.js reference library of dissected successful games + the "dissect games that succeeded" topic
  17-data-topics-gameai.js  In-game AI domain: NPC/enemy behaviour, perception, navigation, fairness, directors, ML, budgets
  18-data-tech.js      technique breakdowns for systems, content and core gameplay topics
  19-data-tech.js      technique breakdowns for presentation, UX, narrative and production topics
  20-data-tech.js      technique breakdowns for experience, level and remaining topics
  21-data-tech.js      technique breakdowns for the AI Collaboration topics
  22-data-practice.js  Studio domain: design documents, metrics, team, planning, QA
  23-data-practice.js  more Studio topics and Product's launch/live-ops/localization/ethics
  24-data-backend.js   Backend domain: 11 Go-first server-design topics + engine/interview
  25-data-infra.js     Infrastructure domain: 8 topics + engine/interview
  26-data-server.js    Game Server domain: 8 topics + engine/interview
  27-data-management.js Project Management domain: 8 topics + interview (no engine tabs)
  28-data-leadership.js Team Leadership domain: 8 topics + interview (no engine tabs)
  29-data-experience.js three anonymised case studies behind the Experience view
  30-data-engine-a.js  Godot/Unity tabs for player, experience, core, systems, content
  31-data-engine-b.js  Godot/Unity tabs for level, ux, narrative, presentation, product
  32-data-engine-c.js  Godot/Unity tabs for production, ai, gameai, studio
  40-data-interview-a.js Interview tabs for player, experience, core, systems, content, level
  41-data-interview-b.js Interview tabs for ux, narrative, presentation, product
  42-data-interview-c.js Interview tabs for production, ai, gameai, studio
  89-graph.js          horizontal tidy-tree mind-map layout (the centre map)
  90-app.js            router, views, tools, search
  91-map.js            persistent mind map: tree render, pan/zoom/pinch, reading panels
  92-ideas.js          Reference Dissection tool
  93-lab.js            Idea Lab: entry modes, reasoning chain, Idea Card
  99-tail.js           boot
  manifest.js          ordered list of source files (single place to add/rename one)
  build.js             concatenates sources, validates data, layout and syntax
  layout-core.js       reusable map overlap checker (no dependencies)
  check-layout.js      runs layout-core over every map state; fails on any overlap
  validate.js          node script: every cross-link resolves, every topic complete
  research-notes.md    verified sources behind the synthesis
  serve.js             optional local static server for previewing (not needed to use the guide)
```

To rebuild after editing a source file:

```bash
node src/build.js
```

## Adding content

Add a topic with `T('topic-id', {...})` in the data file for its domain. Required
fields: `d, t, tag, what, why, think{q,trade,traps,good,bad}, how, ai{yes,no},
prompts[{l,p}], verify, test, rel[[id,why]]`. Optional `tech[{n,how,fit,cost,alt}]`
adds a "Techniques to compare" section. Add a smell to `SMELLS` with
`causes[{c, top, exp}]` where `top` is a topic id. The validator fails on any
unresolved link or missing section, so it is safe to refactor.

Add the Godot/Unity tab to an existing topic with `ENGINE('topic-id', {godot:{...},
unity:{...}, note:''})` in a data file loaded after the topic is defined. Each engine
needs `term, api[], snippet, pitfall, map`; `snippet` is real code (GDScript or C#),
15 lines or fewer and 900 characters or fewer, showing the actual API named in
`api[]`. `note` is optional and explains why this is the client-side counterpart on
topics outside the fourteen design domains. A topic in the `management` or
`leadership` domain must not carry `eng` at all, since there is no client
counterpart to review it against.

Add the Interview tab with `INTERVIEW('topic-id', {junior:[...], mid:[...],
senior:[...]})`, six to ten questions total across the three levels (at least one
per level), each entry `{q, a, follow, red}`: the question, a model-answer outline,
an expected follow-up, and a concrete red-flag answer. The reader's own answer never
lives in this data; the app saves it to `localStorage` under `story.<topicId>`.

Add a case study to the Experience view with `CASE({id, t, role, period, stack[],
context, arch[], decisions[{d,why,trade}], lessons[{what,lesson}],
stories[{s,t,a,r}], rel[[topic-id, why]]})` in `29-data-experience.js`. Every field
is required and non-empty, every `rel` id must resolve to a real topic, and every
string is checked for company, product, colleague, host and credential names before
it ships (the guide's own rule is "the technique travels, the names do not").

`node src/validate.js` enforces all of the above: every topic outside `management`/
`leadership` needs `eng`, every topic needs `iv`, and every field-level shape check
above fails the build loudly. While content for a new domain is still being written,
run `PLAYABLE_STRICT=0 node src/validate.js` (or pass `--lenient`) to downgrade a
missing `eng` or `iv` from a build-breaking error to a printed warning count, so the
rest of the data can still be checked; shape errors in whatever `eng`/`iv` content
*is* present are never downgraded, in either mode.

## Principles the guide embodies

- AI generates possibilities cheaply; humans decide what is worth making.
- A polished bad idea is still a bad game.
- Content multiplies a good system; it does not rescue a bad one.
- What players say is useful; what players do is evidence; neither means anything without context.
- Every significant decision is a hypothesis with an observable signal and a kill criterion.
- Everything here is a heuristic, not a law. Test it against your players.
