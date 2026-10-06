# Plan: walk a learning path as a small Dragon Quest-style RPG

**Status: APPROVED 2026-10-06, revision 2 after the plan audit.**
- **Owner decisions** (the recommended answer to every question):
  - an open world: the next town is suggested and nothing is locked;
  - the reading page stays the default and the game is a "Play this path" button;
  - the "Adventure look" skin is removed in R5;
  - each phase commits and pushes after its CI replay.
- **Plan audit** (section 10): 1 blocker, 8 major, 9 minor, every one ruled on.

**Evidence:**
- `docs/program-2026-10/research/rpg-paths.md` (this plan's research);
- `docs/program-2026-10/research/learning-science.md` §2.2-2.3 (the site's earlier verdict on
  game layers).

## 1. What the owner asked for, and what is there now

**Asked (2026-10-06):** "an actual playable simple 2D rpg, think old dragon quest that travel
through the world of the learning path".

**What exists:**
- a stage list with an optional "Adventure look" that recolours it and relabels two headings
  ("The road through this path", "The castle");
- the checkpoint, a one-question-at-a-time recall round. Its code is named `fight*`, but the
  page shows no fight.

That is a skin, not a game, and the skin goes.

## 2. The game

**The world.** Each path is a small world you walk tile by tile, seen from above as in Dragon
Quest I.
- Each stage is a **town** on a road.
- Each step in the stage is a **person in the town**, standing beside the paths, never on them.
- Talking to someone shows the step's **why**, split into dialogue boxes you advance yourself.
  Their last box offers the step's **do** and three choices:
  - **Go there**: the step's real page in the normal site;
  - **Mark done**: the same tick as the checkbox on the path page;
  - **Later**.
- A `reflect` step (54 of them) has no page of its own. Its person opens a notes box on the
  spot, kept under the same key as the notes box on the path page.

**Leaving and coming back.** Reading happens in the normal site. A slim "Back to the world"
bar sits on top of whatever page you went to. It returns you to the tile and the person you
left, found by stage and step position, never by link (12 steps repeat a page within one path).

**The guardian.** Each town has one, standing beside the road. Talking to it starts the stage
checkpoint as a turn-based menu battle:
- the guardian asks one question;
- you answer from memory, say how sure you are, then tick the ideas the outline lists;
- the battle shows the outcome **in words**: got it / partly / not yet.

There is no health bar, no damage and no lose state; self-rating must earn nothing
(learning-science §2.2 item 7). When the round ends the guardian steps aside whatever the
outcome. Its last screen carries the stage's build task, a link to the reference solution and
**Mark stage done**.

Talking to a guardian before visiting its town offers the **test-out** instead: the "ask
yourself first" questions, then the same round with the same `ceil(2n/3)` rule as on the page.

**Review monsters.** Questions from *this path's* checkpoints that are due today stand by their
own stage's town, at most 3 per town; a sign there links the rest to the Review page.
- Talking to one runs the Review page's own flow: question → outline → Got it / Again.
- It uses the same grading function, pulled out of `ACTIONS['review-grade']`, so a review
  done in the game is identical to one done on the Review page.
- Questions from topics and projects belong to no stage and stay on the Review page only.

**Moving around.** Walking is never required to reach anything twice. **Travel** (DQ's Return
spell) jumps to any town you have visited, and **Leave** goes back to the path page.

## 3. Rules from the evidence (each is a design constraint)

| Rule | Why (rpg-paths.md / learning-science.md) |
|---|---|
| **The only battle verb is recalling.** No shop, gold, XP, gear, pets, customisation or sound in the first version. | Points-only feedback was the weakest tier: g 0.26, against 0.48 for enhanced scaffolding (Clark 2016, Confirmed). In Prodigy, questions became a toll to reach the game (critics' reports, labelled Snippet). Sound is decoration: seductive details (Rey). |
| **No random encounters, no grinding, no health bars.** The only enemies are visible, fixed and started by Talk, never by contact. | Horii accepted grinding; a learning game must not demand actions that carry no content (§3). Self-rating as damage gives an incentive to rate generously (l-s §2.2 item 7). |
| **Nothing is ever locked or in the way.** Guardians and monsters stand beside the road; running costs nothing. | Owner decision 1. Horii: "nothing that can't be undone" (§3, Confirmed). |
| **Story is limited to the step's own why/do text.** No plot. | Medium story depth g −0.03 vs none or thin 0.44-0.47 (Clark 2016, observational). |
| **Schematic pixel art, single-player.** | Schematic 0.48 vs realistic −0.01; single-player 0.45 vs multiplayer −0.05 (Clark 2016). |
| **Opt-in.** The page stays the default and the list stays complete. | Expertise reversal; owner decision 2. |
| **Reading happens outside the game.** Nothing animates beside the text. | l-s §2.2: no decorative animation while reading. |
| **Walking is short and measured.** The validator caps tiles between towns and from a town's gate to any person. Travel and tap-to-walk keep it short. | Time spent walking is time not spent learning (§2). |
| **Measured against the plain version.** A private, local timer counts walking, reading and answering, and how many checkpoints and reviews are finished in the game vs on the page. | l-s §2.3's condition. Clark's multi-session result (g 0.44 vs 0.08) concerns sessions actually held, so count them; don't assume a pull. |

## 4. Tech

**Code.**
- Hand-written Canvas 2D in two files. Both load only on the game route, as a new `LAZY.rpg`
  group: `content/code/rpg.js`, built from these sources.
  - `src/95-rpg-world.js`: the world generator. It uses no DOM and is also loaded by
    `validate.js`, so every world is checked at build time.
  - `src/96-rpg.js`: drawing, input, dialogue and battle.
- The research estimated 10-25 KB (Heuristic). The R0 spike measured the drawing core at
  under 1 KB gzipped (§7).

**Route.**
- The game is its own top-level route, `#/play/<path>`, not a stage id under `#/paths`. Today
  `#/paths/<id>/play` silently draws the path page.
- The route has:
  - its own `routeKey`;
  - `contentNeeds` → `['code','rpg']`;
  - no reading layout, path bar or sub-navigation;
  - a full-pane stage.

**Rendering.**
- Canvas draws only the map, and redraws only when something moves.
- Everything with words is real DOM over the canvas: dialogue, menus, battle, Travel, notes.
  That keeps it crisp, readable by screen readers, and styled and contrast-checked like the
  rest of the site.

**Keys.**
- While the game has focus it takes the arrow keys, WASD, digits, Escape, `t` and `m`, and
  stops them reaching the site's global shortcuts (today digits leave the page and `t` changes
  the theme).
- Focus leaving the game returns the keys to the site.

**Art.**
- Kenney *Tiny Town* (overworld and towns) and *Tiny Dungeon* (guardians and monsters), both
  CC0 and 16×16, cut down to the tiles used.
- Embedded as one data-URI PNG, about 27 KB as base64 at the 20 KB target.
- Integer scaling only, with a pixel-art credits line in the README.
- **Downloading the two packs is asked for separately before R1a** (filename, source, size).

**Worlds.**
- 26 paths, 130 stages and 857 steps rule out drawing by hand.
- The generator is deterministic, seeded by the path id, and built from:
  - hand-made ASCII town templates sized for 3-10 people;
  - a road winding from town to town;
  - terrain by track: design → fields, engineering → hills and caves, production → coast,
    leadership → highland, interview → the town walls of a capital.

**State.** The game reads and writes the existing keys:
- `paths.<id>` progress: `steps`, `stages` and `check`;
- `pathnote.<path>.<stage>.<i>`;
- `review`.

It adds two keys:
- `rpg.<path>`: `{tile, visited[], back}`;
- `rpg.settings`: `{motion}`.

A battle is not kept across a reload, as on the page. You stand where you were, and the
guardian asks again from the start.

**Shared logic.**
- The checkpoint round becomes one DOM-free machine, start / conf / reveal /
  mark(had, total) / end, returning what happened. The page and the game each drive their own
  instance.
- The page keeps its HTML, the `fight-*` names, `.fight[data-mode]`, focus on `.fight-q`, and
  the "Once more" and "What you recalled" texts that the e2e checks pin.
- The idea split (`recallIdeas`) lives in that module. `validate.js` keeps its own copy for
  now (one line, noted).
- **This refactor happens only after the R1a go (R1b).** Until then the page round is
  untouched, and the R1a game calls the existing `scheduleRecall`.

## 5. Controls and accessibility (Game Accessibility Guidelines basic tier, research §6)

- **Movement:** arrow keys or WASD; a touch D-pad with targets of at least 44 px; or tap a tile
  to walk there by the shortest path.
- **Actions:** Enter/Space to talk or confirm, Escape to close. The command menu (Talk, Travel,
  Leave) works by keyboard and by tap.
- **Timing:** no timed input.
- **Reduced motion:** the walker moves a whole tile at once, with no flash or shake. A
  `rpg.settings.motion` toggle does the same.
- **Not by colour alone:** state is shown by shape as well as colour (done, guardian already
  answered, monster).
- **Screen readers:**
  - The canvas is `aria-hidden`.
  - A live status line says where you are and who is beside you.
  - The first control is "Use the list instead".
  - The list page carries everything the game does.
- **Phone:**
  - the view sizes itself so a tile is at least 32 CSS px (×2 on phones), with about 11×9
    tiles visible and the camera following;
  - the canvas backing store follows `devicePixelRatio`;
  - target: longest task 200 ms or less on the game route, under the 4× CPU emulation used
    before.

## 6. What changes and what goes

- **New:**
  - "Play this path" button on the path page;
  - the `#/play/<path>` route;
  - the "Back to the world" bar in the always-loaded path bar, shown only when `rpg.<path>.back`
    is set;
  - the `LAZY.rpg` group;
  - world checks in `validate.js`;
  - `src/e2e-rpg.js`, run locally in every replay. Adding it to CI after `e2e-paths.js`
    is a CI change, so the owner is asked at R2.
- **Goes (R5):**
  - the Adventure look: `pathSkin`, `adventureSkin()`, `.overworld.skin` and its `walkin`
    animation, the "road" and "castle" labels;
  - its two e2e checks and the header comment in `e2e-paths.js`.
  - The stage list keeps `.overworld` and `data-v="world"`. Only visible text changes, if any.
- **Changes (R1b):** the checkpoint round's logic becomes the shared module. The page looks
  and behaves exactly as now.
- **Stays:** the whole reading side.

## 7. Phases (test at each major step; no unit tests)

| Phase | Work | Done when |
|---|---|---|
| R0 Spike ✓ | Data-URI tileset on canvas from `file://`, integer scale, phone width. | Done 2026-10-06 (result below). |
| R1a Playable slice → **owner go/no-go** | Hand-laid world for *Game designer foundations*: 4 stages of 8 steps each, the median-or-larger case, with long why texts. Includes: 4 towns of 8 people, 4 guardians, talking with paged why, Go there / Mark done / Later, reflect notes, the return bar, Travel, autosave, keyboard + D-pad + tap-to-walk, and the private walking/reading/answering timer. The page round is untouched, and the game's round calls the existing `scheduleRecall`. | The owner plays it (desktop and phone) and says go or what to change. Nothing else is built before that. |
| R1b Shared round | Extract the round machine. The page drives it with identical HTML; R1a's game switches to it. | `e2e-paths.js` 129/129 unchanged. |
| R2 All paths | Generator (`95-rpg-world.js`) from R1a's town templates, 5 terrains. Validator: for all 26 worlds, every person and town is reachable with guardian and monster tiles treated as walls; every step is placed exactly once; nothing overlaps; tiles from gate to person and between towns are capped. Ask the owner about adding `e2e-rpg.js` to CI. | `validate.js` passes 26 worlds. |
| R3 Review on the road and test-out | Monsters (this path's due `ck:` items, ≤ 3 per town, the Review page's grading); guardian test-out with ask-yourself-first. | e2e: a due item stands by its town; grading it in the game leaves the same `review` entry as grading it on the Review page; test-out marks the stage as on the page. |
| R4 Phone and access | Keyboard-only run, screen-reader status line, reduced motion, contrast, longest task. axe run locally as in the earlier audit (not added to CI). Firefox and the owner's iPhone Safari checked by hand. | e2e keyboard-only run through a town and a battle; axe 0 at 1440 and 375; longest task ≤ 200 ms. |
| R5 Clean-up and close | Remove the skin and its tests; README, CONTRIBUTING, credits; smoke visits for `#/play/*`; a fresh read-only review of the whole diff; fixes; records. | CI replay green; review findings closed or recorded. |

Each phase ends with the CI replay (clean export, build, sync check, tsc, smoke, e2e) before
its commit and push.

### R0 spike result (2026-10-06, throwaway code in the session scratchpad)

- A hand-encoded PNG tileset as a data URI, drawn with `drawImage` on a canvas from
  `file://`, in Edge (Playwright, msedge channel) at 1440×900 and 375×812:
  - the tiles draw;
  - the arrow keys move the player and update an `aria-live` status line;
  - no console errors;
  - `getImageData` raises no SecurityError.
- Size: the minimal walker is 588 bytes gzipped; the 4-tile PNG is 152 bytes.
- **Changes the design:** a fixed 15×11 view at an integer scale gives a 240×176 px canvas on
  a 375 px phone (16 CSS px tiles), which is too small. Hence the self-sizing view in §5.
- **Not measured:** Firefox and Safari (no Playwright Firefox or WebKit installed; installing
  them is a download). `drawImage` of a data URI is not a cross-origin read, and the game never
  reads pixels back. Both are checked by hand in R4.

## 8. Risks

- **Walking is slower than clicking.** This is the core risk.
  - Mitigations: Travel, tap-to-walk, capped distances, and the list one tap away.
  - Measured by the R1a timer. If walking time exceeds reading time, shrink the worlds.
- **Generated worlds look samey.** R1a's hand-laid world sets the bar before 26 are generated.
- **Phone performance:** the game loads only on its route, and redraws only on movement.
  Target in §5, measured in R4.
- **The R1b refactor breaks the page round.** It runs only after the go, behind the unchanged
  e2e checks.

## 9. Decisions (settled)

1. Open world. 2. Page by default, game is a button. 3. Remove the skin in R5.
4. Each phase commits and pushes after its CI replay. e333177 and d505c9a were pushed
   2026-10-06.

## 10. Plan audit (2026-10-06, fresh read-only agent): rulings

| Finding | Ruling |
|---|---|
| B1 Guardians and monsters on the road gate it | Accepted: beside the road, Talk-only, BFS with them as walls (§2, R2). |
| M1 Each recalled idea as a hit = self-rating as damage | Accepted: outcomes in words, no HP; the guardian steps aside whatever the outcome (§2). |
| M2 Monsters cannot match the Review page on the checkpoint grading | Accepted: monsters use the Review page's own grading, pulled out of `review-grade`; only this path's `ck:` items (§2, R3). |
| M3 why+do median 269 chars, not one line | Accepted: why paged into boxes, do on the last box; a length guide in the validator (R2). |
| M4 54 reflect steps have no page | Accepted: in-game notes box on the same key (§2). |
| M5 Progress parity undefined | Accepted: Mark done on the person; build task, solution and Mark stage done on the guardian's last screen (§2). |
| M6 Router and redraw do not fit | Accepted: top-level `#/play/<path>` route with its own key and needs; DOM-free round machine with page HTML pinned (§4). |
| M7 Return and walking budget undesigned | Accepted: return bar keyed by step position; walking caps in the validator (§2, R2). |
| M8 validate.js cannot see the generator | Accepted: `95-rpg-world.js` is DOM-free and loaded by the validator (§4). |
| M9 R1 gate too late, easiest path | Accepted: R1a uses an 8-step-per-stage path and a hand-laid world; refactor after the go; timer and completion counts in R1a. |
| m1 Overstated citations | Fixed in §3 (0.48 not 0.58; Heuristic size; Prodigy labelled Snippet; no "pull back" claim; the WebGL argument dropped). |
| m2 Two tracks had no terrain | Fixed: 5 terrains (§4). |
| m3 State understated | Fixed: `rpg.<path>` and `rpg.settings` (§4). |
| m4 axe not in CI; Safari | axe is run locally as in the earlier a11y audit, not added to CI. Safari is checked on the owner's phone in R4. |
| m5 Skin removal must update the e2e checks | Fixed (§6). |
| m6 Global shortcuts collide | Fixed: the game takes its keys while focused (§4). |
| m7 Phone budget | Fixed: target for the game route; the base64 size noted (§4, §5). |
| m8 New buttons not listed | Fixed (§6). |
| m9 Sound and status screen are decoration; ideas split duplicated | Sound and status screen dropped from the first version; the split lives in the shared module, and validate.js keeps its copy (noted). |
