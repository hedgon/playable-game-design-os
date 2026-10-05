---
status: shipped
updated: 2026-10-05
---

# Splitting the one-file site: design

## Measured baseline (2026-10-05, before any change)

| Measure | Value | How |
| --- | --- | --- |
| `playable.html` | 8,734,466 bytes; 2,844,545 gzipped | `wc -c`, `gzip -c` |
| What it holds | game analyses 3.5 MB, topics 2.9 MB, paths 0.54 MB, projects 0.31 MB, platforms 0.13 MB, engines 0.12 MB (JSON size of the evaluated data); CSS and shell 121 KB; app code about 0.5 MB | `inv.js` over the evaluated data |
| First contentful paint, localhost, 1440 px | 288 ms (`#/paths`), 132 ms (`#/map`) | Playwright + Edge, `performance` paint entries |
| Main-thread task time to load, 1440 px | 591 ms (`#/paths`) | CDP `Performance.getMetrics` TaskDuration |
| Same at 375 px with 4x CPU throttle | 1,957 ms task time, layout 455 ms, style 348 ms | same |
| JS heap after load | 14 MB | same |

Every visit downloads 2.8 MB gzipped before anything renders, whatever the page, and
every content edit invalidates the whole file in the browser cache. On localhost the
parse is fast; on a phone over a mobile network the transfer dominates: at 10 Mbit/s
the file alone takes about 2.3 s, at 1.6 Mbit/s ("slow 4G" in Lighthouse) about 14 s.
The cost grows linearly with every game and topic added.

## Options considered

| Option | First load as content grows | Per-page cost | Map beside reading | `file://` offline | Work |
| --- | --- | --- | --- | --- | --- |
| A. Keep one file | grows linearly (now 2.8 MB gz) | everything | yes | yes | none |
| B. App shell + content files on demand | small and nearly flat (an index of titles and links grows ~0.2 KB per item) | the page's own file | yes | yes (script tags load from `file://`; `fetch` would not) | large refactor of data loading and the router |
| C. One pre-rendered HTML file per page | small | the page | no: every click reloads the map | yes | rewrite most of the app |
| D. B plus pre-rendered static pages | as B | as B | yes | yes | B plus a renderer at build time |

Owner (2026-10-05): "pick the option that will be scalable in the future, I don't mind
large refactor". Chosen: **B**, built so D can be added later (the view functions already
return HTML strings from data, so they can run at build time).

## Design of B

- **Source format unchanged.** Authors keep writing `T()`, `GAME()`, `PATH()` and the
  rest in `src/`. The validator and checks keep evaluating all of it.
- **The build becomes a content compiler.** It evaluates the data once, splits each
  entity into a light part (what lists, the map, links and progress read across the site)
  and a heavy part (what only that entity's own page reads), and writes:
  - `playable.html`: CSS, the shell, the app code and the light index of every entity;
  - `content/<kind>/<id>.js`: one file per entity's heavy part, which calls
    `PlayableContent.put(kind, id, {...})`;
  - `content/search/*.js`: the search index, pre-tokenised at build time, loaded on the
    first search.
  Each URL carries `?v=<content hash>` from a manifest in the shell, so the browser cache
  keeps every unchanged file across releases and drops only what changed.
- **Loading.** `PlayableContent.need(kind, id)` adds a `<script>` for the file once and
  resolves when it has merged the heavy fields into the light object, so the existing
  view code keeps reading `TOPICS[id].what` as before, after the router awaits the
  route's needs.
- **Router.** `route()` works out what the route needs, awaits it (a short loading state
  if it takes longer than ~150 ms), and drops the result if the reader has moved on. Pages
  that list many entities read only light fields; a list that truly needs a heavy field
  across all entities gets a light field derived at build time instead.
- **Which fields are light** is decided by measurement, not by reading the code: an
  instrumented build wraps every entity in a Proxy, a crawler visits every route reachable
  from the site, and each field read is recorded as read on its own page ("self") or on
  another page ("other"). A field read anywhere as "other" is light or gets a derived
  light field. Results below.
- **Checks.** CI compares the whole build output (`playable.html` and `content/`) with the
  committed files. `smoke.js` and `e2e-paths.js` wait for the app's "settled" signal
  instead of fixed timeouts where content loads. The layout check evaluates the data from
  `src/` as it does now.

## Field-read trace (2026-10-05)

Instrumented build (Proxy on every topic, game, path, project, platform, engine and
comparison), crawled breadth-first from `#/map`, `#/paths`, `#/games` and `#/index` over
every `#/` link and `data-href` on each page: **2,363 routes, 0 page errors**, plus one
search. "Other" means the field was read on a route that is not the entity's own page.

| Kind | Read only on its own page (heavy) | Read on other pages (light, or a derived light field) |
| --- | --- | --- |
| topic | `what why think how ai prompts verify test tech eng go iv facts worked diagram` | `id t d tag rel`; `diagram` on a domain's list page (one topic per domain, `DOMAIN_DIAGRAMS`); `facts` on Sources (cited list); `think` on AI philosophy; `iv` of neighbouring topics on an interview tab |
| game | `first30 minute why complaints lesson misses verb want signature lens shots reception constant changed store dev imgCredit art*` | `id t kind family tags genre year img card cardPos series entries`; `lens` (only which topics each lens names: "See it in games", map leaves, game chips); `signature` (only `idea`, on library cards); `diagrams` (loop step count and titles at boot); `want dev` on the dissection tool |
| path | stage and step text (`why do check solution`), `outcome next audience` | `id t tag track level hours pick prereq prereqAny`; `stages` (ids, titles and step references: "Part of paths" on every page, progress, the path map) |
| project | `context arch decisions lessons stories iv` and part text | `id t sub code role period stack`; `systems` and `flows` (ids, titles, kinds, part ids, titles and `rel`: the project map and practice links on topic pages) |
| platform, engine | `stages flow nda checklists` | `id t sub short kind glance topics`; `stages` facts on Sources |
| comparison | `sections verdict principle sources topics` | `id t games problem` |
| all | | every text field when the search index is built |

So the split is: light fields as listed, plus four derived light fields built at build
time (`lensTopics` per game, `idea` per game, the step references of each path stage,
the cited-source list for Sources), the domain-page diagrams and the AI-philosophy topic
fields loaded on those routes, and a pre-built search index.

## Result (P2, 2026-10-05)

What shipped differs from the design above in four measured ways:

- Smells, checklists and prompt templates are split too (a second trace, with those
  lists wrapped, showed their long fields are read only on their own pages). The
  glossary stays whole: its definitions are read on the one glossary page.
- A topic keeps only the ids of its `rel` links; the reasons go to its file, and each
  topic's file also carries `relIn`, the reasons other topics give for linking to it,
  which the map shows on the selected topic's leaves.
- The page drops data bindings its scripts never reach (registration helpers,
  build-only tables), ships its scripts and stylesheet without whole-line comments
  (an acorn token comparison proved the stripping removes comments only), parses
  large values with `JSON.parse`, and runs each part as its own `<script>`.
- Search is two files: a head (titles, synonyms, snippets) that answers at once and
  a body (each entry's words, deduplicated with counts) that follows.

| Check | Result |
| --- | --- |
| Lossless split | every entity: light merged with content equals the original (build check) |
| Golden master, old single file vs new split, 1440 px | 2,363 routes empty and 2,414 after using the app: h1, visible text, links and rail identical on every route; 0 page errors on either build; map node counts equal on every route once animations settle (55 differed mid-animation) |
| Search, 30 queries | first results identical; 3 queries differ lower down, because the new index counts every repeat of a word (the old count missed adjacent repeats) |
| Text-fit sweep | measures 1,770 map states in the page, equal to the sources' map states (the build's 1,779 adds 9 workflow charts) |
| smoke.js | 269 route visits (same as before), 0 failures |
| e2e-paths.js | 105/105 |
| `file://` | a game, a topic, a path, Sources, Checklists and a search all load from disk |

Performance (Edge, cache disabled, median-ish single runs; the machine was also running writer agents):

| Measure | Old single file | New | Target |
| --- | --- | --- | --- |
| `playable.html` gzipped | 2,844 KB | 292 KB | 300 KB (met; enforced by the build) |
| Phone 4x CPU, slow 4G: page drawn | 48.4-48.9 s | 7.2-8.7 s | |
| Phone 4x CPU: page drawn | 4.5-6.1 s | 1.7-4.0 s | under 2 s from DOMContentLoaded (met on #/paths; not on topic and game pages, where the map's first paint is the cost) |
| Phone 4x CPU: longest task | 1.9-3.4 s | 0.4-1.2 s | under 200 ms (not met; see below) |
| First search keystroke, longest task, phone 4x | 3.4 s | 62-77 ms | under 100 ms (met) |
| Desktop: longest task | 256-373 ms | 99-211 ms | |

Not met, and why: a CPU profile of a phone load shows the remaining long task is
the first layout of the page and the map's SVG (style and layout of a few thousand
elements), not script. Two forced layouts were removed on the way (the map's
"more" cue read layout on every frame; every page reset its scroll even at the
top). Getting under 200 ms needs the map's first paint deferred or slimmed on
phones, where the map sits behind the reading pane: a follow-up, not done here.
