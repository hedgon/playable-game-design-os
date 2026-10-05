# Fact-check: compare-failed-run-worth-it (deepened)

**Verdict: PASS WITH FIXES**

Counts: WRONG 1, UNSUPPORTED 3, OUTDATED 0.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
| --- | --- | --- | --- | --- |
| "coins and some in-run upgrades are lost" on death; other currencies buy permanent upgrades | sections[0].a | CONFIRMED | Wikipedia: "Obols and certain types of upgrades are lost upon death" | https://en.wikipedia.org/wiki/Hades_(video_game) |
| "characters remark on what killed you" | sections[0].a | UNSUPPORTED (by the listed sources) | The library agrees (Hades `first30`: Hypnos "greets you with a quip about what killed you"). The Hades Wikipedia page does not say it. Add a source or soften it to "characters remark on your last run". | library src/14-references.js:16 |
| Finished and failed runs both count toward unlocking characters, cards and relics | sections[0].b | CONFIRMED | "Completed or failed runs contribute points towards unlocking new characters or new relics and cards" | https://en.wikipedia.org/wiki/Slay_the_Spire |
| Mirror of Night "makes the next attempt a little easier" | sections[1].a | UNSUPPORTED | No listed source names the Mirror of Night (Wikipedia does not). The library describes it the same way (Hades `complaints` and `lesson`). The text was carried over unchanged, so this gap is not new. | none found among the listed sources |
| Kasavin: the structure let the team tell branching stories over many playthroughs | sections[2].a | CONFIRMED | Wikipedia paraphrases Kasavin: with Pyre most players saw one playthrough; a roguelike "calls for players to repeatedly play through the game". Kasavin is Supergiant's creative director. | Hades Wikipedia |
| Neow's Lament: "enemies in your next three combats have one health", offered after a run that ends before the first boss | sections[2].b | CONFIRMED | Neow offers two blessings (Max HP or Neow's Lament) if the first boss was not reached, and four otherwise | https://slaythespire.wiki.gg/wiki/Neow |
| God Mode: 20 percent damage resistance at the start, plus 2 percent per death | sections[3].a | CONFIRMED | "It starts with a 20 percent damage resistance buff ... with each death a 2 percent damage resistance buff is applied". The source gives no cap; the draft does not claim one. | https://caniplaythat.com/2021/08/11/hades-god-mode-explained-by-supergiant-games |
| Enemy moves are shown in advance as intent icons | sections[3].b | CONFIRMED | Wikipedia (intents); the library's ANALYSIS for slay-the-spire says the same | StS Wikipedia; slaythespire.wiki.gg/wiki/Intent |
| "The game does not carry a bonus between runs" | sections[3].b | WRONG | Section 3b of the same draft describes one: after a run that does not reach the first boss, the next run opens with Neow's Lament (or Max HP), and the choice of four blessings depends on how far the last run got. Suggested wording: "Apart from Neow's small opening blessing, the game does not carry power between runs." | slaythespire.wiki.gg/wiki/Neow |
| Pact of Punishment unlocks after beating Hades once; raises enemy strength, numbers, boss complexity | sections[4].a | CONFIRMED | Wikipedia: unlocked after defeating Hades at least once; adds challenges such as enemy stats and boss changes | Hades Wikipedia |
| "you can lower it again" | sections[4].a | UNSUPPORTED (true in the game) | The sources file says this comes from general knowledge. Heat is set again before each run, so the claim is correct, but no listed source says it. | none fetched |
| Ascension: up to 20 levels; unlocks after defeating an Act 3 boss with that character; costs such as stronger elites or lower health | sections[4].b | CONFIRMED | "Ascension is initially unlocked by defeating any Act 3 Boss on a given character"; max level 20; A3 "Elites are deadlier", A14 "Lower Max HP"; Wikipedia: "lower health or stronger enemy attacks" | https://slaythespire.wiki.gg/wiki/Ascension ; StS Wikipedia |
| Diagram: "None carried; each deck starts from scratch" | diagram.cells[1][1] | CONFIRMED (deck) | The deck is the fixed starter deck. See the WRONG row above for the Neow blessing. | library slay-the-spire `first30` |

## Library agreement

- Ascension: the library (ANALYSIS slay-the-spire, `escalate`) says Ascension opens "past a full clear". The draft's "after you defeat an Act 3 boss" is more exact and matches the wiki. Both are right; the draft is more precise.
- God Mode: the library (Hades `complaints`) says its resistance "grows with every death", which agrees with the draft.
- No disagreement found otherwise.

## Deepening check (against src/46-comparisons.js)

- All four existing sections are kept. The Ascension sentence from the old "How the game helps someone who keeps losing" (b) moved into the new section "How a winner makes the game harder". That is a correct move.
- All four existing sources are kept. Two were added (Neow and Ascension wiki pages).
- New sections: "The first loss" and "How a winner makes the game harder", plus a matrix diagram. This meets the minimum of two sections and a diagram.

## Missing coverage

- None against the brief. The new sections fit the problem.

## Teaching issues

- The internal contradiction above (3b against 4b) is the only real one. It also slightly weakens the verdict ("keeps every run equally risky"). The verdict can stand as a broad reading, but 4b should admit the Neow blessing.

## Code issues

- None (data only). The validator was not run by this check.

## Style

- No hype words, no US spelling found ("judgement" is used), and no employer or colleague names.

## Set aside

- The 2 percent increment has a known cap of 80 percent in the game. The draft does not state a cap, so there is nothing to flag.
- The "Risks" sections are judgement carried over from the existing text. They read as judgement and are reasonable.
- "Learned by play, as in any roguelike" (diagram) is judgement; the note marks the matrix as a summary.
- The Pact of Punishment also has one rank that changes rewards (not only danger). That level of detail is outside this section.
- The validator (`node src/validate.js` with PLAYABLE_DRAFTS) was not run here. The factcheck brief does not ask for it, and the writer's brief makes it the writer's check.
