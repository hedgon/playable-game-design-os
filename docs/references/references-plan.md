---
status: active
updated: 2026-09-24
---

# Reference library plan: polish, findability, deeper and wider games

Owner request (2026-09-24, with three screenshots): some UI looks unpolished;
four reference games have no image, so find other sources; pages such as
Reference games are hard to find even with search, so improve search and the
index and stop navigation feeling like a maze; each reference game needs more
images of the actual game and a deeper analysis (UI, art direction, sound
direction, lore, world building, environmental storytelling, gameplay,
monetization, etc.); add Japanese RPGs with unusual ideas (Valkyria
Chronicles: real-time action inside turn-based tactics) and innovative games
(Return of the Obra Dinn, Viewfinder, The Witness and similar), integrated into
the existing system, map and paths.

## 1. Mục tiêu / Scope

Passes, each reviewed, tested, then committed. P3 is split so no pass is too
big to review, and so every topic a lens links exists before the lens.

**P1. Polish and wayfinding.**
1. Game chips on a topic ("See it in a real game") become the footer of the
   diagram card, for both data diagrams and hand-drawn ones, inside the
   card's padding.
2. Screen schematics read as a layout: every region carries a number badge
   and a small glyph of what it holds (health, currency, map, text, world);
   world and HUD regions are drawn differently; a numbered legend under the
   frame gives each region's label and description (today the description
   never reaches the drawing). One redone schematic is shown to the owner
   before the other five are converted.
3. The current section's sub-tabs show on every page, not only on landing
   views, so a collection is always one click away.
4. Header navigation (decision 3): a Library group gathers Reference games,
   Platforms, Checklists, Prompts and Sources, so "where are the games?" has
   an obvious answer.
5. Unknown routes land on the All pages index (P2) instead of the map.
6. Reference cards never show a bare text tile (decision 1): Minecraft gets a
   screenshot under Mojang's usage guidelines; Animal Crossing, Wordle and
   Tetris get an original drawn tile (a drawing of ours, stated as such, not
   presented as official art).
7. Screenshot sweep of about 25 page types, both themes, at 375, 1024 and
   1440 px, in headless Playwright. Acceptance: a written, human-reviewed
   issue list, each item fixed or deferred with a reason, and no new
   smoke or layout-check failures. The sweep repeats after every pass.
8. Wayfinding test: from five deep pages (a topic, a platform guide, a path
   stage, a project part, a checklist), Reference games is reachable in one
   click without search.

**P2. Findability.**
1. A `PAGES` registry: every section and view with its route, section,
   one-line purpose and synonyms ("game library", "examples", "stores",
   "publishing", "review queue"...). Pages are search results.
2. Ranking: title exact, then title prefix, then title word, then synonym,
   snippet, body; every query word must match (after dropping stop words and
   simple plurals); one typo tolerated on words of five or more letters
   against titles and synonyms; results grouped by type, pages first. Every
   index entry gains `aka` (default empty), so games can be found by
   abbreviation (FFXII, P5R, "nier automata") and origin tags ("jrpg",
   "japanese"). Lens text is indexed, so "hud" or "environmental
   storytelling" finds games.
3. An empty search box shows common pages and the last pages visited in this
   browser (a capped per-browser list).
4. `#/index`, "All pages": every section, view and collection with counts
   from the data, linked from the header, the help dialog, empty search and
   unknown routes. Router case, view group and pane rule added explicitly.
5. Acceptance (scripted): "reference games", "games", "library",
   "platforms", "review queue", "checklist" each return their page first; a
   one-typo title query still finds it; a two-word query where one word
   matches nothing excludes that item; every route kind the smoke test visits
   is linked from `#/index`.

**P3a. The analysis frame, with two pilot games.**
1. Schema per game (validated):
   - `signature`: the one idea worth stealing, 250 to 400 words, in six
     parts: the mechanism; how the game teaches it; how it stays fair; how it
     escalates; what breaks when it is copied; a one-day prototype of it.
   - `lens`: gameplay and systems, UI and HUD, art direction, sound
     direction, lore and narrative, world building, environmental
     storytelling, business and release (price, platforms, early access,
     DLC, re-releases, team size), replayability and difficulty, lineage
     (what it borrowed, what it invented, who copied it). Two or three lenses
     per game are primary and go deep; the rest are one or two lines. Each
     lens: what they did, one concrete moment or screen, why it works, steal
     this, the trap when copying, and the topic it illustrates. A lens says
     "does not apply" only when that is true (Tetris has no lore; its
     business lens is rich).
   - `shots`: about two images per game, each attached to a lens, cropped to
     what is being taught, with alt text, a caption naming what to look at,
     and optional numbered callouts drawn over it.
   - `family` (one value, for grouping) and `tags` (many: 'japanese',
     'turn-based', 'real-time', 'deduction'...), and `aka`.
2. Quality rubric a reviewer applies to every lens: names a concrete moment,
   states the mechanism, gives a transferable rule, no generic adjectives.
3. Default lens to topic table (see Design) so links are consistent.
4. Reverse index `gameLinks` (modelled on `pathLinks`); topic pages list
   "In real games" with the lens each game shows.
5. Library page: grouped by family, filter by tag and by lens, a compact list
   view (title, year, family, signature idea) beside the grid; counts come
   from the data, not copy ("games that succeeded or broke the mould").
6. The Dissect tool's game picker groups games and offers search, and its
   template can pull a game's lenses.
7. Pilot: Hollow Knight (existing) and Valkyria Chronicles (new) written in
   full and shown to the owner (decision 4) before the rest.

**P3b. Four new topics** (two per commit), full eight parts, engine tabs,
interview: `time-and-turns` (Core: real-time, turn-based, ATB and CTB,
Press Turn, BLiTZ, pausable real time, time that moves only when you move);
`genre-hybrids` (Core: composing two loops so each feeds the other);
`puzzle-design` (Content: solution space, the aha, red herrings, fairness by
confirmation; teaching stays in `onboarding`, cross-linked);
`knowledge-as-progression` (Systems: progress held in what the player knows,
cross-linked with `progression` and `mastery-discovery-expression`).

**P3c. Lenses, signatures and shots for the other 14 existing games**, in
batches of five, each fact-checked and rubric-reviewed.

**P4. New games** (decision 2), two batches, each fact-checked:
- Japanese and time-structure games: Valkyria Chronicles (BLiTZ, from P3a),
  Persona 5 Royal (calendar and Confidants around dungeons; One More from
  Press Turn), Shin Megami Tensei III Nocturne HD (Press Turn), Final Fantasy
  XII (Gambits: programming the party's AI), Chrono Trigger (combination
  techs, battles on the field, New Game Plus and many endings; ATB came from
  earlier Final Fantasy), NieR: Automata (plug-in chips as the HUD, routes
  that change the game), Dark Souls (interlocking world, asynchronous
  messages and bloodstains carried over from Demon's Souls), Clair Obscur:
  Expedition 33 (turn-based with real-time dodge and parry), Superhot (time
  moves only when you move).
- Innovative designs: Return of the Obra Dinn (deduction ledger, fates
  confirmed in threes), Viewfinder (photos become geometry), The Witness
  (teaching without words), Outer Wilds (knowledge is the only progression),
  Baba Is You (rules are objects), Papers, Please (moral friction from
  paperwork), Disco Elysium (skills as voices), Undertale (dodging inside
  turn-based fights, mercy, a game that remembers resets).
Integration: a `game` step kind (validator, titles, links, path map,
inventory); game steps in the design paths where a game is the best teacher;
a new path "Learn from games that broke the mould" (design, intermediate)
with stages: rules that teach themselves; knowledge as progression; time and
turns; genres blended; presentation as design. On the map, a topic can show
one game leaf next to its project leaves (independent cap of one, verified
by the layout checker); a game's page links back into the map.

Out of scope: sales figures and review scores; video; Nintendo-only games as
full entries (no store art); they appear as lineage inside lenses.

## 2. Bối cảnh / Survey hiện trạng

- `REFERENCE_GAMES` (src/14-references.js): 15 games, flat template, 15 loop
  and 6 screen schematics (`GAME_DIAGRAMS`), 11 store images (516 KB) in
  assets/games credited in `GAME_ART_CREDITS`. validate.js checks diagrams
  and credits but not that image files exist.
- Topic overview (90-app.js `topicBody`): game chips are a `p.ingames` line
  after either a hand-drawn diagram (`DIAGRAMS[id]` in a plain card) or a
  data diagram (`diagramCard`).
- Screen kind (87-diagrams.js): one shared canvas width `W = 380` for all
  kinds, `MAX_W` 420 enforced by layout-core; the SVG never draws a region's
  description, only `describe()` does.
- Search (`buildIndex`, `search`): about 20 entry types, `{type,t,snip,href,
  text}`, substring scoring, OR over words; no page entries, so "reference
  games" matches nothing.
- Sub-tabs (`subNavHTML`) render only on a group's landing views; Reference
  games sits under Map. Unknown routes fall to the map.
- Map leaves: `practiceLinks(cases, cap=2)` feeds the domain map, map.js and
  the layout checker's state builder.
- Type check covers data files only (jsconfig globs 0*-5*); app code is
  covered by smoke, check-layout and the e2e scripts.

## 3. Design

- **Card footer:** `diagramCard(spec, color, footer)` and the hand-drawn
  `DIAGRAMS[id]` wrapper both take the footer; CSS `.dgm-foot`.
- **Screen schematic:** keep the shared canvas width and `MAX_W`; gain room by
  drawing the legend as HTML under the SVG, badges and glyphs inside regions
  (registered as boxes for the checker); `.dregion.world` gets its own
  entry in check-contrast.js.
- **Library group:** `VIEW_GROUP` gains `library` (games, platforms,
  checklists, prompts, sources); keys 1 to 7; breadcrumbs follow.
- **PAGES and search:** `PAGES` in 05-registry.js; validator checks every
  route resolves and every view group has a page; index entries gain `aka`
  (default `[]`); scoring as in P2.2.
- **Lens to topic defaults:** gameplay → `core-loop`/`mechanics-and-rules`;
  UI → `ux-as-design`/`readability-and-hierarchy`; art → `visual-language`;
  sound → `audio-and-music`; lore → `premise-and-world`/`narrative-agency`;
  world → `premise-and-world`/`spatial-composition`; environmental
  storytelling → `environmental-storytelling`; business → `business-model`/
  `live-operations`; replayability → `difficulty`/`mastery-discovery-
  expression`; lineage → `learning-from-success`. A lens may name others.
- **Images:** WebP about 60 KB, `loading="lazy"`, all third-party images in
  assets/games with one credits table, so removing one is a single commit; a
  takedown contact line on the Sources page; validator checks every file
  exists and fails a single image over 150 KB or the folder over 5 MB;
  README's "small assets folder" line updated.
- **Validator:** new checks after the reference-games loop: signature length
  and parts, lens set, primary count, topic links resolve, shots attached to
  a lens with alt and caption, family and tags from fixed lists.
- **inventory.js:** gains `REFERENCE_GAMES` for the `game` step kind.

## 4. Commit breakdown

P1: (1) card footer both paths; (2) screen schematic badges, glyphs, legend,
world style, contrast entry (one schematic first, owner check); (3) sub-tabs
everywhere, Library group, unknown route; (4) art for the four; (5) sweep
fixes.
P2: (6) PAGES and page entries; (7) ranking, aka, stemming, typo tolerance,
grouping, jump list; (8) `#/index`.
P3a: (9) schema, validator, image checks, gameLinks, topic "In real games",
library grouping and filters, list view, Dissect picker; (10) pilot content
for two games.
P3b: (11) time-and-turns, genre-hybrids; (12) puzzle-design,
knowledge-as-progression.
P3c: (13-15) fourteen games in batches of five.
P4: (16) Japanese and time-structure batch; (17) innovative batch;
(18) `game` step kind, path steps, new path, map game leaf, README counts.

## 5. Seed data the planner must provide

The decisions in section 7.

## 6. E2E test plan

- (a) Topic with game chips: chip boxes inside the card box, both diagram
  paths, 375 and 1440 px.
- (b) Screen schematics: legend lists every region; badges pass the layout
  checker; no sideways scroll on a phone.
- (c) Wayfinding: from five deep pages, Reference games one click away.
- (d) Library: every card has an image that loads (smoke.js, natural width
  greater than 0); filters and list view work.
- (e) Search queries in P2.5.
- (f) Every game page: signature, lenses (primary ones deep), shots load with
  alt text, topic links resolve (smoke plus validator).
- (g) New topics list their games; the map shows a game leaf and passes the
  layout checker.
- (h) New path validates; game steps open the game page; the chooser still
  resolves every combination.
- (i) Full sweep at 375, 1024 and 1440, smoke, e2e-paths, type check, CI.

## 7. Open questions / decisions

Owner decisions (2026-09-24): all four as recommended. Official screenshots,
cropped and credited; the seventeen games; the Library group; a two-game
pilot, then commit and push per pass after review and tests.

1. **Screenshots.** Recommended: about two official screenshots per game
   from its store page, cropped to what is taught, annotated, WebP about
   60 KB, credited and linked, one credits table, takedown contact line
   (about 4 MB for 32 games). Practical risk, not legal advice: store and
   press-kit images carry no licence for this use; the realistic outcome of
   a complaint is a takedown notice to GitHub, fixed by removing the image.
   Alternatives: schematics only; or free-licensed images only (few exist).
2. **New games.** Recommended: the seventeen above (the audit swapped Final
   Fantasy X for XII and SMT III, Octopath and Her Story out, Undertale,
   Superhot and Clair Obscur in for more real-time and turn-based blends).
3. **Library group in the header.** Recommended: add it. Alternative: keep
   the six groups and only show sub-tabs everywhere.
4. **Pilot and pushes.** Recommended: pause after two pilot games for the
   owner's look; commit and push each pass after review and tests.

## 8. Plan audit (2026-09-24)

Two independent reviews: one against the code, one against the request and
content quality.

| Finding | Change |
| --- | --- |
| Game chips follow two diagram render paths; the plan named one | Footer on both `diagramCard` and the hand-drawn wrapper |
| A wider screen canvas needs per-spec width through layout, render and the checker | Keep the shared width; gain room with an HTML legend and in-region badges |
| The SVG never drew region descriptions (survey was wrong) | Survey corrected; legend carries descriptions |
| Map leaves share `practiceLinks`' cap across three files | Independent cap of one game leaf, verified by check-layout |
| `#/index` has no router case or pane rule | Named explicitly in P2 |
| New ranking needs every index entry to gain fields | `aka` on all entries, default empty |
| Type check does not cover app code | Stated; smoke, check-layout and e2e are the net |
| No image existence or size check; repo history grows | Validator checks files, 150 KB per image, 5 MB folder |
| New tint variant would be unchecked for contrast | Explicit check-contrast entry |
| Two acceptance criteria not scriptable | Sweep is a human-reviewed list; image loading checked in smoke |
| inventory.js lacks games for the new step kind | Added |
| Eight equal short lenses will not feel deeper | Signature deep dive per game, primary lenses deep, rubric, pilot first |
| Real-time and turn blends had one example | Clair Obscur, Superhot, FFXII Gambits, SMT III Press Turn added |
| Fact errors in descriptions (Persona's Confidants, ATB's origin, Souls messages' origin) | Corrected in the list |
| Sub-tabs vanish on deep pages; games hidden under Map | Sub-tabs everywhere, Library group, unknown route to index, one-click test |
| P3 linked topics and features built in P4 | Frame and topics before content; content in batches of five |
| Lens set missed business context, lineage, replayability | Business and release, lineage, replayability and difficulty added |
| Screenshots as a separate gallery; schematics still empty boxes | Shots attached to lenses, annotated; glyphs in schematic regions |
| Image risk understated | Fewer, cropped, annotated images, one credits table, takedown line |
| Dissect picker and hard-coded counts will not scale to 32 games | Picker grouped with search; counts from data |
| "Commit and push per pass" as a standing approval | Asked explicitly as decision 4 |
