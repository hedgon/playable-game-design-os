---
status: shipped
updated: 2026-09-23
---

# Improvement tasks

Working record for the whole improvement programme described in
[improvement-phase1-plan.md](improvement-phase1-plan.md). Owner instruction
(2026-09-23): do every phase, large refactors allowed when independently audited
with real evidence; test content, UI and code; then commit and push without
asking.

Order change from the plan: behaviour-preserving refactors (plan phase 2) run
before the phase 1 fixes, so the fixes are written once, directly in the new
structure, and every refactor can be proven against a golden master of the
current app. Commits land per task after that task's checks pass; the push
happens once, after the final full test and independent review.

Evidence used throughout:
- golden master: every route rendered at 1440x900, hashing text, rendered text,
  layout signature, rail and map state, plus console errors;
- link crawl: every `#/` target reachable from the UI renders a real page;
- data snapshot: the evaluated data serialized, compared before and after;
- the build (validator, layout check, syntax check) and the new checks added here.

Legend: `[ ]` todo, `[~]` in progress, `[x]` done (with the evidence line).

## T0 Evidence harness
- [x] T0.1 Route sweep and golden master baseline: 877 routes, 0 console errors; two sweeps of one build differ in 0 routes on every field
- [x] T0.2 Data snapshot baseline: 40 bindings, 133 topics, HEAD and working tree identical
- [x] T0.3 Link crawl baseline: 865 distinct `#/` targets, 0 unresolvable

## T1 Build scripts and one registry
- [x] Validator evaluates the data once; syntax check in process (`vm.Script`, verified to reject a syntax error)
- [x] TOOLS, VIEW_LINKS and diagnostics declared once in `05-registry.js`: golden master 0 diffs; inventory differs only in diagnostic order, which now follows the UI

## T2 Data files by domain
- [x] One file per domain holding each topic's T, TECH, ENGINE and INTERVIEW: 41 data bindings identical except TOPICS insertion order (per-domain order unchanged); the sweep differs in exactly the 13 topics whose "Appears in" chips now follow map order, as predicted from the data

## T3 Layout checker on node geometry
- [x] Check `build().nodes` instead of regex-parsing SVG: old and new checkers report identical overlap sets as built (0), with rows squeezed (6,632 pairs) and with columns squeezed (603 pairs); labels the renderer shortens are now listed (221)

## T4 App files with their own scope
- [x] Per-file IIFE, explicit shared namespace, files parse alone (the build checks each file): sweep 0 diffs in 1010 routes

## T5 Interaction semantics
- [x] Links and delegated actions replace 93 inline `onclick` templates and 15 `window.__*` globals: sweep 0 diffs in text, layout and rail; interaction check 33/33; the build fails on a data-action with no handler (proven with a removed handler)

## T6 Keyboard-operable map
- [x] Focusable nodes, Enter/Space, arrow keys, Home, focus kept through redraws: keyboard check 12/12

## T7 Types
- [x] JSDoc typedefs and `jsconfig.json` (checkJs on data files): tsc 5.9.3 reports 0 errors; a misspelled field is caught ("Did you mean 'tag'?")

## T8 Fixes (plan phase 1)
- [x] T8.1 Content pane rule on narrow screens: E2E 10/10 at 375 and 1024 (first visit, topic tap, close, back, forward, tool route, index re-open); smoke test fails 99 times with the rule removed
- [x] T8.2 Camera follows the stage: a camera saved at 375px is not reused at 1920px (19/19 domain cards inside); smoke test covers widening and narrowing in headless Chrome
- [x] T8.3 Contrast: 84 of 286 pairs failed, now 0 (lowest 4.60:1); check-contrast.js in the build
- [x] T8.4 Toast role, skip control, focus on navigation, reduced motion, dialog focus (take, trap, return): chrome 11/11, dialogs 5/5; reduced motion by code review (no emulation in the pane)
- [x] T8.5 Theme follows the OS until chosen: verified with colour-scheme emulation across reloads
- [x] T8.6 Single-key shortcut switch: off ignores 3, Ctrl+K still works; also fixed focus left in the hidden search box after Escape, which silently disabled shortcuts
- [x] T8.7 Export and import: export holds every playable.* key; import after a wipe restores all 9; a non-export is rejected with storage untouched
- [x] T8.8 Godot 4 ticks clock name: the only sweep diff (1 route)
- [x] T8.9 CI: build, sync check, types, smoke (154 visits, 0 failures locally)

## T9 Information architecture and layout
- [x] T9.1 Lenses: Design (14 domains) and Engineering & Career (5), switched from the index; routes pick their lens; list grouped by lens
- [x] T9.2 Navigation: six sections with sub-tabs, "Experience" view renamed Projects; the bar fits at 375, 1024 and 1440 (was cut off at 1440)
- [x] T9.3 Phone map: one-sided tree framed per column; 14/14 domain cards fit the width at about 17px text (was one letter each)
- [x] T9.4 Work layout: non-map views take the width on wide screens (tool pane over 900px at 1440, was 460)
- [x] T9.5 "Appears in" follows the sections
- [x] T9.6 One door per job: the Idea Lab offers the Idea Shaper as its market-first mode; the start dialog no longer miscounts doors
- [x] T9.7 Idea Lab one step at a time, step nav with filled markers, "show all" toggle
- [x] T9.8 Review queue for interview questions (1, 2, 4, 8, 16 days); phase 3 checks 28/28
- [x] T9.9 Service worker: decided against (see decisions log)

## T10 Content currency
- [x] T10.1 `facts` schema, callout, stale warning: validator checks claim, YYYY-MM-DD and https source; a fact older than a year is a warning with a recheck line, never an error
- [x] T10.2 Dated product and ethics facts, sourced: 17 facts on 6 topics after review (odds disclosure on Apple, Google Play and ESRB; FTC and Cognosphere; amended COPPA Rule; Epic v. Apple and the Supreme Court grant; Steam 2026 disclosure; EU AI Act Article 50; SAG-AFTRA 2025; US Copyright Office Part 2), each linked to its source and checked 2026-09-23
- [x] T10.3 Four AI-era topics: agents that build, evals, generative assets, disclosure and platform rules; each with TECH, Godot and Unity views, 6 to 7 interview questions
- [x] T10.4 Generative characters topic (In-game AI): action allow-list, latency and cost budgets, on-device versus cloud, prompt injection, authored fallbacks, property tests
- [x] T10.5 Player motivation: Quantic Foundry model in the overview, a technique entry, and the sources page
- [x] T10.6 Paths, related links, counts: 7 inbound links, one step each in Technical lead and Build and release engineer; 138 topics; build, layout (705 states, 0 overlaps, 1 shortened label), contrast, tsc and smoke (157 visits, 0 failures) pass

## T11 Docs
- [x] README for readers, CONTRIBUTING for authors, design docs aligned (5c8add4)
- [x] Plans marked shipped and archived under docs/_archive/improvement/

## T12 Review and release
- [x] Independent reviews: code (Sonnet), content facts (Opus), UX and accessibility (Sonnet), each told to verify by running something
  - Code: a fact source that starts with https:// but does not parse would pass the validator and break the topic page; the validator now parses it (negative test: "https://", "https://[", http and ftp all fail). Its other three findings (UTC review days, positional review keys, domain colours in other formats) matched fixes already made from the checklist.
  - Facts: Epic v. Apple rewritten from the ruling and the Supreme Court docket (review granted 30 June 2026) and split in two; Steam facts reworded from the Steamworks page, which becomes their source; a Godot ERR_BUSY pitfall and a Unity SetLabels snippet corrected; judge bias is toward "its own answers"; Godot export hooks cannot stop an export; both eval runners read one {"cases": [...]} file; an unsourced Quantic Foundry sentence replaced.
  - UX: drawers on narrow screens covered the header, so nav, search and help could not be tapped with a drawer open; drawers now open below the measured header (every header control hit-tests to itself at 375 and 1024 px). The Diagnose search field no longer autofocuses and swallows shortcuts; the help dialog focuses its heading; small controls reach 24 px; the review page lists questions coming up, with Remove.
- [x] Pre-PR checklist: review days counted in the reader's time zone (UTC+7 test with a pinned clock), review keys by question text, a build check that JS and CSS breakpoints match, a contrast-check guard against unparsed domain colours; each new check shown to fail on a broken copy
- [x] Full test: build (validator, 705 layout states, 286 contrast pairs, syntax, actions, breakpoints), tsc, smoke (157 visits, 0 failures), sweep of 1036 routes at 375, 1024 and 1440 px (0 console errors, 745 link targets, 0 broken), template-leak scan (0)
- [x] Commit and push

## Decisions log

- Registry order follows the Diagnose tabs (fun before loop); the inventory
  prints diagnostics in that order now.
- The sweep visits topics in domain order, not TOPICS insertion order, so a
  data-file regrouping cannot reorder the visits (which shifted "topics seen"
  counts in the rail and read as 316 false diffs).
- The harness first missed 132 topic overviews: the app remembers the last
  topic tab, so bare topic routes after an /interview route rendered the
  interview tab. Every tab is now visited by name, and a project's overview
  tab is pinned before its route (it has no URL of its own; fixed in T8).
- Four actions (toggle-parent, focus, clear-tool, fit-map) lost their
  handlers in the first T5 pass; the interaction check caught it, and the
  build now fails on any data-action without a handler.
- Topic links use the canonical #/map/t/ route instead of the #/topic/
  redirect; the old route still works for saved links.
- Viewport emulation in the preview pane fires no resize or media-query
  change events (a hidden page skips the rendering step where both fire),
  so width changes are tested in the Playwright smoke test instead.
- Map labels wrap onto two lines instead of being shortened: 221 shortened
  labels became 1 (a 67-character project system title). Wider cards were
  rejected because they spread the tree and shrink every label.
- Lenses rather than two separate files: one build, one search, and topic
  pages still link across lenses; the toggle lives in the index and on the
  map home panel.
- Idea Shaper stays a tool, cross-linked from the Idea Lab: merging would
  cost a data migration and path and validator changes for no reader-facing
  gain beyond the single door.
- The first review of a question is tomorrow, not today: recalling it right
  after reading it tests memory of the last minute. The UX review read that as
  a bug because the queued question vanished; the fix is a visible "Coming up"
  list with Remove, not an earlier due date.
- Drawers open below the header instead of raising the header over them: a
  raised header would hide the drawer's own close button and top content.
- No service worker: a stale cache on a site that changes with every
  content commit is a worse failure than being online-only, the saved file
  already works offline, and export and import now cover data durability.
