# Fact-check: balance-patches-in-a-live-game (overwatch vs street-fighter)

**Verdict: FAIL** (it can be fixed. Three Overwatch claims are wrong or outdated, and one
headline number is wrong. Together they reverse the comparison's main contrast, so the draft
should be rewritten in those places and checked again before it is integrated.)

New comparison (no existing `balance-patches-in-a-live-game` in `src/46-comparisons.js`), so
the "dropped section or source" check does not apply.

Counts: WRONG 3, UNSUPPORTED 3, OUTDATED 2.

Most serious: section 4a, the matrix row "Old version" and the verdict all say an Overwatch
player "has no way back" to an old version. Blizzard ran **Overwatch: Classic** (12 November to
2 December 2024). It reset the game to the May 2016 launch balance and 6v6, with later stages
taken from earlier metas. Section 3a also says the roster "keeps its names and roles", and that
team shape changed only through the 2019 Role Queue. Overwatch 2 cut teams to 5v5 with one tank
and moved Doomfist from damage to tank (2022). Since February 2026 it has also split roles into
sub-roles with their own passives.

## Claims

| Claim (short) | Location | Verdict | Correct value | Source |
| --- | --- | --- | --- | --- |
| Team tuned heroes "by monitoring meta-game statistics and user feedback" | sections[0].a | CONFIRMED | Exact wording on Wikipedia | https://en.wikipedia.org/wiki/Overwatch_(video_game) |
| "Overwatch 2 ... seasons, main pass at the start, smaller one around the middle" | sections[0].a, matrix | CONFIRMED, **OUTDATED name** | Mid-season patch around weeks 4 to 5 is still reported for 2026. But from 10 February 2026 the game is called **Overwatch** again, with seasons renumbered from Season 1 and six seasons a year. Write "Overwatch (sold as Overwatch 2 from 2022 to 2026)" | godisageek 2026-02 https://godisageek.com/2026/02/overwatch-2026-drops-2-reign-of-talon-launch-feb-10/ ; wccftech "We're dropping the 2". The writer's esportnow.gg is a snippet only; prefer Blizzard's patch-notes page https://overwatch.blizzard.com/en-us/news/patch-notes/ (not fetched) |
| Champion Edition Mar 1992, Hyper Fighting Dec 1992, Super Sep 1993, Super Turbo Feb 1994 | sections[0].b | CONFIRMED | | https://en.wikipedia.org/wiki/Street_Fighter_II |
| SF6 patches: some touch a few characters, others most of the roster | sections[0].b | CONFIRMED | Feb 2024: "a handful" (about 6). May 2024 (Version 202405): all 21 then in the game. Sept 2024 (Terry): 20 of 24 | EventHubs 2024-02-26; Shacknews Version 202405 notes; EventHubs 2024-09-24, which links Capcom's official list https://www.streetfighter.com/6/buckler/battle_change |
| Matrix: "some patches change 13 characters" | diagram.cells[1][1] | **WRONG** | The cited Feb 2024 patch changed a handful (JP, Ken, Ryu, Jamie, Zangief and about one more), not 13. Use a real figure: "the May 2024 patch changed all 21" or "Sept 2024: 20 of 24" | EventHubs 2024-02-26; Shacknews 202405 |
| Swap hero at spawn | sections[1].a | CONFIRMED (library) | | src/18-games-genres.js overwatch `verb`, `signature.mechanism` |
| Champion Edition rebalanced power levels; Hyper Fighting raised speed, new special moves | sections[1].b | CONFIRMED | | SF II Wikipedia |
| "The roster keeps its names and roles" | sections[2].a | **WRONG** | Doomfist moved from damage to tank for Overwatch 2 (2022), with a rebuilt kit (health 250 to 450). Orisa was also reworked. 2026 added sub-roles with passives | PC Gamer "Doomfist is a tank in Overwatch 2, Blizzard confirms"; Game Informer 2022-03-23; godisageek 2026-02 |
| Team shape changed by a rule, "the 2-2-2 Role Queue of 2019, and not with a hero number" | sections[2].a | **WRONG** (incomplete in a way that misleads) | Role Queue 2019 is right (library). But the biggest team-shape change was Overwatch 2's 5v5 with one tank per team (October 2022). That was also a rule, so the point survives, and the sentence should name it | Overwatch Wikipedia: "moving to a five-versus-five PvP mode ... only allowing one tank"; library overwatch `complaints`, `signature.mechanism` ("six, or five in Overwatch 2") |
| Six-button, motion-input grammar stays through every revision | sections[2].b | CONFIRMED, qualify | True for Classic controls. SF6's Modern controls (2023) let a player skip motions. Say "under Classic controls" here, since section 6b raises Modern | Library street-fighter `why`, `complaints` |
| Overwatch: one version; "no way back"; old numbers "survive only in memory and patch notes" | sections[3].a, matrix cells[2][0], verdict | **OUTDATED** | Overwatch: Classic (12 Nov to 2 Dec 2024) restored the Patch 1.0 (May 2016) balance and 6v6 with the original 21 heroes, then later historic metas ("Moth Meta", "Goats"). 6v6 queues also returned in 2024 and 2025. Old versions can come back, for a limited time | VGC "Overwatch: Classic event brings back the original heroes, abilities and maps"; Dexerto Overwatch Classic dates |
| Arcade era: several versions at once; players guessed which to learn | sections[3].b | CONFIRMED (library) | | Library street-fighter `complaints` |
| SF6 runs one current version | sections[3].b | CONFIRMED (inference, sound) | Note that SFIV (Super, Ultra) and SFV (Arcade Edition 2018, Champion Edition 2020) still shipped named versions in the online era, so "mostly replaced" is right and "SF6 also" is the accurate case | general; not fetched |
| Blizzard publishes patch notes for each season and mid-season patch | sections[4].a | UNSUPPORTED (no source in draft) | True to the checker's knowledge. Add https://overwatch.blizzard.com/en-us/news/patch-notes/ | none in draft |
| Capcom publishes patch notes listing changes by character | sections[4].b | CONFIRMED | | Capcom battle_change page, linked from EventHubs |
| "Wikipedia says the SF II team did not particularly prioritise balance" | sections[4].b | CONFIRMED, attribution loose | Wikipedia reports one person's view ("He primarily ascribes the game's success to its appealing animation patterns"). Name him, or write "one of the developers later said" | SF II Wikipedia |
| "...a reminder that announcing adjustments to a whole roster is a later habit" | sections[4].b | UNSUPPORTED | The draft's own section 1b says Champion Edition rebalanced the roster in 1992. Nothing supports "later habit". Mark it as judgement or cut it | none |
| A fast cadence invites chasing the meta | sections[5].a | judgement, marked | | |
| Wide patch resets matchup knowledge | sections[5].b | UNSUPPORTED (unmarked judgement) | Reasonable, but no source. Mark "(judgement)" or cite community reaction to the May 2024 patch | none |
| SF6 Modern controls sparked a debate on shortcut cost | sections[5].b | CONFIRMED (library) | | Library street-fighter `complaints` |

## Disagreements with the library

- **overwatch** (`series.n`: "first entry, replaced by Overwatch 2 in 2022"): this is now
  outdated too. Since 10 February 2026 the live game is called Overwatch again. The library is
  right on Role Queue 2019 and on five-a-side in Overwatch 2. The draft drops the second fact,
  and the library is right there.
- **street-fighter**: the draft agrees with the library (revisions, six-button floor, Modern
  controls debate). The library says the six-button floor "stayed the one thing every new
  player has had to learn". With Modern controls, that is true of the layout but not of the
  motions. This is a library nuance and does not need a fix in the draft.

## Missing coverage

- Six sections including "What each choice risks", three linked topics, diagram labelled
  as a summary: shape is fine.
- No developer source for either game. Every Overwatch cadence claim rests on a press snippet.
  Add Blizzard's patch-notes page and, for SF6, Capcom's battle_change page. Developer
  statements on why a hero was changed (Blizzard's director's posts, Capcom's adjustment
  overviews) would give section 5 ("How the reason is told") real content. Today 5a says
  only that notes exist.
- The comparison never mentions that Overwatch 2's hero reworks (Doomfist, Orisa, Sombra)
  and its 2026 sub-roles change a hero's **rules**, not only its numbers. This is the strongest
  counter-example to the principle "keep fixed what the player learned with their hands".
  The verdict should account for it.

## Code issues

None (no code).

## Teaching issues

- Once the facts are corrected, the main contrast ("Overwatch: one version, no way back" vs
  "Street Fighter: versions once coexisted") no longer holds as written. Overwatch has brought
  old versions back as events, and both games now run one live version. The real difference
  the draft could teach: Overwatch changes team rules and hero roles, while Street Fighter
  keeps its input grammar and adds an optional control scheme.
- Section 1a "Every player gets the same version on the same day" is fine as a general rule.

## Style

British spelling ("prioritise", "offence"). No hype words. No owner employer, colleague or
internal project named.

## Set aside

- Role Queue year 2019: confirmed by the library, not re-fetched (Wikipedia page does not
  state it); well known as Season 18, September 2019.
- Exact 2026 season length: not stated in the draft, so not checked.
- Whether Overwatch: Classic has recurred in 2025 or 2026: not needed; one instance disproves "no way back".
- `games:['overwatch','street-fighter']` using a SERIES id: the writer reports validation
  passes apart from the shelf, so this was not re-run.
- "Frame data, damage or a move's properties": a general description, true.
- esportnow.gg week 4 to 5 mid-season figure: matches the 2026 press report, kept.
