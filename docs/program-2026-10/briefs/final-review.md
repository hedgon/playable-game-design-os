# Brief: independent final review of programme 2026-10

You review the whole programme as a stranger. You did not do the work and you are not told
what anyone concluded about it. Read-only: change no file; never run git commands that write
(status, log, diff and show are fine). Never read or search D:\Personal outside
D:\Personal\playable-game-design-os.

## Artifacts

- The owner's request and decisions: `docs/program-2026-10/plan.md` (goals G1-G11 with
  "done when", decisions, phases) and `docs/program-2026-10/tasks.md` (what was claimed per task).
- The change: `git diff 7424369..HEAD` (the programme started after commit 7424369). Generated
  output (`playable.html`, `content/`) is built from `src/`; review `src/`, `.github/`, the docs
  and `assets/` additions, and read generated output only to confirm behaviour.
- The research and briefs under `docs/program-2026-10/research/` and `briefs/`.
- The checks: `node src/build.js` (data, layout and contrast checks), `node src/smoke.js` and
  `node src/e2e-paths.js` (browser checks; set PLAYWRIGHT_CHANNEL=msedge). You may run them.

## Criteria

1. Coverage: for each goal G1-G11, does the shipped work meet its "done when"? Name the
   evidence (file:line, a route, a check's output) or the gap. A goal met only in part is a
   finding.
2. Correctness of the new code: the content split and loader (`src/content-build.js`,
   `src/86-content.js`, the router in `src/90-app.js`), the on-demand tool code (manifest
   LAZY), the checkpoint flow, test-out and stage map (`fightHTML`, `overworldHTML` and their
   actions in `src/90-app.js`), the deferred phone map (`renderTree`/`drawPendingMap` in
   `src/91-map.js`), the comparison shelf. Look for broken states: a stale route, saved data of
   an old shape, a stage with no recall answers, a reload mid-checkpoint, a narrow screen that
   widens, keyboard and screen-reader use.
3. Tests: were any checks weakened to pass? Compare `src/smoke.js` and `src/e2e-paths.js` at
   7424369 and HEAD; for every changed or removed assertion, say whether the new one still
   tests what a user sees.
4. Teaching quality on a sample: read three new topics in full (one engineering, one design,
   one craft), both new paths, and two deepened comparisons. Look for claims without sources,
   numbers that do not compute, instructions that cannot be done, and answer outlines that do
   not answer their question.
5. The curriculum's evidence: does `research/curriculum.md` cite `research/learning-science.md`
   faithfully (rows, effect sizes, strength), and does the site do what the note says it does?
6. Process claims: is every "done" in tasks.md backed by something you can see?

## Output

Write `docs/program-2026-10/research/final-review.md`:
- findings, most severe first: severity (blocker, major, minor), what, where (file:line or
  route), evidence, and the smallest fix;
- per goal G1-G11: met / partly / not met, with the evidence;
- a **Set aside** list: everything you considered and judged not a finding, one line each
  with the reason.

Return the path and a 10-line summary.
