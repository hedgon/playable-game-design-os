/* =====================================================================
   TECHNIQUE BREAKDOWNS (continued)
   The AI Collaboration domain: which prompting, verification and
   workflow techniques to use, how they work, when they fit.
   ===================================================================== */

TECH('bottleneck-shift',[
  {n:'Bottleneck mapping', how:`Name the current constraint in the project (taste, framing, evidence, prioritization) rather than the old one (writing, coding).`, fit:`Deciding where human attention is now the scarce resource.`, cost:`Misidentifying the constraint wastes the cheapest production you have.`, alt:`Ask what is actually delaying good decisions this week.`},
  {n:'Value/effort reallocation', how:`Redirect time saved on production into testing, judgment and player evidence.`, fit:`Capturing the gains from cheaper implementation instead of building more.`, cost:`Default drift is to build more. Needs an explicit rule.`, alt:`Gate scope on validated value.`},
  {n:'Idea-vs-evidence throughput', how:`Measure how many ideas are tested with players versus how many features are built.`, fit:`A weekly check on whether the bottleneck actually moved.`, cost:`Needs a simple counter, not a dashboard.`, alt:`Track features built vs playtests run.`}
]);

TECH('ai-roles',[
  {n:'Role cards', how:`Assign the model a named stance (brainstormer, critic, systems designer, UX researcher, prototype engineer, analyst, content generator, project analyst, devil's advocate) with use/do-not-use conditions and an output shape.`, fit:`Getting useful, bounded output instead of generic ideas.`, cost:`Wrong role for the task produces confident nonsense.`, alt:`Pick the role from the AI Workflow view.`},
  {n:'Role sequencing', how:`Run roles in a deliberate order (expand, attack, analyse, then the human decides, then build), never letting one model output become the decision.`, fit:`Using AI to widen options while the human chooses.`, cost:`Skipping the human-decision step is the common failure.`, alt:`Insert an explicit decision between generation and commitment.`},
  {n:'Stance and context framing', how:`State expertise, audience and constraints so the model reasons in the right frame.`, fit:`Sharpening any prompt beyond a generic answer.`, cost:`Over-constraining can shrink the search space.`, alt:`Set the stance. Leave the solution space open.`}
]);

TECH('prompting-framework',[
  {n:'Eight-term formula', how:`CONTEXT + INTENT + CONSTRAINTS + EVIDENCE + ROLE + TASK + OUTPUT FORMAT + CRITIQUE.`, fit:`Any task where you want a usable, decision-ready answer.`, cost:`Unfilled terms produce the genre average with confidence.`, alt:`Use the Prompt Generator tool. It flags blanks.`},
  {n:'Structured output contracts', how:`Ask for a table, a ranked list with counts, or a fixed schema so the output is consumable and comparable.`, fit:`Analysis, comparisons, and anything you will act on.`, cost:`Over-rigid formats can cut off useful reasoning.`, alt:`Let it reason in prose, then output in the contract.`},
  {n:'Few-shot with your own data', how:`Give one or two worked examples in your format before the task.`, fit:`Matching house style, taxonomy or edge-case handling.`, cost:`Bad examples anchor bad behaviour.`, alt:`Curate examples from your best prior output.`},
  {n:'Reason-then-answer and self-critique', how:`Ask it to show reasoning, then attack its own answer for assumptions and failure modes.`, fit:`Reducing confident-but-wrong outputs.`, cost:`Not a guarantee of correctness. Still verify.`, alt:`Follow with an independent verification pass.`},
  {n:'Context injection, not memory', how:`Paste the relevant docs, evidence and constraints rather than assuming the model knows your project.`, fit:`Project-specific answers.`, cost:`Context windows and cost. Needs curation.`, alt:`Give the smallest evidence that supports the decision.`},
  {n:'Task-appropriate sampling', how:`Use broad generation for brainstorming and tight, deterministic settings for extraction and verification.`, fit:`Getting variety where you want it and reliability where you need it.`, cost:`Requires platform support and discipline.`, alt:`Treat generation and verification as different tasks.`}
]);

TECH('verifying-ai-output',[
  {n:'Assumption marking', how:`Require each claim tagged given, inferred or invented.`, fit:`Separating data from plausible invention.`, cost:`The model may still mislabel. Spot-check.`, alt:`Demand sources or "unknown".`},
  {n:'Independent re-derivation', how:`Solve or check the problem yourself or with a separate pass, then compare.`, fit:`High-stakes numbers, balance, logic and code.`, cost:`Time. Tempts you to skip it.`, alt:`Verify the decision, not every sentence.`},
  {n:'Ground-truth check', how:`Test the output against the actual code, data, build or a playtest.`, fit:`Any claim about how the game behaves.`, cost:`Needs access and setup.`, alt:`Code and data are the truth. Doc is a map.`},
  {n:'Adversarial / red-team pass', how:`Ask a second pass to break the first output: find the assumption, the failure, the counterexample.`, fit:`Catching plausible-but-wrong and generic output.`, cost:`Can produce noise. Focus on the important claims.`, alt:`Use the devil's advocate role.`}
]);

TECH('ai-failure-modes',[
  {n:'Weekly detectors', how:`Run cheap counters that expose drift: features built vs playtests run, days since a real player touched the build.`, fit:`Catching volume-over-quality and deference early.`, cost:`Needs to be part of the weekly routine.`, alt:`Make each detector a question you can answer in a minute.`},
  {n:'Generate-alternatives pass', how:`When options converge on the genre average, ask for mechanically distinct alternatives under the constraints.`, fit:`Breaking out of AI's central-tendency output.`, cost:`More options to judge. That judgment is the work.`, alt:`Reject the average explicitly in the prompt.`},
  {n:'Evidence gate', how:`No significant design commitment without player evidence. AI output never counts as evidence.`, fit:`Preventing confident AI text from substituting for testing.`, cost:`Slows commitment. That is the point.`, alt:`Turn decisions into hypotheses with a kill criterion.`}
]);

TECH('responsibility-matrix',[
  {n:'Ownership assignment', how:`For each task, assign Human, AI, Human + AI, or Player evidence required before work starts.`, fit:`Making ownership explicit and preventing silent delegation of judgment.`, cost:`Needs review as tasks change.`, alt:`Use the Delegation Planner tool.`},
  {n:'Decision vs production split', how:`Judgment, taste and tradeoffs stay human. Volume, simulation and production go to AI.`, fit:`Deciding what may be delegated at all.`, cost:`The line moves with capability. Revisit it.`, alt:`Default judgment to humans. Delegate production.`}
]);

TECH('ai-for-implementation',[
  {n:'Precise brief template', how:`Hypothesis, minimal build, exposed tuning values, logged events, exclusions, export format, before any code.`, fit:`Getting a useful prototype instead of a surprise.`, cost:`Writing the brief is real work. Skipping it is more expensive.`, alt:`Ask for the embedded decisions before the build.`},
  {n:'Instrumentation-first', how:`Insist on exposed sliders and event logging so the prototype can answer its question.`, fit:`Turning a prototype into evidence.`, cost:`Small extra build time.`, alt:`Log inputs, decisions, failures with timestamps. Export CSV.`},
  {n:'Throwaway discipline', how:`Treat prototypes as disposable. Promote only with an explicit refactor plan.`, fit:`Avoiding accumulated unowned code.`, cost:`Tempting to ship the prototype. Usually a mistake.`, alt:`Decide the promotion explicitly, with review.`}
]);

TECH('ai-for-playtest-analysis',[
  {n:'Analysis-only pass', how:`One pass to code and cluster the notes with no recommendations. A separate, later pass to hypothesize causes.`, fit:`Keeping AI from turning analysis into a change list.`, cost:`Feels slower. Prevents the common failure.`, alt:`Never let the analysis output become the change list.`},
  {n:'Coding scheme and behavior/self-report split', how:`Define codes up front and keep what players did separate from what they said.`, fit:`Comparable, interpretable results.`, cost:`Setup time.`, alt:`Log behavior with timestamps. Interview after.`},
  {n:'Human interpretation gate', how:`The human adds room context and decides. AI counts and clusters.`, fit:`Making sense of the why the data cannot show.`, cost:`Requires the human to actually be in the room.`, alt:`AI analyzes, humans interpret and decide.`}
]);

TECH('ai-loop',[
  {n:'Loop stepper with exit criteria', how:`Mark the project's step in the 12-step loop. Each step has a human role, an AI role, an output and an exit criterion.`, fit:`Keeping exploration, evidence and commitment in order.`, cost:`Requires honesty about where you actually are.`, alt:`Mark where you are in the AI Workflow view.`},
  {n:'Player-evidence gate', how:`Steps 6-8 (players) must sit between exploration (3-4) and commitment (9-10).`, fit:`Preventing AI-era shipping on hope.`, cost:`Slows commitment. That is the design.`, alt:`A cycle with no player evidence is a red flag.`}
]);
