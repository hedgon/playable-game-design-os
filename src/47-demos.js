/* =====================================================================
   DEMOS: which topic carries which interactive demo, and what to try.
   DEMO('topic-id', { kind, t?, ask }): `kind` is one of DEMO_KINDS
   (05-registry.js; drawn by 97-demos.js), `t` a title for this topic
   when the kind's own does not fit, and `ask` one thing to try and what
   it shows about this topic. One kind can serve several topics; the
   `ask` is what ties it to each.
   ===================================================================== */

// One hit, five layers of feedback.
DEMO('game-feel-and-juice', { kind: 'hit', ask: 'Hit once with nothing on, then add one layer at a time. Which single layer changes the feel most, and does any of them change the damage?' });
DEMO('animation-and-vfx', { kind: 'hit', t: 'What the animation adds to a hit', ask: 'Turn on squash alone, then flash alone. One says how hard the hit was, the other only that it happened: which is which?' });
DEMO('feedback-and-affordance', { kind: 'hit', t: 'Feedback you can switch off', ask: 'With every layer off, the block that is hit does nothing: only the bar moves. Look away from the bar and hit: can you tell from the block that it landed? Then find the one layer that fixes it.' });

// A jump as three numbers.
DEMO('three-cs', { kind: 'jump', ask: 'Make a jump that rises gently and falls fast, then one that floats. Read the frames in the air for each: which would you want over a pit, and which for landing on an enemy?' });
DEMO('controls-and-friction', { kind: 'jump', t: 'How long a press keeps the player in the air', ask: 'Raise the take-off speed and both gravities together until the jump reaches about the same peak in about a third fewer frames. Every frame in the air is a frame in which the player cannot change their mind.' });
DEMO('level-blockout-and-metrics', { kind: 'jump', t: 'The numbers a level is built from', ask: 'Change the take-off speed and note the new peak. Every gap and ledge already built to the old peak is now wrong, which is why these numbers are shared before the blockout.' });

// A wind-up of a chosen length.
DEMO('combat-design', { kind: 'telegraph', ask: 'Find the shortest wind-up you can dodge five times running. Below it you are guessing, not reading: that is your floor for a fair attack.' });
DEMO('readable-and-fair-ai', { kind: 'telegraph', t: 'When does an attack stop being readable?', ask: 'Set 150 ms and try ten times. Count the hits you would call your own fault. A player who cannot explain a loss calls the enemy cheap.' });
DEMO('difficulty', { kind: 'telegraph', t: 'Harder by speed, or harder by demand?', ask: 'Shorten the wind-up until you fail half the time. The attack did not get smarter, only faster than you: is that the kind of hard your game wants?' });

// Push your luck.
DEMO('risk-reward', { kind: 'pushluck', ask: 'Play five rounds by feel, then switch the odds on. Where did you stop pushing, and where does the average say you should have?' });
DEMO('decisions', { kind: 'pushluck', t: 'A decision with two defensible answers', ask: 'Win three pushes, then stop at the fourth with the odds switched on: on average it is worth nothing either way. Say out loud why you would bank and why you would push on. If you can argue both, it is a real decision.' });
DEMO('tension-release', { kind: 'pushluck', t: 'Tension you build yourself', ask: 'Push until you would hate to lose what is at risk, then bank. Notice the breath out: the release is only as big as what was at risk.' });

// A thirty-minute economy.
DEMO('economy-and-resources', { kind: 'economy', ask: 'Lower the price until something is bought every minute or two: buying has stopped being a decision. Then raise the upkeep until the purchases are several minutes apart: that gap is where the decision lives.' });
DEMO('economy-modelling-and-balance', { kind: 'economy', t: 'A model you can run in your head first', ask: 'Predict the minute of the first purchase before you move a slider, then check. A model earns its keep when it catches a guess that was off.' });
DEMO('progression', { kind: 'economy', t: 'How fast should the next thing arrive?', ask: 'Set the price rise to 0%, then to 60%. With no rise the purchases never slow down; with a steep one the session ends on a wall.' });

// Rock, paper, scissors with unequal stakes.
DEMO('balance-methods', { kind: 'rps', ask: 'Make a win with rock worth 5. Rock does not become the most picked option: which does, and why?' });
DEMO('builds-and-loadouts', { kind: 'rps', t: 'A popular build is not always the strong one', ask: 'Find stakes where one option is picked half the time. Nothing is broken: read a pick rate together with what that option beats.' });
DEMO('multiplayer-design', { kind: 'rps', t: 'Counters, with numbers on them', ask: 'Set all three stakes equal, then raise one. The counter to the valuable option is what fills the lobby.' });

// A win rate and its sample size.
DEMO('metrics-and-success', { kind: 'sample', ask: 'Set a true rate of 52% and measure at 300 games. How many of the twenty readings would have sent you to fix something that was fine?' });
DEMO('live-design-seasons-and-data', { kind: 'sample', t: 'Did the patch work, or is it noise?', ask: 'A patch moved a win rate from 50% to 51.5%. Find the sample at which twenty readings land on the right side of 50% run after run, not once by luck.' });
DEMO('playtesting', { kind: 'sample', t: 'Why one tester is not a pattern', ask: 'Use the smallest sample and measure a few times. Even a hundred games spread this far, so five playtest sessions tell you what can happen, not how often.' });

// One word among more and more.
DEMO('readability-and-hierarchy', { kind: 'hick', ask: 'Time yourself at 4 options, then at 32. The words did not get harder: the screen got busier.' });
DEMO('ux-as-design', { kind: 'hick', t: 'What a crowded menu costs', ask: 'Run 8, 16 and 32 options. Each extra option is paid for on every visit to that menu, so cut or group before you style.' });

// A drop rate, seen from the unlucky side.
DEMO('monetisation-design', { kind: 'odds', ask: 'Set 1% with no guarantee and read the last bar. Then add a guarantee at 90 pulls: the first bar does not move, so what changed, and for what share of players?' });
DEMO('ethics-and-responsibility', { kind: 'odds', t: 'Who pays for a low drop rate?', ask: 'Lower the rate until the unluckiest 1% need more than 500 pulls. That player is real, and the odds screen is what tells them before they start.' });
DEMO('business-model', { kind: 'odds', t: 'What a random reward costs the player', ask: 'Multiply each bar by the price of one pull in a game you know. A rate is a price list that most players never see written out.' });
