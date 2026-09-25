/* =====================================================================
   SYSTEMS
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'systems', lens:'design', t:'Systems', short:'Mechanics, economy, progression, difficulty, depth', color:'var(--d-systems)',
    sum:`Rules that interact. Systems generate the situations that make the loop worth repeating, and they are where depth comes from. They are also where complexity, balance debt and meaningless numbers hide.`,
    links:[['content','Content is systems instantiated: enemies, items and levels are parameters, not new rules.'],['core','A system is only as good as the decisions it feeds into the loop.'],['product','Economy and progression are where business model pressure meets design.'],['ai','AI is excellent at simulating, stress-testing and comparing systems.']] });

T('mechanics-and-rules',{ d:'systems', t:'Mechanics and rules', tag:'A mechanic is a verb plus the rules that give it consequences. Judge it by the decisions it creates.',
  what:`A mechanic is something the player can do (jump, trade, bluff, build) plus the rules that govern its cost, effect and interaction with other mechanics. The MDA framework (Hunicke, LeBlanc, Zubek) separates mechanics (what the designer writes) from dynamics (what happens at runtime) from aesthetics (what the player feels). Designers write mechanics but players only meet dynamics and aesthetics. Subway Surfers shows how small a move set can be: three lanes, a jump and a roll are the whole of it, and rising speed does most of the escalating.`,
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
  what:`Complexity is the number of rules, exceptions and pieces of state a player must understand to play. Depth is the number of meaningful, situationally different decisions those rules generate. Elegance is high depth per unit of complexity. Chess has few rules and enormous depth. A game with 300 stats can be shallow. This vocabulary (popularized by Extra Credits and others) has no agreed metric. Use it as a lens.`,
  why:[`Complexity is paid up front by every player. Depth is enjoyed only by those who stay. Front-loading complexity churns players before they reach the depth.`,`Feature additions almost always add complexity. They add depth only if they create new situational decisions.`,`AI makes adding rules nearly free, which makes complexity inflation the default failure.`],
  think:{ q:[`For each rule: what decision would disappear if I deleted it? If none, delete it.`,`Could one rule replace three? Rules that interact multiply depth. Rules that add cases only add complexity.`,`What is the smallest ruleset that still produces the intended decisions?`,`Is this complexity load-bearing or decorative?`],
    trade:[`Cutting rules cuts edge cases players loved as well as ones they hated.`,`Depth requires interacting rules, which are harder to balance and to explain.`],
    traps:[`Adding exceptions to fix balance instead of changing the underlying rule.`,`Confusing “hard to learn” with “deep”.`,`Measuring depth by feature count in marketing copy.`],
    good:[`New players can start within minutes. Veterans are still discovering interactions after months.`,`Rules fit on a card. Strategies fill a wiki.`],
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
  what:`Designing mechanics so they read and write shared state and therefore interact: fire spreads on grass, which enemies fear, which players can exploit to herd them. Systemic games produce situations the designer never authored. Tynan Sylvester frames this as designing for emergence. The opposite is a set of sealed mini-games sharing a menu.`,
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
\tvar cell := ground.local_to_map(global_position)
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
  what:`The flows of resources in a game: where they come from (sources), where they go (sinks), how they convert (traders, crafting), and what state they carry (inventory, currency, health, time). An economy is healthy when resources are scarce enough to force tradeoffs and abundant enough that the player can act. In Plants vs. Zombies the in-level currency, sun, is never paid for kills, only collected or grown, so every Sunflower spends a square a weapon could have used.`,
  why:[`Resource decisions are the most common decisions in most genres. A broken economy breaks decision-making everywhere.`,`Economies drift: a small imbalance compounds over hours into “everything is free” or “nothing is affordable”.`,`Multiple currencies multiply cognitive load and rarely multiply decisions.`],
  think:{ q:[`For each resource: what is the decision about spending it? If there is only one thing to spend it on, it is a progress bar, not a resource.`,`Where does it enter and leave? Are sinks strong enough to keep it scarce at hour 20?`,`Do two resources trade off, or is one strictly better?`,`Why does this need its own currency? Could it share one?`],
    trade:[`Scarcity increases decision weight and frustration.`,`More currencies allow finer tuning and cost clarity.`],
    traps:[`Adding a currency to gate a system instead of designing a trade-off.`,`Rewards that grow faster than sinks, producing late-game surplus and pointless choices.`,`Monetization currencies bleeding into the design economy and distorting it.`],
    good:[`Players hesitate over purchases at every stage.`,`Players can explain why they saved or spent.`],
    bad:[`Players hoard because nothing is worth buying, or spend without thinking because everything is affordable.`] },
  how:[`Draw the flow diagram: resources as nodes, sources and sinks as edges with rates.`,`Simulate the economy across the intended playtime (spreadsheet or script). Find where a resource goes to surplus or starvation.`,`Merge currencies that do not create separate decisions.`,`Playtest with logging: track balances over time per player. Compare to the simulation.`,`Try one pricing rule across a whole catalogue before hand-tuning items: Cookie Clicker raises every building’s price by 15% per copy owned, and that single rule paces twenty buildings across hours of play.`],
  ai:{ yes:[`Build the flow model and simulate it across playtime and player skill.`,`Find runaway loops and dead resources.`,`Propose sink designs for surplus and source tuning for starvation.`,`Compare telemetry to model predictions.`],
       no:[`Decide how scarce the game should feel. That is an experience call.`,`Decide monetisation policy.`] },
  prompts:[{l:'Economy simulation',p:`Here is our economy: resources, sources with rates, sinks with costs, converters: [SPEC]. Write a simulation over [N] hours of play for a cautious, an average and an aggressive spender. Report balance curves, the hour at which each resource reaches surplus (more than 3x the largest sink) or starvation (cannot afford the smallest sink for more than 10 minutes), and the decisions that collapse as a result. Propose the smallest rate or cost changes that keep every resource decision live through hour [N].`}],
  verify:[`Does the simulation match observed telemetry at the points you have data for?`,`Did it model player behaviour, or assume optimal play?`],
  test:[`Log balances over time. Where does a resource become irrelevant?`,`Ask players what they are saving for. No answer means no sink.`,`Do players understand exchange rates? Ask them to estimate a cost.`],
  rel:[['systemic-design','Economy is systemic design applied to quantities.'],['progression','Progression is usually paid for through the economy.'],['business-model','Monetization pressures the design economy.'],['decisions','Spending is the most frequent decision in many games.']] });
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
  what:`How the player’s situation changes over the long horizon: power (stronger), horizontal (different options), mastery (better at the same thing), unlocks (access), narrative (the story advances). Progression schedules anticipation and gates content. The failure mode is progression that only changes numbers while the decisions stay the same. Cookie Clicker is the edge case: most of its twenty buildings change only a production rate, yet players have kept at it for hundreds of hours, because there the growing number itself is the promise rather than a stand-in for new decisions.`,
  why:[`Progression is the long-horizon goal and the reason to return. It is also where “grind” lives.`,`Power progression without new decisions makes the game easier and less interesting at the same time.`,`Unlock pacing decides whether the player feels the game is opening up or holding out on them.`],
  think:{ q:[`For each progression step: what can the player DO now that they could not before? Not what number changed.`,`Does progression unlock new decisions, or remove them (by making one option dominant)?`,`Does the player see the next step and want it? Anticipation needs visibility.`,`How much of the game is behind a wall the player does not yet understand the point of?`],
    trade:[`Power progression is legible and hollow. Horizontal progression is rich and hard to feel.`,`Fast unlocks feel generous and exhaust content. Slow unlocks feel like a grind and extend life.`],
    traps:[`Stat inflation as a substitute for new situations.`,`Gating the interesting systems behind hours of the boring ones.`,`Reward schedules copied from other games without their loop.`],
    good:[`Players describe unlocks in terms of what they can do: “now I can...” `,`Players plan towards a specific unlock.`],
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

T('difficulty',{ d:'systems', t:'Difficulty and calibration', tag:'Difficulty is the relationship between what the game demands and what the player can do right now.',
  what:`The calibration of challenge against player skill over time: the curve, its local spikes and rests, the punishment and recovery around failure, and the tools for adapting (settings, assists, dynamic adjustment, player-steered difficulty). Csikszentmihalyi’s flow model (challenge matching skill) is the usual frame. Jenova Chen argued for letting players steer their own difficulty through play rather than hidden adjustment. Both are heuristics, and some games deliberately live outside the flow band.`,
  why:[`Too hard too early churns players before they have learned enough to see their own progress. Too easy for too long leaves nothing to learn, which players report as boredom.`,`“Unfair” is a specific complaint with specific causes. Treating it as “too hard” leads to the wrong fix.`,`Difficulty is felt through clarity: a hard challenge with legible rules feels fair, an easy one with hidden rules feels cheap.`],
  think:{ q:[`What exactly is hard here: execution, reading, knowledge, information overload, or randomness?`,`When the player fails, do they know why and believe they could do better?`,`Where does the curve spike? Is the spike deliberate?`,`Can the player adjust the challenge through choices in play, not just a menu?`],
    trade:[`Hidden dynamic difficulty keeps flow and undermines the feeling of earned mastery when discovered.`,`Difficulty settings include more players and fragment the intended experience.`],
    traps:[`Tuning difficulty for the team, who are experts.`,`Fixing “unfair” by making it easier when the problem was unreadable telegraphs.`,`Making the game harder by adding health instead of adding demands on skill.`],
    good:[`Players fail and immediately retry with a new idea.`,`Players of different skill describe the game as challenging but fair.`],
    bad:[`Players describe it as “unfair”, “cheap”, “bullet sponge” or “trivial”.`] },
  how:[`Use the Unfairness Diagnostic when players complain: classify the cause before changing numbers.`,`Plot the intended difficulty curve. Overlay observed failure rates per section from playtests.`,`Fix spikes by teaching or telegraphing before reducing demands.`,`Offer player-steered difficulty (optional risk, routes, tools) before menu settings: Mega Man 11 lets a player on critical health fire both Double Gears once, at the price of being left one hit from death, beside four ordinary presets.`,`Test with the target player, never only with the team.`,`Track time to quit and time to pass as two numbers, not one difficulty score: King does this for Candy Crush Saga levels, on the view that a hard level can still be fun if it is short, and used the split to find and rebuild its hundred least fun levels.`],
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

T('builds-and-loadouts',{ d:'systems', t:'Builds, loadouts and constraints', tag:'Build diversity comes from constraints that force different players to solve the same problem differently.',
  what:`Systems where the player composes a set of capabilities before or during play: classes, decks, loadouts, skill trees, party composition. Their value is expression and horizontal progression. Their failure is convergence, where one build dominates and the others are traps.`,
  why:[`Builds are how systemic games personalize themselves. They turn one game into many.`,`Convergence is inevitable without constraints and counters. The community will find the optimum within days.`,`A build that is a trap (looks viable, is not) teaches players not to trust the system.`],
  think:{ q:[`What constraint forces a choice? Slots, points, mutual exclusion, opportunity cost?`,`What does each build do that the others cannot? Not “does more damage”: what situation does it own?`,`What counters each build? If nothing, it will dominate.`,`Can the player see what a build will feel like before committing?`],
    trade:[`Hard commitment (permanent choices) raises weight and punishes experimentation.`,`Free respec raises experimentation and removes weight.`],
    traps:[`Balancing by making builds equivalent, which removes the reason to choose.`,`Adding options without adding constraints.`,`Trap builds left in for “variety”.`],
    good:[`Players argue about builds and disagree.`,`Different builds are visible in how people play.`],
    bad:[`One build in every guide. One option picked several times more often than an even share would predict.`] },
  how:[`Define the constraint that forces choice. If there is none, add one before adding options.`,`For each build, write the situation it owns and the situation that punishes it.`,`Simulate or reason about dominant combinations. Fix with counters or costs, not with equalisation.`,`Log pick rates and win rates in playtests. Investigate any option picked far above its even share (with eight builds an even share is 12.5 percent) or winning far from the average.`],
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
  what:`Some games hold their entire sense of advancement in what the player has come to understand, rather than in stats, items or unlockable content. Outer Wilds gives the player no permanent power gain at all: every loop resets your ship, your tools and your abilities to the same starting state, and the only thing that persists between loops is what you now know about the solar system, which is exactly what lets you reach further each time. The Witness teaches its entire visual grammar through wordless line puzzles on its island, so progress is measured in which rules the player has internalised, not in a level counter. Return of the Obra Dinn’s only “stat” is the set of fates the player has correctly and permanently identified; there is no combat, no inventory, no experience points, just an expanding, corroborated understanding of what happened aboard the ship. Myst, one of the earliest and most commercially successful examples, gates its entire world behind puzzles whose only reward is the information needed to open the next area, with no health, currency or equipment anywhere in the game. Tunic goes further by making the knowledge itself diegetic: pages of an in-game instruction booklet, written in an invented language, are found scattered through the world, and reading and cross-referencing them is how the player learns the actual rules of the game they are playing, including rules a conventional game would teach in a tutorial. Designing for this means building gates that are a comprehension check, not a lock and key: a door that opens once the player has understood a code, not once they have found a keycard. It also means accepting two costs that traditional progression does not carry: replay value is structurally limited, because the second playthrough cannot recreate the state of not yet knowing, and the entire design is fragile to spoilers in a way a stat-based unlock is not, since a single sentence overheard online can permanently remove the only reward the game had left to give.`,
  why:[`Knowledge-based progression can make growth feel more personal than a stat does, because the player, not a number on a character sheet, is now visibly more capable.`,`It solves a problem stat progression cannot: a game with knowledge gates can be difficult from the first minute to the last without ever needing to be “unfair,” because the same challenge becomes solvable once the player understands it, with no numeric buff required.`,`It creates unusual and severe risks around replay and spoilers that a conventional designer moving into this space needs to plan for explicitly, not discover after launch.`],
  think:{ q:[`For this gate, is the thing standing in the player’s way a lock the game can hand a key for, or a piece of understanding only the player’s own mind can produce?`,`If a friend told the player the answer outright, would the game still be worth finishing? If the answer is no, be honest that the entire value is concentrated in first-time discovery.`,`Is the knowledge diegetic (a manual page, an environmental clue, an overheard fact) or purely a designer’s assumption that the player will eventually “just get it”?`,`What happens to a player who takes careful written notes versus one who does not? Does the game assume note-taking, or does it also work for memory alone?`,`How much of the game’s total value would a single spoiled sentence remove, and have you planned around that at all (marketing, streaming, word of mouth)?`],
    trade:[`Knowledge gates make cheating or being spoiled uniquely destructive compared with a stat-locked gate, which a spoiler barely dents.`,`Diegetic knowledge (an in-world manual, environmental clues) is more immersive but harder to guarantee every player finds and reads, compared with an explicit tutorial that is impossible to miss.`],
    traps:[`Building a knowledge gate that is only passable by note-taking or an external wiki, mistaking “the designer knows the answer” for “the game gave the player enough to find it.”`,`Assuming a knowledge-based game needs no progression pacing at all, and dumping every rule on the player at once with nothing held back to discover later.`,`Treating a knowledge gate as equivalent to any other lock-and-key gate when writing marketing or a trailer, and accidentally spoiling the exact fact the whole design depends on.`],
    good:[`Players describe the moment of understanding unprompted, months later, as the thing they remember about the game, rather than a stat or an item.`],
    bad:[`Players describe being stuck as “I don’t know where to look” rather than “I don’t understand what I’ve already found,” which usually means the needed information was never delivered.`] },
  how:[`List every gate in the game and classify each one honestly: is it unlocked by an item or stat, or by the player understanding something? Be suspicious of gates you have quietly been treating as the second kind that are really the first with extra narration.`,`For every knowledge gate, name the exact source of the fact needed to pass it, and check that a player who found that source would recognise its relevance later.`,`Design the game’s note-taking or memory demands on purpose: either build in-game tools to record what the player learns, or keep the total volume of tracked facts small enough to hold in a real player’s head.`,`Playtest blind, watch for the specific language of being stuck, and separately plan a spoiler-containment strategy for marketing and community content before launch, not after.`],
  ai:{ yes:[`Audit a list of the game’s gates and classify each as a lock-and-key gate or a genuine comprehension gate, to catch ones mislabelled by the design team.`,`Trace, for each knowledge gate, whether the fact it depends on was delivered somewhere reachable and check the delivery point against a described player path.`,`Draft an in-game note-taking or journal tool’s feature set for a described set of facts the player must retain.`],
       no:[`Decide whether the moment of realisation itself feels rewarding. That is a human, first-time reaction that testing with someone who already knows the answer cannot recover.`] },
  prompts:[{l:'Comprehension-gate audit',p:`Here is a list of gates in our game and, for each, what we believe unlocks it: [GATES]. For each one, classify it as lock-and-key (an item, a stat, a currency) or a genuine comprehension gate (understanding a fact or rule). For every comprehension gate, name the exact place in the game where that fact is delivered, and flag any gate where you cannot find a clear delivery point reachable without a wiki. Then estimate, for each comprehension gate, how much of the game’s total value a single spoiled sentence about it would remove, and flag the highest-risk ones.`}],
  verify:[`Did it trace each fact to a specific, reachable delivery point in the game, or assume the player would “figure it out”?`,`Is the spoiler-risk estimate grounded in what the gate withholds, or a generic warning applied to every gate equally?`],
  test:[`Watch a blind playtester and note whether being stuck is described as “I don’t know where to look” (a delivery problem) or “I don’t understand what I found” (a genuine comprehension gap, which is working as intended for a while).`,`Ask players, well after finishing, what they remember most. A knowledge-based design succeeds if the answer is a moment of realisation rather than a specific item or stat.`,`Check whether a player who took no notes at all can still eventually pass every gate, unless the game explicitly demands note-taking as part of its fantasy.`],
  rel:[['progression','This is one whole category of progression alongside power, horizontal, mastery and unlock steps.'],['mastery-discovery-expression','Discovery is one of the three core experience dimensions this entire topic is built on.'],['environmental-storytelling','Diegetic knowledge, like Tunic’s manual pages, is usually delivered through the environment itself.'],['difficulty','A comprehension gate can be difficult without ever needing to be numerically unfair.'],['decisions','Reaching the aha moment is itself a decision point: acting on a new piece of understanding for the first time.']] });
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
