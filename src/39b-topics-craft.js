/* =====================================================================
   CODE CRAFT
   Which coding habits still pay when an agent writes half the code, and
   which were always taste. Engineering in the AI era (the owner's "AI
   orchestrates, tools compute" claim tested, values that last, what is
   expected of an engineer now, verification as the job), then the craft
   itself: best practice now, memory and garbage collection, performance,
   design patterns, clean code, over-defensive code, what matters most, and
   teaching agents to avoid pitfalls. Engine views are optional: they appear
   where Godot 4.x or Unity 6 code shows the point.
   ===================================================================== */
DOMAINS.push({ id:'craft', lens:'eng', eng:'optional', t:'Code craft', short:'AI-era engineering, best practice, memory, performance, patterns, clean and defensive code, agents', color:'var(--d-craft)',
  sum:`Which coding habits still pay when an agent writes half the code, and which were always taste. The scarce skill has moved from typing code to specifying it, checking it and keeping it simple enough that a reviewer, human or model, can hold it in their head.`,
  links:[['models','How the models behave decides which habits help an agent and which confuse it.'],['ai','Working with an agent day to day is where these habits are tested.'],['backend','Memory, performance and defensive code apply on the server as much as in the client.'],['leadership','Conventions, review and the rules an agent follows are a lead’s decisions.']] });

// Batch craft-v: Engineering in the AI era (plan rows V1 to V4). Domain 'craft', engine views optional.

T('craft-ai-orchestrates-tools-compute',{ d:'craft', t:'AI orchestrates, tools compute', tag:'Let the model read the question and pick the tool. Let code do the arithmetic. Know which half of your pipeline can be wrong in which way.',
  what:`A design rule for systems that use a language model: the model does the probabilistic work (reading an ambiguous question, choosing a tool, filling its arguments, explaining the result) and deterministic code does the computation (the simulation, the query, the sum, the chart). The pipeline is question, interpretation, tool selection, structured input, computation, result, explanation, visualisation. Only the computation and the rendering are deterministic; every step around them is a sampled guess that can be checked but not assumed. The evidence is real but mixed. Program-aided models (PAL, Gao et al. 2022) had the model write Python and let an interpreter compute, and beat PaLM-540B reasoning in text on grade-school maths. Toolformer (Schick et al. 2023) showed a model can teach itself when to call a calculator or a search API. Part of the claim is now dated: reasoning models score high on competition maths with no tools at all, so "models cannot count" is a much weaker reason than it was in 2022, though a 2024 study still found model maths shifts when only the numbers change or a distracting clause is added. The reasons that survive are different: a tool is reproducible, auditable and cheap to re-run, which a sampled answer is not, and it computes over live game data the model has never seen. And the claim fails where the orchestration itself fails: agents pick the wrong tool, pass the wrong argument or stop early, and a 2024 benchmark of tool-using agents (tau-bench) found the 2024 models it tested unreliable across repeated runs (newer models were not re-tested here, so re-measure on yours).`,
  why:[`Game questions are numeric more often than they look: is the economy inflating, is this drop rate fair, how long is the grind to level 40. A fluent wrong number is worse than no number, because it gets pasted into a design doc.`,`A deterministic tool can be tested once and trusted on every call. A model answer has to be checked every time.`,`Splitting the pipeline tells you where to spend verification: on the interpretation and the arguments, not on arithmetic a unit test already covers.`,`The same split makes the result reproducible. Two people asking the same question get the same curve if the tool and its inputs are the same, which is what lets a team argue about the design instead of the numbers.`],
  think:{ q:[`Which steps in this pipeline are sampled and which are computed? Can you point to the line where the model stops and code starts?`,`Does the tool accept a typed, validated input, or free text the model might fill with a unit error?`,`Would you notice if the model picked the wrong tool, or a right tool with the wrong time window?`,`Is the computation seeded and versioned, so the result can be reproduced next week?`,`Does the explanation step only describe the result, or does it add numbers of its own?`,`Is a tool even needed here, or is a single model answer, read by a person, good enough?`],
    trade:[`Tools add a schema, a runtime and a maintenance cost. For a one-off rough estimate a direct model answer checked by eye can be the cheaper right call.`,`A strict schema catches bad arguments and also rejects questions the tool designer did not foresee.`,`Letting the model write its own code for each question (code execution) is flexible and gives up the "tested once" guarantee; a fixed tool is the reverse.`,`The more steps the model orchestrates, the more places a sampled error can enter; a fixed workflow with one model call is more predictable than a free agent.`],
    traps:[`Believing that because a tool computed the number, the answer is right. The model chose the inputs, and a correct sum over the wrong window is still wrong.`,`Letting the explanation step restate numbers from memory instead of quoting the tool output, so the prose and the chart disagree.`,`Tools that return huge raw dumps, so the model summarises them and the summary is the new source of error.`,`Unseeded simulations, so re-running to check gives a different curve and nobody can tell drift from randomness.`,`Treating the rule as settled science. The arithmetic argument is weaker than it was in 2022; the reproducibility argument is the one to rely on.`],
    good:[`Every number in the final answer can be traced to a tool call with its logged inputs.`,`The tool has its own unit tests, and the model’s argument filling has its own eval set.`,`A reviewer can re-run the exact computation from the log and get the same result.`],
    bad:[`The chart says one thing and the model’s paragraph says another, and nobody knows which to believe.`,`A tool call failed silently and the model answered anyway from its own guess.`] },
  how:[`Draw the pipeline and label each step probabilistic or deterministic before building. The diagram below is the default shape.`,`Make tools small and typed: one job, named parameters with units, validated ranges, and an error the model can read, not a stack trace.`,`Seed and version the computation. Log tool name, arguments, seed and tool version with every answer.`,`Keep the explanation step honest: pass it the tool output and instruct it to quote numbers only from there. Check that automatically by comparing the numbers in the prose to the output.`,`Evaluate the orchestration separately: a set of questions with the expected tool and arguments, scored on selection and argument accuracy, run several times because tool-use reliability varies between runs.`,`Worked example, "is this economy inflating?": the model reads the question and maps it to the economy simulation with a 60-day window and the live tuning values. The simulation computes daily gold created by quests and drops (sources) and removed by repairs, taxes and shop purchases (sinks), and returns gold per active player per day. A chart shows the supply per player rising 4% a day after day 20 with sinks flat. The model explains: sources outgrow sinks once players reach the endgame zone. The number came from the simulation; the model only chose the inputs and put the result into words.`,`Prefer a fixed workflow (question in, one tool, chart out) over a free agent until the questions really vary. Add model freedom only where a fixed path failed.`],
  ai:{ yes:[`Map a loosely worded design question to the right tool and fill its typed arguments, for you to confirm.`,`Write a first version of the simulation or query as code you then test, rather than answering the number directly.`,`Explain a chart in plain language when it is given the data behind it.`],
       no:[`Produce the final numbers of a balance or economy decision from memory.`,`Decide that a tool’s output is plausible enough to skip checking the inputs it was given.`] },
  prompts:[{l:'Split a pipeline',p:`Here is a feature where a model answers [QUESTION TYPE] for our designers: [DESCRIBE]. List each step from question to chart. For each, say whether it is probabilistic or deterministic, what can go wrong, and how we would detect it. Point out any number that is currently produced by the model rather than by code.`},
    {l:'Tool, not answer',p:`Do not answer this with a number. Question: [QUESTION]. Write a small, seeded, deterministic function that computes it from these inputs [INPUTS], with unit tests for two cases I can check by hand. Then tell me which inputs you had to assume.`}],
  verify:[`Were the tool’s arguments the ones the question needed: the right window, units, player segment and build?`,`Does every number in the explanation appear in the tool output?`,`Re-run with the logged seed and inputs: is the result identical?`,`Did any tool call fail or time out before the answer was written?`],
  test:[`Build ten design questions with the expected tool and arguments; run each five times and count wrong tool, wrong argument and failed call.`,`Unit test the simulation on a hand-computed case, such as one player, one day, known faucet and sink.`,`Change one number in the tool output and check the explanation step reports the changed value, not a remembered one.`],
  diagram:{ kind:'flow', title:'From question to chart: which steps are sampled and which are computed',
    steps:[{id:'q', t:'Question', d:'human, free text'},{id:'interp', t:'Interpretation', d:'probabilistic: the model reads intent'},{id:'select', t:'Tool selection', d:'probabilistic: the model picks a tool'},{id:'input', t:'Structured input', d:'probabilistic, then validated by the schema'},{id:'compute', t:'Computation', d:'deterministic: seeded, tested code'},{id:'result', t:'Result', d:'deterministic: logged output'},{id:'explain', t:'Explanation', d:'probabilistic: quote the result only'},{id:'viz', t:'Visualisation', d:'deterministic: chart from the result'}],
    edges:[['q','interp'],['interp','select'],['select','input'],['input','compute'],['compute','result'],['result','explain'],['result','viz']],
    note:'Verification effort goes where the steps are probabilistic.' },
  facts:[{claim:`PAL (Gao et al., 2022), in which the model writes Python and an interpreter computes the answer, with Codex beat PaLM-540B using chain-of-thought on GSM8K by 15 points absolute top-1 accuracy.`,asOf:'2026-09-28',src:'https://arxiv.org/abs/2211.10435'},
    {claim:`Toolformer (Schick et al., 2023) learned to call a calculator, a Q&A system, two search engines, a translator and a calendar from a handful of demonstrations per API, and was often competitive with much larger models.`,asOf:'2026-09-28',src:'https://arxiv.org/abs/2302.04761'},
    {claim:`GSM-Symbolic (2024) found all tested models drop when only the numbers in a maths question change, and adding one clause that seems relevant but does not bear on the answer cut performance by up to 65%.`,asOf:'2026-09-28',src:'https://arxiv.org/abs/2410.05229'},
    {claim:`DeepSeek-R1 (2025) reports 79.8% pass@1 on AIME 2024 and 97.3% on MATH-500, with no tool or code interpreter described in the evaluation.`,asOf:'2026-09-28',src:'https://arxiv.org/html/2501.12948v1'},
    {claim:`On tau-bench (2024), state-of-the-art function-calling agents such as GPT-4o succeeded on under 50% of tasks, and pass^8 fell below 25% in the retail domain. These are 2024 models; re-measure on the model you use.`,asOf:'2026-09-28',src:'https://arxiv.org/abs/2406.12045'},
    {claim:`Anthropic’s code execution tool runs Bash and Python in a sandboxed container so the model can do calculations, analyse data and create visualisations inside the API conversation.`,asOf:'2026-09-28',src:'https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool'}],
  rel:[['models-hallucination-sycophancy','Why a number the model states from memory cannot be trusted as it stands.'],['models-sampling','The probabilistic steps are sampled, so the same question can route differently twice.'],['craft-verification-as-the-job','Where to check the steps the diagram marks probabilistic.'],['ai-agentic-implementation','Agents are this pipeline with more steps the model controls.']] });

ENGINE('craft-ai-orchestrates-tools-compute',{
  godot:{ term:`The tool a model calls is a static, seeded function on a RefCounted script. It takes a Dictionary parsed from the model’s JSON arguments and returns an array the chart and the log both read. It touches no scene, so it runs headless and in tests.`,
    api:['RefCounted / class_name','RandomNumberGenerator.seed','PackedFloat64Array','JSON.parse_string()','maxf()'],
    snippet:`class_name EconomySim extends RefCounted

# Deterministic tool: same params and seed, same curve.
static func run(p: Dictionary, days: int, rng_seed: int) -> PackedFloat64Array:
	var rng := RandomNumberGenerator.new()
	rng.seed = rng_seed
	var supply: float = p["start_supply"]
	var players: float = p["players"]
	var out := PackedFloat64Array()
	for day in days:
		var faucet: float = players * p["gold_per_player_day"] * rng.randf_range(0.9, 1.1)
		var sink: float = players * p["repair_cost_day"] + supply * p["tax_rate"]
		supply = maxf(supply + faucet - sink, 0.0)
		out.append(supply / players)
	return out`,
    pitfall:`Using the global randf() inside the tool. It shares one generator with the whole game and is randomised at startup, so re-running the same question gives a different curve and a reviewer cannot tell a real change from noise. A RandomNumberGenerator with an explicit seed, logged with the answer, is what makes the run reproducible.`,
    map:`A Godot RandomNumberGenerator with a seed is a Unity System.Random(seed), and a RefCounted static helper is a C# static class.` },
  unity:{ term:`The tool is a plain static C# class with no MonoBehaviour, so it runs in an EditMode test and from a batch-mode command. Arguments arrive as JSON and are parsed into a serializable parameter class, which is where validation belongs.`,
    api:['System.Random(seed)','JsonUtility.FromJson<T>()','[System.Serializable]','System.Math.Max'],
    snippet:`[System.Serializable]
public class EconomyParams {
    public double startSupply, players, goldPerPlayerDay, repairCostDay, taxRate;
}

public static class EconomySim {
    // Deterministic tool: same params and seed, same curve.
    public static double[] Run(EconomyParams p, int days, int seed) {
        var rng = new System.Random(seed);
        double supply = p.startSupply;
        var perPlayer = new double[days];
        for (int d = 0; d < days; d++) {
            double faucet = p.players * p.goldPerPlayerDay * (0.9 + 0.2 * rng.NextDouble());
            double sink = p.players * p.repairCostDay + supply * p.taxRate;
            supply = System.Math.Max(supply + faucet - sink, 0.0);
            perPlayer[d] = supply / p.players;
        }
        return perPlayer;
    }
}`,
    pitfall:`Calling UnityEngine.Random inside the tool. It is global state shared with gameplay and anything else that draws from it, so the result depends on what ran before, and it cannot be called off the main thread. A local System.Random with a logged seed keeps the tool pure.`,
    map:`Unity System.Random(seed) is a Godot RandomNumberGenerator with seed set, and JsonUtility.FromJson is JSON.parse_string().` } });

INTERVIEW('craft-ai-orchestrates-tools-compute',{
  junior:[
    { q:`Why would you have a model call a function to compute a drop-rate expectation instead of just asking it?`,
      a:`Because the function gives the same, testable answer every time, and its inputs can be logged and checked. The model’s direct answer is sampled, can change between runs, and may be wrong in a way that reads fluently. The model is still useful for turning the designer’s question into the function’s arguments.`,
      follow:`What would you still need to check after the function runs?`,
      red:`Says models are always bad at maths, or that the tool makes the answer automatically right.` },
    { q:`In the pipeline from question to chart, which steps are deterministic?`,
      a:`The computation, the stored result and the chart rendering. Interpretation, tool selection, filling the arguments and the explanation are probabilistic, because a model produces them by sampling. Schema validation makes the arguments safer but does not make them correct.`,
      follow:`Where would you look first if the chart looked wrong?`,
      red:`Treats the whole pipeline as either all AI or all code.` }],
  mid:[
    { q:`The model’s explanation says inflation is 2% a day but the chart shows 4%. What happened and how do you prevent it?`,
      a:`The explanation step produced its own number instead of quoting the tool output, or it was given a truncated or different result. Pass the exact result to that step, instruct it to cite only those values, and add an automatic check that every number in the prose appears in the output. Log both so the mismatch is caught in review.`,
      follow:`How would you write that check?`,
      red:`Suggests a better prompt and nothing that detects the mismatch.` },
    { q:`Is the "AI orchestrates, tools compute" rule still true now that reasoning models do well on maths benchmarks?`,
      a:`Partly. The 2022 argument that models cannot do arithmetic is weaker; recent reasoning models score highly on competition maths without tools. What still holds is that a tool is reproducible, testable and auditable and a sampled answer is not, and a 2024 study (GSM-Symbolic) showed model maths still shifts when only the numbers change or a distracting clause is added. And the rule breaks at orchestration: wrong tool, wrong arguments, early stop.`,
      follow:`What evidence would change your mind?`,
      red:`Defends or dismisses it with no evidence either way.` }],
  senior:[
    { q:`Design a tool-using assistant that answers economy questions for designers. Where do you put your verification budget?`,
      a:`On the probabilistic steps. The simulation gets unit tests once. The question-to-arguments mapping gets an eval set of real designer questions with expected tool and arguments, run several times per model change because reliability varies. Arguments are typed with units and ranges. Every answer logs tool, inputs, seed and version so it can be replayed, and the explanation is checked against the output. Start as a fixed workflow and only give the model more freedom where that failed.`,
      follow:`What would you put in the first ten eval questions?`,
      red:`Spends the effort re-checking the arithmetic and none on the arguments.` },
    { q:`When would you not use a tool and just let the model answer?`,
      a:`When the answer is a rough estimate a person will sanity-check anyway, the question is one-off, and building and maintaining a tool costs more than the error it prevents. Also when no deterministic model of the thing exists, such as how a feature will feel. The rule is about where correctness must be reproducible, not a ban on direct answers.`,
      follow:`Give an example from game production.`,
      red:`Says always use tools, or never bother.` }] });

T('craft-core-values-that-last',{ d:'craft', t:'Core values that last', tag:'Values that only held while code was expensive were habits. Test each one against a world where code is cheap and see what survives.',
  what:`A starting set of engineering values: clarity, correctness, reasoning over over-engineering, completeness or polish, and a clear line between probabilistic and deterministic parts. The test for each is one question: does it still matter, or matter more, when a model can write the code in seconds? Clarity survives and arguably grows, because code is now read far more than it is written, by people and by agents, and an agent follows the clarity of the spec it was given. Correctness survives unchanged in value and changes in method: it is now shown by checks, not by the author’s care. "Reasoning over over-engineering" is right but vague; sharpened, it becomes the simplest design that meets a stated need, with added complexity justified by a measured failure, which is also Anthropic’s published advice for building agent systems. "Completeness or polish" is the one that needs splitting: cheap generation makes surface polish nearly free and makes it dangerous, because finished-looking work hides unfinished thinking; the value that lasts is completeness of the job (edge cases, failure paths, handover), not finish. The probabilistic and deterministic line survives and generalises into knowing, for every part, how it can be wrong and how you would find out.`,
  why:[`A team copies what its leads value. If the values are vague, agents and juniors fill the gap with whatever looks finished.`,`Values that only made sense when writing code was slow, such as "write it all by hand to understand it", fade quietly and leave nothing in their place unless someone names what replaced them.`,`Refined values turn into review rules and agent instructions; vague ones cannot.`],
  think:{ q:[`For each value: would it still matter if producing code were free? If not, it was a cost habit, not a value.`,`Can you check the value in a review, or is it only a feeling?`,`Which value is currently used to justify gold-plating, and which to justify skipping work?`,`Where do two values conflict (clarity and completeness, simplicity and correctness), and which wins?`],
    trade:[`Simplicity against completeness: the smallest design can leave a failure path out. The rule is simplest design that handles the failures you know about, not the smallest code.`,`Clarity against speed: a spec clear enough for an agent takes longer to write than a vague prompt, and saves the rework.`,`Polish against evidence: polishing a prototype before the question it tests is answered spends effort where it may be thrown away.`],
    traps:[`Keeping "polish" as a value when it now mostly means output that looks done. It rewards generated finish over checked behaviour.`,`Reading "no over-engineering" as "no design". The value is against unjustified complexity, not against thought.`,`Stating correctness as a value with no named check, so it becomes the author’s confidence.`,`Adding new values every quarter. A set that grows stops being a set anyone can hold.`],
    good:[`Each value has a review question and an example of it being applied.`,`The team can say which value decided a recent trade-off.`,`Agent instructions and review checklists quote the same values.`],
    bad:[`"Quality" and "craft" on a poster, with nothing a reviewer can check.`,`Generated code merged because it looked complete, with no test of the path that failed.`] },
  how:[`Write each value as a claim and a check. Clarity: a new reader or an agent can state what this does and why from the code and its spec alone. Check: ask one.`,`Correctness, refined: behaviour is shown by an executed check that would fail if it were wrong. Check: which test fails if I break it?`,`Reasoning over over-engineering, refined: the simplest design that meets the stated need; every added layer names the failure it prevents. Check: delete the layer in your head; what breaks?`,`Completeness or polish, refined and renamed: complete means the job is done end to end, edge cases, errors, handover notes; polish is scheduled last and only on what survived. Check: what happens on the empty, the failing and the concurrent path?`,`Probabilistic and deterministic line, generalised: for every part, know how it can be wrong and how you would detect it. Check: for this component, name its failure mode and its detector.`,`Keep the list at five or fewer. When a new value is proposed, test whether it is a case of one already there.`,`Re-run the test each year, because what is cheap keeps changing.`],
  ai:{ yes:[`Argue against each of your values and find the cases where it gives a bad decision.`,`Turn a value into a draft review checklist item for you to test on recent pull requests.`],
       no:[`Choose the team’s values. They are commitments people make, not text a model produces.`,`Judge whether a piece of work meets "clarity" on your behalf; ask a real reader.`] },
  prompts:[{l:'Stress-test a value',p:`Here is one of our engineering values: [VALUE]. Give three concrete situations in game development where following it literally leads to a worse result, and one where it matters more now that agents write code. Then propose a sharper wording and a single review question that checks it.`},
    {l:'Value to checklist',p:`Turn these values [LIST] into review questions a reviewer can answer yes or no on a pull request in under a minute each. Flag any value you cannot turn into a checkable question.`}],
  verify:[`Does each value have a check someone could run on real work today?`,`Was any value kept only because it sounds good?`,`Has the list grown since last time, and did it need to?`],
  test:[`Take five recent merged changes and score them against the refined values. Where the values disagree with the team’s actual judgement, one of them is wrong.`,`Give the values to an agent as instructions for a small task and see which ones change its output. Values that change nothing may be too vague.`],
  facts:[{claim:`Anthropic’s agent-building guidance advises finding the simplest solution possible and increasing complexity only when needed, and distinguishes predefined workflows from model-directed agents.`,asOf:'2026-09-28',src:'https://www.anthropic.com/engineering/building-effective-agents'}],
  rel:[['craft-ai-orchestrates-tools-compute','The probabilistic and deterministic value, applied to a whole pipeline.'],['craft-engineer-in-the-ai-era','Values are what the judgement in that topic is exercised against.'],['bottleneck-shift','Cheap production is why values that were cost habits fall away.'],['verifying-ai-output','Correctness as a value needs a routine for checking output.']] });

INTERVIEW('craft-core-values-that-last',{
  junior:[
    { q:`What does "correctness" mean as a value when an AI wrote half the code?`,
      a:`That the behaviour is shown by a check that would fail if it were wrong, such as a test, not by how confident the author or the model was. The value is the same as before; the evidence required is more explicit, because the author may not have written every line.`,
      follow:`Show me a test that would fail if a given function were wrong.`,
      red:`Says the code is correct because it runs, or because the model said so.` },
    { q:`Why might "polish" be a risky value now?`,
      a:`Because generation makes finished-looking output cheap. Polished work that has not been checked hides gaps, and teams trust it more than they should. Completeness of the job, including failure paths, matters more than surface finish.`,
      follow:`When is polish the right thing to spend time on?`,
      red:`Thinks polish and completeness are the same thing.` }],
  mid:[
    { q:`Your lead says "no over-engineering". How do you decide whether an abstraction is justified?`,
      a:`Name the failure or cost it prevents. If there is a concrete one, such as a second consumer that exists today or a change that has happened twice, it earns its place. If it only prepares for an imagined future, leave it out and keep the code easy to change later.`,
      follow:`What if the future case is very likely?`,
      red:`Either abstracts everything by default or refuses all design.` },
    { q:`Two of the team’s values conflict on a change. How do you resolve it?`,
      a:`Make the conflict explicit, say which failure each value is protecting against in this case, and pick the one whose failure is worse or harder to undo. Record the decision so the next conflict of the same shape is quicker.`,
      follow:`Give an example between clarity and completeness.`,
      red:`Resolves it by seniority or taste with no reasoning.` }],
  senior:[
    { q:`How would you refresh a team’s engineering values for AI-assisted work?`,
      a:`Test each current value with one question: does it still matter if writing the code were free? Keep those that do, sharpen vague ones into a claim plus a check, split any that mix a lasting value with a cost habit, and keep the list short. Then put the checks into review templates and agent instructions and review in a year.`,
      follow:`Which of your own values failed that test?`,
      red:`Adds "use AI responsibly" as a value and changes nothing else.` },
    { q:`What value would you add that most teams do not state?`,
      a:`Knowing, for every component, how it can be wrong and how you would find out. It generalises the line between probabilistic and deterministic parts, and it covers models, networks, saves and humans the same way.`,
      follow:`How do you check it in a design review?`,
      red:`Names a slogan with no check.` }] });

T('craft-engineer-in-the-ai-era',{ d:'craft', t:'The engineer in the AI era', tag:'Typing code got cheap. Deciding what to build, saying it precisely, proving it works and keeping the system sane did not.',
  what:`What is expected of a game engineer when agents write much of the code. Four skills carry the job. Judgement: choosing what to build and what not to, and knowing when generated code is good enough. Specification: stating the behaviour precisely enough that an agent, or a colleague, builds the right thing, which usually means examples, constraints and tests rather than prose. Verification: showing that the result works, with checks that would catch it failing. Architecture: keeping boundaries, data ownership and dependencies clean so that many fast changes do not turn the codebase into a tangle; an agent inside a clear module does well, an agent in a ball of mud multiplies it. Speed of typing matters less. The evidence on raw speed is mixed and moving: a 2025 randomised study of experienced open-source developers using early-2025 tools found tasks took longer with AI, although the developers believed they were faster, and its authors said in 2026 that developers are likely sped up more now, on weak evidence. The DORA industry survey associated more AI adoption with slightly lower delivery throughput and stability in 2024, and in 2025 with higher throughput but still lower stability. That does not mean the tools are useless; it means gains depend on the skills above, not on the tool.`,
  why:[`Output that used to take a day now takes minutes, so the cost of a wrong decision or a vague spec arrives faster and in larger quantity.`,`Game code has long feedback loops (feel, balance, performance on target hardware) that no generator closes for you.`,`Interviewers now test these skills directly, because the ability to produce code is no longer a filter.`],
  think:{ q:[`What did I decide today that a model could not have decided for me?`,`Could an agent build this from my spec without asking a question? If not, what is missing?`,`What check would show this change is wrong?`,`Which module boundary is this change crossing, and should it?`,`Am I faster, or do I just feel faster? What did I measure?`],
    trade:[`Delegating more to agents raises throughput and raises review load; past a point review becomes the bottleneck.`,`Writing tests first costs time up front and makes agent output checkable.`,`Tight architecture slows the first feature and speeds every later agent change.`],
    traps:[`Measuring yourself by lines or pull requests produced.`,`Accepting generated code you could not explain in review.`,`Letting agents choose architecture one file at a time.`,`Assuming the speedup is real because it feels real; in METR’s 2025 controlled trial, developers were slower while believing they were faster.`],
    good:[`You can explain every change you ship, including the parts an agent wrote.`,`Specs come with examples and tests, and agents rarely need a second round.`,`Module boundaries are stable while features change quickly.`],
    bad:[`The team ships more and the bug rate rises with it.`,`Nobody can say why a system is structured the way it is.`] },
  how:[`Judgement: before starting, write one line on what the change is for and what you are choosing not to do.`,`Specification: give agents inputs, expected outputs, edge cases and constraints, ideally as failing tests; name the files and the boundary they must stay inside.`,`Verification: run the checks CI runs, read the diff, and try the failure path yourself; see the verification topic for method.`,`Architecture: own the module map and the data ownership rules yourself; let agents work inside modules, not across them without review.`,`Measure your own speed on a few comparable tasks with and without tools rather than trusting the feeling.`,`Interviews, as a candidate: expect to be asked to review or fix generated code, to write a spec, or to explain a trade-off; practise reading code critically out loud. As an interviewer: test judgement and verification with a flawed generated solution, and ask why, not only what.`],
  ai:{ yes:[`Write first drafts inside a clear spec and boundary.`,`Propose several designs so you can compare trade-offs.`,`Find call sites, draft tests and explain unfamiliar code.`],
       no:[`Decide architecture or data ownership.`,`Sign off that a change is correct.`,`Decide what the game needs.`] },
  prompts:[{l:'Spec before code',p:`Before writing any code for [FEATURE], restate it as: inputs, outputs, three edge cases, constraints on performance and platform, and the files you will touch. List any question you would need answered. Do not write code until I confirm.`},
    {l:'Interview practice',p:`Give me a short, plausible but subtly wrong Unity or Godot function for [SYSTEM] as an interviewer might. Do not tell me the bug. After I answer, grade my review on what I caught, how I would prove it, and what I missed.`}],
  verify:[`Can you explain every line of the change?`,`Was the spec specific enough that the agent did not have to guess?`,`Did the change stay inside its module?`],
  test:[`Time three similar tasks with and without an agent and compare, including review time.`,`Give your spec to a colleague without context and see what they would build.`],
  facts:[{claim:`A 2025 METR randomised controlled trial with 16 experienced open-source developers on 246 tasks found AI tools increased completion time by 19%, while the developers forecast a 24% speedup beforehand and estimated 20% afterwards.`,asOf:'2026-09-28',src:'https://arxiv.org/abs/2507.09089'},
    {claim:`The 2024 DORA report associates a 25% increase in AI adoption with a 1.5% decrease in delivery throughput and a 7.2% reduction in delivery stability, alongside gains in documentation quality, code quality and review speed.`,asOf:'2026-09-28',src:'https://cloud.google.com/blog/products/devops-sre/announcing-the-2024-dora-report'},
    {claim:`The 2025 DORA report, unlike 2024’s, found a positive relationship between AI adoption and software delivery throughput, while AI adoption still had a negative relationship with delivery stability.`,asOf:'2026-09-28',src:'https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report'},
    {claim:`In a February 2026 update, METR said developers are likely more sped up by AI tools in early 2026 than its early-2025 estimate, while calling its new data only very weak evidence because of selection effects.`,asOf:'2026-09-28',src:'https://metr.org/blog/2026-02-24-uplift-update/'}],
  rel:[['bottleneck-shift','The same shift from production to judgement, seen from design.'],['craft-verification-as-the-job','Verification is the skill this topic says became scarce.'],['craft-core-values-that-last','The values judgement is exercised against.'],['ai-agentic-implementation','How to run agents on real implementation work.'],['craft-what-matters-now','The short version: understanding over output, verification and simplicity.']] });

INTERVIEW('craft-engineer-in-the-ai-era',{
  junior:[
    { q:`An agent wrote a working inventory system for you. What do you do before opening a pull request?`,
      a:`Read and understand every part, run the tests and the checks CI runs, try the edge cases such as a full inventory or a stack at its limit, and make sure it stays inside the inventory module. If I cannot explain a part, I either learn it or rewrite it.`,
      follow:`Which edge case would you try first?`,
      red:`Opens the pull request because it compiled and seemed to work.` },
    { q:`What makes a good spec for an agent?`,
      a:`Inputs and expected outputs, examples, edge cases, constraints such as platform and performance, and which files it may touch. Failing tests are the most precise form.`,
      follow:`Write one for a cooldown timer.`,
      red:`Says a one-line description is enough.` }],
  mid:[
    { q:`Your team feels twice as fast with AI tools. How would you check?`,
      a:`Measure comparable tasks end to end including review and bug fixing, and track delivery stability, not just output. A 2025 controlled study found experienced developers using early-2025 tools were slower with AI while believing they were faster, so feeling is not evidence.`,
      follow:`What would you measure in a game team specifically?`,
      red:`Counts pull requests or lines.` },
    { q:`Where should an engineer not let an agent decide?`,
      a:`Architecture, data ownership, anything with security or save-data risk, and the final call that a change is correct. Those decisions shape everything after and are hard to undo.`,
      follow:`How do you enforce that in practice?`,
      red:`Lets the agent restructure modules freely.` }],
  senior:[
    { q:`How would you interview an engineer now that everyone can generate code?`,
      a:`Give them a plausible generated solution with a subtle bug and a design flaw, and ask them to review it, prove the bug, and propose a fix. Ask them to write a spec for a small feature and defend the trade-offs. That tests judgement, specification and verification, which are what the job now needs.`,
      follow:`How do you keep that fair to someone who does not use AI tools?`,
      red:`Still tests only whether they can write an algorithm from memory.` },
    { q:`Agents are producing lots of changes and the codebase is degrading. What do you do?`,
      a:`Tighten the architecture: clear module boundaries, ownership, and rules on what an agent may touch. Make review focus on boundaries and failure paths. Slow the rate of change until the checks catch regressions, and add tests at boundaries so agents inside modules cannot break others silently.`,
      follow:`What metric tells you it is working?`,
      red:`Adds more agents to fix it.` }] });

T('craft-verification-as-the-job',{ d:'craft', t:'Verification as the job', tag:'When code is cheap, knowing it works is the scarce part. Make checks that run fast, fail loudly and do not trust the author.',
  what:`The engineering practice of showing, quickly and repeatably, that code behaves as intended, applied to output an agent produced faster than anyone can read line by line. Where the AI collaboration topic on verifying output is about the questions to ask, this one is about the machinery: tests written as the spec before the code, property checks that try many inputs, reading diffs rather than files, and runs that are reproducible so a result can be checked again. It became the scarce skill for a plain reason: generation is fast and cheap, and review is still human-paced, so the gap between how much is produced and how much is known to work grows unless checks do the work. Tests are not automatically enough. When researchers added far more tests to a well-known code benchmark, many solutions that had passed started failing, which shows how weak a small test suite can be as a proof. Checks also decide which of many generated answers is right: OpenAI’s o1-based entry at the 2024 International Olympiad in Informatics chose its 50 submissions per problem by running public tests, tests the model wrote and a learned scorer, and scored 213 points where random picks would have averaged 156.`,
  why:[`A test is a spec an agent can run against itself; prose is a spec it can only guess at.`,`Game bugs hide in state and time: saves, frame order, network ordering, a rare seed. Checks that sample many cases find them; reading does not.`,`A reproducible run turns "it worked on my machine" into a result another person or an agent can confirm.`,`An agent can make tests pass by weakening them; verification has to watch the tests as closely as the code.`],
  think:{ q:[`Which check would fail if this change were wrong? If none, it is not verified.`,`Were the tests written before the code, or generated with it and possibly by it?`,`What property must hold for all inputs, not just the three examples?`,`Can someone else re-run this and get the same result, including the seed and build?`,`Did the diff change any test, assertion or threshold?`],
    trade:[`More checks slow the pipeline; choose ones that fail on real bugs, and run the slow ones less often.`,`Property tests find more and are harder to write and to debug when they fail.`,`Strict reproducibility (pinned seeds, fixed builds) can hide bugs that only appear with variation; run both fixed and randomised seeds.`],
    traps:[`Letting the same agent write the code and the tests in one step, so the tests confirm what the code does, not what it should do.`,`Accepting a diff that edits a test to match new behaviour without asking whether the old behaviour was right.`,`Running a subset of tests locally and calling it green.`,`Trusting a small example suite as proof; small suites miss many wrong solutions.`,`Checking only the happy path because the output looked complete.`],
    good:[`Every change names the check that proves it.`,`Test changes are reviewed separately and with suspicion.`,`Any failure can be reproduced from a logged seed and build.`],
    bad:[`Coverage rises and escaped bugs do not fall.`,`Reviewers approve long diffs they skimmed because the tests were green.`] },
  how:[`Tests as specs: write or approve the failing tests first, then let the agent implement until they pass. Keep those tests read-only for the agent.`,`Property checks: state an invariant, such as "total gold never goes negative" or "save then load returns an equal state", and run it over many generated inputs with a fixed seed you can replay.`,`Diffs: review the diff, not the files; look first at deleted lines, changed tests, changed thresholds and new dependencies.`,`Reproducible runs: pin seeds, record build ids, and make a failing case replayable from one command.`,`Run the same command CI runs, and treat a red baseline as a blocker before you start.`,`Speed: put cheap checks (types, lint, unit tests) in the agent’s loop so it fixes its own errors, and keep the human for the diff and the failure paths.`],
  ai:{ yes:[`Generate extra test cases and property inputs from a spec you wrote.`,`Summarise a large diff by risk: deleted logic, changed tests, new dependencies.`,`Find the smallest reproducing case for a failure.`],
       no:[`Mark its own work as verified.`,`Change a test to make it pass without your approval.`] },
  prompts:[{l:'Tests first',p:`Here is the behaviour I want for [SYSTEM]: [SPEC]. Write failing tests only, covering these cases [CASES] and one property that must hold for all inputs. Do not write the implementation. List any behaviour the spec leaves undefined.`},
    {l:'Diff risk review',p:`Review this diff [DIFF] and list, in order of risk: removed checks or branches, changed or deleted tests and assertions, changed constants, and new dependencies. For each, say what could break and which test would catch it.`}],
  verify:[`Did you run the full check CI runs, not a subset?`,`Did any test or threshold change in this diff, and was that intended?`,`Can the failing case be replayed from a seed?`],
  test:[`Break the code on purpose (flip a comparison, drop a sink) and confirm a test fails. If none does, the suite is not a spec.`,`Run the property check with several seeds and keep any failing one as a fixed regression test.`],
  facts:[{claim:`Codex (Chen et al., 2021) solved 28.8% of HumanEval problems with one sample and 70.2% with 100 samples per problem, measuring functional correctness with unit tests.`,asOf:'2026-09-28',src:'https://arxiv.org/abs/2107.03374'},
    {claim:`EvalPlus (2023) extended HumanEval’s tests 80 times, which reduced reported pass@k of code models by up to 19.3 to 28.9%.`,asOf:'2026-09-28',src:'https://arxiv.org/abs/2305.01210'},
    {claim:`OpenAI, "Learning to reason with LLMs" (12 September 2024): a model trained from o1 scored 213 points at the 2024 IOI by selecting submissions with public test cases, model-generated test cases and a learned scoring function; submitting at random would have averaged 156 points.`,asOf:'2026-09-29',src:'https://openai.com/index/learning-to-reason-with-llms/'},
    {claim:`The OpenAI o1 System Card (December 2024) describes SWE-bench Verified as a human-validated 500-task subset that fixes incorrect grading of correct solutions and overly specific unit tests, and reports o1 at 40.9% and o1-preview at 41.3% pass@1 on it.`,asOf:'2026-09-29',src:'https://arxiv.org/abs/2412.16720'}],
  rel:[['verifying-ai-output','The questions to ask of AI output; this topic is the machinery that answers them.'],['craft-ai-orchestrates-tools-compute','Deterministic tools are what make parts of a pipeline checkable once.'],['craft-engineer-in-the-ai-era','Verification is one of the four skills the job now rests on.'],['ai-evals','Evals are verification for model behaviour rather than code.']] });

INTERVIEW('craft-verification-as-the-job',{
  junior:[
    { q:`Why write the tests before asking an agent to implement a feature?`,
      a:`The tests become a spec the agent can run, and they were written from what the feature should do, not from what the code happens to do. If they are written after, from the code, they tend to confirm the bugs.`,
      follow:`Who should be allowed to edit those tests?`,
      red:`Says order does not matter as long as there are tests.` },
    { q:`What is a property check? Give a game example.`,
      a:`A rule that must hold for all inputs, checked over many generated cases. For example, saving and then loading any game state returns an equal state, or the player’s gold never goes below zero after any sequence of purchases.`,
      follow:`How do you reproduce a failure it finds?`,
      red:`Describes a single example test.` }],
  mid:[
    { q:`An agent’s pull request passes CI but changes three assertions. What do you do?`,
      a:`Treat the assertion changes as the most important part of the review. For each, decide whether the old expected behaviour was wrong or the new code is. If I cannot tell, the change is not verified. I would ask for test changes to come in a separate, explained commit.`,
      follow:`How do you stop this in future?`,
      red:`Approves because CI is green.` },
    { q:`Your tests all pass. How do you know they are good enough?`,
      a:`Break the code on purpose and see whether a test fails. Research on code benchmarks found that adding many more tests caught solutions small suites had passed, so a passing suite is only as strong as the bugs it can detect.`,
      follow:`What is that technique called when automated?`,
      red:`Cites coverage percentage as proof.` }],
  senior:[
    { q:`Review has become the bottleneck with agents producing many changes. How do you scale verification?`,
      a:`Move checks into the agent’s loop so it fixes type, lint and unit failures itself. Keep humans on diffs, test changes, boundaries and failure paths. Add property and replayable tests at module boundaries. Keep changes small so each diff is reviewable, and slow the change rate if the checks cannot keep up.`,
      follow:`What would you not automate?`,
      red:`Adds a second agent to review the first and stops there.` },
    { q:`A rare desync appears in one match in a thousand. How do you verify a fix?`,
      a:`Make it reproducible first: log seeds, inputs and build, and replay until the failing case reproduces from one command. Turn that into a regression test, then run a property check comparing simulations across many seeds. The fix is verified when the replay passes and the property run finds no new failure.`,
      follow:`What if you cannot reproduce it?`,
      red:`Ships a fix and waits to see whether reports stop.` }] });

T('craft-best-practice-now',{ d:'craft', t:'Best practice that still pays', tag:'Small diffs, honest names and tests beside the code were always the cheap way to stay fast. Now an agent writes half the code, and they are how you review it.',
  what:`The habits that keep a game codebase changeable: changes small enough to review in one sitting, names that say what a thing is for, a test or a debug check next to the code it guards, one idea per commit, and a build that tells you it is broken before a player does. AI tools changed the price of these habits. Typing got cheap, so a large diff costs nothing to produce and just as much as ever to review. Reading and verifying are now the bottleneck, and the habits that make code easy to read and verify have risen in value, while habits that were about saving keystrokes have mostly stopped mattering.`,
  why:[`A reviewer’s attention runs out long before a diff does. A 2,000 line change gets skimmed and approved, and whatever it breaks ships.`,`Game code changes late and often: a balance pass, a platform fix, a live event. Code that was written to be read is the code you can still change a week before submission.`,`An agent writes to the standard the repository enforces. Tests, types and lint rules that exist get respected, and conventions that live in someone’s head get ignored.`,`A small, named, tested change can be reverted alone. A large mixed one cannot, and a bad night before a certification build is when that difference matters.`],
  think:{ q:[`Can a reviewer hold this whole diff in their head? If not, what is the seam to split it on?`,`Does each name say what the thing is for in the game, not how it is implemented?`,`Where is the check that would fail if this broke: a test, an assert, a debug overlay, or nowhere?`,`Did this change mix a refactor with a behaviour change, so neither can be reviewed or reverted cleanly?`,`Which rule here is enforced by a tool and which only by memory? Only the first one binds an agent.`,`Would the next developer, or the next agent session, understand why this is the way it is without asking you?`],
    trade:[`Small diffs cost more pull requests and more waiting on review. Large ones cost review quality, which you cannot see until it ships a bug.`,`Tests for gameplay feel are expensive and brittle. Tests for rules, formulas, save data and parsing are cheap and catch real regressions. Spend where the cheap ones are.`,`Strict lint and type rules slow the first draft and speed every later read. With an agent drafting, the first draft is the cheap part.`],
    traps:[`Accepting a generated diff because it compiles and looks plausible. Plausible is what the model optimises for; correct is what you have to check.`,`Letting an agent "tidy up" while it fixes a bug, so a one-line fix arrives inside a 400 line reformat.`,`Names that describe type or mechanics, like dataManager or tempList2, instead of role, like pendingRewards.`,`Tests that assert the code does what it does, written by the same agent from the same misunderstanding.`,`Comments that restate the next line. They rot, and agents copy them as style.`,`Treating a green local run of two test files as the suite passing.`],
    good:[`Every pull request has one purpose you can state in its title, and a reviewer finishes it in under half an hour.`,`Save format, damage formulas and data parsing each have tests that run on every push.`,`The project rules an agent reads (lint config, formatter, agent instruction file) match what humans are held to.`],
    bad:[`The main branch is broken for a day and nobody knows which of twelve merged changes did it.`,`Reviews say "LGTM" on diffs no one read, because they are too big to read.`] },
  how:[`Split by seam: a pure refactor with no behaviour change first, then the behaviour change on top. Each is reviewable and revertable alone.`,`Name by role in the game. A reader should learn what a variable holds for the player, not its container type.`,`Put tests where the logic is deterministic: rules, formulas, state transitions, serialisation, network message parsing. Keep them in the project and run them in CI, not on a wiki.`,`Put asserts and debug checks where tests are impractical: invariants in physics callbacks, frame-time guards, state that must never be negative.`,`Make the build tell the truth. Run the same test command CI runs before calling anything done.`,`Write the rule down where tools read it. An agent follows a lint rule and a failing test; it does not follow tribal knowledge.`,`Review generated code harder than human code, not softer, and read the tests it wrote first: they show what it thought the task was.`,`Keep commits to one idea with a message that says why. History is the documentation that cannot go stale.`],
  ai:{ yes:[`Split a large change into a refactor commit and a behaviour commit, and explain the seam.`,`Write the boring tests: serialisation round trips, formula tables, parser edge cases.`,`Review a diff for mixed concerns, misleading names and missing checks.`,`Suggest role-based names for a list of variables and fields, with the reason for each.`],
       no:[`Decide what the game should do when the tests and the design document disagree.`,`Be trusted to write both the code and the only test of it from the same prompt.`,`Judge feel, timing or readability of gameplay. Those need a person holding a controller.`] },
  prompts:[{l:'Split this diff',p:`Here is a diff: [PASTE]. Split it into the smallest sequence of commits where each one builds, passes tests and has one purpose. Put pure refactors (no behaviour change) before behaviour changes. For each commit give a title, the files it touches and why it is safe on its own. Flag anything that looks like an unrelated change and should be dropped.`},
    {l:'Review for readability',p:`Review this [LANGUAGE/ENGINE] code for a game [SYSTEM]: [PASTE]. Report only: names that describe implementation instead of role, functions doing more than one thing, missing checks on invariants, comments that restate code, and behaviour changes hidden inside refactors. For each give the line and the smallest fix. Do not rewrite the file.`}],
  verify:[`Did the generated change stay inside the files the task needed, or did it touch others?`,`Do the tests fail when you break the code they guard? Break it once and see.`,`Did it add a guard for a state an upstream check already rules out?`],
  test:[`Measure median pull request size and review time for a month. If size goes up after adopting an agent and review time does not, reviews got shallower.`,`Revert one recent change alone on a branch. If it will not revert cleanly, the change was not one idea.`,`Mutate one line in a tested formula and run the suite. If nothing fails, the test was decoration.`],
  facts:[{claim:`Google’s engineering practices guide recommends small CLs, saying they are reviewed more quickly and thoroughly, are less likely to introduce bugs, and are easier to roll back.`,asOf:'2026-09-28',src:'https://google.github.io/eng-practices/review/developer/small-cls.html'}],
  rel:[['backend-testing','The test habits here are the same ones the backend topic applies to services.'],['backend-go-idioms','Naming and small interfaces are where language idiom and general craft meet.'],['craft-design-patterns','Patterns are the vocabulary a reviewer uses to read a change quickly.'],['craft-performance','Measuring before changing is the performance form of the same discipline.']] });
INTERVIEW('craft-best-practice-now',{
  junior:[
    { q:`Why keep pull requests small if a tool can write a big one just as fast?`,
      a:`Because writing was never the expensive part; reading is. A reviewer can check a 150 line change properly and will skim a 2,000 line one. Small changes are also revertable alone. Give a concrete split, such as a rename first and then the behaviour change.`,
      follow:`How would you split a change that adds a new weapon and fixes an ammo bug?`,
      red:`Says small pull requests are just a team preference.` },
    { q:`What makes a good variable name in gameplay code?`,
      a:`It names the role for the game, like respawnDelaySeconds or pendingRewards, including units where they matter. It does not name the container type or a vague manager. A good name removes the need for a comment.`,
      follow:`Rename "data" in a function that returns the enemies the player can currently lock onto.`,
      red:`Focuses only on casing conventions.` }
  ],
  mid:[
    { q:`What in a game is worth unit testing, and what is not?`,
      a:`Test deterministic logic: damage formulas, inventory rules, state transitions, save and load round trips, network message parsing. Do not unit test feel, camera or animation timing; those need playtests, asserts and debug views. Name one regression a save round-trip test would have caught.`,
      follow:`How do you test a save format across versions?`,
      red:`Either tests nothing or claims everything, including feel, can be unit tested.` },
    { q:`An agent sends you a 600 line diff that fixes the bug and "cleans up" the file. What do you do?`,
      a:`Ask for, or make, the fix alone, and a separate refactor if it is wanted. Read the tests first to see what it thought the task was. Check whether it touched files outside the task and whether any removed code had callers on other branches.`,
      follow:`What rule would you add so this does not happen again?`,
      red:`Approves because the game runs.` }
  ],
  senior:[
    { q:`Which engineering habits got more valuable after your team adopted AI coding tools, and which less?`,
      a:`More valuable: small reviewable diffs, tests on deterministic logic, rules enforced by tools, clear names, commit messages with intent, because verification is now the bottleneck. Less valuable: habits about saving typing, like boilerplate generators and memorising APIs. Back it with a measure, such as review time per line, not a feeling.`,
      follow:`How do you tell whether review quality dropped?`,
      red:`Says nothing changed, or that tests matter less because the model is good.` },
    { q:`How do you make a codebase’s standards bind an agent?`,
      a:`Encode them where tools read: formatter, analyser rules, types, CI tests, and a short instruction file. A standard that only lives in reviews is re-argued every change. Then check the agent’s output against the same gate humans face.`,
      follow:`Which standard of yours cannot be encoded, and how do you handle it?`,
      red:`Relies on writing long prose instructions and never checks them.` }
  ] });

T('craft-memory-and-gc',{ d:'craft', t:'Memory, allocation and garbage collection', tag:'A frame does not care how fast your allocator is. It cares whether the collector wakes up in the middle of a boss fight. Stop allocating in the loop and the question goes away.',
  what:`Every language a game uses manages memory one of three ways. A tracing garbage collector (C# in Unity, C# in Godot, Go) finds unreachable objects and frees them when it decides to run, which costs time you did not schedule. Reference counting (GDScript’s RefCounted, C++ shared_ptr) frees an object the moment its last reference goes, cheaply and predictably, but leaks cycles. Manual or owned memory (Godot Object and Node, C++ unique_ptr and raw allocation) is freed exactly when you say so, and wrong if you forget. In a game the practical rule is the same in all three: allocate at load, reuse during play, and make the per-frame path allocation free.`,
  why:[`Unity’s managed heap uses the Boehm-Demers-Weiser collector. Incremental mode spreads the work over frames, but garbage made every frame still has to be collected, and if references change faster than incremental marking can keep up, Unity falls back to a full, non-incremental collection. The web platform has no incremental mode at all.`,`Mobile and handheld frame budgets leave a few milliseconds of slack at most. A collection that fits on desktop can be the whole frame on a phone.`,`Allocations hide in innocent code: string concatenation, LINQ, lambdas that capture, boxing a struct through an interface, foreach over some collections, API calls that return a fresh array.`,`Godot scripts mostly avoid a tracing collector, but a RefCounted cycle leaks silently and a Node you remove but never free stays in memory for the whole session.`],
  think:{ q:[`What allocates per frame right now? Have you looked at GC Alloc in the profiler, or are you guessing?`,`Which objects are created and destroyed at gameplay rate: bullets, damage numbers, particles, pathfinding requests?`,`Is this type a class because it needs identity, or could it be a struct passed by value?`,`Who owns this object, and who is responsible for freeing it? In Godot, is it a Node, an Object or a RefCounted?`,`Does anything hold a reference back to its owner, forming a cycle?`,`Is the allocation at load time, where it is fine, or in Update, where it is not?`],
    trade:[`Pooling removes allocation and adds state bugs: a reused object that still carries last life’s velocity, timer or subscribers.`,`Structs avoid the heap and copy on every assignment. Large mutable structs are slower and cause bugs where you change a copy.`,`Caching arrays and strings removes garbage and costs memory held all session, which matters on low-memory devices.`,`LINQ and closures are clear and allocate. At load or in editor tools that is fine; in a per-frame loop it is not.`],
    traps:[`Concatenating strings for a UI label every frame instead of updating only when the value changes.`,`Calling an API that returns a new array each call inside Update, where a non-allocating overload exists.`,`Boxing: passing a struct as object or through a non-generic interface, or using an enum as a dictionary key with a boxing comparer on older runtimes.`,`A lambda that captures a local, allocated fresh every time the method runs.`,`Pooled objects that keep event subscriptions from their last use, so a dead bullet still reacts to a pause event.`,`In Godot, remove_child without queue_free, leaving an orphan node alive forever.`,`Two RefCounted objects that reference each other, neither ever reaching zero.`],
    good:[`The profiler shows zero GC Alloc in steady gameplay, and allocations only at load and scene transitions.`,`Every high-rate object type has a pool with a documented reset.`,`Orphan node and object counts stay flat across an hour of play.`],
    bad:[`A hitch every few seconds on device that vanishes in the editor.`,`Memory that climbs steadily across a play session and only resets on a scene reload.`] },
  how:[`Profile first. In Unity, sort the CPU Profiler hierarchy by GC Alloc in a development build on the target device. In Godot, watch the object and orphan node monitors.`,`Allocate at load: preallocate lists with capacity, cache component references, build lookup tables once.`,`Pool anything created at gameplay rate. Unity has UnityEngine.Pool.ObjectPool<T>; in Godot, keep a pool of hidden nodes and toggle process mode and visibility instead of instancing.`,`Reset pooled objects fully on reuse: position, velocity, timers, and every subscription.`,`Prefer non-allocating APIs in hot paths, such as the NonAlloc physics queries and overloads that fill a buffer you pass.`,`Use structs for small plain data, and Span<T> or stackalloc for short-lived scratch buffers in C#.`,`Update text only on change, and use a StringBuilder or a formatted buffer when it does change.`,`In GDScript, extend RefCounted for plain data, and break back-references with weakref. Free Nodes with queue_free.`,`In C++, express ownership in types: unique_ptr for one owner, shared_ptr only where ownership is truly shared, raw pointers and references for non-owning use.`],
  ai:{ yes:[`Scan a script for per-frame allocations and name each one with its fix.`,`Convert a Instantiate/Destroy pattern into an object pool with a reset method.`,`Explain why a profiler shows GC Alloc on a line that looks innocent.`,`Write a soak test that logs memory and object counts every minute.`],
       no:[`Tell you whether the garbage matters on your target device without a profile from that device.`,`Be trusted on runtime-specific allocation behaviour without checking; it varies by Unity version and scripting backend.`,`Decide pool sizes; they come from peak counts measured in play.`] },
  prompts:[{l:'Find per-frame garbage',p:`Here is a [Unity C# / Godot GDScript / Godot C#] script: [PASTE]. List every allocation that can happen in the per-frame path ([Update/_process/_physics_process]). For each give the line, what allocates (string, closure, boxing, array return, LINQ, collection growth), and the non-allocating fix. Mark any you are not sure about for this engine version as uncertain rather than guessing.`},
    {l:'Pool this',p:`This code creates and destroys [OBJECT] at about [RATE] per second: [PASTE]. Convert it to a pool for [ENGINE AND VERSION]. Include a reset method that clears every piece of per-life state, including signals or event subscriptions, and say what the pool does when it runs out.`}],
  verify:[`Does the profiler actually show GC Alloc gone on the lines it changed, in a development build?`,`Does the pooled object reset every field, including subscriptions?`,`Is the API it used real for this engine version, and is it the non-allocating overload?`],
  test:[`Play one minute of the heaviest combat on the target device with the profiler attached and record GC Alloc per frame. The target is zero in steady state.`,`Soak for an hour and chart memory, object count and orphan node count. A flat line passes; a slope is a leak.`,`Spawn ten times the expected peak of pooled objects and check the fallback behaviour.`],
  facts:[{claim:`Unity uses the Boehm-Demers-Weiser garbage collector and enables incremental garbage collection by default, spreading collection over multiple frames; the web platform does not support incremental mode, and heavy reference changes can force a full collection.`,asOf:'2026-09-28',src:'https://docs.unity3d.com/6000.0/Documentation/Manual/performance-incremental-garbage-collection.html'},
    {claim:`Godot’s RefCounted frees itself when no references remain, while a plain Object must be freed manually with free(); RefCounted cycles are not freed automatically and weakref() can break them.`,asOf:'2026-09-28',src:'https://docs.godotengine.org/en/stable/classes/class_refcounted.html'}],
  rel:[['backend-go-idioms','Go is a garbage-collected language too, and its advice on reducing allocation in hot paths is the same idea on a server.'],['craft-performance','Allocation is one of the first things a profile shows; the performance topic is how to read it.'],['craft-design-patterns','Object Pool is one of the Optimization Patterns in Nystrom’s book.'],['craft-best-practice-now','Measuring before optimising is the same discipline as testing before claiming.']] });
ENGINE('craft-memory-and-gc',{
  unity:{ term:`Managed C# objects live on a heap swept by an incremental Boehm collector. Garbage made in Update is paid for later, at a time you do not choose. UnityEngine.Pool provides a ready pool type.`,
    api:['UnityEngine.Pool.ObjectPool<T>','ObjectPool<T>.Get() / Release()','Physics.OverlapSphereNonAlloc()','GameObject.SetActive()','System.Text.StringBuilder','Profiler window: GC Alloc column'],
    snippet:`using UnityEngine;
using UnityEngine.Pool;

public class Bullet : MonoBehaviour {              // your own bullet component
    ObjectPool<Bullet> home;
    public void Launch(Transform muzzle, ObjectPool<Bullet> pool) {
        home = pool;                               // remembers its pool, returns itself when spent
        transform.SetPositionAndRotation(muzzle.position, muzzle.rotation);
    }
    public void ResetState() { /* clear velocity, timers, trails */ }
    public void Despawn() => home.Release(this);
}

public class Gun : MonoBehaviour {
    [SerializeField] Bullet prefab;
    ObjectPool<Bullet> pool;
    readonly Collider[] hits = new Collider[16];   // allocated once

    void Awake() {
        pool = new ObjectPool<Bullet>(
            () => Instantiate(prefab),
            b => b.gameObject.SetActive(true),
            b => { b.ResetState(); b.gameObject.SetActive(false); },
            b => Destroy(b.gameObject),
            collectionCheck: false, defaultCapacity: 64, maxSize: 256);
    }

    // Called by the input layer (Input System package) while fire is held.
    public void Fire() => pool.Get().Launch(transform, pool);

    void Update() {
        int n = Physics.OverlapSphereNonAlloc(transform.position, 3f, hits);
        for (int i = 0; i < n; i++) { /* no LINQ, no lambdas here */ }
    }
}`,
    pitfall:`Profiling in the editor and trusting it. Editor-only code allocates, and IL2CPP on device behaves differently from Mono in the editor. Measure GC Alloc in a development build on the target hardware.`,
    map:`Unity’s ObjectPool<T> with SetActive is Godot’s pool of hidden nodes with process_mode disabled.` },
  godot:{ term:`GDScript has no tracing collector. RefCounted objects free themselves at zero references; Nodes and plain Objects are freed by you. C# scripts in Godot use the .NET collector, so the Unity advice applies to them.`,
    api:['RefCounted','Node.queue_free()','weakref()','Node.process_mode / PROCESS_MODE_DISABLED','Performance.OBJECT_ORPHAN_NODE_COUNT','PackedScene.instantiate()'],
    snippet:`extends Node
class_name BulletPool

@export var bullet_scene: PackedScene
@export var size := 64
var _free: Array[Node2D] = []

func _ready() -> void:
\tfor i in size:
\t\tvar b: Node2D = bullet_scene.instantiate()
\t\t_park(b)
\t\tadd_child(b)

func take() -> Node2D:
\tif _free.is_empty():
\t\treturn null   # pool exhausted: caller skips the shot
\tvar b: Node2D = _free.pop_back()
\tb.visible = true
\tb.process_mode = Node.PROCESS_MODE_INHERIT
\treturn b

func give_back(b: Node2D) -> void:
\tif b.has_method("reset"):
\t\tb.call("reset")    # bullet.gd, the root script of bullet_scene, defines func reset(): clear velocity, timers, connections
\t_park(b)

func _park(b: Node2D) -> void:
\tb.visible = false
\tb.process_mode = Node.PROCESS_MODE_DISABLED
\t_free.append(b)`,
    pitfall:`Calling remove_child to "despawn" and never queue_free. The node is out of the tree but alive, and the orphan count climbs all session. Either free it or keep it in the pool on purpose.`,
    map:`Godot’s RefCounted is C++ shared_ptr semantics, cycles included; a Node is closer to an object you own and must delete.` },
  note:`The engines differ in mechanism and agree on the rule. Unity’s C# pays for garbage later, Godot’s GDScript pays nothing until a cycle or an orphan leaks, and Godot C# behaves like Unity. In all of them, pooling high-rate objects and keeping the frame loop allocation free is the fix that works.` });
INTERVIEW('craft-memory-and-gc',{
  junior:[
    { q:`Why is allocating in Update a problem in Unity?`,
      a:`Every managed allocation is garbage the collector must reclaim later. Incremental GC spreads that work across frames, but steady garbage still costs time, and heavy reference churn can force a full, non-incremental collection that shows up as a hitch. On the web platform every collection is a full one. Name common sources: strings, LINQ, capturing lambdas, arrays returned by APIs.`,
      follow:`How would you find which line allocates?`,
      red:`Says the GC is fast enough so it does not matter.` },
    { q:`In Godot, what is the difference between a Node and a RefCounted?`,
      a:`RefCounted frees itself when its last reference goes. A Node inherits from Object and must be freed, usually with queue_free. Resources are RefCounted. Removing a node from the tree does not free it.`,
      follow:`What happens if two RefCounted objects hold each other?`,
      red:`Thinks Godot has a garbage collector that frees everything.` }
  ],
  mid:[
    { q:`Design a pool for bullets in a bullet hell.`,
      a:`Preallocate to measured peak, hand out and return instead of instantiate and destroy, and reset every per-life field on return, including subscriptions. Decide what happens when empty: grow, refuse or recycle the oldest, and say why for this game. Mention measuring that GC Alloc went to zero.`,
      follow:`A returned bullet still reacts to the pause event. Why?`,
      red:`Forgets reset, or never considers the empty case.` },
    { q:`When would you make a C# type a struct instead of a class?`,
      a:`Small, plain data with no identity, like a hit result or a grid coordinate, used in large numbers or in hot loops. Structs avoid the heap but copy on assignment, and boxing them through object or a non-generic interface brings the allocation back. Keep them small and preferably immutable.`,
      follow:`Where does Span<T> fit?`,
      red:`Says structs are always faster.` }
  ],
  senior:[
    { q:`A mobile build hitches every few seconds on device but not in the editor. Walk through it.`,
      a:`Attach the profiler to a development build on the device. Check for GC spikes and sort by GC Alloc. The editor differs: different scripting backend, editor-only allocations, more headroom. Fix the top allocators, pool high-rate objects, and verify with the same capture. If it is not GC, look at loading, shader compilation or thermal throttling.`,
      follow:`Incremental GC is on. Why can there still be a spike?`,
      red:`Changes code before capturing a profile on the device.` },
    { q:`How do you think about ownership across C#, GDScript and C++ on one team?`,
      a:`Same question each time: who frees this, and when. C# and Go leave it to a collector, so the cost is timing. Reference counting frees promptly and leaks cycles. C++ should encode ownership in types, unique_ptr by default, shared_ptr rarely. Write the ownership down at the boundary between systems.`,
      follow:`Where have you seen shared_ptr overused?`,
      red:`Treats memory management as only a C++ concern.` }
  ] });

T('craft-performance',{ d:'craft', t:'Performance: profile, budget, lay out data', tag:'At 60 frames per second you have 16.7 milliseconds, at 120 you have 8.3, and you do not know where they went until the profiler tells you.',
  what:`Performance work in a game is budget work. A frame at 60 Hz has 1000/60, about 16.7 ms; at 120 Hz it has about 8.3 ms; and the CPU and GPU each have to fit, in parallel, with some headroom for spikes and thermal throttling. The method is fixed: measure on target hardware, find whether the frame is CPU or GPU bound, find the largest cost, fix it, measure again. Beyond local fixes, the biggest wins usually come from data layout. Data-oriented design, argued forcefully by Mike Acton in his 2014 CppCon talk, says the job of code is to transform data, and the hardware rewards data that is contiguous and processed in bulk. Entity component systems such as Unity DOTS formalise this, and a plain array of structs processed in one loop gets much of the benefit in any engine.`,
  why:[`A frame that misses its budget is a dropped frame the player feels, and consistent frame time matters as much as the average.`,`Optimising without profiling spends effort on code that was never the bottleneck, and often makes it harder to read.`,`Memory access often dominates CPU cost in game loops. A cache miss can cost far more than the arithmetic around it, which is why layout beats micro-optimisation.`,`Being GPU bound and CPU bound need opposite fixes. Reducing draw calls does nothing for a frame limited by fill rate.`],
  think:{ q:[`What is the target: platform, frame rate, resolution, worst scene?`,`Is the frame CPU bound or GPU bound? How do you know?`,`Is this an average problem or a spike problem? They have different causes.`,`What runs per entity per frame, and how many entities are there at peak?`,`Is the data this loop touches contiguous, or does it chase pointers through objects?`,`Does it need to run every frame, or could it run less often, on fewer objects, or on another thread?`],
    trade:[`Data-oriented layout is fast and less natural to read than objects with methods. Use it where the entity count is high, not everywhere.`,`Unity DOTS gives large speedups for many similar entities and brings a different workflow, tooling and learning cost.`,`Spreading work across frames smooths spikes and adds latency and state to manage.`,`Lower quality settings save GPU time and cost look. Make the choice per platform, visibly.`],
    traps:[`Profiling in the editor on a desktop and shipping to a phone.`,`Reading one frame of a capture instead of looking across many for spikes.`,`Micro-optimising a function that is two percent of the frame.`,`Adding threads to a CPU-bound frame whose real cost is cache misses in the main loop.`,`Measuring a build with profiling and deep instrumentation on and taking the numbers as final.`,`Assuming VSync-limited frame time means the frame is expensive.`],
    good:[`Each platform has a written frame budget split between systems, and a capture of the worst scene is checked against it regularly.`,`Performance regressions are caught by an automated benchmark scene in CI, not by QA a week later.`,`The hot loops over many entities work on packed arrays.`],
    bad:[`"It runs fine on my machine" is the only performance data.`,`An optimisation landed with no before and after capture.`] },
  how:[`Set the budget first: target hardware, frame rate, and a split per system (gameplay, physics, animation, rendering, UI).`,`Profile a development build on the target device. In Unity use the Profiler and Frame Debugger; in Godot use the Debugger’s Profiler, Monitors and Visual Profiler.`,`Decide CPU or GPU bound: compare CPU main thread time with GPU time, or drop resolution and see whether frame time moves.`,`Instrument your own systems with named markers so captures show game terms, not just engine internals.`,`Fix the biggest item, then re-measure. Keep the before and after capture with the change.`,`For many similar entities, lay data out as arrays of plain values and process them in one loop. In Unity consider Jobs, Burst and ECS; anywhere, a structure of arrays helps.`,`Do less: skip off-screen work, lower update rates for distant agents, cache results that do not change each frame.`,`Watch spikes separately from averages: loading, shader compilation, garbage collection and instantiation are the usual sources.`],
  ai:{ yes:[`Read a profiler export and summarise the largest costs and likely causes.`,`Convert an array-of-objects loop into a structure-of-arrays version and explain the cache effect.`,`Add named profiler markers around the systems in a script.`,`Draft a benchmark scene and the CI check that compares frame time with a baseline.`],
       no:[`Tell you where the time goes without a capture.`,`Promise a speedup from a rewrite; only a measurement shows it.`,`Choose which visual quality to give up; that is a design and art decision.`] },
  prompts:[{l:'Read this capture',p:`Target: [PLATFORM], [FPS] fps, budget [MS] ms. Here is profiler data from our worst scene: [PASTE HIERARCHY OR SUMMARY]. Tell me whether the frame looks CPU or GPU bound and why, list the top five costs with the likely cause, and suggest the measurement I should take next to confirm each. Do not suggest fixes for items under 5 percent of the frame.`},
    {l:'Make this loop data oriented',p:`This [LANGUAGE] loop updates [N] [ENTITIES] per frame: [PASTE]. Rewrite it so the data it touches is stored in contiguous arrays of plain values and processed in one pass. Keep behaviour identical, say which fields are hot and which cold, and describe how I should measure the difference on [PLATFORM].`}],
  verify:[`Is there a before and after capture from the target device, not the editor?`,`Did behaviour stay identical after the layout change?`,`Are the markers compiled out or cheap in release builds?`],
  test:[`Keep a benchmark scene with the worst realistic load and record frame time percentiles, not just the average, on each target device.`,`Run the benchmark in CI on fixed hardware and fail the build when the 99th percentile regresses past a threshold.`,`Play for thirty minutes on a phone and record frame time over time, to catch thermal throttling.`],
  facts:[{claim:`Unity’s documentation says ProfilerMarker’s Begin and End methods carry ConditionalAttribute and are compiled away, with zero overhead, in non-development (release) builds.`,asOf:'2026-09-28',src:'https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Unity.Profiling.ProfilerMarker.html'},
    {claim:`Godot’s Performance class exposes the values shown in the editor Debugger’s Monitor tab through get_monitor(), including TIME_PROCESS, TIME_PHYSICS_PROCESS, OBJECT_COUNT and RENDER_TOTAL_DRAW_CALLS_IN_FRAME, and supports add_custom_monitor().`,asOf:'2026-09-28',src:'https://docs.godotengine.org/en/stable/classes/class_performance.html'},
    {claim:`Mike Acton’s CppCon 2014 talk "Data-Oriented Design and C++" argues that the purpose of code is to transform data and that design should start from the data and the hardware.`,asOf:'2026-09-28',src:'https://www.youtube.com/watch?v=rX0ItVEVjHc'}],
  rel:[['backend-observability','Markers and monitors are the client-side form of the metrics and traces a service exports.'],['craft-memory-and-gc','Garbage collection spikes are one of the first things a profile shows.'],['craft-design-patterns','Data locality and update method are patterns with a direct performance cost.'],['craft-game-loop-timestep','A rising step count per frame is a performance signal, and the cap is how the loop survives a bad frame.'],['craft-best-practice-now','A before and after capture is the test for a performance change.'],['craft-entities-and-scenes','ECS is the last step of the performance ladder, after packed arrays.']] });
ENGINE('craft-performance',{
  unity:{ term:`The Profiler shows CPU, GPU, memory and rendering per frame. ProfilerMarker names your own code in it, and ProfilerRecorder reads counters in code, so a build can report its own frame time.`,
    api:['Unity.Profiling.ProfilerMarker','ProfilerMarker.Auto()','Unity.Profiling.ProfilerRecorder','Window > Analysis > Profiler','Frame Debugger','Unity.Jobs / Burst / Entities'],
    snippet:`using Unity.Profiling;
using UnityEngine;

public class Swarm : MonoBehaviour {
    static readonly ProfilerMarker k_Steer = new ProfilerMarker("Swarm.Steer");
    // Structure of arrays: the hot loop reads packed data, not objects.
    Vector3[] pos, vel;
    [SerializeField] int count = 5000;

    void Awake() { pos = new Vector3[count]; vel = new Vector3[count]; }

    void Update() {
        float dt = Time.deltaTime;
        using (k_Steer.Auto()) {
            for (int i = 0; i < count; i++) {
                vel[i] += -pos[i] * 0.1f * dt;   // pull toward origin
                pos[i] += vel[i] * dt;
            }
        }
    }
}`,
    pitfall:`Reading profiler numbers with Deep Profile on. It instruments every call and distorts the frame, so small functions look expensive. Use it to find structure, then confirm with markers in a normal development build.`,
    map:`Unity’s ProfilerMarker is a Godot custom monitor or a Time.get_ticks_usec() span; Godot’s editor has no draw-by-draw equivalent of Unity’s Frame Debugger; use an external graphics debugger for that, and the Visual Profiler and draw-call monitors for render cost.` },
  godot:{ term:`The Debugger panel has a Profiler for script functions, a Visual Profiler for CPU and GPU render time, and Monitors for engine counters. The Performance singleton gives the same monitors in code and accepts custom ones.`,
    api:['Performance.get_monitor()','Performance.add_custom_monitor()','Performance.TIME_PROCESS','Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME','Time.get_ticks_usec()','PackedVector2Array'],
    snippet:`extends Node2D

var pos := PackedVector2Array()
var vel := PackedVector2Array()
var _steer_ms := 0.0
var _last_warn_ms := 0

func _ready() -> void:
\tpos.resize(5000)
\tvel.resize(5000)
\tfor i in pos.size():
\t\tpos[i] = Vector2(i % 100, floorf(i / 100.0))   # non-zero start, so the loop moves something
\tPerformance.add_custom_monitor("game/steer_ms", func(): return _steer_ms)

func _process(dt: float) -> void:
\tvar t0 := Time.get_ticks_usec()
\tfor i in pos.size():
\t\tvel[i] += -pos[i] * 0.1 * dt
\t\tpos[i] += vel[i] * dt
\t_steer_ms = (Time.get_ticks_usec() - t0) / 1000.0
\tvar now := Time.get_ticks_msec()
\tif Performance.get_monitor(Performance.TIME_PROCESS) > 1.0 / 60.0 and now - _last_warn_ms > 1000:
\t\t_last_warn_ms = now                      # at most one warning a second, not one per frame
\t\tpush_warning("process over 60 fps budget")`,
    pitfall:`Optimising GDScript loops that should not be in GDScript. A tight loop over thousands of elements is where moving to typed packed arrays, a server API, C# or a GDExtension pays; measure first, and move only the hot part.`,
    map:`Godot’s custom monitor shows in the Monitors tab the way a Unity ProfilerMarker shows in the Profiler.` },
  note:`Both engines give the same three views: per-function CPU time, render time, and counters. Name your own systems in them, measure on the target device, and keep hot per-entity data in packed arrays. Unity DOTS takes the data-oriented idea furthest; the packed-array loop above is the version any engine supports.` });
INTERVIEW('craft-performance',{
  junior:[
    { q:`What is the frame budget at 60 and at 120 frames per second?`,
      a:`About 16.7 ms and 8.3 ms. CPU and GPU work overlap, so each must fit, and you want headroom for spikes. Mention that consistent frame time matters, not just the average.`,
      follow:`What eats that headroom on a phone after ten minutes?`,
      red:`Cannot do the arithmetic, or thinks the budget is per system rather than the whole frame.` },
    { q:`How do you tell whether a game is CPU or GPU bound?`,
      a:`Compare CPU frame time and GPU frame time in the profiler, or lower the render resolution: if frame time drops, it was GPU bound. Draw calls and script time point at the CPU; fill rate and heavy shaders at the GPU.`,
      follow:`Which fix would you try first for each?`,
      red:`Proposes optimising scripts without checking.` }
  ],
  mid:[
    { q:`What is data-oriented design, in one practical example?`,
      a:`Arrange data for how it is processed. Instead of 5,000 enemy objects each with an update method, keep positions and velocities in arrays and update them in one loop. The CPU reads contiguous memory and hits the cache. Cite Acton’s talk and note the readability cost.`,
      follow:`Which fields would you keep out of that hot array?`,
      red:`Describes it as just using structs.` },
    { q:`How do you instrument your own systems in a capture?`,
      a:`Named markers around each system: ProfilerMarker in Unity, custom monitors or tick spans in Godot. Then the capture shows AI, pathfinding and UI in game terms. Keep them cheap or compiled out in release.`,
      follow:`Why not use deep profiling for this?`,
      red:`Uses stopwatch logging to the console every frame.` }
  ],
  senior:[
    { q:`When would you adopt Unity DOTS, and when would you not?`,
      a:`When a system has many similar entities and a measured CPU bottleneck in their update: crowds, projectiles, simulation. Not for a game with few complex actors, or a team without time to learn the workflow. A plain structure of arrays with Jobs and Burst can be a smaller step.`,
      follow:`How would you trial it without committing the whole project?`,
      red:`Adopts it for everything, or dismisses it without numbers.` },
    { q:`How do you stop performance regressions reaching QA?`,
      a:`A benchmark scene with the worst realistic load, run automatically on fixed hardware, recording frame time percentiles, with a threshold that fails the build. Budgets per system so a regression has an owner. Captures attached to performance changes.`,
      follow:`The benchmark is noisy. What do you do?`,
      red:`Relies on players reporting slowdowns.` }
  ] });

T('craft-design-patterns',{ d:'craft', t:'Design patterns in games', tag:'Command, state, observer, pool and component solve real game problems. Singletons, deep inheritance and global event buses arguably move the problem somewhere harder to see.',
  what:`A pattern is a named, reusable shape for a recurring problem. Robert Nystrom’s Game Programming Patterns, free at gameprogrammingpatterns.com, is the game-specific reference: it revisits command, flyweight, observer, prototype, singleton and state, then adds sequencing patterns (double buffer, game loop, update method), behavioural ones (bytecode, subclass sandbox, type object), decoupling ones (component, event queue, service locator) and optimisation ones (data locality, dirty flag, object pool, spatial partition). The value of a pattern is shared vocabulary and a known set of trade-offs. The cost is indirection, and, arguably, many game codebases pay that cost for patterns they did not need.`,
  why:[`Engines already embody several patterns: the game loop, update method, component and prototype (prefabs, scenes). Knowing them explains why the engine is shaped as it is.`,`Command turns input and actions into data, which gives undo, replays, input remapping and networked lockstep for little extra code.`,`A state machine makes character and AI behaviour explicit, so illegal transitions are refused in one place instead of hiding in a tangle of booleans.`,`Misapplied patterns are, arguably, a common cause of code nobody can follow: a global event bus hides who calls whom, and singletons hide dependencies.`],
  think:{ q:[`What concrete problem does this pattern solve here? Could you name the bug it prevents?`,`Is the engine already providing this pattern, such as components, signals or prefabs?`,`Does this add indirection a reader has to follow? Is it worth it?`,`Who depends on this singleton or service, and would a passed-in reference be clearer?`,`Can you trace control flow from input to effect without a search, or does an event bus hide it?`,`Is inheritance here modelling a real "is a", or sharing code that composition would share better?`],
    trade:[`Observer decouples sender from receiver and makes the order and existence of reactions invisible at the call site.`,`State machines make behaviour explicit and grow many states; hierarchical states or behaviour trees scale further at more complexity.`,`Service locator gives global access with a swap point for tests, and still hides dependencies.`,`Component composition is flexible and scatters one behaviour across many small parts.`],
    traps:[`A singleton for every manager, so every system depends on every other and nothing can be tested alone.`,`A deep inheritance tree like Enemy, FlyingEnemy, FlyingShootingEnemy, that breaks the first time a design needs a swimming shooter.`,`A global event bus where any code can fire any event, so debugging means searching for string names.`,`Subscribing in enable and forgetting to unsubscribe, leaking listeners and calling into destroyed objects.`,`Booleans like isJumping, isAttacking, isStunned combined by hand instead of a state machine.`,`Adding a pattern "for flexibility" with one implementation and no second one on the roadmap.`],
    good:[`Player and enemy behaviour are explicit state machines with named states and guarded transitions.`,`Actions are commands, so replays, undo in editors and remapping cost little.`,`Dependencies are passed in or wired in the inspector, and the few true globals are listed.`],
    bad:[`Every class starts by fetching three singletons.`,`Nobody can say which systems react when the player dies without running the game.`] },
  how:[`Start from the problem, then name the pattern. If you cannot name the bug it prevents, do not add it.`,`Use the engine’s own patterns first: components and nodes for composition, prefabs and scenes for prototype, signals and C# events for observer.`,`Model actor behaviour as a state machine: one state object or enum per state, enter and exit hooks, and transitions in one place.`,`Represent actions as command objects when you need undo, replay, queuing, remapping or network sync.`,`Pool objects created at gameplay rate, and use a spatial partition when queries over many objects dominate.`,`Prefer direct references and signals connected in the editor over a global bus. If you need an event queue, keep it typed and scoped to one system.`,`Keep singletons to genuinely single, stateless-to-callers services, and give them a way to be replaced in tests.`,`Prefer composition to inheritance deeper than two levels.`],
  ai:{ yes:[`Identify which pattern a piece of code is attempting and whether it is complete.`,`Refactor a tangle of booleans into a state machine with the same behaviour.`,`Point out hidden dependencies: singletons, statics and bus events a class relies on.`,`Explain a pattern with the trade-offs for your engine, citing Nystrom’s chapter.`],
       no:[`Decide your architecture from a list of patterns; models over-apply them when asked for "clean" code.`,`Be trusted to preserve behaviour in a pattern refactor without tests or a replay to compare.`,`Choose between patterns without knowing the game’s roadmap and team.`] },
  prompts:[{l:'Booleans to states',p:`This [ENGINE] character controller uses flags: [PASTE]. Rewrite it as an explicit state machine. List every state and every legal transition first, point out any flag combinations the old code allowed that make no sense, and keep behaviour identical otherwise. Use the engine’s own features where they fit.`},
    {l:'Pattern audit',p:`Review this code for pattern misuse: [PASTE]. Report singletons and statics it depends on, inheritance deeper than two levels, events whose senders and receivers cannot be found at the call site, and patterns with only one implementation. For each, say whether it is justified here and the smallest change if not. Do not add new patterns.`}],
  verify:[`Does the refactored code behave the same? Compare with a recorded input replay or tests.`,`Did the suggestion add a pattern without naming the problem it solves?`,`Are all event subscriptions paired with an unsubscription?`],
  test:[`Record an input replay before a state machine refactor and play it after. Positions and states must match frame for frame in a deterministic setup.`,`Write a test for each illegal transition: it must be refused.`,`Load a scene with one singleton removed. If the whole game fails, that singleton is a hidden dependency of everything.`],
  facts:[{claim:`Nystrom’s Game Programming Patterns groups its chapters as Design Patterns Revisited (command, flyweight, observer, prototype, singleton, state), Sequencing (double buffer, game loop, update method), Behavioral (bytecode, subclass sandbox, type object), Decoupling (component, event queue, service locator) and Optimization (data locality, dirty flag, object pool, spatial partition).`,asOf:'2026-09-28',src:'https://gameprogrammingpatterns.com/contents.html'}],
  rel:[['craft-memory-and-gc','Object pool is the pattern that keeps the frame loop allocation free.'],['craft-performance','Data locality and spatial partition are the patterns with the largest performance effect.'],['craft-best-practice-now','Patterns are shared vocabulary for small, readable changes.'],['backend-di-modes','Passing dependencies in is the alternative to singletons and service locators.']] });
ENGINE('craft-design-patterns',{
  unity:{ term:`MonoBehaviours are components and prefabs are prototypes. The state pattern is plain C#: one class or enum per state. C# events and UnityEvent are observer.`,
    api:['MonoBehaviour','ScriptableObject','UnityEngine.Events.UnityEvent','event System.Action','[SerializeField]','Animator (state machine for animation)'],
    snippet:`using UnityEngine;

public class Guard : MonoBehaviour {
    enum State { Patrol, Chase, Stunned }
    State state = State.Patrol;
    float stunLeft;
    [SerializeField] Transform target;

    void Update() {
        switch (state) {
            case State.Patrol:
                if (SeesTarget()) Enter(State.Chase);
                break;
            case State.Chase:
                if (!SeesTarget()) Enter(State.Patrol);
                break;
            case State.Stunned:
                if ((stunLeft -= Time.deltaTime) <= 0) Enter(State.Patrol);
                break;
        }
    }

    public void Stun(float s) { stunLeft = s; Enter(State.Stunned); }

    void Enter(State next) {
        if (next == state) return;
        state = next;   // one place owns transitions
    }

    bool SeesTarget() =>
        Vector3.Distance(transform.position, target.position) < 8f;
}`,
    pitfall:`Making every manager a static singleton reachable from anywhere. It works until scene reloads leave stale instances and tests cannot run without the whole game. Wire references with [SerializeField] and keep true globals few.`,
    map:`Unity C# events are Godot signals; a Unity prefab is a Godot PackedScene.` },
  godot:{ term:`Nodes composed in scenes are the component pattern, scenes are prototypes, and signals are observer, visible in the editor’s Node dock. A state machine is a match on an enum or child state nodes.`,
    api:['signal / Signal.connect()','PackedScene','enum + match','Node.get_node() / @onready','Autoload (engine singleton)','Object.is_connected()'],
    snippet:`extends CharacterBody2D

enum State { PATROL, CHASE, STUNNED }
signal state_changed(from: State, to: State)

@export var target: Node2D
var state := State.PATROL
var stun_left := 0.0

func _ready() -> void:
\tassert(target != null, "assign target in the inspector")   # validate the wiring once

func _physics_process(dt: float) -> void:
\tmatch state:
\t\tState.PATROL:
\t\t\tif _sees_target(): _enter(State.CHASE)
\t\tState.CHASE:
\t\t\tif not _sees_target(): _enter(State.PATROL)
\t\tState.STUNNED:
\t\t\tstun_left -= dt
\t\t\tif stun_left <= 0.0: _enter(State.PATROL)

func stun(seconds: float) -> void:
\tstun_left = seconds
\t_enter(State.STUNNED)

func _enter(next: State) -> void:
\tif next == state: return
\tstate_changed.emit(state, next)
\tstate = next

func _sees_target() -> bool:
\treturn global_position.distance_to(target.global_position) < 128.0`,
    pitfall:`Turning an autoload into a global event bus that every script emits to and listens on. Signals connected between the nodes that care are traceable in the editor; a bus hides control flow behind string or signal names.`,
    map:`A Godot autoload is Unity’s singleton MonoBehaviour with DontDestroyOnLoad; use either sparingly.` },
  note:`Both engines already give you component, prototype and observer. The pattern you usually add yourself is the state machine, and it looks nearly the same in both: an enum, one switch, and a single method that owns transitions.` });
INTERVIEW('craft-design-patterns',{
  junior:[
    { q:`What is the command pattern and why is it useful in games?`,
      a:`Wrap an action as an object with an execute method, and often undo. Input maps to commands, so remapping is data, replays are a list of commands, and editors get undo. Cite Nystrom’s chapter.`,
      follow:`How would you record a replay with it?`,
      red:`Describes it only as a textbook definition with no game use.` },
    { q:`Why use a state machine for a player character?`,
      a:`It makes the states and legal transitions explicit, so you cannot be jumping and stunned at once by accident. Booleans combine into invalid states. Enter and exit hooks give a place for animation and sound.`,
      follow:`Where do you put the transition rules?`,
      red:`Prefers more booleans because they are simpler.` }
  ],
  mid:[
    { q:`What is wrong with singletons in a game codebase?`,
      a:`They hide dependencies, make order of initialisation fragile, survive scene changes in surprising ways and block isolated tests. A few are fine for truly global services. Prefer injected or inspector-wired references, and service locator with a test swap if you must.`,
      follow:`Which singletons would you keep?`,
      red:`Either bans all globals dogmatically or uses them everywhere.` },
    { q:`Inheritance or composition for enemy types?`,
      a:`Composition: movement, attack and health as components, combined per enemy. Deep trees break when design mixes traits. Keep inheritance shallow for real "is a" relations. Mention Nystrom’s component chapter and the engines' own component model.`,
      follow:`Design a swimming, shooting enemy both ways.`,
      red:`Builds a four-level hierarchy.` }
  ],
  senior:[
    { q:`When does an event bus help and when does it hurt?`,
      a:`It helps for truly broadcast, many-to-many events across distant systems, like achievements or analytics. It hurts when used for ordinary calls, because control flow disappears and ordering bugs appear. Keep events typed, scoped, documented, and prefer direct signals between known parties.`,
      follow:`How do you debug an event nobody can find the sender of?`,
      red:`Routes all communication through one bus.` },
    { q:`A junior adds three patterns to a feature "for flexibility". How do you review it?`,
      a:`Ask which problem each solves now, and whether a second implementation exists or is planned. Remove indirection with one implementation. Keep the pattern that prevents a real bug. Teach the vocabulary without rewarding speculative abstraction.`,
      follow:`Which pattern would you keep even with one implementation?`,
      red:`Approves because patterns are best practice.` }
  ] });

T('craft-clean-code-ai-era',{ d:'craft', t:'Clean code in the AI era', tag:'Clean code was always about the next reader. Now the next reader is often an agent with a context budget and a grep, and that sharpens some rules and exposes others as taste.',
  what:`Clean code is code the next reader can understand and change safely. That reader used to be a colleague; now it is also an agent that loads files into a limited context window and finds things by searching for names. Three things matter more than before. Readability for review: a human still has to approve what an agent wrote, and attention is the scarce resource. Context size: a module that can be understood from its interface fits in an agent’s context, while one that needs ten files open does not, and the agent fills the gap by guessing. Names as search keys: an agent navigates by grep, so a distinctive, consistent name like ApplyKnockback is found in one search, while Process, Handle or a name that differs between files is not found at all. Much of the rest was always taste. A well-known public example is the 2024 to 2025 discussion between Robert C. Martin (Clean Code) and John Ousterhout (A Philosophy of Software Design). Martin argues for very small functions and treats most comments as a failure to express intent in code, though he accepts them for public APIs. Ousterhout argues that splitting too far makes shallow methods that must be read together, that deep modules hide complexity behind small interfaces, and that comments carry rationale code cannot. They also split on test-driven development: Martin writes tests first in very short cycles, Ousterhout prefers “bundling”, a larger piece of code followed by its tests, and they close that section with the disagreement unresolved. They agreed that modular design is good, that over-decomposition is possible, that unit tests are essential and that TDD can produce good designs. For an agent-heavy codebase Ousterhout’s position is arguably the more useful default: fewer, deeper units with a written contract are cheaper to load and harder to misuse.`,
  why:[`An agent reads what it can fit. Code that is only understandable across many small files gets understood partially, and partial understanding produces confident wrong edits.`,`Search is how agents find call sites. A name used inconsistently is a call site the agent will miss when it changes a signature.`,`Review is the bottleneck. Code that states its intent lets a reviewer check intent against diff; code that does not makes review a reconstruction.`,`Style rules that were taste cost review time in arguments. Knowing which rules are taste lets a lead put them in a formatter and stop discussing them.`],
  think:{ q:[`Could an agent change this module correctly after reading only its public surface and the comment on it?`,`If I grep for this name, do I find every place that means this thing, and nothing else?`,`Is this function small because it does one thing, or because a rule said to split it?`,`Does the comment say why, or what the next line does?`,`Which of our style rules protect a reader, and which only protect a preference?`],
    trade:[`Many tiny functions read well one at a time and badly as a whole; one long function reads badly at a glance and well as a story. Pick by how often the pieces are reused, not by line count.`,`Comments cost upkeep and rot if unchecked. No comments cost every future reader the reasoning the author had. Comment the contract and the why, not the mechanics.`,`Long descriptive names cost width; short generic names cost searchability. For anything an agent may need to find, searchability wins.`],
    traps:[`Splitting a clear 40 line function into eight 5 line helpers that are each called once, so the reader and the agent must open all of them.`,`Generic names like Manager, Handler, Data, Process, which match hundreds of grep hits.`,`The same concept under two names (hp in one file, health in another), so a rename by search misses half of it.`,`Deleting comments because clean code "should not need them", losing the one line that explained a platform workaround.`,`Treating a book’s rules as law in review, so the thread argues brace style while the logic bug passes.`],
    good:[`A module’s header comment states what it owns, what it guarantees and what callers must not do, and agents stop violating it.`,`Style disputes are settled by the formatter and linter, not in review threads.`,`A rename by search finds every use because each concept has exactly one name.`],
    bad:[`An agent fixes a bug in one of five near-identical helpers and leaves the other four, because nothing linked them.`,`Code review spends its time on function length while nobody checks whether the save format changed.`] },
  how:[`Name for search: one concept, one name, distinctive enough that grep finds it and only it. Include the unit where it matters: cooldownSeconds, not cooldown.`,`Prefer deep modules: a small interface over substantial logic. Split a function when a piece is reused or has its own contract, not to hit a line count.`,`Write interface comments that state the contract, the units and the invariants, plus a why comment wherever the code is surprising. Skip comments that restate code.`,`Keep related code close. An agent that must read one file to change a behaviour does better than one that must read six.`,`Push taste into tools: a formatter and a lint config end the arguments, and agents follow them automatically.`,`When you review a generated diff, check names first: a new synonym for an existing concept is the cheapest bug to catch early.`],
  ai:{ yes:[`List every name in a module that means the same thing as another name, and propose one.`,`Draft the interface comment for a module from its code, for you to correct.`,`Find functions called from exactly one place that could be inlined.`],
       no:[`Decide your team’s style rules; it will reproduce whichever book dominates its training data.`,`Judge whether a comment’s why is true. It can only say whether it matches the code.`] },
  prompts:[{l:'Searchability audit',p:`Here is a [LANGUAGE] module from a game [SYSTEM]: [PASTE]. List (1) names that are generic enough to collide in a repo-wide search, (2) concepts that appear under more than one name, (3) functions called once that add no contract. For each, give the smallest rename or inline. Do not rewrite the module.`},
    {l:'Contract comment',p:`Write a header comment for this module: [PASTE]. State what it owns, what it guarantees to callers, units of any numeric value, and what callers must not do. Maximum eight lines. Mark anything you inferred rather than read as INFERRED.`}],
  verify:[`Grep for each new name the change introduced. Does it collide with an existing one, or duplicate an existing concept?`,`Did the change split or merge functions without a reuse or contract reason?`,`Are the comments the change added about why, or about what?`],
  test:[`Give an agent a small change task with only one module’s interface in context. If it gets it wrong, the interface did not carry enough.`,`Rename one concept by search and run the build. Every miss is a name that was not consistent.`,`Ask two reviewers to rate the same diff. Where they disagree only on style, move that rule into the formatter.`],
  facts:[{claim:`John Ousterhout and Robert C. Martin published a written discussion comparing A Philosophy of Software Design and Clean Code, held between September 2024 and February 2025, covering method length, comments and test-driven development; they agreed unit tests are essential and left their disagreement on test-driven development unresolved.`,asOf:'2026-09-28',src:'https://github.com/johnousterhout/aposd-vs-clean-code'},
    {claim:`GitClear’s "AI Copilot Code Quality" report (February 2025, 211 million changed lines from 2020 to 2024) found that 2024 was the first year copy/pasted lines exceeded moved lines, that moved lines fell from 25% of changed lines in 2021 to under 10% in 2024, and that blocks of five or more duplicated lines became eight times as frequent during 2024.`,asOf:'2026-09-29',src:'https://gitclear-public.s3.us-west-2.amazonaws.com/GitClear-AI-Copilot-Code-Quality-2025.pdf'}],
  rel:[['craft-best-practice-now','That topic covers small diffs and tests; this one covers how the code itself reads.'],['craft-design-patterns','Patterns give deep modules names a reader and an agent already know.'],['craft-teaching-agents','Names and contracts only bind an agent when they are backed by rules and tools.'],['lead-conventions','Deciding which rules are taste and putting them in tools is a lead job.']] });
INTERVIEW('craft-clean-code-ai-era',{
  junior:[
    { q:`Why do names matter more when an agent works in the codebase?`,
      a:`Agents find code by searching. A distinctive, consistent name is found in one search; a generic or inconsistent one is missed, and the agent changes one site and not the others. Give an example like health versus hp.`,
      follow:`How would you find every name for the same concept in a module?`,
      red:`Talks only about camelCase versus snake_case.` },
    { q:`When is a comment worth writing?`,
      a:`When it says something the code cannot: why a workaround exists, a unit, an invariant, the contract of an interface. Not when it restates the next line.`,
      follow:`Write the comment for a function that clamps velocity only on one console.`,
      red:`Says good code never needs comments, or comments every line.` }],
  mid:[
    { q:`Summarise the Martin versus Ousterhout disagreement and say where you land.`,
      a:`Martin favours very small functions and sees most comments as a failure; Ousterhout warns against over-decomposition, favours deep modules and treats comments as essential for rationale and contracts. Both value unit tests, but they disagree on writing them first (TDD) versus Ousterhout’s “bundling”. A good answer picks a position with a reason tied to their codebase, for example deep modules because agents load interfaces, not whole call trees.`,
      follow:`Where would Martin’s style still win?`,
      red:`Has not heard of either position and argues from one rule.` },
    { q:`A generated diff splits a 60 line function into ten helpers. Accept?`,
      a:`Only if the pieces are reused or each carries a contract. Single-use helpers make reading harder for people and agents. Ask for the split to be undone except where it removes duplication.`,
      follow:`How do you tell reuse from speculative reuse?`,
      red:`Accepts because shorter functions are always cleaner.` }],
  senior:[
    { q:`How do you design a module so an agent can change it safely?`,
      a:`Small interface, substantial hidden logic, a header comment with guarantees and invariants, tests on the contract, and everything for one behaviour in one place. Then measure: give an agent a task with only the interface and see whether it succeeds.`,
      follow:`What goes in the header comment?`,
      red:`Relies on the agent reading the whole repository.` },
    { q:`Your team argues about style in every review. What do you do?`,
      a:`Separate readability rules from taste. Put taste in a formatter and linter with one agreed config, then ban style comments from review unless the tool cannot express them. Review time goes to behaviour.`,
      follow:`Which rule would you refuse to automate?`,
      red:`Picks a book and mandates it.` }] });

T('craft-over-defensive-code',{ d:'craft', t:'Over-defensive code', tag:'A null-check where nothing can be null is not safety. It is noise that says the invariant is uncertain, and it rots when the real guard moves.',
  what:`Over-defensive code guards against states the flow already rules out: a null-check after a caller that only runs on success, a try-catch around code that cannot throw, a retry around a library that already retries, a clamp on a value validated one line above. People and agents write it for the same reason: missing context. The author cannot see the caller, does not know the schema, or does not trust the library, so guarding feels free. It is not. Each redundant guard is a branch the reader must evaluate, it tells the next reader the value might really be null, it hides real failures by returning quietly instead of failing loudly, and it rots: when the real guard upstream moves, the downstream copy stays and lies. Agents produce it at scale because they see a slice of the code and are trained to avoid crashes. The fix is placement. Guard once, at a boundary: player input, network and save data, deserialised files, engine lifetime (destroyed objects, freed nodes) and async re-entry. Behind the boundary, write code that trusts the guarantee. Before guarding a call into a library, read what the library already does with bad input.`,
  why:[`Silent guards turn a crash you would have found in a playtest into a missing item nobody can reproduce.`,`Games have real boundaries where guards belong: save files from older versions, network packets, mod content, objects destroyed mid-frame. Noise elsewhere makes those real guards hard to see.`,`Agent-written code accumulates guards fastest, and a reviewer who accepts them teaches the next agent session that this is the house style.`],
  think:{ q:[`Can this state actually occur here? What upstream check, type or engine rule excludes it?`,`Is this a boundary (external data, engine lifetime, async return) or interior code?`,`If this guard fires, what happens? Is failing loudly better than continuing?`,`Does the library I am calling already handle this input?`,`If the upstream guard moved, would this guard still be correct, or would it hide the move?`],
    trade:[`A crash on a broken invariant is disruptive but locatable; a silent return keeps the game running and hides the cause. In development builds, prefer the crash or an assert.`,`Guards at every layer feel safe and cost reading time forever. One guard at the boundary costs thinking once.`,`Shipping builds may want soft failure where development builds want hard failure. Use asserts that compile out, not two kinds of guards everywhere.`],
    traps:[`Null-checking a serialised reference in Update every frame instead of validating wiring once at startup or in the editor.`,`Using ?. on a Unity Object, which skips Unity’s destroyed-object check and hides the very bug it seems to guard.`,`Catching all exceptions around a save and logging them, so a corrupted save looks like success.`,`Wrapping an engine call that already returns a safe default in a check for that same default.`,`Accepting an agent’s "added defensive checks for robustness" line in a pull request without asking which state each one covers.`],
    good:[`Each guard in the codebase can be traced to a boundary it protects.`,`Broken setup, such as a missing prefab reference, fails at load with the object’s name, not with a null deep in gameplay.`,`Interior code reads as the happy path, and reviewers question any new guard added there.`],
    bad:[`Five layers each check the same player reference, and a destroyed player still passes one of them.`,`An inventory silently drops items because a guard returned early on a state that was a bug upstream.`] },
  how:[`Trace before you guard: read the callers and the upstream checks. If the state cannot occur, write the code assuming it cannot.`,`Guard at boundaries: input, network, save and mod data, engine lifetime, async continuations. Validate once and convert to a trusted type or state.`,`Fail fast on broken setup: validate wiring in the editor or at startup and throw or assert with the object’s name.`,`Read the library first: engine lookups that already return null or a default, pools that already refuse double release, SDKs that already reject concurrent calls.`,`Use asserts for invariants in interior code. They document the belief and fail in development, instead of silently branching.`,`In review, ask of each new guard: which state, from where? No answer, no guard.`],
  ai:{ yes:[`List every guard in a file and, for each, the upstream point that already excludes the state, or say none was found.`,`Convert per-frame null-checks on serialised fields into one startup validation.`,`Point out Unity Object uses of ?. and ??.`],
       no:[`Decide whether a boundary exists; it cannot see callers outside its context.`,`Be told to "make it robust", which it reads as permission to add guards everywhere.`] },
  prompts:[{l:'Guard audit',p:`Here is [FILE] and its callers [PASTE]. For each null-check, try-catch, early return, clamp or retry, say (a) which state it guards, (b) whether an upstream check, type or engine rule already excludes it, citing the line, and (c) keep, remove or move to boundary. Do not add new guards. Mark anything you could not trace as UNKNOWN.`},
    {l:'Fail fast wiring',p:`This [Unity/Godot] script checks its references for null during play: [PASTE]. Move reference validation to [OnValidate/Awake or _ready] so broken setup fails once with the object name, and remove the per-frame checks. Keep checks on objects that can be destroyed at runtime.`}],
  verify:[`For each guard the change added, name the state and where it comes from. Anything without an answer is a candidate for removal.`,`Did any guard replace a crash with a silent return in code that should fail loudly?`,`Did the change use ?. or ?? on a UnityEngine.Object?`],
  test:[`Remove a suspect guard and run the tests plus a playtest of the path. If nothing fails and the state cannot be produced, it was redundant.`,`Break the wiring on purpose (clear a reference) and check the failure appears at load with a useful name.`,`Destroy an object mid-frame in a test scene and check the one real lifetime guard catches it.`],
  facts:[{claim:`Unity’s Object documentation states that destroyed (detached) objects compare equal to null through Unity’s overloaded == operator, while ReferenceEquals returns false, and that the ?. and ?? operators are not supported with Unity Objects because they cannot be overridden to treat detached objects as null.`,asOf:'2026-09-28',src:'https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Object.html'}],
  rel:[['craft-save-systems','Loading a save is the boundary where validating outside input is justified.'],['craft-clean-code-ai-era','Redundant guards are the most common readability cost in generated code.'],['craft-verification-as-the-job','A guard that hides a failure defeats the checks that should find it.'],['ai-failure-modes','Defensive noise is a typical failure of agents working with a partial view.'],['craft-teaching-agents','A rule about guard placement is one of the first worth writing into an agent rules file.']] });
ENGINE('craft-over-defensive-code',{
  unity:{ term:`UnityEngine.Object overloads == so a destroyed object equals null while the C# reference is still alive. ?. and ?? bypass that operator, so they treat a destroyed object as valid. Serialised references are wiring, validated once, not checked every frame.`,
    api:['UnityEngine.Object operator ==','Object.ReferenceEquals()','MonoBehaviour.OnValidate()','Debug.Assert()','Component.TryGetComponent<T>()'],
    snippet:`// Before: every layer re-checks, and ?. misses destroyed objects.
// void Update() {
//     if (target != null && target.gameObject != null) {
//         var hp = target?.GetComponent<Health>();   // ?. skips Unity null
//         if (hp != null && hp.enabled) hp?.Tick();
//     }
// }

// After: wiring is validated once; the one runtime guard is the
// real boundary (the target can be destroyed during play).
[SerializeField] Health targetHealth;   // Health: your own MonoBehaviour with a Tick() method

void OnValidate() {
    if (targetHealth == null)
        Debug.LogError(name + ": targetHealth not assigned", this);
}

void Update() {
    if (targetHealth == null) return;   // destroyed at runtime
    targetHealth.Tick();
}`,
    pitfall:`Replacing target != null with target?.Foo() as a tidy-up. It compiles, and it calls into a destroyed object, which throws MissingReferenceException or silently reads stale data.`,
    map:`Unity’s overloaded == null on a destroyed Object is Godot’s is_instance_valid on a freed node.` },
  godot:{ term:`In Godot 4 a variable that held a freed Object keeps its old instance id, but == null looks that id up, so a freed object compares equal to null; is_instance_valid() says the same thing with clearer intent. A node after queue_free() is not freed until the end of the frame, so both checks still pass until then. @export references set in the editor are wiring, checked once in _ready().`,
    api:['is_instance_valid()','Node.queue_free()','Node.is_queued_for_deletion()','assert()','@export'],
    snippet:`extends Node

@export var target_health: Health   # Health: your own component script (class_name Health)

# Before: layered checks on every frame, some of them useless.
# func _process(delta):
# \tif target_health != null and target_health.get_parent() != null:
# \t\tif is_instance_valid(target_health) and target_health.visible:
# \t\t\ttarget_health.tick(delta)

func _ready() -> void:
\tassert(target_health != null, "%s: target_health not set" % name)

func _process(delta: float) -> void:
\t# The target can be freed during play: this is the real boundary.
\tif not is_instance_valid(target_health):
\t\treturn
\ttarget_health.tick(delta)`,
    pitfall:`Treating queue_free() as instant. The node lives until the end of the frame, so != null and is_instance_valid() both still pass and other scripts keep calling it; check is_queued_for_deletion() where that matters. In Godot 3 a freed reference also passed != null, which is why older code wraps everything in is_instance_valid().`,
    map:`Godot’s is_instance_valid (and, in Godot 4, == null) is Unity’s overloaded == null: the lifetime check, placed at the one place an object can disappear.` } });
INTERVIEW('craft-over-defensive-code',{
  junior:[
    { q:`What is wrong with adding a null-check just in case?`,
      a:`If the value cannot be null there, the check is dead code that suggests it can, and if it fires it may hide a real bug by returning silently. Check where the value enters, then trust it.`,
      follow:`Where should a missing prefab reference be caught?`,
      red:`Says more checks are always safer.` },
    { q:`In Unity, why is target?.DoThing() risky?`,
      a:`?. uses the C# null check, not Unity’s overloaded ==. A destroyed object is not C# null, so the call goes through to a destroyed object. Use an explicit == null check.`,
      follow:`What is the Godot equivalent problem?`,
      red:`Thinks ?. and == null are identical.` }],
  mid:[
    { q:`Where do guards belong in a game codebase?`,
      a:`At boundaries: input, network, save and mod data, engine lifetime, async continuations. Validate once and trust the result inside. Broken setup fails fast at load.`,
      follow:`Is a save file from an older version a boundary?`,
      red:`Cannot name a boundary.` },
    { q:`An agent’s pull request adds twelve null-checks "for robustness". How do you review it?`,
      a:`Ask for each: which state, from where. Keep the ones at real boundaries, remove the ones upstream excludes, turn invariant checks into asserts. Then add a rule so the next session does not repeat it.`,
      follow:`What if you cannot trace one?`,
      red:`Approves because it cannot hurt.` }],
  senior:[
    { q:`When would you keep a redundant-looking guard?`,
      a:`When the guarantee is outside your control and can change: a third-party SDK callback, a server response, an engine lifetime event. Or in shipping builds where soft failure is the product decision, expressed once as policy rather than scattered.`,
      follow:`How do you express that policy once?`,
      red:`Keeps all guards or removes all guards by rule.` },
    { q:`How do you stop a team and its agents writing defensive noise?`,
      a:`A written rule on guard placement in the agent rules file and the review checklist, fail-fast wiring validation in the editor, asserts for invariants, and reviewers who ask which state each guard covers.`,
      follow:`Which of those actually enforces rather than advises?`,
      red:`Relies on telling people to be careful.` }] });

T('craft-what-matters-now',{ d:'craft', t:'What matters now', tag:'Understand what you ship, prove it works, keep it simple. Three rules; each has evidence, and each is cheaper than the failure it prevents.',
  what:`Three priorities for writing code when generating it is cheap. Understanding over output: you own every line you merge, including the ones you did not type, so a change you cannot explain is a change you cannot debug at two in the morning before a certification deadline. Verification: a claim that code works needs the check that would have shown it failing, run and named. Simplicity: the simplest design that meets the need, adding complexity only when a measured problem demands it. Anthropic’s own guidance on building agent systems says the same thing about its own field: find the simplest solution and add complexity only when needed. None of this is new. What changed is the cost balance: output is abundant, so the scarce things are the ones on this list.`,
  why:[`A bug in code nobody on the team understands takes longer to fix than the code took to write.`,`Unverified work shifts cost to QA, certification and players, where it is most expensive.`,`Complexity compounds: each layer an agent adds becomes context the next agent session must load and can misread.`],
  think:{ q:[`Could I explain this change, line by line, to a reviewer without the agent?`,`Which check did I run that would have failed if this were wrong?`,`What is the simplest version that works, and why is this one not it?`,`Is this abstraction solving a problem I have measured, or one I imagined?`],
    trade:[`Understanding everything slows merging. Scale the depth of reading to the risk: save format and netcode line by line, a debug menu skimmed.`,`The simple design may need rewriting later. That rewrite is usually cheaper than carrying a speculative abstraction the whole time.`],
    traps:[`Merging because the tests pass, when the agent wrote the tests.`,`Accepting the agent’s own report that it ran the tests as the check.`,`Adding a plugin system, an event bus or a config layer for a second use case that never arrives.`],
    good:[`Every merged change has an author who can explain it, and a named check in its description.`,`New abstractions arrive with the second or third real use, not the first.`],
    bad:[`A post-mortem finds nobody knew how the failing system worked, because it was generated and merged in one afternoon.`] },
  how:[`Read before you merge, at a depth set by risk. If you cannot explain a part, ask the agent to explain it, then check the explanation against the code.`,`Name the check: in the pull request, say which command ran and what it showed. No check, no done.`,`Choose the boring option first: a function before a class, a class before a framework, data before code.`,`Delete speculative generality in review: parameters no caller passes, interfaces with one implementation and no test double.`],
  ai:{ yes:[`Explain a generated change back to you so you can find the part you do not understand.`,`Propose the simplest version of a design and list what it gives up.`],
       no:[`Stand in for your understanding at merge time.`,`Declare its own work verified.`] },
  prompts:[{l:'Simplest version',p:`Here is my design for [FEATURE]: [PASTE]. Propose the simplest version that meets these requirements: [LIST]. For each piece you removed, say what it would have been needed for and what signal would tell me to add it back.`},
    {l:'Explain before merge',p:`Explain this diff to me as a reviewer: [PASTE]. For each hunk: what it changes in behaviour, what could break, and which test covers it. Say NONE where no test covers it.`}],
  verify:[`Can the author explain every hunk without the tool?`,`Is the named check the same one CI runs?`,`Is there an abstraction with a single use and no plan for a second?`],
  test:[`Pick a recent merged change at random and ask the author to explain it cold. Track how often they cannot.`,`Count interfaces with one implementation in the codebase each quarter; a rising count is speculative generality.`],
  facts:[{claim:`Anthropic’s engineering post Building effective agents, published 19 December 2024, recommends finding the simplest solution possible and increasing complexity only when needed.`,asOf:'2026-09-28',src:'https://www.anthropic.com/engineering/building-effective-agents'}],
  rel:[['craft-engineer-in-the-ai-era','That topic describes the role; this one is the three rules for the work itself.'],['craft-verification-as-the-job','Verification is covered in depth there.'],['craft-core-values-that-last','The values test there explains why these three survive.'],['verifying-ai-output','Practical checks for the understanding and verification rules.']] });
INTERVIEW('craft-what-matters-now',{
  junior:[
    { q:`An agent wrote a feature and the tests pass. Are you done?`,
      a:`Not until you understand it and know the tests would fail if it were wrong. Read it, break it once, and run the full suite CI runs.`,
      follow:`How do you check a test would fail?`,
      red:`Yes, the tests pass.` },
    { q:`What does simple mean for code?`,
      a:`Fewest concepts a reader must hold to change it safely. Not fewest lines. Usually plain functions and data before frameworks.`,
      follow:`Give an example of a simple choice over a clever one.`,
      red:`Equates simple with short.` }],
  mid:[
    { q:`How do you decide how deeply to read a generated change?`,
      a:`By risk: persistence, netcode, payments and platform code line by line; tools and debug UI lighter. The depth is a decision, written in the review.`,
      follow:`What makes save code high risk?`,
      red:`Reads everything equally or nothing.` },
    { q:`When do you add an abstraction?`,
      a:`When a second or third real use exists and the duplication is costing something measurable. Not for imagined future needs.`,
      follow:`What is the cost of adding it too late?`,
      red:`Adds interfaces for everything up front.` }],
  senior:[
    { q:`How do you keep a team from shipping code it does not understand?`,
      a:`Authors explain changes in review, pull requests name the check that ran, risky areas require line-by-line review, and random cold explanations of merged work are part of retros.`,
      follow:`How do you do that without slowing everything?`,
      red:`Bans AI tools.` },
    { q:`Is there evidence that simplicity matters more with agents?`,
      a:`Direct evidence is thin. Vendor guidance such as Anthropic’s recommends the simplest workable design, and Google’s review guide favours small changes. The argument is mostly mechanism: agents work in limited context, and complexity consumes it. Say that honestly rather than overclaim.`,
      follow:`What would you measure to find out in your team?`,
      red:`Cites a precise productivity number with no source.` }] });

T('craft-teaching-agents',{ d:'craft', t:'Teaching agents to avoid pitfalls', tag:'Tell an agent once in a rules file and it usually listens. Make a tool refuse the mistake and it always does. Know which of your lessons need which.',
  what:`The ways to stop an agent repeating a mistake, from weakest to strongest. Rules files: CLAUDE.md for Claude Code, AGENTS.md as the cross-tool format, .cursor/rules for Cursor. They load into context at the start of a session and are advice; Anthropic’s docs say plainly that Claude treats CLAUDE.md as context, not enforced configuration. Examples in the prompt: one good example of the house pattern teaches more than a paragraph describing it. Review checklists: a list of failure classes that the agent or a reviewer runs against a diff. Types and schemas: a wrong shape that does not compile cannot be merged. Tests: a behaviour the suite checks cannot silently change. Linters and analysers: a banned pattern fails the build. Hooks: code that runs at a fixed point in the agent’s loop and can block an action, such as a Claude Code PreToolUse hook that exits with code 2 to refuse a command. The rule of thumb: write lessons in the rules file first, and promote any lesson that is broken twice to a tool that enforces it.`,
  why:[`Agents start each session fresh. Anything not in the repository or its tools is forgotten.`,`Rules files are cheap to write and get ignored under load: long files reduce adherence, and Claude Code’s docs warn that of two contradictory rules it may pick one arbitrarily.`,`Enforcement moves the check from the agent’s judgement to the build, where it applies to humans too.`,`Game projects have expensive, specific traps (engine lifetime, platform APIs, save compatibility) that no general model knows about your project.`],
  think:{ q:[`Is this lesson advice or a hard rule? If it is broken, what does it cost?`,`Can a type, a test or a lint rule express it? Then why is it only prose?`,`Is the rules file short enough to be followed, and free of contradictions?`,`Does the rule say what to do, with an example, or only what to avoid?`,`Which rules apply only to some paths, and can they load only there?`],
    trade:[`Prose rules are flexible and unenforced. Tool rules are rigid and enforced. Put judgement calls in prose and bright lines in tools.`,`Hooks can block anything, including legitimate work. A noisy hook trains people to disable it.`,`A long rules file covers more cases and is followed less. Split by path and keep the always-loaded part short.`],
    traps:[`A 900 line rules file nobody has read since it was written, with three rules that contradict each other.`,`Writing "never do X" in the rules file after the third incident, instead of a lint rule after the second.`,`Rules that restate what the linter already enforces, so the file grows with no gain.`,`A hook that blocks a command by string match and is bypassed by a different spelling of the same command.`,`Keeping CLAUDE.md, AGENTS.md and .cursor/rules as three diverging copies of the same rules.`],
    good:[`The rules file is short, current, and each rule is either a judgement call or points at the tool that enforces it.`,`Repeated review comments turn into lint rules or tests within a sprint.`,`One source of truth for agent rules, with other tools' files importing or linking it.`],
    bad:[`The same agent mistake appears in review every week, and each time someone writes it in the rules file again.`] },
  how:[`Start with a short rules file: build and test commands, where things live, project conventions, and the pitfalls that are expensive here. Keep the always-loaded part small.`,`Pick one source of truth. AGENTS.md is read by many tools. Claude Code reads AGENTS.md by default only when the project has no CLAUDE.md, so where both exist, import it from CLAUDE.md with @AGENTS.md.`,`Scope rules by path: Claude Code’s .claude/rules files take a paths field, and Cursor rules can apply by file pattern, so engine-specific rules load only for engine code.`,`Show, do not describe: include a short example of the preferred pattern, such as the house way to validate serialised references.`,`Promote on the second break: express the rule as a type, a test, an analyser rule or a CI check.`,`Use hooks for bright lines: block destructive commands, run the formatter after edits, run tests before the agent may stop.`,`Keep a review checklist of failure classes, and run it on agent diffs as well as human ones.`,`Prune: review rules files for stale and contradictory entries on a schedule.`],
  ai:{ yes:[`Draft a rules file from the repository’s build scripts, lint config and recent review comments.`,`Find contradictions and stale entries in existing rules files.`,`Turn a repeated review comment into a draft lint rule or test.`],
       no:[`Be the only guard on a bright line; that needs a hook or a CI check.`,`Decide which lessons your team considers hard rules.`] },
  prompts:[{l:'Rules from reviews',p:`Here are the last [N] review comments on agent-written pull requests: [PASTE]. Group them by failure class. For each class, propose (a) one line for the agent rules file with a short example, and (b) whether a type, test, lint rule or hook could enforce it instead, with a sketch. Put enforceable items first.`},
    {l:'Rules file audit',p:`Here is our agent rules file: [PASTE] and our lint config: [PASTE]. List rules that contradict each other, rules the linter already enforces, rules with no example, and rules that apply only to some paths. Propose a shorter file. Do not add new rules.`}],
  verify:[`Does every hard rule in the rules file point at the tool that enforces it?`,`Is the always-loaded rules file short enough to be followed?`,`Does a hook you added actually block the case you meant, including other spellings of it?`],
  test:[`Give an agent a task that invites a known pitfall, with and without the rule. If the rule does not change the result, it is not working.`,`Trigger each hook on purpose and check it blocks, then check it lets a legitimate command through.`,`Count repeated review comments per month. A comment that keeps appearing is a rule that should be a tool.`],
  facts:[{claim:`Claude Code’s memory documentation says CLAUDE.md files and auto memory are treated as context, not enforced configuration, and recommends a PreToolUse hook to block an action regardless of what Claude decides.`,asOf:'2026-09-28',src:'https://code.claude.com/docs/en/memory'},
    {claim:`Claude Code’s memory documentation recommends keeping each CLAUDE.md under 200 lines, says longer files reduce adherence, and supports @path imports and path-scoped rules in .claude/rules.`,asOf:'2026-09-28',src:'https://code.claude.com/docs/en/memory'},
    {claim:`Claude Code hooks documentation: a PreToolUse hook that exits with code 2 blocks the tool call; hooks can be configured in ~/.claude/settings.json, a project’s .claude/settings.json or .claude/settings.local.json, managed policy, plugins, and skill or subagent frontmatter.`,asOf:'2026-09-28',src:'https://code.claude.com/docs/en/hooks'},
    {claim:`AGENTS.md is an open format stewarded by the Agentic AI Foundation under the Linux Foundation, used by over 60,000 open-source projects per its site, where the nearest AGENTS.md in a directory tree takes precedence.`,asOf:'2026-09-28',src:'https://agents.md/'},
    {claim:`Cursor stores project rules as .mdc files in .cursor/rules, applied always, by agent judgement from a description, by file pattern, or manually by @-mention, and also supports AGENTS.md.`,asOf:'2026-09-28',src:'https://cursor.com/docs/context/rules'}],
  rel:[['lead-conventions','Conventions a lead sets are the content an agent rules file carries.'],['lead-code-review','Review comments are the source of new rules, and the checklist runs in review.'],['ai-agentic-implementation','Agentic implementation is where rules files and hooks do their work.'],['craft-over-defensive-code','Guard placement is a typical lesson worth teaching an agent.']] });
INTERVIEW('craft-teaching-agents',{
  junior:[
    { q:`What is an agent rules file for?`,
      a:`It gives the agent project context at the start of every session: commands, conventions, pitfalls. Examples are CLAUDE.md, AGENTS.md and .cursor/rules. It is advice, not enforcement.`,
      follow:`What would you put in one for a Unity project?`,
      red:`Thinks the agent remembers previous sessions without it.` },
    { q:`The agent keeps using a deprecated engine API. What do you do?`,
      a:`Add a rule with the replacement and an example; if it happens again, add an analyser or lint rule that fails the build on the old API.`,
      follow:`Why not just keep correcting it in review?`,
      red:`Corrects it by hand every time.` }],
  mid:[
    { q:`Rules file, lint rule, test or hook: how do you choose?`,
      a:`Judgement calls go in prose. Shape errors go in types. Behaviour goes in tests. Banned patterns go in lint. Actions the agent must never take, or steps it must always run, go in hooks. Enforcement wins when the cost of a break is high.`,
      follow:`Give an example of each from a game project.`,
      red:`Puts everything in the rules file.` },
    { q:`Your rules file is 800 lines. Problem?`,
      a:`Yes. Long files reduce adherence and hide contradictions. Keep a short always-loaded core, move path-specific rules into scoped files, and remove what tools already enforce.`,
      follow:`How do you find contradictions?`,
      red:`More rules is more safety.` }],
  senior:[
    { q:`How do you keep rules consistent across Claude Code, Cursor and Codex on one team?`,
      a:`One source of truth, usually AGENTS.md since many tools read it, with tool-specific files importing or pointing to it, and hard rules in the build so they apply regardless of tool.`,
      follow:`What goes in a tool-specific file then?`,
      red:`Maintains three separate copies.` },
    { q:`Design a hook policy for agents in your repository.`,
      a:`Block destructive and irreversible commands, format after edits, run the fast test suite before the agent may finish. Keep hooks few and precise, test that they block and that they allow, and review them like code since they run with the developer’s permissions.`,
      follow:`How can a string-matching hook be bypassed?`,
      red:`Blocks so much that people disable hooks.` }] });

T('craft-tools-that-work-with-ai',{ d:'craft', t:'Tools that work with AI', tag:'An agent can only change what it can read and only trust what it can run. Pick tools whose files are text, whose docs are versioned and whose checks run without a window.',
  what:`Some tools are far easier for an AI agent to work in than others, and the difference is mostly mechanical. Five properties decide it. The project is stored as text the agent can read and diff. The documentation is open and versioned, so the agent can check an API against the version you run. The tool runs headless from a command line, so the agent can build, test and export without a person clicking. The feedback loop is fast, so a wrong change fails in seconds. And where the work is visual, there is a way to show the agent a picture: a screenshot, a render, an MCP server that exposes the editor. The engine guides compare this per engine. In their judgement, Godot and Ren’Py sit at the easy end, Unity is workable with the right settings, and Unreal’s binary assets are the hard case.`,
  why:[`An agent that cannot read a scene file edits the code around it blind, and the scene is where the bug usually is.`,`Headless runs are how an agent verifies its own work. Without them every change waits for a human to press Play, and the agent’s speed is wasted.`,`Versioned docs are the cure for the most common agent error in game code: fluent use of an API from an older version of the engine.`,`Tool choice outlives any one model. A text-based, scriptable pipeline benefits every future agent; a binary, GUI-only one blocks all of them.`],
  think:{ q:[`Can an agent read every file that defines behaviour, or only the scripts?`,`What is the one command that proves the game still builds and the tests still pass, and does it run without a display?`,`How long from a change to a failing signal: seconds, minutes, or the next playtest?`,`Which docs match the engine version you actually run, and can the agent reach them?`,`Which work is irreducibly visual (layout, lighting, feel), and how will a person or a vision model judge it?`,`If you add an MCP server that runs code in the editor, who approves each call and what can it touch?`],
    trade:[`Text serialization diffs and merges, and it is larger and slower to load than binary. Unity’s Force Text default is arguably the right trade for almost every team.`,`An MCP bridge into the editor lets an agent act on scenes directly, and it is arbitrary code execution inside your project. Scripted, reviewed commands are slower and safer.`,`Vision models can check that a button exists and text fits. They are weak at judging feel, spacing a designer would accept, and anything that needs motion.`],
    traps:[`Assuming text means editable. Godot’s .tscn is text, but hand-editing resource ids and ext_resource references breaks scenes in ways that load silently wrong. Prefer the engine’s own API or a headless script that saves through it.`,`Switching Unity to Force Text and forgetting the .meta files. The GUIDs in them are what references point at, and an agent that moves or recreates an asset without its .meta breaks every reference to it.`,`Letting an agent edit Unreal Blueprints or .uasset content through a file tool. They are binary; the realistic route is C++, Python editor scripting or commandlets, with the asset work left in the editor.`,`Trusting a screenshot check that passes on desktop headless Chrome. The web stack’s easy loop hides Safari on iOS audio unlock and mid-range phone frame rates.`,`Installing a community MCP server without reading what its tools do. Some expose a run-any-code tool with no scope at all.`,`Measuring agent fit on a sample project. The pain appears at project size: import caches, cold editor starts, and scenes too large for a context window.`],
    good:[`One documented command builds, tests and exports headless, and the agent runs it before claiming a change works.`,`Every file that defines behaviour is text in version control, and merge conflicts in scenes are rare and readable.`],
    bad:[`The agent writes the script and a person opens the editor to see whether it did anything.`,`Generated code uses an API removed two engine versions ago, and nothing fails until runtime.`] },
  how:[`Make the project readable. Godot is text by default (.tscn, .tres, project.godot). In Unity keep Asset Serialization on Force Text and commit every .meta. In Unreal accept that assets are binary and move logic into C++ or Python where an agent can read it.`,`Write the one headless command: godot --headless with a test or export preset, Unity -batchmode -runTests or -executeMethod, Unreal RunUAT BuildCookRun, Ren’Py lint from the launcher’s command line, blender -b -P with --python-exit-code for Blender pipelines, a browser test runner for the web stack. Put it in the repository and in the agent’s rules file.`,`Pin the docs to the version. Point the agent at the versioned manual (Unity’s /6000.x/ path, Godot’s stable or version-tagged docs) and tell it which major version you run.`,`Shorten the loop. Fast unit tests for logic, a smoke scene that boots and exits, and a screenshot step for UI. A loop that takes ten minutes will be skipped.`,`Add vision where the work is visual. Capture a screenshot or render headlessly and let a model check concrete, stateable things: element present, text not clipped, no magenta missing-texture. Keep taste with a person.`,`Treat MCP servers as privileged code. Prefer servers with narrow tools, read the tool list, and approve calls that write. The MCP specification itself says tools represent arbitrary code execution.`,`Read the engine guides for the specifics: Godot, Unity, Unreal, GameMaker, Ren’Py, the web stack and Blender each have an AI-fit section.`],
  ai:{ yes:[`Audit a repository for AI fit: list binary files that define behaviour, missing headless commands and version drift in the docs it would use.`,`Write the headless build-and-test script for your engine version and explain each flag.`,`Draft a rules file that tells an agent the engine version, the verification command and which files never to hand-edit.`,`Check screenshots against a list of concrete UI assertions.`],
       no:[`Decide whether a scene feels right, or whether lighting reads. It sees a frame, not play.`,`Edit binary assets or hand-edit serialized ids safely.`,`Judge whether a community MCP server is safe to install. Read its tools yourself.`] },
  prompts:[{l:'AI-fit audit',p:`Act as a build engineer. Our engine is [ENGINE AND EXACT VERSION]. Here is the repository tree and our current build notes: [PASTE]. List: files that define behaviour but are binary or unreadable to you; the headless command that would build and run tests, with flags for this exact version, or say that none exists; docs you would need and whether a versioned copy exists; and work you cannot verify without a person. Do not guess flags you are unsure of; mark them.`},
    {l:'Screenshot assertions',p:`Here is a screenshot of [SCREEN] at [RESOLUTION], and the list of things that must be true: [LIST, e.g. all four buttons visible, no text truncated, health bar top left]. For each item answer pass, fail or cannot tell, and say what in the image you based it on. Do not comment on style.`}],
  verify:[`Did the agent run the headless command, and did you see its output, or did it only say it would pass?`,`Is every API it used present in the versioned docs for your engine version?`,`Did it change a serialized file by hand, and does the scene still open and reference the same assets?`],
  test:[`Time the loop: change one line, run the headless check, get a result. Track that number; it predicts how often agents and people will actually run it.`,`Break a test on purpose and confirm the headless command exits non-zero. A check that cannot fail proves nothing.`,`Give an agent a small task in each candidate tool and count how many of its claims you could verify without opening the editor.`],
  facts:[
    { claim:'Unity Asset Serialization Mode offers Mixed, Force Binary and Force Text, and Force Text is the default.', asOf:'2026-09-28', src:'https://docs.unity3d.com/6000.6/Documentation/Manual/class-EditorManager.html' },
    { claim:'A Unity .meta file holds the asset’s unique ID and all its import settings, and must stay with the asset file it relates to.', asOf:'2026-09-28', src:'https://docs.unity3d.com/6000.6/Documentation/Manual/AssetMetadata.html' },
    { claim:'Epic’s Perforce guide states .uasset files are binary and cannot be merged in a text-based tool.', asOf:'2026-09-28', src:'https://dev.epicgames.com/documentation/unreal-engine/using-perforce-as-source-control-for-unreal-engine' },
    { claim:'Blender -b runs without its interface, -P runs a Python script, and --python-exit-code sets a non-zero exit code when a Python exception is raised.', asOf:'2026-09-28', src:'https://github.com/blender/blender/blob/v5.2.2/source/creator/creator_args.cc' },
    { claim:'The MCP specification (revision 2026-07-28) uses stateless JSON-RPC requests; servers offer resources, prompts and tools, and elicitation is the only client feature; it says tools represent arbitrary code execution and that hosts must obtain explicit user consent before invoking any tool.', asOf:'2026-09-28', src:'https://modelcontextprotocol.io/specification/2026-07-28' },
    { claim:'The mcp-for-blender community server exposes an execute_blender_code tool that runs arbitrary Python, and its README says to save your work before using it.', asOf:'2026-09-28', src:'https://github.com/ahujasid/mcp-for-blender' }],
  diagram:{ kind:'matrix', title:'How readable and runnable each tool is for an agent', note:'The main limits are this site’s judgement, drawn from the engine guides.', rows:['Godot','Unity','Unreal','Ren’Py','Web stack','Blender'], cols:['Project files','Headless run','Main limit'],
    cells:[['Text: .tscn, .tres','--headless scripts and exports','Hand-edited resource ids break scenes'],['YAML with Force Text, plus .meta','-batchmode, -runTests','GUIDs in .meta; Inspector wiring'],['Binary .uasset','RunUAT, commandlets','Blueprints and assets unreadable'],['Plain .rpy script','Launcher lint and build','Presentation still needs eyes'],['All text: code, JSON, glTF','Headless browser, screenshots','Desktop run hides phone behaviour'],['Binary .blend, Python bpy','blender -b -P','Scripts see data, not the look']] },
  rel:[['craft-ai-orchestrates-tools-compute','The same split applies inside the tool: let the model decide, let the engine compute and check.'],['craft-verification-as-the-job','A headless check is the verification an agent can run for itself.'],['craft-teaching-agents','The rules file is where the headless command and the do-not-edit list live.'],['ai-agentic-implementation','Agentic implementation assumes the loop this topic sets up.'],['infra-ci-pipelines','The command the agent runs should be the one CI runs.']] });
INTERVIEW('craft-tools-that-work-with-ai',{
  junior:[
    { q:`Why does it matter for AI tools whether a scene file is text or binary?`,
      a:`Because the agent can only read and diff text. With a text scene it can see what a change did and a reviewer can see it in the diff. With binary it changes code around a scene it cannot see. Name an example: Godot .tscn or Unity with Force Text versus an Unreal .uasset.`,
      follow:`Is a text scene safe to edit by hand?`,
      red:`Says models can read anything, or has never looked inside a scene file.` },
    { q:`What is a headless run and why would an agent need one?`,
      a:`Running the engine or tool from the command line with no window, for tests, builds or exports. The agent needs it to check its own work and get an exit code. Give the flag for one engine, such as godot --headless or Unity -batchmode.`,
      follow:`How do you know the headless run would fail if something broke?`,
      red:`Thinks the agent checking is the same as the agent saying it checked.` }
  ],
  mid:[
    { q:`An agent keeps writing Godot 3 code in a Godot 4 project. What do you change?`,
      a:`Tell it the version in the rules file, point it at the versioned docs, and make the headless check catch it: a script parse fails fast. Mention the specific renames it gets wrong, such as KinematicBody and yield.`,
      follow:`Which of those three fixes is the one that always works?`,
      red:`Only rewords the prompt.` },
    { q:`Would you install an MCP server that lets the agent control the editor?`,
      a:`Possibly, after reading its tools. If it exposes a run-any-code tool, it is arbitrary execution in the project, so I would approve writes, keep the project in version control and prefer narrow tools. The protocol spec says hosts must get consent before tool calls.`,
      follow:`What would you want in the repository before letting it run?`,
      red:`Installs it because it is popular, or refuses all tools without weighing them.` },
    { q:`Where do vision models help with game UI, and where do they not?`,
      a:`They help with concrete checks on screenshots: element present, text not clipped, missing textures. They do not judge feel, animation or a designer’s spacing. Say you would write the assertions first.`,
      follow:`How would you get screenshots without a person?`,
      red:`Asks the model whether the UI looks good.` }
  ],
  senior:[
    { q:`You lead a team choosing between Unity and Unreal, and one argument is AI fit. How do you weigh it?`,
      a:`As one factor, measured, not assumed. Unity with Force Text is readable; Unreal’s assets are binary, so agents work in C++ and Python there. I would run a short trial of real tasks in each and count verifiable claims. Platform, team skills and licence usually dominate.`,
      follow:`What would make AI fit the deciding factor?`,
      red:`Makes it the whole decision, or dismisses it without evidence.` },
    { q:`How would you make an existing binary-heavy pipeline friendlier to agents without rebuilding it?`,
      a:`Move logic out of assets into code, add a headless build and test entry point, export readable reports from the editor (asset lists, reference graphs) and keep the binary content work with people. Change what gives the agent a signal, not everything.`,
      follow:`Which of those would you do first and why?`,
      red:`Proposes switching engines.` }
  ] });

T('craft-source-control-for-games',{ d:'craft', t:'Source control for games', tag:'Code merges; a texture does not. Game source control is Git for text, locking for binaries, and never committing what the engine can rebuild.',
  what:`Game projects mix code, which merges, with large binary assets, which do not. The tools answer that differently. Git with Git LFS keeps large files out of the history and can lock them. Perforce P4 is centralised, handles huge repositories, locks binaries through its typemap, and is the tool Epic documents for Unreal teams. Unity Version Control, formerly Plastic SCM, sits between: branch-friendly, with locking and a simplified client for artists. Whichever you use, three rules hold. Lock what cannot merge. Ignore what the engine regenerates: Unity’s Library folder, Godot’s .godot folder, Unreal’s DerivedDataCache. Keep branches short, because long branches over binary assets end in someone’s work being thrown away.`,
  why:[`Two people editing the same scene or texture at once means one of them loses the work. Locking is the only fix for files that cannot merge.`,`Committing caches bloats the repository, causes constant false conflicts, and makes every clone slow.`,`A game repository grows to tens or hundreds of gigabytes. The tool decides whether a new artist can get a working copy in an hour or a day.`,`Source control is also the undo button for the whole team, and the provenance for every build.`],
  think:{ q:[`What fraction of the repository is binary, and how large will it be at ship?`,`Who works in it: programmers only, or artists and designers who will not use a command line?`,`Which files cannot merge and must be locked?`,`What does the engine regenerate, and is it all ignored?`,`Where is the server, what does hosting cost per seat and per gigabyte, and what does the free tier cover?`,`How long do branches live, and who merges scenes?`],
    trade:[`Git with LFS is free to start, familiar to programmers and well integrated with CI; locking is opt-in and artists find it hard. Perforce scales and locks well; it costs seats past the free tier and programmers miss Git’s branching.`,`Text scenes (Godot, Unity Force Text) can merge, sometimes. Locking them too is safer for busy scenes and slower for everyone.`,`One repository keeps everything in step; splitting code from raw art sources keeps clones small and adds a sync problem.`],
    traps:[`Committing Library, .godot or DerivedDataCache. They are large, machine-specific and regenerated.`,`Adding LFS after the history already holds gigabytes of binaries. Tracking new files does not shrink old history; that needs a rewrite.`,`Marking files lockable but never locking. Lockable files are read-only until locked, so people clear the flag by hand and the protection is gone.`,`Missing Unity .meta files, or ignoring them. They carry the GUIDs every reference uses.`,`Line-ending conversion rewriting every text scene on Windows, producing huge meaningless diffs.`,`Long-lived feature branches over shared scenes. The merge at the end is where work gets lost.`,`Hitting the host’s per-file or storage limits in the week before a milestone.`],
    good:[`A new team member clones and opens the project in under an hour, with nothing regenerated committed.`,`Nobody has lost work to a binary conflict this quarter, because binaries are locked on edit.`],
    bad:[`The repository is 80 GB and half of it is cache.`,`Artists email files to a programmer who commits them.`] },
  how:[`Pick the tool by team and size. A small team of programmers: Git with LFS. Artists at scale or Unreal: Perforce P4. A Unity team wanting branching plus artist-friendly locking: Unity Version Control. Check free tiers against your seat count and storage.`,`Set up ignores on day one: Unity’s Library, Temp, Obj, Logs and UserSettings, from github/gitignore’s Unity template; Godot’s .godot/, from Godot’s docs; Unreal’s DerivedDataCache, Intermediate and Saved, from Epic’s guides, with Binaries ignored unless artists need prebuilt editor binaries.`,`Route binaries through LFS or the typemap before the first asset commit. Mark art sources, audio and binary scenes lockable.`,`Fix line endings in .gitattributes, not in each person’s config. Godot’s generated file forces LF.`,`For Unity, keep Force Text, commit .meta files, and configure UnityYAMLMerge as the merge tool for scenes and prefabs.`,`Keep branches short. Trunk-based with feature flags for code; lock, edit, commit quickly for content. Use release branches for shipped builds and patches.`,`Read the engine guides: the Unreal guide covers the Perforce typemap and One File Per Actor, the Unity guide covers .meta and serialization.`],
  ai:{ yes:[`Generate a .gitignore and .gitattributes for your engine version and explain each line.`,`Audit a repository for committed caches, untracked binaries and missing .meta files.`,`Draft a branching and locking policy from your team size and release cadence.`,`Explain a merge conflict in a text scene and suggest which side to keep.`],
       no:[`Resolve a conflict in a binary asset. Nobody can; someone redoes the work.`,`Rewrite history to move files into LFS without a backup and a team-wide plan.`,`Choose the hosting plan without the current vendor prices.`] },
  prompts:[{l:'Repository audit',p:`Here is the output of listing our repository’s largest files and our current .gitignore and .gitattributes: [PASTE]. Engine: [ENGINE AND VERSION]. List files that are regenerated caches and should be ignored, binaries not tracked by LFS, text files at risk from line-ending conversion, and anything missing that the engine needs committed. For each, give the line to add. Do not suggest a history rewrite without saying what it costs.`},
    {l:'Branching policy',p:`We are [N] programmers and [M] artists on [ENGINE], using [TOOL], shipping [CADENCE]. Draft a one-page policy: branch types and lifetimes, which file types are locked and when, who merges scenes, and how release branches are cut and patched. Flag the rule most likely to be ignored and how to enforce it with tooling instead of trust.`}],
  verify:[`Does every ignore pattern match what the engine actually regenerates for this version?`,`Are binaries tracked before the first commit, not after?`,`Did the generated .gitattributes break Unity YAML files by treating them as binary, or leave binaries as text?`],
  test:[`Clone fresh on a clean machine and time it to an open, working project.`,`Two people try to lock the same asset: the second lock must fail, and a push of an asset someone else has locked must be refused.`,`List the ten largest paths in the repository. Any cache there is a bug.`],
  facts:[
    { claim:'git lfs track with --lockable adds the lockable attribute; Git LFS makes lockable files read-only locally until locked with git lfs lock, and on push verifies you are not modifying a file another user locked; servers without the locking API give a warning instead.', asOf:'2026-09-28', src:'https://github.com/git-lfs/git-lfs/wiki/File-Locking' },
    { claim:'GitHub’s Git LFS per-file limit is 2 GB on Free and Pro, 4 GB on Team and 5 GB on Enterprise Cloud.', asOf:'2026-09-28', src:'https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage' },
    { claim:'Perforce P4 (Helix Core) is free for up to 5 users and 20 workspaces, with file locking and streams.', asOf:'2026-09-28', src:'https://www.perforce.com/products/helix-core/free-version-control' },
    { claim:'Unity Version Control, formerly Plastic SCM, works with any engine including Unreal and offers file locking, Smart Locks and the Gluon client.', asOf:'2026-09-28', src:'https://unity.com/solutions/version-control' },
    { claim:'Since 1 March 2026 the cloud-hosted Unity Version Control charges nothing for seats, and the first 25 GB of storage per organisation each month is free, measured as a monthly average in GB instead of GB-hours; on-premises terms may differ.', asOf:'2026-09-28', src:'https://support.unity.com/hc/en-us/articles/34748492914964-Understanding-Unity-DevOps-charges' },
    { claim:'Godot’s docs say to exclude the .godot/ folder and *.translation files, and to use core.autocrlf input on Windows; generated metadata adds a .gitattributes that enforces LF.', asOf:'2026-09-28', src:'https://docs.godotengine.org/en/stable/tutorials/best_practices/version_control_systems.html' },
    { claim:'UnityYAMLMerge merges scene and prefab files semantically; it ships with the Editor, under Data/Tools on Windows and Contents/Helpers on macOS, and the manual gives a Git mergetool configuration for it.', asOf:'2026-09-28', src:'https://docs.unity3d.com/6000.6/Documentation/Manual/SmartMerge.html' },
    { claim:'Unreal’s DerivedDataCache is not committed to version control and can be regenerated from the .uasset files.', asOf:'2026-09-28', src:'https://dev.epicgames.com/documentation/unreal-engine/using-derived-data-cache-in-unreal-engine' },
    { claim:'Since Godot 4.4 scripts and shaders get .uid files beside them, which must be committed; scenes and resources store their UID in the file header and imported assets in their .import file.', asOf:'2026-09-28', src:'https://godotengine.org/article/uid-changes-coming-to-godot-4-4/' }],
  tech:[
    {n:'Git with Git LFS', how:`Code in Git; large binaries replaced by pointers and stored on an LFS server; lockable patterns for files that cannot merge.`, fit:`Small and mid teams, programmer-heavy, Godot and Unity projects, web games.`, cost:`Locking is opt-in and needs server support; hosting limits per file and per storage; artists need a GUI client.`, alt:`Perforce once the repository or the art team outgrows it.`},
    {n:'Perforce P4', how:`Centralised server; workspaces sync what they need; exclusive checkout for binaries via the typemap; streams for branching.`, fit:`Unreal studios, large art teams, repositories of hundreds of gigabytes.`, cost:`Seats past the free tier, a server to run, and less fluid branching for programmers.`, alt:`Unity Version Control for teams who want locking with lighter branching.`},
    {n:'Unity Version Control', how:`Plastic SCM technology, cloud or on-premises; full branching for programmers, the Gluon client and locking for artists.`, fit:`Unity teams mixing programmers and artists; also usable with Unreal.`, cost:`Cloud storage billed past the free allowance, with on-premises terms separate; smaller ecosystem than Git for CI and hosting.`, alt:`Git with LFS for programmer-heavy teams.`}],
  rel:[['team-and-collaboration','Locking and branch rules are team agreements expressed in tooling.'],['infra-artifacts-provenance','Every build should trace to one revision in source control.'],['infra-ci-pipelines','CI clones the repository on every run, so its size and ignores are CI costs.'],['quality-and-build-health','A clean clone that builds is the first build-health check.'],['craft-tools-that-work-with-ai','Text files in version control are what let agents read and diff the project.']] });
ENGINE('craft-source-control-for-games',{
  godot:{ term:`Scenes and resources are text and usually merge. The .godot folder is the import cache and is regenerated; the .import and, since 4.4, .uid files are committed; the project manager can generate a .gitattributes forcing LF line endings.`,
    api:['.godot/ (import cache, ignored)','project.godot','*.tscn / *.tres (text)','*.import (committed)','*.uid (committed, 4.4+)','export_presets.cfg','git lfs track --lockable'],
    snippet:`# .gitignore  (Godot 4)
.godot/
*.translation
/android/
# Godot 4.1+ keeps export credentials out of
# export_presets.cfg, so it is safe to commit

# .gitattributes
* text=auto eol=lf
*.png  filter=lfs diff=lfs merge=lfs -text
*.jpg  filter=lfs diff=lfs merge=lfs -text
*.wav  filter=lfs diff=lfs merge=lfs -text
*.ogg  filter=lfs diff=lfs merge=lfs -text
*.glb  filter=lfs diff=lfs merge=lfs -text
*.blend filter=lfs diff=lfs merge=lfs -text lockable
*.psd  filter=lfs diff=lfs merge=lfs -text lockable`,
    pitfall:`Ignoring the .import or .uid files next to each asset along with the .godot folder. The .import files hold import settings and UIDs, the .uid files hold script and shader UIDs, and both must be committed; only the .godot cache is regenerated. Without them every clone reimports with default settings and textures look wrong.`,
    map:`Godot’s .godot folder is Unity’s Library folder; Godot’s .import files play the role of Unity’s .meta import settings, and its .uid files the role of .meta GUIDs for scripts.` },
  unity:{ term:`With Force Text, scenes and prefabs are YAML and can merge with UnityYAMLMerge. Every asset has a .meta file with its GUID, which must be committed; Library is the regenerated cache.`,
    api:['Library/ Temp/ Logs/ (ignored)','*.meta (committed)','Asset Serialization: Force Text','UnityYAMLMerge','ProjectSettings/','Packages/manifest.json'],
    snippet:`# .gitignore  (Unity 6; a subset of
# github/gitignore’s Unity.gitignore)
/[Ll]ibrary/
/[Tt]emp/
/[Oo]bj/
/[Bb]uild/
/[Bb]uilds/
/[Ll]ogs/
/[Uu]ser[Ss]ettings/
/[Mm]emoryCaptures/
.vs/
.idea/
*.csproj
*.sln
*.slnx
*.apk
*.aab

# .gitattributes
* text=auto
*.unity  merge=unityyamlmerge eol=lf
*.prefab merge=unityyamlmerge eol=lf
*.asset  merge=unityyamlmerge eol=lf
*.meta   text eol=lf
*.png filter=lfs diff=lfs merge=lfs -text
*.fbx filter=lfs diff=lfs merge=lfs -text
*.wav filter=lfs diff=lfs merge=lfs -text
*.psd filter=lfs diff=lfs merge=lfs -text lockable`,
    pitfall:`Declaring merge=unityyamlmerge in .gitattributes without defining the driver in each person’s git config. Git then falls back to a plain text merge on scenes. Define the merge driver in a shared setup script that points at UnityYAMLMerge in the Editor’s Data/Tools folder on Windows or Contents/Helpers on macOS.`,
    map:`Unity’s Library folder is Godot’s .godot folder; Unity’s .meta GUIDs do what Godot’s UIDs do, stored in scene headers, .import files and, since 4.4, .uid files.` },
  note:`Unreal teams usually use Perforce, where ignores live in a .p4ignore and binary handling in the typemap; the Unreal guide covers it. Whatever the tool, ignore DerivedDataCache, Intermediate and Saved; Epic’s Perforce guide lets teams submit Binaries for artists who do not compile.` });
INTERVIEW('craft-source-control-for-games',{
  junior:[
    { q:`Why should the Unity Library folder not be committed?`,
      a:`It is a cache Unity regenerates from Assets and the .meta files. It is large, machine-specific and changes constantly, so committing it bloats the repository and causes conflicts. Godot’s .godot folder is the same idea.`,
      follow:`What in Unity must be committed that people sometimes forget?`,
      red:`Thinks committing it saves import time for the team.` },
    { q:`What does Git LFS do?`,
      a:`It stores large files outside the Git history and keeps small pointer files in the repository, so clones stay fast. It can also lock files so two people do not edit the same binary.`,
      follow:`What happens if you add LFS after committing large files?`,
      red:`Thinks it compresses files, or that it merges binaries.` }
  ],
  mid:[
    { q:`Two artists edited the same texture. How do you stop that happening again?`,
      a:`Lock binaries: mark them lockable in LFS so they are read-only until locked, or use exclusive checkout in Perforce or Unity Version Control. Then editing requires taking the lock first. Also check the server supports locking.`,
      follow:`What do people do when a lock is inconvenient, and how do you prevent it?`,
      red:`Suggests merging the images.` },
    { q:`Git with LFS or Perforce for a 12-person Unity team with five artists?`,
      a:`Either can work. Git LFS if the team knows Git and the repository stays manageable, with a GUI client and locking. Perforce or Unity Version Control if art volume is large and artists need simple, reliable locking. Check free tiers and seat costs.`,
      follow:`What number would change your answer?`,
      red:`Answers with one tool as always right.` }
  ],
  senior:[
    { q:`The repository is 150 GB and clones take a day. What do you do?`,
      a:`Measure what is in it: caches committed by mistake, binaries in plain history, raw art sources. Ignore and remove caches, move binaries to LFS with a planned history rewrite or a fresh repository, and consider splitting raw sources. Or move to a system with partial sync.`,
      follow:`How do you run the history rewrite without losing anyone’s work?`,
      red:`Rewrites history without warning the team.` },
    { q:`Design a branching model for a live game with weekly patches.`,
      a:`Trunk-based main with feature flags, short-lived branches, and a release branch per shipped build for hotfixes cherry-picked back. Lock binaries on edit. Content locks are short so the trunk keeps moving.`,
      follow:`What breaks when a feature branch lives three weeks?`,
      red:`Uses long-lived branches per feature over shared scenes.` }
  ] });

// Batch na: core engine-side craft (gameplay math, game loop, entities and scenes, physics, saves). Domain 'craft', engine views included.

T('craft-gameplay-math',{ d:'craft', t:'Gameplay math', tag:'Dot product for who is facing whom, cross product for which side, lerp for smooth, and quaternions so rotation never breaks.',
  what:`The small set of maths that most gameplay code uses. A vector is a direction and length. The dot product of two unit vectors is 1 when they point the same way, 0 when perpendicular and -1 when opposite, so it answers "is that in front of me" and "how aligned". The cross product of two vectors gives a third, perpendicular to both, and its sign tells you which side something is on. Lerp (linear interpolation) blends a to b by t. Easing reshapes t so motion starts or ends gently. A quaternion is a four-number rotation that interpolates cleanly, where Euler angles (pitch, yaw, roll) can lock up. Spatial queries (raycasts, overlaps, distance checks) ask the physics world what is where.`,
  why:[`Without the dot product, "can the guard see me" becomes a pile of angle conversions and special cases at the 0 and 360 degree seam.`,`Without frame-rate-independent smoothing, a camera that follows well at 60 Hz lags or snaps at 144 Hz or 30 Hz.`,`Euler angles interpolate wrongly and can lose a degree of freedom (gimbal lock). Camera and aim bugs of the "it flips at the top" kind come from here.`,`A sqrt hidden inside a distance check that runs for 5,000 entities every frame is a cost you can avoid by comparing squared distances.`],
  think:{ q:[`Is this a direction (normalise it) or a position (subtract two to get a direction)? Which coordinate space is each value in: local, world, screen?`,`Do I need the angle, or only to compare to a threshold? A dot product against a cosine avoids the arccos.`,`Is the smoothing meant to be fixed duration (lerp with t from 0 to 1) or to chase a moving target (exponential smoothing)?`,`Does this rotation ever pass through straight up or down, or turn more than 180 degrees at once?`,`How often does this query run, and can it use squared distances, a cheaper layer mask, or a spatial grid?`],
    trade:[`Quaternions avoid gimbal lock and interpolate well, and they are hard to read in the inspector. Keep Euler angles for authoring and quaternions for runtime.`,`Exponential smoothing (a = lerp(a, b, 1 - exp(-rate * dt))) is frame-rate independent and never quite arrives. A fixed-duration lerp with easing arrives exactly and needs a start value and a timer.`,`Physics queries are exact and cost real time. A distance check with a dot product is cheap and approximate.`],
    traps:[`Writing a = lerp(a, b, 0.1) every frame and calling it smooth. The feel depends on frame rate. Use 1 - exp(-rate * dt).`,`Comparing a dot product against an angle in degrees. It returns a cosine, so compare with cos(angle).`,`Normalising a zero-length vector. The result is zero or NaN, and it turns up as an object that vanishes.`,`Building rotation by adding to Euler angles from mouse input, then reading them back. The angles can wrap or flip, and they mean different things in different engines.`,`Assuming the sign of a cross product is the same in 2D and 3D, or the same in a left-handed and right-handed system. Test on a known case.`,`Lerping between two angles in degrees across the 359 to 1 seam. It turns the long way round.`],
    good:[`Field of view, facing and side tests are one or two lines built from dot and cross, with a comment on what a positive result means.`,`Camera and UI smoothing behave the same at 30, 60 and 144 frames per second.`,`Rotations are stored and blended as quaternions or basis, and only converted for display.`],
    bad:[`Code full of atan2, degree-to-radian conversions and special cases at 0 and 360.`,`A follow camera that judders when the frame rate changes.`] },
  how:[`Write down the coordinate space of every vector in the function name or comment. Most math bugs are a world vector used as if it were local.`,`For "is it in front, and within a cone": to_target = (target - self).normalized; in_cone = dot(forward, to_target) > cos(half_angle). Precompute the cosine once.`,`For "left or right of my facing": the sign of the cross product component along up (in 2D, cross(forward, to_target) as a scalar). Test with a known left and a known right case.`,`For smooth following: value = lerp(value, target, 1 - exp(-rate * dt)). For a timed move: t = elapsed / duration, then shape it with an easing function before the lerp.`,`For rotation: build a target rotation with look-at, then slerp (spherical lerp) toward it with the same exponential factor. Normalise quaternions if you combine many.`,`For "what is near me": compare squared distances, filter by layer mask first, then ask the physics world (raycast, overlap sphere) only for the survivors. Reuse result buffers to avoid garbage.`,`Cover the edges with tests: a zero vector, a target straight behind, straight above and exactly at the cone boundary.`],
  ai:{ yes:[`Turn a plain-language rule (the guard sees the player within 60 degrees and 15 metres, unless behind a wall) into vector code, and list the edge cases.`,`Explain why a given rotation code gimbal-locks, and rewrite it with quaternions.`,`Write unit tests with hand-computable vectors for a facing, side or cone test.`,`Convert a per-frame lerp into a frame-rate-independent one.`],
       no:[`Get a handedness or axis convention right without a test. The engine differs from the maths textbook, and the model guesses.`,`Tune an easing curve. That is feel, judged by eye and by playing.`,`Say a rotation is correct because the formula looks right. Run it at the poles and at 180 degrees.`] },
  prompts:[{l:'Write the facing test',p:`In [ENGINE] ([2D or 3D], [Y-up or Z-up], [handedness]) write a function that returns whether [TARGET] is within [ANGLE] degrees of the forward direction of [OBSERVER] and within [RANGE] units. Use a dot product against a precomputed cosine and squared distance, not an angle or a square root. Then list five test inputs with the expected result each, including a zero-length offset and a target directly behind.`},
    {l:'Make smoothing frame-rate independent',p:`This code smooths a value each frame: [PASTE]. Rewrite it to give the same result at 30, 60 and 144 frames per second, using exponential smoothing. Say what the rate parameter means in time (time to close 63 percent of the gap) and how to choose it.`}],
  verify:[`Is the coordinate space of every vector clear from the code?`,`Does the smoothing feel the same at 30 and 144 frames per second?`,`Do zero-length and exactly-behind cases give the intended result rather than NaN or a flip?`],
  test:[`Run the game with the frame rate capped at 30, 60 and 144 and record the camera position after two seconds. It should match to within a small tolerance.`,`Unit test the cone check at the boundary (just inside, just outside) and with the target at the observer’s own position.`,`Rotate an object through straight up and straight down with the mouse. It must not flip or jitter.`],
  facts:[{claim:`Godot’s transform guide says that Euler angles have no unique construction of an orientation, that interpolating them suffers from gimbal lock, that quaternions interpolate with slerp, and that quaternions used repeatedly must eventually be normalised.`,asOf:'2026-09-30',src:'https://docs.godotengine.org/en/stable/tutorials/3d/using_transforms.html'},
    {claim:`Unity’s Quaternion.Slerp(a, b, t) interpolates spherically between unit quaternions and clamps t to the range 0 to 1.`,asOf:'2026-09-30',src:'https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Quaternion.Slerp.html'},
    {claim:`Godot’s vector maths tutorial covers the dot and cross products and their geometric meaning.`,asOf:'2026-09-30',src:'https://docs.godotengine.org/en/stable/tutorials/math/vector_math.html'}],
  rel:[['craft-performance','Squared distances, layer masks and reused query buffers are the cheap end of spatial queries.'],['craft-game-loop-timestep','Frame-rate independent smoothing depends on the delta time the loop hands you.'],['craft-physics-and-collision','Raycasts, overlaps and sweeps are the query half of physics; the maths on this page is the vector half.'],['perception-and-awareness','A sight cone is a dot product and a raycast.'],['careers-game-coding-interviews','Interviewers turn these formulas into ten-minute questions; practise them aloud.']] });
ENGINE('craft-gameplay-math',{
  godot:{ term:`Vector2 and Vector3 have dot(), cross(), normalized(), direction_to() and distance_squared_to(). Rotations are Basis or Quaternion, and Node3D exposes quaternion. The global lerp functions are lerpf() and lerp_angle().`,
    api:['Vector3.dot() / cross() / direction_to()','Vector3.distance_squared_to()','Basis.looking_at()','Quaternion.slerp()','Node3D.quaternion','lerp_angle()','PhysicsDirectSpaceState3D.intersect_ray()'],
    snippet:`extends Node3D
@export var target: Node3D
@export var fov_deg := 90.0
@export var turn_rate := 8.0

func _process(delta: float) -> void:
    var to := global_position.direction_to(target.global_position)
    var fwd := -global_transform.basis.z             # Godot forward is -Z
    if fwd.dot(to) > cos(deg_to_rad(fov_deg * 0.5)):  # inside the view cone
        var goal := Quaternion(Basis.looking_at(to))
        var k := 1.0 - exp(-turn_rate * delta)        # same feel at any frame rate
        quaternion = quaternion.slerp(goal, k)`,
    pitfall:`Basis.looking_at() fails when the direction is parallel to the up vector (a target straight above or below), and direction_to() returns a zero vector when target and observer are at the same point. Guard both cases, or pass a different up vector, before the look-at. This snippet also assumes the node has no rotated parent, because quaternion is local.`,
    map:`Godot fwd.dot(to) is Unity Vector3.Dot(transform.forward, to). Godot forward is -Z, and Unity forward is +Z.` },
  unity:{ term:`Vector3.Dot, Vector3.Cross, Vector3.SqrMagnitude, Quaternion.LookRotation and Quaternion.Slerp cover most cases. Mathf.Lerp and Mathf.SmoothDamp handle scalars. Physics.Raycast and Physics.OverlapSphere are the spatial queries.`,
    api:['Vector3.Dot() / Cross() / sqrMagnitude','Quaternion.LookRotation()','Quaternion.Slerp()','Mathf.SmoothDamp()','Mathf.Deg2Rad','Physics.OverlapSphereNonAlloc()'],
    snippet:`using UnityEngine;
public class Watcher : MonoBehaviour {
    [SerializeField] Transform target;
    [SerializeField] float fovDeg = 90f, turnRate = 8f;

    void Update() {
        Vector3 to = (target.position - transform.position).normalized;
        if (to == Vector3.zero) return;                 // same position: no direction
        if (Vector3.Dot(transform.forward, to) > Mathf.Cos(fovDeg * 0.5f * Mathf.Deg2Rad)) {
            Quaternion goal = Quaternion.LookRotation(to);
            float k = 1f - Mathf.Exp(-turnRate * Time.deltaTime);
            transform.rotation = Quaternion.Slerp(transform.rotation, goal, k);
        }
    }
}`,
    pitfall:`Passing a zero vector to Quaternion.LookRotation logs an error and returns identity, so an object at the same position as its target snaps to face world forward. Also, Quaternion.Slerp clamps t, but the frame-rate-independent factor only helps if you compute it from Time.deltaTime and not a constant.`,
    map:`Unity Quaternion.Slerp is Godot Quaternion.slerp, and Unity Mathf.Lerp is Godot lerpf().` },
  note:`The maths is the same in both engines. What differs is the convention (which axis is forward, which way a cross product points) and the names. Test on one known left, right, front and back case whenever you move code between engines.` });
INTERVIEW('craft-gameplay-math',{
  junior:[
    { q:`What does the dot product of two unit vectors tell you?`,
      a:`How aligned they are. It is 1 for the same direction, 0 for perpendicular and -1 for opposite; it equals the cosine of the angle between them. So dot(forward, to_target) above cos(half_angle) means the target is inside a view cone, with no arccos needed.`,
      follow:`What if the vectors are not normalised?`,
      red:`Cannot say what the range of values is, or says it returns an angle.` },
    { q:`Why is lerp(a, b, 0.1) each frame not a good smoothing method?`,
      a:`The fraction applies per frame, so the result depends on the frame rate: a fast machine converges sooner. Use 1 - exp(-rate * dt) as the fraction.`,
      follow:`What does rate mean in seconds?`,
      red:`Says it is fine as long as the game runs at 60.` }
  ],
  mid:[
    { q:`When would you use a quaternion, and when Euler angles?`,
      a:`Store and interpolate rotation as a quaternion or basis because it avoids gimbal lock and slerps cleanly. Use Euler angles for what a person edits or reads, and for constrained cases such as a pitch clamped between two limits, where you keep pitch and yaw as separate floats.`,
      follow:`How do you build a mouse look that never rolls?`,
      red:`Says quaternions are always better and cannot name a case for Euler angles.` },
    { q:`A guard should notice the player within 60 degrees and 15 metres. Write the check and say where it can go wrong.`,
      a:`Squared distance first, then a dot product against cos(30 degrees), since 60 degrees is the full cone, then a raycast for line of sight. Failures: cone half-angle versus full angle, zero vector when positions coincide, eye height versus origin for the ray.`,
      follow:`How do you test the boundary?`,
      red:`Uses atan2 and degrees with no thought to the seam at 180.` },
    { q:`How do you make a spatial query cheap when 5,000 entities each ask it every frame?`,
      a:`Cheapest test first: squared distance, layer masks, a grid or spatial hash to skip far entities, staggered updates, and reused result buffers. Ask the physics world only for the survivors.`,
      follow:`When would you stop updating an entity’s query altogether?`,
      red:`Raycasts from every entity to every other.` }
  ],
  senior:[
    { q:`Your team ports gameplay code between engines and camera and aim feel wrong. What do you check?`,
      a:`Conventions: which axis is forward and up, handedness, rotation order, whether a cross product points the same way, radians versus degrees and the units of the world. Write small known-answer tests (a left, right, front and back case) and run them in both engines before touching feel.`,
      follow:`How would you prevent it on the next port?`,
      red:`Tunes numbers until it feels right without finding the convention difference.` }
  ] });

T('craft-game-loop-timestep',{ d:'craft', t:'The game loop and fixed timestep', tag:'Run the simulation in equal steps, draw as often as you like, and blend between the last two states so it looks smooth.',
  what:`The game loop is the cycle every game runs: read input, update the world, draw, repeat. Two clocks matter. Rendering runs as fast as the display and the machine allow, and that rate varies frame to frame. Simulation, especially physics, wants a constant step. The standard fix is the fixed timestep with an accumulator: add the real elapsed time to a bucket, run the simulation in equal steps while the bucket holds enough time for one, and draw with a blend between the previous and current state using what is left in the bucket. Godot runs physics this way by default in _physics_process, and Unity in FixedUpdate.`,
  why:[`Physics and gameplay with a variable delta time behave differently at different frame rates: a jump reaches another height, a fast object tunnels through a wall, and a spring explodes on a long frame.`,`A game that is not deterministic cannot replay, and cannot be rolled back or checked by a server. A fixed step is the base of every deterministic simulation.`,`If the simulation cannot keep up, the loop falls behind, runs more steps to catch up, falls further behind and freezes. This is the spiral of death, and it needs a cap.`,`With a 60 Hz physics step and a 144 Hz display, drawing only the latest physics state makes movement visibly stutter.`],
  think:{ q:[`What must not change with frame rate: physics, gameplay timers, AI, network simulation?`,`What step rate: 30, 60, 120 Hz? Higher costs CPU per second of game time. Lower feels coarser.`,`How many catch-up steps do I allow per frame before I drop time instead?`,`Do I draw the latest state or blend between the last two? The blend adds up to one step of visual delay.`,`Does anything in my update read the real clock, or delta time, when it should read the tick count?`],
    trade:[`Fixed step gives stability and reproducibility, and costs a bounded amount of delay and the work of interpolating rendering.`,`Variable step is simple and fine for visual-only effects and UI animation, and not for physics or anything you need to replay.`,`A higher tick rate makes controls and collision finer and costs CPU that grows with entity count.`],
    traps:[`Putting gameplay in the variable-rate callback (Update or _process) and physics in the fixed one, then having them disagree about the same object.`,`Reading input in the fixed step and losing a button press when no step runs that frame. Sample input in the frame callback and latch it until the next step consumes it.`,`No cap on catch-up steps, so a long hitch freezes the game while it tries to simulate the missed time.`,`Moving a Rigidbody or physics body from the variable callback, which skips the fixed step and jitters.`,`Using delta time in a fixed step. It is a constant. Use the constant, so the code is the same at every rate.`],
    good:[`The same recorded input gives the same simulation at any frame rate.`,`Motion of physics objects is smooth at 60 and 144 Hz displays because rendering blends between steps.`,`A long hitch skips time, and does not freeze.`],
    bad:[`The game feels different on a fast machine.`,`Physics bugs that only appear at low frame rates.`] },
  how:[`Choose the step, for example 1/60 s, and store it as a constant next to the simulation.`,`Each frame: accumulator += min(frame_time, max_frame_time). While accumulator >= step: sample latched input, run one simulation step, accumulator -= step.`,`Cap the number of steps per frame (for example 5). If the cap is hit, throw away the remaining accumulator rather than carrying it.`,`Keep the previous and the current simulation state. Draw at alpha = accumulator / step: position = lerp(previous, current, alpha).`,`Keep anything that changes simulation state inside the fixed step. Keep visual-only things (camera easing, particles, UI) in the frame callback.`,`In the engines, prefer the built-in fixed step for physics, and turn on the engine’s interpolation for rendering (Godot physics interpolation, Unity Rigidbody.interpolation) before writing your own loop.`,`Log frame time and step count per frame. A step count that rises steadily means the simulation is too slow for its step.`],
  ai:{ yes:[`Convert a variable-delta update into a fixed-step loop with an accumulator and interpolation.`,`Find state that changes in the wrong callback: physics in Update, input read only in FixedUpdate.`,`Write a headless test that runs the simulation for a set number of ticks at two different frame times and compares the states.`,`Explain the difference between _process and _physics_process, or Update, FixedUpdate and LateUpdate, for a given engine version.`],
       no:[`Pick the tick rate. It depends on your genre, platform and entity count.`,`Say the result is deterministic. Only a replay and checksum test on the target platforms says that.`,`Decide how much visual delay from interpolation is acceptable. That is a feel call.`] },
  prompts:[{l:'Fix the loop',p:`This is our [ENGINE] update code: [PASTE]. List everything that changes simulation state in a variable-rate callback, everything that reads input only inside the fixed step, and every use of delta time inside the fixed step. Propose a fixed-step loop with an accumulator, a step cap and render interpolation, and say which of our objects need previous and current state kept.`},
    {l:'Frame-rate independence test',p:`Write a headless test for [SIMULATION] that steps it for 10 seconds of game time at frame times of 1/30, 1/60 and 1/144 s with the same recorded inputs, and asserts that the final state hashes are equal. Say what would make them differ.`}],
  verify:[`Is every piece of simulation state changed only inside the fixed step?`,`Is there a cap on catch-up steps, and what happens when it is hit?`,`Do two frame rates give the same final state from the same inputs?`],
  test:[`Run the same recorded input at 30, 60 and 144 frames per second and compare a hash of the state at a set tick.`,`Force a 500 ms hitch and watch the step count on the next frame. It must stay at or below the cap and the game must resume, not freeze.`,`On a 144 Hz display with a 60 Hz step, film a moving object or record its screen position each frame. Without interpolation you will see repeated positions.`],
  facts:[{claim:`Glenn Fiedler’s "Fix Your Timestep" recommends a fixed simulation step with an accumulator, interpolation of rendering between the previous and current state, and warns about the spiral of death when simulation is slower than the time it represents.`,asOf:'2026-09-30',src:'https://gafferongames.com/post/fix_your_timestep/'},
    {claim:`Unity’s Time project settings define Fixed Timestep as the frame-rate independent interval for physics calculations and FixedUpdate events, and Maximum Allowed Timestep as a cap on the worst case when the frame rate is low.`,asOf:'2026-09-30',src:'https://docs.unity3d.com/6000.0/Documentation/Manual/class-TimeManager.html'},
    {claim:`Godot’s Engine class exposes physics_ticks_per_second and max_physics_steps_per_frame, which set the physics step rate and the catch-up cap.`,asOf:'2026-09-30',src:'https://docs.godotengine.org/en/stable/classes/class_engine.html'}],
  rel:[['server-determinism','A fixed step is the base of every deterministic simulation.'],['craft-physics-and-collision','Physics is the main reason for the fixed step and the main victim of a variable one.'],['craft-performance','A rising step count per frame is a performance signal, and the cap is how the loop survives a bad frame.'],['game-feel-and-juice','Interpolation delay and input latching are feel decisions.']] });
ENGINE('craft-game-loop-timestep',{
  godot:{ term:`_physics_process(delta) runs at Engine.physics_ticks_per_second (set in Project Settings under Physics > Common) with a constant delta. _process(delta) runs once per rendered frame. Physics interpolation is a project setting for smoothing rendering between physics ticks. To run your own simulation rate, use an accumulator in _process.`,
    api:['Node._physics_process(delta)','Node._process(delta)','Engine.physics_ticks_per_second','Engine.max_physics_steps_per_frame','Engine.get_physics_interpolation_fraction()','lerpf()'],
    snippet:`extends Node
const STEP := 1.0 / 30.0
const MAX_STEPS := 5
var acc := 0.0
var prev_x := 0.0
var cur_x := 0.0
@onready var sprite: Sprite2D = $Sprite2D      # child node named Sprite2D

func _process(delta: float) -> void:
    acc += minf(delta, 0.25)                    # clamp a huge hitch
    var n := 0
    while acc >= STEP and n < MAX_STEPS:
        prev_x = cur_x
        cur_x += 60.0 * STEP                    # simulation: constant step
        acc -= STEP
        n += 1
    if acc >= STEP:
        acc = 0.0                               # hit the cap: drop the backlog
    sprite.position.x = lerpf(prev_x, cur_x, acc / STEP)`,
    pitfall:`Moving physics bodies from _process. A CharacterBody2D or RigidBody moved in the frame callback runs at a variable rate against a fixed physics tick, so it jitters and can tunnel. Do the movement in _physics_process, and read input in _process or _input if a press must not be missed.`,
    map:`Godot _physics_process is Unity FixedUpdate, and Godot _process is Unity Update. Godot’s physics interpolation setting is the counterpart of Unity’s Rigidbody.interpolation.` },
  unity:{ term:`FixedUpdate runs zero or more times per frame at Time.fixedDeltaTime (Project Settings > Time > Fixed Timestep) before the physics step. Update runs once per frame. Maximum Allowed Timestep caps the catch-up. Rigidbody.interpolation smooths the rendered position between fixed steps.`,
    api:['MonoBehaviour.FixedUpdate()','Time.fixedDeltaTime','Time.deltaTime','Time.maximumDeltaTime','Rigidbody.interpolation','Time.unscaledDeltaTime'],
    snippet:`using UnityEngine;
public class FixedLoop : MonoBehaviour {
    const float Step = 1f / 30f;
    const int MaxSteps = 5;
    float acc, prevX, curX;

    void Update() {
        acc += Mathf.Min(Time.unscaledDeltaTime, 0.25f);   // clamp a huge hitch
        int n = 0;
        while (acc >= Step && n < MaxSteps) {
            prevX = curX;
            curX += 60f * Step;                             // simulation: constant step
            acc -= Step; n++;
        }
        if (acc >= Step) acc = 0f;                          // hit the cap: drop the backlog
        var p = transform.position;
        p.x = Mathf.Lerp(prevX, curX, acc / Step);          // blend for display
        transform.position = p;
    }
}`,
    pitfall:`Reading Input.GetButtonDown (or an action WasPressedThisFrame) inside FixedUpdate. FixedUpdate may run zero times in a frame, so the press is lost, or twice, so it is seen twice. Read input in Update, store it, and let FixedUpdate consume it.`,
    map:`Unity FixedUpdate is Godot _physics_process. Time.maximumDeltaTime caps how much time one frame may hand to FixedUpdate, which stops the spiral of death. Godot caps the number of physics steps instead, with Engine.max_physics_steps_per_frame (default 8).` },
  note:`Use the engine’s own fixed step and interpolation for physics first. Write your own accumulator loop only for a simulation the engine does not run for you, such as a deterministic lockstep or rollback simulation. The pattern is the same as in the snippets: constant step, capped catch-up, blend for display.` });
INTERVIEW('craft-game-loop-timestep',{
  junior:[
    { q:`What is the difference between Update and FixedUpdate in Unity, or _process and _physics_process in Godot?`,
      a:`The first runs once per rendered frame with a varying delta. The second runs at a constant rate, zero or more times per frame, with a constant delta, before the physics step. Physics and simulation belong in the second. Input reading and visual effects belong in the first.`,
      follow:`Why can FixedUpdate run twice in one frame?`,
      red:`Thinks they are the same but at different speeds.` },
    { q:`Why does a game with variable delta time behave differently on a fast machine?`,
      a:`Integration steps of different sizes give different results: jump heights, collision and spring behaviour change with the step, and a big step can carry a body through a wall. A constant step gives the same result each time.`,
      follow:`Give an example of a value that changes.`,
      red:`Says it only affects speed.` }
  ],
  mid:[
    { q:`Explain the fixed timestep with an accumulator and why the render interpolates.`,
      a:`Real elapsed time goes into an accumulator. While it holds a step, the simulation runs one constant step and takes it out. What remains, divided by the step, is the fraction alpha through the next step. The renderer blends previous and current state by alpha. Without it, motion shows repeated positions when the display rate does not divide the step rate.`,
      follow:`What does interpolation cost?`,
      red:`Cannot explain what alpha is.` },
    { q:`What is the spiral of death, and how do you prevent it?`,
      a:`If a step takes longer than the time it represents, the accumulator grows, more steps run next frame, and the game falls further behind. Cap the steps per frame and drop the leftover time, and fix the underlying cost. The game slows down and recovers, rather than freezing.`,
      follow:`What changes for the player when the cap is hit?`,
      red:`Suggests removing the cap so no time is lost.` },
    { q:`A button press sometimes does nothing. Input is read in FixedUpdate. What is wrong?`,
      a:`FixedUpdate does not run every frame. Frame-based input flags are true for a single frame, so if no fixed step runs in that frame the press is missed. Sample input in Update and latch it until a step consumes it.`,
      follow:`How do you avoid one press counting twice?`,
      red:`Increases the tick rate to hide it.` }
  ],
  senior:[
    { q:`You need the same simulation to run in the client, on a server and in a replay. How do you structure the loop?`,
      a:`Make the simulation a function of state, input and a fixed step, in a module with no reference to the engine clock or rendering. Each host drives it with its own loop: the client with an accumulator and interpolation, the server at its tick rate, the replay as fast as it can. Test with a recorded input and a state hash.`,
      follow:`What breaks it first in practice?`,
      red:`Lets each host read time directly from the engine.` }
  ] });

T('craft-entities-and-scenes',{ d:'craft', t:'Entities, scenes and ECS', tag:'Build things from nodes and components you can see and edit, and reach for entity component systems only where thousands of the same thing need speed.',
  what:`Two ways to structure the things in a game. In scene or object composition (Godot nodes and scenes, Unity GameObjects and prefabs), each thing in the world is an object that owns its behaviour, built from smaller reusable pieces and nested in a tree. In an entity component system (ECS, such as Unity DOTS), an entity is only an id, components are plain data attached to it, and systems are functions that run over every entity with a given set of components. Composition favours clarity and editing. ECS favours processing many similar things fast, because their data sits together in memory. Both are lenses: real games mix them.`,
  why:[`A deep inheritance tree (Enemy, FlyingEnemy, FlyingShootingEnemy) breaks the first time a design asks for a flying enemy that also heals. Composition and components avoid it.`,`Without a scene structure, everything ends up in one manager that knows every other object. It cannot be tested or reused.`,`Using ECS for a game with forty complex actors buys build complexity and gives back no speed. Not using it for forty thousand bullets gives a frame you cannot fix.`,`The choice sets how designers work. Scenes and prefabs can be edited by hand in the editor. ECS data often has to be baked from authoring objects.`],
  think:{ q:[`How many of these things exist at peak, and how many are the same kind?`,`Is a designer expected to edit and place each one by hand?`,`Which behaviours do many kinds share (health, movement, targeting)? Can they be components or child nodes?`,`Which code needs to touch every instance every frame, and is that a measured cost?`,`Who talks to whom? A parent that owns children can call down; children should signal up.`],
    trade:[`Scene composition is easy to read and edit, and each object costs a virtual call, a cache miss, and sometimes garbage. It scales to hundreds or low thousands of active objects.`,`ECS is fast on large counts and needs a different style: data first, no per-object methods, more boilerplate, and tooling that is still changing between versions.`,`Component-style nodes reuse behaviour without inheritance, and too many tiny nodes make a scene harder to navigate.`],
    traps:[`Reaching up and across the tree with long paths like get_node("../../UI/Bar"). Moving a node then breaks the code. Use signals up, exports or injected references across.`,`Making a "GameManager" singleton that every object calls. It is global state with a friendly name.`,`Adopting ECS for the whole game because one system, particles or crowds, needed it. Use it for that system.`,`Storing behaviour in components. In ECS a component is data. If it has logic, it belongs in a system.`,`Assuming an entity can be modified while a system iterates it. Structural changes (add or remove components, destroy) need a command buffer or a deferred step.`],
    good:[`A new enemy type is a scene or prefab that combines existing pieces, with little new code.`,`Systems that touch thousands of things work on packed data and show in the profiler as one cheap loop.`,`A child node signals events up and does not know who listens.`],
    bad:[`Adding a feature means editing a base class that twenty types inherit from.`,`A per-frame Update on ten thousand objects that each do almost nothing.`] },
  how:[`Start with composition. Build each thing as a scene or prefab: a root with child pieces (health, hurtbox, movement, visuals). Prefer a small component for each behaviour over a subclass.`,`Connect by signals or events upward, and by exported references sideways. Keep tree paths to direct children.`,`Put shared data that designers tune in resources: Godot Resource files, Unity ScriptableObjects. The scene holds an instance, the resource holds the numbers.`,`Measure. If the profiler shows one system spending its time in per-object update on a large count of similar things, first try packed arrays and one loop (see craft-performance).`,`If that is still too slow, move that system to ECS: split the data into components (position, velocity), write a system that queries them, and keep the rest of the game in scenes.`,`In Unity DOTS, author with GameObjects in a subscene and bake them to entities. Do structural changes through an EntityCommandBuffer.`,`Write down which systems are ECS and why, so the split does not spread by habit.`],
  ai:{ yes:[`Split a large class into components or child scenes and list what each owns.`,`Find long node paths and cross-tree calls and replace them with signals or exported references.`,`Convert a per-object Update loop into an ECS component and system, and list the boilerplate you now need.`,`Explain the component, system and command buffer rules of a specific DOTS version.`],
       no:[`Decide that your game needs ECS. It cannot see your entity counts or your profile.`,`Keep DOTS code current. The API has changed between Entities versions, so check it against the docs for your version.`,`Decide the scene tree layout of a team project. That depends on who edits which scene.`] },
  prompts:[{l:'Decompose an entity',p:`Here is our [ENTITY] class: [PASTE]. Propose a scene or prefab structure that replaces it: the root, the child pieces, what each piece owns, which signals go up, and what tunable data moves into a resource. Do not use inheritance. Point out any piece that other entity types could reuse.`},
    {l:'Does this need ECS?',p:`Our game has up to [N] instances of [THING] alive at once, each updated every frame by [DESCRIBE UPDATE] on [PLATFORM]. The profiler shows [PASTE]. Say what the profile suggests, whether packed arrays in a single loop would be enough before ECS, and what the ECS version would cost us in authoring workflow.`}],
  verify:[`Can each entity type be built from existing pieces without editing a base class?`,`Are cross-tree paths limited to direct children?`,`Is there a profile that shows the system where ECS is used is the one that needed it?`],
  test:[`Instance each scene or prefab alone, outside its level, and check it works. Anything that fails is coupled to its surroundings.`,`Spawn ten times the peak count of a candidate ECS entity in a test scene, and compare frame time against the object version on target hardware.`,`Move a node to a different parent. Nothing but its transform should break.`],
  facts:[{claim:`Godot’s scene organisation best practices advise designing scenes with no hard dependencies, warn that hard-coded node paths stop finding their targets when a scene is reused, and say a signal connection should respond to behaviour, not start it.`,asOf:'2026-09-30',src:'https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html'},
    {claim:`Unity’s Entities documentation defines an entity as a unique identifier, a component as data about the entity, and a system as the logic that processes entity data, and lists structural changes as something that affects performance.`,asOf:'2026-09-30',src:'https://docs.unity3d.com/Packages/com.unity.entities@1.3/manual/concepts-intro.html'},
    {claim:`Robert Nystrom’s Game Programming Patterns chapter "Component" splits a large object into separate input, physics and graphics components to reduce coupling and avoid inheritance, and points to its Data Locality chapter for the cache reasons behind packed data.`,asOf:'2026-09-30',src:'https://gameprogrammingpatterns.com/component.html'}],
  rel:[['craft-design-patterns','Component, observer and pool are the patterns that scene composition uses every day.'],['craft-performance','ECS is the last step of a performance ladder that starts with profiling and packed arrays.'],['craft-memory-and-gc','Per-object allocations and garbage are a cost of many small objects that ECS avoids.'],['server-state-sync','Entities with ids and plain data are also what a server replicates.']] });
ENGINE('craft-entities-and-scenes',{
  godot:{ term:`A scene is a saved tree of nodes that you instance as one node. Behaviour is added by child nodes (a Health node), by scripts on a node, or by Resources. Godot has no built-in ECS. For bulk data it offers packed arrays and the servers (RenderingServer, PhysicsServer) that work on ids.`,
    api:['PackedScene.instantiate()','Node.get_node() / %UniqueName','signal / Signal.connect()','Resource / @export var res: Resource','class_name','Node.add_child()'],
    snippet:`class_name Health
extends Node
signal died
@export var max_hp := 100
var hp := 0

func _ready() -> void:
    hp = max_hp

func hurt(amount: int) -> void:
    hp = maxi(hp - amount, 0)
    if hp == 0:
        died.emit()            # signal up; the parent decides what death means

# On the enemy scene root (script enemy.gd):
#   @onready var health: Health = $Health
#   func _ready(): health.died.connect(queue_free)`,
    pitfall:`Connecting to a node with a hard-coded path such as get_node("../../Player") from a reusable scene. It works in the level you wrote it in and fails when the scene is instanced elsewhere. Pass the reference in with an @export var or set it from the parent that spawns the scene.`,
    map:`A Godot child node with a script plays the part of a Unity component on a GameObject, and a scene is roughly a prefab.` },
  unity:{ term:`A GameObject holds MonoBehaviour components, saved and reused as prefabs. ScriptableObjects hold shared data. Entities (DOTS) is a separate ECS: components are IComponentData structs, systems are ISystem structs with OnUpdate, and authoring GameObjects are baked to entities. It is a package you add and its API depends on the version.`,
    api:['GameObject / MonoBehaviour / prefab','ScriptableObject','Unity.Entities.IComponentData','Unity.Entities.ISystem / SystemAPI.Query','Unity.Transforms.LocalTransform','EntityCommandBuffer'],
    snippet:`// Requires the Entities package (1.x). Component = data only.
using Unity.Burst;
using Unity.Entities;
using Unity.Transforms;

public struct Spin : IComponentData { public float Speed; }

[BurstCompile]
public partial struct SpinSystem : ISystem {
    [BurstCompile]
    public void OnUpdate(ref SystemState state) {
        float dt = SystemAPI.Time.DeltaTime;
        foreach (var (xf, spin) in
                 SystemAPI.Query<RefRW<LocalTransform>, RefRO<Spin>>()) {
            xf.ValueRW = xf.ValueRO.RotateY(spin.ValueRO.Speed * dt);
        }
    }
}`,
    pitfall:`Destroying or adding components inside the loop that iterates them. Structural changes move entities between memory chunks and invalidate the iteration, so with safety checks on (in the Editor) the API throws. Record the change in an EntityCommandBuffer and let it play back after the loop. Also, an entity with a Spin component does nothing until a baker creates it from an authoring object in a subscene.`,
    map:`A Unity MonoBehaviour bundles data and behaviour, where the Godot node does too. DOTS splits them: the struct holds data, the system holds the logic. Godot has no equivalent, so reach for packed arrays instead.` },
  note:`Composition is the default in both engines. ECS is a targeted tool for large counts of similar things. The Health example shows the composition style, and the Spin system shows what ECS asks: data in a struct, logic in a system, and a bake step for authoring.` });
INTERVIEW('craft-entities-and-scenes',{
  junior:[
    { q:`What does "prefer composition over inheritance" mean in a game?`,
      a:`Build an enemy from parts (health, movement, attack) rather than a chain of subclasses. A new type combines existing parts. Inheritance breaks when a design needs a mix that the tree did not plan for, such as a flying enemy that also heals.`,
      follow:`How is a Godot scene or a Unity prefab composition?`,
      red:`Describes only inheritance and cannot give a case where it breaks.` },
    { q:`What is an entity component system in one paragraph?`,
      a:`Entities are ids. Components are plain data attached to them. Systems are functions that run over all entities with a given set of components. Because the data of one kind sits together in memory, the systems run fast over large counts.`,
      follow:`Where does the logic live?`,
      red:`Says ECS is just components on a GameObject.` }
  ],
  mid:[
    { q:`Signals go up and calls go down. Why?`,
      a:`A parent knows its children, so it can call them. A child should not know its parent, so it emits an event and whoever listens decides. The child then works in any scene. Long node paths and calls across the tree tie scenes to one layout.`,
      follow:`How do two siblings talk?`,
      red:`Uses global singletons for everything.` },
    { q:`When does ECS pay off, and when does it not?`,
      a:`It pays when a measured cost is per-entity update over thousands of similar things: bullets, crowds, particles, simulation. It does not for tens of unique actors with rich behaviour, nor for a team without time for the workflow. Try packed arrays first.`,
      follow:`What would you measure to decide?`,
      red:`Chooses ECS because it is newer or faster in general.` },
    { q:`Your ECS system needs to destroy entities as it iterates. What do you do?`,
      a:`Record the destroy in an EntityCommandBuffer and play it back after the iteration. Structural changes during iteration would move data the loop is reading.`,
      follow:`What if the command depends on a result from another entity?`,
      red:`Deletes inside the query and hopes.` }
  ],
  senior:[
    { q:`Half your game is scenes and one system is ECS. How do you keep the boundary clean?`,
      a:`Define the interface: authoring objects bake to entities at one point, ECS results come back through a small set of events or a read-only snapshot, and the rest of the game never touches component data directly. Document which systems are ECS and the measurement that justified each one, so the split does not creep.`,
      follow:`What would make you move it back?`,
      red:`Lets scene code and systems both write the same data.` }
  ] });

T('craft-physics-and-collision',{ d:'craft', t:'Physics and collision', tag:'Decide which bodies the engine moves and which you move yourself, sweep fast things, use layers, and never assume two runs will match.',
  what:`The physics engine moves bodies, detects when their shapes touch and resolves the overlap. What you decide is how each object relates to it. A dynamic body is moved by forces and collisions. A kinematic or character body is moved by your code, and the engine only reports what it hits. A trigger reports overlaps without pushing. Collision layers and masks say which groups see which. Continuous collision detection (CCD) sweeps a fast body through its path so it cannot tunnel, which means skip through a thin wall between two steps. Player characters use character controllers, code-driven movers with slopes, steps and grounded checks, because a pure physics body feels wrong to control.`,
  why:[`A bullet at 300 m/s moves five metres in one 60 Hz step. Discrete collision can put it on one side of a thin wall in one step and the other in the next, and nothing registers.`,`Making the player a dynamic physics body gives a character that slides on slopes, bounces and is pushed by boxes. It feels bad, and it is hard to tune.`,`Without layers every object tests against every other. Cost grows and a bullet hits its own shooter.`,`Physics engines are usually not deterministic across platforms, builds or engine versions. Anything that must replay or sync, like a lockstep sim or a rollback game, cannot rely on them.`],
  think:{ q:[`Does this object need to be pushed by the world, or does it push the world? That decides dynamic or kinematic.`,`How fast is the fastest thing, and how thin the thinnest collider? Speed times step against thickness tells you if tunnelling is possible.`,`Which groups should see which? Write the layer matrix before making layers.`,`Is a physics result part of gameplay that must match on other machines?`,`Does an overlap need to push (collider) or only to tell (trigger, area)?`],
    trade:[`Character controllers give tight control and you write the response: gravity, slopes, moving platforms, pushing. A dynamic body gives that behaviour for free and less control.`,`Continuous detection stops tunnelling and costs CPU. Use it for the few fast bodies, not for everything.`,`Physics queries (raycast, shape cast) are exact and cost more than a distance check.`,`Engine physics is quick to start with and uncontrollable at the bit level. A custom simulation is deterministic and you write every part.`],
    traps:[`Moving a physics body by setting its position or transform. It teleports through colliders and confuses the solver. Move kinematic bodies with the character or move APIs, and dynamic ones with forces or velocity.`,`Running physics code in the variable frame callback. Use the fixed step.`,`Making a thin wall one unit thick and firing a fast projectile at it without CCD or a raycast.`,`Scaling a rigid body’s collider non-uniformly or giving bodies extreme size or mass ratios. Solvers become unstable at extreme mass ratios and scales.`,`Trusting a "grounded" flag for a jump. It flickers on edges and slopes, so add a short coyote time and a jump buffer.`],
    good:[`Every fast body is either continuous or moved by a raycast or shape sweep, and a test proves it cannot pass a thin wall.`,`A written layer matrix, and code that names layers, not numbers.`,`Characters feel the same at every frame rate, because they move in the fixed step.`],
    bad:[`Bullets that sometimes pass through enemies.`,`A player that slides down gentle slopes, or sticks on seams between floor tiles.`] },
  how:[`Classify each object: static (never moves), kinematic or character (your code moves it), dynamic (physics moves it), trigger (reports only).`,`Write the layer matrix as a table: rows are layers, columns are the layers each sees. Give layers names in code.`,`Build the player as a character controller. Move it in the fixed step, apply gravity yourself, and handle slopes and moving platforms explicitly.`,`Add feel: a short coyote time (a jump still works for about 0.1 s after leaving a ledge) and a jump buffer (an early press is remembered for a few frames). Tune both by play.`,`For fast projectiles, either turn on continuous detection for that body, or skip bodies and sweep a ray or shape between last and current position each step.`,`Use queries for gameplay questions: raycast for line of sight, overlap for area damage, shape cast for a character’s next step. Pass a layer mask.`,`If physics results must match across machines, do not use the engine. Use integer or fixed-point movement and your own collision, or run physics on the server only and send results.`],
  ai:{ yes:[`Generate a layer matrix from a list of object kinds and mark the pairs that should not collide.`,`Review a controller for logic in the wrong callback, position writes on physics bodies and missing masks.`,`Compute, for a given speed, step and collider thickness, whether tunnelling is possible.`,`Write a test that fires a fast projectile at a thin wall and asserts a hit.`],
       no:[`Tune the character controller’s feel: acceleration, jump arc, coyote time. Those are set by playing.`,`Tell you the engine physics is deterministic. Measure it on your platforms.`,`Choose which objects are dynamic. That is a design decision about how the world responds.`] },
  prompts:[{l:'Layer matrix',p:`Our game has these object kinds: [LIST]. Produce a table of collision layers and which layers each one should collide with or query, and mark the pairs that must never collide (for example a projectile and its owner). Say which are triggers and which are solid, and which need continuous detection or a sweep.`},
    {l:'Tunnelling check',p:`Fastest projectile [SPEED] m/s, physics step [STEP] s, thinnest wall [THICKNESS] m, collider shape [SHAPE], engine [ENGINE]. Work out the distance moved per step and say whether tunnelling is possible. Give the fix for this engine, and a test that fires at the wall from three angles.`}],
  verify:[`Can a fast body pass a thin wall in the test scene?`,`Are layers named in code, with a written matrix?`,`Does the character move in the fixed step and keep the same feel at 30 and 144 frames per second?`],
  test:[`Fire the fastest projectile at the thinnest wall 1,000 times from random angles and assert every shot registers.`,`Walk the player along a slope, a seam between two tiles and a moving platform, and record the grounded flag and vertical velocity for jitter.`,`Run the same recorded inputs twice, and on two platforms, and compare positions after 60 seconds. If they differ, the physics is not something to synchronise.`],
  facts:[{claim:`Unity’s Rigidbody.collisionDetectionMode has Discrete (default), Continuous, ContinuousDynamic and ContinuousSpeculative modes. The docs advise continuous detection to stop fast bodies passing through others, note the performance cost, and say continuous works only with sphere, capsule and box colliders.`,asOf:'2026-09-30',src:'https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Rigidbody-collisionDetectionMode.html'},
    {claim:`Godot’s CharacterBody2D is for bodies controlled through code. move_and_slide() slides along surfaces, and movement should be done in _physics_process, not by setting position directly.`,asOf:'2026-09-30',src:'https://docs.godotengine.org/en/stable/tutorials/physics/using_character_body_2d.html'},
    {claim:`Maddy Thorson’s article on Celeste and TowerFall physics explains how movement and collision between Actors and Solids are handled in both games, as a reference for code-driven character movement.`,asOf:'2026-09-30',src:'https://www.maddymakesgames.com/articles/celeste_and_towerfall_physics/index.html'}],
  rel:[['craft-game-loop-timestep','Physics runs in the fixed step, and character control must too.'],['craft-gameplay-math','Sweeps, overlaps and slope tests are vector maths, and raycasts are the spatial query.'],['server-determinism','Engine physics is usually not bit-exact across platforms, so synchronised games avoid relying on it.'],['game-feel-and-juice','Coyote time, jump buffering and controller tuning are the feel of movement.']] });
ENGINE('craft-physics-and-collision',{
  godot:{ term:`CharacterBody2D and 3D are moved by setting velocity and calling move_and_slide() in _physics_process. RigidBody is simulated. Area2D and Area3D report overlaps. Collision layer says what this object is; mask says what it scans for. Shape casts and raycasts go through PhysicsDirectSpaceState.`,
    api:['CharacterBody2D.move_and_slide()','CharacterBody2D.is_on_floor()','CollisionObject2D.collision_layer / collision_mask','Area2D.body_entered','PhysicsRayQueryParameters2D.create()','RigidBody2D.continuous_cd'],
    snippet:`extends CharacterBody2D
const SPEED := 220.0
const JUMP := -420.0
const COYOTE := 0.1
var coyote := 0.0

func _physics_process(delta: float) -> void:
    if is_on_floor():
        coyote = COYOTE
    else:
        coyote -= delta
        velocity += get_gravity() * delta
    # ui_accept is a built-in input action (Space or Enter)
    if Input.is_action_just_pressed("ui_accept") and coyote > 0.0:
        velocity.y = JUMP
        coyote = 0.0
    velocity.x = Input.get_axis("ui_left", "ui_right") * SPEED
    move_and_slide()`,
    pitfall:`Checking is_on_floor() before move_and_slide() has run this frame. The floor state is updated by move_and_slide(), so the value you read is from the previous call. That is fine for a jump, and wrong for anything that needs this frame’s result. Also, get_gravity() needs Godot 4.3 or later.`,
    map:`Godot move_and_slide() is close to Unity CharacterController.Move plus your own slide, and collision layers and masks are Unity’s layers and the Layer Collision Matrix.` },
  unity:{ term:`CharacterController.Move moves a code-driven capsule and reports collisions. Rigidbody is simulated, with Kinematic mode for code-driven bodies. Layers plus the Layer Collision Matrix decide what collides, and LayerMask arguments filter queries. Rigidbody.collisionDetectionMode selects discrete or continuous.`,
    api:['CharacterController.Move() / isGrounded','Rigidbody.collisionDetectionMode','Physics.Raycast() / SphereCast()','LayerMask / Physics.IgnoreLayerCollision','Rigidbody.isKinematic','Physics.simulationMode'],
    snippet:`using UnityEngine;
using UnityEngine.InputSystem;   // needs the Input System package (com.unity.inputsystem)

[RequireComponent(typeof(CharacterController))]
public class Mover : MonoBehaviour {
    [SerializeField] InputActionReference move;   // a Vector2 action, e.g. WASD
    CharacterController cc;
    float vy;

    void OnEnable() => move.action.Enable();
    void Awake() => cc = GetComponent<CharacterController>();

    void Update() {
        if (cc.isGrounded && vy < 0f) vy = -2f;          // keep the capsule on the ground
        vy += Physics.gravity.y * Time.deltaTime;
        Vector2 m = move.action.ReadValue<Vector2>();
        Vector3 v = new Vector3(m.x * 5f, vy, m.y * 5f);
        cc.Move(v * Time.deltaTime);
    }
}`,
    pitfall:`Moving a CharacterController in Update with Time.deltaTime works, and it is a variable step. For a game whose feel or replay must not depend on frame rate, move it in FixedUpdate with Time.fixedDeltaTime. Also, CharacterController does not push Rigidbodies by itself: apply a force in OnControllerColliderHit if you want that.`,
    map:`Unity’s CharacterController is Godot’s CharacterBody3D. The Layer Collision Matrix is one shared grid, where Godot sets layer and mask per object.` },
  note:`The snippets show the control style, code moves the body, gravity is added by hand and the grounded flag is used with care. For tunnelling, choose CCD or a sweep; for anything that must replay across machines, do not rely on engine physics at all.` });
INTERVIEW('craft-physics-and-collision',{
  junior:[
    { q:`What is the difference between a collider and a trigger?`,
      a:`A collider is solid: the physics engine pushes things apart. A trigger (Area in Godot, isTrigger in Unity) only reports that something overlapped. Use triggers for pickups, zones and detection.`,
      follow:`Which one would you use for a damage zone?`,
      red:`Thinks a trigger is just an invisible wall.` },
    { q:`Why do collision layers exist?`,
      a:`To decide which groups see which. It saves cost, since fewer pairs are tested, and stops wrong hits such as a bullet hitting its owner. Write a matrix and name layers in code.`,
      follow:`What is the difference between a layer and a mask in Godot?`,
      red:`Sets everything to the default layer.` }
  ],
  mid:[
    { q:`Fast bullets sometimes pass through a wall. Why, and what are the fixes?`,
      a:`Tunnelling: in one step the bullet moves further than the wall is thick, so no overlap is ever detected. Fix with continuous collision detection for that body, or a raycast or shape sweep from last to current position each step. Thicker walls and a smaller step are patches.`,
      follow:`Which fix costs less for 200 bullets?`,
      red:`Suggests making the wall thicker only.` },
    { q:`Why not make the player a dynamic rigidbody?`,
      a:`Physics pushes it, bounces it and slides it on slopes, so it is hard to make responsive and consistent. A character controller lets code decide movement: acceleration, air control, jump arc, slopes. Physics only reports contacts.`,
      follow:`What would you add for platformer feel?`,
      red:`Applies forces and adds drag to fix it.` },
    { q:`What is coyote time and why add it?`,
      a:`A short window, about a tenth of a second, in which a jump still works after leaving a ledge. Players press slightly late and read the miss as unfair. Together with a jump buffer it makes controls forgiving. Tune by play.`,
      follow:`How do you test it?`,
      red:`Cannot explain why it exists.` }
  ],
  senior:[
    { q:`Your game needs to sync physical interactions between players. What do you do?`,
      a:`Decide the authority first. Engine physics is generally not deterministic across platforms or builds, so lockstep or rollback on top of it is fragile. Options: server-authoritative physics with snapshots and prediction, or a custom fixed-point simulation with your own collision that you can replay. Prove with a replay test on every target.`,
      follow:`What would you give up in each option?`,
      red:`Assumes the same engine on both sides gives the same result.` }
  ] });

T('craft-save-systems',{ d:'craft', t:'Save systems', tag:'Write to a temporary file, check it, swap it in, and keep the last good one. Number the format so old saves still load.',
  what:`Everything that lets a game remember: serialising the state you need into bytes (JSON, a binary format), writing it to disk or the cloud, and loading it back into a running game, possibly months and several patches later. It has four separate problems. What to save (state, not the objects that hold it). How to write it without corrupting it if the power fails. How to change the format across versions. And how to sync it between devices without losing progress.`,
  why:[`Losing a save is one of the few bugs a player never forgives. A crash or power cut in the middle of writing a file leaves half a file behind, and the old save is gone.`,`A patch adds a field, renames one or changes a meaning, and every existing save either fails to load or loads wrong. Without a version number nothing can tell which.`,`Saving live objects instead of plain data ties saves to your class layout, so refactoring becomes a save-breaking change.`,`Cloud sync with two devices and no rule for conflicts silently throws away hours of play.`],
  think:{ q:[`What is the smallest set of state that recreates the game? Everything else is derived and should be rebuilt.`,`Which parts are a save the player controls, and which are settings or cache with different rules?`,`What happens if the write is interrupted at any byte?`,`What does version 1 look like in ten patches? How do old saves become new ones?`,`If two devices diverge, which wins, or does the player choose? What is the cloud provider’s quota?`],
    trade:[`JSON or text is easy to read, debug and migrate, and easy for a player to edit, so it is also easy to cheat with. Binary is smaller and faster and harder to inspect. Neither is security: anything the player can read, they can change.`,`Saving often protects progress and adds hitches. Save on events (checkpoint, exit) and in a background step, not on every action.`,`Multiple save slots and backups protect against corruption and cost space and complexity.`],
    traps:[`Writing directly over the only save file. An interruption destroys it.`,`Saving object graphs by reflection or engine serialisation of live classes. Renaming a field then breaks every save.`,`Having no version number, so a migration has to guess.`,`Ignoring failure: a full disk, a permission error or a cloud timeout all fail quietly and the player thinks progress was saved.`,`Trusting a loaded file. A truncated or edited file can crash the game or set impossible values, so validate on load.`,`Saving in the middle of an action, such as during a scene change, so the state is half-applied.`,`Storing saves in a folder that a reinstall or a store-update removes, or that a platform does not allow, instead of the platform’s save location.`],
    good:[`Killing the game during a save at random points never loses more than the last save.`,`A save from the first public version still loads in the latest one.`,`A corrupt file falls back to the last good backup and tells the player.`],
    bad:[`One save file, written in place, with no version.`,`A "save is corrupted" report that means the player has to start again.`] },
  how:[`Define a plain save data type separate from your live objects: ids, numbers, strings, lists. Write functions that build it from the game and apply it back.`,`Put a version number and a save time in the file. Add a checksum of the contents so corruption can be detected.`,`Write safely: serialise to a temporary file next to the real one, read it back and check it, then replace the old file (or rename the old to a backup first). Keep at least one previous good save.`,`Load defensively: check the checksum and the version, migrate step by step (v1 to v2, v2 to v3), validate ranges, and on failure try the backup before giving up.`,`Write a migration function per version, and keep a fixture save from each released version in the tests.`,`Save at safe points and away from the frame: build the data on the main thread, write it on another, and show a save indicator.`,`For cloud saves, store the save time and a device id. On conflict, keep both and let the player choose, or merge by rule (for example the furthest progress). Use the platform’s service (Steam Cloud, iCloud, Google Play Games) rather than your own server unless you need accounts.`,`Follow platform rules: the path, size limits and required behaviour such as save-on-suspend on consoles and phones.`],
  ai:{ yes:[`Write the migration functions between versions from two descriptions of the format, with tests on fixture saves.`,`Review a save path for non-atomic writes, missing error handling and unvalidated loads.`,`Generate a fuzzing test that truncates, flips bytes in and empties a save file and checks the game recovers.`,`List which fields in a class are state and which are derived.`],
       no:[`Guarantee saves survive. Only killing the process at random points during a save proves it.`,`Decide the conflict rule for cloud saves. That is a player-trust decision.`,`Decide how much cheating you tolerate. Client-side saves can always be changed.`] },
  prompts:[{l:'Audit the save path',p:`Here is our save and load code: [PASTE]. List every way an interruption at any point could lose or corrupt the player’s save, every place a failure is ignored, every field with no version or validation on load, and where live objects are serialised directly. Then propose the smallest changes for atomic writes, a backup and a version field.`},
    {l:'Write a migration',p:`Save format v[N] is: [SCHEMA]. Version v[N+1] changes: [CHANGES]. Write the migration function and three test fixtures: a normal v[N] save, one with a missing optional field, and a corrupt one. Say what the loader does with the corrupt file.`}],
  verify:[`Is the write to a temporary file, checked, then swapped in, with a previous good copy kept?`,`Does the file carry a version, and is there a fixture save from each released version?`,`Does load handle a failed read, a bad checksum and impossible values?`],
  test:[`Kill the process at random moments during saves, 1,000 times, and assert a valid save exists each time.`,`Load a fixture save from every released version and compare to the expected state.`,`Truncate, empty and byte-flip a save file. The game must offer the backup and not crash.`],
  facts:[{claim:`Godot maps user:// to a per-user folder that differs per platform (for example %APPDATA%\\Godot\\app_userdata\\[project_name] on Windows), and on mobile the folder is not accessible to other applications.`,asOf:'2026-09-30',src:'https://docs.godotengine.org/en/stable/tutorials/io/data_paths.html'},
    {claim:`Godot’s DirAccess.rename overwrites an existing destination if it is not access-protected, and the docs make no atomicity promise.`,asOf:'2026-09-30',src:'https://docs.godotengine.org/en/stable/classes/class_diraccess.html'},
    {claim:`POSIX rename(): if the destination exists it is removed and the source renamed, and the destination name stays visible throughout, referring to either the old or the new file.`,asOf:'2026-09-30',src:'https://pubs.opengroup.org/onlinepubs/9799919799/functions/rename.html'},
    {claim:`Windows MoveFileEx replaces the contents of an existing destination only when MOVEFILE_REPLACE_EXISTING is set, and the page states no atomicity guarantee.`,asOf:'2026-09-30',src:'https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-movefileexw'},
    {claim:`Unity’s Application.persistentDataPath returns a directory path for data files that persists between runs and updates, and differs per platform.`,asOf:'2026-09-30',src:'https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Application-persistentDataPath.html'},
    {claim:`.NET’s File.Replace replaces the contents of a destination file with a source file and creates a backup of the replaced file (pass null to skip it). The destination must exist, or FileNotFoundException is thrown, and source and destination on different volumes raise an exception.`,asOf:'2026-09-30',src:'https://learn.microsoft.com/en-us/dotnet/api/system.io.file.replace'}],
  rel:[['backend-migrations-config','A save format migrates across versions the way a database schema does.'],['craft-over-defensive-code','Load is the one place a file from outside needs real validation; the rest of the code should not repeat the checks.'],['live-operations','Cloud saves and migrations are what let a live game patch without wiping players.'],['craft-design-patterns','The memento idea, capturing state as plain data, is the pattern under a save system.']] });
ENGINE('craft-save-systems',{
  godot:{ term:`user:// is the writable per-user folder. FileAccess opens files for read or write, JSON turns Dictionaries to text and back, and DirAccess renames and removes. String.sha256_text() gives a checksum.`,
    api:['FileAccess.open(path, mode)','FileAccess.get_open_error()','JSON.stringify() / JSON.parse_string()','DirAccess.rename_absolute()','DirAccess.remove_absolute()','String.sha256_text()'],
    snippet:`extends Node
const PATH := "user://save.json"
const VERSION := 2

func save(data: Dictionary) -> bool:
    var body := JSON.stringify(data)
    var text := JSON.stringify({"v": VERSION, "sum": body.sha256_text(), "body": body})
    var f := FileAccess.open(PATH + ".tmp", FileAccess.WRITE)
    if f == null:
        return false
    f.store_string(text)
    f.close()
    if FileAccess.file_exists(PATH):
        DirAccess.rename_absolute(PATH, PATH + ".bak")   # keep the last good save
    return DirAccess.rename_absolute(PATH + ".tmp", PATH) == OK

func load_save() -> Dictionary:
    for p in [PATH, PATH + ".bak"]:
        if not FileAccess.file_exists(p):
            continue
        var w = JSON.parse_string(FileAccess.get_file_as_string(p))
        if w is Dictionary and w.get("sum") == str(w.get("body")).sha256_text():
            return JSON.parse_string(w["body"])
    return {}`,
    pitfall:`Treating the swap as one atomic step. POSIX rename() replaces a file atomically, but Godot’s docs promise only that DirAccess.rename overwrites the destination, and Windows MoveFileEx documents no atomicity. So the code makes two renames: old to .bak, then new into place. A crash between them leaves no main file, and load_save() then uses the .bak. Check the returned error code of both renames. Also, JSON turns integers into floats, so cast ids back with int() after loading.`,
    map:`Godot FileAccess with user:// is C# System.IO with Application.persistentDataPath. The .bak rename plays the part of File.Replace’s backup argument.` },
  unity:{ term:`Application.persistentDataPath is the writable per-user folder. System.IO reads and writes files. JsonUtility or a package such as Newtonsoft turns data into text. File.Replace swaps a new file over an old one and can keep a backup.`,
    api:['Application.persistentDataPath','System.IO.File.WriteAllText()','System.IO.File.Replace()','JsonUtility.ToJson() / FromJson<T>()','System.Security.Cryptography.SHA256','Application.quitting'],
    snippet:`using System.IO;
using UnityEngine;

[System.Serializable] public class SaveData { public int version = 2; public int level; public string sum; }

public static class SaveIo {
    static string FilePath => System.IO.Path.Combine(Application.persistentDataPath, "save.json");

    public static void Write(SaveData d) {
        d.sum = null;
        d.sum = Hash(JsonUtility.ToJson(d));            // checksum of the body without sum
        string tmp = FilePath + ".tmp";
        File.WriteAllText(tmp, JsonUtility.ToJson(d));
        if (File.Exists(FilePath)) File.Replace(tmp, FilePath, FilePath + ".bak");   // keeps the old one
        else File.Move(tmp, FilePath);
    }

    public static SaveData Read() => TryRead(FilePath) ?? TryRead(FilePath + ".bak");

    static SaveData TryRead(string path) {
        if (!File.Exists(path)) return null;
        try {
            var d = JsonUtility.FromJson<SaveData>(File.ReadAllText(path));
            string sum = d.sum; d.sum = null;
            return sum == Hash(JsonUtility.ToJson(d)) ? d : null;
        } catch (System.ArgumentException) { return null; }   // truncated or invalid JSON
    }

    static string Hash(string s) {
        using var sha = System.Security.Cryptography.SHA256.Create();
        return System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(s)));
    }
}`,
    pitfall:`Writing the save from OnApplicationQuit or OnDestroy only. On phones and consoles the app is suspended and killed without a clean quit, so the write never runs. Save at safe points and when the platform reports pause, using OnApplicationPause. Also, JsonUtility cannot serialise dictionaries or polymorphic fields, so plan the save type as plain fields and lists.`,
    map:`Unity’s File.Replace with a backup is the one-call form of Godot’s two renames, and Application.persistentDataPath is Godot’s user://.` },
  note:`Neither engine gives a safe save system. Both give a folder and a file API. The safe part is your pattern: plain data with a version and a checksum, a temporary file, a swap that keeps a backup, and a load that falls back.` });
INTERVIEW('craft-save-systems',{
  junior:[
    { q:`Why not write the save directly over the old file?`,
      a:`If the game crashes or the power goes mid-write, the file is half written and the old save is gone. Write to a temporary file, check it, then swap it in and keep the previous file as a backup.`,
      follow:`What is in the backup after a good save?`,
      red:`Has never considered an interrupted write.` },
    { q:`What is the first thing you put in a save file format?`,
      a:`A version number. Later versions need to know what they are reading so they can migrate it. A checksum is a close second.`,
      follow:`What do you do when you meet a save from a newer version?`,
      red:`Says there is no need until the format changes.` }
  ],
  mid:[
    { q:`How do you keep old saves working across patches?`,
      a:`Version every save, write one migration per version step, and keep a fixture save for each shipped version in the test suite. Load runs the chain of migrations. Never rename or remove a field without a migration.`,
      follow:`How do you handle a field that changes meaning?`,
      red:`Reads whatever fields are there and hopes.` },
    { q:`What do you save, and what do you rebuild?`,
      a:`Save the minimum state that recreates the game: ids, counters, positions. Rebuild anything derived (caches, computed stats, references between objects). Serialising live objects couples the file to your class layout.`,
      follow:`How do you save references between objects?`,
      red:`Serialises the whole scene.` },
    { q:`How do you test that saving is safe?`,
      a:`Kill the process at random points during saves, many times, and check a valid save always exists. Fuzz load with truncated, empty and byte-flipped files. Load a fixture from each released version.`,
      follow:`What does the player see when the main file is corrupt?`,
      red:`Tests only the happy path.` }
  ],
  senior:[
    { q:`Design cloud saves for a game on phone and PC with one account.`,
      a:`Use the platform or account service for storage. Each save has a version, a save time, a device id and a progress counter. On conflict, do not silently pick one: keep both and let the player choose, or merge by a stated rule. Sync on launch, exit and pause, handle offline play, and keep local copies as the source when the cloud is down.`,
      follow:`What if two devices played offline for a week?`,
      red:`Last write wins with no mention of loss.` }
  ] });
