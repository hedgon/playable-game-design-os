# Fact-check: worldbuilding-method

Checked 2026-10-05 against `drafts/worldbuilding-method.js` and `drafts/worldbuilding-method.sources.md`. The draft was not edited.

## Verdict: PASS WITH FIXES

Counts: WRONG 1, UNSUPPORTED 4, OUTDATED 0.

The most serious issue is the Ultima Online claim, which appears in `facts[1]`, `think.traps[7]` and the mid interview question. Koster's own post says the ecology collapsed because players hoarded resources in a closed loop. The draft says instead that the failure came "rather than from the ecology itself" and that the popular story wrongly blames players. Both statements contradict the source the draft cites.

Validator: `PLAYABLE_DRAFTS=docs/program-2026-10/drafts/worldbuilding-method.js node src/validate.js` ends with `OK: all cross-links resolve, all topics complete.`, with draft-specific lines `WARN topics with no inbound links: worldbuilding-method` and `DRAFT not in any learning path`. Every `rel` target already exists in `content/topic/`, including `backtracking-and-return-trips`, which has been integrated, so its draft `.js` is no longer in `drafts/`. A second run with both drafts loaded also ended OK.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
|---|---|---|---|---|
| Wolf, Building Imaginary Worlds (Routledge, 2012) | what | CONFIRMED | Routledge, copyright 2012, 408 pp. | https://www.routledge.com/Building-Imaginary-Worlds-The-Theory-and-History-of-Subcreation/Wolf/p/book/9780415631204 |
| Invention / completeness / consistency definitions | what, interview junior[0] | UNSUPPORTED (primary not reached) | No raw book text could be fetched: Google Books quota, DuckDuckGo rate limit, and the Tolkien journal review returned 403. The wording matches the checker's recollection of Wolf ch. 1 (invention = default assumptions from the Primary World changed; completeness = explanations and details covering characters' experiences; consistency = plausible, feasible, without contradiction). That recollection is memory, not a source. Low risk; confirm against the book or attribute to a quoted secondary. | none read |
| "completeness is often an illusion ... a mountain of detail can still be dull" "as summarised by reviewers" | what | UNSUPPORTED | No reviewer named or linked. Either cite a named review or drop "as summarised by reviewers" and the "dull" clause. | none |
| Infrastructures: maps, timelines, genealogies, then nature, culture, language, mythology, philosophy | what, how[1] | UNSUPPORTED (primary not reached) | Same access problem. Matches the checker's memory of Wolf ch. 3. | none read |
| Jenkins (2004), designers as "narrative architects"; evoked, enacted, embedded, emergent | what, facts[0], how[5] | CONFIRMED | The essay text has "less as storytellers and more as narrative architects" and the four ways. The 2004 date is confirmed by the ebr.org publication of 10 July 2004 (also First Person, MIT Press 2004). | https://web.mit.edu/~21fms/People/henry3/games&narrative.html ; https://electronicbookreview.com/essay/game-design-as-narrative-architecture/ |
| Koster: AI switched off because of the cost of radial searches followed by pathfinding | facts[1], traps[7], interview mid[2] | CONFIRMED | Koster's post says this almost word for word. He also says the ecology was in alpha and removed during beta. | https://www.raphkoster.com/?p=46439 |
| Koster: "a later resource failure came from players hoarding goods rather than from the ecology itself"; the legend of "players ruining a simulation" is wrong | facts[1], traps[7], interview mid[2] | WRONG | Koster: "The ecology collapsed for a different reason": a closed economy loop that fell to player hoarding (wool and shirts). The bank ran out of wool and could not spawn sheep. So players did break the ecology, through hoarding rather than hunting. The AI shutdown was a separate matter. He does not call the hoarding failure "later". Suggested fact: "...was switched off because of the cost of radial searches followed by pathfinding, and that the ecology's fixed resource pool collapsed for a separate reason: players hoarded crafted goods, so the pool ran dry." Reword the trap so the legend is wrong about the mechanism (carnivore pelts) and about why the AI was off, not about whether players were involved. | https://www.raphkoster.com/?p=46439 |
| Popular name "rabbits and wolves" | traps[7] | Set aside (see below) | Koster's own design post uses rabbit and wolf examples, and a pingback is titled "It's All About The Rabbits". That supports the name as a common tag. | https://www.raphkoster.com/?p=517 |
| Megill: begins with a 2-3 paragraph summary; living document; writing, design, art, sound, marketing | how[0], facts[2], interview junior[1] | CONFIRMED | "Megill begins all her bibles with a 2-3 paragraph summary"; "living document"; guides "writing, design, art, sound, and other aspects", and includes marketing information. Bryant Francis, 18 Oct 2019. The how[0] phrase "writing at a published studio" is vague: say "then lead writer at Ubisoft Massive". | https://www.gamedeveloper.com/design/building-a-basic-story-bible-for-your-game |
| "At GDC 2020 ... Alex Beachum gave two talks" (4D level design; with Loan Verneau, curiosity-driven exploration) | facts[3] | UNSUPPORTED | Both talks were announced for GDC 2020, 16-20 March (the gdconf.com page and the Game Developer page of 15 Jan 2020 confirm the titles and descriptions). GDC 2020 was postponed from its March dates and run as a virtual event (Wikipedia, citing VentureBeat 28 Feb 2020). A GDC Vault keyword search for "outer wilds" returns only Kelsey Beachum's GDC 2021 talk "Sparking Curiosity-Driven Exploration Through Narrative in Outer Wilds", which is a different speaker and a different talk. No evidence was found that either announced talk was given or recorded. Reword to "were scheduled to give at GDC 2020", or find the Vault recordings. Fix the writer's second URL: www.gdconf.com/... returns 404; the live page is https://www.gamedeveloper.com/design/attend-gdc-and-learn-how-i-outer-wilds-i-nailed-curiosity-driven-game-design | https://gdconf.com/news/see-4d-level-design-outer-wilds-deconstructed-gdc-2020 ; https://en.wikipedia.org/wiki/Game_Developers_Conference ; https://gdcvault.com/browse/?keyword=outer%20wilds ; https://media.gdcvault.com/GDC+2021/beachum_gdc_2021(1).pdf |
| Hollow Knight: map with discovery was "the single biggest design challenge"; cartographer's map bought and expanded while exploring | how[2], facts[4] | CONFIRMED | Exact phrase present: "Team Cherry says maintaining that sense of discovery while still giving players a useful map of the world was the single biggest design challenge". Gibson: "purchasing simple maps from a cartographer and expanding on those yourself as you explore". The page byline is dated Oct 15, 2018; the URL path is /10/16/. | https://gameinformer.com/2018/10/16/the-making-of-hollow-knight |
| Boneforest cut; Deepnest reduced | facts[4], interview senior[2] | CONFIRMED | Gibson: "We removed one large area from the game, the Boneforest" and "significantly reduced the size of Deepnest". | same |
| Hollow Knight opens areas as abilities unlock | interview senior[2] | CONFIRMED | The GI article describes the map "opening up previously inaccessible areas as abilities are obtained". | same |
| "three to five world rules", "one-page canon", "half the testers", "two channels" | how[0], how[5], test[2], good[0] | Advice, not fact; see Teaching | sources.md says these are "flagged as such in the prose". They are not: no "rule of thumb" or similar marker appears in the draft. | n/a |

## Missing coverage (brief "Must cover")

- **CrossCode's areas**: absent. The writer could not source them and says so. The brief names them, so either the coordinator drops them or a sourced line gets added.
- **Outer Wilds' planets**: these appear only in `facts[3]`, and the body never mentions Outer Wilds. The brief asks for regions with identities that serve gameplay, with Outer Wilds' planets as an example. That point is thin. One line in `why` or `how` would cover it, for example planets that each change over the loop and teach one part of the mystery (the 4D-level-design description supports this).
- **Ecology as an infrastructure**: covered only through the UO story and "ecologies that react" in TECH. This is adequate.
- All other must-cover items are present: Wolf's tests, infrastructures and which a game needs, world as systems, delivery through space, objects, interface and play (links environmental-storytelling), bible and consistency process, and unreachable lore.

## Code issues

Go is not used. Godot 4 and Unity 6 snippets were read line by line, not compiled or run.

- Godot APIs were confirmed on docs.godotengine.org (stable): `Array filter(method: Callable)`, `Array.is_empty()`, `Dictionary.has(key)`, `Dictionary.keys()`, `Dictionary.size()`, `Time.get_ticks_msec()`. The snippet is valid GDScript 2.0 and 14 lines long.
  - Minor: `discover()` accepts ids that are not in `facts`, so `coverage()` can exceed 1.0 after a typo. An `if facts.has(fact_id)` guard at the boundary would fix it.
  - Minor: when `facts` is empty, `coverage()` divides by zero. With float division this returns NaN or inf rather than an error.
- Unity APIs were confirmed on docs.unity3d.com/6000.0: `ScriptableObject` and `CreateAssetMenuAttribute`. `HashSet<T>`, target-typed `new()` (C# 9, supported by Unity 6) and LINQ `Count(predicate)` on `IReadOnlyCollection<T>` are valid. The snippet is 15 lines.
  - Teaching gap: the static `HashSet` survives Play-mode entry when Domain Reload is disabled (Enter Play Mode Options), so coverage leaks between test runs. It would be worth naming in the pitfall.
- No unconfirmed APIs remain. "Autoload (Project Settings)" is a feature, not an API, and is correct.

## Teaching issues

1. UO framing (the WRONG row above): the lesson "check the origin before copying the lesson" is good, but the draft gets the origin wrong itself. The interview answer's "watch the sinks" is the right lesson (faucet-drain) and should stay.
2. Rules of thumb are presented as method without being labelled: "three to five rules", "half the testers", "at least two channels". Mark them as starting points.
3. why[1]: "A world bible of 200 pages that the player meets through three item descriptions is a 3-page world." Three item descriptions are a few lines, not three pages, so the arithmetic does not hold. Say "a few paragraphs of world".
4. how[2]: the Hollow Knight map does not fill in "by walking" alone. Updates are drawn at benches with the Quill, as the sibling `backtracking-and-return-trips` says. Either add "at benches" or keep GI's wording ("expanding on those yourself as you explore").
5. TECH "Gapped lore": the cost and alternative are given. Good.

## Sibling overlap

- `backtracking-and-return-trips` (integrated) already teaches Hollow Knight's map selling in detail: Cornifer, Iselda, Quill, pins and prices. The draft's one-line mention plus its `rel` link is acceptable and does not repeat the mechanics.
- `premise-and-world` has "Deep lore rewards invested players and costs more than most will read" and "Cut lore that no system or decision touches". The draft's reach theme extends this with ids, reports and tests rather than repeating it. The draft does not re-teach the premise/lore split, which the brief forbids. Acceptable.

## Style

UK spelling throughout ("summarised"). No hype words found by grep (crucial, robust, leverage, delve, seamless, powerful). No employer, colleague or internal project of the owner is named. "Anna Megill, writing at a published studio" is padding; name the studio.

## Set aside

- "rabbits and wolves" as the popular tag: supported by Koster's own example animals and the "It's All About The Rabbits" pingback on p=517. Not flagged.
- "FromSoftware's reputation" for fragmentary lore: framed as reputation with no quote or attribution. Not flagged.
- Jenkins's per-type examples (Alice, Myst, Half-Life, The Sims): the draft does not attribute them to types in the body, so nothing to check beyond the four-type list.
- The Carson (2000) and Mobius blog sources are not used for claims in the draft. Not checked.
- Diagram layer ordering ("seen every minute" ... "player never reads it"): design opinion, presented as a model. Not flagged.
- The validator's `no inbound links` warning is the coordinator's integration task, not a draft defect.
- The Game Informer date (sources.md says 16 Oct, the byline says 15 Oct): the draft says only "2018". Not flagged.
