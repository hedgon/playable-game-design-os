---
status: shipped
updated: 2026-10-01
---

# Persona expansion: what the three auditors asked for more of

## Goal

The persona audit ([archive](../persona-audit/persona-audit-plan.md)) left eleven expansion requests open and two partly done. On 2026-10-01 the owner approved all of them except the set-aside item (lazy-loading the game data). This plan researches each, decides the shape, and builds it.

**Rules:**
- Coordinator on Opus; workers are Sonnet 5.5 at low effort (`writer-sonnet-low`); a fresh Sonnet reviewer fact-checks new content. At most two workers at once, never two on one file.
- This file is the running record: each task's row is updated when it lands, and every wave is committed and pushed after a CI replay in a clean worktree.
- No AI attribution. No cap cuts content; the coverage rule stays. Engine tabs stay Godot and Unity; Go gets its own tab.
- Illustrative numbers are labelled as illustrative; real figures carry a source.

## Research (2026-10-01)

| Request | What the research says | Decision |
| --- | --- | --- |
| 3Cs topic | Character, controls and camera are one interdependent system that decides the first minutes of feel; studios staff them as one feature team ([Pluralsight](https://www.pluralsight.com/resources/blog/software-development/character-controls-camera-3cs-game-development)) | New topic `three-cs` in Core Gameplay |
| Camera design topic | John Nesky's "50 Game Camera Mistakes" (GDC 2014, [Vault](https://gdcvault.com/play/1021262/50-Camera)): direction, distance judgement, line of sight, motion sickness, FOV shifts, shake, bobbing | New topic `camera-design` in Art / Audio / Feel |
| Worked economy and difficulty numbers | Schreiber and Romero's *Game Balance* teaches with spreadsheets and exercises; the worked-example effect is strongest for novices, especially faded examples with self-explanation ([Renkl and Atkinson](https://openlearning.mit.edu/mit-faculty/research-based-learning-findings/worked-and-faded-examples)) | A `WORKED()` data kind: a table or a document beside its topic, downloadable as CSV or Markdown, with "try it" questions; numbers labelled illustrative |
| Filled design documents | Stone Librande's one-page designs (GDC 2010, [Game Developer](https://www.gamedeveloper.com/design/video-one-page-designs)): annotated, one page, a strong central image | Three `WORKED()` documents on `design-documents`: one-page spec, feature brief, decision-log entry |
| Comparative teardowns | Hades makes meta-progression the story; other roguelites keep it a separate system | A `COMPARE()` data kind and a "Two games, one problem" shelf; four comparisons using library games only |
| Go code for backend topics | No Go toolchain on this machine | A Go tab (`GO()`) on backend, server and infra topics: whole files, `package` and imports included; `src/check-go.js` vets them when Go is installed; no CI gate yet (it cannot be replayed here) |
| Named server stacks | Unity Multiplay hosting shut down on 2026-03-31 (software licensed to Rocket Science; [Unity notice](https://status.unity.com/info_notices/362941)); Amazon GameLift is now GameLift Servers ([AWS](https://repost.aws/articles/ARK7UPPDp4QIuP5Rd4qdgKBQ/amazon-gamelift-is-now-amazon-gamelift-servers)); Agones (open source, Kubernetes); Nakama (open source, Go runtime, [Heroic Labs](https://heroiclabs.com/docs/nakama/server-framework/introduction/)); Photon Fusion 2, Mirror (MIT), Netcode for GameObjects | New topic `server-stack-choices` with dated facts |
| Runnable exercises with solutions | Faded worked examples: show a solution after an attempt, then ask for self-explanation | Optional `check.solution` on stage checkpoints (an outline and a self-check list behind "Open after you try"), filled for the engineering track |
| Complete vs excerpt label on snippets | 58 of 151 Unity snippets compile whole (developer audit, Unity 6.3 csc) | A derived `SNIPPET_SCOPE` map and a label on each tab: "Whole script" or "Excerpt" |
| "Never made a game?" route | Novices learn best from guided, worked material before open tasks (expertise reversal) | New beginner path `first-tiny-game` that carries the one-button practice game through every stage; the chooser sends "Design games + New to it" there first |
| Definitions on tap | Toggletips (button-triggered, live-region bubble) work on touch and with screen readers, unlike hover tooltips ([Inclusive Components](https://inclusive-components.design/tooltips-toggletips/)) | First use of each glossary term on a topic or path page becomes a toggletip |
| Lessons open with a known game | Concrete before abstract helps novices | Design-lens topics whose `what` names no game get one library-game example |
| Search "boss" | Combat design exists but "boss" does not rank it | Synonym |

## Checklist

| # | Task | Who | Status | Notes |
| --- | --- | --- | --- | --- |
| E0 | Research, decisions, plan | coordinator | done | this file |
| X1 | App: `WORKED()` and `COMPARE()` kinds (schema, validator, rendering, downloads, Compare shelf and route, search) | worker | done | WORKED and COMPARE kinds with one sample each (src/44-worked-samples.js), downloads as CSV or Markdown, Compare shelf and route, "Compared with" on game pages, search groups; smoke 269/0, e2e 104/104 |
| T1 | Topics `three-cs` and `camera-design`, with path steps | worker | done | three-cs in game designer foundations s4, camera-design in level and UX s3, 8 interview questions each, glossary +2; game claims written from memory and a legacy Input.GetButtonDown in the Unity 3Cs snippet go to R1 |
| X2 | App: `check.solution`, Go tab (`GO()`), snippet scope label, glossary toggletips, "boss" synonym, `check-go.js` | worker | done | check.solution disclosure; Go tab with whole-file label and src/check-go.js (NOT MEASURED here: no Go); Unity and Godot snippet labels; glossary toggletips on topic Overviews and path steps; boss, 3Cs and camera synonyms; smoke 269/0, e2e 104/104 |
| T2 | Topic `server-stack-choices` with dated facts and a path step | worker | done | server-stack-choices in the netcode path s3; 5 dated facts opened at source (Multiplay deprecation per Unity notice 362941, GameLift Servers, Agones, Nakama, Mirror MIT); the GameLift rename and NGO-first-party facts dropped (sources would not load); glossary +2 |
| S0 | `SNIPPET_SCOPE` data from the developer audit's compile results and a structural rule for GDScript | coordinator | done | new data file |
| W1 | Worked tables (economy, difficulty) and documents (one-page spec, feature brief, decision log) | worker | done | ten-day soft-currency economy and ten-level difficulty curve (rows recomputed by script; margins 4 to 1.1, level 9 the only one under 1.2), one-page spec, feature brief and decision log for one fetch-pet feature |
| W2 | Four comparisons | worker | done | failed-run-worth-it (Hades, Slay the Spire), teaching-without-words (Portal, Super Mario), hard-for-everyone (Celeste, Dark Souls), daily-habit (Wordle, Candy Crush Saga); sources are Wikipedia pages only, so R1 looks for stronger ones |
| G1 | Go tabs on backend, server and infra topics | worker | done | 29 Go tabs (11 backend, 8 infra, 10 server), standard library only, whole files; not compiled or vetted here (no Go): run src/check-go.js where Go is installed |
| P1 | Path `first-tiny-game` and the chooser | worker | done | first-tiny-game: 4 stages, 8.25 h, one practice jumper carried through every task; the chooser sends Design games + New to it there first, then foundations; its Godot and GameMaker steps both count (alt covers Godot and Unity only) |
| P2 | Reference solutions for engineering checkpoints | worker | done | 58 stages in 11 engineering paths have an outline and 3 to 5 self-checks; a repeated filler sentence the worker added to reach the length target was removed from 22 outlines (no padding) |
| L1 | A known game in every design lesson's opening | worker | done | files 20-25: 24 of 38 topics gained a library-game example, 14 already had one; four claims written from memory go to R1 (Resident Evil 4 village, Halo dropship, Overwatch counters, Rocket League ball cam); files 26-30: 22 topics gained an example taken from the game pages' own lenses, 15 already had one |
| R1 | Fact-check of all new content by a fresh reviewer, fixes | reviewer + worker | todo | |
| V1 | Checks, browser verification at 1440 and 375, archive | coordinator | todo | |

## Log

- 2026-10-01: plan written; research above.
- 2026-10-01: T1 done (build and tsc pass). S0 written: src/07-snippet-scope.js, 55 Unity snippets compiled whole in the audit (rollback and source-control snippets changed since, so left out); wired in by X2.
- 2026-10-01: T2 done (build and tsc pass).
- 2026-10-01: X1 done. P1 started (first-tiny-game path). X2 started.
- 2026-10-01: P1 done. Phase A (X1, T1, T2, S0, P1) committed from a snapshot taken before X2 started, built in a clean worktree.
- 2026-10-01: X2 done; coordinator added solution to the PathStage typedef. Phase B (X2) committed from a clean worktree.
- 2026-10-01: W1 done; G1 backend done. Phase C (W1, G1) committed; its first CI replay failed the smoke download check, which joined cells with bare commas while real CSV quotes cells holding commas; the check now quotes like RFC 4180 from a clean worktree.
- 2026-10-01: W2 done; phase D (W2) committed. P2 and L1 (files 20-25) running.
- 2026-10-01: P2 done (padding removed by the coordinator). L1 files 20-25 done. Phase E (P2, L1 part 1) committed.
- 2026-10-01: L1 done; phase F (L1 part 2) committed. R1b (engineering review) running.
- 2026-10-01: R1a and R1b done; fixes running.
- 2026-10-01: F1 (engineering fixes) done: NaN-proof speed check, listen errors exit 1, secrets hidden from %#v and JSON, a hard matchmaking band cap, Unwrap on status writers, a Go tab label true for programs, packages and tests, the 3Cs Unity snippet on the Input System, request-context identity made consistent. Coordinator: check-go.js go.mod raised to 1.23, the Valve wiki credited as community-edited. Phase G committed.
- 2026-10-01: F2 (design fixes) done; coordinator fixed the four findings in 22 and 25 (Super Mario camera, Celeste wall-jump pixels, reaction time 200-250 ms, Street Fighter 6). Phase H committed.

## Outcome

All thirteen requests are built: five topics (3Cs, camera design, multiplayer stack choices, plus combat design and blockout from the audit), five worked examples, four comparisons, 29 Go tabs, 58 reference solutions, the first-tiny-game path, glossary toggletips, snippet scope labels and a known game at the start of 46 more lessons. Two fresh reviewers checked the new content; every must-fix and should-fix was applied. Eight phases were pushed, each after a CI replay of exactly that commit in a clean worktree.

## Follow-ups for the owner

- Go code is not compiled anywhere: run NOT MEASURED: Go is not installed on a machine with Go 1.23+, then consider a CI job with actions/setup-go.
- Engine snippets in the new topics were checked against documentation, not run in Godot or Unity.
- The live-game backend path lists its stages as s1, s2, s5, s3, s4 in the file; the order a reader sees is unchanged, but the ids read oddly.
- A few claims rest on pages that would not load for the reviewer (Valve Developer Community, Street Fighter frame data, a GamesBeat article); they are labelled as such in review-R1a.md.
- The first-tiny-game build stage is 3.3 hours; a reviewer judged even that optimistic for a non-programmer.
