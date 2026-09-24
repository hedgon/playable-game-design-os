/* =====================================================================
   CORE GAMEPLAY
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'core', lens:'design', t:'Core Gameplay', short:'Loop, decisions, risk, skill, agency, failure', color:'var(--d-core)',
    sum:`The thing the player does over and over. If the core interaction is not compelling on its own, no amount of progression, content or narrative rescues it. Fix the loop before you multiply it.`,
    links:[['systems','Systems give the loop its variables: what changes between one iteration and the next.'],['ux','Input, readability and feedback are the loop as the player physically meets it.'],['presentation','Game feel lives at the seam between the loop and presentation.'],['production','The loop is the first thing you prototype and the thing you playtest most.']] });

T('core-loop',{ d:'core', t:'The core loop', tag:'Action → Feedback → Decision → Consequence → New situation. Every link must hold.',
  what:`The shortest cycle of play the player repeats: they act, the game responds legibly, they decide what to do next based on that response, the decision has consequences, and the consequences create a new situation that demands a new action. When one link is weak the loop leaks and no amount of content refills it.`,
  why:[`Players spend most of their time in the core loop. It is the game.`,`Every other system (progression, content, narrative) multiplies the loop. Multiplying a weak loop multiplies weakness.`,`Loop failures have characteristic symptoms, which makes them diagnosable.`],
  think:{ q:[`What does the player do most often, physically? Is that the fantasy verb?`,`After an action, can the player say what happened and why?`,`Is there a decision, or a single obvious best move?`,`Does the decision change anything the player will meet later?`,`Does the situation after the loop differ from the one before it?`],
    trade:[`Fast loops (seconds) reward feel and reflex. Slow loops (minutes) reward planning. Each attracts different players.`,`More decision density increases engagement and cognitive load.`],
    traps:[`Describing the loop as a flowchart of systems (gather, craft, fight, upgrade) rather than as what the player experiences.`,`Assuming a loop is fun because it is genre standard.`],
    good:[`A stripped prototype (grey boxes, no progression) is voluntarily replayed.`],
    bad:[`Players say "I will keep going to unlock X" rather than "I want to do that again".`] },
  how:[`Write the loop in five sentences from the player's point of view, one per link.`,`Build the loop alone: no progression, no content variety, no story. Grey boxes.`,`Playtest it. If players do not voluntarily repeat it, diagnose which link is weak using the Core Loop Diagnostic.`,`Fix one link, test again. Only when the bare loop is replayed do you start multiplying it.`],
  ai:{ yes:[`Rewrite your loop description from the player perspective and flag missing links.`,`Generate variations of one link (e.g., five alternative decision structures) to test.`,`Build the grey-box prototype quickly.`,`Analyze playtest notes for symptoms of each weak link.`],
       no:[`Decide the loop is fun. Only repetition by players shows that.`,`Add systems to compensate for a weak link before the link is fixed.`] },
  prompts:[{l:'Loop link audit',p:`Act as a skeptical systems designer. Here is our core loop as the player experiences it: [FIVE SENTENCES]. For each link (action, feedback, decision, consequence, new situation), rate its strength, state the evidence you are using from my description, and name the symptom a playtest would show if it were weak. Then propose 3 variations for the weakest link, each with the player decision it creates, the emotion intended, the likely failure mode, and the observable signal that would validate it. Do not recommend one yet.`},
    {l:'Prototype build',p:`Build a minimal playable prototype of this loop in [ENGINE/HTML]: [LOOP]. Grey boxes only, no menus, no progression, no audio beyond a single feedback tone. Expose these tuning values as on-screen sliders: [VALUES]. Log every player action with a timestamp to a downloadable text file so I can analyze repetition and decision variety.`}],
  verify:[`Did it rate links based on my description or on genre assumptions?`,`Are the proposed variations mechanically distinct, or the same idea reskinned?`,`Does the prototype actually isolate the loop, or did it sneak in progression?`],
  test:[`Do players repeat the loop voluntarily when nothing rewards them for it?`,`Can they explain what happened after an action?`,`Do different players make different choices at the decision point?`,`Do they notice the situation changed?`],
  rel:[['decisions','The decision link is where most loops fail.'],['feedback-and-affordance','Feedback is the link UX owns.'],['game-feel-and-juice','Action feel is the loop as the body experiences it.'],['prototyping','The loop is the first prototype.'],['systemic-design','Systems supply the new situation.']] });
TECH('core-loop',[
  {n:'Loop mapping', how:`Write the loop as action → feedback → decision → consequence → new situation and mark the weak link.`, fit:`Diagnosing why repetition bores or why actions feel weightless.`, cost:`None worth mentioning. It is the cheapest diagnostic you have.`, alt:`Pair with the Core Loop diagnostic view.`},
  {n:'Grey-box minimal prototype', how:`Build only the core interaction with placeholder art and test voluntary repetition.`, fit:`Before investing in content, art or meta systems.`, cost:`Discipline to not add scope. A boring grey box may kill an idea you love.`, alt:`If the bare loop is not replayable, no production value will save it.`},
  {n:'Feedback timing windows', how:`Return a perceivable response within roughly 100 ms. Layer visual, audio and haptic feedback.`, fit:`Any real-time action loop.`, cost:`Later, richer feedback improves feel but must not delay the response.`, alt:`See Game feel and juice for the feedback catalogue.`},
  {n:'Loop layering (seconds / minutes / sessions)', how:`Nest loops: a ~3-second action loop inside a ~30-second encounter inside a multi-minute goal.`, fit:`Designing goals at three horizons and pacing.`, cost:`Imbalance between layers (great moment, aimless hour) is common.`, alt:`Audit each layer with its own reward and stopping point.`}
]);
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
INTERVIEW('core-loop',{
  junior:[
    { q:`What is a core loop, and what is the core loop of the last game you shipped or studied?`,
      a:`Name the repeated unit: action, feedback, decision, consequence, new situation. Then walk one concrete iteration of a real game in those five beats. Say how long one iteration takes. Say what changes between iteration one and iteration two, because a loop with nothing changing is a chore.`,
      follow:`Now name the loop one layer out. What is the three-minute loop that the three-second loop feeds?`,
      red:`Describes the game's feature list, or answers with a genre label ("it's a roguelike") instead of a repeated unit of play.` },
    { q:`Where does feedback belong in the loop, and how late is too late?`,
      a:`Feedback closes the loop: without it the player cannot learn what their action did. Immediate confirmation should land inside roughly 100 ms so the action feels connected. The consequence can resolve later, but the acknowledgement cannot. Give an example of a game where the acknowledgement and the outcome are deliberately split.`,
      follow:`What do you do when the real outcome takes two seconds to compute or has to come back from a server?`,
      red:`Treats feedback as visual polish added at the end, or cannot distinguish acknowledging the input from resolving the outcome.` },
    { q:`In an engine of your choice, where would you actually put the loop code?`,
      a:`Input sampled every frame so no press is dropped, rules resolved on the fixed step so the same action resolves the same way on any machine, and the consequence raised as an event rather than called inline. In Unity that is Update plus FixedUpdate plus a UnityEvent. In Godot that is _process, _physics_process and a signal.`,
      follow:`What breaks if you sample the attack button in FixedUpdate?`,
      red:`Puts everything in Update or _process and does not know why frame-rate independence matters.` }
  ],
  mid:[
    { q:`A playtest says the game is repetitive. How do you find out which part of the loop is at fault?`,
      a:`Do not add content. Instrument one iteration: is the action varied, is the feedback readable, is there a decision with a real trade-off, does the consequence change the next situation. Watch six players and count decisions per minute. Repetitiveness is almost always a missing decision or an unchanging situation, not a missing feature.`,
      follow:`You find the decision exists but players always pick the same option. Now what?`,
      red:`Jumps straight to "add more enemy types" or blames the art.` },
    { q:`How do you prototype a core loop so the test is actually cheap?`,
      a:`Strip to the single verb and the single consequence. Grey boxes, placeholder audio, no progression, no menu. Test the one question that would kill the idea. Say what your kill criterion was on a real prototype, and whether you honoured it.`,
      follow:`What was the smallest prototype you have built that changed a decision?`,
      red:`Describes a vertical slice and calls it a prototype, or has never killed one.` },
    { q:`How does the loop change when the game is online and the server is authoritative?`,
      a:`The acknowledgement stays local and immediate, the resolution moves to the authority. That means prediction, reconciliation and a visible rule for what happens when the two disagree. Name the correction you chose and what it looks like to the player when it fires.`,
      follow:`What does your loop feel like at 200 ms of latency, and what did you change to keep it honest?`,
      red:`Says "we just send the input to the server" with no account of the wait the player experiences.` }
  ],
  senior:[
    { q:`You inherit a game whose loop is fine for an hour and dead by hour three. Where do you look?`,
      a:`The three-second loop is working and the longer loops are not. Check whether the situation actually changes across sessions, whether the decision space widens with mastery, and whether the systems feeding the loop generate new combinations or only bigger numbers. Separate a content problem from a system problem before spending a single sprint.`,
      follow:`How would you tell a content problem from a system problem with data you can gather this week?`,
      red:`Proposes a progression pass or a battle pass without first showing which loop went flat.` },
    { q:`How do you decide the loop is good enough to build the rest of the game on?`,
      a:`A written hypothesis, matched players, an observable signal and a kill criterion agreed before the test. Good enough means players keep choosing to repeat it without being told to, and can explain why one iteration went differently from the last. Say what you would have done if the signal had not appeared.`,
      follow:`What would have made you cancel it, and who had the authority to make that call?`,
      red:`Cannot name a criterion, or says the team knew it was fun. Enthusiasm is not a signal.` }
  ] });
DIAGRAM('core-loop', { kind:'loop', title:'The core loop: every link must hold',
  steps:[{t:'Action', d:'the player commits to a move'},{t:'Feedback', d:'the game shows what happened'},{t:'Decision', d:'the player picks what next'},{t:'Consequence', d:'the state changes, and it matters'},{t:'New situation', d:'a fresh problem to read'}],
  note:'Break any link and the loop stops teaching or rewarding: no feedback, no learning; no consequence, no decision.' });

T('decisions',{ d:'core', t:'Meaningful decisions', tag:'A decision is meaningful when the options are different, the outcome is uncertain, and the player cares.',
  what:`Sid Meier described a game as a series of interesting decisions. An interesting decision has a real tradeoff (no dominant option), depends on the situation (the right answer changes), and reflects the player (different players choose differently). Decision density is how often the player faces one. Decision weight is how much rides on it.`,
  why:[`Decisions are where agency lives. Remove them and the player is watching, not playing.`,`A dominant option turns a decision into a puzzle with one answer, then into a chore.`,`Depth is measured in meaningful decisions, not in rules.`],
  think:{ q:[`For this choice, what does the player give up by picking each option?`,`Would an expert always pick the same option? Then it is not a decision.`,`Does the player have enough information to reason, and enough uncertainty to feel risk?`,`Does the choice reveal something about the player?`],
    trade:[`More information makes decisions more reasoned and less tense.`,`Frequent decisions raise engagement and fatigue.`],
    traps:[`Offering options that differ in flavor but not consequence.`,`Hiding the tradeoff so the player cannot reason about it (a decision they cannot understand is a guess).`,`Balancing by making everything equal, which erases situational preference.`],
    good:[`Players hesitate, then commit, then look to see if it worked.`,`Players argue about the right choice.`],
    bad:[`Players pick the same option every time, or pick without looking.`] },
  how:[`List the decisions in one loop iteration. For each, write the tradeoff in one sentence. If you cannot, it is not a decision.`,`Check for situational variance: describe two situations where the best choice differs.`,`Check information: what does the player know when choosing? Is it enough to reason, and not enough to be certain?`,`Playtest and log choices. Low variance across players or situations flags a dominant option.`],
  ai:{ yes:[`Enumerate decisions in a rules description and articulate each tradeoff.`,`Search for dominant strategies by simulation or reasoning.`,`Generate situations in which each option would be best.`],
       no:[`Judge whether a decision "feels" meaningful. Hesitation and variance in play show that.`] },
  prompts:[{l:'Dominant option hunt',p:`Here are the rules and numbers for [SYSTEM]: [RULES]. For each decision the player faces, state the tradeoff in one sentence. Then try to break it: find the option an expert would always choose, and the situations, if any, where another option wins. Rank decisions by how likely they are to collapse into a single answer after 10 hours. For the top one, propose the smallest rule change that restores situational variance.`}],
  verify:[`Are tradeoffs stated as real costs, or as flavor differences?`,`Did it actually try to break the system, or affirm that it is balanced?`],
  test:[`Log choices per player per situation. Compute variance.`,`Do players hesitate before choosing? Hesitation is a sign of a real tradeoff.`,`Ask players why they chose. Can they state the tradeoff?`],
  rel:[['core-loop','The decision is one link of the loop.'],['depth-vs-complexity','Depth is decision count, not rule count.'],['risk-reward','Risk/reward is the most common decision shape.'],['builds-and-loadouts','Build choices are slow-horizon decisions.']] });
TECH('decisions',[
  {n:'Tradeoff mapping', how:`For each option, write what the player gives up. Options with no tradeoff are not decisions.`, fit:`Auditing whether your "choices" are real.`, cost:`Design time. Can reveal that your variety is cosmetic.`, alt:`Start here. Cut or merge options with no tradeoff sentence.`},
  {n:'Information design (fog, telegraph, partial knowledge)', how:`Control what the player knows when they choose: hidden values, revealed odds, telegraphed enemy intent.`, fit:`Creating interesting decisions under uncertainty.`, cost:`Opacity feels unfair. Full information removes tension.`, alt:`Reveal enough to reason. Hide enough to matter.`},
  {n:'Dominance analysis', how:`Check whether any option is at least as good as another in every situation. If so, fix, cost or remove it.`, fit:`Balance and depth audits.`, cost:`Only catches strict dominance, not situational imbalance.`, alt:`Follow with pick-rate/win-rate data.`}
]);
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
INTERVIEW('decisions',{
  junior:[
    { q:`What makes a decision meaningful?`,
      a:`The options have to be genuinely different, the outcome uncertain, and the player has to care. Sid Meier's framing is a game as a series of interesting decisions. Add two working tests: the right answer changes with the situation, and different players choose differently.`,
      follow:`Take a decision from a game you know and state its trade-off in one sentence.`,
      red:`Calls any choice a decision, including options that differ only in flavour.` },
    { q:`You balance a set of options so they are all equally strong. Why is that a problem?`,
      a:`Equalising removes situational preference, which is the reason to think at all. What you want is each option winning somewhere specific and losing somewhere else. Equal power with no situational edge turns a decision into a coin flip nobody enjoys.`,
      follow:`How would you make one option best in a specific situation without making it best overall?`,
      red:`Treats equal pick rates across options as the goal of balance.` },
    { q:`How much information should the player have when deciding?`,
      a:`Enough to reason, not enough to be certain. Too much and the choice becomes arithmetic. Too little and it is a guess, and a guess teaches nothing. A decision the player cannot understand is not a decision, however dramatic it looks.`,
      follow:`Where would you deliberately withhold information?`,
      red:`Hides the trade-off to create tension and describes that as depth.` }
  ],
  mid:[
    { q:`Players always pick the same option. Walk me through the investigation.`,
      a:`Log choices per player and per situation and compute the variance. Then separate three causes: one option dominates numerically, the information needed to prefer another is missing, or the situations never actually differ. Each has a different smallest fix, so identify which before touching numbers.`,
      follow:`Variance is high across players and zero within each player. What does that mean?`,
      red:`Buffs the unpopular options by a flat percentage and re-ships.` },
    { q:`How do you measure decision density, and what do you do with the number?`,
      a:`Count decisions per minute from observation, not from the design document. Compare against the intended pace and against what the player's attention can carry. Density raises engagement and fatigue at the same time, so the target depends on the session shape.`,
      follow:`Density is right and players still describe the game as passive. What now?`,
      red:`Counts button presses as decisions and reports a large number.` },
    { q:`What does hesitation tell you in a playtest?`,
      a:`It is the visible sign of a real trade-off. The pattern to look for is hesitate, commit, then look to see whether it worked. Players who choose without looking are not having a decision, whatever the design document says they are having.`,
      follow:`Players hesitate and then cannot explain why afterwards. Good or bad?`,
      red:`Reads every hesitation as confusion and removes the choice.` }
  ],
  senior:[
    { q:`A system has depth on paper and collapses after ten hours of community play. Why does that keep happening?`,
      a:`Designers test at their own horizon and the community optimises collectively, faster, and with shared notes. You need dominance search before ship, by simulation or adversarial play, and levers you can tune after launch without a rebuild. Assume the optimum will be found in days.`,
      follow:`What would you have built into the system up front to survive that?`,
      red:`Blames players for optimising the fun out of the game.` },
    { q:`How do you use simulation to find dominant strategies without over-trusting it?`,
      a:`Use it to find what is provably never right and to narrow where you look, then verify with real play. A simulation assumes optimal play and real players are not optimal, so it tells you about the ceiling rather than about the experience.`,
      follow:`The simulation says an option is fine and players never take it. What do you conclude?`,
      red:`Ships the balance the simulation produced without anyone playing it.` }
  ] });

T('risk-reward',{ d:'core', t:'Risk and reward', tag:'The most reliable decision engine: a better outcome behind an uncertain cost.',
  what:`A structure where the player can choose a safer option with a modest payoff or a riskier one with a larger payoff, where the risk is legible and the outcome uncertain. It creates tension, expression (risk appetite) and mastery (reading the odds better over time).`,
  why:[`Risk/reward manufactures tension without needing content. The same encounter becomes different depending on what the player wagers.`,`It personalizes play: cautious and bold players experience different games.`,`It is also where balance goes wrong most visibly: if the risky option is always right, it is not a risk.`],
  think:{ q:[`Can the player estimate the risk before committing? Can they learn to estimate it better?`,`Is the safe option ever right? If never, remove it or fix the numbers.`,`What does failure cost, and does the player know that cost when choosing?`,`Does the reward create a new situation, or just a bigger number?`],
    trade:[`Legible risk lets players reason and reduces surprise. Hidden risk surprises and frustrates.`,`Large punishments make risk exciting and drive away loss-averse players.`],
    traps:[`Rewarding risk with more resources, which snowballs and removes future decisions.`,`Making the "risk" pure randomness with no skill component to reading or mitigating it.`],
    good:[`Different players take different risks in the same spot.`,`Players talk about "going for it".`],
    bad:[`Everyone takes the risky option, or nobody does.`] },
  how:[`For each risk/reward point, write the safe payoff, the risky payoff, the probability or skill check, and the cost of failure.`,`Check legibility: how does the player learn the odds? Through telegraphing, prior experience, or a number?`,`Check both options are situationally right. Write the situation where each wins.`,`Watch risk appetite in playtests. If it is uniform, the numbers or the information are wrong.`],
  ai:{ yes:[`Compute expected values and identify options that are never right.`,`Simulate risk points across skill levels to see when the risky option dominates.`,`Propose ways to make the risk legible without a number.`],
       no:[`Decide how punishing the game should be.`] },
  prompts:[{l:'Risk point analysis',p:`Here is a risk/reward point: safe option [A], risky option [B], probability or skill factor [P], failure cost [C]. Compute expected values for a novice and an expert. State when each option is correct. If one dominates, propose the smallest change to P, C or the payoffs that creates a real choice, and explain how the player would perceive the odds without reading a number.`}],
  verify:[`Did it account for downstream consequences (snowballing) or only immediate values?`,`Is its notion of "legible" grounded in what the player can see?`],
  test:[`Log choices at the risk point across players. Is there variance?`,`Ask players what they thought the odds were. Compare with reality.`,`Do players change their risk appetite as they improve?`],
  rel:[['decisions','Risk/reward is a decision shape.'],['tension-release','Risk is the engine of tension.'],['challenge-failure-recovery','Failure cost is half of risk.'],['economy-and-resources','Rewards that snowball break economies.']] });
TECH('risk-reward',[
  {n:'Risk pricing', how:`Make each risk cost something real and legible, so the reward is a decision not a formality.`, fit:`Combat, betting, exploration, push-your-luck.`, cost:`Punitive risk drives players to the safe option always.`, alt:`Tune the ratio per context. Test whether players take risks.`},
  {n:'Push-your-luck curves', how:`Let players choose when to bank. Make the marginal risk grow with the pile.`, fit:`Tension and memorable gambles.`, cost:`Can feel random without readable odds.`, alt:`Reveal enough odds to reason.`},
  {n:'Loss aversion management', how:`Decide what is lost, how much, and whether it can be recovered.`, fit:`Making stakes meaningful without rage-quit.`, cost:`Losing progress is the most-cited quit cause. Needs recovery design.`, alt:`Prefer losing progress in a run, not in the account.`}
]);
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
INTERVIEW('risk-reward',{
  junior:[
    { q:`Why is risk and reward such a reliable decision engine?`,
      a:`It manufactures tension without new content, it personalises play because risk appetite differs, and it rewards learning to read the odds. The same encounter becomes several encounters depending on what the player wagers.`,
      follow:`Give an example from a game you know and name the cost of failure in it.`,
      red:`Describes a random chance with no judgement or mitigation available to the player.` },
    { q:`How does a player learn the odds without a percentage on screen?`,
      a:`Telegraphs they can read, prior experience with the same enemy or situation, the visible state of their own resources, and consequences that stay consistent. Making risk legible without a number is the actual design work, and a number is usually the lazy version of it.`,
      follow:`What happens when the odds are genuinely unknowable to the player?`,
      red:`Puts a percentage on the screen as the only way to make risk readable.` },
    { q:`Everyone takes the risky option. What does that tell you?`,
      a:`It is not a risk. Either the expected value favours it outright or the failure cost is too small to matter. Check both, then check whether the safe option is ever correct in any situation you actually ship.`,
      follow:`Nobody takes it. Same question.`,
      red:`Says the players are simply being aggressive and leaves the numbers alone.` }
  ],
  mid:[
    { q:`You reward risk with more resources and the run snowballs. What is the problem?`,
      a:`The reward removes future decisions by making everything affordable. Either the sinks grow with the source, or the reward becomes a new situation rather than more of what the player already had. Snowballing is a decision problem before it is a balance problem.`,
      follow:`How would you reward risk without snowballing?`,
      red:`Reduces the reward amount and leaves the structure exactly as it was.` },
    { q:`How do you make risk legible when the outcome depends on player skill?`,
      a:`Show the demand rather than a probability. A telegraph the player can read, a window they can see closing, a state that signals how close failure is. Skill risk is legible when the player can feel their own margin shrinking.`,
      follow:`Players consistently misjudge it. Where do you look first?`,
      red:`Adds a difficulty rating label to the encounter and calls it communicated.` },
    { q:`Loss-averse players avoid your risk points entirely. Is that a failure?`,
      a:`Not by itself. Risk appetite is one of the few places expression is free, and uniform behaviour is the warning sign rather than varied behaviour. The real failure is when avoiding the risk is strictly better, because then the safe path is the optimum and there was never a choice.`,
      follow:`How do you price the safe path so it stays viable without dominating?`,
      red:`Forces every player through the risk and removes the safe route entirely.` }
  ],
  senior:[
    { q:`Balance a risk point for a novice and an expert at the same time.`,
      a:`Their expected values differ, so a point tuned for one is broken for the other. Prefer risk whose demand scales with skill over risk whose probability is fixed, or let the player choose the stake. Then verify with logs from both groups rather than with one curve.`,
      follow:`You only have expert data. What do you refuse to conclude from it?`,
      red:`Tunes on the team's own play, which is expert play with hidden knowledge attached.` },
    { q:`How do risk structures interact with monetisation?`,
      a:`When a purchase removes the risk, the decision disappears and the tension goes with it. If failure costs can be bought away, the store is running the design economy. That is a policy decision and it should be taken openly rather than discovered in the balance data.`,
      follow:`The business wants a revive item. How do you protect the risk?`,
      red:`Accepts the item and rebalances the encounter to be harder for everyone who does not buy it.` }
  ] });
DIAGRAM('risk-reward', { kind:'quad', title:'The decision lives on the rising diagonal',
  x:'Risk (chance of loss)', y:'Reward',
  points:[{t:'Safe route', x:0.16, y:0.24},{t:'Gamble for the chest', x:0.78, y:0.8},{t:'Free win', x:0.16, y:0.84},{t:'Pointless danger', x:0.82, y:0.2}],
  q:['Dominant: no decision','Interesting bet','Safe default','Never worth it'] });

T('agency-and-emergence',{ d:'core', t:'Agency and emergence', tag:'Agency is when the player causes things. Emergence is when the game surprises its own designers.',
  what:`Agency: the player perceives that their choices cause outcomes, and that different choices would have caused different outcomes. Emergence: behaviors and strategies arising from rule interactions that were not individually authored. Together they produce stories players tell as their own.`,
  why:[`Perceived agency, not actual agency, drives the feeling of playing. A game can have real branches nobody notices, or a linear path that feels authored by the player.`,`Emergence makes a finite ruleset produce unbounded situations. It is the only scalable source of surprise.`,`Emergence is also where exploits and degenerate strategies come from. It needs stewardship, not suppression.`],
  think:{ q:[`Where does the player see that their choice mattered? How soon?`,`Which systems can affect which other systems? Where are the walls between them?`,`What is the strangest thing a player could do with these rules? Is it delightful or degenerate?`,`Am I preventing emergence by scripting outcomes I could have let the system produce?`],
    trade:[`More systemic openness yields more emergence and more balance and QA risk.`,`Authored set pieces deliver reliable peaks and reduce agency.`],
    traps:[`Fake choices (dialogue options that converge) that players detect within an hour.`,`Sealing systems from each other to make them easier to balance, which kills emergence.`],
    good:[`Players tell stories nobody on the team scripted.`,`Players find valid strategies you did not plan.`],
    bad:[`Players say "it did not matter what I picked".`] },
  how:[`Draw the system interaction map: which systems read or write which state? Look for isolated islands.`,`For each major choice, identify when and how the player sees the consequence. If it is never or much later, add a nearer signal.`,`Deliberately connect two isolated systems and prototype. Watch for surprising strategies.`,`Classify each emergent strategy: celebrate, tune, or remove. Default to celebrate.`],
  ai:{ yes:[`Map system interactions from a design document and find isolated systems.`,`Brainstorm cross-system interactions and predict emergent strategies.`,`Stress-test rules for degenerate combinations.`],
       no:[`Decide which emergent strategies to keep. That is taste and identity.`] },
  prompts:[{l:'Collision search',p:`Here are our systems and the state each reads and writes: [MAP]. Identify pairs that never interact. For the 5 most promising pairs, describe a concrete interaction rule, the emergent strategy it might produce, whether that strategy would be delightful or degenerate for our fantasy ([FANTASY]), and the smallest prototype that would show it. Then list the 3 most dangerous existing interactions that could produce exploits.`}],
  verify:[`Are the predicted emergent strategies actually derivable from the rules, or wishful?`,`Did it distinguish delightful from degenerate using the fantasy, or its own taste?`],
  test:[`Do players describe outcomes as their doing?`,`Do players discover strategies that are not in the design document?`,`Ask players what would have happened if they had chosen differently. Can they say?`],
  rel:[['systemic-design','Systemic design is how emergence is engineered.'],['decisions','Agency requires decisions with consequences.'],['narrative-agency','Narrative agency is this topic applied to story.'],['procedural-content','Procedural systems are emergence applied to content.']] });
TECH('agency-and-emergence',[
  {n:'Interaction map', how:`Draw which systems read/write which state. Isolated islands create mini-games, connections create emergence.`, fit:`Finding where depth is waiting.`, cost:`Manual upkeep.`, alt:`Connect two isolated systems and prototype.`},
  {n:'Consequence proximity', how:`Ensure the player sees the outcome of a choice soon. Delayed or invisible consequences erase agency.`, fit:`Making choices feel real.`, cost:`Immediate consequences can remove strategy. Stagger signals.`, alt:`Near signal now, full payoff later.`},
  {n:'Emergence classification', how:`Classify surprising strategies as celebrate, tune or remove.`, fit:`Deciding what to do with the unexpected.`, cost:`Over-tuning kills the joy of discovery.`, alt:`Default to celebrate. Tune only degenerate cases.`}
]);
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
INTERVIEW('agency-and-emergence',{
  junior:[
    { q:`Define agency and emergence, and say how they differ.`,
      a:`Agency is the player perceiving that their choice caused the outcome and that another choice would have caused something else. Emergence is behaviour arising from rules interacting, which nobody authored individually. Perceived agency is what counts, because real branches nobody notices produce no feeling at all.`,
      follow:`Give an example of a game with real branches and no felt agency.`,
      red:`Uses the two words interchangeably and treats both as "player freedom".` },
    { q:`Why is perceived agency the thing you design for?`,
      a:`The player only has what they perceive. A linear path with a visible consequence feels authored by them. A branching one whose consequences land off screen does not. The lever is usually feedback timing rather than structure.`,
      follow:`How soon does the consequence have to become visible?`,
      red:`Counts endings or branch points as a measure of agency.` },
    { q:`Players say it did not matter what they picked. What do you check first?`,
      a:`Whether the consequence is visible at all, whether it arrives so late the choice has been forgotten, and whether the options actually diverge in play. Add a nearer signal before adding another branch, because the branch is the expensive fix.`,
      follow:`The consequence is real and lands an hour later. What do you add?`,
      red:`Adds more dialogue options to the same converging conversation.` }
  ],
  mid:[
    { q:`How do you engineer for emergence rather than hoping for it?`,
      a:`Map which systems read and write which state. Find the isolated islands. Connect two of them deliberately with one rule and prototype it. Emergence comes from shared state, not from the number of systems, so adding a sealed system adds nothing.`,
      follow:`You connect two systems and nothing interesting happens. What went wrong?`,
      red:`Adds a system and expects emergence as a property of its existence.` },
    { q:`A player finds a strategy you did not plan. Celebrate, tune or remove?`,
      a:`Default to celebrate. Judge it against the fantasy rather than against your plan. Tune when it removes other options, remove when it breaks the promise or the economy. Then say publicly which you did and why, because silence on this teaches players not to experiment.`,
      follow:`It is delightful and it trivialises the third act. What do you do?`,
      red:`Patches out anything unplanned on the grounds that it was not designed.` },
    { q:`Sealing systems from each other makes balance easier. What does it cost?`,
      a:`It kills emergence and forces you to buy variety with content instead. Each sealed system then needs its own content to stay interesting, which multiplies scope in exactly the place teams cannot afford it.`,
      follow:`Where would you accept a wall between systems?`,
      red:`Seals systems for QA convenience and adds levels to compensate for the lost variety.` }
  ],
  senior:[
    { q:`How do you steward emergence in a live game without breaking player trust?`,
      a:`Publish the intent. Distinguish exploits from strategies openly and consistently. Change rules rather than quietly disabling behaviour. Give warning before removal. Players accept changes they can predict and resent ones that arrive unexplained.`,
      follow:`You have to remove a beloved strategy for economy reasons. How do you do it?`,
      red:`Silently patches it and denies anything changed.` },
    { q:`Emergence adds QA and balance risk. How do you sell it to production?`,
      a:`Cost it against the content it replaces: fewer assets, more tuning, more testing time. Propose the cheapest systemic slice that proves the value, with the risk named up front and a fallback defined. Never present it as free content.`,
      follow:`The slice comes back ambiguous. Do you commit or not?`,
      red:`Promises emergent variety at no extra QA cost and discovers otherwise at certification.` }
  ] });

T('challenge-failure-recovery',{ d:'core', t:'Challenge, failure and recovery', tag:'Failure is a teaching event. Design the lesson, the cost, and the way back.',
  what:`Challenge is a task with uncertain success that demands skill or judgment. Failure is the outcome when it is not met. Recovery is how the player gets back to trying again: how fast, at what cost, with what new information. The triad decides whether struggle feels productive or punishing.`,
  why:[`Without the possibility of failure, success has no meaning and tension is impossible.`,`How a game handles failure decides who keeps playing. Long recovery with no lesson is where mid-skill players quit.`,`The best failures teach: the player knows what went wrong and wants to try again immediately.`],
  think:{ q:[`When the player fails, do they know why? Could they say it in one sentence?`,`How many seconds from failure to the next attempt at the same challenge?`,`What does failure cost: time, resources, progress, pride? Is that cost proportional?`,`Does failure ever produce something interesting (a new situation, a story), or only a reset?`],
    trade:[`High failure cost raises tension and lowers experimentation.`,`Instant retry maximizes learning and can trivialize stakes.`],
    traps:[`Punishing the player for the game's own unclarity (unreadable telegraphs, hidden rules).`,`Difficulty settings as the only tool, instead of fixing the challenge design.`],
    good:[`Players retry immediately after failure, often with a different approach.`,`Players say "I see what I did wrong."`],
    bad:[`Players stare, then quit. Or retry identically many times.`] },
  how:[`For each major challenge, write the intended lesson of failing it.`,`Ensure the game communicates the cause of failure within two seconds of it.`,`Measure recovery time to the retry. Cut anything in between that does not add information or meaning.`,`Consider "fail forward": failures that create a new situation instead of a reset.`,`Test with players across skill levels. Track retry rate and approach change.`],
  ai:{ yes:[`Audit challenges for legibility of failure cause.`,`Propose fail-forward alternatives to resets.`,`Analyze retry logs for identical repetition (a sign the lesson is not landing).`],
       no:[`Decide how punishing the game should be.`] },
  prompts:[{l:'Failure lesson audit',p:`Here are our major challenges and what happens on failure: [LIST]. For each, state the lesson a player should learn from failing, how the game currently communicates the cause of failure and how quickly, the recovery time to retry, and the cost. Flag challenges where the cause is not communicated within 2 seconds or recovery exceeds 20 seconds. Propose, per flag, the smallest change and a fail-forward alternative.`}],
  verify:[`Does the audit assume players understand systems the game never explained?`],
  test:[`After a failure, ask "what happened?" Note whether the answer is accurate.`,`Time failure to retry.`,`Do players change approach after failure, or repeat?`,`Where do players quit after failing? How many failures preceded it?`],
  rel:[['difficulty','Difficulty is challenge calibrated across the game.'],['skill-and-mastery','Failure is how skill is acquired.'],['risk-reward','Failure cost defines risk.'],['feedback-and-affordance','Communicating the cause of failure is feedback.']] });
TECH('challenge-failure-recovery',[
  {n:'Failure cost tuning', how:`Decide how much time/progress a failure costs, and the length of the retry loop.`, fit:`Making failure instructive, not punishing.`, cost:`Too cheap removes weight. Too costly causes churn.`, alt:`Keep failure cheap and learning fast in action games.`},
  {n:'Checkpoint and recovery design', how:`Place checkpoints and design recovery so players resume near where they failed with the knowledge they gained.`, fit:`Action and level-based games. Retention at hard points.`, cost:`Frequent checkpoints reduce tension. Sparse ones cause abandonment.`, alt:`Match checkpoint density to the intended tension.`},
  {n:'Recovery mechanics', how:`Second chances, comeback options or scaling that keep a run alive without erasing the loss.`, fit:`Roguelikes, sports, competitive games.`, cost:`Can undermine stakes if too generous.`, alt:`Make recovery cost something.`}
]);
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
INTERVIEW('challenge-failure-recovery',{
  junior:[
    { q:`Why are challenge, failure and recovery treated as one topic?`,
      a:`Because changing one without the others produces the familiar complaints. Challenge is a task with uncertain success. Failure is the outcome when it is not met. Recovery is how fast, at what cost and with what new information the player gets back to trying. Together they decide whether struggle feels productive.`,
      follow:`Which of the three do teams get wrong most often?`,
      red:`Treats failure handling as something a difficulty setting solves.` },
    { q:`What makes a good failure?`,
      a:`The player knows why within a couple of seconds, wants to try again immediately, and has a different idea about how. If they cannot state what went wrong in one sentence, the failure taught nothing and the next attempt is a repeat rather than an experiment.`,
      follow:`How do you communicate the cause inside that window?`,
      red:`Adds a death screen with a rotating tip.` },
    { q:`How long should the gap between failure and the next attempt be?`,
      a:`As short as whatever sits in between can justify. Cut anything that carries no information and no meaning. Long recovery with no lesson is precisely where mid-skill players stop playing, and every second of it is paid by the players you most wanted to keep.`,
      follow:`Your retry sequence includes a twenty second cutscene. What do you do?`,
      red:`Keeps the cinematic because it is good and the team is proud of it.` }
  ],
  mid:[
    { q:`Players retry the same challenge identically many times. Diagnose it.`,
      a:`The lesson is not landing. Either the cause of failure is not communicated, or the player has no second approach available to try. Check the telegraphs first, then check whether the game ever taught an alternative. Repetition without variation is a teaching failure, not stubbornness.`,
      follow:`They know exactly why and still repeat the same attempt. What is happening then?`,
      red:`Reduces the difficulty and declares the problem solved.` },
    { q:`What is failing forward, and when does it stop working?`,
      a:`Failure produces a new situation instead of a reset, so the attempt still counts for something. It stops working when failing is as good as succeeding, because then the stakes are gone and the tension goes with them.`,
      follow:`How do you keep the cost real while still failing forward?`,
      red:`Makes failure costless and describes it as player friendly.` },
    { q:`Testers call a section unfair. How do you find out what they actually mean?`,
      a:`Classify before touching numbers: unclear rules, insufficient feedback, execution demand, information overload, randomness, poor checkpointing, excessive punishment. Each one has a different fix and most of them are not difficulty at all.`,
      follow:`It turns out to be unreadable telegraphs. What is the fix, and what is the wrong fix?`,
      red:`Makes the section easier, which leaves the unreadable telegraph in place for everyone.` }
  ],
  senior:[
    { q:`How do you design the failure experience for new and expert players at once?`,
      a:`Separate the lesson from the punishment. Keep the lesson constant and let the cost vary through player-chosen stakes, routes and tools before you reach for menu settings. Then measure retry rate and change of approach separately for each group.`,
      follow:`Your community treats assist options as cheating. How do you handle that?`,
      red:`Ships one curve tuned by the team and bolts on an easy mode a month before launch.` },
    { q:`Where do mid-skill players quit, and how would you find that point in your own game?`,
      a:`At the place where failure cost exceeds the lesson: long recovery, no new information, no visible alternative. Find it by counting failures before abandonment per section, then going and watching those sections in person rather than trusting the ranking.`,
      follow:`The data points at one boss. You watch it and nothing looks wrong. What next?`,
      red:`Assumes the churn must be at whatever section the difficulty chart says is hardest.` }
  ] });

T('skill-and-mastery',{ d:'core', t:'Skill acquisition and mastery', tag:'What does the player get better at, and how does the game show them?',
  what:`The skills a game asks for (execution, timing, reading, planning, resource judgment, spatial reasoning, memory) and the arc by which a player acquires them. Mastery is the state where the player performs the skill fluidly and can express style within it. Dan Cook describes this as chains of skill atoms: each atom taught, exercised and then combined.`,
  why:[`Competence is a primary motivator. A game with no skill to grow leaves only content to consume.`,`A skill ceiling below the player's reach means boredom. A skill floor above it means churn.`,`Mastery must be perceivable. A player who improves without knowing it gets no reward from it.`],
  think:{ q:[`List the skills the game demands. Which one does the fantasy imply should be central?`,`How does a player know they have improved? Faster clears, new options, visible style?`,`What does the expert do that the novice does not? Can the novice see it?`,`Are there skills the game requires but never teaches?`],
    trade:[`Execution skill is legible and excludes players with lower reflexes. Judgment skill includes more players and is harder to feel.`,`High ceilings reward dedication and can intimidate.`],
    traps:[`Confusing stat growth with skill growth.`,`Demanding a skill the game never isolated for teaching.`],
    good:[`Veterans can explain what they do differently.`,`Novices can watch veterans and see it.`],
    bad:[`Players plateau early and describe the game as "just grinding".`] },
  how:[`List skills. Mark each as taught, exercised, combined with others, and shown back to the player.`,`Find the gaps: skills required but never isolated, skills taught but never combined.`,`Design a mastery display: a place where the player's improvement is visible (time, style, options).`,`Test with veterans and novices. Compare their play. The difference is your actual skill ceiling.`],
  ai:{ yes:[`Extract skill atoms from a mechanic list and map where each is taught and combined.`,`Propose mastery signals that do not rely on numbers.`,`Analyze play logs for the differences between novice and veteran behavior.`],
       no:[`Decide which skill the game is about.`] },
  prompts:[{l:'Skill atom map',p:`Here are our mechanics and level order: [DESCRIPTION]. Extract the skills the player must acquire (execution, timing, reading, planning, resource judgment, spatial, memory). For each, identify where it is first isolated, first exercised under pressure, first combined with another skill, and how the player would perceive their own improvement. Flag skills that are required before they are isolated, and skills that never combine. Propose one mastery display for the central skill.`}],
  verify:[`Did it distinguish skill from stats?`,`Are the "where taught" claims grounded in the level order I gave?`],
  test:[`Record novice and veteran runs of the same challenge. What differs?`,`Ask veterans what they do differently. Ask novices what they are working on.`,`Do players notice their own improvement? Ask.`],
  rel:[['mastery-discovery-expression','Mastery is one of the three long-term engines.'],['level-structure','Levels are where skills are taught and combined.'],['challenge-failure-recovery','Failure is the mechanism of learning.'],['game-feel-and-juice','Execution skill lives in game feel.']] });
TECH('skill-and-mastery',[
  {n:'Skill-atom decomposition', how:`Break a skill into atoms (perception, decision, execution) that can be taught and practiced separately.`, fit:`Designing learnable, deep skills.`, cost:`Over-fragmentation creates drills that are no fun.`, alt:`Embed practice in play, not in menus.`},
  {n:'Feedback for learning', how:`Give immediate, specific, perceivable feedback so the player can adjust and improve.`, fit:`Skill acquisition. The core of mastery.`, cost:`Vague feedback teaches nothing. Noisy feedback teaches wrongly.`, alt:`Show cause and effect within the same interaction.`},
  {n:'Transfer and escalation', how:`Reuse skills in new combinations so early learning stays relevant.`, fit:`A satisfying long skill arc.`, cost:`Can become repetitive. Needs new contexts.`, alt:`Teach, test, twist, combine (see Level structure).`}
]);
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
INTERVIEW('skill-and-mastery',{
  junior:[
    { q:`What skills does your game actually demand? Name them.`,
      a:`Decompose rather than saying "getting better at the game". Execution, timing, reading, planning, resource judgement, spatial reasoning, memory. Then say which one the fantasy implies should be central, and whether the game ever isolates it for teaching.`,
      follow:`Which skill does your game demand but never teach?`,
      red:`Answers that players just get better with practice, with no decomposition at all.` },
    { q:`What is a skill atom, and why chain them?`,
      a:`Dan Cook's framing: each atom gets taught, exercised, then combined with another. Chaining is how a game builds fluency instead of dumping demands at once. A skill required before it has been isolated is a design bug, and it shows up as deaths in the introduction.`,
      follow:`Where in a game you know is an atom skipped?`,
      red:`Equates skill atoms with tutorial popups.` },
    { q:`How is stat growth different from skill growth?`,
      a:`Stats change the numbers, skill changes what the player can do. A player whose character is stronger and who plays identically has mastered nothing. The distinction decides what progression is for, and confusing them is how a game becomes easier and less interesting at once.`,
      follow:`Your progression is entirely stats. How would you add skill growth?`,
      red:`Says the player gets better because their character gets stronger.` }
  ],
  mid:[
    { q:`Players plateau early and call the game grindy. Diagnose it.`,
      a:`Check whether the ceiling is low, whether the game shows improvement back to the player, and whether any new demand arrives after the first few hours. Grind language usually means there is no skill left to grow and no new decision to make, not that the numbers are too slow.`,
      follow:`The ceiling is high and they still plateau. What is missing?`,
      red:`Adds more levels of the same demand and calls it endgame content.` },
    { q:`How do you make judgement skill perceivable?`,
      a:`Show the outcomes of better reads: fewer resources spent, cleaner routes, earlier recognition of a situation. Compare the player against their own earlier runs rather than against an abstract number. And let veterans demonstrate, because watching is how novices learn what to aim at.`,
      follow:`Novices cannot see what the veteran is doing differently. What do you change?`,
      red:`Adds a numeric rating and calls it mastery feedback.` },
    { q:`You record a veteran and a novice on the same challenge. What are you looking for?`,
      a:`Concrete differences: where they look, what they do first, what they skip, what they never attempt. That difference is your actual skill ceiling regardless of what the design document claims it is.`,
      follow:`The two runs look nearly identical. What does that tell you?`,
      red:`Measures only completion time and draws conclusions about skill from it.` }
  ],
  senior:[
    { q:`Execution skill excludes some players. Judgement skill includes more and is harder to feel. How do you choose?`,
      a:`Decide from the player model and the fantasy, then design the perception problem deliberately. A judgement game needs strong mastery displays because the improvement is otherwise invisible. Layering both, with execution optional, is possible but doubles the teaching work.`,
      follow:`You choose judgement. What are the three things you must build because of it?`,
      red:`Picks execution by default because it is easier to feel, and never asks who that excludes.` },
    { q:`How do you keep a skill curve honest when the whole team are experts?`,
      a:`Never tune only on internal play. Keep a rotating pool of fresh testers and record first attempts as the ground truth. Track where team knowledge is being assumed and treat every one of those as a teaching gap rather than a player failing.`,
      follow:`You have no external testers this milestone. What do you do instead?`,
      red:`Tunes on team playthroughs and ships a first hour that nobody outside the studio survives.` }
  ] });
