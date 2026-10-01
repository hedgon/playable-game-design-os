# Developer audit: Playable (playable-game-design-os)

(The tool refused to write `report.md` in the scratch folder: "Subagents should return findings as text". This answer is the full report. The scripts, the JSON results and the screenshots are in `<scratch>/`.)

## 1. Who I am and how I audited

I am a senior software engineer: 12+ years on game clients and online backends, front-end performance and accessibility, build tooling and CI.

What I looked at, with counts:
- **Repo and build:**
  - Read: `README.md`, `CONTRIBUTING.md` (the test and CI sections), `.github/workflows/build.yml`, `jsconfig.json`, `src/build.js` and `src/manifest.js`.
  - Read in `src/90-app.js`: the router, store, import/export and search code, about 400 of its 2,612 lines.
  - Checked the size of all 61 files in `src/`.
  - Did not read `docs/_archive`.
- **Repo checks, all re-run today, all exit 0:**

| Check | Result |
|---|---|
| `node src/validate.js` | 206 topics, 23 paths, 774 steps, 58 "LONG" notices, 0 errors |
| `node src/check-contrast.js` | 670 pairs, lowest 4.60 |
| `tsc -p jsconfig.json` | clean |
| `node src/e2e-paths.js` (Edge) | 100/100, 33 s |
| `node src/smoke.js` (Edge) | 260 route visits at 4 widths, 0 failures, 2 min 40 s |

- **My own Playwright/Edge scripts.** These ran against the local server, and against a read-only gzip server I started on port 8799 over the repo. I stopped it at the end.
  - Load timing: 4 network/CPU profiles, 2 runs each.
  - 25 routes timed on desktop and on a phone with 4× CPU throttling.
  - Heap measured over 6 laps of all routes.
  - Saved-data robustness: 190 combinations (38 keys × 5 wrongly shaped values) over a 30-route tour.
  - XSS: payloads typed into 90 fields on 15 tool pages, plus a hand-made import file.
  - 27 bad deep links, back and forward, `document.title` on 6 routes.
  - Accessible names of 14 header controls, the search ARIA, image attributes on one game page.
- **Snippets:**
  - Compiled all 151 Unity C# snippets one by one with the Roslyn csc that ships with Unity 6000.3.11f1, against its UnityEngine assemblies. C# 9; each tried as declarations, as class members and as statements. Re-run today, 36 s.
  - Read 6 snippets in full: save systems in C# and GDScript, rollback in C# and GDScript, memory/GC, source control.
  - Compiled none of the 151 Godot snippets (no Godot install).
- **Content:**
  - Read one engineering topic in full (backend-go-idioms: all 8 parts and its interview).
  - Keyword scans over all 206 topics for currency and coverage.
  - All 23 paths summarised (hours, stages, steps, prerequisites).
  - Walked one engineering path step by step: netcode-server-engineer, 6 stages, 32 steps, 6 checkpoints.
  - Counted the opening verbs of all 284 steps in the engineering track.
- **Screens:** about 12 screenshots at 1440 and 375 px.

## 2. First impression

The first screen is confident and tidy: a path chooser and a dense, well-set dark UI that reads like a field manual.

Then the network panel. It is one 8.45 MB HTML file (2.7 MB gzipped), and 93% of it is data that is all parsed before anything works. On desktop that hardly matters; on a slow phone it is a long blank wait.

The engineering pages are better than I expected. The Go and Unity advice is current and specific, and the C# compiles. But the engineering course teaches mostly by reading and writing short answers, not by building.

Repo hygiene is unusually serious for a personal project: a validator, a layout checker, a contrast checker, an e2e test and a CI check that the committed file matches the sources. The weak spots are plain web-app basics: route titles, not-found handling, scroll restoration, search accessibility, and saved data with the wrong shape.

## 3. Good

- **The build is honest and simple.** Confirmed (`build.js`, `build.yml`).
  - `build.js` concatenates the files listed in `manifest.js`.
  - It fails on: validator errors, layout overlaps, contrast below 4.5:1, a syntax error in the bundle or in any single file, a `data-action` with no handler, and a JS `matchMedia` width with no CSS breakpoint.
  - CI then runs `git diff --exit-code playable.html`, so the committed file cannot drift from its sources.
- **The validator is a real content linter.** Confirmed (validate.js).
  - It checks that cross-links resolve.
  - It checks path coverage: topics 206/206, games 107/107, engines 9/9, platforms 12/12, checklists 12/12.
  - It checks the age of dated facts: 289 facts, 0 older than a year.
  - It enforces asset-weight budgets per page.
  - Advisory notices are kept separate from errors.
- **Output escaping holds.** Confirmed (probe.js → probe-v2.json: `xssTyped.fired 0`, `xssImport.fired 0`).
  - The 90 XSS payloads typed into the 15 tool pages fired 0 times.
  - A crafted import fired 0 times. It put `<img onerror>` and `<svg onload>` into the recent pages, review items, library, chooser and a CSS-width key.
  - One `esc()` is applied wherever output is built (`90-app.js:10`).
- **The site is fast after load and does not leak.** Confirmed (perf-routes.out).
  - Routes render in 3–46 ms on desktop.
  - The heap goes from 26.0 to 26.3 MB over 6 laps, with constant node and listener counts.
  - Search takes 6–22 ms per keystroke.
- **The Unity C# is real code.** Confirmed (cscheck.js re-run today).
  - Of 151 snippets, 58 compile clean against the Unity 6.3 assemblies.
  - 92 fail only on names the excerpt assumes from its context: its own fields, the Input System, NUnit, protobuf types.
  - 0 call a member that does not exist (no CS0117 or CS1061 errors) and 0 raise an obsolete-API warning.
  - The one real failure is a `.gitignore`/`.gitattributes` block sitting in the C# tab (craft-source-control-for-games).
- **The engineering advice is current and sharp.** Confirmed (backend-go-idioms and craft-save-systems read in full). Examples:
  - The Go 1.23 timer change, correctly scoped to "modules older than Go 1.23".
  - Building HTTP servers explicitly with all four timeouts set.
  - Finding a goroutine leak by grouping the profile at the creation site.
  - Saves with File.Replace plus a `.bak` and a checksummed body, with the right pitfall (a phone kills the app without OnApplicationQuit).
  - The interview red-flag lines, such as "Restarts instances on a schedule and calls it mitigated", are what real interviewers listen for.
- **Accessibility groundwork is in place.** Confirmed.
  - `lang="en"`, a skip link, `:focus-visible` rings.
  - Reduced motion is handled in the CSS and in the map camera (`01-head.html:68`, `91-map.js:329`).
  - A live region for toasts, and a switch to turn off single-key shortcuts (WCAG 2.1.4).
  - Images are lazy-loaded with alt text: 15/15 on #/games/zelda.
- **Import is transactional.** It snapshots the current data and rolls back on a storage error (`90-app.js:2579-2581`). Confirmed (code).

## 4. Bad

1. **One wrongly shaped saved value blanks the whole app, with no way out in the UI.** Confirmed (verify1.js, fuzz-storage.out).
   - `const seen = new Set(store.get('seen', []))` runs at top level (`90-app.js:29`).
   - With `playable.seen = 5`, every route shows an empty pane, and Reset does not work: the script stops before its handlers are attached (shots/v-fuzz-seen.png).
   - `review = null` blanks #/paths, #/review and every path page. `path.<id> = {}` blanks #/paths and that path.
   - 50 of the 190 combinations, across 19 keys, threw an error or left a pane empty.
   - Import checks only that each key starts with `playable.` and each value is a string (`90-app.js:2576-2577`), so an older or hand-edited export gets straight into this state.
   - `store.get` checks no types, and `render()` has no try/catch (`90-app.js:211`).
2. **Nothing works until 2.7 MB has downloaded and been parsed.** Confirmed (perf-load2.json, shots/v-midload-5s.png).
   - 7.85 MB of the 8.45 MB file is JS data literals that run at boot. That includes `18-games-genres.js` (1.33 MB) and `18-games-series.js` (1.05 MB), even for a reader who only wants a backend topic.
   - Slow 4G with 4× CPU: ready in 14.5–14.7 s. The shell is still empty at 5 s (`#app` text length 0).
   - On that profile, total blocking time is 0.8–1.0 s, with one task of about 500 ms.
   - Cable: 4.6 s. Unthrottled desktop: 0.4–0.6 s.
3. **`document.title` never changes.** It is the same on all 6 routes I checked, so tabs, history entries, bookmarks and screen-reader page announcements are all identical. Confirmed (verify2.js).
4. **Bad deep links fail silently, sometimes to the wrong page.** Confirmed (probe-v2.json, verify2.js).
   - `#/map/t/nope` shows *The core loop* while the URL keeps "nope".
   - `#/games/nope` shows the games index.
   - None of the 27 bad links showed a not-found message.
   - The README says an unknown link lands on All pages; that is true only for an unknown top-level view.
5. **Back does not restore the scroll position.** On #/games/zelda I scrolled to 3000 px, went to #/engines/godot and pressed Back: the page opened at 0. Confirmed (verify2.js).
6. **Search does not work with a screen reader.** Confirmed (code, plus probe searchA11y: every attribute null).
   - The input has only a placeholder, no label (`01-head.html:1294`).
   - Results are click-handled `<div>`s with no role, no tabindex and no `aria-activedescendant`, and there is no live result count (`90-app.js:2504-2512`).
7. **Icon buttons have glyph names.** The theme button's accessible name is "◐" and the help button's is "?"; their `title` becomes a description, not the name (`01-head.html:1286,1288`). Confirmed (accessibility tree).
8. **The "Go-first" backend domain has no Go code.** Confirmed (grep).
   - The domain header says "BACKEND (Go-first)" (`34-topics-backend.js:2`).
   - Every code block in the 11 backend, 9 server and 8 infra topics is client-side Unity or Godot code.
   - A grep of `src/*.js` for `package main`, `func main()` or `if err != nil` finds nothing.
9. **The Unity rollback snippet drops inputs that arrive early.**
   - The Unity `OnRemote` starts with `if (f >= frame || frame - f > Max) return;`.
   - So an input for a frame not yet simulated (normal with input delay) is thrown away. That frame is then predicted and never corrected, and the peers can drift apart.
   - The Godot version stores the input before the guard, so the two tabs teach different behaviour for the same algorithm.
   - Confirmed by reading both snippets; that it causes a desync in practice is Likely.
10. **The engineering track mostly asks for written answers, not code.** Likely (keyword heuristic).
    - Of 284 steps, the first verb is "Write" in 74, "Read" in 42 and "Build" in 9.
    - About 71 (25%) ask for a code artifact; most of the rest ask for a sentence ("Write whether your own protocol could…").
    - No exercise has a reference solution or a runnable starter.
11. **CI checks less than the repo can.** Confirmed (`build.yml`, `jsconfig.json`).
    - `e2e-paths.js` is not run in CI; `CONTRIBUTING.md` says so itself.
    - `jsconfig` type-checks only the data files (`src/0*`–`5*`, with `strict:false`). The 430 KB of app code is never type-checked.
    - There is no `package.json` or lockfile, and CI installs a floating `playwright@1`, so a new Playwright release can change test results without any commit.
12. **The app code is concentrated in one file.** Confirmed.
    - `90-app.js` is 312 KB in one global scope.
    - It has 129 lines over 400 characters. `90-app.js:1580` is a 3 KB template on one line.
    - It has 176 inline `style=` attributes.
    - `esc()` is copied into 4 files (`87:27`, `88:28`, `89:32`, `90:10`).
13. **The README counts are stale.** It says "Twenty-one paths" (`README.md:16`) and "186 topics" (`README.md:47`); the validator reports 23 paths and 206 topics. Confirmed.
14. **Smaller items.**
    - The game page headings jump from H1 to H4 (#/games/zelda). Confirmed.
    - On a phone the floating "◂ Map" pill covers the top-right text under it (shots/v-phone-copy.png). Confirmed.
    - The Godot save snippet's `rename_absolute(PATH, PATH+".bak")` ignores its result. I expect it to fail on Windows once a `.bak` exists. Likely; I did not run Godot.

## 5. Useful

- The interview tabs on engineering topics: junior, mid and senior questions, each with a model answer, a follow-up and a red flag.
- The pitfall and engine-mapping lines on the Unity and Godot tabs.
- The craft topics (save systems, memory and GC, timestep, security review of generated code) and backend-go-idioms: I would send these to a mid-level hire.
- The dated facts with sources in the AI and platform topics.
- For a maintainer: the validator and `check-layout.js` are good patterns for any content-heavy static site.

## 6. Useless

- Nothing tells the reader whether a snippet is complete or an excerpt (58 of the Unity snippets are complete, 92 are excerpts).
- A `.gitignore` shown in the "Unity C#" tab.
- The "Topics read 0/206" counter for a reader who arrives from search; it counts clicks, not learning. Opinion.

## 7. Expand

- Go server code for every backend, server and infra topic, compiled in CI.
- Named stacks in the server domain. Across all topics: 0 mentions of Agones, GameLift, PlayFab, Nakama, Photon, Mirror, Netcode for GameObjects, Postgres or MySQL, and 1 of Steamworks (keyword scan). That this matters is my opinion.
- Runnable exercises with reference solutions and self-check tests.
- Lazy loading of the game content.

## 8. Less

- Fewer reflective "Write whether…" steps in the engineering paths, and more building.
- Fewer inline styles and one-line 3 KB templates in `90-app.js`.
- Fewer of the 58 advisory LONG notices per build that nobody acts on: either fix the content or raise the limits.

## 9. Top 10 changes, ranked

1. **High: make saved data unable to brick the app.** Evidence: Bad #1, 50/190 combinations failed.
   - Read each key with a type check that falls back to the default on a wrong shape.
   - Check value shapes on import.
   - Wrap `render()` in try/catch with a "reset this page's data" message.
2. **High: get boot under 3 s on a mid-range phone.** Evidence: Bad #2, 14.5 s to ready.
   - Move the about 3 MB of game and series analyses out of the boot parse: either lazy `<script type="application/json">` blocks, or files in `assets/` fetched on first visit.
   - Show a static loading or paths view while the rest loads.
3. **Medium: a title per route.** Set `document.title` on every route and announce route changes in a polite live region. Evidence: Bad #3.
4. **Medium: real not-found states.** Show "No topic called 'nope'" with suggestions, and use `location.replace` so the bad URL does not stay in history. Evidence: Bad #4.
5. **Medium: fix the rollback snippet.** Store early remote inputs in the Unity version (within `Ring - Max` frames ahead) so both engine tabs agree. Evidence: Bad #9.
6. **Medium: accessible search.** Use the combobox and listbox pattern with `aria-activedescendant`, add a label and a live result count. Evidence: Bad #6.
7. **Medium: Go snippets plus a compile gate.** Add Go snippets checked with `go vet` in CI, and gate the Unity snippets with csc the same way (36 s locally). Evidence: Bad #8.
8. **Medium: close the CI gaps.** Run `e2e-paths.js` in CI, pin Playwright with a lockfile, and type-check the app files. Evidence: Bad #11.
9. **Low: restore the scroll position on Back** through history state. Evidence: Bad #5.
10. **Low: small fixes.** Add `aria-label` to the icon buttons, fix the heading order, and generate the README counts from the validator. Evidence: Bad #7, #13, #14.

## 10. Set aside

- Visual design taste of the map and the field-manual style: another auditor's role.
- Game-design content quality and the factual accuracy of the reference games: outside the engineering scope; I measured only their weight.
- Layout shift from images: they have no width/height, but the CSS sets `aspect-ratio` on thumbnails, so I judged it low risk and did not measure it.
- localStorage privacy: data never leaves the browser, by design.
- Single-file distribution itself: a deliberate product choice; I criticised only its boot cost.
- The 58 LONG notices: advisory by design; mentioned under Less, not as a defect.

## 11. What I could not check, and why

- GDScript (151 snippets): Godot is not installed, so none were compiled.
- Real devices: I used CDP throttling only; I had no real phone.
- Screen readers: I checked only the accessibility tree and the code; I did not listen with NVDA, JAWS or VoiceOver.
- Live GitHub Pages headers and caching: not fetched; I measured gzip with my own local server.
- Paths: I walked 1 of the 23 in full and summarised the other 22.
- Topics: I read 1 engineering topic in full and keyword-scanned the other 205, so errors outside my samples are possible.