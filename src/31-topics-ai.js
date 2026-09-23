/* =====================================================================
   AI COLLABORATION
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'ai', lens:'design', t:'AI Collaboration', short:'Roles, prompting, verification, failure modes, delegation', color:'var(--d-ai)',
    sum:`AI generates possibilities cheaply. Humans decide what is worth making. This domain teaches how to frame, delegate, verify and correct AI work so it makes the game better instead of merely bigger.`,
    links:[['production','AI changes the production loop: cheaper prototypes, more iterations, same need for evidence.'],['player','Only observed players tell you whether AI output is fun. AI cannot judge that.'],['systems','Simulation, edge cases and balance sweeps are among the strongest AI contributions.'],['content','Generation without a validated system produces content spam.']] });

T('bottleneck-shift',{ d:'ai', t:'The bottleneck shift', tag:'AI generates possibilities cheaply. Humans decide what is worth making. A polished bad idea is still a bad game.',
  what:`The traditional workflow was: human thinks, human designs, human documents, human implements. The AI-era workflow is: human frames the problem, AI expands, searches and analyzes, human judges, AI prototypes and implements, players provide evidence, human decides, AI iterates. The bottleneck moves from production to judgment: taste, framing, prioritization, understanding players, recognizing fun, separating signal from noise, making tradeoffs, and knowing what not to build.`,
  why:[`When implementation was expensive, scarcity forced selection. Now selection must be deliberate or the game fills with mediocre content.`,`AI output is fluent and plausible by default, which makes bad ideas look finished.`,`The skills that now matter (framing, judgment, evidence) are the ones least practiced by teams used to spending their time producing.`],
  think:{ q:[`Where am I spending my time: producing, or judging and testing? The ratio should have flipped.`,`What did I decide today that AI could not have decided? If nothing, I delegated judgment.`,`What evidence from players informed today's decisions? If none, I am iterating in a vacuum.`,`What did I decide not to build today?`],
    trade:[`Delegating production frees judgment time and distances the designer from the material. Some insight comes only from making.`,`Fast iteration is powerful and can outrun the playtest cadence.`],
    traps:[`Using AI to produce more instead of to test more.`,`Treating fluency as quality.`,`Letting AI frame the problem and then choosing among its options.`,`Iterating with AI as a substitute for iterating with players.`],
    good:[`More prototypes, more playtests, fewer features than before.`,`Design documents are shorter and hypotheses are more precise.`],
    bad:[`The game has more content and the same core problems.`] },
  how:[`Frame before prompting: player, fantasy, current loop, constraints, evidence, known problems, the decision you need to make.`,`Delegate expansion, analysis, prototyping and implementation. Keep framing, judgment, tradeoffs and the final decision.`,`Insert a playtest between every major AI iteration cycle.`,`Track your not-list. Cheap production makes it the most important artifact you own.`],
  ai:{ yes:[`Expand the possibility space, analyze patterns, compare alternatives, find edge cases, build prototypes, write implementation code, simulate systems, create test matrices, summarize playtest data, challenge assumptions.`],
       no:[`Decide what is fun. Decide the game's identity. Decide which tradeoff matters most. Decide what the player should feel. Decide whether a mechanic deserves to exist.`] },
  prompts:[{l:'Framing before asking',p:`Before you propose anything, restate my problem in your own words and list the assumptions you would have to make to answer it. Here is the context: player [PLAYER], fantasy [FANTASY], current loop [LOOP], constraints [CONSTRAINTS], evidence so far [EVIDENCE], known problems [PROBLEMS], and the decision I need to make: [DECISION]. Tell me what is missing from this framing before you continue.`}],
  verify:[`Did the AI frame the problem, or did I?`,`What would I have decided differently without the AI, and why?`],
  test:[`Count prototypes and playtests per month before and after adopting AI. The ratio to features should rise.`],
  rel:[['ai-roles','Roles are how the human directs the AI.'],['responsibility-matrix','The matrix operationalizes the split.'],['ai-failure-modes','What happens when the split fails.'],['ai-loop','The master workflow is the bottleneck shift as a process.'],['scope-control','Cheap production makes scope control the hard problem.']] });
TECH('bottleneck-shift',[
  {n:'Bottleneck mapping', how:`Name the current constraint in the project (taste, framing, evidence, prioritization) rather than the old one (writing, coding).`, fit:`Deciding where human attention is now the scarce resource.`, cost:`Misidentifying the constraint wastes the cheapest production you have.`, alt:`Ask what is actually delaying good decisions this week.`},
  {n:'Value/effort reallocation', how:`Redirect time saved on production into testing, judgment and player evidence.`, fit:`Capturing the gains from cheaper implementation instead of building more.`, cost:`Default drift is to build more. Needs an explicit rule.`, alt:`Gate scope on validated value.`},
  {n:'Idea-vs-evidence throughput', how:`Measure how many ideas are tested with players versus how many features are built.`, fit:`A weekly check on whether the bottleneck actually moved.`, cost:`Needs a simple counter, not a dashboard.`, alt:`Track features built vs playtests run.`}
]);
ENGINE('bottleneck-shift',{
  godot:{ term:`The engine's part of the shift is a quarantine. Generated scripts and scenes land in one folder that Godot is told to skip, and moving a file out of that folder is the physical act of a human accepting it.`,
    api:['.gdignore (Godot skips the folder entirely)','class_name (registers a global type on save)','EditorScript._run()','DirAccess.get_files_at()','FileAccess.get_file_as_string()','push_warning()'],
    snippet:`@tool
extends EditorScript               # File > Run in the script editor

func _run() -> void:
\tvar files := DirAccess.get_files_at("res://generated")
\tvar claiming := 0
\tfor f in files:
\t\tif not f.ends_with(".gd"):
\t\t\tcontinue
\t\tif FileAccess.get_file_as_string("res://generated/" + f).contains("class_name"):
\t\t\tclaiming += 1
\t\t\tpush_warning("unjudged script claims a global type: " + f)
\tprint("%d generated files, %d already in the project API" % [files.size(), claiming])`,
    pitfall:`A generated script with class_name is part of the project the moment it is saved. The type registers globally, autocompletes everywhere, and someone starts referencing it before a human has judged whether it should exist. Keep unjudged output in a folder holding a .gdignore file, which makes Godot skip it entirely, and make the move out of that folder the decision.`,
    map:`Godot's .gdignore folder is Unity's Assembly Definition boundary, and class_name is a public type in an auto-referenced assembly.` },
  unity:{ term:`Every generated .cs dropped into Assets recompiles the project and reloads the domain, and everything under Assets is in the default assembly. The boundary is an Assembly Definition with Auto Referenced off, so generated code cannot be called until someone references it on purpose.`,
    api:['Assembly Definition (.asmdef) / Auto Referenced','AssemblyReloadEvents.beforeAssemblyReload','SessionState.SetFloat / GetFloat','AssetDatabase.FindAssets("t:MonoScript", paths)','EditorApplication.timeSinceStartup','[InitializeOnLoad]'],
    snippet:`[InitializeOnLoad]
public static class ReloadCost {                 // Assets/Editor/ReloadCost.cs
    static ReloadCost() {
        AssemblyReloadEvents.beforeAssemblyReload += () =>
            SessionState.SetFloat("start", (float)EditorApplication.timeSinceStartup);
        AssemblyReloadEvents.afterAssemblyReload += () => {
            float seconds = (float)EditorApplication.timeSinceStartup
                            - SessionState.GetFloat("start", 0f);
            int generated = AssetDatabase.FindAssets(
                "t:MonoScript", new[] { "Assets/Generated" }).Length;
            Debug.Log($"domain reload {seconds:F1}s with {generated} generated scripts");
        };
    }
}`,
    pitfall:`Producing more code has a price the team pays all day and nobody measures. Every generated script recompiles the assembly and reloads the domain, which is the pause between pressing Play and playing, and everything under Assets ships unless an asmdef or a platform filter excludes it. Fence generated work in its own assembly with Auto Referenced off, and watch the reload number.`,
    map:`Unity's asmdef boundary is Godot's .gdignore folder, and a domain reload is Godot reparsing scripts when the editor regains focus.` } });
INTERVIEW('bottleneck-shift',{
  junior:[
    { q:`What has working with an AI assistant actually changed about your day?`,
      a:`Answer with a ratio, not a tool list. Implementation and first drafts got cheap, so the time should have moved into framing problems, testing with players and deciding what not to build. Give a concrete before and after: how many prototypes and playtests per month now versus before, and how many features.`,
      follow:`Has your feature count gone up or your playtest count? Be honest about which.`,
      red:`Describes the assistant as a faster way to produce more content, with no change to how decisions get made.` },
    { q:`What did you decide this week that the assistant could not have decided?`,
      a:`Name a real decision: what the player should feel, which trade-off mattered, which mechanic did not deserve to exist. Explain the judgment behind it and what evidence you used. If nothing comes to mind, say so and explain what that reveals, because delegating judgment is the failure mode this question exists to detect.`,
      follow:`How would you know if you had quietly delegated a decision like that?`,
      red:`Cannot name one, or names a decision that was really a choice among options the assistant generated.` },
    { q:`What work do you deliberately keep doing by hand?`,
      a:`Usually the first pass on anything you need to understand deeply: the core loop code you will tune for months, the first draft of the pillars, the playtest observation itself. Some insight only comes from making the thing. Name the specific work and the insight you would lose by delegating it.`,
      follow:`How do you decide something has crossed from worth doing by hand to worth delegating?`,
      red:`Delegates everything and treats the question as a trick, or refuses to use assistants on principle.` }
  ],
  mid:[
    { q:`Your team ships more features every sprint and the game is not getting better. What is happening?`,
      a:`Production got cheap and selection did not get deliberate. When implementation was expensive, scarcity did the filtering for you. Now it has to be a decision. Check the ratio of prototypes and playtests to shipped features, check when a player last touched the build, and check whether anyone maintains a not-list.`,
      follow:`What is the first measurement you would put in the weekly review?`,
      red:`Proposes better planning or more code review, and never mentions player evidence.` },
    { q:`How do you frame a problem before you ask an assistant for anything?`,
      a:`State the player, the fantasy, the current loop, the constraints, the evidence so far, the known problems and the decision you need to make. Then ask it to restate the problem and list the assumptions it would need before it proposes anything. If you cannot write the framing, the request is premature.`,
      follow:`It restates your problem as a slightly different, easier one. What does that tell you?`,
      red:`Opens with "give me ideas for the combat" and refines by reacting to whatever comes back.` },
    { q:`Where does delegating production distance you from the material, and what do you do about it?`,
      a:`You stop feeling the resistance that teaches you where a system is awkward, and you stop noticing the small decisions the code makes. Compensate by playing every build yourself before anyone else, by reading the defaults the assistant chose, and by keeping at least one system you build and tune by hand.`,
      follow:`Give me an example of something you only learned by building it yourself.`,
      red:`Says there is no downside, or that playing the build is QA's job.` }
  ],
  senior:[
    { q:`How do you make sure the time saved on implementation improves the game?`,
      a:`Route it deliberately: more playtests, more prototypes per decision, more time on the framing and the not-list. Put a playtest between every major iteration cycle so cheap building cannot outrun evidence. Then measure the routing, because saved time defaults into more features unless something claims it.`,
      follow:`What would you measure monthly to prove the time actually went there?`,
      red:`Assumes saved time automatically becomes quality, or fills it with more scope.` },
    { q:`A colleague argues that assistants make designers unnecessary. How do you respond?`,
      a:`Agree about the part that changed and be precise about the part that did not. Expansion, analysis, prototyping and implementation got cheap. Deciding what the game is, what the player should feel, which trade-off matters and what not to build did not, because those need taste, player evidence and accountability. Then point at the failure modes teams hit when nobody does that job.`,
      follow:`What would change your mind?`,
      red:`Answers with defensiveness about craft, or agrees and describes the designer as a prompt writer.` }
  ] });

T('ai-roles',{ d:'ai', t:'AI as different design partners', tag:'Ask for a role, not for "ideas". Each role has a job, a time to use it, and a time to keep it away.',
  what:`Nine ways to cast the AI: brainstormer (expands the space), critic (attacks assumptions), systems designer (analyzes interactions), UX researcher (finds friction), prototype engineer (builds experiments), playtest analyst (finds behavioral patterns), content generator (creates variations after validation), project analyst (finds dependencies, risks, scope problems), devil's advocate (argues against the current design). Naming the role sets the stance, the output shape, and what the AI should refuse to do.`,
  why:[`An unrolled request produces the average of all stances: mild ideas, mild critique, mild everything.`,`Roles make verification easier: you know what a critic should have done and can check whether it did.`,`Roles keep the AI out of decisions: none of the nine is "decider".`],
  think:{ q:[`What do I need right now: more options, fewer options, a build, an analysis, or a challenge?`,`Which role would a good studio bring into this meeting?`,`Which role should I keep out? (Content generator before validation. Brainstormer when the problem is a decision.)`,`After the role's output, what is my job?`],
    trade:[`Sequencing roles (brainstorm, then critique, then analyze) is slower and far better than asking one prompt to do everything.`],
    traps:[`Asking the brainstormer to recommend.`,`Asking the critic after you have committed.`,`Asking the content generator before the system is validated.`,`Skipping the devil's advocate because the team agrees.`],
    good:[`Prompts start with a role and end with what the role must not do.`],
    bad:[`Prompts are "help me with combat".`] },
  how:[`Pick the role from the AI Workflow view. Read its use and do-not-use conditions.`,`Give the role full context (the prompting framework) and a task with an output shape.`,`Sequence: brainstormer, critic, systems designer, prototype engineer, playtest analyst, devil's advocate before commit.`,`Do the human job after each role: judge, choose, decide.`],
  ai:{ yes:[`Everything in the nine roles, when cast deliberately.`],
       no:[`Be the decider. No role decides identity, fun, or tradeoffs.`] },
  prompts:[{l:'Role sequence',p:`We are working on [PROBLEM]. Run these roles in sequence and label each section. 1. Brainstormer: 8 mechanically distinct options, no recommendation. 2. Critic: for each option, the assumption it depends on and the player behavior that would disprove it. 3. Systems designer: interactions of the top 3 (by your critique) with our existing systems [SYSTEMS]. 4. Devil's advocate: argue that we should build none of them and improve [EXISTING INTERACTION] instead. Stop. I will decide.`}],
  verify:[`Did each role stay in its lane? Did the brainstormer sneak in a recommendation?`,`Did the critic attack, or nod?`],
  test:[`The roles do not replace testing. They prepare it. Did the sequence produce a hypothesis you can test?`],
  rel:[['bottleneck-shift','Roles keep judgment human.'],['prompting-framework','Role is one term of the formula.'],['verifying-ai-output','Each role has its own verification questions.'],['ai-roles-view','The AI Workflow view has the interactive role cards.']] });
TECH('ai-roles',[
  {n:'Role cards', how:`Assign the model a named stance (brainstormer, critic, systems designer, UX researcher, prototype engineer, analyst, content generator, project analyst, devil's advocate) with use/do-not-use conditions and an output shape.`, fit:`Getting useful, bounded output instead of generic ideas.`, cost:`Wrong role for the task produces confident nonsense.`, alt:`Pick the role from the AI Workflow view.`},
  {n:'Role sequencing', how:`Run roles in a deliberate order (expand, attack, analyse, then the human decides, then build), never letting one model output become the decision.`, fit:`Using AI to widen options while the human chooses.`, cost:`Skipping the human-decision step is the common failure.`, alt:`Insert an explicit decision between generation and commitment.`},
  {n:'Stance and context framing', how:`State expertise, audience and constraints so the model reasons in the right frame.`, fit:`Sharpening any prompt beyond a generic answer.`, cost:`Over-constraining can shrink the search space.`, alt:`Set the stance. Leave the solution space open.`}
]);
ENGINE('ai-roles',{
  godot:{ term:`The role decides where the output is allowed to run. Tool roles are @tool scripts, EditorScripts or an addon under addons/, content-generator output is .tres resources, and only the prototype-engineer role produces code the player runs.`,
    api:['@tool annotation','Engine.is_editor_hint()','EditorScript._run()','EditorPlugin + addons/<name>/plugin.cfg','ResourceSaver.save()','@export with a setter'],
    snippet:`@tool
extends Node                       # content-generator role, editor only

@export var count := 24
@export var generate := false:
\tset(value):
\t\tif value and Engine.is_editor_hint():
\t\t\t_generate()            # runtime must never regenerate content

func _generate() -> void:
\tfor i in count:
\t\tvar v := VariantSpec.new()
\t\tv.seed_value = i
\t\tResourceSaver.save(v, "res://content/variant_%02d.tres" % i)`,
    pitfall:`A @tool script runs inside the editor. Generated code with side effects in _ready() or in a property setter executes against your project the moment somebody opens that scene, and a ResourceSaver call on that path overwrites real assets with no undo step. Guard every write with Engine.is_editor_hint() and an explicit trigger, and read a generated @tool script before you open its scene.`,
    map:`Godot @tool is Unity [ExecuteAlways], EditorScript._run() is a [MenuItem] method, and addons/ is the Editor/ folder.` },
  unity:{ term:`The role decides the assembly. Tool roles live in an Editor/ folder and never ship, content-generator output is ScriptableObject assets created through AssetDatabase, and runtime MonoBehaviours are the only thing the prototype-engineer role hands over.`,
    api:['[MenuItem] inside an Editor/ folder','ScriptableObject.CreateInstance<T>()','AssetDatabase.CreateAsset() / SaveAssets()','EditorUtility.DisplayDialog()','Undo.RecordObject()','[InitializeOnLoad] / [ExecuteAlways]'],
    snippet:`public static class VariantGen {                 // Assets/Editor/VariantGen.cs
    [MenuItem("Design/Generate variants")]
    static void Run() {
        if (!EditorUtility.DisplayDialog("Generate",
                "Overwrite 24 variant assets?", "Generate", "Cancel")) return;
        for (int i = 0; i < 24; i++) {
            var v = ScriptableObject.CreateInstance<VariantSpec>();
            v.seedValue = i;
            AssetDatabase.CreateAsset(v, $"Assets/Content/Variant_{i:00}.asset");
        }
        AssetDatabase.SaveAssets();
    }
}`,
    pitfall:`[InitializeOnLoad] and [InitializeOnLoadMethod] run on every domain reload with nobody invoking them. A generated editor tool that writes assets from a static constructor has already rewritten your content by the time you finish reading the file. Keep generated tools behind an explicit [MenuItem] with a confirmation, and treat a static constructor in Editor/ code as the first thing to review.`,
    map:`Unity's Editor/ folder is Godot's addons/ and @tool scripts, and [MenuItem] is EditorScript._run().` } });
INTERVIEW('ai-roles',{
  junior:[
    { q:`What does giving an assistant a role mean, and why does it matter?`,
      a:`It sets the stance, the output shape and what the assistant should refuse to do. Without a role you get the average of all stances: mild ideas, mild critique, mild everything. With one you also get a verification handle, because you know what a critic was supposed to do and can check whether it did.`,
      follow:`Which role is hardest to get an honest answer from, and why?`,
      red:`Treats the role as a persona for flavour rather than a constraint on the output.` },
    { q:`Name three roles you use and what each must refuse to do.`,
      a:`A brainstormer expands the space and must not recommend. A critic attacks the assumption behind each option and must not soften. A prototype engineer builds the experiment and must not decide what the experiment is for. None of the roles is decider, which is the point of naming them.`,
      follow:`Which role do you use least, and is that a gap?`,
      red:`Lists roles with no refusals attached, so every role quietly recommends.` },
    { q:`You need your own design attacked. How do you set that up?`,
      a:`Cast a devil's advocate, give it the design, the evidence and the constraints, and ask it to argue that you should build none of it and improve something existing instead. Ask for the player behaviour that would disprove each assumption. Do it before you commit, because a critic consulted after the decision is theatre.`,
      follow:`It agrees with you. What do you do next?`,
      red:`Asks "what do you think of my design?" and reads the polite answer as validation.` }
  ],
  mid:[
    { q:`Which role do you keep out of the room, and when?`,
      a:`The content generator before the system is validated, because it turns an unproven system into a mountain of content nobody can evaluate. The brainstormer when the problem is a decision rather than a shortage of options, because more options is how a stuck decision stays stuck. Say which of those you have actually got wrong.`,
      follow:`Your team already generated a hundred items for an unvalidated system. What now?`,
      red:`Sees no reason to withhold a role, or treats more options as always helpful.` },
    { q:`Sequence the roles for a combat redesign.`,
      a:`Brainstormer for mechanically distinct options with no recommendation, critic for the assumption each depends on, systems designer for how the survivors interact with existing systems, prototype engineer for the cheapest build, then devil's advocate before committing. Do the human job between each step: judge, cut, decide.`,
      follow:`Where in that sequence do players enter?`,
      red:`Writes one prompt asking for the whole thing at once.` },
    { q:`How do you check that a critic actually critiqued?`,
      a:`Look for a named assumption per option and a player behaviour that would disprove it. Look for something it refused to endorse. Agreement with a hedge is not critique. If everything came back defensible, re-run with the evidence and the constraint that it must identify the weakest option and say why.`,
      follow:`What do you do when the critique is fluent and entirely generic?`,
      red:`Accepts a list of balanced pros and cons as a critique.` }
  ],
  senior:[
    { q:`How do you stop the assistant from becoming the decider on a team?`,
      a:`Make ownership explicit before the work starts, keep every role's refusal list visible, and require that decisions embedded in generated artifacts get surfaced and routed to a person. Watch the artifacts: when the design document nobody remembers writing becomes the source of truth, the decider has already moved.`,
      follow:`What is the earliest symptom you would look for?`,
      red:`Relies on everyone being sensible, or bans assistants from design work entirely.` },
    { q:`You are teaching a junior designer to use roles. What is the first thing you correct?`,
      a:`The unrolled request. Their first prompts will ask for help with a topic rather than casting a stance with a task and an output shape. The second correction is the missing refusal: every role needs a stated do-not, or it drifts into recommending. Then teach them to do the human step between roles rather than chaining outputs.`,
      follow:`What habit takes longest to build?`,
      red:`Starts with prompt formatting tricks rather than with framing and stance.` }
  ] });

T('prompting-framework',{ d:'ai', t:'The prompting framework', tag:'CONTEXT + INTENT + CONSTRAINTS + EVIDENCE + ROLE + TASK + OUTPUT FORMAT + CRITIQUE.',
  what:`A structure for delegating design work: Context (player, fantasy, loop, systems), Intent (the experience you are after and the decision you need to make), Constraints (scope, platform, team, what is off the table), Evidence (playtest results, telemetry, known problems), Role (the stance), Task (the specific work: analyze, generate, compare, build), Output format (how you will consume it), Critique (ask the AI to attack its own output). The best prompt is rarely "give me ideas". It is "here is the situation, analyze the space, identify assumptions, generate alternatives, compare tradeoffs, propose the smallest experiments".`,
  why:[`AI output quality tracks input specificity. Vague prompts get genre averages.`,`Framing is the human's most valuable contribution. The framework forces you to do it.`,`Output format and critique turn a monologue into something you can verify and act on.`],
  think:{ q:[`Have I stated the decision I need to make? If not, the AI will make one for me or make none.`,`What evidence do I have? If none, the task should be a prototype or a test design, not a design.`,`How will I consume the output? A table? A ranked list? Code?`,`What do I want the AI not to do?`],
    trade:[`Long prompts cost time up front and save many rounds of correction.`,`Tight constraints produce relevant output and can exclude the surprising option. Loosen deliberately for brainstorming.`],
    traps:[`Context without intent: the AI describes instead of deciding what to analyze.`,`Task without output format: unusable prose.`,`No critique step: the output looks finished and is unexamined.`],
    good:[`Prompts are reusable with variables swapped.`,`Output can be verified against the constraints stated.`],
    bad:[`Every prompt is a new conversation from zero.`] },
  how:[`Use the Prompt Generator: fill the eight fields and copy.`,`Save prompts that worked as templates in the library with variables.`,`Always end with a critique instruction and a stop instruction ("do not recommend yet").`,`Follow with the verification questions.`],
  ai:{ yes:[`Draft or improve a prompt from a rough request, then tell you what context it is missing.`],
       no:[`Fill in the intent or evidence for you.`] },
  prompts:[{l:'The full formula',p:`CONTEXT: player [PLAYER], fantasy [FANTASY], core loop [LOOP]. Systems [SYSTEMS]. INTENT: we want players to feel [EMOTION] by [BEHAVIOR], the decision I must make is [DECISION]. CONSTRAINTS: [PLATFORM, SCOPE, TEAM, OFF-LIMITS]. EVIDENCE: [PLAYTEST RESULTS, TELEMETRY, KNOWN PROBLEMS]. ROLE: act as a skeptical [ROLE]. TASK: analyze the design space, identify the assumptions in the current design, generate [N] mechanically distinct alternatives, compare tradeoffs, and propose the smallest experiments that would distinguish between them. OUTPUT: a table with columns [COLUMNS], then a short list of experiments with observable signals. CRITIQUE: finally, attack your own output: what assumptions did you make, what could make each alternative fail, and what did you leave out? Do not recommend a final choice.`}],
  verify:[`Did the output respect every constraint? Check each.`,`Did it use the evidence, or ignore it?`,`Did the critique section actually find something?`],
  test:[`Prompts are not tested by players. The experiments they propose are.`],
  rel:[['ai-roles','Role is one term.'],['verifying-ai-output','What to do after the output.'],['prompt-library','Reusable templates built on the formula.'],['bottleneck-shift','Framing is the new bottleneck.']] });
TECH('prompting-framework',[
  {n:'Eight-term formula', how:`CONTEXT + INTENT + CONSTRAINTS + EVIDENCE + ROLE + TASK + OUTPUT FORMAT + CRITIQUE.`, fit:`Any task where you want a usable, decision-ready answer.`, cost:`Unfilled terms produce the genre average with confidence.`, alt:`Use the Prompt Generator tool. It flags blanks.`},
  {n:'Structured output contracts', how:`Ask for a table, a ranked list with counts, or a fixed schema so the output is consumable and comparable.`, fit:`Analysis, comparisons, and anything you will act on.`, cost:`Over-rigid formats can cut off useful reasoning.`, alt:`Let it reason in prose, then output in the contract.`},
  {n:'Few-shot with your own data', how:`Give one or two worked examples in your format before the task.`, fit:`Matching house style, taxonomy or edge-case handling.`, cost:`Bad examples anchor bad behaviour.`, alt:`Curate examples from your best prior output.`},
  {n:'Reason-then-answer and self-critique', how:`Ask it to show reasoning, then attack its own answer for assumptions and failure modes.`, fit:`Reducing confident-but-wrong outputs.`, cost:`Not a guarantee of correctness. Still verify.`, alt:`Follow with an independent verification pass.`},
  {n:'Context injection, not memory', how:`Paste the relevant docs, evidence and constraints rather than assuming the model knows your project.`, fit:`Project-specific answers.`, cost:`Context windows and cost. Needs curation.`, alt:`Give the smallest evidence that supports the decision.`},
  {n:'Task-appropriate sampling', how:`Use broad generation for brainstorming and tight, deterministic settings for extraction and verification.`, fit:`Getting variety where you want it and reliability where you need it.`, cost:`Requires platform support and discipline.`, alt:`Treat generation and verification as different tasks.`}
]);
ENGINE('prompting-framework',{
  godot:{ term:`The CONTEXT term has an engine half, and it is short: the major version, the node type the script extends, whether the work happens in _process or _physics_process, the input action names, and the renderer. Leave any of it out and the answer is for a different engine.`,
    api:['Engine.get_version_info()','ProjectSettings.get_setting("rendering/renderer/rendering_method")','ProjectSettings.get_setting("physics/common/physics_ticks_per_second")','InputMap.get_actions()','extends <NodeType>','_process(delta) vs _physics_process(delta)'],
    snippet:`extends SceneTree                  # godot --headless -s res://tools/context.gd

func _initialize() -> void:
\tvar v := Engine.get_version_info()
\tprint("engine: Godot %d.%d.%d" % [v.major, v.minor, v.patch])
\tprint("renderer: ", ProjectSettings.get_setting(
\t\t"rendering/renderer/rendering_method"))
\tprint("physics tick: ", ProjectSettings.get_setting(
\t\t"physics/common/physics_ticks_per_second"))
\tprint("input actions: ", InputMap.get_actions())
\tquit()`,
    pitfall:`Not stating the major version. Godot 3 and Godot 4 differ exactly where generated code lives, so you get KinematicBody2D, export var, onready and yield back, and none of it parses in a 4.x project. There is far more Godot 3 code in the world than Godot 4 code, so the default answer is the old one. Paste the version, the renderer and the node you extend into every prompt.`,
    map:`Godot's rendering method and physics tick settings are Unity's render pipeline asset and Fixed Timestep, and the input map is an Input Actions asset.` },
  unity:{ term:`Four facts decide whether the answer runs at all: the Unity version, the render pipeline, the input backend, and the assembly the script will live in. Keep them in a clipboard snippet so the context term is never guessed.`,
    api:['Application.unityVersion','GraphicsSettings.currentRenderPipeline','#if ENABLE_INPUT_SYSTEM','Time.fixedDeltaTime (Project Settings > Time)','EditorGUIUtility.systemCopyBuffer','Assembly Definition the script belongs to'],
    snippet:`public static class PromptContext {              // Assets/Editor/PromptContext.cs
    [MenuItem("Design/Copy engine context")]
    static void Copy() {
        var rp = GraphicsSettings.currentRenderPipeline;
        EditorGUIUtility.systemCopyBuffer = string.Join(", ", new[] {
            "unity " + Application.unityVersion,
            "pipeline " + (rp == null ? "Built-in" : rp.GetType().Name),
#if ENABLE_INPUT_SYSTEM
            "input: Input System package",
#else
            "input: legacy Input Manager",
#endif
            "fixed timestep " + Time.fixedDeltaTime });
    }
}`,
    pitfall:`Leaving out the render pipeline and the input backend. Built-in pipeline code sets material properties URP does not have, so everything renders magenta, and legacy Input class code throws InvalidOperationException in a project configured for the Input System package alone. Both compile cleanly, so the compiler will not warn you. Name the pipeline, the backend and the version every time.`,
    map:`Unity's render pipeline asset is Godot's rendering method setting, an Input Actions asset is the input map, and Fixed Timestep is physics_ticks_per_second.` } });
INTERVIEW('prompting-framework',{
  junior:[
    { q:`Walk me through the parts of a prompt you would write to get a systems analysis.`,
      a:`Context: player, fantasy, loop, existing systems. Intent: the experience wanted and the decision to be made. Constraints: platform, scope, team, what is off the table. Evidence: playtest results and known problems. Role, then the task, then the output format you will consume, then a critique instruction and a stop instruction.`,
      follow:`Which of those parts do people skip most, and what happens?`,
      red:`Describes prompt phrasing tricks rather than the content the assistant is missing.` },
    { q:`What is the difference between intent and task?`,
      a:`Intent is the experience you want and the decision you have to make. Task is the specific work you want done: analyse, generate, compare, build. Context without intent gets you description instead of analysis, and intent without a task gets you an essay. You need both, plus the output shape.`,
      follow:`Give me a prompt where the task is clear and the intent is missing. What comes back?`,
      red:`Treats them as the same thing, or gives a task with no decision attached.` },
    { q:`Why does output format belong in the prompt?`,
      a:`Because you have to consume it. A table with named columns, a ranked list, a CSV, code with specific exposed values. Format also constrains the thinking: asking for a comparison table forces comparable claims where prose lets everything be equally good.`,
      follow:`What format would you ask for when comparing five mechanics?`,
      red:`Says any format is fine and then reformats the prose by hand afterwards.` }
  ],
  mid:[
    { q:`Your prompt produced generic output. Diagnose it before rewriting.`,
      a:`Check for missing intent, missing evidence and missing constraints, in that order. Generic output is almost always the genre average filling a vacuum you left. Check whether you asked for options when you needed a decision, and whether you gave any real detail about your player and your loop that would make a generic answer impossible.`,
      follow:`Show me the one sentence you would add first.`,
      red:`Rewrites with stronger adjectives, or asks the assistant to be more creative.` },
    { q:`What does the critique step buy you?`,
      a:`It surfaces the assumptions, marks what was invented versus given, names what could make each option fail, and says what was left out. It turns a finished-looking monologue into something you can check. Ask for it as a separate step with new instructions, because a self-critique in the same breath tends to be decorative.`,
      follow:`The critique found nothing. What is your read?`,
      red:`Adds "and critique yourself" at the end and accepts the two-line hedge that comes back.` },
    { q:`Tight constraints produce relevant output and can exclude the surprising option. How do you handle that?`,
      a:`Loosen deliberately and in one direction at a time. Run a constrained pass for what is buildable now, and a deliberately unconstrained pass where you name the constraint you are suspending and ask what becomes possible. Keep them separate so the unconstrained ideas do not quietly enter the plan.`,
      follow:`An unconstrained option is clearly the best idea and breaks your platform constraint. Now what?`,
      red:`Always constrains hard and reports that the assistant never produces anything surprising.` }
  ],
  senior:[
    { q:`How do you make prompts reusable across a team without them going stale?`,
      a:`Template the structure and parameterise the content: bracketed slots for player, loop, constraints and evidence, so the current facts are supplied each time rather than baked in. Keep a small library of prompts that produced decisions, with a note on what each was for. Retire any prompt whose embedded context is no longer true.`,
      follow:`How do you stop the library from becoming its own documentation theatre?`,
      red:`Shares a folder of long prompts with the project's facts hard-coded into them.` },
    { q:`What goes in your context that a new hire would not know to include?`,
      a:`The evidence and the history: what was already tested and what it showed, which decisions are settled and why, what is deliberately off the table, and the known problems the team has stopped mentioning because everyone knows them. That tacit layer is what separates a useful answer from a competent generic one.`,
      follow:`How do you make that context available to the team rather than living in your head?`,
      red:`Lists more game details and never mentions evidence or settled decisions.` }
  ] });

T('verifying-ai-output',{ d:'ai', t:'Verifying AI output', tag:'Fluent is not correct. Ask what it assumed, what evidence it used, and what would prove it wrong.',
  what:`The discipline of interrogating AI output before acting on it: What assumptions are you making? What evidence supports this? What could make this fail? What player behavior would prove this wrong? Is this solving the actual problem or producing more content? Is this complexity necessary? What is the smallest prototype that tests this? What alternatives did we reject? What tradeoff are we making?`,
  why:[`AI output is confident by default. Confidence is not a signal.`,`Hallucinated best practices, invented data and plausible-sounding psychology are common and hard to spot in fluent prose.`,`Verification is where the human adds value: not by redoing the work, but by checking it against the problem, the evidence and the player.`],
  think:{ q:[`Which claims here are derived from what I provided, and which are imported from elsewhere?`,`Would this survive a skeptical senior designer's first question?`,`Does it solve the problem I stated, or a nearby easier one?`,`What did it not consider?`],
    trade:[`Deep verification is slow. Skipping it is how bad ideas get polished.`],
    traps:[`Verifying tone instead of content.`,`Accepting "studies show" without a source you can check.`,`Letting the AI verify itself in the same breath without new information.`],
    good:[`Every accepted output has a written note of what was checked.`,`Rejected outputs are as common as accepted ones.`],
    bad:[`Output is pasted into the design document unchanged.`] },
  how:[`Run the nine verification questions (in the checklist) on any output you might act on.`,`Check every factual claim you would rely on.`,`Restate the original problem and check the output answers it, not a neighbor.`,`For design proposals, insist on the smallest prototype and a kill criterion before building.`],
  ai:{ yes:[`Answer the verification questions about its own output when asked separately, and mark assumptions and inferences explicitly.`,`Generate counter-arguments to its own proposals.`],
       no:[`Be trusted because it sounds sure.`] },
  prompts:[{l:'Verification pass',p:`About your previous output: 1. List every assumption you made and mark each as given by me, inferred, or invented. 2. For each factual or "best practice" claim, state the source or say you have none. 3. What player behavior would prove the proposal wrong? 4. Is this solving the problem I stated, or a nearby one? Quote my problem. 5. Which complexity is necessary and which could be removed? 6. What is the smallest prototype that tests this, and what result would kill it? 7. What alternatives did you reject and why? 8. What tradeoff are we making?`}],
  verify:[`This topic is the verification.`],
  test:[`The prototype and kill criterion the verification produces are what you test.`],
  rel:[['ai-failure-modes','Failure modes are what verification catches.'],['prompting-framework','Critique is the last term of the formula.'],['hypothesis-driven-design','Verification ends in a testable hypothesis.'],['checklists-view','The AI-output verification checklist lives in Checklists.'],['ai-evals','Evals repeat verification across a whole pipeline, on every change.']] });
TECH('verifying-ai-output',[
  {n:'Assumption marking', how:`Require each claim tagged given, inferred or invented.`, fit:`Separating data from plausible invention.`, cost:`The model may still mislabel. Spot-check.`, alt:`Demand sources or "unknown".`},
  {n:'Independent re-derivation', how:`Solve or check the problem yourself or with a separate pass, then compare.`, fit:`High-stakes numbers, balance, logic and code.`, cost:`Time. Tempts you to skip it.`, alt:`Verify the decision, not every sentence.`},
  {n:'Ground-truth check', how:`Test the output against the actual code, data, build or a playtest.`, fit:`Any claim about how the game behaves.`, cost:`Needs access and setup.`, alt:`Code and data are the truth. Doc is a map.`},
  {n:'Adversarial / red-team pass', how:`Ask a second pass to break the first output: find the assumption, the failure, the counterexample.`, fit:`Catching plausible-but-wrong and generic output.`, cost:`Can produce noise. Focus on the important claims.`, alt:`Use the devil's advocate role.`}
]);
ENGINE('verifying-ai-output',{
  godot:{ term:`GDScript will happily load a script that calls a method which does not exist. Static type annotations turn most of that into a parse error, and godot --headless --check-only turns the parse into a command a build runner can fail on. Behaviour still needs a GUT or GdUnit4 test.`,
    api:['Static typing: var x: int, func f(a: float) -> void','godot --headless --check-only --script res://generated/loot.gd','GUT / GdUnit4: assert_not_null(), assert_true()','assert(condition, "why")','push_error() / push_warning()','ProjectSettings "debug/gdscript/warnings/untyped_declaration"'],
    snippet:`extends GutTest                    # res://test/test_generated_loot.gd

func test_generated_table_never_rolls_nothing() -> void:
\tvar table = preload("res://generated/loot_table.gd").new()
\tfor tier in range(1, 6):
\t\tvar drop = table.roll(tier)
\t\tassert_not_null(drop, "tier %d rolled nothing" % tier)
\t\tassert_true(drop is LootEntry, "tier %d rolled the wrong type" % tier)

func test_weights_sum_to_one() -> void:
\tvar table = preload("res://generated/loot_table.gd").new()
\tassert_almost_eq(table.total_weight(), 1.0, 0.001)`,
    pitfall:`GDScript is dynamically typed by default, so a generated script with a misspelled method name parses, loads, and fails only the first time that branch runs, which is usually in front of a tester. Switch the untyped-declaration warning on, require static annotations in generated code, and run --check-only on every generated file before anyone plays it.`,
    map:`Godot --check-only plus GUT is Unity's compiler plus the Test Framework, and push_error is Debug.LogError.` },
  unity:{ term:`Compiling is not verification. What the compiler cannot see is the wiring, so the check that counts is a PlayMode test that builds the object the code expects, runs a frame, and fails on any unexpected log line.`,
    api:['[UnityTest] / [Test] in a test assembly','Assert.IsNotNull / Assert.That','LogAssert.NoUnexpectedReceived()','new GameObject(name, typeof(T))','yield return null (let Awake and Start run)','unity -batchmode -runTests -testPlatform PlayMode'],
    snippet:`public class GeneratedLootTests {                // Tests/PlayMode/GeneratedLootTests.cs
    [UnityTest] public IEnumerator TableNeverRollsNothing() {
        var go = new GameObject("loot", typeof(LootTable));
        var table = go.GetComponent<LootTable>();
        yield return null;                       // let Awake and Start run
        for (int tier = 1; tier <= 5; tier++)
            Assert.IsNotNull(table.Roll(tier), $"tier {tier} rolled nothing");
        LogAssert.NoUnexpectedReceived();        // a swallowed exception is a failure
    }
}`,
    pitfall:`Reading "it compiles" as "it works". Generated code resolves its dependencies with GetComponent or GameObject.Find in Start, against a scene nobody showed the model, so the first null shows up at runtime in a scene you did not open. A NullReferenceException in Unity kills one callback and lets the frame continue, so it can hide for days. Assert the wiring in a PlayMode test and fail on unexpected logs.`,
    map:`Unity's compiler plus the Test Framework is Godot's --check-only plus GUT, and LogAssert is a push_error the test can fail on.` } });
INTERVIEW('verifying-ai-output',{
  junior:[
    { q:`What does "fluent is not correct" mean in practice?`,
      a:`Output arrives confident, well structured and plausible regardless of whether it is right. Confidence is a property of the writing, not a signal about the content. So you check the claims against what you supplied, against the problem you stated, and against evidence, rather than against how finished it reads.`,
      follow:`What is the cheapest check you run on every output?`,
      red:`Says they can tell when it is wrong because it sounds off.` },
    { q:`You receive a fluent design proposal. What are the first three questions you ask?`,
      a:`What assumptions did you make, and which were given by me versus invented. What player behaviour would prove this wrong. Is this solving the problem I stated or a nearby easier one, quoting my problem back. Those three catch most of what matters before you spend any time on the detail.`,
      follow:`It answers all three cleanly. What do you check next?`,
      red:`Starts editing the proposal for tone and structure instead of interrogating it.` },
    { q:`It says "studies show" that players prefer something. What do you do?`,
      a:`Ask for the source and check it. Invented citations and plausible-sounding psychology are common and hard to spot in fluent prose. If there is no checkable source, treat the claim as a hypothesis about your players and test it, or drop it. Never let it into a document as established fact.`,
      follow:`The source exists but is about a different genre and platform. How much weight does it carry?`,
      red:`Accepts it because it matches intuition, or repeats it in a design document.` }
  ],
  mid:[
    { q:`How do you separate what the model was given from what it imported?`,
      a:`Ask it to mark every claim as given, inferred or invented, in a separate pass. Then spot-check: pick two claims that would change your decision and trace them back to your own input. Anything imported from elsewhere is a general prior about games, not a fact about yours, and should be labelled that way wherever it lands.`,
      follow:`It marks something as given that you never said. What does that change about how you use the rest?`,
      red:`Trusts the labelling without checking any of it.` },
    { q:`It solved a nearby, easier problem. How did you notice?`,
      a:`By restating your original problem and checking the output answers that one. The tell is usually that the proposal is coherent and the constraint you cared about has quietly gone missing, or the hard trade-off has been replaced with a version that has no trade-off. Quote your problem back in the verification prompt so the substitution becomes visible.`,
      follow:`Why do you think that substitution happens so often?`,
      red:`Accepts it because the answer is good, without noticing the question changed.` },
    { q:`Can the model verify itself?`,
      a:`Partly, and only with new information or a separate pass with fresh instructions. Asking for a self-critique in the same breath produces decoration. A separate pass that demands assumptions, sources, disproving behaviour and rejected alternatives is genuinely useful. It is not a substitute for you checking the claims that would change a decision.`,
      follow:`What can it never verify about its own output?`,
      red:`Either trusts self-verification completely or dismisses it as worthless.` }
  ],
  senior:[
    { q:`Design a verification step a busy team will actually run.`,
      a:`Make it short, specific and attached to an existing gate. Three questions on any output entering a document or the build: what did it assume, what would prove it wrong, what is the smallest test. Require a one-line note of what was checked, stored with the artifact. Anything longer gets skipped under pressure, which is worse than a short check.`,
      follow:`How do you tell whether the step is being run or performed?`,
      red:`Writes a nine-point checklist and mandates it, then has no way to tell if it is used.` },
    { q:`Walk me through an output you rejected.`,
      a:`Name what it proposed, what it assumed, and the specific check that failed: an invented claim, a constraint ignored, a problem substituted, or complexity that bought nothing. Say what you did instead. If you have never rejected one, that is itself the finding, because rejections should be about as common as acceptances.`,
      follow:`What did rejecting it cost you, and was it worth it?`,
      red:`Cannot recall rejecting anything, or describes rejecting output only because it was badly written.` }
  ] });

T('ai-evals',{ d:'ai', t:'Evals: testing the AI inside your pipeline', tag:'If a model writes your quest text or tags your playtests, it needs a test set, a rubric and a rerun on every change.',
  what:`An eval is a repeatable test of an AI step: a fixed set of inputs (the golden set), a description of good output (a rubric or reference answers), and a score you track per version. Games put models in pipelines: barks and item text, localisation drafts, level variations, playtest-note tagging, in-game character replies. Unlike code, the same step drifts when the model, the prompt or the context changes, and an eval turns "it seemed fine" into a number you can compare.`,
  why:[`Model upgrades and prompt tweaks change output silently. Without a fixed set, players find the regression first.`,`Writing a rubric forces the team to define quality for this game: tone, lore, length, safety.`,`Automated graders scale review, but only after they are checked against human judgement.`],
  think:{ q:[`What does good mean for this output, in terms two reviewers would apply the same way?`,`Which failures are unacceptable (lore breaks, slurs, spoilers, wrong item stats) and which are cosmetic?`,`Do the inputs cover the real spread, including the nasty edge cases?`,`Who labels the reference answers, and how often do they disagree?`],
    trade:[`A bigger golden set catches more and costs more to label and run.`,`Model judges are fast and cheap but biased toward length, position and their own answers; people are slow but anchor what good means.`],
    traps:[`Evaluating on the examples the prompt was tuned on.`,`A judge model grading its own outputs.`,`One average score hiding a rare catastrophic failure.`,`Skipping the rerun after "just a small prompt change".`],
    good:[`Every prompt, model or context change reruns the set, hard fails block the release, and the judge agrees with people on a spot check.`],
    bad:[`"We read a few outputs and they looked good."`] },
  how:[`Collect 50 to 200 real inputs across the spread, plus adversarial ones: player-written text with instructions in it, empty and very long fields, lore-adjacent names.`,`Write a rubric of three to six criteria and a list of hard fails.`,`Label a sample by hand with two people and measure how often they agree.`,`Automate what code can check first: length, required fields, banned terms, stat ranges, a JSON schema.`,`Add a model judge per criterion with the rubric and examples, then compare it against the human labels and fix it until it agrees about as well as the people do.`,`Rerun on every change, keep scores per version, and read the outputs that changed, not just the score.`],
  ai:{ yes:[`Generate candidate test inputs and edge cases.`,`Grade against a written rubric, after calibration.`,`Cluster failures and summarise what changed between two versions.`],
       no:[`Define what good means for your game.`,`Be the only grader of its own outputs.`,`Replace a person on hard-fail categories such as safety and rating-relevant content.`] },
  prompts:[{l:'Rubric grader',p:`You grade [OUTPUT TYPE] for [GAME]. Rubric: [CRITERIA, each with what scores 1, 2 and 3]. Hard fails: [LIST]. For the input and output below, score each criterion with one sentence of evidence quoted from the output, then list any hard fail. Return JSON {"scores":{...},"hard_fails":[...],"evidence":{...}}. Do not suggest improvements.`},
    {l:'Edge-case generator',p:`Here are ten real inputs to our [STEP]: [EXAMPLES]. Write thirty more that stress it: unusual lengths, missing fields, player text containing instructions, names close to our lore, and inputs that tempt a spoiler. Label each with the failure it probes.`}],
  verify:[`Did the judge agree with people on a held-out sample, and was the judge a different model from the generator?`,`Are hard fails checked in code where they can be, rather than by the judge?`,`Is the golden set separate from the examples used to write the prompt?`],
  test:[`Sample generated content into playtests and watch reactions: evals measure consistency, players measure whether it lands.`],
  rel:[['verifying-ai-output','Verification checks one output; evals check a pipeline over time.'],['ai-failure-modes','Known failure modes become eval criteria and hard fails.'],['metrics-and-success','An eval score is a metric with the same traps as any other.'],['ai-agentic-implementation','Agents that change a pipeline need the evals to catch what the tests miss.']] });
TECH('ai-evals',[
  {n:'Deterministic checks first', how:`Schema, length, required fields, banned terms and stat ranges, run before any model grader.`, fit:`Structured output: barks with tags, item stats, localisation with placeholders.`, cost:`Catches only what you can specify exactly.`, alt:`A model judge for tone and quality.`},
  {n:'Calibrated model judge', how:`One judge prompt per criterion with the rubric and examples; measure agreement with human labels before trusting it, and recheck when the judge model changes.`, fit:`Tone, lore consistency and readability at scale.`, cost:`Biased toward length, position and its own answers; recalibration on every judge upgrade.`, alt:`Pairwise comparison with the previous version.`},
  {n:'Pairwise regression review', how:`Show old and new outputs for the same input side by side; a person or a judge picks better, worse or same.`, fit:`Prompt and model upgrades.`, cost:`Says whether it improved, not whether it is good enough.`, alt:`Absolute rubric scores.`}
]);
ENGINE('ai-evals',{
  godot:{ term:`In Godot an eval is a data file and a headless runner: recorded outputs for the golden inputs live in a JSON file, and a SceneTree script run with godot --headless checks every hard rule and exits non-zero on a failure so CI can block the build.`,
    api:['extends SceneTree / _initialize()','godot --headless --script','FileAccess.get_file_as_string()','JSON.parse_string()','String.contains() / length()','SceneTree.quit(exit_code)'],
    snippet:`extends SceneTree                    # godot --headless --script res://evals/check_barks.gd
const BANNED := ["lorem", "as an ai"]

func _initialize() -> void:
\tvar cases: Array = JSON.parse_string(FileAccess.get_file_as_string("res://evals/barks.json")).cases
\tvar fails := 0
\tfor c in cases:
\t\tvar line: String = c.get("output", "")
\t\tvar bad := line.is_empty() or line.length() > 90
\t\tfor b in BANNED: bad = bad or line.to_lower().contains(b)
\t\tif bad:
\t\t\tfails += 1
\t\t\tprinterr("hard fail ", c.get("id"), ": ", line)
\tprint("cases %d, hard fails %d" % [cases.size(), fails])
\tquit(1 if fails > 0 else 0)`,
    pitfall:`Running the eval inside a normal play session and reading the console. The output is mixed with game logs, the process never exits with a failing code, and nothing stops a regressed prompt from shipping. Run it as a SceneTree script under --headless and quit with a non-zero code on any hard fail.`,
    map:`A SceneTree script under godot --headless is a Unity test or editor script under -batchmode; quit(1) is EditorApplication.Exit(1).` },
  unity:{ term:`In Unity the cleanest runner is an EditMode test over a golden file: recorded model outputs live in JSON, NUnit asserts the hard rules per case, and soft scores go to a report compared per version.`,
    api:['[TestCaseSource]','JsonUtility.FromJson<T>()','System.IO.File.ReadAllText()','Assert.That(..., Does.Not.Contain(...))','[System.Serializable] case classes','-batchmode -runTests -testPlatform EditMode'],
    snippet:`using System.IO; using NUnit.Framework; using UnityEngine;

public class BarkEvals {
    [System.Serializable] public class Case { public string id, output; }
    [System.Serializable] public class Set { public Case[] cases; }
    static Case[] Load() => JsonUtility.FromJson<Set>(
        File.ReadAllText("Assets/Evals/barks.json")).cases;

    [TestCaseSource(nameof(Load))]
    public void HardRules(Case c) {
        Assert.That(c.output, Is.Not.Empty, c.id);
        Assert.That(c.output.Length, Is.LessThanOrEqualTo(90), c.id);
        Assert.That(c.output.ToLower(), Does.Not.Contain("as an ai"), c.id);
    }
}`,
    pitfall:`Calling the live model inside the test. Results vary run to run, the suite fails on a network blip, and every CI run costs money. Record outputs once per prompt or model version with a separate batch tool, commit the recording, and let the test check it deterministically.`,
    map:`A [TestCaseSource] over a JSON golden file is the Godot SceneTree eval reading the same {"cases": [...]} file (JsonUtility cannot read a top-level array, so both use that shape); JsonUtility is JSON.parse_string.` } });
INTERVIEW('ai-evals',{
  junior:[
    { q:`What is a golden set?`,
      a:`A fixed set of real inputs, ideally with reference answers or expected properties, rerun on every change so results can be compared. It must include edge cases and must not be the examples the prompt was tuned on.`,
      follow:`Where do new cases come from after launch?`,
      red:`Whatever examples happen to be at hand each time.` },
    { q:`Why check hard rules in code before asking a judge model?`,
      a:`Code checks are exact, free and never drift, so length, schema, banned terms and placeholders belong there. The judge is for what code cannot specify, such as tone.`,
      follow:`Name a hard rule for generated item descriptions.`,
      red:`Sends everything to the judge because it is simpler.` }
  ],
  mid:[
    { q:`How do you know your model judge can be trusted?`,
      a:`Two people label a sample and I measure how often they agree; then I compare the judge with those labels and fix the rubric or the judge until it agrees about as well as the people do. I use a different model from the generator, watch for length and position bias, and recalibrate when the judge model changes.`,
      follow:`The judge and the people disagree on one criterion only. What do you do?`,
      red:`Trusts it because it is a strong model.` },
    { q:`A model upgrade raises the average score but players complain. What happened?`,
      a:`Averages hide the tail. I would look at hard-fail counts and the worst cases, check whether the rubric misses what players care about (voice, humour, repetition), compare old and new outputs side by side, and add the complaint as a criterion and as eval cases.`,
      follow:`How do you stop that happening on the next upgrade?`,
      red:`Tells players the new model scores higher.` },
    { q:`How big should the eval set be?`,
      a:`Big enough to cover the spread of real inputs and every known failure, often 50 to 200 to start, growing with every bug found. A small hard-fail suite runs on every change and the fuller set before release.`,
      follow:`What does one full run cost you, in time and money?`,
      red:`A fixed number with no link to input coverage.` }
  ],
  senior:[
    { q:`Design an eval for AI-drafted localisation.`,
      a:`A golden set per language with reviewed human translations; code checks for preserved placeholders, UI length limits, glossary terms and untranslated strings; a judge for fluency and tone calibrated with native reviewers; hard fails on broken placeholders and offensive terms; a regression run per model version; and human LQA sampling before release.`,
      follow:`Which languages would you trust least, and why?`,
      red:`Machine translation checked by the same model.` },
    { q:`Where do evals sit in your release process?`,
      a:`As a gate beside the tests. Any prompt, model or context change runs them in CI; hard fails block; score changes are reviewed by an owner; results are stored per version; and samples from production feed new cases.`,
      follow:`Who owns an eval nobody wants to update?`,
      red:`Run by hand before big releases only.` }
  ] });

T('ai-failure-modes',{ d:'ai', t:'When AI makes your game worse', tag:'Generic design, feature inflation, false confidence, content spam, documentation theater. Each has a symptom, a cause, a detector and a fix.',
  what:`The characteristic ways AI collaboration degrades a game: generic design, feature inflation, overengineering, false confidence, hallucinated best practices, optimizing the wrong metric, copying genre conventions, excessive complexity, premature implementation, content spam, documentation theater, analysis paralysis, endless iteration without player evidence, treating AI output as authority. The full interactive catalogue with symptom, cause, detector and correction is in the AI Workflow view.`,
  why:[`These failures are systematic, not random: they follow from AI's strengths (fluency, volume, plausibility) meeting human weaknesses (deference, impatience, fear of deciding).`,`They are detectable early if you know the symptoms.`,`Each has a specific correction that is not "use AI less" but "use it differently".`],
  think:{ q:[`Is this output distinctive, or could it describe any game in the genre?`,`Did the feature list grow this week? Did the loop improve?`,`When did a player last touch the build?`,`Am I accepting this because it is right, or because it is done?`],
    trade:[`Guarding against every failure mode slows you down. The fix is cadence (regular playtests) rather than paranoia.`],
    traps:[`Blaming the tool for a workflow failure.`,`Fixing content spam by generating "better" content instead of validating the system.`],
    good:[`The team names failure modes when they see them.`],
    bad:[`The game is bigger every week and nobody can say why it is better.`] },
  how:[`Read the catalogue. Pick the three you are most prone to.`,`Add a detector for each to your weekly review (feature count, playtest count, distinctiveness check).`,`When detected, apply the correction from the catalogue and record it.`],
  ai:{ yes:[`Audit its own recent outputs for the failure modes when asked.`,`Compute detectors (feature growth, iteration count without tests) from your logs.`],
       no:[`Be the judge of whether the game is better. Players are.`] },
  prompts:[{l:'Self-audit',p:`Review the design proposals you produced in this conversation. For each, check: could it describe any game in the genre (generic)? Does it add rules without adding decisions (inflation)? Does it assert best practices without sources (hallucination)? Does it propose building before testing (premature implementation)? Does it generate content for an unvalidated system (spam)? Report honestly and propose the correction for each hit.`}],
  verify:[`Did the self-audit find anything? If it found nothing, be suspicious.`],
  test:[`The corrections all end in a playtest. Did one happen?`],
  rel:[['bottleneck-shift','Failure modes are the bottleneck shift ignored.'],['verifying-ai-output','Verification catches them.'],['scope-control','Inflation and spam are scope failures.'],['ai-failures-view','The interactive catalogue is in the AI Workflow view.']] });
TECH('ai-failure-modes',[
  {n:'Weekly detectors', how:`Run cheap counters that expose drift: features built vs playtests run, days since a real player touched the build.`, fit:`Catching volume-over-quality and deference early.`, cost:`Needs to be part of the weekly routine.`, alt:`Make each detector a question you can answer in a minute.`},
  {n:'Generate-alternatives pass', how:`When options converge on the genre average, ask for mechanically distinct alternatives under the constraints.`, fit:`Breaking out of AI's central-tendency output.`, cost:`More options to judge. That judgment is the work.`, alt:`Reject the average explicitly in the prompt.`},
  {n:'Evidence gate', how:`No significant design commitment without player evidence. AI output never counts as evidence.`, fit:`Preventing confident AI text from substituting for testing.`, cost:`Slows commitment. That is the point.`, alt:`Turn decisions into hypotheses with a kill criterion.`}
]);
ENGINE('ai-failure-modes',{
  godot:{ term:`Content spam is a number here, not a feeling. A Godot export preset packs every resource in the project by default, so generated files that nothing references are still download size. A headless audit that walks res:// and compares it with what the scenes actually reference is the detector.`,
    api:['Export preset Export Mode: all resources vs selected scenes','DirAccess.get_files_at()','ResourceLoader.get_dependencies()','String.get_slice()','godot --headless -s res://tools/audit.gd','push_warning()'],
    snippet:`extends SceneTree                  # godot --headless -s res://tools/audit.gd

func _initialize() -> void:
\tvar reachable := {}
\tfor scene in DirAccess.get_files_at("res://levels"):
\t\tfor dep in ResourceLoader.get_dependencies("res://levels/" + scene):
\t\t\treachable[dep.get_slice("::", 2)] = true
\tvar orphans := 0
\tfor f in DirAccess.get_files_at("res://content"):
\t\tif not reachable.has("res://content/" + f):
\t\t\torphans += 1
\tprint("%d generated files no level references, all of them still exported" % orphans)
\tquit()`,
    pitfall:`The default export mode packs the whole project, not the dependency graph. A thousand generated .tres files that nothing loads still ship, still cost install size, and never appear as a code problem or a compile warning. Switch the preset to selected scenes with explicit filters, or run the orphan count on a cadence, because content spam is invisible until someone looks at the package.`,
    map:`Godot's export-all default is Unity's Resources folder rule applied to the whole project, and ResourceLoader.get_dependencies is AssetDatabase.GetDependencies.` },
  unity:{ term:`Unity has the opposite default: only what a build scene, a Resources folder or an Addressables group reaches gets built. So generated spam costs import time and domain reloads rather than install size, and the exception is anything sitting in a Resources folder.`,
    api:['AssetDatabase.FindAssets() / GetDependencies()','EditorBuildSettings.scenes','Resources folders (everything inside ships)','Addressables groups and analyze rules','BuildReport.packedAssets','Debug.Log'],
    snippet:`public static class SpamAudit {                  // Assets/Editor/SpamAudit.cs
    [MenuItem("Design/Audit generated content")]
    static void Run() {
        var all = AssetDatabase.FindAssets("t:ScriptableObject", new[] { "Assets/Content" });
        var used = new HashSet<string>();
        foreach (var s in EditorBuildSettings.scenes)
            used.UnionWith(AssetDatabase.GetDependencies(s.path, true));
        int orphans = all.Count(g => !used.Contains(AssetDatabase.GUIDToAssetPath(g)));
        int inResources = all.Count(g =>
            AssetDatabase.GUIDToAssetPath(g).Contains("/Resources/"));
        Debug.Log($"{all.Length} generated, {orphans} unreachable, {inResources} in Resources");
    }
}`,
    pitfall:`A Resources folder ships everything inside it and is loaded by string at runtime, so no dependency scan can see the link. Generated content dropped there ships in full and is invisible to every orphan audit you write, while also lengthening every build. Keep generated assets out of Resources and reference them directly or through Addressables, so unused content is provably absent.`,
    map:`Unity's build-what-is-referenced rule is Godot's selected-scenes export mode, and a Resources folder is Godot's export-all default applied to one directory.` } });
INTERVIEW('ai-failure-modes',{
  junior:[
    { q:`Name three ways AI collaboration makes a game worse, and how you would spot each.`,
      a:`Generic design, spotted by asking whether the output could describe any game in the genre. Feature inflation, spotted by a rising feature count with a flat loop. Content spam, spotted by content produced for a system nobody validated. Each has a detector you can run weekly, which is the point of naming them.`,
      follow:`Which of those three is your team most prone to right now?`,
      red:`Answers with "hallucinations" and nothing else, with no detector attached.` },
    { q:`What does content spam look like in a build?`,
      a:`Many items, enemies or quests that exercise the same decision. Variety in numbers and names, none in what the player considers doing. The cause is generating content before the system was validated. The fix is to validate the system and cut, not to generate better-written content.`,
      follow:`How would you measure whether two items are actually different?`,
      red:`Judges it by whether the content is well written rather than by the decisions it creates.` },
    { q:`What is false confidence, and why is it hard to spot?`,
      a:`It is the team believing a design is settled because the artifact describing it is polished and complete. It is hard to spot because the artifact looks like the output of a decision process rather than of a generation process. The check is to ask what evidence supports it and when a player last touched anything related.`,
      follow:`Where does false confidence usually first show up on a project?`,
      red:`Describes it as the model being overconfident, missing that the failure is in the team's belief.` }
  ],
  mid:[
    { q:`Your feature count grew this quarter and the loop did not improve. What detector would have caught it earlier?`,
      a:`A weekly count of features added against prototypes run and playtests held. The ratio is the signal: production rising while evidence stays flat is inflation. Add a distinctiveness check on new content and a date for the last player contact. Three numbers, reviewed in five minutes.`,
      follow:`Who owns those numbers, and what happens when the ratio goes the wrong way?`,
      red:`Proposes a stricter approval process rather than a measurement.` },
    { q:`How do you fix generic design without simply using AI less?`,
      a:`Fix the input. Generic output comes from missing intent, evidence and constraints, so supply your actual player, your actual loop and what you have already learned, and ask for options that would be wrong for a neighbouring game. Then judge against your pillars. The correction is to use it differently, with a human doing the framing and the selection.`,
      follow:`The output is still generic after all that. What is your next move?`,
      red:`Concludes the tool cannot help with design and stops there.` },
    { q:`Documentation theatre: symptom and fix.`,
      a:`Symptom is a growing set of polished documents nobody reads, that disagree with each other and with the build. Cause is cheap generation meeting no reader. Fix is to write documents against a reader and a decision, retire anything that is no longer true, and keep a decision log instead of a description archive.`,
      follow:`How do you tell a useful living document from theatre?`,
      red:`Responds by improving the document templates.` }
  ],
  senior:[
    { q:`You want detectors in the weekly review. Which three numbers do you track?`,
      a:`Playtests run since last week, features added since last week, and days since a player outside the team touched the build. Optionally a distinctiveness spot-check on one new piece of content. Pair each number with the decision it triggers, otherwise it becomes a dashboard nobody acts on.`,
      follow:`One number stays bad for a month. What do you change?`,
      red:`Lists metrics with no trigger attached, or proposes a quality score with no definition.` },
    { q:`A senior colleague treats AI output as authority in design discussions. How do you handle it?`,
      a:`Do not argue about the tool. Move the discussion to evidence: what does this assume, what would disprove it, what is the smallest test, and when did a player last touch it. Then run that test. Being right in the room is worth less than making the team's decisions answer to players.`,
      follow:`The test is expensive and they want to ship now. What do you do?`,
      red:`Makes it a credibility contest, or defers because of seniority.` }
  ] });

T('responsibility-matrix',{ d:'ai', t:'Human vs AI responsibility', tag:'Primary, assist, shared. Decide who owns each task before the work starts, not after the output arrives.',
  what:`A matrix assigning each design task to a primary owner: human (identity, fun judgment, tradeoffs, what not to build), AI (alternatives, prototypes, content variations, data analysis), or shared (complexity analysis, playtest interpretation). The interactive matrix is in the AI Workflow view. The AI Delegation Planner lets you assign your own tasks.`,
  why:[`Ownership decided in advance prevents drift: without it, whoever produces the artifact owns the decision by default, and that is usually the AI.`,`The matrix makes "AI should not decide this" a rule rather than a feeling.`,`It also makes delegation safe: tasks marked AI-primary can be delegated confidently.`],
  think:{ q:[`Who owns this task? If I cannot say, I am about to let the output decide.`,`Is this a judgment (human), a production (AI), or an analysis (shared)?`,`Does this task require player evidence before anyone can own it?`],
    trade:[`Strict ownership is clear and can waste AI's ability to contribute to judgment tasks as an assistant.`],
    traps:[`Marking everything shared.`,`Letting AI-primary tasks quietly include decisions (a prototype that embeds a design choice nobody made).`],
    good:[`Every task in the plan has an owner and the decisions embedded in AI work are surfaced.`],
    bad:[`The design document was written by AI and nobody remembers deciding its contents.`] },
  how:[`For each task, use the AI Delegation Planner: Human, AI, Human + AI, or Player evidence required.`,`For AI-primary tasks, list the decisions embedded in the work and route them to a human.`,`Review the plan weekly. Ownership drifts.`],
  ai:{ yes:[`Suggest ownership for tasks based on the matrix, and flag hidden decisions in AI-primary work.`],
       no:[`Assign itself judgment tasks.`] },
  prompts:[{l:'Hidden decisions',p:`You are about to [TASK]. Before you do, list every design decision that doing this task will embed (defaults, structures, numbers, exclusions). For each, state the options and which you would pick and why, then stop and let me choose before you proceed.`}],
  verify:[`Did the AI surface the decisions embedded in its work, or make them silently?`],
  test:[`Not testable with players. Testable by audit of who decided what.`],
  rel:[['bottleneck-shift','The matrix is the bottleneck shift made explicit.'],['ai-roles','Roles are the AI side of the matrix.'],['matrix-view','The interactive matrix is in the AI Workflow view.']] });
TECH('responsibility-matrix',[
  {n:'Ownership assignment', how:`For each task, assign Human, AI, Human + AI, or Player evidence required before work starts.`, fit:`Making ownership explicit and preventing silent delegation of judgment.`, cost:`Needs review as tasks change.`, alt:`Use the Delegation Planner tool.`},
  {n:'Decision vs production split', how:`Judgment, taste and tradeoffs stay human. Volume, simulation and production go to AI.`, fit:`Deciding what may be delegated at all.`, cost:`The line moves with capability. Revisit it.`, alt:`Default judgment to humans. Delegate production.`}
]);
ENGINE('responsibility-matrix',{
  godot:{ term:`Two places carry the decisions embedded in generated work: the @export defaults the script chose, and anything it writes into ProjectSettings. The first is reviewable in a diff. The second must simply be off limits to code.`,
    api:['@export defaults vs values stored in the .tscn','ProjectSettings.set_setting() / ProjectSettings.save()','project.godot (text, in version control)','assert(condition, "why")','Engine.is_editor_hint()','@export_group'],
    snippet:`extends CharacterBody2D
# AI-primary: the movement code below. Human-primary: every number.

@export var move_speed := 320.0    # chosen 03-11, playtest 14
@export var dash_cost := 25.0      # chosen 03-11, playtest 14
@export var i_frames := 0.0        # OPEN: nobody has decided this yet

func _ready() -> void:
\t# never from code. Physics tick is a project-wide design decision:
\t# ProjectSettings.set_setting("physics/common/physics_ticks_per_second", 30)
\tassert(i_frames > 0.0, "i_frames is still an unowned generated default")`,
    pitfall:`A generated @tool script that calls ProjectSettings.set_setting() rewrites project.godot for the whole team. Physics tick rate, input map entries and the renderer are project-wide decisions, and a script can change them between two pulls with no review. Keep settings writes out of code entirely and read the project.godot diff like any other design change.`,
    map:`Godot @export defaults are Unity [SerializeField] defaults, and project.godot is Unity's ProjectSettings folder.` },
  unity:{ term:`Unity serializes by field name, so the human's tuning only survives as long as the names the generated script picked. The matrix has a mechanical consequence: a rename in AI-owned code destroys human-owned values unless it is declared.`,
    api:['[SerializeField] private fields','[FormerlySerializedAs("oldName")]','OnValidate()','PrefabUtility.GetPropertyModifications()','[Tooltip] / [Header]','Debug.LogWarning(message, context)'],
    snippet:`public class DashMove : MonoBehaviour {
    // AI-primary: the movement code below. Human-primary: every number.
    [SerializeField] float moveSpeed = 6f;           // chosen 03-11, playtest 14
    [FormerlySerializedAs("dashCostStamina")]        // renamed, tuning preserved
    [SerializeField] float dashCost = 25f;           // chosen 03-11, playtest 14
    [SerializeField] float iFrames;                  // OPEN: nobody decided this

    void OnValidate() {
        if (iFrames <= 0f)
            Debug.LogWarning($"{name}: iFrames is an unowned generated default", this);
    }
}`,
    pitfall:`Regenerating a script and letting it rename or retype a serialized field drops every value a designer tuned, on every prefab and every scene, with no error anywhere. The balance pass silently reverts to the generated defaults. Put [FormerlySerializedAs] on any rename, and diff a prefab's YAML after a regeneration instead of trusting what the Inspector shows.`,
    map:`Unity's name-based serialization is Godot's .tscn storing @export values by property name, and Godot has no [FormerlySerializedAs], so a rename there costs the value outright.` } });
INTERVIEW('responsibility-matrix',{
  junior:[
    { q:`Which design tasks should a human always own?`,
      a:`The game's identity, what the player should feel, which trade-off matters most, whether a mechanic deserves to exist, and what not to build. Those are judgments with accountability attached. Production tasks, analysis and exploration can be delegated. The test is whether the task ends in a decision or in an artifact.`,
      follow:`Where is the genuinely shared middle?`,
      red:`Answers "everything important", with no working split.` },
    { q:`What is a hidden decision in AI-primary work?`,
      a:`A design choice embedded in something delivered as production: a default number, a data structure, an exclusion, an ordering. Nobody chose it, and once it is in the build it becomes the way things are. The habit is to ask, before the work, what decisions doing it will embed, and route those to a person.`,
      follow:`Give me a hidden decision you have actually caught.`,
      red:`Thinks of AI-primary work as decision-free because it is just implementation.` },
    { q:`Is AI-primary the same as unreviewed?`,
      a:`No. It means the assistant does the work and a human owns the outcome. Review still applies, and for code it is the normal review discipline plus attention to the defaults. Primary is about who produces, not about who is accountable.`,
      follow:`What does your review look for that ordinary code review would not?`,
      red:`Treats AI-primary as work that ships without anyone reading it.` }
  ],
  mid:[
    { q:`How do you assign ownership before the work rather than after?`,
      a:`Walk the task list and mark each as human, AI, shared, or blocked on player evidence. For AI-primary tasks, list the decisions the work will embed and name the human who resolves each. Do it at planning, because after the output arrives whoever produced the artifact owns the decision by default.`,
      follow:`Ownership drifts over a project. How do you catch that?`,
      red:`Assigns ownership when a disagreement appears, which is always too late.` },
    { q:`Everything on your team's matrix is marked shared. What is wrong?`,
      a:`Shared everywhere means nobody owns anything, and the artifact decides. Force a primary owner per task and use shared only where two parties genuinely contribute different things, such as playtest interpretation. If a task cannot get a single owner, the task is probably two tasks.`,
      follow:`Which tasks are legitimately shared?`,
      red:`Defends it as collaborative culture.` },
    { q:`A prototype shipped with a design choice nobody made. How do you catch that next time?`,
      a:`Add a step to the brief: before writing code, list the defaults, structures, numbers and exclusions the build will embed, and wait for the choices. Then review the build against that list. The cost is one extra round trip and it is far cheaper than discovering the choice after it has been tuned for a month.`,
      follow:`The list comes back with thirty items. How do you keep this practical?`,
      red:`Plans to catch it in review, with no mechanism for surfacing choices that look like implementation.` }
  ],
  senior:[
    { q:`The design document was written by an assistant and nobody remembers deciding its contents. Fix the process.`,
      a:`Separate recording from deciding. Documents record decisions that were made somewhere else, so require each significant claim to trace to a decision with an owner and a date. Run one pass to mark every claim as decided, assumed or invented, then hold a short session that actually decides the assumed ones. Keep a decision log from then on.`,
      follow:`Half the claims turn out to be assumptions nobody wants to own. What do you do?`,
      red:`Rewrites the document more carefully without changing who decides.` },
    { q:`How do you audit who decided what?`,
      a:`Pick three consequential things in the current build, and trace each back: who decided, when, on what evidence, and where it was recorded. Gaps are your audit result. Do it quarterly and keep it short. The purpose is to catch drift early, not to assign blame for it.`,
      follow:`You find that a third of them trace to nobody. What is your first move?`,
      red:`Proposes a tracking tool instead of an actual trace of real decisions.` }
  ] });

T('ai-for-implementation',{ d:'ai', t:'AI for prototyping and implementation', tag:'The strongest use of AI: build the experiment fast, expose the knobs, log everything, throw it away.',
  what:`Using AI to write prototype and production code, tools, simulations and generators. The best results come from precise briefs (what to build, what to expose, what to log, what not to include), from insisting on instrumentation, and from treating prototypes as disposable. Production code needs the same review discipline as any code plus attention to the design decisions embedded in defaults.`,
  why:[`This is where AI most reliably saves time: prototypes in hours, simulations in minutes, tooling on demand.`,`Instrumented prototypes turn playtests into data.`,`Speed here is only valuable if it feeds more tests and more judgment, not more features.`],
  think:{ q:[`What question does this build answer? What must it log to answer it?`,`Which tuning values should be live so I can iterate during the test?`,`What must NOT be in this build? (Menus, saves, art, progression, unless the question needs them.)`,`What design decisions is the code making by default? Do I agree?`],
    trade:[`Fast builds encourage testing and encourage keeping code that should be thrown away.`],
    traps:[`Prototypes that become the codebase.`,`Builds without logging, so the test yields only opinions.`,`Accepting the AI's defaults (numbers, structures) as design decisions.`],
    good:[`A new prototype every few days, each with a hypothesis and logs.`],
    bad:[`One big build that keeps growing.`] },
  how:[`Write the brief: hypothesis, the minimal build, exposed tuning values, logged events, exclusions, and export format.`,`Ask for the embedded decisions before the build.`,`Run the test. Analyze the logs (AI can help).`,`Throw the prototype away or explicitly promote it with a refactor plan.`],
  ai:{ yes:[`Build prototypes, tools, simulations, generators, analysis scripts. Refactor promoted prototypes. Write tests.`],
       no:[`Decide what the prototype is for.`,`Choose defaults that are actually design decisions without surfacing them.`] },
  prompts:[{l:'Instrumented prototype brief',p:`Build a prototype in [ENGINE/HTML] that tests: [HYPOTHESIS]. Include only: [MECHANICS]. Exclude menus, saves, progression and art beyond shapes. Expose these values as live sliders: [VALUES]. Log with timestamps: every player input, every decision point and the option chosen, every failure and its cause, session start and end. Export logs as CSV. Before writing code, list the design decisions the code will embed (defaults, structures) and wait for my choices.`},
    {l:'Simulation',p:`Write a simulation of [SYSTEM] with these rules and numbers: [SPEC]. Model three player strategies: [STRATEGIES]. Run [N] iterations each and report: outcome distributions, the strategy that dominates and at what point, resource curves, and any runaway loop. Then vary [PARAMETER] across [RANGE] and report where the dominant strategy changes. Show me the assumptions the simulation makes about player behavior.`}],
  verify:[`Did it include anything not needed? Did it log what the hypothesis needs?`,`Which defaults did it choose, and would I have?`,`Does the simulation's player model resemble real players, or an optimizer?`],
  test:[`The prototype is the test. Did the logs answer the question?`],
  rel:[['prototyping','What prototypes are for.'],['procedural-content','Generators are implementation work.'],['economy-and-resources','Simulation is the main tool for economies.'],['responsibility-matrix','Prototype is AI-primary with human-owned decisions.'],['ai-agentic-implementation','The same discipline when an agent edits the code and runs the checks itself.']] });
TECH('ai-for-implementation',[
  {n:'Precise brief template', how:`Hypothesis, minimal build, exposed tuning values, logged events, exclusions, export format, before any code.`, fit:`Getting a useful prototype instead of a surprise.`, cost:`Writing the brief is real work. Skipping it is more expensive.`, alt:`Ask for the embedded decisions before the build.`},
  {n:'Instrumentation-first', how:`Insist on exposed sliders and event logging so the prototype can answer its question.`, fit:`Turning a prototype into evidence.`, cost:`Small extra build time.`, alt:`Log inputs, decisions, failures with timestamps. Export CSV.`},
  {n:'Throwaway discipline', how:`Treat prototypes as disposable. Promote only with an explicit refactor plan.`, fit:`Avoiding accumulated unowned code.`, cost:`Tempting to ship the prototype. Usually a mistake.`, alt:`Decide the promotion explicitly, with review.`}
]);
ENGINE('ai-for-implementation',{
  godot:{ term:`A prototype that is easy to delete is one that owns nothing. One folder, one scene, the knobs as @export_range on the root, one signal the harness listens to, and no entry in Project Settings.`,
    api:['@export_group / @export_range','signal / emit()','Engine.time_scale','Node._physics_process(delta)','Project Settings > Autoload (what not to add to)','preload() vs load()'],
    snippet:`extends Node2D                     # res://proto/economy/economy.tscn
signal logged(event: String, value: float)     # the only way data leaves

@export_group("Under test")
@export_range(0.0, 5.0) var gold_per_kill := 1.0
@export_range(1.0, 60.0) var upgrade_cost := 12.0
@export_range(0.1, 8.0) var sim_speed := 1.0
var _gold := 0.0

func on_kill() -> void:
\t_gold += gold_per_kill
\tEngine.time_scale = sim_speed
\tlogged.emit("gold", _gold)
\tif _gold >= upgrade_cost:
\t\tlogged.emit("upgrade", _gold)`,
    pitfall:`Letting the prototype become an autoload. A generated manager registered in Project Settings > Autoload is loaded into every scene in the project, and within a week three real systems call into it. The disposable build is now load-bearing and throwing it away has become a refactor. Keep a prototype inside its own scene and its own folder, owning nothing global.`,
    map:`Godot autoloads are Unity's DontDestroyOnLoad singletons, a signal is a UnityEvent, and Engine.time_scale is Time.timeScale.` },
  unity:{ term:`The instrumented build still has to be fast enough that its own numbers mean something. Knobs go on a ScriptableObject, one UnityEvent carries the logged moments, and the logging path stays out of Update.`,
    api:['[SerializeField] ScriptableObject config','UnityEvent<string, float>','StringBuilder','Time.timeScale','Application.SetStackTraceLogType()','Profiler.BeginSample() / EndSample()'],
    snippet:`public class EconomyProto : MonoBehaviour {
    [SerializeField] EconomyTuning t;                // knobs live on the asset
    public UnityEvent<string, float> Logged;         // the only way data leaves
    readonly StringBuilder line = new StringBuilder();
    float gold;

    public void OnKill() {
        gold += t.goldPerKill;
        Time.timeScale = t.simSpeed;
        line.Clear();
        line.Append("gold ").Append(gold);           // no concat in the hot path
        Logged.Invoke("gold", gold);
        if (gold >= t.upgradeCost) Logged.Invoke("upgrade", gold);
    }
}`,
    pitfall:`Instrumenting with string concatenation and Debug.Log inside Update. Every call allocates a string, captures a stack trace and writes to the player log, so a prototype built to measure timing is mostly measuring its own logging. Buffer with a StringBuilder, log on events instead of per frame, and call Application.SetStackTraceLogType to drop stack traces for Log.`,
    map:`Unity's UnityEvent is a Godot signal, a ScriptableObject config asset is a .tres, and Time.timeScale is Engine.time_scale.` } });
INTERVIEW('ai-for-implementation',{
  junior:[
    { q:`What is in the brief for an instrumented prototype?`,
      a:`The hypothesis, the minimal set of mechanics to include, the exclusions, the tuning values to expose live, the events to log with timestamps, and the export format. Plus an instruction to list the design decisions the code will embed before writing any of it. Those seven items are the difference between a test and a build.`,
      follow:`Which of those do people forget most often?`,
      red:`Describes the feature to build and nothing about logging, exclusions or exposed values.` },
    { q:`Why does the brief include exclusions?`,
      a:`Because the default behaviour is to make it complete: menus, saves, progression, art. Every one of those costs time and none answers the question, and some actively distort the test by making it feel like a game rather than an experiment. Naming the exclusions is how the prototype stays a prototype.`,
      follow:`Which exclusion would you break for a test about session structure?`,
      red:`Assumes a prototype should be reasonably complete so testers take it seriously.` },
    { q:`Which tuning values do you expose as live controls?`,
      a:`The two or three the team will argue about during the session: the ones the hypothesis is sensitive to. Exposing everything creates a control panel nobody uses and hides which values matter. Expose them live so you can adjust between testers and see the boundary rather than one point.`,
      follow:`You changed a value mid-session. How do you keep the data usable?`,
      red:`Exposes every constant as a slider, or exposes none and rebuilds between testers.` }
  ],
  mid:[
    { q:`What do you log so the playtest produces data rather than opinions?`,
      a:`Every input, every decision point with the option chosen, every failure with its cause, session start and end, all timestamped, exported to something readable the same day. Log the state around the decision, not just the decision, because a choice without its context cannot be interpreted later.`,
      follow:`What do you log that you almost never end up using, and would you keep it?`,
      red:`Logs aggregate outcomes only, so nothing can be traced back to a moment in the session.` },
    { q:`The assistant chose numbers and structures. How do you handle defaults?`,
      a:`Ask for them up front as a list of embedded decisions, and pick the ones that matter. After the build, read the constants and the data shapes and ask which of them the design depends on. A default that survives into production silently becomes a design decision that nobody made.`,
      follow:`A default turns out to be better than your choice. What do you do?`,
      red:`Accepts the defaults because the prototype works, then tunes around them for months.` },
    { q:`When do you promote a prototype instead of throwing it away?`,
      a:`When the behaviour is validated, the code is structurally close to what production needs, and you can name what has to be rewritten. Promotion is an explicit decision with a plan and a budget, not a default. If you cannot name the rewrite, you are keeping it because it works today, which is how prototype code becomes the codebase.`,
      follow:`What do you do when it is validated and the code is genuinely bad?`,
      red:`Promotes whatever works to save time, with no rewrite plan.` }
  ],
  senior:[
    { q:`How do you keep prototype code out of the production codebase?`,
      a:`Make the boundary structural rather than cultural: separate the project or the module, no shared dependency path, and an explicit promotion step with review. Then remove the incentive by making the real path fast, with good tooling and templates. Teams smuggle prototype code in when the proper route is slow.`,
      follow:`Something already got in. How do you deal with it?`,
      red:`Relies on a rule that everyone agrees with and nobody follows under deadline.` },
    { q:`You want an economy simulated. What do you ask for, and what do you distrust?`,
      a:`Ask for the rules and numbers as given, three named player strategies, many iterations each, outcome distributions, the dominating strategy and where it takes over, resource curves, and any runaway loop. Then ask what the simulation assumed about player behaviour. Distrust that model most, because simulated players optimise and real players satisfice, misread and get bored.`,
      follow:`The simulation says the economy is balanced and playtests say it is not. Which do you believe?`,
      red:`Takes the simulation output as a balance verdict and tunes the live game from it.` }
  ] });

T('ai-agentic-implementation',{ d:'ai', t:'Agents that build: tasks, checks and reviewed diffs', tag:'A coding agent is only as good as the check it can run and the diff you actually read.',
  what:`Coding agents read the repository, edit files, run the build and the tests, and keep going until a check passes. That changes the unit of work from a prompt to a task: a goal, a scope, a command that proves it done, and a human review of the diff that comes back. Game projects add scenes, prefabs and binary assets an agent cannot review for you, and editor bridges (an MCP server for the engine editor, for example) that let it read the scene tree, run play mode and capture logs and screenshots.`,
  why:[`The bottleneck moves from writing code to specifying and verifying it. A task without a runnable check produces plausible code that is wrong in play.`,`Agents act: they change files, run commands and can delete. Scope and permissions are a design decision, not a default.`,`Throughput tempts a team to accept more code than it can review, and unreviewed diffs become debt nobody owns.`],
  think:{ q:[`What command will prove this task done, and can the agent run it without the editor window?`,`What must the agent not touch: scenes, project settings, the save format, lockfiles?`,`How big a diff can I review properly, and which lines need a human eye?`,`What does the agent need every session: conventions, commands, a do-not-touch list, one worked example?`],
    trade:[`Bigger tasks save your time and cost you review depth.`,`Letting the agent run commands speeds iteration and widens what one mistake can break.`],
    traps:[`Accepting "all tests pass" when the agent wrote the tests to match its own code.`,`Letting the agent edit scene or prefab text and merging a diff nobody can read.`,`Several agents sharing one working tree and overwriting each other.`,`No project instructions file, so every session re-guesses the conventions.`],
    good:[`Tasks sized to a diff you can read in fifteen minutes, each with a command that fails before the change and passes after it.`],
    bad:[`A day of agent output merged because the build is green.`] },
  how:[`Write the task: goal, files in scope, files out of scope, the acceptance command, and what done means for the player.`,`Keep a short, versioned instructions file the agent reads every session: build and test commands, naming, folders, and a do-not-touch list.`,`Make the check headless: Godot tests run under godot --headless (import the project first with godot --headless --import; gdUnit4 also needs --ignoreHeadlessMode), Unity tests with -batchmode -runTests.`,`Watch the check fail before the change. A check that never failed proves nothing.`,`Review the diff, not the transcript: read every changed line of gameplay logic, skim generated boilerplate, and look for files outside the scope.`,`Give each parallel agent its own branch or worktree, and merge through the same review and checks as people.`,`Play the change. Green checks prove the mechanism; a player proves the experience.`],
  ai:{ yes:[`Implement a specified change end to end and iterate against the check.`,`Write the failing test first from your acceptance criteria, then make it pass.`,`Refactor with the existing tests pinned.`,`Build editor tools and one-off scripts, and summarise failing logs.`],
       no:[`Decide what done means for the player.`,`Approve its own work: tests it wrote, screenshots it judged.`,`Edit scene and prefab files you cannot review.`,`Run with production credentials, deploy rights or access to player data.`] },
  prompts:[{l:'Agent task brief',p:`Task: [GOAL]. In scope: [FILES OR FOLDERS]. Out of scope, do not edit: [PATHS]. Acceptance: this command must fail before your change and pass after it: [COMMAND]. Follow [INSTRUCTIONS FILE]; add no dependencies; keep the diff under [N] lines. First run the command and show me the failure. Then give a five-bullet plan and wait for my go. Implement, run the command again, and summarise the diff file by file, marking anything you are unsure of.`},
    {l:'Diff review',p:`Here is a diff an agent produced for [TASK]: [DIFF]. Review it as a skeptical senior engineer. List behaviour changes nobody asked for, tests that assert the implementation instead of the requirement, edits outside [SCOPE], and anything that touches save data, networking, input or economy. Rank by risk. Do not rewrite the code.`}],
  verify:[`Did you see the acceptance check fail before and pass after, yourself?`,`Do new tests assert player-visible behaviour, or restate the implementation?`,`Did anything outside the scope change: project settings, scenes, lockfiles, build scripts?`],
  test:[`Play the build after every agent task that touches gameplay: the check proves the rule, a player proves the feel.`,`Watch for regressions in systems the task never mentioned.`],
  rel:[['ai-for-implementation','The brief discipline, scaled up to an agent that edits and runs code.'],['verifying-ai-output','Reviewing an agent diff is verification with a larger surface.'],['quality-and-build-health','Headless checks are the build health an agent can use.'],['ai-evals','When an agent is part of a pipeline, evals keep its output honest over time.']] });
TECH('ai-agentic-implementation',[
  {n:'Test-first task', how:`Write or ask for a failing test from the acceptance criteria, confirm it fails, then let the agent implement until it passes.`, fit:`Rules with a clear expected result: economy formulas, save migrations, input mapping, pathing edge cases.`, cost:`Needs a test harness in the project; feel and pacing do not reduce to asserts.`, alt:`A scripted play session with logged metrics as the check.`},
  {n:'Editor bridge (MCP)', how:`An MCP server exposes the engine editor to the agent: read the scene tree, enter play mode, capture logs and screenshots.`, fit:`Tasks that touch scenes and need to see the running game.`, cost:`Another tool with editor-level access; a screenshot is evidence to review, not a pass or fail.`, alt:`Headless test runs and logs only.`},
  {n:'Parallel agents on separate worktrees', how:`One branch and working tree per agent, disjoint file scopes, merged through review.`, fit:`Several independent tasks at once.`, cost:`Conflicts in shared scenes and assets; review load grows with every agent.`, alt:`One agent, tasks in sequence.`}
]);
ENGINE('ai-agentic-implementation',{
  godot:{ term:`An agent can prove a Godot change only through something it can run without the editor window: a headless test run. GUT or gdUnit4 tests under godot --headless are the acceptance check, and scene files stay out of its hands.`,
    api:['godot --headless -s addons/gut/gut_cmdln.gd','GutTest / assert_eq() / assert_true()','-gdir=res://test -gexit','SceneTree.quit(exit_code)','preload() a script and .new()','EditorPlugin (an editor bridge)'],
    snippet:`extends GutTest                        # res://test/unit/test_economy.gd
const Economy = preload("res://game/economy.gd")

func test_upgrade_cost_scales_by_tier() -> void:
\tvar e = Economy.new()
\tassert_eq(e.upgrade_cost(1), 12)
\tassert_eq(e.upgrade_cost(3), 48)       # the rule the task changes

func test_refund_never_exceeds_spend() -> void:
\tvar e = Economy.new()
\te.spend(40)
\tassert_true(e.refund() <= 40)
# godot --headless -s addons/gut/gut_cmdln.gd -gdir=res://test/unit -gexit`,
    pitfall:`Letting the agent edit .tscn text to wire nodes. Scene files are text, so the edit applies, but node paths, unique ids and signal connections break silently and the diff is unreadable in review. Keep scene wiring in the editor and let the agent change scripts and tests, which you can review line by line.`,
    map:`GUT or gdUnit4 under godot --headless is the Unity Test Framework under -batchmode -runTests; an EditorPlugin bridge is a Unity editor extension.` },
  unity:{ term:`In Unity the acceptance check is the Test Framework run from the command line: EditMode tests for logic, PlayMode tests for anything that needs frames, both runnable in -batchmode so the agent sees pass or fail without the editor.`,
    api:['Unity Test Framework (NUnit)','[Test] / [UnityTest]','Assert.AreEqual() / Assert.LessOrEqual()','-batchmode -runTests -testPlatform EditMode','-testResults results.xml','Assembly Definition (.asmdef) for the tests'],
    snippet:`using NUnit.Framework;                     // Tests/EditMode/EconomyTests.cs

public class EconomyTests {
    [Test] public void UpgradeCostScalesByTier() {
        var e = new Economy();
        Assert.AreEqual(12, e.UpgradeCost(1));
        Assert.AreEqual(48, e.UpgradeCost(3));  // the rule the task changes
    }
    [Test] public void RefundNeverExceedsSpend() {
        var e = new Economy();
        e.Spend(40);
        Assert.LessOrEqual(e.Refund(), 40);
    }
}
// Unity -batchmode -projectPath . -runTests -testPlatform EditMode -testResults r.xml`,
    pitfall:`Passing -quit together with -runTests. The editor can exit before the run finishes, no results file is written, and an agent reading only the exit code reports success for tests that never ran. Use -runTests without -quit and treat a missing results file as a failure.`,
    map:`Unity EditMode tests under -batchmode are GUT tests under godot --headless; a test .asmdef is Godot's separate res://test folder that the game never loads.` } });
INTERVIEW('ai-agentic-implementation',{
  junior:[
    { q:`What makes a task suitable to hand to a coding agent?`,
      a:`A clear goal, a small scope, and a check the agent can run that fails before the change and passes after it, such as a unit test for a formula. Feel, tuning and anything you cannot state as a check stay with a person.`,
      follow:`Give an example of a task you would not hand over.`,
      red:`"Anything that is well described," with no mention of a runnable check.` },
    { q:`Why ask the agent to run the check before it changes anything?`,
      a:`To prove the check can fail. A test that already passes does not test the change, and running it first also exposes a broken harness before any code is written.`,
      follow:`What do you do if it passes before the change?`,
      red:`Skips it because it slows the agent down.` }
  ],
  mid:[
    { q:`How do you review a 600-line agent diff?`,
      a:`Mostly by not getting one: size tasks to diffs you can read in one sitting. Then read every changed line of gameplay logic, skim generated boilerplate, check that tests assert requirements rather than the implementation, and look for files outside the scope such as project settings, lockfiles and scenes.`,
      follow:`How do you size tasks up front?`,
      red:`Merges because CI is green.` },
    { q:`The agent reports that all tests pass. What else do you check?`,
      a:`Whether the tests existed before or were written by the agent to match its code, whether they fail with the change reverted, whether anything untested changed, and then I play it.`,
      follow:`How do you stop an agent writing tests that simply mirror its code?`,
      red:`Treats the agent's report as the evidence.` },
    { q:`What goes in a project instructions file for agents?`,
      a:`The build, test and run commands, naming and folder conventions, a do-not-touch list (scenes, save format, project settings, credentials), and how to report uncertainty. Short, versioned and reviewed like code.`,
      follow:`How do you keep it current as the project changes?`,
      red:`A long wish list that nobody updates.` }
  ],
  senior:[
    { q:`You want three agents working in parallel. How do you set it up?`,
      a:`One branch and working tree each, tasks with disjoint file scopes, changes to shared assets serialised, and every merge through the same review and checks as people. Throughput is capped by review capacity, not by the number of agents.`,
      follow:`Two tasks both need to change the same prefab. What now?`,
      red:`Three agents in one working tree.` },
    { q:`What permissions does a coding agent get in your project?`,
      a:`Least privilege: write access on a branch, local build and test commands, no production credentials, no deploy rights, no player data. Destructive commands need confirmation and secrets never enter its context.`,
      follow:`An integration test needs a service key. How do you give the agent that?`,
      red:`The same access as a senior engineer, to save time.` }
  ] });

T('ai-for-playtest-analysis',{ d:'ai', t:'AI for playtest analysis', tag:'AI finds patterns in notes, transcripts and telemetry. Humans supply the context and make the call.',
  what:`Using AI to transcribe, code, cluster and summarize playtest evidence: observer notes, recordings, interview transcripts, telemetry, replay logs. AI is fast and consistent at coding and pattern-finding. It lacks the context (what was intended, what the room felt like, what the tester's face did) that interpretation requires.`,
  why:[`Playtest data is voluminous and under-analyzed. Most teams act on impressions from the room.`,`Consistent coding across sessions reveals trends impressions miss.`,`AI analysis is only as good as the evidence you give it and the interpretation you apply afterward.`],
  think:{ q:[`What did I ask the test to answer? Give the AI the hypothesis.`,`What context does the AI lack? Add it: what was intended, what changed since last test, what I saw that is not in the notes.`,`Is it reporting behavior or paraphrasing opinions?`,`What did it call a pattern? Two testers is a hint, not a pattern.`],
    trade:[`AI coding is consistent and misses nuance. Human coding is nuanced and inconsistent. Use both.`],
    traps:[`Feeding transcripts without the hypothesis.`,`Accepting AI's interpretation of intent.`,`Letting it recommend design changes in the same pass as analysis.`],
    good:[`Analysis outputs separate behavior from self-report and patterns from outliers.`,`Decisions cite the analysis and add the human's context.`],
    bad:[`The AI summary becomes the design change list.`] },
  how:[`Provide hypothesis, protocol, notes, transcripts, logs and your own context.`,`Ask for coding and clustering, behavior separated from self-report, patterns separated from outliers, contradictions surfaced.`,`Interpret yourself. Then, in a separate step, ask for hypotheses about causes.`,`Decide. Record the decision and the evidence.`],
  ai:{ yes:[`Transcribe, code, cluster, count, correlate, summarize, surface contradictions and outliers.`],
       no:[`Interpret meaning without your context.`,`Recommend changes in the analysis pass.`] },
  prompts:[{l:'Telemetry and notes correlation',p:`Here are telemetry logs (events with timestamps per player) and observer notes for the same sessions: [DATA]. Hypothesis under test: [HYPOTHESIS]. Align notes to telemetry by time. Report: where observed hesitation or confusion coincides with specific game events, choice distributions at each decision point. Retry counts per challenge. Session-end events. Separate behavior from self-report. Mark patterns (present in 3 or more players) and outliers. Do not interpret causes or recommend changes.`}],
  verify:[`Did it stay in analysis, or slide into recommendations?`,`Did it count two testers as a pattern?`,`Did it use the hypothesis?`],
  test:[`Interpretation is verified by the next test: did the change you made on this analysis move the signal?`],
  rel:[['playtesting','What is being analyzed.'],['iteration-and-evidence','Analysis feeds the next iteration.'],['verifying-ai-output','Check the analysis before acting.']] });
TECH('ai-for-playtest-analysis',[
  {n:'Analysis-only pass', how:`One pass to code and cluster the notes with no recommendations. A separate, later pass to hypothesize causes.`, fit:`Keeping AI from turning analysis into a change list.`, cost:`Feels slower. Prevents the common failure.`, alt:`Never let the analysis output become the change list.`},
  {n:'Coding scheme and behavior/self-report split', how:`Define codes up front and keep what players did separate from what they said.`, fit:`Comparable, interpretable results.`, cost:`Setup time.`, alt:`Log behavior with timestamps. Interview after.`},
  {n:'Human interpretation gate', how:`The human adds room context and decides. AI counts and clusters.`, fit:`Making sense of the why the data cannot show.`, cost:`Requires the human to actually be in the room.`, alt:`AI analyzes, humans interpret and decide.`}
]);
ENGINE('ai-for-playtest-analysis',{
  godot:{ term:`The analysis is only as good as the line format. Emit one JSON object per line, carry the hypothesis id on every record so a batch of sessions can be mixed, and flatten engine types to plain numbers while you still know what they meant.`,
    api:['JSON.stringify() / JSON.parse_string()','FileAccess.store_line()','Dictionary.merge()','snappedf()','Time.get_ticks_msec()','user:// path'],
    snippet:`func emit(kind: String, where: Vector2, extra := {}) -> void:
\tvar rec := {
\t\t"h": hypothesis_id,        # every line carries the question it answers
\t\t"t": Time.get_ticks_msec(),
\t\t"kind": kind,
\t\t"x": snappedf(where.x, 0.1),   # plain floats, never a Vector2
\t\t"y": snappedf(where.y, 0.1),
\t}
\trec.merge(extra)
\t_f.store_line(JSON.stringify(rec))
\t_f.flush()`,
    pitfall:`Passing engine types straight to JSON.stringify. Godot's JSON knows only JSON types, so a Vector2 arrives as a string like "(3, 4)" and an Object arrives as null, and every downstream parse has to guess what it was holding. Flatten to named floats inside the game, where the units are still known, and keep one field per quantity.`,
    map:`Godot JSON.stringify is Unity JsonUtility.ToJson, with the same class of limits, and user:// is Application.persistentDataPath.` },
  unity:{ term:`One line of JSON per event, built from a flat [Serializable] struct with public fields, because the built-in serializer is narrow enough that anything structured comes out empty and says nothing about it.`,
    api:['JsonUtility.ToJson()','[Serializable] structs with public fields','StreamWriter.WriteLine()','Time.unscaledTime','Application.persistentDataPath','JsonUtility.FromJson<T>()'],
    snippet:`[Serializable] struct Record {                   // flat, public fields only
    public string h;                             // the question this line answers
    public float t;
    public string kind;
    public float x, y;
}

void Emit(string kind, Vector2 where) {
    var r = new Record { h = hypothesisId, t = Time.unscaledTime,
                         kind = kind, x = where.x, y = where.y };
    log.WriteLine(JsonUtility.ToJson(r));
    log.Flush();
}`,
    pitfall:`JsonUtility cannot serialize a Dictionary, a top-level array, an interface or a C# property, and it does not throw when asked to. It returns an empty object or silently drops the field, so a payload assembled as a Dictionary reaches the analysis pass carrying nothing. Use flat structs with public fields, and read one real emitted line before the build goes out.`,
    map:`Unity JsonUtility is Godot's JSON.stringify, and [Serializable] public fields are what @export makes serializable.` } });
INTERVIEW('ai-for-playtest-analysis',{
  junior:[
    { q:`What do you supply along with the transcripts?`,
      a:`The hypothesis the test was answering, the protocol, what changed since the last test, and your own notes on what you saw that is not in the data. Without the hypothesis the analysis has no target and returns a summary. Without your context it will interpret intent it cannot observe.`,
      follow:`What context is impossible to hand over, and what do you do about it?`,
      red:`Pastes transcripts and asks what the findings are.` },
    { q:`What is the difference between behaviour and self-report, and why separate them?`,
      a:`Behaviour is what the player did, visible in notes or logs. Self-report is what they said about it. They disagree often, and averaging them destroys the most useful finding, which is the contradiction. Ask for them coded separately and keep them separate all the way to the decision.`,
      follow:`They contradict each other. Which do you act on?`,
      red:`Treats quotes and observed actions as the same kind of evidence.` },
    { q:`What can an assistant do with playtest data better than you can?`,
      a:`Transcribe, code consistently across many sessions, count, cluster, align notes against telemetry timestamps, and surface contradictions and outliers you would skim past. Consistency across sessions is the real gain, because human coding drifts between the first session and the tenth.`,
      follow:`What does that consistency cost you?`,
      red:`Says it can tell you what the findings mean, which is the part it cannot do.` }
  ],
  mid:[
    { q:`It reported a pattern based on two testers. What do you do?`,
      a:`Demote it to a hint and say so in the prompt for next time: patterns need three or more of a matched group, outliers get listed separately with why they might matter. Then check whether the two testers matched the player model, because two matched testers are more interesting than five unmatched ones.`,
      follow:`How do you keep that hint alive so it is not lost?`,
      red:`Accepts the label and takes a design change to the team.` },
    { q:`It recommended design changes in the analysis pass. Why is that a problem?`,
      a:`Because the recommendation arrives wearing the authority of the analysis, and the team stops distinguishing what was observed from what was proposed. Analysis and design are separate passes with separate inputs. Ask for causes as hypotheses in a second step if you want them, clearly labelled as speculation.`,
      follow:`Its recommendation is actually good. How do you use it without contaminating the evidence?`,
      red:`Takes the recommended change list to the team as the playtest result.` },
    { q:`What context does it lack that you must add?`,
      a:`What the design intended, what changed since last time, what the room felt like, who the testers were and how they match the model, and the things you noticed but did not write down. Also what you already decided, so it does not reopen settled questions as findings.`,
      follow:`You add all that and the analysis still misreads a moment. What went wrong?`,
      red:`Assumes the transcript contains everything relevant.` }
  ],
  senior:[
    { q:`Build the analysis pipeline for a weekly test cadence.`,
      a:`Fixed note schema and event schema so sessions are comparable. Automated transcription and coding against that schema. A standing analysis prompt that takes the hypothesis, codes behaviour separately from self-report, marks patterns against outliers and surfaces contradictions. Then a human interpretation step and a recorded decision. Keep every session's output so trends across weeks are readable.`,
      follow:`What breaks first when the cadence is real?`,
      red:`Designs a pipeline with no human interpretation step, or one that changes schema every week.` },
    { q:`How do you stop the summary from becoming the change list?`,
      a:`Make the analysis output end at evidence, structurally: no recommendations in that artifact. Then hold a short interpretation step where a human adds context and proposes the one or two changes, recorded with the evidence cited. The separation has to be in the artifacts, because under deadline the team will act on whatever is in front of them.`,
      follow:`The team keeps skipping the interpretation step. What do you change?`,
      red:`Asks people to be careful about the distinction, with no structural separation.` }
  ] });

T('ai-generative-assets',{ d:'ai', t:'Generative assets: pipeline, provenance and rights', tag:'Generated art, audio and voice are production inputs with an origin. Record it, review it, and know what you may ship.',
  what:`Using image, 3D, audio, music and voice generators in production. Beyond quality, three questions decide whether an asset can ship: where it came from (tool, model, prompt, source material), whether you may use it (tool terms, likeness and voice consent, copyright), and what you must disclose (store and regional rules). A pipeline that records origin at import makes those answers cheap; one that does not makes them expensive during certification or a dispute.`,
  why:[`Store disclosure rules ask which shipped content is AI-generated, so you need to know per asset.`,`Copyright protection for purely generated output is limited; what a person selected, arranged or changed is what counts.`,`Voices and likenesses need documented consent, and style drift costs more to fix the later it is found.`],
  think:{ q:[`Which assets are generated, edited from generated, or made by hand, and could you list them today?`,`What did a person change, and could you show it?`,`Do the tool's terms allow commercial use on every platform you ship to?`,`Whose voice or likeness is in it, and is consent written for this use?`],
    trade:[`Generated placeholders speed greyboxing and anchor the art direction toward whatever the tool does well.`,`Final-quality generation saves production time and adds review, legal and disclosure work.`],
    traps:[`Prompting with a living artist's name or recognisable style.`,`Generated files mixed into the build with no record of where they came from.`,`Cloning a voice without explicit, specific consent.`,`Assuming placeholders will be replaced. They ship.`],
    good:[`Every imported asset has an origin entry, and a report lists the generated content that ships, by store category.`],
    bad:[`Nobody can say which textures in the build came from a generator.`] },
  how:[`Record origin at import, keyed by asset path and kept in the repository: tool, model and version, date, source material, human edits, approver.`,`Keep generated placeholders in a folder or label the build flags or excludes.`,`Review generated assets against the art direction like any other asset.`,`Generate the store disclosure answers from the manifest, not from memory.`,`For voice and likeness, keep a consent record per performer and per use.`,`Rerun the manifest check before every submission.`],
  ai:{ yes:[`Greybox and placeholder art, mood boards and exploration variants.`,`Texture, sound and music iteration from source material you own.`,`Clean-up and upscaling of assets you own.`],
       no:[`Imitate an identifiable living artist.`,`Clone a voice or likeness without consent.`,`Decide the art direction.`,`Ship final assets nobody reviewed.`] },
  prompts:[{l:'Provenance audit',p:`Here is our asset manifest as CSV (path, type, origin, tool, human edits): [CSV]. List assets with no origin, generated assets with no recorded human edit, and generated assets in the categories [STORE] asks us to disclose. Output a table. No recommendations.`},
    {l:'Style drift check',p:`Here is our art direction guide: [GUIDE]. Compare these generated candidates against it: [DESCRIPTIONS]. Check palette, shape language, detail density and silhouette readability, and flag drift with the rule it breaks. Do not rank by taste.`}],
  verify:[`Is every shipped generated asset in the manifest with its tool and edits?`,`Do the tool's terms allow commercial use on your platforms?`,`Is consent on file for every voice and likeness?`],
  test:[`Test generated art where it is used: at gameplay distance, in motion, beside hand-made assets. Players spot inconsistency faster than reviewers.`],
  rel:[['visual-language','Generated art has to obey the same visual language as everything else.'],['ai-disclosure-policy','The provenance record is what disclosure answers are built from.'],['audio-and-music','Voice and music generation carry consent and rights questions.'],['procedural-content','Generation at runtime is procedural content with a model inside it.']] });
TECH('ai-generative-assets',[
  {n:'Provenance manifest', how:`A file in the repository keyed by asset path with origin, tool, model, edits and approver; a check fails when a new asset arrives without an entry.`, fit:`Any team shipping generated content to a store with disclosure rules.`, cost:`Discipline at import time.`, alt:`Labels in the engine's asset database, exported to the same manifest.`},
  {n:'Owned-input generation', how:`Generate from your own sketches, photos or renders so the human contribution is in the input and on record.`, fit:`Textures, concept variations, sound design.`, cost:`Slower than prompt-only generation.`, alt:`Prompt-only output used as reference, never shipped.`},
  {n:'Consent registry', how:`Written consent per performer and per use for voices and likenesses, stored with the scope, payment and revocation terms.`, fit:`Voice cloning, digital doubles, performance capture.`, cost:`Legal time and negotiation.`, alt:`Recorded performances only, no replicas.`}
]);
ENGINE('ai-generative-assets',{
  godot:{ term:`Provenance belongs in the repository beside the assets. A provenance JSON keyed by res:// path, plus an EditorScript that lists art with no entry, keeps the record where renames and exports cannot lose it.`,
    api:['@tool / extends EditorScript','EditorScript._run() (File > Run)','DirAccess.open() / get_files()','String.get_extension()','JSON.parse_string()','FileAccess.get_file_as_string()'],
    snippet:`@tool
extends EditorScript            # File > Run: lists art with no provenance entry
const MANIFEST := "res://art/provenance.json"   # {"res://art/x.png": {"origin": "gen", ...}}

func _run() -> void:
\tvar known: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(MANIFEST))
\tvar dir := DirAccess.open("res://art")
\tvar missing := 0
\tfor f in dir.get_files():
\t\tif f.get_extension() in ["png", "ogg", "wav", "glb"]:
\t\t\tvar path := "res://art/" + f
\t\t\tif not known.has(path):
\t\t\t\tmissing += 1
\t\t\t\tprint("no provenance: ", path)
\tprint("%d assets without an origin entry" % missing)`,
    pitfall:`Keeping provenance only in the generator's history or a chat log. The link between a PNG in res://art and the prompt, model and edits behind it is lost the first time the file is renamed or re-exported, and the store questionnaire gets answered from memory. Keep the record in the repository beside the asset and fail a check when a new asset has none.`,
    map:`A Godot EditorScript run from the File menu is a Unity editor menu command; the provenance JSON is a manifest either engine can read.` },
  unity:{ term:`Unity's AssetPostprocessor sees every asset as it is imported, so generated art cannot slip in unrecorded: anything under the art folder with no origin in its importer data is labelled for review and logged.`,
    api:['AssetPostprocessor.OnPostprocessAllAssets()','AssetImporter.GetAtPath() / userData','AssetDatabase.LoadMainAssetAtPath()','AssetDatabase.GetLabels() / SetLabels()','Debug.LogWarning()','System.Linq'],
    snippet:`using UnityEditor; using UnityEngine; using System.Linq;

class ProvenanceGate : AssetPostprocessor {
    static void OnPostprocessAllAssets(string[] imported, string[] deleted,
                                       string[] moved, string[] movedFrom) {
        foreach (var path in imported.Where(p => p.StartsWith("Assets/Art/"))) {
            if (!string.IsNullOrEmpty(AssetImporter.GetAtPath(path).userData)) continue;
            var asset = AssetDatabase.LoadMainAssetAtPath(path);
            var labels = AssetDatabase.GetLabels(asset);   // SetLabels replaces them all
            if (labels.Contains("needs-provenance")) continue;
            AssetDatabase.SetLabels(asset, labels.Append("needs-provenance").ToArray());
            Debug.LogWarning($"No origin recorded for {path}");
        }
    }
}`,
    pitfall:`Writing to an asset from inside the postprocessor without a guard. A reimport started from the callback (importer.SaveAndReimport() after setting userData, for example) runs the callback again for the same asset, and without a check that the work is already done the editor loops. Check before writing, as the label test here does, and record provenance through a separate menu command rather than during import.`,
    map:`Unity's AssetPostprocessor is a Godot import plugin or post-import script; asset labels are the nearest thing to Godot resource metadata.` } });
INTERVIEW('ai-generative-assets',{
  junior:[
    { q:`What do you record when you import a generated asset?`,
      a:`The tool, model and version, the date, the prompt or settings reference, any source material we supplied, what a person changed, and who approved it, keyed to the asset path and kept in the repository.`,
      follow:`Where does that record live so a rename cannot lose it?`,
      red:`Nothing; the file name says it was generated.` },
    { q:`Why keep generated placeholders apart from final assets?`,
      a:`Placeholders ship when nobody tracks them. A separate folder or label lets the build or a report catch them, and it keeps them from quietly setting the art direction.`,
      follow:`How would the build catch one that slipped through?`,
      red:`"We will remember to replace them."` }
  ],
  mid:[
    { q:`A store asks which content is AI-generated. How do you answer accurately?`,
      a:`From the manifest: list the shipped, player-facing content by category (art, audio, text, voice), separate pre-generated from live-generated content, leave out AI tools that only made development faster, which Steam's survey does not cover, and keep the answer versioned with the build.`,
      follow:`What changes in the answer if you add a live-generated feature?`,
      red:`Answers from memory the night before submission.` },
    { q:`What is the copyright position of purely generated art in the US?`,
      a:`Under the Copyright Office's 2025 report, prompts alone do not make you the author; protection attaches to sufficient human expressive contribution such as selection, arrangement, modification or human-made elements. In practice: document the human edits, and do not assume you can stop others copying raw output.`,
      follow:`How does that change what you record in the pipeline?`,
      red:`"We paid for the tool, so we own everything it makes."` }
  ],
  senior:[
    { q:`Your audio lead wants to clone an actor's voice for extra lines. What do you require?`,
      a:`Written, specific consent for that use, compensation terms, scope limits (which lines, which game), revocation terms, secure storage of the voice model, and disclosure where required; union agreements such as SAG-AFTRA's 2025 video game agreement require consent and disclosure for digital replicas. Legal review before any recording is cloned.`,
      follow:`The actor later withdraws consent. What happens to shipped content?`,
      red:`Clones the voice from existing recordings because the studio owns them.` },
    { q:`How do you keep generated assets consistent across a team?`,
      a:`The art direction guide is the reference; inputs are controlled (our own source images, pinned model versions, style references we own); generated assets go through the same review gates as any other; regenerated batches are re-reviewed; nobody prompts with living artists' names.`,
      follow:`A model update changes the look of a batch mid-production. What do you do?`,
      red:`Each artist uses whatever tool and settings they like.` }
  ] });
FACTS('ai-generative-assets',[
  { claim:`Steam's content survey asks developers to disclose AI-generated content that ships with the game and reaches players (art, sound, narrative, localization and the like), split into pre-generated content, made with AI tools during development, and live-generated content, made while the game runs. Efficiency gains from AI development tools are not covered. Valve rewrote the survey in January 2026.`, asOf:'2026-09-23', src:'https://partner.steamgames.com/doc/gettingstarted/contentsurvey' },
  { claim:`The US Copyright Office's January 2025 report: prompts alone do not make you the author of a model's output; human selection, arrangement, modification or perceptible human-made material can be protected, case by case.`, asOf:'2026-09-23', src:'https://copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf' },
  { claim:`SAG-AFTRA's Interactive Media Agreement, ratified in July 2025, requires specific written consent and disclosure before a performer's digital replica is created or used, and lets performers suspend consent for new AI material during a strike.`, asOf:'2026-09-23', src:'https://www.sagaftra.org/sag-aftra-members-approve-2025-video-game-agreement' }
]);

T('ai-disclosure-policy',{ d:'ai', t:'Disclosure, IP and platform rules for AI content', tag:'What stores and laws ask about AI in your game, who owns what the model made, and how to keep the answers true while the rules move.',
  what:`The rules around shipping an AI-assisted game: store disclosures (Steam's content survey), regional law (the EU AI Act's transparency duties), copyright in generated output, performer and likeness consent, and your own honesty with players. The rules change. The durable practice is knowing, per build, what AI touched and how, and putting a date and a source on every rule you rely on.`,
  why:[`A wrong or missing disclosure can get a store page flagged, and players react badly to discovering undisclosed AI.`,`EU transparency duties apply to systems that talk with people and to synthetic content.`,`Gaps in ownership weaken your ability to protect what you made.`],
  think:{ q:[`Which AI use is player-facing (content shipped or generated live) and which is internal tooling?`,`Does anything in the game talk to players as an AI, such as a conversational character?`,`Which regions do you ship to, and when did you last check their rules?`,`Who owns the disclosure answers for each build?`],
    trade:[`Disclosing internal tools confuses players; under-disclosing player-facing content risks store action and trust.`,`Live-generated content needs guardrails you can describe to a store and to players.`],
    traps:[`Treating the rules as settled.`,`Answering questionnaires from memory.`,`Assuming the tool vendor's terms cover your use.`,`Store copy that promises "handcrafted" when parts are generated.`],
    good:[`A dated rules page, one owner, and disclosure answers generated from the asset manifest every release.`],
    bad:[`Disclosure decided the night before submission.`] },
  how:[`Keep a rules page with each rule's source and the date it was checked (the dated facts below are a start).`,`Classify AI use the way the store does: pre-generated content, live-generated content, and development tools.`,`For live generation, document the guardrails: filters, allowed topics, reporting, human review.`,`Make it clear when a character is an AI, unless it is obvious from context.`,`Keep performer consent records and the tool terms you rely on.`,`Review before each submission and whenever a rule you depend on changes.`],
  ai:{ yes:[`Draft disclosure text from your manifest.`,`Turn a policy page into a checklist, then check it against the source.`,`Flag store-page claims the manifest contradicts.`],
       no:[`Tell you what the law requires; it is not legal advice and may be out of date.`,`Decide your disclosure.`,`Be the source of a rule's current text.`] },
  prompts:[{l:'Disclosure draft',p:`From this asset manifest [MANIFEST] and this description of our live-generated features [SYSTEM], draft answers to [STORE]'s AI content questions as of [DATE]. Separate pre-generated content, live-generated content and development tools. Mark every answer that rests on an assumption. Do not claim legal compliance.`},
    {l:'Claim check',p:`Here is our store page copy [COPY] and our AI manifest [MANIFEST]. List every claim in the copy that the manifest contradicts or does not support.`}],
  verify:[`Does every rule you rely on have a source and a check date?`,`Does the disclosure match the manifest for this build?`,`Did a lawyer review region-specific duties wherever money, minors or likeness are involved?`],
  test:[`Show the store page and the in-game notice to a few players and ask what they think is AI-made; mismatches show where the disclosure is unclear.`],
  rel:[['ai-generative-assets','The provenance record is what makes disclosure answerable.'],['ethics-and-responsibility','Disclosure is part of making honest claims.'],['launch-and-discoverability','The store page is where the disclosure lives.'],['ai-evals','Guardrails you describe to a store should be ones your evals test.']] });
TECH('ai-disclosure-policy',[
  {n:'Manifest-driven disclosure', how:`Generate store answers and the in-game notice from the same asset manifest each build.`, fit:`Any game with generated content.`, cost:`Needs the manifest to be kept honest at import.`, alt:`A checklist filled in by hand before submission.`},
  {n:'Dated rules page', how:`One page listing each rule the game depends on, its source, the date checked and the owner.`, fit:`Teams shipping to several stores and regions.`, cost:`Someone has to own the rechecks.`, alt:`Legal review at each release.`},
  {n:'Build gate on unlisted assets', how:`Label generated assets and fail the build when a labelled asset is missing from the manifest.`, fit:`Teams where generated assets arrive weekly.`, cost:`Setup in the engine's build pipeline.`, alt:`A report reviewed before each submission.`}
]);
ENGINE('ai-disclosure-policy',{
  godot:{ term:`Disclosure needs one source of truth inside the project: a manifest Resource the build reads, so the in-game notice and the store answers both come from the same list.`,
    api:['class_name + extends Resource','@export var entries: Array[Dictionary]','Array.filter() with a lambda','PackedStringArray / String.join()','ResourceLoader.load()','EditorExportPlugin._export_begin()'],
    snippet:`class_name AiManifest extends Resource      # res://legal/ai_manifest.tres
@export var build := ""
@export var entries: Array[Dictionary] = [] # {"area","kind","tool","live"}

func player_summary() -> String:
\tvar live := entries.filter(func(e): return e.get("live", false))
\tvar pre := entries.filter(func(e): return not e.get("live", false))
\tvar lines := PackedStringArray(["AI in this game (build %s):" % build])
\tfor e in pre: lines.append("- %s: %s, made with %s and reviewed" % [e.area, e.kind, e.tool])
\tfor e in live: lines.append("- %s: generated while you play" % e.area)
\treturn "\\n".join(lines)`,
    pitfall:`Writing the in-game AI notice by hand in a credits scene. The first time an asset is regenerated or a live feature is added, the notice and the store answers drift apart, and nobody notices until a player or a store reviewer does. Generate both from one manifest resource the build and the submission checklist read.`,
    map:`A Godot custom Resource (.tres) is a Unity ScriptableObject asset. EditorExportPlugin._export_begin runs where Unity's IPreprocessBuildWithReport does but cannot stop an export, so in Godot the gate is a headless check in CI before exporting.` },
  unity:{ term:`In Unity the manifest is a ScriptableObject, and a build preprocessor refuses to build when a generated asset in the project has no entry, so the disclosure cannot fall behind the content.`,
    api:['ScriptableObject','IPreprocessBuildWithReport.OnPreprocessBuild()','BuildFailedException','AssetDatabase.FindAssets("l:ai-generated")','AssetDatabase.GUIDToAssetPath()','AssetDatabase.LoadAssetAtPath<T>()'],
    snippet:`using System.Linq; using UnityEditor; using UnityEditor.Build; using UnityEditor.Build.Reporting;

class AiManifestGate : IPreprocessBuildWithReport {
    public int callbackOrder => 0;
    public void OnPreprocessBuild(BuildReport report) {
        var manifest = AssetDatabase.LoadAssetAtPath<AiManifest>("Assets/Legal/AiManifest.asset");
        var listed = manifest.entries.Select(e => e.assetPath).ToHashSet();
        var missing = AssetDatabase.FindAssets("l:ai-generated")
            .Select(AssetDatabase.GUIDToAssetPath)
            .Where(p => !listed.Contains(p)).ToList();
        if (missing.Count > 0)
            throw new BuildFailedException("Unlisted AI assets: " + string.Join(", ", missing));
    }
}`,
    pitfall:`Relying on the store questionnaire alone. It is answered once per submission, by one person, from memory, while generated assets arrive every week. A label on each generated asset and a preprocessor that fails the build on an unlisted one keep the answer current without anyone having to remember.`,
    map:`Unity's IPreprocessBuildWithReport can fail the build; Godot's EditorExportPlugin._export_begin cannot, so there the gate is a headless check in CI before export. A ScriptableObject manifest is a custom Resource.` } });
INTERVIEW('ai-disclosure-policy',{
  junior:[
    { q:`What is the difference between pre-generated and live-generated AI content, for disclosure?`,
      a:`Pre-generated content is made during development and shipped as assets, reviewed like any other content. Live-generated content is produced while the game runs, so players can see output nobody reviewed. Stores ask about both, and live generation needs guardrails you can describe. Steam's survey, as rewritten in January 2026, does not cover AI tools that only make development faster.`,
      follow:`Which kind is a model-written quest summary created during development?`,
      red:`"It is all just AI, one answer covers it."` },
    { q:`Why put a date on every rule you rely on?`,
      a:`Because they change: Steam rewrote its disclosure rules in January 2026 and the EU AI Act's transparency duties began in August 2026. A dated source says when to recheck and shows what you knew at the time.`,
      follow:`Who in your team would own the rechecks?`,
      red:`Relies on a summary read once, years ago.` }
  ],
  mid:[
    { q:`Your game has a character players can chat with, powered by a model. What do you owe players?`,
      a:`Make it clear they are talking to an AI unless that is obvious from context (the EU AI Act's Article 50 duty for systems that interact with people); disclose the live-generated content on stores; describe the guardrails; give players a way to report output; and check what the rating bodies need to know about online and generated content.`,
      follow:`What guardrails would you describe to a store?`,
      red:`Nothing, because it is fiction.` },
    { q:`Who owns the art your team generated?`,
      a:`In the US, raw output without enough human authorship is not protected (Copyright Office, 2025); human selection, arrangement and edits can be. The tool's terms decide your rights to use it. So we record the human contribution and take legal advice for key assets.`,
      follow:`How does that change your pipeline?`,
      red:`"Whoever typed the prompt."` }
  ],
  senior:[
    { q:`How do you run AI compliance across a studio without slowing everyone down?`,
      a:`One owner and a dated rules page; labels and a manifest in the asset pipeline; a build gate that fails on unlisted generated assets; a submission checklist generated from the manifest; reviews when a rule changes; and legal review wherever money, minors or likeness are involved.`,
      follow:`A rule changes a week before launch. What happens?`,
      red:`Each team works it out for themselves.` },
    { q:`A publisher contract asks you to warrant the game has no AI-generated content. What do you do?`,
      a:`Establish what is true from the manifest; negotiate definitions (development tools versus shipped content); never warrant what I cannot verify; replace assets if the deal needs it; and keep the records that support whatever we sign.`,
      follow:`The manifest has gaps from early development. How do you close them?`,
      red:`Signs it and hopes.` }
  ] });
FACTS('ai-disclosure-policy',[
  { claim:`Steam's content survey asks developers to disclose AI-generated content that ships with the game and reaches players (art, sound, narrative, localization and the like), split into pre-generated content, made with AI tools during development, and live-generated content, made while the game runs. Efficiency gains from AI development tools are not covered. Valve rewrote the survey in January 2026.`, asOf:'2026-09-23', src:'https://partner.steamgames.com/doc/gettingstarted/contentsurvey' },
  { claim:`The EU AI Act's Article 50 transparency duties have applied since 2 August 2026: people must be told when they are interacting with an AI system unless it is obvious, and generative systems must mark synthetic content in a machine-readable way (systems already on the market have until 2 December 2026 for the marking).`, asOf:'2026-09-23', src:'https://www.goodwinlaw.com/en/insights/publications/2026/08/alerts-technology-dpc-eu-ai-act-transparency-obligations-now-in-force' },
  { claim:`The US Copyright Office's January 2025 report: prompts alone do not make you the author of a model's output; human selection, arrangement, modification or perceptible human-made material can be protected, case by case.`, asOf:'2026-09-23', src:'https://copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf' },
  { claim:`SAG-AFTRA's Interactive Media Agreement, ratified in July 2025, requires specific written consent and disclosure before a performer's digital replica is created or used.`, asOf:'2026-09-23', src:'https://www.sagaftra.org/sag-aftra-members-approve-2025-video-game-agreement' }
]);

T('ai-loop',{ d:'ai', t:'The AI-era development loop', tag:'Define, hypothesize, explore, critique, prototype, play, measure, interpret, decide, implement, polish, repeat.',
  what:`The master workflow: 1 Define (player, fantasy, experience). 2 Hypothesize (what must be true). 3 Explore (AI expands the space). 4 Critique (AI attacks assumptions). 5 Prototype (cheapest test). 6 Play (observe humans). 7 Measure (behavioral evidence). 8 Interpret (human plus AI). 9 Decide (keep, change, simplify, kill). 10 Implement (AI aggressively). 11 Polish (amplify validated experience). 12 Repeat. The interactive stepper in the AI Workflow view details each step's human role, AI role, output and exit criterion.`,
  why:[`It puts player evidence between exploration and commitment, which is the single discipline that prevents most AI-era failures.`,`It gives AI the steps where volume helps (explore, critique, prototype, implement) and humans the steps where judgment is the work (define, decide, interpret).`,`It is a loop: polish is not the end, it is the setup for the next hypothesis.`],
  think:{ q:[`Which step am I on? Which step did I skip to get here?`,`When did a player last touch the build (step 6)? If more than two cycles ago, stop and test.`,`Did I decide (step 9), or did I drift into implementing?`],
    trade:[`Running the whole loop is slow per cycle and fast per validated feature.`],
    traps:[`Skipping 5 through 8: explore, then implement.`,`Polishing (11) before deciding (9).`,`Defining (1) once and never revisiting.`],
    good:[`The team can name the current step and the last decision.`],
    bad:[`The loop is a line: define, implement, polish, ship.`] },
  how:[`Mark your current step in the AI Workflow view stepper. It persists.`,`Before moving on, check the exit criterion for the step.`,`Log each cycle: hypothesis, prototype, evidence, decision.`],
  ai:{ yes:[`Steps 3, 4, 5, 7 (collection), 8 (analysis), 10, and support in 11.`],
       no:[`Steps 1, 9, and the interpretation half of 8.`] },
  prompts:[{l:'Where are we?',p:`Here is our recent activity log: [LOG]. Map each item to a step of the loop (define, hypothesize, explore, critique, prototype, play, measure, interpret, decide, implement, polish). Which steps have we skipped in the last two cycles? When did a player last touch the build? What decision is pending that we have been implementing around instead of making?`}],
  verify:[`Did it identify skipped steps honestly?`],
  test:[`Step 6 is the test. Everything else exists to make it count.`],
  rel:[['hypothesis-driven-design','Step 2.'],['prototyping','Step 5.'],['playtesting','Step 6.'],['iteration-and-evidence','Steps 7 to 9.'],['polish-when','Step 11.'],['loop-view','The interactive stepper is in the AI Workflow view.']] });
TECH('ai-loop',[
  {n:'Loop stepper with exit criteria', how:`Mark the project's step in the 12-step loop. Each step has a human role, an AI role, an output and an exit criterion.`, fit:`Keeping exploration, evidence and commitment in order.`, cost:`Requires honesty about where you actually are.`, alt:`Mark where you are in the AI Workflow view.`},
  {n:'Player-evidence gate', how:`Steps 6-8 (players) must sit between exploration (3-4) and commitment (9-10).`, fit:`Preventing AI-era shipping on hope.`, cost:`Slows commitment. That is the design.`, alt:`A cycle with no player evidence is a red flag.`}
]);
ENGINE('ai-loop',{
  godot:{ term:`A cycle ends when a player touches a build, so cycle time is how fast a change reaches a running scene. reload_current_scene() plus a small set of debug keys covers most of it, as long as the reset is honest.`,
    api:['get_tree().reload_current_scene()','get_tree().change_scene_to_packed(PackedScene)','Project Settings > Autoload (state that survives a reload)','OS.is_debug_build()','Engine.time_scale','Node._unhandled_input(event)'],
    snippet:`extends Node                       # autoload "DebugKeys"

func _unhandled_input(event: InputEvent) -> void:
\tif not OS.is_debug_build():
\t\treturn
\tif event.is_action_pressed("debug_restart"):
\t\tDirector.reset()           # autoloads survive the reload, so reset them
\t\tRunLog.reset()
\t\tget_tree().reload_current_scene()
\telif event.is_action_pressed("debug_fast"):
\t\tEngine.time_scale = 4.0 if Engine.time_scale == 1.0 else 1.0`,
    pitfall:`reload_current_scene() rebuilds the scene and leaves every autoload exactly as it was. The director's tension value, the run counter and a cached player reference all carry into what the room is calling a fresh run, so cycle six is testing a state cycle one never had. Give every autoload a reset() and call it from the same place you reload.`,
    map:`Godot autoloads surviving reload_current_scene is Unity's DontDestroyOnLoad surviving LoadScene, and Engine.time_scale is Time.timeScale.` },
  unity:{ term:`Cycle time in Unity is dominated by the domain reload between an edit and Play. Enter Play Mode Options remove it, at the price of static state no longer being cleared for you, which you then have to clear yourself.`,
    api:['Enter Play Mode Options (Reload Domain / Reload Scene)','[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]','SceneManager.LoadScene()','EditorApplication.playModeStateChanged','Time.timeScale','DontDestroyOnLoad()'],
    snippet:`public static class RunState {
    public static int cycle;                   // static, so nothing resets it for you
    public static Director director;

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
    static void ResetStatics() {               // required once Reload Domain is off
        cycle = 0;
        director = null;
    }
    public static void Restart() {
        ResetStatics();
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }
}`,
    pitfall:`Turning Reload Domain off for speed and forgetting what the reload was doing. Static fields keep their values and event subscriptions stay attached across Play sessions, so the session you observe begins from a state no shipped build ever has, and the bug you chased all afternoon is gone in the player. Reset every static from a SubsystemRegistration method and confirm findings in a real build.`,
    map:`Unity's domain reload is Godot reparsing scripts, RuntimeInitializeOnLoadMethod is an autoload's _ready, and LoadScene is change_scene_to_packed.` } });
INTERVIEW('ai-loop',{
  junior:[
    { q:`Walk me through the development loop from define to polish.`,
      a:`Define the player, fantasy and experience. Hypothesise what must be true. Explore the space. Critique the assumptions. Prototype the cheapest test. Play with real people. Measure behaviour. Interpret with context. Decide. Implement. Polish what was validated. Repeat. The discipline is that player evidence sits between exploring and committing.`,
      follow:`Which step does your team actually skip?`,
      red:`Recites steps with no notion of which are human and which produce evidence.` },
    { q:`Which steps are human and which can be delegated?`,
      a:`Define and decide are human, and the interpretation half of measure is human. Explore, critique, prototype, data collection, analysis and implementation can be delegated. Polish is shared. The split follows judgment: anywhere the output is a decision about what the game is, a person owns it.`,
      follow:`Why is interpretation split rather than delegated whole?`,
      red:`Delegates the decide step as long as a human approves the result.` },
    { q:`Decide is one of the steps. What are the possible outcomes?`,
      a:`Keep, change, simplify, kill. Naming all four matters, because a team that only has keep and change never simplifies and never kills, and scope grows by default. Record which one you chose and the evidence behind it.`,
      follow:`When did you last choose kill, and what did it cost?`,
      red:`Treats decide as approving the work that was already done.` }
  ],
  mid:[
    { q:`Your team goes from explore straight to implement. What breaks?`,
      a:`You skip critique, prototype, play, measure and interpret, which means you build a fluent idea with no evidence and find out at the milestone. The build grows, confidence grows, and the first real contact with players arrives when changing direction is expensive. The fix is one cheap prototype and one test before any commitment of that size.`,
      follow:`How do you insert that without the team feeling slowed down?`,
      red:`Says it is fine because the idea was good and the team is experienced.` },
    { q:`Why is "when did a player last touch the build" the question you keep asking?`,
      a:`Because it is the cheapest detector for the whole class of AI-era failures. Everything upstream can look healthy while the loop has quietly become define, implement, polish. Two cycles without player contact is the warning, and the remedy is to stop and test rather than to plan better.`,
      follow:`It has been six weeks and the next test is not scheduled. What do you do this week?`,
      red:`Answers with sprint health or velocity instead of player contact.` },
    { q:`What is the exit criterion for the decide step?`,
      a:`A written decision naming one of keep, change, simplify or kill, the evidence it rests on, and what would reopen it. If the team cannot state the decision in a sentence, the step has not happened and the work that follows is drift. Exit criteria on each step are what stop the loop from becoming a line.`,
      follow:`The evidence is genuinely ambiguous. How do you still exit the step?`,
      red:`Exits when implementation starts, which means the decision was made by default.` }
  ],
  senior:[
    { q:`On your team the loop is a line: define, implement, polish, ship. How do you bend it back?`,
      a:`Insert one gate that cannot be skipped, usually player contact before a commitment of a named size. Attach it to something the team already does, such as the milestone review, and require the evidence and the decision as the entry ticket. Prove it once on a decision that was stuck, then widen. Do not roll out the whole loop as a process.`,
      follow:`The first gate slips the milestone by a week. How do you defend it?`,
      red:`Introduces the twelve-step loop as a mandated process and expects adoption.` },
    { q:`How do you keep the loop from slowing the project to a crawl?`,
      a:`Scale the rigour to the stakes. Small, reversible decisions get a fast pass. Anything the rest of the game will be built on gets the full cycle. Run cycles in parallel across areas so the team is never waiting on one test. And keep the prototypes genuinely cheap, because cycle time is dominated by build size, not by the process.`,
      follow:`Which decisions on a current project would you exempt entirely?`,
      red:`Applies the full loop uniformly and then reports that the process does not scale.` }
  ] });
