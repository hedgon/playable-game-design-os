# Fact-check: compare-one-world-many-players

Draft: `docs/program-2026-10/drafts/compare-one-world-many-players.js` (new comparison; the id is not in `src/46-comparisons.js`).
Brief: `briefs/comparisons.md`. Library entries checked: `world-of-warcraft` (`src/18-games-genres.js:3460`) and `fortnite` (`src/18-games-genres.js:2000`).

## Verdict: PASS WITH FIXES

Counts: WRONG 1, UNSUPPORTED 1, OUTDATED 1.

The most serious problem is "Only the player's items and progress carry on" (sections[0].b). Weapons and items picked up in a match do not carry to the next one. What carries is cosmetics, V-Bucks and Battle Pass progress. A reader new to battle royales would take away the wrong rule.

## Claims

| Claim (short) | Field | Verdict | Correct value / note | Source |
| --- | --- | --- | --- | --- |
| A realm is a copy of the persistent world; thousands share towns and the auction house | sections[0].a | CONFIRMED | | https://en.wikipedia.org/wiki/World_of_Warcraft |
| Up to 100 players on one island; the match ends when one side is left | sections[0].b | CONFIRMED | | https://en.wikipedia.org/wiki/Fortnite_Battle_Royale |
| "Only the player's items and progress carry on" | sections[0].b | WRONG | In-match items reset every match. Cosmetics, currency and Battle Pass progress carry on. Fix: "Only the player's cosmetics and Battle Pass progress carry on." | Wikipedia Fortnite Battle Royale; library fortnite ("cosmetics-only shop and a Battle Pass") |
| Dungeons and battlegrounds are instances | sections[1].a | CONFIRMED | | Wikipedia World of Warcraft |
| "Raids hold up to forty players" | sections[1].a, diagram "groups of 5 to 40" | OUTDATED | 40-player raids were the 2004 launch size and are kept in Classic. Retail raids went to 10 and 25 players in The Burning Crusade, flexible 10 to 25 in Mists of Pandaria, then 10 to 30 from Warlords of Draenor (Mythic is 20). Fix: "Raids held up to forty players at launch." | Library world-of-warcraft (raid-size sentence) |
| Classic launch layering, "each layer is a copy of the whole world" | sections[1].a | CONFIRMED | Brian Birmingham: "every layer is a full copy of the entire world" | https://us.forums.blizzard.com/en/wow/t/layering-in-classic-blizzard-responds-on-reddit/260714 |
| "A match is built for 100 players on one dedicated server" | sections[1].b | CONFIRMED | Epic optimised "the dedicated server to handle 100 simultaneous players" at 20 Hz (Nick Penwarden, 4 October 2017). The page returns 403 to fetch tools; confirmed through a search extract | https://www.unrealengine.com/tech-blog/unreal-engine-improvements-for-fortnite-battle-royale |
| Connected realms from 2013, sharing guilds and trade | sections[2].a | CONFIRMED | Patch 5.4.0 (10 September 2013); first US links 25 September 2013. They share the auction house, trade chat, guilds and grouping | https://warcraft.wiki.gg/wiki/Connected_Realms |
| "cross-realm zones put players of several realms in one zone" | sections[2].a | UNSUPPORTED (true as far as we know) | The cited connected-realms page does not cover cross-realm zones (patch 5.0, 2012, as far as we know). Add a source | none fetched |
| Friends join as a party; matchmaking fills the rest | sections[2].b | CONFIRMED | Since Chapter 2 (October 2019), matchmaking also seeds bots into lobbies (library) | Wikipedia Fortnite Battle Royale; library fortnite |
| Phasing makes one place look different at different points of a quest | sections[3].a | CONFIRMED | | Wikipedia World of Warcraft |
| "chapters of seasons about ten weeks long" | sections[3].b | CONFIRMED, with a caveat | Wikipedia says seasons "typically last ten weeks". Lengths vary: some Chapter 6 seasons ran 35 days, others over three months. "about ten weeks" is acceptable | Wikipedia Fortnite Battle Royale; press season-date reporting (e.g. esports.gg, sportskeeda) |
| Seasons alter the map; concerts run for many players at once | sections[3].b | CONFIRMED | Marshmello, Travis Scott (Astronomical, 23 to 25 April 2020), Ariana Grande | Wikipedia; library fortnite |
| Layers reduced as players spread out | sections[4].a | CONFIRMED | Blizzard committed to one layer per realm before the second content phase | Blizzard forum post |
| "layer changes can be used to re-farm resources" | sections[5].a | CONFIRMED | Players hopped layers through party invites to farm resource nodes again; Blizzard added a growing delay between switches | https://www.techradar.com/news/wow-classic-cheat-is-spoiling-the-game-for-some-players-so-blizzard-is-taking-action (add it to `sources`) |
| "map changes can erase what players spent a year learning" | sections[5].b | CONFIRMED, needs nuance | It matches the library ("A chapter reset can erase a map"). But since December 2024, Fortnite OG has been a permanent mode that brings the original map back (library), so the old map is no longer simply lost | Library fortnite |

## Missing coverage

- WoW's cross-realm Dungeon Finder (patch 3.3, 8 December 2009) is the biggest "who can meet whom" change in the game, and the library treats it at length: Blizzard's Classic team held it back to protect realm community. The "Who can meet whom" section should name it. It is also the clearest cost of cutting the crowd differently.
- The verdict says "queues", but no section mentions login queues. Either add a sentence or drop the word.

## Teaching issues

- "There is no seam to cross" (sections[1].b) and "None inside a match" (diagram) are fair for a single match. A reader might still miss that the seam has moved to the match boundary. The principle already says this, so it is minor.
- "simple to run" in the verdict is judgement and is not marked. Running hundreds of thousands of 100-player servers is not simple; the match is simple to *partition*. Suggest "simpler to partition".

## Agreement with the library

- Raid sizes: the library is right and current; the draft's present tense is outdated.
- Fortnite map loss: the library is right and more complete (Fortnite OG).
- Dungeon Finder: covered by the library, missing from the draft.

## Set aside

- Matrix limits: row labels are 8 characters or fewer, and cells are under 70 characters.
- "One server process cannot hold everyone": a general statement, consistent with the `server-world-partitioning` topic.
- LEGO Fortnite and Creative have persistent or player-made worlds. The comparison is about Battle Royale, so I did not flag this.
- Topic ids `server-world-partitioning` (`src/36-topics-server.js`), `multiplayer-design` (`src/22-topics-core.js`) and `live-operations` exist.
- Style: no hype words, no US spellings, no employer or internal names.
- I did not run the validator. The fact-check brief does not ask for it.
