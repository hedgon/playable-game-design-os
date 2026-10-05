# Fact-check: puzzles-in-action-spaces

Checked 2026-10-05 against `drafts/puzzles-in-action-spaces.js` and `.sources.md`, the
`## puzzles-in-action-spaces` section of `briefs/topics.md` and `briefs/topic-common.md`.
The draft was not edited. Sources were fetched raw with curl (Wikipedia via `action=raw`,
other pages as HTML stripped to text), not through a summariser.

## Verdict: PASS WITH FIXES

WRONG 2, UNSUPPORTED 5, OUTDATED 0. No code errors. The fixes are wording and attribution;
none needs a structural rewrite. One integration dependency: the draft must ship with or
after `backtracking-and-return-trips` (see Validation).

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
|---|---|---|---|---|
| CrossCode's developer describes it as "Yoshi's Island made top-down and turned into an RPG" | `what` | CONFIRMED | Felix Klein (Radical Fish): take Yoshi's Island, make it top-down instead of side-view, turn it into an RPG. Primary press interview, read raw. | https://www.siliconera.com/crosscode-developer-reflects-rpgs-six-years-evolution/ (6 Jun 2017) |
| Fights have puzzle-like rules and puzzles can be fast | `what` | CONFIRMED | Klein: battles with "very puzzle-heavy mechanics" and puzzles that are "really fast paced". | Siliconera, above |
| One ball-launching mechanic for combat and puzzles; elements include switches, boxes, barriers, fans | `what`, TECH row 1, `facts[0]` | CONFIRMED | Wikipedia: puzzles use "the same ball launching mechanic used in combat"; switches, boxes, ice pellets, barriers, water bubbles, fans. Developer origin (2011 prototype of balls bouncing on walls) confirmed in the Siliconera interview. | https://en.wikipedia.org/wiki/CrossCode ; Siliconera |
| Indiegogo in February 2015 | `facts[0]` | CONFIRMED | Feb 2015, seeking EUR 80,000 (secondary). | Wikipedia CrossCode |
| PC release 20 September 2018 | `facts[0]` | CONFIRMED | Linux, macOS, Windows, 20 Sep 2018 (secondary). | Wikipedia CrossCode |
| "a puzzle may require a bounce or a charged shot" | TECH row 1 `how` | UNSUPPORTED | Not stated in either CrossCode source read. Wikipedia mentions order and time-limit requirements and element-dependent reactions. Plausible; reword to the sourced form ("hit in a certain order or within a time limit; elements react differently") or source it. | Wikipedia CrossCode |
| Aonuma: start from what kind of play the dungeon should hold, puzzle vs action, then how the player uses the item on the environment | `what`, TECH row 2 | CONFIRMED | Matches the interview text closely. The interview is Kotaku, February 2015 (the republication is dated 18 Feb 2015), which settles the writer's "c. 2015". Kotaku itself returned 403 to me too; read through the republication. | https://gameluster.com/aonuma-on-how-nintendo-makes-zelda-dungeons-majoras-masks-melancholy-tone-anju-and-kafei-quest/ |
| "Alternation is what most Zelda-style dungeons are built on" | `why[1]` | UNSUPPORTED | Stated as fact with no source; the sources file lists the pacing frame as unsourced practitioner reasoning, and the DIAGRAM note marks it as a heuristic, but `why[1]` does not. Mark it as a reading to test. | none |
| Game Accessibility Guidelines bypass guideline, Intermediate | `why[4]`, interview mid 3, `facts[1]` | CONFIRMED | Title exact; "Category & Level: General (Intermediate)"; examples Deadly Scramble no timer mode, LA Noire skip action sequence, Mass Effect Andromeda experience choice, Nier: Automata Auto Chips. Primary, read raw. | https://gameaccessibilityguidelines.com/offer-a-means-to-bypass-gameplay-elements-that-arent-part-of-the-core-mechanic-via-settings-or-in-game-skip-option/ |
| The guideline's examples are "puzzles in a shooter or timed sequences" | `why[4]` | WRONG | The page's own examples are "a puzzle sequence in a first person shooter or a button mashing round in a quiz game". "Timed sequences" is not among them (only indirectly, via Deadly Scramble's no-timer mode). Replace "timed sequences" with "a button-mashing round in a quiz game", or drop it. | GAG page, above |
| Super Guide after eight consecutive deaths in a level, single player; CPU Luigi; interrupt or skip | `how[8]`, TECH row 6, `facts[2]` | CONFIRMED (secondary) | Wikipedia: "if a player dies eight times in a row in any level", single-player, green "!" block, Luigi shows a safe path, can interrupt, then retry or skip. No Nintendo primary found: Iwata Asks NSMBW parts 0-3 do not mention the trigger count. TECH row 6 omits "in a row" and "single player"; add them. | https://en.wikipedia.org/wiki/New_Super_Mario_Bros._Wii |
| Portal: ~2 years 4 months at Valve, no more than ten people, from 2005 DigiPen Narbacular Drop, released 10 Oct 2007 in The Orange Box | `facts[3]` | CONFIRMED (secondary) | All four values match Wikipedia. | https://en.wikipedia.org/wiki/Portal_(video_game) |
| Portal's early chambers give obvious/heavy hints and remove them as it goes | TECH row 3, interview mid 1 | UNSUPPORTED (by any Valve source) | Wikipedia states it, but cites a 2008 librarianship article (Schiller, Reference Services Review), not Valve. Attribute it ("a 2008 study of Portal as instructional scaffolding describes...") or find the Valve developer commentary. | Wikipedia Portal, reception section |
| Portal is "a pure puzzle game with one verb and no combat" | `what` | CONFIRMED with caveat | No player attack, but turrets and energy pellets are hazards, and Wikipedia mentions a live-fire course. See Teaching issues. | Wikipedia Portal |
| Breath of the Wild: four Divine Beasts as extended puzzles | `facts[4]` | CONFIRMED (secondary) | "the Divine Beasts ... act as extended puzzles". | https://en.wikipedia.org/wiki/The_Legend_of_Zelda:_Breath_of_the_Wild |
| BotW "optional shrines holding puzzle or combat challenges" | `facts[4]` | WRONG (partly) | Shrines hold "challenges ranging from puzzles to battles", but they are not all optional: the four Great Plateau shrines must be completed to get the paraglider and leave the plateau. Write "shrines, all but the four opening Great Plateau shrines optional". This also makes a good teaching example: the four required shrines are the game's safe teach rooms. | Wikipedia BotW; https://en.wikipedia.org/wiki/Great_Plateau |
| Producer said a physics puzzle can have several solutions | `facts[4]` | CONFIRMED (secondary) | Aonuma: the physics engine lets players "approach puzzles and problems in different ways". | Wikipedia BotW |
| Boss Keys: ALttP only some bosses weak to the dungeon item, one requires it; Link's Awakening nearly every boss falls to the key item | TECH row 7 | UNSUPPORTED | The writer saw this only in a search summary. I could not reach the episodes either: amara.org API returns 403 for both video ids, zeldauniverse.net returns 403. My own recollection of the games is consistent (Arrghus needs the Swamp Palace hookshot), but that is not evidence. Verify against the videos or remove. | none reachable |
| Boss Keys: "some bosses need the item, others only weaken to it" | interview senior 1 | UNSUPPORTED | Same source problem as above. | none reachable |
| Mark Brown's Game Maker's Toolkit "Boss Keys" series exists and maps Zelda dungeons | TECH row 7, interview | Set aside | Not disputed, and no specific figure depends on it beyond the two rows above. | — |

No arithmetic appears in the draft. I checked each number in it (eight deaths, 2 years 4
months, ten people, 2005, 10 Oct 2007, Feb 2015, 20 Sep 2018, four Divine Beasts) against
the sources above. The five-player playtest, the three-step hint ladder and the five-beat
spine are prescriptions, not facts. `Vector2.RIGHT * 300.0` is an example value.

## Code issues

Nothing was compiled or run. There is no Go snippet. All APIs were confirmed on the official
reference pages:

- Godot 4 (docs `stable`): `PhysicsBody2D.move_and_collide(motion: Vector2, test_only=false,
  safe_margin=0.08, recovery_as_collision=false) -> KinematicCollision2D` (inherited by
  `CharacterBody2D`; the `api[]` entry names it `CharacterBody2D.move_and_collide()`, which
  is acceptable); `KinematicCollision2D.get_collider() -> Object`; `get_normal() -> Vector2`;
  `Vector2.bounce(n: Vector2) -> Vector2` (the docs note it is what other engines call
  reflect); `Object.has_method(method: StringName) -> bool`. The GDScript reads correctly
  line by line: `hit` infers `KinematicCollision2D`, `other` infers `Object`, and
  `other.on_hit(self)` behind `has_method` is the standard duck-typed call. At most it
  raises the UNSAFE_METHOD_ACCESS warning, which is off by default.
- Unity 6 (6000.0 ScriptReference): `MonoBehaviour.OnCollisionEnter2D(Collision2D)`,
  `Collision2D.collider` (the incoming collider, i.e. the other object, which is what the
  snippet wants), `Component.TryGetComponent<T>(out T)` (works with an interface type),
  `PhysicsMaterial2D.bounciness`, `Object.Destroy(Object, float t = 0)`. The C# is valid.
- Minor, Unity `map` line: "bounciness 1 and no friction does what Vector2.bounce() does".
  The docs say bounciness 1 is perfect elasticity only "(approximately)", and
  `Physics2D.bounceThreshold` treats any contact below that relative speed as inelastic, so
  a slow ball stops bouncing. Add "above Physics2D.bounceThreshold" or "roughly".
- Minor, Godot: `move_and_collide` stops at the contact and the snippet discards
  `get_remainder()`, so a fast ball loses the rest of that frame's travel on each bounce.
  This is harmless for teaching. A single clause would cover it if the coordinator wants.

## Teaching issues

1. Internal tension about bosses. `what` says the Zelda series' "boss asks for it again",
   while TECH row 7 (if it survives verification) says most ALttP bosses do not require the
   item. Soften `what` to "often asks for it again".
2. Portal as "one verb and no combat". Portal's energy pellets, which you redirect through
   portals into a receptacle, are a bounced-projectile switch: the closest pure-puzzle
   relative of CrossCode's ball. Portal is a better contrast if it says "no attack verb"
   rather than "no combat", and it could note this parallel.
3. `why[1]` presents the alternation pattern as the basis of "most Zelda-style dungeons".
   Mark it as contested or a reading, as the brief requires for unsourced frameworks.
4. `how[8]` reads awkwardly: "Games exist that offer a help sequence after repeated
   failures;". Cut that clause and keep the NSMBW example.
5. The draft shows the cost of most tricks well: brute force for the shared verb,
   predictability for one item per dungeon, length for teach-then-combine, stale
   checkpoints. Nothing is presented without its cost.

## Missing coverage (against "Must cover")

- Hollow Knight (platforming as puzzle) is named in the brief's examples and is absent. The
  writer omitted it for lack of a developer source, which is defensible. The coordinator
  should either source it (White Palace / Path of Pain) or accept the gap.
- "Nintendo developer talks": only the 2015 Aonuma interview is used in the body. The BotW
  GDC 2017 talk is in `facts` only, through Wikipedia. The four required Great Plateau
  shrines would supply a Nintendo-shipped example of the safe teach room.
- Every other must-cover item is present: shared combat verbs (CrossCode, Zelda items),
  alternating pacing, teach then combine, checkpoints and room resets, skill versus logic
  puzzles, optional versus required, skip options, boss grammar.

## Validation and siblings

- `PLAYABLE_DRAFTS=...puzzles-in-action-spaces.js,...backtracking-and-return-trips.js node
  src/validate.js` ends with `OK: all cross-links resolve, all topics complete.` For this
  draft it adds only `WARN topics with no inbound links: puzzles-in-action-spaces` and
  `DRAFT not in any learning path`, both expected for a draft.
- Run alone, it fails with `ERRORS: puzzles-in-action-spaces: rel -> unknown
  backtracking-and-return-trips`. Integrate the two together, or the sibling first.
- Repetition of the sibling: none of substance. `backtracking-and-return-trips` mentions the
  Zelda dungeon item loop and Boss Keys at map scale. This draft covers the rooms, and its
  `rel` reason states that division.

## Style

No US spellings found (an -ize/-or/color/center scan found nothing; "colour" is used). No
banned or hype words. No employer, colleague or internal project of the owner is named.

## Set aside

- The existence and authorship of Boss Keys (Mark Brown, GMTK): well established, and no
  figure rests on it beyond the two UNSUPPORTED rows.
- The Felix Klein quotes are paraphrased, not quoted, so wording drift is acceptable. The
  meaning matches the interview.
- The CrossCode 2011 start date, EUR 80,000 target and elemental switching are in the
  sources file but not in the topic body, so there was nothing to flag.
- The Wind Waker and Ocarina Boss Keys notes, the Symphony of the Night lead and the Kim
  Swift GDC lead are not used in the body. Not checked.
- Prescriptive numbers (five testers, three hint steps, "no more than two of the same
  beat") are design rules the draft labels as rules to test, not facts.
- "Reset on exit is a common pattern in 2D Zelda-style rooms" is labelled in the draft as
  observed in play and not cited. That is honest enough to leave.
- The GDScript UNSAFE_METHOD_ACCESS warning is off by default and idiomatic, so it is not a
  defect.
- The EXPLAINER block has five frames and the last one is the complete picture, as the
  brief requires. There are no factual claims in it.
