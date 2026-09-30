# Review: learning-path changes (R1 for P2)

Verdicts: OK (accepted as written), FIXED (reviewer edited), FLAG (left, for the coordinator).

| # | item | verdict | note |
|---|---|---|---|
| 1 | Log-marked fixes present in data (P-1..P-32, rounds 1-4) | OK | prereqAny, next lists, hours, new stages, solo variants, recall rewording all found in the diff; P-18 topics placed in technical-lead s1 |
| 2a | idea-to-prototype S2/S3 new steps (engine choice, 45-min grey-box, 55-min playtest) | FIXED | hypothesis step said "your slider" before the slider exists; now "the slider you build next". 45 min for a first grey-box is tight but achievable |
| 2b | gameplay godot/unity `fund` stage (7 steps, 210 min = 3.5h) | FIXED | Celeste step assumed a jump already existed; now "give it a jump if it has none". Reading times are 1-5 min per topic, so task time dominates |
| 2c | godot/unity refresher steps (12 min) | OK | topic overviews are 1.7-2.3 min of reading |
| 2d | backend build steps (skeleton, middleware+test, migration, cache, alert) | OK | each names something written or run |
| 2e | netcode prediction/rollback, multiplayer-design, lag-compensation | OK | steps possible from stage one; times 45 |
| 2f | netcode s3 skip questions | FIXED | one skip question still asked about the system map after its step was removed; dropped |
| 2g | worlds s4 audio-implementation (Godot/Unity build in a design path) | FIXED | added that it needs Godot 4 or Unity 6 installed |
| 2h | technical-lead s1 (9 steps, 3.75h) and two new lead topics | OK | guide overrun only, validator warns not errors |
| 2i | casual S1 prototyping, S3 monetisation-design, S4 web/cocos | OK | build needs a tester; ask is in the step |
| 2j | interview-prep-engineer `code` stage | OK | timed set and whiteboard fit the stated minutes |
| 3 | Reworded recall questions (about 60) | OK | spot-checked every changed question against its outline; principle stated, game as example, answers still fit. "Should we build this" heaviest penalty (-3 on `simpler` and `without`) verified in FEATURE_TREE |
| 4 | New builds | OK | all prove the stage goal and are solo-doable |
| 5 | Stage-id stability | FIXED | netcode id `s2` had changed from "Sync and protocol" to "Hide the wait: prediction and rollback". Swapped: `s2` is again Sync and protocol (state-sync, protocol, framing, request-context; added the rate recall question; hours 2.1), and the prediction/rollback stage is the new id `s2b` (hours 1.85). `fund`, `code` and other new ids are new. Backend ids s1..s5 are original |
| 6 | Chooser, 81 picks | FLAG (mild) | picks match the log. Rows a mentor might question: lead/new -> technical-lead (advanced; audience is people stepping into leading, note names good bases, acceptable); backend/new -> live-game-backend-engineer (intermediate, assumes Go, audience says so); iv-eng/new -> interview-prep-engineer (needs something built, note names bases); gameplay/senior -> game-ai-programmer (assumes Godot/Unity known, its S1 opens with an engine refresher) |
| 7 | No step lost | OK | validate.js: every topic, game, guide, checklist in a path |

After: `node src/validate.js` 0 errors (OK line, warnings are guide overruns); `node src/build.js` JS OK; `node src/check-layout.js` 0 overlaps; tsc exit 0; `node src/e2e-paths.js` 88/88.
