/* =====================================================================
   CONTENT
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'content', lens:'design', t:'Content', short:'Levels, enemies, items, quests, procedural generation', color:'var(--d-content)',
    sum:`Content multiplies a good system. It does not rescue a bad one. The question is never “how much content” but “what new decision or experience does this piece create that the existing pieces do not?”`,
    links:[['level','Level design is content that arranges every other kind of content in space and time.'],['systems','Every piece of content should exercise a system in a way the others do not.'],['narrative','Quests, characters and events carry story into the systems.'],['ai','Cheap generation makes content the most dangerous place for AI to help.']] });

T('content-multiplies',{ d:'content', t:'Content multiplies systems', tag:'Content multiplies a good system. It does not rescue a bad one. Know which problem you have.',
  what:`Content is the set of instances a game runs its systems on: levels, enemies, items, quests, characters, events. Slay the Spire’s cards are content run on the same deck and energy rules, and a new card earns its place only if it makes the player decide something they did not decide before. Each piece of content is a set of parameters fed to the systems. Good content creates a situation the systems have not yet produced. Redundant content produces the same decisions with a new coat of paint.`,
  why:[`Content is the most expensive part of most games, and the part AI makes cheapest to produce badly.`,`When a game is boring, adding content is the most common response and the least often correct one.`,`Every piece of content that does not create a new decision teaches the player that content is skippable.`],
  think:{ q:[`What decision or experience does this piece create that no existing piece does?`,`Would improving the underlying interaction do more for the game than this piece?`,`How fast will players consume this? What is left when it is consumed?`,`Is this content a loop (repeatable) or an arc (consumed once)? Dan Cook’s distinction: budget arcs carefully.`],
    trade:[`More content extends play time and dilutes the average quality of a piece.`,`Improving the system improves all content and delays the shipping of any.`],
    traps:[`Content as compensation: adding levels because the loop is thin.`,`Measuring the game by hours of content.`,`Letting AI generate variations before the system they vary is validated.`],
    good:[`Players remember individual pieces of content by what they made them do.`,`Cutting a piece would remove a decision, not just minutes.`,`Players who finish a story start it again as a different character to learn a new toolkit, as Dynasty Warriors players do across a roster of more than 80 officers.`],
    bad:[`Players skip content, or describe it as “more of the same”.`] },
  how:[`Use the Content vs Mechanic decision tree before authoring: is the loop voluntarily replayed? Does each new piece create a new decision?`,`For a proposed piece, write the situation it creates in one sentence. If an existing piece creates the same situation, merge or drop it.`,`Sort content into loops and arcs. Budget arcs against how quickly they will be consumed.`,`Only after the bare system is replayed, multiply it. Then let AI help with variation, under a human filter for distinctness.`],
  ai:{ yes:[`Audit a content list for redundancy: pieces that produce the same situation.`,`Generate variations once the system is validated and the distinctness criteria are explicit.`,`Estimate consumption rate of content.`],
       no:[`Decide to add content in place of fixing the loop.`,`Judge whether a piece is “interesting”. Distinctness of the decision is checkable. Interest is observed.`] },
  prompts:[{l:'Content redundancy audit',p:`Here is our content list with the parameters each piece sets: [LIST]. Group pieces that produce the same player situation and decision. For each group, keep the strongest member and state what the others add beyond it, if anything. Then list the situations the systems can produce that no content currently exercises. Do not generate new content yet.`}],
  verify:[`Did it treat cosmetic differences as distinct situations?`,`Did it propose more content when the analysis showed redundancy?`],
  test:[`Which content do players skip or rush?`,`Ask players to recall three pieces of content. What do they remember: what it looked like or what it made them do?`,`Do players replay the loop with no new content?`],
  rel:[['power-creep-and-content-growth','Each release multiplies content, and if every addition is a little stronger, the older content stops being worth choosing.'],['core-loop','Content multiplies the loop. Validate the loop first.'],['systemic-design','Systemic depth reduces content needed.'],['procedural-content','Generation is content multiplication at scale, with the same risk.'],['items-weapons-abilities','Items are the most-inflated content type.'],['scope-control','Content is where scope explodes.']] });
TECH('content-multiplies',[
  {n:'New-decision audit', how:`For every new content piece, state the new decision or experience it creates that existing pieces do not.`, fit:`Preventing content spam.`, cost:`New pieces may be justified by texture, not novelty.`, alt:`Differentiate the key beats. Vary the connective tissue.`},
  {n:'Parameterize, do not multiply rules', how:`Extend existing systems with parameters (damage, range, behavior) rather than adding new rules per content.`, fit:`Getting variety without combinatorial complexity.`, cost:`Can feel samey if parameters are shallow.`, alt:`A few new interactions beat many parameters.`}
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
    { q:`What does it mean to say content “multiplies” a system, and what does it not do?`,
      a:`Content is instances fed to a system: levels, enemies, items, quests. It multiplies decisions that already exist if the system is good, and just repeats old decisions in new skins if the system is thin. Give an example of a piece of content that created a new situation and one that only reskinned an old one. State the test: write the situation the piece creates in one sentence, and if an existing piece creates the same one, it is redundant.`,
      follow:`What is the smallest example you can point to where content failed to rescue a weak loop?`,
      red:`Says content is “anything the player experiences” with no distinction between multiplying and rescuing, or claims more content always improves a game.` },
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
    { q:`How do you run a content redundancy audit?`,
      a:`List every piece with the parameters it sets, group pieces that produce the same player situation and decision, keep the strongest in each group, and name what the others add, if anything. Then look at the gap: which situations could the systems produce that nothing currently exercises. Do this before generating anything new.`,
      follow:`You find three items producing the same situation. What do you do with the two weaker ones?`,
      red:`Runs the audit, agrees with the findings, and ships all the content unchanged anyway.` },
    { q:`Where does AI help with content, and where do you keep it out?`,
      a:`It is good at auditing an existing list for redundancy, generating variations once the system is validated with explicit distinctness criteria, and estimating consumption rate. It is bad at deciding whether to add content instead of fixing a loop, and at judging whether a piece is “interesting”, because that is observed, not computed.`,
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
    { q:`How do you make the case to a director that the game’s problem is the loop, not the content, when the room’s instinct is to add content?`,
      a:`Bring the redundancy audit showing what fraction of existing content produces duplicate situations. Show what improving the interaction does for every future piece of content versus what one more piece does for itself. Frame it as sequencing, fix the system first, multiply it second, rather than as a rejection of content.`,
      follow:`The director agrees in principle but the milestone is content-shaped and due in six weeks. What do you deliver?`,
      red:`Argues the philosophical point and leaves without a plan the room can act on this milestone.` }
  ] });
DIAGRAM('content-multiplies', { kind:'quad', title:'Content multiplies the system you already have',
  x:'Content volume', y:'System quality',
  points:[{t:'Rich, varied play', x:0.82, y:0.9},{t:'More of the same', x:0.8, y:0.18},{t:'Thin but promising', x:0.18, y:0.7},{t:'Nothing to multiply', x:0.16, y:0.16}],
  q:['Add content now','Content multiplies','Fix the system first','Content hides the problem'] });

T('encounters-and-enemies',{ d:'content', t:'Encounters and enemies', tag:'An enemy is a question the game asks. Design the question before the monster.',
  what:`Enemies, hazards and opponents are the most common content in action and strategy games. Plants vs. Zombies does this with zombies: the Pole Vaulting Zombie jumps the first plant it meets, and the tougher ones soak up damage, so each asks for a different answer. Each should pose a distinct question to the player (how do I get behind this? what do I prioritize? when do I commit?) that requires a distinct answer from the player’s verb set. An encounter is a composition of these questions in space and time.`,
  why:[`Enemies are the primary way most games create decisions moment to moment.`,`An enemy that asks the same question as another with more health is not content. It is a slower version of the same fight.`,`Encounter composition, not enemy count, creates the interesting situations.`],
  think:{ q:[`What question does this enemy ask? What player verb answers it? Is there more than one valid answer?`,`How does it change the question when combined with another enemy?`,`How does the player read its intent: silhouette, telegraph, sound?`,`What does the arena contribute: cover, height, hazards, escape?`],
    trade:[`Highly specialized enemies create sharp questions and can feel puzzle-like and rigid.`,`Generalist enemies compose flexibly and blur together.`],
    traps:[`Stat variants (elite, champion) presented as new enemies.`,`Encounters designed as enemy counts rather than question combinations.`,`Enemies whose telegraphs are unreadable at the intended camera distance.`],
    good:[`Players name enemies by behavior (“the one that flanks”).`,`Players change tactics when a new enemy appears.`,`Players read what each monster asks of them from its silhouette and attack alone, as with Doom’s imp, demon and cacodemon: dodge a lobbed fireball, watch a melee rusher, track something overhead.`],
    bad:[`Players fight everything the same way.`] },
  how:[`For each enemy, write the question it asks and the verbs that answer it. Remove or redesign any whose question duplicates another.`,`Build a compatibility matrix: which pairs create a new combined question?`,`Design encounters as sequences of questions with an intended tactical shift.`,`Check readability in the actual camera and lighting. Then test whether players change behaviour per enemy type.`,`Give at least one enemy a second valid answer beyond the combat verb set: the Megami Tensei series lets most ordinary demons be talked into joining instead of fought to the end, so “which of these can I make an ally instead” becomes its own tactical question alongside “how do I beat this”.`],
  ai:{ yes:[`Audit an enemy roster for duplicated questions.`,`Generate combination matrices and predict tactical shifts.`,`Draft encounter sequences from a target question order and difficulty position.`],
       no:[`Decide what the game is about tactically. The verb set is the designer’s.`] },
  prompts:[{l:'Enemy question audit',p:`Here is our enemy roster with behaviours and stats: [ROSTER] and the player verbs: [VERBS]. For each enemy, state the question it asks, the verbs that answer it, and whether another enemy asks the same question. Build a pairwise matrix of combinations that create a new question. Identify the 3 weakest enemies (duplicated question, single answer) and propose a behaviour change, not a stat change, for each.`}],
  verify:[`Did it accept stat differences as new questions?`,`Are the combinations grounded in behaviour interactions, or in variety for its own sake?`],
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
    map:`NavigationAgent3D is Unity’s NavMeshAgent, and baking a NavigationRegion3D is baking a NavMeshSurface.` },
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
    pitfall:`Calling SetDestination on an agent that is not on the NavMesh. It logs an error saying SetDestination can only be called on an active agent placed on a NavMesh, the enemy stands there, and in a busy console that line reads as noise, so a placement bug is investigated as a behaviour bug for a day. Sample the NavMesh before spawning, and check isOnNavMesh before any command the behaviour issues.`,
    map:`A Unity NavMeshAgent is a NavigationAgent3D, and NavMesh.SamplePosition is NavigationServer3D.map_get_closest_point.` } });
INTERVIEW('encounters-and-enemies',{
  junior:[
    { q:`What is an enemy, in design terms, and why is that framing more useful than “monster”?`,
      a:`An enemy is a question the game asks: how do I get behind this, what do I prioritise, when do I commit. The player’s verb set has to contain a valid answer or the question is unfair. Framing it as a monster invites art-first thinking, framing it as a question invites behavior-first thinking. Give an example where two enemies looked different and asked the identical question.`,
      follow:`Take an enemy from a game you know and state the question it asks in one sentence.`,
      red:`Describes an enemy by its stat block or its appearance with no mention of a question or an answering verb.` },
    { q:`Is a bigger, tougher version of the same enemy new content?`,
      a:`No. If it asks the identical question with more health, it is a slower version of the same fight, not a new one. Real variety comes from a new question or a new combination, not a stat multiplier. Say what would make an elite variant new: a different telegraph, a different valid answer, a changed arena role.`,
      follow:`Your roster has an elite tier for every base enemy. What do you check first?`,
      red:`Defends stat variants as content because they took art and time to produce.` },
    { q:`How does the player learn what an enemy is asking?`,
      a:`Through readable intent: silhouette, telegraph, sound, at the camera distance and lighting the game ships with. If the telegraph cannot be read at that distance, the question was never fairly asked. Test it in the real build, not in a bright grey box.`,
      follow:`A telegraph reads fine in your test level and fails in the finished level. What changed?`,
      red:`Assumes readability from the concept art and never checks it against the shipping camera.` }
  ],
  mid:[
    { q:`You want to know if your enemy roster has variety. How do you check, without eyeballing the stat sheet?`,
      a:`Build a compatibility matrix: for every pair of enemies, does combining them create a new question, not just more simultaneous damage. Enemies with zero new combinations against the rest of the roster are candidates to redesign or cut. Then watch whether players change tactics per enemy type in actual play, since that is the behaviour the matrix is supposed to predict.`,
      follow:`Two enemies pass the matrix on paper but players fight them identically. What do you look at?`,
      red:`Builds the matrix, finds duplicates, and ships the roster anyway because the art is already done.` },
    { q:`How do you design an encounter as a composition of questions instead of an enemy count?`,
      a:`Write the sequence of questions you want the encounter to ask and the intended tactical shift partway through. Choose which enemies supply which question, then choose the arena to sharpen rather than blunt those questions. Count is the leftover variable, not the plan.`,
      follow:`The producer asks for the encounter to be “harder.” How do you translate that into question-sequence terms?`,
      red:`Answers a difficulty request by adding more of the same enemy to the same arena.` },
    { q:`Players fight every encounter the same way. Where do you look first?`,
      a:`Whether enemies are asking distinct questions at all, whether the arena is neutralizing the questions it is supposed to sharpen, an open field flattens a flanker’s question, and whether telegraphs are readable in play. Only after ruling those out do you look at whether the player’s verb set is too narrow.`,
      follow:`The verb set turns out to be the actual bottleneck. What is the cheaper fix before adding a new verb?`,
      red:`Concludes the roster needs more enemy types without checking the arena or the telegraphs first.` }
  ],
  senior:[
    { q:`You inherit a roster where half the enemies duplicate each other’s question. How do you decide what survives?`,
      a:`Rank by distinctness of question and combinatorial contribution from the matrix, not by how much art exists for each. Cut or redesign the weakest duplicates behavior-first, reusing art where budget forces a reskin instead of a rebuild. Present the cut list with what tactical variety is lost for each, so the decision is made on evidence rather than sentiment.`,
      follow:`Art has already been produced for three enemies you want to cut. How does that change your recommendation?`,
      red:`Keeps every enemy because the art is sunk, and papers over the duplication with a stat pass.` },
    { q:`How do you keep enemy design honest once a live game has years of content behind it?`,
      a:`Re-run the compatibility matrix whenever a new enemy or arena ships, since the question space shifts with every addition. Track which enemies players describe by behaviour versus by name only, that is the signal a question landed. Retire or rework enemies that never earn a behaviour description, regardless of how much they have shipped.`,
      follow:`An old enemy nobody can describe by behaviour is still popular in cosmetics sales. Do you touch it?`,
      red:`Never revisits shipped enemies because the roster audit was treated as a one-time launch task.` }
  ] });

T('items-weapons-abilities',{ d:'content', t:'Items, weapons and abilities', tag:'Every item should change what the player considers doing, not just how fast they do it.',
  what:`Player-side content: the tools, powers and gear that alter the player’s verb set or its parameters. Hades does this with boons: a god’s gift changes how an attack, a dash or a cast behaves, not only how much damage it does. The best items open new approaches or change priorities. The weakest change a number. Item design is where content, systems and expression meet.`,
  why:[`Items are the most common reward in most genres. If they are boring, rewards are boring.`,`Items with new verbs create build diversity and emergent strategies. Items with bigger numbers create convergence.`,`Item count is the easiest scope to inflate and the easiest for AI to spam.`],
  think:{ q:[`Does this item change what I consider doing, or only the outcome of what I was going to do anyway?`,`What does it interact with? A new verb that touches no system is a novelty.`,`What situation makes it the right choice? What situation makes it wrong?`,`Would the player recognise it as distinct from the last one after one use?`],
    trade:[`Verb items add depth and teaching cost. Stat items are instantly legible and forgettable.`,`Many items give collection pleasure and dilute each item.`],
    traps:[`Tier systems where higher tiers are strictly better, making earlier items trash.`,`Randomized affixes as a substitute for designed niches.`],
    good:[`Players have favourite items and can explain why.`,`Players switch items by situation.`,`God of War’s Leviathan Axe shows a new verb with a price: a thrown axe hits a far enemy but leaves Kratos fighting with his fists until he recalls it.`],
    bad:[`Players equip the highest number and never look again.`] },
  how:[`Classify items: new verb, changed priority, changed parameter. Set a ratio you want and cut towards it.`,`For each item, write the situation it owns and the one that punishes it.`,`Test whether players recognise distinctness after one use.`,`Generate variations only within niches you have defined. Filter by distinctness of the decision, not by novelty of the name.`],
  ai:{ yes:[`Classify an item list by type and flag pure stat items.`,`Fill defined niches with candidates, given explicit distinctness criteria.`,`Simulate item choice across situations to find dominant items.`],
       no:[`Decide the ratio of verb items to stat items. That is a feel and audience call.`,`Generate items before the niches are defined.`] },
  prompts:[{l:'Item distinctness filter',p:`Here are the item niches we have defined (situation owned, situation punished, verb changed): [NICHES]. Generate 3 candidates per niche. For each, state the decision it changes, the system it interacts with, and how a player would recognise it as distinct after one use. Reject your own candidates that only change a number, and say why.`}],
  verify:[`Did it sneak in stat variants dressed as verbs?`,`Would the player perceive the distinctness it claims?`],
  test:[`Log equip choices. Do players switch by situation?`,`Ask players to name a favourite item and why.`,`After one use, can a player say what an item does differently?`],
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
    pitfall:`Keying stat modifiers with bare strings. A typo such as mods.get(&"raech", 0.0) returns the default and raises no error, so the stat silently does nothing. Declare the keys as StringName constants in one place, so a typo fails at the reference instead of at runtime.`,
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
      red:`Accepts strict tiering as normal because “that’s how loot works” in the genre.` },
    { q:`How do you know if a player recognises an item as distinct after using it once?`,
      a:`Test it directly: hand it to a player, let them use it once, then ask what it does differently from the last item they held. If they cannot say, the item is not distinct regardless of what the tooltip claims. Distinctness is what is perceived in play, not what is written in the design doc.`,
      follow:`A player uses the item three times before they can describe it. What does that tell you?`,
      red:`Assumes distinctness because the item has a unique icon and a unique name.` }
  ],
  mid:[
    { q:`Your item list has ballooned and most items feel forgettable. What do you do?`,
      a:`Classify every item as new verb, changed priority, or changed parameter, and look at the ratio against what you want. Cut towards that ratio rather than towards a headcount. For each survivor, write the situation it owns and the situation that punishes it, items with blanks in either are candidates to merge or cut.`,
      follow:`The ratio comes back mostly stat items. What is the cheapest first move?`,
      red:`Prunes items at random to hit a smaller number without classifying any of them first.` },
    { q:`How do you stop AI-generated item variants from becoming spam?`,
      a:`Define the niches first, situation owned, situation punished, verb changed, before generating anything. Generate candidates only within those niches, and reject any candidate that only changes a number, out loud, as part of the process. The filter has to be explicit or the model will happily produce numeric variants that look novel and are not.`,
      follow:`A generated candidate passes your filter on paper but still reads as a reskin in testing. What went wrong upstream?`,
      red:`Generates a batch of items first and tries to sort them into niches afterwards.` },
    { q:`Players equip the highest number and never look at their inventory again. Diagnose it.`,
      a:`Check whether any item punishes the current best choice in some situation, if nothing does, the “best” item is best everywhere and there was never a real decision. Look at whether situational counters exist in the content, not just on paper. The fix is usually a niche the current best item loses in, not a nerf.`,
      follow:`You add a punishing situation and players still do not switch. What do you check next?`,
      red:`Nerfs the dominant item’s numbers and expects switching behaviour to follow automatically.` }
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
  what:`Structured content that gives the player goals with narrative or systemic framing: quests, missions, contracts, events, challenges. Good quests create situations the systems make interesting. Bad quests are errands with text. Events are time-bound quests that change the world state. Fallout: New Vegas’s Ghost Town Gunfight plays out differently depending on whether the player brings Speech, Barter, Medicine, Explosives or Sneak, so the quest a player remembers is shaped by their build, not the loot it paid out.`,
  why:[`Quests are how many games deliver goals at the session horizon and carry story into play.`,`Quest structure decides whether the player is directed or exploring. Over-direction erases discovery.`,`Quest content is consumed once (an arc). It is the most expensive content per minute of play.`],
  think:{ q:[`What situation does this quest put the player in that free play would not?`,`What decision does it contain? A quest with no choice is a tour.`,`What does completing it change in the world, the character or the player’s options?`,`Could the systems generate this situation without a script?`],
    trade:[`Scripted quests deliver reliable story beats and cost the most per minute.`,`Systemic quests scale and feel generic without hand-authored anchors.`],
    traps:[`Kill and fetch quests as the default template.`,`Quest logs that replace the world as the source of goals.`,`Events that only add timers and fear of missing out.`],
    good:[`Players remember quests by what happened, not by the reward.`,`Players take detours because something in the world looked interesting.`,`Players retell a side quest as a story rather than a checklist entry, as they do The Witcher 3’s Bloody Baron chain, written and voiced to the standard of its main story.`],
    bad:[`Players read the objective, not the text, and follow the marker.`] },
  how:[`For each quest, write the situation, the decision, and the world change. Drop or merge any with blanks.`,`Mix authored anchors with systemic goals so the world generates some of its own quests.`,`Put goals in the world (a visible thing to reach) before putting them in the log.`,`Test whether players can describe a quest afterwards without mentioning the reward.`],
  ai:{ yes:[`Audit quest lists for missing situations, decisions and world changes.`,`Generate quest situation variants once the template and criteria are explicit.`,`Draft dialog and flavour after the structure is validated.`],
       no:[`Generate quests before the systems that make situations interesting exist.`,`Decide the balance of authored and systemic content.`] },
  prompts:[{l:'Quest structure audit',p:`Here are our quests: [LIST]. For each: the situation it creates that free play would not, the decision it contains, and the world or character change on completion. Mark blanks. Group quests that share a template. For the most common template, propose 3 structural variants that add a decision, not more text.`}],
  verify:[`Did it fill blanks with flavour instead of structure?`],
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
    pitfall:`Wiring a prefab’s UnityEvent to a manager sitting in the scene. Unity cannot serialize a scene reference inside a prefab asset, so the field is None in every instance placed afterwards and the quest fires nothing while the Inspector looks correct in the one scene where it was authored. Route through a ScriptableObject channel, which is an asset and can be referenced from anywhere.`,
    map:`A Unity ScriptableObject channel is a Godot autoload with signals, and OnTriggerEnter is body_entered.` } });
INTERVIEW('quests-and-events',{
  junior:[
    { q:`What’s the minimum a quest needs to not be an errand with text?`,
      a:`A goal, a reason, and a situation the systems make interesting, plus a decision inside it. Without the situation it is a checklist: go here, kill this, return. Take a quest from a game you know and check it against those parts, naming any that are blank.`,
      follow:`Which part is missing most often in fetch-and-kill quests you’ve played?`,
      red:`Defines a quest as “an objective with a reward” and stops there.` },
    { q:`Why is a quest log a weaker source of goals than the world itself?`,
      a:`A goal placed in the world, a visible thing to reach, is discovered by playing. A goal that only exists in a log has to be read, and players who read the objective instead of the text follow the marker and stop noticing the world. Say where you would put a goal in the world before writing it into a log at all.`,
      follow:`Give a case where a marker-driven design made players stop looking at the level around them.`,
      red:`Treats the quest log as the primary design surface and the world as decoration around it.` },
    { q:`What makes an event different from a quest, and what’s the risk specific to events?`,
      a:`An event is time-bound and changes world state, where a quest does not have to. The risk is that events lean on timers and fear of missing out instead of on a real situation or decision, becoming pressure without content. Ask what decision the event contains before shipping the countdown.`,
      follow:`Strip the timer from an event you know. Is there still a decision left?`,
      red:`Adds a countdown to make routine content feel urgent, with no new decision underneath it.` }
  ],
  mid:[
    { q:`How do you audit a quest list without reading every line of dialog?`,
      a:`For each quest, write the situation it creates that free play would not, the decision it contains, and the world or character change on completion. Mark blanks, then group quests sharing a template. For the most common template, look for a structural variant that adds a decision rather than more text.`,
      follow:`You find twelve quests share the same kill-and-fetch template. What is your first structural fix?`,
      red:`Rewrites the flavour text on the duplicated quests and calls the audit done.` },
    { q:`The narrative team wants every quest scripted for control. Systems design wants everything generated for scale. How do you resolve it?`,
      a:`Name the trade honestly: scripted quests deliver reliable beats at the highest cost per minute, systemic ones scale but feel generic without hand-authored anchors. Mix them, scripting for anchors that need to land precisely, systems for the goals that fill the space between anchors. Decide the ratio from budget and from how much of the game needs to feel authored versus alive.`,
      follow:`Budget is cut mid-production and scripting has to shrink. What do you protect first?`,
      red:`Picks one approach on ideology and never revisits the mix as constraints change.` },
    { q:`Players read the marker and never the quest text. What do you do about it?`,
      a:`Check whether the goal is visible in the world before it is in the log, since a log-only goal trains players to stop looking anywhere else. Test removing the marker on one quest and see if a well-placed sightline or landmark can carry the same information. Text is a fallback for players who look away, not the primary channel.`,
      follow:`You remove the marker and players get lost instead of engaged. What does that tell you about the level, not the quest?`,
      red:`Adds more markers and bigger objective text to compensate for a quest nobody reads.` }
  ],
  senior:[
    { q:`How do you plan the authored-versus-systemic quest split for a live game meant to run for years?`,
      a:`Reserve scripted anchors for moments that need precision, launch content, major story beats, and lean on systemic goals for ongoing cadence, since arcs are consumed once and authored content cannot be regenerated fast enough to sustain live ops. Track consumption rate against your authoring pipeline’s real throughput before committing the split publicly, and revisit the ratio after the first few live cycles rather than locking it at launch.`,
      follow:`Your systemic quests start feeling generic within the first season. What do you add without blowing the authoring budget?`,
      red:`Commits to an authored-heavy cadence at launch with no plan for what happens when the writing team can’t keep pace.` },
    { q:`A publisher wants events built primarily around countdown pressure to drive daily logins. How do you push back or accommodate it?`,
      a:`Separate the metric the event is meant to move from the decision the event should contain, and show what a timer without a decision costs long-term, it reads as pressure rather than content and teaches players the game runs on urgency rather than situations. Offer a version with a real decision that still meets the timing goal, making the trade-off explicit rather than silently building pressure with no substance.`,
      follow:`The publisher accepts your version but wants the timer kept anyway for the metric. What do you insist on keeping in the design?`,
      red:`Ships the countdown as requested with no situation or decision inside it, and reports the login lift as success.` }
  ] });

T('procedural-content',{ d:'content', t:'Procedural and AI-generated content', tag:'A generator that makes ten thousand unique bowls of oatmeal has made oatmeal.',
  what:`Content produced by rules or models rather than by hand: procedural levels, generated items, AI-written dialog. Minecraft builds each world from a seed, and its biomes (desert, jungle, snow) keep one world from being a single repeated texture, and the seed makes the next world a different arrangement. Kate Compton’s “10,000 bowls of oatmeal” names the core problem: mathematically unique outputs that are perceptually identical. The bar is perceptual uniqueness (each piece has character) or at least perceptual differentiation (this one is not the last one).`,
  why:[`Generation is the strongest content multiplier and the easiest way to bury a game in sameness.`,`Players judge content by what it makes them do. A generator must vary the decision, not the decoration.`,`AI text and asset generation makes the oatmeal problem worse: fluent, plausible, and indistinguishable at scale.`],
  think:{ q:[`What does the generator vary that changes the player’s decision? If only appearance, it is decoration.`,`What hand-authored anchors give runs readability and memory? Spelunky’s room templates are the classic example.`,`How would I detect oatmeal? What is my perceptual distinctness test?`,`What is the generator’s failure floor: the worst output it can produce? Players will meet it.`],
    trade:[`More randomness yields more surprise and less mastery and readability.`,`More constraints yield more readability and more sameness.`],
    traps:[`Measuring the generator by combinatorial count.`,`Using AI generation to fill a system that has not been validated by hand.`,`Shipping the generator’s floor.`],
    good:[`Players describe individual runs or pieces with specifics.`,`Players learn to read generated content and plan around it.`],
    bad:[`Players say “they all blend together”.`,`Players recognise a generated quest by its generic fetch, kill or clear phrasing, as they do Skyrim’s Radiant Story quests, long before the supply runs out.`] },
  how:[`Hand-author ten pieces first. Find what makes the best ones distinct. Those properties are what the generator must vary.`,`Build the generator to vary decisions, then constrain it with authored anchors.`,`Define a perceptual distinctness test: show players pairs and ask whether they are different and how.`,`Sample the generator’s worst outputs deliberately and raise the floor.`,`Diablo II fixes a small cast of named “superunique” monsters, such as Blood Raven or the Countess, at consistent points inside otherwise regenerated dungeons, giving players landmarks their memory can actually use.`,`Sample a generator’s output where players look first: Microsoft Flight Simulator generates 1.5 billion buildings from Bing Maps imagery and map tags, and its most shared early screen was a two-storey Melbourne building turned 212-storey tower by an OpenStreetMap typo.`],
  ai:{ yes:[`Write and tune generators. Enumerate output spaces. Sample worst cases.`,`Generate candidates within explicit distinctness criteria for a human filter.`,`Score outputs against measurable proxies for distinctness you define.`],
       no:[`Judge perceptual distinctness. Players do that.`,`Generate content for an unvalidated system.`] },
  prompts:[{l:'Generator distinctness review',p:`Here is our generator spec and 20 sample outputs: [SPEC, SAMPLES]. For each pair of similar samples, state what a player would perceive as different and whether that difference changes a decision. Estimate the fraction of outputs a player would call “the same as the last one”. Identify the parameters that most change decisions and the ones that only change appearance. Propose 3 authored anchors that would make outputs readable and memorable.`}],
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
  godot:{ term:`A generator is a seeded function plus authored anchors. Generating on the main thread freezes the frame, and a worker thread may not touch the scene tree, so the split is data on the thread and nodes on the main thread. The sample waits on the task for brevity. A loading screen polls WorkerThreadPool.is_task_completed() each frame instead, or the frame freezes anyway.`,
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
    pitfall:`Touching the scene tree from the worker task. Touching the active scene tree from a worker thread is not safe in Godot. Building a detached subtree is allowed. Since 4.1 the call fails with a “Caller thread can’t call this function in this node” error instead of doing the work, so rooms go missing and the cause is one line in a busy log. Build plain data on the thread and instantiate on the main thread, and seed every generator you use, each FastNoiseLite included, or the run is not reproducible.`,
    map:`WorkerThreadPool is Unity’s Job System or a Task, and FastNoiseLite is Mathf.PerlinNoise with a seeded offset.` },
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
    pitfall:`Moving a runtime mesh’s vertices after its triangles are assigned and never calling RecalculateBounds. Assigning triangles recalculates the bounds, changing vertices afterwards does not, and the mesh keeps the old bounds, so the renderer culls it as soon as the camera looks from an angle those stale bounds exclude, and the level appears to have holes that vanish when you walk closer. Unity.Mathematics.Random also rejects a seed of zero, which is exactly the seed a fresh save hands it.`,
    map:`A Unity Task plus Instantiate on the main thread is WorkerThreadPool plus call_deferred, and RecalculateBounds is the AABB update on a generated mesh.` } });
INTERVIEW('procedural-content',{
  junior:[
    { q:`What’s the “10,000 bowls of oatmeal” problem, and why should a designer care?`,
      a:`Kate Compton’s framing: a generator can produce mathematically unique outputs that are perceptually identical, ten thousand bowls of oatmeal are still oatmeal. The bar is not uniqueness, it is whether a player perceives one output as different from the last. Give an example of a generator you know that clears this bar and one that does not.`,
      follow:`Take the generator that fails and say what it varies instead of what it should vary.`,
      red:`Defends a generator’s variety by citing the size of its output space rather than what players notice.` },
    { q:`A generator varies colour, texture and name across a thousand items. Is that enough?`,
      a:`Only if those changes affect what the player considers doing, otherwise it is decoration and the items will blur together regardless of how large the parameter space is. Ask what the generator varies that changes a decision, and if the answer is nothing, the variety is cosmetic. Distinctness is a perceptual test, not a combinatorial one.`,
      follow:`You find the generator only varies decoration. What is the smallest change that would make it vary a decision instead?`,
      red:`Reports the generator’s output count as evidence of depth.` },
    { q:`Why hand-author examples before building the generator?`,
      a:`Hand-author roughly ten pieces first and find what makes the best ones distinct, those properties are exactly what the generator needs to vary. Skipping this step means guessing at distinctness instead of extracting it from something that already worked, and it gives you a floor to compare generated output against.`,
      follow:`Two of your ten hand-authored pieces turn out equally strong for different reasons. What does that tell you about the generator’s parameter space?`,
      red:`Builds the generator first and tries to retrofit distinctness criteria from its output afterwards.` }
  ],
  mid:[
    { q:`How do you test whether generated content is perceptually distinct?`,
      a:`Show players pairs of outputs and ask whether they are different and how, that is the perceptual distinctness test. Track the fraction of pairs players call the same as each other, and sample this across typical outputs and the generator’s worst outputs, since players will meet the floor eventually, not just the average case.`,
      follow:`Players call most pairs the same even though the parameters differ significantly. What do you conclude about your parameter choices?`,
      red:`Measures distinctness by comparing parameter values in code and never shows a single pair to a player.` },
    { q:`Where does AI content generation make the oatmeal problem worse, specifically?`,
      a:`AI text and asset generation produces fluent, plausible output that is indistinguishable at scale, the fluency itself hides the sameness because each individual output reads fine in isolation. It is strongest used to fill niches already defined by hand, with an explicit distinctness filter, not to generate broadly and sort afterwards. The human judgement on what counts as different has to happen before generation, not after.`,
      follow:`A generated batch all reads well individually but blurs together as a set. How do you catch that before it ships?`,
      red:`Approves generated content item by item without ever comparing it against the rest of the batch.` },
    { q:`You’ve sampled the generator’s typical output and it looks fine. What are you still missing?`,
      a:`The generator’s failure floor, its worst possible output, because players will eventually produce it through normal play and typical-case sampling never catches it. Deliberately sample the tail, not just the middle of the distribution, and raise the floor rather than just polishing the average case.`,
      follow:`You find a floor output that’s actively broken, not just boring. What is the fix, cap the parameter range or patch the specific case?`,
      red:`Ships based on a handful of good-looking sampled runs and never deliberately hunts for the worst case.` }
  ],
  senior:[
    { q:`How do you sell a systemic or generated-content approach to a producer who wants a guaranteed schedule?`,
      a:`Be honest that generation trades content-per-hour for tuning time and later certainty, the schedule shape changes even if the total content cost goes down. Propose a slice, hand-author examples, build a narrow generator, test distinctness with players, before committing the full production plan to it, and define upfront what a failed slice means so the producer is not surprised later.`,
      follow:`The slice comes back with mediocre distinctness scores. Do you kill the approach or iterate on the generator?`,
      red:`Presents generation as strictly cheaper with no mention of the tuning and testing cost it carries.` },
    { q:`AI generation lets you produce content at a scale hand-authoring never could. What’s the actual bottleneck now?`,
      a:`Human judgement on distinctness, because generation removed the cost constraint that used to force restraint. The bottleneck moves to defining distinctness criteria, sampling the floor, and filtering at scale, which is slower and more skilled work than most teams budget for. Volume without that filter just produces oatmeal faster.`,
      follow:`The team treats the higher volume as pure upside during planning. What do you tell them about the filtering cost before they commit the roadmap to it?`,
      red:`Welcomes the volume increase as a straightforward win and schedules no additional filtering or testing time for it.` }
  ] });

T('puzzle-design',{ d:'content', t:'Puzzle design', tag:'A fair puzzle is solvable from what it has already shown you. Difficulty is not the same as obscurity.',
  what:`A puzzle presents a solution space (every arrangement, order or combination that could be tried) and asks the player to find the one, or one of the few, that works. The aha moment is the point where a piece of information the player already had reframes the whole problem, so the solution suddenly looks obvious in hindsight; that reframing, not the difficulty of execution, is what a puzzle is selling. Red herrings, batch confirmation, difficulty rhythm, hints and onboarding are covered under How, along with the Ace Attorney and Danganronpa examples.`,
  why:[`A puzzle that can only be solved by guessing, trial and error, or looking up a walkthrough is not testing insight, it is testing patience or access to outside information, which is a different and usually unintended experience.`,`The aha moment is the entire reward of a puzzle. If it never truly reframes anything, the puzzle is a lock with an already-visible key, and if it cannot be reached from what the game has shown, it is a lock with no key at all.`,`Fairness complaints (“that was impossible to know”) are almost always solvable at the design stage, before a single line of dialogue apologises for them in a hint system.`],
  think:{ q:[`Where, specifically, did the game show the player the piece of information this puzzle depends on? Point to it.`,`Is there exactly one solution, or a family of valid ones? Did you design that on purpose?`,`If a player tries the wrong thing, does the game show them it was wrong for a reason they can learn from, or just fail silently?`,`Does solving this puzzle require a new insight, or only careful execution of an insight the player already had? Both are valid, but they reward different things.`,`Would a player who missed one specific piece of information be stuck forever, with no other route to the same conclusion?`],
    trade:[`A single, tightly authored solution feels precise and satisfying but is brittle: miss the one clue and there is no way in. Multiple valid solutions are more forgiving but dilute the sharpness of the aha moment.`,`More red herrings raise doubt and tension but risk teaching players to distrust real clues too, which quietly turns careful reasoning into paranoid guessing.`],
    traps:[`Confusing obscurity (a solution that depends on information the game never gave) with difficulty (a solution that is hard to find even with all the information given).`,`Letting a single wrong click, guess or misread cost the player as much as being wrong about the puzzle’s logic, which punishes experimentation instead of rewarding it.`,`Writing a hint system’s first hint as strong as its last, so there is no gentle nudge available before the answer is simply handed over.`],
    good:[`Players say “oh!” and can immediately explain, unprompted, which specific piece of earlier information made it click.`],
    bad:[`Players solve it by systematically trying every combination rather than reasoning towards one, which means the puzzle rewarded patience, not insight.`] },
  how:[`A red herring is a false lead deliberately placed to cost the player time or confidence, and it is fair only when it is eventually resolvable as wrong on its own terms, not simply silent forever.`,`Batch confirmation, the technique Return of the Obra Dinn uses, locks in fates only when three of them are correct at once, so the game never confirms a single answer and the player cannot find the right one by trial and error, one guess at a time.`,`A difficulty curve for puzzles is rarely about raw hardness rising smoothly; it is closer to a rhythm of teaching a rule cleanly, then testing it alone, then combining it with an earlier rule, then subverting the combination once it has become comfortable.`,`A hint system’s job is to nudge without solving: the weakest hint should only redirect attention (look again at the north wall), and only the strongest, latest hint should state the mechanism outright.`,`Teaching a new rule for the first time is the job of onboarding, not of the puzzle that uses it; a puzzle should test understanding of a rule the player already has, not introduce it cold.`,`Ace Attorney narrows the search twice over: pressing testimony first isolates which single sentence is suspect, then presenting evidence only ever offers items the player has already found in the Court Record, so a wrong guess costs a soft, recoverable penalty rather than ending the puzzle outright.`,`Danganronpa: Trigger Happy Havoc keeps its evidence pool just as closed as Ace Attorney’s Court Record, but scrolls the flagged weak point past the player and demands a timed shot rather than a menu click, so a Nonstop Debate has to hold the same one-clue-one-answer fairness under reflex pressure that Ace Attorney solves at reading pace.`,`Write down the exact clues, in the order the player will encounter them, that make the solution reachable. If you cannot point to where a needed fact was shown, the puzzle is not fair yet.`,`Decide on purpose whether there is one solution or a family of them, and design the feedback for a wrong attempt to teach something either way.`,`Place red herrings that are eventually resolvable as wrong, and budget how much time or confidence each one is allowed to cost before it stops being fun doubt and starts being frustration.`,`Playtest blind, with no hints available at first, and watch whether players reach the aha moment from the clues alone, guess their way through, or get stuck at a specific, nameable point.`],
  ai:{ yes:[`Enumerate the full solution space for a described puzzle mechanically, to check whether an unintended second solution exists that trivialises it.`,`Draft a graded hint ladder (weakest to strongest) for a puzzle whose solution and clues you describe.`,`Check a proposed red herring for whether it is eventually resolvable as wrong, and flag it if it would only ever read as silent or unfair.`],
       no:[`Decide whether a puzzle is satisfying. The aha moment is a felt, human reaction that only a real player, not a description of the puzzle, can report.`] },
  prompts:[{l:'Fairness and solution-space audit',p:`Here is a puzzle: [DESCRIPTION], and the clues the player has access to before attempting it: [CLUES, in order]. List every solution path you can find using only those clues; flag if there is more than one and whether that looks intentional. Identify any step in the intended solution that depends on information not listed among the clues, since that is an obscurity, not a difficulty. Then draft a three-step hint ladder: the first hint should only redirect attention, the last should state the mechanism outright, and none should be stronger than it needs to be.`}],
  verify:[`Did it solve the puzzle only from the clues you gave it, or did it quietly use outside knowledge of the game or genre?`,`Are the hints graded in strength, or does the first hint already give away as much as the last?`],
  test:[`Watch a blind playtester with no hints. Note the exact moment, if any, where they say something like “oh, that’s what that meant.”`,`Ask a player who solved it to point to the specific clue that made it click. If they cannot, the aha moment may not be doing its job.`,`Track how many attempts use trial and error versus stated reasoning. High trial-and-error with confident wrong guesses often points to a hidden or unfair dependency.`],
  rel:[['puzzles-in-action-spaces','This topic is the logic puzzle and its moment of insight; that one embeds puzzles in an action game built from its combat verbs.'],['onboarding','Teaching a rule for the first time belongs to onboarding; a puzzle should test a rule the player already has.'],['decisions','A puzzle attempt is a decision under uncertainty about which solution is correct.'],['content-multiplies','Puzzle content only multiplies a sound underlying rule set; it cannot make a broken rule fair.'],['difficulty','A puzzle’s difficulty curve is a specialised case of pacing the gap between what is asked and what the player can currently do.'],['feedback-and-affordance','A wrong attempt needs to read as wrong for a reason, which is a feedback design problem.']] });
TECH('puzzle-design',[
  {n:'Solution-space mapping', how:`Enumerate every distinct path that reaches a valid solution using only the clues given, then decide on purpose whether the puzzle is meant to be single-answer or open.`, fit:`Pre-production fairness audits, and catching an unintended shortcut solution before players find it for you.`, cost:`Manual, and grows combinatorially fast for open puzzles with many valid arrangements.`, alt:`Follow up with a blind playtest for solutions you did not think to enumerate; decide whether an unexpected one is a happy accident worth keeping.`},
  {n:'Red-herring budgeting', how:`Place deliberate false leads and rate the cost each one is allowed to impose (time lost, confidence shaken), never a permanent block.`, fit:`Mystery, deduction and observation puzzles where doubt is part of the intended feeling.`, cost:`A red herring that looks identical to real evidence teaches distrust of everything, including the clues that were true.`, alt:`Make every red herring resolvable as wrong on its own terms once the player has enough information, not just silently unhelpful forever.`},
  {n:'Confirmation by corroboration', how:`Require the same conclusion from several independent clues before the game locks it in, instead of trusting or grading a single guess.`, fit:`Deduction puzzles where one wrong guess should not be punished as harshly as being wrong about the underlying reasoning.`, cost:`Needs enough independent evidence per conclusion for the corroboration to mean anything; two clues that both hinge on the same fact do not count as two confirmations.`, alt:`Return of the Obra Dinn’s model: group conclusions into batches and confirm the batch together, rather than judging each guess in isolation.`}
]);
ENGINE('puzzle-design',{
  godot:{ term:`A puzzle’s solved state should be checked only on the specific action that could change it (a piece placed, a switch flipped, a lever pulled), never by polling every frame, and hint sequencing needs a guard against being triggered twice while a previous hint is still playing out.`,
    api:['signal piece_placed(id)','await get_tree().create_timer(t).timeout','Resource-based puzzle/solution definitions','is_equal_approx() / Vector2.distance_to()','Area2D.body_entered','StringName-keyed state dictionary'],
    snippet:`extends Node
signal solved
var placed: Dictionary = {}     # slot id -> piece id
var solution: Dictionary        # authored, loaded from a Resource
var hint_running := false

func on_piece_placed(slot: StringName, piece: StringName) -> void:
\tplaced[slot] = piece            # check only here, never every frame
\tif placed == solution:
\t\tsolved.emit()

func show_hint(text: String) -> void:
\tif hint_running: return         # guard against a re-entrant hint chain
\thint_running = true
\t%HintLabel.text = text
\tawait get_tree().create_timer(3.0).timeout
\thint_running = false`,
    pitfall:`Comparing piece positions with == on floats or Vector2 values to decide “is this in the correct slot,” instead of is_equal_approx() or a distance threshold. Physics settling or a snap-to-grid tween rarely lands on the exact bit pattern the authored solution used, so a visibly correct placement can fail to register as solved with no visible error.`,
    map:`Godot’s is_equal_approx() and awaiting a SceneTreeTimer are Unity’s Mathf.Approximately() and a guarded coroutine using WaitForSeconds.` },
  unity:{ term:`The same two rules apply: validate on the event that changed state, not every Update, and guard hint sequencing so pressing the hint button twice cannot start two overlapping coroutines that show hints out of order.`,
    api:['UnityEvent / event Action on state change','Coroutine handle + StopCoroutine()','Mathf.Approximately()','Vector3 tolerance checks','ScriptableObject puzzle/solution definitions','Dictionary<string,string> solved-state tracking'],
    snippet:`public class PuzzleState : MonoBehaviour {
    public event Action Solved;
    Dictionary<string, string> placed = new();
    [SerializeField] PuzzleSolution solution;   // ScriptableObject
    Coroutine hintRoutine;
    [SerializeField] TMPro.TMP_Text hintLabel;

    public void OnPiecePlaced(string slot, string piece) {
        placed[slot] = piece;                   // checked only here
        if (solution.Matches(placed)) Solved?.Invoke();
    }

    public void ShowHint(string text) {
        if (hintRoutine != null) StopCoroutine(hintRoutine);  // no stacking
        hintRoutine = StartCoroutine(HintRoutine(text));
    }
    IEnumerator HintRoutine(string text) { hintLabel.text = text; yield return new WaitForSeconds(3f); }
}`,
    pitfall:`Calling StartCoroutine(HintRoutine()) on every hint-button press without stopping a coroutine already running. Each press stacks another concurrent hint sequence, so hints can overlap, skip ahead, or display out of the intended order, especially if a player mashes the hint button out of frustration, which is exactly when the sequence most needs to stay correct.`,
    map:`Unity’s StopCoroutine-then-restart (latest hint wins) and Godot’s hint_running early return (current hint wins) are two answers to the same re-entry problem.` },
  note:`Both engines share the same two rules: check solved state on the event that could change it, not on a timer or every frame, and never let a repeated player action (a placement retry, a hint press) start a second, overlapping instance of logic that assumes it is the only one running.` });
INTERVIEW('puzzle-design',{
  junior:[
    { q:`What is the difference between a puzzle being hard and a puzzle being unfair?`,
      a:`A hard puzzle is solvable from the information the game has already given, it just takes real thought to get there. An unfair puzzle depends on information the player was never shown, or on a leap no amount of careful reasoning from the given clues would produce. Give an example of each from a game you know.`,
      follow:`How would you test, cheaply, whether a puzzle you designed has crossed from hard into unfair?`,
      red:`Treats “players got stuck” as proof of unfairness, without checking whether the needed clue was present.` },
    { q:`What is the aha moment, and why is it the actual reward of a puzzle rather than the difficulty?`,
      a:`It is the instant a piece of information the player already had reframes the whole problem, so the answer suddenly looks obvious. That reframing is what makes solving a puzzle feel different from finishing a chore; the difficulty is just how long it takes to reach that reframing, not the reward itself.`,
      follow:`Describe a puzzle you have solved where the aha moment was strong. What specific fact caused it?`,
      red:`Describes only the mechanical steps to solve a puzzle with no mention of a moment of realisation.` },
    { q:`Why should a puzzle not be the first place a player learns a new rule?`,
      a:`Teaching and testing are different jobs. If the puzzle is also the tutorial for the rule it depends on, a player who fails cannot tell whether they misunderstood the rule or mis-solved the puzzle, which muddies the feedback either way. Onboarding should teach the rule cleanly first, in isolation, before a puzzle asks the player to apply it.`,
      follow:`You inherit a puzzle that seems to be doing both jobs at once. What is your first move?`,
      red:`Sees no distinction between teaching a mechanic and testing understanding of one.` }
  ],
  mid:[
    { q:`A puzzle is getting solved by trial and error rather than reasoning. How do you tell, and what do you check first?`,
      a:`Watch whether players narrate a hypothesis before acting, or simply cycle through options until one works. High rates of confident wrong guesses followed by systematic retries usually means a clue is missing or too subtle, not that the puzzle is too easy or too hard. Check the solution-space map against the clues given before touching difficulty.`,
      follow:`You confirm the clue is present but subtle. Do you make it louder, or add a second, independent clue?`,
      red:`Responds to trial-and-error solving by adding a timer or a fail state, which punishes the symptom instead of fixing the missing clue.` },
    { q:`How do you decide whether a puzzle should have exactly one solution or a family of valid ones?`,
      a:`A single tightly authored solution gives the sharpest possible aha moment but is brittle if the player misses the one dependent clue; a family of solutions is more forgiving and rewards different playstyles but dilutes how sharp any one insight feels. Decide based on whether the puzzle is meant to be a signature, memorable moment or a recurring, lower-stakes system, and design the wrong-attempt feedback to teach something either way.`,
      follow:`Give an example of a puzzle type better served by a single solution, and one better served by a family of them.`,
      red:`Treats “more solutions is always more accessible” as a universal rule with no cost.` },
    { q:`Design a three-step hint ladder for a puzzle you are describing. What must the first hint never do?`,
      a:`The first hint should redirect attention (look again at the thing you walked past), not restate the mechanism or point at the exact solution. Escalate gradually, and reserve the mechanism-revealing hint for the last step, so a player who only needed a nudge is not handed the answer outright.`,
      follow:`A playtester takes the first hint and is still stuck. What does that tell you about the gap between hint one and hint two?`,
      red:`Writes a hint ladder where the first hint already gives away as much as the last.` }
  ],
  senior:[
    { q:`You are auditing a puzzle-heavy game shipping in six weeks and find several puzzles depend on clues the average player skips. What is your triage?`,
      a:`Rank by how many players get stuck, from playtest or telemetry, against how central the puzzle is to progression; a skippable optional puzzle with a missing clue is a lower priority than a mainline gate. For the gating ones, prefer adding a second, independent route to the same clue over rewriting the puzzle from scratch, since that preserves the intended aha moment while removing the single point of failure.`,
      follow:`Adding a second clue route risks making the puzzle feel over-explained to players who did not need it. How do you avoid that?`,
      red:`Proposes a blanket hint system rollout as the fix without first identifying which specific puzzles are failing and why.` },
    { q:`How do you apply batch confirmation, the Return of the Obra Dinn technique, to a puzzle genre that is not a mystery?`,
      a:`The underlying idea generalises: instead of grading a single guess as right or wrong, confirm the player’s answers only in batches, so no single answer can be checked by itself and brute-force guessing stops working, so a lucky or unlucky single data point cannot pass or fail a conclusion the player has not earned. Name a non-mystery puzzle type where a single wrong click currently costs the player more than the reasoning error deserves, and describe what corroboration would look like there.`,
      follow:`Corroboration usually needs more content or clues per conclusion than a single-guess design. How do you justify that cost to a team on a schedule?`,
      red:`Treats fairness-by-corroboration as a mystery-genre-specific trick rather than a general answer to punishing a single guess too harshly.` }
  ] });
DIAGRAM('puzzle-design', { kind:'state', title:'Fairness by corroboration, not a single guess', start:'clue',
  states:[{id:'clue', t:'New clue found'},{id:'hyp', t:'Hypothesis formed'},{id:'test', t:'Test against evidence'},{id:'contra', t:'Contradicts, revise'},{id:'lock', t:'Locked in (3 correct)'}],
  edges:[['clue','hyp'],['hyp','test'],['test','lock','3 correct at once'],['test','contra'],['contra','hyp','revise']],
  note:'Nothing locks on a single guess. Return of the Obra Dinn confirms fates only when three of them are correct at once, so trial and error cannot find them one at a time.' });

T('puzzles-in-action-spaces',{ d:'content', t:'Puzzles inside an action game', tag:'When the verbs that fight also solve, a dungeon is one lesson told twice: once as a room, once as a fight.',
  what:`An action game with puzzles in it has a different problem from a puzzle game. The player arrives with a body full of verbs: swing, throw, dash, jump. A puzzle built from those verbs needs no new tutorial and tests the same skill the combat tests. CrossCode shows the extreme form. Its developer describes it as Yoshi’s Island made top-down and turned into an RPG: you throw bouncing balls to hit switches, boxes and enemies, so fights have puzzle-like rules and puzzles can be fast. The Zelda series shows the other classic form: a dungeon is built around one item, the rooms test the item, and the boss often asks for it again (Aonuma has said the team starts from what kind of play a dungeon should hold and how the player will use its item on the environment). Portal sits at the other end, a pure puzzle game with one verb and no attack of your own (turrets and energy pellets are hazards, and the pellets, which you redirect through portals into a receptacle, are a bounced-projectile switch much like CrossCode’s ball), and it is the clearest model of how to teach and then combine one idea.

Four things are different from a pure puzzle. First, the player can fail with their hands as well as their head, so every puzzle has two questions, "what do I do?" and "can I do it?", and you must know which one a room asks. Second, the game has two rhythms to alternate, thinking and fighting, and the order of them is the pacing. Third, failure has a physical price (damage, a respawn, a walk back) that a pure puzzle game does not charge, so retry cost is a design number. Fourth, some players came for the combat and will not enjoy the puzzles, so the game needs a policy for optional rooms and for skipping. This topic covers those four, and how the grammar a dungeon taught carries into its boss.`,
  why:[`A shared verb is the cheapest teaching there is. If the ball that kills the enemy also flips the switch, the player has already practised the puzzle’s input in the first fight, and a puzzle room is a combat room with the enemies replaced by constraints.`,`Alternating puzzle and fight beats gives each kind of attention a rest. A dungeon of only puzzles tires the head; a dungeon of only fights tires the hands. This is a reading to test, not a law: many Zelda-style dungeons can be described as alternating beats, and the "dungeon pacing" curve comes from that reading.`,`In an action game the failure that frustrates is rarely "I did not know the answer". It is "I knew the answer, died on the way, and walked back for a minute". The fix is retry design, not an easier puzzle.`,`A dungeon that teaches its gimmick before it combines it can ask hard questions at the end, because the hard question is only the sum of things the player has already done. A dungeon that combines too early reads as obscure.`,`Players differ in what they want from a puzzle. The Game Accessibility Guidelines list an option to bypass elements that are not part of the core mechanic, such as a puzzle sequence in a first-person shooter or a button-mashing round in a quiz game, as an intermediate-level measure. A puzzle that blocks progress without being what the game is about is the one to make skippable.`],
  think:{ q:[`Which verbs does the player already own at this point, and does this room use only those? If it needs a new one, where was it taught?`,`Is this room a logic puzzle (the answer is hard to find, easy to do), a skill puzzle (the answer is obvious, hard to do), or both? Which one do I want, and does the room make the other one trivial?`,`How long, in seconds, between failing this room and attempting it again? What sits in that gap: a loading screen, a walk, a cutscene?`,`If the player leaves halfway, what state is the room in when they return? Can it ever be left unsolvable?`,`Is this puzzle required to finish the game? If yes, what does a player who cannot do it get?`,`What does the boss ask that the dungeon’s rooms did not? If the answer is "nothing", is that the intent, or is the boss a flat repeat?`,`How many rooms in a row are puzzles, and how many in a row are fights? Does the player ever get a rest that is neither?`],
    trade:[`A shared verb makes puzzles cheap and learnable, and it means a puzzle can be solved by brute force in combat style (spamming the verb). The room must make the unwanted solution fail: an idle ball that does nothing, a switch that needs a bounce.`,`Resetting a room on exit protects the player from softlocks and makes a long puzzle repeat from the start. Persisting progress in sub-steps respects their time and needs more authoring and a reset path.`,`Skill puzzles raise tension and fall to anyone with weak reflexes, an input device that is slow, or a physical limit. Logic puzzles with generous timing are the safer default; if the skill test is the point, add assist options rather than removing the test.`,`Optional puzzles let the player who likes puzzles go deep and keep the main path clear of them. They are also easy to skip entirely, so a reward worth taking must not decide whether the player can finish.`,`A puzzle boss makes the dungeon feel like one idea. It also means a player who is stuck on the puzzle idea is stuck at the boss too; the boss needs a different failure channel from the room.`],
    traps:[`A puzzle with one hidden verb: a switch that needs an input never used in combat, and never taught.`,`A long timed puzzle with no checkpoint, where each failure costs a walk back through enemies who respawned.`,`Room reset that wipes a solved puzzle, or leaves the room in a state no input can fix (the key was knocked into a pit).`,`Stacking three new mechanics in one dungeon room because the dungeon is "the combine step", with no earlier room using any of them alone.`,`A skill test used where a logic puzzle was meant: an exact-frame jump over a gap in a room the player is supposed to be thinking in.`,`A boss that ignores the dungeon item, so the dungeon’s lesson ends one room too early.`,`Hint systems that show the answer on first press instead of a ladder from nudge to solution.`],
    good:[`The first room of a dungeon uses its new item or gimmick alone, with nothing else to think about and no way to fail badly.`,`A player who dies in a puzzle room is back inside the attempt in a few seconds, with everything solved so far intact.`,`The boss uses the dungeon’s verb in a form the rooms did not (new timing, new target) and nothing new is needed to understand it.`],
    bad:[`The player learns the puzzle’s rule by dying to it.`,`The only way past a room is a skill test, with no assist and no alternative.`,`Optional puzzles hold the only copy of an item the main path needs.`] },
  how:[`List the verbs the player has by this point in the game: attack, dodge, throw, jump, and what the dungeon adds. Write each puzzle in the dungeon as a sentence in those verbs only ("bounce the ball off the east wall into the switch"). A sentence that needs an unlisted verb is a teaching gap.`,`Build the dungeon as a spine of five beats: a safe room where the new item or gimmick is the only interesting thing, rooms that test it alone, a twist that changes its rule or its context, a room that combines it with an earlier gimmick or with enemies, and a boss that asks for it under pressure. Count the beats on the map; a missing beat is where players stall.`,`Alternate on purpose. Write the dungeon as a strip of P (puzzle) and C (combat) beats and look at it: no more than two of the same kind in a row is a good first rule to test, and a long run needs a rest or a reward in it.`,`Make the shared verb behave identically in a room and a fight. One function receives the hit for enemies, switches and crates (see the snippet). If a rule differs, say so in the world: a different colour for objects that only react to a bounced shot.`,`Classify each room as logic, skill or mixed, and then set its failure cost to match. Logic: failure should be cheap and slow-moving (a reset button, no damage). Skill: failure should be instant to retry (a checkpoint inside the room, the attempt restarts in under a few seconds).`,`Decide the reset rule per room and write it down: reset on exit, reset on death, persist solved sub-steps, or persist all. Then try to break it: leave halfway, die halfway, lose a key item, quit and reload. Any state from which nothing can be done is a bug, not difficulty.`,`Put a checkpoint inside any room that has an unskippable skill sequence, after the part that was solved. Put the reset trigger where the player can see it (a visible altar or floor mark), so reset is a choice, not a guess.`,`Mark each puzzle as required or optional in the design file. Required puzzles get the hint ladder and, where the game allows, a skip. Optional puzzles get a reward that is not needed to finish.`,`Offer hints in three steps: where to look, what the room is about, then the solution. Delay each step by play time, not just deaths. New Super Mario Bros. Wii offers a demonstration after eight deaths in a row in a level (single player), which the player can interrupt, then retry or skip.`,`Write the boss as a puzzle of the same grammar: name the dungeon verb, name the new twist (timing, target, scale) and check that the boss is not solvable by an earlier verb alone. Then playtest it with someone who has not met the dungeon’s hint.`,`Run a blind playtest of each room. Record where the player says the answer aloud, how many attempts it took, and the seconds from each failure to the next attempt.`],
  ai:{ yes:[`Check a dungeon plan for beat balance: list the rooms as P and C beats, flag long runs and missing rests, and suggest where a rest or a reward goes.`,`Enumerate the ways to break a room (leave halfway, lose an item, knock a key into a pit) from a described layout and the reset rule, and list every state with no way forward.`,`Draft a three-step hint ladder for a puzzle whose solution you give, with the first step safe to show without spoilers.`,`Rewrite each room of a dungeon in a fixed verb list and flag every room that needs a verb that has not yet been taught.`],
       no:[`Say whether a puzzle is satisfying, or whether a skill gate is too hard for your players. Only a playtest with real hands shows that.`,`Tune timing windows or retry costs. They depend on your input latency, your frame rate and your audience.`,`Decide which players your game is for, and so which puzzles are skippable.`] },
  prompts:[{l:'Dungeon beat audit',p:`Here is a dungeon as a list of rooms with one line each (puzzle, combat, or both, the verbs used, and where each verb was first taught): [PASTE]. Write it as a strip of P and C beats. Flag every run of three or more of the same kind, every room that uses a verb not yet taught, and any missing step among: safe teach, test alone, twist, combine, boss. Suggest one change per flag and say what it costs. Do not invent rooms I did not list.`},
    {l:'Break the room',p:`A puzzle room works like this: [DESCRIBE LAYOUT, OBJECTS, VERBS, RESET RULE, CHECKPOINTS]. List every sequence of player actions (leaving, dying, throwing an item out of reach, reloading a save) that ends in a state the player cannot get out of without a full restart. For each, say whether the reset rule or the layout should change.`}],
  verify:[`Does every puzzle sentence use only verbs the player has already used in combat or in an earlier room?`,`For each room, is there a measured number for the seconds between a failure and the next attempt?`,`Can any room be left in a state with no solution? Did you try leaving, dying, reloading and losing the item?`,`Does the boss need the dungeon’s verb, and is there at least one earlier room that taught the part of it the boss uses?`,`Is every required puzzle either hinted, skippable or both, and does every optional puzzle hold only a reward that is not needed to finish?`],
  test:[`Watch five blind players through one dungeon. Mark each room: time to solve, number of failures, whether they said the answer aloud, and where they looked first.`,`Time the loop from failing a skill room to the next attempt, with a stopwatch, on the target device. Compare it with what you wrote as the budget.`,`Have one player who is poor at execution and one who is poor at puzzles play the same room. If both stall on the same room, it may be testing two things at once.`,`Sequence test: shuffle two rooms of a dungeon and see whether anyone solves the later one first. If nobody can, its teaching depends on the order, and you should check it was meant to.`,`Ask a tester to say, after the boss, what the dungeon was about. If the answer is not the dungeon’s verb, the boss or the rooms are not carrying it.`],
  facts:[{claim:`CrossCode, developed by Radical Fish Games, uses one ball-launching mechanic for both combat and puzzles; its puzzle elements include switches, boxes, barriers and fans, and the studio crowdfunded the game on Indiegogo in February 2015 before a PC release on 20 September 2018.`,asOf:'2026-10-05',src:'https://en.wikipedia.org/wiki/CrossCode'},
    {claim:`The game-accessibility guideline "Offer a means to bypass gameplay elements that aren’t part of the core mechanic, via settings or in-game skip option" is rated Intermediate on Game Accessibility Guidelines, with examples including LA Noire’s skip action sequence option and Nier: Automata’s Auto Chips.`,asOf:'2026-10-05',src:'https://gameaccessibilityguidelines.com/offer-a-means-to-bypass-gameplay-elements-that-arent-part-of-the-core-mechanic-via-settings-or-in-game-skip-option/'},
    {claim:`New Super Mario Bros. Wii’s Super Guide appears after a player dies eight times in a row in a level in single-player and lets a computer-controlled Luigi demonstrate a safe route; the player can interrupt it or skip the level.`,asOf:'2026-10-05',src:'https://en.wikipedia.org/wiki/New_Super_Mario_Bros._Wii'},
    {claim:`Portal was developed over roughly two years and four months at Valve by a team of no more than ten, grown from the 2005 DigiPen project Narbacular Drop, and released on 10 October 2007 in The Orange Box.`,asOf:'2026-10-05',src:'https://en.wikipedia.org/wiki/Portal_(video_game)'},
    {claim:`Breath of the Wild contains four Divine Beasts built as extended puzzles and shrines holding challenges from puzzles to battles (all but the four opening Great Plateau shrines are optional; those four must be completed to get the paraglider and leave the plateau); its producer said a physics-based puzzle can have several solutions.`,asOf:'2026-10-05',src:'https://en.wikipedia.org/wiki/The_Legend_of_Zelda:_Breath_of_the_Wild'}],
  rel:[['puzzle-design','This topic assumes the puzzle fundamentals (fair clues, one aha, hint ladders) and covers what changes when the player also has to fight and move.'],['level-structure','The teach, test, twist, combine beats are a level-structure pattern; this topic fits them to a puzzle dungeon.'],['encounter-design','A fight in a puzzle dungeon is an encounter built from the same verbs; encounter-design covers composing enemies, space and stakes.'],['items-weapons-abilities','The dungeon item is an ability whose design (new verb versus bigger number) decides whether rooms can be built from it.'],['challenge-failure-recovery','Retry cost, checkpoints and reset rules are failure-recovery design applied to a room.'],['onboarding','The safe first room of a dungeon is onboarding at small scale: one new idea, nothing else.'],['backtracking-and-return-trips','An ability-gated door seen early and opened later is the same lock-and-key promise at map scale; that topic covers the return trip, this one the rooms.'],['accessibility','Skippable puzzles, assist options and timing-window options are accessibility choices that change who can finish.'],['combat-design','The boss is a combat design brief with a puzzle grammar; combat-design covers attacks, telegraphs and moves.'],['pacing','Alternating puzzle and fight beats is a pacing pattern; pacing explains why rests matter.']] });
TECH('puzzles-in-action-spaces',[
  {n:'Shared verb (the combat kit solves the room)', how:`Enemies, switches and crates all take a hit from the same projectile or attack. CrossCode’s ball hits an enemy, a switch or a box; puzzle elements react to it in different ways, and some must be hit in a certain order or within a time limit.`, fit:`Games with a strong combat verb and a small team, because puzzles need no new art or tutorial.`, cost:`Players can brute-force with the verb. Rooms must make the cheap solution fail (a switch that needs a bounce, a shield the ball cannot hit head on).`, alt:`A dedicated puzzle tool per dungeon, which is clearer and costs a tutorial each time.`},
  {n:'One item per dungeon', how:`The dungeon hands the player an item early, rooms test it alone, then in combination, and the boss needs it. Zelda dungeons are the standard model; Aonuma describes planning how the player will use the item on the environment.`, fit:`Dungeons with a clear identity and a progression where each item adds one verb.`, cost:`Predictable. Players learn to expect that the new item is the key, so the aha shifts from "which tool" to "where".`, alt:`Give the item late or twice: make the player find the right old tool.`},
  {n:'Teach, then combine', how:`A room introduces a gimmick on its own, the next tests it, a twist changes its rule or context, and only then do two gimmicks meet. A 2008 study of Portal as instructional scaffolding (cited by Wikipedia, not a Valve statement) describes early chambers with obvious hints that are removed as the game goes, which is the same shape.`, fit:`Any game with more than one gimmick. It is the cheapest way to make a hard room feel fair.`, cost:`Length. Each gimmick needs three or four rooms before the combine, so scope grows with the gimmick count.`, alt:`Teach in combat first, so the puzzle only asks the player to apply what a fight taught.`},
  {n:'Checkpoint inside the room', how:`A visible point (a switch that stays flipped, a door that stays open) marks solved sub-steps; death returns the player to it, not to the room entrance.`, fit:`Long skill sequences and multi-step rooms where a repeat is the main frustration.`, cost:`Must be authored per room, and a stale checkpoint can trap the player in a half-solved state; check it with the break-the-room test.`, alt:`Short rooms whose full reset costs only a few seconds.`},
  {n:'Reset on exit', how:`Leave a room and its objects return to their start unless the room was solved. A common pattern in 2D Zelda-style rooms (observed in play, not cited here).`, fit:`Rooms with pushable blocks or throwable objects, where a softlock is possible.`, cost:`Long rooms are punished for a mid-room trip out. Pair it with a solved flag so finished rooms stay finished.`, alt:`A visible reset device the player chooses to use.`},
  {n:'Hint ladder and assist', how:`Three hints from nudge to solution, timed by play time; a skip for required puzzles, or an assist (slower timing, more tolerance) for skill rooms. New Super Mario Bros. Wii’s demonstration after eight deaths in a row is one shipped form.`, fit:`A wide audience, or a game with required puzzles in an action wrapper.`, cost:`Authoring a ladder per puzzle, and the risk that the first hint solves it. Test with blind players.`, alt:`No hints, with a very strong fair-clue rule.`},
  {n:'Boss as final exam of the verb', how:`The boss asks for the dungeon’s verb in a changed form. Zelda games vary in how strictly the boss needs the dungeon item (my reading, not sourced here; Mark Brown’s Game Maker’s Toolkit Boss Keys series maps this game by game and is worth watching before you copy the pattern).`, fit:`Dungeon games where each dungeon is one idea.`, cost:`A boss that is only the room again is flat. A boss with a verb the rooms never taught is unfair.`, alt:`A boss from the combat kit alone, which tests the player and not the dungeon.`}
]);
ENGINE('puzzles-in-action-spaces',{
  godot:{ term:`The shared verb is one projectile and one method. The ball bounces off anything that cannot be hit and calls on_hit on anything that can, so an enemy, a switch and a crate all answer to the same code.`,
    api:['CharacterBody2D.move_and_collide()','KinematicCollision2D.get_collider()','KinematicCollision2D.get_normal()','Vector2.bounce()','Object.has_method()'],
    snippet:`extends CharacterBody2D
# One projectile: it solves the room and fights in it.
var bounces := 0
var vel := Vector2.RIGHT * 300.0

func _physics_process(dt: float) -> void:
\tvar hit := move_and_collide(vel * dt)
\tif hit == null:
\t\treturn
\tvar other := hit.get_collider()
\tif other.has_method("on_hit"):
\t\tother.on_hit(self)          # enemy, switch, crate
\t\tqueue_free()
\telse:
\t\tvel = vel.bounce(hit.get_normal())  # remainder dropped
\t\tbounces += 1`,
    pitfall:`A switch that accepts any hit lets the player skip the puzzle by firing from where they stand. Put the rule in the receiver: its on_hit reads ball.bounces and ignores a shot that has not ricocheted.`,
    map:`Godot’s has_method("on_hit") duck-typing is Unity’s IHittable interface found with TryGetComponent.` },
  unity:{ term:`Define one interface and give it to every receiver. The projectile is a Rigidbody2D with a bouncy material, and it calls OnHit when it touches an IHittable and counts any other contact as a bounce.`,
    api:['Collision2D.collider','Component.TryGetComponent<T>()','Rigidbody2D','PhysicsMaterial2D.bounciness','Object.Destroy()'],
    snippet:`using UnityEngine;

public interface IHittable { void OnHit(Ball ball); }

public class Ball : MonoBehaviour {
    public int bounces;     // Rigidbody2D: gravity 0, material bounciness 1

    void OnCollisionEnter2D(Collision2D c) {
        if (c.collider.TryGetComponent<IHittable>(out var h)) {
            h.OnHit(this);              // enemy, switch, crate
            Destroy(gameObject);
        } else {
            bounces++;                  // the material reflects it
        }
    }
}`,
    pitfall:`Counting a bounce when the ball touches a wall twice in one physics step, or when it rests against a corner. Check that a switch that needs one bounce cannot be passed by a shot that slid along a wall.`,
    map:`A PhysicsMaterial2D with bounciness 1 and no friction does roughly what Vector2.bounce() does by hand in Godot; the docs call bounciness 1 only approximately perfect elasticity, and contacts below Physics2D.bounceThreshold are treated as inelastic, so a slow ball stops bouncing.` },
  note:`Both snippets show the shared-verb idea. The reset and checkpoint rules are not engine features: they are state you write down per room, as a solved flag and a list of sub-step flags the room restores on entry.` });
INTERVIEW('puzzles-in-action-spaces',{
  junior:[
    { q:`Why would you build puzzles from the combat kit instead of adding new puzzle tools?`,
      a:`The player already knows the verb, so the puzzle needs no tutorial, and the same practice carries between fights and rooms. CrossCode is the model: one ball solves switches and hits enemies. The cost is brute force, so the room must make the cheap solution fail.`,
      follow:`How does a switch tell a clever shot from a lazy one?`,
      red:`Says it is only a way to save art, or does not mention that players can brute-force it.` },
    { q:`What is the difference between a logic puzzle and a skill puzzle, and why does it matter in an action game?`,
      a:`In a logic puzzle the answer is hard to find and easy to do; in a skill puzzle the answer is plain and hard to do. Failure costs differ: logic wants slow, cheap failure; skill wants instant retry. A room that mixes them without meaning to stalls players on the wrong one.`,
      follow:`Give one room that tests both on purpose.`,
      red:`Treats all puzzles as one kind.` }
  ],
  mid:[
    { q:`How do you lay out a dungeon so it teaches its gimmick and then combines it?`,
      a:`A safe room with only the gimmick, rooms that test it alone, a twist that changes its rule or context, a combine room with an earlier gimmick or enemies, then a boss. Count the beats on the map and playtest the order. Portal is often read this way: a 2008 study describes heavy hints first and fewer as it goes.`,
      follow:`What do you do if blind players stall in the combine room?`,
      red:`Adds a hint text without checking whether an earlier room taught the pieces.` },
    { q:`Where do you put checkpoints and resets in a puzzle room?`,
      a:`Inside any long skill sequence, after the solved part, and visible. Decide per room: reset on exit, on death, persist sub-steps. Then test leaving, dying, reloading and losing an item, because the reset rule can create a state with no way forward.`,
      follow:`How do you find a softlock before players do?`,
      red:`Puts the checkpoint at the dungeon entrance only.` },
    { q:`How do you handle players who dislike puzzles in an action game?`,
      a:`Mark each puzzle as required or optional. Optional ones carry a reward not needed to finish. Required ones get a hint ladder and, where possible, a skip or assist. The Game Accessibility Guidelines list a bypass for elements outside the core mechanic.`,
      follow:`A required puzzle is the game’s identity. Do you still add a skip?`,
      red:`Says players should just try harder.` }
  ],
  senior:[
    { q:`The dungeon boss is a puzzle too. How do you design it so it is a test of the dungeon and not a repeat of a room?`,
      a:`Name the dungeon verb and the new twist. The boss asks for the verb in a changed form (timing, target, scale) that no room used, and no earlier verb solves it alone. Zelda games vary in how strictly a boss needs the dungeon item (my reading; check Mark Brown’s Boss Keys series for the game you copy). Test with someone who has not seen a hint.`,
      follow:`What do you change when the boss is the point where most players quit?`,
      red:`Makes the boss bigger instead of clearer.` },
    { q:`Three dungeons share one set of verbs. Six months in, the combat team changes the ball’s speed. What breaks, and how do you protect against it?`,
      a:`Every timing-based room that assumed the old speed, every bounce count and every skill window. A shared verb couples combat tuning to puzzles. Protect with a list of rooms by the verb parameters they depend on, a test level for each room, and a rule that a verb change needs the room list reviewed.`,
      follow:`Which rooms would you pull out into data so tuning is cheap?`,
      red:`Says they will find out in QA.` },
    { q:`You can ship either a skip for every required puzzle or a tuned hint ladder. Budget is for one. Which and why?`,
      a:`It depends on the audience and on whether the puzzle is the game’s identity. For a mixed audience, a skip protects progress, and a ladder protects the aha. A ladder is cheaper to author per puzzle when puzzles are many and short; a skip costs more when the puzzle gates a boss or a story beat. Name the audience, say what you lose, test with a stuck player.`,
      follow:`How would you measure which was needed?`,
      red:`Picks one without naming who it is for.` }
  ] });
DIAGRAM('puzzles-in-action-spaces',{ kind:'flow', title:'A puzzle dungeon: teach, test, twist, combine, boss', note:'The shape most Zelda-style dungeons follow; the ordering is a design heuristic to test, not a law.',
  steps:[{ id:'teach', t:'Safe teach room', d:'new item alone' },{ id:'test', t:'Test rooms', d:'item solves puzzles, then a fight' },{ id:'twist', t:'Twist', d:'rule or context changes' },{ id:'combine', t:'Combine', d:'with enemies or an old gimmick' },{ id:'rest', t:'Rest or reward', d:'before the boss' },{ id:'boss', t:'Boss', d:'item in a new form' }],
  edges:[['teach','test'],['test','twist'],['twist','combine'],['combine','rest'],['rest','boss']] });
EXPLAINER('puzzles-in-action-spaces', { kind:'explainer', title:'A dungeon alternates puzzle and fight beats, then the boss asks for both',
  frames:[
    { t:'The safe room: one idea, no pressure', d:'An illustrative shape, not a measured one.', spec:{ kind:'curve', x:'Rooms, entrance to boss', y:'Load on the player', alt:'Puzzle load is flat and low, with one small bump for the new item.', series:[{ t:'Puzzle load', pts:[[0,0.15],[0.08,0.25],[0.17,0.15]] }] } },
    { t:'Test rooms add puzzles, then a fight uses the same verb', spec:{ kind:'curve', x:'Rooms, entrance to boss', y:'Load on the player', alt:'Puzzle load rises in the test rooms and falls as a fight using the same verb raises fight pressure.', series:[{ t:'Puzzle load', pts:[[0,0.15],[0.08,0.25],[0.17,0.35],[0.33,0.25]] }, { t:'Fight pressure', pts:[[0,0.05],[0.17,0.1],[0.33,0.45]] }] } },
    { t:'The twist raises puzzle load again', d:'The player is thinking, not fighting.', spec:{ kind:'curve', x:'Rooms, entrance to boss', y:'Load on the player', alt:'Puzzle load climbs to a second peak while fight pressure stays low.', beats:[{ t:'twist', at:0.5 }], series:[{ t:'Puzzle load', pts:[[0,0.15],[0.08,0.25],[0.17,0.35],[0.33,0.25],[0.5,0.7]] }, { t:'Fight pressure', pts:[[0,0.05],[0.17,0.1],[0.33,0.45],[0.5,0.15]] }] } },
    { t:'Combine: both rise together', spec:{ kind:'curve', x:'Rooms, entrance to boss', y:'Load on the player', alt:'Puzzle load and fight pressure meet at the highest point of the dungeon before the boss.', beats:[{ t:'twist', at:0.5 }, { t:'combine', at:0.67 }], series:[{ t:'Puzzle load', pts:[[0,0.15],[0.08,0.25],[0.17,0.35],[0.33,0.25],[0.5,0.7],[0.67,0.8]] }, { t:'Fight pressure', pts:[[0,0.05],[0.17,0.1],[0.33,0.45],[0.5,0.15],[0.67,0.75]] }] } },
    { t:'A rest beat, then the boss asks for both', spec:{ kind:'curve', x:'Rooms, entrance to boss', y:'Load on the player', alt:'Both lines drop in the rest room, then the boss spikes both together.', beats:[{ t:'twist', at:0.5 }, { t:'combine', at:0.67 }, { t:'rest', at:0.83 }], series:[{ t:'Puzzle load', pts:[[0,0.15],[0.08,0.25],[0.17,0.35],[0.33,0.25],[0.5,0.7],[0.67,0.8],[0.83,0.2],[1,0.85]] }, { t:'Fight pressure', pts:[[0,0.05],[0.17,0.1],[0.33,0.45],[0.5,0.15],[0.67,0.75],[0.83,0.2],[1,0.95]] }] } }
  ] });
