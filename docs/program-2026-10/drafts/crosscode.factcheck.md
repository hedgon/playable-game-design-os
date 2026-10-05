# Fact-check: crosscode (GAME draft)

Checked 2026-10-05 against `docs/program-2026-10/drafts/crosscode.js`, its `.sources.md` and `.shots.md`,
`briefs/games.md` (section `### crosscode`) and the rubric in `docs/references/analysis-method.md`.
Primary pages fetched raw with curl: Steam appdetails API and appreviews API, Wikipedia (raw wikitext),
Siliconera 2017 interview, GoNintendo 2020 (relaying a Siliconera Q&A with Felix Klein), Source Gaming 2017,
TheSixthAxis review, CoG Connected review, and all 20 Steam store screenshots (viewed). Unreachable:
radicalfishgames.com (connection refused, also via WebFetch), moddb (Cloudflare challenge), Wayback (429),
fandom and BreezeWiki mirrors (Cloudflare / Anubis / 402), Gematsu (Cloudflare).

Validator: `PLAYABLE_DRAFTS=<crosscode + the five draft topics> node src/validate.js` gives one error,
`image file assets/games/crosscode.jpg does not exist` (expected), and `DRAFT not in any learning path`
(expected). Every `lens.*.topics` id and the screen diagram's topics resolve once the five draft topics are added.

## Verdict: PASS WITH FIXES

The facts are mostly right and well sourced. Fix before you integrate it: the screen diagram (three of its five
regions do not match the real HUD), the proposed gameplay screenshot (it does not show what its caption says),
the guild sentence in `world`, "each dungeon introduces an element", and two review claims that the cited reviews
do not make (or contradict). The sound lens fails rubric item 4 and needs real moments.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
| --- | --- | --- | --- | --- |
| Radical Fish Games dev, Deck13 publisher, 2018 | header, business | CONFIRMED | Steam also lists WhisperGames, DANGEN, Mayflower as regional publishers (no change needed) | Steam appdetails API |
| Development began 2011 | business | CONFIRMED | Klein: "since the end of 2011" | Siliconera 2017; Wikipedia |
| Indiegogo from February 2015, EUR 80,000 target | business | CONFIRMED | | Wikipedia (Development) |
| Early Access on Steam 2015, three years | why, business | CONFIRMED | | Wikipedia |
| PC release 20 September 2018 | business | CONFIRMED | "20 Sep, 2018" | Steam API; Wikipedia |
| Switch/PS4/Xbox One 9 July 2020 | business | CONFIRMED | | Wikipedia infobox and text |
| Wii U version became unfeasible; Deck13 helped move the JavaScript code | business | CONFIRMED | Wikipedia: Wii U version delayed, then the Wii U was discontinued; Deck13 compiled the JS for consoles | Wikipedia |
| A New Home, 26 February 2021, large final dungeon | business, escalate | CONFIRMED | Wikipedia: "a new area, a dungeon"; the plot text calls it "the game's final dungeon" | Wikipedia |
| SXSW 2019 "Most Fulfilling Community-Funded Game" | business | CONFIRMED | Wikipedia ref: PlayStation LifeStyle, 17 Mar 2019 | Wikipedia |
| Gameplay first, then map, then story; about half the story held back | why, lore, business | CONFIRMED | | Wikipedia (citing Game Developer) |
| Team analysed older games from a designer's view so as not to clone them | signature.copies | CONFIRMED | "look at them from a game designer perspective" | Wikipedia |
| 7 areas, 7 dungeons, 120+ enemy types, 30+ bosses, 90+ combat arts, 100+ quests, 60+ tracks, 30-80 h | gameplay, sound, replay | CONFIRMED | Steam: "over 120 enemy types", "30+ boss fights", "over 90 combat arts", "over 100 quests" | Steam API `about_the_game` |
| 93% positive of over 10,000 reviews | business.compare | CONFIRMED | English reviews: 9,545 of 10,258 positive (93.05%), "Very Positive", 2026-10-05. Say "English-language reviews" | Steam appreviews API |
| Puzzle objects: switches, boxes, ice pellets, barriers, water bubbles, fans; order or time limit | signature.mechanism, gameplay | CONFIRMED | | Wikipedia (Gameplay) |
| Difficulty can be set separately for combat and puzzles | fair, replay | CONFIRMED | "customise the difficulty of both combat and puzzles" | Wikipedia |
| "the game has four" elements | signature.mechanism | CONFIRMED (secondary) | Heat, Cold, Shock, Wave (plus neutral). CoG's "four more [skill] trees" agrees | CrossCode Gamepedia via search; CoG Connected |
| Analogue aim; ball bounces off walls; same system flips switches | signature.mechanism, gameplay | CONFIRMED | PC uses the mouse, but TSA describes analogue twin-stick aim | TheSixthAxis |
| **"Each dungeon introduces an element"** | env.evidence | **WRONG** | 7 dungeons but 4 elements. The element temples each give one element; the first dungeon (Temple Mine) and the late dungeons do not. Write "each element temple introduces an element" | Steam (7 dungeons); Wikipedia ("unlocks more elements by visiting different dungeons") |
| Klein: Zelda-type action adventure mixed with an action RPG; puzzle-heavy battles and fast puzzles | gameplay | CONFIRMED | | Siliconera 2017 |
| Klein: party members added because you do not play an MMO alone | ui | CONFIRMED | He also says they are "not extremely relevant for gameplay" | Siliconera 2017 |
| Klein: MMO frame from .hack, not Sword Art Online | ui, lore, lineage | CONFIRMED | "mostly inspired by the older .hack series" | GoNintendo 2020 (relays Klein's answer to Siliconera) |
| Look: Terranigma, Secret of Mana, Chrono Trigger; Zelda puzzles; Alundra depth and jumping; Yoshi's Island ball; Xenoblade exploration and quests; KH/DMC combat | art, lineage | CONFIRMED | | GoNintendo 2020; Siliconera 2017 |
| Origin: RPG Maker 2000 bouncing-ball puzzle prototype, then HTML5 and ImpactJS around 2011 | lineage | CONFIRMED | There was also a Nintendo DS homebrew attempt in between (omission is fine) | Siliconera 2017 |
| Team of 12 to 14, two full-time core developers | business, art | CONFIRMED | Stated in 2017; give the year ("in 2017") | Siliconera 2017; Source Gaming 2017 |
| World three-dimensional with height layers; "about height, not jumping"; automatic jump | art | CONFIRMED (secondary) | Raw developer post unreachable (refused). The search index of that post and Wikipedia ("three-dimensional physics system") agree | radicalfishgames.com/?p=1168 (indexed text); Wikipedia |
| Klein named Zelda "as the model for dungeons" | env.compare | CONFIRMED, reword | Klein says the "puzzle aspects" come from old Zelda games; the Steam copy says "Zelda-esque dungeons". Say "for puzzles", or cite Steam for the dungeons | GoNintendo 2020; Steam |
| **"Secret of Mana contributes the real-time action RPG frame"** | lineage.mechanism | **UNSUPPORTED** | Klein names Secret of Mana only for the graphics. He names Kingdom Hearts and Devil May Cry for the combat. Mark it as the editor's reading or cut it | GoNintendo 2020 |
| Art described as vibrant 16-bit; boss designs praised | art | CONFIRMED | TSA "vibrant 16-bit SNES style graphics"; CoG "truly impressive bosses" | TheSixthAxis; CoG |
| Silent avatar; a review praised the broken-speech gag | ui | CONFIRMED | CoG: "your speech systems are busted"; "a nice touch" | CoG Connected |
| **"a long learning curve for combat arts and skill trees that reviewers noted"** | ui.cost; also complaints ("take hours to understand") | **UNSUPPORTED** | Neither cited review says so. CoG lists "Big beautiful skill trees" under The Good. Cut it, or find a review that says it | CoG Connected; TheSixthAxis |
| Switching between puzzle and combat thinking is tiring | complaints, gameplay.cost, replay | CONFIRMED | CoG: "honestly a little jarring", "different parts of my brain" | CoG Connected |
| Some boss fights too long; full restart on death | complaints, replay | CONFIRMED | | TheSixthAxis 9/10, 16 Sep 2020 |
| Quest and story pacing uneven | lore.cost | CONFIRMED | CoG: "Quest and story pacing is off" | CoG Connected, 76, 21 Sep 2018 |
| **Late dungeons and the expansion "add more steps rather than new verbs, which is the main place where players report fatigue"** | signature.escalate | **UNSUPPORTED** | No source given or found that places the fatigue in the late dungeons. Mark it as judgement or drop "the main place where players report" | — |
| Lea wakes with no memory on a cargo ship, told to play CrossWorlds to recover her memories | lore | CONFIRMED | | Wikipedia (Plot) |
| Lea is an Evotar built from another person's memories; Sidwell conspiracy | lore | CONFIRMED | Based on Shizuka's memories | Wikipedia |
| Two endings "based on the player's earlier relationships" | lore | CONFIRMED, oversimplified | The true ending depends on befriending one particular character (an Instatainment stockholder) before the Vermillion Wasteland raid | Wikipedia |
| CrossWorlds on the moon Shadoon | world | CONFIRMED | | Wikipedia |
| Rhombus Dungeon before Rookie Harbor; Autumn's Rise always autumn; Bergen Trail snowy, with Temple Mine | first30, world, env, sound | CONFIRMED (secondary) | Wiki summaries only (fandom blocked). Steam screenshots show a snowy village and an autumn field, which fits | fandom via search; Steam screenshots |
| **"Emilie, Apollo, Joern and Lukas, who become her guild, the First Scholars"** | world.evidence | **WRONG** | The First Scholars is an existing guild, founded by Hlin and Beowulf, which Lea and Emilie join. Lukas (Schneider) was already a member, and C'tron, the key member, is missing. Write "she and Emilie join an existing guild, the First Scholars, and are later joined by C'tron, Apollo and Joern" | Wikipedia (Plot: "eventually joining the 'First Scholars' guild"); fandom First Scholars page via search |
| Composer Deniz Akbulut; OST 6 September 2018; Steel Plus on A New Home | sound | CONFIRMED | OST released by Materia Collective | Wikipedia |
| Screen diagram: element state top-centre, combat-arts bar bottom-centre, quest and party panel top-right | diagrams[1] | **WRONG** | The Steam screenshots show: a diamond element icon at the far top-left beside the HP and SP bars; party members' portraits and bars stacked down the left edge; a combat Rank indicator top-right (there is no quest panel); combat-art names as floating labels in the world (there is no bottom bar); a boss HP bar across the bottom during boss fights; a key counter at the left. Move the regions and add Rank | Steam screenshots `ss_4a517a07…` (jungle fight), `ss_32cba604…`, `ss_7fecc64f…` |
| first30: "must learn to move, jump, dodge and throw" | first30 | WRONG (minor) | Jumping is automatic (see the art lens). Replace "jump" with "climb ledges" or drop it | dev blog via search; Wikipedia |

Totals: WRONG 4 (dungeon/element count, guild, screen diagram, first30 jump), UNSUPPORTED 3 (Secret of Mana
combat frame, learning-curve claim, late-dungeon fatigue locus), OUTDATED 0.

## Images (`crosscode.shots.md`)

- Header: the Steam header capsule is official. The API currently serves it from `shared.akamai.steamstatic.com`.
  The fastly host in the shots file is the same Steam CDN, so either works.
- Shot 1 (gameplay): **caption mismatch.** The URL proposed, `ss_6a96ff676c98dc81905a550733086aa911cc9e6a`
  (store gallery position 13), shows a mountain cliff path with layered ledges over a sea of clouds. It has no
  ball, no switch and no bounce wall. Use `ss_32cba6041d0988d0d40e184f1eb103ac0884ce47` instead: Lea fires a
  charged shock ball in a dungeon room with circuit lines, switch pillars and wall bumpers. A second option is
  `ss_ececee487567e42d1b5e62bde9f2505fce763aa2`, an ice dungeon with switch blocks and barriers.
- Shot 2 (art, height layers): `ss_6a96ff67…` actually suits this lens well (stacked cliff ledges and their
  shadows), as does `ss_df77c06e713d76f8245016177b54a7456b11c0a0` (an autumn field with raised ledges and
  enemies). The caption about ledge edges and shadows fits both.
- Shot 3 (fight with HUD): `ss_4a517a0780eaca5fa87c98ba5d1095812f415378`. It shows the HP and SP bars, the
  element icon, party portraits, Rank C, a "Shock Missile" combat-art label and damage numbers. Use it to correct
  the screen diagram.
- Shot 4 (world hub): `ss_dd4ca2cbdf4f9339ff270428fc262494770010af`. A town square with an INFO building, autumn
  trees, other "players" and a three-character dialogue. Caption it as "a hub town". That it is Rookie Harbor is
  likely but not confirmed from the image.
- All the proposals come from the official Steam gallery (20 images, all real in-game captures). No LaunchBox
  fallback is needed.

## Missing coverage (against the brief)

- Art, animation: the brief asks for animation, and the draft says only "smooth animation". Klein names Valkyrie
  Profile for the animations (Siliconera 2017). Wikipedia says the team kept the style "like in the old games",
  unlike Hyper Light Drifter, while adding shadow maps from its RPG Maker background. That is a stronger
  developer-sourced mechanism for the art lens than the current evidence.
- Gameplay: the puzzle grammar returning in bosses, and optional puzzle-heavy side content, are asserted
  (escalate, loop diagram) but never shown with a named boss or optional puzzle. Name at least one.
- Lineage: Wikipedia now cites the Dragon Quest series as "a large influence" (enemy names; Japan Times, May
  2026). Valkyrie Profile and Chrono Cross are named by Klein as smaller influences. Add at least Dragon Quest
  or say why it is left out.
- UI: the combat Rank (it rises during unbroken combat and rewards rare drops and faster healing; Wikipedia) is a
  distinctive HUD and system element, and the draft never mentions it.
- World: C'tron, the guild member central to the expansion, is missing.

## Code issues

None. The entry has no code. The validator passes apart from the expected image and path lines.

## Teaching issues

- Sound mechanism: "the music is the affect and zone layer" misapplies IEZA. In IEZA, Zone is diegetic
  environmental sound and Affect is non-diegetic setting sound (music). Area music is Affect. Ambience would be
  Zone.
- `business.compare`: "Many Early Access games ship the opposite way" is an unsourced generalisation, and the
  Steam 93% sentence that follows it is not a comparison. Name a game, or mark it as judgement and move the review
  figure to the evidence.
- `env.evidence` "each dungeon introduces an element" (see the table) also conflicts with the four-element count
  in `signature.mechanism`.
- `signature.fair`: "the wrong shot is cheap and can be tried again at once" leaves out the cost of the timed and
  ordered puzzles, which reset, and which Wikipedia's PC Games quote describes as taking "dozens of attempts".
  Name that cost in the same field.

## Rubric (items 1-4 must pass; 7 of 10 to pass)

| Lens | 1 claim | 2 mechanism | 3 effect | 4 two moments | Score /10 | Note |
| --- | --- | --- | --- | --- | --- | --- |
| gameplay | P | P | P | P | 9 | Moments are object lists and Steam counts, so name one room or boss. Item 10 passes |
| ui | P | P | P | P | 7 | Cost relies on the unsupported learning-curve claim (item 9 fails); diagram wrong |
| art | P | P | P | P | 9 | Height and auto-jump post plus review moments; animation thin |
| sound | P | P | P | **F** | 5 | No musical moment, track or area tune. Effect has no play or reception source (9 fails). Swap test weak (10 fails). The lens says so itself. **Fails** |
| lore | P | P | P | P | 8 | Endings oversimplified |
| world | P | P | P | P | 8 | Guild fact wrong; PSO comparison honestly marked as the editor's reading |
| env | P | P | P | P | 7 | Moments thin (beginner dungeon, Temple Mine); "each dungeon" wrong; mechanism marked as judgement |
| business | P | P | P | P | 8 | Comparison is weak (item 5 marginal) |
| replay | P | P | P | P | 8 | |
| lineage | P | P | P | P | 8 | Secret of Mana frame unsupported |

Nine lenses pass. Sound fails item 4. No lens triggers an automatic rejection.

## Style

No hype words were found, the spelling is UK throughout (analysed, learnt, customisable), and no employer,
colleague or internal-project names appear. The Steam marketing tone ("butter-smooth physics") is not copied.

## Set aside

- Sales figures: the writer deliberately gives none because the estimates conflict. That is correct; not flagged.
- Metacritic 86/82/81/81: in the sources file but not in the entry; not checked further.
- Indiegogo amount raised (EUR 90,026) and the Early Access date 15 May 2015: snippet-level, and not used in the
  entry.
- Phantasy Star Online lineage: the entry already marks it as the editor's reading with no developer source.
  That is acceptable.
- "Sword Art Online and .hack both trap the hero in a game": a general genre description, accurate enough for
  .hack//Sign and SAO.
- "A Link to the Past reads height through a flat top-down view and few layers" and "Classic SNES RPGs used a
  short loop per area": comparative judgement, the dispute-test kind the method wants. Not flagged as fact.
- "Lea throws a ball … with an analogue aim": PC players aim with the mouse, but analogue aim is the console and
  pad description in TSA. Not flagged.
- Steam header host (fastly versus akamai): both are Steam's CDN. Not an issue.
- Siliconera 2017 versus 2020 interviews: GoNintendo relays a 2020 Siliconera Q&A, a different interview from the
  2017 one the entry also cites. The attributions to Klein hold in both.
- The developer's auto-jump post could not be fetched raw (refused, Cloudflare, Wayback 429). It is confirmed
  from the search index of the post itself and from Wikipedia. Fetch it in a browser before publication if a
  verbatim quote is wanted.
