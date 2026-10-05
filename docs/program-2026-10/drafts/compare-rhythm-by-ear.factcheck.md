# Fact-check: compare-rhythm-by-ear

Checked 2026-10-05 against `drafts/compare-rhythm-by-ear.js`, its `.sources.md`, `briefs/comparisons.md`, the
library entries `rhythm-heaven` (src/18-games-series.js:4108) and `rhythm-doctor` (src/18-games-innovative.js:1148),
and the earlier fact-checks `drafts/rhythm-heaven.factcheck.md` and `drafts/rhythm-doctor.factcheck.md`.
Pages fetched this session: Game Developer interview with the Rhythm Doctor team, the GamingTrend team interview,
and the Steam page for app 774181 (raw HTML, including the accessibility flags). Rhythm Heaven facts were checked
against the rhythm-heaven fact-check table (Wikipedia pages and Iwata Asks, fetched there) and not re-fetched.

This is a new comparison (the id is not in src/46-comparisons.js), so the "dropped section" check does not apply.
Validator: `PLAYABLE_DRAFTS=docs/program-2026-10/drafts/compare-rhythm-by-ear.js node src/validate.js` gives one
error naming it: `comparison rhythm-by-ear: on 0 shelves, expected 1`. That is an integration step (shelf
placement) for the coordinator, not a draft defect. All topic ids now exist in src (the sources file still says
they are drafts; that note is out of date).

## Verdict: PASS WITH FIXES

The comparison repeats, for Rhythm Doctor, the claim the library fact-check already rejected: that the player
"always presses one button on the seventh beat". The library entry was corrected to "the input and the
seventh-beat core stay fixed; beat types vary", and this draft has to follow it in one section, the diagram and
the verdict. Two smaller factual fixes and a heading that does not match its content. Everything else matches the
library and the sources.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
| --- | --- | --- | --- | --- |
| "The player always presses one button on the seventh beat"; "keeps the rule" | sections[1].b, diagram cells[1][1] ("the seventh beat, always"), verdict | WRONG | Fixed are the one button and the seventh-beat core. The game also has two-beat SVT rows, held beats (hold the spacebar), silent beats and frozen (delayed) beats. The library entry says exactly this. Write "always one button, and a seventh-beat core that new beat types bend"; in the verdict, "keeps the input and the core count". | Game Developer interview ("two-beat 'SVT beats'", "held beats require the player to hold the spacebar", "pulses frozen in ice"); library rhythm-doctor signature.mechanism; rhythm-doctor.factcheck.md row 1 |
| Rhythm Heaven "the input is one or two buttons" | sections[1].a, diagram cells[1][0] | WRONG | True of GBA, Wii and Switch; the DS entry uses the stylus (taps, holds, drags, flicks) and the 3DS offers buttons or touch. The library says "one or two inputs". Write "one or two inputs". | Library rhythm-heaven `constant`, `changed`, signature.mechanism; WP Rhythm Heaven (DS) |
| Level 2-X: the game window moves across the desktop | sections[3].b | CONFIRMED | Source missing from the list: the sources file credits Game Developer, which does not mention it. Add the GamingTrend interview to `sources`. | GamingTrend interview (Window Dance, NotITG) |
| Tsunku proposed in 2004 a rhythm game without visual indicators | sections[0].a | CONFIRMED | | WP Rhythm Tengoku (via rhythm-heaven.factcheck.md) |
| No note lane, no score counter | sections[0].a | CONFIRMED | Library signature / first30 | Library rhythm-heaven |
| Six-beat count-in, press on the seventh, spacebar | sections[0].b | CONFIRMED | Steam: "on the 7th beat" | Steam store page |
| Early levels show the count as a number | sections[0].b | CONFIRMED | TouchArcade TGS 2017 preview ("numbers count off on the meter") | TouchArcade; library rhythm-doctor ui lens |
| Most minigames open with practice or demonstration | sections[2].a | CONFIRMED | | WP DS; library |
| DS needs at least OK to go on | sections[2].a | CONFIRMED | | WP Rhythm Heaven (DS) |
| Most RD levels open with a tutorial on a new beat type; red crosses for silent beats | sections[2].b | CONFIRMED | | WP Rhythm Doctor; Game Developer ("huge red X's where the pulses are silent") |
| Developers say the animations make each beat type readable | sections[2].b | CONFIRMED | Azman contrasts the staccato seven-beat pulses with the SVT "big bubble" so rows can be told apart | Game Developer |
| Each set ends in a remix | sections[3].a | CONFIRMED | | WP Rhythm Tengoku; WP DS |
| Swing, second row, irregular bars, silent beats, shake, flips, colour changes | sections[3].b | CONFIRMED | | Game Developer; Steam About (polyrhythms, irregular time signatures); library |
| Developers aim for every mechanic to be playable blind without memorisation | sections[4].b | CONFIRMED | "make all the mechanics be playable blind, without ever requiring assistance from someone sighted nor memorization" | Game Developer |
| Steam lists playable without vision, difficulty levels, narrated menus, background volume controls | sections[4].b, sections[5].b | CONFIRMED | Steam accessibility flags: PlayableWithoutVision, DifficultyLevels, NarratedMenus, BackgroundVolumeControls all true | Steam store page (raw HTML) |
| Flashing lights and colours warning | sections[5].b | CONFIRMED | | Steam About |
| Press judged against audio, not picture | sections[4].b | CONFIRMED as marked inference | Correctly labelled "we infer, and no developer says it" | Library rhythm-doctor sound lens |
| Megamix input timing gauge | sections[5].a | CONFIRMED | | WP Megamix |
| Groove text-to-speech narration for visually impaired players | sections[5].a | CONFIRMED | | WP Groove (via rhythm-heaven.factcheck.md row 75) |
| Groove criticised for input delay in docked TV play | sections[5].a | CONFIRMED (secondary) | Nintendo Life, Shacknews (worse even after calibration), relayed by Wikipedia | Library rhythm-heaven complaints; WP Groove |
| "We did not verify which latency settings the game offers" | sections[5].b | CONFIRMED (honest gap) | The Steam page mentions latency only for Remote Play 2P, not calibration | Steam About |
| Fever team "about three times as large, comparatively speaking", in Iwata's words | sections[6].a | CONFIRMED | Attribution now correct (the library draft had it wrong, fixed) | Iwata Asks Fever p4 (via rhythm-heaven.factcheck.md row 62) |
| Rating Try Again / OK / Superb | sections[6].a | CONFIRMED | | WP Rhythm Tengoku |
| A player "can close their eyes and still land the press" | sections[4].a | CONFIRMED as marked judgement | "In our reading", and the library ui effect says the same | Library rhythm-heaven |

## Missing coverage

Against the brief: 7 sections (within 5-7), a "What each choice risks" section, a matrix diagram within limits
(row labels at most 11 characters per word, two columns, cells under 70 characters), verdict, principle, two
topics (both existing). Nothing on the "Must cover" shape is missing.
- The section on help is thin on the ear side: only the Megamix gauge helps a player who cannot rely on hearing
  well; see the teaching issue below.

## Code issues

None (no code).

## Teaching issues

1. Heading "Help for a player who cannot use the ear" does not match its content: Groove's text-to-speech and
   Rhythm Doctor's narrated menus help players who cannot see, not players who cannot hear. Rename to "Help beyond
   the default cue" (or "Accessibility and assists"), or split into what helps the eye-less player (narration,
   playable without vision) and what helps the ear-less or lag-affected player (Megamix gauge; calibration, not
   verified for either game).
2. "A laggy display or a noisy room changes the beat the player answers" (sections[6].a): a noisy room masks the
   cue, it does not move it. Write "a laggy display shifts the beat the player answers, and a noisy room hides it".
3. The verdict's "Rhythm Doctor keeps the rule" carries the WRONG claim above into the lesson; once fixed, the
   contrast is sharper: Rhythm Heaven changes the rule per minigame, Rhythm Doctor keeps the input and adds rules
   one at a time.

## Agreement with the library

Agrees with both entries except the two WRONG rows: on the seventh beat the library (corrected after its
fact-check) is right; on Rhythm Heaven's input the library (`constant`: "one or two inputs"; DS stylus) is right.

## Style

No hype words, UK spelling throughout, no names of the owner's employer, colleagues or projects.

## Set aside

- Iwata Asks, Wikipedia Rhythm Heaven pages not re-fetched: the rhythm-heaven fact-check fetched them today and
  confirmed each claim reused here.
- "Each minigame has its own song, its own scene and its own timing idea": generalisation matching the library;
  not a checkable figure.
- "The rule inside one game does not grow": the library says the rule never changes within a game; consistent.
- "Some players find [the disruption] tiring or unfair": library complaints, reviewer paraphrase; acceptable as
  stated.
- Shelf error from the validator: integration, not content.
- "Frozen beats" not mentioned: optional detail, not needed for the argument.
