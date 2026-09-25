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
  how:[`Write the level’s idea in one sentence and the structure in six beats.`,`Grey-box the beats. Test whether players learn the idea by the test beat without instruction.`,`Design the twist to recontextualize, not to escalate. Escalation is the master beat.`,`Check the rest beat carries something (reward, vista, story).`,`Only after the structure works, dress it.`],
  ai:{ yes:[`Draft beat structures for a stated idea, skill position and emotional target.`,`Audit an existing level script for missing beats.`,`Generate twist candidates for a mechanic.`],
       no:[`Generate levels before you define intended skill, known mechanics, emotional target, pacing position and constraints. Without those, output is generic.`] },
  prompts:[{l:'Level beat plan',p:`Design constraints: the player currently knows [MECHANICS], the idea this level teaches is [IDEA], the emotional target is [EMOTION], the pacing position is [POSITION in the game], and constraints are [TIME, ASSETS]. Propose 3 six-beat structures (teach, test, twist, combine, master, rest). For each beat, state what the player does, what they could fail, and what they learn. Make the twists different across the 3 proposals. Do not describe visuals.`}],
  verify:[`Did it escalate where it should twist?`,`Are beats grounded in the mechanics I said the player knows?`],
  test:[`Do players use the idea in the test beat without prompting?`,`Where do they die in the introduction? That is a teaching failure.`,`Do they react to the twist (pause, comment, laugh)?`,`Can they state what the level was about afterwards?`],
  rel:[['pacing','Beats are pacing at level scale.'],['skill-and-mastery','Levels are where skill atoms are taught and combined.'],['onboarding','The first levels are the onboarding.'],['tension-release','Test and rest are tension and release.']] });
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
  what:`The rhythm of demands over a level or session. Encounter pacing is about intensity: how much pressure, how fast. Cognitive pacing is about thinking: how much new information, how many decisions per minute. Good pacing alternates both and rarely peaks both at once.`,
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
  what:`The arrangement of space to guide, inform and reward: sightlines that show goals, landmarks that orient, paths that offer choice, hidden pockets that reward attention, and recontextualization where a known space is seen anew. Exploration is the player choosing where to look. Composition is the designer deciding what they will find.`,
  why:[`Space is the most powerful silent teacher: where the player looks decides what they learn.`,`Players lost in space are not playing. They are wayfinding.`,`Choice of path is a decision, and paths with visibly different promises make it meaningful.`],
  think:{ q:[`From the entrance, what does the player see first? Is that the goal, the danger, or the choice?`,`Can the player always name a landmark? Can they say where they came from?`,`Where the path forks, do the forks look different and promise different things?`,`What rewards attention: a pocket, a vista, a shortcut back?`],
    trade:[`Strong guidance reduces getting lost and reduces discovery.`,`Open space rewards exploration and dilutes pacing control.`],
    traps:[`Relying on markers instead of space.`,`Forks that are identical in look and reward.`,`Backtracking through unchanged space.`],
    good:[`Players head towards the right thing without a marker.`,`Players say “I wonder what is over there” and go.`,`Players treat a return trip as a reward, not a repeat, when a found key turns a door they walked past into the way on, as in Doom’s keycard levels.`],
    bad:[`Players open the map every 30 seconds.`] },
  how:[`Grey-box with primary sightlines first: what is visible from each entrance and fork.`,`Place landmarks visible from most positions. Test orientation by asking players to point home.`,`Make forks legible and differently promising.`,`Recontextualize: reveal a known space from a new angle or state.`,`Keep one landmark in view across the world: Elden Ring’s golden Erdtree is visible from most of the Lands Between, so players triangulate their position by sightline, with no quest marker to follow.`],
  ai:{ yes:[`Review a layout description for sightline and landmark gaps.`,`Generate fork designs with distinct promises.`,`Analyze heatmaps and paths for wayfinding failure.`],
       no:[`Judge how a space feels. Feel is observed.`] },
  prompts:[{l:'Sightline review',p:`Here is a level layout with entrances, forks, landmarks and goals: [LAYOUT]. For each entrance and fork, state what the player sees first and what that communicates. Flag positions where no landmark is visible and forks whose options look alike or promise the same thing. Propose the smallest geometry changes to fix each flag. Then identify one opportunity to recontextualize a known space.`}],
  verify:[`Are its sightline claims consistent with the geometry I described, including camera height?`],
  test:[`Ask players to point to where they entered. Track error.`,`Track map opens per minute.`,`Which forks do players take, and can they say why?`,`Do players notice recontextualization?`],
  rel:[['level-structure','Structure in time. Composition in space.'],['environmental-storytelling','Composed space can carry story.'],['readability-and-hierarchy','Space is information design.'],['mastery-discovery-expression','Exploration is the spatial form of discovery.']] });
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
  what:`The composition of a combat or challenge situation: which questions (enemies, hazards) in which space, with what information, stakes and escape. An encounter has a shape: setup (read), engagement (execute), shift (something changes the plan), resolution. The shift is where encounters become memorable.`,
  why:[`Encounters are where most action games spend their play time and their content budget.`,`Encounters without a shift are executed on autopilot.`,`Space changes the question: the same enemies in a corridor and an arena ask different things.`],
  think:{ q:[`What tactical shift does this encounter force? Reinforcements, terrain change, a new priority?`,`What can the player read before committing? Is there a way to plan?`,`Where does the arena help and hinder? Cover, height, chokepoints, escape?`,`How many valid approaches are there? Have testers found more than one?`],
    trade:[`Readable setups reward planning and reduce surprise.`,`Multiple valid approaches raise expression and balance cost.`],
    traps:[`Encounters as waves of increasing count.`,`Arenas that neutralize the enemies' questions (open field for flankers).`,`Shifts that the player cannot perceive.`],
    good:[`Players plan, adapt mid-fight, and describe the fight afterwards.`,`Different players approach differently.`],
    bad:[`Players describe encounters as “more guys”.`] },
  how:[`Write the encounter’s question sequence and intended shift.`,`Choose the arena to sharpen the questions.`,`Give the player a moment to read before engagement.`,`Test for approach variety and for whether players perceive the shift.`],
  ai:{ yes:[`Draft encounter compositions from enemy questions, arena properties and an intended shift.`,`Analyze recordings or logs for approach variety.`,`Flag arenas that neutralize enemy behaviours.`],
       no:[`Decide the tactical identity of the game.`] },
  prompts:[{l:'Encounter composition',p:`Enemy questions available: [LIST]. Arena properties: [LIST]. The player knows [MECHANICS] and the intended shift is [SHIFT]. Propose 3 encounter compositions with setup, engagement, shift and resolution. For each, state what the player can read before committing, at least two valid approaches, and the approach that should fail. Identify what in the arena makes each approach viable.`}],
  verify:[`Did it use enemy count as the shift?`,`Are the “valid approaches” enabled by concrete arena features?`],
  test:[`Record approaches across players. Count distinct ones.`,`Do players react to the shift?`,`Ask players to narrate the fight afterwards.`],
  rel:[['encounters-and-enemies','Enemies are the vocabulary of encounters.'],['spatial-composition','Space shapes the question.'],['pacing','Encounters are intensity beats.'],['decisions','Approach choice is a decision.']] });
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
