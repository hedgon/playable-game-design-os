/* =====================================================================
   ART / AUDIO / FEEL
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'presentation', lens:'design', t:'Art / Audio / Feel', short:'Visual language, animation, VFX, sound, juice', color:'var(--d-presentation)',
    sum:`Presentation makes the game legible and felt. Polish amplifies feedback that already exists. It cannot manufacture meaning where the design has none. Clarity first, then emotion, then spectacle.`,
    links:[['ux','Every visual and audio element is potentially information. Treat it as UI.'],['core','Game feel is the loop as the body experiences it: timing, weight, response.'],['experience','Style, music and animation carry the intended emotion.'],['production','Polish is scheduled last for a reason: it should amplify validated experience.']] });

T('visual-language',{ d:'presentation', t:'Visual language and clarity', tag:'Style serves function. A consistent visual grammar is how the game speaks without words.',
  what:`The rules by which the game’s visuals carry meaning: what danger looks like, what interactable looks like, what friend and foe look like, what important looks like. Art direction sets the mood. Visual language sets the grammar. Both must stay consistent or the player stops trusting their eyes. In Angry Birds a tower the player has never seen still reads at a glance, because pale glass, brown wood and grey stone look and break the same way in every level.`,
  why:[`Players read the world before the HUD. A consistent grammar makes the game legible at a glance.`,`Inconsistent grammar (some red things hurt, some do not) teaches players to ignore signals.`,`Visual language is the cheapest onboarding: it teaches by seeing.`],
  think:{ q:[`What are the ten meanings the player must read instantly? What signals each?`,`Is each signal used for one meaning only?`,`Does the style support readability at the target camera and device, or fight it?`,`What in the scene is noise relative to those meanings?`],
    trade:[`Realistic styles are immersive and hard to read. Stylised ones are legible and demand commitment.`,`Rich detail is beautiful and noisy.`],
    traps:[`Beauty shots that hide danger.`,`Palette decisions made without the gameplay signals in the room.`,`Signals that collide with the fantasy (bright arrows in a grounded world) when a diegetic option existed.`],
    good:[`Players react correctly to things they have never seen before because the grammar told them.`,`Players can say which teammate holds which power-up from silhouette alone, even with four characters on one screen, as Super Mario Bros. Wonder’s elephant form is drawn to allow.`],
    bad:[`Players ask “is that going to hurt me?”`] },
  how:[`List the meanings the player must read. Assign each a unique signal set (shape, color, motion, sound).`,`Audit assets for grammar violations.`,`Squint and desaturation tests on key screens.`,`Test new-player reactions to unseen objects: do they infer correctly?`,`Freeze the danger signal before you reskin: Subway Surfers’ barriers keep their red-and-white stripes in cities as different as a desert frontier town and a festival street.`],
  ai:{ yes:[`Build the meaning-to-signal grammar table from your design and flag collisions.`,`Audit asset lists or screenshot descriptions for violations.`,`Propose diegetic signal alternatives.`],
       no:[`Choose the style. That is identity and authorship.`,`Judge readability. Players show that.`] },
  prompts:[{l:'Visual grammar table',p:`Here are the meanings the player must read instantly in our game: [MEANINGS] and our current visual signals for each: [SIGNALS]. Build a table of meaning to signal (shape, colour, motion, audio). Flag signals used for two meanings and meanings with only one channel. Propose fixes that fit the art direction “[STYLE]” and prefer diegetic signals. Then list what in a typical scene is noise relative to these meanings.`}],
  verify:[`Did it propose signals that fit the art direction or generic HUD-style markers?`],
  test:[`Show new players unseen objects. Do they infer danger, interactability, value correctly?`,`Desaturated screenshot: can testers still identify the key meanings?`],
  rel:[['readability-and-hierarchy','Grammar is how hierarchy is expressed.'],['feedback-and-affordance','Affordance is carried by the grammar.'],['encounters-and-enemies','Enemy readability depends on silhouette and telegraph.'],['environmental-storytelling','The same grammar tells stories.']] });
TECH('visual-language',[
  {n:'Silhouette and shape language', how:`Distinct silhouettes and shape families communicate function and threat instantly.`, fit:`Readability at a glance. Enemies, items, interactables.`, cost:`Constrains art direction. Needs a deliberate grammar.`, alt:`Define shape rules before detailed art.`},
  {n:'Value, contrast and colour hierarchy', how:`Control contrast and colour to direct attention and encode meaning.`, fit:`Guiding the eye, marking interactables and threats, supporting accessibility.`, cost:`Stylistic constraints. A beautiful palette can bury gameplay signals.`, alt:`Do a grey-scale readability pass before colour, and colourblind checks after.`},
  {n:'Style as a promise', how:`Choose and hold a visual style that reinforces the fantasy and is deliverable.`, fit:`Positioning and cohesion across all content.`, cost:`Ambition over reach leaves an unfinished game. Consistency is hard at scale.`, alt:`Pick a style the team can ship at volume.`}
]);
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
    map:`Godot instance shader parameters are Unity’s MaterialPropertyBlock.` },
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
INTERVIEW('visual-language',{
  junior:[
    { q:`What is visual language, and how is it different from art direction?`,
      a:`Art direction sets the mood and the style. Visual language is the grammar: what danger looks like, what is interactable, what is friend and foe, what is valuable. Both must stay consistent, and the grammar is the half that decides whether the player can act.`,
      follow:`Name the ten meanings your last game had to communicate instantly.`,
      red:`Answers with style references and mood boards and never mentions a meaning the player must read.` },
    { q:`Why should one signal carry only one meaning?`,
      a:`Because a signal that sometimes means danger and sometimes means decoration teaches the player to ignore it. Once they stop trusting the grammar, every later signal costs more to establish. Give each meaning its own signal set across shape, colour, motion and sound.`,
      follow:`Art wants red for both the enemy faction and for hazards. What do you propose?`,
      red:`Plans to explain the exception in the tutorial.` },
    { q:`What do the squint test and the desaturation test show you?`,
      a:`Squinting removes detail and leaves the hierarchy, so you see what dominates. Desaturation removes hue and shows what survives for a player who cannot rely on colour. Both are cheap, take a screenshot, and answer whether the grammar reads before the art does.`,
      follow:`The key meanings vanish in the desaturated frame. What is your fix order?`,
      red:`Treats them as art critique tools rather than readability checks.` }
  ],
  mid:[
    { q:`Build a visual grammar table for a game with a grounded style.`,
      a:`List the meanings the player must read instantly, then assign each a signal set across shape, colour, motion and audio. Flag collisions where one signal carries two meanings and gaps where a meaning has only one channel. Prefer diegetic signals in a grounded world: silhouette, material, damage state, posture. Then list what in a normal scene is noise relative to that table.`,
      follow:`You need a threat marker and floating icons would break the fiction. What do you use?`,
      red:`Reaches straight for HUD markers and outlines in a world that had diegetic options.` },
    { q:`Realistic styles are harder to read. How do you manage that?`,
      a:`Use value separation, silhouette discipline and lighting to carry the grammar, and reserve saturation for meaning rather than for beauty. Accept targeted violations of realism where a meaning must survive, and pick them deliberately rather than discovering them in bug reports. Verify on the target device, not on a reference render.`,
      follow:`The art director will not change the palette. What is your next move?`,
      red:`Adds outlines and icons over a realistic scene as the first solution.` },
    { q:`How do you test that the grammar teaches?`,
      a:`Show new players objects they have never seen and ask what they expect: dangerous, usable, valuable, ignorable. Correct inference means the grammar is doing the teaching. Repeat after each content batch, because grammar drifts as the asset count grows.`,
      follow:`How many objects and how many players before you trust the result?`,
      red:`Asks the team whether the new asset reads clearly.` }
  ],
  senior:[
    { q:`A live game with four content teams has drifted into palette chaos. Fix it.`,
      a:`Publish the grammar table as the gate rather than as guidance, and audit each release against it. Give the teams a signal budget so a new feature cannot claim a channel that is already spoken for. Instrument confusion where you can, then stage the corrective passes on the highest-traffic modes first.`,
      follow:`A licensed collaboration arrives with assets that break the grammar. How do you handle it?`,
      red:`Runs one cleanup pass with no gate and expects the drift not to return.` },
    { q:`Marketing wants a beauty pass that hides gameplay-critical signals. Argue it.`,
      a:`Bring the death-cause data and a desaturated frame of the proposed look. Offer the spectacle where the player has no decision to make, and offer a photo mode for the capture. The position is not that beauty is wrong, it is that a signal budget is finite and the decision moments own it.`,
      follow:`What evidence would change your mind?`,
      red:`Concedes to the better-looking frame, or refuses without offering an alternative.` }
  ] });

T('game-feel-and-juice',{ d:'presentation', t:'Game feel and juice', tag:'Polish amplifies feedback that already exists. It cannot manufacture meaning the design lacks.',
  what:`Game feel (Steve Swink): real-time control of virtual objects in a simulated space, with interactions emphasised by polish. Juice is the layer of feedback effects (hit-stop, screen shake, squash and stretch, particles, sound, camera) that makes actions feel consequential. Jan Willem Nijman’s talk “The Art of Screenshake” (Vlambeer) and Martin Jonasson and Petri Purho’s “Juice it or lose it” took one prototype from flat to satisfying with effects alone, changing no rules. It works only when there is a real action and outcome to emphasise. Fruit Ninja is a shipped, commercial-scale version of the same lesson: its swipe-and-slice mechanic worked within three days, and Halfbrick then spent two months polishing it, down to the sound of each slice and how much juice sprayed from the fruit.`,
  why:[`Feel is the first thing players judge and the last thing they can articulate.`,`Juice makes feedback legible and satisfying, which makes learning faster and repetition pleasurable.`,`Juice on a weak loop is lipstick: it delays the discovery that the loop is weak, which is expensive.`],
  think:{ q:[`Is the loop voluntarily replayed without juice? If not, fix the loop first.`,`Which actions and outcomes matter most? Those get the most emphasis.`,`Does the juice communicate cause and outcome, or only spectacle?`,`Is the emphasis proportional? Does the biggest thing look biggest?`],
    trade:[`Heavy juice feels great and buries readability.`,`Restraint keeps clarity and can feel flat.`],
    traps:[`Polishing before the loop is validated.`,`Uniform juice on everything, so nothing stands out.`,`Effects that add latency to the action itself.`],
    good:[`Players describe actions as satisfying and can still read the screen.`],
    bad:[`Players say it looks great and stop playing after ten minutes.`] },
  how:[`Confirm the bare loop is replayed. Then rank actions and outcomes by importance.`,`Add emphasis in order of importance: anticipation, impact, result. One channel at a time, testing readability.`,`Keep input response under about 100 milliseconds. Juice goes after the response, not before.`,`Compare with and without: the juice should make feedback clearer, not just louder.`,`Put the result where the eye already is: Bejeweled 3’s Lightning mode floats a match’s points and a word of praise, “AWESOME!”, over the cleared gems instead of in the score panel.`],
  ai:{ yes:[`Rank polish opportunities by impact per cost from your action and outcome list.`,`Implement feel systems (hit-stop, camera lerp, particles) with exposed tuning values.`,`Check that effects do not add input latency.`],
       no:[`Decide the loop is ready for polish.`,`Judge how it feels.`] },
  prompts:[{l:'Polish priority list',p:`Our loop is validated by [EVIDENCE]. Here are our actions and outcomes ranked by importance: [LIST]. For each of the top 5, propose emphasis across anticipation, impact and result using at most 3 channels (animation, VFX, camera, audio, haptics, hit-stop), estimate implementation cost, and state what the player would understand better because of it. Reject any proposal that would add latency to the input response or obscure the top 3 readable meanings ([MEANINGS]).`}],
  verify:[`Did it check the loop was validated, or polish regardless?`,`Are its effects proportional to importance?`],
  test:[`With and without juice: is feedback clearer, or just louder?`,`Ask players what felt best and why.`,`Does readability survive? “What killed you?” test after adding effects.`],
  rel:[['feedback-and-affordance','Juice is amplified feedback.'],['core-loop','Validate the loop before polishing it.'],['controls-and-friction','Latency is the floor of feel.'],['polish-when','When to polish is a production decision.']] });
TECH('game-feel-and-juice',[
  {n:'Response and control feel', how:`Tune acceleration, input buffering and coyote-time so the character answers the player within milliseconds and forgives small timing errors.`, fit:`Any real-time control scheme. The foundation before adding effects.`, cost:`Over-assisting removes weight and mastery. Too little feels unresponsive.`, alt:`Tune control first, then layer effects.`},
  {n:'Hitstop and impact', how:`Freeze or slow both parties for a few frames on a hit, plus a scale/pose snap, to sell weight.`, fit:`Melee, shooting and any impact that must read as powerful.`, cost:`Too much breaks flow and combos. Needs per-weapon tuning.`, alt:`Vary hitstop by damage and by weapon feel.`},
  {n:'Screenshake, particles and VFX layers', how:`Compose several cheap effects (shake, flash, particles, decals, sound) on the same event.`, fit:`Making routine actions feel consequential.`, cost:`Noise competes with readability. Motion sickness for some players.`, alt:`Make intensity configurable and reserve the biggest effects for rare events.`},
  {n:'Easing and animation curves', how:`Shape motion over time with non-linear curves. Anticipation and follow-through imply force.`, fit:`Menus, camera, UI and character motion.`, cost:`Inconsistent curves make a game feel cheap. Needs a shared vocabulary.`, alt:`A small shared easing library beats per-element improvisation.`}
]);
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
    map:`Godot’s Engine.time_scale with an ignore_time_scale timer is Unity’s Time.timeScale with WaitForSecondsRealtime.` },
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
    map:`Unity’s Time.timeScale with WaitForSecondsRealtime is Godot’s Engine.time_scale with an ignore_time_scale timer.` }});
INTERVIEW('game-feel-and-juice',{
  junior:[
    { q:`What is game feel, and what is juice?`,
      a:`Game feel is real-time control of a virtual object in a simulated space, the moment-to-moment sensation of steering something. Juice is the emphasis layer on top: hit-stop, camera shake, squash and stretch, particles, sound. Juice amplifies feedback that already exists and cannot manufacture meaning the design lacks.`,
      follow:`What does juice not fix?`,
      red:`Uses the two terms interchangeably and treats both as effects work.` },
    { q:`When do you start polishing?`,
      a:`After the bare loop is voluntarily replayed in grey boxes. Polish on a loop that is still changing gets thrown away, and polish on a weak loop delays finding out it is weak. Feel basics such as input latency and clear feedback are not polish, they are legibility, and they come first.`,
      follow:`What counts as evidence that the loop is validated?`,
      red:`Polishes early because it makes the build motivating to work on.` },
    { q:`Where does juice sit relative to the input response?`,
      a:`After it. The acknowledgement of the input should land inside roughly 100 milliseconds, then the emphasis plays. An effect that delays the action itself trades feel for spectacle and players read it as lag.`,
      follow:`Hit-stop freezes the action, so is that not added latency?`,
      red:`Adds a wind-up effect in front of the response and calls the result weighty.` }
  ],
  mid:[
    { q:`Everything in our game is juiced and nothing stands out. Diagnose it.`,
      a:`Rank actions and outcomes by importance and compare with the emphasis each currently gets. Uniform juice flattens the hierarchy, so the biggest thing must look biggest and the routine thing must be quiet. Remove before adding, then check readability again with a what-killed-you pass.`,
      follow:`What do you remove first?`,
      red:`Adds more emphasis to the important action and leaves the rest alone.` },
    { q:`The build looks great and players stop after ten minutes. What happened?`,
      a:`Juice on a weak loop buys the first ten minutes and nothing after. Strip the emphasis in a test build and see whether the bare loop is still replayed. Count decisions per minute and check whether the situation changes between iterations. If it does not, the work is in the loop, not in the effects.`,
      follow:`You cannot strip it because that build is the publisher demo. What now?`,
      red:`Adds more content to extend the ten minutes.` },
    { q:`How many channels do you spend on one action, and why?`,
      a:`Usually two or three: animation plus audio, with camera or hit-stop reserved for the outcomes that matter. The budget exists because every channel spent on a routine action is noise over the readable state. Test with and without and keep the version where the feedback is clearer, not louder.`,
      follow:`Which channel gives the most per unit of cost?`,
      red:`Stacks every channel on every action and judges the result by how it looks in a clip.` }
  ],
  senior:[
    { q:`Set the polish gate for a studio. What does it look like?`,
      a:`Split the work into legibility, which is required before any test means anything, and emphasis, which needs validation evidence for the system it sits on. Rank emphasis tasks by impact per hour on the most frequent player actions. Re-test readability after each pass, and record which systems have evidence so the gate is checkable rather than cultural.`,
      follow:`A milestone demo needs to look finished next month. How do you hold the gate?`,
      red:`Ranks all polish tasks together and lets the schedule decide the order.` },
    { q:`Players say the game feels floaty. Turn that into work.`,
      a:`Decompose it: input latency, animation commitment and recovery, camera response, acceleration curves, feedback on contact. Each is measurable and each produces a different complaint. Fix the measurable ones first and re-ask the question, because floaty is a summary of several defects and the team will otherwise argue about taste.`,
      follow:`What would you measure to know weight improved?`,
      red:`Adds screen shake and heavier sound effects and asks whether it feels better now.` }
  ] });

T('audio-and-music',{ d:'presentation', t:'Audio and music', tag:'Sound is the fastest feedback channel and the most direct emotional control you have.',
  what:`Sound effects as feedback (confirm, warn, reward, locate), music as emotional pacing (tension, release, identity), and the mix as hierarchy (what is heard first). Audio reaches the player faster than vision and works while they look elsewhere.`,
  why:[`Audio feedback lands while the eyes are busy. It is the main channel for off-screen and peripheral information.`,`Music changes the felt intensity of a scene without changing its rules, so it can raise or settle tension in seconds.`,`A bad mix buries critical signals under spectacle.`],
  think:{ q:[`Which critical signals need to reach a player who is looking elsewhere?`,`Does the music track the intended intensity curve, or play regardless?`,`What is the loudest thing in the mix? Is it the most important?`,`Mute the game: what stops working?`],
    trade:[`Dynamic music tracks the play and can feel manipulative or repetitive.`,`Rich soundscapes are immersive and mask feedback.`],
    traps:[`Audio as the last hire.`,`Critical information in audio only, with no visual redundancy.`,`Music that plays the same during rest and peak.`],
    good:[`Players react to threats before they see them.`,`Players hum the music.`],
    bad:[`Players turn the music off or say they never noticed a warning.`] },
  how:[`List critical signals. Give each a distinct sound and a visual backup.`,`Map music states to the intensity curve.`,`Mix by hierarchy: feedback over ambience, warnings over music.`,`Test muted and test with eyes closed for the key signals.`],
  ai:{ yes:[`Map signals to audio cues and flag collisions.`,`Design music-state logic tied to game state.`,`Prototype audio systems and mixing rules.`],
       no:[`Compose the identity. Style and taste are authorship.`] },
  prompts:[{l:'Audio signal map',p:`Here are our critical signals and the moments they matter: [LIST]. For each, propose a distinct audio cue (character, duration, priority) and the visual redundancy. Then propose a music-state model with states tied to [GAME STATES] and transitions, matching this intensity curve: [CURVE]. Identify signals that would collide in the mix and a priority rule to resolve them.`}],
  verify:[`Did it provide visual redundancy for each audio-only signal?`],
  test:[`Eyes-closed test for key signals.`,`Muted test: what breaks?`,`Ask players to describe the mood of a section. Compare with intended.`],
  rel:[['tension-release','Music is the tension controller.'],['feedback-and-affordance','Sound is the fastest feedback.'],['accessibility','Audio-only signals need redundancy.']] });
TECH('audio-and-music',[
  {n:'Interactive music layering', how:`Stems or transitions that add and remove layers based on game state or tension.`, fit:`Dynamic pacing, combat escalation, exploration.`, cost:`Composition and implementation cost. Transitions can feel mechanical.`, alt:`Vertical layering plus a few authored stingers may be enough.`},
  {n:'Adaptive/foley and audio feedback', how:`Sound is triggered by state and carries information (material, distance, readiness).`, fit:`Readability and game feel. Confirming actions and threats.`, cost:`Mix clutter. Needs priority and ducking.`, alt:`Reserve the foreground for gameplay-critical cues.`},
  {n:'Mixing, ducking and accessibility', how:`Priority systems, dynamic range control and visual alternatives (subtitles, captions, haptics).`, fit:`Ensuring critical information survives any audio setup.`, cost:`Extra work. Under-planned until a playtest reveals it.`, alt:`Design the information hierarchy first, then mix to it.`}
]);
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
INTERVIEW('audio-and-music',{
  junior:[
    { q:`Why is audio the fastest feedback channel?`,
      a:`It reaches the player while their eyes are busy elsewhere, which makes it the main channel for off-screen and peripheral information. It also carries emotional state more directly than any other element. That is why critical warnings usually live in sound first.`,
      follow:`Which of those signals still needs a visual backup, and why?`,
      red:`Treats audio as atmosphere added at the end.` },
    { q:`What does the mix have to do with hierarchy?`,
      a:`The loudest thing is what the player hears first, so the mix is a ranking whether or not anyone planned it. Feedback should sit above ambience and warnings above music. If the most important cue is not the most audible one, the mix is inverted.`,
      follow:`How would you check that in a busy combat scene?`,
      red:`Describes the mix as an audio department concern with no design input.` },
    { q:`What do the mute test and the eyes-closed test reveal?`,
      a:`Muting shows which information existed only in sound, which is both an accessibility gap and a problem for players in noisy rooms. Closing your eyes shows whether the key signals are distinct enough to act on without vision. Both take minutes and both find real gaps.`,
      follow:`Your game fails the mute test on one critical signal. What do you do?`,
      red:`Concludes that players should use headphones.` }
  ],
  mid:[
    { q:`Design a music-state model for a stealth game.`,
      a:`Define states tied to game state: unaware, suspicious, searching, alerted, resolved, and the transitions between them with the rules for entering each. Match the intensity curve so music tracks tension rather than playing regardless. Guard against thrashing between states, because rapid switching reads as a bug.`,
      follow:`How do you keep it from feeling manipulative or repetitive over twenty hours?`,
      red:`Plays a single combat track whenever an enemy is nearby.` },
    { q:`Why is information carried in audio only a defect?`,
      a:`Players with hearing impairments lose it, players in loud rooms lose it, and players on phone speakers lose it. Redundancy costs one visual channel and buys the signal for everyone. The fix is a distinct visual for the same meaning, not a subtitle line describing the sound.`,
      follow:`How do you add the redundancy without cluttering the HUD?`,
      red:`Adds a text caption that names the sound and considers it handled.` },
    { q:`Two critical cues collide in the mix. Resolve it.`,
      a:`Give them distinct character, duration and frequency range so they do not mask each other, then set an explicit priority rule with ducking for the lower one. Publish the priority list so new content cannot claim the top slot by being loud. Verify in the worst case, not in isolation.`,
      follow:`Who owns that priority list as the content grows?`,
      red:`Raises the volume of the more important cue and moves on.` }
  ],
  senior:[
    { q:`Audio was hired late. What has been lost and what can you recover?`,
      a:`What is lost is signal design that should have shaped the systems: cues as part of the feedback matrix, states hooked into game state, events instrumented at the source. Recover by instrumenting the events first, then building the mix hierarchy around the critical signals, then music states. Identity and ambience come last because they depend on the rest.`,
      follow:`You have three months. What is the first thing you do?`,
      red:`Starts with the soundtrack because it is the most visible deliverable.` },
    { q:`How do you evaluate whether the music is doing its job?`,
      a:`Ask players to describe the mood of a section and compare with the intended curve. Watch whether they turn the music off and when. Check that rest and peak do not sound the same. Liking is not the measure, tracking the intensity curve is.`,
      follow:`Testers say they like the score and turn it off after an hour. What does that mean?`,
      red:`Reports positive comments about the soundtrack as evidence it works.` }
  ] });

T('animation-and-vfx',{ d:'presentation', t:'Animation, VFX and camera', tag:'Anticipation tells the player what is coming. Impact tells them it happened. Timing is the design.',
  what:`Motion as communication: anticipation frames that telegraph, impact frames that confirm, follow-through that sells weight, camera behaviour that frames the decision, hit reactions that show the state change. In gameplay, animation timing is a rules decision: it defines windows, telegraphs and commitment.`,
  why:[`Animation timing is how players read enemy intent and their own commitment. It is the fairness of action games.`,`Camera decides what the player can see and therefore what decisions they can make.`,`VFX carry state (on fire, shielded, empowered) faster than any icon.`],
  think:{ q:[`For each enemy attack: how long is the telegraph, and is it readable at the intended camera distance?`,`For each player action: how long is the commitment, and does the player know it?`,`What does the camera hide at the worst moment?`,`Does the VFX for a state read as that state to a new player?`],
    trade:[`Long telegraphs are fair and slow. Short ones are exciting and unfair.`,`Dramatic cameras look great and hide threats.`],
    traps:[`Animation beauty over gameplay timing.`,`VFX that read as the wrong thing (healing that looks like damage).`,`Camera that fights the player at the decision moment.`],
    good:[`Players react to telegraphs they have never seen.`,`Players describe hits as weighty.`],
    bad:[`Players die to attacks they say had no warning.`] },
  how:[`Define telegraph and commitment windows as rules first, then animate to them.`,`Test readability of telegraphs at the target camera and lighting.`,`Assign each state a distinct VFX and verify new-player interpretation.`,`Review camera at the top ten decision moments: what is visible?`],
  ai:{ yes:[`Audit telegraph and commitment windows against fairness heuristics.`,`Propose VFX grammar per state and flag collisions.`,`Analyze death logs for “no warning” clusters.`],
       no:[`Decide the feel of the animation style.`] },
  prompts:[{l:'Telegraph fairness audit',p:`Here are our enemy attacks with telegraph durations, damage and the camera distance and pace at which they appear: [LIST]. For each, estimate whether a player at [SKILL] can perceive and react within the window, given human reaction time and the visual noise you would expect. Flag attacks where the window is too short for the punishment, and propose changes to telegraph length, visibility or punishment, not to damage alone.`}],
  verify:[`Did it use realistic reaction times and account for visual noise?`],
  test:[`“Did you see it coming?” after deaths.`,`Do new players react correctly to first-seen telegraphs?`,`Do players misread any VFX state?`],
  rel:[['game-feel-and-juice','Animation timing is game feel.'],['encounters-and-enemies','Telegraphs are enemy readability.'],['difficulty','Unfairness is often telegraph failure.'],['visual-language','VFX is part of the grammar.']] });
TECH('animation-and-vfx',[
  {n:'State-machine animation', how:`Blend between clips driven by gameplay state and transitions with blend times.`, fit:`Most character animation where states are discrete and readable.`, cost:`Transitions can pop. Combinatorics grow with layered actions.`, alt:`Add blending/IK for the seams. Consider motion matching for large, smooth sets.`},
  {n:'Motion matching / procedural motion', how:`Pick the best-matching pose from a database each frame, or generate motion procedurally.`, fit:`Large, fluid movement sets (locomotion, parkour) where authored transitions are too costly.`, cost:`Data-heavy, harder to control authorially, debuggability is poor.`, alt:`Keep authored clips for signature moves. Motion match locomotion.`},
  {n:'Camera behaviour as design', how:`Rules for framing, follow, shake, zoom and cut that carry information and emotion.`, fit:`Tension, speed, scale and combat readability.`, cost:`A camera that fights the player is one of the worst bugs to ship. Needs playtests.`, alt:`Treat camera as a first-class system with its own tuning and accessibility options.`}
]);
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
    pitfall:`Setting an enemy’s Animator to Cull Completely while hitboxes are driven by AnimationEvents. Off camera the state machine stops entirely, its windup event never fires, and it either never attacks or attacks with a hitbox that was never switched off. The bug only appears at the screen edge, which is exactly where nobody reproduces it.`,
    map:`A Unity Animator controller with AnimationEvents is a Godot AnimationTree with animation tracks.` }});
INTERVIEW('animation-and-vfx',{
  junior:[
    { q:`What is a telegraph, and what makes one fair?`,
      a:`The anticipation that tells the player what is coming. It is fair when the window is long enough for a human to perceive and answer it at the intended camera distance, with the visual noise the scene has. The window and the punishment must be sized against each other, because a short tell with a heavy cost reads as cheating.`,
      follow:`How short is too short, and how did you arrive at that number?`,
      red:`Treats telegraph length as an animation preference rather than a rule.` },
    { q:`What is commitment, and does the player know it?`,
      a:`The period during which the player cannot change their decision: the swing, the recovery, the cancel window. It is a rules decision expressed through animation, so it has to be legible before the input and consistent after it. If players cannot feel where the commitment ends, they read the result as random.`,
      follow:`How do you communicate a cancel window?`,
      red:`Describes animation timing purely as a matter of how good the motion looks.` },
    { q:`Give an example of visual effects carrying state, and how that fails.`,
      a:`Burning, shielded, empowered and stunned are all states players must read at a glance, faster than any icon. The failure is a collision, such as a healing effect that reads like fire, or a buff and a debuff sharing a colour. Verify by showing a new player the state and asking what they think it does.`,
      follow:`How do you verify a new effect does not collide with an existing one?`,
      red:`Assumes the effect is clear because the team knows what it means.` }
  ],
  mid:[
    { q:`Players say attacks arrive with no warning. Investigate.`,
      a:`Cluster the deaths by attack and look at what was on screen at the moment of the tell. Check telegraph duration against reaction time, then check occlusion, camera framing and effect noise. Confirm whether an audio cue exists for the off-screen case. The fix is usually visibility, not duration.`,
      follow:`The telegraph is 600 milliseconds but the attacker is off screen. What changes?`,
      red:`Lengthens every telegraph without finding which ones were unseen.` },
    { q:`Why define windows as rules first and animate to them second?`,
      a:`Because the windows are the fairness and the balance, and animation is how they are communicated. If the animation sets the timing, every artistic revision silently rebalances the fight. Publish frame data as the source of truth and let the animator work against it.`,
      follow:`The animator insists a longer wind-up is needed for the motion to read. How do you resolve it?`,
      red:`Lets the animation drive the numbers and rebalances afterwards.` },
    { q:`What do you check at the top ten decision moments for the camera?`,
      a:`What is hidden, what the camera is fighting, whether the threat is framed, and whether lock-on or auto-framing takes control at the wrong instant. A dramatic camera that hides a telegraph converts a fair fight into an unfair one. Capture the moments and review them as frames, not as a feeling.`,
      follow:`The most dramatic camera angle hides the second enemy. What do you do?`,
      red:`Judges the camera on how the footage looks in a trailer.` }
  ],
  senior:[
    { q:`Beautiful animation and a persistent fairness complaint. Plan the fix.`,
      a:`Audit every attack for window against punishment, then for visibility given noise and camera. Separate the attacks that are too fast from the ones that are merely unseen. Change telegraph length, visibility or punishment rather than damage alone, and re-measure with the same death clustering you used to find it.`,
      follow:`Expert players say the fight got easier. How do you answer that?`,
      red:`Reduces damage across the board and declares the fairness issue solved.` },
    { q:`How do you own the boundary between animation and combat design across a large team?`,
      a:`One source of truth for the windows, readable by both disciplines, with tooling that shows frame data next to the animation. Put the window spec in the review gate so a motion change that moves a window is a visible change. Review in the build at the target camera, because the numbers and the perception can disagree.`,
      follow:`What is the artifact both disciplines sign off on?`,
      red:`Relies on the two teams talking to each other and calls that the process.` }
  ] });
