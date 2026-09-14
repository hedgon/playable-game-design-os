/* =====================================================================
   ENGINE VIEWS (part A): player, experience, core, systems, content.
   Adds the Godot / Unity tabs to existing topics: the engine-native term,
   the nodes and classes to reach for, one short snippet with real API
   names, one engine-specific pitfall, and the "same idea, different name"
   mapping line. Attached after the topics are defined, exactly like TECH,
   so the topic files stay focused on design intent.
   Godot 4.x and Unity 6 / 2022 LTS. Shape:
     ENGINE('topic-id',{ godot:{term,api:[],snippet,pitfall,map},
                         unity:{term,api:[],snippet,pitfall,map}, note:'' })

   Topics this file owns (31):
     player      who-is-the-player, player-motivation, fantasy,
                 return-and-quit, finding-an-idea
     experience  core-experience, fun-dimensions, goals-horizons,
                 tension-release, mastery-discovery-expression,
                 social-experience, feature-vs-experience, design-pillars
     core        core-loop, decisions, risk-reward, agency-and-emergence,
                 challenge-failure-recovery, skill-and-mastery
     systems     mechanics-and-rules, depth-vs-complexity, systemic-design,
                 economy-and-resources, progression, difficulty,
                 builds-and-loadouts
     content     content-multiplies, encounters-and-enemies,
                 items-weapons-abilities, quests-and-events,
                 procedural-content
   ===================================================================== */

ENGINE('core-loop',{
  godot:{ term:`The loop is the physics tick. One node owns the verb, drives its own state in _physics_process, and emits a signal for every consequence the player must read.`,
    api:['Node._physics_process(delta)','CharacterBody2D.move_and_slide()','Input.get_vector() / Input.is_action_just_pressed()','signal / emit()','Engine.physics_ticks_per_second','AnimationPlayer / AnimationTree'],
    snippet:`extends CharacterBody2D
@export var speed := 320.0
signal struck(force: float)              # the consequence the loop feeds back

func _physics_process(_delta: float) -> void:
\tvar dir := Input.get_vector("left", "right", "up", "down")
\tvelocity = dir * speed               # move_and_slide applies delta itself
\tmove_and_slide()
\tif Input.is_action_just_pressed("attack"):
\t\t_attack()

func _attack() -> void:
\tstruck.emit(velocity.length())       # one action, one legible consequence`,
    pitfall:`Multiplying velocity by delta before move_and_slide(). CharacterBody2D.move_and_slide() already integrates over the physics step, so the extra multiply silently makes the loop frame-rate dependent and roughly sixty times too slow. The matching mistake is running the verb in _process instead of _physics_process, which makes the same action resolve differently on a 60 Hz and a 144 Hz monitor.`,
    map:`Godot _physics_process(delta) is Unity FixedUpdate(), _process(delta) is Update(), and a signal is a UnityEvent.` },
  unity:{ term:`The loop is split across the PlayerLoop: sample input in Update so no press is missed, resolve movement and hits in FixedUpdate so the rules run on a fixed step, and raise a UnityEvent for the feedback.`,
    api:['MonoBehaviour.Update() / FixedUpdate()','Time.deltaTime / Time.fixedDeltaTime','InputAction.ReadValue<T>() / WasPressedThisFrame()','CharacterController.Move() / Rigidbody.MovePosition()','UnityEvent<T>','Animator.SetTrigger()'],
    snippet:`public class CoreLoop : MonoBehaviour {
    [SerializeField] float speed = 6f;
    [SerializeField] InputActionReference move, attack;
    public UnityEvent<float> Struck;            // the consequence, wired in the Inspector
    CharacterController cc;
    Vector2 input;
    void Awake() => cc = GetComponent<CharacterController>();
    void Update() {                              // every frame: never miss a press
        input = move.action.ReadValue<Vector2>();
        if (attack.action.WasPressedThisFrame()) Struck.Invoke(input.magnitude);
    }
    void FixedUpdate() =>                        // fixed step: the rules resolve here
        cc.Move(new Vector3(input.x, 0, input.y) * speed * Time.fixedDeltaTime);
}`,
    pitfall:`Reading WasPressedThisFrame() inside FixedUpdate. FixedUpdate can run zero or twice in a rendered frame, so single-frame presses are dropped or double-counted and the loop feels unreliable in exactly the way players call unresponsive. Sample input in Update, buffer it, consume it in FixedUpdate.`,
    map:`Unity FixedUpdate() is Godot _physics_process(delta), Update() is _process(delta), and a UnityEvent is a signal.` },
  note:`The design point survives both engines: the loop is only a loop when the consequence is legible before the next input. In both snippets the feedback is an explicit event, not a line buried in the movement code, because that is the part you will want to test, delay, juice and eventually move to a server.` });

/* ---------------- PLAYER ---------------- */

ENGINE('who-is-the-player',{
  godot:{ term:`The player model becomes a Resource the game loads at boot. Control scheme, assumed session length and the starting difficulty row live in one .tres asset, and every system that depends on who is playing reads that asset instead of guessing for itself.`,
    api:['class_name / extends Resource','@export / @export_range','ResourceLoader.load() and Resource.duplicate()','DisplayServer.is_touchscreen_available()','Input.get_connected_joypads()','OS.has_feature()'],
    snippet:`class_name PlayerProfile extends Resource
@export var scheme := "keyboard"           # keyboard, pad, touch
@export var session_minutes := 25
@export var assumes_genre_literacy := true

# autoload: Profile
func _ready() -> void:
\tvar p: PlayerProfile = load("res://profiles/default.tres").duplicate()
\tif Input.get_connected_joypads().size() > 0:
\t\tp.scheme = "pad"
\telif DisplayServer.is_touchscreen_available():
\t\tp.scheme = "touch"
\tcurrent = p                              # one asset every system reads`,
    pitfall:`Choosing the control scheme from OS.has_feature("mobile"). Feature tags come from the export preset, not from the device in front of the player, so a desktop build on a touch laptop reports no touch and a pad plugged in after boot changes nothing. Read the device that was actually used last, and let the profile change during the session.`,
    map:`Godot Resource is Unity ScriptableObject, and OS.has_feature() is a scripting define plus Application.platform.` },
  unity:{ term:`The player model is a ScriptableObject asset loaded at boot and copied at runtime. Difficulty tables, tutorial gates and input prompts all read the same object, so who is playing is one serialized asset rather than booleans scattered through scenes.`,
    api:['ScriptableObject / CreateAssetMenu','Instantiate(scriptableObject) for a runtime copy','SystemInfo.deviceType / Application.platform','InputSystem.onAnyButtonPress.CallOnce()','Gamepad.current / InputDevice','Application.systemLanguage'],
    snippet:`[CreateAssetMenu(menuName = "Design/Player Profile")]
public class PlayerProfile : ScriptableObject {
    public string scheme = "keyboard";        // keyboard, pad, touch
    public int sessionMinutes = 25;
    public bool assumesGenreLiteracy = true;
}
public class Boot : MonoBehaviour {
    [SerializeField] PlayerProfile asset;
    public static PlayerProfile Current;
    void Awake() {
        Current = Instantiate(asset);         // runtime copy, never the asset itself
        InputSystem.onAnyButtonPress.CallOnce(
            c => Current.scheme = c.device is Gamepad ? "pad" : "keyboard");
    }
}`,
    pitfall:`Deciding the scheme from SystemInfo.deviceType. Touch-enabled Windows machines report Desktop while also reporting touch support, so a large slice of players gets the wrong prompts. The device that pressed the last button is the only honest signal. Instantiate on the asset is what keeps a play-mode tweak out of the file you commit.`,
    map:`Unity ScriptableObject is Godot Resource, and Instantiate on an asset is Resource.duplicate().` } });

ENGINE('player-motivation',{
  godot:{ term:`Motivation is measured, not asserted. An autoload owns the session counters and the event buffer, because anything that lives on a scene node is destroyed the moment the player walks through a door.`,
    api:['Autoload singleton (Project Settings, Autoload tab)','Time.get_ticks_msec()','signal / emit()','JSON.stringify()','FileAccess.open("user://...")','NOTIFICATION_APPLICATION_PAUSED'],
    snippet:`# autoload: Telemetry
var _events: Array[Dictionary] = []
var _session_start := Time.get_ticks_msec()

func mark(kind: String, detail: Dictionary = {}) -> void:
\tdetail["t_ms"] = Time.get_ticks_msec() - _session_start
\tdetail["kind"] = kind                    # "improved", "chose", "returned"
\t_events.append(detail)

func _notification(what: int) -> void:
\tif what == NOTIFICATION_APPLICATION_PAUSED or what == NOTIFICATION_WM_CLOSE_REQUEST:
\t\tvar f := FileAccess.open("user://session.jsonl", FileAccess.WRITE)
\t\tfor e in _events:
\t\t\tf.store_line(JSON.stringify(e))`,
    pitfall:`Keeping the counters on a scene node. change_scene_to_file() frees the whole tree, so every session metric resets when the player changes room and the data says nobody plays longer than four minutes. Counters that describe the player belong on an autoload. Counters that describe a level belong on the level.`,
    map:`A Godot autoload is a Unity DontDestroyOnLoad singleton, and NOTIFICATION_APPLICATION_PAUSED is OnApplicationPause(true).` },
  unity:{ term:`The same counters live on a DontDestroyOnLoad service created before the first scene. Unity's trap is the clock: measure engagement with scaled time and every pause menu subtracts itself from the session you recorded.`,
    api:['[RuntimeInitializeOnLoadMethod] / DontDestroyOnLoad()','Time.unscaledTime / Time.realtimeSinceStartup','Time.time and Time.timeScale','MonoBehaviour.OnApplicationPause(bool)','Application.persistentDataPath','JsonUtility.ToJson()'],
    snippet:`public class Telemetry : MonoBehaviour {
    static Telemetry _i;
    readonly List<string> _events = new();
    float _start;
    [RuntimeInitializeOnLoadMethod] static void Boot() {
        _i = new GameObject("Telemetry").AddComponent<Telemetry>();
        DontDestroyOnLoad(_i.gameObject);
        _i._start = Time.unscaledTime;        // a pause must not eat the session
    }
    public static void Mark(string kind) =>
        _i._events.Add($"{kind} @ {Time.unscaledTime - _i._start:F1}");
    void OnApplicationPause(bool paused) {    // the only reliable flush on a handheld
        if (paused) File.AppendAllLines(Application.persistentDataPath + "/s.jsonl", _events);
    }
}`,
    pitfall:`Timing sessions with Time.time. It is scaled time, so it stops while the game sits at timeScale zero and every inventory screen shortens the session in your data. Time.unscaledTime is the wall clock. OnApplicationQuit is never called when a mobile OS kills a backgrounded app, so the flush belongs in OnApplicationPause.`,
    map:`Unity DontDestroyOnLoad is a Godot autoload, and Time.unscaledTime is Time.get_ticks_msec().` },
  note:`Client counters are the cheap half. The moment you want retention across devices or a cohort comparison, these events have to leave the build and land in a store you control, and the client's job shrinks to buffering and flushing rather than deciding what is true.` });

ENGINE('fantasy',{
  godot:{ term:`The fantasy verb list is the InputMap plus the AnimationTree states. A verb the pitch promises with no action and no state is not in the game, and a state nobody can trigger is a promise the build does not keep.`,
    api:['InputMap.get_actions()','Input.is_action_just_pressed()','AnimationTree / AnimationNodeStateMachinePlayback.travel()','AnimationPlayer call method track','signal / emit()','Node._unhandled_input()'],
    snippet:`@onready var _sm: AnimationNodeStateMachinePlayback = $AnimationTree.get("parameters/playback")
const VERBS := {"steal": "steal_state", "hide": "hide_state", "slip_away": "slip_state"}
signal fantasy_verb(verb: String)

func _unhandled_input(_e: InputEvent) -> void:
\tfor verb in VERBS:
\t\tif Input.is_action_just_pressed(verb):
\t\t\t_perform(verb)

func _perform(verb: String) -> void:
\t_sm.travel(VERBS[verb])                  # the animation shows the verb
\tfantasy_verb.emit(verb)                  # the rules react to the verb, not the clip`,
    pitfall:`Putting the gameplay effect on an AnimationPlayer call method track. The steal then lands wherever the animator placed the key, so retiming a clip for feel silently changes the rules, and a state machine transition that blends the clip out never calls the method at all. Drive the effect from script and let the track drive presentation.`,
    map:`A Godot call method track is a Unity Animation Event, and AnimationNodeStateMachinePlayback.travel() is Animator.CrossFade().` },
  unity:{ term:`The verb set is the InputActionAsset's action names and the Animator's states. Reading the action map out loud is the fastest fantasy audit a programmer can run, because the map is the list of things a player is able to do.`,
    api:['InputActionAsset.FindAction()','InputAction.performed / action.Enable()','Animator.CrossFade() / SetTrigger()','AnimationEvent on a clip','UnityEvent<string>','Animator.GetCurrentAnimatorStateInfo()'],
    snippet:`public class FantasyVerbs : MonoBehaviour {
    [SerializeField] InputActionAsset map;
    [SerializeField] Animator animator;
    public UnityEvent<string> VerbPerformed;
    static readonly string[] Verbs = { "Steal", "Hide", "SlipAway" };
    void OnEnable() {
        foreach (var verb in Verbs) {
            var a = map.FindAction(verb, throwIfNotFound: true);
            a.performed += _ => { animator.CrossFade(verb, 0.08f); VerbPerformed.Invoke(verb); };
            a.Enable();                       // an action left disabled fires nothing
        }
    }
}`,
    pitfall:`Letting an Animation Event on the clip apply the effect. Events near the end of a clip are skipped when a transition blends it out, and renaming the handler leaves a console warning rather than a compile error, so the verb stops happening on exactly the machines where transitions are fastest.`,
    map:`A Unity InputActionAsset is Godot's InputMap, and an Animation Event is a call method track.` } });

ENGINE('return-and-quit',{
  godot:{ term:`Return is whatever the save file can restore. The save lives under user://, it is written from an autoload, and on a handheld the quit you have to catch is a pause notification rather than a window close.`,
    api:['FileAccess.open("user://save.dat")','FileAccess.store_var() / get_var()','ConfigFile.save() / load()','NOTIFICATION_APPLICATION_PAUSED','NOTIFICATION_WM_CLOSE_REQUEST','get_tree().auto_accept_quit'],
    snippet:`const PATH := "user://save.dat"          # the only writable path in a build

func save_state(state: Dictionary) -> void:
\tstate["version"] = 3                     # the resume must survive the next patch
\tvar f := FileAccess.open(PATH, FileAccess.WRITE)
\tf.store_var(state, true)

func load_state() -> Dictionary:
\tif not FileAccess.file_exists(PATH):
\t\treturn {}
\tvar f := FileAccess.open(PATH, FileAccess.READ)
\tvar s: Dictionary = f.get_var(true)
\treturn s if s.get("version", 0) == 3 else _migrate(s)`,
    pitfall:`Writing the save to res://. It works every time in the editor and fails on every exported build, because res:// is packed read only inside the binary. It reaches players as "my progress never saves" and cannot be reproduced by the person who wrote it.`,
    map:`Godot user:// is Unity Application.persistentDataPath, and NOTIFICATION_APPLICATION_PAUSED is OnApplicationPause(true).` },
  unity:{ term:`The resume state is a serializable class written to Application.persistentDataPath. What the player meets on return is decided by what you chose to store and by which callback you chose to flush in.`,
    api:['Application.persistentDataPath','JsonUtility.ToJson() / FromJson<T>()','File.WriteAllText() / File.Exists()','MonoBehaviour.OnApplicationPause(bool)','PlayerPrefs.SetInt() / Save()','SceneManager.LoadScene()'],
    snippet:`[Serializable]
public class SaveState { public int version = 3; public string room; public float[] pos; }

public class SaveService : MonoBehaviour {
    static string Path_ => Path.Combine(Application.persistentDataPath, "save.json");
    public static SaveState Current = new();
    public static void Write() => File.WriteAllText(Path_, JsonUtility.ToJson(Current));
    public static SaveState Read() {
        if (!File.Exists(Path_)) return new SaveState();
        var s = JsonUtility.FromJson<SaveState>(File.ReadAllText(Path_));
        return s.version == 3 ? s : Migrate(s);
    }
    void OnApplicationPause(bool paused) { if (paused) Write(); }
}`,
    pitfall:`Keeping progress in PlayerPrefs. It is the registry on Windows and a plist on iOS, it is only committed on Save() or a clean quit, and a mobile OS killing a backgrounded app throws the last session away. It is right for a volume slider and wrong for anything a player would be upset to lose.`,
    map:`Unity persistentDataPath is Godot's user://, and JsonUtility plus File.WriteAllText is FileAccess.store_var.` },
  note:`This is the client half of a save. Once progress is worth money or a leaderboard place, the file becomes a cache of what a server already accepted, and the design question moves to what the client may decide alone while it is offline.` });

ENGINE('finding-an-idea',{
  godot:{ term:`The greybox is its own project, not a branch of the real one. One scene, placeholder shapes, and every number that could be wrong exported with a range so it can be moved while a stranger is playing.`,
    api:['@export_range()','CharacterBody2D / ColorRect / CSGBox3D','signal / emit()','Engine.time_scale','godot --headless --script res://sweep.gd','Input.is_action_pressed()'],
    snippet:`extends Node2D
class_name Wedge                           # one rule, nothing else in the project

signal resolved(committed: bool, held: float)
@export_range(0.0, 3.0, 0.05) var commit_window := 0.4
@export_range(1, 20) var pressure := 6
var _held := 0.0

func _physics_process(delta: float) -> void:
\tif Input.is_action_pressed("commit"):
\t\t_held += delta
\telif _held > 0.0:
\t\tresolved.emit(_held >= commit_window, _held)   # the only rule under test
\t\t_held = 0.0`,
    pitfall:`Prototyping inside the real project. The wedge inherits the autoloads, the input map, the physics tick and the camera rig of a game designed around a different idea, so a result you cannot reproduce in an empty project is not a result. The second trap is tuning through the remote inspector while playing, because those edits are never written back to the scene.`,
    map:`Godot @export_range is Unity's [Range] attribute, and --headless --script is -batchmode -executeMethod.` },
  unity:{ term:`A separate empty project with primitives and one script. [Range] fields put the tuning in the Inspector so the value can move while someone plays, and the whole thing is built to be thrown away.`,
    api:['[Range] / [SerializeField]','GameObject.CreatePrimitive()','ScriptableObject tuning asset','InputAction.IsPressed()','Time.deltaTime','-batchmode -executeMethod'],
    snippet:`public class Wedge : MonoBehaviour {          // the whole prototype, one rule
    [Range(0f, 3f)] public float commitWindow = 0.4f;
    [Range(1, 20)] public int pressure = 6;
    [SerializeField] InputActionReference commit;
    public UnityEvent<bool, float> Resolved;
    float held;
    void Update() {
        if (commit.action.IsPressed()) held += Time.deltaTime;
        else if (held > 0f) {
            Resolved.Invoke(held >= commitWindow, held);
            held = 0f;
        }
    }
}`,
    pitfall:`Tuning in Play mode and pressing stop. Every Inspector change made while playing is discarded, which is exactly when the good number was found. Copy the component values before stopping, or move the tuning onto a ScriptableObject asset, which survives because it is an asset rather than scene state.`,
    map:`Unity [Range] is Godot @export_range, and -batchmode -executeMethod is --headless --script.` } });

/* ---------------- EXPERIENCE ---------------- */

ENGINE('core-experience',{
  godot:{ term:`The experience statement becomes something you can check against a recording. A small debug autoload that grabs a screenshot and a performance line on a hotkey turns "did it feel tense" into a file two people can look at together.`,
    api:['get_viewport().get_texture().get_image()','await RenderingServer.frame_post_draw','Image.save_png()','Time.get_datetime_string_from_system()','Performance.get_monitor()','Node._unhandled_key_input()'],
    snippet:`func capture(label: String) -> void:
\tawait RenderingServer.frame_post_draw    # without this you save the previous frame
\tvar img := get_viewport().get_texture().get_image()
\tvar stamp := Time.get_datetime_string_from_system().replace(":", "-")
\timg.save_png("user://shots/%s_%s.png" % [stamp, label])
\tvar fps := Performance.get_monitor(Performance.TIME_FPS)
\tprint("[%s] %s fps=%.0f" % [stamp, label, fps])`,
    pitfall:`Calling get_viewport().get_texture().get_image() without awaiting RenderingServer.frame_post_draw. You get the previous frame or a blank image, so the capture of the moment you wanted to study is a picture of the moment before it, and nobody notices until the comparison matters.`,
    map:`Godot's viewport texture grab is Unity's ScreenCapture, and Performance.get_monitor is a ProfilerRecorder.` },
  unity:{ term:`Same idea with ScreenCapture and the Input System's event trace. The point is evidence: the target emotions get checked against a recording of what players did, not against the team's memory of the session.`,
    api:['ScreenCapture.CaptureScreenshot()','InputEventTrace / trace.WriteTo()','Application.persistentDataPath','Time.realtimeSinceStartup','Application.logMessageReceived','Debug.Break()'],
    snippet:`public class SessionProbe : MonoBehaviour {
    InputEventTrace trace;
    void OnEnable() {
        trace = new InputEventTrace { recordFrameMarkers = true };
        trace.Enable();                       // every input, with timestamps
    }
    public void Mark(string label) {
        var dir = Application.persistentDataPath;
        ScreenCapture.CaptureScreenshot($"{dir}/{label}.png");
        trace.WriteTo($"{dir}/{label}.inputtrace");
    }
    void OnDisable() => trace.Dispose();
}`,
    pitfall:`Treating CaptureScreenshot as synchronous. The file is written a frame or more later, so reading it on the next line finds nothing, and in the editor it captures the Game view at whatever size that window happens to be. Wait a frame, or render through a RenderTexture when the resolution has to be exact.`,
    map:`Unity ScreenCapture is the Godot viewport image grab, and InputEventTrace is a hand-rolled log in _input().` } });

ENGINE('fun-dimensions',{
  godot:{ term:`Dimensions get tagged live. A global key handler writes a timestamped tag while the tester plays, so the note and the moment are attached to each other instead of an observer scribbling times on paper.`,
    api:['Node._unhandled_key_input()','InputEventKey.keycode / pressed','Time.get_ticks_msec()','FileAccess.store_line() / flush()','Control.mouse_filter','get_viewport().set_input_as_handled()'],
    snippet:`const TAGS := {KEY_F5: "mastery", KEY_F6: "discovery", KEY_F7: "tension", KEY_F8: "flat"}
var _log := FileAccess.open("user://tags.csv", FileAccess.WRITE)

func _unhandled_key_input(event: InputEvent) -> void:
\tvar k := event as InputEventKey
\tif k and k.pressed and TAGS.has(k.keycode):
\t\t_log.store_line("%d,%s" % [Time.get_ticks_msec(), TAGS[k.keycode]])
\t\t_log.flush()                         # the session may end in a crash
\t\tget_viewport().set_input_as_handled()`,
    pitfall:`Putting the observer hotkey in _input() on a node under the HUD. Any focused Control with mouse_filter left at STOP consumes the event first, so tagging works in the main menu and silently stops working during play, which is the only time it matters. _unhandled_key_input runs after the UI has had its turn.`,
    map:`Godot _unhandled_key_input is Unity polling Keyboard.current after the EventSystem, and an InputMap action is an InputAction.` },
  unity:{ term:`The same tagging pass reads Keyboard.current directly, outside the game's action map, so the observer's keys cannot be rebound by a player or swallowed by gameplay.`,
    api:['Keyboard.current[Key.F5].wasPressedThisFrame','Time.realtimeSinceStartup','StreamWriter with AutoFlush','Application.persistentDataPath','EventSystem.current.currentSelectedGameObject','Application.isEditor'],
    snippet:`public class DimensionTagger : MonoBehaviour {
    static readonly (Key key, string tag)[] Tags = {
        (Key.F5, "mastery"), (Key.F6, "discovery"), (Key.F7, "tension"), (Key.F8, "flat")
    };
    StreamWriter w;
    void Awake() => w = new StreamWriter(
        Path.Combine(Application.persistentDataPath, "tags.csv"), true) { AutoFlush = true };
    void Update() {
        var kb = Keyboard.current;
        if (kb == null) return;               // no keyboard on a console build
        foreach (var (key, tag) in Tags)
            if (kb[key].wasPressedThisFrame)
                w.WriteLine($"{Time.realtimeSinceStartup:F2},{tag}");
    }
}`,
    pitfall:`Reaching for Input.GetKeyDown in a project whose Active Input Handling is set to the new Input System. It throws InvalidOperationException at runtime rather than failing to compile, so the tagging tool dies in the first playtest build. Keyboard.current is also null when no keyboard is attached, which is every console and most handhelds.`,
    map:`Unity Keyboard.current is Godot's InputEventKey in _unhandled_key_input, and Time.realtimeSinceStartup is Time.get_ticks_msec().` } });

ENGINE('goals-horizons',{
  godot:{ term:`The short goal is a marker in the world, the session goal is state on an autoload, and the long goal is in the save. The marker is the fiddly one, because a world position has to be projected into the HUD every frame.`,
    api:['Camera3D.unproject_position()','Camera3D.is_position_behind()','Marker3D / Node3D.global_position','CanvasLayer / Control.position','get_tree().get_nodes_in_group()','signal objective_completed(id)'],
    snippet:`@onready var cam: Camera3D = get_viewport().get_camera_3d()

func _process(_delta: float) -> void:
\tfor m in get_tree().get_nodes_in_group("objective_markers"):
\t\tvar icon: Control = m.icon
\t\tif cam.is_position_behind(m.global_position):
\t\t\ticon.visible = false             # otherwise it mirrors to the wrong edge
\t\t\tcontinue
\t\ticon.visible = true
\t\ticon.position = cam.unproject_position(m.global_position) - icon.size * 0.5`,
    pitfall:`Using unproject_position() without is_position_behind(). A target behind the camera projects to a perfectly plausible point on the opposite side of the screen, so the game tells the player the goal is to their left while it is directly behind them, and the bug only appears when someone turns around.`,
    map:`Godot unproject_position is Unity Camera.WorldToScreenPoint, and a CanvasLayer is a screen space Canvas.` },
  unity:{ term:`Objectives are ScriptableObject definitions, the marker is a RectTransform driven from the camera, and the session goal is whatever the HUD is allowed to say is nearly finished.`,
    api:['Camera.WorldToScreenPoint()','RectTransform / Canvas (Screen Space - Overlay)','LateUpdate()','CinemachineBrain update order','ScriptableObject objective assets','GameObject.SetActive()'],
    snippet:`public class ObjectiveMarker : MonoBehaviour {
    [SerializeField] Transform target;
    [SerializeField] RectTransform icon;
    Camera cam;
    void Awake() => cam = Camera.main;
    void LateUpdate() {                       // after the camera has moved this frame
        var sp = cam.WorldToScreenPoint(target.position);
        if (sp.z < 0f) { icon.gameObject.SetActive(false); return; }
        icon.gameObject.SetActive(true);
        icon.position = sp;
    }
}`,
    pitfall:`Positioning the marker in Update. Cinemachine moves the camera in LateUpdate, so the icon is drawn from last frame's camera and visibly swims during fast turns. The z below zero check matters for the same reason as in Godot: behind the camera, WorldToScreenPoint returns a mirrored point that looks entirely valid.`,
    map:`Unity LateUpdate is a Godot _process that runs after the camera node, and a ScriptableObject objective is an objective Resource.` } });

ENGINE('tension-release',{
  godot:{ term:`Tension is one number other systems subscribe to. Audio buses, an authored Curve and the WorldEnvironment all read it, so the rhythm is written in one place instead of being spread across triggers nobody can see together.`,
    api:['AudioServer.get_bus_index() / set_bus_volume_db()','linear_to_db() / db_to_linear()','Curve resource / Curve.sample()','create_tween() / tween_property()','WorldEnvironment / Environment.adjustment_saturation','AudioStreamPlayer.stream_paused'],
    snippet:`@export var pacing: Curve                  # authored intensity over the level
var intensity := 0.0

func set_intensity(v: float) -> void:
\tintensity = clampf(v, 0.0, 1.0)
\tvar bus := AudioServer.get_bus_index("Tension")
\tAudioServer.set_bus_volume_db(bus, linear_to_db(maxf(intensity, 0.001)))
\tvar env: Environment = $WorldEnvironment.environment
\tcreate_tween().tween_property(
\t\tenv, "adjustment_saturation", 0.6 + intensity * 0.6, 0.5)`,
    pitfall:`Passing a zero to one value straight into set_bus_volume_db(). Zero decibels is full volume, so the quiet end of the tension curve is the loudest the game ever gets and the whole rhythm inverts. linear_to_db() is the conversion, and it heads to negative infinity at zero, which is why the floor value is in the call above.`,
    map:`Godot audio buses are a Unity AudioMixer, and a Curve resource is an AnimationCurve.` },
  unity:{ term:`One intensity float drives an AudioMixer parameter and a post-processing Volume weight. Snapshots handle the big shifts between calm and combat, the exposed parameter handles the gradient inside each of them.`,
    api:['AudioMixer.SetFloat() on an exposed parameter','AudioMixerSnapshot.TransitionTo()','Mathf.Log10() for the dB conversion','Volume.weight (URP or HDRP)','AnimationCurve.Evaluate()','Mathf.SmoothDamp()'],
    snippet:`public class TensionDirector : MonoBehaviour {
    [SerializeField] AudioMixer mixer;
    [SerializeField] Volume dangerPost;
    [SerializeField] AnimationCurve pacing;
    public void SetIntensity(float t) {
        t = Mathf.Clamp01(t);
        float db = t <= 0.0001f ? -80f : Mathf.Log10(t) * 20f;   // linear to dB
        mixer.SetFloat("TensionVolume", db);
        dangerPost.weight = pacing.Evaluate(t);
    }
}`,
    pitfall:`Mixing SetFloat with snapshot transitions on the same knob. A snapshot owns every parameter it was saved with, so it overwrites the value you just set and the tension curve goes flat for the length of the transition. Pick one owner per parameter: snapshots for state changes, SetFloat for the gradient, never both.`,
    map:`A Unity AudioMixer is Godot's audio bus layout, and a Volume weight is the WorldEnvironment's environment.` } });

ENGINE('mastery-discovery-expression',{
  godot:{ term:`Mastery becomes visible when the game can replay it. Record the input stream on the physics tick with a seeded generator and the same inputs reproduce the run, which is where ghosts, personal bests and honest proof of improvement come from.`,
    api:['RandomNumberGenerator.new() / .seed','_physics_process(delta)','Input.is_action_pressed()','PackedInt32Array','Engine.physics_ticks_per_second','FileAccess.store_var()'],
    snippet:`var rng := RandomNumberGenerator.new()
var tape := PackedInt32Array()             # one input bitmask per physics tick

func start_run(run_seed: int) -> void:
\trng.seed = run_seed                      # same seed, same run, or there is no ghost
\ttape.clear()

func _physics_process(_delta: float) -> void:
\tvar bits := 0
\tfor i in ACTIONS.size():
\t\tif Input.is_action_pressed(ACTIONS[i]):
\t\t\tbits |= 1 << i
\ttape.append(bits)                        # replay feeds this back instead of Input`,
    pitfall:`Recording on _process instead of _physics_process. The tape then holds a variable number of entries per second, so a replay on a 144 Hz machine desynchronises from a run captured at 60 and the ghost walks through a wall. Any randf() taken from the global generator breaks it the same way, which is why the run owns its own RandomNumberGenerator.`,
    map:`A Godot RandomNumberGenerator instance is a System.Random in Unity, and a physics tick tape is a FixedUpdate tape.` },
  unity:{ term:`Same tape, recorded in FixedUpdate. Unity's extra trap is having two random APIs: UnityEngine.Random is a single global stream shared with everything else in the project, so a replayable run needs its own System.Random.`,
    api:['FixedUpdate() / Time.fixedDeltaTime','System.Random per run','UnityEngine.Random.InitState()','InputAction.IsPressed()','BinaryWriter / Application.persistentDataPath','Animator.StartRecording() / playbackTime'],
    snippet:`public class RunRecorder : MonoBehaviour {
    readonly List<int> tape = new();
    System.Random rng;                        // not UnityEngine.Random
    [SerializeField] InputActionReference[] actions;
    public void StartRun(int seed) {
        rng = new System.Random(seed);
        tape.Clear();
    }
    void FixedUpdate() {                      // fixed step, or the ghost drifts
        int bits = 0;
        for (int i = 0; i < actions.Length; i++)
            if (actions[i].action.IsPressed()) bits |= 1 << i;
        tape.Add(bits);
    }
}`,
    pitfall:`Using UnityEngine.Random for anything a replay must reproduce. It is one static stream, so a piece of ambient flavour calling Random.value shifts every later roll and the ghost diverges for a reason that is invisible in the diff. Give each replayable system its own System.Random seeded from the run.`,
    map:`Unity FixedUpdate is Godot _physics_process, and System.Random per system is a RandomNumberGenerator instance.` } });

ENGINE('social-experience',{
  godot:{ term:`Relatedness needs the other player's act to arrive. Godot's high level multiplayer splits that into two tools: @rpc for acts and MultiplayerSynchronizer for state, and the design question is which of the two each social moment is.`,
    api:['ENetMultiplayerPeer.create_server() / create_client()','@rpc("any_peer", "call_local", "reliable")','multiplayer.get_remote_sender_id()','MultiplayerSynchronizer / MultiplayerSpawner','multiplayer.peer_connected signal','Node.set_multiplayer_authority()'],
    snippet:`@rpc("any_peer", "call_local", "reliable")
func cheer(target_id: int) -> void:
\tvar from := multiplayer.get_remote_sender_id()   # never trust the argument
\tif from == 0 or not _players.has(from):
\t\treturn
\t_players[target_id].show_cheer_from(from)

func _ready() -> void:
\tmultiplayer.peer_connected.connect(
\t\tfunc(id: int) -> void: _spawn_player(id))`,
    pitfall:`Marking an RPC any_peer and then trusting its arguments. Any connected client can call it with any id, so a cheer becomes a way to puppet other players. The quieter trap is routing: RPCs are matched by node path, so two peers whose scene trees differ by one node deliver nothing at all and log almost nothing.`,
    map:`Godot @rpc is a Unity Rpc attribute in Netcode, and MultiplayerSynchronizer is a set of NetworkVariables.` },
  unity:{ term:`Netcode for GameObjects splits the same two things: an Rpc for the act, a NetworkVariable for the state everyone must agree on. Who may write each one is a permission on the variable rather than a convention in a code review.`,
    api:['NetworkBehaviour / NetworkObject','[Rpc(SendTo.Server)] / RpcParams.Receive.SenderClientId','NetworkVariable<T> read and write permissions','NetworkManager.Singleton.ConnectedClients','RpcTarget.Single() / RpcTargetUse.Temp','IsOwner / IsServer'],
    snippet:`public class SocialActs : NetworkBehaviour {
    readonly NetworkVariable<int> cheers = new(0,
        NetworkVariableReadPermission.Everyone,
        NetworkVariableWritePermission.Server);

    [Rpc(SendTo.Server)]
    public void CheerRpc(ulong targetId, RpcParams p = default) {
        var from = p.Receive.SenderClientId;
        if (!NetworkManager.ConnectedClients.ContainsKey(from)) return;
        cheers.Value++;                       // only the server may write this
        ShowCheerRpc(from, RpcTarget.Single(targetId, RpcTargetUse.Temp));
    }
}`,
    pitfall:`Writing a NetworkVariable from a client. The default write permission is Server, so the assignment is rejected with a warning and the local value silently reverts on the next tick, which players read as lag rather than as a permission error. Decide ownership per variable and let clients ask through an Rpc.`,
    map:`A Unity NetworkVariable is a Godot MultiplayerSynchronizer property, and SendTo.Server is an @rpc called on the authority.` },
  note:`Both engines hand you a transport and no judgement. The moment the social act carries a reward, authority moves to a server you run, and the client's job shrinks to showing what the server already decided.` });

ENGINE('feature-vs-experience',{
  godot:{ term:`A feature that cannot be switched off cannot be tested against the behaviour it promised. Keep it in its own PackedScene behind one runtime flag, so the A build and the B build differ by a single instantiate call and nothing else.`,
    api:['PackedScene.instantiate() / Node.queue_free()','ConfigFile.load() / get_value()','ProjectSettings.get_setting()','OS.has_feature() with export tags','Node.add_child() / remove_child()','preload()'],
    snippet:`const CRAFTING := preload("res://features/crafting.tscn")
var _crafting: Node

func _ready() -> void:
\tif _flag("crafting"):
\t\t_crafting = CRAFTING.instantiate()
\t\tadd_child(_crafting)

func _flag(key: String) -> bool:
\tvar cfg := ConfigFile.new()              # a local file beats a rebuild
\tif cfg.load("user://flags.cfg") == OK:
\t\treturn cfg.get_value("features", key, false)
\treturn ProjectSettings.get_setting("features/" + key, false)`,
    pitfall:`Gating with OS.has_feature(). Feature tags are declared on the export preset, so the editor and the build take different branches and the behaviour you measured is not the one that shipped. A flag read from a file can be flipped by whoever is running the playtest, which is the whole point of having it.`,
    map:`Godot custom export feature tags are Unity scripting define symbols, and a PackedScene behind a flag is a prefab behind a flag.` },
  unity:{ term:`The same rule, with one extra warning: #if is not a toggle. Code compiled out is not compiled at all, so the disabled branch rots quietly until the day somebody flips the define.`,
    api:['ScriptableObject flag asset / [SerializeField] bool','Instantiate(prefab) / GameObject.SetActive()','PlayerSettings scripting define symbols','#if UNITY_EDITOR for editor code','Addressables.InstantiateAsync()','Application.isEditor'],
    snippet:`[CreateAssetMenu(menuName = "Design/Feature Flags")]
public class FeatureFlags : ScriptableObject {
    public bool crafting;
    public bool trading;
}

public class FeatureHost : MonoBehaviour {
    [SerializeField] FeatureFlags flags;
    [SerializeField] GameObject craftingPrefab;
    void Start() {
        // the off build differs by this one call, so a behaviour delta is attributable
        if (flags.crafting) Instantiate(craftingPrefab, transform);
    }
}`,
    pitfall:`Using #if FEATURE_CRAFTING for a design toggle. The off branch never reaches the compiler, so it drifts out of sync with the code around it and breaks only in the build where it is on. Worse, the two builds then differ in more than the feature, and any behaviour difference you measure is unattributable. Keep #if for editor and platform code.`,
    map:`A Unity scripting define is a Godot export feature tag, and a ScriptableObject flag asset is a ConfigFile or a ProjectSettings key.` } });

ENGINE('design-pillars',{
  godot:{ term:`A pillar only holds if something fails when it is broken. A script that walks every level scene and asserts the rule turns creative direction into a headless check anyone can run before they push.`,
    api:['extends SceneTree with godot --headless --script','DirAccess.get_files_at()','load() on a PackedScene / instantiate()','Node.find_children()','push_error() / push_warning()','SceneTree.quit(exit_code)'],
    snippet:`extends SceneTree                          # godot --headless --script res://tools/pillars.gd

func _init() -> void:
\tvar bad := 0
\tfor f in DirAccess.get_files_at("res://levels"):
\t\tvar scene: Node = load("res://levels/%s" % f).instantiate()
\t\t# pillar: every room has a way out that does not require combat
\t\tif scene.find_children("*", "EscapeRoute").is_empty():
\t\t\tpush_error("%s violates the escape pillar" % f)
\t\t\tbad += 1
\tquit(1 if bad > 0 else 0)`,
    pitfall:`Writing the checker as a @tool script on a game node without guarding with Engine.is_editor_hint(). _ready then runs inside the editor, spawns real gameplay objects into the open scene and saves them with it. Editor-time code and runtime code share one file in Godot, and that guard is the only thing separating them.`,
    map:`A Godot @tool script is a Unity [ExecuteAlways] component, and --headless --script is -batchmode -executeMethod.` },
  unity:{ term:`The same check runs as an EditMode test or a build preprocessor. OnValidate catches a broken rule while the designer is still in the Inspector, which is the cheapest place to catch anything.`,
    api:['IPreprocessBuildWithReport.OnPreprocessBuild()','BuildFailedException','AssetDatabase.FindAssets() / GUIDToAssetPath()','MonoBehaviour.OnValidate()','[Test] EditMode tests with NUnit','#if UNITY_EDITOR'],
    snippet:`#if UNITY_EDITOR
public class PillarCheck : IPreprocessBuildWithReport {
    public int callbackOrder => 0;
    public void OnPreprocessBuild(BuildReport report) {
        foreach (var guid in AssetDatabase.FindAssets("t:Prefab", new[] { "Assets/Rooms" })) {
            var path = AssetDatabase.GUIDToAssetPath(guid);
            var room = AssetDatabase.LoadAssetAtPath<GameObject>(path);
            if (room.GetComponentInChildren<EscapeRoute>() == null)
                throw new BuildFailedException($"{path} violates the escape pillar");
        }
    }
}
#endif`,
    pitfall:`Letting editor-only code reach a runtime assembly. One using UnityEditor outside an Editor folder and outside #if UNITY_EDITOR compiles fine in the editor and fails the player build, usually on the build machine and usually at the worst moment. Put the checks in an editor assembly and keep the runtime side clean.`,
    map:`A Unity build preprocessor is a Godot EditorScript run headless, and OnValidate is the setter behind an @export property.` } });

/* ---------------- CORE GAMEPLAY ---------------- */

ENGINE('decisions',{
  godot:{ term:`A decision in the engine is two things: the options as data, and a path that actually delivers the answer. The second one is where prototypes lose the decision, because a Control higher in the tree eats the click before it arrives.`,
    api:['Control.mouse_filter (STOP / PASS / IGNORE)','Button.pressed signal / ButtonGroup','Callable.bind()','Control.grab_focus() / focus_neighbor','Resource option definitions','Input.is_action_just_pressed("ui_accept")'],
    snippet:`@export var options: Array[OptionDef] = []   # label, cost and effect live in data

func present() -> void:
\tfor child in %Options.get_children():
\t\tchild.queue_free()
\tfor opt in options:
\t\tvar b := Button.new()
\t\tb.text = "%s  (-%d)" % [opt.label, opt.cost]   # the trade-off is on the button
\t\tb.pressed.connect(_choose.bind(opt))
\t\t%Options.add_child(b)
\t%Options.get_child(0).grab_focus()       # a pad must be able to answer too`,
    pitfall:`A full screen Control sitting above the options with mouse_filter left at the default STOP. It is invisible and it swallows every click, so the decision is unreachable and the playtest records a player who never chose. Set decorative overlays to IGNORE, and give the first option focus so a pad or keyboard can answer at all.`,
    map:`Godot mouse_filter is Unity's Raycast Target checkbox, and grab_focus() is EventSystem.SetSelectedGameObject().` },
  unity:{ term:`Options are ScriptableObject definitions and the buttons are generated from them, so the cost printed on the button comes from the same field the rules read and a balance change cannot leave the UI lying.`,
    api:['ScriptableObject option assets','Button.onClick.AddListener()','EventSystem.SetSelectedGameObject()','Graphic.raycastTarget','CanvasGroup.blocksRaycasts','TMP_Text.SetText()'],
    snippet:`public class ChoicePanel : MonoBehaviour {
    [SerializeField] OptionDef[] options;     // ScriptableObject: label, cost, effect
    [SerializeField] Button template;
    public void Present() {
        foreach (var opt in options) {
            var b = Instantiate(template, template.transform.parent);
            b.GetComponentInChildren<TMP_Text>().SetText($"{opt.label}  (-{opt.cost})");
            b.onClick.AddListener(() => Choose(opt));
            b.gameObject.SetActive(true);
        }
        EventSystem.current.SetSelectedGameObject(
            template.transform.parent.GetChild(0).gameObject);
    }
}`,
    pitfall:`A full screen Image left with Raycast Target ticked. It blocks the buttons underneath and the only symptom is that nothing happens, which testers report as the game freezing. Untick Raycast Target on anything decorative, and use CanvasGroup.blocksRaycasts when a panel is meant to block on purpose.`,
    map:`Unity CanvasGroup.blocksRaycasts is a parent Control's mouse_filter, and onClick is the pressed signal.` } });

ENGINE('risk-reward',{
  godot:{ term:`The odds live in code and the player's estimate of them is a separate design artefact. Give the roll its own RandomNumberGenerator so an outcome is reproducible from a bug report, and telegraph the risk with something readable before the commit.`,
    api:['RandomNumberGenerator.new() / .seed / .randf()','randf_range() / randi_range()','signal roll_resolved(success, margin)','Curve for pricing the risk','create_tween() for the telegraph','hash() for a per-system seed'],
    snippet:`var rng := RandomNumberGenerator.new()
signal roll_resolved(success: bool, margin: float)

func _ready() -> void:
\trng.seed = hash("risk") ^ Run.seed       # its own stream, reproducible later

func attempt(chance: float, payoff: int, fail_cost: int) -> void:
\tvar roll := rng.randf()
\tvar success := roll < chance
\troll_resolved.emit(success, absf(roll - chance))
\tWallet.apply(&"gold", payoff if success else -fail_cost, "risk point")`,
    pitfall:`Calling the global randf() for gameplay rolls. Every system shares that one stream, so adding an ambient effect that rolls once a second changes every combat outcome, and "it happened at 3:12 on seed 41" stops being reproducible. One generator per system that has to be replayable.`,
    map:`A Godot RandomNumberGenerator instance is a System.Random in Unity, and randi_range is Random.Range with an inclusive maximum.` },
  unity:{ term:`Same split between the roll and the telegraph. The Unity detail that costs a day is the range convention: the integer overload excludes its maximum and the float overload includes it.`,
    api:['System.Random per system','UnityEngine.Random.Range(int,int) exclusive max','UnityEngine.Random.Range(float,float) inclusive max','UnityEngine.Random.InitState()','AnimationCurve for pricing the risk','UnityEvent<bool,float>'],
    snippet:`public class RiskPoint : MonoBehaviour {
    System.Random rng;                        // its own stream
    public UnityEvent<bool, float> Resolved;
    void Awake() => rng = new System.Random(RunSeed.Value ^ 0x5115);
    public void Attempt(float chance, int payoff, int failCost) {
        float roll = (float)rng.NextDouble();
        bool success = roll < chance;
        Resolved.Invoke(success, Mathf.Abs(roll - chance));
        Wallet.Apply("gold", success ? payoff : -failCost, "risk point");
    }
    // Random.Range(0, 100) never returns 100. Random.Range(0f, 100f) can.
}`,
    pitfall:`Reading Random.Range(0, 100) as a percentile that includes 100. The integer overload excludes its maximum and the float overload includes it, so a one in a hundred event is either impossible or twice as likely as intended depending on which overload you happened to type. It is the most common silently wrong line in tuning code.`,
    map:`A Unity System.Random per system is a Godot RandomNumberGenerator instance, and Random.value is randf().` } });

ENGINE('agency-and-emergence',{
  godot:{ term:`Emergence needs systems that can affect each other without knowing each other. Groups and signals are Godot's answer: a fire announces that it is burning, and whoever cares reacts, including systems written months later.`,
    api:['Node.add_to_group() / is_in_group()','SceneTree.call_group_flags(SceneTree.GROUP_CALL_DEFERRED, ...)','signal / Callable / connect()','Object.has_method()','Area2D.body_entered / area_entered','Node.call_deferred()'],
    snippet:`func ignite(at: Vector2, heat: float) -> void:
\t# deferred: never mutate bodies in the middle of the physics step
\tget_tree().call_group_flags(
\t\tSceneTree.GROUP_CALL_DEFERRED, "flammable", "on_heat", at, heat)

func on_heat(at: Vector2, heat: float) -> void:   # on every flammable node
\tif global_position.distance_to(at) > heat * 8.0:
\t\treturn
\tif has_method("panic"):                  # the AI reacts to the same event
\t\tcall("panic", at)
\t_burn()`,
    pitfall:`Calling a group directly from inside a physics callback. call_group runs immediately, so nodes are freed and bodies are moved while the physics server is mid step, and the crash arrives three frames later somewhere unrelated. GROUP_CALL_DEFERRED costs one frame and buys a game you can debug.`,
    map:`Godot groups are Unity tags plus a registry, and a deferred group call is an event queued and drained next frame.` },
  unity:{ term:`The same decoupling is usually a ScriptableObject event channel: the emitter raises the asset, listeners subscribe in OnEnable. Systems added later hear the event without anyone editing the emitter.`,
    api:['ScriptableObject event channel + Action<T>','OnEnable / OnDisable subscription','Physics.OverlapSphere() / LayerMask','GetComponents<IHeatable>()','Enter Play Mode Options (domain reload)','MissingReferenceException'],
    snippet:`[CreateAssetMenu(menuName = "Events/Heat")]
public class HeatChannel : ScriptableObject {
    public event Action<Vector3, float> Raised;
    public void Raise(Vector3 at, float heat) => Raised?.Invoke(at, heat);
}

public class Flammable : MonoBehaviour {
    [SerializeField] HeatChannel heat;
    void OnEnable() => heat.Raised += OnHeat;
    void OnDisable() => heat.Raised -= OnHeat;   // the asset outlives the scene
    void OnHeat(Vector3 at, float h) {
        if ((transform.position - at).sqrMagnitude < h * h * 64f) Burn();
    }
}`,
    pitfall:`Subscribing in OnEnable and forgetting OnDisable. The channel is an asset, not a scene object, so its delegate list survives a scene load and, with Domain Reload disabled, survives leaving Play mode. The event then fires into destroyed objects and throws MissingReferenceException in a build nobody can reproduce in the editor.`,
    map:`A Unity ScriptableObject event channel is a Godot autoload with signals, and OverlapSphere is an Area with a collision mask.` } });

ENGINE('challenge-failure-recovery',{
  godot:{ term:`Recovery time is a loading problem as much as a design one. reload_current_scene() is the honest measure of your retry loop, and anything that survives it is state you have to reset by hand.`,
    api:['get_tree().reload_current_scene()','SceneTree.change_scene_to_packed()','ResourceLoader.load_threaded_request()','Autoload for checkpoint state','Time.get_ticks_msec()','await get_tree().process_frame'],
    snippet:`func die() -> void:
\tvar t0 := Time.get_ticks_msec()
\tCheckpoint.restore()                     # autoload state, survives the reload
\tget_tree().reload_current_scene()
\tawait get_tree().process_frame
\tprint("retry took %d ms" % (Time.get_ticks_msec() - t0))

# on the Checkpoint autoload
func restore() -> void:
\tammo = saved_ammo
\tstatus_effects.clear()                   # anything not reset here leaks into the retry`,
    pitfall:`Assuming reload_current_scene() resets everything. Autoloads keep running and keep their values, so a buff, a timer or a music state from the failed attempt leaks into the retry and the second attempt is a different game from the first. The opposite mistake costs more: reloading a large scene to retry a five second challenge turns a two second lesson into a fifteen second wait.`,
    map:`Godot reload_current_scene is SceneManager.LoadScene on the active scene, and an autoload is a DontDestroyOnLoad singleton.` },
  unity:{ term:`Retry is either a scene reload or a reset of the handful of objects that matter. Past a certain scene size the reload is the reason players stop retrying, and pooling the encounter is what buys the fast loop back.`,
    api:['SceneManager.LoadScene() / LoadSceneAsync()','SceneManager.GetActiveScene().buildIndex','LoadSceneMode.Additive','DontDestroyOnLoad() duplicates','UnityEngine.Pool.ObjectPool<T>','Time.realtimeSinceStartup'],
    snippet:`public class RetryService : MonoBehaviour {
    [SerializeField] EncounterPool pool;      // reset beats reload for a small fight
    public float LastRetrySeconds { get; private set; }
    public void Retry(bool fullReload) {
        float t0 = Time.realtimeSinceStartup;
        if (fullReload)
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
        else
            pool.ResetAll();                  // same result, a fraction of the cost
        LastRetrySeconds = Time.realtimeSinceStartup - t0;
    }
}`,
    pitfall:`Reloading the scene while DontDestroyOnLoad objects are still alive. The boot object, the audio service and the input service are created again by the reloaded scene, so every retry leaves another copy behind: the third death has three audio listeners and the tenth is audibly wrong. Guard those singletons, or keep them in an additive scene that is never reloaded.`,
    map:`Unity SceneManager.LoadScene is reload_current_scene, and UnityEngine.Pool is a preallocated set of nodes with processing disabled.` } });

ENGINE('skill-and-mastery',{
  godot:{ term:`The skill floor is set by windows the player never sees: coyote time after leaving a ledge, a buffered press just before landing. Both are counters on the physics tick, and is_on_floor() only tells the truth after move_and_slide() has run.`,
    api:['CharacterBody2D.move_and_slide() / is_on_floor()','Input.is_action_just_pressed()','_physics_process(delta)','get_floor_normal()','@export for the window sizes','Engine.physics_ticks_per_second'],
    snippet:`@export var coyote := 0.12
@export var buffer := 0.10
var _coyote_left := 0.0
var _buffer_left := 0.0

func _physics_process(delta: float) -> void:
\tif Input.is_action_just_pressed("jump"):
\t\t_buffer_left = buffer
\t_buffer_left = maxf(_buffer_left - delta, 0.0)
\tmove_and_slide()                         # is_on_floor() is stale until this runs
\t_coyote_left = coyote if is_on_floor() else maxf(_coyote_left - delta, 0.0)
\tif _buffer_left > 0.0 and _coyote_left > 0.0:
\t\tvelocity.y = JUMP_SPEED
\t\t_buffer_left = 0.0
\t\t_coyote_left = 0.0`,
    pitfall:`Reading is_on_floor() before calling move_and_slide(). The flag is only updated by the move, so on the first tick after a landing it still reports airborne and the buffered jump is eaten. Players describe this as the jump not registering, which sends the team to the input code where nothing is wrong.`,
    map:`Godot is_on_floor() after move_and_slide() is CharacterController.isGrounded after Move().` },
  unity:{ term:`Same two windows, same trap in a different place: CharacterController.isGrounded only reflects the last Move, so a grounded check stays honest by keeping a small constant downward velocity.`,
    api:['CharacterController.Move() / isGrounded','InputAction.WasPressedThisFrame()','Time.deltaTime','Physics.gravity','Physics.CheckSphere() as a ground probe','Animator.CrossFadeInFixedTime()'],
    snippet:`public class JumpWindows : MonoBehaviour {
    [SerializeField] float coyote = 0.12f, buffer = 0.10f, jumpSpeed = 7f;
    [SerializeField] InputActionReference jump;
    CharacterController cc;
    float coyoteLeft, bufferLeft, vy;
    void Update() {
        if (jump.action.WasPressedThisFrame()) bufferLeft = buffer;
        bufferLeft = Mathf.Max(bufferLeft - Time.deltaTime, 0f);
        vy = cc.isGrounded && vy < 0f ? -2f : vy + Physics.gravity.y * Time.deltaTime;
        coyoteLeft = cc.isGrounded ? coyote : Mathf.Max(coyoteLeft - Time.deltaTime, 0f);
        if (bufferLeft > 0f && coyoteLeft > 0f) { vy = jumpSpeed; bufferLeft = coyoteLeft = 0f; }
        cc.Move(new Vector3(0f, vy, 0f) * Time.deltaTime);   // isGrounded updates here
    }
}`,
    pitfall:`Letting vertical velocity sit at exactly zero while grounded. isGrounded is computed from the last Move, so with no downward push it flickers false for a frame on slopes and stairs, coyote time restarts constantly and the jump feels random. The small constant downward velocity is why the minus two is there.`,
    map:`Unity CharacterController.isGrounded is Godot is_on_floor(), and WasPressedThisFrame is is_action_just_pressed().` } });

/* ---------------- SYSTEMS ---------------- */

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
    pitfall:`Renaming a serialized field without [FormerlySerializedAs]. Unity matches by name, so every asset silently reverts that field to its default and the loss shows up as a balance regression weeks later. Changing a field's type does the same thing even when the name matches.`,
    map:`A Unity ScriptableObject is a Godot Resource, and [FormerlySerializedAs] is a _set() shim for the old property name.` } });

ENGINE('depth-vs-complexity',{
  godot:{ term:`Complexity has a file size. Every @export lands in every scene and resource that uses the script, every piece of new state lands in the save, and every branch needs a headless check to stay honest.`,
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
    pitfall:`Adding a rule as one more @export on the same script. It costs nothing to type and it is now in every saved scene that uses the script, in every save file that serialises the node, and in the inspector of everyone who opens it. Removing it later leaves stale keys that Godot ignores in silence, so the clean-up never feels finished.`,
    map:`get_property_list() is Unity's SerializedObject iteration, and a .tres knob count is a ScriptableObject's serialized field count.` },
  unity:{ term:`The same count, read through the serialization layer. Unity's multiplier is prefabs: a field added to a component used by four hundred prefabs is four hundred places where the value can drift from the one you intended.`,
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
    pitfall:`Tuning on a prefab instance in a scene instead of on the prefab or the ScriptableObject. Each edit becomes a property override that is invisible unless you go looking, so the rule has one value in the asset and another in the four scenes somebody touched, and the balance conversation is about numbers nobody is actually playing.`,
    map:`Unity prefab property overrides are a Godot scene instance overriding an exported value, with a revert arrow in both editors.` } });

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
    pitfall:`Reading get_overlapping_bodies() in _ready or on the frame something spawned. The physics server has not run yet, so the list is empty and the interaction you designed simply does not happen for new objects. Await get_tree().physics_frame first, and remember layers and masks are not symmetric: A sees B when B's layer is in A's mask.`,
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
  unity:{ term:`The same single chokepoint, with a serialization warning attached: the obvious structure for a multi-currency wallet is a Dictionary, and Unity's built-in JSON cannot serialize one.`,
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
    pitfall:`Reading a sweep at a high timeScale as if it were real play. FixedUpdate gets at most maximumDeltaTime of work per frame, so above that ratio physics steps are dropped, agents cover more ground per step and the difficulty you measured is not the one players meet. Clamp the scale, then confirm one run at normal speed matches.`,
    map:`Unity Time.timeScale is Engine.time_scale, and Time.maximumDeltaTime is max_physics_steps_per_frame expressed as a time budget.` } });

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
    pitfall:`Writing cooldowns or charges onto the ItemDef that came out of load(). Resources are cached by path, so every entity holding that item shares one object: the boss's sword cools down when the player swings, and in the editor the mutation is written back into the .tres. duplicate(true) at equip time is the entire fix.`,
    map:`Resource.duplicate is Unity's Instantiate on a ScriptableObject, and a typed Array[ItemDef] is an ItemDef[] field.` },
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

/* ---------------- CONTENT ---------------- */

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
