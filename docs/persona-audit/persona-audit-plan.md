---
status: active
updated: 2026-10-01
---

# Persona audit: a senior designer, a senior developer and a newcomer

## Goal

On 2026-09-30 the owner asked for three independent audits of the whole site by people who know nothing about it: a senior game designer, a senior software engineer and an ordinary player who would like to make a game one day. Each reported what is good, bad, useful, useless, worth expanding and worth cutting. The coordinator checks every finding against the code, the site and outside sources, rules on it, and has the accepted ones fixed, one phase per commit.

Reports: [findings-designer.md](findings-designer.md), [findings-developer.md](findings-developer.md), [findings-learner.md](findings-learner.md).

**Rules:**
- The audits are read-only and blind to earlier plans.
- Opus orchestrates; Sonnet 5.5 workers at low effort implement (owner switch 2026-10-01, after the first max-effort audit run was cut off). The audits ran on Opus 5.5 at medium effort.
- Every phase is replayed through CI in a clean worktree before it is pushed. No AI attribution.
- No cap cuts content; the coverage rule (every topic, game, engine, platform guide and checklist in a path) stays.

## Rulings

Where the three reports agree, or the coordinator could reproduce a finding, it is accepted. Checked against the code and outside sources:

- **Saved data can blank the app** (developer): confirmed at `90-app.js:29`, where `new Set(store.get('seen', []))` throws on a number before any handler exists. Accepted, high.
- **"See it in games" on smells is noise** (designer): confirmed in `smellGames()`, which accepts any game whose lenses list any one cause topic. The owner rule is that these links are derived, never hand-written, so the fix tightens the derivation instead of hand-picking.
- **The core loop puts the decision after the feedback and the consequence after the decision** (designer): accepted. Dan Cook's skill atom (action, simulation, feedback, model update) and the topic's own Bejeweled example both put the consequence straight after the action, with the decision before the next one.
- **Web basics** (developer): no route titles, silent fallback on bad deep links, no scroll restoration, an unlabelled search with non-focusable results, glyph-named icon buttons, heading jumps. Accepted; these are WCAG 2.4.2, 4.1.2 and 1.3.1 issues.
- **A newcomer is not told what the site is, meets jargon with no glossary, and is asked to design for a project they do not have** (learner, echoed by the designer on the first screen). Accepted.
- **Path padding and time estimates** (designer): the Ren'Py step and the Go backend part inside a 30-day design prototype path, and "about 7 weeks" beside "30 days". Accepted as relocations and wording; the coverage rule stays, the misplaced steps move to paths they serve.
- **Should we build this? gives an unexplained verdict that punishes pre-production** (designer): accepted.
- **Missing design craft topics** (designer, learner's "boss" search): combat design and level blockout are added.
- **Snippet defects** (developer): the Unity rollback guard that drops early inputs, the Godot `.bak` rename that ignores its result, and a `.gitignore` in a C# tab. Accepted.
- **Phone defects** (learner, developer): the library drawer that opens invisibly, the tool list above the tool, the collapsed path bar without its button, the Map pill over text. Accepted after reproduction.

Set aside, with the reason:
- **Boot cost of the single 8.45 MB file** (14.5 s on slow 4G with 4× CPU): a real cost, but splitting the data into fetched files breaks the owner's "one file, works offline" principle. Only a static loading message is added now; lazy data is a separate decision for the owner.
- **The path map taking the middle column**: the map audit of 2026-09-30 kept the path map visible on purpose; reversing it a day later needs the owner.
- **Hedges ("arguably", 473 times) and comma-carried asides**: a style pass over about 3 MB of prose is its own project; noted as a follow-up.
- **Go code for backend topics, compiled snippet gates, runnable exercises, app-code type checking, pinned Playwright**: large engineering expansions or dependency decisions; follow-ups.
- **Fewer AI sections and engine tabs for beginners; fewer header sections; branding words**: the AI sections are the product's stated purpose and the engine tabs are opt-in; not changed.
- **Fun diagnostic dimensions, chip density, Celeste business lens subject**: taste, low impact; not changed.

## Checklist

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| P0 | Three audits, rulings, plan | done | this file |
| A1 | Saved data cannot blank the app: typed reads, shape-checked import, a render error panel with a reset; route titles; not-found states; scroll restored on Back | todo | 90-app.js |
| C1 | Paths: move padding steps to paths they serve, honest times, chooser wording, a practice game for newcomers | todo | 50-paths.js, 51-paths-engineering.js |
| C2 | Glossary data: plain definitions of the terms a newcomer meets | todo | new data file |
| C3 | Snippet fixes: rollback early inputs, Godot backup rename, the .gitignore tab | todo | topic files |
| A2 | Search: label, listbox semantics, result count, title matches first, synonyms; glossary page; smells derive games strictly; Should we build this? explains itself | todo | 90-app.js, 05-registry.js |
| C4 | Core loop order fixed; new topics: combat design (including bosses) and level blockout and metrics, with path steps | todo | 22, 25, 50 |
| A3 | First screen says what the site is; progress tools only once there is progress; phone drawer, tool order, path bar button, Map pill; icon button names; heading order; loading message; Projects intro; Idea Lab chip legend; per-step notes on paths | todo | 01-head.html, 90-app.js, 91-map.js |
| V1 | README counts, e2e in CI, full checks, browser verification at 1440 and 375, archive | todo | |
