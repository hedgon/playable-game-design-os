/* =====================================================================
   PLAYER
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'player', lens:'design', t:'Player', short:'Who plays, what they want, why they stay or quit', color:'var(--d-player)',
    sum:`Everything starts here. A game is a promise made to a specific person about how they will feel and what they will get to do. If you cannot describe that person and that promise, every later decision is a guess.`,
    links:[['experience','A player brings desires. The experience is the promise you make to satisfy them.'],['product','Audience, platform and business model are the same decision seen from the market side.'],['ux','What the player already knows decides how much the game must teach.'],['ai','AI cannot observe your players. You must bring the player model to it.']] });

T('who-is-the-player',{ d:'player', t:'Who is the player?', tag:'A concrete person with prior knowledge, a context, and a reason to be here. Not “gamers”.',
  what:`A player model: who they are, what games they already know, how long their sessions are, what device and posture they play in, what they expect from a game “like this”, and what they are hoping to feel. It is the reference point every design decision is judged against.`,
  why:[`Every heuristic in design is relative to a player. “Too hard”, “too slow”, “confusing” mean nothing without a person.`,`Prior knowledge decides how much you must teach. A veteran of the genre reads conventions instantly. A newcomer reads nothing.`,`Context (commute, couch, competitive ladder) decides session length, input precision and tolerance for friction.`,`A game that targets everyone is optimised for no one and loses to games that made a choice.`],
  think:{ q:[`Which three games does this player already love, and what do they love about them?`,`What is their session: 3 minutes standing, 40 minutes on a couch, 3 hours at a desk?`,`What conventions can I assume they already know? Which ones would surprise them?`,`What would make them recommend this to a friend, in one sentence?`,`Who is explicitly NOT the player? What will they dislike about my game, and am I okay with that?`],
    trade:[`Narrow player model: easier to delight, smaller market. Broad model: safer on paper, blander in play.`,`Genre veterans forgive complexity but punish clichés. Newcomers forgive clichés but punish complexity.`],
    traps:[`Designing for yourself and calling it “the core audience”.`,`Using demographic labels (age, gender, “casual”) in place of behavior and motivation.`,`Treating player taxonomies (Bartle types, personas) as facts about individuals rather than heuristics about tendencies.`],
    good:[`You can name the player’s last three games and what they did in the first ten minutes of each.`,`Design debates end with “what would our player do here?” and the team agrees on the answer.`],
    bad:[`The pitch says “for fans of X and Y” where X and Y attract different people.`,`Playtesters recruited “from anyone available” produce feedback nobody can act on.`] },
  how:[`Write a one-paragraph player sketch: name, the games they finished recently, their session shape, their device, the feeling they are chasing.`,`List the conventions they already know (from those games) and the ones that will be new. This list becomes your onboarding budget.`,`Write the “not for” list: the players who will bounce. Decide consciously whether that is acceptable.`,`Recruit playtesters who match the sketch. Reject feedback from mismatched testers on questions of taste. Keep it on questions of clarity.`,`Revisit the sketch after each playtest round. Real behaviour overrides the sketch.`],
  ai:{ yes:[`Draft candidate player sketches from your positioning and genre so you can react to them.`,`Enumerate genre conventions your player likely knows, with examples from named games.`,`Analyze reviews and forum discussions of comparable games to surface what those players praise and complain about.`,`Build a playtester screening questionnaire from the sketch.`],
       no:[`Decide who the player is. That is a strategic commitment, not an analysis.`,`Invent player behaviour data. Ask it to mark inferences as inferences.`,`Replace observation: AI has never watched your player play your game.`] },
  prompts:[{l:'Player sketch candidates',p:`Act as a player researcher. Here is our genre, platform, session length target and the three games we consider closest: [LIST]. Draft 3 distinct player sketches (name, recent games finished, session shape, device/posture, the feeling they are chasing, what makes them quit a game). For each, list 5 conventions they will already know and 3 things that would surprise them. Mark every claim you cannot support from the reference games as an assumption.`},
    {l:'Complaint mining',p:`Here are review excerpts and forum posts for [COMPARABLE GAME]. Cluster the complaints and praises by underlying player motivation (competence, autonomy, relatedness, fantasy, novelty). For each cluster, state what player behavior it implies and one design implication for a game targeting the same player. Do not propose features yet.`}],
  verify:[`Are the “conventions this player knows” grounded in games they name, or generic genre lore?`,`Did the sketch smuggle in demographic labels instead of behaviours?`,`Which claims are inferred from data you provided and which are invented plausibility?`],
  test:[`Screen testers: do they match the sketch? Track whether matched and unmatched testers behave differently.`,`Do matched testers recognise the conventions you assumed without explanation?`,`Where do matched testers hesitate in the first five minutes? Those are conventions you assumed wrongly.`],
  rel:[['player-motivation','Motivation is the why behind the who.'],['fantasy','The fantasy is what this specific player is buying.'],['audience-and-positioning','The same person, described for the market.'],['onboarding','Prior knowledge sets the onboarding budget.'],['playtesting','Recruiting is where the player model meets reality.']] });
TECH('who-is-the-player',[
  {n:'Interviews and observation', how:`Watch matched players and ask behavior-first questions after play.`, fit:`Building the player model from reality rather than assumption.`, cost:`Time, small samples, politeness bias.`, alt:`Combine with telemetry for scale.`},
  {n:'Surveys and motivation scales', how:`Structured instruments (e.g. validated motivation scales) to compare groups.`, fit:`Measuring motivation and preference across many players.`, cost:`Self-report bias. Needs careful wording.`, alt:`Treat as one input alongside behaviour.`},
  {n:'Review and forum mining', how:`Cluster complaints and praise from comparable games to infer unmet wants.`, fit:`Understanding a genre’s audience before building.`, cost:`Noisy, vocal minorities, needs a coding scheme.`, alt:`Use AI to cluster, a human to interpret.`}
]);
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
    pitfall:`Choosing the control scheme from OS.has_feature(“mobile”). Feature tags come from the export preset, not from the device in front of the player, so a desktop build on a touch laptop reports no touch and a pad plugged in after boot changes nothing. Read the device that was used last, and let the profile change during the session.`,
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
INTERVIEW('who-is-the-player',{
  junior:[
    { q:`Who is the player for the last game you worked on? Describe them without using the word “gamers”.`,
      a:`Name three games they finished recently and what they did in the first ten minutes of each. Then the session shape, the device and posture, and the feeling they came for. Finish with one concrete decision that model changed: a checkpoint distance, a tutorial you deleted, a control scheme you rejected.`,
      follow:`Which conventions did you assume they already knew, and where did a playtest prove you wrong?`,
      red:`Answers with demographics (“males 18 to 34”) or with “anyone who likes a good challenge”.` },
    { q:`A stakeholder tells you the target is “casual players”. What do you do with that?`,
      a:`Push back, politely and specifically. Casual is not a behaviour. Convert it into session length, input precision, tolerance for friction and prior genre knowledge. Ask which games those people finished. Come back with a sketch they can approve or correct.`,
      follow:`They refuse to be more specific. How do you proceed without inventing an audience?`,
      red:`Accepts the label and starts simplifying the tutorial for an imaginary person.` },
    { q:`What does the player model change in the build?`,
      a:`Prior knowledge sets the onboarding budget. Session shape sets checkpoint spacing and save granularity. Device and posture set input precision and text size. Give one example where the model made you cut something you liked.`,
      follow:`Give a case where the device choice killed a mechanic you wanted.`,
      red:`Treats the player model as a marketing document that never touches a design decision.` }
  ],
  mid:[
    { q:`Playtest feedback splits: half say it is too slow, half say too fast. How do you resolve it?`,
      a:`Segment by match to the sketch before averaging anything. Clarity feedback counts from everyone. Taste feedback counts only from matched testers. Check whether the split tracks prior genre experience. Then decide which half is the player and say so out loud.`,
      follow:`The split is inside your matched group. Now what?`,
      red:`Averages the two and tunes to the middle, producing a pace nobody asked for.` },
    { q:`How do you recruit playtesters for a game that has no players yet?`,
      a:`Screen from the sketch: recently finished games, session shape, device. A five-question form does it. Recruit from the communities of the reference games, not from the desks around you. Track matched and unmatched testers separately so you can weight their feedback differently.`,
      follow:`What do you do with the unmatched testers already on the schedule?`,
      red:`Uses whoever is in the office and treats developer taste as the target.` },
    { q:`Write me the “not for” list for a game you know. Why bother?`,
      a:`Naming who will bounce makes the trade-off conscious instead of accidental. It gives the team a rejection tool that does not require the director. It stops the design drifting towards everyone, which is how a game ends up preferred by no one.`,
      follow:`Which feature request have you rejected with that list?`,
      red:`Refuses to exclude anyone because “we want the widest possible audience”.` }
  ],
  senior:[
    { q:`After vertical slice, the publisher wants the audience widened. How do you answer?`,
      a:`Ask what widening means as behaviour, not as a label. Cost it: onboarding budget, difficulty range, readability at a new device size. Name what the current player loses. Then present options with prices, from assist options to a re-tuned curve to a different game, and take it to the pillars rather than to opinion.`,
      follow:`They insist. What do you change first, and what do you refuse to change?`,
      red:`Agrees immediately, adds difficulty settings as a gesture, and never re-tests with the new player.` },
    { q:`How do you keep a player model honest two years into production?`,
      a:`Revisit it after every playtest round and record where real behaviour contradicted it. Keep it where decisions are made, next to the pillars, not in a folder. Retire personas nobody cites. The rule is that observed behaviour overrides the sketch, always.`,
      follow:`What did you have to change in yours, and what did that cost the schedule?`,
      red:`Cites a persona deck written at kickoff that nobody has opened since.` }
  ] });

T('player-motivation',{ d:'player', t:'Player motivation', tag:'Competence, autonomy, relatedness: why people keep playing when nothing forces them to.',
  what:`The psychological needs a game satisfies. Self-Determination Theory (Ryan and Deci, later applied to games by Rigby and Ryan) names three: competence (I am getting good at this), autonomy (I chose this), relatedness (I matter to others). Other lenses add curiosity, fantasy, collection and status. Quantic Foundry’s Gamer Motivation Model (Nick Yee) measures twelve motivations in six pairs (Action, Social, Mastery, Achievement, Immersion, Creativity) as continuous scales from player surveys. These are heuristics with research behind them, not laws.`,
  why:[`Intrinsic motivation predicts voluntary return. Extrinsic rewards (daily login bonuses, timers) can crowd it out and leave a hollow habit.`,`Different players weight the needs differently. The same mechanic can feed competence for one player and frustrate autonomy for another.`,`Most “retention problems” are motivation problems in disguise: the loop stopped feeding a need.`],
  think:{ q:[`Which need does the core loop feed in the first ten minutes? Which does it feed at hour ten?`,`Where does the player feel they chose, versus were funnelled?`,`Where does the player see themselves getting better, with evidence they can perceive?`,`Who does the player matter to inside or around the game?`],
    trade:[`Strong extrinsic hooks raise short-term metrics and lower long-term voluntariness.`,`Autonomy (many valid options) fights competence (clear path to mastery). Great games stagger them.`],
    traps:[`Reading “players like rewards” as “add more rewards”. Rewards that do not signal competence or unlock autonomy become noise.`,`Assuming a persona type explains an individual. Taxonomies describe tendencies, people switch modes.`],
    good:[`Players describe what they did (“I found a way to...”) rather than what they got.`,`Players return without notifications.`],
    bad:[`Players describe the game as “grindy” or “a chore” but keep logging in. That is habit, not motivation, and it churns suddenly.`] },
  how:[`Map each major system to the need it primarily feeds. Blank cells are opportunities. A system feeding no need is a candidate to cut.`,`For competence: ensure the player can perceive their own improvement (mastery feedback, not just numbers).`,`For autonomy: audit where choices are real (different consequences) versus cosmetic.`,`For relatedness: identify who the player matters to, even in single-player (a companion, a town, a leaderboard of friends).`,`Playtest with the question “why did you keep going?” asked after a natural stopping point.`],
  ai:{ yes:[`Map systems to motivational needs and flag gaps.`,`Generate alternative ways a given moment could feed competence, autonomy or relatedness.`,`Summarize the research on intrinsic versus extrinsic motivation as it applies to a specific mechanic you describe.`,`Analyze playtest transcripts for motivational language (“I figured out” versus “I got”).`],
       no:[`Declare which need your game is about. That is identity.`,`Assert that a mechanic “is motivating” without behavioural evidence.`] },
  prompts:[{l:'Motivation audit',p:`Act as a sceptical player psychologist. Here is our core loop and major systems: [DESCRIPTION]. For each system, state which psychological need it primarily feeds (competence, autonomy, relatedness, curiosity) and how the player would perceive that. Then identify systems that feed no need, and moments where an extrinsic reward may be crowding out an intrinsic one. Propose observable playtest signals for each claim. Do not propose new features.`}],
  verify:[`Does the analysis cite observable player behaviour, or does it label systems with psychology words?`,`Is “motivating” being asserted for the designer’s intent rather than the player’s experience?`],
  test:[`After a natural stopping point, ask “why did you keep going?” and code answers as competence, autonomy, relatedness, curiosity, or obligation.`,`Do players return the next day without being prompted?`,`Do players describe their own improvement in specifics?`],
  rel:[['return-and-quit','Return and churn are motivation seen over time.'],['progression','Progression is how competence and autonomy are scheduled.'],['fun-dimensions','Fun dimensions are motivation seen moment to moment.'],['social-experience','Relatedness is the social dimension of motivation.']] });
TECH('player-motivation',[
  {n:'Need mapping', how:`Map each system to the psychological need it feeds and find gaps.`, fit:`Auditing whether the loop and meta feed competence, autonomy and relatedness.`, cost:`Heuristic. Needs behavioural validation.`, alt:`Pair with playtest language analysis.`},
  {n:'Flow and challenge calibration', how:`Keep challenge near skill and let players steer difficulty. Watch for boredom and anxiety bands.`, fit:`Pacing moment-to-moment engagement.`, cost:`Flow-channel literalism is contested. Some games live outside it on purpose.`, alt:`Use as a lens, not a law.`},
  {n:'Motivation measurement in playtests', how:`Code player language (“I figured out” vs “I got”) and return behavior as evidence.`, fit:`Turning psychology claims into observable signals.`, cost:`Needs a coding scheme and enough sessions.`, alt:`Ask “why did you keep going?” at a natural stop.`},
  {n:'Gamer Motivation Profile', how:`Quantic Foundry’s model scores twelve motivations in six pairs: Action (destruction, excitement), Social (competition, community), Mastery (challenge, strategy), Achievement (completion, power), Immersion (fantasy, story) and Creativity (design, discovery). Compare the profile of the audience you want with what your loop rewards.`, fit:`Positioning and audience fit: does the audience you want care about what your systems reward?`, cost:`Self-reported tendencies from surveys, not a measure of your game. Scores hold up well on retest but change with age: interest in competition falls the most.`, alt:`Need mapping plus coded playtest language.`}
]);
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
    pitfall:`Keeping the counters on a scene node. change_scene_to_file() frees the current scene and everything under it, so every session metric resets when the player changes room and the data says nobody plays longer than four minutes. Counters that describe the player belong on an autoload. Counters that describe a level belong on the level.`,
    map:`A Godot autoload is a Unity DontDestroyOnLoad singleton, and NOTIFICATION_APPLICATION_PAUSED is OnApplicationPause(true).` },
  unity:{ term:`The same counters live on a DontDestroyOnLoad service created before the first scene. Unity’s trap is the clock: measure engagement with scaled time and every pause menu subtracts itself from the session you recorded.`,
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
  note:`Client counters are the cheap half. The moment you want retention across devices or a cohort comparison, these events have to leave the build and land in a store you control, and the client’s job shrinks to buffering and flushing rather than deciding what is true.` });
INTERVIEW('player-motivation',{
  junior:[
    { q:`Why does someone keep playing when nothing forces them to?`,
      a:`Name the three needs: competence, autonomy, relatedness. Then attach each to a mechanic rather than reciting the theory. Say which need your loop feeds in the first ten minutes and which it feeds at hour ten, because they are rarely the same one.`,
      follow:`Which need does your favourite game feed worst, and how can you tell?`,
      red:`Answers “rewards”, or recites Self-Determination Theory without touching a single mechanic.` },
    { q:`A daily login bonus lifts day-one retention. What is your concern?`,
      a:`Extrinsic hooks can crowd out intrinsic motivation and leave habit behind. Habit churns suddenly and without warning. The question is whether players return when the notification is off, and whether the bonus is teaching them that the reason to open the game is outside the game.`,
      follow:`How would you test whether the bonus is carrying the retention?`,
      red:`Treats the metric lift as proof the feature works and moves on.` },
    { q:`Where does autonomy live in a game?`,
      a:`In choices whose consequences differ, not in the number of options. A fork where both paths resolve the same way is a funnel wearing a fork’s clothes. Name a moment in a game you know where the choice changed what came next.`,
      follow:`Show me a choice in your own game that looks like autonomy and is not.`,
      red:`Equates autonomy with a settings menu or with character customisation.` }
  ],
  mid:[
    { q:`Retention drops at day seven. Walk me through the diagnosis.`,
      a:`Do not reach for a retention mechanic. Find what players were doing when sessions stopped, then ask which need stopped being fed there. Usually it is competence, because the mastery signal went flat, or autonomy, because one option started dominating. Form one hypothesis and the smallest experiment that moves it.`,
      follow:`You find the mastery signal is missing. What is the smallest change that restores it?`,
      red:`Proposes a battle pass before naming which need went unfed.` },
    { q:`Map our systems to the needs they feed. What do you do with the blanks?`,
      a:`A blank cell is either an opportunity or a cut. Work out which by asking what the player would lose if the system went away. Systems that feed no need and create no decision are the cheapest scope you will ever recover.`,
      follow:`Which system did you cut after running that audit?`,
      red:`Labels every system with all three needs, which means the audit found nothing.` },
    { q:`How do you get evidence about motivation out of a playtest instead of guessing?`,
      a:`Ask at a natural stopping point, not at the end of a forced session: why did you keep going? Code the answers as competence, autonomy, relatedness, curiosity or obligation. Watch for “I figured out” against “I got”. Check whether they come back the next day unprompted.`,
      follow:`A tester says the game is addictive. Is that good news?`,
      red:`Asks players to rate fun from one to five and treats the average as the finding.` }
  ],
  senior:[
    { q:`The business wants stronger hooks. Design says it will hollow the game. How do you settle it?`,
      a:`Separate the two curves: short-term metric and voluntary return. Propose a bounded experiment with a kill criterion agreed in advance, and define what obligation looks like in the data before you run it. Then make the trade explicit against the pillars so the decision is recorded, not re-argued every month.`,
      follow:`What number would have made you concede the point?`,
      red:`Frames it as art against business and refuses to propose a measurable test.` },
    { q:`How do you design for relatedness in a single-player game?`,
      a:`Find the social act the game can support: being seen, teaching, leaving traces, being remembered by characters. Companions and a town that reacts satisfy relatedness more reliably than any friends list. The act has to produce something visible or it does not register.`,
      follow:`Give an example where you tried it and the world still felt indifferent.`,
      red:`Proposes a leaderboard and a friends list and calls it relatedness.` }
  ] });

T('fantasy',{ d:'player', t:'Fantasy and desire', tag:'What the player is buying is a version of themselves. Name it precisely.',
  what:`The fantasy is the identity, power or situation the player gets to inhabit: master thief, nurturing farmer, cunning general, unstoppable force, curious explorer. Desire is the pull towards it. The fantasy is the promise on the box. Every mechanic either pays it off or betrays it.`,
  why:[`The fantasy decides which mechanics feel right. Stealth that requires brute force betrays “master thief” even if it is balanced.`,`Players forgive rough edges when the fantasy is strong, and punish polish when the fantasy is absent.`,`A precise fantasy is the fastest filter for feature ideas: does this make the player more of the person they came here to be?`],
  think:{ q:[`Finish the sentence for the player: “In this game I get to be someone who ___.”`,`What verbs does that person do? Are those the verbs in my core loop?`,`What would break the fantasy instantly if it happened?`,`Is the fantasy about power, competence, identity, relationship, or place?`],
    trade:[`A specific fantasy attracts fewer people more strongly. A vague one attracts more people weakly.`,`Power fantasies need real threat to mean anything. Too much threat becomes a survival fantasy instead.`],
    traps:[`Describing the fantasy as a genre (“it is a roguelike deckbuilder”) instead of an identity.`,`Letting the fantasy be defined by art while the mechanics deliver something else.`],
    good:[`Players describe themselves in first person: “I snuck past all of them.”`,`Feature debates resolve quickly by asking whether the feature serves the fantasy.`],
    bad:[`Players describe the game in third person or by system names: “you manage the meters.”`] },
  how:[`Write the fantasy sentence and the three verbs it implies.`,`Check the core loop: are those verbs the ones the player performs most often? If not, either the loop or the fantasy is wrong.`,`List fantasy-breakers (moments that contradict the identity) and hunt them in playtests.`,`Use the fantasy as the first gate in feature evaluation.`],
  ai:{ yes:[`Generate many candidate fantasy statements from a rough premise so the human can recognise the right one.`,`Enumerate the verbs a fantasy implies and cross-check them against your mechanic list.`,`Hunt for fantasy-breakers in a design document or level script.`],
       no:[`Pick the fantasy. It is the game’s identity and the human owns it.`,`Judge whether the fantasy “lands” without player evidence.`] },
  prompts:[{l:'Fantasy verb check',p:`Our fantasy statement is: “In this game I get to be someone who [FANTASY].” Here is our mechanic list: [LIST]. Extract the 3 to 5 verbs the fantasy implies. For each mechanic, state which fantasy verb it serves, or state that it serves none. Then list moments in the current design that would contradict the fantasy. Rank contradictions by how early a player would meet them.`}],
  verify:[`Did the AI restate the genre instead of the identity?`,`Are the “fantasy verbs” in the loop or only in the pitch?`],
  test:[`Ask players to describe what they did in the session. First person and fantasy verbs are a pass. System names are a fail.`,`Watch for the first moment a player says something that contradicts the fantasy (“why can I not just...”).`],
  rel:[['core-experience','The core experience is the fantasy plus the emotions it produces.'],['ludonarrative-alignment','Story and mechanics must agree on who the player is.'],['core-loop','The loop should perform the fantasy verbs.'],['who-is-the-player','Different players buy different fantasies.']] });
TECH('fantasy',[
  {n:'Fantasy sentence and verb extraction', how:`Write “I get to be someone who ___” and extract the verbs it implies.`, fit:`Turning a vibe into mechanics.`, cost:`Easy to write a fantasy the loop does not deliver.`, alt:`Cross-check verbs against the mechanic list.`},
  {n:'Fantasy-breaker hunt', how:`List moments that would contradict the identity and hunt them in playtests.`, fit:`Preserving the promise.`, cost:`Players may tolerate some breaks. Prioritise by early visibility.`, alt:`Rank breaks by how soon players meet them.`}
]);
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
  unity:{ term:`The verb set is the InputActionAsset’s action names and the Animator’s states. Reading the action map out loud is the fastest fantasy audit a programmer can run, because the map is the list of things a player is able to do.`,
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
    map:`A Unity InputActionAsset is Godot’s InputMap, and an Animation Event is a call method track.` } });
INTERVIEW('fantasy',{
  junior:[
    { q:`Finish this for a game you shipped or studied: “In this game I get to be someone who ___.”`,
      a:`Give an identity, not a genre. Then name the three verbs that identity implies and check them against what the player does most often. If the verbs and the loop disagree, one of them is wrong and you say which.`,
      follow:`Are those verbs the ones the player performs most often, or the ones in the pitch?`,
      red:`Answers with a genre label such as “a roguelike deckbuilder” and stops there.` },
    { q:`What is a fantasy-breaker? Name one from a game you know.`,
      a:`A concrete moment that contradicts the identity the game promised: the master thief who has to brawl, the general who cannot give an order, the survivor who finds ammunition everywhere. Early breakers cost most because the player has not yet decided to forgive anything.`,
      follow:`How would you hunt for them before the first playtest?`,
      red:`Treats it as an art or story problem that the narrative team will handle.` },
    { q:`The art says master thief. Combat is the only reliable way to win a fight. What is wrong?`,
      a:`Mechanics deliver the fantasy, art only dresses it. The loop verbs are the promise the player believes. Either stealth has to become the reliable path or the promise has to change, and the cheaper of those two is the one you argue for.`,
      follow:`What is the cheapest change that keeps the promise?`,
      red:`Proposes more stealth visual effects and a darker palette.` }
  ],
  mid:[
    { q:`How do you use the fantasy as a gate on feature requests?`,
      a:`It is the first filter: does this make the player more of the person they came here to be? It is fast, it is public, and it resolves most arguments without escalation. Give a real feature you rejected with it and one you let through that you now regret.`,
      follow:`Give me a feature that serves the fantasy and you still cut. Why?`,
      red:`Uses the fantasy to justify everything, which means it is gating nothing.` },
    { q:`Testers describe your game in the third person and by system names. What does that tell you?`,
      a:`The fantasy is not landing. Check whether the verbs they perform most often are the fantasy verbs, whether the UI is narrating instead of the play, and whether the first ten minutes put them in the role or in a menu. Then change one thing and re-test the language.`,
      follow:`What is your first experiment, and what would count as a pass?`,
      red:`Rewrites the store description and calls it fixed.` },
    { q:`A power fantasy is testing as boring. Diagnose it.`,
      a:`Power without threat is arithmetic. Check whether failure is possible at all, whether anything forces the player to change plan, and whether the reward is a new situation or a bigger number. The fix is usually stakes, not more power.`,
      follow:`How do you add threat without turning the power fantasy into a survival game?`,
      red:`Raises enemy health and calls it difficulty.` }
  ],
  senior:[
    { q:`Two directors disagree about the fantasy. How do you resolve it without a coin flip?`,
      a:`Write both as identity sentences with their verbs, derive the loop each implies, then build the cheapest prototype that separates them. Bring evidence and the pillars to the meeting. Name who owns the call before you start, because a prototype nobody is obliged to act on settles nothing.`,
      follow:`The prototype comes back ambiguous. Who decides, and on what basis?`,
      red:`Merges the two into a vaguer statement everyone can live with.` },
    { q:`How do you keep one fantasy intact across three years and forty people?`,
      a:`One sentence, published where decisions are made, with its verbs listed under it. A live list of fantasy-breakers anyone can add to. A review gate that asks the question out loud. Onboarding that teaches it on day one. It drifts when the only guardian is the director’s calendar.`,
      follow:`Where did yours drift last time, and what caught it?`,
      red:`Relies on the director personally reviewing every decision.` }
  ] });

T('return-and-quit',{ d:'player', t:'Why players return, why they quit', tag:'Retention is a symptom. The cause is always in what the game did or failed to do.',
  what:`The forces that bring a player back (unfinished goals, anticipated novelty, social obligation, mastery pull, comfort ritual) and the forces that make them leave (confusion, boredom, frustration, loss of agency, finishing, life). Churn points are where these forces net negative.`,
  why:[`Most players quit quietly, early, for reasons they never articulate. If you only listen to those who stay, you learn nothing about why the others left.`,`Retention metrics tell you when players leave. Only observation tells you why.`,`Return reasons that depend on obligation (streaks, fear of missing out) produce fragile retention that collapses the moment the habit breaks.`],
  think:{ q:[`What is the player thinking about when they close the game? If nothing, there is no pull to return.`,`At each churn point, was the player confused, bored, frustrated, satisfied, or interrupted? These need different fixes.`,`What does the player lose by not returning, and is that loss something they value or something the game imposed?`,`What is the first moment a player could reasonably conclude “I have seen what this is”?`],
    trade:[`Anticipation hooks (a visible next unlock) raise return but can make the present feel like waiting.`,`Session-ending friction (checkpoints far apart) increases session length but increases abandonment.`],
    traps:[`Treating churn as one problem. Early churn is usually clarity. Mid churn is usually a mastery plateau or content plateau. Late churn is usually completion.`,`Adding retention mechanics (streaks, timers) before the loop is voluntarily replayable.`],
    good:[`Players mention specific things they want to do next time.`,`Players quit sessions at natural stopping points and return.`],
    bad:[`Players say “it was fine” and never return.`,`Sessions end mid-encounter with no follow-up.`] },
  how:[`Instrument or observe where sessions end. Classify each ending as confusion, boredom, frustration, satisfaction or interruption.`,`For the biggest churn cluster, form a hypothesis about cause and a small experiment that would move it.`,`Ask returning players what they were thinking about between sessions. Ask non-returning players (if you can) what they expected and did not get.`,`Only after the loop is voluntarily replayed, consider anticipation and social hooks.`],
  ai:{ yes:[`Cluster session-end events and playtest notes into churn categories.`,`Generate hypotheses for each churn cluster with the smallest experiment that would test each.`,`Design a survey or exit interview protocol for non-returning testers.`],
       no:[`Decide that a retention mechanic is the answer. Retention mechanics are the last resort, not the first.`,`Interpret telemetry without the qualitative context you provide.`] },
  prompts:[{l:'Churn triage',p:`Here are session-end points and observer notes from [N] playtests: [DATA]. Cluster the endings into confusion, boredom, frustration, satisfaction and interruption. For each cluster, propose 2 plausible causes rooted in the design (not in the player), the evidence in the notes that supports each, and the smallest change that would test it. Flag where the notes are insufficient to distinguish causes.`}],
  verify:[`Does the analysis blame the player (“casual players lack patience”) instead of the design?`,`Are causes tied to specific notes, or asserted?`],
  test:[`Where do sessions end, and what was the player doing in the 60 seconds before?`,`Ask at session end: “What will you do next time you play?” A specific answer predicts return.`,`Do players who quit mid-encounter come back? If not, where was the last checkpoint?`],
  rel:[['player-motivation','Return is motivation over time.'],['onboarding','Early churn is nearly always an onboarding problem.'],['progression','Mid-game churn is often a progression or content plateau.'],['goals-horizons','Unfinished goals are the pull back.']] });
TECH('return-and-quit',[
  {n:'Churn classification', how:`Classify session ends as confusion, boredom, frustration, satisfaction or interruption. Each needs a different fix.`, fit:`Diagnosing why players leave.`, cost:`Telemetry shows when, not why. Needs notes.`, alt:`Pair session-end data with observer notes.`},
  {n:'Return hooks', how:`Visible unfinished goals, anticipated novelty, social pull or comfort ritual.`, fit:`Giving a reason to come back.`, cost:`Obligation hooks create fragile retention. Hooks before a replayable loop are wasted.`, alt:`Fix the loop first. Hooks last.`}
]);
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
    pitfall:`Writing the save to res://. It works every time in the editor and fails on every exported build, because res:// is packed read only inside the binary. It reaches players as “my progress never saves” and cannot be reproduced by the person who wrote it.`,
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
    map:`Unity persistentDataPath is Godot’s user://, and JsonUtility plus File.WriteAllText is FileAccess.store_var.` },
  note:`This is the client half of a save. Once progress is worth money or a leaderboard place, the file becomes a cache of what a server already accepted, and the design question moves to what the client may decide alone while it is offline.` });
INTERVIEW('return-and-quit',{
  junior:[
    { q:`A tester quits twenty minutes in. What do you want to know?`,
      a:`What they were doing in the sixty seconds before they stopped. Then classify the ending: confused, bored, frustrated, satisfied or interrupted. Those four need four different fixes, and treating them as one number is how teams fix the wrong thing.`,
      follow:`You have only telemetry, no player. What can you still conclude?`,
      red:`Concludes the tester was not the target audience.` },
    { q:`What is the difference between a retention number and a retention cause?`,
      a:`The number tells you when players leave. Only observation tells you why. Retention is a symptom and the cause is always something the game did or failed to do at a specific moment you can point at.`,
      follow:`What is the smallest study that gets you an actual cause this week?`,
      red:`Proposes adding more metrics to the dashboard.` },
    { q:`What should a player be thinking about when they close the game?`,
      a:`Something specific they intend to do next time. If the answer is nothing, there is no pull to return and no retention mechanic will manufacture one. That is a long-horizon goal problem, not a notification problem.`,
      follow:`How do you check that in a test rather than assuming it?`,
      red:`Says “they should want to come back” without naming a mechanism.` }
  ],
  mid:[
    { q:`Early, mid and late churn need different fixes. Explain the three.`,
      a:`Early churn is usually clarity: they never understood what they were doing. Mid churn is a mastery plateau or a content plateau. Late churn is completion, which is not a failure. Cite the evidence you would expect to see for each before you spend a sprint.`,
      follow:`How do you tell a mastery plateau from a content plateau with data you can gather this week?`,
      red:`Treats churn as one number and applies one fix to all of it.` },
    { q:`Sessions end mid-encounter and those players do not come back. What do you change?`,
      a:`Look at checkpoint and save granularity against the real session shape. Make stopping points legible and satisfying, and leave something pending rather than something unfinished. A session that ends in failure with no way to close it is the worst place to be interrupted.`,
      follow:`What does moving checkpoints closer cost you in tension?`,
      red:`Adds a return bonus so the player is paid to come back to the same bad moment.` },
    { q:`You cannot reach the players who left. How do you learn anything?`,
      a:`Run a fresh cohort and watch the equivalent segment in person. Match session-end points against moments you have observed directly. Exit-interview the testers you do have, and be explicit about which conclusions the survivors cannot support.`,
      follow:`Which conclusion would you refuse to draw from survivor data?`,
      red:`Interviews only the players who stayed and generalises their preferences to everyone.` }
  ],
  senior:[
    { q:`Leadership asks for a retention feature. When is that the right answer?`,
      a:`Only after the loop is voluntarily replayed. Before that, a retention mechanic buys habit instead of motivation and hides the defect that caused the churn. Offer the diagnosis with a deadline attached, so the ask is answered rather than refused.`,
      follow:`You have four weeks and no time for diagnosis. What do you ship?`,
      red:`Builds streaks and timers, reports the metric, and never revisits the cause.` },
    { q:`Design a churn measurement plan you would defend to a publisher.`,
      a:`Instrumented session endings with enough context to classify them, a qualitative sample alongside, one hypothesis per cluster with the smallest experiment that tests it, and thresholds agreed before the data arrives. Say for each signal what result would falsify the hypothesis.`,
      follow:`If you had to keep three signals and drop the rest, which three?`,
      red:`Proposes a dashboard with no hypothesis attached to any chart on it.` }
  ] });

T('finding-an-idea',{ d:'player', t:'Read the market, then shape one idea', tag:'You do not need an idea. You need a want players already spend time, money or workarounds on. Read the market, then shape one rule only your constraints allow.',
  what:`A discipline for shaping a game idea from market observation rather than from a premise you find cool, and without relying on surveys. You choose a market you already watch, read how its players behave in reviews, forums, streams and patch-note reactions, find the want they leave over or work around, and ask why no shipped game serves it. Only then do you write the promise and the single rule that keeps it. The output is a concept with a want attached, a structural reason incumbents cannot copy it, and four observation tests that can kill it cheaply before anything is built.`,
  why:[`Most game ideas die of indifference, not of bad execution. A concept with a named want has a market before it has a build.`,`A survey cannot see a market at scale, and a small survey only measures politeness. What players write, replay, mod and complain about is evidence you can gather alone.`,`Uniqueness is not being first. It is a mechanism that conflicts with the constraints that keep the incumbents where they are.`,`Constraints and observed complaints produce distinctive ideas. Blue-sky brainstorming produces the genre average, and AI brainstorming produces it faster.`],
  think:{ q:[`Which market do I already watch, and where do I read it (reviews, forums, streamer chats, patch notes, achievement data)?`,`What do players praise? That is what the incumbents protect. What do they leave over, and what do they work around?`,`Is the gap an exit reason, an unmet want, a tolerated cost, or only my own taste?`,`Why is the gap still open? What do the incumbents' business model, scope or design assumptions forbid?`,`What single rule keeps the promise, and would an incumbent have to break something to copy it?`,`What can my team build well in the time we have? What does that rule out, and what does it make possible that a bigger team would never try?`],
    trade:[`Deep observation is slow and sharp. Brainstorming is fast and generic.`,`A wedge that conflicts with an incumbent’s constraints is defensible and narrow. A feature everyone can copy is broad and worthless.`],
    traps:[`Surveying instead of observing. You cannot interview a market, and a small sample tells you nothing about demand.`,`Treating a tolerated cost as a gap. Players accept some costs as the price of the genre, and fixing those wins no one.`,`Mistaking your own taste for a want. The audience decides that, not you.`,`A “differentiator” that is a theme, an art style or more content.`,`A mechanism an incumbent could ship in a patch without breaking what works for them.`,`Asking AI for ideas before the market is read. It will return the genre average with confidence.`],
    good:[`You can quote the complaint in the players' own words and name where you saw it.`,`You can name the structural reason the incumbent cannot follow.`,`One rule carries the whole promise, and players of the incumbents describe it back to you unprompted.`],
    bad:[`The pitch starts with a genre and a setting and never names a want.`,`The differentiator is “like X but with Y” where Y is a theme or more content.`,`Nobody outside the team can say why someone would leave what they play for it.`] },
  how:[`Choose the market you already watch and the three to five shipped games you will observe, not admire.`,`Read what players do and say. Quote the praise and the complaints, and note where each came from.`,`Find the workaround. Mods, spreadsheets, house rules and third-party tools are the strongest evidence of an unserved want, because players paid with effort.`,`Classify the gap. An exit reason or an unmet want is worth a game. A tolerated cost or your taste is not.`,`Ask why the gap is still open. Name the structural reason an incumbent has not closed it.`,`Write the one-line promise in the player words, then the single rule that keeps it.`,`Check the moat. If an incumbent could copy the rule without breaking what works for them, it is a feature, not a wedge.`,`Test with observation, not surveys: the workaround audit, comment mining on streams, a one-mechanism greybox, and the store-page side by side. Then go to the Core Experience Canvas.`],
  ai:{ yes:[`Mine reviews and forums for complaints and workarounds, clustered by underlying want.`,`Argue as each incumbent why they would not ship your mechanism, and what they would have to give up.`,`Steelman the market: the strongest reasons a fan would ignore the promise and never hear about it.`,`Propose five mechanically distinct rules that keep the promise inside your constraints, smallest first.`],
       no:[`Choose the market and the player. That is the founding commitment of the project.`,`Judge whether the want is real. Only observation and a greybox show that.`,`Generate ideas before the market is read.`] },
  prompts:[{l:'Complaint and workaround mining',p:`Here are review excerpts, forum posts and changelog reactions for [GAMES] written by players like this: [PLAYER SKETCH]. Cluster the complaints and the praise by underlying want. For each cluster give the want in the players' own words, how often it appears, and whether players work around it with mods, spreadsheets, house rules or third-party tools. Do not propose game ideas.`},
    {l:'Structural moat',p:`My mechanism is: [MECHANISM]. The incumbents are [GAMES] with these business models and design assumptions: [DESCRIBE]. Argue, as each incumbent, why you would not ship this mechanism and what you would have to give up to do it. Then name the single move that would neutralise it.`},
    {l:'Five rules for the promise',p:`Promise: [PROMISE]. Constraints: [TEAM, TIME, PLATFORM, SKILLS]. Propose 5 mechanically distinct rules that keep the promise, smallest first. For each: the rule in one sentence, the decision it creates every minute, the emotion intended, the incumbent it threatens, and the likely failure mode. Do not recommend one.`}],
  verify:[`Can every claim about the gap point to something a player wrote or did, or is it inference?`,`Is the differentiator a rule, or is it theme, art or content?`,`Would an incumbent have to break something to copy the mechanism?`],
  test:[`Workaround audit: how many distinct tools or habits already do the thing? No workarounds means the want is weak.`,`Comment mining: watch three sessions of the incumbents and timestamp every unprompted complaint that matches the gap. Frequency is the evidence.`,`One-mechanism greybox: do players of the incumbent describe the promised verb without a prompt and ask to continue?`],
  rel:[['who-is-the-player','The market you observe is made of specific players.'],['learning-from-success','After the gap is named, cross-reference it against games that already won the audience.'],['audience-and-positioning','The differentiator you find here becomes the positioning sentence.'],['feature-vs-experience','Borrowed patterns must be re-derived on the ladder.'],['prototyping','The one-mechanism greybox is the first prototype.'],['scope-control','Constraints chosen up front are scope control done early.']] });
TECH('finding-an-idea',[
  {n:'Market observation', how:`Read reviews, forums, streamer chats, patch-note reactions and achievement data for the recurring praise and complaints, in the players' own words.`, fit:`Finding a want that already exists and is measurable.`, cost:`Slow, and easy to drown in noise. Needs a specific question to filter.`, alt:`Start from one vivid complaint you can quote and a place you saw it.`},
  {n:'Workaround audit', how:`Search the community for mods, spreadsheets, house rules and third-party tools that already do the missing thing.`, fit:`Testing whether a want is strong, before you build anything.`, cost:`Absence of workarounds is evidence against you, and it is easy to explain away.`, alt:`Look for repeated manual workarounds in guides and clips.`},
  {n:'Gap classification', how:`Sort complaints into exit reason, unmet want, tolerated cost and taste. Only the first two are worth a game.`, fit:`Deciding what to build and what to refuse.`, cost:`Honest reading, and it kills ideas you like.`, alt:`Build only against exit reasons and unmet wants.`},
  {n:'Moat test', how:`Ask whether an incumbent could copy your rule without breaking what works for them.`, fit:`Separating a wedge from a feature.`, cost:`Most ideas fail it.`, alt:`Reshape the mechanism until it conflicts with their constraints.`},
  {n:'Observation tests', how:`Workaround audit, comment mining on streams, a one-mechanism greybox, and the store-page side by side.`, fit:`Evidence about desire without a survey.`, cost:`Humility to kill the idea on what you see.`, alt:`Run the greybox first, since it is the cheapest real signal.`}
]);
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
    map:`Godot @export_range is Unity’s [Range] attribute, and --headless --script is -batchmode -executeMethod.` },
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
INTERVIEW('finding-an-idea',{
  junior:[
    { q:`Where do your game ideas come from?`,
      a:`From a market you already watch and from what its players write, replay, mod and complain about. Name where you read it: reviews, forums, streamer chats, patch-note reactions. Quote one complaint you can point to rather than describing a premise you find cool.`,
      follow:`Show me the complaint in the players' own words and tell me where you saw it.`,
      red:`Describes a brainstorm, or a setting they think would be cool, with no player attached.` },
    { q:`Why is a survey a poor way to find a game idea?`,
      a:`A small survey measures politeness, and a large one is not available to you. What players do is evidence you can gather alone: the mods they install, the spreadsheets they keep, the house rules they invent, the things they quit over. Behaviour beats stated preference.`,
      follow:`What would you observe instead, this week, on your own?`,
      red:`Proposes running a bigger survey with better questions.` },
    { q:`What counts as a gap worth building a game on?`,
      a:`An exit reason or an unmet want. Not a tolerated cost, which players accept as the price of the genre, and not your own taste. The test is whether players leave over it or work around it, not whether it annoys you.`,
      follow:`Name a tolerated cost in a genre you know well.`,
      red:`Calls a theme, an art style or “more content” the gap.` }
  ],
  mid:[
    { q:`You found a gap. Why is it still open?`,
      a:`Name the structural reason: a business model the mechanism breaks, a scope the incumbent cannot afford, a design assumption their whole game rests on. If no such reason exists, they can ship your idea in a patch and you have a feature, not a wedge.`,
      follow:`What single move would neutralise your wedge, and how long would it take them?`,
      red:`Assumes the incumbents simply have not thought of it.` },
    { q:`How do workarounds inform design?`,
      a:`A mod, a spreadsheet, a house rule or a third-party tool is a want the player paid for with effort. Count the distinct ones and how many people use them. No workarounds at all is a signal that the want is weak, however loudly it is complained about.`,
      follow:`What if the workaround is good enough that nobody needs a new game?`,
      red:`Treats one popular mod as proof of a commercial market and skips every further test.` },
    { q:`Kill your own idea cheaply. What do you run?`,
      a:`A workaround audit, comment mining across three streamed sessions with timestamps on every unprompted complaint, a one-mechanism greybox, and a store page placed next to the incumbents'. Each with a threshold written down before you look at the result.`,
      follow:`What result would have made you stop, and did you honour it?`,
      red:`Proposes building a vertical slice to find out whether the idea is any good.` }
  ],
  senior:[
    { q:`Pitch me a concept in a form I can falsify.`,
      a:`The want in player words with its source. The single rule that keeps the promise. The structural reason the incumbents cannot copy it. The observation tests and their kill criteria. Finally the constraints that make this team the one to build it, because a wedge you cannot execute is someone else’s idea.`,
      follow:`Which part of that is weakest, and what would you do about it first?`,
      red:`Pitches a genre, a setting and a feature list, with no want and no test.` },
    { q:`How do you use AI here without ending up with the genre average?`,
      a:`Use it to mine and cluster complaints, to argue as each incumbent about why they would not ship your mechanism, and to steelman the market against you. Never ask it for ideas before the market is read. The choice of market and player stays human because it is the founding commitment.`,
      follow:`What did a model get wrong for you last time, and how did you catch it?`,
      red:`Asks for ten game ideas in a genre and picks the one that sounds best.` }
  ] });
