---
status: active
updated: 2026-10-02
---

# UI revamp: a calm map, artistic type, practical UI

## Goal

Owner feedback (2026-10-02):
- The map's animation and zooming jump around so much that it is hard to follow what happened, and the flashing on hover is overwhelming.
- The fonts are not liked: use ones that look more "artistic".
- Research practical UI/UX design and revamp the interface.

**Rules:**
- Coordinator on Opus; workers on Sonnet 5.5 at low effort, at most two at once and never two on one file.
- This file is updated as each task lands, so progress survives a crash.
- Every commit is replayed through CI in a clean worktree before it is pushed, and the real GitHub run is checked afterwards (Linux Chromium, not Windows Edge).
- Free fonts only (SIL OFL), self-hosted in `assets/fonts/`. No AI attribution.

## What the code does now (map)

- Hovering a leaf with a note can pan the camera to fit the note (`showWhy` calls `mapAnimateTo`), so the view moves without a click.
- Every hover dims the whole graph (`.kgraph.dimmed`: edges to 7% opacity, nodes to 35%), so moving the pointer across nodes makes the whole map flicker.
- Every click redraws the whole tree in its new layout at once, while the camera glides and re-zooms over 480 ms (`mapAnimateTo`, `branchFrame`). Nodes jump and the camera moves at the same moment, so the eye cannot follow what changed.

## Research (2026-10-02)

| Question | What the research says | Decision |
| --- | --- | --- |
| How should a changing graph animate? | Heer and Robertson, *Animated Transitions in Statistical Data Graphics* (InfoVis 2007, [paper](https://vis.berkeley.edu/papers/animated_transitions/2007-AnimatedTransitions-InfoVis.pdf)): animated transitions improve tracking of what changed; staged transitions do better still; keep transitions simple, predictable and free of occlusion | Keep object constancy: nodes slide from their old place to their new one, then new nodes and edges fade in (two stages) |
| How long? | About 100 ms reads as instant; 200 to 300 ms suits a substantial screen change; 1 s breaks the flow of thought ([Nielsen Norman Group timing, as summarised by SAP Fiori](https://www.sap.com/design-system/fiori-design-web/v1-145/foundations/interaction/timing)) | Node moves 240 ms ease-out; feedback on hover 100 ms; nothing longer than 300 ms |
| When should hover react? | A pause of 300 to 500 ms signals intent; tooltips usually wait about 500 ms so a passing pointer does not flicker them | Hover highlights only the node and its own links after a short intent delay; the tooltip waits 400 ms; nothing dims the whole graph |
| Who moves the camera? | Unrequested motion breaks orientation; WCAG 2.3.3 (Animation from Interactions) asks that motion triggered by interaction can be turned off | The camera never moves on hover; after a click it keeps its zoom and pans only as far as needed to keep the selected node and its open children in view; zoom changes only through the user's own zoom, fit, or the first view; reduced motion turns every transition off |
| Practical UI | Nielsen's heuristics (consistency, recognition over recall, minimalist design); a reading measure of about 45 to 75 characters; a type scale and a 4/8 px spacing scale; Fitts's law for targets; fewer competing signals per screen | Applied in the visual revamp below |
| Artistic, free type | Fraunces (Undercase Type, OFL): a soft "Old Style" display serif with weight, optical-size, softness and "wonky" axes ([Google Design](https://design.google/library/wonky-goofy-fraunces-typeface/)). Bricolage Grotesque (Mathieu Triay, OFL): an expressive grotesque with width, weight and optical-size axes whose text sizes turn calm and neutral ([GitHub](https://github.com/ateliertriay/bricolage)). Martian Mono (Evil Martians, OFL): a characterful monospace with width and weight axes | Fraunces for headings, Bricolage Grotesque for text and UI (its width axis gives the condensed cut for labels and map cards), Martian Mono for code only |

## Checklist

| # | Task | Who | Status | Notes |
| --- | --- | --- | --- | --- |
| U0 | Research, decisions, plan | coordinator | done | this file |
| U1 | Map: no camera move on hover, no whole-graph dimming, hover intent delay, nodes slide to their new place then new parts fade in, camera keeps its zoom and pans only when needed, reduced motion off; tests updated | worker | done | hover: 120 ms intent, only the node and its own edges, tip after 400 ms, never moves the camera, no whole-graph dim; clicks: nodes slide 240 ms then new parts fade, camera keeps its zoom and pans only as needed; reduced motion instant; click-to-settled about 320 ms median; smoke 269/0, e2e 105/105 |
| U2 | Fonts: Fraunces, Bricolage Grotesque, Martian Mono; stacks, measured wrap factors, real-font layout check | coordinator + worker | waiting | needs the owner's go-ahead to download |
| U3 | Visual revamp: type scale and reading measure, spacing scale, quieter labels (fewer all-caps monospace chips), calmer surfaces and hover states, consistent buttons, first-screen hierarchy | worker | todo | 01-head.html, small markup changes in 90-app.js |
| U4 | Independent UX review of the result, fixes | reviewer + worker | todo | |
| V1 | Checks, CI replay and the real GitHub run, browser verification at 1440 and 375, archive | coordinator | todo | |

## Log

- 2026-10-02: plan written. U1 started.
- 2026-10-02: U1 done and pushed. U2 waits for the owner's go-ahead to download the fonts.
