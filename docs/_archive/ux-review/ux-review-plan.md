---
status: shipped
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
| W2 | Second walkthrough to verify U1 and U2 and cover what W1 missed: stages 2 to 4, the review queue, phone Tab order | done | L1 to L12: 8 fixed, 4 partly (all phone-side); 11 new findings N1 to N11 in [findings-learner2.md](findings-learner2.md) |
| U3 | Fix the second walk: phone path bar and anchors, More menu stacking, drawer focus, findable export and import, compact library chips, Make on phones, Map pill only where it belongs, path bar state, review on day one, "read" only when read (N1 to N8, N10, N11) | done | N9 kept ("Projects" stays). Phone path bar sticks at the top and folds to one 44 px line on scroll; anchors land below it; More menu above the page; closed drawers inert; progress backup and restore on the Paths page; library chips compact (first card at y=549 on 1440x900); Make tools in the page on phones; Map pill only on map pages; checkpoint state in the bar; Practise now in review; topics count as read only when marked. e2e 86/86 |
| V1 | Full checks and visual check; archive this plan | done | build, validate (0 errors), check-layout (0 overlaps, 0 shortened labels), contrast, tsc, smoke (238 visits, 0 failures), e2e 86/86; every commit replayed through the CI steps in a clean worktree before push |

## Outcome

- Every library card is filled edge to edge by a real store or game picture, with nothing important cut. Game pages still show the full header.
- A first walkthrough (12 findings) and a second one (11 more, plus a re-check of the first 12) drove three rounds of changes:
  - The step's task stays in view and "continue" moves on.
  - The chooser respects prerequisites and hours per week, and duplicate steps are gone.
  - Steps link straight to the lens they name.
  - The map is readable and yields the page to the text on topic pages.
  - The left column follows the section.
  - Phones get a working header, full pages, a compact path bar and correct focus.
  - Make, the library and Diagnose connect tools, games and smells to what they teach.
  - Progress controls can be found, review works on day one, and "read" means read.
- Kept on purpose: the name "Projects" (N9).
- Left for later: the Review and spaced-repetition model itself was only checked for usability, not redesigned.
