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
| `check-layout.js` | Every map state (both lenses, desktop and one-sided phone layouts, open topics, projects, paths, workflow charts) is laid out and checked for overlapping cards. `--list` prints any label that had to be shortened. |
| `check-contrast.js` | Every text colour pair in both themes, including map labels on every domain tint, reaches 4.5:1. |
| syntax | The bundle and each source file parse. |
| actions | Every `data-action` in the markup has a handler in `ACTIONS`. |

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

CI (`.github/workflows/build.yml`) runs the build, the `playable.html` sync check,
the type check and the smoke test on every push and pull request.

## Source files

```
01-head.html              CSS and the page shell (header, dialogs, toast)
05-registry.js            ids declared once: TOOLS, DIAGNOSTICS, LENSES, VIEW_LINKS
10-schema.js              JSDoc types, DOMAINS, TOPICS, section titles, and T, TECH, ENGINE, INTERVIEW, FACTS
12-diagnostics.js         smells, fun dimensions, core-loop and unfairness diagnostics
13-ai-workflow.js         AI roles, failure modes, responsibility matrix, loop steps, prompt templates, checklists, feature tree
14-references.js          the reference library of dissected games
20-topics-player.js       one file per domain, in map order: the domain, then each topic
  ...                     with its TECH, ENGINE, INTERVIEW and FACTS
38-topics-leadership.js
40-cases.js               the three anonymised projects: CASE, SYSTEMS, FLOWS, PROJECT_INTERVIEW
41-case-systems-a.js      systems and parts of each project
42-case-systems-b.js
43-case-systems-c.js
50-paths.js               PATH, PATHS, TRACKS, LEVELS, step titles and links; design, leadership and interview paths
51-paths-engineering.js   engineering-track paths
88-flow.js                workflow chart renderer
89-graph.js               tidy-tree mind-map layout and rendering (topic map, project map, path map)
90-app.js                 router, views, tools, search, review queue, dialogs, saved data
91-map.js                 the map view: lenses, camera, pan, zoom, keyboard, reading panels
92-ideas.js               Reference Dissection
93-lab.js                 Idea Lab
99-tail.js                boot
manifest.js               ordered file list
build.js                  build and checks (above)
validate.js, check-layout.js, layout-core.js, check-contrast.js, inventory.js, smoke.js, serve.js
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
  APIs named in `api[]`. Topics in the `management` and `leadership` domains must
  not carry `eng`; every other topic needs it.
- `INTERVIEW('topic-id', {junior:[...], mid:[...], senior:[...]})` adds the
  Interview tab: six to ten questions in total, at least one per level, each
  `{q, a, follow, red}` (question, model-answer outline, expected follow-up,
  red-flag answer). The reader's own answer is never part of the data; the app
  saves it in `localStorage` under `story.<topicId>`.
- `FACTS('topic-id', [{claim, asOf, src}])` adds dated facts for anything that
  can change by next year: store rules, laws, rulings, prices. `asOf` is the day
  you checked the claim against `src` (`YYYY-MM-DD`), and `src` is an `https`
  link to the source. The validator warns, and never fails, once a fact is a year
  old, and prints the line to recheck. Principles stay in the eight parts; only
  the changing details go here.

A new domain is a new file with `DOMAINS.push({ id, lens, t, short, color, sum,
links })`, where `lens` is `design` or `eng` (see `LENSES`), plus a line in
`manifest.js` and a `--d-<id>` colour token in `01-head.html`. The contrast check
covers the new tint automatically.

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
`interview`) must exist on that topic.

## Writing style

Plain words, short sentences, active voice. Say what to do and why; no hype and
no filler. Present frameworks as lenses to test, not laws, and mark contested
ones as contested on the sources page. Anything that can change goes in dated
facts with a source.
