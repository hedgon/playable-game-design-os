/* =====================================================================
   IN-GAME AI
   The intelligence that runs inside the game: behaviour, perception,
   navigation, directors, learned models. Not the same subject as the
   "AI Collaboration" domain, which is about using models to design.
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'gameai', t:'In-game AI', short:'NPCs, enemies, navigation, perception, directors, fairness', color:'var(--d-gameai)',
    sum:`The intelligence inside the running game: enemy and ally behaviour, perception, navigation, encounter and pacing directors, and the learned models that increasingly sit behind them. It is a different subject from AI Collaboration: that domain is about using a model to help design the game, this one is about the game thinking while it runs.`,
    links:[['core','Opponents and allies manufacture the situations the core loop has to be fun in.'],['content','Enemies, hazards and encounters are content that only becomes real once behaviour animates it.'],['level','Navigation, sightlines and encounter AI are level design and behaviour designed together.'],['systems','Behaviour reads and writes the same state your systems expose. In-game AI is itself a system.'],['ai','Collaboration AI builds the game. In-game AI runs inside it. Keeping the two apart prevents a category error.'],['production','AI is among the riskiest systems to leave late and the hardest to debug from a playtest recording.']] });

T('ingame-ai-purpose',{ d:'gameai', t:'What in-game AI is actually for', tag:'Not intelligence: a readable opponent, ally or world that produces the experience you promised.',
  what:`In-game AI is the behaviour that runs while the player plays: enemies deciding to charge or flank, a companion healing at the right moment, a director raising the pressure, a town that reacts. Its job is not to be smart. Its job is to create a legible, fair, interesting situation for the player, and to keep the fantasy alive. The best in-game AI is often mostly scripted and partly a lie: the player reads intent and character where the code has a state machine and a timer.`,
  why:[`Players experience behaviour, not architecture. A technically elegant planner that reads as random fails. A crude script that reads as a cunning rival succeeds.`,`AI is a promise-keeper for the fantasy: an "elite soldier" that walks into walls breaks it faster than any art bug.`,`Behaviour is where difficulty actually lives. Numbers set the ceiling. AI decides whether the player ever feels it is fair.`,`AI is one of the most expensive things to change late, because it interacts with level geometry, performance, and every balance pass.`],
  think:{ q:[`What is the player supposed to feel about this agent: fear, triumph, pity, trust, being outsmarted?`,`What does the agent need to do for the loop to work, and what is merely showing off?`,`If the player watched a replay, would they say the agent was fair and readable?`,`Can this be scripted, faked, or telegraphed instead of simulated? What is the cheapest version that reads correctly?`,`What does the agent know, and is it allowed to know it?`],
    trade:[`Simulated AI produces emergence and replayability. Scripted AI produces authored, reliable beats. Most shipped games blend them.`,`Smarter AI can feel unfair or exhausting. Dumber AI can feel lifeless. The target is "beatable and believable", not "optimal".`,`More perception and more options make AI less predictable and much harder to debug and to balance.`],
    traps:[`Treating "AI" as a benchmark to maximize instead of an experience to tune.`,`Confusing a smart agent with a fun opponent: an agent that plays optimally often beats the player into boredom.`,`Letting behaviour be defined by the tech (what the planner makes easy) instead of by the fantasy the player bought.`,`Building AI for the demo, where a human watches it, rather than for play, where a player fights it.`],
    good:[`Players narrate the agent's intent: "it was trying to flank me". That is the whole test.`,`Playtesters describe deaths as fair and matches as varied without knowing how the AI works.`],
    bad:[`Testers say "they just rushed me" or "it felt random", or cannot tell two enemy types apart.`,`The team's best story about the AI is about its code, not about a moment a player had.`] },
  how:[`Write the agent's job in one sentence tied to the fantasy and the loop, before choosing any technique.`,`Write the player-facing "tell" for every important state (wind-up, patrol, flee, flank): the player must be able to read it.`,`Prototype the cheapest version that could read correctly: often a script, a timer, or a handful of states.`,`Test readability and fairness in playtests, not by watching the AI in isolation. Iterate on perception and tells, not only on smarts.`,`Only add technique (planner, utility, learning) when the cheap version provably cannot produce the behaviour the experience needs.`],
  tech:[
    {n:'Scripted sequences and triggers', how:'Authored commands fired by triggers, volumes or timers. No decision-making at runtime.', fit:'Set pieces, tutorials, boss phases, anything that must be repeatable and readable.', cost:'Breaks the moment the player does something unexpected. Expensive to author per situation.', alt:'Start here. Most "smart" moments in shipped games are this plus good presentation.'},
    {n:'Sleight of hand (faking intelligence)', how:'Cheats that read as competence: aim assist, delayed reactions, invisible rubber-banding, off-screen spawn logic, the agent "missing" on purpose.', fit:'Whenever the real capability is too expensive or too punishing, but the player must read intent.', cost:'Fragile under inspection (replays, streamers). Must stay invisible to keep trust.', alt:'Combine with real behaviour so the lie has a truthful base to hide in.'},
    {n:'Environmental and ambient reaction', how:'Cheap reactive states driven by player position or action: crowd flees, guards look, wildlife scatters.', fit:'Making the world feel alive without a full agent simulation.', cost:'Can look repetitive if the same reaction always fires. Needs variety and cooldown tuning.', alt:'Layer local reactions onto a simple state machine before building global systems.'}
  ],
  ai:{ yes:[`Enumerate behaviours a given agent could express and map each to the feeling it would create.`,`Generate player-facing tells and animation/audio cues for a state you describe.`,`List ways to fake a competence the real system cannot afford, and rank them by risk of being noticed.`,`Review a behaviour spec for states a player could not read.`],
       no:[`Decide the fantasy or the intended feeling of an agent. That is design identity.`,`Certify that behaviour "is fun" or "is fair" without player evidence.`,`Choose the architecture. That depends on team skill, performance budget and how often the game will change.`] },
  prompts:[{l:'Agent intent and tells',p:`We are designing an enemy called [NAME] whose player-facing feeling should be [FEELING, e.g. "a wary hunter who punishes greed"]. Its job in the loop: [JOB]. List the distinct behaviours it should express, and for each: the player-visible tell, the counter-play it invites, and the failure it would look like if the tell were missing. Then propose a scripted-only version and a simulated version, and state the cheapest one that could produce the feeling. Do not pick one. I decide.`},
    {l:'Fake vs simulate',p:`We want the agent to appear to [CAPABILITY], but a full simulation would cost [BUDGET/TIME]. Propose five ways to fake or simplify this that a player would read as real, for each the situation where it is undetectable, and the situation where it would be caught (replays, expert players, edge cases). Rank by risk.`}],
  verify:[`Is the proposed behaviour justified by the fantasy and the loop, or by what the technique makes easy?`,`For every claimed "smart" behaviour, is there a player-facing tell and a counterplay?`,`Are the faked/cheap tricks listed honestly, including when they break?`],
  test:[`Silent observation: can players state each agent's intent and how they read it?`,`Do players describe losses as fair and explainable, or as "random" or "cheap"?`,`Do two players in the same encounter report different, sensible responses from the same agent?`],
  rel:[['encounters-and-enemies','Enemies exist to ask the player a question. AI is how they ask it.'],['core-loop','Behaviour creates the situations the loop must handle.'],['readable-and-fair-ai','Readability and fairness are the real success criteria.'],['scripted-vs-simulated','The cheapest technique that reads correctly usually wins.'],['ai-for-implementation','Collaboration AI builds the game. This domain runs inside it.']] });
ENGINE('ingame-ai-purpose',{
  godot:{ term:`An agent is a scene, not a class. A CharacterBody3D root carries the collision and the movement, a behaviour node decides, and an AnimationPlayer owns every tell the player has to read. The intent a player narrates lives in the animation tracks.`,
    api:['CharacterBody3D / CharacterBody2D','AnimationPlayer.play() and animation_finished','Animation call method tracks','AnimationMixer.callback_mode_method','Node.add_to_group() / is_in_group()','AudioStreamPlayer3D.play()'],
    snippet:`extends CharacterBody3D              # res://enemy/lancer/lancer.tscn
signal telegraphed(kind: String)     # the tell, which is not the damage

@onready var anim: AnimationPlayer = $AnimationPlayer

func wind_up() -> void:
\tanim.play("charge_windup")       # 0.7s of pose, dust and a rising tone
\ttelegraphed.emit("charge")
\tawait anim.animation_finished    # committed: no retarget during the tell
\t_charge()

func _charge() -> void:
\tvelocity = -global_transform.basis.z * 14.0
\tmove_and_slide()`,
    pitfall:`Opening the hitbox from an animation call method track and leaving the callback mode alone. AnimationMixer.callback_mode_method defaults to deferred, so the method runs at the end of the frame rather than on the animation frame that was keyed, and the hit lands one step after the pose the player read and reacted to. Set the mode to immediate for gameplay clips, or better, keep the animation for the tell and resolve the rule in code.`,
    map:`Godot's AnimationPlayer is Unity's Animator, a call method track is an AnimationEvent, and a signal is a UnityEvent.` },
  unity:{ term:`An agent is a prefab: an Animator for the tells, a decision component, and a movement component. The Animator parameters are the contract between what the agent decided and everything the player is allowed to see.`,
    api:['Animator.SetTrigger() / ResetTrigger() / SetBool()','Animator.CrossFade()','AnimatorStateInfo.normalizedTime','StateMachineBehaviour.OnStateEnter() / OnStateExit()','UnityEvent<string>','AudioSource.PlayOneShot()'],
    snippet:`public class Lancer : MonoBehaviour {
    [SerializeField] Animator animator;
    [SerializeField] CharacterController controller;
    public UnityEvent<string> Telegraphed;   // the tell, not the damage

    public void WindUp() {
        animator.ResetTrigger("Charge");     // clear a stale request first
        animator.SetTrigger("Charge");
        Telegraphed.Invoke("charge");
    }

    public void OnWindUpEnded() {            // called from the state behaviour
        controller.Move(transform.forward * 14f * Time.deltaTime);
    }
}`,
    pitfall:`Animator.SetTrigger stays set until some transition consumes it. Set one while the agent is in a state with no outgoing Charge transition and it sits in the parameter, then fires the wind-up the moment the agent returns to idle, seconds late and pointed at nothing. The player reads a lie and calls the enemy broken. ResetTrigger before you set one, or use a bool you clear yourself.`,
    map:`Unity's Animator is Godot's AnimationPlayer and AnimationTree, an AnimationEvent is a call method track, and a UnityEvent is a signal.` } });
INTERVIEW('ingame-ai-purpose',{
  junior:[
    { q:`What is in-game AI actually for?`,
      a:`To create a legible, fair, interesting situation for the player and to keep the fantasy alive. Not to be smart. An agent that plays optimally usually makes a worse game than one that reads as a cunning rival, because the player experiences behaviour rather than architecture. Start from the feeling the agent should produce.`,
      follow:`Give me a case where making the AI smarter would make the game worse.`,
      red:`Describes AI as making the opponent as strong as possible, or answers only with techniques.` },
    { q:`Describe an enemy you admire and what it made you feel.`,
      a:`Name the game, the agent, and the emotion: fear, pressure to move, satisfaction at outsmarting it. Then say what produced it, and be honest that it was probably a wind-up, a commitment window, a bark and a timer rather than sophisticated reasoning. Connect the feeling to the mechanism.`,
      follow:`What would break that feeling if you changed one thing about it?`,
      red:`Praises an enemy for being difficult, with no account of what it made them feel or do.` },
    { q:`What is a tell, and why does every important state need one?`,
      a:`A tell is the player-visible signal of what the agent is doing or about to do: a pose, a sound, a light, a change of tempo. Without it the state exists only in code, so the player cannot read intent, cannot counterplay, and reports the agent as random. Design the tell at the same time as the state.`,
      follow:`Two states share a tell. What goes wrong?`,
      red:`Treats tells as animation polish to be added at the end.` }
  ],
  mid:[
    { q:`Testers say the AI felt random. Where do you look?`,
      a:`Not at the decision logic first. Look at whether each state has a distinct, visible tell, whether the agent commits long enough to be read, and whether transitions happen faster than a player can perceive. Random usually means unreadable. Then check perception, because an agent reacting to something the player cannot see reads as arbitrary.`,
      follow:`The tells are all there and it still reads as random. Now what?`,
      red:`Goes straight to rewriting the behaviour tree, or adds more states for variety.` },
    { q:`How do you decide between scripting a behaviour and simulating it?`,
      a:`Ask what the player must read, then take the cheapest mechanism that produces it. Most memorable moments in shipped games are a trigger, a timer and good presentation. Escalate only when you can name a specific situation where the cheap version visibly fails. Simulation is a permanent cost in balance, performance and bugs.`,
      follow:`Give me a behaviour you would never script. Why not?`,
      red:`Defaults to simulation because it is more general, or scripts everything and cannot say when that fails.` },
    { q:`What does the agent know, and is it allowed to know it?`,
      a:`Behaviour should read from the agent's own memory rather than from world state directly. The moment it reads player position or health straight out of the game, it starts behaving in ways the player cannot account for, and the complaint is unfairness even if the numbers are gentle. Decide knowledge deliberately and expose it in a debug view.`,
      follow:`How would a player detect that an agent knows too much?`,
      red:`Sees direct world reads as an implementation convenience with no design consequence.` }
  ],
  senior:[
    { q:`Behaviour work was left until month nine. What are the consequences?`,
      a:`It interacts with level geometry, performance budget and every balance pass, so late work forces changes in all three at the point where they are most expensive. Encounters were designed against agents that did not exist. Expect navigation holes in finished levels, a frame budget already spent, and difficulty tuning that has to restart. Prototype behaviour with grey boxes early instead.`,
      follow:`You have inherited exactly this. What do you do in the first two weeks?`,
      red:`Treats AI as a system that can be dropped in late because it is self-contained.` },
    { q:`How do you set success criteria for an enemy roster?`,
      a:`Per agent, name the feeling, the question it asks the player, the tell, and the counterplay. Across the roster, require that players can distinguish agents at a glance and describe different responses to each. The measurable test is players narrating intent in a playtest without knowing how anything works.`,
      follow:`Two enemies in the roster test as the same thing. What do you cut or change?`,
      red:`Sets criteria as health, damage and spawn counts, with no player-facing read.` }
  ] });

T('choosing-ai-technique',{ d:'gameai', t:'Choosing a behaviour technique', tag:'Finite state machine, behaviour tree, utility AI, planner: pick by decision shape, authoring cost and debuggability.',
  what:`The family of techniques that decide what an agent does next. They differ along three axes that matter more than fashion: what shape of decision they express well, how cheap they are to author and change, and how easy they are to debug when the agent does something stupid. A finite state machine is a few exclusive modes. A behaviour tree composes tasks with priorities. Utility AI scores many options against weighted considerations. A planner searches for a sequence of actions to reach a goal.`,
  why:[`The technique shapes what is easy and what is impossible later. Choosing wrong means fighting the tool for the life of the project.`,`Authoring cost dominates. A "smarter" technique that no one on the team can read or extend is worse than a simple one they can tune daily.`,`Debuggability is a shipped feature: when a boss does nothing on stage, someone has to see why in minutes, not days.`,`Most teams need one technique plus a decision layer, not a research stack.`],
  think:{ q:[`Is this decision reactive (pick among options now) or goal-directed (do a sequence to reach a state)?`,`How many distinct considerations trade off against each other? One or two favors states. Many favor utility.`,`How often will designers change this after launch, and who changes it: engineer or designer in data?`,`When it misbehaves, can a non-programmer see the reason?`,`Does it need to be deterministic and replayable?`],
    trade:[`State machines: trivial to reason about, explode into spaghetti as states multiply, awkward for two-axis decisions (attack vs retreat vs reposition vs use ability).`,`Behaviour trees: composable and readable, but priority mistakes cause silent "never fires" bugs, not naturally utility-driven.`,`Utility AI: smooth, tunable, handles many competing concerns and produces variety, but is hard to debug ("why did it pick that?") and can feel wishy-washy without good curves.`,`Planners (GOAP/HTN): goal-directed and emergent, excellent for systemic worlds, but expensive, hard to author action sets for, and can produce bizarre-but-valid plans.`],
    traps:[`Choosing a planner because it is impressive to other developers, then discovering designers cannot tune it.`,`Treating these as exclusive. Most good agents are a behaviour tree of tasks, with utility or a planner for one hard subproblem.`,`Underestimating authoring tools: the data format and the debug view are as important as the algorithm.`,`Letting the state count grow unchecked. A "few states" becomes forty without a hierarchy.`],
    good:[`A designer can add or retune a behaviour without an engineer, and can explain a decision from a debug view.`,`The chosen technique handles the hardest decision in the game cleanly, not just the easy ones.`],
    bad:[`"It is a state machine" hides a hundred implicit transitions nobody can list.`,`Designers ask engineering to change behaviour because the data is unreadable.`] },
  how:[`Write the agent's hardest decision in plain language first (the one with the most competing factors). That decides the family.`,`Start with the simplest technique that could express it, usually a state machine or a small behaviour tree.`,`Put behaviour data in a readable form designers can edit (data assets, not code constants), and build a debug view that shows the current decision and why.`,`Add one advanced layer (utility or a planner) only for the subproblem the simple layer handles badly.`,`Budget for iteration: expect to retune weights and priorities many times, and design the tooling for that loop.`],
  tech:[
    {n:'Finite state machine (FSM)', how:'A fixed set of states with explicit transitions. Only one state is active at a time. Hierarchical FSMs nest states to tame the explosion.', fit:'Reactive agents with a few clear modes (idle, patrol, chase, attack, flee), bosses with phases, anything that must be fully predictable.', cost:'Transitions multiply combinatorially. Poor at decisions that mix several factors. Shared behaviour needs duplication.', alt:'A behaviour tree once state count or shared sub-behaviour grows. A utility layer once decisions trade off several factors.'},
    {n:'Behaviour tree (BT)', how:'A tree of composites (sequence, selector) and leaves (actions, conditions) ticked from the root. Selectors try children by priority and fall through on failure.', fit:'Most action-game enemies and allies. Composing reusable subtrees (move, attack, retreat). Designers comfortable with a visual editor.', cost:'Priority errors cause whole branches to never run. Conditions must be cheap. No natural notion of "best" among options.', alt:'Add utility at the selector when priorities are really trade-offs. Add a planner for long-horizon goals.'},
    {n:'Utility AI', how:'Each possible action is scored by weighted considerations mapped through response curves. The highest score wins, typically recomputed on a cadence.', fit:'Agents with many competing needs (fight, cover, heal, reposition, help ally) where behaviour should vary smoothly and be tunable.', cost:'Hard to explain a decision. Bad curves produce mush. Needs good debug visualization of scores.', alt:'Use for the decision layer only, with states/BT executing the chosen action.'},
    {n:'Goal-oriented planner (GOAP / HTN)', how:'The agent has goals and a library of actions with preconditions and effects. It searches for a cheap sequence of actions that reaches a goal, then executes it.', fit:'Systemic or immersive-sim worlds where agents must use the same world rules as the player. Long-horizon, multi-step plans.', cost:'Action authoring is heavy. Search cost and replanning need budgeting. Can produce valid but absurd plans. Very hard to debug.', alt:'Reserve for one showcase agent archetype. Keep a BT/utility fallback for the masses.'},
    {n:'Hybrid: BT/FSM + utility or planner', how:'A simple reactive layer runs the moment-to-moment decisions. Utility or a planner handles the occasional hard, goal-directed choice.', fit:'Most production games at scale: predictable common case, sophistication where it is visible and worth the cost.', cost:'Two mental models to maintain and debug. The seam between layers needs clear contracts.', alt:'This is usually the right answer. Start simple and add the second layer only when needed.'}
  ],
  ai:{ yes:[`Given the hardest decision in plain language, propose candidate techniques with trade-offs and a recommendation I can reject.`,`Generate the state list, transition conditions, or action preconditions/effects for a spec you provide.`,`Draft consideration curves and weights for a utility setup, then argue why they might be wrong.`,`Review an action set for preconditions that can never be true (never-fires bugs).`],
       no:[`Decide the architecture without knowing team skill, performance budget and how often behaviour will change.`,`Assert a decision is "smart" or "optimal". The target is readable, not optimal.`,`Replace playtesting of readability and fairness.`] },
  prompts:[{l:'Technique selection',p:`Our agent needs to make this decision: [HARDEST DECISION, with the factors that trade off]. Team: [SKILLS]. How much a designer will retune behaviour post-launch: [AMOUNT]. Performance budget: [BUDGET]. Compare FSM, behaviour tree, utility AI and a planner for THIS decision on: expressiveness, authoring cost, debuggability, performance, and what becomes hard later. Recommend one primary technique, name the specific failure that would make us regret it, and propose the debug view we would need. Do not write code.`},
    {l:'Never-fires audit',p:`Here is our behaviour tree / action set: [STRUCTURE]. Find branches or actions that can never fire because a higher-priority sibling always succeeds or a precondition is unreachable, and any condition that is always true. List each with the minimal repro state. Do not rewrite the tree.`}],
  verify:[`Is the recommendation justified by the decision's shape and the team's ability to author/debug it, or by novelty?`,`Can a designer explain, from the design, why the agent would choose each option?`,`Are the never-fires and priority-hazard cases identified?`],
  test:[`Can a designer change one behaviour in data and observe the change in play without engineering help?`,`When the agent misbehaves, can the team find the reason from a debug view within minutes?`,`Does behaviour stay readable and varied across a long session, or collapse into one dominant action?`],
  rel:[['mechanics-and-rules','AI actions must obey and expose the same world rules the player learns.'],['ingame-ai-purpose','The technique serves the experience, not the reverse.'],['ai-budgets-and-debugging','Debuggability and cost are first-class selection criteria.'],['systemic-design','Planners shine when the world itself is systemic.'],['ai-for-implementation','Use collaboration AI to prototype the chosen technique cheaply.']] });
ENGINE('choosing-ai-technique',{
  godot:{ term:`States are Nodes and behaviour data is a Resource. A machine node forwards the physics tick to the active child state and swaps when that state asks for it. Behaviour trees come from an addon such as LimboAI, whose tasks and blackboard are also Resources a designer edits as .tres files.`,
    api:['extends Node per state, with class_name','_physics_process(delta) forwarded to the active state','Resource + @export_range for designer-editable data','LimboAI: BTPlayer, BTTask, Blackboard','Node.get_children() / Node.name for the state list','ResourceLoader.load() to swap a behaviour set'],
    snippet:`class_name StateMachine extends Node
@export var start: NodePath
var _state: Node

func _ready() -> void:
\t_enter(get_node(start))

func _physics_process(delta: float) -> void:
\tvar next: Node = _state.tick(delta)   # a state returns itself or a sibling
\tif next != _state:
\t\t_state.exit()
\t\t_enter(next)
func _enter(to: Node) -> void:
\t_state = to
\t_state.enter()`,
    pitfall:`Using AnimationTree's AnimationNodeStateMachine as the decision layer because the graph editor is already there. travel() requests a route and the animation tree resolves it on the animation update, transitions carry their own advance conditions, and the state you can read back is the one the blend reached rather than the one you asked for. Gameplay decisions become invisible inside a graph built for blending, and none of it runs headless. Keep the brain in its own nodes and let the AnimationTree follow it.`,
    map:`A Godot state node with enter, tick and exit is a StateMachineBehaviour, and LimboAI's BTPlayer is a behaviour tree graph asset.` },
  unity:{ term:`Behaviour lives in its own assets rather than in the Animator. The Behavior package gives graph assets with nodes, and a hand rolled machine is ScriptableObject states plus one runner MonoBehaviour. Either way the decision is a file a designer can open.`,
    api:['ScriptableObject states with [CreateAssetMenu]','A runner MonoBehaviour calling state.Tick(agent, dt)','com.unity.behavior: BehaviorGraphAgent and graph assets','AnimationCurve for utility response curves','[SerializeField] wiring in the Inspector','Debug.DrawLine() / OnDrawGizmosSelected() for a decision overlay'],
    snippet:`public abstract class State : ScriptableObject {
    public abstract State Tick(Agent a, float dt);   // returns self or the next
    public virtual void Enter(Agent a) { }
    public virtual void Exit(Agent a) { }
}

[CreateAssetMenu(menuName = "AI/Chase")]
public class Chase : State {
    [SerializeField] float giveUpRange = 25f;
    [SerializeField] State onLost;
    public override State Tick(Agent a, float dt) {
        a.MoveTo(a.Knowledge.LastSeen);              // no per-agent field here
        return a.DistanceTo(a.Knowledge.LastSeen) > giveUpRange ? onLost : this;
    }
}`,
    pitfall:`Caching per-agent state in a field on the ScriptableObject. A state asset is one object shared by every agent that references it, so a timer or a target stored on it is written by thirty enemies at once and the squad behaves as if it were telepathic. Worse, the last value written is serialized into the asset in the editor. Keep the asset stateless and pass the agent in, or Instantiate the asset per agent and accept the extra objects.`,
    map:`A Unity ScriptableObject state asset is a Godot Resource, and a Behavior graph asset is a LimboAI behaviour tree resource.` } });
INTERVIEW('choosing-ai-technique',{
  junior:[
    { q:`Finite state machine or behaviour tree: when would you reach for each?`,
      a:`A state machine when the agent has a few exclusive modes with clear transitions and must stay fully predictable, such as a boss with phases. A behaviour tree once the state count grows or sub-behaviours need reuse across agents, because composing subtrees beats duplicating transitions. Say what the agent's hardest decision is first, since that decides the family.`,
      follow:`Your state machine has grown to thirty states. What are the symptoms?`,
      red:`Picks by what they used last, or claims behaviour trees are strictly better.` },
    { q:`What is a selector, and what is the classic bug it causes?`,
      a:`A selector tries children in priority order until one succeeds. The classic bug is a branch that never fires because a higher-priority sibling always succeeds, or a precondition that is unreachable. It fails silently, so the agent simply never does the thing, and nobody sees an error.`,
      follow:`How would you find every never-fires branch in a tree you inherited?`,
      red:`Knows the composite types by name but cannot name a failure they cause.` },
    { q:`Explain utility AI in a paragraph.`,
      a:`Each possible action is scored by weighted considerations mapped through response curves, and the highest score wins, recomputed on a cadence. It handles many competing concerns smoothly and varies naturally. The cost is explainability: the answer to "why did it pick that" is a set of numbers, so you need a debug view showing the scores.`,
      follow:`What does bad curve tuning look like in play?`,
      red:`Describes it as random weighted choice, or confuses it with a planner.` }
  ],
  mid:[
    { q:`Your agent must weigh fight, retreat, heal and reposition. Which technique and why?`,
      a:`That is four options trading off several factors continuously, which is where state machines get awkward and utility fits. In practice use a utility layer for the decision and a behaviour tree or state machine to execute the chosen action. Pair it with a score overlay from day one, because you will be tuning curves for months.`,
      follow:`The designer says the agent feels indecisive. What is happening and how do you fix it?`,
      red:`Adds more states to the existing machine, or picks a planner for a reactive decision.` },
    { q:`Designers cannot change behaviour without an engineer. What did you get wrong?`,
      a:`The data format and the debug view, which matter as much as the algorithm. Behaviour lives in code constants instead of readable data assets, so every tuning pass is a ticket. The fix is to move the tunable surface into data a designer can edit, plus a view that shows the current decision and its reason.`,
      follow:`How do you migrate behaviour into data on a live project?`,
      red:`Answers that designers should learn to read the code.` },
    { q:`When does a planner earn its cost?`,
      a:`When the world is genuinely systemic, the agent must use the same rules as the player, and the value is long-horizon multi-step plans that authored logic cannot cover. Reserve it for one showcase archetype and keep a simpler fallback for the rest. The costs are action authoring, search budget, bizarre-but-valid plans and very hard debugging.`,
      follow:`Your planner produces a valid plan that looks absurd on screen. How do you handle it?`,
      red:`Wants a planner because it is more general, with no account of authoring or debug cost.` }
  ],
  senior:[
    { q:`Team of eight, one AI engineer, forty enemy types, a live game. Pick an architecture and defend it.`,
      a:`Behaviour trees with reusable subtrees as the backbone, data-driven so designers retune without engineering, plus a utility layer only for the one decision that is genuinely a trade-off. Invest early in the debug view and the data format. With one engineer and a live game, authoring cost and debuggability dominate the choice, not expressiveness.`,
      follow:`Where does that architecture hurt you in year two?`,
      red:`Picks by technical elegance and does not mention who authors behaviour day to day.` },
    { q:`How do you decide you chose wrong, and how do you migrate?`,
      a:`The signals are structural: transitions nobody can enumerate, tuning passes that need engineering, and bugs that take days to locate. Migrate by strangling rather than rewriting: put the new layer in front of the decision for one agent archetype, keep the old execution, and move archetypes across once the debug story is better. Never migrate everything before a milestone.`,
      follow:`Mid-migration you now have two systems. How do you keep that from being permanent?`,
      red:`Proposes a full rewrite, or refuses to change because of sunk cost.` }
  ] });

T('perception-and-awareness',{ d:'gameai', t:'Perception, memory and what the agent knows', tag:'The AI must not read the world directly. Give it senses, memory and a model of what it knows.',
  what:`How an agent gathers and stores information: sight (view cones, line of sight, field of view), hearing and other stimuli, memory of where the player was, and a shared knowledge store (blackboard) or spatial layer (influence map). Perception is where fairness is decided: an agent that "knows" too much feels omniscient and unfair, one that knows too little feels deaf and lifeless.`,
  why:[`Players judge fairness by what the agent could plausibly know. Enemies that shoot through walls or track a hidden player are the most common "cheating AI" complaint.`,`Perception creates the stealth, tension and information games at the heart of many loops. Take it away and those genres disappear.`,`Perception cost scales with agents and geometry. Naive "check everything every frame" is a classic performance and bug sink.`,`Asymmetric perception is a design dial: the player seeing more than the enemy (or less) is a deliberate experience choice.`],
  think:{ q:[`What should this agent be able to sense, and through what channel (sight, sound, touch, shared intel)?`,`What does "losing" the player look like: immediate amnesia, or a memory with decay and a search?`,`Is perception symmetric with the player's, or deliberately different, and is that difference communicated?`,`How is knowledge shared: does one guard's alert inform the others, and how fast?`,`What is the cheapest perception that still produces the intended tension?`],
    trade:[`Perfect perception is simple and can be cheap, but reads as cheating and removes stealth tension.`,`Rich perception and memory create believable, fair agents but are expensive and hard to debug.`,`Shared knowledge (a group blackboard) makes coordinated, scary groups but can make the whole level alert instantly, which removes pacing control.`],
    traps:[`Reading player state directly (position, health) instead of through senses, then wondering why players call it unfair.`,`Zero memory: the agent forgets the instant line of sight breaks, which reads as brain damage.`,`Vision cones that do not match the animation or the level geometry, so players are seen in ways they cannot explain.`,`Perception cost ignored until late, when it becomes a performance cliff with many agents.`],
    good:[`Players can exploit perception deliberately (break line of sight, make noise elsewhere) and the exploit works.`,`A lost player causes a believable search or alert escalation, not instant memory loss.`],
    bad:[`Players learn that hiding is pointless.`,`"How did it know I was there?" is a common tester question.`] },
  how:[`Define the senses and their parameters (cone angle, range, line-of-sight test, hearing radius) from the fantasy, then expose them for tuning.`,`Separate sensing from knowledge: sensing writes to a per-agent or shared memory, behaviour reads memory, never the raw world.`,`Model losing the player: last-known position plus decay, and a search behaviour that uses it.`,`Budget perception: stagger and time-slice checks, use spatial queries/volumes, and test with the maximum agent count the level allows.`,`Playtest the fairness of knowledge explicitly: ask testers what the enemy "should" have known at each alert.`],
  tech:[
    {n:'Vision cone + line of sight', how:'Range and angle test against the target, then a raycast or navmesh visibility test to confirm line of sight. Often sampled over time rather than every frame.', fit:'Almost every enemy that sees. Stealth and tactical games where sight is the core information.', cost:'Per-agent raycasts scale badly. Cone must match level geometry or it lies. Needs staggering/LOD.', alt:'Simplify with a probability model or a coarse visibility grid for large counts.'},
    {n:'Hearing and stimulus events', how:'Actions emit stimulus events with position and loudness. Agents within range "hear" and respond. The same bus can carry sight once confirmed.', fit:'Stealth, immersive sims, and any game where noise is a resource or a tell.', cost:'Event storms can flood agents. Needs priority and attenuation tuning.', alt:'Reuse one perception event bus for sight, sound and damage to avoid ad-hoc checks.'},
    {n:'Blackboard (shared knowledge)', how:'A central store of facts (target, alert level, last-known position, points of interest) that agents and behaviours read and write.', fit:'Group coordination, squad behaviour, and any shared world state the AI reasons over.', cost:'Easy to turn every agent omniscient. Needs explicit access rules and write arbitration.', alt:'Per-agent blackboard plus a delayed, filtered shared layer to preserve pacing.'},
    {n:'Influence maps / spatial awareness', how:'A grid over the level accumulating influence (danger, coverage, sound, allies) that agents sample for cheap, readable spatial decisions.', fit:'Cover selection, tactical positioning, crowd control, and "where is it dangerous here" reasoning.', cost:'Memory and update cost. Can go stale. Tuning the accumulation is fiddly.', alt:'Use for positioning subproblems, not as a replacement for direct sensing.'}
  ],
  ai:{ yes:[`Enumerate senses and parameters that would produce a described tension, with rough ranges.`,`Write the memory model (last-known position, decay, search) for an agent described in words.`,`List unfair-knowledge failure modes for a perception spec (through-wall, off-screen, instant group alert).`,`Propose cheap approximations for a vision/hearing system at a given agent budget.`],
       no:[`Decide whether perception should be symmetric. That is an experience decision.`,`Guarantee a perception setup "feels fair" without playtesting hiding and breaking line of sight.`] },
  prompts:[{l:'Perception fairness review',p:`Agent: [DESCRIPTION]. Its senses and parameters: [CONE, RANGE, LOS, HEARING, MEMORY]. Player-facing fantasy: [FEELING]. Identify every way a player could feel this agent "cheated" (saw without line of sight, knew an off-screen position, shared alert too fast), rank them by how likely a player is to notice, and for each propose the smallest change that preserves the intended capability while removing the unfairness. Then state what to watch in playtests.`}],
  verify:[`Does behaviour read only from memory/knowledge, or does it reach into raw player state?`,`Can the player explain, after the fact, how they were detected?`,`Are the performance costs of perception addressed, not assumed?`],
  test:[`Do players successfully hide and re-hide, and can they describe why it worked?`,`Ask testers, after each detection, "should the enemy have seen you there?" Track the disagreement rate.`,`Break line of sight and measure whether the agent searches believably or instantly forgets.`],
  rel:[['readable-and-fair-ai','Perception is where fairness is won or lost.'],['spatial-composition','Sightlines are level geometry. Perception must agree with them.'],['difficulty','Asymmetric knowledge is a difficulty and tension dial.'],['tension-release','Information control is the core of tension.'],['ai-budgets-and-debugging','Perception is a common performance cliff.']] });
ENGINE('perception-and-awareness',{
  godot:{ term:`Sensing is a physics query and knowledge is a separate object. A distance and cone test finds candidates, a ray through PhysicsDirectSpaceState3D confirms line of sight, and what the agent learned is written to its own memory node that the behaviour reads instead of the world.`,
    api:['get_world_3d().direct_space_state','PhysicsRayQueryParameters3D.create() with exclude and collision_mask','Area3D.get_overlapping_bodies() / body_entered','Vector3.dot() for the cone test','RayCast3D with hit_from_inside','Timer for the memory decay'],
    snippet:`func _physics_process(_delta: float) -> void:   # queries are only legal here
\tvar to: Vector3 = target.global_position - global_position
\tif to.length() > sight_range: return
\tif -global_transform.basis.z.dot(to.normalized()) < cos(deg_to_rad(55.0)):
\t\treturn
\tvar q := PhysicsRayQueryParameters3D.create(
\t\tglobal_position + Vector3.UP, target.global_position + Vector3.UP)
\tq.exclude = [get_rid()]                    # or it sees its own body first
\tq.collision_mask = 1                       # world geometry only
\tif get_world_3d().direct_space_state.intersect_ray(q).is_empty():
\t\tmemory.saw(target.global_position)     # behaviour reads memory, not target`,
    pitfall:`Calling intersect_ray from _process, from a signal callback or from a thread. The physics space is locked outside the physics step, so the query either errors about flushing queries or answers from the previous tick, and a sight test that silently answers late is what players report as an enemy seeing through a wall. Sense in _physics_process, and set exclude to the agent's own RID or the first thing every ray hits is the agent.`,
    map:`Godot's direct_space_state.intersect_ray is Unity's Physics.Linecast, and an Area3D is a trigger Collider with OnTriggerStay.` },
  unity:{ term:`Perception is a physics query plus a LayerMask. An overlap gathers candidates on the target layer, a Linecast against the occluder layer confirms sight, and the result goes into a knowledge component so behaviour never reads the player transform directly.`,
    api:['Physics.OverlapSphereNonAlloc() with a LayerMask','Physics.Linecast() with QueryTriggerInteraction.Ignore','Vector3.Angle() for the cone','Physics.queriesHitTriggers','LayerMask.GetMask()','Time.time for the memory timestamp'],
    snippet:`readonly Collider[] hits = new Collider[16];     // reused, no per-frame garbage

void Sense() {
    int n = Physics.OverlapSphereNonAlloc(transform.position, sightRange,
                                          hits, targetLayers);
    for (int i = 0; i < n; i++) {
        var to = hits[i].transform.position - transform.position;
        if (Vector3.Angle(transform.forward, to) > halfAngle) continue;
        if (Physics.Linecast(eye.position, hits[i].bounds.center, occluders,
                             QueryTriggerInteraction.Ignore)) continue;
        knowledge.Saw(hits[i].transform.position, Time.time);
    }
}`,
    pitfall:`Leaving the line of sight check on the default trigger setting. Physics.queriesHitTriggers is true, so the Linecast stops on the first trigger volume between the eye and the target: a checkpoint, a music zone, a reverb box. The guard goes blind in exactly the rooms with the most design in them and nothing in the scene looks wrong. Pass QueryTriggerInteraction.Ignore and keep occluders on their own layer.`,
    map:`Unity's LayerMask is Godot's collision_mask, OverlapSphere is Area3D.get_overlapping_bodies, and Physics.Linecast is intersect_ray.` } });
INTERVIEW('perception-and-awareness',{
  junior:[
    { q:`Why should behaviour not read player state directly?`,
      a:`Because fairness is judged by what the agent could plausibly know. Direct reads produce agents that shoot through walls, track a hidden player and react to things off screen, which is the most common cheating complaint there is. Sensing should write into memory, and behaviour should read only from memory.`,
      follow:`Where is it acceptable to read the world directly?`,
      red:`Sees it as an optimisation with no player-facing consequence.` },
    { q:`Design the senses for a patrolling guard.`,
      a:`A vision cone with an angle and a range, plus a line-of-sight confirmation that respects the geometry the player sees. A hearing radius driven by stimulus events with loudness and attenuation. Memory of the last known position with a decay, and a search behaviour that uses it. Expose every parameter for tuning.`,
      follow:`How do you make sure the cone matches what the guard appears to be looking at?`,
      red:`Uses a distance check only, so the player is detected from behind through a wall.` },
    { q:`What is a blackboard?`,
      a:`A shared store of facts the behaviour reads and writes: the target, the alert level, the last known position, points of interest. Per agent it is the memory. Shared across a group it is coordination, and it is also the fastest way to make every agent omniscient, so it needs explicit access rules and a delay.`,
      follow:`What goes on the shared board and what stays private?`,
      red:`Describes it as a global variable bag with no access discipline.` }
  ],
  mid:[
    { q:`Testers keep asking how the enemy knew they were there. Diagnose.`,
      a:`Check for direct world reads, a vision cone that does not match the animation or the geometry, sound events with no attenuation, and instant group alert propagation. Then check memory: if the agent never loses the player, every re-detection reads as omniscience. Reproduce one case from a log before changing anything.`,
      follow:`Everything checks out and testers still say it. What is left?`,
      red:`Reduces the detection range and calls it fixed.` },
    { q:`Model what happens when the agent loses the player.`,
      a:`Store the last known position with a decay timer, escalate to a search behaviour around it, widen to plausible exits, then de-escalate through a suspicious state back to patrol. Immediate amnesia reads as brain damage, permanent memory reads as cheating. The decay curve and the search pattern are where the tension lives.`,
      follow:`How long should the search last, and how would you tune it?`,
      red:`Clears the target the instant line of sight breaks.` },
    { q:`One guard sees the player. What should the others know, and when?`,
      a:`Decide it as a design dial, not a default. Instant global alert removes pacing control and makes stealth pointless. Propagate through plausible channels with delay: a shout with a radius, a radio for some agent types, a runner. Model the alert level as a shared value that rises and decays so the player can read and manipulate it.`,
      follow:`How does the player learn the propagation rules?`,
      red:`Writes to a global alert flag every agent reads immediately.` }
  ],
  senior:[
    { q:`Sixty agents and perception is four milliseconds over budget. What do you cut first?`,
      a:`Cadence before fidelity. Stagger checks across frames with randomised phases, drop distant and irrelevant agents to a cheap check, and switch from polling to event wake-ups for sound and damage. Replace per-frame raycasts with a coarse visibility test then confirm only for agents that could plausibly see. Measure after each step rather than doing all four.`,
      follow:`Reaction times now feel sluggish. How do you get them back without the cost?`,
      red:`Reduces agent counts or cuts vision range without profiling what actually costs the time.` },
    { q:`How do you playtest the fairness of knowledge specifically?`,
      a:`After each detection, ask the tester whether the enemy should have seen them there, and track the disagreement rate as a number across sessions. Ask them to describe how they were spotted. Watch whether they successfully hide, re-hide and exploit line of sight deliberately. Deliberate exploitation working is the evidence that perception reads as a system.`,
      follow:`The disagreement rate is high but only for one agent type. What does that suggest?`,
      red:`Asks whether the stealth felt fair as a general question at the end of the session.` }
  ] });

T('navigation-and-pathfinding',{ d:'gameai', t:'Navigation and pathfinding', tag:'Getting an agent from A to B: grids, navmesh, path following, steering and avoidance, at a cost the frame can afford.',
  what:`How agents move through the space: representing the walkable world (grid, navmesh, waypoints), finding a route (A* and its variants, flow fields), following it with movement (path following, steering), and not colliding (local avoidance, crowd simulation). Good navigation is invisible. Bad navigation is the most visible AI failure there is, because players see it directly.`,
  why:[`A perfect decision system is worthless if the agent gets stuck on a doorframe. Pathfinding failures are read as stupidity by players.`,`Navigation is level-geometry-dependent: a navmesh is only as good as the level's authored walkability, so level design and AI are one workflow.`,`Cost scales with agents and world size. Naive pathfinding every frame is a classic frame-rate killer.`,`Movement quality (acceleration, turning, avoidance) carries as much character as the decision does.`],
  think:{ q:[`When is walkability baked (static) versus dynamic (doors, destruction, moving platforms)?`,`Do agents need to path every frame, or only when their destination changes?`,`Do agents need to coordinate in a crowd, or is local avoidance enough?`,`How does the level's authored geometry help or betray the navigation system?`,`What does "stuck" look like, and how will we detect and recover from it?`],
    trade:[`Grids: simple, uniform, cheap to query, memory-heavy for large worlds and unnatural for varied terrain.`,`Navmesh: efficient and terrain-agnostic, standard for 3D, requires a bake, awkward with heavy dynamic change.`,`A* per agent: exact routes and simple to reason about, expensive at scale. Flow fields: one computation serves many agents heading to the same goal, poor for many different destinations.`],
    traps:[`Pathfinding to the player's exact position every frame, melting the frame budget.`,`Navmesh that does not match the geometry the player sees, so agents walk through or beside obstacles.`,`Ignoring local avoidance, so squads stack into one point like a single actor.`,`No stuck detection or recovery, so one agent blocks a corridor forever.`],
    good:[`Agents reach players from anywhere without the player noticing the plumbing.`,`Groups move and separate plausibly, and doors, corners and chokepoints are handled.`],
    bad:[`"They keep running into walls."`,`Agents clump into one body, or freeze when the player jumps somewhere the navmesh does not cover.`] },
  how:[`Bake a navigation representation from the same geometry players see. Treat unwalkable holes as bugs like any visual hole.`,`Find routes only when the destination changes, cache paths, and repath on a cadence or on obstruction.`,`Separate planning (where) from motion (how): path following plus steering/avoidance for local movement.`,`Add stuck detection with a recovery (sidestep, repath, teleport as a last resort) and log stuck events in playtests.`,`Budget by counting agents and query frequency. Batch and time-slice pathfinding, and test at the maximum agent count.`],
  tech:[
    {n:'Grid + A*', how:'Walkability as a uniform grid. A* searches cells with a heuristic to the goal. Returns a cell path.', fit:'2D, tile-based, or modest 3D worlds. Games where a uniform grid matches the space.', cost:'Memory for large worlds. Paths can look angular. Diagonal and cost tuning needed.', alt:'Navmesh for organic 3D terrain. Flow fields when many agents share a goal.'},
    {n:'Navmesh + A* + path following', how:'Walkable surface as polygons. A* (often funnel algorithm to string it) produces a smooth corridor the agent follows.', fit:'Default for 3D games with hand-authored levels and varied terrain.', cost:'Bake step on geometry changes. Awkward with destruction/moving surfaces. Needs off-mesh links for jumps/climbs.', alt:'Add dynamic obstacles as local avoidance rather than re-baking.'},
    {n:'Flow field / Dijkstra field', how:'Precompute, per goal, a direction for every cell so any agent heading there just follows the gradient.', fit:'Many agents sharing one or few goals: tower defense, RTS crowds, horde enemies.', cost:'One field per distinct goal. Multiple goals multiply memory/compute. Coarse directions.', alt:'A*/navmesh when goals are many and varied.'},
    {n:'Steering and local avoidance (boids, RVO/ORCA)', how:'Local forces (seek, separate, align, avoidance of nearby agents/obstacles) shape movement without global pathing.', fit:'Crowds, flocks, and the local layer on top of any path. Making groups look alive.', cost:'Can oscillate or trap agents. Parameter tuning is finicky. No guarantee of arrival.', alt:'Combine with a global path: global decides route, steering executes and avoids.'},
    {n:'Hierarchical / coarse-to-fine pathfinding', how:'Plan at a coarse level (regions, portals) then refine within a region, or use waypoint graphs over navmesh.', fit:'Large open worlds where whole-map A* is too expensive.', cost:'More machinery and potential inconsistency between levels of the hierarchy.', alt:'Start with navmesh + A* and add hierarchy only when the map or agent count demands it.'}
  ],
  ai:{ yes:[`Generate navmesh bake settings and flag likely pitfalls for a described level.`,`Explain and compare grid, navmesh, flow field and steering choices for a given agent count and destination pattern.`,`Review a navigation plan for stuck cases, dynamic geometry and worst-case agent counts.`,`Draft stuck-detection and recovery strategies with their side effects.`],
       no:[`Decide movement feel (snappy vs weighty). That is a presentation and game-feel decision.`,`Certify navigation "works" without testing at maximum agent count and on the real geometry.`] },
  prompts:[{l:'Navigation plan review',p:`World: [2D/3D, size, dynamic elements]. Agent count and destination pattern: [E.G. 40 horde agents to one goal vs 8 enemies to varied points]. Target platform/performance budget: [BUDGET]. Our current plan: [PLAN]. Identify the scaling bottleneck, the dynamic-geometry failure cases, and the stuck scenarios, then propose the cheapest representation and update cadence that meets the budget. Compare grid, navmesh, flow field and steering for this case. Do not write code.`}],
  verify:[`Does the navigation representation match the geometry the player sees?`,`Is worst-case agent count and path-query frequency addressed, or assumed?`,`Are stuck detection and recovery defined?`],
  test:[`Send agents to every reachable player position. Count wall-hugs, loops, freezes and clumps.`,`Stress test at the maximum simultaneous agent count in the densest level.`,`After a playtest, ask if players ever noticed the agents moving badly. If they did, where.`],
  rel:[['spatial-composition','Navigation is only as good as the authored walkable space.'],['level-structure','Levels must expose routes the AI can read and use.'],['ai-budgets-and-debugging','Pathfinding is a classic budget and observability problem.'],['controls-and-friction','Player movement and AI movement share the same spaces.'],['encounter-design','Encounter readability depends on agents arriving sensibly.']] });
ENGINE('navigation-and-pathfinding',{
  godot:{ term:`A NavigationRegion3D bakes the walkable surface from the level geometry and every agent carries a NavigationAgent3D that turns a target_position into the next point to steer at. The search itself happens on the NavigationServer, off your frame.`,
    api:['NavigationRegion3D with a baked NavigationMesh','NavigationAgent3D.target_position / get_next_path_position()','NavigationAgent3D.set_velocity() and the velocity_computed signal','NavigationAgent3D.avoidance_enabled / radius','NavigationServer3D.map_get_closest_point()','navigation_finished and target_reached signals'],
    snippet:`@onready var nav: NavigationAgent3D = $NavigationAgent3D

func _ready() -> void:
\tnav.velocity_computed.connect(_on_safe_velocity)

func _physics_process(_delta: float) -> void:
\tif nav.is_navigation_finished(): return
\tvar next := nav.get_next_path_position()
\tnav.set_velocity((next - global_position).normalized() * speed)

func _on_safe_velocity(safe: Vector3) -> void:
\tvelocity = safe                # avoidance answered, now move
\tmove_and_slide()`,
    pitfall:`Ticking avoidance_enabled on and then writing velocity yourself anyway. With avoidance on, your wanted velocity has to go through set_velocity and come back on velocity_computed, and skipping that means the avoidance step never runs at all. Eight enemies converge on one doorway and stack into a single body while the checkbox says they are avoiding each other. The same shape of bug catches a path requested in _ready: the navigation map synchronises at the end of a physics frame, so the first query returns the agent's own position.`,
    map:`A NavigationAgent3D is Unity's NavMeshAgent, a NavigationRegion3D is a NavMeshSurface, and map_get_closest_point is NavMesh.SamplePosition.` },
  unity:{ term:`A NavMeshSurface from the AI Navigation package bakes the mesh and a NavMeshAgent both plans and moves. SetDestination starts a path and the agent writes the transform every frame, until you take that job back with updatePosition.`,
    api:['NavMeshSurface.BuildNavMesh() (com.unity.ai.navigation)','NavMeshAgent.SetDestination(), which returns a bool','NavMeshAgent.pathStatus / remainingDistance','NavMesh.SamplePosition() + NavMeshAgent.Warp()','NavMeshAgent.updatePosition / nextPosition','NavMeshObstacle carving'],
    snippet:`[SerializeField] NavMeshAgent agent;
Vector3 lastGoal;

void Start() {                                  // spawned a hair off the mesh?
    if (NavMesh.SamplePosition(transform.position, out var hit, 2f,
                               NavMesh.AllAreas))
        agent.Warp(hit.position);
}

void Repath(Vector3 goal) {
    if ((goal - lastGoal).sqrMagnitude < 1f) return;    // not every frame
    lastGoal = goal;
    if (!agent.SetDestination(goal))                    // false: no path started
        Debug.LogWarning("agent is off the navmesh", this);
}`,
    pitfall:`Ignoring what SetDestination hands back. It returns a bool, and when the agent is not on the mesh, spawned a few centimetres above the floor or standing in a hole the bake left under a prop, it returns false, logs nothing, and the agent stands still. The bug reads as stupid AI and is a bake problem. Sample and Warp on spawn, check the return, and look at pathStatus for PathPartial before blaming the behaviour tree.`,
    map:`Unity's NavMeshAgent is Godot's NavigationAgent3D, a NavMeshSurface is a NavigationRegion3D, and agent.Warp is assigning global_position with a fresh target_position.` } });
INTERVIEW('navigation-and-pathfinding',{
  junior:[
    { q:`Navmesh, grid or waypoints: how do you choose?`,
      a:`Navmesh is the default for 3D with hand-authored varied terrain, because it is efficient and terrain-agnostic, at the cost of a bake. A grid suits 2D and tile-based worlds where a uniform cell matches the space. Waypoints are cheap and constrain agents to authored routes. Choose by the world's shape and how much of it changes at runtime.`,
      follow:`Your world has destructible walls. Which of those survives that?`,
      red:`Names the technique their engine defaults to with no reasoning about the world.` },
    { q:`What is the difference between pathfinding and steering?`,
      a:`Pathfinding decides the route through the walkable representation. Steering executes it: acceleration, turning, local avoidance of other agents and obstacles. Keeping them separate means you can fix movement feel without touching route planning, and it is why an agent can have a correct path and still look terrible.`,
      follow:`Which of the two carries more of the agent's character?`,
      red:`Treats them as one system, or thinks a good path guarantees good movement.` },
    { q:`Agents clump into one point when they chase the player. Cause?`,
      a:`No local avoidance, so every agent is steering toward the same destination with nothing separating them. Add avoidance between agents, offset the destinations around the target rather than sharing one point, and give attackers slots so only some approach while others hold. The clump is a design failure as much as a technical one.`,
      follow:`How many should be allowed to engage at once, and who decides?`,
      red:`Proposes making agents pass through each other.` }
  ],
  mid:[
    { q:`Your agents path to the player's exact position every frame. What goes wrong?`,
      a:`The frame budget dies as agent count rises, and the movement looks nervous because the route keeps changing. Repath when the destination moves meaningfully, on a cadence, or on obstruction. Cache the path and follow it with steering in between. Budget by counting agents multiplied by query frequency, then test at the worst case.`,
      follow:`The player is fast and the agent now lags behind the real position. How do you fix that without repathing?`,
      red:`Reduces the number of agents rather than the query frequency.` },
    { q:`Destructible walls, doors and moving platforms. How does the plan change?`,
      a:`Separate what is baked from what is dynamic. Keep the bake for static geometry, handle moving and destructible elements as dynamic obstacles that carve or block locally, and use off-mesh links for jumps and climbs. Re-baking at runtime is usually too expensive, so the dynamic layer is where the work goes. Test every combination of open and closed.`,
      follow:`A door closes while an agent is mid-path through it. What happens?`,
      red:`Plans to rebake the navmesh whenever geometry changes.` },
    { q:`Design stuck detection and recovery.`,
      a:`Detect by comparing intended progress along the path against actual displacement over a window, not by velocity alone. Recover in escalating steps: sidestep, repath, pick a nearby valid point, then teleport out of sight as a last resort. Log every stuck event with position and state so playtests produce a map of the level's bad spots.`,
      follow:`Teleport recovery is firing in view of the player. What do you change?`,
      red:`Handles stuck agents by destroying and respawning them, with no logging.` }
  ],
  senior:[
    { q:`Two hundred agents heading to one goal on a mobile target. Approach?`,
      a:`One shared flow field to the goal so no agent runs its own search, with local steering and avoidance on top. Coarse directions are fine because the crowd reads as a mass. Keep per-agent A star for the few agents with distinct destinations. Budget the field rebuild cost against how often the goal moves.`,
      follow:`Now there are five goals. At what point does the approach stop working?`,
      red:`Scales per-agent A star and proposes to optimise it later.` },
    { q:`Navigation bugs come from playtests and never reproduce in the editor. What do you build?`,
      a:`Logging that captures the agent's path, position, state and target at the moment of failure, with a seed so the situation can be replayed. An overlay for paths, navmesh coverage and stuck events. Then aggregate stuck positions across sessions into a heat map, because the same doorframe usually produces most of the reports.`,
      follow:`The heat map points at one corridor in a finished level. Who fixes it and how?`,
      red:`Asks testers for better repro steps and waits.` }
  ] });

T('readable-and-fair-ai',{ d:'gameai', t:'Readable and fair AI', tag:'Telegraph intent, keep promises, do not cheat invisibly: the player must be able to explain every loss.',
  what:`The set of design rules that make AI feel fair and legible: telegraphing actions before they land, committing so the player can react, showing tells for states, respecting the same rules the player obeys (or revealing the cheats), and matching difficulty to the player's ability. Fairness is not symmetry. It is explainability. A hard fight is fair if the player can say why they lost and what they would do differently.`,
  why:[`Almost every "unfair" complaint is really an unreadable or unexplained outcome. The fix is usually a tell, not a difficulty cut.`,`Readability is what makes counterplay possible. Without it, the player's skill cannot express itself and the fight becomes a cutscene.`,`Players forgive a hard AI and resent an opaque one. Trust, once broken by an invisible cheat, is hard to rebuild.`,`This is the cross-cutting success criterion for the whole domain. It is where AI becomes game design.`],
  think:{ q:[`Can the player see the attack coming and act on it? What is the wind-up and its tell?`,`If the AI takes an unfair shortcut, is it hidden, revealed, or compensated?`,`Does a loss point to something the player should have done differently?`,`Are two agents distinguishable at a glance by their tells and tempo?`,`Is difficulty being tuned by making AI smarter, or fairer and more readable first?`],
    trade:[`Hard, fast, untelegraphed AI is thrilling for experts and infuriating for everyone else. Long telegraphs are fair but can feel sluggish.`,`Revealing cheats preserves trust but breaks immersion. Hiding them preserves immersion but risks the moment they are noticed.`,`Reactive AI that always responds feels alive. Delayed reactions read as fair and human but can feel unresponsive if overdone.`],
    traps:[`Fixing "too hard" by lowering numbers when the real issue is an unreadable attack.`,`Invisible aim assist or tracking that experts detect on replay, destroying trust.`,`Same tell for different attacks, so the player cannot choose the right response.`,`Difficulty scaling that raises AI speed and perception instead of the fairness of the challenge.`],
    good:[`Players explain their deaths in terms of a decision they made.`,`Experts can exploit tells deliberately and feel their skill matter.`],
    bad:[`"That was cheap."`,`Players cannot tell a boss phase from a bug, or two enemies from each other.`] },
  how:[`For every important agent action, define a wind-up, a clear tell and a window the player can act in. Tune the window separately from the damage.`,`Commit the agent once it starts a big action so the player can read and punish it. Avoid instant retargeting mid-swing.`,`List every place the AI breaks the player's rules (knows the hidden player, ignores cooldowns, sees off-screen). Decide per case: remove it, reveal it, or compensate for it.`,`Distinguish agents by tell and tempo, not just health and color.`,`Test fairness by asking testers why they lost and what they would change. Treat "not sure" as a readability failure.`],
  tech:[
    {n:'Telegraphing and commitment', how:'Wind-up animation, audio cue and pose before an action. The agent commits for the duration so the action is punishable.', fit:'Any action the player must react to: attacks, grabs, charges, boss abilities.', cost:'Long wind-ups slow combat. Too many simultaneous tells overload attention.', alt:'Vary tell length by danger. Reserve the longest for one-shot threats.'},
    {n:'Reading the same rulebook (or declaring the cheat)', how:'The agent obeys the same cooldowns, ammo, resource and knowledge rules as the player. Any exception is justified in-fiction or revealed.', fit:'Competitive, tactical and systemic games where fair play is the contract.', cost:'Constrains the AI and may need extra systems to let it act within limits.', alt:'Explicit "asymmetric AI" designs that reveal and theme the advantages.'},
    {n:'Dynamic difficulty, done fairly', how:'Adjust pressure by changing frequency/aggression and support, not hidden powers. Ease the player near failure in ways they could notice without feeling robbed.', fit:'Wide audiences, single-player, or tense sequences where a wall is likely.', cost:'If noticeable, it insults skilled players. If invisible, it can feel dishonest when caught.', alt:'Prefer explicit difficulty options and readability over hidden adjustment. See the adaptive-AI topic.'},
    {n:'Determinism and fairness in replays', how:'Make behaviour reproducible so it can be reviewed, and keep cheats out of any recorded/replayed match.', fit:'Anything with replays, spectating, esports, or bug reports from video.', cost:'Determinism constrains random tuning and threading. Replays expose every lie.', alt:'Separate cosmetic randomness from decision randomness.'}
  ],
  ai:{ yes:[`Generate tells (pose, audio, color, timing) for a described attack and the counterplay each invites.`,`List the ways a described AI setup can feel unfair and rank them by noticeability.`,`Rewrite "too hard" complaints into their underlying readability or knowledge problems.`,`Design a fair, noticeable-but-not-insulting difficulty adjustment with the signals it reacts to.`],
       no:[`Decide the intended difficulty or fantasy of challenge. That is an experience decision.`,`Declare a fight fair. Fairness is measured by players explaining their losses.`] },
  prompts:[{l:'Fairness audit',p:`Here is an agent's attacks, tells, knowledge and any cheats: [DETAIL]. For each, state whether the player can read it, react to it, and explain the resulting outcome. List every place the agent breaks the rules the player follows, the situation where the player would notice, and choose for each: remove, reveal, or compensate. Propose the smallest readability change (tell/wind-up) before any numbers change.`}],
  verify:[`Can each loss be traced to a readable decision?`,`Are cheats listed explicitly with their detection risk?`,`Does "difficulty" come from smarter, fairer behaviour rather than hidden advantage?`],
  test:[`After play, ask "why did you lose, and what would you do differently?" Score the answer.`,`Can players name the tell and the best response for each major attack?`,`Do experts and novices both rate the fight fair, for different reasons?`],
  rel:[['challenge-failure-recovery','Fairness is about readable, recoverable failure.'],['feedback-and-affordance','Tells are feedback. Readability is affordance.'],['difficulty','Difficulty is tuned through readable behaviour, not hidden power.'],['ingame-ai-purpose','The goal is a believable, beatable opponent, not an optimal one.'],['learning-from-success','Fair, readable AI patterns recur across celebrated games.']] });
ENGINE('readable-and-fair-ai',{
  godot:{ term:`The wind-up is an AnimationPlayer clip and its length is the reaction window. The hitbox is an Area3D that stays off until the sequence opens it, so tuning fairness means editing an animation rather than a damage number.`,
    api:['AnimationPlayer.play() / animation_finished','AnimationPlayer.get_animation(name).length','Area3D.monitoring via set_deferred()','CollisionShape3D.disabled via set_deferred()','Area3D.area_entered','get_tree().create_timer().timeout'],
    snippet:`func attack() -> void:
\tanim.play("swing_windup")                  # 0.55s the player can read
\tawait anim.animation_finished
\t_hitbox.set_deferred("monitoring", true)   # never flip this inside a callback
\tanim.play("swing_strike")
\tawait get_tree().create_timer(0.12).timeout
\t_hitbox.set_deferred("monitoring", false)
\tanim.play("swing_recover")                 # committed: the punish window

func _on_hitbox_area_entered(a: Area3D) -> void:
\tif a.is_in_group("player_hurtbox"):
\t\ta.owner.take_hit(damage, global_position)`,
    pitfall:`Flipping Area3D.monitoring or CollisionShape3D.disabled straight from a physics callback or from a body_entered handler. Godot is flushing queries at that moment and refuses the change, so the hitbox that should have opened stays shut and the attack whiffs at random, which testers report as a cheap enemy rather than as a bug. Use set_deferred, and keep the active window wide enough that one frame of delay cannot decide the hit.`,
    map:`Godot's await on animation_finished is a coroutine over an Animator state, and an Area3D hitbox is a trigger Collider.` },
  unity:{ term:`The wind-up is an Animator state and its length is the window. Drive the hitbox from code against your own timing rather than from an AnimationEvent, because the window is the thing the player is reading and it has to survive an interrupt.`,
    api:['Animator.CrossFade() / GetCurrentAnimatorStateInfo(0)','AnimatorStateInfo.normalizedTime / IsName()','Collider.enabled on the hitbox','Animator.speed','StateMachineBehaviour.OnStateExit()','WaitForSeconds in a coroutine'],
    snippet:`IEnumerator Swing() {
    animator.CrossFade("SwingWindup", 0.05f);        // 0.55s the player can read
    yield return new WaitForSeconds(windup);
    hitbox.enabled = true;                           // opened and closed here,
    yield return new WaitForSeconds(activeWindow);   // not by an AnimationEvent
    hitbox.enabled = false;
    animator.CrossFade("SwingRecover", 0.05f);
}

void OnDisable() {
    StopAllCoroutines();
    hitbox.enabled = false;     // an interrupt must never leave the window open
}`,
    pitfall:`Opening the hitbox from an AnimationEvent on the wind-up clip. Events belong to the clip, so a transition that interrupts the state, a blend that never reaches that normalized time, or a raised Animator.speed all skip the event, and the matching close event is skipped with it. The attack sometimes does nothing and sometimes leaves a live hitbox on a staggered enemy. Own the window in code and close it in OnDisable.`,
    map:`Unity's AnimationEvent is Godot's call method track, and a coroutine window is an await on create_timer.` } });
INTERVIEW('readable-and-fair-ai',{
  junior:[
    { q:`What makes a fight fair?`,
      a:`Explainability, not symmetry. A hard fight is fair if the player can say why they lost and what they would do differently. That requires readable actions, a window to respond, and outcomes that trace to the player's decisions. Fairness is a design property you can test by asking players to explain their deaths.`,
      follow:`An agent cheats but every loss is still explainable. Is that fair?`,
      red:`Defines fairness as the AI following the same rules and stops there.` },
    { q:`What is a telegraph, and what makes a bad one?`,
      a:`A wind-up that shows the action before it lands: pose, audio, timing. Bad ones are too short to react to, shared between attacks that need different responses, hidden behind effects or other agents, or not matched by a commitment so the agent can cancel and retarget mid-swing. Tune the window separately from the damage.`,
      follow:`How do you decide the length of a wind-up?`,
      red:`Treats the telegraph as a visual effect rather than a reaction window.` },
    { q:`Two enemies use the same wind-up. Why is that a bug?`,
      a:`Because the player cannot choose the right response, so the correct play becomes a guess and skill stops expressing. Distinguish agents by tell and tempo before distinguishing them by health and colour. If two agents must share an animation, separate them by audio cue and timing.`,
      follow:`Your art budget allows one new animation. Which agent gets it?`,
      red:`Sees it as an art reuse decision with no gameplay consequence.` }
  ],
  mid:[
    { q:`Feedback says the game is too hard. What is the first thing you change?`,
      a:`Not the numbers. Check readability first: can players name the tell and the best response for each major attack, and can they explain their deaths. Most too-hard complaints are unreadable attacks or knowledge the agent should not have had. Lowering damage hides that and makes the fight boring rather than fair.`,
      follow:`Readability is fine and it is still too hard. Now what?`,
      red:`Reduces enemy health and damage as the default response.` },
    { q:`Your AI cheats. Walk me through a real case and the decision.`,
      a:`List every place it breaks the rules the player follows: knowing a hidden position, ignoring a cooldown, perfect tracking, spawning behind. For each, decide remove, reveal or compensate. Removal is cleanest, revealing keeps trust and costs some immersion, compensating means adjusting elsewhere so the advantage does not read. Judge by how likely a player is to notice.`,
      follow:`Which cheats survive contact with a replay or a streamer?`,
      red:`Says all cheating is unacceptable, or defends hidden advantages because players never notice.` },
    { q:`How do you distinguish two enemies without changing their numbers?`,
      a:`Tempo, tell and commitment. One telegraphs long and punishes badly, the other is fast and cheap to punish. Different approach behaviour, different sound, different spacing. That is what actually changes the player's decision, whereas a health bar difference only changes how long the same decision repeats.`,
      follow:`Your two agents now feel distinct in isolation and identical in a group fight. Why?`,
      red:`Retextures and rescales the same behaviour and calls it a new enemy.` }
  ],
  senior:[
    { q:`Streamers found the hidden aim assist on your enemies. Handle it.`,
      a:`Assume it is now common knowledge and decide fast. Either reveal and theme it, or remove it and rebalance the difficulty with readable means such as frequency and composition. Do not deny it. Trust broken by a discovered lie is far more expensive than a difficulty pass, and the community will test every other system next.`,
      follow:`What would you have done differently when the assist was first added?`,
      red:`Plans a quiet patch that reduces it without acknowledging anything.` },
    { q:`How do you measure fairness in a playtest?`,
      a:`Ask after each loss why they lost and what they would do differently, and score the answers as specific, vague or blaming the game. Track the proportion over sessions. Ask players to name the tell and best response per attack. Compare experts and novices: both should rate it fair, for different reasons.`,
      follow:`Novices rate it fair and experts do not. What does that tell you?`,
      red:`Uses a survey question about whether the game felt fair and reports the average.` }
  ] });

T('adaptive-and-director-ai', { d:'gameai', t:'Adaptive AI and directors', tag:'AI that watches the session and shapes pacing, difficulty or events, without the player feeling manipulated.',
  what:`AI that reasons over the session rather than a single agent: dynamic difficulty adjustment (DDA) that tunes challenge to the player, rubber-banding in racing and sports, and directors that decide pacing, spawns, music or tension. A director is an authoring tool for structure. It trades some determinism for a better-curated experience.`,
  why:[`Players arrive at wildly different skill levels. Adaptive systems are one answer (explicit difficulty options are another).`,`Pacing directors solve a real problem: the designer cannot foresee every player's tempo, so something must decide when to add pressure or relief.`,`Famously effective when invisible (Left 4 Dead's director. Rubber-banding in racers) and famously hated when caught (feeling cheated in a race, or a game "going easy").`,`It is easy to over-build: simple, well-tuned players are often better than a grand adaptive scheme.`],
  think:{ q:[`What signal should it react to: deaths, accuracy, time, health, engagement, repetition?`,`Should the player ever be able to notice the adjustment? If so, how is it framed?`,`Is the goal to hold a difficulty band, or to shape an emotional rhythm (tension, relief, surprise)?`,`What must stay deterministic so fairness or competitive integrity survives?`,`What is the cheapest rule that would produce the intended effect?`],
    trade:[`Holding a tight difficulty band keeps everyone engaged but can feel like the game plays itself. A wide band allows genuine failure and mastery but loses some players.`,`Directors create memorable, well-paced sessions but reduce player agency and predictability, and are hard to test because they adapt.`,`Rubber-banding keeps races close but punishes skill if too strong. Its absence punishes the loser.`],
    traps:[`Hiding a strong adjustment that experts notice, producing "the game let me win" or "it cheated me".`,`Reacting to noisy signals (one death, one lucky shot) so the system thrashes.`,`Building a director before the base encounter pacing is validated. It is a multiplier on a system that must already work.`,`Measuring the wrong signal: accuracy is not fun, and time-on-task is not engagement.`],
    good:[`Sessions show a controlled rhythm of tension and relief, and players feel it was "well-paced" or "close".`,`Difficulty feels personal without the player being able to point at the machine.`],
    bad:[`Players say "it went easy on me" or "it cheated to catch up".`,`The director thrashes: spikes and lulls unrelated to the player's actions.`] },
  how:[`Start from the experience: define the rhythm you want (tension curve, downtime, peaks) before any signal.`,`Choose the fewest, least-noisy signals that correlate with the intended state (e.g. deaths per encounter, accuracy trend, health at encounter end).`,`Design the response to be indirect and readable: change frequency, aggression, composition or support rather than hidden power.`,`Keep the system observable and tunable, with a debug overlay of its current inputs and output, so you can see it thrash.`,`Playtest both extremes: a very skilled player and a struggling one. Measure whether sessions converge in feel, not just in win rate.`],
  tech:[
    {n:'Rule-based DDA (thresholds)', how:'Simple if/then rules on a few signals (e.g. died 3 times -> reduce spawn rate, add health pickups).', fit:'Most single-player games. When you can name the exact behaviour to change.', cost:'Blunt, thresholds can flip-flop. Obvious if signals are noisy.', alt:'Smooth the signals and add hysteresis/debounce before adding complexity.'},
    {n:'Continuous adaptive tuning', how:'Map a performance estimate to continuous parameters (aggression, accuracy, spawn density) via curves.', fit:'Games that want a smooth difficulty band (action, racing, sports).', cost:'Hard to explain and to test. Can feel like rubber-banding if too strong or too fast.', alt:'Bound the rate of change and the range so it never feels like cheating.'},
    {n:'Pacing / drama director', how:'A meta-controller reads the session state and schedules beats: lulls, peaks, ambushes, rewards, music.', fit:'Pacing-driven games: shooters, horror, roguelikes wanting a rhythm, sports/racing commentary.', cost:'Reduces authored control. Hard to predict. Needs a debug view and lots of testing.', alt:'Author pacing with triggers first. Add a director only where authored pacing cannot react enough.'},
    {n:'Rubber-banding / catch-up', how:'Adjust speed, resources or item distribution based on the gap between players or between player and AI.', fit:'Racing and sports where close finishes are the entertainment.', cost:'Punishes skill if obvious. Hated when detected in competitive contexts.', alt:'Tune the catch-up floor and disclose it. Or use tiered matchmaking instead.'}
  ],
  ai:{ yes:[`Propose the fewest, least-noisy signals for a described experience goal, with reasoning.`,`Design indirect responses that change feel without hidden power, and their tuning bounds.`,`Write the debug overlay / telemetry that would reveal thrashing and how to read it.`,`Generate a test plan comparing a strong player and a struggling player.`],
       no:[`Decide whether to hide difficulty adjustment. That is an ethics and experience call.`,`Certify the system feels fair. Only players can report that.`] },
  prompts:[{l:'Director design',p:`Desired session rhythm: [E.G. "tension rising over 20 minutes with brief relief after each win"]. Available signals: [SIGNALS]. What must never be adjusted (determinism / competitive fairness): [CONSTRAINTS]. Propose the fewest legitimate signals, a rule-based first version, and how to make the adjustment indirect and readable. List where a player could notice it and whether that is acceptable, and design the debug overlay I would need. Do not write code.`}],
  verify:[`Is the adjustment indirect (frequency/composition/support) rather than hidden power?`,`Are signals smoothed and bounded so the system cannot thrash?`,`Is a debug view defined so thrashing is visible?`],
  test:[`Run a strong player and a struggling player. Do their sessions end at a similar felt challenge, at their different skill levels?`,`Ask returning players whether pacing felt right. Ask experts if the game ever "went easy".`,`Watch the debug overlay during a long session for spikes unrelated to player action.`],
  rel:[['difficulty','Adaptive AI is one implementation of difficulty calibration.'],['pacing','Directors exist to shape pacing and rhythm.'],['readable-and-fair-ai','Adjustment must stay fair and non-obvious.'],['iteration-and-evidence','Adaptive systems must be tuned against evidence, not vibes.'],['playtesting','Their whole point is to respond to player behavior, so testing is essential.']] });
ENGINE('adaptive-and-director-ai',{
  godot:{ term:`The director is an autoload that listens rather than polls. Gameplay emits signals into it, it keeps one tension value, and a Timer decides when the next beat is allowed. The response itself is a Resource, so the adjustment stays data.`,
    api:['Project Settings > Autoload for the director singleton','signal / Callable connections from the encounters','Timer.wait_time and timeout for the beat cadence','Curve resource with sample() for the response shape','RandomNumberGenerator with its own seed','Resource + @export for the weighted spawn table'],
    snippet:`extends Node                          # autoload "Director"
@export var pressure: Curve           # tuned in the editor, not in code
@export var table: Resource
var _rng := RandomNumberGenerator.new()   # its own stream, never global randi()
var tension := 0.0

func _ready() -> void:
\t_rng.seed = run_seed

func on_encounter_ended(deaths: int) -> void:
\ttension = clampf(tension + 0.25 - 0.4 * deaths, 0.0, 1.0)
\t$Beat.wait_time = lerpf(9.0, 3.0, pressure.sample(tension))

func _on_beat_timeout() -> void:
\tspawn(table.pick(_rng))       # frequency and composition, never hidden power`,
    pitfall:`Letting the director draw from the global randi() and randf(). Those share one generator with every other script in the project, so a particle burst or a footstep variation added three months later shifts the whole sequence, and a seeded replay of a "the director cheated me" report no longer reproduces the session. Give the director its own RandomNumberGenerator with its own seed and leave cosmetic randomness on the global one, where it cannot move a decision.`,
    map:`A Godot autoload director is a DontDestroyOnLoad component, and a Curve resource is an AnimationCurve.` },
  unity:{ term:`The director is one component with its tuning on a ScriptableObject, reacting to events the encounters raise. Response curves are AnimationCurves, and every adjustment lands on frequency, composition or support rather than on hidden power.`,
    api:['ScriptableObject tuning asset with [CreateAssetMenu]','AnimationCurve.Evaluate() for the response shape','C# events or UnityEvent raised by encounters','Time.time with a nextBeat stamp','System.Random instance for a reproducible stream','Instantiate(asset) for a runtime copy of the tuning'],
    snippet:`[CreateAssetMenu(menuName = "AI/Director Tuning")]
public class DirectorTuning : ScriptableObject {
    public AnimationCurve beatInterval;      // tension 0..1 -> seconds, tuned here
}

public class Director : MonoBehaviour {
    [SerializeField] DirectorTuning asset;
    DirectorTuning live;                     // runtime copy: Play mode edits stay
    float tension, nextBeat;
    void Awake() => live = Instantiate(asset);
    public void EncounterEnded(int deaths) {
        tension = Mathf.Clamp01(tension + 0.25f - 0.4f * deaths);
        nextBeat = Time.time + live.beatInterval.Evaluate(tension);
    }
}`,
    pitfall:`Tuning the director asset while Play mode is running. A ScriptableObject is an asset rather than a scene object, so unlike a component its runtime edits are written to disk and survive leaving Play mode. A curve nudged during one playtest quietly becomes the committed baseline nobody remembers changing, and the next session is compared against a line that moved. Tune in edit mode, or hold the live values in a copy made with Instantiate.`,
    map:`A Unity ScriptableObject tuning asset is a Godot Resource, and AnimationCurve.Evaluate is Curve.sample.` } });
INTERVIEW('adaptive-and-director-ai',{
  junior:[
    { q:`What is a director, and what problem does it solve?`,
      a:`A meta-controller that reads the session and schedules beats: spawns, lulls, ambushes, rewards, music. It exists because the designer cannot foresee every player's tempo, so something has to decide when to add pressure and when to give relief. It trades authored determinism for a better-paced session.`,
      follow:`What does a director cost you that authored pacing does not?`,
      red:`Describes it as difficulty scaling only, with no notion of pacing or rhythm.` },
    { q:`What is rubber-banding, and when is it hated?`,
      a:`Adjusting speed, resources or item distribution based on the gap between competitors so races stay close. It is hated when it is strong enough for a skilled player to feel their lead was taken, and in competitive contexts where the result is supposed to be earned. Its absence punishes the player who falls behind, so the tuning is the whole design.`,
      follow:`Where would you put the catch-up floor, and would you disclose it?`,
      red:`Treats it as always bad or always necessary, with no account of the audience.` }
  ],
  mid:[
    { q:`Which signals would you use, and which would you refuse?`,
      a:`Use few and low-noise: deaths per encounter, health at encounter end, a smoothed accuracy trend. Refuse single events, and refuse proxies that are not the thing you care about, such as time on task as a stand-in for engagement or accuracy as a stand-in for fun. Every signal needs smoothing and a bound on how fast it can move the output.`,
      follow:`How do you know a signal is too noisy before you ship it?`,
      red:`Reacts to one death, or lists a dozen inputs with no smoothing.` },
    { q:`The system thrashes: spikes and lulls unrelated to what the player did. Diagnose.`,
      a:`Noisy signals with no smoothing, thresholds with no hysteresis, and a response rate that outpaces the player's ability to perceive cause. Add debouncing, bound the rate of change and the range, and watch it on a debug overlay for a long session. Thrashing is usually a tuning failure rather than a design failure.`,
      follow:`After smoothing it responds too late to matter. How do you balance that?`,
      red:`Adds more inputs to the system to stabilise it.` },
    { q:`Should the player ever be able to notice the adjustment?`,
      a:`Decide it and be consistent. Invisible adjustment preserves immersion and risks feeling dishonest when caught. Visible adjustment can insult skilled players and is defensible if it is framed as a system the player engages with. Make the response indirect either way: change frequency, composition and support rather than hidden power.`,
      follow:`Your invisible system was discovered. Which of the two positions do you move to?`,
      red:`Hides a strong adjustment and assumes nobody will find out.` }
  ],
  senior:[
    { q:`Design the first version of a director for a horror game.`,
      a:`Start from the rhythm: build, peak, relief, rebuild, with lengthening gaps. Use the fewest signals, such as time since last threat and player health. Version one is threshold rules, not curves. Responses change spawn frequency, composition and audio rather than enemy power. Build the debug overlay in the same week so you can see it thrash.`,
      follow:`Playtesters say the pacing feels mechanical. What do you change first?`,
      red:`Starts with a complex adaptive model before the base encounter pacing is validated.` },
    { q:`How do you test a system that adapts?`,
      a:`Run the extremes deliberately: a strong player and a struggling one, and check that both sessions end at a similar felt challenge at their different skill levels. Watch the overlay across long sessions for spikes unrelated to player action. Ask experts whether the game ever went easy on them. Fixed seeds and scripted inputs give you a regression baseline.`,
      follow:`Two testers with identical skill get very different sessions. Bug or feature?`,
      red:`Tests with average players only and reports that it felt well paced.` },
    { q:`Competitive mode. What must stay deterministic?`,
      a:`Anything that decides the outcome: the rules, agent capabilities, spawn tables, drop rates and any catch-up mechanism. Adaptivity can stay in cosmetics, commentary and matchmaking. Write the constraint down before building, because it is much harder to remove adaptation from a shipped competitive system than to keep it out.`,
      follow:`The same content ships in both casual and competitive modes. How do you handle that?`,
      red:`Keeps the director on and assumes it is subtle enough not to matter.` }
  ] });

T('allies-and-companions', { d:'gameai', t:'Allies and companions', tag:'An ally that helps without playing the game for the player, and does not get stuck or steal the win.',
  what:`AI that fights alongside or supports the player: squadmates, pets, escorts, NPCs that path with you and act in combat or conversation. The hard part is not competence. It is restraint. An ally must be useful, legible, never stuck, and must not take the agency or the moment that belongs to the player.`,
  why:[`Allies are a promise about relationship and competence. A stuck or useless companion is one of the loudest immersion breaks there is.`,`Over-effective allies make the player a passenger ("my companion cleared the room"). Under-effective allies are dead weight the player must protect, which can become a chore.`,`Companions share the player's space and pace, so navigation and follow behaviour are under constant, visible scrutiny.`,`The ally is often the main carrier of relatedness (the player matters to someone), a core motivational need.`],
  think:{ q:[`What is the ally for: combat support, emotional relationship, tutorial, comic relief, another axis of play?`,`What must the ally leave to the player: the kill, the decision, the discovery?`,`How does the ally stay out of the player's way without freezing or teleporting visibly?`,`How is the ally's state and intent communicated: barks, markers, poses?`,`What is the failure mode: dead, stuck, lost, or making the player irrelevant?`],
    trade:[`Effective allies reduce difficulty and can trivialize encounters. Weak allies become a babysitting chore.`,`Follow AI that teleports to the player avoids stuck states but breaks immersion. Strict pathing preserves immersion but fails on awkward geometry.`,`Active, talkative allies build relationship but risk repetition and annoyance. Quiet allies are unobtrusive but forgettable.`],
    traps:[`Judging the companion by raw power instead of by the player's sense of contribution.`,`No stuck recovery, so the ally is left behind and the player must backtrack.`,`Barks without cooldown or variety, turning a character into a noise source.`,`Allies that solve puzzles or choose for the player, taking agency.`],
    good:[`Players credit the ally as a companion and still feel the victory was theirs.`,`The ally keeps up, contributes visibly in fights, and never blocks a doorway.`],
    bad:[`"My companion did everything." Or "it got stuck and I had to go back."`,`Players mute the ally.`] },
  how:[`Write the ally's contribution as a fraction of the player's agency: what it may do, and what it must leave to the player.`,`Design follow and combat behaviour around never-stuck and never-blocking: teleport recovery as a last resort, leash limits, and door handling.`,`Add state and intent communication with cooldowns and variety. Give the player commands if the relationship supports it.`,`Tune effectiveness against a solo baseline: measure win rate and the player's felt contribution, not just the ally's damage.`,`Playtest the chores: escort, tight corridors, split attention, and a player who ignores the ally entirely.`],
  tech:[
    {n:'Follow / formation AI', how:'Maintain a target offset behind or beside the player using steering, with catch-up speed, teleport fallback and doorway handling.', fit:'Almost every companion. The baseline that keeps the ally present.', cost:'Tight spaces and player backtracking break naive following. Teleport fallback visible if overused.', alt:'Leash + staggered formation + last-resort teleport beats constant pathfinding toys.'},
    {n:'Contribution limiting', how:'Ally targeting, damage and utility are biased toward setup and support (stagger, heal, revive, area control) rather than the finishing blow or the key decision.', fit:'Any ally where the player must feel ownership of the win.', cost:'Can make the ally feel weak or dumb without clear feedback that it helped.', alt:'Make contribution highly visible (setup, saves) even when numerically modest.'},
    {n:'Barks and communication', how:'Cue-driven lines and animations for state, targets and outcomes, with cooldowns, priority and variety.', fit:'Building relationship and readability for the ally\'s actions.', cost:'Repetition, fails when lines are context-blind. Localization and audio cost.', alt:'Small, high-frequency cues plus a few rare, high-impact lines.'},
    {n:'Command and control', how:'Player-issued commands (hold, attack, follow) with acknowledgements and graceful refusal.', fit:'When the player should steer the relationship and tactics. Adds a control axis.', cost:'More UI, more states, a new menu. Can fight immersion in action contexts.', alt:'Optional and contextual commands. Keep the default autonomous mode excellent.'}
  ],
  ai:{ yes:[`Design a contribution budget for an ally so the player keeps ownership of outcomes.`,`Write bark sets and cue rules for the ally's states with cooldowns and priorities.`,`List stuck/blocked cases in a described level and the recovery for each.`,`Turn a solo encounter baseline into a paired encounter plan that keeps the player central.`],
       no:[`Decide the relationship or the fantasy of the ally. That is authorship.`,`Certify the ally "feels helpful". Only players can report contribution.`] },
  prompts:[{l:'Ally contribution and follow spec',p:`Ally role: [ROLE]. Player fantasy and what must remain the player's: [AGENCY]. Level types: [TIGHT CORRIDORS, OPEN, VERTICAL]. Propose a follow behaviour with stuck/blocking recovery, a contribution budget that keeps the player central, and the communication cues (states, cooldowns, priorities). Then list the playtests that would catch a passenger player and a babysitting chore.`}],
  verify:[`Does the ally leave the decisive choices and kills to the player?`,`Are stuck, blocking and teleport-fallback cases handled?`,`Are barks cued and rate-limited, not spammy?`],
  test:[`After a paired session, ask "who won that fight, and why?" Listen for "the companion" vs a shared story.`,`Escort test through tight geometry. Count backtracking and blocked doors.`,`Solo-vs-paired win rate and felt difficulty.`],
  rel:[['social-experience','Companions are the main carrier of relatedness in single-player.'],['navigation-and-pathfinding','Follow behaviour lives or dies on navigation.'],['readable-and-fair-ai','The ally must be legible and never cheat the player of a moment.'],['ux-as-design','Commands and state feedback are UX problems.'],['onboarding','An ally is often a diegetic tutorial.'],['premise-and-world','Companions carry character and emergent narrative.']] });
ENGINE('allies-and-companions',{
  godot:{ term:`The companion is a CharacterBody3D with its own NavigationAgent3D, pathing to a slot behind the player rather than to the player. Barks are an AudioStreamPlayer3D gated by a Timer, and the leash plus a recovery teleport is what keeps it out of the player's way.`,
    api:['NavigationAgent3D.target_position with a follow offset','NavigationAgent3D.target_desired_distance','NavigationServer3D.map_get_closest_point() for recovery','CollisionObject3D.set_collision_mask_value()','Timer for the bark cooldown','AudioStreamPlayer3D.play() / finished'],
    snippet:`func _physics_process(_delta: float) -> void:
\tvar slot := player.global_position + player.global_transform.basis.z * 1.8
\tnav.target_position = slot
\tif global_position.distance_to(player.global_position) > leash:
\t\tvar map := get_world_3d().navigation_map    # last resort, off camera only
\t\tglobal_position = NavigationServer3D.map_get_closest_point(map, slot)
\t\treturn
\tvar next := nav.get_next_path_position()
\tvelocity = (next - global_position).normalized() * speed
\tmove_and_slide()`,
    pitfall:`Leaving the companion on the same collision layer and mask as the player. Two CharacterBody3D bodies are both kinematic, so neither can push the other, and an ally standing in a doorway is a wall the player cannot walk through and cannot shove. Clear the player's bit on the ally's mask with set_collision_mask_value, keep the ally solid to enemies, and add a leash with an off camera recovery rather than hoping the path never traps it.`,
    map:`Godot's collision layer and mask pair is Unity's layer plus the Layer Collision Matrix, and map_get_closest_point is NavMesh.SamplePosition.` },
  unity:{ term:`A companion is a NavMeshAgent chasing a slot transform parented to the player, with its avoidance priority set so it yields instead of arguing. Warp is the recovery, and barks come from an AudioSource with a cooldown you own.`,
    api:['NavMeshAgent.avoidancePriority','NavMeshAgent.stoppingDistance / autoBraking','NavMesh.SamplePosition() + NavMeshAgent.Warp()','NavMeshAgent.obstacleAvoidanceType','AudioSource.PlayOneShot() behind a cooldown','Animator.SetFloat() for the follow gait'],
    snippet:`void Awake() {
    agent.avoidancePriority = 60;      // a HIGHER number yields to the player's 40
    agent.stoppingDistance = 1.6f;
}

void Update() {
    agent.SetDestination(followSlot.position);
    if (Vector3.Distance(transform.position, player.position) > leash &&
        NavMesh.SamplePosition(followSlot.position, out var hit, 3f,
                               NavMesh.AllAreas))
        agent.Warp(hit.position);      // last resort, and only off camera
    animator.SetFloat("Speed", agent.velocity.magnitude);
}`,
    pitfall:`Reading avoidancePriority the way it is spelled. A lower number means a higher priority and an agent largely ignores agents numbered above it, so leaving every follower on the default 50 makes the companion and the other allies treat each other as immovable and deadlock in a corridor. The matching mistake is moving the companion with transform.position instead of Warp, which leaves the agent's internal position behind and sends it walking back to where it thinks it is.`,
    map:`Unity's avoidancePriority is Godot's NavigationAgent3D avoidance_priority inverted, and Warp is assigning global_position with a fresh target_position.` } });
INTERVIEW('allies-and-companions',{
  junior:[
    { q:`What makes a companion good?`,
      a:`Usefulness with restraint. It must be visibly helpful, never stuck, never blocking, and it must leave the decisive moments to the player. The hard part is not competence, it is knowing what the ally must not do. State the ally's job in one sentence and what belongs to the player.`,
      follow:`Which failure is worse: an ally that is useless or one that is too strong?`,
      red:`Measures a companion by its damage output.` },
    { q:`A companion gets stuck. Why is that worse than an enemy getting stuck?`,
      a:`Because the player has to notice, care and go back. A stuck enemy is a moment of comedy or a free kill. A stuck ally breaks the relationship the design promised, interrupts pacing, and forces backtracking, which is the loudest immersion break there is.`,
      follow:`What is your last-resort recovery, and when is it acceptable to use it?`,
      red:`Treats it as an ordinary navigation bug with no design weight.` },
    { q:`What is a contribution budget?`,
      a:`An explicit limit on what the ally does so the player keeps ownership of outcomes. The ally sets up, staggers, heals, revives and controls space, and leaves the finishing blow and the key decision to the player. Make the contribution highly visible even when it is numerically modest.`,
      follow:`How do you keep a limited ally from feeling useless?`,
      red:`Balances the ally purely by tuning its damage down.` }
  ],
  mid:[
    { q:`Testers say the companion did everything. Fix it without making it useless.`,
      a:`Shift the contribution from finishing to setup: stagger, expose, distract, heal, revive. Keep the total effect on the encounter similar and change where it lands. Make the help legible with cues so the player registers it. Then measure the player's felt contribution rather than the ally's damage.`,
      follow:`You reduced its impact and now testers ignore it entirely. What happened?`,
      red:`Reduces the ally's damage numbers and re-tests nothing else.` },
    { q:`Design the rules for companion barks.`,
      a:`Cue-driven on state changes, targets and outcomes, with per-line and per-category cooldowns, priorities so the important line wins, and enough variety that repetition is rare in a session. A few rare high-impact lines beat many common ones. Context-blind lines are worse than silence, so gate on state.`,
      follow:`Players are muting the companion. What do you look at first?`,
      red:`Adds more lines to fix repetition without touching cooldowns or priority.` },
    { q:`Follow behaviour in tight corridors: teleport or not?`,
      a:`Teleport as a last resort, out of the player's view, after cheaper recovery has failed. Design so it rarely triggers: a leash distance, staggered formation offsets, explicit door handling, and the ally yielding position when the player reverses. Visible teleporting breaks belief, and constant pathfinding acrobatics in corridors do not work.`,
      follow:`How do you detect that teleport recovery is firing too often?`,
      red:`Chooses either strict pathing everywhere or constant teleporting, with no measurement.` }
  ],
  senior:[
    { q:`How do you measure a companion?`,
      a:`Ask after a paired fight who won it and why, and listen for whether the story is shared or belongs to the ally. Compare solo and paired win rates and felt difficulty. Count backtracking and blocked doorways in an escort test through tight geometry. Track mute rates and whether players use commands if they exist.`,
      follow:`Win rate is identical solo and paired. Is the companion working?`,
      red:`Measures damage contribution and time alive.` },
    { q:`Commands or full autonomy? Defend the choice.`,
      a:`Depends on whether steering the ally is meant to be an axis of play. Commands add control, UI, states and a menu, and they fight immersion in fast action. Full autonomy must be excellent, because there is no way for the player to correct it. The usual answer is excellent autonomy plus a small contextual command set.`,
      follow:`Your command UI is going unused in playtests. What do you conclude?`,
      red:`Adds a full command wheel because more control is assumed to be better.` }
  ] });

T('learning-based-ai', { d:'gameai', t:'Learning-based and ML-driven AI', tag:'Reinforcement learning, imitation learning and learned policies: where they genuinely fit, and why shipping them is a different sport.',
  what:`AI whose behaviour is learned from data or experience rather than authored: reinforcement learning (an agent learns by reward), imitation/behaviour cloning (mimicking human demonstrations), and learned components inside otherwise authored systems (a learned policy, a learned animation/control). It is currently strongest off the player-facing critical path (testing bots, balancing, control/animation) and risky on it (shipping opponents).`,
  why:[`The promise is real: RL has produced superhuman play, and imitation can produce lifelike motion and style. That is seductive and easy to over-apply.`,`Shipping constraints are brutal: determinism, reproducibility, debuggability, patchability and cost all get worse with learned policies.`,`A learned opponent that is very good can be unfun. A learned opponent that is slightly wrong can be unexplainable and unpatched in a hotfix.`,`The reliable wins today are internal: learned bots for testing and balance, imitation for motion, and ML inside tools and generation.`],
  think:{ q:[`Does the experience need a learned policy at all, or does authored AI already read correctly?`,`Is this on the shipping path (opponents, allies) or off it (testing, tools, animation)?`,`Can we guarantee the behaviour stays inside a fairness envelope the design requires?`,`Can we reproduce, debug and hotfix this when it misbehaves on a live build?`,`What is the fallback if the learned component fails or is too expensive?`],
    trade:[`Power and novelty versus control, determinism, debuggability and patchability.`,`Self-play can exceed human skill and can also discover degenerate, unfun strategies to win.`,`Imitation produces human-like behaviour cheaply but inherits the demonstrator's limits and mistakes.`],
    traps:[`Chasing "AI that learns to play" when the game needs an opponent that is fun to lose to.`,`Shipping a learned policy you cannot explain or patch when it starts behaving badly.`,`Forgetting determinism/replay needs until after the model is trained.`,`Treating a research result as a product feature without a fairness and cost envelope.`],
    good:[`Learned bots give you opponents to test balance against at any hour, or motion that reads as human.`,`The learned component has a bounded, measured role and a defined fallback.`],
    bad:[`A shipped opponent that does something inexplicable on stage and cannot be fixed without retraining.`,`A "learning" feature whose main achievement is in the trailer, not the experience.`] },
  how:[`Pick the target by risk: off the shipping path first (testing bots, balance sweeps, animation/control, generation).`,`For any player-facing policy, define a fairness envelope (what it may and may not do) and wrap the learned component with authored constraints.`,`Plan the production realities up front: determinism, replay, latency, memory, retraining cadence, and a non-learned fallback.`,`Instrument heavily: log the inputs and the policy's choices so failures can be reproduced and explained.`,`Ship only if the learned system beats the authored one on the experience metric (readability, fun, diversity), not just on the skill metric.`],
  tech:[
    {n:'Reinforcement learning (self-play)', how:'An agent optimises a reward through trial and error against itself or the environment, learning a policy (often a neural network).', fit:'Off-line: balancing, testing hard-to-reach states, generating training scenarios. On-line: only with a tight fairness envelope and a fallback.', cost:'Data/compute hungry, degenerate strategies, nondeterministic and hard to debug. Retraining to fix a bug.', alt:'Authored AI + self-play for testing. Keep RL out of the shipping critical path unless the experience demands it.'},
    {n:'Imitation / behaviour cloning', how:'Train a model to reproduce demonstration data (player traces, mocap, scripted play).', fit:'Lifelike NPC motion, style imitation, bots that look human for testing or ambient characters.', cost:'Inherits demonstrator bias and errors. Poor outside the demonstrated distribution. Still hard to patch.', alt:'Motion matching or authored state machines for motion. Imitation for ambient/local colour.'},
    {n:'Runtime search / planning as "AI"', how:'At runtime the agent searches (MCTS, minimax, lookahead) for strong play rather than learning offline.', fit:'Turn-based, board-like, or limited-branching games where strong play is desirable and fast.', cost:'Compute cost explodes with branching. Optimal play can be unfun. Still needs fairness throttling.', alt:'Depth-limited search with a personality/throttle layer for variety and fairness.'},
    {n:'Learned components inside authored AI', how:'A neural net provides one piece (target selection, a policy for movement, difficulty estimation) while authored logic keeps the envelope.', fit:'Where a learned piece beats hand-tuned heuristics and failure is contained.', cost:'Integration, latency, and the seam between learned and authored logic. Monitoring drift.', alt:'Prefer this to whole-policy learning: contain the risk inside a debuggable frame.'}
  ],
  ai:{ yes:[`Map a proposed learning feature by shipping risk and propose the off-path alternative.`,`Draft a fairness envelope and fallback for a learned player-facing component.`,`List the production requirements (determinism, retraining, logging) for a described system.`,`Explain RL vs imitation vs runtime search for a specific game need, with trade-offs.`],
       no:[`Promise that a learned agent will be "fun" or "fair". Only players decide.`,`Design the reward function as if it were the experience goal. Reward is a proxy that is easy to game.`,`Skip the fallback and observability because the demo worked.`] },
  prompts:[{l:'Learned-AI risk review',p:`Proposed use of learning: [DESCRIPTION]. Is it on the player-facing shipping path or internal (testing/tools/animation)? Experience it must serve: [EXPERIENCE]. Production constraints: [DETERMINISM, REPLAY, LATENCY, PATCHING, TEAM SKILL]. Assess the risk, propose the off-path alternative, and if it ships, specify the fairness envelope, observability and fallback. Be blunt about what could go wrong on a live build.`}],
  verify:[`Is the learned component's role bounded and explained, with a fallback?`,`Are determinism, replay, retraining and patching addressed?`,`Is the success metric the experience (readable, fun, varied) rather than the skill score?`],
  test:[`Compare the learned system to the authored baseline on player reads: fairness, variety, and fun, not win rate.`,`Reproduce a failure from logs. If you cannot, the system is not shippable.`,`Check the learned behaviour stays inside the fairness envelope over a long session. Watch for drift and degenerate strategies.`],
  rel:[['risk-and-dependencies','Learning is a technical risk that must be scoped like any other.'],['ai-budgets-and-debugging','Learned policies make observability and reproducibility harder, so budgets matter more.'],['verifying-ai-output','Verification discipline applies doubly to learned behaviour.'],['procedural-content','Many reliable ML wins are in generation and tools, off the player path.'],['readable-and-fair-ai','A learned opponent must still be fair and readable to ship.'],['iteration-and-evidence','Decide with evidence, not demo novelty.']] });
ENGINE('learning-based-ai',{
  godot:{ term:`Godot's honest place for learning is off the shipping path. A headless instance runs the game as a training or sweep environment from a SceneTree script, talks to the trainer over a socket, and what ships is the tuned table the sweep produced.`,
    api:['godot --headless -s res://train/env.gd','SceneTree._initialize() / _process()','StreamPeerTCP for the trainer link','Engine.max_fps and Engine.physics_ticks_per_second','RandomNumberGenerator.seed for reproducible episodes','SceneTree.quit(exit_code)'],
    snippet:`extends SceneTree                  # godot --headless -s res://train/env.gd
var _link := StreamPeerTCP.new()
var _episode := 0

func _initialize() -> void:
\tEngine.max_fps = 0             # render nothing, step as fast as the CPU allows
\t_link.connect_to_host("127.0.0.1", 5005)
\t_start_episode(0)

func _process(_delta: float) -> bool:
\t_link.put_utf8_string(JSON.stringify(_observation()))
\t_apply(JSON.parse_string(_link.get_utf8_string()))
\tif _episode_done():
\t\t_start_episode(_episode + 1)
\treturn _episode > 5000         # returning true ends the loop`,
    pitfall:`Speeding the environment up with Engine.time_scale. time_scale scales delta while physics_ticks_per_second stays where it is, so every physics step covers more simulated distance, contacts are missed and movement resolves differently from the build a player runs. The policy learns a game that does not ship, and the sweep results are about that other game. Remove the frame cap and advance episodes on a fixed step you control, then replay one episode at real speed and confirm the outcome matches.`,
    map:`A headless Godot SceneTree environment is a player built with -batchmode -nographics, and Engine.max_fps is Application.targetFrameRate.` },
  unity:{ term:`Unity has the parts on the shelf: ML-Agents trains against a built player and Sentis runs an exported ONNX policy in game. That makes the shipping question sharper rather than softer, because the decision period and the model file are both baked at training time.`,
    api:['com.unity.ml-agents: Agent, CollectObservations(), OnActionReceived()','VectorSensor.AddObservation() / ActionBuffers','DecisionRequester.DecisionPeriod','-batchmode -nographics for the training player','com.unity.sentis: ModelAsset, Worker.Schedule()','Application.targetFrameRate / Time.captureDeltaTime'],
    snippet:`public class Brawler : Agent {                        // com.unity.ml-agents
    [SerializeField] FairnessEnvelope fairness;       // authored, patchable
    [SerializeField] HeuristicBrain fallback;
    public override void CollectObservations(VectorSensor sensor) {
        sensor.AddObservation(transform.localPosition);
        sensor.AddObservation(knowledge.LastSeenAge);
        sensor.AddObservation(health / maxHealth);
    }
    public override void OnActionReceived(ActionBuffers actions) {
        var move = new Vector2(actions.ContinuousActions[0],
                               actions.ContinuousActions[1]);
        if (!fairness.Allows(move)) move = fallback.Decide();
        controller.Drive(move);
    }
}`,
    pitfall:`Treating the decision period as a tuning slider. The DecisionPeriod the agent trained with is part of the policy: it learned to act every N fixed steps and its timing assumptions come with the weights, so "make it react faster" or "give the player a longer window" is a retraining job and a new model file rather than an inspector change. Keep a heuristic behind the same interface, keep the fairness envelope outside the model where a hotfix can reach it, and budget Sentis inference per agent per decision before the build.`,
    map:`ML-Agents against a -batchmode player is a headless Godot SceneTree environment, and a Sentis ModelAsset is a GDExtension inference library plus an ONNX file under res://.` } });
INTERVIEW('learning-based-ai',{
  junior:[
    { q:`Where does machine learning actually fit in games today?`,
      a:`Most reliably off the player-facing critical path: bots that test balance at any hour, reaching hard states for QA, imitation for lifelike motion, and generation inside tools. On the path it is risky, because determinism, debuggability and patchability all get worse. Be specific about which side of that line your example sits on.`,
      follow:`Name an on-path use you would still consider, and what you would demand first.`,
      red:`Answers with enthusiasm about smart opponents and no mention of shipping constraints.` },
    { q:`Why is a shipped learned opponent risky?`,
      a:`Because when it misbehaves you cannot explain it or hotfix it, and the fix may be retraining. A very strong learned agent is often unfun to lose to, and a slightly wrong one is inexplicable. Add nondeterminism and replay problems, and a live incident becomes something you cannot patch on a normal cadence.`,
      follow:`What would you need in place to ship one anyway?`,
      red:`Treats it as an engineering detail that better training will solve.` }
  ],
  mid:[
    { q:`Reinforcement learning, imitation, or runtime search: pick for a specific need.`,
      a:`Pick by the shape of the problem. Runtime search suits turn-based or limited-branching games where strong play is desirable and fast, with a throttle for fairness. Imitation suits human-looking motion and ambient behaviour and inherits the demonstrator's limits. Reinforcement learning suits offline balance and testing, and needs a tight envelope to go near shipping.`,
      follow:`Your imitation model behaves strangely in a situation the demonstrations never covered. What is happening?`,
      red:`Chooses reinforcement learning by default because it is the most powerful.` },
    { q:`What is a fairness envelope and how do you enforce it?`,
      a:`A written statement of what the agent may and may not do: reaction floors, knowledge limits, action rates, resources. Enforce it with authored logic wrapping the learned component, so the policy proposes and the wrapper clamps. Then monitor for drift, because a policy that stays inside the envelope on day one may find its edges later.`,
      follow:`The envelope is clamping most of the model's output. What does that tell you?`,
      red:`Relies on the training reward to produce fair behaviour.` },
    { q:`Your learned bot found a degenerate strategy. What does that tell you?`,
      a:`Usually that your game has an exploit, which is valuable information delivered cheaply. Sometimes it is the reward being a bad proxy for the experience. Check the game first, because a bot that wins by abusing a corner has found something human players will eventually find too. Then fix the design or the reward, explicitly, and say which.`,
      follow:`The strategy is legal, dominant and no human has found it. Do you fix it?`,
      red:`Treats it as a training bug to be tuned away.` }
  ],
  senior:[
    { q:`A producer wants "AI that learns from the player" on the box. How do you respond?`,
      a:`Ask what the player should experience, because that is usually adaptation, memory or personality, and all three can be authored more cheaply and more controllably. Present the off-path alternative with its cost, and the on-path version with its fairness envelope, determinism, retraining cadence, patching story and fallback. Let the cost be visible rather than arguing about the technology.`,
      follow:`They still want it. What is the smallest version you would agree to build?`,
      red:`Agrees and starts a training pipeline, or refuses without offering an alternative that delivers the feeling.` },
    { q:`What production requirements would you insist on before shipping a learned component?`,
      a:`Reproducibility from logs, a deterministic replay path, bounded latency and memory on the target device, a non-learned fallback that can be switched on remotely, a retraining and validation cadence, and monitoring for drift. If a failure cannot be reproduced from a log, the system is not shippable regardless of how well it demos.`,
      follow:`Which of those would you accept a compromise on, and which never?`,
      red:`Lists accuracy and skill benchmarks, with nothing about reproduction or fallback.` },
    { q:`What is the success metric for a learned opponent?`,
      a:`The experience, not the skill score. Readability, variety, fairness, and whether players can explain their losses, compared against the authored baseline. A learned system that wins more and reads worse is a regression. If it cannot beat the authored version on those measures, it does not earn its production cost.`,
      follow:`It beats the baseline on variety and loses on explainability. What do you do?`,
      red:`Reports win rate against human players as the measure of success.` }
  ] });

T('ai-budgets-and-debugging', { d:'gameai', t:'AI budgets, performance and debugging', tag:'Tick rates, time-slicing, LOD and observability: make AI affordable and make stupid behaviour explainable.',
  what:`The engineering discipline around in-game AI: how much time and memory it may spend per frame, how to stagger expensive work (perception, pathfinding, decisions) across frames and agents, how to scale fidelity with distance or importance (LOD), and how to observe and reproduce behaviour so that "the AI is dumb" becomes a specific, fixable cause.`,
  why:[`AI cost scales with agents, and the worst case is a combat with many of them. A design that works with three enemies dies with thirty.`,`Undebuggable AI burns the most expensive resource (team time) and blocks balance passes, because no one can tell whether a problem is design, data or code.`,`Console and mobile CPU budgets are tight. AI competes with rendering, physics and animation for the same milliseconds.`,`Behaviour that cannot be reproduced cannot be fixed, and live bugs reach the player.`],
  think:{ q:[`What is the worst-case simultaneous agent count, and what is the per-frame AI budget?`,`Which AI work can run at a lower rate (perception, decisions) versus must be smooth (motion, animation)?`,`What fidelity can drop with distance/importance without the player noticing?`,`When the AI misbehaves, what view shows the current state, decision, target and why?`,`Can we reproduce a bug from a log or replay?`],
    trade:[`Higher tick rates and richer perception make AI smoother and fairer but cost CPU. Lower rates save budget and can look laggy or unfair.`,`Centralized/time-sliced scheduling saves budget but adds latency and can cause coordinated "all agents think on the same frame" artifacts.`,`Detailed logging makes debugging possible but costs runtime and memory.`],
    traps:[`Designing AI for the demo agent count and discovering the combat cost in production.`,`Everyone perceiving and repathing every frame because it was easiest to write.`,`No debug visualization, so every bug is a code investigation.`,`Nondeterminism with no replay, so "it only happens sometimes" stays forever.`],
    good:[`AI holds its frame budget in the densest encounter with the maximum agent count.`,`A misbehaving agent's cause is visible in a debug view within minutes.`],
    bad:[`Frame spikes whenever a fight starts.`,`"It is the AI" with no way to say which part.`] },
  how:[`Set an explicit per-frame AI budget and the worst-case agent count, then design to them from the start.`,`Separate update cadences by work type: motion/animation smooth, perception, decisions and pathfinding staggered, time-sliced or event-driven.`,`Add level-of-detail: reduce update rate, perception fidelity and pathfinding for distant or unimportant agents, and restore it on relevance.`,`Build the debug view first: current state, decision reason, target, last-known positions, and the scores or conditions that produced the choice.`,`Log enough to reproduce: inputs, decisions, and a seed for randomness, so a replay or a bug report can be re-run.`],
  tech:[
    {n:'Update partitioning / time-slicing', how:'Assign each agent or subsystem a phase and update it every N frames (e.g. perception on a 10 Hz cadence, decisions on a 5 Hz cadence, motion every frame).', fit:'Almost all real-time AI. The first thing to do when the budget is tight.', cost:'Latency and reaction-time changes. Synchronized phases can cause visible "thinking" pauses.', alt:'Randomize phases per agent and tie critical reactions to events to hide the latency.'},
    {n:'Level of detail (AI LOD)', how:'Scale fidelity by distance/relevance: full perception/planning near the player, cheap behaviour far away, promote on approach.', fit:'Open worlds and crowds where most agents are irrelevant most of the time.', cost:'Transitions can be visible. Distant simplification can create exploit holes.', alt:'Tie promotion to gameplay triggers (noise, proximity, combat) rather than pure distance.'},
    {n:'Event-driven AI', how:'Agents mostly idle and wake on events (noise, damage, sight), avoiding per-frame polling.', fit:'Perception-heavy games, stealth, large sparse worlds.', cost:'Event ordering, missed events, and bursty load when many agents wake at once.', alt:'Hybrid: cheap periodic checks plus event wake-ups for the important triggers.'},
    {n:'Debug visualization and replay', how:'On-screen overlays (states, paths, perception cones, scores, last-known positions) plus deterministic logging/replay for reproduction.', fit:'Every project with non-trivial AI. Mandatory once bugs come from playtests.', cost:'Development and maintenance time. Overlay cost if left on.', alt:'Build the overlay incrementally alongside the first behaviour, not after complaints.'}
  ],
  ai:{ yes:[`Profile and interpret AI cost reports you paste, and identify the dominant systems.`,`Propose cadences, LOD rules and event triggers for a described agent mix.`,`Design the debug overlay fields for a specific decision system.`,`Turn "the AI is dumb" descriptions into a list of candidate causes to instrument.`],
       no:[`Optimize without real profiling data. Guessing at the bottleneck wastes the budget you are trying to save.`,`Declare a system shippable without verifying it at the worst-case agent count.`] },
  prompts:[{l:'AI budget and observability plan',p:`Worst-case simultaneous agents: [N]. Per-frame AI budget: [MS]. Agent mix and work types: [E.G. perception, planning, pathfinding, animation]. Proposed tick rates: [CURRENT]. Identify the likely budget cliff, propose update partitioning and LOD rules with the latency trade-offs, and design the debug overlay and log schema needed to reproduce a misbehaving agent. Then state the worst-case test I must run.`}],
  verify:[`Is the budget validated at worst-case agent count, not average?`,`Are latency and LOD transitions checked for visible artifacts and exploit holes?`,`Can a bug be reproduced from a log or replay?`],
  test:[`Measure frame time in the densest encounter at maximum agents on target hardware.`,`Run a playtest and, for every "AI is dumb" report, try to reproduce it from the log and identify the cause from the overlay.`,`Watch for reaction-time regressions from reduced tick rates (agents feel slow or unaware).`],
  rel:[['risk-and-dependencies','AI cost and debuggability are technical risks to scope early.'],['prototyping','Budget and tooling are production disciplines, not afterthoughts.'],['iteration-and-evidence','Observability is what makes AI iteration evidence-based.'],['animation-and-vfx','Frame budget is shared with rendering, physics and animation.'],['playtesting','Reproducing playtest AI bugs depends on this.']] });
ENGINE('ai-budgets-and-debugging',{
  godot:{ term:`Stagger the work by the frame counter and measure with the engine's own monitors. One scheduler node ticks a slice of the agents each physics frame, and Performance.add_custom_monitor puts the AI cost on the same graph as physics and navigation.`,
    api:['Engine.get_physics_frames() % N for the phase','Performance.add_custom_monitor() / get_monitor()','Time.get_ticks_usec()','Node.set_physics_process(false) for distant agents','Node2D._draw() / queue_redraw() for the overlay','get_tree().get_nodes_in_group("agents")'],
    snippet:`extends Node                       # one scheduler, not thirty _physics_process
@export var slices := 4
var _agents: Array[Node] = []
var _last_us := 0

func _ready() -> void:
\tPerformance.add_custom_monitor("ai/decide_us", func(): return _last_us)

func _physics_process(_d: float) -> void:
\tvar start := Time.get_ticks_usec()
\tvar phase := Engine.get_physics_frames() % slices
\tfor i in range(phase, _agents.size(), slices):
\t\t_agents[i].decide()        # 15 Hz per agent at 60 physics ticks
\t_last_us = Time.get_ticks_usec() - start`,
    pitfall:`Reading the script profiler and concluding the AI is cheap. Navigation path queries are served by the NavigationServer on its own threads and physics queries are charged to the physics step, so neither appears beside your decide() function, and a frame that spikes the moment a fight starts looks innocent in the list you are staring at. Watch the physics and navigation monitors next to your custom one, and take the numbers from an exported build, because the editor's remote debugger adds its own cost to every one of them.`,
    map:`Performance.add_custom_monitor is a ProfilerRecorder over a ProfilerMarker, and phase slicing by physics frame is the same trick with Time.frameCount.` },
  unity:{ term:`Wrap the AI work in a ProfilerMarker so it has a name in the timeline, read it back at runtime with a ProfilerRecorder, and slice agents by frame index so thirty of them never think on the same frame.`,
    api:['ProfilerMarker / Profiler.BeginSample()','ProfilerRecorder.StartNew(ProfilerCategory.Scripts, ...)','Time.frameCount % N for the phase','Application.SetStackTraceLogType()','[Conditional("AI_DEBUG")] on debug calls','Debug.DrawRay() / OnDrawGizmosSelected()'],
    snippet:`static readonly ProfilerMarker Decide = new ProfilerMarker("AI.Decide");

void Awake() {                     // a stack trace per log is the real cost
    Application.SetStackTraceLogType(LogType.Log, StackTraceLogType.None);
}

void FixedUpdate() {
    int phase = Time.frameCount % slices;
    using (Decide.Auto()) {
        for (int i = phase; i < agents.Count; i += slices)
            agents[i].Decide();
    }
}
[System.Diagnostics.Conditional("AI_DEBUG")]
void Trace(string s) => Debug.Log(s);`,
    pitfall:`Instrumenting the AI with Debug.Log and then measuring the result. Every Debug.Log captures a managed stack trace by default and writes to the player log synchronously, so thirty agents logging one line each per decision cost more than the decisions did and move the spike you are hunting. Turn the stack trace off for Log, put the calls behind a Conditional attribute so they leave the release build entirely, and read the numbers from a development build on the target device rather than from the editor.`,
    map:`A ProfilerMarker is a custom performance monitor, and ProfilerRecorder is Performance.get_monitor.` } });
INTERVIEW('ai-budgets-and-debugging',{
  junior:[
    { q:`What is a per-frame AI budget, and who sets it?`,
      a:`A fixed share of the frame in milliseconds that all AI work may spend, on the target hardware, at the worst-case agent count. It is set with the technical lead alongside rendering, physics and animation, because they share the same frame. Without a number, AI cost is discovered during a fight in production.`,
      follow:`What is the worst case on your game, and how do you know?`,
      red:`Says it depends and there is no fixed number, with no worst-case count either.` },
    { q:`Which AI work can run at a lower rate?`,
      a:`Perception and decisions can run on a cadence, often a few times a second, because the player cannot perceive that granularity in a decision. Motion and animation must be smooth every frame. Pathfinding runs on demand rather than periodically. Critical reactions get event-driven wake-ups so the cadence does not make agents feel deaf.`,
      follow:`Reaction time got worse after you lowered the rates. How do you recover it?`,
      red:`Runs everything every frame because it is simpler and assumes optimisation comes later.` },
    { q:`What does a useful AI debug overlay show?`,
      a:`Current state, the decision and the reason for it, the current target, last known positions, perception cones, the path, and the scores or conditions that produced the choice. Enough to answer why this agent did that, without reading code. Build it alongside the first behaviour rather than after the first complaint.`,
      follow:`What would you add to the overlay after your first week of playtests?`,
      red:`Describes printing logs to the console as the debugging plan.` }
  ],
  mid:[
    { q:`Frame time spikes whenever a fight starts. Diagnose.`,
      a:`Profile first rather than guessing. Likely candidates are pathfinding requests bursting when agents spawn, perception polling every agent every frame, and all agents deciding on the same frame. Fix by staggering phases with randomised offsets, queueing and time-slicing path requests, and dropping distant agents to cheap behaviour. Measure after each change.`,
      follow:`You staggered everything and a spike remains at spawn. What is left?`,
      red:`Starts optimising the decision system without profiling.` },
    { q:`All agents think on the same frame. Symptom and fix.`,
      a:`A periodic hitch and a visible synchronised pause where the whole group reacts together, which also reads as coordinated in a way you did not design. Fix by assigning each agent a random phase offset within the cadence, and by tying urgent reactions to events rather than to the tick.`,
      follow:`Why does that synchronisation happen even when you did not write it?`,
      red:`Sees only the performance issue and not the behavioural artefact.` },
    { q:`"It only happens sometimes." What do you build?`,
      a:`Reproduction infrastructure: log inputs, decisions and the random seed so a session can be replayed, plus a ring buffer of recent agent state that dumps on a trigger. Then ask playtesters to press one key when they see it, which captures the window. Nondeterminism with no replay means the bug lives forever.`,
      follow:`The game cannot be made deterministic. What do you do instead?`,
      red:`Asks for better repro steps from testers and waits for it to happen in the editor.` }
  ],
  senior:[
    { q:`AI level of detail in an open world: rules and the exploit risk.`,
      a:`Scale fidelity by relevance rather than pure distance: full perception and planning near the player, cheap behaviour far away, promotion on gameplay triggers such as noise, damage or line of sight. The risk is exploit holes where simplified agents cannot detect or react, and visible pops at transitions. Test by playing at the boundary deliberately.`,
      follow:`A player found a spot where distant guards never react. How do you close it?`,
      red:`Uses distance alone and assumes players will not probe the transition.` },
    { q:`How do you make AI debuggable from a playtest rather than only in the editor?`,
      a:`Ship the overlay in internal builds behind a key, log decisions with enough state to reconstruct them, capture a seed, and give testers a one-key incident marker. Aggregate stuck events and incident markers across sessions so the common failures surface as positions and states rather than anecdotes.`,
      follow:`What is the cost of leaving all that in the build, and how do you manage it?`,
      red:`Keeps debugging tools editor-only and relies on repro steps from written reports.` }
  ] });

T('scripted-vs-simulated', { d:'gameai', t:'Scripted vs simulated: pick the cheapest that reads right', tag:'Do not build a general intelligence to produce one memorable moment. Author, fake, or simulate as little as possible.',
  what:`A decision discipline, not a technique: choose the least powerful mechanism that produces the intended player experience. Script it, fake it, constrain it, or simulate it, in ascending order of cost, risk and emergence. The mistake is almost always over-simulating: building a general system to produce one readable moment, then paying for it forever in cost, balance and bugs.`,
  why:[`Simulation is a permanent cost: performance, balance surface, debug time and exploit surface all grow with capability.`,`Authored beats emergent for many experiences, because authored is reliable and reproducible. Emergence is a bonus, not a default.`,`The most celebrated "smart" moments in shipped games are often scripts, timing and presentation with a thin reactive layer.`,`Teams consistently underestimate the maintenance of a general AI system and overestimate the value of the extra intelligence.`],
  think:{ q:[`Is this behaviour authored, faked or genuinely emergent, and does the experience need emergence at all?`,`What is the smallest mechanism that produces the readable moment: a trigger, a script, a timer, a cheat?`,`If we simulate it, what new balance, performance and exploit surface do we take on?`,`Do we need one agent to do this, or is a scripted set piece better and more repeatable?`,`Are we building this because the game needs it, or because it is interesting to build?`],
    trade:[`Scripted: reliable, cheap, readable, repeatable, breaks on unanticipated player input and does not scale to many varied situations.`,`Simulated: emergent, replayable, handles novelty, expensive, balanceable only statistically, and full of edge cases.`,`Hybrid: a thin reactive layer over authored beats often gets most of both.`],
    traps:[`Reaching for a planner or learning when a timer and an animation would read the same.`,`Believing "emergent" is automatically better. Emergent often means "we cannot guarantee it happens".`,`Underestimating the tuning and bug surface of a general system.`,`Making the player's counterplay depend on a simulation that can misfire.`],
    good:[`The team can name, for each memorable moment, the cheapest mechanism that produces it.`,`The AI system is as small as the experience allows, and balance stays comprehensible.`],
    bad:[`A general system produces mostly-mediocre behaviour with occasional brilliance that is not reproducible.`,`Exploits and bugs multiply with capability, and every fix risks another.`] },
  how:[`For each behaviour, ask: is this authored, faked, or truly emergent, and does the experience require the emergent version?`,`Default to the cheapest mechanism. Escalate only with a specific, testable reason the cheap version fails.`,`When you must simulate, constrain it (fewer agents, tighter parameter ranges, a fairness envelope) rather than building the general case.`,`Keep authored beats and simulated behaviour in separate layers so failures do not contaminate the set pieces.`,`Review the whole AI system periodically against the experiences it serves. Cut capability that no longer earns its cost.`],
  tech:[
    {n:'Authored script and triggers', how:'Hand-built behaviour fired by level triggers and timers. Deterministic and repeatable.', fit:'Set pieces, bosses with phases, tutorials, scripted drama, memorable one-offs.', cost:'Brittle to unexpected input. Authoring cost per situation. No variety on replay.', alt:'The default. Escalate only where it visibly fails.'},
    {n:'Thin reactive layer over scripts', how:'A small state machine or behaviour tree that handles common cases, with authored beats triggered when conditions are met.', fit:'Most action games: reactive moment-to-moment, authored for the peaks.', cost:'The seam between reactive and authored needs clear ownership and testing.', alt:'Usually the sweet spot. Resist replacing it with a general system.'},
    {n:'Constrained simulation', how:'A real decision system, but with a deliberately small option set, small agent count, or a bounded parameter range so it cannot surprise the balance.', fit:'When variety/emergence is the point, but the balance surface must stay controllable.', cost:'Still carries simulation cost and edge cases, just fewer.', alt:'Bound it further before adding capability.'},
    {n:'General simulation', how:'A full planner/utility/learning system for many agents in many situations.', fit:'Genuinely open, systemic games where emergence is the core promise and worth the maintenance.', cost:'Highest cost, balance surface, exploit surface and debug burden. Hardest to keep fair.', alt:'Reach this only after the cheaper layers are proven insufficient.'}
  ],
  ai:{ yes:[`For a described moment, propose the cheapest mechanism that could produce it and the cheapest test that would prove it insufficient.`,`Audit an AI system for capability that no longer serves an experience and propose cuts.`,`List the balance, performance and exploit surface a proposed simulation would add.`],
       no:[`Decide the experience or how much emergence is worth.`,`Justify a general system by its elegance. Justify it by the experience it uniquely enables.`] },
  prompts:[{l:'Cheapest-mechanism review',p:`Behaviour we want to produce: [MOMENT/BEHAVIOUR]. The feeling it must create: [FEELING]. Propose the cheapest mechanism (script, trigger, cheat, limited simulation) that could produce it, and the smallest test that would prove the cheap version fails. Then estimate the balance, performance and exploit surface of escalating to a general simulation. Recommend the lowest rung. Do not propose a general system unless a specific experience requires it.`}],
  verify:[`Is each behaviour justified at its capability level, or is a general system being used for a one-off?`,`If simulated, is it constrained to protect balance and performance?`,`Are authored and simulated layers separated so set pieces stay reliable?`],
  test:[`Does the cheap mechanism read correctly in playtests, and can players describe the moment?`,`When the game is patched or the player does something novel, do the authored beats survive?`,`Does the AI system stay within budget and free of exploits as content grows?`],
  rel:[['ingame-ai-purpose','The purpose is the experience, not the capability.'],['scope-control','AI capability is scope. Cut what does not earn its place.'],['ai-budgets-and-debugging','Simulation cost and debug burden are permanent.'],['choosing-ai-technique','Most memorable moments are cheaper than they look.'],['prototyping','Prefer the smallest shippable mechanism, as with any system.']] });
ENGINE('scripted-vs-simulated',{
  godot:{ term:`The cheap rung is a scene with an Area3D, an AnimationPlayer and one connection. The trigger fires once, the animation owns the beat, and nothing decides anything at runtime until the beat hands the agents over.`,
    api:['Area3D.body_entered connected with CONNECT_ONE_SHOT','AnimationPlayer.play() and call method tracks','Marker3D spawn points authored in the scene','PackedScene.instantiate()','Area3D.monitoring via set_deferred()','Node.queue_free() once the beat is spent'],
    snippet:`extends Area3D                     # res://level/ambush/balcony_ambush.tscn
@export var grunt: PackedScene

func _ready() -> void:
\tbody_entered.connect(_fire, CONNECT_ONE_SHOT)   # fires once, ever

func _fire(body: Node3D) -> void:
\tif not body.is_in_group("player"):
\t\treturn
\tset_deferred("monitoring", false)
\t$AnimationPlayer.play("balcony_collapse")       # the beat, authored
\tfor m in $Spawns.get_children():
\t\tvar e := grunt.instantiate()
\t\te.global_position = m.global_position       # then hand over to behaviour
\t\tget_parent().add_child(e)`,
    pitfall:`Assuming body_entered fires once because one player walked in. It fires per body, and a player built as a CharacterBody3D with a separate hurtbox body, a carried object or a dropped ragdoll enters as several, so the authored beat plays two or three times over itself and the ambush spawns a double wave. Connect with CONNECT_ONE_SHOT, filter by group, and stop monitoring inside the handler with set_deferred.`,
    map:`An Area3D trigger driving an AnimationPlayer beat is a trigger Collider driving a Timeline PlayableDirector.` },
  unity:{ term:`The cheap rung is a trigger collider and a Timeline. A PlayableDirector plays the authored beat with camera, audio and animation on tracks, then gives the agents back to their own behaviour when it stops.`,
    api:['OnTriggerEnter() with a tag or layer check','PlayableDirector.Play() and the stopped event','PlayableDirector.extrapolationMode (post-playback state)','TimelineAsset tracks and SignalReceiver','Collider.enabled = false after the beat','Animator.applyRootMotion during the clip'],
    snippet:`[SerializeField] PlayableDirector beat;
[SerializeField] EnemyBrain[] actors;

void OnTriggerEnter(Collider other) {
    if (!other.CompareTag("Player")) return;
    GetComponent<Collider>().enabled = false;          // one shot
    beat.extrapolationMode = DirectorWrapMode.None;    // release the bindings
    beat.stopped += HandOver;
    beat.Play();
}

void HandOver(PlayableDirector d) {
    d.stopped -= HandOver;
    foreach (var a in actors) a.enabled = true;
}`,
    pitfall:`Leaving the director's post-playback state on Hold. Timeline keeps writing every property it animated for as long as the director is active, so an enemy whose Animator sat on a track stays frozen at the last keyframe while its behaviour tree cheerfully decides to charge, and the bug reads as broken AI rather than as an authoring setting. Set extrapolationMode to None, re-enable the behaviour on the stopped event, and keep the authored and simulated layers off each other's transforms.`,
    map:`A Timeline PlayableDirector is an AnimationPlayer beat with call method tracks, and a SignalReceiver is a signal connection.` } });
INTERVIEW('scripted-vs-simulated',{
  junior:[
    { q:`What is the cheapest-mechanism principle?`,
      a:`Choose the least powerful mechanism that produces the intended player experience: script, fake, constrain, then simulate, in ascending order of cost and risk. The common mistake is over-simulating, building a general system for one readable moment and then paying for it forever in balance, performance and bugs.`,
      follow:`When does the cheap version genuinely fail?`,
      red:`Equates cheap with low quality, or assumes simulation is always the more professional choice.` },
    { q:`Name a famous moment of apparently smart AI that is probably a script.`,
      a:`Pick one and explain the mechanism: a timed flank, a scripted retreat at a health threshold, a bark that names the player's position, a set piece triggered by a volume. The point is that presentation and timing produce the read, and the code underneath is usually a trigger and a state.`,
      follow:`What would it cost to produce that same read with a general system?`,
      red:`Insists the celebrated moments must come from sophisticated systems.` }
  ],
  mid:[
    { q:`When does emergence actually earn its cost?`,
      a:`When the promise of the game is that the world has rules the player can exploit, and replayability comes from combinations you could not author. Then emergence is the product. Elsewhere it usually means you cannot guarantee the moment happens, which is a worse trade than an authored beat that lands every time.`,
      follow:`Your systemic game produces a great moment once in twenty sessions. Is that a success?`,
      red:`Treats emergent as automatically better than authored.` },
    { q:`A designer asks for a planner. What do you ask back?`,
      a:`What is the behaviour we want the player to read, and what is the cheapest mechanism that could produce it. Then what specifically fails in the cheap version. Then who authors the action set and who debugs a bizarre-but-valid plan at two in the morning before a milestone. If those answers are thin, the ask is about the technology.`,
      follow:`The answers are good and the planner is justified. How do you contain the risk?`,
      red:`Either builds it or refuses, without asking what experience it is meant to produce.` },
    { q:`How do you keep authored beats reliable next to simulated behaviour?`,
      a:`Keep them in separate layers with a clear contract about who has control. A set piece takes ownership of its agents for its duration and hands them back in a defined state. Otherwise the simulation wanders into the beat, the beat misfires, and you get a failure that only reproduces sometimes.`,
      follow:`The handover state is wrong and the agent behaves oddly after the set piece. How do you catch that class of bug?`,
      red:`Runs both layers simultaneously and tunes until the conflicts are rare.` }
  ],
  senior:[
    { q:`Audit an AI system for capability that no longer earns its place. How?`,
      a:`List the experiences the system is supposed to serve, then list its capabilities, and map them. Anything unmapped is cost: balance surface, performance, exploit surface, debug burden. Check playtests for whether players ever read the capability. Then cut, and measure whether anyone notices. Do it at a milestone boundary, not mid-polish.`,
      follow:`Nobody notices the cut and an engineer is upset. How do you handle that?`,
      red:`Keeps everything because removing working code feels wasteful.` },
    { q:`Emergent systems and live balance: what breaks?`,
      a:`You can only balance statistically, so every content addition reopens the whole space, exploits appear faster than you can patch them, and a fix in one place moves behaviour somewhere unrelated. Plan for telemetry on agent decisions, a constrained parameter range, and the ability to disable a capability remotely.`,
      follow:`How do you decide whether to patch the exploit or the system that allowed it?`,
      red:`Assumes emergence is manageable with a regular balance pass.` },
    { q:`Argue for building the general system. When is it right?`,
      a:`When emergence is the core promise, when the number of distinct situations makes authoring each one more expensive than the system, and when the team can actually author and debug it over the project's life. Then commit properly: tooling, debug views and telemetry from the start, because a general system without observability is unmanageable at scale.`,
      follow:`Which of those three conditions do teams most often get wrong?`,
      red:`Cannot make the case at all, or makes it on elegance rather than on the experience it enables.` }
  ] });
