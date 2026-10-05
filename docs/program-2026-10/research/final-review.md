---
status: review
updated: 2026-10-05
---

# Independent final review of programme 2026-10

Reviewer: one fresh read-only agent, working from [../briefs/final-review.md](../briefs/final-review.md).
Scope: `git diff 7424369..HEAD` (15 commits, b79b317 to c46e9d5) plus the working tree
(only `docs/program-2026-10/tasks.md` is modified). I read `src/` (the loader, the content
compiler, the router, the checkpoint, test-out and stage map, the deferred phone map, the
comparison shelf, the validator and the checks), `.github/`, the plan, tasks, research and
briefs, and generated output only to confirm behaviour. No file other than this one was
changed. `node src/build.js` rewrites `playable.html` and `content/`; `git status` after it
showed no change to either.

## Checks I ran

| Check | Result |
| --- | --- |
| `node src/build.js` (no browser channel set) | exit 0. Page 272 KB gzipped (budget 300); content 470 files; validator OK; layout 1,938 states, 0 overlaps, 0 tree crossings; contrast 682 pairs, 0 below 4.5:1; 51 actions all handled. Text fit: **NOT MEASURED** (no default Chromium on this machine) |
| `git status --porcelain -- playable.html content/` after the build | empty: the committed output is the build of the committed sources |
| `PLAYWRIGHT_CHANNEL=msedge node src/check-layout.js` | 1,938 states, 0 problems, labels that do not fit: 0; 1,929 states measured in the page |
| `PLAYWRIGHT_CHANNEL=msedge node src/smoke.js` | 269 visits at 4 widths, 0 failures; click-to-settled median 295/303 ms, max 442/450 ms (limit 450) |
| `PLAYWRIGHT_CHANNEL=msedge node src/e2e-paths.js` | 125/125 passed |
| A read-only probe of my own (Playwright, msedge; script in the session scratchpad) | 10 new routes: no duplicate ids, no untyped buttons, no heading skips, no image without alt, one h1, no page widening. Checkpoint keyboard, reload mid-round and same-day re-runs: see findings 1, 9, 10. Phone map deferred while covered, drawn on close and on widening to 1300 px: works |
| `gh run list` (read only) | every programme commit green except 14d3254 (run 37263943296, failure); run logs not readable (HTTP 403), so CI step output was not inspected |
| `tsc` | not run (CI fetches TypeScript with `npx -y`; I did not download packages) |

## Findings, most severe first

### 1. Major: re-running a checkpoint promotes review intervals (massed recall counts as spacing)
- Where: `src/90-app.js:2417-2422` (`scheduleRecall`), called on every first-round answer (`:2441`).
- Evidence: the box rises by one on every "got it" with no check that the item was due. My probe on `#/paths/performance-engineer/s1`: three same-day runs, all answers "Sure" and fully ticked, left the two items at boxes 3 and 2, that is due in 8 and 4 days after a few minutes of massed retrieval. The Review page deliberately protects the schedule ("Practise now ... never touches their schedule, so the spacing stays what the rules say", `:2065-2066`), and curriculum.md row 3 ties the 1-2-4-8-16 schedule to the spacing evidence. The checkpoint bypasses that rule.
- Smallest fix: in `scheduleRecall`, promote only when the item is new or due (`!items[k] || items[k].due <= today()`); otherwise keep the box and only reset it on a miss or partial.

### 2. Major: the promised `ideas:[]` split was never done, so 44% of checkpoint questions cannot be "partly" recalled
- Where: `docs/program-2026-10/research/curriculum.md:54-57` ("P9 adds `ideas:[]` to them where the sentence holds more than one idea"); tasks.md P5.2 ("Follow-up in P9.2"); P9.2 is marked `[x]`.
- Evidence: `grep -c "ideas:\s*\["` gives 0 in `src/50-paths.js` and `src/51-paths-engineering.js`; `ideas` is not typed in `src/10-schema.js`; the build still reports "an answer outline gives one idea to compare against: 185" (of 419). With one idea the tick list has one box, so the outcome (`:2439`) can only be got or missed; the "partial" state that the plan, learning-science.md 2.3 step 4 and the curriculum rely on cannot occur for those questions.
- Smallest fix: add `ideas:[...]` to the one-sentence outlines that hold two or more ideas (the validator lists them), and add `ideas?: string[]` to the recall typedef; or, if deferred, say so in curriculum.md and reopen P9.2.

### 3. Major: G9's phone performance targets are not met
- Where: plan.md:61-69 (targets); research/split-architecture.md:122-146 (measurements).
- Evidence: longest main-thread task on load, phone 4x: target under 200 ms; measured 221-260 ms on a topic page, about 285 ms on the map home, 192-208 ms on a game page after the P9.7 follow-up. "Page drawn under 2 s from DOMContentLoaded" is met on `#/paths` only ("not on topic and game pages"). "Topic or game page change, no worse" has no recorded measurement. The shell budget (300 KB, 272 KB now) and the first-keystroke target (62-77 ms) are met. The shortfall is reported honestly in split-architecture.md and tasks P2.7, so this is a coverage finding, not a hidden one.
- Smallest fix: record the shortfall as an owner decision (accept, or schedule the map-home and topic-page work), and measure the page-change target once.

### 4. Major: CI never runs the text-fit half of the layout check, including the split's state-count guard
- Where: `.github/workflows/build.yml:19-20` runs `node src/build.js` before Playwright is installed at `:33-36`; `src/check-layout.js:100,120-122` turns a missing Playwright or browser into "NOT MEASURED" and passes.
- Evidence: workflow order (the CI log itself was not readable, 403); my own build without a browser channel printed "labels that do not fit their card: NOT MEASURED" and exited 0. tasks P2.4 says "text-fit states = source map states (1,770) enforced"; the check (`check-layout.js` lines added after `:110`) only runs where a browser is present, so in CI it is skipped. Locally, with msedge, it passes (0 unfit, 1,929 states). The behaviour of NOT MEASURED predates the programme; the guard the split depends on was added inside it.
- Smallest fix: move the Playwright install step before "Build and check" (or run `node src/check-layout.js` again after the install), so CI measures text fit.

### 5. Minor: G7's review steps were not added to the existing networking paths
- Where: plan.md:24 and :95 (review in netcode-server-engineer s2-s4 and live-game-backend-engineer s4); tasks P6.4 sets it aside ("review entries in other paths for topics those paths never teach").
- Evidence: none of the six new networking topics is a step or a `review` entry in netcode-server-engineer or live-game-backend-engineer (`src/51-paths-engineering.js`, checked from the evaluated data). netcode-server-engineer.next names realtime-at-scale-engineer (`:444`); live-game-backend-engineer.next does not (`:322`). The set-aside is a coordinator call that changes an owner-facing "done when".
- Smallest fix: either add a forward pointer (a `next` entry or a step `do` line) in both paths, or ask the owner to accept the deviation.

### 6. Minor: G8's links from senior-game-developer-ai-era s4 (and the planned engine-path and interview-prep joins) are missing, and the tasks never say so
- Where: plan.md:25 and :96; `src/51-paths-engineering.js:1215` (s4 "Measure, budget and choose").
- Evidence: no optimisation topic appears in any path other than performance-engineer; senior-game-developer-ai-era.next is technical-lead, studio-practice-ai-era, interview-prep-engineer. The engine paths link only through `next: ['performance-engineer', ...]` (`:22`, `:171`), which meets "links from the engine paths" loosely. Neither P6.3 nor P6.4 claims or sets aside the senior s4 link.
- Smallest fix: add performance-engineer to the s4 step text or the path's `next`, or a `review` entry for craft-cpu-cache-and-data-layout; record it in tasks.

### 7. Minor: G5's lens links from World of Warcraft and Pokémon are missing, silently
- Where: plan.md:22; game data `src/18-games-genres.js:3460` (world-of-warcraft), `src/18-games-series.js:587` (pokemon).
- Evidence: Hearthstone (replay) and EA Sports FC (replay) name power-creep-and-content-growth; World of Warcraft's lenses name neither new balance topic (replay: difficulty, learning-from-success); Pokémon's neither (replay: difficulty, challenge-failure-recovery). tasks P6.4 lists only Hearthstone and EA FC, with no set-aside for the other two.
- Smallest fix: add the topic to the lens whose text is about content growth or patch balance (check the text first, as P6.4 did), or record why not.

### 8. Minor: G1 is measured on a sample of states, and the screenshots are not on record
- Where: plan.md:18 ("at least 4 px apart on every concept-map state at 1440 and 375 (measured)", "before and after screenshots").
- Evidence: `src/smoke.js:898` measures stub separation on `#/map/home`, `#/map/d/core` and `#/map/d/server`, and `:826` on one open domain on a phone. The build's layout check covers 1,938 states for overlaps in graph units, not on-screen stub separation. No before/after screenshot is committed or referenced in tasks.md (P1.1-P1.6).
- Smallest fix: run STUB_GAP_PX over every domain and a sample of topic states at 1440 and 375 in smoke, or restate the goal as "sampled"; add the screenshots or drop the claim.

### 9. Minor: the checkpoint moves keyboard focus back to the question after every confidence tap
- Where: `src/90-app.js:2423-2426` (`redrawFight` focuses `.fight-q`), `:2434` (`fight-conf`).
- Evidence: probe: after pressing Enter on "Sure", focus is on `H4.fight-q`; it took 5 Tab presses to reach "Show the outline". A screen reader hears the question again and not the pressed state. learning-science.md 2.3 asks for keyboard and screen-reader parity.
- Smallest fix: after `fight-conf`, focus the reveal button (or keep focus on the pressed button); keep the heading focus for a new question only.

### 10. Minor: a reload mid-checkpoint drops the round without a word, after its first answers were already scheduled
- Where: `src/90-app.js:2376` (`let fight = null`, memory only), `:2441` (schedules each first-round answer at once).
- Evidence: probe: answered one question, reloaded: no question shown, no stage result saved, but the answered item sat in the review queue. A restart then re-schedules it (finding 1).
- Smallest fix: either keep `fight` in sessionStorage and resume it, or say on the start button that a started round restarts; finding 1's fix removes the double promotion either way.

### 11. Minor: the end screen lists every step of the stage, not the steps behind the missed questions
- Where: `src/90-app.js:2405`, `:2413`; learning-science.md 2.3, step 6 ("a link to the exact steps behind the missed items").
- Evidence: `steps` is `st.steps.map(...)`, all of them, under the summary "The steps behind these questions". Recall items carry no link to steps, so the exact mapping is not available.
- Smallest fix: relabel it "This stage's steps", or add an optional step index to recall items and list only those.

### 12. Minor: curriculum.md cites two rows less faithfully than learning-science.md states them
- Where: `research/curriculum.md:15`, `:22`.
- Evidence: row 7's design rule in learning-science.md is "show a worked example before asking the learner to produce one" (mathematics only); curriculum.md uses row 7 for a reference solution shown after the learner tries, which is the reverse order (closer to row 10, productive failure, which is contested). Row 3's "larger for recall than recognition" is marked **CONTESTED** in learning-science.md (Adesope's summary says multiple choice did better); curriculum.md drops the flag. All effect sizes it quotes match (g 0.61, d 0.50, g 0.42, g 0.48, g 0.55, d 0.48, d 0.52, d 0.37, g 0.226).
- Smallest fix: say the solution-after-trying rule rests on rows 8, 12 and 14 (fading, feedback) with row 7 as related, and keep the CONTESTED flag on row 3.

### 13. Minor: site-audit N5-N7 were deferred in a circle
- Where: tasks P3.4 ("N1-N7 ... are P9") and P9.5 ("N5-N7 ... not in P9 scope").
- Evidence: G9's done-when is "every finding fixed or set aside with a reason"; the reason each phase gives points to the other phase, so N5 (topic chrome), N6 (navigation labels) and N7 (two progress counters) have no owner.
- Smallest fix: one set-aside line with a real reason (or a follow-up task) for each.

### 14. Minor: two test gaps against the plan's own rules
- Where: `src/smoke.js:143`, `:168`, `:172`, `:174`; `src/e2e-paths.js:308-317`.
- Evidence: the worked-example and comparison checks set the hash and wait a fixed 250 ms instead of `PlayableApp.settled()`, which plan.md:123-124 rules out ("tests wait on the app's settled signal, never on longer timeouts"); they pass locally because the server is fast. The test-out is tested only on its pass branch; the "Open the first step" branch (`90-app.js:2408`) is never exercised.
- Smallest fix: await `settled()` after those hash changes; add one test-out run that ticks nothing and checks the link and the unchanged stage status.

### 15. Minor: process records that do not match what can be seen
- tasks P2.9 records 14d3254 as pushed after a passing local replay; its GitHub run 37263943296 failed (gh run list). The fix, dcef709, also carried P3 work, so the plan's rule "the live site is checked after the P2 push and before P3 starts" (plan.md:121-122) was not kept. P3.5 does mention the fix.
- P9.6 is still `[~]` although its work is in 4db0049 and e2e passes 125/125 (my run); P2.9 is `[x]` with an open "TODO next session" in its text.
- P2.5 (golden master), P3.5 and P9.5 (axe and html-validate after-numbers) and P8.4 ("12 comparison pages visited") have no artifact in the repo: the audit script is session-local and the golden-master outputs were deleted (owner decision, P2.10). My own probe found no markup problems on ten new routes, which is consistent with those claims but is not the same measurement.
- Smallest fix: correct P2.9 and P9.6, and commit the after-numbers table to a11y-html-baseline.md.

### 16. Minor: two text slips in the sampled topics
- `src/23-topics-systems.js:959` (balance-methods `what`): a sentence starts in lower case, "the vanilla test, a rule of thumb among Magic’s Limited players, is the classic check".
- `src/39b-topics-craft.js:1868` (craft-cpu-cache-and-data-layout, how[1]): "the working set drops from 640 KB to 80 KB ... about L1 size after". The array-of-structs loop fetches 5,000-10,000 lines, 320-640 KB, and 80 KB is above the 32-64 KB L1 the same paragraph implies. The conclusion (16x fewer bytes used per line, one dense stream) stands.
- Smallest fix: capitalise; say "the bytes fetched drop from 320-640 KB to 80 KB, which fits a phone's L2".

## Goals G1-G11

| Goal | Verdict | Evidence |
| --- | --- | --- |
| G1 Map breathing room | partly | Gaps from research/map-layout.md 5 with a recorded deviation (leaf level 48, P1.1); edges reverted to soft dashed curves by the owner (P3.6). Stub separation >= 4 px is measured on three desktop routes and one phone domain (`smoke.js:898`, `:826`), not every state; labels >= 11 px measured at 1280, 1440 and 375 in smoke; layout, smoke and e2e pass (my runs). No before/after screenshots on record (finding 8) |
| G2 CrossCode | met | Full entry with 10 lenses, loop and screen diagrams, 4 Steam screens (`assets/games/shots/crosscode-*.webp`); lenses name puzzles-in-action-spaces (gameplay), pixel-art-direction (art), worldbuilding-method (world); steps in games-that-broke-the-mould s4 and study-the-hits-worlds s1; comparison puzzles-inside-an-action-game (CrossCode / Zelda); drafts/crosscode.factcheck.md |
| G3 Rhythm Heaven | met | Series entry with 5 entries, 5 reception lines and a lineage lens that names Melatonin, Bits & Bops, Rhythm Doctor and WarioWare with sources and says what each kept and changed; rhythm-doctor game; comparison rhythm-by-ear (7 sections, 10 sources); both topics exist and are in paths (games-that-broke-the-mould, study-the-hits-play; both engine paths' Feel stage); fact-checks in drafts/ |
| G4 Backtracking | met | Topic with the eight parts, Godot and Unity tabs, interview, diagram, explainer and dated facts; steps in level-and-ux-designer s1 and games-that-broke-the-mould s2; lens links from Hollow Knight (world), Dark Souls (ui), Elden Ring (lineage), Zelda (world); spatial-composition names it; comparison return-trips (Hollow Knight / Dark Souls) |
| G5 Balance and power creep | partly | Both topics with a worked cost-curve table (numbers recomputed: all eight rows correct) and a payoff matrix that solves (25/50/25, each row 0); power-creep explainer (1.06^7 = 1.50, rotation gap 1.06^2 = 1.12, both correct); steps in systems-designer s3, s4 and senior-game-designer s2, s3; comparison keeping-old-content-relevant. Lens links: Hearthstone and EA FC yes, World of Warcraft and Pokémon no (finding 7) |
| G6 Two games, one problem | met | The four existing comparisons went 4/3/3/4 to 6/6/6/7 sections, each with a diagram; sources 4/3/3/3 to 6/3/5/4 (teaching-without-words' new sections are covered by its existing sources per its fact-check); eight new comparisons, each with a diagram and 3-10 sources; shelf of four problems with reasons and reading order, every comparison placed once (validator `validate.js:897`); 12 fact-check reports in drafts/ |
| G7 Networking | partly | Six topics with official sources and numbers (the bandwidth topic's arithmetic recomputed: 9,900 pairs, 36 kB/s, 115 MB/h, 9 kbit/s up, 35 kbit/s down, 44-bit position, 29/32-bit rotation, all correct); realtime-at-scale-engineer (5 stages, 8.5 h, sums correct); Counter-Strike 2 lens step in s1. Review steps in netcode-server-engineer and live-game-backend-engineer: not done (finding 5) |
| G8 Optimisation | partly | Six topics; performance-engineer (6 stages, 9.67 h, sums correct); engine paths link through `next`. senior-game-developer-ai-era s4 link missing (finding 6) |
| G9 Site audit, explainers, performance | partly | Explainers and 3 clips shipped, smoke checks they move only when stepped and the clip never autoplays; contrast 0 below 4.5:1 (build); my probe found clean markup on ten new routes. Phone longest-task and page-drawn targets not met (finding 3); N5-N7 have no owner (finding 13); axe and html-validate after-numbers not on record (finding 15) |
| G10 Curriculum evidence | partly | curriculum.md ties every rule to a row with its strength and the numbers match; the validator enforces the countable rules (2+ recall with answers, why and do on every step, at most 4 topic steps in a row from one domain at `validate.js:692`, levels never drop, minutes 10-60, a build task per stage) and reports the guides. The adventure follows 2.3 in shape (map as a view, one question at a time, confidence before reveal, re-ask, test-out, no score, skin off by default), but the `ideas:[]` split is missing (finding 2), re-runs break the spacing schedule (finding 1), the end screen does not point at the missed steps (finding 11), and two citations drift (finding 12) |
| G11 Run-book | not met yet | `~/.claude/skills/program-autopilot/SKILL.md` exists (drafted 2026-10-05 17:27); "finalised from this run" plus memory and rules is P10.2, still open |

## Criterion 3: were checks weakened?

No assertion was removed or loosened to pass. Each change, against 7424369:

| Change | Still tests what a user sees? |
| --- | --- |
| smoke: long fields (worked examples, comparison sections, solutions, Go) read from the sources through `load-data.js`, not the page | yes; the page now holds only the light index, and the routes are still visited and their DOM checked |
| smoke: every route visit awaits `PlayableApp.settled()`; search awaits `loadIndex()` | yes; it waits for the drawn page instead of a timer |
| smoke: phone outline, "the opened topic is selected" moved from while the pane is open to after returning to the map | yes; on a phone the outline is only visible after returning, and the assertion is unchanged in substance |
| smoke and e2e: phone map measurements first reveal the map (`seeMap`, `collapseRight`) | yes; the map is no longer drawn behind the pane, and a reader must reveal it to see it |
| e2e: the senior design and developer paths' stage lists read from the stage map's region links instead of `.pathstage` sections | yes; in the default stage-map view only the open stage's section is drawn, so the old selector would test the plain list; order and count are still asserted, and the plain list is asserted separately (on performance-engineer only) |
| New: stub separation, explainer and clip behaviour, checkpoint, re-ask, scheduling, stored result, test-out (pass branch), stage map, plain list, adventure look under reduced motion | additions |

## Set aside (considered, judged not a finding)

- Stale route while a content file loads: `route()` drops a resolved load whose sequence or hash moved on, clears its Loading timer, and ignores late errors (`90-app.js:252-268`). Correct as written.
- Stale shell meets a newer content file: `put()` refuses a file of another build and reloads once through sessionStorage (`86-content.js:43-49`); a second mismatch shows the retry page instead of looping. Correct.
- Lossless split: `content-build.js:117` proves light merged with heavy equals the original for every entity on every build, so an old-shape field cannot be dropped silently.
- `strip()` in build.js deletes whole comment lines from page code: a scan of every page and on-demand file found no comment-only line inside a template literal.
- On-demand tool code: no `data-action` used by always-loaded code is defined only in the on-demand files (scan of 90-app, 91-map, 85, 87, 89 against 92, 93, 94), and `renderLab` is reached only from `#/lab`.
- Saved data of an old shape: `pathProgress` defaults `check` to `{}` (`90-app.js:2100-2103`); `pathView` other than "list" falls back to the stage map; `pathSkin` must be exactly true; review items are filtered to plain objects; the dissection tool filters saved comparables to known games.
- A stage with no recall answers: impossible by validation (`validate.js:740`, string recall items are errors), and the UI hides the fight and the test-out button when there are none (`90-app.js:2353-2362`).
- Narrow screen that widens with the map pending: `phoneQuery` change calls `drawPendingMap` (`91-map.js:1121`); probe confirmed the selected node is drawn at 1300 px and after closing the pane at 375 px.
- Tablet widths 701-1100 px still draw the map under an open pane: the pending rule is phone-only by design, and the measured long task was a phone problem.
- Test-out threshold `ceil(2n/3)` means 2 of 2 for two-question stages: consistent with "recall most of them".
- A right answer marked as a guess comes back tomorrow: a stated judgement in curriculum.md row 3, consistent with learning-science.md row 18.
- The fight's question sits in the same stage section as the step rows: the rows show only why and do, not the topic text, so the answer is not on screen.
- learning-science.md 2.3 "plus a note on the common slip" per outline: content-dependent, not a code feature; outline quality is listed in curriculum.md as not enforced.
- Validator pre-existing quirk: a stage with more than four recall questions skips per-item checks (`validate.js:736-742`, `else if ... else forEach`); no stage has more than four today and the structure predates the programme.
- Edges reverted from elbows to dashed curves (P3.6): an owner decision recorded in tasks, not a G1 failure.
- The golden master and audit outputs deleted (P2.10): owner decision; listed under finding 15 only as unverifiable.
- "Riot: nerf when over in any tier group, buff only when under in all" (balance-methods how[6]): the writer's sources note asks to verify it; the fact-checker says it is in the Riot framework page the topic cites. Not checked further here.
- Rhythm Doctor's full release (December 2025) and Bits & Bops (December 2025) dates: inside the fact-checked lineage lens with sources; not re-verified.
- teaching-without-words added three sections without new sources: its fact-check confirms each new claim against the three existing sources (Portal and Super Mario Bros. Wikipedia, Game Developer).
- Smoke click-to-settled max of 450 ms at a 450 ms limit: passes; a timing margin, worth watching on a busy machine.
- The error page says pages opened before still work offline: true within the session (files stay merged in memory); a stronger promise is not made.
- `tsc` not run by me: CI runs it and is green on HEAD.
- Typed data files, explainer and clip renderers: outside the brief's list for criterion 2; build and smoke checks of them pass.
