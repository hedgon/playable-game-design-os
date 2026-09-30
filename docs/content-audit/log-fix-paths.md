# Log: fix-paths (task P2)

Data model: new optional `prereqAny` (two or more path ids; one is enough). `choosePath` returns `anyOf` (the bases named to a learner who is new and has done none); it never forces a detour. Path page, path card and chooser show "one of A, B". Validator checks ids, no overlap with `prereq`, and that each listed path lists the dependant in its `next`. File touched beyond the brief list: `src/90-app.js` (three display lines and two helpers, needed for the path page, card and chooser chips).

## Findings (id | action | change)
| id | action | change |
|---|---|---|
| P-1 | fixed | interview-prep-engineer: `prereq` empty, `prereqAny` = godot, unity, live-game-backend, netcode; audience and outcome now include coding, gameplay math and system design |
| P-2 | fixed | technical-lead: `prereq` empty, `prereqAny` = systems-designer, level-and-ux, godot, unity, live-game-backend, build-and-release; godot, unity and backend list it in `next`; chooser ranks it first for lead at every level |
| P-3 | fixed | idea-to-prototype: S2 has a choice of engine (Godot/Unity setup step, GameMaker step, 25 min each); S3 adds a 45-minute grey-box prototype build (`prototyping`, Godot/Unity tab); the playtest reflect step now runs the session on that prototype (55 min); Ren'Py step kept for story-first (20 min); build and hours updated (11.25h to 13.5h) |
| P-4 | fixed | netcode: new stage "Hide the wait: prediction and rollback" (state sync, a 45-min prediction/reconciliation/interpolation build over a simulated 100 ms link, `server-rollback-netcode` 45-min build, CS2 lens, map); lag-compensation worked example added to the `server-authority` step plus a recall question; new "Protocol and idempotency" stage holds the envelope steps |
| P-5 | fixed | interview-prep-engineer: new stage "Code, gameplay math and system design": `careers-game-coding-interviews`, `craft-gameplay-math` and `craft-game-loop-timestep` interview tabs, a 45-min timed set (closest enemy, grid path, object pool), a 40-min whiteboard matchmaking design |
| P-6 | fixed | game-ai-programmer: `prereq` empty, `prereqAny` godot or unity |
| P-7 | fixed | godot and unity paths no longer require foundations; the six overlapping overview steps (core loop, decisions, mechanics, feedback, juice, controls) are now 12-minute refreshers marked "skim it if you finished Game designer foundations"; foundations still lists both in `next` |
| P-8 | fixed | godot and unity S1 start with the engine step, now with install and new-project setup (25 min); game-ai S1 opens with the engine refresher |
| P-9 | fixed | backend, netcode, build-and-release: every stage build is now something written or run (skeleton, middleware and test, migration and cached read, alert and profile, prediction log, envelope test, matchmaking test, tamper test, chaos-run log, pinned image, stamp script, entry script logs, hashed-asset test); tool exports demoted to supporting evidence |
| P-10 | fixed | build-and-release S3 has a 40-min Unity step to write `BuildScript.Build` and run it for two targets; audience states a project is needed |
| P-11 | fixed | five engine guides cut to two with real work: Blender (S1, 30 min, headless glTF export) and Unreal (S4, 25 min, BuildCookRun); web and cocos re-homed to casual S4; Unity engine guide added in S3 |
| P-12 | partly | the rule already accepts a checklist, so no validator change; backend delegate steps rewritten to produce work; ai-engineering S4 engine step now Godot or Unity; netcode still uses the system map as its tool (now supporting evidence); casual S4 keeps Defold (guide must stay in a path) |
| P-13 | fixed | FNAF (30 min, writes the drain script and GdUnit test), Deus Ex (35 min, builds the two-route door), Halo (40 min, rules plus grey-box arena), Pac-Man (30 min, grid array, no TileMap), Smash (20 min, design note instead of "play or watch"); Crash 25 min, Sonic 30 min |
| P-14 | fixed | study-the-hits-play and worlds require game-designer-foundations; foundations lists both in `next` |
| P-15 | partly | five trivia questions reworded as principle with the game as example (Viewfinder, FFXII, Dota, Worms, Tetris); the outlines already carry the principle; the rest untouched |
| P-16 | fixed | zero-escape 15 to 25, smt 20 to 28, superhot 20 to 28, final-fantasy 20 to 26, danganronpa 15 to 24; broke-the-mould 13h to 14h |
| P-17 | partly | outcome now says "plan a soft launch ... that will prove"; S1 loop step includes a 60-second paper-prototype with a stranger (40 min); iOS soft-launch not added |
| P-18 | unresolved | needs two new lead topics (feedback and conflict; stakeholders); no topic exists to place |
| P-19 | fixed | ai-engineering S3: 45-min step to call a model, validate JSON and log latency, tokens and schema failures over 20 calls |
| P-20 | fixed | interview-prep-designer: `prereq` = foundations only; some and senior go straight to it |
| P-21 | fixed | godot, unity, backend, build-and-release no longer require foundations; gameplay/new and backend/new start with the engineering path |
| P-22 | fixed | backend stage ids renumbered s1..s5 in order (progress saved on the old s3, s4, s5 of that path will shift) |
| P-23 | not done | repeated checklist tasks left as is (low) |
| P-24 | partly | `next` of game-skills-elsewhere now leads with ai-engineering; farmer topic stays |
| P-25 | fixed | eight personal recall questions reworded |
| P-26 | partly | ship-it audience says UGC, VR and web are optional routes; CI step rewritten for producers; platform fortnite added to S1; guides and games stay (each must remain in a path) |
| P-27 | not done | studio-practice unchanged (low) |
| P-28 | partly | game-ai S1 now intermediate; foundations S3/S4 left as a ramp |
| P-29 | not done | godot S4 3D worked example left (the topic tabs teach 3D navigation) |
| P-30 | partly | idea-to-prototype runs the session; other paths not changed |
| P-31 | not done | time label left |
| P-32 | partly | gameplay/senior now offers game-ai first; the rest identical by design |

## Re-homed after the first validate run
Engine guides: blender (build-and-release S1), unreal (build-and-release S4), web and cocos (casual S4); defold, gamemaker and renpy kept. Game beat-saber moved to gameplay-engineer-unity S5 (15 min, automated checks). Platform fortnite added to ship-it S1.

## Placement of the ten new topics
| topic | path / stage | step |
|---|---|---|
| server-rollback-netcode | netcode-server-engineer / s2 "Hide the wait: prediction and rollback" | 45 min, Godot tab (Unity alt): two-player toy sim with saved states, late input, compare with a no-lateness run |
| craft-game-loop-timestep | gameplay-engineer-godot and -unity / new stage `fund` "Engine fundamentals" (after s1); interview-prep-engineer / `code` (interview tab) | 30 min delta log at 30 fps; 20 min interview answer |
| craft-gameplay-math | both gameplay paths / `fund`; interview-prep-engineer / `code` (interview tab) | 35 min view-cone check with dot and smoothed turn; 25 min ten questions aloud |
| craft-physics-and-collision | both gameplay paths / `fund` (with a 20-min Celeste coyote-time and buffer step) | 35 min four-layer setup and tunnelling test |
| craft-entities-and-scenes | both gameplay paths / `fund` | 30 min enemy scene or prefab with Health, plus a 25-min system map step |
| craft-save-systems | both gameplay paths / `fund`; live-game-backend-engineer / s3 | 30 min safe write and corrupt-file test; 30 min versioned record and migration test |
| careers-game-coding-interviews | interview-prep-engineer / `code` | 30 min plan; 45 min timed set of three problems; 40 min whiteboard |
| audio-implementation | study-the-hits-worlds / s4 "What the eye and ear are told" (after audio-and-music) | 45 min buses, duck, slider, voice count (Godot tab, Unity alt) |
| monetisation-design | casual-game-people-keep / s3 (after business-model) | 45 min rules table and effective-rate run over 10,000 pulls (Godot tab, Unity alt) |
| multiplayer-design | study-the-hits-play / s5 (after social-experience); netcode-server-engineer / s3 (before server-matchmaking) | 45 min roles, counters, matching rule, ten queue rounds; 25 min fairness rule for the ticket |

Path hours now: godot 18.25, unity 18.5, backend 16, netcode 18.25, build-and-release 15.5, game-ai 10.05, interview-prep-engineer 12.5, ship-it 10.5, ai-engineering 13.25, idea-to-prototype 13.5, broke-the-mould 14, hits-play 13, hits-worlds 12, casual 12.25.

## Chooser (81 combinations; weeks at 2 / 5 / 10 hours a week; time does not change the pick)
| goal | level | pick | runners-up | start first | note | weeks 2/5/10 |
|---|---|---|---|---|---|---|
| design | new | game-designer-foundations | idea-to-prototype-30-days | none |  | 5/2/1 |
| design | some | systems-designer | level-and-ux-designer, casual-game-people-keep, games-that-broke-the-mould, study-the-hits-play, study-the-hits-worlds | none |  | 7/3/2 |
| design | senior | systems-designer | level-and-ux-designer, casual-game-people-keep, games-that-broke-the-mould, study-the-hits-play, study-the-hits-worlds | none |  | 7/3/2 |
| gameplay | new | gameplay-engineer-godot | gameplay-engineer-unity | none |  | 10/4/2 |
| gameplay | some | gameplay-engineer-godot | gameplay-engineer-unity, game-ai-programmer | none |  | 10/4/2 |
| gameplay | senior | game-ai-programmer | gameplay-engineer-godot, gameplay-engineer-unity | none |  | 6/3/2 |
| backend | new | live-game-backend-engineer | none | none |  | 8/4/2 |
| backend | some | live-game-backend-engineer | netcode-server-engineer | none |  | 8/4/2 |
| backend | senior | live-game-backend-engineer | netcode-server-engineer | none |  | 8/4/2 |
| ship | new | ship-it | none | none |  | 6/3/2 |
| ship | some | ship-it | build-and-release-engineer, casual-game-people-keep | none |  | 6/3/2 |
| ship | senior | ship-it | build-and-release-engineer, casual-game-people-keep | none |  | 6/3/2 |
| lead | new | technical-lead | none | none | good base: systems-designer, level-and-ux-designer, gameplay-engineer-godot, gameplay-engineer-unity, live-game-backend-engineer, build-and-release-engineer | 6/3/2 |
| lead | some | technical-lead | studio-practice-ai-era | none |  | 6/3/2 |
| lead | senior | technical-lead | studio-practice-ai-era | none |  | 6/3/2 |
| iv-design | new | interview-prep-designer | none | game-designer-foundations |  | 6/3/2 |
| iv-design | some | interview-prep-designer | none | none |  | 6/3/2 |
| iv-design | senior | interview-prep-designer | none | none |  | 6/3/2 |
| iv-eng | new | interview-prep-engineer | none | none | good base: gameplay-engineer-godot, gameplay-engineer-unity, live-game-backend-engineer, netcode-server-engineer | 7/3/2 |
| iv-eng | some | interview-prep-engineer | none | none |  | 7/3/2 |
| iv-eng | senior | interview-prep-engineer | none | none |  | 7/3/2 |
| ai | new | ai-engineering-for-game-devs | none | none |  | 7/3/2 |
| ai | some | ai-engineering-for-game-devs | none | none |  | 7/3/2 |
| ai | senior | ai-engineering-for-game-devs | none | none |  | 7/3/2 |
| elsewhere | new | game-skills-elsewhere | none | none |  | 4/2/1 |
| elsewhere | some | game-skills-elsewhere | none | none |  | 4/2/1 |
| elsewhere | senior | game-skills-elsewhere | none | none |  | 4/2/1 |

Rows changed from the audit: gameplay/new (no foundations first), backend/new (direct), lead new, some and senior (technical-lead first), iv-design some and senior (direct; new starts with foundations only), iv-eng new, some and senior (direct, good bases named), gameplay/senior (game-ai first), ship/some (build-and-release before casual).

## Round 2 (coordinator follow-up; supersedes the rows above where they differ)
| id | action | change |
|---|---|---|
| stage ids | reverted | backend stage ids are back to the original s3 (Cache), s4 (Observe), s5 (Idioms), in file order; saved progress is not shifted. The netcode stages added earlier already have new ids (s2b) |
| P-12 | fixed | validator now needs one tool or checklist step per path, not per stage; docs say a stage holds one only when its why serves the stage goal. Removed: netcode system map from s2, s2b, s3, s4 (kept s1 and the closing s5); backend s1 delegation planner (now a build step) and s4 (Cache) delegation review; ship-it s1 Should We Build This and s2 delegation planner. Casual S4 Defold is an engine guide, not a tool, and every engine guide must stay in a path, so it stays |
| P-15 | fixed | 48 recall questions that named a game now ask the transferable principle with the game as the example; answer outlines unchanged and still correct |
| P-17 | fixed | casual S1 has a 45-min prototyping step (build, ask one person, watch 60 seconds); S4 build requires thresholds and a worked LTV:CPI calculation; outcome says so |
| P-23 | fixed | systems S3 depth task, level-and-ux S3 feedback matrix and idea-to-prototype hypothesis step reworded to different objects; godot/unity repeats are alternatives (a learner does one) and stay |
| P-24 | fixed | game-skills-elsewhere next = ai-engineering-for-game-devs, technical-lead |
| P-27 | fixed | 17 studio-practice steps mentioning a team got a solo variant; audience says solo developers can follow |
| P-28 | fixed | validator: first stage level equals the path level and no stage rises more than one level; all 21 paths already pass |
| P-30 | fixed | worlds s4 playtest step +20 min to book and run one session; worlds s5 sends the sentence to three strangers first (+15 min); idea-to-prototype asks the tester a day ahead (55 to 60 min); casual S1 prototype step includes the tester |
| P-31 | fixed | chooser time options read 2, 5, 10 hours a week; at 2 hours a week a fitting path at least a fifth shorter with no unmet prerequisite goes first (only visible change: gameplay/some picks game-ai-programmer at 2 hours a week) |
| P-26 | left | every guide and game must stay reachable from a path, so ship-it keeps its UGC, VR and web guide steps and labels them optional in the audience |
| P-29 | left | the Godot topic tabs teach 3D navigation and perception, so a 2D example would not match the linked page |
| P-32 | left | there is no advanced design path to send seniors to; identical picks are honest until one exists |
| P-18 | not touched | lead-feedback-performance and lead-conflict-growth are written separately; until placed, validate lists exactly those two as in no path (build fails only on that) |

Hours now: netcode 16.25, backend 15.5, ship-it 10, casual 12.5, worlds 12.5.

## Chooser after round 2 (81 combinations all pick a real path; weeks at 2 / 5 / 10 hours a week)
| goal | level | pick | runners-up | start first | note | weeks 2/5/10 |
|---|---|---|---|---|---|---|
| design | new | game-designer-foundations | idea-to-prototype-30-days | none |  | 5/2/1 |
| design | some | systems-designer | level-and-ux-designer, casual-game-people-keep, games-that-broke-the-mould, study-the-hits-play, study-the-hits-worlds | none |  | 7/3/2 |
| design | senior | systems-designer | level-and-ux-designer, casual-game-people-keep, games-that-broke-the-mould, study-the-hits-play, study-the-hits-worlds | none |  | 7/3/2 |
| gameplay | new | gameplay-engineer-godot | gameplay-engineer-unity | none |  | 10/4/2 |
| gameplay | some | gameplay-engineer-godot | gameplay-engineer-unity, game-ai-programmer | none |  | 10/4/2 |
| gameplay | senior | game-ai-programmer | gameplay-engineer-godot, gameplay-engineer-unity | none |  | 6/3/2 |
| backend | new | live-game-backend-engineer | none | none |  | 8/4/2 |
| backend | some | live-game-backend-engineer | netcode-server-engineer | none |  | 8/4/2 |
| backend | senior | live-game-backend-engineer | netcode-server-engineer | none |  | 8/4/2 |
| ship | new | ship-it | none | none |  | 5/2/1 |
| ship | some | ship-it | build-and-release-engineer, casual-game-people-keep | none |  | 5/2/1 |
| ship | senior | ship-it | build-and-release-engineer, casual-game-people-keep | none |  | 5/2/1 |
| lead | new | technical-lead | none | none | good base: systems-designer, level-and-ux-designer, gameplay-engineer-godot, gameplay-engineer-unity, live-game-backend-engineer, build-and-release-engineer | 6/3/2 |
| lead | some | technical-lead | studio-practice-ai-era | none |  | 6/3/2 |
| lead | senior | technical-lead | studio-practice-ai-era | none |  | 6/3/2 |
| iv-design | new | interview-prep-designer | none | game-designer-foundations |  | 6/3/2 |
| iv-design | some | interview-prep-designer | none | none |  | 6/3/2 |
| iv-design | senior | interview-prep-designer | none | none |  | 6/3/2 |
| iv-eng | new | interview-prep-engineer | none | none | good base: gameplay-engineer-godot, gameplay-engineer-unity, live-game-backend-engineer, netcode-server-engineer | 7/3/2 |
| iv-eng | some | interview-prep-engineer | none | none |  | 7/3/2 |
| iv-eng | senior | interview-prep-engineer | none | none |  | 7/3/2 |
| ai | new | ai-engineering-for-game-devs | none | none |  | 7/3/2 |
| ai | some | ai-engineering-for-game-devs | none | none |  | 7/3/2 |
| ai | senior | ai-engineering-for-game-devs | none | none |  | 7/3/2 |
| elsewhere | new | game-skills-elsewhere | none | none |  | 4/2/1 |
| elsewhere | some | game-skills-elsewhere | none | none |  | 4/2/1 |
| elsewhere | senior | game-skills-elsewhere | none | none |  | 4/2/1 |

## Round 3
P-18 resolved: lead-feedback-performance (40 min, after 1:1s) and lead-conflict-growth (40 min, after the delegation planner) placed in technical-lead s1, which now has 9 steps (3.75h, a guide overrun only); path 12.25h. Build, validate (0 errors), layout, tsc, smoke and e2e (88/88) all pass; all 81 chooser combinations pick a real path.

## Round 4
P-31 reversed: the time answer only changes the about-N-weeks estimate; no path is swapped in. Chooser table, 2 / 5 / 10 hours a week (picks identical at all three; gameplay/some is godot again):

| goal | level | pick | runners-up | start first | note | weeks 2/5/10 |
|---|---|---|---|---|---|---|
| design | new | game-designer-foundations | idea-to-prototype-30-days | none |  | 5/2/1 |
| design | some | systems-designer | level-and-ux-designer, casual-game-people-keep, games-that-broke-the-mould, study-the-hits-play, study-the-hits-worlds | none |  | 7/3/2 |
| design | senior | systems-designer | level-and-ux-designer, casual-game-people-keep, games-that-broke-the-mould, study-the-hits-play, study-the-hits-worlds | none |  | 7/3/2 |
| gameplay | new | gameplay-engineer-godot | gameplay-engineer-unity | none |  | 10/4/2 |
| gameplay | some | gameplay-engineer-godot | gameplay-engineer-unity, game-ai-programmer | none |  | 10/4/2 |
| gameplay | senior | game-ai-programmer | gameplay-engineer-godot, gameplay-engineer-unity | none |  | 6/3/2 |
| backend | new | live-game-backend-engineer | none | none |  | 8/4/2 |
| backend | some | live-game-backend-engineer | netcode-server-engineer | none |  | 8/4/2 |
| backend | senior | live-game-backend-engineer | netcode-server-engineer | none |  | 8/4/2 |
| ship | new | ship-it | none | none |  | 5/2/1 |
| ship | some | ship-it | build-and-release-engineer, casual-game-people-keep | none |  | 5/2/1 |
| ship | senior | ship-it | build-and-release-engineer, casual-game-people-keep | none |  | 5/2/1 |
| lead | new | technical-lead | none | none | good base: systems-designer, level-and-ux-designer, gameplay-engineer-godot, gameplay-engineer-unity, live-game-backend-engineer, build-and-release-engineer | 7/3/2 |
| lead | some | technical-lead | studio-practice-ai-era | none |  | 7/3/2 |
| lead | senior | technical-lead | studio-practice-ai-era | none |  | 7/3/2 |
| iv-design | new | interview-prep-designer | none | game-designer-foundations |  | 6/3/2 |
| iv-design | some | interview-prep-designer | none | none |  | 6/3/2 |
| iv-design | senior | interview-prep-designer | none | none |  | 6/3/2 |
| iv-eng | new | interview-prep-engineer | none | none | good base: gameplay-engineer-godot, gameplay-engineer-unity, live-game-backend-engineer, netcode-server-engineer | 7/3/2 |
| iv-eng | some | interview-prep-engineer | none | none |  | 7/3/2 |
| iv-eng | senior | interview-prep-engineer | none | none |  | 7/3/2 |
| ai | new | ai-engineering-for-game-devs | none | none |  | 7/3/2 |
| ai | some | ai-engineering-for-game-devs | none | none |  | 7/3/2 |
| ai | senior | ai-engineering-for-game-devs | none | none |  | 7/3/2 |
| elsewhere | new | game-skills-elsewhere | none | none |  | 4/2/1 |
| elsewhere | some | game-skills-elsewhere | none | none |  | 4/2/1 |
| elsewhere | senior | game-skills-elsewhere | none | none |  | 4/2/1 |
