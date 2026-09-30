# senior-game-developer-ai-era (E3), as built

Header: track engineering, level advanced, 23 h, prereq [], prereqAny [gameplay-engineer-godot, gameplay-engineer-unity, live-game-backend-engineer, netcode-server-engineer, build-and-release-engineer, game-ai-programmer], next [technical-lead, studio-practice-ai-era, interview-prep-engineer]. Placed in src/51-paths-engineering.js before studio-practice-ai-era. Pick line: "Own the architecture, checks and team when AI codes" (51 chars).

## Stages (step minutes; evidence basis)
1. Architecture and boundaries, 4 h (225 min): craft-engineer-in-the-ai-era 45 (He et al.: lines +281% transient, warnings/complexity persistent), craft-design-patterns 30, craft-entities-and-scenes 30, craft-performance 45 (frame/memory budget), lead-conventions 40, reflect 35 (ADR). Rule of thumb where no study: patterns, data ownership.
2. Specify and verify, 5 h (280): ai-agentic-implementation 45 (skill-formation study: whole-task delegation did worst), craft-verification-as-the-job 45 (Stack Overflow 66% almost right, 45.2% debugging; DORA), craft-tools-that-work-with-ai 30, prompt verify 20, ai-evals 50 (SWE-bench flaw caveat), checklist agent-rules-file 20, craft-teaching-agents 30, craft-game-loop-timestep 40 (replay/seed as a check; rule of thumb).
3. Review and security, 4 h (250): lead-code-review 40 (rule of thumb: tests/deletions first; Perry et al.), craft-what-matters-now 30, craft-security-review-of-generated-code 60 (Perry et al., Pearce, Veracode), models-security-and-operations 40, craft-over-defensive-code 25, craft-save-systems 35, checklist ai-verify 20.
4. Measure, budget and choose, 4 h (260): craft-measuring-ai-uplift 60 (METR RCT 19% slower vs 20% believed faster; 2026 update very weak; Cui et al. +26%), models-reasoning-and-scaling 40 (benchmark caveats, METR time horizons), models-prompt-caching 25, craft-ai-cost-latency-budget 60 (vendor pricing; re-check date), models-open-and-closed 30, checklist ai-architecture-boundary 20, topic ai-budgets-and-debugging 25.
5. Grow the team, 3 h (185): lead-junior-skill-formation-with-ai 55 (Anthropic skill-formation study, small groups), lead-onboarding 30, lead-one-on-ones 30, lead-conflict-growth 30, craft-clean-code-ai-era 25, reflect 15.
6. Incidents and technical direction, 3 h (180): lead-incidents 40, pm-postmortems 30, quality-and-build-health 30, lead-saying-no 30, pm-cross-discipline 30, reflect 20 (technical direction note with rollback). Rule of thumb; no evidence beyond DORA stability findings.
Total 1380 min = 23 h. Every stage has recall (3 or 4), a solo-friendly senior build, and 4 to 5 skip questions. No game steps (no lens shows a point here).
Deviations from the research outline: verify is a prompt (kind prompt), not a tool; ai-budgets-and-debugging is a topic, not a checklist; certification-and-review and scope-control left out to stay inside the stage hours rule.

## Other path edits
- Added the path to `next` of gameplay-engineer-godot, gameplay-engineer-unity, live-game-backend-engineer, netcode-server-engineer, build-and-release-engineer, game-ai-programmer (required by prereqAny).
- Designer log listed no engineering `next` edits; none made beyond the above. technical-lead prereqAny unchanged (not required).
- Designer chooser rows kept (design/senior first senior-game-designer; lead/senior now technical-lead, senior-game-developer-ai-era, studio-practice-ai-era, senior-game-designer).

## Chooser (81 combinations, time never changes the pick; every one resolves to a real path)
gameplay: new gameplay-engineer-godot; some gameplay-engineer-godot; senior senior-game-developer-ai-era
backend: new live-game-backend-engineer; some live-game-backend-engineer; senior senior-game-developer-ai-era
ai: new ai-engineering-for-game-devs; some ai-engineering-for-game-devs; senior senior-game-developer-ai-era (ai-engineering-for-game-devs follows)
lead: new technical-lead; some technical-lead; senior technical-lead (new path second, then studio-practice-ai-era, senior-game-designer)
design: new game-designer-foundations; some systems-designer; senior senior-game-designer
ship: new/some/senior ship-it; iv-design interview-prep-designer; iv-eng interview-prep-engineer; elsewhere game-skills-elsewhere
Each row holds for 2, 5 and 10 hours a week (3 times x 27 goal-level cells = 81).

## Tests and results
src/e2e-paths.js: chooser picks the path first at Experienced for gameplay, backend and ai (one card marked), and the path page renders stages s1 to s6, at 375 and 1440 px. e2e-paths 100/100.
build ok; validate 0 errors (every topic in a path); check-layout 0 overlaps; tsc clean; smoke 242 visits, 0 failures.
