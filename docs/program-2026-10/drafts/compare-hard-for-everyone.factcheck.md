# Fact-check: compare-hard-for-everyone (deepened)

**Verdict: PASS WITH FIXES**

Counts: WRONG 1, UNSUPPORTED 1, OUTDATED 0.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
| --- | --- | --- | --- | --- |
| "Assist Mode has five options: game speed, infinite stamina, extra air dashes, dash assist and invincibility" | sections[0].a | CONFIRMED, incomplete | Those five are the toggles. Assist Mode also lets the player skip a chapter. The library includes this ("the option to skip a chapter outright"); the draft leaves it out. Suggest: "five settings ... and the option to skip a chapter". | https://newnormative.com/2018/01/25/celestes-assist-mode-brings-welcome-accessibility-options ; library ANALYSIS celeste `fair` |
| First called Cheat Mode; renamed because the name felt judgemental | sections[0].a | CONFIRMED | Wikipedia: "initially titled 'Cheat Mode'"; Thorson "felt that the name was too judgmental" | https://en.wikipedia.org/wiki/Celeste_(video_game) |
| Dark Souls has no difficulty setting | sections[0].b | UNSUPPORTED (true, but not in the listed source) | True of the game. The cited Wikipedia page (the series page) does not state it. Add a source or point to the library. | none fetched |
| Summon other players; level up the stats you choose | sections[0].b | CONFIRMED | Wikipedia: cooperative play "using invasion or summoning mechanics"; the library ties summoning to restoring human form | Dark Souls Wikipedia; library dark-souls `escalate` |
| Game speed goes down in 10 percent steps to 50 percent | sections[1].a | CONFIRMED (source not listed) | "slow down everything in the game to 50% speed by intervals of 10%". The draft's sources do not include a page that says this. The writer saw it in a search summary, and the gameaccessibilityguidelines page does not give the range. Add the New Normative URL to `sources`. | New Normative (above) |
| Assist screen: "every player is different", hopes the mode lets them enjoy it if its difficulty makes it inaccessible | sections[2].a | CONFIRMED | "we understand that every player is different. If Celeste is inaccessible to you due to its difficulty, we hope that Assist Mode will allow you to still enjoy it." This is the wording after the 2019 rewrite. The library notes the launch text called the difficulty "essential", which drew criticism. The draft is correct for the current game. | https://gameaccessibilityguidelines.com/celeste-assist-mode ; library celeste `complaints` |
| "Matt Thorson has said the team wants players to leave feeling capable and powerful" | sections[2].a | WRONG (name) | The quote is confirmed ("We want people to come out of this game feeling capable and powerful"). But the developer's name is **Maddy Thorson**. The 2018 Vice article uses the old name; the library uses "Maddy Thorson". Use "Maddy Thorson" here and "Thorson" afterwards. | https://www.vice.com/en/article/celeste-difficulty-assist-mode ; library src/14-references.js:15 |
| Instant room respawn; strawberries and B-sides are optional difficulty | sections[3].a | CONFIRMED (library) | Library `first30`: "Death respawns her instantly at the start of the current room" | src/14-references.js:15 |
| Bonfires the only checkpoints; enemies return; souls lost on a second death | sections[3].b | CONFIRMED | "If players die again before retrieving their souls, the souls are permanently gone"; bonfires respawn "most enemies" | Dark Souls Wikipedia; library |
| B-sides from cassette tapes; C-sides after the B-sides | sections[4].a | CONFIRMED | C-sides unlock after all eight B-sides | Celeste Wikipedia; library ANALYSIS celeste |
| A shortcut opened stays open | sections[4].b | CONFIRMED (library) | Library dark-souls `why` and ANALYSIS `mechanism` | src/17-games-japan.js:804 onward |
| "Thorson has said Assist Mode breaks the game" | sections[5].a | CONFIRMED, quoted out of context | Vice: "From my perspective as the game's designer, Assist Mode breaks the game." In the article Thorson goes on to accept this as the price of letting players set their own experience. As written, the line reads as a designer's warning against the feature. See Teaching issues. | Vice |

## Library agreement

- Assist Mode options: the library includes the chapter skip; the draft does not. **The library is more complete.** The draft's list of five toggles is correct as far as it goes.
- Developer name: the library says Maddy Thorson; the draft says Matt Thorson. **The library is right.**
- Otherwise the draft agrees with the library (respawn, B/C-sides, bonfires, shortcuts, souls).

## Deepening check (against src/46-comparisons.js)

- All three existing sections are kept. "The official way to ease off" (a) was rewritten from "slow the game, use unlimited dashes or turn on invincibility" to the full five-option list. That is a correct expansion, but see the chapter-skip note.
- All three existing sources are kept. One was added (gameaccessibilityguidelines). The 10 percent step figure still has no listed source.
- New sections: "How the game words the offer", "What a player carries out of a failure", "What each choice risks", plus a matrix diagram. This meets the brief. The old comparison had no risks section, so adding one was required.

## Missing coverage

- None against the brief. Optional: the Dark Souls summon needs human form, which also opens the player to invasion (library ANALYSIS dark-souls `escalate`). That is a real cost of the in-world help, and it would strengthen "What each choice risks" (b).

## Teaching issues

- "Breaks the game" without its context reads as the designer warning against Assist Mode. Thorson used it to explain why the feature was a deliberate trade the team accepted. Suggest: "Thorson has said Assist Mode breaks the game as designed, and accepted that as the price of letting players choose".
- "Some players may feel the result is not the same test others passed" is judgement and reads as such.

## Code issues

- None (data only). The validator was not run by this check.

## Style

- "judgmental" (sections[0].a) is the US-leaning spelling. The site writes "judgement" elsewhere (failed-run-worth-it), so use "judgemental". This sentence is unchanged from the existing text in src/46-comparisons.js.
- No hype words. No employer or colleague names.

## Set aside

- The Assist screen text predates and postdates a 2019 rewrite. The draft quotes the current version, which is correct for a reader playing now.
- "Help comes from inside the game" also covers NPC summons. The draft says "other players" only, which is still true.
- Strawberries "add difficulty" is close enough: they are optional, off-path and harder to reach.
- The validator was not run here (writer's check per briefs/comparisons.md).
