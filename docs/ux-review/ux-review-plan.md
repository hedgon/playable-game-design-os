---
status: active
updated: 2026-09-30
---

# UX review: library cards and a learner walkthrough

## Goal

The owner asked on 2026-09-30 for two things:
- Every library card image fills its cell. Find a better image, or adjust scale and crop, rather than showing a small picture over a blur or a letterboxed one.
- Walk the site as an experienced learner following the project's own guide, and improve what needs it: content, UI, UX, navigation and overall structure.

The same rules as the cap audit apply: Opus orchestrates, Sonnet 5.5 workers (at most two at once), the checklist is updated after each task, and every phase is committed and pushed. Commits and PRs carry no AI attribution lines.

## Checklist

Status: `todo`, `doing`, `done`.

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| G1 | Remove the Co-Authored-By trailer from all commits; global no-attribution rule | done | 15 commits rewritten, trees identical, force-pushed with lease; rule at the top of `~/.claude/CLAUDE.md`, attribution off in user settings |
| C1 | Library cards fill their cells: `card` and `cardPos` fields, cover everywhere | done | 7 card images (Subway Surfers, Candy Crush Saga, Fruit Ninja, Hearthstone, Wordle, Tetris, Wii Sports) and crop positions for Elden Ring, Fire Emblem, Super Smash Bros.; all 107 cards viewed at 375 and 1440, both themes; card markup lands with U1 |
| W1 | Learner walkthrough, two personas, 1440 and 375 | done | 12 findings in [findings-learner.md](findings-learner.md) |
| U1 | Learning flow: task shown on step pages, one-click continue, chooser by prerequisites and hours per week, duplicate steps, lens deep links, guide, review route (L1 to L4, L8, L12) | done | task line in a sticky path bar; one-click continue; chooser ranks by prerequisites and asks hours per week; duplicate steps named or merged with an engine choice; 65 steps deep-link to their lens; guide cards link to paths; #/paths/review opens the review queue. e2e 63/63 |
| U2 | Layout and navigation: readable map, contextual left column, phone header and drawers, one Projects entry, Make grouped by job, library by lens and topic, smells to games (L5 to L7, L9 to L11) | done | map labels never below 11 px; topic pages open text-first with the map one click away (index folds so labels stay whole); left column follows the section; phone header with a More menu, full-page topics and a Map button; one Projects entry; Make grouped by job with use-when and why links; library "What it teaches" and lens chips; smells link to games; path bar wraps; smoke fails on content past the pane edge. smoke 238, e2e 63/63 |
| W2 | Second walkthrough to verify U1 and U2 and cover what W1 missed: stages 2 to 4, the review queue, phone Tab order | todo | |
| V1 | Full checks and visual check; archive this plan | todo | |
