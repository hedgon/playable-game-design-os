---
status: active
updated: 2026-09-24
---

# Expansion plan: visuals, platforms, learning paths

Owner request (2026-09-24): more reference images for games, systems and
flowcharts; how to develop for and publish on Steam, Switch, Google Play,
App Store, PlayStation, Xbox and others; learning paths that are more
intuitive. Research first, plan, audit the plan, then build.

Research behind this plan (session scratchpad, summarised here where it
matters): a visuals inventory with licensing research, a platform lifecycle
survey read from official developer pages on 2026-09-24, and a Playwright
walk-through of the learning paths at 1440 and 375 px.

The work lands in four review passes, each reviewed and tested on its own
before the next starts: **A** visuals, **B1** platform code, **B2** platform
content (fact-checked), **C** learning paths. B reuses A's renderers for its
flowcharts and comparison tables, and C links the platform material into a
path. Section 8 records the plan audit and how each finding changed the plan.

## 1. Mục tiêu / Scope

**A. Visuals.** A picture wherever a topic describes something visual.

Acceptance:
1. A data-driven diagram module draws seven kinds: loop, layered stack,
   curve or beat chart, comparison matrix or 2×2, sources-and-sinks economy,
   state machine, and annotated screen layout. Flowcharts reuse the existing
   `88-flow.js`.
2. At least 24 topics carry a diagram (4 do today), chosen from the ranked
   list in section 2. Each of the 15 reference games gets a loop schematic,
   and six of them an annotated screen layout (what the HUD shows and
   where), linked from the UX topics they illustrate.
3. Every diagram has `role="img"`, a one-sentence accessible name, and a
   "diagram as text" list generated from the same data. Colour never carries
   meaning alone.
4. Every diagram fits a 375 px screen without sideways scrolling and passes
   the layout check (no overlapping boxes, no clipped labels) and the
   contrast check (4.5:1, both themes).
5. The content-or-mechanic decision tree shows the whole tree, not one
   question at a time.
6. An image policy is written on the sources page, and the 11 existing store
   images carry a credit and a link to the official store page.

Out of scope: raster screenshots of games, generated images, an executable
(simulated) economy like Machinations, hand-drawn spatial schematics
(spatial composition, navigation) for now.

**B. Platforms.** From first build to live store page and patches, per
platform.

Acceptance:
1. A new domain, **Platforms and publishing**, in the Engineering & Career
   lens, with 7 topics that each pass strict validation (eight parts,
   techniques, 6 to 10 interview questions, dated facts where rules change).
   Godot and Unity views only on the three topics with real engine work
   (platform choice, platform requirements, release and updates); the other
   four are process topics and carry none, like project management today.
2. Platform guides for Steam, Nintendo Switch, PlayStation, Xbox and
   Microsoft Store, Google Play and the Apple App Store, and one page for
   other channels (Epic Games Store, itch.io, web portals, Meta Quest). Steam
   Deck is covered in the Steam guide, Mac in the Steam and Apple guides.
   Each guide walks the same six stages: access, build, requirements and
   certification, ratings and legal, store presence, release and after.
3. Every changeable claim is a dated fact with its source. Claims known only
   from press say so in the text. Anything under NDA is described only by
   its public outline, never guessed.
4. Each guide shows a zero-to-live flowchart; the domain shows a comparison
   matrix of the platforms (access, cost, review gate, typical turnaround).
5. A pre-submission checklist per store family (PC stores, consoles, mobile).

6. UGC platforms (owner request, 2026-09-24): a detailed Roblox guide and a
   Fortnite (UEFN) guide, each with seven sections: access, architecture,
   the built-in tools and language (Roblox Studio and Luau, UEFN and Verse),
   rules and moderation, monetization, publishing and updates, marketing and
   discovery. An architecture diagram for Roblox (client, remotes, server,
   data services) and a topic on designing for UGC platforms.

Console guides will be thinner than PC and mobile ones: Sony's and
Nintendo's requirements, certification and store terms are under NDA, so
those sections give the public outline and say what the partner portal
covers after signing.

Out of scope: legal or tax advice; NDA content; per-country tax detail.

**C. Learning paths.** One visible next step, as the paths page promises.

Acceptance:
1. "Mark done and continue" never marks a stage done without showing its
   checkpoint.
2. Ticking a step keeps the reader's place; the next unticked step is
   brought into view.
3. The path list answers "which path is for me" without opening a path:
   each card says who it is for and what comes before it, and a
   three-question chooser recommends a path.
4. An open path shows one structure view instead of three: the stage view
   in the content pane is primary, the map stays as the visual overview, and
   the duplicate step outline in the left rail goes. What remains on an open
   path: the path bar, the map, one progress line and the stage view (four,
   counted by selector in the E2E test; ten today).
5. A stage done or skipped by mistake can be undone.
6. Checkpoint recall questions have short answer outlines, shown after the
   reader answers, and can go into the Review queue.
7. Prerequisites and "next" links are consistent across all 12 paths (a
   prerequisite's own `next` points forward), checked by the validator; the
   backend and netcode gaps found in research are fixed.
8. A new path, "Ship a game on PC, console and mobile", uses the Part B
   material.

Out of scope: gamification (streaks, badges, hard gates). The "no streaks, no
badges, soft checkpoints" position stays.

## 2. Bối cảnh / Survey hiện trạng

**Visuals today.** 4 of 138 topics show a diagram, from three hand-written
SVG strings in `90-app.js` (`DIAGRAM_HIERARCHY`, `DIAGRAM_FEEDBACK`,
`DIAGRAM_DISSECTION`, mapped by `DIAGRAMS` and `DOMAIN_DIAGRAMS`).
`88-flow.js` is a generic, phone-safe, accessible renderer for directed
acyclic graphs, checked by `check-layout.js`, but it is only used for 9
project workflows, and it cannot draw a cycle. Data that is already
diagram-shaped renders as buttons or text: `LOOP_PARTS` (the core loop),
`CONTENT_TREE` (a decision tree shown one question at a time),
`UNFAIR_CAUSES`, `LADDER_EXAMPLE`. Four of the 15 reference games have no
art and show a plain tile.

Ranked diagram targets (research, condensed; kind in brackets): core-loop
[loop], economy-and-resources [economy], level-structure [beat chart], pacing
[curve], content-multiplies [flow], feature-vs-experience [stack],
choosing-ai-technique [matrix], depth-vs-complexity [2×2], ai-loop [loop],
responsibility-matrix [matrix], difficulty [curve], risk-reward [2×2],
perception-and-awareness [state], adaptive-and-director-ai [loop],
server-authority [matrix], backend-layering [stack], backend-caching-redis
[stack], server-realtime-protocol [stack], infra-ci-pipelines [flow],
infra-deploy-models [matrix], server-scaling [2×2], encounter-design [beat
chart], mastery-discovery-expression [matrix], pm-risk [2×2],
server-matchmaking [state], business-model [economy].

**Images and copyright.** Commercial store art, screenshots and logos are
copyrighted. Publisher policies differ, and some are stricter than fair use
(one requires asking first, one forbids implying official status).
Wikimedia Commons does not host non-free game art. Original schematics of a
game's loop or screen layout are our own work and teach the mechanism
directly. Recommended policy: no new hosted game art unless a publisher's
current press-kit terms are checked and recorded per game; credit and link
any store art already used; prefer original schematics; disclose any
generated image visibly.

**Platforms today.** Scattered mentions only: `platform-and-session`
(product), certification risk in project management, release trains, the
build-and-release path. No material on access, dev kits, certification,
ratings, store pages or release mechanics.

Platform facts that shape the design (official pages read 2026-09-24):
- Steam: $100 recoupable app fee, 30-day wait, store page and build review
  3 to 5 business days each, two weeks "Coming Soon", manual release button.
- Nintendo: free portal registration open to individuals, NDA, a separate
  Switch application, review before release; Switch 2 portal access is
  currently closed to requests. SDK, requirements and turnaround under NDA.
- PlayStation: PlayStation Partners for registered companies or
  institutions; SDK, TRC and certification under NDA.
- Xbox: ID@Xbox with NDA; the Xbox Requirements (XRs) are public, including
  mandatory achievements; certification turnaround published (4 business
  days for a base game, 2 for an update).
- Google Play: $25 one-time fee; new personal accounts need 12 testers for 14
  days; target API level deadline; Data safety form; fee model changing by
  region through 2027.
- Apple: $99 a year; App Review 90% under 24 hours; own age-rating
  questionnaire; privacy labels; 15% Small Business Program.
- Ratings: IARC covers most digital stores; Steam and Apple use their own
  questionnaires; Japan (CERO) and physical releases need direct ratings.
- Engines: console export for Unity and Unreal requires proving platform
  approval to the engine vendor; Godot has no official console export and
  points to middleware and porting houses.
- Console revenue shares are not public.

**Learning paths today.** The data is sound (clear stage goals, interleaved
steps, review chips). The problems are in the UI and in cross-path links:
- An open path shows ten progress or position indicators at once (path bar,
  a global topics counter, two breadcrumbs, a stage progress bar, a "Next"
  callout, a text outline, a node map, a stage accordion, step checkboxes).
- The path bar's "Mark done and continue" marks a stage done without ever
  showing its checkpoint (`ACTIONS['path-continue']`).
- Ticking a step scrolls the page to the top (`setView` always scrolls).
- Path cards show level, hours, title and tag only. The quick-pick grid
  shows run-on paragraphs for the six engineering paths, because it splits
  `outcome` at the first full stop and theirs has none early.
- The path map opens mostly blank until "fit" is pressed.
- A stage skip cannot be undone short of resetting all data.
- The Review queue exists but checkpoints do not feed it, and checkpoint
  recall questions are plain strings with no answer to compare against.
- Prerequisites are inconsistent across paths (the engineering interview
  path lists prerequisites whose `next` never points to it and quizzes a
  topic taught by a path it does not list; two backend-facing paths lack a
  design prerequisite; the backend path teaches its testing discipline
  last).

## 3. Design

### A. Diagram module

- **New file `src/87-diagrams.js`**, a pure renderer in the style of
  `88-flow.js`: `window.PlayableDiagram` with `layout(spec)` returning boxes
  for the checker and `render(spec, color)` returning SVG. No DOM, no
  randomness, same output for the same data.
- **Kinds and data shapes:**
  - `loop`: `{kind:'loop', title, steps:[{t, d}]}`, 3 to 7 steps on a ring.
  - `stack`: `{kind:'stack', title, layers:[{t, d}], dir:'down'|'in'}`
    (ladder, onion, tiers, byte layout).
  - `curve`: `{kind:'curve', title, x, y, series:[{t, pts:[[x,y]]}],
    band?, beats?:[{at, t}]}` (pacing, difficulty, beat charts).
  - `matrix`: `{kind:'matrix', title, rows, cols, cells}` or
    `{kind:'quad', title, x, y, points:[{t, x, y}]}`.
  - `economy`: `{kind:'economy', title, nodes:[{id, t, type:'source'|
    'pool'|'converter'|'sink'}], edges:[[from, to, label]]}`.
  - `state`: `{kind:'state', title, states:[{id, t}], edges:[[from, to,
    label]], start}`.
  - `screen`: `{kind:'screen', title, aspect:'16:9', regions:[{t, d, x, y,
    w, h}]}` in normalised coordinates: an original annotated layout of a
    game's screen, drawn as labelled boxes, never a screenshot.
  - `flow`: `{kind:'flow', ...}` handed to `PlayableFlow` unchanged.
- **Data:** `DIAGRAM('topic-id', spec)` in `10-schema.js`, called beside the
  topic in its domain file, stored as `t.diagram`. Reference games carry
  `loop` (all 15) and `screen` (six) specs in `14-references.js`.
- **Rendering:** a diagram card at the top of the topic Overview (where the
  three existing ones sit), with a `<details>` "Diagram as text" list under
  it. Hand-written diagrams keep working through `DIAGRAMS`; a topic cannot
  carry both (validator check).
- **Wiring:** `manifest.js` gets a named `DIAGRAM` export loaded ahead of
  `FLOW`; `check-layout.js` adds it to the sandbox it builds from
  `[...DATA, FLOW, GRAPH]`, otherwise `window.PlayableDiagram` does not exist
  when the checker runs; `build.js` adds it to the per-file syntax check;
  `jsconfig.json` needs no change.
- **Checks:** `validate.js` checks each spec's shape and label lengths.
  `layout-core.js` lays out every diagram at phone width and reuses the
  overlap and label-fit tests. `check-contrast.js` adds the diagram label
  and card-fill pairs from their CSS rules. The smoke test visits one topic
  per kind.
- **Content-or-mechanic tree:** `CONTENT_TREE` stores next-indexes and
  verdict strings, so a small adapter builds `{steps, edges}` for it (four
  questions plus four verdict steps). The Diagnose view draws the whole tree
  with `PlayableFlow` beside the question buttons, and marks the steps on
  the reader's answers through their existing `data-step` attributes with
  CSS. Edges are not highlighted, so `88-flow.js`, shared with the nine
  project workflows, does not change.
- **Images:** a "Game art and images" entry on the sources page with the
  policy; each existing store image gets a caption crediting the developer
  and linking the store page.

### B. Platforms

- **Engine views become a domain setting.** `DOMAINS.push` gains
  `eng:'required'|'optional'|'none'` (default `required`). Management and
  leadership move from the validator's hard-coded name check to `'none'`;
  platforms is `'optional'` (a topic may carry views, and if it does they are
  checked in full).
- **Domain file `src/39-topics-platforms.js`** (lens `eng`, new colour token
  `--d-platforms` in both theme blocks), seven topics:
  1. `platform-choice`: which platforms first; reach, cost, gate and effort;
     porting partners; one codebase, several builds; where Steam Deck, Mac,
     web and VR fit.
  2. `platform-access`: developer programmes, NDAs, dev kits, entity
     requirements, engine console access (including Godot middleware).
  3. `platform-requirements`: platform features and technical requirements
     (achievements and trophies, saves, suspend and resume, controllers,
     accessibility, SDK and API minimums); what is public (Xbox XRs, store
     policies) and what is NDA.
  4. `certification-and-review`: every gate and how long it takes, common
     rejection causes, planning review windows, resubmission.
  5. `ratings-and-disclosures`: IARC and direct boards, store
     questionnaires, privacy labels and Data safety, odds disclosure; links
     to `ethics-and-responsibility`.
  6. `store-presence`: store page assets, Coming Soon and wishlists,
     pre-orders, pricing and regional pricing, revenue share, payouts and tax
     interviews.
  7. `release-and-updates`: release mechanics, staged and phased rollouts,
     update certification, demos, playtests, Early Access, Game Preview,
     TestFlight.

  Engine views on 1, 3 and 7 only: export presets and build profiles per
  platform; suspend and resume, save data and platform service plugins;
  version and build numbers that stores require to increase.
- **Platform guides:** `src/15-platforms.js` holds a `PLATFORMS` registry:
  `{id, t, kind:'pc'|'console'|'mobile'|'open', stages:{access, build, cert,
  ratings, store, release}}`, each stage a short list of points plus dated
  facts `{claim, asOf, src}` under the existing fact rules (parsed https
  source, stale warning after a year). A `flow` spec per platform draws its
  zero-to-live chart. Routes `#/platforms` (comparison matrix and cards) and
  `#/platforms/<id>`; a "Platforms" view in the Make group; the domain page
  links the guides; search indexes them.
- **Checklists:** three entries in `CHECKLISTS`: PC store submission,
  console submission, mobile store submission.
- **Content production:** topics written to the same bar as the existing
  domains; every fact taken from the research's official-page entries,
  press-only items worded as reported, NDA items as outlines. Meta Quest
  (Horizon Store) and the itch.io creator documentation still need a
  research pass from official pages before they are written. A separate
  reviewer fact-checks the content before it is committed.

### C. Learning paths

- **Checkpoint first:** `ACTIONS['path-continue']` on a checkpoint result
  navigates to the stage with its checkpoint open and focused; marking done
  stays a deliberate click inside it.
- **Keep the place:** `setView` gets an option to preserve scroll; step
  toggles use it and scroll the next unticked step into view.
- **Choosing:** path cards add "For" (first clause of `audience`) and
  "After" (prerequisite titles). A short `pick` field (under 60 characters)
  replaces the sentence-splitting of `outcome` in the quick-pick grid. A
  chooser at the top of `#/paths` asks three questions (what you want to do,
  your level, time available) and highlights one path with the reason.
- **One structure view:** the stage view in the content pane is primary:
  current stage expanded with its next step first, other stages one line
  each (click to open), no separate "Next" callout and no second breadcrumb.
  The map stays as the visual overview, opens framed to the current stage,
  and a click on a step node opens that step in the stage view. The left
  rail's step outline is removed on path routes; the rail shows the path list
  and a way back to all paths. The global topics counter reads "Topics read
  N/138" so it is not taken for path progress. The E2E test counts exactly
  these on an open path: the path bar, the map's path nodes, the single
  progress line and the stage view (selectors fixed in the test).
- **Undo:** a stage marked done or skipped shows "Undo" in its header; the
  toast after skip or done also offers it.
- **Recall answers and Review:** `check.recall` accepts `{q, a}` as well as
  a plain string; every existing question gets a short answer outline (about
  170 across 57 stages, written from the stage's own topics and checked by a
  reviewer). The checkpoint shows the answer after a "Show answer" click, and
  each question gets the same "Review later" button as interview questions
  (keyed by path, stage and question text). The Review page stays "answer
  first, then compare".
- **Consistency:** the validator requires that every path listed in a
  `prereq` lists this path in its `next`, or the pair is exempted with a
  reason. All 12 paths are reviewed in one pass: the engineering interview
  path's prerequisites (add netcode, drop what it never exercises), design
  prerequisites for the two backend-facing paths, and the backend path's
  idioms-and-testing stage moved earlier.
- **New path:** `ship-it` ("Ship a game on PC, console and mobile"),
  production track, 4 to 5 stages, using the platform topics, guides,
  checklists and the build-and-release topics. A new step kind `platform`
  (references a `PLATFORMS` id) is added to the validator (including the
  `runDomain = null` reset other non-topic kinds use), inventory,
  `stepTitle` and `stepHref`.

## 4. Commit breakdown

A. Visuals
1. Diagram module with the loop, stack and matrix kinds; `DIAGRAM` schema,
   manifest and checker wiring, validation, layout and contrast checks, text
   alternative.
2. Curve, economy, state and screen kinds with their checks.
3. Diagrams for the 24 or more topics (data only, grouped by domain).
4. Loop schematics for the 15 reference games and six screen layouts; image
   credits and the policy entry.
5. The whole content-or-mechanic tree (adapter and CSS marking only).

B1. Platform code (reviewed as code)
6. Engine views as a domain setting (`eng` field; management and leadership
   migrated; no content change).
7. `PLATFORMS` registry, routes, views, comparison matrix, flows, search,
   validation, with one stub guide to exercise it.

B2. Platform content (fact-checked before commit)
8. Research pass for Meta Quest and itch.io from official pages.
9. Platform guides for the six platforms and the other channels.
10. Platforms domain and its seven topics, three checklists.
10b. UGC guides: a `ugc` kind with its own seven sections, the Roblox and
    UEFN guides from an official-source research pass, the architecture
    diagram, and a ugc-platforms topic; fact-checked like the rest of B2.

C. Paths
11. Checkpoint-first continue, scroll preservation, undo.
12. Path cards, `pick` fields, chooser.
13. One structure view, map framing, counter label.
14. Recall answer outlines (content, reviewed) and "Review later" on them.
15. Prerequisite consistency check and the fixes across all 12 paths.
16. The `ship-it` path and the `platform` step kind.

Each pass ends with docs (README, CONTRIBUTING schema for `DIAGRAM`,
`PLATFORMS` and the `eng` setting, design docs), an independent review, the
full test, and a push only with the owner's go-ahead.

## 5. Seed data the planner must provide

None from the owner. All content is authored from the research notes; the
only owner decisions are in section 7.

## 6. E2E test plan

- (a) Each diagram kind on a topic at 375 and 1440 px, both themes: no
  sideways scroll, no overlapping boxes (layout check), labels inside boxes
  (measured), accessible name present, text alternative lists every node.
- (b) Contrast check passes with the new diagram pairs; a negative test with
  a low-contrast fill fails it.
- (c) Validator rejects a malformed spec of each kind, a topic with both a
  hand-written and a data diagram, and a `none` domain topic with engine
  views (negative tests).
- (d) `#/platforms` and each `#/platforms/<id>` render at three widths with
  no console errors; every fact source parses; the comparison matrix fits a
  phone.
- (e) Platform topics pass strict validation; the Engineering & Career map
  with six domains passes the layout check in desktop and phone layouts.
- (f) Paths: "Mark done and continue" on a checkpoint shows the checkpoint
  and does not mark the stage done; ticking a step keeps scroll position and
  reveals the next step; undo restores a skipped stage; exactly the four
  named indicators exist on an open path.
- (g) The chooser recommends a path for every answer combination (all
  combinations enumerated in a test).
- (h) A checkpoint question added to Review shows its answer outline and
  appears under "Coming up", and is removable.
- (i) Full sweep of every route at 375, 1024 and 1440 px: no console errors,
  no broken link targets; smoke test extended with the new route kinds; type
  check; CI green.

## 7. Open questions / decisions

Decided by the owner on 2026-09-24: 1 keep with credit and link; 5 write the
answer outlines; 2 Platforms under Make; 8 commit and push after each pass once
it is reviewed and fully tested. The rest follow the recommendations.

1. **Existing store art (11 images).** Recommended: keep, with credit and a
   store link, and add original schematics for all 15 games. Alternative:
   remove them and rely on schematics only (no copyright exposure, less
   recognisable).
2. **Where platform guides live in navigation.** Recommended: a "Platforms"
   view in the Make group plus links from the new domain. Alternative: a
   seventh navigation group, "Ship".
3. **Console revenue shares.** Not public. Recommended: say so, and give the
   commonly reported figure only as "reported". Alternative: omit.
4. **Paths layout change (commit 13)** changes how every open path looks.
   Recommended as designed; the other path fixes do not depend on it and can
   land alone.
5. **Recall answer outlines (commit 14)** are about 170 short answers to
   write and review. Recommended: write them (feedback right after recall is
   what makes retrieval practice work). Alternative: defer, and ship
   checkpoints without Review.
6. **Checkpoints stay self-certified** (no required answer before "Mark stage
   done"), consistent with soft checkpoints. Research flags requiring one real
   answer as an option; recommended: keep soft.
7. **Thinner console guides** because of NDAs. Recommended: accept, and say so
   on each console guide.
8. **Commits and pushes.** Work lands as local commits per pass; each pass is
   pushed only with the owner's go-ahead.

## 8. Plan audit (2026-09-24)

Two independent reviewers audited the draft: one against the code (technical
feasibility), one against the owner's request and the research (content, UX,
scope). Findings and what changed:

| Finding | Change |
| --- | --- |
| Checkpoint recall is plain text, but Review needs an answer outline to compare against | Recall gains optional `{q, a}` outlines, written and reviewed (commit 14, question 5) |
| Highlighting the tree's active branch would need edge attributes in `88-flow.js`, a renderer shared with nine workflows | Mark steps only, through the existing `data-step` attributes; the renderer does not change |
| The validator requires Godot and Unity views outside management and leadership, forcing contrived views on process topics | Engine views become a domain setting; platforms is optional, with views on 3 of 7 topics |
| A new renderer must be named in the manifest and in the layout checker's sandbox | Wiring spelled out under Design A |
| "Ten indicators to at most four" was not measurable | The four that remain are named and counted by selector in the E2E test |
| One review pass is too much for three kinds of work | Four passes: A, B1 code, B2 content, C |
| "One view" kept three renderings of the same tree | The rail's step outline goes; the stage view is primary, the map is the overview |
| Prerequisite fixes scoped to one path | All 12 paths in one pass, including the backend and netcode gaps |
| "Reference images for games" answered only with abstract loops | Annotated screen-layout kind added, six games |
| No VR; Steam Deck and Mac not placed | Meta Quest on the other-channels page after a research pass; Steam Deck and Mac inside the Steam and Apple guides |
| Console guides will be thinner under NDA, not flagged | Stated in scope and as question 7 |
| Self-certified versus answered checkpoints dropped silently | Question 6 |
| The `platform` step kind misses the `runDomain` reset | Added to Design C |
