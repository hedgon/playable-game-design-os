/* =====================================================================
   INTERVIEW VIEWS (part E1): player, experience, core, systems, content,
   level. Adds the Interview tab to existing topics: the questions an actual
   interviewer asks about this concept, grouped junior / mid / senior, each
   with a model-answer outline, the follow-up that is coming, and the answer
   that is a red flag. Attached after the topics are defined, like TECH.
     INTERVIEW('topic-id',{ junior:[{q,a,follow,red}], mid:[...], senior:[...] })
   Six to ten questions per topic, at least one per level.

   Topics this file owns (35):
     player      who-is-the-player, player-motivation, fantasy,
                 return-and-quit, finding-an-idea
     experience  core-experience, fun-dimensions, goals-horizons,
                 tension-release, mastery-discovery-expression,
                 social-experience, feature-vs-experience, design-pillars
     core        core-loop, decisions, risk-reward, agency-and-emergence,
                 challenge-failure-recovery, skill-and-mastery
     systems     mechanics-and-rules, depth-vs-complexity, systemic-design,
                 economy-and-resources, progression, difficulty,
                 builds-and-loadouts
     content     content-multiplies, encounters-and-enemies,
                 items-weapons-abilities, quests-and-events,
                 procedural-content
     level       level-structure, pacing, spatial-composition,
                 encounter-design
   ===================================================================== */

INTERVIEW('core-loop',{
  junior:[
    { q:`What is a core loop, and what is the core loop of the last game you shipped or studied?`,
      a:`Name the repeated unit: action, feedback, decision, consequence, new situation. Then walk one concrete iteration of a real game in those five beats. Say how long one iteration takes. Say what changes between iteration one and iteration two, because a loop with nothing changing is a chore.`,
      follow:`Now name the loop one layer out. What is the three-minute loop that the three-second loop feeds?`,
      red:`Describes the game's feature list, or answers with a genre label ("it's a roguelike") instead of a repeated unit of play.` },
    { q:`Where does feedback belong in the loop, and how late is too late?`,
      a:`Feedback closes the loop: without it the player cannot learn what their action did. Immediate confirmation should land inside roughly 100 ms so the action feels connected. The consequence can resolve later, but the acknowledgement cannot. Give an example of a game where the acknowledgement and the outcome are deliberately split.`,
      follow:`What do you do when the real outcome takes two seconds to compute or has to come back from a server?`,
      red:`Treats feedback as visual polish added at the end, or cannot distinguish acknowledging the input from resolving the outcome.` },
    { q:`In an engine of your choice, where would you actually put the loop code?`,
      a:`Input sampled every frame so no press is dropped, rules resolved on the fixed step so the same action resolves the same way on any machine, and the consequence raised as an event rather than called inline. In Unity that is Update plus FixedUpdate plus a UnityEvent. In Godot that is _process, _physics_process and a signal.`,
      follow:`What breaks if you sample the attack button in FixedUpdate?`,
      red:`Puts everything in Update or _process and does not know why frame-rate independence matters.` }
  ],
  mid:[
    { q:`A playtest says the game is repetitive. How do you find out which part of the loop is at fault?`,
      a:`Do not add content. Instrument one iteration: is the action varied, is the feedback readable, is there a decision with a real trade-off, does the consequence change the next situation. Watch six players and count decisions per minute. Repetitiveness is almost always a missing decision or an unchanging situation, not a missing feature.`,
      follow:`You find the decision exists but players always pick the same option. Now what?`,
      red:`Jumps straight to "add more enemy types" or blames the art.` },
    { q:`How do you prototype a core loop so the test is actually cheap?`,
      a:`Strip to the single verb and the single consequence. Grey boxes, placeholder audio, no progression, no menu. Test the one question that would kill the idea. Say what your kill criterion was on a real prototype, and whether you honoured it.`,
      follow:`What was the smallest prototype you have built that changed a decision?`,
      red:`Describes a vertical slice and calls it a prototype, or has never killed one.` },
    { q:`How does the loop change when the game is online and the server is authoritative?`,
      a:`The acknowledgement stays local and immediate, the resolution moves to the authority. That means prediction, reconciliation and a visible rule for what happens when the two disagree. Name the correction you chose and what it looks like to the player when it fires.`,
      follow:`What does your loop feel like at 200 ms of latency, and what did you change to keep it honest?`,
      red:`Says "we just send the input to the server" with no account of the wait the player experiences.` }
  ],
  senior:[
    { q:`You inherit a game whose loop is fine for an hour and dead by hour three. Where do you look?`,
      a:`The three-second loop is working and the longer loops are not. Check whether the situation actually changes across sessions, whether the decision space widens with mastery, and whether the systems feeding the loop generate new combinations or only bigger numbers. Separate a content problem from a system problem before spending a single sprint.`,
      follow:`How would you tell a content problem from a system problem with data you can gather this week?`,
      red:`Proposes a progression pass or a battle pass without first showing which loop went flat.` },
    { q:`How do you decide the loop is good enough to build the rest of the game on?`,
      a:`A written hypothesis, matched players, an observable signal and a kill criterion agreed before the test. Good enough means players keep choosing to repeat it without being told to, and can explain why one iteration went differently from the last. Say what you would have done if the signal had not appeared.`,
      follow:`What would have made you cancel it, and who had the authority to make that call?`,
      red:`Cannot name a criterion, or says the team knew it was fun. Enthusiasm is not a signal.` }
  ] });

INTERVIEW('who-is-the-player',{
  junior:[
    { q:`Who is the player for the last game you worked on? Describe them without using the word "gamers".`,
      a:`Name three games they actually finished recently and what they did in the first ten minutes of each. Then the session shape, the device and posture, and the feeling they came for. Finish with one concrete decision that model changed: a checkpoint distance, a tutorial you deleted, a control scheme you rejected.`,
      follow:`Which conventions did you assume they already knew, and where did a playtest prove you wrong?`,
      red:`Answers with demographics ("males 18 to 34") or with "anyone who likes a good challenge".` },
    { q:`A stakeholder tells you the target is "casual players". What do you do with that?`,
      a:`Push back, politely and specifically. Casual is not a behaviour. Convert it into session length, input precision, tolerance for friction and prior genre knowledge. Ask which games those people finished. Come back with a sketch they can approve or correct.`,
      follow:`They refuse to be more specific. How do you proceed without inventing an audience?`,
      red:`Accepts the label and starts simplifying the tutorial for an imaginary person.` },
    { q:`What does the player model actually change in the build?`,
      a:`Prior knowledge sets the onboarding budget. Session shape sets checkpoint spacing and save granularity. Device and posture set input precision and text size. Give one example where the model made you cut something you liked.`,
      follow:`Give a case where the device choice killed a mechanic you wanted.`,
      red:`Treats the player model as a marketing document that never touches a design decision.` }
  ],
  mid:[
    { q:`Playtest feedback splits: half say it is too slow, half say too fast. How do you resolve it?`,
      a:`Segment by match to the sketch before averaging anything. Clarity feedback counts from everyone. Taste feedback counts only from matched testers. Check whether the split tracks prior genre experience. Then decide which half is the player and say so out loud.`,
      follow:`The split is inside your matched group. Now what?`,
      red:`Averages the two and tunes to the middle, producing a pace nobody asked for.` },
    { q:`How do you recruit playtesters for a game that has no players yet?`,
      a:`Screen from the sketch: recently finished games, session shape, device. A five-question form does it. Recruit from the communities of the reference games, not from the desks around you. Track matched and unmatched testers separately so you can weight their feedback differently.`,
      follow:`What do you do with the unmatched testers already on the schedule?`,
      red:`Uses whoever is in the office and treats developer taste as the target.` },
    { q:`Write me the "not for" list for a game you know. Why bother?`,
      a:`Naming who will bounce makes the trade-off conscious instead of accidental. It gives the team a rejection tool that does not require the director. It stops the design drifting toward everyone, which is how a game ends up preferred by no one.`,
      follow:`Which feature request have you actually rejected with that list?`,
      red:`Refuses to exclude anyone because "we want the widest possible audience".` }
  ],
  senior:[
    { q:`After vertical slice, the publisher wants the audience widened. How do you answer?`,
      a:`Ask what widening means as behaviour, not as a label. Cost it: onboarding budget, difficulty range, readability at a new device size. Name what the current player loses. Then present options with prices, from assist options to a re-tuned curve to a different game, and take it to the pillars rather than to opinion.`,
      follow:`They insist. What do you change first, and what do you refuse to change?`,
      red:`Agrees immediately, adds difficulty settings as a gesture, and never re-tests with the new player.` },
    { q:`How do you keep a player model honest two years into production?`,
      a:`Revisit it after every playtest round and record where real behaviour contradicted it. Keep it where decisions are made, next to the pillars, not in a folder. Retire personas nobody cites. The rule is that observed behaviour overrides the sketch, always.`,
      follow:`What did you have to change in yours, and what did that cost the schedule?`,
      red:`Cites a persona deck written at kickoff that nobody has opened since.` }
  ] });

INTERVIEW('player-motivation',{
  junior:[
    { q:`Why does someone keep playing when nothing forces them to?`,
      a:`Name the three needs: competence, autonomy, relatedness. Then attach each to a mechanic rather than reciting the theory. Say which need your loop feeds in the first ten minutes and which it feeds at hour ten, because they are rarely the same one.`,
      follow:`Which need does your favourite game feed worst, and how can you tell?`,
      red:`Answers "rewards", or recites Self-Determination Theory without touching a single mechanic.` },
    { q:`A daily login bonus lifts day-one retention. What is your concern?`,
      a:`Extrinsic hooks can crowd out intrinsic motivation and leave habit behind. Habit churns suddenly and without warning. The question is whether players return when the notification is off, and whether the bonus is teaching them that the reason to open the game is outside the game.`,
      follow:`How would you test whether the bonus is carrying the retention?`,
      red:`Treats the metric lift as proof the feature works and moves on.` },
    { q:`Where does autonomy actually live in a game?`,
      a:`In choices whose consequences differ, not in the number of options. A fork where both paths resolve the same way is a funnel wearing a fork's clothes. Name a moment in a game you know where the choice genuinely changed what came next.`,
      follow:`Show me a choice in your own game that looks like autonomy and is not.`,
      red:`Equates autonomy with a settings menu or with character customisation.` }
  ],
  mid:[
    { q:`Retention drops at day seven. Walk me through the diagnosis.`,
      a:`Do not reach for a retention mechanic. Find what players were doing when sessions stopped, then ask which need stopped being fed there. Usually it is competence, because the mastery signal went flat, or autonomy, because one option started dominating. Form one hypothesis and the smallest experiment that moves it.`,
      follow:`You find the mastery signal is missing. What is the smallest change that restores it?`,
      red:`Proposes a battle pass before naming which need went unfed.` },
    { q:`Map our systems to the needs they feed. What do you do with the blanks?`,
      a:`A blank cell is either an opportunity or a cut. Work out which by asking what the player would lose if the system went away. Systems that feed no need and create no decision are the cheapest scope you will ever recover.`,
      follow:`Which system did you actually cut after running that audit?`,
      red:`Labels every system with all three needs, which means the audit found nothing.` },
    { q:`How do you get evidence about motivation out of a playtest instead of guessing?`,
      a:`Ask at a natural stopping point, not at the end of a forced session: why did you keep going? Code the answers as competence, autonomy, relatedness, curiosity or obligation. Watch for "I figured out" against "I got". Check whether they come back the next day unprompted.`,
      follow:`A tester says the game is addictive. Is that good news?`,
      red:`Asks players to rate fun from one to five and treats the average as the finding.` }
  ],
  senior:[
    { q:`The business wants stronger hooks. Design says it will hollow the game. How do you settle it?`,
      a:`Separate the two curves: short-term metric and voluntary return. Propose a bounded experiment with a kill criterion agreed in advance, and define what obligation looks like in the data before you run it. Then make the trade explicit against the pillars so the decision is recorded, not re-argued every month.`,
      follow:`What number would have made you concede the point?`,
      red:`Frames it as art against business and refuses to propose a measurable test.` },
    { q:`How do you design for relatedness in a single-player game?`,
      a:`Find the social act the game can actually support: being seen, teaching, leaving traces, being remembered by characters. Companions and a town that reacts satisfy relatedness more reliably than any friends list. The act has to produce something visible or it does not register.`,
      follow:`Give an example where you tried it and the world still felt indifferent.`,
      red:`Proposes a leaderboard and a friends list and calls it relatedness.` }
  ] });

INTERVIEW('fantasy',{
  junior:[
    { q:`Finish this for a game you shipped or studied: "In this game I get to be someone who ___."`,
      a:`Give an identity, not a genre. Then name the three verbs that identity implies and check them against what the player actually does most often. If the verbs and the loop disagree, one of them is wrong and you say which.`,
      follow:`Are those verbs the ones the player performs most often, or the ones in the pitch?`,
      red:`Answers with a genre label such as "a roguelike deckbuilder" and stops there.` },
    { q:`What is a fantasy-breaker? Name one from a game you know.`,
      a:`A concrete moment that contradicts the identity the game promised: the master thief who has to brawl, the general who cannot give an order, the survivor who finds ammunition everywhere. Early breakers cost most because the player has not yet decided to forgive anything.`,
      follow:`How would you hunt for them before the first playtest?`,
      red:`Treats it as an art or story problem that the narrative team will handle.` },
    { q:`The art says master thief. Combat is the only reliable way to win a fight. What is wrong?`,
      a:`Mechanics deliver the fantasy, art only dresses it. The loop verbs are the promise the player believes. Either stealth has to become the reliable path or the promise has to change, and the cheaper of those two is the one you argue for.`,
      follow:`What is the cheapest change that keeps the promise?`,
      red:`Proposes more stealth visual effects and a darker palette.` }
  ],
  mid:[
    { q:`How do you use the fantasy as a gate on feature requests?`,
      a:`It is the first filter: does this make the player more of the person they came here to be? It is fast, it is public, and it resolves most arguments without escalation. Give a real feature you rejected with it and one you let through that you now regret.`,
      follow:`Give me a feature that serves the fantasy and you still cut. Why?`,
      red:`Uses the fantasy to justify everything, which means it is gating nothing.` },
    { q:`Testers describe your game in the third person and by system names. What does that tell you?`,
      a:`The fantasy is not landing. Check whether the verbs they perform most often are the fantasy verbs, whether the UI is narrating instead of the play, and whether the first ten minutes put them in the role or in a menu. Then change one thing and re-test the language.`,
      follow:`What is your first experiment, and what would count as a pass?`,
      red:`Rewrites the store description and calls it fixed.` },
    { q:`A power fantasy is testing as boring. Diagnose it.`,
      a:`Power without threat is arithmetic. Check whether failure is possible at all, whether anything forces the player to change plan, and whether the reward is a new situation or a bigger number. The fix is usually stakes, not more power.`,
      follow:`How do you add threat without turning the power fantasy into a survival game?`,
      red:`Raises enemy health and calls it difficulty.` }
  ],
  senior:[
    { q:`Two directors disagree about the fantasy. How do you resolve it without a coin flip?`,
      a:`Write both as identity sentences with their verbs, derive the loop each implies, then build the cheapest prototype that separates them. Bring evidence and the pillars to the meeting. Name who owns the call before you start, because a prototype nobody is obliged to act on settles nothing.`,
      follow:`The prototype comes back ambiguous. Who decides, and on what basis?`,
      red:`Merges the two into a vaguer statement everyone can live with.` },
    { q:`How do you keep one fantasy intact across three years and forty people?`,
      a:`One sentence, published where decisions are made, with its verbs listed under it. A live list of fantasy-breakers anyone can add to. A review gate that asks the question out loud. Onboarding that teaches it on day one. It drifts when the only guardian is the director's calendar.`,
      follow:`Where did yours drift last time, and what caught it?`,
      red:`Relies on the director personally reviewing every decision.` }
  ] });

INTERVIEW('return-and-quit',{
  junior:[
    { q:`A tester quits twenty minutes in. What do you want to know?`,
      a:`What they were doing in the sixty seconds before they stopped. Then classify the ending: confused, bored, frustrated, satisfied or interrupted. Those four need four different fixes, and treating them as one number is how teams fix the wrong thing.`,
      follow:`You have only telemetry, no player. What can you still conclude?`,
      red:`Concludes the tester was not the target audience.` },
    { q:`What is the difference between a retention number and a retention cause?`,
      a:`The number tells you when players leave. Only observation tells you why. Retention is a symptom and the cause is always something the game did or failed to do at a specific moment you can point at.`,
      follow:`What is the smallest study that gets you an actual cause this week?`,
      red:`Proposes adding more metrics to the dashboard.` },
    { q:`What should a player be thinking about when they close the game?`,
      a:`Something specific they intend to do next time. If the answer is nothing, there is no pull to return and no retention mechanic will manufacture one. That is a long-horizon goal problem, not a notification problem.`,
      follow:`How do you check that in a test rather than assuming it?`,
      red:`Says "they should want to come back" without naming a mechanism.` }
  ],
  mid:[
    { q:`Early, mid and late churn need different fixes. Explain the three.`,
      a:`Early churn is usually clarity: they never understood what they were doing. Mid churn is a mastery plateau or a content plateau. Late churn is completion, which is not a failure. Cite the evidence you would expect to see for each before you spend a sprint.`,
      follow:`How do you tell a mastery plateau from a content plateau with data you can gather this week?`,
      red:`Treats churn as one number and applies one fix to all of it.` },
    { q:`Sessions end mid-encounter and those players do not come back. What do you change?`,
      a:`Look at checkpoint and save granularity against the real session shape. Make stopping points legible and satisfying, and leave something pending rather than something unfinished. A session that ends in failure with no way to close it is the worst place to be interrupted.`,
      follow:`What does moving checkpoints closer cost you in tension?`,
      red:`Adds a return bonus so the player is paid to come back to the same bad moment.` },
    { q:`You cannot reach the players who left. How do you learn anything?`,
      a:`Run a fresh cohort and watch the equivalent segment in person. Match session-end points against moments you have observed directly. Exit-interview the testers you do have, and be explicit about which conclusions the survivors cannot support.`,
      follow:`Which conclusion would you refuse to draw from survivor data?`,
      red:`Interviews only the players who stayed and generalises their preferences to everyone.` }
  ],
  senior:[
    { q:`Leadership asks for a retention feature. When is that the right answer?`,
      a:`Only after the loop is voluntarily replayed. Before that, a retention mechanic buys habit instead of motivation and hides the defect that caused the churn. Offer the diagnosis with a deadline attached, so the ask is answered rather than refused.`,
      follow:`You have four weeks and no time for diagnosis. What do you actually ship?`,
      red:`Builds streaks and timers, reports the metric, and never revisits the cause.` },
    { q:`Design a churn measurement plan you would defend to a publisher.`,
      a:`Instrumented session endings with enough context to classify them, a qualitative sample alongside, one hypothesis per cluster with the smallest experiment that tests it, and thresholds agreed before the data arrives. Say for each signal what result would falsify the hypothesis.`,
      follow:`If you had to keep three signals and drop the rest, which three?`,
      red:`Proposes a dashboard with no hypothesis attached to any chart on it.` }
  ] });

INTERVIEW('finding-an-idea',{
  junior:[
    { q:`Where do your game ideas come from?`,
      a:`From a market you already watch and from what its players write, replay, mod and complain about. Name where you read it: reviews, forums, streamer chats, patch-note reactions. Quote one complaint you can point to rather than describing a premise you find cool.`,
      follow:`Show me the complaint in the players' own words and tell me where you saw it.`,
      red:`Describes a brainstorm, or a setting they think would be cool, with no player attached.` },
    { q:`Why is a survey a poor way to find a game idea?`,
      a:`A small survey measures politeness, and a large one is not available to you. What players do is evidence you can gather alone: the mods they install, the spreadsheets they keep, the house rules they invent, the things they quit over. Behaviour beats stated preference.`,
      follow:`What would you observe instead, this week, on your own?`,
      red:`Proposes running a bigger survey with better questions.` },
    { q:`What counts as a gap worth building a game on?`,
      a:`An exit reason or an unmet want. Not a tolerated cost, which players accept as the price of the genre, and not your own taste. The test is whether players leave over it or work around it, not whether it annoys you.`,
      follow:`Name a tolerated cost in a genre you know well.`,
      red:`Calls a theme, an art style or "more content" the gap.` }
  ],
  mid:[
    { q:`You found a gap. Why is it still open?`,
      a:`Name the structural reason: a business model the mechanism breaks, a scope the incumbent cannot afford, a design assumption their whole game rests on. If no such reason exists, they can ship your idea in a patch and you have a feature, not a wedge.`,
      follow:`What single move would neutralise your wedge, and how long would it take them?`,
      red:`Assumes the incumbents simply have not thought of it.` },
    { q:`How do workarounds inform design?`,
      a:`A mod, a spreadsheet, a house rule or a third-party tool is a want the player paid for with effort. Count the distinct ones and how many people use them. No workarounds at all is a signal that the want is weak, however loudly it is complained about.`,
      follow:`What if the workaround is good enough that nobody needs a new game?`,
      red:`Treats one popular mod as proof of a commercial market and skips every further test.` },
    { q:`Kill your own idea cheaply. What do you run?`,
      a:`A workaround audit, comment mining across three streamed sessions with timestamps on every unprompted complaint, a one-mechanism greybox, and a store page placed next to the incumbents'. Each with a threshold written down before you look at the result.`,
      follow:`What result would have made you stop, and did you honour it?`,
      red:`Proposes building a vertical slice to find out whether the idea is any good.` }
  ],
  senior:[
    { q:`Pitch me a concept in a form I can falsify.`,
      a:`The want in player words with its source. The single rule that keeps the promise. The structural reason the incumbents cannot copy it. The observation tests and their kill criteria. Finally the constraints that make this team the one to build it, because a wedge you cannot execute is someone else's idea.`,
      follow:`Which part of that is weakest, and what would you do about it first?`,
      red:`Pitches a genre, a setting and a feature list, with no want and no test.` },
    { q:`How do you use AI here without ending up with the genre average?`,
      a:`Use it to mine and cluster complaints, to argue as each incumbent about why they would not ship your mechanism, and to steelman the market against you. Never ask it for ideas before the market is read. The choice of market and player stays human because it is the founding commitment.`,
      follow:`What did a model get wrong for you last time, and how did you catch it?`,
      red:`Asks for ten game ideas in a genre and picks the one that sounds best.` }
  ] });

INTERVIEW('core-experience',{
  junior:[
    { q:`What is a core experience statement, and why does it have to fit in one sentence?`,
      a:`It names who the player is, what they do moment to moment, and how it feels. One sentence because it has to be recited from memory in a review and used to reject something. Give a real one, such as a tense methodical hunt where preparation pays off and mistakes are survivable but costly, and contrast it with a feature list.`,
      follow:`Recite the statement for a game you worked on and name a feature it killed.`,
      red:`Offers a genre plus adjectives, such as "a fun, deep roguelike", and calls that the target.` },
    { q:`Why is "is it fun?" a useless playtest question?`,
      a:`It is unanswerable and unfalsifiable, so every answer confirms whatever the team already believed. Convert it into the target emotions and the behaviour that would show them. Did they go quiet at the ambush, did they prepare before entering, did they use the word tense unprompted.`,
      follow:`How do you actually record that during a session?`,
      red:`Proposes a five-point fun rating and treats the average as evidence.` },
    { q:`How do you pick target emotions the mechanics can actually produce?`,
      a:`Work backwards from what the loop does. Uncertainty with stakes produces tension. Scale and contrast produce awe. Real consequence produces dread. If no mechanic can manufacture the emotion, it is decoration and you drop it rather than hoping audio will carry it.`,
      follow:`Name an emotion you had to abandon, and what you replaced it with.`,
      red:`Picks awe and dread because they sound impressive, with no mechanism behind either.` }
  ],
  mid:[
    { q:`Combat wants to be faster, narrative wants longer scenes, UI keeps getting denser. How does the statement help?`,
      a:`It stops each discipline optimising locally by giving all of them the same target. Every ask is judged against the same sentence, in public. Where two asks genuinely conflict you escalate with the trade named rather than with preference, which is a much shorter meeting.`,
      follow:`Two disciplines both claim the statement supports them. Then what?`,
      red:`Lets whoever argues longest win and describes that as collaboration.` },
    { q:`Players are relaxed in the section you designed to be tense. What do you do?`,
      a:`Check the ingredients of tension at that exact moment: an uncertain outcome, stakes the player knows about, and enough information to reason. One of them is missing. Restore that ingredient instead of adding effects, then re-test. Revise the statement only when evidence says the game is a different game.`,
      follow:`It is not one moment, it is the whole game. What changes?`,
      red:`Adds music stings and screen shake to manufacture a feeling the design does not produce.` },
    { q:`How do you use reference games without copying them?`,
      a:`Dissect the mechanism rather than the feature. What information did the player have, what decision did they face, what was the time pressure, what was the consequence, how was it fed back. Take the ingredient list and check which ones your prototype has, lacks or contradicts.`,
      follow:`Which ingredient did you find you could not afford, and what did you do instead?`,
      red:`Lists reference games as inspiration with no account of what produces the feeling in them.` }
  ],
  senior:[
    { q:`The statement has changed three times this year. What is happening, and how do you stop it?`,
      a:`Either it was written from enthusiasm rather than from the loop, or it is being rewritten to ratify decisions already taken. Version it with the reason and the evidence for each change. Then check whether the loop actually produces the new claim, because a statement the game cannot deliver is worse than none.`,
      follow:`Which of those three changes was legitimate, and how did you know?`,
      red:`Treats the drift as healthy iteration and keeps rewriting the sentence for each pitch meeting.` },
    { q:`How do you make a core experience statement operational across forty people?`,
      a:`Publish it where reviews happen rather than on a wall. Make it the first question in every feature review. Score observed emotions against it after each playtest round and post the result. Keep a short list of what the game is not, because the refusals are what make it usable.`,
      follow:`How do you know it is being used rather than quoted?`,
      red:`Puts it on a poster, measures nothing, and assumes alignment.` }
  ] });

INTERVIEW('fun-dimensions',{
  junior:[
    { q:`A producer says "make it more fun". What do you ask back?`,
      a:`Which dimension went flat. Mastery means there is nothing left to learn. Discovery means nothing new is appearing. Tension means there are no stakes. Expression means there is one right answer. Each of those has a different fix, and "more fun" has none.`,
      follow:`How would you find out which one, from a session recording?`,
      red:`Starts listing features that could be added.` },
    { q:`Which vocabulary of fun do you use, and where does it come from?`,
      a:`LeBlanc's eight kinds, Lazzaro's four keys and Koster's fun as the pleasure of learning patterns are the common ones. They are lenses, not laws, and none of them has an agreed metric. What matters is having words specific enough to be acted on: mastery, discovery, tension, expression, optimisation, surprise.`,
      follow:`Which two dominate in a game you love, and how do they reinforce each other?`,
      red:`Recites a taxonomy without attaching a single dimension to a mechanic.` },
    { q:`Players are enjoying something you did not design for. What do you do?`,
      a:`Find the dimension underneath it and ask whether it fits the core experience. If it does, redesign around it, because a dimension players found on their own is cheaper than one you have to manufacture. Suppress it only when it actively fights the experience.`,
      follow:`When would you suppress it instead?`,
      red:`Patches it out because it was not in the plan.` }
  ],
  mid:[
    { q:`Optimisation and expression pull apart. Explain, with an example.`,
      a:`A clear optimum kills expression because there is one correct answer. Too many equal options kill optimisation because no answer is better. The resolution is situational optimality, where the right answer changes with the situation. Show it in a build or deck system you know.`,
      follow:`How would you tune a system that has already collapsed to one optimum?`,
      red:`Balances everything to equal power and calls the result diverse.` },
    { q:`How do you measure the dimension mix instead of asserting it?`,
      a:`Log timestamped moments of visible engagement and disengagement during play. Tag each with a dimension. Compare the distribution against the intended mix from the experience statement and work on the largest gap. The tags have to come from the note, not from the design document.`,
      follow:`Your tags and a second observer's disagree. How do you handle that?`,
      red:`Tags the moments from what the design intended rather than from what was recorded.` },
    { q:`A dimension is missing. What do you build?`,
      a:`Change the existing interaction before adding a system. A crafting system bolted on for creativity is the classic overspend. Ask what information, constraint or consequence the current verb lacks, because most missing dimensions are a missing ingredient rather than a missing feature.`,
      follow:`When is a new system genuinely the right answer?`,
      red:`Adds one system per missing dimension and doubles the teaching cost.` }
  ],
  senior:[
    { q:`Novelty is carrying your early playtests. How would you know?`,
      a:`Measure at several points on the skill curve rather than once. Bring the same testers back a week later and see which enjoyment survives repetition. Dimensions shift as players learn, and the ones that vanish on the second session were novelty wearing a costume.`,
      follow:`What does it mean if only discovery survives?`,
      red:`Takes first-session enthusiasm as validation and starts content production.` },
    { q:`Two games in one genre with different dimension mixes. How does that change the production plan?`,
      a:`Mastery and expression regenerate, discovery is consumed once. A discovery-led mix is a content budget and a content pipeline. A mastery-led mix is a depth and feedback budget. The mix decides team shape, so getting it wrong is a hiring mistake, not just a design one.`,
      follow:`Your mix says content budget and you have a systems team. What do you do?`,
      red:`Plans the same production shape regardless of which dimensions the game runs on.` }
  ] });

INTERVIEW('goals-horizons',{
  junior:[
    { q:`Name the three goal horizons and the failure that comes from missing each.`,
      a:`Right now, this session, this month. No short goal is aimlessness. No session goal means sessions end arbitrarily and unsatisfyingly. No long goal means no reason to open the game tomorrow. Diagnosing a drifting player starts by asking which of the three is blank.`,
      follow:`Pause a player at a random moment. What should they be able to tell you?`,
      red:`Describes a quest log and treats it as the answer to all three horizons.` },
    { q:`What is the difference between a goal and a progress bar?`,
      a:`A goal is a state the player wants to be in. A bar is a measurement of distance to something. A bar with no desired state behind it measures nothing the player cares about, which is why filling it feels hollow.`,
      follow:`Give me an example of a bar that is doing real work.`,
      red:`Treats any visible meter as evidence that a goal exists.` },
    { q:`Where should the short-term goal live?`,
      a:`In the world, where the player can see it: a thing to reach, a shape that stands out, a door with light behind it. The log is a backup for players who look away, not the source. A goal that exists only in a menu makes the world feel like a corridor between menus.`,
      follow:`Your level has no line of sight to anything. What do you do?`,
      red:`Adds a waypoint marker as the first and only fix.` }
  ],
  mid:[
    { q:`Players drift and ask what they are supposed to do. Diagnose it.`,
      a:`Sample five random moments from a recording and write the apparent goal at each horizon. The blanks are the finding. Then check whether the short goal is visible in play rather than in the UI, and whether finishing a session goal visibly advances the long one.`,
      follow:`All three horizons exist and players still drift. What else do you look at?`,
      red:`Adds an objective list to the HUD without establishing which horizon was missing.` },
    { q:`Explicit goals reduce aimlessness and reduce discovery. How do you choose?`,
      a:`Guidance level is an identity decision tied to the player model and the pillars, not a usability default. The usual middle path is to make the goal visible in the world and leave the route open. Then test for both failures: drift on one side, and no invented goals on the other.`,
      follow:`How do you measure that guidance has become too strong?`,
      red:`Picks maximum guidance because it always tests better in the first ten minutes.` },
    { q:`How do you make finishing a session feel like a deposit rather than a stop?`,
      a:`The session goal has to visibly move the long one: a state that persists, a capability unlocked, a place opened. And something should be left pending so there is a specific next intention when the player closes the game.`,
      follow:`What is the risk of always leaving something pending?`,
      red:`Pays out a currency at session end and calls that a deposit.` }
  ],
  senior:[
    { q:`Player-set goals are the strongest kind. How do you design for goals you did not write?`,
      a:`Leave slack: open-ended systems, optional challenges, scoring, visible places you cannot reach yet. Make the world legible enough that a plan is possible. Then watch which invented goals actually appear in tests and support those rather than the ones you hoped for.`,
      follow:`A player-set goal turns out more compelling than yours. What do you do?`,
      red:`Fills every gap with authored objectives so there is nothing left to invent.` },
    { q:`Your long horizon is too long and players call it a grind. What is your analysis?`,
      a:`Check three things. Is the long goal visible, and is its value legible before the player reaches it. Does each session visibly advance it. Does each step change a capability or only a number. Grind is almost always an unchanging situation rather than a duration.`,
      follow:`You cannot shorten it for business reasons. What do you change instead?`,
      red:`Halves the numbers and reships exactly the same unchanging loop.` }
  ] });

INTERVIEW('tension-release',{
  junior:[
    { q:`Why is constant tension a design failure?`,
      a:`Players habituate. Without release the peaks stop registering and everything reads as one flat loud stretch. Release is what makes the next rise legible. Players remember peaks and endings rather than averages, so protecting the peaks is the whole job.`,
      follow:`Where would you put the first release beat in an opening level?`,
      red:`Argues that more tension is always better because the game is meant to be intense.` },
    { q:`Time pressure is not the same as tension. Explain.`,
      a:`Tension needs an uncertain outcome the player cares about. A timer attached to a section with no meaningful decision is stress, and stress makes players withdraw rather than lean in. Give the clock something to make costly and it becomes tension.`,
      follow:`How would you convert a timer into a real tension source?`,
      red:`Adds a countdown to a section that is dragging and expects it to become exciting.` },
    { q:`What makes a release moment feel earned rather than empty?`,
      a:`It carries something: a reward, a story beat, a vista, a chance to look back at what just happened. Empty rest is dead time and players read it as padding. The release is also where learning consolidates, so it is doing work even when nothing is happening.`,
      follow:`Name a release beat you remember and say what it carried.`,
      red:`Defines release as the absence of enemies.` }
  ],
  mid:[
    { q:`You draw the intended intensity curve. How do you get the observed one?`,
      a:`From behaviour, not from a form. Speech, posture, movement speed, pauses, where players go quiet, where they swear or laugh. Timestamp it and overlay the two curves. The largest divergence is the work, and it is usually one beat rather than the whole level.`,
      follow:`Intended and observed match and the level still tests badly. What now?`,
      red:`Asks players to rate tension per section on a questionnaire afterwards.` },
    { q:`There are explosions everywhere and testers call the level flat. What is happening?`,
      a:`Spectacle without uncertainty is release, not tension. Nothing is at stake so nothing rises. Check what the player stands to lose at the supposed peak and whether they know it before it happens. Knowledge of the stake is half the tension.`,
      follow:`What is the smallest change that puts stakes back in?`,
      red:`Adds more spectacle and turns the audio up.` },
    { q:`How does failure cost relate to tension?`,
      a:`If failure costs nothing, nothing is tense. The cost must be known before the moment, or the player cannot feel it in advance, and it must be proportional or players start avoiding the content entirely. That is where recovery design and pacing meet.`,
      follow:`You raise the cost and your casual testers bounce. What do you do?`,
      red:`Raises the cost globally without checking who leaves as a result.` }
  ],
  senior:[
    { q:`Pace a whole game rather than a level. How is that different?`,
      a:`The rhythm nests: beats inside levels, levels inside acts, acts inside the campaign. You plan the peaks at the scale players actually remember, and you budget novelty because a peak needs an ingredient the player has not met yet. Valleys at game scale still have to carry something.`,
      follow:`Where do most teams get the game-scale curve wrong?`,
      red:`Pastes the level curve at every scale and expects it to work.` },
    { q:`Six people build levels in parallel. How do you keep the pacing intact?`,
      a:`A published curve with each level's intended position on it, a shared vocabulary for beats, a review that plays them in sequence rather than in isolation, and a rule that nobody raises intensity locally without trading it down somewhere else.`,
      follow:`Two levels both claim to be the peak. How do you decide?`,
      red:`Reviews levels only in isolation and finds the problem at the first full playthrough.` }
  ] });

INTERVIEW('mastery-discovery-expression',{
  junior:[
    { q:`Name the three long-term engines and the fuel each one needs.`,
      a:`Mastery needs a skill ceiling above where good players land, plus perceivable improvement. Discovery needs hidden content or systemic surprise. Expression needs meaningful variability that other people can see. They deplete at different rates, which is why the mix matters.`,
      follow:`Which engine is your game still running on at hour ten?`,
      red:`Answers "replayability" and stops there.` },
    { q:`Why is randomness alone not replayability?`,
      a:`Random variation without mastery or expression is noise. The player is not learning to read it and not shaping it, so the runs blur together. Variation only counts when it changes a decision the player can get better at making.`,
      follow:`What would make a random run feel like it was yours?`,
      red:`Claims infinite replayability from a combinatorial count.` },
    { q:`Is cosmetic customisation expression?`,
      a:`Only if it changes how the game is played or how the player is seen by others. Otherwise it is a wardrobe. Expression needs a consequence somebody perceives, whether that is an opponent, a teammate, or the world reacting.`,
      follow:`Make a cosmetic system expressive without touching balance.`,
      red:`Counts the number of hats as a measure of expression.` }
  ],
  mid:[
    { q:`Estimate when your discovery content runs out.`,
      a:`List the discovery sources: world, system interactions, story. Estimate consumption at a typical pace rather than a completionist one. Compare against the intended play length. Then say out loud which engine takes over at that hour, because something has to.`,
      follow:`It runs out at hour four and you promised twenty. What do you do?`,
      red:`Plans more content without asking which engine carries the game afterwards.` },
    { q:`Players cannot tell they are improving. What do you build?`,
      a:`A mastery display: faster clears, options opening up, style that is visible to the player or to others. Numbers alone read as stat growth, which is not the same thing. The test is whether a veteran can name what they now do differently.`,
      follow:`Your central skill is judgement rather than execution. How do you show that?`,
      red:`Adds an experience bar and calls it mastery feedback.` },
    { q:`You count eight viable builds. How do you check that is true in play?`,
      a:`Pick rates and win rates over time, plus whether two players in the same situation choose differently and can explain why. A build that is viable only on paper is a trap, and traps teach players not to trust the system.`,
      follow:`Three of them collapse after two weeks of community optimisation. What do you do first?`,
      red:`Asserts diversity from the design document with no pick data at all.` }
  ],
  senior:[
    { q:`Budget the three engines for a game that has to live two years.`,
      a:`Mastery and expression regenerate, discovery is consumed. So the live plan leans on the first two while discovery is periodically restocked. That ratio decides team shape and release cadence, and it is the thing to argue about before the roadmap, not after.`,
      follow:`Your live team is content-only. How does that change the design?`,
      red:`Plans two years of content drops with no renewable engine underneath them.` },
    { q:`How do you tell a real skill ceiling from a wishful one?`,
      a:`Record veterans and novices on the same challenge and compare. If the difference is small, the ceiling is where the veterans are, not where the document says. Also check whether veterans can articulate what they do, because a skill nobody can name is usually not being learned.`,
      follow:`The ceiling is too low. What raises it without punishing novices?`,
      red:`Raises difficulty numbers and calls that a higher ceiling.` }
  ] });

INTERVIEW('social-experience',{
  junior:[
    { q:`Who does the player matter to in a single-player game?`,
      a:`Characters who notice, a world that changes because of them, a companion who reacts. Relatedness is one of the three core needs and it does not require other humans. A world that never registers the player is the single-player version of playing alone in an empty lobby.`,
      follow:`Give a moment where being noticed changed how you played.`,
      red:`Says single-player games have no social dimension.` },
    { q:`What is a social act, as opposed to a social feature?`,
      a:`The act is compete, cooperate, show, share, teach, or be seen. The feature is the interface around it. A friends list attached to no act produces nothing, which is why bolted-on social features get ignored and then get blamed on the audience.`,
      follow:`Name a social feature you have seen with no act behind it.`,
      red:`Lists leaderboards, guilds and chat as though naming features answers the question.` },
    { q:`What has to be true for a social act to register with players?`,
      a:`It must produce something visible: a result, a story, a status, a trace another player meets. If nobody can see it happened, it does not create relatedness. That is the test to apply before building the system.`,
      follow:`How would you make teaching visible?`,
      red:`Assumes players will talk about it anyway because the game is good.` }
  ],
  mid:[
    { q:`Design the falling-behind experience. Why is that a design task at all?`,
      a:`A player two weeks behind has a first five minutes that decides whether they stay. If it is humiliating or unplayable they leave, and that is a designed outcome whether or not anyone designed it. You want catch-up that does not remove the reason the others kept up.`,
      follow:`How do you offer catch-up without devaluing the people who kept pace?`,
      red:`Leaves it to matchmaking and hopes the problem sorts itself out.` },
    { q:`Competition energises some players and drives others out. How do you hold both?`,
      a:`Separate the ladders, make the competitive act visible but optional, and make sure what is being compared is skill rather than time invested or money spent. Players detect that difference quickly. Give the non-competitive player a parallel act with its own visible artefact.`,
      follow:`How do you keep the comparison about skill when time and money also buy power?`,
      red:`Puts everyone on one global leaderboard and calls it fair.` },
    { q:`How do you test a social game?`,
      a:`With real groups, not individuals. Watch what players say about each other after the session, not during it. Observe a returning player who fell behind. A solo test of a social game measures the tutorial and nothing else.`,
      follow:`You can only get four testers in a room. What can you still learn?`,
      red:`Runs solo sessions and infers the group experience from them.` }
  ],
  senior:[
    { q:`Toxicity is rising and new-player retention is falling. Where do you start?`,
      a:`Look at which acts the systems reward and whether any of them require punishing another player. Look for places where strangers are forced together with high stakes and no exit. Change incentives and matching before building a reporting pipeline, because moderation manages a symptom the design keeps producing.`,
      follow:`Moderation tooling or design change first, and why?`,
      red:`Treats it purely as a moderation problem with no design cause.` },
    { q:`Social systems generate content you never made. How do you plan for that?`,
      a:`Name the artefacts you want players to produce: stories, rivalries, guides, clips. Design the acts that produce them and leave the record somewhere others will find it. Then budget the community and moderation cost, because that content arrives with its own liabilities.`,
      follow:`What is the cost side you have to accept when you do this?`,
      red:`Designs the social layer around the highest spenders and treats everyone else as a funnel.` }
  ] });

INTERVIEW('feature-vs-experience',{
  junior:[
    { q:`Someone asks for crafting. What do you ask back?`,
      a:`What should the player do differently, stated as something you could see in a playtest. Then what experience that behaviour creates, then what system produces the situation, then the smallest mechanic that implements it. The word crafting comes last, if it survives.`,
      follow:`They answer that players should feel immersed. Is that a behaviour?`,
      red:`Starts scoping a crafting system on the spot.` },
    { q:`Give me the ladder in order, and say why the direction matters.`,
      a:`Behaviour, experience, system, mechanic, feature. Run in reverse it is feature thinking, which justifies after the fact and always concludes that the original idea was right. Climbing first is what exposes the cheaper answer.`,
      follow:`Which rung do people skip most often?`,
      red:`Recites the rungs and then treats the ladder as a documentation template.` },
    { q:`What makes a behaviour goal observable?`,
      a:`You can watch it happen. The player prepares before entering, changes loadout between attempts, asks a teammate for something, backtracks to a shop. Feelings are not observable, so a goal written as a feeling cannot be passed or failed.`,
      follow:`Rewrite "players feel powerful" as a behaviour.`,
      red:`Writes goals like immersed, engaged or invested and calls them measurable.` }
  ],
  mid:[
    { q:`The roadmap is a list of nouns. What do you do about it?`,
      a:`Demand a behaviour and an observable signal for each item, then re-derive the smallest mechanic. Expect a meaningful share to collapse into systems that already exist. Present the recovered scope rather than the criticism, because the saving is what gets the process adopted.`,
      follow:`A noun survives the ladder and is still expensive. Then what?`,
      red:`Rejects the roadmap without offering the ladder or any alternative.` },
    { q:`Genre expectation says the game needs an inventory screen. The ladder says no. What do you do?`,
      a:`Name the trade openly: recognition against scope. Expectation is a real cost, so this is a decision rather than an error. Often a minimal version buys the recognition without the system, and you test whether the expectation is real for your specific player rather than for the genre.`,
      follow:`How would you test whether that expectation is real for your player?`,
      red:`Builds the full system because every game in the genre has one.` },
    { q:`How do you stop yourself writing the behaviour to justify the feature you already wanted?`,
      a:`Write the behaviour before naming the feature. Have someone else generate alternative mechanics for it. Check whether any cheaper mechanic produces the same behaviour. If no alternative was ever considered, the ladder was theatre and you should say so.`,
      follow:`Give a case where the ladder actually changed your mind.`,
      red:`Claims the ladder has always confirmed the original idea.` }
  ],
  senior:[
    { q:`AI makes features cheap to propose and to build. What breaks?`,
      a:`The rejection mechanism. Cost used to do the filtering quietly and now it does not. A behaviour goal with an observable signal becomes the only gate left, and without it the game gets bigger and less clear at the same speed. Volume is not the win it looks like.`,
      follow:`How do you enforce that gate without becoming the bottleneck yourself?`,
      red:`Welcomes the volume and plans to cut it all later, which never happens.` },
    { q:`How do you measure whether a shipped feature worked?`,
      a:`Measure the behaviour, not the usage. Usage tells you the button was pressed. Compare against the signal agreed before the build, and be willing to remove the feature when the behaviour did not appear. Removal is what makes the process credible next time.`,
      follow:`Usage is high and the behaviour is absent. What do you conclude?`,
      red:`Reports engagement numbers as proof of success and moves to the next item.` }
  ] });

INTERVIEW('design-pillars',{
  junior:[
    { q:`What is a design pillar, and how is it different from a value?`,
      a:`Two to four statements about what the game must always do and must never do, each forbidding something concrete. A value like immersive or player-first forbids nothing, so it settles no argument. The test is whether you can name what the pillar costs you.`,
      follow:`Take one pillar and tell me exactly what it forbids.`,
      red:`Offers "player-first" or "immersive" as a pillar and cannot say what it rules out.` },
    { q:`How would a new team member use the pillars in their first week?`,
      a:`To reject a feature by naming the pillar it violates, without escalating to the director. That is the entire purpose. If they cannot do that, the set is decoration and the director is still the bottleneck they were meant to remove.`,
      follow:`They name a pillar and a senior disagrees. What happens next?`,
      red:`Says pillars are for the pitch deck and the marketing team.` },
    { q:`Why do non-goals matter as much as the pillars?`,
      a:`They name the adjacent experiences you refuse and the features you will not build. That is the first line of scope control and the fastest way to close a well-meaning addition without a meeting.`,
      follow:`Give a non-goal you have used and the request it killed.`,
      red:`Has no non-goals because the team wants to keep its options open.` }
  ],
  mid:[
    { q:`The pillars contradict the mechanics. What happens, and what do you do?`,
      a:`The team learns to ignore them, which is worse than having none because it also teaches them to ignore the next set. Either the mechanics change or the pillar was aspirational and needs rewriting. Test the revised set against five disagreements currently live in the team.`,
      follow:`Which do you change first, and how do you get agreement on it?`,
      red:`Leaves the contradiction in place and calls the pillars aspirational.` },
    { q:`Two pillars conflict on a real decision. Is that a failure of the set?`,
      a:`No, that is the set working. Pillars surface conflicts early and force someone to say which one yields in this case. A set that never conflicts is not describing a real game with real trade-offs.`,
      follow:`Which of your pillars would you sacrifice to keep another?`,
      red:`Claims all the pillars are equally non-negotiable, which means none of them decides anything.` },
    { q:`How do you know a pillar is doing no work?`,
      a:`Review a week of decisions and ask which pillar decided each one. The pillar that never appears is a slogan. Also check whether any feature at all could be justified by it, because a pillar that justifies everything forbids nothing.`,
      follow:`You find two doing no work. Do you cut them or rewrite them?`,
      red:`Adds more pillars to cover the gaps the existing ones left.` }
  ],
  senior:[
    { q:`Give me a process for writing pillars that survive contact with a team.`,
      a:`Derive candidates from the fantasy and the core experience. Write what each one forbids. Add the non-goals. Then test the set against five arguments the team is having right now, and rewrite until it resolves them. Publish only after that, and change it afterwards only with evidence.`,
      follow:`How do you handle a legitimate change two years in?`,
      red:`Runs a workshop, publishes the output, and never tests it against a real disagreement.` },
    { q:`How do pillars interact with a publisher or platform mandate?`,
      a:`They are the written record of what the game is, so an external ask gets answered as a trade against a named pillar rather than as a yes or a no. That keeps the conversation about consequences and gives the other side an honest price instead of resistance.`,
      follow:`The mandate breaks a pillar and is not negotiable. What do you do?`,
      red:`Quietly amends the pillars to accommodate the mandate and tells nobody.` }
  ] });

INTERVIEW('decisions',{
  junior:[
    { q:`What makes a decision meaningful?`,
      a:`The options have to be genuinely different, the outcome uncertain, and the player has to care. Sid Meier's framing is a game as a series of interesting decisions. Add two working tests: the right answer changes with the situation, and different players choose differently.`,
      follow:`Take a decision from a game you know and state its trade-off in one sentence.`,
      red:`Calls any choice a decision, including options that differ only in flavour.` },
    { q:`You balance a set of options so they are all equally strong. Why is that a problem?`,
      a:`Equalising removes situational preference, which is the reason to think at all. What you want is each option winning somewhere specific and losing somewhere else. Equal power with no situational edge turns a decision into a coin flip nobody enjoys.`,
      follow:`How would you make one option best in a specific situation without making it best overall?`,
      red:`Treats equal pick rates across options as the goal of balance.` },
    { q:`How much information should the player have when deciding?`,
      a:`Enough to reason, not enough to be certain. Too much and the choice becomes arithmetic. Too little and it is a guess, and a guess teaches nothing. A decision the player cannot understand is not a decision, however dramatic it looks.`,
      follow:`Where would you deliberately withhold information?`,
      red:`Hides the trade-off to create tension and describes that as depth.` }
  ],
  mid:[
    { q:`Players always pick the same option. Walk me through the investigation.`,
      a:`Log choices per player and per situation and compute the variance. Then separate three causes: one option dominates numerically, the information needed to prefer another is missing, or the situations never actually differ. Each has a different smallest fix, so identify which before touching numbers.`,
      follow:`Variance is high across players and zero within each player. What does that mean?`,
      red:`Buffs the unpopular options by a flat percentage and re-ships.` },
    { q:`How do you measure decision density, and what do you do with the number?`,
      a:`Count decisions per minute from observation, not from the design document. Compare against the intended pace and against what the player's attention can carry. Density raises engagement and fatigue at the same time, so the target depends on the session shape.`,
      follow:`Density is right and players still describe the game as passive. What now?`,
      red:`Counts button presses as decisions and reports a large number.` },
    { q:`What does hesitation tell you in a playtest?`,
      a:`It is the visible sign of a real trade-off. The pattern to look for is hesitate, commit, then look to see whether it worked. Players who choose without looking are not having a decision, whatever the design document says they are having.`,
      follow:`Players hesitate and then cannot explain why afterwards. Good or bad?`,
      red:`Reads every hesitation as confusion and removes the choice.` }
  ],
  senior:[
    { q:`A system has depth on paper and collapses after ten hours of community play. Why does that keep happening?`,
      a:`Designers test at their own horizon and the community optimises collectively, faster, and with shared notes. You need dominance search before ship, by simulation or adversarial play, and levers you can tune after launch without a rebuild. Assume the optimum will be found in days.`,
      follow:`What would you have built into the system up front to survive that?`,
      red:`Blames players for optimising the fun out of the game.` },
    { q:`How do you use simulation to find dominant strategies without over-trusting it?`,
      a:`Use it to find what is provably never right and to narrow where you look, then verify with real play. A simulation assumes optimal play and real players are not optimal, so it tells you about the ceiling rather than about the experience.`,
      follow:`The simulation says an option is fine and players never take it. What do you conclude?`,
      red:`Ships the balance the simulation produced without anyone playing it.` }
  ] });

INTERVIEW('risk-reward',{
  junior:[
    { q:`Why is risk and reward such a reliable decision engine?`,
      a:`It manufactures tension without new content, it personalises play because risk appetite differs, and it rewards learning to read the odds. The same encounter becomes several encounters depending on what the player wagers.`,
      follow:`Give an example from a game you know and name the cost of failure in it.`,
      red:`Describes a random chance with no judgement or mitigation available to the player.` },
    { q:`How does a player learn the odds without a percentage on screen?`,
      a:`Telegraphs they can read, prior experience with the same enemy or situation, the visible state of their own resources, and consequences that stay consistent. Making risk legible without a number is the actual design work, and a number is usually the lazy version of it.`,
      follow:`What happens when the odds are genuinely unknowable to the player?`,
      red:`Puts a percentage on the screen as the only way to make risk readable.` },
    { q:`Everyone takes the risky option. What does that tell you?`,
      a:`It is not a risk. Either the expected value favours it outright or the failure cost is too small to matter. Check both, then check whether the safe option is ever correct in any situation you actually ship.`,
      follow:`Nobody takes it. Same question.`,
      red:`Says the players are simply being aggressive and leaves the numbers alone.` }
  ],
  mid:[
    { q:`You reward risk with more resources and the run snowballs. What is the problem?`,
      a:`The reward removes future decisions by making everything affordable. Either the sinks grow with the source, or the reward becomes a new situation rather than more of what the player already had. Snowballing is a decision problem before it is a balance problem.`,
      follow:`How would you reward risk without snowballing?`,
      red:`Reduces the reward amount and leaves the structure exactly as it was.` },
    { q:`How do you make risk legible when the outcome depends on player skill?`,
      a:`Show the demand rather than a probability. A telegraph the player can read, a window they can see closing, a state that signals how close failure is. Skill risk is legible when the player can feel their own margin shrinking.`,
      follow:`Players consistently misjudge it. Where do you look first?`,
      red:`Adds a difficulty rating label to the encounter and calls it communicated.` },
    { q:`Loss-averse players avoid your risk points entirely. Is that a failure?`,
      a:`Not by itself. Risk appetite is one of the few places expression is free, and uniform behaviour is the warning sign rather than varied behaviour. The real failure is when avoiding the risk is strictly better, because then the safe path is the optimum and there was never a choice.`,
      follow:`How do you price the safe path so it stays viable without dominating?`,
      red:`Forces every player through the risk and removes the safe route entirely.` }
  ],
  senior:[
    { q:`Balance a risk point for a novice and an expert at the same time.`,
      a:`Their expected values differ, so a point tuned for one is broken for the other. Prefer risk whose demand scales with skill over risk whose probability is fixed, or let the player choose the stake. Then verify with logs from both groups rather than with one curve.`,
      follow:`You only have expert data. What do you refuse to conclude from it?`,
      red:`Tunes on the team's own play, which is expert play with hidden knowledge attached.` },
    { q:`How do risk structures interact with monetisation?`,
      a:`When a purchase removes the risk, the decision disappears and the tension goes with it. If failure costs can be bought away, the store is running the design economy. That is a policy decision and it should be taken openly rather than discovered in the balance data.`,
      follow:`The business wants a revive item. How do you protect the risk?`,
      red:`Accepts the item and rebalances the encounter to be harder for everyone who does not buy it.` }
  ] });

INTERVIEW('agency-and-emergence',{
  junior:[
    { q:`Define agency and emergence, and say how they differ.`,
      a:`Agency is the player perceiving that their choice caused the outcome and that another choice would have caused something else. Emergence is behaviour arising from rules interacting, which nobody authored individually. Perceived agency is what counts, because real branches nobody notices produce no feeling at all.`,
      follow:`Give an example of a game with real branches and no felt agency.`,
      red:`Uses the two words interchangeably and treats both as "player freedom".` },
    { q:`Why is perceived agency the thing you design for?`,
      a:`The player only has what they perceive. A linear path with a visible consequence feels authored by them. A branching one whose consequences land off screen does not. The lever is usually feedback timing rather than structure.`,
      follow:`How soon does the consequence have to become visible?`,
      red:`Counts endings or branch points as a measure of agency.` },
    { q:`Players say it did not matter what they picked. What do you check first?`,
      a:`Whether the consequence is visible at all, whether it arrives so late the choice has been forgotten, and whether the options actually diverge in play. Add a nearer signal before adding another branch, because the branch is the expensive fix.`,
      follow:`The consequence is real and lands an hour later. What do you add?`,
      red:`Adds more dialogue options to the same converging conversation.` }
  ],
  mid:[
    { q:`How do you engineer for emergence rather than hoping for it?`,
      a:`Map which systems read and write which state. Find the isolated islands. Connect two of them deliberately with one rule and prototype it. Emergence comes from shared state, not from the number of systems, so adding a sealed system adds nothing.`,
      follow:`You connect two systems and nothing interesting happens. What went wrong?`,
      red:`Adds a system and expects emergence as a property of its existence.` },
    { q:`A player finds a strategy you did not plan. Celebrate, tune or remove?`,
      a:`Default to celebrate. Judge it against the fantasy rather than against your plan. Tune when it removes other options, remove when it breaks the promise or the economy. Then say publicly which you did and why, because silence on this teaches players not to experiment.`,
      follow:`It is delightful and it trivialises the third act. What do you do?`,
      red:`Patches out anything unplanned on the grounds that it was not designed.` },
    { q:`Sealing systems from each other makes balance easier. What does it cost?`,
      a:`It kills emergence and forces you to buy variety with content instead. Each sealed system then needs its own content to stay interesting, which multiplies scope in exactly the place teams cannot afford it.`,
      follow:`Where would you accept a wall between systems?`,
      red:`Seals systems for QA convenience and adds levels to compensate for the lost variety.` }
  ],
  senior:[
    { q:`How do you steward emergence in a live game without breaking player trust?`,
      a:`Publish the intent. Distinguish exploits from strategies openly and consistently. Change rules rather than quietly disabling behaviour. Give warning before removal. Players accept changes they can predict and resent ones that arrive unexplained.`,
      follow:`You have to remove a beloved strategy for economy reasons. How do you do it?`,
      red:`Silently patches it and denies anything changed.` },
    { q:`Emergence adds QA and balance risk. How do you sell it to production?`,
      a:`Cost it against the content it replaces: fewer assets, more tuning, more testing time. Propose the cheapest systemic slice that proves the value, with the risk named up front and a fallback defined. Never present it as free content.`,
      follow:`The slice comes back ambiguous. Do you commit or not?`,
      red:`Promises emergent variety at no extra QA cost and discovers otherwise at certification.` }
  ] });

INTERVIEW('challenge-failure-recovery',{
  junior:[
    { q:`Why are challenge, failure and recovery treated as one topic?`,
      a:`Because changing one without the others produces the familiar complaints. Challenge is a task with uncertain success. Failure is the outcome when it is not met. Recovery is how fast, at what cost and with what new information the player gets back to trying. Together they decide whether struggle feels productive.`,
      follow:`Which of the three do teams get wrong most often?`,
      red:`Treats failure handling as something a difficulty setting solves.` },
    { q:`What makes a good failure?`,
      a:`The player knows why within a couple of seconds, wants to try again immediately, and has a different idea about how. If they cannot state what went wrong in one sentence, the failure taught nothing and the next attempt is a repeat rather than an experiment.`,
      follow:`How do you communicate the cause inside that window?`,
      red:`Adds a death screen with a rotating tip.` },
    { q:`How long should the gap between failure and the next attempt be?`,
      a:`As short as whatever sits in between can justify. Cut anything that carries no information and no meaning. Long recovery with no lesson is precisely where mid-skill players stop playing, and every second of it is paid by the players you most wanted to keep.`,
      follow:`Your retry sequence includes a twenty second cutscene. What do you do?`,
      red:`Keeps the cinematic because it is good and the team is proud of it.` }
  ],
  mid:[
    { q:`Players retry the same challenge identically many times. Diagnose it.`,
      a:`The lesson is not landing. Either the cause of failure is not communicated, or the player has no second approach available to try. Check the telegraphs first, then check whether the game ever taught an alternative. Repetition without variation is a teaching failure, not stubbornness.`,
      follow:`They know exactly why and still repeat the same attempt. What is happening then?`,
      red:`Reduces the difficulty and declares the problem solved.` },
    { q:`What is failing forward, and when does it stop working?`,
      a:`Failure produces a new situation instead of a reset, so the attempt still counts for something. It stops working when failing is as good as succeeding, because then the stakes are gone and the tension goes with them.`,
      follow:`How do you keep the cost real while still failing forward?`,
      red:`Makes failure costless and describes it as player friendly.` },
    { q:`Testers call a section unfair. How do you find out what they actually mean?`,
      a:`Classify before touching numbers: unclear rules, insufficient feedback, execution demand, information overload, randomness, poor checkpointing, excessive punishment. Each one has a different fix and most of them are not difficulty at all.`,
      follow:`It turns out to be unreadable telegraphs. What is the fix, and what is the wrong fix?`,
      red:`Makes the section easier, which leaves the unreadable telegraph in place for everyone.` }
  ],
  senior:[
    { q:`How do you design the failure experience for new and expert players at once?`,
      a:`Separate the lesson from the punishment. Keep the lesson constant and let the cost vary through player-chosen stakes, routes and tools before you reach for menu settings. Then measure retry rate and change of approach separately for each group.`,
      follow:`Your community treats assist options as cheating. How do you handle that?`,
      red:`Ships one curve tuned by the team and bolts on an easy mode a month before launch.` },
    { q:`Where do mid-skill players quit, and how would you find that point in your own game?`,
      a:`At the place where failure cost exceeds the lesson: long recovery, no new information, no visible alternative. Find it by counting failures before abandonment per section, then going and watching those sections in person rather than trusting the ranking.`,
      follow:`The data points at one boss. You watch it and nothing looks wrong. What next?`,
      red:`Assumes the churn must be at whatever section the difficulty chart says is hardest.` }
  ] });

INTERVIEW('skill-and-mastery',{
  junior:[
    { q:`What skills does your game actually demand? Name them.`,
      a:`Decompose rather than saying "getting better at the game". Execution, timing, reading, planning, resource judgement, spatial reasoning, memory. Then say which one the fantasy implies should be central, and whether the game ever isolates it for teaching.`,
      follow:`Which skill does your game demand but never teach?`,
      red:`Answers that players just get better with practice, with no decomposition at all.` },
    { q:`What is a skill atom, and why chain them?`,
      a:`Dan Cook's framing: each atom gets taught, exercised, then combined with another. Chaining is how a game builds fluency instead of dumping demands at once. A skill required before it has been isolated is a design bug, and it shows up as deaths in the introduction.`,
      follow:`Where in a game you know is an atom skipped?`,
      red:`Equates skill atoms with tutorial popups.` },
    { q:`How is stat growth different from skill growth?`,
      a:`Stats change the numbers, skill changes what the player can do. A player whose character is stronger and who plays identically has mastered nothing. The distinction decides what progression is for, and confusing them is how a game becomes easier and less interesting at once.`,
      follow:`Your progression is entirely stats. How would you add skill growth?`,
      red:`Says the player gets better because their character gets stronger.` }
  ],
  mid:[
    { q:`Players plateau early and call the game grindy. Diagnose it.`,
      a:`Check whether the ceiling is low, whether the game shows improvement back to the player, and whether any new demand arrives after the first few hours. Grind language usually means there is no skill left to grow and no new decision to make, not that the numbers are too slow.`,
      follow:`The ceiling is high and they still plateau. What is missing?`,
      red:`Adds more levels of the same demand and calls it endgame content.` },
    { q:`How do you make judgement skill perceivable?`,
      a:`Show the outcomes of better reads: fewer resources spent, cleaner routes, earlier recognition of a situation. Compare the player against their own earlier runs rather than against an abstract number. And let veterans demonstrate, because watching is how novices learn what to aim at.`,
      follow:`Novices cannot see what the veteran is doing differently. What do you change?`,
      red:`Adds a numeric rating and calls it mastery feedback.` },
    { q:`You record a veteran and a novice on the same challenge. What are you looking for?`,
      a:`Concrete differences: where they look, what they do first, what they skip, what they never attempt. That difference is your actual skill ceiling regardless of what the design document claims it is.`,
      follow:`The two runs look nearly identical. What does that tell you?`,
      red:`Measures only completion time and draws conclusions about skill from it.` }
  ],
  senior:[
    { q:`Execution skill excludes some players. Judgement skill includes more and is harder to feel. How do you choose?`,
      a:`Decide from the player model and the fantasy, then design the perception problem deliberately. A judgement game needs strong mastery displays because the improvement is otherwise invisible. Layering both, with execution optional, is possible but doubles the teaching work.`,
      follow:`You choose judgement. What are the three things you must build because of it?`,
      red:`Picks execution by default because it is easier to feel, and never asks who that excludes.` },
    { q:`How do you keep a skill curve honest when the whole team are experts?`,
      a:`Never tune only on internal play. Keep a rotating pool of fresh testers and record first attempts as the ground truth. Track where team knowledge is being assumed and treat every one of those as a teaching gap rather than a player failing.`,
      follow:`You have no external testers this milestone. What do you do instead?`,
      red:`Tunes on team playthroughs and ships a first hour that nobody outside the studio survives.` }
  ] });

INTERVIEW('mechanics-and-rules',{
  junior:[
    { q:`What is a mechanic, and how do you judge whether one is any good?`,
      a:`A verb the player can perform plus the rules that give it cost, effect and interaction. Judge it by the decision it creates that did not exist without it. A mechanic that touches no other mechanic is a mini-game sharing a menu with your game.`,
      follow:`Pick one from your last project and tell me the decision it creates.`,
      red:`Lists mechanics as features with no decision attached to any of them.` },
    { q:`Explain MDA and why it matters to your day job.`,
      a:`Mechanics are what the designer writes, dynamics are what happens at runtime, aesthetics are what the player feels. You only control the first and the player only meets the last two. That gap is the reason design is tested rather than reasoned to a conclusion.`,
      follow:`Give a case where a mechanic produced a dynamic you did not intend.`,
      red:`Recites the acronym with no consequence for how they actually work.` },
    { q:`Rules are cheap to write and expensive to teach. What follows from that?`,
      a:`Every rule spends the player's cognitive budget, and every player pays whether or not they reach the payoff. So the useful ranking is decisions created per unit of rule cost, and the bottom of that list is the cut list.`,
      follow:`How do you decide which rule to cut first?`,
      red:`Treats rule count as a measure of depth.` }
  ],
  mid:[
    { q:`Forty mechanics in the document and nobody can name the three that matter. What do you do?`,
      a:`Build the inventory: the decision each creates, what it interacts with, and the rules the player must hold to use it. Rank by decisions per rule. Then present the bottom of the list as a cut list with what would be lost named for each, rather than as a complaint.`,
      follow:`The director loves one item on the cut list. How do you make the case?`,
      red:`Keeps everything and proposes a longer tutorial to cover it.` },
    { q:`Designing mechanics in isolation and integrating them later. Why is that a trap?`,
      a:`Integration is where the design actually happens. A mechanic tested alone tells you about the mechanic and nothing about the game. Prototype the top few together, because the interactions are the part you cannot predict from the rules.`,
      follow:`Two mechanics are good alone and dull together. Where do you look?`,
      red:`Builds each mechanic as a separate feature and schedules integration for the end of production.` },
    { q:`How do you teach a mechanic without a text box?`,
      a:`A situation where it is the obvious solution, a safe place to fail while learning it, then a demand for it under pressure. Then check whether players reach for it unprompted later, because that is the only evidence the teaching worked.`,
      follow:`They use it in the tutorial and never again. What happened?`,
      red:`Writes a tooltip and considers the teaching complete.` }
  ],
  senior:[
    { q:`You inherit a design with a mechanic that exists because the genre has it. How do you handle it?`,
      a:`Climb to the behaviour it was meant to produce and check whether anything else in the game already produces it. Cost the teaching. Then present removal with what is lost, including the recognition players expect from the genre, because that expectation is a real cost and not a superstition.`,
      follow:`The behaviour is real but the mechanic is the wrong shape. What do you propose?`,
      red:`Removes it on principle without checking what players expect from the genre.` },
    { q:`AI can produce rules at speed. What changes about the discipline?`,
      a:`The bottleneck moves from writing rules to judging them. You need a decision-per-rule filter and a cheap way to test integration, because implementation cost is no longer doing the filtering for you. The first thing to break under the extra volume is the teaching budget.`,
      follow:`How do you use a model in the inventory step without it defending every rule it wrote?`,
      red:`Welcomes the volume and treats generated rules as free additions.` }
  ] });

INTERVIEW('depth-vs-complexity',{
  junior:[
    { q:`Define depth and complexity, then give an example of high depth from low complexity.`,
      a:`Complexity is what the player must learn. Depth is what those rules let them do. Elegance is depth per unit of complexity, and chess is the standard example. Say clearly that the vocabulary has no agreed metric and is used as a lens rather than a score.`,
      follow:`Now give me the reverse: high complexity and low depth.`,
      red:`Treats hard to learn as equivalent to deep.` },
    { q:`Why is complexity paid up front and depth only collected later?`,
      a:`Every player pays the learning cost, including the ones who leave in the first hour. Only players who stay reach the depth. Front-loading complexity therefore churns exactly the people you were hoping would eventually enjoy the deep part.`,
      follow:`How would you measure time to first meaningful decision?`,
      red:`Argues that serious players will invest the time to learn it.` },
    { q:`What is the test for whether a rule earns its place?`,
      a:`Ask which decision disappears if you delete it. None means delete. If it enables an interaction with another rule, keep it. If it only adds a case to handle, merge it into the rule it is patching.`,
      follow:`Two rules create the same decision. What do you do?`,
      red:`Keeps rules on the grounds that they are standard for the genre.` }
  ],
  mid:[
    { q:`Balance is off and someone proposes an exception rule. What is your position?`,
      a:`An exception charges every player learning cost to fix a problem in one place. Prefer changing a number or the underlying rule. Exceptions accumulate into a ruleset nobody can explain, and each one makes the next one easier to justify.`,
      follow:`Only the exception can fix it in the time available. What do you do?`,
      red:`Adds the exception and records the debt nowhere.` },
    { q:`How do you run a rule audit, and what do you expect to find?`,
      a:`List the rules and classify each as creating a situational decision, enabling an interaction, or adding load only. Delete the last group in a prototype and play it. The finding is usually that most players do not notice, which is what makes the cut safe.`,
      follow:`Players do notice one of them. What does that tell you?`,
      red:`Runs the audit on paper and never removes anything from the build.` },
    { q:`AI makes adding rules nearly free. What is the failure mode?`,
      a:`Complexity inflation as the default state, because implementation cost used to be the thing pushing back. The replacement gate is decisions created per rule plus an explicit teaching budget that someone owns and defends.`,
      follow:`How do you keep that budget visible to a team that can generate rules hourly?`,
      red:`Measures productivity by systems shipped per milestone.` }
  ],
  senior:[
    { q:`Your tutorial is long and the endgame is one build. What does that pair of symptoms mean?`,
      a:`You bought complexity and not depth. High learning cost, low situational variance. Depth comes from making the existing rules interact, not from adding more of them, and the tutorial shortens by cutting the rules that create no decision.`,
      follow:`Which do you fix first, and why in that order?`,
      red:`Shortens the tutorial and leaves the single dominant build untouched.` },
    { q:`How much complexity will your player tolerate, and how do you know?`,
      a:`It comes from the player model and from observed behaviour. Measure time to first meaningful decision, and ask new players to explain the rules after fifteen minutes. Whatever they get wrong is either too complex or badly taught, and you now know which rules to work on.`,
      follow:`Veterans want more and newcomers are drowning. How do you serve both?`,
      red:`Sets the level from what the development team personally enjoys.` }
  ] });

INTERVIEW('systemic-design',{
  junior:[
    { q:`What makes a set of mechanics a system rather than a menu of mini-games?`,
      a:`Shared state. They read and write the same things, so they interact without being told to. Fire spreads on grass, enemies fear fire, the player uses that to herd them. If nothing is shared, you have features that happen to be in the same build.`,
      follow:`Name a game whose systems are sealed and say what that costs it.`,
      red:`Calls a group of features a system because they appear on the same screen.` },
    { q:`Why is interaction the only scalable source of new situations?`,
      a:`A finite set of rules produces an unbounded set of combinations, while content is linear in cost. Systemic depth is cheap in assets and expensive in judgement, so you are trading production budget for tuning time.`,
      follow:`What is the cost you are accepting when you make that trade?`,
      red:`Says more systems means more depth, with no mention of shared state.` },
    { q:`How would you find where two systems could touch?`,
      a:`Write down what each system reads and what it writes. Look for shared state, or state one could expose cheaply. Nodes with zero edges on that map are the opportunities, and they are usually the systems that were built by different people.`,
      follow:`Nothing is shared at all. How do you create a connection honestly?`,
      red:`Proposes a thematic link with no state behind it.` }
  ],
  mid:[
    { q:`You add an interaction and players never notice. What went wrong?`,
      a:`An interaction that is not surfaced does not exist for the player. Check the feedback, check whether the situation ever arises in normal play, and check whether any level puts both systems in the same room. Usually it is the third one.`,
      follow:`The situation arises and they still miss it. What do you add?`,
      red:`Documents the interaction in a wiki and considers it delivered.` },
    { q:`How do you handle a degenerate interaction without sealing the systems?`,
      a:`Prevent it with a rule inside the fiction: a cost, a counter, a resource limit, a consequence. Walls teach players that the systems are decorative, and once they learn that they stop experimenting everywhere else too.`,
      follow:`The degenerate case is also the most fun thing in the game. Then what?`,
      red:`Blocks the combination with an invisible restriction and no explanation.` },
    { q:`Systemic design is cheap in content and expensive in tuning. How do you plan for that?`,
      a:`Move budget from asset production into iteration and testing time. The schedule shape differs: more playtesting, certainty arriving later. Say that to production at the start rather than at the milestone where certainty was expected.`,
      follow:`Production wants the same certainty at the same milestone as a content-led game. What do you offer?`,
      red:`Promises fewer assets and the same predictability at once.` }
  ],
  senior:[
    { q:`Make the case for systemic over content-led to a sceptical producer.`,
      a:`Cost the alternative in assets and pipeline. Name the risk honestly: tuning, QA surface, certainty arriving later. Propose a slice that proves one interaction produces a real decision, and define in advance what a failed slice means for the plan.`,
      follow:`The slice proves it and the team has no systems experience. What do you do?`,
      red:`Argues systemic design is better on principle, with no costing attached.` },
    { q:`How do you keep a systemic game balanced after launch?`,
      a:`Tune the shared state rather than individual instances. Keep the levers few and documented. Watch telemetry for runaway loops rather than for single outliers. Change rules publicly, because instance-by-instance balancing in a systemic game never converges and the community can see it not converging.`,
      follow:`Which lever would you never expose to live tuning?`,
      red:`Patches individual items one at a time and is surprised when the problem moves.` }
  ] });

INTERVIEW('economy-and-resources',{
  junior:[
    { q:`Sources, sinks and converters. Explain with a real economy.`,
      a:`Where a resource enters, where it leaves, and how it trades for another. Health enters from pickups and leaves through mistakes. Currency enters from encounters and leaves through upgrades. Healthy means scarce enough to force a trade-off and abundant enough that the player can act at all.`,
      follow:`Which of the three is weakest in most games you have played?`,
      red:`Describes only the sources and never asks where the resource leaves.` },
    { q:`When is a resource actually just a progress bar?`,
      a:`When there is only one thing to spend it on. Without a spending decision it is a measurement with extra steps, and players treat it as one. The fix is a second worthwhile use, not a second currency.`,
      follow:`How would you turn one back into a real resource?`,
      red:`Adds another currency instead of another use.` },
    { q:`Why are multiple currencies usually a bad trade?`,
      a:`They multiply cognitive load and rarely multiply decisions. A currency added to gate a system is a gate wearing an economy's clothes, and the player has to learn an exchange rate that buys them nothing.`,
      follow:`When is a second currency genuinely justified?`,
      red:`Adds one currency per system because it makes tuning more convenient.` }
  ],
  mid:[
    { q:`By hour twenty everything is affordable. What happened, and what do you do?`,
      a:`Sources outgrew sinks and the small imbalance compounded. Find the crossing point in a simulation, then add or scale a sink that stays relevant late. Report which decisions collapsed rather than only which number is wrong, because the decisions are the damage.`,
      follow:`You cannot add a sink for business reasons. What else is available?`,
      red:`Cuts reward rates globally and breaks the early game to fix the late one.` },
    { q:`How do you simulate an economy, and what do you refuse to conclude from it?`,
      a:`Model sources with rates, sinks with costs and converters, then run cautious, average and aggressive spenders across the intended playtime. It tells you where the curves cross. It does not tell you how scarcity feels, and it must be checked against telemetry wherever you have any.`,
      follow:`Simulation and telemetry disagree. Which do you trust?`,
      red:`Models optimal play and presents it as the player experience.` },
    { q:`The monetisation currency is bleeding into the design economy. What is the risk?`,
      a:`The store starts setting the scarcity. Decisions that depended on that scarcity collapse, and players begin reading every cost as a sales pitch even where it is not. Keep the boundary explicit and decide it as policy rather than discovering it in the balance data.`,
      follow:`Where would you accept overlap between the two?`,
      red:`Merges the two economies because it simplifies the interface.` }
  ],
  senior:[
    { q:`Design a resource system for a twenty hour campaign with no live operations.`,
      a:`Start from the decisions you want at hour one, ten and twenty. Choose the smallest set of resources that carries them. Place sinks that stay relevant across the whole curve rather than only early. Simulate, then playtest with per-player balance logging and compare.`,
      follow:`Your simulation is clean and testers hoard everything. Where do you look?`,
      red:`Designs the currencies first and derives the decisions from them afterwards.` },
    { q:`How do you tell an economy problem from a content problem?`,
      a:`If the decisions have collapsed while the content is still unconsumed, it is the economy. If balances look correct and players are bored, it is content or system. The quickest evidence is asking players what they are saving for and whether they can name a sink at all.`,
      follow:`Both look plausible. What do you measure this week?`,
      red:`Retunes numbers every time players report boredom.` }
  ] });

INTERVIEW('progression',{
  junior:[
    { q:`What is wrong with "number goes up" as a progression design?`,
      a:`A bigger number changes the outcome, not what the player considers doing. The game gets easier and less interesting at the same time. The question to ask of every step is what new capability, decision, expression or experience it unlocks.`,
      follow:`Turn a flat damage upgrade into something that changes a decision.`,
      red:`Defends stat growth as a sense of progress without naming a new decision.` },
    { q:`Name the types of progression.`,
      a:`Power, horizontal, mastery, unlock and narrative. They schedule anticipation differently and fail differently. Power is legible and hollow. Horizontal is rich and hard to feel, which is why it needs more communication work than it usually gets.`,
      follow:`Which type is hardest to communicate, and what do you do about it?`,
      red:`Treats progression as levelling and nothing else.` },
    { q:`How do you know the next step is doing its job?`,
      a:`The player can see it and wants it before they reach it. Anticipation needs visibility plus legible value. A step nobody can describe in advance is pulling no one, however large the reward turns out to be.`,
      follow:`How would you make a horizontal unlock desirable before it is owned?`,
      red:`Hides everything to preserve surprise and then wonders why nobody is motivated.` }
  ],
  mid:[
    { q:`Players say they are grinding to get to the good part. Diagnose it.`,
      a:`The decision-rich systems are behind hours of the thin ones. Map first contact with each major system against the churn windows you actually observe, then reorder so the interesting systems arrive before players leave. Ordering is usually cheaper than rebalancing.`,
      follow:`You cannot reorder without breaking the difficulty curve. What then?`,
      red:`Speeds up the grind and leaves the ordering exactly as it was.` },
    { q:`A progression step makes a previous decision dominant. Why does that matter?`,
      a:`Progression that removes decisions makes the game shallower as it goes on, which is the opposite of what it is for. Power steps do this quietly. Classify every step and record what it closes as well as what it opens.`,
      follow:`Give an example you have seen of an upgrade that closed a decision.`,
      red:`Only checks whether each step feels rewarding at the moment it lands.` },
    { q:`Someone copies a reward schedule from a successful game. What goes wrong?`,
      a:`That schedule was tuned to that game's loop, session length and content depletion. Dropped into a different loop it either exhausts your content early or reads as withholding. Derive the curve from your own depletion rate and session shape.`,
      follow:`How would you derive one from scratch?`,
      red:`Copies the curve from a hit and adjusts the constants until it looks reasonable.` }
  ],
  senior:[
    { q:`Your game needs to hold players for a year. How do you plan progression?`,
      a:`Choose the renewable engines first, because power alone always runs out. Schedule unlocks against content depletion and skill growth rather than against a calendar. Keep decision-rich systems arriving, and build the levers to re-pace after launch, because the first curve will be wrong.`,
      follow:`Which part of that plan do you expect to be wrong, and how will you know?`,
      red:`Plans a long power curve and presents its length as the retention strategy.` },
    { q:`Fast unlocks feel generous and exhaust content. Slow ones feel like a grind. How do you pick a position?`,
      a:`From content depletion rate, session length and the churn windows you have observed. Test both ends with separate cohorts where you can. The position is a business and experience decision together, so make the trade explicit instead of defaulting to the middle.`,
      follow:`You get one cohort only. Which end do you test, and why that one?`,
      red:`Picks the middle because it feels like the safe choice.` }
  ] });

INTERVIEW('difficulty',{
  junior:[
    { q:`Difficulty is not one thing. Break it down.`,
      a:`Ask what exactly is hard: execution, reading, knowledge, information overload, or randomness. Players use the same word for all five and the fixes have nothing in common. Difficulty itself is the relationship between what the game demands and what this player can do right now.`,
      follow:`A player says a fight is too hard. What do you ask next?`,
      red:`Reaches for a global difficulty multiplier before asking anything.` },
    { q:`Explain the difference between hard and fair, and easy and cheap.`,
      a:`Difficulty is felt through clarity. A hard challenge with legible rules feels fair. An easy one with hidden rules feels cheap. Legibility is doing most of the emotional work, which is why unfair and too hard are different complaints.`,
      follow:`Where does legibility usually break down in a fight?`,
      red:`Treats fair as a synonym for easy.` },
    { q:`Why is tuning difficulty on the development team dangerous?`,
      a:`The team are experts carrying hidden knowledge, and their first attempt is not a first attempt. Tuning on them produces a first hour that nobody outside the studio survives, and the team will not be able to see it.`,
      follow:`You only have team data this week. What do you still do with it?`,
      red:`Says the team knows the game best so their calibration is the most accurate available.` }
  ],
  mid:[
    { q:`Testers say a section feels unfair. Walk me through the diagnosis.`,
      a:`Classify before changing numbers: unclear rules, insufficient feedback, execution demand, information overload, randomness, poor checkpointing, excessive punishment, no chance to build mastery. Cite the evidence for each candidate. Propose fixes that do not reduce the challenge before you propose one that does.`,
      follow:`Two causes look equally likely. How do you separate them?`,
      red:`Reduces enemy damage and treats the report as addressed.` },
    { q:`The complaint is "bullet sponge". What is the actual problem?`,
      a:`Health was added instead of demand. The fight got longer without asking anything new, so the player is executing a solved problem repeatedly. Add a new demand or a phase change rather than a bigger pool.`,
      follow:`You need the fight to last longer for pacing reasons. How do you do it?`,
      red:`Raises health until the fight lasts the intended number of seconds.` },
    { q:`Hidden dynamic difficulty: when, and why not?`,
      a:`It keeps players in flow and it undermines earned mastery the moment they detect it, which they do. Prefer player-steered difficulty through optional risk, alternate routes and tools. If you do use hidden adjustment, decide in advance what you say when the community finds it.`,
      follow:`Your community finds the rubber band. What is your response?`,
      red:`Hides the adjustment and denies that it exists.` }
  ],
  senior:[
    { q:`Difficulty settings include more players and fragment the intended experience. How do you decide?`,
      a:`From the player model and the pillars. Prefer in-play steering first, then options that keep the lesson intact while changing the cost. If you do fragment, decide which version the content is tuned and tested against, because the others will silently rot otherwise.`,
      follow:`Which setting do you tune against, and what does that mean for the rest?`,
      red:`Ships three settings as damage multipliers with no separate testing for any of them.` },
    { q:`How do you build a difficulty curve you can defend with evidence?`,
      a:`Draw the intended curve, then overlay observed failure rates per section from real testers. Fix spikes with teaching or telegraphing before reducing demands. Take the skill distribution from your actual testers rather than from an assumption about the audience.`,
      follow:`Your testers all sit above the median player. How do you correct for that?`,
      red:`Plots an intended curve and never overlays a single observed failure rate.` }
  ] });

INTERVIEW('builds-and-loadouts',{
  junior:[
    { q:`What makes build diversity real rather than decorative?`,
      a:`A constraint that forces a choice, whether that is slots, points, mutual exclusion or opportunity cost. Then each build owning a situation the others do not. Without a constraint there is no choice, only accumulation, and accumulation converges.`,
      follow:`Your system has no constraint. What do you add first?`,
      red:`Adds more options and expects diversity to follow from the count.` },
    { q:`What is a trap build, and why is it worse than a weak one?`,
      a:`It looks viable and is not, so the player invests hours and then learns the system was lying. After that they stop trusting any of it and go straight to a guide. Weak but honest is survivable. Dishonest is not.`,
      follow:`How would you find traps before players do?`,
      red:`Leaves trap builds in for the sake of variety.` },
    { q:`Why is balancing builds to equal power the wrong goal?`,
      a:`It removes the reason to choose. What you want is each build correct in some situation and punished in another. Counters and niches, not equalisation, are what keep the choice alive.`,
      follow:`Give me a niche and the situation that should punish it.`,
      red:`Defines balance as equal win rates across everything.` }
  ],
  mid:[
    { q:`One build appears in every guide with a sixty percent pick rate. What do you do?`,
      a:`Find the situation it owns and what ought to punish it. Add a counter or a cost rather than a flat nerf. Then check the content, because if no encounter presents the situations the other builds own, the numbers were never the problem.`,
      follow:`You nerf it and the second-best build takes its place at the same rate. What does that tell you?`,
      red:`Nerfs the top build repeatedly and changes nothing structural.` },
    { q:`How much commitment should a build choice carry?`,
      a:`Hard commitment raises the weight of the decision and punishes experimentation. Free respec raises experimentation and removes the weight. Choose from the player model and the session shape, and consider staged commitment where early steps are reversible and late ones are not.`,
      follow:`Your players experiment less than you hoped despite free respec. Why might that be?`,
      red:`Picks free respec by default because it is friendlier.` },
    { q:`Can a player see what a build will feel like before committing to it?`,
      a:`They need a preview: a trial, a readable description of the decision it changes, or a reversible first step. Without one they choose from a wiki, and at that point the system belongs to the guide writers rather than to you.`,
      follow:`How do you preview a build without giving away the whole game?`,
      red:`Expects players to read stat numbers and infer the play experience from them.` }
  ],
  senior:[
    { q:`Convergence is inevitable. How do you design for the two weeks after launch?`,
      a:`Forecast the strongest combinations before ship and write down the niches you intend. Keep tunable levers out of code. Plan a cadence of counters rather than emergency nerfs, and decide in advance which optimisations you will not chase at all.`,
      follow:`Which do you change: the build, the content that favours it, or the constraint?`,
      red:`Assumes the community will take months to find the optimum.` },
    { q:`How do builds interact with content design?`,
      a:`A build only owns a situation if the content presents that situation. If every encounter rewards the same approach, diversity dies in the level design rather than in the numbers. Audit the content against the niches before touching a single stat.`,
      follow:`Your numbers are clean and pick rates are still skewed. Where do you look?`,
      red:`Treats build balance as a numbers exercise disconnected from encounter design.` }
  ] });

INTERVIEW('content-multiplies',{
  junior:[
    { q:`What does it mean to say content "multiplies" a system, and what does it not do?`,
      a:`Content is instances fed to a system: levels, enemies, items, quests. It multiplies decisions that already exist if the system is good, and just repeats old decisions in new skins if the system is thin. Give an example of a piece of content that created a new situation and one that only reskinned an old one. State the test: write the situation the piece creates in one sentence, and if an existing piece creates the same one, it is redundant.`,
      follow:`What is the smallest example you can point to where content failed to rescue a weak loop?`,
      red:`Says content is "anything the player experiences" with no distinction between multiplying and rescuing, or claims more content always improves a game.` },
    { q:`The game is repetitive and someone proposes five more levels. What do you ask before agreeing?`,
      a:`Whether the loop itself is being voluntarily replayed without new content. If it is not, more levels dilute quality and teach players that content is skippable. Ask what decision the new levels create that existing ones do not, and whether improving the underlying interaction would do more.`,
      follow:`They insist the levels are needed regardless, for reasons outside design. What do you do?`,
      red:`Agrees immediately and starts scoping five levels.` },
    { q:`What is the difference between a loop and an arc, and why budget them differently?`,
      a:`A loop is repeatable and players choose to run it again. An arc, most quests and story beats, is consumed once and never revisited, so it costs more per minute of play. Say you would budget arcs carefully against how fast they get consumed and lean on loops for anything meant to fill hours.`,
      follow:`How would you estimate consumption rate for a piece of arc content before building it?`,
      red:`Treats all content as equally reusable and budgets a story arc like it were a core loop.` }
  ],
  mid:[
    { q:`How do you actually run a content redundancy audit?`,
      a:`List every piece with the parameters it sets, group pieces that produce the same player situation and decision, keep the strongest in each group, and name what the others add, if anything. Then look at the gap: which situations could the systems produce that nothing currently exercises. Do this before generating anything new.`,
      follow:`You find three items producing the same situation. What do you do with the two weaker ones?`,
      red:`Runs the audit, agrees with the findings, and ships all the content unchanged anyway.` },
    { q:`Where does AI genuinely help with content, and where do you keep it out?`,
      a:`It is good at auditing an existing list for redundancy, generating variations once the system is validated with explicit distinctness criteria, and estimating consumption rate. It is bad at deciding whether to add content instead of fixing a loop, and at judging whether a piece is "interesting", because that is observed, not computed.`,
      follow:`Someone hands you ten AI-generated variants of one item. What is your first move?`,
      red:`Uses AI to generate content before validating the underlying system, then wonders why the game still reads as thin.` },
    { q:`Telemetry shows players burn through content fast and stop returning. What is your diagnosis path?`,
      a:`Check whether the fast-consumed content was arc or loop. If arc, that is expected and needs budgeting against playtime rather than treated as a bug. If it is loop content players are not replaying, the loop itself is probably the actual problem, not the content around it.`,
      follow:`It turns out to be loop content. What do you look at instead of adding more of it?`,
      red:`Responds to any consumption-rate complaint by scheduling more content of the same kind.` }
  ],
  senior:[
    { q:`A publisher wants generation used to multiply content output for the back half of the year. What do you check before signing off?`,
      a:`Whether the systems being multiplied are already validated by hand, since generation on top of a thin system just multiplies the thinness. Ask what the generator varies, decisions or decoration, and propose a distinctness test on a sample batch before committing the schedule. Cost the human filtering time, because generated content still needs someone judging fit.`,
      follow:`The sample batch passes the distinctness test on paper. What do you still want to see before scaling it?`,
      red:`Signs off on volume targets with no distinctness criteria defined anywhere in the plan.` },
    { q:`How do you make the case to a director that the game's problem is the loop, not the content, when the room's instinct is to add content?`,
      a:`Bring the redundancy audit showing what fraction of existing content produces duplicate situations. Show what improving the interaction does for every future piece of content versus what one more piece does for itself. Frame it as sequencing, fix the system first, multiply it second, rather than as a rejection of content.`,
      follow:`The director agrees in principle but the milestone is content-shaped and due in six weeks. What do you actually deliver?`,
      red:`Argues the philosophical point and leaves without a plan the room can act on this milestone.` }
  ] });

INTERVIEW('encounters-and-enemies',{
  junior:[
    { q:`What is an enemy, in design terms, and why is that framing more useful than "monster"?`,
      a:`An enemy is a question the game asks: how do I get behind this, what do I prioritize, when do I commit. The player's verb set has to contain a valid answer or the question is unfair. Framing it as a monster invites art-first thinking, framing it as a question invites behavior-first thinking. Give an example where two enemies looked different and asked the identical question.`,
      follow:`Take an enemy from a game you know and state the question it asks in one sentence.`,
      red:`Describes an enemy by its stat block or its appearance with no mention of a question or an answering verb.` },
    { q:`Is a bigger, tougher version of the same enemy new content?`,
      a:`No. If it asks the identical question with more health, it is a slower version of the same fight, not a new one. Real variety comes from a new question or a new combination, not a stat multiplier. Say what would make an elite variant genuinely new: a different telegraph, a different valid answer, a changed arena role.`,
      follow:`Your roster has an elite tier for every base enemy. What do you check first?`,
      red:`Defends stat variants as content because they took art and time to produce.` },
    { q:`How does the player actually learn what an enemy is asking?`,
      a:`Through readable intent: silhouette, telegraph, sound, at the camera distance and lighting the game actually ships with. If the telegraph cannot be read at that distance, the question was never fairly asked. Test it in the real build, not in a bright grey box.`,
      follow:`A telegraph reads fine in your test level and fails in the finished level. What changed?`,
      red:`Assumes readability from the concept art and never checks it against the shipping camera.` }
  ],
  mid:[
    { q:`You want to know if your enemy roster actually has variety. How do you check, without eyeballing the stat sheet?`,
      a:`Build a compatibility matrix: for every pair of enemies, does combining them create a genuinely new question, not just more simultaneous damage. Enemies with zero new combinations against the rest of the roster are candidates to redesign or cut. Then watch whether players change tactics per enemy type in actual play, since that is the behavior the matrix is supposed to predict.`,
      follow:`Two enemies pass the matrix on paper but players fight them identically. What do you look at?`,
      red:`Builds the matrix, finds duplicates, and ships the roster anyway because the art is already done.` },
    { q:`How do you design an encounter as a composition of questions instead of an enemy count?`,
      a:`Write the sequence of questions you want the encounter to ask and the intended tactical shift partway through. Choose which enemies supply which question, then choose the arena to sharpen rather than blunt those questions. Count is the leftover variable, not the plan.`,
      follow:`The producer asks for the encounter to be "harder." How do you translate that into question-sequence terms?`,
      red:`Answers a difficulty request by adding more of the same enemy to the same arena.` },
    { q:`Players fight every encounter the same way. Where do you look first?`,
      a:`Whether enemies are asking distinct questions at all, whether the arena is neutralizing the questions it is supposed to sharpen, an open field flattens a flanker's question, and whether telegraphs are actually readable in play. Only after ruling those out do you look at whether the player's verb set is too narrow.`,
      follow:`The verb set turns out to be the actual bottleneck. What is the cheaper fix before adding a new verb?`,
      red:`Concludes the roster needs more enemy types without checking the arena or the telegraphs first.` }
  ],
  senior:[
    { q:`You inherit a roster where half the enemies duplicate each other's question. How do you decide what survives?`,
      a:`Rank by distinctness of question and combinatorial contribution from the matrix, not by how much art exists for each. Cut or redesign the weakest duplicates behavior-first, reusing art where budget forces a reskin instead of a rebuild. Present the cut list with what tactical variety is lost for each, so the decision is made on evidence rather than sentiment.`,
      follow:`Art has already been produced for three enemies you want to cut. How does that change your recommendation?`,
      red:`Keeps every enemy because the art is sunk, and papers over the duplication with a stat pass.` },
    { q:`How do you keep enemy design honest once a live game has years of content behind it?`,
      a:`Re-run the compatibility matrix whenever a new enemy or arena ships, since the question space shifts with every addition. Track which enemies players describe by behavior versus by name only, that is the signal a question landed. Retire or rework enemies that never earn a behavior description, regardless of how much they have shipped.`,
      follow:`An old enemy nobody can describe by behavior is still popular in cosmetics sales. Do you touch it?`,
      red:`Never revisits shipped enemies because the roster audit was treated as a one-time launch task.` }
  ] });

INTERVIEW('items-weapons-abilities',{
  junior:[
    { q:`What separates a good item from a filler item?`,
      a:`A good item changes what the player considers doing, a new verb, a changed priority. A filler item changes only the outcome of what they were already going to do, a bigger number. Give an example of each from a game you know and say which one you would remember a week later.`,
      follow:`Take the stat item you named and say what would turn it into a priority-changing one.`,
      red:`Describes items purely by their numeric stats with no mention of what decision changes.` },
    { q:`Why are tier systems, where higher tiers are strictly better, a trap?`,
      a:`They make every earlier item trash the moment a higher tier drops, killing the niches that made those items worth choosing. The player stops evaluating items and starts checking one number. Verb items resist this because they own a situation rather than a magnitude.`,
      follow:`How would you redesign a tier ladder so an early item stays relevant at max level?`,
      red:`Accepts strict tiering as normal because "that's how loot works" in the genre.` },
    { q:`How do you know if a player actually recognizes an item as distinct after using it once?`,
      a:`Test it directly: hand it to a player, let them use it once, then ask what it does differently from the last item they held. If they cannot say, the item is not distinct regardless of what the tooltip claims. Distinctness is what is perceived in play, not what is written in the design doc.`,
      follow:`A player uses the item three times before they can describe it. What does that tell you?`,
      red:`Assumes distinctness because the item has a unique icon and a unique name.` }
  ],
  mid:[
    { q:`Your item list has ballooned and most items feel forgettable. What do you do?`,
      a:`Classify every item as new verb, changed priority, or changed parameter, and look at the ratio against what you actually want. Cut toward that ratio rather than toward a headcount. For each survivor, write the situation it owns and the situation that punishes it, items with blanks in either are candidates to merge or cut.`,
      follow:`The ratio comes back mostly stat items. What is the cheapest first move?`,
      red:`Prunes items at random to hit a smaller number without classifying any of them first.` },
    { q:`How do you stop AI-generated item variants from becoming spam?`,
      a:`Define the niches first, situation owned, situation punished, verb changed, before generating anything. Generate candidates only within those niches, and reject any candidate that only changes a number, out loud, as part of the process. The filter has to be explicit or the model will happily produce numeric variants that look novel and are not.`,
      follow:`A generated candidate passes your filter on paper but still reads as a reskin in testing. What went wrong upstream?`,
      red:`Generates a batch of items first and tries to sort them into niches afterward.` },
    { q:`Players equip the highest number and never look at their inventory again. Diagnose it.`,
      a:`Check whether any item actually punishes the current best choice in some situation, if nothing does, the "best" item is genuinely best everywhere and there was never a real decision. Look at whether situational counters exist in the content, not just on paper. The fix is usually a niche the current best item loses in, not a nerf.`,
      follow:`You add a punishing situation and players still do not switch. What do you check next?`,
      red:`Nerfs the dominant item's numbers and expects switching behavior to follow automatically.` }
  ],
  senior:[
    { q:`How do you decide the verb-item to stat-item ratio for a whole game, and defend it to a team that wants more raw power fantasy?`,
      a:`Tie it to the player model and the fantasy: verb items add depth and teaching cost, stat items are legible and forgettable but satisfy an immediate power feeling. State the trade explicitly rather than defaulting to whichever is cheaper to produce this milestone. Bring evidence from testers on which items they can name and why.`,
      follow:`The team ships mostly stat items for six months under deadline pressure. How do you correct course without a full item pass?`,
      red:`Picks the ratio from what is fastest to implement this sprint and calls it a design decision after the fact.` },
    { q:`A build-diversity audit shows three items dominate every guide. Is that an item problem or something else?`,
      a:`Check first whether the content ever presents the situations the other items should own, if every encounter rewards the same approach, the item numbers were never the actual problem. Only after confirming the content supports the niches do you touch item balance, otherwise you will nerf the dominant items and watch the next-best ones take their place at the same rate.`,
      follow:`The content does support the niches and the dominance persists. What do you change in the items themselves?`,
      red:`Treats item dominance purely as a numbers exercise and never checks it against encounter design.` }
  ] });

INTERVIEW('quests-and-events',{
  junior:[
    { q:`What's the minimum a quest needs to not be an errand with text?`,
      a:`A goal, a reason, and a situation the systems make interesting, plus a decision inside it. Without the situation it is a checklist: go here, kill this, return. Take a quest from a game you know and check it against those parts, naming any that are blank.`,
      follow:`Which part is missing most often in fetch-and-kill quests you've played?`,
      red:`Defines a quest as "an objective with a reward" and stops there.` },
    { q:`Why is a quest log a weaker source of goals than the world itself?`,
      a:`A goal placed in the world, a visible thing to reach, is discovered by playing. A goal that only exists in a log has to be read, and players who read the objective instead of the text follow the marker and stop noticing the world. Say where you would put a goal in the world before writing it into a log at all.`,
      follow:`Give a case where a marker-driven design made players stop looking at the level around them.`,
      red:`Treats the quest log as the primary design surface and the world as decoration around it.` },
    { q:`What makes an event different from a quest, and what's the risk specific to events?`,
      a:`An event is time-bound and changes world state, where a quest does not have to. The risk is that events lean on timers and fear of missing out instead of on a real situation or decision, becoming pressure without content. Ask what decision the event actually contains before shipping the countdown.`,
      follow:`Strip the timer from an event you know. Is there still a decision left?`,
      red:`Adds a countdown to make routine content feel urgent, with no new decision underneath it.` }
  ],
  mid:[
    { q:`How do you audit a quest list without reading every line of dialog?`,
      a:`For each quest, write the situation it creates that free play would not, the decision it contains, and the world or character change on completion. Mark blanks, then group quests sharing a template. For the most common template, look for a structural variant that adds a decision rather than more text.`,
      follow:`You find twelve quests share the same kill-and-fetch template. What is your first structural fix?`,
      red:`Rewrites the flavor text on the duplicated quests and calls the audit done.` },
    { q:`The narrative team wants every quest scripted for control. Systems design wants everything generated for scale. How do you resolve it?`,
      a:`Name the trade honestly: scripted quests deliver reliable beats at the highest cost per minute, systemic ones scale but feel generic without hand-authored anchors. Mix them, scripting for anchors that need to land precisely, systems for the goals that fill the space between anchors. Decide the ratio from budget and from how much of the game needs to feel authored versus alive.`,
      follow:`Budget is cut mid-production and scripting has to shrink. What do you protect first?`,
      red:`Picks one approach on ideology and never revisits the mix as constraints change.` },
    { q:`Players read the marker and never the quest text. What do you actually do about it?`,
      a:`Check whether the goal is visible in the world before it is in the log, since a log-only goal trains players to stop looking anywhere else. Test removing the marker on one quest and see if a well-placed sightline or landmark can carry the same information. Text is a fallback for players who look away, not the primary channel.`,
      follow:`You remove the marker and players get lost instead of engaged. What does that tell you about the level, not the quest?`,
      red:`Adds more markers and bigger objective text to compensate for a quest nobody reads.` }
  ],
  senior:[
    { q:`How do you plan the authored-versus-systemic quest split for a live game meant to run for years?`,
      a:`Reserve scripted anchors for moments that need precision, launch content, major story beats, and lean on systemic goals for ongoing cadence, since arcs are consumed once and authored content cannot be regenerated fast enough to sustain live ops. Track consumption rate against your authoring pipeline's real throughput before committing the split publicly, and revisit the ratio after the first few live cycles rather than locking it at launch.`,
      follow:`Your systemic quests start feeling generic within the first season. What do you add without blowing the authoring budget?`,
      red:`Commits to an authored-heavy cadence at launch with no plan for what happens when the writing team can't keep pace.` },
    { q:`A publisher wants events built primarily around countdown pressure to drive daily logins. How do you push back or accommodate it?`,
      a:`Separate the metric the event is meant to move from the decision the event should contain, and show what a timer without a decision costs long-term, it reads as pressure rather than content and teaches players the game runs on urgency rather than situations. Offer a version with a real decision that still meets the timing goal, making the trade-off explicit rather than silently building pressure with no substance.`,
      follow:`The publisher accepts your version but wants the timer kept anyway for the metric. What do you insist on keeping in the design?`,
      red:`Ships the countdown as requested with no situation or decision inside it, and reports the login lift as success.` }
  ] });

INTERVIEW('procedural-content',{
  junior:[
    { q:`What's the "10,000 bowls of oatmeal" problem, and why should a designer care?`,
      a:`Kate Compton's framing: a generator can produce mathematically unique outputs that are perceptually identical, ten thousand bowls of oatmeal are still oatmeal. The bar is not uniqueness, it is whether a player perceives one output as different from the last. Give an example of a generator you know that clears this bar and one that does not.`,
      follow:`Take the generator that fails and say what it varies instead of what it should vary.`,
      red:`Defends a generator's variety by citing the size of its output space rather than what players notice.` },
    { q:`A generator varies color, texture and name across a thousand items. Is that enough?`,
      a:`Only if those changes affect what the player considers doing, otherwise it is decoration and the items will blur together regardless of how large the parameter space is. Ask what the generator varies that changes a decision, and if the answer is nothing, the variety is cosmetic. Distinctness is a perceptual test, not a combinatorial one.`,
      follow:`You find the generator only varies decoration. What is the smallest change that would make it vary a decision instead?`,
      red:`Reports the generator's output count as evidence of depth.` },
    { q:`Why hand-author examples before building the generator?`,
      a:`Hand-author roughly ten pieces first and find what makes the best ones distinct, those properties are exactly what the generator needs to vary. Skipping this step means guessing at distinctness instead of extracting it from something that already worked, and it gives you a floor to compare generated output against.`,
      follow:`Two of your ten hand-authored pieces turn out equally strong for different reasons. What does that tell you about the generator's parameter space?`,
      red:`Builds the generator first and tries to retrofit distinctness criteria from its output afterward.` }
  ],
  mid:[
    { q:`How do you actually test whether generated content is perceptually distinct?`,
      a:`Show players pairs of outputs and ask whether they are different and how, that is the perceptual distinctness test. Track the fraction of pairs players call the same as each other, and sample this across typical outputs and the generator's worst outputs, since players will meet the floor eventually, not just the average case.`,
      follow:`Players call most pairs the same even though the parameters differ significantly. What do you conclude about your parameter choices?`,
      red:`Measures distinctness by comparing parameter values in code and never shows a single pair to a player.` },
    { q:`Where does AI content generation make the oatmeal problem worse, specifically?`,
      a:`AI text and asset generation produces fluent, plausible output that is indistinguishable at scale, the fluency itself hides the sameness because each individual output reads fine in isolation. It is strongest used to fill niches already defined by hand, with an explicit distinctness filter, not to generate broadly and sort afterward. The human judgment on what counts as different has to happen before generation, not after.`,
      follow:`A generated batch all reads well individually but blurs together as a set. How do you catch that before it ships?`,
      red:`Approves generated content item by item without ever comparing it against the rest of the batch.` },
    { q:`You've sampled the generator's typical output and it looks fine. What are you still missing?`,
      a:`The generator's failure floor, its worst possible output, because players will eventually produce it through normal play and typical-case sampling never catches it. Deliberately sample the tail, not just the middle of the distribution, and raise the floor rather than just polishing the average case.`,
      follow:`You find a floor output that's actively broken, not just boring. What is the fix, cap the parameter range or patch the specific case?`,
      red:`Ships based on a handful of good-looking sampled runs and never deliberately hunts for the worst case.` }
  ],
  senior:[
    { q:`How do you sell a systemic or generated-content approach to a producer who wants a guaranteed schedule?`,
      a:`Be honest that generation trades content-per-hour for tuning time and later certainty, the schedule shape changes even if the total content cost goes down. Propose a slice, hand-author examples, build a narrow generator, test distinctness with players, before committing the full production plan to it, and define upfront what a failed slice means so the producer is not surprised later.`,
      follow:`The slice comes back with mediocre distinctness scores. Do you kill the approach or iterate on the generator?`,
      red:`Presents generation as strictly cheaper with no mention of the tuning and testing cost it actually carries.` },
    { q:`AI generation lets you produce content at a scale hand-authoring never could. What's the actual bottleneck now?`,
      a:`Human judgment on distinctness, because generation removed the cost constraint that used to force restraint. The bottleneck moves to defining distinctness criteria, sampling the floor, and filtering at scale, which is slower and more skilled work than most teams budget for. Volume without that filter just produces oatmeal faster.`,
      follow:`The team treats the higher volume as pure upside during planning. What do you tell them about the filtering cost before they commit the roadmap to it?`,
      red:`Welcomes the volume increase as a straightforward win and schedules no additional filtering or testing time for it.` }
  ] });

INTERVIEW('level-structure',{
  junior:[
    { q:`What's the teach-test-twist-combine-master-rest structure, and why those six beats specifically?`,
      a:`Introduce a mechanic safely, teach, demand it under pressure, test, reframe it unexpectedly, twist, mix it with something known, combine, demand fluency, master, then release, rest. It generalizes the kishotenketsu pattern and Celeste's one-idea-per-room approach. Say why skipping teach or rest specifically breaks the lesson: teach without safety kills confidence, rest without content exhausts.`,
      follow:`Take a level you know and map it onto those six beats. Where does it skip one?`,
      red:`Recites the six words without being able to map them onto an actual level.` },
    { q:`Why does a level need to be about one idea, and what happens when it's about two?`,
      a:`One idea lets teach, test and twist genuinely build on each other, two ideas split the player's attention and neither gets the full arc. Say you would split a two-idea level into two levels or make one idea subordinate to the other, and reference the discipline Celeste applies here directly.`,
      follow:`Give an example of a level that tried to teach two mechanics at once and name which one actually landed.`,
      red:`Defends cramming multiple new mechanics into one level as efficient use of production time.` },
    { q:`Where should a player be able to fail safely while learning a new mechanic?`,
      a:`In the teach beat, before the test beat introduces real stakes. If the introduction has no safe failure, the level is asking the player to master something before they have had a chance to try it. Say what "safe" means concretely: no death, no lost progress, or a low enough cost that experimentation feels free.`,
      follow:`Players are dying in what you designed as the teach beat. What does that tell you?`,
      red:`Calls a level "hard" without checking whether the introduction ever gave a safe attempt.` }
  ],
  mid:[
    { q:`How do you test whether the teach beat actually taught the idea, rather than just showed it?`,
      a:`Watch whether players use the mechanic correctly in the test beat without being told again, that is the actual signal, not whether they read a tooltip during teach. Grey-box the beats before dressing them so you are testing the structure, not the art. If they fail the test beat, the teach beat did not work regardless of how clear it looked to you.`,
      follow:`Players pass the test beat but fumble the combine beat later. Where do you look first?`,
      red:`Assumes teaching worked because the tooltip was clear and never watches the test beat.` },
    { q:`What's the difference between a twist and an escalation, and why does confusing them flatten a level?`,
      a:`A twist recontextualizes the idea, a new angle, a reversal, an unexpected combination, an escalation just adds more of the same demand. Escalation belongs in the master beat, not the twist beat, using it too early makes the level a drill dressed as a lesson. Give an example of a real twist versus an escalation that was mislabeled as one.`,
      follow:`You've mislabeled an escalation as your twist. What do you replace it with?`,
      red:`Defends "more enemies" as a twist because it changes the difficulty.` },
    { q:`The rest beat in your level plan is literally empty space. What's wrong with that?`,
      a:`Empty rest is dead time, players read it as padding rather than release, and it wastes the moment when learning actually consolidates. The rest beat needs to carry something, a reward, a story beat, a vista, a chance to look back at what just happened. Say what you'd add to a currently-empty rest beat in a level you know.`,
      follow:`You add a vista to the rest beat and playtesters still rush through it. What do you check next?`,
      red:`Defines rest as simply removing enemies from a section, with nothing put in their place.` }
  ],
  senior:[
    { q:`Six designers build levels in parallel using this structure. What breaks first without a shared standard?`,
      a:`The twist beat, because it is the most subjective of the six and the easiest to mislabel as an escalation under deadline pressure. A shared vocabulary for what counts as a twist, plus a review that checks the beat map before greyboxing goes far, catches this earlier than a full playthrough would. Cross-review levels against each other's twists so nobody's is a quiet repeat of someone else's.`,
      follow:`Two levels turn out to use the same twist independently. How do you decide which one keeps it?`,
      red:`Reviews each level only against its own beat map and never checks it against the other levels shipping alongside it.` },
    { q:`How do you use this structure for a mechanic the player already knows, three worlds into the game?`,
      a:`The teach beat becomes brief or implicit, since there is no need to reteach, but test, twist, combine, master and rest still apply, now combining the known mechanic with something newer instead of with itself. The risk is skipping straight to master because the mechanic feels old to the designer even though it is being asked to do something genuinely new here. Check the combine beat especially, that is where a known mechanic earns its place in a later level.`,
      follow:`A designer wants to skip straight to master because "players already know this." What do you push back on?`,
      red:`Treats a known mechanic as needing no structure at all past its first appearance in the game.` }
  ] });

INTERVIEW('pacing',{
  junior:[
    { q:`Why does pacing need two curves instead of one?`,
      a:`Intensity, how much pressure, how fast, and cognitive load, how much new information and how many decisions per minute, fail differently when they peak together or trough together. Peaking both overwhelms, troughing both bores, and new information at high intensity does not get learned. Say why a game can feel "relentless" and "confusing" at the same time and moment.`,
      follow:`Take a section from a game you know where both curves peaked together. What broke?`,
      red:`Talks about pacing purely in terms of action intensity with no mention of cognitive load at all.` },
    { q:`What's wrong with teaching a new mechanic during combat?`,
      a:`New information delivered at high intensity is not learned, the player is too busy surviving to absorb a new rule. New-information beats belong in cognitive valleys, low intensity, so the player has the attention to actually take it in. Give an example where a game taught something mid-fight and it visibly did not land.`,
      follow:`Combat is unavoidable at that point in the level. Where else could the new information go instead?`,
      red:`Adds a tooltip during a boss fight and assumes the text delivered the lesson.` },
    { q:`A rest beat with no enemies and nothing else in it. What's the problem?`,
      a:`Empty rest is dead time, and players read a stretch with nothing happening as padding rather than release, regardless of how quiet the level intends it to feel. Rest has to carry something, a reward, a vista, a story beat, a moment to look back. Removing pressure is not the same as adding meaning.`,
      follow:`What would you add to a rest beat that's currently just an empty corridor?`,
      red:`Defines pacing entirely in terms of intensity and never checks what a low point actually contains.` }
  ],
  mid:[
    { q:`How do you plot the two curves for an actual level, not just talk about them abstractly?`,
      a:`Chart intended intensity and cognitive load per minute from the level script and timings, flag minutes where both hit high simultaneously, and flag stretches longer than a few minutes with no change in either curve. Then propose the smallest move for each flag, relocate a teaching beat, insert a rest, cut a redundant beat, rather than redesigning the whole level.`,
      follow:`You find a three-minute flat stretch with no change in either curve. What's the cheapest fix?`,
      red:`Draws an intended curve on paper and never checks it against an actual level script with real timings.` },
    { q:`Testers describe a level as "relentless." What do you actually measure to confirm that, rather than take the word at face value?`,
      a:`Overlay observed pace, movement speed, pauses, speech from a recording, against your intended curves and look for places both peaked together or stayed high for an extended stretch. "Relentless," "boring" and "confusing" each point at a different pacing failure, so the word choice itself is diagnostic before you touch anything.`,
      follow:`The observed curve matches your intended curve and testers still call it relentless. What does that tell you about the intended curve itself?`,
      red:`Lowers the overall difficulty in response to "relentless" without checking which curve was actually the problem.` },
    { q:`How do you break up the longest flat stretch in a level without adding new content?`,
      a:`Change either curve using what is already there, move an existing decision point earlier, insert a beat of rest using existing geometry, or relocate an information beat that is currently misplaced. The fix is often reordering rather than authoring something new.`,
      follow:`Reordering is not possible because of a hard technical or narrative constraint. What's your next-cheapest option?`,
      red:`Solves every flat stretch by adding new enemies or new content rather than rearranging what exists.` }
  ],
  senior:[
    { q:`You're pacing a whole game, not a level. What changes about the approach?`,
      a:`The rhythm nests: beats inside levels, levels inside acts, acts inside the campaign, so you are planning peaks at the scale players actually remember rather than at the scale you are currently building. A peak at game scale needs an ingredient the player has not met yet, which means budgeting novelty across the whole production, not per level. Valleys at game scale still have to carry something or the whole midgame reads as one long trough.`,
      follow:`Where do most teams get the game-scale curve wrong, specifically?`,
      red:`Pastes the same level-scale curve at every scale and expects the game-scale pacing to take care of itself.` },
    { q:`Six level designers are building in parallel. How do you keep pacing coherent across all of them?`,
      a:`A published curve showing each level's intended position on it, a shared vocabulary for beats so "peak" means the same thing to everyone, and a review that plays levels in sequence rather than in isolation, since isolated review cannot catch two levels both claiming to be the peak. Nobody raises intensity locally without trading it down somewhere else on the shared curve.`,
      follow:`Two levels both claim to be the campaign's peak. How do you resolve it?`,
      red:`Reviews each level only on its own merits and discovers the sequencing problem at the first full playthrough.` }
  ] });

INTERVIEW('spatial-composition',{
  junior:[
    { q:`What does it mean to say "space communicates," concretely?`,
      a:`Sightlines show goals, landmarks orient, and paths that fork visibly offer a real choice, all of it read by the player without a word of text. Give an example of a space that told the player where to go using only geometry and light, no marker.`,
      follow:`Take that example and say what would happen to it if the marker were removed and the geometry weren't doing the work.`,
      red:`Describes level layout purely in terms of gameplay flow with no mention of what the player sees or reads.` },
    { q:`From the entrance of a room, what should the player see first, and why does it matter?`,
      a:`The first thing visible sets what the space communicates, the goal, the danger, or the choice, and whichever it is, it should be deliberate rather than accidental. Walk through an entrance from a game you know and say what you saw first and what that told you to do.`,
      follow:`What would you check to confirm the first thing players actually notice matches what you intended?`,
      red:`Places the goal, danger and choice all visible at once from the entrance with no priority among them.` },
    { q:`Two paths fork and look identical. What's the actual problem?`,
      a:`Identical-looking forks make the choice meaningless because nothing differentiates what each promises, the decision is a coin flip dressed as exploration. Forks need to look different and promise something different, or the "choice" is not a decision at all. Say what you'd change about the geometry to make two forks legibly distinct.`,
      follow:`You differentiate the forks visually. How do you confirm players actually read the difference rather than picking at random?`,
      red:`Treats the existence of a fork as sufficient for player choice regardless of what it looks like.` }
  ],
  mid:[
    { q:`Players open the map every thirty seconds. What do you check first?`,
      a:`Whether landmarks are visible from most positions in the space, and test orientation directly by asking players to point toward where they entered without checking the map. If they can't, the space is not communicating position and no amount of UI will fix that cheaply. This is a geometry problem before it is a UI problem.`,
      follow:`Landmarks are visible and players still can't point home. What's actually broken?`,
      red:`Adds a compass or minimap in response to a wayfinding complaint without checking the underlying geometry.` },
    { q:`How do you review a level layout for sightline problems without walking every inch of it yourself?`,
      a:`For each entrance and fork, state what's visible first from that position and what it communicates, flag any position with no visible landmark, and flag any fork where the options look alike or promise the same thing. Propose the smallest geometry change for each flag rather than a wholesale redesign.`,
      follow:`A flagged fork needs a bigger structural change to fix than a small geometry tweak. How do you decide whether it's worth it?`,
      red:`Reviews the layout from a top-down map view and never checks what's actually visible from player eye height.` },
    { q:`What's recontextualization, and why is it valuable enough to plan for deliberately?`,
      a:`Revealing a known space from a new angle or state, so it reads as new without costing new geometry or assets. It is one of the cheapest ways to produce a moment of surprise because the player's existing mental map does the work. Give an example where a game revealed a space you thought you already understood.`,
      follow:`Where in your own level could an existing space be revealed from a new angle without building anything new?`,
      red:`Confuses recontextualization with simply reusing an asset in a different level.` }
  ],
  senior:[
    { q:`Guidance through space and freedom to explore trade off directly. How do you decide where a given game sits?`,
      a:`From the player model and the pillars, not from a usability default, strong guidance reduces getting lost and reduces discovery, open space rewards exploration and dilutes pacing control. State the trade explicitly and test both failure modes, drift on the open end, no invented paths on the guided end, rather than assuming the middle is safe.`,
      follow:`Testing shows players drifting and getting lost even with landmarks in place. What do you change first, the landmarks or the openness itself?`,
      red:`Defaults to heavy guidance because it always tests better in a short first-time session, without checking what it costs on replay.` },
    { q:`You have six level designers each composing separate spaces that need to feel like one coherent world. How do you keep the spatial language consistent?`,
      a:`A shared vocabulary for what a landmark, a sightline and a fork are supposed to do, reviewed across levels rather than within each one alone, so the same visual grammar reads the same way everywhere. Track wayfinding failure with heatmaps and paths at the seams between different designers' spaces specifically, since that is where inconsistent grammar shows up first.`,
      follow:`Two adjacent levels use landmarks that mean different things spatially. How do you resolve the seam?`,
      red:`Lets each designer define their own spatial language and only discovers the mismatch at the first full playtest.` }
  ] });

INTERVIEW('encounter-design',{
  junior:[
    { q:`What is an encounter, structurally, and what are its four parts?`,
      a:`Setup, where the player reads what's coming, engagement, execution, shift, something changes the plan partway through, and resolution. The shift is what makes an encounter memorable rather than executed on autopilot. Give an example of an encounter you remember and name its shift specifically.`,
      follow:`Take that same encounter and describe what it would feel like with the shift removed.`,
      red:`Describes an encounter purely as a list of enemies with no mention of setup, shift, or resolution.` },
    { q:`Why is a bigger arena with more enemies not automatically a bigger encounter?`,
      a:`Space changes the question an enemy asks, the same enemies in a corridor and an open arena ask completely different things, and an arena that neutralizes an enemy's intended question, an open field for a flanker, kills the design rather than scaling it up. Count is the leftover variable, not the design.`,
      follow:`Give an example of an arena that accidentally neutralized an enemy's intended role.`,
      red:`Scales up an encounter purely by adding enemy count to the same arena shape.` },
    { q:`What should a player be able to read before they commit to an encounter?`,
      a:`Enough of the setup to plan: what enemies are present, roughly what the arena offers, what the stakes are. Without a moment to read, the encounter can't reward planning and everyone ends up reacting identically. Say where in a level you know that reading moment happens, or where it's missing.`,
      follow:`You add a reading moment and players still charge in without using it. What does that tell you?`,
      red:`Treats a lack of planning as a player skill problem rather than checking whether a reading moment exists at all.` }
  ],
  mid:[
    { q:`Players describe your encounters as "more guys." Diagnose it.`,
      a:`Check whether the enemies present are actually asking distinct questions from each other, whether the arena sharpens or neutralizes those questions, and whether there's an intended tactical shift at all or just an escalating headcount. "More guys" is almost always a symptom of the shift being absent or imperceptible, not of insufficient enemy variety.`,
      follow:`The questions are distinct and there is a shift. Players still say "more guys." What's left?`,
      red:`Responds to "more guys" by adding a new enemy type rather than checking the existing composition first.` },
    { q:`How do you check that an encounter actually supports more than one valid approach, rather than assuming it does from the design?`,
      a:`Record multiple players attempting the same encounter and count distinct approaches actually used, not approaches you can imagine in theory. Check that the arena concretely enables each approach you intended, cover for a stealth approach, height for a ranged one, rather than just asserting variety exists. An approach nobody actually takes in testing does not count as supported.`,
      follow:`You find only one approach gets used despite the arena supporting others on paper. What do you check next?`,
      red:`Counts theoretically possible approaches from the design document as evidence of variety without ever recording real play.` },
    { q:`The shift in your encounter is supposed to be reinforcements arriving. Testers don't seem to notice. What do you check?`,
      a:`Whether the shift is actually perceivable, a visible or audible cue, a change the player has to react to, versus something that happens in a corner of the screen they never look at. A shift the player can't perceive isn't a shift, it's an invisible difficulty bump. Fix the readability of the moment before assuming the concept itself failed.`,
      follow:`You fix the readability and players notice the shift but describe it as unfair rather than exciting. What's the difference?`,
      red:`Assumes the shift concept failed and cuts it, without first checking whether it was perceivable at all.` }
  ],
  senior:[
    { q:`How do you budget content across a whole game so encounters keep producing new tactical shifts rather than repeating the same ones?`,
      a:`Track which questions, enemy behaviors and shifts have already been used and where, since the content budget for encounters is really a budget of distinct compositions, not distinct art assets. Plan shifts against the arenas and enemy roster you actually have rather than inventing a new one for every encounter, since composition, not novelty, is what scales. Flag repeats explicitly rather than discovering them at the first full playthrough.`,
      follow:`You're two-thirds through production and shifts are visibly starting to repeat. What do you change, given you can't add new enemies or arenas at this point?`,
      red:`Assumes every encounter needs a novel shift and runs out of distinct ideas well before the content plan is complete.` },
    { q:`A design team disagrees about whether encounter difficulty should come from enemy composition or from the arena. How do you resolve it?`,
      a:`Point out they are not actually separable, the arena determines which questions the enemies can even ask, so treating them as competing levers misses that the composition is the arena and the enemies together. Bring evidence from actual recordings showing which approaches the current arena supports versus which the encounter intends. Resolve it by auditing the content, whether it presents the situations each design lever depends on, rather than by picking a side.`,
      follow:`The audit shows the arena is quietly doing all the work and the enemy composition barely matters. What does that mean for how the team should be spending its time?`,
      red:`Treats enemy composition and arena design as independent variables that can be tuned separately without checking their interaction.` }
  ] });
