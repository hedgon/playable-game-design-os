# Playable — a game design operating system for the AI era

A static website that teaches how to think, decide, experiment and work with AI
to make a game people actually want to play, and how to build, ship and lead one.

Open `playable.html` in any modern browser, from a web server or straight from
the folder on disk. No server, no install, no network access, no external
libraries. The page holds the app and a light index of everything in the guide
(titles, links, the map); each topic's, game's, path's and guide's full text is
its own small file in `content/`, loaded the first time you open that page, so
the first visit downloads about 0.3 MB instead of the whole library. Images
(game screens, engine and platform portal screenshots) and the font files live
in `assets/`. It works on desktop, tablet and phone. `index.html` only
redirects to `playable.html`, for GitHub Pages.

## Start here

A first visit opens **Learning paths** (`#/paths`). Twenty-three paths across five
tracks (design, engineering, production, leadership, interview prep) walk you from
beginner to expert through the guide's topics, tools, checklists, diagnostics,
project parts, platform guides, reference games and prompts, in order, with a reason for each stop
and a concrete exercise. Not sure which one? Answer three questions (what you want
to do, your experience, your time) and one path is suggested with the reason; each
path card also says who it is for and what comes before it. A path never
duplicates content; it puts it in order. Every topic, reference game, engine
guide, platform guide and checklist is a step in at least one path, so nothing in
the library sits outside the course. Each stage ends in a checkpoint: its recall
questions one at a time, answered from memory before the outline shows, with a
"how sure am I?" tap first; you tick the ideas your answer had, and what you missed
comes back in the review queue. Then one build task, with a reference solution to
open after you try. If you already know a stage, test out of it with the same
questions, or skip it without testing. The path page shows the stages as a map
(steps read, what the checkpoint recalled, questions due) or as a plain list, and
**Play this path** walks it as a small game instead. A stage marked done or skipped by
mistake can be undone. The evidence behind each rule is in
[docs/program-2026-10/research/curriculum.md](docs/program-2026-10/research/curriculum.md). A slim bar
on every page names your current stage and the next step. There are no streaks
and no badges.

If you already know what you are looking for, go to the **Map**. The map has two
lenses, switched in the index or on the map's home panel:

- **Design**: fourteen domains, from the player and the core loop to production,
  AI collaboration, in-game AI and studio practice.
- **Engineering & Career**: nine domains: backend, infrastructure, game server,
  project management, team leadership, platforms and publishing, how AI models
  work, code craft, and careers beyond games.

If you have a real problem in a game you are making, start in **Diagnose**: pick
the symptom you see, read its likely causes, and run the experiment each cause
suggests.

## What is inside

Twenty-three domains and 208 topics. Every topic has the same eight practical parts:
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
| **Paths** (1) | Learning paths, Review | The guided way in, above. *Game designer foundations* can also be walked as a small top-down game in the manner of the first Dragon Quest (**Play this path**): each town is a stage, each person in it a step whose page they send you to, and the guardian at the end of a town asks the stage’s checkpoint questions; it keeps the same progress, notes and review queue as the path page, locks nothing, and the path page stays the default. **Review** brings back interview and checkpoint questions you marked, on a spaced schedule (1, 2, 4, 8, then 16 days). |
| **Map** (2) | Map, List, Concept index | The mind map: the lens's goal in the middle, domains around it, a domain's topics when it opens, and related concepts, smells and tools under the topic you select. The list shows the same topics as a list; the concept index ranks topics by how often others reference them. |
| **Library** (3) | Reference games, Platforms, Engines, Checklists, Prompts, Sources | The collections. **Reference games** takes games that succeeded or broke the mould apart with one template, each with a schematic of its loop, several with a numbered schematic of their screen, and every one with a full analysis: the idea worth stealing, ten lenses from UI and art direction to business and lineage (each a claim with evidence, mechanism, effect, comparison, cost and a lesson, with sources), and captioned, credited screenshots where the game has a store page. 107 entries (85 games and 22 series), from Tetris and Portal to Valkyria Chronicles, Persona 5 Royal, Final Fantasy XII, innovative designs such as Return of the Obra Dinn, Outer Wilds and Baba Is You, and casual and mobile hits such as Candy Crush Saga, Angry Birds and Flappy Bird. Long-running series such as Mega Man are analysed across all their entries, including which ones were praised or received badly and why. Group by family, filter by tag or lens, or switch to a list. **Platforms** has a guide per store or console (Steam, Nintendo, PlayStation, Xbox, Google Play, the App Store, Epic, the web, Meta Quest, itch.io) from getting access to release, and a guide per UGC platform (Roblox, Fortnite with UEFN) covering its architecture, editor and language, rules, money, publishing and discovery. Each stage has dated, sourced facts, each guide a flowchart and a numbered release walkthrough with interview questions, most with real screens from the platform’s own documentation; the stores share a comparison table, and curated and regional channels get a note each. **Engines** has a guide per engine or tool (Godot, Unity, Unreal Engine, GameMaker, the web stack, Blender, Ren’Py, Defold, Cocos Creator): what it is, how it is built, the editor, the content pipeline, building and deploying, licensing and cost, working with AI, and interview questions. 12 checklists (three for store submission, three for building with AI), 17 prompt templates, and the sources behind the guide. |
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
  rule. On phones the map draws one side of the tree, so a column fits the width, and moves by touch; a Map | List switch gives the same tree as an outline.

## Look and feel

A field manual crossed with a technology tree: condensed display type for
headings, monospace micro-labels, a dot-grid ground, sharp corners with hard
offset shadows in the domain colour, dashed knowledge-graph edges, a charcoal dark
mode and a paper-and-ink light mode. Every element has square corners. The type
reads like a magazine, with four free fonts (SIL Open Font License) shipped in
`assets/fonts/` with their licences, so the guide looks and measures the same on
every system and offline: **Instrument Serif** italic for large page titles,
**Newsreader** for reading, **Instrument Sans** for the interface, labels and map
cards, and **Atkinson Hyperlegible Mono** for code. The path game's pixel art is cut
from Kenney's *Tiny Town* and *Tiny Dungeon* (CC0), credited in `assets/rpg/LICENSE.txt`.

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
content/                each page's full text, loaded on demand (generated)
index.html              redirect to playable.html (GitHub Pages)
assets/games/           reference-game art used by the reference library
assets/fonts/           the three web fonts and their OFL licences
assets/rpg/             the path game's tiles (CC0, from Kenney) and their licence
src/                    sources and maintenance scripts (not needed to use the guide)
README.md               this file
CONTRIBUTING.md         how to edit content, the data schema, build and checks
docs/                   the analysis method, and finished plans and design notes in docs/_archive/
```

`playable.html`, `content/` and `assets/` are the whole guide; you can delete
`src/` and keep those. To change content, see [CONTRIBUTING.md](CONTRIBUTING.md).
