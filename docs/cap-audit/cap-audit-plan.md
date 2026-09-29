---
status: active
updated: 2026-09-29
---

# Cap audit: no cap reduces content

## Goal

The owner asked on 2026-09-29 for an audit of every piece of content and every image: find anything trimmed, shortened, compressed, downscaled or cropped to fit a cap, and restore it. Rule: **no cap reduces content**, but restoring content must not bloat it with jargon. When a finding is unclear, resolve it toward content that is helpful, readable and well tied into the rest of the site (debate with a second agent when unsure).

## Working rules for this plan

- Opus orchestrates; Sonnet 5.5 (low effort) does the work. At most two agents run at once.
- Workers never run git. The orchestrator exports git history for them, reviews their output and commits.
- Commit and push to main after each phase once validation passes.
- Update this checklist after every task.
- Restored text follows CONTRIBUTING's writing style and the [analysis method](../references/analysis-method.md): plain words, sourced, fact-checked.
- Images follow the image rules in CONTRIBUTING: real screens, credited, readability first.

## Caps in scope

| Where | Cap | Kind |
| --- | --- | --- |
| validate.js | lens words 380, series entries 9, reception 7, shots 4, and about 20 more upper guides | soft (LONG line) since 2026-09-29 |
| validate.js | image 150 KB (lens and guide shots), 40 KB (series entry shots), 350 KB per page | soft |
| 87-diagrams.js, 89-graph.js | label wrap and ellipsis (`cut`) | display |
| 90-app.js | card snippets, "In real games" strip, search groups, name wrap in the systems builder | display |
| CSS | `object-fit`, fixed heights, aspect boxes on images | display (crop) |

## Checklist

Status: `todo`, `doing`, `done`, `n/a`.

### Phase 0: setup and baseline
| # | Task | Status | Notes |
| --- | --- | --- | --- |
| S1 | Tools on this machine: Node 24 LTS (winget), Playwright on Edge (`PLAYWRIGHT_CHANNEL=msedge`; Chromium download blocked), Pillow and imagehash | done | |
| S2 | Baseline: validate, build (no diff), check-layout, smoke, e2e-paths | done | 0 errors, 7 LONG; layout 0 overlaps and 0 shortened labels; smoke 229/229; e2e 44/44 |
| S3 | This plan and checklist | done | |
| S4 | Export git history for workers (image versions, text diffs) | done | 662 image versions, 136 commit word-diffs, in the session scratchpad |

### Phase 1: audit (read-only)
| # | Task | Status | Notes |
| --- | --- | --- | --- |
| A1 | Image inventory: every file and reference, bytes, dimensions, quality estimate, cap ratio | done | 531 files, 531 refs; 0 missing, unreferenced, uncredited or duplicate |
| A2 | Image history: every version of every image; flag downscales, re-encodes to smaller, crops | done | no lens or guide shot lost size; 3 headers re-cropped in 8b69ad7; series entry shots still at the old 40 KB sizing |
| A3 | Visual check of flagged images and of on-page cropping (CSS) at 375 and 1440 px | done | 122 viewed; only library cards crop (object-fit cover); pages and viewer show whole images |
| A4 | Caps inventory: every upper number in validate.js, CONTRIBUTING, layout and render code | done | see findings-text.md |
| A5 | Text history: content removed or shortened in git history, cap-driven or not | done | see findings-text.md |
| A6 | Near-cap and truncated text now: fields near a guide, sentences cut, ellipses in data, "more" lists that hide content | done | see findings-text.md |
| A7 | Display truncation: is the full text reachable wherever a label or snippet is cut | done | see findings-text.md |
| A8 | The 7 current LONG items: needed length or padding | done | see findings-text.md |

### Phase 2: triage
| # | Task | Status | Notes |
| --- | --- | --- | --- |
| T1 | Merge findings, drop false positives, decide an action per finding | done | decisions in the table below |
| T2 | Debate unclear findings with a second agent | todo | |

### Phase 3: fixes
| # | Task | Status | Notes |
| --- | --- | --- | --- |
| F1 | Images: re-source or re-encode at full quality; undo crops | todo | |
| F2 | Text: restore cut content, plain and sourced | todo | |
| F3 | Display: make cut labels and snippets reach the full text | todo | |
| F4 | Rules: CONTRIBUTING and validate.js so no cap can cut content again | todo | |
| F5 | Independent fact-check of restored text | todo | |

### Phase 4: verification and close
| # | Task | Status | Notes |
| --- | --- | --- | --- |
| V1 | validate, types, build, check-layout, smoke, e2e-paths | todo | |
| V2 | Visual check of every changed image on the rendered page | todo | |
| V3 | Report to the owner; archive this plan | todo | |

## Findings and decisions

Full reports: [findings-images.md](findings-images.md) (I1 to I20) and [findings-text.md](findings-text.md) (F1 to F15). No finding is high severity: nothing is provably lost. The pattern that matters is that content sits at the old caps, and the cutting happened in drafts before they were committed, so git has no copy of what was cut.

| Finding | What it is | Decision |
| --- | --- | --- |
| I1 | All 176 series entry shots are 512 px wide or less (112 at 480x270), the only image class still sized to the old 40 KB cap. The viewer upscales them about 2.5x | Re-source at the source's full detail, up to 960 px. Pixel art stays at native size or an integer scale of it. Page-weight approach settled in debate D1 |
| I2 to I4 | Candy Crush, Angry Birds and Fruit Ninja headers were cropped to the card shape in 8b69ad7 | Restore the 00f789b versions. Card display settled in D2 |
| I5, I6 | Library cards crop 18 headers by 12 to 74% (`object-fit: cover`) | D2 |
| I7, I8 | Low-quality JPEG headers (Euro Truck Simulator 2 at about q40, 16 more at q55 to 65) | Re-source where the store holds a better copy; otherwise leave |
| I9 | Godot and Unity editor shots under 900 px, with unreadable panel text | Re-source at 960 px or more |
| I10 to I12 | Contra Super C in a black frame; Pokémon Gold/Silver and SMT1 clipped at an edge; banding on Mega Man X | Re-cut from source |
| I13 to I20 | Source framing, false positives, Obra Dinn over its cap on purpose | None |
| F1 | Search keeps 80 hits in total, so whole groups are unreachable ("game" shows 5 of 107 games) | Remove the cap |
| F2 | Fire Emblem reception skips Three Houses, which its own Engage entry compares against | Add a sourced Three Houses entry |
| F3 | 9 of 22 series have exactly 9 entries (the old cap) and 6 have exactly 7 reception items | Review each; add an omitted entry only where it teaches something the others do not, with a real screen |
| F4 | 223 lenses at 360 to 379 words against only 23 at 380 to 399; 11 signatures at 690 to 700 of 700 | Rubric screen of every lens at 360 words or more and every signature at 660 or more against the analysis method; restore a missing or thinned element (comparison, cost, evidence) with sourced detail; no blind expansion |
| F5, F6 | analysis-method.md still says "150 to 330 words"; CONTRIBUTING words guides as ceilings | State minimums only; say once that going over is fine when sources support it |
| F7 | check-layout fails the build when a diagram label needs a third line, so authors shorten labels | D3 |
| F8 | The map shows at most 4 smells per topic (2 topics lose some) | Remove the cap |
| F9 to F12 | Clamped path-card audience, systems-builder name wrap, graph sub-label `cut`, snippets cut mid-word with "…" even when nothing was cut | Add a title with the full text, use `wrap` instead of `cut`, cut on a word boundary and add "…" only when text was cut |
| F13, F14 | Quiz lists and code snippets at their guides | None; quiz items, not teaching content |
| F15 | About 12 "and so on" / "and more" tails | Name the items where the list is short and known; keep the rest |
| LONG | 5 text items over their guides | Keep all; plain-word "In skill-atom terms" in StarCraft |

**Debates (T2).** D1: series entry shot size against page weight (one 960 px file, or a small inline file plus a full file for the viewer). D2: library cards, crop or show the whole header. D3: diagram labels, fail the build or let the box grow.
