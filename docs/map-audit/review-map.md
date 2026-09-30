---
status: done
updated: 2026-09-30
---

# Independent review of the map rework (commit 344791e)

Checks after the fixes: validate OK, check-layout 0 problems with text measured in the browser (0 labels do not fit), check-contrast 0 below 4.5:1, tsc clean, smoke 260 visits 0 failures, e2e-paths 100/100.

| # | Item | Verdict |
| --- | --- | --- |
| 1 | `PlayableGraph.neighbours` correctness | fixed (1 gap) |
| 2 | ARIA tree, roving tabindex, arrow keys, live region, phone outline | pass |
| 3 | Skip links | fixed (added) |
| 4 | "Why" note covering a neighbouring card | fixed |
| 5 | Stale "shortened" naming | fixed |
| 6 | Edge-crossing count | fixed (measure split) |
| 7 | State pruning and debounce | fixed (1 bug) |
| 8 | Path map and project map | pass |

Counts: pass 2, fixed 6, fail 0 remaining.

## 1. neighbours

Checked 35 of the 206 topics (every sixth) against the data with an independent walk over games, smells, checklists, prompts, paths, tools, guides and case studies. No duplicates, no spurious leaf (every game, smell, path and related topic links back), every related topic present in both directions.

Gap found: a case study's own `rel` (project-level topic links, e.g. scope-control and server-authority to the Unity port, metrics-and-success to the Go backend) was not shown, only part-level `rel`. Fixed: the project appears in the "Projects and parts" group as "Project: why". The group label changed from "Project parts".

## 2. ARIA

Canvas: `role="tree"` on the svg, every node a `treeitem` with `aria-level` 1 to 5, `aria-setsize`, `aria-posinset`, `aria-selected`, a label, and `aria-expanded` on domains, groups and the open topic; exactly one `tabindex="0"`. Keys follow the APG tree: Down and Up in reading order, Right opens or steps into the first child, Left closes or steps to the parent, Home and End, Enter and Space open. Arrow travel says nothing; only open, close and open-page actions are announced, through one polite region, so it is not spammy.

Phone outline (375 px): `role="tree"`, nested `ul role="group"` inside `li role="treeitem"`, levels consistent with nesting (0 mismatches), 1 tab stop, same keys, labels on all 54 items.

## 3. Skip links

The site already had "Skip to content". Added "Skip to the map" as the second Tab stop, same `.skip` style. It shows only when a map is drawn. On a topic page where the map is folded away it opens the map first and then focuses the map's tab stop. Smoke now checks it (second Tab stop, Enter lands on a tree item).

## 4. Why note

The note was appended below the card and could cover the next card. It now tries the outer side of the card first (nothing is out there), then below, then above, and takes the first place that covers no card and stays in the window. With keyboard focus, if the note would be past the edge, the camera pans to bring it in. Checked on all 17 noted leaves and items of a topic: 0 overlap another card.

## 5. Stale naming

`layout-core.js` said "a text the renderer had to shorten" of the diagram checker; it now says the diagram renderer had to cut it (that is the diagram code's `cut`). Nothing else in `layout-core.js`, `check-layout.js` or `89-graph.js` still talks about shortening the map's labels.

## 6. Edge crossings

The measure counted pairs of edges whose sampled curves cross, once per pair (not per segment, and shared endpoints are skipped). It mixed two things. Of 462,253 pairs, 0 were tree edges crossing tree edges; all were the faint dashed cross-branch links (domain to domain, topic to domain, leaf to home domain) passing over the tree or each other, which they do by design. Fix: the checker now reports `tree` (must be 0, and now fails the check if not) and `link` (about 400 per state, information only). CONTRIBUTING.md updated.

## 7. State

Pruning works: an unknown lens, domain, topic, smell, group id, node key, malformed camera and stale `projMap.*` and `pathMap.*` are dropped or reset on load. Writes are debounced (0 during a 10-tick wheel burst, written 250 ms after, flushed on pagehide).

Bug found: reloading did not keep the camera. Three causes, all fixed in `91-map.js`: the folded-away map (text-first topic page) had no size and its default frame overwrote the saved camera; the shell's first draw as "home" used up the restore; and a domain or topic route grew the saved camera to the size of the branch. A camera is now restored exactly when coming back to a stage, a redraw of the same place keeps a camera the reader set, and a first measurement made before the layout settles no longer discards it. Checked: zoom width is identical before and after a reload, with a wait of 400 ms and of 30 ms.

## 8. Path map and project map

Project map (10 tree items) and path map (13 tree items) draw with no page errors; the same tree semantics; smoke covers both, 0 failures.

## Files changed

`src/89-graph.js`, `src/91-map.js`, `src/01-head.html`, `src/layout-core.js`, `src/check-layout.js`, `src/smoke.js`, `CONTRIBUTING.md`.
