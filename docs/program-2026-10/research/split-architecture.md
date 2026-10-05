---
status: draft
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
