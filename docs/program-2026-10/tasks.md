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
- [x] P2.9 Commit 14d3254 pushed after build, sync, tsc, smoke (0 failures), e2e (105/105). TODO next session: confirm the GitHub run and check the live Pages site loads content/ files
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
- [~] P6.5 Checks, CI replay, commit, push (topics 231/231 in paths; layout 0; text-fit 0)

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
- [ ] P7.1 Drafts (writer-sonnet-low): crosscode, rhythm-heaven, rhythm-doctor
- [ ] P7.2 Images downloaded and converted, credits
- [ ] P7.3 Fact-checks, fixes, integration, paths, game-topic wiring
- [ ] P7.4 Checks, CI replay, commit, push

## P8 Two games, one problem
- [ ] P8.1 `COMPARE` optional diagram: schema, renderer, validator, layout check
- [ ] P8.2 briefs/comparisons.md; four deepened; eight new; fact-checks
- [ ] P8.3 Shelf grouped by problem with a reading order
- [ ] P8.4 Checks, CI replay, commit, push

## P9 Adventure paths
- [x] P9.1 Stage map (default) with a Plain list toggle: an ordered list of regions in the reading pane (steps read, checkpoint recall state, reviews due, You are here), every region a link, never a gate; the plain list shows every stage
- [x] P9.2 Checkpoint one question at a time: answer from memory (typing optional), confidence before the reveal, outline as ideas to tick, outcome from the ticks; misses and partials re-asked once; scheduled into Review (a right guess comes back tomorrow); result kept per stage. The all-at-once list stays under it
- [x] P9.3 Test-out replaces "I already know this": recall 2/3 or more and the stage is marked tested out, else open the first step; "Skip without testing" stays
- [x] P9.4 Adventure look, off by default: region shape, a castle mark, "Enter the castle", a one-time marker entrance that is still under reduced motion (e2e caught a specificity bug in the reduced-motion rule; fixed). No points, no sprite walking while reading
- [x] P9.5 Audit N1-N4: N1 chooser under the h1, hint and backup to the foot; N2 the duplicate intent list removed, one answer narrows the list; N3 path pages fold the rail and take the reading width, map kept (e2e and earlier map work rely on it); N4 no sub-nav on a path page. Path page markup: stage headings h2, step rows an ol of li with the checkbox and its label separate from links and glossary buttons; html-validate clean, axe clean after transitions. Set aside: N4 one-line path bar (the bar is tested as a whole and serves every route), N5-N7 (topic chrome, nav labels, global counter: not in P9 scope)
- [~] P9.6 e2e-paths.js extended (fight, re-ask, scheduling, stored result, test-out, stage map, plain list, adventure look and reduced motion): 125/125 at 1440 and 375; two stage-count checks moved to the stage map. CI replay, commit, push

## P10 Close
- [ ] P10.1 Independent final review; fixes; re-review of the fixes
- [ ] P10.2 README, CONTRIBUTING; skill, rules, memory; archive this folder and ui-revamp
- [ ] P10.3 Full CI replay, push, real run; closing report
