# senior-game-designer path (D3), as built

Header: track design, level advanced, 22 h, prereq [], prereqAny [systems-designer, level-and-ux-designer, casual-game-people-keep, games-that-broke-the-mould], next [technical-lead, studio-practice-ai-era, interview-prep-designer]. Placed in src/50-paths.js just before technical-lead.

## Stages (minutes sum to hours*60)
1. Vision (4 h): design-pillars (tie-break, owner, change rule), core-experience, tool canvas, game hades (gameplay), audience-and-positioning, smell pillars-are-slogans, game celeste (gameplay), reflect (reply to a senior asking to break a pillar). Build: vision doc with five debated decisions resolved.
2. Economies (5 h): economy-and-resources, economy-modelling-and-balance (anchor, archetypes, 10 percent sweep, 30 percent fragility), progression, craft-gameplay-math, tool sysmap, game cookie-clicker (gameplay), game hearthstone (business), reflect. Build: spreadsheet plus seeded script and the failure it exposed.
3. Live (4.5 h): live-design-seasons-and-data (pre-registered metric, guardrails, smallest effect, sample size, end date), metrics-and-success, live-operations, game candy-crush-saga (business), monetisation-design, ethics-and-responsibility (decision record), game fortnite (business). Recall covers pre-registration, split check (SRM), limits of data, holdout for novelty. Build: one-season plan from a data sheet.
4. Reviewing and growing designers (4 h): design-critique-and-feedback (saw/meant/would-try notes about the work; task-focused feedback), checklist design-review, learning-from-success (teardown sheet), design-documents, lead-one-on-ones, lead-feedback-performance (goal, observation, effect, question; compare with own earlier work, specific praise), team-and-collaboration. Build: teardown review plus feedback note.
5. Scope, pitch and trade-offs (4.5 h): scope-control, pm-scoping-cuts, pm-cross-discipline (cost in each discipline's units, options), checklist scope-sanity, pitching-and-stakeholders, lead-saying-no (four kinds of no), reflect (decision memo). Build: cut list then five-minute pitch.

Step minutes are capped at 60 by the validator, so the longest topic steps are 60.

## Other path edits (src/50-paths.js)
- Added senior-game-designer to `next` of systems-designer, level-and-ux-designer, casual-game-people-keep, games-that-broke-the-mould (required by prereqAny reciprocity).
- Added it to technical-lead's prereqAny (senior designers stepping into leading), reciprocal via the new path's next.
- Engineering paths: no `next` edit needed. Optional for later: none of the engineering paths lead to design seniority; nothing to list.

## Chooser (all 81 combinations resolve to a real path; time never changes the pick)
Table lists the pick per goal and level (same for 2, 5 and 10 hours).
design/new game-designer-foundations; design/some systems-designer (unchanged); design/senior senior-game-designer (first; others follow); gameplay new/some gameplay-engineer-godot, senior game-ai-programmer; backend all live-game-backend-engineer (netcode-server-engineer has an unmet prereq); ship all ship-it; lead all technical-lead (senior list now also has senior-game-designer third); iv-design all interview-prep-designer; iv-eng all interview-prep-engineer; ai all ai-engineering-for-game-devs; elsewhere all game-skills-elsewhere.

## Tests
src/e2e-paths.js: two new checks at both widths (chooser picks the path for design/experienced and marks one card; path page renders stages s1 to s5). e2e-paths 92/92.

## Results
build/validate: 0 errors except "not in any learning path" for lead-junior-skill-formation-with-ai, craft-measuring-ai-uplift, craft-security-review-of-generated-code, craft-ai-cost-latency-budget (developer-path topics, accepted). All four new design topics and the three deepened ones are placed. check-layout, smoke (242 visits, 0 failures), tsc pass. Note node src/build.js exits nonzero because it runs validate.
