# Contributing to Playable

How the guide is built, how to add or change content, and which checks a change
has to pass. For what the guide is, see [README.md](README.md).

## Edit the sources, then build

`playable.html` is generated. Edit the files in `src/`, then run:

```bash
node src/build.js
```

The build concatenates the sources in the order listed in `src/manifest.js`
(the single place to add or rename a file), writes `playable.html`, and fails
loudly if any check fails:

| Check | What it guards |
| --- | --- |
| `validate.js` | Every cross-link resolves; every topic has all eight parts, Godot and Unity views where required, and 6 to 10 interview questions; cases, systems, flows, paths and dated facts have the right shape. Prints the inventory counts. |
| `check-layout.js` | Every map state (both lenses, desktop and one-sided phone layouts, open topics, projects, paths, workflow charts, and any state `PlayableGraph.checkStates` lists) is built with the labels a reader sees, including the static tool links, and checked for overlapping cards. The same states are then drawn in a real browser from the built `playable.html` and every label is measured with the font and size the CSS really applies: the check fails when any card's text sticks out of its card ("labels that do not fit their card"). Without Playwright that half is reported as NOT MEASURED; `--require-browser` makes it a failure. Two tree edges that cross fail the check (a tidy tree has none); the faint cross-branch links passing over other edges, which they do by design, and words split across lines are reported, never failing (`--list` prints the split words). Every diagram (topics, reference games, the content-or-mechanic tree) is laid out as the page draws it and fails on touching boxes, a box outside the canvas, a label that does not fit, or a canvas too wide for a phone. |
| `check-contrast.js` | Every text colour pair in both themes, including map labels on every domain tint, reaches 4.5:1. |
| syntax | The bundle and each source file parse. |
| actions | Every `data-action` in the markup has a handler in `ACTIONS`. |
| breakpoints | Every width the app tests with `matchMedia` is also a breakpoint in the stylesheet, so script and CSS agree on when the drawers apply. |

Do not edit `playable.html` by hand: CI rebuilds it and fails when the committed
file differs from the build of the committed sources.

All scripts are plain Node (version 24 in CI) with no dependencies. Useful on
their own:

```bash
node src/validate.js          # data checks only; PLAYABLE_STRICT=0 downgrades missing eng/iv to warnings
node src/check-layout.js --list
node src/inventory.js         # every id a learning-path step can reference, by kind
node src/serve.js             # optional local preview at http://localhost:8765
```

### Types and the browser smoke test

The data files carry JSDoc types (`src/10-schema.js`), checked with TypeScript:

```bash
npx -y -p typescript@5 tsc -p jsconfig.json
```

`src/smoke.js` opens the built page in Chromium at 375, 1024 and 1440 px, visits
one route of every kind, and fails on a page or console error, an empty content
pane, content that runs past the pane's right edge outside a horizontal scroller,
a narrow-screen pane rule that is not met, map labels under 11 px, a phone header
that clips a section, or a Make, library or Diagnose page missing its grouping.
At 1440 and 375 px it also drives the map: the tree roles and the single Tab stop,
the ARIA arrow keys with their live announcements, wheel and button zoom with the
11 px label floor, the selected topic staying in view, dimmed-leaf contrast and the
focus ring in both themes, dragging a node (kept after a reload), the fit and reset
buttons, the lens switch, the project map camera, eight quick route changes, and
reduced motion. At 1280 and 1440 px it also checks the map follow-ups: a selected topic framed with its groups and "N more" cues for leaves the window cuts off, a click inside the map keeping the map shown, find in map (count, Enter, Escape), the skip link from a folded page, and the toolbar staying on one line. Below 700 px the map is an expandable outline instead of a canvas
(same tree, groups, read marks and routes), and the 375 px run drives that instead.
It needs Playwright, which is not a dependency of the guide:

```bash
npm i --no-save --no-package-lock playwright@1
npx playwright install chromium
node src/smoke.js
```

Set `PLAYWRIGHT_CHANNEL=chrome` to use an installed Chrome instead.

`src/e2e-paths.js` drives the learning paths the same way, at 375 and 1440 px:
continue at a checkpoint, ticking a step, undo, the four structure indicators on
an open path, map framing, the chooser, and a checkpoint question going into
Review. Run it with `node src/e2e-paths.js` after the same Playwright setup. CI
does not run it yet.

CI (`.github/workflows/build.yml`) runs the build, the `playable.html` sync check,
the type check and the smoke test on every push and pull request.

## Source files

```
01-head.html              CSS and the page shell (header, dialogs, toast)
05-registry.js            ids declared once: TOOLS, DIAGNOSTICS, LENSES, VIEW_LINKS, PAGES (every page, for search and All pages)
10-schema.js              JSDoc types, DOMAINS, TOPICS, section titles, and T, TECH, ENGINE, INTERVIEW, FACTS
12-diagnostics.js         smells, fun dimensions, core-loop and unfairness diagnostics
13-ai-workflow.js         AI roles, failure modes, responsibility matrix, loop steps, prompt templates, checklists, feature tree
14-references.js          the reference library of dissected games, their schematics and art credits
15-platforms.js           platform guides: PLATFORM(), PLATFORMS, the six stages, the comparison table
16-games-analysis.js      family, tags and aka for the first fifteen games, and their ANALYSIS()
17-games-japan.js         whole GAME() entries: Japanese games and games that bend time and turns
18-games-innovative.js    whole GAME() entries: innovative designs (Obra Dinn, Outer Wilds, Baba Is You...)
18-games-casual.js        whole GAME() entries: casual and mobile games (Candy Crush Saga, Angry Birds...)
18-games-series.js        whole SERIES() entries: long-running series analysed across all their entries
18-games-genres.js        whole GAME() entries: genre classics (visual novels, open worlds, old-school fun)
19-engines.js             engine and tool guides: ENGINE_GUIDE(), ENGINES, the eight stages
20-topics-player.js       one file per domain, in map order: the domain, then each topic
  ...                     with its TECH, ENGINE, INTERVIEW and FACTS
39-topics-platforms.js
39a-topics-models.js      how AI models work (no engine views)
39b-topics-craft.js       code craft (engine views where code shows the point)
39c-topics-careers.js     careers beyond games (no engine views)
40-cases.js               the three anonymised projects: CASE, SYSTEMS, FLOWS, PROJECT_INTERVIEW
41-case-systems-a.js      systems and parts of each project
42-case-systems-b.js
43-case-systems-c.js
50-paths.js               PATH, PATHS, TRACKS, LEVELS, step titles and links; design, leadership and interview paths
51-paths-engineering.js   engineering-track paths
87-diagrams.js            data diagrams: loop, stack, matrix, quad, curve, economy, state, screen
88-flow.js                workflow chart renderer (also the diagrams' flow kind)
89-graph.js               tidy-tree mind-map layout and rendering (topic map, project map, path map)
90-app.js                 router, views, tools, search, review queue, dialogs, saved data
91-map.js                 the map view: lenses, camera, pan, zoom, ARIA tree keys, phone outline, reading panels
                          (saved map state is validated on load; the camera is saved only while a branch is open, and after a 250 ms pause)
                          (branchFrame frames the selected node with its groups and open leaves; updateMoreCues counts what the window cuts off; find in map folds words like the site search)
92-ideas.js               Reference Dissection
93-lab.js                 Idea Lab
99-tail.js                boot
manifest.js               ordered file list
build.js                  build and checks (above)
validate.js, check-layout.js, layout-core.js, check-contrast.js, inventory.js, smoke.js, e2e-paths.js, serve.js
research-notes.md         verified sources behind the synthesis, with dates
```

The data files are plain scripts that share one scope once concatenated, so a
later file can call `T()` or read `TOPICS`. The app files (`88` onward) each run
in their own function scope and share what they need on `window.PlayableApp`.
Links are ordinary `<a href="#/...">` anchors; other clickable elements carry
`data-action="name"` and a handler in the `ACTIONS` registry in `90-app.js`, so
there are no inline `onclick` attributes.

## Adding content

### Topics

Add a topic with `T('topic-id', {...})` in the file for its domain. Required
fields: `d, t, tag, what, why, think{q,trade,traps,good,bad}, how, ai{yes,no},
prompts[{l,p}], verify, test, rel[[id,why]]`. A `rel` id must be a topic or one
of the view links in `05-registry.js`, and every `why` says why the two connect.

Right after the topic, in the same file:

- `TECH('topic-id', [{n, how, fit, cost, alt}])` adds "Techniques to compare"
  (optional).
- `ENGINE('topic-id', {godot:{...}, unity:{...}, note:''})` adds the Godot and
  Unity tabs. Each engine needs `term, api[], snippet, pitfall, map`. `snippet` is
  real GDScript or C#, 15 lines or fewer and 900 characters or fewer, using the
  APIs named in `api[]`. The domain decides whether its topics need them:
  `eng:'required'` (the default), `'optional'` or `'none'` in its
  `DOMAINS.push`. Project management and team leadership are `'none'`.
- `INTERVIEW('topic-id', {junior:[...], mid:[...], senior:[...]})` adds the
  Interview tab: six to ten questions in total, at least one per level, each
  `{q, a, follow, red}` (question, model-answer outline, expected follow-up,
  red-flag answer). The reader's own answer is never part of the data; the app
  saves it in `localStorage` under `story.<topicId>`.
- `FACTS('topic-id', [{claim, asOf, src}])` adds dated facts for anything that
  can change by next year: store rules, laws, rulings, prices. `asOf` is the day
  you checked the claim against `src` (`YYYY-MM-DD`), and `src` is an `https`
  link to the source (the validator parses it). It warns, and never fails, once a
  fact is a year old, and prints the line to recheck. Principles stay in the
  eight parts; only the changing details go here.

A new domain is a new file with `DOMAINS.push({ id, lens, t, short, color, sum,
links })`, where `lens` is `design` or `eng` (see `LENSES`), plus a line in
`manifest.js` and a `--d-<id>` colour token in `01-head.html`. The contrast check
covers the new tint automatically.

### Diagrams

`DIAGRAM('topic-id', spec)`, beside the topic, draws a diagram at the top of
its Overview, with the same content as a "Diagram as text" list under it.
Every spec has `kind`, `title` (under 90 characters) and an optional
`note` (a caption or source). The kinds:

| Kind | Data | Use it for |
| --- | --- | --- |
| `loop` | `steps:[{t, d}]`, 3 to 7 | a cycle: a core loop, a director |
| `stack` | `layers:[{t, d}]`, `taper?`, `arrow?` | ladders, layers, tiers, a message frame |
| `matrix` | `rows`, `cols` (2 or 3), `cells[row][col]` | comparing options on a few axes |
| `quad` | `x`, `y`, `points:[{t, x, y}]` in 0..1, `q?` (four quadrant names) | a 2×2 |
| `curve` | `x`, `y`, `series:[{t, pts:[[x, y]]}]` (1 or 2), `band?`, `beats?`, `alt` | pacing, difficulty, beat charts |
| `economy` | `nodes:[{id, t, type, row?}]` (source, pool, converter, sink), `edges` | sources and sinks |
| `state` | `states:[{id, t, d}]`, `edges:[[from, to, label]]`, `start` | states and transitions |
| `screen` | `aspect`, `regions:[{t, d, x, y, w, h, g?, kind?}]` in 0..1, `topics?` | an annotated screen layout: each region gets a number badge and a legend line; `g` draws a glyph of what it holds (the names are the `GLYPH` table in 87-diagrams.js), `kind:'world'` marks the play space. A label that does not fit its region is left to the legend. |
| `flow` | `steps:[{id, t, d}]`, `edges` (acyclic, all reachable) | a pipeline or decision tree |

Labels are short by design. When one does not fit, `node src/check-layout.js`
names it; reword it rather than widening anything. Order state-machine
states so transitions join neighbours (two columns, reading order), and use
an economy node's `row` to keep a flow from skipping over a row. A topic
with a hand-drawn diagram in `DIAGRAMS` (90-app.js) cannot also have a
`DIAGRAM()`.

Reference games carry their own `diagrams` (a loop for every game, a screen
layout for some) in `14-references.js`, and store art needs a developer
credit and an https store link (`GAME_ART_CREDITS`). A game with no Steam
page uses its publisher’s own store page, or a free-licensed image from
Wikimedia Commons, whose credit entry adds the licence and the source name
(`[author, url, licence, 'Wikimedia Commons']`) so the caption says both. Real
screens only (owner rule): after the store come the publisher’s press images,
including official screens republished by a news outlet (`licence:'press'`
with a `source`), then a games-database capture (`licence:'capture'`, source
`LaunchBox Games Database`); never a drawing or a generated stand-in. If no real
screen exists, the entry ships without one. The validator checks that every
image file exists and that press and capture credits name their source.
Schematics are our own drawings, for diagrams only.

Every game carries a full analysis (`ANALYSIS()` in `16-games-analysis.js` for the
games above, `GAME()` with the analysis inline in `17-games-japan.js`,
`18-games-innovative.js`, `18-games-casual.js` and `18-games-genres.js` for the rest): a `signature` (the
one idea worth stealing, 380 words or more in six parts), all ten `lens` entries,
and as many `shots` as its lenses need. Each lens is an analysis, not a description, written to
[docs/references/analysis-method.md](docs/references/analysis-method.md): a
`claim` someone could dispute, then `evidence`, `mechanism`, `effect`, `compare`,
`cost` and `principle`, an optional `context`, `topics`, and https `sources`;
150 words or more in all. A lens that truly does not apply is `na`, with a
paragraph arguing why. A shot is an official screenshot
from the game's store page, saved as WebP (150 KB is a guide; readability comes first) in
`assets/games/shots/`, attached to the lens it illustrates, with alt text, a
caption naming what to look at, and optional numbered callouts (x, y as
fractions of the image). A shot from anywhere else carries its own
`credit:{author, url, licence}`, with the licence from `IMAGE_LICENCES`
(store art, a named free licence, or `own` for our schematics; share-alike
images add `changed`). Image weight is budgeted per page, not per folder: every image is lazy-loaded, so validate.js reports what one route loads against a guide of 350 KB, or 1300 KB on a series page (header, shots and a series’ entry screens together) and the folder total. Lenses link
topics; the frame, the shelves and the lens-to-topic defaults are in
`14-references.js`, and the validator enforces all of it.

A long-running series is one `SERIES({...})` entry analysed across the whole
series: the same fields and ten lenses, read series-wide, plus `entries` (4 or more
defining entries `{t, short, year, platform, added, ref?}`, drawn as a timeline),
`constant` and `changed` (60+ words each), and `reception`: 3 or more entries
`{entry, year, verdict, evidence, why, src, ref?}` saying which entries built on
the same core game were praised or received badly and what each did
differently, with at least one of each side and sources for every verdict, and
a `receptionLesson`. At least half its entries (and four) carry
`shot:{img, alt, credit}`, a real screen of that entry, so the timeline shows how
the series looked as it evolved. A game analysed on its own carries
`series:{id, t, n}` and the series lists it with `ref`; the validator checks both
sides.

Library cards always crop the header to fill the card (`object-fit: cover`). When
the default centre crop cuts a logo or face, set `cardPos:'50% 30%'` (a CSS
object-position); when the header is far from the card shape (portrait, 4:3),
give `card:'assets/games/cards/<id>.jpg'`, a landscape image within 10% of
460:215 (for example 920x430) from the same store listing or press kit. The
game page keeps showing the full `img` header, and the header's credit covers
the card.

A game whose header is not store art credits it with `imgCredit:{author, url,
licence, changed?, alt}`. Top awards live in `GAME_AWARDS` in `14-references.js`
(ids from `AWARDS`: the four industry Game of the Year awards and the IGF grand
prize, each with the ceremony year and a source); they show on the game page
and fill the “Top award winners” shelf. The library has two shelves only, series
and award winners; genres and themes are family and tag filters.

### Platform guides

`PLATFORM('id', {...})` in `15-platforms.js` adds a guide at `#/platforms/id`:
`t`, `sub`, `short`, `kind` (`pc`, `console`, `mobile`, `open` or `ugc`),
`glance` (access, review gate, turnaround, for the comparison table; not
needed for `ugc`), and `stages` with every key its kind walks: the six in
`PLATFORM_STAGES` (access, build, cert, ratings, store, release), or for a
UGC platform the seven in `UGC_STAGES` (access, architecture, tools, rules,
money, publish, marketing). Each stage is `{points, facts?, diagram?}`; a
`diagram` is drawn above the points and checked by the layout checker. `points` describe the
process; anything that can change (fees, rules, deadlines, turnaround) is a
dated fact with its source, checked like topic facts. `nda` names what the
platform keeps under NDA; never guess NDA content. Every guide except `open` ones
needs a `flow` (a flow diagram from sign-up to release), and `topics` must
name real topics. `checklists:['id']` links the guide's submit or cert checklists (each of those names the platform back in its own `platforms`). The last stage (`release`, or `publish` for UGC) carries a
numbered `deploy` walkthrough of four or more steps `{t, d, shot?}` and five or
more interview items `iv:[{q, a, follow, red}]`; the validator requires both. A
portal screenshot comes from the platform’s own public documentation, credited
`licence:'press'` with its `source`, never from behind an NDA login.
`PLATFORM_NOTES` holds a short note, with a dated fact, for a channel too small
or too closed for a guide, or `excluded:true` with the reason.

### Engine and tool guides

`ENGINE_GUIDE('id', {...})` in `19-engines.js` adds a guide at `#/engines/id`:
`t`, `sub`, `short`, `kind` (`engine`, `web` or `tool`), `glance` (licence and
cost, languages, targets), all eight stages of `ENGINE_STAGES`, each with two or
more `points` (the interview stage has four or more `iv` items instead), a
`flow` from project to shipped build, and `topics`. Versions, prices and licence
terms are dated facts. Engine tabs inside topics stay Godot and Unity only.
Add a craft topic (`craft-game-loop-timestep`, `craft-physics-and-collision`, `craft-save-systems`, `craft-entities-and-scenes`, `craft-gameplay-math`, `craft-performance`, `craft-memory-and-gc`) to `topics` only where a stage of the guide really concerns it.

### Smells, tools and diagnostics

Add a smell to `SMELLS` in `12-diagnostics.js` with `causes[{c, top, exp}]`, where
`top` is a topic id. Tools and diagnostics are declared once in `05-registry.js`;
paths, the validator, the inventory and the layout check all read that list.
A tool is `[id, title, pitch, use this when, motivating topic id]`; `TOOL_GROUPS`
files every tool under one job (shape an idea, test an idea, systems, AI) and
`TOOL_START` marks the one to open first. The Build view, the left column on Make
and the validator read them. The "See it in games" row on a smell and the topic
chips at the top of the library are derived from the topics games list in their
lenses, so nothing is written by hand for them.

Prompt templates (`PROMPT_TEMPLATES`) carry `topics:['topic-id']`, one to three topics the prompt serves. Checklists (`CHECKLISTS`) carry `topics:[...]` (at least one) and, for a store submission, `platforms:['platform-id']`; the validator fails on a missing or unknown id and on a platform link that is not returned.

### Projects

Add a project with `CASE({id, t, code, sub, role, period, stack[], context,
arch[], decisions[{d,why,trade}], lessons[{what,lesson}], stories[{s,t,a,r}],
rel[[topic-id, why]]})` in `40-cases.js`. `t` and `code` are the project codename
(for example `Project S · Backend`) and `sub` is a descriptive subtitle. Two cases
may share a codename when they are two repositories of one product. Never write a
real company, product, colleague, host or credential name into a case: the
technique travels, the names do not.

- `SYSTEMS('case-id', [{id, t, kind, sum, stack[], iv[{q,a,follow,red}],
  parts[{id, t, what, how[], why, trade, rel[[topic-id, why]], links, story}]}])`,
  in the project's systems file. `kind` is one of `client, server, backend, data,
  infra, cicd, tooling, process` and picks the node colour. `iv` is exactly three
  likely questions. A project has 6 to 8 systems and each system 2 to 5 parts. A
  system id may not be `workflows`, `interview`, `flow` or `overview` (those are
  route words), and a part id starts with its system id and is unique in the
  project.
- `FLOWS('case-id', [{id, t, sum, steps[{id, t, d, sys}], edges[[from, to,
  label]]}])`: two to four charts per project, four to nine steps each. Edges form
  a directed acyclic graph in which every step is reachable from the first; keep
  edge labels to 12 characters or fewer.
- `PROJECT_INTERVIEW('case-id', {junior, mid, senior})`: ten to twelve
  project-level questions, at least two per level, consistent with the systems and
  parts already written.

### Learning paths

Add a path with `PATH('path-id', {...})` in `50-paths.js` or
`51-paths-engineering.js`. A path orders existing content and never duplicates
it; run `node src/inventory.js` first to see every id a step can reference. The
shape and rules are documented in the header comment of `50-paths.js` and
enforced by the validator: at least 4 stages and 3 steps per stage (about 6 and 8 as guides), at least one
tool or checklist step somewhere in the path (a stage holds one only when its `why` serves the stage goal; do not add one to fill a rule), a checkpoint on every stage, stage levels that
never go down (the first stage matches the path level and none rises more than one level), step minutes within 10% of the stage hours, and stage hours within
10% of the path hours. A topic step's optional `tab` (`godot`, `unity` or
`interview`) must exist on that topic. A `platform` step names a platform guide, and a `game` step names a reference game (`#/games/<id>`); a game step also shows on that game’s page under “Part of paths”.
Every path has a `pick` line under 60 characters for the door; every recall
question is `{q, a}` with a short answer outline; and every path in a `prereq`
or `prereqAny` must list this path in its own `next`. `prereq` means all of them; `prereqAny` (two or
more ids) means one of them is enough, and the chooser only names it as a good base for someone new to the path rather than sending them there first. If you add a path, place it in the
chooser's `CHOOSER.paths` table in `50-paths.js` where it fits; the validator
checks that every combination of answers still picks a real path.

Every topic, reference game, engine guide, platform guide and checklist must be
a step in at least one path: validate.js fails the build and names anything no
path reaches. A new game or topic therefore lands together with its path step, in
the stage where it teaches best, with the stage minutes kept within 10% of the stage hours.

**No cap cuts content** (owner, 2026-09-29). A number in this file is a
minimum, or a guide that only reports: going over a guide prints a `LONG` line
and never fails the build, and it is never a reason to cut (lens length, signature
length, shots, reception, series entries, image size and page weight all follow
this paragraph). Never shorten, drop or lower the quality of correct, sourced
content to get under a number; minimums still apply, and so does editing for
clarity. Restored or longer text must stay plain: length is earned by sourced
detail, not by jargon or padding.

## Writing style

Plain words, short sentences, active voice. Say what to do and why; no hype and
no filler. Present frameworks as lenses to test, not laws, and mark contested
ones as contested on the sources page. Anything that can change goes in dated
facts with a source.

Cross-links are built from data, never by hand. A tool, guide, checklist or prompt shows on a topic page when its own data names the topic; a page shows "Part of paths" when a path step names it. The sources page lists every dated fact's source in "Cited across the site". Search folds UK and US spelling in the index and in the query, so write UK spelling in text and either works when typing.
