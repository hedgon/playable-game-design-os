# R1a review: new design content (c2b62b4..HEAD)

Reviewer: independent, read-only. Repo untouched. Sources were opened with WebFetch/WebSearch on 2026-10-01; where a page returned 403 (Valve Developer Community, streetfighter.com, gamesbeat) I say so and rely on search-result text, labelled Likely.

Summary: no outright fabricated game facts in the 3Cs, combat, camera and blockout topics. The named talks and books exist and say what the text says. Real defects are: 2 factual errors in "known game" sentences, 3 claims that the cited source does not support or contradicts, one arithmetic-free but misleading worked-example row, one hours mismatch in the path, and a recall answer that contradicts the new 3Cs topic.

---

## MUST-FIX (false or contradicted)

### 1. Vampire Survivors "accident / stopgap" is contradicted by its creator. Confirmed
- File: src/30-topics-production.js:585 (polish-when). Related: src/20-topics-player.js:406 (finding-an-idea) is hedged and fine.
- Text: "its art began as a purchased asset pack used as a stopgap, and the accident became its visual identity instead of a placeholder to replace."
- Evidence: Luca Galante (Metro interview, summarised at https://gonintendo.com/contents/42432-vampire-survivors-dev-says-the-castlevania-influence-was-there-from-day-one): he started with "a background image and black and white dots", then "decided to swap in the prototype sprites for the Castlevania-inspired assets, and it made the entire project click". He bought the pack years earlier and uses it for most of his prototypes. It was a deliberate swap that made the game work, not an accident, and nobody says it was a stopgap.
- Replacement: "Vampire Survivors started as dots on a background. Its creator swapped in a Castlevania-style asset pack he had bought years earlier, and he says that made the whole project click, so the pack stayed. It shows the cheap end of polish: art chosen early because it made the loop easy to read, not a placeholder that was later replaced." Or drop the claim that it was an accident.

### 2. Subnautica opening is wrong. Confirmed
- File: src/20-topics-player.js:213 (fantasy).
- Text: "the player surfaces from a crashed ship with almost nothing".
- Evidence: the Aurora crashes; the player escapes in Lifepod 5 and starts from the pod (https://subnautica.fandom.com/wiki/Lifepod_5, and the opening sequence described there). The player does not emerge from a crashed ship.
- Replacement: "the player starts in an escape pod after their ship has crashed, with almost nothing, and every crafted tool and deeper dive pays that fantasy off."

---

## SHOULD-FIX (unsupported, misleading or weak)

### 3. Candy Crush "main purchase decision" and "2013 analysis ... most purchases": no source supports it. Confirmed (unsupported)
- Files: src/29-topics-product.js:1033 (monetisation-design: "turns the moment a player is about to fail a level into its main purchase decision"); src/46-comparisons.js:91 ("A 2013 analysis found the moment before a level target is missed drove most purchases").
- Evidence: the Wikipedia page that is the comparison's only source has no such sentence (fetched https://en.wikipedia.org/wiki/Candy_Crush_Saga; it has the OFT line and the gold bars line only). King's own GDC material (https://mobilegamer.biz/how-king-defines-a-good-candy-crush-saga-level-and-why-it-constantly-prunes-the-bad-ones/) says nothing about a near-failure purchase moment. I found no 2013 analysis. "Most purchases" is a number-like claim with no origin.
- Replacement for 46:91: "The limit is also a purchase point: when moves or lives run out, the game offers extra moves or lives for gold. The UK Office of Fair Trading investigated mechanics aimed at younger players." (OFT sentence is in Wikipedia.) Replacement for 29:1033: "Candy Crush Saga offers extra moves and lives at the moment a level is lost, so the failure screen is a purchase point."
- Confirmed in the same area: 29:683 "King's own data staff ... make a level easier and you convert fewer players, though retention always wins" is accurate. Guardiola: "Make a level easier and you will make less conversions ... you're saving players from churning"; Wedekind: "retention always wins" (same mobilegamer.biz URL). Safe as written, but the two speakers are different people; "King's own data staff" is fine.

### 4. Slay the Spire "obscure prototype's chassis" is not supported and probably wrong. Likely
- File: src/29-topics-product.js:399.
- Text: "by pairing an obscure prototype's chassis with better-known influences".
- Evidence: search results list Dream Quest as a released PC game and an influence, plus Dominion, Ascension and Netrunner (Wikipedia/Game Developer "Road to the IGF: Mega Crit's Slay the Spire", https://www.gamedeveloper.com/disciplines/road-to-the-igf-mega-crit-games-i-slay-the-spire-i-). The Wikipedia page I fetched does not mention Dream Quest at all. Nothing I opened calls it a prototype.
- Replacement: "it became the reference point for roguelike deckbuilders by fusing a roguelike run with deck-building (the developers cite Dream Quest, Dominion and Netrunner as influences), not by being first." Source: Game Developer "Road to the IGF" above.

### 5. Slay the Spire Early Access: "beta branch" and "checking against play data" lack a source; add the primary one. Likely
- File: src/30-topics-production.js:307.
- Evidence: weekly Early Access updates are supported (Polygon quote via Wikipedia: "the sustained weekly updates made the game more attractive"); metrics-driven, "a year of constant updates" is Anthony Giovannetti's GDC 2019 talk "Slay the Spire: Metrics Driven Design and Balance" (https://www.gdcvault.com/browse/gdc-19/play/1025731 ; abstract at https://www.gamedeveloper.com/design/learn-i-slay-the-spire-i-s-metrics-driven-approach-to-game-balancing-at-gdc-2019). I could not confirm the "beta branch" for the first game from anything I opened (the beta branch results I found are for Slay the Spire 2, which entered Early Access in March 2026, so a reader can confuse the two games).
- Replacement: "Slay the Spire used Early Access as an open balance loop: about a year of near-weekly updates, with balance decisions driven by run data, as Anthony Giovannetti described in his GDC 2019 talk 'Slay the Spire: Metrics Driven Design and Balance'." Drop "beta branch" unless a source is found. Say "Slay the Spire (2019)" once, since a sequel is now in Early Access.

### 6. Comparison "Miyamoto said the opening was designed so players have to explore the mechanics to advance" misstates the source. Confirmed
- File: src/46-comparisons.js:41.
- Evidence: the Wikipedia page cited (https://en.wikipedia.org/wiki/Super_Mario_Bros., citing Eurogamer) gives Miyamoto's aim as players "gradually and naturally understand what they're doing". "Have to explore to advance" is a different claim.
- Replacement: "Miyamoto has said World 1-1 was designed so players gradually and naturally understand what they are doing."
- Also 46:44: "the first mushroom enemy comes right after, so the two can be told apart" reads as if there were a mushroom enemy. The enemy is a Goomba, and the point (Miyamoto, via https://en.wikipedia.org/wiki/World_1-1 and the Iwata Asks series) is that the Super Mushroom is placed so the player gets it and learns it is different from a Goomba. Replacement: "Small Mario lets players see and feel the change when he grows. The level is built so the player almost always gets the Super Mushroom, and a Goomba, clearly an enemy, is on screen first, so the two are learned as different things."
- 46:38 "The timer is the only pressure until the first enemy arrives" is misleading: the first Goomba walks toward Mario on the first screen. Replacement: "There is no tutorial text. The first Goomba is on the first screen, so the first thing you learn is jump."

### 7. Comparison "the help for a new player is the small first act" (Slay the Spire) has no support. Likely
- File: src/46-comparisons.js:19.
- Evidence: nothing in the Wikipedia source says Act 1 is small or is a help measure. Act 1 is the same length as other acts.
- Replacement: "so the help for a new player is that the rules are fixed and enemy moves are shown in advance, not a carried bonus."

### 8. Wordle growth claim: wrong metric and wrong span. Likely
- File: src/46-comparisons.js:84.
- Text: "Daily players rose from 90 to over two million in about two months."
- Evidence: Wikipedia (https://en.wikipedia.org/wiki/Wordle) gives 90 players on 1 November 2021 and over 2 million by 9 January 2022 (about ten weeks), described as players, not daily players, and the 2 million figure is reported as a weekly count in my fetch summary. Treat as unverified wording.
- Replacement: "The number of players grew from 90 on 1 November 2021 to over 2 million by early January 2022." Primary source better than Wikipedia: Josh Wardle's own account and the NYT acquisition announcement (https://www.nytimes.com/2022/01/31/technology/nyt-wordle-acquisition.html), not opened.

### 9. Valve source is a community wiki, not "Valve's published level-design guidance". Likely
- File: src/25-topics-level.js:410.
- Evidence: the doorway and hull sizes (player 32x32x72 standing, 36 crouching, door 48 wide by 108 tall) are on the Valve Developer Community page "Dimensions (Half-Life 2 and Counter-Strike: Source)", https://developer.valvesoftware.com/wiki/Dimensions_(Half-Life_2_and_Counter-Strike:_Source) (403 for me; figures come from search-result text). It is a Valve-hosted, community-edited wiki.
- Replacement: "The Valve Developer Community wiki lists Source-engine dimensions (a standing player hull is 72 units tall and 32 wide, a standard door is 48 units wide), so doorways and cover are sized against the player's collision hull, which is the same idea at studio scale." Also "cover" against the hull is not on that page as far as I could see; keep to doorways.

### 10. Worked example: "Combination: dodge plus the shield you already have" has no earlier shield. Confirmed
- File: src/23-topics-systems.js:589 (level 3 teaching note).
- Evidence: levels 1 and 2 teach only the dodge. No row introduces a shield, and level 8 says "call for help with the shield" as if known.
- Replacement: add a shield to level 2 ("Practice: the dodge again, and the shield is handed to you") or change level 3 to "Combination: dodge plus a second enemy". Pick one and keep level 8 consistent.

### 11. Worked example (difficulty): "near 1 it is a coin flip" is wrong for this model. Confirmed
- File: src/23-topics-systems.js:583 (intro).
- Evidence: the model is deterministic (constant damage per second for both sides, no dodging, no variance). A margin of 1.1 means the player wins every time by a 10 percent time gap. Dodging, the very skill the rows teach, is not in the model.
- Replacement: "above 1 the player wins on average numbers; near 1 any mistake, or missing the dodge, loses the fight. Skill appears as a lower real enemy damage per second than the table assumes."

### 12. Worked example (economy): the column the lesson is built on is zero on 8 of 10 days, and one Try cannot be answered from the table. Confirmed
- File: src/23-topics-systems.js:918-942.
- Evidence: I recomputed every row (see "Arithmetic" below). The balance never limits the player except on days 8 and 9: they can afford the next upgrade on 8 of 10 days and hoard 700 to 1400 coins. The Try "Inflation is when the same coins buy less. Where does this table show it" has no answer: the table shows a surplus (precondition for inflation), not coins buying less. A junior copying this will believe an economy with a permanent surplus is a normal sample.
- Replacement for Try 3: "Inflation starts when income outruns the sinks. Which column shows the surplus building up, and what sink would you add so the balance on day 10 is nearer the cost of the next upgrade?" Optional: lower play income to 10 coins a minute so the days-to-afford column is non-zero on most days.

### 13. Worked example (design docs): the kill criterion is a weak model. Likely
- File: src/33-topics-studio.js:138.
- Text: "fewer than 4 of 10 players notice the pet, or more than 3 say it makes the level too easy".
- Evidence: a pet that follows the player is trivially noticed, so the first clause can never fire, and the Try on the same document asks for a behaviour measure while this doc's own success signal ("at least 7 of 10 say they went back for fewer coins") is opinion. The document teaches "a number a stranger could check" and fails its own test.
- Replacement kill criterion: "If the average number of times a player walks back for a dropped coin falls by less than a quarter in the grey-box test, or the level completion rate falls, we stop and do not build the art." Success signal likewise from logged behaviour.
- Consistency nit: decision-log "Revisit when: after the coin experiment ships" (33:~160) conflicts with the brief, where the experiment is a grey-box test with 10 players and is not shipped.

### 14. Path first-tiny-game: hours include both alternative engine steps. Confirmed
- File: src/50-paths.js:235 (hours:8.25) and stage s3 (hours:3.25).
- Evidence: s3 steps: 20 + 60 (Godot) + 60 (GameMaker, "Choose this step or the Godot one, not both") + 55 = 195 minutes = 3.25 h. A learner does one engine: 135 minutes = 2.25 h. Path total is then 7.25 h, not 8.25. (src/validate.js:689 sums every step, so the validator passes the mismatch.)
- Replacement: either mark the alternative as excluded from the sum, or declare s3 at 2.25 h and the path at 7.25 h, and teach the validator that steps with alternatives count once.

### 15. Path first-tiny-game: the build minutes are not honest for someone who has never coded. Likely
- File: src/50-paths.js, stage s3.
- Evidence: step "Install Godot 4, follow the engine first tutorial from its own site, then make a box that sits on a floor and jumps when you press one key" is given 60 minutes; Godot's official "Your first 2D game" tutorial alone is a multi-hour project for a newcomer (not measured by me; stated from the tutorial's scope: scenes, scripts, signals, spawning). The last step (boxes sliding at the player, collision, restart, then tuning, 55 minutes) needs spawn timers, movement and collision detection in code. For the stated audience ("is not a programmer") 3 hours total is an optimistic best case.
- Replacement: either set the build stage to about 5 to 6 hours and say it is the longest stage, or give a no-code route as the default (GameMaker drag-and-drop) and make the jump-and-obstacles targets smaller (one obstacle, no spawner, restart by pressing a key).

### 16. Path first-tiny-game: recall answer contradicts the new 3Cs topic. Confirmed
- File: src/50-paths.js:312.
- Text: "What is game feel? ... The small responses, such as sound, bounce and shake, that make pressing a button feel good before any rules come into it."
- Evidence: the new three-cs topic (src/22-topics-core.js:1011) and the game-feel-and-juice topic (src/28-topics-presentation.js:100) both use Swink's definition: game feel is how the game responds to input (responsiveness plus polish). Sound, bounce and shake are juice, one layer of it. A learner who takes the recall answer will be corrected by the next topic.
- Replacement: "How the game answers a press: how quickly, how predictably and how it looks and sounds. Sound, bounce and shake (juice) are one layer of it."
- Also: stage s3 attaches the three-cs topic to a step whose "do" never uses it, and that topic (coyote time, dead zones, aim assist, buffer values) is dense for a first game. Suggest `three-cs` as an optional read, or give the step a "do" line that names the idea: "Which of character, controls or camera did you change when you raised the jump?"

### 17. "Super Mario's run, jump and scrolling camera were built together" is unsupported. Likely
- File: src/22-topics-core.js:1017 (three-cs good example).
- Evidence: Keren's article (https://www.gamedeveloper.com/design/scroll-back-the-theory-and-practice-of-cameras-in-side-scrollers) describes the SMB camera as a one-sided camera window with a virtual point about 25 percent off-centre; it does not say the three were designed together. The scrolling behaviour itself is accurate.
- Replacement: "In Super Mario Bros the camera scrolls only forward and keeps Mario about a quarter of the screen off-centre, so the player sees ground ahead before the jump (Itay Keren's analysis)."

### 18. Subtle overstatements about named games (low risk, tighten). Likely
- God of War: src/28-topics-presentation.js:512, "a single unbroken shot from the start to the end, with no cuts". Search results (e.g. https://en.wikipedia.org/wiki/God_of_War_(2018_video_game)) say the shot is unbroken "except in death and the occasional flash to white when transitioning". Barlog's own account of the idea: https://www.pushsquare.com/news/2018/03/cory_barlog_wanted_tomb_raider_to_be_a_single_shot. Replacement: "one continuous camera shot with no cuts in normal play". Also "so the player always knows where the camera and the character are in the same space" is unclear; say "so the camera never cuts away from the player's space".
- Celeste: src/22-topics-core.js:1016, "wide wall-jump windows". Thorson's own article (https://maddymakesgames.com/articles/celeste_and_forgiveness/) gives 2 pixels from the wall (5 for a super wall jump) at 320x180; she does not call it wide. Replacement: "coyote time, jump buffering and wall jumps that still work a couple of pixels from the wall".
- Dark Souls music: src/28-topics-presentation.js:200 "scores almost nothing except its boss fights" is acceptable ("almost"), but hub areas such as Firelink Shrine and Anor Londo have themes. Add "and a few hub areas".
- Reaction time: src/22-topics-core.js:906 "around a fifth of a second". Simple visual reaction time is about 200 to 250 ms and rises when a choice is needed; Woods et al. 2015 (https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2015.00131/full) is the usable source. Replacement: "about 200 to 250 milliseconds for a simple visual cue, longer when the player must choose a response".
- Dark Souls PC petition: src/30-topics-production.js:489 "a public petition proved PC demand before Namco Bandai would fund a port". Producer Daisuke Uchiyama attributed the PC version to the petition (https://gamebanshee.com/k3dd9, search-result text). "Would fund" is the editor's inference. Replacement: "a public petition is why the PC version exists, according to its producer".
- Minecraft procedural: src/24-topics-content.js:384, biomes keep one world varied, not "one generated world from looking like the last". Replacement: "its biomes keep one world from being a single repeated texture, and the seed makes the next world a different arrangement".
- Fortnite events: src/29-topics-product.js:1150 "damage stays for the rest of that season". Dusty Depot's crater persisted for many seasons; "at least the rest of that season" is safer.
- Subway Surfers: src/29-topics-product.js:103 "a HUD that fits in two corners" has no source; drop or check a screenshot.
- Tetris "no invented world": src/29-topics-product.js:834, true for the abstract game, but Nintendo-era releases added Russian-themed art; say "an abstract game".

---

## NITS

19. Keren's terms are "camera window", "forward focus" (static and dual) and "platform snapping". The topic's "look-ahead" is a fair gloss; add "(Keren calls it forward focus)" at src/28-topics-presentation.js:507. Confirmed.
20. src/22-topics-core.js:3Cs "Pluralsight ... one plain introduction": fetched; it is an introductory 2014 blog post that ties the 3Cs to flow, with no Rocket League mention. Fine as cited; Swink's book is the stronger anchor. Confirmed.
21. camera diagram cell "No player view" (Fixed risks) is ambiguous; use "Player cannot change the view". src/28-topics-presentation.js diagram matrix.
22. Hades EA span: "almost two years" is right (6 Dec 2018 to 17 Sep 2020). Confirmed correct, no change.
23. Attack anatomy: "anticipation (startup)" is the standard fighting-game triple (startup, active, recovery). Fine. SF6 official frame data does exist on the official site (https://www.streetfighter.com/6/en-us/character/ryu/frame; page 403 on fetch, existence confirmed by search listing), and the game runs at 60 fps; the claim holds but name SF6 rather than "Street Fighter" (older titles did not all publish). src/22-topics-core.js:902, 1008. Likely.
24. src/46-comparisons.js sources are Wikipedia only; see source list below.

---

## CONFIRMED CLAIMS (no change needed)

- Nesky, "50 Game Camera Mistakes", GDC 2014, dynamic camera designer on Journey: https://gdcvault.com/play/1021262/50-Camera (opened). Title differs only as "50 Camera Mistakes" on the Vault; the site's wording "50 Game Camera Mistakes" is a common alias. Confirmed.
- Keren, "Scroll Back: The Theory and Practice of Cameras in Side-Scrollers", GDC 2015 Independent Games Summit: https://gdcvault.com/play/1022243/Scroll-Back-The-Theory-and ; article https://www.gamedeveloper.com/design/scroll-back-the-theory-and-practice-of-cameras-in-side-scrollers. Camera window, forward focus and platform snapping all appear. Confirmed.
- Vlambeer, "The Art of Screenshake", Jan Willem Nijman, INDIGO Classes 2013: https://www.youtube.com/watch?v=AJdEqssNZ-U. Confirmed.
- Swink, Game Feel (2008): standard book on responsiveness; not fetched but well established. Confirmed from knowledge only (labelled Likely).
- Portal and the cube: Kim Swift's "Box Marathon ... people would forget about the box, so we added dialogue, applied the heart to the cube" from the GDC 2008 postmortem (https://www.gamedeveloper.com/pc/best-of-gdc-the-secrets-of-i-portal-i-s-huge-success). Confirmed.
- Into the Breach: Justin Ma, Rock Paper Shotgun via Game Developer (https://www.gamedeveloper.com/design/-i-into-the-breach-i-dev-on-ui-design-sacrifice-cool-ideas-for-the-sake-of-clarity-every-time-): "showing that little animation of them moving is a thousand times more effective", and "We'd watch a playtester investigate a weapon and they'd just be like, 'What' after reading three sentences". It is a playtest observation. The new text ("tested far more effective in playtesting") is fair.
- Candy Crush retention trade-off: see item 3. Confirmed.
- Hades EA and true ending held to 1.0: https://store.epicgames.com/news/hades-v1-0. Confirmed.
- Civilization VII UI: Firaxis named UI improvements its top priority (https://www.cgmagonline.com/news/civilization-vii-quality-of-life-updates). Confirmed.
- Celeste Assist Mode first called Cheat Mode, renamed because "judgmental": https://www.vice.com/en/article/celeste-difficulty-assist-mode. Confirmed.
- Hades God Mode: starts at 20 percent damage resistance, +2 percent per death to 80 percent (https://caniplaythat.com/2021/08/11/hades-god-mode-explained-by-supergiant-games). Confirmed.
- Overwatch counters: Kaplan, "It's not ever gonna be just any random six characters is always viable against any random other six" (https://pcgamesn.com/overwatch/jeff-kaplan-goats-meta). Confirmed (note Overwatch 2 reduced hard counters).
- Halo squads and dropships, Dark Souls bosses/lock-on, RE4 over-the-shoulder, Hollow Knight look up/down, Rocket League ball cam: consistent with search results; Halo AI primary source is Damian Isla, "Handling Complexity in the Halo 2 AI", GDC 2005. RE4 pacing: the merchant first appears after the village battle in Chapter 1-2 (https://residentevil.fandom.com/wiki/Chapter_1-2). Likely.
- Quantic Foundry twelve motivations in six pairs, LeBlanc eight kinds, Lazzaro four keys, Koster, Compton "10,000 bowls of oatmeal", Ambinder GDC 2009, Librande One-Page Designs GDC 2010 (https://gdcvault.com/play/1012356/One-Page), Woodward GDC 2017 Albion Online (https://gdcvault.com/play/1024070, opened), Schreiber and Romero Game Balance (CRC 2021): all exist as cited. Confirmed except Quantic/LeBlanc/Lazzaro/Koster/Compton/Ambinder, which I only checked from knowledge (Likely).
- Celeste forgiveness is published by Thorson: https://maddymakesgames.com/articles/celeste_and_forgiveness/ . Confirmed (see item 18 for "wide").

---

## Arithmetic (worked examples)

Difficulty curve, 10 rows, recomputed: time to kill = health / player dps, survival = player health / enemy dps, margin = survival / time to kill. Every Time to kill and Survival cell equals the formula to one decimal. Margins computed from unrounded values equal the table to two decimals in all 10 rows; computing from the rounded cells differs in the last digit in 3 rows (level 2: 2.61 vs 2.62; level 4: 1.25 vs 1.24; level 10: 3.59 vs 3.58), which the table text already discloses. Confirmed. Try 1 is answerable: with player dps 28, 30, 32, 36, 38 on levels 6-10, margins are 1.62, 1.13, 1.12, 0.90, 2.96, so levels 7, 8 and 9 fall below 1.2 and level 9 below 1.

Economy, 10 rows: income = minutes x 15 in every row; balance = previous + play + 100 - upgrades - cosmetics matches in every row (280, 430, 605, 705, 955, 942, 1112, 698, 908, 1428); upgrade costs 250, 375, 563 (562.5 rounded up), 844 (843.75), next 1266 (1265.6) match 250 x 1.5^n. Days-to-afford: 0 on days 1-7 and 10, 2 on days 8 and 9 (shortfall 568 / 430 and 358 / 310, rounded up): correct. Day 10 shows 0 because the balance 1428 exceeds 1266. Try 2 (double cost from day 6: 1126 and 1688): numbers consistent with the table; the player buys day 6's at 1126 from 1505 available, then cannot buy day 8's at 1688 from 979. Confirmed. The Try asks "Can the player still buy both?" and the answer is no for the day-8 one, as it should be.

Document set (spec, brief, decision log): internally consistent on numbers (3 m / 8 m / 1 s / 6 s, 10 players, 5 days). The three documents are reasonable models for a junior in structure (headings, numbers, what was given up). Defects are in items 13 and the revisit/ship wording.

---

## Better sources for the four comparisons (replace or add beside Wikipedia)

1. failed-run-worth-it (Hades vs Slay the Spire)
   - Slay the Spire: Anthony Giovannetti, "Slay the Spire: Metrics Driven Design and Balance", GDC 2019, https://www.gdcvault.com/browse/gdc-19/play/1025731 (abstract: https://www.gamedeveloper.com/design/learn-i-slay-the-spire-i-s-metrics-driven-approach-to-game-balancing-at-gdc-2019).
   - Hades God Mode: Supergiant, https://www.supergiantgames.com/blog/hades-faq/ and the creative director's account https://caniplaythat.com/2021/08/11/hades-god-mode-explained-by-supergiant-games . Early Access/true-ending structure: https://store.epicgames.com/news/hades-v1-0 .
   - Unlock rules (Silent unlocks by completing a run with the Ironclad; Watcher by a win after Defect): fan wiki-level, Likely: the claim "finished and failed runs both count toward unlocks" is right for characters, cards and relics.
2. teaching-without-words (Portal vs Super Mario Bros)
   - Portal: Kim Swift, Erik Wolpaw and team, GDC 2008 postmortem as reported at https://www.gamedeveloper.com/pc/best-of-gdc-the-secrets-of-i-portal-i-s-huge-success (Box Marathon quote).
   - Mario: Miyamoto quoted in Eurogamer (cited by Wikipedia) and the Iwata Asks volumes on Super Mario Bros. (https://iwataasks.nintendo.com/interviews/wii/mario25th/0/0); the pages I opened covered the build history, not 1-1, so I could not read the 1-1 quote there. Itay Keren's article for the camera side: https://www.gamedeveloper.com/design/scroll-back-the-theory-and-practice-of-cameras-in-side-scrollers .
3. hard-for-everyone (Celeste vs Dark Souls)
   - Celeste: Vice interview with Thorson, https://www.vice.com/en/article/celeste-difficulty-assist-mode (Cheat Mode rename, "judgmental"); Thorson's own article https://maddymakesgames.com/articles/celeste_and_forgiveness/ .
   - Dark Souls: Miyazaki and producer interviews, gamebanshee collection https://gamebanshee.com/k3dd9 ; for the "no difficulty setting, help is inside the fiction" claim I found no developer statement; it is an observation about the design and should be worded as one ("the game has no difficulty setting; help comes from summoning and levelling").
4. daily-habit (Wordle vs Candy Crush)
   - Wordle: Wardle's announcement and the NYT acquisition piece (https://www.nytimes.com/2022/01/31/technology/nyt-wordle-acquisition.html, not opened); Wikipedia for the 90-to-2-million figures (item 8).
   - Candy Crush: King's GDC talk as reported by Mobilegamer.biz, https://mobilegamer.biz/how-king-defines-a-good-candy-crush-saga-level-and-why-it-constantly-prunes-the-bad-ones/ . The OFT investigation is in Wikipedia (citation [51] there). I found no source for the "2013 analysis" (item 3).

Other claims in the four comparisons checked and fine: Hades death scenes and currencies; God Mode description; Ascension unlocking harder modifiers; Dark Souls bloodstain and bonfire rules; Celeste respawn at room start, strawberries and B-sides; Wordle emoji share history; NYT sale on 31 Jan 2022; Candy Crush five lives, gold bars, extra moves and boosters.

---

## Set aside (considered and judged out of scope or not worth a finding)

- Godot and Unity snippets, pitfalls and API names in three-cs, combat-design, camera-design and level-blockout: Go/engine scope belongs to the other reviewer.
- Glossary entries "Build tool", "Dedicated server", "Orchestration" (Agones, GameLift Servers): server-stack facts, other reviewer.
- Pre-existing older text that repeats the Into the Breach "thousand times" quote (src/16-games-analysis.js:292): not added today; its wording "tested as" matches the source.
- Rocket League ball cam toggling, Hollow Knight vertical look working only when standing still (a nuance, not an error), Plants vs. Zombies pole vaulter, Tetris menu-only translation: accurate enough.
- Interview answers in the new topics ("senior" questions etc.): no named-game claims beyond those above.

## Could not check

- Valve Developer Community Dimensions page (403): figures from search-result text only.
- streetfighter.com frame data pages (403): existence from search listing; I did not read a table.
- gamesbeat Dark Souls petition article (403): used a Namco/From producer interview summary instead.
- Swink's book, Quantic Foundry, LeBlanc, Lazzaro, Koster, Ambinder, Compton, Hearthstone rotation, Fortnite Visualize Sound Effects, Celeste Assist Mode feature list, Balatro HUD, Stardew villager behaviour: confirmed from general knowledge only, not by a page opened today.
- "Beta branch" for the first Slay the Spire game and Dream Quest being a prototype: no source opened supports either.
- Iwata Asks passage on World 1-1: the volumes I opened did not contain it.
- The CSV files named in the worked examples (`file:` fields) were not inspected.
