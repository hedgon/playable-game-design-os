# Design audit — Playable

Inspected as a senior game designer would, against the brief's final quality test.

## What the guide covers

Fourteen domains, 90 topics, all with the same eight-part practical structure
(topics with a real implementation decision add a ninth, "Techniques to compare"):

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
| AI Collaboration | the bottleneck shift, AI roles, prompting framework, verifying AI output, AI failure modes, responsibility matrix, AI for prototyping and implementation, AI for playtest analysis, the 12-step loop |
| In-game AI | what in-game AI is for (and when to fake or script it), choosing a behaviour technique (FSM, behaviour tree, utility AI, GOAP/HTN), perception and memory, navigation and pathfinding, readable and fair AI, adaptive AI and directors, allies and companions, learning-based/ML AI, budgets and debugging, scripted vs simulated |

Plus: 33 design smells with 120 cause → experiment pairs, 19 fun dimensions, a
core-loop diagnostic, an unfairness diagnostic, a rule audit, a content-or-mechanic
decision tree, 9 AI roles, 14 AI failure modes, a 20-row responsibility matrix,
17 prompt templates, 6 checklists, 11 tools, and a sources page.

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

## The map as the spine, not a menu (superseded by the knowledge rail)

**Historical.** This section describes the radial map that the persistent knowledge rail
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

## The second brain: persistent rail, Idea Lab, prompt ladder

The front door and the navigator were rebuilt. The old radial map plus a floating
"back to map" dock is gone. A persistent knowledge rail now sits on the left on desktop
(collapsible behind a toggle on phones): every domain and topic is named, counted and
expandable, so names never depend on hover and the list scales by scroll rather than by
shrinking nodes. The radial map survives as an on-demand Graph overview opened from the
rail or with `M`, used for relationships rather than navigation. A `#/lab` Idea Lab
treats an idea as a chain (signal, tension, opportunity, design question, design space,
mechanisms, critique, converge, experiment, decide) with an evidence level on every
fact-bearing artifact and a ten-lens convergence that returns confidence, not a score.
`#/ai/ladder` adds the prompt ladder: twelve rungs, each with the human decision, the
AI partner, a prompt and the failure to avoid. The home panel gains a "What are you
trying to solve?" symptom router. See `DESIGN-SECOND-BRAIN.md`.

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
  between devices or teammates. Export to Markdown is the sharing mechanism.
- **AI prompts assume a capable general-purpose model** and assume the designer
  fills the bracketed context. The guide repeatedly warns that unfilled brackets
  produce genre averages; it cannot enforce that.
- **The AI-era commentary reflects 2024–2026 practitioner sentiment**, which is
  contested and moving. It is presented as a field note, not a finding.
- **Search is substring-based** with light ranking; it has no synonyms beyond a
  keyword list on smells.
- **Visual polish was checked at desktop (1440 px) and phone (375 px)** in
  a Chromium browser; tablet widths rely on the same responsive
  rules and were not separately screenshotted.
- **The rule-audit, sysmap and delegation tools use simple heuristics** (keyword
  matching against the matrix, pairwise unconnected nodes). They are prompts for
  thinking, not analysis engines; the real analysis is delegated to the AI prompts
  each tool generates.
