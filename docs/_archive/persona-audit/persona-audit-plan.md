---
status: shipped
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
| A1 | Saved data cannot blank the app: typed reads, shape-checked import, a render error panel with a reset; route titles; not-found states; scroll restored on Back | done | typed reads, render error panel, JSON-checked import, route titles, not-found for every detail id, scroll restored on Back; smoke 260/0, e2e 100/100 |
| C1 | Paths: move padding steps to paths they serve, honest times, chooser wording, a practice game for newcomers | done | Go red-first part and the Ren'Py step replaced in the 30-day path, Ren'Py moved to worlds and stories; 37 game steps now read one lens, 6 raised; practice game in both beginner design paths; a GameMaker-or-engine choice still counts twice (alt covers Godot and Unity only) |
| C2 | Glossary data: plain definitions of the terms a newcomer meets | done | 71 terms in 06-glossary.js, validated |
| C3 | Snippet fixes: rollback early inputs, Godot backup rename, the .gitignore tab | done | Unity rollback keeps early inputs; Godot backup rename checked; real editor scripts in both source-control tabs |
| A2 | Search: label, listbox semantics, result count, title matches first, synonyms; glossary page; smells derive games strictly; Should we build this? explains itself | done | search is a labelled combobox with options and a live count, title matches rank first, synonyms (gdd, balance, ftue, juice, flow); #/glossary with 71 terms, also searchable; smell games weighted by topic rarity (floaty combat no longer lists Bejeweled or Among Us; still imperfect, since lenses tag topics broadly); feature verdict lists every answer's points and what drove it, predicted-but-unseen scores 0; chooser weeks name the hours; Projects intro line |
| C4 | Core loop order fixed; new topics: combat design (including bosses) and level blockout and metrics, with path steps | done | loop is Decision → Action → Consequence → Feedback → New situation in the topic, diagram, diagnostic, paths and glossary; combat-design and level-blockout-and-metrics added with engine views, interviews and diagrams, in the systems and level and UX paths; combat games' gameplay lenses link combat-design; the Game Loop Builder tool keeps its own Action-Decision-Feedback-Reward frame (follow-up) |
| A3 | First screen says what the site is; progress tools only once there is progress; phone drawer, tool order, path bar button, Map pill; icon button names; heading order; loading message; Projects intro; Idea Lab chip legend; per-step notes on paths | done | lead line on the first screen; progress tools only once there is progress; phone library drawer fixed (the pane sat above the rail), tool before the tool list, Next on the collapsed path bar, sticky strip under the Map pill; icon buttons named; game pages h1-h2-h3; loading message; Idea Lab evidence legend; saved notes on every path step |
| V1 | README counts, e2e in CI, full checks, browser verification at 1440 and 375, archive | todo | |

## Outcome

Every accepted finding is fixed. Two topics, a glossary of 71 terms and saved step notes were added; nothing was cut. Verified with the build checks, the type check, the smoke and paths tests, a CI replay in a clean worktree before each push, and a browser pass at 1440 and 375 px.

Not exercised: the render error panel (the typed reads now stop every crash the developer audit found, so no saved value could trigger it).

## Follow-ups for the owner

- Boot cost of the single file (lazy data would break offline use).
- The path map column on desktop.
- A style pass on hedges ("arguably") and comma-carried asides.
- Smell game links still lean on broad lens topics (floaty combat lists Age of Empires II); a stricter rule or lens retagging would fix it.
- The Game Loop Builder tool keeps its own Action, Decision, Feedback, Reward frame, unlike the topic's new order.
- In the 30-day path, the GameMaker-or-engine choice still counts its minutes twice (alt covers Godot and Unity only).
- Go code for backend topics, compiled snippet gates, app-code type checks, pinned Playwright.
- A fact-check of the two new topics' claims about named games and the Valve dimensions guidance.
