/* =====================================================================
   CORE GAMEPLAY
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'core', lens:'design', t:'Core Gameplay', short:'Loop, decisions, risk, skill, agency, failure', color:'var(--d-core)',
    sum:`The thing the player does over and over. If the core interaction is not compelling on its own, no amount of progression, content or narrative rescues it. Fix the loop before you multiply it.`,
    links:[['systems','Systems give the loop its variables: what changes between one iteration and the next.'],['ux','Input, readability and feedback are the loop as the player physically meets it.'],['presentation','Game feel lives at the seam between the loop and presentation.'],['production','The loop is the first thing you prototype and the thing you playtest most.']] });

T('core-loop',{ d:'core', t:'The core loop', tag:'Action → Feedback → Decision → Consequence → New situation. Every link must hold.',
  what:`The shortest cycle of play the player repeats: they act, the game responds legibly, they decide what to do next based on that response, the decision has consequences, and the consequences create a new situation that demands a new action. When one link is weak the loop leaks and no amount of content refills it. In Bejeweled the swap is the action, the clearing gems are the feedback, choosing among the legal swaps is the decision, the cascade is the consequence, and the refilled board is the new situation.`,
  why:[`Players spend most of their time in the core loop. It is the game.`,`Every other system (progression, content, narrative) multiplies the loop. Multiplying a weak loop multiplies weakness.`,`Loop failures have characteristic symptoms, which makes them diagnosable.`],
  think:{ q:[`What does the player do most often, physically? Is that the fantasy verb?`,`After an action, can the player say what happened and why?`,`Is there a decision, or a single obvious best move?`,`Does the decision change anything the player will meet later?`,`Does the situation after the loop differ from the one before it?`],
    trade:[`Fast loops (seconds) reward feel and reflex. Slow loops (minutes) reward planning. Each attracts different players.`,`More decision density increases engagement and cognitive load.`],
    traps:[`Describing the loop as a flowchart of systems (gather, craft, fight, upgrade) rather than as what the player experiences.`,`Assuming a loop is fun because it is genre standard.`],
    good:[`A stripped prototype (grey boxes, no progression) is voluntarily replayed.`,`Two players given an identical toolkit still produce different match outcomes purely from spacing and timing, the way Street Fighter’s neutral game does.`],
    bad:[`Players say “I will keep going to unlock X” rather than “I want to do that again”.`] },
  how:[`Write the loop in five sentences from the player’s point of view, one per link.`,`Build the loop alone: no progression, no content variety, no story. Grey boxes.`,`Playtest it. If players do not voluntarily repeat it, diagnose which link is weak using the Core Loop Diagnostic.`,`Fix one link, test again. Only when the bare loop is replayed do you start multiplying it.`],
  ai:{ yes:[`Rewrite your loop description from the player perspective and flag missing links.`,`Generate variations of one link (e.g., five alternative decision structures) to test.`,`Build the grey-box prototype quickly.`,`Analyze playtest notes for symptoms of each weak link.`],
       no:[`Decide the loop is fun. Only repetition by players shows that.`,`Add systems to compensate for a weak link before the link is fixed.`] },
  prompts:[{l:'Loop link audit',p:`Act as a sceptical systems designer. Here is our core loop as the player experiences it: [FIVE SENTENCES]. For each link (action, feedback, decision, consequence, new situation), rate its strength, state the evidence you are using from my description, and name the symptom a playtest would show if it were weak. Then propose 3 variations for the weakest link, each with the player decision it creates, the emotion intended, the likely failure mode, and the observable signal that would validate it. Do not recommend one yet.`},
    {l:'Prototype build',p:`Build a minimal playable prototype of this loop in [ENGINE/HTML]: [LOOP]. Grey boxes only, no menus, no progression, no audio beyond a single feedback tone. Expose these tuning values as on-screen sliders: [VALUES]. Log every player action with a timestamp to a downloadable text file so I can analyse repetition and decision variety.`}],
  verify:[`Did it rate links based on my description or on genre assumptions?`,`Are the proposed variations mechanically distinct, or the same idea reskinned?`,`Does the prototype isolate the loop, or did it sneak in progression?`],
  test:[`Do players repeat the loop voluntarily when nothing rewards them for it?`,`Can they explain what happened after an action?`,`Do different players make different choices at the decision point?`,`Do they notice the situation changed?`],
  rel:[['genre-hybrids','Two loops can share a game only when each one feeds the other.'],['decisions','The decision link is where most loops fail.'],['feedback-and-affordance','Feedback is the link UX owns.'],['game-feel-and-juice','Action feel is the loop as the body experiences it.'],['prototyping','The loop is the first prototype.'],['systemic-design','Systems supply the new situation.']] });
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
    pitfall:`Multiplying velocity by delta before move_and_slide(). CharacterBody2D.move_and_slide() already integrates over the physics step, so the extra multiply scales speed by the step length: roughly sixty times too slow at sixty physics ticks per second, and different whenever the tick rate changes. The matching mistake is running the verb in _process instead of _physics_process, which makes the same action resolve differently on a 60 Hz and a 144 Hz monitor.`,
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
    pitfall:`Reading WasPressedThisFrame() inside FixedUpdate. FixedUpdate can run zero, one or several times in a rendered frame, so single-frame presses are dropped or double-counted and the loop feels unreliable in exactly the way players call unresponsive. Sample input in Update, buffer it, consume it in FixedUpdate.`,
    map:`Unity FixedUpdate() is Godot _physics_process(delta), Update() is _process(delta), and a UnityEvent is a signal.` },
  note:`The design point survives both engines: the loop is only a loop when the consequence is legible before the next input. In both snippets the feedback is an explicit event, not a line buried in the movement code, because that is the part you will want to test, delay, juice and eventually move to a server.` });
INTERVIEW('core-loop',{
  junior:[
    { q:`What is a core loop, and what is the core loop of the last game you shipped or studied?`,
      a:`Name the repeated unit: action, feedback, decision, consequence, new situation. Then walk one concrete iteration of a real game in those five beats. Say how long one iteration takes. Say what changes between iteration one and iteration two, because a loop with nothing changing is a chore.`,
      follow:`Now name the loop one layer out. What is the three-minute loop that the three-second loop feeds?`,
      red:`Describes the game’s feature list, or answers with a genre label (“it’s a roguelike”) instead of a repeated unit of play.` },
    { q:`Where does feedback belong in the loop, and how late is too late?`,
      a:`Feedback closes the loop: without it the player cannot learn what their action did. Immediate confirmation should land inside roughly 100 ms so the action feels connected. The consequence can resolve later, but the acknowledgement cannot. Give an example of a game where the acknowledgement and the outcome are deliberately split.`,
      follow:`What do you do when the real outcome takes two seconds to compute or has to come back from a server?`,
      red:`Treats feedback as visual polish added at the end, or cannot distinguish acknowledging the input from resolving the outcome.` },
    { q:`In an engine of your choice, where would you put the loop code?`,
      a:`Input sampled every frame so no press is dropped, rules resolved on the fixed step so the same action resolves the same way on any machine, and the consequence raised as an event rather than called inline. In Unity that is Update plus FixedUpdate plus a UnityEvent. In Godot that is _process, _physics_process and a signal.`,
      follow:`What breaks if you sample the attack button in FixedUpdate?`,
      red:`Puts everything in Update or _process and does not know why frame-rate independence matters.` }
  ],
  mid:[
    { q:`A playtest says the game is repetitive. How do you find out which part of the loop is at fault?`,
      a:`Do not add content. Instrument one iteration: is the action varied, is the feedback readable, is there a decision with a real trade-off, does the consequence change the next situation. Watch six players and count decisions per minute. Repetitiveness is almost always a missing decision or an unchanging situation, not a missing feature.`,
      follow:`You find the decision exists but players always pick the same option. Now what?`,
      red:`Jumps straight to “add more enemy types” or blames the art.` },
    { q:`How do you prototype a core loop so the test is cheap?`,
      a:`Strip to the single verb and the single consequence. Grey boxes, placeholder audio, no progression, no menu. Test the one question that would kill the idea. Say what your kill criterion was on a real prototype, and whether you honoured it.`,
      follow:`What was the smallest prototype you have built that changed a decision?`,
      red:`Describes a vertical slice and calls it a prototype, or has never killed one.` },
    { q:`How does the loop change when the game is online and the server is authoritative?`,
      a:`The acknowledgement stays local and immediate, the resolution moves to the authority. That means prediction, reconciliation and a visible rule for what happens when the two disagree. Name the correction you chose and what it looks like to the player when it fires.`,
      follow:`What does your loop feel like at 200 ms of latency, and what did you change to keep it honest?`,
      red:`Says “we just send the input to the server” with no account of the wait the player experiences.` }
  ],
  senior:[
    { q:`You inherit a game whose loop is fine for an hour and dead by hour three. Where do you look?`,
      a:`The three-second loop is working and the longer loops are not. Check whether the situation changes across sessions, whether the decision space widens with mastery, and whether the systems feeding the loop generate new combinations or only bigger numbers. Separate a content problem from a system problem before spending a single sprint.`,
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
    traps:[`Offering options that differ in flavour but not consequence.`,`Hiding the tradeoff so the player cannot reason about it (a decision they cannot understand is a guess).`,`Balancing by making everything equal, which erases situational preference.`],
    good:[`Players hesitate, then commit, then look to see if it worked.`,`Players argue about the right choice.`],
    bad:[`Players pick the same option every time, or pick without looking.`] },
  how:[`List the decisions in one loop iteration. For each, write the trade-off in one sentence. If you cannot, it is not a decision.`,`Check for situational variance: describe two situations where the best choice differs.`,`Check information: what does the player know when choosing? Is it enough to reason, and not enough to be certain?`,`Playtest and log choices. Low variance across players or situations flags a dominant option.`,`When you add an option, check it does not make the situational ones pointless: IGN’s Lucas M. Thomas said Mega Man 4’s chargeable Mega Buster left many of the boss weapons useless.`],
  ai:{ yes:[`Enumerate decisions in a rules description and articulate each trade-off.`,`Search for dominant strategies by simulation or reasoning.`,`Generate situations in which each option would be best.`],
       no:[`Judge whether a decision “feels” meaningful. Hesitation and variance in play show that.`] },
  prompts:[{l:'Dominant option hunt',p:`Here are the rules and numbers for [SYSTEM]: [RULES]. For each decision the player faces, state the trade-off in one sentence. Then try to break it: find the option an expert would always choose, and the situations, if any, where another option wins. Rank decisions by how likely they are to collapse into a single answer after 10 hours. For the top one, propose the smallest rule change that restores situational variance.`}],
  verify:[`Are trade-offs stated as real costs, or as flavour differences?`,`Did it try to break the system, or affirm that it is balanced?`],
  test:[`Log choices per player per situation. Compute variance.`,`Do players hesitate before choosing? Hesitation is a sign of a real trade-off.`,`Ask players why they chose. Can they state the trade-off?`],
  rel:[['time-and-turns','How time passes decides how long the player gets to make each decision.'],['core-loop','The decision is one link of the loop.'],['depth-vs-complexity','Depth is decision count, not rule count.'],['risk-reward','Risk/reward is the most common decision shape.'],['builds-and-loadouts','Build choices are slow-horizon decisions.']] });
TECH('decisions',[
  {n:'Tradeoff mapping', how:`For each option, write what the player gives up. Options with no trade-off are not decisions.`, fit:`Auditing whether your “choices” are real.`, cost:`Design time. Can reveal that your variety is cosmetic.`, alt:`Start here. Cut or merge options with no trade-off sentence.`},
  {n:'Information design (fog, telegraph, partial knowledge)', how:`Control what the player knows when they choose: hidden values, revealed odds, telegraphed enemy intent.`, fit:`Creating interesting decisions under uncertainty.`, cost:`Opacity feels unfair. Full information removes tension.`, alt:`Reveal enough to reason. Hide enough to matter.`},
  {n:'Dominance analysis', how:`Check whether any option is at least as good as another in every situation. If so, fix, cost or remove it.`, fit:`Balance and depth audits.`, cost:`Only catches strict dominance, not situational imbalance.`, alt:`Follow with pick-rate/win-rate data.`}
]);
ENGINE('decisions',{
  godot:{ term:`A decision in the engine is two things: the options as data, and a path that delivers the answer. The second one is where prototypes lose the decision, because a Control higher in the tree eats the click before it arrives.`,
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
    map:`Godot mouse_filter is Unity’s Raycast Target checkbox, and grab_focus() is EventSystem.SetSelectedGameObject().` },
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
    map:`Unity CanvasGroup.blocksRaycasts is a parent Control’s mouse_filter, and onClick is the pressed signal.` } });
INTERVIEW('decisions',{
  junior:[
    { q:`What makes a decision meaningful?`,
      a:`The options have to be different, the outcome uncertain, and the player has to care. Sid Meier’s framing is a game as a series of interesting decisions. Add two working tests: the right answer changes with the situation, and different players choose differently.`,
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
      a:`Log choices per player and per situation and compute the variance. Then separate three causes: one option dominates numerically, the information needed to prefer another is missing, or the situations never differ. Each has a different smallest fix, so identify which before touching numbers.`,
      follow:`Variance is high across players and zero within each player. What does that mean?`,
      red:`Buffs the unpopular options by a flat percentage and re-ships.` },
    { q:`How do you measure decision density, and what do you do with the number?`,
      a:`Count decisions per minute from observation, not from the design document. Compare against the intended pace and against what the player’s attention can carry. Density raises engagement and fatigue at the same time, so the target depends on the session shape.`,
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
  what:`A structure where the player can choose a safer option with a modest payoff or a riskier one with a larger payoff, where the risk is legible and the outcome uncertain. It creates tension, expression (risk appetite) and mastery (reading the odds better over time). Fire Emblem’s weapon triangle is a clean example of a legible, positional risk layered on top of an ordinary hit-and-damage roll: a sword-user standing next to an axe-user has already changed the odds before either side attacks.`,
  why:[`Risk/reward manufactures tension without needing content. The same encounter becomes different depending on what the player wagers.`,`It personalizes play: cautious and bold players experience different games.`,`It is also where balance goes wrong most visibly: if the risky option is always right, it is not a risk.`],
  think:{ q:[`Can the player estimate the risk before committing? Can they learn to estimate it better?`,`Is the safe option ever right? If never, remove it or fix the numbers.`,`What does failure cost, and does the player know that cost when choosing?`,`Does the reward create a new situation, or just a bigger number?`],
    trade:[`Legible risk lets players reason and reduces surprise. Hidden risk surprises and frustrates.`,`Large punishments make risk exciting and drive away loss-averse players.`],
    traps:[`Rewarding risk with more resources, which snowballs and removes future decisions.`,`Making the “risk” pure randomness with no skill component to reading or mitigating it.`],
    good:[`Different players take different risks in the same spot.`,`Players talk about “going for it”.`],
    bad:[`Everyone takes the risky option, or nobody does.`] },
  how:[`For each risk/reward point, write the safe payoff, the risky payoff, the probability or skill check, and the cost of failure.`,`Check legibility: how does the player learn the odds? Through telegraphing, prior experience, or a number?`,`Check both options are situationally right. Write the situation where each wins.`,`Watch risk appetite in playtests. If it is uniform, the numbers or the information are wrong.`],
  ai:{ yes:[`Compute expected values and identify options that are never right.`,`Simulate risk points across skill levels to see when the risky option dominates.`,`Propose ways to make the risk legible without a number.`],
       no:[`Decide how punishing the game should be.`] },
  prompts:[{l:'Risk point analysis',p:`Here is a risk/reward point: safe option [A], risky option [B], probability or skill factor [P], failure cost [C]. Compute expected values for a novice and an expert. State when each option is correct. If one dominates, propose the smallest change to P, C or the payoffs that creates a real choice, and explain how the player would perceive the odds without reading a number.`}],
  verify:[`Did it account for downstream consequences (snowballing) or only immediate values?`,`Is its notion of “legible” grounded in what the player can see?`],
  test:[`Log choices at the risk point across players. Is there variance?`,`Ask players what they thought the odds were. Compare with reality.`,`Do players change their risk appetite as they improve?`],
  rel:[['decisions','Risk/reward is a decision shape.'],['tension-release','Risk is the engine of tension.'],['challenge-failure-recovery','Failure cost is half of risk.'],['economy-and-resources','Rewards that snowball break economies.']] });
TECH('risk-reward',[
  {n:'Risk pricing', how:`Make each risk cost something real and legible, so the reward is a decision not a formality.`, fit:`Combat, betting, exploration, push-your-luck.`, cost:`Punitive risk drives players to the safe option always.`, alt:`Tune the ratio per context. Test whether players take risks.`},
  {n:'Push-your-luck curves', how:`Let players choose when to bank. Make the marginal risk grow with the pile.`, fit:`Tension and memorable gambles.`, cost:`Can feel random without readable odds.`, alt:`Reveal enough odds to reason.`},
  {n:'Loss aversion management', how:`Decide what is lost, how much, and whether it can be recovered.`, fit:`Making stakes meaningful without rage-quit.`, cost:`Losing progress the player valued is a common quit trigger, because a loss weighs more than an equal gain. Needs recovery design.`, alt:`Prefer losing progress in a run, not in the account.`}
]);
ENGINE('risk-reward',{
  godot:{ term:`The odds live in code and the player’s estimate of them is a separate design artefact. Give the roll its own RandomNumberGenerator so an outcome is reproducible from a bug report, and telegraph the risk with something readable before the commit.`,
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
    pitfall:`Calling the global randf() for gameplay rolls. Every system shares that one stream, so adding an ambient effect that rolls once a second changes every combat outcome, and “it happened at 3:12 on seed 41” stops being reproducible. One generator per system that has to be replayable.`,
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
    pitfall:`Reading Random.Range(0, 100) as a percentile that includes 100. The integer overload excludes its maximum and the float overload includes it, so a check for 100 never fires on the integer overload, and a drop table written for rolls of 1 to 100 is one point off at every threshold, depending on which overload you happened to type. It is the most common silently wrong line in tuning code.`,
    map:`A Unity System.Random per system is a Godot RandomNumberGenerator instance, and Random.value is randf().` } });
INTERVIEW('risk-reward',{
  junior:[
    { q:`Why is risk and reward such a reliable decision engine?`,
      a:`It manufactures tension without new content, it personalises play because risk appetite differs, and it rewards learning to read the odds. The same encounter becomes several encounters depending on what the player wagers.`,
      follow:`Give an example from a game you know and name the cost of failure in it.`,
      red:`Describes a random chance with no judgement or mitigation available to the player.` },
    { q:`How does a player learn the odds without a percentage on screen?`,
      a:`Telegraphs they can read, prior experience with the same enemy or situation, the visible state of their own resources, and consequences that stay consistent. Making risk legible without a number is the actual design work, and a number is usually the lazy version of it.`,
      follow:`What happens when the odds are unknowable to the player?`,
      red:`Puts a percentage on the screen as the only way to make risk readable.` },
    { q:`Everyone takes the risky option. What does that tell you?`,
      a:`It is not a risk. Either the expected value favours it outright or the failure cost is too small to matter. Check both, then check whether the safe option is ever correct in any situation you ship.`,
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
      red:`Tunes on the team’s own play, which is expert play with hidden knowledge attached.` },
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
  what:`Agency: the player perceives that their choices cause outcomes, and that different choices would have caused different outcomes. Emergence: behaviours and strategies arising from rule interactions that were not individually authored. Together they produce stories players tell as their own.`,
  why:[`Perceived agency, not actual agency, drives the feeling of playing. A game can have real branches nobody notices, or a linear path that feels authored by the player.`,`Emergence makes a finite ruleset produce unbounded situations. It is the only scalable source of surprise.`,`Emergence is also where exploits and degenerate strategies come from. It needs stewardship, not suppression.`],
  think:{ q:[`Where does the player see that their choice mattered? How soon?`,`Which systems can affect which other systems? Where are the walls between them?`,`What is the strangest thing a player could do with these rules? Is it delightful or degenerate?`,`Am I preventing emergence by scripting outcomes I could have let the system produce?`],
    trade:[`More systemic openness yields more emergence and more balance and QA risk.`,`Authored set pieces deliver reliable peaks and reduce agency.`],
    traps:[`Fake choices (dialogue options that converge) that players detect within an hour.`,`Sealing systems from each other to make them easier to balance, which kills emergence.`],
    good:[`Players tell stories nobody on the team scripted.`,`Players find valid strategies you did not plan.`],
    bad:[`Players say “it did not matter what I picked”.`] },
  how:[`Draw the system interaction map: which systems read or write which state? Look for isolated islands.`,`For each major choice, identify when and how the player sees the consequence. If it is never or much later, add a nearer signal.`,`Deliberately connect two isolated systems and prototype. Watch for surprising strategies.`,`Classify each emergent strategy: celebrate, tune, or remove. Default to celebrate.`],
  ai:{ yes:[`Map system interactions from a design document and find isolated systems.`,`Brainstorm cross-system interactions and predict emergent strategies.`,`Stress-test rules for degenerate combinations.`],
       no:[`Decide which emergent strategies to keep. That is taste and identity.`] },
  prompts:[{l:'Collision search',p:`Here are our systems and the state each reads and writes: [MAP]. Identify pairs that never interact. For the 5 most promising pairs, describe a concrete interaction rule, the emergent strategy it might produce, whether that strategy would be delightful or degenerate for our fantasy ([FANTASY]), and the smallest prototype that would show it. Then list the 3 most dangerous existing interactions that could produce exploits.`}],
  verify:[`Are the predicted emergent strategies derivable from the rules, or wishful?`,`Did it distinguish delightful from degenerate using the fantasy, or its own taste?`],
  test:[`Do players describe outcomes as their doing?`,`Do players discover strategies that are not in the design document?`,`Ask players what would have happened if they had chosen differently. Can they say?`],
  rel:[['systemic-design','Systemic design is how emergence is engineered.'],['decisions','Agency requires decisions with consequences.'],['narrative-agency','Narrative agency is this topic applied to story.'],['procedural-content','Procedural systems are emergence applied to content.']] });
TECH('agency-and-emergence',[
  {n:'Interaction map', how:`Draw which systems read/write which state. Isolated islands create mini-games, connections create emergence.`, fit:`Finding where depth is waiting.`, cost:`Manual upkeep.`, alt:`Connect two isolated systems and prototype.`},
  {n:'Consequence proximity', how:`Ensure the player sees the outcome of a choice soon. Delayed or invisible consequences erase agency.`, fit:`Making choices feel real.`, cost:`Immediate consequences can remove strategy. Stagger signals.`, alt:`Near signal now, full payoff later.`},
  {n:'Emergence classification', how:`Classify surprising strategies as celebrate, tune or remove.`, fit:`Deciding what to do with the unexpected.`, cost:`Over-tuning kills the joy of discovery.`, alt:`Default to celebrate. Tune only degenerate cases.`}
]);
ENGINE('agency-and-emergence',{
  godot:{ term:`Emergence needs systems that can affect each other without knowing each other. Groups and signals are Godot’s answer: a fire announces that it is burning, and whoever cares reacts, including systems written months later.`,
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
    pitfall:`Calling a group directly from inside a physics callback. call_group runs immediately, so a handler that adds a body, disables a shape or toggles monitoring does it while the physics server is flushing queries, and Godot refuses with “Can’t change this state while flushing queries”, leaving the fire half applied. GROUP_CALL_DEFERRED costs one frame and buys a game you can debug.`,
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
      red:`Uses the two words interchangeably and treats both as “player freedom”.` },
    { q:`Why is perceived agency the thing you design for?`,
      a:`The player only has what they perceive. A linear path with a visible consequence feels authored by them. A branching one whose consequences land off screen does not. The lever is usually feedback timing rather than structure.`,
      follow:`How soon does the consequence have to become visible?`,
      red:`Counts endings or branch points as a measure of agency.` },
    { q:`Players say it did not matter what they picked. What do you check first?`,
      a:`Whether the consequence is visible at all, whether it arrives so late the choice has been forgotten, and whether the options diverge in play. Add a nearer signal before adding another branch, because the branch is the expensive fix.`,
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
  what:`Challenge is a task with uncertain success that demands skill or judgement. Failure is the outcome when it is not met. Recovery is how the player gets back to trying again: how fast, at what cost, with what new information. The triad decides whether struggle feels productive or punishing. Mega Man X6 (2001) shows why the cause matters: critics traced its harsh difficulty to stage design and to a rescue rule in which a roaming virus could make a Reploid, and the upgrade it carried, permanently unreachable.`,
  why:[`Without the possibility of failure, success has no meaning and tension is impossible.`,`How a game handles failure decides who keeps playing. Long recovery with no lesson is where mid-skill players quit.`,`The best failures teach: the player knows what went wrong and wants to try again immediately.`],
  think:{ q:[`When the player fails, do they know why? Could they say it in one sentence?`,`How many seconds from failure to the next attempt at the same challenge?`,`What does failure cost: time, resources, progress, pride? Is that cost proportional?`,`Does failure ever produce something interesting (a new situation, a story), or only a reset?`],
    trade:[`High failure cost raises tension and lowers experimentation.`,`Instant retry maximises learning and can trivialize stakes.`],
    traps:[`Punishing the player for the game’s own unclarity (unreadable telegraphs, hidden rules).`,`Difficulty settings as the only tool, instead of fixing the challenge design.`],
    good:[`Players retry immediately after failure, often with a different approach.`,`Players say “I see what I did wrong.”`],
    bad:[`Players stare, then quit. Or retry identically many times.`] },
  how:[`For each major challenge, write the intended lesson of failing it.`,`Ensure the game communicates the cause of failure within two seconds of it.`,`Measure recovery time to the retry. Cut anything in between that does not add information or meaning.`,`Consider “fail forward”: failures that create a new situation instead of a reset.`,`Test with players across skill levels. Track retry rate and approach change.`,`When a failure is permanent, put its odds on screen before the player commits: Fire Emblem shows both sides’ hit, damage and critical numbers before an attack, so a unit lost to permanent death traces back to a risk the player saw and accepted.`],
  ai:{ yes:[`Audit challenges for legibility of failure cause.`,`Propose fail-forward alternatives to resets.`,`Analyze retry logs for identical repetition (a sign the lesson is not landing).`],
       no:[`Decide how punishing the game should be.`] },
  prompts:[{l:'Failure lesson audit',p:`Here are our major challenges and what happens on failure: [LIST]. For each, state the lesson a player should learn from failing, how the game currently communicates the cause of failure and how quickly, the recovery time to retry, and the cost. Flag challenges where the cause is not communicated within 2 seconds or recovery exceeds 20 seconds. Propose, per flag, the smallest change and a fail-forward alternative.`}],
  verify:[`Does the audit assume players understand systems the game never explained?`],
  test:[`After a failure, ask “what happened?” Note whether the answer is accurate.`,`Time failure to retry.`,`Do players change approach after failure, or repeat?`,`Where do players quit after failing? How many failures preceded it?`],
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
    { q:`Testers call a section unfair. How do you find out what they mean?`,
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
  what:`The skills a game asks for (execution, timing, reading, planning, resource judgement, spatial reasoning, memory) and the arc by which a player acquires them. Mastery is the state where the player performs the skill fluidly and can express style within it. Dan Cook models this as skill atoms, each a loop of action, simulation, feedback and the player updating their mental model, linked into skill chains in which an atom can only be learned once the atoms it depends on are mastered. Flappy Bird is close to a single skill atom: one tap, a fixed rising arc, then a point or a crash, repeated against constants that never change during a run, so a veteran and a novice face the same pipe and differ only in timing.`,
  why:[`Competence is a primary motivator. A game with no skill to grow leaves only content to consume.`,`A skill ceiling below the player’s reach means boredom. A skill floor above it means churn.`,`Mastery must be perceivable. A player who improves without knowing it gets no reward from it.`],
  think:{ q:[`List the skills the game demands. Which one does the fantasy imply should be central?`,`How does a player know they have improved? Faster clears, new options, visible style?`,`What does the expert do that the novice does not? Can the novice see it?`,`Are there skills the game requires but never teaches?`],
    trade:[`Execution skill is legible and excludes players with lower reflexes. Judgement skill includes more players and is harder to feel.`,`High ceilings reward dedication and can intimidate.`],
    traps:[`Confusing stat growth with skill growth.`,`Demanding a skill the game never isolated for teaching.`],
    good:[`Veterans can explain what they do differently.`,`Novices can watch veterans and see it.`,`Veterans read state the game never displays, the way Monster Hunter players judge a monster’s remaining health from its limp and scars with no health bar on screen.`],
    bad:[`Players plateau early and describe the game as “just grinding”.`] },
  how:[`List skills. Mark each as taught, exercised, combined with others, and shown back to the player.`,`Find the gaps: skills required but never isolated, skills taught but never combined.`,`Design a mastery display: a place where the player’s improvement is visible (time, style, options).`,`Test with veterans and novices. Compare their play. The difference is your actual skill ceiling.`],
  ai:{ yes:[`Extract skill atoms from a mechanic list and map where each is taught and combined.`,`Propose mastery signals that do not rely on numbers.`,`Analyze play logs for the differences between novice and veteran behaviour.`],
       no:[`Decide which skill the game is about.`] },
  prompts:[{l:'Skill atom map',p:`Here are our mechanics and level order: [DESCRIPTION]. Extract the skills the player must acquire (execution, timing, reading, planning, resource judgement, spatial, memory). For each, identify where it is first isolated, first exercised under pressure, first combined with another skill, and how the player would perceive their own improvement. Flag skills that are required before they are isolated, and skills that never combine. Propose one mastery display for the central skill.`}],
  verify:[`Did it distinguish skill from stats?`,`Are the “where taught” claims grounded in the level order I gave?`],
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
    { q:`What skills does your game demand? Name them.`,
      a:`Decompose rather than saying “getting better at the game”. Execution, timing, reading, planning, resource judgement, spatial reasoning, memory. Then say which one the fantasy implies should be central, and whether the game ever isolates it for teaching.`,
      follow:`Which skill does your game demand but never teach?`,
      red:`Answers that players just get better with practice, with no decomposition at all.` },
    { q:`What is a skill atom, and why chain them?`,
      a:`Dan Cook’s framing: each atom gets taught, exercised, then combined with another. Chaining is how a game builds fluency instead of dumping demands at once. A skill required before it has been isolated is a design bug, and it shows up as deaths in the introduction.`,
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

T('time-and-turns',{ d:'core', t:'Time and turns', tag:'Real time asks for reflexes. Turns ask for judgement. Every structure is a trade between the two.',
  what:`How a game lets time pass decides what kind of thinking it rewards. Pure real time never stops: every action competes with the clock. Pure turn-based time only moves when a player commits: there is no clock to beat, only a decision to make well. Between these poles sit hybrids that borrow from both: ATB (Active Time Battle, introduced in Final Fantasy IV in 1991 by Hiroyuki Ito, reportedly inspired by Formula One cars lapping each other at different rates) fills a gauge per character so faster units act more often inside an otherwise turn-based menu. CTB (Conditional Turn-Based, Final Fantasy X) removes the clock entirely but keeps the same idea of variable turn frequency: agility and the rank of the chosen action shift a visible turn-order queue, so the player reasons about tempo without ever racing it. Shin Megami Tensei III: Nocturne’s Press Turn system turns weakness itself into time: a hit on an elemental weakness or a critical spends only half a turn icon, so exploiting the matchup earns extra actions as well as extra damage. Valkyria Chronicles' BLiTZ system splits every unit’s go into a turn-based Command Mode (spend Command Points to select a unit) and a real-time Action Mode (move and aim until an Action Point gauge drains), so tactical planning and physical aim sit inside the same turn. Baldur’s Gate and FTL run real time by default and let the player pause it to issue commands without penalty, so thinking time is free but only while the clock is stopped. Superhot inverts that: time crawls by default and runs at full speed only when the player moves, turning every twitch decision into a nearly untimed one. Simultaneous-turn systems (each side commits an action blind, then both resolve at once) keep the no-clock fairness of turns while adding the risk of a real-time exchange: you cannot react to what the opponent is doing, only predict it. Clair Obscur: Expedition 33 (Sandfall Interactive, 2025) layers a third axis onto a turn-based JRPG structure: while it is technically the enemy’s turn, the player must dodge, jump or parry in real time or take the full hit. Sid Meier’s Civilization shows that a strictly turn-based game can still feel as if something is always about to finish: a city’s production, a technology’s research and a unit’s movement each run on their own count with no shared clock, so every turn ends with some projects done and others a turn or two away.`,
  why:[`The time structure decides which skill the game is testing: reflex, prediction, or judgement under no time pressure at all. Picking one without meaning to is picking the wrong game for your fantasy.`,`Every hybrid is solving the same problem: reflex time structures are exciting but punish thinking, and pure turns are fair but can feel inert. The named systems above are all attempts to buy a bit of both.`,`Readability depends on the structure. A turn-order queue only works if the player can see it change before they commit; a real-time gauge only works if its fill rate is legible at a glance.`,`Changing the time structure changes who can play well. A twitch-heavy real-time combat system excludes players a turn-based version would welcome, and the reverse is true for players who find pure turns slow.`],
  think:{ q:[`Does the player need reflexes, prediction, or calm judgement to succeed here? Which one did you intend?`,`Can the player see, before committing, how their choice will change the order or timing of what happens next?`,`What happens to a player who freezes? Does the game punish hesitation (real time), tax it lightly (a fill gauge), or not touch it at all (pure turns)?`,`If you added a pause, would the game still be interesting, or was the pressure the whole design?`,`Is the time pressure coming from the same source as the skill you want to test, or is it fighting a different system (a UI you cannot read fast enough)?`],
    trade:[`Faster time structures create excitement and tension but shrink the amount of the game an anxious or slower player can access.`,`Every layer of hybrid (a gauge on top of a turn, a real-time dodge on top of a menu) adds a second skill the player must learn, on top of the first.`],
    traps:[`Adding a real-time element (a quick-time dodge, a reflex parry) to a turn-based game without asking whether it tests the same skill as the rest of the combat, or a completely different one bolted on.`,`Calling a gauge-fill system “real time” when, in Wait mode, decisions are still made from a paused menu. The structure is turn-based with variable turn order, not real time.`,`Hiding the turn-order queue or the gauge fill rate to reduce UI clutter, which removes the exact information the structure needs to feel fair rather than arbitrary.`],
    good:[`Players narrate their plan out loud before it resolves (“if I go now I beat her turn”), which means they can see the structure well enough to predict it.`],
    bad:[`Players describe the timing as luck rather than a call they made, which means the structure is not showing them enough to reason with.`] },
  how:[`Name the skill you want the loop to test: reflex, prediction under partial information, or judgement with no clock. Pick a time structure that tests that skill, not the one your genre defaults to.`,`If you are hybridising two structures, write down which one is fixed and which one flexes. ATB fixes the menu-command flow and flexes the tempo; BLiTZ fixes each phase’s Command Point budget and flexes the movement inside a go.`,`Make the structure visible: a turn-order strip, a gauge, a ghost of the last commit. If players cannot see the mechanism, they cannot plan against it and will call it unfair.`,`Playtest for hesitation and for the words players use afterwards. “I panicked” points at real time doing its job or misfiring; “I didn’t understand why that went first” points at an unreadable structure.`],
  ai:{ yes:[`List existing games by time structure and summarise what skill each is testing, to check your assumptions against precedent.`,`Draft the readability layer (what a turn-order strip or gauge needs to show) for a described combat system.`,`Simulate turn order across a batch of stat spreads to check that agility or speed differences produce the intended pacing, not degenerate double-turns.`],
       no:[`Decide which time structure will feel best. That is a playtest question, not a reasoning one, because it depends on what your specific players find tense versus stressful.`] },
  prompts:[{l:'Time-structure fit check',p:`Here is our combat loop: [DESCRIPTION]. State which time structure it currently uses (real time, turn-based, a named hybrid such as ATB, CTB, Press Turn, BLiTZ or pausable real time) and which skill that structure rewards: reflex, prediction, or untimed judgement. Compare that to the skill described in our design pillar: [PILLAR]. Flag any mismatch, and for each mismatch propose the smallest structural change (not a difficulty slider) that would close the gap. Then list what a player would need to see on screen, at a glance, for the chosen structure to feel fair rather than arbitrary.`}],
  verify:[`Did it name the actual skill being tested, or just repeat genre labels (“it’s turn-based so it’s strategic”)?`,`Are the proposed UI elements things a player can read mid-decision, or details only visible on a replay?`],
  test:[`Do players hesitate, and does the structure treat that hesitation the way you intended (punish it, tax it a little, or ignore it)?`,`Can a player explain, right after a match, why the order of events went the way it did?`,`Does a slower or more anxious playtester still reach the decision layer you care about, or do they get filtered out by the clock before they can think?`],
  rel:[['core-loop','The time structure is how the loop itself is paced.'],['decisions','Turn-based structures buy the player time to make a real decision; real time compresses it.'],['risk-reward','A gauge or a queue is usually where risk and reward get timed against each other.'],['skill-and-mastery','Reflex, prediction and judgement are three different skills a time structure can train.'],['game-feel-and-juice','Real-time feedback timing is where the time structure meets the body.']] });
TECH('time-and-turns',[
  {n:'Turn-order queue (CTB-style)', how:`Show the upcoming order of actors as a strip, and update it live as the player previews a command, since different actions change how soon a unit acts again.`, fit:`Any system with variable action speed where the player should reason about tempo, not just power.`, cost:`Extra screen space and a second UI system that must update in step with every previewed choice.`, alt:`Hide it on purpose in a game where guessing the order is itself the tension (a bluffing or ambush design).`},
  {n:'ATB gauge tuning (Active vs Wait mode)', how:`Give each unit a fill rate separate from a shared global tick, and choose whether the gauge keeps filling while a menu is open (Active) or freezes for it (Wait).`, fit:`Real-time pressure layered on top of menu-driven commands.`, cost:`Active mode punishes indecision and needs a stagger or interrupt window or it just feels like being ganged up on by the UI.`, alt:`Ship both modes as a difficulty or accessibility option, as later entries in the Final Fantasy series did.`},
  {n:'Pausable real time (RTwP) command layer', how:`Separate the world clock, which can freeze, from the input layer, which must stay responsive, so the player can issue several units their orders inside one stopped instant.`, fit:`Party-based tactics where you want real-time chaos between decisions (Baldur’s Gate, FTL).`, cost:`Players must trust that the moment they paused on was legible; pausing mid-animation can hide the information they paused to read.`, alt:`Add auto-pause triggers (enemy sighted, ally down, a cooldown ready) so the game catches the decision points a player would otherwise miss.`}
]);
ENGINE('time-and-turns',{
  godot:{ term:`A pausable or gauge-driven time structure needs two clocks: a world clock that a turn system can stop, and an input or UI clock that must keep responding even while the world is frozen. Godot gives you this split through process_mode.`,
    api:['Node.process_mode (PROCESS_MODE_INHERIT / PAUSABLE / WHEN_PAUSED / ALWAYS / DISABLED)','SceneTree.paused','Engine.time_scale','Timer.timeout','signal turn_ready(unit)','Curve / _process(delta) accumulation'],
    snippet:`extends Node
@export var combatants: Array[Combatant] = []
signal turn_ready(unit: Combatant)
const ATB_MAX := 1000.0

func _process(delta: float) -> void:
\tfor c in combatants:
\t\tif c.atb >= ATB_MAX: continue    # already waiting for its command
\t\tc.atb += c.speed * delta * 100.0
\t\tif c.atb >= ATB_MAX:
\t\t\tc.atb = ATB_MAX
\t\t\tturn_ready.emit(c)          # menu opens; gauge can wait or keep filling

func set_paused_for_menu(is_open: bool) -> void:
\tget_tree().paused = is_open        # world clock stops
\t# UI nodes need process_mode = WHEN_PAUSED to still take input here`,
    pitfall:`Setting get_tree().paused = true to open a command menu and assuming the menu still works. Every node defaults to PROCESS_MODE_INHERIT, which resolves to PAUSABLE from the root, so the menu’s own buttons stop receiving _process and input the instant the world pauses. A pausable-real-time or Wait-mode ATB design needs the UI subtree’s process_mode set to WHEN_PAUSED or ALWAYS, or the pause menu silently cannot be interacted with.`,
    map:`Godot’s Engine.time_scale is Unity’s Time.timeScale, and SceneTree.paused plus process_mode is how Godot pauses the world, where Unity sets timeScale to 0 and runs menus on unscaled time.` },
  unity:{ term:`The same two-clock split applies: Time.timeScale drives the simulated world, while UI and menu logic need to keep running at real time so a pause menu or a Wait-mode command menu stays interactive.`,
    api:['Time.timeScale','Time.unscaledDeltaTime','WaitForSecondsRealtime()','MonoBehaviour.Update()','event Action<Unit> TurnReady','AnimationCurve for speed-to-fill tuning'],
    snippet:`public class AtbClock : MonoBehaviour {
    [SerializeField] Unit[] units;
    const float AtbMax = 1000f;
    public event Action<Unit> TurnReady;

    void Update() {
        float dt = Time.deltaTime;   // world clock: stops when timeScale = 0 (pause, Wait mode)
        foreach (var u in units) {
            if (u.atb >= AtbMax) continue;   // already waiting for its command
            u.atb += u.speed * dt * 100f;
            if (u.atb >= AtbMax) { u.atb = AtbMax; TurnReady?.Invoke(u); }
        }
    }
}`,
    pitfall:`Reading Time.deltaTime inside a coroutine driven by WaitForSeconds to pace a turn queue. WaitForSeconds and deltaTime both scale with Time.timeScale, so setting timeScale to 0 for a pause menu silently stalls the whole turn clock, including the countdown that was supposed to keep the menu’s own animations moving. Use unscaledDeltaTime and WaitForSecondsRealtime for anything that must keep running while the world is paused.`,
    map:`Unity’s Time.timeScale is Godot’s Engine.time_scale, and unscaledDeltaTime is what Godot gives a Timer or SceneTreeTimer with ignore_time_scale set to true.` },
  note:`Both engines separate a clock the design wants to stop from a clock the interface needs to keep running. Whichever named system you build (ATB, BLiTZ, pausable real time), that split is the actual implementation problem, not the visual gauge on top of it.` });
INTERVIEW('time-and-turns',{
  junior:[
    { q:`What is the actual difference between turn-based and real-time, once you strip away the art?`,
      a:`In turn-based play, time only advances when a player commits to a decision, so there is no clock to beat, only a choice to make well. In real time, time advances regardless of what the player does, so acting late has a cost the game enforces on its own. Name a game for each and say what skill each one is testing.`,
      follow:`Where would you place a gauge-fill system like ATB on that line?`,
      red:`Treats “turn-based” and “slow” as synonyms, or cannot separate the time structure from the genre it usually appears in.` },
    { q:`What problem was ATB solving when Final Fantasy IV introduced it in 1991?`,
      a:`Pure turn-based play gives every unit an equal, static claim on the timeline regardless of how fast they are meant to be. Active Time Battle gives each unit its own fill rate, so a fast unit can act more often than a slow one without leaving the underlying structure a menu-driven turn system. Hiroyuki Ito is credited with the idea, reportedly inspired by cars lapping each other at different speeds in Formula One.`,
      follow:`What would go wrong if every unit filled its gauge at exactly the same rate?`,
      red:`Cannot explain what ATB changes about turn order, or describes it purely as a visual bar with no mechanical consequence.` },
    { q:`Why does Superhot’s “time moves only when you move” count as a time structure at all?`,
      a:`It is real time with the clock’s default state set to a crawl instead of full speed, so the pressure a player feels comes entirely from their own decision to act, not from an external timer. That makes every action effectively untimed for the mind while still real time for the body. Explain how that changes what “hesitation” means in that game compared with a game with a running clock.`,
      follow:`The world crawls rather than stops when you stand still. Why not freeze it completely?`,
      red:`Calls it “just slow motion” without noticing that the clock’s default state, crawling versus running, is the actual design choice.` }
  ],
  mid:[
    { q:`A playtester says your gauge-based combat “feels unfair.” How do you find out whether the structure or the readability is at fault?`,
      a:`Check first whether the player could see the information that decided the outcome before committing: the gauge fill rate, the turn-order queue, the cost of the action they picked. If that information was visible and legible, the structure itself may be the problem (too much variance, a dominant fast strategy). If it was not visible, the fix is a UI change, not a rebalance. Separating these keeps you from rebalancing numbers to fix a display problem.`,
      follow:`Your fix candidate is a turn-order strip. What do you have to update every time the player previews a command?`,
      red:`Jumps to rebalancing numeric speed stats without first asking whether the player could see the mechanism.` },
    { q:`Design a hybrid that borrows from both BLiTZ and pausable real time. What is the one thing you must decide first?`,
      a:`Which clock is fixed and which one flexes. BLiTZ fixes the budget of goes (Command Points decide how many goes, the player decides whose) and lets movement inside that go run in real time. Pausable real time leaves the whole world running and lets the player freeze it on demand. Combining them means deciding whether the “go” itself is ever real-time-interruptible by another unit, which is the actual design question, not the art direction.`,
      follow:`What breaks if you let the player pause during another unit’s real-time movement phase?`,
      red:`Describes a hybrid purely in terms of presentation (a countdown bar plus a 3D camera) with no account of which clock governs what.` },
    { q:`How would you playtest whether a time structure is testing the skill you intended?`,
      a:`Watch for the words players use afterwards: “I panicked” or “I didn’t see it coming” points at reflex; “I predicted she’d go there” points at prediction under partial information; silence and careful narration points at untimed judgement. Compare that against the skill named in your design pillar, and treat a mismatch as a structural problem, not a tuning one.`,
      follow:`Two different playtester groups report two different skills being tested by the same system. What does that usually mean?`,
      red:`Equates “players found it hard” with “the structure is testing the right skill.”` }
  ],
  senior:[
    { q:`You inherit a turn-based game where players describe outcomes as luck rather than a call they made. Where do you look first?`,
      a:`Before touching the numbers, check whether the mechanism that decides order or outcome is visible at the moment the player commits. A perfectly deterministic turn-order system that is hidden behind an unreadable UI produces the same complaint as genuine randomness. Fix visibility first, then re-test for the luck complaint before assuming the maths needs to change.`,
      follow:`The visibility fix does not remove the complaint. What do you check next?`,
      red:`Adds a random-seed display or a “why did that happen” tooltip without first confirming the underlying system is even deterministic.` },
    { q:`You are asked to add a real-time dodge or parry layer to an otherwise turn-based JRPG, in the manner of Clair Obscur: Expedition 33. What is the design risk specific to that decision?`,
      a:`You are now testing two different skills in one combat encounter: judgement, from the turn-based decision layer, and reflex, from the real-time dodge or parry. If the reflex layer is demanding enough, it can dominate the experience and make the careful turn-based planning feel irrelevant, or the reverse, where the dodge window is so generous it is decoration. State how you would tune the two layers to matter roughly in proportion to the fantasy you are selling.`,
      follow:`A significant slice of your audience has slower reaction times. How do you keep the turn-based layer meaningful for them without removing the reflex layer for everyone else?`,
      red:`Bolts on a quick-time event without considering whether it competes with, rather than complements, the existing decision layer.` }
  ] });
DIAGRAM('time-and-turns', { kind:'quad', title:'Time structures: pressure against planning time', x:'Pressure to react fast', y:'Time to plan before acting',
  points:[{t:'Real-time', x:0.92, y:0.06},{t:'Turn-based', x:0.05, y:0.95},{t:'ATB', x:0.6, y:0.4},{t:'CTB', x:0.15, y:0.85},{t:'Press Turn', x:0.2, y:0.78},{t:'BLiTZ', x:0.65, y:0.45},{t:'Pausable RT', x:0.4, y:0.68},{t:'Superhot', x:0.3, y:0.92}],
  note:'Most named hybrids exist to sit somewhere off the two extremes, buying a little planning time without giving up all the pressure.' });

T('genre-hybrids',{ d:'core', t:'Genre hybrids', tag:'A hybrid is not two games glued together. Each loop must need the other, or one of them is decoration.',
  what:`A genre hybrid composes two core loops so that progress or currency in one changes what is possible in the other. Persona’s social-sim calendar loop (spend a limited number of afternoons and evenings on relationships, study or a job) feeds directly into the strength of the Personas fused for the dungeon-crawling loop; the dungeon loop, in turn, produces the time pressure that gives the calendar its stakes. Valkyria Chronicles binds a turn-based Command Mode to real-time Action Mode movement, so the tactics loop and the shooting loop are the same loop viewed at two zoom levels, not two separate games. Into the Breach pairs a puzzle loop (every enemy telegraphs its exact next move, so each turn is a solvable arrangement problem) with a light roguelike meta-loop (permanent pilot unlocks and squad choices carried between short runs). Slay the Spire fuses deckbuilding (choosing and synergising cards) with a roguelike run structure (a generated, branching map of escalating fights where a single death ends the run), so the deckbuilding decisions matter because the run loop makes them permanent for that attempt and the run loop has stakes because the deck is what you are risking. Stardew Valley pairs a farming and social-calendar loop with a combat-and-mining loop in its caves, and the two feed each other directly: ore and gems from the mines upgrade farm tools and buildings, and farm income buys the equipment that makes deeper mining survivable. A hybrid fails when the two loops do not need each other: one becomes the “real game” and the other becomes an unskippable chore that exists only to unlock it, which is two half-games rather than one whole one.`,
  why:[`Two loops that feed each other create variety without diluting focus: the player is never doing “filler,” because everything they do in one loop changes the other.`,`Hybrids are a common way to extend how long a single core loop stays interesting, since a second loop can supply new situations the first loop cannot generate on its own.`,`A failed hybrid is a specific and diagnosable failure: not “boring,” but “the two halves don’t need each other,” which points straight at the fix.`],
  think:{ q:[`What exactly crosses from Loop A into Loop B, and does it also cross back? A one-way bridge means only one loop is feeding the other.`,`If you deleted Loop B entirely, would Loop A still be worth playing on its own? If yes, Loop B may be optional content, not a hybrid.`,`Do the two loops ask for the same kind of attention (both calm and planned, both fast and reactive), or do they force an awkward context-switch every time?`,`Would a player who is only good at one of the two loops still be able to finish the game, or does the hybrid gate one skill behind mastering an unrelated one?`],
    trade:[`A tight bridge (one clear currency crossing both ways) is easy to read but can make the connection feel mechanical; a loose, thematic bridge feels richer but is harder for players to reason about.`,`Two loops with very different pacing (a slow calendar, a fast dungeon) create welcome variety but double the tutorial and balancing work.`],
    traps:[`Building the bridge currency so it only flows one direction, so one loop is secretly just a shop for the other.`,`Assuming a hybrid is validated because each loop is fun in isolation. A great puzzle loop and a great deckbuilding loop stitched together with no real connection are still two separate games.`,`Copying a hybrid pairing that worked for another game’s fantasy without checking whether your two loops share the fiction that made the original pairing feel natural.`],
    good:[`Players talk about the two loops in the same sentence, unprompted (“I skipped hanging out with her so I could level up for tomorrow’s dungeon”).`],
    bad:[`Players openly describe one loop as a chore they endure to get back to the other.`] },
  how:[`Name the one resource, stat or piece of information that is meant to cross from each loop into the other, in both directions if the hybrid is meant to be mutual.`,`Prototype each loop alone first and confirm it holds up without the other, using the same grey-box discipline as any core loop test.`,`Combine them and specifically test the bridge: remove it for a session and see whether players still choose to do both loops, or whether one collapses into a chore without the currency forcing them into it.`,`Watch session shape in playtests: do players context-switch cleanly between the two loops, or does the transition itself feel like friction?`],
  ai:{ yes:[`List existing genre hybrids and map exactly what crosses between their loops, to build a reference set before designing your own.`,`Draft several candidate bridge currencies for a described pair of loops and flag which ones are one-way.`,`Simulate a player who only engages with one loop and report how far they could get, to test whether the hybrid secretly gates on both skills.`],
       no:[`Decide whether a hybrid pairing will feel thematically coherent. That depends on the specific fiction and needs a human read, then a playtest.`] },
  prompts:[{l:'Bridge audit',p:`Here are our two loops: Loop A: [DESCRIPTION]. Loop B: [DESCRIPTION]. State exactly what currency, stat or information crosses from A to B, and from B to A if anything does. Flag if the bridge is one-way. Then argue, from the loops alone, what happens to each loop if the other were deleted: does it remain worth playing, or does it collapse into a hollow, unskippable requirement? Propose one change that would make a one-way bridge mutual, and one alternate bridge currency entirely, so I can compare.`}],
  verify:[`Did it trace the bridge currency through both loops, or just describe each loop separately and call that an analysis?`,`Is the “collapses without the other” argument grounded in the loops' own mechanics, or an assumption about what players enjoy?`],
  test:[`Take the bridge currency away for one test session. Do players still choose to engage with both loops?`,`Ask players to describe the game in one sentence. Do they mention both loops, or only one?`,`Time how long the average context-switch between loops takes, and whether players describe it as a break or as friction.`],
  rel:[['core-loop','A hybrid is still judged by whether each loop it contains holds up alone.'],['systemic-design','Two loops feeding each other is systemic design at the scale of the whole game.'],['economy-and-resources','The bridge between two loops is almost always a resource, with its own sources and sinks.'],['mechanics-and-rules','Each loop is built from mechanics that must still create real decisions on their own.'],['prototyping','Test each loop in isolation before testing the hybrid, the same discipline as any core loop.']] });
TECH('genre-hybrids',[
  {n:'Currency bridge', how:`Define one explicit resource that visibly crosses both loops (a bond bonus feeding fusion strength, ore feeding tool tiers) so the connection is legible, not just numeric.`, fit:`Any two-loop pairing that needs the player to feel the link, not infer it.`, cost:`If the bridge currency is the only reason to touch the “other” loop, that loop risks becoming a chore for unlocking it.`, alt:`Make the bridge run both ways so each loop needs the other, not just supplies it.`},
  {n:'Session-shape separation', how:`Give each loop a distinct pacing and input mode (a calm menu-driven calendar versus a fast spatial dungeon) so players context-switch cleanly instead of the two blurring into one mushy interaction.`, fit:`Hybrids where the two loops are meant to feel like different modes of play.`, cost:`Two distinct skill sets to teach, tune and playtest, roughly doubling the onboarding surface.`, alt:`A shared home-base screen that transitions between modes without hiding that a seam exists.`},
  {n:'Kill-one-loop test', how:`Build and playtest each loop in isolation, stripped of the other, and ask whether it survives on its own before ever testing them together.`, fit:`Diagnosing whether a hybrid is two strong halves or one loop propping up a weak one.`, cost:`Costs two separate prototypes' worth of production time before hybrid testing can even begin.`, alt:`If a loop fails alone, do not just wire in the bridge currency to paper over it; the other loop will inherit the same weakness.`}
]);
ENGINE('genre-hybrids',{
  godot:{ term:`Two loops that must not know about each other’s internals still need one shared place to read and write the bridge currency. An autoload singleton, kept deliberately thin, is that place; the loops only ever touch it through named methods and signals, never each other directly.`,
    api:['Autoload / Project Settings > Autoload','signal bond_changed(amount)','Resource-based save data','Node groups for cross-scene lookup','get_tree().change_scene_to_file()','ResourceSaver.save() / ResourceLoader.load()'],
    snippet:`# res://autoload/bridge.gd, added once as an Autoload named Bridge
extends Node
signal bond_changed(new_total: int)
var bond_points := 0

func add_bond(amount: int) -> void:
\tbond_points += amount
\tbond_changed.emit(bond_points)     # dungeon loop reacts without knowing the calendar exists

func fusion_power_bonus() -> int:
\treturn bond_points / 10            # the one number that crosses the bridge`,
    pitfall:`Reading another autoload from inside _ready() before Godot has finished loading autoloads in project order. Autoloads initialise in the exact order listed in Project Settings, so a dungeon-loop autoload that reads Bridge.bond_points in its _ready() gets 0, not the saved total, if Bridge loads its save in _ready() and is listed later. Read shared state lazily, on the signal or the frame it is needed, not at startup.`,
    map:`A Godot autoload singleton is Unity’s persistent ScriptableObject or a lightweight service locator, and a Godot signal is a UnityEvent or a C# event.` },
  unity:{ term:`The same shared-but-decoupled bridge is commonly built as a ScriptableObject asset that both loops reference by inspector slot: neither scene needs a hard reference to the other, only to the shared asset.`,
    api:['ScriptableObject shared-data asset','UnityEvent / event Action<int>','[CreateAssetMenu]','SceneManager.LoadScene()','OnEnable() / OnDisable() for event subscription','JsonUtility for save data'],
    snippet:`[CreateAssetMenu(menuName = "Bridge/BondPoints")]
public class BondPoints : ScriptableObject {
    public int total;
    public event Action<int> Changed;
    public void Add(int amount) {
        total += amount;
        Changed?.Invoke(total);       // dungeon loop reacts without a scene reference
    }
    public int FusionBonus() => total / 10;
}`,
    pitfall:`Treating the ScriptableObject asset’s field values as reset on play. They are serialised on disk, so a value changed during one Play Mode session in the editor persists into the next one unless you explicitly reset it when a new game or session starts, which reads as “stale progress from last time I tested this.”`,
    map:`A Unity ScriptableObject shared-data asset is Godot’s autoload singleton for the same purpose, and Changed is the signal both loops listen to instead of referencing each other.` },
  note:`The engine-level lesson is the same as the design one: the bridge should be the only thing the two loops share. Reach for the smallest shared object that carries the currency, not a shared parent scene or a chain of direct references between the two systems.` });
INTERVIEW('genre-hybrids',{
  junior:[
    { q:`What makes a genre hybrid different from a game that just has two features?`,
      a:`In a hybrid, something earned or built in one loop changes what is possible in the other, in both directions, or one loop becomes a shop for the other. A game that merely bundles two unrelated modes (a minigame that does not affect anything else) is not a hybrid, it is two features sharing a menu. Give an example of a currency that crosses between two loops in a game you know.`,
      follow:`Is the crossing in your example one-way or two-way?`,
      red:`Describes two systems existing in the same game with no mention of anything crossing between them.` },
    { q:`Persona’s dungeon-crawling gets harder if you never build relationships. Why is that a hybrid decision and not a difficulty setting?`,
      a:`The calendar loop is the source of the resource (bonds) that boosts how strong the fusion loop’s output turns out, so skipping one loop has a direct, designed effect on the other, not an optional side quest’s worth of bonus loot. That is what makes them one hybrid system instead of a main game plus a side game.`,
      follow:`What would change if bonds only affected cosmetic rewards instead of fusion power?`,
      red:`Treats the social sim as flavour content unrelated to the “real” dungeon game.` },
    { q:`Why can a hybrid fail even when both of its loops are individually well designed?`,
      a:`Because a hybrid is a claim about the connection between the loops, not about either loop alone. Two well-built loops with no real bridge, or a one-way bridge, are still two half-games bolted together; the individual quality of each does not fix the missing or broken connection.`,
      follow:`How would you test for a missing connection specifically, rather than testing each loop on its own?`,
      red:`Argues a hybrid must be good because each half tested well in isolation.` }
  ],
  mid:[
    { q:`You are handed a prototype where players skip one of the two loops entirely once they find an efficient path. Diagnose it.`,
      a:`Check whether the bridge is one-way and whether the skipped loop is the source or the destination of the currency. If it is the source and there is another, faster way to get the same currency, that loop has been made optional by an unintended shortcut, not by design. Trace the actual resource flow before assuming the loop itself is unfun.`,
      follow:`The shortcut turns out to be intended, a reward for mastery. Does that change your answer?`,
      red:`Proposes making the skipped loop more fun without first tracing why it stopped being necessary.` },
    { q:`How would you prototype a brand-new hybrid pairing cheaply, before committing to full production of both loops?`,
      a:`Build the two loops as separate, minimal grey-box prototypes first and confirm each holds up alone. Only then wire in the smallest possible bridge (a single number crossing over) and test whether players choose to move between the two loops without being forced. That order avoids sinking full production budget into a hybrid whose halves were never independently sound.`,
      follow:`One of your two grey-box loops does not hold up alone. What are your options?`,
      red:`Jumps straight to building the full hybrid because the pitch sounded exciting.` },
    { q:`What is the risk of a “session-shape mismatch” between two hybridised loops, and how do you spot it in a playtest?`,
      a:`If one loop is slow and planned (a calendar) and the other is fast and reactive (real-time combat), players may resent the context switch itself, independent of either loop’s quality. Watch for hesitation or complaints at the transition point specifically, not during either loop, since that pinpoints the seam rather than either half.`,
      follow:`Playtesters enjoy both loops but dread the transition screen between them. What do you change first?`,
      red:`Rebalances one of the loops in response to a complaint that is about the transition between them.` }
  ],
  senior:[
    { q:`A live hybrid game is losing players between its two loops: engagement in Loop A is healthy, but players stop touching Loop B after a few sessions. How do you decide whether to fix the bridge or cut Loop B?`,
      a:`Check whether the bridge still gives Loop B a reason to exist once players have enough of the crossing currency banked; a bridge that only matters early creates exactly this drop-off. If the currency’s value decays or scales with continued play, the fix is rebalancing the bridge. If Loop B has nothing left to offer once its currency is banked, cutting or reworking it is the more honest answer than propping it up.`,
      follow:`Cutting Loop B is politically difficult because a team built it. How do you present the recommendation?`,
      red:`Recommends adding more content to Loop B without first checking whether the bridge itself still has a reason to pull players there.` },
    { q:`You are asked to hybridise two loops from two different existing games in your portfolio, on a tight schedule that does not allow separate prototyping. What do you insist on anyway?`,
      a:`At minimum, a fast paper or numbers-only pass that traces the intended bridge currency through both loops and checks it flows both ways, since that is the one thing a schedule cut cannot safely skip: an untested one-way bridge is a common, costly hybrid failure. Everything else (art, full grey-box prototypes) can be sequenced around the schedule; the bridge cannot be discovered broken after both loops are built.`,
      follow:`The bridge check reveals the connection is currently one-way. What is the minimal fix given the schedule?`,
      red:`Accepts the schedule cut as covering the bridge check too, and finds out the connection is broken only after both loops ship.` }
  ] });
DIAGRAM('genre-hybrids', { kind:'loop', title:'One hybrid, seen as a single cycle', steps:[{t:'Loop A plays out', d:'the planning loop plays out'},{t:'Bridge currency', d:'a resource crosses over'},{t:'Loop B spends it', d:'a cost or test happens'},{t:'Loop B returns', d:'loot or cost flows back'},{t:'Both loops renew', d:'both loops continue, changed'}],
  note:'Drawn as one cycle rather than two separate loops, because that is what a working hybrid is: Persona’s bonds feeding fusion power, Stardew’s ore feeding farm tools, are the same shape.' });
