# Fact-check: rhythm-heaven (SERIES)

Checked 2026-10-05 against `drafts/rhythm-heaven.js`, `rhythm-heaven.sources.md`,
`rhythm-heaven.shots.md`, `briefs/games.md` (section `rhythm-heaven`) and the rubric in
`docs/references/analysis-method.md`.

Primary pages read raw with curl: Wikipedia wikitext (`action=raw`) of Rhythm Heaven
(series), Rhythm Tengoku, Rhythm Heaven (DS), Rhythm Heaven Fever, Rhythm Heaven Megamix,
Rhythm Heaven Groove, Melatonin, Rhythm Doctor and WarioWare, Inc.; all six pages of Iwata Asks
for Rhythm Heaven Fever (`/interviews/wii/rhythmheavenfever/0/0` to `0/5`); the Famitsu weekly
sales article of 17 Sep 2026 (famitsu.com/article/202609/88346); the Siliconera Bits & Bops
review; the Nintendo World Report Melatonin review; the Nintendo US store page for Groove;
LaunchBox pages. Pages I could not load: Metacritic (Cloudflare 403), OpenCritic (connection
failed), Steam (connection reset). Scores and the Bits & Bops price rest on Wikipedia's
citations, not on the aggregator or store page.

Validation: `PLAYABLE_DRAFTS=<five new topic drafts>,docs/program-2026-10/drafts/rhythm-heaven.js node src/validate.js`
reports only the expected image-missing errors (header and e1 to e5) and
`DRAFT not in any learning path (game): rhythm-heaven`. Every lens topic resolves.

## Verdict: PASS WITH FIXES

The structure, rubric coverage and most of the facts hold. Fix these before integration:
two developer statements that the interview does not support; the Eurogamer attribution;
the Bits & Bops count; the outdated chart run; an unsupported medical claim about Groove;
and the business lens claim that Groove's same-day worldwide release contradicts. Add
Groove's docked-play latency criticism, which reviewers made and which the draft's own
audio-chain argument needs.

## Claims

| Claim (short) | Field | Verdict | Correct value / note | Source |
| --- | --- | --- | --- | --- |
| Tengoku 3 Aug 2006, GBA, Japan only | entries[0], first30 | CONFIRMED | | WP Rhythm Tengoku infobox |
| Eight sets of six, the sixth a remix; Try Again / OK / Superb | entries[0], gameplay | CONFIRMED | 48 games, 8 sets of 6 | WP Rhythm Tengoku; WP series |
| Tsunku proposed in 2004 a rhythm game not relying on visual indicators; Osawa feared niche appeal | reception[0], ui | CONFIRMED | | WP Rhythm Tengoku, Development |
| Rhythm Tweezers: real face replaced by onion, "a little too gross" | art | CONFIRMED | | WP Rhythm Tengoku |
| Japan Media Arts Festival Excellence Prize for Entertainment 2006 | reception[0] | CONFIRMED (secondary) | 10th festival | WP Rhythm Tengoku, WP series |
| "Eurogamer's staff named / called it the best Game Boy Advance game of 2006" | complaints, reception[0] | WRONG | One Eurogamer writer (Tom) called it the best GBA game of the year; the staff ranked it 36th best game of 2006 | WP Rhythm Tengoku, Reception |
| Critics noted length and replay value | complaints, reception[0] | CONFIRMED | GameSpy (not long enough), CVG (lacked replay value and length) | WP Rhythm Tengoku |
| DS: Japan 31 Jul 2008, abroad 2009, first entry released outside Japan | entries[1], business | CONFIRMED | NA 5 Apr 2009, EU 1 May 2009 | WP Rhythm Heaven (DS) |
| DS: taps, holds, drags, flicks | entries[1], signature | CONFIRMED | | WP DS, Gameplay |
| DS: 50 minigames in 10 sets of four plus a remix | gameplay | CONFIRMED | Series page: 10 sets of 5 including 1 remix (same total) | WP series |
| DS: at least OK to progress | signature.teach, replay | CONFIRMED | "Just OK" or "OK" | WP DS |
| Flick took about six months to make feel fair | reception[1] | CONFIRMED | 2-3 months research plus 6 months to adapt | WP DS, Development |
| DS Metacritic 83 (48 reviews); Wired "novel, deep and challenging" | reception[1] | CONFIRMED (secondary) | Metacritic not loadable | WP DS |
| DS 3.04 million by Dec 2014, best-selling entry | reception[1], business | CONFIRMED | Best-selling on the figures available (Fever has only a Japan figure) | WP DS; WP series sales table |
| Some reviewers felt it did not surpass the first game | reception[1] | CONFIRMED | 1Up's Jeremy Parish | WP DS |
| English re-recordings; European languages | sound, business | CONFIRMED | French, German, Italian, Spanish | WP DS, Music |
| Fever: Japan 21 Jul 2011, abroad 2012 | business | CONFIRMED | | WP Fever |
| Fever: A and B only, 40 minigames, 10 remixes, co-op | entries[2], gameplay | CONFIRMED | | WP Fever; WP series |
| Fever Metacritic 83 (56); Destructoid 9.5; Giant Bomb 5/5; 100,000+ first week Japan | reception[2] | CONFIRMED (secondary) | | WP Fever |
| Fever 0.72 million Japan | business | CONFIRMED (secondary) | Famitsu white paper 2013 per WP | WP series sales table |
| Motion rejected as "too strenuous and imprecise" (per developers) | changed, reception[2] | CONFIRMED in part | "Strenuous" is in Iwata Asks (hands got tired). "Imprecise" is not in the interview; WP says buttons were chosen as "more accurate". Write "tiring, and less accurate than buttons" | Iwata Asks Fever p1; WP Fever, Development |
| 2D kept because it is snappier than 3D | ui, art, reception[2] | CONFIRMED | 2D "responded to pressed buttons with greater speed" | Iwata Asks Fever p1 |
| Love Rap reworked until all original voices were replaced | sound | CONFIRMED | Yone: "In the end, we replaced them all" | Iwata Asks Fever p5 |
| Tsunku made sure vocals stayed on beat | sound | CONFIRMED | Tsunku: if one "In to you!" lacks rhythm the game loses what is good about it | Iwata Asks Fever p5 |
| Tsunku "led a sound-first approach" | sound | CONFIRMED in part | The interview shows songs coming first and artists drawing from them; "led" is the writer's framing | Iwata Asks Fever p1-2 |
| Developers paid attention to sound effects that stick | sound | CONFIRMED | Yone | Iwata Asks Fever p2 |
| Volleyball set to bossa nova; ridiculous action, very cool song | art, world | CONFIRMED | Iida and Yone | Iwata Asks Fever p2 |
| Song/setting pairings "all described by the developers as deliberate contrasts" | world | WRONG | The developers describe surprise: the artist drew what each song suggested, Tsunku "didn't mention the graphics", Kamada asked if a kimono sword game "really suit[s] this music". Emergent mismatch, not planned contrast | Iwata Asks Fever p2 |
| "Fever's staff tripled, per its developers" | gameplay.cost | WRONG (attribution) | Iwata said the team was "about three times as much, comparatively speaking"; Takeuchi said three people were added for polish | Iwata Asks Fever p4 |
| "Gave more examples and demos after early remix tests proved too hard" / "the first remix tests were too hard" | signature.teach, replay.evidence | WRONG | The too-hard tests were Tsunku's general difficulty playtests with non-gaming staff; the remix tests "were looking really good". Masaoka names the extra examples and demos as a way to broaden appeal, with no stated link to remixes | Iwata Asks Fever p4, p5, p6 |
| Megamix: Japan 11 Jun 2015, abroad 2016 | business | CONFIRMED | | WP Megamix |
| Megamix: over 100 games, about 70 old and 30 new; Tibby story | entries[3], lore | CONFIRMED | Series page counts differently (108 total); "about" covers it | WP Megamix |
| Megamix: input timing gauge on the lower screen | entries[3], fair, ui | CONFIRMED | | WP Megamix, Gameplay |
| Megamix: buttons or touch | changed | CONFIRMED | Flick removed | WP Megamix |
| Megamix: early game "incredibly easy", story "chunky", experimental art, accessibility praise | complaints, reception[3] | CONFIRMED | USgamer; Nintendo Life; NWR; Destructoid | WP Megamix, Reception |
| Megamix: No. 1 in Japan, 158,000 first week; 1.03 million by end of 2022 | reception[3], business | CONFIRMED (secondary) | | WP Megamix |
| Megamix Metacritic 83 | reception[3] | CONFIRMED (secondary) | Also OpenCritic 74% recommend, the lowest of the series and support for the "mixed" verdict | WP series table |
| Skill Stars | lore, replay | CONFIRMED | | WP Megamix |
| Tsunku composed Megamix while recovering from laryngeal cancer | business.cost | CONFIRMED in part | His vocal cords were removed during Megamix's development | WP Megamix, Music |
| Tsunku composed Groove while recovering from laryngeal cancer | business.cost | UNSUPPORTED | The Groove page says nothing about it. Cut the Groove half; the surgery was during Megamix | WP Groove (no mention) |
| Groove: 2 Jul 2026 worldwide, $39.99 | entries[4], business | CONFIRMED | Store page carries releaseDate 2026-07-02 and price 39.99 | Nintendo US store page; WP Groove |
| Groove: 80 single-player and 30 multiplayer, Beatspell, text-to-speech | entries[4], reception[4] | CONFIRMED | | WP Groove |
| Groove: Metacritic 82, OpenCritic 87% recommend | reception[4] | CONFIRMED (secondary) | 100 and 107 reviews; aggregator pages not loadable | WP Groove |
| Beatspell "slightly underbaked" | complaints, reception[4], lore | CONFIRMED | IGN's Sarah Thwaites; also called repetitive by Nintendo Life and TechRadar | WP Groove, Reception |
| Groove topped Japanese charts for three consecutive weeks | reception[4] | OUTDATED | No. 1 for its first three weeks, and No. 1 for the seventh time in the week to 13 Sep 2026 | Famitsu 17 Sep 2026; WP Groove |
| Groove passed 1 million physical copies in Japan by Sep 2026 | reception[4], business | CONFIRMED | Week to 13 Sep 2026 | Famitsu 17 Sep 2026 |
| Groove first new entry in over a decade, about eleven years after Megamix | entries[4], changed, world | CONFIRMED | | WP Groove |
| Heaven Studio taken down after 2024 DMCA | business.effect | CONFIRMED (secondary) | Reading it as unmet demand is judgement; mark it | WP series, Legacy |
| WarioWare (2003) shares programmer Kazuyoshi Osawa | lineage, lore | CONFIRMED | | WP WarioWare infobox |
| Melatonin: Half Asleep, 15 Dec 2022; Metacritic Switch 87, PC 77; short | lineage | CONFIRMED (secondary) | NWR counts 21 stages | WP Melatonin; NWR review |
| Nintendo Life: not a full replacement | lineage.cost | CONFIRMED | "doesn't fill the Rhythm Heaven-shaped hole" | WP Melatonin, Reception |
| Melatonin's reviewers describe "a more coherent and calm setting where Rhythm Heaven is whimsical and silly" | art.compare | UNSUPPORTED | NWR, the cited source, says nothing like it (it notes each night's stages share "a loose theme"). Find a source or cut | NWR review |
| Bits & Bops: Tempo Lab Games, December 2025; Siliconera "feels like Rhythm Heaven" | lineage | CONFIRMED | Review dated 10 Dec 2025 | Siliconera review |
| Bits & Bops "over twenty minigames" | lineage.evidence, lineage.compare | WRONG | 16 minigames plus 4 mixtapes that combine them (20 in all) | Siliconera review |
| Bits & Bops $15.99 / "around $16 on Steam" | lineage, business.compare | UNSUPPORTED | Steam unreachable from here; recheck on the store page | none loaded |
| Rhythm Doctor: prototype 2011, Early Access Feb 2021, full release 7 Dec 2025; one button inspired by Rhythm Heaven | lineage | CONFIRMED (secondary) | | WP Rhythm Doctor |
| Delayed localisation is "the cost of music that has to be redone for each market" | business.claim | UNSUPPORTED | No source gives this cause, and Groove (with guest vocalists) launched worldwide on the same day, which the lens does not mention | WP Groove (release) |
| "A deliberately mismatched scene can mislead a first-time player" | ui.cost | UNSUPPORTED | No example or source; mark as judgement or cite a minigame | none |

Counts: WRONG 5, UNSUPPORTED 5, OUTDATED 1.

## Missing coverage (against the brief)

- **Groove's latency criticism (mixed verdict material).** Reviewers criticised input delay
  in docked TV play: Nintendo Life's Gavin Lane, and Shacknews, who found TV play worse even
  after calibration. Russel (Siliconera) said it complicates local multiplayer (WP Groove,
  Reception). The draft has this argument as judgement in `fair`, `complaints` and `sound.cost`;
  this is the evidence for it. Add it to `reception[4]` and `complaints`.
- **Grading "by feel" on a few key beats.** The draft only covers the coarse rating. The series
  page says Megamix's Score Meter "makes the game scoring less fixed". Iwata Asks Fever p1:
  difficult games "sometimes have fewer notes or a slower tempo". That is direct developer
  evidence that difficulty does not come from density, and `replay` should use it.
- **Off-beat and swing traps.** These are judgement only. The Iwata Asks quote above and Tsunku
  on remixes (p5: watch the beat) are the closest sources; still thin.
- **DS stylus reception.** The brief asks for reviewers' verdicts on the flicks; the draft gives
  only the developer side (six months to feel fair). `receptionLesson` uses that developer fact
  as if it were a review finding.
- **Fever's praised return to buttons.** Supported but not quoted. 1Up's Otero on the "mileage"
  from two-button play (WP Fever) is the source that fits.
- **Lineage, surface versus mechanism.** Siliconera notes that Bits & Bops tells players to trust
  their ears, but only one of its minigames really felt that way. That is the strongest evidence
  for the draft's lineage claim, and it is in a source the draft already cites.

## Teaching issues

- `business`: the claim makes delayed localisation the structural cost of lyrics, but Groove
  shipped worldwide on one day with sung vocals. Either narrow the claim to 2008-2016 and say
  what changed, or rest the lens on the gap risk, which `cost` already argues well.
- `world.evidence` and `art`: the "deliberate contrast" framing reverses the developer account.
  The more useful lesson is that the artist interpreting the song produced the contrast, and the
  producer chose not to overrule it ("rejecting them might have put a stop to the whole thing").
- `receptionLesson`: "Fever drew the warmest praise" and the stylus point are presented as
  review findings. The first is judgement on a tied Metacritic score. The second is a
  development fact. Mark the first and cut or reframe the second.
- `complaints`: "the series answered with a timing gauge ... and text-to-speech". The gauge
  addresses timing feedback, not hearing or display lag, and text-to-speech is for visually
  impaired players (WP Groove), not for hearing or lag. As written it implies both fix the
  audio-chain problem. Separate the two needs.
- `lineage.cost`: "in my judgement" is first person; use the site's "Judgement:" marker.

## Code issues

None. The entry has no code.

## Rubric (items 1-4 must pass; score out of 10)

| Lens | 1 claim | 2 mechanism | 3 effect | 4 two moments | Score | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| gameplay | pass | pass | pass | pass | 9 | Fix the staff-tripled attribution |
| ui | pass | pass | pass | pass | 8 | Item 9: the mismatched-scene cost is unsourced |
| art | pass | pass | pass | pass | 8 | Melatonin comparison unsupported (item 5 rests on it) |
| sound | pass | pass | pass | pass | 9 | |
| lore | pass | pass | pass | pass | 8 | Comparison's second half ("an RPG hybrid") names no game |
| world | pass | pass | pass | pass | 8 | Evidence misreports developer intent (item 9) |
| env | n/a | | | | n/a | The "not applicable" argument is sound and short |
| business | pass | pass | pass | pass | 7 | Claim contradicted by Groove's release; cause unsourced (item 9) |
| replay | pass | pass | pass | pass | 8 | Remix-test evidence wrong; add the fewer-notes quote |
| lineage | pass | pass | pass | pass | 9 | Fix the Bits & Bops count; add Siliconera's ears point |

No automatic rejection applies: sentences are mostly verbs of effect, and plot summary stays
within two sentences (lore).

## Images (shots.md and the draft's credits)

- **Header** (Groove key art, Nintendo US store page): official, and the page serves key art and
  a gallery from `assets.nintendo.com/.../store/software/switch/70010000122818/...`. Pass.
- **e5 Groove**: same page, with seven gallery screens available. Pass. The alt ("flat, bright
  style") must be rewritten for the frame that is actually picked. The Groove page notes the
  game deliberately uses various art styles, not one unified style, so "the series' flat,
  bright style" may not fit the chosen frame.
- **e1 Tengoku** (LaunchBox, allowed because no official screen exists): the URL in the draft,
  `/games/details/rhythm-tengoku`, opens an empty page. The working page is
  `https://gamesdb.launchbox-app.com/games/details/20455-rhythm-tengoku` (GBA, 240x160 gameplay
  screens). Use a Japan capture. The page also lists a "Gameplay (North America)" screen for a
  game never released there, probably a fan translation; avoid it. The alt says "on the
  handheld's screen", but a raw 240x160 capture shows no hardware; write "a Game Boy Advance
  capture".
- **e2 DS, e3 Fever, e4 Megamix**: credit URLs are the bare `https://www.nintendo.com/`, which is
  not a source page, and `licence: 'press'` is not substantiated. The US product pages for the DS
  and Fever return 404, and the Megamix 3DS page redirects to the eShop closure notice. Look for
  a Nintendo regional (for example Nintendo UK) game page or a Nintendo press kit. If none
  exists, use LaunchBox (`12041-rhythm-heaven`, `13541-rhythm-heaven-fever`; the Megamix id was
  not found in my search) with `licence: 'capture'`.
- **Captions**: all five alts were written before any image was chosen (shots.md: "Not
  downloaded"), so none can yet be said to describe its image. Specific risks:
  - e2 says the scene is "drawn across the two screens". The DS game is held vertically and
    many games use one screen, so this holds only if the chosen frame shows both.
  - e3 says "played with two buttons". No image can show that; describe the scene.
  - e4 says the gauge is "on the lower screen". This is correct for the game (WP Megamix), but
    the frame must show both screens.

## Set aside

- Megamix count: the series page gives 108 (63 + 19 + 12 + 4 + 10); the draft follows the
  Megamix article's "over 100, 70 old, 30 new". This is acceptable as "about".
- DS "10 sets of four plus a remix" against the series page's "10 sets of 5 including a remix":
  same total.
- Fever "40 minigames and 10 remixes" against the series page's "50 including 10 remixes": same
  total.
- "Dropped motion" for Fever: earlier entries had no motion controls, but the team prototyped
  motion and rejected it, so the wording holds.
- The aka list lacks `rhythm-tengoku-miracle-stars` (Groove's Japanese and Asian title). This is
  optional and not a defect.
- Metacritic and OpenCritic figures are confirmed only through Wikipedia's citations, because
  the aggregator pages blocked curl. They are not counted as UNSUPPORTED; the gap is recorded.
- DS Iwata Asks (`/ds/rhythm-heaven/0/3`) and the GoNintendo summary were not read. The draft
  makes no claim that depends on them beyond what the Wikipedia DS page confirms.
- The `minute` field uses "I" in the player's voice. This is the field's convention, not a
  style breach.
- Style: no hype words, no US spellings, and no employer, colleague or internal project named.
- `diagrams` (loop and screen schematic): consistent with the text; the schematic is labelled
  as not to scale.
