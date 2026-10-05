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
- [~] P3.1 (UNCOMMITTED, UNTESTED work in the tree: lenses as details + dl + sources disclosure + Open all; topic sections h2 with stretched button, sub-heads re-levelled with h4look classes, CSS selectors widened with :is(); series/sources headings; 68ch measure; #app div, pane main, rail nav. Next: run build, smoke, e2e, axe; then S5 buttons-to-links for .btn/.path/.symptom only, tab strips set aside) Game lenses: claim visible, body behind heading and disclosure; reading measure about 70 characters
- [ ] P3.2 Semantics: `main` content only, heading order, h1 everywhere, links not button[data-href], lists, types, landmark names, lab markup
- [ ] P3.3 Contrast pairs; check-contrast.js extended to composited surfaces
- [ ] P3.4 Remaining site-audit rows (except N1-N4) fixed or set aside with reasons
- [ ] P3.5 axe and html-validate re-run; text walls re-measured; CI replay, commit, push

## P4 Explainers
- [ ] P4.1 `explainer` diagram kind: frames, step/play/reset, static final frame, reduced motion, text equivalent; validator and layout check per frame
- [ ] P4.2 The 25 figure opportunities from the site audit resolved (static or stepped)
- [ ] P4.3 WebM clip renderer for motion ideas; clips added where motion is the lesson
- [ ] P4.4 Checks, CI replay, commit, push

## P5 Curriculum design
- [ ] P5.1 research/curriculum.md: each path rule tied to evidence and its strength
- [ ] P5.2 Validator rules for what is checkable

## P6 New topics (20)
- [x] P6.0 briefs/factcheck.md
- [~] P6.1 Workflow wf_e1ce23b6-77b PAUSED at the usage limit (single lane); resume with Workflow({scriptPath: <session workflows/scripts/playable-topic-pipeline-wf_e1ce23b6-77b.js>, resumeFromRunId: 'wf_e1ce23b6-77b'}). Drafts (writer-sonnet-medium), two at a time, then fact-checks (factcheck-opus-medium); see the per-topic table below. The last 14 run as Workflow `wf_e1ce23b6-77b` (two sequential lanes: write, check, fix; script under the session's workflows/scripts); resume with resumeFromRunId if interrupted
- [ ] P6.2 Integration into src/ domain files; explainers from EXPLAINER blocks
- [ ] P6.3 Paths: realtime-at-scale-engineer, performance-engineer; steps in existing paths; chooser
- [ ] P6.4 Wiring: lens topics on existing games, review steps, glossary terms, spatial-composition pointer
- [ ] P6.5 Checks, CI replay, commit, push

| Topic | Draft | Fact-check | Integrated |
| --- | --- | --- | --- |
| backtracking-and-return-trips | [x] | [x] PASS WITH FIXES, fixed | [ ] |
| balance-methods | [x] | [x] PASS WITH FIXES, fixed | [ ] |
| power-creep-and-content-growth | [x] | [x] PASS WITH FIXES, fixed | [ ] |
| server-bandwidth-and-interest-management | [x] | [x] PASS WITH FIXES, fixed | [ ] |
| server-transport-and-relays | [x] | [x] PASS WITH FIXES, fixed | [ ] |
| server-world-partitioning | [x] | [x] PASS WITH FIXES, fixed | [ ] |
| server-load-testing-and-capacity | [x] | [x] PASS WITH FIXES, fixing in workflow | [ ] |
| server-framework-landscape | [x] | [~] workflow | [ ] |
| realtime-connection-tier-at-scale | [ ] | [ ] | [ ] |
| craft-cpu-cache-and-data-layout | [ ] | [ ] | [ ] |
| craft-gpu-rendering-cost | [ ] | [ ] | [ ] |
| craft-mobile-gpu-and-thermals | [ ] | [ ] | [ ] |
| craft-memory-loading-and-streaming | [ ] | [ ] | [ ] |
| web-performance-basics | [ ] | [ ] | [ ] |
| backend-latency-and-query-optimisation | [ ] | [ ] | [ ] |
| puzzles-in-action-spaces | [ ] | [ ] | [ ] |
| pixel-art-direction | [ ] | [ ] | [ ] |
| worldbuilding-method | [ ] | [ ] | [ ] |
| rhythm-and-music-timed-design | [ ] | [ ] | [ ] |
| craft-audio-clock-and-input-latency | [ ] | [ ] | [ ] |

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
- [ ] P9.1 Overworld view (default) with plain-list toggle; regions, mastery states, never a gate
- [ ] P9.2 Castle = checkpoint; boss flow (answer, confidence, reveal, tick ideas, rate; re-ask; Review queue)
- [ ] P9.3 Test-out replaces "I already know this"
- [ ] P9.4 Walking skin, off by default, reduced motion
- [ ] P9.5 Audit N1-N4: path door and page chrome
- [ ] P9.6 e2e-paths.js extended; checks, CI replay, commit, push

## P10 Close
- [ ] P10.1 Independent final review; fixes; re-review of the fixes
- [ ] P10.2 README, CONTRIBUTING; skill, rules, memory; archive this folder and ui-revamp
- [ ] P10.3 Full CI replay, push, real run; closing report
