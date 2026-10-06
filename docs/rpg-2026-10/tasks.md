# Tasks: the playable path RPG

Plan: `plan.md` (revision 2, approved 2026-10-06). `[x]` done, `[~]` in progress, `[ ]` open.

## R0 Spike
- [x] R0.1 A data-URI tileset drawn on a canvas from `file://` in Edge at 1440 and 375 px:
  - tiles draw, keyboard walk works, no console errors, no canvas taint;
  - the walker is 588 B gzipped;
  - the phone view needs ≥ 32 px tiles (plan §7);
  - Firefox and Safari were not measured and are checked by hand in R4.

## Before R1a
- [x] Research `research/rpg-paths.md`, with Clark 2016's numbers re-checked against the paper.
- [x] Plan audit: 1 blocker, 8 major, 9 minor, all ruled on (plan §10).
- [x] The final programme's local commits e333177 and d505c9a pushed after a clean replay;
  CI run 37398130431 green.
- [x] Owner's yes to download Kenney *Tiny Town* (kenney_tiny-town.zip, 182 KB) and *Tiny
  Dungeon* (kenney_tiny-dungeon.zip, 99 KB), both CC0, from kenney.nl. Given 2026-10-06; the
  packs' License.txt confirms CC0.

## R1a Playable slice: Game designer foundations (owner go/no-go)
- [x] R1a.1 Tiles: cut the used 16×16 tiles into one PNG; data URI; credits line.
  Done: assets/rpg/tiles.png, 40 tiles, 6 KB, cut by src/rpg-tiles-make.js. It is loaded as a file (`assets/rpg/tiles.png?v=BUILD`) rather than as a data URI, like every other image on the site; drawImage of a file:// image works because the game never reads pixels back. Checked from file:// in Edge. Credits in assets/rpg/LICENSE.txt and README.
- [x] R1a.2 Route `#/play/<path>`:
  - own `routeKey`;
  - `contentNeeds` `['code','rpg']`;
  - full-pane stage with no path bar or sub-navigation;
  - `LAZY.rpg` = `95-rpg-world.js` + `96-rpg.js`;
  - "Play this path" button on the path page.
  Done: the route also covers #/play/stats.
- [x] R1a.3 Hand-laid world: 4 towns of 8 people beside the road, 4 guardians beside the road,
  the road between them.
  Done: generated rather than hand-laid. 95-rpg-world.js builds it from the path data: a serpentine of towns, people alternating above and below the road in step order, a sign at the way in, the guardian on a paved spot at the far end. Every path already gets a world; the button shows on one path only.
- [x] R1a.4 Movement:
  - keyboard (taking the site's shortcut keys while focused), D-pad, tap-to-walk;
  - self-sizing view (tiles ≥ 32 CSS px), camera follows, dpr-crisp;
  - whole-tile moves under reduced motion.
  Done: a tap is one step at once and a held key keeps walking. A held key is released on any keyup in the document.
- [x] R1a.5 Talking:
  - why paged into boxes; do on the last box;
  - Go there / Mark done (`prog.steps`) / Later;
  - reflect notes on the `pathnote` key.
- [x] R1a.6 Return:
  - `rpg.<path>.back` set on Go there;
  - "Back to the world" bar in the path bar;
  - returns to the tile and person by stage and step position.
  Done: the bar stays until the game is opened again.
- [x] R1a.7 Guardian battle:
  - question, answer, confidence, reveal, tick ideas;
  - outcome in words, no HP;
  - existing `scheduleRecall` and `prog.check`;
  - last screen: build task, solution link, Mark stage done.
  Done: the outcome is said in words after each answer ("That answer: partly").
- [x] R1a.8 Travel to visited towns; Leave; autosave of the tile; "Use the list instead" first;
  live status line.
  Done: Travel goes to every town, visited or not: nothing is locked.
- [x] R1a.9 Private timer: walking / reading / answering, plus checkpoints and reviews finished
  in the game vs on the page, on a debug view.
  Done: #/play/stats.
- [x] R1a.10 Test (major step):
  - build, tsc, smoke, e2e-paths;
  - a first `e2e-rpg.js`: walk to a person by keyboard, open a step and come back, a guardian
    round writes the same keys as the page.
  Done: build OK; tsc 0; smoke 275 visits, 0 failures, now including #/play/<path> and #/play/stats; e2e-paths 129/129; e2e-rpg 49/49 at 1440 and 375 px. The page is 273 KB gzipped; the game code is 10.7 KB gzipped plus the 6 KB tiles, both on demand.
- [x] R1a.11 Replay, commit, push, CI (f862038; replay smoke 0 failures, e2e-paths 129/129, e2e-rpg 49/49; GitHub build run 37402157031 and Pages run 37402156750 green). Then **stop: the owner plays it and decides go or
  change.**

## Owner feedback 2026-10-06 (after R1a)
- [x] "Do not see where to play": the button showed on one path only. Now every path shows
  "▶ Play this path" just under its title. That brings forward R2's world check:
  - validate.js builds all 26 worlds and fails the build if a step has no person, two things
    share a tile, or a person, guardian or sign cannot be reached;
  - it reports 26 checked, 0 problems, and the farthest thing is 101 steps from the start;
  - shown to fail by moving a guardian onto a person ("two things stand at 7,8").
  - Still R2: terrains by track and the walking caps.
- [x] "The old adventure look still remains": removed now rather than in R5:
  - `pathSkin`, `adventureSkin()`, the `path-skin` action;
  - the `.overworld.skin` CSS and its `walkin` animation;
  - the "castle" and "road" labels;
  - its four e2e-paths checks.

  e2e-rpg checks that it is gone.
- [ ] "Reference game list cut off at Overwatch on mobile, no way to load more": not
  reproduced. Tried:
  - the Grid and List views, Edge mobile emulation at 375, 390 and 430 px, local build and live
    site: all 110 games are in the page and the pane scrolls to the last one;
  - touch-gesture scrolling could not be tested here (the synthetic gesture scrolled no page,
    not even the controls).

  Asked the owner for the browser, the view (Grid or List) and a screenshot.

- [x] "When approaching an NPC the description grows and pushes the game view up and down":
  - the status line moves from above the map into a strip over the map's top edge, so its
    length never moves the map;
  - it shows the place, then "Beside you: …"; "Press Enter or Talk" is now for screen readers
    only;
  - it is hidden in a battle;
  - e2e-rpg measures the map's top before and after stepping beside someone, at both widths;
  - control: with the line put back above the map, the map moves 17 px at 375 px; with the fix,
    0 px.

## R1b Shared round (after the go)
- [ ] Extract the round machine; the page drives it with identical HTML; the game switches to
  it; e2e-paths 129/129 unchanged.

## R2 All paths
- [ ] Generator from R1a's town templates; 5 terrains.
- [ ] Validator checks for all 26 worlds:
  - reachability with guardians and monsters as walls;
  - each step placed once;
  - no overlap;
  - walking caps;
  - why length guide.
- [ ] Ask the owner about adding `e2e-rpg.js` to CI.

## R3 Review on the road and test-out
- [ ] Review grading pulled out of `review-grade`.
- [ ] Monsters: this path's due `ck:` items, ≤ 3 per town, plus a sign linking to the Review
  page.
- [ ] Guardian test-out with ask-yourself-first and the `ceil(2n/3)` rule.

## R4 Phone and access
- [ ] Keyboard-only e2e run; screen-reader status line; reduced motion; contrast.
- [ ] Longest task ≤ 200 ms; axe run locally.
- [ ] Firefox and iPhone Safari by hand.

## R5 Clean-up and close
- [ ] Remove the Adventure look and its two e2e checks.
- [ ] Docs and credits; smoke visits for `#/play/*`.
- [ ] Fresh read-only review of the whole diff; fixes; records; closing report.
