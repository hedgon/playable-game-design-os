# Fact-check: backtracking-and-return-trips

Checked 2026-10-05 against `drafts/backtracking-and-return-trips.js`, its `.sources.md`,
`briefs/topics.md` (`## backtracking-and-return-trips`) and `briefs/topic-common.md`.
Validator run: `PLAYABLE_DRAFTS=docs/program-2026-10/drafts/backtracking-and-return-trips.js node src/validate.js`
ends `OK: all cross-links resolve, all topics complete.`

## Verdict: PASS WITH FIXES

Two wrong details, one unsupported game detail, a logic contradiction in both engine
snippets, and missing coverage (Zelda absent, Elden Ring only in FACTS, no primary
developer source anywhere in the body). None is structural; all are fixable in place.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
|---|---|---|---|---|
| "Metroid (1986) and Castlevania lineage" | `what` | CONFIRMED | Secondary only; no primary needed for release years | https://en.wikipedia.org/wiki/Metroidvania |
| "Super Metroid (1994) added an auto-map" | `what` | CONFIRMED | The library's own Hollow Knight analysis says the same (`src/16-games-analysis.js` line 54) | https://en.wikipedia.org/wiki/Super_Metroid |
| "Symphony of the Night (1997) added RPG growth and a very large castle" | `what` | CONFIRMED | Secondary | https://en.wikipedia.org/wiki/Castlevania:_Symphony_of_the_Night |
| Mega Man X "clearing one stage cuts the power in another and removes hazards there" | `what`, TECH "World state changes" | CONFIRMED | Storm Eagle's airship wreck shorts the spark traps in Spark Mandrill's stage. Another example: Chill Penguin freezes the lava in Flame Mammoth's stage. No developer (Capcom) source found; the primary evidence is the game itself | https://vgmuseum.com/mrp/mm-stages3.htm , https://en.wikipedia.org/wiki/Mega_Man_X_(video_game) |
| Firelink Shrine as a hub with loops back to it | `what`, TECH "Fold the map" | CONFIRMED | Secondary. No FromSoftware interview read; the Design Works interview was seen only as a summary by the writer and not reopened | https://en.wikipedia.org/wiki/Dark_Souls |
| "Dark Souls' bonfire warp that comes mid-game" | TECH "Fast travel limited", FACTS | CONFIRMED | Warping comes with the Lordvessel, given after Ornstein and Smough in Anor Londo. Missing nuance worth one clause: you can warp from most bonfires but only TO a small set of lit ones, which is itself a design lever | https://darksouls.wiki.fextralife.com/Lordvessel (fan wiki; in-game item text is the primary) |
| Outer Wilds "22-minute loop" | TECH "World state", FACTS | CONFIRMED | No Mobius Digital page found in one search; reviews (Edge, Wireframe) state it | https://wireframe.raspberrypi.com/articles/outer-wilds-review-death-and-translation-in-the-final-frontier |
| Outer Wilds "only thing that persists is the ship-log data" | FACTS | CONFIRMED | Fine as save data; the player's own knowledge is the real carry-over, which the draft says elsewhere | same |
| Cornifer map prices "30 Geo ... up to 150 Geo for Queen's Gardens and Fog Canyon" | FACTS | CONFIRMED | Fan wiki only; no Team Cherry source exists (in-game shop is the primary). Iselda sells the same maps at a higher price (Cornifer charges 75%), worth saying since the draft names only Cornifer | https://hollowknight.wiki/w/Cornifer |
| "the Quill costs 120 Geo" | FACTS | CONFIRMED | Fan wiki | https://hollowknight.wiki/w/Iselda |
| "the pins 100 Geo each" | FACTS | WRONG | Most pins are 100, but Whispering Root Pin is 150 and Warrior's Grave Pin 180; markers are 100, Gleaming Marker 210. Write "most pins 100 Geo" | https://hollowknight.wiki/w/Iselda |
| "Wayward Compass charm 220 Geo" | FACTS | CONFIRMED | Fan wiki | https://hollowknight.wiki/w/Iselda |
| "Maps are updated by resting at benches" (with the Quill) | FACTS, TECH "The map is part of the game" | CONFIRMED | Fan wiki | https://hollowknight.wiki/w/Map_and_Quill_(Hollow_Knight) |
| "Maps are bought from a cartographer found in each area" | INTERVIEW mid Q2 `a` | WRONG (minor) | Cornifer sells maps for most areas, not all: none for Resting Grounds, the Abyss or the Hive; Iselda's shop also sells maps. Write "in most areas" | https://hollowknight.wiki/w/Cornifer |
| "Hollow Knight ... keeps the player drawing their own notes on top" | `think.trade` | Misleading wording | The player cannot draw; they place bought pins and markers. Say "placing bought pins and markers" | https://hollowknight.wiki/w/Iselda |
| Hollow Knight Stag Station network | TECH "Fast travel limited" | CONFIRMED | Secondary | https://en.wikipedia.org/wiki/Hollow_Knight |
| Skyrim "travel to discovered locations" | TECH "Fast travel limited" | CONFIRMED | From any exterior location to any discovered location, free; carriages (20 or 50 gold) reach undiscovered hold capitals. Note it is free and from anywhere, so Skyrim sits nearer the row's `alt` ("free fast travel from anywhere") than its `how` (unlock later, charge, tie to a visit). Community wiki only; Bethesda manual not found | https://pt.uesp.net/wiki/Skyrim:Movement (via search), https://content1.m.uesp.net/wiki/Skyrim:Carriage |
| Elden Ring "fast travel built into the open world, map fragments must be found" | FACTS | CONFIRMED (as worded) | Wording is general enough to be true. Not used anywhere in the teaching | https://en.wikipedia.org/wiki/Elden_Ring |
| Metroid Dread "lock the player into a small part of the world ... at many points", "Mark Brown's analysis lists it" | TECH "Segment the world" | CONFIRMED (practitioner analysis) | The GMTK video "Why You Didn't Get Lost in Metroid Dread" makes this point (temporary lock-in to small map segments, points of no return the player rarely notices). Transcript still returns 403; confirmed via the video's description and search summaries. Cite the YouTube video itself in the draft | https://amara.org/en-gb/videos/Aci4iDbgsAtY |
| Metroid Dread map "lets the player highlight icons and shows more detail than earlier games" | TECH "The map is part of the game" `alt`, INTERVIEW mid Q1 | CONFIRMED, can be sharpened | PRIMARY SOURCE FOUND: Nintendo's Metroid Dread Report Vol. 9: select an icon and press Y for Icon Highlight, which highlights similar points of interest across the map; it can spotlight all doors a newly acquired ability can unlock; areas still holding hidden items glow. This also confirms the owner brief's "highlights of interactable blocks". "More detail than earlier games" is unsourced and vague; replace with the Icon Highlight facts | https://metroid.nintendo.com/dread/news/metroid-dread-report-vol-9 |
| Dread "squeeze-through gap ... the same space becomes a one-way route" | `how` step 3, INTERVIEW mid Q3 | UNSUPPORTED | The writer's sources entry was a search summary only; no transcript or primary found. See also the teaching issue below: it is used as the wrong example | none |
| Unity `Time.time` "follows the time scale and stops while ... Time.timeScale set to 0" | ENGINE unity `pitfall` | CONFIRMED | Unity: Time.time is the time since start "which Time.timeScale scales" | https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Time-time.html |
| `Time.realtimeSinceStartup` measures real time | ENGINE unity `map` | CONFIRMED, with a note | Unity 6 docs recommend `Time.realtimeSinceStartupAsDouble` in most cases for precision over long sessions, which a pacing log is | https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Time-realtimeSinceStartup.html |
| Godot `Time.get_ticks_msec()` is real time | ENGINE godot `map` | CONFIRMED | Milliseconds since engine start, not scaled by `Engine.time_scale` | https://docs.godotengine.org/en/stable/classes/class_time.html |

Counts: WRONG 2 (one minor), UNSUPPORTED 1, OUTDATED 0, plus one misleading wording.

## Primary-source status (coordinator note 1)

- Metroid Dread map: primary exists and was read (Nintendo Dread Report Vol. 9). Use it.
- Metroid Dread segmenting: the GMTK video is the practitioner primary; cite its YouTube URL.
  The slide-gap detail has no source.
- Hollow Knight prices: no Team Cherry source exists; only the game and fan wikis. Keep the
  FACTS row with its `asOf` and say "prices in the shop, as listed by the community wiki".
  For Team Cherry's map intent, the library already cites Game Informer's making-of
  (https://www.gameinformer.com/2018/10/15/the-making-of-hollow-knight) in
  `src/16-games-analysis.js` line 58; the draft could use it.
- Dark Souls, Mega Man X, Skyrim: no developer or manual source found in one search each; the
  evidence is the games themselves via fan and community wikis. Acceptable as FACTS with that
  label.
- Outer Wilds: reviews only; no Mobius page found.
- No GDC talk or developer interview is used anywhere in the body, though the brief asks for
  them (Mercury Steam, Team Cherry). This is the largest sourcing gap.

## Library game ids (coordinator note 2)

`zelda` (`src/18-games-series.js` line 2273) and `mega-man-x` (line 1159) both exist, as do
`hollow-knight`, `dark-souls`, `elden-ring`, `outer-wilds`, `skyrim`. Games link to topics
through each game's `topics:[...]`, so the coordinator should add
`backtracking-and-return-trips` there. Places the draft should name them:

- **zelda**: absent from the draft. Best fit: TECH "Lock seen before key" and the `what`
  ability-gate sentence. The library's own entry already says the dungeon item opens the
  dungeon's last door and often an overworld obstacle (around line 2281), the classic
  lock-before-key loop; GMTK's Boss Keys series is the practitioner source the brief names.
  Majora's Mask's Bombers' Notebook (same entry, around line 2324) is a ready memory-aid
  example for `how` step 6 or the "Recall" diagram step.
- **mega-man-x**: named in `what` and TECH "World state changes"; add the id link there and
  optionally the Chill Penguin / Flame Mammoth lava case as the clearer example.
- **elden-ring**: only in FACTS. Use it in TECH "Fast travel limited" or its `alt` as the
  free-from-anywhere contrast to Dark Souls' late, restricted warp (same studio, opposite
  rule), which is a strong teaching pair. Verify the "anywhere outside dungeons" rule before
  stating it; I did not.
- **skyrim**: move or qualify as above (free, from anywhere outdoors).

## Chore meter honesty (coordinator note 3)

The draft gives no numeric thresholds. It says the open-gate limit is "which you will find
from playtesting, not from this page", `verify` uses "a number you chose in advance", and
`ai.no` leaves the boredom threshold to playtest. That part is honest.

What is not marked: the metrics themselves (time since last new thing, repeated-stretch
length, repeat visits per room) are the writer's own proposal per `.sources.md`, but `how`
step 9, the ENGINE `term` and the senior interview answer present them as the standard
method, and the senior answer states "A chore has a long flat stretch and a spike in quits"
as fact. Add one sentence in `how` step 9 saying this is a proposed measure, not an
established industry metric, and soften the senior answer's heuristic to "what I would look
for".

## Code issues

1. Logic contradicts its own pitfall (both engines). The condition
   `has_new_thing and not _seen.has(id)` (Unity: `hasNewThing && !seen.Contains(id)`) counts
   a known room that now holds something new as stale, yet the Godot pitfall says "a known
   room can hold a changed ability route" and the topic's thesis is that changed old rooms
   are the good return trip. The meter therefore reports the best return trips as chore. Fix:
   test `has_new_thing` alone and use `_seen` only to label the log line (new room vs changed
   room). It also counts new-but-empty rooms into "old rooms between", so the label is wrong.
2. `api[]` lists APIs the snippets do not use: Godot `Area2D.body_entered`,
   `FileAccess.open()`; Unity `OnTriggerEnter2D(Collider2D)`,
   `Application.persistentDataPath`. CONTRIBUTING requires snippets "using the APIs named in
   api[]"; either drop them or say in `term` that they are the wiring around the snippet.
3. Godot `(now - _last_new_ms) / 1000` raises the INTEGER_DIVISION warning in Godot 4. Harmless
   but noisy; `/ 1000.0` with `%.0f`, or `int(...)`, avoids it.
4. Unity: prefer `Time.realtimeSinceStartupAsDouble` (docs recommendation); `seen.Add(id)`
   returns bool and could replace `Contains` + `Add`. The snippet has no `using` lines; fine if
   the exemplars omit them too.
All APIs named were confirmed to exist; none could not be confirmed.

## Teaching issues

1. Dread squeeze-gap used as the example of "the ability changing how the room plays" (`how`
   step 3, interview mid Q3). A one-way passage is the segmenting technique (TECH "Segment
   the world"), not a traversal upgrade re-playing an old room. Replace with a sourced
   example (e.g. Hollow Knight's Mantis Claw or Monarch Wings turning a floor route into a
   wall or air route, or a Super Metroid Speed Booster run), or move the gap to the segment
   row once sourced.
2. Unmarked practitioner claims stated as fact: "Fast travel ... removes the player's mental
   map" (`think.trade`), "Past a few open locks, memory fails first" (`think.traps`), "A
   reward that appears in the first thirty seconds ... makes a long walk acceptable" (`how`
   step 7, a specific number with no source). The writer's sources file calls these its own
   reasoning; the style rule says mark contested claims as contested. The draft's own `test`
   item on fast travel is good and could be cited as the way to check the first one.
3. Skyrim placed under the "limited" fast-travel row although it is free from anywhere
   outdoors (see table).
4. Dark Souls: the warp-to subset of bonfires is the interesting design lever and is missing.
5. "Hollow Knight ... drawing their own notes": pins, not drawing.

## Missing coverage (against "Must cover")

- **Zelda**: absent (see above). Lock-before-key has no game example at all.
- **GMTK Boss Keys and developer sources**: no GDC talk, Mercury Steam or Team Cherry interview
  used; Boss Keys not cited.
- **Telemetry heatmaps**: only in `rel` and a follow-up question; no `how` or `test` step uses
  a heatmap or says how to read one (hot corridor = forced route vs chosen route).
- **Elden Ring**: FACTS only, no teaching use.
- **Elevator shortcuts**: mentioned generically in TECH; the Undead Parish to Firelink elevator
  is the canonical example and is not named.
- **Knowledge gates**: Outer Wilds gets one sentence; acceptable given the `rel` to
  `knowledge-as-progression`, but thin.
- Covered adequately: why games ask you back, lineage, lock-before-key pattern, shortcuts,
  fast-travel trade-offs, map design, traversal upgrades, respawning vs changed world,
  signposting and memory aids, pacing returns, measuring chore.

## Style

No hype words, no US spellings found (grep for -ize/-ization, color, center, behavior and
the banned words returned only "size"). No employer, colleague or internal project of the
site's owner appears.

## Set aside

- "Super Metroid among the first open world games with a map feature": in `.sources.md`
  only, not in the draft.
- Oblivion fast-travel anecdote and the CHI 2008 TRUE paper: in `.sources.md`, not used in
  the body.
- Hypothetical figures in the interview ("fast travel is a day's work", "40 gates"): scenario
  framing, not factual claims.
- Super Metroid and SotN release years: well established, secondary source sufficient.
- Elden Ring "fast travel from anywhere outside dungeons": not in the draft; not verified, so
  not stated as fact above.
- Unity snippet without `using` directives: not checked against the exemplars; flagged only
  as a note.
- EXPLAINER frames and DIAGRAM: abstract, no factual claims; the `loop` kind validated.
- `rel` reasons: validator passes; wording reads accurate against the brief's rel list
  (`metrics-and-success` is an extra, reasonable).
