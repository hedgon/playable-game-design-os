/* =====================================================================
   SYSTEMS
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'systems', lens:'design', t:'Systems', short:'Mechanics, economy, progression, difficulty, depth', color:'var(--d-systems)',
    sum:`Rules that interact. Systems generate the situations that make the loop worth repeating, and they are where depth comes from. They are also where complexity, balance debt and meaningless numbers hide.`,
    links:[['content','Content is systems instantiated: enemies, items and levels are parameters, not new rules.'],['core','A system is only as good as the decisions it feeds into the loop.'],['product','Economy and progression are where business model pressure meets design.'],['ai','AI is excellent at simulating, stress-testing and comparing systems.']] });

T('mechanics-and-rules',{ d:'systems', t:'Mechanics and rules', tag:'A mechanic is a verb plus the rules that give it consequences. Judge it by the decisions it creates.',
  what:`A mechanic is something the player can do (jump, trade, bluff, build) plus the rules that govern its cost, effect and interaction with other mechanics. The MDA framework (Hunicke, LeBlanc, Zubek) separates mechanics (what the designer writes) from dynamics (what happens at runtime) from aesthetics (what the player feels). Designers write mechanics but players only meet dynamics and aesthetics. Subway Surfers shows how small a move set can be: three lanes, a jump and a roll are the whole of it, and rising speed does most of the escalating. Super Mario has built every mainline entry since 1985 around the jump, and its power-ups, from the Fire Flower to Super Mario Odyssey’s capturing cap, add to what Mario can do around that jump rather than replace it.`,
  why:[`Mechanics are the only thing you directly control. Everything else is downstream.`,`A mechanic that creates no decision is a tax on attention. A mechanic that creates a decision nobody notices is a tax on implementation.`,`Rules are cheap to write and expensive to teach. Every rule spends the player’s cognitive budget.`],
  think:{ q:[`What decision does this mechanic create that did not exist without it?`,`What does it interact with? A mechanic that touches nothing is a mini-game.`,`How will the player learn it: by being told, by seeing it, or by trying it?`,`If I removed it, what would the player lose? Be specific.`],
    trade:[`More mechanics means more possible interactions and more teaching cost.`,`Specialized mechanics feel distinctive and are used rarely. General mechanics are used constantly and feel bland.`],
    traps:[`Adding a mechanic because the genre has it.`,`Designing mechanics in isolation and integrating later. Integration is where the design happens.`],
    good:[`Each mechanic has a one-line answer to “what decision does this create?”`,`Players discover uses you did not script.`],
    bad:[`The design document lists 40 mechanics and nobody can say which three matter.`] },
  how:[`List every mechanic. Next to each, write the decision it creates and what it interacts with.`,`Rank by decisions created per rule cost. The bottom of the list is your cut list.`,`For the top mechanics, prototype them together, not separately.`,`Teach each through a level, not a text box, and test whether players use it unprompted.`],
  ai:{ yes:[`Enumerate the decisions and interactions each mechanic creates from a rules description.`,`Generate mechanically distinct alternatives for a stated decision goal.`,`Find rules that are redundant or that contradict each other.`],
       no:[`Decide which mechanics define the game. Identity is a human call.`] },
  prompts:[{l:'Mechanic inventory',p:`Here is our mechanic list with rules: [LIST]. For each mechanic: the decision it creates (one sentence, or “none”), the mechanics it interacts with, and the teaching cost (rules the player must hold). Rank by decisions created per rule. Identify the 3 mechanics that could be removed with the least loss to the fantasy “[FANTASY]”, and say what would be lost.`}],
  verify:[`Did it attribute decisions the rules create, or the ones the design document claims?`,`Are the “interactions” real state dependencies, or thematic associations?`],
  test:[`Do players use each mechanic unprompted? Which ones never get touched?`,`Can players explain what a mechanic does after one use?`,`Do players combine mechanics? Which pairs?`],
  rel:[['decisions','Mechanics exist to create decisions.'],['depth-vs-complexity','Rule count is complexity. Decisions are depth.'],['systemic-design','Mechanics become systems when they interact.'],['level-structure','Levels teach mechanics.']] });
TECH('mechanics-and-rules',[
  {n:'Data-driven rules', how:`Rules, costs and effects live in data tables or curves an editor can change without a rebuild.`, fit:`Live tuning, balance passes, lots of similar mechanics (weapons, abilities, enemies).`, cost:`Balance debt accumulates and can be changed by anyone. Needs validation and a single source of truth.`, alt:`Hard-coded rules while there is one of a thing. Move to data when duplication appears.`},
  {n:'Attribute + modifier (tag/effect) systems', how:`Entities carry attributes. Effects are stacks of typed modifiers applied in a defined order each tick.`, fit:`Status effects, buffs/debuffs, and systems where anything can interact with anything.`, cost:`Ordering and stacking rules create subtle bugs. The interaction space grows fast.`, alt:`An interaction matrix plus a small modifier system is usually enough.`},
  {n:'Explicit interaction matrix', how:`List systems as rows and columns and define what happens for each pair. Blank cells are unanswered questions.`, fit:`Finding where depth and emergent interactions hide. Auditing a rule set.`, cost:`Bespoke pair logic multiplies as systems are added. Needs pruning.`, alt:`Prefer general modifier rules over per-pair exceptions unless the pair is a headline feature.`},
  {n:'Headless simulation harness', how:`Run many matches without rendering, sweeping parameter grids and logging outcomes.`, fit:`Balance, dominant strategies, and stress-testing edge cases cheaply.`, cost:`Building and maintaining the harness. The model can diverge from the real game.`, alt:`Start with a spreadsheet for a single system. Graduate to simulation when interactions matter.`}
]);
ENGINE('mechanics-and-rules',{
  godot:{ term:`A mechanic becomes a Resource with a class_name as soon as there is more than one of it. The rule stays in code, the numbers and flags move into .tres files a designer can open, and the editor gives you typed fields for free.`,
    api:['class_name / extends Resource','@export / @export_enum / @export_range','@export var list: Array[StringName]','ResourceLoader.load() / preload()','Resource.duplicate(true)','Object._set() for renamed properties'],
    snippet:`class_name MechanicDef extends Resource

@export var verb := "shove"
@export_range(0.0, 5.0) var cost := 1.0
@export_enum("self", "target", "area") var applies_to := "target"
@export var interacts_with: Array[StringName] = [&"stagger", &"burn"]

func decision_line() -> String:            # the one-line answer, straight from data
\treturn "%s costs %.1f and touches %s" % [
\t\tverb, cost, ", ".join(interacts_with)]`,
    pitfall:`Renaming an @export property after designers have saved .tres files. Godot loads the properties it recognises and drops the rest without an error, so the tuning reverts to defaults and the balance pass everyone remembers doing is gone. Rename in one commit that also rewrites the files, or implement _set() to catch the old name while they are updated.`,
    map:`A Godot Resource is a Unity ScriptableObject, and @export is [SerializeField].` },
  unity:{ term:`A mechanic is a ScriptableObject asset with CreateAssetMenu, referenced by whatever executes it. One asset per mechanic means a diff shows exactly which number moved and who moved it.`,
    api:['ScriptableObject / CreateAssetMenu','[SerializeField] / [Range] / [Tooltip]','[FormerlySerializedAs("old")]','[SerializeReference] for polymorphic effects','AssetDatabase.FindAssets("t:MechanicDef")','ISerializationCallbackReceiver'],
    snippet:`[CreateAssetMenu(menuName = "Design/Mechanic")]
public class MechanicDef : ScriptableObject {
    public string verb = "shove";
    [Range(0f, 5f)] public float cost = 1f;
    public Target appliesTo = Target.Target;
    [FormerlySerializedAs("tags")]
    public string[] interactsWith = { "stagger", "burn" };

    public string DecisionLine() =>
        $"{verb} costs {cost:0.0} and touches {string.Join(", ", interactsWith)}";
}`,
    pitfall:`Renaming a serialized field without [FormerlySerializedAs]. Unity matches by name, so every asset silently reverts that field to its default and the loss shows up as a balance regression weeks later. Changing a field’s type does the same thing even when the name matches.`,
    map:`A Unity ScriptableObject is a Godot Resource, and [FormerlySerializedAs] is a _set() shim for the old property name.` } });
INTERVIEW('mechanics-and-rules',{
  junior:[
    { q:`What is a mechanic, and how do you judge whether one is any good?`,
      a:`A verb the player can perform plus the rules that give it cost, effect and interaction. Judge it by the decision it creates that did not exist without it. A mechanic that touches no other mechanic is a mini-game sharing a menu with your game.`,
      follow:`Pick one from your last project and tell me the decision it creates.`,
      red:`Lists mechanics as features with no decision attached to any of them.` },
    { q:`Explain MDA and why it matters to your day job.`,
      a:`Mechanics are what the designer writes, dynamics are what happens at runtime, aesthetics are what the player feels. You only control the first and the player only meets the last two. That gap is the reason design is tested rather than reasoned to a conclusion.`,
      follow:`Give a case where a mechanic produced a dynamic you did not intend.`,
      red:`Recites the acronym with no consequence for how they work.` },
    { q:`Rules are cheap to write and expensive to teach. What follows from that?`,
      a:`Every rule spends the player’s cognitive budget, and every player pays whether or not they reach the payoff. So the useful ranking is decisions created per unit of rule cost, and the bottom of that list is the cut list.`,
      follow:`How do you decide which rule to cut first?`,
      red:`Treats rule count as a measure of depth.` }
  ],
  mid:[
    { q:`Forty mechanics in the document and nobody can name the three that matter. What do you do?`,
      a:`Build the inventory: the decision each creates, what it interacts with, and the rules the player must hold to use it. Rank by decisions per rule. Then present the bottom of the list as a cut list with what would be lost named for each, rather than as a complaint.`,
      follow:`The director loves one item on the cut list. How do you make the case?`,
      red:`Keeps everything and proposes a longer tutorial to cover it.` },
    { q:`Designing mechanics in isolation and integrating them later. Why is that a trap?`,
      a:`Integration is where the design happens. A mechanic tested alone tells you about the mechanic and nothing about the game. Prototype the top few together, because the interactions are the part you cannot predict from the rules.`,
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

T('depth-vs-complexity',{ d:'systems', t:'Depth vs complexity', tag:'Complexity is what the player must learn. Depth is what they can do with it. Buy depth, not complexity.',
  what:`Complexity is the number of rules, exceptions and pieces of state a player must understand to play. Tetris has seven shapes and a handful of moves, yet players keep finding better ways to play it decades on. Depth is the number of meaningful, situationally different decisions those rules generate. Elegance is high depth per unit of complexity. Chess has few rules and enormous depth. A game with 300 stats can be shallow. This vocabulary (popularized by Extra Credits and others) has no agreed metric. Use it as a lens.`,
  why:[`Complexity is paid up front by every player. Depth is enjoyed only by those who stay. Front-loading complexity churns players before they reach the depth.`,`Feature additions almost always add complexity. They add depth only if they create new situational decisions.`,`AI makes adding rules nearly free, which makes complexity inflation the default failure.`],
  think:{ q:[`For each rule: what decision would disappear if I deleted it? If none, delete it.`,`Could one rule replace three? Rules that interact multiply depth. Rules that add cases only add complexity.`,`What is the smallest ruleset that still produces the intended decisions?`,`Is this complexity load-bearing or decorative?`],
    trade:[`Cutting rules cuts edge cases players loved as well as ones they hated.`,`Depth requires interacting rules, which are harder to balance and to explain.`],
    traps:[`Adding exceptions to fix balance instead of changing the underlying rule.`,`Confusing “hard to learn” with “deep”.`,`Measuring depth by feature count in marketing copy.`],
    good:[`New players can start within minutes. Veterans are still discovering interactions after months.`,`Rules fit on a card. Strategies fill a wiki.`,`Players using identical inputs still play visibly different games, as in Super Smash Bros., where every fighter shares one direction-plus-button scheme and the gap between a newcomer and an expert shows in movement and edge play.`,`A cut rule is tested and restored when depth drops, as Hearthstone’s designers did with summoning sickness after removing it made the game simpler but, in Eric Dodds’s words, “lost so much depth”.`],
    bad:[`The tutorial is long and the endgame strategy is one build.`] },
  how:[`Use the Rule Audit tool: list rules, mark each as creating a decision, enabling an interaction, or neither.`,`Delete or merge the “neither” rules in a prototype. Playtest. Most players will not notice.`,`For balance problems, prefer changing a number or a core rule over adding an exception.`,`Track time to first meaningful decision for new players. Drive it down.`],
  ai:{ yes:[`Audit a ruleset for rules that create no decision.`,`Propose rule merges that preserve decisions.`,`Simulate decision variety before and after a simplification.`],
       no:[`Decide how much complexity your player will tolerate. That depends on the player model.`] },
  prompts:[{l:'Depth audit',p:`Evaluate this system for depth rather than feature count: [RULES]. For each rule, classify it as (a) creates a situational decision, (b) enables an interaction with another rule, or (c) adds cognitive or implementation load only. Propose merges or deletions for every (c), stating what the player would lose. Then estimate how many distinct meaningful decisions the simplified system still produces and how the first-hour learning load changes.`}],
  verify:[`Did it defend rules because they are “standard” rather than because they create decisions?`,`Are the proposed merges simpler for the player, or just shorter to write?`],
  test:[`Time to first meaningful decision for a new player.`,`Ask new players to explain the rules after 15 minutes. What did they get wrong? Those rules are too complex or badly taught.`,`Ask veterans to list strategies. Depth shows up as a long, varied list.`],
  rel:[['mechanics-and-rules','Rules are the unit of complexity.'],['decisions','Decisions are the unit of depth.'],['systemic-design','Interacting rules are the source of depth.'],['ai-failure-modes','Feature inflation is the AI-era version of complexity creep.']] });
TECH('depth-vs-complexity',[
  {n:'Rule audit', how:`Classify each rule as creating a decision, enabling an interaction, or adding load only. Cut or merge the load-only rules.`, fit:`Reducing complexity without losing depth.`, cost:`No agreed numerical metric. Use as a lens.`, alt:`Use the Rule audit tool.`},
  {n:'Decision density', how:`Measure how often meaningful decisions occur per minute. Add depth where it is sparse.`, fit:`Pacing engagement and diagnosing shallow systems.`, cost:`More decisions is not always better. Noise and fatigue.`, alt:`Prefer fewer, weightier decisions.`},
  {n:'Teachability test', how:`Can a new player learn a rule in one use and explain it? If not, it is complexity.`, fit:`Checking whether rules earn their learning cost.`, cost:`Some depth is intentionally opaque. Judge per audience.`, alt:`Teach, then test comprehension.`}
]);
ENGINE('depth-vs-complexity',{
  godot:{ term:`Complexity has a file size. Every @export a designer tunes is written into each scene and resource that overrides it, every piece of new state lands in the save, and every branch needs a headless check to stay honest.`,
    api:['Object.get_property_list()','PROPERTY_USAGE_EDITOR','@export_group / @export_subgroup','extends SceneTree with --headless --script','push_warning()','assert()'],
    snippet:`extends SceneTree                          # res://tools/rule_cost.gd, run before review

func _init() -> void:
\tvar def := load("res://rules/combat.tres")
\tvar knobs := def.get_property_list().filter(
\t\tfunc(p: Dictionary) -> bool: return p.usage & PROPERTY_USAGE_EDITOR)
\tprint("tunable knobs: %d" % knobs.size())   # what the next hire must learn
\tif knobs.size() > 20:
\t\tpush_warning("this rule set asks a lot of whoever tunes it next")
\tquit()`,
    pitfall:`Adding a rule as one more @export on the same script. It costs nothing to type, and it is now stored in every scene that tunes it away from the default, in every save file that serialises the node, and in the inspector of everyone who opens it. Removing it later leaves stale keys that Godot ignores in silence, so the clean-up never feels finished.`,
    map:`get_property_list() is Unity’s SerializedObject iteration, and a .tres knob count is a ScriptableObject’s serialized field count.` },
  unity:{ term:`The same count, read through the serialization layer. Unity’s multiplier is prefabs: a field added to a component used by four hundred prefabs is four hundred places where the value can drift from the one you intended.`,
    api:['SerializedObject / SerializedProperty.NextVisible()','PrefabUtility.GetPropertyModifications()','PrefabUtility.RevertPropertyOverride()','[HideInInspector] / [Header]','AssetDatabase.FindAssets()','[MenuItem]'],
    snippet:`[MenuItem("Design/Count rule knobs")]
static void Count() {
    var so = new SerializedObject(Selection.activeObject);
    var it = so.GetIterator();
    int knobs = 0;
    while (it.NextVisible(true)) knobs++;
    var mods = PrefabUtility.GetPropertyModifications(Selection.activeObject);
    Debug.Log($"{knobs} knobs, {mods?.Length ?? 0} overrides drifting from them");
}`,
    pitfall:`Tuning on a prefab instance in a scene instead of on the prefab or the ScriptableObject. Each edit becomes a property override that is invisible unless you go looking, so the rule has one value in the asset and another in the four scenes somebody touched, and the balance conversation is about numbers nobody is playing.`,
    map:`Unity prefab property overrides are a Godot scene instance overriding an exported value, with a revert arrow in both editors.` } });
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
DIAGRAM('depth-vs-complexity', { kind:'quad', title:'Buy depth, not complexity',
  x:'Complexity (rules to learn)', y:'Depth (decisions it creates)',
  points:[{t:'Go', x:0.12, y:0.9},{t:'Chess', x:0.42, y:0.82},{t:'300-stat spreadsheet', x:0.86, y:0.26},{t:'Tic-tac-toe', x:0.1, y:0.1}],
  q:['Elegant: aim here','Deep but costly to learn','Simple and shallow','Complexity without depth'] });

T('systemic-design',{ d:'systems', t:'Systemic design', tag:'Rules should collide. Ask “what happens when these two systems meet?” before adding a third.',
  what:`Designing mechanics so they read and write shared state and therefore interact: fire spreads on grass, which enemies fear, which players can exploit to herd them. Minecraft does this with blocks: fire spreads along wood, water stops lava, and a player can use each to solve a problem the designer never set. Systemic games produce situations the designer never authored. Tynan Sylvester frames this as designing for emergence. The opposite is a set of sealed mini-games sharing a menu.`,
  why:[`Interaction is the only way a finite set of rules produces an unbounded set of situations.`,`Systemic depth is cheap in content and expensive in judgment: fewer assets, more tuning.`,`Isolated systems each need their own content to stay interesting, which multiplies scope.`],
  think:{ q:[`Which state does each system read and write? Where do two systems touch the same state?`,`What is the most surprising legal combination? Have I tried it?`,`What is the one interaction that would make the fantasy click?`,`Which interactions must be prevented (degenerate), and can I prevent them with a rule rather than a wall?`],
    trade:[`More interaction produces more emergence and more exploits and QA cost.`,`Sealed systems are predictable to balance and boring to combine.`],
    traps:[`Sealing systems to make them easier to balance, then adding content to compensate.`,`Interactions only the designer knows about because they are never surfaced to the player.`],
    good:[`Players plan combinations. Strategy discussion mentions two systems at once.`,`Bugs are sometimes kept as features.`],
    bad:[`Each system has its own currency, UI and tutorial and never touches the others.`] },
  how:[`Use the System Relationship Map tool: nodes for resources, mechanics, enemies, environment, progression, edges for amplifies, counters, consumes, produces, unlocks, requires.`,`Find nodes with one or zero edges. Ask what they could touch.`,`Pick the two most promising unconnected systems, write one interaction rule, prototype it.`,`Surface interactions to the player through feedback so the emergence is perceivable.`],
  ai:{ yes:[`Build the relationship graph from your design documents.`,`Enumerate legal combinations and predict emergent strategies and exploits.`,`Simulate interacting systems numerically to find runaway loops.`],
       no:[`Decide which emergent behaviours fit the fantasy.`] },
  prompts:[{l:'Collision matrix',p:`Here are our systems and the state each reads and writes: [MAP]. Produce a matrix of pairwise interactions: existing, possible, or impossible. For each “possible” pair, write one concrete interaction rule, the emergent strategy it might produce, and whether it fits the fantasy “[FANTASY]”. For each “existing” pair, describe the most degenerate strategy it enables. Rank the possible interactions by depth added per rule added.`}],
  verify:[`Are the predicted interactions derivable from shared state, or thematic hand-waving?`,`Did it consider how the player would perceive each interaction?`],
  test:[`Do players combine systems deliberately? Ask them to describe a plan.`,`Do players discover interactions you did not document?`,`Which systems do players never use together? Those edges are missing or invisible.`],
  rel:[['genre-hybrids','A genre hybrid is two systems joined by a resource that crosses between them.'],['agency-and-emergence','Emergence is the payoff of systemic design.'],['depth-vs-complexity','Interactions multiply depth without multiplying rules.'],['economy-and-resources','Economies are systemic design applied to quantities.'],['content-multiplies','Systemic depth reduces the content needed.']] });
TECH('systemic-design',[
  {n:'State and signal propagation', how:`Systems read and write shared state, emit signals or tags, and react to events rather than calling each other directly.`, fit:`Emergent, immersive-sim style worlds where systems combine freely.`, cost:`Hard to trace causality. Debugging emergent bugs needs a timeline view.`, alt:`Explicit pairwise interactions for a small system count.`},
  {n:'Interaction matrix', how:`Enumerate system pairs and define the outcome. Measure how many pairs have real interactions.`, fit:`Auditing depth and spotting isolated systems (mini-games).`, cost:`Manual upkeep as systems change.`, alt:`Generate the matrix from tags/signals once the base is sound.`},
  {n:'Constraint from below, emergence from above', how:`Keep each rule simple and local. Let complex behaviour arise from combination rather than authoring global cases.`, fit:`Games whose promise is player-created stories or strategies.`, cost:`Emergence is not guaranteed and not reproducible. Some outcomes are degenerate and must be pruned.`, alt:`Author the outcomes you cannot risk. Simulate the rest.`}
]);
ENGINE('systemic-design',{
  godot:{ term:`Systems meet through shared state and through the physics server. Areas with layers and masks are how fire finds grass, and TileMapLayer custom data is how the ground itself carries a property other systems can read.`,
    api:['Area2D / Area3D monitoring','collision_layer / collision_mask','Area2D.get_overlapping_bodies()','TileMapLayer.get_cell_tile_data() / TileData.get_custom_data()','@export_flags_2d_physics','await get_tree().physics_frame'],
    snippet:`@export_flags_2d_physics var burnable_mask := 0

func spread(delta: float) -> void:
\t$Heat.collision_mask = burnable_mask     # the mask says what this Area can see
\tfor body in $Heat.get_overlapping_bodies():   # valid only after a physics frame
\t\tif body.has_method("take_heat"):
\t\t\tbody.take_heat(intensity * delta)
\tvar cell := ground.local_to_map(ground.to_local(global_position))
\tvar data := ground.get_cell_tile_data(cell)
\tif data and data.get_custom_data("flammable"):
\t\tground.set_cell(cell, SCORCHED_SOURCE, SCORCHED_COORDS)`,
    pitfall:`Reading get_overlapping_bodies() in _ready or on the frame something spawned. The physics server has not run yet, so the list is empty and the interaction you designed simply does not happen for new objects. Await get_tree().physics_frame first, and remember layers and masks are not symmetric: A sees B when B’s layer is in A’s mask.`,
    map:`Godot collision layers and masks are Unity layers plus the physics collision matrix, and Area monitoring is OnTriggerStay.` },
  unity:{ term:`Shared state travels through trigger colliders and layer masks. An interaction you can draw on a whiteboard usually fails in the engine for physics reasons rather than design reasons, and the first thing to check is which side has a Rigidbody.`,
    api:['Collider.isTrigger / OnTriggerEnter / OnTriggerStay','Rigidbody required on one side','Physics.OverlapSphereNonAlloc()','LayerMask / Project Settings collision matrix','TryGetComponent<T>()','Time.fixedDeltaTime'],
    snippet:`public class HeatSource : MonoBehaviour {
    [SerializeField] LayerMask burnable;
    [SerializeField] float radius = 3f, intensity = 12f;
    readonly Collider[] hits = new Collider[32];   // no allocation per physics tick
    void FixedUpdate() {
        int n = Physics.OverlapSphereNonAlloc(transform.position, radius, hits, burnable);
        for (int i = 0; i < n; i++)
            if (hits[i].TryGetComponent(out IHeatable h))
                h.TakeHeat(intensity * Time.fixedDeltaTime);
    }
}`,
    pitfall:`Expecting two static colliders to notice each other. Unity only raises trigger callbacks when at least one of the pair has a Rigidbody, so a static fire volume and a static grass collider never interact and nothing anywhere warns you. Give one side a kinematic Rigidbody, or query explicitly the way the overlap above does.`,
    map:`A Unity LayerMask query is a Godot Area with a collision mask, and the collision matrix is the layer and mask pair.` } });
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

T('economy-and-resources',{ d:'systems', t:'Economy and resources', tag:'Sources, sinks, converters. Every resource should force a decision about how to spend it.',
  what:`The flows of resources in a game: where they come from (sources), where they go (sinks), how they convert (traders, crafting), and what state they carry (inventory, currency, health, time). An economy is healthy when resources are scarce enough to force tradeoffs and abundant enough that the player can act. In Plants vs. Zombies the in-level currency, sun, is never paid for kills, only collected or grown, so every Sunflower spends a square a weapon could have used. StarCraft (1998) runs three races on one shared economy, minerals, vespene gas and a supply cap, but spends it through three unrelated rosters: Terran buildings can lift off and move, Zerg supply falls with every lost Overlord, and Protoss buildings work only inside a Pylon’s power field, so a designer tuning one race’s sinks cannot assume the same fix works for the other two.`,
  why:[`Resource decisions are the most common decisions in most genres. A broken economy breaks decision-making everywhere.`,`Economies drift: a small imbalance compounds over hours into “everything is free” or “nothing is affordable”.`,`Multiple currencies multiply cognitive load and rarely multiply decisions.`],
  think:{ q:[`For each resource: what is the decision about spending it? If there is only one thing to spend it on, it is a progress bar, not a resource.`,`Where does it enter and leave? Are sinks strong enough to keep it scarce at hour 20?`,`Do two resources trade off, or is one strictly better?`,`Why does this need its own currency? Could it share one?`],
    trade:[`Scarcity increases decision weight and frustration.`,`More currencies allow finer tuning and cost clarity.`],
    traps:[`Adding a currency to gate a system instead of designing a trade-off.`,`Rewards that grow faster than sinks, producing late-game surplus and pointless choices.`,`Monetization currencies bleeding into the design economy and distorting it.`],
    good:[`Players hesitate over purchases at every stage.`,`Players can explain why they saved or spent.`,`Players can name the source they are farming and the sink it feeds, the way a Monster Hunter player names the monster, the part to break and the weapon its material will forge.`,`Five Nights at Freddy’s (2014) makes its cameras, hall lights and doors all draw on one power supply that must last the night, so the resource being spent is really the player’s attention.`],
    bad:[`Players hoard because nothing is worth buying, or spend without thinking because everything is affordable.`] },
  how:[`Draw the flow diagram: resources as nodes, sources and sinks as edges with rates.`,`Simulate the economy across the intended playtime (spreadsheet or script). Find where a resource goes to surplus or starvation.`,`Merge currencies that do not create separate decisions.`,`Playtest with logging: track balances over time per player. Compare to the simulation.`,`Try one pricing rule across a whole catalogue before hand-tuning items: Cookie Clicker raises every building’s price by 15% per copy owned, and that single rule paces twenty buildings across hours of play.`,`When a game gives players a trade window but no market or prices, watch what they adopt as currency: on Diablo II’s Battle.net players settled on the rare, portable Stone of Jordan ring, a signal of what your own economy is missing.`,`Give a random reward system a fixed-price converter with a deliberate loss: Hearthstone’s dust turns any unwanted card into the one a player wants, a legendary costing 1,600 dust while destroying one returns only 400, so luck is capped and packs still sell.`],
  ai:{ yes:[`Build the flow model and simulate it across playtime and player skill.`,`Find runaway loops and dead resources.`,`Propose sink designs for surplus and source tuning for starvation.`,`Compare telemetry to model predictions.`],
       no:[`Decide how scarce the game should feel. That is an experience call.`,`Decide monetisation policy.`] },
  prompts:[{l:'Economy simulation',p:`Here is our economy: resources, sources with rates, sinks with costs, converters: [SPEC]. Write a simulation over [N] hours of play for a cautious, an average and an aggressive spender. Report balance curves, the hour at which each resource reaches surplus (more than 3x the largest sink) or starvation (cannot afford the smallest sink for more than 10 minutes), and the decisions that collapse as a result. Propose the smallest rate or cost changes that keep every resource decision live through hour [N].`}],
  verify:[`Does the simulation match observed telemetry at the points you have data for?`,`Did it model player behaviour, or assume optimal play?`],
  test:[`Log balances over time. Where does a resource become irrelevant?`,`Ask players what they are saving for. No answer means no sink.`,`Do players understand exchange rates? Ask them to estimate a cost.`],
  rel:[['systemic-design','Economy is systemic design applied to quantities.'],['progression','Progression is usually paid for through the economy.'],['business-model','Monetization pressures the design economy.'],['decisions','Spending is the most frequent decision in many games.'],['economy-modelling-and-balance','The method for tuning an economy with anchors, archetypes and telemetry.']] });
TECH('economy-and-resources',[
  {n:'Sinks-and-faucets balance sheet', how:`List every source (faucet) and drain (sink) of each resource, then compute net flow per session and per hour.`, fit:`Any economy. The first instrument to build.`, cost:`Only as good as the data. Ignores player behaviour until measured.`, alt:`Start here before touching numbers.`},
  {n:'Cost and reward curves', how:`Define prices and rewards as functions (linear, polynomial, exponential) of progress or power.`, fit:`Pricing upgrades, pacing unlocks, scaling rewards.`, cost:`A bad curve is invisible until late-game. Exponential costs can wall players, flat costs can trivialize.`, alt:`Fit the curve to intended time-to-goal, then test against real play sessions.`},
  {n:'Multi-currency design and exchange', how:`Several resources with distinct roles, plus conversion or trading between them.`, fit:`Separating short- and long-term spending, or soft/hard currency in free-to-play.`, cost:`Cognitive load and opacity. More wallets to balance and explain.`, alt:`One currency until two create different decisions.`},
  {n:'Monte Carlo / spreadsheeted balance', how:`Model the economy in a spreadsheet or simulation and sweep many play patterns.`, fit:`Detecting runaway loops, sinks that never bite, or sources nobody uses.`, cost:`Model maintenance. The model can drift from the game.`, alt:`Spreadsheet for arithmetic, simulation once randomness and player choice matter.`}
]);
ENGINE('economy-and-resources',{
  godot:{ term:`The wallet is an autoload with a signal, and the amounts are integers. Every source and every sink goes through one function, so the balance sheet you drew on paper has exactly one place where it can disagree with the game.`,
    api:['Autoload singleton','signal balance_changed(currency, delta, reason)','Dictionary with StringName keys','FileAccess.store_var() / get_var()','integer arithmetic for money','Time.get_unix_time_from_system()'],
    snippet:`# autoload: Wallet
signal balance_changed(currency: StringName, delta: int, reason: String)
var _balances := {}                        # StringName -> int, never float

func apply(currency: StringName, delta: int, reason: String) -> bool:
\tvar now: int = _balances.get(currency, 0)
\tif now + delta < 0:
\t\treturn false                         # every sink refuses in one place
\t_balances[currency] = now + delta
\tbalance_changed.emit(currency, delta, reason)   # reason is the ledger
\treturn true`,
    pitfall:`Storing money as a float. GDScript floats are doubles, which hides the problem until a percentage discount introduces a fraction, and then a balance reads 999.9999 and a purchase the player can obviously afford is refused. Keep integers in the smallest unit and format only at the UI edge.`,
    map:`A Godot autoload wallet is a static Unity service, and store_var is JsonUtility plus a file write.` },
  unity:{ term:`The same single chokepoint, with a serialization warning attached: the obvious structure for a multi-currency wallet is a Dictionary, and Unity’s built-in JSON cannot serialize one.`,
    api:['static service or ScriptableObject runtime set','event Action<string,int,string>','int / long arithmetic','JsonUtility (no Dictionary support)','ISerializationCallbackReceiver','[Serializable] struct for a save row'],
    snippet:`[Serializable] public struct Purse { public string currency; public int amount; }
public static class Wallet {
    static readonly Dictionary<string, int> Balances = new();
    public static event Action<string, int, string> Changed;
    public static bool Apply(string currency, int delta, string reason) {
        Balances.TryGetValue(currency, out int now);
        if (now + delta < 0) return false;
        Balances[currency] = now + delta;
        Changed?.Invoke(currency, delta, reason);
        return true;
    }
    // saved as a List<Purse>: JsonUtility writes an empty object for a Dictionary
    public static List<Purse> ToSave() => Balances
        .Select(kv => new Purse { currency = kv.Key, amount = kv.Value }).ToList();
}`,
    pitfall:`Saving the wallet with JsonUtility while it is a Dictionary. JsonUtility writes an empty object for unsupported types without complaining, so the file is valid JSON, the save looks fine and every player loads with nothing. Convert to a serializable list, or use a serializer that handles dictionaries.`,
    map:`A Unity static service is a Godot autoload, and ISerializationCallbackReceiver is the _set and _get pair on a Resource.` },
  note:`With real money on the line this wallet is a mirror. The authority is a ledger on a server, the client copy exists to keep the UI honest between syncs, and every local apply is a prediction the server is allowed to reject.` });
INTERVIEW('economy-and-resources',{
  junior:[
    { q:`Sources, sinks and converters. Explain with a real economy.`,
      a:`Where a resource enters, where it leaves, and how it trades for another. Health enters from pickups and leaves through mistakes. Currency enters from encounters and leaves through upgrades. Healthy means scarce enough to force a trade-off and abundant enough that the player can act at all.`,
      follow:`Which of the three is weakest in most games you have played?`,
      red:`Describes only the sources and never asks where the resource leaves.` },
    { q:`When is a resource just a progress bar?`,
      a:`When there is only one thing to spend it on. Without a spending decision it is a measurement with extra steps, and players treat it as one. The fix is a second worthwhile use, not a second currency.`,
      follow:`How would you turn one back into a real resource?`,
      red:`Adds another currency instead of another use.` },
    { q:`Why are multiple currencies usually a bad trade?`,
      a:`They multiply cognitive load and rarely multiply decisions. A currency added to gate a system is a gate wearing an economy’s clothes, and the player has to learn an exchange rate that buys them nothing.`,
      follow:`When is a second currency justified?`,
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
DIAGRAM('economy-and-resources', { kind:'economy', title:'Sources, pools, converters and sinks',
  nodes:[{id:'quests', t:'Quest rewards', type:'source'},{id:'loot', t:'Enemy drops', type:'source'},{id:'gold', t:'Gold', type:'pool'},{id:'gear', t:'Gear', type:'pool'},{id:'repair', t:'Repairs', type:'sink', row:2},{id:'shop', t:'Shop', type:'converter'}],
  edges:[['quests','gold','per quest'],['loot','gold','per kill'],['gold','shop','spend'],['shop','gear','buy'],['gold','repair','upkeep']],
  note:'Every flow in needs a way out that forces a choice. A pool with no sink inflates until the numbers mean nothing.' });

T('progression',{ d:'systems', t:'Progression', tag:'Not “number goes up”. Ask what new capability, decision, expression or experience each step unlocks.',
  what:`How the player’s situation changes over the long horizon: power (stronger), horizontal (different options), mastery (better at the same thing), unlocks (access), narrative (the story advances). Progression schedules anticipation and gates content. The failure mode is progression that only changes numbers while the decisions stay the same. Cookie Clicker is the edge case: most of its twenty buildings change only a production rate, yet players have kept at it for hundreds of hours, because there the growing number itself is the promise rather than a stand-in for new decisions. Katamari Damacy is a comparable edge case, except its climbing diameter only grows through the player’s own real-time routing under a clock, not through unattended accumulation, so it reads as a skill record rather than an idle promise. Call of Duty 4: Modern Warfare (2007) stacks three horizons in one online shooter: killstreaks within a life, experience within a match, and weapon and perk unlocks across a career, capped by a Prestige reset that trades every unlock for a badge.`,
  why:[`Progression is the long-horizon goal and the reason to return. It is also where “grind” lives.`,`Power progression without new decisions makes the game easier and less interesting at the same time.`,`Unlock pacing decides whether the player feels the game is opening up or holding out on them.`],
  think:{ q:[`For each progression step: what can the player DO now that they could not before? Not what number changed.`,`Does progression unlock new decisions, or remove them (by making one option dominant)?`,`Does the player see the next step and want it? Anticipation needs visibility.`,`How much of the game is behind a wall the player does not yet understand the point of?`],
    trade:[`Power progression is legible and hollow. Horizontal progression is rich and hard to feel.`,`Fast unlocks feel generous and exhaust content. Slow unlocks feel like a grind and extend life.`],
    traps:[`Stat inflation as a substitute for new situations.`,`Gating the interesting systems behind hours of the boring ones.`,`Reward schedules copied from other games without their loop.`],
    good:[`Players describe unlocks in terms of what they can do: “now I can...” `,`Players plan towards a specific unlock.`,`Players go back into finished areas because a new ability opens a spot they remember, as Mega Man X (1993) invites when a later weapon or upgrade reaches a hidden item in a stage already cleared.`,`Players always see the next capability coming as a fight, because each tier is gated on one boss drop, as Valheim makes Eikthyr’s antlers the only way to craft the first pickaxe.`],
    bad:[`Players say “I am just grinding to get to the good part.”`] },
  how:[`List every progression step. For each, write the new capability, decision or experience it unlocks. Steps with only a number change are candidates to merge or cut.`,`Map the unlock timeline against the content and skill curve. Check the interesting systems arrive before the player might quit.`,`Ensure the next step is visible and its value is legible before the player reaches it.`,`Playtest for “grind” language and for plans towards unlocks.`],
  ai:{ yes:[`Classify progression steps by type and flag pure number changes.`,`Model unlock pacing against expected play time.`,`Propose horizontal alternatives for a given power step.`],
       no:[`Decide how long the game should be or how generous it should feel.`] },
  prompts:[{l:'Progression audit',p:`Here is our progression track: [STEPS with timing]. For each step, classify it as power, horizontal, mastery, unlock or narrative, and write the new decision or capability it creates (or “none”). Flag steps that make a previous decision dominant. Then plot the timeline: when does the player first meet each major system, and how does that compare to typical churn windows at [TIMES]? Propose the smallest reordering that brings the most decision-rich systems earlier.`}],
  verify:[`Did it accept “stronger” as a capability? That is the trap.`,`Is the pacing model grounded in your play-time data or invented?`],
  test:[`Ask players what they are working towards and why. Specific and capability-based is a pass.`,`Do players use new unlocks, or keep the old strategy?`,`Where does “grind” first appear in player speech?`],
  rel:[['knowledge-as-progression','Some games store progress only in what the player knows, not in stats or items.'],['goals-horizons','Progression is the long horizon.'],['economy-and-resources','Progression is paid for through the economy.'],['builds-and-loadouts','Horizontal progression produces builds.'],['return-and-quit','Progression plateaus are mid-game churn.'],['content-multiplies','Content gating is progression applied to content.']] });
TECH('progression',[
  {n:'Curve families (linear, polynomial, exponential)', how:`Choose the shape of cost/reward growth to control pacing: exponential gates hard, linear is steady, S-curves front-load and back-load.`, fit:`XP curves, upgrade costs, unlock timing.`, cost:`Wrong shape creates a wall or a no-op. Players feel grind before you see it in data.`, alt:`Author the target time-to-milestone, then solve for the curve.`},
  {n:'Soft vs hard gating', how:`Soft gating (unreachable or inefficient without a tool) teaches. Hard gating (a locked door) forces order.`, fit:`Teaching mechanics, controlling pacing, or pacing narrative.`, cost:`Hard gates frustrate and break replay. Soft gates can be missed entirely.`, alt:`Soft gate by default. Hard gate only when order is the experience.`},
  {n:'Catch-up and respect-time mechanics', how:`Bonuses for lagging players, skipped grind, or shared progression across a team or account.`, fit:`Long-lived games, co-op, and multi-character progression.`, cost:`Can devalue earlier effort and flatten the sense of building. Needs care not to feel like charity.`, alt:`Catch-up reduces the cost of returning, not the meaning of progress.`}
]);
ENGINE('progression',{
  godot:{ term:`Progression is a Curve plus a table of unlocks. The Curve is an editable resource so pacing can be drawn rather than typed, and each unlock names the capability it grants instead of the number it raises.`,
    api:['Curve resource / Curve.sample()','@export var xp_curve: Curve','Curve.min_value / max_value','Resource unlock definitions','signal unlocked(id)','ResourceSaver.save()'],
    snippet:`@export var xp_curve: Curve                # x: level 0..1, y: cost 0..1
@export var xp_at_max := 48000
@export var unlocks: Array[UnlockDef] = []
signal unlocked(id: StringName)

func xp_for_level(level: int, max_level: int) -> int:
\treturn int(xp_curve.sample(float(level) / max_level) * xp_at_max)

func grant(level: int) -> void:
\tfor u in unlocks:
\t\tif u.at_level == level:
\t\t\tunlocked.emit(u.id)             # a capability, not a stat`,
    pitfall:`Filling a Curve from code without touching max_value. A Curve clamps to its min_value and max_value, both zero to one by default, so points written at 3000 are stored as 1 and the whole late game costs the same as level two. Author the shape in the curve and scale it outside, the way the sample above does.`,
    map:`A Godot Curve is a Unity AnimationCurve, and an UnlockDef resource is an unlock ScriptableObject.` },
  unity:{ term:`An AnimationCurve in the Inspector plus unlock assets. The curve is drawn by whoever owns pacing and the code only samples it, which keeps the tuning conversation out of a pull request.`,
    api:['AnimationCurve.Evaluate()','WrapMode.ClampForever / PingPong','AnimationCurve.keys / length','ScriptableObject unlock assets','event Action<string>','Mathf.RoundToInt()'],
    snippet:`public class Progression : MonoBehaviour {
    [SerializeField] AnimationCurve xpCurve = AnimationCurve.EaseInOut(0, 0, 1, 1);
    [SerializeField] int xpAtMax = 48000, maxLevel = 50;
    [SerializeField] UnlockDef[] unlocks;
    public event Action<string> Unlocked;

    public int XpForLevel(int level) =>
        Mathf.RoundToInt(xpCurve.Evaluate((float)level / maxLevel) * xpAtMax);

    public void Grant(int level) {
        foreach (var u in unlocks)
            if (u.atLevel == level) Unlocked?.Invoke(u.id);   // capability, not stat
    }
}`,
    pitfall:`Sampling an AnimationCurve past its last key. The default wrap mode clamps, so every level beyond the curve costs exactly what the last key says and the grind flattens into a straight line without one line in the console. Assert that the input is inside the key range, or set the wrap mode on purpose.`,
    map:`A Unity AnimationCurve is a Godot Curve, and WrapMode is the clamping Godot does at min_value and max_value.` } });
INTERVIEW('progression',{
  junior:[
    { q:`What is wrong with “number goes up” as a progression design?`,
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
      a:`The decision-rich systems are behind hours of the thin ones. Map first contact with each major system against the churn windows you observe, then reorder so the interesting systems arrive before players leave. Ordering is usually cheaper than rebalancing.`,
      follow:`You cannot reorder without breaking the difficulty curve. What then?`,
      red:`Speeds up the grind and leaves the ordering exactly as it was.` },
    { q:`A progression step makes a previous decision dominant. Why does that matter?`,
      a:`Progression that removes decisions makes the game shallower as it goes on, which is the opposite of what it is for. Power steps do this quietly. Classify every step and record what it closes as well as what it opens.`,
      follow:`Give an example you have seen of an upgrade that closed a decision.`,
      red:`Only checks whether each step feels rewarding at the moment it lands.` },
    { q:`Someone copies a reward schedule from a successful game. What goes wrong?`,
      a:`That schedule was tuned to that game’s loop, session length and content depletion. Dropped into a different loop it either exhausts your content early or reads as withholding. Derive the curve from your own depletion rate and session shape.`,
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

DIAGRAM('progression', { kind:'curve', title:'Player power against challenge over a game', x:'Hours played', y:'Power', alt:'Challenge rises steadily; player power rises in steps as upgrades arrive, so the player is sometimes ahead and sometimes behind, which keeps progress felt.',
  series:[{ t:'Player power', pts:[[0,0.1],[0.2,0.15],[0.22,0.3],[0.45,0.33],[0.47,0.5],[0.7,0.52],[0.72,0.72],[1,0.75]] }, { t:'Challenge', pts:[[0,0.12],[1,0.8]] }],
  beats:[{ t:'Upgrade', at:0.22 }, { t:'Upgrade', at:0.47 }, { t:'Upgrade', at:0.72 }] });

T('difficulty',{ d:'systems', t:'Difficulty and calibration', tag:'Difficulty is the relationship between what the game demands and what the player can do right now.',
  what:`The calibration of challenge against player skill over time: the curve, its local spikes and rests, the punishment and recovery around failure, and the tools for adapting (settings, assists, dynamic adjustment, player-steered difficulty). Csikszentmihalyi’s flow model (challenge matching skill) is the usual frame. Jenova Chen argued for letting players steer their own difficulty through play rather than hidden adjustment. Both are heuristics, and some games deliberately live outside the flow band. Players can steer difficulty with no code at all: Pokémon’s Nuzlocke Challenge, two rules a player wrote in a 2010 webcomic (catch only the first Pokémon met in each area; treat a fainted Pokémon as dead), turns a forgiving game into a permadeath run. The opposite ships inside the game: Contra’s NES port kept the Konami Code, and entering it at the title screen raises a player’s lives from three to thirty without changing a single enemy pattern or bullet. Subnautica lets a player steer difficulty by depth: the deep biomes wait until the player chooses to descend, so the hardest content arrives at the pace of the player’s own curiosity, even though the ending lies at the bottom.`,
  why:[`Too hard too early churns players before they have learned enough to see their own progress. Too easy for too long leaves nothing to learn, which players report as boredom.`,`“Unfair” is a specific complaint with specific causes. Treating it as “too hard” leads to the wrong fix.`,`Difficulty is felt through clarity: a hard challenge with legible rules feels fair, an easy one with hidden rules feels cheap.`],
  think:{ q:[`What exactly is hard here: execution, reading, knowledge, information overload, or randomness?`,`When the player fails, do they know why and believe they could do better?`,`Where does the curve spike? Is the spike deliberate?`,`Can the player adjust the challenge through choices in play, not just a menu?`],
    trade:[`Hidden dynamic difficulty keeps flow and undermines the feeling of earned mastery when discovered.`,`Difficulty settings include more players and fragment the intended experience.`],
    traps:[`Tuning difficulty for the team, who are experts.`,`Fixing “unfair” by making it easier when the problem was unreadable telegraphs.`,`Making the game harder by adding health instead of adding demands on skill.`],
    good:[`Players fail and immediately retry with a new idea.`,`Players of different skill describe the game as challenging but fair.`,`Players leave a boss for later and come back stronger, as Elden Ring lets them do with almost any field boss, so postponement stands in for a difficulty slider.`,`Players can say why they died (“I walked too far too soon”) and choose to level up before trying again, when the map grades danger by distance, as Dragon Quest’s rings of tougher monsters around each town do.`,`Players of any skill finish the same races when every assist is its own dial, as Forza Horizon 5 lets them set Drivatar level, braking, steering and rewind separately and pays a credit bonus, not extra content, for choosing harder.`],
    bad:[`Players describe it as “unfair”, “cheap”, “bullet sponge” or “trivial”.`] },
  how:[`Use the Unfairness Diagnostic when players complain: classify the cause before changing numbers.`,`Plot the intended difficulty curve. Overlay observed failure rates per section from playtests.`,`Fix spikes by teaching or telegraphing before reducing demands.`,`Offer player-steered difficulty (optional risk, routes, tools) before menu settings: Mega Man 11 lets a player on critical health trigger Double Gear, both gears at once, at the price of a long overheat afterwards, beside four ordinary presets.`,`Test with the target player, never only with the team.`,`Track time to quit and time to pass as two numbers, not one difficulty score: King does this for Candy Crush Saga levels, on the view that a hard level can still be fun if it is short, and used the split to find and rebuild its hundred least fun levels.`,`When a shipped system’s own calibration is the actual complaint, expect players to fix it themselves: Cities: Skylines’ base traffic AI fixes each route when a trip starts, and Traffic Manager: President Edition, an unofficial mod, is what many long-time players use to rewrite its junction and lane rules instead.`],
  ai:{ yes:[`Classify failure reports and observer notes by cause.`,`Model failure rates from challenge parameters and skill distributions.`,`Propose telegraphing and teaching fixes as alternatives to number changes.`],
       no:[`Decide how hard the game should be. That is an audience and identity decision.`] },
  prompts:[{l:'Unfairness diagnosis',p:`Players report that [SECTION] feels unfair. Here are observer notes, failure counts and what players said: [DATA]. Classify the likely cause: unclear rules, insufficient feedback, execution demand, information overload, randomness, poor checkpointing, excessive punishment, or insufficient mastery opportunity. For each plausible cause, cite the evidence and propose a fix that does not reduce the challenge itself. Only then propose a number change, if still needed.`}],
  verify:[`Did it default to “make it easier”? That is the lazy fix.`,`Is the model of skill distribution grounded in your testers or assumed?`],
  test:[`Failure counts per section per player.`,`After failure: “what happened?” Accurate answers mean the difficulty is legible.`,`Do players quit after a failure or after a success?`,`Do players of different skill find different routes or tools?`],
  rel:[['puzzle-design','In a puzzle, difficulty should come from the insight required, never from obscurity.'],['challenge-failure-recovery','Failure handling is half of felt difficulty.'],['skill-and-mastery','Difficulty is relative to skill.'],['pacing','Difficulty curves are pacing.'],['feedback-and-affordance','Unfairness is often a feedback problem.']] });
TECH('difficulty',[
  {n:'Explicit difficulty presets', how:`Named modes that change a curated set of parameters together.`, fit:`Broad audiences. The honest default where the challenge is part of the fantasy.`, cost:`Splits tuning and QA effort. Players self-sort wrongly.`, alt:`Start with presets. Add adaptivity only where a preset cannot cover the skill spread.`},
  {n:'AI fairness knobs (reaction time, accuracy, aggression)', how:`Tune how fast and how well agents perceive and act, rather than their raw power.`, fit:`Action games where felt challenge comes from behaviour, not numbers.`, cost:`Knobs interact. A slow but perfect AI can feel worse than a fast, fallible one.`, alt:`Tune readability first, then these knobs.`},
  {n:'Telemetry-driven calibration', how:`Use session data (deaths, retries, completion, time) to place difficulty where players get stuck.`, fit:`Live games or large playtest pools.`, cost:`Telemetry shows where, not why. Needs observation to explain.`, alt:`Pair metrics with qualitative playtests.`},
  {n:'Adaptive/behind-the-scenes adjustment', how:`Adjust pressure from performance signals within a bounded, ideally unnoticed range.`, fit:`Games where a fixed preset cannot hold the challenge band.`, cost:`Noticeable adjustment feels unfair or condescending.`, alt:`See the Adaptive AI and directors topic in the In-game AI domain.`}
]);
ENGINE('difficulty',{
  godot:{ term:`Difficulty is a preset Resource applied through one service, and the way you learn whether a curve is right is a headless run that plays the encounter many times. Godot will lie to you about that run if you push time_scale too far.`,
    api:['Resource preset with @export values','Engine.time_scale','Engine.physics_ticks_per_second','physics/common/max_physics_steps_per_frame','godot --headless --script','get_tree().get_nodes_in_group()'],
    snippet:`@export var preset: DifficultyPreset      # reaction_ms, accuracy, aggression

func apply() -> void:
\tfor agent in get_tree().get_nodes_in_group("agents"):
\t\tagent.reaction_s = preset.reaction_ms / 1000.0
\t\tagent.accuracy = preset.accuracy

func sweep(runs: int) -> void:
\tEngine.time_scale = 4.0                  # eight physics steps per frame is the cap
\tfor i in runs:
\t\tawait _play_one()
\tEngine.time_scale = 1.0`,
    pitfall:`Turning Engine.time_scale up to twenty to sweep a balance question. Physics steps per frame are capped by max_physics_steps_per_frame, eight by default, so past that ceiling the simulation runs in slow motion relative to the clock and your measured failure rates belong to a game nobody will play. Stay under the cap, or raise the tick rate instead.`,
    map:`Engine.time_scale is Unity Time.timeScale, and max_physics_steps_per_frame is the budget Time.maximumDeltaTime expresses.` },
  unity:{ term:`Presets are ScriptableObjects applied by one service, so QA can name the preset they played. Sweeps run in batch mode, and fast-forward carries the same warning as in Godot.`,
    api:['ScriptableObject difficulty preset','Time.timeScale / Time.maximumDeltaTime','Time.fixedDeltaTime','PlayMode tests / -batchmode -runTests','NavMeshAgent.speed and behaviour knobs','Application.targetFrameRate'],
    snippet:`[CreateAssetMenu(menuName = "Design/Difficulty")]
public class DifficultyPreset : ScriptableObject {
    public float reactionSeconds = 0.35f, accuracy = 0.7f, aggression = 0.5f;
}

public class DifficultyService : MonoBehaviour {
    [SerializeField] DifficultyPreset preset;
    public void Apply(IEnumerable<Agent> agents) {
        foreach (var a in agents) { a.Reaction = preset.reactionSeconds; a.Accuracy = preset.accuracy; }
    }
    public void FastForward(float scale) =>
        Time.timeScale = Mathf.Min(scale, Time.maximumDeltaTime / Time.fixedDeltaTime);
}`,
    pitfall:`Reading a sweep at a high timeScale as if it were real play. FixedUpdate keeps its step size and just runs more often per frame, but Update-driven logic (NavMeshAgent movement, reaction timers, animation) now advances in steps of up to maximumDeltaTime, a third of a second by default. Agents overshoot and react on a coarse grid, and the difficulty you measured is not the one players meet. Clamp the scale, then confirm one run at normal speed matches.`,
    map:`Unity Time.timeScale is Engine.time_scale, and Time.maximumDeltaTime is max_physics_steps_per_frame expressed as a time budget.` } });
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
    { q:`The complaint is “bullet sponge”. What is the actual problem?`,
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
DIAGRAM('difficulty', { kind:'curve', title:'Challenge in waves around a rising skill',
  x:'Time', y:'Level',
  series:[{t:'Challenge', pts:[[0,0.15],[0.12,0.3],[0.2,0.22],[0.35,0.45],[0.43,0.36],[0.58,0.62],[0.66,0.5],[0.82,0.82],[0.9,0.66],[1,0.8]]},{t:'Player skill', pts:[[0,0.1],[0.25,0.28],[0.5,0.46],[0.75,0.64],[1,0.8]]}],
  alt:'Challenge rises in waves around the player’s growing skill: spikes test what was learned, rests let it settle. Far above skill is anxiety, far below is boredom.' });

WORKED('difficulty', {
  kind:'table',
  id:'ten-level-difficulty-curve',
  t:'A difficulty curve for ten levels',
  intro:'Each row is one level. Time to kill and time survived come from health and damage per second, and their ratio is the safety margin: above 1 the player wins on these average numbers; near 1 any mistake, or missing the dodge, loses the fight. Skill shows up as a lower real enemy damage per second than the table assumes. The teaching note makes the saw-tooth: a new mechanic, practice, a combination, a test, then a rest. The method is spreadsheets for balance, as taught in Ian Schreiber and Brenda Romero’s "Game Balance" (CRC Press, 2021).',
  note:'Illustrative numbers, not from a shipped game: the shape is the lesson.',
  columns:[{h:'Level'}, {h:'Enemy health', unit:'hp'}, {h:'Enemy damage per second', unit:'hp/s'}, {h:'Player damage per second', unit:'hp/s'}, {h:'Time to kill', unit:'s'}, {h:'Player health', unit:'hp'}, {h:'Time the player survives', unit:'s'}, {h:'Safety margin'}, {h:'Teaching note'}],
  rows:[
    [1, 100, 5, 20, 5, 100, 20, 4, 'New mechanic: the first enemy that dodges'],
    [2, 140, 6, 22, 6.4, 100, 16.7, 2.62, 'Practice: the dodge again, with more room, and a shield is handed to you'],
    [3, 200, 8, 25, 8, 100, 12.5, 1.56, 'Combination: dodge plus the shield from level 2'],
    [4, 250, 9, 28, 8.9, 100, 11.1, 1.24, 'Test: all of it, no new rules'],
    [5, 150, 5, 30, 5, 120, 24, 4.8, 'Rest: a short level to breathe and spend rewards'],
    [6, 260, 8, 36, 7.2, 120, 15, 2.08, 'New mechanic: enemies that call for help'],
    [7, 320, 10, 38, 8.4, 120, 12, 1.43, 'Practice: the call for help, one at a time'],
    [8, 380, 9, 40, 9.5, 120, 13.3, 1.4, 'Combination: call for help with the shield'],
    [9, 480, 10, 44, 10.9, 120, 12, 1.1, 'Test: the whole set, the hardest level so far'],
    [10, 300, 6, 46, 6.5, 140, 23.3, 3.58, 'Rest: a victory lap with a new weapon']
  ],
  formulas:[
    {col:'Time to kill', f:'Enemy health / Player damage per second (in a sheet: =B2/D2). Rounded to one decimal.'},
    {col:'Time the player survives', f:'Player health / Enemy damage per second (in a sheet: =F2/C2). Rounded to one decimal.'},
    {col:'Safety margin', f:'Time the player survives / Time to kill (in a sheet: =G2/E2). Rounded to two decimals, so a hand check can differ in the last digit.'}
  ],
  try:['Give the player less damage from level 6: set it to 28 at level 6 and take 8 off every level after it too. Which levels fall below a margin of 1.2, and which below 1?', 'Find the first level where the margin falls below 1.2. What would a playtest show there: how many deaths, and what would players say?', 'Raise player health at level 4 from 100 to 140. How much easier does the test get, and is it still a test?', 'Why does the margin jump up at levels 5 and 10? What would the player feel if those two rest levels were removed?'],
  file:'ten-level-difficulty-curve.csv'
});

T('builds-and-loadouts',{ d:'systems', t:'Builds, loadouts and constraints', tag:'Build diversity comes from constraints that force different players to solve the same problem differently.',
  what:`Systems where the player composes a set of capabilities before or during play: classes, decks, loadouts, skill trees, party composition. Their value is expression and horizontal progression. Their failure is convergence, where one build dominates and the others are traps. Final Fantasy V (1992) shows horizontal progression through a job system: once a character masters a job’s abilities, one of them can be equipped as a command on any other job, so a build becomes a pairing the player composes rather than a level they reach.`,
  why:[`Builds are how systemic games personalize themselves. They turn one game into many.`,`Convergence is inevitable without constraints and counters. The community will find the optimum within days.`,`A build that is a trap (looks viable, is not) teaches players not to trust the system.`],
  think:{ q:[`What constraint forces a choice? Slots, points, mutual exclusion, opportunity cost?`,`What does each build do that the others cannot? Not “does more damage”: what situation does it own?`,`What counters each build? If nothing, it will dominate.`,`Can the player see what a build will feel like before committing?`],
    trade:[`Hard commitment (permanent choices) raises weight and punishes experimentation.`,`Free respec raises experimentation and removes weight.`],
    traps:[`Balancing by making builds equivalent, which removes the reason to choose.`,`Adding options without adding constraints.`,`Trap builds left in for “variety”.`],
    good:[`Players argue about builds and disagree.`,`Different builds are visible in how people play.`,`Players pick a perk to counter another player’s build, as Call of Duty 4: Modern Warfare’s UAV Jammer hides its user from the enemy’s killstreak scan.`],
    bad:[`One build in every guide. One option picked several times more often than an even share would predict.`] },
  how:[`Define the constraint that forces choice. If there is none, add one before adding options.`,`For each build, write the situation it owns and the situation that punishes it.`,`Simulate or reason about dominant combinations. Fix with counters or costs, not with equalisation.`,`Log pick rates and win rates in playtests. Investigate any option picked far above its even share (with eight builds an even share is 12.5 percent) or winning far from the average.`,`When permanent choices are the intended weight, watch whether players route around it by starting new characters instead of adapting, as Diablo II players did for a decade with no respec option at all.`],
  ai:{ yes:[`Enumerate build combinations and estimate dominance.`,`Propose counters and situational niches.`,`Analyze pick and win rate data for convergence.`],
       no:[`Decide how much commitment the game should demand.`] },
  prompts:[{l:'Convergence forecast',p:`Here are our build components, constraints and combat or challenge model: [SPEC]. Enumerate the strongest 5 combinations and estimate their pick rate after 2 weeks of community optimisation. For each, name the situation it owns and the situation that should punish it. Identify combinations that look viable but are traps. Propose counters or costs that create niches without equalising the builds.`}],
  verify:[`Did it equalise instead of differentiating?`,`Are the “situations owned” real in your content, or hypothetical?`],
  test:[`Pick rates and win rates per build over time.`,`Ask players why they chose a build. Situational reasons are a pass. “It is the best” is a fail.`,`Do players switch builds when the situation changes?`],
  rel:[['mastery-discovery-expression','Builds are the main vehicle of expression.'],['progression','Horizontal progression produces builds.'],['decisions','Build choice is a slow decision with the same criteria.'],['systemic-design','Counters are systemic design.']] });
TECH('builds-and-loadouts',[
  {n:'Affinity / synergy tagging', how:`Tag content with keywords and reward combinations that share tags or cover each other’s gaps.`, fit:`Creating build space and emergent combos without hand-authoring every pair.`, cost:`Tag soup and accidental loops. Needs a combination matrix to audit.`, alt:`A few strong tags beat many weak ones.`},
  {n:'Opportunity cost and diminishing returns', how:`Make stacking the same option less efficient, so diversification competes with specialization.`, fit:`Preventing a single dominant stack.`, cost:`Can force spread that feels like no build is special.`, alt:`Prefer content counters over global diminishing returns.`},
  {n:'Draft / pick systems', how:`Players choose from offered options, so builds emerge from opportunity as well as plan.`, fit:`Run-based games and roguelikes wanting variety per run.`, cost:`Draw variance can feel unfair. Needs pity and weighting.`, alt:`Offer choice inside a run. Let meta-progression be earned.`},
  {n:'Balance simulation by build', how:`Simulate or log win/usage rates per build and matchup to find dominance or dead options.`, fit:`Finding convergence before it hardens.`, cost:`Simulated optimal play differs from human play.`, alt:`Use pick/win telemetry where available. Simulation to explore.`}
]);
ENGINE('builds-and-loadouts',{
  godot:{ term:`A loadout is an array of Resource references plus the rule that constrains them. The trap is that a Resource loaded from a path is one shared object, so anything mutable on it has to be duplicated at equip time.`,
    api:['@export var slots: Array[ItemDef]','Resource.duplicate(true)','ResourceLoader.load() caching','class_name for typed arrays','Array.reduce() / filter()','signal loadout_changed'],
    snippet:`@export var slots: Array[ItemDef] = []
@export var budget := 10
signal loadout_changed

func equip(slot: int, def: ItemDef) -> bool:
\tvar candidate := slots.duplicate()
\tcandidate[slot] = def
\tif _cost(candidate) > budget:
\t\treturn false                         # the constraint is what makes it a choice
\tslots[slot] = def.duplicate(true)        # runtime state must not live on the asset
\tloadout_changed.emit()
\treturn true

func _cost(list: Array) -> int:
\treturn list.reduce(func(sum, d): return sum + (d.cost if d else 0), 0)`,
    pitfall:`Writing cooldowns or charges onto the ItemDef that came out of load(). Resources are cached by path, so every entity holding that item shares one object: the boss’s sword cools down when the player swings. The running game is a separate process from the editor, so nothing is written back to the .tres, and the bug stays hidden until two entities hold the same item. duplicate(true) at equip time is the entire fix.`,
    map:`Resource.duplicate is Unity’s Instantiate on a ScriptableObject, and a typed Array[ItemDef] is an ItemDef[] field.` },
  unity:{ term:`Slots hold ScriptableObject definitions, runtime state lives in a plain class beside them, and the constraint that forces a choice is enforced in one method so a second UI cannot bypass it.`,
    api:['ScriptableObject item definitions','Instantiate(scriptableObject) / Destroy()','ScriptableObject.CreateInstance<T>()','[SerializeReference] for polymorphic modifiers','LINQ Sum for the budget check','UnityEvent loadoutChanged'],
    snippet:`public class Loadout : MonoBehaviour {
    [SerializeField] ItemDef[] slots = new ItemDef[4];
    [SerializeField] int budget = 10;
    readonly Dictionary<int, ItemRuntime> live = new();   // state stays out of assets

    public bool Equip(int slot, ItemDef def) {
        int cost = def.cost;
        for (int i = 0; i < slots.Length; i++)
            if (i != slot && slots[i]) cost += slots[i].cost;
        if (cost > budget) return false;
        slots[slot] = def;
        live[slot] = new ItemRuntime(def);   // cooldowns, charges, heat
        return true;
    }
}`,
    pitfall:`Calling Instantiate on a ScriptableObject for every equip and never destroying the copy. Each copy is an object the garbage collector cannot reclaim while Unity holds it, so a long session with frequent swapping grows memory until a mobile OS kills the build. Keep the definition shared and read only, and put mutable state in a plain C# class.`,
    map:`A Unity ItemDef ScriptableObject is a Godot ItemDef Resource, and a plain runtime class is what duplicate(true) gives you in Godot.` } });
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

T('knowledge-as-progression',{ d:'systems', t:'Knowledge as progression', tag:'The unlock lives in the player’s head. Nothing in the save file has to change for the progress to be real.',
  what:`Some games hold their entire sense of advancement in what the player has come to understand, rather than in stats, items or unlockable content. Outer Wilds gives the player no permanent power gain at all: every loop resets your ship, your tools and your abilities to the same starting state, and the only thing that persists between loops is what you now know about the solar system, which is exactly what lets you reach further each time. The Witness, Return of the Obra Dinn, Myst, Tunic, Steins;Gate and 999 are worked examples under How, with the design advice and its costs.`,
  why:[`Knowledge-based progression can make growth feel more personal than a stat does, because the player, not a number on a character sheet, is now visibly more capable.`,`It solves a problem stat progression cannot: a game with knowledge gates can be difficult from the first minute to the last without ever needing to be “unfair,” because the same challenge becomes solvable once the player understands it, with no numeric buff required.`,`It creates unusual and severe risks around replay and spoilers that a conventional designer moving into this space needs to plan for explicitly, not discover after launch.`],
  think:{ q:[`For this gate, is the thing standing in the player’s way a lock the game can hand a key for, or a piece of understanding only the player’s own mind can produce?`,`If a friend told the player the answer outright, would the game still be worth finishing? If the answer is no, be honest that the entire value is concentrated in first-time discovery.`,`Is the knowledge diegetic (a manual page, an environmental clue, an overheard fact) or purely a designer’s assumption that the player will eventually “just get it”?`,`What happens to a player who takes careful written notes versus one who does not? Does the game assume note-taking, or does it also work for memory alone?`,`How much of the game’s total value would a single spoiled sentence remove, and have you planned around that at all (marketing, streaming, word of mouth)?`],
    trade:[`Knowledge gates make cheating or being spoiled uniquely destructive compared with a stat-locked gate, which a spoiler barely dents.`,`Diegetic knowledge (an in-world manual, environmental clues) is more immersive but harder to guarantee every player finds and reads, compared with an explicit tutorial that is impossible to miss.`],
    traps:[`Building a knowledge gate that is only passable by note-taking or an external wiki, mistaking “the designer knows the answer” for “the game gave the player enough to find it.”`,`Assuming a knowledge-based game needs no progression pacing at all, and dumping every rule on the player at once with nothing held back to discover later.`,`Treating a knowledge gate as equivalent to any other lock-and-key gate when writing marketing or a trailer, and accidentally spoiling the exact fact the whole design depends on.`],
    good:[`Players describe the moment of understanding unprompted, months later, as the thing they remember about the game, rather than a stat or an item.`,`Players say they “just knew” which line was the lie before opening the Court Record to find the exact evidence for it, which is what Ace Attorney’s cross-examinations are built to produce.`],
    bad:[`Players describe being stuck as “I don’t know where to look” rather than “I don’t understand what I’ve already found,” which usually means the needed information was never delivered.`] },
  how:[`The Witness teaches its entire visual grammar through wordless line puzzles on its island, so progress is measured in which rules the player has internalised, not in a level counter.`,`Return of the Obra Dinn’s only “stat” is the set of fates the player has correctly and permanently identified; there is no combat, no inventory, no experience points, just an expanding, corroborated understanding of what happened aboard the ship.`,`Myst, one of the earliest and most commercially successful examples, gates its entire world behind puzzles whose only reward is the information needed to open the next area, with no health, currency or equipment anywhere in the game.`,`Tunic goes further by making the knowledge itself diegetic: pages of an in-game instruction booklet, written in an invented language, are found scattered through the world, and reading and cross-referencing them is how the player learns the actual rules of the game they are playing, including rules a conventional game would teach in a tutorial.`,`Designing for this means building gates that are a comprehension check, not a lock and key: a door that opens once the player has understood a code, not once they have found a keycard.`,`It also means accepting two costs that traditional progression does not carry: replay value is structurally limited, because the second playthrough cannot recreate the state of not yet knowing, and the entire design is fragile to spoilers in a way a stat-based unlock is not, since a single sentence overheard online can permanently remove the only reward the game had left to give.`,`Steins;Gate decides its true ending by six replies to one character’s messages spread across seven chapters, with no in-game list or flowchart, so the player’s own memory of which replies mattered is the only progress tracker. 999 also gates its true ending behind one other specific ending, but its 2013 iOS version and 2017 Nonary Games remaster added the flowchart the 2009 DS original lacked, turning a memory-based gate into a navigable diagram without changing what the gate demands.`,`List every gate in the game and classify each one honestly: is it unlocked by an item or stat, or by the player understanding something? Be suspicious of gates you have quietly been treating as the second kind that are really the first with extra narration.`,`For every knowledge gate, name the exact source of the fact needed to pass it, and check that a player who found that source would recognise its relevance later.`,`Design the game’s note-taking or memory demands on purpose: either build in-game tools to record what the player learns, or keep the total volume of tracked facts small enough to hold in a real player’s head.`,`Playtest blind, watch for the specific language of being stuck, and separately plan a spoiler-containment strategy for marketing and community content before launch, not after.`],
  ai:{ yes:[`Audit a list of the game’s gates and classify each as a lock-and-key gate or a genuine comprehension gate, to catch ones mislabelled by the design team.`,`Trace, for each knowledge gate, whether the fact it depends on was delivered somewhere reachable and check the delivery point against a described player path.`,`Draft an in-game note-taking or journal tool’s feature set for a described set of facts the player must retain.`],
       no:[`Decide whether the moment of realisation itself feels rewarding. That is a human, first-time reaction that testing with someone who already knows the answer cannot recover.`] },
  prompts:[{l:'Comprehension-gate audit',p:`Here is a list of gates in our game and, for each, what we believe unlocks it: [GATES]. For each one, classify it as lock-and-key (an item, a stat, a currency) or a genuine comprehension gate (understanding a fact or rule). For every comprehension gate, name the exact place in the game where that fact is delivered, and flag any gate where you cannot find a clear delivery point reachable without a wiki. Then estimate, for each comprehension gate, how much of the game’s total value a single spoiled sentence about it would remove, and flag the highest-risk ones.`}],
  verify:[`Did it trace each fact to a specific, reachable delivery point in the game, or assume the player would “figure it out”?`,`Is the spoiler-risk estimate grounded in what the gate withholds, or a generic warning applied to every gate equally?`],
  test:[`Watch a blind playtester and note whether being stuck is described as “I don’t know where to look” (a delivery problem) or “I don’t understand what I found” (a genuine comprehension gap, which is working as intended for a while).`,`Ask players, well after finishing, what they remember most. A knowledge-based design succeeds if the answer is a moment of realisation rather than a specific item or stat.`,`Check whether a player who took no notes at all can still eventually pass every gate, unless the game explicitly demands note-taking as part of its fantasy.`],
  rel:[['progression','This is one whole category of progression alongside power, horizontal, mastery and unlock steps.'],['mastery-discovery-expression','Discovery is one of the three long term engines; here it is the only one.'],['environmental-storytelling','Diegetic knowledge, like Tunic’s manual pages, is usually delivered through the environment itself.'],['difficulty','A comprehension gate can be difficult without ever needing to be numerically unfair.'],['decisions','Reaching the aha moment is itself a decision point: acting on a new piece of understanding for the first time.']] });
TECH('knowledge-as-progression',[
  {n:'Fact-flag tracking', how:`Model progression as a growing set of discovered facts (booleans or enums keyed by a stable id) rather than items or stats, and gate content on facts known rather than inventory held.`, fit:`Any game where the actual reward is understanding, not possession.`, cost:`Needs its own surfacing (a journal, map annotations, a manual) or players will simply forget what they learned between sessions.`, alt:`Let the world remember instead of a menu: a door that silently unlocks once the right fact is known, rather than a checklist screen.`},
  {n:'Understanding gates over lock-and-key', how:`Block progress with a puzzle only solvable once a specific fact is known, rather than a literal key item.`, fit:`Replacing content gating with genuine comprehension gating.`, cost:`A gate that looks identical to a bug or a dead end until the player has the knowledge to recognise it as a gate at all.`, alt:`Telegraph that a gate exists, visibly, even before the player has the knowledge needed to pass it, so it reads as a puzzle rather than a wall.`},
  {n:'Replay and new-game-plus design', how:`Decide up front what, if anything, a second playthrough offers once all the knowledge has already been gained, since the core reward cannot be experienced twice.`, fit:`Games whose entire progression is a one-time, non-repeatable insight.`, cost:`Genuinely hard to design a second playthrough’s worth of value once the surprises are already spent.`, alt:`Accept the game is meant to be played once, by design, rather than forcing a new-game-plus mode that has nothing left to reveal.`}
]);
ENGINE('knowledge-as-progression',{
  godot:{ term:`Progression here is a set of stable fact ids the player has learned, not an inventory. The implementation risk is Godot’s Resource cache: load()-ing the same .tres path twice returns the same shared instance, so mutating a “knowledge” Resource in place can leak state between what should be separate saves or a fresh playthrough.`,
    api:['Dictionary[StringName, bool] (4.4+) or a custom Resource for fact state','ResourceLoader.load() caching behaviour','Resource.duplicate()','ResourceSaver.save() for persistence','signal fact_learned(id)','JSON.stringify() / parse() as a save-format alternative'],
    snippet:`extends Resource
class_name KnowledgeState
@export var known: Dictionary = {}  # stable string id -> true
signal fact_learned(id: StringName)

func learn(id: StringName) -> void:
\tif known.has(id): return
\tknown[id] = true
\tfact_learned.emit(id)

func knows(id: StringName) -> bool:
\treturn known.get(id, false)

# On new game: KnowledgeState.new(), never load()'s cached shared instance`,
    pitfall:`Calling load(“res://knowledge_state.tres”) to fetch a “fresh” state. Godot caches loaded resources by path, so every load() of the same file returns the same shared instance in memory; mutating it for one playthrough or one test run leaves those facts “known” for the next load() too, for as long as anything still holds a reference to it. Use .new() for fresh state, and .duplicate() when you must start from an authored template.`,
    map:`Godot’s Resource path cache is the direct analogue of a Unity ScriptableObject asset’s values persisting across Play Mode sessions in the editor: both need an explicit, deliberate reset to start fresh.` },
  unity:{ term:`The same fact-tracking model applies: a set or dictionary of stable string ids, never an index into a list, since knowledge progression saves are meant to last as the content list grows.`,
    api:['HashSet<string> or Dictionary<string,bool>','ScriptableObject as an authored fact catalogue (not the save data itself)','JsonUtility / Newtonsoft Json package for save serialisation','event Action<string> FactLearned','Application.persistentDataPath','ISerializationCallbackReceiver for dictionary saving'],
    snippet:`[Serializable]
public class KnowledgeState {
    public List<string> known = new();        // stable ids; JsonUtility cannot save HashSet
    public event Action<string> FactLearned;

    public void Learn(string id) {
        if (known.Contains(id)) return;
        known.Add(id);
        FactLearned?.Invoke(id);
    }
    public bool Knows(string id) => known.Contains(id);
}`,
    pitfall:`Saving known facts as indices into the master fact list (“player knows facts 3, 7 and 12”) instead of stable string ids. The moment a content update reorders that list or inserts a new fact in the middle, every existing save’s indices silently point at the wrong facts, which is a uniquely bad failure for a game whose entire progression is that list. Key every save entry by a stable id that never changes once shipped.`,
    map:`Unity’s index-versus-stable-id save risk is the save-side twin of Godot’s load() cache risk: both are about a persistent progression record quietly pointing at the wrong data after something else moved underneath it.` },
  note:`Neither engine has a built-in concept of “knowledge” as a resource, unlike an inventory or a stat, so the discipline is entirely on the implementer: track facts by a stable id, never an index or a shared cached instance, and decide explicitly where that state is surfaced back to the player.` });
INTERVIEW('knowledge-as-progression',{
  junior:[
    { q:`What does it mean for a game’s progression to be “held in what the player knows”?`,
      a:`Instead of the save file recording stronger stats or more items, it records which facts or rules the player has come to understand, and the game becomes more playable because of that understanding alone, with no numeric buff involved. Outer Wilds is the clearest example: every loop resets all your tools and abilities, and only your knowledge of the solar system persists.`,
      follow:`What would Outer Wilds lose if it also gave the player a permanent stat boost each loop?`,
      red:`Describes Outer Wilds as having “no progression,” rather than identifying knowledge as the progression.` },
    { q:`Why is a spoiler uniquely destructive to a knowledge-based game compared with a stat-based one?`,
      a:`In a stat-based game, knowing a number in advance barely changes the experience of earning it. In a knowledge-based game, the entire reward is the moment of realisation, so hearing the answer in advance can permanently remove the one thing the game had to offer for that puzzle or mystery, with nothing else standing in for it.`,
      follow:`What would you tell a marketing team about trailers for a game like this?`,
      red:`Treats spoiler sensitivity as a generic concern equally true of every game genre.` },
    { q:`Give an example of a “gate that is understanding, not a lock.”`,
      a:`A door in Tunic that only makes sense to open once the player has decoded a symbol from the in-game manual, rather than a door that opens with a found key item. The difference is that no amount of searching the environment for an object will pass it; only comprehension will.`,
      follow:`How would a player know such a gate exists at all, before they have the knowledge to pass it?`,
      red:`Cannot describe a concrete example, or describes a standard locked door with a hidden key as if it were a knowledge gate.` }
  ],
  mid:[
    { q:`A playtester is stuck on a knowledge gate. How do you tell whether the fact was never delivered, or delivered but not understood?`,
      a:`Ask them directly what they have tried and what they believe the goal is; “I don’t know where to even look” points at a missing or unreachable delivery point, while “I found that thing but don’t see how it helps” points at a genuine, working comprehension gap that may just need time. Only the first case is a design bug you should fix immediately.`,
      follow:`Several playtesters get stuck the same way. Does that change your read?`,
      red:`Treats every stuck player as evidence the puzzle is too hard, without distinguishing the two causes.` },
    { q:`How do you decide how much note-taking to demand of the player in a knowledge-progression design?`,
      a:`Weigh the total number of interdependent facts against realistic human memory, and either provide an in-game tool (a journal, an annotated map) or keep the tracked fact count small enough to hold in mind. Demanding real pen-and-paper note-taking is a valid, deliberate choice for some games, but it must be a choice, not an accident of scope creep.`,
      follow:`Your fact count has grown past what you originally scoped. What are your options short of cutting content?`,
      red:`Assumes players will take notes without the game ever suggesting or supporting it.` },
    { q:`Why is replay value structurally different for a knowledge-progression game, and how do you plan around it?`,
      a:`The core reward, the first-time realisation, cannot recur on a second playthrough, since the player already knows the answer. Planning around it means being honest about what a replay or new-game-plus mode can offer (speed, a different lens, nothing at all) rather than bolting one on because every other game in the genre has one.`,
      follow:`What would a legitimate reason to replay a knowledge-based game look like, if not rediscovering the same facts?`,
      red:`Adds a new-game-plus mode without identifying any actual value it provides once the knowledge is already known.` }
  ],
  senior:[
    { q:`You are advising a team building a knowledge-progression game for a platform and marketing pipeline that assumes stat-based screenshots and trailers (gear, levels, unlockables). How do you reconcile the two?`,
      a:`Push marketing towards selling the fantasy of discovery and the setting itself, rather than progression artefacts the game does not have, and work with them explicitly to avoid trailer moments that would spoil the specific facts the design depends on. This is a genuine cross-discipline risk, not just a design footnote, since a single ill-considered marketing beat can remove the entire value of a purchase for a viewer.`,
      follow:`A publisher insists on a progress bar or achievement list for storefront requirements. How do you satisfy that without undermining the design?`,
      red:`Leaves marketing to reverse-engineer the game’s structure on their own and is surprised when a trailer spoils a major reveal.` },
    { q:`How do you review a comprehension gate for fairness, the way you would review a numeric difficulty curve?`,
      a:`Trace every gate to its source fact and confirm a player who found only that source, with no outside help, could plausibly reconnect it to the gate later; then separately estimate how catastrophic a spoiler of that specific fact would be. Treat a gate that fails the first check as an obscurity bug and a gate that fails the second as a marketing and community-management risk, since the two failures need different owners to fix.`,
      follow:`You find a gate that passes the first check but is an unusually severe spoiler risk. What is the actual design lever, since you cannot make the fact itself less spoilable?`,
      red:`Reviews comprehension gates purely for difficulty, with no separate pass for spoiler severity at all.` }
  ] });
DIAGRAM('knowledge-as-progression', { kind:'matrix', title:'What the gate is, and what proves you passed it', rows:['Stat or item progression','Knowledge progression'], cols:['What the gate is','What proves passage','Spoiler cost'],
  cells:[['A locked door or item','Holding the key or stat','Low, the grind repeats'],['A puzzle needing insight','Recognising the fact','Can erase the reward']] });

T('economy-modelling-and-balance',{ d:'systems', t:'Economy modelling and balance', tag:'Turn the economy into numbers you can run: anchors, rates, archetypes and a check against telemetry, before players find the hole.',
  what:`Economy modelling is writing an economy down as a small model you can run: each resource, its sources with rates, its sinks with costs, and a few player archetypes that earn and spend at different speeds. In Cookie Clicker each building has a cost and a cookies-per-second rate, so the whole early economy fits in a spreadsheet that answers how long the next building takes. You then ask the model questions: how many hours to the first big purchase, when does a currency pile up, what happens if a reward is doubled. It builds on economy-and-resources, which teaches the parts; this topic is the method for tuning them. Three ideas carry it. A balance anchor is one fixed number everything else is measured against, for example hours of play to earn a standard item. Time-to-target is the hours an archetype needs to reach a goal, and it is the number players feel. Inflation is what happens when sources outpace sinks, so the same reward buys less and less status. Machinations, the diagram tool that Joris Dormans devised and that he and Ernest Adams describe in their book, is one way to draw and run such a model. A spreadsheet is another. The model is a lens: it finds structural holes, it cannot tell you how the economy feels. Anchor, time-to-target and archetype are this site's working words for the method; Woodward's talk uses balance anchors, and the rest is common practice, not one author's framework.`,
  why:[`Economies fail slowly. A reward that is too high compounds. As an illustration, not a measured figure, a source 10 percent above plan can look fine in week one and outrun the sinks by month three, when it is expensive to fix.`,`Without an anchor, every price is a separate opinion. Designers tune items one by one and the catalogue drifts into contradictions.`,`Averages hide the players who matter. A casual and a heavy player can differ by an order of magnitude in time-to-target, and only archetypes show it.`,`In a live game the economy is shared with the business. A model lets design, economy and monetisation argue about numbers instead of feelings.`],
  think:{ q:[`What is the anchor? Which single number, such as hours to a standard item, do all other prices scale from?`,`For each resource: sources per hour, sinks per hour, net. Is net positive, zero or negative for each archetype?`,`Which archetype is the model blind to: the one who never spends, the one who trades, the one who quits at hour three?`,`Which of your logged flows come from separate data sources, and do they add up to the same money supply?`,`Which two big numbers are you subtracting? A small net between two large flows is where a five percent change flips the result.`,`What would inflation look like here, and which sink removes it?`],
    trade:[`A simple model is quick and finds structural errors. A detailed model tracks reality better and takes long enough to build that nobody updates it.`,`Tuning from the model is fast and consistent. Tuning from telemetry is true but late, and by then players have already built habits.`],
    traps:[`Modelling the average player. The average earns at a speed nobody actually plays at.`,`Tuning prices item by item with no anchor, then discovering the catalogue is inconsistent.`,`Assuming players will not turn game money into real money. Castronova's 2001 study of EverQuest found a real-money exchange rate and hourly value for the in-game currency, so a price you set is also a wage someone can compare with a job. Adding a sink after inflation has started, when the surplus is already in players' hands. Removing it later feels like a tax.`,`Trusting the model after launch without comparing it to what players did. The model is a hypothesis.`,`A model that assumes the player always spends optimally, when real players hoard, gamble and misjudge.`],
    good:[`The designer can say in one sentence what the anchor is and read any price against it.`,`The model predicts which resource will pile up, and telemetry later confirms the hour it did.`],
    bad:[`Prices were tuned by feel and only one person knows why.`,`The model and the live game disagree and nobody can say which is wrong.`] },
  how:[`Pick the anchor. Choose the number that matches the experience you want, such as a standard piece of gear in about 20 hours for a core player, and write it down.`,`List every resource with its sources, sinks and converters. Give each a rate per hour for one archetype.`,`Build the first model in a spreadsheet: one row per hour or per session, columns for income, sinks and balance. Read the net.`,`Define three or four archetypes (casual, core, grinder, and one who trades or hoards). Run each and record time-to-target.`,`Sweep one input at a time: double a reward, halve a sink, add a new item at the top. Record which outputs move and by how much. Inputs that move everything are the levers.`,`Move to a script once randomness or choices matter (drops, crafting outcomes, trading). Fix the random seed so two runs of the same numbers give the same answer.`,`Look for inflation: does the average balance per player grow faster than the price of the standard item? If so, add or strengthen a sink, or slow the source.`,`Copy the routine of live economies that publish their books. CCP's monthly EVE Online report tracks price indices (the February 2026 report has the mineral index down about 52 percent over a year), how fast ISK changes hands (velocity, falling), the value of production and destruction, and ISK sinks and faucets by source, and releases the raw data. Track the same handful every week or month. Reconcile totals from two sources before you trust either: CCP has said its sinks-and-faucets plot and its money-supply plot disagree for that reason. Ship with logging that matches the model's columns. After launch compare the archetypes to real players, fix the model where it is wrong, and change the game only after that.`],
  ai:{ yes:[`Turn a spec of sources, sinks and prices into a spreadsheet or script and run it across archetypes.`,`Sweep an input and report which outputs move.`,`Flag where a small net flow makes the result fragile.`,`Compare telemetry to the model and list the columns that diverge.`],
       no:[`Choose how scarce the game should feel. That is an experience decision.`,`Decide the anchor or the monetisation policy.`] },
  prompts:[{l:'Archetype run',p:`Here is our economy: resources, sources with rates per hour, sinks with costs, and our anchor ([ANCHOR], for example a standard item in about [N] hours for a core player): [SPEC]. Build a script that simulates casual, core and grinder archetypes, plus one hoarder. Report hours to the anchor for each, the hour each resource first exceeds three times the largest sink, and the input whose 10 percent change moves time-to-target most. List what the model assumes about player behaviour so we can check it.`},{l:'Inflation check',p:`Here is a table of average balances per player by week of play and the price of our standard item: [DATA]. Say whether the currency is inflating, how fast, and which sources and sinks explain it. Propose the smallest sink or source change, and say what evidence would show the change worked.`}],
  verify:[`Does the model reproduce a point you already have telemetry for, such as balance at day 7?`,`Is every price expressed against the anchor, so a reviewer can check it?`,`Has each archetype's time-to-target been run, not just the average?`,`Are the model and the logs compared from one data source, or do two sources give different totals? CCP reports that its EVE Online sinks-and-faucets plot and money-supply plot disagree because they use separate sources, which shows how a mismatch hides in plain sight.`],
  test:[`Change one source by 10 percent in the model. If time-to-target moves by more than 30 percent, treat the economy as fragile and look for a stabilising sink (30 percent is this site's rule of thumb, not a standard).`,`Give the model to a designer who did not write it and ask them to predict the effect of a change before running it. A wrong prediction shows what the model teaches.`,`After launch, plot real balances against the model per week. The first week they part is the finding. Then add up the sinks and faucets you log and compare the result with the money supply you log; if they differ, find out which source is wrong before tuning anything.`],
  rel:[['economy-and-resources','That topic teaches the parts of an economy; this one is how to tune them with numbers.'],['craft-gameplay-math','The curves and probabilities inside sources and sinks.'],['progression','Progression is paid for through the economy, so its pacing is time-to-target.'],['metrics-and-success','Telemetry is how the model is checked against players.']],
  facts:[{claim:`Matt Woodward's GDC 2017 talk on balancing the economy of Albion Online, a market-driven MMO, walks through balance anchors, core balance relationships and constraint-driven design using examples from that game.`,asOf:'2026-09-30',src:'https://gdcvault.com/play/1024070'},{claim:`Edward Castronova's 2023 GDC session, presented by Machinations.io, covers establishing currencies, distributing resources, trading, pricing and inflation, and using data and iterative testing to maintain an economy in live operation.`,asOf:'2026-09-30',src:'https://gdcvault.com/play/1028982'},{claim:`Ernest Adams and Joris Dormans, Game Mechanics: Advanced Game Design (New Riders, 2012), has chapters on the internal economy of a game and on Machinations, a tool for drawing, simulating and testing that economy.`,asOf:'2026-09-30',src:'https://www.peachpit.com/store/adamsgame-mechanics-p1-9780321820273'},{claim:`Edward Castronova's 2001 working paper Virtual Worlds: A First-Hand Account of Market and Society on the Cyberian Frontier estimated from EverQuest trades that Norrath's currency traded at about USD 0.0107 per unit and its nominal hourly wage was about USD 3.42, giving a GNP per capita between Russia and Bulgaria. It is a one-game estimate from 2001 (secondary reports of the figures); it does not show how to tune an economy.`,asOf:'2026-09-30',src:'https://www.cesifo.org/en/publications/2001/working-paper/virtual-worlds-first-hand-account-market-and-society-cyberian'},{claim:`CCP Games publishes a Monthly Economic Report for EVE Online. The February 2026 report (eveonline.com news) states that destruction value rose while mining and production value fell, that the velocity of ISK keeps decreasing, and that the mineral, ship and module price indices were down about 52, 21 and 13 percent over the past year. Raw data is downloadable. CCP has said in an EVE forum report thread (secondary to the article) that its sinks-and-faucets and money-supply plots differ because they use two data sources. This shows what a live economy measures and that public books get reconciled; it does not show that the reports improve balance.`,asOf:'2026-09-30',src:'https://www.eveonline.com/news/view/monthly-economic-report-february-2026'}] });
TECH('economy-modelling-and-balance',[
  {n:'Balance anchor', how:`Fix one number (hours to a standard item, or price of one unit of progress) and express every price and reward as a multiple of it.`, fit:`Any economy with more than a handful of prices.`, cost:`A wrong anchor is wrong everywhere. Revisit it when the audience shifts.`, alt:`Anchor on a session instead of an hour for short-session mobile games.`},
  {n:'Archetype simulation', how:`Run the same model for three or four player types that earn and spend at different speeds and compare time-to-target.`, fit:`Finding who a price wall or a surplus hits.`, cost:`Archetypes are guesses until telemetry replaces them.`, alt:`A spreadsheet with one column per archetype.`},
  {n:'Input sweep', how:`Change one rate or price at a time by a fixed percentage and record how far each output moves.`, fit:`Learning which numbers are levers and which are safe.`, cost:`Misses interactions between inputs changed together.`, alt:`A random sweep of several inputs at once in a script.`},
  {n:'Model against telemetry', how:`Log balances and purchases in the same columns as the model, then plot both per week.`, fit:`Any live economy.`, cost:`Needs logging built before launch.`, alt:`Sample a few hundred accounts for a first read.`}
]);
ENGINE('economy-modelling-and-balance',{
  godot:{ term:`The model is a headless script. It runs the same rates for each archetype and prints hours to the anchor, so a balance change becomes a number you can read before anyone opens the game.`,
    api:['extends SceneTree','godot --headless --script','Dictionary iteration','range()','INF','String formatting with %','SceneTree.quit()'],
    snippet:`# godot --headless --script res://tools/econ_sim.gd
extends SceneTree

const TARGET := 5000.0          # price of the anchor item
const SINK_PER_HOUR := 300.0    # repairs, consumables

func hours_to_target(income: float, max_hours: int = 9600) -> float:
\tvar gold := 0.0
\tfor h in range(1, max_hours + 1):
\t\tgold += income - SINK_PER_HOUR
\t\tif gold >= TARGET:
\t\t\treturn float(h)
\treturn INF

func _init() -> void:
\tvar archetypes := {"casual": 320.0, "core": 450.0, "grinder": 700.0}
\tfor who in archetypes:
\t\tprint("%s: %.0f h" % [who, hours_to_target(archetypes[who])])
\tquit()`,
    pitfall:`Tuning inside a running scene and eyeballing the result. A scene is affected by frame rate, input and whichever save was loaded, so two runs of the same numbers disagree. Keep the model in a headless script with no scene, so the same inputs always give the same output and it can run in CI.`,
    map:`A Godot headless SceneTree script is a Unity editor menu method or an EditMode test that runs the same pure function.` },
  unity:{ term:`The model is a plain static function with no scene dependence, called from a context menu or a test, so a balance question is answered in the console without building a level.`,
    api:['[ContextMenu]','Debug.Log()','value tuples and deconstruction','float.PositiveInfinity','string interpolation with format specifiers','EditMode test with NUnit'],
    snippet:`using UnityEngine;

public class EconSim : MonoBehaviour {
    const float Target = 5000f, SinkPerHour = 300f;
    static readonly (string who, float income)[] Archetypes =
        { ("casual", 320f), ("core", 450f), ("grinder", 700f) };

    static float HoursToTarget(float income, int maxHours = 9600) {
        float gold = 0f;
        for (int h = 1; h <= maxHours; h++) {
            gold += income - SinkPerHour;
            if (gold >= Target) return h;
        }
        return float.PositiveInfinity;
    }

    [ContextMenu("Run")]
    void Run() {
        foreach (var (who, income) in Archetypes)
            Debug.Log($"{who}: {HoursToTarget(income):F0} h");
    }
}`,
    pitfall:`Keeping the model's numbers in a separate constant block from the ones the game reads. The two drift, the model says 20 hours and the shipped build says 30, and nobody notices until players do. Put the inputs in one asset or data file that both the model and the game load.`,
    map:`A Unity ContextMenu on a component is a Godot @tool button or a headless SceneTree script, and the pure function is the same in both.` },
  note:`Both snippets show the same lesson in their output: casual nets 20 an hour after the sink, the grinder 400, so time-to-target spans 250 hours to 13. A small change in the sink moves the casual result far more than the grinder's. That is what a net of two big numbers looks like, and the model shows it before players do.` });
INTERVIEW('economy-modelling-and-balance',{
  junior:[
    { q:`What is inflation in a game economy?`,
      a:`Sources outpace sinks, so players hold more and more currency and the same price feels cheaper. Rewards lose their status, and designers respond by raising prices, which then punishes new players. The fix is a sink or a slower source, not just new prices.`,
      follow:`Name a sink that removes currency without feeling like a tax.`,
      red:`Says inflation is when prices go up and does not connect it to sources and sinks.` },
    { q:`Why simulate an economy in a spreadsheet before building it?`,
      a:`Because arithmetic errors are cheap to find on paper and expensive to find in play. A spreadsheet answers how many hours to a target, and when a resource piles up, for each type of player, in minutes.`,
      follow:`What can a spreadsheet not tell you?`,
      red:`Believes a spreadsheet proves the economy is fun.` }
  ],
  mid:[
    { q:`What is a balance anchor and why use one?`,
      a:`One number that everything else is measured against, such as hours of play to a standard item. Every price and reward becomes a multiple of it, so a reviewer can check the catalogue is consistent and a change to the anchor scales the whole thing on purpose.`,
      follow:`How do you choose the anchor for a game with no shipped data?`,
      red:`Tunes each item on its own with no shared reference.` },
    { q:`Why run archetypes instead of an average player?`,
      a:`The average earns at a speed no one actually plays. A casual and a heavy player can differ by an order of magnitude in time-to-target, and the price wall or the surplus hits one of them. Archetypes show who breaks.`,
      follow:`How do you replace guessed archetypes with real ones after launch?`,
      red:`Says a single average player is enough for balancing.` },
    { q:`Your model predicted a surplus at hour 30 and telemetry shows it at hour 18. What do you do?`,
      a:`Find which column parts first: source rate, sink rate or player behaviour. Correct the model, not the game, until it reproduces the data. Then decide whether the game should change. Changing the game to fit a wrong model just moves the error.`,
      follow:`What if the divergence is a behaviour you did not imagine, such as trading?`,
      red:`Changes prices immediately without finding why the model was wrong.` }
  ],
  senior:[
    { q:`A live event doubled a reward for a week. How do you judge its effect on the economy?`,
      a:`Model it as an extra source: how much extra currency entered, for which archetypes, against which sinks. Then check telemetry for balances a few weeks later, because the currency is still in players' hands. If it is not sunk, the event is permanent inflation. Plan the sink before the event.`,
      follow:`What do you do if the event was already run without a sink?`,
      red:`Judges an event only by its week of revenue and engagement.` },
    { q:`Design, economy and monetisation disagree about a price. How does the model help and where does it stop?`,
      a:`It gives all three the same numbers: time-to-target for each archetype under each proposal, and what each does to surplus. It stops at what players will accept and how the economy feels. Those go to playtests and the product owner. The model narrows the argument, not ends it.`,
      follow:`What would you put on the table besides the model?`,
      red:`Treats the model output as the decision.` },
    { q:`How do you keep a model alive across a two-year live game?`,
      a:`Keep the inputs in one file the game also reads, log with the model's columns, and compare per season. Any new resource or sink gets added to the model in the same change that ships it. A model that lags the game becomes a story nobody trusts.`,
      follow:`Who owns it when the designer who built it leaves?`,
      red:`Builds the model once at launch and treats it as done.` }
  ] });

WORKED('economy-modelling-and-balance', {
  kind:'table',
  id:'ten-day-soft-currency-economy',
  t:'A ten-day economy for one currency',
  intro:'A small mobile-style game with one soft currency, followed for ten days. Every row follows one rule: the balance at the end of the day is the balance from the day before, plus what came in, minus what went out. The method is spreadsheets for balance, as taught in Ian Schreiber and Brenda Romero’s "Game Balance" (CRC Press, 2021). Upgrade n costs 250 coins x 1.5 to the power of the upgrades already bought, so the first costs 250 and the fifth 1266.',
  note:'Illustrative numbers, not from a shipped game: the shape is the lesson.',
  columns:[{h:'Day'}, {h:'Minutes played', unit:'min'}, {h:'Income from play', unit:'coins'}, {h:'Income from daily reward', unit:'coins'}, {h:'Spend on upgrades', unit:'coins'}, {h:'Spend on cosmetics', unit:'coins'}, {h:'Balance at end of day', unit:'coins'}, {h:'Cost of the next upgrade', unit:'coins'}, {h:'The next upgrade in minutes of play', unit:'min'}, {h:'Days of play to afford the next upgrade', unit:'days'}],
  rows:[
    [1, 12, 180, 100, 0, 0, 280, 250, 16.7, 0],
    [2, 20, 300, 100, 250, 0, 430, 375, 25.0, 0],
    [3, 15, 225, 100, 0, 150, 605, 375, 25.0, 0],
    [4, 25, 375, 100, 375, 0, 705, 563, 37.5, 0],
    [5, 10, 150, 100, 0, 0, 955, 563, 37.5, 0],
    [6, 30, 450, 100, 563, 0, 942, 844, 56.3, 0],
    [7, 18, 270, 100, 0, 200, 1112, 844, 56.3, 0],
    [8, 22, 330, 100, 844, 0, 698, 1266, 84.4, 2],
    [9, 14, 210, 100, 0, 100, 908, 1266, 84.4, 2],
    [10, 28, 420, 100, 0, 0, 1428, 1266, 84.4, 0]
  ],
  formulas:[
    {col:'Income from play', f:'Minutes played x 15 coins a minute (in a sheet: =B2*15).'},
    {col:'Balance at end of day', f:'Previous balance + play income + daily reward - upgrades - cosmetics (in a sheet: =G1+C2+D2-E2-F2, with day 1 starting from 0).'},
    {col:'Cost of the next upgrade', f:'250 x 1.5^(upgrades bought so far), rounded up (in a sheet: =ROUNDUP(250*1.5^n, 0)).'},
    {col:'The next upgrade in minutes of play', f:'Cost of the next upgrade / 15 coins a minute (in a sheet: =H2/15). The daily reward is left out, so the column shows what the same upgrade asks of play time.'},
    {col:'Days of play to afford the next upgrade', f:'The next upgrade costs 250 x 1.5^(upgrades bought so far), rounded. Then =MAX(0, ROUNDUP((next cost - balance) / (play income + daily reward), 0)): the shortfall divided by that day’s income. 0 means the player can already afford it.'}
  ],
  try:['Raise the daily reward from 100 to 150 coins, 50 percent more. What happens to the balance on day 10, and to the days-to-afford column on day 8?', 'Double the upgrade cost from day 6 (the day 6 upgrade becomes 1126, the day 8 one 1688). Can the player still buy both? What do they do on day 8, and what would they feel?', 'Inflation starts when income outruns the sinks, so the same coins buy less. Which column shows the surplus building up, which column shows what the same upgrade costs in play time, and what sink would you add so the day 10 balance is nearer the cost of the next upgrade?', 'Explain in your own words why the balance climbs on most days but dips on days 6 and 8. What does the shape say about when a player decides to buy?', 'The player skips cosmetics for all ten days. Which columns change, and does it change when they can afford the next upgrade?'],
  file:'ten-day-soft-currency-economy.csv'
});

DIAGRAM('economy-modelling-and-balance', { kind:'economy', title:'Gold in a small economy', nodes:[
  { id:'q', t:'Quests', type:'source', row:0 }, { id:'d', t:'Enemy drops', type:'source', row:0 },
  { id:'g', t:'Gold', type:'pool', row:1 },
  { id:'c', t:'Crafting', type:'converter', row:2 }, { id:'r', t:'Repairs', type:'sink', row:2 }, { id:'s', t:'Shop', type:'sink', row:2 }],
  edges:[['q','g','per quest'],['d','g','per kill'],['g','c','spend'],['g','r','per death'],['g','s','buy']] });

T('balance-methods',{ d:'systems', t:'Balance methods: curves, matrices and simulation', tag:'Balanced means every option you ship is worth choosing, not that every option is equal. Fit a curve, solve the matrix, simulate, then let the telemetry overrule you.',
  what:`Balance is the work of making the choices in a game viable: each option has a situation where picking it is right, and none makes the others pointless. It is not equal power. Schreiber and Romero’s "Game Balance" (CRC Press, 2021) splits the toolbox by how options relate. Transitive options are ranked on one scale (a bigger sword beats a smaller one), so you balance them by pricing power: a cost curve says how much power each unit of cost buys, and every item is checked against it. the vanilla test, a rule of thumb among Magic’s Limited players, is the classic check: strip the abilities off a creature and ask whether its stats alone justify its cost. Intransitive options beat each other in a cycle (rock, paper, scissors), so no single number ranks them; you balance them with a payoff matrix, and the target is a mix of choices, not a tie. Spreadsheets handle both well until the options interact. Past that point you simulate: Monte Carlo runs of a fight, bots that play the game, or learned agents that play like people. Last comes live telemetry, which has its own traps. A win rate is a measurement taken on players who chose the option, at a skill level the matchmaker chose, in a sample with a margin of error. At 1,000 games a 50% win rate is only known to about plus or minus 3 points, and at 10,000 games to about plus or minus 1. Teams that run live games read these numbers by skill tier, in small patches, and write down what they will not trust. Two worked tables below let you rebuild a cost curve and solve a three-option matrix by hand. The sources and sinks of an economy are a separate subject, taught in economy-modelling-and-balance; this topic is about the power of the options themselves.`,
  why:[`Balance is where depth becomes real. A choice that is always wrong is not a choice, so an unbalanced game has fewer decisions than its rules list suggests.`,`A cost curve turns "does this feel strong" into a number you can argue about, review in a table and change in one place. Without one, every new item is judged against the last one printed, and the drift is called power creep.`,`Intransitive designs need a different tool. If you tune rock-paper-scissors to equal win rates against the average opponent you have not balanced it; you have hidden a cycle. A payoff matrix shows what a healthy pick rate looks like (the worked example below shows one where the right pick rate is 50% for a single option).`,`Telemetry is cheap in a live game and easy to misread. The same win rate means different things at the top 1% and at the median, for an option many people pick and for one a few specialists pick. Teams that balance on the loudest tier fix a game for a small share of players.`,`Simulation is how a small team gets a thousand playtests overnight, and how a large one checks a balance patch before it ships. It is also how a bad model gets confident: a bot that plays unlike people measures a game nobody plays.`],
  think:{ q:[`What does balanced mean for this game: every option picked equally, every option winning about half its games, or every option owning a situation where it is the best pick? Which of those can you actually measure?`,`Are these options ranked on one scale (transitive) or do they beat each other in cycles (intransitive)? A game usually has both, and each needs a different tool.`,`What is the cost curve: the rule that links cost to power, and where is it written down? If a card breaks it deliberately, what is the stated reason?`,`If I pay a cost for an ability, what is that ability worth in the currency of the curve, and did I measure it or guess it?`,`Which skill tier does this number come from, and how many games sit behind it? What is the margin of error on a 50% win rate at that sample size?`,`Do I want to change this option because the data says it is wrong, or because it is the loudest on the forums? What would the data have to show for me not to change it?`,`Is this a PvE or PvP game? In PvE I can allow an overpowered build as a reward. In PvP the same build is someone else’s losing match.`,`How big a step is this patch, and could I have made it half as big and seen the same signal?`],
    trade:[`A cost curve is simple, reviewable and fast, and it prices only what you can put on a common scale. Special abilities, synergies and tempo do not sit on it, so you estimate them and the estimate is the weak point.`,`Equal win rates are easy to read and the wrong target for asymmetric games. The aim is that each side has options and a counter, and win rate is only one view of that.`,`Simulation runs thousands of games for the cost of one playtest session and only answers questions the model can express. A bot that plays badly in a way people do not will find imbalances that are not there and miss the ones that are.`,`Balancing for the top of the ladder keeps the competitive game honest and can leave 99% of the players with a game tuned for someone else. Balancing for the median is kinder to most players and lets pro play collapse into one strategy. Riot publishes a framework that watches four tiers at once for this reason.`,`Small patches converge and keep the community arguing about each one. Large patches fix a problem in one step and often overshoot, so the next patch fixes the fix.`,`In single-player games you can balance with the loosest rules, because a broken build only harms its owner. Mega Crit said exactly this about Slay the Spire. In a live competitive game you cannot.`],
    traps:[`Reading a high win rate as "overpowered" without asking who picks it. If a hero is picked mostly by specialists who play only that hero, its win rate when picked is inflated by self-selection, and the same hero at a low pick rate may be fine for everyone else.`,`Reading a high pick rate as "overpowered". In a healthy intransitive game, one option can be picked 50% of the time at equilibrium. The worked matrix below does exactly this. At equilibrium every option scores the same on average (0 points), yet the win rates differ because the stakes do: at 25/50/25, scissors wins 50% of its games and rock and paper 25% each.`,`Comparing a 52% and a 50.5% win rate with no sample sizes. At 1,000 games the margin is about plus or minus 3 points, so the difference is noise. Across 160 options, even if every one is balanced, about 8 will look outside a 95% interval by chance alone.`,`Using the cost curve only for the first set. Over three releases the new items cluster just above the curve, because each designer picks the top of the tolerance, and the curve itself has moved without anyone changing it.`,`Fitting the curve to the items that already sold well. The curve describes your intent, not the market. Fit it to the lowest-numbered, plainest items (the vanilla ones) and price abilities on top.`,`Running a Monte Carlo on one bot and calling the result "balanced". The result is balanced for that bot, with that ordering of turns. Alternate who goes first, vary the bot’s skill, and see whether the ranking survives.`,`Moving two variables in one patch. If win rate rises and you changed a cost and a damage value, you do not know which one did it.`,`Not telling players. A silent nerf is read as a bug or a lie. Riot, Blizzard and Supercell all publish patch notes; the useful ones say what was changed, by how much and what the data showed.`,`Treating a balance dashboard as the answer. It lists the symptoms. Win rate at 56% says something is wrong. Whether it is the option, a combo, a map or a matchup comes from reading replays and playing.`],
    good:[`The cost curve is a one-page table with the formula, the baseline, the value of each keyword and the exceptions that are on purpose.`,`Every balance claim in a design review comes with a sample size and a skill tier.`,`Balance patches change one thing at a time, by a stated step, and the next patch’s notes say whether it worked.`,`There is a bot or a simulation that can run a candidate change overnight, and the team knows what its model leaves out.`],
    bad:[`The only balance data is the win rate of the whole player base, to one decimal place, with no sample size.`,`New items are judged against the most recent items, not against the curve.`,`The number one reason for a nerf is how loud the forum is.`,`Nobody can say which option is meant to be the weakest and why.`] },
  how:[`Write down what balanced means before you tune anything. Use three sentences: which options must be viable, in which situations, and for which skill tier. "Every character has a situation where they are the best pick, and wins between 48% and 52% of games in the middle tier" can be measured. "Feels fair" cannot.`,`Sort the options into transitive and intransitive. Anything that is simply more or less of one thing (damage, health, speed, cost to build) is transitive. Anything where the answer depends on the opponent’s choice (a counter system, a stance, a unit triangle) is intransitive.`,`For the transitive part, build a cost curve in a spreadsheet. Pick the plainest items, give them a baseline (cost 1 buys 3 points, each further cost buys 2), then add a column for what each ability or keyword is worth in points. Compute the surplus (value minus budget) for every item and sort by it. The worked table below is that sheet.`,`Price abilities by subtraction. Find two items that differ in one ability and whose cost difference you trust, then read the ability’s value from the gap. Do this for three or four keywords, and treat the values as estimates to be checked by play.`,`Run the vanilla test on everything new: remove the abilities and ask whether the stats alone would be playable at that cost. Among Magic Limited players the rule of thumb (a community heuristic, not a Wizards rule) is that a creature needs about twice its mana value in total stats, flattening at high costs, so test at every cost you ship. Do not confuse this power curve with Magic’s mana curve, which is the distribution of costs in one deck (how many 1-drops, 2-drops and so on): a deck needs cheap plays to act early, and a set can sit on the power curve while its best decks all crowd the low end.`,`For the intransitive part, write the payoff matrix. Put each option on a row and a column, fill each cell with the score for the row option against the column option (win is positive, loss negative, size by what is at stake), and solve for the mix at which no option does better than any other. For three options that is three equations, which you can do by hand. The worked example gives 25% rock, 50% paper, 25% scissors. If a game’s pick rates sit near its equilibrium, that is the sign of a healthy cycle.`,`Choose nerf or buff on purpose. A buff gives players something and raises the power ceiling, which feeds power creep; a nerf takes something from the players who chose that option and is felt as a punishment. Riot’s framework gives a rule: nerf when an option is overpowered in any tier group, buff only when it is underpowered in all of them. Prefer a buff for an option that is merely weak, and a nerf for one that is strong enough to crowd out the others.`,`Add simulation where options interact. Start with Monte Carlo of the fight or round: fix random seeds, alternate who moves first, run 10,000 or more games per matchup, and report the win rate with its margin of error. Standard error is the square root of p times (1 minus p) divided by n, and the 95% margin is about twice that.`,`When the game is too complex to script, build a bot, or several bots with different skill, and run the full game. The research on automated playtesting offers two useful moves: active learning to choose which parameter settings to test next, and learned agents that imitate recorded players when search-based bots play unlike people.`,`Read the two metrics Slay the Spire’s team called most useful: how often a card is picked when offered (too low and it is effectively not in the game) and how often it appears in winning decks (too high and it is overpowered). Supercell’s Clash Royale team says it pairs card use rate and win rate with playtesting, so the numbers start a conversation and never end one.`,`Decide the telemetry before launch. For each option log: picks, wins, wins when picked, games played, and the player’s skill rating, so that you can slice by tier. Add the match-up (for asymmetric games), and the build or deck for games with builds.`,`Read the data in this order: sample size first, then skill tier, then pick rate, then win rate when picked, then win rate by tier. Change the order and you will start explaining noise.`,`Ship balance changes in small steps. Change one variable, by an amount you can state (for example 10% of the number, not 50%), and write what you expect to see. Check it at the next data point before changing the same option again.`,`Write patch notes that say what changed, by how much and why. Name the data you used. This is the cheapest way to stop a balance change from being read as arbitrary.`,`Treat PvE and PvP differently on purpose. In PvE, allow a few strong builds as player rewards and balance the encounters. In PvP, the ceiling matters, because every overpowered option makes someone else’s game worse.`,`For asymmetric games, balance the match-ups, not the sides. StarCraft II’s team looked at the race-versus-race win rates adjusted for matchmaking and player skill; Overwatch’s role queue fixes team shape which also lets each role be rated on its own (separate skill ratings per role). It launched as 2-2-2 in 2019 and is 1-2-2 in the 5v5 Overwatch 2.`],
  ai:{ yes:[`Build the cost-curve spreadsheet from your item list, compute the surplus for every row and sort by it.`,`Solve a payoff matrix for the equilibrium mix and check the answer by computing every option’s expected payoff against it.`,`Write the Monte Carlo harness for your fight rules: seeded, alternating who starts, with a confidence interval in the report.`,`Compute how many games you need to detect a given difference in win rates at a stated confidence, and what the margin of error is at the sample size you have.`,`Draft patch notes from a table of changes, in your voice, with the reason for each change.`,`Review a balance log for confounds: self-selection, skill tier, patch boundaries, mirror matches.`],
       no:[`Decide what balanced means for your game. That is a design stance.`,`Say whether a mechanic is fun after the numbers are fixed. Only a player can.`,`Tell you the value of an ability. Any number it gives is a guess for you to check by play.`,`Replace playtests. A bot finds what the model can express and nothing else.`,`Pick the skill tier you serve. That is a product decision about whom the game is for.`] },
  prompts:[{l:'Fit a cost curve',p:`Here are my [N] items with cost and stats: [PASTE TABLE]. First, pick the items with no abilities and fit a simple curve of total stat points against cost (give the formula and the baseline). Then, for each item with abilities, list the value in points the ability would need to have for the item to sit on the curve. Show me the ability values side by side, flag any that look implausibly high or low compared with similar abilities, and list the five items furthest above and below the curve. Show the arithmetic in a table I can paste into a spreadsheet.`},
    {l:'Solve my matchup matrix',p:`This is a zero-sum payoff matrix for the row player, with options [LIST]: [PASTE MATRIX]. Find the mixed strategy at which no option does better than another, show the equations you solved, and check it by computing each option’s expected payoff against that mix. Tell me which option’s equilibrium share is highest or lowest and why. Then tell me what my pick-rate data [PASTE] says about how far the live game is from equilibrium, and what that does and does not prove.`},
    {l:'Audit a win-rate claim',p:`I want to nerf [OPTION]. The data: win rate [X]% across [N] games in [TIER]; pick rate [Y]%; win rate when picked by players with fewer than [K] games on it is [Z]%. Tell me the margin of error on each figure, which of them could be explained by self-selection or matchmaking, which skill tiers I should check before acting, and what I would expect to see in the next patch if I make a change of [SIZE]. Say plainly if the data does not support a change.`}],
  verify:[`Does the cost curve have a written baseline, a value for every keyword and a list of deliberate exceptions, so that a new designer can fit a new item without asking?`,`Does the payoff matrix solve to a mix whose every option has the same expected payoff against it? Check each row by hand.`,`Does every win rate quoted come with a sample size and a skill tier, and is the difference being acted on larger than the margin of error?`,`Does the simulation alternate who moves first, use seeded random numbers and report an interval, so that two runs of the same seed give the same answer?`,`Does the bot’s ranking of options survive a change of bot skill? If a weaker bot reverses the ranking, the finding depends on the bot.`,`Does the patch change one variable and state the expected movement, so that the next data can show it failing?`],
  test:[`Take a cost curve and break it on purpose: add one item 3 points above the curve and watch what players pick over the next two weeks (in a prototype or with a simulated field). This shows how far above the curve your players’ attention can tell the difference.`,`Run the same duel with your Monte Carlo at 100, 1,000 and 10,000 games, for the same seed set, and plot the win rate with its interval. You learn how many games your questions need.`,`Pick one option that your telemetry says is strong. Re-cut the win rate by skill tier, by pick count (first game with it versus the fiftieth), and by patch. If the strength only appears in one slice, you have found a self-selection or tier effect, not an overpowered option.`,`Playtest the intransitive set with humans for 20 matches each, record the picks, and compare them with the equilibrium mix from the matrix. A large gap means people are not playing the game your matrix describes, or the matrix scores the wrong thing.`,`Ship a small balance patch of one variable to a limited group or a test server and compare the next window of data with the expected movement you wrote down.`],
  rel:[['economy-modelling-and-balance','That topic prices sources and sinks of a currency. This one prices the power of the options themselves, and the two meet in what an item costs.'],['builds-and-loadouts','Builds are where balance fails by convergence: one build dominating is a balance problem and a constraints problem at once.'],['difficulty','PvE balance is difficulty tuning by another name: the encounter is balanced against what builds can do, and the player’s skill is the other variable.'],['depth-vs-complexity','Balance is how depth survives: a game with many options and one right one has the complexity and none of the depth.'],['metrics-and-success','Pick rate, win rate and win rate when picked are metrics with attribution and sample-size problems, which that topic teaches.'],['live-design-seasons-and-data','A live game rebalances on a calendar and reads its data by cohort and tier; this topic gives the methods that cadence runs on.']] });

TECH('balance-methods', [
  {n:'Cost curve with a vanilla baseline', how:`Take items with no abilities, fit total stat points against cost (a line such as 2 x cost + 1 is a common starting shape), then price each ability by comparing two items that differ in one ability. Surplus is value minus budget, and a tolerance band (plus or minus 1) says what is on the curve.`, fit:`Transitive systems with a common unit: cards, units, gear, upgrades, abilities that can be priced in the same points.`, cost:`Ability values are estimates that drift. Synergies, tempo and board position are not on the curve, and the curve gets used less carefully each release.`, alt:`Judging each item against the most recent ones, which is quick and invites power creep. Or a playtested tier list, which measures real strength and arrives late.`},
  {n:'Payoff matrix and mixed-strategy solve', how:`Score every option against every other in a zero-sum matrix, then solve for the mix in which no pure choice does better than the others. For a skew-symmetric 3 x 3 it is three linear equations; larger matrices use linear programming.`, fit:`Counter systems, unit triangles, stance and move sets, and any cycle where you want to know a healthy pick rate.`, cost:`The scores are your model of what winning a matchup is worth. If they are wrong the equilibrium is wrong, and it assumes a perfect field that real players are not.`, alt:`Tune to equal win rates against the average opponent, which hides the cycle, or tune by feel until nobody complains.`},
  {n:'Seeded Monte Carlo of fights', how:`Fix the rules in code, seed the random number generator, alternate who starts, run 10,000+ games per matchup and report win rate with a 95% interval of about plus or minus 2 x sqrt(p(1-p)/n).`, fit:`Combat and encounter maths, loot tables and drop rates, card draws, any rule with randomness where you can write the rule as a function.`, cost:`Only the rules you encoded exist in the model. A model of the damage formula tells you nothing about positioning, timing or player behaviour.`, alt:`Playtesting with humans, which is richer and holds a few hundred games where a simulation holds millions.`},
  {n:'Automated playtesting with active learning', how:`Treat each parameter setting as an input and a playtest as a measurement; an acquisition function (for example upper confidence bound) picks the next setting to test. In one study on a shoot-em-up it needed about 70 samples to get the largest gain, a level random sampling never reached.`, fit:`Continuous parameters with a clear target metric: enemy speed, bullet rate, drop chance, difficulty knobs.`, cost:`You need a measurable objective and a pool of testers or a good bot. The method tunes toward the objective you wrote, including a bad one.`, alt:`Grid or random sweeps, which are simple and waste samples, or hand tuning, which wastes designer time.`},
  {n:'Learned human-like agents', how:`Train an agent on recorded player moves (supervised learning), then run it on new content to predict metrics such as level difficulty. A paper from a casual-puzzle studio reports this was more accurate than Monte Carlo tree search and cut the iteration from days to minutes.`, fit:`Content-heavy games with plentiful player logs, such as level-based puzzle games, where difficulty per level is the question.`, cost:`Needs logs, training and a pipeline. The agent plays like the players it saw, so it is blind to new strategies.`, alt:`Search-based bots such as MCTS, which need no data and play less like people.`},
  {n:'Telemetry bands by skill tier', how:`Define thresholds for each tier (average, skilled, elite, pro), watch win rate, pick rate and ban rate in each, and call an option out of balance only when it crosses a threshold in a tier where that metric has enough data. Riot’s published framework does this.`, fit:`Live competitive games with a ranked ladder and enough games to slice.`, cost:`Small tiers have noisy win rates, so the thresholds lean on pick and ban rate there, which are easier to misread.`, alt:`One global win rate, which is the median player’s experience and says nothing about the top or the learning curve.`},
  {n:'Adjusted win rate (matchmaker removed)', how:`Correct the raw win rate for the skill gap the matchmaker allowed between sides, then compare. Blizzard describes this for StarCraft II races: the aim is the win rate you would see with equally skilled players.`, fit:`Asymmetric competitive games with skill-based matchmaking.`, cost:`Needs a skill rating you trust and a model of how skill converts to win probability.`, alt:`Raw win rate, which matchmaking pushes toward 50% whether the sides are balanced or not.`},
  {n:'Pick rate offered versus presence in winning decks', how:`Log every choice offered and every pick, then compare how often an option is picked when offered with how often it appears in winning runs. Slay the Spire’s team used exactly these two, sliced by skill, character and progression.`, fit:`Games where the player chooses from offers: card rewards, upgrades, loadouts, draft picks.`, cost:`Picked-when-offered is confounded by what else was offered and by player skill, so read it by cohort and with sample sizes.`, alt:`Win rate alone, which cannot tell a strong option from one a few experts pick.`},
  {n:'Nerf or buff as a decision', how:`State the target tier and the reason before choosing the direction. Buff what is weak and unused, nerf what is strong enough to crowd others out, and apply Riot’s asymmetry (nerf when over in any tier group, buff only when under in all).`, fit:`Live games with a patch cadence.`, cost:`Buffs raise the ceiling over time; nerfs cost goodwill and need good communication.`, alt:`Always nerfing the top, which keeps the power level flat and the community angry, or always buffing the bottom, which is popular and drifts upward.`},
  {n:'Small steps and a stated expectation', how:`Change one variable by a small, stated amount (such as 5 to 10% of the value), write what the next data should show, and check before touching it again.`, fit:`Any live game. Cheapest where the patch cycle is short.`, cost:`Slow when an option is badly broken, and each step needs a communication.`, alt:`One large correction, which fixes it fast and often overshoots into the opposite problem.`},
  {n:'Metagame autobalancing', how:`Describe the target as a graph of who should beat whom, then use simulation-based optimisation to tune parameters toward it. A 2020 paper demonstrated it on rock-paper-scissors variants and an asymmetric fighting game.`, fit:`Games where the goal is a designed relationship between options, not equal win rates.`, cost:`Research-grade, and it needs a simulator that plays well enough for the graph to mean something.`, alt:`Hand-tuned matchup tables with Monte Carlo checks.`}
]);

ENGINE('balance-methods',{
  godot:{ term:`A balance question is a function with a seed: two stat blocks and a run count in, a win rate out. Keep it free of nodes and scenes so a headless script can call it ten thousand times.`,
    api:['RandomNumberGenerator.seed','RandomNumberGenerator.randf()','Dictionary of stats (or a Resource with @export values)','godot --headless --script','FileAccess.open() to write the CSV','Array.append()'],
    snippet:`func win_rate(a: Dictionary, b: Dictionary, runs: int, seed_value: int) -> float:
\tvar rng := RandomNumberGenerator.new()
\trng.seed = seed_value
\tvar wins := 0
\tfor i in runs:
\t\tvar hp := [a.hp, b.hp]
\t\tvar turn := i % 2                  # alternate who strikes first
\t\tvar side := [a, b]
\t\twhile hp[0] > 0.0 and hp[1] > 0.0:
\t\t\tif rng.randf() < side[turn].acc:
\t\t\t\thp[1 - turn] -= side[turn].dmg
\t\t\tturn = 1 - turn
\t\tif hp[0] > 0.0: wins += 1
\treturn float(wins) / runs`,
    pitfall:`Letting side A always strike first. In a duel where both sides have equal stats, the first striker wins more, so the table says A is stronger when the loop is. Alternate the first move (the snippet does) and report the win rate with its margin of about 2 x sqrt(p x (1 - p) / runs), or you will chase a difference that is noise.`,
    map:`This is the same function a Unity batch-mode run calls. Godot’s RandomNumberGenerator with a seed is repeatable in the same way as System.Random(seed) in C# (the two engines give different sequences for the same seed).` },
  unity:{ term:`Keep the rules in a plain C# method with no MonoBehaviour, seeded, over a Stats struct of three floats (hp, dmg, acc), so an Editor menu item or a batch-mode call can sweep every matchup and write a table.`,
    api:['System.Random(seed)','ScriptableObject for stat blocks','-batchmode -executeMethod','[MenuItem] for an Editor sweep','System.IO.File.WriteAllText for the CSV','Mathf.Sqrt'],
    snippet:`public static float WinRate(Stats a, Stats b, int runs, int seed) {
    var rng = new System.Random(seed);
    int wins = 0;
    for (int i = 0; i < runs; i++) {
        float ha = a.hp, hb = b.hp;
        bool aTurn = i % 2 == 0;           // alternate who strikes first
        while (ha > 0 && hb > 0) {
            if (aTurn) { if (rng.NextDouble() < a.acc) hb -= a.dmg; }
            else       { if (rng.NextDouble() < b.acc) ha -= b.dmg; }
            aTurn = !aTurn;
        }
        if (ha > 0) wins++;
    }
    return (float)wins / runs;
}`,
    pitfall:`Calling UnityEngine.Random inside the sweep. It is a shared global state, so any other script that calls it changes the sequence, and two runs of the same seed disagree. Use an owned System.Random, and report the interval, not just the mean.`,
    map:`A Godot Dictionary of stats and a Unity struct or ScriptableObject play the same part: the numbers live in data, the function reads them, and a designer edits the data.` },
  note:`Balance code is a pure function plus a table. Keep the rules out of scenes, seed everything, and write the results to a CSV the designer can open. A sweep you can run overnight is worth more than a perfect model you cannot.` });

INTERVIEW('balance-methods',{
  junior:[
    { q:`What does it mean for a game to be balanced? Is it the same as every option being equally strong?`,
      a:`No. Balanced means every option that ships is a viable choice, each with a situation where it is the right pick. Equal power is one way to get there and often the dullest. Mention that in asymmetric games the target is that no option is dominated and no option makes the others pointless, and give an example such as a counter cycle.`,
      follow:`Give me a game where options are deliberately unequal and still balanced.`,
      red:`Says balanced means every character has a 50% win rate, with no distinction between that and viability.` },
    { q:`What is a cost curve, and why would you use one?`,
      a:`A rule that links what an item costs to the power it gives. Fit it on the plainest items (vanilla creatures, plain weapons), then price abilities on top. Every new item is checked against the curve, so the question is "is it on the curve, and if not why", not "does it feel strong". Mention that the curve works for transitive options.`,
      follow:`How would you price a new ability that has no equivalent in your game?`,
      red:`Describes a cost curve as a list of numbers copied from another game with no fit to this one.` },
    { q:`Rock-paper-scissors is balanced. Why can you not use a cost curve on it?`,
      a:`Because the options are intransitive: each beats one and loses to another, so there is no single scale to rank them. You use a payoff matrix and look for the mix at which no option does better than another. With equal stakes it is a third each, and with unequal stakes it moves.`,
      follow:`If scissors beat paper for double the points, what happens to the right mix?`,
      red:`Proposes adding numbers (power, cost) to rock, paper and scissors and tuning them to equal strength.` }
  ],
  mid:[
    { q:`A character has a 55% win rate and you have been asked to nerf it. What do you check first?`,
      a:`Sample size and margin of error, then the skill tier, then who picks it. At 1,000 games the margin is about plus or minus 3 points, so 55% is a real gap from 50% (about 3.2 standard errors), though at 300 games the margin is about 5.7 points and it could be noise. Either way, check win rate when picked by newcomers versus specialists (self-selection), the pick rate, and whether the win rate is the same across tiers. Only then decide whether the option, a matchup or a combo is the cause.`,
      follow:`The win rate is 55% for specialists and 49% for everyone else. What is the change?`,
      red:`Nerfs it straight away because 55% is above 50%, without asking about the sample or who plays it.` },
    { q:`How would you build a simulation to balance fights in your game? What are the first traps?`,
      a:`Write the rules as a pure function, seed the generator, alternate who moves first, and run thousands of games per matchup with a margin of error. Traps: first-mover advantage, a bot that plays unlike people, tuning to one bot, and rules left out of the model. Check that the ranking survives a change of bot skill and compare against a few human sessions.`,
      follow:`The sim says one unit is strongest and playtesters disagree. What do you do?`,
      red:`Trusts the simulation over playtesters without checking the model, or runs a single pass with no seed.` },
    { q:`Why can the same hero look balanced in one rank and overpowered in another? What do you do about it?`,
      a:`Skill changes how much of a hero’s kit players can use. Some heroes are strong when mechanics are cheap to execute at low ranks and weak against good counters at the top, and the reverse happens as well. Look at win rate by tier, with sample sizes. Riot’s framework watches four groups (average, skilled, elite, pro), and uses pick and ban rate where a tier is too small for win rate.`,
      follow:`Elite play has only a few hundred games per hero per week. What metrics can you use?`,
      red:`Looks at the global average and treats it as the truth for every player.` }
  ],
  senior:[
    { q:`Design the balance process for a live PvP game with 150 characters. Who looks at what, how often, and what is automated?`,
      a:`Automate the weekly report: win rate with intervals, win rate when picked, pick and ban rate, by tier, and flag only crossings of written thresholds with enough games. Humans read the flags with replays and designer judgement. Patch in small steps, one variable at a time, with an expectation written in advance, and publish the notes. Add a simulation or bot for pre-patch checks, and keep a list of the things the data cannot answer. Name the multiple-comparisons problem: with 150 options about 7 or 8 look off by chance each week.`,
      follow:`Leadership wants the report to rank the characters 1 to 150. What do you say?`,
      red:`Describes a dashboard and a weekly nerf for whichever tops the table, with no thresholds, intervals or tiers.` },
    { q:`Your studio will have a PvE mode and a PvP mode on the same set of abilities. How do you balance them without wrecking one or the other?`,
      a:`Decide the target separately. In PvE an overpowered build harms no one and can be a reward, so balance the encounters against what builds can do and let the ceiling be high. In PvP the ceiling is a cost for every opponent. Either keep separate numbers per mode (a data-driven override table) or pick the PvP numbers and tune PvE encounters to them. State the cost: two sets of numbers double the explanation, and players will ask why a tooltip differs.`,
      follow:`Players say the PvE number is the real number. What would you ship?`,
      red:`Applies one set of numbers to both modes without discussing the trade.` },
    { q:`A designer wants to use a bot or learned agent to balance a new card set before launch. What is your plan, and what will it not tell you?`,
      a:`Use search-based bots for the first pass and, if you have logs, a learned agent trained on human play. Run the full set of matchups with seeds, alternating the first move, and report intervals. Check that the ranking survives different bot skills and compare it with a small number of human sessions. It will not tell you about fun, about player skill curves, about metas that emerge from deck sharing, or about options the bot cannot find. Plan telemetry for launch week for what the sim missed.`,
      follow:`The bot ranks a card last that testers love. Do you cut it?`,
      red:`Says the simulation can replace human playtesting, or accepts a bot ranking with no check against people.` },
    { q:`Explain how you would find the healthy pick rates in a three-option counter cycle where one matchup pays double. Why does it matter for a live team reading pick-rate dashboards?`,
      a:`Write the payoff matrix and solve for the mix at which each option has the same expected payoff against the field. With scores of 0, -1, +2 for rock, +1, 0, -1 for paper and -2, +1, 0 for scissors, the mix is 25%, 50%, 25%. So paper at 50% pick rate is the healthy state. A team that reads 50% as a dominant strategy would nerf a balanced game. The practical check is whether each option’s average points per pick are equal, not the size of the pick rate and not the win rate: at 25/50/25 rock and paper win 25% of their games and scissors 50%, yet all three average 0 points.`,
      follow:`Pick rates are 25, 50, 25 and scissors wins 50% of its games while paper wins 25%. Is that an imbalance?`,
      red:`Calls any option above a third overpowered, with no matrix.` }
  ] });

FACTS('balance-methods',[
  {claim:`Riot’s League of Legends champion balance framework watches four player groups (average, skilled, elite and professional). In its June 2020 update Riot widened the elite group from the top 0.1% to the top 0.5% of players to get enough games for win rates, and tightened the overpowered bands for average and skilled play by 0.5 points each.`, asOf:'2026-10-05', src:'https://www.leagueoflegends.com/en-gb/news/dev/dev-balance-framework-update/'},
  {claim:`Blizzard’s StarCraft II team describes using adjusted win percentages, which remove the matchmaker’s effect and factor in player skill, across millions of games, with roughly 55:45 treated as acceptable and ratios beyond 60:40 prompting investigation (from a 2010 article).`, asOf:'2026-10-05', src:'https://news.blizzard.com/en-us/article/1136961/starcraft-ii-the-balancing-act'},
  {claim:`In a study presented in 2014 (posted to arXiv in 2019) on a shoot-em-up game, active learning with an upper-confidence-bound acquisition function needed about 70 playtest samples for its largest gain over random sampling, a level random sampling did not reach in the data set (138 players, 991 waves).`, asOf:'2026-10-05', src:'https://arxiv.org/abs/1908.01417'},
  {claim:`Schreiber and Romero’s book "Game Balance" (CRC Press, 2021, 806 pages) covers transitive mechanics and cost curves, intransitive mechanics and payoff matrices, and the use of spreadsheets for balance.`, asOf:'2026-10-05', src:'https://www.routledge.com/Game-Balance/Schreiber-Romero/p/book/9781498799577'},
  {claim:`Blizzard’s role-queue announcement, published 18 July 2019, put a 2-2-2 role queue (two tanks, two damage, two support) with a separate skill rating per role into a beta season in patch 1.39 (13 August to 1 September), with full release on 1 September 2019.`, asOf:'2026-10-05', src:'https://overwatch.blizzard.com/en-us/news/23060961/introducing-role-queue/'},
  {claim:`Since Overwatch 2 launched in October 2022, standard play is 5v5 with one tank, two damage and two support; Blizzard has since run 6v6 tests.`, asOf:'2026-10-05', src:'https://overwatch.blizzard.com/en-us/news/24104605/director-s-take-opening-up-the-conversation-on-5v5-and-6v6/'},
  {claim:`Supercell’s Clash Royale team wrote on 13 February 2017 that it approaches card balance by combining playtesting with card use rates and win rates.`, asOf:'2026-10-05', src:'https://supercell.com/en/games/clashroyale/blog/release-notes/balance-changes-coming-1'}
]);

DIAGRAM('balance-methods', { kind:'curve', title:'A cost curve: what each cost buys, and cards that miss it',
  x:'Cost (mana)', y:'Total value (points)',
  series:[{t:'Curve: 2 x cost + 1', pts:[[0.125,0.176],[0.25,0.294],[0.375,0.412],[0.5,0.529],[0.625,0.647],[0.75,0.765],[0.875,0.882]]},{t:'Example cards', pts:[[0.125,0.176],[0.25,0.412],[0.375,0.412],[0.5,0.588],[0.625,0.706],[0.875,0.706]]}],
  alt:'Most cards sit on or just above a rising line. The two-cost card sits well above it and the seven-cost card well below, so one is a pick in every deck and the other is a trap. Illustrative numbers, not from a shipped game.' });

EXPLAINER('balance-methods', { kind:'explainer', title:'Balance patches: small steps converge, one big swing overshoots',
  frames:[
    { t:'A hero wins 56% of games, and the team wants 50%', d:'Illustrative numbers. The band is where every option stays worth picking.', spec:{ kind:'matrix', rows:['Hero win rate now','Target band'], cols:['Value','Note'], cells:[['56%','6 points above the target'],['49 to 51%','close enough that no option crowds out the rest']] } },
    { t:'Option A, one big nerf: 56% drops to 46%', d:'The drop is 10 points where 6 were needed, nearly twice too large.', spec:{ kind:'curve', x:'Patch', y:'Hero win rate (44 to 58%)', alt:'The win rate falls from 56% straight past the band to 46% in one patch.', band:{ t:'target band, 49 to 51%', from:0.357, to:0.5 }, series:[{ t:'One big swing', pts:[[0,0.857],[0.25,0.143]] }] } },
    { t:'Patch 2: players adapt and counters appear, so it settles near 47%', d:'The hero is now underpowered, and people stop picking it.', spec:{ kind:'curve', x:'Patch', y:'Hero win rate (44 to 58%)', alt:'The line stays below the band after the big nerf.', band:{ t:'target band, 49 to 51%', from:0.357, to:0.5 }, series:[{ t:'One big swing', pts:[[0,0.857],[0.25,0.143],[0.5,0.214]] }] } },
    { t:'Patch 3: a 6-point buff swings it past the band to 53%', d:'Two patches have been spent chasing the same hero.', spec:{ kind:'curve', x:'Patch', y:'Hero win rate (44 to 58%)', alt:'The line overshoots above the band again after the buff.', band:{ t:'target band, 49 to 51%', from:0.357, to:0.5 }, series:[{ t:'One big swing', pts:[[0,0.857],[0.25,0.143],[0.5,0.214],[0.75,0.643]] }] } },
    { t:'Option B, small steps: 56 to 54.5, with a stated expectation before each patch', d:'One data point is read before the next step.', spec:{ kind:'curve', x:'Patch', y:'Hero win rate (44 to 58%)', alt:'A second line starts at 56% and drops only to 54.5% in the first patch.', band:{ t:'target band, 49 to 51%', from:0.357, to:0.5 }, series:[{ t:'One big swing', pts:[[0,0.857],[0.25,0.143],[0.5,0.214],[0.75,0.643]] }, { t:'Small steps', pts:[[0,0.857],[0.25,0.75]] }] } },
    { t:'Each step is checked, so the line reaches the band at 50.5% in four patches', d:'Small steps cost patches and avoid a rebound.', spec:{ kind:'curve', x:'Patch', y:'Hero win rate (44 to 58%)', alt:'The small-step line comes down 54.5, 53, 51.5 and 50.5 and stays in the band; the big-swing line is still bouncing around it.', band:{ t:'target band, 49 to 51%', from:0.357, to:0.5 }, series:[{ t:'One big swing', pts:[[0,0.857],[0.25,0.143],[0.5,0.214],[0.75,0.643]] }, { t:'Small steps', pts:[[0,0.857],[0.25,0.75],[0.5,0.643],[0.75,0.536],[1,0.464]] }] } }
  ] });

WORKED('balance-methods', {
  kind:'table',
  id:'creature-cost-curve',
  t:'A cost curve for eight creature cards',
  intro:'A small card game prices every creature on one scale. Total value is Attack plus Health plus the points you give its ability. The budget at cost c is 2 x c + 1, so a 1-cost card is budgeted 3 points and a 4-cost card 9. Surplus is value minus budget. This is the vanilla test as a spreadsheet: the curve is set from the cheap plain cards, then abilities are priced on top. The method follows the cost-curve chapter of Schreiber and Romero’s "Game Balance" (CRC Press, 2021).',
  note:'Illustrative numbers, not from a shipped game. The ability values (2 points for haste, 3 for a ranged ping, 4 for a repeating heal, 4 for flying plus haste) are estimates a designer would check by play.',
  columns:[{h:'Card'}, {h:'Cost', unit:'mana'}, {h:'Attack'}, {h:'Health'}, {h:'Ability value', unit:'points'}, {h:'Total value', unit:'points'}, {h:'Budget', unit:'points'}, {h:'Surplus', unit:'points'}, {h:'Verdict'}],
  rows:[
    ['Scout', 1, 1, 2, 0, 3, 3, 0, 'On curve'],
    ['Guard', 2, 2, 3, 0, 5, 5, 0, 'On curve'],
    ['Sprinter (haste)', 2, 3, 2, 2, 7, 5, 2, 'Over curve'],
    ['Archer (ranged ping)', 3, 2, 2, 3, 7, 7, 0, 'On curve'],
    ['Medic (heals 1 each turn)', 3, 1, 3, 4, 8, 7, 1, 'On curve'],
    ['Brute', 4, 5, 5, 0, 10, 9, 1, 'On curve'],
    ['Drake (flying, haste)', 5, 4, 4, 4, 12, 11, 1, 'On curve'],
    ['Colossus', 7, 6, 6, 0, 12, 15, -3, 'Under curve']
  ],
  formulas:[
    {col:'Total value', f:'Attack + Health + Ability value (in a sheet: =C2+D2+E2).'},
    {col:'Budget', f:'2 x Cost + 1 (in a sheet: =2*B2+1).'},
    {col:'Surplus', f:'Total value - Budget (in a sheet: =F2-G2).'},
    {col:'Verdict', f:'Over curve when surplus is 2 or more, Under curve when it is -2 or less, otherwise On curve (in a sheet: =IF(H2>=2,"Over curve",IF(H2<=-2,"Under curve","On curve"))).'}
  ],
  try:['Sprinter sits 2 points above the curve. Which would you change, its attack, its cost or the points you give haste, and what would you watch for in play to see you were right?', 'Colossus is 3 under. A big body at 7 mana is slow. Is it a trap, or does the curve under-price big stats at high cost? Where would you add points to test that?', 'Suppose a 4-cost 3/3 with flying existed beside a 3-cost 3/3 with nothing. What would that pair tell you about the value of flying, and which card in the table would you re-price with it?', 'Add a 6-cost card with 5 attack, 5 health and a 2-point ability. Where is it on the curve, and what does that say about the curve at high cost?', 'Every new set adds cards that are 1 point over the curve. After three sets, what has happened to the curve, and how would you notice it in a table?'],
  file:'creature-cost-curve.csv'
});

WORKED('balance-methods', {
  kind:'table',
  id:'rock-paper-scissors-payoff',
  t:'Solving a three-option payoff matrix',
  intro:'Rock, paper and scissors are scored for the row player against each column. A tie is 0, paper beats rock for 1 point, scissors beat paper for 1 point, and rock beats scissors for 2 points, so one matchup is worth double. No option is "stronger" here, so the question is what mix of choices makes each option worth the same. Let r, p and s be the shares of rock, paper and scissors in the field. Set the row player’s expected payoff against each column to zero, one equation per column: 0 = p - 2s (column rock), 0 = -r + s (column paper), 0 = 2r - p (column scissors). So s = r and p = 2r, and with r + p + s = 1 the mix is 25%, 50%, 25%.',
  note:'Illustrative numbers, not from a shipped game. The method is the one taught as intransitive mechanics and payoff matrices in Schreiber and Romero’s "Game Balance" (CRC Press, 2021).',
  columns:[{h:'Row option'}, {h:'Payoff vs Rock', unit:'points'}, {h:'Payoff vs Paper', unit:'points'}, {h:'Payoff vs Scissors', unit:'points'}, {h:'Equilibrium share', unit:'%'}, {h:'Expected payoff vs the equilibrium mix', unit:'points'}],
  rows:[
    ['Rock', 0, -1, 2, 25, 0],
    ['Paper', 1, 0, -1, 50, 0],
    ['Scissors', -2, 1, 0, 25, 0]
  ],
  formulas:[
    {col:'Equilibrium share', f:'Solve the three column equations: s = r, p = 2r, and r + p + s = 1, so r = 0.25, p = 0.5, s = 0.25.'},
    {col:'Expected payoff vs the equilibrium mix', f:'Each payoff in the row times the share of its column option. Rock: 0 x 0.25 + -1 x 0.5 + 2 x 0.25 = 0 (in a sheet: =B2*0.25+C2*0.5+D2*0.25). It is 0 for all three rows, which is what makes the mix an equilibrium.'}
  ],
  try:['Paper is picked 50% of the time at equilibrium. A dashboard shows paper at a 50% pick rate. Is paper overpowered? What would you check instead?', 'Raise rock beating scissors from 2 points to 3 and keep the other scores. Solve again with the same three equations. Which share moves most, and in which direction?', 'Players pick rock, paper and scissors 40%, 40% and 20%. Compute the expected payoff of each pure option against that field. Which option would a smart player pick, and what happens to the field next?', 'Add a fourth option that beats paper and loses to rock and scissors. What does the matrix look like, and why might the equilibrium give it no share?', 'Add 1 to every cell so no score is negative. Does the equilibrium mix change? Why or why not?'],
  file:'rock-paper-scissors-payoff.csv'
});

T('power-creep-and-content-growth',{ d:'systems', t:'Power creep: balance as content keeps growing', tag:'A new release has to feel stronger than the last one, so power drifts up. Rotation, squishes, caps, scaling and a written power budget each stop a different part of the drift, and each has a bill.',
  what:`Power creep is the steady rise in the strength of new content relative to old content. It is not a bug in one card or character. It is a pressure that comes from the release calendar: a new set, hero, weapon or expansion has to be worth the player's time or money, and the quickest way to make something look worth it is to make it do more than what came before. Wizards of the Coast's own designers name the mechanisms in Magic: fixing cards that underperformed by making the next ones better, printing near-copies so a deck can run eight of an effect instead of four, and missing strong interactions in a large card pool. They also say power creep is relative, because the same card is strong in one format and weak in another. Two kinds of growth need separating. Vertical progression raises a number (level, item level, attack), so old content falls behind by arithmetic. Horizontal progression adds options at roughly equal power (a new weapon type, a new archetype, a sidegrade), so old content keeps its value and the game grows wider rather than higher. Most live games do both, and creep is what vertical growth does to a shared game when nothing resets it. The cost shows up in four places: old content becomes obsolete (a launch dungeon is trivial, an old card is never played), new players face a gap they cannot close, the meta narrows to whatever the newest release made best, and the numbers themselves inflate until they are unreadable or hit a technical limit. World of Warcraft is the clear case of the last one. Blizzard's 6.0.2 patch notes (2014) say that after four expansions of growth the numbers were no longer easy to grasp, and they give their own example: a Fireball that hit for 450,000 of a 3,000,000-health creature now hits for 30,000 of 200,000, still 15% (a scale of 1 to 15, about 6.7%). A Blizzard designer's tweet, quoted by the community wiki, put the overall squish at about 4% of the old numbers and player health at about 8%. The same wiki records that a raid boss neared the largest value a signed 32-bit integer can hold (2,147,483,647); Blizzard's stated reasons were readability and granularity, so treat overflow as a risk to track, not as the proven cause. The toolbox has five families. Reset the pool (rotation: Hearthstone Standard, Magic Standard, Pokémon VGC regulation sets). Reset the numbers (squishes). Bend the curve so extra power buys less (soft caps and diminishing returns). Move the player rather than the content (level scaling, item-level sync, catch-up). Or plan the release so it does not outgrow the last one (a power budget per release, banning and errata, retroactive buffs). None is free, and several are contested. Rotation protects the live format by moving the problem to a format few people play, and it makes owners pay again. Gear expiry was tried in Destiny 2 and later removed. A cost curve (see balance-methods) is the gate for one release; this topic is about what happens across forty of them. In gacha and other live-service games there is a further pressure that deserves plain words: when revenue comes from selling new characters, a character that is better than the last one is a sales tool, and the designer is asked to build the thing the player is meant to feel they must buy. That is a design choice with an ethical side, taught in ethics-and-responsibility and monetisation-design, and this topic gives you the measures to tell whether you are doing it.`,
  why:[`Power creep is a time problem, and a balance spreadsheet is a snapshot. A cost curve that holds at release 1 can be right for every release and still let the whole curve drift up by 5% each time. You need a measure that compares releases with each other, not only items within one release.`,`The first symptom is rarely the numbers. It is a retention symptom: returning players find their old characters or decks useless, new players meet a collection gap, and the meta narrows. Hearthstone's own 2016 announcement of Standard named the same goals: a fresher meta, more freedom for designers and an easier start for new players.`,`Each fix has a price paid by a different group. Rotation costs collectors, a squish costs nothing in power but breaks every number players have memorised, scaling costs the feeling of getting stronger, and expiry costs the gear people liked. Choosing is a values decision as well as a design one.`,`Number inflation hits engineering as well as players. A health bar that approaches the limit of its integer type, a damage number that no longer fits in the UI, a log that cannot be read: these can force a squish, and a squish is far cheaper before the numbers are wide than after. Blizzard's own stated reasons for its squishes were readability and granularity.`,`In a game that sells new characters or cards, the creep rate is a business decision with a measurable cost: spending that depends on the player feeling behind. EA Sports FC's Ultimate Team is the textbook case in the library: promo and special cards with higher ratings are the product, so each batch makes the last one less useful. Measuring the rate makes the decision visible to the people who own it.`],
  think:{ q:[`Is the growth vertical (a bigger number) or horizontal (a new option at similar power)? For each planned release, which is it, and what share is each?`,`What is the power budget of release N, written as a number against a fixed baseline, and who signs it off? If nobody can say, the budget is whatever the last release plus a bit was.`,`How many releases of content are legal or relevant at once? What is the ratio of the strongest to the weakest item still in play, and how does it change from release to release?`,`If I rotate or retire old content, who loses something they paid for or earned, and what do they get? If I do not, who pays instead: new players, designers, the engine?`,`Are the numbers themselves still readable and safe? What is the largest value in the game, and how far is it from the limit of the type that stores it?`,`Is a soft cap flattening the top, or just moving the point at which players stop caring? What does the last point of a stat buy compared with the first?`,`Do I want a world that scales to the player (every area always feels the same) or one that stays put (a place can be too hard and later too easy)? Which does the game's fantasy want?`,`Whose problem is old content: a returning player, a new player, a competitive player, a collector? Each needs a different answer.`,`If this release's strongest piece is the one marketing leads with, who checks that it is not also the one the next release has to beat?`,`What would I measure at the end of next season to learn whether creep is happening, and what result would make me change the plan?`],
    trade:[`Rotation keeps the live format fresh and gives designers room, and it makes players buy again and buries content that was good. Wild and Legacy-style formats keep the old pool for those who want it, and the creep still lives there.`,`Squishing makes numbers readable and removes overflow risk, and it breaks muscle memory, community spreadsheets and every tuning value. The relative power is meant to stay the same, which means a squish changes nothing about creep.`,`Soft caps and diminishing returns cap the top of a stat and flatten choices past the knee. The knee has to be placed with data, or players simply stack the next stat.`,`Scaling content to the player keeps every zone relevant and removes the feeling of outgrowing an area; unbounded scaling makes levelling meaningless, and the player is told so by the first fight that is as hard at level 20 as at level 5.`,`Item expiry (Destiny 2's sunsetting) bounds power by force and removes things players valued. Bungie later reversed it, which is the evidence that players read expiry as loss.`,`A written power budget is the only fix that targets the cause. It also has to be defended in every release meeting by someone with the standing to say no to a stronger hero.`,`Banning and nerfing is fast and visible; each one spends player trust and, with paid content, may cost refunds or goodwill.`],
    traps:[`Treating a squish as a fix. It rescales the numbers and leaves every ratio the same, so the creep resumes from the new, smaller baseline.`,`Judging power from the loudest card, hero or item rather than from the median of what shipped. One strong card is a balance event; a rising median is creep.`,`Measuring new content on its own. Compare it with old content under the same conditions; balance-methods covers the selection and sample-size traps in reading those win rates.`,`Letting each release be balanced against the one before it. A 5% step against the last release is a 34% rise after six; the baseline, not the previous release, is the reference.`,`Rotating the format and pricing the creep into Wild, then calling the problem solved because the headline format is fresh.`,`Adding a cap that sits where almost nobody is, so it changes nothing, or where everybody already is, so it ends progression.`,`Scaling every enemy to the player, so that finding better gear changes nothing in the fight and the player stops caring about loot.`,`Reversing a rotation, expiry or nerf in reaction to anger, so players learn that the rules are negotiable and the next policy gets argued as well.`,`Hiding the budget from the people who write content, so each team discovers it by being asked to nerf their work after review.`],
    good:[`Every release has a written power budget against a fixed reference set, and the review compares the release with that reference as well as with the previous release.`,`The team tracks a power index and the gap between the strongest and the median content in play, per season, and acts on the trend.`,`Old content is kept relevant by deliberate means (rotation with a stable on-ramp, scaling, a rebalance pass), each with a stated owner and price.`,`The largest number in the game is known, and its distance from the storage type's limit is a tracked risk.`],
    bad:[`"Each new thing should be a bit better, or nobody will buy it" is the only power rule.`,`Nobody can name the strongest piece of content from two years ago, because it is never used.`,`A balance patch exists to make last quarter's hero viable again, and the next hero ships stronger.`] },
  how:[`Pick a fixed reference set (for a card game, a vanilla-test baseline of plain cards; for a hero game, a handful of heroes that anchor the curve) and write a power index for every item as a ratio of its value to that baseline, using your cost curve. This week: do it for the last four releases and plot the median and the top item per release. A flat median with a rising top item means outliers; a rising median means creep.`,`Write a power budget for the next release: the median and the ceiling of the index it may reach, the number of strong outliers allowed, and who signs it off. A release over budget either loses something or gets a reasoned exception on record.`,`Check the vertical and horizontal split of the roadmap. For each planned item ask whether it adds an option, or adds a number. Aim for the options to be most of the list and the numbers to come through scaling or caps, not through each new unit being stronger.`,`Measure new against old under the same conditions: the same skill tier, and an old item of the same cost or role as the control. Use the telemetry method in balance-methods for the sample size and margins of error, and do not repeat it here.`,`Set the largest-number alarm: a dashboard line for the largest health, damage and currency value, as a share of the maximum of its storage type. Decide the threshold at which you plan a squish (for example half the maximum) so it is a scheduled task, not an emergency.`,`If you choose rotation, decide the window (how many releases stay legal), the on-ramp (a refreshed core set, free starter cards) and where retired content goes (a second format), before the first rotation, and announce them. Hearthstone announced its two-year rule in February 2016, about three months before the first rotation, with the list of sets that would leave.`,`If you choose a squish, divide every number by the same factor, including enemy values, hotfix tables, UI and tutorial text, and test the rounding of small values (a 7 divided by 15 must not become 0). Keep a ratio test: time to kill and time to die for twenty reference fights before and after, which must match within tolerance.`,`If you choose a soft cap, plot effective power against raw stat and place the knee where the typical player ends, so the cap shapes the choices of the top half. A reduction of x / (x + K) has this shape: half the benefit is at x = K.`,`If you choose scaling, decide what is not scaled: loot quality, reward tier or area identity. The least damaging scaling keeps the fight's difficulty near the player's power and lets a floor of gear still matter.`,`If you ship an old-content rebalance, state it as a plan: which items get a buff and which are untouched, and what the index looks like after, so the next release is measured against the new baseline.`,`In a game that sells new characters, publish the principle to yourselves: new characters are different, not stronger, and a character may not enter the game with a measured power index above the written ceiling. Record who approved any exception.`],
  ai:{ yes:[`Compute a power index per item from a cost-curve table and plot the median and top of each release.`,`Write the script that compares new content with an old control cohort (the statistics are in balance-methods).`,`Simulate rotation and squish scenarios on a toy model (a few thousand lines of data are enough) and show the gap between strongest and oldest legal content.`,`Draft the rounding and ratio tests for a squish, including the small-value cases.`],
       no:[`Decide how much a new release may be stronger. That is a business and design decision with an ethical side.`,`Tell you what players will tolerate in rotation or expiry; play it out with them, or with real telemetry.`,`Replace a played-through check of an old dungeon or deck after a squish. The ratio test shows the maths held; only play shows the feel held.`] },
  prompts:[{l:'Power index by release',p:`Here is a table of our items: [PASTE: release, name, cost, and the stats and ability values we assign]. Fit a cost curve using only the plain items as a baseline, give every item an index (value divided by the curve at its cost), and report the median, the 90th percentile and the maximum per release. Tell me whether the rise is in the median or in a few outliers, and list the five items that most raise each release. Say what you assumed about ability values.`},
    {l:'Squish plan and tests',p:`We plan to divide all combat numbers by [K]. These are the places numbers live: [LIST: stats, health, damage, shields, currency, UI, tutorial text, log format, save files]. For each, say what happens to small values after rounding and give a test. Then list twenty reference fights and write the ratio test (time to kill and time to die before and after, with a tolerance). Do not suggest changing the relative balance.`},
    {l:'Plan for old content',p:`Our game has [N] releases. New players find the old content [TOO WEAK / TRIVIAL / IRRELEVANT]. The options we are considering are: rotation, scaling, a rebalance pass, and a catch-up path. For each option, write who loses, who gains, the price in one line, and one measurement that would tell us in a season whether it worked. Recommend one for [GENRE, MONETISATION] and say what would make you change your mind.`}],
  verify:[`Is there a fixed baseline that does not move with each release, and is every index measured against it?`,`Is every new-versus-old comparison made against an old control under the same conditions, read as balance-methods describes?`,`After a squish, does time to kill and time to die match for the reference fights, and do small values survive rounding?`,`Is the effect of a cap visible in effective-power plots at the stat values real players reach, not only at the maximum?`,`If rotation or expiry is used, is the retired content kept somewhere (a second format, a legacy list) and the rule published in advance?`,`Can a stated power ceiling for the next release be traced to a name and a date?`],
  test:[`For the last six releases, plot the median and top power index of the content that shipped. If the median rises, creep is happening whatever the win rates say.`,`Put the newest and the oldest content still in play into twenty mirror matches, and measure the gap in outcome. Do it again after each release.`,`Run a returning-player test: give someone a two-year-old account and watch whether they find any old content that is still worth using.`,`Run a new-player test: how many hours or purchases before a fresh account can contest a mid-level activity?`,`After a squish, play the first ten minutes and the first boss in a build and ask players to name the numbers they now cannot read.`,`Watch pick rates in the first two weeks after release against a control of old content. A new item with a high pick rate and a high win rate is a candidate for the budget review.`]
  ,
  rel:[['balance-methods','A cost curve and a vanilla test price one release. This topic is about the same curve drifting across many releases; use the power index from that method as the number to track over time.'],['progression','Vertical progression is the engine of creep, and horizontal progression is the escape from it; the progression topic teaches what each step unlocks.'],['live-design-seasons-and-data','Seasonal cadence is the release calendar that creates creep, and the data tools there are how you read win rate and play rate of new against old.'],['monetisation-design','When revenue comes from selling new characters or cards, creep is a sales effect, and the pricing of power is a monetisation decision.'],['ethics-and-responsibility','Selling a feeling of being behind is a dark-pattern question; the line between a better character and a manipulated one is argued there.'],['content-multiplies','More content multiplies a good system and also the number of things that have to stay in balance with each other; the cost of keeping old content relevant grows with the count.']] });

TECH('power-creep-and-content-growth', [
  {n:'Rotation: a standard format with a retiring window', how:`Only content from the last few releases is legal in the main competitive or ranked mode. Hearthstone announced Standard on 2 February 2016, and the first rotation came with the spring expansion that April: the current and previous calendar year plus Basic and Classic cards, with Wild keeping every card legal. Hearthstone also kept a Hall of Fame list that moved over-represented cards out of Standard until 2021, when Blizzard retired it and moved its cards to Wild; the yearly Core Set then brought a curated set of old and new cards back at chosen power, which is the reprint tool. Wizards of the Coast's Sam Stoddard calls creating a rotating Standard "by far, the most important thing" Magic did against creep (2013). Wizards moved Standard to three years of sets in 2023, saying it wanted cards to have more longevity.`, fit:`Collectible card games, deck-based and loadout-based games with a purchase per set, and any game where a separate ranked ladder can use a smaller pool.`, cost:`Players lose cards they paid for in the main format, new sets must be bought to stay current, and the old pool and its creep live on in the second format. Longer windows give a stabler format and, as Magic fans argued after 2023, more sets that each have to be strong.`, alt:`Banning and errata for a single pool, or a tiered format with a rotating ranked season.`},
  {n:'Stat squish', how:`Divide every number in the game by one factor, enemies and players together, so ratios hold. Blizzard's 6.0.2 patch notes (2014) show a 1-to-15 example (450,000 of 3,000,000 became 30,000 of 200,000); a Blizzard designer put the overall scale at about 4% and player health at about 8%. Squishes followed in patch 8.0.1 (2018), 9.0.1 (2020, with levels 120 to 50 and a cap of 60) and the Midnight pre-patch (2026), whose notes say relative power to enemies is unchanged and the aim is clearer numbers.`, fit:`Long-running games whose numbers have grown into the hundreds of thousands or millions, or near a storage limit.`, cost:`It does nothing to creep, it can round small values to zero or one, it breaks every value in hotfixes, UI and community tools, and old content needs rescaling.`, alt:`Plan the number range at the start, and keep growth in the multiplier layer, not in the base value.`},
  {n:'Soft caps and diminishing returns', how:`Pass a raw stat through a curve that gives less per point. The common shape is reduction = x / (x + K): half the maximum benefit at x = K, and 100 armour halves physical damage in League of Legends (100 / (100 + 100)), while 200 armour gives 66.7%. The knee K is the design choice.`, fit:`Defensive and offensive percentages, crit chance, cooldown reduction, anything that must not reach 100%.`, cost:`Past the knee, extra points feel wasted, which pushes players to a different stat; a cap placed wrongly either changes nothing or ends the build.`, alt:`Hard caps, with a visible cap on the UI, or removing the stat.`},
  {n:'Scaling content to the player', how:`Enemy level, health or loot follows the player level, or the player is synced down to the content level. Bethesda's Oblivion scaled enemies and loot to the player, which players commonly criticised (no primary source here). The 2025 remaster changed something else: how the character gains attributes at level-up, a fixed number of points per level, as reported by players and press. That fixes a levelling trap, not the world scaling. Elden Ring goes the other way (from the game itself, no source): each area's enemies keep a fixed strength, and weapon upgrade materials and levels are the gate, so an area can be too hard early and easy later.`, fit:`Open-world RPGs, MMOs with old zones, anything where the player may go anywhere in any order.`, cost:`Full scaling removes the reward of getting stronger. Fixed zones keep it and make some areas trivial later, and a player can walk into a place that is far too hard.`, alt:`Level bands with a scaling floor and ceiling; sync only for group content; gear-gated zones.`},
  {n:'Per-release power budget', how:`Write the median and the ceiling of the power index each release may reach, against a fixed baseline. Review new content against the budget before art and marketing are committed. The numeric index and ceiling are this topic's own method. Wizards shows that a target exists, but it is qualitative: its Play Design team says Standard strength is too nebulous to define rigidly, deliberately powered up its marquee sets from Guilds of Ravnica through Throne of Eldraine (about a year of sets), and then said it missed on Oko.`, fit:`Any game with regular content drops, and above all any game that sells characters, cards or gear.`, cost:`It needs a number the team trusts, and someone who can say no to a strong, exciting item. A budget set too low starves the release of excitement.`, alt:`Relative review only (compare with the last release), which is how creep happens.`},
  {n:'Sidegrades and horizontal design', how:`New content is different, not stronger: a new weapon type at the same power, a hero with a new role, a mechanic that opens a new decision. Slay the Spire-style card sets are an example: its designer's GDC 2019 talk states the aim as every card having a place and avoiding anything too warping. Treat Overwatch's roster of heroes as a judgement-only example (no source), since heroes there differ by role, not by level.`, fit:`Hero and class games, roguelike deck builders, any game with a fixed number of slots.`, cost:`Harder to sell: a different thing is less obviously worth buying than a better thing. Needs counterplay design so that new options do not simply replace old ones.`, alt:`Vertical growth held back by caps, with horizontal growth for the rest.`},
  {n:'Gear expiry (sunsetting)', how:`Each item gets a maximum power that stops rising a year after release, so old gear drops out of high-level content. Destiny 2 tried this in the Beyond Light era, with a Season 11 cap of 1,060 on older legendary gear, and later removed it, so any gear that could still reach the cap could reach all future caps.`, fit:`Loot games where old gear would otherwise accumulate and each new mechanic must be tested against it.`, cost:`Players read it as loss of things they earned, and the reversal showed the cost; the stated benefit (Bungie's reasons included easier testing of fewer gear combinations) is real for designers.`, alt:`Retire by rotation of the activity, or by a rebalance pass that keeps old items live.`},
  {n:'Banning, errata and nerfs',
    how:`Remove or change the offending item. Wizards banned Oko, Thief of Crowns, after its Play Design team said it was much stronger than intended and that they had lost sight of its raw power in late redesigns. Hearthstone's Hall of Fame list moved cards out of Standard when they were over-represented or design-limiting, and the team lowered Basic and Classic cards where they kept dominating (secondary report). Fighting games such as Street Fighter and sports games such as EA Sports FC rebalance old items by patch (example from the library, no source read).`, fit:`Single mistakes in a release that was otherwise within budget.`, cost:`Each action spends trust, and with paid content, goodwill or refunds; used every release it means the budget is not working.`, alt:`A budget that catches the item before release.`},
  {n:'Reprints and refreshed cores',
    how:`Bring old content back at a chosen power. Hearthstone's yearly Core Set (235 cards in 2021) mixes Classic, Basic, Wild and new cards, so the evergreen pool changes with the format. Magic reprints old cards in later sets as a matter of routine (general practice, no source read here).`, fit:`Card games with a stable of evergreen cards.`, cost:`Reprints can cheapen a collector's card, and a core that is too strong ends the freshness rotation was meant to give; Blizzard said it wants to be careful with the power of Basic and Classic cards in Standard.`, alt:`Fully fresh sets only, with a small starter.`},
  {n:'Retroactive buffs and rebalance passes', how:`Raise old content rather than lowering new. In a Honkai: Star Rail 3.0 developer radio, HoYoverse said that difficulty deploying older characters and strengthening them were already on the schedule (as quoted by press); buffs for several older characters were reported later.`, fit:`Gacha and hero games with a long tail of characters.`, cost:`It resets the creep baseline upward, and the next release is measured against it. Applied without a budget it feeds the same loop.`, alt:`Cap the top instead, or add content modes that reward old roles.`},
  {n:'Catch-up mechanics', how:`Give players who are behind a faster route to the current tier: higher drop rates in old zones, a boosted character, a tier-jump item, weekly bonuses until the baseline. Tune it by time to reach the current tier from a fresh account.`, fit:`MMOs and live-service games with a gear treadmill.`, cost:`Veterans may feel their time was cheapened; if too generous, it removes the first stages of the game from play.`, alt:`Reset the treadmill with a seasonal ladder (everyone starts together).`},
  {n:'Format control by regulation set', how:`The publisher defines which monsters or items are legal for a period. Pokémon's VGC uses lettered regulation sets (A to I in Scarlet and Violet) that restrict which species are allowed, with limits on restricted legendaries; per the handbook a set may last between one and three months.`, fit:`Games with a large fixed roster that cannot be rotated out because the roster is owned.`, cost:`Players need to learn a new rule set often; it reduces the creep problem for competition and does nothing for the game's full pool.`, alt:`Community-run formats with their own ban lists (the Smogon model).`}
]);

ENGINE('power-creep-and-content-growth',{
  unity:{ term:`Keep the power maths in one static class, so a soft cap, a squish and a power index are defined once and unit-checked once, and so that a balance spreadsheet and the game use the same function.`,
    api:['Mathf.Max','Mathf.RoundToInt','Mathf.Sqrt'],
    snippet:`using UnityEngine;

public static class PowerMath {
    // Armour-style soft cap: half the benefit at raw == k.
    public static float Reduction(float raw, float k) => raw / (raw + k);

    // Squish: divide by the same factor everywhere; never drop a live value to 0.
    public static int Squish(int value, int divisor) =>
        Mathf.Max(1, Mathf.RoundToInt((float)value / divisor));

    // Power index: geometric mean of offence and survivability.
    public static float Index(float dps, float hp) => Mathf.Sqrt(dps * hp);
}`,
    pitfall:`Squishing each field separately. A damage of 450,000 against 3,000,000 health becomes 30,000 against 200,000 at divisor 15, but a bleed of 7 per tick becomes 0.47, rounds to 0 and is raised to 1, about 2.1 times its intended value. Squish in one place, and review every small value by hand.`,
    map:`Godot would put these in a class_name script with static functions and keep the tables in a Resource. The maths is identical.` },
  godot:{ term:`A script with class_name and static functions, loaded by name from anywhere, holds the same three functions, so enemies, items and the editor tools all call one soft cap and one squish.`,
    api:['class_name','maxi()','roundi()','sqrt()'],
    snippet:`class_name PowerMath

# Armour-style soft cap: half the benefit at raw == k.
static func reduction(raw: float, k: float) -> float:
\treturn raw / (raw + k)

# Squish: divide by the same factor everywhere; never drop a live value to 0.
static func squish(value: int, divisor: int) -> int:
\treturn maxi(1, roundi(float(value) / divisor))

# Power index: geometric mean of offence and survivability.
static func index(dps: float, hp: float) -> float:
\treturn sqrt(dps * hp)`,
    pitfall:`Integer division in GDScript. value / divisor on two ints discards the fraction, so a squish drifts silently low for every value; convert to float first, as above, and round once.`,
    map:`Unity's static class and Mathf calls map one to one: maxi is Mathf.Max on ints, roundi is Mathf.RoundToInt.` },
  note:`This is a snippet, not a system. The point is that the cap, the squish and the index each live in one function that a test or a balance tool can call, so you can run the ratio test (time to kill before and after) from the same code the game ships.` });

INTERVIEW('power-creep-and-content-growth',{
  junior:[
    { q:`What is power creep, and why does it happen in a game that keeps releasing content?`,
      a:`New content is gradually stronger than old content. It comes from the release calendar: each release must feel worth buying or playing, designers fix underperformers by making the next ones better, and complex interactions are missed. Add that vertical growth (bigger numbers) leaves old content behind by arithmetic, and horizontal growth (new options) does not.`,
      follow:`Give a game where new content is mostly horizontal and say what that costs.`,
      red:`Says it is only a matter of one overpowered card, or that it is the players' fault.` },
    { q:`What does a stat squish do, and does it stop power creep?`,
      a:`It divides the numbers (health, damage, stats, item levels) by one factor so they are readable and safe from overflow; relative power is unchanged. It does not stop creep, because ratios are the same. World of Warcraft squished in 2014, 2018, 2020 (with a level squish) and for Midnight.`,
      follow:`What can go wrong when you squish small values?`,
      red:`Thinks a squish makes old content weaker or fixes balance.` }
  ],
  mid:[
    { q:`How would you measure whether a game has power creep?`,
      a:`Build a fixed baseline (plain, vanilla items), a power index for every item against a cost curve, and plot the median and top item of each release. A rising median is creep; a rising top item with a flat median is outliers. Add new-versus-old comparisons against a control, read with the telemetry method in balance-methods.`,
      follow:`Why is the previous release a bad reference?`,
      red:`Looks only at the win rate of the newest hero.` },
    { q:`Compare rotation with a soft cap as responses to creep. What does each fix, and what does each cost?`,
      a:`Rotation moves old content out of the main format, which resets the pool but costs collectors and leaves the second format with the creep. A soft cap flattens the return on a stat, which stops one number running away, but players switch to the next uncapped stat and the knee must be set with data. Neither lowers the growth rate of new releases.`,
      follow:`Which would you try first for an action RPG with item levels?`,
      red:`Calls one of them "the solution".` },
    { q:`A new hero wins 57% of games in its first fortnight. Is that power creep?`,
      a:`Not by itself. One strong item is a balance event; creep is a rising median across the release. Read the win rate as balance-methods teaches (selection, tier, sample size), then check the index against the budget: median above the ceiling is creep, a lone outlier is a balance fix.`,
      follow:`What would you look at on the next three releases to see a trend?`,
      red:`Nerfs immediately, or shrugs because players will adapt.` }
  ],
  senior:[
    { q:`Your live game sells a new character every six weeks and revenue depends on it. How do you keep creep under control, and what is the ethical limit?`,
      a:`A written ceiling for the index of new characters, set against a fixed baseline and signed off by someone outside the revenue chain. New characters differ in role and rule, not in raw strength. Rebalance the older ones on a schedule so they keep a place. Track median index, new-versus-old win rate and spending by owned characters. The limit: a character built to make the owner of the last one feel behind is a pressure tactic; if the plan depends on that feeling, change the plan.`,
      follow:`The ceiling costs you the next release's excitement. What do you offer instead?`,
      red:`Says creep is unavoidable and moves on, or sets the ceiling at "a bit more than the last one".` },
    { q:`Plan the rotation of a card game that has run for six years with one big pool. What do you decide before you announce?`,
      a:`The window (how many releases stay legal), the on-ramp (a refreshed core set, a free starter), where retired cards go (a second format), what is protected (a hall-of-fame list), the compensation for collectors, and the date. Publish it well before the first rotation, as Hearthstone did in February 2016, about three months ahead with the list of leaving sets. Measure by the strongest-to-oldest-legal ratio, and by new-player conversion.`,
      follow:`Players say the window is too short. What do you look at before changing it?`,
      red:`Rotates the pool without a second format or a plan for new players.` },
    { q:`A long-running game's numbers have reached the billions. When would you schedule a squish, and what do you test?`,
      a:`Before the largest value approaches half the storage limit, so it is planned (overflow is a risk to track; Blizzard's stated reasons for its own squishes were readability and granularity). Divide everything by the same factor, including UI, hotfix tables and logs, and test rounding of small values. A ratio test for twenty reference fights (time to kill, time to die) before and after. Communicate it as a readability change that keeps power, and expect the community to lose its spreadsheets.`,
      follow:`A DoT of 7 becomes 0 at divisor 15. What do you do?`,
      red:`Squishes only the headline stats, or forgets the enemies.` }
  ] });

FACTS('power-creep-and-content-growth',[
  {claim:`Hearthstone's Standard format was announced on 2 February 2016: decks built from cards released in the current and previous calendar year, plus the Basic and Classic sets, with Wild leaving every card legal. Blizzard listed a fresher meta, more freedom for designers and an easier start for new players as the goals.`,asOf:'2026-10-05',src:'https://hearthstone.blizzard.com/en-us/news/19995505'},
  {claim:`In 2021 Hearthstone replaced Basic and Classic in Standard with a Core Set of 235 cards, refreshed each year, and retired the Hall of Fame, moving its cards to Wild.`,asOf:'2026-10-05',src:'https://hearthstone.blizzard.com/en-us/news/23620129/introducing-the-core-set-and-classic-format'},
  {claim:`Wizards of the Coast announced in 2023 that Magic Standard sets would rotate every three years instead of two, starting with no rotation at the release of Wilds of Eldraine, to give cards more longevity.`,asOf:'2026-10-05',src:'https://magic.wizards.com/en/news/announcements/revitalizing-standard'},
  {claim:`In the Midnight pre-expansion notes, Blizzard describes a stat and item squish that reduces numbers across World of Warcraft for clarity and readability, and states that a player's power relative to enemies stays the same.`,asOf:'2026-10-05',src:'https://news.blizzard.com/en-us/article/24244455/midnight-pre-expansion-content-update-notes'},
  {claim:`Pokémon VGC play uses lettered regulation sets that restrict which Pokémon are legal, with each set able to last between one and three months and its contents announced up to 30 days ahead (the current handbook applies them to Pokémon Champions).`,asOf:'2026-10-05',src:'https://www.pokemon.com/static-assets/content-assets/cms2/pdf/play-pokemon/rules/play-pokemon-vgc-tournament-handbook-en.pdf'},
  {claim:`League of Legends physical damage after armour is physical damage x 100 / (100 + armour), so 100 armour halves it.`,asOf:'2026-10-05',src:'https://wiki.leagueoflegends.com/en-us/Armor'}
]);

DIAGRAM('power-creep-and-content-growth', { kind:'curve', title:'Power of new content across eight releases, with and without a budget',
  x:'Release number', y:'Power of new content',
  series:[{t:'Rising 6% a release', pts:[[0.125,0.625],[0.25,0.6625],[0.375,0.7025],[0.5,0.744],[0.625,0.789],[0.75,0.836],[0.875,0.887],[1,0.94]]},{t:'Held to a budget', pts:[[0.125,0.625],[0.25,0.625],[0.375,0.625],[0.5,0.625],[0.625,0.625],[0.75,0.625],[0.875,0.625],[1,0.625]]}],
  alt:'Two lines against release number. The first rises steadily from 100 to about 150 by release 8, since each release is 6% stronger than the previous one. The second stays at 100, because every release is held to a written ceiling. Illustrative numbers, not from a shipped game.' });

EXPLAINER('power-creep-and-content-growth', { kind:'explainer', title:'Power across eight releases: what rotation and a squish fix, and what they do not',
  frames:[
    { t:'Release 1 sets the baseline at 100, and each release is 6% stronger than the one before', d:'Illustrative numbers. By release 8 the newest content is near 150.', spec:{ kind:'curve', x:'Release (1 to 8)', y:'Power index (90 to 160)', alt:'A steady rising line from 100 at release 1 to about 150 at release 8.', series:[{ t:'Newest release', pts:[[0,0.143],[0.143,0.229],[0.286,0.32],[0.429,0.416],[0.571,0.517],[0.714,0.626],[0.857,0.741],[1,0.863]] }] } },
    { t:'With no rotation, the oldest content stays legal and the gap grows to 1.5 times', spec:{ kind:'curve', x:'Release (1 to 8)', y:'Power index (90 to 160)', alt:'The newest line keeps rising while the oldest legal content stays flat at 100, so the gap widens every release.', series:[{ t:'Newest release', pts:[[0,0.143],[0.143,0.229],[0.286,0.32],[0.429,0.416],[0.571,0.517],[0.714,0.626],[0.857,0.741],[1,0.863]] }, { t:'Oldest legal content', pts:[[0,0.143],[1,0.143]] }] } },
    { t:'A three-release rotation drops the oldest content each time, so the gap stays near 1.12 times', spec:{ kind:'curve', x:'Release (1 to 8)', y:'Power index (90 to 160)', alt:'The oldest legal line now rises behind the newest one, two releases back, so the distance between them stops growing.', series:[{ t:'Newest release', pts:[[0,0.143],[0.143,0.229],[0.286,0.32],[0.429,0.416],[0.571,0.517],[0.714,0.626],[0.857,0.741],[1,0.863]] }, { t:'Oldest legal content', pts:[[0,0.143],[0.286,0.143],[0.429,0.229],[0.571,0.32],[0.714,0.416],[0.857,0.517],[1,0.626]] }] } },
    { t:'But the ceiling still rises, and the retired content moves to a second format', d:'The open format keeps every release. The rotation hid the creep in the main format; it did not remove it.', spec:{ kind:'matrix', rows:['Newest release','Oldest kept in rotation','Oldest in the open format'], cols:['Power at release 8','Gap to the newest'], cells:[['150','none'],['134','1.12 times'],['100','1.5 times']] } },
    { t:'A stat squish divides every number by 15, and the shape does not change', d:'The axis reads 6 to 11 instead of 90 to 160; every point sits exactly where it was.', spec:{ kind:'curve', x:'Release (1 to 8)', y:'Power after squish (6 to 11)', alt:'The same rising line, with smaller numbers on the axis.', series:[{ t:'Newest release', pts:[[0,0.143],[0.143,0.229],[0.286,0.32],[0.429,0.416],[0.571,0.517],[0.714,0.626],[0.857,0.741],[1,0.863]] }] } },
    { t:'Only a written power budget bends the line itself', d:'New content is held to the budget and differs in role, not in strength.', spec:{ kind:'curve', x:'Release (1 to 8)', y:'Power index (90 to 160)', alt:'Beside the rising line, a flat line at 100 shows releases held to a written budget.', series:[{ t:'No budget', pts:[[0,0.143],[0.143,0.229],[0.286,0.32],[0.429,0.416],[0.571,0.517],[0.714,0.626],[0.857,0.741],[1,0.863]] }, { t:'Held to a budget', pts:[[0,0.143],[1,0.143]] }] } },
    { t:'Each tool, by what it changes', spec:{ kind:'matrix', rows:['Rotation','Stat squish','Power budget'], cols:['What it changes','What it leaves alone'], cells:[['the gap inside one format','the rate of creep, and the formats that keep everything'],['the size of the numbers','the shape of the curve and every gap'],['the rate of creep itself','nothing about the past: old content stays as it was']] } }
  ] });

WORKED('power-creep-and-content-growth', {
  kind:'table',
  id:'creep-with-and-without-rotation',
  t:'Eight releases at 6% a release: the gap with and without rotation',
  intro:'A card game raises the power of each release by 6% over the last one. The power of release n is 100 x 1.06^(n-1). Without rotation every release stays legal, so the gap between the newest and the oldest legal content is the newest power divided by 100. With a three-release rotation only the last three are legal, so the oldest is the one from two releases back. The table shows that rotation bounds the gap and does not change the rate.',
  note:'Illustrative numbers, not from a shipped game. The 6% step is an assumption chosen to make the shape visible; real steps are smaller and noisier.',
  columns:[{h:'Release'}, {h:'Power of new content', unit:'index'}, {h:'Gap without rotation', unit:'x'}, {h:'Gap with three-release rotation', unit:'x'}],
  rows:[[1,100.0,1.00,1.00],[2,106.0,1.06,1.06],[3,112.4,1.12,1.12],[4,119.1,1.19,1.12],[5,126.2,1.26,1.12],[6,133.8,1.34,1.12],[7,141.9,1.42,1.12],[8,150.4,1.50,1.12]],
  formulas:[{col:'Power of new content', f:'100 * 1.06^(release - 1)'},{col:'Gap without rotation', f:'power of release / 100'},{col:'Gap with three-release rotation', f:'power of release / power of (release - 2), with release - 2 at least 1'}],
  try:['What happens to the gap with rotation if the step is 10% instead of 6%?','Rotation holds the gap at 1.12 from release 3. What would the gap be with a five-release window, and what does that cost players?','The newest power still reaches 150 at release 8. If the retired releases stay legal in a second format, what does a player there see?'],
  file:'creep-with-and-without-rotation.csv'
});
