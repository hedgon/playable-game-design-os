/* =====================================================================
   INTERVIEW VIEWS (part E2): ux, narrative, presentation, product.
   (production, ai, gameai and studio live in 42-data-interview-c.js.)
   Same shape and rules as 40-data-interview-a.js:
     INTERVIEW('topic-id',{ junior:[{q,a,follow,red}], mid:[...], senior:[...] })
   Six to ten questions per topic, at least one per level. Questions an
   actual interviewer asks, model answers as 3 to 6 bullet outlines, one
   follow-up that is certainly coming, and a concrete red-flag answer.

   Topics this file owns (24):
     ux            ux-as-design, readability-and-hierarchy,
                   feedback-and-affordance, onboarding,
                   controls-and-friction, accessibility
     narrative     premise-and-world, ludonarrative-alignment,
                   environmental-storytelling, narrative-agency,
                   narrative-pacing
     presentation  visual-language, game-feel-and-juice, audio-and-music,
                   animation-and-vfx
     product       audience-and-positioning, platform-and-session,
                   business-model, scope-control, learning-from-success,
                   launch-and-discoverability, live-operations,
                   localization-and-culture, ethics-and-responsibility
   ===================================================================== */

/* ---------------- UX / UI ---------------- */

INTERVIEW('ux-as-design',{
  junior:[
    { q:`What is the user interface for in a game, and how do you decide whether an element belongs in the HUD?`,
      a:`The UI is the channel through which state, choices and consequences reach the player. Run the six questions on the element: what decision does it support, what information does the player need, when do they need it, how fast must they parse it, what happens if they miss it, could the world carry it instead. An element with no decision behind it is noise and competes with the world for attention. Give one element you cut and what the player lost.`,
      follow:`Which element in your last HUD would you cut first, and what breaks when you do?`,
      red:`Keeps an element because the genre always has one, or answers with layout and style instead of a decision.` },
    { q:`A playtester says the game is confusing. How do you tell a UX problem from a design problem?`,
      a:`Separate usability from engage-ability. Usability is whether they can perceive, understand and act. Design is whether the thing they perceived is worth doing. Watch where they hesitate, what they misread, and what they ask. If they can state the goal and still cannot act, it is usability. If they act correctly and do not care, it is the design.`,
      follow:`They can act but they cannot say why they chose that option. Which is it?`,
      red:`Proposes a tutorial pop-up before watching anyone play.` },
    { q:`What does diegetic information mean, and when would you use it?`,
      a:`Information carried by the world rather than by an overlay: ammunition on the weapon model, health in the character's posture, a threat heard before it is seen. It is more immersive and slower to parse. Use it when the player has time and when the fantasy is the point. Keep the HUD for information needed inside a second during action.`,
      follow:`Where would you refuse to go diegetic, and why?`,
      red:`Treats diegetic as a style choice with no parse-speed argument.` }
  ],
  mid:[
    { q:`Walk me through a HUD audit you have actually run.`,
      a:`Inventory every element. For each, answer the six questions and record the decision it supports. Cut elements with no decision, move slow ones into the world, and rank the rest by how fast they must be read. Then map information to moments: what is needed before, during and after each action. Name what the team pushed back on and how you settled it.`,
      follow:`Which cut did the team refuse, and what evidence would have changed their mind?`,
      red:`Describes a visual restyle and calls it an audit.` },
    { q:`How do you run a usability test on a game interface?`,
      a:`Recruit players who match the model, not colleagues. Give a task, then observe silently with no help. Log hesitations, wrong targets, repeated attempts and questions asked aloud. Ask open questions afterwards, starting with what they did, never with whether they liked it. Report behaviour separately from opinion.`,
      follow:`Two of six testers missed the same button. Is that a pattern?`,
      red:`Asks testers whether the UI looks good and reports the answers as findings.` },
    { q:`Our combat HUD has eleven elements and players still miss the one that matters. What do you do?`,
      a:`Rank the eleven by decision importance and compare with current visual weight. Count how many the player must track at once during action. Move anything not needed inside that second out of the action view. Then test whether players act on the top item without reading it. A crowded HUD is a hierarchy problem before it is a count problem.`,
      follow:`You cannot remove anything because each element has an owner. Now what?`,
      red:`Adds a highlight or an arrow to the important element and leaves the other ten.` }
  ],
  senior:[
    { q:`The art director wants a near-empty HUD and the combat designer wants every stat visible. Arbitrate.`,
      a:`Neither preference decides it. List the decisions the player makes in that mode, the information each needs, and the parse speed. That converts a taste argument into a testable one. Propose the minimal HUD plus a world-first alternative for the slow items, then run a task-based test with matched players and let the misses settle it.`,
      follow:`Neither side has playtest data and the milestone is in two weeks. What do you do?`,
      red:`Splits the difference, or lets the more senior person win.` },
    { q:`How do you get UX treated as design in a studio where UI is scheduled last?`,
      a:`Tie it to the numbers the studio already cares about: early churn, first-session completion, support load. Put a cheap silent test into the existing milestone review so UX evidence arrives at the same time as the build. Do the first audit yourself and show a cut list with player quotes. Culture changes when a finding lands before a milestone, not when a document circulates.`,
      follow:`You get one recurring half day a week. How do you spend it?`,
      red:`Blames the studio culture and asks for a dedicated team before showing any evidence.` }
  ] });

INTERVIEW('readability-and-hierarchy',{
  junior:[
    { q:`What does readability mean in a game, and how is it different from a clean-looking screen?`,
      a:`Readability is whether the player can perceive game state at the speed the game demands. A clean screen can still be unreadable if the most important thing is not the loudest thing. Hierarchy is the ranking, visual weight is how it is expressed, and the target is set by the pace and the device.`,
      follow:`How would you check that on a phone held at arm's length?`,
      red:`Answers with fonts, spacing and palette and never mentions speed or decisions.` },
    { q:`Name the tools you have for giving an element visual weight.`,
      a:`Size, contrast, motion, position, and isolation from clutter. Rank the information by decision importance first, then assign weight in that order. Check the ranking survives a squint test and a desaturation test, because both strip the decoration and leave the hierarchy.`,
      follow:`Which of those tools still works for a player who cannot separate red from green?`,
      red:`Makes the important thing bigger and red without ranking anything.` },
    { q:`Players keep dying to things they say they never saw. What are the candidate causes?`,
      a:`The signal is buried under effects, the hierarchy is inverted so something less important dominates, the threat is off screen or occluded, the telegraph is shorter than a human reaction, or the team tested on a large monitor and shipped to a small screen. Each has a different fix, so find which before touching damage numbers.`,
      follow:`How would you tell an occlusion problem from a telegraph problem this week?`,
      red:`Concludes the players are careless, or adds a warning icon before diagnosing.` }
  ],
  mid:[
    { q:`How much state can a player track at once during action, and what do you do when you exceed it?`,
      a:`A handful at pace, fewer as the pace rises, and the number is a budget you verify rather than a constant you quote. Reduce by chunking related state into one readable object, converting recall into recognition, or offloading to the world where spatial memory carries it. Then re-test the top three items during action, not at rest.`,
      follow:`What did you actually remove on a shipped game, and what did it cost?`,
      red:`Quotes a memory-span number with no reference to pace or to the mode being played.` },
    { q:`The game is readable on your monitor and unreadable on the target handheld. Process?`,
      a:`Test on the device at the real viewing distance before changing anything. Then re-rank the information for the smaller screen, because the budget shrank and the ranking must too. Fix hierarchy before scale: uniform scaling keeps the inversion and eats the world. Verify with a one-second flash test asking what the player saw.`,
      follow:`The artist says the scene looks worse at the new sizes. How do you answer?`,
      red:`Scales the whole interface up and calls it a device pass.` },
    { q:`New players call the screen chaotic and veterans want more density. Serve both.`,
      a:`Fix the hierarchy first, because a chaotic screen is usually an inverted one and both groups suffer from it. Then let density be opt-in for the information that is optional, never for the top three items. Progressive disclosure keeps one layout and one grammar, which is what keeps it maintainable.`,
      follow:`How do you avoid maintaining two HUDs forever?`,
      red:`Ships an advanced HUD toggle as the first move without ranking anything.` }
  ],
  senior:[
    { q:`You own readability on a live game with five years of accumulated effects. Where do you start?`,
      a:`Write the list of meanings the player must read instantly and treat it as a budget. Instrument deaths and confusion so you have a baseline before touching art. Audit the worst mode against the budget, ship one staged pass, and re-measure. Then publish the grammar so new content is checked against it rather than added on top of it.`,
      follow:`How do you stop it re-accumulating after you move on?`,
      red:`Proposes a full visual rework with no measurement and no gate for future content.` },
    { q:`Marketing wants a spectacle beat that buries the readable state. How do you argue it?`,
      a:`Do not argue on taste. Show the death-cause data from the section, run the desaturation test on the proposed frame, and offer an alternative that keeps the spectacle where the player has no decision to make. Spectacle at a rest beat costs nothing. Spectacle over a decision costs fairness.`,
      follow:`They still want it in the boss fight. What is your compromise?`,
      red:`Concedes because the shot looks good, or refuses without offering a place where it works.` }
  ] });

INTERVIEW('feedback-and-affordance',{
  junior:[
    { q:`Define affordance and signifier, and give a game example of each.`,
      a:`An affordance is what an object lets you do. A signifier is what tells the player it does. A ledge the character can grab is an affordance, the painted trim on it is the signifier. In games the grammar has to be consistent, because an identical object that is not usable teaches players to stop trying things.`,
      follow:`What happens when two objects look the same and only one is interactable?`,
      red:`Uses the two words as synonyms, or talks only about menu buttons.` },
    { q:`The player presses attack and nothing seems to happen. Walk the diagnosis.`,
      a:`Separate acknowledging the input from resolving the outcome. Check that something responds inside roughly 100 milliseconds, even if the result lands later. Then check the failure case: a whiff with no sound and no animation is the most common gap. Last, check whether the feedback explains the cause or only reports the result.`,
      follow:`The outcome takes 200 milliseconds to resolve. What do you show in the meantime?`,
      red:`Adds a particle effect without deciding whether the missing piece is confirmation or outcome.` },
    { q:`What does feedback for a failed action need that success does not?`,
      a:`The cause. Success is self-explaining because the player got what they wanted. Failure has to say why: out of range, blocked, interrupted, wrong resource, too early. Without the cause the player repeats the same action, and repeated failing actions are the clearest signal that feedback is missing.`,
      follow:`How do you convey cause without a text log?`,
      red:`Proposes one generic error sound for every kind of failure.` }
  ],
  mid:[
    { q:`Build me a feedback matrix for a melee attack.`,
      a:`Rows are the action, columns are outcomes: hit, kill, miss, blocked, parried, interrupted. Fill each cell with the channel and the timing. Flag empty cells and anything over about 200 milliseconds. Then check that at most two or three channels fire at once, because feedback on everything is noise that hides the important signals.`,
      follow:`Which cells are usually empty on projects you have joined?`,
      red:`Lists visual effects for hits only and never fills the failure rows.` },
    { q:`How do you measure whether your feedback is working?`,
      a:`After an action, ask the player what happened and why, and score the accuracy. Count how many times a player repeats a failing action before changing behaviour. Track which objects they try to use that are not interactable and the reverse. Those three convert a feel discussion into numbers you can compare between builds.`,
      follow:`What accuracy would make you stop working on it?`,
      red:`Reports that the team thinks it feels good now.` },
    { q:`Where is the line between feedback and juice?`,
      a:`Feedback is legibility and it is required for a playtest to mean anything. Juice is emphasis on feedback that already exists and it is justified after the loop is validated. The practical test is removal: take the effect away and ask whether the player can still tell what happened. If not, it was feedback.`,
      follow:`A producer wants the polish pass before the loop is validated. Your answer?`,
      red:`Treats them as the same layer and schedules both at the end.` }
  ],
  senior:[
    { q:`Players consistently call the game unfair and your balance numbers say it is fair. Where do you look?`,
      a:`Perceived fairness is causal legibility, not probability. Audit deaths for a legible cause: was the telegraph visible, was the failure explained, did the consequence arrive with a link back to the action. Collect a week of death clips and code them by whether the cause was shown. Change feedback and telegraphs before touching damage.`,
      follow:`What would you collect this week that would settle it?`,
      red:`Rebalances damage because the complaint mentions difficulty.` },
    { q:`How do you set a feedback standard across ten designers without writing a document nobody reads?`,
      a:`Make the feedback matrix a deliverable attached to each action, not a separate manual. Put one review question into the existing sign-off: which cells are empty and why. Publish three worked examples from the shipped game rather than rules. Budget channels per moment so a new feature cannot quietly take the whole mix.`,
      follow:`Who enforces it when you are not in the review?`,
      red:`Writes the standard, circulates it once and treats adoption as someone else's problem.` }
  ] });

INTERVIEW('onboarding',{
  junior:[
    { q:`What does the player do in the first thirty seconds of your game, and why that?`,
      a:`Their hands should be on the core verb, because the first minutes teach what the game is. Name the first action, then the first meaningful decision and when it arrives. Later than about five minutes is late for most games. Say what the player learns by doing rather than by reading.`,
      follow:`What is the first failure, and what does it teach?`,
      red:`Opens with a cutscene and a control list and calls that onboarding.` },
    { q:`Why is tutorial text a fallback rather than the plan?`,
      a:`Players skip text and then ask what to do, so text-taught rules are not learned. What the player does in the first minutes is what they retain. Good onboarding is level design and feedback doing the teaching, with a situation that requires the mechanic. Text is for conventions nobody could infer.`,
      follow:`Name a case where text is the right call.`,
      red:`Defends a wall of instructions because the systems are complicated.` },
    { q:`Teach a double jump without text. How?`,
      a:`Build a gap that cannot be crossed with one jump, put it somewhere failure is cheap, and make the second input visibly change the arc. Let them fail once safely, then repeat the shape with a small variation so the rule is confirmed. One idea at a time, and introduce the next system only when the player has a reason to want it.`,
      follow:`How do you know they learned it rather than got lucky?`,
      red:`Describes a pop-up with a button diagram.` }
  ],
  mid:[
    { q:`Describe a silent onboarding audit.`,
      a:`One new player, ten minutes, no help and no explanation from you. Log timestamps for every hesitation, misunderstanding, wrong action and question asked aloud. Do not answer the questions during the session. Afterwards cluster the hesitations by cause: unclear goal, unclear affordance, unclear feedback, unknown rule, interface friction. Change the level or the feedback rather than the text.`,
      follow:`How many testers before you act on a cluster?`,
      red:`Helps the tester when they get stuck, which destroys the only data the session produces.` },
    { q:`Our first session has fourteen pop-ups. Cut it down.`,
      a:`Write the first-session timeline first: first action, first decision, first failure, first mastery moment, first reward, first return hook. Delete every pop-up that teaches a system the player has no reason to want yet and delay that system. Replace the rest with situations that force the mechanic. Keep text only where the convention cannot be inferred.`,
      follow:`Which systems did you delay, and what broke downstream?`,
      red:`Shortens the wording of all fourteen and keeps them.` },
    { q:`Forty percent of players quit in the first ten minutes. What do you look at?`,
      a:`Instrument the timeline: time to first core-verb action, to first meaningful decision, to first failure, to first competent moment, to first reward that changes options. Find where the drop clusters, then watch six silent sessions across that window. Confusion and aimlessness look different in the room and identical in the aggregate number.`,
      follow:`The drop is before the first decision. What is your first change?`,
      red:`Adds rewards to the first minute without finding out where players stop.` }
  ],
  senior:[
    { q:`Six systems and a five-minute median session. Sequence the onboarding.`,
      a:`Order the systems by when the player needs them rather than by when they were built. Give each a first-use moment designed as a situation, and measure drop per step so the sequence is evidence-led. Protect the first session from feature teams adding their own first-run screens by making the timeline an owned artifact with a budget of interruptions.`,
      follow:`A new feature ships with its own tutorial pop-up. How do you handle it?`,
      red:`Front-loads all six systems so nothing is missed.` },
    { q:`Onboarding is the most iterated part of a game. How do you budget and schedule it?`,
      a:`Start early with grey boxes because the shape of the first session constrains the level plan, then re-test with genuinely fresh players after every change. Book a recurring slot and a recruitment pipeline, since the scarce resource at month twenty is people who have never seen the build. Keep a log of change, tester cohort and result so the team stops re-litigating settled findings.`,
      follow:`Where do fresh testers come from late in production?`,
      red:`Schedules one onboarding pass near the end and treats it as polish.` }
  ] });

INTERVIEW('controls-and-friction',{
  junior:[
    { q:`What is interaction friction and how would you measure it?`,
      a:`The cost between intent and action: inputs, mode switches, menu depth, confirmations, latency and load. Take the ten most frequent actions, count inputs and measure the time for each, then weight by frequency. Three small taxes on a frequent action are what makes players stop, so the ranking matters more than any single number.`,
      follow:`Which of those ten live inside menus, and could they live in the world?`,
      red:`Talks only about input lag and never counts a menu step.` },
    { q:`When is friction good?`,
      a:`When it is deliberate and perceived as weight: a slow reload that makes the choice to reload matter, a heavy door that sells the space. The test is whether players describe it as weight or as annoyance. Unintended friction is pure loss, and defending friction after players have shown what it is remains a common trap.`,
      follow:`How do you tell perceived weight from annoyance in a test?`,
      red:`Defends the friction as realism with no player evidence.` },
    { q:`How would you structure an inventory screen?`,
      a:`By the tasks players actually do rather than by the data model. Put the most frequent action on a button or in the world, keep depth shallow for anything used during play, and require confirmation only where a real mistake is possible. Then count inputs for the top tasks and compare against the old flow.`,
      follow:`Does that structure survive on a controller and on touch?`,
      red:`Mirrors the item database categories and calls it organisation.` }
  ],
  mid:[
    { q:`A system players say is fun goes unused. Investigate.`,
      a:`Count the inputs and the time to reach it, then check discoverability separately from friction. Watch hands and eyes in a session to see whether they consider it and abandon it, or never think of it. Ask why, but treat the answer as a hint and the behaviour as evidence. Then cut the cheapest step and re-measure usage.`,
      follow:`It is three inputs deep and still unused. Now what?`,
      red:`Adds a prompt telling players to use it.` },
    { q:`How do you set and verify an input latency budget?`,
      a:`Decide the budget per platform, then measure on the target device with a high-speed capture or an instrumented harness rather than by feel. Sample input every frame so no press is dropped and resolve on the fixed step so the result is the same on any machine. Track the number per build, because latency regresses quietly.`,
      follow:`Where does the extra latency usually come from?`,
      red:`Says it feels responsive on the development machine.` },
    { q:`How do you approach remapping and platform conventions?`,
      a:`Start from the conventions the player already knows on that platform, because breaking them costs learning time you cannot see in your own tests. Allow every input to be remapped, and give alternatives for holds and repeated presses. Then test the defaults with the target player's hands, not the team's, since the team has built its own habits.`,
      follow:`What breaks when you allow full remapping?`,
      red:`Maps to the team's muscle memory and never checks the platform norm.` }
  ],
  senior:[
    { q:`You are porting a controller game to touch. Where does the design break?`,
      a:`Precision falls, the thumbs occlude the screen, analog input disappears, sustained holds become painful, and sessions get interrupted. Rank the frequent actions by the precision they demand and redesign the ones that no longer fit rather than emulating a stick. Expect to change the pace and the readability targets, not only the input layer.`,
      follow:`What would you cut instead of porting it?`,
      red:`Adds a virtual stick and buttons over the same layout and calls the port done.` },
    { q:`Friction accumulates over a live game's life. How do you stop it?`,
      a:`Give the frequent actions an input budget and make it part of feature review, so a new system cannot add a step without trading one away. Track inputs per task in telemetry and watch it per release. Do a quarterly pass on the three actions with the highest frequency times cost, and publish the before and after.`,
      follow:`Who owns the budget when every feature has its own owner?`,
      red:`Schedules an occasional cleanup pass with no measurement and no gate.` }
  ] });

INTERVIEW('accessibility',{
  junior:[
    { q:`Which accessibility options would you put in every game, and why those?`,
      a:`Full remapping, subtitles with speaker labels, scalable text, reduced motion, alternatives to holds and repeated presses, and redundancy for anything signalled by colour alone. They cover the most common permanent and situational impairments, and most of them also improve readability for everyone playing on a small screen or in a noisy room.`,
      follow:`Which of those is cheap at the start and expensive to retrofit?`,
      red:`Names a colourblind mode that swaps the palette and stops there.` },
    { q:`What is redundant signalling?`,
      a:`Carrying one meaning on more than one channel: colour plus shape, sound plus a visual, text plus an icon. Any critical meaning carried by a single channel fails for the player who cannot use that channel. It also protects against a muted game, a bright room and a busy screen.`,
      follow:`Which channels would you use for a low-health state?`,
      red:`Thinks it means adding a text label to everything.` },
    { q:`Is difficulty an accessibility question?`,
      a:`Partly. Assist options let players steer the challenge toward their own flow zone, which is good design regardless of ability. The distinction that matters is between an assist that adapts the challenge, such as a longer input window, and one that skips it. Skipping removes the experience the player came for.`,
      follow:`How does that change for a game whose identity is its difficulty?`,
      red:`Says hard games are meant to be hard and never asks who is excluded.` }
  ],
  mid:[
    { q:`Audit one screen for accessibility. What do you actually do?`,
      a:`List the critical information on that screen and the channel carrying each item. Flag anything single-channel, anything depending on colour discrimination, precise timing, a sustained hold, or text below a readable size at the real viewing distance. Propose redundancy or an option per flag, and state whether it changes the intended experience.`,
      follow:`Adding redundancy raises visual noise. How do you resolve that?`,
      red:`Runs an automated contrast checker and reports the result as the audit.` },
    { q:`Design an assist that adapts rather than skips. Give a concrete one.`,
      a:`Take a boss whose attacks demand fast reaction. Lengthen the telegraph and extend the input window rather than removing the attack. The player still reads the tell, still times the answer, still learns the fight. A skip button gives them the credit and none of the experience, so it should be the last option and labelled honestly.`,
      follow:`How do you present the option without making the player feel judged?`,
      red:`Proposes a skip-encounter button as the primary assist.` },
    { q:`The team wants to treat accessibility as a post-launch task. Make the case.`,
      a:`Show the retrofit cost: strings baked into images, layouts that cannot absorb larger text, holds wired into the input layer, colour-only signals across every effect. Then show the overlap with readability work already planned. Finish with the audience fraction and the platform requirements that apply at submission, not after.`,
      follow:`You get two weeks now. What goes in?`,
      red:`Argues only on principle and brings no cost or requirement.` }
  ],
  senior:[
    { q:`Set up accessibility across a studio. What is the plan?`,
      a:`Make critical-signal redundancy part of the existing feature checklist so it is decided at design time rather than audited at the end. Name an owner, publish the option set the studio ships by default, and build a tester pool that includes players with relevant impairments. Verify with playable evidence per release rather than a compliance document.`,
      follow:`How do you verify it rather than assert it?`,
      red:`Hires a consultant for a final audit and treats the report as the programme.` },
    { q:`Assist options are seen internally as diluting the game's identity. How do you frame it?`,
      a:`Frame the intended experience as the target and assists as routes to it. Show which players currently cannot reach it and why, and design each assist as an adaptation with a stated effect. Then be explicit about what you would not add, because a credible line makes the rest of the argument land.`,
      follow:`What would you refuse to add, and how do you justify that?`,
      red:`Removes assists to protect purity without asking who is excluded by the default.` }
  ] });

/* ---------------- NARRATIVE ---------------- */

INTERVIEW('premise-and-world',{
  junior:[
    { q:`State the premise of a game you admire in one sentence, including the player's role and the stakes.`,
      a:`Premise is the situation and what is at risk, not the setting. Say who the player is in it and what happens if they fail. Then name one mechanic the world explains: why can the player do this thing here. If the sentence works, someone who has never seen the game can repeat it.`,
      follow:`Which mechanic does that world explain, and which one does it fail to explain?`,
      red:`Recites setting adjectives and factions and never names a stake.` },
    { q:`What is the difference between premise, setting and lore?`,
      a:`Premise is the situation plus the stakes. Setting is where and when. Lore is the accumulated history behind both. Premise is load-bearing because it gives the player a reason to care whether they win. Lore is optional depth, and cutting it first costs the least.`,
      follow:`Which of the three would you cut first under a content cut, and why?`,
      red:`Uses the three words interchangeably.` },
    { q:`What makes a game character work, as opposed to a film character?`,
      a:`They want something that intersects a decision the player makes, so the player's choice has a person attached to it. A character who only hands out objectives is a menu with a face. The fastest route to relatedness is a want the player can help or refuse.`,
      follow:`Name a character whose want changed a choice you made.`,
      red:`Describes a backstory and a personality with no connection to any player decision.` }
  ],
  mid:[
    { q:`Your world says magic is rare and the player casts a spell every four seconds. How do you fix it?`,
      a:`List every contradiction between world rules and system rules, then fix each on whichever side is cheaper. Here the fiction is cheaper: change what the magic is, who can do it, or what it costs in the world, rather than rebuilding the combat economy. When the fiction cannot move, change the system, and never leave it hand-waved, because players stop believing both sides.`,
      follow:`The writers refuse to change the fiction. What do you propose next?`,
      red:`Says players will not notice, or assumes the systems must yield.` },
    { q:`How much lore should a game have?`,
      a:`As much as a system or a decision touches, plus whatever optional discovery your invested players will pay attention to. Audit the bible for entries nothing references and either attach them to a system or move them to found material. Deep lore rewards a minority and costs authoring time for everyone.`,
      follow:`How would you find out how many players read the optional material?`,
      red:`Argues that more world is always better.` },
    { q:`How do you test whether a premise is working?`,
      a:`Ask players to describe the situation they are in, not the game. A working premise comes back as a role and a stake. Setting adjectives mean it has not landed. Also check where they skip text and what they missed that mattered, because skipped lines are a delivery problem as often as a writing problem.`,
      follow:`Testers describe the setting beautifully and cannot say what is at stake. What does that tell you?`,
      red:`Shows testers the pitch document first and then asks them to describe the game.` }
  ],
  senior:[
    { q:`You join a project with a two hundred page world bible and a loop nobody can describe. What do you do?`,
      a:`Find or write the premise sentence with the team and check that it explains the mechanics that exist. Map world rules against system rules and list the contradictions in cost order. Keep the bible as source material and reframe most of it as optional discovery instead of deleting it. The unit of work is the intersection between what the player does and what the world claims.`,
      follow:`The bible's author is the creative director. How do you run that conversation?`,
      red:`Proposes deleting the bible, or accepts it untouched and writes systems around it.` },
    { q:`How do you keep narrative and systems from becoming two departments that hand documents to each other?`,
      a:`Put story beats and play beats on one timeline both sides sign. Give each major character a want that lands on a designed decision, so the writer and the designer are working on the same object. Review together on the build rather than on documents, and make the contradiction list a standing item.`,
      follow:`What is the single artifact both disciplines own?`,
      red:`Describes a handoff process and a review meeting as the answer.` }
  ] });

INTERVIEW('ludonarrative-alignment',{
  junior:[
    { q:`What is ludonarrative dissonance? Give an example.`,
      a:`The mechanics say one thing and the story says another. The term came from a critique of a game whose systems rewarded acquisitive violence while the script asked the player to believe in a reluctant, principled hero. Players spend more time doing than watching, so when the two disagree they believe the doing.`,
      follow:`Is it always a defect?`,
      red:`Names the term and cannot produce a concrete case, or calls every cutscene dissonance.` },
    { q:`The story says the hero is reluctant. What should the mechanics do?`,
      a:`Read the loop as a statement and check whether reluctance appears anywhere in it. If killing is the most rewarded action and there is no cost to it, the loop says the opposite. The cheapest changes are usually in the reward and punishment structure, not in new content.`,
      follow:`What is the cheapest change that would move it?`,
      red:`Adds a line of dialog where the hero says they did not want to do this.` },
    { q:`Which part of a game is the loudest narrator, and why?`,
      a:`The loop. It is what the player does thousands of times, and what is rewarded is what they learn the game values. A cutscene states the theme once. The reward table states it every ten seconds.`,
      follow:`So where would you look first when players say the story rings false?`,
      red:`Says the script, because that is where the writing is.` }
  ],
  mid:[
    { q:`How do you audit a game for dissonance?`,
      a:`Write the implicit statement of the loop and progression: what does the game reward, what does it punish, what does it make trivial. Write the story's explicit theme next to it. Compare the two and list every place a reward contradicts a stated value. Surface content is not the audit, the reward structure is.`,
      follow:`The audit turns up five. Which do you fix?`,
      red:`Audits the dialog and the cutscenes and never opens the reward tables.` },
    { q:`You find dissonance and the story cannot change. What are your options?`,
      a:`Change the mechanic, change the reward, or make the dissonance deliberate and perceived. The third is real work: the player has to be led to notice the gap and feel it, otherwise it reads as a defect. Pick by cost and by what the game is about.`,
      follow:`How do you make a dissonance perceived rather than accidental?`,
      red:`Ships it and hopes the ending reframes it.` },
    { q:`Design one theme-carrying mechanic for a game about loss.`,
      a:`Make something the player values permanently unavailable through their own action: a companion ability that can be spent once, a route that closes behind them, resources that do not come back. The mechanic must be chosen, not inflicted, or it reads as a rule instead of a theme. Then check that no system quietly restores it.`,
      follow:`How would you test whether players felt it rather than noticed it?`,
      red:`Proposes a cutscene where a character dies.` }
  ],
  senior:[
    { q:`A cutscene removes control at the exact moment the theme is about agency. You are the lead. Adjudicate.`,
      a:`Name the collision plainly: this is the one moment where taking control contradicts the point. Cost the alternatives, which are usually in-play delivery with reduced staging or a shorter scene that ends before the choice. If the authored peak is worth it, make the loss of control a thing the player is meant to feel and follow it immediately with agency.`,
      follow:`The scene is the marketing beat and it is already captured. Now what?`,
      red:`Defends the scene on its production value and leaves the collision unaddressed.` },
    { q:`When is deliberate dissonance the right choice, and how do you know it landed?`,
      a:`When the discomfort is the point and the player is meant to feel implicated. It only works if they can articulate the gap afterwards, so test for that: ask what the game is about and listen for the tension rather than for the plot. If players describe it as a bug or as sloppiness, it did not land.`,
      follow:`What evidence would convince you it failed?`,
      red:`Relabels an accident as intentional after players complain.` }
  ] });

INTERVIEW('environmental-storytelling',{
  junior:[
    { q:`What is environmental storytelling and why do players trust it more than a cutscene?`,
      a:`Story delivered by how the world is arranged: what is broken, what is missing, what was left mid-task. It is discovered rather than told, so players feel they own the conclusion. It also costs the player no time, because they read it while playing.`,
      follow:`How do you know a player actually read it?`,
      red:`Answers with notes and audio logs, which is the vocabulary the topic warns about.` },
    { q:`Pick a space where something happened. Give me three pieces of evidence.`,
      a:`Choose the event first, then the traces: a barricade built from the wrong side, a meal interrupted, a single set of tracks leading out. Arrange them so the sequence can be inferred. One should be readable in passing, the others should reward stopping.`,
      follow:`Which of the three is readable at a walking pace?`,
      red:`Proposes a text log that states what happened.` },
    { q:`How do you decide whether a story beat must be read in passing or rewards stopping?`,
      a:`By whether the player needs it. Must-read material goes on the primary sightline at the pace the space is traversed. Optional material goes off the line, where only the players who look will find it. Both are valid, and the mistake is not deciding which you built.`,
      follow:`What about something that only makes sense on a second visit?`,
      red:`Puts everything on the critical path so nothing is missed.` }
  ],
  mid:[
    { q:`Give me an example of an environment making a promise the systems cannot keep.`,
      a:`A locked armoury with visible weapons that can never be opened, a door with an interaction highlight that is scenery, a distant landmark the player cannot reach. The player spends real effort trying to collect. Either deliver it or remove the affordance, and remember that detail with no mechanic behind it is fine as long as it does not read as usable.`,
      follow:`The art team wants the door for the composition. What do you propose?`,
      red:`Dismisses it as a player misunderstanding.` },
    { q:`How do you test environmental storytelling?`,
      a:`Ask players what they think happened in the space and compare with intent. Watch where they stop unprompted. Track which promises they tried to collect on. That gives you a read rate, an accuracy rate and a list of broken promises.`,
      follow:`Half the testers invent a different story that is also coherent. Is that a failure?`,
      red:`Asks testers whether the environment looked good.` },
    { q:`Your only vocabulary is corpses and notes. Expand it.`,
      a:`Use arrangement, wear, absence and trajectory: furniture moved to block something, a path worn into the floor, a shelf emptied of one category, tools dropped in a line. Add contradiction, where two traces disagree and the player resolves it. Notes stay for the cases where language is genuinely the artefact.`,
      follow:`How many unique props can you afford before it stops scaling?`,
      red:`Adds more note variants with better writing.` }
  ],
  senior:[
    { q:`Sixty environment artists and three writers. How do you scale environmental storytelling?`,
      a:`Give the artists a vocabulary rather than scripts: kits of evidence with meanings attached, and a one-page brief per space that names the event and who passed through. Reserve authored exceptions for the spaces on the critical path. Review against the sightline and the traversal pace, because that is where it fails in volume.`,
      follow:`How do you stop the vocabulary flattening into wallpaper?`,
      red:`Writes a style guide, distributes it, and treats the problem as solved.` },
    { q:`How do you budget this against level throughput?`,
      a:`Tier the spaces. Critical-path spaces get authored evidence and a stop-rate target. Connective spaces get kit dressing that stays consistent with the grammar. Measure with playtest stop rate and with what players narrate back, then move budget toward the tiers that actually produce recall.`,
      follow:`What is the first thing you cut when the level count rises?`,
      red:`Spreads the same detail density everywhere and runs out of schedule.` }
  ] });

INTERVIEW('narrative-agency',{
  junior:[
    { q:`What is player agency in story, and is more branching always better?`,
      a:`Agency is the perception that the player shaped events. Branch count is expensive and mostly invisible, so one consequence the player sees and connects to their choice beats ten they never meet. Start with visibility, then spend on branches where replay is expected.`,
      follow:`What is the cheapest acknowledgment you can give a choice?`,
      red:`Counts endings as the measure of agency.` },
    { q:`Name the kinds of consequence a choice can have.`,
      a:`Cosmetic, situational and structural. All three are legitimate, and the problem is only when the player expects one kind and gets another. Signal the scale honestly, because a choice that presents as structural and lands as cosmetic costs trust.`,
      follow:`How do you signal which kind a choice is without spoiling it?`,
      red:`Promises every choice is structural.` },
    { q:`Why is fake choice dangerous?`,
      a:`Players detect convergence within an hour, and once they do they stop treating any later choice as real. That poisons the choices that genuinely matter, which are usually the expensive ones. A visible small consequence is worth more than an invisible large one.`,
      follow:`How would you detect it in a playtest?`,
      red:`Assumes players will not notice if the convergence is well written.` }
  ],
  mid:[
    { q:`Your consequences land six hours after the choice. What do you do?`,
      a:`Add an acknowledgment near the choice so the player knows it was recorded, then restate the cause when the consequence arrives, through a character, a changed space or a reputation. The player has to connect the two without being told a sentence they no longer remember. If the link cannot be made, the branch is not buying agency.`,
      follow:`How long a gap is too long?`,
      red:`Adds a journal entry and assumes players read it.` },
    { q:`How do you surface emergent narrative from systems?`,
      a:`Give the systems a voice: characters that react to state, a log that names what happened in the player's terms, a summary at a rest beat. Emergent stories are the ones players retell because they are theirs, but only if the game notices them. Pick a small number of state changes worth commenting on.`,
      follow:`What happens when the systemic beat contradicts the authored one?`,
      red:`Assumes emergence is automatic because the systems interact.` },
    { q:`A dialog wheel where all four options converge. Defend it or fix it.`,
      a:`If it is expressive choice, keep it and be honest: the player chooses how their character speaks, not what happens. Make the expression visible, in tone, reputation or how one character treats them. If it was meant to matter, give one option a situational consequence rather than a new branch.`,
      follow:`You can afford one real branch in that scene. Where do you put it?`,
      red:`Defends convergence as necessary and changes nothing about what the player perceives.` }
  ],
  senior:[
    { q:`You have budget for five authored branches in a forty hour game. Where do you spend them?`,
      a:`At the moments players talk about and replay: the identity-defining choice, the ally kept or lost, the ending shape. Put them where systems cannot produce the same feeling, and let systemic consequence carry the rest. Spreading them evenly buys the least perceived agency per unit of cost.`,
      follow:`How do you measure perceived agency rather than branch count?`,
      red:`Distributes them evenly across the chapters so every act has one.` },
    { q:`A cutscene undoes a choice the player made. You are the lead. What now?`,
      a:`Treat it as a trust problem rather than a scene problem. Either the choice was not real and should be reframed as expressive, or the scene needs to respect it, usually with a variant that is cheaper than it sounds. Whatever you decide, make sure the player is not shown their agency being deleted.`,
      follow:`The writer's draft depends on that scene. How do you run the conversation?`,
      red:`Keeps both and hopes the player forgets what they chose.` }
  ] });

INTERVIEW('narrative-pacing',{
  junior:[
    { q:`What does it mean to say story beats are pacing beats?`,
      a:`They land on the same intensity curve as the play, so a beat placed on a peak competes with the peak and a beat placed at rest makes the rest meaningful. That is why story and level plans belong on one timeline rather than in two documents owned by two disciplines.`,
      follow:`Where on the curve would you put a long scene?`,
      red:`Keeps a separate story schedule and calls integration a handoff.` },
    { q:`Why is front-loaded exposition a problem?`,
      a:`It arrives before the player has done anything, so they have no questions for it to answer and no reason to care. Move it after the first meaningful play and deliver it as the answer to something the play raised. What they do first is what they remember.`,
      follow:`Your premise genuinely needs setup. How do you deliver it?`,
      red:`Argues players need the setup before they can enjoy the game.` },
    { q:`What is wrong with an unskippable scene at a retry point?`,
      a:`The player is going to see it many times in a row at the moment they are most frustrated, and it converts a fair challenge into a punishment. Put nothing unskippable between a death and the next attempt. If the beat matters, play it once and let the retry start after it.`,
      follow:`What if it is the boss introduction and it sets up the fight?`,
      red:`Keeps it unskippable because the scene is important.` }
  ],
  mid:[
    { q:`Build an integrated timeline. What is the process?`,
      a:`Put story beats with durations next to the level and intensity plan on one axis. Flag beats landing on peaks, exposition before the first meaningful play, non-interactive stretches beyond your limit, and anything at a retry point. For each flag, relocate it or convert it to in-play delivery. Then review it with both disciplines in the same room.`,
      follow:`What limit do you set for non-interactive time per hour, and how did you pick it?`,
      red:`Produces a story outline with no reference to the play curve.` },
    { q:`Convert a five minute cutscene into in-play delivery.`,
      a:`Split it into what is information and what is authored emotion. Information moves to dialog during traversal, to the environment, or to a system reacting. The emotional core stays as a short scene at the moment it is earned. You lose staging control and gain flow, so be explicit about which beats cannot survive the move.`,
      follow:`What do you lose, and when is that loss unacceptable?`,
      red:`Cuts the scene in half and keeps the same delivery.` },
    { q:`Players cannot remember the plot between sessions. What do you change?`,
      a:`Check beat frequency and whether the story is delivered in play, because beats the player performed are the ones they retain. Anchor the plot to a small number of characters and an ongoing want. Add a recap that costs a returning player nothing, and re-test recall a week later rather than immediately.`,
      follow:`How do you recap without insulting the player who just played yesterday?`,
      red:`Adds a longer opening summary.` }
  ],
  senior:[
    { q:`Writers own the story schedule and designers own the level schedule. Merge them.`,
      a:`Make the merged timeline the artifact both sides plan against, with beats, levels and intensity in one view. Give it a standing review and a named arbiter for collisions. Gate content on both sides so a level cannot ship without its beat and a beat cannot ship without a place to live.`,
      follow:`Who arbitrates when the peak and the beat both have to be there?`,
      red:`Adds a synchronisation meeting and keeps two documents.` },
    { q:`Skip rate on a key scene is sixty percent. Diagnose it.`,
      a:`Find where in the scene they skip, because an immediate skip is a different problem from a skip at ninety seconds. Check whether the beat arrived before the player cared and whether it is placed at a retry point. Then shorten it, move it, or deliver it in play, and measure the rate again rather than trusting the redesign.`,
      follow:`The plot does not work without that scene. What do you do?`,
      red:`Makes the scene unskippable so the information lands.` }
  ] });

/* ---------------- PRESENTATION ---------------- */

INTERVIEW('visual-language',{
  junior:[
    { q:`What is visual language, and how is it different from art direction?`,
      a:`Art direction sets the mood and the style. Visual language is the grammar: what danger looks like, what is interactable, what is friend and foe, what is valuable. Both must stay consistent, and the grammar is the half that decides whether the player can act.`,
      follow:`Name the ten meanings your last game had to communicate instantly.`,
      red:`Answers with style references and mood boards and never mentions a meaning the player must read.` },
    { q:`Why should one signal carry only one meaning?`,
      a:`Because a signal that sometimes means danger and sometimes means decoration teaches the player to ignore it. Once they stop trusting the grammar, every later signal costs more to establish. Give each meaning its own signal set across shape, colour, motion and sound.`,
      follow:`Art wants red for both the enemy faction and for hazards. What do you propose?`,
      red:`Plans to explain the exception in the tutorial.` },
    { q:`What do the squint test and the desaturation test show you?`,
      a:`Squinting removes detail and leaves the hierarchy, so you see what actually dominates. Desaturation removes hue and shows what survives for a player who cannot rely on colour. Both are cheap, take a screenshot, and answer whether the grammar reads before the art does.`,
      follow:`The key meanings vanish in the desaturated frame. What is your fix order?`,
      red:`Treats them as art critique tools rather than readability checks.` }
  ],
  mid:[
    { q:`Build a visual grammar table for a game with a grounded style.`,
      a:`List the meanings the player must read instantly, then assign each a signal set across shape, colour, motion and audio. Flag collisions where one signal carries two meanings and gaps where a meaning has only one channel. Prefer diegetic signals in a grounded world: silhouette, material, damage state, posture. Then list what in a normal scene is noise relative to that table.`,
      follow:`You need a threat marker and floating icons would break the fiction. What do you use?`,
      red:`Reaches straight for HUD markers and outlines in a world that had diegetic options.` },
    { q:`Realistic styles are harder to read. How do you manage that?`,
      a:`Use value separation, silhouette discipline and lighting to carry the grammar, and reserve saturation for meaning rather than for beauty. Accept targeted violations of realism where a meaning must survive, and pick them deliberately rather than discovering them in bug reports. Verify on the target device, not on a reference render.`,
      follow:`The art director will not change the palette. What is your next move?`,
      red:`Adds outlines and icons over a realistic scene as the first solution.` },
    { q:`How do you test that the grammar teaches?`,
      a:`Show new players objects they have never seen and ask what they expect: dangerous, usable, valuable, ignorable. Correct inference means the grammar is doing the teaching. Repeat after each content batch, because grammar drifts as the asset count grows.`,
      follow:`How many objects and how many players before you trust the result?`,
      red:`Asks the team whether the new asset reads clearly.` }
  ],
  senior:[
    { q:`A live game with four content teams has drifted into palette chaos. Fix it.`,
      a:`Publish the grammar table as the gate rather than as guidance, and audit each release against it. Give the teams a signal budget so a new feature cannot claim a channel that is already spoken for. Instrument confusion where you can, then stage the corrective passes on the highest-traffic modes first.`,
      follow:`A licensed collaboration arrives with assets that break the grammar. How do you handle it?`,
      red:`Runs one cleanup pass with no gate and expects the drift not to return.` },
    { q:`Marketing wants a beauty pass that hides gameplay-critical signals. Argue it.`,
      a:`Bring the death-cause data and a desaturated frame of the proposed look. Offer the spectacle where the player has no decision to make, and offer a photo mode for the capture. The position is not that beauty is wrong, it is that a signal budget is finite and the decision moments own it.`,
      follow:`What evidence would change your mind?`,
      red:`Concedes to the better-looking frame, or refuses without offering an alternative.` }
  ] });

INTERVIEW('game-feel-and-juice',{
  junior:[
    { q:`What is game feel, and what is juice?`,
      a:`Game feel is real-time control of a virtual object in a simulated space, the moment-to-moment sensation of steering something. Juice is the emphasis layer on top: hit-stop, camera shake, squash and stretch, particles, sound. Juice amplifies feedback that already exists and cannot manufacture meaning the design lacks.`,
      follow:`What does juice not fix?`,
      red:`Uses the two terms interchangeably and treats both as effects work.` },
    { q:`When do you start polishing?`,
      a:`After the bare loop is voluntarily replayed in grey boxes. Polish on a loop that is still changing gets thrown away, and polish on a weak loop delays finding out it is weak. Feel basics such as input latency and clear feedback are not polish, they are legibility, and they come first.`,
      follow:`What counts as evidence that the loop is validated?`,
      red:`Polishes early because it makes the build motivating to work on.` },
    { q:`Where does juice sit relative to the input response?`,
      a:`After it. The acknowledgement of the input should land inside roughly 100 milliseconds, then the emphasis plays. An effect that delays the action itself trades feel for spectacle and players read it as lag.`,
      follow:`Hit-stop freezes the action, so is that not added latency?`,
      red:`Adds a wind-up effect in front of the response and calls the result weighty.` }
  ],
  mid:[
    { q:`Everything in our game is juiced and nothing stands out. Diagnose it.`,
      a:`Rank actions and outcomes by importance and compare with the emphasis each currently gets. Uniform juice flattens the hierarchy, so the biggest thing must look biggest and the routine thing must be quiet. Remove before adding, then check readability again with a what-killed-you pass.`,
      follow:`What do you remove first?`,
      red:`Adds more emphasis to the important action and leaves the rest alone.` },
    { q:`The build looks great and players stop after ten minutes. What happened?`,
      a:`Juice on a weak loop buys the first ten minutes and nothing after. Strip the emphasis in a test build and see whether the bare loop is still replayed. Count decisions per minute and check whether the situation changes between iterations. If it does not, the work is in the loop, not in the effects.`,
      follow:`You cannot strip it because that build is the publisher demo. What now?`,
      red:`Adds more content to extend the ten minutes.` },
    { q:`How many channels do you spend on one action, and why?`,
      a:`Usually two or three: animation plus audio, with camera or hit-stop reserved for the outcomes that matter. The budget exists because every channel spent on a routine action is noise over the readable state. Test with and without and keep the version where the feedback is clearer, not louder.`,
      follow:`Which channel gives the most per unit of cost?`,
      red:`Stacks every channel on every action and judges the result by how it looks in a clip.` }
  ],
  senior:[
    { q:`Set the polish gate for a studio. What does it look like?`,
      a:`Split the work into legibility, which is required before any test means anything, and emphasis, which needs validation evidence for the system it sits on. Rank emphasis tasks by impact per hour on the most frequent player actions. Re-test readability after each pass, and record which systems have evidence so the gate is checkable rather than cultural.`,
      follow:`A milestone demo needs to look finished next month. How do you hold the gate?`,
      red:`Ranks all polish tasks together and lets the schedule decide the order.` },
    { q:`Players say the game feels floaty. Turn that into work.`,
      a:`Decompose it: input latency, animation commitment and recovery, camera response, acceleration curves, feedback on contact. Each is measurable and each produces a different complaint. Fix the measurable ones first and re-ask the question, because floaty is a summary of several defects and the team will otherwise argue about taste.`,
      follow:`What would you measure to know weight improved?`,
      red:`Adds screen shake and heavier sound effects and asks whether it feels better now.` }
  ] });

INTERVIEW('audio-and-music',{
  junior:[
    { q:`Why is audio the fastest feedback channel?`,
      a:`It reaches the player while their eyes are busy elsewhere, which makes it the main channel for off-screen and peripheral information. It also carries emotional state more directly than any other element. That is why critical warnings usually live in sound first.`,
      follow:`Which of those signals still needs a visual backup, and why?`,
      red:`Treats audio as atmosphere added at the end.` },
    { q:`What does the mix have to do with hierarchy?`,
      a:`The loudest thing is what the player hears first, so the mix is a ranking whether or not anyone planned it. Feedback should sit above ambience and warnings above music. If the most important cue is not the most audible one, the mix is inverted.`,
      follow:`How would you check that in a busy combat scene?`,
      red:`Describes the mix as an audio department concern with no design input.` },
    { q:`What do the mute test and the eyes-closed test reveal?`,
      a:`Muting shows which information existed only in sound, which is both an accessibility gap and a problem for players in noisy rooms. Closing your eyes shows whether the key signals are distinct enough to act on without vision. Both take minutes and both find real gaps.`,
      follow:`Your game fails the mute test on one critical signal. What do you do?`,
      red:`Concludes that players should use headphones.` }
  ],
  mid:[
    { q:`Design a music-state model for a stealth game.`,
      a:`Define states tied to game state: unaware, suspicious, searching, alerted, resolved, and the transitions between them with the rules for entering each. Match the intensity curve so music tracks tension rather than playing regardless. Guard against thrashing between states, because rapid switching reads as a bug.`,
      follow:`How do you keep it from feeling manipulative or repetitive over twenty hours?`,
      red:`Plays a single combat track whenever an enemy is nearby.` },
    { q:`Why is information carried in audio only a defect?`,
      a:`Players with hearing impairments lose it, players in loud rooms lose it, and players on phone speakers lose it. Redundancy costs one visual channel and buys the signal for everyone. The fix is a distinct visual for the same meaning, not a subtitle line describing the sound.`,
      follow:`How do you add the redundancy without cluttering the HUD?`,
      red:`Adds a text caption that names the sound and considers it handled.` },
    { q:`Two critical cues collide in the mix. Resolve it.`,
      a:`Give them distinct character, duration and frequency range so they do not mask each other, then set an explicit priority rule with ducking for the lower one. Publish the priority list so new content cannot claim the top slot by being loud. Verify in the worst case, not in isolation.`,
      follow:`Who owns that priority list as the content grows?`,
      red:`Raises the volume of the more important cue and moves on.` }
  ],
  senior:[
    { q:`Audio was hired late. What has been lost and what can you recover?`,
      a:`What is lost is signal design that should have shaped the systems: cues as part of the feedback matrix, states hooked into game state, events instrumented at the source. Recover by instrumenting the events first, then building the mix hierarchy around the critical signals, then music states. Identity and ambience come last because they depend on the rest.`,
      follow:`You have three months. What is the first thing you do?`,
      red:`Starts with the soundtrack because it is the most visible deliverable.` },
    { q:`How do you evaluate whether the music is doing its job?`,
      a:`Ask players to describe the mood of a section and compare with the intended curve. Watch whether they turn the music off and when. Check that rest and peak do not sound the same. Liking is not the measure, tracking the intensity curve is.`,
      follow:`Testers say they like the score and turn it off after an hour. What does that mean?`,
      red:`Reports positive comments about the soundtrack as evidence it works.` }
  ] });

INTERVIEW('animation-and-vfx',{
  junior:[
    { q:`What is a telegraph, and what makes one fair?`,
      a:`The anticipation that tells the player what is coming. It is fair when the window is long enough for a human to perceive and answer it at the intended camera distance, with the visual noise the scene actually has. The window and the punishment must be sized against each other, because a short tell with a heavy cost reads as cheating.`,
      follow:`How short is too short, and how did you arrive at that number?`,
      red:`Treats telegraph length as an animation preference rather than a rule.` },
    { q:`What is commitment, and does the player know it?`,
      a:`The period during which the player cannot change their decision: the swing, the recovery, the cancel window. It is a rules decision expressed through animation, so it has to be legible before the input and consistent after it. If players cannot feel where the commitment ends, they read the result as random.`,
      follow:`How do you communicate a cancel window?`,
      red:`Describes animation timing purely as a matter of how good the motion looks.` },
    { q:`Give an example of visual effects carrying state, and how that fails.`,
      a:`Burning, shielded, empowered and stunned are all states players must read at a glance, faster than any icon. The failure is a collision, such as a healing effect that reads like fire, or a buff and a debuff sharing a colour. Verify by showing a new player the state and asking what they think it does.`,
      follow:`How do you verify a new effect does not collide with an existing one?`,
      red:`Assumes the effect is clear because the team knows what it means.` }
  ],
  mid:[
    { q:`Players say attacks arrive with no warning. Investigate.`,
      a:`Cluster the deaths by attack and look at what was on screen at the moment of the tell. Check telegraph duration against reaction time, then check occlusion, camera framing and effect noise. Confirm whether an audio cue exists for the off-screen case. The fix is usually visibility, not duration.`,
      follow:`The telegraph is 600 milliseconds but the attacker is off screen. What changes?`,
      red:`Lengthens every telegraph without finding which ones were actually unseen.` },
    { q:`Why define windows as rules first and animate to them second?`,
      a:`Because the windows are the fairness and the balance, and animation is how they are communicated. If the animation sets the timing, every artistic revision silently rebalances the fight. Publish frame data as the source of truth and let the animator work against it.`,
      follow:`The animator insists a longer wind-up is needed for the motion to read. How do you resolve it?`,
      red:`Lets the animation drive the numbers and rebalances afterwards.` },
    { q:`What do you check at the top ten decision moments for the camera?`,
      a:`What is hidden, what the camera is fighting, whether the threat is framed, and whether lock-on or auto-framing takes control at the wrong instant. A dramatic camera that hides a telegraph converts a fair fight into an unfair one. Capture the moments and review them as frames, not as a feeling.`,
      follow:`The most dramatic camera angle hides the second enemy. What do you do?`,
      red:`Judges the camera on how the footage looks in a trailer.` }
  ],
  senior:[
    { q:`Beautiful animation and a persistent fairness complaint. Plan the fix.`,
      a:`Audit every attack for window against punishment, then for visibility given noise and camera. Separate the attacks that are too fast from the ones that are merely unseen. Change telegraph length, visibility or punishment rather than damage alone, and re-measure with the same death clustering you used to find it.`,
      follow:`Expert players say the fight got easier. How do you answer that?`,
      red:`Reduces damage across the board and declares the fairness issue solved.` },
    { q:`How do you own the boundary between animation and combat design across a large team?`,
      a:`One source of truth for the windows, readable by both disciplines, with tooling that shows frame data next to the animation. Put the window spec in the review gate so a motion change that moves a window is a visible change. Review in the build at the target camera, because the numbers and the perception can disagree.`,
      follow:`What is the artifact both disciplines sign off on?`,
      red:`Relies on the two teams talking to each other and calls that the process.` }
  ] });

/* ---------------- PRODUCT ---------------- */

INTERVIEW('audience-and-positioning',{
  junior:[
    { q:`Give me the positioning sentence for a game you know well.`,
      a:`Use the shape: for this player who wants this, it is the game that does this, unlike these alternatives. Name the alternatives honestly, because the sentence only means something against them. Then say whether the differentiator would be visible in one screenshot.`,
      follow:`Is that differentiator visible in the first ten minutes, or only after ten hours?`,
      red:`Answers with a genre label and a feature list.` },
    { q:`Why does it matter whether your differentiator is a feature or an experience?`,
      a:`Experiences travel by word of mouth because a player can describe how it felt in a sentence. Features have to be listed, compared and usually met after hours of play. A feature differentiator also gets copied faster than an experience does.`,
      follow:`Give an example of each from games you play.`,
      red:`Names a bullet from the store page and calls it positioning.` },
    { q:`What can you learn from the complaints about comparable games?`,
      a:`They show wants the audience has that nothing currently serves, which is a differentiator someone has already demonstrated demand for. Read reviews and forums for the recurring ones rather than the loudest ones. Then check whether answering that complaint is something your design can actually do.`,
      follow:`How do you tell a genuine unmet want from a vocal minority's preference?`,
      red:`Treats their own dislikes as the market's complaints.` }
  ],
  mid:[
    { q:`Your differentiator only becomes visible after ten hours. What do you do?`,
      a:`For the market it does not exist, so you have three options: pull it forward into the first ten minutes, reposition on something that is visible, or accept it and find a different hook for the store page. Pick by cost and by whether the earlier version still represents the game honestly. Test the new sentence on strangers before committing.`,
      follow:`Pulling it forward means rebuilding a system. How do you decide?`,
      red:`Assumes the trailer can convey what the game cannot show in ten minutes.` },
    { q:`How do you use positioning as a scope gate?`,
      a:`Every candidate feature has to sharpen the sentence. If it does not, it waits, because it dilutes the thing that makes the game findable and describable. Run the backlog against the sentence on a fixed cadence, and keep the list of things it excluded so the decisions are visible.`,
      follow:`A well-liked feature dilutes the sentence. How do you handle that conversation?`,
      red:`Keeps the sentence as a marketing artifact and never applies it to the backlog.` },
    { q:`How do you test positioning cheaply?`,
      a:`Show strangers one screenshot and the sentence and ask what they expect the game to be. Then, after a first session, ask testers to describe the game to a friend and compare with your sentence. The gap between what the sentence promises and what the play delivers is the finding.`,
      follow:`Testers describe a different game than the sentence. What does that mean?`,
      red:`Surveys existing fans, who already know what the game is.` }
  ],
  senior:[
    { q:`A publisher wants the positioning widened to reach more players. How do you respond?`,
      a:`Explain what sharp positioning buys: a niche that recommends you and a sentence people can repeat. Widening usually means the differentiator stops being visible, which is the failure mode that actually kills games. Bring the stranger test results, offer a version that widens the audience without softening the hook, and be clear about what you would cut instead.`,
      follow:`They control the funding and they are not persuaded. What do you do?`,
      red:`Widens the sentence on request and stops testing it.` },
    { q:`Three years in, a comparable ships your differentiator. Now what?`,
      a:`Re-dissect it and find what they actually delivered versus what they announced, because the gap is usually the opportunity. Look at the complaints their version generates and position against those. If nothing remains, say so early rather than shipping into a space someone else owns, and name what would have to change for the project to still make sense.`,
      follow:`What evidence would make you recommend cancelling?`,
      red:`Adds more features to out-scope the competitor.` }
  ] });

INTERVIEW('platform-and-session',{
  junior:[
    { q:`Why is session length a design constraint rather than a marketing detail?`,
      a:`It decides the size of the satisfying unit. A loop that takes twenty minutes to become interesting fails where the median session is five. Write the session profile first, then structure the game so every typical session contains a complete unit.`,
      follow:`What is the satisfying unit in a game you have worked on?`,
      red:`Treats session length as something to be measured after launch.` },
    { q:`What changes between a television at three metres and a phone at thirty centimetres?`,
      a:`Readable text size, information density, the precision the input can deliver, and how often play gets interrupted. The same HUD that works on one is unusable on the other, and the hierarchy has to be re-ranked rather than scaled. Posture matters too, because a phone is held with the thumbs over the screen.`,
      follow:`Which of those bites first when you port?`,
      red:`Answers only with resolution and aspect ratio.` },
    { q:`How does a game survive interruption?`,
      a:`Treat saving and resuming as core features rather than as plumbing. Let a session end at a natural point rather than only at a boss or a checkpoint an hour in. Then resume without a load screen full of menus, because the friction on return is what turns one interruption into churn.`,
      follow:`What do you do for a competitive match that cannot be paused?`,
      red:`Designs save points around level structure and calls interruption a player problem.` }
  ],
  mid:[
    { q:`Run a session fit audit on a plan.`,
      a:`Write the profile: median length, interruption frequency, device and posture. Identify the unit that fits inside the median session, or state that none does. Flag stretches that cannot be interrupted safely and skills that exceed the input precision of the device. Propose the smallest restructuring that gives every session a complete unit.`,
      follow:`Your unit is twenty-five minutes and the median session is twelve. What changes?`,
      red:`Audits the level plan without ever stating the session profile.` },
    { q:`Multi-platform. What do you hold constant and what do you allow to diverge?`,
      a:`Hold the loop, the grammar and the progression constant, because those are the game. Allow readability, input mapping, density and session structure to diverge, because those are the frame. Decide the divergence deliberately rather than discovering it in certification, and be explicit about which platform sets the floor for what.`,
      follow:`What happens to that answer if the platforms share progression?`,
      red:`Designs for the strongest platform and treats the others as ports.` },
    { q:`Which platform conventions would you break, and how do you decide?`,
      a:`Break one only when the game genuinely needs it and the cost of relearning is smaller than the gain. Back button semantics, confirm and cancel placement and store conventions are where players are least forgiving. Test the break with players who are fluent on that platform, not with the team.`,
      follow:`Certification requires the convention you wanted to break. Now what?`,
      red:`Breaks conventions because the team prefers a different layout.` }
  ],
  senior:[
    { q:`Port a game designed for forty-minute sessions to a handheld. Plan it.`,
      a:`Re-derive the satisfying unit for the new profile and restructure the content around it. Add save anywhere and fast resume, run a readability pass at the real distance, and re-map inputs for the precision available. Instrument real sessions early so the restructure is tested against behaviour rather than against the assumed profile.`,
      follow:`What would you cut rather than port?`,
      red:`Ships the same structure with a smaller UI scale.` },
    { q:`Telemetry says the median session is half your design assumption. What now?`,
      a:`Check the end reasons before redesigning: interruption, a natural stop, frustration and a crash look identical in a duration histogram. Then check whether players resume and how quickly. If the shortfall is structural, re-derive the unit. If it is friction on resume, that is far cheaper to fix than the content plan.`,
      follow:`Which of those two would you test first, and how?`,
      red:`Shortens levels immediately on the strength of one aggregate number.` }
  ] });

INTERVIEW('business-model',{
  junior:[
    { q:`Name three business models and what each pressures in the design.`,
      a:`Premium aligns incentives with making the game good and limits reach and the revenue tail. Free to play widens reach and creates constant pressure to monetise friction. Subscription pressures cadence and retention rather than any single purchase. Say which metric each pushes the team to optimise.`,
      follow:`Which metric would your team be pushed toward, and does it align with fun?`,
      red:`Describes the models as pricing choices with no design consequence.` },
    { q:`Explain the difference between selling value and selling relief.`,
      a:`Value is something the player would want in a game that had no store: expression, content, convenience they never needed to be annoyed into wanting. Relief is a purchase that removes pain the design manufactured. The test is whether the system would still exist if nobody could pay.`,
      follow:`Give one example of each from a game you have played.`,
      red:`Defends a timer as a pacing feature without asking who designed the wait.` },
    { q:`Why validate the loop before adding a store?`,
      a:`Monetisation attached to a loop nobody voluntarily repeats measures nothing and corrupts the design while you are still learning what it is. Prove the loop is replayed first, then design the model onto a thing that works. Otherwise every metric is about the store and none is about the game.`,
      follow:`What if the store model is the core of the pitch?`,
      red:`Designs the store first because that is what the business plan describes.` }
  ],
  mid:[
    { q:`Audit a design for monetisation-induced friction.`,
      a:`List every system and every number that exists primarily to create a purchase opportunity. For each, describe the pain it creates and whether the design manufactured that pain. Then describe what the game would feel like without it. The output is a list of systems that would improve the game by leaving, with the revenue they carry named honestly.`,
      follow:`One of them carries a large share of the revenue. What do you propose?`,
      red:`Calls the friction an industry standard and moves on.` },
    { q:`Non-payers should describe the game as complete. How do you test that?`,
      a:`Ask non-payers whether anything feels withheld and where. Ask payers why they bought, and code the answers as wanted or had to. Then watch for unprompted mentions of the store and note the tone. Behaviour and unprompted language are the evidence, not a satisfaction score.`,
      follow:`Non-payers say it feels complete and churn on day seven anyway. What does that tell you?`,
      red:`Reports conversion rate as evidence the model is healthy.` },
    { q:`Which metric will the model push you to optimise, and how do you keep it honest?`,
      a:`Name it in advance, then pair it with a countervailing signal so nobody can move one without showing the other. Session count paired with voluntary return, revenue per player paired with non-payer sentiment, retention paired with what players say they came back for. Report both in the same review.`,
      follow:`Leadership sets a revenue target that the countervailing signal contradicts. What do you do?`,
      red:`Optimises the metric handed down without ever asking whether it tracks the experience.` }
  ],
  senior:[
    { q:`You are asked to add a mechanic you believe is manipulative. Walk me through it.`,
      a:`Name specifically what makes it manipulative: manufactured pain, hidden odds, pressure rather than information. Propose an alternative that sells value and cost both. Bring evidence about trust and long-term retention rather than an appeal to principle alone. Then say where your own line is, because a line you never state is one nobody can plan around.`,
      follow:`They ship it anyway. What do you do next?`,
      red:`Refuses without proposing anything, or complies and stops raising it.` },
    { q:`The model changes from premium to free to play mid-development. What changes in the design?`,
      a:`The economy, the progression pacing, the session structure, the social systems, the content cadence and the metrics all change, because the model decides what retention means. Treat it as a redesign of the loop's surroundings rather than a store bolted on. Re-validate the loop under the new pacing before building any store content.`,
      follow:`What would you refuse to change, and why?`,
      red:`Adds a shop and a currency and treats the rest of the design as unaffected.` }
  ] });

INTERVIEW('scope-control',{
  junior:[
    { q:`What is the healthy sequence for adding a feature?`,
      a:`Idea, prototype, evidence, commit. The unhealthy one is idea straight to production commitment, which is how feature lists grow while the loop stays flat. Each step should be able to end the feature, and the cheapest steps come first.`,
      follow:`What is the unhealthy sequence, and where have you seen it?`,
      red:`Describes a planning process with no evidence step in it.` },
    { q:`What does a feature cost beyond building it?`,
      a:`Teaching it, balancing it, maintaining it as everything around it changes, and diluting the core by taking attention from it. Those costs recur, while the build cost happens once. Most estimates count only the build.`,
      follow:`Which of those is forgotten most often?`,
      red:`Estimates in engineering days and stops.` },
    { q:`What is a not-list and why write it down?`,
      a:`The written list of things this game is not going to be, with the reason. It converts a hundred future arguments into one decision and gives the team a way to say no without relitigating the vision. It also records the trigger that would make you revisit each item.`,
      follow:`Who owns it and when is it reviewed?`,
      red:`Keeps the exclusions as a shared understanding nobody has written down.` }
  ],
  mid:[
    { q:`Someone says AI can build the feature in a day, so we should build it. Respond.`,
      a:`Cheap implementation removes the natural brake on scope, so the brake has to become deliberate. The build was never the expensive part: teaching, balancing, maintaining and dilution are, and none of them got cheaper. The right conclusion from cheap building is to prototype more and commit less.`,
      follow:`The prototype already exists and looks good. Does that change your answer?`,
      red:`Accepts low build cost as the argument for building.` },
    { q:`The feature list grows every sprint and the loop metrics do not move. Diagnose it.`,
      a:`Sort the list by the validated result each feature depends on. Most of it will depend on something nobody has tested, which is the actual problem. Gate new production commitments on a prototype result, and run a monthly review that separates what has evidence from what is imagination.`,
      follow:`What do you cut first, and how do you defend the choice?`,
      red:`Proposes better prioritisation without adding any evidence gate.` },
    { q:`How do you cut a feature the team loves?`,
      a:`Show the evidence and the cost side by side rather than arguing taste. Document the reason and the player-evidence trigger that would bring it back, so the work is shelved rather than dismissed. Preserve what can be reused and say so, because the sting is usually about the effort, not the feature.`,
      follow:`It is the creative director's favourite. How does the conversation go?`,
      red:`Cuts it quietly and lets people discover it missing.` }
  ],
  senior:[
    { q:`Six months from ship and clearly over scope. Build the cut list.`,
      a:`Order by dependency so you are not cutting something three other things need. Protect the core experience and cut whole features rather than shaving quality everywhere, because uniform quality reduction shows up in every review. Count the teaching and balance cost you recover, and publish the list with the reason attached to each line.`,
      follow:`How do you choose between cutting a feature and cutting quality?`,
      red:`Reduces polish across the board and keeps every feature.` },
    { q:`How do you make scope control a team habit rather than a lead's nagging?`,
      a:`Put the evidence gate into the process the team already follows, so a commitment needs a prototype result to move forward. Keep the not-list visible and update it in public. Budget prototype time explicitly, because a team with no time to test will commit by default. Then show one case where the gate saved the schedule.`,
      follow:`What does the first month of that look like?`,
      red:`Relies on a strong lead saying no and calls that the process.` }
  ] });

INTERVIEW('learning-from-success',{
  junior:[
    { q:`Pick a game your target player already plays and dissect it.`,
      a:`Use one template: the want it serves, the core verb, the first thirty seconds, the decision the player faces every minute, the engines it runs on, why it worked, and what players complain about. Then say what a copy of it would most likely leave out. The dissection is about mechanisms, not features.`,
      follow:`What is the mechanism its success actually rested on?`,
      red:`Lists the features it shipped with and calls that the reason it worked.` },
    { q:`Why is a pitch of the form this game but with a different theme weak?`,
      a:`Because the difference is cosmetic and the player's reason to switch has to be mechanical or experiential. A theme is not a want. Most weak ideas are a comparable with a cosmetic difference, and the dissection is what makes that visible before months of work.`,
      follow:`What would make the difference strong instead?`,
      red:`Defends the theme as the differentiator with no mechanical change behind it.` },
    { q:`Where do you get trustworthy information about why a game succeeded?`,
      a:`Postmortems, conference talks, developer interviews and critical consensus, with a source attached to each claim or an explicit unknown. Sales figures say it sold, not why it kept people. Success narratives are where confident invention thrives, so verify anything you plan to rely on.`,
      follow:`An AI assistant gives you a confident postmortem detail with no source. What do you do?`,
      red:`Cites sales numbers as the design lesson.` }
  ],
  mid:[
    { q:`Cross-reference a concept against three dissected comparables. What do you ask?`,
      a:`Which proven want you share, what you do that none of them do, which recurring complaint you answer, which patterns you borrowed and whether you re-derived them from your own player and constraints, where a fan of each would find you weaker, and whether the team can reach the quality bar they set. Then name the cheapest test of the answer.`,
      follow:`Your differentiator is not visible in a screenshot. What changes?`,
      red:`Runs the comparison and concludes the concept is stronger on every dimension.` },
    { q:`Copies fail on what they leave out. Give a concrete case.`,
      a:`Pick a game whose imitators kept the structure and dropped the mechanism: the readability that made each placement a reasoned decision, or the pace that made each failure legible. Name the load-bearing part and show what happens to the loop without it. Then point at your own equivalent.`,
      follow:`How do you identify the load-bearing mechanism rather than guessing?`,
      red:`Reproduces the feature list of the original and expects the same result.` },
    { q:`How do you choose which comparables to dissect?`,
      a:`The games your player would stop playing to play yours, not the games you admire. That means asking your player model what they actually play for this want. Include the uncomfortable ones, because they are the direct competition for the same hours.`,
      follow:`Your player plays a genre your team cannot build. What does that tell you?`,
      red:`Chooses critically acclaimed games the target audience does not play.` }
  ],
  senior:[
    { q:`The comparables set a quality bar your team cannot reach. What do you do?`,
      a:`Be specific about which dimensions matter for the want and which do not, because a team rarely has to match on everything. Then either narrow the game so the team can be excellent on the dimensions that matter, reposition on a want with a lower bar, or recommend not making it. Say which evidence would settle which dimensions matter.`,
      follow:`How do you establish which dimensions the want actually depends on?`,
      red:`Assumes hard work will close a gap in production capacity.` },
    { q:`Your studio treats studying comparables as copying. How do you change that?`,
      a:`Separate dissection from imitation explicitly: the output is a mechanism and an unmet want, and every borrowed pattern has to be re-derived from your own player and constraints before it enters the design. Run the first session yourself on a game everyone respects and finish with a steelman against your own concept. The credibility comes from the steelman.`,
      follow:`How would you run that first session?`,
      red:`Presents comparables as templates to match feature for feature.` }
  ] });

INTERVIEW('launch-and-discoverability',{
  junior:[
    { q:`What is the store page's job?`,
      a:`It is where the game is judged before anyone plays it, so it must state the hook in a sentence a stranger can repeat and promise only what the first ten minutes deliver. Build the capsule around the core verb rather than around a logo. Treat it as the first level, because it is the first thing the player has to read.`,
      follow:`A stranger sees only the capsule. What do they say the game is?`,
      red:`Describes the page as a marketing deliverable outside the design's responsibility.` },
    { q:`What should the first minute of a trailer show?`,
      a:`What the player does. The verb, the decision and the consequence, in that order, with enough clarity that someone can imagine their own hands on it. A trailer that shows only cinematics tells the viewer nothing about the game they would buy.`,
      follow:`Your loop takes ten minutes to become interesting. What do you show?`,
      red:`Opens with a logo and a cinematic and considers the hook covered.` },
    { q:`What are wishlists and demos for?`,
      a:`They convert attention into volume at launch and give you a measurable signal before you commit to the date. A demo also tests whether the page promise and the first minutes agree. Both produce numbers you can act on while there is still time.`,
      follow:`The demo has plenty of downloads and poor conversion. Where do you look?`,
      red:`Treats them as marketing tasks with no design signal in them.` }
  ],
  mid:[
    { q:`The page promises something the first ten minutes do not deliver. Options?`,
      a:`Change the page, change the first ten minutes, or accept the mismatch and expect refunds and early negative reviews. Measure which is cheaper and which is honest. The mismatch is usually cheapest to fix in the game's first minutes, because that work also improves onboarding.`,
      follow:`The promise is what built the wishlists. Does that change the answer?`,
      red:`Keeps the promise because it converts and treats the refunds as unrelated.` },
    { q:`Build a discoverability plan with no budget.`,
      a:`List the beats that could build an audience, ordered by cost and expected effect, and pick the one demo or festival moment that best shows the loop. Use the language players of the comparables actually use rather than your internal vocabulary. Make sure the loop is legible on a stream, because that is free reach you either earn or forfeit.`,
      follow:`Your loop is not legible to a viewer who is not playing. What do you change?`,
      red:`Lists channels and posting frequency with no reference to what the game shows.` },
    { q:`How do you test the capsule?`,
      a:`Show it to ten matched players with no other context and ask what the game is and what they would do in it. Compare with your hook sentence. Wrong verbs and vague genres are the failure, and they point at the capsule rather than at the game.`,
      follow:`They name the right genre and the wrong verb. What do you change?`,
      red:`Polls the team and the existing community about which capsule they prefer.` }
  ],
  senior:[
    { q:`Discovery is the main failure mode of finished games. How do you make it a design constraint from month one?`,
      a:`Require that the hook is visible in one screenshot and provable in the first minute, and hold the design to that as you would to a platform constraint. Put the audience-building beats in the milestone plan rather than in a marketing plan attached at the end. Then decide what you will not design because it cannot be shown.`,
      follow:`What have you refused to build on those grounds?`,
      red:`Treats discoverability as something marketing solves after content lock.` },
    { q:`The launch underperforms. What do you learn, and what do you refuse to conclude?`,
      a:`Separate discovery from conversion from retention: page views, wishlist conversion, demo to purchase, refund rate and day-one retention each point at a different failure. Do not conclude the game is bad from a low top-line number until you know which step leaked. Then act on the leaking step rather than on the loudest opinion.`,
      follow:`The team wants to patch in more content immediately. What do you say?`,
      red:`Concludes the content was too thin without checking whether anyone reached it.` }
  ] });

INTERVIEW('live-operations',{
  junior:[
    { q:`What goes into the first update after launch, and how do you decide?`,
      a:`Split it into fixes and additions and label which is which, because players read them differently. Prioritise the problems real players found that testing missed, especially exploit and balance issues that get worse with time. Say what signal you will watch to know each change worked.`,
      follow:`How do you choose a cadence you can keep?`,
      red:`Leads with new content while the launch-week defects are still open.` },
    { q:`Why is a roadmap a design commitment rather than a marketing asset?`,
      a:`Publishing it promises support the team has to be able to deliver, and players plan their time around it. A roadmap the team cannot build costs more trust than no roadmap at all. Size it against real capacity, including the time the same people spend on fixes.`,
      follow:`You have published one you can no longer keep. What do you do?`,
      red:`Publishes an ambitious roadmap to sustain interest and works out the capacity later.` },
    { q:`What is wrong with nerfing in silence?`,
      a:`Players notice the change and learn that the patch notes do not describe the game, which makes every future note suspect. Say what changed and why, including the uncomfortable ones. Communication costs nothing and is the main thing a live community judges you on.`,
      follow:`How do you communicate a nerf that a lot of players will dislike?`,
      red:`Leaves balance changes out of the notes to avoid an argument.` }
  ],
  mid:[
    { q:`Plan the first ninety days before launch. What is in it?`,
      a:`A cadence the team can sustain alongside fixes, a feedback channel with a named owner, the signals you will keep watching from before launch, and a split between fixes and features for each planned update. Decide in advance what an emergency looks like and who can call one. Write down what you owe the players who arrived first.`,
      follow:`The same team is also starting the next project. How does the plan change?`,
      red:`Plans content drops with no capacity reserved for the problems players will find.` },
    { q:`The community demands a change your data says is wrong. How do you handle it?`,
      a:`Cluster the feedback to find the underlying problem rather than the requested solution, because players report symptoms accurately and prescribe poorly. Check whether the loudest segment is the largest one. Then test the change or an alternative that addresses the same problem, and explain the reasoning in public either way.`,
      follow:`The loudest players are a small fraction of the base. Does that settle it?`,
      red:`Ships the requested change because the forum is unanimous.` },
    { q:`How do you avoid the live content treadmill?`,
      a:`Set a cadence you can hold indefinitely rather than the one that looks best in the first season. Invest in evergreen systems that keep producing play, and treat seasonal content as the smaller layer on top. Watch the dip between seasons, because that is where the treadmill shows up as churn.`,
      follow:`Retention dips sharply between seasons. What do you change?`,
      red:`Answers a fatigue problem by increasing the content rate.` }
  ],
  senior:[
    { q:`You inherit a live game with a five-year-old economy and a backlog of exploit reports.`,
      a:`Instrument first so you can see the flows, then triage the exploits by impact on the economy and on other players rather than by how egregious they look. Stage the fixes and communicate each one, because a sudden correction reads as a punishment to players who did nothing wrong. Balance the repair against what players already earned and say plainly where you are choosing trust over correctness.`,
      follow:`Fixing it devalues items long-standing players worked for. What do you do?`,
      red:`Corrects everything at once and treats the community reaction as noise.` },
    { q:`When do you sunset a live game, and how?`,
      a:`When the cost of running it no longer matches what it returns and no plausible change fixes that. Then the work is honest notice, stopping sales of anything that will not be honoured, and considering an offline or final version for the players who stayed. Decide it openly rather than letting the game decay into silence.`,
      follow:`Who should make that call, and who has to be in the room?`,
      red:`Lets updates quietly stop and never tells the players.` }
  ] });

INTERVIEW('localization-and-culture',{
  junior:[
    { q:`What breaks in an interface when you translate English into German?`,
      a:`Strings expand, so labels clip, buttons overflow and layouts that were tight become broken. Chinese contracts instead, which leaves layouts looking empty and sometimes changes the reading order of a screen. Budget expansion per string and test the longest target language rather than assuming the English fits everywhere.`,
      follow:`What else changes for a right-to-left language?`,
      red:`Assumes a font change and a smaller size will absorb it.` },
    { q:`Why must strings be externalised?`,
      a:`Because anything baked into an image, a scene or a hard-coded line cannot be translated without a rebuild by the original discipline. Externalising is cheap at the start and expensive to retrofit across a finished project. The same applies to text in textures and to information carried only by a voice line.`,
      follow:`What do you do about text already baked into art?`,
      red:`Plans to hand the translator a build and a spreadsheet extracted at the end.` },
    { q:`What is culturalization, as distinct from translation?`,
      a:`Translation moves the words. Culturalization checks that the meaning survives: references that do not land, gestures and symbols that read differently, colours that carry another association, and content a market's rating or payment rules will not accept. It can change art and design, not only strings.`,
      follow:`Give one example where a mechanic, not a line, had to change.`,
      red:`Treats it as the same job as translation with a longer deadline.` }
  ],
  mid:[
    { q:`What is pseudo-localization and what does it catch?`,
      a:`Replacing every string with a longer, accented version and opening every screen. It catches overflow, clipping, hard-coded strings that do not change, concatenation that breaks, and layouts that cannot absorb expansion. It runs before a single real translation exists, which is the point.`,
      follow:`What does it not catch?`,
      red:`Waits for the first real translation to find layout problems.` },
    { q:`Give examples of hard-coded grammar assumptions and how you fix them.`,
      a:`Sentences assembled from fragments, plural forms that assume one rule, gendered nouns and adjectives, and number, date and currency formatting glued in by hand. The fix is full sentences per case as message templates with named variables, plus locale-aware formatting. It raises the string count, which is the cost of a sentence that is correct in every language.`,
      follow:`Your string count triples. How do you justify that?`,
      red:`Keeps string concatenation and asks translators to work around it.` },
    { q:`How do you brief a translator?`,
      a:`Give context per string: who is speaking, to whom, in what tone, on what screen, with what maximum length. Supply a glossary for terms that must stay consistent, and mark which strings are UI and which are voice. A translator working from a bare spreadsheet is guessing, and the guesses show up as tonal drift.`,
      follow:`Quality varies between vendors. How do you check it without speaking the language?`,
      red:`Sends the string table with no context and reviews only the word count.` }
  ],
  senior:[
    { q:`Plan localization for six languages from month one.`,
      a:`Externalise everything and forbid text in textures from the start. Put pseudo-localization into the build so layout regressions are caught the day they appear. Budget expansion per layout, maintain a glossary and a tone guide, and schedule a culturalization review per market alongside the rating and payment requirements. The reviews belong before content lock, not after.`,
      follow:`One market requires a content change to be rated at all. How do you decide?`,
      red:`Schedules translation as a phase at the end and treats layout as a localization vendor problem.` },
    { q:`A market cannot launch because of a rating requirement discovered late. Walk me through it.`,
      a:`Establish exactly what the requirement is rather than the summary of it, then find the cheapest compliant change and cost its design implications. Weigh that against what the market is worth. If the change breaks something central, be explicit that the honest options are a separate build or not launching there.`,
      follow:`The compliant change breaks a core mechanic. What do you recommend?`,
      red:`Assumes the requirement can be negotiated or worked around at submission.` }
  ] });

INTERVIEW('ethics-and-responsibility',{
  junior:[
    { q:`What is a dark pattern in a game, concretely?`,
      a:`A design that pressures rather than informs: an expiring offer engineered to rush a decision, a purchase that relieves pain the design manufactured, odds the player cannot see, a currency layer that hides what something costs. The common thread is that the player would object if they could see the design.`,
      follow:`Name one you have met as a player and what it did to your trust.`,
      red:`Defines it as anything that makes money.` },
    { q:`What is the consent test?`,
      a:`Ask whether the player would endorse this design if they could see it from the inside. It converts an argument about intentions into a question about the player's view, which is checkable. Where you would be embarrassed to explain the mechanism, that is the finding.`,
      follow:`How would you actually check that with players?`,
      red:`Answers that players accept it because they keep playing.` },
    { q:`Distinguish engagement from compulsion.`,
      a:`Engagement is a player choosing to return because the experience is worth their time. Compulsion is a player returning because leaving costs them something the design created. Retention numbers look the same for both, which is why the distinction has to be asked as a design question.`,
      follow:`Which metric hides the difference most effectively?`,
      red:`Uses the two words as synonyms because both show up as daily active players.` }
  ],
  mid:[
    { q:`Stress-test a loop for manipulation. What do you look for?`,
      a:`Where the design pressures rather than informs, where pain was manufactured to be relieved, where the value of a reward is deliberately blurred, what data is collected and whether the player knows, and which defaults exclude or stereotype. For each finding, propose the smallest change that keeps the experience and removes the pressure.`,
      follow:`Which finding would you escalate rather than fix quietly?`,
      red:`Audits the store page wording and leaves the loop untouched.` },
    { q:`Your game has randomised rewards. What do you disclose and why?`,
      a:`The odds, in a place the player sees before they commit, plus the real cost in real money rather than only in a currency layer. Show cumulative spend, and gate by age where required. Regulation and platform rules keep moving, so design for disclosure rather than retrofitting it when a rule changes.`,
      follow:`Legal says the minimum is less than you propose. How do you argue for more?`,
      red:`Discloses the legal minimum and treats clarity as a competitive disadvantage.` },
    { q:`How do you review defaults for representation?`,
      a:`Look at who the default character, the default voice and the default assumptions exclude, and at where a shorthand has become a stereotype. Do it while the content is being made, because it is a design question and not a compliance pass. Bring people who are not in the room's majority into the review.`,
      follow:`The team is homogeneous. How do you get a useful review?`,
      red:`Adds an options screen and considers the question answered.` }
  ],
  senior:[
    { q:`You are writing the design values next to the pillars. What goes in and how do they bind decisions?`,
      a:`Concrete lines rather than sentiments: what the game will not sell, what it will always disclose, what data it will not collect. Each value should name something it forbids, so it can decide an argument. Put them in the same review as the pillars and revisit them at each update, because the pressure arrives with the live economy.`,
      follow:`A value costs measurable revenue. How do you hold it?`,
      red:`Writes aspirational values that forbid nothing in particular.` },
    { q:`You are asked to ship something you believe crosses the line. What do you do?`,
      a:`State exactly where the line is and why, in terms of the player rather than of taste. Bring the trust and retention evidence, propose an alternative that meets the business need, and escalate once with the argument written down. Then decide what you personally will do if the answer stands, because a line you will not act on is a preference.`,
      follow:`The answer is no and the feature ships. What then?`,
      red:`Objects in a meeting, leaves no record, and implements it unchanged.` }
  ] });
