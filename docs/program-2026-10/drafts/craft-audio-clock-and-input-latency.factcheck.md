# Fact-check: craft-audio-clock-and-input-latency

Checked 2026-10-05 against `briefs/factcheck.md`. All primary pages below were fetched raw with curl
(not through a summariser) and read as text: Godot stable docs (4.7), Unity 6000.0 ScriptReference and
Manual, Input System 1.11 manual and API, Android developer and AOSP pages, Oboe `FullGuide.md` and
`include/oboe/AudioStream.h`, Apple's JSON data for `setPreferredIOBufferDuration(_:)`, web.dev, NVIDIA,
the ITU-R BT.1359-1 PDF itself, and the Adriaensen DLL PDF itself.

## Verdict: PASS WITH FIXES

Three WRONG, five UNSUPPORTED, zero OUTDATED. No Go snippet in the draft (none to compile). Both engine
snippets use real Godot 4 / Unity 6 APIs with correct signatures. The most serious issue is teaching,
not a number: the draft presents Godot's sound-hardware recipe as the right way and the system-clock
recipe as the one that drifts, while Godot's own page calls the system-clock method "the recommended
approach" for a rhythm song of a few minutes and calls the hardware method "less precise".

Validator:
- Alone: `PLAYABLE_DRAFTS=docs/program-2026-10/drafts/craft-audio-clock-and-input-latency.js node src/validate.js`
  fails with `rel -> unknown rhythm-and-music-timed-design` (that rel target is a sibling draft).
- With the sibling loaded:
  `PLAYABLE_DRAFTS=docs/program-2026-10/drafts/craft-audio-clock-and-input-latency.js,docs/program-2026-10/drafts/rhythm-and-music-timed-design.js node src/validate.js`
  ends `OK: all cross-links resolve, all topics complete.` Remaining lines are the expected
  `DRAFT not in any learning path`, `WARN topics with no inbound links`, and `LONG ... diagram: layers has 8 entries (guide: 6)` (reported, not an error).
- Integration order matters: this topic must land with or after `rhythm-and-music-timed-design`, or
  the rel entry must be removed.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
|---|---|---|---|---|
| Godot manual: system-clock approach "works for a short song", hardware clock "never exactly in sync", second recipe position + since-last-mix − output latency | what ¶2; FACTS 1 | WRONG (misleading by omission) | Quote and recipe are right, but the page says the system-clock method is fine "and it's the recommended approach" for a song of a few minutes, and that the hardware method is "a less precise approach" that works "for songs of any length". The draft inverts the page's recommendation. FACTS 1 is accurate on "any length" but should add "less precise". | docs.godotengine.org/en/stable/tutorials/audio/sync_with_audio.html |
| Discard a reading that decreases (multithreading) | why 2; ENGINE godot | CONFIRMED | "Just check that the value is not less than in the previous frame (discard it if so)" | same page |
| get_playback_position not always accurate; add get_time_since_last_mix | ENGINE godot | CONFIRMED | Also: returns 0.0 for AudioStreamInteractive (relevant to "pre-sequence it", see teaching) | class_audiostreamplayer.html |
| get_output_latency based on audio/driver/output_latency, differs by OS and driver, expensive, not every frame | traps; ENGINE godot pitfall | CONFIRMED | | class_audioserver.html |
| audio/driver/output_latency = 15 (ms), mix_rate = 44100 | FACTS 2; pitfall | CONFIRMED | The page now says "in milliseconds" explicitly. Note `output_latency.web = 50` on Web. | class_projectsettings.html |
| InputEvent has one property, device, no timestamp | what; ENGINE godot; FACTS 3 | CONFIRMED | | class_inputevent.html |
| Input.use_accumulated_input default on, merges events per rendered frame | FACTS 3; how 5 | CONFIRMED | "enabled by default"; events merged "and emitted when the frame is done rendering" | class_input.html |
| Godot physics 60 per second by default | pitfall | CONFIRMED | physics/common/physics_ticks_per_second = 60 | class_projectsettings.html; physics_introduction.html |
| dspTime: seconds from samples processed, more precise than Time.time | what; ENGINE unity | CONFIRMED | | AudioSettings-dspTime.html (6000.0) |
| PlayScheduled takes absolute dspTime; schedule ~100-200 ms ahead | what; how 3 | CONFIRMED | Re-fetched here (writer had taken it from the sibling) | AudioSource.PlayScheduled.html |
| DSP Buffer Size: Default, Best Latency, Good Latency, Best Performance | trade 1 | CONFIRMED | | Manual/class-AudioManager.html |
| GetDSPBufferSize(out int bufferLength, out int numBuffers) | sources only | CONFIRMED | Not used in the draft text | AudioSettings.GetDSPBufferSize.html |
| OnAudioConfigurationChanged fires on device change (HDMI, USB headset) | how 10; pitfall | CONFIRMED | | AudioSettings.OnAudioConfigurationChanged.html |
| realtimeSinceStartupAsDouble: double, ignores timeScale | snippet | CONFIRMED | | Time-realtimeSinceStartupAsDouble.html |
| Input System event time on Time.realtimeSinceStartup timeline; default update before MonoBehaviour.Update; fixed mode associates by timestamp | what; pitfall; FACTS 4 | CONFIRMED | "best effort" association | inputsystem@1.11 manual/Events.html, Settings.html |
| CallbackContext.time = time action triggered (event timestamp), not callback time | how 5; ENGINE unity | CONFIRMED | | inputsystem@1.11 api CallbackContext |
| "The mixer's buffer (DSP Buffer Size) sets the step of dspTime" | ENGINE unity term | UNSUPPORTED | Plausible inference from "based on the samples processed" and GetDSPBufferSize's "mixes a block ... every bufferLength samples", but no Unity page says dspTime advances in buffer steps. Label as inference or soften to "can move in mixer-block steps". | — |
| "a new device can change the audio clock's relation to the system clock" | ENGINE unity pitfall | UNSUPPORTED | Reasonable advice; no Unity page states it. Keep as advice, not as fact. | — |
| OboeTester: 20 ms all recommendations, 205 ms not low latency, 53 ms buffer at max | why 3; senior; FACTS 5 | CONFIRMED | They are round-trip (input to output) figures; the draft never says so (see teaching). | developer.android.com/games/sdk/oboe/low-latency-audio |
| "62 ms through a path without MMAP" / "62 ms without MMAP" | why 3; FACTS 5 | WRONG | The 62 ms row is "Not using an output callback (not MMAP)". "Not using an output callback (MMAP)" is 21 ms. Correct: "62 ms with no output callback on a non-MMAP path". | same page |
| "the same hardware giving..." / "for the same device" | why 3; senior | UNSUPPORTED | The page does not name a device or say all rows are one device; it adds "Results can vary greatly between different devices." Drop "same hardware". | same page |
| Oboe sets buffer to two bursts; AAudio default much higher; double buffering | how 7; TECH 4; FACTS 5 | CONFIRMED | | same page |
| "Android's NDK page says audio latency from the device's own timestamps misses delay the device does not know about" | traps 6 | WRONG (attribution) | The NDK page says the opposite kind of thing: "There is currently no API to determine audio latency over any path on an Android device at runtime" (page last updated 2024-01-03). The statement is in Oboe's `AudioStream.h`, `calculateLatencyMillis()` doc comment: an external DAC "in a USB interface or a TV connected by HDMI" may add latency "the Android device is unaware of". Cite Oboe's header. | developer.android.com/ndk/guides/audio/audio-latency; github.com/google/oboe/blob/main/include/oboe/AudioStream.h |
| Platform/engine estimate misses Bluetooth | traps 5-6; mid Q1; senior Q1 | UNSUPPORTED | Oboe's header names USB and HDMI only; no primary source read for Bluetooth. Probably true for Godot/Unity's own figures, but say "may miss" or cite a source. | — |
| Oboe: never block inside onAudioReady | traps 8 | CONFIRMED | "You should never perform an operation which could block inside onAudioReady" | Oboe docs/FullGuide.md |
| Android measurement: noise bursts looped through full-duplex stream; microphone path for speaker | TECH 5 alt | CONFIRMED | Measurement is round trip; "microphone permission and a quiet room" is reasonable inference | source.android.com/docs/core/audio/latency/measure |
| Apple: request, check ioBufferDuration; typical max 0.093 s (4,096 frames at 44.1 kHz); min at least 0.005 s (256 frames), maybe lower | how 7; FACTS 6 | CONFIRMED | Raw JSON of the page | developer.apple.com (setPreferredIOBufferDuration JSON) |
| Web Audio: Chris Wilson; timers skewed by tens of ms; 25 ms interval, 100 ms look-ahead | what; TECH 3; FACTS 8 | CONFIRMED | | web.dev/articles/audio-scheduling |
| NVIDIA: input-to-frame-start stage; spread evenly across sampling interval | why 5 | CONFIRMED | "typically spread evenly across the input sampling interval" | developer.nvidia.com/blog/understanding-and-measuring-pc-latency/ |
| ITU-R BT.1359: detectability +45 ms (audio lead) to −125 ms (lag) | why 4; FACTS 7 | CONFIRMED on the primary | BT.1359-1 PDF: "detectability thresholds are about +45 ms to –125 ms and acceptability thresholds are about +90 ms to –185 ms". Replace the Wikipedia src with the ITU PDF (itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.1359-1-199811-I!!PDF-E.pdf). | ITU PDF |
| Adriaensen, "Using a DLL to filter time" is about filtering audio-callback timestamps | TECH 1 cost | CONFIRMED | Paper read: a DLL for "an accurate mapping between samples and system time", introduced into JACK. Delete "which I have not read here" (see style). | kokkinizita.linuxaudio.org/papers/usingdll.pdf |
| "every shipped timing game gives the player a calibration screen" | what ¶3 | UNSUPPORTED | Overgeneralisation; say "most" or "timing games on open hardware". | — |
| Smoothing gain 5 %, 16+ taps, drop first four, 150 ms reject | how 4, 8; snippet | (design advice) | Labelled as advice in the sources; untuned. Not a factual claim. | — |

### Arithmetic (all re-done)
- 1,024 / 48,000 = 21.33 ms. Correct.
- 1 / 60 = 16.67 ms; mean of uniform 0 to 16.7 = 8.33 ms. Correct.
- 100 ppm × 180 s = 0.018 s = 18 ms. Correct (ppm figure is labelled assumed).
- 1 / 50 = 20 ms. Correct.
- 1 / 240 = 4.17 ms, given as 4.2. Correct.
- 4,096 / 44,100 = 92.9 ms (Apple rounds to 0.093 s); 256 / 44,100 = 5.8 ms, 256 / 48,000 = 5.3 ms (Apple's "0.005 s" is approximate). Draft quotes Apple's figures only; fine.
- 205 / 20 = 10.25, "ten times larger". Correct.

## Code issues

Unity snippet (C#, Unity 6, Input System): every API checked on the 6000.0 / 1.11 references:
`AudioSettings.dspTime` (static double), `Time.realtimeSinceStartupAsDouble` (static double),
`InputAction.CallbackContext.time` (double) and `.performed` (bool), `AudioSettings.OnAudioConfigurationChanged`
(static event), `AudioSource.PlayScheduled(double)`. It compiles as written. Not compiled here (no Unity).
- The low-pass gain 0.05 is per frame, so its time constant depends on frame rate (about 0.33 s at 60 fps,
  0.14 s at 144 fps). Say so, or scale by `Time.unscaledDeltaTime`.
- The snippet does not subtract an output-latency term although `good[0]` says song time has "the output
  latency and the player's calibration subtracted". Unity exposes no output-latency figure; say that the
  calibration offset carries it in Unity.
- Because dspTime is sampled in steps and realtime continuously, the filtered offset carries a bias of
  about half a mixer block; harmless because calibration absorbs it, worth one clause.

Godot snippet (GDScript, Godot 4): `AudioStreamPlayer.get_playback_position()`, `AudioServer.get_time_since_last_mix()`,
`AudioServer.get_output_latency()`, `InputEvent.is_action_pressed(action, allow_echo=false, exact_match=false)`,
`maxf(a: float, b: float)` all exist with those signatures in the stable (4.7) reference. Valid GDScript,
14 lines. Not run here.
- `_last` is never reset. After a stop, seek or restart the clock freezes until the new position passes
  the old maximum; while the player is paused `get_time_since_last_mix()` keeps growing, so `_last` latches
  a value past the paused position. The draft's own verify list asks about pauses; the snippet fails it.
  Add a reset on play/seek/pause, or note it in the pitfall.

No Go snippet in the draft.

## Teaching issues

1. Godot's recommendation is inverted (WRONG row above). The system-clock recipe the manual recommends
   uses `Time.get_ticks_usec()` plus `get_time_to_next_mix() + get_output_latency()`, not summed frame
   deltas; the draft blurs "system clock" with "frame clock". Fix: state that Godot recommends the
   system-clock method for few-minute songs, that the hardware method is less precise but does not drift,
   and why this topic still prefers the audio-derived clock (pauses, device changes, long sessions).
   Why 1's 18 ms example then reads as "why long sessions or hitches need the audio clock", not as a
   contradiction of the engine docs.
2. OboeTester figures are round-trip (input plus output). Using them as "the latency a game ships"
   overstates output-only delay. Say "round-trip" in why 3 and the senior answer.
3. "In Godot, start the stream at a computed offset or pre-sequence it" (TECH 3) is thin: Godot 4 has no
   scheduled start like PlayScheduled (`play(from_position)` only). If "pre-sequence" means
   AudioStreamInteractive, `get_playback_position()` then always returns 0.0, which breaks this topic's
   own Godot clock. Say so.
4. ITU-R BT.1359 thresholds are for broadcast lip sync (speech and picture), not for tap feedback; the
   draft applies them to games without saying they are a proxy.
5. TECH 1 calls a one-pole low-pass "a delay-locked loop of this kind". A DLL (per the paper) also tracks
   the rate (period); the snippet's filter tracks only the offset. Say "a simpler cousin of".

## Missing coverage (against the brief's Must cover)

- Apple Core Audio: only AVAudioSession's IO buffer duration is covered; no route-change notification or
  host-time API (the sources file admits these were not read). Thin.
- Godot "scheduling sounds ahead": no real API given (see teaching 3). Thin.
- Everything else in Must cover is present: drift and jitter, dspTime and PlayScheduled, the three Godot
  APIs, input timestamps vs polling, the latency chain including Bluetooth, tap tests with separate
  audio and visual offsets, judging against song position with offsets, fixed-step interaction, both
  engine tabs.

## Repetition with the sibling draft (rhythm-and-music-timed-design)

- Junior Q1 here ("Why not move the notes with Time.deltaTime...") is nearly the same question as the
  sibling's junior Q1 ("Why not drive the notes from Time.deltaTime added up each frame?"). Replace one.
- TECH "Separate audio and picture offsets, saved per route" repeats the sibling's TECH "Separate audio
  and video calibration". Acceptable if this one keeps the per-route storage angle and links the sibling.
- The Godot snippet's core recipe (position + since-last-mix − output latency) and the "estimate misses
  Bluetooth/TV" trap repeat the sibling. The sibling carries the same misattribution risk; its fact-check
  already moved the claim to Oboe.
- The senior Android question overlaps the sibling's "rhythm mechanic on phones" question in substance.

## Style

- TECH 1 cost: "the reference I know of, which I have not read here" is writer-to-checker text in first
  person. Replace with a plain citation (now confirmed).
- No hype words, no US spellings found ("quantises", "behaviour" not present; "robust statistic" is the
  technical term). No employer, colleague or internal project named.

## Set aside

- Unity default fixed timestep (0.02 s): the draft deliberately claims no default; the TimeManager page
  does not state one; `Time.fixedDeltaTime` page gives none either. Not flagged.
- Android `low_latency` 45 ms / `pro` 20 ms flags: in the sources file but not in the draft text. Not flagged.
- "Bluetooth and television paths add delay the engine cannot report" for Unity/Godot: engines expose no
  such figure in the pages read; counted once as UNSUPPORTED for the platform-estimate wording, not again here.
- The 44,100 Hz AAudio row (160 ms) in the OboeTester table is not used; it would be a useful addition
  (Godot's default mix_rate is 44,100) but its absence is not an error.
- Godot `output_latency.web = 50`: omission of a Web-only override; the draft does not target Web.
- Diagram LONG warning (8 layers, guide 6): reported by the validator as never an error; the 8 layers
  match the chain the topic teaches.
- Repp 2005 negative mean asynchrony: relied on via the sibling; that draft's fact-check owns it.
- "Unity dspTime is stepped": counted once under the DSP Buffer Size row.
- Validator "no inbound links" WARN: expected for a new draft.
