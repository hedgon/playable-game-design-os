/* =====================================================================
   STUDIO
   The studio-layer topics that surround a design: what gets written down,
   what gets measured, who decides, how the work is sequenced and how the
   build stays healthy. Same 8-part structure as every other topic. Each
   topic is followed by its techniques (TECH), engine views (ENGINE) and
   interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'studio', lens:'design', t:'Studio', short:'Direction, documents, metrics, team, planning, quality', color:'var(--d-studio)',
  sum:`How a design survives contact with a team and a schedule: what the game must always be, who decides what, what gets written down, what gets measured, and how the work is sequenced and kept playable. Process exists to protect the experience, never the other way round.`,
  links:[['production','Studio practice is the organisation that production runs inside.'],['product','Direction and metrics answer to the market promise the product makes.'],['ai','AI changes who does what and how fast the studio can test an idea.'],['experience','Every process exists to protect the experience, not to replace it.']] });

T('design-documents',{ d:'studio', t:'Design documents and communication', tag:'A document exists to make a decision stick. Match it to the reader and the decision, or write nothing.',
  what:`The written artifacts a design lives in: the one-pager, the pitch, the design document, the technical plan, and the living decision log. They are communication tools rather than deliverables. Their value is the shared decisions they force and the memory they keep, not the page count.`,
  why:[`A design that lives only in one person’s head cannot be built by a team or reviewed by anyone.`,`The right document at the right size prevents both documentation theater and undocumented decisions.`,`Documents are how a proposal survives a room you are not in.`,`A decision log stops the same argument from returning every month.`],
  think:{ q:[`Who reads this, and what decision does it help them make?`,`Is it recording a decision, posing a question, or making an argument?`,`Where is the single source of truth, and who keeps it current?`,`What would break if this document did not exist?`],
    trade:[`Heavier documents align a bigger team and go stale faster. Lighter documents stay current and communicate less.`,`Writing forces clarity and slows momentum.`],
    traps:[`Documentation theater: a beautiful design document nobody reads or updates.`,`Three documents that disagree about the core loop.`,`Writing implementation detail the team would learn faster by prototyping.`,`No decision log, so settled questions reopen.`],
    good:[`A new team member can make a correct decision from the documents without asking.`,`Documents are short and updated when a decision changes.`],
    bad:[`The design lives in chat and memory.`,`The design document describes a game the build already contradicts.`] },
  how:[`Write the one-pager first: player, fantasy, pillars, hook, comparables.`,`Keep the design document on intent and rules, and leave implementation to the technical plan.`,`Keep a decision log with the date, the decision, the reason, and what would reverse it.`,`Match format to reader: one page for a pitch, a living page for the team, a spec for engineering.`,`Retire a document when it stops being true.`],
  ai:{ yes:[`Turn a rough concept into a one-pager and list what is missing.`,`Find contradictions across several documents.`,`Draft a decision-log entry from a discussion.`],
       no:[`Decide what the game is. Documents record decisions, they do not make them.`] },
  prompts:[{l:'One-pager',p:`Here is our concept, audience, pillars and current prototype: [CONTEXT]. Draft a one-page design summary with: the hook in one sentence, the player, the core loop, the differentiator, the constraints, and the biggest open question. Mark anything you had to invent as invented.`},{l:'Contradiction hunt',p:`Here are our design documents: [DOCUMENTS]. List every place two of them disagree, every claim the prototype contradicts, and the three decisions this set of documents fails to make.`}],
  verify:[`Could a new reader make a correct decision from this alone?`,`Does this document state the decision it is meant to support?`],
  test:[`Give the documents to someone who has not worked on the game. Can they describe the loop and the pillars back to you?`],
  rel:[['design-pillars','The one-pager carries the pillars to people who were not in the room.'],['audience-and-positioning','The one-pager is positioning plus the loop.'],['team-and-collaboration','Documents are the artifacts that handoffs depend on.'],['prototyping','Prototypes often answer what a document was about to specify.'],['design-critique-and-feedback','The intent statement a design review starts from.']] });
TECH('design-documents',[
  {n:'One-pager', how:`A single page: player, fantasy, pillars, hook, comparables, biggest open question.`, fit:`Pitches, alignment, and any new collaborator.`, cost:`Forces every claim to be short enough to be testable.`, alt:`A pitch deck when a live audience is expected.`},
  {n:'Living design doc', how:`The current rules and intent, updated when a decision changes, never a write-once bible.`, fit:`An active team that needs one truth.`, cost:`Needs an owner or it goes stale.`, alt:`A decision log plus the prototype for small teams.`},
  {n:'Decision log', how:`Date, decision, reason, and what would reverse it.`, fit:`Any project longer than a month.`, cost:`Discipline to write it after each call.`, alt:`Meeting summaries with owners, if they are kept.`}
]);
ENGINE('design-documents',{
  godot:{ term:`The document that stays true is the one the editor shows. A tuning Resource with ## doc comments and @export_group puts the intent next to the value it governs, and a script with a class_name gets a page in the editor’s own help.`,
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
    pitfall:`Changing an @export default and believing the team now runs the new number. A .tscn or a .tres stores a value only when it differs from the script default, so untouched instances follow the new number while every instance someone once edited keeps its old one. The document and the script agree, the level does not, and the only sign is a small revert arrow in the inspector. When a default moves, sweep the saved resources, or read the value from one shared .tres instead of from per-instance exports.`,
    map:`A Godot Resource with ## doc comments is a ScriptableObject with Tooltip and Header attributes.` },
  unity:{ term:`A ScriptableObject is the document the build reads. CreateAssetMenu makes it an asset a designer can open, Tooltip and Header carry the intent, and HelpURL puts the long form one click from the component.`,
    api:['[CreateAssetMenu(menuName = "...")]','[Tooltip("")] / [Header("")]','[Range(min, max)]','[HelpURL("...")] on the class','[FormerlySerializedAs("old")] when a field is renamed','AssetDatabase.LoadAssetAtPath<T>() for an editor check'],
    snippet:`[CreateAssetMenu(menuName = "Design/Encounter Tuning")]
[HelpURL("https://wiki.example.com/design/encounters")]   // HelpURL wants a full URL: your wiki page
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
    map:`Unity’s ScriptableObject asset is a Godot Resource, Tooltip is a ## doc comment, and Range is @export_range.` } });
INTERVIEW('design-documents',{
  junior:[
    { q:`What goes in a one-pager?`,
      a:`The hook in one sentence, the player, the core loop, the differentiator, the constraints, and the biggest open question. Comparables if they help the reader place it. It exists to let someone who was not in the room make a correct decision, so every line should serve a decision rather than describe the world.`,
      follow:`Which of those is hardest to write honestly, and why?`,
      red:`Describes a long document with lore, feature lists and mockups.` },
    { q:`When do you write nothing?`,
      a:`When no reader needs it and no decision depends on it, or when a prototype would answer the question faster than a spec. Implementation detail the team will learn by building is the usual case. Writing has a cost in time and in going stale, so a document has to earn its place.`,
      follow:`You decided not to write it and three people later ask the same question. What now?`,
      red:`Believes every feature needs a spec before work starts.` },
    { q:`What is in a decision-log entry?`,
      a:`The date, the decision, the reason, who owned it, and what would reverse it. Short. Its job is to stop the same argument from returning every month and to let a new person understand why the game is the way it is without asking four people.`,
      follow:`What do you do when a logged decision turns out to be wrong?`,
      red:`Logs decisions without the reason, so the entry cannot be re-evaluated later.` }
  ],
  mid:[
    { q:`Three documents disagree about the core loop. What do you do?`,
      a:`Establish which one the build implements, because that is the real design. Then hold one short session to decide the loop, record it in a single source of truth with an owner, and retire or mark the others as superseded. Do not reconcile by merging the text, because that hides the decision nobody has made.`,
      follow:`Nobody will own the decision. How do you unblock it?`,
      red:`Rewrites all three to agree without anyone deciding anything.` },
    { q:`How do you keep a document from going stale?`,
      a:`Keep it small and keep it about intent and decisions rather than implementation, because implementation changes weekly. Give it one owner. Update it when a decision changes rather than on a schedule, and retire it when it stops being true. A stale document is worse than none, because people act on it.`,
      follow:`How would someone reading it know whether to trust it?`,
      red:`Schedules a monthly documentation update that nobody performs under deadline.` },
    { q:`How do you tell documentation theatre from useful writing?`,
      a:`Ask who read it last and what decision it changed. Theatre is polished, complete, growing, and cited by nobody. Useful writing is short, contested while it is being written, and referenced when someone has to choose. Cheap generation makes theatre much easier to produce, so the check matters more than it used to.`,
      follow:`Your team has a beautiful design bible nobody opens. What do you do with it?`,
      red:`Judges documents by completeness and presentation.` }
  ],
  senior:[
    { q:`A new hire joins next week. What must they be able to decide from the documents alone?`,
      a:`Who the player is, what the experience promises, what the pillars rule out, the current loop, what has already been tested and what it showed, and which decisions are settled. That is the set that prevents them from reopening closed questions or building something that contradicts the promise. Test it by handing the set to someone outside the project.`,
      follow:`They read it all and still make a wrong call in week two. What was missing?`,
      red:`Points at an onboarding buddy instead of naming what the documents must carry.` },
    { q:`How do you size documentation to team size?`,
      a:`Three people can hold intent in a shared conversation and need a one-pager, a decision log and specs only where disciplines hand off. Thirty people cannot, so the same decisions need written artifacts with owners, because the cost of a misaligned week is now thirty person-days. Scale the artifacts with the number of handoffs, not with the length of the project.`,
      follow:`The team doubles mid-project. What do you write first?`,
      red:`Applies the same documentation standard regardless of team size or handoff count.` }
  ] });

WORKED('design-documents', {
  kind:'doc',
  id:'one-page-spec-fetch-pet',
  t:'A one-page spec for a pet that fetches coins',
  intro:'Stone Librande’s one-page designs (GDC 2010) are diagrams first. This is the text skeleton you would draw around: if each heading fits in a box on one sheet, the spec is the right size. The example feature is a pet that follows the player and fetches dropped coins, in a small action game.',
  note:'An example written for this guide.',
  sections:[
    {h:'Central idea', body:'A small pet trots behind the player and runs to pick up coins the player could not reach, so risky coins feel worth leaving for a moment.'},
    {h:'Player experience', body:'The player drops coins when hit, as they do now. The pet notices them, runs over and brings them back after a short delay. The player feels looked after, but not rescued: coins in danger zones are still lost, and the pet can be hurt.'},
    {h:'Rules', body:'- The pet follows within 3 metres of the player.\n- It targets the nearest dropped coin within 8 metres and returns it to the player.\n- It carries one coin at a time and takes about 1 second per coin.\n- Coins expire after 6 seconds, as they do now.\n- Hazards hurt the pet. After 3 hits it sits down for 10 seconds.'},
    {h:'What it touches', body:'Coin drop code, the hazard damage system, the follow camera, the audio mix (one new bark), and the HUD coin counter, which must count a returned coin once.'},
    {h:'Open questions', body:'Does the pet pick up power-ups too? Can the player call it back? Does it block narrow corridors? Does it make the coin economy too generous?'},
    {h:'How we will know it works', body:'In a 10-person playtest, at least 7 say the pet helped them, none say it got in the way, and the average coins banked per level rises by no more than 15 percent.'}
  ],
  try:['Turn this spec into a diagram on one page: what boxes and arrows would you draw?', 'Add one rule that stops the pet making the game too easy, and say which line in "How we will know it works" would catch the problem.', 'Pick a different feature from a game you know and fill in just the first two headings.'],
  file:'one-page-spec-fetch-pet.md'
});

WORKED('design-documents', {
  kind:'doc',
  id:'feature-brief-fetch-pet',
  t:'A feature brief for the fetch pet',
  intro:'A brief asks for a decision before the work starts. It is short on how and long on why, and it names the result that would make the team stop.',
  note:'An example written for this guide.',
  sections:[
    {h:'Problem', body:'Players leave coins behind when they are hit near hazards, and our playtests show they find that frustrating rather than tense.'},
    {h:'Target player', body:'A casual player on a phone who plays in short sessions and does not want to replay a level for a few coins.'},
    {h:'Desired behaviour', body:'The player keeps moving forward after a hit instead of going back for coins, and still takes some risks to collect them.'},
    {h:'Smallest experiment', body:'A grey-box pet with no art: it follows the player and fetches coins. One level, one week of work for one designer and one programmer, tested with 10 players.'},
    {h:'Success signal', body:'At least 7 of 10 players say they went back for fewer coins, and the level completion rate stays the same or rises.'},
    {h:'Kill criterion', body:'If after the test fewer than 4 of 10 players notice the pet, or more than 3 say it makes the level too easy, we stop and do not build the art.'},
    {h:'Cost estimate', body:'5 working days for the experiment. About 6 weeks to ship with art, animation and audio.'},
    {h:'Risks', body:'The pet can break the coin economy. Pathfinding in tight spaces is hard. It may feel like a mobile-game pet rather than part of this game.'},
    {h:'Decision needed by', body:'Friday, before we plan the next sprint.'}
  ],
  try:['Write the kill criterion for a different feature, such as a new boss or a daily reward. Make it a number a stranger could check.', 'Which section would you cut for a one-day task, and which can you never cut?', 'Rewrite the success signal so it measures behaviour instead of opinion.'],
  file:'feature-brief-fetch-pet.md'
});

WORKED('design-documents', {
  kind:'doc',
  id:'decision-log-fetch-pet',
  t:'A decision-log entry for the fetch pet',
  intro:'A decision log is a list of short entries that stop a settled question being reopened by accident. The entry records what was chosen and, as important, what was given up.',
  note:'An example written for this guide.',
  sections:[
    {h:'Date', body:'2026-10-01'},
    {h:'Decision', body:'The pet fetches coins only. It does not pick up power-ups or keys in this version.'},
    {h:'Options considered', body:'1. Coins only.\n2. Coins and power-ups.\n3. Anything that drops, including keys.'},
    {h:'Why this one', body:'It is the smallest rule that tests the idea. Power-ups change the strategy of a level, and keys can block progress if the pet fails to bring one.'},
    {h:'What we gave up', body:'Some of the "it helps me with everything" feeling. A player may ask why the pet ignores a power-up that is right next to it.'},
    {h:'Evidence', body:'Playtest of the grey-box pet with 10 players: 8 liked the coin fetching, 3 asked for power-ups, and 2 lost a power-up because the pet ran past it.'},
    {h:'Revisit when', body:'After the coin experiment ships and we have two weeks of data on coins banked per level, or sooner if more than a quarter of players ask for power-up fetching.'}
  ],
  try:['Write a decision-log entry for a choice your own team made this month, and be honest about what it gave up.', 'What is the difference between "revisit when" and "never decided"? Rewrite a vague one so it has a date or a number.', 'Who should be allowed to reverse this decision, and where would you write that?'],
  file:'decision-log-fetch-pet.md'
});

T('metrics-and-success',{ d:'studio', t:'Metrics, telemetry and success criteria', tag:'Decide what would count as working before you ship, and measure behaviour you can attribute to a change.',
  what:`How to define success, choose metrics, and instrument the game. Leading indicators show behaviour inside a session. Lagging indicators show retention and revenue. Funnels, cohorts, completion and session length describe what happened. Data informs decisions. It never makes them, because a number cannot tell you why the player behaved that way.`,
  why:[`A hypothesis without a signal is a hope.`,`Vanity metrics reassure and do not guide.`,`Behaviour metrics reveal where the loop breaks, and self-report cannot.`,`Instrumentation built late cannot answer questions you did not anticipate.`],
  think:{ q:[`What is the one behaviour change that would mean the design works?`,`Is this metric leading or lagging? Can a design change move it within a week?`,`Can I attribute the change to the design rather than to seasonality or marketing?`,`What result would make me stop, and is that result captured?`,`Does the metric reward the experience we want, or a proxy a player can game?`],
    trade:[`More telemetry answers more questions and costs performance, privacy and analysis time.`,`Optimizing a proxy can improve the number and hurt the game.`],
    traps:[`Measuring what is easy rather than what matters.`,`No baseline, so no change is interpretable.`,`Treating the metric as the goal.`,`Events logged without the choice or the context around them.`],
    good:[`Every hypothesis names its signal and its kill criterion.`,`The team can say what each metric does and does not mean.`],
    bad:[`Dashboards nobody acts on.`,`Numbers reported without a decision attached.`] },
  how:[`Start from the hypothesis: the behaviour, the signal, the kill criterion.`,`Choose the smallest instrumentation: inputs, decisions, failures, session bounds, timestamps.`,`Establish a baseline before the change.`,`Compare distributions and cohorts, not only averages.`,`Decide with the number and the playtest context together.`],
  ai:{ yes:[`Design instrumentation and write the logging spec.`,`Analyze logs, cluster behaviour, and flag likely confounds.`,`Draft the dashboard questions worth asking, not just the charts.`],
       no:[`Decide what success means.`,`Infer causes from numbers alone.`] },
  prompts:[{l:'Instrumentation plan',p:`Our hypothesis is: [HYPOTHESIS]. Our game states and actions are: [LIST]. Propose the smallest set of events and properties that would let us measure the expected behaviour and its alternatives. For each event, give the trigger, the properties, and the decision it informs. Include the confounds the data cannot separate.`},{l:'Result read',p:`Here are the results before and after a change: [DATA]. Baseline: [BASELINE]. For each metric, state whether the change is within noise, what behaviour it suggests, and what would make that reading false. Do not tell me the cause. Give me the two experiments that would separate the candidate explanations.`}],
  verify:[`Does each metric connect to a stated decision?`,`Is a baseline present for every claimed change?`,`Has the proxy-versus-goal risk been named?`],
  test:[`Name the one behaviour that would prove the design works and check whether the build can measure it.`,`Report one number and the decision it changed. If there is no decision, the number was a vanity metric.`],
  rel:[['hypothesis-driven-design','A hypothesis is only testable if its signal is captured.'],['iteration-and-evidence','Metrics are one evidence channel beside observation.'],['playtesting','Behaviour metrics and observed playtest behaviour should agree.'],['return-and-quit','Retention is the lagging signal of the whole loop.'],['soft-launch-and-playable-ads','Soft launch is where a written kill criterion first has to survive contact with real cohort data.'],['live-design-seasons-and-data','Reading the metrics without fooling yourself, and the decisions data does not make.']] });
TECH('metrics-and-success',[
  {n:'Leading indicators', how:`Behaviour inside a session, such as completion, retries, and time to first decision.`, fit:`Changes you need to read within a week.`, cost:`Do not directly show retention.`, alt:`Pair each leading signal with the lagging outcome it predicts.`},
  {n:'Cohort analysis', how:`Compare groups by when they joined rather than one blended average.`, fit:`Retention and any change that ships to everyone over time.`, cost:`Needs enough players per cohort to read.`, alt:`Use matched test groups for small samples.`},
  {n:'Pre-registered hypothesis', how:`Write the signal and the kill criterion before the change ships.`, fit:`Every design change with a measurable claim.`, cost:`Removes the freedom to reinterpret results afterwards.`, alt:`Log the decision and its expected signal in the decision log.`}
]);
ENGINE('metrics-and-success',{
  godot:{ term:`One autoload owns the event buffer. Gameplay calls into it, it batches to JSON and flushes on a Timer and once more at quit, and that last flush is what decides whether you ever see a session end.`,
    api:['Autoload singleton holding the queue','JSON.stringify() / FileAccess.store_line()','HTTPRequest.request() with HTTPClient.METHOD_POST','Timer for the flush cadence','get_tree().auto_accept_quit = false','_notification(NOTIFICATION_WM_CLOSE_REQUEST)'],
    snippet:`extends Node                       # autoload "Telemetry"
var _queue: Array[Dictionary] = []

func _ready() -> void:
\tget_tree().auto_accept_quit = false   # or the last flush never happens

func log_event(event_name: String, props: Dictionary) -> void:
\tprops["e"] = event_name
\tprops["t"] = Time.get_unix_time_from_system()
\t_queue.append(props)              # the decision it informs is in the name

func flush() -> void:             # disk first: a file write is finished before the process exits
\tif _queue.is_empty():
\t\treturn
\tvar path := "user://spill.jsonl"
\tvar f := FileAccess.open(path, FileAccess.READ_WRITE if FileAccess.file_exists(path) else FileAccess.WRITE)
\tif f == null:
\t\treturn
\tf.seek_end()
\tfor e in _queue:
\t\tf.store_line(JSON.stringify(e))
\t_queue.clear()                # the next launch uploads the spill file

func _notification(what: int) -> void:
\tif what == NOTIFICATION_WM_CLOSE_REQUEST:
\t\tflush()                   # session_end, the event everyone forgets
\t\tget_tree().quit()
\telif what == NOTIFICATION_APPLICATION_PAUSED:
\t\tflush()                   # mobile: suspending is where a session ends`,
    pitfall:`Flushing over the network on close while auto_accept_quit is at its default. Every node still receives NOTIFICATION_WM_CLOSE_REQUEST, but the engine quits at the end of that frame, so an HTTPRequest started in the handler never completes, every clean exit loses its session end and a crash becomes indistinguishable from a quit. The metric the whole funnel rests on is the one that never arrives. Turn auto_accept_quit off, handle NOTIFICATION_WM_CLOSE_REQUEST, and keep a Timer flush so a kill still leaves most of the session on disk.`,
    map:`Godot’s NOTIFICATION_WM_CLOSE_REQUEST is Unity’s Application.wantsToQuit, and an autoload is a DontDestroyOnLoad component.` },
  unity:{ term:`One DontDestroyOnLoad component owns the queue, serializes flat structs with JsonUtility and posts with UnityWebRequest. On mobile the flush that matters is the one in OnApplicationPause, because that is where sessions end.`,
    api:['OnApplicationPause(bool) / OnApplicationFocus(bool)','Application.wantsToQuit / Application.quitting','UnityWebRequest.Post() with a JSON body','JsonUtility.ToJson() on a [Serializable] struct','Application.persistentDataPath for the spill file','DontDestroyOnLoad()'],
    snippet:`void OnApplicationPause(bool paused) {
    if (paused) Flush();            // on Android and iOS this IS the quit
}

void OnApplicationQuit() => Flush();      // desktop; not reliable on mobile

void Flush() {
    if (queue.Count == 0) return;
    var body = string.Join("\\n", queue.Select(JsonUtility.ToJson));
    File.AppendAllText(spillPath, body + "\\n");   // disk first, network second
    queue.Clear();
    StartCoroutine(Post(body));
}`,
    pitfall:`Relying on OnApplicationQuit. Android and iOS suspend an app and kill it later without telling it, so OnApplicationQuit never runs on the platforms where most sessions end, and every mobile session arrives with its tail missing. Flush in OnApplicationPause(true), write to persistentDataPath before attempting the network, and send the previous run’s spill file on the next launch.`,
    map:`Unity’s OnApplicationPause is Godot’s NOTIFICATION_APPLICATION_PAUSED, and persistentDataPath is user://.` } });
INTERVIEW('metrics-and-success',{
  junior:[
    { q:`Leading versus lagging indicator, with a game example.`,
      a:`Leading shows behaviour inside a session and can move within a week of a design change: choices per decision point, retries before quitting, weapon switches per fight. Lagging shows the accumulated result: day-seven retention, revenue, review score. Design changes are evaluated on leading signals, because lagging ones arrive too late and carry too many confounds.`,
      follow:`Which lagging indicator would you still watch weekly, and why?`,
      red:`Names retention and revenue as the metrics to design against.` },
    { q:`What is a vanity metric?`,
      a:`A number that reassures and does not guide: total installs, cumulative sessions, lines of dialogue. The test is whether any value of the number would change a decision. If not, reporting it costs attention and buys nothing. Replace it with a metric attached to a decision.`,
      follow:`Your stakeholder wants the vanity number in every report. How do you handle it?`,
      red:`Calls any big aggregate number a vanity metric without the decision test.` },
    { q:`A new feature is going in. What do you instrument?`,
      a:`Start from the hypothesis and instrument the behaviour it predicts, plus the alternatives. Events for each decision point with the option chosen, failures with causes, session bounds, all timestamped with the context around the choice. The smallest set that could distinguish the predicted behaviour from its alternatives.`,
      follow:`What question will you be unable to answer with only that?`,
      red:`Logs everything possible and plans to work out the questions afterwards.` }
  ],
  mid:[
    { q:`Retention dropped three points after a patch. Walk me through the investigation.`,
      a:`Establish the baseline and the noise band first, because three points may be nothing. Segment by cohort, platform and whether players saw the change, and compare distributions rather than averages. Check for confounds: seasonality, a marketing push, a store feature, a crash regression. Then pair the numbers with observation before naming a cause.`,
      follow:`Two candidate explanations fit the data equally. What two experiments separate them?`,
      red:`Names the most recent design change as the cause and reverts it.` },
    { q:`Why do you need a baseline?`,
      a:`Because without one no change is interpretable. You cannot tell a real effect from normal variation, and you cannot tell whether the number was already moving. Capture the baseline before the change ships, over enough time to see the noise band, and record the conditions so the comparison is fair.`,
      follow:`You inherit a feature that shipped with no baseline. What can you still learn?`,
      red:`Compares to the previous week and treats any difference as an effect.` },
    { q:`The metric improved and the game got worse. How does that happen?`,
      a:`The metric was a proxy and the team optimised the proxy. Session length rises because players are lost, tutorial completion rises because the tutorial got longer and unskippable, engagement rises because a nagging prompt works. The guard is to state, for each metric, what it does not mean, and to pair it with observed behaviour.`,
      follow:`How would you have caught it earlier?`,
      red:`Trusts the metric and looks for another explanation for the complaints.` }
  ],
  senior:[
    { q:`Define success criteria for a feature before it ships.`,
      a:`Name the behaviour change that would mean the design works, the leading signal that captures it, the baseline, the window, and the result that would make you pull or rework the feature. Check the build can measure it before the feature is built. Agree it with whoever will judge the outcome, in advance.`,
      follow:`The signal lands in the middle: not a clear yes, not a kill. What do you do?`,
      red:`Defines success as positive sentiment or as shipping on time.` },
    { q:`How do you stop a team from optimising a proxy?`,
      a:`Attach every metric to the decision it informs and to a statement of what it does not mean. Never make a proxy a target with an incentive behind it. Review metrics alongside playtest observation so the number always arrives with context. When a proxy and the experience diverge, say so publicly and change the metric rather than the game.`,
      follow:`A target on a proxy is already in someone’s objectives. What do you do?`,
      red:`Adds more metrics to balance the first one.` }
  ] });

T('team-and-collaboration',{ d:'studio', t:'Team, roles and collaboration', tag:'Small teams ship by giving every decision an owner and keeping one shared target.',
  what:`How work is divided and decisions owned: generalist versus specialist on a small team, who owns the design, how disciplines review each other, and how a shared target keeps local optimisation from pulling the game apart. A role is a set of decisions, not a title.`,
  why:[`Games are made by teams, and a design only exists if others can build it.`,`Unclear ownership produces either paralysis or conflicting decisions.`,`Review across disciplines catches what one discipline cannot see alone.`,`A single shared target is the cheapest alignment tool a team has.`],
  think:{ q:[`Who owns this decision, and who must be consulted before it changes?`,`Does every discipline know the shared target and how their work serves it?`,`What does this role hand to the next, and in what form?`,`Where do two disciplines have conflicting goals, and who resolves that?`],
    trade:[`Generalists keep a small team fast and can lack depth. Specialists raise quality and add coordination cost.`,`Autonomy motivates and drifts. Alignment corrects and can slow.`],
    traps:[`Titles without decision ownership.`,`Design by committee with no tiebreaker.`,`A review that only says it looks good.`,`Handoffs with no artifact, so intent is lost in transit.`,`Letting two people edit the same binary asset: Unreal stores levels and Blueprints as .uasset packages that cannot be merged, so one person’s work is lost unless the team locks files through Perforce checkout.`],
    good:[`A new member can learn who decides what.`,`Decisions have owners and dates.`],
    bad:[`The same debate recurs every month.`,`Nobody owns the core loop.`] },
  how:[`Write the responsibility map: who decides, who builds, who reviews.`,`Agree the shared target and repeat it until people can restate it.`,`Define the artifact for each handoff.`,`Review across disciplines with one question: does this serve the target?`,`Keep decisions in a log with an owner.`],
  ai:{ yes:[`Draft responsibility maps and handoff checklists.`,`Summarize a decision meeting into owners and open questions.`,`Generate review questions each discipline should ask.`],
       no:[`Assign ownership.`,`Resolve a human conflict.`] },
  prompts:[{l:'Responsibility map',p:`Here are our tasks and the people available: [TASKS, TEAM]. Produce a table with, for each task, who decides, who builds, who reviews, and what artifact the handoff produces. Mark tasks where the decision owner is unclear or duplicated.`},{l:'Review questions',p:`Our shared target is: [TARGET]. This week the team proposes: [WORK]. Write the three questions each discipline (design, art, engineering, audio, production) should ask to test whether the work serves the target.`}],
  verify:[`Does every decision have one owner?`,`Do handoffs specify an artifact?`],
  test:[`Ask two people who owns a debated decision. If they disagree, the map is wrong.`],
  rel:[['responsibility-matrix','The same ownership question applied to human and AI work.'],['design-documents','Handoffs depend on documents that state the decision.'],['design-pillars','The shared target is the pillars.'],['scope-control','Every task needs an owner before it enters scope.'],['craft-source-control-for-games','Locking, large binaries and branching decide how a game team shares work day to day.']] });
TECH('team-and-collaboration',[
  {n:'Responsibility map', how:`For each task, who decides, who builds, who reviews, and the handoff artifact.`, fit:`Teams where decisions stall or duplicate.`, cost:`Exposes ownership gaps people avoided.`, alt:`A one-page team charter for very small teams.`},
  {n:'Cross-discipline review', how:`Each discipline asks the same question of the work: does it serve the shared target?`, fit:`Preventing local optimisation.`, cost:`Meeting time and some friction.`, alt:`Asynchronous review notes against the pillars.`},
  {n:'Handoff artifact', how:`The document or spec that travels with the work between roles.`, fit:`Any handoff where intent is lost.`, cost:`Writing it takes time the author would rather spend building.`, alt:`A recorded walkthrough for one-off cases.`}
]);
ENGINE('team-and-collaboration',{
  godot:{ term:`Ownership follows the file. A .tscn is text, which invites hand merges, but its ids, node paths and connections all refer to each other across the file, so two people work on one level by splitting it into instanced sub scenes that each have one owner.`,
    api:['PackedScene instances and scene inheritance','Editable Children on an instanced scene','uid:// identifiers inside .tscn and .tres','*.import sidecar files, which belong in the repository','.godot/ , which does not','Project Settings > Version Control plugin'],
    snippet:`extends Node3D                     # res://level/atrium/atrium.tscn
## Each instanced child is one file with one owner. Merge at the file level.
## References inside a .tscn resolve by string ids (id="1_abcde"), so a hand merge can duplicate or orphan them.

@export var encounter: PackedScene      # owner: combat design
@export var set_dressing: PackedScene   # owner: environment art
@export var audio_zones: PackedScene    # owner: audio

func _ready() -> void:
\tfor s in [encounter, set_dressing, audio_zones]:
\t\tif s:
\t\t\tadd_child(s.instantiate())`,
    pitfall:`Hand resolving a merge conflict inside a .tscn. The format is text, which makes it look mergeable, but a scene is a web of cross-references (resource ids, parent paths, signal connection lines), so a conflict resolved by taking both sides can leave a reference pointing at a resource or node the other side removed or duplicated, and the scene opens with scripts and meshes attached to the wrong nodes, or refuses to open. Take one side whole and redo the other edit in the editor, and split scenes so that choice costs an hour rather than a day. Commit the .import files, and from Godot 4.4 the .uid files that sit beside scripts and shaders (they keep references stable when a file moves), and ignore .godot/.`,
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
    pitfall:`Not committing the .meta files, or deleting one while tidying. The .meta holds the asset’s GUID, which is the only thing every prefab, scene and asset reference points at. Lose it and Unity mints a new GUID on the next import, so on the next person’s machine the references become Missing (Mono Script) and a day of prefab wiring is gone with no error at commit time. Commit every .meta with its asset, set Asset Serialization to Force Text, and register UnityYAMLMerge before the first scene conflict rather than after it.`,
    map:`A Unity .meta GUID is Godot’s uid:// plus the .import sidecar, and a prefab variant is an inherited scene.` } });
INTERVIEW('team-and-collaboration',{
  junior:[
    { q:`What does “a role is a set of decisions” mean?`,
      a:`A title tells you what someone is called. A role tells you which decisions they own and which they must be consulted on. Teams break when titles exist and decision ownership does not, because then either nobody decides or two people decide differently. Say who owns the core loop on a project you worked on.`,
      follow:`Who owned the core loop on your last project, and how did you know?`,
      red:`Describes roles as job descriptions and task lists.` },
    { q:`What makes a good cross-discipline handoff?`,
      a:`A named artifact that carries the intent, not just the asset: what it is for, what decision it implements, what must not change, and who to ask. Handoffs with no artifact lose intent in transit, and the receiving discipline reconstructs it by guessing. Agree the artifact per handoff type in advance.`,
      follow:`Give me a handoff that went wrong and what artifact would have saved it.`,
      red:`Describes handing over a file and a chat message.` }
  ],
  mid:[
    { q:`Two disciplines have conflicting goals. Who resolves it?`,
      a:`Whoever owns the shared target, usually the lead who can say which side serves it better. First check whether it is a real conflict or two local optimisations that both lose against the target. Resolve in the open with the reasoning recorded, because an unresolved conflict resurfaces monthly and an unexplained resolution breeds workarounds.`,
      follow:`The resolution keeps getting relitigated. What is missing?`,
      red:`Proposes compromise as the default, which usually serves neither goal.` },
    { q:`Design by committee: symptom and fix.`,
      a:`The symptom is decisions that satisfy everyone’s objection and nobody’s intent, plus the same debate every month. The fix is a named decision owner with a tiebreaker, consultation that is consultation, and a written decision with a reason. Input from many, decision from one.`,
      follow:`The owner keeps deferring to the group. How do you help them?`,
      red:`Solves it with a vote, or with more alignment meetings.` },
    { q:`How do you review work from a discipline you do not practise?`,
      a:`Review against the shared target rather than the craft. Ask whether this serves the promise, whether the player can read it, whether it matches the pillars, and what it costs the other disciplines. Say plainly what you cannot judge. A review that only says it looks good is a missed review.`,
      follow:`You think something is wrong and cannot articulate why. What do you do?`,
      red:`Comments on craft decisions outside their expertise, or approves everything to be polite.` }
  ],
  senior:[
    { q:`Nobody owns the core loop on your team. Fix it.`,
      a:`Name an owner, publicly, with the authority to decide and the accountability for the result. Give them the evidence channel, meaning the playtests, so the ownership is grounded rather than political. Record the loop and the decisions behind it. Then stop relitigating it in every meeting and route challenges to them.`,
      follow:`Two senior people both believe they own it. How do you handle that?`,
      red:`Creates a working group, or assigns ownership to a role rather than a person.` },
    { q:`The same debate recurs every month. What is missing?`,
      a:`Either the decision was never made, or it was made and never recorded with its reason. Both look identical from the outside. Find out which, then either decide it once with an owner and a record, or point at the record and at what would reverse it. If the reason is no longer true, reopen it deliberately rather than by attrition.`,
      follow:`The recurring debate is unresolved because the evidence is missing. Now what?`,
      red:`Bans the topic, or holds another alignment meeting.` },
    { q:`Generalists or specialists on a team of ten?`,
      a:`At ten you need generalists who can cover gaps, with one deep specialist where quality is the differentiator or the risk is technical. Specialists raise quality and add coordination cost, which a small team pays in handoffs and waiting. Decide by which disciplines sit on the critical path and where the product’s distinctiveness comes from.`,
      follow:`The team grows to thirty. What changes about that answer?`,
      red:`Answers by preference rather than by critical path and differentiation.` }
  ] });

T('planning-and-milestones',{ d:'studio', t:'Planning, milestones and schedule', tag:'Plan around decisions and risks, not around feature counts. A milestone is a question, not a tally.',
  what:`How to sequence the work: milestone types such as prototype, vertical slice, alpha, beta and launch, estimating under uncertainty, buffers, and protecting the critical path. Scope is the variable. Date and quality are the constraints.`,
  why:[`Work expands to fill the time it is given, and features do not have a fixed cost.`,`The riskiest unknown should be scheduled first, not last.`,`A plan is a hypothesis about sequence and is revised with evidence.`],
  think:{ q:[`Which question does each milestone answer, and what is its exit criterion?`,`What is the critical path, and what can slip without moving the launch?`,`How confident is this estimate, and where is the buffer?`,`What gets cut first, and has the team agreed to that in advance?`],
    trade:[`Detailed plans coordinate and go stale. Loose plans adapt and surprise.`,`Estimating in ranges is honest and slower to communicate than a single date.`],
    traps:[`Estimating in optimism.`,`No buffer.`,`Milestones defined as feature counts.`,`Scheduling the riskiest system last.`,`Fixing scope and assuming the date.`],
    good:[`Milestones are questions with exit criteria.`,`Buffers are explicit and cuts are pre-agreed.`],
    bad:[`The plan is a feature list with dates.`,`A slip in one area surprises the whole team.`] },
  how:[`Define each milestone by the question it answers and its exit criterion.`,`Order the work by risk, not by feature order.`,`Estimate each task as a range and add an explicit buffer.`,`Agree the cut list before you need it.`,`Review the plan against evidence at each milestone.`],
  ai:{ yes:[`Propose sequences and surface hidden dependencies.`,`Challenge an optimistic estimate and name what it ignores.`,`Draft milestone exit criteria.`],
       no:[`Commit to dates.`,`Decide the cut list.`] },
  prompts:[{l:'Risk-first sequence',p:`Here is our feature set, team and deadline: [CONTEXT]. Order the work so the riskiest assumptions are tested first. For each milestone, state the question it answers, its exit criterion, the risk it retires, and the parts that can slip without moving the launch. Flag anything scheduled late that could invalidate earlier work.`}],
  verify:[`Does each milestone have a question and an exit criterion?`,`Is a buffer stated?`,`Is the cut list pre-agreed?`],
  test:[`Remove one week from the plan. What was cut, and does the team agree?`],
  rel:[['vertical-slice-mvp','The vertical slice is the milestone that proves the experience.'],['risk-and-dependencies','Planning order is risk order.'],['scope-control','Scope is the variable you plan with.'],['design-documents','The plan records decisions with owners and dates.']] });
TECH('planning-and-milestones',[
  {n:'Risk-first ordering', how:`Sequence work so the biggest unknown is tested earliest.`, fit:`All projects, especially those with unproven systems.`, cost:`Delays visible progress on features.`, alt:`A timeboxed spike for the single riskiest assumption.`},
  {n:'Estimate ranges', how:`Give each task a low and high estimate, then add an explicit buffer.`, fit:`Honest scheduling and renegotiation.`, cost:`Harder to communicate than a single date.`, alt:`Reference-class estimates from past similar work.`},
  {n:'Pre-agreed cut list', how:`Decide, in calm conditions, what is removed first if time runs short.`, fit:`Protecting the core when the schedule tightens.`, cost:`Requires saying no to features people love.`, alt:`Scope tiers, with the outer tier explicitly optional.`}
]);
ENGINE('planning-and-milestones',{
  godot:{ term:`A milestone exit criterion is a command a runner can execute. godot --headless runs a SceneTree script that loads every level and exits with a code, and the same headless binary produces the export the milestone is judged on.`,
    api:['godot --headless -s res://ci/gate.gd --path .','godot --headless --export-release "<preset>" <out>','SceneTree.quit(exit_code)','DirAccess.get_files_at() / ResourceLoader.exists()','PackedScene.instantiate() as the real load check','export_presets.cfg and the matching export templates'],
    snippet:`extends SceneTree                  # godot --headless -s res://ci/gate.gd

func _initialize() -> void:
\tvar bad := 0
\tfor f in DirAccess.get_files_at("res://level"):
\t\tif not f.ends_with(".tscn"): continue
\t\tvar packed: PackedScene = load("res://level/" + f)
\t\tvar node: Node = packed.instantiate() if packed else null
\t\tif node == null:
\t\t\tpush_error("cannot instantiate " + f)
\t\t\tbad += 1
\t\telse:
\t\t\tnode.free()
\tquit(bad)                      # the milestone is green only at exit code 0`,
    pitfall:`Assuming the runner can export because a developer machine can. Export templates are a separate download pinned to the exact engine version, and export_presets.cfg carries per-platform paths and signing settings that are usually local to one machine, so the milestone build exists on one laptop and nothing else can reproduce it. Install the matching templates on the runner and export every target once in the first week, because “we have not tried that platform yet” is a milestone question rather than a task.`,
    map:`godot --headless -s is unity -batchmode -executeMethod, and SceneTree.quit(code) is EditorApplication.Exit(code).` },
  unity:{ term:`The exit criterion is a static method a runner calls. unity -batchmode -nographics -executeMethod runs it, BuildPipeline produces the player, and the BuildReport is the only thing that knows whether the milestone passed.`,
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
        EditorApplication.Exit(ok ? 0 : 1);   // without -quit or Exit the editor stays open
    }
}`,
    pitfall:`Trusting the process exit code of a batchmode run. BuildPipeline.BuildPlayer reports a failed build in its BuildReport rather than by throwing, so a method that ignores the report returns normally, Unity run with -quit exits 0 (and without -quit or Exit it never exits at all), and a runner that checks only the exit code reports a green milestone over a player that does not exist. Read BuildReport.summary.result and call EditorApplication.Exit yourself, and remember that -quit kills anything asynchronous the moment the method returns, so a build step that yields is cut off half way.`,
    map:`unity -batchmode -executeMethod is godot --headless -s, and EditorApplication.Exit is SceneTree.quit.` } });
INTERVIEW('planning-and-milestones',{
  junior:[
    { q:`What is a milestone exit criterion?`,
      a:`The observable condition that says the milestone is done, stated before the work starts. Not a feature count but an answer: the loop is voluntarily replayed by matched testers, the slice produced cost-per-unit data, the target device holds frame rate at the worst case. Without one, a milestone ends when the date arrives.`,
      follow:`Your exit criterion is not met and the date is here. What do you do?`,
      red:`Defines the exit criterion as the feature list being complete.` },
    { q:`Why is a milestone a question rather than a tally?`,
      a:`Because the point of the milestone is to retire a risk or settle a decision, and a tally of features does neither. A milestone framed as a question forces the team to say what they will know afterwards that they do not know now, which also exposes milestones that answer nothing.`,
      follow:`What question would your alpha milestone answer?`,
      red:`Treats milestones purely as publisher deliverables with content counts.` }
  ],
  mid:[
    { q:`Estimate a feature you have never built. How?`,
      a:`Break it until the pieces resemble work the team has done, estimate those as ranges rather than points, and add the unknowns as explicit risk items with their own test. Name what would make the high end happen. Then check the estimate against the last comparable feature’s actual cost, because teams estimate optimistically by default.`,
      follow:`Your range is one week to six. How do you communicate that usefully?`,
      red:`Gives a single number and a confident tone.` },
    { q:`Where does the buffer go and who is allowed to spend it?`,
      a:`Explicit and visible at the project level, owned by the producer, not hidden inside each task where it gets consumed silently. Spending it is a decision with a reason, recorded. Buffers hidden in estimates are always spent, because work expands to fill them and nobody sees the erosion until the end.`,
      follow:`Half the buffer is gone at the halfway point. Is that fine?`,
      red:`Pads each task individually and calls that the buffer.` },
    { q:`What is the critical path and how do you find it?`,
      a:`The chain of dependent work where any slip moves the launch date. Find it by mapping dependencies rather than by asking who is busy, and check which items are waiting on a validated result rather than on effort. Protect it by scheduling the riskiest items on it first and keeping parallel work off it.`,
      follow:`Something not on the critical path slips by three weeks. Does it matter?`,
      red:`Identifies the critical path as whatever the biggest team is working on.` }
  ],
  senior:[
    { q:`The date is fixed and the scope will not fit. Walk me through the conversation.`,
      a:`Bring the number, not the worry: measured cost per unit, remaining capacity, the gap. Then bring the pre-agreed cut list in risk order and ask for a decision between cutting scope, moving the date and lowering quality, naming which of the three the organisation has fixed. Do it early, because the options shrink every week.`,
      follow:`They refuse all three and ask for more hours. How do you respond?`,
      red:`Commits to the date and plans to make it up with overtime.` },
    { q:`The riskiest system is scheduled last. What do you do?`,
      a:`Pull a testable version of it forward even in crude form, so the assumption gets settled while direction changes are still affordable. If the full system cannot move, build a proxy that answers the same question. Then reorder the dependent work so it is not all bet on an untested result.`,
      follow:`Pulling it forward costs three weeks now. How do you justify that?`,
      red:`Leaves the order alone because the dependencies say it must be last.` },
    { q:`A milestone misses. How do you replan?`,
      a:`First establish whether the estimate was wrong or the work changed, because the remedies differ. Re-derive the remaining plan from the new actual cost per unit rather than reapplying the old numbers with more optimism. Take the cuts from the agreed list, restate the exit criteria, and say plainly what the team now knows that it did not.`,
      follow:`The same area misses again next milestone. What does that tell you?`,
      red:`Reschedules the same plan later and assumes the team will catch up.` }
  ] });

T('quality-and-build-health',{ d:'studio', t:'Quality assurance and build health', tag:'A game that cannot be played cannot be tested. Keep a build that runs, and triage bugs by whether they block evidence.',
  what:`Keeping the game playable enough to learn from: a regular playable build, bug triage by severity and by whether a bug blocks testing, regression tracking back to the change that caused it, and technical debt measured against how fast the team can still iterate.`,
  why:[`A broken build stops the evidence loop, and the evidence loop is the design process.`,`Bugs that block the core loop matter more than cosmetic bugs, yet the opposite is often prioritised.`,`Regressions quietly erase work that was already validated.`],
  think:{ q:[`Can a designer get a playable build today?`,`Which bugs block the core loop or a specific test?`,`What regressed since the last known-good build, and which change caused it?`,`What technical debt is slowing iteration right now?`],
    trade:[`Cleaning everything is slow. Ignoring debt is slower.`,`Fixing and adding at once increases risk. A short freeze protects the next test.`],
    traps:[`Prioritizing cosmetic bugs over blocking ones.`,`No build cadence, so testing waits on a lucky merge.`,`No regression check, so the same bug returns.`,`It works on my machine.`,`Unity scenes reference assets by the GUID stored in each asset’s .meta file, so a missing or regenerated meta file breaks references across the project on the next pull.`],
    good:[`A playable build on a known cadence.`,`A known-broken list the testers understand.`],
    bad:[`Testers cannot reach the new system.`,`The same bug returns after every milestone.`] },
  how:[`Keep a named playable build and a cadence for producing it.`,`Triage bugs as blocker, loop, or cosmetic, and fix blockers first.`,`Log regressions with the change that caused them.`,`Budget debt paydown against iteration speed, not against taste.`],
  ai:{ yes:[`Cluster crash and error logs and draft a triage list.`,`Summarize a regression report and link symptoms to likely causes.`,`Write test cases for a specific rule or system.`],
       no:[`Decide what ships with a known defect.`] },
  prompts:[{l:'Triage pass',p:`Here are our open bugs with severity and area: [LIST]. Our current test goal is: [GOAL]. Order the list by whether each bug blocks the goal or the core loop, then by severity. Name any bug marked cosmetic that blocks evidence.`},{l:'Regression hunt',p:`Between build [A] and build [B], these changes landed: [CHANGES]. These symptoms appeared: [SYMPTOMS]. Propose the most likely causes in order, and the smallest check for each to confirm or rule it out.`}],
  verify:[`Is there a playable build right now?`,`Is every blocker assigned and tracked?`,`Is the latest regression linked to a change?`],
  test:[`Ask a designer to reach the newest system in a build. If they cannot, the build has failed before any player sees it.`],
  rel:[['playtesting','A test needs a build that reaches the thing being tested.'],['iteration-and-evidence','Build health is what keeps iteration possible.'],['risk-and-dependencies','Unstable foundations are a risk you must retire early.'],['ai-for-playtest-analysis','Clean builds make AI analysis of logs and replays meaningful.']] });
TECH('quality-and-build-health',[
  {n:'Playable build cadence', how:`A build that runs on a known schedule, named and available to testers.`, fit:`Any project doing regular playtests.`, cost:`Engineering time to keep it green.`, alt:`A daily automated build with a known-broken list.`},
  {n:'Blocker-first triage', how:`Classify bugs by whether they block the current test goal or the core loop, then by severity.`, fit:`Small teams with more bugs than time.`, cost:`Cosmetic complaints stay open longer.`, alt:`A rotating bug budget alongside feature work.`},
  {n:'Regression log', how:`Every reappearing bug recorded against the change that caused it.`, fit:`Projects with frequent merges.`, cost:`Overhead on every fix.`, alt:`A smoke test that exercises the core loop before testers see a build.`}
]);
ENGINE('quality-and-build-health',{
  godot:{ term:`Godot ships no test framework, so build health is a headless run plus an addon. GdUnit4 suites run from the command line beside the level gate, and the engine’s own leaked-instance report at exit is the cheapest regression signal the project has.`,
    api:['extends GdUnitTestSuite','assert_int() / assert_that() / assert_array()','auto_free() for nodes a test creates','godot --headless running the GdUnit4 command line runner','ObjectDB instances leaked at exit, printed on a debug build','push_error() and SceneTree.quit(exit_code)'],
    snippet:`extends GdUnitTestSuite            # res://test/test_wave_budget.gd

func test_wave_never_exceeds_budget() -> void:
\t# WaveBuilder is your own Node class (class_name WaveBuilder), not the Director autoload
\tvar builder: WaveBuilder = auto_free(WaveBuilder.new())   # auto_free or the run leaks
\tadd_child(builder)
\tbuilder.tension = 1.0
\tvar wave: Array = builder.build_wave(120)
\tvar cost := 0
\tfor e in wave:
\t\tcost += e.budget_cost
\tassert_that(wave).is_not_empty()
\tassert_int(cost).is_less_equal(120)`,
    pitfall:`Letting tests create nodes and never free them. A Node that is not in the tree and not freed stays in the ObjectDB, and the run ends with a leaked instances warning that nobody reads because it is not a failure. The suite stays green while the thing it guards drifts, and the same leak in gameplay code is the memory climb someone chases a month later. Wrap every node a test creates in auto_free, and treat the leak report at exit as a failing check in the runner.`,
    map:`GdUnit4's assert_that is NUnit’s Assert.That under the Unity Test Framework, and auto_free is a teardown Object.DestroyImmediate.` },
  unity:{ term:`The Unity Test Framework runs from the same batchmode entry point as the build. EditMode tests are fast and prove logic, PlayMode tests prove the scene, and only a development build on the device proves the thing a tester will open.`,
    api:['unity -batchmode -runTests -testPlatform EditMode -testResults results.xml','[Test] / [UnityTest] in an asmdef with Test Assemblies ticked','UnityEngine.TestTools: LogAssert, yield return null','SceneManager.LoadSceneAsync() inside a [UnityTest]','LogAssert.NoUnexpectedReceived()','BuildOptions.Development for the device smoke run'],
    snippet:`public class WaveBudgetTests {          // Tests/Editor asmdef (Edit Mode), tests-only
    [Test]
    public void WaveNeverExceedsBudget() {
        var tuning = ScriptableObject.CreateInstance<DirectorTuning>();
        var wave = WaveBuilder.Build(tuning, budget: 120);   // your own static class, not Director
        Assert.That(wave.Sum(e => e.BudgetCost), Is.LessThanOrEqualTo(120));
    }
}

public class ArenaSmokeTests {          // Tests/PlayMode asmdef; "Arena" must be in Build Settings
    [UnityTest]
    public IEnumerator ArenaSceneLoadsWithNoErrors() {
        yield return SceneManager.LoadSceneAsync("Arena");
        yield return null;
        LogAssert.NoUnexpectedReceived();   // an error log fails this test
    }
}`,
    pitfall:`Reading a green EditMode suite as a healthy build. EditMode tests run inside the editor’s domain, where every UNITY_EDITOR block compiles, nothing is stripped and no scene has to load, so the suite stays green while the player build fails to link, a scene is missing from Build Settings, or a serialized reference is empty. Keep a PlayMode test that loads the real scene and asserts on the log, and put a development build on the target inside the same gate.`,
    map:`The Unity Test Framework in batchmode is godot --headless running a GdUnit4 suite, and LogAssert is scanning the headless log for push_error output.` } });
INTERVIEW('quality-and-build-health',{
  junior:[
    { q:`How do you order a bug list?`,
      a:`By whether the bug blocks the evidence you need, then by severity. Blockers that stop the build or the core loop first, then bugs that block a specific test, then everything else. Cosmetic bugs look tempting because they are cheap, and fixing them ahead of blockers is the most common triage failure there is.`,
      follow:`A cosmetic bug is blocking evidence. Give me an example.`,
      red:`Orders purely by severity label, or by which bugs are quickest to close.` },
    { q:`Why does a broken build stop design work?`,
      a:`Because the evidence loop is the design process. No playable build means no playtest, which means no evidence, which means the next decision is made on opinion. It also hides regressions, because nobody can tell what still works. Build health is a design dependency, not an engineering convenience.`,
      follow:`The build is broken and a test is booked for tomorrow. What do you do?`,
      red:`Treats build breakage as an engineering issue that does not affect design.` },
    { q:`What is a regression, and how do you track one?`,
      a:`Something that worked in a known-good build and no longer does. Track it by identifying the last good build, listing the changes between the two, and narrowing to the change that caused it. Log the regression against that change, because regressions quietly erase work that was already validated.`,
      follow:`The same bug returns after every milestone. What is missing?`,
      red:`Files it as a new bug each time with no reference to the previous build.` }
  ],
  mid:[
    { q:`Designers cannot reach the new system in the build. Whose problem is it?`,
      a:`Everyone’s, and it is urgent, because the system cannot be tested and therefore cannot be validated. Fix reachability first with a debug shortcut, a cheat command or a test scene, before any polish on the system itself. A system that testers cannot reach has failed before a player ever sees it.`,
      follow:`Debug shortcuts change the state the player would arrive in. How do you keep the test honest?`,
      red:`Waits for the progression work to be finished before testing the system.` },
    { q:`Who decides what ships with a known defect, and on what basis?`,
      a:`A named human, usually the product or discipline lead, not a tool and not the bug count. The basis is impact on the player’s experience and on the evidence loop, plus the risk of the fix so late. Record the decision, the reasoning and the mitigation. Known-broken lists must reach testers so they do not file it again.`,
      follow:`The defect only affects two percent of sessions but corrupts saves. How does that change the call?`,
      red:`Defers to a severity threshold with no human judgement attached.` },
    { q:`Give me a cosmetic-looking bug that blocks evidence.`,
      a:`A missing or wrong tell on an enemy attack, a UI element rendering behind another so the resource is unreadable, audio not firing on a hit. Each is filed as cosmetic and each destroys the readability the test depends on. The triage question is whether the bug changes what the player can perceive or decide.`,
      follow:`How would you get that reclassified without fighting the triage process?`,
      red:`Accepts the cosmetic label because it does not affect functionality.` }
  ],
  senior:[
    { q:`The build is red three days a week. What do you change first?`,
      a:`Make breakage visible and cheap to fix: a fast pre-merge check that runs the things that break, a named owner for a red build, and a rule that the fix comes before new work. Then look at what breaks repeatedly, because it is usually one integration point or one area with no test coverage. Cadence follows reliability.`,
      follow:`The pre-merge check now takes forty minutes and people route around it. What do you do?`,
      red:`Adds a build policy document, or blames individuals for breaking it.` },
    { q:`How do you budget technical debt paydown?`,
      a:`Against iteration speed rather than taste. Measure what is slowing the team: build times, how long a tuning change takes to see in play, how often a change breaks something unrelated. Pay down the debt that sits on that path, in a standing share of each milestone, and leave ugly code that costs nobody anything.`,
      follow:`An engineer wants to rewrite a system that is ugly but not slowing anyone down. How do you respond?`,
      red:`Schedules a refactoring milestone with no measure of what it buys.` }
  ] });

T('design-critique-and-feedback',{ d:'studio', t:'Design critique and feedback', tag:'Critique the design against its intent, in a room that keeps the owner in charge, and give designers feedback they can act on.',
  what:`Design critique is a structured conversation about a design, held to make the design better while the owner still owns it. It covers three jobs: running a review of a feature or a build, critiquing a game someone else made so a team can learn from it, and giving feedback to a designer you mentor. The common rule is to critique the design against its stated intent, not the person and not your taste. A review with no stated intent is an argument about preferences. Pixar's Braintrust, described by Ed Catmull in Harvard Business Review, is a well-known model of the room: a group of directors gives notes on work in progress, the notes are not mandatory and the group has no authority, so the director decides what to do with them. Use that as a lens for the room, not a law. The observation, inference and preference split, the teardown sheet and the order of mentee feedback below are this site's own working method. It sits next to the design-review checklist, which lists what to check, and to lead-feedback-performance, which covers feedback and performance management in general. This topic is the design-specific craft between them.`,
  why:[`A review without a stated intent turns into taste. The loudest or most senior opinion wins and the designer learns nothing they can reuse.`,`If critics can order changes, the owner stops owning the design. The design becomes the average of the room and nobody is accountable for it.`,`Feedback can backfire. Kluger and DeNisi (Psychological Bulletin, 1996) pooled 607 effects from 131 papers (23,663 observations). Feedback raised performance on average (d = .41), yet over 38 percent of the effects were negative. Effects shrank as attention moved from the task toward the self: feedback that threatened self-esteem averaged d = .08 in the top quartile against .47 in the bottom, and praise averaged .09 against .34 without it. Feedback that gave the correct solution or showed the rate of progress (velocity) helped. Effects were also weaker on complex tasks (.03 against .55) and stronger with a goal set (.51 against .30), though those two were only near significance. Lab and workplace tasks, not design work.`,`A junior designer who hears only "not great" or only "looks good" cannot improve. Specific feedback tied to the goal is how a design skill is passed on.`,`Teardowns of shipped games are cheap teaching when the critique is a method. Without one, the team collects opinions about a game and reuses none of them.`],
  think:{ q:[`What is this design trying to do? Say it in a sentence the owner agrees with before any critique.`,`What do I observe, what do I infer, and what do I prefer? Are they kept apart in what I say?`,`Is this a problem with the design, the build, or the test?`,`What would change my mind? What would the owner need to see?`,`Who decides? Am I giving a note or an order?`,`Does this note point at the work or at the person? Would it read the same about someone else's design?`,`For a mentee: what is the one habit worth changing this week?`],
    trade:[`Candid review finds problems early and hurts if the room is not safe. A gentle one is safe and lets problems ship.`,`Owner-decides keeps accountability and means good notes are sometimes ignored.`],
    traps:[`Solutioneering: proposing a fix before the problem is agreed. The owner defends the design instead of understanding the problem.`,`Reviewing in a meeting with ten people and no written intent.`,`Praise sandwiches that hide the point.`,`Critiquing a mentee's design by rewriting it. They learn your answer, not the reasoning.`,`Copying a hit's features in a teardown without saying which of its decisions your game can afford.`,`Feedback to a mentee only when something has gone wrong.`],
    good:[`The owner leaves with a short list of problems, each tied to the intent, and decides what to do with them.`,`A mentee can say what they will do differently next time and why.`],
    bad:[`The review ends with the loudest person's preference as the new plan.`,`The notes cannot be told from taste.`] },
  how:[`Before the review, the owner writes the intent: the goal, the player, the pillar it serves, what a success looks like. Circulate it with the build or document.`,`Reviewers play or read alone first and write notes in three columns: what I saw, what I think it means, what I would try. Write every note about the work and its effect on the player, in the third person about the design. Send the notes before the meeting.`,`Open the meeting by having the owner restate the intent, then take the problems one at a time. Ask questions before offering fixes: what were you hoping the player would do here?`,`Keep fixes for the end and offer them as options. The owner decides, and writes down what they will change, what they will test, and what they will leave.`,`For a teardown of another game, use a fixed sheet: the core loop, the pillars you can infer, three decisions that work and why, three that cost the game and why, and what you would steal, adapt or avoid for your game.`,`For a mentee, compare this piece of work with their own earlier version so they see the direction of progress (in the meta-analysis feedback showing the rate of change raised performance). Do not write the assessment as a verdict on them: feedback that threatened self-esteem, and generic praise, had the weakest effects. When you praise, name the specific choice and what it did for the player.`,`For a mentee, give feedback near the moment, about one thing, in this order: the goal they had, what you saw, the effect on the player, and a question about what they would try. Then agree one habit to watch.`,`Note the pattern across reviews. If three designs miss for the same reason, teach that reason to the team, not to one person.`,`Track the outcome. Did the change made after a review fix the problem? Reviews that never check this drift into ritual.`],
  ai:{ yes:[`Draft an intent statement from a design doc, for the owner to correct.`,`Reformat raw notes into observation, inference and suggestion, and flag the ones that are only preference.`,`Produce a teardown sheet from your notes on a game.`,`Rehearse a hard feedback conversation and suggest clearer wording.`],
       no:[`Decide whether the design meets its intent. That needs playing it.`,`Give a mentee the feedback for you. It has to come from someone who knows the work.`] },
  prompts:[{l:'Notes cleaner',p:`Here are my raw review notes on a design whose intent is: [INTENT]. Sort every note into observation, inference or preference. For each inference, say what evidence in the build would support it. Rewrite the preferences as questions. Mark any note that proposes a fix without naming the problem.`},{l:'Feedback rehearsal',p:`I need to give feedback to a designer I mentor. Their goal was [GOAL]. I saw [OBSERVATIONS]. The effect on the player was [EFFECT]. Draft the conversation as four steps: goal, what I saw, the effect, and a question for them to answer. Keep it under 150 words, and make the question one that cannot be answered with yes.`}],
  verify:[`Is the intent written and agreed before the critique starts?`,`Are notes separated into observation, inference and preference?`,`Did the owner leave with their own decision list, not the room's?`,`Was the outcome of the last review checked?`,`Does every note name the design or the player's experience, and none the designer's ability?`],
  test:[`After a review, ask the owner to say the top three problems and their reasons. If they cannot, the review did not land.`,`Read your last ten notes. How many describe what a player would do, and how many describe what you like?`,`Score your last ten notes: how many are about the work, and how many are about the person or generic praise? The meta-analysis links the second kind to worse results.`,`Ask a mentee what they took from the last feedback. A different answer from yours shows a gap in what you said.`],
  rel:[['lead-feedback-performance','The general craft of feedback; this topic applies it to designs.'],['lead-one-on-ones','The place where a mentee\'s growth is followed up between reviews.'],['design-documents','The intent statement and the decision record the review reads and writes.'],['learning-from-success','The teardown method for critiquing a shipped game.']],
  facts:[{claim:`In Ed Catmull's Harvard Business Review article How Pixar Fosters Collective Creativity (2008), a brain trust of directors offers advice on works in progress; the production's leaders decide what to use, there are no mandatory notes, and the brain trust has no authority.`,asOf:'2026-09-30',src:'https://hbr.org/2008/09/how-pixar-fosters-collective-creativity'},{claim:`Kluger and DeNisi (Psychological Bulletin 119, 254-284, 1996) meta-analysed 607 effect sizes from 131 papers (23,663 observations). Feedback interventions raised performance on average (weighted d = .41) but over 38 percent of effects were negative, a spread not explained by sampling error. They propose that effects fall as feedback moves attention from the task to the self. Moderators: discouraging feedback, praise and threats to self-esteem weakened effects; feedback giving the correct solution or a rate of change strengthened them. Mostly lab and workplace tasks, not design work, and some moderators were significant only after exclusions. The study does not test critique of games, and the Braintrust practice has no controlled test.`,asOf:'2026-09-30',src:'https://scholars.huji.ac.il/node/1802'}] });
TECH('design-critique-and-feedback',[
  {n:'Intent statement', how:`The owner writes the goal, player, pillar served and success measure before the review and circulates it.`, fit:`Every design review.`, cost:`Forces the owner to be clear about a design that may not be.`, alt:`A one-line goal for a small change.`},
  {n:'Observation, inference, preference notes', how:`Each note is tagged as what was seen, what it means, or what the reviewer likes.`, fit:`Any critique with more than two reviewers.`, cost:`Slower than free-form talk.`, alt:`Ask reviewers to phrase preferences as questions.`},
  {n:'Teardown sheet', how:`A fixed sheet for a shipped game: loop, inferred pillars, three decisions that work, three that cost, and what to steal, adapt or avoid.`, fit:`Learning from another game together.`, cost:`Can become a list of features without your own constraints.`, alt:`One decision studied in depth.`},
  {n:'Feedback to a mentee', how:`Goal, what you saw, the effect on the player, a question. One habit at a time.`, fit:`Regular mentoring.`, cost:`Needs time and observation close to the work.`, alt:`A written note after playing their build together.`}
]);
ENGINE('design-critique-and-feedback',{
  godot:{ term:`Critique needs moments, not memories. A hotkey that stamps the build version, the scene and the time into a file means the note "the second room felt slow" points at a place anyone can return to.`,
    api:['Node with _unhandled_input()','InputEventKey','FileAccess.open() and store_csv_line()','ProjectSettings.get_setting()','Time.get_ticks_msec()','SceneTree.current_scene'],
    snippet:`extends Node   # autoload: ReviewStamp. F8 marks a moment for the review.
const PATH := "user://review_notes.csv"

func _unhandled_input(event: InputEvent) -> void:
\tvar k := event as InputEventKey
\tif k and k.pressed and not k.echo and k.keycode == KEY_F8:
\t\tstamp()

func stamp() -> void:
\tvar mode := FileAccess.READ_WRITE if FileAccess.file_exists(PATH) else FileAccess.WRITE
\tvar f := FileAccess.open(PATH, mode)
\tif f == null:
\t\treturn
\tf.seek_end()
\tvar scene := get_tree().current_scene
\tf.store_csv_line(PackedStringArray([
\t\tstr(ProjectSettings.get_setting("application/config/version", "dev")),
\t\tscene.scene_file_path if scene else "none",
\t\tstr(Time.get_ticks_msec() / 1000)]))`,
    pitfall:`Opening the notes file with FileAccess.WRITE every time. WRITE truncates, so each stamp erases the last and the file always holds one row. Use READ_WRITE on an existing file and seek to the end, or the file is lost as the reviewer works.`,
    map:`A Godot autoload with an F8 hotkey is a Unity MonoBehaviour that reads the Input System each frame and appends to a file.` },
  unity:{ term:`The same stamp as a small component. It appends a row with the version, scene and time when F8 is pressed, so a reviewer can note a moment without breaking play.`,
    api:['UnityEngine.InputSystem.Keyboard.current','wasPressedThisFrame','File.AppendAllText()','Application.persistentDataPath','Application.version','SceneManager.GetActiveScene()'],
    snippet:`using System.IO;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.SceneManagement;

public class ReviewStamp : MonoBehaviour {
    void Update() {
        var kb = Keyboard.current;
        if (kb != null && kb.f8Key.wasPressedThisFrame) Stamp();
    }

    public static void Stamp() {
        string path = Path.Combine(Application.persistentDataPath, "review_notes.csv");
        string row = $"{Application.version},{SceneManager.GetActiveScene().name},{Time.realtimeSinceStartup:F0}\\n";
        File.AppendAllText(path, row);
    }
}`,
    pitfall:`Reading Input.GetKeyDown in a project set to the Input System package only. Many Unity 6 project templates use the new package, and when Active Input Handling is set to it alone the old Input class throws an InvalidOperationException every frame. Use Keyboard.current, and null-check it because there is no keyboard on a phone.`,
    map:`A Unity component with Keyboard.current is a Godot autoload with _unhandled_input, and File.AppendAllText is FileAccess in READ_WRITE mode at the end.` },
  note:`A stamp is only a pointer. The review still needs the intent and the notes. What the file gives you is a way to say "version 0.4, the second room, six minutes in" and have every reviewer look at the same thing.` });
INTERVIEW('design-critique-and-feedback',{
  junior:[
    { q:`What is the difference between critiquing a design and giving an opinion?`,
      a:`A critique measures the design against its stated intent and points to what the player would do. An opinion is what you like. Both can be useful, but they must be told apart so the owner knows which one to weigh.`,
      follow:`Give an example of the same comment written both ways.`,
      red:`Says a critique is just being honest about what you think.` },
    { q:`Someone says your feature is confusing. What do you do?`,
      a:`Ask what they were trying to do and where they got stuck, then check whether others get stuck at the same point. Treat it as data about the design, not an attack. Decide after you have seen it more than once.`,
      follow:`What if only one person found it confusing?`,
      red:`Defends the design before hearing where they got stuck.` }
  ],
  mid:[
    { q:`How do you run a design review so the owner stays in charge?`,
      a:`The owner writes the intent first. Reviewers send notes beforehand, sorted into observation, inference and preference. In the room the owner restates the goal and the group deals with problems before fixes. The owner ends by saying what they will change, test and leave.`,
      follow:`What do you do when a senior person starts giving orders?`,
      red:`Lets the meeting settle on whatever the most senior person says.` },
    { q:`You review a junior's design and see a serious flaw. How do you give the feedback?`,
      a:`Start from their goal, say what you saw and the effect on the player, then ask what they would try. Give the flaw in one sentence, not a list. Do not rewrite it for them. Agree on one habit and look at the next design for it.`,
      follow:`They disagree. What next?`,
      red:`Fixes the design themselves to save time.` },
    { q:`How do you critique a shipped game for a team without producing a list of features to copy?`,
      a:`Use a fixed sheet: the loop, the pillars you can infer, three decisions that work and three that cost, then what to steal, adapt or avoid for our game given our constraints. The last step is the point, because it forces the team to say what they can afford.`,
      follow:`Which game do you find hardest to tear down, and why?`,
      red:`Lists what the hit game has and recommends adding it.` }
  ],
  senior:[
    { q:`Your team's reviews have become polite and nothing changes. What do you do?`,
      a:`Look for why. Is the intent unclear, so there is nothing to test against? Is it unsafe, so people hold back? Do notes ever change a design? Fix the cause: written intent, notes sent beforehand, a rule that the owner decides and reports what they did. Check the outcome of last month's reviews in the next one.`,
      follow:`How do you tell safe from soft?`,
      red:`Adds more meetings.` },
    { q:`How do you grow designers through feedback without making them dependent on you?`,
      a:`Give the reasoning, not the answer. Ask what they would try before saying what you would. Name the pattern across their work so they can spot it themselves. Move from telling to asking as they grow, and let them run reviews and give feedback to others.`,
      follow:`How do you know it is working?`,
      red:`Considers being the person everyone brings designs to a success.` },
    { q:`Two senior designers give you opposite critiques of the same feature. What now?`,
      a:`Return to the intent. Which critique is about the goal, and which about taste? Ask each what they saw players do. If both are about the goal, that is a real trade-off, and the owner decides with the evidence. If it is taste, say so and let it go.`,
      follow:`When does it become a pillar question?`,
      red:`Averages the two opinions.` }
  ] });
