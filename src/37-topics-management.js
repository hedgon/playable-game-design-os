/* =====================================================================
   PROJECT MANAGEMENT
   Scope, estimates, risk, process, handoffs, QA, live cadence and
   post-mortems. Same 8-part topic structure as every other domain, plus iv.
   This domain has no eng view: there is no Godot or Unity counterpart to a
   cut list, and inventing one would be filler.

   Topics, each followed by its INTERVIEW:
     pm-scoping-cuts      Scoping and the cut list
     pm-estimation        Estimation under uncertainty
     pm-risk              Risk registers and de-risking order
     pm-agile-gamedev     Sprints, kanban and content-heavy teams
     pm-cross-discipline  Cross-discipline handoffs and dependencies
     pm-qa-release        QA planning, build health and release trains
     pm-liveops-cadence   Live-ops cadence and release calendars
     pm-postmortems       Post-mortems and retrospectives
   ===================================================================== */
DOMAINS.push({ id:'management', lens:'eng', eng:'none', t:'Project Management', short:'Scope, estimates, risk, process, handoffs, QA, cadence, post-mortems', color:'var(--d-management)',
  sum:`How the work is sequenced, cut and kept honest. Management is not ceremony. It is the discipline of deciding what will not be built, knowing what is uncertain, and making sure the riskiest thing is the thing being worked on right now.`,
  links:[['production','Production is the craft of making the game. Management is the craft of making the plan survive it.'],['studio','Direction, documents and metrics are what management steers with.'],['leadership','A plan is executed by people. Leadership is the half of this that is not a schedule.'],['product','Scope and cadence answer to the promise the product made and the money behind it.'],['infra','Release trains, build health and deploy cadence are the plan expressed in pipelines.']],
  titles:{ test:'What should I measure or review?' } });

T('pm-scoping-cuts',{ d:'management', t:'Scoping and the cut list', tag:'A cut list written while there is still time is a plan. The same list written in the last month is damage control.',
  what:`Turning a wish list into a sequence with a fixed end: what ships at this milestone, what is explicitly not in this version, and the ordered list of what leaves the build first when the date stops moving. Scoping stays a lead's job even when a producer owns the schedule, because only the people who will build a thing know what it actually costs.`,
  why:[`Date, quality and scope cannot all be fixed. Scope is the only one a team still controls late.`,`A cut agreed in advance is a design decision. The same cut made in the last week is damage.`,`Engineers absorb scope silently. Work that never reached the plan still consumes the plan.`,`Every feature carries a tail: teaching, balance, localisation, support, and code that has to keep working for years.`],
  think:{ q:[`What is the smallest version that still keeps the promise, and what does it leave out?`,`For each item, what breaks for the player if it is not there?`,`Which items are load bearing for other items, and which are leaves?`,`What have we already agreed to cut, and does the team remember agreeing?`,`Who is allowed to add work mid-milestone, and what leaves when they do?`],
    trade:[`Cutting early protects the schedule and throws away things that might have been good. Cutting late keeps options open and wastes built work.`,`A hard not-list protects focus and makes the team look inflexible to everyone outside it.`],
    traps:[`A cut list that contains only the things nobody wanted to build.`,`Cutting the polish pass because it never had a ticket.`,`Calling a smaller version of a feature a cut when the integration cost is unchanged.`,`Scope that arrives labelled as a bug fix and so never appears on the plan.`,`Cutting the content and keeping the pipeline that produced it.`,`Cutting a system that three other items quietly depend on.`],
    good:[`The team can name the next three things that go, and nobody argues when they go.`,`Every accepted addition names what it displaced, in the message that requested it.`],
    bad:[`The cut conversation starts after the date has already been missed.`,`Scope grows in chat and appears in the build.`] },
  how:[`Write the milestone as one outcome sentence, then list what that outcome requires. Anything the sentence does not need is already a candidate.`,`Split each item into the part that keeps the promise and the part that improves it, and tier them separately.`,`Order the cut list before the pressure arrives and have the director and the discipline leads agree to the order.`,`Make every addition displace something by name, at the moment it is requested.`,`Count the uncounted work: review, support, build breakage, meetings. It is usually a quarter of the week.`,`Cut the tail with the feature. Remove the tool, the data and the tests, or record explicitly what stayed behind.`,`Re-read the cut list at every milestone review, not only when the date is in danger.`],
  ai:{ yes:[`Turn a feature list into a dependency graph and point at the leaves.`,`List the hidden tail of a feature: teaching, balance, localisation, support, telemetry, tooling.`,`Draft cut tiers from a milestone outcome, then argue against its own ordering once.`],
       no:[`Decide what the game is about. The cut list encodes that decision.`,`Judge how much a cut hurts players it has never observed.`] },
  prompts:[{l:'Cut tiers',p:`Here is the milestone outcome, the item list with rough sizes, and the team: [CONTEXT]. Sort every item into must (the outcome fails without it), should (the outcome is weaker), and could. For each item name what depends on it and the tail it carries after it ships. Then propose the order we would remove things in, and argue against your own order once.`},{l:'Addition audit',p:`Here is what the plan said at the start of the milestone and what is in the build now: [BEFORE, AFTER]. List everything that arrived without displacing anything, who asked for it, and what it most likely cost including review and QA. Mark the additions that are now load bearing for other work.`}],
  verify:[`Does the list contain something the team actually wants, or only leftovers?`,`Does each cut name the tail that goes with it?`,`Has anyone outside the team seen the order and agreed to it?`],
  test:[`Measure the gap between planned items and items actually in the build at milestone end. The uncounted additions are the number that matters.`,`Review the last three additions. Each should name what it displaced.`,`Ask two people what leaves next. If the answers differ, the cut list is not real.`],
  rel:[['scope-control','Scope control decides what deserves to exist. The cut list decides what survives the date.'],['planning-and-milestones','A milestone is a question. The cut list is how you keep answering it when time runs out.'],['pm-estimation','A cut list can only be ordered when the items carry honest sizes.'],['pm-risk','The riskiest item is rarely the one people volunteer to cut.'],['lead-saying-no','Somebody has to deliver the cut to the person who asked for it.']] });
INTERVIEW('pm-scoping-cuts',{
  junior:[
    { q:`Your task is going to take twice as long as planned. What do you do, and when?`,
      a:`Say it the day you know, not the day it is due. Bring three things: what you have learned that changed the size, the options (cut the scope of this task, get help, move the date), and your recommendation. Name what the delay blocks downstream, because that is what the lead needs to replan.`,
      follow:`Your lead says the date cannot move. What do you propose cutting from your own task?`,
      red:`Reports the slip on the deadline, or reports it with no option attached and waits to be told what to do.` },
    { q:`A designer asks you for a small extra feature mid-sprint. What is the correct answer?`,
      a:`Not a refusal and not a yes. Ask what it is for, size it roughly out loud, and say what it would displace from this sprint. Then take it to whoever owns the sprint scope. The point is that every addition has a visible price.`,
      follow:`They say it is only an hour. How do you check whether that is true?`,
      red:`Just does it, and it appears in the build with no ticket and no one aware it happened.` }
  ],
  mid:[
    { q:`How do you build a cut list, and when?`,
      a:`Start from the milestone outcome in one sentence. Tier each item into must, should and could against that sentence. Order the cuts before there is pressure and get the director and the discipline leads to agree to the order. Include the tail with each item: tools, data, tests, teaching. Then re-read it at every milestone review.`,
      follow:`Which item on your last cut list did you regret cutting, and what would have told you earlier?`,
      red:`Describes a list containing only things nobody cared about, which means nothing was actually cut.` },
    { q:`Scope crept through the last milestone and nobody noticed until the end. How do you find out where it came from?`,
      a:`Diff the plan at the start against the build at the end. Everything in the build that is not in the plan arrived somewhere. Group by who asked and by how it entered: a bug that was a feature, a polish pass that grew, a stakeholder request that skipped the board. Then fix the entry route, not the individual items.`,
      follow:`One of the additions is now load bearing for other work. What now?`,
      red:`Blames individuals rather than finding the route work used to get in unmeasured.` },
    { q:`How do you estimate the cost of a feature that is already half built when you are asked to cut it?`,
      a:`Sunk cost does not count. Estimate what remains, including integration, teaching, balance, QA and the maintenance tail. Compare that against what the outcome loses. Also estimate the cost of removing it cleanly, because a half-built system left in the code keeps charging rent.`,
      follow:`Removing it cleanly costs three days. Leaving it dormant costs nothing today. Which do you pick and why?`,
      red:`Argues to keep it because of the effort already spent.` }
  ],
  senior:[
    { q:`The publisher adds a feature two months before launch and will not move the date. Walk me through your response.`,
      a:`Establish what the feature is for, because the request is usually a goal wearing a feature costume. Size it with the tail included. Present the displacement explicitly: here is what leaves, here is what that costs the player, here is the version of your goal we can hit without displacing. Put the decision in writing with the trade-off named, and let the person with the authority make it.`,
      follow:`They accept the displacement, and the team later says they were not consulted. What did you skip?`,
      red:`Says yes and quietly asks the team for overtime, or refuses flatly with no alternative.` },
    { q:`How do you tell a team that six months of their work is being cut?`,
      a:`Tell them directly and early, in person, with the reason and the decision owner named. Do not pretend it might come back if it will not. Say what the work bought even so: knowledge, a system, a validated answer. Then protect their next two weeks from being another thing that gets cut, because morale is repaired by the next thing shipping.`,
      follow:`One of them is about to quit over it. What do you actually say in that one to one?`,
      red:`Delivers it by ticket status change, or softens it into a maybe nobody believes.` }
  ] });

T('pm-estimation',{ d:'management', t:'Estimation under uncertainty', tag:'An estimate is a range with a confidence, not a promise. The useful output is the spread and what would narrow it.',
  what:`Saying how long something will take, honestly enough to plan with. Game work is part research, part taste and part integration into a build that changes underneath you. The techniques are the same as anywhere: decompose until the pieces are familiar, compare against work the team actually finished, state a range, and keep the estimate separate from the commitment.`,
  why:[`A single number is heard as a promise. The listener does not see the uncertainty you meant by it.`,`Most overruns come from work nobody estimated: review, integration, build breakage, second-order fixes.`,`An estimate that is never compared against the actual teaches nothing to the next one.`,`Padding hidden inside each task is spent inside that task. Buffer held at the milestone can be spent deliberately.`],
  think:{ q:[`Have we done something like this before, and how long did that actually take?`,`What is the part nobody understands yet, and can a day of investigation remove it?`,`What am I not counting: review, QA support, data entry, the second platform, localisation?`,`Is this an estimate or a commitment, and does the person hearing it know which?`,`What would make this three times longer, and how would we notice in week one instead of week four?`],
    trade:[`Decomposing improves accuracy and costs hours that are not spent building.`,`An honest wide range is useful to a planner and unsatisfying to a stakeholder who wanted a date.`],
    traps:[`Estimating the happy path of code you have already written in your head.`,`Averaging the optimistic and pessimistic numbers and reporting the average as the date.`,`Per-task padding, which is always spent because it is there.`,`Estimating a research task instead of timeboxing it.`,`Letting someone who will not do the work estimate for the person who will.`,`Re-estimating upward every week and never re-sizing the remaining scope.`],
    good:[`Sizes come with a spread and a named assumption.`,`The team knows its own ratio of actual to estimate for each kind of work.`],
    bad:[`Every task is two days.`,`The plan has no buffer because each task quietly contains its own.`] },
  how:[`Decompose until each piece is something one person could finish in under two days. Anything bigger is a category, not a task.`,`Give three points: the day it lands if nothing surprises you, the realistic day, and the bad day. Plan on the realistic one and communicate the spread.`,`Start from reference class. Find the closest thing the team finished and begin at its actual duration, not at a fresh guess.`,`Timebox research. A spike has a question and a deadline, not an estimate.`,`Count non-build work as a fixed fraction of the week instead of pretending it is zero.`,`Hold buffer at the milestone, not in the tasks, and record what consumed it.`,`Log actuals against estimates for a month. The ratio is worth more than any technique.`],
  tech:[
    { n:'Three-point estimate', how:`Record an optimistic, a likely and a pessimistic duration per task, plan with the likely and report the spread.`, fit:`Familiar work with known unknowns, where the shape is clear and the details are not.`, cost:`Three numbers per task, and a listener who has to be taught what the spread means.`, alt:`A single number, which is faster and is reliably read as a commitment.` },
    { n:'Reference class forecasting', how:`Group finished work into classes, compute each class median ratio of actual to estimate, apply the matching class ratio to the new estimate.`, fit:`Teams with a few months of tracked history and recurring kinds of work.`, cost:`Needs recorded actuals, and it is blind to genuinely new work.`, alt:`Expert judgment, which is faster and systematically optimistic.` },
    { n:'Throughput forecasting', how:`Stop sizing individual items, count how many the team completes per week, forecast from that count and the number remaining.`, fit:`Content streams and live-ops queues where items are similar in size.`, cost:`Useless when item sizes vary wildly, and it answers when, not what.`, alt:`Story points, which try to normalise size and drift into a productivity target.` },
    { n:'Timeboxed spike', how:`Give an unknown a fixed budget and a written question, and end it with a decision and a note rather than merged code.`, fit:`Technology choices, feasibility work, anything where the estimate itself is the unknown.`, cost:`Spends days with no shippable output, and needs the discipline to actually stop.`, alt:`Estimating the unknown anyway, which produces a number with no information in it.` }],
  ai:{ yes:[`Decompose a feature into tasks and list the ones engineers usually forget.`,`Challenge an estimate by naming the assumptions it rests on and what would break them.`,`Turn a set of finished tickets and their durations into reference classes with ratios.`],
       no:[`Commit to a date.`,`Estimate work whose difficulty lives in a codebase it has not read.`] },
  prompts:[{l:'Decompose and challenge',p:`Here is the feature, the current code shape and the team: [CONTEXT]. Break it into tasks of two days or less. For each task state the assumption that makes the size hold. Then list the work engineers usually forget on a change like this: review, migration, tooling, QA support, telemetry, localisation, the second platform. End with the three tasks most likely to double and what would tell us early.`},{l:'Reference class',p:`Here are the last twenty finished items with their estimates and actual durations: [DATA]. Group them into classes of similar work. For each class give the median ratio of actual to estimate and the worst case. Say which class this new item belongs to: [ITEM]. Then say why it might not belong there.`}],
  verify:[`Did it give a range, or a single confident number?`,`Is the non-build work counted somewhere?`,`Does every task have a person who will actually do it?`],
  test:[`Track estimate against actual for one month and compute the ratio per class of work. Plan with the ratio.`,`Review each overrun for its cause: unknown work, interruption, or rework. Each has a different fix.`,`Measure how much of the milestone buffer is gone by week two. That number predicts the end better than a burndown.`],
  rel:[['planning-and-milestones','Milestones are built from estimates and inherit whatever optimism went into them.'],['risk-and-dependencies','The widest estimates and the biggest risks are usually the same items.'],['pm-scoping-cuts','Sizes are what make a cut list orderable.'],['pm-risk','A spike is the tool both estimation and risk reach for.'],['pm-agile-gamedev','The cadence decides what unit you are estimating in.']] });
INTERVIEW('pm-estimation',{
  junior:[
    { q:`How would you estimate a feature you have never built before?`,
      a:`Break it into pieces small enough to be recognisable, under two days each. For the pieces that are still fog, ask for a timebox to investigate instead of guessing. Give a range rather than a number. Add the work people forget: review, QA support, data, the second platform.`,
      follow:`The whole thing is fog. How long a spike do you ask for and what question does it answer?`,
      red:`Produces a single confident number for work they cannot describe in tasks.` },
    { q:`What is the difference between an estimate and a commitment?`,
      a:`An estimate is a prediction with uncertainty. A commitment is a promise someone else plans around. The mistake is giving one and having the other heard. Say which you are giving, and if it is a commitment, say what you had to assume to make it.`,
      follow:`Your lead turns your estimate into a date on a slide. What do you do?`,
      red:`Treats the two as the same thing, then feels ambushed when the number is quoted back.` }
  ],
  mid:[
    { q:`Your estimates are consistently half of the actual. How do you fix that?`,
      a:`Stop trying to be better at guessing. Record actuals for a month, group the work into classes, and compute the ratio per class. Then apply the ratio. Also check what the overruns actually were: unknown work, interruption, or rework. Each has a different fix, and only one of them is estimation.`,
      follow:`The ratio is two for gameplay work and one for tools work. What does that tell you?`,
      red:`Promises to be more careful next time, with no measurement attached.` },
    { q:`How do you handle a stakeholder who wants one number instead of a range?`,
      a:`Give them the number you would plan on and attach the condition under which it holds. Then tell them the earliest signal that it is slipping and when you will next update it. People want a single number because they need to plan. Give them something plannable plus a check-in, not false precision.`,
      follow:`They ask for the optimistic number and start telling others. How do you recover?`,
      red:`Gives the optimistic number to end the conversation.` },
    { q:`Where should buffer live: in each task or at the milestone?`,
      a:`At the milestone, visible and owned. Padding inside a task is always consumed by that task because the deadline expands to meet it. Milestone buffer can be spent deliberately, and how fast it is spent is the earliest honest signal about the end date.`,
      follow:`Half the buffer is gone in week two of a six week milestone. What do you do?`,
      red:`Hides buffer in every task and calls it safety.` }
  ],
  senior:[
    { q:`You inherit a project whose plan you believe is off by a factor of two. What is your first month?`,
      a:`Do not reforecast from opinion. Instrument: track the next four weeks of actual completion against the plan, pick two representative items and decompose them properly, and look for work the plan does not contain at all. Then present the evidence with a range and the specific assumptions that were wrong, plus a scope proposal, not just a longer date.`,
      follow:`Leadership rejects the new forecast. What do you do with the evidence?`,
      red:`Announces the plan is wrong in week one with a new number and no evidence for it.` },
    { q:`How do you estimate work that is fundamentally iterative, like making the combat feel good?`,
      a:`You cannot estimate it to completion, so you bound it instead. Fix the number of iterations and the review points, define what good enough means in observable terms, and ship the best version at the deadline. Estimate the machinery, which is the build, the tuning tools and the test loop, because that part is real work with a real size.`,
      follow:`At the last review it is still not good enough. What happens?`,
      red:`Puts a date on when the game will be fun.` }
  ] });

T('pm-risk',{ d:'management', t:'Risk registers and de-risking order', tag:'A risk with an owner, a signal and a contingency is a plan. A risk in your head is a worry.',
  what:`The register: things that could cost the project time, quality or the game itself, each with a rough likelihood and impact, an owner, an early warning signal, a mitigation that shrinks it and a contingency for when it lands anyway. The ordering matters more than the list. The real question is which risk is being retired this month and what the cheapest experiment would be.`,
  why:[`Projects fail on assumptions nobody tested, and an assumption with a name on a list gets tested.`,`A risk with no owner belongs to everyone and is handled by no one.`,`What a risk costs is decided by when you find out, not by whether it happens.`,`Mitigation and contingency are different budgets. Confusing them leaves you holding neither.`],
  think:{ q:[`What has to be true for this plan to work, and which of those is still unverified?`,`What is the cheapest thing that would show us this is false?`,`Who owns this risk, and what signal tells them it is arriving?`,`Is this risk being retired, accepted, or quietly carried?`,`How long does the contingency take to execute? A six-week fallback is not a fallback in week fourteen.`,`Where do two unproven things meet, and how late is that meeting scheduled?`],
    trade:[`Retiring a risk early costs time you would rather spend on features and buys information you cannot buy later.`,`A long register is complete and stops being read. A short one is read and misses things.`],
    traps:[`A register written at kickoff and never opened again.`,`Entries with no owner and no trigger, which cannot be acted on.`,`Treating platform certification, store review and legal as paperwork rather than schedule risk.`,`Mixing issues into the register. An issue already happened and belongs in the plan.`,`Grading everything high, which is the same as grading nothing.`,`Scheduling the integration of two risky systems as the final task.`],
    good:[`Every live entry has an owner, a signal and a review date.`,`Retired risks are closed out loud, with the evidence that closed them.`],
    bad:[`The riskiest system is also the most fun one, so it is being built last.`,`Nobody can say what would make us change the plan.`] },
  how:[`Write each entry as: if X happens then Y, because Z. Vague entries cannot be owned or triggered on.`,`Score likelihood and impact roughly and use the score only to sort, never as a number to report.`,`Give each live entry an owner, an early signal and a review date.`,`Order the work so the highest-impact unknowns are exercised first, even when they are not the most enjoyable to build.`,`Spend spikes on information rather than progress. A spike that produces a decision has succeeded with nothing merged.`,`Keep the mitigation budget separate from the contingency budget and say which one you are spending.`,`Close entries explicitly. A risk that no longer applies should be retired with the evidence attached.`],
  ai:{ yes:[`Draft a first register from a plan, including the risks this kind of project usually carries.`,`Propose the cheapest experiment that would falsify a named assumption.`,`Scan a schedule for places where two unproven things are integrated late.`],
       no:[`Decide the team's appetite for a risk.`,`Accept a risk or assign an owner on the team's behalf.`] },
  prompts:[{l:'Register draft',p:`Here is our plan, team, technology and platform targets: [CONTEXT]. Draft a risk register. Write each entry as "if X happens then Y, because Z", with a rough likelihood and impact, the earliest observable signal, a mitigation, and a contingency including how long it takes to execute. Then list separately the risks typical for this kind of project that our plan does not mention.`},{l:'Cheapest falsifier',p:`Our plan assumes: [ASSUMPTION]. Propose three experiments that would show it is false, ordered by cost in engineer-days. For each, say what result retires the risk, what result kills the plan, and what result would be ambiguous. Recommend one and say what it does not cover.`}],
  verify:[`Does every entry have an owner and an observable signal?`,`Is the contingency executable inside the time that will remain?`,`Are issues masquerading as risks on this list?`],
  test:[`Review the register monthly and measure how many entries changed state. A register where nothing moves is not being used.`,`Ask which risk this month of work retired. If the answer is none, the order is wrong.`,`After each surprise, check whether it was on the list. Repeated misses mean the register is written from the wrong vantage point.`],
  rel:[['risk-and-dependencies','The design-side view of the same discipline: which assumption the project is betting on.'],['planning-and-milestones','Milestone order should be risk order, and the register is what makes that arguable.'],['pm-estimation','The widest estimate and the top risk are usually the same item.'],['pm-qa-release','Release gates are mitigations with a pipeline attached.'],['lead-incidents','A risk that lands becomes an incident, and the incident feeds the register back.']] });
INTERVIEW('pm-risk',{
  junior:[
    { q:`You spot a technical risk nobody else has mentioned. What do you do with it?`,
      a:`Write it in the form: if X happens then Y, because Z. Bring it with the cheapest check that would confirm or eliminate it, and an estimate of what it costs if it lands late versus now. Take it to whoever can decide, and do not wait for a formal process to exist.`,
      follow:`Nobody picks it up. What is your next move?`,
      red:`Mentions it once in chat and considers it handled.` },
    { q:`What is the difference between a risk and an issue?`,
      a:`A risk has not happened yet and has a probability, an owner and a mitigation. An issue has happened and needs a plan and a date. Mixing them makes the register useless, because an issue in the register looks like something still being watched rather than something being fixed.`,
      follow:`A risk you listed just occurred. What changes in your tracking?`,
      red:`Treats the register as a bug list.` }
  ],
  mid:[
    { q:`How do you decide what to build first on a new project?`,
      a:`Risk order, not feature order. List what has to be true for the plan to work, mark the unverified ones, and rank by impact if false. Build the cheapest thing that exercises the highest-impact unknown, end to end and ugly. Retire the risk with evidence, then move to the next one.`,
      follow:`The riskiest thing is also the least fun to build, and the team wants to start with the fun part. How do you handle that?`,
      red:`Starts with whatever is best specified, or leaves integration risk until the end.` },
    { q:`Give me an example of a risk you retired with a spike. What did the spike produce?`,
      a:`Name the question, the budget and the outcome. A good answer ends in a decision and a written note, not merged code. Say what would have happened if the spike had not been run, and how the answer changed the plan.`,
      follow:`What would you have done if the spike had run out of time with no answer?`,
      red:`Describes a spike that turned into the real implementation and was never evaluated.` },
    { q:`What risks do people systematically forget on a game project?`,
      a:`The ones without an engineering face: platform certification, store review windows, third-party SDK deprecations, localisation lead time, legal and rating review, key-person dependency, and the integration of two systems that are each fine alone. Also the risk that the game is not fun, which is the only one that cannot be mitigated by scheduling.`,
      follow:`How would you put the not-fun risk into the register in a way that can be acted on?`,
      red:`Lists only technical risks, and treats certification as paperwork.` }
  ],
  senior:[
    { q:`How do you run a risk register that people actually use?`,
      a:`Keep it short and live. Every entry has an owner, an observable early signal and a review date. Sort by impact and use the scores only for ordering. Review it monthly and require that entries change state. Close retired risks out loud with the evidence. A register where nothing moves is not being used, and it is better to delete it than to pretend.`,
      follow:`Your register has forty entries and nobody reads it. What do you cut and what do you keep?`,
      red:`Describes a spreadsheet maintained for a stakeholder, with no review cadence.` },
    { q:`The team is six weeks from launch and a core system may not hold up under real load. How do you handle it?`,
      a:`Separate mitigation from contingency. Mitigation is what shrinks the chance, such as a load test this week against realistic data. Contingency is what happens if it fails, and it must fit in the remaining time: a capacity cap, a queue, a staged rollout, a region-limited launch. Decide the trigger and who pulls it before launch night, not during.`,
      follow:`The contingency degrades the experience. Who decides to use it, and when do you tell the players?`,
      red:`Plans only the fix and has no fallback that fits in six weeks.` }
  ] });
DIAGRAM('pm-risk', { kind:'quad', title:'Likelihood by impact: where each risk sits',
  x:'Likelihood', y:'Impact',
  points:[{t:'Core loop is not fun', x:0.45, y:0.86},{t:'Certification slips', x:0.72, y:0.62},{t:'Key engineer leaves', x:0.25, y:0.72},{t:'Art style changes', x:0.3, y:0.3},{t:'Server costs spike', x:0.78, y:0.36}],
  q:['Plan a contingency','Act now','Accept and watch','Reduce the odds'] });

T('pm-agile-gamedev',{ d:'management', t:'Sprints, kanban and content-heavy teams', tag:'Process is overhead you choose on purpose. Pick the smallest one that answers what ships this week and who is blocked.',
  what:`Which working rhythm fits which kind of work. Sprints suit work that can be committed to two weeks ahead. A flow with explicit limits suits arriving work, content production and live-ops. Most game teams are both at once, plus a director who changes their mind after playing the build, which is not a process failure but the reason the build exists.`,
  why:[`Content work and systems work have different cost curves, so one cadence over both hides both.`,`A sprint renegotiated every three days is a queue with ceremony bolted on.`,`Iteration on feel cannot be committed to in advance. Reserving capacity for it is the honest version.`,`A team that cannot say what is blocked discovers it at the milestone.`],
  think:{ q:[`Is this work arriving or planned? Arriving work belongs in a flow, planned work in a commitment.`,`What is the limit on work in progress, and what happens when it is reached?`,`Where does feedback from playing the build enter the plan?`,`How much capacity is reserved for bugs, support and iteration, and is that measured or hoped?`,`Can a designer or artist read this board without an engineer translating it?`],
    trade:[`Commitment buys predictability and punishes the discovery that a feature is not fun.`,`Flow absorbs arriving work and makes forecasting harder. Ceremony buys shared context and costs a morning a week.`],
    traps:[`Estimating content tasks in the same points as systems work.`,`Sprint goals that are lists of tickets instead of one demonstrable outcome.`,`No limit on work in progress, so ten things sit at eighty percent.`,`Retro actions with no owner.`,`Velocity treated as a target instead of an observation.`,`A board engineering reads and no other discipline opens.`],
    good:[`The sprint goal is one sentence someone can demo.`,`Blocked work is visible with who is blocking and since when.`],
    bad:[`Every sprint ends with carryover and nobody treats that as information.`,`Process changes every month, so no change is ever evaluated.`] },
  how:[`Choose the unit of commitment per group: a sprint goal for systems work, a limited flow for content and live-ops.`,`Write the sprint goal as an outcome someone outside the team can watch happen.`,`Set a limit on work in progress and enforce it by finishing rather than starting.`,`Reserve a measured fraction of capacity for bugs, support and iteration, and adjust it from last month actuals.`,`Keep a blocked column with the blocker named and the date it blocked.`,`Run the review on the build, not on slides. The demo is the status report.`,`Change one process thing at a time and hold the change for a month before judging it.`],
  tech:[
    { n:'Sprint with a goal', how:`Fix a two-week scope around one demonstrable outcome, review on the build, retro on the process.`, fit:`Systems and feature work where two weeks of certainty is realistic.`, cost:`Interrupts badly, and a mid-sprint direction change wastes the commitment.`, alt:`A pure flow, which absorbs change and forecasts worse.` },
    { n:'Kanban with limits', how:`Continuous queue, an explicit limit per column, pull when a slot frees, measure cycle time instead of velocity.`, fit:`Content production, live-ops, bug streams, anything that arrives rather than being planned.`, cost:`No natural rhythm for review or alignment, so both must be scheduled separately.`, alt:`Sprints, which supply rhythm and fight the arrival pattern.` },
    { n:'Split cadence', how:`Engineering runs sprints, content and live-ops run a limited flow, one shared review on the build joins them.`, fit:`Mixed teams where a single cadence has been failing half the group.`, cost:`Two systems to maintain and a seam that needs an owner.`, alt:`One cadence for everyone, which is simpler and makes one half lie about their work.` }],
  ai:{ yes:[`Summarise a board into what is blocked, what is stale and what is sitting at eighty percent.`,`Draft a sprint goal sentence from a set of tickets and point out which tickets do not serve it.`,`Turn a retro transcript into owned actions with dates.`],
       no:[`Decide the team capacity.`,`Judge whether a person is underperforming from ticket throughput.`] },
  prompts:[{l:'Board health',p:`Here is our board with dates, owners and column history: [DATA]. Report items in progress longer than the median, items with no owner, items blocked with no named blocker, and how much of the sprint scope arrived after it started. Then name the single change most likely to reduce carryover, and what that change costs.`},{l:'Cadence fit',p:`Here is how our work arrives and who does it: [TEAM, WORK MIX]. Recommend a cadence per group, saying what is committed, what flows, and where the two meet. Give the failure mode of your recommendation and the signal that would tell us it is failing.`}],
  verify:[`Does the sprint goal describe an outcome rather than a ticket list?`,`Is reserved capacity based on measured history?`,`Is there a limit on work in progress that someone actually enforces?`],
  test:[`Measure cycle time from start to done rather than velocity. Cycle time exposes the eighty-percent pile.`,`Measure carryover per sprint and the share of scope that arrived after the sprint began.`,`Review the last three retro actions. Unowned actions mean the retro is theatre.`],
  rel:[['team-and-collaboration','Cadence is the process expression of who owns which decision.'],['iteration-and-evidence','Whatever the cadence, the review has to happen on the build.'],['pm-cross-discipline','A cadence that fits engineering and breaks content is a handoff problem wearing a process costume.'],['pm-estimation','The cadence decides whether you estimate items or count throughput.'],['pm-qa-release','A release train is a cadence with gates attached.']] });
INTERVIEW('pm-agile-gamedev',{
  junior:[
    { q:`What do you actually do in a stand-up?`,
      a:`Say what changed since yesterday, what you are doing today, and what is blocking you or about to. It is a synchronisation, not a status report to a manager. If something is blocked, name the person or thing blocking it and take the detail out of the meeting.`,
      follow:`You have been blocked for two days and said nothing. What should have happened on day one?`,
      red:`Recites yesterday's ticket list and never says the word blocked.` },
    { q:`Your sprint work is done on Wednesday. What do you do?`,
      a:`Pull the next item that helps the sprint goal, not the one that interests you most. Better still, look for something in progress that could be finished with help, because finishing beats starting. If nothing serves the goal, ask, and use the time on tests, tooling or debt that the team has already agreed on.`,
      follow:`Everything left is blocked. Now what?`,
      red:`Starts a private refactor nobody asked for and nobody can review.` }
  ],
  mid:[
    { q:`Your team keeps carrying half the sprint over. What do you investigate?`,
      a:`Look at three things in order: how much scope arrived after the sprint started, how many items are in progress at once, and whether the items were sized honestly. Carryover is usually too much work in progress and unplanned arrival, not laziness. Fix by limiting work in progress and reserving measured capacity for arriving work.`,
      follow:`After the fix, carryover halves but the team says they feel slower. What is happening?`,
      red:`Proposes tighter estimates or longer hours.` },
    { q:`Would you run content production on the same sprint cadence as engineering?`,
      a:`Usually not. Content arrives as a stream and is sized differently, so a flow with explicit limits and a cycle-time measure fits better. Keep one shared review on the build so the two groups stay aligned. Running one cadence over both hides whichever one it fits worse.`,
      follow:`Where do the two cadences meet, and who owns that seam?`,
      red:`Applies one process everywhere because consistency looks tidier.` },
    { q:`The director keeps changing direction after playing the build. Is that a process failure?`,
      a:`No, that is the process working. The build is the evidence. What needs fixing is the commitment structure: reserve capacity for iteration, keep sprint goals as outcomes rather than ticket lists, and make the cost of each change visible so direction changes are informed rather than free.`,
      follow:`How do you make the cost visible without sounding like you are resisting the change?`,
      red:`Wants to lock the design so the plan stays intact.` }
  ],
  senior:[
    { q:`You join a team with heavy ceremony and low output. What do you change first?`,
      a:`Measure before cutting. Find the actual cycle time and where items wait. Usually the waiting is at review, QA or a blocked seam, not in the meetings. Remove one ceremony at a time, keep the one that produces shared context on the build, and hold each change for a month so you can tell whether it helped.`,
      follow:`Removing the ceremony made alignment worse. How do you get it back without the meeting?`,
      red:`Deletes all process on day one, or adds a new framework.` },
    { q:`How do you measure a team without turning the measurement into a target?`,
      a:`Measure the flow, not the people: cycle time, carryover, unplanned arrival, escaped defects, time from merge to a playable build. Report them as questions to investigate rather than scores. Never use velocity for comparison between teams or in a performance review, because the moment it is a target the number stops describing reality.`,
      follow:`Leadership asks you for a productivity number per engineer. What do you give them?`,
      red:`Reports velocity as productivity.` }
  ] });

T('pm-cross-discipline',{ d:'management', t:'Cross-discipline handoffs and dependencies', tag:'Most delay is not in the work. It is in the gap between two people who each believe the other is next.',
  what:`How work moves between engineering, design, art, audio, QA and localisation: what artifact each seam produces, what ready means on both sides of it, and how to avoid the pattern where a feature is finished three times because the first two versions were not what was needed. Tooling belongs here, because the fastest handoff is the one that no longer happens.`,
  why:[`A feature is not done when the code compiles. It is done when the content it needs exists and is in the build.`,`Every handoff is a translation, and translations lose intent unless an artifact carries it.`,`Blocked work is invisible to the person who is not blocked by it.`,`A tool is dependency removal. A week of tooling can delete a recurring engineer-shaped bottleneck for the rest of the project.`],
  think:{ q:[`What does the next person need from me, in what form, and by when?`,`Is this a handoff or a collaboration? A handoff needs an artifact, a collaboration needs a room.`,`What does ready mean on each side of this seam, and have both sides said it out loud?`,`Which requests reach engineering that could be a tool instead?`,`Who reviews a piece of content against the design intent, and does that happen before it is polished?`],
    trade:[`Strict handoff artifacts prevent rework and slow the first version down.`,`Building the tool costs weeks now and removes a dependency for the rest of the project.`],
    traps:[`Passing a feature to art with no reference and no constraints, then rejecting the result.`,`Data entry only an engineer can perform.`,`QA receiving a build with no note about what changed.`,`Placeholder content that ships because nobody owned the replacement.`,`A design change made after the animation was authored, with the cost absorbed silently.`,`Localisation treated as a final step rather than a constraint on layout, fonts and string assembly.`],
    good:[`Each seam has a named artifact and a named owner on both sides.`,`A missing reference fails loudly at load time instead of producing a silent nothing.`],
    bad:[`Two disciplines each waiting for the other, both reporting themselves unblocked.`,`Every balance change needs an engineer.`] },
  how:[`Name the artifact for each seam: a spec, a reference sheet, a data table, a test plan, a string table.`,`Agree a definition of ready and a definition of done per discipline pair, and write it where both sides see it.`,`Front-load the constraints art and audio need: budgets, dimensions, naming, import settings, loudness.`,`Give designers direct edit access to the values they tune. Engineers own the schema, designers own the numbers.`,`Ship the tool with the system rather than after it.`,`Make missing wiring fail fast. A required reference left unset should stop the scene with a clear message, not degrade into nothing anyone notices.`,`Review content against intent early, while changing it is still cheap.`,`Track blocked time per seam and fix the worst seam each milestone.`],
  ai:{ yes:[`Draft the handoff artifact for a seam: what a spec, a reference sheet or a test plan must contain for this work.`,`Turn a design change into the list of disciplines it touches and the assets it invalidates.`,`Write the schema and validation rules for a data table designers will edit.`],
       no:[`Judge whether art matches the intended direction.`,`Decide which discipline absorbs a late change.`] },
  prompts:[{l:'Seam map',p:`Here are our disciplines, the current pipeline and a recent feature that was reworked: [CONTEXT]. Map every handoff in that feature. For each seam give the artifact, the definition of ready, the owner on each side, and where intent was most likely lost. Rank the seams by how much rework they caused, and propose one tool that would remove the worst one.`},{l:'Change blast radius',p:`We are considering this design change: [CHANGE]. Our content pipeline and asset types are: [PIPELINE]. List what it invalidates per discipline: assets, animations, data, strings, tests, tutorials. Give the order the work must happen in, and what can proceed in parallel.`}],
  verify:[`Does every seam name an artifact rather than a conversation?`,`Is the definition of ready written where the upstream discipline reads it?`,`Does a missing piece of wiring fail loudly?`],
  test:[`Measure blocked days per seam for one milestone. The worst seam is the next tool you build.`,`Count how many pieces of content came back for rework, and at which stage the intent was lost.`,`Ask a designer to change a balance value without an engineer. Time it.`],
  rel:[['team-and-collaboration','Ownership of decisions is what makes a handoff artifact meaningful.'],['design-documents','The artifact at a seam is usually a document doing a specific job.'],['pm-agile-gamedev','A seam that jams shows up first as carryover on the board.'],['pm-qa-release','QA is a seam like any other and needs its artifact with every build.'],['lead-conventions','Written conventions are what stop each seam being renegotiated per feature.']] });
INTERVIEW('pm-cross-discipline',{
  junior:[
    { q:`A designer asks you to change a balance value. What is the better long-term answer?`,
      a:`Change it now if it is urgent, then ask why an engineer was needed at all. If it happens more than twice, the value belongs in data the designer can edit, with a schema you own and validation that rejects nonsense. The goal is to remove yourself from the loop, not to be reliably available.`,
      follow:`What stops a designer breaking the game once they can edit those values directly?`,
      red:`Takes pride in being the person every tuning change goes through.` },
    { q:`You are handed a feature spec with no art or audio attached. What do you do before starting?`,
      a:`Find out what the missing pieces are and who owns them, and agree the form they will arrive in: dimensions, naming, import settings, timing. Build against a placeholder that fails loudly if it is still there at integration. Then tell the art owner the date you need it, not the date it is due.`,
      follow:`The asset arrives in the wrong format two days before the milestone. What went wrong earlier?`,
      red:`Starts building and discovers the constraints at integration.` }
  ],
  mid:[
    { q:`A feature came back for rework three times. How do you diagnose that?`,
      a:`Map the seams the feature crossed and find where intent was lost. Usually one seam had no artifact: a spec that was a conversation, a reference that was a mood, a test plan that did not exist. Fix that seam by naming the artifact and the definition of ready on both sides, then check whether the same seam caused the last three reworks too.`,
      follow:`The seam is between design and art, and neither reports to you. How do you change it?`,
      red:`Concludes the designer changed their mind and leaves it there.` },
    { q:`How do you decide whether to build a tool or keep doing the work by hand?`,
      a:`Count the recurrence and who is blocked. A task done once is manual. A task done weekly by a non-engineer who has to wait for an engineer is a tool. Compare the tool cost against the blocked days it removes over the remaining project, and include the second-order effect that designers iterate more when they do not have to ask.`,
      follow:`The tool would take three weeks and the project has four months left. Do you build it?`,
      red:`Builds tools by preference or refuses them by policy, with no measurement either way.` },
    { q:`How should a missing reference behave when an artist forgets to wire it?`,
      a:`It should fail immediately and say what is missing and where. Silent fallbacks mean the bug is found by QA three weeks later, or by a player. Missing wiring is broken setup, not a runtime condition to be handled. The check belongs at load or at validation time, so the person who broke it is still the person looking at it.`,
      follow:`Where would you put that check so it fires before the build is even made?`,
      red:`Adds a null check that silently does nothing, and the feature appears to work.` }
  ],
  senior:[
    { q:`Engineering and content are constantly blocking each other. How do you unpick it?`,
      a:`Measure blocked days per seam for one milestone rather than arguing from anecdote. Then attack the worst seam with one of three tools: an artifact that carries intent, a definition of ready both sides signed, or a tool that removes the dependency. Fix one seam per milestone and measure again, because fixing the wrong seam moves the queue rather than shortening it.`,
      follow:`After you fix the worst seam, the delay simply moves to the next one. Is that a failure?`,
      red:`Reorganises the team structure before knowing where the time actually goes.` },
    { q:`How do you keep localisation from becoming a launch emergency?`,
      a:`Treat it as a constraint from the first UI screen, not as a step. No concatenated strings, no text baked into textures, layouts that survive longer words, a string table with context for the translators, and a pseudo-localised build running in CI so overflow is caught the day it is introduced. Then put the translation lead time into the calendar as a fixed block.`,
      follow:`A late design change adds forty strings two weeks before submission. What are the options?`,
      red:`Plans to send the strings out at the end and hope.` }
  ] });

T('pm-qa-release',{ d:'management', t:'QA planning, build health and release trains', tag:'Ship on a rhythm the team can rehearse. A release should be boring, and boring is built from gates rather than heroics.',
  what:`The path from a merged change to something a player runs: what gets tested and by whom, which gates block, how the build is produced and versioned, and the cadence that turns releasing from an event into a habit. A release train has a fixed departure time. Whatever is ready and green goes, whatever is not waits for the next train.`,
  why:[`Deadline-driven releases concentrate the most dangerous changes at the worst moment.`,`A gate that blocks everything gets switched off within a month. A gate that never blocks is decoration.`,`Without a cheap verification ladder people either run nothing or run the twenty-minute build to check a typo.`,`A schema change and the code that uses it fail in different ways. Bundling them removes the option to roll back one of them.`],
  think:{ q:[`What must be true for this build to go out, and which of those is checked automatically?`,`Which failures should stop the train, and which should be reported and triaged?`,`Can we roll back, and has anyone actually done it this quarter?`,`What is the cheapest check that would have caught the last three escapes?`,`Who is allowed to ship with a known defect, and is that written down?`,`Does this test still pass when the input is deliberately wrong?`],
    trade:[`A strict gate protects players and blocks the team at midnight.`,`Frequent small releases lower the risk per release and raise the total release overhead.`],
    traps:[`One pipeline stage that treats a formatting violation and a corrupted data table as the same severity.`,`A config test that would pass with any config. Without a deliberately broken input that must fail, it tests nothing.`,`Manual release steps that live in one person's head.`,`A migration merged together with the feature, so neither can be reverted alone.`,`Test plans written after the feature is built.`,`Certification and store review budgeted as zero days.`],
    good:[`The check ladder is written down cheapest first, each step labelled with what it costs in minutes.`,`Every release is the same rehearsed procedure, whoever is running it.`],
    bad:[`Green pipeline, broken build, because the expensive check only runs nightly and nobody reads it.`,`Only one person can produce a release build.`] },
  how:[`Write the ladder of checks from cheapest to most expensive and label each step with its real cost. People choose correctly when the price is visible.`,`Grade pipeline failures: blocking, warning, informational, and make the output say which one this is.`,`Put a negative control in every config or data test. If the test cannot fail on a deliberately broken input, it is not a test.`,`Separate migration changes from code changes so each can be reverted on its own.`,`Fix a departure time. Ready and green departs, everything else waits for the next train.`,`Rehearse the rollback on a real build before you need it.`,`Give QA the change list and the risk areas with every build, not just the binary.`,`Keep a known-defect list the whole team can read, with the name of whoever accepted each one.`],
  ai:{ yes:[`Draft a test plan for a feature from its spec, including the negative cases and the deliberately broken inputs.`,`Cluster crash reports and pipeline failures into likely common causes.`,`Turn a change list into the risk areas QA should exercise first.`],
       no:[`Decide what ships with a known defect.`,`Confirm a build is good without a human running it.`] },
  prompts:[{l:'Gate design',p:`Here are our pipeline stages with their durations and failure rates, and the last five bugs that reached players: [CONTEXT]. Propose which stages should block, which should warn, and which should be informational only. For each of the five escapes, name the cheapest gate that would have caught it and whether we have that gate. Flag any check that would pass even on a deliberately broken input.`},{l:'Test plan with negatives',p:`Here is the feature spec and the data it reads: [SPEC]. Write a test plan with: the happy path, the boundary cases, the broken-data cases that must fail loudly, and the regression areas this change touches. Mark which cases are automatable and which need a human with the build.`}],
  verify:[`Does each check say what it costs and whether it blocks?`,`Is there a case that must fail, and does it fail today?`,`Can the release be produced and rolled back by two different people?`],
  test:[`Measure the time from merge to a build a tester can run. The whole team lives inside that loop.`,`Review every escape: name the cheapest gate that would have caught it and whether that gate exists.`,`Count how often the train departs on schedule. A train that always slips is a deadline with extra ceremony.`],
  rel:[['quality-and-build-health','Build health is the daily version of this. The release train is its schedule.'],['playtesting','Tests need a build that reaches the thing being tested, and so do players.'],['infra-ci-pipelines','The gates and their grading live in the pipeline.'],['pm-liveops-cadence','A live game runs the same train, only it never stops.'],['pm-risk','Gates are mitigations, and the known-defect list is accepted risk.']] });
INTERVIEW('pm-qa-release',{
  junior:[
    { q:`What do you do before you ask for review on a change?`,
      a:`Run the cheap checks yourself: build, the tests near what you touched, and the actual feature in the build. Then write what you did and what you saw. The reviewer should be reading evidence, not guessing whether it was tried. If something is unverified, say which part and why.`,
      follow:`Running the full suite takes twenty minutes. What do you run and what do you skip?`,
      red:`Pushes and waits for the pipeline to tell them whether it compiles.` },
    { q:`How do you write a bug report a tester or a teammate can act on?`,
      a:`Build identifier, steps from a known state, what you expected, what happened, how often, and what changed recently in that area. Attach the log and the save if there is one. Say whether it blocks testing of something else, because that is what decides its priority more than severity does.`,
      follow:`It only reproduces one time in ten. How do you report it so it is still actionable?`,
      red:`Reports the symptom with no build identifier and no steps.` }
  ],
  mid:[
    { q:`How would you design the check ladder for a team that keeps skipping tests?`,
      a:`Make the cost visible. List the checks from cheapest to most expensive with the minutes each one takes, and say what each one catches. People skip checks when they cannot tell which one is worth it. Put the fast ones in the local loop, the medium ones on the pull request, and the slow ones on the train, and make the pipeline say which grade a failure is.`,
      follow:`Which failures should block a merge and which should only warn?`,
      red:`Adds a mandatory twenty-minute pipeline and blames the team for working around it.` },
    { q:`A config test has passed for a year. How do you know it tests anything?`,
      a:`Feed it a deliberately wrong config and require that it fails. A test with no negative control can be structurally incapable of failing, and it will still look green forever. Add the broken case as a permanent test so the day someone loosens the validation, the negative case goes red.`,
      follow:`Where else does this pattern hide?`,
      red:`Trusts a green result because it has been green for a long time.` },
    { q:`Would you merge a schema migration in the same change as the code that uses it?`,
      a:`No. Keep them separate so each can be reviewed and reverted alone. A migration is usually irreversible in practice and reviewed by different eyes. Ship the migration first, deploy it, confirm it, then ship code that reads the new shape while still tolerating the old one. That is also what makes a rollback possible at all.`,
      follow:`What does the code have to do during the window where both shapes exist?`,
      red:`Bundles them and describes the rollback as reverting the commit.` }
  ],
  senior:[
    { q:`How do you set up a release train for a team that currently ships whenever something is ready?`,
      a:`Pick a departure time and hold it. Define what green means and write the go and no-go criteria before the first train. Rehearse the rollback on a real build. Publish the known-defect list with who accepted each item. Let the first few trains leave partly empty, because the value is in the rhythm being believable, not in the payload.`,
      follow:`A critical feature misses the train by two hours. Do you hold it?`,
      red:`Makes the train slip whenever something important is not ready, which is just deadlines again.` },
    { q:`Players found three bugs last month that QA did not. How do you respond?`,
      a:`For each escape, name the cheapest gate that would have caught it and whether that gate exists. Group them: missing test, test that cannot fail, area nobody owns, or a device or configuration nobody runs. Add one gate per class, not one test per bug. Then measure escapes per release so you can tell whether the gates worked.`,
      follow:`Two of the three were on a device you do not own. What do you actually do about that?`,
      red:`Writes one regression test per bug and calls the process fixed.` }
  ] });

T('pm-liveops-cadence',{ d:'management', t:'Live-ops cadence and release calendars', tag:'A live game runs on a calendar. The calendar is a promise about capacity made months before the capacity exists.',
  what:`The rhythm of a game that is already running: events, seasons, balance patches, client updates, master data pushes and maintenance windows, planned far enough ahead that authoring, QA, store review and localisation all fit. The lead's half of it is capacity and safety, which means deciding what can change without a client build and what can be switched off without a deploy.`,
  why:[`Store review and platform certification add fixed days you do not control.`,`A calendar announced to players cannot be renegotiated quietly.`,`Teams burn out on cadence long before they burn out on any single feature.`,`Whether a change is data, a server deploy or a client build decides whether a mistake costs an hour or a week.`],
  think:{ q:[`What can we change with data alone, and does the shipped client already carry the switch?`,`How many weeks ahead must content be final to clear review, localisation and QA?`,`What is the maintenance window, and what does a player see during it?`,`Which events are load bearing for revenue, and what is the fallback if one is not ready?`,`Can we turn this off without a deploy?`,`What timezone is this calendar expressed in, and does the server agree?`],
    trade:[`A dense calendar holds players and consumes every hour that would have paid down debt.`,`Server-driven content is flexible and moves the failure out of store review and into your own data.`],
    traps:[`A seasonal calendar extrapolated from the team's best month.`,`Events whose content is authored the week they launch.`,`No kill switch, so a broken event needs an emergency client build.`,`Force update used casually, which teaches players to dread every patch.`,`Master data pushed without a staging pass because it is only data.`,`A calendar that ignores public holidays in the markets it runs in.`],
    good:[`Three cycles visible at once: the one running, the one in QA, the one being authored.`,`Every event has an owner, a switch and a rollback.`],
    bad:[`Every event launch is an all-night watch.`,`Nobody can say what the next four weeks contain without asking three people.`] },
  how:[`Plan two cycles ahead of the one that is live and keep all three visible.`,`Put certification, store review, localisation and a buffer into the calendar as fixed blocks, not as optimism.`,`Decide per change whether it is a data push, a server deploy or a client update, and design features so most changes are the first.`,`Ship every event behind a switch and a schedule the server owns.`,`Write the maintenance and force-update policy: when each is allowed, how much notice players get, what compensation follows.`,`Stage master data the way you stage code, with a review and a dry run against production-shaped data.`,`Measure sustainable throughput over a quarter and build the next calendar from the measurement.`,`Keep one quiet week per cycle for debt, tooling and the things that broke.`],
  ai:{ yes:[`Turn a target calendar into the authoring, QA and review deadlines each item implies.`,`Draft the checklist for an event launch and the rollback steps for each stage.`,`Compare planned cadence against measured throughput and name what will not fit.`],
       no:[`Decide what the players are promised.`,`Judge whether the team can sustain a pace it has not yet run.`] },
  prompts:[{l:'Backwards calendar',p:`Here is the live calendar we want and our pipeline steps with their durations: [CALENDAR, PIPELINE]. Work backwards from each launch date to the authoring, localisation, QA, review and submission deadlines. Mark every item whose deadline is already in the past and every week where two deadlines collide. Then say which items could become data-only changes.`},{l:'Switch audit',p:`Here are the features and events currently live or planned: [LIST]. For each one say whether it can be disabled without a client build, whether its schedule is server-owned, and what a player sees when it is turned off mid-session. List the ones where the only remedy is an emergency release.`}],
  verify:[`Is every launch backed by finished content at least one cycle earlier?`,`Does each item say data, server or client?`,`Can each event be switched off without shipping anything?`],
  test:[`Measure planned against delivered items per cycle for a quarter. Build the next calendar on the delivered number.`,`Review each emergency release: what would have made it a data change instead?`,`Track how often maintenance and force update are used. Both are budgets, and both get spent.`],
  rel:[['live-operations','The design side of running a live game. This is the calendar and the capacity it costs.'],['metrics-and-success','Each event should have a signal and a decision attached before it launches.'],['server-liveops','Switches, schedules, master data and maintenance gates are what the calendar runs on.'],['pm-qa-release','A live game is a release train that never stops departing.'],['pm-postmortems','Each cycle ends with the review that shapes the next calendar.']] });
INTERVIEW('pm-liveops-cadence',{
  junior:[
    { q:`What is the difference between a data push, a server deploy and a client update?`,
      a:`Data changes values the running game already knows how to read. A server deploy changes server behaviour and is under your control with a rollback. A client update has to pass store review and reach players who may not take it. Cost and recovery time grow at each step, so features should be designed so most changes stay at the first.`,
      follow:`A value you need to change is compiled into the client. What are your options this week?`,
      red:`Treats all three as deploys of equal risk.` },
    { q:`You are adding a new event feature. What do you include so it can be run safely?`,
      a:`A switch that disables it without a deploy, a schedule the server owns rather than the device clock, and behaviour defined for a player who is mid-session when it ends. Plus logging that says which players saw it. Without those, running the event needs an engineer awake at the time it starts.`,
      follow:`The player is in a match when the event ends. What happens?`,
      red:`Ships an event whose only off switch is a new client build.` }
  ],
  mid:[
    { q:`How far ahead should live content be finished, and why?`,
      a:`Work backwards from the launch date through submission, store review, QA, localisation and authoring, and add a buffer. In practice that usually puts final content one full cycle ahead of its launch. The point is to be running one cycle, testing the next and authoring the one after that, so a single bad week does not hit players.`,
      follow:`You are one cycle behind and authoring the event that launches next week. How do you recover?`,
      red:`Plans to finish content the week it ships and treats review time as zero.` },
    { q:`How do you decide when a force update is justified?`,
      a:`Write the policy before you need it. Force update is for security, data corruption, a server contract the old client cannot honour, or a legal requirement. Not for content. Each use spends player goodwill and drops some of the audience, so it needs a named approver and advance notice. Design the client to tolerate old versions so the choice stays rare.`,
      follow:`A content bug is costing revenue and the fix is client side. Does that change your answer?`,
      red:`Force updates routinely because it keeps the client population tidy.` },
    { q:`Master data is only data. Why stage it?`,
      a:`Because it is executable in effect. Wrong numbers change the economy, wrong ids crash clients, and a broken table reaches every player at once with no build to roll back. Stage it against production-shaped data, diff it against what is live, require a review from someone who did not author it, and keep the previous version one command away.`,
      follow:`What would you check automatically on every master data push?`,
      red:`Pushes data straight to production because it is faster.` }
  ],
  senior:[
    { q:`How do you plan a year of live-ops without burning out the team?`,
      a:`Build the calendar from measured throughput over the previous quarter, not from the best month. Put certification, holidays and localisation in as fixed blocks. Keep one quiet week per cycle for debt and tooling and defend it. Design so most changes are data, because that is what lets a small team sustain a dense calendar. And decide in advance which events are droppable.`,
      follow:`Revenue targets require more events than the measured throughput supports. What do you say?`,
      red:`Commits to the calendar and plans to hire later.` },
    { q:`An event goes live with broken rewards on a Saturday. Walk me through the hour.`,
      a:`Stop the bleeding first: disable with the switch, which should not need a deploy. Communicate to players early with plain language and a next update time. Preserve the data to know who was affected. Fix forward or roll back the data, and only then decide compensation, which is a product decision with a named owner. The review afterwards asks why the switch and the staging gate did not catch it.`,
      follow:`Compensation costs real money and the owner is unreachable. What do you do?`,
      red:`Starts debugging the root cause while players keep earning broken rewards.` }
  ] });

T('pm-postmortems',{ d:'management', t:'Post-mortems and retrospectives', tag:'A retrospective that produces no owned change is a feelings meeting. Write the change where the next person will trip over it.',
  what:`The structured look back: a retrospective at the end of a sprint or milestone, a post-mortem after a launch or an incident. The useful output is not a list of what went well. It is a small number of changes with owners, and a record of the decision context so the next team can judge whether their situation is actually the same one.`,
  why:[`The same failure repeats until the system that produced it changes.`,`Memory decays fast and rationalises faster. Notes taken while it hurt beat recollection weeks later.`,`A lesson stored in a document nobody opens is not a lesson.`,`Blame ends the investigation before the cause is found, and it teaches people to hide the next one.`],
  think:{ q:[`What surprised us, and when could we first have known?`,`Is this a person problem or a system problem? Assume system until the evidence forces otherwise.`,`What will be different next time, who owns it, and where will it be visible?`,`What went right that we should protect, and is it fragile?`,`Would a new team member meet this lesson without anyone telling them?`,`Does this lesson still apply, or was it true only for the situation that produced it?`],
    trade:[`A thorough post-mortem is complete and gets read once. A short one with two owned changes actually changes behaviour.`,`Honest retros need safety, and safety takes longer to build than a meeting takes to schedule.`],
    traps:[`Action items with no owner and no date.`,`Stopping at the last change instead of asking why the missing gate was missing.`,`Ritual retros that surface the same three complaints every sprint.`,`Running post-mortems only after failures, so nothing that worked is ever studied.`,`Writing the lesson into a document instead of into the place where the mistake is made.`,`Rules accumulating with no record of what produced them, so nobody can tell which ones expired.`],
    good:[`Each written rule is short, sits next to the work, and carries the date and the incident that produced it.`,`Last retro's actions are reviewed at the start of this one.`],
    bad:[`The post-mortem document is thorough and nothing downstream changed.`,`People describe what happened carefully so that nobody looks bad.`] },
  how:[`Take notes during the milestone. Retrospective quality is decided by what was written while it still hurt.`,`Run it on a timeline: what happened, when did we know, what did we decide and with what information at hand.`,`Ask why the guard was missing rather than who made the mistake.`,`Pick at most three changes, each with an owner and a date.`,`Put the lesson where the work happens: the template, the checklist, the pipeline, a short rule file beside the code.`,`Stamp each rule with the date and the incident that produced it so a later reader can judge whether it still applies.`,`Prefer a few short rules that outrank habit over a long document that competes with it.`,`Review the previous actions first. Drop the ones you will not do, on purpose and out loud.`],
  ai:{ yes:[`Turn raw notes and a chat log into a timeline with decision points.`,`Propose the systemic causes behind a described failure and the guard that would have caught each one.`,`Draft the rule text and say where it should live so it is read at the moment of the mistake.`],
       no:[`Decide whether a person or a system was at fault.`,`Judge the team's honesty from a transcript.`] },
  prompts:[{l:'Timeline and guards',p:`Here are the notes, chat excerpts and the sequence of events: [CONTEXT]. Build a timeline of what happened, when we could have known, and what was decided with what information. For each decision, name the guard that was missing rather than the person who acted. End with at most three changes, each with the place it should live so it is encountered at the moment of the mistake.`},{l:'Rule drafting',p:`This is what went wrong and what we agreed to change: [SUMMARY]. Draft the rule in under six lines, in the imperative, with the date and a one-line description of the incident that produced it. Say where the file should live so the person about to repeat the mistake reads it first. Then say what would make this rule obsolete.`}],
  verify:[`Does every action have an owner and a date?`,`Does the lesson live where the mistake happens, not in a document nobody opens?`,`Is the cause a missing guard rather than a named person?`],
  test:[`Review the previous retro's actions at the start of the next one and count how many landed.`,`Measure repeat incidents. The same failure twice means the change was recorded and not made.`,`Ask a recent joiner to find the rule for a situation they have not met. If they cannot, it is in the wrong place.`],
  rel:[['iteration-and-evidence','A retrospective is iteration applied to the process instead of the game.'],['quality-and-build-health','Most retro actions land as a gate, a check or a triage rule.'],['lead-incidents','An incident review is a post-mortem with a shorter fuse and higher stakes.'],['lead-conventions','A lesson only survives as a written convention people actually meet.'],['pm-risk','Closed post-mortems feed the register with risks that are no longer hypothetical.']] });
INTERVIEW('pm-postmortems',{
  junior:[
    { q:`What makes a retrospective useful rather than a complaint session?`,
      a:`It ends with a small number of changes, each with an owner and a date, and it starts by reviewing whether the last set happened. Complaints are useful input, but they become useful output only when someone converts them into a change to the system: a check, a template, a rule, a limit.`,
      follow:`The same complaint appears for the third sprint running. What does that tell you?`,
      red:`Values the retro for letting people vent, with no outcome attached.` },
    { q:`You caused a bug that broke the build for half a day. What do you write down afterwards?`,
      a:`What happened, when you knew, and what would have caught it earlier. Focus on the missing guard rather than the apology: the test that did not exist, the check that was not run, the step that lives in someone's memory. Then put the fix where the next person will meet it, not in a message that scrolls away.`,
      follow:`Where do you put it so the next person actually reads it?`,
      red:`Apologises, fixes it, and records nothing.` }
  ],
  mid:[
    { q:`How do you make a lesson from a post-mortem actually stick?`,
      a:`Put it where the work happens: the pull request template, the checklist, the pipeline check, a short rule file next to the code. Keep it short enough to read at the moment of the mistake. Stamp it with the date and the incident that produced it, so a later reader can judge whether it still applies and can retire it when it does not.`,
      follow:`How do you stop the rule collection growing until nobody reads any of it?`,
      red:`Writes a long document, links it once, and assumes the team internalised it.` },
    { q:`How do you run a post-mortem after a launch that went well?`,
      a:`Same structure, different question. Find what worked and why, and ask which parts of it were luck. Protect the fragile ones: a process that depended on one person being available, a check that happened by accident. Success post-mortems are where you find the load-bearing habits that nobody has written down yet.`,
      follow:`You find a critical step that only one person knows. What is the fix?`,
      red:`Skips the review because there was nothing to fix.` },
    { q:`Someone genuinely made a careless mistake. How do you run the review?`,
      a:`Separate the review from the feedback. In the review, ask why the system allowed the mistake to reach production and fix that. Give the individual feedback privately, directly, and about the pattern rather than the incident. A review that names a person publicly guarantees the next incident is hidden until it is bigger.`,
      follow:`The same person makes a similar mistake a month later. Has the system question changed?`,
      red:`Runs a blameless review while everyone knows who it is about, and changes nothing systemic.` }
  ],
  senior:[
    { q:`Your studio holds retrospectives and nothing changes. What do you do?`,
      a:`Find out where the actions die. Usually it is no owner, no time budget, or no authority to change the thing that needs changing. Cap actions at three, give each an owner and a slot in the next cycle, and open the following retro by reporting on them. If the blocker is authority, escalate that as the finding, because the retro is then surfacing a problem it cannot solve.`,
      follow:`Two of the three actions need a decision above your level. How do you present them?`,
      red:`Improves the retro format and hopes participation fixes it.` },
    { q:`How do you write down a lesson so a future team can tell whether it still applies?`,
      a:`Record the decision context, not just the conclusion. What was true at the time, what constraint drove it, what the alternative was, and what would make the rule obsolete. Date it and cite the incident. Rules without context become superstition, and people follow them long after the reason has gone or discard them without noticing which ones were load bearing.`,
      follow:`Two written rules now contradict each other. How do you resolve it?`,
      red:`Writes the rule as a bare instruction with no origin, no date and no expiry condition.` }
  ] });
