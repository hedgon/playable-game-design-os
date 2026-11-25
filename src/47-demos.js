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

// Topics whose point is a judgment about one's own project, or that have no demo of their own yet:
// the check kind holds the topic's own warning signs and traps up to the reader's project, so it
// needs no text here. A topic leaves this list when it gets a DEMO() line above.
for (const id of [
  /* player */ 'who-is-the-player', 'player-motivation', 'fantasy', 'return-and-quit', 'finding-an-idea',
  /* experience */ 'core-experience', 'fun-dimensions', 'goals-horizons', 'mastery-discovery-expression', 'social-experience', 'feature-vs-experience', 'design-pillars',
  /* core */ 'skill-and-mastery', 'time-and-turns', 'genre-hybrids',
  /* systems */ 'knowledge-as-progression',
  /* level */ 'spatial-composition',
  /* narrative */ 'premise-and-world', 'ludonarrative-alignment', 'environmental-storytelling', 'worldbuilding-method',
  /* presentation */ 'pixel-art-direction',
  /* product */ 'audience-and-positioning', 'learning-from-success', 'pitching-and-stakeholders',
  /* ai */ 'ai-roles', 'prompting-framework', 'ai-failure-modes', 'responsibility-matrix', 'ai-for-playtest-analysis', 'ai-generative-assets', 'ai-disclosure-policy',
  /* gameai */ 'ingame-ai-purpose', 'choosing-ai-technique', 'perception-and-awareness', 'allies-and-companions', 'learning-based-ai', 'scripted-vs-simulated',
  /* studio */ 'design-documents', 'quality-and-build-health', 'design-critique-and-feedback',
  /* backend */ 'backend-layering', 'backend-di-modes', 'backend-api-protocol', 'backend-request-context', 'backend-errors', 'backend-data-access', 'backend-migrations-config', 'backend-testing', 'backend-go-idioms',
  /* infra */ 'infra-containers', 'infra-deploy-models', 'infra-artifacts-provenance', 'infra-secrets', 'infra-data-stores',
  /* server */ 'server-authority', 'server-stack-choices', 'server-transport-and-relays', 'server-framework-landscape',
  /* management */ 'pm-postmortems',
  /* leadership */ 'lead-role', 'lead-one-on-ones', 'lead-conventions', 'lead-onboarding', 'lead-saying-no', 'lead-feedback-performance', 'lead-conflict-growth', 'lead-junior-skill-formation-with-ai',
  /* platforms */ 'platform-choice', 'platform-access', 'platform-requirements', 'certification-and-review', 'ratings-and-disclosures', 'ugc-platforms', 'platforms-choosing-an-engine',
  /* models */ 'models-attention-long-context', 'models-hallucination-sycophancy', 'models-how-models-are-made', 'models-architecture-choices', 'models-open-and-closed', 'models-prompt-caching', 'models-tools-mcp-rag', 'models-reasoning-and-scaling', 'models-security-and-operations',
  /* craft */ 'craft-ai-orchestrates-tools-compute', 'craft-core-values-that-last', 'craft-best-practice-now', 'craft-design-patterns', 'craft-clean-code-ai-era', 'craft-over-defensive-code', 'craft-what-matters-now', 'craft-teaching-agents', 'craft-tools-that-work-with-ai', 'craft-source-control-for-games', 'craft-gameplay-math', 'craft-entities-and-scenes', 'craft-save-systems',
  /* careers */ 'careers-transferable-skills', 'careers-destinations', 'careers-repositioning', 'careers-interviewing-outside-games', 'careers-ai-tooling-market', 'careers-the-farmer-answered', 'careers-game-coding-interviews',
]) DEMO(id, { kind: 'check' });
