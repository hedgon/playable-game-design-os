# Brief: writing "Two games, one problem" comparisons (programme 2026-10)

You write comparisons as draft files outside the build. The coordinator integrates them,
fits their diagrams to the renderer and gets them fact-checked.

## Read first (targeted)

- `src/14-references.js`, the comment and typedef above `function COMPARE` (the shape).
- `src/46-comparisons.js`, all of it: the four existing comparisons are the tone and the
  minimum depth. Each section names an observable mechanism in each game, not an opinion.
- The two games' entries in the library (`GAME({ id:'<id>'` or `id: '<id>'` in a
  `SERIES({`, in `src/16-*.js` to `src/18-*.js`): read their signature and the lenses that
  touch the problem, so the comparison agrees with the library or says where it differs.
- The topics you link (`T('<id>',` in `src/2*.js` and `src/3*.js`): read `what` and `how`.

## Shape

```js
COMPARE({
  id:'kebab-case', t:'The problem as a short title', problem:'One sentence: the shared problem.',
  games:['game-a', 'game-b'],           // library ids; a is described in .a, b in .b
  sections:[{ h:'Aspect', a:'What game A does, concretely.', b:'What game B does.' }, ...],
  diagram:{ ... },                      // optional, see below
  verdict:'What each choice costs and gains, both sides in one or two sentences.',
  principle:'The lesson that transfers to the reader\u2019s own game, as an instruction.',
  topics:['topic-id', ...],             // 2 to 4 existing topics
  sources:['https://...', ...]          // every claim traceable; official and developer sources first
});
```

- Sections: 5 to 7 for a new comparison. Each `a` and `b` is 2 to 4 sentences, names a
  concrete thing a player sees or does (a room, a number, a rule, a screen), and says what
  it does to the player. No praise words ("brilliant", "masterful"): say the mechanism.
- One section must be "What each choice risks" (the cost), as in the existing four.
- Facts: every number, date, name and quote needs a source in `sources`, and the source
  must say it. Prefer the developer (GDC talks, postmortems, interviews, patch notes),
  then the publisher, then reputable press, then Wikipedia only for release facts. Mark
  judgement as judgement ("arguably", "in our reading").
- Write plain English: short sentences, active voice, no idioms.

## The optional diagram

Use one when a picture says the difference faster than the sections: two curves, a
two-column matrix, two small flows. Kinds and the renderer's hard limits (text past a
limit is cut and fails the layout check):

- `matrix`: `rows` (1 to 7 labels, each at most 3 lines of 11 characters, no word longer
  than 11), `cols` (2 or 3), `cells` (rows x cols strings). With 2 columns a cell holds
  about 70 characters, with 3 about 45. Use the two games as the two columns.
- `curve`: `x`, `y` (y at most 28 characters), `alt` (a sentence saying what the shape
  shows), `series` (1 or 2, each `{ t, pts:[[x,y],...] }` with x rising, all values 0 to 1,
  `t` at most 21 characters), optional `band { t, from, to }` and `beats [{ t, at }]` (beat
  text at most 2 lines of 12 characters).
- `flow`: `steps [{ id, t, d? }]` (2 to 9), `edges [[from, to, label?]]`, no cycles, every
  step reachable from the first.
- `title` is required and at most 90 characters; `note` optional. Illustrative numbers
  must be labelled as such in `note`.

## Deepening an existing comparison

Write the WHOLE comparison again with the same `id`, keeping every existing section that
is correct (fix any that is not, and say so in the sources file), and add at least two
new sections and a diagram. Do not drop a source that a kept sentence relies on.

## Files and checks

- Write `docs/program-2026-10/drafts/compare-<id>.js` (only the `COMPARE({...});` call)
  and `docs/program-2026-10/drafts/compare-<id>.sources.md`: for each section, the
  sources that support it, with the sentence or figure each one gives, and which claims
  are judgement.
- Check the draft against the data:
  `PLAYABLE_DRAFTS=docs/program-2026-10/drafts/compare-<id>.js node src/validate.js`
  (a draft with an existing id replaces that comparison in this check). Fix every error
  that names your comparison.
- Do not edit any file under `src/`. Do not run the build. Never run git. Never read or
  search `D:\Personal` outside this repository.
- Return the file paths and a 5-line summary: the problem, what differs, the strongest
  sources, and anything you could not verify.

## The comparisons

| id | games (a, b) | problem | topics to link |
| --- | --- | --- | --- |
| failed-run-worth-it (deepen) | hades, slay-the-spire | a lost run must leave the player something | challenge-failure-recovery, progression, knowledge-as-progression |
| teaching-without-words (deepen) | portal, super-mario | teaching a mechanic without tutorial text | onboarding, feedback-and-affordance, level-structure |
| hard-for-everyone (deepen) | celeste, dark-souls | a hard game that more players can finish | difficulty, accessibility, challenge-failure-recovery |
| daily-habit (deepen) | wordle, candy-crush-saga | a reason to come back tomorrow | platform-and-session, monetisation-design, ethics-and-responsibility, return-and-quit |
| return-trips | hollow-knight, dark-souls | coming back through known places without it feeling like a chore | backtracking-and-return-trips, spatial-composition, level-structure |
| keeping-old-content-relevant | hearthstone, slay-the-spire | new content arrives, and the old must stay worth choosing | power-creep-and-content-growth, balance-methods, live-operations |
| one-world-many-players | world-of-warcraft, fortnite | many players sharing one world or one match at once | server-world-partitioning, multiplayer-design, live-operations |
| getting-around-an-open-world | elden-ring, skyrim | crossing a large world again without the walk becoming the game | backtracking-and-return-trips, level-structure, spatial-composition |
| balance-patches-in-a-live-game | overwatch, street-fighter | changing the strength of characters players have learned | balance-methods, power-creep-and-content-growth, live-operations |
| rhythm-by-ear (after P7) | rhythm-heaven, rhythm-doctor | a rhythm game played by listening, not reading notes | rhythm-and-music-timed-design, craft-audio-clock-and-input-latency |
| puzzles-inside-an-action-game (after P7) | crosscode, zelda | puzzle rooms that use the combat kit instead of pausing it | puzzles-in-action-spaces, puzzle-design, combat-design |
| charting-by-hand (after P7) | beat-saber, rhythm-doctor | turning a song into a level a player can read | rhythm-and-music-timed-design, level-structure |

Confirm each topic id exists before linking it (`T('<id>',`); if one does not, pick the
closest existing topic and say so in the sources file.
