---
status: resolved
updated: 2026-10-05
---

# Independent plan audit (fresh Opus agent, read-only), 2026-10-05

Verdict: **PASS WITH CHANGES**. Every finding adopted; how each was resolved is in the
right-hand column and in plan.md.

| id | sev | finding (short) | resolution |
| --- | --- | --- | --- |
| F1 | mandatory | CI's `git diff` misses never-committed content files and stale files | Build empties `content/` before writing; CI runs `git status --porcelain -- playable.html content/` and fails on any output. Owner approved the CI change 2026-10-05. |
| F2 | mandatory | Tests and checks read heavy fields from the page; coverage would shrink silently | P2 task: inventory every data read in smoke.js, e2e-paths.js and the text-fit sweep; they load content or read `src/`; count checks (text-fit states = node states; smoke route count before = after). |
| F3 | mandatory | Trace and golden master ran with empty storage and no clicks | P2 task: re-run both with seeded state (active path, due review items, progress, every build tool driven). |
| F4 | mandatory | Per-phase checks were a subset of CI | Every push is preceded by the exact CI command set once per phase (build, sync check, tsc, smoke, e2e) in a clean worktree; skill updated. |
| F5 | mandatory | Video silently replaced | Owner decision 2026-10-05: stepped explainers plus a few short silent WebM clips rendered from them for motion ideas; no footage of others' games, no editor recordings. |
| F6 | mandatory | P3 and P9 redesign the path page twice | Path door and path page findings (N1-N4) moved to P9. Default decided: the overworld is the default view of a path page, with a remembered plain-list toggle. |
| F7 | mandatory | Boss tick list needs ideas per answer; ~360 answers | Decision: answers split into ideas by sentence at render time; optional `ideas:[]` overrides; the validator reports answers that yield a single idea (guide). `skip` data kept; the test-out uses the recall questions and keeps the skip questions as the quick self-check before it. |
| F8 | mandatory | G6 not checkable; no diagram schema; no fact-check | Comparisons named in plan.md; `COMPARE` gains an optional diagram (validated and layout-checked); comparisons fact-checked. |
| F9 | mandatory | axe and html-validate results not on disk; count wrong (26 rows) | research/a11y-html-baseline.md written; count corrected; check-contrast.js extended to the pairs axe found. |
| F10 | mandatory | No performance targets | Targets in plan.md; shell budget enforced by the build (owner approved). |
| F11 | recommended | Blending tasks missing | Added to P6/P7 as a wiring pass with counts. |
| F12 | recommended | Five topics in no phase | P6 carries all 20 topics; game links wired after P7. |
| F13 | recommended | No budget; fact-check and comparison briefs missing | Budget in plan.md; briefs/factcheck.md and briefs/comparisons.md written before use. |
| F14 | recommended | Drafts may go stale if P3 changes data shapes | P3 is presentation-only: no data shape changes. |
| F15 | recommended | Walking skin unmeasurable | Skin off by default, behind a setting; recorded as unmeasurable on a static site. |
| F16 | recommended | Cache mismatch old shell / new content; rollback window | Each content file carries the build id; on mismatch the shell reloads once; live Pages site checked after the P2 push before P3. |
| F17 | minor | G1 check by eye | Measured minimum stub separation on screen (4 px or more) at 1440 and 375. |
| F18 | minor | G3/G4 wording | Aligned. |
| F19 | minor | README/CONTRIBUTING stale; ui-revamp plan open | Docs updated in P2; ui-revamp U4/V1 folded into this programme (P1 review, P10 verification) and that plan archived. |
| F20 | minor | Skill misses CI replay, pipe trap, weak-evidence check | Added to the skill. |

Set aside by the auditor (agreed): option B and deferring pre-rendering; map numbers from
tool defaults plus geometry; trunk design on computed geometry; `file://` via script tags;
no unit tests exist; the golden master as the gate; settled signal; draft mode; dependency
order; the learning-science reading; "no cap cuts content"; no work identifiers; real
screens rule; volatile facts left to fact-checkers; no new path for CrossCode, rhythm or
backtracking; the validator already enforces new-path rules.
