---
status: active
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
| T1 | Topics: player, experience, core, systems, content, level (39) | doing | |
| T2 | Topics: ux, narrative, presentation, product, production (32) | todo | |
| T3 | Topics: ai, gameai, studio (29) | todo | |
| T4 | Topics: backend, infra, server (27) | todo | |
| T5 | Topics: management, leadership, platforms (25) | todo | |
| T6 | Topics: models, craft, careers (34) | todo | |
| X1 | Triage: merge findings, decide fixes (debate where unsure) | todo | |
| F1 | Fixes: correctness first, then clarity, gaps and structure; new material fact-checked | todo | |
| V1 | Checks, CI replay, archive | todo | |
