---
status: baseline
updated: 2026-10-05
---

# Accessibility and HTML baseline (before P3)

Tools: axe-core 4.x (all rules) and html-validate (recommended preset, style-only rules off: inline style, title length, boolean/void/empty attribute style, trailing whitespace) over 22 rendered routes, axe at 1440x900 and 375x812 (44 checks), html-validate on the 1440 DOM with scripts removed. Script: scratchpad audit-tools.js (session-local). Routes: #/paths, #/paths/first-tiny-game, #/map, #/map/d/core, #/map/t/core-loop/overview, #/map/t/core-loop/interview, #/explore, #/games, #/games/hades, #/games/compare/failed-run-worth-it, #/platforms/steam, #/engines/godot, #/lab, #/build/loop, #/diagnose/smells, #/smell/repetitive, #/ai/loop, #/experience, #/review, #/sources, #/glossary, #/index.

## axe-core violations

| rule | impact | checks failing (of 44) | help | example targets |
| --- | --- | --- | --- | --- |
| color-contrast | serious | 40 | Elements must meet minimum color contrast ratio thresholds | .pathbar-actions > .primary.sm.btn; .next > .pathstep-body > a |
| heading-order | moderate | 20 | Heading levels should only increase by one | header[data-href="#/paths/first-tiny-game/s1"] > div > h3 |
| link-in-text-block | serious | 2 | Links must be distinguishable without relying on color | a[href$="#/ai/philosophy"] |
| page-has-heading-one | moderate | 2 | Page should contain a level-one heading | html |

## html-validate

| rule | count | routes | examples |
| --- | --- | --- | --- |
| no-implicit-button-type | 2938 | 22 | <button> is missing recommended "type" attribute @ #skipBtn; <button> is missing recommended "type" attribute @ #skipMapBtn; <button> is missing recommended "type" attribute @ #brandBtn |
| no-implicit-input-type | 70 | 22 | <input> is missing recommended "type" attribute @ #railSearch; <input> is missing recommended "type" attribute @ #searchInput; <input> is missing recommended "type" attribute @ #railSearch |
| element-permitted-content | 37 | 1 | <div> element is not permitted as content under <span> @ #pane > div:nth-child(3) > div > div > div:nth-child(7) > section:nth-child(1) > div > div > label:nth-child(1) > span:nth-child(3) > div:nth-c |
| prefer-native-element | 29 | 22 | Prefer to use the native <select> element @ #searchResults; Prefer to use the native <select> element @ #searchResults; Prefer to use the native <select> element @ #searchResults |
| doctype-style | 22 | 22 | DOCTYPE should be uppercase @ ; DOCTYPE should be uppercase @ ; DOCTYPE should be uppercase @  |
| multiple-labeled-controls | 8 | 1 | <label> is associated with multiple controls @ #pane > div:nth-child(3) > div > div > div:nth-child(7) > section:nth-child(1) > div > div > label:nth-child(1); <label> is associated with multiple cont |
| unique-landmark | 7 | 7 | Landmarks must have a non-empty and unique accessible name (aria-label or aria-labelledby) @ #rail; Landmarks must have a non-empty and unique accessible name (aria-label or aria-labelledby) @ #rail;  |

## Contrast pairs below 4.5:1 (axe, both themes)

| theme | foreground on background | ratio | where |
| --- | --- | --- | --- |
| light | #1d1b17 on #a3560a | 3.18:1 | .pathbar-actions primary button (path bar, every page with an active path) |
| light | #0f766e on #ebe4d6 | 4.32:1 | practice chips (.prac.chip) on topic pages |
| light | #a3560a on #f3e9dd | 4.49:1 | next-step link in a path stage (.next .pathstep-body a) |
| dark | #8c877e on #2a251e | 4.25:1 | muted text in the next-step row |
| dark | link-in-text-block 1.43:1 vs body text | — | guide hint link on #/paths (colour-only link) |

check-contrast.js passes because it checks token pairs on the page background, not these composited surfaces (tinted next-step row, chip tint, button fill). P3 extends it to them.

## After (2026-10-05, end of the programme)

Measured on the built page from file://, Edge, at 1440 and 375 px, with axe-core run on the
reading pane after transitions settle (1.2 s) and html-validate (recommended rules, the same
exclusions as the baseline) on the pane's markup at 1440:

| State | axe violations | html-validate messages |
| --- | --- | --- |
| `#/paths` (the door) | 0 | 0 |
| `#/paths/performance-engineer` (stage map) | 0 | 0 |
| `#/paths/performance-engineer/s1`, checkpoint question | 0 | 0 |
| `#/paths/performance-engineer/s1`, outline revealed with ideas to tick | 0 | 0 |
| `#/paths/systems-designer`, plain list | 0 | 0 |
| `#/paths/systems-designer`, adventure look | 0 | 0 |

The path-page heading order and the step-row markup (a list of rows; the checkbox's label
holds no links or glossary buttons) that the baseline left for P9 are fixed. Taken mid-transition,
axe reported three contrast hits on colours that are in no token; after the transitions settle it
reports none. The final review's own probe of ten new routes (no duplicate ids, untyped buttons,
heading skips, images without alt, or page widening) agreed. Contrast pairs below 4.5:1 in the
build's token check: 0 of 682. The audit script lives outside the repo (session scratchpad); this
table is its output.
