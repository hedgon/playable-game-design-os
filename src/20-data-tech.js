/* =====================================================================
   TECHNIQUE BREAKDOWNS (continued)
   Experience, core gameplay, level design, UX, narrative, product,
   production and the remaining player topics.
   ===================================================================== */

TECH('core-experience',[
  {n:'Experience statement', how:`One sentence: a [emotion] experience where [player] gets to be [fantasy] by [moment-to-moment].`, fit:`Forcing every discipline to aim at the same target.`, cost:`Easy to write vaguely. The check is whether mechanics deliver it.`, alt:`Use the Core Experience Canvas, then verify with playtests.`},
  {n:'Target-emotion mapping', how:`Name two or three emotions and the order they should alternate in. Map each mechanic to one.`, fit:`Keeping moment-to-moment play pointed at a feeling.`, cost:`Emotions are inferred, not measured. Needs player language.`, alt:`Ask testers for emotion words unprompted.`},
  {n:'Reference moments', how:`Find moments in other games that produce the target feeling and dissect exactly what produces it.`, fit:`Translating an intended feeling into concrete mechanics.`, cost:`Risk of copying surface without the cause.`, alt:`Use the Reference Dissection tool.`}
]);

TECH('fun-dimensions',[
  {n:'Dimension tagging of playtest footage', how:`Tag each moment of visible engagement or disengagement with the fun dimension involved.`, fit:`Finding which dimensions are working and which are flat.`, cost:`Needs a coding scheme and consistent observers.`, alt:`Compare the distribution to the intended mix.`},
  {n:'Intended-vs-actual mix', how:`State the mix of fun you intend, then measure the mix players actually experience.`, fit:`Diagnosing "we built X but they feel Y".`, cost:`Self-report bias. Pair with behavior.`, alt:`Use the Fun Diagnostic view.`},
  {n:'Survey instruments (e.g. PENS)', how:`Validated motivation/experience scales to compare builds or groups.`, fit:`Measurable signal across many players.`, cost:`Not game-specific. Needs careful interpretation.`, alt:`Treat as one input beside observation.`}
]);

TECH('goals-horizons',[
  {n:'Goal ladder', how:`Define a visible short-term goal, a session goal and a long-term goal, each with its own reward and stopping point.`, fit:`Giving the player direction at every timescale.`, cost:`Layers can conflict (grind for the long goal, ignore the session).`, alt:`Check each layer has a reason to act now.`},
  {n:'Next-unlock visibility', how:`Show the next meaningful unlock so the player has a reason to continue without a quest log.`, fit:`Anticipation and return.`, cost:`Can turn play into waiting if the present is unrewarding.`, alt:`Make the present valuable too, not only the next thing.`},
  {n:'Session-goal design', how:`Shape a session so it can end at a satisfying point matching the platform's session length.`, fit:`Retention and platform fit.`, cost:`Conflicts with "one more turn" pull. Needs save-point discipline.`, alt:`Design stopping points, then let players choose.`}
]);

TECH('tension-release',[
  {n:'Tension curve authoring', how:`Plot intended tension over a session and place peaks, relief and rest deliberately.`, fit:`Action, horror and narrative pacing.`, cost:`Hard to predict. Directors or pacing tools help.`, alt:`Author with triggers first. Add adaptivity only where needed.`},
  {n:'Pressure and release mechanics', how:`Resource drain, timers, and threats create pressure. Rewards, safety and downtime release it.`, fit:`Making rest feel earned and stakes feel real.`, cost:`Constant pressure exhausts. Constant release bores.`, alt:`Alternate deliberately and test with observation.`},
  {n:'Music and audio dynamics', how:`Sound and music follow the tension curve to amplify it.`, fit:`Reinforcing the intended emotional rhythm.`, cost:`Implementation cost. Over-scoring removes subtlety.`, alt:`Use silence as a tool.`}
]);

TECH('mastery-discovery-expression',[
  {n:'Skill ceiling and floor design', how:`Separate the easy-to-start surface from deep, hard-to-master options.`, fit:`Welcoming newcomers while rewarding veterans.`, cost:`Balancing both is hard. Ceilings that are too high isolate most players.`, alt:`Design floor for onboarding, ceiling for identity.`},
  {n:'Expression space', how:`Give players meaningful choices that reflect who they are, not only which is stronger.`, fit:`Building attachment and player stories.`, cost:`Expression options must be viable or they become traps.`, alt:`Audit whether choices differ in decision, not just flavor.`},
  {n:'Discovery density', how:`Schedule how often players find something they did not know was there.`, fit:`Exploration and long-tail engagement.`, cost:`Front-loading discoveries leaves the late game empty.`, alt:`Ration discovery across the full play arc.`}
]);

TECH('social-experience',[
  {n:'Interdependence design', how:`Design roles and goals so players need each other in ways each can feel.`, fit:`Co-op that is cooperative, not parallel play.`, cost:`Solo players and matchmaking gaps. Players may idle.`, alt:`Make each role's contribution visible.`},
  {n:'Async and social loops', how:`Gifts, visits, leaderboards or persistent shared state that operate between sessions.`, fit:`Retention and relatedness between sessions.`, cost:`Can become obligation. Needs care not to coerce.`, alt:`Optional, non-punishing social layers.`},
  {n:'Matchmaking and grouping', how:`Skill/behavior-based matching and party formation.`, fit:`Competitive fairness and quick, good sessions.`, cost:`Waiting times. Smurfing and mixed groups.`, alt:`Design for the player pool you actually have.`}
]);

TECH('feature-vs-experience',[
  {n:'Behavior ladder', how:`Climb from a proposed feature to the behavior and experience it should produce, then back to the smallest mechanic.`, fit:`Testing whether a feature idea serves the experience.`, cost:`Can land back on the same feature (sometimes correct, often rationalization).`, alt:`Use the Behavior Ladder tool.`},
  {n:'Outcome-first framing', how:`State the player outcome you want before the solution. Reject solutions that do not produce it.`, fit:`Killing feature-creep at the source.`, cost:`Requires discipline and a decision owner.`, alt:`Follow with Should We Build This?`}
]);

TECH('risk-reward',[
  {n:'Risk pricing', how:`Make each risk cost something real and legible, so the reward is a decision not a formality.`, fit:`Combat, betting, exploration, push-your-luck.`, cost:`Punitive risk drives players to the safe option always.`, alt:`Tune the ratio per context. Test whether players take risks.`},
  {n:'Push-your-luck curves', how:`Let players choose when to bank. Make the marginal risk grow with the pile.`, fit:`Tension and memorable gambles.`, cost:`Can feel random without readable odds.`, alt:`Reveal enough odds to reason.`},
  {n:'Loss aversion management', how:`Decide what is lost, how much, and whether it can be recovered.`, fit:`Making stakes meaningful without rage-quit.`, cost:`Losing progress is the most-cited quit cause. Needs recovery design.`, alt:`Prefer losing progress in a run, not in the account.`}
]);

TECH('agency-and-emergence',[
  {n:'Interaction map', how:`Draw which systems read/write which state. Isolated islands create mini-games, connections create emergence.`, fit:`Finding where depth is waiting.`, cost:`Manual upkeep.`, alt:`Connect two isolated systems and prototype.`},
  {n:'Consequence proximity', how:`Ensure the player sees the outcome of a choice soon. Delayed or invisible consequences erase agency.`, fit:`Making choices feel real.`, cost:`Immediate consequences can remove strategy. Stagger signals.`, alt:`Near signal now, full payoff later.`},
  {n:'Emergence classification', how:`Classify surprising strategies as celebrate, tune or remove.`, fit:`Deciding what to do with the unexpected.`, cost:`Over-tuning kills the joy of discovery.`, alt:`Default to celebrate. Tune only degenerate cases.`}
]);

TECH('challenge-failure-recovery',[
  {n:'Failure cost tuning', how:`Decide how much time/progress a failure costs, and the length of the retry loop.`, fit:`Making failure instructive, not punishing.`, cost:`Too cheap removes weight. Too costly causes churn.`, alt:`Keep failure cheap and learning fast in action games.`},
  {n:'Checkpoint and recovery design', how:`Place checkpoints and design recovery so players resume near where they failed with the knowledge they gained.`, fit:`Action and level-based games. Retention at hard points.`, cost:`Frequent checkpoints reduce tension. Sparse ones cause abandonment.`, alt:`Match checkpoint density to the intended tension.`},
  {n:'Recovery mechanics', how:`Second chances, comeback options or scaling that keep a run alive without erasing the loss.`, fit:`Roguelikes, sports, competitive games.`, cost:`Can undermine stakes if too generous.`, alt:`Make recovery cost something.`}
]);

TECH('skill-and-mastery',[
  {n:'Skill-atom decomposition', how:`Break a skill into atoms (perception, decision, execution) that can be taught and practiced separately.`, fit:`Designing learnable, deep skills.`, cost:`Over-fragmentation creates drills that are no fun.`, alt:`Embed practice in play, not in menus.`},
  {n:'Feedback for learning', how:`Give immediate, specific, perceivable feedback so the player can adjust and improve.`, fit:`Skill acquisition. The core of mastery.`, cost:`Vague feedback teaches nothing. Noisy feedback teaches wrongly.`, alt:`Show cause and effect within the same interaction.`},
  {n:'Transfer and escalation', how:`Reuse skills in new combinations so early learning stays relevant.`, fit:`A satisfying long skill arc.`, cost:`Can become repetitive. Needs new contexts.`, alt:`Teach, test, twist, combine (see Level structure).`}
]);

TECH('depth-vs-complexity',[
  {n:'Rule audit', how:`Classify each rule as creating a decision, enabling an interaction, or adding load only. Cut or merge the load-only rules.`, fit:`Reducing complexity without losing depth.`, cost:`No agreed numerical metric. Use as a lens.`, alt:`Use the Rule audit tool.`},
  {n:'Decision density', how:`Measure how often meaningful decisions occur per minute. Add depth where it is sparse.`, fit:`Pacing engagement and diagnosing shallow systems.`, cost:`More decisions is not always better. Noise and fatigue.`, alt:`Prefer fewer, weightier decisions.`},
  {n:'Teachability test', how:`Can a new player learn a rule in one use and explain it? If not, it is complexity.`, fit:`Checking whether rules earn their learning cost.`, cost:`Some depth is intentionally opaque. Judge per audience.`, alt:`Teach, then test comprehension.`}
]);

TECH('content-multiplies',[
  {n:'New-decision audit', how:`For every new content piece, state the new decision or experience it creates that existing pieces do not.`, fit:`Preventing content spam.`, cost:`New pieces may be justified by texture, not novelty.`, alt:`Differentiate the key beats. Vary the connective tissue.`},
  {n:'Parameterize, do not multiply rules', how:`Extend existing systems with parameters (damage, range, behavior) rather than adding new rules per content.`, fit:`Getting variety without combinatorial complexity.`, cost:`Can feel samey if parameters are shallow.`, alt:`A few genuinely new interactions beat many parameters.`}
]);

TECH('quests-and-events',[
  {n:'Quest grammar', how:`Compose quests from reusable verbs (go, fetch, escort, defend, choose) with conditions and rewards.`, fit:`Authoring many quests without a writer per line.`, cost:`Repetitive if the grammar is shallow. Needs twists.`, alt:`Vary structure, not just text.`},
  {n:'Trigger and event design', how:`Define what fires an event, in what order, and what state it leaves behind.`, fit:`Structure, surprise and reactive worlds.`, cost:`Brittle chains. Missed triggers are common bugs.`, alt:`Keep chains short and observable.`},
  {n:'Quest state modelling', how:`Track quest progress and branch outcomes in explicit state so the world can reflect choices.`, fit:`Consequence and world reactivity.`, cost:`State explosion and save/load bugs.`, alt:`Limit concurrent tracked states.`}
]);

TECH('level-structure',[
  {n:'Kishotenketsu (introduce, develop, twist, conclude)', how:`Structure a level around one idea: introduce it safely, develop it, twist it, conclude.`, fit:`Teaching mechanics through space.`, cost:`Rigid if applied to every level. Needs variation.`, alt:`One movement/mechanic idea per room (Celeste-style).`},
  {n:'Teach, test, twist, combine, master, rest', how:`Sequence the six level intents within and across levels.`, fit:`A long, well-paced learning arc.`, cost:`Tracking the sequence across many levels takes discipline.`, alt:`Map each level to the intent it serves.`},
  {n:'Blockout-first', how:`Build and test the level in grey boxes for flow and teaching before art.`, fit:`Validating structure cheaply.`, cost:`Some feel depends on art. Schedule a later pass.`, alt:`Clarity first, then polish.`}
]);

TECH('pacing',[
  {n:'Intensity curve', how:`Plot intended intensity over the level and place peaks, troughs and rest beats.`, fit:`Combat, horror and any sequence of encounters.`, cost:`Players vary. Needs adaptivity or branching.`, alt:`Author the curve. Let a director fill the gaps if needed.`},
  {n:'Cognitive-load pacing', how:`Alternate high-cognition (puzzles, choices) with low-cognition (movement, spectacle) beats.`, fit:`Preventing fatigue and keeping attention.`, cost:`Requires measuring load. Heuristic.`, alt:`Think-aloud tests reveal overload points.`},
  {n:'Pressure-release cycle', how:`Deliberately pair tension with relief so reward lands.`, fit:`Making rest meaningful.`, cost:`Skipping relief flattens the peaks.`, alt:`Give a visible reward after a hard beat.`}
]);

TECH('spatial-composition',[
  {n:'Sightlines and landmarks', how:`Compose views so players can orient and see the next goal from where they are.`, fit:`Wayfinding without markers.`, cost:`Constraints on art and layout. Needs iteration.`, alt:`Grey-box sightline pass. Ask players to point home.`},
  {n:'Affordance density', how:`Control how many interactables and choices sit in view at once.`, fit:`Readability and avoiding overload.`, cost:`Too sparse feels empty. Too dense hides the goal.`, alt:`Cap the always-visible interactables.`},
  {n:'Flow and desire paths', how:`Shape movement so the natural route matches the intended route (weeping paths, pull of geometry).`, fit:`Guiding without rails.`, cost:`Requires playtesting and re-blockout.`, alt:`Watch where players actually walk and follow it.`},
  {n:'Blockout metrics', how:`Use consistent scale, corridor width and cover spacing as reusable vocabulary.`, fit:`Fast, readable level production at volume.`, cost:`Over-uniform spaces feel samey.`, alt:`Set metrics, then break them deliberately for landmarks.`}
]);

TECH('encounter-design',[
  {n:'Threat budget', how:`Assign enemies a cost and compose to a target that scales with the player's kit.`, fit:`Pacing difficulty across a long game.`, cost:`Ignores synergy. Two cheap enemies can be worse than their sum.`, alt:`Budget as a first pass, then hand-tune set pieces.`},
  {n:'Arena affordances', how:`Design cover, hazards, verticality and escape routes as the encounter's real content.`, fit:`Making fights read and offer tactical choice.`, cost:`Art and layout cost. Must match AI navigation.`, alt:`Blockout the arena around the intended decisions.`},
  {n:'Wave and phase choreography', how:`Sequence spawns/phases with an intended tactical shift and recovery windows.`, fit:`Escalation and boss fights.`, cost:`Repetitive if symmetric. Needs variation.`, alt:`Alternate pressure with brief rest.`}
]);

TECH('ux-as-design',[
  {n:'Friction audit', how:`Count the steps, clicks and cognitive demands for the most common tasks.`, fit:`Finding hidden churn in menus and flows.`, cost:`Needs telemetry or observation to know the real tasks.`, alt:`Instrument top flows. Cut steps.`},
  {n:'Heuristic review', how:`Evaluate the interface against known usability heuristics (clarity, consistency, error recovery, feedback).`, fit:`A fast, cheap UX pass before playtests.`, cost:`Generic heuristics miss game-specific feel.`, alt:`Pair with think-aloud playtests.`},
  {n:'First-time user experience', how:`Design and measure the very first minutes like a separate feature.`, fit:`Retention. The highest-leverage fix.`, cost:`Easy to under-resource. Needs instrumentation.`, alt:`Time-to-fun as a tracked metric.`}
]);

TECH('feedback-and-affordance',[
  {n:'Feedback layering', how:`Stack visual, audio and haptic cues on one event so it reads regardless of channel.`, fit:`Making actions and state legible.`, cost:`Noise and cost. Needs priority.`, alt:`Reserve the strongest cues for the most important events.`},
  {n:'Affordance grammar', how:`Use consistent visual/audio language for what is interactable, dangerous or locked.`, fit:`Teaching the world's rules without text.`, cost:`A single inconsistency teaches wrong.`, alt:`Document and hold the grammar across all content.`},
  {n:'Signifiers and diegetic cues', how:`Show the action in-world (a ledge to climb, a handle to pull) rather than a floating marker.`, fit:`Immersion and readability together.`, cost:`Harder to author. Some players miss subtle cues.`, alt:`Layer diegetic cue with an optional marker.`}
]);

TECH('premise-and-world',[
  {n:'Premise worksheet', how:`One paragraph: the world's rule, the player's place, the conflict, the tone.`, fit:`Giving every discipline a shared touchstone.`, cost:`Easy to over-specify. Leaves room for discovery.`, alt:`Test the premise against the fantasy and the loop.`},
  {n:'World rules and consistency', how:`Define what is possible and impossible. The rules become design and story constraints.`, fit:`Making the world feel real and coherent.`, cost:`Rules can lock out later ideas. Keep them few and load-bearing.`, alt:`Document them. Break them only deliberately.`},
  {n:'Tone bible', how:`Reference art, sound and writing that define the target tone for all disciplines.`, fit:`Cohesion across a large team.`, cost:`Upkeep. Can be ignored if not used in reviews.`, alt:`Use in every critique.`}
]);

TECH('ludonarrative-alignment',[
  {n:'Mechanic-story audit', how:`List what the mechanics reward and what the story says is good. Flag contradictions.`, fit:`Finding dissonance early.`, cost:`Some dissonance is intentional. Judge, do not just flag.`, alt:`Check the player's verbs against the theme.`},
  {n:'Thematic verbs', how:`Make the core verb express the theme (protecting, freeing, hoarding, connecting).`, fit:`Aligning moment-to-moment play with meaning.`, cost:`Constrains mechanics. May fight fun.`, alt:`Choose mechanics whose natural play matches the theme.`}
]);

TECH('narrative-pacing',[
  {n:'Integration points', how:`Place story beats where the player naturally pauses (between levels, after bosses), not mid-action.`, fit:`Story that does not fight play.`, cost:`Limits narrative placement. Needs level awareness.`, alt:`Let the environment carry story during play.`},
  {n:'Player-paced vs authored pace', how:`Decide what the player controls (exploration, dialogue speed) and what the game controls (cutscenes, set pieces).`, fit:`Respecting agency while landing beats.`, cost:`Mismatch causes tone whiplash.`, alt:`Match narrative control to the game's agency.`}
]);

TECH('audience-and-positioning',[
  {n:'Positioning sentence', how:`For [player] who [want], this is the game where you [verb] …, unlike [comparables].`, fit:`A testable promise and a marketing line.`, cost:`Vague positioning hides a vague game.`, alt:`Test it on strangers. Count questions and wish-to-play.`},
  {n:'Comparison set and differentiation', how:`Name the games you will be judged against and the visible reason to pick yours.`, fit:`Making differentiation explicit.`, cost:`"Like X but better" is not differentiation.`, alt:`Use Reference Dissection.`}
]);

TECH('learning-from-success',[
  {n:'One-template dissection', how:`Take apart a comparable on one template: want served, core verb, first 30 seconds, decisions per minute, why it worked, complaints, what copies miss.`, fit:`Extracting transferable mechanisms without copying surface.`, cost:`Success narratives are heuristics. Survivorship bias.`, alt:`Use the Reference Dissection tool.`},
  {n:'Cross-reference questions', how:`Test your concept against the comparable on shared want, differentiator, answered complaint, quality bar and audience evidence.`, fit:`Deciding promising / derivative / unproven / undeliverable.`, cost:`Only as good as your comparables.`, alt:`Answer with evidence, not optimism.`}
]);

TECH('hypothesis-driven-design',[
  {n:'Hypothesis statement', how:`We believe [player] will [behavior] because [reason]. We will know when [signal]. We will kill it if [criterion].`, fit:`Turning a decision into a testable claim.`, cost:`Weak hypotheses produce untestable tests.`, alt:`Use the Hypothesis Builder tool.`},
  {n:'Kill criterion', how:`Write the result that ends the idea before you build. Without it you are hoping.`, fit:`Preventing sunk-cost attachment.`, cost:`Emotionally hard. Needs an agreed decision owner.`, alt:`Agree the criterion while calm.`},
  {n:'Smallest test', how:`Find the cheapest experiment (paper, spreadsheet, grey box) that distinguishes the hypothesis from alternatives.`, fit:`Fast learning at low cost.`, cost:`Can test the wrong thing if the hypothesis is broad.`, alt:`Name the alternative explanations to rule out.`}
]);

TECH('iteration-and-evidence',[
  {n:'One-variable iteration', how:`Change one important variable between tests so the result is interpretable.`, fit:`Learning what actually caused a change.`, cost:`Slow when many things need fixing.`, alt:`Batch independent changes as separate tests.`},
  {n:'Decision log', how:`Record what was decided, the evidence, the expected effect and the date to review.`, fit:`Avoiding re-litigating and forgetting why choices were made.`, cost:`Discipline to maintain.`, alt:`Keep it short and tied to iterations.`},
  {n:'Build vs measurement', how:`Ensure player evidence sits between exploration and commitment.`, fit:`Avoiding shipping on hope.`, cost:`Slows commitment. Some stakeholders resist.`, alt:`Gate scope on validated value.`}
]);

TECH('vertical-slice-mvp',[
  {n:'Vertical slice', how:`A thin, polished, end-to-end slice at near-final quality to prove the pipeline.`, fit:`De-risking production quality and integration.`, cost:`Expensive. Does not prove content volume or fun at scale.`, alt:`Slice for pipeline risk, prototype for mechanic risk.`},
  {n:'MVP (minimum viable product)', how:`The smallest thing that delivers the core value and can be tested by real players.`, fit:`Proving the core experience is worth building.`, cost:`"Viable" is often misread as "shippable". It is for learning.`, alt:`Define the core value in one sentence first.`}
]);

TECH('polish-when',[
  {n:'Polish triage', how:`Rank polish by whether it amplifies already-validated feedback. Polish only what earns it.`, fit:`Spending polish budget where it multiplies meaning.`, cost:`Loved-but-unvalidated features demand polish. Hold the line.`, alt:`Polish amplifies. It does not create meaning.`},
  {n:'Feedback-first polish', how:`Invest first in the feedback of core actions, then broader spectacle.`, fit:`Maximum felt-quality per hour.`, cost:`Can leave peripheral content rough.`, alt:`Polish core interactions before environments.`},
  {n:'Stop rule', how:`Define the quality bar and the point where more polish no longer changes the player's experience.`, fit:`Protecting schedule from endless refinement.`, cost:`Requires judgement and a decision owner.`, alt:`Use playtests to find the bar. Stop when it is met.`}
]);

TECH('fantasy',[
  {n:'Fantasy sentence and verb extraction', how:`Write "I get to be someone who ___" and extract the verbs it implies.`, fit:`Turning a vibe into mechanics.`, cost:`Easy to write a fantasy the loop does not deliver.`, alt:`Cross-check verbs against the mechanic list.`},
  {n:'Fantasy-breaker hunt', how:`List moments that would contradict the identity and hunt them in playtests.`, fit:`Preserving the promise.`, cost:`Players may tolerate some breaks. Prioritise by early visibility.`, alt:`Rank breaks by how soon players meet them.`}
]);

TECH('return-and-quit',[
  {n:'Churn classification', how:`Classify session ends as confusion, boredom, frustration, satisfaction or interruption. Each needs a different fix.`, fit:`Diagnosing why players leave.`, cost:`Telemetry shows when, not why. Needs notes.`, alt:`Pair session-end data with observer notes.`},
  {n:'Return hooks', how:`Visible unfinished goals, anticipated novelty, social pull or comfort ritual.`, fit:`Giving a reason to come back.`, cost:`Obligation hooks create fragile retention. Hooks before a replayable loop are wasted.`, alt:`Fix the loop first. Hooks last.`}
]);

TECH('finding-an-idea',[
  {n:'Market observation', how:`Read reviews, forums, streamer chats, patch-note reactions and achievement data for the recurring praise and complaints, in the players' own words.`, fit:`Finding a want that already exists and is measurable.`, cost:`Slow, and easy to drown in noise. Needs a specific question to filter.`, alt:`Start from one vivid complaint you can quote and a place you saw it.`},
  {n:'Workaround audit', how:`Search the community for mods, spreadsheets, house rules and third-party tools that already do the missing thing.`, fit:`Testing whether a want is strong, before you build anything.`, cost:`Absence of workarounds is evidence against you, and it is easy to explain away.`, alt:`Look for repeated manual workarounds in guides and clips.`},
  {n:'Gap classification', how:`Sort complaints into exit reason, unmet want, tolerated cost and taste. Only the first two are worth a game.`, fit:`Deciding what to build and what to refuse.`, cost:`Honest reading, and it kills ideas you like.`, alt:`Build only against exit reasons and unmet wants.`},
  {n:'Moat test', how:`Ask whether an incumbent could copy your rule without breaking what works for them.`, fit:`Separating a wedge from a feature.`, cost:`Most ideas fail it.`, alt:`Reshape the mechanism until it conflicts with their constraints.`},
  {n:'Observation tests', how:`Workaround audit, comment mining on streams, a one-mechanism greybox, and the store-page side by side.`, fit:`Evidence about desire without a survey.`, cost:`Humility to kill the idea on what you see.`, alt:`Run the greybox first, since it is the cheapest real signal.`}
]);
