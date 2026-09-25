/* =====================================================================
   NARRATIVE
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'narrative', lens:'design', t:'Narrative', short:'Premise, world, agency, ludonarrative alignment', color:'var(--d-narrative)',
    sum:`What the player does should reinforce what the story says. Narrative is not a department. It is the meaning layer that makes mechanics feel like they matter and the world feel worth saving, exploring or ruling.`,
    links:[['experience','Story is the most direct tool for the fantasy and the long-term emotional arc.'],['content','Quests, characters and environmental detail deliver narrative through content.'],['systems','Systems can tell stories no script can: emergent narrative comes from rules colliding.'],['level','Environmental storytelling is level design with authorial intent.']] });

T('premise-and-world',{ d:'narrative', t:'Premise, world and characters', tag:'The premise is why the fantasy matters. The world is where the systems live. Characters are who cares.',
  what:`The narrative foundation: a premise (the situation and the stakes), a world (rules, places, factions, history that the systems inhabit), and characters (people whose wants create conflict and give the player someone to be and someone to care about). In games these exist to make the fantasy legible and the mechanics meaningful. Steins;Gate builds its central conspiracy on a real internet hoax, the “John Titor” time-traveller posts of 1998 to 2001, rather than inventing an equivalent myth from scratch.`,
  why:[`Premise supplies stakes: why should the player care whether they win?`,`World rules and system rules should be the same rules. When they diverge players stop believing either.`,`Characters are the fastest route to relatedness and to memorable moments.`],
  think:{ q:[`Can the premise be said in one sentence that includes the player’s role and the stakes?`,`Does the world explain the mechanics? Why can the player do what they can do?`,`Which character wants something the player must decide about?`,`What does the player do in this world that no other world would let them do?`],
    trade:[`Deep lore rewards invested players and costs more than most will read.`,`Original settings differentiate and require more teaching.`],
    traps:[`Lore as a substitute for premise: pages of history, no stakes.`,`Characters who only deliver quests.`,`World rules that contradict the system rules (“magic is rare” in a world where the player casts constantly).`],
    good:[`Players describe the situation, not the setting.`,`Players have opinions about characters.`],
    bad:[`Players skip every line and could not name the antagonist.`] },
  how:[`Write the premise sentence with the player role and stakes. Test it on someone who has not seen the game.`,`Map world rules to system rules. Fix contradictions on whichever side is cheaper.`,`Give each major character a want that intersects a player decision.`,`Cut lore that no system or decision touches, or move it to optional discovery.`],
  ai:{ yes:[`Generate premise candidates from a fantasy and mechanic list.`,`Audit world rules against system rules for contradictions.`,`Draft character wants that intersect existing decisions.`,`Write optional lore once the load-bearing narrative is set.`],
       no:[`Choose the premise. It is the identity of the game.`,`Decide how much story the player wants.`] },
  prompts:[{l:'Premise from mechanics',p:`Our fantasy is “[FANTASY]” and our core mechanics are [LIST]. Generate 8 premise sentences, each including the player role and the stakes, that would make these mechanics feel inevitable in the world. For each, state one world rule that explains a mechanic and one character whose want intersects a player decision. Flag premises that would require mechanics we do not have.`}],
  verify:[`Does the premise explain the mechanics, or merely decorate them?`],
  test:[`Ask players to describe the situation they are in. Stakes and role pass. Setting adjectives fail.`,`Can players name a character and what they want?`,`Where do players skip text? What did they miss that mattered?`],
  rel:[['fantasy','Premise is fantasy with stakes.'],['ludonarrative-alignment','World rules and system rules must agree.'],['quests-and-events','Characters deliver goals.'],['environmental-storytelling','The world tells its own story when composed to.']] });
TECH('premise-and-world',[
  {n:'Premise worksheet', how:`One paragraph: the world’s rule, the player’s place, the conflict, the tone.`, fit:`Giving every discipline a shared touchstone.`, cost:`Easy to over-specify. Leaves room for discovery.`, alt:`Test the premise against the fantasy and the loop.`},
  {n:'World rules and consistency', how:`Define what is possible and impossible. The rules become design and story constraints.`, fit:`Making the world feel real and coherent.`, cost:`Rules can lock out later ideas. Keep them few and load-bearing.`, alt:`Document them. Break them only deliberately.`},
  {n:'Tone bible', how:`Reference art, sound and writing that define the target tone for all disciplines.`, fit:`Cohesion across a large team.`, cost:`Upkeep. Can be ignored if not used in reviews.`, alt:`Use in every critique.`}
]);
ENGINE('premise-and-world',{
  godot:{ term:`World rules are Resource assets with class_name, saved as .tres. Dialogue and combat both load the same file, so a world rule and a system rule are literally one asset and cannot drift apart.`,
    api:['Resource subclass + class_name','@export typed properties','ResourceLoader.load() / .tres files','Resource.duplicate()','resource_local_to_scene','@tool for editor-time validation'],
    snippet:`extends Resource
class_name FactionRule                         # one .tres, read by dialogue and combat
@export var id: StringName
@export var hostile_to: Array[StringName] = []
@export var can_cast := false                  # the world rule is the system rule

func hostile(other: StringName) -> bool:
\treturn other in hostile_to

static func runtime_copy(r: FactionRule) -> FactionRule:
\treturn r.duplicate()                       # never mutate the shared .tres at runtime`,
    pitfall:`Writing runtime state onto an exported Resource. Every node that exports the same .tres holds the same instance, so one faction turning hostile turns it hostile everywhere, and because the game runs in a separate process from the editor, nothing reaches the .tres, so the bug looks like faulty dialogue logic rather than shared state. Duplicate it for runtime, or set resource_local_to_scene.`,
    map:`A Godot .tres Resource with class_name is a Unity ScriptableObject with CreateAssetMenu.` },
  unity:{ term:`ScriptableObject assets for factions, places and world rules, created from the asset menu and referenced by both the dialogue database and the combat code. OnValidate catches an incomplete rule in the editor.`,
    api:['ScriptableObject + [CreateAssetMenu]','[SerializeField] references from scenes and prefabs','OnValidate()','ScriptableObject.CreateInstance() for runtime copies','Addressables for late-loaded world data','Debug.LogError(message, context)'],
    snippet:`[CreateAssetMenu(menuName = "World/Faction Rule")]
public class FactionRule : ScriptableObject {
    public string id;
    public string[] hostileTo;
    public bool canCast;                       // the world rule is the system rule

    public bool Hostile(string other) => System.Array.IndexOf(hostileTo, other) >= 0;

    void OnValidate() {                        // fail loudly in the editor, not on device
        if (string.IsNullOrEmpty(id)) Debug.LogError(name + ": faction id is empty", this);
    }
}`,
    pitfall:`Tuning a ScriptableObject during play mode. Unlike scene objects it is not reverted when play stops, so the value looks like it persisted and gets treated as the authored one. In a player build the change lives only in memory and is gone at the next launch, so the balance you thought you saved exists only on your machine.`,
    map:`A Unity ScriptableObject is a Godot Resource saved as .tres.` }});
INTERVIEW('premise-and-world',{
  junior:[
    { q:`State the premise of a game you admire in one sentence, including the player’s role and the stakes.`,
      a:`Premise is the situation and what is at risk, not the setting. Say who the player is in it and what happens if they fail. Then name one mechanic the world explains: why can the player do this thing here. If the sentence works, someone who has never seen the game can repeat it.`,
      follow:`Which mechanic does that world explain, and which one does it fail to explain?`,
      red:`Recites setting adjectives and factions and never names a stake.` },
    { q:`What is the difference between premise, setting and lore?`,
      a:`Premise is the situation plus the stakes. Setting is where and when. Lore is the accumulated history behind both. Premise is load-bearing because it gives the player a reason to care whether they win. Lore is optional depth, and cutting it first costs the least.`,
      follow:`Which of the three would you cut first under a content cut, and why?`,
      red:`Uses the three words interchangeably.` },
    { q:`What makes a game character work, as opposed to a film character?`,
      a:`They want something that intersects a decision the player makes, so the player’s choice has a person attached to it. A character who only hands out objectives is a menu with a face. The fastest route to relatedness is a want the player can help or refuse.`,
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
      follow:`The bible’s author is the creative director. How do you run that conversation?`,
      red:`Proposes deleting the bible, or accepts it untouched and writes systems around it.` },
    { q:`How do you keep narrative and systems from becoming two departments that hand documents to each other?`,
      a:`Put story beats and play beats on one timeline both sides sign. Give each major character a want that lands on a designed decision, so the writer and the designer are working on the same object. Review together on the build rather than on documents, and make the contradiction list a standing item.`,
      follow:`What is the single artifact both disciplines own?`,
      red:`Describes a handoff process and a review meeting as the answer.` }
  ] });

T('ludonarrative-alignment',{ d:'narrative', t:'Ludonarrative alignment', tag:'What the player does should say the same thing the story says. When they disagree, players believe the doing.',
  what:`The relationship between what the mechanics express (the ludic message) and what the story says (the narrative message). Clint Hocking named the failure ludonarrative dissonance, critiquing a game whose systems rewarded selfishness while its story preached altruism. Alignment means the mechanics enact the theme. Deliberate dissonance can be an expressive tool, but only if the player is meant to feel it. Grand Theft Auto V shows the same gap at feature-length scale: its plot frames the pursuit of money as hollow and self-destructive, while its core loop rewards exactly that pursuit with cash, cars and property, and never docks the player for winning at the thing the story condemns.`,
  why:[`Players spend far more time doing than watching. The mechanics are the loudest narrator.`,`Dissonance breaks belief in both story and system, and players sense it even when they cannot name it.`,`Alignment is the cheapest emotional amplifier: a mechanic that means something hits harder than a cutscene.`],
  think:{ q:[`What does the core loop say about the world, if you read it as a statement? Does the story agree?`,`Where does the game reward what the story condemns, or punish what the story praises?`,`Which mechanic could carry the theme directly? What would the player do that means the thing?`,`If there is dissonance, is it a design choice the player is meant to notice?`],
    trade:[`Tight alignment is powerful and constrains both story and systems.`,`Separating them gives each freedom and risks incoherence.`],
    traps:[`Story written first, mechanics bolted on, or the reverse, with integration deferred.`,`Themes stated in dialog and contradicted by rewards.`,`Cutscenes that take away agency at the moment the theme is about agency.`],
    good:[`Players describe the theme in terms of what they did.`,`A mechanic makes players feel something without a line of dialog.`],
    bad:[`Players say the story and the game feel like different products.`] },
  how:[`Write the loop’s implicit statement. Write the story’s explicit theme. Compare.`,`For each major dissonance, decide: change the mechanic, change the story, or make the dissonance deliberate and perceived.`,`Find one theme-carrying mechanic: a player action that means the theme.`,`Test whether players describe the theme from their own actions.`],
  ai:{ yes:[`Read the loop and progression as statements and compare with the script.`,`Enumerate reward and punishment structures that contradict stated themes.`,`Propose theme-carrying mechanics.`],
       no:[`Decide the theme.`,`Decide whether a dissonance is expressive or a defect.`] },
  prompts:[{l:'Ludonarrative audit',p:`Read our mechanics, rewards and punishments as a statement about the world: [SYSTEMS]. Then compare with our story themes and key scenes: [STORY]. List every place the mechanics reward what the story condemns or punish what it praises. For each, propose (a) a mechanic change, (b) a story change, and (c) how to make the dissonance deliberate and perceived, and state which option is cheapest. Then propose one mechanic that would enact the central theme directly.`}],
  verify:[`Did it analyse rewards and punishments, or only surface content?`],
  test:[`Ask players what the game is about. Do they answer with actions?`,`Where do players laugh at a scene that was meant seriously? That is often dissonance.`,`Does a theme-carrying mechanic produce an emotional reaction without dialog?`],
  rel:[['fantasy','The fantasy is who the player is. The story must agree.'],['premise-and-world','World rules and system rules are one set.'],['narrative-agency','Agency is the most common site of dissonance.'],['core-loop','The loop is the loudest narrator.']] });
TECH('ludonarrative-alignment',[
  {n:'Mechanic-story audit', how:`List what the mechanics reward and what the story says is good. Flag contradictions.`, fit:`Finding dissonance early.`, cost:`Some dissonance is intentional. Judge, do not just flag.`, alt:`Check the player’s verbs against the theme.`},
  {n:'Thematic verbs', how:`Make the core verb express the theme (protecting, freeing, hoarding, connecting).`, fit:`Aligning moment-to-moment play with meaning.`, cost:`Constrains mechanics. May fight fun.`, alt:`Choose mechanics whose natural play matches the theme.`}
]);
ENGINE('ludonarrative-alignment',{
  godot:{ term:`The audit is a tool script. An EditorScript walks the reward resources, compares what each one rewards against the chapter’s stated theme, and prints every contradiction as a warning you can run before a review.`,
    api:['@tool + EditorScript._run()','DirAccess.get_files_at()','ResourceLoader.load()','push_warning() / push_error()','EditorInterface for opening the offending resource','Resource subclasses for reward and chapter data'],
    snippet:`@tool
extends EditorScript                           # Script editor: File > Run
const THEME := {"chapter_1": "mercy"}

func _run() -> void:
\tfor f in DirAccess.get_files_at("res://data/rewards"):
\t\tvar r: RewardData = load("res://data/rewards/" + f)
\t\tvar theme: String = THEME.get(r.chapter, r.expresses)
\t\tif r.expresses != theme:
\t\t\tpush_warning("%s rewards %s in a chapter about %s" % [f, r.expresses, theme])`,
    pitfall:`Writing the audit as runtime code. DirAccess cannot list res:// in an exported build the way it does in the editor, because only imported and included files exist there and .tres source files may be stripped entirely. The tool works on your machine and returns an empty list in CI, which reads as “no contradictions found”.`,
    map:`Godot’s @tool and EditorScript are Unity’s Editor-folder script with a MenuItem.` },
  unity:{ term:`An editor menu item that queries the asset database for every reward asset and compares it against the chapter theme. It lives in an Editor assembly so it never reaches a build.`,
    api:['[MenuItem("…")]','AssetDatabase.FindAssets("t:RewardData")','AssetDatabase.GUIDToAssetPath() / LoadAssetAtPath<T>()','Debug.LogWarning(message, context)','Assets/Editor folder or an asmdef with Editor platform only','EditorUtility.DisplayDialog()'],
    snippet:`public class AlignmentAudit {                  // Assets/Editor/AlignmentAudit.cs only
    [MenuItem("Design/Audit mechanic vs theme")]
    static void Run() {
        foreach (var guid in AssetDatabase.FindAssets("t:RewardData")) {
            var path = AssetDatabase.GUIDToAssetPath(guid);
            var r = AssetDatabase.LoadAssetAtPath<RewardData>(path);
            var theme = ChapterTheme.Of(r.chapter);
            if (r.expresses != theme)
                Debug.LogWarning(path + " rewards " + r.expresses + " in " + theme, r);
        }
    }
}`,
    pitfall:`Letting the audit drift into a runtime script. UnityEditor and AssetDatabase are stripped from player builds, so the file compiles in the editor, every play-mode test passes, and the build fails at the very end with a missing namespace error. Keep it under an Editor folder, or wrap it in the editor-only compilation symbol.`,
    map:`A Unity Editor MenuItem over AssetDatabase is a Godot EditorScript over DirAccess and load().` }});
INTERVIEW('ludonarrative-alignment',{
  junior:[
    { q:`What is ludonarrative dissonance? Give an example.`,
      a:`The mechanics say one thing and the story says another. The term came from Clint Hocking’s 2007 critique of BioShock: its systems told the player to act in their own interest, while its story made them help another character with no choice in the matter. Players spend more time doing than watching, so when the two disagree they believe the doing.`,
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
      a:`Write the implicit statement of the loop and progression: what does the game reward, what does it punish, what does it make trivial. Write the story’s explicit theme next to it. Compare the two and list every place a reward contradicts a stated value. Surface content is not the audit, the reward structure is.`,
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

T('environmental-storytelling',{ d:'narrative', t:'Environmental storytelling', tag:'Let the space tell it. Players trust what they discover more than what they are told.',
  what:`Story delivered through the arrangement of the world: a room that shows what happened, a path that implies who walked it, a landmark that promises a place. It respects the player’s attention and pace, and rewards observation with meaning. It overlaps level design and art direction.`,
  why:[`Discovered story feels owned. Told story feels imposed.`,`It costs no player time: the story is read while playing.`,`It makes the world feel authored and lived in, which supports both fantasy and immersion.`],
  think:{ q:[`What happened here, and what would the evidence of it look like?`,`Can the player read it in passing, or must they stop? Both are valid. Know which you want.`,`Does the environment promise something the systems deliver?`,`Is the story readable at the intended camera distance and pace?`],
    trade:[`Subtle storytelling rewards attentive players and is missed by most.`,`Explicit set dressing is legible and can feel staged.`],
    traps:[`Corpses with notes as the only vocabulary.`,`Environmental detail that contradicts the systems (a kitchen in a world with no food mechanic is fine, a locked armoury the player can never open is a broken promise).`],
    good:[`Players narrate what they think happened.`,`Players stop to look without being prompted.`],
    bad:[`Players walk through set dressing without a glance.`] },
  how:[`For each key space, write the event that happened there and three pieces of evidence.`,`Place evidence along the primary sightline for the must-read version, off it for the optional.`,`Check every promise the environment makes against what the systems can deliver.`,`Test: ask players what they think happened in a space.`,`Open on a space already under attack by an event the player did not start, as Mega Man X (1993) does with the highway its first stage begins on, so the stakes are read before any dialogue.`,`Stage the rule itself, not only a past event: Danganronpa: Trigger Happy Havoc rivets metal plates over every window and locks off whole floors, so players read “nobody leaves” from the architecture before Monokuma ever states the rule.`],
  ai:{ yes:[`Generate evidence sets for a stated past event and a space.`,`Audit spaces for promises the systems cannot keep.`],
       no:[`Decide what happened. The story is authored.`] },
  prompts:[{l:'Evidence set',p:`In [SPACE], the event that happened was [EVENT]. The camera is [DISTANCE/ANGLE] and the player passes through in about [SECONDS]. Propose 3 evidence sets: one readable in passing along the main sightline, one that rewards stopping, one that rewards returning later with new knowledge. For each, list objects, arrangement and what the player would infer. Avoid notes and corpses unless they are the only option, and say so if they are.`}],
  verify:[`Is the evidence readable at the stated camera and pace?`],
  test:[`Ask players what happened in a space. Compare with intent.`,`Where do players stop unprompted?`,`Which environmental promises did players try to collect on?`],
  rel:[['spatial-composition','Composition decides what is read.'],['premise-and-world','The world is the source of the stories.'],['visual-language','Art direction is the vocabulary.']] });
TECH('environmental-storytelling',[
  {n:'Set dressing and visual narrative', how:`Objects, damage and arrangement imply history and events without text.`, fit:`Worlds where the environment carries meaning and rewards attention.`, cost:`Art cost. Players may miss it entirely (that is often acceptable).`, alt:`Reinforce plot-critical beats with other channels.`},
  {n:'Gating and traversal as story', how:`The path and its obstacles tell the story through what the player must do.`, fit:`Making space a narrative agent, not just a backdrop.`, cost:`Can conflict with clean level flow if overdone.`, alt:`Let environment and level design be one workflow.`},
  {n:'Diegetic audio and documents', how:`Audio logs, graffiti, signs and ambient sound convey history in-world.`, fit:`Deepening a world for players who seek detail.`, cost:`Recording/writing and localisation. Can slow pacing if foregrounded.`, alt:`Keep optional and out of the critical path.`}
]);
ENGINE('environmental-storytelling',{
  godot:{ term:`A vignette is a small PackedScene placed in the world. A VisibleOnScreenNotifier3D plus a ray to the camera tells you whether it was seen, so “did anyone read this room” becomes a measurement.`,
    api:['VisibleOnScreenNotifier3D.screen_entered / screen_exited','PackedScene vignettes instanced along the route','PhysicsRayQueryParameters3D.create() / intersect_ray()','Viewport.get_camera_3d()','MultiMeshInstance3D for scattered dressing','Time.get_ticks_msec()'],
    snippet:`extends Node3D                                 # one vignette: what happened here
@export var caption := "looted, then barricaded"
var _seen_ms := 0
func _ready() -> void:
\t$Notifier.screen_entered.connect(_enter)   # VisibleOnScreenNotifier3D
\t$Notifier.screen_exited.connect(_exit)
func _enter() -> void:
\tvar cam := get_viewport().get_camera_3d().global_position
\tvar q := PhysicsRayQueryParameters3D.create(cam, global_position)
\tif get_world_3d().direct_space_state.intersect_ray(q).is_empty():
\t\t_seen_ms = Time.get_ticks_msec()       # in frustum and not behind a wall

func _exit() -> void:
\tif _seen_ms:
\t\tprint("%s seen for %d ms" % [caption, Time.get_ticks_msec() - _seen_ms])`,
    pitfall:`Treating VisibleOnScreenNotifier3D as proof the player saw it. It tests the node’s box against the camera frustum and ignores walls unless occlusion culling is set up, so a vignette behind a wall reports visible for the whole corridor. Every number you collect is inflated, and the room nobody read looks like the room everybody read.`,
    map:`Godot PackedScene vignettes plus VisibleOnScreenNotifier3D are Unity prefab variants plus OnBecameVisible.` },
  unity:{ term:`Vignettes are prefab variants of a base dressing prefab. Renderer visibility callbacks plus a linecast to the camera record whether the story got read, at what distance, for how long.`,
    api:['OnBecameVisible() / OnBecameInvisible()','Physics.Linecast()','Prefab Variants','GPU instancing / Graphics.DrawMeshInstanced for scatter','Application.isPlaying','Debug.Log with a context object'],
    snippet:`[RequireComponent(typeof(Renderer))]
public class Vignette : MonoBehaviour {
    [SerializeField] string caption = "looted, then barricaded";
    float seen;

    void OnBecameVisible() {                                  // also fires for the Scene view
        if (!Application.isPlaying) return;
        var cam = Camera.main.transform.position;
        if (!Physics.Linecast(cam, transform.position)) seen = Time.time;
    }

    void OnBecameInvisible() {
        if (seen > 0f) Debug.Log(caption + " seen for " + (Time.time - seen) + "s");
    }
}`,
    pitfall:`Collecting visibility telemetry in the editor. OnBecameVisible fires for any camera that renders the object, including the Scene view, so every vignette the designer looked at while dressing the room is logged as a player read. It also never fires when the renderer is disabled or on a culled layer, so real reads go missing in the other direction.`,
    map:`Unity renderer visibility callbacks are Godot’s VisibleOnScreenNotifier3D signals.` }});
INTERVIEW('environmental-storytelling',{
  junior:[
    { q:`What is environmental storytelling and why do players trust it more than a cutscene?`,
      a:`Story delivered by how the world is arranged: what is broken, what is missing, what was left mid-task. It is discovered rather than told, so players feel they own the conclusion. It also costs the player no time, because they read it while playing.`,
      follow:`How do you know a player read it?`,
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
      a:`Use arrangement, wear, absence and trajectory: furniture moved to block something, a path worn into the floor, a shelf emptied of one category, tools dropped in a line. Add contradiction, where two traces disagree and the player resolves it. Notes stay for the cases where language is the artefact.`,
      follow:`How many unique props can you afford before it stops scaling?`,
      red:`Adds more note variants with better writing.` }
  ],
  senior:[
    { q:`Sixty environment artists and three writers. How do you scale environmental storytelling?`,
      a:`Give the artists a vocabulary rather than scripts: kits of evidence with meanings attached, and a one-page brief per space that names the event and who passed through. Reserve authored exceptions for the spaces on the critical path. Review against the sightline and the traversal pace, because that is where it fails in volume.`,
      follow:`How do you stop the vocabulary flattening into wallpaper?`,
      red:`Writes a style guide, distributes it, and treats the problem as solved.` },
    { q:`How do you budget this against level throughput?`,
      a:`Tier the spaces. Critical-path spaces get authored evidence and a stop-rate target. Connective spaces get kit dressing that stays consistent with the grammar. Measure with playtest stop rate and with what players narrate back, then move budget towards the tiers that produce recall.`,
      follow:`What is the first thing you cut when the level count rises?`,
      red:`Spreads the same detail density everywhere and runs out of schedule.` }
  ] });

T('narrative-agency',{ d:'narrative', t:'Player agency in story', tag:'Agency in story is perceived consequence, not branch count. Make the player feel authorship.',
  what:`The degree to which players shape the story and, more importantly, perceive that they did. Includes authored branches, systemic consequences, expressive choices without plot impact, and emergent narrative from systems. Branch count is expensive and rarely perceived. Visible consequence is cheap and always perceived. Steins;Gate gives its protagonist Reading Steiner, an in-fiction memory of erased timelines, so replaying for another ending reads as the character’s own continuity rather than an unexplained do-over.`,
  why:[`Perceived agency is what players feel. A single visible consequence outperforms ten invisible branches.`,`Emergent stories from systems are the ones players retell, because they are theirs.`,`Fake choice is detected within an hour and poisons trust in every later choice.`],
  think:{ q:[`For each choice: when and how does the player see it mattered?`,`Is the consequence cosmetic, situational or structural? All three are fine if the player knows which.`,`Which systems could generate story without a script?`,`Are there moments where the story takes control at exactly the point the mechanics were about control?`],
    trade:[`Branching multiplies content cost and delivers agency only if perceived.`,`Linear stories deliver authored peaks and must earn the player’s acceptance of the rails.`],
    traps:[`Dialogue wheels that converge.`,`Consequences delivered hours later with no reminder of the cause.`,`Cutscenes that undo player choices.`],
    good:[`Players tell stories in first person with choices in them.`,`Players replay to see what would have happened.`,`Players reread earlier, ordinary scenes differently once a reveal recasts them, as Doki Doki Literature Club’s fourth-wall reveal leads them to.`],
    bad:[`Players say “it did not matter what I picked”.`] },
  how:[`List choices. For each, write the consequence, when it is seen, and how the player will connect it to the cause.`,`Replace invisible branches with visible acknowledgments (a line, a changed space, a reputation).`,`Identify systems that could generate story and surface their outputs as narrative (a journal, characters reacting).`,`Test whether players can recall a consequence and its cause.`],
  ai:{ yes:[`Audit choice lists for consequence visibility and delay.`,`Draft acknowledgments for choices with no visible consequence.`,`Design systemic narrative surfacing (how a system’s state becomes a story beat).`],
       no:[`Decide how much authorship to give the player.`] },
  prompts:[{l:'Consequence visibility audit',p:`Here are our player choices with their consequences and timing: [LIST]. For each, state when the player first perceives the consequence, how they would connect it to their choice, and whether it is cosmetic, situational or structural. Flag choices with no perceivable consequence within [TIME]. For each flag, propose the cheapest visible acknowledgement, not a new branch.`}],
  verify:[`Did it propose branches when acknowledgments would do?`],
  test:[`Ask players about a choice they made and what happened because of it.`,`Do players replay to see alternatives?`,`Where do players say “that did not matter”?`],
  rel:[['agency-and-emergence','Narrative agency is agency applied to story.'],['ludonarrative-alignment','Agency is the most common dissonance site.'],['systemic-design','Systems generate emergent stories.'],['decisions','Story choices are decisions with the same criteria.']] });
TECH('narrative-agency',[
  {n:'Branching and state tracking', how:`Track choices in state (flags, variables) and let later content and dialogue read them.`, fit:`Choice-and-consequence storytelling.`, cost:`Combinatorial content cost. Branches must reconverge or content explodes.`, alt:`Track state and use it for variation in delivery and consequence, not fully separate plots.`},
  {n:'Dialogue and quest systems', how:`Data-driven dialogue graphs and quest state machines with conditions and effects.`, fit:`Authoring large narrative content without code per line.`, cost:`Tooling and localisation cost. Brittle conditions.`, alt:`Invest in an authoring tool. Writers must own the data.`},
  {n:'Emergent and systemic narrative', how:`Story emerges from systems (AI, simulation, reputation) rather than script.`, fit:`Sandboxes, sims and games where player stories are the product.`, cost:`Unreliable. You cannot guarantee a meaningful arc.`, alt:`Systemic for texture and player stories. Scripted for the beats that must land.`}
]);
ENGINE('narrative-agency',{
  godot:{ term:`One autoload owns the choice ledger and emits flag_changed. Dialogue conditions are strings in the data, evaluated with Expression against those flags, and the ledger is saved as JSON rather than as a Resource.`,
    api:['Autoload singleton + signal flag_changed(key, value)','Expression.parse() / Expression.execute()','JSON.stringify() / JSON.parse_string()','FileAccess.open("user://…")','Dictionary state','Callable for consequence hooks'],
    snippet:`extends Node                                   # autoload StoryState
signal flag_changed(key: StringName, value: Variant)
var _flags := {}
func set_flag(key: StringName, value: Variant) -> void:
\t_flags[key] = value
\tflag_changed.emit(key, value)              # the acknowledgment listens here

func allows(condition: String) -> bool:        # "spared_guard and reputation > 2"
\tvar ex := Expression.new()
\tif ex.parse(condition, PackedStringArray(_flags.keys())) != OK:
\t\treturn false
\treturn bool(ex.execute(_flags.values()))

func save() -> void:
\tFileAccess.open("user://story.json", FileAccess.WRITE).store_string(JSON.stringify(_flags))`,
    pitfall:`Saving the ledger with ResourceSaver and reading it back with load(). A .tres names the script it should instantiate, so loading a file the player can edit runs whatever script that file names, and ResourceLoader also hands back a shared cached instance unless you ask for a fresh one. Save player data as JSON and keep load() for content you shipped.`,
    map:`Godot’s Expression over an autoload flag dictionary is Unity’s condition check over a serialised save object.` },
  unity:{ term:`A serialisable save class holding the flags, written with JsonUtility to persistentDataPath. Consequences subscribe to a change event so an acknowledgement can be surfaced the moment a flag is set.`,
    api:['[System.Serializable] save class','JsonUtility.ToJson() / FromJson<T>()','Application.persistentDataPath','File.WriteAllText() / ReadAllText()','UnityEvent for consequence hooks','PlayableDirector for the acknowledgement beat'],
    snippet:`[System.Serializable] public class StoryState {
    public List<string> flags = new();      // a List survives JsonUtility, a Dictionary does not
    public int reputation;
    public bool Has(string f) => flags.Contains(f);

    public void Save() =>
        File.WriteAllText(Path.Combine(Application.persistentDataPath, "story.json"),
                          JsonUtility.ToJson(this));

    public static StoryState Load() {
        var p = Path.Combine(Application.persistentDataPath, "story.json");
        return File.Exists(p) ? JsonUtility.FromJson<StoryState>(File.ReadAllText(p))
                              : new StoryState();
    }
}`,
    pitfall:`Storing the ledger as a Dictionary and serialising it with JsonUtility. Dictionaries, properties and polymorphic fields are skipped silently, so the file writes as an empty object, no error is logged, and every choice the player made disappears on reload. Use serialisable lists and plain fields, or a serialiser that reports what it dropped.`,
    map:`Unity’s JsonUtility save object is Godot’s JSON-serialised flag dictionary in user://.` }});
INTERVIEW('narrative-agency',{
  junior:[
    { q:`What is player agency in story, and is more branching always better?`,
      a:`Agency is the perception that the player shaped events. Branch count is expensive and mostly invisible, so one consequence the player sees and connects to their choice beats ten they never meet. Start with visibility, then spend on branches where replay is expected.`,
      follow:`What is the cheapest acknowledgement you can give a choice?`,
      red:`Counts endings as the measure of agency.` },
    { q:`Name the kinds of consequence a choice can have.`,
      a:`Cosmetic, situational and structural. All three are legitimate, and the problem is only when the player expects one kind and gets another. Signal the scale honestly, because a choice that presents as structural and lands as cosmetic costs trust.`,
      follow:`How do you signal which kind a choice is without spoiling it?`,
      red:`Promises every choice is structural.` },
    { q:`Why is fake choice dangerous?`,
      a:`Players detect convergence within an hour, and once they do they stop treating any later choice as real. That poisons the choices that matter, which are usually the expensive ones. A visible small consequence is worth more than an invisible large one.`,
      follow:`How would you detect it in a playtest?`,
      red:`Assumes players will not notice if the convergence is well written.` }
  ],
  mid:[
    { q:`Your consequences land six hours after the choice. What do you do?`,
      a:`Add an acknowledgement near the choice so the player knows it was recorded, then restate the cause when the consequence arrives, through a character, a changed space or a reputation. The player has to connect the two without being told a sentence they no longer remember. If the link cannot be made, the branch is not buying agency.`,
      follow:`How long a gap is too long?`,
      red:`Adds a journal entry and assumes players read it.` },
    { q:`How do you surface emergent narrative from systems?`,
      a:`Give the systems a voice: characters that react to state, a log that names what happened in the player’s terms, a summary at a rest beat. Emergent stories are the ones players retell because they are theirs, but only if the game notices them. Pick a small number of state changes worth commenting on.`,
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
      follow:`The writer’s draft depends on that scene. How do you run the conversation?`,
      red:`Keeps both and hopes the player forgets what they chose.` }
  ] });

T('narrative-pacing',{ d:'narrative', t:'Narrative pacing and integration', tag:'Story beats are pacing beats. Schedule them against the play curve, not in a separate document.',
  what:`The timing and delivery of story across play: when beats land, how long they take, how they alternate with play, and how they are delivered (cutscene, dialog in play, environment, system). Integration means story beats and play beats are planned on one timeline. 999 paces its own dialogue-heavy stretches by alternating them, phase by phase, with a self-contained escape-room puzzle, so a long scene of exposition is reliably followed by a hands-on room the player must search and solve before the story is allowed to continue.`,
  why:[`Story delivered at the wrong moment is skipped or resented. Delivered at the right moment it is the peak.`,`Long non-interactive stretches break the loop and remind the player they are not playing.`,`Story is the best rest-beat content: it makes release meaningful.`],
  think:{ q:[`Where on the intensity curve does each beat land? Is that a rest or a peak?`,`How long is the longest stretch without player control? Without story?`,`Could this beat be delivered in play rather than in a cutscene?`,`Does a story beat ever arrive before the player has a reason to care?`],
    trade:[`Cutscenes deliver authored emotion reliably and stop play.`,`In-play delivery preserves flow and can be missed.`],
    traps:[`Front-loaded exposition before the player has done anything.`,`Story pacing owned by writers, play pacing by designers, integrated never.`,`Unskippable scenes at retry points.`],
    good:[`Players do not skip. Players mention story moments when describing play.`],
    bad:[`Players skip, or forget the plot between sessions.`] },
  how:[`Put story beats on the same timeline as level and intensity beats.`,`Move exposition after the first meaningful play and deliver it as answers to questions the play raised.`,`Convert the longest cutscenes to in-play delivery where possible.`,`Never place unskippable story at a retry point.`],
  ai:{ yes:[`Merge a story outline and a level plan into one timeline and flag collisions.`,`Propose in-play delivery for cutscene beats.`,`Estimate non-interactive time per hour.`],
       no:[`Decide the story’s shape.`] },
  prompts:[{l:'Integrated timeline',p:`Here is our story outline with beats and estimated durations: [STORY] and our level and intensity plan: [LEVELS]. Merge them into one timeline. Flag story beats that land on intensity peaks, exposition before the first meaningful play, non-interactive stretches over [N] minutes, and story at retry points. For each flag propose a relocation or an in-play delivery method.`}],
  verify:[`Did it respect which beats must be authored versus which can be systemic?`],
  test:[`Skip rate per scene.`,`Ask players to recount the plot after a week.`,`Do players mention story moments when describing what they did?`],
  rel:[['pacing','Story beats are pacing beats.'],['tension-release','Story is the best rest content.'],['quests-and-events','Quests carry story pacing.'],['onboarding','Exposition before play is an onboarding failure.']] });
TECH('narrative-pacing',[
  {n:'Integration points', how:`Place story beats where the player naturally pauses (between levels, after bosses), not mid-action.`, fit:`Story that does not fight play.`, cost:`Limits narrative placement. Needs level awareness.`, alt:`Let the environment carry story during play.`},
  {n:'Player-paced vs authored pace', how:`Decide what the player controls (exploration, dialogue speed) and what the game controls (cutscenes, set pieces).`, fit:`Respecting agency while landing beats.`, cost:`Mismatch causes tone whiplash.`, alt:`Match narrative control to the game’s agency.`}
]);
ENGINE('narrative-pacing',{
  godot:{ term:`Cutscenes are AnimationPlayer animations with method call tracks for the state changes. The node processes while the tree is paused so the skip action always works, and skipping advances the animation instead of stopping it.`,
    api:['AnimationPlayer.play() / advance() / current_animation_position','AnimationPlayer.animation_finished','Animation method call tracks','Node.process_mode = PROCESS_MODE_ALWAYS','SceneTree.paused','Viewport.set_input_as_handled()'],
    snippet:`extends Node                                   # a cutscene that is always skippable
@onready var _anim: AnimationPlayer = $AnimationPlayer
signal finished

func _ready() -> void:
\tprocess_mode = Node.PROCESS_MODE_ALWAYS    # the skip key works while the tree is paused
\t_anim.animation_finished.connect(func(_n): finished.emit())
\t_anim.play("chapter_open")

func _unhandled_input(e: InputEvent) -> void:
\tif e.is_action_pressed("skip"):
\t\tvar a := _anim.get_animation("chapter_open")
\t\t_anim.advance(a.length - _anim.current_animation_position)   # run every track
\t\tget_viewport().set_input_as_handled()`,
    pitfall:`Implementing skip as AnimationPlayer.stop(). Every method call track after the current position is never reached, so the door the cutscene was supposed to unlock stays locked and the quest flag it was supposed to set stays unset. The player who skips ends up in a state no tester who watched the scene ever saw.`,
    map:`A Godot AnimationPlayer method call track is a Unity Timeline signal track with a SignalReceiver.` },
  unity:{ term:`Timeline for the beat, PlayableDirector for playback. Skip jumps the director to the end, and because jumping does not emit markers, the state changes are applied explicitly next to the jump.`,
    api:['PlayableDirector.Play() / Stop() / Evaluate()','PlayableDirector.time / duration','SignalTrack + SignalAsset + SignalReceiver','DirectorWrapMode (None, Hold, Loop)','TimelineAsset','UnityEvent for the applied state'],
    snippet:`public class Cutscene : MonoBehaviour {
    [SerializeField] PlayableDirector director;
    [SerializeField] UnityEvent onSceneStateApplied;   // the unlock, the flag, the next spawn

    public void Skip() {
        // Setting time and calling Evaluate skips every SignalTrack marker in between,
        // so apply the scene's state changes explicitly instead of relying on them.
        director.time = director.duration;
        director.Evaluate();
        director.Stop();
        onSceneStateApplied.Invoke();
    }
}`,
    pitfall:`Skipping by seeking the director and trusting the signals. Timeline markers only fire when playback passes over them in real time, so a jump to the end silently drops every signal between, and Stop with DirectorWrapMode.None also snaps bound transforms back to their pre-scene pose. Apply state outside the timeline, and choose the wrap mode deliberately.`,
    map:`A Unity Timeline signal track is a Godot AnimationPlayer method call track.` }});
INTERVIEW('narrative-pacing',{
  junior:[
    { q:`What does it mean to say story beats are pacing beats?`,
      a:`They land on the same intensity curve as the play, so a beat placed on a peak competes with the peak and a beat placed at rest makes the rest meaningful. That is why story and level plans belong on one timeline rather than in two documents owned by two disciplines.`,
      follow:`Where on the curve would you put a long scene?`,
      red:`Keeps a separate story schedule and calls integration a handoff.` },
    { q:`Why is front-loaded exposition a problem?`,
      a:`It arrives before the player has done anything, so they have no questions for it to answer and no reason to care. Move it after the first meaningful play and deliver it as the answer to something the play raised. What they do first is what they remember.`,
      follow:`Your premise needs setup. How do you deliver it?`,
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
