/* =====================================================================
   CORE GAMEPLAY
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'core', lens:'design', t:'Core Gameplay', short:'Loop, decisions, risk, skill, agency, failure', color:'var(--d-core)',
    sum:`The thing the player does over and over. If the core interaction is not compelling on its own, no amount of progression, content or narrative rescues it. Fix the loop before you multiply it.`,
    links:[['systems','Systems give the loop its variables: what changes between one iteration and the next.'],['ux','Input, readability and feedback are the loop as the player physically meets it.'],['presentation','Game feel lives at the seam between the loop and presentation.'],['production','The loop is the first thing you prototype and the thing you playtest most.']] });

T('core-loop',{ d:'core', t:'The core loop', tag:'Decision → Action → Consequence → Feedback → New situation. Every link must hold.',
  what:`The shortest cycle of play the player repeats: they decide what to do, they act, the game state changes as a consequence, the game shows them what changed, and the changed state is a new situation that asks for a new decision. When one link is weak the loop leaks and no amount of content refills it. In Bejeweled choosing among the legal swaps is the decision, the swap is the action, the cleared gems and the cascade are the consequence, the clearing animation and the score are the feedback, and the refilled board is the new situation. Cities: Skylines runs the same loop on a city’s traffic: deciding what to zone is the decision, zoning is the action, the changed flow of cars on a rezoned street is the consequence, the congestion colours on the road are the feedback, and the next jam it creates is the new situation.`,
  why:[`Players spend most of their time in the core loop. It is the game.`,`Every other system (progression, content, narrative) multiplies the loop. Multiplying a weak loop multiplies weakness.`,`Loop failures have characteristic symptoms, which makes them diagnosable.`],
  think:{ q:[`Is there a decision, or a single obvious best move?`,`What does the player do most often, physically? Is that the fantasy verb?`,`Does the action change anything the player will meet later?`,`After an action, can the player say what happened and why?`,`Does the situation after the loop differ from the one before it?`],
    trade:[`Fast loops (seconds) reward feel and reflex. Slow loops (minutes) reward planning. Each attracts different players.`,`More decision density increases engagement and cognitive load.`],
    traps:[`Describing the loop as a flowchart of systems (gather, craft, fight, upgrade) rather than as what the player experiences.`,`Assuming a loop is fun because it is genre standard.`],
    good:[`A stripped prototype (grey boxes, no progression) is voluntarily replayed.`,`Two players given an identical toolkit still produce different match outcomes purely from spacing and timing, the way Street Fighter’s neutral game does.`,`Players replay a calm, danger-free delivery for hundreds of hours once its payout feeds a slower loans-garages-drivers loop, as in Euro Truck Simulator 2.`],
    bad:[`Players say “I will keep going to unlock X” rather than “I want to do that again”.`] },
  how:[`Write the loop in five sentences from the player’s point of view, one per link, in order: decision, action, consequence, feedback, new situation.`,`Build the loop alone: no progression, no content variety, no story. Grey boxes.`,`Playtest it. If players do not voluntarily repeat it, diagnose which link is weak using the Core Loop Diagnostic.`,`Fix one link, test again. Only when the bare loop is replayed do you start multiplying it.`],
  ai:{ yes:[`Rewrite your loop description from the player perspective and flag missing links.`,`Generate variations of one link (e.g., five alternative decision structures) to test.`,`Build the grey-box prototype quickly.`,`Analyze playtest notes for symptoms of each weak link.`],
       no:[`Decide the loop is fun. Only repetition by players shows that.`,`Add systems to compensate for a weak link before the link is fixed.`] },
  prompts:[{l:'Loop link audit',p:`Act as a sceptical systems designer. Here is our core loop as the player experiences it: [FIVE SENTENCES]. For each link (decision, action, consequence, feedback, new situation), rate its strength, state the evidence you are using from my description, and name the symptom a playtest would show if it were weak. Then propose 3 variations for the weakest link, each with the player decision it creates, the emotion intended, the likely failure mode, and the observable signal that would validate it. Do not recommend one yet.`},
    {l:'Prototype build',p:`Build a minimal playable prototype of this loop in [ENGINE/HTML]: [LOOP]. Grey boxes only, no menus, no progression, no audio beyond a single feedback tone. Expose these tuning values as on-screen sliders: [VALUES]. Log every player action with a timestamp to a downloadable text file so I can analyse repetition and decision variety.`}],
  verify:[`Did it rate links based on my description or on genre assumptions?`,`Are the proposed variations mechanically distinct, or the same idea reskinned?`,`Does the prototype isolate the loop, or did it sneak in progression?`],
  test:[`Do players repeat the loop voluntarily when nothing rewards them for it?`,`Can they explain what happened after an action?`,`Do different players make different choices at the decision point?`,`Do they notice the situation changed?`],
  rel:[['genre-hybrids','Two loops can share a game only when each one feeds the other.'],['decisions','The decision link is where most loops fail.'],['feedback-and-affordance','Feedback is the link UX owns.'],['game-feel-and-juice','Action feel is the loop as the body experiences it.'],['prototyping','The loop is the first prototype.'],['systemic-design','Systems supply the new situation.']] });
TECH('core-loop',[
  {n:'Loop mapping', how:`Write the loop as decision → action → consequence → feedback → new situation and mark the weak link.`, fit:`Diagnosing why repetition bores or why actions feel weightless.`, cost:`None worth mentioning. It is the cheapest diagnostic you have.`, alt:`Pair with the Core Loop diagnostic view.`},
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
      a:`Name the repeated unit: decision, action, consequence, feedback, new situation. Then walk one concrete iteration of a real game in those five beats. Say how long one iteration takes. Say what changes between iteration one and iteration two, because a loop with nothing changing is a chore.`,
      follow:`Now name the loop one layer out. What is the three-minute loop that the three-second loop feeds?`,
      red:`Describes the game’s feature list, or answers with a genre label (“it’s a roguelike”) instead of a repeated unit of play.` },
    { q:`Where does feedback belong in the loop, and how late is too late?`,
      a:`Feedback is how the player reads the consequence: without it they cannot learn what their action did. Immediate confirmation should land inside roughly 100 ms so the action feels connected. The consequence can resolve later, but the acknowledgement cannot. Give an example of a game where the acknowledgement and the outcome are deliberately split.`,
      follow:`What do you do when the real outcome takes two seconds to compute or has to come back from a server?`,
      red:`Treats feedback as visual polish added at the end, or cannot distinguish acknowledging the input from resolving the outcome.` },
    { q:`In an engine of your choice, where would you put the loop code?`,
      a:`Input sampled every frame so no press is dropped, rules resolved on the fixed step so the same action resolves the same way on any machine, and the consequence raised as an event rather than called inline. In Unity that is Update plus FixedUpdate plus a UnityEvent. In Godot that is _process, _physics_process and a signal.`,
      follow:`What breaks if you sample the attack button in FixedUpdate?`,
      red:`Puts everything in Update or _process and does not know why frame-rate independence matters.` }
  ],
  mid:[
    { q:`A playtest says the game is repetitive. How do you find out which part of the loop is at fault?`,
      a:`Do not add content. Instrument one iteration: is there a decision with a real trade-off, is the action varied, does the consequence change the next situation, is the feedback readable. Watch six players and count decisions per minute. Repetitiveness is almost always a missing decision or an unchanging situation, not a missing feature.`,
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
  steps:[{t:'Decision', d:'the player picks what to do'},{t:'Action', d:'the player commits to a move'},{t:'Consequence', d:'the state changes, and it matters'},{t:'Feedback', d:'the game shows what changed'},{t:'New situation', d:'a fresh problem to read'}],
  note:'Break any link and the loop stops teaching or rewarding: no feedback, no learning; no consequence, no decision.' });

T('decisions',{ d:'core', t:'Meaningful decisions', tag:'A decision is meaningful when the options are different, the outcome is uncertain, and the player cares.',
  what:`Sid Meier described a game as a series of interesting decisions. Slay the Spire is full of them: take this card or skip it, spend the campfire on rest or on an upgrade, fight the elite for a relic or avoid it. An interesting decision has a real tradeoff (no dominant option), depends on the situation (the right answer changes), and reflects the player (different players choose differently). Decision density is how often the player faces one. Decision weight is how much rides on it.`,
  why:[`Decisions are where agency lives. Remove them and the player is watching, not playing.`,`A dominant option turns a decision into a puzzle with one answer, then into a chore.`,`Depth is measured in meaningful decisions, not in rules.`],
  think:{ q:[`For this choice, what does the player give up by picking each option?`,`Would an expert always pick the same option? Then it is not a decision.`,`Does the player have enough information to reason, and enough uncertainty to feel risk?`,`Does the choice reveal something about the player?`],
    trade:[`More information makes decisions more reasoned and less tense.`,`Frequent decisions raise engagement and fatigue.`],
    traps:[`Offering options that differ in flavour but not consequence.`,`Hiding the tradeoff so the player cannot reason about it (a decision they cannot understand is a guess).`,`Balancing by making everything equal, which erases situational preference.`],
    good:[`Players hesitate, then commit, then look to see if it worked.`,`Players argue about the right choice.`,`Players weigh a choice’s cost before the game states it, as The Witcher 3 teaches by not showing whether sparing or killing the Whispering Hillock affects the Baron’s wife until Geralt catches up with her, often hours later.`],
    bad:[`Players pick the same option every time, or pick without looking.`] },
  how:[`List the decisions in one loop iteration. For each, write the trade-off in one sentence. If you cannot, it is not a decision.`,`Check for situational variance: describe two situations where the best choice differs.`,`Check information: what does the player know when choosing? Is it enough to reason, and not enough to be certain?`,`Playtest and log choices. Low variance across players or situations flags a dominant option.`,`When you add an option, check it does not make the situational ones pointless: IGN’s Lucas M. Thomas said Mega Man 4’s chargeable Mega Buster left many of the boss weapons useless.`,`For Fallout: New Vegas, Obsidian ran repeated “Karma Police” passes that counted how often each skill was checked across the scripts, an audit that catches decisions quietly narrowing to the two or three cheapest skills to write for.`,`Turn a gradual gain into a single, priced commitment when you want it read as a decision: Age of Empires II charges a lump sum, 500 food for the Feudal Age, 800 food and 200 gold for the Castle Age, the instant a player queues the advance, rather than accruing the upgrade over time.`],
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
\t\t%Options.remove_child(child)          # queue_free alone leaves it in the tree until frame end
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
        Button first = null;
        foreach (var opt in options) {
            var b = Instantiate(template, template.transform.parent);
            b.GetComponentInChildren<TMP_Text>().SetText($"{opt.label}  (-{opt.cost})");
            b.onClick.AddListener(() => Choose(opt));
            b.gameObject.SetActive(true);
            first ??= b;                          // child 0 is the inactive template, so keep the first real button
        }
        if (first != null) EventSystem.current.SetSelectedGameObject(first.gameObject);
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
  what:`A structure where the player can choose a safer option with a modest payoff or a riskier one with a larger payoff, where the risk is legible and the outcome uncertain. It creates tension, expression (risk appetite) and mastery (reading the odds better over time). Fire Emblem’s weapon triangle is a clean example of a legible matchup risk layered on top of an ordinary hit-and-damage roll: a sword-user attacking an axe-user has already changed the odds before the roll.`,
  why:[`Risk/reward manufactures tension without needing content. The same encounter becomes different depending on what the player wagers.`,`It personalizes play: cautious and bold players experience different games.`,`It is also where balance goes wrong most visibly: if the risky option is always right, it is not a risk.`],
  think:{ q:[`Can the player estimate the risk before committing? Can they learn to estimate it better?`,`Is the safe option ever right? If never, remove it or fix the numbers.`,`What does failure cost, and does the player know that cost when choosing?`,`Does the reward create a new situation, or just a bigger number?`],
    trade:[`Legible risk lets players reason and reduces surprise. Hidden risk surprises and frustrates.`,`Large punishments make risk exciting and drive away loss-averse players.`],
    traps:[`Rewarding risk with more resources, which snowballs and removes future decisions.`,`Making the “risk” pure randomness with no skill component to reading or mitigating it.`],
    good:[`Different players take different risks in the same spot.`,`Players talk about “going for it”.`,`Players weigh one more trick against losing everything, because Tony Hawk’s Pro Skater holds a combo’s points until the skater lands and throws them away on a bail, so deciding when to stop becomes the skill.`],
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
  what:`Agency: the player perceives that their choices cause outcomes, and that different choices would have caused different outcomes. Emergence: behaviours and strategies arising from rule interactions that were not individually authored. Together they produce stories players tell as their own. Grand Theft Auto V shows both sides of this at once: its scripted missions funnel the player into a set character and route, and can fail an attempt that strays from it, while its open-world wanted-level system lets a five-star police chase, a passing pedestrian and a stray freeway collision turn into a scene nobody scripted.`,
  why:[`Perceived agency, not actual agency, drives the feeling of playing. A game can have real branches nobody notices, or a linear path that feels authored by the player.`,`Emergence makes a finite ruleset produce unbounded situations. It is the only scalable source of surprise.`,`Emergence is also where exploits and degenerate strategies come from. It needs stewardship, not suppression.`],
  think:{ q:[`Where does the player see that their choice mattered? How soon?`,`Which systems can affect which other systems? Where are the walls between them?`,`What is the strangest thing a player could do with these rules? Is it delightful or degenerate?`,`Am I preventing emergence by scripting outcomes I could have let the system produce?`],
    trade:[`More systemic openness yields more emergence and more balance and QA risk.`,`Authored set pieces deliver reliable peaks and reduce agency.`],
    traps:[`Fake choices (dialogue options that converge) that players detect within an hour.`,`Sealing systems from each other to make them easier to balance, which kills emergence.`],
    good:[`Players tell stories nobody on the team scripted.`,`Players find valid strategies you did not plan.`,`Players discover they have become a stealth archer from the skills they used, as Skyrim’s classless levelling allows, with no build chosen at character creation.`,`Players find that the route they took through a Deus Ex level was set by the skills and augmentations they bought earlier, as when a player with lockpicking and a player with computers cross the same Liberty Island by different doors.`],
    bad:[`Players say “it did not matter what I picked”.`] },
  how:[`Draw the system interaction map: which systems read or write which state? Look for isolated islands.`,`For each major choice, identify when and how the player sees the consequence. If it is never or much later, add a nearer signal.`,`Deliberately connect two isolated systems and prototype. Watch for surprising strategies.`,`Classify each emergent strategy: celebrate, tune, or remove. Default to celebrate.`,`Give the player’s avatar a nature that resists some orders and charge for crossing it, as Crusader Kings III does with stress, so strategy and character pull against each other and generate unscripted conflict.`],
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
  what:`Challenge is a task with uncertain success that demands skill or judgement. Failure is the outcome when it is not met. Recovery is how the player gets back to trying again: how fast, at what cost, with what new information. The triad decides whether struggle feels productive or punishing. Mega Man X6 (2001) shows why the cause matters: critics traced its harsh difficulty to stage design and to a rescue rule in which a roaming virus could make a Reploid, and the upgrade it carried, permanently unreachable. Halo: Combat Evolved splits recovery across two clocks: a shield that refills a few seconds after the player leaves fire, so one lost exchange is forgiven, over a health bar that only pickups restore, so a whole level still keeps a total.`,
  why:[`Without the possibility of failure, success has no meaning and tension is impossible.`,`How a game handles failure decides who keeps playing. Long recovery with no lesson is where mid-skill players quit.`,`The best failures teach: the player knows what went wrong and wants to try again immediately.`],
  think:{ q:[`When the player fails, do they know why? Could they say it in one sentence?`,`How many seconds from failure to the next attempt at the same challenge?`,`What does failure cost: time, resources, progress, pride? Is that cost proportional?`,`Does failure ever produce something interesting (a new situation, a story), or only a reset?`],
    trade:[`High failure cost raises tension and lowers experimentation.`,`Instant retry maximises learning and can trivialize stakes.`],
    traps:[`Punishing the player for the game’s own unclarity (unreadable telegraphs, hidden rules).`,`Difficulty settings as the only tool, instead of fixing the challenge design.`],
    good:[`Players retry immediately after failure, often with a different approach.`,`Players say “I see what I did wrong.”`,`Players screenshot a spectacular failure as a joke rather than mourn it as a loss, as Kerbal Space Program’s cartoon astronauts and exploding rockets invite, and retry at once.`],
    bad:[`Players stare, then quit. Or retry identically many times.`] },
  how:[`For each major challenge, write the intended lesson of failing it.`,`Ensure the game communicates the cause of failure within two seconds of it.`,`Measure recovery time to the retry. Cut anything in between that does not add information or meaning.`,`Consider “fail forward”: failures that create a new situation instead of a reset.`,`Test with players across skill levels. Track retry rate and approach change.`,`When a failure is permanent, put its odds on screen before the player commits: Fire Emblem shows both sides’ hit, damage and critical numbers before an attack, so a unit lost to permanent death traces back to a risk the player saw and accepted.`,`Make the cost of failure a trip, not a loss: in Valheim a death leaves every item in a tombstone where the player fell, so recovery is a short, dangerous quest of its own.`,`Turn being spotted into a phase rather than a death, as Metal Gear Solid does: alert mode sends guards, and once Snake hides an evasion counter runs down to zero before the base returns to infiltration.`],
  ai:{ yes:[`Audit challenges for legibility of failure cause.`,`Propose fail-forward alternatives to resets.`,`Analyze retry logs for identical repetition (a sign the lesson is not landing).`],
       no:[`Decide how punishing the game should be.`] },
  prompts:[{l:'Failure lesson audit',p:`Here are our major challenges and what happens on failure: [LIST]. For each, state the lesson a player should learn from failing, how the game currently communicates the cause of failure and how quickly, the recovery time to retry, and the cost. Flag challenges where the cause is not communicated within 2 seconds or recovery exceeds 20 seconds. Propose, per flag, the smallest change and a fail-forward alternative.`}],
  verify:[`Does the audit assume players understand systems the game never explained?`],
  test:[`After a failure, ask “what happened?” Note whether the answer is accurate.`,`Time failure to retry.`,`Do players change approach after failure, or repeat?`,`Where do players quit after failing? How many failures preceded it?`],
  rel:[['difficulty','Difficulty is challenge calibrated across the game.'],['skill-and-mastery','Failure is how skill is acquired.'],['risk-reward','Failure cost defines risk.'],['feedback-and-affordance','Communicating the cause of failure is feedback.'],['combat-design','A boss fight is where failure has to teach, and combat design shows how.']] });
TECH('challenge-failure-recovery',[
  {n:'Failure cost tuning', how:`Decide how much time/progress a failure costs, and the length of the retry loop.`, fit:`Making failure instructive, not punishing.`, cost:`Too cheap removes weight. Too costly causes churn.`, alt:`Keep failure cheap and learning fast in action games.`},
  {n:'Checkpoint and recovery design', how:`Place checkpoints and design recovery so players resume near where they failed with the knowledge they gained.`, fit:`Action and level-based games. Retention at hard points.`, cost:`Frequent checkpoints reduce tension. Sparse ones cause abandonment.`, alt:`Match checkpoint density to the intended tension.`},
  {n:'Recovery mechanics', how:`Second chances, comeback options or scaling that keep a run alive without erasing the loss.`, fit:`Roguelikes, sports, competitive games.`, cost:`Can undermine stakes if too generous.`, alt:`Make recovery cost something.`}
]);
ENGINE('challenge-failure-recovery',{
  godot:{ term:`Recovery time is a loading problem as much as a design one. reload_current_scene() is the honest measure of your retry loop, and anything that survives it is state you have to reset by hand.`,
    api:['get_tree().reload_current_scene()','SceneTree.change_scene_to_packed()','ResourceLoader.load_threaded_request()','Autoload for checkpoint state','Time.get_ticks_msec()','await get_tree().process_frame'],
    snippet:`# Checkpoint.gd, registered as an autoload so it outlives the scene reload
var saved_ammo := 30
var ammo := 0
var status_effects: Array = []

func die() -> void:                          # call Checkpoint.die() from the player
\tvar t0 := Time.get_ticks_msec()
\trestore()
\tget_tree().reload_current_scene()
\tawait get_tree().process_frame           # the autoload is not freed, so this resumes
\tprint("retry took %d ms" % (Time.get_ticks_msec() - t0))

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
    good:[`Veterans can explain what they do differently.`,`Novices can watch veterans and see it.`,`Veterans read state the game never displays, the way Monster Hunter players judge a monster’s remaining health from its limp and scars with no health bar on screen.`,`Players can see the exact gap between their own hands and a professional’s, as StarCraft shows them since Blizzard added an actions-per-minute display in patch 1.18 (2017).`],
    bad:[`Players plateau early and describe the game as “just grinding”.`] },
  how:[`List skills. Mark each as taught, exercised, combined with others, and shown back to the player.`,`Find the gaps: skills required but never isolated, skills taught but never combined.`,`Design a mastery display: a place where the player’s improvement is visible (time, style, options).`,`Test with veterans and novices. Compare their play. The difference is your actual skill ceiling.`],
  ai:{ yes:[`Extract skill atoms from a mechanic list and map where each is taught and combined.`,`Propose mastery signals that do not rely on numbers.`,`Analyze play logs for the differences between novice and veteran behaviour.`],
       no:[`Decide which skill the game is about.`] },
  prompts:[{l:'Skill atom map',p:`Here are our mechanics and level order: [DESCRIPTION]. Extract the skills the player must acquire (execution, timing, reading, planning, resource judgement, spatial, memory). For each, identify where it is first isolated, first exercised under pressure, first combined with another skill, and how the player would perceive their own improvement. Flag skills that are required before they are isolated, and skills that never combine. Propose one mastery display for the central skill.`}],
  verify:[`Did it distinguish skill from stats?`,`Are the “where taught” claims grounded in the level order I gave?`],
  test:[`Record novice and veteran runs of the same challenge. What differs?`,`Ask veterans what they do differently. Ask novices what they are working on.`,`Do players notice their own improvement? Ask.`],
  rel:[['mastery-discovery-expression','Mastery is one of the three long-term engines.'],['level-structure','Levels are where skills are taught and combined.'],['challenge-failure-recovery','Failure is the mechanism of learning.'],['game-feel-and-juice','Execution skill lives in game feel.'],['combat-design','Attack timings are where combat skill is built and tested.']] });
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
    void Awake() => cc = GetComponent<CharacterController>();
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
  what:`How a game lets time pass decides what kind of thinking it rewards. Pure real time never stops: every action competes with the clock. Pure turn-based time only moves when a player commits: there is no clock to beat, only a decision to make well. Hybrids sit between these poles and borrow from both, trading reflex against planning time; the named systems below (ATB, CTB, Press Turn, BLiTZ, pausable real time, Superhot, simultaneous turns and others) are worked examples of that trade.`,
  why:[`The time structure decides which skill the game is testing: reflex, prediction, or judgement under no time pressure at all. Picking one without meaning to is picking the wrong game for your fantasy.`,`Every hybrid is solving the same problem: reflex time structures are exciting but punish thinking, and pure turns are fair but can feel inert. The named systems above are all attempts to buy a bit of both.`,`Readability depends on the structure. A turn-order queue only works if the player can see it change before they commit; a real-time gauge only works if its fill rate is legible at a glance.`,`Changing the time structure changes who can play well. A twitch-heavy real-time combat system excludes players a turn-based version would welcome, and the reverse is true for players who find pure turns slow.`],
  think:{ q:[`Does the player need reflexes, prediction, or calm judgement to succeed here? Which one did you intend?`,`Can the player see, before committing, how their choice will change the order or timing of what happens next?`,`What happens to a player who freezes? Does the game punish hesitation (real time), tax it lightly (a fill gauge), or not touch it at all (pure turns)?`,`If you added a pause, would the game still be interesting, or was the pressure the whole design?`,`Is the time pressure coming from the same source as the skill you want to test, or is it fighting a different system (a UI you cannot read fast enough)?`],
    trade:[`Faster time structures create excitement and tension but shrink the amount of the game an anxious or slower player can access.`,`Every layer of hybrid (a gauge on top of a turn, a real-time dodge on top of a menu) adds a second skill the player must learn, on top of the first.`],
    traps:[`Adding a real-time element (a quick-time dodge, a reflex parry) to a turn-based game without asking whether it tests the same skill as the rest of the combat, or a completely different one bolted on.`,`Calling a gauge-fill system “real time” when, in Wait mode, decisions are still made from a paused menu. The structure is turn-based with variable turn order, not real time.`,`Hiding the turn-order queue or the gauge fill rate to reduce UI clutter, which removes the exact information the structure needs to feel fair rather than arbitrary.`],
    good:[`Players narrate their plan out loud before it resolves (“if I go now I beat her turn”), which means they can see the structure well enough to predict it.`,`Players aim deliberately against the wind before firing, as Worms Armageddon players do with a wind that changes every turn, a sign they have modelled the turn’s one changing variable rather than guessing.`,`Players can see exactly what a turn is testing when every ability check shows its target number and a rolling d20, and every combat turn a fixed action, bonus action and movement budget, as in Baldur’s Gate 3.`],
    bad:[`Players describe the timing as luck rather than a call they made, which means the structure is not showing them enough to reason with.`] },
  how:[`Between these poles sit hybrids that borrow from both: ATB (Active Time Battle, introduced in Final Fantasy IV in 1991 by Hiroyuki Ito, reportedly inspired by Formula One cars lapping each other at different rates) fills a gauge per character so faster units act more often inside an otherwise turn-based menu.`,`CTB (Conditional Turn-Based, Final Fantasy X) removes the clock entirely but keeps the same idea of variable turn frequency: agility and the rank of the chosen action shift a visible turn-order queue, so the player reasons about tempo without ever racing it.`,`Shin Megami Tensei III: Nocturne’s Press Turn system turns weakness itself into time: a hit on an elemental weakness or a critical spends only half a turn icon, so exploiting the matchup earns extra actions as well as extra damage.`,`Valkyria Chronicles' BLiTZ system splits every unit’s go into a turn-based Command Mode (spend Command Points to select a unit) and a real-time Action Mode (move and aim until an Action Point gauge drains), so tactical planning and physical aim sit inside the same turn.`,`Baldur’s Gate and FTL run real time by default and let the player pause it to issue commands without penalty, so thinking time is free but only while the clock is stopped.`,`Superhot inverts that: time crawls by default and runs at full speed only when the player moves, turning every twitch decision into a nearly untimed one.`,`Simultaneous-turn systems (each side commits an action blind, then both resolve at once) keep the no-clock fairness of turns while adding the risk of a real-time exchange: you cannot react to what the opponent is doing, only predict it.`,`Clair Obscur: Expedition 33 (Sandfall Interactive, 2025) layers a third axis onto a turn-based JRPG structure: while it is technically the enemy’s turn, the player must dodge, jump or parry in real time or take the full hit.`,`Sid Meier’s Civilization shows that a strictly turn-based game can still feel as if something is always about to finish: a city’s production, a technology’s research and a unit’s movement each run on their own count with no shared clock, so every turn ends with some projects done and others a turn or two away.`,`Crusader Kings III sets its clock by lifetimes: the player plays one ruler until death and then continues as the heir, so the largest unit of time is a generation and each succession is arguably the turn that matters most.`,`Name the skill you want the loop to test: reflex, prediction under partial information, or judgement with no clock. Pick a time structure that tests that skill, not the one your genre defaults to.`,`If you are hybridising two structures, write down which one is fixed and which one flexes. ATB fixes the menu-command flow and flexes the tempo; BLiTZ fixes each phase’s Command Point budget and flexes the movement inside a go.`,`Make the structure visible: a turn-order strip, a gauge, a ghost of the last commit. If players cannot see the mechanism, they cannot plan against it and will call it unfair.`,`Playtest for hesitation and for the words players use afterwards. “I panicked” points at real time doing its job or misfiring; “I didn’t understand why that went first” points at an unreadable structure.`],
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
  what:`A genre hybrid composes two core loops so that progress or currency in one changes what is possible in the other. A hybrid fails when the two loops do not need each other: one becomes the “real game” and the other becomes an unskippable chore that exists only to unlock it, which is two half-games rather than one whole one. Persona and Into the Breach, described under How, show the loops feeding each other.`,
  why:[`Two loops that feed each other create variety without diluting focus: the player is never doing “filler,” because everything they do in one loop changes the other.`,`Hybrids are a common way to extend how long a single core loop stays interesting, since a second loop can supply new situations the first loop cannot generate on its own.`,`A failed hybrid is a specific and diagnosable failure: not “boring,” but “the two halves don’t need each other,” which points straight at the fix.`],
  think:{ q:[`What exactly crosses from Loop A into Loop B, and does it also cross back? A one-way bridge means only one loop is feeding the other.`,`If you deleted Loop B entirely, would Loop A still be worth playing on its own? If yes, Loop B may be optional content, not a hybrid.`,`Do the two loops ask for the same kind of attention (both calm and planned, both fast and reactive), or do they force an awkward context-switch every time?`,`Would a player who is only good at one of the two loops still be able to finish the game, or does the hybrid gate one skill behind mastering an unrelated one?`],
    trade:[`A tight bridge (one clear currency crossing both ways) is easy to read but can make the connection feel mechanical; a loose, thematic bridge feels richer but is harder for players to reason about.`,`Two loops with very different pacing (a slow calendar, a fast dungeon) create welcome variety but double the tutorial and balancing work.`],
    traps:[`Building the bridge currency so it only flows one direction, so one loop is secretly just a shop for the other.`,`Assuming a hybrid is validated because each loop is fun in isolation. A great puzzle loop and a great deckbuilding loop stitched together with no real connection are still two separate games.`,`Copying a hybrid pairing that worked for another game’s fantasy without checking whether your two loops share the fiction that made the original pairing feel natural.`],
    good:[`Players talk about the two loops in the same sentence, unprompted (“I skipped hanging out with her so I could level up for tomorrow’s dungeon”).`],
    bad:[`Players openly describe one loop as a chore they endure to get back to the other.`] },
  how:[`Persona’s social-sim calendar loop (spend a limited number of afternoons and evenings on relationships, study or a job) feeds directly into the strength of the Personas fused for the dungeon-crawling loop; the dungeon loop, in turn, produces the time pressure that gives the calendar its stakes.`,`Valkyria Chronicles binds a turn-based Command Mode to real-time Action Mode movement, so the tactics loop and the shooting loop are the same loop viewed at two zoom levels, not two separate games.`,`Into the Breach pairs a puzzle loop (every enemy telegraphs its exact next move, so each turn is a solvable arrangement problem) with a light roguelike meta-loop (permanent pilot unlocks and squad choices carried between short runs).`,`Slay the Spire fuses deckbuilding (choosing and synergising cards) with a roguelike run structure (a generated, branching map of escalating fights where a single death ends the run), so the deckbuilding decisions matter because the run loop makes them permanent for that attempt and the run loop has stakes because the deck is what you are risking.`,`Stardew Valley pairs a farming and social-calendar loop with a combat-and-mining loop in its caves, and the two feed each other directly: ore and gems from the mines upgrade farm tools and buildings, and farm income buys the equipment that makes deeper mining survivable.`,`Dynasty Warriors binds a real-time hack-and-slash loop to a light strategic layer of officers, bases and morale: beating officers and capturing bases raises the player’s army’s morale, and higher morale makes that whole army fight better on the way to the next objective, so the two loops feed each other inside one continuous battle rather than across separate menus.`,`Dota 2 shows a hybrid discovered by accident: Aeon of Strife gave StarCraft players one hero to control instead of an army, and that single-hero-against-waves pairing outlived the engine it was built on by more than two decades.`,`Name the one resource, stat or piece of information that is meant to cross from each loop into the other, in both directions if the hybrid is meant to be mutual.`,`Prototype each loop alone first and confirm it holds up without the other, using the same grey-box discipline as any core loop test.`,`Combine them and specifically test the bridge: remove it for a session and see whether players still choose to do both loops, or whether one collapses into a chore without the currency forcing them into it.`,`Watch session shape in playtests: do players context-switch cleanly between the two loops, or does the transition itself feel like friction?`],
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

T('multiplayer-design',{ d:'core', t:'Multiplayer game design', tag:'Other players are the content. Design who plays with whom, what each role does, how a loss stays tolerable, and how the game deals with people who spoil it.',
  what:`The design of games where several people play together or against each other. Overwatch shows the parts: teams are built from tank, damage and support heroes, and most heroes have a counter that an opponent can pick. Co-op has players share a goal against the game. PvP (player versus player) has them oppose each other. Many games mix the two: teams that fight other teams. Balance is whether the options are fair against one another. Counterplay is the answer an opponent has to any strong move, and it is what makes a strong move fair. Matching is how the game picks who plays with whom, and it is a design problem before it is a server problem: a match that is too lopsided is not fun for either side. Social roles are the jobs players take, such as tank, healer, support or scout. Griefing is a player using the rules to spoil the game for others. The plumbing of rooms and tickets is in the server matchmaking topic. This topic is what to decide before you build it.`,
  why:[`In multiplayer the other players make most of the experience. If the pairing is wrong, a well-built game feels bad: one side has no chance, or the winner learns nothing.`,`Without counterplay, a strong option becomes the only choice, everyone uses it, and the losing side has nothing to do but wait.`,`Without roles that matter, players pile into the strongest role and teams fill with the same choice. Without clear rules for shared goals, one person does everything or nobody does.`,`Without a plan for bad behaviour, a small share of players can drive out many others. What happens to a player who is being harassed decides whether they return.`,`Fixing balance and matching after launch is costly, because it changes what players have already learned and what they have earned.`],
  think:{ q:[`What does each player do that no one else on the team can do?`,`When a player loses, can they say why, and what would they try next?`,`For each strong option, what is the counter, and does using the counter feel like a good play and not a punishment?`,`How wide is the range of skill among the players, and what happens to a player at each end?`,`What can a teammate do to ruin the match, and what stops them?`,`What is the wait time we accept in exchange for a close match?`],
    trade:[`Co-op lowers the fear of losing to a person and can let one strong player carry the rest. PvP gives lasting stakes and a sense of achievement, and it exposes weaker players to stronger ones.`,`Close matches feel best and take longer to find. Fast matches are lopsided more often. The trade-off is a design choice, and the wait time can change by hour and by region.`,`Fixed roles make teams read clearly and can leave a player stuck in a job they dislike. Flexible roles give freedom and make team composition unpredictable.`,`Strict penalties for bad behaviour protect others and may catch honest mistakes. Light penalties are forgiving and leave harm in place.`],
    traps:[`Balancing by win rate alone. A hero with a 50 percent win rate can still be miserable to play against.`,`Treating skill as one number. Players are good at some things and not others, and a rating can miss that.`,`Matching only on skill and ignoring wait time, party size or connection quality.`,`Giving new accounts the average rating, so strong newcomers (or players on a second account) crush beginners for a few matches.`,`Making a rule that cannot be enforced, such as forbidding throwing a match, with no tool to detect it.`,`Letting friendly fire, blocking or team-only rewards enable griefing, then adding penalties as a patch.`],
    good:[`Players describe defeats as "I got out-played" or "I missed the counter", and want a rematch.`,`Every role is picked by a healthy share of players, and none is a place players are pushed into.`,`New players get matches where they win about as often as they lose.`],
    bad:[`One option is picked in nearly every match, and the losers say there is nothing to do against it.`,`Players say the game is unfair, or that teammates ruin it, and they leave after a few losses.`,`Matches often end with one side far ahead and the outcome clear long before the end.`] },
  how:[`Choose the relationship first: co-op, competitive, or teams against teams. Write what a win means and what a loss means for each player. For a co-op game, decide who can fail alone and who can fail the team.`,`List the roles. For each role, write one thing only that role does, one thing it needs from the others, and one thing it can be hurt by. If two roles overlap almost entirely, merge them.`,`For every strong option, name its counter before you ship it. Test that the counter works for a player of ordinary skill, not only an expert.`,`Balance in two passes. First, numbers: win rate and pick rate by skill band, using match data. Second, feel: watch people play against each option and ask whether they know what happened and what to do next.`,`Design matching as a set of rules: a skill measure (Elo-style ratings, or Glicko or TrueSkill, which also track uncertainty), a window that widens with wait time, and limits for party size and connection. Set a maximum wait time and say what happens if the window cannot be filled.`,`Give new accounts a high uncertainty, not a fixed average, so their rating moves fast at first. Watch for accounts that win far above their rating.`,`Plan for bad behaviour before launch. Make reporting quick, log what is needed to judge a report, give warnings before bans where fitting, and remove the game's own tools for spoiling (such as damage to teammates) unless they are a feature.`,`Give players a way out of a lost match that is not quitting: a vote to surrender, a short match length, or a fair result for those who stay. Support quick rematches.`],
  ai:{ yes:[`Simulate a matching rule against a population of players with different skill and wait times, and report how many matches fall outside a fair band.`,`Read a spreadsheet of win and pick rates and list the options that deviate, for you to inspect in play.`,`Draft a taxonomy of ways a mechanic can be used to grief, for you to review with real players.`],
       no:[`Decide what feels fair. Players decide, in play.`,`Decide what counts as harassment, or what the penalty is. That is a policy and a legal matter.`,`Tune balance numbers without match data. It only knows what it has read.`] },
  prompts:[{l:'Matching rule simulation',p:`Here is our matching rule: [RULE: rating system, window width and how it grows with wait time, party rules]. And this population: [SKILL DISTRIBUTION, PLAYERS ONLINE BY HOUR]. Write a simulation that runs 100,000 matches and reports the median wait, the 95th percentile wait, the share of matches with a rating gap above [GAP], and what happens to players in the top 1 percent and bottom 10 percent of skill. Say what assumptions you made. Do not present the numbers as predictions about our real players.`}],
  verify:[`Does the simulation use a population that matches your players' real skill spread, or a made-up bell curve?`,`Did it confuse a rating gap with a win probability? Check the formula.`,`Are the griefing cases the ones real players have reported, or ones the AI imagined?`],
  test:[`Playtest with strangers, not friends. Ask each person after a loss what they would try next.`,`Look at match data by skill band: win rate, match length and quit rate. A high quit rate in the first minutes points to lopsided matches.`,`Play the game alone with one bad teammate (a tester told to grief) and see what breaks.`,`Track the wait time at the busiest and quietest hour, and check that the matching window at the quiet hour still gives acceptable matches.`,`For each role, check that the pick rate is not near zero or near total.`],
  facts:[{claim:`Elo’s expected score for player A against B is 1 / (1 + 10^((R_B - R_A)/400)), and the update after a game is R_A + K(S_A - E_A), where K sets how far a rating moves; typical K values in chess systems range from 10 to 40.`,asOf:'2026-09-30',src:'https://en.wikipedia.org/wiki/Elo_rating_system'},
    {claim:`Microsoft Research’s TrueSkill rates players by two numbers, a mean skill and an uncertainty, for matchmaking and ranking in multiplayer games including team games.`,asOf:'2026-09-30',src:'https://www.microsoft.com/en-us/research/project/trueskill-ranking-system/'}],
  rel:[['social-experience','Roles, cooperation and competition are social design; this topic applies them to structured multiplayer play.'],['server-matchmaking','The design rules here become the tickets, queues and rooms the server builds.'],['skill-and-mastery','A rating is a claim about skill, so the model of mastery decides what it can measure.'],['builds-and-loadouts','Balance and counterplay are decided by what players can choose to bring.']] });
ENGINE('multiplayer-design',{
  godot:{ term:`A matching rule is data plus a small pure function: a rating, a window that grows with the wait, and a search for the closest player inside it. Keeping it pure lets you run thousands of simulated queues in a test. The real service runs on the server; the client only shows the queue.`,
    api:['class_name + static func','pow() / absf()','Array[float]','RandomNumberGenerator for simulation'],
    snippet:`class_name Matching
extends RefCounted

static func expected(a: float, b: float) -> float:      # chance a beats b, Elo scale
\treturn 1.0 / (1.0 + pow(10.0, (b - a) / 400.0))

static func update(r: float, opp: float, won: bool, k := 32.0) -> float:
\treturn r + k * ((1.0 if won else 0.0) - expected(r, opp))

static func window(wait_s: float) -> float:              # widens the longer you wait
\treturn 100.0 + 25.0 * wait_s

static func pick(me: float, wait_s: float, pool: Array[float]) -> int:
\tvar best := -1                                       # -1: nobody fits yet
\tvar gap := window(wait_s)
\tfor i in pool.size():
\t\tvar d := absf(pool[i] - me)
\t\tif d <= gap:
\t\t\tgap = d
\t\t\tbest = i
\treturn best`,
    pitfall:`Letting the window widen without limit. After a long enough wait the rule accepts anyone, so the lopsided match you tried to avoid arrives exactly when the queue is quiet. Cap the window, and decide what happens at the cap: keep waiting, offer a bot, or offer a different mode. Also, K = 32 moves a new account slowly if it is really strong. Use a larger K, or a system with uncertainty such as Glicko or TrueSkill, for the first matches.`,
    map:`A Godot static Matching class is a Unity static class of the same shape.` },
  unity:{ term:`The same rule as a static class with pure methods. Unit-test it with NUnit in edit mode, feeding it a synthetic population. The live queue runs in a backend service, not in the game client.`,
    api:['static class','Mathf.Pow() / Mathf.Abs()','List<float>','NUnit [Test]','System.Random for simulated queues'],
    snippet:`using System.Collections.Generic;
using UnityEngine;

public static class Matching {
    public static float Expected(float a, float b) =>     // chance a beats b, Elo scale
        1f / (1f + Mathf.Pow(10f, (b - a) / 400f));

    public static float Update(float r, float opp, bool won, float k = 32f) =>
        r + k * ((won ? 1f : 0f) - Expected(r, opp));

    public static float Window(float waitSeconds) =>      // widens the longer you wait
        100f + 25f * waitSeconds;

    public static int Pick(float me, float waitSeconds, IReadOnlyList<float> pool) {
        int best = -1;                                    // -1: nobody fits yet
        float gap = Window(waitSeconds);
        for (int i = 0; i < pool.Count; i++) {
            float d = Mathf.Abs(pool[i] - me);
            if (d <= gap) { gap = d; best = i; }
        }
        return best;
    }
}`,
    pitfall:`Testing the rule only with evenly spread ratings. Real populations are lumpy: many players near the middle, a few at the top. In the tails there is no one inside the window, so the queue never fills for the best players. Feed the test a copy of real rating data, print the wait for the top one percent, and decide what the game offers them.`,
    map:`Unity's static Matching class with pure methods is Godot's static Matching class with static funcs.` },
  note:`The functions decide who should meet. Whether the game then feels fair is a playtest question that no snippet answers. Keep the numbers (100, 25, 32) as data you can change without a build, and log every match so you can see the rating gap and result afterwards.` });
INTERVIEW('multiplayer-design',{
  junior:[
    { q:`What is counterplay, and why does a strong move need it?`,
      a:`Counterplay is the answer an opponent has to a strong move. Without it, the strong move is unfair, because the opponent can only lose and wait. With it, a strong move is a fair trade: it wins if the opponent misreads it and loses if they read it right. The counter should be available to an ordinary player and feel like a good play.`,
      follow:`Name a counter from a game you play and say what it costs the person using it.`,
      red:`Says strong moves should be nerfed until nobody complains.` },
    { q:`Why match players by skill?`,
      a:`A match between players of very different skill is not fun for either side. The weaker player has no chance and learns little. The stronger player has no challenge. Close matches give both a reason to try. The cost is a longer wait, so matching balances closeness against the time to find a game.`,
      follow:`What would you widen first if the queue is too slow?`,
      red:`Says matching is only a server problem.` },
    { q:`Give two ways a player can grief in a team game and how design can reduce it.`,
      a:`Hurting teammates with friendly fire, blocking a path or an objective, refusing to take part, or quitting early. Design can remove the tool (no friendly damage or blocking), make the harm cheaper to bear (a surrender vote, a replacement player), or make it visible and reportable. Rules against it need a way to detect it.`,
      follow:`Which one is hardest to detect, and why?`,
      red:`Says players who grief should simply be banned.` }
  ],
  mid:[
    { q:`Win rate for one hero is 55 percent. Do you nerf it?`,
      a:`Not on that number alone. Look at it by skill band, pick rate, and match length, and watch people play against it. A hero can win often and be easy to counter, or win at 50 percent and be miserable to face. Change a number only when the data and the feel agree, and change one thing at a time so the effect can be read.`,
      follow:`How would you check the effect of the change afterwards?`,
      red:`Nerfs anything above 52 percent without looking further.` },
    { q:`Design a matching rule for a game with 5,000 players online in the day and 200 at night.`,
      a:`Use a rating with uncertainty, a window that widens with wait, and a maximum window. At night the window widens faster or the game offers different queues or bots. Simulate both populations, look at the wait and the rating gap at the tails, and decide the limits you will accept. Party size and connection quality are further rules.`,
      follow:`What would you measure after launch to know the rule works?`,
      red:`Sets one fixed window and does not check the quiet hours.` },
    { q:`How do you handle a new player who is really an experienced player on a new account?`,
      a:`Give new accounts high uncertainty so their rating moves quickly, and watch for accounts that win far above their rating. Systems such as Glicko and TrueSkill track uncertainty for this reason. Some games add other signals, such as linking accounts or phone verification, which have costs for privacy and access.`,
      follow:`What does the beginner who meets that player experience, and how long?`,
      red:`Starts every account at the same fixed rating and leaves it.` }
  ],
  senior:[
    { q:`Your team game has a role nobody wants to play. What do you do?`,
      a:`Find out why: is it stressful, low in reward, dependent on teammates, or poorly explained? Change the role so it gives clear wins and credit, reduce how much a teammate can spoil it, and consider a queue that lets players pick a role and waits for a full team. Watch the pick rate and the quit rate for that role, not only complaints.`,
      follow:`If a role queue makes waits longer, how do you decide if it is worth it?`,
      red:`Forces random players into the role and calls it fair.` },
    { q:`How do you decide how much toxicity you will tolerate, and how do you build for it?`,
      a:`It is a policy decision, with the team and legal advice. Define what counts as harm, make reporting quick, log what you need to judge it, warn before banning where fitting, and measure the harm players report, not only the number of reports. Design out the game tools that enable the worst behaviour. Publish the rules and follow them the same way for everyone.`,
      follow:`A top player is reported often. Do you treat them differently?`,
      red:`Leaves it to the community and adds no tools.` }
  ] });


T('combat-design',{ d:'core', t:'Combat design: attacks, enemies and bosses', tag:'Every attack is a promise made in three beats: warn, hit, recover. Fair combat keeps all three readable.',
  what:`Combat design is the craft of making fights that are readable, weighty and fair. Its smallest unit is the attack, and an attack has three parts that fighting-game players count in frames: anticipation (also called startup, the wind-up before anything can hurt), active frames (the short window in which the hit can land) and recovery (the time after, when the attacker is committed and open). Street Fighter publishes its frame data at 60 frames a second, so every move is a known trade between these three numbers. Hit-stop, a brief freeze of both sides on contact, and the hit reaction, such as a stagger, a knockback or a flash, tell the player the hit landed. Enemies ask their question through telegraphs, attack patterns and spacing. A boss is the exam: it asks again, in combination and under pressure, what the earlier fights taught. Dark Souls bosses test the dodge, the stamina budget and the habit of waiting for an opening, all of which the road to them teaches.`,
  why:[`Combat is where many action games spend most of their play time, and what the player feels in each hit decides whether the whole game feels good.`,`Fair combat is a readability problem before it is a balance problem. A player can only learn from a hit they saw coming.`,`Recovery is what makes an attack a decision: a long recovery makes the player weigh when to commit, and a missing one makes every move free.`],
  think:{ q:[`For each attack, how long are anticipation, active frames and recovery, and who is vulnerable during each?`,`Can the player tell which enemy is about to attack, with what, and when the hit will land?`,`What does a hit change: the enemy’s state, its position, the next opening?`,`What does this boss ask that the fights before it taught, and is there anything it asks that nothing taught?`,`When the player dies, can they say what killed them and what to do differently?`],
    trade:[`A long anticipation is easy to read and easy to beat. A short one is dangerous and needs another cue, such as a sound or a tell the player has learned.`,`Heavy commitment (long recovery) makes attacks weighty and fights slower. Light commitment makes fights fast and every attack less of a choice.`,`Hit-stop adds weight, and past a few frames it breaks combo flow and makes the game feel laggy.`],
    traps:[`Telegraphs shorter than a human can react to, so the only way to win is to memorise the pattern. A simple visual reaction time is around a fifth of a second in reaction-time studies, so anything much shorter is learned, not read.`,`Enemies that attack from off-screen or from behind the camera with no warning.`,`Attacks with no recovery, so the player can never punish them, and hits that change nothing, which is how floaty combat is made.`,`A boss that tests a skill the game never taught, or that adds a new rule in its last phase and calls it difficulty.`],
    good:[`Players say “I should have rolled earlier” and not “that was cheap”.`,`Hades marks where an enemy attack will land with a danger area on the ground, so the player reads the fight from the floor and dodges on a decision, not a guess.`,`Hollow Knight’s bosses wind up with a visible pose before each strike, so after a few deaths the player is reading the pose and choosing a punish, not guessing.`,`Monster Hunter makes commitment the main decision: a long swing is strong because the hunter cannot cancel it, so each swing is a bet on the monster’s next move.`],
    bad:[`Players describe hits as “spongy”, “floaty” or “random”.`,`Players fight the camera more than the enemy.`,`One enemy or move is avoided by everyone, or answered by the same single trick every time.`] },
  how:[`Write each attack as three numbers (anticipation, active, recovery) and who can act during each. Keep them in data and tune them before polishing the animation.`,`Give every attack a telegraph that fits its speed: slower attacks can be warned with a pose, faster ones need a sound or a flash as well. Test it by watching new players, not the team.`,`Add hit feedback in layers: a hit-stop of a few frames, a reaction on the enemy, a sound and a camera nudge. Vlambeer’s talk “The Art of Screenshake” shows how much weight these add without changing the rules. Keep each short and check that none delays the player’s next input.`,`Design patterns as questions: a chain of two or three attacks with a gap that is the opening. Space the enemy so the player chooses between moving in, waiting and backing off.`,`Build a boss as a revision list: list the skills the earlier fights taught, then spend each phase on one of them, adding at most one new idea and teaching it in the phase before it is tested.`,`Playtest deaths, not only wins. Ask each player what killed them and whether they could have seen it coming. If the answer is no, fix the signal before touching damage numbers.`],
  ai:{ yes:[`Draft a frame-data table for a move set and flag attacks with no recovery or with a telegraph shorter than the reaction window you set.`,`Read playtest death logs and group them by cause: unseen attack, unclear telegraph, bad spacing, execution.`,`Write the tuning scaffolding: a hitbox debug view, a slow-motion toggle and exposed timing values.`],
       no:[`Decide what feels weighty. Only players with a build or a recording can say that.`,`Tune hit-stop, telegraph length or boss difficulty from a description. These are felt values and have to be played.`] },
  prompts:[{l:'Attack anatomy audit',p:`Here is our move set as frame data (anticipation, active, recovery, damage, hit reaction) and the telegraph each enemy attack has: [DATA]. For each attack, say who is vulnerable in each phase, whether a new player could read the telegraph, and whether the recovery makes the attack a real decision. List the three attacks most likely to feel floaty or unfair, with the symptom a playtest would show, and propose the smallest change to each. Do not change damage numbers first.`},
    {l:'Boss as exam',p:`The player has learned these skills before this boss: [SKILLS, WITH WHERE EACH WAS TAUGHT]. Design a three-phase boss. For each phase, name the one skill it tests, the attack pattern that tests it, the telegraph, the opening it gives, and where a failing player learns the lesson. Flag any phase that tests something not taught earlier.`}],
  verify:[`Does each attack have a real recovery and a stated telegraph, or did it only list damage?`,`Does the boss test only skills the earlier fights taught?`,`Were the timings reasoned from reaction time and the game’s speed, or copied from another game?`],
  test:[`Show a new player the telegraph with sound off and then on. Do they dodge on the cue, and which cue did they use?`,`After every death, ask “what killed you?”. Count the times the answer is wrong or “I don’t know”.`,`Record a hit and play it back muted. Does it still read as a hit? Then play the sound alone.`,`Watch whether players find more than one answer to each pattern: dodge, block, trade, avoid.`],
  rel:[['game-feel-and-juice','Hit-stop, shake and sound are the feedback that makes a hit land.'],['animation-and-vfx','Anticipation and recovery are animation timings with rules attached.'],['encounters-and-enemies','Each enemy is a question, and its attacks are how it asks.'],['encounter-design','Space and enemy mix turn single attacks into a fight.'],['readable-and-fair-ai','A telegraph is the enemy showing the player its intent.'],['challenge-failure-recovery','A boss death should teach, and the way back should be short.'],['difficulty','Fair difficulty in combat is readable, learnable and tuned by data.'],['three-cs','Combat only reads well when the character, the controls and the camera are tuned together.']] });
TECH('combat-design',[
  {n:'Frame data table', how:`Write each attack as anticipation, active and recovery in frames or milliseconds, with who can act in each phase. Tune the numbers in data.`, fit:`Any melee or close-range combat, and any fighting game.`, cost:`Needs a debug view to check what the numbers do on screen. Easy to over-tune on paper.`, alt:`For a small game, tune three numbers per attack by hand and playtest.`},
  {n:'Telegraph ladder', how:`Match the warning to the speed: a pose for slow attacks, a ground marker for area attacks, a sound or colour flash for fast ones.`, fit:`Enemies the player must read at a glance.`, cost:`Costs art and audio per enemy. Too many cues become noise.`, alt:`Keep one signal per danger type and use it for every enemy.`},
  {n:'Layered hit feedback', how:`Combine a few frames of hit-stop, an enemy reaction, a sound and a small camera push. Scale each with the strength of the hit.`, fit:`Making attacks feel weighty without changing damage.`, cost:`Too long and it hurts flow and reads as lag. Needs per-weapon tuning.`, alt:`Start with hit-stop and a reaction, add the rest only if a recording still reads as floaty.`},
  {n:'Boss as exam', how:`List what the earlier fights taught, then give each boss phase one of those skills, with at most one new idea taught just before it is tested.`, fit:`Bosses and set-piece fights that close a section.`, cost:`Needs the earlier fights to be designed first. A boss cannot teach everything on its own.`, alt:`For a game with no teaching section, make the first phase a plain version and add the twist later.`}
]);
ENGINE('combat-design',{
  godot:{ term:`An attack is a small state machine with three timed phases. The hitbox is an Area2D that only monitors during the active phase, and the phase is exposed so animation, AI and feedback can read it.`,
    api:['Area2D.monitoring','SceneTree.create_timer()','await / Signal','enum','@export','@onready'],
    snippet:`extends Node2D
enum Phase { IDLE, STARTUP, ACTIVE, RECOVERY }
@export var startup := 0.18
@export var active := 0.08
@export var recovery := 0.30
@onready var hitbox: Area2D = $Hitbox
var phase := Phase.IDLE

func attack() -> void:
\tif phase != Phase.IDLE: return
\tphase = Phase.STARTUP;  await get_tree().create_timer(startup).timeout
\tphase = Phase.ACTIVE;   hitbox.monitoring = true
\tawait get_tree().create_timer(active).timeout
\thitbox.monitoring = false
\tphase = Phase.RECOVERY; await get_tree().create_timer(recovery).timeout
\tphase = Phase.IDLE`,
    pitfall:`Timing the active window with a timer that runs in idle frames while the hitbox is checked on physics steps. A window shorter than one physics step, about 17 ms at the default 60 ticks a second, can open and close between two steps, so a clean hit reports no overlap. Keep the active window several physics steps long, or pass true for process_in_physics so the timer is aligned with them.`,
    map:`Godot Area2D.monitoring on a hitbox is Unity Collider.enabled on a trigger, and an await on a timer is a coroutine yield.` },
  unity:{ term:`An attack is a coroutine with three timed phases. The hitbox is a trigger collider enabled only during the active phase, and Busy is public so input, animation and AI can read the commitment.`,
    api:['MonoBehaviour.StartCoroutine()','WaitForSeconds','Collider.enabled','OnTriggerEnter(Collider)','IEnumerator','OnDisable()'],
    snippet:`public class Attack : MonoBehaviour {
    [SerializeField] float startup = 0.18f, active = 0.08f, recovery = 0.30f;
    [SerializeField] Collider hitbox;            // trigger, disabled in the prefab
    public bool Busy { get; private set; }

    public void Begin() { if (!Busy) StartCoroutine(Run()); }

    IEnumerator Run() {
        Busy = true;
        yield return new WaitForSeconds(startup);
        hitbox.enabled = true;
        yield return new WaitForSeconds(active);
        hitbox.enabled = false;
        yield return new WaitForSeconds(recovery);
        Busy = false;
    }
}`,
    pitfall:`Disabling the object mid-attack, for example on a stagger or a death. Unity stops its coroutines when the object is deactivated, but Busy stays true and the hitbox can stay enabled, so after it is switched back on the character cannot attack, or deals damage while idle. Reset both in OnDisable, or run the phases from one state machine that owns the reset.`,
    map:`Unity Collider.enabled on a trigger plus a coroutine is Godot Area2D.monitoring plus an await on a timer.` },
  note:`The timings are data and the phases are readable state. The design point is the same in both engines: when anticipation, active and recovery are three named values, the telegraph can be tied to the first, the hit-stop to the second and the punish window to the third, and a playtester can tell you which one is wrong.` });
INTERVIEW('combat-design',{
  junior:[
    { q:`What are the three parts of an attack, and why does each matter to the player?`,
      a:`Anticipation is the wind-up, which gives the defender a chance to read and react. Active frames are the window in which the hit can land. Recovery is the time after, when the attacker is committed and open to a punish. Recovery is what turns an attack into a decision, because the attacker pays for committing. Use a real move, such as a Street Fighter special or a Dark Souls heavy swing, and say who is vulnerable in each part.`,
      follow:`What happens to the game if you remove recovery from every attack?`,
      red:`Describes an attack only by its animation and its damage number.` },
    { q:`What is hit-stop, and what does it do for a hit?`,
      a:`A brief freeze or slowdown of both characters on contact, usually a few frames. It gives the hit a moment of weight, so the player registers contact. It is one layer alongside the enemy reaction, the sound and a small camera push. Too much of it breaks combo flow and reads as lag.`,
      follow:`How would you check it has not crossed from weight into lag?`,
      red:`Says to add as much as possible, or cannot name a cost.` },
    { q:`What makes an enemy attack readable?`,
      a:`A telegraph that matches its speed, a distinct silhouette or pose, a consistent signal for the same danger, and enough time to react. Slow attacks can use a pose. Fast ones need a sound or a flash too. Hades marks the area an attack will hit on the ground, which lets the player read the fight from the floor.`,
      follow:`A fast attack cannot have a long telegraph. What do you do?`,
      red:`Says players should learn by dying, with no thought about whether the signal exists.` }
  ],
  mid:[
    { q:`Playtesters say your combat feels floaty. How do you find the cause?`,
      a:`Treat it as a symptom with several causes. Check the input latency first, then whether the hit has feedback in each of sound, hit-stop and reaction. Then check whether the attack has anticipation and a commitment window, and whether a hit changes the enemy’s state. Fix the cheapest cause first and re-test with a recording. Do not raise damage numbers.`,
      follow:`Latency is fine and the feedback is present. What is left?`,
      red:`Reaches for screenshake and particles without checking anything else.` },
    { q:`How do you design an enemy attack pattern and the spacing around it?`,
      a:`Pick the question the enemy asks: dodge, block, close in, wait. Chain two or three attacks with a gap, and make the gap the opening. Space decides which answer works, so a lunge asks a different question in a corridor than in an arena. Check that there is more than one valid answer and that the player can tell the gap from a pause.`,
      follow:`Players always use the same single answer. Do you change the pattern or the space?`,
      red:`Chooses patterns by listing damage values and speeds only.` },
    { q:`How do you keep a hard fight fair and not just hard?`,
      a:`Every hit is seen, every cause is clear, the retry is short and the lesson is usable. Check deaths by asking what killed the player. If the answer is “I don’t know”, the signal failed. Then check that the skill needed was taught earlier. Hard and fair can sit together, as in Dark Souls, but only when the player can read why they lost.`,
      follow:`What do you measure to know a fight is unfair and not just difficult?`,
      red:`Says hard games are not for everyone and stops there.` }
  ],
  senior:[
    { q:`How do you design a boss so it tests what the game has taught?`,
      a:`List the skills the earlier fights taught and where each was taught. Give each phase one of them, add at most one new idea and teach it in the phase before it is tested. Make the first attempt readable and the third attempt better, so the player feels the learning. A boss that tests an untaught skill is a wall. Name a boss that does it well and the skill each phase tested.`,
      follow:`The game has no teaching section before the boss. What is your fallback?`,
      red:`Describes a boss as a large health bar with more attacks.` },
    { q:`Two designers disagree: one wants shorter telegraphs for a faster game, one wants longer ones for fairness. How do you settle it?`,
      a:`Treat it as a measurement. Set a reaction target from reaction-time evidence and the game’s speed, then test with new players. Count the deaths where the player says they saw it and could not react, against the deaths where they did not see it. Add a second cue, such as sound, before shortening the first. Record the decision with its evidence so it is not reopened by taste.`,
      follow:`The testers are all experienced action players. What does that change?`,
      red:`Settles it by seniority, or by copying another game’s numbers.` }
  ] });
DIAGRAM('combat-design', { kind:'state', title:'One attack: warn, hit, recover', start:'idle',
  states:[{id:'idle', t:'Ready', d:'free to act'},{id:'warn', t:'Anticipation', d:'wind-up, the telegraph'},{id:'hit', t:'Active', d:'the hit can land'},{id:'recover', t:'Recovery', d:'committed and open'}],
  edges:[['idle','warn','attack'],['warn','hit'],['hit','recover'],['recover','idle','free']],
  note:'Fighting-game players count these three phases in frames. Street Fighter publishes its frame data at 60 frames a second.' });

T('three-cs',{ d:'core', t:'Character, controls and camera (the 3Cs)', tag:'Three systems that cannot be tuned alone: what the character can do, how the player asks for it, and what the player is shown while they do it.',
  what:`The 3Cs are character, controls and camera. Rocket League shows all three: a car with a clear turning and boost feel, direct controls, and a ball cam that keeps the ball in view. The term is in wide industry use, and Pluralsight’s “Character, Controls, Camera: The 3Cs of Game Development” is one plain introduction. The character is the body in the world: its movement, its abilities and how they respond. The controls are how the player drives it: input mapping, responsiveness, buffering, dead zones and the rules for turning a button press into an action. The camera frames the result, so the player can see where they are, what is near and where to go next. They are treated as one feature because they are one loop. The player sees through the camera, decides, presses a control, the character moves, and the camera moves with it. Change a jump height and the camera must follow differently; change the camera angle and the controls no longer point where the player expects. Steve Swink’s book “Game Feel” (2008) is the standard source for the responsiveness side: how quickly and how predictably a game answers an input.`,
  why:[`Players meet the 3Cs in the first second and every second after. If they feel wrong, nothing built on top of them is judged fairly.`,`Level design, combat and puzzle design all assume a character that moves a known way, and a camera that shows enough. A late change to any one of the three breaks work already done.`,`A studio that splits the three between three owners gets three local optima. One owner, or one small group, keeps the whole loop tuned together.`],
  think:{ q:[`What is the character’s one core movement, and what does a player expect it to do in the first ten seconds?`,`How long is it from a press to the first visible change, and does that change come on the same frame every time?`,`What can the player see at the moment they must decide, and what is hidden?`,`If we change one of the three, which of the other two must change with it?`,`Which numbers in the level metrics (gap width, platform height, enemy reach) are set by the character, and who owns them?`],
    trade:[`Responsive controls make the character feel direct. A heavy character is a valid goal, and then the delay is chosen, not accidental.`,`A camera that frames the level well may hide the character’s edge, and a camera that follows tightly can make fast movement hard to read.`,`Forgiving rules (coyote time, input buffering, aim assist) make errors feel fair, and can also make the game feel less precise. Use only as many as the genre needs.`],
    traps:[`Tuning the camera last, after the levels are built, so every level is a camera exception.`,`Controls designed for one platform and copied to another without retuning the dead zones and button count.`,`Speed or jump values set in the character and never shared with level design, so gaps are built that cannot be crossed.`,`Fixing a problem in the wrong C: a camera complaint that is really an input delay, or a jump that feels bad because the camera drops it off-screen.`],
    good:[`Celeste’s author Maddy Thorson has published the forgiveness she builds into the controls, such as coyote time, jump buffering and wide wall-jump windows, so a near miss still lands. The character looks precise because the controls quietly allow for the player’s error.`,`Super Mario’s run, jump and scrolling camera were built together: the screen scrolls to keep space ahead of the character, so the player sees the next gap before they must cross it.`,`Rocket League’s car, its controls and a ball camera that can be toggled work as one: the player can keep the ball in view, and the ball is the thing they must hit.`,`Dark Souls ties its lock-on camera to the dodge and the attack: the player circles a target and the camera keeps it in frame while the character commits.`],
    bad:[`Players say the character “feels off” and cannot say why, and the team argues about jump values when the cause is camera lag.`,`Every new level needs its own camera script.`,`The same input gives a different result depending on the camera angle, and nobody can say which is right.`] },
  how:[`Start in a greybox. Use a flat floor, a few platforms or walls, one enemy-sized box and a default camera. The 3Cs should feel good here before any art or level exists.`,`Write the character’s core numbers down as data: speed, acceleration, jump height, air control, dash length. Share this sheet with level design, who build gaps and heights from it.`,`Tune the controls with the character, not after. Add the forgiving rules (coyote time, input buffering, aim assist) one at a time, and test each against a build that does not have it.`,`Give the camera a job for each situation: what the player must see at a jump, at a fight and when exploring. Then pick the camera type for that job. The camera-design topic covers the types.`,`Change one C at a time, then re-check the other two. After every change, play the same short test course: a long jump, a tight turn, a fight, a drop. If the course now feels worse, the change reached further than you thought.`,`Add input options early: remapping, dead zone and sensitivity sliders, inversion, camera shake. These are part of the controls, and an accessibility need for some players.`],
  ai:{ yes:[`Draft the character data sheet and compute the level metrics from it, such as the longest jump and the highest ledge.`,`Write scaffolding for the greybox: a debug overlay with input, velocity and frame timing, and a button to toggle each forgiving rule.`,`Read playtest notes and sort the complaints into character, controls or camera, with the evidence each one points to.`],
       no:[`Decide how a jump feels. Only someone holding a controller can judge it.`,`Choose the dead zone, the buffer length or the camera lag from a description. These are felt values and have to be played, on the target device.`] },
  prompts:[{l:'3Cs coupling audit',p:`Here is our character data sheet (speed, acceleration, jump, air control), our input mapping and our camera setup: [DATA]. For each of the three, list the other two it depends on and what would break if it changed. Then list the three level-design numbers set by the character, and any place where the camera could hide the player from information they need at that number. Do not suggest value changes; tell me what to playtest.`},
    {l:'Feel complaint triage',p:`Playtesters said: [QUOTES]. For each comment, say whether the likely cause is the character, the controls or the camera, what in the comment points that way, and the cheapest test that would tell them apart. If a comment could be more than one, say which test separates them.`}],
  verify:[`Did it say which of the three each problem belongs to, with evidence, or did it only list tuning advice?`,`Did it treat feel values as things to test, not to calculate?`,`Do the level metrics it proposes follow from the character sheet?`],
  test:[`Play a fixed test course on the target device, and record input and screen together. Find the frame where press and first visible change are further apart than you expect.`,`Turn off one forgiving rule at a time. Watch whether players notice, and whether they fail more.`,`Hand the build to someone new with no explanation. Do they move, jump and look as intended in the first minute?`,`Ask at the end of a session: “Was there a moment you could not see what you needed?”. Mark where it happened.`],
  rel:[['controls-and-friction','Controls are the second C, and friction is how much they cost the player.'],['camera-design','The camera is the third C, and its types and failures have their own topic.'],['game-feel-and-juice','Swink’s game feel is the responsiveness of the loop between the three.'],['level-blockout-and-metrics','Level metrics are set by the character’s numbers, so the two must be shared.'],['prototyping','The 3Cs are the first thing to prototype in a greybox.'],['combat-design','Combat is the stress test of the three working together.']] });
TECH('three-cs',[
  {n:'Greybox test course', how:`Build one flat course with a long jump, a tight turn, a drop and a target. Play it after every change to the character, controls or camera.`, fit:`Any game with a controlled character.`, cost:`Needs discipline to keep it unchanged. It cannot show how the camera behaves in real level geometry.`, alt:`Use the first real level as the course, once it exists.`},
  {n:'Forgiveness toggles', how:`Make each forgiving rule (coyote time, input buffer, aim assist) a named value with an off switch in a debug menu.`, fit:`Platformers, action games and shooters.`, cost:`Each rule is code to keep. Too many together make the game feel loose.`, alt:`Pick the one or two rules the genre needs and tune those only.`},
  {n:'Shared metrics sheet', how:`Write the character’s numbers and the level metrics they set (jump height, gap width, reach) in one file that level design reads.`, fit:`Any team with separate character and level owners.`, cost:`Has to be updated when the character changes, or it lies.`, alt:`Generate the level metrics from the character data, so they cannot drift.`}
]);
ENGINE('three-cs',{
  godot:{ term:`Two of the controls’ forgiving rules, coyote time and jump buffering, are two timers on a CharacterBody2D. Both are exported values, so they can be tuned in the editor.`,
    api:['CharacterBody2D.move_and_slide()','CharacterBody2D.is_on_floor()','Input.is_action_just_pressed()','@export','_physics_process()'],
    snippet:`extends CharacterBody2D
@export var coyote := 0.1
@export var buffer := 0.12
var since_floor := 99.0
var since_press := 99.0

func _physics_process(delta: float) -> void:
    since_floor = 0.0 if is_on_floor() else since_floor + delta
    since_press = 0.0 if Input.is_action_just_pressed("jump") else since_press + delta
    velocity.y += 1400.0 * delta
    if since_floor <= coyote and since_press <= buffer:
        velocity.y = -420.0
        since_floor = 99.0
        since_press = 99.0
    move_and_slide()`,
    pitfall:`Reading Input.is_action_just_pressed() in _process() and acting on it in _physics_process(). A press that lands between two physics ticks can be seen by the wrong function, or seen twice, so the jump drops out now and then. Read input and act on it in the same function.`,
    map:`Godot’s _physics_process with move_and_slide plays the part of Unity’s FixedUpdate with a Rigidbody2D. The two timers are the same idea in both.` },
  unity:{ term:`The same two timers, kept in a MonoBehaviour. A ground check feeds coyote time and the button press feeds the buffer. Both values are serialised so they can be tuned in the Inspector.`,
    api:['MonoBehaviour.Update()','Physics2D.OverlapCircle()','Input.GetButtonDown()','Rigidbody2D.linearVelocity','Time.deltaTime'],
    snippet:`public class Jumper : MonoBehaviour {
    [SerializeField] float coyote = 0.1f, buffer = 0.12f, jumpSpeed = 8f;
    [SerializeField] Rigidbody2D body; [SerializeField] LayerMask ground;
    float sinceGround = 99f, sincePress = 99f;
    void Update() {
        bool grounded = Physics2D.OverlapCircle(transform.position, 0.1f, ground);
        sinceGround = grounded ? 0f : sinceGround + Time.deltaTime;
        sincePress = Input.GetButtonDown("Jump") ? 0f : sincePress + Time.deltaTime;
        if (sinceGround <= coyote && sincePress <= buffer) {
            body.linearVelocity = new Vector2(body.linearVelocity.x, jumpSpeed);
            sinceGround = sincePress = 99f;
        }
    }
}`,
    pitfall:`Input.GetButtonDown belongs to the legacy Input Manager. A project set to use only the new Input System package throws an error when it is called. Either enable both input handling modes in Player settings, or read the press from an InputAction instead.`,
    map:`Unity’s Update with Time.deltaTime and an overlap ground check play the part of Godot’s _physics_process and is_on_floor. Rigidbody2D.linearVelocity is Godot’s velocity.` },
  note:`The design point is the same in both engines: forgiveness is two named numbers, not a hidden fudge. Written as values, each can be tuned in the editor, switched off for comparison and shared with the level designer who needs to know how far a jump really reaches.` });
INTERVIEW('three-cs',{
  junior:[
    { q:`What are the 3Cs, and why are they treated as one system?`,
      a:`Character, controls and camera. The character is what can move and act, the controls are how the player asks for it, and the camera shows the result. They form one loop: the player sees, decides, presses, the character responds, the camera follows. Change one and the other two have to be re-checked. Use a game you know, such as a platformer, and show how a change to jump height changes what the camera must show.`,
      follow:`Give an example of changing one C and having to retune another.`,
      red:`Lists them as three separate departments with no link between them.` },
    { q:`What are coyote time and input buffering, and why do platformers use them?`,
      a:`Coyote time lets a jump work for a very short time after the character has left a ledge. Input buffering remembers a jump press made a moment before landing and uses it on landing. Both forgive small timing errors, so a near miss feels fair. Celeste’s Maddy Thorson has described using such forgiveness throughout the game.`,
      follow:`What is the cost of making either one too long?`,
      red:`Calls them cheats, or cannot say what problem they solve.` },
    { q:`How do you start building the 3Cs for a new game?`,
      a:`In a greybox with a flat floor, a few platforms and a default camera. Get the character’s core movement feeling good before art, enemies or levels. Put the numbers in data, play a fixed test course after every change and share the numbers with level design.`,
      follow:`Why not build the first level and tune the character inside it?`,
      red:`Starts with character art and animation before the movement works.` }
  ],
  mid:[
    { q:`Playtesters say the character feels floaty. How do you find which C is the cause?`,
      a:`Separate the three. Check input latency first, then the jump or movement curve (rise and fall time, air control), then the camera (lag, smoothing, what the screen does as the character lands). Record input and screen together to see the delay. Fix the cheapest cause first, re-test, and keep the others unchanged while you do.`,
      follow:`The latency and curve are fine. What is left?`,
      red:`Changes the jump gravity only, because floaty means gravity.` },
    { q:`How do the character’s numbers reach level design?`,
      a:`As a shared sheet or generated metrics: maximum jump height and distance, run speed, reach and turn radius. Level design builds gaps and ledges from them with a margin. If the character changes, the sheet changes and levels are checked against it. Without that, gaps are built that cannot be crossed, or that are trivial.`,
      follow:`The character was retuned late. What do you do about levels already built?`,
      red:`Says level designers should playtest until it works.` },
    { q:`How would you handle controls across keyboard, gamepad and touch?`,
      a:`Treat each as its own tuning. Map actions, not keys. Give sticks a dead zone and a response curve, give touch large targets and no precision demand, and test on the real device. Offer remapping and sensitivity. Check that the camera control works on each, since a stick and a mouse have different speed needs.`,
      follow:`A touch build feels worse than the gamepad build. What do you check first?`,
      red:`Copies the gamepad layout onto the screen buttons.` }
  ],
  senior:[
    { q:`Your team wants one owner for the 3Cs. How do you set that up, and what does it cost?`,
      a:`Name one person or a small group who decides and signs off any change to the character, the controls or the camera, and who keeps the test course and the shared numbers. The gain is a loop tuned together. The cost is a bottleneck and a lot of weight on one view, so give them a rule: no change without a recording from the test course before and after.`,
      follow:`The owner and the combat designer disagree about the lock-on camera. How is it settled?`,
      red:`Splits the three between three leads, each tuning their own.` },
    { q:`A late change to the camera angle is proposed. How do you judge it?`,
      a:`List what depends on the angle: the controls (which way is forward), the level metrics (what the player can see), the combat readability and any scripted moments. Estimate the retuning for each and build the change in the greybox first. Compare the test course before and after. Approve it only if the gain is larger than the retuning cost for work already built.`,
      follow:`The change helps the combat and hurts the platforming. What now?`,
      red:`Approves it because the director likes it, with no list of what it breaks.` }
  ] });
DIAGRAM('three-cs', { kind:'loop', title:'The 3Cs are one loop, so none can be tuned alone',
  steps:[{t:'Camera shows', d:'what the player can see'},{t:'Player decides', d:'from what they see'},{t:'Controls carry it', d:'the press becomes an action'},{t:'Character moves', d:'speed, jump, abilities'},{t:'Camera follows', d:'and shows the result'}],
  note:'Swink’s “Game Feel” (2008) is the standard source for the responsiveness of this loop.' });
