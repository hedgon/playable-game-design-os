# Fact-check: compare-return-trips

Draft: `docs/program-2026-10/drafts/compare-return-trips.js` (new comparison; the id is not in `src/46-comparisons.js`, so nothing was dropped).
Brief: `briefs/comparisons.md` (row `return-trips`), checked against the library entries `hollow-knight` (`src/16-games-analysis.js`) and `dark-souls` (`src/17-games-japan.js`).

## Verdict: PASS WITH FIXES

Counts: WRONG 3, UNSUPPORTED 1, OUTDATED 0.

The most serious problem is a source that is about a different game. `https://gmtk.substack.com/p/the-world-design-of-hollow-knight` is Mark Brown's essay "The World Design of Hollow Knight: Silksong", not one about Hollow Knight. The next most serious is the claim that the old room "is the same room". Team Cherry's own account says they changed the Forgotten Crossroads into the Infected Crossroads late in the game, specifically to keep return trips from becoming tedious.

## Claims

| Claim (short) | Field | Verdict | Correct value / note | Source |
| --- | --- | --- | --- | --- |
| "Hallownest is built on ability gates" | sections[0].a | CONFIRMED | | Library hollow-knight ("borrows ability-gated exploration from Metroid"); https://en.wikipedia.org/wiki/Hollow_Knight |
| Lordran one connected world; doors open from the far side; return to bonfire to rest and spend souls | sections[0].b | CONFIRMED | | https://en.wikipedia.org/wiki/Dark_Souls_(video_game) ("single interconnected world ... linked by unlockable shortcuts"; resting lets the player level up) |
| "Stag Stations are fast-travel terminals that the player unlocks one at a time" | sections[1].a | CONFIRMED, imprecise | The player finds each station and usually pays a Geo toll (50 to 300 Geo) to open it. Dirtmouth, Resting Grounds (lever) and Stag Nest are free. Trams (Tram Pass) are a second fast-travel system the draft leaves out; the library mentions both ("stag stations and trams link regions once found") | https://hollowknight.wiki/w/Stag_Station |
| Lever, lift or door from the far side joins two parts of the map | sections[1].b | CONFIRMED | Library: Undead Parish elevator back to Firelink Shrine | Library dark-souls; Wikipedia Dark Souls |
| "Warping between bonfires comes much later, after the player gets a key item" | sections[1].b | CONFIRMED | The Lordvessel, given by Gwynevere after Ornstein and Smough. Only some bonfires can be warped to | https://darksouls.wiki.fextralife.com/Lordvessel (search extract; the page itself timed out) |
| "The old room is the same room, but the player is not" | sections[2].a | WRONG (overstated) | Team Cherry changed old rooms on purpose. Late in the game the Forgotten Crossroads becomes the Infected Crossroads, with infection and changed enemies, which Pellen gives as their answer to tedious backtracking. Suggested fix: "Mostly the old room is the same room and the player is not. Team Cherry did change the first region: late in the game the Forgotten Crossroads becomes the Infected Crossroads." | https://www.gameinformer.com/2018/10/15/the-making-of-hollow-knight (already in `sources`) |
| "Resting at a bonfire respawns most enemies" | sections[2].b | CONFIRMED | Bosses, mini-bosses and killed NPCs excepted | Wikipedia Dark Souls |
| "The player has no map of a region until they find Cornifer" | sections[3].a | WRONG (overgeneralised) | Cornifer is absent from the Resting Grounds, the Abyss and the Hive. Iselda also sells his maps in Dirtmouth, so a player who missed him can still buy one. The library says it correctly: "In most regions". Fix: "In most regions the player has no map until they find Cornifer". | https://hollowknight.wiki/w/Cornifer; library hollow-knight signature |
| Rooms beyond his sketch are added when they rest at a bench with a quill | sections[3].a | CONFIRMED | | Library hollow-knight signature; Game Informer ("purchasing simple maps from a cartographer and expanding on those yourself") |
| "The game has no map screen" | sections[3].b | UNSUPPORTED (true as far as we know) | No source in `sources` says this. The library says the HUD is minimal and that messages do the work of a minimap, but it never says outright that there is no map. Add a source, or reword to match the library | Library dark-souls (Miyazaki HUD sentence) |
| Messages left by other players | sections[3].b | CONFIRMED | | Wikipedia Dark Souls ("leave messages using preset phrases") |
| Shade near the place of death holds Geo; dying again erases it | sections[4].a | CONFIRMED, incomplete | The Shade spawns where the Knight died (with exceptions such as the Collector's arena). Dying again loses the old Geo. The draft leaves out the second cost: until the Shade is beaten, the Soul meter is capped at about two-thirds. The library mentions this ("cracks your soul gauge") | https://hollowknight.wiki/w/Shade |
| Souls stay at the place of death; dying first loses them for good | sections[4].b | CONFIRMED | Humanity is dropped too | Wikipedia Dark Souls |
| Source `gmtk.substack.com/p/the-world-design-of-hollow-knight` | sources | WRONG | The essay is about Hollow Knight: Silksong. Remove it, or replace it with a Hollow Knight source | fetched 2026-10-05 |

## Missing coverage (brief and library)

- The Shade's Soul cap: the library treats it as half of the death cost. Without it, "the debt is the same" in sections[4].b is not quite true.
- Trams appear in the library's description of how regions are linked; neither the section nor the diagram mentions them.
- The Infected Crossroads, Team Cherry's only stated answer to "returning feels like a chore". This is the comparison's own problem, and the developer source is already cited.
- Hollow Knight's own physical shortcuts (one-way doors, lifts back to benches) are missing. The "Shortcuts" row implies only Dark Souls has them.

## Code issues

None. The draft contains no code.

## Teaching issues

- The verdict says Hollow Knight costs "some of the fear of being lost". That is judgement, but it is not marked as such the way the risk section is.
- The principle mentions a third option, "onto your content budget", that no section illustrates. The Infected Crossroads would illustrate it.

## Agreement with the library

- Cornifer: the library is right ("in most regions") and the draft is wrong. See the claims table.
- Death cost: the library is right and more complete, because it includes the Soul cap.
- Dark Souls: the draft agrees with the library on bonfires, shortcuts and messages.

## Set aside

- Matrix limits: row labels are 11 characters or fewer and cells are well under 70 characters, so they fit.
- Topic ids `backtracking-and-return-trips`, `spatial-composition` and `level-structure` exist in `src/25-topics-level.js`.
- Style: no hype words, no US spellings found, no employer or internal names.
- The two "(our judgement)" risk sentences are marked as judgement, so they are not flagged.
- The validator "0 shelves" note in the sources file is integration work for the coordinator, not a fact problem.
- I did not run the validator. The fact-check brief does not ask for it.
