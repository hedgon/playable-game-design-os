# Review of senior-game-designer and senior-game-developer-ai-era

Method: every step's linked topic (all of what/why/think/how/verify/test), game lens, checklist, smell, prompt and tool was read against the step's why and do. Verdicts: OK, FIXED (edited in src/50-paths.js or src/51-paths-engineering.js), FLAG (left, noted).

## senior-game-designer (43 steps, 5 stages)
| Item | Verdict | Note |
|---|---|---|
| s1 design-pillars, core-experience, canvas, audience-and-positioning, smell pillars-are-slogans, reflect | OK | why/do match topic (tie-break, owner, change rule, canvas "what it is not") |
| s1 hades gameplay lens | FIXED | lens is about a bounded boon choice at a door, not a mechanic that refuses the promise; do rewritten to the rule held, what it forbids, its named cost |
| s1 celeste gameplay lens | FIXED | lens is about ten grace windows, not omitted features; do rewritten |
| s2 economy-and-resources, modelling-and-balance (10 percent / 30 percent rule), progression, sysmap, reflect | OK | |
| s2 craft-gameplay-math | FIXED | topic is vectors, dot product, lerp, quaternions; it teaches no drop rates or curves. Step removed (topic stays in three other paths); its 40 min and the seeded-script task moved to the reflect step (20 to 60 min) |
| s2 cookie-clicker lens | FIXED | do asked for an "hour the first sink stops mattering" the lens does not give; now formula plus 1st/10th/50th copy price |
| s2 hearthstone business lens | FIXED | lens has no archetypes; do now free player vs spender and the lossy dust conversion |
| s3 live-design-seasons-and-data, metrics-and-success, live-operations, monetisation-design, ethics-and-responsibility | OK | minutes fit reading length plus task |
| s3 candy-crush lens | FIXED | why/do claimed cohort numbers the lens does not contain; now the purchase moment and the goal-metric-plus-retention-guardrail pairing |
| s3 fortnite lens | FIXED | lens is engagement pool and cosmetics-only, not a faster calendar; why/do rewritten |
| s3 build | FIXED | "a given data sheet" does not exist for a solo learner; now own data or labelled invented numbers |
| s4 design-critique, design-documents, team-and-collaboration | OK | |
| s4 design-review checklist | FIXED | no "verdict" in the checklist; do now lists what its questions found that gut missed; 45 to 35 min |
| s4 learning-from-success | FIXED | topic teaches comparables dissection, not the teardown sheet (that is in the critique topic); do covers both; 30 to 40 min |
| s4 lead-one-on-ones | FIXED | "mentee" not available to a solo learner; wording widened |
| s4 lead-feedback-performance | FIXED | why claimed the critique topic's order; now matches the topic (observation vs judgement, fair written next step) |
| s4 build | FIXED | "sample junior design" did not exist; now own early work treated as a junior's |
| s5 scope-control, pm-scoping-cuts, scope-sanity, pitching-and-stakeholders | OK | |
| s5 pm-cross-discipline | FIXED | solo learner has no engineering contacts; labelled own guesses allowed |
| s5 lead-saying-no | FIXED | the four kinds of no are in the pitching topic, not here; do now covers the displacement method of this topic and the sort from the pitch |
| s5 reflect, build | FIXED | memo tied to a rehearsed pitch; build said five-minute pitch vs ten in the step; unified |
| Recall questions (16) | OK | answers verified against topics (Kluger-DeNisi 607 effects and 38 percent negative, 6 percent SRM, 30 percent sweep rule, four noes) |
| Skip questions (all stages) | OK | fair |
| Minutes | OK | every stage sums to hours x 60 (240, 300, 270, 240, 270) |
| Speed or outcome promises | OK | none; pillars answer states no study shows pillars improve outcomes |

## senior-game-developer-ai-era (41 steps, 6 stages)
| Item | Verdict | Note |
|---|---|---|
| s1 craft-engineer-in-the-ai-era, craft-design-patterns, craft-entities-and-scenes, craft-performance | OK | |
| s1 lead-conventions | FIXED | topic never mentions agents; why reworded. Do duplicated the reflect ADR, now three dated rules |
| s1 reflect (ADR) | FIXED | 35 to 50 min for a measured ADR; stage now sums to 240 |
| s2 ai-agentic-implementation | FIXED | why cited a skill-formation study the topic does not contain |
| s2 craft-verification-as-the-job, craft-tools-that-work-with-ai, agent-rules-file, craft-teaching-agents | OK | |
| s2 prompt verify | FIXED | why overstated it as a check; it asks the model to expose its own claims |
| s2 ai-evals | FIXED | why cited benchmark flaws that live in another topic; ten cases labelled a starter (topic advises 50 to 200); 50 to 60 min |
| s2 craft-game-loop-timestep | FIXED | 40 to 50 min (record, replay, assert at fixed step) |
| s2 recall "what can a benchmark score not tell" | FIXED | dropped "contaminated" (not in that topic); kept the audited SWE-bench flaw claim |
| s3 lead-code-review, craft-security-review-of-generated-code, models-security-and-operations, craft-save-systems | OK | study figures match (Perry et al., Veracode as vendor claim) |
| s3 craft-over-defensive-code | FIXED | "costs frames" not in topic; now hides failures and costs reader time; 25 to 20 |
| s3 craft-what-matters-now | FIXED | minutes 30 to 25 (short topic) |
| s3 checklist ai-verify | FIXED | checklist is design-output oriented (assumptions, kill criterion); do now points it at the change's claims, not at code |
| s4 craft-measuring-ai-uplift, craft-ai-cost-latency-budget, ai-architecture-boundary | OK | 19 percent slower, 20 percent belief, 26.08 percent field figure all match; path promises no speedup |
| s4 models-reasoning-and-scaling | FIXED | do now names the three benchmark decay modes; 40 to 30 |
| s4 models-prompt-caching | FIXED | do used "the listed cache price" which appears only in the next topic (forward reference); now asks the learner to read the vendor page |
| s4 models-open-and-closed | FIXED | why said choice follows budget; topic is licence, offline, cost, control; 30 to 25 |
| s4 ai-budgets-and-debugging | FIXED | topic covers in-game AI per-frame budgets, not model calls; why/do state that; 25 to 20 |
| s5 lead-junior-skill-formation-with-ai, lead-conflict-growth | OK | study caveats (52 people, one quiz, vendor-run) kept |
| s5 lead-onboarding | FIXED | why claimed generated summaries; topic teaches first real change plus pairing; 30 to 25 |
| s5 lead-one-on-ones | FIXED | topic does not say the 1:1 tests tool-free skill; why reworded |
| s5 craft-clean-code-ai-era | FIXED | why tied to juniors; now readability for reviewer, agent and junior, with the topic's rules named in do |
| s5 recall "why keep no-assistant practice" | FIXED | answer stated skill fade as fact; now says payback plausible but unproven (one small study) |
| s6 lead-incidents | FIXED | why claimed "what the author understood"; topic asks whether AI change contributed and rollback rehearsed |
| s6 quality-and-build-health | FIXED | why overstated; reworded to what the topic teaches |
| s6 pm-postmortems, lead-saying-no, reflect | OK | |
| s6 pm-cross-discipline | FIXED | "in days" replaced with each discipline's own units |
| Recall questions (21) and skip questions | OK except the two fixed above | |
| Minutes | FIXED | stages summed 225, 280, 250, 260, 185, 180 against hours; now 240, 300, 240, 240, 180, 180 |
| Speed or outcome promises | OK | outcome says the evidence does not promise a speedup; measurement first |

## Chooser (81 picks, time changes only the week count)
| Row | Verdict |
|---|---|
| New and Some experience for all 9 goals | OK unchanged, no new path in any of them |
| design/senior | OK senior-game-designer first, five design paths follow |
| gameplay/senior, ai/senior | OK senior-game-developer-ai-era first |
| lead/senior | OK technical-lead first, dev and designer senior paths as alts (plan: third for designer) |
| backend/senior | FLAG: senior-game-developer-ai-era first, ahead of live-game-backend-engineer and netcode-server-engineer. Path content is client-leaning (timestep, save systems, frame budgets, entities and scenes); a mentor may put the backend path first |
| ai/senior | FLAG (minor): an experienced designer or producer choosing "Build with AI" gets a developer path; the alt is ai-engineering-for-game-devs |
| other senior rows (ship, iv-*, elsewhere) | OK unchanged |

## Checks run
node src/validate.js exit 0 (0 errors); node src/check-layout.js OK (overlaps 0); tsc -p jsconfig.json exit 0; node src/e2e-paths.js with PLAYWRIGHT_CHANNEL=msedge 100/100. No new long-text warnings from the two paths.
