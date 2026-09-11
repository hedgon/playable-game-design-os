/* =====================================================================
   DIAGNOSTICS: design smells, fun dimensions, core loop, unfairness
   Each smell: symptom -> likely causes (linked to topics) -> experiments -> prompt
   fun:true marks smells that appear in the Fun Diagnostic; dims = fun dimensions implicated
   ===================================================================== */
const FUN_DIMS = [
  ['mastery','Getting visibly better at something with a ceiling above you.','Can veterans do something novices cannot, and can both see it?'],
  ['discovery','Finding what you did not know was there: places, rules, interactions.','After hour five, are players still finding things? What kind?'],
  ['anticipation','Wanting the next thing, because you can see it coming.','What are players thinking about when they close the game?'],
  ['surprise','The pattern broke in a way that made sense afterwards.','When did a player last say "oh!"? What caused it?'],
  ['tension','Uncertain outcome, real stakes, and you care.','Where do players go quiet and lean in? What could they lose there?'],
  ['relief','Resolution after tension; safety that feels earned.','Where do players exhale or laugh? Does the rest carry a reward?'],
  ['power','Acting on the world with force and seeing it yield.','Do players describe what they did in strong verbs?'],
  ['creativity','Making something the game did not prescribe.','Have players made anything you did not anticipate?'],
  ['expression','Playing in a way that reflects who you are.','Do two players in the same spot choose differently, and can they say why?'],
  ['optimization','Squeezing the system for a better result.','Do players talk about efficiency, routes, min-maxing?'],
  ['competition','Measuring yourself against others.','Do players check standings? Do they talk about rivals?'],
  ['cooperation','Achieving together what you could not alone.','Do players coordinate unprompted? Do they thank each other?'],
  ['collection','Completing a set; gathering and owning.','Do players pursue completion when nothing else rewards it?'],
  ['progression','A sense of building toward something across time.','Can players name what they are working toward and why?'],
  ['storytelling','Following or making a narrative that matters.','Do players retell what happened in story terms?'],
  ['social','Mattering to others and having others matter to you.','Who does the player talk about after playing?'],
  ['flow','Absorbed, challenge matching skill, time disappears.','Do players lose track of time? Where does it break?'],
  ['choice','Facing options that differ and reflect on you.','Do players hesitate before choosing? Do choices vary?'],
  ['experimentation','Trying things to see what happens, safely.','Do players poke at the system without being told to?']
];

const SMELLS = [
  { id:'no-idea', t:'We do not know what game to make', dom:['player','experience','product'],
    sym:`Brainstorms produce premises nobody is excited to build; every idea sounds like an existing game; the team argues about genre instead of about a player.`,
    causes:[
      {c:'Starting from premises instead of from a player with an unmet want', top:'finding-an-idea', exp:`Run the Idea Finder: pick one specific player, write their complaints and wishes about three named games, and generate concepts only from those. Pitch the positioning sentence to 10 matched strangers; count who asks how it plays.`},
      {c:'No constraints, so every idea is the genre average', top:'scope-control', exp:`Write the team, time, platform and skill constraints first. Reject any concept the constraints cannot deliver with quality. Distinctive ideas live inside constraints.`},
      {c:'Fantasy undefined, so mechanics have nothing to serve', top:'fantasy', exp:`Write ten fantasy sentences ("I get to be someone who…") for the chosen player; keep the one whose verb you would enjoy performing for ten minutes in grey boxes. Build that loop in a day and test replay.`},
      {c:'Asking AI for ideas before framing the want', top:'prompting-framework', exp:`Stop generating. Feed the AI the player, wants, fun mix and constraints, ask for 8 concepts that serve the wants, then run the devil’s advocate on the two you like.`}],
    prompt:`We are trying to decide what game to make. Here is the player we want to serve, the three games they love, and what they complain about and wish for: [CONTEXT]. Our constraints: [TEAM, TIME, PLATFORM, SKILLS]. Do not propose genres. Cluster the wants, then generate 8 mechanically distinct concepts that serve them inside the constraints, each with a fantasy sentence, a core verb, the first 30 seconds, the decision per minute, why this player would leave their current games for it, and the cheapest test that would show they want it. Reject your own genre averages.` },
  { id:'dont-know-what-to-do', t:'Players do not know what to do', fun:true, dims:['choice','anticipation'], dom:['ux','level','experience'],
    sym:`Players wander, open the map constantly, ask "what am I supposed to do?", or stand still after a cutscene.`,
    causes:[
      {c:'No visible short-term goal in the world', top:'goals-horizons', exp:`Place a visible objective (a landmark, a lit door, a moving target) in the primary sightline of the next three spaces. Measure time-to-movement after each transition.`},
      {c:'Affordances unclear: they cannot tell what is interactable', top:'feedback-and-affordance', exp:`Silent test: log every object players try to use that does nothing and every usable object they walk past. Fix the grammar for the top three.`},
      {c:'Goal exists only in a log or text they skipped', top:'onboarding', exp:`Remove the quest text for one session. Does behavior change? If not, the text was doing nothing; if it gets worse, the world needs to carry the goal.`},
      {c:'Space is not composed: no sightlines, no landmarks', top:'spatial-composition', exp:`Ask players to point to where they came from and where they think they should go. Track error rate per space.`}],
    prompt:`Players in [SECTION] do not know what to do. Observer notes: [NOTES]. Classify each hesitation as missing goal, unclear affordance, skipped text, or wayfinding failure. For each class, propose the smallest change to the world or feedback (not to text) and the observable signal that would show it worked.` },
  { id:'one-build', t:'Players only use one build or strategy', fun:true, dims:['expression','choice','optimization'], dom:['systems'],
    sym:`Pick rates skew heavily; guides all recommend the same thing; players describe other options as "traps".`,
    causes:[
      {c:'A dominant option with no situational counter', top:'builds-and-loadouts', exp:`Simulate or log win rates by build and situation. Add a counter or cost that makes the dominant build wrong somewhere specific. Re-log.`},
      {c:'Options differ in flavor but not in the decision they create', top:'decisions', exp:`Write the tradeoff sentence for each option. Options with no sentence get a real cost or get merged.`},
      {c:'Information asymmetry: one option is legible, others are opaque', top:'readability-and-hierarchy', exp:`Ask players to predict what each option will do. Options they cannot predict are not being chosen for lack of trust, not lack of power.`},
      {c:'Content only rewards one approach', top:'encounters-and-enemies', exp:`Audit encounters for which approaches they punish. If none punish the dominant build, add situations that do.`}],
    prompt:`Here are pick rates, win rates and the rules for our build options: [DATA, RULES]. Identify whether convergence is caused by dominance, indistinct options, opacity, or content that rewards one approach. Propose counters or costs, not equalization, and the pick-rate change that would indicate success.` },
  { id:'ignore-mechanics', t:'Players ignore half the mechanics', fun:true, dims:['experimentation','discovery'], dom:['systems','level','ux'],
    sym:`Telemetry shows unused abilities; players finish without touching systems the team spent months on.`,
    causes:[
      {c:'The mechanic solves no problem the player has', top:'mechanics-and-rules', exp:`For each unused mechanic, write the situation that requires it. If none exists, build one encounter that does and see if usage appears. If it does not appear, cut it.`},
      {c:'Never taught by a situation, only by text', top:'level-structure', exp:`Insert one teach-test beat for the mechanic in an early level. Measure usage before and after.`},
      {c:'Friction: it lives three menus deep', top:'controls-and-friction', exp:`Count inputs to use it. Move it to one input for a session. Compare usage.`},
      {c:'The dominant strategy makes it unnecessary', top:'depth-vs-complexity', exp:`Run the rule audit; the unused mechanic may be complexity without a decision. Consider merging it into a used one.`}],
    prompt:`These mechanics are unused in playtests: [LIST]. For each, state the situation in our current content that requires it (or none), where it is taught, how many inputs it takes, and whether a dominant strategy makes it redundant. Recommend for each: build a situation, teach by doing, reduce friction, or cut. Justify cuts by what the player would not miss.` },
  { id:'tutorial-too-long', t:'The tutorial is too long', fun:true, dims:['flow','power'], dom:['ux','level'],
    sym:`Players skip, sigh, or quit during onboarding; veterans complain; time to first real decision exceeds ten minutes.`,
    causes:[
      {c:'Teaching by telling rather than doing', top:'onboarding', exp:`Replace the three longest text explanations with situations that require the mechanic. Silent-test. Compare comprehension and time.`},
      {c:'Front-loading systems the player has no reason to want yet', top:'progression', exp:`Defer every system until the first moment the player would want it. Measure drop-off and first-decision time.`},
      {c:'Complexity that should not exist', top:'depth-vs-complexity', exp:`Rule audit. Cut rules with no decision. The tutorial shortens itself.`},
      {c:'One tutorial for all players regardless of prior knowledge', top:'who-is-the-player', exp:`Let players demonstrate a convention to skip its lesson. Track who skips and whether they struggle later.`}],
    prompt:`Our onboarding takes [MINUTES] and covers [SYSTEMS]. Here is the flow: [FLOW]. For each teaching moment: is it told or done, does the player have a reason to want the system yet, and could the rule be cut? Propose a reordered flow that reaches the first meaningful decision within [TARGET] minutes.` },
  { id:'repetitive', t:'The game feels repetitive', fun:true, dims:['discovery','surprise','choice'], dom:['core','systems','content'],
    sym:`"Samey" in feedback; sessions shorten over time; players describe the loop in a bored monotone.`,
    causes:[
      {c:'Weak new-situation link: nothing changes between loop iterations', top:'core-loop', exp:`Log the game state at the start of each loop iteration. If the decision-relevant state is the same, add one variable that changes it (enemy composition, resource state, terrain).`},
      {c:'Decisions collapsed to a dominant option', top:'decisions', exp:`Choice variance across iterations. If low, the loop is a routine, not a decision. Fix the option set, not the content.`},
      {c:'Content varies appearance but not the decision', top:'content-multiplies', exp:`Content redundancy audit. Merge pieces that create the same situation. Add one piece that creates a new decision. Test which one players notice.`},
      {c:'Systems do not interact, so no emergence', top:'systemic-design', exp:`Connect two isolated systems with one rule. Watch for new strategies over three sessions.`},
      {c:'Pattern fully learned: nothing left to master', top:'skill-and-mastery', exp:`Compare novice and veteran play. If identical, raise the ceiling with a new skill demand, not a new stat.`}],
    prompt:`Players report the game feels repetitive after [TIME]. Here is the loop, the systems and a sample of content: [DESCRIPTION]. Diagnose which is weak: the new-situation link, decision variety, content distinctness, system interaction, or skill ceiling. For your top diagnosis, cite the evidence and propose the smallest experiment that tests it.` },
  { id:'impressive-but-boring', t:'Technically impressive but boring', fun:true, dims:['choice','tension','mastery'], dom:['core','presentation','production'],
    sym:`Testers praise the visuals and stop playing; "it looks amazing" followed by silence about play.`,
    causes:[
      {c:'Polish before a validated loop', top:'polish-when', exp:`Strip the build to grey boxes and test whether the loop is voluntarily replayed. If not, the polish was hiding it.`},
      {c:'Spectacle without decisions', top:'decisions', exp:`List the decisions in a typical minute. If fewer than one, the player is watching. Add a decision, not an effect.`},
      {c:'No stakes: nothing can be lost', top:'challenge-failure-recovery', exp:`Add a real, legible cost to failure in one section. Watch tension behavior.`},
      {c:'Feature thinking: systems exist because they are impressive', top:'feature-vs-experience', exp:`For each showcase feature, write the player behavior it exists to produce. Features with none go on the cut list.`}],
    prompt:`Testers call our build impressive but stop playing. Here is the loop, the decisions per minute and the failure cost: [DESCRIPTION]. Argue that the polish is hiding a weak loop, then argue the opposite. Propose a grey-box test that settles it, with the behavioral signal to watch.` },
  { id:'fun-but-no-return', t:'Players say it is fun but do not return', fun:true, dims:['anticipation','progression','mastery'], dom:['player','experience','systems'],
    sym:`Positive session feedback, low day-two return; no one mentions the game later.`,
    causes:[
      {c:'No unfinished goal at session end', top:'goals-horizons', exp:`Ask at session end "what will you do next time?" If answers are vague, add a visible next goal before the natural stopping point.`},
      {c:'Novelty was the fun; nothing regenerates', top:'mastery-discovery-expression', exp:`Test a second session with the same content. If enjoyment drops sharply, the game has no engine beyond novelty. Identify which engine it could run on.`},
      {c:'Nothing to think about between sessions', top:'return-and-quit', exp:`Add a decision the player makes at session end whose result they see at the next start. Measure return.`},
      {c:'Politeness bias: "fun" was self-report', top:'playtesting', exp:`Stop asking. Watch: did they voluntarily repeat anything? Behavior is the evidence.`}],
    prompt:`Session feedback is positive but return is low. Here is our end-of-session state and what players said: [DATA]. Diagnose: no unfinished goal, novelty-only enjoyment, nothing to think about between sessions, or self-report bias. Propose one experiment per diagnosis with a return-rate signal.` },
  { id:'meaningless-progression', t:'Progression feels meaningless', fun:true, dims:['progression','anticipation','power'], dom:['systems'],
    sym:`"Number goes up"; players cannot say what an unlock does; "grinding to the good part".`,
    causes:[
      {c:'Power steps with no new capability or decision', top:'progression', exp:`Classify every step. Merge pure number steps. Move the first horizontal unlock earlier. Ask "what can you do now?" after each unlock.`},
      {c:'Progression makes the decisions collapse', top:'decisions', exp:`Log choice variance before and after major unlocks. If variance drops, progression is removing decisions.`},
      {c:'Next step invisible or its value illegible', top:'goals-horizons', exp:`Show the next unlock and what it enables before the player reaches it. Ask whether they want it.`},
      {c:'Interesting systems gated behind boring hours', top:'scope-control', exp:`Move the most decision-rich system to the first hour in a test build. Compare engagement.`}],
    prompt:`Here is our progression track: [STEPS]. For each step, what new decision, capability or experience does it unlock? Flag pure number changes and steps that make earlier decisions dominant. Propose the smallest reordering or merge that puts a capability change in every 30 minutes of play.` },
  { id:'too-many-currencies', t:'There are too many currencies', dom:['systems','ux'],
    sym:`Players cannot say what a currency is for; exchange rates are opaque; wallets have eight numbers.`,
    causes:[
      {c:'Currencies added to gate systems instead of to create tradeoffs', top:'economy-and-resources', exp:`For each currency, name the tradeoff it creates. Merge any without one into a shared currency in a test build. Watch whether decisions change.`},
      {c:'Monetization currencies bleeding into design', top:'business-model', exp:`List currencies that exist for the store. Test a build where they are hidden until the store is opened.`},
      {c:'Cognitive load exceeds the player budget', top:'readability-and-hierarchy', exp:`Ask players to name every currency and what it buys. Cut to the number they can name.`}],
    prompt:`We have these currencies with sources and sinks: [LIST]. For each, state the spending decision it creates that no other currency creates. Propose merges that preserve every real decision and remove every currency that only gates.` },
  { id:'floaty-combat', t:'Combat feels floaty', dom:['presentation','core','ux'],
    sym:`"No weight", "no impact"; hits do not register; players cannot tell when they connect.`,
    causes:[
      {c:'Missing or late impact feedback', top:'feedback-and-affordance', exp:`Feedback matrix for attacks. Fill empty cells with hit-stop, sound and a hit reaction under 100 ms. A/B with testers.`},
      {c:'Input latency', top:'controls-and-friction', exp:`Measure input-to-response on the target device. Anything over about 100 ms needs fixing before any juice.`},
      {c:'Animation timing without commitment or anticipation', top:'animation-and-vfx', exp:`Add anticipation frames and a commitment window to the main attack. Test readability and feel together.`},
      {c:'No consequence: hits do not change enemy state', top:'core-loop', exp:`Make hits change something visible (stagger, position, behavior). Floaty is often "nothing happened".`}],
    prompt:`Combat feels floaty. Here are our attack timings, feedback per hit, input latency and enemy reactions: [DATA]. Identify whether the cause is missing impact feedback, latency, animation timing, or hits that change nothing. Propose fixes in order of cost, and what "weighty" would look like in a recording.` },
  { id:'unfair', t:'The game feels unfair', fun:true, dims:['mastery','tension'], dom:['systems','ux','presentation'],
    sym:`"Cheap", "no warning", "random"; rage quits after a failure; retries without change.`,
    causes:[
      {c:'Unclear rules or unreadable telegraphs', top:'animation-and-vfx', exp:`After each death ask "what killed you?" Cluster "did not see it". Lengthen or clarify those telegraphs; re-test.`},
      {c:'Insufficient failure feedback', top:'challenge-failure-recovery', exp:`Communicate the cause within two seconds of failure. Check whether retry behavior changes.`},
      {c:'Randomness without mitigation', top:'risk-reward', exp:`Give the player a way to read or influence the odds. Compare "unfair" language before and after.`},
      {c:'Punishment or checkpointing out of proportion', top:'difficulty', exp:`Halve recovery time to retry in one section. Measure quit rate after failure.`}],
    prompt:`Players say [SECTION] is unfair. Notes: [NOTES]. Use the unfairness diagnostic: classify as unclear rules, insufficient feedback, execution demand, information overload, randomness, checkpointing, punishment or insufficient mastery opportunity. Propose fixes that preserve the challenge.` },
  { id:'no-experiment', t:'Players do not experiment', fun:true, dims:['experimentation','discovery','creativity'], dom:['core','systems','ux'],
    sym:`Players find one working approach and never deviate; no one tries the odd interaction.`,
    causes:[
      {c:'Failure is too expensive to risk trying things', top:'challenge-failure-recovery', exp:`Reduce failure cost in one area (fast retry, no resource loss). Count novel actions per session.`},
      {c:'Feedback does not reward curiosity: trying things shows nothing', top:'feedback-and-affordance', exp:`Make every interaction respond, even negatively. Track interactions with non-critical objects.`},
      {c:'The optimal path is obvious', top:'decisions', exp:`Hide the obvious option or make it situationally wrong. Watch for exploration.`},
      {c:'Systems do not interact, so experiments have nothing to find', top:'systemic-design', exp:`Add one visible cross-system interaction and seed a hint. Do players go looking for more?`}],
    prompt:`Players do not experiment. Here is our failure cost, feedback on non-critical interactions, and the number of viable approaches per challenge: [DATA]. Diagnose and propose the smallest change to make trying things safe, responsive and worthwhile, with a novel-actions-per-session signal.` },
  { id:'same-way', t:'Everyone plays the same way', fun:true, dims:['expression','choice'], dom:['systems','content'],
    sym:`Recordings look identical; no one has a "style"; the community converges within days.`,
    causes:[
      {c:'No constraint forces a choice', top:'builds-and-loadouts', exp:`Add a slot, point or exclusion constraint. Watch pick distribution.`},
      {c:'Situations do not vary enough to favor different approaches', top:'encounter-design', exp:`Design three encounters that each punish a different approach. Record approaches.`},
      {c:'Options are balanced to equivalence', top:'decisions', exp:`Un-balance: give each option a situation it owns and one it loses. Log situational choice.`}],
    prompt:`Play converges. Here are our options, constraints and a sample of situations: [DATA]. Determine whether the cause is no forcing constraint, uniform situations, or equivalence balancing. Propose changes that create niches and the recording-level signal that would show style differences.` },
  { id:'features-not-better', t:'We keep adding features but the game is not better', fun:true, dims:['choice','flow'], dom:['product','production','ai'],
    sym:`Feature count rises every sprint; playtest signals are flat; the team cannot name the core.`,
    causes:[
      {c:'Feature thinking instead of experience thinking', top:'feature-vs-experience', exp:`For the last five features, write the player behavior each exists to produce and whether it appeared. Stop adding until the core loop signal moves.`},
      {c:'Weak core loop being compensated for', top:'core-loop', exp:`Grey-box the loop alone and test. If it is not replayed, no feature will fix it.`},
      {c:'Scope following imagination, not evidence', top:'scope-control', exp:`Sort the feature list by evidence. Freeze anything without a validated dependency.`},
      {c:'AI feature inflation', top:'ai-failure-modes', exp:`Count features proposed by AI and accepted without a hypothesis. Require a hypothesis and kill criterion for each future feature.`}],
    prompt:`Over the last [N] sprints we added [FEATURES]; our core signal ([SIGNAL]) has not moved. For each feature, state the player behavior it was meant to produce, whether evidence shows it did, and what it cost in complexity. Argue that the loop, not the feature set, is the problem, and propose a grey-box test.` },
  { id:'ai-ideas-none-right', t:'AI keeps generating ideas but none feel right', dom:['ai','experience'],
    sym:`Dozens of options, all plausible, none exciting; the team is tired of reading proposals.`,
    causes:[
      {c:'The problem is not framed: no player, fantasy, constraints or decision stated', top:'prompting-framework', exp:`Rewrite the request with the full formula. Compare the distinctiveness of the output.`},
      {c:'You need a decision, not more options', top:'bottleneck-shift', exp:`Stop generating. Pick two options, write hypotheses, prototype both in a day, test. Judgment needs evidence, not more candidates.`},
      {c:'Generic output because the fantasy is undefined', top:'fantasy', exp:`Write the fantasy sentence and the fantasy verbs. Filter all existing proposals by them. Most will fall away.`},
      {c:'Wrong role: brainstormer when you needed a critic', top:'ai-roles', exp:`Run the critic and devil's advocate on the existing options instead of generating more.`}],
    prompt:`We have generated [N] proposals for [PROBLEM] and none feel right. Here is our fantasy, player and constraints: [CONTEXT]. Do not generate more. Instead: filter the existing proposals by the fantasy verbs, identify what the surviving ones have in common, state what decision I am actually avoiding, and propose the two-day prototype that would settle it.` },
  { id:'quit-early', t:'Players quit early', fun:true, dims:['anticipation','power','flow'], dom:['ux','player','level'],
    sym:`Drop-off in the first session; many never reach the first real system.`,
    causes:[
      {c:'Onboarding fails: confusion in the first minutes', top:'onboarding', exp:`Silent onboarding audit. Fix the top hesitation cluster. Re-test with new players.`},
      {c:'The first meaningful decision arrives too late', top:'goals-horizons', exp:`Move a real choice into the first five minutes. Measure session length.`},
      {c:'Fantasy not delivered early', top:'fantasy', exp:`Put the fantasy verb in the first 30 seconds. Ask testers what they got to be.`},
      {c:'Wrong players recruited', top:'who-is-the-player', exp:`Screen testers against the player sketch. Compare drop-off for matched and unmatched.`}],
    prompt:`Players quit in the first [MINUTES]. Here is the first-session flow and silent-test notes: [DATA]. Locate the first meaningful decision, the first fantasy verb, and the top hesitation cluster. Which arrives too late or not at all? Propose the smallest change to the first five minutes and the session-length signal to watch.` },
  { id:'dont-understand-system', t:'Players do not understand the system', fun:true, dims:['mastery','optimization'], dom:['ux','systems'],
    sym:`Wrong mental models; players explain rules incorrectly; they blame randomness for deterministic outcomes.`,
    causes:[
      {c:'Feedback does not show cause and effect', top:'feedback-and-affordance', exp:`Show the cause with the effect for one system (a number changes and the reason is shown). Ask players to explain the rule afterwards.`},
      {c:'Complexity above the player budget', top:'depth-vs-complexity', exp:`Cut or merge rules with no decision. Re-test comprehension.`},
      {c:'Taught by text, never by a situation', top:'level-structure', exp:`Build a teach-test beat that isolates the rule. Compare explanations before and after.`},
      {c:'Visual grammar inconsistent', top:'visual-language', exp:`Audit signals for the system. One meaning, one signal. Test new-player inference.`}],
    prompt:`Players misunderstand [SYSTEM]; here is what they said versus the real rules: [DATA]. Identify the wrong mental model, and whether it comes from missing cause feedback, excess rules, text-only teaching, or inconsistent signals. Propose the smallest change that would correct the model by doing, and how to check comprehension.` },
  { id:'ignore-content', t:'Players ignore most content', fun:true, dims:['discovery','choice'], dom:['content','level'],
    sym:`Side content untouched; optional areas empty; players rush to the objective.`,
    causes:[
      {c:'Content creates no new decision, so skipping costs nothing', top:'content-multiplies', exp:`Redundancy audit. Make one optional piece create a decision the main path needs. Track engagement.`},
      {c:'No promise: the environment does not signal value', top:'spatial-composition', exp:`Make optional content visible and legibly valuable from the main path. Track detours.`},
      {c:'Over-direction: markers pull players past everything', top:'quests-and-events', exp:`Remove markers for one section. Watch exploration and confusion together.`}],
    prompt:`Players skip [CONTENT]. Here is what it offers and how it is signaled: [DATA]. Diagnose: no new decision, no visible promise, or over-direction. Propose a change that makes engaging with it a real choice, and the detour-rate signal.` },
  { id:'players-lose-agency', t:'Players feel they lost control', fun:true, dims:['choice','power','expression'], dom:['core','narrative','ux'],
    sym:`"It did not matter what I did"; players stop making choices carefully; cutscene complaints.`,
    causes:[
      {c:'Consequences invisible or delayed', top:'narrative-agency', exp:`Add a visible acknowledgment to the three most important choices. Ask players to recall consequences.`},
      {c:'Weak consequence link in the loop', top:'core-loop', exp:`Make the decision change the next situation visibly. Log whether players vary choices.`},
      {c:'Control removed at the moment of climax', top:'ludonarrative-alignment', exp:`Convert one climactic cutscene to an in-play beat. Compare reactions.`}],
    prompt:`Players say their choices did not matter in [SECTION]. Here are the choices, consequences and timing: [DATA]. For each choice, when is the consequence perceived and how? Propose the cheapest visible acknowledgment for each and identify any moment where control is taken at a climax.` }
];

const LOOP_PARTS = [
  { id:'action', t:'Action', sub:'the player does something', weak:'Controls feel sluggish or unclear; the verb is not the fantasy verb.',
    sym:[`Players fight the controls, look at their hands, or describe actions as "clunky".`,`The most frequent action is not the one the fantasy promises.`],
    causes:[`Input latency over about 100 ms.`,`Mapping designed for the team.`,`Action has no anticipation or commitment, so it feels weightless.`,`The verb set does not match the fantasy.`],
    fixes:[`Measure and fix latency first.`,`Re-map for the target player.`,`Add anticipation and commitment windows as rules, then animate.`,`Check the fantasy verbs against the loop.`], top:['controls-and-friction','game-feel-and-juice','fantasy'] },
  { id:'feedback', t:'Feedback', sub:'the game responds legibly', weak:'The player does not understand what happened or why.',
    sym:[`"Did that do anything?"`,`Players repeat a failing action several times.`,`Players cannot say why they died.`],
    causes:[`Feedback confirms input but not outcome.`,`Failure has no cause feedback.`,`Delayed or buried feedback.`,`Visual grammar inconsistent.`],
    fixes:[`Build the action x outcome feedback matrix and fill the empty cells.`,`Communicate cause within two seconds of failure.`,`Fix hierarchy so the important signal is loudest.`], top:['feedback-and-affordance','readability-and-hierarchy','challenge-failure-recovery'] },
  { id:'decision', t:'Decision', sub:'the player chooses what to do next', weak:'The optimal choice is obvious, or there is no choice.',
    sym:[`Players choose without hesitation.`,`Choice variance across players is near zero.`,`Players describe play as a routine.`],
    causes:[`A dominant option.`,`Options differ in flavor only.`,`Not enough information to reason, or too much to feel risk.`,`Progression collapsed the option set.`],
    fixes:[`Write the tradeoff sentence for each option; fix the ones without.`,`Add a situational counter to the dominant option.`,`Adjust information: enough to reason, not enough to be certain.`], top:['decisions','risk-reward','builds-and-loadouts'] },
  { id:'consequence', t:'Consequence', sub:'the choice changes something', weak:'Choices do not matter.',
    sym:[`"It did not matter what I picked."`,`Players stop reading options.`,`Players cannot recall a consequence of their choice.`],
    causes:[`Consequences invisible or delayed past memory.`,`Branches converge.`,`Consequence is a number change the player cannot perceive.`],
    fixes:[`Make the consequence visible within the loop, even if the full effect is later.`,`Replace invisible branches with visible acknowledgments.`,`Tie consequence to the next situation.`], top:['agency-and-emergence','narrative-agency','progression'] },
  { id:'situation', t:'New situation', sub:'the world is different now', weak:'Nothing changes, so the next iteration is the same.',
    sym:[`"Samey" and "repetitive".`,`Sessions shorten over time.`,`Players can play on autopilot.`],
    causes:[`Decision-relevant state resets each iteration.`,`Systems do not interact, so state combinations are few.`,`Content varies appearance, not decisions.`,`Skill ceiling reached.`],
    fixes:[`Carry one decision-relevant variable across iterations.`,`Connect two systems so their states combine.`,`Audit content for redundancy; add pieces that create new decisions.`,`Raise the skill ceiling with a new demand, not a new stat.`], top:['systemic-design','content-multiplies','skill-and-mastery'] }
];

const UNFAIR_CAUSES = [
  { id:'rules', t:'Unclear rules', signs:['Players explain the rule wrongly','Players blame randomness for deterministic outcomes','Different players describe different rules'], fix:'Isolate the rule in a safe situation; show cause with effect; make the signal consistent.', top:'level-structure' },
  { id:'feedback', t:'Insufficient feedback', signs:['"What killed me?"','Players repeat the same failing action','Failure cause is not shown within two seconds'], fix:'Fill the failure cell of the feedback matrix; communicate cause, not just result.', top:'feedback-and-affordance' },
  { id:'execution', t:'Execution difficulty', signs:['Players know what to do but cannot do it','Failures cluster at one input demand','Veterans succeed, novices fail identically'], fix:'Widen the window, add an assist that adapts the challenge, or teach the input in isolation first.', top:'skill-and-mastery' },
  { id:'overload', t:'Information overload', signs:['Players say "too much happening"','They miss threats that were on screen','Deaths spike where many systems are active'], fix:'Reduce simultaneous tracked state; fix hierarchy; separate teaching from intensity.', top:'readability-and-hierarchy' },
  { id:'randomness', t:'Randomness', signs:['"Lucky" or "unlucky" language','Same input, different outcomes, no way to read the odds','Players stop planning'], fix:'Make odds readable or influenceable; reduce variance where stakes are highest.', top:'risk-reward' },
  { id:'checkpoint', t:'Poor checkpointing', signs:['Players quit after failing, not after succeeding','Long recovery to retry','Replaying solved content before the hard part'], fix:'Move the checkpoint to just before the challenge; cut recovery time toward instant retry.', top:'challenge-failure-recovery' },
  { id:'punishment', t:'Excessive punishment', signs:['Failure cost out of proportion to the mistake','Players avoid risk entirely','Frustration language rather than determination'], fix:'Scale the cost to the mistake; consider fail-forward instead of reset.', top:'challenge-failure-recovery' },
  { id:'mastery', t:'Insufficient mastery opportunity', signs:['The challenge appears once with no practice','Players never had a safe version','Failure teaches nothing usable next time'], fix:'Add a teach beat and a test beat before the master beat; ensure failure carries a lesson.', top:'level-structure' }
];

const CONTENT_TREE = [
  { q:'Is the core loop voluntarily replayed in a stripped build, with no new content?', yes:1, no:'STOP: improve the interaction. Content multiplies a loop; it does not create one. Grey-box the loop and test until players repeat it unprompted.' },
  { q:'Does the proposed piece create a situation or decision that no existing piece creates?', yes:2, no:'IMPROVE EXISTING: merge it into the piece it duplicates, or change the existing piece so it creates the new decision. Adding a look-alike teaches players that content is skippable.' },
  { q:'Do players currently exhaust the existing content before they stop playing?', yes:3, no:'IMPROVE EXISTING: players are leaving before they run out. More content will not be reached. Find the churn point and fix the interaction there.' },
  { q:'Will the piece be consumed once (an arc) or replayed (a loop)?', yes:'ADD (loop content): it multiplies the validated system. Define the distinctness criteria and let AI help generate variations under a human filter.', no:'ADD CAREFULLY (arc content): budget it against consumption rate. Consider whether a systemic source could generate the situation instead of an authored one.' }
];

const LADDER_EXAMPLE = {
  feature:'Crafting', behavior:'Players make deliberate preparation decisions before entering dangerous areas, and feel the consequences of preparing well or badly.',
  experience:'Anticipation and tension before a challenge; competence when preparation pays off; a lesson when it does not.',
  system:'A preparation phase with scarce resources, imperfect information about the coming challenge, and a legible link between preparation and outcome.',
  mechanic:'Choose a limited loadout from resources gathered; the level telegraphs its threats partially; the loadout visibly matters in the encounter.',
  refeature:'Maybe crafting. Maybe a loadout screen. Maybe a shop before the dungeon. Maybe scouting. The feature is the last decision, not the first.'
};
