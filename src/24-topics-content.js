/* =====================================================================
   CONTENT
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'content', lens:'design', t:'Content', short:'Levels, enemies, items, quests, procedural generation', color:'var(--d-content)',
    sum:`Content multiplies a good system. It does not rescue a bad one. The question is never "how much content" but "what new decision or experience does this piece create that the existing pieces do not?"`,
    links:[['level','Level design is content that arranges every other kind of content in space and time.'],['systems','Every piece of content should exercise a system in a way the others do not.'],['narrative','Quests, characters and events carry story into the systems.'],['ai','Cheap generation makes content the most dangerous place for AI to help.']] });

T('content-multiplies',{ d:'content', t:'Content multiplies systems', tag:'Content multiplies a good system. It does not rescue a bad one. Know which problem you have.',
  what:`Content is the set of instances a game runs its systems on: levels, enemies, items, quests, characters, events. Each piece of content is a set of parameters fed to the systems. Good content creates a situation the systems have not yet produced. Redundant content produces the same decisions with a new coat of paint.`,
  why:[`Content is the most expensive part of most games, and the part AI makes cheapest to produce badly.`,`When a game is boring, adding content is the most common response and the least often correct one.`,`Every piece of content that does not create a new decision teaches the player that content is skippable.`],
  think:{ q:[`What decision or experience does this piece create that no existing piece does?`,`Would improving the underlying interaction do more for the game than this piece?`,`How fast will players consume this? What is left when it is consumed?`,`Is this content a loop (repeatable) or an arc (consumed once)? Dan Cook's distinction: budget arcs carefully.`],
    trade:[`More content extends play time and dilutes the average quality of a piece.`,`Improving the system improves all content and delays the shipping of any.`],
    traps:[`Content as compensation: adding levels because the loop is thin.`,`Measuring the game by hours of content.`,`Letting AI generate variations before the system they vary is validated.`],
    good:[`Players remember individual pieces of content by what they made them do.`,`Cutting a piece would remove a decision, not just minutes.`],
    bad:[`Players skip content, or describe it as "more of the same".`] },
  how:[`Use the Content vs Mechanic decision tree before authoring: is the loop voluntarily replayed? Does each new piece create a new decision?`,`For a proposed piece, write the situation it creates in one sentence. If an existing piece creates the same situation, merge or drop it.`,`Sort content into loops and arcs. Budget arcs against how quickly they will be consumed.`,`Only after the bare system is replayed, multiply it. Then let AI help with variation, under a human filter for distinctness.`],
  ai:{ yes:[`Audit a content list for redundancy: pieces that produce the same situation.`,`Generate variations once the system is validated and the distinctness criteria are explicit.`,`Estimate consumption rate of content.`],
       no:[`Decide to add content in place of fixing the loop.`,`Judge whether a piece is "interesting". Distinctness of the decision is checkable. Interest is observed.`] },
  prompts:[{l:'Content redundancy audit',p:`Here is our content list with the parameters each piece sets: [LIST]. Group pieces that produce the same player situation and decision. For each group, keep the strongest member and state what the others add beyond it, if anything. Then list the situations the systems can produce that no content currently exercises. Do not generate new content yet.`}],
  verify:[`Did it treat cosmetic differences as distinct situations?`,`Did it propose more content when the analysis showed redundancy?`],
  test:[`Which content do players skip or rush?`,`Ask players to recall three pieces of content. What do they remember: what it looked like or what it made them do?`,`Do players replay the loop with no new content?`],
  rel:[['core-loop','Content multiplies the loop. Validate the loop first.'],['systemic-design','Systemic depth reduces content needed.'],['procedural-content','Generation is content multiplication at scale, with the same risk.'],['items-weapons-abilities','Items are the most-inflated content type.'],['scope-control','Content is where scope explodes.']] });
TECH('content-multiplies',[
  {n:'New-decision audit', how:`For every new content piece, state the new decision or experience it creates that existing pieces do not.`, fit:`Preventing content spam.`, cost:`New pieces may be justified by texture, not novelty.`, alt:`Differentiate the key beats. Vary the connective tissue.`},
  {n:'Parameterize, do not multiply rules', how:`Extend existing systems with parameters (damage, range, behavior) rather than adding new rules per content.`, fit:`Getting variety without combinatorial complexity.`, cost:`Can feel samey if parameters are shallow.`, alt:`A few genuinely new interactions beat many parameters.`}
]);
ENGINE('content-multiplies',{
  godot:{ term:`Content is PackedScenes and Resources referenced by path or uid and pulled in when they are needed. Whether a catalogue costs you anything is decided by preload versus a threaded request, not by how many pieces are in it.`,
    api:['preload() versus load()','ResourceLoader.load_threaded_request()','ResourceLoader.load_threaded_get_status() / get()','ResourceUID and uid:// paths','PackedScene.instantiate()','Node.queue_free()'],
    snippet:`func want(paths: Array[String]) -> void:
\tfor p in paths:
\t\tResourceLoader.load_threaded_request(p)   # no frame spike, no giant preload

func take(path: String) -> PackedScene:
\twhile ResourceLoader.load_threaded_get_status(path) == \\
\t\t\tResourceLoader.THREAD_LOAD_IN_PROGRESS:
\t\tawait get_tree().process_frame
\treturn ResourceLoader.load_threaded_get(path)`,
    pitfall:`Reaching for preload() on the content catalogue. preload resolves when the script is parsed, so every piece it names is pulled into memory along with the script that mentions it, and the loading screen grows with the content list whether or not a player ever meets those pieces. Use it for the handful of things needed immediately.`,
    map:`A Godot threaded resource request is a Unity Addressables async load, and a uid:// path is an AssetReference.` },
  unity:{ term:`Content is prefabs and ScriptableObjects, and Addressables is what keeps the catalogue out of the initial load. One direct reference undoes that for the asset it points at, quietly and permanently.`,
    api:['AssetReference / AssetReferenceGameObject','Addressables.LoadAssetAsync<T>() / InstantiateAsync()','AsyncOperationHandle<T>','Addressables.ReleaseInstance()','Resources.Load (and why to avoid it)','SceneManager.LoadSceneAsync additive'],
    snippet:`public class ContentLoader : MonoBehaviour {
    [SerializeField] AssetReferenceGameObject[] wanted;   // never direct prefab refs
    readonly List<AsyncOperationHandle<GameObject>> live = new();

    public async Task<GameObject> Spawn(int i, Vector3 at) {
        var h = wanted[i].InstantiateAsync(at, Quaternion.identity);
        live.Add(h);
        return await h.Task;
    }
    void OnDestroy() {
        foreach (var h in live) Addressables.ReleaseInstance(h);   // or it never unloads
    }
}`,
    pitfall:`Keeping one direct prefab reference to an asset that is also Addressable. The direct reference pulls that asset and its whole dependency tree into the build and into memory at scene load, and it is duplicated into the bundle as well, so the catalogue costs twice and the on-demand loading you built does nothing for that piece.`,
    map:`A Unity AssetReference is a Godot uid:// path loaded threaded, and ReleaseInstance is queue_free plus letting the cache drop it.` } });
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
DIAGRAM('content-multiplies', { kind:'quad', title:'Content multiplies the system you already have',
  x:'Content volume', y:'System quality',
  points:[{t:'Rich, varied play', x:0.82, y:0.9},{t:'More of the same', x:0.8, y:0.18},{t:'Thin but promising', x:0.18, y:0.7},{t:'Nothing to multiply', x:0.16, y:0.16}],
  q:['Add content now','Content multiplies','Fix the system first','Content hides the problem'] });

T('encounters-and-enemies',{ d:'content', t:'Encounters and enemies', tag:'An enemy is a question the game asks. Design the question before the monster.',
  what:`Enemies, hazards and opponents are the most common content in action and strategy games. Each should pose a distinct question to the player (how do I get behind this? what do I prioritize? when do I commit?) that requires a distinct answer from the player's verb set. An encounter is a composition of these questions in space and time.`,
  why:[`Enemies are the primary way most games create decisions moment to moment.`,`An enemy that asks the same question as another with more health is not content. It is a slower version of the same fight.`,`Encounter composition, not enemy count, creates the interesting situations.`],
  think:{ q:[`What question does this enemy ask? What player verb answers it? Is there more than one valid answer?`,`How does it change the question when combined with another enemy?`,`How does the player read its intent: silhouette, telegraph, sound?`,`What does the arena contribute: cover, height, hazards, escape?`],
    trade:[`Highly specialized enemies create sharp questions and can feel puzzle-like and rigid.`,`Generalist enemies compose flexibly and blur together.`],
    traps:[`Stat variants (elite, champion) presented as new enemies.`,`Encounters designed as enemy counts rather than question combinations.`,`Enemies whose telegraphs are unreadable at the intended camera distance.`],
    good:[`Players name enemies by behavior ("the one that flanks").`,`Players change tactics when a new enemy appears.`],
    bad:[`Players fight everything the same way.`] },
  how:[`For each enemy, write the question it asks and the verbs that answer it. Remove or redesign any whose question duplicates another.`,`Build a compatibility matrix: which pairs create a new combined question?`,`Design encounters as sequences of questions with an intended tactical shift.`,`Check readability in the actual camera and lighting. Then test whether players change behavior per enemy type.`],
  ai:{ yes:[`Audit an enemy roster for duplicated questions.`,`Generate combination matrices and predict tactical shifts.`,`Draft encounter sequences from a target question order and difficulty position.`],
       no:[`Decide what the game is about tactically. The verb set is the designer's.`] },
  prompts:[{l:'Enemy question audit',p:`Here is our enemy roster with behaviors and stats: [ROSTER] and the player verbs: [VERBS]. For each enemy, state the question it asks, the verbs that answer it, and whether another enemy asks the same question. Build a pairwise matrix of combinations that create a genuinely new question. Identify the 3 weakest enemies (duplicated question, single answer) and propose a behavior change, not a stat change, for each.`}],
  verify:[`Did it accept stat differences as new questions?`,`Are the combinations grounded in behavior interactions, or in variety for its own sake?`],
  test:[`Do players change tactics per enemy type? Record and compare.`,`Ask players to describe an enemy. Behavior words pass. Appearance words fail.`,`Which encounters produce the most tactical variety across players?`],
  rel:[['content-multiplies','Enemies are the most common content type.'],['encounter-design','Encounters compose enemies in space.'],['decisions','Each enemy should create a decision.'],['visual-language','Readability of intent is a visual language problem.']] });
TECH('encounters-and-enemies',[
  {n:'Compatibility matrix', how:`For each enemy pair, define whether the combination creates a new question, and prune pairs that do not.`, fit:`Designing encounter variety from a small enemy set.`, cost:`Manual. Grows with the roster.`, alt:`Tag enemies by question asked, then compose from tags.`},
  {n:'Encounter budget / threat points', how:`Assign each enemy a cost. Compose encounters to a target budget that scales with player power.`, fit:`Pacing difficulty across a long game.`, cost:`Budgets ignore synergy. Two cheap enemies can be deadlier than their sum.`, alt:`Use budgets as a first pass, then hand-tune set pieces.`},
  {n:'Wave and phase composition', how:`Structure an encounter as timed waves or boss phases, each with an intended tactical shift.`, fit:`Escalation, pacing and boss design.`, cost:`Repetitive if waves are symmetric. Needs variation and recovery windows.`, alt:`Intentional rest beats between peaks (see Pacing).`}
]);
ENGINE('encounters-and-enemies',{
  godot:{ term:`An enemy is a scene with a stats Resource, a behaviour node and a navigation agent. Composing an encounter is placing those scenes with the questions in mind, and the thing that will bite you is the navigation map not being ready yet.`,
    api:['PackedScene.instantiate() / Marker3D spawn points','NavigationAgent3D.target_position / get_next_path_position()','NavigationRegion3D baking','RayCast3D for line of sight','Resource enemy definitions','await get_tree().physics_frame'],
    snippet:`func spawn_wave(defs: Array[EnemyDef], points: Array[Marker3D]) -> void:
\tawait get_tree().physics_frame           # the navigation map syncs after one frame
\tfor i in defs.size():
\t\tvar e: Node3D = defs[i].scene.instantiate()
\t\te.stats = defs[i]                    # the question this one asks
\t\tadd_child(e)
\t\te.global_position = points[i % points.size()].global_position

func _physics_process(_d: float) -> void:
\tagent.target_position = player.global_position
\tvar step := agent.get_next_path_position() - global_position
\tvelocity = step.normalized() * stats.speed
\tmove_and_slide()`,
    pitfall:`Setting target_position on a NavigationAgent3D in _ready. The navigation map is synchronised at the end of the first physics frame, so the agent has no map, is_navigation_finished() returns true and the enemy stands still forever while looking perfectly configured in the inspector. Await one physics frame after spawning.`,
    map:`NavigationAgent3D is Unity's NavMeshAgent, and baking a NavigationRegion3D is baking a NavMeshSurface.` },
  unity:{ term:`An enemy is a prefab with a stats ScriptableObject and a NavMeshAgent. Encounter composition is placement plus spawn logic, and the silent failure is an agent that never landed on the NavMesh.`,
    api:['NavMeshAgent.SetDestination() / isOnNavMesh','NavMesh.SamplePosition()','NavMeshSurface.BuildNavMesh()','ScriptableObject enemy stats','Physics.Linecast() for line of sight','Instantiate(prefab, pos, rot)'],
    snippet:`public class Spawner : MonoBehaviour {
    [SerializeField] EnemyDef[] defs;
    [SerializeField] Transform[] points;

    public void SpawnWave() {
        for (int i = 0; i < defs.Length; i++) {
            var p = points[i % points.Length].position;
            if (!NavMesh.SamplePosition(p, out var hit, 2f, NavMesh.AllAreas)) continue;
            var e = Instantiate(defs[i].prefab, hit.position, Quaternion.identity);
            e.GetComponent<Enemy>().Stats = defs[i];   // the question it asks
        }
    }
}`,
    pitfall:`Calling SetDestination on an agent that is not on the NavMesh. It returns false, logs nothing useful, and the enemy simply stands there, so a placement bug is investigated as a behaviour bug for a day. Sample the NavMesh before spawning, and check isOnNavMesh before any command the behaviour issues.`,
    map:`A Unity NavMeshAgent is a NavigationAgent3D, and NavMesh.SamplePosition is NavigationServer3D.map_get_closest_point.` } });
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

T('items-weapons-abilities',{ d:'content', t:'Items, weapons and abilities', tag:'Every item should change what the player considers doing, not just how fast they do it.',
  what:`Player-side content: the tools, powers and gear that alter the player's verb set or its parameters. The best items open new approaches or change priorities. The weakest change a number. Item design is where content, systems and expression meet.`,
  why:[`Items are the most common reward in most genres. If they are boring, rewards are boring.`,`Items with new verbs create build diversity and emergent strategies. Items with bigger numbers create convergence.`,`Item count is the easiest scope to inflate and the easiest for AI to spam.`],
  think:{ q:[`Does this item change what I consider doing, or only the outcome of what I was going to do anyway?`,`What does it interact with? A new verb that touches no system is a novelty.`,`What situation makes it the right choice? What situation makes it wrong?`,`Would the player recognize it as distinct from the last one after one use?`],
    trade:[`Verb items add depth and teaching cost. Stat items are instantly legible and forgettable.`,`Many items give collection pleasure and dilute each item.`],
    traps:[`Tier systems where higher tiers are strictly better, making earlier items trash.`,`Randomized affixes as a substitute for designed niches.`],
    good:[`Players have favorite items and can explain why.`,`Players switch items by situation.`],
    bad:[`Players equip the highest number and never look again.`] },
  how:[`Classify items: new verb, changed priority, changed parameter. Set a ratio you want and cut toward it.`,`For each item, write the situation it owns and the one that punishes it.`,`Test whether players recognize distinctness after one use.`,`Generate variations only within niches you have defined. Filter by distinctness of the decision, not by novelty of the name.`],
  ai:{ yes:[`Classify an item list by type and flag pure stat items.`,`Fill defined niches with candidates, given explicit distinctness criteria.`,`Simulate item choice across situations to find dominant items.`],
       no:[`Decide the ratio of verb items to stat items. That is a feel and audience call.`,`Generate items before the niches are defined.`] },
  prompts:[{l:'Item distinctness filter',p:`Here are the item niches we have defined (situation owned, situation punished, verb changed): [NICHES]. Generate 3 candidates per niche. For each, state the decision it changes, the system it interacts with, and how a player would recognize it as distinct after one use. Reject your own candidates that only change a number, and say why.`}],
  verify:[`Did it sneak in stat variants dressed as verbs?`,`Would the player perceive the distinctness it claims?`],
  test:[`Log equip choices. Do players switch by situation?`,`Ask players to name a favorite item and why.`,`After one use, can a player say what an item does differently?`],
  rel:[['builds-and-loadouts','Items compose into builds.'],['progression','Items are the most common progression reward.'],['content-multiplies','Item spam is the classic content inflation.'],['systemic-design','Verb items must touch systems.']] });
TECH('items-weapons-abilities',[
  {n:'Stat budget and cost formula', how:`Every item spends a budget across stats. A formula prices the combination so power is comparable.`, fit:`Balanced itemization without hand-tuning every item.`, cost:`Formulas reward min-maxing and can flatten identity.`, alt:`Budget for stats, authors for the feel and the exception.`},
  {n:'Loot tables and roll systems', how:`Weighted tables, rarity tiers, and pity across rolls determine what drops.`, fit:`Reward pacing and the hunt for rare items.`, cost:`Variance feels unfair at the tails. Needs pity or bad-luck protection.`, alt:`Deterministic pity plus weighted randomness.`},
  {n:'Effect composition and stacking rules', how:`Items apply typed effects. Stacking, refresh and exclusivity rules define how they combine.`, fit:`Abilities and affixes that interact.`, cost:`Unbounded combos create exploits and unclear tooltips.`, alt:`Limit simultaneous effect types and expose the math to the player.`}
]);
ENGINE('items-weapons-abilities',{
  godot:{ term:`An item is a Resource, and its tooltip is generated from the same fields the rules read. Two sources of truth for one number is how a balance pass turns into a lie in the UI.`,
    api:['class_name ItemDef extends Resource','@export var mods: Dictionary','StringName constants for stat keys','RichTextLabel.bbcode_enabled / text','Resource.duplicate() per holder','String "%+.2f" formatting'],
    snippet:`class_name ItemDef extends Resource

const REACH := &"reach"                    # constants, never bare strings
@export var label := "Hooked spear"
@export var mods := {REACH: 1.5}

func tooltip() -> String:
\tvar lines := ["[b]%s[/b]" % label]
\tfor key in mods:
\t\tlines.append("%s %+.2f" % [key, mods[key]])   # the numbers the rules read
\treturn "\\n".join(lines)`,
    pitfall:`Keying stat modifiers with bare strings. A typo in a Dictionary lookup returns null in GDScript without raising anything, so the item does nothing and the console says nothing about why. Declare the keys as StringName constants in one place, and let the editor catch the typo at the reference instead of at runtime.`,
    map:`A Godot ItemDef Resource is a Unity item ScriptableObject, and RichTextLabel BBCode is TextMeshPro rich text.` },
  unity:{ term:`Items are ScriptableObject assets and their mutable state is not. The runtime copy is where ammo and cooldown live, and the tooltip is built from the asset so it cannot drift away from the rules.`,
    api:['ScriptableObject / CreateAssetMenu','TMP_Text rich text tags','StringBuilder for generated tooltips','enum stat ids instead of strings','[SerializeReference] effect list','Object.Destroy() on runtime SO copies'],
    snippet:`[CreateAssetMenu(menuName = "Design/Item")]
public class ItemDef : ScriptableObject {
    public string label = "Hooked spear";
    public StatMod[] mods = { new() { stat = StatId.Reach, amount = 1.5f } };

    public string Tooltip() {
        var sb = new StringBuilder($"<b>{label}</b>");
        foreach (var m in mods)
            sb.Append($"<br>{m.stat} {m.amount:+0.00;-0.00}");
        return sb.ToString();                 // the same numbers the rules read
    }
}`,
    pitfall:`Storing ammo or cooldown on the ItemDef asset. In a build every holder of that item shares the value, and in the editor the change is written into the asset and committed by whoever saves next, so one playtest permanently rebalances the item. Runtime state belongs in a plain class, and a runtime copy of an asset must be destroyed or it leaks.`,
    map:`A Unity item ScriptableObject is a Godot ItemDef Resource, and CreateInstance plus Destroy is duplicate() plus dropping the last reference.` } });
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

T('quests-and-events',{ d:'content', t:'Quests, events and structure', tag:'A quest is a goal plus a reason plus a situation. Without the situation it is a checklist.',
  what:`Structured content that gives the player goals with narrative or systemic framing: quests, missions, contracts, events, challenges. Good quests create situations the systems make interesting. Bad quests are errands with text. Events are time-bound quests that change the world state.`,
  why:[`Quests are how many games deliver goals at the session horizon and carry story into play.`,`Quest structure decides whether the player is directed or exploring. Over-direction erases discovery.`,`Quest content is consumed once (an arc). It is the most expensive content per minute of play.`],
  think:{ q:[`What situation does this quest put the player in that free play would not?`,`What decision does it contain? A quest with no choice is a tour.`,`What does completing it change in the world, the character or the player's options?`,`Could the systems generate this situation without a script?`],
    trade:[`Scripted quests deliver reliable story beats and cost the most per minute.`,`Systemic quests scale and feel generic without hand-authored anchors.`],
    traps:[`Kill and fetch quests as the default template.`,`Quest logs that replace the world as the source of goals.`,`Events that only add timers and fear of missing out.`],
    good:[`Players remember quests by what happened, not by the reward.`,`Players take detours because something in the world looked interesting.`],
    bad:[`Players read the objective, not the text, and follow the marker.`] },
  how:[`For each quest, write the situation, the decision, and the world change. Drop or merge any with blanks.`,`Mix authored anchors with systemic goals so the world generates some of its own quests.`,`Put goals in the world (a visible thing to reach) before putting them in the log.`,`Test whether players can describe a quest afterwards without mentioning the reward.`],
  ai:{ yes:[`Audit quest lists for missing situations, decisions and world changes.`,`Generate quest situation variants once the template and criteria are explicit.`,`Draft dialog and flavor after the structure is validated.`],
       no:[`Generate quests before the systems that make situations interesting exist.`,`Decide the balance of authored and systemic content.`] },
  prompts:[{l:'Quest structure audit',p:`Here are our quests: [LIST]. For each: the situation it creates that free play would not, the decision it contains, and the world or character change on completion. Mark blanks. Group quests that share a template. For the most common template, propose 3 structural variants that add a decision, not more text.`}],
  verify:[`Did it fill blanks with flavor instead of structure?`],
  test:[`Ask players to describe a quest they did. Situations and choices pass. Rewards fail.`,`Do players read quest text? Watch.`,`Do players detour from the marker? Where and why?`],
  rel:[['goals-horizons','Quests supply session goals.'],['narrative-pacing','Quests are the main carrier of narrative pacing.'],['content-multiplies','Quests are expensive arcs.'],['environmental-storytelling','Goals placed in the world beat goals in a log.']] });
TECH('quests-and-events',[
  {n:'Quest grammar', how:`Compose quests from reusable verbs (go, fetch, escort, defend, choose) with conditions and rewards.`, fit:`Authoring many quests without a writer per line.`, cost:`Repetitive if the grammar is shallow. Needs twists.`, alt:`Vary structure, not just text.`},
  {n:'Trigger and event design', how:`Define what fires an event, in what order, and what state it leaves behind.`, fit:`Structure, surprise and reactive worlds.`, cost:`Brittle chains. Missed triggers are common bugs.`, alt:`Keep chains short and observable.`},
  {n:'Quest state modelling', how:`Track quest progress and branch outcomes in explicit state so the world can reflect choices.`, fit:`Consequence and world reactivity.`, cost:`State explosion and save/load bugs.`, alt:`Limit concurrent tracked states.`}
]);
ENGINE('quests-and-events',{
  godot:{ term:`Quest state lives on an autoload and the world only raises events into it. Put the state in the scene and every reload resets it, which is how a checkpoint retry hands the player a quest they already finished.`,
    api:['Area3D.body_entered signal','Autoload quest log with a state Dictionary','Resource quest definitions','signal quest_state_changed(id, state)','Node.is_in_group()','get_tree().reload_current_scene()'],
    snippet:`# autoload: Quests
signal quest_state_changed(id: StringName, state: String)
var _state := {}                           # id -> "open" | "done"

func fire(id: StringName) -> void:
\tif _state.get(id) == "done":
\t\treturn                               # triggers re-arm on every scene reload
\t_state[id] = "done"
\tquest_state_changed.emit(id, "done")

# on the trigger node inside the level
func _on_body_entered(body: Node) -> void:
\tif body.is_in_group("player"):
\t\tQuests.fire(quest_id)`,
    pitfall:`Keeping the done flag on the trigger node. reload_current_scene rebuilds the level, the flag returns to false and the quest fires again on the way back through, so a retry after a death replays a scene the player already sat through. Scene nodes are the sensor, the autoload is the memory.`,
    map:`A Godot autoload quest log is a DontDestroyOnLoad quest service, and body_entered is OnTriggerEnter.` },
  unity:{ term:`The same split: a trigger collider raises, a persistent service remembers. Unity adds a wiring trap, because a UnityEvent on a prefab cannot hold a reference to an object that lives in a scene.`,
    api:['Collider.OnTriggerEnter() / isTrigger','ScriptableObject quest definitions','ScriptableObject event channel','UnityEvent Inspector wiring limits','DontDestroyOnLoad quest service','SceneManager.sceneLoaded'],
    snippet:`public class QuestTrigger : MonoBehaviour {
    [SerializeField] QuestDef quest;          // an asset, so a prefab may hold it
    [SerializeField] QuestChannel channel;    // an asset, not a scene object

    void OnTriggerEnter(Collider other) {
        if (!other.CompareTag("Player")) return;
        channel.Raise(quest);                 // the service decides whether it is new
    }
}`,
    pitfall:`Wiring a prefab's UnityEvent to a manager sitting in the scene. Unity cannot serialize a scene reference inside a prefab asset, so the field is None in every instance placed afterwards and the quest fires nothing while the Inspector looks correct in the one scene where it was authored. Route through a ScriptableObject channel, which is an asset and can be referenced from anywhere.`,
    map:`A Unity ScriptableObject channel is a Godot autoload with signals, and OnTriggerEnter is body_entered.` } });
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

T('procedural-content',{ d:'content', t:'Procedural and AI-generated content', tag:'A generator that makes ten thousand unique bowls of oatmeal has made oatmeal.',
  what:`Content produced by rules or models rather than by hand: procedural levels, generated items, AI-written dialog. Kate Compton's "10,000 bowls of oatmeal" names the core problem: mathematically unique outputs that are perceptually identical. The bar is perceptual uniqueness (each piece has character) or at least perceptual differentiation (this one is not the last one).`,
  why:[`Generation is the strongest content multiplier and the easiest way to bury a game in sameness.`,`Players judge content by what it makes them do. A generator must vary the decision, not the decoration.`,`AI text and asset generation makes the oatmeal problem worse: fluent, plausible, and indistinguishable at scale.`],
  think:{ q:[`What does the generator vary that changes the player's decision? If only appearance, it is decoration.`,`What hand-authored anchors give runs readability and memory? Spelunky's room templates are the classic example.`,`How would I detect oatmeal? What is my perceptual distinctness test?`,`What is the generator's failure floor: the worst output it can produce? Players will meet it.`],
    trade:[`More randomness yields more surprise and less mastery and readability.`,`More constraints yield more readability and more sameness.`],
    traps:[`Measuring the generator by combinatorial count.`,`Using AI generation to fill a system that has not been validated by hand.`,`Shipping the generator's floor.`],
    good:[`Players describe individual runs or pieces with specifics.`,`Players learn to read generated content and plan around it.`],
    bad:[`Players say "they all blend together".`] },
  how:[`Hand-author ten pieces first. Find what makes the best ones distinct. Those properties are what the generator must vary.`,`Build the generator to vary decisions, then constrain it with authored anchors.`,`Define a perceptual distinctness test: show players pairs and ask whether they are different and how.`,`Sample the generator's worst outputs deliberately and raise the floor.`],
  ai:{ yes:[`Write and tune generators. Enumerate output spaces. Sample worst cases.`,`Generate candidates within explicit distinctness criteria for a human filter.`,`Score outputs against measurable proxies for distinctness you define.`],
       no:[`Judge perceptual distinctness. Players do that.`,`Generate content for an unvalidated system.`] },
  prompts:[{l:'Generator distinctness review',p:`Here is our generator spec and 20 sample outputs: [SPEC, SAMPLES]. For each pair of similar samples, state what a player would perceive as different and whether that difference changes a decision. Estimate the fraction of outputs a player would call "the same as the last one". Identify the parameters that most change decisions and the ones that only change appearance. Propose 3 authored anchors that would make outputs readable and memorable.`}],
  verify:[`Did it equate parameter variance with perceived difference?`,`Did it sample the floor, or only typical outputs?`],
  test:[`Show players pairs of outputs. Can they tell them apart? How?`,`Ask players to describe the last three runs. Specifics pass.`,`Do players develop reading strategies for generated content?`],
  rel:[['content-multiplies','Generation is content multiplication at scale.'],['agency-and-emergence','Systemic generation is emergence applied to content.'],['ai-failure-modes','Content spam is a named AI failure mode.'],['ai-for-implementation','Generators are strong AI implementation work.'],['ai-generative-assets','Generated assets need a record of where they came from, not only perceptual variety.']] });
TECH('procedural-content',[
  {n:'Noise functions (Perlin/simplex)', how:`Smooth pseudo-random fields shape terrain, texture and placement by sampling a continuous function.`, fit:`Natural-looking terrain, variation, organic distribution.`, cost:`Generic-looking output without authored shaping. Parameters are unintuitive.`, alt:`Layer noise with authored masks and anchors.`},
  {n:'Grammars and L-systems', how:`Rewrite rules expand a structure (plant, dungeon, building) from a seed string.`, fit:`Structured, nested or organic forms with authorable rules.`, cost:`Hard to control global properties. Can produce same-feeling output.`, alt:`Constrain with templates and post-checks.`},
  {n:'Constraint solving / Wave Function Collapse', how:`Place pieces under local adjacency constraints, backtracking when contradictions arise.`, fit:`Tile, room and layout generation where local rules matter.`, cost:`Can fail or be slow. Needs good tilesets and a fallback.`, alt:`Add a generation budget and a hand-made fallback level.`},
  {n:'Search-based PCG (generate and test)', how:`Generate candidates and score them against a playability/fun evaluation, keeping the best.`, fit:`When playability constraints matter (reachability, challenge, pacing).`, cost:`Compute cost. The evaluator is the hard part and must encode real play quality.`, alt:`Cheap evaluators plus deterministic seeds you can reproduce and inspect.`}
]);
ENGINE('procedural-content',{
  godot:{ term:`A generator is a seeded function plus authored anchors. Generating on the main thread freezes the frame, and a worker thread may not touch the scene tree, so the split is data on the thread and nodes on the main thread.`,
    api:['RandomNumberGenerator with the run seed','FastNoiseLite.seed / get_noise_2d()','WorkerThreadPool.add_task() / wait_for_task_completion()','Node.call_deferred("add_child", node)','PackedScene room templates','TileMapLayer.set_cell()'],
    snippet:`func generate(run_seed: int) -> void:
\tvar id := WorkerThreadPool.add_task(_build_plan.bind(run_seed))
\tWorkerThreadPool.wait_for_task_completion(id)
\tfor room in _plan:                       # scene tree work is main thread only
\t\tvar node: Node = ROOM_TEMPLATES[room.kind].instantiate()
\t\tadd_child(node)
\t\tnode.position = room.position

func _build_plan(run_seed: int) -> void:     # pure data: no nodes, no get_tree()
\tvar rng := RandomNumberGenerator.new()
\trng.seed = run_seed
\tvar noise := FastNoiseLite.new()
\tnoise.seed = run_seed                    # every source takes the same run seed
\t_plan = _layout(rng, noise)`,
    pitfall:`Touching the scene tree from the worker task. Node creation, add_child and get_tree are not thread safe in Godot, and the failure is not a clean exception but a crash minutes later inside the renderer. Build plain data on the thread and instantiate on the main thread, and seed every generator you use, each FastNoiseLite included, or the run is not reproducible.`,
    map:`WorkerThreadPool is Unity's Job System or a Task, and FastNoiseLite is Mathf.PerlinNoise with a seeded offset.` },
  unity:{ term:`The same split, enforced by the same rule: the Unity API is main thread only. The extra trap is geometry, because a mesh built at runtime keeps whatever bounds it was handed and gets culled when they are wrong.`,
    api:['Mesh.RecalculateBounds() / RecalculateNormals()','Unity.Mathematics.Random (non-zero seed)','Mathf.PerlinNoise()','Task.Run() for the plan only','Instantiate() on the main thread','NavMeshSurface.BuildNavMesh() after generation'],
    snippet:`public class Generator : MonoBehaviour {
    [SerializeField] GameObject[] roomTemplates;
    [SerializeField] NavMeshSurface surface;
    [SerializeField] Mesh generated;

    public async void Generate(uint runSeed) {
        var rng = new Unity.Mathematics.Random(runSeed == 0u ? 1u : runSeed);
        var plan = await Task.Run(() => BuildPlan(rng));   // data only, no Unity API
        foreach (var room in plan)
            Instantiate(roomTemplates[room.kind], room.position, Quaternion.identity);
        generated.RecalculateBounds();        // stale bounds are culled invisibly
        surface.BuildNavMesh();
    }
}`,
    pitfall:`Building a mesh at runtime and never calling RecalculateBounds. The mesh keeps the bounds it was created with, so the renderer culls it as soon as the camera looks from an angle those stale bounds exclude, and the level appears to have holes that vanish when you walk closer. Unity.Mathematics.Random also rejects a seed of zero, which is exactly the seed a fresh save hands it.`,
    map:`A Unity Task plus Instantiate on the main thread is WorkerThreadPool plus call_deferred, and RecalculateBounds is the AABB update on a generated mesh.` } });
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
