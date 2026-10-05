# Fact-check: compare-puzzles-inside-an-action-game

Checked 2026-10-05 against `drafts/compare-puzzles-inside-an-action-game.js`, its `.sources.md`,
`briefs/comparisons.md`, the library entries `crosscode` (src/18-games-innovative.js:1008) and `zelda`
(src/18-games-series.js:2273, signature at 2355-2362, Breath of the Wild lens below it), and
`drafts/crosscode.factcheck.md` (which fetched Wikipedia, Steam, Siliconera, TheSixthAxis and CoG Connected).
Fetched again this session: TheSixthAxis CrossCode review. Zelda claims were checked against the library entry
and general knowledge of the games; the Zelda Wikipedia pages were not re-fetched.

New comparison (not in src/46-comparisons.js), so the "dropped section" check does not apply.
Validator: one error naming it, `comparison puzzles-inside-an-action-game: on 0 shelves, expected 1`
(integration, for the coordinator). All three topic ids exist in src (the sources file's note that
puzzles-in-action-spaces is a draft is out of date).

## Verdict: PASS WITH FIXES

The CrossCode side is accurate and well sourced. The Zelda side is drawn from the library and agrees with it, but
it states two readings as facts (rooms that alternate puzzle and fight; Breath of the Wild puzzles needing
"almost no special tool"), one of which is misleading, and it overstates a single critic as "reviewers".

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
| --- | --- | --- | --- | --- |
| Ball is the ranged attack and the puzzle key; switches, boxes, ice pellets, barriers, water bubbles, fans; bounces; element changes it | sections[0].a | CONFIRMED | | WP CrossCode; library crosscode gameplay lens |
| Each Zelda dungeon built around one new item (boomerang, hookshot, bow) that also clears an earlier overworld obstacle | sections[0].b | CONFIRMED | | Library zelda signature.mechanism |
| Felix Klein: puzzle-heavy battles, fast puzzles | sections[1].a | CONFIRMED | | Siliconera (via crosscode.factcheck.md) |
| Zelda: "Combat and puzzle alternate: a room asks the player to use the item, and the next room asks the player to fight" | sections[1].b | UNSUPPORTED | Stated as fact, no source; and many Zelda rooms mix the two (the boomerang and hookshot stun or pull enemies, Ocarina's Z-targeting serves "combat and item puzzles"). Mark as our reading, or say "puzzle rooms and fight rooms are often separate". | Library zelda `changed` (Z-targeting for combat and item puzzles); no source for alternation |
| Each element has a dungeon that introduces it; small rooms with one new thing; first dungeon before the first town | sections[2].a | CONFIRMED | The beginner dungeon precedes Rookie Harbor. "Only one thing to try" is the library's editor description, not a source; acceptable. | Library crosscode teach, env lens |
| First Zelda dungeon often shows a locked door or gap the item answers | sections[2].b | CONFIRMED | Library: "the very first dungeon usually shows a locked door or a gap" (said of the 1986 shape) | Library zelda signature.teach |
| Ocarina's first dungeon ends with a boss the item found inside can realistically win | sections[2].b | CONFIRMED | Great Deku Tree, the Fairy Slingshot against Gohma | Library zelda signature.teach |
| Bosses: read pattern, find weakness, perform a shot that is a puzzle answer | sections[3].a | CONFIRMED | | Library crosscode escalate |
| TheSixthAxis praised puzzles and bosses; some boss fights longer than needed; full restart on death | sections[3].a | CONFIRMED | "some encounters go on a little longer than necessary, which is further exacerbated by having to start the entire fight again should you die"; bosses each have "a unique move set and weakness" | TheSixthAxis, 16 Sep 2020 |
| Boss often falls to the dungeon item | sections[3].b | CONFIRMED (general) | Hedged with "often"; no per-boss claim, which is right given the sources | Library zelda why/teach |
| Wrong shot cheap; timed and ordered puzzles reset; "dozens of attempts" quoted on Wikipedia | sections[4].a | CONFIRMED | PC Games quote on WP | WP CrossCode (via crosscode.factcheck.md) |
| Difficulty can adjust combat and puzzles separately | sections[4].a | CONFIRMED | "customise the difficulty of both combat and puzzles" | WP CrossCode (via crosscode.factcheck.md row 40) |
| Zelda wrong guess costs time not the run; map and compass | sections[4].b | CONFIRMED | | Library zelda signature.fair |
| Later CrossCode dungeons add steps not verbs; no source places fatigue there | sections[5].a | CONFIRMED as marked judgement | | Library crosscode escalate |
| "A critic at CoG Connected described constant recalibration between puzzle and combat modes" | sections[5].a | CONFIRMED (paraphrase) | CoG's words are "a little jarring" and using "different parts of my brain"; "constant recalibration" is our paraphrase. Fine as "described", but do not put it in quotes later. | CoG Connected (via crosscode.factcheck.md row 56) |
| Nintendo escalated scale more than logic; later rooms combine new and old item | sections[5].b | CONFIRMED | | Library zelda signature.escalate |
| BotW removed the item lock, core runes on the first plateau, challenge moved to preparation | sections[5].b | CONFIRMED | Magnesis, Stasis, Cryonis, Remote Bombs and the paraglider on the Great Plateau | Library zelda BotW lens; WP BotW |
| "Reviewers said switching between puzzle thinking and combat thinking can tire a player" | sections[6].a | WRONG (minor) | One critic (CoG Connected). TheSixthAxis says the opposite: the shared system "makes you feel very efficient". Write "one reviewer said". The library's gameplay.cost has the same plural and should be fixed with it. | CoG Connected; TheSixthAxis |
| ALttP's later dungeons assumed the hookshot | sections[6].b | UNSUPPORTED | Carried from the library BotW lens, which gives no source for it. Likely true (the hookshot comes from the Swamp Palace and later Dark World dungeons use it), but no listed source says it. Add a source or drop the example. | Library zelda BotW lens (unsourced) |
| BotW puzzles "must make every puzzle solvable with almost no special tool" | sections[6].b | WRONG (misleading) | BotW shrines lean heavily on the runes; what they cannot assume is a tool found later. Library: every test must be solvable by "whatever a player happens to be carrying", i.e. puzzles cannot assume a specific late-game tool. Write "with the tools every player already has". | Library zelda BotW lens cost and principle |

## Missing coverage

7 sections, a "What each choice risks" section, a matrix diagram within limits, verdict, principle and three
existing topics. Nothing required is missing.
- Thin: no named CrossCode room or boss and no named Zelda dungeon beyond Ocarina's first. The brief asks for "a
  concrete thing a player sees or does"; the earlier crosscode fact-check flagged the same gap. Optional: name one
  CrossCode room or boss.

## Code issues

None.

## Teaching issues

1. The comparison's thesis rests on "Zelda puzzles sit in their own rooms, apart from the fight". That is the
   library's reading (crosscode gameplay compare), but it is presented as fact in sections[1].b and the verdict
   ("the puzzle and the fight stay separate"). Zelda items are routinely combat tools (boomerang stun, hookshot
   pull, arrows on eye switches and enemies alike). Mark it as our reading and add a sentence conceding the
   overlap, or the reader learns a false dichotomy.
2. The BotW risk sentence (above) teaches the opposite of the real constraint.

## Agreement with the library

Agrees with both entries throughout. Where it disagrees, the library is right on BotW (tools in hand, not "no
tool"). On "reviewers" (plural) both the draft and the library's crosscode gameplay.cost are wrong: one reviewer.

## Style

No hype words, UK spelling, no owner-employer or colleague names.

## Set aside

- Zelda Wikipedia pages not re-fetched: every Zelda fact here comes from the library entry, which cites them, and
  the claims are standard series facts.
- The Aonuma Gameluster source is in `sources` but no sentence relies on it (the sources file says so). Harmless;
  the coordinator may drop it.
- "The sword stays the main way to fight": general, listed by the writer as not verified across every entry;
  true of the mainline series in substance.
- "The dungeon is a combination lock": the library's own metaphor.
- Validator shelf error: integration.
