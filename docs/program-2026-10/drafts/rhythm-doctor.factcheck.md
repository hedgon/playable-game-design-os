# Fact-check: rhythm-doctor (GAME draft)

Checked 2026-10-05 against `docs/program-2026-10/drafts/rhythm-doctor.js`, its `.sources.md` and `.shots.md`,
`briefs/games.md` (section `### rhythm-doctor`) and the rubric in `docs/references/analysis-method.md`.
Primary pages fetched raw with curl this session: the Steam store page for app 774181 (English, US; About text,
review block, review summary, release dates, accessibility sidebar, screenshot list), the Steam store page for
A Dance of Fire and Ice (977950), Wikipedia "Rhythm Doctor" and "Independent Games Festival" (raw wikitext),
Game Developer's 2025 interview with the team ("Using medical stories and heart conditions to create musical
challenges in Rhythm Doctor"), Game Developer's 2024 IGF winners report, the TouchArcade TGS 2017 hands-on and the
GamingTrend team interview. All 10 Steam screenshots and the header were downloaded and viewed.
Not reachable: igf.com (JavaScript-only page), PC Gamer review (writer reports site chrome only; not retried),
Xbox Wire search (no result), web search (blocked). Rhythm Doctor's in-game settings could not be checked.

Validator: `PLAYABLE_DRAFTS=<rhythm-doctor + the five draft topics> node src/validate.js` gives one error,
`image file assets/games/rhythm-doctor.jpg does not exist` (expected; the coordinator supplies it). Every
`lens.*.topics` id resolves once the five draft topics are added. Word counts: every lens 196-305 words,
signature 563 (all above the 150 / 380 floors).

## Verdict: FAIL (rework, not spot fixes)

The entry's thesis is factually wrong as written: it says the rule "never changes from the first level to the
last" and that "every row is a count of seven beats ending in a press". The developers describe, and a Steam
screenshot shows, other beat types: two-beat "SVT" rows, held beats (hold the spacebar), silent beats marked with
red X's and frozen beats whose timing is delayed; Wikipedia says most levels begin with a tutorial on new
mechanics. What stays fixed is the input (one button) and the seventh-beat core, not the rule. The claim is in
`why`, `lesson`, `signature.mechanism`, `signature.fair`, `lens.gameplay`, `lens.replay` and `lens.lineage`, so
reframing it changes the argument of most of the entry. On top of that: a PC Gamer quote is really IGN's, the
Rhythm Heaven / blind-play origin is reversed, the screen diagram does not match the real screen, the proposed
gameplay screenshot shows a dialogue scene, and six lenses fail rubric item 4 (no specific moment). The facts
that are right are well sourced, and the fixes below are concrete.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
| --- | --- | --- | --- | --- |
| "Every row is a count of seven beats ending in a press, from the first level to the boss levels"; "the rule never changes"; "stated once and never revised" | lens.gameplay.evidence, signature.mechanism/fair, why, lesson, replay, lineage | WRONG | Seven-beat rows are the core, but the game also has two-beat SVT rows, held beats (hold the spacebar), silent beats (red X) and frozen (delayed) beats; most levels open with a tutorial on a new mechanic. Fixed: the single button and the seventh-beat core. | Game Developer interview (Azman: "two-beat 'SVT beats'", "'held beats' require the player to hold the spacebar", "pulses frozen in ice"); Wikipedia (Gameplay); Steam screenshot ss_a8427224 ("Administer the two-beat rhythm treatment") |
| PC Gamer "described it as telling a story in ways uncommon in the medium and scored it 93" | lens.lore.evidence | WRONG | The story quote ("tell a story in ways I've never seen a game do before") is IGN's, 9/10. PC Gamer's quoted line is about every second "trying to do something", 93/100. | Steam store review block |
| One-button scheme "a response to the two-button inputs of that series and a wish to make a game playable without sight"; blind play "a design aim reported for the one-button scheme" | lens.lineage.evidence, lens.sound.evidence | WRONG | Azman: Rhythm Heaven's (mostly) two buttons "showed how such a thing was even possible", which is why the prototype used one button; he disliked multi-button dexterity. Blind-friendliness was a later "side-effect" of one button, then adopted as a second goal (all mechanics playable blind). | Game Developer interview |
| Tag `solo-developer` | tags | WRONG | Team game: Azman (design, music), Winston Lee (art, early version), Giacomo Preciado (programming), Kyle Labriola (writer), Jenny (level design), s9menine (sound). Use `premium` instead. | Game Developer interview; GamingTrend interview |
| Screen diagram: play space top 62 %, beat row a band below it, timing verdict bottom right | diagrams[1] | WRONG | Real screen: each row is a horizontal EKG line running across the scene from the patient (left) to a heart (right); several rows can stack; the player's arm and button sit along the bottom; a large count number appears during the count-in; patient and level progress bars at top left. No separate verdict panel is visible in any store shot. | Steam screenshots ss_0ad870eb, ss_303950f5, ss_69d7b976 (viewed) |
| TouchArcade: "later levels add deliberate distractions" | lens.ui.evidence | WRONG (minor) | The TGS demo was a tutorial then one boss fight; the tricks start "as you whittle down the boss's life bar", within that fight. Say "as the boss fight goes on". | TouchArcade 2017 |
| "A miss shows how early or late you were"; "Timing verdict" region; loop step "early, on time or late, shown on the row" | first30, diagrams[0], diagrams[1] | UNSUPPORTED | Not seen in any store screenshot or source. Cut, or verify in game. | none found |
| "The press is judged against the audio clock / audio timeline" | lens.sound.mechanism, signature.mechanism | UNSUPPORTED | An implementation claim with no developer source. Mark as inference ("the design only works if...") or cut. | none found |
| Player must set "their audio offset"; "offset settings" | complaints, lens.sound.cost | UNSUPPORTED | Likely true, but no source read; the writer also flags it. Cite a source (settings screen, patch notes) or phrase generally. | none found |
| Xbox Series X/S and Xbox One, 18 Dec 2025 | lens.business.evidence | UNSUPPORTED | Wikipedia infobox only, uncited there; no Xbox page reached. Low risk. | Wikipedia infobox |
| A Dance of Fire and Ice "arguably supported the longer project" | lens.business.mechanism | UNSUPPORTED | No developer statement found; GamingTrend only says code lessons transferred between the two editors. Keep marked as judgement or cut. | GamingTrend |
| Window level is "the best-known level" | signature.escalate, lens.ui.evidence | UNSUPPORTED | Judgement. Name it instead: level 2-X, "All the Times" (Window Dance). | GamingTrend |
| Early Access 26 Feb 2021 | business | CONFIRMED | "Early Access Release Date: Feb 26, 2021" | Steam store |
| Full release December 2025 | business | CONFIRMED | Steam: Dec 6, 2025; Wikipedia: 7 Dec (time zone). "December 2025" is right. | Steam; Wikipedia |
| 98 % positive of 8,126 reviews | business | CONFIRMED | "Overwhelmingly Positive (98% of 8,126)" (7,991 positive) | Steam store |
| Metacritic 89 | business | CONFIRMED | | Steam store |
| IGN 9/10, PC Gamer 93/100 | lens.replay.evidence | CONFIRMED | | Steam store review block |
| 20+ handmade levels; rhythm theory taught "without even realising it"; polyrhythms, hemiolas, irregular time signatures | lens.gameplay.evidence, why | CONFIRMED | | Steam About |
| Level editor with 50+ visual effects and backgrounds | lens.art, lens.replay | CONFIRMED | "use 50+ different visual effects and backgrounds" | Steam About |
| Steam Workshop; drop-in drop-out local co-op | lens.replay | CONFIRMED | 2P is local only; Remote Play "does not work that well" | Steam About and features |
| Flashing lights and colours warning | complaints, lens.ui.cost | CONFIRMED | | Steam About |
| Spacebar on the seventh beat | verb, lens.gameplay | CONFIRMED | "Slam your spacebar in perfect time on the 7th beat" | Steam About |
| Security-camera view of the hospital | lens.world.evidence | CONFIRMED | Intern at Middlesea Hospital, seen as an elongated arm | Wikipedia |
| Playable without sight | lens.sound, signature.fair | CONFIRMED | Steam accessibility sidebar lists "Playable without vision"; developer goal per interview | Steam store; Game Developer |
| IGF 2024 audio award | lens.sound.evidence | CONFIRMED | Excellence in Audio, 26th IGF Awards | Game Developer 2024 IGF report; Wikipedia IGF list |
| 2011 prototype, 2012 Flash browser demo | lens.business, lens.lineage | CONFIRMED | Azman: "the early 2011-2014 version"; demo in Flash | Game Developer interview; Wikipedia |
| 2014 IGF Student Showcase nominee | lens.business | CONFIRMED | | Wikipedia (accolades, from the 7th Beat press kit) |
| TGS 2017 preview: Rhythm Heaven-inspired; numbers count off on the meter; "weird and whimsical" | lens.ui, lens.art, lens.world, lens.lineage | CONFIRMED | Headline and body | TouchArcade 2017 |
| Window level inspired by NotITG; Jenny expanded the prototype into the full choreography | lens.env.evidence | CONFIRMED | Inspired by TaroNuke's NotITG StepMania mod; Azman: in NotITG reading the chart through the distractions is the challenge, in Rhythm Doctor the gimmick is meant to make you lose the beat | GamingTrend |
| Azman writes the music with sound designer s9menine | lens.sound.evidence | CONFIRMED (note) | s9menine joined late and composed a few extra tracks; the soundtrack also credits celesti, Riya and guests. Fine as written. | GamingTrend; Steam soundtrack DLC text |
| Musical-theatre comparison | lens.lore.evidence | CONFIRMED (note) | Wikipedia attributes it to This Is Game; name the outlet, not "Wikipedia reports" | Wikipedia (Reception) |
| ADOFAI 24 Jan 2019, the studio's first title | lens.business, lens.lineage | CONFIRMED | Steam: Jan 24, 2019; 95 % of 15,650 | Steam 977950; Wikipedia |
| Early access "nearly five years" | lens.business.cost | CONFIRMED | Feb 2021 to Dec 2025, 4 years 10 months | Steam |

Counts: WRONG 7 (one minor), UNSUPPORTED 6, OUTDATED 0.

## Missing coverage (against the brief)

- What it changes from Rhythm Heaven: the brief lists "accessibility and calibration options". Absent apart
  from the flashing warning. Available evidence: Steam lists Playable without vision, Difficulty levels, Narrated
  menus and Background volume controls; the developer's goal that every mechanic be playable blind without
  memorisation (Game Developer). Calibration is not covered and not sourced.
- The beat-type vocabulary (SVT two-beat, held, silent, frozen), which is how the game varies the rule. It is
  the design move the entry should be about.
- "Night Shift" harder versions of every level (Steam About): the main replay feature, missing from `replay`.
- Level names. No lens except `env` names a level. Candidates from sources: 2-X "All the Times" (Window Dance,
  GamingTrend); the SVT level with Cole Brew, the musician (Steam screenshot); the polyrhythm prototype that
  became a late level (Game Developer).
- The developer's own contrast with NotITG (distraction aimed at the beat, not at reading) would anchor the UI
  and art lenses' "the picture misleads" claim in a developer source.

## Code issues

None: the entry has no code. The prototype recipe (`signature.prototype`) is engine-neutral and sound.

## Teaching issues

1. The thesis "fix the rule, attack the attention" is the entry's lesson, and it rests on the wrong claim
   above. A correct version: fix the input and the core count, add one beat type at a time, each taught by its
   own tutorial and its own look on the EKG (Azman explains the animations exist to make each beat type
   readable). That is still a strong, transferable principle, and more honest.
2. Fagerholt and Lorentzon misapplied (`lens.ui.mechanism`): in their model a meta interface is in the fiction
   but not in the game space (blood on the screen). Moving the OS window is a fourth-wall or non-diegetic
   effect, not meta. The rows themselves (EKG lines from patient to heart) read as diegetic or spatial; argue it.
3. "Judged against the audio clock" is presented as fact and then used as the reason the visuals can lie. Mark
   it as inference, or move the technical point into the craft-audio-clock topic link.
4. `lens.ui.cost`: "the reader must rely on the options the game offers" (should be "player", and say which
   options).
5. Effects stated as player reports without a source ("they report the odd pleasure", "experienced players close
   their eyes"). Rubric item 9 wants effect from play or reception: cite a review (IGN quote on the store page,
   Wikipedia's note that reviewers stressed difficulty) or soften.
6. `signature.fair`: the Workshop sentence does not support the fairness argument (sharing levels is not why a
   confusing effect can be ignored). Cut it from `fair`.

## Images (`rhythm-doctor.shots.md`)

All sources are the official Steam store page (licence `store`, credit 7th Beat Games): acceptable.

| # | Proposed | Check | Verdict |
| --- | --- | --- | --- |
| 1 | Header `header.jpg` | Official Steam header capsule, downloads and shows the logo art | OK |
| 2 | `ss_e361a4f2...` for the beat row, caption "patient... with the row of seven beats below" | Viewed: a dialogue scene in a lab ("Your patient's over there. Dr Paige can help you out."). No beat row, no patient row. Caption and callouts do not match. | WRONG: replace |
| 3 | "Choose a screenshot with visible effects" | No URL given | Pick one (below) |
| 4 | Window-dance level | No store screenshot shows the moving window | Drop |

Replacements, all from the same store page (`.../apps/774181/ss_<hash>.1920x1080.jpg`), viewed:

- Gameplay / UI: `ss_0ad870eb7a1cc4315b17c2aaa2e54c0b5f220684`, one patient row in a tree scene with the count
  "3" shown. Caption: the pulse travels along the line from the patient to the heart; the count is the cue and
  the press lands on the seventh. Callouts: patient (0.10, 0.50), the row (0.50, 0.50), count number (0.32,
  0.28), heart (0.90, 0.50), arm and button (0.40, 0.94).
- Gameplay (beat types): `ss_303950f5da20e6f81c8aa6b709e7f1f6e75851e2`, three rows at once with red X's marking
  silent beats. Caption: look at the red crosses; those beats make no sound, so the player has to keep counting.
  Callouts: red X (0.20, 0.78), second row (0.45, 0.55).
- Art / effects: `ss_cb7d76930005066d5200cc79523a011c793cbc35`, the screen split into two bands with a glow and
  blur effect over the top row. Caption: the frame is split and one half is distorted; the beat underneath has
  not changed.
- Optional (gameplay or lore): `ss_a8427224faf8062ed4eea2d3af9637934914a85c`, level card for Cole Brew:
  "Administer the two-beat rhythm treatment". Useful evidence for the beat-type fix.
- Optional (replay): `ss_928cb97087941ac28c25b71df993412c8e5fbafa`, the level editor timeline and camera
  event panel.

## Rubric (analysis-method items 1-10; items 1-4 must pass, 7 of 10 to pass)

| Lens | 1 claim | 2 mechanism | 3 effect | 4 two moments | Score | Result | Note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| gameplay | P | P | P | F | 7 | FAIL | Evidence is store copy plus the wrong seven-beat claim; no level named. Item 9 fails (effect unsourced). |
| ui | P | P | P | P | 8 | PASS | TGS count numbers, window level. Framework misapplied (teaching 2); effect unsourced. |
| art | P | P | P | F | 7 | FAIL | "Whimsical" and "50+ effects" are not moments. Use the split-screen and silent-beat shots. |
| sound | P | P | P | F | 7 | FAIL | An award and a capability are not moments; intent misreported (item 9 fails). |
| lore | P | P | P | F | 7 | FAIL | No character or level named; the quote is misattributed. Cole Brew's SVT level would do. |
| world | P | P | P | F | 7 | FAIL | Security-camera view is one concrete fact; nothing else specific. |
| env | P | P | P | F | 7 | FAIL | One moment (Window Dance); the room vignette claim has no example. |
| business | P | P | P | P | 8 | PASS | Dates and numbers are specific; item 7 weak (ADOFAI funding is unsupported). |
| replay | P | P | P | P | 8 | PASS | Misses Night Shift; "fixed verb" claim needs the beat-type fix. |
| lineage | P | P | P | P | 8 | PASS | Intent misreported (item 9 fails) until the Game Developer quote replaces it. |

Items 5 (comparison), 6 (cost), 8 (principle) and 10 (swap test) pass in every lens. No automatic rejection:
"has / uses / features" sentences are well under half, and frameworks are applied, not just named.

## Style

- No hype words found; no US spellings (grep for color, center, -ize, -izing). "best-known" twice: judgement,
  replace with the level name.
- `lens.business.compare`: "licence popular songs" uses the noun; the British verb is "license".
- No employer, colleague or internal project of the owner appears.

## Set aside

- `year:2021` (Early Access) while Wikipedia's short description says a 2025 game: a site convention question for
  the coordinator, not a fact error; both dates are correct and stated in the business lens.
- Tag `early-access`: kept; the release model is part of the analysis even after 1.0.
- "Beat Saber at launch relies on its own original music": true (launch tracks by Jaroslav Beck), from memory, not
  re-sourced; low risk and not a claim about this game.
- "Most rhythm games licence popular songs": a generalisation; arguable but not checkable; left.
- Team names in the claim list (Giacomo, Jenny, s9menine) and Greenlight 2017: confirmed in GamingTrend; only
  s9menine and Jenny's role appear in the draft.
- "first30" "junior doctor": Wikipedia says intern; same role, not flagged.
- "A small marker moves along the row": the pulse travels along the EKG line, which is that marker; not flagged.
- PC Gamer review page not re-fetched: its score and quoted line are on the Steam store page, which suffices.
- Lens topic ids: all resolve with the five draft topics; not re-checked for fit beyond that.
