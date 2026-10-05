---
status: active
updated: 2026-10-05
---

# Programme 2026-10: breathable map, deeper curriculum, adventure paths, a split site

Working record for the owner's request of 2026-10-05. The task list with live status is
[tasks.md](tasks.md); research notes are in [research/](research/); writer and checker
briefs in [briefs/](briefs/). This file holds the goals, decisions and phases; it changes
when a decision changes. The independent plan audit and how each finding was resolved:
[research/plan-audit.md](research/plan-audit.md).

## The request, as testable goals

| # | Owner asked | Done when |
| --- | --- | --- |
| G1 | The map looks narrow; make it breathable, wider horizontal gaps so the lines show. Research how to build a knowledge map first. | Spacing and edge shape come from research/map-layout.md; on screen, sibling stubs are at least 4 px apart on every concept-map state at 1440 and 375 (measured); labels stay at 11 px or more at 1280, 1440 and 375 (measured); layout check, smoke and e2e pass; before and after screenshots. |
| G2 | Add CrossCode: puzzle sections blended into an action RPG, pixel art, world building. Blend into the curriculum. | A full game entry (signature, ten lenses, real screens, loop diagram), fact-checked; the topics puzzles-in-action-spaces, pixel-art-direction and worldbuilding-method link it from their lenses; a step in games-that-broke-the-mould and study-the-hits-worlds; a comparison with Zelda. |
| G3 | Add Rhythm Heaven: why a simple, non-traditional rhythm series succeeds and why so few imitators (7th Beat Games) come close. | A full series entry with reception and a lineage lens that answers the imitator question with evidence; Rhythm Doctor added; the comparison "rhythm-heaven vs rhythm-doctor" answers what the imitator kept and changed; the topics rhythm-and-music-timed-design and craft-audio-clock-and-input-latency; all in paths. |
| G4 | Backtracking in non-linear games: natural, not a chore. Blend into the curriculum. | Topic backtracking-and-return-trips (eight parts, engine tabs, interview, diagram and explainer, sourced examples), fact-checked; steps in level-and-ux-designer and games-that-broke-the-mould; lens links from Hollow Knight, Dark Souls, Elden Ring, Zelda; a pointer from spatial-composition; the comparison "hollow-knight vs dark-souls". |
| G5 | Game balancing and power creep as content grows. Blend into the curriculum. | Topics balance-methods (with a worked cost-curve table) and power-creep-and-content-growth (with an explainer), fact-checked; steps in systems-designer and senior-game-designer; lens links from Hearthstone, World of Warcraft, EA FC, Pokémon; the comparison "hearthstone vs slay-the-spire". |
| G6 | Expand and deepen "Two games, one problem". | The four existing comparisons each gain at least two sections, evidence with sources and a diagram; eight new comparisons (named below); the shelf grouped by design problem with a reading order; every comparison fact-checked. |
| G7 | In-depth networking for multiplayer, and between users in software at scale; frameworks for games and software. | Six topics (below) with official sources and numbers, fact-checked; the new path realtime-at-scale-engineer; review steps in netcode-server-engineer and live-game-backend-engineer; Counter-Strike 2 lens step. |
| G8 | Game and software optimisation in depth, evidenced with official knowledge and tricks of the trade. | Six topics (below), fact-checked; the new path performance-engineer; links from the engine paths and senior-game-developer-ai-era s4. |
| G9 | Audit the site: well-constructed HTML, diagrams and short video explainers where they help; paths as a mini-adventure (verify, improve); performance; a multi-page structure. | Every finding in research/site-audit.md and research/a11y-html-baseline.md fixed or set aside with a reason; axe 0 serious and html-validate errors down on the same routes; stepped explainers where change over time is the idea, plus short WebM clips for motion; the 25 figure opportunities resolved; the performance targets below met and measured. |
| G10 | Curriculum backed by real teaching evidence. | research/curriculum.md ties each path rule to evidence with its strength; the validator enforces what can be checked; the adventure follows research/learning-science.md 2.3. |
| G11 | A reusable run-book / skill / rule for this way of working. | `~/.claude/skills/program-autopilot/SKILL.md` finalised from this run; memory and rules updated; named in the final report. |

## Decisions

Owner (2026-10-05):
- **Split**: the scalable option, large refactor allowed: an app shell plus content files
  loaded on demand, built from the same `src/` data; hash routes and `file://` keep working;
  pre-rendered pages can be added later.
- **CI change approved**: CI checks `playable.html` and `content/` with `git status
  --porcelain` (catches uncommitted new files), and the build enforces an app-shell budget.
- **Video**: stepped explainers, plus a few short silent WebM clips rendered from them for
  motion ideas. No footage of other people's games, no editor recordings.
- **Images approved**: official images for CrossCode, Rhythm Doctor and Rhythm Heaven from
  Steam and publisher press pages (LaunchBox captures only where no official image exists).
- **Agents**: at most two at once at first; **from later on 2026-10-05, one at a time** (owner: "cap down subagents count to only 1"), plain agents or a Workflow.
- **Writers**: games on `writer-sonnet-low` (owner default), technical topics on
  `writer-sonnet-medium`, fact-checks on `factcheck-opus-medium`.
- **Tests**: no unit tests (none exist; smoke.js and e2e-paths.js are browser end-to-end
  checks and stay). Test once per phase, when its work is complete.
- **Git**: commit and push at the end of each phase.

Coordinator (from the plan audit; each is a judgment call listed in the final report):
- Every push is preceded once by the exact CI command set (build, sync check, tsc, smoke,
  e2e) in a clean worktree; the real GitHub run is checked after the push.
- P3 changes presentation only, never data shapes, so drafts written meanwhile stay valid.
- The overworld is the default view of a path page, with a remembered plain-list toggle;
  the path door and page findings of the audit (N1-N4) are done in P9, not P3.
- Boss tick lists split each answer outline into ideas by sentence at render time; an
  optional `ideas:[]` overrides. `skip` questions are kept.
- The walking-player skin is off by default, behind a setting, because a static site with
  no analytics cannot measure whether it helps.
- Each content file carries the build id; a shell that meets a newer build reloads once.

## Performance targets (G9)

| Measure | Before | Target |
| --- | --- | --- |
| First load transfer (shell, gzip) | 2,844 KB | 300 KB or less (enforced by the build) |
| Phone, 4x CPU, cold load: DOMContentLoaded to interactive | 6.9-10.2 s | under 2 s |
| Longest main-thread task on load, phone 4x | 4-6 s | under 200 ms |
| First search keystroke, phone 4x | 1.1-1.7 s | under 100 ms after the index file has loaded |
| Topic or game page change, phone 4x | under 430 ms | no worse, plus its content file |

## Phases

Writers draft into `docs/program-2026-10/drafts/` (outside the build) while engineering
phases run; at most two agents at once in total; never two writers on one file.

| Phase | Goal | Work | Checks before the commit (then the CI replay before push) |
| --- | --- | --- | --- |
| P1 Map breathing room | G1 | research/map-layout.md 5: desktop GAP_X 80/104/64/64, GAP_Y 8/10/8; phone X unchanged; tree edges as rounded elbows on one shared trunk per parent (solid), cross-links stay dashed; the open parent's edges full strength, the rest faint; legend; ui-revamp U4 (UX review of the map) folded in | layout check; smoke; e2e; new measured stub separation and label size at 1280/1440/375; screenshots |
| P2 Split | G9 perf | research/split-architecture.md: content compiler, `content/` emptied and rebuilt, light index plus derived fields, pre-tokenised search shards, `PlayableContent.need()`, async router with stale drop and loading state, build id reload, settled signal; tests and checks inventoried (F2) with count checks; trace and golden master re-run with seeded state (F3); CI workflow change; shell budget; README and CONTRIBUTING updated | golden master of every route (old vs new, visible text) with seeded state; 30 search queries compared; route count before = after; text-fit states = node states; `file://` visit; targets measured; then the live Pages site checked after push |
| P3 Audit fixes (presentation only) | G9 HTML | research/site-audit.md and a11y-html-baseline.md, except N1-N4: game lenses as claim plus body behind headings and disclosures; reading measure about 70 characters; `main` holds only reading content; heading order; links instead of `button[data-href]`; types; landmark names; lab markup; contrast pairs and check-contrast.js extended | axe and html-validate on the same routes; text-wall numbers re-measured |
| P4 Explainers | G9 | A stepped `explainer` diagram kind (frames, step/play/reset, final frame static, reduced motion, text equivalent, layout-checked per frame); the 25 figure opportunities resolved; a script that renders chosen explainers to short silent WebM clips (ffmpeg) for motion ideas | layout check covers every frame; explainer routes visited; clip sizes reported |
| P5 Curriculum design | G10 | research/curriculum.md; validator rules for what is checkable; placement of every new topic and game | build |
| P6 New topics | G2-G5, G7, G8 | 20 topics (below), drafted, fact-checked, integrated; paths realtime-at-scale-engineer and performance-engineer; wiring pass: lens topics, review steps, glossary terms, spatial-composition pointer | every new route visited; fact-check verdicts resolved |
| P7 New games | G2 G3 | CrossCode, Rhythm Heaven (series), Rhythm Doctor: drafted, images, fact-checked, integrated; game-topic wiring pass | game routes visited; image budget report |
| P8 Two games, one problem | G6 | `COMPARE` gains an optional diagram (validated, layout-checked); the four deepened; eight new; shelf grouped by problem; all fact-checked | comparison routes visited |
| P9 Adventure paths | G9 G10 | research/learning-science.md 2.3: overworld as the default path view (regions = stages, mastery states from self-ratings, plain-list toggle, never a gate); castle = stage checkpoint; boss = recall questions one at a time (answer, confidence, reveal, tick ideas, rate; missed and partial re-asked and queued for Review); test-out; walking skin off by default; audit N1-N4 (path door and page chrome) | e2e-paths.js extended: a boss fight, the test-out, the plain list, reduced motion, at 375 and 1440 |
| P10 Close | G11 | Independent final review of the whole programme diff; docs; skill, rules and memory; archive this folder and the ui-revamp plan; closing report | full CI replay; the real GitHub run |

## New topics (research/content-gaps.md)

| Subject | Topic id (domain) | Joins |
| --- | --- | --- |
| Backtracking | `backtracking-and-return-trips` (level) | level-and-ux-designer s1; games-that-broke-the-mould |
| Balance | `balance-methods`, `power-creep-and-content-growth` (systems) | systems-designer s3, s4; senior-game-designer |
| Networking at scale | `server-bandwidth-and-interest-management`, `server-transport-and-relays`, `server-world-partitioning`, `server-load-testing-and-capacity`, `server-framework-landscape` (server); `realtime-connection-tier-at-scale` (backend) | realtime-at-scale-engineer (new); review in netcode-server-engineer s2-s4, live-game-backend-engineer s4 |
| Optimisation | `craft-cpu-cache-and-data-layout`, `craft-gpu-rendering-cost`, `craft-mobile-gpu-and-thermals`, `craft-memory-loading-and-streaming`, `web-performance-basics` (craft); `backend-latency-and-query-optimisation` (backend) | performance-engineer (new); engine paths s3-s4; senior-game-developer-ai-era s4; interview-prep-engineer s2 |
| CrossCode | `puzzles-in-action-spaces` (content), `pixel-art-direction` (presentation), `worldbuilding-method` (narrative) | games-that-broke-the-mould, study-the-hits-worlds, level-and-ux-designer s2 |
| Rhythm | `rhythm-and-music-timed-design` (core), `craft-audio-clock-and-input-latency` (craft) | games-that-broke-the-mould s3, study-the-hits-play s2, engine paths s3 |

## Comparisons (G6)

Existing, deepened: failed-run-worth-it (Hades / Slay the Spire), teaching-without-words
(Portal / Super Mario), hard-for-everyone (Celeste / Dark Souls), daily-habit (Wordle /
Candy Crush Saga). New: rhythm by ear (Rhythm Heaven / Rhythm Doctor); puzzles inside
an action game (CrossCode / Zelda); return trips (Hollow Knight / Dark Souls); keeping
old content relevant (Hearthstone / Slay the Spire); scaling a shared world (World of
Warcraft / Fortnite); charting by hand (Beat Saber / Rhythm Doctor); one world, many
players' stories (Elden Ring / Skyrim, on backtracking and fast travel); power growth
in a live game (Overwatch / Street Fighter, on patch balance). Each pair is confirmed
against the library before briefing.

## Budget

About 46 agents: 20 topic writers and 20 fact-checks, 3 game writers and 3 fact-checks,
plus comparison writers and checks and two reviews; at roughly 150-300k tokens each,
about 9-10M tokens, run two at a time. The coordinator's engineering phases run alongside
at most one writer at a time when a second agent would share files.

## Risks and rollbacks

- The split touches every route. Rollback is one revert of the P2 commit until P3 builds
  on it, so the live site is checked after the P2 push and before P3 starts.
- Async loading can make tests flaky; tests wait on the app's settled signal, never on
  longer timeouts.
- A cached old shell meeting new content files: the build id check reloads once.
- Wider gaps reduce label size; the 11 px floor stays and is measured at 1280.
- Shallow drafts: technical topics on medium effort, every draft fact-checked.

## Log

- 2026-10-05: request received; repo, build, CI and map studied; owner answered split,
  parallelism and writer questions; research (map layout, learning science, content gaps,
  site audit) and the field-read trace done; plan written and audited (PASS WITH CHANGES,
  20 findings, all adopted); owner approved the CI change, the video approach and image
  downloads.
- 2026-10-05: P1 done (map); topic drafting under way (6 drafted, 5 fact-checked and fixed).
