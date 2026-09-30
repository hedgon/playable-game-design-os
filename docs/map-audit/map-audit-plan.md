---
status: active
updated: 2026-09-30
---

# Map audit: is the map useful, and does it work?

## Goal

On 2026-09-30 the owner asked for research and an audit of the map. Is it really useful? Does it serve a purpose? Does it work well, navigate well and look fine, and is it well integrated with the rest of the site?

The map is the tidy-tree mind map in `src/89-graph.js` and `src/91-map.js`. It has three lenses:
- the concept map (domains and topics, Design and Engineering and Career);
- the project map (systems and parts);
- the path map (stages and steps).

It sits beside the reading pane on desktop. Since the UX review, topic pages open text-first with the map one click away, and phones read the map one column at a time.

**Rules:**
- Opus orchestrates and Sonnet 5.5 workers do the work, at most two at once.
- The audits are read-only.
- Any change is evidence-led and reviewed.
- Every commit is replayed through CI in a clean worktree before it is pushed.
- No AI attribution.

## Checklist

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| M1 | Learner and research audit: purpose, usefulness against evidence on concept maps and graph views, task-based tests at 1440, 1920 and 375 px, visual quality, accessibility, performance, integration | done | verdict: worth changing; 14 findings in [findings-map-ux.md](findings-map-ux.md) |
| M2 | Engineering audit: data model, layout, camera and interaction code, bugs, performance, test coverage, dead code | done | 14 findings, 0 high; fast and leak-free; details in [findings-map-code.md](findings-map-code.md) |
| M3 | Verdict and decisions: keep, change or reduce, with a debate if unclear | done | below |
| M4 | Fixes, reviewed | doing | MA: connections, progress, fit, legend (map code); then MB: phone outline, accessibility, engineering fixes; MT (tests and checker) alongside |
| V1 | Checks, CI replay, a learner re-check, archive | todo | |

## Verdict and decisions (M3)

The two audits agree.

**What already works.** The map is fast and stable:
- 11 to 50 ms from route change to paint;
- pan and zoom at 60 fps;
- no memory leak over 150 route changes;
- no broken state;
- every label colour pair passes contrast.

The path and project maps do real work.

**What falls short.** The concept map mostly duplicates the left rail and the concept index. The site's own text says they "do the same work". Research on concept maps and graph views finds that node-link maps help with seeing structure, links between ideas and progress. Lists and search do better at finding a known item and at reading. The map currently delivers little of the first two:
- a topic's map shows 4 related topics, and none of the games, smells, tools, checklists, prompts or paths that link to it;
- 191 links that cross between the Design and Engineering lenses are not drawn and not hinted at;
- read state and "what next" are not visible on the map.

On phones, half the domains fall off-screen. Keyboard and screen-reader use is poor: 55 Tab presses to reach the first node, flat button nodes, and unlabelled zoom controls.

**Decision: keep the map and change its job.** It stops being a second index and becomes the view of connections and progress:
1. **Connections.** A topic's map shows its whole neighbourhood, derived from the data:
   - related topics, games, smells, tools, checklists, prompts and paths;
   - groups of leaves that collapse into an expandable count, so nothing is cut;
   - links into the other lens, shown as "also in Engineering" or "also in Design" leaves.
2. **Progress.**
   - Nodes show read and done state.
   - Domains show their progress.
   - A "next unread" cue points to the closest unread topic.
3. **Fit and legend.**
   - The home map fits every domain on first view at 1280 × 720 and larger, vertically as well as horizontally.
   - A small legend explains the colours and edge styles.
   - The "why" of a leaf is shown in place, not only on hover.
4. **Phones.** Below 700 px the map becomes an accessible outline of the same tree, with the same data, groups and progress. Node-link views are poor on small screens. The canvas stays on wider screens.
5. **Accessibility.**
   - Tree semantics: `role="tree"`, `treeitem`, `aria-level`, `aria-expanded`, `aria-selected`.
   - A roving tabindex, so one Tab press enters the map.
   - Arrow keys move within the tree, and expand and collapse are announced.
   - Labelled zoom buttons and a visible focus ring.
6. **Engineering.**
   - Fix the CSS font size that overrides the layout's label sizes.
   - `check-layout` uses real labels and the real font metrics.
   - Keep labels at 11 px or more under user zoom.
   - Throttle the storage writes on each wheel tick, and avoid re-parsing the SVG on each drag frame.
   - Prune stale persisted state.
   - Remove the dead code and CSS left from the radial map, and fix the stale comments.
   - Smoke and e2e cover keyboard travel, drag, wheel zoom, the lens switch, reset and the phone outline.
