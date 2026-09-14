/* =====================================================================
   ENGINE VIEWS (part B1): level, ux, narrative, presentation, product.
   Same shape and rules as 30-data-engine-a.js:
     ENGINE('topic-id',{ godot:{term,api:[],snippet,pitfall,map},
                         unity:{term,api:[],snippet,pitfall,map}, note:'' })
   Godot 4.x and Unity 6 / 2022 LTS. Real node, class and method names
   only. One snippet of at most 15 lines. One engine-specific pitfall.

   Topics this file owns (28):
     level         level-structure, pacing, spatial-composition,
                   encounter-design
     ux            ux-as-design, readability-and-hierarchy,
                   feedback-and-affordance, onboarding,
                   controls-and-friction, accessibility
     narrative     premise-and-world, ludonarrative-alignment,
                   environmental-storytelling, narrative-agency,
                   narrative-pacing
     presentation  visual-language, game-feel-and-juice, audio-and-music,
                   animation-and-vfx
     product       audience-and-positioning, platform-and-session,
                   business-model, scope-control, learning-from-success,
                   launch-and-discoverability, live-operations,
                   localization-and-culture, ethics-and-responsibility
   ===================================================================== */

/* ---------- level ------------------------------------------------- */

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
    pitfall:`Authoring the whole level as one .tscn. Every beat then lives in one file, so two designers cannot work on it at once, the diff is unreadable, and testing "what if the twist came before the test" is a manual node drag instead of swapping two array entries. The structure you are trying to iterate on becomes the thing that is hardest to change.`,
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
    pitfall:`Forgetting SetActiveScene after an additive load. Everything Instantiate creates goes into the active scene, so enemies and pickups for beat four keep accumulating in the bootstrap scene and survive the unload. The level leaks objects across beats and the rest beat is quietly full of the master beat's leftovers.`,
    map:`Unity additive scenes plus SetActiveScene are Godot PackedScene instancing under one parent node.` }});

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
    pitfall:`Leaving a pacing Timeline on DirectorUpdateMode.GameTime while the combat code scales Time.timeScale for hit-stop. Every hit stretches the pacing clock, so a busy fight pushes the whole level's curve later and the rest beat arrives minutes after it was planned. Drive pacing from unscaled time, or from a clock the gameplay owns explicitly.`,
    map:`A Unity Timeline signal track is a Godot AnimationPlayer method call track.` }});

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
    pitfall:`Baking NavigationRegion3D over a CSG blockout. The NavigationMesh defaults to parsing MeshInstance3D nodes, and CSGBox3D is not one, so the bake comes back empty or covers only the imported art. Agents refuse the routes you composed and it reads as an AI bug. Set the parsed geometry type to static colliders or both, and rebake after every blockout move.`,
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
    pitfall:`Calling add_child() directly inside a body_entered handler. That signal fires while the physics server is flushing queries, so adding or freeing bodies there throws "Can't change this state while flushing queries" and the wave never spawns. Defer the spawn with call_deferred and the same code works.`,
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
    pitfall:`Spawning agents at a marker that is slightly off the NavMesh. NavMeshAgent.isOnNavMesh stays false, the agent never moves and never errors, and the encounter reads as broken enemy AI when it is a spawn-point bug. Sample the position first, or Warp the agent onto the mesh after instantiating.`,
    map:`Unity ScriptableObject wave assets plus NavMesh sampling are Godot wave Resources plus NavigationAgent3D.` }});

/* ---------- ux ---------------------------------------------------- */

ENGINE('ux-as-design',{
  godot:{ term:`UI is a Control tree under a CanvasLayer, styled by one shared Theme resource. Each widget subscribes to the system whose decision it supports and removes itself when that decision is not available.`,
    api:['CanvasLayer','Control anchors, size_flags, MarginContainer / VBoxContainer','Theme resource + theme_type_variation','Control.mouse_filter (STOP, PASS, IGNORE)','Signal.connect()','Control.visibility_changed'],
    snippet:`extends MarginContainer                        # a HUD element, not a backdrop
@export var state: Node                        # the system whose decision this supports

func _ready() -> void:
\tmouse_filter = Control.MOUSE_FILTER_IGNORE # do not eat clicks meant for the world
\tstate.ability_ready.connect(_on_ready_changed)
\t_on_ready_changed(state.is_ability_ready())

func _on_ready_changed(ready: bool) -> void:
\tvisible = ready                            # no decision available, no element on screen`,
    pitfall:`Leaving mouse_filter at its default on layout containers. Control defaults to MOUSE_FILTER_STOP, so a full-rect MarginContainer used as a HUD frame silently swallows every click meant for the world underneath. The world stops responding and nothing in the input code looks wrong, because the event never reached it.`,
    map:`Godot Control nodes under a CanvasLayer with a Theme are Unity uGUI under a Canvas with a CanvasScaler, or UI Toolkit's UIDocument with USS.` },
  unity:{ term:`uGUI Canvas with a CanvasScaler for world-facing HUD, or UI Toolkit UIDocument with USS for menus. Raycast targets are switched off on anything decorative, and CanvasGroup carries the "available" state.`,
    api:['Canvas + CanvasScaler + GraphicRaycaster','EventSystem','Graphic.raycastTarget','CanvasGroup.alpha / interactable / blocksRaycasts','UIDocument + VisualElement + USS','UnityEvent'],
    snippet:`public class AbilityHud : MonoBehaviour {
    [SerializeField] Image icon;               // the only Raycast Target in this widget
    [SerializeField] CanvasGroup group;
    [SerializeField] AbilityState state;

    void OnEnable() => state.ReadyChanged.AddListener(SetReady);
    void OnDisable() => state.ReadyChanged.RemoveListener(SetReady);

    void SetReady(bool ready) {
        group.alpha = ready ? 1f : 0f;
        group.blocksRaycasts = ready;          // invisible must also mean unclickable
    }
}`,
    pitfall:`Leaving Raycast Target on by default for every Image and Text. A fullscreen decorative frame blocks input to everything beneath it, and every remaining graphic costs a raycast per pointer event, which is measurable on mobile. Switch it off on anything that is not itself a button, and fade with CanvasGroup.alpha rather than leaving an invisible interactive panel in the way.`,
    map:`Unity uGUI graphics with raycastTarget are Godot Control nodes with mouse_filter.` }});

ENGINE('readability-and-hierarchy',{
  godot:{ term:`Hierarchy is font size and colour set once in a Theme, not per label. The squint and desaturation tests are a debug CanvasLayer holding a full-rect ColorRect with a screen-reading canvas_item shader.`,
    api:['Theme.default_font_size / theme_type_variation','CanvasLayer.layer','ColorRect + ShaderMaterial','hint_screen_texture + SCREEN_UV in a canvas_item shader','ProjectSettings display/window/stretch/mode = canvas_items','Control.add_theme_font_size_override()'],
    snippet:`extends CanvasLayer                              # layer 128, above every HUD element
@onready var _tint: ColorRect = $Desaturate      # full rect, mouse_filter = IGNORE
# desaturate.gdshader:
#   shader_type canvas_item;
#   uniform sampler2D screen_tex : hint_screen_texture;
#   void fragment(){
#     vec3 c = texture(screen_tex, SCREEN_UV).rgb;
#     COLOR = vec4(vec3(dot(c, vec3(0.299, 0.587, 0.114))), 1.0);
#   }

func _unhandled_input(e: InputEvent) -> void:
\tif e.is_action_pressed("debug_desaturate"):
\t\t_tint.visible = not _tint.visible        # the squint test, on the target device`,
    pitfall:`Shipping with the stretch mode set to viewport when the target is a phone. Viewport stretch scales the whole rendered image, so UI text is rasterised at the low internal resolution and then blown up, and the label that was crisp in the editor is a smear on device. canvas_items stretch scales layout while leaving fonts to render at native resolution.`,
    map:`A Godot Theme resource plus the project stretch mode is a Unity CanvasScaler plus shared TMP style assets.` },
  unity:{ term:`Sizes come from the ranking you assigned, set explicitly on TextMeshPro labels. The desaturation test is a URP Volume with Color Adjustments saturation at minus one hundred, toggled by weight.`,
    api:['CanvasScaler.ScaleWithScreenSize + referenceResolution + matchWidthOrHeight','TextMeshProUGUI.enableAutoSizing / fontSize / fontSizeMin','Volume + ColorAdjustments (URP)','Canvas.sortingOrder','Screen.dpi','Graphic.color'],
    snippet:`public class ReadabilityDebug : MonoBehaviour {
    [SerializeField] Volume volume;                 // URP global volume, Color Adjustments
    [SerializeField] TextMeshProUGUI[] ranked;      // index 0 must read first

    void Awake() {
        for (int i = 0; i < ranked.Length; i++) {
            ranked[i].enableAutoSizing = false;     // size comes from the ranking, not the fit
            ranked[i].fontSize = 40f - i * 6f;
        }
    }

    void Update() {                                 // the squint test, on the target device
        if (Keyboard.current.f9Key.wasPressedThisFrame) volume.weight = 1f - volume.weight;
    }
}`,
    pitfall:`Turning on TextMeshPro auto-sizing across the HUD. Every label then picks whatever point size fits its own box, so the ranking you designed collapses into a ranking of box widths and the least important counter ends up the biggest text on screen. Set sizes from the ranking and use auto-size only for translated strings, with a clamped fontSizeMin.`,
    map:`Unity CanvasScaler plus TMP font sizes is Godot's project stretch mode plus Theme font sizes.` }});

ENGINE('feedback-and-affordance',{
  godot:{ term:`One outcome signal fans out to every channel. The resolver emits hit, blocked or missed, and a feedback node maps each to an AnimationPlayer clip, a sound and a tween, so the failure case cannot be the one nobody wired.`,
    api:['signal with a named outcome','AnimationPlayer.play()','AudioStreamPlayer.play()','create_tween() / Tween.kill() / Tween.is_running()','GPUParticles2D.restart()','Input.start_joy_vibration()'],
    snippet:`extends Node2D
@onready var _anim: AnimationPlayer = $AnimationPlayer
var _tw: Tween

func react(outcome: StringName) -> void:       # hit, blocked, missed: all three exist
\t_anim.play(outcome)
\t$Sfx.stream = load("res://sfx/%s.ogg" % outcome)
\t$Sfx.play()
\tif _tw and _tw.is_running():
\t\t_tw.kill()                             # one tween per property, or they fight
\t_tw = create_tween()
\t_tw.tween_property(self, "scale", Vector2.ONE * 1.2, 0.04)
\t_tw.tween_property(self, "scale", Vector2.ONE, 0.08)`,
    pitfall:`Calling create_tween() on every hit without killing the previous one. Each call returns a new Tween, and two live tweens writing scale fight frame by frame, so rapid hits leave the sprite stuck at the wrong size. The same applies when an AnimationPlayer track and a Tween both drive one property.`,
    map:`A Godot signal feeding an AnimationPlayer is a UnityEvent feeding an Animator trigger.` },
  unity:{ term:`A UnityEvent per outcome, consumed by an Animator trigger, an AudioSource and a particle burst. Triggers are reset before the new one is set so a stale trigger cannot surface later.`,
    api:['UnityEvent<T>','Animator.SetTrigger() / Animator.ResetTrigger()','AudioSource.PlayOneShot()','ParticleSystem.Play()','Gamepad.current.SetMotorSpeeds()','Coroutine + WaitForSecondsRealtime'],
    snippet:`public class Feedback : MonoBehaviour {
    [SerializeField] Animator animator;
    [SerializeField] AudioSource sfx;
    [SerializeField] AudioClip hit, blocked, missed;   // failure feedback is not optional

    public void React(string outcome) {
        animator.ResetTrigger("Hit");
        animator.ResetTrigger("Blocked");
        animator.ResetTrigger("Missed");               // clear stale triggers first
        animator.SetTrigger(outcome);
        sfx.PlayOneShot(outcome == "Hit" ? hit : outcome == "Blocked" ? blocked : missed);
    }
}`,
    pitfall:`Setting an Animator trigger that no transition out of the current state consumes. The trigger stays latched and fires the next time any state can take it, so the miss flash appears one action late and attaches itself to the wrong event. That is worse than no feedback, because the player learns the wrong cause.`,
    map:`A Unity Animator trigger is a Godot AnimationPlayer clip started from a signal.` }});

ENGINE('onboarding',{
  godot:{ term:`Teaching order is enforced in the InputMap, not in the UI. The overlay consumes events for verbs that are not unlocked yet, and logs every action with a timestamp so the silent audit produces data instead of memory.`,
    api:['InputMap.get_actions() / InputEvent.is_action_pressed()','Viewport.set_input_as_handled()','Node._input() vs _unhandled_input()','FileAccess.open("user://…", WRITE)','Time.get_ticks_msec()','Area2D.body_entered for just-in-time prompts'],
    snippet:`extends Control                                # the tutorial overlay
@export var enabled_actions: Array[StringName] = [&"move"]
var _log := FileAccess.open("user://onboarding.csv", FileAccess.WRITE)

func _input(e: InputEvent) -> void:
\tfor a in InputMap.get_actions():
\t\tif e.is_action_pressed(a):
\t\t\t_log.store_line("%d,%s" % [Time.get_ticks_msec(), a])
\t\t\tif a not in enabled_actions:
\t\t\t\tget_viewport().set_input_as_handled()
\t\t\t\treturn                     # gated verbs never reach gameplay`,
    pitfall:`Handling the tutorial gate in _input without calling set_input_as_handled(). Godot keeps propagating the event to _unhandled_input, so the player node still receives it and the "locked" verb works anyway. Testers discover the ungated ability in minute two and the teaching order you designed never happens.`,
    map:`Godot InputMap actions plus a user:// flag file are Unity Input System action maps plus PlayerPrefs.` },
  unity:{ term:`Each lesson is an Input System action map. Switching maps unlocks exactly one new verb, and the lesson index lives in PlayerPrefs so a returning player resumes at the right beat.`,
    api:['PlayerInput.SwitchCurrentActionMap()','InputActionMap.Enable() / Disable()','PlayerPrefs.GetInt / SetInt / DeleteKey','Time.unscaledTime','TextMeshProUGUI prompt','Analytics or a custom file logger'],
    snippet:`public class Onboarding : MonoBehaviour {
    [SerializeField] PlayerInput input;
    [SerializeField] string[] beatMaps = { "Move", "MoveJump", "Full" };
    int beat;
    void Start() {                                      // one verb unlocked per lesson
        beat = PlayerPrefs.GetInt("onboarding.beat", 0);
        input.SwitchCurrentActionMap(beatMaps[beat]);
    }
    public void BeatCleared() {
        beat = Mathf.Min(beat + 1, beatMaps.Length - 1);
        PlayerPrefs.SetInt("onboarding.beat", beat);
        input.SwitchCurrentActionMap(beatMaps[beat]);
    }
}`,
    pitfall:`Gating prompts on PlayerPrefs without clearing them. Your editor has long since recorded every prompt as seen, so the developer never sees the first-run path again and it ships untested. Call PlayerPrefs.DeleteKey (or Edit > Clear All PlayerPrefs) before every silent test, and build a fresh-install run into the checklist rather than trusting the editor.`,
    map:`Unity Input System action maps per lesson are Godot InputMap actions gated by the tutorial overlay.` }});

ENGINE('controls-and-friction',{
  godot:{ term:`Remapping rewrites the InputMap at runtime and persists to a ConfigFile in user://. Buffering and forgiveness live in the action layer, not in the movement code.`,
    api:['InputMap.action_erase_events() / action_add_event()','InputEventKey / InputEventJoypadButton','ConfigFile.set_value() / save() / load()','Input.get_action_strength()','ProjectSettings input deadzone','Input.set_use_accumulated_input()'],
    snippet:`extends Node                                   # remap flow, persisted in user://
const PATH := "user://input.cfg"
func rebind(action: StringName, event: InputEvent) -> void:
\tInputMap.action_erase_events(action)
\tInputMap.action_add_event(action, event)
\tvar cfg := ConfigFile.new()
\tcfg.set_value("bind", action, event)
\tcfg.save(PATH)                             # InputMap changes are runtime only

func load_binds() -> void:
\tvar cfg := ConfigFile.new()
\tif cfg.load(PATH) != OK:
\t\treturn
\tfor a in cfg.get_section_keys("bind"):
\t\trebind(a, cfg.get_value("bind", a))`,
    pitfall:`Assuming InputMap edits persist. They live only in the running process and never touch project.godot, so a remap survives until the player quits and is silently gone next launch. Save the events yourself and reapply them at startup, before the first scene reads any action.`,
    map:`Godot InputMap plus a saved ConfigFile is Unity's Input System with SaveBindingOverridesAsJson.` },
  unity:{ term:`Interactive rebinding on the InputAction, with the pointer and the cancel key excluded, then binding overrides serialised to JSON. Latency budget is set by the frame rate cap and the update mode.`,
    api:['InputAction.PerformInteractiveRebinding(index)','WithControlsExcluding() / WithCancelingThrough()','InputActionAsset.SaveBindingOverridesAsJson() / LoadBindingOverridesFromJson()','InputSystem.settings.updateMode','Application.targetFrameRate','InputAction.ReadValue<T>()'],
    snippet:`public class Rebinder : MonoBehaviour {
    [SerializeField] InputActionAsset actions;

    public void Rebind(InputAction action, int part) {
        action.Disable();
        action.PerformInteractiveRebinding(part)
            .WithControlsExcluding("<Mouse>/position")   // or the pointer binds itself
            .WithCancelingThrough("<Keyboard>/escape")
            .OnComplete(op => {
                op.Dispose();
                action.Enable();
                PlayerPrefs.SetString("binds", actions.SaveBindingOverridesAsJson());
            }).Start();
    }
}`,
    pitfall:`Starting an interactive rebind without excluding the pointer. Mouse position and delta report movement constantly, so the rebind completes on the first pixel of mouse drift and the player's jump is now bound to moving the mouse. They cannot undo it, because the menu they need also stopped working.`,
    map:`Unity's PerformInteractiveRebinding with JSON overrides is Godot's InputMap edit with a saved ConfigFile.` }});

ENGINE('accessibility',{
  godot:{ term:`One autoload holds the settings and emits changed. Text scale goes through the Theme so containers re-flow, audio goes through buses so every future sound obeys it, and motion systems check the reduced-motion flag before they shake anything.`,
    api:['Autoload singleton + signal changed','Theme.default_font_size / add_theme_font_size_override()','AudioServer.get_bus_index() / set_bus_volume_db()','linear_to_db() / db_to_linear()','InputMap remapping','TranslationServer for subtitles'],
    snippet:`extends Node                                   # autoload: every system reads these
signal changed
var reduced_motion := false
var text_scale := 1.0
var bus_gain := {"Music": 1.0, "Sfx": 1.0, "Voice": 1.0}

func apply(theme: Theme) -> void:
\ttheme.default_font_size = int(16 * text_scale)   # containers re-layout, glyphs stay sharp
\tfor bus in bus_gain:
\t\tAudioServer.set_bus_volume_db(AudioServer.get_bus_index(bus),
\t\t\tlinear_to_db(bus_gain[bus]))
\tchanged.emit()

func shake(cam: Camera2D, amount: float) -> void:
\tcam.offset = Vector2.ZERO if reduced_motion else Vector2(randf_range(-amount, amount), 0)`,
    pitfall:`Scaling text with Control.scale. That resamples already-rasterised glyphs, so large text is blurry and small text is worse, and the container never re-flows, so the longer string clips instead of wrapping. Drive the Theme font size and let the layout recompute.`,
    map:`Godot audio buses and Theme font sizes are Unity AudioMixer groups and TMP font settings.` },
  unity:{ term:`Static settings read by every system, audio through exposed AudioMixer parameters so sources spawned later obey them, and colour choices taken from the engine's colour-blind safe palette instead of hand-picked hues.`,
    api:['AudioMixer.SetFloat() with exposed parameters','UnityEngine.Accessibility.VisionUtility.GetColorBlindSafePalette()','TMP_Settings / TextMeshProUGUI font size','InputAction rebinding for remapping','Screen.dpi','PlayerPrefs for persistence'],
    snippet:`public class AccessibilitySettings : MonoBehaviour {
    [SerializeField] AudioMixer mixer;                 // exposed params, not per-source volume
    public static bool ReducedMotion;
    public static float TextScale = 1f;

    public void SetBus(string exposedParam, float linear) =>
        mixer.SetFloat(exposedParam, Mathf.Log10(Mathf.Max(linear, 0.0001f)) * 20f);

    public static Color[] SafePalette(int n) {
        var colors = new Color[n];
        VisionUtility.GetColorBlindSafePalette(colors, 0.3f, 0.9f);
        return colors;
    }
}`,
    pitfall:`Implementing the volume sliders by walking every AudioSource and setting .volume. It only reaches the sources alive at that moment, so the next spawned enemy, pickup and music stinger all come back at full volume and the player has to move the slider again. Route everything through mixer groups and set one exposed parameter.`,
    map:`Unity AudioMixer groups and exposed parameters are Godot audio buses and AudioServer.set_bus_volume_db.` }});

/* ---------- narrative --------------------------------------------- */

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
    pitfall:`Writing runtime state onto an exported Resource. Every node that exports the same .tres holds the same instance, so one faction turning hostile turns it hostile everywhere, and in the editor the change is written back into the asset the next time you save the scene. Duplicate it for runtime, or set resource_local_to_scene.`,
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
    pitfall:`Tuning a ScriptableObject during play mode. Unlike scene objects it is not reverted when play stops, so the value looks like it persisted and gets treated as the authored one. In a player build the asset is read-only and resets every launch, so the balance you thought you saved exists only on your machine.`,
    map:`A Unity ScriptableObject is a Godot Resource saved as .tres.` }});

ENGINE('ludonarrative-alignment',{
  godot:{ term:`The audit is a tool script. An EditorScript walks the reward resources, compares what each one rewards against the chapter's stated theme, and prints every contradiction as a warning you can run before a review.`,
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
    pitfall:`Writing the audit as runtime code. DirAccess cannot list res:// in an exported build the way it does in the editor, because only imported and included files exist there and .tres source files may be stripped entirely. The tool works on your machine and returns an empty list in CI, which reads as "no contradictions found".`,
    map:`Godot's @tool and EditorScript are Unity's Editor-folder script with a MenuItem.` },
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

ENGINE('environmental-storytelling',{
  godot:{ term:`A vignette is a small PackedScene placed in the world. A VisibleOnScreenNotifier3D plus a ray to the camera tells you whether it was actually seen, so "did anyone read this room" becomes a measurement.`,
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
    pitfall:`Treating VisibleOnScreenNotifier3D as proof the player saw it. It tests the node's box against the camera frustum and knows nothing about occlusion, so a vignette behind a wall reports visible for the whole corridor. Every number you collect is inflated, and the room nobody read looks like the room everybody read.`,
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
    map:`Unity renderer visibility callbacks are Godot's VisibleOnScreenNotifier3D signals.` }});

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
    map:`Godot's Expression over an autoload flag dictionary is Unity's condition check over a serialised save object.` },
  unity:{ term:`A serialisable save class holding the flags, written with JsonUtility to persistentDataPath. Consequences subscribe to a change event so an acknowledgment can be surfaced the moment a flag is set.`,
    api:['[System.Serializable] save class','JsonUtility.ToJson() / FromJson<T>()','Application.persistentDataPath','File.WriteAllText() / ReadAllText()','UnityEvent for consequence hooks','PlayableDirector for the acknowledgment beat'],
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
    map:`Unity's JsonUtility save object is Godot's JSON-serialised flag dictionary in user://.` }});

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

/* ---------- presentation ------------------------------------------ */

ENGINE('visual-language',{
  godot:{ term:`The grammar is one shader with instance uniforms. Every threatening object shares the same material and the same meaning, and only the per-node value changes, so a designer cannot invent a second way to say danger.`,
    api:['Shader with instance uniform float threat','GeometryInstance3D.set_instance_shader_parameter()','ShaderMaterial / next_pass for outlines','MeshInstance3D.material_override vs material_overlay','StandardMaterial3D.rim / emission','Resource palette shared by art and UI'],
    snippet:`extends MeshInstance3D                         # threat.gdshader:
@export var threat := 0.0                      #   instance uniform float threat;
                                               #   ALBEDO = mix(ALBEDO, DANGER, threat);

func _ready() -> void:
\tset_instance_shader_parameter(&"threat", threat)

func set_threat(v: float) -> void:
\tthreat = clampf(v, 0.0, 1.0)
\tset_instance_shader_parameter(&"threat", threat)   # per node, shared material untouched`,
    pitfall:`Calling set_shader_parameter on the shared ShaderMaterial to tint one enemy. Materials are Resources, so every object using that material changes with it and the whole room turns red. The matching mistake is material_override, which replaces all surfaces of the mesh and wipes the very grammar the second surface was carrying.`,
    map:`Godot instance shader parameters are Unity's MaterialPropertyBlock.` },
  unity:{ term:`One Shader Graph with an exposed property per meaning, and a MaterialPropertyBlock per renderer. The grammar is enforced by the shader, the variation is per instance, and batching survives.`,
    api:['Shader Graph exposed properties','Shader.PropertyToID()','MaterialPropertyBlock + Renderer.GetPropertyBlock() / SetPropertyBlock()','Renderer.sharedMaterial vs Renderer.material','Volume + ColorAdjustments for the desaturation test','Shader.SetGlobalColor()'],
    snippet:`[RequireComponent(typeof(Renderer))]
public class ThreatTint : MonoBehaviour {
    static readonly int Threat = Shader.PropertyToID("_Threat");   // Shader Graph property
    static MaterialPropertyBlock block;
    Renderer r;

    void Awake() { r = GetComponent<Renderer>(); block ??= new MaterialPropertyBlock(); }

    public void SetThreat(float v) {
        r.GetPropertyBlock(block);
        block.SetFloat(Threat, Mathf.Clamp01(v));
        r.SetPropertyBlock(block);             // no material instance, batching survives
    }
}`,
    pitfall:`Touching Renderer.material to change a colour. The getter clones the material for that renderer, so you get one extra material instance per object, batching breaks, and the clone leaks because nothing destroys it. The grammar still looks right and the frame rate quietly halves in a crowded room.`,
    map:`A Unity MaterialPropertyBlock is a Godot instance shader parameter.` }});

ENGINE('game-feel-and-juice',{
  godot:{ term:`Forgiveness lives in an input buffer measured in seconds, and emphasis lives in time scale plus tweens. Hit-stop scales Engine.time_scale and waits on a timer that was told to ignore it.`,
    api:['Engine.time_scale','SceneTree.create_timer(sec, process_always, process_in_physics, ignore_time_scale)','create_tween() with set_trans() / set_ease()','Camera2D.offset for shake','Input.start_joy_vibration()','Time.get_ticks_msec()'],
    snippet:`extends Node
@export var buffer_sec := 0.12                 # input forgiveness, measured not guessed
var _buffered_at := -1.0

func _unhandled_input(e: InputEvent) -> void:
\tif e.is_action_pressed("attack"):
\t\t_buffered_at = Time.get_ticks_msec() / 1000.0

func consume_attack() -> bool:
\treturn Time.get_ticks_msec() / 1000.0 - _buffered_at < buffer_sec

func hitstop(sec := 0.05) -> void:
\tEngine.time_scale = 0.05
\tawait get_tree().create_timer(sec, true, false, true).timeout   # ignore_time_scale
\tEngine.time_scale = 1.0`,
    pitfall:`Awaiting a plain scene tree timer during hit-stop. The timer is scaled by Engine.time_scale too, so a fifty millisecond freeze at a time scale of 0.05 lasts a full second and the game appears to hang on every hit. Pass ignore_time_scale as true, or track the freeze with an unscaled clock.`,
    map:`Godot's Engine.time_scale with an ignore_time_scale timer is Unity's Time.timeScale with WaitForSecondsRealtime.` },
  unity:{ term:`Buffering on unscaled time, hit-stop on Time.timeScale, and shake on a Cinemachine impulse channel so it does not fight whatever the follow camera is doing.`,
    api:['Time.timeScale / Time.unscaledTime / Time.unscaledDeltaTime','WaitForSecondsRealtime','CinemachineImpulseSource.GenerateImpulse()','AnimationCurve for easing','Gamepad.current.SetMotorSpeeds()','Time.fixedDeltaTime'],
    snippet:`public class Juice : MonoBehaviour {
    [SerializeField] CinemachineImpulseSource impulse;
    [SerializeField] float bufferSec = 0.12f;
    float bufferedAt = -1f;

    public void BufferAttack() => bufferedAt = Time.unscaledTime;
    public bool ConsumeAttack() => Time.unscaledTime - bufferedAt < bufferSec;

    public IEnumerator HitStop(float sec = 0.05f) {
        impulse.GenerateImpulse();                    // shake on its own channel
        Time.timeScale = 0.05f;
        yield return new WaitForSecondsRealtime(sec); // WaitForSeconds would barely advance
        Time.timeScale = 1f;
    }
}`,
    pitfall:`Using WaitForSeconds inside the hit-stop coroutine. It counts scaled time, so at a time scale of 0.05 it waits twenty times too long, and at a time scale of zero it never resumes at all, leaving the game frozen with no error. Use realtime waits for anything that has to outlive the freeze it caused.`,
    map:`Unity's Time.timeScale with WaitForSecondsRealtime is Godot's Engine.time_scale with an ignore_time_scale timer.` }});

ENGINE('audio-and-music',{
  godot:{ term:`Buses are the mix hierarchy. Layers are AudioStreamPlayers on a Music bus started together and faded by amplitude, and warnings sit on a bus that ducks the music with a sidechained compressor.`,
    api:['AudioServer bus layout + AudioStreamPlayer.bus','AudioServer.set_bus_volume_db() / get_bus_index()','linear_to_db() / db_to_linear()','AudioEffectCompressor.set_sidechain()','AudioStreamInteractive / AudioStreamPlaylist','AudioStreamPlayer.finished'],
    snippet:`extends Node                                   # music layers on the Music bus
@export var layers: Array[AudioStreamPlayer] = []

func _ready() -> void:
\tfor p in layers:
\t\tp.bus = "Music"
\t\tp.volume_db = -80.0
\t\tp.play()                               # all layers start together, fade amplitude only

func set_intensity(u: float) -> void:
\tfor i in layers.size():
\t\tvar amp := clampf(u * layers.size() - i, 0.0, 1.0)
\t\tlayers[i].volume_db = linear_to_db(maxf(amp, 0.0001))`,
    pitfall:`Lerping volume_db directly, and reading zero as silence. Decibels are logarithmic, so a linear ramp from minus eighty to zero is inaudible for most of its length and then arrives all at once, and volume_db of zero is full volume, not muted. Interpolate amplitude and convert with linear_to_db.`,
    map:`Godot audio buses with a sidechained compressor are Unity AudioMixer groups with a duck volume and snapshots.` },
  unity:{ term:`AudioMixer groups are the hierarchy, exposed parameters are the sliders, snapshots are the states. Layers are scheduled against the audio clock so they stay in phase with each other.`,
    api:['AudioMixer.SetFloat() with exposed parameters','AudioMixerSnapshot.TransitionTo()','AudioSource.PlayScheduled() / AudioSettings.dspTime','Duck Volume effect + send','AudioSource.PlayOneShot()','AudioSource.outputAudioMixerGroup'],
    snippet:`public class MusicLayers : MonoBehaviour {
    [SerializeField] AudioSource[] layers;             // all routed to a Music mixer group
    [SerializeField] AudioMixer mixer;

    void Start() {
        double at = AudioSettings.dspTime + 0.2;       // sample accurate, layers stay in phase
        foreach (var a in layers) { a.volume = 0f; a.PlayScheduled(at); }
    }

    public void SetIntensity(float u) {
        for (int i = 0; i < layers.Length; i++)
            layers[i].volume = Mathf.Clamp01(u * layers.Length - i);
        mixer.SetFloat("MusicVol", Mathf.Log10(Mathf.Max(u, 0.0001f)) * 20f);
    }
}`,
    pitfall:`Starting music layers with Play() on separate AudioSources. Each one begins at the next frame boundary rather than the next sample, so the layers drift apart by milliseconds that a listener hears as phasing and smear. Schedule them all against one AudioSettings.dspTime value.`,
    map:`Unity AudioMixer groups with snapshots are Godot audio buses with bus volumes and effects.` }});

ENGINE('animation-and-vfx',{
  godot:{ term:`An AnimationTree state machine owns the states, and the gameplay window is read from the clip instead of duplicated as a number. Hitboxes are enabled by tracks inside the same clip that draws the telegraph.`,
    api:['AnimationTree + AnimationNodeStateMachinePlayback.travel()','AnimationPlayer.get_animation(name).length','Animation value and method call tracks','AnimationMixer.animation_finished','Camera3D + SpringArm3D for framing','GPUParticles3D.restart()'],
    snippet:`extends CharacterBody3D
@onready var _tree: AnimationTree = $AnimationTree
@onready var _sm: AnimationNodeStateMachinePlayback = _tree["parameters/playback"]

func telegraph_sec() -> float:                 # the rule reads the art, so they cannot drift
\treturn $AnimationPlayer.get_animation("windup").length

func attack() -> void:
\t_sm.travel("windup")                       # hitbox enabled by a track inside the clip
\tawait _tree.animation_finished
\t_sm.travel("recover")`,
    pitfall:`Calling AnimationPlayer.play() on a player that an active AnimationTree is driving. The tree writes the pose every frame, so your hit reaction is overwritten before it is ever seen and there is no error to point at. Add the reaction as a state in the tree, or set AnimationTree.active to false while you drive the player directly.`,
    map:`A Godot AnimationTree state machine is a Unity Animator controller, and an Animation method call track is an AnimationEvent.` },
  unity:{ term:`An Animator controller owns the states, AnimationEvents inside the clip open and close the gameplay windows, and the telegraph length is read from the clip so design and art share one number.`,
    api:['Animator.CrossFade() / SetTrigger()','AnimationEvent on a clip','RuntimeAnimatorController.animationClips / AnimationClip.length','Animator.cullingMode (AnimatorCullingMode.AlwaysAnimate)','StateMachineBehaviour','CinemachineCamera + VisualEffect (VFX Graph)'],
    snippet:`public class Telegraph : MonoBehaviour {
    [SerializeField] Animator animator;
    [SerializeField] Collider hitbox;          // enabled by an AnimationEvent in the clip

    // Culled animators do not fire AnimationEvents, so off-screen telegraphs go missing.
    void Awake() => animator.cullingMode = AnimatorCullingMode.AlwaysAnimate;

    public float TelegraphSec(string clip) {   // the rule reads the art, they cannot drift
        foreach (var c in animator.runtimeAnimatorController.animationClips)
            if (c.name == clip) return c.length;
        return 0f;
    }

    public void OnWindupEnd() => hitbox.enabled = true;   // AnimationEvent target
}`,
    pitfall:`Leaving the culling mode at its default while hitboxes are driven by AnimationEvents. An enemy just off camera stops animating, its windup event never fires, and it either never attacks or attacks with a hitbox that was never switched off. The bug only appears at the screen edge, which is exactly where nobody reproduces it.`,
    map:`A Unity Animator controller with AnimationEvents is a Godot AnimationTree with animation tracks.` }});

/* ---------- product ----------------------------------------------- */

ENGINE('audience-and-positioning',{
  godot:{ term:`The claim gets tested against frames the build actually produced. A capture key writes the viewport to a PNG in user://, and an export preset feature tag marks the ten-minute slice you show strangers.`,
    api:['Viewport.get_texture().get_image()','Image.save_png()','RenderingServer.frame_post_draw','OS.has_feature() + export preset custom features','OS.get_user_data_dir()','Time.get_ticks_msec()'],
    snippet:`extends Node                                   # capture the differentiator from the build

func _unhandled_input(e: InputEvent) -> void:
\tif e.is_action_pressed("capture"):
\t\t_shot()

func _shot() -> void:
\tawait RenderingServer.frame_post_draw      # without this the image is black or stale
\tvar img := get_viewport().get_texture().get_image()
\timg.save_png("user://capsule_%d.png" % Time.get_ticks_msec())`,
    pitfall:`Grabbing the viewport texture in the same frame you asked for it. The GPU has not finished drawing, so you get a black image or the previous frame, and the screenshot you take to the positioning test shows the wrong moment. Await RenderingServer.frame_post_draw first.`,
    map:`Godot viewport capture plus export feature tags is Unity ScreenCapture plus scripting define symbols.` },
  unity:{ term:`ScreenCapture at end of frame for the capsule candidates, and a build profile with its own define for the slice you put in front of strangers. Both come from a player build, not the editor's game view.`,
    api:['ScreenCapture.CaptureScreenshotAsTexture() / CaptureScreenshot()','WaitForEndOfFrame','Texture2D.EncodeToPNG()','Application.persistentDataPath','Scripting Define Symbols / BuildProfile','Screen.SetResolution()'],
    snippet:`public class CapsuleCapture : MonoBehaviour {
    IEnumerator Shot() {
        yield return new WaitForEndOfFrame();      // otherwise the frame is half drawn
        var tex = ScreenCapture.CaptureScreenshotAsTexture();
        var path = Path.Combine(Application.persistentDataPath,
                                "capsule_" + Time.frameCount + ".png");
        File.WriteAllBytes(path, tex.EncodeToPNG());
        Destroy(tex);
    }

    void Update() {
        if (Keyboard.current.f12Key.wasPressedThisFrame) StartCoroutine(Shot());
    }
}`,
    pitfall:`Capturing outside WaitForEndOfFrame, and forgetting to Destroy the returned Texture2D. You get a partially drawn frame and a leak of one full-resolution texture per press, which is enough to kill a capture session on a phone. Capture at end of frame and dispose what you were handed.`,
    map:`Unity ScreenCapture plus build profiles is Godot viewport capture plus export presets with feature tags.` }});

ENGINE('platform-and-session',{
  godot:{ term:`The session profile becomes notification handling. The resume point is written when the OS pauses the app or the back button is pressed, because on a handheld those are the only moments you are guaranteed.`,
    api:['Node._notification()','NOTIFICATION_APPLICATION_PAUSED / NOTIFICATION_APPLICATION_FOCUS_OUT','NOTIFICATION_WM_GO_BACK_REQUEST / NOTIFICATION_WM_CLOSE_REQUEST','SceneTree.auto_accept_quit / quit_on_go_back','DisplayServer.screen_get_dpi()','FileAccess + JSON for the resume point'],
    snippet:`extends Node

func _ready() -> void:
\tget_tree().auto_accept_quit = false        # the back button must not skip the save

func _notification(what: int) -> void:
\tmatch what:
\t\tNOTIFICATION_APPLICATION_PAUSED, NOTIFICATION_WM_GO_BACK_REQUEST:
\t\t\t_write_resume_point()              # the only save points the OS guarantees

func _write_resume_point() -> void:
\tvar f := FileAccess.open("user://resume.json", FileAccess.WRITE)
\tf.store_string(JSON.stringify({"level": Game.level, "checkpoint": Game.checkpoint}))
\tf.close()`,
    pitfall:`Leaving quit_on_go_back at its default on a handheld. The back button closes the app immediately, your close-request handler never runs, and the player loses the session they were three minutes into. Take the notification yourself, save, then quit.`,
    map:`Godot's _notification with NOTIFICATION_APPLICATION_PAUSED is Unity's OnApplicationPause.` },
  unity:{ term:`OnApplicationPause is the save point, and the frame rate cap is part of the session budget because it decides how warm the device gets and how long the battery lasts in a commute-length session.`,
    api:['OnApplicationPause(bool) / OnApplicationFocus(bool)','Application.targetFrameRate','QualitySettings.vSyncCount','Application.persistentDataPath','Screen.dpi / SystemInfo.deviceType','JsonUtility.ToJson()'],
    snippet:`public class SessionGuard : MonoBehaviour {
    void Awake() {
        QualitySettings.vSyncCount = 0;           // targetFrameRate is ignored while vSync is on
        Application.targetFrameRate = 60;         // battery is part of the session budget
    }

    void OnApplicationPause(bool paused) {
        if (paused) WriteResumePoint();           // OnApplicationQuit never runs on mobile
    }

    void WriteResumePoint() =>
        File.WriteAllText(Path.Combine(Application.persistentDataPath, "resume.json"),
                          JsonUtility.ToJson(Game.Snapshot()));
}`,
    pitfall:`Setting Application.targetFrameRate while vSyncCount is non-zero. The cap is ignored, the device renders as fast as the display allows, and the thermal and battery budget you sized the session around is not the one the build runs with. Set vSyncCount to zero first, and confirm the frame rate on the device rather than in the editor.`,
    map:`Unity's OnApplicationPause is Godot's NOTIFICATION_APPLICATION_PAUSED.` }});

ENGINE('business-model',{
  godot:{ term:`Godot has no first-party store layer. Billing arrives as a platform plugin exposed through Engine.get_singleton, and the client's job stops at handing the purchase token to your server.`,
    api:['Engine.has_singleton() / Engine.get_singleton()','Android billing plugin signals such as purchases_updated','HTTPRequest for receipt verification','OS.get_name() for the store branch','ConfigFile / FileAccess for the offer cache','acknowledge and consume calls on the plugin'],
    snippet:`extends Node                                   # the store plugin, not the entitlement
var _billing: Object

func _ready() -> void:
\tif not Engine.has_singleton("GodotGooglePlayBilling"):
\t\treturn
\t_billing = Engine.get_singleton("GodotGooglePlayBilling")
\t_billing.purchases_updated.connect(_on_purchases)
\t_billing.startConnection()

func _on_purchases(purchases: Array) -> void:
\tfor p in purchases:
\t\t_verify_on_server(p.purchase_token)    # the server grants, then acknowledges`,
    pitfall:`Granting the item when purchases_updated fires and never acknowledging or consuming the purchase. The store refunds anything left unacknowledged past its window, so the player pays, gets the item locally, and loses both. A client-side grant is also the easiest thing in the game to fake.`,
    map:`Godot's platform billing singleton is Unity IAP's store listener.` },
  unity:{ term:`Unity IAP gives you a store listener and a pending-purchase state. ProcessPurchase returns Pending, the server verifies the receipt and grants, and only then does the client confirm the transaction with the store.`,
    api:['IDetailedStoreListener.ProcessPurchase()','PurchaseProcessingResult.Pending / Complete','IStoreController.ConfirmPendingPurchase()','ConfigurationBuilder + UnityPurchasing.Initialize()','Product.receipt','CrossPlatformValidator'],
    snippet:`public class Store : MonoBehaviour, IDetailedStoreListener {
    IStoreController controller;

    public PurchaseProcessingResult ProcessPurchase(PurchaseEventArgs e) {
        StartCoroutine(Grant(e.purchasedProduct));
        return PurchaseProcessingResult.Pending;   // Complete here loses a failed grant
    }

    IEnumerator Grant(Product p) {
        yield return Backend.VerifyReceipt(p.receipt);   // the server decides, not the client
        if (Backend.LastGrantOk) controller.ConfirmPendingPurchase(p);
    }
}`,
    pitfall:`Returning PurchaseProcessingResult.Complete before the grant is confirmed. The store marks the transaction finished and stops redelivering it, so any failure between the purchase and the grant loses the item permanently and the only fix is a manual support ticket per player. Return Pending and confirm after the server says yes.`,
    map:`Unity IAP's pending purchase plus server verification is Godot's billing plugin plus your own receipt endpoint.` },
  note:`Both engine tabs stop at the same line. The client surfaces the offer, hands the receipt over and waits. What the player owns is a server fact, because anything the client decides is a value the player can edit. The design questions in this topic (what does a purchase relieve, and did the design create that pain) are answered in the economy on the server, not in the store UI.` });

ENGINE('scope-control',{
  godot:{ term:`A feature is a PackedScene that boot instances only when its tag is present. Cutting one means removing the tag and the scene, and a leftover reference fails loudly at startup instead of in a menu nobody opened.`,
    api:['OS.has_feature() + custom feature tags on an export preset','ResourceLoader.exists()','preload() vs load() with a built path','PackedScene.instantiate()','Export preset resource filters','push_error()'],
    snippet:`extends Node                                   # one PackedScene per feature, gated at boot
@export var features := {"photo_mode": "res://feat/photo_mode.tscn"}

func _ready() -> void:
\tfor feat in features:
\t\tif not OS.has_feature(feat):           # custom feature tag on the export preset
\t\t\tcontinue
\t\tvar path: String = features[feat]
\t\tif not ResourceLoader.exists(path):
\t\t\tpush_error("cut feature still referenced: %s" % path)
\t\t\tcontinue
\t\tadd_child(load(path).instantiate())`,
    pitfall:`Cutting a feature by excluding it in the export preset filters while a string path still points at it. preload would have failed at parse time, but load with a built path fails at the moment the player opens that menu, in a build that passed every editor test. Check existence at boot, or keep the reference a preload so the cut breaks immediately.`,
    map:`Godot export preset feature tags are Unity scripting define symbols and build profiles.` },
  unity:{ term:`Scripting define symbols per build profile decide whether the feature compiles, and an Addressable reference decides whether its assets ship. A direct prefab field ships the content regardless of the define.`,
    api:['Scripting Define Symbols / BuildProfile','AssetReferenceGameObject + InstantiateAsync()','Addressables groups and labels','asmdef Define Constraints','[Conditional] attributes','Editor log build report for what actually shipped'],
    snippet:`public class FeatureGate : MonoBehaviour {
    [SerializeField] AssetReferenceGameObject photoMode;  // Addressable, not a direct reference

    async void Awake() {
#if FEATURE_PHOTO_MODE                                    // define set by the build profile
        var go = await photoMode.InstantiateAsync(transform).Task;
        go.name = "PhotoMode";
#endif
        // A direct prefab field would pull the whole feature in even with the define off.
    }
}`,
    pitfall:`Believing a define cut the content. Serialised references pull assets into the build whether or not the code that uses them compiles, so a cut feature still costs download size and load time. Read the build report in the Editor log to see what actually shipped, and move optional content behind Addressables.`,
    map:`Unity scripting define symbols plus Addressables groups are Godot export preset feature tags plus resource filters.` }});

ENGINE('learning-from-success',{
  godot:{ term:`Decisions per minute is a measurement, not an estimate. A logger writes every meaningful action with a timestamp so your prototype and the comparable are compared on the same number.`,
    api:['Node._unhandled_input()','InputEvent.is_action_pressed()','InputEventKey.echo','FileAccess.open("user://…", WRITE) / store_line()','Time.get_ticks_msec()','OS.has_feature("editor") to separate editor runs'],
    snippet:`extends Node                                   # measured in an export build, not the editor
var _log := FileAccess.open("user://decisions.csv", FileAccess.WRITE)
const MEANINGFUL := [&"attack", &"dodge", &"swap", &"buy"]

func _unhandled_input(e: InputEvent) -> void:
\tif e is InputEventKey and e.echo:
\t\treturn                                 # autorepeat is not a decision
\tfor a in MEANINGFUL:
\t\tif e.is_action_pressed(a):
\t\t\t_log.store_line("%d,%s" % [Time.get_ticks_msec(), a])`,
    pitfall:`Counting every input event as a decision. Held keys emit echo events at the OS repeat rate, so leaning on a direction for two seconds logs dozens of decisions and your prototype appears to be denser than the game you are measuring it against. Filter echo, and count only the actions that change the plan.`,
    map:`A Godot _unhandled_input action log is a Unity InputAction callback log.` },
  unity:{ term:`Subscribe to performed on the actions you called meaningful, and write the rows out at the end of the session. Interactions on an action fire three separate callbacks, so only one of them is a decision.`,
    api:['InputAction.performed / started / canceled','InputActionAsset.FindActionMap()','InputAction.CallbackContext','Time.realtimeSinceStartup','File.WriteAllLines() + Application.persistentDataPath','Development Build for honest frame times'],
    snippet:`public class DecisionLog : MonoBehaviour {
    [SerializeField] InputActionAsset actions;
    readonly List<string> rows = new();

    void OnEnable() {
        foreach (var a in actions.FindActionMap("Meaningful"))
            a.performed += Row;            // performed only, or a Hold triples the count
    }

    void Row(InputAction.CallbackContext c) =>
        rows.Add(Time.realtimeSinceStartup.ToString("F3") + "," + c.action.name);

    void OnDisable() =>
        File.WriteAllLines(Path.Combine(Application.persistentDataPath, "decisions.csv"), rows);
}`,
    pitfall:`Subscribing to started, performed and canceled on the same action. Any action with a Hold or Press interaction fires all three, so one dodge is logged as three decisions and the rate you compare against the comparable is inflated threefold. Pick the callback that matches what you decided counts as a decision.`,
    map:`Unity's InputAction callbacks are Godot's action presses in _unhandled_input.` }});

ENGINE('launch-and-discoverability',{
  godot:{ term:`The demo and the trailer are both export presets. A trailer feature tag switches on a scripted camera rig, and the engine's movie writer renders deterministic frames at a fixed rate instead of screen-recording a laggy session.`,
    api:['Export preset custom features + OS.has_feature()','godot --write-movie file.avi --fixed-fps 60','Movie Maker mode in Project Settings','SceneTree.quit()','ProjectSettings application/config/version','Marker3D camera path'],
    snippet:`extends Node                       # godot --write-movie trailer.avi --fixed-fps 60
@export var path: Array[Marker3D] = []
@export var seconds := 20.0
var _t := 0.0

func _process(delta: float) -> void:
\tif not OS.has_feature("trailer"):
\t\treturn
\t_t += delta                    # delta, never wall clock: the movie writer fakes time
\tvar u := clampf(_t / seconds, 0.0, 1.0)
\t$Camera3D.global_position = path[int(u * (path.size() - 1))].global_position
\tif u >= 1.0:
\t\tget_tree().quit()`,
    pitfall:`Driving anything in the trailer rig from real time. Movie Maker mode advances a simulated clock so every frame can be rendered slowly and still land on the timeline, so OS.get_ticks_msec and system time race ahead of the recorded frames. Timers and effects that read them play at the wrong speed in the capture and nowhere else.`,
    map:`Godot export presets with feature tags and Movie Maker are Unity build profiles with defines and Unity Recorder.` },
  unity:{ term:`A build profile with its own defines produces the demo, and Unity Recorder captures the trailer from the game view at a fixed frame rate. The demo is built as its own scene list so it does not carry the full game.`,
    api:['BuildProfile + Scripting Define Symbols','Unity Recorder package','EditorBuildSettings.scenes / the profile scene list','Addressables groups per build','Application.version','Application.Quit()'],
    snippet:`public class TrailerRig : MonoBehaviour {
    [SerializeField] CinemachineSplineCart cart;   // Unity Recorder captures the game view
    [SerializeField] float seconds = 20f;
    float t;

    void Update() {
#if !TRAILER_BUILD
        enabled = false;                           // define comes from the trailer profile
#else
        t += Time.deltaTime;
        cart.SplinePosition = Mathf.Clamp01(t / seconds);
        if (t >= seconds) Application.Quit();
#endif
    }
}`,
    pitfall:`Building the demo from the full project. Everything under a Resources folder is included whole regardless of what the demo's scenes reference, so a short slice downloads at close to full game size and the store page's file size contradicts the pitch. Move optional content to Addressables and check the build report.`,
    map:`Unity build profiles with Unity Recorder are Godot export presets with Movie Maker mode.` }});

ENGINE('live-operations',{
  godot:{ term:`Content ships after launch as a .pck resource pack downloaded into user:// and mounted at runtime. The engine binary cannot change this way, so anything needing a new engine feature still goes through the store.`,
    api:['ProjectSettings.load_resource_pack(path, replace_files)','HTTPRequest for the download','FileAccess.file_exists() / user:// cache','SceneTree.change_scene_to_file()','ProjectSettings application/config/version','push_error() on a rejected pack'],
    snippet:`extends Node                                   # ship content without a store review

func apply_patch(pck_path: String) -> bool:
\tif not FileAccess.file_exists(pck_path):
\t\treturn false
\t# replace_files = false: a patch adds, it never silently overwrites res://
\tif not ProjectSettings.load_resource_pack(pck_path, false):
\t\tpush_error("pack rejected, build version mismatch")
\t\treturn false
\tget_tree().change_scene_to_file("res://patched/season_2.tscn")
\treturn true`,
    pitfall:`Loading a pack with replace_files left at its default. It overrides existing res:// paths, so a pack built against a newer binary can swap a script or scene under a client that cannot run it, and the crash happens at scene load with no clue that a pack caused it. Pin every pack to an exact build version and prefer adding paths over replacing them.`,
    map:`Godot .pck resource packs are Unity Addressables remote content.` },
  unity:{ term:`Addressables with a remote catalog. The client checks for catalog updates at boot, downloads only the bundles whose hashes changed, then loads the new content by address.`,
    api:['Addressables.CheckForCatalogUpdates() / UpdateCatalogs()','Addressables.LoadAssetAsync() / LoadSceneAsync()','RemoteLoadPath / RemoteBuildPath','addressables_content_state.bin','Addressables.GetDownloadSizeAsync()','Addressables.ClearDependencyCacheAsync()'],
    snippet:`public class ContentUpdate : MonoBehaviour {
    IEnumerator Start() {
        var check = Addressables.CheckForCatalogUpdates(false);
        yield return check;
        if (check.Result.Count == 0) yield break;
        // Built with Update a Previous Build against addressables_content_state.bin,
        // so only the changed bundles get new hashes.
        yield return Addressables.UpdateCatalogs(check.Result, false);
        yield return Addressables.LoadSceneAsync("Season2");
    }
}`,
    pitfall:`Doing a full Addressables rebuild for a content update instead of "Update a Previous Build" against the saved content state. Every bundle gets a new hash, so returning players re-download the entire catalogue for a one-asset balance fix, and on mobile a large share of them never finish it. Keep the content state file in version control with the release.`,
    map:`Unity Addressables remote catalogues are Godot .pck packs mounted from user://.` },
  note:`The client half is a download and a mount. The decisions in this topic (what the first update fixes, what cadence the team can hold, how a nerf is announced) live in the backend and in the calendar. The engine work matters because it decides whether a fix takes a store review or an hour, and that single fact sets the cadence you are allowed to promise.` });

ENGINE('localization-and-culture',{
  godot:{ term:`Strings live in translation files imported as Translation resources, and the game asks for them with tr. One key carries the whole sentence including its placeholders, so word order stays with the translator.`,
    api:['tr() / tr_n() / atr()','TranslationServer.set_locale() / get_loaded_locales()','String.format() with named placeholders','POT generation in Project Settings > Localization','Node.auto_translate_mode','OS.get_locale()'],
    snippet:`extends Label

func _ready() -> void:
\tauto_translate_mode = Node.AUTO_TRANSLATE_MODE_DISABLED   # translate once, here
\tTranslationServer.set_locale(OS.get_locale())

func refresh(found: String, count: int) -> void:
\t# One key with placeholders inside it. Fragments freeze English word order.
\ttext = tr("HUD_FOUND").format({"item": tr(found), "n": count})
\t$Plural.text = tr_n("ITEM_ONE", "ITEM_MANY", count)`,
    pitfall:`Building sentences by concatenating translated fragments. Languages put the number, the object and the verb in different places, so tr("YOU_FOUND") plus a name is untranslatable and the translator has no way to fix it. Ship one key per sentence with named placeholders, and use tr_n where the plural rule is not English's.`,
    map:`Godot's tr with imported translation resources is Unity's Localization package with string tables.` },
  unity:{ term:`The Localization package holds locales, string tables and smart strings. A LocalizeStringEvent binds a table entry to a label, and the font asset has to cover the glyphs every target locale needs.`,
    api:['LocalizedString / LocalizeStringEvent','LocalizationSettings.SelectedLocale','StringTable + Smart String arguments','TMP_FontAsset fallback list / TMP_Settings.fallbackFontAssets','Pseudo-Locale for the layout pass','LocalizationSettings.InitializationOperation'],
    snippet:`public class Hud : MonoBehaviour {
    [SerializeField] LocalizeStringEvent found;    // string table entry, Smart String
    [SerializeField] TMP_FontAsset cjkFallback;    // Latin-only atlases render CJK as boxes

    void Awake() {
        TMP_Settings.fallbackFontAssets.Add(cjkFallback);
    }

    public void Refresh(string item, int count) {
        found.StringReference.Arguments = new object[] { new { item, n = count } };
        found.RefreshString();                     // plural and gender handled in the entry
    }
}`,
    pitfall:`Shipping a TextMeshPro font asset baked with a Latin character set. Pseudo-localisation passes because it is still Latin, and the first CJK or Cyrillic build renders every glyph as a box with no error in the console. Configure the fallback chain and test with a real translated string, not an accented one.`,
    map:`Unity's Localization package with string tables is Godot's tr with imported translation resources.` }});

ENGINE('ethics-and-responsibility',{
  godot:{ term:`Nothing leaves the device until the player answers. The consent flag is read before the analytics client will send anything, and the identifier sent is one you generated and the player can reset.`,
    api:['ConfigFile.load() / get_value() in user://','HTTPRequest.request()','JSON.stringify()','OS.get_unique_id() (the identifier not to send)','crypto or randi() for a resettable local id','OS.get_locale() for region rules'],
    snippet:`extends Node                                   # nothing leaves the device before consent
const ENDPOINT := "https://telemetry.example.com/v1/events"
var _consent := false

func _ready() -> void:
\tvar cfg := ConfigFile.new()
\tif cfg.load("user://privacy.cfg") == OK:
\t\t_consent = cfg.get_value("privacy", "analytics", false)

func track(event: String, props: Dictionary) -> void:
\tif not _consent:
\t\treturn                                 # dropped, not queued for later
\tprops["event"] = event
\tprops["pid"] = _stable_random_id()         # never OS.get_unique_id(), and resettable
\t$HTTPRequest.request(ENDPOINT, [], HTTPClient.METHOD_POST, JSON.stringify(props))`,
    pitfall:`Keying players on OS.get_unique_id(). It is a device identifier that survives reinstalls, which is exactly the property that makes it a privacy liability and a platform policy problem, and it is unavailable on some targets so the code also breaks. Generate a random id, store it in user://, and let the player reset it.`,
    map:`Godot's HTTPRequest client behind a user:// consent flag is Unity's analytics service gated on StartDataCollection.` },
  unity:{ term:`The service is initialised early so the consent screen can show, but collection is a separate call. Nothing is gathered until the player says yes, and a no is followed by a deletion request rather than silence.`,
    api:['UnityServices.InitializeAsync()','AnalyticsService.Instance.StartDataCollection() / StopDataCollection()','AnalyticsService.Instance.RequestDataDeletion()','PlayerPrefs for the recorded answer','SystemInfo.deviceUniqueIdentifier (the identifier not to send)','Application.RequestAdvertisingIdentifierAsync()'],
    snippet:`public class Telemetry : MonoBehaviour {
    async void Start() {
        await UnityServices.InitializeAsync();
        // Initialise early, collect late. The first session is the one people forget.
        if (PlayerPrefs.GetInt("consent.analytics", -1) == 1)
            AnalyticsService.Instance.StartDataCollection();
    }

    public void OnConsent(bool yes) {
        PlayerPrefs.SetInt("consent.analytics", yes ? 1 : 0);
        if (yes) AnalyticsService.Instance.StartDataCollection();
        else AnalyticsService.Instance.RequestDataDeletion();
    }
}`,
    pitfall:`Starting collection in the same call that initialises the service. The first session is captured before the consent dialog is even drawn, so whatever the player then chooses, you already took it. Initialising and collecting are two calls for this reason, and the gap between them is where the question belongs.`,
    map:`Unity's analytics service gated on StartDataCollection is Godot's HTTP client gated on a user:// consent flag.` },
  note:`The consent answer is not only a client setting. It has to reach the server that stores the events and the one that can delete them, which is why the client keeps a local flag and the account keeps the authoritative one. A build that drops events locally while the server still holds last week's is compliant in the UI and not in fact.` });
