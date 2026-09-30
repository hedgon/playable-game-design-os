---
status: shipped
updated: 2026-09-30
---

# Content audit: lessons, paths and the curriculum

## Goal

The owner asked on 2026-09-30 why the teaching content itself had never been audited. The earlier passes covered only these things:
- content cut to fit caps (the cap audit);
- near-cap game lenses against the analysis method;
- UX and navigation (two learner walkthroughs).

None of them checked whether the lessons teach well. This audit checks three layers, top down:
1. **Curriculum.** Does the set of 186 topics in 23 domains cover what a game designer or game developer needs, at the right levels, without gaps, overlaps or contradictions?
2. **Paths.** Do the 21 paths reach their stated outcome? They should be in a sensible order, with correct prerequisites, realistic time, practice in every stage, and checkpoints that test the stage goal. Does the chooser send each learner to the right path?
3. **Topics.** Is each topic correct, clear, at its stated level, actionable and tied to real games? Is its engine code current and working, and are its interview questions sound?

The fixes follow the same rules as before:
- Plain words.
- Every new fact sourced and independently fact-checked.
- No padding.
- Restore or add only what a learner needs.

## Working rules

- Opus orchestrates and Sonnet 5.5 workers do the work, at most two agents at once.
- Audits are read-only.
- Fixes go in batches that own separate files.
- The checklist is updated after each task.
- Each phase is committed and pushed, only after the CI steps pass on that commit in a clean worktree.
- No AI attribution in commits.

## Checklist

Status: `todo`, `doing`, `done`.

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| P1 | Paths audit: all 21 paths and the chooser's 81 combinations | done | 32 findings (6 high, 15 medium, 11 low) in [findings-paths.md](findings-paths.md); 6 chooser rows a mentor would not give |
| K1 | Curriculum audit: coverage against established curricula, gaps, overlaps, level progression, domain structure | done | 10 gaps (K-1 to K-10: gameplay math and algorithms, client engine architecture, rollback, physics, save systems, audio, economy and monetisation depth, multiplayer design), 6 overlap clusters, 3 orphan topics; games show 82 of 186 topics (orchestrator recount) |
| T1 | Topics: player, experience, core, systems, content, level (39) | done | 29 findings (1 high, 12 medium, 16 low): 5 engine snippets would fail; 3 "what" walls; weak "In real games" links on pacing, level structure, spatial composition |
| T2 | Topics: ux, narrative, presentation, product, production (32) | done | 26 findings (4 high, 10 medium, 12 low): broken Godot rebind save, a wrong date, a false Godot pitfall, a wrong Unity batching claim; mis-tagged game links; about 10 facts still to verify in the fix phase |
| T3 | Topics: ai, gameai, studio (29) | done | 26 findings (5 high, 11 medium, 10 low): 5 engine snippets would not run (undeclared calls, one-shot signal bug, unpolled TCP, Edit Mode scene load); Godot 3 wording; 3 facts to verify |
| T4 | Topics: backend, infra, server (27) | done | 28 findings (6 high, 13 medium, 9 low): all 6 highs are engine snippets that would not compile or run (string version compare, missing File.Replace guard, wrong array types, stub type error); prose and interview answers held up |
| T5 | Topics: management, leadership, platforms (25) | done | 16 findings (0 high, 4 medium, 12 low); platform rules verified against official pages (Play, Apple, Steam, Xbox, PEGI, Meta, Roblox, Fortnite, Epic) |
| T6 | Topics: models, craft, careers (34) | done | 13 findings (0 high, 3 medium, 10 low); dated model, pricing and caching facts verified against vendor pages |
| X1 | Triage: merge findings, decide fixes (debate where unsure) | done | decisions below |
| F1 | Fixes: correctness first, then clarity, gaps and structure; new material fact-checked | done | fa 40 fixes, fb about 75 fixes; 25 game-link findings passed to G1 |
| N1 | New topics for the confirmed gaps (10 topics plus the lag-compensation example), fact-checked and code-reviewed | done | na: 6 topics plus the lag-compensation example, reviewed (17 fixes); nb: 4 topics, reviewed with primary sources where reachable (9 fixes, unsupported licence figures removed, secondary-only rules flagged) |
| G1 | "In real games" links: remove mis-tags, add real ones | todo | game data files |
| P2 | Paths fixes and placement of the new topics | done | 30 of 32 findings fixed; P-26, P-29 and P-32 kept with reasons; prereqAny, a real prototype in idea-to-prototype, netcode prediction and rollback stage, coding and math practice, engine fundamentals stages, real builds, 48 recall questions reworded to the stage goal, stable stage ids; chooser picks a mentor would give, and time changes only the weeks; 12 new topics placed |
| R1 | Independent fact-check and code review of every batch | done | fa, fb, na, nb, nc, game links and paths each reviewed by a second agent (about 45 more fixes, including stage-id stability and snippet bugs) |
| V1 | Checks, CI replay, archive | done | validate 0 errors (path coverage 198/198 topics, 107/107 games, 9/9 engines, 12/12 platforms, 12/12 checklists); check-layout 0 overlaps; tsc; smoke 242 visits; e2e 88/88; CI replay before every push |

## Findings and decisions

Audit reports: [findings-paths.md](findings-paths.md) (P-1 to P-32), [findings-curriculum.md](findings-curriculum.md) (K-1 to K-10, with orchestrator corrections), and `findings-topics-T1.md` to `findings-topics-T6.md` (138 topic findings: 16 high, 53 medium, 69 low).

**The main pattern.** Most high findings are engine snippets that would not compile or run: undeclared methods, unassigned components, wrong types, string version compares, freed nodes and unpolled sockets. That is about 20 of the 372 snippets. The prose, facts and interview answers mostly held up, and dated platform and model facts were verified against official pages.

**Topics (F1, batches fa and fb).** Apply every high and medium finding and every clear low one. Every changed snippet gets an independent code review before commit. "In real games" mis-tags are fixed separately (G1).

**New topics (N1).** Each gap below was checked against the data. No topic owns it:
- server: rollback netcode and deterministic lockstep; lag compensation gets a worked example in `server-authority`;
- craft: gameplay math (vectors, dot and cross products, interpolation and easing, rotations, spatial queries), the game loop and fixed timestep, entities and scenes (node and scene composition against ECS, and when each pays), physics and collision (controllers, tunnelling, layers, determinism), and save systems (serialization, versioning, corruption safety, cloud saves);
- careers: coding-interview practice for game roles (data structures and algorithms, gameplay math questions, system design);
- presentation: audio implementation (engine buses, FMOD and Wwise, ducking, adaptive-music hooks);
- product: monetisation design (IAP, gacha and odds-disclosure rules, battle passes, pricing, with the ethics link);
- core: multiplayer game design (co-op against PvP, balance, fair matching as a design problem).

Not added: economy balancing already has a real home in `economy-and-resources`, and profiling in `craft-performance`. K-9 stays low priority. The AI-era craft cluster overlaps in framing only (every pair scores under 0.21), so it stays. The three orphan topics (localization-and-culture, perception-and-awareness, adaptive-and-director-ai) get inbound `rel` links.

**Game links (G1).** Remove "In real games" tags where the lens does not show the topic, add tags only where a lens really does, and give topics with no game a real one where the library holds one.

**Paths (P1 fixes).**
- Engineering interview prep and technical lead each ask for one fitting specialty path, not all of them.
- game-ai-programmer asks for Godot or Unity, not both.
- idea-to-prototype builds a real prototype, and its playtest uses it.
- netcode adds the prediction, reconciliation, interpolation, lag compensation and rollback steps.
- Engineering interview prep adds coding and math practice.
- The gameplay-engineer paths skip the foundations overlap when foundations is done.
- The engine setup step comes before the first code step.
- Export-only builds become real builds.
- Unrealistic times are fixed.
- The six chooser rows a mentor would not give are fixed.
- The new topics are placed in the paths where they teach best.

## Outcome

- **Topics.** All 186 original topics were audited against a fixed rubric, and about 115 findings were fixed. Most of the high findings were engine snippets that would not have compiled or run; they now declare what they use and call real Godot 4 and Unity 6 APIs. Wrong facts and dates were corrected, and dated facts were refreshed against official pages. Every batch was reviewed by a second agent against the git diff.
- **Curriculum.** 12 new topics fill the gaps the audit confirmed against the data:
  - rollback netcode, gameplay math, the game loop and fixed timestep, entities and scenes, physics and collision, save systems;
  - coding interviews for game roles;
  - audio implementation, monetisation design, multiplayer design;
  - feedback and performance, conflict and growing people.
  
  Server-authority also gained a worked lag-compensation example. The library now has 198 topics.
- **Games to topics.** 349 "In real games" tags that did not fit were removed and about 88 real ones added. Topics shown by at least one game went from 82 of 186 to 95 of 198.
- **Paths.** 30 of 32 findings were fixed. The main changes:
  - a path can ask for any one of several base paths;
  - idea-to-prototype builds a real prototype;
  - netcode, interview prep and the gameplay paths gained the stages they lacked;
  - builds are real builds, and recall questions test the stage goal;
  - stage ids stay stable, so saved progress is kept;
  - the chooser gives a mentor's pick, and time changes only the weeks.
- **Kept on purpose:** P-26 (optional guides stay in ship-it so every guide is in a path), P-29 (the Godot topics teach 3D), P-32 (there is no advanced design path yet).
- **Open for later:**
  - an advanced design path (P-32);
  - the claims that rest on secondary sources because the primary page was unreachable (PEGI, the Belgian and Dutch rulings, China 2017, FMOD and Wwise licence terms), each flagged in its topic;
  - engine snippets are checked by reading against the docs, not compiled, because no Godot or Unity install is available here.
