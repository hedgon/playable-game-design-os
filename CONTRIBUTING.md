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
| `check-layout.js` | Every map state (both lenses, desktop and one-sided phone layouts, open topics, projects, paths, workflow charts) is laid out and checked for overlapping cards. Every diagram (topics, reference games, the content-or-mechanic tree) is laid out as the page draws it and fails on touching boxes, a box outside the canvas, a label that does not fit, or a canvas too wide for a phone. `--list` prints any map label that had to be shortened. |
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
pane, or a narrow-screen pane rule that is not met. It needs Playwright, which is
not a dependency of the guide:

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
19-engines.js             engine and tool guides: ENGINE_GUIDE(), ENGINES, the eight stages
20-topics-player.js       one file per domain, in map order: the domain, then each topic
  ...                     with its TECH, ENGINE, INTERVIEW and FACTS
39-topics-platforms.js
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
91-map.js                 the map view: lenses, camera, pan, zoom, keyboard, reading panels
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
(`[author, url, licence, 'Wikimedia Commons']`) so the caption says both. Only
when neither exists does a game get an original drawn tile (`drawn:true`, a
file in `assets/games/drawn/`), captioned as our drawing, never passed off as
official art. The validator checks that every image file exists. Schematics are our own
drawings.

Every game carries a full analysis (`ANALYSIS()` in `16-games-analysis.js` for the
games above, `GAME()` with the analysis inline in `17-games-japan.js`,
`18-games-innovative.js` and `18-games-casual.js` for the rest): a `signature` (the
one idea worth stealing, 380 to 700 words in six parts), all ten `lens` entries,
and up to four `shots`. Each lens is an analysis, not a description, written to
[docs/references/analysis-method.md](docs/references/analysis-method.md): a
`claim` someone could dispute, then `evidence`, `mechanism`, `effect`, `compare`,
`cost` and `principle`, an optional `context`, `topics`, and https `sources`;
150 to 380 words in all. A lens that truly does not apply is `na`, with a
paragraph arguing why. A shot is an official screenshot
from the game's store page, saved as WebP under 150 KB (aim for 40 KB) in
`assets/games/shots/`, attached to the lens it illustrates, with alt text, a
caption naming what to look at, and optional numbered callouts (x, y as
fractions of the image). A shot from anywhere else carries its own
`credit:{author, url, licence}`, with the licence from `IMAGE_LICENCES`
(store art, a named free licence, or `own` for our schematics; share-alike
images add `changed`). All of `assets/` has a 10 MB budget. Lenses link
topics; the frame, the shelves and the lens-to-topic defaults are in
`14-references.js`, and the validator enforces all of it.

A long-running series is one `SERIES({...})` entry analysed across the whole
series: the same fields and ten lenses, read series-wide, plus `entries` (4 to 9
defining entries `{t, short, year, platform, added, ref?}`, drawn as a timeline),
`constant` and `changed` (60+ words each), and `reception`: 3 to 7 entries
`{entry, year, verdict, evidence, why, src, ref?}` saying which entries built on
the same core game were praised or received badly and what each did
differently, with at least one of each side and sources for every verdict, and
a `receptionLesson`. A game analysed on its own carries `series:{id, t, n}` and
the series lists it with `ref`; the validator checks both sides.

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
name real topics.

### Smells, tools and diagnostics

Add a smell to `SMELLS` in `12-diagnostics.js` with `causes[{c, top, exp}]`, where
`top` is a topic id. Tools and diagnostics are declared once in `05-registry.js`;
paths, the validator, the inventory and the layout check all read that list.

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
enforced by the validator: 4 to 6 stages, 3 to 8 steps per stage, at least one
tool or checklist step per stage, a checkpoint on every stage, stage levels that
never go down, step minutes within 10% of the stage hours, and stage hours within
10% of the path hours. A topic step's optional `tab` (`godot`, `unity` or
`interview`) must exist on that topic. A `platform` step names a platform guide, and a `game` step names a reference game (`#/games/<id>`); a game step also shows on that game’s page under “Part of paths”.
Every path has a `pick` line under 60 characters for the door; every recall
question is `{q, a}` with a short answer outline; and every path in a `prereq`
must list this path in its own `next`. If you add a path, place it in the
chooser's `CHOOSER.paths` table in `50-paths.js` where it fits; the validator
checks that every combination of answers still picks a real path.

## Writing style

Plain words, short sentences, active voice. Say what to do and why; no hype and
no filler. Present frameworks as lenses to test, not laws, and mark contested
ones as contested on the sources page. Anything that can change goes in dated
facts with a source.
