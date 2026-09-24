/* =====================================================================
   UX / UI
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'ux', lens:'design', t:'UX / UI', short:'Readability, feedback, onboarding, controls, friction', color:'var(--d-ux)',
    sum:`UX is not decoration on top of design. It is the channel through which every decision reaches the player. If the player cannot perceive the state, the choice or the consequence, the design does not exist for them.`,
    links:[['core','Feedback closes the loop: without it action has no consequence the player can learn from.'],['player','Cognitive load is relative to what this player already knows.'],['presentation','Visual language and audio are UI when they carry information.'],['ai','AI is good at friction audits, heuristic reviews and flow analysis when you give it the artifacts.']] });

T('ux-as-design',{ d:'ux', t:'UX is game design, not decoration', tag:'Every UI element exists to support a decision. If it does not, it is noise.',
  what:`Game UX (Celia Hodent’s framing) has two halves: usability (can the player perceive, understand and act?) and engage-ability (do they want to?). The UI is the channel through which state, choices and consequences reach the player. A decision the player cannot perceive does not exist for them. Six questions apply to every element: what decision does it support, what information does the player need, when, how fast must they parse it, what happens if they miss it, and could the world communicate it instead?`,
  why:[`Most “the game is confusing” complaints are UX failures in the design, not in the art.`,`UI competes with the world for attention. Every element in the HUD is a moment not spent looking at the game.`,`Onboarding, feedback and readability decide the first ten minutes, and the first ten minutes decide retention.`],
  think:{ q:[`For this element: what decision does it support? When? At what parse speed? What if missed? Could the world carry it?`,`What must the player know at this moment, and what is merely available?`,`Which conventions from the player’s other games can I lean on?`,`What is the player looking at when this information matters? Put it there.`],
    trade:[`Diegetic information (in the world) is immersive and slower to parse. HUD information is fast and distracting.`,`Showing everything reduces recall load and increases visual load.`],
    traps:[`Designing UI last, as a skin on the systems.`,`Exposing internal state (every stat) because it exists.`,`Using text for what a shape, colour or sound could say.`],
    good:[`Players act on information without reading. They glance and move.`,`The HUD can be hidden and the game still communicates.`],
    bad:[`Players read the HUD during action. Players ask what a number means.`] },
  how:[`Inventory every UI element. Answer the six questions for each. Cut or move anything with no decision behind it.`,`Map information to moments: what does the player need before, during and after an action?`,`Prototype the world-first version: can the game communicate this without HUD? Add HUD only where it cannot.`,`Run usability tests with the target player: task-based, silent observation, then questions.`],
  ai:{ yes:[`Audit a HUD screenshot or element list against the six questions.`,`Apply usability heuristics (Nielsen, Hodent’s pillars) to flows you describe.`,`Propose diegetic alternatives for HUD elements.`],
       no:[`Judge whether the interface feels right. That is observed with players.`,`Decide the information density appropriate to your player.`] },
  prompts:[{l:'Six-question HUD audit',p:`Here is our HUD element list (or screenshot description) and the decisions the player makes in this mode: [ELEMENTS, DECISIONS]. For each element answer: the decision it supports, the information it carries, when it is needed, how fast it must be parsed, what happens if missed, and whether the world could carry it instead. Flag elements with no decision behind them and elements needed during action that require reading. Propose a minimal HUD and list what moves to the world.`}],
  verify:[`Did it keep elements because they are genre standard rather than because a decision needs them?`,`Are its parse-speed claims plausible for your actual camera distance and pace?`],
  test:[`Eye direction during action: are players reading the HUD?`,`Hide the HUD for a session. What do players fail to understand?`,`Ask players what a specific element means. Wrong answers mean the element is noise or misdesigned.`],
  rel:[['readability-and-hierarchy','Hierarchy is how the UI decides what is seen first.'],['feedback-and-affordance','Feedback is the UI of consequences.'],['onboarding','Onboarding is UX applied to the first minutes.'],['visual-language','Art carries information too.']] });
DIAGRAM('ux-as-design', { kind:'stack', title:'One attention budget, sorted by how fast it must be read', taper:true, arrow:'read fastest at the top',
  layers:[{t:'The decision in action', d:'size, contrast and motion, never text'},{t:'State checked between actions', d:'recognition, not recall; the world can carry most of it'},{t:'Reference only', d:'read when stopped; if nobody uses it, cut it'}] });
TECH('ux-as-design',[
  {n:'Friction audit', how:`Count the steps, clicks and cognitive demands for the most common tasks.`, fit:`Finding hidden churn in menus and flows.`, cost:`Needs telemetry or observation to know the real tasks.`, alt:`Instrument top flows. Cut steps.`},
  {n:'Heuristic review', how:`Evaluate the interface against known usability heuristics (clarity, consistency, error recovery, feedback).`, fit:`A fast, cheap UX pass before playtests.`, cost:`Generic heuristics miss game-specific feel.`, alt:`Pair with think-aloud playtests.`},
  {n:'First-time user experience', how:`Design and measure the very first minutes like a separate feature.`, fit:`Retention. The highest-leverage fix.`, cost:`Easy to under-resource. Needs instrumentation.`, alt:`Time-to-fun as a tracked metric.`}
]);
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
    pitfall:`Building the HUD frame from a full-rect Panel, ColorRect or plain Control. Those default to MOUSE_FILTER_STOP, so the frame silently swallows every click meant for the world underneath. Containers such as MarginContainer default to PASS and let unhandled clicks through. The world stops responding and nothing in the input code looks wrong, because the event never reached it.`,
    map:`Godot Control nodes under a CanvasLayer with a Theme are Unity uGUI under a Canvas with a CanvasScaler, or UI Toolkit’s UIDocument with USS.` },
  unity:{ term:`uGUI Canvas with a CanvasScaler for world-facing HUD, or UI Toolkit UIDocument with USS for menus. Raycast targets are switched off on anything decorative, and CanvasGroup carries the “available” state.`,
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
INTERVIEW('ux-as-design',{
  junior:[
    { q:`What is the user interface for in a game, and how do you decide whether an element belongs in the HUD?`,
      a:`The UI is the channel through which state, choices and consequences reach the player. Run the six questions on the element: what decision does it support, what information does the player need, when do they need it, how fast must they parse it, what happens if they miss it, could the world carry it instead. An element with no decision behind it is noise and competes with the world for attention. Give one element you cut and what the player lost.`,
      follow:`Which element in your last HUD would you cut first, and what breaks when you do?`,
      red:`Keeps an element because the genre always has one, or answers with layout and style instead of a decision.` },
    { q:`A playtester says the game is confusing. How do you tell a UX problem from a design problem?`,
      a:`Separate usability from engage-ability. Usability is whether they can perceive, understand and act. Design is whether the thing they perceived is worth doing. Watch where they hesitate, what they misread, and what they ask. If they can state the goal and still cannot act, it is usability. If they act correctly and do not care, it is the design.`,
      follow:`They can act but they cannot say why they chose that option. Which is it?`,
      red:`Proposes a tutorial pop-up before watching anyone play.` },
    { q:`What does diegetic information mean, and when would you use it?`,
      a:`Information carried by the world rather than by an overlay: ammunition on the weapon model, health in the character’s posture, a threat heard before it is seen. It is more immersive and slower to parse. Use it when the player has time and when the fantasy is the point. Keep the HUD for information needed inside a second during action.`,
      follow:`Where would you refuse to go diegetic, and why?`,
      red:`Treats diegetic as a style choice with no parse-speed argument.` }
  ],
  mid:[
    { q:`Walk me through a HUD audit you have run.`,
      a:`Inventory every element. For each, answer the six questions and record the decision it supports. Cut elements with no decision, move slow ones into the world, and rank the rest by how fast they must be read. Then map information to moments: what is needed before, during and after each action. Name what the team pushed back on and how you settled it.`,
      follow:`Which cut did the team refuse, and what evidence would have changed their mind?`,
      red:`Describes a visual restyle and calls it an audit.` },
    { q:`How do you run a usability test on a game interface?`,
      a:`Recruit players who match the model, not colleagues. Give a task, then observe silently with no help. Log hesitations, wrong targets, repeated attempts and questions asked aloud. Ask open questions afterwards, starting with what they did, never with whether they liked it. Report behaviour separately from opinion.`,
      follow:`Two of six testers missed the same button. Is that a pattern?`,
      red:`Asks testers whether the UI looks good and reports the answers as findings.` },
    { q:`Our combat HUD has eleven elements and players still miss the one that matters. What do you do?`,
      a:`Rank the eleven by decision importance and compare with current visual weight. Count how many the player must track at once during action. Move anything not needed inside that second out of the action view. Then test whether players act on the top item without reading it. A crowded HUD is a hierarchy problem before it is a count problem.`,
      follow:`You cannot remove anything because each element has an owner. Now what?`,
      red:`Adds a highlight or an arrow to the important element and leaves the other ten.` }
  ],
  senior:[
    { q:`The art director wants a near-empty HUD and the combat designer wants every stat visible. Arbitrate.`,
      a:`Neither preference decides it. List the decisions the player makes in that mode, the information each needs, and the parse speed. That converts a taste argument into a testable one. Propose the minimal HUD plus a world-first alternative for the slow items, then run a task-based test with matched players and let the misses settle it.`,
      follow:`Neither side has playtest data and the milestone is in two weeks. What do you do?`,
      red:`Splits the difference, or lets the more senior person win.` },
    { q:`How do you get UX treated as design in a studio where UI is scheduled last?`,
      a:`Tie it to the numbers the studio already cares about: early churn, first-session completion, support load. Put a cheap silent test into the existing milestone review so UX evidence arrives at the same time as the build. Do the first audit yourself and show a cut list with player quotes. Culture changes when a finding lands before a milestone, not when a document circulates.`,
      follow:`You get one recurring half day a week. How do you spend it?`,
      red:`Blames the studio culture and asks for a dedicated team before showing any evidence.` }
  ] });

T('readability-and-hierarchy',{ d:'ux', t:'Readability, hierarchy and cognitive load', tag:'The player has one attention budget. Spend it on decisions, not on parsing.',
  what:`Readability: can the player perceive game state at the speed the game demands? Hierarchy: does the most important information stand out first? Cognitive load: how much must the player hold in mind to act? Hodent’s framing separates cognitive load (thinking), memory load (remembering) and physical load (inputs). Each has a budget set by the player and the pace.`,
  why:[`A decision the player cannot perceive in time is not a decision. It is a surprise.`,`Cognitive load is where complexity is paid. Front-loading it churns players.`,`Hierarchy failures make a legible game feel chaotic and an easy game feel hard.`],
  think:{ q:[`What must the player perceive within one glance during action? Is it the biggest, brightest, most contrasting thing?`,`How many pieces of state must they track at once? More than a handful is a problem at pace.`,`What can be offloaded to the world (spatial memory) or to the UI (recognition instead of recall)?`,`Is the visual noise (VFX, particles, crowd) hiding the signal?`],
    trade:[`Dense information supports expert play and overwhelms new players.`,`Strong hierarchy clarifies and flattens the visual richness.`],
    traps:[`Adding VFX for feel that bury the readable state.`,`Consistency broken for style: the same meaning shown two ways.`,`Testing readability on a large monitor when the platform is a phone.`],
    good:[`Players react to threats they have not consciously noticed.`,`New players describe the screen as “clear”.`],
    bad:[`Players die to things they say they never saw.`] },
  how:[`Rank information by decision importance. Assign visual weight (size, contrast, motion, position) in that order.`,`Count tracked state during action. Reduce, chunk, or move to recognition.`,`Squint test and desaturation test on screenshots: does the hierarchy survive?`,`Test on the target device at the target distance.`],
  ai:{ yes:[`Rank information by decision importance from your design and flag hierarchy inversions in a screenshot description.`,`Count tracked state per mode and propose chunking.`,`Suggest visual-weight assignments and consistency fixes.`],
       no:[`Judge whether a screen is readable. Only observation on the target device shows that.`] },
  prompts:[{l:'Hierarchy audit',p:`Here is a description of our screen during [MODE] and the decisions the player makes there: [DESCRIPTION]. Rank the information by decision importance. Compare with the current visual weight (size, contrast, motion, position) and flag inversions. Count pieces of state the player must track simultaneously. Propose the smallest changes to make the top 3 items dominant and to reduce tracked state below [N].`}],
  verify:[`Does it know the target device and viewing distance? If not, its claims are guesses.`],
  test:[`“What killed you?” after each death. Track “I did not see it”.`,`Flash a screenshot for one second and ask what the player saw.`,`Test on the target device.`],
  rel:[['ux-as-design','Hierarchy implements the six questions.'],['visual-language','Visual language is the palette of readability.'],['pacing','Cognitive pacing is load over time.'],['depth-vs-complexity','Complexity is paid as cognitive load.']] });
DIAGRAM('readability-and-hierarchy', { kind:'stack', title:'One attention budget, sorted by how fast it must be read', taper:true, arrow:'read fastest at the top',
  layers:[{t:'The decision in action', d:'size, contrast and motion, never text'},{t:'State checked between actions', d:'recognition, not recall; the world can carry most of it'},{t:'Reference only', d:'read when stopped; if nobody uses it, cut it'}] });
TECH('readability-and-hierarchy',[
  {n:'Information hierarchy and affordances', how:`Rank every piece of on-screen and in-world information. Only the top rank should dominate.`, fit:`Action and systems-heavy games where the screen floods.`, cost:`Requires discipline. Designers add information faster than they remove it.`, alt:`Cap the “always visible” set and move the rest to demand.`},
  {n:'Cognitive load budgeting', how:`Count the simultaneous demands on attention and memory, and reduce them.`, fit:`Onboarding, complex systems, and moments of high action.`, cost:`Quantifying load is heuristic. Use think-aloud tests.`, alt:`Pair with the readability playtest questions.`},
  {n:'Grey box / clarity pass', how:`Make the game readable in grey boxes before art. If it fails without polish, polish will not fix it.`, fit:`Early validation of layout and feedback.`, cost:`Some feel depends on art. Schedule a later feel pass.`, alt:`Clarity first, then emotion, then spectacle.`}
]);
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
    map:`Unity CanvasScaler plus TMP font sizes is Godot’s project stretch mode plus Theme font sizes.` }});
INTERVIEW('readability-and-hierarchy',{
  junior:[
    { q:`What does readability mean in a game, and how is it different from a clean-looking screen?`,
      a:`Readability is whether the player can perceive game state at the speed the game demands. A clean screen can still be unreadable if the most important thing is not the loudest thing. Hierarchy is the ranking, visual weight is how it is expressed, and the target is set by the pace and the device.`,
      follow:`How would you check that on a phone held at arm’s length?`,
      red:`Answers with fonts, spacing and palette and never mentions speed or decisions.` },
    { q:`Name the tools you have for giving an element visual weight.`,
      a:`Size, contrast, motion, position, and isolation from clutter. Rank the information by decision importance first, then assign weight in that order. Check the ranking survives a squint test and a desaturation test, because both strip the decoration and leave the hierarchy.`,
      follow:`Which of those tools still works for a player who cannot separate red from green?`,
      red:`Makes the important thing bigger and red without ranking anything.` },
    { q:`Players keep dying to things they say they never saw. What are the candidate causes?`,
      a:`The signal is buried under effects, the hierarchy is inverted so something less important dominates, the threat is off screen or occluded, the telegraph is shorter than a human reaction, or the team tested on a large monitor and shipped to a small screen. Each has a different fix, so find which before touching damage numbers.`,
      follow:`How would you tell an occlusion problem from a telegraph problem this week?`,
      red:`Concludes the players are careless, or adds a warning icon before diagnosing.` }
  ],
  mid:[
    { q:`How much state can a player track at once during action, and what do you do when you exceed it?`,
      a:`A handful at pace, fewer as the pace rises, and the number is a budget you verify rather than a constant you quote. Reduce by chunking related state into one readable object, converting recall into recognition, or offloading to the world where spatial memory carries it. Then re-test the top three items during action, not at rest.`,
      follow:`What did you remove on a shipped game, and what did it cost?`,
      red:`Quotes a memory-span number with no reference to pace or to the mode being played.` },
    { q:`The game is readable on your monitor and unreadable on the target handheld. Process?`,
      a:`Test on the device at the real viewing distance before changing anything. Then re-rank the information for the smaller screen, because the budget shrank and the ranking must too. Fix hierarchy before scale: uniform scaling keeps the inversion and eats the world. Verify with a one-second flash test asking what the player saw.`,
      follow:`The artist says the scene looks worse at the new sizes. How do you answer?`,
      red:`Scales the whole interface up and calls it a device pass.` },
    { q:`New players call the screen chaotic and veterans want more density. Serve both.`,
      a:`Fix the hierarchy first, because a chaotic screen is usually an inverted one and both groups suffer from it. Then let density be opt-in for the information that is optional, never for the top three items. Progressive disclosure keeps one layout and one grammar, which is what keeps it maintainable.`,
      follow:`How do you avoid maintaining two HUDs forever?`,
      red:`Ships an advanced HUD toggle as the first move without ranking anything.` }
  ],
  senior:[
    { q:`You own readability on a live game with five years of accumulated effects. Where do you start?`,
      a:`Write the list of meanings the player must read instantly and treat it as a budget. Instrument deaths and confusion so you have a baseline before touching art. Audit the worst mode against the budget, ship one staged pass, and re-measure. Then publish the grammar so new content is checked against it rather than added on top of it.`,
      follow:`How do you stop it re-accumulating after you move on?`,
      red:`Proposes a full visual rework with no measurement and no gate for future content.` },
    { q:`Marketing wants a spectacle beat that buries the readable state. How do you argue it?`,
      a:`Do not argue on taste. Show the death-cause data from the section, run the desaturation test on the proposed frame, and offer an alternative that keeps the spectacle where the player has no decision to make. Spectacle at a rest beat costs nothing. Spectacle over a decision costs fairness.`,
      follow:`They still want it in the boss fight. What is your compromise?`,
      red:`Concedes because the shot looks good, or refuses without offering a place where it works.` }
  ] });

T('feedback-and-affordance',{ d:'ux', t:'Feedback and affordance', tag:'Affordance says what you can do. Feedback says what you did. Without both, there is no learning.',
  what:`Affordance (Don Norman): the actions an object makes possible for a given player. Signifier: the perceivable cue that says where and how to act. Norman added the second term in 2013 because designers were using “affordance” for the cue. Feedback: the game responds to an action in a way that tells the player what happened, whether it worked, and why. The feedback loop is the learning mechanism of games. Dan Cook’s skill atom is action, simulation, feedback, model update.`,
  why:[`Without affordance the player does not know what to try. Without feedback they do not know what happened. Either breaks learning.`,`Failures with no legible cause feel unfair regardless of the actual fairness.`,`Feedback is where polish attaches: juice is amplified feedback.`],
  think:{ q:[`For each player action: what does the game do in the first 100 milliseconds? What tells them it worked? What tells them it failed and why?`,`Can the player tell interactable from decoration at a glance?`,`Is feedback proportional to importance? Do big consequences look big?`,`Does feedback teach, or only confirm?`],
    trade:[`Rich feedback on everything raises noise and hides the important signals.`,`Subtle feedback feels elegant and gets missed by new players.`],
    traps:[`Feedback that confirms the input but not the outcome (the button flashed, the attack whiffed silently).`,`Affordances broken by inconsistent art (some doors open, identical doors do not).`,`Delayed feedback (damage numbers a second later) that breaks the causal link.`],
    good:[`Players correct their behaviour after one failure.`,`Players try things unprompted because objects look usable.`],
    bad:[`Players repeat a failing action several times. Players ask “did that do anything?”`] },
  how:[`List player actions. For each, write the feedback for success, failure and partial result, with timing.`,`Fix missing failure feedback first. It is the most common gap.`,`Audit interactable objects for consistent signifiers.`,`Test: after an action, ask “what happened?” Accuracy measures feedback quality.`],
  ai:{ yes:[`Audit an action list for missing or delayed feedback.`,`Propose feedback channels (visual, audio, haptic, camera) per action and outcome.`,`Review object descriptions for signifier consistency.`],
       no:[`Judge whether feedback feels good. That is game feel, observed.`] },
  prompts:[{l:'Feedback matrix',p:`Here are the player actions and possible outcomes in [MODE]: [LIST]. Build a matrix of action x outcome (success, failure, partial) and fill each cell with the feedback the game currently gives and its timing. Flag empty cells and cells with more than 200 ms delay. For each flag, propose feedback that communicates the cause, not just the result, using at most two channels.`}],
  verify:[`Did it propose feedback that confirms input rather than explains outcome?`],
  test:[`After an action, ask “what happened and why?” Track accuracy.`,`Count repeated failing actions before a player changes behaviour.`,`Which objects do players try to interact with that are not interactable, and vice versa?`],
  rel:[['core-loop','Feedback is a link of the loop.'],['game-feel-and-juice','Juice is amplified feedback.'],['challenge-failure-recovery','Failure needs cause feedback.'],['visual-language','Affordances are carried by art.']] });
DIAGRAM('feedback-and-affordance', { kind:'loop', title:'The loop that teaches: Dan Cook’s skill atom',
  steps:[{t:'Action', d:'the player does something'},{t:'Simulation', d:'the rules resolve it'},{t:'Feedback', d:'the game shows what happened'},{t:'Model update', d:'the player updates belief'}] });
TECH('feedback-and-affordance',[
  {n:'Feedback layering', how:`Stack visual, audio and haptic cues on one event so it reads regardless of channel.`, fit:`Making actions and state legible.`, cost:`Noise and cost. Needs priority.`, alt:`Reserve the strongest cues for the most important events.`},
  {n:'Affordance grammar', how:`Use consistent visual/audio language for what is interactable, dangerous or locked.`, fit:`Teaching the world’s rules without text.`, cost:`A single inconsistency teaches wrong.`, alt:`Document and hold the grammar across all content.`},
  {n:'Signifiers and diegetic cues', how:`Show the action in-world (a ledge to climb, a handle to pull) rather than a floating marker.`, fit:`Immersion and readability together.`, cost:`Harder to author. Some players miss subtle cues.`, alt:`Layer diegetic cue with an optional marker.`}
]);
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
INTERVIEW('feedback-and-affordance',{
  junior:[
    { q:`Define affordance and signifier, and give a game example of each.`,
      a:`An affordance is what an object lets you do. A signifier is what tells the player it does. A ledge the character can grab is an affordance, the painted trim on it is the signifier. In games the grammar has to be consistent, because an identical object that is not usable teaches players to stop trying things.`,
      follow:`What happens when two objects look the same and only one is interactable?`,
      red:`Uses the two words as synonyms, or talks only about menu buttons.` },
    { q:`The player presses attack and nothing seems to happen. Walk the diagnosis.`,
      a:`Separate acknowledging the input from resolving the outcome. Check that something responds inside roughly 100 milliseconds, even if the result lands later. Then check the failure case: a whiff with no sound and no animation is the most common gap. Last, check whether the feedback explains the cause or only reports the result.`,
      follow:`The outcome takes 200 milliseconds to resolve. What do you show in the meantime?`,
      red:`Adds a particle effect without deciding whether the missing piece is confirmation or outcome.` },
    { q:`What does feedback for a failed action need that success does not?`,
      a:`The cause. Success is self-explaining because the player got what they wanted. Failure has to say why: out of range, blocked, interrupted, wrong resource, too early. Without the cause the player repeats the same action, and repeated failing actions are the clearest signal that feedback is missing.`,
      follow:`How do you convey cause without a text log?`,
      red:`Proposes one generic error sound for every kind of failure.` }
  ],
  mid:[
    { q:`Build me a feedback matrix for a melee attack.`,
      a:`Rows are the action, columns are outcomes: hit, kill, miss, blocked, parried, interrupted. Fill each cell with the channel and the timing. Flag empty cells and anything over about 200 milliseconds. Then check that at most two or three channels fire at once, because feedback on everything is noise that hides the important signals.`,
      follow:`Which cells are usually empty on projects you have joined?`,
      red:`Lists visual effects for hits only and never fills the failure rows.` },
    { q:`How do you measure whether your feedback is working?`,
      a:`After an action, ask the player what happened and why, and score the accuracy. Count how many times a player repeats a failing action before changing behaviour. Track which objects they try to use that are not interactable and the reverse. Those three convert a feel discussion into numbers you can compare between builds.`,
      follow:`What accuracy would make you stop working on it?`,
      red:`Reports that the team thinks it feels good now.` },
    { q:`Where is the line between feedback and juice?`,
      a:`Feedback is legibility and it is required for a playtest to mean anything. Juice is emphasis on feedback that already exists and it is justified after the loop is validated. The practical test is removal: take the effect away and ask whether the player can still tell what happened. If not, it was feedback.`,
      follow:`A producer wants the polish pass before the loop is validated. Your answer?`,
      red:`Treats them as the same layer and schedules both at the end.` }
  ],
  senior:[
    { q:`Players consistently call the game unfair and your balance numbers say it is fair. Where do you look?`,
      a:`Perceived fairness is causal legibility, not probability. Audit deaths for a legible cause: was the telegraph visible, was the failure explained, did the consequence arrive with a link back to the action. Collect a week of death clips and code them by whether the cause was shown. Change feedback and telegraphs before touching damage.`,
      follow:`What would you collect this week that would settle it?`,
      red:`Rebalances damage because the complaint mentions difficulty.` },
    { q:`How do you set a feedback standard across ten designers without writing a document nobody reads?`,
      a:`Make the feedback matrix a deliverable attached to each action, not a separate manual. Put one review question into the existing sign-off: which cells are empty and why. Publish three worked examples from the shipped game rather than rules. Budget channels per moment so a new feature cannot quietly take the whole mix.`,
      follow:`Who enforces it when you are not in the review?`,
      red:`Writes the standard, circulates it once and treats adoption as someone else’s problem.` }
  ] });

T('onboarding',{ d:'ux', t:'Onboarding: the first minutes', tag:'Do not explain. Let the player learn by doing, and design what they will do first.',
  what:`The design of the first 30 seconds, the first 5 minutes, and the first session: the first action, the first meaningful decision, the first failure, the first mastery moment, the first reward, and the first reason to return. Good onboarding is invisible. It is level design and feedback doing the teaching. Text is the fallback, not the plan.`,
  why:[`Retention curves drop hardest in the first session, and the early quits a team can fix are usually onboarding failures: confusion, aimlessness, or a wall of instruction.`,`Players do not read. What they do in the first minutes is what they learn.`,`The first session sets expectations for the whole game. A slow start promises a slow game.`],
  think:{ q:[`What does the player do in the first 30 seconds with their hands? Is it the core verb?`,`What is the first meaningful decision, and when? Later than five minutes is late for most games.`,`What is the first failure, and does it teach?`,`What is the first moment the player feels competent? The first reward that matters?`,`What will they think about after closing the game?`],
    trade:[`Fast onboarding into the core verb excites and can confuse.`,`Thorough onboarding reassures and bores veterans.`],
    traps:[`Tutorial text as the primary teaching channel.`,`Front-loading every system before the player has a reason to want it.`,`Onboarding designed after the game is finished.`],
    good:[`Players act within seconds without reading.`,`Players make a real choice in the first five minutes and can say why.`],
    bad:[`Players skip text, then ask what to do. Players quit before the first meaningful decision.`] },
  how:[`Run the Silent Onboarding Audit: watch a new player for ten minutes with no help. Note every hesitation, misunderstanding and question.`,`Write the first-session timeline: first action, first decision, first failure, first mastery, first reward, first return hook. Fill gaps with design, not text.`,`Teach one idea at a time through a situation that requires it.`,`Introduce systems when the player has a reason to want them, not before.`,`Repeat with new testers after every change. Onboarding is the most iterated part of a game.`],
  ai:{ yes:[`Audit a first-session script for missing milestones and text-dependent teaching.`,`Propose situations that teach a mechanic without text.`,`Analyze silent-test notes for hesitation clusters.`],
       no:[`Decide how much hand-holding your player wants.`,`Declare the onboarding works. New testers show that, every time.`] },
  prompts:[{l:'First-session audit',p:`Here is our first-session flow with timings: [FLOW]. Identify the timestamp of the first core-verb action, first meaningful decision, first failure, first mastery moment, first reward that changes options, and the first hook for returning. Flag any that are missing or later than [TARGETS]. For each teaching moment that relies on text, propose a situation that teaches the same thing by doing. List every system introduced before the player has a reason to want it.`},
    {l:'Hesitation clustering',p:`Here are silent observation notes from [N] first-time players (timestamps, hesitations, questions asked aloud, wrong actions): [NOTES]. Cluster the hesitations by cause: unclear goal, unclear affordance, unclear feedback, unknown rule, or interface friction. For each cluster, propose the smallest change to the level or feedback, not to text, and the observable signal that would show it worked.`}],
  verify:[`Did it propose more text or pop-ups? That is the failure mode.`,`Are milestone timestamps computed from my flow or assumed?`],
  test:[`Silent test: no help, ten minutes, log every hesitation and question.`,`Time to first meaningful decision. Time to first competent moment.`,`Ask at the end: “What would you do next time?”`,`Ask a returning tester what they remember.`],
  rel:[['puzzle-design','Onboarding teaches a rule; the puzzle that follows tests it, and its fairness rules live in that topic.'],['level-structure','The first levels are the onboarding.'],['return-and-quit','Early churn is onboarding failure.'],['who-is-the-player','Prior knowledge sets the teaching budget.'],['feedback-and-affordance','Silent teaching depends on feedback.']] });
TECH('onboarding',[
  {n:'Teach through level design', how:`Introduce one mechanic at a time in a safe space, then test it, then combine (kishotenketsu).`, fit:`Almost all games. The strongest form of onboarding.`, cost:`Authoring cost per concept. Risks over-teaching if rigid.`, alt:`A silent onboarding audit is the measurement (see the checklist).`},
  {n:'Diegetic and just-in-time prompts', how:`Explain at the moment of need, in-world, rather than front-loading a tutorial.`, fit:`Reducing friction without a wall of text.`, cost:`Easy to over-trigger and annoy. Hard to get the timing right.`, alt:`Show, then prompt, then remove the prompt once demonstrated.`},
  {n:'Time-to-fun and first-session goals', how:`Measure how long until the player does the core verb and feels the core emotion. Shorten it.`, fit:`Any game competing for attention. Retention begins here.`, cost:`None. It is a measurement discipline.`, alt:`Instrument it. Treat “first fun moment” as a metric and a design constraint.`}
]);
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
    pitfall:`Handling the tutorial gate in _input without calling set_input_as_handled(). Godot keeps propagating the event to _unhandled_input, so the player node still receives it and the “locked” verb works anyway. Testers discover the ungated ability in minute two and the teaching order you designed never happens.`,
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
INTERVIEW('onboarding',{
  junior:[
    { q:`What does the player do in the first thirty seconds of your game, and why that?`,
      a:`Their hands should be on the core verb, because the first minutes teach what the game is. Name the first action, then the first meaningful decision and when it arrives. Later than about five minutes is late for most games. Say what the player learns by doing rather than by reading.`,
      follow:`What is the first failure, and what does it teach?`,
      red:`Opens with a cutscene and a control list and calls that onboarding.` },
    { q:`Why is tutorial text a fallback rather than the plan?`,
      a:`Players skip text and then ask what to do, so text-taught rules are not learned. What the player does in the first minutes is what they retain. Good onboarding is level design and feedback doing the teaching, with a situation that requires the mechanic. Text is for conventions nobody could infer.`,
      follow:`Name a case where text is the right call.`,
      red:`Defends a wall of instructions because the systems are complicated.` },
    { q:`Teach a double jump without text. How?`,
      a:`Build a gap that cannot be crossed with one jump, put it somewhere failure is cheap, and make the second input visibly change the arc. Let them fail once safely, then repeat the shape with a small variation so the rule is confirmed. One idea at a time, and introduce the next system only when the player has a reason to want it.`,
      follow:`How do you know they learned it rather than got lucky?`,
      red:`Describes a pop-up with a button diagram.` }
  ],
  mid:[
    { q:`Describe a silent onboarding audit.`,
      a:`One new player, ten minutes, no help and no explanation from you. Log timestamps for every hesitation, misunderstanding, wrong action and question asked aloud. Do not answer the questions during the session. Afterwards cluster the hesitations by cause: unclear goal, unclear affordance, unclear feedback, unknown rule, interface friction. Change the level or the feedback rather than the text.`,
      follow:`How many testers before you act on a cluster?`,
      red:`Helps the tester when they get stuck, which destroys the only data the session produces.` },
    { q:`Our first session has fourteen pop-ups. Cut it down.`,
      a:`Write the first-session timeline first: first action, first decision, first failure, first mastery moment, first reward, first return hook. Delete every pop-up that teaches a system the player has no reason to want yet and delay that system. Replace the rest with situations that force the mechanic. Keep text only where the convention cannot be inferred.`,
      follow:`Which systems did you delay, and what broke downstream?`,
      red:`Shortens the wording of all fourteen and keeps them.` },
    { q:`Forty percent of players quit in the first ten minutes. What do you look at?`,
      a:`Instrument the timeline: time to first core-verb action, to first meaningful decision, to first failure, to first competent moment, to first reward that changes options. Find where the drop clusters, then watch six silent sessions across that window. Confusion and aimlessness look different in the room and identical in the aggregate number.`,
      follow:`The drop is before the first decision. What is your first change?`,
      red:`Adds rewards to the first minute without finding out where players stop.` }
  ],
  senior:[
    { q:`Six systems and a five-minute median session. Sequence the onboarding.`,
      a:`Order the systems by when the player needs them rather than by when they were built. Give each a first-use moment designed as a situation, and measure drop per step so the sequence is evidence-led. Protect the first session from feature teams adding their own first-run screens by making the timeline an owned artifact with a budget of interruptions.`,
      follow:`A new feature ships with its own tutorial pop-up. How do you handle it?`,
      red:`Front-loads all six systems so nothing is missed.` },
    { q:`Onboarding is the most iterated part of a game. How do you budget and schedule it?`,
      a:`Start early with grey boxes because the shape of the first session constrains the level plan, then re-test with fresh players after every change. Book a recurring slot and a recruitment pipeline, since the scarce resource at month twenty is people who have never seen the build. Keep a log of change, tester cohort and result so the team stops re-litigating settled findings.`,
      follow:`Where do fresh testers come from late in production?`,
      red:`Schedules one onboarding pass near the end and treats it as polish.` }
  ] });

T('controls-and-friction',{ d:'ux', t:'Controls, menus and interaction friction', tag:'Every extra input between intent and action is a tax. Count them.',
  what:`The physical and procedural cost of doing what the player intends: input mapping, latency, menu depth, confirmation steps, mode switches, load times. Friction is not always bad (deliberate friction can add weight), but unintended friction is pure loss.`,
  why:[`Latency and mapping decide game feel before any polish.`,`Menu friction shows up as players not using systems that would have been fun.`,`Friction compounds: three small taxes on a frequent action become the reason a player stops.`],
  think:{ q:[`For the ten most frequent actions, how many inputs and how many milliseconds from intent to result?`,`Which frequent actions live in menus? Could they be in the world or on a button?`,`Where does the player need a confirmation, and where is it just a habit of the UI?`,`Is any friction deliberate, and does the player perceive the weight it adds?`],
    trade:[`Fewer confirmations speed play and increase mistakes.`,`Deep menus organise complexity and hide features.`],
    traps:[`Mapping designed for the team’s habits.`,`Menus that mirror the data model instead of the player’s tasks.`,`Deliberate friction defended after players show it is just friction.`],
    good:[`Players use systems without being prompted.`,`Players perform frequent actions without looking.`],
    bad:[`Players avoid a system because “it is annoying to open”.`] },
  how:[`List the ten most frequent actions. Count inputs and time for each. Cut towards the minimum.`,`Map menu flows for the tasks players do. Restructure by task, not by data.`,`Measure input latency on the target device.`,`Test with the target player’s hands, not the team’s.`],
  ai:{ yes:[`Count inputs per task from a flow description and flag the worst.`,`Propose task-based menu structures.`,`Review mapping against platform conventions.`],
       no:[`Judge feel. Latency numbers are checkable. Feel is observed.`] },
  prompts:[{l:'Friction count',p:`Here are our menu flows and control mapping: [FLOWS]. For the 10 most frequent player tasks ([TASKS]), count inputs and mode switches from intent to completion. Rank by total friction times frequency. For the top 5, propose the smallest restructure, and state which confirmations are protecting against a real mistake and which are habit.`}],
  verify:[`Did it respect platform conventions your player already knows?`],
  test:[`Count inputs per task in recordings.`,`Which systems go unused? Ask why.`,`Watch hands: where do players look at the controller or keyboard?`],
  rel:[['game-feel-and-juice','Latency is the floor of game feel.'],['ux-as-design','Menus are UI. UI supports decisions.'],['accessibility','Friction is amplified for players with different abilities.']] });
TECH('controls-and-friction',[
  {n:'Input buffering and forgiveness', how:`Queue inputs briefly and accept small timing errors so intent is honoured.`, fit:`Action games with punishing timing.`, cost:`Too much buffer causes unintended actions. Tune per action type.`, alt:`Separate buffer windows for defensive vs offensive actions.`},
  {n:'Menu and interaction friction', how:`Count the steps to common tasks (equip, compare, retry, invite) and shorten them.`, fit:`Any game with menus. A hidden cause of churn.`, cost:`Shortcuts add UI complexity. Needs telemetry or observation.`, alt:`Instrument the top task flows and cut steps where players go.`},
  {n:'Default and preset schemes', how:`Sensible defaults (invert, sensitivity, control layout) so most players never open the menu.`, fit:`Broad audiences and multiple input devices.`, cost:`Defaults that fight conventions for the genre annoy veterans.`, alt:`Default to genre convention. Make the rest reachable, not required.`}
]);
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
    map:`Godot InputMap plus a saved ConfigFile is Unity’s Input System with SaveBindingOverridesAsJson.` },
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
    pitfall:`Starting an interactive rebind without excluding the pointer. Mouse position and delta report movement constantly, so the rebind completes on the first pixel of mouse drift and the player’s jump is now bound to moving the mouse. They cannot undo it, because the menu they need also stopped working.`,
    map:`Unity’s PerformInteractiveRebinding with JSON overrides is Godot’s InputMap edit with a saved ConfigFile.` }});
INTERVIEW('controls-and-friction',{
  junior:[
    { q:`What is interaction friction and how would you measure it?`,
      a:`The cost between intent and action: inputs, mode switches, menu depth, confirmations, latency and load. Take the ten most frequent actions, count inputs and measure the time for each, then weight by frequency. Three small taxes on a frequent action are what makes players stop, so the ranking matters more than any single number.`,
      follow:`Which of those ten live inside menus, and could they live in the world?`,
      red:`Talks only about input lag and never counts a menu step.` },
    { q:`When is friction good?`,
      a:`When it is deliberate and perceived as weight: a slow reload that makes the choice to reload matter, a heavy door that sells the space. The test is whether players describe it as weight or as annoyance. Unintended friction is pure loss, and defending friction after players have shown what it is remains a common trap.`,
      follow:`How do you tell perceived weight from annoyance in a test?`,
      red:`Defends the friction as realism with no player evidence.` },
    { q:`How would you structure an inventory screen?`,
      a:`By the tasks players do rather than by the data model. Put the most frequent action on a button or in the world, keep depth shallow for anything used during play, and require confirmation only where a real mistake is possible. Then count inputs for the top tasks and compare against the old flow.`,
      follow:`Does that structure survive on a controller and on touch?`,
      red:`Mirrors the item database categories and calls it organisation.` }
  ],
  mid:[
    { q:`A system players say is fun goes unused. Investigate.`,
      a:`Count the inputs and the time to reach it, then check discoverability separately from friction. Watch hands and eyes in a session to see whether they consider it and abandon it, or never think of it. Ask why, but treat the answer as a hint and the behaviour as evidence. Then cut the cheapest step and re-measure usage.`,
      follow:`It is three inputs deep and still unused. Now what?`,
      red:`Adds a prompt telling players to use it.` },
    { q:`How do you set and verify an input latency budget?`,
      a:`Decide the budget per platform, then measure on the target device with a high-speed capture or an instrumented harness rather than by feel. Sample input every frame so no press is dropped and resolve on the fixed step so the result is the same on any machine. Track the number per build, because latency regresses quietly.`,
      follow:`Where does the extra latency usually come from?`,
      red:`Says it feels responsive on the development machine.` },
    { q:`How do you approach remapping and platform conventions?`,
      a:`Start from the conventions the player already knows on that platform, because breaking them costs learning time you cannot see in your own tests. Allow every input to be remapped, and give alternatives for holds and repeated presses. Then test the defaults with the target player’s hands, not the team’s, since the team has built its own habits.`,
      follow:`What breaks when you allow full remapping?`,
      red:`Maps to the team’s muscle memory and never checks the platform norm.` }
  ],
  senior:[
    { q:`You are porting a controller game to touch. Where does the design break?`,
      a:`Precision falls, the thumbs occlude the screen, analog input disappears, sustained holds become painful, and sessions get interrupted. Rank the frequent actions by the precision they demand and redesign the ones that no longer fit rather than emulating a stick. Expect to change the pace and the readability targets, not only the input layer.`,
      follow:`What would you cut instead of porting it?`,
      red:`Adds a virtual stick and buttons over the same layout and calls the port done.` },
    { q:`Friction accumulates over a live game’s life. How do you stop it?`,
      a:`Give the frequent actions an input budget and make it part of feature review, so a new system cannot add a step without trading one away. Track inputs per task in telemetry and watch it per release. Do a quarterly pass on the three actions with the highest frequency times cost, and publish the before and after.`,
      follow:`Who owns the budget when every feature has its own owner?`,
      red:`Schedules an occasional cleanup pass with no measurement and no gate.` }
  ] });

T('accessibility',{ d:'ux', t:'Accessibility', tag:'Options that let more people reach the intended experience. Not a separate mode: better design.',
  what:`Design and options that let players with different abilities, hardware and contexts perceive, understand and act: remappable controls, subtitles and captions, colourblind-safe signalling, scalable text, difficulty and assist options, reduced motion, hold-to-toggle. Most accessibility improvements also help everyone.`,
  why:[`Impairment is permanent for some players and situational for many more: a noisy room, one hand holding a baby, a phone in sunlight. Each option serves both groups, and leaving it out is a choice.`,`Redundant signaling (color plus shape plus sound) is better readability for all players.`,`Assist options let players steer difficulty towards their own flow zone, which is good design anyway.`],
  think:{ q:[`Is any critical information carried by only one channel (color only, sound only, text only)?`,`Can every input be remapped? Are holds and rapid presses avoidable?`,`Can the text be read on the target device by someone with average vision at the actual distance?`,`Which assists let players reach the intended experience without removing it?`],
    trade:[`Assist options widen the audience and can be perceived as diluting the challenge identity if presented badly.`,`Redundant signalling adds visual elements.`],
    traps:[`Accessibility as a checklist at the end.`,`Assists that skip content instead of adapting it.`,`Colorblind “modes” that change palettes instead of designing redundancy in.`],
    good:[`Players who need options find them without asking and describe the game as playable.`],
    bad:[`Players cannot distinguish teams, read text or perform a hold.`] },
  how:[`Audit critical information for single-channel signalling and add redundancy.`,`Provide remapping, text scaling, subtitles with speaker labels, and reduced motion early.`,`Design assists as adaptations of the challenge, not skips.`,`Include players with impairments in playtests.`],
  ai:{ yes:[`Audit information channels for redundancy gaps.`,`Check contrast and text size against guidelines for your device.`,`Propose assist designs that preserve the intended experience.`],
       no:[`Decide the game is accessible. Players with impairments show that.`] },
  prompts:[{l:'Channel redundancy audit',p:`Here is the critical information our game communicates and the channel for each: [LIST]. Flag any item carried by a single channel and any that depends on colour discrimination, precise timing, sustained holds, or small text. For each flag, propose redundant signalling or an option, and state whether it changes the intended experience. Then list assists that adapt the challenge rather than skip it, for [CHALLENGE TYPE].`}],
  verify:[`Did it treat accessibility as a checklist, or connect it to the intended experience?`],
  test:[`Test with players who have relevant impairments.`,`Desaturate the screen: can testers still play?`,`Mute the game: what do players miss?`],
  rel:[['readability-and-hierarchy','Redundancy is readability.'],['difficulty','Assists are player-steered difficulty.'],['controls-and-friction','Remapping removes physical friction.']] });
TECH('accessibility',[
  {n:'Input remapping and alternatives', how:`Full remapping, one-handed modes, hold-vs-toggle, and adjustable sensitivity.`, fit:`Motor accessibility. Basic good practice.`, cost:`UI and testing. Sometimes conflicts with tutorial prompts.`, alt:`Ship remapping early. It is expected, not optional.`},
  {n:'Perception options', how:`Subtitles, captions, colourblind palettes, high-contrast and reduced-motion modes, and audio cue visualisation.`, fit:`Sensory accessibility and clarity for everyone.`, cost:`Design and QA across states. Some effects lose meaning without careful substitution.`, alt:`Design the information hierarchy so it can survive without any one channel.`},
  {n:'Assist and difficulty options', how:`Adjustable difficulty, aim assist, invulnerability, skips, and no-fail modes.`, fit:`Cognitive and motor accessibility. Widening the audience.`, cost:`Design and balance. Must not be hidden or framed as “lesser”.`, alt:`Offer options without judgement and without breaking the intended experience for those who skip them.`}
]);
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
  unity:{ term:`Static settings read by every system, audio through exposed AudioMixer parameters so sources spawned later obey them, and colour choices taken from the engine’s colour-blind safe palette instead of hand-picked hues.`,
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
INTERVIEW('accessibility',{
  junior:[
    { q:`Which accessibility options would you put in every game, and why those?`,
      a:`Full remapping, subtitles with speaker labels, scalable text, reduced motion, alternatives to holds and repeated presses, and redundancy for anything signalled by colour alone. They cover the most common permanent and situational impairments, and most of them also improve readability for everyone playing on a small screen or in a noisy room.`,
      follow:`Which of those is cheap at the start and expensive to retrofit?`,
      red:`Names a colourblind mode that swaps the palette and stops there.` },
    { q:`What is redundant signalling?`,
      a:`Carrying one meaning on more than one channel: colour plus shape, sound plus a visual, text plus an icon. Any critical meaning carried by a single channel fails for the player who cannot use that channel. It also protects against a muted game, a bright room and a busy screen.`,
      follow:`Which channels would you use for a low-health state?`,
      red:`Thinks it means adding a text label to everything.` },
    { q:`Is difficulty an accessibility question?`,
      a:`Partly. Assist options let players steer the challenge towards their own flow zone, which is good design regardless of ability. The distinction that matters is between an assist that adapts the challenge, such as a longer input window, and one that skips it. Skipping removes the experience the player came for.`,
      follow:`How does that change for a game whose identity is its difficulty?`,
      red:`Says hard games are meant to be hard and never asks who is excluded.` }
  ],
  mid:[
    { q:`Audit one screen for accessibility. What do you do?`,
      a:`List the critical information on that screen and the channel carrying each item. Flag anything single-channel, anything depending on colour discrimination, precise timing, a sustained hold, or text below a readable size at the real viewing distance. Propose redundancy or an option per flag, and state whether it changes the intended experience.`,
      follow:`Adding redundancy raises visual noise. How do you resolve that?`,
      red:`Runs an automated contrast checker and reports the result as the audit.` },
    { q:`Design an assist that adapts rather than skips. Give a concrete one.`,
      a:`Take a boss whose attacks demand fast reaction. Lengthen the telegraph and extend the input window rather than removing the attack. The player still reads the tell, still times the answer, still learns the fight. A skip button gives them the credit and none of the experience, so it should be the last option and labelled honestly.`,
      follow:`How do you present the option without making the player feel judged?`,
      red:`Proposes a skip-encounter button as the primary assist.` },
    { q:`The team wants to treat accessibility as a post-launch task. Make the case.`,
      a:`Show the retrofit cost: strings baked into images, layouts that cannot absorb larger text, holds wired into the input layer, colour-only signals across every effect. Then show the overlap with readability work already planned. Finish with the audience fraction and the platform requirements that apply at submission, not after.`,
      follow:`You get two weeks now. What goes in?`,
      red:`Argues only on principle and brings no cost or requirement.` }
  ],
  senior:[
    { q:`Set up accessibility across a studio. What is the plan?`,
      a:`Make critical-signal redundancy part of the existing feature checklist so it is decided at design time rather than audited at the end. Name an owner, publish the option set the studio ships by default, and build a tester pool that includes players with relevant impairments. Verify with playable evidence per release rather than a compliance document.`,
      follow:`How do you verify it rather than assert it?`,
      red:`Hires a consultant for a final audit and treats the report as the programme.` },
    { q:`Assist options are seen internally as diluting the game’s identity. How do you frame it?`,
      a:`Frame the intended experience as the target and assists as routes to it. Show which players currently cannot reach it and why, and design each assist as an adaptation with a stated effect. Then be explicit about what you would not add, because a credible line makes the rest of the argument land.`,
      follow:`What would you refuse to add, and how do you justify that?`,
      red:`Removes assists to protect purity without asking who is excluded by the default.` }
  ] });
