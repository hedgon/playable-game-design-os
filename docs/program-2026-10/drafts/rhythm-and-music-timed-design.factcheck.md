# Fact-check: rhythm-and-music-timed-design

Checked 2026-10-05 against `drafts/rhythm-and-music-timed-design.js`, its `.sources.md`, `briefs/topics.md` (## rhythm-and-music-timed-design) and `briefs/topic-common.md`. The draft was not edited.

## Verdict: PASS WITH FIXES

Counts: WRONG 1, UNSUPPORTED 5, OUTDATED 1. Most of the core claims are right: the osu! formulas, the Unity and Godot audio-clock APIs, the Beat Saber scoring and map format, Rock Band calibration and the NecroDancer origin. The fixes are a dated Android claim stated as fact in two places, one misattributed quote, three claims with weak sources, a Unity snippet that treats dspTime as exact, and one banned style word.

Validator: `PLAYABLE_DRAFTS=docs/program-2026-10/drafts/rhythm-and-music-timed-design.js node src/validate.js` ends `OK: all cross-links resolve, all topics complete.` The only lines about this draft are the expected `DRAFT not in any learning path` and `WARN topics with no inbound links`. All 8 `rel` targets exist in `src/` (none is a sibling draft), so I did not need a multi-draft PLAYABLE_DRAFTS run.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
|---|---|---|---|---|
| osu! 300 = 80-6*OD, 100 = 140-8*OD, 50 = 200-10*OD ms | what, how[3], TECH 4, FACTS[0] | CONFIRMED | Read on the raw page. The page also says stable osu! windows can be up to 0.5 ms shorter because of rounding (`hit error < round(window)`). | https://osu.ppy.sh/wiki/en/Beatmapping/Overall_difficulty |
| OD 5 = ±50/100/150; OD 10 top = ±20 ms | what, FACTS[0] | CONFIRMED | Arithmetic checks: 80-30 = 50, 140-40 = 100, 200-50 = 150; 80-60 = 20. | same |
| ±20 ms "about one frame at 60 Hz" | what | CONFIRMED | 20 / 16.7 = 1.2 frames for the half-width. | arithmetic |
| 120 BPM beat = 500 ms; 180 BPM 16th ≈ 83 ms; 60 Hz frame = 16.7 ms | what, TECH 3 | CONFIRMED | 60000/120 = 500; 60000/180/4 = 83.3; 1000/60 = 16.67. | arithmetic |
| 83 ms is "less than twice a ±50 ms window" | TECH 3, interview mid | CONFIRMED | 2 × 50 = 100 > 83, so the windows overlap. | arithmetic |
| 80 ms gap with ±60 Good overlaps | interview senior | CONFIRMED | 120 > 80. | arithmetic |
| 40 ms delay on a ±35 ms window turns correct presses into misses | why[0] | CONFIRMED | 40 > 35, so the press misses that window (it may still score in a wider one). | arithmetic |
| Chart games: "notes travel toward a hit line" incl. osu! | what | WRONG (minor) | osu!standard has no hit line. Circles appear in place and an approach circle shrinks onto each one. The description fits Guitar Hero, Rock Band, StepMania and Beat Saber. Fix: describe osu!'s approach circles, or move osu! to an example of "the future drawn on screen" without the hit line. | osu! wiki, Overall difficulty and Approach rate pages |
| Tapping to a metronome precedes the click by "tens of ms" | what | UNSUPPORTED (magnitude) | The abstract confirms Repp 2005 reviews the negative mean asynchrony. The "tens of ms" size is not in the abstract and I could not read the full text. Keep the claim, and cite a page that gives the number. | https://link.springer.com/article/10.3758/BF03206433 (abstract read; Crossref: "Sensorimotor synchronization: A review of the tapping literature", Dec 2005) |
| NMA "read as the brain anticipating the beat (Repp 2005)" | what | see Teaching issues | Repp reviews several competing explanations. The draft gives one reading as settled. | same |
| Rhythm Doctor: press on the seventh beat "of every bar"; polyrhythms, irregular bars, silent beats, visual distractions | what | CONFIRMED (wording) | Wikipedia says "every seventh beat", and the game's rows are seven beats long. "Of every bar" reads as a musical bar. Suggest "the seventh beat of each seven-beat row". | https://en.wikipedia.org/w/index.php?title=Rhythm_Doctor&action=raw |
| One button inspired by Rhythm Heaven's two-button scheme; playable without sight | what (sources), interview senior | CONFIRMED (secondary) | Stated on Wikipedia. The Steam store data (publisher-declared) lists "Playable without vision" and "Narrated Game Menus". | Wikipedia; https://store.steampowered.com/api/appdetails?appids=774181 |
| Rhythm Doctor "a screen reader and voice cues" | why[3], interview senior | CONFIRMED / UNSUPPORTED | Narrated menus are confirmed on Steam. "Voice cues" as an accessibility feature could not be confirmed: familygamingdatabase returned 403 and the writer read only a summary. | Steam appdetails |
| NecroDancer: Clark shortened turns until moving felt like a beat | what | CONFIRMED (secondary) | Wikipedia: Clark used turns that each lasted a short real time, then saw the link to beat-matching rhythm games. "Began as a turn-based roguelike" slightly overstates it: it began as a concept, not a built game. | https://en.wikipedia.org/w/index.php?title=Crypt_of_the_NecroDancer&action=raw |
| Skeleton acts every second beat | what | CONFIRMED (secondary) | "only move and attack on every other beat". | same |
| Hi-Fi Rush: "its director says attacks still land off the beat but hit harder in rhythm" | what, FACTS[5] | UNSUPPORTED (attribution) | Vice says it in the journalist's own voice ("Crucially, attacks still happen if the player is off the beat, but they're more powerful in rhythm"), not as a Johanas quote. The fact itself is fine. Fix: drop "its director says" and "director John Johanas said". | https://www.vice.com/en/article/how-a-designer-known-for-horror-made-the-musical-gaming-triumph-hi-fi-rush/ (read raw) |
| Hi-Fi Rush added a fully optional beat meter after feedback | TECH 7, FACTS[5] | CONFIRMED | Vice: "(fully optional) meter ... literally shows the beat timing". The feedback context is Johanas's quote about 808. | same |
| "Introduce the beat UI gradually ... as Hi-Fi Rush's team did" | TECH 7 | CONFIRMED (wording) | The article says the team's resistance to more UI broke down over the course of development. It does not say the game teaches its UI gradually to the player. Reword. | same |
| Hi-Fi Rush interpolates animations so early or late actions land on the beat | trade[2], TECH 6, how[7] | CONFIRMED (secondary quote) | Gameranx quotes Johanas: "every animation you do, whether it's a little bit early or late, it'll always, basically, interpolate it so that it'll land on the beat". The primary Unreal interview returned 403. | https://gameranx.com/updates/id/436553/article/hi-fi-rush-is-a-huge-technical-achievement-heres-how-tango-gameworks-pulled-it-off/ |
| Hi-Fi Rush enemies and world move to the beat | TECH 6 | CONFIRMED | Wikipedia: Chai, enemies and objects move in sync with the beat. | Wikipedia Hi-Fi_Rush raw |
| Metal: Hellsinger grades Good / Perfect; Perfect gives more damage and Fury | what | CONFIRMED (fan wiki) | "All successful beat actions are graded Good or Perfect - a Perfect attack will deal the most damage and give more Fury". | https://metalhellsinger.wiki.gg/wiki/Tutorials |
| Metal: Hellsinger lets the player turn the beat system off | what, how[7], TECH 7 | UNSUPPORTED | Only search summaries say so. No primary or readable page found: TrueAchievements returned 403 and SuperJump does not say it. Find a settings screenshot or patch note, or soften the wording. | search summaries only |
| Metal: Hellsinger audio and video calibration for wireless headsets and slow displays | TECH 5 | CONFIRMED (secondary) | Prima describes a two-step audio-then-video tap calibration aimed at wireless headsets and slow monitors. "Added" (post-launch) is not confirmed. Say "has" unless the interview can be read. | https://primagames.com/tips/how-to-fix-audio-video-lag-and-calibrate-it-in-metal-hellsinger |
| Rock Band calibrates audio and video separately, with per-TV starting values | how[6], TECH 5 | CONFIRMED | Separate AUDIO and VIDEO CALIBRATION steps; table "LCD 1 Audio 80, Video 50 ...". | https://www.harmonixmusic.com/blog/how-to-calibrate |
| Unity dspTime: seconds, counted from processed samples, pauses with the game | ENGINE unity, FACTS[1] | CONFIRMED | "based on the actual number of samples the audio system processes"; "While the game is paused ... this time will not be updated". `public static double dspTime`. | https://docs.unity3d.com/6000.0/Documentation/ScriptReference/AudioSettings-dspTime.html |
| PlayScheduled(double time), absolute time on the dspTime timeline, schedule ~100-200 ms ahead | TECH 1, ENGINE, FACTS[1] | CONFIRMED | "Schedule a time slightly in the future (~100-200ms)". | https://docs.unity3d.com/6000.0/Documentation/ScriptReference/AudioSource.PlayScheduled.html |
| Godot recipe: playback position + time since last mix - output latency; discard a decreasing reading | TECH 1, ENGINE godot, FACTS[2] | CONFIRMED | Read on the raw page: "Just check that the value is not less than in the previous frame (discard it if so)". | https://docs.godotengine.org/en/stable/tutorials/audio/sync_with_audio.html |
| Android low_latency = continuous output ≤ 45 ms; pro = round trip ≤ 20 ms; "no API to determine latency at runtime" | traps[2], interview senior, FACTS[3] | OUTDATED | The NDK page does say this, but it was last updated 2024-01-03 and is behind the platform. Oboe ships `AudioStream::calculateLatencyMillis()`, built on stream timestamps, and Java has `AudioTrack.getTimestamp()`. Both give a runtime estimate of output latency. Oboe's own header notes they miss delay the device does not know about (USB, HDMI TV, and Bluetooth in practice). Fix: "Android can estimate output latency at runtime (Oboe calculateLatencyMillis, AudioTrack.getTimestamp), but the estimate misses Bluetooth and TV delay, so calibrate anyway". The design advice still stands. | https://developer.android.com/ndk/guides/audio/audio-latency; https://github.com/google/oboe/blob/main/include/oboe/AudioStream.h |
| Beat Saber cut = 115: 70 approach + 30 follow-through + 15 centre | FACTS[4] | CONFIRMED (community wiki) | The table gives 70 + 30; 115 − 100 = 15 for the centre. | https://bsmg.wiki/ranking-guide.html |
| Beat Saber stores note time in beats | how[2], TECH 2 | CONFIRMED | `"_time" : 10.0 // Beat`. | https://bsmg.wiki/mapping/map-format.html |
| Rhythm Heaven "games" have a Barista who offers a skip after three failures (OK rank) and an intro replay | how[9], TECH 8 | UNSUPPORTED | Only a fan-wiki summary; the page is behind a Cloudflare challenge. The Barista café belongs to some titles (Fever and Megamix), and "the Rhythm Heaven games" is not verified for the series. Name the titles once a page is read, or drop the "OK rank" and "three tries" details. | rhythmheaven.fandom.com/wiki/Barista (not readable) |

## Code

Neither snippet was compiled; I read both line by line. There is no Go snippet in the draft.

- **Unity (C#, Unity 6):** `AudioSettings.dspTime` (static double), `AudioSource.PlayScheduled(double)` and `System.Math.Round(double)` are real and used with the right signatures. The expression-bodied `SongBeat()` is valid C#. The class should compile. The sign of `offsetSec` is consistent with its comment: subtracting a positive "hear late" offset moves the judged beat later.
  - Issue (teaching and code): the `term` says the song start "is known exactly". That is true of the start, but `dspTime` read from `Update` only moves forward once per DSP buffer, because it counts samples the mixer has processed. At 1024 samples and 48 kHz that is 21.3 ms steps. So `ErrorSec()` is quantised in the same way the draft warns about for Godot. This is my inference from the documented definition; the Unity page does not say it outright. Add one line: dspTime steps per audio buffer, so interpolate with a frame clock between steps, or judge with input timestamps.
  - The pitfall says "read the press time when the input happened". The snippet has no way to do that, because it samples dspTime at call time. Name the Input System's event time (`InputAction.CallbackContext.time`) or drop the instruction. I did not check that API on the Unity reference, so confirm it before naming it.
- **Godot (GDScript, Godot 4):** `AudioStreamPlayer.get_playback_position() -> float`, `AudioServer.get_time_since_last_mix() -> float`, `AudioServer.get_output_latency() -> float` and `roundf(x: float) -> float` are all confirmed on the stable class reference. `@export`, `@onready` and the typed `$Music` are valid Godot 4 syntax.
  - Issue: the AudioServer class reference says of `get_output_latency()`: "This can be expensive; it is not recommended to call get_output_latency() every frame." `song_time()` calls it on every use, and the sync tutorial does the same. Cache it once (for example in `_ready`) and say why.
  - The snippet does not discard decreasing readings. The pitfall says it should, which is acceptable for a 15-line snippet.
- Both snippets use only APIs listed in their `api[]`, and the validator accepted their length.

## Teaching issues

1. **Negative mean asynchrony shown as settled.** "Which is read as the brain anticipating the beat (Repp 2005)" presents one reading. Repp's review discusses competing explanations: sensory accumulation, P-centre and Paillard-Fraisse conduction time. The writer's own source note says so, but the text drops it. The common brief says contested claims must be marked as contested.
2. **"Judging an input at the frame it is read ... the window effectively widens by up to a frame"** (traps[3], and the Unity pitfall). Frame polling adds a late bias of 0 to 1 frame plus jitter. It moves the press later and makes the timing noisier; it does not widen the window. Say "shifts presses late by up to a frame, unevenly".
3. **Nearest-note matching is presented as the fix for overlap.** The osu! page it already cites describes the other common answer: notelock, where the second object cannot be hit until the first resolves. Add it as an alternative, because its cost is the "stolen note" feel the draft names.
4. **Pass window ±120 in the how[3] draft table** sits beside a 180 BPM sixteenth of 83 ms. That is fine as a draft, but the step right after it could say this table already overlaps at 180 BPM sixteenths. That would make the overlap point concrete.
5. **Android latency** (see OUTDATED): the trap teaches "the platform offers no runtime query". A reader on modern Android would then skip a useful estimate. The real lesson is that the estimate misses external delay.

## Missing or thin coverage (brief "Must cover")

- **Entrainment:** the word and the idea are absent. Anticipation and the shared clock are covered, so add one sentence on entrainment, marked as a lens.
- **Off-beat traps (Rhythm Heaven):** thin. There is one generic line in how[9] and no named instance, as the writer admits.
- **Sources the brief asks for:** no GDC talk on rhythm games is used, Tsunku and the Iwata Asks interview are not used in the text, and the 7th Beat dev posts were not readable. The topic leans on wikis and secondary press for the game claims.
- Everything else on the list is covered adequately: the two families, windows in ms, early versus late, calibration as a feature, charting as level design (Beat Saber flow and parity), accessibility, and the three mixed-genre examples.
- **Overlap with a sibling:** the brief lists a separate `craft-audio-clock-and-input-latency` topic, which is not drafted yet. This draft's TECH 1, ENGINE tab, latency diagram and calibration material cover much of that topic's "Must cover". It repeats no existing sibling draft, but the coordinator should split the two before that one is written. Suggest keeping the engine depth there and linking it from here; it cannot go in `rel` until it exists.

## Style

- `ai.yes[0]`: "returns a robust offset". "Robust" is on the banned list in topic-common.md; use "reliable" or "an offset that ignores outliers".
- No hype words otherwise. "More powerful in rhythm" is a factual use.
- UK spelling throughout (synchronisation, centred).
- No employer, colleague or internal project names.

## Set aside

- ITG/StepMania windows and the Rhythm Heaven ±35 ms Karate Man figure: in the source list but not used in the text, so nothing to check.
- Rock Band unit for "Audio 80, Video 50": not stated on the page and not used in the topic.
- Iwata Asks Tsunku "Here! Here! Here!": not used in the topic text.
- Hi-Fi Rush "prototype had no graphics": in the source list only. It is confirmed in Vice anyway ("We specifically didn't have any graphics in the beginning").
- The "median of many taps", "loose pass and tight Perfect" and "overlap when gap < 2× window" advice: design reasoning, labelled as inference by the writer. The arithmetic is correct and I flagged none of it.
- `System.Math.Round` uses banker's rounding at exactly .5 of a beat. It has no practical effect on the sign of a timing error, so not flagged.
- Godot `stable` docs (4.x) are used rather than a pinned 4.x version. The APIs are unchanged across Godot 4, so not flagged.
- The "inbound links" WARN from the validator: expected for a new draft until other topics link it, so not a draft defect.
- Beat Saber library game not linked: topics have no game-link field in `src/`, and the brief only asks to refer to games by name.
