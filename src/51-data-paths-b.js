/* =====================================================================
   LEARNING PATHS, continued
   Second file for the same PATH()/PATHS registry defined in
   50-data-paths-a.js (loaded first, so PATH, PATHS, TRACKS and LEVELS
   already exist here). Kept separate so two content passes can work at
   once without touching the same file: this file is for the engineering
   tracks (gameplay-engineer-godot, gameplay-engineer-unity,
   live-game-backend-engineer, netcode-server-engineer,
   build-and-release-engineer, interview-prep-engineer), written the same
   way as the paths in 50-data-paths-a.js. Run `node src/inventory.js` for
   every valid ref before writing a path here. Empty until that content
   lands; an empty file is valid, since a path only has to exist once it is
   written.
   ===================================================================== */

PATH('gameplay-engineer-godot', {
  t:'Gameplay engineer, Godot', tag:'Ship the core loop in Godot: signals, physics ticks, and a technique you can debug.',
  track:'engineering', level:'beginner', hours:12,
  audience:'Programmers new to Godot who already know how to code and want to implement a documented gameplay system end to end, in Godot 4.',
  outcome:'You can build a core loop, a decision UI, and a chosen AI technique in Godot, and you can point at the physics tick, the signal, and the Resource that make each one work.',
  prereq:['game-designer-foundations'], next:['interview-prep-engineer'],
  stages:[
    { id:'s1', t:'The loop, in Godot', level:'beginner',
      goal:'See the design idea of a core loop, then build it as a physics tick with a signal for the consequence.', hours:2,
      steps:[
        { kind:'topic', ref:'core-loop', tab:'overview', why:'Godot’s callback names differ from the words designers use. Land the design idea before wiring _physics_process to it.', do:'Describe your loop’s five links (action, feedback, decision, consequence, new situation) in one sentence each, with no engine terms.', min:20 },
        { kind:'topic', ref:'core-loop', tab:'godot', why:'The physics tick owns the verb. Move the multiply-by-delta habit out of your head before it costs you sixty times the intended speed.', do:'Write a CharacterBody2D script with _physics_process driving move_and_slide() and a signal emitted on the consequence. Do not multiply velocity by delta before move_and_slide.', min:30 },
        { kind:'tool', ref:'loop', why:'Building the loop as a diagram exposes the weak link your script hides inside one function.', do:'Build the same loop in the Loop Builder, run its weak-link check, and note which link the check flags that your script does not yet handle.', min:25 },
        { kind:'topic', ref:'decisions', tab:'overview', why:'A decision only counts if the player can actually make it. That is a design claim before it is an engine problem.', do:'List the three decisions your loop should offer the player and write the tradeoff sentence for each.', min:20 },
        { kind:'topic', ref:'decisions', tab:'godot', why:'A Control with the wrong mouse_filter swallows the click and turns a decision into a decision nobody made.', do:'Build a Button-per-option menu from an Array of option data, set the first option to grab_focus, and check every overlay above it uses mouse_filter IGNORE.', min:25 }
      ],
      review:[],
      check:{
        recall:['Why does move_and_slide() already apply delta, and what happens if you multiply by delta anyway?','What is the difference between an action, a decision, and a consequence in the core loop?','Which mouse_filter value makes an overlay invisible to clicks, and which value makes it swallow them?'],
        build:'Export the Loop Builder diagram, then paste your CharacterBody2D script and Button menu script under it in one page.',
        skip:['Can you write a CharacterBody2D script with _physics_process and a consequence signal without checking the docs?','Do you know why multiplying velocity by delta before move_and_slide() breaks the loop, and could you spot it in review?','Have you already fixed a UI click that a Control higher in the tree was swallowing?','Can you name the tradeoff sentence for every decision in your current game right now?']
      } },
    { id:'s2', t:'Rules, in Godot', level:'beginner',
      goal:'Turn a design mechanic into a Resource, and use failure and recovery to make retries fast and honest.', hours:2,
      steps:[
        { kind:'topic', ref:'challenge-failure-recovery', tab:'overview', why:'Recovery time is a design decision before it is a reload call: too slow, and a five-second lesson becomes a fifteen-second wait.', do:'Write what your player loses and keeps on failure, and the recovery time you are targeting, in seconds.', min:20 },
        { kind:'topic', ref:'challenge-failure-recovery', tab:'godot', why:'reload_current_scene() does not reset autoloads, so state from the failed run can leak into the retry.', do:'Write a die() function that times the reload with Time.get_ticks_msec(), calls an autoload Checkpoint.restore(), then reload_current_scene(). List every value the autoload must clear.', min:25 },
        { kind:'topic', ref:'mechanics-and-rules', tab:'overview', why:'A mechanic is only worth keeping if it feeds a decision. Sort your list before you turn any of it into data.', do:'List every mechanic your loop needs and cross out the ones that do not feed a decision you wrote in stage one.', min:20 },
        { kind:'topic', ref:'mechanics-and-rules', tab:'godot', why:'A Resource with a class_name puts the mechanic’s numbers in a .tres file a designer can open, instead of buried in code.', do:'Turn one surviving mechanic into a MechanicDef Resource with @export fields, and write the one-line decision_line() it can print.', min:25 },
        { kind:'checklist', ref:'design-review', why:'A design review forces every question about the mechanic to get an actual answer before you spend more time coding it.', do:'Run the design review checklist against the mechanic you just turned into a Resource, and write down what each group answered.', min:30 }
      ],
      review:['core-loop'],
      check:{
        recall:['What does reload_current_scene() NOT reset, and why does that matter?','How do you decide whether a rule belongs in code or in a Resource?','Why does a mechanic that touches no decision get cut?'],
        build:'Export the design review checklist results for your MechanicDef, alongside the die() function and the Resource script.',
        skip:['Have you already written a die() function that measures and logs its own recovery time?','Can you turn a mechanic into an @export Resource without checking the Godot docs?','Do you know what happens to an autoload’s state across reload_current_scene(), from experience rather than a guess?','Can you run a design review checklist on your own feature and act on an answer you did not want to hear?']
      } },
    { id:'s3', t:'Feel, in Godot', level:'intermediate',
      goal:'Make outcomes legible with feedback, buy that legibility with juice, and keep controls forgiving.', hours:3,
      steps:[
        { kind:'topic', ref:'feedback-and-affordance', tab:'overview', why:'Without feedback the player cannot tell if their action worked, no matter how good the mechanic is underneath.', do:'List your three most common actions and, for each, what confirms the input and what confirms the outcome. Mark the empty cells.', min:20 },
        { kind:'topic', ref:'feedback-and-affordance', tab:'godot', why:'One outcome signal fanning out to animation, sound, and a tween means the miss case cannot be the one nobody wired.', do:'Emit a single outcome signal (hit, blocked, missed) from your resolver and connect one AnimationPlayer clip, one sound, and one create_tween() scale-pop to each of the three outcomes.', min:30 },
        { kind:'topic', ref:'game-feel-and-juice', tab:'overview', why:'Juice amplifies feedback that already exists. It cannot manufacture meaning the loop does not have.', do:'Name the two actions in your game most worth emphasizing, and the one thing each emphasis should communicate.', min:15 },
        { kind:'topic', ref:'game-feel-and-juice', tab:'godot', why:'Forgiveness (an input buffer) and emphasis (hit-stop) are both measured, not guessed.', do:'Add a buffer_sec input buffer for your attack action, and a hitstop() that scales Engine.time_scale for 0.05 seconds using a timer set to ignore the time scale.', min:30 },
        { kind:'topic', ref:'controls-and-friction', tab:'overview', why:'Controls are the interface the player never stops touching. Friction there costs more than friction anywhere else.', do:'List your three most-repeated inputs and rate each for how forgiving it currently is, from instant to punishing a late press.', min:15 },
        { kind:'topic', ref:'controls-and-friction', tab:'godot', why:'Remapping rewrites the InputMap at runtime, and it has to be persisted or the player loses it on relaunch.', do:'Write a rebind() function that erases and re-adds an InputMap action, then saves the binding to a ConfigFile in user://.', min:25 },
        { kind:'tool', ref:'hypothesis', why:'A feel change is a claim, not a fact, until you write down the signal that would prove it worked.', do:'Write a hypothesis in the Hypothesis Builder for one feel change you just made (the buffer, the hit-stop, or the rebind), naming the signal and the kill criterion.', min:35 }
      ],
      review:['decisions'],
      check:{
        recall:['What is the difference between confirming an input and confirming an outcome?','Why can juice not fix a loop that is not compelling underneath?','What are the two things that make Godot’s input buffer and hit-stop measured instead of guessed?'],
        build:'Export your Hypothesis Builder brief for the feel change you tested, and attach the buffer, hit-stop, or rebind script it is testing.',
        skip:['Can you name the empty cell in your own feedback matrix right now?','Have you already tuned a buffer_sec or hitstop() value against a playtest, not a guess?','Do you know why Engine.time_scale needs a timer that ignores it, to make hit-stop work at all?','Can you write a hypothesis with a signal and a kill criterion for a feel change in under ten minutes?']
      } },
    { id:'s4', t:'Choose and see, in Godot', level:'advanced',
      goal:'Pick an AI technique by decision shape, then give agents the senses and the pathing to use it.', hours:3,
      steps:[
        { kind:'topic', ref:'choosing-ai-technique', tab:'overview', why:'The technique you pick decides what is easy and what is impossible for the rest of the project. Choose by decision shape, not by what sounds impressive.', do:'For your hardest enemy or ally, answer: is its decision reactive (pick among options now) or goal-directed (a sequence toward a state)? Write which technique that implies.', min:20 },
        { kind:'topic', ref:'choosing-ai-technique', tab:'godot', why:'A state machine in Godot is Nodes forwarding the physics tick to whichever child state is active, with the data on a Resource a designer can edit.', do:'Write a StateMachine Node that forwards _physics_process(delta) to an active child state and swaps when that state returns a different one.', min:30 },
        { kind:'tool', ref:'gameai', why:'The chooser turns “which technique” from a hunch into an answer you can defend, before you write the state machine or tree.', do:'Run your agent’s decision through the In-game AI Technique Chooser and compare its answer to what you built in the previous step.', min:20 },
        { kind:'topic', ref:'navigation-and-pathfinding', tab:'godot', why:'A perfect decision is worthless if the agent gets stuck on a doorframe. Players read pathing failures as stupidity.', do:'Bake a NavigationRegion3D from your level, give the agent a NavigationAgent3D, and drive its velocity from get_next_path_position() each physics tick.', min:30 },
        { kind:'topic', ref:'perception-and-awareness', tab:'godot', why:'Sensing is a physics query and belongs in _physics_process, or the space lock throws or answers late.', do:'Write a sight check that tests distance, a cone with Vector3.dot(), and a PhysicsDirectSpaceState3D ray, and write the result to a memory node instead of letting behaviour read the target directly.', min:35 },
        { kind:'topic', ref:'ai-budgets-and-debugging', tab:'godot', why:'Thirty agents thinking every frame is a classic frame-rate killer. Staggering the work and graphing its cost is how you keep it invisible.', do:'Write a scheduler that ticks a slice of your agents each physics frame by Engine.get_physics_frames() modulo the slice count, and register the cost with Performance.add_custom_monitor().', min:35 }
      ],
      review:['mechanics-and-rules'],
      check:{
        recall:['How do you decide whether a decision is reactive or goal-directed?','Why must a sight or perception query run inside _physics_process in Godot?','What problem does staggering agent updates by frame index solve?'],
        build:'Export the In-game AI Technique Chooser result, and attach your state machine, navigation, and scheduler scripts as the worked example.',
        skip:['Can you justify picking a state machine over a behaviour tree (or the reverse) for a specific enemy, out loud, in one sentence?','Have you already fixed an agent that got stuck on level geometry?','Do you know why a physics-space query from _process or a signal callback fails or lies in Godot?','Can you read an AI cost monitor and say which of your agents is too expensive, right now?']
      } },
    { id:'s5', t:'Test it, in Godot', level:'advanced',
      goal:'Turn the system you just built into a disposable prototype and a build that stays playable.', hours:2,
      steps:[
        { kind:'topic', ref:'prototyping', tab:'godot', why:'A prototype scene with its knobs as @export_range sliders is what makes a feel or AI change testable in one sitting.', do:'Put the one number you are least sure about (buffer_sec, a technique’s tuning, an AI budget) on the root node as an @export_range slider in its own throwaway scene.', min:30 },
        { kind:'topic', ref:'quality-and-build-health', tab:'godot', why:'A prototype that crashes cannot be played, and a leaked node report at exit is the cheapest regression signal Godot gives you for free.', do:'Write one GdUnit4 test that asserts your budget scheduler never exceeds its slice count, and run it headless with godot --headless.', min:30 },
        { kind:'checklist', ref:'pre-prototype', why:'A prototype without a hypothesis and a scope cut is a demo with extra steps, however good the code underneath is.', do:'Run the pre-prototype checklist against the scene you just built and fix whatever it fails.', min:30 },
        { kind:'reflect', why:'Writing your own answer, not the guide’s, is what makes the sequence yours to repeat on the next system.', do:'In your own words, write which of the four categories (loop, feel, AI, build health) was weakest in what you just built, and the one change you would make first.', min:30 }
      ],
      review:['game-feel-and-juice'],
      check:{
        recall:['Why does putting a tuning value on @export_range beat hardcoding it, even for a throwaway scene?','What does Godot’s leaked-instance report at exit actually tell you?','What is the difference between a prototype and a demo?'],
        build:'Export the pre-prototype checklist result and your GdUnit4 test file as the artefact for this stage.',
        skip:['Can you spin up a disposable Godot scene with export sliders in under ten minutes?','Have you already written and run a headless GdUnit4 test against your own code?','Can you run the pre-prototype checklist from memory?','Do you know what your project’s current leaked-instance count is at exit?']
      } }
  ]
});

PATH('gameplay-engineer-unity', {
  t:'Gameplay engineer, Unity', tag:'Ship the core loop in Unity: the Input System, FixedUpdate, and a technique you can debug.',
  track:'engineering', level:'beginner', hours:13,
  audience:'Programmers new to Unity who already know how to code and want to implement a documented gameplay system end to end, in Unity 6.',
  outcome:'You can build a core loop, a decision UI, and a chosen AI technique in Unity, and you can point at the Update/FixedUpdate split, the UnityEvent, and the ScriptableObject that make each one work.',
  prereq:['game-designer-foundations'], next:['interview-prep-engineer'],
  stages:[
    { id:'s1', t:'The loop, in Unity', level:'beginner',
      goal:'See the design idea of a core loop, then build it across Update and FixedUpdate with an event for the consequence.', hours:2,
      steps:[
        { kind:'topic', ref:'core-loop', tab:'overview', why:'Unity splits the loop across two callbacks. Land the design idea, action, feedback, decision, consequence, new situation, before you decide which callback owns which part.', do:'Describe your loop’s five links in one sentence each, with no engine terms.', min:20 },
        { kind:'topic', ref:'core-loop', tab:'unity', why:'Update never misses a press and FixedUpdate resolves movement on a fixed step. Reading a single-frame press inside FixedUpdate drops or double-counts it.', do:'Write a MonoBehaviour that reads WasPressedThisFrame() in Update, moves a CharacterController in FixedUpdate using Time.fixedDeltaTime, and invokes a UnityEvent<float> for the consequence.', min:30 },
        { kind:'tool', ref:'loop', why:'Building the loop as a diagram exposes the weak link your script hides inside two callbacks instead of one.', do:'Build the same loop in the Loop Builder, run its weak-link check, and note which link it flags that your script does not yet handle.', min:25 },
        { kind:'topic', ref:'decisions', tab:'overview', why:'A decision only counts if the player can make it. That is a design claim before it is a UI problem.', do:'List the three decisions your loop should offer the player and write the tradeoff sentence for each.', min:20 },
        { kind:'topic', ref:'decisions', tab:'unity', why:'The action map is the list of things a player can do. Reading it aloud is the fastest fantasy audit a programmer can run.', do:'Say your InputActionAsset’s action names aloud, then generate one Button per option from a ScriptableObject list and wire EventSystem focus so a pad can answer too.', min:25 }
      ],
      review:[],
      check:{
        recall:['Why can reading a single-frame input inside FixedUpdate drop or double-count a press?','What is the difference between an action, a decision, and a consequence in the core loop?','What does reading your action map out loud tell you about your game’s fantasy?'],
        build:'Export the Loop Builder diagram, then paste your MonoBehaviour and option-menu script under it in one page.',
        skip:['Can you write an Update/FixedUpdate split with a UnityEvent consequence without checking the docs?','Do you know why sampling input in FixedUpdate is a trap, from experience rather than a guess?','Have you already generated a menu from ScriptableObject data instead of hand-placed buttons?','Can you name the Unity equivalent of a Godot Resource without looking it up?']
      } },
    { id:'s2', t:'Rules, in Unity', level:'beginner',
      goal:'Turn a design mechanic into a ScriptableObject, keep retries fast, and see how a shipped codebase enforces its own layering.', hours:3,
      steps:[
        { kind:'topic', ref:'challenge-failure-recovery', tab:'overview', why:'Recovery time is a design decision before it is a scene reload: too slow, and a five-second lesson becomes a wait a player abandons.', do:'Write what your player loses and keeps on failure, and the recovery time you are targeting, in seconds.', min:20 },
        { kind:'topic', ref:'challenge-failure-recovery', tab:'unity', why:'A scene reload past a certain size is why players stop retrying, and pooling the encounter buys the fast loop back.', do:'Write a retry path that resets only the handful of objects that matter using an ObjectPool, and measure its time against a full SceneManager.LoadScene() reload.', min:30 },
        { kind:'topic', ref:'mechanics-and-rules', tab:'overview', why:'A mechanic is only worth keeping if it feeds a decision. Sort your list before you turn any of it into an asset.', do:'List every mechanic your loop needs and cross out the ones that do not feed a decision you wrote in stage one.', min:20 },
        { kind:'topic', ref:'mechanics-and-rules', tab:'unity', why:'A ScriptableObject asset per mechanic means a diff shows exactly which number moved and who moved it.', do:'Turn one surviving mechanic into a ScriptableObject with CreateAssetMenu and Range fields, and add a FormerlySerializedAs guard for the field you are most likely to rename.', min:30 },
        { kind:'part', ref:'cs-unity-mobile-client-ci/arch/arch-layering', why:'A real Unity codebase enforces mechanic and UI boundaries the same way: dependencies point one way, and nothing above core reaches back down.', do:'Say which of your own scripts would violate that rule today, based on how the client assembly stack keeps imports pointing one direction.', min:30 },
        { kind:'checklist', ref:'design-review', why:'A design review forces every question about the mechanic to get an actual answer before you spend more time coding it.', do:'Run the design review checklist against the mechanic you just turned into a ScriptableObject, and write down what each group answered.', min:35 }
      ],
      review:['core-loop'],
      check:{
        recall:['Why does a full scene reload past a certain size cost you retries?','How do you decide whether a rule belongs in code or in a ScriptableObject?','What direction do imports point in the client’s assembly stack, and why does it matter?'],
        build:'Export the design review checklist results for your mechanic ScriptableObject, alongside the retry/pooling script and the assembly-layering note.',
        skip:['Have you already pooled a retry path instead of reloading the whole scene?','Can you turn a mechanic into a ScriptableObject with a FormerlySerializedAs guard without checking the docs?','Do you know which of your own scripts breaks a strict one-way dependency direction, right now?','Can you run a design review checklist on your own feature and act on an answer you did not want to hear?']
      } },
    { id:'s3', t:'Feel, in Unity', level:'intermediate',
      goal:'Make outcomes legible with an event per outcome, buy that legibility with juice, and keep controls forgiving.', hours:3,
      steps:[
        { kind:'topic', ref:'feedback-and-affordance', tab:'overview', why:'Without feedback the player cannot tell if their action worked, no matter how good the mechanic is underneath.', do:'List your three most common actions and, for each, what confirms the input and what confirms the outcome. Mark the empty cells.', min:25 },
        { kind:'topic', ref:'feedback-and-affordance', tab:'unity', why:'A UnityEvent per outcome, consumed by an Animator trigger, an AudioSource, and a particle burst, means the miss case cannot be the one nobody wired.', do:'Raise a UnityEvent<T> per outcome (hit, blocked, missed) from your resolver, wire an Animator.SetTrigger(), an AudioSource.PlayOneShot(), and a ParticleSystem.Play() to each, and reset triggers before setting a new one.', min:25 },
        { kind:'topic', ref:'game-feel-and-juice', tab:'overview', why:'Juice amplifies feedback that already exists. It cannot manufacture meaning the loop does not have.', do:'Name the two actions in your game most worth emphasizing, and the one thing each emphasis should communicate.', min:25 },
        { kind:'topic', ref:'game-feel-and-juice', tab:'unity', why:'Buffering runs on unscaled time, hit-stop on Time.timeScale, and shake on an impulse channel so it does not fight the follow camera.', do:'Add an input buffer on unscaled time for your attack action, and a hit-stop that sets Time.timeScale briefly, driven from WaitForSecondsRealtime so the pause itself is not scaled.', min:25 },
        { kind:'topic', ref:'controls-and-friction', tab:'overview', why:'Controls are the interface the player never stops touching. Friction there costs more than friction anywhere else.', do:'List your three most-repeated inputs and rate each for how forgiving it currently is, from instant to punishing a late press.', min:25 },
        { kind:'topic', ref:'controls-and-friction', tab:'unity', why:'Interactive rebinding excludes the pointer and the cancel key, then the override has to be saved as JSON or the player loses it on relaunch.', do:'Set up PerformInteractiveRebinding on one action excluding the pointer, then save the result with SaveBindingOverridesAsJson().', min:25 },
        { kind:'tool', ref:'hypothesis', why:'A feel change is a claim, not a fact, until you write down the signal that would prove it worked.', do:'Write a hypothesis in the Hypothesis Builder for one feel change you just made (the buffer, the hit-stop, or the rebind), naming the signal and the kill criterion.', min:25 }
      ],
      review:['decisions'],
      check:{
        recall:['Why do a UnityEvent per outcome and a trigger reset avoid a stuck animation state?','Why does hit-stop need WaitForSecondsRealtime instead of a normal wait?','What has to happen to a rebinding override for it to survive a relaunch?'],
        build:'Export your Hypothesis Builder brief for the feel change you tested, and attach the feedback, buffer/hit-stop, or rebind script it is testing.',
        skip:['Can you name the empty cell in your own feedback matrix right now?','Have you already tuned a buffer or hit-stop value against a playtest, not a guess?','Do you know why Time.timeScale alone is not enough for hit-stop, from experience rather than a guess?','Can you write a hypothesis with a signal and a kill criterion for a feel change in under ten minutes?']
      } },
    { id:'s4', t:'Choose and see, in Unity', level:'advanced',
      goal:'Pick an AI technique by decision shape, see it grow into a real state machine, then give agents senses and pathing.', hours:3,
      steps:[
        { kind:'topic', ref:'choosing-ai-technique', tab:'overview', why:'The technique you pick decides what is easy and what is impossible for the rest of the project. Choose by decision shape, not by what sounds impressive.', do:'For your hardest enemy or ally, answer: is its decision reactive (pick among options now) or goal-directed (a sequence toward a state)? Write which technique that implies.', min:20 },
        { kind:'topic', ref:'choosing-ai-technique', tab:'unity', why:'Unity gives you the parts on the shelf: hand-rolled ScriptableObject states, or the Behavior package’s graph assets. Either way the decision is a file a designer can open.', do:'Write a runner MonoBehaviour that calls state.Tick(agent, dt) on a ScriptableObject state asset, and swap states through it instead of through the Animator.', min:30 },
        { kind:'part', ref:'cs-unity-multiplatform-port/arch/arch-state-machines', why:'A shipped hierarchical state machine shows what your Tick-based version grows into once you have more than three states.', do:'List one transition your own machine cannot express yet, based on how the shipped state machine builds its transition table from an event id per state.', min:30 },
        { kind:'tool', ref:'gameai', why:'The chooser turns “which technique” from a hunch into an answer you can defend, before you write the state machine or tree.', do:'Run your agent’s decision through the In-game AI Technique Chooser and compare its answer to what you built.', min:20 },
        { kind:'topic', ref:'navigation-and-pathfinding', tab:'unity', why:'A perfect decision is worthless if the agent never lands on the NavMesh. Players read pathing failures as stupidity.', do:'Bake a NavMeshSurface from your level, call SetDestination() on a NavMeshAgent, and check its return value and isOnNavMesh before trusting the path.', min:30 },
        { kind:'topic', ref:'perception-and-awareness', tab:'unity', why:'Perception is a physics query plus a layer mask, and the result belongs in a knowledge component so behaviour never reads the player transform directly.', do:'Write a sight check using OverlapSphereNonAlloc on a target layer and a Linecast against the occluder layer, and store a hit in a knowledge component instead of a direct reference.', min:30 },
        { kind:'topic', ref:'ai-budgets-and-debugging', tab:'unity', why:'Thirty agents thinking every frame is a classic frame-rate killer, and a named ProfilerMarker is what lets you prove it.', do:'Wrap your agents’ decision code in a ProfilerMarker, slice them by Time.frameCount modulo N, and read the cost back with a ProfilerRecorder.', min:30 }
      ],
      review:['mechanics-and-rules'],
      check:{
        recall:['How do you decide whether a decision is reactive or goal-directed?','Why does storing a sighting in a knowledge component beat behaviour reading the player transform directly?','What does a ProfilerMarker give you that a stopwatch variable does not?'],
        build:'Export the In-game AI Technique Chooser result, and attach your state runner, navigation, and profiling scripts as the worked example.',
        skip:['Can you justify picking a hand-rolled state machine over the Behavior package (or the reverse) for a specific enemy, out loud, in one sentence?','Have you already fixed an agent that never landed on the NavMesh?','Can you read your own transition table and say what state a given event leads to, without opening the code?','Can you read a ProfilerRecorder result and say which of your agents is too expensive, right now?']
      } },
    { id:'s5', t:'Test it, in Unity', level:'advanced',
      goal:'Turn the system you just built into a disposable prototype and a build that stays playable.', hours:2,
      steps:[
        { kind:'topic', ref:'prototyping', tab:'unity', why:'A Range field on a ScriptableObject tuning asset is what makes a feel or AI change testable in one sitting, and the values survive after you press Stop.', do:'Put the one number you are least sure about (a buffer, a technique’s tuning, an AI budget) into a ScriptableObject with a Range field, in its own throwaway scene.', min:30 },
        { kind:'topic', ref:'quality-and-build-health', tab:'unity', why:'A prototype that will not build cannot be played, and the Editor’s Mono runtime hides bugs that only appear under IL2CPP on device.', do:'Write one EditMode test with the Unity Test Framework asserting your budget scheduler never exceeds its slice count, and run it with -batchmode -runTests -testPlatform EditMode.', min:30 },
        { kind:'checklist', ref:'pre-prototype', why:'A prototype without a hypothesis and a scope cut is a demo with extra steps, however good the code underneath is.', do:'Run the pre-prototype checklist against the scene you just built and fix whatever it fails.', min:30 },
        { kind:'reflect', why:'Writing your own answer, not the guide’s, is what makes the sequence yours to repeat on the next system.', do:'In your own words, write which of the four categories (loop, feel, AI, build health) was weakest in what you just built, and the one change you would make first.', min:30 }
      ],
      review:['game-feel-and-juice'],
      check:{
        recall:['Why does putting a tuning value in a Range field beat hardcoding it, even for a throwaway scene?','What is the risk of only testing in the Editor’s Mono runtime and never on an IL2CPP build?','What is the difference between a prototype and a demo?'],
        build:'Export the pre-prototype checklist result and your EditMode test file as the artefact for this stage.',
        skip:['Can you spin up a disposable Unity scene with a Range-tuned ScriptableObject in under ten minutes?','Have you already written and run an EditMode test against your own code?','Can you run the pre-prototype checklist from memory?','Do you know whether your current build even compiles under IL2CPP?']
      } }
  ]
});

PATH('live-game-backend-engineer', {
  t:'Live-game backend engineer', tag:'Ship a Go service that survives crashes, lying clients, and players who never stop playing.',
  track:'engineering', level:'intermediate', hours:14,
  audience:'Backend or Go engineers moving into games, who already ship services and want the constraints unique to a live game: state that must survive a crash, a client that lies, and players who do not stop playing while you ship.',
  outcome:'You can design and defend a request path, a caching and migration strategy, and a live-ops rollout for a game backend, and verify what an AI assistant wrote for you before it ships.',
  prereq:[], next:['netcode-server-engineer'],
  stages:[
    { id:'s1', t:'Shape the service', level:'intermediate',
      goal:'Decide which way dependencies point, how one binary can boot as many roles, and which protocol fits your client, before any of it is code.', hours:2.5,
      steps:[
        { kind:'topic', ref:'backend-layering', why:'The code that knows the game rules must not know which database or transport delivered them. Get this direction right before anything else compounds on top of it.', do:'Draw your planned service as three or four layers and mark every import. Circle any import that points outward instead of inward.', min:25 },
        { kind:'topic', ref:'backend-di-modes', why:'One binary that can boot as an API server, a worker, or an admin tool is cheaper to build and deploy than three binaries that drift apart.', do:'List the process roles your service needs (API, background worker, one-off job) and write the one flag or argument that would select each at boot.', min:25 },
        { kind:'topic', ref:'backend-api-protocol', why:'REST/JSON, protobuf over HTTP, and gRPC are three different bets about schema, tooling, and who your client actually is.', do:'Pick a protocol for your service and write the one sentence that justifies it against the other two, naming your actual client.', min:20 },
        { kind:'part', ref:'cs-go-game-backend/api/api-protocol', why:'A shipped backend answers the same protocol question with a header contract instead of just a schema choice.', do:'List which of those fields your own design is currently missing, based on how the header set (session, platform, client version) carries the protocol.', min:25 },
        { kind:'flow', ref:'cs-go-game-backend/request', why:'The life of a request shows what a handler gets for free: context, gates, and a response it never assembles by hand.', do:'Walk the request flow and write down the one step in it your own handler design does not yet have an answer for.', min:25 },
        { kind:'tool', ref:'delegate', why:'A design review is cheap labor to hand to an AI collaborator, if you tell it exactly what to check.', do:'Run your layering and protocol decisions through the AI Delegation Planner as a design review task, and export the plan it produces.', min:30 }
      ],
      review:[],
      check:{
        recall:['Which direction should a dependency point, and what breaks when it points the other way?','What decides whether one binary can boot as more than one process role?','Name one field in a shipped backend’s header contract your own protocol choice does not carry yet.'],
        build:'Export the AI Delegation Planner’s design review of your layering and protocol decisions, and attach the one sentence justifying your protocol choice.',
        skip:['Can you draw your service’s layers and its import direction from memory, right now?','Do you already know which process roles one binary needs to boot as, for your own service?','Can you justify a protocol choice against the two you did not pick, out loud, in one sentence?','Have you already walked a real request end to end and found the gap in your own design?']
      } },
    { id:'s2', t:'Handle the request', level:'intermediate',
      goal:'Seed a request with context once, give errors a shape the client can act on, and keep a transaction from touching more than it should.', hours:3,
      steps:[
        { kind:'topic', ref:'backend-request-context', why:'One place seeding everything a request needs is what stops the same request from being applied twice.', do:'Write the middleware step that seeds your request context, and the one check inside it that would catch a duplicate submission.', min:25 },
        { kind:'topic', ref:'backend-errors', why:'An error is part of your API. A client that only gets a stack trace cannot act on anything.', do:'Design your error type: a numeric domain code, the HTTP status it maps to, and the one field the client can act on. Apply it to one error you already know you will hit.', min:25 },
        { kind:'part', ref:'cs-go-game-backend/api/api-errors', why:'A shipped backend stops duplicate submissions before the handler ever runs, not inside it.', do:'Say where yours would sit, based on where the shipped backend’s idempotency gate sits relative to the handler.', min:25 },
        { kind:'topic', ref:'backend-data-access', why:'Scoping a transaction to the request and sending the client only what changed are two separate disciplines that both prevent a whole class of bugs.', do:'Write the transaction boundary for one write operation in your service, and list only the fields it would actually send back to the client.', min:30 },
        { kind:'part', ref:'cs-go-game-backend/data/data-schemas-transactions', why:'A real service commits or rolls back several schemas as one decision. See what that looks like before you write your own.', do:'Write the one rule that decision follows, based on how the shipped backend opens and commits multiple schema transactions as a single decision.', min:25 },
        { kind:'prompt', ref:'implement', why:'Handing an AI assistant a clear implementation brief is a skill, and the brief itself is an artifact worth keeping.', do:'Use the implementation prompt template to brief an AI assistant on the error type or transaction boundary you just designed.', min:25 },
        { kind:'checklist', ref:'ai-verify', why:'What an AI assistant wrote for you is not verified until you have actually checked it against your own design.', do:'Run the AI output verification checklist against the code the assistant produced from your brief, and note what it changed that you did not ask for.', min:30 }
      ],
      review:['backend-layering'],
      check:{
        recall:['Where should an idempotency gate sit relative to the handler, and why?','What are the two disciplines that keep a transaction and a response both minimal?','What must an AI output verification pass actually check, beyond whether the code compiles?'],
        build:'Export the AI output verification checklist result for the code your assistant produced from the implementation prompt.',
        skip:['Can you write a request-context middleware step from memory?','Do you already give every error a code, a status and a client-actionable field, without being reminded?','Have you already caught an AI assistant changing something you did not ask for?','Can you scope a transaction to a single request without pulling in more than it needs, on the first try?']
      } },
    { id:'s3', t:'Cache, migrate, secure', level:'intermediate',
      goal:'Pick the right cache tier for the question being asked, ship schema changes separately from code, and keep secrets out of version control.', hours:3.5,
      steps:[
        { kind:'topic', ref:'backend-caching-redis', why:'Three cache tiers answer three different questions. Picking the wrong one means the cache is either wrong or pointless.', do:'For one hot read in your service, decide whether it belongs in a process-local cache, a distributed cache, or a per-request cache, and say why the other two are wrong for it.', min:25 },
        { kind:'part', ref:'cs-go-game-backend/data/data-caching-tiers', why:'A shipped backend keeps master data, mutable player state, and per-request reads in three different tiers on purpose.', do:'Place your own hot read from the previous step into the matching tier, based on how the three cache tiers are scoped.', min:25 },
        { kind:'topic', ref:'backend-migrations-config', why:'Schema changes ship separately from code, and secrets never ship at all. Mixing the two removes your option to roll back just one of them.', do:'Write the migration for one schema change you have planned, and confirm it can deploy and roll back independently of the code that will read it.', min:25 },
        { kind:'part', ref:'cs-go-game-backend/data/data-migrations-sharding', why:'A real system selects both a config block and a schema from one shard id, so the same code path serves every shard.', do:'Write what your own service would need to add to support more than one shard, based on how a shard id selects both configuration and schema.', min:25 },
        { kind:'topic', ref:'infra-secrets', why:'A credential in version control is public from the moment it is pushed. History is the boundary, not the commit.', do:'Grep your own repository history for one credential pattern (a key, a token, a connection string) and confirm what you would do if you found one.', min:25 },
        { kind:'part', ref:'cs-go-game-backend/platform/platform-secrets-lesson', why:'Database credentials and a plaintext API token sat in a committed config for a real project, reachable to anyone with read access, forever.', do:'List the three places the credentials leaked from. Check whether your own project has an equivalent of any of them, based on the secrets lesson.', min:25 },
        { kind:'tool', ref:'delegate', why:'A migration or a secrets rotation is exactly the kind of bounded task worth handing to an AI collaborator with a clear brief.', do:'Run your migration plan through the AI Delegation Planner as a design review, and export what it flagged.', min:30 },
        { kind:'flow', ref:'cs-go-game-backend/match-verification', why:'A client’s result is never trusted by itself. Seeing why shows what your own data layer has to be honest about.', do:'Walk the match verification flow and write the one comparison step your own service would need before it commits a client-submitted result.', min:25 }
      ],
      review:['backend-request-context'],
      check:{
        recall:['How do you decide which of the three cache tiers a given read belongs in?','Why does a schema migration need to deploy and roll back independently of the code that reads it?','What makes history, not the current commit, the real boundary for a leaked secret?'],
        build:'Export the AI Delegation Planner’s review of your migration plan, alongside the cache-tier decision and the match-verification comparison step you wrote.',
        skip:['Can you place a new hot read into the right cache tier without hesitating?','Have you already written a migration that deploys and rolls back independently of its code?','Would you catch a credential in a diff before it is committed, not after?','Can you name the comparison a server must run before trusting a client-submitted result?']
      } },
    { id:'s4', t:'Observe and operate live', level:'advanced',
      goal:'Make the service explainable in an incident, alert on what players feel, and decide what working means before you ship.', hours:3,
      steps:[
        { kind:'topic', ref:'backend-observability', why:'Logs, traces, profiles, and an event stream answer four different questions. None of them substitutes for another.', do:'For your service, name which of the four you currently have, and write the incident question the missing ones would have answered.', min:25 },
        { kind:'part', ref:'cs-go-game-backend/platform/platform-observability', why:'A shipped backend runs eight or more named log streams and a swappable tracing abstraction, all from one config.', do:'Decide which two your own service would need first, based on how the named log streams are scoped.', min:25 },
        { kind:'topic', ref:'infra-monitoring', why:'Time to notice dominates time to recover. An alert on a symptom players feel beats an alert on a metric nobody understands.', do:'Write one alert you would add today, the exact symptom it watches for, and the runbook link it should carry.', min:25 },
        { kind:'topic', ref:'server-liveops', why:'The game keeps running while you change it. Gates, versions, and scheduled jobs are how you stay in control of that.', do:'Name one change you will need to ship while players are online, and the gate or version check that lets you roll it out safely.', min:25 },
        { kind:'topic', ref:'metrics-and-success', why:'Decide what would count as working before you ship, or you will grade the launch on whatever numbers happen to be easy to pull.', do:'Write the one metric that would tell you your live-ops change from the previous step worked, and the number that would make you revert it.', min:25 },
        { kind:'flow', ref:'cs-go-game-backend/push', why:'What happens between a merged pull request and a running deploy is where migration order and seed drift actually show up.', do:'Walk the push-to-production flow and write the one step that would catch a migration ordering mistake before it reaches players.', min:25 },
        { kind:'checklist', ref:'ai-verify', why:'An AI-drafted runbook or alert rule needs the same verification as AI-drafted code.', do:'Run the AI output verification checklist against one AI-drafted alert rule or runbook step, and note what it got wrong.', min:30 }
      ],
      review:['backend-caching-redis','infra-secrets'],
      check:{
        recall:['Which of the four observability signals would answer “why did this fail” versus “how slow is this”?','Why should an alert watch a symptom players feel rather than a raw metric?','What decides whether a live-ops change is safe to ship while players are online?'],
        build:'Export the AI output verification checklist result for the alert rule or runbook step you checked, alongside the metric and revert threshold you wrote.',
        skip:['Can you name your service’s weakest observability signal without checking?','Have you already written a runbook-linked alert on a symptom, not a raw metric?','Can you ship a change to a live game and name the gate that makes it safe?','Do you already know what number would make you revert your last live-ops change?']
      } },
    { id:'s5', t:'Idioms and tests', level:'advanced',
      goal:'Write Go that stays readable at scale, and prove your service’s behaviour with tests whose expected values are not just pasted from a run.', hours:2,
      steps:[
        { kind:'topic', ref:'backend-go-idioms', why:'Context first, errors wrapped, goroutines owned, shutdown deliberate. These idioms are what keep a large Go service readable a year from now.', do:'Pick one function in your service that does not yet pass a context, wrap its errors, or own its goroutines, and rewrite its signature to fix it.', min:30 },
        { kind:'topic', ref:'backend-testing', why:'Three tiers answer three questions, and an expected value pasted from a run proves nothing was actually checked.', do:'Write one test where the expected value is derived independently of the code under test, not copied from its own output.', min:30 },
        { kind:'tool', ref:'delegate', why:'Deciding what to hand an AI assistant and what to keep for yourself is itself a design decision worth planning.', do:'Run this stage’s two tasks (the idiom fix and the test) through the AI Delegation Planner and compare its split of AI-work versus your-work to what you actually did.', min:30 },
        { kind:'reflect', why:'Writing your own answer, not the guide’s, is what makes this workflow yours to repeat on the next service.', do:'In your own words, write the one habit from this path (layering direction, cache tier choice, or AI verification) you are most likely to skip under deadline pressure, and the check that would catch you.', min:30 }
      ],
      review:['backend-data-access'],
      check:{
        recall:['What does wrapping an error actually preserve that a bare return does not?','Why does a test with a pasted expected value prove nothing?','What does the AI Delegation Planner’s split actually decide?'],
        build:'Export the AI Delegation Planner’s split for this stage’s two tasks, alongside the rewritten function and the independently-derived test.',
        skip:['Can you spot a goroutine your own code does not own, on sight?','Do you already derive a test’s expected value independently, as a habit?','Can you decide what to delegate to AI and what to keep, before you start a task, not after?','Have you already named the habit you are most likely to skip under deadline pressure?']
      } }
  ]
});

PATH('netcode-server-engineer', {
  t:'Netcode / game-server engineer', tag:'Decide who is right, what bit-exact costs, and why a client’s result is never trusted alone.',
  track:'engineering', level:'advanced', hours:14,
  audience:'Backend engineers specializing in real-time multiplayer, who already run a service in production and want to reason about latency, authority, and reconciliation with the same rigor as a request handler.',
  outcome:'You can choose an authority model and defend it, design a wire protocol and a fan-out layer, and explain why a client’s result is never trusted by itself.',
  prereq:['live-game-backend-engineer'], next:['interview-prep-engineer'],
  stages:[
    { id:'s1', t:'Authority and truth', level:'advanced',
      goal:'Decide who is right when two machines disagree, and see what bit-for-bit costs to guarantee.', hours:2.5,
      steps:[
        { kind:'topic', ref:'server-authority', why:'Someone has to be right. The wait the player feels while the truth arrives is a design decision, not a bug.', do:'Name your authority model (client, server, or a hybrid) for one contested action, and write the exact wait or correction the player experiences when the server disagrees with them.', min:30 },
        { kind:'topic', ref:'server-determinism', why:'Two machines reaching the identical last bit, not merely an equivalent answer, is a much harder claim than it sounds.', do:'List the three sources of nondeterminism most likely to break a bit-exact replay in your simulation (RNG, floating point, iteration order), and write the fix for each.', min:35 },
        { kind:'part', ref:'cs-go-game-backend/simparity/simparity-determinism', why:'A shipped system ported its own random generator and math helpers by hand because an equivalent answer was not good enough.', do:'Check whether your own simulation shares any of the same risk, based on why a hand-ported RNG and FMA-free math were necessary here.', min:30 },
        { kind:'part', ref:'cs-go-game-backend/simparity/simparity-trace-gate', why:'A fixture set diffed byte-for-byte on every push is what turns “probably still deterministic” into a fact, checked automatically.', do:'Write what your own project’s equivalent gate would need to fixture, based on how the golden-trace test compares every recorded step rather than only the final score.', min:30 },
        { kind:'tool', ref:'sysmap', why:'Authority, determinism, and re-simulation are three systems that constrain each other. Mapping them exposes which one is load-bearing.', do:'Build a System Relationship Map connecting your authority model, your determinism guarantee, and your anti-cheat plan, and mark which one breaks the other two if it changes.', min:30 }
      ],
      review:[],
      check:{
        recall:['What is the difference between an equivalent answer and a bit-exact one, and why does replay verification need the second?','Name two sources of nondeterminism that break a bit-exact simulation replay.','Why does a trace gate compare every recorded step instead of only the final score?'],
        build:'Export the System Relationship Map connecting authority, determinism, and anti-cheat, with the one dependency you marked as load-bearing.',
        skip:['Can you name your authority model and the exact correction a player feels when overruled, without checking?','Have you already found and fixed a source of nondeterminism in a real simulation?','Do you know why your project’s replay or trace test compares every step rather than the final score?','Can you draw the dependency between your authority model and your anti-cheat plan from memory?']
      } },
    { id:'s2', t:'Sync and protocol', level:'advanced',
      goal:'Choose what to send and how often, and give the wire format the same discipline as an API.', hours:2.5,
      steps:[
        { kind:'topic', ref:'server-state-sync', why:'Send what changed, at a rate someone chose on purpose. The alternative is a rate nobody chose, discovered during a postmortem.', do:'Write your tick rate and the one piece of state you delta-encode rather than resend in full, and the reason you picked that rate.', min:30 },
        { kind:'topic', ref:'server-realtime-protocol', why:'A length, an op code, a message id, a payload. Everything past that is a decision you should be able to defend.', do:'Sketch your message envelope field by field and write the one field you added beyond the minimum, and why.', min:30 },
        { kind:'part', ref:'cs-go-game-backend/realtime/realtime-framing', why:'Two independent servers sharing one wire shape means chat and matched play decode the same envelope and dispatch on the same switch.', do:'Write whether your own protocol could support a second server the same way, based on how the framed envelope is shared across two servers with different jobs.', min:30 },
        { kind:'topic', ref:'backend-request-context', why:'A realtime message still needs the same idempotency discipline as an HTTP request, or a retried packet gets applied twice.', do:'Write the one field your realtime envelope needs so a duplicate delivery can be detected and dropped.', min:25 },
        { kind:'tool', ref:'sysmap', why:'State sync, the protocol, and idempotency all touch the same envelope. Map them before you freeze the format.', do:'Add your envelope format and its idempotency field to the System Relationship Map from stage one, and mark what would break if the tick rate changed.', min:30 }
      ],
      review:['server-authority'],
      check:{
        recall:['Why does sending what changed need a rate someone chose on purpose?','What is the minimum a message envelope needs, and what does adding a field beyond that cost you?','What field lets a realtime message detect and drop a duplicate delivery?'],
        build:'Export the updated System Relationship Map with your envelope format and idempotency field added.',
        skip:['Can you state your tick rate and the field you delta-encode without checking?','Can you sketch your message envelope field by field, from memory?','Have you already added an idempotency field to a realtime protocol, not just an HTTP one?','Do you know what breaks first if your tick rate changed tomorrow?']
      } },
    { id:'s3', t:'Sessions and matchmaking', level:'advanced',
      goal:'Turn a ticket into a room, fan a message out across instances, and decide what a disappearing player means.', hours:3,
      steps:[
        { kind:'topic', ref:'server-matchmaking', why:'A ticket, a rule set, a room, and an explicit answer to what happens when someone disappears. Skipping the last one is the common failure.', do:'Write your matchmaking ticket’s fields and the explicit rule for what happens to a room when one player disconnects mid-match.', min:30 },
        { kind:'part', ref:'cs-go-game-backend/realtime/realtime-matchmaking', why:'A ticket carrying capacity and rule predicates is what lets a matchmaker scan the pool for a set that satisfies everyone at once.', do:'Check whether your own ticket design could express a three-way match, not only a pair, based on how tickets carry their own rule predicates.', min:30 },
        { kind:'part', ref:'cs-go-game-backend/realtime/realtime-fanout', why:'Chat and presence running on more than one instance means a publish on one process has to reach subscribers on every other one.', do:'Write the one message type in your own design that would need the same fan-out, based on how the fan-out layer sits between the dispatch loop and Redis.', min:30 },
        { kind:'topic', ref:'backend-caching-redis', why:'A room or a matchmaking pool is exactly the kind of shared, fast-changing state a distributed cache tier exists for.', do:'Decide which of the three cache tiers your matchmaking pool belongs in, and justify it against the other two.', min:25 },
        { kind:'flow', ref:'cs-unity-multiplatform-port/session', why:'A session id shared across two environments, and a phone that can be interrupted at any time, are two failure modes a diagram makes obvious.', do:'Walk the multiplayer session flow and write the one step your own server-side session handling does not yet cover.', min:30 },
        { kind:'tool', ref:'sysmap', why:'Matchmaking, fan-out, and the cache tier all feed the same room. Confirm the map still holds once sessions are in it.', do:'Add rooms and sessions to your System Relationship Map, and mark which existing node now has the most dependents.', min:25 }
      ],
      review:['server-realtime-protocol'],
      check:{
        recall:['What must a matchmaking ticket explicitly answer besides capacity and rules?','Why does a multi-instance chat or presence system need a fan-out layer at all?','Which cache tier does fast-changing, shared room state belong in, and why?'],
        build:'Export the System Relationship Map with rooms and sessions added, and the ticket field set that answers the disconnect question.',
        skip:['Can you write your disconnect rule for a mid-match room without checking?','Do you know which message type in your protocol would need Redis fan-out, if you ran on more than one instance?','Have you already found the gap between a real session flow and your own server-side handling?','Can you say which node in your system map has the most dependents, right now?']
      } },
    { id:'s4', t:'Scale and cheat', level:'advanced',
      goal:'Scale the stateless parts by adding copies, and treat the client as the attacker everywhere it touches a result.', hours:2.5,
      steps:[
        { kind:'topic', ref:'server-scaling', why:'Stateless parts scale by adding copies. The stateful parts are the whole problem, and pretending otherwise is how an outage starts.', do:'Classify your server’s components as stateless or stateful, and write the one stateful component you would need to solve first before adding a second instance.', min:30 },
        { kind:'topic', ref:'infra-data-stores', why:'The database is the one component you cannot restart your way out of. The shard key you choose early is the one you are stuck with.', do:'Write your chosen shard key and the one query pattern that would break if you chose a different one.', min:30 },
        { kind:'topic', ref:'server-anticheat', why:'The client is the attacker. Detect, keep the evidence, and decide the response separately from the detection.', do:'Name one cheat your game is vulnerable to, and write the detection signal, the evidence you would keep, and the response, as three separate decisions.', min:30 },
        { kind:'part', ref:'cs-go-game-backend/simparity/simparity-anticheat', why:'Because the server re-runs the same simulation, a mismatch between a client’s claim and the server’s own re-simulation becomes the anti-cheat signal for free.', do:'Write whether your own architecture could re-run a client’s claimed result the same way, based on how re-simulation doubles as anti-cheat.', min:30 },
        { kind:'tool', ref:'sysmap', why:'Scaling, sharding, and anti-cheat all touch the same stateful core. Confirm the map still names one owner for it.', do:'Add your stateful core and its shard key to the System Relationship Map, and mark whether anti-cheat detection depends on it.', min:25 }
      ],
      review:['server-matchmaking','backend-caching-redis'],
      check:{
        recall:['Why can stateless components scale by adding copies while stateful ones cannot?','What are the three separate decisions in an anti-cheat response, and why keep them separate?','Why does re-simulation give you an anti-cheat signal for free?'],
        build:'Export the System Relationship Map with the stateful core and shard key added, and the three-part anti-cheat decision you wrote.',
        skip:['Can you classify every component in your server as stateless or stateful without checking?','Have you already picked a shard key and lived with a query pattern it made worse?','Can you separate detection, evidence, and response for a cheat you already know about?','Do you know whether your own simulation could re-run a client’s claim to verify it?']
      } },
    { id:'s5', t:'Ops and the client’s other half', level:'advanced',
      goal:'Keep the game changeable while it is live, and understand the multiplayer failure modes that live on the client side of the wire.', hours:3.5,
      steps:[
        { kind:'topic', ref:'server-liveops', why:'The game keeps running while you change it. Gates, versions, and scheduled jobs are how the server stays in control of that.', do:'Name one server-side change you will need to ship while a match is in progress, and the version gate that protects players mid-match from it.', min:30 },
        { kind:'part', ref:'cs-unity-multiplatform-port/mp/mp-netcode-layers', why:'A commercial transport underneath a hand-written protocol is a common shape. Seeing where the seam sits tells you which layer owns which failure.', do:'Write which layer would own a desync bug in your own stack, based on where the transport layer ends and the hand-written protocol begins.', min:30 },
        { kind:'part', ref:'cs-unity-multiplatform-port/mp/mp-host-interp', why:'Host mode and interpolation are a client-side authority model in disguise, with the same wait-for-truth tradeoff as your server’s.', do:'Compare its tradeoff to the authority model you wrote in stage one, based on how host mode measures and hides latency through interpolation.', min:30 },
        { kind:'part', ref:'cs-unity-multiplatform-port/mp/mp-no-reconnect', why:'Treating a suspended app as already dead is a decision, and it is usually the wrong default for a phone.', do:'Write whether your own server-side session timeout matches that choice or fights it, based on why the client tears a session down on suspend instead of waiting.', min:25 },
        { kind:'part', ref:'cs-unity-multiplatform-port/mp/mp-obf-conflict', why:'A tool that renames things by name-based convention will eventually collide with a netcode layer that also resolves members by name.', do:'Check whether any build step in your own pipeline resolves anything by name at runtime, based on how a renaming build step broke name-based network resolution.', min:25 },
        { kind:'flow', ref:'cs-go-game-backend/match-verification', why:'The result a player sees is never the result that counts on its own, because the client’s simulation is not trusted by itself.', do:'Walk the match verification flow again, now from the server-scaling and anti-cheat side, and write the one step that would fail first under load.', min:30 },
        { kind:'tool', ref:'sysmap', why:'This is the last addition to the map. Confirm every system you have covered in this path still connects to the one thing a player actually feels: the wait.', do:'Finish the System Relationship Map by connecting every node back to the player-felt wait time, and export it as this path’s closing artefact.', min:30 }
      ],
      review:['server-scaling','server-anticheat'],
      check:{
        recall:['Why is tearing down a suspended session on a phone a decision, not a default?','What kind of bug does a name-based renaming pass risk breaking in a netcode layer?','Which step in match verification would fail first under load, in your own design?'],
        build:'Export the finished System Relationship Map connecting every stage’s system back to player-felt wait time.',
        skip:['Can you name a server-side change you would need a version gate to ship safely mid-match?','Do you know which layer, transport or hand-written protocol, would own a desync bug in your own stack?','Have you already found a build step in your own pipeline that resolves something by name at runtime?','Can you trace every system in your design back to the wait time a player actually feels?']
      } }
  ]
});

PATH('build-and-release-engineer', {
  t:'Build and release engineer', tag:'Make a release boring on purpose: one entry point, one provenance stamp, one rhythm.',
  track:'engineering', level:'intermediate', hours:12,
  audience:'Engineers responsible for CI/CD, build pipelines, and the release process for a game team, who want a release that is boring by design rather than a fire drill every time.',
  outcome:'You can define and run a release checklist, build a player from a single parameterised entry point, and identify a pipeline smell before it costs a release.',
  prereq:[], next:['technical-lead'],
  stages:[
    { id:'s1', t:'Pin the environment', level:'intermediate',
      goal:'Make the dev stack and the CI stack the same description, and replace near-identical pipeline jobs with one table.', hours:2,
      steps:[
        { kind:'topic', ref:'infra-containers', why:'Pin the toolchain in an image and the “works on my machine” class of bug disappears, because the dev stack and the CI stack are now the same description.', do:'Write the one tool version your local machine and your CI agent currently disagree on, and the image or lockfile change that would pin it.', min:25 },
        { kind:'topic', ref:'infra-ci-pipelines', why:'The pipeline turns a push into a verdict. Gate stages on the event, retry only the network, and check the verdict two ways.', do:'List your pipeline’s stages and mark which ones should gate on the event type (pull request versus push) rather than always running.', min:25 },
        { kind:'part', ref:'cs-unity-mobile-client-ci/ci/ci-pipeline-table', why:'One declarative pipeline replacing eight near-identical trigger jobs is what a job-name table buys you, and a test that feeds it a corrupted table proves the check can actually fail.', do:'Count how many near-identical jobs your own pipeline could collapse the same way, based on how the job-name table replaced eight jobs.', min:25 },
        { kind:'part', ref:'cs-unity-mobile-client-ci/ci/ci-agents-retries', why:'Selecting agents by label instead of by name, and retrying only the network calls, is what keeps a flaky checkout from failing an otherwise-good build.', do:'Write which flaky step in your own pipeline is missing a retry, based on which calls get retried (checkout, CDN upload) and which do not.', min:25 },
        { kind:'tool', ref:'sysmap', why:'A pipeline is a system with real dependencies between its stages. Map it before you try to collapse or reorder anything.', do:'Build a System Relationship Map of your pipeline’s stages and mark the one stage every other stage depends on.', min:20 }
      ],
      review:[],
      check:{
        recall:['Why does pinning the toolchain in an image remove a whole class of bug, not just reduce it?','What does a job-name table let you collapse that eight near-identical jobs could not?','Why should a checkout or upload retry, but a broken build not?'],
        build:'Export the System Relationship Map of your pipeline stages, with the one load-bearing stage marked.',
        skip:['Can you name the one tool-version mismatch between your machine and CI, right now?','Have you already collapsed near-identical pipeline jobs into one table-driven job?','Do you know which of your pipeline’s external calls are missing a retry?','Can you draw your pipeline’s stage dependencies from memory?']
      } },
    { id:'s2', t:'Prove what shipped', level:'intermediate',
      goal:'Stamp provenance into the build at build time, keep secrets out of version control, and know within minutes when a pipeline fails.', hours:2,
      steps:[
        { kind:'topic', ref:'infra-artifacts-provenance', why:'The first question in any incident is which build this is. Stamp the answer in at build time, because you cannot add it later.', do:'Write the exact fields (commit, branch, build number) your build artefact currently stamps, and the one it is missing.', min:25 },
        { kind:'topic', ref:'infra-secrets', why:'A credential in version control is public from the moment it is pushed. History is the boundary, not the commit.', do:'Check your own repository for one credential pattern in history, not just the current tree, and write what you would do if you found one.', min:25 },
        { kind:'part', ref:'cs-unity-mobile-client-ci/build/build-signing-artefacts', why:'A generated release note carrying job, repository, branch, and commit provenance is what makes “which build is this” answerable in seconds during an incident.', do:'Write whether your own build produces an equivalent artefact today, based on what the generated release note carries.', min:25 },
        { kind:'part', ref:'cs-unity-mobile-client-ci/ci/ci-failure-notify', why:'Grading a failure from two independent signals is what stops a silent hang from being mistaken for a pass.', do:'Write which single signal your own pipeline currently relies on alone, based on the two signals used to detect a graded failure.', min:25 },
        { kind:'checklist', ref:'scope-sanity', why:'A release process that has quietly grown scope needs the same monthly sanity check as a feature list does.', do:'Run the scope sanity checklist against your current release process and write the one step that has crept in since you last reviewed it.', min:20 }
      ],
      review:['infra-ci-pipelines'],
      check:{
        recall:['Why can provenance not be added after the fact?','What makes history, not the current commit, the real boundary for a leaked secret?','Why does grading a failure need two independent signals instead of one?'],
        build:'Export the scope sanity checklist result for your release process, alongside the provenance fields your build currently stamps.',
        skip:['Can you name every field your build artefact stamps, without checking?','Would you catch a credential in history, not just in the current diff?','Do you know whether your pipeline’s failure detection relies on one signal or two?','Have you already run a scope sanity pass on your release process this quarter?']
      } },
    { id:'s3', t:'Build the player', level:'intermediate',
      goal:'Drive every build target from one parameterised entry point, and know exactly what a build excludes and why.', hours:3,
      steps:[
        { kind:'topic', ref:'quality-and-build-health', why:'A game that cannot be played cannot be tested. A regular playable build is what keeps the whole evidence loop running.', do:'Write the last time your team had a build that would not run, what caused it, and the one gate that would have caught it earlier.', min:30 },
        { kind:'part', ref:'cs-unity-mobile-client-ci/build/build-cli-entry', why:'One CLI-parameterised entry point building every target beats ten separate scripts that quietly drift apart.', do:'Count how many separate build scripts your own project could replace with one, based on the command-line flags one entry point uses to build every target.', min:30 },
        { kind:'part', ref:'cs-unity-mobile-client-ci/build/build-two-pass', why:'A documented two-pass build working around a timing wart is a workaround worth naming on purpose, not hiding.', do:'Write one workaround in your own pipeline that deserves the same explicit documentation, based on why the build runs twice on purpose.', min:30 },
        { kind:'part', ref:'cs-unity-mobile-client-ci/build/build-exclusion-lists', why:'A declarative exclusion list mirrored into source control means excluded content never even reaches the build agent.', do:'Write what your own build currently does with content that should not ship, based on how the exclusion list is mirrored as a sparse-checkout exclude.', min:30 },
        { kind:'flow', ref:'cs-unity-mobile-client-ci/player-build', why:'Walking a real player build end to end shows every place a target-specific decision actually gets made.', do:'Walk the player build flow and mark the one decision point your own build script does not yet make explicitly.', min:30 },
        { kind:'tool', ref:'sysmap', why:'The build entry point, the exclusion lists, and the signing step all depend on each other in a fixed order. Map that order before you change any of it.', do:'Add the build pipeline to your System Relationship Map from stage one, and mark which step blocks every step after it.', min:30 }
      ],
      review:['infra-artifacts-provenance'],
      check:{
        recall:['What does a single parameterised entry point buy you over ten separate build scripts?','Why document a workaround explicitly instead of just leaving the code as it is?','Why does an exclusion list need to be mirrored into the checkout step, not just the build step?'],
        build:'Export the System Relationship Map of your build pipeline with its blocking step marked, alongside the workaround you chose to document.',
        skip:['Could you collapse your own build scripts into one parameterised entry point today?','Have you already documented a build workaround explicitly, instead of leaving a comment nobody reads?','Do you know what your build currently does with content that should not ship?','Can you name the one step in your build pipeline that blocks every step after it?']
      } },
    { id:'s4', t:'Deploy and deliver content', level:'intermediate',
      goal:'Pick a deploy model by what the workload actually holds, and ship content updates without shipping a new client.', hours:2.5,
      steps:[
        { kind:'topic', ref:'infra-deploy-models', why:'Processes on a VM, containers on a scheduler, functions per request, jobs on a clock. Pick by what the workload holds, not by what is fashionable.', do:'Name your service’s deploy model and the one property of its workload (state, duration, frequency) that actually justifies the choice.', min:30 },
        { kind:'topic', ref:'infra-cdn-assets', why:'Content shipping after the client ships means the hash in the path and the version in the manifest are the only things standing between a player and a stale asset.', do:'Write your CDN path scheme and confirm whether it hashes content or relies on a filename staying stable.', min:30 },
        { kind:'part', ref:'cs-unity-multiplatform-port/cicd/cicd-ten-pipelines', why:'Ten build paths behind one entry point, documented in a table with time estimates, is what keeps a team from guessing which pipeline to run.', do:'Write whether your own team has an equivalent reference or relies on someone remembering, based on the table of ten named pipelines.', min:30 },
        { kind:'part', ref:'cs-unity-multiplatform-port/cicd/cicd-declarative', why:'Three declarative pipelines sharing one stage shape is what keeps three build types from drifting into three different processes.', do:'Write which two pipelines in your own project could share a shape but currently do not, based on how the three pipelines share one stage shape.', min:30 },
        { kind:'tool', ref:'sysmap', why:'The deploy model and the CDN path scheme both depend on how content and code ship separately. Confirm the map shows that split.', do:'Add your deploy model and CDN scheme to the System Relationship Map, and mark whether code and content can currently ship independently.', min:30 }
      ],
      review:['quality-and-build-health'],
      check:{
        recall:['What property of a workload should actually decide its deploy model?','Why does a CDN path need a content hash rather than a stable filename?','What does sharing one stage shape across pipelines actually prevent?'],
        build:'Export the System Relationship Map showing whether code and content can ship independently in your own system.',
        skip:['Can you justify your service’s deploy model by its workload, not by habit?','Do you know whether your CDN path scheme hashes content or trusts a filename?','Have you already found two pipelines in your own project that could share one stage shape?','Can you ship a content update today without also shipping a new client build?']
      } },
    { id:'s5', t:'Release on a rhythm', level:'intermediate',
      goal:'Give the release a fixed departure time, trace a failure back to the phase that caused it, and validate and restore around every build.', hours:2.5,
      steps:[
        { kind:'topic', ref:'pm-qa-release', why:'A release train has a fixed departure time. Whatever is ready and green goes, whatever is not waits for the next one.', do:'Write your team’s current release cadence, and whether it is a fixed train or a deadline chasing whatever is not yet ready.', min:30 },
        { kind:'part', ref:'cs-unity-multiplatform-port/cicd/cicd-phase-trace', why:'A two-hour log triaged by reading one line, because every phase re-prefixes a failure with its own name, is what a phase trace buys you.', do:'Write whether your own build logs let you triage a failure in one line or force a full scroll, based on how a failure gets re-prefixed with its phase name.', min:30 },
        { kind:'part', ref:'cs-unity-multiplatform-port/cicd/cicd-discipline', why:'Validating, grading, and restoring around every build is what stops a flaky result from being reported as a clean pass.', do:'Write the one step your own pipeline currently skips, based on what gets validated and restored around every build.', min:30 },
        { kind:'flow', ref:'cs-unity-multiplatform-port/release-build', why:'Walking a real desktop release build end to end shows every gate a release actually has to clear before it reaches a player.', do:'Walk the desktop release build flow and mark the one gate your own release process does not yet have.', min:30 },
        { kind:'checklist', ref:'scope-sanity', why:'A release cadence, like a feature list, needs a monthly check that it has not quietly grown scope of its own.', do:'Run the scope sanity checklist against your release cadence one more time, now that you have added the gate from the previous step, and write what changed.', min:30 }
      ],
      review:['infra-deploy-models','infra-cdn-assets'],
      check:{
        recall:['What is the difference between a fixed release train and a deadline-driven release?','Why does re-prefixing a failure with its phase name matter for a two-hour log?','What does validating and restoring around every build actually prevent?'],
        build:'Export the second scope sanity checklist result, showing what changed after you added the missing release gate.',
        skip:['Can you say whether your release cadence is a fixed train or a moving deadline, without checking?','Could you triage a failure in your own build logs from one line, or would you have to scroll?','Do you know the one validation or restore step your own pipeline currently skips?','Have you already added a release gate you previously did not have?']
      } }
  ]
});

PATH('interview-prep-engineer', {
  t:'Interview prep, engineering', tag:'Turn layering, authority, and build health into answers with a real tradeoff in them.',
  track:'interview', level:'intermediate', hours:8,
  audience:'Anyone preparing for an engineering interview across backend, server, infrastructure, game AI, or production roles, who wants the app’s own frameworks as the backing for their answers.',
  outcome:'You can answer a structured interview question in any of these tracks with a real example, verify what an AI drafted for you, and tell your own project’s story instead of reciting a definition.',
  prereq:['gameplay-engineer-godot','live-game-backend-engineer','build-and-release-engineer'], next:[],
  stages:[
    { id:'s1', t:'Backend and server craft', level:'intermediate',
      goal:'Turn layering and authority from vocabulary into an answer with a real tradeoff in it.', hours:2,
      steps:[
        { kind:'topic', ref:'backend-layering', tab:'interview', why:'An interviewer asking about layering wants to hear the tradeoff you hit, not the definition of dependency inversion.', do:'Write your own two-sentence answer to the hardest one, using a real decision you made, based on the interview questions for layering.', min:25 },
        { kind:'topic', ref:'server-authority', tab:'interview', why:'Authority questions test whether you have actually felt the wait a player feels when the server overrules them.', do:'Write the one follow-up question you would ask back if you were the interviewer, based on the interview questions for authority models.', min:25 },
        { kind:'part', ref:'cs-go-game-backend/process/process-red-first', why:'“Tell me about your process” answers land better with a specific, named rule than with “we write tests”.', do:'Write the one sentence you would use to describe it if an interviewer asked how your team enforces test discipline, based on the red-first rule.', min:25 },
        { kind:'checklist', ref:'ai-verify', why:'“How do you use AI in your work” is now a standard question, and “I verify it” needs a real checklist behind it to sound credible.', do:'Pick the two items you would actually name if asked how you check AI-generated code, based on the AI output verification checklist.', min:25 },
        { kind:'reflect', why:'Writing your own answer, not the guide’s, is what makes it sound like your story instead of a memorized one.', do:'In your own words, write a sixty-second answer to “tell me about a backend decision you would make differently now,” using the layering or authority answer you just wrote.', min:20 }
      ],
      review:[],
      check:{
        recall:['What makes a layering answer sound like an interview cliché versus a real tradeoff?','What follow-up question would you ask a candidate who gives a textbook authority-model answer?','What is the difference between “we write tests” and naming a specific rule your team enforces?'],
        build:'Write out your sixty-second answer to “tell me about a backend decision you would make differently now,” and time yourself saying it out loud.',
        skip:['Can you answer a layering question with a real tradeoff, not a definition, right now?','Do you already have a follow-up question ready for an authority-model answer?','Can you name a specific process rule your team enforces, not just “we write tests”?','Have you already rehearsed your sixty-second decision story out loud?']
      } },
    { id:'s2', t:'Infra, testing, and reliability', level:'intermediate',
      goal:'Back a monitoring or testing answer with a specific signal or rule, not a general principle.', hours:2,
      steps:[
        { kind:'topic', ref:'infra-monitoring', tab:'interview', why:'A monitoring answer that names an alert and a runbook beats one that says “we watch our dashboards”.', do:'Write the one incident story you would tell, naming the actual symptom that paged someone, based on the interview questions for monitoring.', min:25 },
        { kind:'topic', ref:'backend-testing', tab:'interview', why:'“What tiers of tests do you write” wants to hear how you keep an expected value honest, not a list of test framework names.', do:'Write your answer to the one about a test that passed but should not have, based on the interview questions for testing.', min:25 },
        { kind:'part', ref:'cs-go-game-backend/process/process-e2e-integrity', why:'A rule about what an end-to-end expected value is allowed to be is a sharper answer than “we have end-to-end tests”.', do:'Write the one sentence you would use to explain why an end-to-end test is the easiest place to accidentally test nothing, based on the end-to-end integrity rule.', min:25 },
        { kind:'tool', ref:'delegate', why:'“How do you decide what to hand to AI” is a real interview question now, and the planner gives you a concrete answer instead of a vibe.', do:'Run one task from your own recent work through the AI Delegation Planner, and write the one sentence that explains its split as your interview answer.', min:25 },
        { kind:'reflect', why:'Saying the story out loud once is what catches the parts that only sound good on paper.', do:'In your own words, write a sixty-second answer to “tell me about a monitoring or testing gap you found and closed,” using the incident or test story you just wrote.', min:20 }
      ],
      review:['backend-layering'],
      check:{
        recall:['What makes a monitoring answer specific instead of generic?','Why is “a test that passed but should not have” a sharper story than “we have good test coverage”?','What would you actually say if asked how you decide what to delegate to AI?'],
        build:'Write and time your sixty-second answer to the monitoring or testing gap question.',
        skip:['Do you already have a real incident story with a named symptom ready to tell?','Can you describe a test that passed but should not have, from your own experience?','Could you explain your AI delegation split in one sentence, on the spot?','Have you rehearsed this stage’s sixty-second answer out loud?']
      } },
    { id:'s3', t:'Game AI and production craft', level:'intermediate',
      goal:'Defend a technique choice and a prototyping decision the way a senior candidate would, with the alternative named.', hours:2,
      steps:[
        { kind:'topic', ref:'choosing-ai-technique', tab:'interview', why:'“Why a state machine and not a behaviour tree” only sounds confident if you can name what the other one would have cost you.', do:'Write your answer for one enemy or system, naming the technique you did not pick and why, based on the interview questions for choosing a technique.', min:25 },
        { kind:'topic', ref:'prototyping', tab:'interview', why:'“Tell me about a prototype that failed” is really asking whether you know the difference between a prototype and a demo.', do:'What you would do differently now, based on the interview questions for prototyping and write the one prototype of yours that answered no question.', min:25 },
        { kind:'part', ref:'cs-unity-mobile-client-ci/conv/conv-pr-review', why:'A fixed review checklist and a bilingual PR template is a concrete answer to “how does your team review code”, better than “we do code review”.', do:'Write the one item you would borrow for your own team’s review process, based on what the PR template requires a reviewer to verify.', min:25 },
        { kind:'tool', ref:'gameai', why:'Running your own answer through the same chooser an interviewer might expect you to reason with is a fast way to check it still holds up.', do:'Run the enemy or system from step one through the In-game AI Technique Chooser and check whether it agrees with the technique you defended.', min:25 },
        { kind:'reflect', why:'Saying the story out loud once is what catches the parts that only sound good on paper.', do:'In your own words, write a sixty-second answer to “walk me through choosing a technique for a real enemy,” using the technique and the chooser result from this stage.', min:20 }
      ],
      review:['infra-monitoring'],
      check:{
        recall:['Why does naming the technique you did not pick make an answer stronger?','What is the difference between a prototype that failed and a prototype that answered no question?','What does a fixed review checklist give an interview answer that “we do code review” does not?'],
        build:'Write and time your sixty-second technique-choice answer, checked against the chooser tool’s result.',
        skip:['Can you name the technique you did not pick for a real system, and why, on the spot?','Do you have a real prototype-that-failed story ready, not a hypothetical one?','Can you name one concrete thing your team’s code review process actually checks?','Have you rehearsed this stage’s sixty-second answer out loud?']
      } },
    { id:'s4', t:'Studio, ship discipline, and your story', level:'intermediate',
      goal:'Turn build health and success metrics into a story with a number in it, and close with the habit you would change.', hours:2,
      steps:[
        { kind:'topic', ref:'quality-and-build-health', tab:'interview', why:'“How do you keep a build healthy” wants a triage rule, not “we fix bugs quickly”.', do:'Write your answer to the one about triaging a bug that blocks the core loop versus a cosmetic one, based on the interview questions for build health.', min:25 },
        { kind:'topic', ref:'metrics-and-success', tab:'interview', why:'“How did you know it worked” is answered with a number and a threshold, not a feeling.', do:'Write the one metric and revert threshold from your own recent work that answers this cleanly, based on the interview questions for metrics.', min:25 },
        { kind:'part', ref:'cs-unity-multiplatform-port/process/process-compile-gate-ladder', why:'A written escalation ladder, from a compile check to a device build, is a concrete answer to “how do you decide how much to verify”.', do:'Write the one rung you would add to your own team’s verification process, based on the compile-gate ladder.', min:25 },
        { kind:'checklist', ref:'design-review', why:'Closing an interview answer with “and here is the checklist I ran” is a stronger ending than a general claim.', do:'Run the design review checklist against the last feature you shipped, and pick the one answer you would quote in an interview.', min:25 },
        { kind:'reflect', why:'This is the last reflect step in the path. Use it to name the one habit across all four stages you are least confident defending.', do:'In your own words, write the one habit from this whole path (a layering answer, a delegation split, a technique defense, or a metric) you are least confident defending under follow-up questions, and the one thing you will do this week to fix that.', min:20 }
      ],
      review:['choosing-ai-technique','server-authority'],
      check:{
        recall:['What is the difference between triaging a bug that blocks the core loop and a cosmetic one?','Why does “a number and a threshold” beat “it felt right” as an answer to “how did you know it worked”?','What does a written verification ladder give you that “we test a lot” does not?'],
        build:'Write and time your final sixty-second answer combining the build-health or metrics story with the one habit you named as least confident.',
        skip:['Can you state your own core-loop-blocking triage rule on the spot?','Do you have a real metric and revert threshold ready from your own work?','Can you name the one rung you would add to your team’s verification ladder?','Have you named the habit you are least confident defending, and a concrete fix for it?']
      } }
  ]
});
