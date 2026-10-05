/* =====================================================================
   LEVEL DESIGN
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'level', lens:'design', t:'Level Design', short:'Space, pacing, teaching, escalation, encounters', color:'var(--d-level)',
    sum:`Levels are where mechanics get taught, tested, twisted and combined. Good level design is applied pedagogy plus pacing: it controls what the player knows, what they face, and how tired they are.`,
    links:[['ux','Onboarding is level design. The first ten minutes teach more than any tutorial text.'],['experience','Pacing is how a level converts mechanics into an emotional arc.'],['content','Encounters, puzzles and rewards are the vocabulary a level speaks with.'],['systems','Difficulty curves are systems tuning expressed in space and time.']] });

T('level-structure',{ d:'level', t:'Level structure: teach, test, twist, combine, master, rest', tag:'A level is a lesson about one idea, delivered by doing.',
  what:`A pattern for structuring levels around a mechanic or idea: introduce it safely (teach), demand it under pressure (test), reframe it unexpectedly (twist), mix it with a known idea (combine), demand fluency (master), then release (rest). It generalises kishōtenketsu (introduce, develop, twist, conclude), a four-part form from Chinese and Japanese poetry that Koichi Hayashida described applying to Super Mario 3D Land’s levels, and Celeste’s one-idea-per-room approach.`,
  why:[`Players learn by doing. A level structured as a lesson teaches without text.`,`The twist is where discovery and delight live. Without it levels are drills.`,`Rest is when learning consolidates and tension resets. Levels without rest exhaust.`],
  think:{ q:[`What is the one idea this level is about? If two, split it.`,`Where can the player fail safely while learning it? Where do they face real stakes?`,`What is the twist: a new context, a reversal, an unexpected combination?`,`Which known idea does it combine with? Does the combination create a new decision?`],
    trade:[`Strict structure teaches reliably and feels formulaic if visible.`,`Loose structure feels organic and teaches unreliably.`],
    traps:[`Teaching through text when the space could do it.`,`Skipping the safe introduction and calling the level “hard”.`,`No twist: the level is the tutorial repeated with more enemies.`],
    good:[`Players use the mechanic in the twist without being told.`,`Players can say what the level was about.`],
    bad:[`Players die in the introduction, or breeze through the whole level identically.`] },
  how:[`Write the level’s idea in one sentence and the structure in six beats.`,`Grey-box the beats. Test whether players learn the idea by the test beat without instruction.`,`Design the twist to recontextualize, not to escalate. Escalation is the master beat.`,`Check the rest beat carries something (reward, vista, story).`,`Only after the structure works, dress it.`,`Constrain the route when a new dimension makes distance hard to judge: Crash Bandicoot (1996) ran its 3D levels along one narrow path behind the character, so each jump could be spaced as exactly as in a 2D level.`,`Show the goal before the path: Warren Spector’s postmortem for Deus Ex lists “always show the goal” and “more than one way to get to all destinations” among its rules, so each level states its problem at the start and the player spends the level choosing an answer.`],
  ai:{ yes:[`Draft beat structures for a stated idea, skill position and emotional target.`,`Audit an existing level script for missing beats.`,`Generate twist candidates for a mechanic.`],
       no:[`Generate levels before you define intended skill, known mechanics, emotional target, pacing position and constraints. Without those, output is generic.`] },
  prompts:[{l:'Level beat plan',p:`Design constraints: the player currently knows [MECHANICS], the idea this level teaches is [IDEA], the emotional target is [EMOTION], the pacing position is [POSITION in the game], and constraints are [TIME, ASSETS]. Propose 3 six-beat structures (teach, test, twist, combine, master, rest). For each beat, state what the player does, what they could fail, and what they learn. Make the twists different across the 3 proposals. Do not describe visuals.`}],
  verify:[`Did it escalate where it should twist?`,`Are beats grounded in the mechanics I said the player knows?`],
  test:[`Do players use the idea in the test beat without prompting?`,`Where do they die in the introduction? That is a teaching failure.`,`Do they react to the twist (pause, comment, laugh)?`,`Can they state what the level was about afterwards?`],
  rel:[['backtracking-and-return-trips','A non-linear structure sends the player back through places already seen; whether that return feels like discovery is part of the structure.'],['pacing','Beats are pacing at level scale.'],['skill-and-mastery','Levels are where skill atoms are taught and combined.'],['onboarding','The first levels are the onboarding.'],['tension-release','Test and rest are tension and release.'],['level-blockout-and-metrics','The beats are first laid out and tested in a blockout.']] });
TECH('level-structure',[
  {n:'Kishotenketsu (introduce, develop, twist, conclude)', how:`Structure a level around one idea: introduce it safely, develop it, twist it, conclude.`, fit:`Teaching mechanics through space.`, cost:`Rigid if applied to every level. Needs variation.`, alt:`One movement/mechanic idea per room (Celeste-style).`},
  {n:'Teach, test, twist, combine, master, rest', how:`Sequence the six level intents within and across levels.`, fit:`A long, well-paced learning arc.`, cost:`Tracking the sequence across many levels takes discipline.`, alt:`Map each level to the intent it serves.`},
  {n:'Blockout-first', how:`Build and test the level in grey boxes for flow and teaching before art.`, fit:`Validating structure cheaply.`, cost:`Some feel depends on art. Schedule a later pass.`, alt:`Clarity first, then polish.`}
]);
ENGINE('level-structure',{
  godot:{ term:`A beat is a scene. Each of the six beats is its own PackedScene, and the level is a node holding an ordered array of them. Reordering the lesson is reordering an array, not dragging nodes.`,
    api:['PackedScene.instantiate()','@export var beats: Array[PackedScene]','Node.add_child() / Node.queue_free()','Signal.connect(callable, CONNECT_ONE_SHOT)','TileMapLayer (2D blockout) / GridMap + MeshLibrary (3D blockout)','ResourceLoader.load_threaded_request()'],
    snippet:`extends Node3D                                 # one PackedScene per beat
@export var beats: Array[PackedScene] = []     # teach, test, twist, combine, master, rest
var _room: Node = null
var _index := -1

func next_beat() -> void:
\tif _room:
\t\t_room.queue_free()
\t_index += 1
\tif _index >= beats.size():
\t\treturn
\t_room = beats[_index].instantiate()
\t_room.cleared.connect(next_beat, CONNECT_ONE_SHOT)
\tadd_child(_room)                            # reorder the array, reorder the lesson`,
    pitfall:`Authoring the whole level as one .tscn. Every beat then lives in one file, so two designers cannot work on it at once, the diff is unreadable, and testing “what if the twist came before the test” is a manual node drag instead of swapping two array entries. The structure you are trying to iterate on becomes the thing that is hardest to change.`,
    map:`Godot PackedScene instancing is Unity prefabs plus additive scene loading.` },
  unity:{ term:`A beat is an additively loaded scene, or a prefab variant when the beats are small. A runner loads the next one, unloads the last one, and makes the new one active so spawned objects land in it.`,
    api:['SceneManager.LoadSceneAsync(name, LoadSceneMode.Additive)','SceneManager.UnloadSceneAsync()','SceneManager.SetActiveScene() / MoveGameObjectToScene()','ProBuilder for the blockout','Prefab Variants','ScriptableObject beat list'],
    snippet:`public class BeatRunner : MonoBehaviour {
    [SerializeField] string[] beatScenes;          // one additive scene per beat
    int index = -1;
    Scene current;

    public IEnumerator NextBeat() {
        if (current.IsValid()) yield return SceneManager.UnloadSceneAsync(current);
        if (++index >= beatScenes.Length) yield break;
        yield return SceneManager.LoadSceneAsync(beatScenes[index], LoadSceneMode.Additive);
        current = SceneManager.GetSceneByName(beatScenes[index]);
        SceneManager.SetActiveScene(current);      // spawns land here, not in the bootstrap
    }
}`,
    pitfall:`Forgetting SetActiveScene after an additive load. Everything Instantiate creates goes into the active scene, so enemies and pickups for beat four keep accumulating in the bootstrap scene and survive the unload. The level leaks objects across beats and the rest beat is quietly full of the master beat’s leftovers.`,
    map:`Unity additive scenes plus SetActiveScene are Godot PackedScene instancing under one parent node.` }});
INTERVIEW('level-structure',{
  junior:[
    { q:`What’s the teach-test-twist-combine-master-rest structure, and why those six beats specifically?`,
      a:`Teach introduces a mechanic safely. Test demands it under pressure. Twist reframes it unexpectedly. Combine mixes it with something known. Master demands fluency. Rest releases. It generalizes the kishotenketsu pattern and Celeste’s one-idea-per-room approach. Say why skipping teach or rest specifically breaks the lesson: teach without safety kills confidence, rest without content exhausts.`,
      follow:`Take a level you know and map it onto those six beats. Where does it skip one?`,
      red:`Recites the six words without being able to map them onto an actual level.` },
    { q:`Why does a level need to be about one idea, and what happens when it’s about two?`,
      a:`One idea lets teach, test and twist build on each other, two ideas split the player’s attention and neither gets the full arc. Say you would split a two-idea level into two levels or make one idea subordinate to the other, and reference the discipline Celeste applies here directly.`,
      follow:`Give an example of a level that tried to teach two mechanics at once and name which one landed.`,
      red:`Defends cramming multiple new mechanics into one level as efficient use of production time.` },
    { q:`Where should a player be able to fail safely while learning a new mechanic?`,
      a:`In the teach beat, before the test beat introduces real stakes. If the introduction has no safe failure, the level is asking the player to master something before they have had a chance to try it. Say what “safe” means concretely: no death, no lost progress, or a low enough cost that experimentation feels free.`,
      follow:`Players are dying in what you designed as the teach beat. What does that tell you?`,
      red:`Calls a level “hard” without checking whether the introduction ever gave a safe attempt.` }
  ],
  mid:[
    { q:`How do you test whether the teach beat taught the idea, rather than just showed it?`,
      a:`Watch whether players use the mechanic correctly in the test beat without being told again, that is the actual signal, not whether they read a tooltip during teach. Grey-box the beats before dressing them so you are testing the structure, not the art. If they fail the test beat, the teach beat did not work regardless of how clear it looked to you.`,
      follow:`Players pass the test beat but fumble the combine beat later. Where do you look first?`,
      red:`Assumes teaching worked because the tooltip was clear and never watches the test beat.` },
    { q:`What’s the difference between a twist and an escalation, and why does confusing them flatten a level?`,
      a:`A twist recontextualizes the idea, a new angle, a reversal, an unexpected combination, an escalation just adds more of the same demand. Escalation belongs in the master beat, not the twist beat, using it too early makes the level a drill dressed as a lesson. Give an example of a real twist versus an escalation that was mislabeled as one.`,
      follow:`You’ve mislabeled an escalation as your twist. What do you replace it with?`,
      red:`Defends “more enemies” as a twist because it changes the difficulty.` },
    { q:`The rest beat in your level plan is literally empty space. What’s wrong with that?`,
      a:`Empty rest is dead time, players read it as padding rather than release, and it wastes the moment when learning consolidates. The rest beat needs to carry something, a reward, a story beat, a vista, a chance to look back at what just happened. Say what you’d add to a currently-empty rest beat in a level you know.`,
      follow:`You add a vista to the rest beat and playtesters still rush through it. What do you check next?`,
      red:`Defines rest as simply removing enemies from a section, with nothing put in their place.` }
  ],
  senior:[
    { q:`Six designers build levels in parallel using this structure. What breaks first without a shared standard?`,
      a:`The twist beat, because it is the most subjective of the six and the easiest to mislabel as an escalation under deadline pressure. A shared vocabulary for what counts as a twist, plus a review that checks the beat map before greyboxing goes far, catches this earlier than a full playthrough would. Cross-review levels against each other’s twists so nobody’s is a quiet repeat of someone else’s.`,
      follow:`Two levels turn out to use the same twist independently. How do you decide which one keeps it?`,
      red:`Reviews each level only against its own beat map and never checks it against the other levels shipping alongside it.` },
    { q:`How do you use this structure for a mechanic the player already knows, three worlds into the game?`,
      a:`The teach beat becomes brief or implicit, since there is no need to reteach, but test, twist, combine, master and rest still apply, now combining the known mechanic with something newer instead of with itself. The risk is skipping straight to master because the mechanic feels old to the designer even though it is being asked to do something new here. Check the combine beat especially, that is where a known mechanic earns its place in a later level.`,
      follow:`A designer wants to skip straight to master because “players already know this.” What do you push back on?`,
      red:`Treats a known mechanic as needing no structure at all past its first appearance in the game.` }
  ] });
DIAGRAM('level-structure', { kind:'curve', title:'One idea per level: teach, test, twist, combine, master, rest',
  x:'Level progress', y:'Challenge',
  series:[{t:'Challenge', pts:[[0,0.15],[0.1,0.2],[0.24,0.42],[0.34,0.3],[0.47,0.6],[0.57,0.45],[0.67,0.7],[0.78,0.62],[0.87,0.9],[0.94,0.45],[1,0.2]]}],
  beats:[{at:0.08, t:'Teach'},{at:0.26, t:'Test'},{at:0.47, t:'Twist'},{at:0.66, t:'Combine'},{at:0.86, t:'Master'},{at:0.97, t:'Rest'}],
  alt:'Challenge rises through teach, test, twist, combine and master, dipping after each new idea, and ends on a rest.',
  note:'After Koichi Hayashida on Super Mario 3D Land and the kishōtenketsu structure.' });

T('pacing',{ d:'level', t:'Pacing: intensity and cognition', tag:'Two curves, not one: how hard the hands work and how hard the head works.',
  what:`The rhythm of demands over a level or session. Resident Evil 4 alternates a hard fight in a village with a quiet walk and a merchant’s shop. Encounter pacing is about intensity: how much pressure, how fast. Cognitive pacing is about thinking: how much new information, how many decisions per minute. Good pacing alternates both and rarely peaks both at once.`,
  why:[`Peaking intensity and cognition together overwhelms. Troughing both bores.`,`New information delivered at high intensity is not learned.`,`Pacing is the main tool for making the same mechanics feel different across a level.`],
  think:{ q:[`Draw both curves for this level. Where do they peak together?`,`Where is new information introduced? Is intensity low there?`,`How long is the longest stretch at one intensity?`,`What does the rest carry? Empty rest is dead time.`],
    trade:[`Frequent rests keep clarity and lower the maximum intensity felt.`,`Long climbs build strong peaks and lose impatient players.`],
    traps:[`Teaching during combat.`,`Pacing by enemy count only.`,`Constant peaks (every room is a set piece).`],
    good:[`Players slow down where you intended and speed up where you intended.`,`Players describe a level as having “moments”.`],
    bad:[`Players describe it as “relentless” or “boring” or “confusing” (each is a pacing failure).`] },
  how:[`Plot intended intensity and cognitive load curves per minute.`,`Move new-information beats to low-intensity valleys.`,`Break the longest flat stretch with a change in either curve.`,`Observe a playtest and plot actual pace (speed of movement, pauses, speech). Compare.`],
  ai:{ yes:[`Draft both curves from a level script.`,`Flag simultaneous peaks and long flats.`,`Extract observed pace from timestamped play logs.`],
       no:[`Decide the overall intensity level of the game.`] },
  prompts:[{l:'Dual curve audit',p:`Here is a level script with timings: [SCRIPT]. Plot two curves per minute: intensity (1 to 5) and cognitive load (new information plus decisions per minute, 1 to 5). Flag minutes where both are 4 or above, and stretches of more than 3 minutes with no change in either. For each flag, propose the smallest move: relocate a teaching beat, insert a rest, or cut a redundant beat. State what the player would perceive differently.`}],
  verify:[`Is cognitive load estimated from actual new rules and decisions, or guessed from mood?`],
  test:[`Plot movement speed and pauses over time from a recording.`,`Where do players ask questions or look confused? Overlay on the curves.`,`Ask players to describe the level’s shape. Do they perceive the peaks you intended?`],
  rel:[['tension-release','Pacing is tension and release engineered.'],['level-structure','Beats are the units of pacing.'],['readability-and-hierarchy','Cognitive load is a UX concern.'],['difficulty','Difficulty curves are intensity pacing across the game.']] });
TECH('pacing',[
  {n:'Intensity curve', how:`Plot intended intensity over the level and place peaks, troughs and rest beats.`, fit:`Combat, horror and any sequence of encounters.`, cost:`Players vary. Needs adaptivity or branching.`, alt:`Author the curve. Let a director fill the gaps if needed.`},
  {n:'Cognitive-load pacing', how:`Alternate high-cognition (puzzles, choices) with low-cognition (movement, spectacle) beats.`, fit:`Preventing fatigue and keeping attention.`, cost:`Requires measuring load. Heuristic.`, alt:`Think-aloud tests reveal overload points.`},
  {n:'Pressure-release cycle', how:`Deliberately pair tension with relief so reward lands.`, fit:`Making rest meaningful.`, cost:`Skipping relief flattens the peaks.`, alt:`Give a visible reward after a hard beat.`}
]);
ENGINE('pacing',{
  godot:{ term:`The two curves are two Curve resources exported on a director node. It samples both against level time and emits one signal that spawners, music and lighting all listen to.`,
    api:['Curve resource + @export var intensity: Curve','Curve.sample(offset) / Curve.sample_baked()','Node._process(delta)','signal pace_changed(intent, load)','AnimationPlayer method call tracks','AudioServer.set_bus_volume_db()'],
    snippet:`extends Node
@export var intensity: Curve                   # authored in the inspector, one per level
@export var cognition: Curve
@export var length_sec := 480.0
signal pace_changed(intent: float, load: float)
var _t := 0.0

func _process(delta: float) -> void:
\t_t = minf(_t + delta, length_sec)          # gameplay time, not wall clock
\tvar u := _t / length_sec
\tpace_changed.emit(intensity.sample(u), cognition.sample(u))`,
    pitfall:`Reading the curve with sample_baked(). The baked cache holds bake_resolution points (100 by default) and interpolates linearly between them, so a deliberate one-second spike in intensity gets smoothed into a slope. The curve you drew and the curve the game plays are different, and the playtest disagrees with the plan for a reason nobody can see.`,
    map:`A Godot Curve resource sampled by a director node is a Unity AnimationCurve read by a pacing component.` },
  unity:{ term:`AnimationCurve fields for the two curves, or a Timeline when the beats are authored rather than computed. A PlayableDirector with signal tracks fires the beat changes, and a UnityEvent carries the sampled pace.`,
    api:['AnimationCurve.Evaluate(t)','PlayableDirector + TimelineAsset','SignalTrack / SignalReceiver','DirectorUpdateMode (GameTime, UnscaledGameTime, Manual)','UnityEvent<float, float>','Time.deltaTime / Time.unscaledDeltaTime'],
    snippet:`public class PaceDirector : MonoBehaviour {
    [SerializeField] AnimationCurve intensity = AnimationCurve.Linear(0, 0, 1, 1);
    [SerializeField] AnimationCurve cognition = AnimationCurve.Linear(0, 1, 1, 0);
    [SerializeField] float lengthSec = 480f;
    public UnityEvent<float, float> PaceChanged;
    float t;

    void Update() {
        t = Mathf.Min(t + Time.deltaTime, lengthSec);
        float u = t / lengthSec;
        PaceChanged.Invoke(intensity.Evaluate(u), cognition.Evaluate(u));
    }
}`,
    pitfall:`Leaving a pacing Timeline on DirectorUpdateMode.GameTime while the combat code scales Time.timeScale for hit-stop. Every hit stretches the pacing clock, so a busy fight pushes the whole level’s curve later and the rest beat arrives minutes after it was planned. Drive pacing from unscaled time, or from a clock the gameplay owns explicitly.`,
    map:`A Unity Timeline signal track is a Godot AnimationPlayer method call track.` }});
INTERVIEW('pacing',{
  junior:[
    { q:`Why does pacing need two curves instead of one?`,
      a:`Intensity (how much pressure, how fast) and cognitive load (how much new information, how many decisions per minute) fail differently when they peak or trough together. Peaking both overwhelms, troughing both bores, and new information at high intensity does not get learned. Say why a game can feel “relentless” and “confusing” at the same time and moment.`,
      follow:`Take a section from a game you know where both curves peaked together. What broke?`,
      red:`Talks about pacing purely in terms of action intensity with no mention of cognitive load at all.` },
    { q:`What’s wrong with teaching a new mechanic during combat?`,
      a:`New information delivered at high intensity is not learned, the player is too busy surviving to absorb a new rule. New-information beats belong in cognitive valleys, low intensity, so the player has the attention to take it in. Give an example where a game taught something mid-fight and it visibly did not land.`,
      follow:`Combat is unavoidable at that point in the level. Where else could the new information go instead?`,
      red:`Adds a tooltip during a boss fight and assumes the text delivered the lesson.` },
    { q:`A rest beat with no enemies and nothing else in it. What’s the problem?`,
      a:`Empty rest is dead time, and players read a stretch with nothing happening as padding rather than release, regardless of how quiet the level intends it to feel. Rest has to carry something, a reward, a vista, a story beat, a moment to look back. Removing pressure is not the same as adding meaning.`,
      follow:`What would you add to a rest beat that’s currently just an empty corridor?`,
      red:`Defines pacing entirely in terms of intensity and never checks what a low point contains.` }
  ],
  mid:[
    { q:`How do you plot the two curves for an actual level, not just talk about them abstractly?`,
      a:`Chart intended intensity and cognitive load per minute from the level script and timings, flag minutes where both hit high simultaneously, and flag stretches longer than a few minutes with no change in either curve. Then propose the smallest move for each flag, relocate a teaching beat, insert a rest, cut a redundant beat, rather than redesigning the whole level.`,
      follow:`You find a three-minute flat stretch with no change in either curve. What’s the cheapest fix?`,
      red:`Draws an intended curve on paper and never checks it against an actual level script with real timings.` },
    { q:`Testers describe a level as “relentless.” What do you measure to confirm that, rather than take the word at face value?`,
      a:`Overlay observed pace, movement speed, pauses, speech from a recording, against your intended curves and look for places both peaked together or stayed high for an extended stretch. “Relentless,” “boring” and “confusing” each point at a different pacing failure, so the word choice itself is diagnostic before you touch anything.`,
      follow:`The observed curve matches your intended curve and testers still call it relentless. What does that tell you about the intended curve itself?`,
      red:`Lowers the overall difficulty in response to “relentless” without checking which curve was the problem.` },
    { q:`How do you break up the longest flat stretch in a level without adding new content?`,
      a:`Change either curve using what is already there, move an existing decision point earlier, insert a beat of rest using existing geometry, or relocate an information beat that is currently misplaced. The fix is often reordering rather than authoring something new.`,
      follow:`Reordering is not possible because of a hard technical or narrative constraint. What’s your next-cheapest option?`,
      red:`Solves every flat stretch by adding new enemies or new content rather than rearranging what exists.` }
  ],
  senior:[
    { q:`You’re pacing a whole game, not a level. What changes about the approach?`,
      a:`The rhythm nests: beats inside levels, levels inside acts, acts inside the campaign, so you are planning peaks at the scale players remember rather than at the scale you are currently building. A peak at game scale needs an ingredient the player has not met yet, which means budgeting novelty across the whole production, not per level. Valleys at game scale still have to carry something or the whole midgame reads as one long trough.`,
      follow:`Where do most teams get the game-scale curve wrong, specifically?`,
      red:`Pastes the same level-scale curve at every scale and expects the game-scale pacing to take care of itself.` },
    { q:`Six level designers are building in parallel. How do you keep pacing coherent across all of them?`,
      a:`A published curve showing each level’s intended position on it, a shared vocabulary for beats so “peak” means the same thing to everyone, and a review that plays levels in sequence rather than in isolation, since isolated review cannot catch two levels both claiming to be the peak. Nobody raises intensity locally without trading it down somewhere else on the shared curve.`,
      follow:`Two levels both claim to be the campaign’s peak. How do you resolve it?`,
      red:`Reviews each level only on its own merits and discovers the sequencing problem at the first full playthrough.` }
  ] });
DIAGRAM('pacing', { kind:'curve', title:'Two curves: how hard the hands work and how hard the head works',
  x:'Time in level', y:'Load',
  series:[{t:'Hands (execution)', pts:[[0,0.2],[0.15,0.72],[0.3,0.3],[0.45,0.8],[0.6,0.25],[0.75,0.85],[0.9,0.3],[1,0.2]]},{t:'Head (thinking)', pts:[[0,0.3],[0.15,0.25],[0.3,0.7],[0.45,0.3],[0.6,0.75],[0.75,0.35],[0.9,0.62],[1,0.3]]}],
  alt:'Execution and thinking peak at different moments. When both peak together the player is overloaded; when both are low they are bored.' });

T('spatial-composition',{ d:'level', t:'Spatial composition and exploration', tag:'Space communicates. Sightlines, landmarks and paths are sentences the player reads with their feet.',
  what:`The arrangement of space to guide, inform and reward: sightlines that show goals, landmarks that orient, paths that offer choice, hidden pockets that reward attention, and recontextualization where a known space is seen anew. Dark Souls shows a distant tower early on, and later the player reaches it, with shortcuts that loop back to a bonfire. Exploration is the player choosing where to look. Composition is the designer deciding what they will find.`,
  why:[`Space is the most powerful silent teacher: where the player looks decides what they learn.`,`Players lost in space are not playing. They are wayfinding.`,`Choice of path is a decision, and paths with visibly different promises make it meaningful.`],
  think:{ q:[`From the entrance, what does the player see first? Is that the goal, the danger, or the choice?`,`Can the player always name a landmark? Can they say where they came from?`,`Where the path forks, do the forks look different and promise different things?`,`What rewards attention: a pocket, a vista, a shortcut back?`],
    trade:[`Strong guidance reduces getting lost and reduces discovery.`,`Open space rewards exploration and dilutes pacing control.`],
    traps:[`Relying on markers instead of space.`,`Forks that are identical in look and reward.`,`Backtracking through unchanged space. Backtracking and return trips shows how to budget the walk back and change what the player passes.`],
    good:[`Players head towards the right thing without a marker.`,`Players say “I wonder what is over there” and go.`,`Players treat a return trip as a reward, not a repeat, when a found key turns a door they walked past into the way on, as in Doom’s keycard levels.`],
    bad:[`Players open the map every 30 seconds.`] },
  how:[`Grey-box with primary sightlines first: what is visible from each entrance and fork.`,`Place landmarks visible from most positions. Test orientation by asking players to point home.`,`Make forks legible and differently promising.`,`Recontextualize: reveal a known space from a new angle or state.`,`Keep one landmark in view across the world: Elden Ring’s golden Erdtree is visible from most of the Lands Between, so players triangulate their position by sightline, with no quest marker to follow.`],
  ai:{ yes:[`Review a layout description for sightline and landmark gaps.`,`Generate fork designs with distinct promises.`,`Analyze heatmaps and paths for wayfinding failure.`],
       no:[`Judge how a space feels. Feel is observed.`] },
  prompts:[{l:'Sightline review',p:`Here is a level layout with entrances, forks, landmarks and goals: [LAYOUT]. For each entrance and fork, state what the player sees first and what that communicates. Flag positions where no landmark is visible and forks whose options look alike or promise the same thing. Propose the smallest geometry changes to fix each flag. Then identify one opportunity to recontextualize a known space.`}],
  verify:[`Are its sightline claims consistent with the geometry I described, including camera height?`],
  test:[`Ask players to point to where they entered. Track error.`,`Track map opens per minute.`,`Which forks do players take, and can they say why?`,`Do players notice recontextualization?`],
  rel:[['backtracking-and-return-trips','A shortcut back and a return trip through changed space are where composition earns its keep the second time a player passes.'],['level-structure','Structure in time. Composition in space.'],['environmental-storytelling','Composed space can carry story.'],['readability-and-hierarchy','Space is information design.'],['mastery-discovery-expression','Exploration is the spatial form of discovery.'],['level-blockout-and-metrics','Sightlines and landmarks are tested on the greybox before art.']] });
TECH('spatial-composition',[
  {n:'Sightlines and landmarks', how:`Compose views so players can orient and see the next goal from where they are.`, fit:`Wayfinding without markers.`, cost:`Constraints on art and layout. Needs iteration.`, alt:`Grey-box sightline pass. Ask players to point home.`},
  {n:'Affordance density', how:`Control how many interactables and choices sit in view at once.`, fit:`Readability and avoiding overload.`, cost:`Too sparse feels empty. Too dense hides the goal.`, alt:`Cap the always-visible interactables.`},
  {n:'Flow and desire paths', how:`Shape movement so the natural route matches the intended route (weeping paths, pull of geometry).`, fit:`Guiding without rails.`, cost:`Requires playtesting and re-blockout.`, alt:`Watch where players walk and follow it.`},
  {n:'Blockout metrics', how:`Use consistent scale, corridor width and cover spacing as reusable vocabulary.`, fit:`Fast, readable level production at volume.`, cost:`Over-uniform spaces feel samey.`, alt:`Set metrics, then break them deliberately for landmarks.`}
]);
ENGINE('spatial-composition',{
  godot:{ term:`Composition is checked in the editor, not guessed. A @tool node raycasts from every entrance marker to the landmark and reports a broken read as a configuration warning in the scene dock.`,
    api:['@tool + _get_configuration_warnings()','Marker3D','PhysicsRayQueryParameters3D.create() / intersect_ray()','NavigationRegion3D + NavigationMesh','GridMap + MeshLibrary for consistent blockout metrics','OccluderInstance3D / VisibleOnScreenNotifier3D'],
    snippet:`@tool
extends Node3D
@export var landmark: Node3D
@export var entrances: Array[Marker3D] = []

func _get_configuration_warnings() -> PackedStringArray:
\tvar blind := PackedStringArray()
\tvar space := get_world_3d().direct_space_state
\tfor m in entrances:
\t\tvar q := PhysicsRayQueryParameters3D.create(m.global_position,
\t\t\tlandmark.global_position)
\t\tif space.intersect_ray(q):              # something blocks the read
\t\t\tblind.append("no sightline from %s" % m.name)
\treturn blind`,
    pitfall:`Baking a NavigationRegion3D when the blockout is not under it. By default the NavigationMesh parses only the region’s own children, so CSG or GridMap blockout parented elsewhere is ignored and the bake comes back empty or partial. Agents refuse the routes you composed and it reads as an AI bug. Parent the blockout under the region or switch the source geometry mode to a group, and rebake after every blockout move.`,
    map:`Godot NavigationRegion3D over a GridMap blockout is Unity NavMeshSurface over a ProBuilder blockout.` },
  unity:{ term:`ProBuilder for the blockout, NavMeshSurface for the routes, and gizmos for the reads. Linecast from each entrance to the landmark and draw the result so composition is visible while you edit.`,
    api:['Physics.Linecast() / Physics.Raycast()','Gizmos.DrawLine() in OnDrawGizmosSelected()','NavMeshSurface.BuildNavMesh() (AI Navigation package)','ProBuilder','Occlusion culling bake (Window > Rendering > Occlusion Culling)','Camera.CalculateFrustumPlanes()'],
    snippet:`[ExecuteAlways]
public class SightlineCheck : MonoBehaviour {
    [SerializeField] Transform landmark;
    [SerializeField] Transform[] entrances;

    void OnDrawGizmosSelected() {
        foreach (var e in entrances) {
            bool blocked = Physics.Linecast(e.position, landmark.position);
            Gizmos.color = blocked ? Color.red : Color.green;   // red means the read is broken
            Gizmos.DrawLine(e.position, landmark.position);
        }
    }
}`,
    pitfall:`Trusting a stale occlusion culling bake. The data is baked per scene and is not rebuilt when you move blockout geometry, so the wall you deleted still occludes in the build and the landmark you composed the whole room around pops in late or never renders. Rebake after blockout changes, and check in a player build, not only in the editor.`,
    map:`Unity NavMeshSurface plus ProBuilder is Godot NavigationRegion3D plus GridMap.` }});
INTERVIEW('spatial-composition',{
  junior:[
    { q:`What does it mean to say “space communicates,” concretely?`,
      a:`Sightlines show goals, landmarks orient, and paths that fork visibly offer a real choice, all of it read by the player without a word of text. Give an example of a space that told the player where to go using only geometry and light, no marker.`,
      follow:`Take that example and say what would happen to it if the marker were removed and the geometry weren’t doing the work.`,
      red:`Describes level layout purely in terms of gameplay flow with no mention of what the player sees or reads.` },
    { q:`From the entrance of a room, what should the player see first, and why does it matter?`,
      a:`The first thing visible sets what the space communicates, the goal, the danger, or the choice, and whichever it is, it should be deliberate rather than accidental. Walk through an entrance from a game you know and say what you saw first and what that told you to do.`,
      follow:`What would you check to confirm the first thing players notice matches what you intended?`,
      red:`Places the goal, danger and choice all visible at once from the entrance with no priority among them.` },
    { q:`Two paths fork and look identical. What’s the actual problem?`,
      a:`Identical-looking forks make the choice meaningless because nothing differentiates what each promises, the decision is a coin flip dressed as exploration. Forks need to look different and promise something different, or the “choice” is not a decision at all. Say what you’d change about the geometry to make two forks legibly distinct.`,
      follow:`You differentiate the forks visually. How do you confirm players read the difference rather than picking at random?`,
      red:`Treats the existence of a fork as sufficient for player choice regardless of what it looks like.` }
  ],
  mid:[
    { q:`Players open the map every thirty seconds. What do you check first?`,
      a:`Whether landmarks are visible from most positions in the space, and test orientation directly by asking players to point towards where they entered without checking the map. If they can’t, the space is not communicating position and no amount of UI will fix that cheaply. This is a geometry problem before it is a UI problem.`,
      follow:`Landmarks are visible and players still can’t point home. What’s broken?`,
      red:`Adds a compass or minimap in response to a wayfinding complaint without checking the underlying geometry.` },
    { q:`How do you review a level layout for sightline problems without walking every inch of it yourself?`,
      a:`For each entrance and fork, state what’s visible first from that position and what it communicates, flag any position with no visible landmark, and flag any fork where the options look alike or promise the same thing. Propose the smallest geometry change for each flag rather than a wholesale redesign.`,
      follow:`A flagged fork needs a bigger structural change to fix than a small geometry tweak. How do you decide whether it’s worth it?`,
      red:`Reviews the layout from a top-down map view and never checks what’s visible from player eye height.` },
    { q:`What’s recontextualization, and why is it valuable enough to plan for deliberately?`,
      a:`Revealing a known space from a new angle or state, so it reads as new without costing new geometry or assets. It is one of the cheapest ways to produce a moment of surprise because the player’s existing mental map does the work. Give an example where a game revealed a space you thought you already understood.`,
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

T('encounter-design',{ d:'level', t:'Encounter design', tag:'An encounter is a question composed of enemies, space and stakes. Design the tactical shift you want.',
  what:`The composition of a combat or challenge situation: which questions (enemies, hazards) in which space, with what information, stakes and escape. In Halo a fight starts when the player sees a Covenant squad across an open space, and a shift such as reinforcements arriving by dropship changes the plan mid-fight. An encounter has a shape: setup (read), engagement (execute), shift (something changes the plan), resolution. The shift is where encounters become memorable.`,
  why:[`Encounters are where most action games spend their play time and their content budget.`,`Encounters without a shift are executed on autopilot.`,`Space changes the question: the same enemies in a corridor and an arena ask different things.`],
  think:{ q:[`What tactical shift does this encounter force? Reinforcements, terrain change, a new priority?`,`What can the player read before committing? Is there a way to plan?`,`Where does the arena help and hinder? Cover, height, chokepoints, escape?`,`How many valid approaches are there? Have testers found more than one?`],
    trade:[`Readable setups reward planning and reduce surprise.`,`Multiple valid approaches raise expression and balance cost.`],
    traps:[`Encounters as waves of increasing count.`,`Arenas that neutralize the enemies' questions (open field for flankers).`,`Shifts that the player cannot perceive.`],
    good:[`Players plan, adapt mid-fight, and describe the fight afterwards.`,`Different players approach differently.`,`Resident Evil 4’s village fight shows the shift inside a single shot: a shot to the feet makes one villager stumble and opens a melee finish, so the player plans the crowd rather than each enemy.`],
    bad:[`Players describe encounters as “more guys”.`] },
  how:[`Write the encounter’s question sequence and intended shift.`,`Choose the arena to sharpen the questions.`,`Give the player a moment to read before engagement.`,`Test for approach variety and for whether players perceive the shift.`,`Shift the resource, not only the enemy: Half-Life 2 dresses Ravenholm with sawblades and propane tanks, so the same headcrab zombies can be fought with the Gravity Gun instead of by spending bullets.`],
  ai:{ yes:[`Draft encounter compositions from enemy questions, arena properties and an intended shift.`,`Analyze recordings or logs for approach variety.`,`Flag arenas that neutralize enemy behaviours.`],
       no:[`Decide the tactical identity of the game.`] },
  prompts:[{l:'Encounter composition',p:`Enemy questions available: [LIST]. Arena properties: [LIST]. The player knows [MECHANICS] and the intended shift is [SHIFT]. Propose 3 encounter compositions with setup, engagement, shift and resolution. For each, state what the player can read before committing, at least two valid approaches, and the approach that should fail. Identify what in the arena makes each approach viable.`}],
  verify:[`Did it use enemy count as the shift?`,`Are the “valid approaches” enabled by concrete arena features?`],
  test:[`Record approaches across players. Count distinct ones.`,`Do players react to the shift?`,`Ask players to narrate the fight afterwards.`],
  rel:[['encounters-and-enemies','Enemies are the vocabulary of encounters.'],['spatial-composition','Space shapes the question.'],['pacing','Encounters are intensity beats.'],['decisions','Approach choice is a decision.'],['combat-design','Each enemy attack is an anatomy of warn, hit and recover that the encounter composes.']] });
TECH('encounter-design',[
  {n:'Threat budget', how:`Assign enemies a cost and compose to a target that scales with the player’s kit.`, fit:`Pacing difficulty across a long game.`, cost:`Ignores synergy. Two cheap enemies can be worse than their sum.`, alt:`Budget as a first pass, then hand-tune set pieces.`},
  {n:'Arena affordances', how:`Design cover, hazards, verticality and escape routes as the encounter’s real content.`, fit:`Making fights read and offer tactical choice.`, cost:`Art and layout cost. Must match AI navigation.`, alt:`Blockout the arena around the intended decisions.`},
  {n:'Wave and phase choreography', how:`Sequence spawns/phases with an intended tactical shift and recovery windows.`, fit:`Escalation and boss fights.`, cost:`Repetitive if symmetric. Needs variation.`, alt:`Alternate pressure with brief rest.`}
]);
ENGINE('encounter-design',{
  godot:{ term:`Waves are custom Resources, the arena is markers and Area3D triggers, and the phase change is a signal. The encounter node owns the sequence so the shift is one place, not scattered across spawners.`,
    api:['Resource subclass with class_name for wave data','Area3D.body_entered','Callable.call_deferred()','Marker3D spawn points','NavigationAgent3D','signal phase_changed(index)'],
    snippet:`extends Node3D
@export var waves: Array[WaveData] = []        # Resource: scene + count per phase
@export var points: Array[Marker3D] = []
signal phase_changed(index: int)

func _on_trigger_body_entered(_body: Node3D) -> void:
\t_spawn.call_deferred(0)                    # never add bodies during the physics flush

func _spawn(i: int) -> void:
\tphase_changed.emit(i)                      # the shift the player has to read
\tfor n in waves[i].count:
\t\tvar e: Node3D = waves[i].scene.instantiate()
\t\tadd_child(e)
\t\te.global_position = points[n % points.size()].global_position`,
    pitfall:`Calling add_child() directly inside a body_entered handler. That signal fires while the physics server is flushing queries, so adding or freeing bodies there throws “Can’t change this state while flushing queries” and the wave never spawns. Defer the spawn with call_deferred and the same code works.`,
    map:`Godot Area3D triggers plus PackedScene wave resources are Unity trigger colliders plus ScriptableObject wave assets.` },
  unity:{ term:`Waves are ScriptableObjects, the arena is transforms and trigger colliders, and the phase change is a UnityEvent. Spawn points are validated against the NavMesh before anything is instantiated.`,
    api:['ScriptableObject wave asset','OnTriggerEnter(Collider)','NavMesh.SamplePosition() / NavMeshAgent.Warp()','Instantiate() with an object pool','UnityEvent<int>','NavMeshAgent.isOnNavMesh'],
    snippet:`public class Encounter : MonoBehaviour {
    [SerializeField] WaveData[] waves;             // ScriptableObject: prefab + count
    [SerializeField] Transform[] points;
    public UnityEvent<int> PhaseChanged;

    public void Spawn(int i) {
        PhaseChanged.Invoke(i);                    // the shift the player has to read
        for (int n = 0; n < waves[i].count; n++) {
            var p = points[n % points.Length].position;
            if (!NavMesh.SamplePosition(p, out var hit, 2f, NavMesh.AllAreas)) continue;
            Instantiate(waves[i].prefab, hit.position, Quaternion.identity);
        }
    }
}`,
    pitfall:`Spawning agents at a marker that is slightly off the NavMesh. NavMeshAgent.isOnNavMesh stays false and the agent never moves. The only trace is a “not close enough to the NavMesh” warning at spawn, and the encounter reads as broken enemy AI when it is a spawn-point bug. Sample the position first, or Warp the agent onto the mesh after instantiating.`,
    map:`Unity ScriptableObject wave assets plus NavMesh sampling are Godot wave Resources plus NavigationAgent3D.` }});
INTERVIEW('encounter-design',{
  junior:[
    { q:`What is an encounter, structurally, and what are its four parts?`,
      a:`Setup, where the player reads what’s coming. Engagement, where they execute. Shift, where something changes the plan partway through. Resolution. The shift is what makes an encounter memorable rather than executed on autopilot. Give an example of an encounter you remember and name its shift specifically.`,
      follow:`Take that same encounter and describe what it would feel like with the shift removed.`,
      red:`Describes an encounter purely as a list of enemies with no mention of setup, shift, or resolution.` },
    { q:`Why is a bigger arena with more enemies not automatically a bigger encounter?`,
      a:`Space changes the question an enemy asks, the same enemies in a corridor and an open arena ask completely different things, and an arena that neutralizes an enemy’s intended question, an open field for a flanker, kills the design rather than scaling it up. Count is the leftover variable, not the design.`,
      follow:`Give an example of an arena that accidentally neutralized an enemy’s intended role.`,
      red:`Scales up an encounter purely by adding enemy count to the same arena shape.` },
    { q:`What should a player be able to read before they commit to an encounter?`,
      a:`Enough of the setup to plan: what enemies are present, roughly what the arena offers, what the stakes are. Without a moment to read, the encounter can’t reward planning and everyone ends up reacting identically. Say where in a level you know that reading moment happens, or where it’s missing.`,
      follow:`You add a reading moment and players still charge in without using it. What does that tell you?`,
      red:`Treats a lack of planning as a player skill problem rather than checking whether a reading moment exists at all.` }
  ],
  mid:[
    { q:`Players describe your encounters as “more guys.” Diagnose it.`,
      a:`Check whether the enemies present are asking distinct questions from each other, whether the arena sharpens or neutralizes those questions, and whether there’s an intended tactical shift at all or just an escalating headcount. “More guys” is almost always a symptom of the shift being absent or imperceptible, not of insufficient enemy variety.`,
      follow:`The questions are distinct and there is a shift. Players still say “more guys.” What’s left?`,
      red:`Responds to “more guys” by adding a new enemy type rather than checking the existing composition first.` },
    { q:`How do you check that an encounter supports more than one valid approach, rather than assuming it does from the design?`,
      a:`Record multiple players attempting the same encounter and count distinct approaches used, not approaches you can imagine in theory. Check that the arena concretely enables each approach you intended, cover for a stealth approach, height for a ranged one, rather than just asserting variety exists. An approach nobody takes in testing does not count as supported.`,
      follow:`You find only one approach gets used despite the arena supporting others on paper. What do you check next?`,
      red:`Counts theoretically possible approaches from the design document as evidence of variety without ever recording real play.` },
    { q:`The shift in your encounter is supposed to be reinforcements arriving. Testers don’t seem to notice. What do you check?`,
      a:`Whether the shift is perceivable, a visible or audible cue, a change the player has to react to, versus something that happens in a corner of the screen they never look at. A shift the player can’t perceive isn’t a shift, it’s an invisible difficulty bump. Fix the readability of the moment before assuming the concept itself failed.`,
      follow:`You fix the readability and players notice the shift but describe it as unfair rather than exciting. What’s the difference?`,
      red:`Assumes the shift concept failed and cuts it, without first checking whether it was perceivable at all.` }
  ],
  senior:[
    { q:`How do you budget content across a whole game so encounters keep producing new tactical shifts rather than repeating the same ones?`,
      a:`Track which questions, enemy behaviours and shifts have already been used and where, since the content budget for encounters is really a budget of distinct compositions, not distinct art assets. Plan shifts against the arenas and enemy roster you have rather than inventing a new one for every encounter, since composition, not novelty, is what scales. Flag repeats explicitly rather than discovering them at the first full playthrough.`,
      follow:`You’re two-thirds through production and shifts are visibly starting to repeat. What do you change, given you can’t add new enemies or arenas at this point?`,
      red:`Assumes every encounter needs a novel shift and runs out of distinct ideas well before the content plan is complete.` },
    { q:`A design team disagrees about whether encounter difficulty should come from enemy composition or from the arena. How do you resolve it?`,
      a:`Point out they are not separable, the arena determines which questions the enemies can even ask, so treating them as competing levers misses that the composition is the arena and the enemies together. Bring evidence from actual recordings showing which approaches the current arena supports versus which the encounter intends. Resolve it by auditing the content, whether it presents the situations each design lever depends on, rather than by picking a side.`,
      follow:`The audit shows the arena is quietly doing all the work and the enemy composition barely matters. What does that mean for how the team should be spending its time?`,
      red:`Treats enemy composition and arena design as independent variables that can be tuned separately without checking their interaction.` }
  ] });
DIAGRAM('encounter-design', { kind:'curve', title:'An encounter is a question with a shape',
  x:'Encounter time', y:'Tension',
  series:[{t:'Tension', pts:[[0,0.2],[0.2,0.35],[0.42,0.6],[0.54,0.55],[0.7,0.9],[0.85,0.6],[1,0.18]]}],
  beats:[{at:0.12, t:'Read'},{at:0.4, t:'Engage'},{at:0.7, t:'Shift'},{at:0.93, t:'Resolve'}],
  alt:'Tension climbs while the player reads the space and engages, peaks at the tactical shift, and falls at the resolution.' });


T('level-blockout-and-metrics',{ d:'level', t:'Blockout and level metrics', tag:'Build the level out of plain boxes, sized to what the character can do, and prove it works before any art is made.',
  what:`A blockout (also called a greybox or whitebox) is a level built from plain, untextured shapes, made to test layout, flow and movement. Celeste’s rooms are sized against Madeline’s jump and dash, so a gap is hard because of her metrics and not by accident. Its measuring stick is the set of character metrics: how high and how far the character can jump, how fast it runs, how tall a wall it can climb or hide behind, how wide a doorway must be. Metrics are measured from the controller in the build, not from a table, and every gap, ledge, cover piece and corridor is sized against them. A blockout then shows the structure: the critical path (the route the player must take to finish), the optional space off it (side rooms, secrets, risky shortcuts), the gates that hold the player back until they are ready, and the landmarks that tell them where they are and where to go. It is playtested as boxes, and it moves to art only when the structure holds. The Valve Developer Community wiki, a community-edited reference for the Source engine, lists the player’s collision hull beside common doorway sizes, the same idea written down as a table.`,
  why:[`Layout is the most expensive thing to change after art is in. A blockout lets a wrong corridor cost an afternoon, not a month.`,`A gap sized to the character’s real jump is fair. A gap sized by eye is a bug report waiting to happen.`,`Boxes remove the excuse of looking good. If the level is fun in grey, art will help. If it is not, art will hide the problem for a while.`],
  think:{ q:[`What can the character do exactly: jump height, jump distance, run speed, climb height, cover height? Who measured them, and from which build?`,`Which route is the critical path, and can the player always find it?`,`What is optional, what does it give, and does skipping it cost the player nothing they need?`,`What stops the player going ahead before they are ready: a lock, a skill, a creature, a view, and does the player understand it is a gate?`,`Can a tester say where they are from three landmarks, without a map?`],
    trade:[`Tight metrics make every platform fair and fit the controls exactly, and they make the level rigid when the controller changes.`,`A very linear critical path is easy to follow and easy to pace. A wide one gives choice and gets players lost.`,`Staying in grey longer proves the structure and delays the art that tells players what is solid, what is dangerous and where to look.`],
    traps:[`Sizing the level by eye, then changing the jump, so every gap in the level is wrong.`,`Making the critical path the only path with something in it, so players who explore find nothing, or the opposite, putting the key reward off the path where a player can finish without ever seeing it.`,`Marking the way with a light, a colour or a prop that disappears when the art arrives.`,`Moving to art because of the schedule when the playtests still show people lost.`],
    good:[`Testers cross every gap on the critical path on the first or second try and never ask “can I make that?”.`,`Players find the way through a grey level using landmarks and shapes alone, as they would find it in the finished one.`,`Portal’s test chambers are small rooms that each teach one idea, so the layout is the lesson, and it can be judged before any art is added.`],
    bad:[`Players ask “is that a jump?” or “can I stand on that?” in the grey boxes.`,`Testers wander in loops in the first half and are lost by the second.`,`The team argues about the look of the level before anyone has finished it.`] },
  how:[`Measure the character first, in a test room: jump height and distance at full run and standing, climb height, crouch cover height, doorway width. Write them in one place and put them in the level as a ruler.`,`Place the critical path first, from the start to the end, using only the metrics. Mark the spaces that need a gate and what opens each one.`,`Add optional space off the path: a side room, a risky shortcut, a view. Give each a reason to look, and make skipping it free.`,`Add landmarks and a few sightlines to the goal, so that the player can steer with their eyes: one tall shape, one lit area, one broken wall. Remove all signs and text.`,`Playtest the grey boxes with players who have not seen the level, and watch where they stop, turn back or fall. Fix the layout, not the signage.`,`Move to art when new players finish without help, the pacing holds across two sessions, and the metrics have not changed in a while. Keep the blockout as the reference and re-test after the art pass, since collision, lighting and props can break it.`],
  ai:{ yes:[`Check a blockout’s gaps, ledges and corridors against a metrics table and list every one outside it.`,`Generate the grid, ruler objects and placeholder shapes for a metrics set.`,`Read playtest recordings or heatmaps and list where players stopped, turned back or fell.`],
       no:[`Decide whether the layout is fun. Only players in the grey boxes can show that.`,`Pick metrics for your character. They come from the controller you built and the feel you want.`] },
  prompts:[{l:'Metrics check',p:`Here are our character metrics measured from the build: [JUMP HEIGHT, JUMP DISTANCE, RUN SPEED, CLIMB HEIGHT, COVER HEIGHT, DOOR WIDTH]. Here is a list of the level’s gaps, ledges, cover pieces and openings with their sizes: [LIST]. For each, say whether it is within the metrics, how much margin it has, and whether the critical path depends on it. List the ones that would feel unfair or trivial, and say what a playtest would show for each. Do not suggest changing the character metrics.`},
    {l:'Blockout playtest plan',p:`We have a blockout of [LEVEL DESCRIPTION] with this critical path: [PATH]. Write a playtest plan for four people who have not seen it: what to tell them, what to record (where they stop, turn back, fall or get lost), the three questions to ask after, and the signal for each of these: the path is findable, the gates are understood, the optional spaces are noticed. State what would make us fix the layout and what would let us move to art.`}],
  verify:[`Did it use the metrics from our build, or generic numbers?`,`Does each proposed change fix the layout, or add a sign?`,`Does the plan test with players who have not seen the level?`],
  test:[`Time and record new players on the critical path. Where do they stop, turn back or fall?`,`Ask them to point at the way to the goal from three places, without a map.`,`Count how many players notice each optional space, and whether anyone who skipped it felt cheated.`,`After the art pass, run the same test. Do the results hold?`],
  rel:[['level-structure','The beats of a level are laid out on the blockout.'],['spatial-composition','Sightlines and landmarks are tested on the greybox.'],['prototyping','A blockout is a prototype of space, and it is tested the same way.'],['encounter-design','Cover height and arena size come from the metrics.'],['playtesting','The blockout is only as good as the playtest it is put through.'],['craft-physics-and-collision','The jump and collision numbers the level is measured against come from here.']] });
TECH('level-blockout-and-metrics',[
  {n:'Metrics ruler', how:`Build a test room that shows the real jump height, jump distance, climb height and cover height as marked shapes. Copy those shapes into every level.`, fit:`Any game with a moving character and levels built from pieces.`, cost:`Has to be rebuilt every time the controller changes.`, alt:`Put the numbers in a data file and build the level pieces from it.`},
  {n:'Grid and modular kit', how:`Build the blockout from a few box sizes that fit a grid, such as one wall height and one floor thickness, so that every piece can be swapped for art.`, fit:`Large levels and teams that hand blockouts to artists.`, cost:`A strict grid makes the level look the same and can fight organic shapes.`, alt:`Use a grid for the playable space and free shapes for the background.`},
  {n:'Critical path first', how:`Build the shortest route from start to end, then add optional space, gates and landmarks in that order, and re-test after each.`, fit:`Any level with a goal to reach.`, cost:`The first version feels thin and invites early art requests.`, alt:`Draw the path on paper first, then build it.`},
  {n:'Blockout playtest', how:`Give the grey boxes to players who have not seen them and record where they stop, turn back or fall, before any fixes.`, fit:`Every blockout, before art.`, cost:`Takes some people’s time, and a rough level can make testers focus on how it looks.`, alt:`Tell testers what is placeholder and ask only about the route and the jumps.`}
]);
ENGINE('level-blockout-and-metrics',{
  godot:{ term:`Metrics are a Resource that holds the controller numbers and works out the jump height and distance from them. The level, a gizmo or a test room reads that Resource, so a change to the jump moves the ruler.`,
    api:['Resource + class_name','@export','ProjectSettings.get_setting()','CharacterBody2D.velocity','Vector2','float'],
    snippet:`class_name PlayerMetrics extends Resource
@export var jump_velocity := 480.0          # pixels per second, from the controller
@export var run_speed := 260.0
@export var margin := 0.8                    # share of the maximum the critical path may use
var gravity: float = ProjectSettings.get_setting("physics/2d/default_gravity")

func jump_height() -> float:
\treturn jump_velocity * jump_velocity / (2.0 * gravity)

func jump_distance() -> float:
\treturn run_speed * 2.0 * jump_velocity / gravity   # flat ground, at full run

func safe_gap() -> float:
\treturn jump_distance() * margin`,
    pitfall:`Trusting the formula over the build. The physics step adds gravity in discrete steps and the player may also have coyote time, a jump buffer or a variable jump, so the real apex and distance differ a little from the closed-form numbers. Measure the real jump in a test room, with a recorded run, and keep the formula as the first estimate that tells you roughly where the ruler goes.`,
    map:`A Godot Resource with @export fields is a Unity ScriptableObject, and the ruler in the test room is a gizmo or a prefab in both.` },
  unity:{ term:`Metrics are a ScriptableObject that holds the controller numbers and works out the jump height and distance. Level pieces, gizmos or a test room read the asset, so changing the jump moves the ruler in every scene.`,
    api:['ScriptableObject + CreateAssetMenu','[SerializeField]','Physics.gravity','Physics2D.gravity','float','Gizmos'],
    snippet:`[CreateAssetMenu(menuName = "Level/Player Metrics")]
public class PlayerMetrics : ScriptableObject {
    public float jumpVelocity = 5f;            // metres per second, from the controller
    public float runSpeed = 5f;
    [Range(0.5f, 1f)] public float margin = 0.8f;   // share of the maximum the critical path may use

    float G => -Physics.gravity.y;             // use Physics2D.gravity for a 2D game

    public float JumpHeight => jumpVelocity * jumpVelocity / (2f * G);
    public float JumpDistance => runSpeed * 2f * jumpVelocity / G;   // flat ground, full run
    public float SafeGap => JumpDistance * margin;
}`,
    pitfall:`Reading Physics.gravity in a 2D game. The 2D and 3D physics have separate gravity settings, so a 2D platformer that reads the 3D value gets a ruler that is wrong by whatever the two differ by, and every gap is sized against it. Read Physics2D.gravity for 2D, and also multiply by Rigidbody2D.gravityScale if you change it. As with any formula, check the number against a recorded jump.`,
    map:`A Unity ScriptableObject is a Godot Resource, and Physics2D.gravity is the Godot default_gravity project setting.` },
  note:`Both snippets keep the numbers in one place and derive the ruler from them. That is the design point: the level is measured against the controller, so when the controller changes, the metrics change once and every gap that is now wrong can be found by checking it against the same asset.` });
INTERVIEW('level-blockout-and-metrics',{
  junior:[
    { q:`What is a greybox, and why build one before art?`,
      a:`A level in plain, untextured shapes, made to test layout, flow and movement. It is cheap to change, so a wrong corridor costs an afternoon. It also shows whether the level works without help from the look. If it is fun in grey, art will help. If it is not, art will only hide the problem for a while.`,
      follow:`What can a greybox not tell you?`,
      red:`Says it is a rough draft to throw away, with no use of it as a test.` },
    { q:`What are character metrics, and give three that a level depends on?`,
      a:`Measured numbers from the controller: jump height, jump distance at a full run, run speed, climb height, cover height and doorway width. The level is built to them so that every gap, ledge and cover piece is fair. They come from the build, not from a table.`,
      follow:`The designer changes the jump after the blockout is done. What do you do?`,
      red:`Sizes platforms by eye and fixes them one at a time when testers fall.` },
    { q:`What is the critical path, and what is optional space?`,
      a:`The critical path is the route the player must take to finish. Optional space is everything off it: side rooms, secrets, risky shortcuts. Skipping optional space must cost nothing the player needs, and it should offer something worth the detour. Mega Man X hides upgrades off the route in this way.`,
      follow:`How do you tell that a player has missed the critical path and not chosen an optional one?`,
      red:`Puts every reward on the main path, or hides the main path.` }
  ],
  mid:[
    { q:`How do you use gating and landmarks to steer a player through a level with no signs?`,
      a:`A gate holds the player back until they are ready: a lock, a skill, an enemy, a view they cannot yet reach. A landmark is a tall or distinct shape that tells them where they are and where to go. Place a landmark so that it can be seen from the places a player gets lost, and make sure the player understands what a gate needs. Test with testers who have never seen it, without a map.`,
      follow:`A tester wanders back and forth. What do you change?`,
      red:`Adds an arrow or text to fix every lost player.` },
    { q:`How do you playtest a blockout, and what do you look for?`,
      a:`Give it to players who have not seen it, say it is placeholder and ask for little talking. Record where they stop, turn back, fall or look at the ground, and time the critical path. Look for places where people ask “can I jump that?” or “where do I go?”. Fix the layout and the metrics before the signs, and run the test again.`,
      follow:`Testers keep talking about the look. How do you stop that?`,
      red:`Watches only the people who finish.` },
    { q:`How do you size a platforming gap or a cover piece?`,
      a:`Start from the measured metrics and take a share of the maximum for the critical path, so a normal player clears it with room to spare. Use the full maximum only for an optional, risky challenge. For cover, use the height at which the character visibly hides and the enemies’ eye line. Verify each against a recorded run, since coyote time and buffers change the real numbers.`,
      follow:`How do you choose the margin?`,
      red:`Uses the theoretical maximum for every gap.` }
  ],
  senior:[
    { q:`When do you move a level from blockout to art, and how do you protect it after?`,
      a:`When new players finish without help, the pacing holds across two sessions and the metrics have stopped changing. Hand artists the blockout as the reference and the metrics as the rule. After the art pass re-run the same tests, because collision, lighting, props and camera can break a layout that worked in grey. Agree who may change layout after this point.`,
      follow:`The schedule says to start art now and the tests say people are lost. What do you do?`,
      red:`Moves on schedule, with no check that the structure holds.` },
    { q:`A team of level designers works on the same game. How do you keep the metrics consistent as the controller changes?`,
      a:`Keep the metrics in one asset that the controller and the level tools both read. Build a metrics test room and a validator that lists every gap, ledge or cover piece outside the numbers. Version the metrics and announce changes, and give each change a re-check of the levels it touches. The cost of a change is then known before it is made.`,
      follow:`A change to the jump breaks forty gaps. How do you decide whether to ship it?`,
      red:`Leaves each designer to remember the numbers.` }
  ] });
DIAGRAM('level-blockout-and-metrics', { kind:'flow', title:'From metrics to art: what a blockout settles',
  steps:[{id:'metrics', t:'Measure the character', d:'jump, run, climb, cover'},{id:'path', t:'Critical path', d:'start to end, to the metrics'},{id:'optional', t:'Optional space', d:'side rooms and risks'},{id:'gates', t:'Gates and landmarks', d:'hold back and point on'},{id:'test', t:'Playtest the boxes', d:'new players, no help'},{id:'art', t:'Move to art', d:'only when it holds'}],
  edges:[['metrics','path'],['path','optional'],['path','gates'],['optional','test'],['gates','test'],['test','art']],
  note:'A failed playtest sends you back to the layout, not forward to art.' });

T('backtracking-and-return-trips',{ d:'level', t:'Backtracking and return trips', tag:'A return trip is a promise the map made earlier. Keep it, and the player enjoys the walk back. Break it, and it is a chore.',
  what:`Backtracking is the player going back to a place they have already been. Games ask for it for four reasons. An ability gate: the player saw a ledge, a wall or a door they could not pass, and later gains the double jump, the bomb or the key that passes it. A knowledge gate: nothing in the player's kit changed, but what they know did (Outer Wilds). A world-state change: something they did elsewhere altered the old place (in Mega Man X, clearing Storm Eagle’s stage cuts the power in Spark Mandrill’s and removes hazards there). The classic Zelda dungeon is the same loop in small: the item found inside opens the dungeon’s last door and often an obstacle seen earlier on the overworld. A hub: the structure asks them to go out and come home, over and over (Firelink Shrine in Dark Souls). The Metroid (1986) and Castlevania lineage made the first of these the spine of a whole genre. Super Metroid (1994) added an auto-map, and Symphony of the Night (1997) added RPG growth and a very large castle. The craft question is never whether to send the player back. It is what they find when they arrive, how much it costs to get there, and whether the game remembered to tell them it was worth it.`,
  why:[`Return trips are where an ability-gated game cashes in its promises. The lock was visible long before the key. When the key arrives the player already wants to go back, and that want is worth more than any quest marker.`,`The same trip is a chore when it is long, repeats and gives nothing new. The difference is rarely the trip. It is the ratio of walking the player already knows to things they have not seen yet.`,`Maps, shortcuts and fast travel are the three tools that shorten a known walk. Each one moves cost somewhere else: onto the player's memory, onto the world's sense of distance, or onto your content budget.`,`Return trips are also a pacing tool. A walk through changed old rooms is a rest between new areas, but only if something in the rooms is different, so rest and repetition are not the same thing.`],
  think:{ q:[`For each gate in the game: when does the player first see it, when do they first have the key, and how many minutes apart are those two moments?`,`When the player holds a new ability, can they name the three places it applies without opening the map? If not, what tells them?`,`What is different about each old room on the second visit: the route, the enemies, the lighting, the sound, the people in it? If nothing is, why are they there?`,`How long is the longest walk through content the player has fully cleared, and what do they do with their hands during it?`,`What does fast travel cost the world? What does its absence cost the player? Which of those two costs are you choosing, and for whom?`,`If a player stopped for a month and came back, what in the game would tell them where they were going?`],
    trade:[`Dense locks seen early make the return feel earned. They also build a list of open loops in the player's head, and past some count that list is a to-do list, not curiosity.`,`Shortcuts that open a loop back to a hub shrink the return. They also reduce how much of the map is walked on the second pass, so the second pass shows less of what you built.`,`Fast travel removes the cost of a long walk. It also removes the player's mental map of how places connect, so a world that was built as one continuous space plays as a menu of points.`,`A detailed map that marks every gate saves the player from lists and notes. It also removes the act of remembering, which some games use as their core loop. Hollow Knight sells its maps and pins, so the player places bought markers on a map that shows only what they have paid for or walked.`,`Respawning enemies keep old rooms dangerous and give a reason to carry a fresh skill into them. They also turn every repeated walk into a repeated fight.`],
    traps:[`Treating every locked door as one the player must be able to remember. In my judgement, past a few open locks memory fails first and the player stops exploring because they fear missing something. Treat the count as something to playtest.`,`Sending the player back for an item with no new route, no new room and no change on arrival. That is an errand, not a return trip.`,`Adding fast travel after playtests show boredom, without asking which stretch was boring. The fast travel node fixes the walk, and the next piece of content is boring for the same reason.`,`Putting the reward for the return at the far end of an old path, then putting a slow door, a cutscene or a long elevator in the way. The time between "I have the key" and "I see what it opens" is the whole experience.`,`Forgetting that a gate the player never noticed is not a gate. A key with no lock seen yet creates no pull, so the player does not know where to use it.`,`Making the map's last-known state the only record. A player returns after a break, the map shows everything as explored, and nothing tells them what is unfinished.`,`Letting one ability open dozens of gates at once. The player's sense of progress turns into a checklist task, and the last half of the game is a clean-up pass.`],
    good:[`The player says "I know where that goes" as the ability arrives, before any marker tells them.`,`The first old room reached with the new ability plays differently, not just opens.`,`Telemetry shows few players quitting in the long walks, because there are few long walks.`],
    bad:[`The player alt-tabs for a guide as soon as they gain an ability, because the game gave no signal where to use it.`,`Players describe the middle of the game as "going through the same rooms again".`,`The fastest completion runs skip the world entirely with fast travel, and the average player copies them.`] },
  how:[`Place the lock before the key. On the first pass, make sure every gate is visible and readable at a glance (a high ledge, a sealed door, a coloured barrier), not hidden. Count the open gates the player is carrying at any time, and keep that count under what a player can hold in their head, which you will find from playtesting, not from this page.`,`Write a gate table: one row per gate, with the first sighting, the key that opens it, the first moment the player holds that key, and what is behind it. Read down the column "sighting to key" and look at the minutes. Long gaps are where memory aids matter most.`,`Make the return route new. When an ability opens an old room, also change the room: a new platform above the old floor, a shortcut cut through a wall, a sealed side door now open. Prefer the ability changing how the room plays over it only opening a door. In Super Metroid the Speed Booster is one of the tools that opens routes through rooms the player has already crossed.`,`Build shortcuts that fold the map. Put a door that can only be opened from the far side near the end of a hard stretch, and let it open onto the hub or the last rest point. The player earns the loop by finishing the stretch, and the next trip through it is short.`,`Pick a fast-travel rule on purpose. Choose when it unlocks (later in the game, so the first walk is walked), where it can start and end (only at points the player has found), and what it costs (a currency, a one-way item, a loading screen). Write the rule down and test it against the longest walk in the game.`,`Draw the map for the job. Decide whether the map's job is to show where you have been, where you could go, or what is left. Mark unreachable things the player has seen (a gate, a block, an item) so that on return the map lists them. Let the player place their own pins where that is cheap. Metroid Dread’s Icon Highlight (select an icon and press Y) lights similar points across the map, can show every door a newly gained ability opens, and glows areas that still hold hidden items (Nintendo, Metroid Dread Report Vol. 9).`,`Give each return a reason to be fast or slow. As a rule of thumb of my own, untested: a reward early in the walk makes a long walk easier to accept. A reward at the far end of a long, cleared corridor makes the walk a chore.`,`Make old places recognisable on return: a distinctive silhouette, colour or sound per area, so a player returning from memory knows which area a room belongs to.`,`Measure chore. This is a measure I propose, not an established industry metric, so check it against watched playtests. Log time since the last new thing (new room, new enemy, new item, new dialogue), the length of each stretch of already-seen rooms walked in one go, and repeat visits per room. Plot them as one line per player and look for the long flat runs. Add a path heatmap per area and read it with care: a hot corridor can be a route the player chose or one you forced, so compare it with the doors that were open to them.`,`Pace returns against fresh content. After a long new area, offer a short return that pays out quickly. After several returns in a row, make the next stretch all new.`],
  ai:{ yes:[`Build the gate table from a level list and a progression order, and flag every gate whose key arrives much later than its first sighting.`,`Compute stretch lengths from a path log (time between new rooms, repeated room runs) and rank the worst ones.`,`List, for a given ability, every place in the current map where it could apply and which of them change how the room plays versus just open it.`,`Draft the fast-travel rule options for a game's structure with the cost of each.`],
       no:[`Decide how much repetition is boring for your player. That is playtest and telemetry on real players, and varies by genre and by audience.`,`Judge whether a return trip feels earned. Someone has to play it, ideally someone who has not seen the map.`,`Replace a map you have not iterated on. A map is a designed object and the design is in the details of what it marks.`] },
  prompts:[{l:'Gate table audit',p:`Here is my game's gate list: [GATE | FIRST SEEN (area, minute) | OPENED BY | KEY OBTAINED (area, minute) | WHAT IT OPENS]. For each row, compute the minutes between first sighting and key, and the number of gates open at the moment the key arrives. Flag rows where the gap is above [N] minutes, and the points where more than [M] gates are open at once. For each flagged row, propose one fix from: a memory aid, a changed sighting, a moved key, a pin, or a removed gate. State what each fix costs.`},
    {l:'Fast-travel rule options',p:`My world is [DESCRIPTION: size, connectivity, hub or none, respawning enemies or not]. The longest cleared walk is [LENGTH] and happens [HOW OFTEN]. Give three fast-travel rules (for example: none with shortcuts only; unlock mid-game at discovered nodes; free at any discovered node), and for each say what it does to (a) the mental map, (b) the sense of distance, (c) the reward timing of a return trip, (d) the content I must build. Name the rule you would test first and the playtest question that would overturn it.`}],
  verify:[`Does every gate the player can open have a first sighting that happens before the key? Check by playing the intended order with the map hidden.`,`On the first return with a new ability, does the old room play differently, or does a door simply open?`,`Is there any stretch of fully cleared rooms walked more than once, longer than a number you chose in advance, with no new thing in it?`,`Can a player who stops for a week tell, from the game alone, which gates are still open and where?`,`If fast travel exists, does the first walk between two points still happen on foot at least once, and does the route make sense in the player's head afterwards?`],
  test:[`Give players the new ability and say nothing. Measure minutes until they head to the first correct gate, and how many go to the wrong place first. A long delay means the sighting did not register.`,`Record the path of every playtester and plot, per player, the time between new things. Look for stretches where a player's line stays flat and for players who stop in those stretches.`,`Overlay playtest paths on the map as a heatmap. A corridor walked many times by every player is a forced route. Check whether a shortcut or a new thing belongs there.`,`Ask a tester to draw the map from memory after an hour. Compare it to the real map. Gaps show which areas lost their identity.`,`Run the fast-travel rule against two groups, one with it unlocked early and one unlocked late, and compare how well each can describe the way between two far areas without a map.`,`Watch for the moment a player opens the map with no goal. That is a lost player, and the map is being used as a rescue.`],
  rel:[['spatial-composition','Sightlines and landmarks are how a lock gets seen before the key. This topic starts where that one ends: after the player has seen the lock, what the return costs.'],['level-structure','A return trip is a twist on a known space. The teach, test, twist, combine, master, rest pattern says what the second visit should add.'],['knowledge-as-progression','When the gate is in the player’s head rather than the save file, the return trip is a decision to go somewhere with new understanding, and the map is a notebook.'],['quests-and-events','Quests send players back to old places for reasons of story. Whether the errand has a changed place and a changed reason decides if it is an errand.'],['pacing','A return through changed rooms is a rest between new areas. Pacing curves are where you decide how many returns in a row are allowed.'],['onboarding','Return trips are taught on the first locked door. Whatever the first gate teaches the player about how this game sends them back is the contract for the rest.'],['metrics-and-success','Chore is measured: time since a new thing, repeated traversal length and path heatmaps are metrics you must choose before you can read them.']],
  tech:[
    {n:'Lock seen before key', how:`This is the Zelda dungeon loop: the dungeon item opens the last door and often an obstacle seen on the overworld, and Mark Brown’s Boss Keys series maps it dungeon by dungeon. Show the gate at a moment the player cannot open it, in a place they will pass again: a high ledge, a sealed door, a tinted barrier. Hand over the key far away or much later. When the key arrives, the player already knows where to use it.`, fit:`Ability-gated worlds with a hub or a few main arteries the player passes often.`, cost:`Every open gate is a loop the player carries. Too many at once and the game becomes a list. A gate the player never saw gives no pull.`, alt:`Reveal the gate when the key is found (a marker or a cutscene). It is less to remember and removes the sense of finding the answer yourself.`},
    {n:'Fold the map with a far-side shortcut', how:`Put a door, ladder or elevator that opens only from its far side at the end of a hard stretch, and connect it to the hub or an early rest point. The first trip is long and the next trips are short. Dark Souls is the standard example: the lift from the Undead Parish down to Firelink Shrine, and other loops back to the hub.`, fit:`Worlds with no fast travel, or with it unlocked late, where the connections are the world's identity.`, cost:`Needs a connected 3D layout that a designer can hold in their head. The second pass walks less of the map than the first, so important content cannot hide only in the stretch the shortcut skips.`, alt:`Fast-travel nodes: shorter to build, and they remove the sense of one connected place.`},
    {n:'Fast travel limited to found nodes', how:`Let the player jump only between points they have reached and activated, and make unlocking it late, costly or tied to a visit. Dark Souls grants bonfire warping mid-game, with the Lordvessel, and you can warp from most bonfires but only to a small set of lit ones, so the rule is itself a lever. Hollow Knight’s Stag Station network is another version.`, fit:`Large worlds where the longest walk, repeated, would be the bulk of the late game.`, cost:`The player’s mental map of how places connect probably gets thinner each time it is used (my judgement; test it). The game must then give them a reason to walk anyway: rewards on the way, unseen routes, danger.`, alt:`No fast travel: strongest sense of place and the highest risk of chore. Free warping: Elden Ring lets the player travel from the map to any discovered site of grace, outside dungeons and combat, so the same studio made the opposite choice to Dark Souls. Skyrim is also free, from anywhere outdoors to any discovered location.`},
    {n:'The map is part of the game', how:`Make the map something the player earns and writes on. Hollow Knight sells maps area by area (Iselda in Dirtmouth sells them too, at a higher price), needs a quill to update them (at a bench) and sells pins, markers and a compass separately. The player places pins on a map that fills in as they walk and pays to see more of it.`, fit:`Games where getting lost is intended and the player's own notes are part of the fun.`, cost:`Needs a shop economy and tutorials the player will miss. Some players read it as a tax. A confusing first map costs more players than it teaches.`, alt:`Give a full auto-map with highlights (Metroid Dread’s Icon Highlight shows every door a new ability opens, and areas with hidden items glow). The player's memory carries less, and the designer can read the map's state.`},
    {n:'Segment the world around the player', how:`At key points, lock the player into a small part of the world with a one-way gate or a collapse behind them, so only that part of the map needs to be held in mind. Metroid Dread does this at many points, and Mark Brown’s Game Maker’s Toolkit video “Why You Didn’t Get Lost in Metroid Dread” lists it among the reasons players rarely got lost. He also notes points of no return that the player rarely notices.`, fit:`Large, tangled maps where the main arc is mostly directed.`, cost:`Takes agency: the player cannot go back. It also hides large parts of the map for a while, and some players will notice the corridor.`, alt:`Leave the whole map open and give a strong map and landmarks. More freedom, more lost players.`},
    {n:'Traversal upgrade that changes the room', how:`Design the old room to be played twice: once without the ability, once with it. The second play is a different path (a ceiling route, a wall the dash crosses, a floor that drops), not only a lock now open.`, fit:`Any ability-gated game where the same rooms are visited three or more times.`, cost:`Each room is built with two designs in mind, which is more content and more testing.`, alt:`Open a door and nothing else. Cheap, and it makes the return an errand.`},
    {n:'World state changes on return', how:`Change something the player did elsewhere in the old place: lights off, a hazard gone, a new person, a collapsed bridge. Outer Wilds does it with time, since places change during the 22-minute loop. Mega Man X lets one stage’s outcome change another: clearing Storm Eagle’s stage shorts the traps in Spark Mandrill’s, and Chill Penguin’s ice freezes the lava in Flame Mammoth’s.`, fit:`Worlds where the player has a reason to think the places are alive.`, cost:`You must track and test more world states, and old saves must still be valid.`, alt:`Static world with respawning enemies: simple, and gives no reason to look again.`}
  ] });
ENGINE('backtracking-and-return-trips',{
  godot:{ term:`A chore meter, a measure I propose rather than an industry standard. Your room triggers call it. It logs how long it has been since the player met something new, and how many rooms with nothing new they crossed since. A known room that now holds something new counts as new.`,
    api:['Time.get_ticks_msec()','Dictionary.has()','StringName','print()'],
    snippet:`extends Node
var _seen := {}
var _last_new_ms := 0
var _quiet_rooms := 0

func on_room_entered(id: StringName, has_new_thing: bool) -> void:
\tvar now := Time.get_ticks_msec()
\tif has_new_thing:
\t\tvar kind := "changed room" if _seen.has(id) else "new room"
\t\tprint("%s after %.0f s, %d quiet rooms" % [kind, (now - _last_new_ms) / 1000.0, _quiet_rooms])
\t\t_last_new_ms = now
\t\t_quiet_rooms = 0
\telse:
\t\t_quiet_rooms += 1
\t_seen[id] = true`,
    pitfall:`Counting "new" as "new room". A room can be new and empty, and a known room can hold a changed ability route. Pass has_new_thing for anything the player has not seen: a room, a threat, an item, a line of dialogue or a changed route, and log which kind, or the numbers will say the pacing is fine while the player walks an empty corridor.`,
    map:`Call it from a room Area2D’s body_entered in Godot or an OnTriggerEnter2D on a room collider in Unity; both feed the same counter.` },
  unity:{ term:`The same proposed meter as a MonoBehaviour. Room triggers call it, and it writes one line per new thing: seconds since the last, and quiet rooms crossed in between. Plot these per player.`,
    api:['Time.realtimeSinceStartupAsDouble','HashSet<string>.Add()','Debug.Log()'],
    snippet:`public class ChoreMeter : MonoBehaviour {
    readonly HashSet<string> seen = new();
    double lastNew;
    int quietRooms;

    public void RoomEntered(string id, bool hasNewThing) {
        double now = Time.realtimeSinceStartupAsDouble;
        bool firstVisit = seen.Add(id);
        if (hasNewThing) {
            string kind = firstVisit ? "new room" : "changed room";
            Debug.Log($"{kind} after {now - lastNew:F0}s, {quietRooms} quiet rooms");
            lastNew = now;
            quietRooms = 0;
        } else quietRooms++;
    }
}`,
    pitfall:`Using Time.time, which follows the time scale and stops while the game is paused with Time.timeScale set to 0. Time on the map screen then reads as nothing. Use real time, and decide whether time on the map screen counts as walking.`,
    map:`Godot’s Time.get_ticks_msec() and Unity’s Time.realtimeSinceStartupAsDouble (the Unity 6 docs prefer it over the float for long sessions) both measure real time, and both are the right clock for a pacing log.` },
  note:`The code is the cheap half. The design half is deciding what counts as a new thing and what a player does with their hands during a stretch, and that lives in the gate table, not in the engine.` });
INTERVIEW('backtracking-and-return-trips',{
  junior:[
    { q:`Why do metroidvania-style games send the player back to places they have already been?`,
      a:`An ability or key gate. The player sees a lock early and gets the key later, so the world opens up as they grow. Say that the return is the payoff, not a padding trick: the lock was a promise. Mention a second reason, a world change or a knowledge gate, to show it is not only abilities.`,
      follow:`What makes the return fun rather than a chore?`,
      red:`Says backtracking is padding to lengthen the game, with no mention of the earlier lock.` },
    { q:`What is the difference between a shortcut and fast travel?`,
      a:`A shortcut is a new connection in the world that the player walks, opened from the far side so it folds the map. Fast travel jumps between points without walking. Shortcuts keep the world one place. Fast travel saves time and thins the mental map.`,
      follow:`Which one would you use in a game with respawning enemies, and why?`,
      red:`Treats them as the same thing.` },
    { q:`A playtester says "I keep walking through the same rooms". What do you ask first?`,
      a:`Which rooms, how often, and what was new in them. The problem may be the length of the trip, nothing new on it, or a missing reason to go. Do not reach for fast travel before knowing which.`,
      follow:`How would you check this without asking the player?`,
      red:`Adds fast travel immediately.` }
  ],
  mid:[
    { q:`A player gets a new ability. How do you make sure they know where to use it without a marker?`,
      a:`Make sure the lock was visible and memorable when they first passed it, and consider a memory aid: a distinct silhouette, a map note, a pin. A map with Metroid Dread’s Icon Highlight, which shows every door a new ability opens, is one answer. Say the cost: it removes remembering. Test by giving the ability and measuring minutes to the first correct gate.`,
      follow:`What if the player has not seen the lock because they skipped that area?`,
      red:`Relies on a quest log arrow only.` },
    { q:`What does Hollow Knight's map-selling system do for backtracking, and what does it cost?`,
      a:`Maps are bought from a cartographer found in most areas (his wife’s shop sells them too, dearer), updated at benches with a quill, and pins and a compass are separate purchases. The map is earned and written on, so exploring and returning feels like drawing. The cost is a menu of small purchases the player may miss, and an early map that confuses.`,
      follow:`What would you change for a younger or less patient audience?`,
      red:`Says maps should always be free and complete.` },
    { q:`Describe a return trip where the room plays differently, not just opens.`,
      a:`Pick a specific case: an ability that turns a floor route into a ceiling route, or Super Metroid’s Speed Booster opening a route through a room already crossed. Say that the room was built twice: once for the first pass and once for the second. Name the cost, extra content and testing.`,
      follow:`How do you budget for rooms designed twice?`,
      red:`Describes only a locked door opening.` }
  ],
  senior:[
    { q:`Your open-world game has no fast travel and players call the late game a slog. Fast travel is a day's work. What do you do?`,
      a:`Find where the time goes first: log the time since the last new thing and the length of each repeated stretch, per player. If the long runs are a few corridors, shortcuts or a late-unlock fast travel at discovered nodes fix them. If they are everywhere, the world is too sparse for its size, and fast travel hides that. State the cost: fast travel thins the mental map and weakens the sense of place the game was built on.`,
      follow:`If you add it, what rule keeps the early game walked on foot?`,
      red:`Adds free fast travel with no measurement.` },
    { q:`You are given a map with 40 gates and an ability order. What do you check, and what could you change cheaply?`,
      a:`Build the gate table: first sighting, key, time between, and gates open at once. Flag long gaps and high open counts. Cheap fixes: move a key earlier, move a sighting later, add a distinct landmark by the gate, or add a map mark. Say what you would not change cheaply: the order of a main ability. Say you would test with players who have not seen the map.`,
      follow:`Three gates share one ability. Do you worry?`,
      red:`Proposes a quest log for every gate without considering what that removes.` },
    { q:`Argue for and against a map that auto-marks every unreachable item.`,
      a:`For: it removes list-keeping and lowers the number of players lost. Against: it turns exploration into a checklist, removes the memory loop and may remove the surprise of finding a lock. A middle option: mark only what the player has seen, and let them add pins. Say how you would test: compare minutes lost and the rate of quitting in the middle of the game, and ask what players say the game was about.`,
      follow:`Which audience would you ship the strong map for?`,
      red:`Presents one side as obviously right.` },
    { q:`How would you tell a good return trip from a chore using only telemetry?`,
      a:`Say that these are measures I would propose, not an industry standard: time since the last new thing, the length of repeated stretches, repeat visits per room, path heatmaps and where sessions end. What I would look for: a short flat stretch followed by a change in a good trip, and a long flat stretch with quits in it in a chore. Name the limit: telemetry shows where, not why, so pair it with a few watched playtests.`,
      follow:`A heatmap shows a hot corridor. Is that good or bad?`,
      red:`Reads high traffic as high engagement.` }
  ] });
FACTS('backtracking-and-return-trips',[
  {claim:'Hollow Knight: shop prices as listed by the community wiki: Cornifer sells area maps (30 Geo for Forgotten Crossroads up to 150 Geo for Queen’s Gardens and Fog Canyon; Iselda sells them dearer), the Quill costs 120 Geo, most pins 100 Geo (a few cost more) and the Wayward Compass charm 220 Geo. Maps are updated by resting at benches.', asOf:'2026-10-05', src:'https://hollowknight.wiki/w/Cornifer'},
  {claim:'Outer Wilds: the time loop is 22 minutes and the only thing that persists is the ship-log data.', asOf:'2026-10-05', src:'https://en.wikipedia.org/wiki/Outer_Wilds'},
  {claim:'Dark Souls: warping between bonfires comes with the Lordvessel, given after Ornstein and Smough in Anor Londo; you can warp from most bonfires but only to a small set of lit ones. Later games in the series differ.', asOf:'2026-10-05', src:'https://darksouls.wiki.fextralife.com/Lordvessel'},
  {claim:'Elden Ring: the player can fast travel from the map to any discovered site of grace, except inside dungeons and in combat. Map fragments must be found to reveal the map.', asOf:'2026-10-05', src:'https://eldenring.wiki.gg/wiki/Mechanics'},
  {claim:'Skyrim: fast travel is free from any outdoor location to any discovered location; carriages are the paid alternative.', asOf:'2026-10-05', src:'https://content1.m.uesp.net/wiki/Skyrim:Carriage'},
  {claim:'Metroid Dread: Icon Highlight (select an icon, press Y) highlights similar points of interest across the map, can show all doors a newly gained ability opens, and areas with hidden items glow.', asOf:'2026-10-05', src:'https://metroid.nintendo.com/dread/news/metroid-dread-report-vol-9'}
]);
DIAGRAM('backtracking-and-return-trips', { kind:'loop', title:'A return trip: from a lock seen to a changed room',
  steps:[{t:'See the lock',d:'A ledge, a seal or a coloured block the player cannot pass yet.'},{t:'Move on',d:'The player continues with the lock noted, on the map or in their head.'},{t:'Gain the key',d:'An ability, an item or a fact arrives, far from the lock.'},{t:'Recall',d:'A memory aid points back: a silhouette, a pin or a map mark. Majora’s Mask has a notebook for it.'},{t:'Return',d:'The walk back. Shortcuts or fast travel set its length.'},{t:'Room plays new',d:'A new route or state, not only an open door.'},{t:'New ground',d:'It leads on to unseen content, which restarts the loop.'}] });
EXPLAINER('backtracking-and-return-trips', { kind:'explainer', title:'A map grows and folds as keys arrive, so the walk home shrinks',
  frames:[
    { t:'The first area is a line from the hub, with one lock seen on the way', spec:{ kind:'state', start:'hub', states:[{ id:'hub', t:'Hub' }, { id:'hall', t:'Hall' }, { id:'ga', t:'Gate A', d:'closed' }, { id:'boss', t:'Boss room' }], edges:[['hub','hall'],['hall','ga','locked'],['hall','boss']] } },
    { t:'A second gate is seen deeper in, so the player carries two open loops', spec:{ kind:'state', start:'hub', states:[{ id:'hub', t:'Hub' }, { id:'hall', t:'Hall' }, { id:'ga', t:'Gate A', d:'closed' }, { id:'deep', t:'Depths' }, { id:'gb', t:'Gate B', d:'closed' }, { id:'boss', t:'Boss room' }], edges:[['hub','hall'],['hall','ga','locked'],['hall','deep'],['deep','gb','locked'],['deep','boss']] } },
    { t:'The boss drops key A, a long way from its gate', spec:{ kind:'state', start:'hub', states:[{ id:'hub', t:'Hub' }, { id:'hall', t:'Hall' }, { id:'ga', t:'Gate A', d:'closed' }, { id:'deep', t:'Depths' }, { id:'gb', t:'Gate B', d:'closed' }, { id:'boss', t:'Boss room', d:'key A here' }], edges:[['hub','hall'],['hall','ga','locked'],['hall','deep'],['deep','gb','locked'],['deep','boss']] } },
    { t:'The player walks the whole line back to gate A', d:'Every room on the way is one the player has already seen.', spec:{ kind:'state', start:'boss', states:[{ id:'boss', t:'Boss room', d:'key A' }, { id:'deep', t:'Depths' }, { id:'hall', t:'Hall' }, { id:'ga', t:'Gate A', d:'opens' }], edges:[['boss','deep','walk back'],['deep','hall','walk back'],['hall','ga','open with key A']] } },
    { t:'Gate A opens onto a new branch with a door that opens only from the far side', spec:{ kind:'state', start:'hub', states:[{ id:'hub', t:'Hub' }, { id:'hall', t:'Hall' }, { id:'br', t:'Branch A', d:'new rooms' }, { id:'door', t:'One-way door', d:'opens from the far side' }, { id:'deep', t:'Depths' }, { id:'gb', t:'Gate B', d:'closed' }], edges:[['hub','hall'],['hall','br','through gate A'],['br','door'],['hall','deep'],['deep','gb','locked']] } },
    { t:'The door is opened from the far side, and the long walk home is gone', d:'Branch A now loops straight back to the hub.', spec:{ kind:'state', start:'hub', states:[{ id:'hub', t:'Hub' }, { id:'hall', t:'Hall' }, { id:'br', t:'Branch A' }, { id:'door', t:'Shortcut door', d:'open' }, { id:'deep', t:'Depths' }, { id:'gb', t:'Gate B', d:'closed' }], edges:[['hub','hall'],['hall','br'],['br','door'],['door','hub','shortcut'],['hall','deep'],['deep','gb','locked']] } },
    { t:'A fast-travel stone mid-map turns two walked stretches into one hop', spec:{ kind:'state', start:'hub', states:[{ id:'hub', t:'Hub' }, { id:'hall', t:'Hall' }, { id:'br', t:'Branch A' }, { id:'stone', t:'Fast-travel stone' }, { id:'deep', t:'Depths' }, { id:'gb', t:'Gate B', d:'closed' }], edges:[['hub','hall'],['hall','br'],['br','hub','shortcut'],['hub','stone','one hop'],['stone','deep'],['deep','gb','locked']] } },
    { t:'Key B opens gate B, and the room behind it has changed since it was first seen', d:'The whole map: hub, loop, branch, stone, and the second branch.', spec:{ kind:'state', start:'hub', states:[{ id:'hub', t:'Hub' }, { id:'hall', t:'Hall' }, { id:'br', t:'Branch A' }, { id:'stone', t:'Fast-travel stone' }, { id:'deep', t:'Depths' }, { id:'gb', t:'Gate B', d:'open' }, { id:'new', t:'Branch B', d:'flooded since your first visit' }], edges:[['hub','hall'],['hall','br'],['br','hub','shortcut'],['hub','stone','one hop'],['stone','deep'],['deep','gb','key B'],['gb','new']] } }
  ] });
