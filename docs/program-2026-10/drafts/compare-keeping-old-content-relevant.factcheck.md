# Fact-check: compare-keeping-old-content-relevant

Draft: `docs/program-2026-10/drafts/compare-keeping-old-content-relevant.js` (new comparison; the id is not in `src/46-comparisons.js`).
Brief: `briefs/comparisons.md`. Library entries checked: `hearthstone` (`src/18-games-genres.js:5675`) and `slay-the-spire` (`src/16-games-analysis.js:149`).

## Verdict: PASS WITH FIXES

Counts: WRONG 2, UNSUPPORTED 1, OUTDATED 0.

The most serious problem is the claim "Since 2018, only cards from the current and previous year are legal in Standard". The two-year window has applied since Standard began on 26 April 2016. The library agrees: "since April 2016 Standard has rotated older sets out". The sources file's "Year of the Mammoth (2018)" is also wrong: Mammoth was 2017 and Raven was 2018.

## Claims

| Claim (short) | Field | Verdict | Correct value / note | Source |
| --- | --- | --- | --- | --- |
| Three major expansions a year, mini-sets since 2021 | sections[0].a | CONFIRMED | One expansion about every four months; mini-sets from 2021. Still the cadence in the 2026 Year of the Scarab | https://en.wikipedia.org/wiki/Hearthstone; https://hearthstone.wiki.gg/wiki/Standard_format |
| StS launched with two characters; Defect in early access; fourth by free update in 2020 | sections[0].b | CONFIRMED | Early access late 2017 with two characters; three at full release (23 January 2019); fourth released 14 January 2020 as a free update | https://en.wikipedia.org/wiki/Slay_the_Spire |
| "Standard and Wild began in April 2016" | sections[1].a | CONFIRMED | 26 April 2016 | hearthstone.wiki.gg Standard_format |
| "Since 2018, only cards from the current and previous year are legal in Standard" | sections[1].a | WRONG | The rule has applied since 2016: sets from the previous two calendar years, plus a base set (Basic and Classic, then Core from 2021). Fix: "Since then, only cards from the current and previous year, plus a base set, are legal in Standard." | hearthstone.wiki.gg Standard_format ("applied since the format's inception in 2016"); library hearthstone |
| Nothing rotates in StS; every card stays | sections[1].b | CONFIRMED (by absence) | | Wikipedia Slay the Spire |
| Hall of Fame moves auto-include cards out; dust compensation; still usable in Wild | sections[2].a | CONFIRMED | Introduced in 2017, the Year of the Mammoth | Wikipedia Hearthstone ("auto-includes ... stagnant metagame"; "received the arcane dust value") |
| "Nerfed cards are refunded in full dust" | sections[2].a | WRONG | A nerf is not an automatic refund. It opens a window, usually two weeks, in which the card can be disenchanted for its full crafting cost. Only Hall of Fame moves give an automatic refund. Fix: "After a nerf, the card can be disenchanted for its full cost for about two weeks." | https://hearthstone.wiki.gg/wiki/Arcane_dust |
| Ascension: up to 20 stacking tiers | sections[2].b | CONFIRMED | Tracked per character (library) | Wikipedia Slay the Spire; library slay-the-spire |
| Core set rotating cards out and in since 2021 | sections[3].a | CONFIRMED | Introduced 30 March 2021 | Wikipedia Hearthstone; hearthstone.wiki.gg |
| Daily Climb, Custom Mode, Steam Workshop mods add characters, cards and monsters | sections[3].b | CONFIRMED | | Wikipedia Slay the Spire |
| Hall of Fame as the current power tool (present tense, and "Hall of Fame" in the diagram) | sections[2].a, diagram | UNSUPPORTED | No source says Hall of Fame moves continued after the Core set arrived in 2021. Since then, cards mostly leave Standard by leaving the yearly Core set, and that gives no dust. Either say "From 2017 the Hall of Fame moved ..." or source a recent move | none found |
| Source `gamedeveloper.com/.../learn-i-slay-the-spire-...-at-gdc-2019` | sources | CONFIRMED, weak | The page is a short preview of the GDC talk (29 January 2019) with no balancing detail. The library cites a stronger companion article: https://www.gamedeveloper.com/design/how-i-slay-the-spire-i-s-devs-use-data-to-balance-their-roguelike-deck-builder | fetched 2026-10-05 |

## Missing coverage

- Mega Crit's telemetry-led balancing during early access is missing: pick rates, win rates, the dashboard growing to "at least 90" graphs, and the Dual Wield and Awakened One fixes. The library documents all of it, and it is StS's real answer to "how power is kept in check". The draft's StS column says only "difficulty is the dial".
- Hearthstone's Wild format: the library and the draft agree, so nothing is missing there.

## Teaching issues

- "a card is only measured against the other cards in the same run" (sections[1].b) is misleading. Players compare cards across runs, and the designers balanced each card against its pick rate and win rate across all players' runs. The library says this directly: "Slay the Spire treats its own balance as a moving target and checks it against play data". Reword: "within a run, a card competes only with the other cards offered in that run".
- "Rotation asks players to buy again" (sections[4].a) is fair as a statement of the mechanism. The library's sourced figure would make it concrete: Polygon in 2017 estimated about $400 a year to own every new card.
- The diagram cell "Patches and Ascension tiers" calls Ascension a "power dial". Ascension changes the challenge, not the power of cards. Arguably fine, but it blurs the comparison's own distinction.

## Agreement with the library

- Rotation start date: the library ("since April 2016") is right; the draft ("Since 2018") is wrong.
- StS balancing: the library is more accurate, because it includes the telemetry. See the teaching issues.
- Expansion cadence agrees ("about every four months").

## Set aside

- The Watcher is not named in the draft, so the sources file's worry about the name does not apply.
- "Each adds many cards": vague, but true (sets of about 130 or more cards).
- Matrix limits: row labels are 11 characters or fewer, and cells fit.
- Topic ids `power-creep-and-content-growth`, `balance-methods` (`src/23-topics-systems.js`) and `live-operations` (`src/29-topics-product.js`) exist.
- Style: no hype words, no US spellings, no employer or internal names.
- I did not run the validator. The fact-check brief does not ask for it.
