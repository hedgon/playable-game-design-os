# Fact-check: compare-charting-by-hand

Checked 2026-10-05 against `drafts/compare-charting-by-hand.js`, its `.sources.md`, `briefs/comparisons.md`, the
library entries `beat-saber` (src/18-games-genres.js:5799) and `rhythm-doctor` (src/18-games-innovative.js:1148)
and `drafts/rhythm-doctor.factcheck.md`. Fetched this session: Wikipedia "Beat Saber", the Voices of VR #644
transcript (Beck), the BSMG wiki intermediate-mapping page, the Game Developer Rhythm Doctor interview, the
GamingTrend Rhythm Doctor interview and the Steam page for app 774181.

New comparison (not in src/46-comparisons.js), so the "dropped section" check does not apply.
Validator: one error naming it, `comparison charting-by-hand: on 0 shelves, expected 1` (integration). Both
topic ids exist in src.

## Verdict: PASS WITH FIXES

Two claims misread their sources: the BSMG wiki's "mapper blindness" is not about charting every sound, and
Beck's watching "videos of the levels" did not mean music and charts were shaped together. One sentence repeats
the rejected "presses on the seventh beat of each row". One quoted developer statement needs its source added.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
| --- | --- | --- | --- | --- |
| Four columns, three rows; red left, blue right; eight cut directions | sections[0].a | CONFIRMED | "12 possible positions of a 4x3 grid", "one of eight possible directions" | WP Beat Saber |
| RD: rows from patient to heart; "the player presses on the seventh beat of each" | sections[0].b, diagram cells[0][1] | WRONG (minor) | Two-beat SVT rows and held beats exist, as the next sentence half-admits. Write "most rows end in a press on the seventh beat" and in the diagram "A press on the row's beat, usually the seventh". | Game Developer interview; library rhythm-doctor signature.mechanism |
| Levels made by hand for each song | sections[1].a | CONFIRMED | Beck: "the levels will be specially made just for the music and just for the track" | Voices of VR #644 |
| Beck wrote the launch music watching videos of the levels, "so the music and the charts were shaped together" | sections[1].a | WRONG | Beck watched a video of the level's visual space with random placeholder notes and composed "for the space I seen"; the charts were then made for the finished track. Write "Beck composed while watching videos of each level's stage, with placeholder notes, and the charts were then made for each track". | Voices of VR #644 |
| Level editor added May 2019 | sections[1].a | CONFIRMED | "announced for release in May 2018 ... postponed, and added in May 2019" | WP Beat Saber |
| Hafiz Azman writes the music with sound designer s9menine | sections[1].b | CONFIRMED | Source missing from `sources`: add the GamingTrend interview | GamingTrend interview |
| RD editor with 50+ visual effects and backgrounds | sections[1].b | CONFIRMED | "use 50+ different visual effects and backgrounds" | Steam About |
| Effects "can be timed to the music" | sections[1].b | CONFIRMED in part | Steam says notes are "snapped to the beat" in the editor; effect timing is the library's art-lens reasoning. Acceptable. | Steam About; library art lens |
| A down swing followed by an up swing; arm flow | sections[2].a | CONFIRMED | BSMG: flow is "the relation between sequences of notes" (parity) | BSMG intermediate mapping; library fair |
| One new beat type at a time, own look, tutorial before tested; boss levels combine | sections[2].b | CONFIRMED | "Each beat type is taught in a short tutorial" slightly overstates "most levels open with a tutorial"; write "Most beat types". | WP Rhythm Doctor; Game Developer; library escalate |
| Colour gives hand, arrow gives swing; X where a wrong cut was | sections[3].a | CONFIRMED / UNSUPPORTED | Colour and arrow: WP. The X on a bad cut is in the library teach lens but in no listed source. Low risk; cite one or keep as is. | WP Beat Saber; library |
| "Experienced players read dense patterns without looking away from the track" | sections[3].a | UNSUPPORTED | No source. Cut or mark as our reading. | none |
| Heartbeat line, number on early rows, picture later shaken or hidden; inference marked | sections[3].b | CONFIRMED | Inference correctly labelled | TouchArcade; library |
| Difficulties up to Expert+; speed and density; crossovers, streams, walls to duck; rules unchanged | sections[4].a | CONFIRMED | Walls: "the player's head should avoid" (WP). Expert+ is the game's top difficulty; Voices of VR lists Easy to Expert plus a harder tier. | WP; Voices of VR; library escalate/fair |
| Level 2-X: the window moves around the desktop | sections[4].b | CONFIRMED | | GamingTrend |
| "The developers say that in this gimmick the goal is to make you lose the beat" | sections[4].b | CONFIRMED | Azman: "in our game the gimmick is more to impress you enough that you lose the constant beat that you're supposed to be playing". Not in Game Developer, which the sources file implies; add GamingTrend to `sources`. | GamingTrend interview |
| BSMG wiki: charting every sound makes an unreadable level, "which it calls mapper blindness" | sections[5].a | WRONG | Two different terms. Mapper blindness: a mapper cannot see readability problems in their own map because they already know the intended motion. Overmapping: placing notes "when there are no identifiable sounds". Rewrite: "The community wiki warns of mapper blindness, where a mapper cannot see what is unreadable in their own map because they know the intended motion, and of overmapping, notes placed where there is no sound to follow." | BSMG intermediate mapping |
| Advises testing with fresh players | sections[5].a | CONFIRMED | "fresh testplays from players who have not seen the map before" | BSMG |
| Advises building easier charts down from harder ones | sections[5].a | CONFIRMED | Downmapping: "taking your top difficulty, and then breaking it down" | BSMG |
| Play with the picture hidden: our suggestion | sections[5].b | CONFIRMED as marked | | none needed |
| Big-swing scoring tires arms and shoulders; Expert charts read as streams of arrows | sections[6].a | CONFIRMED (library) | Library complaints; reviewer-based, not re-read (the writer says so) | Library beat-saber complaints |
| Flashing lights warning | sections[6].b | CONFIRMED | | Steam About |
| "Every effect is spent on difficulty, so less is spent on clarity" | sections[6].b | UNSUPPORTED (unmarked judgement) | The sources file calls it our reading; the text does not. Add "In our reading". | Library art cost (reasoning) |

## Missing coverage

7 sections, a "What each choice risks" section, a matrix diagram within limits (with an honest note on the last
row), verdict, principle, two existing topics. Nothing required is missing.
- Thin: no named Beat Saber song or map and no named Rhythm Doctor level besides 2-X. One named chart on each side
  would meet the brief's "concrete thing" better.

## Code issues

None.

## Teaching issues

1. The mapper-blindness error (above) teaches the wrong lesson: the real one is that the author is the worst
   tester of readability, which is exactly what the principle ("test with a fresh player") needs. The fix
   strengthens the section.
2. The Beck sentence implies music and chart were co-authored; the source shows a sequence (stage, then music,
   then chart). The sequence is the more useful lesson for a reader charting their own songs.

## Agreement with the library

Agrees with both entries, except the seventh-beat sentence, where the corrected library entry is right. The
library's Beck line ("composed while watching videos of the levels") is literal and fine; only the draft's added
inference is wrong.

## Style

No hype words, UK spelling, no owner-employer or colleague names.

## Set aside

- BSMG ranking guide and the PlayStation Blog lighting article not re-fetched: no sentence here depends on them
  beyond what other fetched pages confirm.
- "The rules do not change between difficulties": the library fair lens says so; matches the game.
- "Experts can feel like reading a stream of arrows": library complaint; kept as reviewer-based.
- Diagram cells "Taught by" for Beat Saber ("Colour and arrow on the block"): a fair summary of the teach lens.
- Validator shelf error: integration.
