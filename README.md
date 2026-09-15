# Playable — a game design operating system for the AI era

A single self-contained HTML file that teaches how to think, decide, experiment
and collaborate with AI to make a game people actually want to play.

Open `playable.html` in any modern browser. No server, no build step, no network
access, no external libraries. Reference-game art lives in a small local
`assets/games/` folder beside the file; everything else is embedded. Everything
you type into the tools and every checkbox you tick is saved in your browser's
localStorage and never leaves your machine. Works on desktop, tablet and phone.

The first door is **Learning paths** (`#/paths`). Twelve paths across four tracks
(design, engineering, leadership, interview prep) walk a reader from beginner to
expert through the guide's existing topics, tools, checklists, smells,
diagnostics, project parts, workflow charts and prompts, in order, with a reason
for each stop and a concrete exercise. A path never duplicates content; it
sequences it. Every stage ends in a soft checkpoint (a few recall questions and
one build task) instead of a hard gate, and "I already know this" lets a reader
skip a stage on their own judgement. A slim path bar on every route names the
current stage and the one visible next step, with a button to jump straight to
it. Progress (which steps are ticked, which stages are done or skipped) lives in
`localStorage`, one path at a time; there are no streaks and no badges. A
first-time visitor with nothing in `localStorage` yet lands on the door instead
of the map; everyone else lands where they left off.

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
the relevant topics. Each project is named by codename rather than by its real
name: `Project S · Backend` and `Project S · Client and CI` share a codename
because they are two repos of one product, and `Project P · Port` is the third.
The old descriptive title still shows as a subtitle under the codename. Open a
project (`#/experience/<project>`) and it becomes a tab strip: **Overview** (the
project mind map, its systems and the parts inside each, at routes
`#/experience/<project>/<system>/<part>`), **Workflows** (two to four charts of
how the project behaves end to end, for example the life of a request or a push
to production, each its own route `#/experience/<project>/flow/<id>`), and
**Interview** (ten to twelve project-level questions, the "walk me through the
architecture" kind, plus the private story note). A system's own page adds a
"Likely questions" section of three deep-dive questions. A selected part grows
leaves for the guide topics it demonstrates, which travel to that topic on the
domain map, and every topic a project touches gains a "Seen in practice" chip
that leads straight back to the part.

## What is inside

| View | What it is for |
| --- | --- |
| **Paths** | The door. Twelve guided sequences across four tracks (design, engineering, leadership, interview prep), each 4 to 6 stages of existing topics, tools, checklists, smells, diagnostics, project parts, flows and prompts, with a soft checkpoint per stage, a skip-ahead self-check, and a path bar showing the one visible next step. Progress is steps done and stages done, kept in `localStorage`; no streaks. |
| **Idea Lab** | The ideation surface, and the first door. An idea is treated as a chain of reasoning, not a filled-in form. Five entry modes (I noticed something / I want players to feel something / I like a game but / I have a constraint / I do not know what to make) feed small artifacts: Signal, Tension, Opportunity, Design question, Design space, Mechanisms, Critique, Experiment. Each artifact carries an evidence level (observed / reported / inferred / hypothesized / simulated / validated), an example, and a stage-specific AI prompt. The chain compresses into an **Idea Card** (player, promise, mechanism, core verb, fantasy, constraints, hypothesis) that opens in the Idea Shaper. Works without AI. |
| **Map** | The always-visible mind map, drawn as a horizontal tidy tree: the goal in the middle, with the nineteen domains split into two balanced groups, one to its left and one to its right, and a domain's topics on the next layer while it is open. A selected topic grows another layer of smaller nodes: the concepts it relates to, the design smells it helps diagnose and the tools it points to. Nodes are labelled cards joined by smooth curves, so names never depend on hover. Faint dashed cross-branch links connect domains to each other, an open topic to a related concept's domain, and a leaf back to its home domain; hovering a node highlights its links. Click a domain to expand or collapse it in place, click a topic to read it in the right panel, click a leaf to travel. Drag a node to nudge its whole branch wherever you like (it persists in this browser); **drag** puts the nodes back in the tidy layout and **default** returns the map to the overview (branches collapsed, camera fit). Drag empty space to pan, wheel or pinch to zoom, **fit** to reset the camera. Every gesture works with mouse and touch. The tree stacks and pans as content grows instead of shrinking. Routes: `#/map/d/<domain>`, `#/map/t/<topic>`, `#/map/s/<smell>`, `#/map/home`. |
| **Explore** | A list view of the same 133 topics for people who prefer lists. Every link opens the topic on the map. Every topic has the same eight parts: What is it, Why it matters, How a human should think about it, How to actually do it, What AI should and should not do, How to prompt AI, How to verify AI output, What to playtest, behind an **Overview** tab. Most topics add a **Godot** and a **Unity** tab (the engine-native term, the APIs to reach for, a short snippet, a pitfall, a same-idea-different-name mapping) and every topic adds an **Interview** tab (junior/mid/senior questions with model answers and red flags, plus a private story note). Topics with a real implementation decision also carry a **Techniques to compare** section (how each technique works, when it fits, what it costs, what to watch out for). Related concepts always say *why* they connect. |
| **Experience** | Three anonymised, shipped projects (`#/experience`) told the way an interview actually asks for them: stack, architecture, five to eight decisions each with a trade-off, what went wrong and the lesson, three to five STAR interview stories, and related topics with a reason. Each is named by codename, with the old descriptive title kept as a subtitle; two projects share a codename because they are two repos of one product. Open one for a tab strip: **Overview** (its systems and parts, six to eight systems and two to five parts each, become a project mind map on the same centre stage the domain map uses, at routes `#/experience/<project>/<system>/<part>`, and a system's page adds three "Likely questions"), **Workflows** (two to four charts of the project end to end, for example the life of a request or a push to production, each at its own route `#/experience/<project>/flow/<id>`), and **Interview** (ten to twelve project-level questions with the same q/a/follow/red shape and a private story note). A part's leaves travel to the guide topics it demonstrates, and every topic those parts touch gains a "Seen in practice" chip back into the project. The technique travels; the project, company, colleague and internal names never do. |
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

`Ctrl/⌘ K` or `/` search · `1`–`9` switch views (Paths, Idea Lab, Map, Explore,
Diagnose, Build, AI Workflow, Playtest, Prompts) · `[` `]` previous / next topic ·
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
  33-data-experience-systems-a.js  project systems and parts for the Go backend project
  34-data-experience-systems-b.js  project systems and parts for the Unity client + CI project
  35-data-experience-systems-c.js  project systems and parts for the Unity multiplatform port
  40-data-interview-a.js Interview tabs for player, experience, core, systems, content, level
  41-data-interview-b.js Interview tabs for ux, narrative, presentation, product
  42-data-interview-c.js Interview tabs for production, ai, gameai, studio
  50-data-paths-a.js   learning paths: PATH/PATHS/TRACKS/LEVELS, stepTitle/stepHref, design paths
  51-data-paths-b.js   learning paths, continued: engineering-track paths
  88-flow.js           workflow chart renderer: layered layout for the Workflows tab and flow routes
  89-graph.js          horizontal tidy-tree mind-map layout (the centre map, the project map, the path map)
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
  inventory.js         node script: every id a learning-path step can reference, printed by kind
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

Add a case study to the Experience view with `CASE({id, t, code, sub, role, period,
stack[], context, arch[], decisions[{d,why,trade}], lessons[{what,lesson}],
stories[{s,t,a,r}], rel[[topic-id, why]]})` in `29-data-experience.js`. `t` and
`code` are both the project codename (for example `Project S · Backend`). `code`
exists so search and chips can name the codename explicitly even where `t` gets
reused for something else. `sub` is the old descriptive title and shows under the
codename on cards and on the project page. Two cases may share a codename when they
are two repos of one product, distinguished by the text after the middle dot. Every
field is required and non-empty, every `rel` id must resolve to a real topic, and
every string is checked for company, product, colleague, host and credential names
before it ships (the guide's own rule is "the technique travels, the names do not").

Turn that case into a browsable project with `SYSTEMS('case-id', [{id, t, kind, sum,
stack[], iv[{q,a,follow,red}], parts[{id, t, what, how[], why, trade,
rel[[topic-id, why]], links, story}]}])`, in its own file alongside the case (files
33-35 hold the three existing projects). `kind` is one of `client, server, backend,
data, infra, cicd, tooling, process`, and picks the colour the system's node gets
on the project map. `iv` is exactly three "likely questions" shown on the system's
page, same `{q,a,follow,red}` shape as a topic's interview. A project needs 6 to 8
systems and each system 2 to 5 parts. A system's `id` may not be `workflows`,
`interview`, `flow` or `overview`: those four are route words under
`#/experience/<project>/...` and a system claiming one would shadow that page. A
part's `id` must be prefixed by its system's `id` (`api-routing` under system `api`)
and unique across the whole project. `what` is 2 to 4 sentences, `how` is 3 to 6
bullets, `why` and `trade` are 1 to 3 sentences each, `rel` names at least one real
topic id with a reason, and the optional `links` point at other part ids in the same
project, also with a reason (a part cannot link to itself). `story` is optional,
first person, and meant as a draft the reader rewrites in their own words. The
validator checks all of this, plus that every `rel` and `links` id actually
resolves. A case with no `systems` at all is only a warning under
`PLAYABLE_STRICT=0`, but any shape error in systems that are present fails the
build in both modes.

Give a project its workflow charts with `FLOWS('case-id', [{id, t, sum,
steps[{id, t, d, sys}], edges[[from, to, label]]}])`. Two to four flows per
project, four to nine steps each. `sys` on a step is optional and, when present,
must be a system id of the same project. It colours the step's card and dot to
match that system. `edges` form a directed acyclic graph: branches are fine (a
step can have two outgoing edges, for example a pass and a fail path), but no
edge may point backwards or at its own step, and every step must be reachable
from `steps[0]`, since that is where the layered layout starts counting columns.
An edge label is optional and, when present, should stay at 12 characters or
fewer: the renderer draws it as a small tag at the edge's midpoint and a long
label crowds the chart. The validator checks the DAG property, reachability, and
that every `sys` resolves.

Give a project its project-level interview with `PROJECT_INTERVIEW('case-id',
{junior[{q,a,follow,red}], mid[...], senior[...]})`. Ten to twelve questions in
total, at least two at every level. These are the "walk me through the
architecture" questions a CV invites, one register up from a system's three
likely questions, and the answer outlines have to stay consistent with the
systems and parts already written for that project.

Add a learning path with `PATH('path-id', {...})` in `src/50-data-paths-a.js` or
`51-data-paths-b.js`. A path sequences existing topics, tools, checklists, smells,
diagnostics, project parts, workflow charts and prompts; it never duplicates their
content. Run `node src/inventory.js` first to see every id a step can reference,
grouped by kind. The shape (`t, tag, track, level, hours, audience, outcome,
prereq, next, stages[{id, t, level, goal, hours, steps[{kind, ref, tab, why, do, min}],
review, check{recall, build, skip}}]`) and its rules (4-6 stages, 3-8 steps per
stage, one tool or checklist step per stage, a checkpoint on every stage, levels
non-decreasing) are documented in the header comment of `50-data-paths-a.js` and
enforced by `node src/validate.js`. A `topic` step's optional `tab` must resolve
on that topic: `godot` or `unity` requires the topic's `eng.godot` / `eng.unity`,
and `interview` requires the topic's `iv`; the validator fails the build if a
step names a tab the topic does not carry.

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
