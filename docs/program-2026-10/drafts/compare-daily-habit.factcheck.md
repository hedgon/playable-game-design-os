# Fact-check: compare-daily-habit (deepened)

**Verdict: PASS WITH FIXES**

Counts: WRONG 1, UNSUPPORTED 0, OUTDATED 2.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
| --- | --- | --- | --- | --- |
| One word a day, same for everyone, no replay | sections[0].a | CONFIRMED | Wikipedia; library wordle | https://en.wikipedia.org/wiki/Wordle |
| Five-life cap | sections[0].b | CONFIRMED | "players begin with five 'lives', lost whenever a level is failed" | https://en.wikipedia.org/wiki/Candy_Crush_Saga |
| Six guesses at a five-letter word | sections[1].a | CONFIRMED | "six attempts" | Wordle Wikipedia |
| Lives come back one every half hour; wait or pay | sections[1].b | CONFIRMED | "a life is restored every half-hour"; gold buys "new lives, extra moves, boosters or to unlock a new episode" | Candy Crush Wikipedia |
| Players shared hand-made grids first; Wardle built in the share button | sections[2].a | CONFIRMED | Wikipedia: friends in New Zealand made an emoji-style display, which Wardle incorporated | Wordle Wikipedia; library wordle `why` |
| "grew from 90 on 1 November 2021 to over 300,000 by 2 January 2022, and then to about 2 million weekly players" | sections[2].a | **WRONG** | Wikipedia: "from 90 players on November 1, 2021, to over 300,000 by January 2, 2022, and more than 2 million a week later." "A week later" is a date (about 9 January), not a weekly-player measure, and "more than" is not "about". The existing text ("over 2 million by early January 2022") was right, and so is the library ("more than two million by 9 January 2022"). The writer's "CORRECTION" in the sources file misread the sentence. Suggested wording: "from 90 on 1 November 2021 to over 300,000 by 2 January 2022, and more than 2 million a week later." | Wordle Wikipedia; library src/14-references.js:20 |
| Friends can be asked for lives | sections[2].b | CONFIRMED | "users can either send requests to their Facebook friends for more lives". The sources file says this is unconfirmed; the same Wikipedia page confirms it. | Candy Crush Wikipedia |
| Free, no ads or accounts at first; NYT bought it 31 January 2022 for a low seven-figure sum | sections[3].a | CONFIRMED | "January 31, 2022", "an undisclosed price in the low-seven figures" | Wordle Wikipedia |
| "it stays free to play with no ads" | sections[3].a | **OUTDATED** | Wordle is still free, but it is no longer ad-free. The NYT added desktop ads in September 2022 and mobile-web interstitial video and display ads for non-subscribers in July 2023. Suggested wording: "It stays free to play; since 2022 the New York Times shows ads to players who do not subscribe." | https://marketingdive.com/news/new-york-times-wordle-new-mobile-ad-format-doordash/685073 |
| About 2.3 percent of players pay | sections[3].b | CONFIRMED (dated figure, labelled) | "only 2.3% pay". This is an early figure, hedged as "by one count". | Candy Crush Wikipedia |
| Wardle began the game as a gift for his partner | sections[4].a | CONFIRMED | Wikipedia; library wordle `why` | Wordle Wikipedia |
| "The answers come from a curated list of 2,309 words" | sections[4].a | **OUTDATED** (in this context) | The section is about how the designers decide, and it puts this beside Wardle. Wardle's list had 2,315 answers. 2,309 is the count after the NYT removed words ("seven words had been removed from the original 2,315" by July 2022). Since late 2022 an NYT editor picks each day's word, which the library also notes. Suggested wording: "Wardle's answer list was 2,315 familiar words, filtered by his partner; the New York Times later trimmed it and now has an editor choose each word." | Wordle Wikipedia; library wordle `why` and `complaints` |
| King measures time to pass and time to abandon; fixes its 100 least engaging levels; "crazy hard levels never pay off, at least in the long term" | sections[4].b | CONFIRMED | Article: King "identify the 100 least fun levels in the game, and set about fixing them", "rinsing and repeating this process"; the quote is Wedekind's. "Regularly" is a fair reading of "rinsing and repeating"; "least engaging" for "least fun" is close enough. | https://mobilegamer.biz/how-king-defines-a-good-candy-crush-saga-level-and-why-it-constantly-prunes-the-bad-ones/ |
| Out of moves or lives, the game offers more for gold; the UK OFT investigated mechanics aimed at younger players | sections[5].b | CONFIRMED | Wikipedia: the OFT investigated "exploitative game mechanics with regards to younger users". The OFT inquiry (2013) covered children's online and app games across the industry, not Candy Crush alone. The draft does not say it targeted King, so this is fine. | Candy Crush Wikipedia |
| King says unfair levels lose players | sections[6].b | CONFIRMED | Same mobilegamer.biz quote | mobilegamer.biz |

## Library agreement

- Player growth: **the library is right** ("more than two million by 9 January 2022"); the draft is wrong (see above).
- Answer list: the library says Shah filtered about 13,000 words down to about 2,000. This agrees with Wikipedia. The draft's 2,309 is the later, NYT-edited count (see above).
- Lives: the library (ANALYSIS candy-crush-saga `fair`) says "a life is never lost while a level is still in progress". The draft does not repeat this, so the two do not conflict. Outside this check: in the game, quitting a level partway through also costs a life, so the library sentence may need a look.

## Deepening check (against src/46-comparisons.js)

- All four existing sections are kept. Two had changes:
  - "How the game spreads" (a): a correct sentence ("over 2 million by early January 2022") was replaced with a wrong one. **Restore the meaning of the original.**
  - "How the game earns" (a): the NYT date and price were added (correct), with "no ads" (outdated).
- All three existing sources are kept. No source was added, so the outdated "no ads" has nothing behind it. Add the Marketing Dive URL (or similar) with the fix.
- New sections: "How long one visit lasts", "How the designers decide what to change", "What each choice risks", plus a matrix diagram. A fourth topic, `return-and-quit`, was added; it exists (src/20-topics-player.js). This meets the brief.

## Missing coverage

- None against the brief.

## Teaching issues

- Diagram "Paid by": "Nobody at first; later a newspaper" ignores the ads. With the fix it could read "Nobody at first; later a newspaper, with ads".
- The Wordle "risk" (little to do after the first week) is judgement and reads as such.

## Code issues

- None (data only). The validator was not run by this check.

## Style

- "coloured" (British), no hype words, no employer or colleague names.

## Set aside

- The 2.3 percent paying figure is old (about 2014), but it is labelled "by one count". Not flagged.
- "Spread follows the store charts and the social ask" is judgement carried over from the existing text.
- "A visit takes a few minutes" is judgement and plausible.
- The share feature's exact date (Wikipedia mentions both mid-October and late-December virality) is not stated in the draft.
- The validator was not run here (writer's check per briefs/comparisons.md).
