/* =====================================================================
   EXPERIENCE
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'experience', lens:'design', t:'Experience', short:'Fantasy, emotion, goals, tension, mastery, discovery', color:'var(--d-experience)',
    sum:`The experience is what the player actually has: a fantasy they inhabit, emotions they move through, goals at three horizons. It is the target. Every mechanic, system and pixel exists to produce it.`,
    links:[['core','The core loop is the machine that manufactures the experience minute by minute.'],['narrative','Story gives the emotional arc a reason and the fantasy a shape.'],['presentation','Art and audio make the intended emotion legible and believable.'],['level','Levels pace the experience: they decide when tension rises and releases.']] });

T('core-experience',{ d:'experience', t:'Core experience', tag:'One sentence: who the player is, what they do, and how it feels. Everything else is in service of it.',
  what:`The core experience is the intended combination of fantasy, dominant emotions and moment-to-moment activity. It is written as a short statement such as "a tense, methodical hunt where preparation pays off and mistakes are survivable but costly". It is the design target that every discipline aims at.`,
  why:[`Without a shared target, every discipline optimizes locally: combat gets faster, story gets longer, UI gets denser, and the whole gets muddier.`,`The core experience is the first filter for scope. Anything that does not intensify it is a candidate to cut.`,`It is what playtesting measures against. "Is it fun?" is unanswerable. "Did they feel tense and methodical?" is observable.`],
  think:{ q:[`What are the two or three emotions the player should feel most often? In what rhythm?`,`What does the player do with their hands and mind moment to moment? Does that produce those emotions?`,`Which reference moments from other games produce the target feeling? What exactly produces it there?`,`What is this game NOT? Which adjacent experiences are we deliberately refusing?`],
    trade:[`Focus produces clarity and excludes players. Breadth produces "something for everyone" and nothing anyone remembers.`,`A target emotion like "tension" demands real stakes. Adding comfort features dilutes it.`],
    traps:[`Writing a feature list and calling it an experience statement.`,`Choosing emotions the mechanics cannot produce (e.g., "awe" in a game with no scale, "dread" with no consequence).`],
    good:[`Any team member can recite the statement and use it to reject an idea.`,`Playtesters unprompted use the target emotion words.`],
    bad:[`The statement changes with every pitch meeting.`,`The statement is a genre plus adjectives: "a fun, deep roguelike".`] },
  how:[`Draft the statement using the Core Experience Canvas: player, fantasy, target emotions and rhythm, moment-to-moment activity, session goal, long goal, what it is not, reference moments.`,`Test the statement against the current core loop. Where the loop produces a different emotion than intended, one of them must change.`,`Publish it where the team sees it. Use it as the first question in every feature review.`,`After each playtest, score observed emotions against the target. Revise the statement only with evidence, not with enthusiasm.`],
  ai:{ yes:[`Generate 10 candidate experience statements from a rough pitch so the human can recognize the one that fits.`,`Analyze reference games and articulate precisely which mechanics produce the target feeling there.`,`Check a feature list against the statement and flag features that dilute it.`],
       no:[`Choose the core experience. This is the central act of authorship.`,`Claim a prototype delivers the emotion. Only players show that.`] },
  prompts:[{l:'Reference dissection',p:`Our target experience is "[STATEMENT]". Here are three moments from other games that produce a similar feeling: [MOMENTS]. For each, dissect what exactly produces the feeling: the information the player has, the decision they face, the time pressure, the consequence, and the feedback. Then identify which of those ingredients our current prototype ([DESCRIPTION]) has, lacks, or contradicts. Do not propose features. Propose the smallest change to the ingredient list.`}],
  verify:[`Did it explain the mechanism of the feeling, or just describe the feeling?`,`Are the ingredients specific enough that a level designer could act on them?`],
  test:[`Ask players for three words describing the session. Compare against target emotions.`,`Watch body language and speech at the moments meant to peak. Do they lean in, go quiet, swear, laugh?`,`Ask what they would tell a friend. Does the description match the statement?`],
  rel:[['fantasy','The fantasy is the identity half of the core experience.'],['fun-dimensions','Dimensions of fun are the vocabulary for target emotions.'],['core-loop','The loop is how the experience is manufactured.'],['scope-control','The experience statement is the primary scope filter.'],['tension-release','Rhythm of emotion is the experience over time.']] });
TECH('core-experience',[
  {n:'Experience statement', how:`One sentence: a [emotion] experience where [player] gets to be [fantasy] by [moment-to-moment].`, fit:`Forcing every discipline to aim at the same target.`, cost:`Easy to write vaguely. The check is whether mechanics deliver it.`, alt:`Use the Core Experience Canvas, then verify with playtests.`},
  {n:'Target-emotion mapping', how:`Name two or three emotions and the order they should alternate in. Map each mechanic to one.`, fit:`Keeping moment-to-moment play pointed at a feeling.`, cost:`Emotions are inferred, not measured. Needs player language.`, alt:`Ask testers for emotion words unprompted.`},
  {n:'Reference moments', how:`Find moments in other games that produce the target feeling and dissect exactly what produces it.`, fit:`Translating an intended feeling into concrete mechanics.`, cost:`Risk of copying surface without the cause.`, alt:`Use the Reference Dissection tool.`}
]);
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
INTERVIEW('core-experience',{
  junior:[
    { q:`What is a core experience statement, and why does it have to fit in one sentence?`,
      a:`It names who the player is, what they do moment to moment, and how it feels. One sentence because it has to be recited from memory in a review and used to reject something. Give a real one, such as a tense methodical hunt where preparation pays off and mistakes are survivable but costly, and contrast it with a feature list.`,
      follow:`Recite the statement for a game you worked on and name a feature it killed.`,
      red:`Offers a genre plus adjectives, such as "a fun, deep roguelike", and calls that the target.` },
    { q:`Why is "is it fun?" a useless playtest question?`,
      a:`It is unanswerable and unfalsifiable, so every answer confirms whatever the team already believed. Convert it into the target emotions and the behaviour that would show them. Did they go quiet at the ambush, did they prepare before entering, did they use the word tense unprompted.`,
      follow:`How do you actually record that during a session?`,
      red:`Proposes a five-point fun rating and treats the average as evidence.` },
    { q:`How do you pick target emotions the mechanics can actually produce?`,
      a:`Work backwards from what the loop does. Uncertainty with stakes produces tension. Scale and contrast produce awe. Real consequence produces dread. If no mechanic can manufacture the emotion, it is decoration and you drop it rather than hoping audio will carry it.`,
      follow:`Name an emotion you had to abandon, and what you replaced it with.`,
      red:`Picks awe and dread because they sound impressive, with no mechanism behind either.` }
  ],
  mid:[
    { q:`Combat wants to be faster, narrative wants longer scenes, UI keeps getting denser. How does the statement help?`,
      a:`It stops each discipline optimising locally by giving all of them the same target. Every ask is judged against the same sentence, in public. Where two asks genuinely conflict you escalate with the trade named rather than with preference, which is a much shorter meeting.`,
      follow:`Two disciplines both claim the statement supports them. Then what?`,
      red:`Lets whoever argues longest win and describes that as collaboration.` },
    { q:`Players are relaxed in the section you designed to be tense. What do you do?`,
      a:`Check the ingredients of tension at that exact moment: an uncertain outcome, stakes the player knows about, and enough information to reason. One of them is missing. Restore that ingredient instead of adding effects, then re-test. Revise the statement only when evidence says the game is a different game.`,
      follow:`It is not one moment, it is the whole game. What changes?`,
      red:`Adds music stings and screen shake to manufacture a feeling the design does not produce.` },
    { q:`How do you use reference games without copying them?`,
      a:`Dissect the mechanism rather than the feature. What information did the player have, what decision did they face, what was the time pressure, what was the consequence, how was it fed back. Take the ingredient list and check which ones your prototype has, lacks or contradicts.`,
      follow:`Which ingredient did you find you could not afford, and what did you do instead?`,
      red:`Lists reference games as inspiration with no account of what produces the feeling in them.` }
  ],
  senior:[
    { q:`The statement has changed three times this year. What is happening, and how do you stop it?`,
      a:`Either it was written from enthusiasm rather than from the loop, or it is being rewritten to ratify decisions already taken. Version it with the reason and the evidence for each change. Then check whether the loop actually produces the new claim, because a statement the game cannot deliver is worse than none.`,
      follow:`Which of those three changes was legitimate, and how did you know?`,
      red:`Treats the drift as healthy iteration and keeps rewriting the sentence for each pitch meeting.` },
    { q:`How do you make a core experience statement operational across forty people?`,
      a:`Publish it where reviews happen rather than on a wall. Make it the first question in every feature review. Score observed emotions against it after each playtest round and post the result. Keep a short list of what the game is not, because the refusals are what make it usable.`,
      follow:`How do you know it is being used rather than quoted?`,
      red:`Puts it on a poster, measures nothing, and assumes alignment.` }
  ] });

T('fun-dimensions',{ d:'experience', t:'Fun as dimensions, not magic', tag:'"Fun" is a bundle. Untangle it to see what the player is actually enjoying.',
  what:`Fun is not one thing. Useful decompositions include LeBlanc's eight kinds (sensation, fantasy, narrative, challenge, fellowship, discovery, expression, submission), Lazzaro's four keys (hard fun, easy fun, serious fun, people fun), and Koster's view of fun as the pleasure of learning patterns. This guide uses a working set of dimensions: mastery, discovery, anticipation, surprise, tension, relief, power, creativity, expression, optimization, competition, cooperation, collection, progression, storytelling, social connection, flow, meaningful choice, experimentation.`,
  why:[`"Make it more fun" is not actionable. "Players lack anticipation because nothing is foreshadowed" is.`,`Different games mix dimensions differently. Copying a feature copies the dimension mix of another game, which may be wrong for yours.`,`Players enjoying a dimension you did not design for is a signal to redesign around it, not to suppress it.`],
  think:{ q:[`What is the player actually enjoying right now? Not what did I build, what are they savoring?`,`Which two or three dimensions dominate? Do they reinforce or compete?`,`Which dimension is missing that the fantasy implies?`,`When players say "boring", which dimension went flat: no learning left (mastery), nothing new (discovery), no stakes (tension)?`],
    trade:[`Optimization and expression pull apart: a clear optimum kills expression, too many equal options kills optimization.`,`Surprise and mastery pull apart: too much randomness prevents learning, too little prevents surprise.`],
    traps:[`Adding a dimension by adding a system (a crafting system for "creativity") instead of by changing the existing interaction.`,`Mistaking novelty for fun. Novelty fades. The dimensions underneath either hold or do not.`],
    good:[`You can name the dimension a mechanic serves and observe players experiencing it.`],
    bad:[`The pitch lists features. Nobody can say what the player enjoys.`] },
  how:[`Watch a playtest and log moments of visible enjoyment (leaning in, laughter, "oh!", replay). Tag each with a dimension.`,`Compare the observed dimension mix with the intended one from the core experience statement.`,`For a missing dimension, change the existing interaction before adding a system.`,`Re-test. Fun dimensions shift as players learn. Measure at multiple points in the skill curve.`],
  ai:{ yes:[`Tag playtest observations by dimension and surface the distribution.`,`Propose how an existing mechanic could feed a missing dimension without adding rules.`,`Compare the dimension mix of reference games to yours.`],
       no:[`Decide which dimensions the game is about.`,`Assert that a dimension is present. Only observation shows that.`] },
  prompts:[{l:'Dimension tagging',p:`Here are timestamped observer notes from a playtest: [NOTES]. Tag each moment of visible engagement or disengagement with the fun dimension involved (mastery, discovery, anticipation, surprise, tension, relief, power, creativity, expression, optimization, competition, cooperation, collection, progression, storytelling, social, flow, choice, experimentation). Summarize the distribution, compare it to our intended mix ([INTENDED]), and identify the largest gap. Propose one change to an existing interaction, not a new system, that would close it.`}],
  verify:[`Are tags grounded in a specific note, or inferred from what the designer intended?`,`Did it propose a new system when a change to the existing interaction would do?`],
  test:[`Log visible enjoyment moments and tag them. Does the distribution match intent?`,`Ask players what the best moment was and why. Tag the answer.`,`Do dimensions shift as players get better? Which vanish?`],
  rel:[['core-experience','Dimensions are the vocabulary for the experience statement.'],['player-motivation','Motivation is the need. Fun dimensions are how it is felt.'],['depth-vs-complexity','Mastery and choice dimensions depend on depth.'],['core-loop','The loop is where dimensions are produced or not.']] });
TECH('fun-dimensions',[
  {n:'Dimension tagging of playtest footage', how:`Tag each moment of visible engagement or disengagement with the fun dimension involved.`, fit:`Finding which dimensions are working and which are flat.`, cost:`Needs a coding scheme and consistent observers.`, alt:`Compare the distribution to the intended mix.`},
  {n:'Intended-vs-actual mix', how:`State the mix of fun you intend, then measure the mix players actually experience.`, fit:`Diagnosing "we built X but they feel Y".`, cost:`Self-report bias. Pair with behavior.`, alt:`Use the Fun Diagnostic view.`},
  {n:'Survey instruments (e.g. PENS)', how:`Validated motivation/experience scales to compare builds or groups.`, fit:`Measurable signal across many players.`, cost:`Not game-specific. Needs careful interpretation.`, alt:`Treat as one input beside observation.`}
]);
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
INTERVIEW('fun-dimensions',{
  junior:[
    { q:`A producer says "make it more fun". What do you ask back?`,
      a:`Which dimension went flat. Mastery means there is nothing left to learn. Discovery means nothing new is appearing. Tension means there are no stakes. Expression means there is one right answer. Each of those has a different fix, and "more fun" has none.`,
      follow:`How would you find out which one, from a session recording?`,
      red:`Starts listing features that could be added.` },
    { q:`Which vocabulary of fun do you use, and where does it come from?`,
      a:`LeBlanc's eight kinds, Lazzaro's four keys and Koster's fun as the pleasure of learning patterns are the common ones. They are lenses, not laws, and none of them has an agreed metric. What matters is having words specific enough to be acted on: mastery, discovery, tension, expression, optimisation, surprise.`,
      follow:`Which two dominate in a game you love, and how do they reinforce each other?`,
      red:`Recites a taxonomy without attaching a single dimension to a mechanic.` },
    { q:`Players are enjoying something you did not design for. What do you do?`,
      a:`Find the dimension underneath it and ask whether it fits the core experience. If it does, redesign around it, because a dimension players found on their own is cheaper than one you have to manufacture. Suppress it only when it actively fights the experience.`,
      follow:`When would you suppress it instead?`,
      red:`Patches it out because it was not in the plan.` }
  ],
  mid:[
    { q:`Optimisation and expression pull apart. Explain, with an example.`,
      a:`A clear optimum kills expression because there is one correct answer. Too many equal options kill optimisation because no answer is better. The resolution is situational optimality, where the right answer changes with the situation. Show it in a build or deck system you know.`,
      follow:`How would you tune a system that has already collapsed to one optimum?`,
      red:`Balances everything to equal power and calls the result diverse.` },
    { q:`How do you measure the dimension mix instead of asserting it?`,
      a:`Log timestamped moments of visible engagement and disengagement during play. Tag each with a dimension. Compare the distribution against the intended mix from the experience statement and work on the largest gap. The tags have to come from the note, not from the design document.`,
      follow:`Your tags and a second observer's disagree. How do you handle that?`,
      red:`Tags the moments from what the design intended rather than from what was recorded.` },
    { q:`A dimension is missing. What do you build?`,
      a:`Change the existing interaction before adding a system. A crafting system bolted on for creativity is the classic overspend. Ask what information, constraint or consequence the current verb lacks, because most missing dimensions are a missing ingredient rather than a missing feature.`,
      follow:`When is a new system genuinely the right answer?`,
      red:`Adds one system per missing dimension and doubles the teaching cost.` }
  ],
  senior:[
    { q:`Novelty is carrying your early playtests. How would you know?`,
      a:`Measure at several points on the skill curve rather than once. Bring the same testers back a week later and see which enjoyment survives repetition. Dimensions shift as players learn, and the ones that vanish on the second session were novelty wearing a costume.`,
      follow:`What does it mean if only discovery survives?`,
      red:`Takes first-session enthusiasm as validation and starts content production.` },
    { q:`Two games in one genre with different dimension mixes. How does that change the production plan?`,
      a:`Mastery and expression regenerate, discovery is consumed once. A discovery-led mix is a content budget and a content pipeline. A mastery-led mix is a depth and feedback budget. The mix decides team shape, so getting it wrong is a hiring mistake, not just a design one.`,
      follow:`Your mix says content budget and you have a systems team. What do you do?`,
      red:`Plans the same production shape regardless of which dimensions the game runs on.` }
  ] });

T('goals-horizons',{ d:'experience', t:'Goals at three horizons', tag:'Right now, this session, this month. The player should always have all three.',
  what:`Short-term goals (seconds to a minute: kill this, reach that), medium-term goals (this session: clear the area, finish the run, build the thing), long-term goals (across sessions: complete the collection, master the class, see the ending). The nesting of horizons is what makes stopping feel like a choice rather than an exhaustion.`,
  why:[`A missing horizon shows up as a specific failure: no short goal means aimlessness, no session goal means sessions end arbitrarily, no long goal means no reason to return.`,`Horizons let a player rationalize continuing ("just one more") and let them stop satisfied.`,`Player-created goals are the strongest kind. The game must leave room for them.`],
  think:{ q:[`At any random moment, can the player state what they are trying to do right now, this session, and overall?`,`Which goals are given and which are chosen? Chosen goals feed autonomy.`,`Do the horizons connect? Does finishing the short goal visibly advance the long one?`,`Where can a player invent a goal the game did not set?`],
    trade:[`Explicit goals (quest markers, checklists) reduce aimlessness and reduce discovery.`,`Long horizons that are too long feel like grind. Too short and the game feels finished before it is.`],
    traps:[`Providing goals only through UI (a quest log) rather than through the world and systems.`,`Confusing a progress bar with a goal. A goal is a state the player wants. A bar is a measurement.`],
    good:[`Players narrate their plans: "I am going to try to..." `,`Players set their own challenges.`],
    bad:[`Players ask "what am I supposed to do?" or drift.`,`Players finish a session with nothing pending.`] },
  how:[`Sample five random moments from a playtest recording. For each, write the player's apparent goal at each horizon. Blanks are problems.`,`Ensure the short goal is visible in the world, not only in a log.`,`Make finishing a session goal deposit something into the long goal, visibly.`,`Leave slack for player-set goals: open-ended systems, optional challenges, scoring.`],
  ai:{ yes:[`Audit a design or level script for goal availability at each horizon at each stage.`,`Generate alternative ways to make a goal visible in the world rather than the UI.`],
       no:[`Decide how directed the game should be. Guidance level is an identity decision.`] },
  prompts:[{l:'Horizon audit',p:`Here is our first-hour flow: [FLOW]. For each 5-minute segment, state the player's likely short-term, session and long-term goal, and whether each is communicated through the world, the UI, or not at all. Flag segments where any horizon is missing or only visible in a menu. Suggest, per gap, the smallest change that surfaces the goal in play.`}],
  verify:[`Are the inferred goals what a player would actually think, or what the design document says?`],
  test:[`Pause a session and ask "what are you trying to do right now? this session? overall?" Note blanks and hesitation.`,`Do players stop at satisfying points, or drift away?`,`Do any players invent goals? Which systems let them?`],
  rel:[['return-and-quit','Long-horizon goals are the pull to return.'],['progression','Progression is the long horizon made concrete.'],['level-structure','Levels supply short and session goals in space.'],['player-motivation','Chosen goals feed autonomy.']] });
TECH('goals-horizons',[
  {n:'Goal ladder', how:`Define a visible short-term goal, a session goal and a long-term goal, each with its own reward and stopping point.`, fit:`Giving the player direction at every timescale.`, cost:`Layers can conflict (grind for the long goal, ignore the session).`, alt:`Check each layer has a reason to act now.`},
  {n:'Next-unlock visibility', how:`Show the next meaningful unlock so the player has a reason to continue without a quest log.`, fit:`Anticipation and return.`, cost:`Can turn play into waiting if the present is unrewarding.`, alt:`Make the present valuable too, not only the next thing.`},
  {n:'Session-goal design', how:`Shape a session so it can end at a satisfying point matching the platform's session length.`, fit:`Retention and platform fit.`, cost:`Conflicts with "one more turn" pull. Needs save-point discipline.`, alt:`Design stopping points, then let players choose.`}
]);
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
INTERVIEW('goals-horizons',{
  junior:[
    { q:`Name the three goal horizons and the failure that comes from missing each.`,
      a:`Right now, this session, this month. No short goal is aimlessness. No session goal means sessions end arbitrarily and unsatisfyingly. No long goal means no reason to open the game tomorrow. Diagnosing a drifting player starts by asking which of the three is blank.`,
      follow:`Pause a player at a random moment. What should they be able to tell you?`,
      red:`Describes a quest log and treats it as the answer to all three horizons.` },
    { q:`What is the difference between a goal and a progress bar?`,
      a:`A goal is a state the player wants to be in. A bar is a measurement of distance to something. A bar with no desired state behind it measures nothing the player cares about, which is why filling it feels hollow.`,
      follow:`Give me an example of a bar that is doing real work.`,
      red:`Treats any visible meter as evidence that a goal exists.` },
    { q:`Where should the short-term goal live?`,
      a:`In the world, where the player can see it: a thing to reach, a shape that stands out, a door with light behind it. The log is a backup for players who look away, not the source. A goal that exists only in a menu makes the world feel like a corridor between menus.`,
      follow:`Your level has no line of sight to anything. What do you do?`,
      red:`Adds a waypoint marker as the first and only fix.` }
  ],
  mid:[
    { q:`Players drift and ask what they are supposed to do. Diagnose it.`,
      a:`Sample five random moments from a recording and write the apparent goal at each horizon. The blanks are the finding. Then check whether the short goal is visible in play rather than in the UI, and whether finishing a session goal visibly advances the long one.`,
      follow:`All three horizons exist and players still drift. What else do you look at?`,
      red:`Adds an objective list to the HUD without establishing which horizon was missing.` },
    { q:`Explicit goals reduce aimlessness and reduce discovery. How do you choose?`,
      a:`Guidance level is an identity decision tied to the player model and the pillars, not a usability default. The usual middle path is to make the goal visible in the world and leave the route open. Then test for both failures: drift on one side, and no invented goals on the other.`,
      follow:`How do you measure that guidance has become too strong?`,
      red:`Picks maximum guidance because it always tests better in the first ten minutes.` },
    { q:`How do you make finishing a session feel like a deposit rather than a stop?`,
      a:`The session goal has to visibly move the long one: a state that persists, a capability unlocked, a place opened. And something should be left pending so there is a specific next intention when the player closes the game.`,
      follow:`What is the risk of always leaving something pending?`,
      red:`Pays out a currency at session end and calls that a deposit.` }
  ],
  senior:[
    { q:`Player-set goals are the strongest kind. How do you design for goals you did not write?`,
      a:`Leave slack: open-ended systems, optional challenges, scoring, visible places you cannot reach yet. Make the world legible enough that a plan is possible. Then watch which invented goals actually appear in tests and support those rather than the ones you hoped for.`,
      follow:`A player-set goal turns out more compelling than yours. What do you do?`,
      red:`Fills every gap with authored objectives so there is nothing left to invent.` },
    { q:`Your long horizon is too long and players call it a grind. What is your analysis?`,
      a:`Check three things. Is the long goal visible, and is its value legible before the player reaches it. Does each session visibly advance it. Does each step change a capability or only a number. Grind is almost always an unchanging situation rather than a duration.`,
      follow:`You cannot shorten it for business reasons. What do you change instead?`,
      red:`Halves the numbers and reships exactly the same unchanging loop.` }
  ] });

T('tension-release',{ d:'experience', t:'Tension and release', tag:'Emotion is a rhythm. Flat tension is boredom. Constant tension is exhaustion.',
  what:`The rise and fall of stakes, pressure and uncertainty over time. Tension comes from uncertain outcomes the player cares about. Release comes from resolution, safety, reward or humor. Pacing is the deliberate shaping of this rhythm across a level, a session and a whole game.`,
  why:[`Players remember peaks and endings, not averages. A well-placed peak is worth an hour of even content.`,`Release is what makes the next tension legible. Without rest, players habituate and stop feeling.`,`Tension needs real stakes. If failure costs nothing, nothing is tense.`],
  think:{ q:[`Where in a typical session does the player feel safest? Most pressured? Is that where I intended?`,`What does the player stand to lose at the peak? Do they know it?`,`How long is the longest stretch without release? Without tension?`,`Does the release reward reflection (loot, story, view) or just stop the pressure?`],
    trade:[`Higher stakes make peaks stronger and failure costlier. Casual players may bounce.`,`Frequent release keeps the game comfortable and dulls the peaks.`],
    traps:[`Adding tension through time pressure alone. Time pressure without a meaningful decision is stress, not tension.`,`Confusing spectacle with tension. Explosions with no uncertainty are release, not tension.`],
    good:[`Players audibly exhale, laugh or comment at release points.`,`Players slow down and go quiet at peaks.`],
    bad:[`Players describe the game as "relentless" or "samey" (both are rhythm failures).`] },
  how:[`Draw the intended intensity curve for a level or session. Mark peaks, valleys and what causes each.`,`Watch a playtest and draw the observed curve from behavior (speech, posture, pace). Overlay.`,`Fix the biggest divergence with one change: add stakes, add information, add a rest, cut a redundant beat.`,`Check that release moments carry something (reward, story, vista) so they feel earned rather than empty.`],
  ai:{ yes:[`Draft intensity curves for a level script and identify flat or relentless stretches.`,`Propose alternative sources of tension (uncertainty, stakes, information) for a beat that relies only on time pressure.`,`Extract an observed intensity curve from timestamped playtest notes.`],
       no:[`Decide how intense the game should be overall. That is an experience decision.`] },
  prompts:[{l:'Intensity curve',p:`Here is a level or session script with approximate durations: [SCRIPT]. Draw the intended intensity curve as a list of (time, intensity 1 to 5, source of tension, what the player stands to lose). Identify the longest stretch without release and the longest without tension. For each, propose the smallest change: add stakes, add information, add rest, or cut a beat. Explain what the player would perceive differently.`}],
  verify:[`Is tension attributed to real uncertainty and stakes, or to spectacle and speed?`,`Would a player actually perceive the stakes it claims exist?`],
  test:[`Log speech, posture and pace against time. Draw the observed curve.`,`Ask players where the scariest or most exciting moment was and where they felt safe.`,`Do players take breaks at release points or at random?`],
  rel:[['pacing','Pacing is tension and release engineered in a level.'],['challenge-failure-recovery','Failure gives tension its stakes.'],['level-structure','The teach-test-twist-rest structure is a tension template.'],['audio-and-music','Music is the most direct tension controller.']] });
TECH('tension-release',[
  {n:'Tension curve authoring', how:`Plot intended tension over a session and place peaks, relief and rest deliberately.`, fit:`Action, horror and narrative pacing.`, cost:`Hard to predict. Directors or pacing tools help.`, alt:`Author with triggers first. Add adaptivity only where needed.`},
  {n:'Pressure and release mechanics', how:`Resource drain, timers, and threats create pressure. Rewards, safety and downtime release it.`, fit:`Making rest feel earned and stakes feel real.`, cost:`Constant pressure exhausts. Constant release bores.`, alt:`Alternate deliberately and test with observation.`},
  {n:'Music and audio dynamics', how:`Sound and music follow the tension curve to amplify it.`, fit:`Reinforcing the intended emotional rhythm.`, cost:`Implementation cost. Over-scoring removes subtlety.`, alt:`Use silence as a tool.`}
]);
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
INTERVIEW('tension-release',{
  junior:[
    { q:`Why is constant tension a design failure?`,
      a:`Players habituate. Without release the peaks stop registering and everything reads as one flat loud stretch. Release is what makes the next rise legible. Players remember peaks and endings rather than averages, so protecting the peaks is the whole job.`,
      follow:`Where would you put the first release beat in an opening level?`,
      red:`Argues that more tension is always better because the game is meant to be intense.` },
    { q:`Time pressure is not the same as tension. Explain.`,
      a:`Tension needs an uncertain outcome the player cares about. A timer attached to a section with no meaningful decision is stress, and stress makes players withdraw rather than lean in. Give the clock something to make costly and it becomes tension.`,
      follow:`How would you convert a timer into a real tension source?`,
      red:`Adds a countdown to a section that is dragging and expects it to become exciting.` },
    { q:`What makes a release moment feel earned rather than empty?`,
      a:`It carries something: a reward, a story beat, a vista, a chance to look back at what just happened. Empty rest is dead time and players read it as padding. The release is also where learning consolidates, so it is doing work even when nothing is happening.`,
      follow:`Name a release beat you remember and say what it carried.`,
      red:`Defines release as the absence of enemies.` }
  ],
  mid:[
    { q:`You draw the intended intensity curve. How do you get the observed one?`,
      a:`From behaviour, not from a form. Speech, posture, movement speed, pauses, where players go quiet, where they swear or laugh. Timestamp it and overlay the two curves. The largest divergence is the work, and it is usually one beat rather than the whole level.`,
      follow:`Intended and observed match and the level still tests badly. What now?`,
      red:`Asks players to rate tension per section on a questionnaire afterwards.` },
    { q:`There are explosions everywhere and testers call the level flat. What is happening?`,
      a:`Spectacle without uncertainty is release, not tension. Nothing is at stake so nothing rises. Check what the player stands to lose at the supposed peak and whether they know it before it happens. Knowledge of the stake is half the tension.`,
      follow:`What is the smallest change that puts stakes back in?`,
      red:`Adds more spectacle and turns the audio up.` },
    { q:`How does failure cost relate to tension?`,
      a:`If failure costs nothing, nothing is tense. The cost must be known before the moment, or the player cannot feel it in advance, and it must be proportional or players start avoiding the content entirely. That is where recovery design and pacing meet.`,
      follow:`You raise the cost and your casual testers bounce. What do you do?`,
      red:`Raises the cost globally without checking who leaves as a result.` }
  ],
  senior:[
    { q:`Pace a whole game rather than a level. How is that different?`,
      a:`The rhythm nests: beats inside levels, levels inside acts, acts inside the campaign. You plan the peaks at the scale players actually remember, and you budget novelty because a peak needs an ingredient the player has not met yet. Valleys at game scale still have to carry something.`,
      follow:`Where do most teams get the game-scale curve wrong?`,
      red:`Pastes the level curve at every scale and expects it to work.` },
    { q:`Six people build levels in parallel. How do you keep the pacing intact?`,
      a:`A published curve with each level's intended position on it, a shared vocabulary for beats, a review that plays them in sequence rather than in isolation, and a rule that nobody raises intensity locally without trading it down somewhere else.`,
      follow:`Two levels both claim to be the peak. How do you decide?`,
      red:`Reviews levels only in isolation and finds the problem at the first full playthrough.` }
  ] });
DIAGRAM('tension-release', { kind:'curve', title:'Emotion is a rhythm: build, peak, release',
  x:'Session time', y:'Tension',
  series:[{t:'Tension', pts:[[0,0.2],[0.12,0.45],[0.2,0.75],[0.28,0.3],[0.44,0.55],[0.54,0.85],[0.62,0.28],[0.8,0.6],[0.9,0.95],[1,0.3]]}],
  beats:[{at:0.2, t:'Peak'},{at:0.29, t:'Release'},{at:0.54, t:'Peak'},{at:0.63, t:'Release'},{at:0.9, t:'Climax'}],
  alt:'Tension rises and falls in waves that build toward a climax. Flat tension is boredom; constant tension is exhaustion.' });

T('mastery-discovery-expression',{ d:'experience', t:'Mastery, discovery, expression', tag:'Three engines of long-term engagement. Most great games run on at least two.',
  what:`Mastery: getting better at something with perceivable progress. Discovery: finding what you did not know was there, in the world or in the system. Expression: shaping the game to reflect yourself through builds, style, creations or choices. They are distinct engines with distinct fuel: skill ceiling, hidden content or emergent interactions, and meaningful variability.`,
  why:[`Each engine sustains play after novelty fades. A game with none is finished when the content is seen.`,`They fail differently: mastery fails when the ceiling is low or feedback is absent, discovery fails when the world or system runs out of surprises. Expression fails when one option dominates.`,`Knowing which engine you run on tells you what to build next.`],
  think:{ q:[`After 10 hours, what is the player still getting better at? What are they still finding? What choices still reflect them?`,`Does the game show the player their mastery, or must they infer it?`,`Are discoveries findable by attention and curiosity, or only by luck?`,`Do expressive choices have consequences others can see?`],
    trade:[`Discovery content is consumed once. Mastery and expression regenerate. Budget accordingly.`,`Expression requires many viable options, which fights balance and clarity.`],
    traps:[`Claiming "replayability" from randomness alone. Randomness without mastery or expression is noise.`,`Adding cosmetic customization and calling it expression. Expression must change how the game is played or seen by others.`],
    good:[`Players talk about "my build", "my route", "what I found".`],
    bad:[`Players describe finishing as the end: "I saw everything."`] },
  how:[`Identify your primary and secondary engine from the core experience statement.`,`For mastery: define what skill grows and how the game shows it. Ensure the ceiling exceeds what a good player reaches by the end.`,`For discovery: list the discovery sources (world, system interactions, story). Estimate how fast they deplete.`,`For expression: count viable distinct approaches at each stage and check that they are visible to the player and to others.`,`Playtest at multiple skill levels. Engines show up differently for novices and veterans.`],
  ai:{ yes:[`Estimate content depletion rate from your content list and typical pace.`,`Enumerate system interactions that could serve as systemic discovery.`,`Count and compare viable approaches from your rules, marking dominant ones.`],
       no:[`Decide which engine defines the game.`] },
  prompts:[{l:'Engine audit',p:`Our intended engines are [PRIMARY] and [SECONDARY]. Here are our systems and content: [DESCRIPTION]. For mastery: what skill grows, how the player perceives it, and where the ceiling is. For discovery: list sources and estimate depletion at a typical pace. For expression: enumerate distinct viable approaches at early, mid and late game and flag likely dominant ones. Conclude with which engine is weakest and one experiment to test that.`}],
  verify:[`Is "mastery" attributed to real skill growth or to stat growth?`,`Are "viable approaches" really distinct in play, or cosmetic variants?`],
  test:[`Veterans: can they demonstrate a skill novices lack? Can they describe it?`,`Do players keep finding things after hour 5? What kind?`,`Do two players in the same situation choose differently, and can they explain why?`],
  rel:[['skill-and-mastery','Skill acquisition is the mechanism of mastery.'],['builds-and-loadouts','Builds are the main vehicle of expression in systemic games.'],['systemic-design','System interactions are the renewable source of discovery.'],['progression','Progression should unlock new expression, not just power.']] });
TECH('mastery-discovery-expression',[
  {n:'Skill ceiling and floor design', how:`Separate the easy-to-start surface from deep, hard-to-master options.`, fit:`Welcoming newcomers while rewarding veterans.`, cost:`Balancing both is hard. Ceilings that are too high isolate most players.`, alt:`Design floor for onboarding, ceiling for identity.`},
  {n:'Expression space', how:`Give players meaningful choices that reflect who they are, not only which is stronger.`, fit:`Building attachment and player stories.`, cost:`Expression options must be viable or they become traps.`, alt:`Audit whether choices differ in decision, not just flavor.`},
  {n:'Discovery density', how:`Schedule how often players find something they did not know was there.`, fit:`Exploration and long-tail engagement.`, cost:`Front-loading discoveries leaves the late game empty.`, alt:`Ration discovery across the full play arc.`}
]);
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
INTERVIEW('mastery-discovery-expression',{
  junior:[
    { q:`Name the three long-term engines and the fuel each one needs.`,
      a:`Mastery needs a skill ceiling above where good players land, plus perceivable improvement. Discovery needs hidden content or systemic surprise. Expression needs meaningful variability that other people can see. They deplete at different rates, which is why the mix matters.`,
      follow:`Which engine is your game still running on at hour ten?`,
      red:`Answers "replayability" and stops there.` },
    { q:`Why is randomness alone not replayability?`,
      a:`Random variation without mastery or expression is noise. The player is not learning to read it and not shaping it, so the runs blur together. Variation only counts when it changes a decision the player can get better at making.`,
      follow:`What would make a random run feel like it was yours?`,
      red:`Claims infinite replayability from a combinatorial count.` },
    { q:`Is cosmetic customisation expression?`,
      a:`Only if it changes how the game is played or how the player is seen by others. Otherwise it is a wardrobe. Expression needs a consequence somebody perceives, whether that is an opponent, a teammate, or the world reacting.`,
      follow:`Make a cosmetic system expressive without touching balance.`,
      red:`Counts the number of hats as a measure of expression.` }
  ],
  mid:[
    { q:`Estimate when your discovery content runs out.`,
      a:`List the discovery sources: world, system interactions, story. Estimate consumption at a typical pace rather than a completionist one. Compare against the intended play length. Then say out loud which engine takes over at that hour, because something has to.`,
      follow:`It runs out at hour four and you promised twenty. What do you do?`,
      red:`Plans more content without asking which engine carries the game afterwards.` },
    { q:`Players cannot tell they are improving. What do you build?`,
      a:`A mastery display: faster clears, options opening up, style that is visible to the player or to others. Numbers alone read as stat growth, which is not the same thing. The test is whether a veteran can name what they now do differently.`,
      follow:`Your central skill is judgement rather than execution. How do you show that?`,
      red:`Adds an experience bar and calls it mastery feedback.` },
    { q:`You count eight viable builds. How do you check that is true in play?`,
      a:`Pick rates and win rates over time, plus whether two players in the same situation choose differently and can explain why. A build that is viable only on paper is a trap, and traps teach players not to trust the system.`,
      follow:`Three of them collapse after two weeks of community optimisation. What do you do first?`,
      red:`Asserts diversity from the design document with no pick data at all.` }
  ],
  senior:[
    { q:`Budget the three engines for a game that has to live two years.`,
      a:`Mastery and expression regenerate, discovery is consumed. So the live plan leans on the first two while discovery is periodically restocked. That ratio decides team shape and release cadence, and it is the thing to argue about before the roadmap, not after.`,
      follow:`Your live team is content-only. How does that change the design?`,
      red:`Plans two years of content drops with no renewable engine underneath them.` },
    { q:`How do you tell a real skill ceiling from a wishful one?`,
      a:`Record veterans and novices on the same challenge and compare. If the difference is small, the ceiling is where the veterans are, not where the document says. Also check whether veterans can articulate what they do, because a skill nobody can name is usually not being learned.`,
      follow:`The ceiling is too low. What raises it without punishing novices?`,
      red:`Raises difficulty numbers and calls that a higher ceiling.` }
  ] });
DIAGRAM('mastery-discovery-expression', { kind:'matrix', title:'Three engines of long-term engagement',
  rows:['Mastery','Discovery','Expression'], cols:['Player feels','Fed by','Example'],
  cells:[['I am getting better','Clear feedback, rising challenge','Celeste'],['There is more to find','Hidden depth, secrets, systems','Hollow Knight'],['This is mine','Tools that combine freely','Minecraft']] });

T('social-experience',{ d:'experience', t:'Social experience', tag:'Who does the player matter to? Even single-player games answer this.',
  what:`The ways a game makes players matter to others and others matter to them: cooperation, competition, spectatorship, sharing, teaching, community. In single-player, relatedness comes from characters, companions and a world that responds. Socially shaped games change how content is consumed and how long they live.`,
  why:[`Relatedness is one of the three core needs. Games that satisfy it retain differently.`,`Social systems generate content (stories, rivalries, guides) that the team never has to make.`,`Social pressure can also be the strongest churn driver: toxicity, obligation, being left behind.`],
  think:{ q:[`Who sees what the player did? Who cares?`,`Is competition here about skill, time invested, or spending? Players sense the difference.`,`What happens to a player who falls behind the group?`,`Can players teach each other, and does the design reward it?`],
    trade:[`Competition energizes some players and drives others out.`,`Cooperation requires coordination cost. Too much becomes a chore.`],
    traps:[`Bolting on social features (friends lists, leaderboards) without a social act inside the game.`,`Designing social systems around whales rather than around the majority who make the game feel alive.`],
    good:[`Players tell stories about each other.`],
    bad:[`Social features are ignored or feel like obligation.`] },
  how:[`Identify the social act the game supports: compete, cooperate, show, share, teach, or be seen by characters.`,`Ensure the act creates something visible (a result, a story, a status).`,`Design the falling-behind experience deliberately.`,`Test with groups, not individuals, if the game is social.`],
  ai:{ yes:[`Map social features to the social acts they enable and flag hollow ones.`,`Model catch-up dynamics and matchmaking tradeoffs.`],
       no:[`Decide whether the game is social at heart.`] },
  prompts:[{l:'Social act audit',p:`Here are our social features: [LIST]. For each, name the social act it enables (compete, cooperate, show, share, teach, be seen) and what visible artifact it produces. Flag features with no act or no artifact. Then describe the experience of a player who falls behind by two weeks, and propose the smallest change that makes that experience tolerable without removing the reason to keep up.`}],
  verify:[`Does the analysis distinguish social acts from social UI?`],
  test:[`Test with real groups. Do players talk about each other afterwards?`,`Observe a returning player who fell behind. What do they do in the first five minutes?`],
  rel:[['player-motivation','Relatedness is a core need.'],['business-model','Social systems and monetization interact strongly.'],['return-and-quit','Social obligation is both a return force and a churn force.']] });
TECH('social-experience',[
  {n:'Interdependence design', how:`Design roles and goals so players need each other in ways each can feel.`, fit:`Co-op that is cooperative, not parallel play.`, cost:`Solo players and matchmaking gaps. Players may idle.`, alt:`Make each role's contribution visible.`},
  {n:'Async and social loops', how:`Gifts, visits, leaderboards or persistent shared state that operate between sessions.`, fit:`Retention and relatedness between sessions.`, cost:`Can become obligation. Needs care not to coerce.`, alt:`Optional, non-punishing social layers.`},
  {n:'Matchmaking and grouping', how:`Skill/behavior-based matching and party formation.`, fit:`Competitive fairness and quick, good sessions.`, cost:`Waiting times. Smurfing and mixed groups.`, alt:`Design for the player pool you actually have.`}
]);
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
INTERVIEW('social-experience',{
  junior:[
    { q:`Who does the player matter to in a single-player game?`,
      a:`Characters who notice, a world that changes because of them, a companion who reacts. Relatedness is one of the three core needs and it does not require other humans. A world that never registers the player is the single-player version of playing alone in an empty lobby.`,
      follow:`Give a moment where being noticed changed how you played.`,
      red:`Says single-player games have no social dimension.` },
    { q:`What is a social act, as opposed to a social feature?`,
      a:`The act is compete, cooperate, show, share, teach, or be seen. The feature is the interface around it. A friends list attached to no act produces nothing, which is why bolted-on social features get ignored and then get blamed on the audience.`,
      follow:`Name a social feature you have seen with no act behind it.`,
      red:`Lists leaderboards, guilds and chat as though naming features answers the question.` },
    { q:`What has to be true for a social act to register with players?`,
      a:`It must produce something visible: a result, a story, a status, a trace another player meets. If nobody can see it happened, it does not create relatedness. That is the test to apply before building the system.`,
      follow:`How would you make teaching visible?`,
      red:`Assumes players will talk about it anyway because the game is good.` }
  ],
  mid:[
    { q:`Design the falling-behind experience. Why is that a design task at all?`,
      a:`A player two weeks behind has a first five minutes that decides whether they stay. If it is humiliating or unplayable they leave, and that is a designed outcome whether or not anyone designed it. You want catch-up that does not remove the reason the others kept up.`,
      follow:`How do you offer catch-up without devaluing the people who kept pace?`,
      red:`Leaves it to matchmaking and hopes the problem sorts itself out.` },
    { q:`Competition energises some players and drives others out. How do you hold both?`,
      a:`Separate the ladders, make the competitive act visible but optional, and make sure what is being compared is skill rather than time invested or money spent. Players detect that difference quickly. Give the non-competitive player a parallel act with its own visible artefact.`,
      follow:`How do you keep the comparison about skill when time and money also buy power?`,
      red:`Puts everyone on one global leaderboard and calls it fair.` },
    { q:`How do you test a social game?`,
      a:`With real groups, not individuals. Watch what players say about each other after the session, not during it. Observe a returning player who fell behind. A solo test of a social game measures the tutorial and nothing else.`,
      follow:`You can only get four testers in a room. What can you still learn?`,
      red:`Runs solo sessions and infers the group experience from them.` }
  ],
  senior:[
    { q:`Toxicity is rising and new-player retention is falling. Where do you start?`,
      a:`Look at which acts the systems reward and whether any of them require punishing another player. Look for places where strangers are forced together with high stakes and no exit. Change incentives and matching before building a reporting pipeline, because moderation manages a symptom the design keeps producing.`,
      follow:`Moderation tooling or design change first, and why?`,
      red:`Treats it purely as a moderation problem with no design cause.` },
    { q:`Social systems generate content you never made. How do you plan for that?`,
      a:`Name the artefacts you want players to produce: stories, rivalries, guides, clips. Design the acts that produce them and leave the record somewhere others will find it. Then budget the community and moderation cost, because that content arrives with its own liabilities.`,
      follow:`What is the cost side you have to accept when you do this?`,
      red:`Designs the social layer around the highest spenders and treats everyone else as a funnel.` }
  ] });

T('feature-vs-experience',{ d:'experience', t:'Experience thinking, not feature thinking', tag:'"We need crafting" is a feature. "Players should make meaningful preparation decisions" is a design goal. Start from the second.',
  what:`Feature thinking starts from a thing to build and justifies it afterwards: feature, implementation, justification. Experience thinking starts from a player behavior and derives the feature last: desired player behavior, experience, system, mechanic, feature. The same word ("crafting") can be the right answer to a behavior goal or a genre reflex. The ladder tells you which.`,
  why:[`Features are how scope inflates: each is plausible, none is necessary, and together they bury the core.`,`A behavior goal admits many solutions, some far cheaper than the feature you first imagined.`,`AI makes features cheap to propose and build. Without a behavior goal there is no way to reject them.`],
  think:{ q:[`What do I want the player to do differently? Say it as an observable behavior.`,`What would they feel while doing it?`,`What system creates that situation? What is the smallest mechanic that implements it?`,`Only now: which feature, and could an existing one do the job?`],
    trade:[`Behavior-first design is slower to start and far cheaper to finish.`,`Genre features carry player expectations. Omitting one may cost recognition even if it adds no behavior.`],
    traps:[`Writing the behavior to justify the feature you already wanted.`,`Behavior goals that are not observable ("players feel immersed").`,`Skipping the system rung and jumping from behavior to feature.`],
    good:[`Feature proposals arrive with a behavior and a signal attached.`,`Features get cut when a cheaper mechanic produces the behavior.`],
    bad:[`The roadmap is a list of nouns.`] },
  how:[`Use the Behavior Ladder tool: start with the feature idea, climb to the behavior, then descend again to the smallest mechanic.`,`For every feature request, demand the behavior and the observable signal.`,`Compare the original feature with the mechanic the ladder produced. Build the smaller one.`,`Test for the behavior, not for the feature's presence.`],
  ai:{ yes:[`Climb the ladder from a feature to candidate behaviors.`,`Generate alternative mechanics for a stated behavior.`,`Flag feature requests that lack a behavior.`],
       no:[`Choose the behavior. That is what the game is about.`] },
  prompts:[{l:'Ladder climb',p:`Someone proposed the feature "[FEATURE]". Climb the ladder: what player behaviors could this feature exist to produce (list 3, each observable in a playtest)? For the most plausible, what experience does the behavior create? What system would produce that situation? What is the smallest mechanic that implements it? Compare that mechanic with the original feature: which is cheaper and which produces the behavior more reliably?`}],
  verify:[`Are the behaviors observable, or feelings?`,`Did it land back on the original feature by default?`],
  test:[`Did the behavior appear? Measure it directly. Do not measure feature usage.`],
  rel:[['core-experience','The behavior serves the core experience.'],['scope-control','The ladder is the scope filter at feature level.'],['should-we-build-this','The decision tree is the ladder plus evidence.'],['hypothesis-driven-design','A behavior goal is a hypothesis.']] });
TECH('feature-vs-experience',[
  {n:'Behavior ladder', how:`Climb from a proposed feature to the behavior and experience it should produce, then back to the smallest mechanic.`, fit:`Testing whether a feature idea serves the experience.`, cost:`Can land back on the same feature (sometimes correct, often rationalization).`, alt:`Use the Behavior Ladder tool.`},
  {n:'Outcome-first framing', how:`State the player outcome you want before the solution. Reject solutions that do not produce it.`, fit:`Killing feature-creep at the source.`, cost:`Requires discipline and a decision owner.`, alt:`Follow with Should We Build This?`}
]);
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
INTERVIEW('feature-vs-experience',{
  junior:[
    { q:`Someone asks for crafting. What do you ask back?`,
      a:`What should the player do differently, stated as something you could see in a playtest. Then what experience that behaviour creates, then what system produces the situation, then the smallest mechanic that implements it. The word crafting comes last, if it survives.`,
      follow:`They answer that players should feel immersed. Is that a behaviour?`,
      red:`Starts scoping a crafting system on the spot.` },
    { q:`Give me the ladder in order, and say why the direction matters.`,
      a:`Behaviour, experience, system, mechanic, feature. Run in reverse it is feature thinking, which justifies after the fact and always concludes that the original idea was right. Climbing first is what exposes the cheaper answer.`,
      follow:`Which rung do people skip most often?`,
      red:`Recites the rungs and then treats the ladder as a documentation template.` },
    { q:`What makes a behaviour goal observable?`,
      a:`You can watch it happen. The player prepares before entering, changes loadout between attempts, asks a teammate for something, backtracks to a shop. Feelings are not observable, so a goal written as a feeling cannot be passed or failed.`,
      follow:`Rewrite "players feel powerful" as a behaviour.`,
      red:`Writes goals like immersed, engaged or invested and calls them measurable.` }
  ],
  mid:[
    { q:`The roadmap is a list of nouns. What do you do about it?`,
      a:`Demand a behaviour and an observable signal for each item, then re-derive the smallest mechanic. Expect a meaningful share to collapse into systems that already exist. Present the recovered scope rather than the criticism, because the saving is what gets the process adopted.`,
      follow:`A noun survives the ladder and is still expensive. Then what?`,
      red:`Rejects the roadmap without offering the ladder or any alternative.` },
    { q:`Genre expectation says the game needs an inventory screen. The ladder says no. What do you do?`,
      a:`Name the trade openly: recognition against scope. Expectation is a real cost, so this is a decision rather than an error. Often a minimal version buys the recognition without the system, and you test whether the expectation is real for your specific player rather than for the genre.`,
      follow:`How would you test whether that expectation is real for your player?`,
      red:`Builds the full system because every game in the genre has one.` },
    { q:`How do you stop yourself writing the behaviour to justify the feature you already wanted?`,
      a:`Write the behaviour before naming the feature. Have someone else generate alternative mechanics for it. Check whether any cheaper mechanic produces the same behaviour. If no alternative was ever considered, the ladder was theatre and you should say so.`,
      follow:`Give a case where the ladder actually changed your mind.`,
      red:`Claims the ladder has always confirmed the original idea.` }
  ],
  senior:[
    { q:`AI makes features cheap to propose and to build. What breaks?`,
      a:`The rejection mechanism. Cost used to do the filtering quietly and now it does not. A behaviour goal with an observable signal becomes the only gate left, and without it the game gets bigger and less clear at the same speed. Volume is not the win it looks like.`,
      follow:`How do you enforce that gate without becoming the bottleneck yourself?`,
      red:`Welcomes the volume and plans to cut it all later, which never happens.` },
    { q:`How do you measure whether a shipped feature worked?`,
      a:`Measure the behaviour, not the usage. Usage tells you the button was pressed. Compare against the signal agreed before the build, and be willing to remove the feature when the behaviour did not appear. Removal is what makes the process credible next time.`,
      follow:`Usage is high and the behaviour is absent. What do you conclude?`,
      red:`Reports engagement numbers as proof of success and moves to the next item.` }
  ] });
DIAGRAM('feature-vs-experience', { kind:'stack', title:'Start from the behaviour, end at the feature', taper:true, arrow:'design in this order',
  layers:[{t:'Behaviour', d:'players scout, plan and commit before a fight'},{t:'Experience', d:'anticipation, then competence when the plan works'},{t:'System', d:'limited slots and visible threats reward planning'},{t:'Mechanic', d:'choose three items before the gate closes'},{t:'Feature', d:'crafting, only if it serves the mechanic'}] });

T('design-pillars',{ d:'experience', t:'Design pillars and creative direction', tag:'Two to four non-negotiable statements that let anyone on the team settle a design argument without asking the director.',
  what:`Design pillars are a short set of statements describing what the game must always do and what it must never do, so that decisions stay consistent when made by different people at different times. They are not a theme and not a feature list. They are creative direction made checkable. Goals and non-goals apply the same idea to the project: what this game is for and what it deliberately refuses.`,
  why:[`Without pillars, decisions get settled by whoever argues longest or by feature comparison.`,`Pillars surface conflicts early, for example tension against comfort, or mastery against accessibility.`,`Non-goals prevent scope creep and protect the experience from well-meaning additions.`,`A pitch that names its pillars can be tested against the mechanics instead of admired.`],
  think:{ q:[`What two to four things must always be true here, and what does each forbid?`,`Which pillar would I sacrifice to keep another? If none, the list is decoration.`,`What is this game deliberately not?`,`Can every current feature be traced to a pillar, or does one contradict them?`,`Would a new team member know what to cut just from reading them?`],
    trade:[`A sharp pillar set excludes some players and features. A vague one includes everything and guides nothing.`,`Fewer pillars are easier to hold in mind. More reflect more of the game and dilute the signal.`],
    traps:[`Writing values any game could claim, such as fun, immersive or player-first.`,`Turning pillars into a feature list.`,`Pillars that contradict the mechanics, so the team learns to ignore them.`,`No non-goals, so the project grows in every direction at once.`],
    good:[`A team member can reject a feature by naming the pillar it violates.`,`The pillars predict disagreements before they happen.`],
    bad:[`The pillars cannot be used to decide anything.`,`Every feature can be justified, which means none is protected.`] },
  how:[`Write candidate pillars from the fantasy and the core experience.`,`For each pillar, write what it forbids. A pillar with no cost is a slogan.`,`Add the non-goals: adjacent experiences you refuse and features you will not build.`,`Test the set against five decisions the team is debating. If the pillars do not resolve them, rewrite.`,`Publish them and change them only with evidence.`],
  ai:{ yes:[`Generate candidate pillar sets from a fantasy and, for each, the features it would forbid.`,`Attack a pillar set: name the decisions it cannot resolve and the features it would wrongly cut.`,`Check the current feature list against the pillars and flag contradictions.`],
       no:[`Choose the pillars. They are founding commitments.`,`Soften a pillar to avoid a hard tradeoff.`] },
  prompts:[{l:'Candidate pillars',p:`Here is our fantasy, core experience and current feature list: [CONTEXT]. Propose 3 different sets of 2 to 4 design pillars. For each pillar, state in one sentence what it forbids and which current feature it puts at risk. Then name the decisions each set still cannot resolve. Do not recommend one.`},{l:'Pillar audit',p:`Our pillars are: [PILLARS]. Our current design decisions are: [DECISIONS]. For each decision, say which pillar it serves or violates, and where two pillars conflict. Then state the single pillar that is doing no work and must be rewritten or cut.`}],
  verify:[`Does every pillar forbid something concrete?`,`Can the set settle a real current disagreement?`],
  test:[`Give three team members a debatable feature and the pillars. Do they reach the same call independently?`,`Review one week of decisions. Could each have been made from the pillars alone?`],
  rel:[['core-experience','The pillars are the core experience turned into decisions.'],['feature-vs-experience','Pillars are how experience thinking survives a feature request.'],['scope-control','Non-goals are the first line of scope control.'],['audience-and-positioning','The pillars shape what the positioning sentence can promise.']] });
TECH('design-pillars',[
  {n:'Pillar set', how:`Two to four statements of what must always hold, each with what it forbids.`, fit:`New projects and any team larger than two people.`, cost:`Aims the whole project and excludes options.`, alt:`A single sentence of intent when the project is tiny.`},
  {n:'Non-goals list', how:`The adjacent experiences and features the game deliberately refuses.`, fit:`Projects with scope pressure from every direction.`, cost:`Requires saying no to appealing ideas up front.`, alt:`A written cut list at the first scheduling crunch.`},
  {n:'Decision test', how:`Replay five current disputes against the pillars and rewrite any that cannot resolve them.`, fit:`Auditing an existing, inherited pillar set.`, cost:`Reopens decisions people considered settled.`, alt:`Run the test once per milestone.`}
]);
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
INTERVIEW('design-pillars',{
  junior:[
    { q:`What is a design pillar, and how is it different from a value?`,
      a:`Two to four statements about what the game must always do and must never do, each forbidding something concrete. A value like immersive or player-first forbids nothing, so it settles no argument. The test is whether you can name what the pillar costs you.`,
      follow:`Take one pillar and tell me exactly what it forbids.`,
      red:`Offers "player-first" or "immersive" as a pillar and cannot say what it rules out.` },
    { q:`How would a new team member use the pillars in their first week?`,
      a:`To reject a feature by naming the pillar it violates, without escalating to the director. That is the entire purpose. If they cannot do that, the set is decoration and the director is still the bottleneck they were meant to remove.`,
      follow:`They name a pillar and a senior disagrees. What happens next?`,
      red:`Says pillars are for the pitch deck and the marketing team.` },
    { q:`Why do non-goals matter as much as the pillars?`,
      a:`They name the adjacent experiences you refuse and the features you will not build. That is the first line of scope control and the fastest way to close a well-meaning addition without a meeting.`,
      follow:`Give a non-goal you have used and the request it killed.`,
      red:`Has no non-goals because the team wants to keep its options open.` }
  ],
  mid:[
    { q:`The pillars contradict the mechanics. What happens, and what do you do?`,
      a:`The team learns to ignore them, which is worse than having none because it also teaches them to ignore the next set. Either the mechanics change or the pillar was aspirational and needs rewriting. Test the revised set against five disagreements currently live in the team.`,
      follow:`Which do you change first, and how do you get agreement on it?`,
      red:`Leaves the contradiction in place and calls the pillars aspirational.` },
    { q:`Two pillars conflict on a real decision. Is that a failure of the set?`,
      a:`No, that is the set working. Pillars surface conflicts early and force someone to say which one yields in this case. A set that never conflicts is not describing a real game with real trade-offs.`,
      follow:`Which of your pillars would you sacrifice to keep another?`,
      red:`Claims all the pillars are equally non-negotiable, which means none of them decides anything.` },
    { q:`How do you know a pillar is doing no work?`,
      a:`Review a week of decisions and ask which pillar decided each one. The pillar that never appears is a slogan. Also check whether any feature at all could be justified by it, because a pillar that justifies everything forbids nothing.`,
      follow:`You find two doing no work. Do you cut them or rewrite them?`,
      red:`Adds more pillars to cover the gaps the existing ones left.` }
  ],
  senior:[
    { q:`Give me a process for writing pillars that survive contact with a team.`,
      a:`Derive candidates from the fantasy and the core experience. Write what each one forbids. Add the non-goals. Then test the set against five arguments the team is having right now, and rewrite until it resolves them. Publish only after that, and change it afterwards only with evidence.`,
      follow:`How do you handle a legitimate change two years in?`,
      red:`Runs a workshop, publishes the output, and never tests it against a real disagreement.` },
    { q:`How do pillars interact with a publisher or platform mandate?`,
      a:`They are the written record of what the game is, so an external ask gets answered as a trade against a named pillar rather than as a yes or a no. That keeps the conversation about consequences and gives the other side an honest price instead of resistance.`,
      follow:`The mandate breaks a pillar and is not negotiable. What do you do?`,
      red:`Quietly amends the pillars to accommodate the mandate and tells nobody.` }
  ] });
