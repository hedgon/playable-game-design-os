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
      a:'Hades turns death into a scene. You return to the House of Hades, characters remark on what killed you, and the dialogue moves forward with each run. Each run also banks currencies that buy permanent upgrades.',
      b:'Slay the Spire gives back points toward unlocks. Finished and failed runs both count toward new characters, cards and relics. Nothing you carry makes the next deck stronger, but you know more about the cards and enemies.' },
    { h:'Where the player feels progress',
      a:'In the story and in the numbers. A run that ends early can still advance a relationship, and the Mirror of Night makes the next attempt a little easier.',
      b:'In the player. The rules are the same every run, so the thing that grows is your judgement about what to take and what to skip.' },
    { h:'How the game helps someone who keeps losing',
      a:'God Mode is an optional setting that makes the character stronger after each failed run, so a struggling player can still reach the story.',
      b:'Ascension goes the other way. It unlocks harder modifiers as you win, so the help for a new player is that the rules are fixed and enemy moves are shown in advance, not a carried bonus.' },
    { h:'What each choice risks',
      a:'Permanent upgrades can make a run feel safe once enough are bought, which weakens the tension that made dying matter.',
      b:'With no carried power, an early bad offer can sink a run, and a new player may feel a quick loss taught them nothing.' }
  ],
  verdict:'Hades pays the player in story and power for every attempt, at the cost of some danger. Slay the Spire keeps every run equally risky and pays in understanding, at the cost of a slower reward for new players.',
  principle:'Decide what a loss gives back, power, story or understanding, and make sure it arrives on the first loss, not the tenth.',
  topics:['challenge-failure-recovery', 'progression', 'knowledge-as-progression'],
  sources:['https://en.wikipedia.org/wiki/Hades_(video_game)', 'https://en.wikipedia.org/wiki/Slay_the_Spire', 'https://www.gamedeveloper.com/design/learn-i-slay-the-spire-i-s-metrics-driven-approach-to-game-balancing-at-gdc-2019', 'https://caniplaythat.com/2021/08/11/hades-god-mode-explained-by-supergiant-games']
});

COMPARE({
  id:'teaching-without-words',
  t:'Teaching a mechanic without tutorial text',
  problem:'A new player has to learn what they can do, and the game would rather not stop to tell them.',
  games:['portal', 'super-mario'],
  sections:[
    { h:'The first minute',
      a:'You wake in a glass cell, a portal opens in the wall, and you step through it. The rule of the whole game is understood from that one step, with no menu or prompt.',
      b:'World 1-1 starts with Mario at the left edge and control already in your hands. There is no tutorial text. The first Goomba is on the first screen, so the first thing you learn is jump.' },
    { h:'How new ideas arrive',
      a:'Each test chamber tends to add one idea, such as a surface that takes no portal or a cube on a button, then a later chamber combines it with what came before. Early rooms give many hints, and the support is slowly removed.',
      b:'The level repeats, varies and escalates its hazards. Miyamoto has said World 1-1 was designed so players gradually and naturally understand what they are doing. The mushroom block is placed so it is hard to avoid, which teaches that mushrooms help.' },
    { h:'When players do not notice',
      a:'Playtesters ignored the companion cube that was meant to teach carrying an object, so Valve added dialogue and a heart icon instead of a prompt.',
      b:'Small Mario lets players see and feel the change when he grows. The level is built so the player almost always gets the Super Mushroom, and a Goomba, clearly an enemy, is on screen first, so the two are learned as different things.' }
  ],
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
      a:'Assist Mode lets the player slow the game, use unlimited dashes or turn on invincibility. It was first called Cheat Mode, and the developers renamed it because the name felt judgmental.',
      b:'The game has no difficulty setting. Help comes from inside the game: you can summon other players to a fight, and you can level up in the areas you choose.' },
    { h:'Who decides how much help',
      a:'The player, one option at a time. They remove exactly the friction they struggle with and nothing else.',
      b:'The player again, but through play: which build to level, which route to take, and when to ask for a summon.' },
    { h:'What happens when you fail',
      a:'You respawn at the start of the room almost at once, so retrying is cheap, and the optional strawberries and B-sides add difficulty for those who want it.',
      b:'Bonfires are the only checkpoints, enemies come back, and souls you drop at the place of death are lost for good if you die again before reaching them.' }
  ],
  verdict:'Celeste puts the choice in a menu, which opens the whole game to more people at the cost of the sense that everyone passed the same test. Dark Souls keeps one test and offers help that is part of the world, at the cost that a player who needs more help has to find it themselves.',
  principle:'Offer the player ways to change how hard the game is for them, and let them choose how openly: a menu setting, or a tool inside the fiction.',
  topics:['difficulty', 'accessibility', 'challenge-failure-recovery'],
  sources:['https://en.wikipedia.org/wiki/Celeste_(video_game)', 'https://en.wikipedia.org/wiki/Dark_Souls', 'https://www.vice.com/en/article/celeste-difficulty-assist-mode']
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
    { h:'How the game spreads',
      a:'The share button copies a grid of coloured squares that shows your result without the answer. Players began sharing hand-made grids first, and Wardle built it in. The number of players grew from 90 on 1 November 2021 to over 2 million by early January 2022.',
      b:'Friends can be asked for lives, and the game is free to download on phones. Spread follows the store charts and the social ask rather than a shared daily result.' },
    { h:'How the game earns',
      a:'It was free with no advertising or accounts at first, and was later sold to the New York Times.',
      b:'Free to play. The player starts with five lives, and gold buys boosters, extra moves or a refill. Only a small share of players pay.' },
    { h:'Where the ethics sit',
      a:'The limit protects the player: a game that ends for the day cannot take more of it.',
      b:'The limit is also a purchase point: when moves or lives run out, the game offers extra moves or lives for gold. The UK Office of Fair Trading investigated mechanics aimed at younger players.' }
  ],
  verdict:'Wordle gains a shared moment and a calm reputation, at the cost of a small game with little to sell. Candy Crush gains a long ladder and steady income, at the cost of a pacing system many players read as a payment funnel.',
  principle:'A limit can serve the player or the till. Ask whom it protects before you add it, and whether the player would still come back if you removed the payment.',
  topics:['platform-and-session', 'monetisation-design', 'ethics-and-responsibility'],
  sources:['https://en.wikipedia.org/wiki/Wordle', 'https://en.wikipedia.org/wiki/Candy_Crush_Saga', 'https://mobilegamer.biz/how-king-defines-a-good-candy-crush-saga-level-and-why-it-constantly-prunes-the-bad-ones/']
});
