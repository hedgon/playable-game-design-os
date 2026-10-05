---
status: active
updated: 2026-10-05
---

# Tasks

Live status of [plan.md](plan.md). Updated as each task starts and lands, so a new
session can pick up from here. Legend: `[ ]` todo, `[~]` in progress, `[x]` done (with
the evidence line), `[-]` set aside (with the reason).

## P0 Research and plan
- [x] P0.1 Map layout research (agent): research/map-layout.md. Level gaps already mid-range; sibling gaps (4-8) below every tool default; S-curves smear with 13 children even at double width; recommended elbows on a shared trunk plus wider gaps
- [x] P0.2 Learning science, gamification, diagrams and animation (agent): research/learning-science.md; abstract-level numbers, labelled; adventure "partly supported"
- [x] P0.3 Field-read trace: 2,363 routes, 0 errors; research/split-architecture.md
- [x] P0.4 Content gaps (agent): research/content-gaps.md; 20 topics, 2 new paths
- [x] P0.5 Site audit: research/site-audit.md (agent) and research/a11y-html-baseline.md (axe, html-validate)
- [x] P0.6 Plan audit (fresh Opus agent): PASS WITH CHANGES, 20 findings, all adopted: research/plan-audit.md; owner approved CI change, video approach, image downloads
- [x] P0.7 Run-book drafted (global skill program-autopilot), writer-sonnet-medium agent, validator draft mode, briefs

## P1 Map breathing room
- [x] P1.1 Gaps: the real cause was that a desktop map pane under 1,060 px used the phone's one-sided caps (every column gap 20, phone card widths); `root.phone` now separates them. Desktop GAP_X 80/104/48/48 (leaf-level 48, not 64: a topic's whole neighbourhood then fits a 1440 pane), GAP_Y 8/10/8; phone X 20/24/20/20 and phone domain gap 4 (first view must hold every domain)
- [x] P1.2 Elbow edges on a shared trunk (opaque colour so overlaps do not darken); hovered edges raised; one-sided overview bows domain links past the far edge; layout checker samples any path and checks three layouts (1,779 states, 0 overlaps, 0 tree crossings)
- [x] P1.3 Open branch in the accent, other tree edges a quiet solid; legend shows both
- [x] P1.4 smoke.js measures sibling stub separation (>= 4 px) at 1280, 1440 and 375; labels >= 11 px kept; three latent map bugs found and fixed on the way: the 'more' cue counted against the viewBox instead of what the stage shows and was not recounted on resize; a click zoomed in when 12 px leaves appeared (window now sized for them on desktop); per-frame layout reads slowed clicks. smoke 0 failures (269 visits), e2e 105/105; click-to-settled median 337/356 ms (limit 450)
- [x] P1.5 Independent UX review (SHIP WITH FIXES, 8 findings): fixed F2 (pane topic cards 210, path and project columns fit at 1280), F3 (overview domain links framed), F4 (no domain links through the trunk gap with a domain open), F6 (next-unread button one line, full name in its tooltip); set aside F1 (after a click the camera keeps its zoom, owner rule of 2026-10-02; the cut-off cue pans), F5 (phone stays tight: the column already touches the stage edge), F7 (faint arc in project maps, low), F8 (optional leaf font)
- [x] P1.6 Checks: build OK (1,779 states, 0 overlaps, 0 crossings, all labels fit), tsc 0, smoke 0 failures, e2e 105/105; commit b79b317 pushed; GitHub run 37257824031 success

## P2 Split into a shell and content files
- [x] P2.1 Content compiler (src/content-build.js): LIGHT per kind, lossless check, `content/` emptied and rebuilt, 435 files; topics, games, paths, projects, guides, comparisons, smells, checklists, prompts; rel reasons and relIn in topic files; cited sources a content file; unreachable data bindings left out
- [x] P2.2 Search index built by the build (85-shared.js): head (titles, synonyms, snippets) then body (words with counts)
- [x] P2.3 Loader (86-content.js), build id reload, async router (contentNeeds) with stale drop, loading line after 150 ms, error page with retry, `settled()`
- [x] P2.4 smoke reads long fields from the sources (load-data.js); e2e waits on settled; smoke awaits the search index; text-fit states = source map states (1,770) enforced; smoke still 269 visits
- [x] P2.5 Golden master old vs new: 2,363 + 2,414 routes, h1/text/links/rail identical, 0 errors; traces with saved state (2) drove the LIGHT spec
- [x] P2.6 CI checks playable.html and content/ with git status; page budget 300 KB gzipped in the build (292 KB)
- [x] P2.7 Measured (research/split-architecture.md): 2,844 to 292 KB gz; slow-4G phone 48 s to 7-9 s; first search key 3.4 s to 62-77 ms; phone longest task 0.4-1.2 s, target 200 ms NOT met (map first paint; follow-up); file:// works
- [x] P2.8 README and CONTRIBUTING updated (how the page loads content, LIGHT, budget, load-data.js)
- [x] P2.9 Commit 14d3254 pushed after a local replay (build, sync, tsc, smoke 0 failures, e2e 105/105). Its GitHub run failed (a router race and a pane check on Linux, not reproduced locally); fixed in dcef709, which also carried P3 work, so the plan’s "check the live site before P3" rule was not kept for that push. Live Pages site checked after dcef709 (build id matches its content files)
- [x] P2.10 Owner (2026-10-05): old.html, trace.html and scratch outputs deleted after the golden master passed; obsolete code removed with the split: the in-page index build, citedSources' loop, routeDone (moved or replaced, listed in the report)

## P3 Audit fixes (presentation only)
- [x] P3.1 Game lenses as disclosures (name + claim shown; argument as a definition list; sources in their own disclosure; Open all); prose measure 68ch
- [x] P3.2 Semantics: topic sections h2 with one stretched toggle (no second click target); sub-heads, engine, Go, interview, worked, facts, contexts, series, sources, map panels, Lab, AI loop, comparison and smell lists re-levelled (look kept with h4look); `main` = reading pane, rail a named nav, map takes main + heading when the pane is closed on a narrow screen; 135 buttons and 23 inputs typed; 25 link-like buttons (.btn, path cards, symptoms) are links; glossary letter headings and a filter
- [x] P3.3 Contrast: --on-accent, --accent-ink, --accent2-ink tokens; 11 accent-filled controls, practice chips, rail sublabels, chip links, next-step row; check-contrast.js covers the composited surfaces (682 pairs, 0 below 4.5:1); links in prose and callouts underlined
- [x] P3.4 Found on the way, fixed: two reads of split fields that no crawl exercised (smells filter read cause text; the dissection tool copies a game's long fields and shows saved comparables' lessons): smell cause text stays light; the tool loads games on click and on entry
- [-] Set aside, with reasons: tab strips, top navigation and map crumbs keep button[data-href] (their styling and tab semantics are button-based; a separate navigation pass); search results stay an ARIA listbox (the combobox pattern needs options, not links); #/map keeps focus where the reader is (map keyboard travel); L4 (DOM settles 200-300 ms after first frame: cause not found) and L5 (map mounted on every route) go to the map-paint follow-up with the phone long task; T2 (AI parts as one block) is a content restructure, the sections are already collapsed by default; S7 tables and figures and M1 media are P4; N1-N7 path door, path page chrome, progress counters, and the path step rows' markup (div in span, labels with several controls) are P9; html-validate doctype-style is a false positive of the audit script
- [x] P3.5 Re-measured: axe on 22 routes x 2 widths: color-contrast 40 to 0 on the checked pairs, heading-order 20 to the path pages only (P9), unique-landmark gone; build, tsc, smoke 0 failures, e2e 105/105; CI fix shipped in dcef709 (GitHub build and Pages green; live site serves the same build id as its content files)
- [x] P3.6 Owner (2026-10-05): map tree edges back to soft dashed curves (no solid "hard lines"); wider gaps kept

## P4 Explainers
- [x] P4.1 `EXPLAINER()`: frames of any diagram kind, Back/Next/Play/Start again, caption in a live region, one frame at a time, fade off under reduced motion, every frame validated and laid out; typed in 10-schema.js
- [x] P4.2 The site audit's figure list: 20 static diagrams added (the fixed-timestep loop, progression, economy, request chain, data access, data stores, CDN, anti-cheat, saves, entities, agent loop, agentic flow, context window, goal horizons, retention, onboarding, monetisation, seasons, learning-based AI, memory and GC) and 10 stepped explainers (rollback, fixed timestep, state sync, A*, determinism, tunnelling, combat beats, perception, matchmaking, hit feel); diagrams 214 to 279, all fit
- [x] P4.3 `CLIP()` and src/clips-make.js: three silent WebM clips drawn from code (fixed timestep, hit feel, snapshot interpolation), 22-27 KB each, poster, never autoplay, text equivalent; smoke checks the explainer moves only when stepped and the clip does not play by itself
- [-] Set aside: the audit's "explorable toggles" (a slider for frame time, layer toggles for hit feel) as interactive models; the stepped explainers and clips cover the same ideas. The editor screen recording for craft-performance (owner decision: no editor recordings)
- [x] P4.4 build (279 diagrams, 0 problems), tsc 0, smoke 0 failures, e2e 105/105; commit, push, CI

## P5 Curriculum design
- [x] P5.1 research/curriculum.md: each path rule tied to evidence and its strength (row numbers checked against learning-science.md)
- [x] P5.2 Validator rules for what is checkable: curriculum guides reported under LONG (spacing gap, review topic not studied earlier, no reference solution at beginner/intermediate: 35, one-idea answer outline: 185 of 419). Follow-up in P9.2: `ideas:[]` on outlines whose one sentence holds several ideas

## P6 New topics (20)
- [x] P6.0 briefs/factcheck.md
- [x] P6.0b Page budget headroom: tool code (90-app tools, 92-ideas, 93-lab; new 94-tools.js) loads on demand as content/code/tools.js and lab.js; per-file hash map replaced by ?v=BUILD (it changed every build anyway); build id hashes code too. Page 295 -> 259 KB gzipped. build, smoke 269/0, e2e 105/105, tool interactions from file:// checked
- [x] P6.1 Workflow wf_e1ce23b6-77b finished (39 agents, single lane): 20 drafts written, fact-checked (all PASS WITH FIXES) and fixed
- [x] P6.2 Integration into src/ domain files; explainers from EXPLAINER blocks. 20 of 20 done (2026-10-05; the last five in a second pass, with three more explainers; the pixel-art rounding claim corrected, see below): each draft appended to its domain file; 14 EXPLAINER() calls authored from the outlines (frames in existing diagram kinds, illustrative numbers labelled); framework-landscape matrix split into a 2-column diagram plus the full 5-column worked table framework-families; legends, axis names and row labels fitted to the renderer (layout 0, text-fit 0). Integrated .js drafts deleted; .sources.md and .factcheck.md kept as evidence
- [x] P6.3 Paths: realtime-at-scale-engineer (5 stages, 8.5 h) and performance-engineer (6 stages, 9.67 h) written, prereq next links, chooser (backend senior; gameplay and backend some/senior). Steps added: backtracking in level-and-ux-designer s1 and games-that-broke-the-mould s2; power creep in systems-designer s3 and senior-game-designer s3; balance in systems-designer s4 and senior-game-designer s2; hours recomputed. Last five: rhythm in games-that-broke-the-mould s3 and study-the-hits-play s2; puzzles in games-that-broke-the-mould s4; pixel art in level-and-ux-designer s2 and study-the-hits-worlds s4; worldbuilding in study-the-hits-worlds s1; the audio clock in both engine paths’ Feel stage (9 steps there, reported long)
- [x] P6.4 Wiring: lens topics (Hearthstone and EA FC replay -> power creep; Hollow Knight, Zelda and RE4 world, Dark Souls ui, Elden Ring lineage -> backtracking, each checked against the lens text); 12 glossary terms; inbound rels (content-multiplies, level-structure, spatial-composition, backend-observability, server-stack-choices, soft-launch-and-playable-ads, craft-performance); spatial-composition trap line points to backtracking. Set aside: review entries in other paths for topics those paths never teach (the P5 guide flags them). Last five: lens links Beat Saber gameplay, Zelda gameplay, Stardew Valley and Undertale art, Hollow Knight world, Dark Souls lore; 4 more glossary terms (91); 5 inbound rels. Correction made on integration: the pixel-art outline and its fact-check both said banker’s rounding moves a 0.5 px/frame sprite on frames 2, 4, 6, 8; it gives 0,1,2,2,2,3,4,4 (uneven bursts on 2, 3, 6, 7). The explainer and the interview answer now say so. Integrated drafts are stubs until the P7/P8 workflow (which may load them) finishes, then deleted
- [x] P6.5 Checks, CI replay (build, diff 0, tsc, smoke 269/0, e2e 125/125), commit 793411f, push (topics 231/231 in paths; layout 0; text-fit 0)

| Topic | Draft | Fact-check | Integrated |
| --- | --- | --- | --- |
| backtracking-and-return-trips | [x] | [x] PASS WITH FIXES, fixed | [x] |
| balance-methods | [x] | [x] PASS WITH FIXES, fixed | [x] |
| power-creep-and-content-growth | [x] | [x] PASS WITH FIXES, fixed | [x] |
| server-bandwidth-and-interest-management | [x] | [x] PASS WITH FIXES, fixed | [x] |
| server-transport-and-relays | [x] | [x] PASS WITH FIXES, fixed | [x] |
| server-world-partitioning | [x] | [x] PASS WITH FIXES, fixed | [x] |
| server-load-testing-and-capacity | [x] | [x] PASS WITH FIXES, fixed | [x] |
| server-framework-landscape | [x] | [x] PASS WITH FIXES, fixed | [x] |
| realtime-connection-tier-at-scale | [x] | [x] PASS WITH FIXES, fixed | [x] |
| craft-cpu-cache-and-data-layout | [x] | [x] PASS WITH FIXES, fixed | [x] |
| craft-gpu-rendering-cost | [x] | [x] PASS WITH FIXES, fixed | [x] |
| craft-mobile-gpu-and-thermals | [x] | [x] PASS WITH FIXES, fixed | [x] |
| craft-memory-loading-and-streaming | [x] | [x] PASS WITH FIXES, fixed | [x] |
| web-performance-basics | [x] | [x] PASS WITH FIXES, fixed | [x] |
| backend-latency-and-query-optimisation | [x] | [x] PASS WITH FIXES, fixed | [x] |
| puzzles-in-action-spaces | [x] | [x] PASS WITH FIXES, fixed | [x] |
| pixel-art-direction | [x] | [x] PASS WITH FIXES, fixed | [x] |
| worldbuilding-method | [x] | [x] PASS WITH FIXES, fixed | [x] |
| rhythm-and-music-timed-design | [x] | [x] PASS WITH FIXES, fixed | [x] |
| craft-audio-clock-and-input-latency | [x] | [x] PASS WITH FIXES, fixed | [x] |

## P7 New games
- [x] P7.1 Drafts (writer-sonnet-low), checks (factcheck-opus-medium) and fixes in workflow wf_12f5bf60-4f8: crosscode, rhythm-heaven and rhythm-doctor, all PASS WITH FIXES, fixed (rhythm-doctor rewritten around the checker’s corrected thesis: the button and the seventh-beat core are fixed, the beat types vary)
- [x] P7.2 Images: CrossCode header and 4 Steam screens (viewed, captions and callouts written from the images; 330 KB on the page); Rhythm Heaven header and 2 lens shots from Nintendo’s Groove gallery, entries 1-3 from LaunchBox captures (no Nintendo page left), entry 4 (3DS) without a shot (none found; 4 of 5 is the validator’s minimum). Rhythm Doctor header and 4 Steam screens (row, three rows with crosses, split screen, level editor; 188 KB). Every image was viewed before its alt and caption were written; a cross whose meaning the image does not show is described, not explained
- [x] P7.3 Integrated: crosscode (18-games-innovative.js; steps in games-that-broke-the-mould s4 and study-the-hits-worlds s1), rhythm-heaven (18-games-series.js; steps in games-that-broke-the-mould s3 and study-the-hits-play s2); lens topics already name the new topics. One CrossCode screen region resized (its label was cut). Rhythm Doctor in 18-games-innovative.js, step in study-the-hits-play s2 beside Rhythm Heaven (the imitator question in one stage); its screen diagram re-laid out without overlaps
- [x] P7.4 Checks, CI replay (build, diff 0, tsc, smoke 0, e2e 125/125), commits 701f149 and 7f9320d, pushed

## P8 Two games, one problem
- [x] P8.1 `COMPARE` optional diagram: typedef, renderer (diagramCard under the two heads), validator (checkDiagram), layout check (compare:<id> specs); in commit 4db0049
- [x] P8.2 Comparisons: four deepened (3-4 sections to 6-7, each with a diagram), eight new, all fact-checked; eleven PASS WITH FIXES, one FAIL (balance-patches-in-a-live-game: Overwatch: Classic, 5v5 and the 2026 rename reversed its contrast) rewritten and re-read against its report before integration. The library’s Elden Ring fast-travel sentences corrected on the checker’s finding
- [x] P8.3 Shelf: four problems (when the player fails; teaching without stopping play; bringing the player back; keeping a live game fair as it grows), each with its reason and a reading order; all 12 comparisons placed once
- [x] P8.4 Checks (build 0 problems; 12 comparison pages visited at 1440 and 375, no errors), CI replay (all green), commit c46e9d5, pushed

## P9 Adventure paths
- [x] P9.1 Stage map (default) with a Plain list toggle: an ordered list of regions in the reading pane (steps read, checkpoint recall state, reviews due, You are here), every region a link, never a gate; the plain list shows every stage
- [x] P9.2 Checkpoint one question at a time: answer from memory (typing optional), confidence before the reveal, outline as ideas to tick, outcome from the ticks; misses and partials re-asked once; scheduled into Review (a right guess comes back tomorrow); result kept per stage. The all-at-once list stays under it
- [x] P9.3 Test-out replaces "I already know this": recall 2/3 or more and the stage is marked tested out, else open the first step; "Skip without testing" stays
- [x] P9.4 Adventure look, off by default: region shape, a castle mark, "Enter the castle", a one-time marker entrance that is still under reduced motion (e2e caught a specificity bug in the reduced-motion rule; fixed). No points, no sprite walking while reading
- [x] P9.5 Audit N1-N4: N1 chooser under the h1, hint and backup to the foot; N2 the duplicate intent list removed, one answer narrows the list; N3 path pages fold the rail and take the reading width, map kept (e2e and earlier map work rely on it); N4 no sub-nav on a path page. Path page markup: stage headings h2, step rows an ol of li with the checkbox and its label separate from links and glossary buttons; html-validate clean, axe clean after transitions. Set aside: N4 one-line path bar (the bar is tested as a whole and serves every route), N5-N7 (topic chrome, nav labels, global counter: not in P9 scope)
- [x] P9.6 e2e-paths.js extended (fight, re-ask, scheduling, stored result, test-out, stage map, plain list, adventure look and reduced motion): 125/125 at 1440 and 375; two stage-count checks moved to the stage map. CI replay, commit, push. Pushed in 4db0049, CI green

- [x] P9.7 Follow-up from P2: the phone map is not drawn while the reading pane covers it (topic page longest task 438-515 -> 221-260 ms, paths 105 ms); 6 smoke and 1 e2e phone-map checks now reveal the map before measuring it

## P10 Close
- [~] P10.1 Final review done (research/final-review.md: 0 blockers, 4 major, 12 minor). Fixed: (1) a same-day re-run promoted the review schedule: a question is now promoted only when new or due (90-app.js scheduleRecall), with an e2e check; (2) the promised ideas split: a writer agent split 157 of the 185 one-sentence outlines into ideas copied word for word (checked by script: copied, 2-4, no overlap; 10 cut short at curly quotes extended, 2 fixed by hand), inserted as ideas:[] in the path files, typed, and validated (each idea must be in its outline); 28 stay one idea; (5, 6) steps added: bandwidth, framework landscape and load testing in netcode-server-engineer s2-s4, the connection tier in live-game-backend-engineer s4, CPU data layout in senior-game-developer-ai-era s4; (7) Pokémon’s gameplay lens (type chart changed per generation) now names balance-methods; (9) focus moves to the reveal after a confidence tap; (10) the start button says a round is not kept across a reload; (11) the end screen’s list is labelled as this stage’s steps; closing a result keeps the checkpoint open; (12) curriculum.md citations corrected; (14) fixed waits in smoke replaced by settled() and image load events, and the failed test-out branch tested; (15) these records; (16) two text slips. Recorded, not fixed: (3) phone longest task 221-260 ms on a topic page and about 285 ms on map home, against 200 ms: an owner decision; (4) CI builds before Playwright is installed, so the text-fit half of the layout check is NOT MEASURED in CI: a CI change, needs the owner’s yes; (8) G1 stub spacing is measured on four routes, not every state, and no before/after screenshots were kept. Set aside: World of Warcraft lens links (its lenses discuss raid size and a token, not power growth or balance); site-audit N5 (topic chrome: a redesign of the topic page header, beyond the audit fixes this programme took on), N6 (navigation labels: judged from screenshots only, needs a learner test before renaming), N7 (the global "Topics read" counter: an e2e check pins it as an earlier owner-facing design; removing it is the owner’s call)
- [ ] P10.2 README, CONTRIBUTING; skill, rules, memory; archive this folder and ui-revamp
- [ ] P10.3 Full CI replay, push, real run; closing report

## Resume here (2026-10-05, usage limit)
- Commit e333177 (final-review fixes) is local, NOT pushed. Next: full CI replay on a clean export (see the program-autopilot skill, 6c), then push and watch CI.
- Then: a fresh read-only agent re-reviews only the final-review findings and the diff c46e9d5..e333177 (ADDRESSED / NOT ADDRESSED, new breakage, callers of scheduleRecall, checkpointOpen, redrawFight, fight-close).
- Then P10.2 (archive docs/program-2026-10 and docs/ui-revamp; final skill, rules, memory) and P10.3 (closing report).
- Owner questions to ask: (a) move the Playwright install before the build in .github/workflows/build.yml so CI measures text fit (final review finding 4; a CI change); (b) accept or schedule the phone longest-task shortfall (finding 3).
