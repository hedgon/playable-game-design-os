# Playable — a game design operating system for the AI era

A single self-contained HTML file that teaches how to think, decide, experiment
and work with AI to make a game people actually want to play, and how to build,
ship and lead one.

Open `playable.html` in any modern browser. No server, no install, no network
access, no external libraries. Reference-game art lives in the small
`assets/games/` folder beside the file; everything else is embedded. It works on
desktop, tablet and phone. `index.html` only redirects to `playable.html`, for
GitHub Pages.

## Start here

A first visit opens **Learning paths** (`#/paths`). Fourteen paths across five
tracks (design, engineering, production, leadership, interview prep) walk you from
beginner to expert through the guide's topics, tools, checklists, diagnostics,
project parts, platform guides, reference games and prompts, in order, with a reason for each stop
and a concrete exercise. Not sure which one? Answer three questions (what you want
to do, your experience, your time) and one path is suggested with the reason; each
path card also says who it is for and what comes before it. A path never
duplicates content; it puts it in order. Each stage ends in a short checkpoint (a
few recall questions, each with an answer outline to compare against once you
have answered, and one build task), not a test, and "I already know this" lets you
skip a stage. A stage marked done or skipped by mistake can be undone. A slim bar
on every page names your current stage and the next step. There are no streaks
and no badges.

If you already know what you are looking for, go to the **Map**. The map has two
lenses, switched in the index or on the map's home panel:

- **Design**: fourteen domains, from the player and the core loop to production,
  AI collaboration, in-game AI and studio practice.
- **Engineering & Career**: backend, infrastructure, game server, project
  management, team leadership, and platforms and publishing.

If you have a real problem in a game you are making, start in **Diagnose**: pick
the symptom you see, read its likely causes, and run the experiment each cause
suggests.

## What is inside

Twenty domains and 151 topics. Every topic has the same eight practical parts:
what it is, why it matters, how to think about it, how to do it, what AI should
and should not do, how to prompt it, how to verify its output, and what to
playtest. Most topics add **Godot** and **Unity** tabs (the engine's own term, the
APIs to reach for, a short real snippet, a pitfall, and how the two engines map
onto each other) and every topic has an **Interview** tab (junior, mid and senior
questions with model answers, follow-ups and red flags, plus a private note for
your own story). Topics that depend on rules which change, such as store policy,
law or court rulings, list **dated facts**: each says when it was last checked
and links its source. Topics about something visual (a loop, an economy, a
pacing curve, a comparison, a state machine, a pipeline) open with a
**diagram**, drawn from data and repeated as text underneath.

| Section (key) | Views | What it is for |
| --- | --- | --- |
| **Paths** (1) | Learning paths, Review | The guided way in, above. **Review** brings back interview and checkpoint questions you marked, on a spaced schedule (1, 2, 4, 8, then 16 days). |
| **Map** (2) | Map, List, Concept index | The mind map: the lens's goal in the middle, domains around it, a domain's topics when it opens, and related concepts, smells and tools under the topic you select. The list shows the same topics as a list; the concept index ranks topics by how often others reference them. |
| **Library** (3) | Reference games, Platforms, Checklists, Prompts, Sources | The collections. **Reference games** takes games that succeeded or broke the mould apart with one template, each with a schematic of its loop, several with a numbered schematic of their screen, and every one with a full analysis: the idea worth stealing, ten lenses from UI and art direction to business and lineage (each a claim with evidence, mechanism, effect, comparison, cost and a lesson, with sources), and captioned, credited screenshots where the game has a store page. 40 games, from Tetris and Portal to Valkyria Chronicles, Persona 5 Royal, Final Fantasy XII, innovative designs such as Return of the Obra Dinn, Outer Wilds and Baba Is You, and casual and mobile hits such as Candy Crush Saga, Angry Birds and Flappy Bird. Group by family, filter by tag or lens, or switch to a list. **Platforms** has a guide per store or console (Steam, Nintendo, PlayStation, Xbox, Google Play, the App Store, Epic, the web, Meta Quest, itch.io) from getting access to release, and a guide per UGC platform (Roblox, Fortnite with UEFN) covering its architecture, editor and language, rules, money, publishing and discovery. Each stage has dated, sourced facts, and each guide a flowchart; the stores share a comparison table. 9 checklists (three for store submission), 17 prompt templates, and the sources behind the guide. |
| **Make** (4) | Idea Lab, Build tools | The **Idea Lab** treats an idea as a chain of small, evidence-rated steps (signal, tension, opportunity, question, design space, mechanisms, critique, converge, experiment, decide), one step at a time, and compresses it into an Idea Card. Eleven **build tools** (reference dissection, idea shaper, loop builder, experience canvas, behaviour ladder, "should we build this?", hypothesis builder, AI delegation planner, system map, prompt generator, in-game AI technique chooser) export Markdown. |
| **Diagnose** (5) | Diagnose, Playtest | 33 design smells with causes and experiments, the fun, core-loop, unfairness, depth and content diagnostics, and the playtest question bank and methods. |
| **AI Workflow** (6) | The 12-step loop, prompt ladder, bottleneck shift, roles, responsibility matrix, prompting framework, failure modes | How to delegate to AI without handing it the decisions. |
| **Projects** (7) | Three anonymised shipped projects | Architecture, decisions and their trade-offs, what went wrong, STAR interview stories, a project mind map of systems and parts, workflow charts, and project-level interview questions. Each project is named by a codename; the technique travels, the names do not. |

**Search** (`Ctrl/⌘ K` or `/`) finds every page by name or synonym ("library",
"stores", "review queue"), plus topics, games, platform guides, paths, smells,
prompts, tools, roles, failure modes and sources. Every word must match, one typo
is forgiven, and results are grouped with pages first; an empty box lists the
pages you visited last. **All pages** (the grid button in the header, or
`#/index`) lists every page by section; a link to a page that does not exist
lands there too. The footer link **Sources
and lineage** lists the frameworks the guide draws on and marks each as
research-backed, practitioner heuristic, practice, or contested.

## Keyboard

`Ctrl/⌘ K` or `/` search · `1`–`7` sections · `[` `]` previous or next topic ·
`E` expand or collapse a topic's sections · `M` fit the map · `T` theme · `?` help
· `Esc` close. Single-key shortcuts can be turned off in the help dialog, and they
are ignored while you type in a field.

The map works without a mouse: Tab into it, use the arrow keys to move between
nodes, Enter or Space to open one, and Home to return to the centre.

## Your data

Everything you type into the tools, every ticked checkbox, your stories and your
reading progress are saved in this browser's `localStorage` and never leave your
machine. Browsers can clear that storage, so the help dialog (`?`) can **export**
all of it to a JSON file and **import** it again, in this browser or another one.

## Accessibility

- Text meets WCAG AA contrast (4.5:1) in both themes; the build checks every
  colour pair and fails below it.
- The theme follows your system's light or dark setting until you choose one.
- Reduced-motion settings are respected: the map camera jumps instead of gliding.
- A skip link comes first; after a dialog closes, focus returns where it was.
- On narrow screens the guide shows one pane at a time: reading pages open the
  content, structure pages open the map, and back and forward follow the same
  rule. On phones the map draws one side of the tree, so a column fits the width.

## Look and feel

A field manual crossed with a technology tree: condensed display type for
headings, monospace micro-labels, a dot-grid ground, sharp corners with hard
offset shadows in the domain colour, dashed knowledge-graph edges, a charcoal dark
mode and a paper-and-ink light mode. System fonts only (Bahnschrift or Avenir Next
Condensed where available, Cascadia or Consolas for mono), so it renders the same
offline.

## Principles the guide embodies

- AI generates possibilities cheaply; humans decide what is worth making.
- A polished bad idea is still a bad game.
- Content multiplies a good system; it does not rescue a bad one.
- What players say is useful; what players do is evidence; neither means anything
  without context.
- Every significant decision is a hypothesis with an observable signal and a kill
  criterion.
- Everything here is a heuristic, not a law. Test it against your players.

## Files

```
playable.html           the guide: open this
index.html              redirect to playable.html (GitHub Pages)
assets/games/           reference-game art used by the reference library
src/                    sources and maintenance scripts (not needed to use the guide)
README.md               this file
CONTRIBUTING.md         how to edit content, the data schema, build and checks
DESIGN-AUDIT.md         what the guide covers, its mental models, tools and limits
DESIGN-SECOND-BRAIN.md  the architecture, the ideation method and the AI model
```

`playable.html` is complete on its own; you can delete `src/` and keep the one
file. To change content, see [CONTRIBUTING.md](CONTRIBUTING.md).
