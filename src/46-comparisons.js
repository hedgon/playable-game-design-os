/* =====================================================================
   COMPARISONS - "Two games, one problem"
   ===================================================================== */

COMPARE({
  id:'failed-run-worth-it',
  t:'Making a failed run worth having played',
  problem:'In a roguelike the player loses most runs, so a loss has to leave them with something or they stop playing.',
  games:['hades', 'slay-the-spire'],
  sections:[
    { h:'What a death gives back',
      a:'Hades turns death into a scene. You return to the House of Hades, characters remark on your last run, and the dialogue moves forward with each run. Each run also banks currencies that buy permanent upgrades, while coins and some in-run upgrades are lost.',
      b:'Slay the Spire gives back points toward unlocks. Finished and failed runs both count toward new characters, cards and relics. Nothing you carry makes the next deck stronger, but you know more about the cards and enemies.' },
    { h:'Where the player feels progress',
      a:'In the story and in the numbers. A run that ends early can still advance a relationship, and the Mirror of Night makes the next attempt a little easier.',
      b:'In the player. The rules are the same every run, so the thing that grows is your judgement about what to take and what to skip.' },
    { h:'The first loss',
      a:'The game is built so that repeated runs are how the story is told. Creative director Greg Kasavin has said the structure let the team tell branching stories over many playthroughs, so an early death is the normal way the plot moves.',
      b:'A run that ends before the first boss is offered a small mercy the next time. Neow, the figure who starts each run, can offer a blessing called Neow’s Lament: the enemies in your next three combats have one health. It is a short boost, not a permanent one.' },
    { h:'How the game helps someone who keeps losing',
      a:'God Mode is an optional setting that makes the character stronger after each failed run. It starts at 20 percent damage resistance and adds 2 percent per death, so a struggling player can still reach the story.',
      b:'The help for a new player is that the rules are fixed and enemy moves are shown in advance as intent icons. Apart from Neow’s small opening blessing, the game does not carry power between runs, so a new player keeps learning on equal terms with the enemies.' },
    { h:'How a winner makes the game harder',
      a:'After you beat Hades once, the Pact of Punishment lets you add conditions that raise enemy strength, enemy numbers or boss complexity. You pick how much extra danger to take, and you set the level again before each run, so you can lower it.',
      b:'Ascension has up to 20 levels, each adding a cost such as stronger elites or lower health. They unlock after you defeat an Act 3 boss with a character, so the game raises its own difficulty only for players who already won.' },
    { h:'What each choice risks',
      a:'Permanent upgrades can make a run feel safe once enough are bought, which weakens the tension that made dying matter.',
      b:'With almost no carried power, an early bad offer can sink a run, and a new player may feel a quick loss taught them nothing.' }
  ],
  diagram:{ kind:'matrix', title:'What a lost run hands to the next one',
    rows:['Story','Power','Knowledge','Choice of difficulty'], cols:['Hades','Slay the Spire'],
    cells:[
      ['A new scene and dialogue each return','Unlocks only; no story beat per loss'],
      ['Permanent upgrades bought with banked currency','Only Neow’s small blessing; each run starts from the starter deck'],
      ['Learned by play, as in any roguelike','Learned by play; enemy intents shown in the fight'],
      ['God Mode eases; Pact of Punishment hardens','Ascension hardens after a win']
    ],
    note:'A summary of the sections above, not measured data.' },
  verdict:'Hades pays the player in story and power for every attempt, at the cost of some danger. Slay the Spire keeps every run nearly equally risky and pays in understanding, at the cost of a slower reward for new players.',
  principle:'Decide what a loss gives back, power, story or understanding, and make sure it arrives on the first loss, not the tenth.',
  topics:['challenge-failure-recovery', 'progression', 'knowledge-as-progression'],
  sources:['https://en.wikipedia.org/wiki/Hades_(video_game)', 'https://en.wikipedia.org/wiki/Slay_the_Spire', 'https://slaythespire.wiki.gg/wiki/Neow', 'https://slaythespire.wiki.gg/wiki/Ascension', 'https://www.gamedeveloper.com/design/learn-i-slay-the-spire-i-s-metrics-driven-approach-to-game-balancing-at-gdc-2019', 'https://caniplaythat.com/2021/08/11/hades-god-mode-explained-by-supergiant-games']
});

COMPARE({
  id:'teaching-without-words',
  t:'Teaching a mechanic without tutorial text',
  problem:'A new player has to learn what they can do, and the game would rather not stop to tell them.',
  games:['portal', 'super-mario'],
  sections:[
    { h:'The first minute',
      a:'You wake in a glass cell, a portal opens in the wall, and you step through it. The rule of the whole game is understood from that one step, with no menu or prompt.',
      b:'World 1-1 starts with Mario at the left edge and control already in your hands. There is no tutorial text. The first Goomba walks in within the first few seconds, so the first thing you learn is jump.' },
    { h:'How new ideas arrive',
      a:'Each test chamber tends to add one idea, such as a surface that takes no portal or a cube on a button, then a later chamber combines it with what came before.',
      b:'The level repeats, varies and escalates its hazards. Miyamoto has said World 1-1 was designed so players gradually and naturally understand what they are doing. The mushroom block is placed so it is hard to avoid, which teaches that mushrooms help.' },
    { h:'How the help is removed',
      a:'Early chambers hand the player a near-solution and many hints. As the game goes on the hints thin out, and in the second half the player gets no guidance and has to solve each room alone.',
      b:'In our reading, the help is never removed because it was never written down. The same jump, the same enemy and the same block return with a small change, and the player is trusted to carry the lesson over.' },
    { h:'When players do not notice',
      a:'Playtesters forgot the companion cube that was meant to teach carrying an object, so Valve added dialogue and a heart icon instead of a prompt.',
      b:'Small Mario lets players see and feel the change when he grows. Once the block is hit, the Super Mushroom is hard to avoid, and a Goomba, clearly an enemy, arrives first, so the two are learned as different things.' },
    { h:'What gets cut so the lesson is visible',
      a:'Valve changed a shimmering force field to glass so players could read it, and it removed decorative detail that distracted from the puzzle. The clinical look is part of the teaching.',
      b:'The team had little cartridge memory. The Goomba is one image flipped back and forth, so the first enemy is as simple to read as it is cheap to store.' },
    { h:'What each choice risks',
      a:'A lesson that rests on watching players is expensive. Every chamber needs testing, and a missed lesson, like the cube, shows up only when someone sits and watches.',
      b:'A lesson built into one opening screen works only if the player moves the way the designers expect. A player who waits, or who jumps early, may miss the mushroom, and the game has no text to fall back on.' }
  ],
  diagram:{ kind:'matrix', title:'Where each game puts its first lesson',
    rows:['First act','Next idea','Help over time','If missed'], cols:['Portal','Super Mario Bros.'],
    cells:[
      ['Step through the first portal','Walk right; the first Goomba arrives'],
      ['A new chamber adds one element','The same hazard returns, changed'],
      ['Hints thin out toward the second half','No help; trust in repetition'],
      ['Playtests find it; dialogue is added','The mushroom is hard to avoid']
    ],
    note:'A summary of the sections above, not measured data.' },
  verdict:'Portal builds a sequence of rooms that each demonstrate one idea, which costs many hand-built chambers. World 1-1 teaches the jump and the power-up in a single opening, which costs a very small space where every object must earn its place.',
  principle:'Put the first example of a rule where it is safe to try and hard to miss, add one idea at a time, and watch playtests to see whether anyone actually noticed.',
  topics:['onboarding', 'feedback-and-affordance', 'level-structure'],
  sources:['https://en.wikipedia.org/wiki/Portal_(video_game)', 'https://en.wikipedia.org/wiki/Super_Mario_Bros.', 'https://www.gamedeveloper.com/pc/best-of-gdc-the-secrets-of-i-portal-i-s-huge-success']
});

COMPARE({
  id:'hard-for-everyone',
  t:'Letting more people finish a hard game',
  problem:'A game built around difficulty loses the players who cannot clear it, yet the difficulty is why others love it.',
  games:['celeste', 'dark-souls'],
  sections:[
    { h:'The official way to ease off',
      a:'Assist Mode has five settings: game speed, infinite stamina, extra air dashes, dash assist and invincibility, plus the option to skip a chapter. It was first called Cheat Mode, and the developers renamed it because the name felt judgemental.',
      b:'The game has no difficulty setting. Help comes from inside the game: you can summon other players to a fight (which needs human form and opens you to invasion), and you can level up in the areas you choose.' },
    { h:'Who decides how much help',
      a:'The player, one option at a time. They remove exactly the friction they struggle with and nothing else. Game speed goes down in steps of 10 percent, to 50 percent.',
      b:'The player again, but through play: which build to level, which route to take, and when to ask for a summon.' },
    { h:'How the game words the offer',
      a:'The Assist Mode screen says every player is different and hopes the mode lets players enjoy the game if its difficulty makes it inaccessible. Maddy Thorson has said the team wants players to leave feeling capable and powerful.',
      b:'In our reading, the game never offers help as help. A player finds out that a summon sign or a shortcut exists by finding it or by hearing about it from other players.' },
    { h:'What happens when you fail',
      a:'You respawn at the start of the room almost at once, so retrying is cheap, and the optional strawberries and B-sides add difficulty for those who want it.',
      b:'Bonfires are the only checkpoints, enemies come back, and souls you drop at the place of death are lost for good if you die again before reaching them.' },
    { h:'What a player carries out of a failure',
      a:'Very little is lost, so the player carries only skill. Hard content sits off the main path: B-sides are unlocked with cassette tapes, and C-sides after the B-sides.',
      b:'The player carries a route. A shortcut opened on one trip stays open, so the same dangerous road gets shorter on the next attempt. The hard part is the main path, not an extra.' },
    { h:'What each choice risks',
      a:'Thorson has said Assist Mode breaks the game as designed, and accepted that as the price of letting players choose; a player can switch it on at the first hard room. Some players may feel the result is not the same test others passed.',
      b:'A player who needs more help has to find it. With no menu, the only way to make the game easier is to know about summons, levelling or a different build, and some players will simply stop.' }
  ],
  diagram:{ kind:'matrix', title:'Where each game puts the dial',
    rows:['The dial','Who turns it','Cost of failing','Hard extras'], cols:['Celeste','Dark Souls'],
    cells:[
      ['A menu of five Assist options','No menu; summons and builds'],
      ['The player, at any time','The player, through play and knowledge'],
      ['Restart the room almost at once','Walk back to souls; enemies return'],
      ['B-sides and C-sides, optional','The main road is the hard part']
    ],
    note:'A summary of the sections above, not measured data.' },
  verdict:'Celeste puts the choice in a menu, which opens the whole game to more people at the cost of the sense that everyone passed the same test. Dark Souls keeps one test and offers help that is part of the world, at the cost that a player who needs more help has to find it themselves.',
  principle:'Offer the player ways to change how hard the game is for them, and let them choose how openly: a menu setting, or a tool inside the fiction.',
  topics:['difficulty', 'accessibility', 'challenge-failure-recovery'],
  sources:['https://en.wikipedia.org/wiki/Celeste_(video_game)', 'https://en.wikipedia.org/wiki/Dark_Souls', 'https://www.vice.com/en/article/celeste-difficulty-assist-mode', 'https://gameaccessibilityguidelines.com/celeste-assist-mode', 'https://newnormative.com/2018/01/25/celestes-assist-mode-brings-welcome-accessibility-options']
});

COMPARE({
  id:'daily-habit',
  t:'A game people come back to every day',
  problem:'A game has to give people a reason to return tomorrow, and the reason can be good for them or merely good for the business.',
  games:['wordle', 'candy-crush-saga'],
  sections:[
    { h:'What brings you back',
      a:'One word a day, the same for everyone, and no way to play again until tomorrow. The wait is the hook.',
      b:'An unfinished ladder of levels. The game is still there, unfinished, when you return, and a five-life cap keeps each sitting short.' },
    { h:'How long one visit lasts',
      a:'Six guesses at a five-letter word, then the game is done for the day. A visit takes a few minutes, and the game tells you when you are finished.',
      b:'A level takes a few minutes, but the game does not end the visit by itself. Lives come back one every half hour, so a player who runs out must wait, or pay to skip the wait.' },
    { h:'How the game spreads',
      a:'The share button copies a grid of coloured squares that shows your result without the answer. Players began sharing hand-made grids first, and Wardle built it in. The number of players grew from 90 on 1 November 2021 to over 300,000 by 2 January 2022, and more than 2 million a week later.',
      b:'Friends can be asked for lives, and the game is free to download on phones. Spread follows the store charts and the social ask rather than a shared daily result.' },
    { h:'How the game earns',
      a:'It was free with no advertising or accounts at first. The New York Times bought it on 31 January 2022 for a low seven-figure sum, and it stays free to play; since 2022 the New York Times shows ads to players who do not subscribe.',
      b:'Free to play. The player starts with five lives, and gold buys boosters, extra moves or a refill. Only a small share of players pay, about 2.3 percent by one count.' },
    { h:'How the designers decide what to change',
      a:'Josh Wardle began the game as a gift for his partner. Wardle’s answer list was 2,315 familiar words, filtered by his partner; the New York Times later trimmed it and now has an editor choose each word.',
      b:'King measures time to pass and time to abandon on each level, and says it regularly fixes its 100 least engaging levels. It also says very hard levels do not pay off in the long run, because players leave.' },
    { h:'Where the ethics sit',
      a:'The limit protects the player: a game that ends for the day cannot take more of it.',
      b:'The limit is also a purchase point: when moves or lives run out, the game offers extra moves or lives for gold. The UK Office of Fair Trading investigated mechanics aimed at younger players.' },
    { h:'What each choice risks',
      a:'One puzzle a day gives a player little to do after the first week, and the shared grid works only while many people play on the same day.',
      b:'A player who hits a hard level can read the wait as a payment prompt. If the game feels unfair, players leave, which is the loss King says it tests for.' }
  ],
  diagram:{ kind:'matrix', title:'Two reasons to come back tomorrow',
    rows:['Hook','Length','Shared?','Paid by'], cols:['Wordle','Candy Crush Saga'],
    cells:[
      ['A daily wait for one new word','A ladder of levels left unfinished'],
      ['Six guesses, then done','Open, with lives that refill slowly'],
      ['Same word for all; spoiler-free grid','Friends send lives; no shared result'],
      ['Nobody at first; later a newspaper, with ads','A few players buying gold']
    ],
    note:'A summary of the sections above, not measured data.' },
  verdict:'Wordle gains a shared moment and a calm reputation, at the cost of a small game with little to sell. Candy Crush gains a long ladder and steady income, at the cost of a pacing system many players read as a payment funnel.',
  principle:'A limit can serve the player or the till. Ask whom it protects before you add it, and whether the player would still come back if you removed the payment.',
  topics:['platform-and-session', 'monetisation-design', 'ethics-and-responsibility', 'return-and-quit'],
  sources:['https://en.wikipedia.org/wiki/Wordle', 'https://en.wikipedia.org/wiki/Candy_Crush_Saga', 'https://mobilegamer.biz/how-king-defines-a-good-candy-crush-saga-level-and-why-it-constantly-prunes-the-bad-ones/', 'https://marketingdive.com/news/new-york-times-wordle-new-mobile-ad-format-doordash/685073']
});

COMPARE({
  id:'return-trips',
  t:'Coming back through known places without a chore',
  problem:'A world that sends the player back through rooms they have cleared has to make the second walk worth walking.',
  games:['hollow-knight', 'dark-souls'],
  sections:[
    { h:'Why the player goes back',
      a:'Hallownest is built on ability gates. The player meets a wall or ledge they cannot pass, and later gains a movement ability that opens it. The lock is seen long before the key, so the player already wants to return when the key arrives.',
      b:'Lordran is one connected world, and much of the going back is part of going forward. The player returns to a bonfire to rest and spend souls, and to reach doors that open only from the far side.' },
    { h:'How the walk is shortened',
      a:'Stag Stations are fast-travel terminals. The player finds each station and usually pays a Geo toll to open it; trams are a second fast-travel system, opened once the player has a tram pass. Shortening the walk is something earned in the world.',
      b:'A shortcut, such as a lever, lift or door opened from the far side, joins two parts of the map the player already walked. A route that once cost a long fight becomes a short walk. Warping between bonfires comes much later, after the player gets a key item.' },
    { h:'What the second visit looks like',
      a:'Mostly the old room is the same room and the player is not. A new ability lets them leave the main route and reach ledges and passages they had to ignore the first time. Team Cherry did change the first region: late in the game the Forgotten Crossroads becomes the Infected Crossroads, with infection and changed enemies, so the return trip is not the same walk again.',
      b:'Resting at a bonfire respawns most enemies, so every old room is a fight again. The player is stronger and knows the layout, so the room is played faster and with less fear.' },
    { h:'How the map helps',
      a:'In most regions the player has no map until they find Cornifer, who sells a partial map. The rooms they explore beyond his sketch are added when they rest at a bench with a quill. The map is something the player earns and keeps up to date.',
      b:'The game keeps its interface minimal and offers little to lean on. The player holds the layout in memory, helped by landmarks and by messages other players leave in the world. The world itself is the map.' },
    { h:'What a death costs on the way back',
      a:'When the player dies, a Shade appears near the place of death and holds their Geo. Beating it returns the Geo. Dying again first erases the old Shade and its Geo. Until the Shade is beaten, the Soul meter is also capped at about two-thirds, so the walk back is a debt the player can see.',
      b:'The player respawns at the last bonfire and the souls stay at the place of death. Reaching them without dying again returns them, and dying first loses them for good. The debt is similar, without the Soul cap, and the enemies on the way have respawned.' },
    { h:'What each choice risks',
      a:'Many open locks give the player a list of places to revisit, and past some count the list reads as a to-do list (our judgement). The earned map and pins hold the list so the player does not have to.',
      b:'With no map and respawning enemies, a player who forgets which door was locked has nothing to jog the memory (our judgement). A long walk through cleared rooms before a boss is the chore the shortcuts exist to remove.' }
  ],
  diagram:{ kind:'matrix', title:'How each game shortens the known walk',
    rows:['Fast travel', 'Shortcuts', 'The map', 'A death'],
    cols:['Hollow Knight', 'Dark Souls'],
    cells:[['Stag Stations, found and paid for', 'Bonfire warp, late in the game'],['New ability opens old routes', 'Lever or lift opens a loop'],['Bought from Cornifer, kept at benches', 'None; the player remembers'],['A Shade holds the Geo', 'A bloodstain holds the souls']] },
  verdict:'Hollow Knight gives the player tools that hold the return for them, a map, stations and pins, at the cost of some of the fear of being lost. Dark Souls leaves the return to memory and to shortcuts the player opens, which makes the world feel like one place, at the cost that a forgotten door stays forgotten.',
  principle:'Decide where the cost of a known walk goes: onto the player’s memory, onto a tool such as a map or a station, or onto your content budget. Then give the second walk something the first did not have.',
  topics:['backtracking-and-return-trips', 'spatial-composition', 'level-structure'],
  sources:['https://en.wikipedia.org/wiki/Hollow_Knight', 'https://hollowknight.wiki/w/Cornifer', 'https://hollowknight.wiki/w/Shade', 'https://hollowknight.wiki/w/Stag_Station', 'https://en.wikipedia.org/wiki/Dark_Souls', 'https://darksouls.wiki.fextralife.com/Lordvessel', 'https://www.gameinformer.com/2018/10/15/the-making-of-hollow-knight']
});

COMPARE({
  id:'keeping-old-content-relevant',
  t:'New content that does not bury the old',
  problem:'Every release has to feel worth the player’s time, and the easy way to do that is to make it stronger than what came before.',
  games:['hearthstone', 'slay-the-spire'],
  sections:[
    { h:'How new content arrives',
      a:'Hearthstone releases three major expansions a year, with smaller mini-sets between them since 2021. Each adds many cards, so the pool the player builds from keeps growing.',
      b:'Slay the Spire added a character at a time to a fixed game. It launched with two characters, the Defect came during early access, and a fourth followed by free update in 2020. Each character has its own cards, so new content is a new deck to learn, not new cards in an old one.' },
    { h:'What happens to old cards',
      a:'Standard and Wild began in April 2016. Since then, only cards from the current and previous year, plus a base set, are legal in Standard, and older sets rotate out. Wild allows every card.',
      b:'Nothing rotates. Every card and relic stays in the game. Because the player fights the computer, within a run a card competes only with the other cards offered in that run, not with a new set.' },
    { h:'How power is kept in check',
      a:'From 2017 the Hall of Fame moved cards out of Standard that were auto-includes and made a stagnant meta. Players received arcane dust and kept the cards in Wild. After a nerf, the card can be disenchanted for its full cost for about two weeks.',
      b:'Mega Crit tuned cards against pick rates and win rates from players’ runs during early access. The difficulty is also a dial. Ascension has up to 20 tiers of harder rules that stack, so a strong deck meets harder enemies, and the player chooses how much.' },
    { h:'What a returning player finds',
      a:'The Core set has rotated older cards out and new ones in since 2021. A player who left for a year meets a new Standard pool and may need to rebuild their decks.',
      b:'The player returns to the same rules. The Daily Climb and Custom Mode give reasons to play again without a new set, and Steam Workshop mods add characters, cards and monsters from the community.' },
    { h:'Who pays for the choice',
      a:'Rotation asks players to buy again. Dust refunds return some of the value, and Wild keeps old cards usable for those who want them.',
      b:'The game is bought once. Old cards stay, so the cost falls on the designers, who must keep a larger pool balanced in place.' },
    { h:'What each choice risks',
      a:'Rotation keeps the live format fresh and gives designers room, but it retires cards that were good. Wild keeps them, and power creep lives on there.',
      b:'A card that is too strong or too weak stays until a patch, and new content must fit a pool that cannot be reset. In our reading, a larger pool also makes it harder for a new player to see which picks are good.' }
  ],
  diagram:{ kind:'matrix', title:'Where each game puts the old content',
    rows:['New content', 'Old cards', 'Power dial', 'Returning'],
    cols:['Hearthstone', 'Slay the Spire'],
    cells:[['Three expansions a year', 'New characters by update'],['Rotate out of Standard yearly', 'Stay in every run'],['Hall of Fame moves, nerf windows', 'Play-data patches, Ascension tiers'],['A new pool to rebuild from', 'Same rules, new modes']] },
  verdict:'Hearthstone keeps the live format fresh by retiring old cards, at the cost that players rebuy and good cards leave Standard. Slay the Spire keeps everything legal and raises the challenge instead, at the cost of a pool that only grows and must be balanced in place.',
  principle:'Decide before the first expansion how old content stays worth choosing: retire it, raise the challenge around it, or hold new content to a written power budget. Then say who pays, the player or the designer.',
  topics:['power-creep-and-content-growth', 'balance-methods', 'live-operations'],
  sources:['https://en.wikipedia.org/wiki/Hearthstone', 'https://en.wikipedia.org/wiki/Slay_the_Spire', 'https://www.gamedeveloper.com/design/how-i-slay-the-spire-i-s-devs-use-data-to-balance-their-roguelike-deck-builder']
});

COMPARE({
  id:'one-world-many-players',
  t:'Many players in one world or one match',
  problem:'One server process cannot hold everyone, so every game cuts its players up, and each cut decides who can meet whom.',
  games:['world-of-warcraft', 'fortnite'],
  sections:[
    { h:'What is shared',
      a:'A realm is a copy of the persistent world, and the character lives there. Thousands of players share the same towns, fields and auction house for years.',
      b:'The player shares one match. Up to 100 players land on one island, fight, and the match ends when one side is left. Only the player’s cosmetics and Battle Pass progress carry on.' },
    { h:'How the crowd is cut up',
      a:'Dungeons and battlegrounds are instances: each group gets its own copy with its own enemies. Raids held up to forty players at launch, and Classic keeps that size. At the Classic launch, Blizzard used layering, where each layer is a copy of the whole world.',
      b:'The match is the cut. A match is built for 100 players on one dedicated server, and a new match starts for the next group. There is no seam to cross.' },
    { h:'Who can meet whom',
      a:'Players on one realm meet in the open world and the cities. Connected realms, from 2013, let several realms share guilds and trade, and cross-realm zones put players of several realms in one zone. From December 2009 the cross-realm Dungeon Finder also grouped players across realms, the biggest change to who could meet whom.',
      b:'Players meet only inside one match. Friends join the same match as a party, and matchmaking fills the rest, with bots seeded into lobbies since Chapter 2. When the match ends, the crowd is gone.' },
    { h:'What changes over time',
      a:'The world is patched and given expansions, and the same realm carries the changes. Phasing lets one place look different to players at different points of a quest.',
      b:'The island changes. The game runs in chapters of seasons about ten weeks long, and seasons alter the map. Live events, such as concerts, run for many players at once.' },
    { h:'What the player sees when it is full',
      a:'A crowd at a quest hub competes for the same enemies. At launch, layers were Blizzard’s answer to demand, and they were reduced as players spread out.',
      b:'The storm shrinks the playable area, so a full match turns into fights in a small space. The load on a server is bounded by the 100-player match, not by how many people are online.' },
    { h:'What each choice risks',
      a:'Instances and layers break the idea of one shared world. Two friends in the same place can see different worlds, and layer changes can be used to re-farm resources.',
      b:'The match has no memory. A world that resets each round cannot hold a town or a history, and a map change can erase what players spent a year learning, though Fortnite OG has since brought the original map back as a permanent mode.' }
  ],
  diagram:{ kind:'matrix', title:'How each game cuts its players up',
    rows:['The unit', 'Size', 'Seam', 'Lifetime'],
    cols:['World of Warcraft', 'Fortnite'],
    cells:[['Realm, with instances inside', 'A match on one server'],['Thousands a realm; raids up to 40 at launch', 'Up to 100 a match'],['Zone edges, layers, instance doors', 'None inside a match'],['Years, with patches', 'One round']] },
  verdict:'World of Warcraft keeps one lasting society and pays for it with instances, layers and queues that cut the world apart. Fortnite makes the match the world, which is simpler to partition, and gives up a place that lasts.',
  principle:'Decide how many players must see each other at once and for how long. If the answer is a hundred for ten minutes, make that the cut. If it is thousands for years, plan the seams on day one.',
  topics:['server-world-partitioning', 'multiplayer-design', 'live-operations'],
  sources:['https://en.wikipedia.org/wiki/World_of_Warcraft', 'https://us.forums.blizzard.com/en/wow/t/layering-in-classic-blizzard-responds-on-reddit/260714', 'https://warcraft.wiki.gg/wiki/Connected_Realms', 'https://en.wikipedia.org/wiki/Fortnite_Battle_Royale', 'https://www.unrealengine.com/tech-blog/unreal-engine-improvements-for-fortnite-battle-royale', 'https://www.techradar.com/news/wow-classic-cheat-is-spoiling-the-game-for-some-players-so-blizzard-is-taking-action']
});

COMPARE({
  id:'getting-around-an-open-world',
  t:'Crossing a large world again without the walk becoming the game',
  problem:'In a large open world the player must cross known ground again and again, so the game has to decide how much of that trip is play and how much is a cost to cut.',
  games:['elden-ring', 'skyrim'],
  sections:[
    { h:'The default way to cross ground',
      a:'Elden Ring gives the player a mount. Torrent, a spectral horse, is the main way to cross the Lands Between, and the player can gallop, jump and often outrun a fight instead of winning it. The trip is quick, and it is still a trip through danger.',
      b:'Skyrim starts on foot. The player can ride a horse, pay for a ride from a city stable, or fast travel. Walking is the base speed, and the mountain terrain makes the straight line harder than it looks on the map.' },
    { h:'Where fast travel is allowed',
      a:'Elden Ring lets the player open the map and fast travel from almost anywhere in the open field to any Grace already found, outside combat. It is barred inside caves, catacombs and similar small dungeons, even at a Grace inside one, so the player must leave first. Graces are also where the player heals and levels up, so as a destination one place serves as a rest stop, a checkpoint and a transport point. Dying usually sends the player back to the last Grace visited, or to a Stake of Marika near the fight.',
      b:'Skyrim lets the player fast travel to any discovered location marked on the map. The player cannot do it in combat, when enemies are nearby, when over-encumbered, or from inside an interior. The trip is one action on the map, with no checkpoint or rest tied to it. Carriages can also take the player to a hold city not yet visited, the one case where Skyrim shortens a trip the player has not already walked.' },
    { h:'What the player sees on the way',
      a:'The Erdtree and other large landmarks stay in view in the open field, and the player reads them to choose a heading. In our reading, the ride is short enough that the world becomes a series of choices about which landmark to visit next, not a long road.',
      b:'The compass at the top of the screen shows nearby places, and visited places look different from places not yet visited. PC Gamer’s reviewer noted that it is hard to walk for a minute in any direction without finding a cave, a lonely shack or a haunted fort, so a long walk is meant to be interrupted.' },
    { h:'Where the game takes the shortcut away',
      a:'Torrent cannot be summoned inside the large legacy dungeons such as Stormveil Castle, nor in caves, catacombs and most boss arenas inside them. There the game goes back to on-foot rules, and the return trip is shortened by shortcuts the player opens, such as a gate or a lift that links back to a Grace near the entrance.',
      b:'Skyrim bars fast travel from interiors, so a dungeon is always crossed on foot. The way out is on foot too. After that the map is open again.' },
    { h:'Who decides how much walking there is',
      a:'The designer decides, by place. Elden Ring lets the player leave the field from anywhere, so the designer’s control lies in where travel is barred: caves, catacombs and Torrent-free dungeons. The open field is fast and those set pieces are slow, so the speed of the crossing changes with the kind of space.',
      b:'The player decides. Someone who wants to see every ridge walks, and someone who wants the next quest fast travels. The design leaves the cost of the crossing to the player’s patience.' },
    { h:'What each choice risks',
      a:'A mount and early fast travel remove the whole-field shortcut. The library notes this arguably costs the spatial memory that a world like Dark Souls’ Lordran gives, and a fast ride can skip content placed on the road.',
      b:'Because the cost is the player’s to choose, many players may fast travel to a marked quest and see little of the world between (judgement). Skyrim’s promise, that a distant tower is a real place, is met only for the player who chooses to walk to it.' }
  ],
  diagram:{ kind:'matrix', title:'How each game shortens a trip it expects you to repeat',
    rows:['Default','Fast travel','Blocked','Who chooses'], cols:['Elden Ring','Skyrim'],
    cells:[
      ['Mount (Torrent), outside dungeons','On foot; horse or paid ride optional'],
      ['From the map, outside combat; not in caves or catacombs','To any discovered place, not in combat'],
      ['Mount and map travel barred in caves and legacy dungeons','Fast travel is barred in interiors'],
      ['The level: field fast, dungeons slow','The player: walk, ride or jump']
    ],
    note:'A summary of the sections above, not measured data.' },
  verdict:'Elden Ring makes the crossing quick and keeps the slow, remembered walk for the dungeons, at the cost of the map memory a slower world builds. Skyrim leaves the choice to the player and keeps the world whole for those who walk, at the cost of a trip many players may skip.',
  principle:'Decide which trips you want the player to feel, make those the slow ones, and make every other trip cheap, so the player never has to walk a road just to reach the part you built.',
  topics:['backtracking-and-return-trips', 'level-structure', 'spatial-composition'],
  sources:[
    'https://en.wikipedia.org/wiki/The_Elder_Scrolls_V:_Skyrim',
    'https://en.wikipedia.org/wiki/Elden_Ring',
    'https://gamerguides.com/skyrim/guide/introduction/guide-information/the-compass',
    'https://en.wikipedia.org/wiki/Torrent_(Elden_Ring)',
    'https://www.pcgamesn.com/elden-ring/fast-travel-combat'
  ]
});

COMPARE({
  id:'balance-patches-in-a-live-game',
  t:'Changing the strength of characters players have learned',
  problem:'Players invest in learning a character, so every change to its numbers spends that investment, yet a game left alone drifts toward a few dominant picks.',
  games:['overwatch', 'street-fighter'],
  sections:[
    { h:'How change reaches the player',
      a:'Overwatch changes the live game. Wikipedia says the team tuned heroes by monitoring meta-game statistics and user feedback, and press describe the game (sold as Overwatch 2 from 2022 to 2026, and called Overwatch again since February 2026) as working in seasons, with a main balance pass at the start and a smaller one around the middle. Every player gets the same version on the same day.',
      b:'Street Fighter II first shipped change as new versions: Champion Edition in March 1992, Hyper Fighting in December 1992, Super in September 1993 and Super Turbo in February 1994. Street Fighter 6 is patched online instead, with some patches touching a handful of characters (February 2024) and others the whole roster (May 2024: all 21 then in the game).' },
    { h:'What a change looks like',
      a:'A change moves a number or an ability on a hero in a team game, such as damage or a cooldown. Because players can swap hero at spawn, a change to one hero reaches every team that might pick it or pick against it.',
      b:'A change moves frame data, damage or a move’s properties on a character in a one-on-one game. Wikipedia says Champion Edition rebalanced the characters’ power levels, and Hyper Fighting raised the game speed and gave some characters new special moves. Every match is a pair, so one change reaches each of that fighter’s opponents.' },
    { h:'What players keep',
      a:'Heroes keep their names, but not always their roles: Doomfist moved from damage to tank for Overwatch 2 in 2022 with a rebuilt kit, and 2026 added sub-roles with their own passives, so Blizzard has changed a hero’s rules, not only its numbers. Team shape changed by rules too: the two-tank, two-damage, two-support Role Queue of 2019, then five-a-side with one tank per team in Overwatch 2 (October 2022).',
      b:'Under Classic controls, the shared grammar of six buttons and motion inputs stays through every revision, so a player’s hands still know the character after a patch. In our reading this shared floor means a number change spends less of what the player learned than a rule change would.' },
    { h:'How many versions exist at once',
      a:'One live version at a time. It replaces the last, but old versions can return for a limited time: Overwatch: Classic (12 November to 2 December 2024) restored the May 2016 launch balance and 6v6 with the original 21 heroes, then later historic metas.',
      b:'In the arcade era several versions were in the world at once, and the series library notes that players had to guess which one was worth learning. Online patching has mostly replaced that, so Street Fighter 6 also runs one current version (earlier online-era entries still shipped named versions).' },
    { h:'How the reason is told',
      a:'Blizzard publishes patch notes for each season and mid-season patch on its patch-notes page, and press cover the hero changes within them.',
      b:'Capcom publishes patch notes that list changes by character. One of the Street Fighter II developers later said, as Wikipedia reports, that he put the game’s success down mainly to its animation, not to balance.' },
    { h:'What each choice risks',
      a:'A frequent, wide pass keeps the meta moving, but it can weaken a hero a player has learned without their consent, and a fast cadence invites players to chase the meta (judgement).',
      b:'A patch that touches many characters resets some of the matchup knowledge the community built (judgement). The series library also notes that Street Fighter 6’s Modern controls sparked an argument over how much a shortcut should cost, so a change to the skill floor can start its own balance debate.' }
  ],
  diagram:{ kind:'matrix', title:'How each game delivers a change to character strength',
    rows:['Delivery','Cadence','Old version','Who is hit'], cols:['Overwatch','Street Fighter'],
    cells:[
      ['Live patch to every player at once','Version release, later online patch'],
      ['Seasons, with a main and a mid-season pass','Irregular; May 2024 changed all 21 characters'],
      ['Replaced; old versions return only as limited events','Older versions once coexisted; now patched'],
      ['Every team that picks or fights the hero','Each opponent of that fighter']
    ],
    note:'A summary of the sections above, not measured data.' },
  verdict:'Overwatch keeps one living version that its developer can tune on a schedule, and changes team rules and hero roles as well as numbers, at the cost of players who cannot keep the hero they learned, apart from limited Classic events. Street Fighter changes strength on top of a stable input grammar and adds an optional control scheme, at the cost of splitting players’ knowledge across versions or resetting it with a wide patch.',
  principle:'Decide in advance what a patch may spend: the numbers, the rules or the controls. Keep fixed what the player learned with their hands, and say in the notes why each number moved.',
  topics:['balance-methods', 'power-creep-and-content-growth', 'live-operations'],
  sources:[
    'https://en.wikipedia.org/wiki/Overwatch_(video_game)',
    'https://en.wikipedia.org/wiki/Street_Fighter_II',
    'https://www.eventhubs.com/news/2024/feb/26/capcom-sf6-balance-adjustments-ed',
    'https://eventhubs.com/news/2024/sep/24/sf6-terry-patch-notes',
    'https://esportnow.gg/games/news/overwatch-2-patch-notes-explained',
    'https://overwatch.blizzard.com/en-us/news/patch-notes/',
    'https://www.streetfighter.com/6/buckler/battle_change',
    'https://godisageek.com/2026/02/overwatch-2026-drops-2-reign-of-talon-launch-feb-10/'
  ]
});

COMPARE({
  id:'rhythm-by-ear',
  t:'A rhythm game you play by listening',
  problem:'A rhythm game usually shows the player a lane of notes to read, so a game that wants to be played by ear has to make the sound the cue and keep the picture from taking over.',
  games:['rhythm-heaven', 'rhythm-doctor'],
  sections:[
    { h:'Where the cue lives',
      a:'A sound sets up a short pattern, a character acts it out, and the player answers on the next bar. There is no note lane and no score counter to read. Producer Tsunku proposed a rhythm game without visual indicators in 2004, and the series has kept that idea since the first game.',
      b:'Six beats count the player in and the player presses the spacebar on the seventh. The pulse also travels along a heartbeat line, and early levels show the count as a number. The music is the cue, so a player who can hear the row can play it.' },
    { h:'What stays fixed',
      a:'The contract stays fixed, not the rule. Each minigame has its own song, its own scene and its own timing idea, and the input is one or two inputs, since the DS game uses the stylus. The player learns a new rule every few minutes and answers it with the same habit: listen, then answer.',
      b:'The input and a seventh-beat core stay fixed in every level: always one button, and a count that new beat types bend with two-beat rows, held beats, silent beats and delayed ones. The game spends its variety on what that press has to survive.' },
    { h:'How a new idea is taught',
      a:'Most minigames open with a practice or demonstration, so the player hears the pattern with nothing at stake. The cue repeats before the player must answer, so the first answer copies something just heard. The DS game needs at least an OK rating to go on, so the practice earns its place.',
      b:'Most levels open with a short tutorial on a new kind of beat, such as a two-beat row, a held beat or a silent beat marked with red crosses. The developers say the animations exist to make each beat type readable, so each type gets its own look. Only then does a level combine it with earlier types.' },
    { h:'How difficulty rises',
      a:'Later games in a set use offbeats, rests and longer phrases, and each set ends in a remix that mixes its earlier games. The remix tests recall of rules learned minutes before. The rule inside one game does not grow; the player’s stock of rules does.',
      b:'Difficulty rises through the rhythm and the presentation together: swing, a second row, irregular bars, silent beats, then screen shake, flips and colour changes. In level 2-X the game window itself moves across the desktop. Because the button never changes, each new trick tests how much attention the player can hold on the beat.' },
    { h:'What the picture is allowed to do',
      a:'The picture helps. A character’s wind-up is a countdown, and the scene reacts when the player is on time. In our reading the picture is a hint and the sound is the authority, so a player who has learned a game can close their eyes and still land the press.',
      b:'The picture is free to lie. The developers aim for every mechanic to be playable blind without memorisation, and Steam lists the game as playable without vision, so the effects can shake, flip or hide the scene. We infer, and no developer says it, that this only works if a press is judged against the audio and not against what is on screen.' },
    { h:'Help beyond the default cue',
      a:'Megamix added an input timing gauge that shows how early or late a press landed, and Groove added text-to-speech narration for visually impaired players. These are separate fixes for separate needs. Groove was also criticised for input delay in docked TV play.',
      b:'Steam lists difficulty levels, narrated menus and background volume controls. The store page warns about flashing lights and colours. We did not verify which latency settings the game offers.' },
    { h:'What each choice risks',
      a:'Each minigame needs its own song, scene and animation, so variety is expensive; Fever’s team was, in Iwata’s words, about three times as large, comparatively speaking. A coarse rating of Try Again, OK or Superb also hides which beat was late. A laggy display shifts the beat the player answers, and a noisy room hides it.',
      b:'One button means one kind of play, so difficulty can only come from timing and attention. The visual disruption that makes the game memorable is also what some players find tiring or unfair. Strict timing is harsh when the player’s audio chain adds delay.' }
  ],
  diagram:{ kind:'matrix', title:'Two ways to make the ear the authority',
    rows:['The cue','The input','New idea','The picture','Late help'], cols:['Rhythm Heaven','Rhythm Doctor'],
    cells:[
      ['A song and a character’s motion','The music; the count shown as a number'],
      ['One or two inputs, new rule per game','One button; a seventh-beat core'],
      ['A new minigame, with a demo first','A new beat type, with a tutorial first'],
      ['Helps: the scene reacts on time','Free to shake, flip or lie'],
      ['Timing gauge; text-to-speech','Narrated menus; flash warning']
    ],
    note:'A summary of the sections above, not measured data.' },
  verdict:'Rhythm Heaven changes the rule every few minutes and keeps the habit, which costs a new song and scene for each idea. Rhythm Doctor keeps the input and the core count and changes what surrounds them, which costs variety of action and asks the player to trust the sound over a picture that is trying to mislead them.',
  principle:'Put the timing information in the sound, then decide what the picture may do: help the player, as in a wind-up, or test them, as in a shaking screen, and make sure the player can tell which.',
  topics:['rhythm-and-music-timed-design', 'craft-audio-clock-and-input-latency'],
  sources:['https://en.wikipedia.org/wiki/Rhythm_Tengoku', 'https://en.wikipedia.org/wiki/Rhythm_Heaven_(video_game)', 'https://en.wikipedia.org/wiki/Rhythm_Heaven_Megamix', 'https://en.wikipedia.org/wiki/Rhythm_Heaven_Groove', 'https://iwataasks.nintendo.com/interviews/wii/rhythmheavenfever/0/1', 'https://store.steampowered.com/app/774181/Rhythm_Doctor/', 'https://en.wikipedia.org/wiki/Rhythm_Doctor', 'https://www.gamedeveloper.com/design/using-medical-stories-and-heart-conditions-to-create-musical-challenges-in-rhythm-doctor', 'https://toucharcade.com/2017/09/22/tgs-2017-hands-on-with-rhythm-doctor-a-rhythm-heaven-inspired-music-game/', 'https://gamingtrend.com/feature/interviews/is-there-a-rhythm-doctor-in-the-house-7th-beat-games-members-on-game-development']
});

COMPARE({
  id:'puzzles-inside-an-action-game',
  t:'Puzzle rooms that do not pause the action',
  problem:'An action game that adds puzzle rooms risks stopping the fight to ask a different question, so the designer has to decide whether the puzzle uses the combat kit or sits beside it.',
  games:['crosscode', 'zelda'],
  sections:[
    { h:'What the puzzle is made of',
      a:'The ball Lea throws is both her ranged attack and the key to the puzzle world. It hits switches, moves boxes and ice pellets, and works on barriers, water bubbles and fans, and it bounces off walls. A held element changes what the ball does.',
      b:'For most of the series each dungeon is built around one new item, such as a boomerang, a hookshot or a bow. The item solves puzzles in that dungeon and also clears an obstacle seen earlier in the overworld. The sword stays the main way to fight.' },
    { h:'Where the puzzle sits',
      a:'In the same hand as the fight. A switch room tests aim and bounce with no time pressure, and an arena tests the same skills under attack. Felix Klein described the game as having puzzle-heavy battles and fast puzzles.',
      b:'Mostly in its own rooms. In our reading, puzzle rooms and fight rooms are often separate: a room asks the player to use the item and another asks the player to fight, though the item also helps in fights, as a boomerang stuns or a hookshot pulls. The item is the link, because the same tool answers the room and weakens the boss.' },
    { h:'How the tool is taught',
      a:'Each element has a dungeon that introduces it alone. A small room offers one new element or puzzle object with only one thing to try, and the dungeon then combines it with older ones. The first dungeon comes before the first town, so the player learns the ball by playing.',
      b:'The first dungeon in a game often shows a locked door or a gap the player cannot yet cross. The item found a few rooms later answers it. Ocarina of Time’s first dungeon ends in a boss that the item found inside can realistically win, so the lesson is rehearsed before the overworld tests it.' },
    { h:'What a boss asks',
      a:'Bosses ask for the same grammar in motion. The player reads a pattern, finds a weakness and then performs a shot that is also a puzzle answer. A reviewer on The Sixth Axis praised the puzzles and bosses but found some boss fights longer than needed, with a full restart on death.',
      b:'The boss often falls to the dungeon item, so the dungeon’s puzzles have already taught the tool the boss asks for. This is the series’ loop of find, use and use again, and the boss is its last use.' },
    { h:'What a wrong try costs',
      a:'A wrong shot in an ordinary room is cheap and can be repeated at once. Timed and ordered puzzles reset, and one reviewer quoted on Wikipedia describes dozens of attempts. A difficulty setting can adjust combat and puzzles separately, so a player can lower one cost without losing the room.',
      b:'A wrong guess costs time, not the run. A locked door does not punish the wrong tool, and most dungeons hide a map and compass that show the layout. The dungeon is a combination lock the player assembles room by room.' },
    { h:'How the idea grows over a long game',
      a:'Rooms grow from one switch to a chain of bounces, timed hits and element changes. Later dungeons add more steps, not new verbs; that is our reading, and no source places player fatigue there. A critic at CoG Connected described constant recalibration between puzzle and combat modes.',
      b:'Nintendo escalated the scale of the loop more than its logic. Inside a dungeon, later rooms need the new item together with an older one. Breath of the Wild removed the item lock and handed over its core runes on the first plateau, which moved the challenge from which item the player owns to how prepared they are.' },
    { h:'What each choice risks',
      a:'One toolkit drives everything, so late dungeons can only lengthen the chain. A puzzle that is cheap to read becomes expensive to repeat once the timed rooms reset. One reviewer said switching between puzzle thinking and combat thinking can tire a player.',
      b:'Because the puzzle sits in its own room, it can pause the action. A tool tied to a single dungeon also ties puzzle design to that tool, because later rooms can assume the player owns it. Open designs such as Breath of the Wild’s must make every puzzle solvable with the tools every player already has.' }
  ],
  diagram:{ kind:'matrix', title:'Where the puzzle gets its tool',
    rows:['The tool','Puzzle room','Boss','Wrong try','Long game'], cols:['CrossCode','Zelda'],
    cells:[
      ['The ball: also the main attack','A dungeon item: key and weapon'],
      ['Aim and bounce, no enemies needed','A room that asks for the item'],
      ['The same shot, under attack','Often weak to the dungeon item'],
      ['Cheap; timed rooms reset','Costs time, not the run'],
      ['More steps in the same chain','New item, new dungeon, new lock']
    ],
    note:'A summary of the sections above, not measured data.' },
  verdict:'CrossCode teaches one set of skills once and gets two kinds of play from it, at the cost that late dungeons can only add steps. Zelda gives every dungeon a new tool and a fresh lock, at the cost that, in our reading, the puzzle and the fight are often kept apart and each new tool has to be taught again.',
  principle:'Build the puzzles from the verbs the player already uses to fight, teach each puzzle object in a small room, and decide in advance whether a late puzzle may add steps or must add a new verb.',
  topics:['puzzles-in-action-spaces', 'puzzle-design', 'combat-design'],
  sources:['https://en.wikipedia.org/wiki/CrossCode', 'https://store.steampowered.com/app/368340/CrossCode/', 'https://www.siliconera.com/crosscode-developer-reflects-rpgs-six-years-evolution/', 'https://www.thesixthaxis.com/2020/09/16/crosscode-review/', 'https://cogconnected.com/review/crosscode-review/', 'https://en.wikipedia.org/wiki/The_Legend_of_Zelda', 'https://en.wikipedia.org/wiki/Ocarina_of_Time', 'https://en.wikipedia.org/wiki/The_Legend_of_Zelda:_Breath_of_the_Wild', 'https://gameluster.com/aonuma-on-how-nintendo-makes-zelda-dungeons-majoras-masks-melancholy-tone-anju-and-kafei-quest/']
});

COMPARE({
  id:'charting-by-hand',
  t:'Turning a song into a level a player can read',
  problem:'A song is a stream of sound, and a level made from it has to say what the player does and when, in a form the player can read at speed.',
  games:['beat-saber', 'rhythm-doctor'],
  sections:[
    { h:'What the chart is',
      a:'Blocks travel down a track on a grid of four columns and three rows. Each is red for the left saber or blue for the right, and most carry an arrow for one of eight cut directions. The chart is a sequence of arm movements, not a list of targets.',
      b:'A level is a set of rows, each a heartbeat line from a patient to a heart, and most rows end in a press on the seventh beat. Beat types such as a two-beat row, a held beat, a silent beat or a swung beat change what that press means. The chart is a sequence of counting problems.' },
    { h:'Who writes it',
      a:'Each level is made by hand for its song. Composer Jaroslav Beck said he composed while watching videos of each level’s stage, with placeholder notes, and the charts were then made for each finished track. The level editor added in May 2019 lets map makers do the same work.',
      b:'The creator, Hafiz Azman, writes music for the game with sound designer s9menine. The game also ships a level editor with more than fifty visual effects and backgrounds, so effects are authored in the same place as the beats and can be timed to the music.' },
    { h:'What a good chart does',
      a:'It leaves the arm where the next cut starts. A down swing is followed by an up swing, so the player settles into a pattern and the hard section feels like a passage learned. A chart that ignores arm flow feels awkward however good the song is.',
      b:'It adds one new kind of beat at a time, with its own look, so a miss points to a timing error and not to a misunderstood rule. Most beat types are taught in a short tutorial before a level tests it. Boss levels then combine several types.' },
    { h:'What the player reads',
      a:'The rule is drawn on the block: colour gives the hand and the arrow gives the swing. A wrong cut is marked with an X where the block was. In our reading, experienced players read dense patterns without looking away from the track.',
      b:'The heartbeat line carries the pulse, and a number counts the early rows. Later the picture is shaken, flipped or hidden, and the sound is the real cue. We infer that the level must be built so that effects never change what counts as on time; no developer says so.' },
    { h:'How the chart gets harder',
      a:'Each song comes in several difficulties, up to Expert+. Harder charts raise note speed and density and add crossovers, fast alternating streams and walls that force the player to duck. The rules do not change between difficulties.',
      b:'Difficulty comes from the rhythm and from the presentation: swing, a second row, irregular bars and silent beats, then screen effects. In level 2-X the game window moves around the desktop. The developers say that in this gimmick the goal is to make you lose the beat.' },
    { h:'How the author checks it',
      a:'The Beat Saber community wiki warns of mapper blindness, where a mapper cannot see what is unreadable in their own map because they know the intended motion, and of overmapping, notes placed where there is no sound to follow. It advises testing with fresh players and building easier charts down from harder ones. This is community guidance, not a developer rule.',
      b:'Tutorials tell the author where a player will meet a new idea. An author can also check a level by playing it with the picture hidden: if the score holds, the sound is the cue. This is our suggestion; no source describes the studio’s own testing.' },
    { h:'What each choice risks',
      a:'The chart author carries the weight. Placing blocks only by the beat, without regard for where the last swing left the arm, makes a tiring level, and scoring that rewards big swings tires arms and shoulders. Expert charts can feel like reading a stream of arrows more than playing to the music.',
      b:'A level that bends the beat and the screen can be unfair or unsafe for some players, and the store page warns about flashing lights and colours. In our reading, every effect is spent on difficulty, so less is spent on clarity.' }
  ],
  diagram:{ kind:'matrix', title:'What a hand-made chart asks the player to do',
    rows:['The unit','Hard parts','Taught by','Read from','Tested by'], cols:['Beat Saber','Rhythm Doctor'],
    cells:[
      ['A cut: one hand, one direction','A press on the row’s beat, usually the seventh'],
      ['Crossovers, streams, walls','Swing, silent beats, effects'],
      ['Colour and arrow on the block','A short tutorial per beat type'],
      ['The block, where the eye is','The sound; the line and count help'],
      ['Flow: does a swing set up the next','Playing with the picture hidden']
    ],
    note:'A summary of the sections above, not measured data. The last row mixes community advice and our own suggestion.' },
  verdict:'Beat Saber charts the song as movements, which makes a level feel like a dance and puts the weight on the author’s sense of flow. Rhythm Doctor charts the song as counting problems with attacks on the picture, which keeps the input constant and puts the weight on teaching each beat type and keeping the sound honest.',
  principle:'Chart for the body or the count the player actually has: check that each step leaves the player ready for the next, and test the chart with a fresh player and with the picture hidden before you trust it.',
  topics:['rhythm-and-music-timed-design', 'level-structure'],
  sources:['https://en.wikipedia.org/wiki/Beat_Saber', 'https://bsmg.wiki/ranking-guide.html', 'https://bsmg.wiki/mapping/intermediate-mapping.html', 'https://voicesofvr.com/644-beat-saber-lets-you-become-the-music-through-puzzles-your-body-solves/', 'https://blog.playstation.com/archive/2019/06/27/this-is-how-beat-sabers-awesome-action-rhythm-stages-are-built/', 'https://store.steampowered.com/app/774181/Rhythm_Doctor/', 'https://en.wikipedia.org/wiki/Rhythm_Doctor', 'https://www.gamedeveloper.com/design/using-medical-stories-and-heart-conditions-to-create-musical-challenges-in-rhythm-doctor', 'https://gamingtrend.com/feature/interviews/is-there-a-rhythm-doctor-in-the-house-7th-beat-games-members-on-game-development']
});

// The shelf: the problems these comparisons share, each in a reading order.
COMPARE_SHELF('failure', 'When the player fails', 'A loss has to leave something behind, and a hard game has to let more players through. Read the run-based answer first, then the difficulty one.', ['failed-run-worth-it', 'hard-for-everyone']);
COMPARE_SHELF('teaching', 'Teaching without stopping play', 'Each pair teaches a rule inside play instead of in a text box: by the layout of a first level, by the combat kit used on a room, by sound alone, and by a chart written to be read. Read them in that order.', ['teaching-without-words', 'puzzles-inside-an-action-game', 'rhythm-by-ear', 'charting-by-hand']);
COMPARE_SHELF('return', 'Bringing the player back', 'Why a player comes back, and whether coming back feels like a reward or a chore: first the daily return, then the walk back through a level, then the crossing of a whole world.', ['daily-habit', 'return-trips', 'getting-around-an-open-world']);
COMPARE_SHELF('live', 'Keeping a live game fair as it grows', 'A game that keeps adding content has to keep the old worth choosing, change the strength of what players have learned, and hold more players than one world was built for. Read them in that order.', ['keeping-old-content-relevant', 'balance-patches-in-a-live-game', 'one-world-many-players']);
