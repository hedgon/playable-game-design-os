/* =====================================================================
   ENGINE VIEWS (part B2): production, ai, gameai, studio.
   Same shape and rules as 30-data-engine-a.js:
     ENGINE('topic-id',{ godot:{term,api:[],snippet,pitfall,map},
                         unity:{term,api:[],snippet,pitfall,map}, note:'' })
   Godot 4.x and Unity 6 / 2022 LTS. Real node, class and method names
   only. One snippet of at most 15 lines. One engine-specific pitfall.

   Topics this file owns (31):
     production  prototyping, hypothesis-driven-design, playtesting,
                 iteration-and-evidence, vertical-slice-mvp,
                 risk-and-dependencies, polish-when
     ai          bottleneck-shift, ai-roles, prompting-framework,
                 verifying-ai-output, ai-failure-modes,
                 responsibility-matrix, ai-for-implementation,
                 ai-for-playtest-analysis, ai-loop
     gameai      ingame-ai-purpose, choosing-ai-technique,
                 perception-and-awareness, navigation-and-pathfinding,
                 readable-and-fair-ai, adaptive-and-director-ai,
                 allies-and-companions, learning-based-ai,
                 ai-budgets-and-debugging, scripted-vs-simulated
     studio      design-documents, metrics-and-success,
                 team-and-collaboration, planning-and-milestones,
                 quality-and-build-health
   ===================================================================== */

/* ---------------- PRODUCTION ---------------- */

ENGINE('prototyping',{
  godot:{ term:`A prototype is a scene, not a project. One .tscn in its own folder, CSG or ColorRect greyboxes standing in for art, and every number the test might move sitting on the root node as an @export_range slider.`,
    api:['@export_range / @export_group','CSGBox3D / ColorRect','PackedScene.instantiate()','FileAccess.open("user://…", WRITE)','Time.get_ticks_msec()','get_tree().reload_current_scene()'],
    snippet:`extends Node3D                     # res://proto/dodge/dodge.tscn, deleted Friday
@export_range(0.1, 2.0) var telegraph := 0.6      # the one knob under test
@export_range(1, 40) var spawn_count := 8
@export var blob: PackedScene
var _log := FileAccess.open("user://dodge_run.csv", FileAccess.WRITE)

func _ready() -> void:
\t_log.store_line("t_ms,event,telegraph")
\tfor i in spawn_count:
\t\tadd_child(blob.instantiate())

func record(event: String) -> void:
\t_log.store_line("%d,%s,%.2f" % [Time.get_ticks_msec(), event, telegraph])`,
    pitfall:`Changing the default of an @export var does not change a scene that is already saved. The .tscn stores the value it had when you last saved it, so you edit 0.6 to 0.4 in the script, run, and nothing moves. Re-tune on the scene in the inspector, use the revert arrow to drop a stored value, and remember that numbers you drag while the game runs are gone the moment you stop.`,
    map:`Godot @export_range is Unity [SerializeField] with [Range], a .tscn is a scene or prefab asset, and user:// is Application.persistentDataPath.` },
  unity:{ term:`A prototype is its own Scene plus one MonoBehaviour. Primitives from GameObject.CreatePrimitive stand in for art, [Range] exposes the knobs, and the knobs live on a ScriptableObject asset so the values you tuned during the session still exist after you press Stop.`,
    api:['[SerializeField] / [Range] / [Header]','GameObject.CreatePrimitive(PrimitiveType.Cube)','ScriptableObject + [CreateAssetMenu]','Application.persistentDataPath','StreamWriter','Time.realtimeSinceStartup'],
    snippet:`[CreateAssetMenu(menuName = "Proto/DodgeTuning")]      // asset survives Play mode
public class DodgeTuning : ScriptableObject {
    [Range(0.1f, 2f)] public float telegraph = 0.6f;   // the one knob under test
    [Range(1, 40)] public int spawnCount = 8; }
public class DodgeProto : MonoBehaviour {              // Scenes/Proto_Dodge.unity
    [SerializeField] DodgeTuning tuning;
    StreamWriter log;
    void Awake() {
        log = new StreamWriter(Application.persistentDataPath + "/run.csv", true);
        for (int i = 0; i < tuning.spawnCount; i++) GameObject.CreatePrimitive(PrimitiveType.Cube);
    }
    void OnDestroy() => log.Dispose();
    public void Record(string e) => log.WriteLine(
        $"{Time.realtimeSinceStartup:F3},{e},{tuning.telegraph}");
}`,
    pitfall:`Tuning a plain [SerializeField] float while the game runs, then pressing Stop. Unity discards every Play mode change on a MonoBehaviour, so the values that produced the one good session are gone before anyone wrote them down. Put the knobs on a ScriptableObject asset, which keeps Play mode edits in the Editor, and read them back when the session ends.`,
    map:`Unity [Range] on a [SerializeField] is Godot @export_range, a ScriptableObject is a Resource saved as .tres, and Application.persistentDataPath is user://.` } });

ENGINE('hypothesis-driven-design',{
  godot:{ term:`The hypothesis is a Resource. A small script extending Resource, saved as a .tres beside the prototype scene, holding the claim, the observable signal, the target rate and the kill criterion, so the build carries its own question.`,
    api:['extends Resource + class_name','@export_multiline / @export','ResourceLoader.load() / ResourceSaver.save()','resource_local_to_scene','Resource.duplicate(true)','.tres text files'],
    snippet:`extends Resource
class_name HypothesisSpec          # res://proto/dodge/hypothesis.tres

@export_multiline var claim := "Players will switch weapon by enemy type"
@export var signal_event := "weapon_switch"    # what a session must show
@export var target_rate := 0.6                 # kill the idea below this
@export var seen := 0
@export var sessions := 0

func rate() -> float:
\treturn 0.0 if sessions == 0 else float(seen) / float(sessions)

func verdict() -> String:
\treturn "KEEP" if rate() >= target_rate else "KILL"`,
    pitfall:`A .tres loaded from several places is one shared object. Every node that loads it gets the same instance, and anything written into it while the editor runs is still there after you stop, so yesterday's counters quietly become today's evidence. Tick Local to Scene (resource_local_to_scene) or call duplicate(true) before you write into it.`,
    map:`Godot Resource with class_name is Unity ScriptableObject with [CreateAssetMenu], and a .tres is the .asset file.` },
  unity:{ term:`The hypothesis is a ScriptableObject asset sitting next to the prototype scene. [TextArea] holds the claim, fields hold the signal name, the target rate and the kill criterion, and the prototype writes its counts back into the asset.`,
    api:['ScriptableObject + [CreateAssetMenu]','[TextArea] / [SerializeField]','AssetDatabase.LoadAssetAtPath<T>()','EditorUtility.SetDirty()','Application.persistentDataPath','Debug.Log'],
    snippet:`[CreateAssetMenu(menuName = "Design/Hypothesis")]
public class Hypothesis : ScriptableObject {
    [TextArea] public string claim =
        "Players will switch weapon by enemy type";
    public string signalEvent = "weapon_switch";   // what a session must show
    public float targetRate = 0.6f;                // kill the idea below this
    [SerializeField] int seen, sessions;

    public void Observe(bool fired) {
        sessions++;
        if (fired) seen++;
    }
    public float Rate => sessions == 0 ? 0f : (float)seen / sessions;
    public string Verdict => Rate >= targetRate ? "KEEP" : "KILL";
}`,
    pitfall:`A ScriptableObject keeps what you write into it in the Editor and throws it away in a player. The build deserializes the asset as it shipped, so the counters read correctly on your machine and come back empty from the testers. Keep the asset as the question and write the answers to persistentDataPath, which exists in both.`,
    map:`Unity ScriptableObject is Godot Resource, an .asset file is a .tres, and [TextArea] is @export_multiline.` } });

ENGINE('playtesting',{
  godot:{ term:`The build does the observing you cannot. One autoload opens a file under user:// on start, stamps every input, decision, death and quit with milliseconds since session start, and flushes after each line so a crash still leaves evidence.`,
    api:['Autoload singleton (Project Settings > Autoload)','FileAccess.open("user://…", WRITE) / store_line() / flush()','Time.get_ticks_msec() / Time.get_unix_time_from_system()','Node._unhandled_input(event)','get_viewport().get_texture().get_image().save_png()','OS.get_user_data_dir()'],
    snippet:`extends Node                       # autoload "TestLog"
var _f: FileAccess
var _t0 := 0

func _ready() -> void:
\tvar path := "user://session_%d.csv" % Time.get_unix_time_from_system()
\t_f = FileAccess.open(path, FileAccess.WRITE)
\t_f.store_line("ms,kind,detail")
\t_t0 = Time.get_ticks_msec()

func note(kind: String, detail := "") -> void:
\t_f.store_line("%d,%s,%s" % [Time.get_ticks_msec() - _t0, kind, detail])
\t_f.flush()                       # a crashed session is still evidence`,
    pitfall:`Writing the log to res://. In the editor res:// is a folder on disk and it works perfectly, but in an exported build res:// is a read-only pack, so the first real playtest produces no file at all and you find out after the testers have gone home. Everything a build writes goes to user://.`,
    map:`Godot user:// is Unity Application.persistentDataPath, an autoload is a DontDestroyOnLoad singleton, and _unhandled_input is what the UI did not consume.` },
  unity:{ term:`A recorder started from the bootstrap scene and kept with DontDestroyOnLoad. It stamps gameplay events with unscaled time, appends them under Application.persistentDataPath, and flushes on pause so a backgrounded mobile session is not lost.`,
    api:['Application.persistentDataPath','Time.realtimeSinceStartup / Time.unscaledTime','DontDestroyOnLoad()','OnApplicationPause(bool)','ScreenCapture.CaptureScreenshot()','Application.logMessageReceived'],
    snippet:`public class TestLog : MonoBehaviour {
    static StreamWriter f;
    static float t0;
    void Awake() {
        DontDestroyOnLoad(gameObject);
        f = new StreamWriter(Application.persistentDataPath + "/session.csv", true);
        t0 = Time.realtimeSinceStartup;          // never Time.time: timeScale lies
        f.WriteLine("s,kind,detail");
    }
    public static void Note(string kind, string detail = "") {
        f.WriteLine($"{Time.realtimeSinceStartup - t0:F3},{kind},{detail}");
        f.Flush();                               // a crashed session is still evidence
    }
    void OnApplicationPause(bool paused) { if (paused) f.Flush(); }
}`,
    pitfall:`Stamping the log with Time.time. Time.time is scaled by Time.timeScale, so every pause, menu and hit stop shifts the timeline, and the hesitation you are trying to locate lands somewhere else in the file than on the recording. Use Time.realtimeSinceStartup or Time.unscaledTime for anything you will line up against video.`,
    map:`Unity Application.persistentDataPath is Godot user://, DontDestroyOnLoad is an autoload, and Time.unscaledTime is Time.get_ticks_msec().` } });

ENGINE('iteration-and-evidence',{
  godot:{ term:`Attribution means this build differs from the last one by one value. Keep the tuning in a .tres so the diff is one line of text, and keep a GUT or GdUnit4 suite over the rules so a change meant to move one signal cannot quietly move three.`,
    api:['GUT or GdUnit4 test suite','assert_lt() / assert_between() / assert_almost_eq()','godot --headless -s addons/gut/gut_cmdln.gd -gdir=res://test','preload() of a .tres tuning resource','ResourceSaver.save()','Remote scene tree (editor Debugger)'],
    snippet:`extends GutTest                    # res://test/test_economy.gd

var t := preload("res://data/economy.tres")

func test_one_kill_never_funds_an_upgrade() -> void:
\tassert_lt(t.gold_per_kill, t.upgrade_cost,
\t\t"one kill must not buy an upgrade")

func test_time_to_kill_stays_in_band() -> void:
\tvar ttk := t.enemy_hp / t.dps
\tassert_between(ttk, 2.0, 4.0, "time to kill left the tested band")`,
    pitfall:`Tuning by dragging values in the editor's Remote scene tree while the game runs. Those writes exist in the running process only, so the version that felt right is gone when you press stop and the next build still has the old numbers. Change the .tres, run again, and let the text diff record exactly what you tested.`,
    map:`Godot GUT and GdUnit4 are the Unity Test Framework, a .tres is a ScriptableObject asset, and --headless -s is -batchmode -executeMethod.` },
  unity:{ term:`The one change under test lives on one asset, and everything else is pinned by EditMode tests in their own test assembly. The tuning is a ScriptableObject referenced everywhere, so there is exactly one place the number can be.`,
    api:['Unity Test Framework: [Test] / [SetUp]','Assert.Less / Is.InRange','Assembly Definition with Test Assemblies enabled','AssetDatabase.LoadAssetAtPath<T>()','PrefabUtility.ApplyPrefabInstance()','unity -batchmode -runTests -testPlatform EditMode'],
    snippet:`public class EconomyRules {                 // Tests/EditMode/EconomyRules.cs
    EconomyTuning t;

    [SetUp] public void Load() =>
        t = AssetDatabase.LoadAssetAtPath<EconomyTuning>("Assets/Data/Economy.asset");

    [Test] public void OneKillNeverFundsAnUpgrade() =>
        Assert.Less(t.goldPerKill, t.upgradeCost);

    [Test] public void TimeToKillStaysInBand() {
        float ttk = t.enemyHp / t.dps;
        Assert.That(ttk, Is.InRange(2f, 4f), "time to kill left the tested band");
    }
}`,
    pitfall:`Tuning the number on the scene instance instead of the prefab. Unity stores that as a per-instance override, so the value you tested exists in one scene and every other spawner still uses the prefab default. The next session measures a mixture and the result cannot be attributed to anything. Apply to the prefab, or move the number onto a ScriptableObject that nothing can override.`,
    map:`Unity EditMode tests are a GUT or GdUnit4 headless run, an .asset tuning object is a .tres, and a prefab override is a value the .tscn saved over the script default.` } });

ENGINE('vertical-slice-mvp',{
  godot:{ term:`The slice is an export preset, not a branch. export_presets.cfg names the target, the resource filters decide what is packed, and a custom feature tag lets the same code skip the systems that are deliberately not in this build.`,
    api:['export_presets.cfg + custom feature tags','OS.has_feature("slice")','godot --headless --export-release "<preset>" build/slice.exe','Export filters: include and exclude paths','ProjectSettings.get_setting("application/config/version")','ResourceLoader.exists()'],
    snippet:`extends Node                       # slice bootstrap

func _ready() -> void:
\tvar version: String = ProjectSettings.get_setting("application/config/version")
\tif OS.has_feature("slice"):    # tag declared on the slice export preset
\t\t$Meta/Progression.queue_free()
\t\t$HUD.set_build_label("slice %s" % version)

# one command, the same one the build runner uses:
# godot --headless --export-release "Slice Win64" build/slice.exe`,
    pitfall:`A feature tag hides a system, it does not remove it. The export still packs every resource the filters let through, so the cut content ships inside the slice, inflates the download and is still reachable by anything that loads it by path. If it is cut, exclude it in the preset's filters and let the missing resource fail loudly.`,
    map:`Godot export presets and feature tags are Unity Build Profiles and scripting define symbols, and --export-release is a BuildPipeline call behind -executeMethod.` },
  unity:{ term:`The slice is a build script with its own scene list and its own scripting defines. Scenes In Build decides what exists, a define decides what compiles, and the BuildReport is where the cost-per-unit number actually comes from.`,
    api:['BuildPlayerOptions / BuildPipeline.BuildPlayer()','BuildReport.summary.result / totalSize / totalTime','extraScriptingDefines / #if SLICE_BUILD','EditorBuildSettings.scenes','Application.version','EditorApplication.Exit()'],
    snippet:`public static class SliceBuild {           // Assets/Editor/SliceBuild.cs
    [MenuItem("Build/Slice")]
    public static void Run() {
        var opts = new BuildPlayerOptions {
            scenes = new[] { "Assets/Scenes/Slice.unity" },   // the slice, nothing else
            locationPathName = "build/slice.exe",
            target = BuildTarget.StandaloneWindows64,
            extraScriptingDefines = new[] { "SLICE_BUILD" }
        };
        BuildReport r = BuildPipeline.BuildPlayer(opts);
        Debug.Log($"{r.summary.result} {r.summary.totalSize} bytes {r.summary.totalTime}");
        if (r.summary.result != BuildResult.Succeeded) EditorApplication.Exit(1);
    }
}`,
    pitfall:`Reading cost per unit out of the Editor. Play mode runs Mono with nothing stripped and every asset already imported, so the memory, load time and build time you quote are not the slice's numbers. Build the slice once with the backend you will ship and read BuildReport.summary and the packed-asset list, because the whole scope plan gets built on that figure.`,
    map:`Unity Scenes In Build plus scripting defines are Godot's export filters plus feature tags, and BuildReport is what --export-release produces.` } });

ENGINE('risk-and-dependencies',{
  godot:{ term:`The engine risks are the ones the editor hides: whether the addon you built the design on exists on your target platform, and what the frame costs at the worst-case count. Both are answered by a headless stress run and an early export, not by playing in the editor.`,
    api:['godot --headless --fixed-fps 60 -s res://test/stress.gd','SceneTree._initialize() / _process()','Performance.get_monitor(Performance.TIME_PROCESS)','Engine.get_process_frames()','GDExtension binaries per platform and architecture','OS.get_name() / OS.has_feature()'],
    snippet:`extends SceneTree                  # godot --headless -s res://test/stress.gd

func _initialize() -> void:
\tvar horde := preload("res://enemy/grunt.tscn")
\tfor i in 200:                  # the count the design needs, not the demo count
\t\troot.add_child(horde.instantiate())

func _process(_delta: float) -> bool:
\tprint("process %.2f ms  physics %.2f ms" % [
\t\tPerformance.get_monitor(Performance.TIME_PROCESS) * 1000.0,
\t\tPerformance.get_monitor(Performance.TIME_PHYSICS_PROCESS) * 1000.0])
\treturn Engine.get_process_frames() > 600    # quit after ten seconds`,
    pitfall:`Building the behaviour layer on a GDExtension addon before exporting to every target once. A GDExtension ships as a compiled binary per platform and architecture, so an addon with no build for your console or mobile target means the system the whole AI sits on does not exist there, and the first platform export is where you learn it. Export a hello-world to every target in week one.`,
    map:`Godot --headless -s on a SceneTree script is Unity -batchmode -executeMethod, and Performance.get_monitor is a ProfilerRecorder.` },
  unity:{ term:`The risk that bites late is the scripting backend. The Editor runs Mono with a JIT, the shipped player usually runs IL2CPP ahead of time with managed stripping, and code that needs runtime code generation compiles, plays, and throws on device.`,
    api:['PlayerSettings scripting backend: Mono / IL2CPP','Managed stripping level + link.xml','[Preserve] attribute','ProfilerRecorder / ProfilerCategory','Development Build + Autoconnect Profiler','unity -batchmode -nographics -executeMethod'],
    snippet:`public class HordeStress : MonoBehaviour {   // run as a Development Build on device
    [SerializeField] GameObject grunt;
    [SerializeField] int count = 200;        // the count the design needs
    ProfilerRecorder mainThread;

    void Start() {
        for (int i = 0; i < count; i++)
            Instantiate(grunt, Random.insideUnitSphere * 30f, Quaternion.identity);
        mainThread = ProfilerRecorder.StartNew(ProfilerCategory.Internal, "Main Thread", 15);
    }
    void Update() {
        if (Time.frameCount % 60 == 0)
            Debug.Log($"main thread {mainThread.LastValue / 1e6f:F2} ms at {count}");
    }
}`,
    pitfall:`Proving the risky system in the Editor and assuming the player behaves the same. IL2CPP compiles ahead of time, so reflection, dynamically constructed generics and anything the managed stripper cannot see through fail only in the built player, usually on the device that arrived last. Build to the real target with the real backend in week one and keep a runner doing it.`,
    map:`Unity IL2CPP and managed stripping are Godot's export templates and per-platform GDExtension binaries, and ProfilerRecorder is Performance.get_monitor.` } });

ENGINE('polish-when',{
  godot:{ term:`Legibility is code, emphasis is a Tween. The rule resolves and the sound plays on the frame of the input, then create_tween() layers the squash, the camera nudge and the particles on top, where they can be added late and deleted just as fast.`,
    api:['create_tween() / Tween.tween_property()','Tween.set_trans() / set_ease() / kill()','AnimationPlayer with call method tracks','Camera2D.offset / GPUParticles2D.emitting','AudioStreamPlayer.play()','Engine.time_scale'],
    snippet:`var _hit: Tween

func on_hit(dir: Vector2) -> void:
\t_apply_damage()                # legibility: the rule resolves first
\t$Hit.play()                    # and the sound is on this frame, not later
\tif _hit and _hit.is_running():
\t\t_hit.kill()                # never stack two flourishes
\t_hit = create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
\t_hit.tween_property($Sprite, "scale", Vector2(1.25, 0.8), 0.06)
\t_hit.tween_property($Sprite, "scale", Vector2.ONE, 0.12)
\t$Camera2D.offset = dir * 6.0
\tcreate_tween().tween_property($Camera2D, "offset", Vector2.ZERO, 0.15)`,
    pitfall:`Calling create_tween() on every hit without killing the last one. Tweens stack, each still writing the same property, and the sprite jitters or never returns to scale. Keep the reference and kill it before starting the next. A tween is bound to its node, so a flourish on an enemy that gets freed mid-animation simply stops, which is what you want and not what you expect.`,
    map:`Godot create_tween() is a coroutine driving an AnimationCurve in Unity, AnimationPlayer is the Animator, and Engine.time_scale is Time.timeScale.` },
  unity:{ term:`Split the response from the flourish. The state change, the sound and the hit flash happen in code on the input frame. The Animator plays the emphasis on top. Anything sitting behind a transition with Has Exit Time is emphasis by definition.`,
    api:['Animator.CrossFade() / SetTrigger()','Has Exit Time / Interruption Source on a transition','AnimationCurve.Evaluate()','CinemachineImpulseSource.GenerateImpulseWithVelocity()','AudioSource.PlayOneShot() / ParticleSystem.Play()','Time.unscaledDeltaTime'],
    snippet:`[SerializeField] AnimationCurve punch;       // 1 -> 1.25 -> 1 over 0.18s
[SerializeField] CinemachineImpulseSource shake;

public void OnHit(Vector3 dir) {
    ApplyDamage();                          // legibility: the rule resolves first
    audio.PlayOneShot(hitClip);             // frame 1, not on an animation event
    shake.GenerateImpulseWithVelocity(dir * 0.4f);
    StartCoroutine(Punch());
}
IEnumerator Punch() {
    for (float t = 0; t < 0.18f; t += Time.unscaledDeltaTime) {
        sprite.localScale = Vector3.one * punch.Evaluate(t / 0.18f);
        yield return null;                  // unscaled so hit stop cannot freeze it
    }
}`,
    pitfall:`Putting the player-facing response inside an Animator state whose transition has Has Exit Time ticked. The transition waits for the current clip to finish, so the reaction lands tens of milliseconds after the input and the game reads as unresponsive in exactly the place you spent the polish budget. Drive the response from code, keep Exit Time for the flourish, and set an Interruption Source so a second input can cut the first.`,
    map:`Unity's Animator is Godot's AnimationPlayer and AnimationTree, an AnimationCurve is a Curve resource, and a Cinemachine impulse is a tween on Camera2D.offset.` } });

/* ---------------- AI COLLABORATION ---------------- */

ENGINE('bottleneck-shift',{
  godot:{ term:`The engine's part of the shift is a quarantine. Generated scripts and scenes land in one folder that Godot is told to skip, and moving a file out of that folder is the physical act of a human accepting it.`,
    api:['.gdignore (Godot skips the folder entirely)','class_name (registers a global type on save)','EditorScript._run()','DirAccess.get_files_at()','FileAccess.get_file_as_string()','push_warning()'],
    snippet:`@tool
extends EditorScript               # File > Run in the script editor

func _run() -> void:
\tvar files := DirAccess.get_files_at("res://generated")
\tvar claiming := 0
\tfor f in files:
\t\tif not f.ends_with(".gd"):
\t\t\tcontinue
\t\tif FileAccess.get_file_as_string("res://generated/" + f).contains("class_name"):
\t\t\tclaiming += 1
\t\t\tpush_warning("unjudged script claims a global type: " + f)
\tprint("%d generated files, %d already in the project API" % [files.size(), claiming])`,
    pitfall:`A generated script with class_name is part of the project the moment it is saved. The type registers globally, autocompletes everywhere, and someone starts referencing it before a human has judged whether it should exist. Keep unjudged output in a folder holding a .gdignore file, which makes Godot skip it entirely, and make the move out of that folder the decision.`,
    map:`Godot's .gdignore folder is Unity's Assembly Definition boundary, and class_name is a public type in an auto-referenced assembly.` },
  unity:{ term:`Every generated .cs dropped into Assets recompiles the project and reloads the domain, and everything under Assets is in the default assembly. The boundary is an Assembly Definition with Auto Referenced off, so generated code cannot be called until someone references it on purpose.`,
    api:['Assembly Definition (.asmdef) / Auto Referenced','AssemblyReloadEvents.beforeAssemblyReload','SessionState.SetFloat / GetFloat','AssetDatabase.FindAssets("t:MonoScript", paths)','EditorApplication.timeSinceStartup','[InitializeOnLoad]'],
    snippet:`[InitializeOnLoad]
public static class ReloadCost {                 // Assets/Editor/ReloadCost.cs
    static ReloadCost() {
        AssemblyReloadEvents.beforeAssemblyReload += () =>
            SessionState.SetFloat("start", (float)EditorApplication.timeSinceStartup);
        AssemblyReloadEvents.afterAssemblyReload += () => {
            float seconds = (float)EditorApplication.timeSinceStartup
                            - SessionState.GetFloat("start", 0f);
            int generated = AssetDatabase.FindAssets(
                "t:MonoScript", new[] { "Assets/Generated" }).Length;
            Debug.Log($"domain reload {seconds:F1}s with {generated} generated scripts");
        };
    }
}`,
    pitfall:`Producing more code has a price the team pays all day and nobody measures. Every generated script recompiles the assembly and reloads the domain, which is the pause between pressing Play and playing, and everything under Assets ships unless an asmdef or a platform filter excludes it. Fence generated work in its own assembly with Auto Referenced off, and watch the reload number.`,
    map:`Unity's asmdef boundary is Godot's .gdignore folder, and a domain reload is Godot reparsing scripts when the editor regains focus.` } });

ENGINE('ai-roles',{
  godot:{ term:`The role decides where the output is allowed to run. Tool roles are @tool scripts, EditorScripts or an addon under addons/, content-generator output is .tres resources, and only the prototype-engineer role produces code the player runs.`,
    api:['@tool annotation','Engine.is_editor_hint()','EditorScript._run()','EditorPlugin + addons/<name>/plugin.cfg','ResourceSaver.save()','@export with a setter'],
    snippet:`@tool
extends Node                       # content-generator role, editor only

@export var count := 24
@export var generate := false:
\tset(value):
\t\tif value and Engine.is_editor_hint():
\t\t\t_generate()            # runtime must never regenerate content

func _generate() -> void:
\tfor i in count:
\t\tvar v := VariantSpec.new()
\t\tv.seed_value = i
\t\tResourceSaver.save(v, "res://content/variant_%02d.tres" % i)`,
    pitfall:`A @tool script runs inside the editor. Generated code with side effects in _ready() or in a property setter executes against your project the moment somebody opens that scene, and a ResourceSaver call on that path overwrites real assets with no undo step. Guard every write with Engine.is_editor_hint() and an explicit trigger, and read a generated @tool script before you open its scene.`,
    map:`Godot @tool is Unity [ExecuteAlways], EditorScript._run() is a [MenuItem] method, and addons/ is the Editor/ folder.` },
  unity:{ term:`The role decides the assembly. Tool roles live in an Editor/ folder and never ship, content-generator output is ScriptableObject assets created through AssetDatabase, and runtime MonoBehaviours are the only thing the prototype-engineer role hands over.`,
    api:['[MenuItem] inside an Editor/ folder','ScriptableObject.CreateInstance<T>()','AssetDatabase.CreateAsset() / SaveAssets()','EditorUtility.DisplayDialog()','Undo.RecordObject()','[InitializeOnLoad] / [ExecuteAlways]'],
    snippet:`public static class VariantGen {                 // Assets/Editor/VariantGen.cs
    [MenuItem("Design/Generate variants")]
    static void Run() {
        if (!EditorUtility.DisplayDialog("Generate",
                "Overwrite 24 variant assets?", "Generate", "Cancel")) return;
        for (int i = 0; i < 24; i++) {
            var v = ScriptableObject.CreateInstance<VariantSpec>();
            v.seedValue = i;
            AssetDatabase.CreateAsset(v, $"Assets/Content/Variant_{i:00}.asset");
        }
        AssetDatabase.SaveAssets();
    }
}`,
    pitfall:`[InitializeOnLoad] and [InitializeOnLoadMethod] run on every domain reload with nobody invoking them. A generated editor tool that writes assets from a static constructor has already rewritten your content by the time you finish reading the file. Keep generated tools behind an explicit [MenuItem] with a confirmation, and treat a static constructor in Editor/ code as the first thing to review.`,
    map:`Unity's Editor/ folder is Godot's addons/ and @tool scripts, and [MenuItem] is EditorScript._run().` } });

ENGINE('prompting-framework',{
  godot:{ term:`The CONTEXT term has an engine half, and it is short: the major version, the node type the script extends, whether the work happens in _process or _physics_process, the input action names, and the renderer. Leave any of it out and the answer is for a different engine.`,
    api:['Engine.get_version_info()','ProjectSettings.get_setting("rendering/renderer/rendering_method")','ProjectSettings.get_setting("physics/common/physics_ticks_per_second")','InputMap.get_actions()','extends <NodeType>','_process(delta) vs _physics_process(delta)'],
    snippet:`extends SceneTree                  # godot --headless -s res://tools/context.gd

func _initialize() -> void:
\tvar v := Engine.get_version_info()
\tprint("engine: Godot %d.%d.%d" % [v.major, v.minor, v.patch])
\tprint("renderer: ", ProjectSettings.get_setting(
\t\t"rendering/renderer/rendering_method"))
\tprint("physics tick: ", ProjectSettings.get_setting(
\t\t"physics/common/physics_ticks_per_second"))
\tprint("input actions: ", InputMap.get_actions())
\tquit()`,
    pitfall:`Not stating the major version. Godot 3 and Godot 4 differ exactly where generated code lives, so you get KinematicBody2D, export var, onready and yield back, and none of it parses in a 4.x project. There is far more Godot 3 code in the world than Godot 4 code, so the default answer is the old one. Paste the version, the renderer and the node you extend into every prompt.`,
    map:`Godot's rendering method and physics tick settings are Unity's render pipeline asset and Fixed Timestep, and the input map is an Input Actions asset.` },
  unity:{ term:`Four facts decide whether the answer runs at all: the Unity version, the render pipeline, the input backend, and the assembly the script will live in. Keep them in a clipboard snippet so the context term is never guessed.`,
    api:['Application.unityVersion','GraphicsSettings.currentRenderPipeline','#if ENABLE_INPUT_SYSTEM','Time.fixedDeltaTime (Project Settings > Time)','EditorGUIUtility.systemCopyBuffer','Assembly Definition the script belongs to'],
    snippet:`public static class PromptContext {              // Assets/Editor/PromptContext.cs
    [MenuItem("Design/Copy engine context")]
    static void Copy() {
        var rp = GraphicsSettings.currentRenderPipeline;
        EditorGUIUtility.systemCopyBuffer = string.Join(", ", new[] {
            "unity " + Application.unityVersion,
            "pipeline " + (rp == null ? "Built-in" : rp.GetType().Name),
#if ENABLE_INPUT_SYSTEM
            "input: Input System package",
#else
            "input: legacy Input Manager",
#endif
            "fixed timestep " + Time.fixedDeltaTime });
    }
}`,
    pitfall:`Leaving out the render pipeline and the input backend. Built-in pipeline code sets material properties URP does not have, so everything renders magenta, and legacy Input class code throws InvalidOperationException in a project configured for the Input System package alone. Both compile cleanly, so the compiler will not warn you. Name the pipeline, the backend and the version every time.`,
    map:`Unity's render pipeline asset is Godot's rendering method setting, an Input Actions asset is the input map, and Fixed Timestep is physics_ticks_per_second.` } });

ENGINE('verifying-ai-output',{
  godot:{ term:`GDScript will happily load a script that calls a method which does not exist. Static type annotations turn most of that into a parse error, and godot --headless --check-only turns the parse into a command a build runner can fail on. Behaviour still needs a GUT or GdUnit4 test.`,
    api:['Static typing: var x: int, func f(a: float) -> void','godot --headless --check-only --script res://generated/loot.gd','GUT / GdUnit4: assert_not_null(), assert_true()','assert(condition, "why")','push_error() / push_warning()','ProjectSettings "debug/gdscript/warnings/untyped_declaration"'],
    snippet:`extends GutTest                    # res://test/test_generated_loot.gd

func test_generated_table_never_rolls_nothing() -> void:
\tvar table = preload("res://generated/loot_table.gd").new()
\tfor tier in range(1, 6):
\t\tvar drop = table.roll(tier)
\t\tassert_not_null(drop, "tier %d rolled nothing" % tier)
\t\tassert_true(drop is LootEntry, "tier %d rolled the wrong type" % tier)

func test_weights_sum_to_one() -> void:
\tvar table = preload("res://generated/loot_table.gd").new()
\tassert_almost_eq(table.total_weight(), 1.0, 0.001)`,
    pitfall:`GDScript is dynamically typed by default, so a generated script with a misspelled method name parses, loads, and fails only the first time that branch runs, which is usually in front of a tester. Switch the untyped-declaration warning on, require static annotations in generated code, and run --check-only on every generated file before anyone plays it.`,
    map:`Godot --check-only plus GUT is Unity's compiler plus the Test Framework, and push_error is Debug.LogError.` },
  unity:{ term:`Compiling is not verification. What the compiler cannot see is the wiring, so the check that counts is a PlayMode test that builds the object the code expects, runs a frame, and fails on any unexpected log line.`,
    api:['[UnityTest] / [Test] in a test assembly','Assert.IsNotNull / Assert.That','LogAssert.NoUnexpectedReceived()','new GameObject(name, typeof(T))','yield return null (let Awake and Start run)','unity -batchmode -runTests -testPlatform PlayMode'],
    snippet:`public class GeneratedLootTests {                // Tests/PlayMode/GeneratedLootTests.cs
    [UnityTest] public IEnumerator TableNeverRollsNothing() {
        var go = new GameObject("loot", typeof(LootTable));
        var table = go.GetComponent<LootTable>();
        yield return null;                       // let Awake and Start run
        for (int tier = 1; tier <= 5; tier++)
            Assert.IsNotNull(table.Roll(tier), $"tier {tier} rolled nothing");
        LogAssert.NoUnexpectedReceived();        // a swallowed exception is a failure
    }
}`,
    pitfall:`Reading "it compiles" as "it works". Generated code resolves its dependencies with GetComponent or GameObject.Find in Start, against a scene nobody showed the model, so the first null shows up at runtime in a scene you did not open. A NullReferenceException in Unity kills one callback and lets the frame continue, so it can hide for days. Assert the wiring in a PlayMode test and fail on unexpected logs.`,
    map:`Unity's compiler plus the Test Framework is Godot's --check-only plus GUT, and LogAssert is a push_error the test can fail on.` } });

ENGINE('ai-failure-modes',{
  godot:{ term:`Content spam is a number here, not a feeling. A Godot export preset packs every resource in the project by default, so generated files that nothing references are still download size. A headless audit that walks res:// and compares it with what the scenes actually reference is the detector.`,
    api:['Export preset Export Mode: all resources vs selected scenes','DirAccess.get_files_at()','ResourceLoader.get_dependencies()','String.get_slice()','godot --headless -s res://tools/audit.gd','push_warning()'],
    snippet:`extends SceneTree                  # godot --headless -s res://tools/audit.gd

func _initialize() -> void:
\tvar reachable := {}
\tfor scene in DirAccess.get_files_at("res://levels"):
\t\tfor dep in ResourceLoader.get_dependencies("res://levels/" + scene):
\t\t\treachable[dep.get_slice("::", 2)] = true
\tvar orphans := 0
\tfor f in DirAccess.get_files_at("res://content"):
\t\tif not reachable.has("res://content/" + f):
\t\t\torphans += 1
\tprint("%d generated files no level references, all of them still exported" % orphans)
\tquit()`,
    pitfall:`The default export mode packs the whole project, not the dependency graph. A thousand generated .tres files that nothing loads still ship, still cost install size, and never appear as a code problem or a compile warning. Switch the preset to selected scenes with explicit filters, or run the orphan count on a cadence, because content spam is invisible until someone looks at the package.`,
    map:`Godot's export-all default is Unity's Resources folder rule applied to the whole project, and ResourceLoader.get_dependencies is AssetDatabase.GetDependencies.` },
  unity:{ term:`Unity has the opposite default: only what a build scene, a Resources folder or an Addressables group reaches gets built. So generated spam costs import time and domain reloads rather than install size, and the exception is anything sitting in a Resources folder.`,
    api:['AssetDatabase.FindAssets() / GetDependencies()','EditorBuildSettings.scenes','Resources folders (everything inside ships)','Addressables groups and analyze rules','BuildReport.packedAssets','Debug.Log'],
    snippet:`public static class SpamAudit {                  // Assets/Editor/SpamAudit.cs
    [MenuItem("Design/Audit generated content")]
    static void Run() {
        var all = AssetDatabase.FindAssets("t:ScriptableObject", new[] { "Assets/Content" });
        var used = new HashSet<string>();
        foreach (var s in EditorBuildSettings.scenes)
            used.UnionWith(AssetDatabase.GetDependencies(s.path, true));
        int orphans = all.Count(g => !used.Contains(AssetDatabase.GUIDToAssetPath(g)));
        int inResources = all.Count(g =>
            AssetDatabase.GUIDToAssetPath(g).Contains("/Resources/"));
        Debug.Log($"{all.Length} generated, {orphans} unreachable, {inResources} in Resources");
    }
}`,
    pitfall:`A Resources folder ships everything inside it and is loaded by string at runtime, so no dependency scan can see the link. Generated content dropped there ships in full and is invisible to every orphan audit you write, while also lengthening every build. Keep generated assets out of Resources and reference them directly or through Addressables, so unused content is provably absent.`,
    map:`Unity's build-what-is-referenced rule is Godot's selected-scenes export mode, and a Resources folder is Godot's export-all default applied to one directory.` } });

ENGINE('responsibility-matrix',{
  godot:{ term:`Two places carry the decisions embedded in generated work: the @export defaults the script chose, and anything it writes into ProjectSettings. The first is reviewable in a diff. The second must simply be off limits to code.`,
    api:['@export defaults vs values stored in the .tscn','ProjectSettings.set_setting() / ProjectSettings.save()','project.godot (text, in version control)','assert(condition, "why")','Engine.is_editor_hint()','@export_group'],
    snippet:`extends CharacterBody2D
# AI-primary: the movement code below. Human-primary: every number.

@export var move_speed := 320.0    # chosen 03-11, playtest 14
@export var dash_cost := 25.0      # chosen 03-11, playtest 14
@export var i_frames := 0.0        # OPEN: nobody has decided this yet

func _ready() -> void:
\t# never from code. Physics tick is a project-wide design decision:
\t# ProjectSettings.set_setting("physics/common/physics_ticks_per_second", 30)
\tassert(i_frames > 0.0, "i_frames is still an unowned generated default")`,
    pitfall:`A generated @tool script that calls ProjectSettings.set_setting() rewrites project.godot for the whole team. Physics tick rate, input map entries and the renderer are project-wide decisions, and a script can change them between two pulls with no review. Keep settings writes out of code entirely and read the project.godot diff like any other design change.`,
    map:`Godot @export defaults are Unity [SerializeField] defaults, and project.godot is Unity's ProjectSettings folder.` },
  unity:{ term:`Unity serializes by field name, so the human's tuning only survives as long as the names the generated script picked. The matrix has a mechanical consequence: a rename in AI-owned code destroys human-owned values unless it is declared.`,
    api:['[SerializeField] private fields','[FormerlySerializedAs("oldName")]','OnValidate()','PrefabUtility.GetPropertyModifications()','[Tooltip] / [Header]','Debug.LogWarning(message, context)'],
    snippet:`public class DashMove : MonoBehaviour {
    // AI-primary: the movement code below. Human-primary: every number.
    [SerializeField] float moveSpeed = 6f;           // chosen 03-11, playtest 14
    [FormerlySerializedAs("dashCostStamina")]        // renamed, tuning preserved
    [SerializeField] float dashCost = 25f;           // chosen 03-11, playtest 14
    [SerializeField] float iFrames;                  // OPEN: nobody decided this

    void OnValidate() {
        if (iFrames <= 0f)
            Debug.LogWarning($"{name}: iFrames is an unowned generated default", this);
    }
}`,
    pitfall:`Regenerating a script and letting it rename or retype a serialized field drops every value a designer tuned, on every prefab and every scene, with no error anywhere. The balance pass silently reverts to the generated defaults. Put [FormerlySerializedAs] on any rename, and diff a prefab's YAML after a regeneration instead of trusting what the Inspector shows.`,
    map:`Unity's name-based serialization is Godot's .tscn storing @export values by property name, and Godot has no [FormerlySerializedAs], so a rename there costs the value outright.` } });

ENGINE('ai-for-implementation',{
  godot:{ term:`A prototype that is easy to delete is one that owns nothing. One folder, one scene, the knobs as @export_range on the root, one signal the harness listens to, and no entry in Project Settings.`,
    api:['@export_group / @export_range','signal / emit()','Engine.time_scale','Node._physics_process(delta)','Project Settings > Autoload (what not to add to)','preload() vs load()'],
    snippet:`extends Node2D                     # res://proto/economy/economy.tscn
signal logged(event: String, value: float)     # the only way data leaves

@export_group("Under test")
@export_range(0.0, 5.0) var gold_per_kill := 1.0
@export_range(1.0, 60.0) var upgrade_cost := 12.0
@export_range(0.1, 8.0) var sim_speed := 1.0
var _gold := 0.0

func on_kill() -> void:
\t_gold += gold_per_kill
\tEngine.time_scale = sim_speed
\tlogged.emit("gold", _gold)
\tif _gold >= upgrade_cost:
\t\tlogged.emit("upgrade", _gold)`,
    pitfall:`Letting the prototype become an autoload. A generated manager registered in Project Settings > Autoload is loaded into every scene in the project, and within a week three real systems call into it. The disposable build is now load-bearing and throwing it away has become a refactor. Keep a prototype inside its own scene and its own folder, owning nothing global.`,
    map:`Godot autoloads are Unity's DontDestroyOnLoad singletons, a signal is a UnityEvent, and Engine.time_scale is Time.timeScale.` },
  unity:{ term:`The instrumented build still has to be fast enough that its own numbers mean something. Knobs go on a ScriptableObject, one UnityEvent carries the logged moments, and the logging path stays out of Update.`,
    api:['[SerializeField] ScriptableObject config','UnityEvent<string, float>','StringBuilder','Time.timeScale','Application.SetStackTraceLogType()','Profiler.BeginSample() / EndSample()'],
    snippet:`public class EconomyProto : MonoBehaviour {
    [SerializeField] EconomyTuning t;                // knobs live on the asset
    public UnityEvent<string, float> Logged;         // the only way data leaves
    readonly StringBuilder line = new StringBuilder();
    float gold;

    public void OnKill() {
        gold += t.goldPerKill;
        Time.timeScale = t.simSpeed;
        line.Clear();
        line.Append("gold ").Append(gold);           // no concat in the hot path
        Logged.Invoke("gold", gold);
        if (gold >= t.upgradeCost) Logged.Invoke("upgrade", gold);
    }
}`,
    pitfall:`Instrumenting with string concatenation and Debug.Log inside Update. Every call allocates a string, captures a stack trace and writes to the player log, so a prototype built to measure timing is mostly measuring its own logging. Buffer with a StringBuilder, log on events instead of per frame, and call Application.SetStackTraceLogType to drop stack traces for Log.`,
    map:`Unity's UnityEvent is a Godot signal, a ScriptableObject config asset is a .tres, and Time.timeScale is Engine.time_scale.` } });

ENGINE('ai-for-playtest-analysis',{
  godot:{ term:`The analysis is only as good as the line format. Emit one JSON object per line, carry the hypothesis id on every record so a batch of sessions can be mixed, and flatten engine types to plain numbers while you still know what they meant.`,
    api:['JSON.stringify() / JSON.parse_string()','FileAccess.store_line()','Dictionary.merge()','snappedf()','Time.get_ticks_msec()','user:// path'],
    snippet:`func emit(kind: String, where: Vector2, extra := {}) -> void:
\tvar rec := {
\t\t"h": hypothesis_id,        # every line carries the question it answers
\t\t"t": Time.get_ticks_msec(),
\t\t"kind": kind,
\t\t"x": snappedf(where.x, 0.1),   # plain floats, never a Vector2
\t\t"y": snappedf(where.y, 0.1),
\t}
\trec.merge(extra)
\t_f.store_line(JSON.stringify(rec))
\t_f.flush()`,
    pitfall:`Passing engine types straight to JSON.stringify. Godot's JSON knows only JSON types, so a Vector2 arrives as a string like "(3, 4)" and an Object arrives as null, and every downstream parse has to guess what it was holding. Flatten to named floats inside the game, where the units are still known, and keep one field per quantity.`,
    map:`Godot JSON.stringify is Unity JsonUtility.ToJson, with the same class of limits, and user:// is Application.persistentDataPath.` },
  unity:{ term:`One line of JSON per event, built from a flat [Serializable] struct with public fields, because the built-in serializer is narrow enough that anything structured comes out empty and says nothing about it.`,
    api:['JsonUtility.ToJson()','[Serializable] structs with public fields','StreamWriter.WriteLine()','Time.unscaledTime','Application.persistentDataPath','JsonUtility.FromJson<T>()'],
    snippet:`[Serializable] struct Record {                   // flat, public fields only
    public string h;                             // the question this line answers
    public float t;
    public string kind;
    public float x, y;
}

void Emit(string kind, Vector2 where) {
    var r = new Record { h = hypothesisId, t = Time.unscaledTime,
                         kind = kind, x = where.x, y = where.y };
    log.WriteLine(JsonUtility.ToJson(r));
    log.Flush();
}`,
    pitfall:`JsonUtility cannot serialize a Dictionary, a top-level array, an interface or a C# property, and it does not throw when asked to. It returns an empty object or silently drops the field, so a payload assembled as a Dictionary reaches the analysis pass carrying nothing. Use flat structs with public fields, and read one real emitted line before the build goes out.`,
    map:`Unity JsonUtility is Godot's JSON.stringify, and [Serializable] public fields are what @export makes serializable.` } });

ENGINE('ai-loop',{
  godot:{ term:`A cycle ends when a player touches a build, so cycle time is how fast a change reaches a running scene. reload_current_scene() plus a small set of debug keys covers most of it, as long as the reset is honest.`,
    api:['get_tree().reload_current_scene()','get_tree().change_scene_to_packed(PackedScene)','Project Settings > Autoload (state that survives a reload)','OS.is_debug_build()','Engine.time_scale','Node._unhandled_input(event)'],
    snippet:`extends Node                       # autoload "DebugKeys"

func _unhandled_input(event: InputEvent) -> void:
\tif not OS.is_debug_build():
\t\treturn
\tif event.is_action_pressed("debug_restart"):
\t\tDirector.reset()           # autoloads survive the reload, so reset them
\t\tRunLog.reset()
\t\tget_tree().reload_current_scene()
\telif event.is_action_pressed("debug_fast"):
\t\tEngine.time_scale = 4.0 if Engine.time_scale == 1.0 else 1.0`,
    pitfall:`reload_current_scene() rebuilds the scene and leaves every autoload exactly as it was. The director's tension value, the run counter and a cached player reference all carry into what the room is calling a fresh run, so cycle six is testing a state cycle one never had. Give every autoload a reset() and call it from the same place you reload.`,
    map:`Godot autoloads surviving reload_current_scene is Unity's DontDestroyOnLoad surviving LoadScene, and Engine.time_scale is Time.timeScale.` },
  unity:{ term:`Cycle time in Unity is dominated by the domain reload between an edit and Play. Enter Play Mode Options remove it, at the price of static state no longer being cleared for you, which you then have to clear yourself.`,
    api:['Enter Play Mode Options (Reload Domain / Reload Scene)','[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]','SceneManager.LoadScene()','EditorApplication.playModeStateChanged','Time.timeScale','DontDestroyOnLoad()'],
    snippet:`public static class RunState {
    public static int cycle;                   // static, so nothing resets it for you
    public static Director director;

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
    static void ResetStatics() {               // required once Reload Domain is off
        cycle = 0;
        director = null;
    }
    public static void Restart() {
        ResetStatics();
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }
}`,
    pitfall:`Turning Reload Domain off for speed and forgetting what the reload was doing. Static fields keep their values and event subscriptions stay attached across Play sessions, so the session you observe begins from a state no shipped build ever has, and the bug you chased all afternoon is gone in the player. Reset every static from a SubsystemRegistration method and confirm findings in a real build.`,
    map:`Unity's domain reload is Godot reparsing scripts, RuntimeInitializeOnLoadMethod is an autoload's _ready, and LoadScene is change_scene_to_packed.` } });

/* ---------------- END PRODUCTION AND AI ---------------- */

/* ---------------- IN-GAME AI ---------------- */

ENGINE('ingame-ai-purpose',{
  godot:{ term:`An agent is a scene, not a class. A CharacterBody3D root carries the collision and the movement, a behaviour node decides, and an AnimationPlayer owns every tell the player has to read. The intent a player narrates lives in the animation tracks.`,
    api:['CharacterBody3D / CharacterBody2D','AnimationPlayer.play() and animation_finished','Animation call method tracks','AnimationMixer.callback_mode_method','Node.add_to_group() / is_in_group()','AudioStreamPlayer3D.play()'],
    snippet:`extends CharacterBody3D              # res://enemy/lancer/lancer.tscn
signal telegraphed(kind: String)     # the tell, which is not the damage

@onready var anim: AnimationPlayer = $AnimationPlayer

func wind_up() -> void:
\tanim.play("charge_windup")       # 0.7s of pose, dust and a rising tone
\ttelegraphed.emit("charge")
\tawait anim.animation_finished    # committed: no retarget during the tell
\t_charge()

func _charge() -> void:
\tvelocity = -global_transform.basis.z * 14.0
\tmove_and_slide()`,
    pitfall:`Opening the hitbox from an animation call method track and leaving the callback mode alone. AnimationMixer.callback_mode_method defaults to deferred, so the method runs at the end of the frame rather than on the animation frame that was keyed, and the hit lands one step after the pose the player read and reacted to. Set the mode to immediate for gameplay clips, or better, keep the animation for the tell and resolve the rule in code.`,
    map:`Godot's AnimationPlayer is Unity's Animator, a call method track is an AnimationEvent, and a signal is a UnityEvent.` },
  unity:{ term:`An agent is a prefab: an Animator for the tells, a decision component, and a movement component. The Animator parameters are the contract between what the agent decided and everything the player is allowed to see.`,
    api:['Animator.SetTrigger() / ResetTrigger() / SetBool()','Animator.CrossFade()','AnimatorStateInfo.normalizedTime','StateMachineBehaviour.OnStateEnter() / OnStateExit()','UnityEvent<string>','AudioSource.PlayOneShot()'],
    snippet:`public class Lancer : MonoBehaviour {
    [SerializeField] Animator animator;
    [SerializeField] CharacterController controller;
    public UnityEvent<string> Telegraphed;   // the tell, not the damage

    public void WindUp() {
        animator.ResetTrigger("Charge");     // clear a stale request first
        animator.SetTrigger("Charge");
        Telegraphed.Invoke("charge");
    }

    public void OnWindUpEnded() {            // called from the state behaviour
        controller.Move(transform.forward * 14f * Time.deltaTime);
    }
}`,
    pitfall:`Animator.SetTrigger stays set until some transition consumes it. Set one while the agent is in a state with no outgoing Charge transition and it sits in the parameter, then fires the wind-up the moment the agent returns to idle, seconds late and pointed at nothing. The player reads a lie and calls the enemy broken. ResetTrigger before you set one, or use a bool you clear yourself.`,
    map:`Unity's Animator is Godot's AnimationPlayer and AnimationTree, an AnimationEvent is a call method track, and a UnityEvent is a signal.` } });

ENGINE('choosing-ai-technique',{
  godot:{ term:`States are Nodes and behaviour data is a Resource. A machine node forwards the physics tick to the active child state and swaps when that state asks for it. Behaviour trees come from an addon such as LimboAI, whose tasks and blackboard are also Resources a designer edits as .tres files.`,
    api:['extends Node per state, with class_name','_physics_process(delta) forwarded to the active state','Resource + @export_range for designer-editable data','LimboAI: BTPlayer, BTTask, Blackboard','Node.get_children() / Node.name for the state list','ResourceLoader.load() to swap a behaviour set'],
    snippet:`class_name StateMachine extends Node
@export var start: NodePath
var _state: Node

func _ready() -> void:
\t_enter(get_node(start))

func _physics_process(delta: float) -> void:
\tvar next: Node = _state.tick(delta)   # a state returns itself or a sibling
\tif next != _state:
\t\t_state.exit()
\t\t_enter(next)
func _enter(to: Node) -> void:
\t_state = to
\t_state.enter()`,
    pitfall:`Using AnimationTree's AnimationNodeStateMachine as the decision layer because the graph editor is already there. travel() requests a route and the animation tree resolves it on the animation update, transitions carry their own advance conditions, and the state you can read back is the one the blend reached rather than the one you asked for. Gameplay decisions become invisible inside a graph built for blending, and none of it runs headless. Keep the brain in its own nodes and let the AnimationTree follow it.`,
    map:`A Godot state node with enter, tick and exit is a StateMachineBehaviour, and LimboAI's BTPlayer is a behaviour tree graph asset.` },
  unity:{ term:`Behaviour lives in its own assets rather than in the Animator. The Behavior package gives graph assets with nodes, and a hand rolled machine is ScriptableObject states plus one runner MonoBehaviour. Either way the decision is a file a designer can open.`,
    api:['ScriptableObject states with [CreateAssetMenu]','A runner MonoBehaviour calling state.Tick(agent, dt)','com.unity.behavior: BehaviorGraphAgent and graph assets','AnimationCurve for utility response curves','[SerializeField] wiring in the Inspector','Debug.DrawLine() / OnDrawGizmosSelected() for a decision overlay'],
    snippet:`public abstract class State : ScriptableObject {
    public abstract State Tick(Agent a, float dt);   // returns self or the next
    public virtual void Enter(Agent a) { }
    public virtual void Exit(Agent a) { }
}

[CreateAssetMenu(menuName = "AI/Chase")]
public class Chase : State {
    [SerializeField] float giveUpRange = 25f;
    [SerializeField] State onLost;
    public override State Tick(Agent a, float dt) {
        a.MoveTo(a.Knowledge.LastSeen);              // no per-agent field here
        return a.DistanceTo(a.Knowledge.LastSeen) > giveUpRange ? onLost : this;
    }
}`,
    pitfall:`Caching per-agent state in a field on the ScriptableObject. A state asset is one object shared by every agent that references it, so a timer or a target stored on it is written by thirty enemies at once and the squad behaves as if it were telepathic. Worse, the last value written is serialized into the asset in the editor. Keep the asset stateless and pass the agent in, or Instantiate the asset per agent and accept the extra objects.`,
    map:`A Unity ScriptableObject state asset is a Godot Resource, and a Behavior graph asset is a LimboAI behaviour tree resource.` } });

ENGINE('perception-and-awareness',{
  godot:{ term:`Sensing is a physics query and knowledge is a separate object. A distance and cone test finds candidates, a ray through PhysicsDirectSpaceState3D confirms line of sight, and what the agent learned is written to its own memory node that the behaviour reads instead of the world.`,
    api:['get_world_3d().direct_space_state','PhysicsRayQueryParameters3D.create() with exclude and collision_mask','Area3D.get_overlapping_bodies() / body_entered','Vector3.dot() for the cone test','RayCast3D with hit_from_inside','Timer for the memory decay'],
    snippet:`func _physics_process(_delta: float) -> void:   # queries are only legal here
\tvar to: Vector3 = target.global_position - global_position
\tif to.length() > sight_range: return
\tif -global_transform.basis.z.dot(to.normalized()) < cos(deg_to_rad(55.0)):
\t\treturn
\tvar q := PhysicsRayQueryParameters3D.create(
\t\tglobal_position + Vector3.UP, target.global_position + Vector3.UP)
\tq.exclude = [get_rid()]                    # or it sees its own body first
\tq.collision_mask = 1                       # world geometry only
\tif get_world_3d().direct_space_state.intersect_ray(q).is_empty():
\t\tmemory.saw(target.global_position)     # behaviour reads memory, not target`,
    pitfall:`Calling intersect_ray from _process, from a signal callback or from a thread. The physics space is locked outside the physics step, so the query either errors about flushing queries or answers from the previous tick, and a sight test that silently answers late is what players report as an enemy seeing through a wall. Sense in _physics_process, and set exclude to the agent's own RID or the first thing every ray hits is the agent.`,
    map:`Godot's direct_space_state.intersect_ray is Unity's Physics.Linecast, and an Area3D is a trigger Collider with OnTriggerStay.` },
  unity:{ term:`Perception is a physics query plus a LayerMask. An overlap gathers candidates on the target layer, a Linecast against the occluder layer confirms sight, and the result goes into a knowledge component so behaviour never reads the player transform directly.`,
    api:['Physics.OverlapSphereNonAlloc() with a LayerMask','Physics.Linecast() with QueryTriggerInteraction.Ignore','Vector3.Angle() for the cone','Physics.queriesHitTriggers','LayerMask.GetMask()','Time.time for the memory timestamp'],
    snippet:`readonly Collider[] hits = new Collider[16];     // reused, no per-frame garbage

void Sense() {
    int n = Physics.OverlapSphereNonAlloc(transform.position, sightRange,
                                          hits, targetLayers);
    for (int i = 0; i < n; i++) {
        var to = hits[i].transform.position - transform.position;
        if (Vector3.Angle(transform.forward, to) > halfAngle) continue;
        if (Physics.Linecast(eye.position, hits[i].bounds.center, occluders,
                             QueryTriggerInteraction.Ignore)) continue;
        knowledge.Saw(hits[i].transform.position, Time.time);
    }
}`,
    pitfall:`Leaving the line of sight check on the default trigger setting. Physics.queriesHitTriggers is true, so the Linecast stops on the first trigger volume between the eye and the target: a checkpoint, a music zone, a reverb box. The guard goes blind in exactly the rooms with the most design in them and nothing in the scene looks wrong. Pass QueryTriggerInteraction.Ignore and keep occluders on their own layer.`,
    map:`Unity's LayerMask is Godot's collision_mask, OverlapSphere is Area3D.get_overlapping_bodies, and Physics.Linecast is intersect_ray.` } });

ENGINE('navigation-and-pathfinding',{
  godot:{ term:`A NavigationRegion3D bakes the walkable surface from the level geometry and every agent carries a NavigationAgent3D that turns a target_position into the next point to steer at. The search itself happens on the NavigationServer, off your frame.`,
    api:['NavigationRegion3D with a baked NavigationMesh','NavigationAgent3D.target_position / get_next_path_position()','NavigationAgent3D.set_velocity() and the velocity_computed signal','NavigationAgent3D.avoidance_enabled / radius','NavigationServer3D.map_get_closest_point()','navigation_finished and target_reached signals'],
    snippet:`@onready var nav: NavigationAgent3D = $NavigationAgent3D

func _ready() -> void:
\tnav.velocity_computed.connect(_on_safe_velocity)

func _physics_process(_delta: float) -> void:
\tif nav.is_navigation_finished(): return
\tvar next := nav.get_next_path_position()
\tnav.set_velocity((next - global_position).normalized() * speed)

func _on_safe_velocity(safe: Vector3) -> void:
\tvelocity = safe                # avoidance answered, now move
\tmove_and_slide()`,
    pitfall:`Ticking avoidance_enabled on and then writing velocity yourself anyway. With avoidance on, your wanted velocity has to go through set_velocity and come back on velocity_computed, and skipping that means the avoidance step never runs at all. Eight enemies converge on one doorway and stack into a single body while the checkbox says they are avoiding each other. The same shape of bug catches a path requested in _ready: the navigation map synchronises at the end of a physics frame, so the first query returns the agent's own position.`,
    map:`A NavigationAgent3D is Unity's NavMeshAgent, a NavigationRegion3D is a NavMeshSurface, and map_get_closest_point is NavMesh.SamplePosition.` },
  unity:{ term:`A NavMeshSurface from the AI Navigation package bakes the mesh and a NavMeshAgent both plans and moves. SetDestination starts a path and the agent writes the transform every frame, until you take that job back with updatePosition.`,
    api:['NavMeshSurface.BuildNavMesh() (com.unity.ai.navigation)','NavMeshAgent.SetDestination(), which returns a bool','NavMeshAgent.pathStatus / remainingDistance','NavMesh.SamplePosition() + NavMeshAgent.Warp()','NavMeshAgent.updatePosition / nextPosition','NavMeshObstacle carving'],
    snippet:`[SerializeField] NavMeshAgent agent;
Vector3 lastGoal;

void Start() {                                  // spawned a hair off the mesh?
    if (NavMesh.SamplePosition(transform.position, out var hit, 2f,
                               NavMesh.AllAreas))
        agent.Warp(hit.position);
}

void Repath(Vector3 goal) {
    if ((goal - lastGoal).sqrMagnitude < 1f) return;    // not every frame
    lastGoal = goal;
    if (!agent.SetDestination(goal))                    // false: no path started
        Debug.LogWarning("agent is off the navmesh", this);
}`,
    pitfall:`Ignoring what SetDestination hands back. It returns a bool, and when the agent is not on the mesh, spawned a few centimetres above the floor or standing in a hole the bake left under a prop, it returns false, logs nothing, and the agent stands still. The bug reads as stupid AI and is a bake problem. Sample and Warp on spawn, check the return, and look at pathStatus for PathPartial before blaming the behaviour tree.`,
    map:`Unity's NavMeshAgent is Godot's NavigationAgent3D, a NavMeshSurface is a NavigationRegion3D, and agent.Warp is assigning global_position with a fresh target_position.` } });

ENGINE('readable-and-fair-ai',{
  godot:{ term:`The wind-up is an AnimationPlayer clip and its length is the reaction window. The hitbox is an Area3D that stays off until the sequence opens it, so tuning fairness means editing an animation rather than a damage number.`,
    api:['AnimationPlayer.play() / animation_finished','AnimationPlayer.get_animation(name).length','Area3D.monitoring via set_deferred()','CollisionShape3D.disabled via set_deferred()','Area3D.area_entered','get_tree().create_timer().timeout'],
    snippet:`func attack() -> void:
\tanim.play("swing_windup")                  # 0.55s the player can read
\tawait anim.animation_finished
\t_hitbox.set_deferred("monitoring", true)   # never flip this inside a callback
\tanim.play("swing_strike")
\tawait get_tree().create_timer(0.12).timeout
\t_hitbox.set_deferred("monitoring", false)
\tanim.play("swing_recover")                 # committed: the punish window

func _on_hitbox_area_entered(a: Area3D) -> void:
\tif a.is_in_group("player_hurtbox"):
\t\ta.owner.take_hit(damage, global_position)`,
    pitfall:`Flipping Area3D.monitoring or CollisionShape3D.disabled straight from a physics callback or from a body_entered handler. Godot is flushing queries at that moment and refuses the change, so the hitbox that should have opened stays shut and the attack whiffs at random, which testers report as a cheap enemy rather than as a bug. Use set_deferred, and keep the active window wide enough that one frame of delay cannot decide the hit.`,
    map:`Godot's await on animation_finished is a coroutine over an Animator state, and an Area3D hitbox is a trigger Collider.` },
  unity:{ term:`The wind-up is an Animator state and its length is the window. Drive the hitbox from code against your own timing rather than from an AnimationEvent, because the window is the thing the player is reading and it has to survive an interrupt.`,
    api:['Animator.CrossFade() / GetCurrentAnimatorStateInfo(0)','AnimatorStateInfo.normalizedTime / IsName()','Collider.enabled on the hitbox','Animator.speed','StateMachineBehaviour.OnStateExit()','WaitForSeconds in a coroutine'],
    snippet:`IEnumerator Swing() {
    animator.CrossFade("SwingWindup", 0.05f);        // 0.55s the player can read
    yield return new WaitForSeconds(windup);
    hitbox.enabled = true;                           // opened and closed here,
    yield return new WaitForSeconds(activeWindow);   // not by an AnimationEvent
    hitbox.enabled = false;
    animator.CrossFade("SwingRecover", 0.05f);
}

void OnDisable() {
    StopAllCoroutines();
    hitbox.enabled = false;     // an interrupt must never leave the window open
}`,
    pitfall:`Opening the hitbox from an AnimationEvent on the wind-up clip. Events belong to the clip, so a transition that interrupts the state, a blend that never reaches that normalized time, or a raised Animator.speed all skip the event, and the matching close event is skipped with it. The attack sometimes does nothing and sometimes leaves a live hitbox on a staggered enemy. Own the window in code and close it in OnDisable.`,
    map:`Unity's AnimationEvent is Godot's call method track, and a coroutine window is an await on create_timer.` } });

ENGINE('adaptive-and-director-ai',{
  godot:{ term:`The director is an autoload that listens rather than polls. Gameplay emits signals into it, it keeps one tension value, and a Timer decides when the next beat is allowed. The response itself is a Resource, so the adjustment stays data.`,
    api:['Project Settings > Autoload for the director singleton','signal / Callable connections from the encounters','Timer.wait_time and timeout for the beat cadence','Curve resource with sample() for the response shape','RandomNumberGenerator with its own seed','Resource + @export for the weighted spawn table'],
    snippet:`extends Node                          # autoload "Director"
@export var pressure: Curve           # tuned in the editor, not in code
@export var table: Resource
var _rng := RandomNumberGenerator.new()   # its own stream, never global randi()
var tension := 0.0

func _ready() -> void:
\t_rng.seed = run_seed

func on_encounter_ended(deaths: int) -> void:
\ttension = clampf(tension + 0.25 - 0.4 * deaths, 0.0, 1.0)
\t$Beat.wait_time = lerpf(9.0, 3.0, pressure.sample(tension))

func _on_beat_timeout() -> void:
\tspawn(table.pick(_rng))       # frequency and composition, never hidden power`,
    pitfall:`Letting the director draw from the global randi() and randf(). Those share one generator with every other script in the project, so a particle burst or a footstep variation added three months later shifts the whole sequence, and a seeded replay of a "the director cheated me" report no longer reproduces the session. Give the director its own RandomNumberGenerator with its own seed and leave cosmetic randomness on the global one, where it cannot move a decision.`,
    map:`A Godot autoload director is a DontDestroyOnLoad component, and a Curve resource is an AnimationCurve.` },
  unity:{ term:`The director is one component with its tuning on a ScriptableObject, reacting to events the encounters raise. Response curves are AnimationCurves, and every adjustment lands on frequency, composition or support rather than on hidden power.`,
    api:['ScriptableObject tuning asset with [CreateAssetMenu]','AnimationCurve.Evaluate() for the response shape','C# events or UnityEvent raised by encounters','Time.time with a nextBeat stamp','System.Random instance for a reproducible stream','Instantiate(asset) for a runtime copy of the tuning'],
    snippet:`[CreateAssetMenu(menuName = "AI/Director Tuning")]
public class DirectorTuning : ScriptableObject {
    public AnimationCurve beatInterval;      // tension 0..1 -> seconds, tuned here
}

public class Director : MonoBehaviour {
    [SerializeField] DirectorTuning asset;
    DirectorTuning live;                     // runtime copy: Play mode edits stay
    float tension, nextBeat;
    void Awake() => live = Instantiate(asset);
    public void EncounterEnded(int deaths) {
        tension = Mathf.Clamp01(tension + 0.25f - 0.4f * deaths);
        nextBeat = Time.time + live.beatInterval.Evaluate(tension);
    }
}`,
    pitfall:`Tuning the director asset while Play mode is running. A ScriptableObject is an asset rather than a scene object, so unlike a component its runtime edits are written to disk and survive leaving Play mode. A curve nudged during one playtest quietly becomes the committed baseline nobody remembers changing, and the next session is compared against a line that moved. Tune in edit mode, or hold the live values in a copy made with Instantiate.`,
    map:`A Unity ScriptableObject tuning asset is a Godot Resource, and AnimationCurve.Evaluate is Curve.sample.` } });

ENGINE('allies-and-companions',{
  godot:{ term:`The companion is a CharacterBody3D with its own NavigationAgent3D, pathing to a slot behind the player rather than to the player. Barks are an AudioStreamPlayer3D gated by a Timer, and the leash plus a recovery teleport is what keeps it out of the player's way.`,
    api:['NavigationAgent3D.target_position with a follow offset','NavigationAgent3D.target_desired_distance','NavigationServer3D.map_get_closest_point() for recovery','CollisionObject3D.set_collision_mask_value()','Timer for the bark cooldown','AudioStreamPlayer3D.play() / finished'],
    snippet:`func _physics_process(_delta: float) -> void:
\tvar slot := player.global_position + player.global_transform.basis.z * 1.8
\tnav.target_position = slot
\tif global_position.distance_to(player.global_position) > leash:
\t\tvar map := get_world_3d().navigation_map    # last resort, off camera only
\t\tglobal_position = NavigationServer3D.map_get_closest_point(map, slot)
\t\treturn
\tvar next := nav.get_next_path_position()
\tvelocity = (next - global_position).normalized() * speed
\tmove_and_slide()`,
    pitfall:`Leaving the companion on the same collision layer and mask as the player. Two CharacterBody3D bodies are both kinematic, so neither can push the other, and an ally standing in a doorway is a wall the player cannot walk through and cannot shove. Clear the player's bit on the ally's mask with set_collision_mask_value, keep the ally solid to enemies, and add a leash with an off camera recovery rather than hoping the path never traps it.`,
    map:`Godot's collision layer and mask pair is Unity's layer plus the Layer Collision Matrix, and map_get_closest_point is NavMesh.SamplePosition.` },
  unity:{ term:`A companion is a NavMeshAgent chasing a slot transform parented to the player, with its avoidance priority set so it yields instead of arguing. Warp is the recovery, and barks come from an AudioSource with a cooldown you own.`,
    api:['NavMeshAgent.avoidancePriority','NavMeshAgent.stoppingDistance / autoBraking','NavMesh.SamplePosition() + NavMeshAgent.Warp()','NavMeshAgent.obstacleAvoidanceType','AudioSource.PlayOneShot() behind a cooldown','Animator.SetFloat() for the follow gait'],
    snippet:`void Awake() {
    agent.avoidancePriority = 60;      // a HIGHER number yields to the player's 40
    agent.stoppingDistance = 1.6f;
}

void Update() {
    agent.SetDestination(followSlot.position);
    if (Vector3.Distance(transform.position, player.position) > leash &&
        NavMesh.SamplePosition(followSlot.position, out var hit, 3f,
                               NavMesh.AllAreas))
        agent.Warp(hit.position);      // last resort, and only off camera
    animator.SetFloat("Speed", agent.velocity.magnitude);
}`,
    pitfall:`Reading avoidancePriority the way it is spelled. A lower number means a higher priority and an agent largely ignores agents numbered above it, so leaving every follower on the default 50 makes the companion and the other allies treat each other as immovable and deadlock in a corridor. The matching mistake is moving the companion with transform.position instead of Warp, which leaves the agent's internal position behind and sends it walking back to where it thinks it is.`,
    map:`Unity's avoidancePriority is Godot's NavigationAgent3D avoidance_priority inverted, and Warp is assigning global_position with a fresh target_position.` } });

ENGINE('learning-based-ai',{
  godot:{ term:`Godot's honest place for learning is off the shipping path. A headless instance runs the game as a training or sweep environment from a SceneTree script, talks to the trainer over a socket, and what ships is the tuned table the sweep produced.`,
    api:['godot --headless -s res://train/env.gd','SceneTree._initialize() / _process()','StreamPeerTCP for the trainer link','Engine.max_fps and Engine.physics_ticks_per_second','RandomNumberGenerator.seed for reproducible episodes','SceneTree.quit(exit_code)'],
    snippet:`extends SceneTree                  # godot --headless -s res://train/env.gd
var _link := StreamPeerTCP.new()
var _episode := 0

func _initialize() -> void:
\tEngine.max_fps = 0             # render nothing, step as fast as the CPU allows
\t_link.connect_to_host("127.0.0.1", 5005)
\t_start_episode(0)

func _process(_delta: float) -> bool:
\t_link.put_utf8_string(JSON.stringify(_observation()))
\t_apply(JSON.parse_string(_link.get_utf8_string()))
\tif _episode_done():
\t\t_start_episode(_episode + 1)
\treturn _episode > 5000         # returning true ends the loop`,
    pitfall:`Speeding the environment up with Engine.time_scale. time_scale scales delta while physics_ticks_per_second stays where it is, so every physics step covers more simulated distance, contacts are missed and movement resolves differently from the build a player runs. The policy learns a game that does not ship, and the sweep results are about that other game. Remove the frame cap and advance episodes on a fixed step you control, then replay one episode at real speed and confirm the outcome matches.`,
    map:`A headless Godot SceneTree environment is a player built with -batchmode -nographics, and Engine.max_fps is Application.targetFrameRate.` },
  unity:{ term:`Unity has the parts on the shelf: ML-Agents trains against a built player and Sentis runs an exported ONNX policy in game. That makes the shipping question sharper rather than softer, because the decision period and the model file are both baked at training time.`,
    api:['com.unity.ml-agents: Agent, CollectObservations(), OnActionReceived()','VectorSensor.AddObservation() / ActionBuffers','DecisionRequester.DecisionPeriod','-batchmode -nographics for the training player','com.unity.sentis: ModelAsset, Worker.Schedule()','Application.targetFrameRate / Time.captureDeltaTime'],
    snippet:`public class Brawler : Agent {                        // com.unity.ml-agents
    [SerializeField] FairnessEnvelope fairness;       // authored, patchable
    [SerializeField] HeuristicBrain fallback;
    public override void CollectObservations(VectorSensor sensor) {
        sensor.AddObservation(transform.localPosition);
        sensor.AddObservation(knowledge.LastSeenAge);
        sensor.AddObservation(health / maxHealth);
    }
    public override void OnActionReceived(ActionBuffers actions) {
        var move = new Vector2(actions.ContinuousActions[0],
                               actions.ContinuousActions[1]);
        if (!fairness.Allows(move)) move = fallback.Decide();
        controller.Drive(move);
    }
}`,
    pitfall:`Treating the decision period as a tuning slider. The DecisionPeriod the agent trained with is part of the policy: it learned to act every N fixed steps and its timing assumptions come with the weights, so "make it react faster" or "give the player a longer window" is a retraining job and a new model file rather than an inspector change. Keep a heuristic behind the same interface, keep the fairness envelope outside the model where a hotfix can reach it, and budget Sentis inference per agent per decision before the build.`,
    map:`ML-Agents against a -batchmode player is a headless Godot SceneTree environment, and a Sentis ModelAsset is a GDExtension inference library plus an ONNX file under res://.` } });

ENGINE('ai-budgets-and-debugging',{
  godot:{ term:`Stagger the work by the frame counter and measure with the engine's own monitors. One scheduler node ticks a slice of the agents each physics frame, and Performance.add_custom_monitor puts the AI cost on the same graph as physics and navigation.`,
    api:['Engine.get_physics_frames() % N for the phase','Performance.add_custom_monitor() / get_monitor()','Time.get_ticks_usec()','Node.set_physics_process(false) for distant agents','Node2D._draw() / queue_redraw() for the overlay','get_tree().get_nodes_in_group("agents")'],
    snippet:`extends Node                       # one scheduler, not thirty _physics_process
@export var slices := 4
var _agents: Array[Node] = []
var _last_us := 0

func _ready() -> void:
\tPerformance.add_custom_monitor("ai/decide_us", func(): return _last_us)

func _physics_process(_d: float) -> void:
\tvar start := Time.get_ticks_usec()
\tvar phase := Engine.get_physics_frames() % slices
\tfor i in range(phase, _agents.size(), slices):
\t\t_agents[i].decide()        # 15 Hz per agent at 60 physics ticks
\t_last_us = Time.get_ticks_usec() - start`,
    pitfall:`Reading the script profiler and concluding the AI is cheap. Navigation path queries are served by the NavigationServer on its own threads and physics queries are charged to the physics step, so neither appears beside your decide() function, and a frame that spikes the moment a fight starts looks innocent in the list you are staring at. Watch the physics and navigation monitors next to your custom one, and take the numbers from an exported build, because the editor's remote debugger adds its own cost to every one of them.`,
    map:`Performance.add_custom_monitor is a ProfilerRecorder over a ProfilerMarker, and phase slicing by physics frame is the same trick with Time.frameCount.` },
  unity:{ term:`Wrap the AI work in a ProfilerMarker so it has a name in the timeline, read it back at runtime with a ProfilerRecorder, and slice agents by frame index so thirty of them never think on the same frame.`,
    api:['ProfilerMarker / Profiler.BeginSample()','ProfilerRecorder.StartNew(ProfilerCategory.Scripts, ...)','Time.frameCount % N for the phase','Application.SetStackTraceLogType()','[Conditional("AI_DEBUG")] on debug calls','Debug.DrawRay() / OnDrawGizmosSelected()'],
    snippet:`static readonly ProfilerMarker Decide = new ProfilerMarker("AI.Decide");

void Awake() {                     // a stack trace per log is the real cost
    Application.SetStackTraceLogType(LogType.Log, StackTraceLogType.None);
}

void FixedUpdate() {
    int phase = Time.frameCount % slices;
    using (Decide.Auto()) {
        for (int i = phase; i < agents.Count; i += slices)
            agents[i].Decide();
    }
}
[System.Diagnostics.Conditional("AI_DEBUG")]
void Trace(string s) => Debug.Log(s);`,
    pitfall:`Instrumenting the AI with Debug.Log and then measuring the result. Every Debug.Log captures a managed stack trace by default and writes to the player log synchronously, so thirty agents logging one line each per decision cost more than the decisions did and move the spike you are hunting. Turn the stack trace off for Log, put the calls behind a Conditional attribute so they leave the release build entirely, and read the numbers from a development build on the target device rather than from the editor.`,
    map:`A ProfilerMarker is a custom performance monitor, and ProfilerRecorder is Performance.get_monitor.` } });

ENGINE('scripted-vs-simulated',{
  godot:{ term:`The cheap rung is a scene with an Area3D, an AnimationPlayer and one connection. The trigger fires once, the animation owns the beat, and nothing decides anything at runtime until the beat hands the agents over.`,
    api:['Area3D.body_entered connected with CONNECT_ONE_SHOT','AnimationPlayer.play() and call method tracks','Marker3D spawn points authored in the scene','PackedScene.instantiate()','Area3D.monitoring via set_deferred()','Node.queue_free() once the beat is spent'],
    snippet:`extends Area3D                     # res://level/ambush/balcony_ambush.tscn
@export var grunt: PackedScene

func _ready() -> void:
\tbody_entered.connect(_fire, CONNECT_ONE_SHOT)   # fires once, ever

func _fire(body: Node3D) -> void:
\tif not body.is_in_group("player"):
\t\treturn
\tset_deferred("monitoring", false)
\t$AnimationPlayer.play("balcony_collapse")       # the beat, authored
\tfor m in $Spawns.get_children():
\t\tvar e := grunt.instantiate()
\t\te.global_position = m.global_position       # then hand over to behaviour
\t\tget_parent().add_child(e)`,
    pitfall:`Assuming body_entered fires once because one player walked in. It fires per body, and a player built as a CharacterBody3D with a separate hurtbox body, a carried object or a dropped ragdoll enters as several, so the authored beat plays two or three times over itself and the ambush spawns a double wave. Connect with CONNECT_ONE_SHOT, filter by group, and stop monitoring inside the handler with set_deferred.`,
    map:`An Area3D trigger driving an AnimationPlayer beat is a trigger Collider driving a Timeline PlayableDirector.` },
  unity:{ term:`The cheap rung is a trigger collider and a Timeline. A PlayableDirector plays the authored beat with camera, audio and animation on tracks, then gives the agents back to their own behaviour when it stops.`,
    api:['OnTriggerEnter() with a tag or layer check','PlayableDirector.Play() and the stopped event','PlayableDirector.extrapolationMode (post-playback state)','TimelineAsset tracks and SignalReceiver','Collider.enabled = false after the beat','Animator.applyRootMotion during the clip'],
    snippet:`[SerializeField] PlayableDirector beat;
[SerializeField] EnemyBrain[] actors;

void OnTriggerEnter(Collider other) {
    if (!other.CompareTag("Player")) return;
    GetComponent<Collider>().enabled = false;          // one shot
    beat.extrapolationMode = DirectorWrapMode.None;    // release the bindings
    beat.stopped += HandOver;
    beat.Play();
}

void HandOver(PlayableDirector d) {
    d.stopped -= HandOver;
    foreach (var a in actors) a.enabled = true;
}`,
    pitfall:`Leaving the director's post-playback state on Hold. Timeline keeps writing every property it animated for as long as the director is active, so an enemy whose Animator sat on a track stays frozen at the last keyframe while its behaviour tree cheerfully decides to charge, and the bug reads as broken AI rather than as an authoring setting. Set extrapolationMode to None, re-enable the behaviour on the stopped event, and keep the authored and simulated layers off each other's transforms.`,
    map:`A Timeline PlayableDirector is an AnimationPlayer beat with call method tracks, and a SignalReceiver is a signal connection.` } });

/* ---------------- STUDIO PRACTICE ---------------- */

ENGINE('design-documents',{
  godot:{ term:`The document that stays true is the one the editor shows. A tuning Resource with ## doc comments and @export_group puts the intent next to the value it governs, and a script with a class_name gets a page in the editor's own help.`,
    api:['class_name + extends Resource','## doc comments above a member','@export_group() / @export_subgroup()','@export_range(min, max, step) for hard bounds','ResourceSaver.save() / ResourceLoader.load() for a .tres','Editor Help (F1), generated from the script'],
    snippet:`class_name EncounterTuning extends Resource
## Pressure knobs for one encounter.
## Reviewed at every milestone. Raise spawn_gap before lowering enemy_hp.

@export_group("Pacing")
## Seconds of quiet after a wave clears. Below 2.0 testers report exhaustion.
@export_range(0.0, 12.0, 0.5) var spawn_gap := 4.0
## Waves before the elite shows up. The pillar says the elite is a surprise.
@export_range(1, 10) var elite_after := 3

@export_group("Pressure")
@export_range(1, 400) var enemy_hp := 60`,
    pitfall:`Changing an @export default and believing the team now runs the new number. A .tscn or a .tres stores whatever was set when it was saved, so every existing instance keeps the old value and only new ones pick up the default. The document and the script agree, the level does not, and the only sign is a small revert arrow in the inspector. When a default moves, sweep the saved resources, or read the value from one shared .tres instead of from per-instance exports.`,
    map:`A Godot Resource with ## doc comments is a ScriptableObject with Tooltip and Header attributes.` },
  unity:{ term:`A ScriptableObject is the document the build reads. CreateAssetMenu makes it an asset a designer can open, Tooltip and Header carry the intent, and HelpURL puts the long form one click from the component.`,
    api:['[CreateAssetMenu(menuName = "...")]','[Tooltip("")] / [Header("")]','[Range(min, max)]','[HelpURL("...")] on the class','[FormerlySerializedAs("old")] when a field is renamed','AssetDatabase.LoadAssetAtPath<T>() for an editor check'],
    snippet:`[CreateAssetMenu(menuName = "Design/Encounter Tuning")]
[HelpURL("docs/encounters.md")]              // the long form, one click away
public class EncounterTuning : ScriptableObject {
    [Header("Pacing")]
    [Tooltip("Seconds of quiet after a wave clears. Below 2 reads as exhausting.")]
    [Range(0f, 12f)] public float spawnGap = 4f;

    [Tooltip("Waves before the elite appears. The pillar says elite = surprise.")]
    [Range(1, 10)] public int eliteAfter = 3;

    [Header("Pressure")]
    [FormerlySerializedAs("hp")]             // renamed, and the values survived
    [Range(1, 400)] public int enemyHp = 60;
}`,
    pitfall:`Renaming a serialized field while tidying the code to match the document. Unity matches serialized data by field name, so the rename silently drops every value on every prefab, scene object and asset back to the type default and nothing errors anywhere. The spec becomes accurate and the build becomes wrong in the same commit. Add FormerlySerializedAs in the same change and open one existing asset before committing.`,
    map:`Unity's ScriptableObject asset is a Godot Resource, Tooltip is a ## doc comment, and Range is @export_range.` } });

ENGINE('metrics-and-success',{
  godot:{ term:`One autoload owns the event buffer. Gameplay calls into it, it batches to JSON and flushes on a Timer and once more at quit, and that last flush is what decides whether you ever see a session end.`,
    api:['Autoload singleton holding the queue','JSON.stringify() / FileAccess.store_line()','HTTPRequest.request() with HTTPClient.METHOD_POST','Timer for the flush cadence','get_tree().auto_accept_quit = false','_notification(NOTIFICATION_WM_CLOSE_REQUEST)'],
    snippet:`extends Node                       # autoload "Telemetry"
var _queue: Array[Dictionary] = []

func _ready() -> void:
\tget_tree().auto_accept_quit = false   # or the last flush never happens

func log_event(name: String, props: Dictionary) -> void:
\tprops["e"] = name
\tprops["t"] = Time.get_unix_time_from_system()
\t_queue.append(props)              # the decision it informs is in the name

func _notification(what: int) -> void:
\tif what == NOTIFICATION_WM_CLOSE_REQUEST:
\t\tflush()                   # session_end, the event everyone forgets
\t\tget_tree().quit()`,
    pitfall:`Leaving auto_accept_quit at its default while buffering events. The engine accepts the window close request itself, the tree is torn down, and the buffer goes with it, so every clean exit loses its session end and a crash becomes indistinguishable from a quit. The metric the whole funnel rests on is the one that never arrives. Turn auto_accept_quit off, handle NOTIFICATION_WM_CLOSE_REQUEST, and keep a Timer flush so a kill still leaves most of the session on disk.`,
    map:`Godot's NOTIFICATION_WM_CLOSE_REQUEST is Unity's Application.wantsToQuit, and an autoload is a DontDestroyOnLoad component.` },
  unity:{ term:`One DontDestroyOnLoad component owns the queue, serializes flat structs with JsonUtility and posts with UnityWebRequest. On mobile the flush that matters is the one in OnApplicationPause, because that is where sessions actually end.`,
    api:['OnApplicationPause(bool) / OnApplicationFocus(bool)','Application.wantsToQuit / Application.quitting','UnityWebRequest.Post() with a JSON body','JsonUtility.ToJson() on a [Serializable] struct','Application.persistentDataPath for the spill file','DontDestroyOnLoad()'],
    snippet:`void OnApplicationPause(bool paused) {
    if (paused) Flush();            // on Android and iOS this IS the quit
}

void OnApplicationQuit() => Flush();      // desktop only, never fires on mobile

void Flush() {
    if (queue.Count == 0) return;
    var body = string.Join("\\n", queue.Select(JsonUtility.ToJson));
    File.AppendAllText(spillPath, body + "\\n");   // disk first, network second
    queue.Clear();
    StartCoroutine(Post(body));
}`,
    pitfall:`Relying on OnApplicationQuit. Android and iOS suspend an app and kill it later without telling it, so OnApplicationQuit never runs on the platforms where most sessions end, and every mobile session arrives with its tail missing. Flush in OnApplicationPause(true), write to persistentDataPath before attempting the network, and send the previous run's spill file on the next launch.`,
    map:`Unity's OnApplicationPause is Godot's NOTIFICATION_APPLICATION_PAUSED, and persistentDataPath is user://.` } });

ENGINE('team-and-collaboration',{
  godot:{ term:`Ownership follows the file. A .tscn is text, which invites hand merges, but its references resolve by index into the resource lists, so two people work on one level by splitting it into instanced sub scenes that each have one owner.`,
    api:['PackedScene instances and scene inheritance','Editable Children on an instanced scene','uid:// identifiers inside .tscn and .tres','*.import sidecar files, which belong in the repository','.godot/ , which does not','Project Settings > Version Control plugin'],
    snippet:`extends Node3D                     # res://level/atrium/atrium.tscn
## Each instanced child is one file with one owner. Merge at the file level.
## References inside a .tscn resolve by index, so a hand merge renumbers them.

@export var encounter: PackedScene      # owner: combat design
@export var set_dressing: PackedScene   # owner: environment art
@export var audio_zones: PackedScene    # owner: audio

func _ready() -> void:
\tfor s in [encounter, set_dressing, audio_zones]:
\t\tif s:
\t\t\tadd_child(s.instantiate())`,
    pitfall:`Hand resolving a merge conflict inside a .tscn. The format is text, which makes it look mergeable, but nodes point at resources by index into the ExtResource and SubResource lists, so a conflict resolved by taking both sides renumbers those lists and the scene opens with scripts and meshes attached to the wrong nodes, or refuses to open. Take one side whole and redo the other edit in the editor, and split scenes so that choice costs an hour rather than a day. Commit the .import files and ignore .godot/.`,
    map:`A Godot instanced sub scene is a nested prefab, and uid:// is the GUID inside a .meta file.` },
  unity:{ term:`Ownership follows the prefab, and identity lives in the .meta file beside every asset. Force Text serialization plus the UnityYAMLMerge tool makes scene and prefab conflicts survivable, and prefab variants give each discipline a file of its own.`,
    api:['Prefab variants and nested prefabs','.meta files, committed with every asset','Editor Settings > Asset Serialization: Force Text','Tools/UnityYAMLMerge registered as the git mergetool','Assembly Definition files for compile ownership','AssetPostprocessor.OnPostprocessAllAssets()'],
    snippet:`class PrefabGuard : AssetPostprocessor {         // Editor/PrefabGuard.cs
    static void OnPostprocessAllAssets(string[] imported, string[] deleted,
                                       string[] moved, string[] movedFrom) {
        foreach (var path in imported) {
            if (!path.EndsWith(".prefab")) continue;
            var go = AssetDatabase.LoadAssetAtPath<GameObject>(path);
            foreach (var c in go.GetComponentsInChildren<Component>(true))
                if (c == null)                   // a missing script: a lost .meta
                    Debug.LogError(path + " has a missing script reference");
        }
    }
}`,
    pitfall:`Not committing the .meta files, or deleting one while tidying. The .meta holds the asset's GUID, which is the only thing every prefab, scene and asset reference points at. Lose it and Unity mints a new GUID on the next import, so on the next person's machine the references become Missing (Mono Script) and a day of prefab wiring is gone with no error at commit time. Commit every .meta with its asset, set Asset Serialization to Force Text, and register UnityYAMLMerge before the first scene conflict rather than after it.`,
    map:`A Unity .meta GUID is Godot's uid:// plus the .import sidecar, and a prefab variant is an inherited scene.` } });

ENGINE('planning-and-milestones',{
  godot:{ term:`A milestone exit criterion is a command a runner can execute. godot --headless runs a SceneTree script that loads every level and exits with a code, and the same headless binary produces the export the milestone is actually judged on.`,
    api:['godot --headless -s res://ci/gate.gd --path .','godot --headless --export-release "<preset>" <out>','SceneTree.quit(exit_code)','DirAccess.get_files_at() / ResourceLoader.exists()','PackedScene.instantiate() as the real load check','export_presets.cfg and the matching export templates'],
    snippet:`extends SceneTree                  # godot --headless -s res://ci/gate.gd

func _initialize() -> void:
\tvar bad := 0
\tfor f in DirAccess.get_files_at("res://level"):
\t\tif not f.ends_with(".tscn"): continue
\t\tvar packed: PackedScene = load("res://level/" + f)
\t\tvar node := packed.instantiate() if packed else null
\t\tif node == null:
\t\t\tpush_error("cannot instantiate " + f)
\t\t\tbad += 1
\t\telse:
\t\t\tnode.free()
\tquit(bad)                      # the milestone is green only at exit code 0`,
    pitfall:`Assuming the runner can export because a developer machine can. Export templates are a separate download pinned to the exact engine version, and export_presets.cfg carries per-platform paths and signing settings that are usually local to one machine, so the milestone build exists on one laptop and nothing else can reproduce it. Install the matching templates on the runner and export every target once in the first week, because "we have not tried that platform yet" is a milestone question rather than a task.`,
    map:`godot --headless -s is unity -batchmode -executeMethod, and SceneTree.quit(code) is EditorApplication.Exit(code).` },
  unity:{ term:`The exit criterion is a static method a runner calls. unity -batchmode -nographics -executeMethod runs it, BuildPipeline produces the player, and the BuildReport is the only thing that knows whether the milestone actually passed.`,
    api:['unity -batchmode -nographics -executeMethod Build.Player','BuildPipeline.BuildPlayer(BuildPlayerOptions)','BuildReport.summary.result / totalErrors','EditorApplication.Exit(code)','EditorBuildSettings.scenes','-logFile - to stream the editor log'],
    snippet:`static class Build {                      // Editor/Build.cs
    // unity -batchmode -nographics -executeMethod Build.Player -logFile -
    public static void Player() {
        var opts = new BuildPlayerOptions {
            scenes = EditorBuildSettings.scenes.Where(s => s.enabled)
                                               .Select(s => s.path).ToArray(),
            target = BuildTarget.StandaloneWindows64,
            locationPathName = "out/game.exe",
        };
        var report = BuildPipeline.BuildPlayer(opts);
        var ok = report.summary.result == BuildResult.Succeeded;
        EditorApplication.Exit(ok ? 0 : 1);   // batchmode exits 0 without this
    }
}`,
    pitfall:`Trusting the process exit code of a batchmode run. Unity exits 0 once -executeMethod returns, whether the build succeeded, threw, or never ran because an editor script failed to compile, so a runner that checks only the exit code reports a green milestone over a player that does not exist. Read BuildReport.summary.result and call EditorApplication.Exit yourself, and remember that -quit kills anything asynchronous the moment the method returns, so a build step that yields is cut off half way.`,
    map:`unity -batchmode -executeMethod is godot --headless -s, and EditorApplication.Exit is SceneTree.quit.` } });

ENGINE('quality-and-build-health',{
  godot:{ term:`Godot ships no test framework, so build health is a headless run plus an addon. GdUnit4 suites run from the command line beside the level gate, and the engine's own leaked-instance report at exit is the cheapest regression signal the project has.`,
    api:['extends GdUnitTestSuite','assert_int() / assert_that() / assert_array()','auto_free() for nodes a test creates','godot --headless running the GdUnit4 command line runner','ObjectDB instances leaked at exit, printed on a debug build','push_error() and SceneTree.quit(exit_code)'],
    snippet:`extends GdUnitTestSuite            # res://test/test_wave_budget.gd

func test_wave_never_exceeds_budget() -> void:
\tvar director := auto_free(Director.new())   # auto_free or the run leaks
\tadd_child(director)
\tdirector.tension = 1.0
\tvar wave: Array = director.build_wave(120)
\tvar cost := 0
\tfor e in wave:
\t\tcost += e.budget_cost
\tassert_that(wave).is_not_empty()
\tassert_int(cost).is_less_equal(120)`,
    pitfall:`Letting tests create nodes and never free them. A Node that is not in the tree and not freed stays in the ObjectDB, and the run ends with a leaked instances warning that nobody reads because it is not a failure. The suite stays green while the thing it guards drifts, and the same leak in gameplay code is the memory climb someone chases a month later. Wrap every node a test creates in auto_free, and treat the leak report at exit as a failing check in the runner.`,
    map:`GdUnit4's assert_that is NUnit's Assert.That under the Unity Test Framework, and auto_free is a teardown Object.DestroyImmediate.` },
  unity:{ term:`The Unity Test Framework runs from the same batchmode entry point as the build. EditMode tests are fast and prove logic, PlayMode tests prove the scene, and only a development build on the device proves the thing a tester will open.`,
    api:['unity -batchmode -runTests -testPlatform EditMode -testResults results.xml','[Test] / [UnityTest] in an asmdef with Test Assemblies ticked','UnityEngine.TestTools: LogAssert, yield return null','SceneManager.LoadSceneAsync() inside a [UnityTest]','LogAssert.NoUnexpectedReceived()','BuildOptions.Development for the device smoke run'],
    snippet:`public class WaveBudgetTests {          // Tests/Editor asmdef, tests-only
    [Test]
    public void WaveNeverExceedsBudget() {
        var tuning = ScriptableObject.CreateInstance<DirectorTuning>();
        var wave = Director.BuildWave(tuning, budget: 120);
        Assert.That(wave.Sum(e => e.BudgetCost), Is.LessThanOrEqualTo(120));
    }

    [UnityTest]
    public IEnumerator ArenaSceneLoadsWithNoErrors() {
        yield return SceneManager.LoadSceneAsync("Arena");
        yield return null;
        LogAssert.NoUnexpectedReceived();   // an error log fails this test
    }
}`,
    pitfall:`Reading a green EditMode suite as a healthy build. EditMode tests run inside the editor's domain, where every UNITY_EDITOR block compiles, nothing is stripped and no scene has to load, so the suite stays green while the player build fails to link, a scene is missing from Build Settings, or a serialized reference is empty. Keep a PlayMode test that loads the real scene and asserts on the log, and put a development build on the target inside the same gate.`,
    map:`The Unity Test Framework in batchmode is godot --headless running a GdUnit4 suite, and LogAssert is scanning the headless log for push_error output.` } });

/* ---------------- END GAMEAI AND STUDIO ---------------- */
