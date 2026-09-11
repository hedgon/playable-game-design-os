# Playable — a game design operating system for the AI era

A single self-contained HTML file that teaches how to think, decide, experiment
and collaborate with AI to make a game people actually want to play.

Open `playable.html` in any modern browser. No server, no build step, no
network access, no external libraries. Everything you type into the tools and
every checkbox you tick is saved in your browser's localStorage and never
leaves your machine. Works on desktop, tablet and phone.

## What is inside

| View | What it is for |
| --- | --- |
| **Map** | One brain map that expands and collapses in place. The goal sits in the centre; the twelve domains are always on the first ring; clicking a domain fans its topics out around it; clicking a topic fans out everything it connects to (related topics with a dashed line back to their home domain, design smells it diagnoses, tools) and opens the full topic in the reading drawer beside the map. Hover shows why an edge exists. Drag to pan, wheel to zoom, "fit" to reset. The camera keeps your zoom level when you click: it pans smoothly to the branch you opened (keeping the centre in view), zooms out only when a fan does not fit, and never zooms in on its own; "fit" and "collapse" animate. New nodes fade in. The open branch, selected node and zoom are saved, so `#/map` always returns to where you were, and every other view shows a **Back to map** dock (or press `M`) that lands on the exact spot. Routes: `#/map/d/<domain>`, `#/map/t/<topic>`, `#/map/s/<smell>`, `#/map/home`. |
| **Explore** | A list view of the same 70 topics for people who prefer lists. Every link opens the topic on the map. Every topic has the same eight parts: What is it, Why it matters, How a human should think about it, How to actually do it, What AI should and should not do, How to prompt AI, How to verify AI output, What to playtest. Related concepts always say *why* they connect. |
| **Diagnose** | Start from a symptom. 19 design smells (each with likely causes, an experiment per cause and a diagnostic prompt), the Fun Diagnostic (19 dimensions of fun), the Core Loop diagnostic (Action → Feedback → Decision → Consequence → New situation), the Unfairness diagnostic, the Depth-vs-Complexity rule audit, and the Content-or-Mechanic decision tree. |
| **Build** | Ten working tools. **Reference Dissection** (is my idea actually good? Pick the games your player already plays from a library of fourteen dissected successes or add your own; each is taken apart with one template: want served, core verb, first 30 seconds, decision per minute, why it worked, what players complain about, what copies miss; then seven cross-reference questions produce a verdict: promising, derivative, unproven, undeliverable, or needs work, with the next test), **Idea Finder** (for people who do not yet know what to make: a specific player → what they love, complain about and wish for → kinds of fun → constraints → fantasy collisions to react to → core verb and loop → versus what; outputs a positioning sentence, a hypothesis, three "want tests" to run before building, and prompts for complaint mining, concept expansion and devil's advocate), Game Loop Builder, Core Experience Canvas, Behavior Ladder (feature → behavior → system → mechanic → feature), Should We Build This? (nine questions → BUILD / PROTOTYPE FIRST / SIMPLIFY / DEFER / REMOVE), Playtest Hypothesis Builder, AI Delegation Planner, System Relationship Map, AI Prompt Generator. Each exports Markdown. |
| **AI Workflow** | The 12-step AI-era development loop (mark where your project is), the bottleneck-shift philosophy, nine AI roles with use / do-not-use conditions and starter prompts, the Human-vs-AI responsibility matrix, the prompting formula, and the catalogue "When AI makes your game worse" (14 failure modes with symptom, cause, detector, correction). |
| **Playtest** | The truth machine: say versus do versus context, the question bank, methods and what each is blind to, the session flow, and analysis prompts that keep AI out of the decision. |
| **Prompts** | 17 reusable prompt templates with fill-in variables (brainstorming, critique, systems, economy, progression, level design, UX audit, narrative, playtest analysis, balancing, scope reduction, prototype brief, implementation, refactor, postmortem, verification). |
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

On phones the topic sidebar collapses behind a "Browse topics" toggle, the
navigation becomes a horizontally scrollable strip, the knowledge map scrolls
sideways with a tap-friendly domain list beneath it, and every tool is single
column.

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

When you have no idea what to make: **Build → Idea Finder**. Pick a specific player,
write what they love, complain about and wish for, choose two or three kinds of fun,
write your constraints, react to fantasy collisions until one makes you say "no, but…",
name the core verb, then run the three want tests on real people before building.
Continue into the Core Experience Canvas and the Hypothesis Builder.

## Keyboard

`Ctrl/⌘ K` or `/` search · `1`–`8` switch views · `[` `]` previous / next topic ·
`E` expand or collapse all sections · `M` map · `T` theme · `?` help · `Esc` close.

## Do I need the build script?

No. `playable.html` is complete and self-contained; nothing in `src/` is needed to
use it, host it, or share it. You can delete `src/` and keep the one file.

`src/` exists only for maintenance. The guide is about 550 KB of content and code
in one file, so the source is split into readable parts: one data file per group of
domains, the map geometry, the app, and the map view. Editing a topic in a 60 KB
data file is easier than in a 550 KB HTML file. `build.js` simply concatenates the
parts in order and then runs `validate.js` (every cross-link resolves, every topic
has all eight parts) and a syntax check, so a typo in a topic id fails loudly
instead of producing a dead link. `check-layout.js` renders every map state and
reports label overlaps. All three are plain Node scripts with no dependencies.

Two valid ways to edit:

- **Small tweak**: edit `playable.html` directly in any editor and reload.
- **Content work**: edit the files in `src/`, run `node src/build.js`, reload.

## Files

```
playable.html          the deliverable: open this
README.md              this file
DESIGN-AUDIT.md        what the guide covers, its mental models, tools, limitations
src/                   optional: sources and maintenance scripts (see above)
  01-head.html         CSS and page shell
  10-data-domains.js   domains + Player, Experience, Core Gameplay topics
  11-data-topics-systems.js   Systems, Content, Level Design topics
  12-data-topics-ux.js        UX, Narrative, Presentation topics
  13-data-topics-product-ai.js Product, Production, AI Collaboration topics
  14-data-diagnostics.js      smells, fun dimensions, core-loop and unfairness diagnostics
  15-data-ai.js               roles, failure modes, matrix, loop steps, prompt templates, checklists, feature tree
  16-data-references.js reference library of dissected successful games + the "dissect games that succeeded" topic
  89-graph.js          brain map geometry (one expandable radial map, radial labels)
  90-app.js            router, views, tools, search
  91-map.js            map view: drawer, pan/zoom, persistence, return dock
  92-ideas.js          Reference Dissection tool
  99-tail.js           boot
  build.js             concatenates sources, validates, syntax-checks
  check-layout.js      renders every map state and reports label overlaps (oriented boxes)
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
prompts[{l,p}], verify, test, rel[[id,why]]`. Add a smell to `SMELLS` with
`causes[{c, top, exp}]` where `top` is a topic id. The validator fails on any
unresolved link or missing section, so it is safe to refactor.

## Principles the guide embodies

- AI generates possibilities cheaply; humans decide what is worth making.
- A polished bad idea is still a bad game.
- Content multiplies a good system; it does not rescue a bad one.
- What players say is useful; what players do is evidence; neither means anything without context.
- Every significant decision is a hypothesis with an observable signal and a kill criterion.
- Everything here is a heuristic, not a law. Test it against your players.
