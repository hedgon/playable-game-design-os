# Fact-check: compare-teaching-without-words (deepened)

**Verdict: PASS WITH FIXES** (minor)

Counts: WRONG 0, UNSUPPORTED 2, OUTDATED 0.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
| --- | --- | --- | --- | --- |
| Wake in a glass cell, a portal opens, you step through, no menu or prompt | sections[0].a | CONFIRMED (library) | Matches the library's Portal `first30` ("glass-walled Relaxation Vault"). Carried over. | src/14-references.js:24 |
| World 1-1: Mario at the left edge, control at once, no tutorial text | sections[0].b | CONFIRMED (library) | Matches the library's Super Mario `first30` | src/18-games-series.js:1346 |
| "The first Goomba is on the first screen" | sections[0].b | UNSUPPORTED | No source says this. The level opens with no enemy in view: the first Goomba walks in from the right as Mario reaches the first ? blocks. The library's `first30` says the timer is the only pressure "before a single enemy appears", which disagrees with "on the first screen". Suggested wording: "The first Goomba walks in within the first few seconds". The diagram's "Walk right; the first Goomba arrives" is already correct. | library src/18-games-series.js:1346 |
| Each chamber tends to add one idea, then combines it | sections[1].a | CONFIRMED (library) / judgement | Same wording as the library's Portal `why`, and marked "tends to". | library |
| Miyamoto: 1-1 lets players "gradually and naturally understand" | sections[1].b | CONFIRMED | Wikipedia | https://en.wikipedia.org/wiki/Super_Mario_Bros. |
| Repetition, variation, escalation; mushroom placed so it is hard to avoid | sections[1].b | CONFIRMED | "repetition, iteration, and escalation"; "the first mushroom is difficult to avoid if it is released" | Super Mario Bros. Wikipedia |
| Early chambers give near-solutions and many hints; guidance gone in the second half | sections[2].a | CONFIRMED | Wikipedia: "first hand-held in solving simple puzzles with many hints ... completely removed when the player reaches the second half". The page cites a 2008 instruction-librarian paper (Schiller), so it is an outside reading, not a Valve statement. The draft states it as fact, which the source supports. | Portal Wikipedia |
| Playtesters "forgot" the companion cube; Valve added dialogue and a heart | sections[3].a | CONFIRMED | Kim Swift on Wikipedia: "we added dialogue, applied the heart to the cube". The sources file says the heart is "not confirmed by the pages fetched". It is confirmed: the same Wikipedia passage gives it. | Portal Wikipedia |
| "the player almost always gets the Super Mushroom" | sections[3].b | UNSUPPORTED (overstated) | The source says the mushroom is hard to avoid *once released*. The player still has to hit the block. Suggested wording: "once the block is hit, the mushroom is hard to avoid". | Super Mario Bros. Wikipedia |
| Shimmering force field changed to glass; decorative detail removed | sections[4].a | CONFIRMED | Game Developer: "the first room initially featured a 'shimmery force field' and players didn't understand what it was -- so they changed it to glass"; Wikipedia: testers spent time on decoration, so it was reduced | https://www.gamedeveloper.com/pc/best-of-gdc-the-secrets-of-i-portal-i-s-huge-success ; Portal Wikipedia |
| Little cartridge memory; the Goomba is one image flipped | sections[4].b | CONFIRMED | "making a single static image and flipping it back and forth to save space" | Super Mario Bros. Wikipedia |
| Lessons rest on watching players (the risk) | sections[5].a | CONFIRMED / judgement | Swift: "Playtesting is probably the most important thing we did on Portal" | Game Developer |

## Library agreement

- Companion cube: the library (Portal `why`, src/14-references.js:24) says testers "ignored" the cube. The draft's "forgot" matches the source (Wikipedia, quoting Swift). **The draft is right; the library entry should change "ignored" to "forgot".**
- First Goomba: the library (Super Mario `first30`) implies the first screen has no enemy; the draft says the Goomba is on the first screen. The library is closer to the game (see the row above).

## Deepening check (against src/46-comparisons.js)

- All three existing sections are kept. The old sentence "Early rooms give many hints, and the support is slowly removed" moved into the new section "How the help is removed". Correct move.
- "ignored" became "forgot", which is a correct fix and is noted in the sources file.
- All three existing sources are kept. No new source was added; the new sections rely on the same three, which is enough.
- New sections: "How the help is removed", "What gets cut so the lesson is visible", "What each choice risks", plus a matrix diagram. This meets the brief. The old comparison had no "What each choice risks" section, and the brief requires one, so adding it was right.

## Missing coverage

- None against the brief.

## Teaching issues

- "Mario: the help is never removed because it was never written down" is marked "in our reading". That is acceptable.
- The Mario risk ("a player who waits, or who jumps early, may miss the mushroom") is judgement with no source. It reads as judgement. With the overstatement in 3b fixed, the two sections agree.

## Code issues

- None (data only). The validator was not run by this check.

## Style

- No hype words, no US spelling, no employer or colleague names.

## Set aside

- "Glass cell" against the library's "Relaxation Vault": same thing, different detail level.
- "Each test chamber tends to add one idea" is hedged and matches the library.
- Portal's chamber count (the library says 20, numbered 00 to 19) is not used in this draft, so it was not checked.
- The validator was not run here (writer's check per briefs/comparisons.md).
