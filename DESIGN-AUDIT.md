# Design audit — Playable

Inspected as a senior game designer would, against the brief's final quality test.

Sections are dated by what they describe. "What the guide covers" and
"Assumptions and limitations" describe the guide as it is now; the verification
records further down describe the checks run when each piece landed, under the
names used then (the Experience view is called Projects since September 2026).

## What the guide covers

Twenty domains, 146 topics, all with the same eight-part practical structure
(topics with a real implementation decision add a ninth, "Techniques to compare").
The original fourteen design domains carry a Godot and a Unity tab (how a client
built in that engine reaches for the same idea) and an Interview tab (junior / mid
/ senior questions with model answers). Five more domains (Backend, Infrastructure,
Game Server, Project Management, Team Leadership) extend the guide from design into
the engineering and people practice around a live game; the first three also carry
engine tabs (framed as "how the client consumes this"), and the last two carry only
an Interview tab, since there is no client-side counterpart to a project-management
decision. A sixth, Platforms and publishing, covers choosing a platform, access,
requirements, certification, ratings, the store page, release and UGC platforms, with engine tabs
only where the engine changes the answer. The map shows the domains through two
lenses: Design (the first fourteen) and Engineering & Career (the last six).

| Domain | Topics |
| --- | --- |
| Player | who is the player, motivation (SDT), fantasy and desire, why players return or quit |
| Experience | core experience, fun as dimensions, goals at three horizons, tension and release, mastery / discovery / expression, social experience, experience thinking vs feature thinking, design pillars and creative direction |
| Core Gameplay | the core loop, meaningful decisions, risk and reward, agency and emergence, challenge / failure / recovery, skill acquisition |
| Systems | mechanics and rules, depth vs complexity, systemic design, economy and resources, progression, difficulty and calibration, builds and loadouts |
| Content | content multiplies systems, encounters and enemies, items / weapons / abilities, quests and events, procedural and AI-generated content |
| Level Design | level structure (teach, test, twist, combine, master, rest), pacing (intensity and cognition), spatial composition, encounter design |
| UX / UI | UX as design, readability and cognitive load, feedback and affordance, onboarding, controls and friction, accessibility |
| Narrative | premise and world, ludonarrative alignment, environmental storytelling, narrative agency, narrative pacing and integration |
| Art / Audio / Feel | visual language, game feel and juice, audio and music, animation / VFX / camera |
| Product | audience and positioning, platform and session, business model, scope control, launch and discoverability, post-launch and live operations, localization and culturalization, ethics and responsibility |
| Studio | design documents and communication, metrics / telemetry and success criteria, team / roles and collaboration, planning / milestones and schedule, quality assurance and build health |
| Production | prototyping, hypothesis-driven design, playtesting, iteration on evidence, vertical slice and MVP, risk and dependencies, when to polish |
| AI Collaboration | the bottleneck shift, AI roles, prompting framework, verifying AI output, AI failure modes, responsibility matrix, AI for prototyping and implementation, agents that build (tasks, checks and reviewed diffs), evals for AI in the pipeline, generative assets (pipeline, provenance and rights), disclosure, IP and platform rules, AI for playtest analysis, the 12-step loop |
| In-game AI | what in-game AI is for (and when to fake or script it), choosing a behaviour technique (FSM, behaviour tree, utility AI, GOAP/HTN), perception and memory, navigation and pathfinding, readable and fair AI, adaptive AI and directors, allies and companions, learning-based/ML AI, generative characters (language models inside the game), budgets and debugging, scripted vs simulated |
| Backend (Go-first) | clean layering and dependency direction, compile-time DI and one binary/many modes, API protocol choices (REST/JSON, protobuf over HTTP, gRPC), request context/middleware/idempotency, domain error taxonomy, transactions/query layers/delta state sync, caching tiers and Redis patterns, schema migrations/config/secrets, logging/tracing/profiling/action logs, testing tiers and test integrity, Go concurrency/lifecycle/generics/module hygiene |
| Infrastructure | containers and compose-based dev environments, deploy models (processes on VMs, Kubernetes, serverless, cron), CI pipeline stages and graded failure, artifacts/versioning/provenance, secrets management, CDN and asset delivery, managed data stores/replicas/sharding/queues, monitoring/alerting/incidents/cost |
| Game Server | authority models (server-authoritative, host mode, client-simulate-server-verify), deterministic simulation and parity testing, state sync (delta sync, interpolation vs prediction, tick rates), realtime protocols (WebSocket framing, op codes, channels), matchmaking/rooms/sessions/reconnection, scaling (sharding, pub/sub fan-out), anti-cheat and abuse handling, live operations (maintenance gates, force update, batches, master data) |
| Project Management | scoping and the cut list, estimation under uncertainty, risk registers and de-risking order, sprints/kanban for content-heavy teams, cross-discipline handoffs, QA planning and release trains, live-ops cadence and release calendars, post-mortems and retrospectives |
| Team Leadership | what a lead actually does, 1:1s/feedback/growth, code review culture and merge discipline, written conventions and decision records, onboarding and knowledge transfer, hiring loops, incident handling and blameless learning, saying no and prioritisation |
| Platforms and publishing | choosing a platform, access (programmes, NDAs, dev kits), platform requirements, certification and store review, ratings and disclosures, store pages and revenue share, release and updates, UGC platforms (Roblox and Fortnite) |

Plus: 33 design smells with 120 cause → experiment pairs, 19 fun dimensions, a
core-loop diagnostic, an unfairness diagnostic, a rule audit, a content-or-mechanic
decision tree, 9 AI roles, 14 AI failure modes, a 20-row responsibility matrix,
17 prompt templates, 9 checklists, 11 tools, ten store and console guides, two UGC platform guides (Roblox, Fortnite), and a sources page. Topics whose
advice depends on rules that change (store policy, law, court rulings) carry
dated facts: 55 facts on 14 topics and 93 in the platform guides, each with the
day it was checked and its source, and the validator warns once one is a year old.
Twenty-seven topics open with a diagram drawn from data (loops, stacks,
matrices, 2×2s, curves and beat charts, economies, state machines, flows), each
repeated as text; the fifteen reference games each have a loop schematic, six
have an annotated screen layout, and the content-or-mechanic tree is drawn whole.

The Studio domain carries the practice layer that surrounds a design: design documents
and communication, metrics and success criteria, team and ownership, planning and
milestones, and quality assurance and build health. Product gained launch and
discoverability, post-launch and live operations, localization and culturalization, and
ethics and responsibility, and Experience gained design pillars and creative direction.
These are written as guide material, genre-neutral and tool-independent, not as
role-specific advice.

## Mental models it uses

1. **Two chains.** Player → Desire → Fantasy → Core experience → Loop → Mechanics →
   Decisions → Challenge → Feedback → Progression → Motivation → Content → UX →
   Retention (read backwards to diagnose), and Human judgment → AI assistance →
   Prototype → Playtest → Evidence → Revision → Repeat.
2. **The bottleneck shift.** Production is cheap; taste, framing, prioritization,
   understanding players, recognizing fun, tradeoffs and knowing what not to build
   are the constraint.
3. **The core loop as five links** (action, feedback, decision, consequence, new
   situation), each with characteristic failure symptoms.
4. **Fun as dimensions**, not a magic quality; symptoms map to dimensions that went flat.
5. **Depth vs complexity**: buy decisions, not rules.
6. **Experience thinking**: behavior → experience → system → mechanic → feature,
   never feature → implementation → justification.
7. **Hypothesis-driven design**: every decision as *we believe [player] will
   [behavior] because [reason]; we will know when [signal]; we will kill it if [criterion]*.
8. **Content multiplies systems**; it does not rescue them.
9. **Polish amplifies validated feedback**; it does not create meaning.
10. **Say / do / context**: self-report is useful, behavior is evidence, neither is
    interpretable without the human context AI lacks.
11. **Scope follows validated value**: idea → prototype → evidence → commit.

These draw on MDA and LeBlanc, Lazzaro, Self-Determination Theory, Koster,
Meier, Schell, Swink and Vlambeer, Nintendo's kishōtenketsu, Hocking, Compton,
Hodent and Norman, Ambinder and Lemarchand, Dan Cook, Sylvester, Lean UX, and
recent postmortems. The Sources page marks each as research-backed, heuristic,
practice or contested. Attributions were checked (see `src/research-notes.md`);
two commonly misquoted maxims ("30 seconds of fun", "easy to learn, hard to
master") are presented with their original intent.

## How AI collaboration is integrated

- It is a first-class domain with nine topics, not a footnote.
- **Every one of the 90 topics** has an "AI is good at / AI should not decide"
  split, at least one concrete prompt with real context slots (never "design a fun
  X"), topic-specific verification questions plus the nine universal ones, and
  playtest questions. So every topic answers "how do I work with AI on this" and
  "when should AI not decide this".
- Nine **roles** with explicit do-not-use conditions; the sequence brainstormer →
  critic → systems designer → human decides → prototype engineer → players →
  analyst → human interprets → devil's advocate → content generator (after validation).
- The **12-step loop** puts players (steps 6–8) between exploration (3–4) and
  commitment (9–10), with human and AI roles, output and exit criterion per step.
- The **responsibility matrix** and **Delegation Planner** make ownership explicit
  before work starts and flag cycles where nothing needs player evidence.
- **Fourteen failure modes** with detectors that can be run weekly (feature count vs
  playtest count; when did a player last touch the build).
- The **Prompt Generator** enforces the eight-term formula and warns when INTENT or
  EVIDENCE are blank, since those are the two omissions that let the AI decide for you.

## Engine translation, interview preparation and experience

Every topic page carries a tab strip: **Overview | Godot | Unity | Interview**.
Overview is the original eight-part page, unchanged. Godot and Unity name the
engine-native term, the nodes or components to reach for, a short real snippet
(GDScript or C#, at most 15 lines), an engine-specific pitfall, and a one-line
"same idea, different name" mapping back to the other engine; a topic without an
engine counterpart (Project Management, Team Leadership) simply has no Godot or
Unity tab, so nothing renders blank. Interview holds six to ten questions grouped
junior / mid / senior, each with a model-answer outline, an expected follow-up
question, and a red-flag answer, plus a **your story** textarea that is never part
of the shipped data: it saves to `localStorage` under `story.<topicId>` so a
designer can draft their own interview answer against the model one without that
text ever being embedded in the file. Tabs are deep-linkable
(`#/map/t/<id>/<tab>`, `overview` omitted from the URL) and the last tab used is
remembered per browser.

The **Projects** view (`#/experience`) turns three real, shipped projects into
the shape an interview actually asks for: context, architecture, five to eight
decisions each with a trade-off, what went wrong and the lesson, three to five STAR
interview stories, and links back into the relevant topics with a reason. Each
project is named by codename rather than by its real identity: `Project S ·
Backend`, `Project S · Client and CI` (two repos of one product, told apart by the
text after the middle dot), and `Project P · Port`. The old descriptive title
becomes a `sub` line shown under the codename everywhere the codename appears
(cards, the project head, chips). The anonymisation rule that produced all of it is
strict and one-directional: **the technique travels, the names do not.** A project,
company, teammate, internal hostname, database or schema name, or business figure
never appears; a public library or vendor name (Go, protobuf, gorilla/mux,
google/wire, Redis, Unity, Addressables, UniTask, Jenkins, Fusion) is fine, because
naming a tool is not the same as naming who used it or on what.

Opening a project (`#/experience/<project>`) shows a tab strip, **Overview |
Workflows | Interview**, built from the exact same component the topic tab strip
uses, down to the class name and the keyboard handler, so there is one tab
behaviour in the app rather than two. Overview turns the project into a second
kind of mind map on the same centre stage the domain map uses: the project in the
middle, its 6 to 8 systems where domains sit, and a system's 2 to 5 parts where
topics sit while it is open. The two maps share `PlayableGraph`'s layout, patching
and camera code (`build` for the domain map, `buildProject` for a project) so the
gestures, the drag-to-nudge, the fit and the reset controls are identical, and they
share node kinds (`center|domain|topic|leaf`) so the CSS never forks. Project nodes
are told apart only by `data-scope="project"` and by `sys:<id>` / `part:<id>` keys.
Selecting a part grows leaves for the guide topics its `rel` names, coloured by
that topic's home domain, which travel to `#/map/t/<id>` on the domain map. A
part's `links` to other parts of the same project draw as the same dashed cross
edges the domain map uses between related concepts. A system's own page adds a
"Likely questions" section, three deep-dive questions in the same `{q,a,follow,red}`
shape a topic's interview uses. The two maps' state is kept in two separate places
by design: `mapState` for the domain map (`dom`, `topic`, `smell`, node offsets,
camera) is untouched by a visit to a project, and each project keeps its own
`projMap.<id>` (open system, selected part, offsets, camera), so leaving a project
and coming back to the domain map restores it exactly as it was left. The bridge
back the other way is a reverse index built once from every project's parts
(`PlayableGraph.practiceLinks`): it maps a guide topic to every part that
demonstrates it, which feeds the "Seen in practice" chips on a topic page and,
capped at two per topic so `check-layout.js` stays green, a `◆` view leaf on that
topic's fourth layer that also travels straight to the part.

The **Workflows** tab lists the project's two to four flows as cards (title,
summary, step count). Each opens its own route, `#/experience/<project>/flow/<id>`,
with the chart, a numbered step list underneath (title plus one sentence per step),
and links to the systems it touches. A flow is data, steps and a DAG of edges with
some carrying a short branch label, and one renderer, `src/88-flow.js`, draws all
of them: a layered layout puts each step in the column of its longest path from
the first step, so the chart reads left to right (or top to bottom on a narrow
pane) in the order the work actually happens, with the same card, curve and colour
language the mind map already uses. `check-layout.js` renders every flow as an
AABB check on its cards (no overlaps) the same way it checks the mind map's
labels. The rail's project tree grows a "Workflows" branch beside the systems,
listing the flows the way a system lists its parts, open whenever the Workflows
tab or a flow route is active and highlighting the current flow. The **Interview**
tab is a project-level interview, ten to twelve questions across junior/mid/senior
answering the "walk me through the architecture" register rather than a system's
deep dive, with the same private story textarea pattern, keyed `story.<project-id>`
instead of `story.<topic-id>` so a project's draft answer never collides with a
topic's.

## Learning paths

The guide's map is complete but undirected: a reader who does not already know
what they need has 146 topics, 33 smells, eleven tools and three projects with no
order to move through them in. A bigger map does not fix that; more nodes is more
of the same problem. What a beginner-to-expert reader needs instead is a
**sequence** through content that already exists, with a reason for each stop, a
concrete exercise, and a way to tell whether they are ready for the next one. That
is what a path is, and why it is additive rather than a rewrite: `PATH()` in
`src/50-paths.js` and `51-paths-engineering.js` never authors new content, it
only orders `ref`s into existing topics, tools, checklists, smells, diagnostics,
project parts, flows and prompts, so the 146-topic map, the projects
and the tool suite stay the single source of truth.

Thirteen paths across five tracks (design, engineering, production, leadership,
interview prep) were shaped against the research behind the plan rather than
against a generic "course" template:

- **Soft mastery gates.** A stage ends in a checkpoint, not a test: two to four
  recall questions and one build task, both ungraded. Each recall question has a
  short answer outline, shown only when the reader opens it, so they answer first
  and compare after; any of them can go into the Review queue. Nothing blocks a
  reader from opening the next stage regardless of the checkpoint; the checkpoint
  is a prompt to self-assess, not a lock. The path bar never marks a stage done:
  at a checkpoint it opens the checkpoint, and a stage done or skipped can be
  undone.
- **Choosing and ordering.** A three-question chooser on the door suggests a path
  for every combination of answers (the validator checks all of them), and every
  prerequisite points forward to the path that needs it (also validated).
- **Cognitive load.** No stage runs more than four consecutive `topic` steps from
  one domain (the validator enforces this as an interleave rule), so a stage mixes
  reading with a tool, a checklist, or a project part rather than piling up
  passive reading.
- **Worked examples fading to open problems.** Early stages point at a project
  part ("see how a shipped team did this") before asking the reader to do the
  equivalent themselves; later stages in the same path drop the worked example and
  ask for the artefact directly.
- **Retrieval and spacing.** Every stage after the first names 0 to 2 topics from
  an *earlier* stage under `review`, surfaced as chips on the stage footer, so a
  concept comes back once before the path assumes it is retained.
- **Dreyfus levels.** A path's `level` is its entry level, and every stage carries
  its own `level`, non-decreasing across the path (the validator checks this): a
  path can start a reader at intermediate and end at advanced, but never regress
  them to beginner content after they have passed advanced material.
- **Competence-based progress, no streaks.** Progress is "N of M steps done" and
  "N of M stages done", nothing else. No day-count, no badge, no guilt copy for a
  missed day. `path.<id>` in `localStorage` only ever records what is done,
  skipped, or not yet reached.
- **A first-visit door.** A reader with nothing in `localStorage` yet (checked via
  a single `visited` flag) lands on `#/paths` instead of `#/map`; every later
  visit, including an empty hash, behaves exactly as before paths existed.
- **One visible next step.** The path bar rendered on every route while a path is
  active names the current stage and the next step by title, with a single button
  to jump to it, so the reader is never asked to hold a plan in their head.

`I already know this` is the escape hatch competence-based progress requires: a
stage's footer also carries three to five self-diagnostic questions behind a
`<details>`, and answering yes to all of them marks the stage `skipped` rather
than `done`, tracked identically for progress purposes but visible as a distinct
tick style so a reader can tell later which stages they actually did.

| Path | Track | Entry level | Stages | Steps | Hours |
| --- | --- | --- | --- | --- | --- |
| Game designer foundations | Design | Beginner | 4 | 22 | 8 |
| Idea to prototype in 30 days | Design | Beginner | 4 | 18 | 10 |
| Systems designer | Design | Intermediate | 5 | 26 | 10 |
| Level and UX designer | Design | Intermediate | 5 | 24 | 10 |
| Interview prep: designer | Interview prep | Intermediate | 5 | 24 | 10 |
| Technical lead | Leadership | Advanced | 5 | 27 | 10 |
| Gameplay engineer, Godot | Engineering | Beginner | 5 | 27 | 12 |
| Gameplay engineer, Unity | Engineering | Beginner | 5 | 29 | 13 |
| Build and release engineer | Engineering | Intermediate | 5 | 26 | 12 |
| Live-game backend engineer | Engineering | Intermediate | 5 | 32 | 14 |
| Netcode / game-server engineer | Engineering | Advanced | 5 | 28 | 14 |
| Interview prep, engineering | Interview prep | Intermediate | 4 | 20 | 8 |

**Verification (this QA pass, 2026-09-15).** `node src/build.js` strict: 12
paths, 57 stages, 303 steps, 351 layout states checked, 0 overlaps. The validator
rule that a `topic` step's `tab` must resolve against that topic's `eng`/`iv`
(added for this pass) found zero violations across all 303 steps. A page script
walked every one of the 303 steps, computed its `stepHref`, navigated to it, and
asserted the rendered asset (title, active tab, or active Diagnose tab) matched
what the step names: 0 failures across topic (143), tool (37), checklist (30),
smell (14), diagnostic (4), part (40), flow (8), prompt (2) and reflect (25)
steps. Progress persistence (tick, "mark done and continue", "mark stage done",
skip, leave path), the first-visit door, path map mode, search, the keyboard
view order, and mobile layout (no horizontal overflow, a 2-line path bar, a
tap-toggled checkbox) were all exercised directly in a browser; see the session's
QA log for the full pass/fail list.

## Interactive tools and how they were verified

All eleven tools, the six diagnostics, the matrix filter, the role cards, the loop
stepper, the checklists, the prompt-template variables, search (keyboard
navigable) and the theme toggle were exercised programmatically in the browser:
inputs dispatched, outputs asserted (for example, all-best answers → BUILD,
all-worst → REMOVE; adding an unconnected node → "Isolated" warning; a hypothesis
whose behavior says "fun" → rewrite warning). All 34 routes render with zero
console errors. At a 375 px viewport, 25 routes were checked for horizontal
overflow (none), the sidebar collapses behind a toggle, and the nav scrolls.
`src/validate.js` confirms every cross-link (related topics, smell causes,
loop parts, unfairness causes, loop steps) resolves and every topic has all
eight sections.

The Phase 3 expansion (five new domains, engine tabs, interview tabs, the
Experience view) was checked in the browser directly, not just by build script:
all 43 topics in the five new domains and 14 sampled topics from the original
domains were opened and every present tab exercised (title, tab strip, snippet
presence, no `undefined` / `[object Object]` / `NaN` / stray escape codes); the
three Experience case studies were opened and their sections, expandable STAR
stories and related-topic links exercised; the mind map was expanded, dragged,
reset (both drag-reset and default-reset), zoomed and fit; search was run
against engine, interview and case-study content and a result was opened; the
twelve pre-existing routes were re-checked for console errors; and the whole
guide was re-tested at a 375 px phone width, including opening the content
drawer, switching tabs by tap, and confirming a code snippet scrolls inside
itself without the page ever gaining a horizontal scrollbar. One real mobile
defect was found and fixed (a long "Appears in" chip clipped past the edge of a
375 px drawer instead of wrapping) and `check-layout.js` still reports zero
label overlaps across all 153 map states.

The project-map pass (three case studies turned into 24 systems and 81 parts)
repeated the same discipline. Every one of the 81 parts was opened by route and
checked against its own data (title, `how` bullet count, both callouts, related-
topic and linked-part counts, leaf count, no `undefined` / `[object Object]` /
`NaN`), every one of the 24 systems was clicked open on the map, and all three
project overviews were confirmed against `.node[data-scope=project]` counts, with
zero console errors per project. Six cross-map round trips (two per project: a
part's leaf → the topic on the domain map → its "Seen in practice" chip → back to
the part) were run, and the domain map's own saved state was byte-identical before
entering a project and after leaving it. `check-layout.js` now reports zero
overlaps across 261 map states (up from 153), and `node src/validate.js` confirms
3 projects, 24 systems and 81 parts with every `rel` and `links` id resolved.

The codenames, workflow-chart and project-interview pass repeated the same
discipline once more. All nine flows (three per project) were opened by route and
checked against their own data: the heading matched the flow title, the rendered
`.flownode`/`.fedge`/`.flabel` counts matched the step, edge and labelled-edge
counts in the source, the numbered step list matched the step count, every card
sat fully inside the chart's own bounding box with no card overlapping another,
and the step-list dots were coloured per system. The rail's Workflows branch was
confirmed open with the active flow highlighted on all nine routes. All three
project Interview tabs (11 questions each) and all 24 system "Likely questions"
sections (exactly 3 each) were opened and counted. The private story textarea was
exercised on all three projects and confirmed to write only its own
`story.<project-id>` key, never a `story.<topic-id>` key. Three cross-map round
trips (one per project, mirroring the earlier six) reconfirmed a part's leaf →
topic → "Seen in practice" chip → back to the part still holds with the codenames
in place, and search was re-run against flow titles, step text and the codenames
themselves ("life of a request", "pull request", "memory regression", "Project
P"), each returning the matching flow or project as a top result. All twelve
pre-existing regression routes plus the topic interview at `#/map/t/core-loop/
interview` were re-checked with zero console errors. At a 375 px width, a flow
route's chart was confirmed to fit the drawer with no page-level horizontal
overflow and its edge labels legible. `check-layout.js` now reports zero overlaps
across 282 map states (up from 261, the difference being the nine flow chart
states), and `node src/build.js` confirms 3 projects, 24 systems, 81 parts, 9
workflows, 3 project interviews and 24 systems with likely questions, all
cross-links resolved.

## Against the brief's final quality test

- Usable while designing: yes — the problem → smell → cause → hypothesis → prompt
  → experiment path is three clicks and every step exports text.
- Teaches how to think, not terminology: each topic leads with questions, tradeoffs,
  traps and signals; the terminology is secondary.
- Every topic says how to work with AI and when not to: yes, by construction.
- Forces player evidence into the workflow: hypothesis builder, loop step 6,
  "player evidence required" in the planner, the verification checklist's
  testability group, and every tool's output ending in a playtest question.
- Diagnoses why a game is not fun: smells, fun dimensions, loop diagnostic,
  unfairness diagnostic.
- Non-linear navigation: map, sidebar, related-with-why, breadcrumbs, search,
  smell ↔ topic back-links.
- Problem → diagnosis → experiment → prompt: yes. Idea → evaluation → prototype
  decision: ladder + decision tree + hypothesis builder.
- Prevents feature creep: decision tree, scope control topic, monthly scope
  checklist, feature-inflation failure mode, delegation planner warnings.
- Distinguishes complexity from depth and content from design quality: dedicated
  topics, the rule audit, the content-or-mechanic tree.

## The map as the spine, not a menu (superseded by the three-pane mind map)

**Historical.** This section describes the radial map that the three-pane mind map
replaced, including the camera, in-place patching and the two interaction bugs it fixed
(pointer capture swallowing clicks, and a destructuring typo that produced `NaN` paths).
The bug lessons still hold. The architecture that ships now is described under "The
second brain" above.

Three generations. The first was a static wheel linking to pages. The second had
three separate zoom levels, which read as three different maps. The third, current
one is a single brain map that expands and collapses in place:

- The goal in the centre, the fourteen domains always on ring one.
- Click a domain: its topics fan out on ring two around that domain; other
  domains stay visible and faint cross-links show where those topics reach.
- Click a topic: everything it connects to fans out on ring three (related topics
  with a dashed line back to their home domain, design smells it diagnoses, tools),
  and the full topic opens in the reading drawer beside the map. Clicking a related
  topic travels: its domain opens, it becomes the selection, and the drawer follows.
- Hover shows the tagline and, for connections, the reason they connect. Drag pans,
  wheel zooms, "fit" resets.
- State persists (open branch, selection, zoom). `#/map` restores it; every other
  view carries a "Back to map" dock and the `M` key does the same; the dock shows the
  path you will land on. Old `#/topic/...` links redirect onto the map.

Camera: the first version refit the whole map on every click, so scale jumped and
the eye lost the node it was following. Now the camera keeps the current zoom, pans
smoothly (eased, about half a second) to a focus box made of the centre, the open
domain, its fan and the selected topic's leaves, zooms out only when that box does
not fit, and never zooms in by itself; fit and collapse animate; newly revealed nodes
fade in. The animation falls back to timers when the tab is hidden, because
`requestAnimationFrame` pauses there. Verified by reading the viewBox mid-animation
and after: moving between two open branches changes only x and y.

No flash: the first camera version still rebuilt the whole page section and the whole
SVG on every click, so the map flashed. Now, when the map is already on screen, a
click patches it in place: the SVG is split into three keyed layers (guides, edges,
nodes); every element carries a stable key; existing elements have their attributes
and content updated, new elements are appended with a `data-new` marker that drives a
fade-in and is removed after half a second, and vanished elements are deleted. Events
are delegated to the SVG once, so listeners survive patches. Verified by holding
references to the SVG, a domain node and an edge across a sequence of clicks: the same
elements persist, only the seven newly opened topics carry the marker, and the marker
is gone 600 ms later.

Label geometry: domain labels sit outside their nodes, wrapped to two lines and
anchored by angle; topic and leaf labels run radially (sunburst style, flipped on
the left half) so neighbours in a fan cannot collide. `src/check-layout.js` renders
all 105 map states (overview, each domain open, each topic selected) and tests every
label against every other label and node using oriented boxes and a separating-axis
test. It reports zero overlaps and now runs inside `node src/build.js`, failing the
build on any overlap, so added content cannot ship a collision. Geometry is
adaptive rather than fixed: the domain ring widens as domains are added and a
domain's topic fan grows its radius to hold the minimum gap, so the same map scales
from the current 14 domains × 90 topics to far larger content without changing its
look at the current size (verified on synthetic sets up to 720 topics, including
720 in a single domain, and up to 48 domains: zero overlaps). The earlier
axis-aligned version of this check is what exposed the collisions the user saw.

### A bug the synthetic tests missed

The first build of the single map used pointer capture on the SVG to support
dragging. Chrome then delivers the subsequent `click` to the capturing SVG rather
than the node under the cursor, so real mouse clicks did nothing while synthetic
`dispatchEvent` clicks in the test harness passed. The fix removes pointer capture
(drag is tracked on window pointer events, with a one-tick click suppression after
a real drag). Verification was then repeated with the browser's real input: clicking
a domain expands it, a topic selects it and fills the drawer, a smell opens it, the
centre collapses everything, dragging pans and persists without navigating, the
return dock lands on the saved node, a related-concept card travels to another
branch, and a Reference Dissection library chip adds a comparable. Lesson recorded:
synthetic events do not exercise hit-testing or pointer capture; verify interaction
with real input at least once.

The same blind spot hid a second fault for longer. The domain→topic spokes were
built with `const [[x,y]] = [tPos[t]]`, destructuring the `[point, angle]` pair so
that `x` became the whole `[x,y]` point and `y` became the angle. Every spoke path
then contained `NaN` and a doubled coordinate, so the browser silently dropped it
and a domain fanned out with no spokes. Neither `check-layout.js` (which reads
label text, not path geometry) nor `validate.js` (which reads data, not SVG) could
see a malformed `d` attribute; it surfaced only when the adaptive geometry was
exercised in a real browser and the console reported the SVG error. Lesson: data
and label checks do not cover a shape's rendered validity — load the page and read
the console at least once.

## Is my idea actually good? Dissection of successful games

Beyond raw ideation, the guide now leads a designer through cross-referencing a
concept against games that demonstrably succeeded with a similar want. A library of
fifteen dissected games (Slay the Spire, Stardew Valley, Vampire Survivors, Balatro,
Celeste, Hades, Into the Breach, Minecraft, Among Us, Wordle, Hollow Knight, Animal
Crossing: New Horizons, Factorio, Portal, Tetris) applies one template: want served,
core verb, first 30 seconds, decision per minute, engines, why it worked, what players
complain about, the lesson, and what copies miss. Entries describe mechanisms rather
than sales, and the topic warns that success narratives are heuristics to verify.

The **Reference Dissection** tool pulls the concept from the Idea Shaper, lets the
designer add comparables (library or custom, with an AI dissection prompt that demands
sources or "unknown"), shows a comparison matrix, and asks seven cross-reference
questions: shared proven want, visible mechanical differentiator, answered complaint,
re-derived borrowed patterns, where fans would find it weaker, quality bar
reachability, and evidence of an underserved audience. The verdict (promising,
derivative, unproven, undeliverable, needs work) names the next test. The map's
starting paths include "I have an idea and want to know if it is good".

## From no idea to a concept people want

For readers with no idea yet, the guide adds a topic ("Read the market, then shape
one idea"), a smell ("We do not know what game to make") and the **Idea Shaper** tool,
which is now the default Build tool and the first path on the map. Its logic reasons
from market observation instead of surveys: choose a market you already watch and
three to five shipped games, read what their players praise, complain about and work
around, classify the gap as an exit reason, an unmet want, a tolerated cost or your
own taste, name why no incumbent has closed it, write the promise in the player words,
and shape the single rule that keeps it and that an incumbent cannot copy without
breaking what works for them. The output is a positioning sentence, a hypothesis and
four observation tests (workaround audit, comment mining, one-mechanism greybox,
store-page side by side), each with a kill criterion. The tool warns when no
observation exists, when no workaround is found, when the gap is unclassified or not
mechanical, when the mechanism is really several rules, when the promise uses generic
words, and when constraints are absent.

## Visual identity

The first pass looked like a generic web-app dashboard (rounded cards, soft
gradients, sky-blue accents, pill tabs). It was restyled as a field manual
crossed with a technology tree: condensed display type, monospace micro-labels,
a dot-grid ground, sharp corners with hard offset shadows in the domain colour,
dashed graph edges, charcoal dark mode and paper-and-ink light mode. All fonts
are system fonts, so the file stays fully offline. Mobile (375 px) was tested
for overflow on 25 routes, sidebar collapse, and nav scrolling; desktop
(1440 px) was screenshotted in both themes.

## Interaction, diagrams and prose

- **The centre node now does what its tooltip promised.** Clicking it with a branch
  open collapses to the overview; clicking it at the overview opens an overlay with the
  four starting paths. Before this, the overlay never existed and the click was a no-op
  when the map was already at the overview.
- **Scrollbars are themed.** A global thin, square scrollbar is styled in the same
  ink-and-line palette in both themes, instead of the default OS widget. The mobile nav
  strip keeps its own hidden scrollbar.
- **Illustrations are inline SVG, not images.** The UI/UX topics carry an attention
  budget diagram and a feedback-loop diagram, and the reference-dissection topic and
  tool carry a template diagram. All draw with CSS variables, so they follow the theme
  and keep the single file offline and free of copyrighted assets.
- **Prose pass.** Roughly 1,000 clause-joining semicolons across the topic, smell,
  prompt and tool copy were rewritten as periods and commas, and the few dashes were
  removed. Voice is unchanged. Code semicolons and CSS in inline styles are untouched.
- **Map labels were rebuilt after real-browser review.** Screenshots showed ring-two
  topic labels truncated with an ellipsis and rotated text running across neighbouring
  nodes. Ring-two labels are now full (no truncation), uniform 13px, at a uniform gap
  from the node, and the checker confirms zero label or node overlaps. Ring-three leaves
  carry no canvas text at all; the hover tooltip names them and the drawer lists the
  related topics, which removes the tangle of rotated labels. A separate pass measured
  every one of the 90 topic states at three viewports: no label is clipped by the map
  viewport.
- **Header and type scale.** The nav wrapped into a second (and often third) line on any
  screen under 1500px, leaving a 104px sticky header. The breakpoint is now 1200px, the
  nav never wraps its labels, and the header is a single row on desktop. The drawer scroll
  target gained a scroll offset so a topic title is no longer hidden under the sticky
  header on phones. The ad-hoc font sizes were collapsed onto a small scale (heading and
  paragraph margins are now fixed pixels rather than em, so vertical rhythm does not
  change with font size).

## Ideation: the Idea Lab

The guide's first-class ideation surface is the Idea Lab (`#/lab`, `src/93-lab.js`,
and the first item in the navigation). It treats an idea as a chain of reasoning
rather than a form. Five entry modes (observation, desired feeling, a game you like, a
constraint, or "I do not know what to make") lead through small artifacts: signal,
tension, opportunity, design question, design space, mechanisms, critique, experiment.
Every fact-bearing artifact carries an evidence level (observed, reported, inferred,
hypothesized, simulated, validated) so AI-assisted thinking cannot manufacture
confidence. Each artifact has an example and a stage-specific AI prompt, and the chain
compresses into an Idea Card that opens in the Idea Shaper. The methodology works with
the AI removed.

This was a deliberate response to a review finding: the earlier Idea Shaper was a
fifteen-field questionnaire that produced a report without teaching ideation. It keeps
its role as the compression and communication artifact, not the entry point.

Reference library: the fifteen dissected games now carry official store art where it
exists (`assets/games/*.jpg`, a local folder so the page needs no network) and a
typographic tile otherwise. The distant dashed edges of the brain map were raised from
0.18 and 0.08 opacity to 0.34 and 0.16 so the connections are visible.

## The second brain: three panes, Idea Lab, prompt ladder

The front door and the navigator were rebuilt twice. The radial map and its floating
"back to map" dock are gone. The layout is now three persistent panes: a named, counted,
collapsible **index** on the left; an always-visible **mind map** in the centre; and a
**content** panel on the right. The map is a horizontal collapsible tidy tree: the goal in
the middle with the fourteen domains split into two balanced groups on either side, a
domain's topics while it is open, and a further layer of related concepts, smells and
tools under the selected topic, all as labelled cards joined by smooth
curves, so names never depend on hover and the structure grows by stacking and panning
rather than by shrinking a circle. Faint dashed cross-branch links connect domains to each
other, an open topic to a related concept's domain, and a leaf back to its home domain;
hovering a node highlights its links. A node can be dragged to reposition its branch, with
**drag** and **default** buttons (put the dragged nodes back in the tidy layout; return to
the collapsed overview); all gestures are pointer-based so they work with mouse and touch. Panels are resized by dragging the dividers and collapsed from the
toolbar; on phones the index and content are slide-over drawers with a tap-away scrim.
The centre button opens the starting paths at the overview and collapses an open branch.
A `#/lab` Idea Lab treats an idea as a chain (signal, tension, opportunity, design
question, design space, mechanisms, critique, converge, experiment, decide) with an
evidence level on every fact-bearing artifact and a ten-lens convergence that returns
confidence, not a score. `#/ai/ladder` adds the prompt ladder: twelve rungs, each with
the human decision, the AI partner, a prompt and the failure to avoid. The home panel
gains a "What are you trying to solve?" symptom router. See `DESIGN-SECOND-BRAIN.md`.

## Improvement programme (September 2026)

An audit of content, UX and code structure led to four phases of work, each
checked against evidence before it landed:

- **Structure without behaviour change.** Tools, diagnostics, lenses and view
  links are declared once in `05-registry.js`; data files are grouped one per
  domain; each app file has its own scope; inline handlers became delegated
  `data-action` handlers, and the build fails on an action without one. A
  golden-master sweep of every route (1011 at the time) proved these steps
  changed nothing on screen, and a data snapshot proved the regrouped data
  identical.
- **Fixes for readers.** Narrow screens show one pane per route, back and forward
  included; the camera refits after a resize or rotation; text meets AA contrast
  in both themes (84 failing pairs became 0, checked in the build); the map is
  keyboard-operable; dialogs trap and return focus; the theme follows the system;
  reduced motion is respected; saved data can be exported and imported.
- **Navigation.** Two lenses on the map, six navigation groups with sub-tabs,
  one step at a time in the Idea Lab, map labels that wrap onto two lines instead
  of being cut (221 shortened labels became 1), a one-sided tree on phones, and a
  spaced review queue for interview questions.
- **Content currency.** Five topics on AI-era practice (agents that build, evals,
  generative assets, disclosure and platform rules, generative characters),
  Quantic Foundry's motivation model, and dated facts with sources.
- **Checks.** JSDoc types checked by TypeScript, a Playwright smoke test at three
  widths, and CI that runs the build, a `playable.html` sync check, the type
  check and the smoke test. The final sweep visited 1036 routes at 375, 1024 and
  1440 px with no console errors and 745 link targets with none broken.
- **Independent review before release.** Three separate reviews (code, facts,
  UX and accessibility) led to fixes: the Epic v. Apple and Steam facts were
  corrected against their primary sources, a Godot pitfall and a Unity snippet
  were corrected, the review queue counts days in the reader's time zone and
  lists what is coming up, drawers on narrow screens open below the header so
  its controls stay reachable, and small controls reach 24 px.

## Assumptions and limitations

- **It is a heuristic system.** Verdicts (BUILD / PROTOTYPE FIRST / …, the
  elegance percentage, the unfairness ranking) are structured arguments, not
  measurements. They are labeled as such in the UI.
- **Genre-neutral by design.** Principles were chosen to survive across genres;
  genre-specific recipes (deckbuilder economies, MMO raid pacing, match-3 level
  math) are out of scope and would be a natural extension.
- **Depth per topic is bounded** to keep every node scannable. A designer wanting
  the full argument behind a heuristic should follow the Sources page to the
  original works.
- **No backend.** Tool state lives in one browser's localStorage. Nothing syncs
  between devices or teammates. The help dialog exports and imports all saved
  data as one JSON file, and each tool exports Markdown for sharing.
- **AI prompts assume a capable general-purpose model** and assume the designer
  fills the bracketed context. The guide repeatedly warns that unfilled brackets
  produce genre averages; it cannot enforce that.
- **The AI-era commentary reflects 2024–2026 practitioner sentiment**, which is
  contested and moving. It is presented as a field note, not a finding.
- **Search is substring-based** with light ranking; it has no synonyms beyond a
  keyword list on smells.
- **Layout is checked at 375, 1024 and 1440 px** by the browser smoke test in
  Chromium on every build in CI; other browsers are not tested automatically.
- **Dated facts are a starting point, not legal advice.** They say what a
  source said on the day it was checked; the validator can only flag age, not
  a rule that changed last week.
- **The rule-audit, sysmap and delegation tools use simple heuristics** (keyword
  matching against the matrix, pairwise unconnected nodes). They are prompts for
  thinking, not analysis engines; the real analysis is delegated to the AI prompts
  each tool generates.
