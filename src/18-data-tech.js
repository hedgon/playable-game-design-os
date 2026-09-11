/* =====================================================================
   TECHNIQUE BREAKDOWNS
   Adds the optional "Techniques to compare" section to existing topics
   where there is a real implementation decision: which technique, how it
   works, when it fits, what it costs. Attached after the topics are
   defined so the topic files stay focused on design intent.
   ===================================================================== */
function TECH(id, arr){
  const t = TOPICS[id];
  if(!t) throw new Error('TECH: unknown topic ' + id);
  t.tech = arr;
}

TECH('mechanics-and-rules',[
  {n:'Data-driven rules', how:`Rules, costs and effects live in data tables or curves an editor can change without a rebuild.`, fit:`Live tuning, balance passes, lots of similar mechanics (weapons, abilities, enemies).`, cost:`Balance debt accumulates and can be changed by anyone; needs validation and a single source of truth.`, alt:`Hard-coded rules while there is one of a thing; move to data when duplication appears.`},
  {n:'Attribute + modifier (tag/effect) systems', how:`Entities carry attributes; effects are stacks of typed modifiers applied in a defined order each tick.`, fit:`Status effects, buffs/debuffs, and systems where anything can interact with anything.`, cost:`Ordering and stacking rules create subtle bugs; the interaction space grows fast.`, alt:`An interaction matrix plus a small modifier system is usually enough.`},
  {n:'Explicit interaction matrix', how:`List systems as rows and columns and define what happens for each pair; blank cells are unanswered questions.`, fit:`Finding where depth and emergent interactions hide; auditing a rule set.`, cost:`Bespoke pair logic multiplies as systems are added; needs pruning.`, alt:`Prefer general modifier rules over per-pair exceptions unless the pair is a headline feature.`},
  {n:'Headless simulation harness', how:`Run many matches without rendering, sweeping parameter grids and logging outcomes.`, fit:`Balance, dominant strategies, and stress-testing edge cases cheaply.`, cost:`Building and maintaining the harness; the model can diverge from the real game.`, alt:`Start with a spreadsheet for a single system; graduate to simulation when interactions matter.`}
]);

TECH('systemic-design',[
  {n:'State and signal propagation', how:`Systems read and write shared state, emit signals or tags, and react to events rather than calling each other directly.`, fit:`Emergent, immersive-sim style worlds where systems combine freely.`, cost:`Hard to trace causality; debugging emergent bugs needs a timeline view.`, alt:`Explicit pairwise interactions for a small system count.`},
  {n:'Interaction matrix', how:`Enumerate system pairs and define the outcome; measure how many pairs have real interactions.`, fit:`Auditing depth and spotting isolated systems (mini-games).`, cost:`Manual upkeep as systems change.`, alt:`Generate the matrix from tags/signals once the base is sound.`},
  {n:'Constraint from below, emergence from above', how:`Keep each rule simple and local; let complex behaviour arise from combination rather than authoring global cases.`, fit:`Games whose promise is player-created stories or strategies.`, cost:`Emergence is not guaranteed and not reproducible; some outcomes are degenerate and must be pruned.`, alt:`Author the outcomes you cannot risk; simulate the rest.`}
]);

TECH('economy-and-resources',[
  {n:'Sinks-and-faucets balance sheet', how:`List every source (faucet) and drain (sink) of each resource, then compute net flow per session and per hour.`, fit:`Any economy; the first instrument to build.`, cost:`Only as good as the data; ignores player behavior until measured.`, alt:`Start here before touching numbers.`},
  {n:'Cost and reward curves', how:`Define prices and rewards as functions (linear, polynomial, exponential) of progress or power.`, fit:`Pricing upgrades, pacing unlocks, scaling rewards.`, cost:`A bad curve is invisible until late-game; exponential costs can wall players, flat costs can trivialize.`, alt:`Fit the curve to intended time-to-goal, then test against real play sessions.`},
  {n:'Multi-currency design and exchange', how:`Several resources with distinct roles, plus conversion or trading between them.`, fit:`Separating short- and long-term spending, or soft/hard currency in free-to-play.`, cost:`Cognitive load and opacity; more wallets to balance and explain.`, alt:`One currency until two genuinely create different decisions.`},
  {n:'Monte Carlo / spreadsheeted balance', how:`Model the economy in a spreadsheet or simulation and sweep many play patterns.`, fit:`Detecting runaway loops, sinks that never bite, or sources nobody uses.`, cost:`Model maintenance; the model can drift from the game.`, alt:`Spreadsheet for arithmetic, simulation once randomness and player choice matter.`}
]);

TECH('progression',[
  {n:'Curve families (linear, polynomial, exponential)', how:`Choose the shape of cost/reward growth to control pacing: exponential gates hard, linear is steady, S-curves front-load and back-load.`, fit:`XP curves, upgrade costs, unlock timing.`, cost:`Wrong shape creates a wall or a no-op; players feel grind before you see it in data.`, alt:`Author the target time-to-milestone, then solve for the curve.`},
  {n:'Soft vs hard gating', how:`Soft gating (unreachable or inefficient without a tool) teaches; hard gating (a locked door) forces order.`, fit:`Teaching mechanics, controlling pacing, or pacing narrative.`, cost:`Hard gates frustrate and break replay; soft gates can be missed entirely.`, alt:`Soft gate by default; hard gate only when order is the experience.`},
  {n:'Catch-up and respect-time mechanics', how:`Bonuses for lagging players, skipped grind, or shared progression across a team or account.`, fit:`Long-lived games, co-op, and multi-character progression.`, cost:`Can devalue earlier effort and flatten the sense of building; needs care not to feel like charity.`, alt:`Catch-up reduces the cost of returning, not the meaning of progress.`}
]);

TECH('difficulty',[
  {n:'Explicit difficulty presets', how:`Named modes that change a curated set of parameters together.`, fit:`Broad audiences; the honest default where the challenge is part of the fantasy.`, cost:`Splits tuning and QA effort; players self-sort wrongly.`, alt:`Start with presets; add adaptivity only where a preset cannot cover the skill spread.`},
  {n:'AI fairness knobs (reaction time, accuracy, aggression)', how:`Tune how fast and how well agents perceive and act, rather than their raw power.`, fit:`Action games where felt challenge comes from behaviour, not numbers.`, cost:`Knobs interact; a slow but perfect AI can feel worse than a fast, fallible one.`, alt:`Tune readability first, then these knobs.`},
  {n:'Telemetry-driven calibration', how:`Use session data (deaths, retries, completion, time) to place difficulty where players actually get stuck.`, fit:`Live games or large playtest pools.`, cost:`Telemetry shows where, not why; needs observation to explain.`, alt:`Pair metrics with qualitative playtests.`},
  {n:'Adaptive/behind-the-scenes adjustment', how:`Adjust pressure from performance signals within a bounded, ideally unnoticed range.`, fit:`Games where a fixed preset cannot hold the challenge band.`, cost:`Noticeable adjustment feels unfair or condescending.`, alt:`See the Adaptive AI and directors topic in the In-game AI domain.`}
]);

TECH('builds-and-loadouts',[
  {n:'Affinity / synergy tagging', how:`Tag content with keywords and reward combinations that share tags or cover each other's gaps.`, fit:`Creating build space and emergent combos without hand-authoring every pair.`, cost:`Tag soup and accidental loops; needs a combination matrix to audit.`, alt:`A few strong tags beat many weak ones.`},
  {n:'Opportunity cost and diminishing returns', how:`Make stacking the same option less efficient, so diversification competes with specialization.`, fit:`Preventing a single dominant stack.`, cost:`Can force spread that feels like no build is special.`, alt:`Prefer content counters over global diminishing returns.`},
  {n:'Draft / pick systems', how:`Players choose from offered options, so builds emerge from opportunity as well as plan.`, fit:`Run-based games and roguelikes wanting variety per run.`, cost:`Draw variance can feel unfair; needs pity and weighting.`, alt:`Offer choice inside a run; let meta-progression be earned.`},
  {n:'Balance simulation by build', how:`Simulate or log win/usage rates per build and matchup to find dominance or dead options.`, fit:`Finding convergence before it hardens.`, cost:`Simulated optimal play differs from human play.`, alt:`Use pick/win telemetry where available; simulation to explore.`}
]);

TECH('decisions',[
  {n:'Tradeoff mapping', how:`For each option, write what the player gives up; options with no tradeoff are not decisions.`, fit:`Auditing whether your "choices" are real.`, cost:`Design time; can reveal that your variety is cosmetic.`, alt:`Start here; cut or merge options with no tradeoff sentence.`},
  {n:'Information design (fog, telegraph, partial knowledge)', how:`Control what the player knows when they choose: hidden values, revealed odds, telegraphed enemy intent.`, fit:`Creating interesting decisions under uncertainty.`, cost:`Opacity feels unfair; full information removes tension.`, alt:`Reveal enough to reason; hide enough to matter.`},
  {n:'Dominance analysis', how:`Check whether any option is at least as good as another in every situation; if so, fix, cost or remove it.`, fit:`Balance and depth audits.`, cost:`Only catches strict dominance, not situational imbalance.`, alt:`Follow with pick-rate/win-rate data.`}
]);

TECH('core-loop',[
  {n:'Loop mapping', how:`Write the loop as action → feedback → decision → consequence → new situation and mark the weak link.`, fit:`Diagnosing why repetition bores or why actions feel weightless.`, cost:`None worth mentioning; it is the cheapest diagnostic you have.`, alt:`Pair with the Core Loop diagnostic view.`},
  {n:'Grey-box minimal prototype', how:`Build only the core interaction with placeholder art and test voluntary repetition.`, fit:`Before investing in content, art or meta systems.`, cost:`Discipline to not add scope; a boring grey box may kill an idea you love.`, alt:`If the bare loop is not replayable, no production value will save it.`},
  {n:'Feedback timing windows', how:`Return a perceivable response within roughly 100 ms; layer visual, audio and haptic feedback.`, fit:`Any real-time action loop.`, cost:`Later, richer feedback improves feel but must not delay the response.`, alt:`See Game feel and juice for the feedback catalogue.`},
  {n:'Loop layering (seconds / minutes / sessions)', how:`Nest loops: a ~3-second action loop inside a ~30-second encounter inside a multi-minute goal.`, fit:`Designing goals at three horizons and pacing.`, cost:`Imbalance between layers (great moment, aimless hour) is common.`, alt:`Audit each layer with its own reward and stopping point.`}
]);

TECH('procedural-content',[
  {n:'Noise functions (Perlin/simplex)', how:`Smooth pseudo-random fields shape terrain, texture and placement by sampling a continuous function.`, fit:`Natural-looking terrain, variation, organic distribution.`, cost:`Generic-looking output without authored shaping; parameters are unintuitive.`, alt:`Layer noise with authored masks and anchors.`},
  {n:'Grammars and L-systems', how:`Rewrite rules expand a structure (plant, dungeon, building) from a seed string.`, fit:`Structured, nested or organic forms with authorable rules.`, cost:`Hard to control global properties; can produce same-feeling output.`, alt:`Constrain with templates and post-checks.`},
  {n:'Constraint solving / Wave Function Collapse', how:`Place pieces under local adjacency constraints, backtracking when contradictions arise.`, fit:`Tile, room and layout generation where local rules matter.`, cost:`Can fail or be slow; needs good tilesets and a fallback.`, alt:`Add a generation budget and a hand-made fallback level.`},
  {n:'Search-based PCG (generate and test)', how:`Generate candidates and score them against a playability/fun evaluation, keeping the best.`, fit:`When playability constraints matter (reachability, challenge, pacing).`, cost:`Compute cost; the evaluator is the hard part and must encode real play quality.`, alt:`Cheap evaluators plus deterministic seeds you can reproduce and inspect.`}
]);

TECH('items-weapons-abilities',[
  {n:'Stat budget and cost formula', how:`Every item spends a budget across stats; a formula prices the combination so power is comparable.`, fit:`Balanced itemization without hand-tuning every item.`, cost:`Formulas reward min-maxing and can flatten identity.`, alt:`Budget for stats, authors for the feel and the exception.`},
  {n:'Loot tables and roll systems', how:`Weighted tables, rarity tiers, and pity across rolls determine what drops.`, fit:`Reward pacing and the hunt for rare items.`, cost:`Variance feels unfair at the tails; needs pity or bad-luck protection.`, alt:`Deterministic pity plus weighted randomness.`},
  {n:'Effect composition and stacking rules', how:`Items apply typed effects; stacking, refresh and exclusivity rules define how they combine.`, fit:`Abilities and affixes that interact.`, cost:`Unbounded combos create exploits and unclear tooltips.`, alt:`Limit simultaneous effect types and expose the math to the player.`}
]);

TECH('encounters-and-enemies',[
  {n:'Compatibility matrix', how:`For each enemy pair, define whether the combination creates a new question, and prune pairs that do not.`, fit:`Designing encounter variety from a small enemy set.`, cost:`Manual; grows with the roster.`, alt:`Tag enemies by question asked, then compose from tags.`},
  {n:'Encounter budget / threat points', how:`Assign each enemy a cost; compose encounters to a target budget that scales with player power.`, fit:`Pacing difficulty across a long game.`, cost:`Budgets ignore synergy; two cheap enemies can be deadlier than their sum.`, alt:`Use budgets as a first pass, then hand-tune set pieces.`},
  {n:'Wave and phase composition', how:`Structure an encounter as timed waves or boss phases, each with an intended tactical shift.`, fit:`Escalation, pacing and boss design.`, cost:`Repetitive if waves are symmetric; needs variation and recovery windows.`, alt:`Intentional rest beats between peaks (see Pacing).`}
]);
