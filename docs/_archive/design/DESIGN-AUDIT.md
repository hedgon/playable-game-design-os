---
status: archived
updated: 2026-09-29
---

# Design audit: Playable (archive)

Snapshot of 2026-09-24, compacted on 2026-09-29; counts and coverage have changed since; see [README](../../../README.md) for current scope.

The audit inspected the guide as a senior game designer would, against the brief's final quality test. The full text is in git history.

## Scope at the time

- Design domains (Player, Experience, Core Gameplay, Systems, Content, Level Design, UX/UI, Narrative, Art/Audio/Feel, Product, Studio, Production, AI Collaboration, In-game AI) each use one eight-part practical structure. Topics with a real implementation decision add a ninth part, "Techniques to compare".
- Design topics carry Godot and Unity tabs (how a client in that engine reaches for the same idea) and an Interview tab (junior, mid, senior questions with model answers).
- The guide later extended into engineering and people practice: Backend (Go-first), Infrastructure, Game Server, Project Management, Team Leadership, and Platforms and publishing. The map shows two lenses: Design, and Engineering and Career.
- Supporting material: design smells with cause-to-experiment pairs, fun dimensions, diagnostics (core loop, unfairness, rule audit, content-or-mechanic tree), AI roles and failure modes, a responsibility matrix, prompt templates, checklists, tools, store and console guides, and a sources page.
- Rules that change (store policy, law, court rulings) carry dated facts, each with the day checked and a source. The validator warns once one is a year old.

## Mental models

1. Two chains. Player, Desire, Fantasy, Core experience, Loop, Mechanics, Decisions, Challenge, Feedback, Progression, Motivation, Content, UX, Retention (read backwards to diagnose). And Human judgment, AI assistance, Prototype, Playtest, Evidence, Revision, Repeat.
2. The bottleneck shift. Production is cheap. Taste, framing, prioritization, understanding players, recognizing fun, tradeoffs and knowing what not to build are the constraint.
3. The core loop as five links: action, feedback, decision, consequence, new situation. Each has characteristic failure symptoms.
4. Fun as dimensions, not a magic quality. Symptoms map to dimensions that went flat.
5. Depth versus complexity: buy decisions, not rules.
6. Experience thinking: behavior, experience, system, mechanic, feature; never feature, implementation, justification.
7. Hypothesis-driven design: "we believe [player] will [behavior] because [reason]; we will know when [signal]; we will kill it if [criterion]".
8. Content multiplies systems; it does not rescue them.
9. Polish amplifies validated feedback; it does not create meaning.
10. Say, do, context: self-report is useful, behavior is evidence, neither is interpretable without the human context AI lacks.
11. Scope follows validated value: idea, prototype, evidence, commit.

Sources include MDA and LeBlanc, Lazzaro, Self-Determination Theory, Koster, Meier, Schell, Swink and Vlambeer, kishōtenketsu, Hocking, Compton, Hodent and Norman, Ambinder and Lemarchand, Dan Cook, Sylvester, Lean UX and postmortems. The Sources page marks each as research-backed, heuristic, practice or contested. Two commonly misquoted maxims ("30 seconds of fun", "easy to learn, hard to master") are shown with their original intent.

## How AI collaboration is built in

- It is a first-class domain, not a footnote.
- Every topic has an "AI is good at / AI should not decide" split, a concrete prompt with real context slots (never "design a fun X"), topic-specific verification questions plus nine universal ones, and playtest questions.
- Nine roles, each with do-not-use conditions.
- A 12-step loop puts players between exploration and commitment, with human and AI roles, output and exit criterion per step.
- A responsibility matrix and Delegation Planner make ownership explicit and flag cycles with no player evidence.
- Failure modes come with detectors that can be run weekly, such as feature count against playtest count.
- The Prompt Generator enforces an eight-term formula and warns when INTENT or EVIDENCE is blank, the two omissions that let the AI decide for you.

## Design decisions worth keeping

- **Tabs, not parallel pages.** Overview is the default tab and stays the original eight-part page. Engine and interview tabs translate it for an implementer or interviewer. A topic keeps one URL and one place in the map. Tabs are deep-linkable and the last one used is remembered.
- **Projects view.** Real shipped projects become interview-shaped case studies: context, architecture, decisions with trade-offs, what went wrong, STAR stories, links back to topics. Projects use codenames. The anonymisation rule: the technique travels, the names do not. No company, teammate, hostname, schema or business figure appears; public library and vendor names are fine.
- **Two maps, one stage.** A project map (project, systems, parts) reuses the domain map's layout, camera and node kinds. Their state is kept apart (`mapState` and `projMap.<id>`), so leaving a project restores the domain map exactly. A reverse index of parts to topics feeds "Seen in practice" chips.
- **Flows as data.** Workflow charts are steps plus a DAG of edges, drawn by one renderer with the same card-and-curve language as the map. `check-layout.js` fails the build on card overlaps.
- **Learning paths are additive.** A path only orders references into existing content, so the map, projects and tools stay the single source of truth. A bigger map does not fix "where do I start"; a sequence does. Design rules the validator enforces: soft checkpoints (recall questions plus one build task, ungraded, never a lock); a chooser that covers every answer combination; no more than four consecutive topic steps from one domain; earlier-stage topics returning as `review`; stage levels never decreasing; every prerequisite pointing forward. Progress is "N of M done" with no streaks or guilt copy. "I already know this" marks a stage skipped, shown distinctly from done. A first-time visitor lands on the paths page. A path bar always names the next step.
- **Reference dissection.** Successful games are dissected with one template (want served, core verb, first 30 seconds, decision per minute, why it worked, complaints, lesson, what copies miss). The tool asks seven cross-reference questions and returns a verdict that names the next test. The guide warns that success narratives are heuristics.

## Lasting lessons from verification

- **Synthetic events miss real input.** The first single-map build used pointer capture, so real clicks went to the capturing SVG while dispatched test clicks passed. Verify interaction with real input at least once.
- **Data and label checks do not prove rendered shapes.** A destructuring typo gave every spoke path `NaN`, and the browser silently dropped them. Neither the layout checker (label text) nor the validator (data) could see it. Load the page and read the console at least once.
- **Camera and re-render.** Re-fitting the whole map on every click made the eye lose the node. The camera now keeps its zoom, pans smoothly and never zooms in by itself. In-place keyed patching of the SVG removed the flash. Animation falls back to timers when the tab is hidden.
- **Layout is a build check.** Every map state and flow is rendered and tested for overlaps inside the build, with geometry that adapts as content grows.
## Assumptions and limitations

- Heuristic, not measurement. Verdicts and scores are structured arguments and labelled so.
- Genre-neutral by design. Genre recipes were out of scope then.
- Depth per topic is bounded; the Sources page leads to the original works.
- No backend. State lives in one browser's localStorage; export and import is by JSON file, tools export Markdown.
- Prompts assume a capable general model and a designer who fills the brackets. Unfilled brackets give genre averages and the guide cannot enforce otherwise.
- AI-era commentary reflects 2024 to 2026 practitioner sentiment: contested, presented as a field note.
- Search is substring-based with light ranking.
- Layout is tested in Chromium at 375, 1024 and 1440 px only.
- Dated facts say what a source said on the day checked; the validator flags age, not a rule that changed last week. They are not legal advice.
- Rule-audit, sysmap and delegation tools use simple keyword and graph heuristics and are prompts for thinking, not analysis engines.
