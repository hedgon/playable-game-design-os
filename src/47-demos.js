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

// Parts and the pairs they make. `w` names the parts for this topic.
DEMO('mechanics-and-rules', { kind: 'pairs', w: ['mechanics'], t: 'Every mechanic meets every other', ask: 'Count the mechanics in your game and set the slider. Could you say what happens for each pair? The pairs you cannot answer for are where the bugs and the surprises live.' });
DEMO('depth-vs-complexity', { kind: 'pairs', w: ['rules'], t: 'What one more rule costs', ask: 'Go from 6 rules to 12. The player has twice as much to learn, and you have more than four times as many pairs to make interesting: complexity is paid per rule, depth has to be earned per pair.' });
DEMO('systemic-design', { kind: 'pairs', w: ['systems'], t: 'Systems meet in pairs', ask: 'Set 4 systems, then 8. Six pairs can be designed by hand; twenty-eight cannot, so the systems need shared rules that settle every pair at once.' });
DEMO('agency-and-emergence', { kind: 'pairs', w: ['objects'], t: 'Where emergence comes from', ask: 'Set the number of things a player can combine. Emergence is the pairs you never scripted that still do something sensible: how many of these pairs have you actually tried?' });
DEMO('team-and-collaboration', { kind: 'pairs', w: ['people'], t: 'Every person talks to every other', ask: 'Set your team size, then add three people. Count the new conversations that now have to happen for everyone to stay in step: a hire adds that cost before they add anything else.' });
DEMO('pm-cross-discipline', { kind: 'pairs', w: ['disciplines'], t: 'Handoffs come in pairs', ask: 'Set the number of disciplines that touch one feature. Each pair is a handoff that can be late or misread, so name an owner for the pairs, not only for the teams.' });

// Lists of content, multiplied.
DEMO('content-multiplies', { kind: 'combos', ask: 'Add one enemy type, then take it away and add one arena instead. Which adds more situations, and which costs more to build? The shortest list is where one more piece buys the most.' });
DEMO('encounters-and-enemies', { kind: 'combos', t: 'An enemy is worth what it combines with', ask: 'With 4 enemy types, raise the weapons from 3 to 4. Eight new situations appear without a single new enemy: before building enemy number five, check that the four you have play differently against each weapon.' });
DEMO('encounter-design', { kind: 'combos', t: 'How many encounters do these pieces make?', ask: 'Set the numbers for one level of your game. If the count is far above the encounters you planned, you have variety to pick the best from; if it is below, the level will repeat itself.' });

// Hits to kill.
DEMO('items-weapons-abilities', { kind: 'ttk', ask: 'With 100 health, raise the damage from 34 one point at a time. Nothing changes until 50, then a whole hit disappears. A +5 damage upgrade is worth a lot or nothing, depending on where it lands.' });

// A pass rate, compounded. `w` names who goes through the steps.
DEMO('onboarding', { kind: 'funnel', w: ['players'], t: 'Every screen before play loses a few', ask: 'Count the steps between launching your game and the first moment of play, and set them. Then remove two. Which two could go, or wait until the player already wants to stay?' });
DEMO('launch-and-discoverability', { kind: 'funnel', w: ['people'], t: 'From seeing the game to buying it', ask: 'Treat each step as one stage: the capsule, the page, the trailer, the wishlist, the launch day, the purchase. Even at a generous 90% each, six stages lose almost half, and real stages pass far fewer. Which stage of yours have you measured?' });
DEMO('soft-launch-and-playable-ads', { kind: 'funnel', w: ['ad viewers'], t: 'From an ad to an install', ask: 'Set 4 steps (sees the ad, plays it, taps through, installs) and the pass rate to your guess. A soft launch exists to replace that one guess with four measured rates before the budget is spent.' });
DEMO('store-presence', { kind: 'funnel', w: ['store visitors'], t: 'A store page is a short funnel', ask: 'Set 4 steps: the capsule, the first screenshot, the trailer, the price. Move the pass rate from 70% to 80%. The end of the funnel grows by about 70%, from a change no single step shows.' });
DEMO('lead-hiring', { kind: 'funnel', w: ['applicants'], t: 'A hiring loop is a funnel too', ask: 'Set your stages (screen, task, interviews, offer) and the share that passes each. If fewer than 20 of 1,000 reach the end, every stage you add needs a stronger reason than one more opinion.' });
DEMO('ai-agentic-implementation', { kind: 'funnel', w: ['agent runs'], t: 'Twenty steps at 95% each', ask: 'Set 20 steps at 95%. About a third of runs finish with no step wrong, which is why an agent needs a check it can run after each step, not one review at the end.' });
DEMO('models-agent-harnesses', { kind: 'funnel', w: ['agent runs'], t: 'What catching errors at each step is worth', ask: 'At 20 steps, raise the pass rate from 90% to 99%. Clean runs go from about one in eight to more than four in five: a harness earns its keep by catching errors at each step.' });
DEMO('models-what-makes-agents-capable', { kind: 'funnel', w: ['tasks'], t: 'Long tasks fail from small slips', ask: 'Hold the pass rate at 95% and raise the steps from 5 to 20. Long tasks fail from many small slips, not one big one, which is why the length of task an agent can finish is the number to watch.' });
DEMO('verifying-ai-output', { kind: 'funnel', w: ['answers'], t: 'Small error rates multiply', ask: 'Set the steps to the number of facts in one answer you would use unchecked, and the pass rate to how often each fact is right. How many of 1,000 such answers are right all the way through?' });
DEMO('craft-verification-as-the-job', { kind: 'funnel', w: ['changes'], t: 'How many changes arrive clean?', ask: 'Set 8 steps at 97%: a change passes through that many hands and tools before it ships. More than one in five carries a mistake somewhere, so the check at the end is the job, not a formality.' });

// A loop, repeated for a session.
DEMO('core-loop', { kind: 'loop', ask: 'Set your own loop length and how much of it is waiting: an unskippable animation, a menu, a walk back. Read the minutes it adds up to in one session. What the player repeats most deserves the most polish.' });
DEMO('challenge-failure-recovery', { kind: 'loop', t: 'What a retry costs', ask: 'Treat one loop as one attempt at a hard section, and the waiting as the death animation, the reload and the walk back. Bring the waiting under 5% and see how many minutes of play come back.' });
DEMO('platform-and-session', { kind: 'loop', t: 'How many loops fit a session?', ask: 'Set the session to 5 minutes, about one wait at a bus stop. How many loops fit, and does a loop end somewhere a player can put the phone down?' });
DEMO('backtracking-and-return-trips', { kind: 'loop', t: 'The walk back, added up', ask: 'Treat one loop as one trip out and back, and the waiting as the part that is plain walking through cleared rooms. If the minutes are large, the return trip needs a shortcut, a new threat or a new view.' });

// Three-point estimates.
DEMO('pm-estimation', { kind: 'estimate', ask: 'Enter a task you are about to promise: the good case, the likely one, the bad one. Compare the expected value with the number you would have said out loud.' });
DEMO('planning-and-milestones', { kind: 'estimate', t: 'A milestone date is a spread, not a point', ask: 'Make the bad case three times the likely one, as it can be for work nobody has done before. The expected date moves past the likely one: say which of the two a milestone date is quoting.' });

// Risk as an average cost.
DEMO('pm-risk', { kind: 'risk', ask: 'Take the top line of your risk list and enter it. If finding out now costs less than its exposure, it belongs at the start of the schedule, not the end.' });
DEMO('risk-and-dependencies', { kind: 'risk', t: 'When is a dependency worth testing early?', ask: 'Enter a dependency you are waiting on: the chance it slips and the days you would lose. Then enter what a small integration test this week would cost.' });
DEMO('prototyping', { kind: 'risk', t: 'A prototype is a cheap way to buy an answer', ask: 'Enter the chance your core idea is not fun, and the days you would lose finding that out after full production. Any prototype cheaper than that exposure pays for itself.' });

// Tries before a date.
DEMO('iteration-and-evidence', { kind: 'cycles', ask: 'Set how long one change takes to go from an idea to a player trying it. Then find what would halve it: a faster build, a shorter test, fewer approvals.' });
DEMO('ai-loop', { kind: 'cycles', t: 'The loop got shorter. How many tries is that?', ask: 'Set the loop to what it took before AI help and note the tries, then set what it takes now. The gain only counts if each try still ends in a real check, by a person or a test.' });
DEMO('infra-ci-pipelines', { kind: 'cycles', t: 'What a slow pipeline costs', ask: 'Set 1 week and the loop to your pipeline time. A 1-hour pipeline gives 40 tries in the week; a 15-minute one gives 160. Count what your team gets, then find the slowest stage.' });

// Amdahl's law.
DEMO('bottleneck-shift', { kind: 'amdahl', ask: 'Set the share to how much of your week is typing code or drafting text, and make it 10× faster. Read the limit: whatever is left (deciding, testing, agreeing) is where the time now goes.' });
DEMO('craft-engineer-in-the-ai-era', { kind: 'amdahl', t: 'What a faster part does to the whole job', ask: 'If writing code is 30% of the job and becomes 5× faster, the job is 1.32× faster. Now move the share instead of the speed: the engineer who gains most is the one whose other 70% changes too.' });
DEMO('craft-measuring-ai-uplift', { kind: 'amdahl', t: 'Why a 5× tool gives a 1.3× team', ask: 'Enter the speed-up a vendor quotes and the share of your work it applies to. That is the most a team-level measurement can show, so measure the whole task, not the part that got faster.' });
DEMO('ai-for-implementation', { kind: 'amdahl', t: 'How much faster is the prototype, really?', ask: 'Set the share to the part of a prototype that is writing code, and make it 10× faster. What is left is deciding what to build and playing it: the limit shows how much those two now matter.' });

// A check, its catch rate and its false alarms. `w` is [who, what the real ones do].
DEMO('server-anticheat', { kind: 'baserate', w: ['players', 'cheat'], t: 'Who gets banned?', ask: 'With 1% cheaters, a detector that catches 95% and wrongly flags 2% of honest players, two bans in three hit an honest player. Lower the false-flag rate until nine bans in ten are right.' });
DEMO('ai-evals', { kind: 'baserate', w: ['outputs', 'fail'], t: 'How far can an automatic judge be trusted?', ask: 'Set how often outputs really fail, then the judge’s catch rate and its false-alarm rate. Read the share of flags that are false alarms before anyone is asked to review every flag.' });
DEMO('craft-security-review-of-generated-code', { kind: 'baserate', w: ['changes', 'carry a vulnerability'], t: 'What a scanner’s alerts are worth', ask: 'Set 1% of changes with a real vulnerability and a scanner that flags 5% of clean ones by mistake. Most alerts are false, which is how real ones get waved through: count what a reviewer reads to find one.' });

// State sent to every client, every tick.
DEMO('server-state-sync', { kind: 'tick', ask: 'Raise the update rate from 30 to 60 and read the cost. Then get the same amount back by sending fewer bytes per player: what could be sent less often, or only when it changes?' });
DEMO('server-bandwidth-and-interest-management', { kind: 'tick', t: 'Why not send everyone everything?', ask: 'Set 100 players and read what each client is sent. Then set 20, the number a player can actually see nearby: interest management sends only those, so each client’s stream falls five times.' });
DEMO('server-realtime-protocol', { kind: 'tick', t: 'Bytes per update, times everything', ask: 'Halve the bytes per player per update and read both bars. Quantised positions and delta encoding earn their complexity only because this number is multiplied by players and by updates a second.' });
DEMO('realtime-connection-tier-at-scale', { kind: 'tick', t: 'Fan-out: one message, many deliveries', ask: 'Treat the match as one chat room or world channel with 100 members: every update is delivered to all of them. A tier holding 100,000 sockets carries a thousand such channels, so read the server total and decide what a gateway should batch or drop.' });

// Rollback.
DEMO('server-rollback-netcode', { kind: 'rollback', ask: 'Set a 150 ms round trip. Add input delay one frame at a time until nothing is rewound, then decide how much of that delay a player would accept: rollback is the trade between the two bars.' });

// Players, servers, a bill.
DEMO('server-scaling', { kind: 'capacity', ask: 'Set your launch-day peak and what one server holds. Then double what one server holds and read the bill: that difference is what a week of optimisation is worth every month.' });
DEMO('server-load-testing-and-capacity', { kind: 'capacity', t: 'The number a load test has to find', ask: 'How many players one server holds is a guess until a load test measures it. Halve it and read the bill: that is the cost of having guessed wrong on launch day.' });
DEMO('server-world-partitioning', { kind: 'capacity', t: 'How many shards is that?', ask: 'Treat one server as one shard or zone. Set the peak and the cap, and read how many separate worlds your players are split across: can friends still find each other?' });

// Availability.
DEMO('infra-monitoring', { kind: 'uptime', ask: 'Set 99.9% and four services in a row. The request gets less than the 99.9% each service promised: decide which dependency the game can run without, and alert on the request, not on each box.' });
DEMO('lead-incidents', { kind: 'uptime', t: 'How much failure has the team agreed to?', ask: 'Pick the availability your game promises and read the downtime a month it allows. An incident that stays inside that is inside the plan: the review is about learning, not about blame.' });
DEMO('server-liveops', { kind: 'uptime', t: 'How long may maintenance take?', ask: 'Set 99.9% and read the monthly allowance. One 45-minute maintenance window uses all of it: either the target is honest about maintenance, or updates have to happen without downtime.' });

// A cache.
DEMO('backend-caching-redis', { kind: 'cache', ask: 'Raise the hit rate from 80% to 95% and read the load on the database, not only the average. Then drop it to 0%, a cold start or a flushed cache: can the database take every read at once?' });

// Slow calls.
DEMO('backend-latency-and-query-optimisation', { kind: 'tail', ask: 'With 1% of calls slow and 20 calls per request, nearly one request in five is slow. Halve the calls, then halve the slow rate instead: which is cheaper to do in your service?' });
DEMO('backend-observability', { kind: 'tail', t: 'Why the average hides it', ask: 'With 1% of calls slow the average barely moves, yet at 50 calls per request four page loads in ten feel it. This is why a dashboard shows the 99th percentile and not the mean.' });

// Scope against capacity.
DEMO('scope-control', { kind: 'scope', ask: 'Enter your own project. If it is over, cut until it fits, and notice that people and weeks are much harder sliders to move in real life than the feature count.' });
DEMO('pm-scoping-cuts', { kind: 'scope', t: 'How long is the cut list?', ask: 'Lower the share of time that goes to features until it matches what your last month really looked like. Read how many features come out, and write that many on the cut list now, in order.' });
DEMO('vertical-slice-mvp', { kind: 'scope', t: 'What fits in the slice?', ask: 'Set the weeks to your slice deadline and the features to everything you wanted in it. A slice is deep, not wide: cut features until it fits with room to spare, instead of thinning every feature.' });
DEMO('polish-when', { kind: 'scope', t: 'Is there time left to polish?', ask: 'Make it fit, then read the spare person-weeks. That spare is all the polish time there is: decide which three moments get it before the last week decides for you.' });

// Work in progress. `w` names the work.
DEMO('pm-agile-gamedev', { kind: 'wip', w: ['tasks'], ask: 'Enter how many tasks are in progress on your board today and how many were finished last week. Then halve the first number: a work-in-progress limit is this slider.' });
DEMO('lead-code-review', { kind: 'wip', w: ['pull requests', 'open'], t: 'Why reviews feel slow', ask: 'Enter the pull requests open now and how many merge in a week, and read the average wait. Then halve what is open: reviewing before starting something new shortens the wait without anyone reviewing faster.' });
DEMO('pm-qa-release', { kind: 'wip', w: ['bugs', 'open'], t: 'How long does a bug wait to be closed?', ask: 'Enter the open bug count and how many are closed in a week. That is how long a bug found today waits on average; before a release the count has to fall faster than new ones arrive.' });

// Content made against content played.
DEMO('live-operations', { kind: 'treadmill', ask: 'Enter what an hour of new content costs your team and how much a keen player plays. If they finish it many times faster than you make it, list what in your game is worth replaying.' });
DEMO('pm-liveops-cadence', { kind: 'treadmill', t: 'What cadence can the team actually hold?', ask: 'Set the team and the cost of an hour of content. Read the hours made in a week and multiply by your release interval: that is the size of update you can promise without crunch.' });
DEMO('quests-and-events', { kind: 'treadmill', t: 'Hand-made quests against hours played', ask: 'Set what one hour of hand-made quests costs. If players finish them faster than they are written, decide which quests are hand-made and which come from structures that repeat.' });

// Power creep.
DEMO('power-creep-and-content-growth', { kind: 'creep', ask: 'With +8% a release, four releases a year and three years, launch content ends up worth well under half of the newest. Lower the growth until old items still matter, and read how small the step has to be.' });

// Tokens and a bill.
DEMO('models-tokens-context', { kind: 'tokens', t: 'Words, tokens and what fills the context', ask: 'Set 20,000 words, a long design document pasted into every call. Read the tokens in each call: that is context spent before the question is asked.' });
DEMO('craft-ai-cost-latency-budget', { kind: 'tokens', ask: 'Enter the prompt size and the calls a day your feature would make at launch. If the monthly figure surprises you, shrink the prompt before you negotiate the price.' });
DEMO('generative-characters', { kind: 'tokens', t: 'What a talking character costs', ask: 'A character that remembers needs its backstory and the conversation so far in every call. Set 5,000 words and one call for each line a player speaks: the bill grows with how much players like talking to it.' });
DEMO('models-context-engineering', { kind: 'tokens', t: 'Everything in the context is paid for on every call', ask: 'Set the words to everything you send each time: instructions, examples, documents. Then drop one size. What could be fetched only when it is needed?' });

// A follow camera.
DEMO('camera-design', { kind: 'camera', ask: 'With no look-ahead the camera trails unless it snaps to the character, so less than half the screen is ahead. Lower the gap the camera closes each frame to make it worse, then add look-ahead until two thirds of the screen is ahead.' });

// Timing windows.
DEMO('rhythm-and-music-timed-design', { kind: 'window', ask: 'Set 180 BPM with a ±50 ms window, then 90 BPM with the same window. Measured against the beat, the same window is twice as forgiving at the faster tempo: decide whether your windows are fixed in milliseconds or scale with the song.' });
DEMO('craft-audio-clock-and-input-latency', { kind: 'window', t: 'What uncorrected delay does to a timing window', ask: 'Set a ±40 ms window and add delay 5 ms at a time. At 45 ms a perfectly timed press misses every time: that is why a calibration screen comes before the first song.' });
DEMO('audio-implementation', { kind: 'window', t: 'Is the sound late?', ask: 'Leave the tempo and add 100 ms of delay, the order of what wireless headphones can add. A sound that confirms a hit now arrives after the player has moved on: decide which sounds must be scheduled ahead on the audio clock.' });

// An intensity curve.
DEMO('pacing', { kind: 'pacing', ask: 'Flatten every beat to 5 and read the sentence. Then build a curve with one clear peak and a quiet beat just before it: contrast is what the player feels, not the level.' });
DEMO('level-structure', { kind: 'pacing', t: 'Six beats of one level', ask: 'Call the six beats teach, test, twist, combine, master and rest, and set how intense each is in your level. Where is the peak, and is there a rest after it?' });
DEMO('narrative-pacing', { kind: 'pacing', t: 'Story beats on the same curve', ask: 'Set the beats to the intensity of your story’s scenes, in order. Then compare with where the hardest play sits: do the story peak and the gameplay peak land on the same beat, and did you choose that?' });
DEMO('adaptive-and-director-ai', { kind: 'pacing', t: 'What a director is trying to draw', ask: 'A director watches the player and decides when to send pressure and when to hold it back. Draw the curve you would want it to produce, with at least two drops: those are the moments it must deliberately do nothing.' });

// A branching story.
DEMO('narrative-agency', { kind: 'branch', ask: 'Set 3 options and 6 choices. Read how many scenes are written for each one a player sees, then decide which choices must change the path and which can change how a scene plays instead.' });

// Contrast.
DEMO('accessibility', { kind: 'contrast', ask: 'Bring the two sliders together until the sentence says the text fails, and note whether you could still read the small line at that point. Your own eyes on a good screen are the generous case.' });
DEMO('visual-language', { kind: 'contrast', t: 'Value contrast carries the read', ask: 'Set the background to mid grey (50%) and look for light text that passes: even white does not reach 4.5 to 1, and only near-black does. Decide which grounds in your game carry text, and keep them clearly dark or clearly light.' });

// One step a frame.
DEMO('craft-game-loop-timestep', { kind: 'timestep', ask: 'Read the three heights. A ledge placed just under the 144-frame peak cannot be reached at 30 frames a second: decide the step your simulation runs at, and keep it the same on every machine.' });
DEMO('server-determinism', { kind: 'timestep', t: 'Same input, different answers', ask: 'Two machines get the same jump input and step at different rates. Read how far apart the peaks are: lockstep and replays need every machine to take the same steps in the same order, not just the same inputs.' });

// Tunnelling.
DEMO('craft-physics-and-collision', { kind: 'tunnel', ask: 'A bullet at 300 m/s moves 5 m a step at 60 steps a second, straight past a 0.2 m wall. Lower the speed until the wall is always caught. More steps a second raise that limit only in proportion; a swept test removes it.' });

// Texture memory.
DEMO('craft-memory-loading-and-streaming', { kind: 'texmem', ask: 'Sixty 2048 textures, uncompressed, need over a gigabyte. Set 8 bits a pixel, then drop one size: which textures does the player never see closely enough to need the larger one?' });

// Pixels shaded a second.
DEMO('craft-gpu-rendering-cost', { kind: 'overdraw', ask: 'Raise the times each pixel is drawn from 2.5 to 5, the difference a few layers of smoke can make. Then put it back and go up one resolution instead: which costs more?' });
DEMO('craft-mobile-gpu-and-thermals', { kind: 'overdraw', t: 'Pixels shaded a second become heat', ask: 'Set 60 frames a second, then 30. On a phone the pixels shaded each second become heat, and heat becomes a slower chip: halving the frame rate halves this number.' });

// A share of the frame. `w` names what is updated.
DEMO('ai-budgets-and-debugging', { kind: 'budget', w: ['agents'], ask: 'Set the agents in your busiest scene and what one update costs. If it is over, read the two ways out: update each agent less often, or make one update cheaper. Which would players notice?' });
DEMO('craft-performance', { kind: 'budget', w: ['objects'], t: 'A budget before an optimisation', ask: 'Give one system a share of the frame and see whether it fits. Without a number like this, “it feels slow” has no owner and “fast enough” has no end.' });
DEMO('craft-cpu-cache-and-data-layout', { kind: 'budget', w: ['entities'], t: 'Cost per entity, times entities', ask: 'Set 5,000 entities. At 1 µs each they use 5 ms; at 20 µs, 100 ms. What one update costs is often decided by where its data sits in memory, which is why layout is measured before code is tuned.' });

// Allocation and the collector.
DEMO('craft-memory-and-gc', { kind: 'gc', ask: 'Set what your game allocates in an ordinary frame (a profiler shows it) and read how often the room fills. Then bring the allocation to zero: that is what pooling buys.' });

// Page weight.
DEMO('web-performance-basics', { kind: 'weight', ask: 'Set the weight of your page as it is served and read it on the slowest connection, not on yours. Decide how long is acceptable there, and find the weight that meets it.' });

// Patch delivery.
DEMO('infra-cdn-assets', { kind: 'cdn', ask: 'Set your patch size and player count and read the bill for one patch. A format that lets you send only what changed is worth the difference between the two bars on every release.' });
DEMO('release-and-updates', { kind: 'cdn', t: 'What a day-one patch costs everyone', ask: 'Set the size of your day-one patch and the players at launch. Each of them waits for all of it before playing: read the terabytes, then decide what has to be in the first download instead.' });

// Matchmaking.
DEMO('server-matchmaking', { kind: 'queue', ask: 'Set the players searching at your quietest hour, not your peak. Read the wait, then widen the skill band until it is bearable: that is the match quality your population can afford at that hour.' });

// Sampling temperature.
DEMO('models-sampling', { kind: 'temp', ask: 'The scores are made up; the arithmetic is the real one. Set 0.2 and write it ten times, then 2.0. Decide which you would want for a quest text, and which for a name generator.' });

// Text expansion.
DEMO('localization-and-culture', { kind: 'locale', ask: 'Step through the languages and count how many do not fit a button drawn for English. Then decide: does the button grow with its text, or does the translator get a character limit and a screenshot?' });

// Path search.
DEMO('navigation-and-pathfinding', { kind: 'path', ask: 'Read how many cells the search looked at to reach B. Then press cells to wall B off completely and read it again: a search that fails cannot stop early, which is why games bound it, cache it or check reachability first.' });

// A puzzle with one rule.
DEMO('puzzle-design', { kind: 'lights', ask: 'Solve it, then start again and solve it in two presses. Nothing got easier except what you know: a puzzle is a rule the player learns, and the solution is the proof that they learned it.' });
DEMO('puzzles-in-action-spaces', { kind: 'lights', t: 'The same puzzle, with a clock on it', ask: 'Solve it once slowly. Then start again and solve it in under two seconds. In an action game the puzzle is the same rule, and the time to read it is what the fight takes away.' });

// Seeds.
DEMO('procedural-content', { kind: 'seed', ask: 'Move the seed and read ten rows. Can you tell them apart afterwards? Then raise the kinds of room: variety a player notices comes from what the generator has to work with, not from the seed.' });

// Repeated sounds.
DEMO('audio-and-music', { kind: 'tone', ask: 'Play five identical hits, then set 6% and play again. The fix for a sound that repeats is variation on every play, and it is cheapest to build in before the sound has been heard a hundred times.' });

// A win rate and its sample size, as a test of a hypothesis.
DEMO('hypothesis-driven-design', { kind: 'sample', t: 'Could this result have come out the other way?', ask: 'Before a test, write down the number that would prove you wrong. Then set a true rate of 52% and 300 games and measure: twenty honest readings cannot tell 52% from 50% at that size, so the test could not have settled it.' });

// ---- The player, the experience, the core ----
DEMO('who-is-the-player', { kind: 'funnel', w: ['people'], t: 'Every “and” narrows who you mean', ask: 'Treat each step as one thing you know about your player: plays on a phone, has ten minutes, knows the genre, wants to relax. Set the share of people each is true of. The number left is small, and that is the point: design for them, not for “gamers”.' });
DEMO('player-motivation', { kind: 'profile', w: ['competence', 'autonomy', 'relatedness'], t: 'Which need does your game feed?', ask: 'Score how strongly your game feeds each need as it plays today. Then name the mechanic behind your lowest score: if you cannot, that need is not being fed at all.' });
DEMO('fantasy', { kind: 'loop', t: 'How much of a session is the fantasy?', ask: 'Treat the waiting as everything that is not the fantasy: menus, travel, inventory. If the fantasy is “master swordsman”, how many minutes of a session is the player actually fencing?' });
DEMO('return-and-quit', { kind: 'funnel', w: ['players'], t: 'Day after day', ask: 'Treat each step as one day and the pass rate as the share who come back the next day. Set 7 steps, then 20. Retention is this curve; the cause of each loss is something the game did, or failed to do, on that day.' });
DEMO('finding-an-idea', { kind: 'scope', t: 'Does the idea fit the people you have?', ask: 'Before falling for an idea, size it: the features it cannot ship without, and the people and weeks you really have. An idea that only fits a studio you are not is a different idea.' });
DEMO('core-experience', { kind: 'pacing', t: 'How should it feel, beat by beat?', ask: 'Write your core experience sentence, then draw how intense one session should feel across six beats. If you cannot draw it, the sentence is not yet about how it feels.' });
DEMO('fun-dimensions', { kind: 'profile', w: ['mastery', 'discovery', 'tension', 'creativity', 'competition', 'storytelling'], t: 'Untangle the bundle', ask: 'These are six of the nineteen dimensions below. Score what a player of your game is enjoying in an ordinary session, and read the top two: “fun” in your game means those, and the features that serve neither are candidates to cut.' });
DEMO('goals-horizons', { kind: 'horizons', ask: 'Set the three distances for your game and the length of a real session. If no medium goal completes inside a session, or the long one is dozens of sessions away, say what keeps it in the player’s view.' });
DEMO('mastery-discovery-expression', { kind: 'profile', w: ['mastery', 'discovery', 'expression'], t: 'Which engines are running?', ask: 'Score what your game gives a player in their twentieth hour, not their first. The topic says most great games run on at least two of the three: which two are yours?' });
DEMO('social-experience', { kind: 'pairs', w: ['players'], t: 'Who matters to whom?', ask: 'Set the size of the group your game puts together. Each pair is a relationship the design can feed or ignore: which pairs does your game give a reason to notice each other?' });
DEMO('feature-vs-experience', { kind: 'scope', t: 'A feature list is not an experience', ask: 'Enter the feature list as it stands. When it does not fit, do not cut by size: cut what no player would mention when describing how the game feels.' });
DEMO('design-pillars', { kind: 'profile', w: ['pillar one', 'pillar two', 'pillar three', 'everything else'], t: 'Where does the effort go?', ask: 'Score how much of last month’s work served each pillar, and how much served none. If “everything else” comes out strongest, the pillars are not deciding anything.' });
DEMO('skill-and-mastery', { kind: 'loop', t: 'Practice is repetition: how many reps?', ask: 'Treat one loop as one attempt at the thing the player is getting better at. Read how many attempts a session holds, and how much of each is waiting to try again: that count is how fast a player can improve.' });
DEMO('time-and-turns', { kind: 'loop', t: 'Whose turn is it?', ask: 'Treat one loop as one full round and the waiting as the other players’ turns. With four players a round is 75% waiting: set that, and decide what a player has to think about while it is not their turn.' });
DEMO('genre-hybrids', { kind: 'pairs', w: ['mechanics'], t: 'Does each loop need the other?', ask: 'Count the main mechanics of both genres together. A hybrid lives in the pairs that cross the join: for each one, say what the first gives the second. A pair with no answer is where the two games are only glued.' });
DEMO('knowledge-as-progression', { kind: 'lights', t: 'Nothing unlocks but what you know', ask: 'Solve it, then start again. The second time takes two presses and nothing in the game changed: the progress is in your head. What in your game can a player do faster only because they understand it?' });
DEMO('spatial-composition', { kind: 'path', t: 'Routes the player reads with their feet', ask: 'Clear the walls, then build a room with two routes from A to B, one of them longer. The search finds the short one; a player takes the one they can see. Which of your routes does the first sightline show?' });

// ---- Narrative, presentation, product ----
DEMO('premise-and-world', { kind: 'pairs', w: ['characters'], t: 'Who cares about whom?', ask: 'Set the number of named characters. Each pair is a relationship the player may ask about: a cast is finished when the pairs that matter have an answer, not when every character has a biography.' });
DEMO('ludonarrative-alignment', { kind: 'gap', w: ['How much the story says the hero values mercy', 'How much the rules reward mercy', 'Players believe what they do, so where the two disagree the story loses.'], t: 'Does the doing say what the story says?', ask: 'Replace “mercy” with the value your story claims, and score how much the rules pay the player for acting on it. Change the rule or change the story until the two agree.' });
DEMO('environmental-storytelling', { kind: 'funnel', w: ['players'], t: 'From a detail to a story', ask: 'Treat the steps as what one detail needs: the player enters the room, looks that way, notices it, connects it to another. Set honest shares. Whatever the story cannot lose, the space has to say more than once.' });
DEMO('worldbuilding-method', { kind: 'combos', w: ['factions', 'places', 'conflicts', 'situations', 'parts of the world'], t: 'A world built as systems multiplies', ask: 'Set how many factions, places and kinds of conflict the player can actually reach. Then add one to the shortest list instead of a page to the document: a world is finished when the player can predict it.' });
DEMO('pixel-art-direction', { kind: 'combos', w: ['characters', 'animations', 'frames', 'drawings', 'choices'], t: 'How many drawings is that?', ask: 'Set your cast, the animations each character needs and the frames in each animation. That is the number of drawings at your chosen resolution: cut frames or animations before you commit to a size you cannot finish.' });
DEMO('audience-and-positioning', { kind: 'hick', t: 'One game among a thousand', ask: 'Find the word among 32 options, then among 4. A store is the first case: your one sentence is what makes yours the word the player was already looking for.' });
DEMO('learning-from-success', { kind: 'baserate', w: ['games', 'became hits'], t: 'Did the feature make the hit?', ask: 'Read the check as “has the feature you want to copy”. Say 2% of games became hits, 90% of those have the feature, and so do 10% of the rest. More than four games in five with the feature were not hits: take the hit apart, do not count its features.' });
DEMO('pitching-and-stakeholders', { kind: 'funnel', w: ['pitches'], t: 'Every approver is a step', ask: 'Set the steps to the people who must say yes, and the pass rate to how often each does. Then remove one step by getting two of them into the same room: a pitch is a decision request, so shorten the path to the decision.' });

// ---- Working with AI ----
DEMO('ai-roles', { kind: 'profile', w: ['brainstormer', 'critic', 'systems designer', 'playtest analyst', 'devil’s advocate'], t: 'Which roles do you actually cast?', ask: 'These are five of the nine roles. Score how often you cast the AI in each. If “brainstormer” towers over the rest you are asking for ideas: move one request this week to the role you score lowest.' });
DEMO('prompting-framework', { kind: 'cycles', t: 'A prompt is tuned in tries', ask: 'Set how long one round of prompt and check takes you, and the time you have. A fuller prompt costs minutes once and saves whole rounds: count the rounds you get either way.' });
DEMO('ai-failure-modes', { kind: 'temp', t: 'Why the first answer is generic', ask: 'Set a low temperature and write it ten times: the likeliest word, every time. Generic design is this at the scale of a whole design. The detector is to ask what a thousand other teams would also have been given.' });
DEMO('responsibility-matrix', { kind: 'gap', w: ['How much of this task the model does', 'How much of its output a person checks before it ships', 'Whatever is produced and not checked is owned by nobody: decide the owner before the work starts.'], t: 'Who owns what the model made?', ask: 'Take one task from this week and score both. A high first score is fine; a high first score beside a low second one is the cell of the matrix nobody filled in.' });
DEMO('ai-for-playtest-analysis', { kind: 'baserate', w: ['comments', 'point at a real problem'], t: 'What is a flagged comment worth?', ask: 'Set how many playtest comments point at a real problem, and how well the tagging catches them. Read the false alarms: the model finds the pattern, and a person still opens what it flags and makes the call.' });
DEMO('ai-generative-assets', { kind: 'risk', t: 'An asset with no recorded origin', ask: 'Enter the chance that one generated asset turns out to have unclear rights, and the days to find and replace it after launch. Then the days it takes to record each asset’s origin as it is made.' });
DEMO('ai-disclosure-policy', { kind: 'combos', w: ['stores', 'kinds of generated content', 'regions', 'answers', 'things to track'], t: 'How many answers have to stay true?', ask: 'Set the stores you ship on, the kinds of generated content you use and the regions you sell in. Each combination is an answer on a form that has to stay true while the rules move: who owns that list?' });

// ---- In-game AI ----
DEMO('ingame-ai-purpose', { kind: 'telegraph', t: 'An opponent is there to be read', ask: 'Dodge at 400 ms, then at 100. The second enemy is quicker by every measure and worse at its job: the AI exists to produce the experience, and here that is a hit you could have seen coming.' });
DEMO('choosing-ai-technique', { kind: 'breakeven', w: ['behaviours', 'a state machine', 'a behaviour tree'], t: 'When does the heavier technique pay?', ask: 'Enter what each technique costs to set up and to add one more behaviour to. Read the number of behaviours at which the heavier one pays for itself, then count how many your enemy really needs.' });
DEMO('perception-and-awareness', { kind: 'sight', ask: 'Widen the cone to 360° and the guard reads the world directly: nothing can be sneaked past it. Narrow it and add a reaction delay until a fast player can cross its view unseen. That gap is the stealth game.' });
DEMO('allies-and-companions', { kind: 'repeat', ask: 'Set the lines your companion has and how often it speaks, over the length of your game. If each line is heard dozens of times, the companion stops being a character: decide which lever you can afford.' });
DEMO('learning-based-ai', { kind: 'breakeven', w: ['behaviours', 'authoring by hand', 'training a policy'], t: 'Shipping a learned policy is a different sport', ask: 'Training costs a great deal before the first behaviour exists, and each retraining costs again. Enter both honestly, with the days to find out why it did something odd: how many behaviours until it pays?' });
DEMO('scripted-vs-simulated', { kind: 'breakeven', w: ['moments', 'scripting each one', 'building a simulation'], t: 'Author it, fake it, or simulate it?', ask: 'Enter the hours to script one memorable moment and the hours to build a simulation that could produce it. Read where the simulation pays for itself: below that number, author it or fake it.' });

// ---- Studio ----
DEMO('design-documents', { kind: 'busfactor', ask: 'Set your team and how much of the design each person holds in their head. The share known by one person is what a document is for: write that, for the reader who needs it, and nothing else.' });
DEMO('quality-and-build-health', { kind: 'busy', w: ['bugs'], t: 'When the fix queue runs hot', ask: 'Set the bugs found a week against the bugs the team can fix. Near 100% busy, a bug that blocks testing waits behind everything else: triage is choosing which ones jump the queue.' });
DEMO('design-critique-and-feedback', { kind: 'cycles', t: 'How many rounds of critique fit?', ask: 'Set the loop to the time from showing a design to showing it again with the feedback used. Count the rounds before the milestone: feedback a designer can act on is what shortens the loop.' });

// ---- Backend ----
DEMO('backend-layering', { kind: 'pairs', w: ['modules'], t: 'If anything may call anything', ask: 'Set the number of modules. Without a rule about direction, every pair is a possible dependency to understand before a change. Count how many are left when calls may only point inward.' });
DEMO('backend-di-modes', { kind: 'breakeven', w: ['services', 'wiring by hand', 'generated wiring'], t: 'When does generated wiring pay?', ask: 'Enter the hours to set up generated wiring, and the hours each way when a service is added or its dependencies change. Read the number of services at which the generator pays for itself.' });
DEMO('backend-api-protocol', { kind: 'tick', t: 'What the wire format costs', ask: 'Read bytes per update as the size of one message. Halve it, as a binary schema can against JSON for the same fields, and read both bars. Then ask who your client is: a browser you do not control changes the bet.' });
DEMO('backend-request-context', { kind: 'tail', t: 'One deadline for the whole request', ask: 'A request that waits for 20 calls is as slow as its slowest. The context carries one deadline to all of them: read how many requests meet a slow call, then decide what each call does once the deadline has passed.' });
DEMO('backend-errors', { kind: 'baserate', w: ['log lines', 'need someone to act'], t: 'When everything is logged as an error', ask: 'Read the check as “logged at error level”. Set 1% of lines needing action and 10% of the rest logged as errors anyway. Nine alerts in ten are noise, so the level carries no information.' });
DEMO('backend-data-access', { kind: 'busy', w: ['queries', 'a second'], t: 'A connection pool near its limit', ask: 'At the defaults the pool is 90% busy and each query takes about ten times its own length to get through. That is why one slow query hurts every other one: find yours before adding connections.' });
DEMO('backend-migrations-config', { kind: 'risk', t: 'What a migration that fails costs', ask: 'Enter the chance a schema change goes wrong in production and the days of cleanup if it does. Then the days to rehearse it on a copy first: schema changes ship separately from code so that this rehearsal is possible.' });
DEMO('backend-testing', { kind: 'funnel', w: ['bugs'], t: 'What slips through each tier', ask: 'Here getting through is bad: it is a bug passing a test tier. Set 3 steps, one per tier, and a share of 20% that each tier misses. Eight bugs in a thousand reach players: which tier is cheapest to tighten?' });
DEMO('backend-go-idioms', { kind: 'tail', t: 'One goroutine that never returns', ask: 'Read “slow” as “never returns”. If one call in a thousand hangs (0.1%) and a request fans out to 50, about one request in twenty hangs with it, unless every call takes a context with a deadline.' });

// ---- Infrastructure ----
DEMO('infra-containers', { kind: 'breakeven', w: ['machines', 'setting each up by hand', 'one pinned image'], t: 'When does the image pay for itself?', ask: 'Enter the hours to set a toolchain up by hand on one machine, and the hours to build and maintain one image. Count developer machines and CI runners together, and read where the image pays.' });
DEMO('infra-deploy-models', { kind: 'capacity', t: 'What the workload holds decides the bill', ask: 'Set the peak and what one server holds, and read the bill “if they all run all day”. A model that adds and removes servers with the load pays for the average instead: how far is your average from your peak?' });
DEMO('infra-artifacts-provenance', { kind: 'funnel', w: ['builds'], t: 'Can you say which build this is?', ask: 'Treat each step as one fact recorded by hand: commit, branch, configuration, toolchain, date. Set 5 steps at 95% and read how many builds have all five right. Stamped in by the build itself, each is 100%.' });
DEMO('infra-secrets', { kind: 'risk', t: 'What a leaked credential costs', ask: 'Enter the chance a credential reaches a repository this year, and the days to rotate everything and clean the history when it does. Then the days to set up a secrets store and a scan before each commit.' });
DEMO('infra-data-stores', { kind: 'uptime', t: 'How long can the database be down?', ask: 'The database is the one service every request needs. Set its availability and read the downtime a month it allows. Then time your last restore rehearsal: if it is longer than that, one failure spends years of the allowance.' });

// ---- Game servers ----
DEMO('server-authority', { kind: 'rollback', t: 'The wait while the truth arrives', ask: 'Read the two bars as the two prices of deciding who is right: a wait on the player’s own button, or a visible correction when a guess was wrong. Set your real round trip and choose the split your game can bear.' });
DEMO('server-stack-choices', { kind: 'breakeven', w: ['months', 'a managed service', 'running it yourself'], t: 'Rent it or run it?', ask: 'Enter what each costs to set up and to run for a month, in hours of your team. Read the month in which running it yourself pays for itself, and keep a seam so that the answer can change later.' });
DEMO('server-transport-and-relays', { kind: 'loss', ask: 'Set 5% loss and a message of 3 packets, then of 1. A transport is a bet about what a lost packet should cost: decide which of your messages may be dropped, and which are worth a stall to get.' });
DEMO('server-framework-landscape', { kind: 'breakeven', w: ['networked features', 'building on a framework', 'building your own netcode'], t: 'Adopt a framework, or build?', ask: 'Enter the hours to learn a framework and the hours to build your own base, then what one networked feature costs on each. The mechanism, not the feature list, is what sets the cost of each feature.' });

// ---- Management and leadership ----
DEMO('pm-postmortems', { kind: 'wip', w: ['action items', 'open'], t: 'Changes nobody finishes', ask: 'Enter the action items still open from past retrospectives and how many get finished in a week. If a new one would wait months, the next retrospective should produce one owned change, not ten.' });
DEMO('lead-role', { kind: 'busy', w: ['decisions'], t: 'When every decision waits for you', ask: 'Set the decisions that reach you each week against the ones you can make well. Near 100% busy the whole team waits on you: each decision others can make without asking takes one out of the arrivals.' });
DEMO('lead-one-on-ones', { kind: 'cycles', t: 'How many chances to hear it in time?', ask: 'Set 13 weeks, and the loop to the working hours between two 1:1s with one person: 40 for weekly, 160 for monthly. Thirteen chances against three: that is how often a problem can reach you before it becomes a resignation.' });
DEMO('lead-conventions', { kind: 'breakeven', w: ['reviews', 'explaining it in each review', 'writing the rule down once'], t: 'When does a written rule pay?', ask: 'Enter what it costs to write one rule down, with its date and its reason, and what it costs each time it is explained in a review instead. Read how soon the written rule pays for itself.' });
DEMO('lead-onboarding', { kind: 'estimate', t: 'When does the first real change ship?', ask: 'Estimate the days until a new hire ships their first real change: with a prepared first task, as it usually goes, and with nobody free to help. The spread is your onboarding: shrink the bad case first.' });
DEMO('lead-saying-no', { kind: 'busy', w: ['requests'], t: 'What a yes displaces', ask: 'Set the requests that arrive a week against what the team can finish. Above 90% busy every yes makes everything else later: name what a new request would displace, and let its owner choose.' });
DEMO('lead-feedback-performance', { kind: 'compound', t: 'Small corrections, early', ask: 'Set +1% a week for a year, then −1%. Feedback given early moves this number while it is small; performance management starts when the curve has already had a year to run.' });
DEMO('lead-conflict-growth', { kind: 'wip', w: ['decisions', 'waiting for you'], t: 'What only you can do', ask: 'Enter what is waiting on you and how much of it you finish in a week. Handing someone a problem a little too hard for them is how the first number falls, and how that person grows.' });
DEMO('lead-junior-skill-formation-with-ai', { kind: 'compound', t: 'Finishing tasks is not the same curve as learning', ask: 'Set the weekly gain of a junior who works each problem through, then set 0% for one who ships the same tasks without understanding them. The output looks the same for months; the gap is in what they can explain cold.' });

// ---- Platforms ----
DEMO('platform-choice', { kind: 'net', ask: 'Enter one platform’s price, its share and what it costs you to get onto it: the port, the kit, the certification. Read the copies needed there alone, then ask whether that audience exists on that platform.' });
DEMO('platform-access', { kind: 'estimate', t: 'A queue, not a download', ask: 'Estimate the days from first contact to a working dev kit on your desk: if every form is right the first time, as it usually goes, and if the entity or the NDA is sent back. Put the expected date in the schedule, not the best case.' });
DEMO('platform-requirements', { kind: 'combos', w: ['platforms', 'input methods', 'interruptions', 'test cases', 'things to list'], t: 'The entry fee, counted', ask: 'Set your platforms, the ways of holding the game (pad, touch, keyboard) and the interruptions each must survive (suspend, controller loss, a full disk). The product is the entry fee: who tests it, and when?' });
DEMO('certification-and-review', { kind: 'funnel', w: ['submissions'], t: 'Passing every requirement at once', ask: 'Set 20 steps, one per requirement on the list, at 97% each. Barely more than half of submissions pass the first time: plan the calendar for a resubmission, and test the list before the platform does.' });
DEMO('ratings-and-disclosures', { kind: 'combos', w: ['regions', 'stores', 'questions', 'answers', 'things to list'], t: 'Every answer has to be true', ask: 'Set the regions you sell in, the stores you ship on and the questions each form asks. Every answer has to be true on release day and stay true after each update: a wrong one blocks the release as hard as a crash.' });
DEMO('ugc-platforms', { kind: 'net', t: 'Control traded for reach', ask: 'Set the store’s share to what a UGC platform keeps, which can be most of the sale, and read what reaches you. Then set the cost of getting on to the minimum: no engine, no servers and no store to build. That is the trade.' });
DEMO('platforms-choosing-an-engine', { kind: 'breakeven', w: ['thousand sales', 'an engine that takes a share of each sale', 'an engine with a fixed fee', 'thousand dollars'], t: 'What the licence costs at success', ask: 'An engine can cost a share of every sale or a fixed amount up front. Enter both for your game and read the number of sales at which the fixed fee wins: the licence matters at success, not at the start.' });

// ---- How models work ----
DEMO('models-attention-long-context', { kind: 'tokens', t: 'A long context is paid for whether it is used or not', ask: 'Set 100,000 words in every call. The window takes it and the bill counts it, and the topic’s point is that the middle of a long context is used worst: what would you fetch only when the question needs it?' });
DEMO('models-hallucination-sycophancy', { kind: 'baserate', w: ['answers', 'are wrong'], t: 'Can a model check a model?', ask: 'Read the check as a second model asked “is this answer right?”. One that agrees too easily catches few: lower the catch rate to 50% and read how many of the wrong answers it flags, and how many pass as checked.' });
DEMO('models-how-models-are-made', { kind: 'breakeven', w: ['thousand calls', 'examples in every prompt', 'fine-tuning once', 'dollars'], t: 'Shape it per call, or once?', ask: 'Shaping a model with examples in the prompt costs tokens on every call; fine-tuning costs once, then less per call. Enter both and read where fine-tuning pays for itself. Each stage of making a model is a trade of this kind.' });
DEMO('models-architecture-choices', { kind: 'tokens', t: 'What a token costs decides what you can run', ask: 'Set the price to a small model’s, then to a large one’s, at the same number of calls. The architecture facts in this topic reach you here first: as a monthly figure that decides which model your feature can afford.' });
DEMO('models-open-and-closed', { kind: 'breakeven', w: ['million tokens', 'a hosted model', 'open weights on your own machines', 'dollars'], t: 'Per token, or per month?', ask: 'A hosted model costs per token and nothing up front; your own machines cost every month, used or not. Enter both and read the volume at which hosting it yourself pays. Below that, open weights buy control, not savings.' });
DEMO('models-prompt-caching', { kind: 'pcache', ask: 'Enter your provider’s price for a cached token and how much of your prompt is the same on every call. Then imagine a timestamp on the first line: the stable part is no longer a prefix, and the saving is gone.' });
DEMO('models-tools-mcp-rag', { kind: 'funnel', w: ['questions'], t: 'Retrieve, read, call, answer', ask: 'Set 4 steps: the right document is retrieved, the right part is read, the tool is called with valid arguments, the result is reported faithfully. At 90% each a third of answers go wrong somewhere: measure each step, not only the last.' });
DEMO('models-reasoning-and-scaling', { kind: 'sample', t: 'Is that benchmark gain real?', ask: 'Read “games” as benchmark questions. One model scores 52% where another scores 50%, on 300 questions: measure twenty times and count how often the order flips. A gap smaller than this spread is not a ranking.' });
DEMO('models-security-and-operations', { kind: 'baserate', w: ['documents', 'carry hidden instructions'], t: 'Why a filter is not the defence', ask: 'Set 1% of documents carrying hidden instructions and a filter that catches 95%. Five in a hundred of them still reach the model: design as if it will obey them, and cap what it is able to do.' });

// ---- Code craft ----
DEMO('craft-ai-orchestrates-tools-compute', { kind: 'funnel', w: ['calculations'], t: 'Arithmetic in the model’s head', ask: 'A model that does a 12-step calculation itself at 98% a step gets about one in five wrong. Set that, then set 100%: the same question with the model choosing the tool and code doing the arithmetic.' });
DEMO('craft-core-values-that-last', { kind: 'compound', t: 'What a habit is worth after two years', ask: 'A value that lasts pays a little every week. Set +0.5% a week for 104 weeks, then −0.5%. Test each of your habits this way: does it still pay when code is cheap to write?' });
DEMO('craft-best-practice-now', { kind: 'breakeven', w: ['changes', 'reviewing large diffs', 'keeping diffs small'], t: 'When does a habit pay?', ask: 'Small diffs cost a little discipline up front and save review time on every change. Enter both and read how soon the habit pays: with an agent writing much of the code, the number of changes only goes up.' });
DEMO('craft-design-patterns', { kind: 'breakeven', w: ['variations', 'a plain branch each time', 'a pattern'], t: 'When does a pattern earn its keep?', ask: 'A pattern costs hours before it handles its first case. Enter that, and what one more variation costs with and without it. Below the crossover the pattern is the problem it was meant to solve.' });
DEMO('craft-clean-code-ai-era', { kind: 'breakeven', w: ['later changes', 'leaving it as it is', 'cleaning it up now'], t: 'Who pays for a tangled module?', ask: 'Enter the hours to clean a module up now, and what each later change costs in a tangled module and in a clear one. The next reader, person or agent, pays the cost of each change every time.' });
DEMO('craft-over-defensive-code', { kind: 'guards', ask: 'Set the layers a value passes through in your code and how many values each one checks again. Read the lines that can never fire, then find the one boundary where the check belongs.' });
DEMO('craft-what-matters-now', { kind: 'amdahl', t: 'What got faster, and what did not', ask: 'Writing code got faster. Set its share of shipping something you understand and can prove works, and read the limit. The three rules of this topic are the part that did not speed up.' });
DEMO('craft-teaching-agents', { kind: 'breakeven', w: ['sessions', 'correcting it each time', 'a rule or a tool that refuses'], t: 'Tell it again, or put it where it holds?', ask: 'Enter what correcting the same mistake costs in each session, and what it costs once to write the rule or build the check that refuses it. A lesson that keeps coming back has not yet been put where it holds.' });
DEMO('craft-tools-that-work-with-ai', { kind: 'cycles', t: 'A check the agent can run is a shorter loop', ask: 'Set the loop to how long it takes to learn whether a change worked. A check the agent can run itself makes that minutes; one that needs a person and an editor makes it hours. Count the tries in a week.' });
DEMO('craft-source-control-for-games', { kind: 'repo', ask: 'Set the size of a typical texture or audio file and how many changed versions your team commits in a week. Read the history after a year, then decide what is locked, what is stored outside it, and what the engine can rebuild.' });
DEMO('craft-gameplay-math', { kind: 'sight', t: 'Is the target in front? One dot product', ask: 'Set the cone to 180° and read the threshold: 0, which is “in front of me”. Set 90° and it is 0.71. One multiply-and-add per axis answers who is facing whom, with no angle ever computed.' });
DEMO('craft-entities-and-scenes', { kind: 'pairs', w: ['kinds of object'], t: 'Why behaviour goes in components', ask: 'Set the kinds of object in your game. If each kind has to know about each other kind, the pairs are the code you write; components let two things interact through what they have, not what they are.' });
DEMO('craft-save-systems', { kind: 'combos', w: ['save formats', 'platforms', 'interruptions', 'cases', 'things to list'], t: 'How many saves must still load?', ask: 'Set the save formats still in players’ hands, your platforms and the ways a write can be cut short (power, crash, full disk). Each combination is a save that must still load: number the format and keep the last good file.' });

// ---- Careers ----
DEMO('careers-transferable-skills', { kind: 'profile', w: ['real-time performance', 'tooling', 'shipping to a hard date', 'systems thinking', 'player research'], t: 'What do you carry out with you?', ask: 'Score yourself on five things this topic says transfer. Lead with your top two, in the words of the industry you are moving to: the skill carries over, the vocabulary does not.' });
DEMO('careers-destinations', { kind: 'risk', t: 'The price of entry, priced', ask: 'Pick one destination and read days as months. Enter the chance the move does not work out and the months you would lose, then the months a small side project in that field would cost: that is the cheap test.' });
DEMO('careers-repositioning', { kind: 'funnel', w: ['applications'], t: 'From an application to an offer', ask: 'Set 5 steps and move the pass rate from 50% to 60%: two and a half times as many offers. Saying what problem you solved, in the reader’s words, is how the share at every step moves at once.' });
DEMO('careers-interviewing-outside-games', { kind: 'cycles', t: 'Rehearsals before the day', ask: 'Set the loop to one full practice round: a question, an answer out loud, a critique. Count the rounds before your interview date: the formats are learnable, and they are learned by repetition.' });
DEMO('careers-ai-tooling-market', { kind: 'breakeven', w: ['uses', 'building it in-house', 'buying a tool'], t: 'When does a tool sell?', ask: 'A tooling company lives where buying beats building. Enter what a customer spends building the thing themselves and what adopting a tool costs them: knowing which side of the crossover a team is on is a skill game-tools people already have.' });
DEMO('careers-the-farmer-answered', { kind: 'risk', t: 'Clear-eyed about the land', ask: 'Read days as months of income. Enter the chance the first seasons do not pay and what that would cost you, then the cost of one season of part-time trial first. The joke has honest answers, and this is how to price them.' });
DEMO('careers-game-coding-interviews', { kind: 'cycles', t: 'Three things to practise, out loud', ask: 'Set the loop to one timed problem solved out loud with nothing to look up. Count how many fit before the interview, then split them three ways: data structures, gameplay math, one system to design.' });
