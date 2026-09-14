/* =====================================================================
   INTERVIEW VIEWS (part E3): production, ai, gameai, studio. Same shape
   and rules as 40-data-interview-a.js:
     INTERVIEW('topic-id',{ junior:[{q,a,follow,red}], mid:[...], senior:[...] })
   Six to ten questions per topic, at least one per level. Questions an
   actual interviewer asks, model answers as 3 to 6 bullet outlines, one
   follow-up that is certainly coming, and a concrete red-flag answer.

   Topics this file owns (31):
     production    prototyping, hypothesis-driven-design, playtesting,
                   iteration-and-evidence, vertical-slice-mvp,
                   risk-and-dependencies, polish-when
     ai            bottleneck-shift, ai-roles, prompting-framework,
                   verifying-ai-output, ai-failure-modes,
                   responsibility-matrix, ai-for-implementation,
                   ai-for-playtest-analysis, ai-loop
     gameai        ingame-ai-purpose, choosing-ai-technique,
                   perception-and-awareness, navigation-and-pathfinding,
                   readable-and-fair-ai, adaptive-and-director-ai,
                   allies-and-companions, learning-based-ai,
                   ai-budgets-and-debugging, scripted-vs-simulated
     studio        design-documents, metrics-and-success,
                   team-and-collaboration, planning-and-milestones,
                   quality-and-build-health
   ===================================================================== */

/* ---------------- PRODUCTION ---------------- */

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

/* ---------------- AI COLLABORATION ---------------- */

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

/* ---------------- IN-GAME AI ---------------- */

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

/* ---------------- STUDIO PRACTICE ---------------- */

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
      a:`Establish which one the build actually implements, because that is the real design. Then hold one short session to decide the loop, record it in a single source of truth with an owner, and retire or mark the others as superseded. Do not reconcile by merging the text, because that hides the decision nobody has made.`,
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
      a:`Name the behaviour change that would mean the design works, the leading signal that captures it, the baseline, the window, and the result that would make you pull or rework the feature. Check the build can actually measure it before the feature is built. Agree it with whoever will judge the outcome, in advance.`,
      follow:`The signal lands in the middle: not a clear yes, not a kill. What do you do?`,
      red:`Defines success as positive sentiment or as shipping on time.` },
    { q:`How do you stop a team from optimising a proxy?`,
      a:`Attach every metric to the decision it informs and to a statement of what it does not mean. Never make a proxy a target with an incentive behind it. Review metrics alongside playtest observation so the number always arrives with context. When a proxy and the experience diverge, say so publicly and change the metric rather than the game.`,
      follow:`A target on a proxy is already in someone's objectives. What do you do?`,
      red:`Adds more metrics to balance the first one.` }
  ] });

INTERVIEW('team-and-collaboration',{
  junior:[
    { q:`What does "a role is a set of decisions" mean?`,
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
      a:`The symptom is decisions that satisfy everyone's objection and nobody's intent, plus the same debate every month. The fix is a named decision owner with a tiebreaker, consultation that is genuinely consultation, and a written decision with a reason. Input from many, decision from one.`,
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
      follow:`The recurring debate is genuinely unresolved because the evidence is missing. Now what?`,
      red:`Bans the topic, or holds another alignment meeting.` },
    { q:`Generalists or specialists on a team of ten?`,
      a:`At ten you need generalists who can cover gaps, with one deep specialist where quality is the differentiator or the risk is technical. Specialists raise quality and add coordination cost, which a small team pays in handoffs and waiting. Decide by which disciplines sit on the critical path and where the product's distinctiveness comes from.`,
      follow:`The team grows to thirty. What changes about that answer?`,
      red:`Answers by preference rather than by critical path and differentiation.` }
  ] });

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
      a:`Break it until the pieces resemble work the team has done, estimate those as ranges rather than points, and add the unknowns as explicit risk items with their own test. Name what would make the high end happen. Then check the estimate against the last comparable feature's actual cost, because teams estimate optimistically by default.`,
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
      a:`Bring the number, not the worry: measured cost per unit, remaining capacity, the gap. Then bring the pre-agreed cut list in risk order and ask for a decision between cutting scope, moving the date and lowering quality, naming which of the three the organisation has actually fixed. Do it early, because the options shrink every week.`,
      follow:`They refuse all three and ask for more hours. How do you respond?`,
      red:`Commits to the date and plans to make it up with overtime.` },
    { q:`The riskiest system is scheduled last. What do you do?`,
      a:`Pull a testable version of it forward even in crude form, so the assumption gets settled while direction changes are still affordable. If the full system genuinely cannot move, build a proxy that answers the same question. Then reorder the dependent work so it is not all bet on an untested result.`,
      follow:`Pulling it forward costs three weeks now. How do you justify that?`,
      red:`Leaves the order alone because the dependencies say it must be last.` },
    { q:`A milestone misses. How do you replan?`,
      a:`First establish whether the estimate was wrong or the work changed, because the remedies differ. Re-derive the remaining plan from the new actual cost per unit rather than reapplying the old numbers with more optimism. Take the cuts from the agreed list, restate the exit criteria, and say plainly what the team now knows that it did not.`,
      follow:`The same area misses again next milestone. What does that tell you?`,
      red:`Reschedules the same plan later and assumes the team will catch up.` }
  ] });

INTERVIEW('quality-and-build-health',{
  junior:[
    { q:`How do you order a bug list?`,
      a:`By whether the bug blocks the evidence you need, then by severity. Blockers that stop the build or the core loop first, then bugs that block a specific test, then everything else. Cosmetic bugs look tempting because they are cheap, and fixing them ahead of blockers is the most common triage failure there is.`,
      follow:`A cosmetic bug is actually blocking evidence. Give me an example.`,
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
      a:`Everyone's, and it is urgent, because the system cannot be tested and therefore cannot be validated. Fix reachability first with a debug shortcut, a cheat command or a test scene, before any polish on the system itself. A system that testers cannot reach has failed before a player ever sees it.`,
      follow:`Debug shortcuts change the state the player would arrive in. How do you keep the test honest?`,
      red:`Waits for the progression work to be finished before testing the system.` },
    { q:`Who decides what ships with a known defect, and on what basis?`,
      a:`A named human, usually the product or discipline lead, not a tool and not the bug count. The basis is impact on the player's experience and on the evidence loop, plus the risk of the fix so late. Record the decision, the reasoning and the mitigation. Known-broken lists must reach testers so they do not file it again.`,
      follow:`The defect only affects two percent of sessions but corrupts saves. How does that change the call?`,
      red:`Defers to a severity threshold with no human judgment attached.` },
    { q:`Give me a cosmetic-looking bug that actually blocks evidence.`,
      a:`A missing or wrong tell on an enemy attack, a UI element rendering behind another so the resource is unreadable, audio not firing on a hit. Each is filed as cosmetic and each destroys the readability the test depends on. The triage question is whether the bug changes what the player can perceive or decide.`,
      follow:`How would you get that reclassified without fighting the triage process?`,
      red:`Accepts the cosmetic label because it does not affect functionality.` }
  ],
  senior:[
    { q:`The build is red three days a week. What do you change first?`,
      a:`Make breakage visible and cheap to fix: a fast pre-merge check that runs the things that actually break, a named owner for a red build, and a rule that the fix comes before new work. Then look at what breaks repeatedly, because it is usually one integration point or one area with no test coverage. Cadence follows reliability.`,
      follow:`The pre-merge check now takes forty minutes and people route around it. What do you do?`,
      red:`Adds a build policy document, or blames individuals for breaking it.` },
    { q:`How do you budget technical debt paydown?`,
      a:`Against iteration speed rather than taste. Measure what is actually slowing the team: build times, how long a tuning change takes to see in play, how often a change breaks something unrelated. Pay down the debt that sits on that path, in a standing share of each milestone, and leave ugly code that costs nobody anything.`,
      follow:`An engineer wants to rewrite a system that is ugly but not slowing anyone down. How do you respond?`,
      red:`Schedules a refactoring milestone with no measure of what it buys.` }
  ] });
