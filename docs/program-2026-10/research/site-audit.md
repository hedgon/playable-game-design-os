# Site audit: structure, text walls, diagrams, interaction speed, navigation

Date 2026-10-05. Read-only audit of `playable.html` (built from `src/`), served at `http://localhost:8765`. Browser: Edge via Playwright. Viewports 1440x900 and 375x812 (mobile emulation, CDP CPU throttling 4x for the phone runs). Data rows (topics, games, paths) were read from `src/` with the same loader `src/inventory.js` uses.

Not repeated here (already measured): axe-core, html-validate over 22 routes, first paint 132-288 ms, 8.7 MB single file and the decision to split it, colours and fonts, map spacing.

Labels: **Confirmed** = measured or seen in this run. **Likely** = inferred from code or from one observation, not tested.

Measurement notes. "Words" are visible words inside `#app` (collapsed topic sections do not count unless I say "expanded"). "Longest prose run" is the most words in a row with no heading, list, table, figure, svg, button, input, details, chip or `.btn` in between (so a card full of paragraphs is one run). Characters per line were counted from the browser's own line breaks on paragraphs of 25+ words. The topic overview is measured with its URL ending `/overview`, because the chosen tab (`topicTab`) is sticky across topics and an earlier run landed on the Godot tab by mistake. Scripts and raw JSON are in the scratchpad `ux-audit/` folder.

---

## 1. Findings table

| ID | Area | Finding | Evidence | Sev | Status | Proposed fix |
|---|---|---|---|---|---|---|
| L1 | Load | Cold load blocks the main thread for seconds, and it grows with content. Interactive (DOMContentLoaded) is late even though first paint is early. | Cache off, 3 runs. Desktop: FCP 324-1432 ms, DCL 1479-2360 ms, long tasks sum 1.17-1.26 s, biggest single task 719-763 ms. Phone 4x: FCP 776-1328 ms, DCL 6.9-10.2 s, long tasks sum 6.3-9.4 s, biggest single task 4.0-6.0 s. Body is 8,530 KB uncompressed. | high | Confirmed | The split already decided is the fix. Add a budget to CI: boot script under 300 KB, no single task over 50 ms at boot on 4x CPU. Boot with ids, titles and tags only; load a topic's body when its page opens. |
| L2 | Search | The full-text index is built on the first typed letter, not on open. Opening is instant (16 ms) and shows an empty list; the first key then freezes the page. | `#/` any, Ctrl+K: open 16 ms. First key: one long task of 249-256 ms desktop (3 runs), 1,067-1,665 ms phone 4x. Keys 2-8: 12-30 ms desktop, 35-175 ms phone 4x. Code: `ensureIndex()` / `buildIndex()` in `src/90-app.js` (~line 2674) concatenates `what`, `why`, `how`, prompts, engine text, interview questions of all 211 topics. | high | Confirmed | Build the index at build time into a JSON file (and load it when search opens, or on hover/focus of the search button). Do not build it from topic bodies at runtime once bodies are split out. Fallback if it must stay runtime: build in `requestIdleCallback` after load, in chunks. |
| L3 | In-app navigation | Moving between pages is fast on desktop and acceptable on a phone. The slowness is load and search, not page changes. | Desktop 1440: first frame 35-99 ms for every route; longest task 120 ms (Hades). Phone 4x: biggest page (Zelda) first frame 416 ms, one task 331 ms; core-loop topic 277 ms frame, up to 929 ms to settle in one run. DOM is small: 700-3,000 elements per route. | low | Confirmed | No work needed beyond L1/L2. Re-measure after the split, because fetching a content file adds a wait on every page open: show the page head at once and fill the body. |
| L4 | Navigation render | DOM keeps changing for 200-300 ms after the first frame on several routes. | Settled (last mutation) 230-277 ms on paths door, 306/275 on topics, 267-273 on map domain, 215 on lens switch, 265 on library; first frame 35-99 ms. Cause not identified (a second render pass or a transition). | low | Likely | Find what writes the DOM late (glossary linking, make-jobs, transitions). Make the page final in one pass. |
| L5 | Shell | The map and the rail stay mounted on every route, hidden. | `#rail` 202 elements and `#mapsvg` 252 elements present at `#/review` with `railVisible:false`; they are 18-30% of the DOM on small pages. | low | Confirmed | Mount the map only when the map or a path map is on screen. |
| S1 | Landmarks | `<main id="app">` contains the entire shell: the rail (`aside#rail`, no accessible name, hidden on most routes) and `nav.subnav`. The rail is navigation, not complementary content. | Landmark dump at `#/paths`: `aside#rail in[main#app] name=-`; `nav.subnav in[main#app]`. | medium | Confirmed | `main` = page content only. Rail becomes `<nav aria-label="Concept index">` (or `Learning paths`) outside `main`. |
| S2 | Heading outline | Outline is not a hierarchy on the content pages. Topic: h1, then eight section headings as `h3` (no h2), sub-heads `h4`, then an `h2` "Related concepts" after them. Series game page: h1 then `h3` "What stays constant". Path page: h1, stages as `h3`, `h4`, then `h2` "Where to go next". | Heading sequence strings: topic `#/map/t/core-loop/overview` = `1 3 3 3 4 4 4 4 4 3 3 3 3 3 3 2 4`; Zelda `1 3 3 3 2 3 3 3 ...`; `#/paths/first-tiny-game` = `1 3 4 4 4 4 3 3 3 2`. (The `h1`-then-`h3` skip on path stages is already known; the rest is new.) | medium | Confirmed | Fix levels as part of the redesign: h1 page, h2 for each section (what, why, how...), h3 inside. Put "Related concepts", "Where to go next" at h2 with the sections. |
| S3 | Headings as prose | Lens headings are full sentences of 25-45 words. | `#/games/hades` `h3.lensclaim`: "Hades makes its gods compete for five ability slots, Attack, Special, Cast, Dash and Call, so taking one god's boon for a slot means refusing or replacing another's, and a build is a series of trade-offs rather than a pile of bonuses." Appears 10 times per game. Screen-reader heading list and the on-page jump list become unreadable. | medium | Confirmed | Short label as the heading ("Gameplay and systems", currently the `.overline`), the claim as the first sentence under it, bold. |
| S4 | Lists vs divs | A lens's seven-part template (Evidence, How it works, What it does to the player, Compared with, The cost, Principle) is seven `<p><b>Label.</b>` run-ins. Path stage steps are `div.pathsteps` > `label.pathstep` with a checkbox, not an `ol`. | `section.card.lenscard` markup (Hades); path page has 4 `ul`, 1 `ol` for 18 steps. | medium | Confirmed | Lens: `<dl>` or `h4` per part (the parts are what a learner scans for). Path steps: `<ol>` of `<li>` holding the label+checkbox, so "step 3 of 6" is announced. |
| S5 | Buttons vs links | Navigation done with buttons carrying `data-href`; search results are `div role=option`. They cannot be opened in a new tab, copied, or previewed. | Paths door intent list: `<button class="path" data-href="#/paths/first-tiny-game">`; topic prev/next: `<button class="btn" data-href=...>`; search `div.res[role=option][data-i]`. The skip control is `<button class="skip" id="skipBtn">`. | medium | Confirmed | Anything that navigates is an `<a href>` (styled as a button if needed). For search results keep the combobox pattern but render each option as `<a role=option>` or add `href`. |
| S6 | Click targets | Section toggles put the click handler on a non-interactive `header` (9 per topic page) beside the real `button.sec-btn`. | `clickDiv` count `HEADER.` = 9 on core-loop; `h3 > button.sec-btn` 9. | low | Confirmed | Keep one control. Use `<details><summary>` for the sections so the state, keyboard and find-in-page work without script. |
| S7 | Tables and figures | Tables are rare, so comparisons are in prose or card grids. Only 52 of 211 topics have a figure; 13 topics have a table. All 107 game pages have at least one figure. Paths: 0 figures. | `figure` count per page over 211 topics, 107 games, 22 paths. Techniques ("Techniques to compare", `.think-grid` of `.box`) are cards of four labelled lines, a table in content. | medium | Confirmed | Techniques and trade-offs as real `<table>` (rows: technique; columns: how it works, fits when, cost, instead), with a card layout on a phone. See section 2 for diagrams. |
| S8 | Diagram markup | Diagrams are already well built: `figure.dgm-card` with `figcaption`, svg `role=img`, `details` "Diagram as text". Keep this for every new figure. | `diagramCard()` in `src/90-app.js`; core-loop page has 1 `svg[role=img]`. | n/a | Confirmed | Reuse as the pattern for stepped animations (needs a play-all fallback to this text and a still final frame). |
| S9 | Focus | After a route change focus moves to the `h1` and the title updates (good). `#/map` is the exception: focus stays on `body`. | `document.activeElement` after hash change: `H1` on paths, path, game, topic, lab, explore; `BODY` on `#/map`. | low | Confirmed | Move focus to the map's `h1` too. |
| T1 | Text wall: games | A game page is 15 screens of prose. All ten "lens" cards are open, each 290-1,000 words, with no sub-headings inside, no figure per lens. | 107 game pages at 1440: visible words min 3,323, median 5,161, p90 7,177, max 8,336 (Zelda); 10.4-24.4 screens, median 15. Longest prose run: median 403 words, max 565; median 15 runs over 100 words per page, 3 over 200. Hades lens sizes 295-803 words, ended by a 803-word block; Zelda "What changes" is one 1,587-word section under one `h3`; its "Sources:" run is 535 words. Fold: median 171 words. | high | Confirmed | Lens cards closed by default behind their short label and claim (one `details` each, or a lens picker with 10 labels and one open). Keep the seven-part template as `h4`/`dl` inside. Move "Sources:" runs into a per-lens `details`. Put the "mechanism" figure (already there) above the lenses and add one comparison table per game. Target: under 2,000 words visible, 4-5 screens before the learner opens anything. |
| T2 | Text wall: topics | A topic is 5 screens of prose on a fixed 8-part template, with the AI, prompt and verify parts on every topic. Only a quarter of topics show anything except text. | 211 topics at 1440: default words median 1,474, p90 1,984, max 2,811; expanded median 1,653, max 3,128; screens 3.5-9.2, median 5.3; 19-20 headings. Fold (first screen) median 254 words. Longest run median 90, but 20 of 211 topics have a run over 150 words; worst: `craft-measuring-ai-uplift` 432, `craft-clean-code-ai-era` 306, `craft-security-review-of-generated-code` 285, `lead-junior-skill-formation-with-ai` 243, `craft-ai-orchestrates-tools-compute` 224. Three sections open by default (`openSecs` what, why, think). | medium | Confirmed | Split the long runs (steps or table). Make "AI" parts a single optional block per topic, not three headings on every topic (Likely: many topics have nothing topic-specific there). Put a figure or table into the first screen of every topic that teaches a structure or process (section 2). |
| T3 | Measure | Reading column is wider than the 45-75 character guidance on desktop and has no cap on utility pages. On a phone it is slightly narrow. | Characters per line at 1440: topics median 86 (p90 94, max 99); games median 90 (max 100); paths door intro 108; library 111; build/prompts/explore pages 143-156. Paths pages 45-55 (reading pane about 440 px). Phone 375: median 38, range 32-46. | medium | Confirmed | `max-width: 68ch` on prose containers, set once. Add a wider container only for tables and diagrams. Path reading pane: stop shrinking it below 60ch (see N4). |
| T4 | Glossary and sources | Reference pages are one long unstructured list. | `#/glossary`: 2,795 words, 10 screens, one heading (`h1`), 144 buttons, no letter groups. `#/sources`: 4,369 words, 656 links, 36 headings, 97 `details`. | medium | Confirmed | Glossary: letter headings and a filter, definitions as `dl`. Sources: already grouped; link it from each page's evidence instead of reading it as a page. |
| N1 | Paths door | On a phone the first screen contains no path choice. | 375x812 `#/paths`: `h1` at y 228, first paragraph 274, the chooser `h2` "Which path is for me?" at y 809 (below the 812 fold). The first screen is two intro paragraphs, a "First time here?" banner with Dismiss, "Progress is saved in this browser only" and a "Restore from a backup..." button. At 1440 the chooser starts at y 548. Screenshot `m-paths-top.png`. | high | Confirmed | Put the chooser (or the three most common routes) directly under the h1. Move the banner, the backup button and the storage note to the foot or to Settings (a first-time learner has nothing to restore). |
| N2 | Paths door | The same 24 paths are offered twice, and a third device (the 3-question chooser) sits on top of them. Whole page 2,253 words, 5.5 screens at 1440. | Sections: chooser (15 option buttons in 3 groups), "What do you want to be able to do?" (24 `button.path` intent cards, 531 words), then Design/Engineering/Production/Leadership/Interview prep (`a.card[data-path-card]` cards, about 1,400 words). The suggestion only appears after all three questions are answered ("Answer all three and one path is suggested"). | high | Confirmed | One decision, then one list. Keep the intent list ("I want to design games / program gameplay...") as the single entry (9 choices); show the 2-3 matching paths with hours and level; keep a compact all-paths list (title, level, hours; one line) behind it. Let a single answer narrow the list instead of requiring all three. |
| N3 | Path page layout | Desktop path page is three panes with the reading pane the narrowest. The same stage list appears three times (rail, map, stage cards). | 1440 `#/paths/first-tiny-game`: left rail 300 px (list of 24 paths again), centre map pane about 670 px mostly blank, right reading pane about 440 px with an h1 that wraps onto 4 lines at display size ("Never made a game? Make a tiny one"). Screenshot `path-page.png`. Reading pane 45-55 characters per line. | high | Confirmed | Default to the plain list (the learning-science doc already says the map is a view with a plain-list toggle). Content first: path h1, who it is for, stage list with progress, one visible next step. The map becomes an optional, collapsed overview. Hide the paths list rail inside a path. |
| N4 | Path chrome | Chrome above the content is tall and repeated. | 375: sticky topbar 116 px plus the path bar 44 px (20% of an 812 px screen) on every page while a path is active; `h1` at y 350 on the path page. 1440 on a topic opened from a path: sticky path bar 185 px plus topbar 75 px = 260 px (29% of 900). The global "Learning paths | Review" tabs also show above the h1 inside a path. | medium | Confirmed | One sticky line only (path name, "Step 3 of 6", Next). Task and Notes move into the page body. Remove the paths/review sub-navigation while a path is active. |
| N5 | Topic chrome | Four rows of controls before the first sentence. | `#/map/t/core-loop/overview` with a path active: topbar, path bar (with Notes, Next, Leave path, Your task), Map/List/Concept index strip, "Expand all/Collapse", Overview/Godot/Unity/Interview tabs; `h1` at y 375 at 1440 (240 without a path), 450 at 375, first paragraph y 445. Screenshot `topic-top.png`. | medium | Confirmed | Remove "Map/List/Concept index" from topic pages (it is the rail's job). Show only tabs that exist for the topic. Drop "Expand all/Collapse" once sections are `details` and fewer. |
| N6 | Vocabulary | Top navigation uses labels a first-timer cannot decode, and there are three overview pages. | Top bar: Paths, Map, Library, Make, Diagnose, AI Workflow, Projects (phone shows Paths, Map, Library, Make, Diagnose, More). `#/explore` ("Explore all domains"), `#/index` ("All pages"), `#/concepts` and the map's "Concept index" all list the same things. The `Review` tab on the paths page does not say what it reviews. | medium | Likely (labels judged from the screenshot, not tested with a learner) | Name by what the learner does: Learn (paths), Look up (map, library), Practise (make, diagnose, playtest). One index page. "Review" becomes "Review what you learned (3 due)". |
| N7 | Progress | Two unrelated progress counters on the same screen. | Top bar "Topics read 0/211" (marks a click), door and path cards "0%" (steps ticked). The learning-science plan wants recall-based progress. | low | Likely | Remove the global counter from the top bar, show progress only in the path and on topics. |
| M1 | Media | There is no video, audio or animated figure anywhere. | `video, iframe, audio` count 0 on every measured route; `img` 0 on topics, 3 (Hades) to 15 (Zelda) on games; no `<video>` or `<iframe>` in `playable.html` (grep count 0). | medium | Confirmed | See sections 2 and 3: stepped figures first, video for editor and profiler procedures only. |

---

## 2. Diagram and animation opportunities (top 25)

Basis: 159 of 211 topics have no figure at all. Candidates are topics (by id) with no `DIAGRAM()` today that teach a structure, a process or a time sequence. "Figure kind" uses the renderer in `src/87-diagrams.js` (loop, stack, matrix, quad, curve, economy, state, screen, flow) where one fits; "new" means the renderer needs a new kind (a timeline or sequence with steps). Rule applied: static by default; a stepped figure (Previous/Next, labelled steps, a final frame that stays, a play-all option, text equivalent under it) only where change over time is the idea. Source: `learning-science.md` sections 2.3 and 3.

### A. Change over time is the idea: stepped figure (previous/next)

| # | Topic id | Figure and what the steps show | Kind |
|---|---|---|---|
| 1 | `server-rollback-netcode` | Frame ruler 1..N. Step through: both peers sim frame k with predicted remote input; the real input for frame k arrives late and differs; rewind to k, resimulate to now. Second run: lockstep, the sim waits. The final frame shows the corrected state. | stepped timeline (new) |
| 2 | `craft-game-loop-timestep` | A frame-time accumulator bar. Each render frame adds elapsed time; fixed 16.7 ms steps run 0, 1 or 2 times; a slow frame shows the "spiral of death" cap. A slider for frame time is the one interactive control. | stepped timeline (new) |
| 3 | `server-state-sync` | Server snapshots at 20 Hz on one lane, client render at 60 Hz on another; interpolation between two snapshots with a 100 ms buffer; then client prediction and reconciliation after a correction. | stepped timeline (new) |
| 4 | `navigation-and-pathfinding` | A* on a small grid: open and closed set grow step by step, the route stays at the end; toggle to a navmesh with the same start and goal. | stepped grid (new) |
| 5 | `server-determinism` | Two machines, same inputs. One float add or hash-iteration order differs; the state diverges at frame k and the checksum compare flags it. Side by side. | stepped two-lane timeline (new) |
| 6 | `craft-physics-and-collision` | A fast bullet and a thin wall across fixed steps: it tunnels; then the swept (continuous) test catches it. | stepped (new) |
| 7 | `craft-memory-and-gc` | Frame-time strip: allocation per frame builds up, a GC spike hits a frame; the pooled version stays flat. | curve (frame time with beat markers) plus a 2-step reveal |
| 8 | `combat-design` (has a state diagram) | Upgrade the existing attack state diagram (warn, hit, recover) to stepped: a current-state highlight advances on Next. | state, stepped |
| 9 | `perception-and-awareness`, `server-matchmaking` (have state diagrams) | Same upgrade: step the state highlight through one encounter / one match search. | state, stepped |
| 10 | `game-feel-and-juice` | Same hit three times: bare, with hitstop, with shake and squash. Learner toggles each layer. Silent, no loop, no autoplay. Final frame has all layers. | explorable toggle |

### B. A structure or process: static figure

| # | Topic id | Figure | Kind |
|---|---|---|---|
| 11 | `progression` | Player power against enemy power over hours, with the three kinds (power, horizontal, mastery) as labelled lines or bands. | curve |
| 12 | `economy-modelling-and-balance` | Sources, a pool, sinks and one converter with rates; a table beside it. Later: a slider-driven 30-day stock curve (explorable). | economy (+ curve) |
| 13 | `backend-request-context` | The middleware chain as nested layers: request, auth, request id, idempotency, handler, response. | flow |
| 14 | `backend-data-access` | Layers (handler, service, query layer, DB) and one transaction boundary; delta-saving as a before/after pair. | stack |
| 15 | `infra-data-stores` | Primary with replicas, a cache, and shards; write path and read path in two colours. | flow |
| 16 | `infra-cdn-assets` | Client, CDN edge, origin; versioned URL, cache hit and miss paths. | flow |
| 17 | `server-anticheat` | Trust boundary: client claims, server validates, authoritative state; which checks live where. | flow |
| 18 | `craft-save-systems` | State to bytes, version stamp, write temp file, atomic rename; migration chain v1 to v2 to v3. | flow |
| 19 | `craft-entities-and-scenes` | A scene tree beside component tables (ECS) for the same scene of 3 enemies and a player. | matrix |
| 20 | `models-agent-harnesses` and `ai-agentic-implementation` | The agent loop: read, plan, tool call, observe, check, stop or repeat; where a human gate sits. | loop |
| 21 | `models-tokens-context` | Text, tokens, ids, and a context window with system, history, tools, space left. | stack |
| 22 | `goals-horizons` and `return-and-quit` | Three nested horizons (seconds, session, weeks) and a retention curve with the quit points marked. | stack, curve |
| 23 | `onboarding` | The first 30 seconds, 5 minutes and first session as a timeline with the beat markers (first action, first win, first choice). | curve (beats) |
| 24 | `monetisation-design` and `live-design-seasons-and-data` | Spend funnel (install, play, first purchase, repeat) as a tapering stack; a season calendar as a timeline with beats. | stack, curve |
| 25 | `learning-based-ai` | Agent, environment, reward loop, and where designers sit in it. | loop |

Also worth doing, not ranked: `craft-gameplay-math` (an easing and lerp curve set plus a dot-product picture), `audio-implementation` (sound, voice, bus, mixer, ducking), `prototyping`, `hypothesis-driven-design`, `iteration-and-evidence` (one loop: hypothesis, prototype, test, learn; three topics share it), `skill-and-mastery`.

### C. Video (procedural, screen-based or motion only; each with the same steps as text beside it, one idea, short)

| Topic id | Clip |
|---|---|
| `craft-performance` | Capturing and reading one profiler frame in the editor (screen recording). |
| `navigation-and-pathfinding` | Baking a navmesh and debugging a stuck agent in the editor. |
| `game-feel-and-juice` | A 60 fps A/B clip of one hit with layers off and on (also gives the timing a still cannot). |
| `craft-game-loop-timestep` (Godot/Unity engine tabs) | Where physics tick and render tick are set in each engine. |
| `prototyping` | Paper prototype of one loop played by hand (hand-drawn view). |

Everything in A that is "motion" is cheaper and better as a stepped figure than as a video; reserve video for the four rows above where the learner has to follow an interface.

Existing 52 diagrams: none animate. Do not add motion to those that are already clear (curves, matrices, quads, stacks).

---

## 3. Interaction performance

Method: Playwright with a `longtask` PerformanceObserver and a MutationObserver injected before load. Per action: **frame** = time from the action to the second animation frame after it; **settled** = time to the last DOM mutation (then 200 ms with no mutation); **long tasks** = count / total ms / longest ms of tasks over 50 ms during the action. 3 fresh page loads per viewport, median of 3 reported; max where useful. Localhost, no network time. Phone = 375x812 mobile emulation, CPU 4x. Navigations are `location.hash` changes (same path as a link click). Desktop first load of the search and typing figures are from a second run that measured each key separately.

| Action | Desktop 1440x900 frame / settled | Desktop long tasks (n / total / max) | Phone 4x frame / settled | Phone 4x long tasks (n / total / max) |
|---|---|---|---|---|
| Open search the first time (Ctrl+K or the search button) | 45 ms / 16 ms | 0 | 79 ms / 70 ms | 1 / 67 / 76 ms |
| First typed letter (index is built now) | 250-257 ms (3 runs) | 1 task 249-256 ms | 1,067-1,665 ms | 1 task 1,066-1,665 ms |
| Later letters (letters 2-8 of "rollback") | 12-30 ms each | 0 (one 76 ms in 1 of 3 runs) | 33-175 ms each | up to 111 ms |
| Whole word typed at 40 ms a key (includes the first-letter build) | settled 872 ms (320 ms is key delay) | 1 / 357 / 563 | settled 2,537 ms | 5 / 2,118 / 1,779 |
| Second query typed (index warm) | settled 467 ms (280 ms is key delay) | 0 | settled 716 ms | 3 / 189 / 189 |
| Open path page `gameplay-engineer-godot` (from the paths door) | 66 ms / 204 ms | 0 | 96 ms / 253 ms | 2 / 158 / 176 |
| Open path page `first-tiny-game` | 48 / 34 ms | 0 | 155 / 142 ms | 1 / 100 / 100 |
| Paths door (from a path) | 59 / 277 ms | 0 (50 ms in 1 run) | 121 / 297 ms | 1 / 217 / 265 |
| Open a big game page (Hades, 3,000+ px of lenses) | 86 / 70 ms | 1 / 65 / 120 | 174 / 162 ms | 1 / 136 / 180 |
| Open the biggest game page (Zelda, 8,336 words) | 66 / 44 ms | 0 | 416 / 244 ms | 2 / 359 / 331 |
| Open a topic (`core-loop`) | 74 / 306 ms | 1 / 62 / 68 | 277 / 513 ms (max 929) | 3 / 347 / 486 |
| Open the biggest topic (`economy-modelling-and-balance`) | 44 / 275 ms | 0 | 221 / 392 ms | 2 / 202 / 172 |
| Open the map with a domain open (`#/map/d/core`) | 35 / 273 ms | 0 | 275 / 389 ms | 2 / 216 / 190 |
| Open the map with another domain (`#/map/d/server`) | 41 / 267 ms | 0 | 69 / 294 ms | 2 / 119 / 101 |
| Switch map lens (`[data-action=lens]`) | 59 / 215 ms | 0 | 129 / 342 ms | 1 / 82 / 101 |
| Library (games index) | 99 / 265 ms | 1 / 64 / 78 | 297 / 405 ms | 1 / 214 / 252 |

Cold load (cache off, 3 runs): see finding L1. Desktop DCL 1.5-2.4 s with 1.2 s of long tasks; phone 4x DCL 6.9-10.2 s with 6.3-9.4 s of long tasks.

Reading the table:
- Only two things are slow: the load (L1) and the first search keystroke (L2). Every other action finishes in under 100 ms to the first frame on desktop and under 430 ms on a phone at 4x.
- "Settled" values of 200-300 ms next to a 40-90 ms first frame mean the DOM keeps changing after the first frame (L4). It is not a long task, so it does not block input.
- Page weight in DOM terms is small (700-3,000 elements), so reducing DOM is not the lever. Reducing the work done before the first interaction is.

---

## 4. Set aside (considered and rejected or left out)

| Item | Reason |
|---|---|
| Colours, fonts, contrast pairs | Out of scope; recently redesigned; contrast already measured (5 pairs below 4.5:1). |
| Map spacing and node layout | Separate task. |
| axe-core / html-validate items (heading order on path stage cards, two pages without h1, 37 `div` in `span` on `#/lab`, buttons without type, unnamed `#rail`) | Already measured. I only added what they did not cover (S1-S7). The unnamed `#rail` is the same object as S1. |
| File size and the split into content files | Decided; not re-argued. I only added what the split must not break (L2, L3). |
| "DOM is too big, so pages are slow" | Rejected: 700-3,000 elements per route and no long task over 120 ms on desktop for page changes. |
| Virtualising long pages | Rejected: cost is not in rendering the page; the fix is to show less by default. |
| Replacing the topic tabs (Overview, Godot, Unity, Interview) with one scrolling page | Not recommended without data: tabs hold engine and interview content that most readers do not need. Only the stacking of control rows (N5) is a problem. I did not verify `aria-controls` on the tab buttons. |
| Autoplay, looping or decorative motion in the reading column | Not found in the pages measured (no video; I did not audit CSS animations). The rule stays. |
| Animating the 52 existing static diagrams | Rejected: curves, matrices, quads and stacks are not about change over time. Only three state diagrams (rows 8-9) are worth stepping. |
| Video for concepts (trade-offs, definitions, checklists) | Rejected by the learning-science rule 7; text beats video there. |
| Making all 8 topic sections `details` and closed | Considered; not enough evidence that closing helps. Keep three open (what, why, think) and measure. |
| Heading skips and landmarks on utility pages (checklists, prompts, build, lab) | Not measured beyond word counts and h1. They share the shell, so S1 and S2 cover the pattern. |
| Content correctness of any page | Out of scope. |
| Search result quality | Not measured; only speed. |
| A learner test of the navigation labels (N6) | Not possible here. N6 is a reading of labels and screenshots, marked Likely. |
| Real network throttling | Out of scope: localhost only. The 8.5 MB body is served uncompressed here; the gzipped size is already known (2.8 MB). |
| Hidden rail/map nodes (L5) as a cause of slowness | Kept as a low finding only; measured at 202 + 252 elements. |
| Keyboard navigation of the paths door chooser | Buttons with `aria-pressed` inside `role=group aria-labelledby` look correct (read from the DOM); not tried with a keyboard. |

---

## 5. Evidence files

In the scratchpad `ux-audit/` folder: `structure.json` (402 route measurements; topic rows in it are polluted by the sticky Godot tab, do not use), `topics-ov.json` (211 topics default and expanded at 1440, 43 at 375), `rerun.json` (corrected longest-run numbers for 107 games, 6 paths, 211 topics), `perf.json`, scripts `perf.js`, `perf-search.js`, `load.js`, `fold.js`, `sticky.js`, `sem.js`, and screenshots `paths-top.png`, `paths-mid.png`, `path-page.png`, `path-page2.png`, `game-top.png`, `game-lens.png`, `topic-top.png`, `m-paths-top.png`, `m-path.png`. Topic table (id, domain, diagram kind, words, title) is `topics.tsv`.

## 6. Judgment calls / deviations

- Changed my own "longest prose run" rule once: the first version treated every `.card` and `.box` as a break, which hid the lens text (it reported 17 words for game pages). The numbers above come from the corrected rule (breaks only on headings, lists, tables, figures, svg, buttons, inputs, details, chips and `.btn`). Cost if wrong: run lengths on card-heavy pages could be a little high or low; the 290-1,000 word lens sizes were checked separately by counting words between headings.
- Chose medians of 3 runs for performance; the maximum is shown where it differs a lot. Cost if wrong: a one-off slow run is not in the median.
- Chose the opportunity list from topic titles, first sentences and keyword checks (`accumulator`, `reconcil`, `interpolat`, `A*`, `hitstop` found in the source), not by reading all 211 topics. Cost if wrong: a topic may already explain the idea in text well enough, or a better candidate exists. Rows 1-6 are the most certain.
