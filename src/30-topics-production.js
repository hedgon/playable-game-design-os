/* =====================================================================
   PRODUCTION
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'production', lens:'design', t:'Production', short:'Prototype, playtest, iterate, scope, risk, polish', color:'var(--d-production)',
    sum:`How the work actually gets made: prototype the riskiest assumption first, playtest as the truth machine, iterate on evidence, control scope, and polish last. Production discipline is what turns design intent into a shipped experience.`,
    links:[['ai','AI collapses implementation cost. Production has to redirect the saved time into testing and judgment.'],['core','The core loop prototype is the first production milestone that matters.'],['product','Scope follows validated value. Product constraints define the box.'],['content','Content pipelines are where scope explodes when the system is not validated.']] });

T('prototyping',{ d:'production', t:'Prototyping: the cheapest possible test', tag:'A prototype answers one question. If it answers none, it is a demo.',
  what:`A deliberately incomplete build made to test one hypothesis: paper, grey boxes, spreadsheets, a single mechanic in a blank room. The value of a prototype is the question it answers and the speed at which it answers it. Fidelity is a cost, not a virtue.`,
  why:[`The riskiest assumptions are cheapest to test before anything is built on them.`,`Most design ideas are wrong in a way that only playing reveals. Prototypes find out early.`,`AI makes prototypes nearly free, which means the limiting factor is how well you frame the question.`],
  think:{ q:[`What is the one question this prototype answers? What result would kill the idea?`,`What is the least I can build to get that answer? Paper? A spreadsheet? Ten minutes of grey boxes?`,`Who needs to play it: me, the team, or target players?`,`What will I measure, and what would a positive result look like?`],
    trade:[`Low fidelity is fast and can hide problems that only appear with feel.`,`Higher fidelity finds feel problems and invites premature attachment.`],
    traps:[`Prototypes that grow into the game.`,`Prototyping the safe parts because they are easy.`,`Testing a prototype only with the team.`,`No kill criterion, so every result is "promising".`],
    good:[`Prototypes are thrown away. Findings are kept.`,`Each prototype has a written hypothesis and result.`],
    bad:[`The prototype has a save system.`] },
  how:[`Write the hypothesis and the kill criterion before building anything.`,`Choose the cheapest medium that can answer the question.`,`Build in a day or less if possible. Use AI aggressively for the build.`,`Test with the right players. Record the result and the decision.`,`Throw it away, or explicitly promote it with a new plan.`],
  ai:{ yes:[`Build prototypes fast, with exposed tuning and logging.`,`Propose the cheapest medium for a given question.`,`Generate variants of a prototype to compare.`,`Write the analysis script for the logs.`],
       no:[`Decide the prototype "works". Players decide.`,`Add polish or scope to the prototype unasked.`] },
  prompts:[{l:'Prototype spec',p:`Hypothesis: we believe [PLAYER] will [BEHAVIOR] because [REASON]. We will know it is working when [SIGNAL], and we will kill the idea if [KILL CRITERION]. Propose the cheapest prototype that tests this (paper, spreadsheet, or minimal build), the tuning values to expose, the events to log, and a 15-minute test protocol for [N] players. Then build it in [ENGINE/HTML] with no menus, no art beyond shapes, and a log export.`}],
  verify:[`Does the prototype isolate the hypothesis, or bundle features?`,`Did it add anything not needed to answer the question?`],
  test:[`Run the protocol. Did the signal appear? Did the kill criterion trigger?`,`Did players do anything unexpected? Record it.`,`Decide: keep, change, simplify, kill. Write it down.`],
  rel:[['hypothesis-driven-design','The hypothesis is the prototype spec.'],['core-loop','The loop is the first prototype.'],['playtesting','Prototypes exist to be tested.'],['ai-for-implementation','AI builds prototypes.'],['scope-control','Prototypes are how scope earns its place.']] });
TECH('prototyping',[
  {n:'Grey-box prototyping', how:`Build the interaction with placeholder art to test the mechanic before investment.`, fit:`Testing whether the core loop is fun.`, cost:`Discipline to resist polishing. Prototypes are disposable.`, alt:`Throw it away or explicitly promote with a refactor plan.`},
  {n:'Paper and physical prototypes', how:`Model the rules on paper or with tokens to test decisions in hours.`, fit:`Economies, card and board-like systems, turn structure.`, cost:`Does not test real-time feel or execution.`, alt:`Paper for decisions. Digital for feel.`},
  {n:'Instrumented prototypes', how:`Expose tuning values and log every event so the prototype answers a question with data.`, fit:`Any prototype meant to test a hypothesis.`, cost:`Extra build time. Log without a question is noise.`, alt:`Define the hypothesis and the signal before building (see Hypothesis-driven design).`}
]);
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
INTERVIEW('prototyping',{
  junior:[
    { q:`What is the difference between a prototype and a demo?`,
      a:`A prototype answers one question and is measured by how fast it answers it. A demo shows something off and is measured by how good it looks. Fidelity is a cost in a prototype, not a virtue. Say what the question was on something you built, and say whether you threw the build away afterwards.`,
      follow:`What was the last prototype you built, and what question did it answer?`,
      red:`Calls any early build a prototype, or describes a playable slice with menus and a save system.` },
    { q:`You are asked to prototype a grappling hook in two days. What do you build and what do you leave out?`,
      a:`Decide the question first: is it the traversal feel, the puzzle design space, or the combat interaction. Build one character, one grey room with anchor points, and the hook. Leave out enemies, art, menus, saves and progression. Expose the tuning values you will want to change mid-test. Log attempts and failures.`,
      follow:`What if the feel only reads once there is a camera pass and a sound on the hit?`,
      red:`Starts by building a level and a character controller "properly" so it can be reused.` },
    { q:`What is a kill criterion, and where does it come from?`,
      a:`It is the result, written before the test, that makes you stop. It comes from the hypothesis: if you predicted players would voluntarily repeat the action, the kill criterion is a rate of voluntary repetition you would accept as a no. Without one, every result reads as promising and the prototype never ends.`,
      follow:`Have you ever hit a kill criterion and honoured it? What happened next?`,
      red:`Says the team would know if it was not fun, or sets a criterion so weak nothing could fail it.` }
  ],
  mid:[
    { q:`How do you choose the medium: paper, spreadsheet, or engine?`,
      a:`Match the medium to the question. Rules, turn order and information asymmetry go on paper. Economy, drop rates and long-run balance go in a spreadsheet or a simulation. Feel, timing and readability need the engine because nothing else reproduces latency and input. Pick the cheapest medium that can produce the signal you named.`,
      follow:`Give me a question you would refuse to answer on paper, and say why.`,
      red:`Always opens the engine, or has never tested a system outside one.` },
    { q:`The prototype worked and a producer wants the code shipped. What do you say?`,
      a:`Separate the finding from the artifact. The finding is kept, the code usually is not, because prototype code embeds decisions nobody made and lacks everything the real build needs. Offer the honest path: either promote it explicitly with a rewrite plan and a budget, or rebuild the validated behaviour properly. Name what the prototype omitted.`,
      follow:`When would you promote prototype code instead of rebuilding it?`,
      red:`Agrees immediately, or refuses on principle without offering a plan or a cost.` },
    { q:`How do you instrument a prototype so the test yields evidence and not opinions?`,
      a:`Log the inputs, every decision point with the option chosen, every failure with its cause, and session bounds with timestamps. Expose the two or three tuning values you expect to argue about as live sliders. Export to something you can read in a spreadsheet the same evening. Then write the analysis before the session so you are not improvising.`,
      follow:`What do you do when the log says one thing and the room felt like another?`,
      red:`Plans to rely on what testers say afterwards, or adds logging after the first session.` }
  ],
  senior:[
    { q:`Your team built six prototypes last month and made no decisions. What is wrong?`,
      a:`Prototyping has become production. Check whether each build had a written question and a kill criterion, whether the right players touched it, and whether anyone recorded a result. Usually the hypotheses are missing, so nothing can be falsified. Fix the front of the process, not the throughput.`,
      follow:`How would you make the next prototype produce a decision rather than another build?`,
      red:`Proposes prototyping faster, or blames the team for not being decisive.` },
    { q:`When an assistant can produce a playable build in an hour, what changes about prototyping?`,
      a:`Build cost stops being the limit and framing becomes the limit. The discipline shifts to writing sharper questions, running more tests with real players, and defending the not-list, because cheap builds make it easy to accumulate unvalidated systems. Keep the kill criterion and the throw-away rule, and raise the playtest cadence to match the build cadence.`,
      follow:`What stops a team from simply generating ten prototypes and keeping the one that feels best in the room?`,
      red:`Treats speed as the win, or proposes a review meeting where the team picks a favourite without players.` }
  ] });

T('hypothesis-driven-design',{ d:'production', t:'Hypothesis-driven design', tag:'We believe [player] will [behavior] because [reason]. We will know when [signal]. Write it before you build.',
  what:`Expressing every significant design decision as a testable claim about player behavior, with an observable signal and a kill criterion, before building. The template comes from Lean Startup and Lean UX. Its game analogue is Valve's practice (Mike Ambinder) of treating designs as hypotheses and playtests as experiments. The workflow is hypothesis, prototype, test, evidence, decision, versus idea, big build, polish, hope.`,
  why:[`Writing the hypothesis first prevents rationalizing the result afterwards.`,`It forces the question "what would I observe?" which converts taste into something testable without removing taste from the decision.`,`It makes AI useful: a hypothesis is a precise brief for a prototype, a test protocol and an analysis.`],
  think:{ q:[`Who exactly will do what, and why do I think so?`,`What would I see a player do if this is true? If it is false?`,`What is the smallest experiment that distinguishes true from false?`,`What result would make me stop? If none, I am not testing. I am hoping.`],
    trade:[`Rigor slows the first iteration and speeds every one after.`,`Observable signals favor measurable behavior over subtle feeling. Guard against ignoring what you cannot count.`],
    traps:[`Hypotheses about the game ("combat will be deep") instead of the player ("players will switch weapons by enemy type").`,`Signals that cannot be observed in a playtest.`,`Treating a confirmed hypothesis as proof rather than as evidence.`],
    good:[`Every prototype has a one-line hypothesis and a recorded result.`,`Design debates end with "let us test it" and a protocol.`],
    bad:[`Post-test discussions are about whether people "liked it".`] },
  how:[`Use the Playtest Hypothesis Builder: player, behavior, reason, signal, kill criterion.`,`Design the smallest prototype that could show the signal.`,`Run the test. Record what happened versus what was predicted.`,`Decide: keep, change, simplify, kill. Write the next hypothesis.`],
  ai:{ yes:[`Turn a vague idea into several testable hypotheses with signals.`,`Design test protocols and analysis for a hypothesis.`,`Challenge a hypothesis: what else would explain the predicted signal?`],
       no:[`Decide which hypothesis matters most. Prioritization is judgment.`,`Declare a hypothesis confirmed from reasoning alone.`] },
  prompts:[{l:'Hypothesis sharpening',p:`Here is a design idea: [IDEA]. Rewrite it as 3 distinct hypotheses in the form "We believe [PLAYER] will [BEHAVIOR] because [REASON]. We will know when [OBSERVABLE SIGNAL]." For each, state a kill criterion, the cheapest experiment, and an alternative explanation that would produce the same signal even if the hypothesis were false. Rank by how much the game depends on the hypothesis being true.`}],
  verify:[`Are the behaviors observable in a 15-minute session, or abstractions?`,`Did it provide alternative explanations, or assume the signal proves the claim?`],
  test:[`Did the predicted behavior occur? At what rate?`,`Did anything else explain it?`,`Would you have made the same decision without the hypothesis? If yes, it was too safe.`],
  rel:[['prototyping','The hypothesis specifies the prototype.'],['playtesting','The test is where evidence comes from.'],['iteration-and-evidence','Evidence feeds the decision.'],['ai-loop','Hypothesize is step 2 of the master loop.']] });
TECH('hypothesis-driven-design',[
  {n:'Hypothesis statement', how:`We believe [player] will [behavior] because [reason]. We will know when [signal]. We will kill it if [criterion].`, fit:`Turning a decision into a testable claim.`, cost:`Weak hypotheses produce untestable tests.`, alt:`Use the Hypothesis Builder tool.`},
  {n:'Kill criterion', how:`Write the result that ends the idea before you build. Without it you are hoping.`, fit:`Preventing sunk-cost attachment.`, cost:`Emotionally hard. Needs an agreed decision owner.`, alt:`Agree the criterion while calm.`},
  {n:'Smallest test', how:`Find the cheapest experiment (paper, spreadsheet, grey box) that distinguishes the hypothesis from alternatives.`, fit:`Fast learning at low cost.`, cost:`Can test the wrong thing if the hypothesis is broad.`, alt:`Name the alternative explanations to rule out.`}
]);
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
INTERVIEW('hypothesis-driven-design',{
  junior:[
    { q:`Write a design hypothesis out loud for a feature you have worked on.`,
      a:`Use the form: we believe this player will do this behaviour because of this reason, and we will know when we see this signal. Make the subject the player, not the game. Add the kill criterion. Then say how you would observe the signal in a fifteen minute session without asking the player anything.`,
      follow:`Now give me the alternative explanation that would produce the same signal even if you were wrong.`,
      red:`States a claim about the game ("combat will feel deep") instead of a claim about player behaviour.` },
    { q:`What makes a signal observable?`,
      a:`You can see it happen in a session, count it, and it does not require the player to report a feeling. Weapon switches per fight, retries before quitting, time before the first voluntary detour. Feelings are real but they are not signals, so you pair them with behaviour rather than substituting one for the other.`,
      follow:`What would you do about a design goal whose only honest signal takes ten hours to appear?`,
      red:`Offers "players enjoy it" or "engagement" as the signal.` },
    { q:`Why write the hypothesis before building rather than after?`,
      a:`Written afterwards, the hypothesis becomes a description of whatever happened. Written before, it can be wrong, which is the only way a test has value. It also forces the question of what you would observe, which usually exposes that the idea is not yet specific enough to build.`,
      follow:`What do you do when a test produces a surprising result you did not predict at all?`,
      red:`Says it is the same either way, or treats the hypothesis as paperwork for the producer.` }
  ],
  mid:[
    { q:`A hypothesis was confirmed. What have you actually learned?`,
      a:`That the predicted behaviour occurred at some rate under these conditions with these players. Not that the design is right. Check the rate, check whether an alternative explanation fits, check whether the players matched the model. Confirmation is evidence that raises confidence, and the next decision should still name what would overturn it.`,
      follow:`What confirmation rate would have made you act differently?`,
      red:`Treats one confirmed hypothesis as proof and moves straight to scaling the feature.` },
    { q:`How do you handle a decision you cannot express as a hypothesis, such as art direction?`,
      a:`Do not force it. Some decisions are authorship and are owned by a person with taste and a pillar to defend. What you can test is the consequence: readability, whether players identify the enemy type, whether the tone matches the promise. Test the consequence, keep the authorship.`,
      follow:`Where is the line between authorship and something you should have tested?`,
      red:`Insists everything must be a hypothesis, or uses "it is art" to avoid any evidence at all.` },
    { q:`Tell me about a hypothesis you got wrong.`,
      a:`Name the claim, the signal you expected, what players actually did, and what you changed. The valuable half is the second-order lesson: what in your player model was wrong. If you cannot name that, the test only cost you time.`,
      follow:`What did that teach you about the player model, not just the feature?`,
      red:`Cannot produce one, or reframes it so the hypothesis was secretly right.` }
  ],
  senior:[
    { q:`How do you install this discipline in a team that designs by opinion?`,
      a:`Do not introduce a template. Introduce it on one contested decision where the argument is stuck, run the cheapest test, and let the evidence end the argument in public. Then make the hypothesis a required field on the prototype brief. Keep it one line. Ceremony kills adoption faster than scepticism does.`,
      follow:`What do you do when the evidence contradicts the person who outranks you?`,
      red:`Mandates a process document, or describes convincing people by argument rather than by a test.` },
    { q:`When is this overhead not worth it?`,
      a:`When the decision is cheap and reversible, when the cost of testing exceeds the cost of building and looking, and when the team has no access to the right players so the test would produce noise. Say it plainly: small, reversible, low-risk work does not need a protocol. Reserve the rigour for decisions the rest of the game will be built on.`,
      follow:`How do you tell a reversible decision from one that quietly is not?`,
      red:`Says it is always worth it, which usually means it has never actually been run.` }
  ] });

T('playtesting',{ d:'production', t:'Playtesting: the truth machine', tag:'What players say is useful. What players do is evidence. Neither means anything without context.',
  what:`Observing real players play, to learn what the game actually does rather than what it was meant to do. Methods: silent observation, think-aloud, task-based usability tests, interviews, surveys, telemetry, replay analysis. The designer's job during a test is to watch, not to defend or explain.`,
  why:[`The designer cannot see their own game. They know too much. Only new eyes reveal what is taught, what is legible and what is fun.`,`Behavior beats opinion: players say what they think you want, or what they think they felt, and both are unreliable. Behavior is what happened.`,`Cadence matters. A game tested weekly is a different game from one tested at milestones.`],
  think:{ q:[`What question does this test answer? What will I watch for?`,`Who is playing: target players, or whoever was available?`,`Where do players hesitate, repeat, drift, quit, experiment, talk?`,`Am I explaining? Stop.`,`What did they do that I did not expect? That is the most valuable finding.`],
    trade:[`Silent observation yields clean behavior and little insight into intent. Think-aloud yields intent and distorts behavior.`,`Telemetry scales and loses context. Observation has context and does not scale.`],
    traps:[`Explaining or helping during the test.`,`Asking "was it fun?" (always yes) instead of watching what they did.`,`Testing with the team or friends.`,`Reading one tester's opinion as a pattern.`,`Changing five things after one test.`],
    good:[`Tests are weekly, with a written question and a written result.`,`Findings surprise the team regularly.`],
    bad:[`Tests are demos. The designer talks more than the player.`] },
  how:[`Write the question and the hypothesis. Recruit players who match the model.`,`Silent observation first: no help, no explanation, take timestamped notes on hesitation, repetition, drift, experimentation, quits.`,`Then tasks if you need usability data. Then interview: open questions first ("walk me through what you did"), leading questions never.`,`Log behavior: choices, times, deaths, retries.`,`Synthesize: cluster observations, separate behavior from opinion, note surprises. Decide one or two changes. Test again.`],
  ai:{ yes:[`Draft observation protocols and interview guides.`,`Transcribe and code recordings and notes into behavior categories.`,`Cluster findings across testers and surface patterns and outliers.`,`Analyze telemetry and correlate with observed events.`],
       no:[`Interpret what a behavior means for the design without you. It lacks the context.`,`Decide what to change. That is the design decision.`,`Replace players. AI has never played your game as a human would.`] },
  prompts:[{l:'Observation protocol',p:`We are testing the hypothesis "[HYPOTHESIS]" with [N] players matching [PLAYER MODEL] for [MINUTES]. Design a silent observation protocol: what to log with timestamps (hesitations, repeats, drift, experiments, quits, speech), a task list if needed, and an interview guide of open, non-leading questions ordered from behavior to opinion. Include a coding scheme for the notes and a template for the results summary that separates behavior from self-report.`},
    {l:'Playtest synthesis',p:`Here are observer notes and interview transcripts from [N] playtests: [DATA]. Code every observation as behavior or self-report. Cluster behaviors by pattern and report frequency per cluster. Separate patterns (2 or more testers) from outliers, and list outliers separately with why they might matter. Identify contradictions between what players did and what they said. State what the evidence supports about the hypothesis "[HYPOTHESIS]" and what it does not. Do not recommend design changes.`}],
  verify:[`Did it treat one tester's statement as a finding?`,`Did it merge behavior and opinion?`,`Did it recommend changes when asked only to synthesize?`],
  test:[`This topic is the test. Questions to answer in every session: Do players understand the goal without explanation? Do they notice the meaningful choice? Do they make different choices? Do they understand why they succeeded or failed? Do they voluntarily repeat? Do they experiment? Do they develop strategies? Do they create their own goals? Where do they get bored, confused, or lose agency?`],
  rel:[['hypothesis-driven-design','Tests need a hypothesis.'],['iteration-and-evidence','Tests produce the evidence that drives iteration.'],['who-is-the-player','Recruiting is where the player model meets reality.'],['ai-for-playtest-analysis','AI helps analyze. Humans interpret.'],['playtest-view','The Playtest view has the question bank and hypothesis builder.']] });
TECH('playtesting',[
  {n:'Silent observation', how:`Watch without explaining. Log hesitation, repetition, drift, experimentation and quits with timestamps.`, fit:`Learning what players do, not what they say.`, cost:`Feels passive. Needs a coding scheme to be useful.`, alt:`Pair with a short behavior-first interview.`},
  {n:'A/B and one-variable tests', how:`Change one important variable between builds and compare player behavior.`, fit:`Deciding between two designs on evidence.`, cost:`Requires enough players and controlled conditions. Small samples mislead.`, alt:`Within-subject ordering with a deterministic counter.`},
  {n:'Telemetry and replay analysis', how:`Instrument choices, retries and session ends at scale. Review replays for strategies.`, fit:`Confirming patterns beyond the playtest room.`, cost:`Shows what, not why. Privacy and pipeline cost.`, alt:`Telemetry proposes, observation explains.`}
]);
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
INTERVIEW('playtesting',{
  junior:[
    { q:`It is the first external test of your feature. What are you doing during the session?`,
      a:`Watching and writing, not talking. Timestamped notes on hesitation, repetition, drift, experimentation and quits. No explaining, no helping, no defending. Afterwards, open questions first: walk me through what you did. Leading questions never. The single most valuable note is the thing you did not expect.`,
      follow:`A tester is stuck and visibly frustrated. When, if ever, do you intervene?`,
      red:`Describes sitting next to the player explaining the controls, or running the session as a demo.` },
    { q:`A tester asks how to do something. What do you do?`,
      a:`Say something neutral like "do whatever you would do at home" and write down where they asked. The question is the finding. Intervene only to end real distress or to unblock a crash that would waste the rest of the session, and record that you intervened.`,
      follow:`They are stuck for eight minutes and the session is fifteen. Now what?`,
      red:`Answers the question helpfully and does not record that the question was asked.` },
    { q:`What do you write down while watching?`,
      a:`Behaviour with timestamps: where they paused, what they repeated, what they tried that you did not design for, where they looked away, when they died and whether they understood why. Keep behaviour separate from anything they said. Mark surprises so they survive into the synthesis.`,
      follow:`How do you turn six pages of notes into a decision?`,
      red:`Writes impressions such as "seemed to enjoy it" with no behaviour attached.` }
  ],
  mid:[
    { q:`What players say and what players do disagree. How do you handle it?`,
      a:`Believe the behaviour and use the words to generate hypotheses about why. Players report what they think you want, or reconstruct a feeling afterwards. Both are unreliable as evidence and useful as leads. Record both channels separately so you can see the contradiction rather than averaging it away.`,
      follow:`Give me a case where the self-report was the more useful of the two.`,
      red:`Acts on the quote because it was articulate, or discards everything testers say as worthless.` },
    { q:`How many testers before you call something a pattern?`,
      a:`Two is a hint, three or more of a matched group is a pattern worth acting on, and one is an outlier you record rather than fix. Sample size matters less than whether the testers match the player model, so say who they were. Usability problems surface fast. Balance and long-run motivation do not.`,
      follow:`What kind of finding would you act on after a single tester?`,
      red:`Gives a number with no reference to who the testers were, or changes the design on one loud opinion.` },
    { q:`How do you recruit, and what goes wrong when you test with the team?`,
      a:`Recruit against the player model: genre literacy, platform, prior exposure to your build. The team knows the controls, knows the intent, and forgives friction, so they cannot see onboarding or readability failures. Friends supply encouragement. Keep both for smoke tests and neither for evidence.`,
      follow:`You have no budget and no recruiting channel. What do you actually do this week?`,
      red:`Says the team plays it every day so external testing is a formality.` }
  ],
  senior:[
    { q:`Design the playtest cadence for a twelve month project.`,
      a:`Weekly internal on the current build to keep it playable, fortnightly external on a written question during pre-production, and full sessions at each milestone with fresh players who have never seen it. Tie the cadence to decisions: a test exists to unblock something. Protect the build health that makes the cadence possible.`,
      follow:`Which of those would you drop first when the schedule compresses, and what do you lose?`,
      red:`Schedules testing only at milestones, or proposes a cadence with no question attached to any session.` },
    { q:`Six testers gave six different complaints. How do you decide what to change?`,
      a:`Separate behaviour from opinion and re-read for what they all did rather than what they all said. Cluster by the moment in the session rather than by the words. Six different complaints about one moment is one problem. Then pick the change with the best chance of moving the signal you were testing, and leave the rest in the log.`,
      follow:`How do you tell the team you are not acting on their favourite piece of feedback?`,
      red:`Builds a fix list of all six, or picks the complaint that matches what they already wanted to change.` }
  ] });

T('iteration-and-evidence',{ d:'production', t:'Iteration on evidence', tag:'Change one important thing, test again. Iteration without evidence is wandering.',
  what:`The cycle of prototype, test, evidence, decision, repeated. The discipline is to change the fewest variables that could move the signal, so that the next test can attribute the result. Evidence includes behavior logs, observations, and telemetry, interpreted with context by humans.`,
  why:[`Iteration is how games get good. Nobody designs a great loop on paper.`,`Changing many things at once makes results unattributable. You learn nothing even when it improves.`,`AI makes iterations cheap, which is only useful if each iteration is informed by evidence. Fast wandering is still wandering.`],
  think:{ q:[`What did the last test show? What is the one change most likely to move the signal?`,`If the change helps, will I know why?`,`How many iterations without player contact have I done? More than two is a warning.`,`Am I iterating toward the core experience, or toward whatever the last tester said?`],
    trade:[`One change per iteration is slow and attributable. Many changes are fast and blind.`,`Reacting to every test overfits to individuals. Ignoring tests wastes them.`],
    traps:[`Iterating on opinion instead of behavior.`,`Endless iteration with AI without a playtest in between.`,`Losing the thread: no record of what was tried and what happened.`],
    good:[`A log of hypotheses, changes and results exists and is read.`,`Each iteration has a reason traceable to evidence.`],
    bad:[`The team cannot say why the current version is the way it is.`] },
  how:[`Keep an iteration log: hypothesis, change, test, result, decision.`,`After each test, choose one or two changes with the best expected effect on the signal.`,`Do not iterate more than twice without player contact.`,`Every few cycles, step back: are the changes converging on the core experience?`],
  ai:{ yes:[`Maintain and summarize the iteration log.`,`Propose the change most likely to move the signal, with reasoning.`,`Detect when iterations are wandering (no convergence, contradictory changes).`,`Implement the change fast.`],
       no:[`Choose the change. That is a judgment about what matters.`,`Substitute its own evaluation for a playtest.`] },
  prompts:[{l:'Next iteration',p:`Here is our iteration log so far: [LOG] and the latest playtest evidence: [EVIDENCE]. Which single change is most likely to move the signal "[SIGNAL]", and why? List 3 candidates with expected effect, risk of side effects on [OTHER SIGNALS], and implementation cost. Point out if the log shows we are oscillating or reacting to individual testers rather than patterns.`}],
  verify:[`Did it pick based on evidence in the log, or on general design lore?`,`Did it flag overfitting to one tester?`],
  test:[`Did the signal move after the change? Can you attribute it?`,`Are you converging: fewer, smaller changes over time?`],
  rel:[['hypothesis-driven-design','Each iteration starts with a hypothesis.'],['playtesting','Evidence comes from tests.'],['ai-loop','Iteration is the outer loop of the master workflow.'],['ai-failure-modes','Endless iteration without evidence is a named failure.']] });
TECH('iteration-and-evidence',[
  {n:'One-variable iteration', how:`Change one important variable between tests so the result is interpretable.`, fit:`Learning what actually caused a change.`, cost:`Slow when many things need fixing.`, alt:`Batch independent changes as separate tests.`},
  {n:'Decision log', how:`Record what was decided, the evidence, the expected effect and the date to review.`, fit:`Avoiding re-litigating and forgetting why choices were made.`, cost:`Discipline to maintain.`, alt:`Keep it short and tied to iterations.`},
  {n:'Build vs measurement', how:`Ensure player evidence sits between exploration and commitment.`, fit:`Avoiding shipping on hope.`, cost:`Slows commitment. Some stakeholders resist.`, alt:`Gate scope on validated value.`}
]);
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
INTERVIEW('iteration-and-evidence',{
  junior:[
    { q:`What is the difference between iterating on evidence and iterating on opinion?`,
      a:`Evidence-driven iteration starts from something a player did, changes the fewest variables that could move that behaviour, and tests again. Opinion-driven iteration starts from the last thing someone said in a meeting. The second can still improve the game, but you cannot attribute the improvement, so you cannot repeat it.`,
      follow:`What is the smallest record that makes an iteration attributable later?`,
      red:`Treats any change followed by a test as evidence-driven.` },
    { q:`Why change one important thing at a time?`,
      a:`So the next result can be attributed. Change five things and an improvement teaches you nothing, because you do not know which one to keep or to push further. One change per cycle is slower per cycle and much faster per unit of knowledge. Bundle only changes that must land together to be coherent.`,
      follow:`When is it right to change several things at once anyway?`,
      red:`Says they change everything they can each cycle because iteration speed is what matters.` },
    { q:`What goes in an iteration log?`,
      a:`Hypothesis, the change made, the test run, the result observed, the decision taken. Date and owner. It exists so that in four months the team can answer why the game is the way it is, and so that an oscillation between two options becomes visible instead of being repeated.`,
      follow:`Who reads it, and how do you keep it from becoming write-only?`,
      red:`Keeps no record and relies on memory, or describes a ticket tracker with no results in it.` }
  ],
  mid:[
    { q:`You changed five things and the test improved. Now what?`,
      a:`You have an improvement you cannot explain. Do not build on it blindly. If the change is cheap to split, revert to the baseline and reintroduce the most likely candidate alone. If it is not, accept the improvement and write down that it is unattributed, so nobody later cites it as proof of a design principle.`,
      follow:`How would you design the next cycle to avoid this?`,
      red:`Declares the bundle a success and moves on, citing it later as evidence for one of the five.` },
    { q:`How many iterations without player contact is too many?`,
      a:`More than two is a warning and three is a stop. Each unwitnessed cycle compounds an assumption. The rule matters more when builds are cheap, because a team can now run a week of changes without anyone outside the room touching it. Put the test in the calendar first and fit the iterations around it.`,
      follow:`What do you do when recruiting a tester genuinely takes two weeks?`,
      red:`Answers with a number and no reasoning, or says internal review covers it.` },
    { q:`How do you avoid overfitting to one loud tester?`,
      a:`Code observations before reading opinions, count how many testers produced each behaviour, and hold changes until a pattern appears or the finding is a clear usability defect. Keep outliers in a separate list with a note on why they might matter. Revisit the list when the pattern later confirms them.`,
      follow:`An outlier turned out to be right. How would you have caught it earlier?`,
      red:`Says they weight feedback by how articulate or senior the tester was.` }
  ],
  senior:[
    { q:`The team has iterated for three months and the game is not better. Diagnose.`,
      a:`Read the log for convergence. Oscillation between two options means the decision is unresolved and no amount of tuning will settle it. No log means nothing is attributable. Changes tracking the last tester means overfitting. Changes tracking the loudest person means the process is social. Name which of those it is before proposing a fix.`,
      follow:`What would you stop doing for two weeks, and what would you do instead?`,
      red:`Proposes more iteration, a new feature, or a reorganisation without reading what was already tried.` },
    { q:`When do you stop iterating and commit?`,
      a:`When the signal you named is being hit consistently with matched players, when changes are getting smaller and less consequential, and when the remaining disagreements are about taste rather than about whether it works. Commit explicitly, record the decision and what would reopen it, and move the effort to the next risk.`,
      follow:`What would make you reopen a committed decision?`,
      red:`Keeps iterating until the schedule forces a stop, with no stated criterion.` }
  ] });

T('vertical-slice-mvp',{ d:'production', t:'Vertical slice and MVP', tag:'A slice proves the experience at full quality. An MVP proves players want it. Know which you are making.',
  what:`A vertical slice is a small section of the game at shipping quality across all disciplines, made to prove the experience and the pipeline. A minimum viable product is the smallest version that delivers the core experience to real players. Richard Lemarchand's concentric development finishes the core to quality before layering secondary systems.`,
  why:[`Horizontal building (all systems at low quality) hides whether the experience works. The slice forces the question.`,`The slice reveals the true cost per unit of content, which is the only honest basis for scope.`,`An MVP in players' hands produces the evidence no internal test can.`],
  think:{ q:[`Does this slice contain the core loop at full quality, or the easy parts polished?`,`What does the slice teach about cost per level, per enemy, per minute?`,`What is the smallest thing players would play voluntarily?`,`What is deliberately not in the slice, and why?`],
    trade:[`Slicing early commits to a direction. Slicing late wastes horizontal work.`,`Early access as MVP yields real evidence and public judgment.`],
    traps:[`Slice as a marketing demo rather than a proof.`,`Polishing a slice of an unvalidated loop.`,`MVP that omits the thing the game is about.`],
    good:[`The slice answers "does the experience work at quality?" with a yes or no.`,`Cost data from the slice drives the scope plan.`],
    bad:[`The slice looks great and the team still argues about the loop.`] },
  how:[`Validate the loop in grey boxes first.`,`Pick the section that best represents the core experience. Build it to shipping quality across disciplines.`,`Measure cost per unit. Recompute scope.`,`Consider an MVP release or closed test for real player evidence.`],
  ai:{ yes:[`Estimate cost per unit from the slice and project scope.`,`Implement production tooling and pipelines.`,`Track and flag scope drift against the slice-derived plan.`],
       no:[`Decide the slice proves the experience. Players decide.`] },
  prompts:[{l:'Slice scope',p:`Our core experience is "[STATEMENT]" and our validated loop is [DESCRIPTION]. Propose the smallest vertical slice that would prove the experience at shipping quality: which section, which systems at full quality, what is explicitly excluded and why. List the cost-per-unit measurements the slice should produce and how they would be used to set total scope.`}],
  verify:[`Did it include the hard part of the experience in the slice, or the easy part?`],
  test:[`Do players describe the slice the way the core experience statement does?`,`Does the slice reveal cost data? Recompute scope with it.`],
  rel:[['prototyping','Prototype first, slice second.'],['scope-control','Slice data sets scope.'],['polish-when','The slice is where polish is first justified.']] });
TECH('vertical-slice-mvp',[
  {n:'Vertical slice', how:`A thin, polished, end-to-end slice at near-final quality to prove the pipeline.`, fit:`De-risking production quality and integration.`, cost:`Expensive. Does not prove content volume or fun at scale.`, alt:`Slice for pipeline risk, prototype for mechanic risk.`},
  {n:'MVP (minimum viable product)', how:`The smallest thing that delivers the core value and can be tested by real players.`, fit:`Proving the core experience is worth building.`, cost:`"Viable" is often misread as "shippable". It is for learning.`, alt:`Define the core value in one sentence first.`}
]);
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
INTERVIEW('vertical-slice-mvp',{
  junior:[
    { q:`Define a vertical slice and a minimum viable product, and say which you would build first.`,
      a:`A slice is a small section of the game at shipping quality across every discipline, made to prove the experience and the pipeline. An MVP is the smallest version real players would choose to play, made to prove they want it. Prototype first, slice second, and only consider an MVP release once the loop survives a slice.`,
      follow:`What question does a slice answer that a prototype cannot?`,
      red:`Uses the two terms interchangeably, or calls a polished demo level a slice.` },
    { q:`What does "shipping quality across all disciplines" actually mean?`,
      a:`Art, audio, animation, UI, performance and content all at the bar you intend to ship, in one contiguous piece of play. The point is to hit every pipeline and every handoff once, at the real cost, so the true cost per unit becomes visible. A slice that fakes the audio has not tested the audio pipeline.`,
      follow:`Which discipline is most often faked in a slice, and what does that cost you later?`,
      red:`Describes a section that looks finished but skips the parts that are hard to produce.` }
  ],
  mid:[
    { q:`Which section do you slice, and why not the easiest one?`,
      a:`Pick the section that best represents the core experience, including the part you are least sure you can produce. The easy section produces cheerful cost data that understates the real number and proves nothing about the experience. State explicitly what is excluded from the slice and why, so the exclusions are a decision rather than an omission.`,
      follow:`The hardest section depends on a system that is not finished. What do you do?`,
      red:`Picks the first level because it already exists, or the most visually impressive one for the demo.` },
    { q:`What data should the slice produce beyond "does it feel good"?`,
      a:`Cost per level, per enemy, per minute of play, per cutscene, per localisation pass. Time spent per discipline and where work queued. The number of handoffs that needed rework. That is the only honest basis for total scope, and it usually resets the plan.`,
      follow:`The slice says content costs twice the plan. Walk me through the conversation that follows.`,
      red:`Measures only schedule days and never recomputes scope with the result.` },
    { q:`Marketing wants the slice as a trailer. What changes and what do you protect?`,
      a:`Nothing about the build changes. The risk is that the slice quietly becomes a demo, which means the hard part gets faked and the cost data becomes fiction. Agree the capture happens after the slice is evaluated, and keep the evaluation criteria separate from what looks good in a cut.`,
      follow:`The slice proves the experience does not work, and the trailer is already booked. What now?`,
      red:`Agrees to restructure the slice around what films well.` }
  ],
  senior:[
    { q:`The slice looks great and the team is still arguing about the loop. What went wrong?`,
      a:`Polish was applied before validation, so the argument is now about a beautiful artifact nobody can evaluate. The loop was never proven in grey boxes. Go back to a stripped build, settle the loop with players, then re-derive what the slice should contain. Say plainly that some of the polish will be thrown away.`,
      follow:`How do you tell the team that a month of finished work has to be set aside?`,
      red:`Proposes another polish pass, or settles the loop debate by seniority.` },
    { q:`How do you use slice cost data to reset the scope plan?`,
      a:`Multiply the measured cost per unit by the planned unit counts, compare against remaining capacity with an explicit buffer, and present the gap as a number rather than a worry. Then bring the pre-agreed cut list and take the cuts in risk order. Recompute after the next milestone, because the first number is still an estimate.`,
      follow:`The number says you need to cut forty percent. What do you cut first?`,
      red:`Assumes the team will get faster, or plans overtime to close the gap.` }
  ] });

T('risk-and-dependencies',{ d:'production', t:'Risk, dependencies and technical constraints', tag:'Test the riskiest assumption first. Everything downstream of it is a bet.',
  what:`Identifying what could sink the game (a loop that is not fun, a technology that does not scale, a content pipeline that costs too much, a platform certification), the order in which risks should be retired, and the dependencies between features that decide what can be validated when.`,
  why:[`Projects fail on the assumptions nobody tested, not the ones everyone worried about.`,`Dependencies decide the order of work. Building on an unvalidated dependency multiplies risk.`,`Technical constraints are design constraints. Discovering them late means redesign.`],
  think:{ q:[`What would have to be true for this game to work? Which of those have I tested?`,`What is the single riskiest assumption? What is the cheapest test?`,`Which features depend on which validated results?`,`What technical constraint could change the design? Have I hit it yet?`],
    trade:[`Retiring risk early costs time before visible progress.`,`Parallel work speeds output and multiplies rework if a dependency fails.`],
    traps:[`Testing the safe parts because they are satisfying to build.`,`Treating technology as someone else's risk.`,`Dependency chains where the fun is at the end.`],
    good:[`The risk list is short, ordered, and shrinks.`,`Prototypes target the top risk.`],
    bad:[`The fun is scheduled for a milestone eleven months out.`] },
  how:[`List what must be true. Rank by impact if false times uncertainty.`,`For the top three, define the cheapest test and run it.`,`Map feature dependencies. Schedule so that validated results unlock the work that depends on them.`,`Hit technical constraints early with stress tests.`],
  ai:{ yes:[`Build the dependency graph and risk register from documents.`,`Propose cheapest tests per risk.`,`Run technical stress tests and summarize limits.`],
       no:[`Rank risks by importance to the experience. That is judgment.`] },
  prompts:[{l:'Risk register',p:`Here is our design and plan: [DOCS]. List the assumptions that must be true for the game to work, grouped as experience, technical, production and market. Score each by impact if false and current uncertainty. For the top 5, propose the cheapest test and what result would retire the risk. Then draw the feature dependency graph and flag features currently scheduled before the results they depend on.`}],
  verify:[`Did it include experience risk ("the loop is not fun"), or only technical and production risk?`],
  test:[`Did the prototype target the top risk?`,`Has the risk list shrunk since last month?`],
  rel:[['prototyping','Prototypes retire risk.'],['scope-control','Dependencies order scope.'],['core-loop','The loop is usually the top experience risk.']] });
TECH('risk-and-dependencies',[
  {n:'Risk-first ordering', how:`Attack the riskiest assumption first. Build the thing most likely to kill the project before anything comfortable.`, fit:`Every project. The core of production discipline.`, cost:`Feels backwards to stakeholders who want visible progress.`, alt:`Make the risk visible and its test small and fast.`},
  {n:'Spikes and technical prototypes', how:`Time-boxed experiments that answer one technical question and are then discarded.`, fit:`Unproven tech, platform limits, novel pipelines.`, cost:`Can become unowned production code if not discarded.`, alt:`Define the question and delete the spike after the answer.`},
  {n:'Dependency mapping and critical path', how:`Graph what depends on what. See what blocks the most and can be parallelized.`, fit:`Planning production and tooling order.`, cost:`Maps go stale. Needs upkeep.`, alt:`Re-map at each milestone. Keep it short.`}
]);
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
INTERVIEW('risk-and-dependencies',{
  junior:[
    { q:`What is the riskiest assumption on a project you worked on, and how would you have tested it cheaply?`,
      a:`Name one thing that had to be true for the game to work, say why it was uncertain, and give the cheapest test that would have settled it. Rank by impact if false multiplied by current uncertainty. Include experience risk, not only technical risk, because "the loop is not fun" sinks more projects than any technology.`,
      follow:`Who on that team would have had to agree to run that test, and did they?`,
      red:`Lists only technical risks, or treats the loop being fun as a given.` },
    { q:`What is a dependency, and why does it decide the order of work?`,
      a:`A dependency is work whose value depends on a result that is not in yet. Building on an unvalidated dependency multiplies risk, because if the dependency changes, everything built on it is rework. So the order of work follows the order of validated results, not the order of the feature list.`,
      follow:`Show me a dependency chain from a project you know where the fun was at the end.`,
      red:`Describes dependencies purely as scheduling links with no notion of validation.` },
    { q:`Who owns risk: the producer, the lead, or everyone?`,
      a:`The producer keeps the register and the cadence. The discipline leads own the risks inside their area and are the ones who can say what would retire them. Everyone is expected to raise one. Ownership without a named person and a date means the register is decoration.`,
      follow:`You spot a risk outside your discipline. How do you raise it?`,
      red:`Says risk is the producer's job, or that raising risks is not a junior's place.` }
  ],
  mid:[
    { q:`How do you build a risk register and rank it?`,
      a:`List what must be true for the game to work, grouped as experience, technical, production and market. Score each by impact if false and by current uncertainty. Take the top three, define the cheapest test that would retire each, and schedule those first. Review monthly and expect the list to shrink.`,
      follow:`Your register has not shrunk in two months. What does that tell you?`,
      red:`Produces a long list with no ranking, no tests and no owners.` },
    { q:`A technical constraint surfaced at month eight and forced a redesign. How should it have been found earlier?`,
      a:`By stress testing the constraint deliberately during pre-production: worst-case agent counts, worst-case memory, the target device rather than the workstation, the real data volume. Constraints are design constraints, so they belong in the same register as experience risks. Name the test that would have hit it in week three.`,
      follow:`How do you stress test a constraint before the systems that hit it exist?`,
      red:`Treats performance and platform limits as engineering's problem to discover later.` },
    { q:`What does it mean that the fun is scheduled for month eleven?`,
      a:`It means the top experience risk is the last thing anyone will look at, and every month of work before then is a bet on an untested assumption. The fix is to pull a testable version of the fun forward, even crudely, so the bet gets settled while changing direction is still affordable.`,
      follow:`The system that produces the fun genuinely needs eight months of tech. What do you do?`,
      red:`Accepts the schedule because the dependencies say so, without proposing a cheap early proxy.` }
  ],
  senior:[
    { q:`You inherit a project with a long risk list that never shrinks. What do you change?`,
      a:`A register that does not shrink is a worry list. Cut it to the five risks that would actually change the plan, give each an owner, a cheapest test and a date, and delete the rest. Report retirements, not counts. If a risk cannot be retired by any test you can afford, it is a constraint and should be designed around instead.`,
      follow:`One of the five cannot be tested this year. How do you handle it?`,
      red:`Adds a weekly risk meeting, or expands the register to look thorough.` },
    { q:`How do you defend a first month spent on things with no visible progress?`,
      a:`Frame it in the currency the stakeholder cares about: each retired risk removes a category of rework from the schedule. Show the dependency graph and what is bet on each unvalidated assumption. Commit to a dated output per test, so the month produces decisions rather than exploration. Visible progress on an unvalidated foundation is the expensive option.`,
      follow:`The stakeholder says they need something to show in three weeks. What do you give them?`,
      red:`Builds a demo to satisfy the request and defers the risk work.` }
  ] });

T('polish-when',{ d:'production', t:'When to polish', tag:'Polish amplifies validated experience. Polish before validation hides the truth and wastes the work.',
  what:`The production decision of when to spend on feel, art, audio and presentation quality. Polish is expensive, changes when the design changes, and makes a weak loop feel temporarily better. It belongs after the loop is voluntarily replayed and before players judge the whole.`,
  why:[`Polish on a loop that changes is thrown away.`,`Polish on a weak loop delays discovering the weakness.`,`But unpolished feel can hide a good loop from testers who cannot get past the friction. Feel basics (latency, clear feedback) are not polish. They are legibility.`],
  think:{ q:[`Is the loop voluntarily replayed in grey boxes? If not, do not polish.`,`Which polish is legibility (needed for tests) and which is emphasis (needed for shipping)?`,`What is the polish cost per unit and does the scope plan account for it?`,`Which polish opportunities are cheap and high impact?`],
    trade:[`Early polish motivates the team and misleads them.`,`Late polish is efficient and compresses the schedule.`],
    traps:[`Polishing to make a milestone demo look good.`,`Calling feedback and latency fixes "polish" and deferring them.`],
    good:[`Polish work starts on validated systems and is prioritized by impact.`],
    bad:[`Beautiful builds with an unresolved loop debate.`] },
  how:[`Separate legibility fixes (do now) from emphasis polish (do after validation).`,`After validation, list polish opportunities by impact per cost.`,`Polish in passes across the whole validated slice rather than deep on one part.`,`Re-test readability after each pass.`],
  ai:{ yes:[`Rank polish opportunities by impact per cost.`,`Implement feel systems with exposed tuning.`,`Flag polish work on unvalidated systems.`],
       no:[`Decide the loop is validated. Players do.`] },
  prompts:[{l:'Polish gate',p:`Here is our validation evidence per system: [EVIDENCE] and our proposed polish tasks: [TASKS]. Classify each task as legibility (needed for testing) or emphasis (post-validation). Flag emphasis tasks targeting systems without validation evidence. Rank the remaining by impact on the top 5 player actions per hour of work.`}],
  verify:[`Did it respect the validation gate, or rank everything?`],
  test:[`Is the loop replayed before polish? After polish, is readability preserved?`],
  rel:[['game-feel-and-juice','What polish does.'],['vertical-slice-mvp','The slice is the first place polish is justified.'],['ai-loop','Polish is step 11 of the master loop.']] });
TECH('polish-when',[
  {n:'Polish triage', how:`Rank polish by whether it amplifies already-validated feedback. Polish only what earns it.`, fit:`Spending polish budget where it multiplies meaning.`, cost:`Loved-but-unvalidated features demand polish. Hold the line.`, alt:`Polish amplifies. It does not create meaning.`},
  {n:'Feedback-first polish', how:`Invest first in the feedback of core actions, then broader spectacle.`, fit:`Maximum felt-quality per hour.`, cost:`Can leave peripheral content rough.`, alt:`Polish core interactions before environments.`},
  {n:'Stop rule', how:`Define the quality bar and the point where more polish no longer changes the player's experience.`, fit:`Protecting schedule from endless refinement.`, cost:`Requires judgement and a decision owner.`, alt:`Use playtests to find the bar. Stop when it is met.`}
]);
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
INTERVIEW('polish-when',{
  junior:[
    { q:`What is the difference between legibility and emphasis polish?`,
      a:`Legibility is what a tester needs to understand the game: input latency, clear feedback, readable states, a camera that does not fight the player. That is not polish, it is the design being perceivable, and it is done now. Emphasis is impact frames, particles, screen shake, music swells. That waits until the thing it amplifies is validated.`,
      follow:`Give me three legibility fixes on a melee attack and three emphasis ones.`,
      red:`Calls input latency and missing feedback polish, and defers them to a polish phase.` },
    { q:`When is it too early to polish?`,
      a:`Before the loop is voluntarily repeated in grey boxes. Polish on a design that is still changing gets thrown away, and polish on a weak loop delays discovering the weakness because testers respond to the surface. The gate is a behaviour, not a date.`,
      follow:`Who decides the loop is validated?`,
      red:`Says polish early because it motivates the team, with no gate at all.` },
    { q:`Name three cheap, high-impact polish items on a basic attack.`,
      a:`Hit stop on connection, a distinct impact sound with a short tail, and a wind-up pose that reads before the hit lands. Each costs little and each carries information as well as feel. Rank polish by impact on the actions the player performs most per hour, not by what is most fun to build.`,
      follow:`Which of those three is actually legibility rather than emphasis?`,
      red:`Names a bloom pass and a colour grade as the highest impact work on a combat action.` }
  ],
  mid:[
    { q:`Morale is low and the artists want to polish now. How do you handle it?`,
      a:`Take the morale problem seriously and do not solve it by polishing an unvalidated system. Find work that is both real and satisfying: legibility fixes, the art bible, a validated system that is ready, tools. Be explicit that the gate is about wasted work, not about their judgment, and name what has to happen for the gate to open.`,
      follow:`Nothing is validated yet and the art team has three weeks of capacity. What do they do?`,
      red:`Opens the gate to keep people happy, or refuses without offering any alternative work.` },
    { q:`How do you rank polish tasks once the gate is open?`,
      a:`By impact per hour on the actions players perform most often. Count the top five player actions per hour and polish those first. Polish in passes across the whole validated slice rather than going deep on one area, then re-test readability after each pass because emphasis can bury information.`,
      follow:`A pass made the game prettier and testers now miss the tell. What do you do?`,
      red:`Ranks by what looks best in a screenshot or by which artist is free.` },
    { q:`Testers cannot get past the friction of the grey box build. Is that a reason to polish?`,
      a:`It is a reason to fix legibility, which is not polish. Check whether the friction is missing feedback, unclear affordances, placeholder audio carrying no information, or genuinely bad controls. Fix those and test again. If testers still cannot engage, the problem is the design, and adding emphasis would only hide it.`,
      follow:`How do you tell "cannot read it" from "does not like it"?`,
      red:`Adds art and effects so the build tests better, then reports a positive result.` }
  ],
  senior:[
    { q:`A milestone demo is in three weeks and the loop is not validated. What do you do?`,
      a:`Say so, in the demo. Present the validated part at quality and the unvalidated part honestly as a test in progress, with the evidence you have and the test that will settle it. Spending the three weeks polishing an unresolved loop buys a good meeting and a worse project. Offer the stakeholder a decision date instead of a finished surface.`,
      follow:`The stakeholder controls funding and wants to see something finished. How does that change your answer?`,
      red:`Polishes for the demo and plans to fix the loop afterwards.` },
    { q:`How do you schedule a polish phase so it does not become endless?`,
      a:`Define it by passes with exit criteria rather than by a date: a feel pass, an audio pass, a readability pass, each with a list derived from impact per hour and a re-test after it. Freeze design changes for the phase, because polish on a moving target never converges. Keep a cut line and hold it.`,
      follow:`A design change becomes necessary mid-polish. How do you handle it?`,
      red:`Defines polish as "until it feels done", or lets new features enter during the phase.` }
  ] });
