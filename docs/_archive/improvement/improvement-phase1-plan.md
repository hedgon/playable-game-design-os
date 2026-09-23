---
status: shipped
updated: 2026-09-23
---

# Improvement plan, phase 1 of 4: fix what is broken

Source: the audit of 2026-09-23. The build is green (validator OK, 351 map states
with 0 overlaps, committed `playable.html` identical to a fresh build, also when
rebuilt from the git index with LF endings). Evidence below was measured in the
browser pane at 375, 1024, 1440 and 1920 px unless noted.

## Roadmap and why the work is split

| Phase | Goal | Owner decisions | Depends on |
|---|---|---|---|
| 1 | Fix reader-facing breakage, accessibility basics, data safety, doc truth, CI | CI approval only | none |
| 2 | Foundations: behaviour-preserving refactors the later phases build on | data layout, module shape, optional dev checks | 1 |
| 3 | Information architecture and layout | lenses, navigation, phone map, merges | 2 |
| 4 | Content currency: AI era, in-game LLMs, dated facts | topic list, fact sources | 2 (data layout); not 3 |

Phase 1 needs no design decisions and fixes breakage, so it ships first. Phase 2
rewrites the 93 inline `onclick` templates and the shared registries; doing phase
3's markup work before it would rewrite the same templates twice. Phase 3 cannot
start without IA decisions. Phase 4 needs the `facts`/`asOf` schema (its first
commit) and phase 2's data-layout decision, and nothing from phase 3, so it can
run beside phase 3. Each later phase gets its own plan file once its decisions
are made.

### Phase 2: foundations

- Replace the 93 inline `onclick="..."` templates with `<a href>` for navigation
  and `data-action` plus one delegated listener for actions. Retire the 15
  `window.__*` globals and the `Math.random` element ids. Section toggles become
  `<button aria-expanded>`. This fixes keyboard access for the 36 `div`/`span`
  click targets on a topic page.
- Make map nodes keyboard-operable: `tabindex`, `role`, `aria-label`,
  Enter/Space calls `mapClick`, arrow keys move along the tree. Put the new
  attributes after `data-id` so `layout-core.js` keeps matching until it is
  replaced. Keep focus on the map when navigation starts from a map node
  (refines phase 1's focus rule).
- One registry, in a data file, for `TOOLS`, `VIEW_LINKS` and the diagnostics.
  Today `window.TOOLS` (`90-app.js:606`) is regex-scraped by three scripts and
  `check-layout.js` silently falls back to `[]`; diagnostic ids live in
  `validate.js:211`, `inventory.js`, `50-data-paths-a.js:80` and
  `renderDiagnose`.
- Give each app file (90 to 93) its own scope and an explicit shared namespace,
  as `PlayableGraph` and `PlayableFlow` already do. Today one IIFE opens in
  `90-app.js` and closes in `99-tail.js`, so the files do not parse alone.
- JSDoc `@typedef`s for Topic, Engine, Interview, Case, System, Part, Flow, Path
  and Step, plus `// @ts-check` in the data files: editor errors with nothing to
  install.
- `layout-core.js` checks `build().nodes` geometry, the way `flowOverlaps` in
  the same file already does, instead of regex-parsing SVG. Drop the radial-map
  branches; add a label-fits-card check.
- `validate.js:8` evaluates the data twice; make it once. Replace the
  `_bundle-check.js` temp file with an in-process `vm.Script` syntax check.
- Decisions:
  - Data layout: (A) keep layered files and rename them by meaning, or (B) one
    file per domain holding each topic's `T`, `tech`, `ENGINE` and `INTERVIEW`.
    Recommend B, before phase 4 adds topics.
  - Module shape: (A) per-file IIFE plus namespace (recommended), or (B) one
    inline ES module.
  - Optional dev checks in CI via `npx` (`tsc --checkJs`, a Playwright smoke run
    over routes and widths). The repo stays dependency-free; CI downloads the
    tools.

### Phase 3: information architecture and layout

- Lenses. 611 KB of the payload is engineering and people domains against 368 KB
  of core design topics, and Backend sits beside Player under "Make something
  people want to play". Options: (A) two lenses, Design OS and Engineering &
  Career, with a toggle (recommended); (B) two separate files; (C) one map
  grouped by side.
- Navigation: 11 top-level views down to about 6 groups. At 1440 px
  "Checklists" is cut off and "Experience" is hidden in the scroll strip.
- Phone map: a one-sided layout under about 700 px (recommended; the layout
  check then runs both layouts), or an outline list in place of the map.
- Work layout: non-map views (Idea Lab, Build, Checklists, Prompts, Paths) take
  the centre. At 1440 px the Lab gets 460 px while the unused map gets 658 px.
- Topic page: "Appears in" moves below the sections. On phones the first
  section starts 1321 px down, behind 25 chips.
- One door per job: fold the Idea Shaper into the Idea Lab as a mode; point the
  `no-idea` smell and the `finding-an-idea` topic at it.
- Idea Lab: one step at a time, with the chain as progress and an overview
  toggle.
- Optional: service worker plus web manifest (offline, installable; an
  installed app is exempt from Safari's 7-day storage eviction).
- Optional feature: a local spaced-review queue for interview and checkpoint
  questions a reader marks as shaky (Leitner intervals, no streaks).

### Phase 4: content currency

- First commit: `facts[{claim, asOf, src}]` on topics for dated claims, rendered
  as a "Current rules (as of ...)" callout. The validator warns, never fails,
  when `asOf` is older than 12 months.
- AI Collaboration, new topics, each with `tech`, `ENGINE` and `INTERVIEW` so
  strict validation passes:
  - agentic implementation: a task, a check the agent can run, diff review;
    editor-connected agents that run play mode, tests and screenshots
  - evals for AI in the pipeline: golden set, rubric, re-run on every model
    change
  - generative-asset pipeline and provenance
  - disclosure, IP and platform policy
- In-game AI, new topic: generative characters. Constrain output to game
  actions; latency and cost budgets; on-device versus cloud; player prompt
  injection; moderation and ratings; authored fallbacks; testing
  nondeterministic output.
- Product and ethics, dated facts. Verified 2026-09-23: Steam's 16 Jan 2026
  disclosure rewrite (player-facing content, made in advance or live; developer
  tools exempt); EU AI Act Article 50 transparency duties apply since 2 Aug 2026
  (watermarking grace to 2 Dec 2026 for systems already on the market). Verify at
  authoring time, before writing: loot-box odds rules, platform-fee and
  external-payment changes, age-rating and privacy duties.
- Player motivation: add Quantic Foundry's model beside the SDT and Bartle
  material.
- Paths: place the new topics into existing paths within the 3 to 8 steps rule.
- Execution: at most 3 Sonnet content agents, one file each, a finished topic as
  the quality reference. Gate: validator, layout check, and a source for every
  dated claim.

## 1. Mục tiêu / Scope

Phase 1 fixes what is broken for readers today, with no design decisions.

Acceptance criteria:

1. At 375x812 and 1024x768 with empty storage, loading `/` shows the Learning
   paths door on screen.
2. At 1100 px or less, content routes show the content pane and structure routes
   show the map (rule in 3a); back and forward follow the same rule.
3. Above 1100 px nothing changes: panes follow `hideLeft` and `hideRight` only.
4. After a resize, a rotation, or a reload at a different size, the camera is
   recomputed for the current stage; the overview shows every domain card whole.
5. `--fg`, `--fg2` and `--fg3` reach 4.5:1 or more on `--bg`, `--bg2`, `--bg3`
   and `--panel` in both themes; map node sub-labels reach 4.5:1 on all 19
   domain tints, closed and open.
6. The "Copied" toast is announced; a skip control is first in tab order;
   content routes move focus to the pane heading when the pane is visible.
7. With `prefers-reduced-motion: reduce`, camera moves and drawer slides are
   instant.
8. With no stored theme the page follows OS changes live; the toggle persists;
   Reset returns to following the OS.
9. Single-key shortcuts can be turned off in the help dialog; Ctrl/Cmd K and Esc
   keep working.
10. Export writes every `playable.*` key to a JSON file; Import restores it after
    Reset; malformed or foreign JSON changes nothing. Works from `file://` and
    `http://localhost`.
11. README, DESIGN-SECOND-BRAIN and the start dialog match the code.
12. `node src/build.js` passes; if approved, CI runs the build and fails when
    `playable.html` is out of sync.

Out of scope: layout redesign, navigation changes, new content, and refactors
beyond the lines each fix touches (phases 2 to 4).

## 2. Bối cảnh / Survey hiện trạng

| Finding | Evidence | Existing code to reuse |
|---|---|---|
| The content pane never opens by itself at 1100 px or less | 375 px, empty storage: `/` goes to `#/paths` with the pane closed. Tapping the `core-loop` node goes to `#/map/t/core-loop` with the pane at x=378, off screen. Only the rail (`closeRailDrawer`, `90-app.js:196`) and the `content` button (`90-app.js:137`) add `.open` | the open-pane line in `closeRailDrawer`; `syncScrim` (`90-app.js:131`) |
| The camera ignores viewport changes | No `resize`, `ResizeObserver` or `orientationchange` anywhere in `src/`. After a 1024 px session the map stayed clipped at 1440 and 1920 until "fit". Target math: `renderTree`, `91-map.js:351-354` | `cameraTarget` (`91-map.js:137`), `fitBox` |
| Muted text is below AA | `--fg3` (`01-head.html:16`, `:33`) colours 47 rules; worst case 3.87:1 dark and 3.55:1 light, on `--bg3`. Node `.lbl.sub` (`01-head.html:814`) on tinted fills: 1.85:1 dark, 2.22:1 light; even `--fg2` gives 3.53 and 4.49 | computed replacements `#8c877e` (dark) and `#6a645a` (light), worst case 4.63:1 on all four backgrounds |
| The toast is silent to screen readers | `<div class="toast" id="toast">` (`01-head.html:941`) has no role | none |
| No skip control, no focus move | `setView` (`90-app.js:230`) only replaces the pane HTML | `main#app` already has `tabindex="-1"` |
| No reduced-motion support | `mapAnimateTo(to, ms=480)` (`91-map.js:146`); drawer transitions of `.18s` (`01-head.html:880`, `:883`) | the `ms` parameter |
| The theme stops following the OS | `applyTheme` stores the OS preference on first load (`90-app.js:26-27`) | none |
| Single-key shortcuts are always on | keydown handler, `90-app.js:1519-1535` | help dialog (`01-head.html:916-932`) |
| Reader writing has no backup | only "Reset all saved data" (`90-app.js:1516`); stories, Lab work, tool inputs and checklists live only in `localStorage` | `store` (`90-app.js:16-20`) and its `playable.*` enumeration in `store.clear()` |
| Direct edits to `playable.html` are lost | README:140 recommends them; `build.js` overwrites the file unconditionally; there is no `.github/` | none |
| Docs disagree with the code | README:12 says Paths is the door; README:65 and DESIGN-SECOND-BRAIN:46 say the Idea Lab is. The start dialog says "Four doors" (`01-head.html:936`); `START_PATHS` has five (`91-map.js:7-13`). README:240 says case-study strings are checked for names; `validate.js` has no such check | none |
| Content slip | `31-data-engine-b.js:926` names `OS.get_ticks_msec`, which is Godot 3; Godot 4 uses `Time.get_ticks_msec()` | none |

## 3. Design

### 3a. One rule for the content pane on narrow screens

At 1100 px or less the route decides: structure routes show the map, every other
route shows the pane.

- Structure routes: empty hash, `#/map`, `#/map/home`, `#/map/d/<id>`, and
  `#/experience/<cs>/<sys>` where `<sys>` is a system id (not `workflows`,
  `interview` or `flow`) and no part follows.
- At the end of `route()`: when narrow, open or close the pane by that rule,
  then `syncScrim()`.
- `closeRailDrawer` keeps closing the rail; its pane-open line goes, because the
  rule covers it.
- The close button and the scrim still close the pane until the next
  navigation.

### 3b. The camera follows the stage

- Move lines 351 to 354 of `renderTree` into `stageTarget(g, kind)`.
- A `ResizeObserver` on `#mapwrap`, debounced to 150 ms, applies `stageTarget`
  without animation. Crossing the 1100 px breakpoint also closes the drawers and
  resyncs the scrim.
- `mapPersistCamera` stores the stage size with `vb`. `renderTree` fits instead
  of restoring when the stored size differs from the current one by more than
  20%.

### 3c. Contrast

- `--fg3`: `#8c877e` in dark, `#6a645a` in light.
- `.kgraph .node .lbl.sub` uses `var(--fg2)`, and the open-state tint is capped
  so the pair reaches 4.5:1; the contrast script picks the cap.
- Optional, recommended: `src/check-contrast.js` in the build, covering every
  token and background in both themes plus node sub-labels on all 19 tints, and
  failing below 4.5:1.

### 3d. Screen-reader and motion basics

- Toast: `role="status" aria-live="polite"`.
- Skip control: a `<button>` first in `<body>`, visible on focus, that focuses
  the pane (and opens it on narrow screens). It cannot be an `href="#..."` link:
  every hash is a route.
- After `setView`, when the pane is visible and the route is not a structure
  route, focus the pane's `h1` (`tabIndex = -1`, `preventScroll`).
- `@media (prefers-reduced-motion: reduce)` turns off transitions and
  animations; `mapAnimateTo` uses `ms = 0` while the query matches.

### 3e. Theme

Use the stored theme, else the OS preference. Store only on an explicit toggle.
With nothing stored, listen to the OS media query. Reset clears the stored value.

### 3f. Shortcut switch

A "Single-key shortcuts" checkbox in the help dialog, on by default, stored as
`playable.keys`. When it is off the handler ignores `1`-`9`, `[`, `]`, `/`, `?`,
`e`, `m` and `t`; Ctrl/Cmd K and Esc still work.

### 3g. Export and import

- Help dialog, next to Reset: "Export my data" and "Import...".
- Export: `{app: 'playable', v: 1, exportedAt, data: {every playable.* key}}`
  saved as `playable-data-YYYY-MM-DD.json` through a Blob and `a[download]`.
  It also calls `navigator.storage.persist()` when the API exists
  (best-effort; it is absent on `file://`).
- Import: parse; reject unless `app === 'playable'` and `data` is an object;
  confirm with the key count; snapshot the current `playable.*` keys; clear;
  write; reload. On any write failure, restore the snapshot.

### 3h. Docs and data truth

- README: drop the "edit `playable.html` directly" option; name one first door
  (Paths, as the code does); reword the name-check claim to "checked with a
  machine-local identifier checker before committing; not part of the build".
- DESIGN-SECOND-BRAIN:46 matches the README; the start dialog drops the door
  count.
- `31-data-engine-b.js:926`: `Time.get_ticks_msec`.

### 3i. CI (needs approval)

`.github/workflows/build.yml`: on push and pull request, Node 24 on Ubuntu, run
`node src/build.js`, then `git diff --exit-code playable.html`. Verified locally:
a build from the git index (LF endings) is byte-identical to the committed
`playable.html`, so the check passes on a clean Linux checkout.

## 4. Commit breakdown

Every commit that touches `src/` also carries the rebuilt `playable.html`.

| # | Commit | Files |
|---|---|---|
| 1 | Show the content pane for content routes on narrow screens | `90-app.js` |
| 2 | Refit the map camera when the stage size changes | `91-map.js` |
| 3 | Raise muted text and node sub-labels to AA contrast | `01-head.html` (plus `check-contrast.js`, `build.js`, `manifest.js` if the 3c option is approved) |
| 4 | Announce toasts, add a skip control, move focus on navigation, honour reduced motion | `01-head.html`, `90-app.js`, `91-map.js` |
| 5 | Follow the OS theme until the reader picks one | `90-app.js` |
| 6 | Let readers turn off single-key shortcuts | `01-head.html`, `90-app.js` |
| 7 | Export and import saved data | `01-head.html`, `90-app.js` |
| 8 | Align docs with the code | `README.md`, `DESIGN-SECOND-BRAIN.md`, `01-head.html` |
| 9 | Use the Godot 4 name for the ticks clock | `31-data-engine-b.js` |
| 10 | Build and sync check in CI | `.github/workflows/build.yml` |

## 5. Seed data

None. Phase 1 needs only the decisions in section 7.

## 6. E2E test plan

Run in the browser pane and verify with DOM measurements; screenshots are
unreliable at emulated sizes. Clear `localStorage` before each case unless noted.

- (a) 375x812, empty storage, open `/`: hash is `#/paths`; pane rect is on
  screen (`left >= 0`, `right <= 375`).
- (b) 375x812, open `#/map/d/core`, tap a topic node: pane on screen, topic `h1`
  focused. Close: map visible. Back: `#/map/d/core` with the pane closed.
  Forward: pane open.
- (c) 1024x768: repeat (a) and (b).
- (d) 1440x900: collapse and reopen both panes; the state survives a reload; no
  drawer behaviour.
- (e) With a topic open, resize 1024 to 1440 to 375: after each step the
  `viewBox` equals `stageTarget`; crossing 1100 px closes the drawers and hides
  the scrim.
- (f) Use the map at 375, then reload at 1920 on `#/map/home`: all 19 domain
  card boxes lie inside `#mapwrap`.
- (g) Contrast script: every pair at 4.5:1 or more; quote the output.
- (h) The toast has `role=status` and its text changes after Copy. The first Tab
  after load focuses the skip control, and Enter on it focuses the pane. After a
  content route, `document.activeElement` is the pane `h1`.
- (i) Emulate reduced motion: after a domain click the `viewBox` equals the
  target on the next frame; the drawers have `transition-duration: 0s`.
- (j) Theme: OS dark gives dark; emulate light and the page follows; press T,
  emulate dark, and the choice stays; Reset and the page follows the OS again.
- (k) Shortcut switch off: `3`, `t` and `m` do nothing and Ctrl+K opens search.
  Switch on: they work again.
- (l) Write a story, a Lab step and a tool field, tick a checklist item, Export:
  the JSON has those keys. Reset, Import: the values are back after reload.
  Importing `{}` and a non-JSON file: both rejected, key count unchanged. Repeat
  from `file://`.
- (m) `node src/build.js`: validator OK, 351 states with 0 overlaps, JS syntax
  OK. CI, if approved: a throwaway branch that edits `src/` without rebuilding
  fails the sync step.
- (n) Every primary route at 375, 1024 and 1440: no console errors.

## 7. Open questions / decisions

1. Approve adding GitHub Actions CI (commit 10)? It is a CI/CD change.
2. Confirm the structure routes in 3a: map home, a domain, and a project system
   keep the map in front on phones.
3. Add `check-contrast.js` to the build (recommended), or check contrast once by
   hand?
4. Should Import replace all saved data (recommended: a predictable restore) or
   merge key by key?
5. The phase 2 to 4 decisions in the roadmap are needed before those plans are
   written, not before phase 1.
