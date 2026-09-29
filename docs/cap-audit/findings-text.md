# Text and display audit (A4 to A8)

Read-only audit at HEAD e28d102. Scripts and raw outputs stayed in the session scratchpad (not committed).

Headline: no text was found that is provably still lost, because the cap-driven trimming happened before the text was committed, so git holds almost no trace of it. The evidence that caps shaped the writing is statistical (section 2, F1 to F4), not a removed sentence. There are no high-severity rows. Medium rows are candidates for a targeted spot check, not confirmed losses.

## 1. Caps inventory (A4)

Kind: H = hard (fails the build or cannot be exceeded), S = soft (LONG line, since 066431c), D = display only.
"Hides?" = can the number cut or hide text a reader would otherwise get.

### validate.js (all soft since 066431c)
| file:line | limits | kind | hides? |
| --- | --- | --- | --- |
| validate.js:34 (`count`) | diagram list sizes: loop steps 7 (:42), stack layers 6 (:43), regions 9 (:76) | S | no (pushes to `longs`); but check-layout still enforces label fit, see below |
| :39 | diagram title 90 chars | S | no |
| :155 | engine snippet 900 chars (CONTRIBUTING:135 also says 15 lines, not enforced) | S | no |
| :168, :536 | topic iv 10 questions; project iv 12 | S | no |
| :199 | signature 700 words | S | no, but shaped writing (F4) |
| :213 | lens 380 words | S | no, but shaped writing (F4) |
| :225, :342 | lens and guide shot image 150 KB | S | image audit |
| :230 | game shots 4 (no game has more than 3) | S | no |
| :246 | series entries 9 | S | see F3 |
| :253 | series entry shot 40 KB | S | image audit |
| :263 | reception 7 | S | see F3 |
| :320 | 350 KB of images per route | S | image audit |
| :430, :446, :475, :483 | project systems 8, parts 5, flows 4, flow steps 9 | S | no |
| :559 | path `pick` under 60 chars | S | no |
| :568, :579 | path stages 6, steps 8 | S | no |
| :586 | step minutes 60 | S | no |
| :616, :620, :626, :629 | review topics 2, recall questions 4, recall answer 420 chars, skip questions 5 | S | recall/skip lists sit at the cap (F13) |
| :596 | no more than 4 consecutive topic steps from one domain | H (error) | forces a mix, does not cut text |
| :615, :635 | stage minutes must sum to stage hours within 10%; stage hours to path hours | H (error) | adding a step forces trimming minutes elsewhere; indirect pressure |

### check-layout.js / layout-core.js / renderers (the hidden hard cap)
| file:line | limits | kind | hides? |
| --- | --- | --- | --- |
| check-layout.js:14-19, 87-diagrams.js:18-19 | any diagram label that needs an ellipsis fails the build ("cut") | H | yes: forces authors to shorten diagram titles and descriptions (F7). Currently 0 shortened labels, 210 diagrams |
| 87-diagrams.js:34-49 `wrap`, :53-54 `card` (title 2 lines, description 2), :124 (state description 1), :166 (stack 3), :176-181 (matrix header 2, row 3, cell 4), :195, :199, :214 (quad/curve labels 2) | max lines per label, then "…" | H via check-layout | same as above; full text exists under "Diagram as text" (90-app.js:693) so reader loses nothing when it does fit; only authors are constrained |
| 87-diagrams.js:441 `MAX_W` 420 | widest canvas | H | no |
| 88-flow.js:47-54 | flow step title 2 lines, second line ellipsis | H via check-layout | node `<title>` carries `d`; full titles not repeated in a text list for flows drawn outside `diagramCard` |
| 89-graph.js:28 `SIZE` + :38-46 `wrap` | map labels now wrap, never cut (owner 2026-09-29) | none | no |
| 89-graph.js:31, :147 `cut(n.sub, ...)` | project-map sub-label ellipsis | D | latent: no ellipsis drawn today (checked 10 routes) |
| 89-graph.js:190 `.slice(0, 4)` | smells shown on a selected topic in the map | D | yes for 2 topics (F8) |

### 90-app.js
| line | limits | kind | hides? |
| --- | --- | --- | --- |
| 187, 2082 | recent pages 8 / 5 | D | no (history list) |
| 885 | "In real games" strip: 6 chips, rest in `<details>` "N more" | D | no, expands |
| 1150 `wrapName` | systems-builder node: 3 lines, 12 chars per line, "…" | D | user-typed names only; full name in the selects and lists (F10) |
| 1160 | collision questions `pairs.slice(0,8)` | D | yes, remaining pairs only counted (F10) |
| 1459 | prompt card `p.p.slice(0,140)+'…'` | D | card links to full prompt; "…" also added when not cut (all 17 prompts are longer than 140) |
| 1531 | case card `context.slice(0,180)`, `stack.slice(0,5)` | D | card links to the full project |
| 1843 + 01-head.html:262 `.clamp2` | path card "For ..." audience clamped to 2 lines | D | 12 of 21 cards clamped; full text on path page (:1943) (F9) |
| 2015, 2017, 2019 | search snippet slices 100 / 110 / 90 chars + "…" | D | result links to the page |
| 2069 | search: `slice(0, 80)` across all groups | D | yes, no path to the rest (F1) |
| 2094-2097 | per-group 6 rows, "Show all N" | D | expands only up to what survived the 80 cap |
| 91-map.js:26 | symptom buttons plus "All N smells" link | D | no |
| 01-head.html:1033 `.pathbar-info` | ellipsis, one line | D | content is repeated on the path page |
| 01-head.html:749 `.lbcap` | max-height 18vh with scroll | D | scrolls, no loss |
| 01-head.html:742, :774 | `.entryshot img` max-height 180px; `.shotframe img` 78vh/640px | D | image crop, see image audit |

### CONTRIBUTING.md / docs
| file:line | limit | note |
| --- | --- | --- |
| CONTRIBUTING.md:135 | snippet 15 lines / 900 chars | 15 lines not checked anywhere |
| :160 | diagram title under 90 | |
| :199-206 | signature "about 700 as a guide"; lens "about 380 as a guide"; "usually up to four shots"; shot "about 150 KB" | worded as guides |
| :212 | 350 KB per route "guide" | |
| :219 | `reception`: "3 to 7 entries" | still reads as a range with a ceiling (F6) |
| :294 | flow edge labels 12 chars or fewer | not in validate.js; check-layout only |
| :305-310 | 6 and 8 as guides, pick under 60 | |
| :321-324 | "No cap cuts content" rule | good |
| docs/references/analysis-method.md:40 | "Target 150 to 330 words per lens" | contradicts the 380 guide; stricter than any code path (F5) |

## 2. Findings

| id | file:line and item | problem | evidence | severity | recommended fix |
| --- | --- | --- | --- | --- | --- |
| F1 | 90-app.js:2069 `search()`, :2094-2097 | Search returns at most 80 hits in total, then groups them; "Show all N" only reveals what survived the 80 cap, so the count is wrong and the rest is unreachable. Ranking puts topics first, so reference games and interview questions get cut | Browser at 1440 px: "game" gives groups summing to exactly 80 (Topics 25, Reference games 5 although the library holds 107 games); "player", "loop", "design" also total 80 | medium | Remove the 80 cap (render 6 per group, expand on click; the index is a few thousand rows and filtering is already done), or show "80+ results, refine" |
| F2 | 18-games-series.js, series `fire-emblem`, `reception` | Reception has 8 entries; Three Houses (2019), the series' best-reviewed mainline entry, is one of the 9 `entries` but missing from `reception`; Engage's evidence cites "Three Houses’ 89" as the comparison. The lesson text says "these eight entries" | `entries[7]` = 2019 Three Houses; `reception` = 1990, 1996, 2003, 2005, 2007, 2012, 2015, 2023. Fire Emblem is the only series over the old 7 cap, so it was already trimmed once | medium | Add a Three Houses reception entry (sourced, plain), update `receptionLesson` "eight" to nine |
| F3 | series data, `entries` and `reception` | Selection sits exactly on the old caps. `entries` = 9 in 9 of 22 series (final-fantasy, megami-tensei, pokemon, touhou, fire-emblem, super-mario, contra, zelda, sonic); `reception` = 7 in 6 series (mega-man, megami-tensei, mega-man-x, zelda, sonic, plus fire-emblem at 8). Distribution of entries: 5:1, 6:1, 7:4, 8:7, 9:9 (cliff at 9). Examples of long series shown with 9: Final Fantasy (no IX, VIII), Pokemon (no Sun and Moon, Let's Go), Touhou (9 of 18+ mainline) | Git has no removed text: the trimming was done before commit. No `[-...-]` hunk in any commit removes a series entry or reception item that is still missing | medium | For the 9 series at 9 and 6 at 7: list omitted mainline entries with a distinct critical or sales verdict, add them (sourced); do not add filler entries. Selection notes such as "mainline only" belong in the series intro |
| F4 | lens text, 107 games | Writing hugs the 380 and 700 caps. Lens totals (1022 lenses): 340-359 words 167, 360-379 words 223, 380-399 only 23, 400+ 1. 402 lenses are at 90% or more of 380 and 247 at 95% or more. Signature totals (107): 45 games at 90% or more of 700, 11 at 690 to 700 words (chrono-trigger 698, clair-obscur 698, factorio 696, civilization 695, final-fantasy 694). Fields are not squeezed to their minimums (0 of 319 lenses at 350+ words have a field within 2 words of its minimum), so the trimming, if any, was of whole details inside a field | histogram in `SP\work\text\hist.js` output; near-cap table in `a6b.out`. Ratios that cluster this hard just under a cap are what cap-driven cutting looks like | medium | Do not expand blindly. Spot check 20 lenses at 375 to 379 words against their sources for dropped key facts or a missing `cost`/`compare` detail. Restored text must stay plain (no framework names unless the term is defined on the page) |
| F5 | docs/references/analysis-method.md:40 | Tells writers "Target 150 to 330 words per lens", a cap lower than the 380 guide and never updated after 066431c | line quoted | low | Change rule: "150 words or more; no upper target" |
| F6 | CONTRIBUTING.md:199-206, 219 | Wording still gives numeric ceilings that writers read as caps: "about 700 as a guide", "about 380 as a guide", "usually up to four shots", "reception: 3 to 7 entries" | line refs | low | Change rule: state minimums only and say once that going over is fine when the sources support it; reception "3 or more" |
| F7 | check-layout.js:14-19, 87-diagrams.js `wrap` | Diagram and flow text is hard-capped: a label that needs a third line fails the build, so authors shorten the label. The full text is kept under "Diagram as text", so readers are covered, but the drawing (and any flow shown without that fold, 88-flow.js) carries only the trimmed version | comment in check-layout.js: "a cut one means the data needs rewording" | low | Change rule: let the box grow taller (card height from line count, as 89-graph already does) instead of failing; keep the failure only for overlap |
| F8 | 89-graph.js:190 | The map shows at most 4 smells per selected topic | topics with more: scope-control 5, decisions 6 (1 and 2 hidden on the map); the topic page (90-app.js:764, :873) lists all | low | Remove `.slice(0, 4)` (the layout already handles a variable number of leaves); topics page needs no change |
| F9 | 90-app.js:1843, 01-head.html:262 | Path card audience is clamped to 2 lines with no tooltip | 12 of 21 cards clamp at both 375 and 1440 px (longest audience 225 chars); full text on the path page (:1943) one click away | low | none needed (card links to the full page); optionally add `title` |
| F10 | 90-app.js:1150 `wrapName`, :1160 | Systems-builder circles cut names to 12 characters per line and 3 lines; collision questions list only the first 8 pairs | user-typed names; full name stays in the lists and the exported markdown; "(N unconnected pairs)" count shown and the export prompt covers all pairs | low | none; optionally add `<title>` to the node |
| F11 | 89-graph.js:147 | `cut(n.sub, ...)` can ellipsise a project sub-label | 0 ellipses on all project and domain maps checked (10 routes x 2 widths) | low | none now; replace `cut` with `wrap` for consistency |
| F12 | 90-app.js:1459, 1531, 2015-2019 | Card and search snippets end with "…" even where nothing was cut, and cut mid-word | e.g. every prompt card (all 17 prompts are over 140 chars so all are cut) | low | none (each links to the full text) or cut on a word boundary |
| F13 | path `check.recall` / `skip` / `review` / `steps`, 50-paths.js, 51-paths-engineering.js | Lists pinned at the guide: recall = 4 in 54 of 100 stages, skip = 5 in 42, review = 2 in 21, steps = 8 in 20; recall answer outlines 383 to 411 of 420 chars in 3 places (gameplay-engineer-godot.s4.0, ai-engineering-for-game-devs.s1.0 and .s5.1) | `a6b.out` | low | none unless a stage note shows a dropped question; these are quiz items, not teaching content |
| F14 | engine snippets | Six code snippets sit at 90 to 99% of 900 chars: infra-monitoring.unity 893, craft-design-patterns.unity 891, generative-characters.godot 866, craft-memory-and-gc.unity 860, generative-characters.unity 846, ai-generative-assets.unity 813 | `a6b.out` | low | none; if a snippet reads compressed (no comments, cramped names) allow it to grow |
| F15 | "etc." style filler | Enumerations that end in a stand-in: scope-control `how[1]` "and so on"; learning-from-success `prompts[0].p` "social, and so on"; tetris `signature.teach` "yellow for the square O-piece and so on"; danganronpa `lens.world.evidence` "and so on"; elden-ring `why` "Caelid and more"; fallout-new-vegas `signature.mechanism` "Repair and more"; zelda `lens.sound.evidence` "and more"; steins-gate, elden-ring and deus-ex lens text "among others"; release-and-updates godot `api[2]` "etc."; ai-generative-assets facts "and the like" | quoted from live data (a6c.js) | low | none for facts quoting a source; for the rest, name the items or drop the tail |

Not found: strings ending in "…" or "..." in data (0), mid-sentence endings in prose fields (the 281 flagged by a6c.js are all deliberate fragments: diagram `d` lines, path `pick` lines, `verb`, `signature.idea`, smell causes, titles).
Not a finding: the 48 `na` lenses are each argued (50 to 136 words) and none says a lens is missing for lack of sources. No "blocked"/"could not be loaded" gap markers remain in games, platforms or engines.

## 3. History (A5)

Method: word-diff of every commit's data-file hunks (src/1x to 5x); every removed run of 4 or more words that no longer occurs anywhere in the current source (a5b.js). 135 commits scanned; the file-split commit 01912c0 (moves only) was excluded from the scan.

Result: 572 removed runs across 19 commits.
- (a) cut to fit a cap and still missing now: 0 provable. The hard caps (lens 350/380, signature 650/700, shots 4, reception 7, series 9) were introduced on 2026-09-24 (1b2b738, 68a4ef2) and lifted on 2026-09-29 (066431c). Everything written between was written under the cap, never committed above it, so a removed sentence cannot be found in git. This is why F1 to F4 rest on distributions.
- (b) cut for a cap, already restored: about 17 hunks in 965e7b0 (Mario Kart 8 business lens, Katamari lens, Fortnite lens, StarCraft evidence and a missing source URL, Elden Ring compare, Cities: Skylines evidence, Kerbal cost, Touhou series entries) plus 2 in 066431c. Example: 965e7b0 Mario Kart "This stacks two release-model [-moves:-]{+moves back to back: first+}", Fortnite cost gains "the way a live-service treadmill does".
- (c) legitimate edit: about 553. Grouped: 1b2b738 "Analyse every reference game in depth" 409 (short lesson/complaints/minute lines replaced by full analyses); bac15a1 78 (practice layer rewrite); be14c4f 19 and 3a09b54 (shot captions moved into `shots` entries); 2266e94 14 (fact fixes, e.g. Steam AI disclosure wording); 68a4ef2 8; 058d5b5 6 (engineering path stage s5 "Idioms and tests" moved and re-levelled, still present at 51-paths-engineering.js:306); 2353d82 and 4fdc7a4 6 ("No screenshots ship here" notes deleted because the screens were added); e6de7bf 7 (Wii Sports sound lens changed from `na` to a full lens); cf13b7a 3; 4de9595 6 (comment and helper removal); 607fd94, 37264e7, cebc64e, 8b69ad7, 477fa37 (shelves, comments).
- No commit message before 066431c mentions cutting content for a cap; wording search over all 136 messages found only image re-cuts (73909d1 to 4466a54, image audit) and the two owner-rule commits (066431c, d46f481).

## 4. LONG items (A8)

`node src/validate.js`: 7 LONG lines, 5 text, 2 image.

| item | words / size | verdict |
| --- | --- | --- |
| series fire-emblem, reception 8 entries | 8 vs 7 | Keep all 8, needed: each is a distinct verdict with sources. Add Three Houses (F2); the 9th makes the guide moot |
| game touhou, lens lore | 396 (+16) | Keep. All six fields carry different facts (thin canon, the 2010 ZUN quotes, Comiket 85 figure, Marvel/DC contrast, cost, principle). Only jargon: "In Jenkins’s terms ... evoked narrative" in `mechanism`; acceptable because it is glossed by the folklore example that follows. Nothing to cut |
| game street-fighter, lens lineage | 384 (+4) | Keep. `evidence` is long because it quotes two sources; `mechanism` is one long sentence but each clause (copied motions, rejected motions, parry proof) is a separate fact. If any sentence is shortened for clarity, split `mechanism` into two, do not cut |
| game starcraft, lens gameplay | 410 (+30) | Keep. The Brood War sentence in `evidence` supports "all three economies had to sustain a longer game". Jargon: `mechanism` opens "In skill-atom terms"; replace with plain "In terms of the player’s attention" if edited at all (clarity edit, no content lost) |
| game mario-kart-8, lens business | 385 (+5) | Keep. Every sentence has a figure or a cited source |
| game return-of-the-obra-dinn, shot 1 | 156 KB vs 150 | Image: defer to the image audit; the guide says readability first, so keep |
| #/games/sonic | 356 KB vs 350 | Image budget: same; lazy-loaded pages, keep |

Restoration rule applied to the recommendations above: F2 and F3 additions should use the same plain style as the existing reception entries (claim in the first sentence, figure plus source in `evidence`, one plain reason in `why`, no framework names).
