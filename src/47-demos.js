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
DEMO('systemic-design', { kind: 'firegrid', t: 'Two rules that never mention each other', ask: 'With only the first rule on, press Step four times: 10 cells burn, 0 cross the river. Press Reset, switch on Fire burns wood and step four times: 19 burn and 8 are across, because the bridge is wood. Neither rule mentions the other.' });
DEMO('agency-and-emergence', { kind: 'firegrid', t: 'A river that fire should not cross', ask: 'Leave the first rule on, switch on Wind pushes fire two cells east and press Step once: 5 cells burn and 1 is already across the river, with no bridge. No rule is about rivers; the crossing comes from two rules meeting.' });
DEMO('team-and-collaboration', { kind: 'committee', t: 'Who decides when the room splits?', ask: 'Set 9 people and hold the vote a few times with nobody holding the final say: a split with no majority ends the meeting without a decision. Then switch on One person decides and vote again: it never does.' });
DEMO('pm-cross-discipline', { kind: 'taskorder', w: ['handoff'], t: 'What waits on what', ask: 'Press Animation first: it cannot start, because it waits for the art model, and the turn produces nothing. Start over and find an order with no turn lost.' });

// Lists of content, multiplied.
DEMO('content-multiplies', { kind: 'combos', ask: 'Add one enemy type, then take it away and add one arena instead. Which adds more situations, and which costs more to build? The shortest list is where one more piece buys the most.' });
DEMO('encounters-and-enemies', { kind: 'duo', t: 'An enemy is worth what it is paired with', ask: 'Put Rusher in both slots, then press “Next partner for B”: one answer used twice becomes two answers needed at once. Before building enemy number five, check that your pairs differ like this.' });
DEMO('encounter-design', { kind: 'duo', t: 'What two pieces ask of the player', ask: 'Put Rusher in both slots, then press “Next partner for B”: one answer used twice becomes two answers needed at once. An encounter is made of the pairs, not of the pieces.' });

// Hits to kill.
DEMO('items-weapons-abilities', { kind: 'ttk', ask: 'With 100 health, raise the damage from 34 one point at a time. Nothing changes until 50, then a whole hit disappears. A +5 damage upgrade is worth a lot or nothing, depending on where it lands.' });

// A pass rate, compounded. `w` names who goes through the steps.
DEMO('onboarding', { kind: 'tutor', t: 'Taught by text, or by doing', ask: 'Press “Teach by doing”, then press the lit key three times: you finish 3 steps with no mistakes and never read a rule. Then switch it off, set 5 steps and try again from the line of rules.' });
DEMO('launch-and-discoverability', { kind: 'funnel', w: ['people'], t: 'From seeing the game to buying it', ask: 'Treat each step as one stage: the capsule, the page, the trailer, the wishlist, the launch day, the purchase. Even at a generous 90% each, six stages lose almost half, and real stages pass far fewer. Which stage of yours have you measured?' });
DEMO('soft-launch-and-playable-ads', { kind: 'guess', t: 'Your guess against a measurement', ask: 'Keep the guess at 10% and press “Run a soft launch”: the first made-up sample shows 9 of 300 installing, 3%, so your plan counts 700 installs the ad will not deliver. Press again and the sample moves to 2%.' });
DEMO('store-presence', { kind: 'capsule', t: 'Squint at the capsule', ask: 'At 120 px only the logo and character read. Switch off the tagline and screenshot strip and nothing you kept is lost: a capsule that works small has fewer things in it.' });
DEMO('lead-hiring', { kind: 'hiringloop', t: 'Design the loop backwards from the work', ask: 'The loop starts with four stages: two test nothing the job needs and two required skills have no stage. Press Cut the stages that test nothing, then switch on the two missing ones.' });
DEMO('ai-agentic-implementation', { kind: 'agentloop', t: 'An agent with and without a check it can run', ask: 'Switch the check on and press Step until it stops: at the cap of 6 turns the agent runs out before its check passes. Set the cap to 7, press Reset and run again: it now stops because the check passes.' });
DEMO('models-agent-harnesses', { kind: 'agentloop', t: 'The loop, its check and its turn cap', ask: 'Press Step five times with the check off: the loop ends when the agent says it is done, with a mistake still in file B. Then switch the check on and compare how it ends.' });
DEMO('models-what-makes-agents-capable', { kind: 'funnel', w: ['tasks'], t: 'Long tasks fail from small slips', ask: 'Hold the pass rate at 95% and raise the steps from 5 to 20. Long tasks fail from many small slips, not one big one, which is why the length of task an agent can finish is the number to watch.' });
DEMO('verifying-ai-output', { kind: 'claims', ask: 'Mark all six claims and press Ship: nothing invented gets through, but you spend 6 minutes, 3 of them on claims that held. Then mark only the ones you doubt and compare what slips through.' });
DEMO('craft-verification-as-the-job', { kind: 'funnel', w: ['changes'], t: 'How many changes arrive clean?', ask: 'Set 8 steps at 97%: a change passes through that many hands and tools before it ships. More than one in five carries a mistake somewhere, so the check at the end is the job, not a formality.' });

// A loop, repeated for a session.
DEMO('core-loop', { kind: 'loopwalk', ask: 'Press +3 four times: the position goes 3, 6, 9, then the fourth press busts. Now switch Feedback off and press +1: the loop still runs, but the sentence can no longer tell you what changed. Then try Only one move: with nothing to decide it is a click-through.' });
DEMO('challenge-failure-recovery', { kind: 'loop', t: 'What a retry costs', ask: 'Treat one loop as one attempt at a hard section, and the waiting as the death animation, the reload and the walk back. Bring the waiting under 5% and see how many minutes of play come back.' });
DEMO('platform-and-session', { kind: 'loop', t: 'How many loops fit a session?', ask: 'Set the session to 5 minutes, about one wait at a bus stop. How many loops fit, and does a loop end somewhere a player can put the phone down?' });
DEMO('backtracking-and-return-trips', { kind: 'loop', t: 'The walk back, added up', ask: 'Treat one loop as one trip out and back, and the waiting as the part that is plain walking through cleared rooms. If the minutes are large, the return trip needs a shortcut, a new threat or a new view.' });

// Three-point estimates.
DEMO('pm-estimation', { kind: 'estimate', ask: 'Enter a task you are about to promise: the good case, the likely one, the bad one. Compare the expected value with the number you would have said out loud.' });
DEMO('planning-and-milestones', { kind: 'estimate', t: 'A milestone date is a spread, not a point', ask: 'Make the bad case three times the likely one, as it can be for work nobody has done before. The expected date moves past the likely one: say which of the two a milestone date is quoting.' });

// Risk as an average cost.
DEMO('pm-risk', { kind: 'rank', t: 'Which risk is retired first?', ask: 'Press the five risks top to bottom as listed, without thinking: only 1 of 5 lands where exposure puts it. Start over and rank them by what you would test first, then compare.' });
DEMO('risk-and-dependencies', { kind: 'taskorder', w: ['loop'], t: 'Test the riskiest assumption first', ask: 'Press Level kit, then Core loop test: the kit came first, and the sentence names it as built on a loop nobody had tested. Start over, test the loop first, and nothing is.' });
DEMO('prototyping', { kind: 'risk', t: 'A prototype is a cheap way to buy an answer', ask: 'Enter the chance your core idea is not fun, and the days you would lose finding that out after full production. Any prototype cheaper than that exposure pays for itself.' });

// Tries before a date.
DEMO('iteration-and-evidence', { kind: 'cycles', ask: 'Set how long one change takes to go from an idea to a player trying it. Then find what would halve it: a faster build, a shorter test, fewer approvals.' });
DEMO('ai-loop', { kind: 'cycles', t: 'The loop got shorter. How many tries is that?', ask: 'Set the loop to what it took before AI help and note the tries, then set what it takes now. The gain only counts if each try still ends in a real check, by a person or a test.' });
DEMO('infra-ci-pipelines', { kind: 'pipeline', t: 'Order the stages of a pipeline', ask: 'Press Shortest first: the same five stages, the same 38 minutes, but a broken change is caught about 11.2 minutes in instead of 27.7. Then move a slow stage back to the front with Move up and watch the number climb.' });

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
DEMO('who-is-the-player', { kind: 'crowd', ask: 'Press Add a fact about the player once: 137 of the 200 made-up people are left. Press it three more times, to all four facts: 12 are left. Each fact alone is true of about half the crowd or more, yet together they leave a small group: that group is the player.' });
DEMO('player-motivation', { kind: 'profile', w: ['competence', 'autonomy', 'relatedness'], t: 'Which need does your game feed?', ask: 'Score how strongly your game feeds each need as it plays today. Then name the mechanic behind your lowest score: if you cannot, that need is not being fed at all.' });
DEMO('fantasy', { kind: 'payoff', ask: 'As a master thief, 7 of the 18 minutes are the fantasy (39%). Switch to nurturing farmer with nothing cut: 5 of 18 (28%). The same session pays a different fantasy; press Cut what does not pay the fantasy and see what a session of only fantasy looks like.' });
DEMO('return-and-quit', { kind: 'leaks', ask: 'Press Fix the biggest leak once: 45 of 100 are still playing on day 7, against 37 with no fix. Switch that off and fix day 7 alone, the same effort: 38. Where the loss happens decides what a fix is worth, and each day has its own cause.' });
DEMO('finding-an-idea', { kind: 'scope', t: 'Does the idea fit the people you have?', ask: 'Before falling for an idea, size it: the features it cannot ship without, and the people and weeks you really have. An idea that only fits a studio you are not is a different idea.' });
DEMO('core-experience', { kind: 'pacing', t: 'How should it feel, beat by beat?', ask: 'Write your core experience sentence, then draw how intense one session should feel across six beats. If you cannot draw it, the sentence is not yet about how it feels.' });
DEMO('fun-dimensions', { kind: 'profile', w: ['mastery', 'discovery', 'tension', 'creativity', 'competition', 'storytelling'], t: 'Untangle the bundle', ask: 'These are six of this topic’s nineteen dimensions. Score what a player of your game is enjoying in an ordinary session, and read the top two: “fun” in your game means those, and the features that serve neither are candidates to cut.' });
DEMO('goals-horizons', { kind: 'horizons', ask: 'Set the three distances for your game and the length of a real session. If no medium goal completes inside a session, or the long one is dozens of sessions away, say what keeps it in the player’s view.' });
DEMO('mastery-discovery-expression', { kind: 'profile', w: ['mastery', 'discovery', 'expression'], t: 'Which engines are running?', ask: 'Score what your game gives a player in their twentieth hour, not their first. The topic says most great games run on at least two of the three: which two are yours?' });
DEMO('social-experience', { kind: 'pairs', w: ['players'], t: 'Who matters to whom?', ask: 'Set the size of the group your game puts together. Each pair is a relationship the design can feed or ignore: which pairs does your game give a reason to notice each other?' });
DEMO('feature-vs-experience', { kind: 'scope', t: 'A feature list is not an experience', ask: 'Enter the feature list as it stands. When it does not fit, do not cut by size: cut what no player would mention when describing how the game feels.' });
DEMO('design-pillars', { kind: 'profile', w: ['pillar one', 'pillar two', 'pillar three', 'everything else'], t: 'Where does the effort go?', ask: 'Score how much of last month’s work served each pillar, and how much served none. If “everything else” comes out strongest, the pillars are not deciding anything.' });
DEMO('skill-and-mastery', { kind: 'skillchain', ask: 'Press Practise: Chain the gaps three times first: 3 reps wasted, because that skill needs the ones beneath it. Then practise the four in order, three reps each, and watch every rep count.' });
DEMO('time-and-turns', { kind: 'clock', ask: 'Turn-based first: Start, then Strike three times and you win before the enemy arrives. Now switch on Real time, press Start and hesitate: the clock steps the enemy closer whether or not you have decided, so the same three strikes now test speed, not judgement.' });
DEMO('genre-hybrids', { kind: 'bridge', ask: 'Run the dungeon twice, then build once: a run still pays 2 ore, so the camp is only a shop. Switch on Building helps the dungeon and build once more: a run now pays 4. The loops need each other only when the bridge runs both ways.' });
DEMO('knowledge-as-progression', { kind: 'lights', t: 'Nothing unlocks but what you know', ask: 'Solve it, then start again. The second time takes two presses and nothing in the game changed: the progress is in your head. What in your game can a player do faster only because they understand it?' });
DEMO('spatial-composition', { kind: 'path', t: 'Routes the player reads with their feet', ask: 'Clear the walls, then build a room with two routes from A to B, one of them longer. The search always takes the short one; this topic’s point is that players follow sightlines and landmarks instead. Stand at A in your own level: which route does the first view offer?' });

// ---- Narrative, presentation, product ----
DEMO('premise-and-world', { kind: 'pairs', w: ['characters'], t: 'Who cares about whom?', ask: 'Set the number of named characters. Each pair is a relationship the player may ask about: a cast is finished when the pairs that matter have an answer, not when every character has a biography.' });
DEMO('ludonarrative-alignment', { kind: 'gap', w: ['How much the story says the hero values mercy', 'How much the rules reward mercy', 'Players believe what they do, so where the two disagree the story loses.'], t: 'Does the doing say what the story says?', ask: 'Replace “mercy” with the value your story claims, and score how much the rules pay the player for acting on it. Change the rule or change the story until the two agree.' });
DEMO('environmental-storytelling', { kind: 'room', t: 'Furnish a room, read its story', ask: 'Keep the bag, the open window and the cold tea, and raise “Objects the player notices” to 3: two clues agree. Then swap the window for the smashed lock and the three clues tell three different stories.' });
DEMO('worldbuilding-method', { kind: 'combos', w: ['factions', 'places', 'conflicts', 'situations', 'entries in the three lists'], t: 'A world built as systems multiplies', ask: 'Set how many factions, places and kinds of conflict the player can actually reach. Then add one to the shortest list instead of a page to the document: a world is finished when the player can predict it.' });
DEMO('pixel-art-direction', { kind: 'sprite', t: 'Draw it at this size', ask: 'Set the grid to 4×4 and press the four corner cells: 4 of 16 cells filled, and a 6-frame walk is 96 cells. Set 12×12 and the same walk is 864: choose a size you can finish.' });
DEMO('audience-and-positioning', { kind: 'hick', t: 'One game among many', ask: 'Find the word among 32 options, then among 4. A store is the first case: your one sentence is what makes yours the word the player was already looking for.' });
DEMO('learning-from-success', { kind: 'baserate', w: ['games', 'became hits'], t: 'Did the feature make the hit?', ask: 'Read the check as “has the feature you want to copy”. Say 2% of games became hits, 90% of those have the feature, and so do 10% of the rest. More than four games in five with the feature were not hits: take the hit apart, do not count its features.' });
DEMO('pitching-and-stakeholders', { kind: 'pitchorder', t: 'Put the pitch in order', ask: 'Press “Move up” on The ask until it is first: in a 12-minute slot it is now heard at minute 0 instead of minute 9, with the same four parts and the same time.' });

// ---- Working with AI ----
DEMO('ai-roles', { kind: 'profile', w: ['brainstormer', 'critic', 'systems designer', 'playtest analyst', 'devil’s advocate'], t: 'Which roles do you actually cast?', ask: 'These are five of the nine roles. Score how often you cast the AI in each. If “brainstormer” towers over the rest you are asking for ideas: move one request this week to the role you score lowest.' });
DEMO('prompting-framework', { kind: 'promptparts', t: 'Build a prompt from its eight parts', ask: 'Switch on all eight parts and press Send: nothing is missing. Then switch one off and press Send again to read what that one part would cost you.' });
DEMO('ai-failure-modes', { kind: 'temp', t: 'Why the first answer is generic', ask: 'Set a low temperature and write it ten times: the likeliest word, every time. Generic design is this at the scale of a whole design. The detector is to ask what a thousand other teams would also have been given.' });
DEMO('responsibility-matrix', { kind: 'gap', w: ['How much of this task the model does', 'How much of its output a person checks before it ships', 'Whatever is produced and not checked is owned by nobody: decide the owner before the work starts.', 'More is checked than the model produces: nothing here is unowned.'], t: 'Who owns what the model made?', ask: 'Take one task from this week and score both. A high first score is fine; a high first score beside a low second one is the cell of the matrix nobody filled in.' });
DEMO('ai-for-playtest-analysis', { kind: 'baserate', w: ['comments', 'point at a real problem'], t: 'What is a flagged comment worth?', ask: 'Set how many playtest comments point at a real problem, and how well the tagging catches them. Read the false alarms: the model finds the pattern, and a person still opens what it flags and makes the call.' });
DEMO('ai-generative-assets', { kind: 'risk', t: 'An asset with no recorded origin', ask: 'Enter the chance that one generated asset turns out to have unclear rights, and the days to find and replace it after launch. Then the days it takes to record each asset’s origin as it is made.' });
DEMO('ai-disclosure-policy', { kind: 'combos', w: ['stores', 'kinds of generated content', 'regions', 'answers', 'entries in the three lists'], t: 'How many answers have to stay true?', ask: 'Set the stores you ship on, the kinds of generated content you use and the regions you sell in. Each combination is an answer on a form that has to stay true while the rules move: who owns that list?' });

// ---- In-game AI ----
DEMO('ingame-ai-purpose', { kind: 'telegraph', t: 'An opponent is there to be read', ask: 'Dodge at 400 ms, then at 100. The second enemy is quicker by every measure and worse at its job: the AI exists to produce the experience, and here that is a hit you could have seen coming.' });
DEMO('choosing-ai-technique', { kind: 'guardduel', ask: 'Leave Noise at 3 and Hurt at 4: the machine investigates while the scorer retreats. Press Count disagreements to see how many of the 1,331 settings split them, in these made-up rules.' });
DEMO('perception-and-awareness', { kind: 'sight', ask: 'Set the cone to 360° and every approach is in view: stealth needs a direction the guard is not looking in. Then raise the reaction delay or shorten the range until a target running straight in arrives before anything reacts. Senses with limits are what give the player something to play against.' });
DEMO('allies-and-companions', { kind: 'repeat', ask: 'Set the lines your companion has and how often it speaks, over the length of your game. If each line is heard dozens of times, the companion stops being a character: decide which lever you can afford.' });
DEMO('learning-based-ai', { kind: 'breakeven', w: ['behaviours', 'authoring by hand', 'training a policy'], t: 'Shipping a learned policy is a different sport', ask: 'Training costs a great deal before the first behaviour exists. Enter that, and the cost of each further behaviour, honestly, with the hours it takes to find out why it did something odd: how many behaviours until it pays?' });
DEMO('scripted-vs-simulated', { kind: 'ladder', ask: 'Leave the moment needing a reaction to now and the choice on Simulate it: it costs 9 times what faking it does. Press Fake it to see the cheapest way that still reads right, then raise the need to see when it stops being enough.' });

// ---- Studio ----
DEMO('design-documents', { kind: 'busfactor', ask: 'Set your team and how much of the design each person holds in their head. The share known by one person is what a document is for: write that, for the reader who needs it, and nothing else.' });
DEMO('quality-and-build-health', { kind: 'busy', w: ['bugs'], t: 'When the fix queue runs hot', ask: 'Set the bugs found a week against the bugs the team can fix. Near 100% busy, a bug that blocks testing waits behind everything else: triage is choosing which ones jump the queue.' });
DEMO('design-critique-and-feedback', { kind: 'choose', w: ['critique'], t: 'Write the note: intent, question, decision', ask: 'Pick the second phrasing at the first point, the first at the second, the second at the third, then start over and pick the opposite each time: each choice says what it does to the owner.' });

// ---- Backend ----
DEMO('backend-layering', { kind: 'layers', t: 'Which way do the imports point?', ask: 'Press Add the next import twice. The use case now imports the SQL store, then the rules do: two imports point outward and a rules test needs a database. Switch both off again with the chips.' });
DEMO('backend-di-modes', { kind: 'risk', w: ['days'], t: 'What a wiring mistake costs in production', ask: 'Set a 30% chance a wiring mistake ships, 10 days lost if it does, and 1 day for a build that rejects a broken graph. Finding out at build time costs less than carrying the risk, which is what generated wiring buys.' });
DEMO('backend-api-protocol', { kind: 'breakeven', w: ['endpoints', 'JSON written by hand', 'a schema with generated code'], t: 'When does a schema pay for itself?', ask: 'A schema and generated code cost hours before the first endpoint exists and save some on every one after. Enter both and read where the schema pays. Then ask who your client is: a browser you do not control changes what each endpoint costs.' });
DEMO('backend-request-context', { kind: 'tail', t: 'One deadline for the whole request', ask: 'A request that waits for 20 calls is as slow as its slowest. The context carries one deadline to all of them: read how many requests meet a slow call, then decide what each call does once the deadline has passed.' });
DEMO('backend-errors', { kind: 'errorchain', t: 'What happens to one error on the way up?', ask: 'Press A row is not found with every layer wrapping: the client gets a not-found it can act on. Then make the use case replace the error with a new message and press it again: the cause is gone and the client gets a 500.' });
DEMO('backend-data-access', { kind: 'busy', w: ['transactions', 'a second'], t: 'One lock that everything waits for', ask: 'Read it as one resource every transaction must take in turn: a hot row, a single writer, a lock. At 90% busy each takes about ten times its own length to get through, which is why a transaction held open across a request slows every other one: scope it to the request.' });
DEMO('backend-migrations-config', { kind: 'deploy', t: 'Schema and code never land together', ask: 'With Add a column, press Swap the order: schema first is safe, code first fails for the minutes between. Then pick Rename a column in one step: both orders fail, so a rename takes three small deploys.' });
DEMO('backend-testing', { kind: 'bugtier', t: 'Which tier catches which bug?', ask: 'Start with unit tests only: 3 of the 4 bugs reach players. Press Add the next tier once and a bad query and a missing config value are caught, for 42 s of made-up run time. Add the third: none reach players, in 12.7 minutes.' });
DEMO('backend-go-idioms', { kind: 'tail', t: 'One goroutine that never returns', ask: 'Read “slow” as “never returns”. If one call in a thousand hangs (0.1%) and a request fans out to 50, about one request in twenty hangs with it, unless every call takes a context with a deadline.' });

// ---- Infrastructure ----
DEMO('infra-containers', { kind: 'combos', w: ['developer machines', 'toolchain versions', 'operating systems', 'distinct setups', 'machines, versions and systems'], t: 'How many setups must agree?', ask: 'Set 4 developer machines, 3 toolchain versions and 2 operating systems: 24 distinct setups that can each behave differently. One pinned image makes all of them the same one.' });
DEMO('infra-deploy-models', { kind: 'capacity', t: 'What the workload holds decides the bill', ask: 'Set the peak and what one server holds, and read the bill “if they all run all day”. A model that adds and removes servers with the load pays for the average instead: how far is your average from your peak?' });
DEMO('infra-artifacts-provenance', { kind: 'funnel', w: ['builds'], t: 'Can you say which build this is?', ask: 'Treat each step as one fact recorded by hand: commit, branch, configuration, toolchain, date. Set 5 steps at 95% and read how many builds have all five right. Stamped in by the build itself, each is 100%.' });
DEMO('infra-secrets', { kind: 'leak', t: 'A key was pushed. What fixes it?', ask: 'Press Push a commit with the key in it, then Rewrite history: the key still works for anyone who cloned first. Press Rotate the key and it stops. Then switch on the scan and push again: it never leaves your machine.' });
DEMO('infra-data-stores', { kind: 'uptime', t: 'How long can the database be down?', ask: 'Set the services in a row to 1: the database is the one every request needs. At 99.9% that allows 43 minutes of downtime a month, so a restore that takes four hours spends more than five months of the allowance in one failure. Time your last restore rehearsal.' });

// ---- Game servers ----
DEMO('server-authority', { kind: 'rollback', t: 'The wait while the truth arrives', ask: 'Read the two bars as the two prices of deciding who is right: a wait on the player’s own button, or a visible correction when a guess was wrong. Set your real round trip and choose the split your game can bear.' });
DEMO('server-stack-choices', { kind: 'breakeven', w: ['months', 'a managed service', 'running it yourself'], t: 'Rent it or run it?', ask: 'Enter what each costs to set up and to run for a month, in hours of your team. Read the month in which running it yourself pays for itself, and keep a seam so that the answer can change later.' });
DEMO('server-transport-and-relays', { kind: 'loss', ask: 'Set 5% loss and a message of 3 packets, then of 1. A transport is a bet about what a lost packet should cost: decide which of your messages may be dropped, and which are worth a stall to get.' });
DEMO('server-framework-landscape', { kind: 'breakeven', w: ['networked features', 'building on a framework', 'building your own netcode'], t: 'Adopt a framework, or build?', ask: 'Enter the hours to learn a framework and the hours to build your own base, then what one networked feature costs on each. The mechanism, not the feature list, is what sets the cost of each feature.' });

// ---- Management and leadership ----
DEMO('pm-postmortems', { kind: 'wip', w: ['action items', 'open'], t: 'Changes nobody finishes', ask: 'Enter the action items still open from past retrospectives and how many get finished in a week. If a new one would wait months, the next retrospective should produce one owned change, not ten.' });
DEMO('lead-role', { kind: 'busy', w: ['decisions'], t: 'When every decision waits for you', ask: 'Set the decisions that reach you each week against the ones you can make well. Near 100% busy the whole team waits on you: each decision others can make without asking takes one out of the arrivals.' });
DEMO('lead-one-on-ones', { kind: 'choose', w: ['feedback'], t: 'Give the feedback so it can be acted on', ask: 'Pick the first phrasing at the first point, the second at the second, the first at the third: that is feedback that is days old, names an event and ends with a step and a date. Then try the others.' });
DEMO('lead-conventions', { kind: 'breakeven', w: ['reviews', 'explaining it in each review', 'writing the rule down once'], t: 'When does a written rule pay?', ask: 'Enter what it costs to write one rule down, with its date and its reason, and what it costs each time it is explained in a review instead. Read how soon the written rule pays for itself.' });
DEMO('lead-onboarding', { kind: 'estimate', t: 'When does the first real change ship?', ask: 'Estimate the days until a new hire ships their first real change: with a prepared first task, as it usually goes, and with nobody free to help. The spread is your onboarding: shrink the bad case first.' });
DEMO('lead-saying-no', { kind: 'busy', w: ['requests'], t: 'What a yes displaces', ask: 'Set the requests that arrive a week against what the team can finish. Above 90% busy every yes makes everything else later: name what a new request would displace, and let its owner choose.' });
DEMO('lead-feedback-performance', { kind: 'compound', t: 'Small corrections, early', ask: 'Set +1% a week for a year, then −1%. Feedback given early moves this number while it is small; performance management starts when the curve has already had a year to run.' });
DEMO('lead-conflict-growth', { kind: 'wip', w: ['decisions', 'waiting for you'], t: 'What only you can do', ask: 'Enter what is waiting on you and how much of it you finish in a week. Handing someone a problem a little too hard for them is how the first number falls, and how that person grows.' });
DEMO('lead-junior-skill-formation-with-ai', { kind: 'compound', t: 'Finishing tasks is not the same curve as learning', ask: 'Set the weekly gain of a junior who works each problem through, then set 0% for one who ships the same tasks without understanding them. The output looks the same for months; the gap is in what they can explain cold.' });

// ---- Platforms ----
DEMO('platform-choice', { kind: 'net', ask: 'Enter one platform’s price, its share and what it costs you to get onto it: the port, the kit, the certification. Read the copies needed there alone, then ask whether that audience exists on that platform.' });
DEMO('platform-access', { kind: 'estimate', t: 'A queue, not a download', ask: 'Estimate the days from first contact to a working dev kit on your desk: if every form is right the first time, as it usually goes, and if the entity or the NDA is sent back. Put the expected date in the schedule, not the best case.' });
DEMO('platform-requirements', { kind: 'suspend', t: 'Suspend the game and see what is left', ask: 'Leave autosave off, press Play a minute 4 times, then Suspend: 4 minutes are lost. Set autosave to 2 minutes, play 3 and suspend: 1 is lost. Switch on Save on suspend and play again: none.' });
DEMO('certification-and-review', { kind: 'funnel', w: ['submissions'], t: 'Passing every requirement at once', ask: 'Set 20 steps, one per requirement on the list, at 97% each. Barely more than half of submissions pass the first time: plan the calendar for a resubmission, and test the list before the platform does.' });
DEMO('ratings-and-disclosures', { kind: 'combos', w: ['regions', 'stores', 'kinds of question', 'answers', 'entries in the three lists'], t: 'Every answer has to be true', ask: 'Set the regions you sell in, the stores you ship on and the kinds of question each form asks (age, data, purchases). Every answer has to be true on release day and stay true after each update: a wrong one blocks the release as hard as a crash.' });
DEMO('ugc-platforms', { kind: 'net', t: 'Control traded for reach', ask: 'Set the store’s share to what a UGC platform keeps, which can be most of the sale, and read what reaches you. Then set the cost of getting on to the minimum: no engine, no servers and no store to build. That is the trade.' });
DEMO('platforms-choosing-an-engine', { kind: 'breakeven', w: ['thousand sales', 'an engine that takes a share of each sale', 'an engine with a fixed fee', 'thousand dollars'], t: 'What the licence costs at success', ask: 'An engine can cost a share of every sale or a fixed amount up front. Enter both for your game and read the number of sales at which the fixed fee wins: the licence matters at success, not at the start.' });

// ---- How models work ----
DEMO('models-attention-long-context', { kind: 'tokens', t: 'A long context is paid for whether it is used or not', ask: 'Set 100,000 words in every call. A large window takes it and the bill counts it, and the topic’s point is that the middle of a long context is used worst: what would you fetch only when the question needs it?' });
DEMO('models-hallucination-sycophancy', { kind: 'claims', t: 'A fluent answer with invented claims in it', ask: 'Press Ship without marking anything: 3 invented claims reach the design document, each as fluent as the true ones. Then mark claims and ship again to see what checking costs.' });
DEMO('models-how-models-are-made', { kind: 'stages', ask: 'Press Next symptom, and for each of the four symptoms choose the stage of making a model that it points to. A wrong choice tells you which stage it is not.' });
DEMO('models-architecture-choices', { kind: 'tokens', t: 'What a token costs decides what you can run', ask: 'Set the price to a small model’s, then to a large one’s, at the same number of calls. The architecture facts in this topic reach you here first: as a monthly figure that decides which model your feature can afford.' });
DEMO('models-open-and-closed', { kind: 'breakeven', w: ['million tokens', 'a hosted model', 'open weights on your own machines', 'dollars'], t: 'Per token, or per month?', ask: 'A hosted model costs per token and nothing up front; your own machines cost every month, used or not. Enter both and read the volume at which hosting it yourself pays. Below that, open weights buy control, not savings.' });
DEMO('models-prompt-caching', { kind: 'pcache', ask: 'Enter your provider’s price for a cached token and how much of your prompt is the same on every call. Then imagine a timestamp on the first line: the stable part is no longer a prefix, and the saving is gone.' });
DEMO('models-tools-mcp-rag', { kind: 'funnel', w: ['questions'], t: 'Retrieve, read, call, answer', ask: 'Set 4 steps: the right document is retrieved, the right part is read, the tool is called with valid arguments, the result is reported faithfully. At 90% each a third of answers go wrong somewhere: measure each step, not only the last.' });
DEMO('models-reasoning-and-scaling', { kind: 'sample', t: 'Is that benchmark gain real?', ask: 'Read “games” as benchmark questions. One model scores 52% where another scores 50%, on 300 questions: measure twenty times and count how often the order flips. A gap smaller than this spread is not a ranking.' });
DEMO('models-security-and-operations', { kind: 'injection', t: 'What a hidden line in a report can reach', ask: 'Press Summarise with all three abilities on: the toy model obeys the hidden line and the save file leaves. Switch off any one ability and press it again to see the file stay.' });

// ---- Code craft ----
DEMO('craft-ai-orchestrates-tools-compute', { kind: 'funnel', w: ['calculations'], t: 'Arithmetic in the model’s head', ask: 'A model that does a 12-step calculation itself at 98% a step gets about one in five wrong. Set that, then set 100%: the same question with the model choosing the tool and code doing the arithmetic.' });
DEMO('craft-core-values-that-last', { kind: 'compound', t: 'What a habit is worth after two years', ask: 'A value that lasts pays a little every week. Set +0.5% a week for 104 weeks, then −0.5%. Test each of your habits this way: does it still pay when code is cheap to write?' });
DEMO('craft-best-practice-now', { kind: 'cycles', t: 'How many changes get through?', ask: 'Read the loop as the hours to get one change reviewed and merged. Set 8 h and 4 weeks: 20 changes. Halve it to 4 h, which is what small diffs are for, and 40 get through.' });
DEMO('craft-design-patterns', { kind: 'invest', w: ['variations', 'a plain branch each time', 'adding the pattern'], t: 'When do you add the pattern?', ask: 'Press Pay the cost now, then A change arrives 12 times: the pattern has cost 32 hours against 36 for a branch each time. Start over, press the change 8 times, then pay: it ends 12 hours behind.' });
DEMO('craft-clean-code-ai-era', { kind: 'invest', w: ['later changes', 'leaving the module tangled', 'cleaning it up now'], t: 'When do you clean the module?', ask: 'Press Pay the cost now, then A change arrives 12 times: cleaning has cost 32 hours against 36 for leaving it. Cleaning after 8 changes ends 12 hours behind. The next reader, person or agent, pays every change.' });
DEMO('craft-over-defensive-code', { kind: 'guards', ask: 'Set the layers a value passes through in your code and how many values each one checks again. Read the lines that can never fire, then find the one boundary where the check belongs.' });
DEMO('craft-what-matters-now', { kind: 'amdahl', t: 'What got faster, and what did not', ask: 'Writing code got faster. Set its share of shipping something you understand and can prove works, and read the limit. The three rules of this topic are the part that did not speed up.' });
DEMO('craft-teaching-agents', { kind: 'invest', w: ['sessions', 'correcting it each time', 'writing the rule or check'], t: 'Tell it again, or put it where it holds?', ask: 'Press Pay the cost now, then A change arrives 12 times: the rule has cost 32 hours against 36 for correcting each time. Wait until session 8 to write it and you end 12 hours behind.' });
DEMO('craft-tools-that-work-with-ai', { kind: 'cycles', t: 'A check the agent can run is a shorter loop', ask: 'Set the loop to how long it takes to learn whether a change worked. A check the agent can run itself makes that minutes; one that needs a person and an editor makes it hours. Count the tries in a week.' });
DEMO('craft-source-control-for-games', { kind: 'repo', ask: 'Set the size of a typical texture or audio file and how many changed versions your team commits in a week. Read the history after a year, then decide what is locked, what is stored outside it, and what the engine can rebuild.' });
DEMO('craft-gameplay-math', { kind: 'sight', t: 'Is the target in front? One dot product', ask: 'Set the cone to 180° and read the threshold: 0, which is “in front of me”. Set 90° and it is 0.71. One multiply-and-add per axis answers who is facing whom, with no angle ever computed.' });
DEMO('craft-entities-and-scenes', { kind: 'entity', t: 'Build an enemy from components', ask: 'Press Add a component once: Health, Move and Fly is a flying enemy the class tree already has. Then tick Heal as well: a flying enemy that heals, which no class has, is one more tick with components.' });
DEMO('craft-save-systems', { kind: 'savecut', t: 'Cut the power in the middle of a save', ask: 'Leave the power failing after step 2 with the switch off: the save is half written and the old one is gone, and 4 of the 6 moments lose it. Switch on write to a temp file, then swap: none do.' });

// ---- Careers ----
DEMO('careers-transferable-skills', { kind: 'profile', w: ['real-time performance', 'tooling', 'shipping to a hard date', 'systems thinking', 'player research'], t: 'What do you carry out with you?', ask: 'Score yourself on five of the things this topic says transfer. Lead with your top two, in the words of the industry you are moving to: the skill carries over, the vocabulary does not.' });
DEMO('careers-destinations', { kind: 'judge', w: ['market'], t: 'What counts as evidence that a field hires?', ask: 'Mark the claims you would count as evidence, then check. Marking nothing scores 4 of 6, because only two of the six claims count: find the two, and read why the others do not.' });
DEMO('careers-repositioning', { kind: 'choose', w: ['cv'], t: 'Translate the CV out of game jargon', ask: 'Pick the first wording at the first line, then start over and pick the second: read what each one does to a reader outside games, who skims and will not decode a game term.' });
DEMO('careers-interviewing-outside-games', { kind: 'cycles', t: 'Rehearsals before the day', ask: 'Set the loop to one full practice round: a question, an answer out loud, a critique. Count the rounds before your interview date: the formats are learnable, and they are learned by repetition.' });
DEMO('careers-ai-tooling-market', { kind: 'judge', w: ['ai'], t: 'What counts as evidence you are ready?', ask: 'Mark the claims you would count as evidence of readiness, then check. Marking nothing scores 3 of 6, because only three claims count: find them, and read why a chatbot wrapper is not one.' });
DEMO('careers-the-farmer-answered', { kind: 'runway', t: 'Can the farm lose money and you still eat?', ask: 'Start with other work at 3, the farm losing 2, costs of 4 and savings of 30: they last 10 months. Raise other work to 6: the same farm is covered every month, as it is for most farm households.' });
DEMO('careers-game-coding-interviews', { kind: 'cycles', t: 'Three things to practise, out loud', ask: 'Set the loop to one timed problem solved out loud with nothing to look up. Count how many fit before the interview, then split them three ways: data structures, gameplay math, one system to design.' });
