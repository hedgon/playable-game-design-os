/* =====================================================================
   TEAM LEADERSHIP
   What a lead actually does: 1:1s, review culture, written conventions,
   onboarding, hiring, incidents and saying no. Same 8-part topic structure
   as every other domain, plus iv. No eng view for this domain either.

   Topics, each followed by its INTERVIEW:
     lead-role         What a lead actually does
     lead-one-on-ones  1:1s, feedback and growth
     lead-code-review  Code review culture and merge discipline
     lead-conventions  Written conventions, rule files and decision records
     lead-onboarding   Onboarding and knowledge transfer
     lead-hiring       Hiring loops and interviewing others
     lead-incidents    Incident handling and blameless learning
     lead-saying-no    Saying no, prioritisation and stakeholders
   ===================================================================== */
DOMAINS.push({ id:'leadership', lens:'eng', t:'Team Leadership', short:'The lead role, 1:1s, review culture, conventions, onboarding, hiring', color:'var(--d-leadership)',
  sum:`The work that only exists because other people are doing the work. A lead converts direction into decisions other people can make without asking, notices who is stuck before they say so, and absorbs the requests that would otherwise land on the team as noise.`,
  links:[['management','Management owns the plan. Leadership owns whether the people executing it can.'],['studio','Conventions, decision records and quality bars are leadership written down.'],['production','Leads decide what gets reviewed, what gets merged and what ships tonight.'],['ai','AI changed what a junior does first, so it changed what a lead has to teach and verify.']],
  titles:{ test:'What should I measure or review?' } });

T('lead-role',{ d:'leadership', t:'What a lead actually does', tag:'A lead is measured by the decisions other people can make without asking, not by the code they personally shipped.',
  what:`The job that only exists because other people are doing the work: setting technical direction, turning vague direction into decisions the team can act on, unblocking, reviewing, absorbing requests from outside, and keeping enough hands on the code to stay credible. It is a different job from being the strongest engineer on the team, and the first month is usually spent discovering that.`,
  why:[`A team's throughput is set by its worst bottleneck, and a lead who decides everything is that bottleneck.`,`Decisions only one person can make form a queue with that person at the head of it.`,`Nobody else is watching whether the system the team works inside is getting worse.`,`The work a lead skips while coding full time is invisible for a few weeks and then expensive for a few months.`],
  think:{ q:[`What decisions are queuing on me, and which could be delegated by writing down the rule instead?`,`Am I the bottleneck or the multiplier this week, and what evidence do I have?`,`Who is stuck and has not said so?`,`What breaks if I am away for two weeks?`,`How much code do I still write to stay credible without becoming the critical path?`,`Which of my meetings could be a written decision?`],
    trade:[`Writing code keeps judgment sharp and puts the lead on the critical path.`,`Delegating grows people and produces worse work for a while.`],
    traps:[`Taking the hardest task because it is the most comfortable part of the job.`,`Reviewing everything personally, which turns review into the queue.`,`Passing noise from outside straight through to the team.`,`Deciding in private and announcing the result, so the reasoning never transfers.`,`Keeping an engineer's definition of a good day after taking a job with a different output.`,`Measuring yourself by tickets closed.`],
    good:[`The team keeps making correct decisions while the lead is on holiday.`,`New constraints reach the team as written direction rather than as rumour.`],
    bad:[`Every design question waits for one person.`,`Only the lead knows why the system is shaped the way it is.`] },
  how:[`Write the direction down. A decision that lives in your head is a decision people have to queue for.`,`Keep a list of the decisions you make repeatedly and convert the recurring ones into a default or a short rule.`,`Protect maker time for the team and accept that yours is fragmented.`,`Stay hands-on with something small and real each cycle: a tool, a hard bug, the review nobody wants.`,`Delegate whole problems with the constraint and the deadline attached, not tasks with instructions attached.`,`Do the unglamorous work nobody else will pick up: build health, the flaky test, the onboarding path.`,`Represent the team upward with evidence, and absorb the noise on the way down.`,`Say out loud which hat you are wearing when you give an opinion, because a lead's preference is heard as a decision.`],
  ai:{ yes:[`Draft the written version of a decision you have been repeating verbally.`,`Summarise a week of threads into the decisions that were actually made and the ones still open.`,`Prepare the options and trade-offs for a technical direction call so the team argues about substance.`],
       no:[`Make the call on direction.`,`Judge whether a person is struggling.`] },
  prompts:[{l:'Decision to rule',p:`Here are five recent questions the team asked me and the answers I gave: [EXAMPLES]. Find the pattern behind them. Draft the shortest written rule that would let someone answer these without me, including the cases where the rule does not apply. Keep it under eight lines and in the imperative.`},{l:'Bottleneck audit',p:`Here is a week of my calendar, reviews and messages: [DATA]. Identify where work waited on me, which of those waits were decisions, which were reviews, and which were information only I had. For each, propose what would remove me from that path and what it costs.`}],
  verify:[`Is the direction written where the team looks, or only in your head?`,`Can someone else make this class of decision now?`,`Are you still close enough to the code to be wrong in a way people can correct?`],
  test:[`Measure how often work waits on you for a decision or a review during one milestone.`,`Take a week away and review what queued. The queue is your job description.`,`Ask two people to state the current technical direction. Different answers mean it was never written.`],
  rel:[['team-and-collaboration','A role is a set of decisions. A lead decides which decisions they keep.'],['design-documents','Writing is how a lead scales a decision past the room it was made in.'],['lead-saying-no','Absorbing outside requests is most of what protects the team.'],['lead-conventions','The written convention is a lead decision that no longer needs the lead.'],['pm-scoping-cuts','The lead usually owns the sizing that makes a cut list honest.']] });
INTERVIEW('lead-role',{
  junior:[
    { q:`What do you expect a technical lead to do for you?`,
      a:`Direction that is specific enough to act on, an answer when you are blocked, review that teaches, and feedback that arrives close to the event. Also honesty about the parts of the plan that are uncertain. A good answer names what you expect to do yourself: come with options, not just problems.`,
      follow:`What would tell you a lead is a bottleneck rather than a multiplier?`,
      red:`Expects the lead to assign work in detail and to make every technical decision.` },
    { q:`Your lead gives you a whole problem instead of a task. How do you start?`,
      a:`Restate the problem and the constraint in your own words and get that confirmed. Then sketch two approaches with trade-offs before writing code, and agree a check-in point. Delegation of a problem includes the right to choose the approach and the duty to surface it early.`,
      follow:`Halfway through you realise the approach is wrong. What do you do?`,
      red:`Waits to be told the approach, or disappears for two weeks and returns with a finished thing nobody expected.` }
  ],
  mid:[
    { q:`You are being asked to move from senior engineer to lead. What changes about your day?`,
      a:`Output becomes indirect. Your time fragments, so deep work has to be scheduled or dropped. You spend it on decisions, reviews, unblocking and writing things down. You stay close enough to the code to be corrected, usually with a tool, a hard bug or the review nobody wants. The hardest adjustment is that a good day no longer feels like one.`,
      follow:`How much code should a lead write, and what tells you the balance is wrong?`,
      red:`Plans to keep taking the hardest feature and to lead in the spare time.` },
    { q:`How do you stop being the bottleneck for decisions?`,
      a:`Track what queues on you for a week and split it into decisions, reviews and information only you have. Convert the repeated decisions into a written default. Delegate whole problems with the constraint attached. Publish the direction so people can act without asking. Then measure the queue again, because the impression of being busy is not evidence.`,
      follow:`You delegate a decision and it comes back wrong. Do you take it back?`,
      red:`Reviews everything personally and calls it maintaining quality.` },
    { q:`How do you give a technical opinion without ending the discussion?`,
      a:`Say which hat you are wearing. A lead's preference is heard as a decision, so label it: this is a constraint, this is a strong recommendation, this is taste. Speak after the others where you can, ask what would change your mind, and be visibly convinced in public at least sometimes.`,
      follow:`The team picks an approach you disagree with and it is defensible. What do you do?`,
      red:`States a preference first and wonders why the team never disagrees.` }
  ],
  senior:[
    { q:`You take over a team that ships slowly and nobody can say why. First month?`,
      a:`Measure before changing. Where does work wait: review, QA, decisions, a seam with another discipline, a broken build loop. Talk to everyone individually and ask what they would fix. Then make one change, tell people what you expect it to do, and keep it long enough to know. Resist the redesign everyone expects you to arrive with.`,
      follow:`The measurement says the bottleneck is a person everyone likes. How do you handle that?`,
      red:`Reorganises the team in week one on the strength of a diagnosis nobody checked.` },
    { q:`How do you know whether you are doing the job well?`,
      a:`By what happens when you are absent: decisions still get made, the direction is stated the same way by different people, and problems arrive early instead of at the milestone. Also by whether people are growing into work they could not do a year ago. Personal output is the wrong measure and the most tempting one.`,
      follow:`Your team is doing well and you personally shipped nothing this quarter. Is that a problem?`,
      red:`Points at their own commits or at how busy they were.` }
  ] });

T('lead-one-on-ones',{ d:'leadership', t:'1:1s, feedback and growth', tag:'The 1:1 belongs to the other person. Use it only for status and you will hear the resignation instead of the problem.',
  what:`The recurring private conversation and everything attached to it: how it is run, what belongs in it, how feedback is delivered so it can be acted on, and how growth is planned beyond the next ticket. It includes the record keeping, because feedback without examples is an opinion and a promotion case is won with specifics collected over months.`,
  why:[`People leave over something they mentioned once, in a form nobody recognised.`,`Feedback saved for a review cycle is useless. It should be days old, not months.`,`Growth does not happen by accident on a project with a deadline.`,`Dated examples turn an argument about performance into a conversation about behaviour.`],
  think:{ q:[`Whose meeting is this, and who set the agenda?`,`When did I last give this person feedback they could act on the same week?`,`What do they want to be doing in two years, and does anything they do now point there?`,`What am I avoiding saying, and what is that costing them?`,`Would this person tell me if they were unhappy, and what evidence do I have either way?`,`Am I giving the same feedback to the whole team one person at a time, and should it be a rule instead?`],
    trade:[`Frequent 1:1s catch problems early and consume a real share of the week.`,`Direct feedback is useful and uncomfortable, and softening it usually deletes the content.`],
    traps:[`Running it as a status meeting, which makes it the first thing cancelled.`,`Cancelling when busy, which is exactly when it was needed.`,`Saving feedback for review season.`,`Praise with no specifics and criticism with no example.`,`Talking most of the time.`,`Promising growth the project cannot fund.`],
    good:[`The other person brings the agenda and raises problems before they are urgent.`,`Feedback points at a specific recent event both people remember.`],
    bad:[`The first sign of a problem is a resignation.`,`Every session repeats the board.`] },
  how:[`Fix the slot and keep it. Moving it occasionally is fine, cancelling it is a message.`,`Let them set the agenda and bring exactly one item of your own.`,`Give feedback close to the event as situation, behaviour, impact, then agree what changes.`,`Ask about direction a few times a year and convert the answer into one concrete next step, not an aspiration.`,`Keep a private dated note per person and use it for reviews, promotion cases and your own memory.`,`Close the loop on anything you promised, including the parts you could not deliver.`,`Ask the question you have been avoiding, early in the meeting rather than in the last minute.`,`When the same feedback goes to three people, stop repeating it and change the system instead.`],
  ai:{ yes:[`Rewrite blunt feedback into situation, behaviour, impact without removing the content.`,`Turn a set of dated notes into a review draft with the examples attached.`,`Suggest the questions that surface a problem someone is reluctant to raise.`],
       no:[`Assess a person's performance.`,`Write the feedback you have not yet decided to give.`] },
  prompts:[{l:'Feedback rehearsal',p:`I need to give this feedback: [RAW]. The context is: [SITUATION]. Rewrite it as situation, behaviour, impact, in under six sentences, without softening the substance. Then list the three ways the person could reasonably push back and what a fair answer to each looks like. Tell me which part of my framing is opinion rather than observation.`},{l:'Growth step',p:`Here is what this engineer does well, what they struggle with, and what they say they want: [CONTEXT]. Our project needs are: [NEEDS]. Propose two concrete next steps that serve both, each with what they would own, what support they need, and how we would know in six weeks whether it is working.`}],
  verify:[`Does the feedback reference an event both people can recall?`,`Is there a next step with a date, or only encouragement?`,`Did they talk more than you did?`],
  test:[`Review your notes each quarter: every person should have at least one piece of acted-on feedback.`,`Measure how often 1:1s are cancelled. That number is the health signal.`,`Ask what they think their next growth step is. If it does not match your answer, one of you never said it out loud.`],
  rel:[['team-and-collaboration','Ownership is agreed in the open, and adjusted in private.'],['skill-and-mastery','The same curve applies to people as to players: a clear next step, visible progress, feedback that arrives in time to matter.'],['lead-role','Most of the lead job is delivered one person at a time.'],['lead-hiring','What you promise in an interview becomes the first 1:1 conversation.'],['lead-onboarding','The first weeks are the highest leverage feedback a person will ever get.']] });
INTERVIEW('lead-one-on-ones',{
  junior:[
    { q:`What should you bring to your own 1:1?`,
      a:`It is your meeting, so bring an agenda: what is blocking you, what you want feedback on, something you want to learn, and anything that has been bothering you for more than a week. Do not save problems for when they are urgent. A 1:1 spent repeating the board is a wasted slot.`,
      follow:`You have nothing to raise. Is that a good sign?`,
      red:`Treats it as a status report to be survived.` },
    { q:`You received feedback you think is unfair. What do you do?`,
      a:`Ask for the specific example first. Feedback without an example cannot be acted on, and asking for one is reasonable rather than defensive. If the example is real and your reading of it differs, say so with your own account. Then agree what would look different next time, so both people can check later.`,
      follow:`The example is real, but there was context the other person did not know. How do you raise it?`,
      red:`Accepts it silently and resents it, or argues the conclusion without touching the evidence.` }
  ],
  mid:[
    { q:`How do you run a 1:1 so people actually raise problems?`,
      a:`Keep the slot, let them set the agenda, and talk less than they do. Ask specific questions rather than how things are going. Follow up on anything you promised and say so when you could not deliver it. The pattern that builds trust is small things acted on, repeatedly, over months.`,
      follow:`Someone always says everything is fine. What do you try next?`,
      red:`Uses the slot for project status and wonders why nothing surfaces.` },
    { q:`Give me an example of difficult feedback you had to deliver. How did you frame it?`,
      a:`Name the situation, the specific behaviour and the impact, then agree what changes. Give it close to the event rather than saving it. A good answer includes what the person said back and how it went a month later, because feedback with no follow-up is just an opinion delivered.`,
      follow:`What did you get wrong in how you delivered it?`,
      red:`Describes softening it until the point disappeared, or delivering it in a group setting.` },
    { q:`An engineer wants a promotion you do not think they are ready for. What happens in that conversation?`,
      a:`Be specific and be honest in that meeting, not later. Name what is present and what is missing, with examples. Turn the gap into work they can actually do in the next months, with support and a check-in. Never imply a timeline you do not control. Ambiguity here is what people quit over.`,
      follow:`They do the work and the promotion is still blocked by budget. What do you say?`,
      red:`Says soon, tells them to keep doing what they are doing, and hopes it resolves itself.` }
  ],
  senior:[
    { q:`A strong engineer on your team is disengaging. How do you find out why?`,
      a:`Ask directly and early, in private, and name what you have observed without a diagnosis attached. Usually it is one of a few things: work that no longer stretches them, a decision that went against them and was never explained, friction with someone, or something outside work. Then act on one of them visibly. Asking and doing nothing is worse than not asking.`,
      follow:`They tell you the reason is a decision you made. Now what?`,
      red:`Waits for the next review cycle, or addresses it by assigning more interesting tickets without a conversation.` },
    { q:`How do you keep feedback consistent across a team you have grown quickly?`,
      a:`Write the expectations per level in observable terms and use the same words in 1:1s, reviews and promotion cases. Keep dated notes so every judgment has evidence. Calibrate with other leads on real examples. Without that, feedback tracks how recently and how loudly someone was visible, which is a bias everyone can feel and nobody can name.`,
      follow:`Two people at the same level get different feedback for the same behaviour. How do you catch that before they do?`,
      red:`Relies on memory and a general sense of each person.` }
  ] });

T('lead-code-review',{ d:'leadership', t:'Code review culture and merge discipline', tag:'A review is a conversation about risk, not a spelling contest. Show the failure first, then the fix.',
  what:`How changes get from a branch into the build: what a change is expected to carry when it asks for review, what reviewers are looking for, how disagreements end, and what merge discipline the repository enforces. The culture matters more than the checklist, because a team that fears review batches work, and batched work is where the expensive mistakes hide.`,
  why:[`Review is the cheapest place to catch a design mistake and the most expensive place to discover a large one.`,`A review queue is a team-wide stall that looks like one person's inbox.`,`Without evidence in the change description, the reviewer is guessing whether anything was verified.`,`Merge discipline is what makes rollback possible, and rollback is what makes releases survivable.`],
  think:{ q:[`What is the risk in this change, and what would catch it if the reviewer misses it?`,`Did the author show the failure before the fix, or only the fix?`,`Is this change small enough that a reviewer can hold it in their head?`,`Is this comment about correctness, about a convention, or about my taste? Say which.`,`Who decides when two reviewers disagree, and how fast?`,`Does the change touch schema, data or config, and should that have been its own change?`],
    trade:[`Thorough review catches more and slows the queue, which pushes authors toward bigger batches.`,`Blocking on style is cheap to automate and corrosive when a human does it.`],
    traps:[`Approving because you trust the person, without reading the risky part.`,`Reformatting the whole file so the actual change disappears in the diff.`,`A pull request that mixes a migration, a refactor and a feature.`,`Comments with no severity, so the author cannot tell what blocks.`,`Review as gatekeeping by the most senior person, which teaches everyone to stop reviewing.`,`Approving a change whose description claims it was tested, with nothing shown.`],
    good:[`The description shows the failing state first, then the change, then the verification.`,`Reviews come back within a day and comments are labelled blocking or not.`],
    bad:[`Everything is approved in one line and defects are caught by QA.`,`One person reviews everything and is the reason merges wait.`] },
  how:[`Put the evidence in the change description: what failed before, what you ran, and what it shows now. Red first, then green.`,`Use a template with a verification section, and write it in the languages the team actually reads. A template nobody can read in their own language gets filled in with nothing.`,`Keep changes small and single-purpose. Separate migrations, mechanical refactors and behaviour changes so each can be reviewed and reverted alone.`,`Match the file you are editing rather than reformatting it to your preference. A whole-file reformat hides the change and makes the history unreadable.`,`Automate style so humans review behaviour. If a machine can decide it, a person should not be spending review on it.`,`Label each comment: blocking, suggestion, or question. Ambiguity is what makes reviews feel hostile.`,`Set an expectation for first response time and for how long a disagreement may stay open, and hold yourself to it first. Two reviewers disagreeing is normal, a thread silent for three days is not.`,`Review the test as carefully as the code, and ask what the test would do with deliberately wrong input.`],
  ai:{ yes:[`Summarise a large change into what it touches and where the risk is, before a human reads it.`,`Draft the verification section from the commands that were actually run.`,`Point out missing negative cases and untested error paths.`],
       no:[`Approve a change.`,`Decide whether a design fits the direction the team agreed.`] },
  prompts:[{l:'Pre-review pass',p:`Here is my diff and the change description: [DIFF]. Tell me what a reviewer will ask first. List anything that is mixed into this change and should be its own change, any reformatting that obscures the real edit, and any behaviour change the description does not mention. Then say what evidence the description is missing.`},{l:'Review the tests',p:`Here is a change and its tests: [DIFF]. For each test, say what it would still pass with if the implementation were wrong in a plausible way. List the error paths and boundary cases with no coverage. Mark which missing cases are worth blocking on and which are a follow-up.`}],
  verify:[`Does the description show the failure before the fix?`,`Is anything mixed in that should have been a separate change?`,`Is every comment labelled blocking or not?`],
  test:[`Measure time to first review and time to merge. Both are team throughput, not individual habits.`,`Review a month of escaped defects and check how many passed through review unseen, and why.`,`Count changes that mix a migration with behaviour. That number should be zero.`],
  rel:[['quality-and-build-health','Review is the first gate, and the build is what it protects.'],['verifying-ai-output','Reviewing generated code needs the same evidence discipline, applied harder.'],['lead-conventions','Anything argued twice in review belongs in a written convention.'],['pm-qa-release','Review and the pipeline are the same ladder of checks seen from two ends.'],['backend-testing','What a test proves decides how much the review can trust it.']] });
INTERVIEW('lead-code-review',{
  junior:[
    { q:`What do you put in a pull request description?`,
      a:`What problem it solves, what failed before, what you changed, and how you verified it. Show the failing state first and then the result, so the reviewer reads evidence rather than a claim. Mention anything you did not verify and why. Keep the change single-purpose so the description can stay short.`,
      follow:`How would you show the failure if the bug is a visual glitch with no test?`,
      red:`Writes "fix bug" and expects the reviewer to work out the intent from the diff.` },
    { q:`Your editor reformatted the whole file. What do you do before pushing?`,
      a:`Undo it and match the file you are editing. A whole-file reformat hides the real change and makes the history unreadable for everyone after you. If the formatting genuinely should change, it is a separate change, decided by the team and applied on its own.`,
      follow:`The file style is inconsistent with the rest of the codebase. Do you fix it in passing?`,
      red:`Treats a reformat as a free improvement and buries a behaviour change inside it.` },
    { q:`How do you respond to a review comment you disagree with?`,
      a:`Ask what problem it is preventing. If it is correctness, fix it. If it is a convention, check whether it is written down and follow it either way. If it is taste, say so politely and ask whether it blocks. Disagreements should end in a decision, not in a thread that goes quiet.`,
      follow:`It goes back and forth three times. How do you end it?`,
      red:`Argues at length, or changes it while believing the reviewer is wrong and saying nothing.` }
  ],
  mid:[
    { q:`What do you look for when you review someone else's change?`,
      a:`Risk first: what breaks if this is wrong, what data it touches, what it makes irreversible. Then correctness at the boundaries and the error paths. Then whether the tests could actually fail. Style last and preferably by machine. Label each comment blocking, suggestion or question so the author knows what to act on.`,
      follow:`It is a thousand-line change. How do you review it honestly?`,
      red:`Starts at line one and comments on naming while missing a schema change.` },
    { q:`How would you fix a team where reviews take three days?`,
      a:`Find where the delay is: waiting for one person, batching by the reviewer, or changes too large to start. Set a first-response expectation, spread review across more people, and make changes smaller so review is cheap. Measure time to first review rather than asking people to try harder.`,
      follow:`Splitting work into small changes slows the authors down. How do you weigh that?`,
      red:`Adds a rule that everyone must review daily and changes nothing structural.` }
  ],
  senior:[
    { q:`How do you set review culture on a team where review is currently a rubber stamp?`,
      a:`Change what a change carries before changing what reviewers do: evidence in the description, single-purpose changes, migrations separated from code. Model the review you want in public, including admitting when you were wrong. Label comment severity so review stops feeling like an attack. Then measure escapes and time to first review, and talk about both as team numbers rather than personal ones.`,
      follow:`One senior engineer rejects this and keeps approving in one line. What do you do?`,
      red:`Mandates two approvals and treats the number of approvals as the culture.` },
    { q:`How does reviewing generated code differ from reviewing code a colleague wrote?`,
      a:`The author's understanding can no longer be assumed, so the review has to test it. Ask what was verified and how. Generated code is plausible in shape and often wrong at the boundaries, in the error paths, and in the invented API that does not exist. Require the failing case to be shown first, and require the author to explain the part they would not have written themselves.`,
      follow:`An engineer submits a large generated change they cannot explain. How do you handle it, this time and structurally?`,
      red:`Either bans generated code or reviews it exactly as before.` }
  ] });

T('lead-conventions',{ d:'leadership', t:'Written conventions, rule files and decision records', tag:'A short rule that outranks habit beats a long document that competes with it. Date it, and say what produced it.',
  what:`The written layer a team runs on: coding conventions, the rules that override personal habit, decision records that keep the reasoning behind an architecture, and the small files that sit next to the work and get read at the moment of the choice. The test of this layer is not whether it exists. It is whether someone about to make the wrong call encounters it first.`,
  why:[`Unwritten conventions are enforced in review, one argument at a time, forever.`,`A rule with no recorded origin becomes superstition, and nobody can tell which ones have expired.`,`A decision record is what stops the same architecture debate returning every six months with less information.`,`People arrive with habits from other codebases. Without a written default, the codebase becomes a history of who wrote which file.`],
  think:{ q:[`Where will the person about to make this mistake actually be looking?`,`Is this a rule, a default, or a preference? Only the first two should be written as instructions.`,`What incident produced this rule, and would a reader today agree it still applies?`,`Does this rule conflict with another one we have written?`,`Can a machine enforce this instead of a person?`,`What would make this rule obsolete, and who retires it then?`],
    trade:[`More written rules give consistency and cost reading time, and past a point nobody reads any of them.`,`A strict convention makes a codebase legible and makes every exception an argument.`],
    traps:[`A long style document that competes with the habits people already have.`,`Rules with no date and no origin, which cannot be evaluated later.`,`Recording the decision and not the constraint that drove it.`,`A convention that contradicts what the pipeline actually enforces.`,`Writing the rule somewhere the person will not be when they need it.`,`Letting the rule set grow with no retirement, until reading it is a project of its own.`],
    good:[`Rules are short, in the imperative, and carry the date and the incident that produced them.`,`A decision record says what was true at the time and what would reverse it.`],
    bad:[`Everyone knows the conventions and no two people state them the same way.`,`The written rules and the automated checks disagree.`] },
  how:[`Keep the rules short and in the imperative, and put them where the work happens rather than in a wiki nobody opens.`,`Stamp each rule with its date and a one-line description of the incident that produced it, so a later reader can judge whether it still applies.`,`Write the rules that must outrank habit explicitly, because a default the reader already disagrees with loses unless it says it wins.`,`Match the file you are editing. Repo-wide reformatting should be its own change, decided once, never smuggled into a feature.`,`Make failure loud where the convention matters: required wiring that is missing should stop the run with a clear message instead of degrading silently.`,`Write a decision record for anything structural: the decision, the constraint, the alternatives, and what would reverse it.`,`Automate what a machine can check and keep the written rules for the judgment a machine cannot make.`,`Retire rules out loud, and merge a new lesson into an existing rule rather than adding a near-duplicate. A rule set that only grows stops being read, which is the same as not existing.`],
  ai:{ yes:[`Draft a rule from an incident, in under eight lines, with the origin stamped.`,`Find contradictions between written conventions, and between the conventions and the automated checks.`,`Turn a design discussion into a decision record with the alternatives and the reversal condition.`],
       no:[`Decide which convention the team should adopt.`,`Judge whether a rule still applies to a situation it has not seen.`] },
  prompts:[{l:'Rule from incident',p:`This happened: [INCIDENT]. Draft a rule in under eight lines, imperative, stating the behaviour required and the one case where it does not apply. Add the date and a one-line origin. Then say where the file should live so that the person about to repeat the mistake reads it first, and what would make the rule obsolete.`},{l:'Convention audit',p:`Here are our written conventions and the checks our pipeline actually enforces: [RULES, CHECKS]. List every rule the pipeline contradicts, every rule that could be automated and is not, and every pair of rules that conflict. Mark the rules with no recorded origin, and propose which to retire.`}],
  verify:[`Does the rule sit where the decision is made?`,`Does it carry a date and an origin?`,`Does anything automated contradict it?`],
  test:[`Ask a recent joiner to find the rule for a situation they have not met. If they cannot, it is in the wrong place.`,`Review how many review comments cite a written rule. Repeated uncited arguments mean a rule is missing.`,`Count the rules with no origin stamp. Those are the ones nobody can safely retire.`],
  rel:[['design-documents','A decision record is a design document with the smallest possible scope.'],['team-and-collaboration','Conventions are how a shared target survives without a meeting.'],['lead-code-review','Anything argued twice in review should become a written rule.'],['lead-onboarding','Written conventions are most of what makes a first week self-serve.'],['pm-postmortems','A post-mortem that changes nothing written changes nothing at all.']] });
INTERVIEW('lead-conventions',{
  junior:[
    { q:`You are new to a codebase and its style differs from what you are used to. What do you do?`,
      a:`Match the file you are editing and the surrounding code. Read whatever is written down and follow it. If something looks wrong, ask why before changing it, because a strange pattern usually has a reason that predates you. Personal preference is the weakest argument available in someone else's codebase.`,
      follow:`There is nothing written down and two files disagree. How do you choose?`,
      red:`Introduces the conventions from their last job and calls it an improvement.` },
    { q:`Why write down a decision that everybody already agreed to?`,
      a:`Because agreement decays and people arrive later. A record of the decision, the constraint behind it and what would reverse it stops the same debate returning with less information each time. It also lets someone challenge it properly, which requires knowing what it was for.`,
      follow:`What should the record contain beyond the decision itself?`,
      red:`Thinks writing it down is process overhead for something everyone remembers.` }
  ],
  mid:[
    { q:`How do you write a convention that people actually follow?`,
      a:`Make it short, imperative, and put it where the decision happens rather than in a wiki. Say explicitly when it overrides personal habit, because a default that merely exists loses to a habit. Stamp it with the date and the incident that produced it so a later reader can judge whether it still applies. Automate anything a machine can check.`,
      follow:`Your rule set is now forty pages and nobody reads it. What went wrong?`,
      red:`Writes a comprehensive style guide and assumes reading it once is enough.` },
    { q:`When should a convention be enforced by a tool instead of by a person?`,
      a:`Whenever the check is mechanical. Formatting, import order, naming patterns and forbidden calls belong in the pipeline or in a lint rule. Human review should be spent on the judgment that no tool can make. A rule enforced only by review is enforced inconsistently and it turns review into policing.`,
      follow:`The team disagrees with an automated rule. How do you change it?`,
      red:`Keeps enforcing style manually because setting up the tool is a chore.` },
    { q:`Should a missing reference be handled gracefully or should it crash?`,
      a:`Missing wiring is broken setup, not a runtime state, so it should fail immediately and loudly with a message that says what is missing and where. A silent fallback hides the problem until QA or a player finds it. A null check that quietly does nothing is the most expensive kind of politeness in a game codebase.`,
      follow:`Where does the line sit between broken setup and legitimately absent data?`,
      red:`Adds defensive checks everywhere so nothing ever crashes, and nothing ever reports a problem either.` }
  ],
  senior:[
    { q:`How do you introduce conventions to a team that has none, without a revolt?`,
      a:`Start from incidents rather than from taste. Each rule answers something that actually went wrong, and it says so. Keep the set tiny and add only after a real event. Automate first where possible. Let the team write the rule in the retro that produced it, so it is theirs. Then retire rules out loud when they stop applying.`,
      follow:`Two years later, which rules would you expect to remove, and how would you know?`,
      red:`Imports a style guide from a previous company and mandates it.` },
    { q:`Your documentation says one thing and the pipeline enforces another. How do you resolve that?`,
      a:`The pipeline is what actually happens, so treat the divergence as a bug in one of them and decide deliberately which is correct. Then make them agree, because a written rule contradicted by the tooling teaches people that written rules are decorative. Audit for this periodically instead of waiting for a confused joiner to find it.`,
      follow:`Nobody knows why the pipeline rule exists. Do you remove it?`,
      red:`Updates the document and leaves the contradiction in place.` }
  ] });

T('lead-onboarding',{ d:'leadership', t:'Onboarding and knowledge transfer', tag:'A first week is a pedagogy problem. Measure it by the first real change shipped, not by how much was explained.',
  what:`How a new person becomes productive, and how knowledge survives when someone leaves: the environment, the first task, who answers questions, what is written versus what is tribal, and the deliberate transfer of anything only one person knows. The same discipline covers a returning contractor, a rotation between teams and a system with exactly one expert.`,
  why:[`Setup time is paid again by every hire and every rebuilt machine, and it is the cheapest thing on the list to automate.`,`The first weeks are the only time anyone sees the codebase with fresh eyes, and that report expires fast.`,`Knowledge held in one head is a schedule risk with a person attached to it.`,`A joiner who cannot ship in the first fortnight learns that asking is faster than reading, and the habit outlasts the onboarding.`],
  think:{ q:[`Can a clean machine reach a running build by one documented path, and when did anyone last try it?`,`What is their first real change, and does it touch the whole path from code to build?`,`Who is the named first contact, and does that person have the time to be interrupted?`,`What do we teach by talking that should be written?`,`What does exactly one person know, and what is the plan for that?`,`Which of our documents did the last joiner find wrong?`],
    trade:[`Onboarding investment costs senior time now and returns on every later hire.`,`A heavily guided first month builds confidence and delays the fresh-eyes report.`],
    traps:[`A setup document last verified by the person who wrote it.`,`A first task chosen to be safe, which teaches nothing about the real system.`,`A buddy with no time allocated, so questions queue behind their own delivery.`,`Explaining the architecture in a two-hour talk nobody retains.`,`Treating the joiner's confusion as their failure rather than as free evidence.`,`Handover written in someone's last week.`],
    good:[`The joiner ships a real change in week one and knows who to ask next.`,`Their confusion list turns into documentation edits.`],
    bad:[`Two weeks pass before the environment runs.`,`The only person who can produce a release is on holiday.`] },
  how:[`Automate the environment down to one command and prove it on a clean machine every quarter.`,`Choose a first task that is small, real and crosses the whole path: code, review, test, build, ship.`,`Name a first contact and give that person explicit time for interruptions.`,`Ask the joiner to fix the onboarding notes as they go. They are the only person who can see what is missing.`,`Teach the map before the detail: which systems exist, who owns what, where the rules live.`,`Pair on the first review and the first release so the process is experienced rather than described.`,`Keep a list of single-owner knowledge and retire one entry per cycle by rotating who does the work.`,`Treat handover as continuous. Anything that would be written in a last week should already be written.`],
  ai:{ yes:[`Draft an onboarding path from the repository structure, the build scripts and the pipeline definitions.`,`Turn a joiner's list of questions into specific documentation edits.`,`Produce a first map of the code: entry points, boundaries, and where each subsystem starts.`],
       no:[`Choose the first task.`,`Judge whether someone is ready to own a system.`] },
  prompts:[{l:'First week path',p:`Here is our repository layout, build commands and pipeline: [CONTEXT]. Draft the first-week path for a new engineer: environment setup as a numbered list, the map of the system in under a page, and five candidate first tasks that are small, real and cross the whole path from code to shipped build. Mark every step where our documentation is missing or is likely to be stale.`},{l:'Bus factor',p:`Here is our system list, the commit history per area and who reviews what: [DATA]. Identify the areas where knowledge sits with one person. For each, propose the cheapest transfer: a rotation, a written walkthrough, a paired task, or a tool. Order them by what an absence would cost us this quarter.`}],
  verify:[`Did the setup path run on a clean machine without a person to ask?`,`Did the first task reach the build?`,`Did the documentation change as a result of this joiner?`],
  test:[`Measure days from start to first merged change, and track it across hires.`,`Review each joiner's questions: every repeated question is a missing document.`,`Count systems with one owner. Retire one per cycle.`],
  rel:[['onboarding','Teaching a new hire is the same pedagogy as teaching a player, and it fails in the same places.'],['design-documents','What a joiner can self-serve is exactly what was written down.'],['lead-conventions','Written conventions are most of what makes a first week self-serve.'],['lead-hiring','What the loop promised is what the first month has to deliver.'],['pm-cross-discipline','A joiner meets every seam in the pipeline, and finds the ones that are undocumented.']] });
INTERVIEW('lead-onboarding',{
  junior:[
    { q:`It is your first week and the setup documentation is wrong. What do you do?`,
      a:`Get unblocked first by asking, then fix the document while the confusion is still fresh. You are the only person who can see what is missing, and that view expires in about two weeks. Record what you had to ask for, not only what failed.`,
      follow:`What would you add that is not usually in a setup guide?`,
      red:`Struggles silently for three days, or fixes their own machine and leaves the document as it was.` },
    { q:`What would you want your first task to be?`,
      a:`Something small and real that crosses the whole path: a change, a review, a test, a build, a shipped result. The point is to learn the process end to end while the change itself is low risk. A task invented to be safe teaches nothing about how the team actually works.`,
      follow:`What would you want to understand before touching the code at all?`,
      red:`Wants a week of reading before touching anything, or a large feature to prove themselves.` }
  ],
  mid:[
    { q:`How would you onboard an engineer onto a system only one person understands?`,
      a:`Do not schedule a lecture. Pair on real work in that system, have the newcomer write the walkthrough as they go, and have the expert review the writing rather than dictate it. Then give the newcomer the next real task in that area with the expert as reviewer only. Knowledge transfers through doing and gets fixed through writing.`,
      follow:`The expert says they do not have time. How do you make the case?`,
      red:`Books a two-hour architecture talk and considers the knowledge transferred.` },
    { q:`How do you find where your bus factor is one?`,
      a:`Look at who reviews and who commits per area, then confirm with the team, because the history under-reports the person who is always asked verbally. Rank by what an absence would cost this quarter. Retire one entry per cycle by rotating the work, not by writing a document about it.`,
      follow:`The riskiest area is also the one the expert least wants to hand over. What now?`,
      red:`Produces a document for each area and treats the risk as closed.` }
  ],
  senior:[
    { q:`Your team will double in six months. What do you build first?`,
      a:`The self-serve path: one-command environment, a map of the systems with owners, written conventions that answer the recurring questions, and a first-task pipeline so a joiner always has one waiting. Also name who onboards, and give them the time. Doubling a team without that halves everyone's output for a quarter and nobody can point at the cause.`,
      follow:`Six months in, the new half is productive and the original half is slower. What happened?`,
      red:`Plans to hire first and sort out the process when it hurts.` },
    { q:`Someone with critical knowledge resigns tomorrow. What happens in the notice period?`,
      a:`Stop treating it as documentation time. Have them work through the real operations with a successor driving, in the order of what would hurt most: the release, the incidents, the data, the third-party integrations. Record the walkthroughs. Leave the written summary for last, because a document nobody has exercised is not a handover.`,
      follow:`What should have been true a year earlier so this week mattered less?`,
      red:`Asks them to write a handover document and hopes it covers everything.` }
  ] });

T('lead-hiring',{ d:'leadership', t:'Hiring loops and interviewing others', tag:'Test whether they can do the job, not whether they enjoy your puzzle. Design the loop backwards from the work.',
  what:`Designing and running the loop: what the role actually requires, what each stage measures, how to interview without rewarding rehearsal, how interviewers stay calibrated, and how the decision gets made. It includes the candidate's experience, because the loop is the first real evidence anyone has about how this team works.`,
  why:[`A bad hire costs the team a year, and it costs the person more than that.`,`An unstructured interview mostly measures similarity to the interviewer.`,`Any stage that does not map to real work produces noise that gets treated as signal in the debrief.`,`Candidates talk to each other, and a bad loop closes the pipeline without telling you.`],
  think:{ q:[`What must this person do in their first six months, and which stage tests that?`,`What would a strong candidate from an unusual background look like, and would this loop see them?`,`Am I measuring the skill, or the practice of this interview format?`,`What evidence would change my mind after the first ten minutes?`,`Who else is calibrated on this bar, and how do we know?`,`What are we willing to teach, and what has to arrive already present?`],
    trade:[`A rigorous loop reduces bad hires and loses good candidates to a slower process.`,`Take-home work resembles the job and taxes candidates with less free time.`],
    traps:[`Culture fit used as a synonym for similarity.`,`Puzzles that nothing in the job resembles.`,`A different loop per candidate, which makes comparison impossible.`,`Deciding in the first minutes and spending the rest collecting support for it.`,`Questions about family, age or citizenship, which are irrelevant to the work and in many places unlawful.`,`Selling a version of the role that the first month contradicts.`],
    good:[`Every stage maps to a task from the actual job.`,`Interviewers write their evidence before hearing anyone else's.`],
    bad:[`Nobody can say what would have been a no.`,`Feedback to the candidate takes two weeks and says nothing.`] },
  how:[`Write the role as the first six months of work, then design one stage per skill that work requires.`,`Use work that looks like the job: reading and changing real code, reviewing a diff, debugging something broken, arguing a design under constraints.`,`Keep the loop identical across candidates so the comparison carries information.`,`Ask what they personally did, then follow up twice on the same story. Depth separates the person who did it from the person who was nearby.`,`Write your evidence and your recommendation before the debrief.`,`Decide against a written bar and record the reason, so the next calibration has something to read.`,`Tell candidates what the stages are and where they stand, and answer quickly. Speed is respect and it also wins offers.`,`Give any interviewer the ability to say no with a reason the group can examine.`],
  ai:{ yes:[`Turn a role description into the stages that would actually test it, and flag the ones that test nothing.`,`Generate a realistic debugging or review exercise from a sanitised piece of the codebase.`,`Check a question set for items that reward rehearsal rather than skill.`],
       no:[`Screen candidates or rank them.`,`Judge a person from a transcript or a recording.`] },
  prompts:[{l:'Loop design',p:`Here is the role as the first six months of work: [WORK]. Design a four-stage loop. For each stage give what it measures, the exact task, what a strong and a weak answer look like, and what it does not measure. Then tell me which of our current stages measures nothing, and which required skill no stage covers.`},{l:'Question audit',p:`Here are the questions we currently ask: [QUESTIONS]. For each, say what it actually measures, whether a candidate could pass it by rehearsal, and whether a strong engineer from a different background would stumble on it for reasons unrelated to the job. Rewrite the three weakest into tasks drawn from real work.`}],
  verify:[`Does every stage map to something the job requires?`,`Was the evidence written before the debrief?`,`Could you state, in advance, what a no looks like?`],
  test:[`Review hires after six months against what the loop predicted. That is the only calibration data you have.`,`Measure time from application to decision, and where candidates drop out.`,`Compare interviewer scores on the same candidate. Wide spread means the bar is not shared.`],
  rel:[['playtesting','An interview is an observation session with one participant, and the same observer errors apply.'],['team-and-collaboration','You are hiring for a set of decisions, not for a title.'],['lead-onboarding','The offer makes a promise that onboarding has to keep.'],['lead-one-on-ones','The first feedback conversation is already implied by what the loop told them.'],['lead-role','Building the team is part of the job, not an interruption to it.']] });
INTERVIEW('lead-hiring',{
  junior:[
    { q:`You are asked to interview a candidate for the first time. How do you prepare?`,
      a:`Know which skill your stage is measuring and what a strong and weak answer look like. Prepare the task and the follow-ups rather than a list of trivia. Write your evidence and your recommendation before any debrief. Ask about what the person personally did, and follow up twice on the same story.`,
      follow:`You feel the interview went badly but cannot say why. What do you write?`,
      red:`Plans to chat and see whether there is a connection.` },
    { q:`What makes an interview question a bad one?`,
      a:`It rewards rehearsal, or it tests something the job never requires, or it has one clever answer the interviewer already knows. Puzzle questions and trivia measure preparation and confidence. Real work measures the skill: reading code, changing it, reviewing a diff, debugging something broken.`,
      follow:`Turn a trivia question you have been asked into a real-work task.`,
      red:`Defends puzzles as a test of raw intelligence.` }
  ],
  mid:[
    { q:`Design a loop for a mid-level gameplay engineer. What are the stages?`,
      a:`Start from the first six months of work, then one stage per required skill: a conversation about real experience with depth follow-ups, a code exercise that is reading and changing rather than writing from nothing, a debugging or review task with a broken build, and a design discussion under constraints. Say what each stage does not measure, and keep the loop identical across candidates.`,
      follow:`Which stage would you drop if you had to cut the loop in half?`,
      red:`Lists stages by convention and cannot say what any of them measures.` },
    { q:`Two interviewers disagree strongly about a candidate. How do you run the debrief?`,
      a:`Evidence before opinions, and everyone writes before anyone speaks. Compare what each person actually observed, and check whether they were measuring the same thing. Disagreement is usually a difference in the bar, not in the candidate, so make the bar explicit. If it stays unresolved, another stage on the contested skill beats a vote.`,
      follow:`One of them is much more senior. How do you keep that from deciding it?`,
      red:`Takes a vote, or lets the most senior person decide.` },
    { q:`A candidate is strong technically and dismissive of the designers in their examples. How much does that weigh?`,
      a:`Heavily, because the job is cross-discipline and you have direct evidence of behaviour rather than a vibe. Probe it once more with a specific question about a disagreement they lost. Separate this from culture fit, which usually means similarity. What you are testing is whether they can work across the seams this job actually has.`,
      follow:`They explain it as frustration with one bad experience. Does that change your read?`,
      red:`Waves it away because the technical bar is high, or rejects on a feeling with no example.` }
  ],
  senior:[
    { q:`Your loop keeps producing hires who interview well and struggle on the job. What do you change?`,
      a:`Compare hires at six months against what the loop predicted. Usually the stages are measuring polish: presentation, comfort with the format, familiarity with the puzzle genre. Replace them with tasks drawn from real work, define the bar in observable terms, and calibrate interviewers against the same recording or the same exercise. Then keep measuring, because a loop with no feedback loop drifts.`,
      follow:`How would you collect that six-month signal without turning it into a performance ranking?`,
      red:`Adds more stages, or blames onboarding.` },
    { q:`How do you keep a hiring bar during a crunch when you need people now?`,
      a:`Decide in advance what you will and will not compromise, and write it down while nobody is desperate. Usually you can flex experience and domain knowledge and you cannot flex judgment or how someone works with others. Consider contractors or a smaller scope instead of lowering the bar, because a wrong hire costs more team time than the vacancy did.`,
      follow:`You hire against your own advice and it is not working out. What do you do in the first month?`,
      red:`Lowers the bar quietly and does not tell the team what changed.` }
  ] });

T('lead-incidents',{ d:'leadership', t:'Incident handling and blameless learning', tag:'Stop the bleeding, then learn. Command, communication and cure are three jobs, and one person cannot hold all three.',
  what:`What happens when the live game breaks: who takes command, how the team communicates while it is on fire, the order of mitigate then diagnose then fix, and the review afterwards that converts an outage into a permanent change. It differs from a post-mortem by tempo. This is the hour, not the week.`,
  why:[`Under pressure the expensive mistakes come from people improvising roles.`,`Diagnosing before mitigating extends the outage to satisfy curiosity that could have waited.`,`Players and stakeholders fill silence with assumptions worse than the truth.`,`The detail a review needs evaporates within hours unless somebody is writing it down live.`],
  think:{ q:[`Is it mitigated? Everything else waits until it is.`,`Who is commanding, who is communicating, who is investigating?`,`What changed recently, and can we undo it?`,`What is the blast radius, and who is affected right now?`,`Is anyone writing the timeline?`,`When is the next update, and who is it going to?`],
    trade:[`Rolling back restores service quickly and destroys the state that would explain the cause.`,`Broad status updates build trust and invite a crowd into the incident channel.`],
    traps:[`Everybody debugging and nobody deciding.`,`Fixing forward under pressure with an untested change.`,`Staying silent until there is a complete explanation.`,`A rollback that exists only in theory because nobody has ever run it.`,`Rewarding heroics, which guarantees the next incident is handled the same way.`,`Skipping the review because it got fixed.`],
    good:[`Roles are declared out loud in the first few minutes.`,`A timeline exists before anyone starts explaining.`],
    bad:[`The same person resolves every incident and nobody else learns how.`,`Players learn about the outage from each other.`] },
  how:[`Declare the incident explicitly and name the commander. The commander decides and does not debug.`,`Mitigate first: switch off, roll back, throttle, degrade. Diagnosis begins after the bleeding stops.`,`Preserve the evidence before destroying it. Copy logs and a snapshot of the broken state before the rollback.`,`Communicate on a clock: what we know, what we are doing, when the next update comes, even when nothing has changed.`,`Keep one channel for the incident and keep spectators out of it.`,`Write the timeline as it happens. Nobody can reconstruct it tomorrow.`,`Hand over explicitly when someone is tired. Fatigue causes the second incident.`,`Close with a review that produces at most three changes, one of which is the check that would have caught it, and keep any conversation about a person's performance out of that review and private.`],
  ai:{ yes:[`Cluster logs and error spikes during an incident and propose the likely blast radius.`,`Draft the player-facing and internal status messages while engineers keep working.`,`Turn the live notes into a timeline with decision points afterwards.`],
       no:[`Decide to roll back or to fix forward.`,`Take command of an incident.`] },
  prompts:[{l:'Mitigation options',p:`Here are the symptoms, the affected population, what changed in the last day and the switches available: [CONTEXT]. List mitigation options in order of how fast they stop the damage, with what each one costs the player and what evidence each one destroys. Recommend one and say what we should capture before executing it.`},{l:'Status update',p:`Here is what we know, what we do not know, and what we are doing: [FACTS]. Write two updates: one for players in plain language with no blame and no speculation, one for internal stakeholders with the blast radius and the next steps. Both must state when the next update comes. Do not include a cause we have not confirmed.`}],
  verify:[`Was it mitigated before it was diagnosed?`,`Was the evidence preserved before the rollback?`,`Does the review end in changes rather than in an explanation?`],
  test:[`Measure time to mitigation, separately from time to fix. They are different problems with different cures.`,`Rehearse a rollback on a real build each cycle and time it.`,`Review repeat incidents. A repeat means the change was written down and not made.`],
  rel:[['quality-and-build-health','Everything that makes an incident survivable was built before it, during normal work.'],['live-operations','Running a live game means incidents are part of the schedule, not an exception to it.'],['pm-postmortems','The review is where the incident becomes a change.'],['pm-liveops-cadence','Switches, staged data and maintenance policy decide what mitigation is even available.'],['infra-monitoring','You cannot command an incident you learn about from players.']] });
INTERVIEW('lead-incidents',{
  junior:[
    { q:`You are first to notice the live game is broken. What do you do in the first five minutes?`,
      a:`Say so in the right channel with what you observed, when it started and how many players it looks like. Do not start debugging alone and silently. If there is an obvious switch or rollback and you are authorised, propose it. The first job is to get the right people looking, not to be the one who solves it.`,
      follow:`It turns out to be your change from this morning. Does that change anything about what you say?`,
      red:`Investigates quietly for an hour hoping to fix it before anyone notices.` },
    { q:`Why mitigate before diagnosing?`,
      a:`Because every minute of diagnosis is a minute players stay broken, and the cause is usually still there afterwards. Switch it off, roll it back, throttle it, or degrade it, then investigate with the pressure off. The one thing to do first is capture the evidence the mitigation will destroy.`,
      follow:`What would you capture before rolling back?`,
      red:`Wants to understand the root cause first because rolling back feels like giving up.` }
  ],
  mid:[
    { q:`Walk me through how you would run an incident as commander.`,
      a:`Declare it and name the roles: you decide, someone communicates, someone investigates. Establish the blast radius. Choose a mitigation by how fast it stops the damage, capturing evidence first. Update on a fixed clock even when nothing has changed. Keep a live timeline. Hand over when you are tired. Close by scheduling the review while the detail still exists.`,
      follow:`The commander is also the only person who can fix it. How do you split that?`,
      red:`Describes everyone debugging together with no one deciding.` },
    { q:`How much do you tell players during an outage?`,
      a:`Early, plain and without speculation: what is affected, what you are doing, when the next update comes. Never a cause you have not confirmed. Keep the update times even if there is no progress, because silence is what turns an outage into a trust problem. Compensation is a separate decision with a named owner.`,
      follow:`The cause is embarrassing. Does the message change?`,
      red:`Waits for a full explanation before saying anything.` },
    { q:`How do you keep an incident from becoming a hunt for who broke it?`,
      a:`Ask why the guard was missing rather than who acted. Every incident that reached players passed several gates, and those gates are the fixable part. Keep any performance conversation private and separate. The moment a review names a person publicly, the next incident gets hidden until it is larger.`,
      follow:`Someone was genuinely careless. Where does that conversation happen?`,
      red:`Runs a blameless review while everyone knows whose change it was, and changes nothing systemic.` }
  ],
  senior:[
    { q:`Your team has three incidents a month and everyone is tired. How do you break the cycle?`,
      a:`Classify them: same cause, same area, or unrelated. Repeats mean the reviews produced explanations instead of changes. Cap the actions at three per review and schedule them like features. Then attack the two structural causes: what reaches production without a gate, and what you cannot disable without a deploy. Also fix the on-call load, because tired people generate the next incident.`,
      follow:`The team says they have no time to do the follow-up work. How do you create it?`,
      red:`Adds more monitoring and more alerts and calls it improvement.` },
    { q:`What separates a team that survives a bad outage from one that does not?`,
      a:`Preparation done during normal work: a rehearsed rollback, switches that do not need a deploy, staged data, monitoring that tells you before players do, and declared roles so the hour is not improvised. Plus the cultural half, which is that people report bad news early because it has never cost them to do so.`,
      follow:`Which of those would you build first in a team that has none of them?`,
      red:`Credits heroics and the one engineer who always fixes it.` }
  ] });

T('lead-saying-no',{ d:'leadership', t:'Saying no, prioritisation and stakeholders', tag:'No is a statement about capacity, not about worth. Name what it would displace and let the owner choose.',
  what:`Handling requests that arrive from outside the plan: from the director, the publisher, marketing, another team, or the community. How to decline without becoming the obstacle, how to find the goal behind a feature request, when to escalate, and how to protect the team from noise without leaving them ignorant of the pressure the studio is under.`,
  why:[`A team that says yes to everything delivers none of it well, and the shortfall gets read as poor execution.`,`Most requests are a goal wearing a solution costume, and the goal often has a cheaper answer.`,`Only the lead is positioned to trade one item against another with the real sizes in hand.`,`Pressure that reaches the team unfiltered becomes unplanned work nobody ever counted.`],
  think:{ q:[`What is this request actually for, and is there a cheaper way to get that?`,`What would it displace, and whose decision is that trade?`,`Is this a no, a not now, or a yes in a smaller shape?`,`Am I protecting the team, or protecting my plan?`,`Who holds the authority here, and am I deciding something that is not mine?`,`What happens if I accept this and the next three like it?`],
    trade:[`Declining protects focus and spends relationship capital.`,`Escalating produces a real decision and makes you look unable to absorb.`],
    traps:[`A no with no alternative, which makes you the obstacle rather than the filter.`,`A quiet yes absorbed with overtime.`,`Handing every request to the team to judge, which is delegating the part of the job you hold.`,`Deciding a business trade-off that belongs to the product owner.`,`Arguing about the proposed solution instead of asking what it is for.`,`Letting the loudest stakeholder set the order.`],
    good:[`Every no carries the displacement and an alternative.`,`Stakeholders keep bringing requests, which means they trust the answer.`],
    bad:[`The team finds out about a new commitment when it appears on the board.`,`Requests stop coming to you and start arriving directly at engineers.`],
    },
  how:[`Ask what it is for before answering. The goal is usually negotiable even when the request is not.`,`Answer in the currency of displacement: this is what leaves, and this is what leaving costs.`,`Offer the smaller shape that serves most of the goal, and say plainly what it gives up.`,`Escalate with options and a recommendation, never with a complaint.`,`Write the decision down where both sides can see it, including what was traded away.`,`Say no once and clearly rather than three times vaguely.`,`Keep declined requests in a visible queue so nothing is lost and the pattern becomes arguable.`,`Tell the team what pressure exists, including the pressure you absorbed. Protection is not the same as secrecy.`],
  ai:{ yes:[`Turn a feature request into the goal behind it and three cheaper ways to reach that goal.`,`Draft the displacement table: what this costs, what it would replace, what the player loses either way.`,`Rewrite a refusal so it is direct and still leaves the relationship intact.`],
       no:[`Decide the business priority.`,`Judge what a stakeholder will accept.`] },
  prompts:[{l:'Goal behind the request',p:`A stakeholder asked for: [REQUEST]. Our current plan and capacity are: [CONTEXT]. State the goal the request is probably serving. Propose three ways to reach that goal at different costs, including one that needs no engineering. For each, say what it gives up. Then draft the displacement: what would have to leave the milestone for the original request to fit.`},{l:'Escalation note',p:`Here is the request, the plan it collides with, and the two options: [CONTEXT]. Write a short note to the decision owner with the trade-off, the recommendation, what we need decided and by when. No complaints, no history. Then list the three questions they will ask and the answers.`}],
  verify:[`Does the answer name what it would displace?`,`Was the goal behind the request identified before the answer?`,`Is the decision recorded where both sides can find it?`],
  test:[`Review the declined queue each milestone. Repeated requests are evidence about a real need you keep answering wrongly.`,`Measure how much unplanned work reached the team anyway. That is the leak.`,`Ask a stakeholder to restate why the last request was declined. If they cannot, the no was not communicated.`],
  rel:[['scope-control','Every yes is a scope decision, whether or not it is treated as one.'],['planning-and-milestones','A plan only survives if arriving work has to displace something.'],['pm-scoping-cuts','The cut list is the tool that makes displacement concrete.'],['pm-estimation','A credible no rests on a size nobody can dismiss.'],['lead-role','Absorbing outside requests is a large part of what the role is for.']] });
INTERVIEW('lead-saying-no',{
  junior:[
    { q:`A producer asks you directly for something not on your sprint. What do you say?`,
      a:`Find out what it is for and how urgent it really is, give a rough size out loud, and say what it would displace from what you committed to. Then route it to whoever owns the sprint scope. Not a refusal and not a silent yes. The goal is that the cost is visible before anyone agrees.`,
      follow:`They say your lead already approved it. How do you check without being obstructive?`,
      red:`Does it immediately, and the sprint quietly loses a day nobody recorded.` },
    { q:`You are asked to do something you think is a bad idea. How do you push back?`,
      a:`Say what you think will go wrong, in specifics, and what you would do instead. Ask what the request is for, because the goal may have a better route. Then, if the decision stands and it is theirs to make, do it well and record your concern where it can be checked later.`,
      follow:`You were right and it failed. How do you raise that without saying you told them so?`,
      red:`Complies silently and resents it, or refuses without offering an alternative.` }
  ],
  mid:[
    { q:`Marketing wants a feature for an event in three weeks and your milestone is full. Walk me through it.`,
      a:`Ask what the event needs it to achieve, because the goal usually has cheaper shapes. Size the real request with its tail. Present the displacement: this leaves, that costs us this. Offer the smaller shape that serves most of the goal. Then let the person who owns the trade-off decide, and write down what was traded.`,
      follow:`They will not choose, and expect both. What do you do?`,
      red:`Says yes and plans to absorb it with overtime.` },
    { q:`How do you decline without becoming the person everyone routes around?`,
      a:`Always answer in the currency of displacement and always bring an alternative. Be fast, because slow answers push people to ask an engineer directly. Keep the declined queue visible so nothing looks lost. Say yes to something visible when you can. People route around a wall, not around a filter that gives them options.`,
      follow:`You find requests going straight to your engineers. What does that tell you and how do you fix it?`,
      red:`Relies on a policy of no new work during a milestone and treats every exception as a violation.` }
  ],
  senior:[
    { q:`The director keeps adding scope and the date will not move. How do you handle it as the lead?`,
      a:`Stop negotiating feature by feature. Put the whole picture in front of them once: committed scope, measured capacity, what has arrived unplanned, and the three versions of the milestone that are actually achievable. Recommend one. Make it a single decision with the trade named, and record it. Repeated small yeses are how a team ends up failing at everything simultaneously.`,
      follow:`They pick the version that needs overtime. What is your answer?`,
      red:`Escalates as a complaint, or keeps absorbing and lets the team discover the shortfall at the milestone.` },
    { q:`How much of the pressure from above should the team see?`,
      a:`The context, yes. The noise, no. They should know what the studio needs and why the priority changed, because people make better local decisions with that. What they should not receive is every unresolved request and every panicked message. Protection is filtering, not secrecy, and the difference shows up when a decision has to be explained.`,
      follow:`You shielded the team from a risk that then landed on them. What would you do differently?`,
      red:`Either passes everything through unfiltered or keeps the team entirely in the dark and calls it protection.` }
  ] });
