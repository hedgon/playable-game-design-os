/* =====================================================================
   LEARNING PATHS: beginner to expert, sequencing existing content
   A path does not duplicate a topic, tool, checklist, smell, diagnostic,
   project part, workflow chart or prompt. It walks the reader through the
   ones that already exist, in an order, with a reason for each stop, a
   concrete exercise, and a soft checkpoint per stage. Progress lives in
   localStorage (see 90-app.js: pathProgress, pathNextStep, stepHref,
   stepTitle). No streaks, no badges, no guilt copy.

   PATH(id, {
     t:'', tag:'',                          // title, one-line pitch
     track:'',                              // one of TRACKS below
     level:'',                              // one of LEVELS below: the ENTRY level
     hours:0,                               // sum of stage hours
     audience:'', outcome:'',               // 1-2 sentences each
     prereq:[''], next:[''],                // other path ids, may be empty
     stages:[{
       id:'', t:'', level:'', goal:'', hours:0,
       steps:[{
         kind:'topic'|'tool'|'checklist'|'smell'|'diagnostic'|'part'|'flow'|'prompt'|'reflect',
         ref:'',                            // omitted for 'reflect'
         tab:'',                            // optional, topic only: 'overview'|'godot'|'unity'|'interview'
         why:'', do:'', min:0                // why now (1 sentence), the exercise (1-3 sentences), 10-60
       }],
       review:[''],                          // 0-2 topic ids from EARLIER stages, for retrieval and spacing
       check:{ recall:[''], build:'', skip:[''] }  // 2-4 recall questions, one build task, 3-5 skip questions
     }]
   })

   Ref resolution by kind:
     topic      -> TOPICS[ref]                                    #/map/t/<ref>
     tool       -> an id in TOOLS (90-app.js)                      #/build/<ref>
     checklist  -> an id in CHECKLISTS                             #/checklists/<ref>
     smell      -> an id in SMELLS                                 #/smell/<ref>
     diagnostic -> 'loop'|'fun'|'unfair'|'depth'|'content'         #/diagnose/<ref>
     part       -> '<cs>/<sys>/<part>' resolving through CASE_STUDIES  #/experience/<cs>/<sys>/<part>
     flow       -> '<cs>/<flowId>' resolving through CASE_STUDIES  #/experience/<cs>/flow/<flowId>
     prompt     -> an id in PROMPT_TEMPLATES                       #/prompts/<ref>
     reflect    -> no ref; 'do' is the writing prompt, answered on the path page itself

   Rules (checked by validate.js): 4-6 stages; 3-8 steps per stage; every
   step's min is 10-60; a stage's hours is the sum of its step minutes
   rounded to hours, within 10%; a path's hours is the sum of its stages,
   within 10%; every ref resolves for its kind; no stage runs more than 4
   consecutive 'topic' steps from one domain (interleave); at least one
   'tool' or 'checklist' step per stage; every stage has a check with 2-4
   recall questions, a non-empty build task, and 3-5 skip questions; stage
   levels are non-decreasing across a path; prereq and next resolve to
   other path ids; ids are unique.
   ===================================================================== */
const PATHS = [];
function PATH(id, o){ o.id = id; PATHS.push(o); }
const TRACKS = [['design','Design'],['engineering','Engineering'],['leadership','Leadership'],['interview','Interview prep']];
const LEVELS = [['beginner','Beginner'],['intermediate','Intermediate'],['advanced','Advanced'],['expert','Expert']];
/* Level descriptors, shown on the door and on a path's header.
   Beginner: follows explicit templates, cannot yet judge when a rule does
   not apply. Intermediate: applies frameworks to new contexts, still leans
   on checklists. Advanced: recognises patterns unprompted, weighs several
   constraints, critiques others' work. Expert: designs the frameworks and
   constraints others work inside. */
const LEVEL_DESC = {
  beginner:'Follows explicit templates. Cannot yet judge when a rule does not apply.',
  intermediate:'Applies frameworks to new contexts. Still leans on checklists.',
  advanced:'Recognises patterns unprompted, weighs several constraints, critiques others’ work.',
  expert:'Designs the frameworks and constraints other people work inside.'
};

/* ---------------------------------------------------------------------
   Two pure lookups shared by the map (89-graph.js, a sibling closure that
   loads before the app) and the app (90-app.js, which also uses these for
   the step rows and the path bar). Defined here, at true top level, rather
   than inside the app's closure, so PlayableGraph.buildPath can label a
   step node the same way the reading page does. Neither touches storage;
   the app-side pathProgress/pathNextStep (which do) live in 90-app.js.
   `TOOLS` is set by 90-app.js as `window.TOOLS` rather than a local const
   for exactly this reason. In the layout checker's sandbox (check-layout.js
   loads only data+flow+graph, not the app) it is fed the same array onto
   its own stand-in `window` object, so a tool step's label there matches
   what the real app renders. --------------------------------------------------------------------- */
const DIAGNOSTIC_TITLES = { loop:'Core loop diagnostic', fun:'Fun diagnostic', unfair:'Unfairness diagnostic', depth:'Depth vs complexity', content:'Content or mechanic?' };
function toolsList(){ if(typeof TOOLS !== 'undefined' && TOOLS) return TOOLS; if(typeof window !== 'undefined' && window.TOOLS) return window.TOOLS; return []; }
function findCasePart(ref){
  const [csId, sysId, partId] = String(ref || '').split('/');
  const cs = (typeof CASE_STUDIES !== 'undefined' ? CASE_STUDIES : []).find(c => c.id === csId);
  const sys = cs && (cs.systems || []).find(s => s.id === sysId);
  const part = sys && (sys.parts || []).find(p => p.id === partId);
  return { cs, sys, part };
}
function findCaseFlow(ref){
  const i = String(ref || '').indexOf('/');
  const csId = i < 0 ? ref : ref.slice(0, i), flowId = i < 0 ? '' : ref.slice(i + 1);
  const cs = (typeof CASE_STUDIES !== 'undefined' ? CASE_STUDIES : []).find(c => c.id === csId);
  const flow = cs && (cs.flows || []).find(f => f.id === flowId);
  return { cs, flow };
}
function stepTitle(step){
  switch(step.kind){
    case 'topic': { const t = TOPICS[step.ref]; return t ? t.t : step.ref; }
    case 'tool': { const x = toolsList().find(([id]) => id === step.ref); return x ? x[1] : step.ref; }
    case 'checklist': { const x = CHECKLISTS.find(c => c.id === step.ref); return x ? x.t : step.ref; }
    case 'smell': { const x = SMELLS.find(s => s.id === step.ref); return x ? x.t : step.ref; }
    case 'diagnostic': return DIAGNOSTIC_TITLES[step.ref] || step.ref;
    case 'prompt': { const x = PROMPT_TEMPLATES.find(p => p.id === step.ref); return x ? x.t : step.ref; }
    case 'part': { const { part } = findCasePart(step.ref); return part ? part.t : step.ref; }
    case 'flow': { const { flow } = findCaseFlow(step.ref); return flow ? flow.t : step.ref; }
    case 'reflect': return 'Reflect and write it in your own words';
    default: return step.ref || step.kind;
  }
}
// `pathId`/`stageId` are only used for a 'reflect' step, which has no asset
// of its own and links back to the stage it belongs to on the path page.
function stepHref(step, pathId, stageId){
  switch(step.kind){
    // Always name the tab explicitly, including 'overview': a path step's
    // intended tab must win over whatever tab this browser last used on a
    // different topic (setTopicTab in 90-app.js falls back to that sticky
    // preference only when the URL segment is absent).
    case 'topic': return '#/map/t/' + step.ref + '/' + (step.tab || 'overview');
    case 'tool': return '#/build/' + step.ref;
    case 'checklist': return '#/checklists/' + step.ref;
    case 'smell': return '#/smell/' + step.ref;
    case 'diagnostic': return '#/diagnose/' + step.ref;
    case 'prompt': return '#/prompts/' + step.ref;
    case 'part': { const { cs, sys, part } = findCasePart(step.ref); return cs && sys && part ? `#/experience/${cs.id}/${sys.id}/${part.id}` : '#/experience'; }
    case 'flow': { const { cs, flow } = findCaseFlow(step.ref); return cs && flow ? `#/experience/${cs.id}/flow/${flow.id}` : '#/experience'; }
    case 'reflect': return pathId ? '#/paths/' + pathId + (stageId ? '/' + stageId : '') : '#/paths';
    default: return '#/paths';
  }
}

PATH('game-designer-foundations', {
  t:'Game designer foundations', tag:'Player, loop, and the discipline to test before you build.',
  track:'design', level:'beginner', hours:8,
  audience:'Anyone starting in game design, or an engineer, producer or artist picking up design responsibility for the first time.',
  outcome:'You can name a player and a promise, build and defend a core loop, judge whether a feature idea creates a real decision, and turn a hunch into a hypothesis before you write a line of code.',
  prereq:[], next:['systems-designer','level-and-ux-designer'],
  stages:[
    { id:'s1', t:'The player and the promise', level:'beginner',
      goal:'Name a real player, the fantasy you are selling them, and the one sentence that has to survive every later decision.', hours:2,
      steps:[
        { kind:'topic', ref:'who-is-the-player', why:'Every later decision is a guess until you can name who you are designing for.', do:'Write a four-sentence sketch of your player: who they are, what they already play, what they want from a session, and what would make them quit.', min:25 },
        { kind:'topic', ref:'player-motivation', why:'Wants are not needs. Knowing what drives your player tells you which promise to make.', do:'List the three motivations your player sketch implies, ranked by strength, and name one existing game that serves each of them badly.', min:20 },
        { kind:'topic', ref:'fantasy', why:'The fantasy is the promise stated as a verb the player wants to perform.', do:'Write ten fantasy sentences that start "I get to be someone who…" for your player. Keep the one whose verb you would enjoy performing for ten minutes in grey boxes.', min:25 },
        { kind:'topic', ref:'core-experience', why:'The experience statement is the target every later system exists to serve.', do:'Turn your fantasy sentence into a one-paragraph core experience statement, and read it aloud to someone who has not seen the project.', min:20 },
        { kind:'tool', ref:'ladder', why:'Feature thinking sneaks in early. The ladder keeps you starting from a behavior instead.', do:'Take one feature you already want to build and climb the ladder: feature, behavior, experience, system, mechanic, then back down to the smallest version.', min:25 }
      ],
      review:[],
      check:{
        recall:['What is the difference between a want and a fantasy sentence?','Why does experience thinking start from a behavior instead of a feature?','What breaks if you skip straight from a feature idea to a feature?'],
        build:'Write your player sketch, your chosen fantasy sentence and your one-paragraph core experience statement on one page. Read it aloud to someone who has not seen the project.',
        skip:['Can you write a player sketch and a fantasy sentence for a new idea in under ten minutes?','Can you explain why "a roguelike deckbuilder" names a genre, not an experience?','Have you already run the Behavior Ladder on a real feature idea and changed the plan because of it?','Can you tell a want the market already shows apart from a want you are only guessing at?']
      } },
    { id:'s2', t:'The loop and its variables', level:'beginner',
      goal:'Turn the fantasy into a loop the player repeats, and find its weakest link before you add anything else.', hours:2,
      steps:[
        { kind:'topic', ref:'core-loop', why:'The loop is the machine the player repeats. If it is not compelling alone, nothing later rescues it.', do:'Describe your core loop in five sentences: action, feedback, decision, consequence, new situation. Mark the weakest link.', min:25 },
        { kind:'topic', ref:'decisions', why:'Depth lives in the decisions the loop creates, not in the actions themselves.', do:'List the three most common decisions your loop asks the player to make, and write the tradeoff sentence for each.', min:20 },
        { kind:'topic', ref:'mechanics-and-rules', why:'Mechanics are the rules that generate those decisions. You want the smallest set that produces them.', do:'List every mechanic your loop needs, and cross out any that does not feed a decision you just wrote down.', min:20 },
        { kind:'tool', ref:'loop', why:'Building the loop as a diagram exposes the weak link a paragraph hides.', do:'Build your loop in the Loop Builder, run its weak-link check, and fix the link it flags.', min:25 },
        { kind:'smell', ref:'repetitive', why:'Repetitive is the most common failure of an unfinished loop, and this smell names its causes before you ship one.', do:'Write which of its five causes your current loop is most at risk from, before you have even tested it, based on the repetitive-loop smell.', min:20 }
      ],
      review:['fantasy'],
      check:{
        recall:['What are the five links in the core loop?','What makes a decision meaningful rather than merely present?','How do you tell a load-only mechanic from one that creates a decision?'],
        build:'Export your Loop Builder diagram with the weakest link marked and the one change you made to strengthen it.',
        skip:['Can you describe your core loop in five sentences without leaving out a link?','Can you write the tradeoff sentence for every option in your game right now?','Have you already run a weak-link check on a loop and fixed what it found?','Do you know which of your mechanics would go unnoticed if you deleted it?']
      } },
    { id:'s3', t:'Depth, feedback, and teaching', level:'intermediate',
      goal:'Judge whether a feature idea is worth its cost, and whether your system teaches itself.', hours:2,
      steps:[
        { kind:'topic', ref:'depth-vs-complexity', why:'Complexity is what the player must learn. Depth is what they can do with it. You want to buy depth, not complexity.', do:'List ten rules in your current design and classify each as creating a decision, enabling an interaction, or load only.', min:20 },
        { kind:'topic', ref:'feedback-and-affordance', why:'Without feedback the player cannot learn from what they just did, no matter how good the decision was.', do:'Build a small feedback matrix for your three most common actions: what confirms the input, and what confirms the outcome. Find the empty cells.', min:20 },
        { kind:'topic', ref:'onboarding', why:'The first minutes teach more than any tutorial text, and they are where most players are lost.', do:'Write the first three things a new player would have to learn, and for each say whether they would learn it by doing or by reading.', min:20 },
        { kind:'tool', ref:'feature', why:'Nine questions catch a feature that sounds good and does nothing, before you spend a week on it.', do:'Run one feature idea you are excited about through Should We Build This? and accept the verdict even if you do not like it.', min:20 },
        { kind:'checklist', ref:'design-review', why:'A design review forces every group, including AI, to answer instead of shrug, before you commit production time.', do:'Run the design review checklist on the same feature idea and write down what each group actually answered.', min:20 },
        { kind:'diagnostic', ref:'depth', why:'The rule audit turns "depth vs complexity" from an idea into a number you can act on.', do:'Run the depth-vs-complexity rule audit on your own mechanic list and cut every rule that only adds load.', min:15 }
      ],
      review:['core-loop'],
      check:{
        recall:['What is the difference between complexity and depth?','Why does feedback need to show cause, not only outcome?','Which of the nine "Should we build this?" questions kills the most ideas in your experience so far?'],
        build:'Run the design review checklist on one feature you are considering, and either cut it or write down what each group answered.',
        skip:['Can you run a rule audit on your own systems and say which rules earn their place?','Can you name the empty cell in your current feedback matrix?','Have you already used "Should we build this?" to kill an idea you liked?','Can you explain teaching by doing to someone in one sentence?']
      } },
    { id:'s4', t:'Prototype, test, decide', level:'intermediate',
      goal:'Turn a hunch into a hypothesis, build the cheapest test, and use a real playtest as evidence.', hours:2,
      steps:[
        { kind:'topic', ref:'prototyping', why:'A prototype that answers no question is a demo, however good it looks.', do:'Name the one question your next build has to answer, and the medium that answers it for the least work.', min:20 },
        { kind:'topic', ref:'hypothesis-driven-design', why:'A hypothesis with a signal and a kill criterion is what turns an opinion into something you can be wrong about.', do:'Write one hypothesis in the standard form: player, behavior, reason, signal, kill criterion.', min:15 },
        { kind:'tool', ref:'hypothesis', why:'The builder keeps the four parts honest and exports the brief you hand to whoever builds the prototype.', do:'Enter your hypothesis into the Hypothesis Builder and export the prototype brief it produces.', min:20 },
        { kind:'checklist', ref:'pre-prototype', why:'A prototype without a hypothesis, a scope cut and instrumentation is a demo with extra steps.', do:'Run the pre-prototype checklist against the brief you just exported and fix whatever it fails.', min:15 },
        { kind:'topic', ref:'playtesting', why:'What a player says is useful. What a player does is evidence. Only one of them tests your hypothesis.', do:'Plan a fifteen-minute silent playtest for your prototype: who you would recruit, what you would watch for, and the one question you would ask afterward.', min:20 },
        { kind:'reflect', why:'Writing your own answer, not the guide’s, is what makes the plan yours to run.', do:'In your own words, write what you will build next, the hypothesis it tests, and the signal that would make you kill it.', min:20 }
      ],
      review:['mechanics-and-rules','depth-vs-complexity'],
      check:{
        recall:['What four parts does a hypothesis need?','Why is a prototype that answers no question a demo?','What is the difference between what a player says and what a player does?'],
        build:'Write one hypothesis in the standard form, the smallest prototype that tests it, and the kill criterion, using the Hypothesis Builder.',
        skip:['Have you already written a hypothesis with a signal and a kill criterion for your current idea?','Can you name the smallest medium that would answer your current design question?','Do you know what result would make you kill your favorite idea?','Can you separate what a tester said from what they did in your last playtest?']
      } }
  ]
});

PATH('systems-designer', {
  t:'Systems designer', tag:'Economy, progression, and the discipline to prove a system by breaking it.',
  track:'design', level:'intermediate', hours:10,
  audience:'Designers past the basics who want to own an economy, a progression curve, or any system with more than three moving parts.',
  outcome:'You can map a system’s parts and feedback loops, run a rule audit that separates decisions from load, and turn a design smell into a testable experiment instead of a guess.',
  prereq:['game-designer-foundations'], next:['technical-lead'],
  stages:[
    { id:'s1', t:'Systems and their pieces', level:'intermediate',
      goal:'See a system as parts and the relationships between them, not just a list of numbers.', hours:2,
      steps:[
        { kind:'topic', ref:'systemic-design', why:'A system is not its numbers. It is the relationships between the numbers, and those are what actually produce behavior.', do:'Pick a system you already run (an economy, a progression curve, a build system) and list its five most important relationships as A affects B sentences.', min:25 },
        { kind:'topic', ref:'mechanics-and-rules', why:'Every relationship you just listed is enforced by a specific rule. Naming the rule is what makes the relationship changeable later.', do:'For each relationship from the last step, write the exact rule that enforces it, in one sentence each.', min:20 },
        { kind:'topic', ref:'economy-and-resources', why:'Currencies and sinks are the most common system a designer inherits half built. Knowing the vocabulary lets you diagnose it fast.', do:'List every currency and every sink in your system, and mark which sinks currently have no meaningful choice attached to them.', min:25 },
        { kind:'tool', ref:'sysmap', why:'A relationship map on paper hides feedback loops that a diagram makes obvious in thirty seconds.', do:'Build your system in the System Relationship Map, and circle the first feedback loop it reveals that you had not written down.', min:25 },
        { kind:'smell', ref:'same-way', why:'A system with too few real choices collapses into one dominant path, and that is a system smell, not a balance number.', do:'Check whether your map from the last step has a dominant node with no real competitor, based on the “Everyone plays the same way” smell.', min:20 }
      ],
      review:[],
      check:{
        recall:['What is the difference between a relationship and a rule in a system?','Why does listing sinks with no attached choice matter before you touch numbers?','What does a feedback loop look like on your relationship map that a spreadsheet would hide?'],
        build:'Export your System Relationship Map with the feedback loop you found circled, and the rule sentence for the relationship that causes it.',
        skip:['Can you name the feedback loops in your current system without opening the map tool?','Can you list every currency and sink in your game from memory, sink by sink?','Do you already know which sink in your economy has no real choice attached?','Have you built a relationship map for a system before and found something you had not noticed?']
      } },
    { id:'s2', t:'Progression and its pressure', level:'intermediate',
      goal:'Balance the curve a player climbs, and name what breaks when it goes wrong.', hours:2,
      steps:[
        { kind:'topic', ref:'progression', why:'Progression is the pacing of the whole game compressed into one curve. Get the curve wrong and every other system inherits the problem.', do:'Sketch your progression curve for the first two hours, marking every point where the pace changes and why you chose it there.', min:25 },
        { kind:'topic', ref:'difficulty', why:'Progression and difficulty are two names for the same pressure. If they are not tuned together, one always undercuts the other.', do:'Mark on your progression curve where difficulty rises faster than player power, and where it is the reverse.', min:20 },
        { kind:'smell', ref:'meaningless-progression', why:'A curve that always goes up but never changes what the player can do is a treadmill, not progression.', do:'Check whether your last three unlocks actually changed a decision, or only a number, based on the “Progression feels meaningless” smell.', min:20 },
        { kind:'smell', ref:'too-many-currencies', why:'Currencies multiply faster than any other part of a system, usually because each one solved a problem alone instead of together.', do:'List every currency in your game against the one unique decision it enables. Cut any that do not have one, based on the “There are too many currencies” smell.', min:15 },
        { kind:'checklist', ref:'design-review', why:'A design review forces you to answer for the curve out loud, before a player has to live with it.', do:'Run the design review checklist against your progression curve specifically, not the whole game.', min:20 },
        { kind:'diagnostic', ref:'depth', why:'The rule audit turns depth vs complexity from a feeling into a count you can act on.', do:'Run the depth-vs-complexity rule audit against every rule your progression curve depends on, and cut whatever only adds load.', min:15 }
      ],
      review:['systemic-design'],
      check:{
        recall:['What breaks when progression and difficulty are tuned separately?','What is the test for whether an unlock is meaningful?','What does a currency need to justify existing, according to the smell you just read?'],
        build:'Run the design review checklist on your progression curve and the depth-vs-complexity rule audit on its rules, and write down what each one caught.',
        skip:['Can you point to the exact spot on your curve where difficulty and power cross?','Can you defend every currency in your game with the one decision it alone enables?','Have you already cut an unlock because a rule audit showed it was load, not depth?','Can you name a real game whose progression curve you would redesign, and why?']
      } },
    { id:'s3', t:'Depth, content, and diminishing returns', level:'advanced',
      goal:'Tell a system problem from a content problem, and know when adding more stops helping.', hours:2,
      steps:[
        { kind:'topic', ref:'depth-vs-complexity', why:'Depth and complexity look identical on a feature list. Only the player’s decisions tell them apart.', do:'Take ten rules from your system and classify each as creating a decision, enabling an interaction, or load only. Count each bucket.', min:25 },
        { kind:'topic', ref:'content-multiplies', why:'Content only multiplies a system’s value if the system can absorb it. Past that point, more content just adds cost.', do:'List the last five content items you added to this system, and mark which ones created a new decision versus just a new skin on an old one.', min:25 },
        { kind:'diagnostic', ref:'content', why:'The content-or-mechanic diagnostic gives you a repeatable answer instead of a guess, the next time someone asks for more content.', do:'Run the content-or-mechanic diagnostic on your next planned addition and act on what it tells you.', min:15 },
        { kind:'smell', ref:'one-build', why:'When one build or strategy dominates, the system has stopped offering real choices, whatever the patch notes say.', do:'Check your own system against its causes list, honestly, based on the “Players only use one build or strategy” smell.', min:15 },
        { kind:'smell', ref:'no-experiment', why:'Players who never experiment are telling you the system does not reward trying something new.', do:'Name the one change that would make trying something new worth the risk in your system, based on the “Players do not experiment” smell.', min:15 },
        { kind:'checklist', ref:'scope-sanity', why:'Diminishing returns are easiest to see from outside your own backlog, which is what a monthly scope check is for.', do:'Run the scope sanity checklist against your current system backlog and cut the item that scores worst.', min:20 }
      ],
      review:['progression'],
      check:{
        recall:['What separates a decision rule from a load-only rule?','When does more content stop adding value to a system?','What is the one change the no-experiment smell asked you to name?'],
        build:'Run the content-or-mechanic diagnostic on your next planned addition, and either build it differently or cut it based on the result.',
        skip:['Can you classify a rule as decision, interaction, or load in under ten seconds?','Can you name the point where adding content to your system stopped paying off?','Have you already found a one-build problem in your own system and named its cause?','Do you know which item in your backlog a scope check would cut first?']
      } },
    { id:'s4', t:'Experiments, not opinions', level:'advanced',
      goal:'Turn a smell you found into an experiment with a real signal, not just a fix you feel confident about.', hours:2,
      steps:[
        { kind:'topic', ref:'builds-and-loadouts', why:'Builds and loadouts are where depth becomes visible to the player. A healthy build space is the clearest proof a system is working.', do:'List every viable build in your system today, and rank them by how often you would guess players actually pick each one.', min:25 },
        { kind:'smell', ref:'ignore-mechanics', why:'A mechanic nobody uses is not neutral. It is a cost the system pays for a decision players never make.', do:'Mark which of your mechanics you would bet is currently ignored, based on the “Players ignore half the mechanics” smell.', min:20 },
        { kind:'smell', ref:'features-not-better', why:'Adding a fix on top of a smell without testing it is how a system accumulates features that do not solve the actual problem.', do:'Check whether your last three system changes were tested or just shipped, based on the “We keep adding features but the game is not better” smell.', min:20 },
        { kind:'tool', ref:'hypothesis', why:'A fix without a signal and a kill criterion is an opinion wearing a plan’s clothes.', do:'Turn your fix for the one-build or ignored-mechanic problem into a hypothesis with a signal and a kill criterion, using the Hypothesis Builder.', min:30 },
        { kind:'reflect', why:'Writing the experiment in your own words is what makes you actually run it instead of just agreeing it sounds right.', do:'Write the exact change you will make, the signal that means it worked, and the signal that means you should revert it.', min:25 }
      ],
      review:['depth-vs-complexity'],
      check:{
        recall:['Why is an ignored mechanic a cost, not a neutral feature?','What turns a fix into an experiment?','What are the two signals your hypothesis needs?'],
        build:'Export your Hypothesis Builder brief for the system fix you chose, with a real signal and a real kill criterion.',
        skip:['Have you already written a hypothesis with a kill criterion for a system fix?','Can you name a mechanic in your game you are fairly sure nobody uses, and why?','Do you know what evidence would make you revert your last system change?','Can you tell a tested fix from a shipped-and-hoped fix in your own recent work?']
      } },
    { id:'s5', t:'The full audit', level:'advanced',
      goal:'Run a complete system audit end to end, and leave with a plan a player will actually meet.', hours:2,
      steps:[
        { kind:'topic', ref:'risk-reward', why:'Every currency sink and every build choice is a risk-reward decision wearing different clothes. Naming it that way is what lets you tune it on purpose.', do:'Take your redesigned system and mark, for each major decision point, what the player risks and what they stand to gain. Flag any point with reward and no real risk.', min:30 },
        { kind:'tool', ref:'sysmap', why:'A full relationship map, built after the redesign, is the only way to see whether you actually fixed the loop or just moved the smell somewhere else.', do:'Rebuild your System Relationship Map for the redesigned system across every subsystem you touched, annotating each smell you found earlier directly on the map.', min:30 },
        { kind:'checklist', ref:'playtest-prep', why:'A redesigned system is still a guess until a player meets it. The session that tests it needs the same rigor as the redesign did.', do:'Run the playtest session preparation checklist for a session built specifically to probe the smell you targeted, not a general playtest.', min:25 },
        { kind:'reflect', why:'The audit only counts as finished once someone else could pick it up and act on it without you in the room.', do:'Write the one-page audit: the smells you found, the experiment you ran or are about to run, and what you expect to see change.', min:30 }
      ],
      review:['builds-and-loadouts'],
      check:{
        recall:['What does flagging reward with no risk tell you about a decision point?','What is the difference between fixing a loop and moving its smell?','What has to be true of an audit for someone else to act on it without you?'],
        build:'Write the one-page system audit and attach the relationship map and the playtest prep checklist you ran against the redesigned system.',
        skip:['Can you point to a decision point in your system with reward and no real risk?','Have you already rebuilt your relationship map after a redesign and found the smell had just moved?','Can you write a playtest plan built around one specific smell, not a general session?','Could someone else run your audit’s build task from your one-page writeup alone?']
      } }
  ]
});

PATH('level-and-ux-designer', {
  t:'Level and UX designer', tag:'Pacing, readability, and the first five minutes nobody skips.',
  track:'design', level:'intermediate', hours:10,
  audience:'Designers who block out levels or own onboarding and moment-to-moment feedback, and want players to know what to do without a wall of text.',
  outcome:'You can pace a level on purpose, diagnose why players stall, and run an onboarding pass that teaches by doing instead of telling.',
  prereq:['game-designer-foundations'], next:['technical-lead'],
  stages:[
    { id:'s1', t:'Level structure and pacing', level:'intermediate',
      goal:'Build a level as a deliberate sequence of teach, test and rest, not a pile of encounters.', hours:2,
      steps:[
        { kind:'topic', ref:'level-structure', why:'Teach, test, twist, combine, master, rest is a sequence for a reason. Skip a step and the player either stalls or gets bored.', do:'Take a level you are building or know well, and label each section with one of the six beats. Mark any beat that is missing entirely.', min:25 },
        { kind:'topic', ref:'pacing', why:'Pacing is not just difficulty. It is the rhythm of intensity and rest, and a level with no rest beat exhausts players before it challenges them.', do:'Graph the intensity of your level over its length by hand, on paper, and mark the flattest and steepest sections.', min:25 },
        { kind:'topic', ref:'spatial-composition', why:'Where the player can see, and where they cannot, shapes the pacing graph you just drew as much as any encounter does.', do:'Mark on your level layout the three sightlines that most control what the player expects to happen next.', min:25 },
        { kind:'checklist', ref:'design-review', why:'A pacing graph and a beat map are opinions until someone else is forced to check them against a real question.', do:'Run the design review checklist against your level’s pacing plan before you block anything out.', min:20 },
        { kind:'smell', ref:'tutorial-too-long', why:'A tutorial that runs long is usually a pacing problem wearing a teaching-text costume.', do:'Check whether your first teach beat is actually one beat, or three beats pretending to be one, based on the “The tutorial is too long” smell.', min:15 }
      ],
      review:[],
      check:{
        recall:['What are the six beats a level structure moves through?','Why can a level be well paced and still exhaust a player?','How does a sightline control pacing before an encounter even starts?'],
        build:'Draw the pacing graph for your level by hand and label each of the six beats on your layout, then run the design review checklist against the plan.',
        skip:['Can you label the six structural beats on a level you know without looking them up?','Can you draw your own level’s intensity graph from memory and defend the shape?','Have you already found a sightline problem in your own level by walking it, not reading about it?','Can you tell a pacing problem from a difficulty problem when a tester stalls?']
      } },
    { id:'s2', t:'Encounters and readability', level:'intermediate',
      goal:'Design one encounter as a readable loop, and catch where a player stops knowing what to do.', hours:2,
      steps:[
        { kind:'topic', ref:'encounter-design', why:'An encounter is a small core loop with its own setup, action and resolution. Design it like one instead of like a room full of enemies.', do:'Pick one encounter and write its four parts: setup, action, feedback, resolution. Mark which part is currently the weakest.', min:25 },
        { kind:'topic', ref:'readability-and-hierarchy', why:'A player who cannot read the encounter cannot make a decision in it, however good the decision space actually is.', do:'Screenshot or sketch your encounter and circle the three things a player should notice first. Ask whether the visual hierarchy actually points there.', min:25 },
        { kind:'smell', ref:'dont-know-what-to-do', why:'This is the single most common symptom of a readability failure, and it is usually blamed on the player instead of the screen.', do:'Match your encounter against its causes list, based on the “Players do not know what to do” smell.', min:20 },
        { kind:'tool', ref:'loop', why:'Modeling the encounter as a loop exposes a weak link that a verbal description hides.', do:'Build your encounter in the Game Loop Builder as its own small loop, run the weak-link check, and fix what it flags.', min:30 },
        { kind:'reflect', why:'Naming the fix in your own words is what turns a diagnosis into a change you actually make.', do:'Write the one readability cue you would add first, and exactly where on screen or in space it goes.', min:20 }
      ],
      review:['level-structure'],
      check:{
        recall:['What are the four parts of an encounter as a small loop?','What is the difference between a decision-space problem and a readability problem?','What causes did the “players do not know what to do” smell point to in your case?'],
        build:'Export your Game Loop Builder diagram for the encounter with its weak link marked and fixed.',
        skip:['Can you name the weakest of the four parts in any encounter you are currently building?','Can you point to the exact visual element that should draw a player’s eye first, and check whether it does?','Have you already fixed a “players do not know what to do” report by changing readability instead of adding text?','Do you know the difference between a loop weak link and a readability weak link?']
      } },
    { id:'s3', t:'Feedback, feel and control', level:'advanced',
      goal:'Make every input confirm itself, and every outcome confirm the input that caused it.', hours:2,
      steps:[
        { kind:'topic', ref:'feedback-and-affordance', why:'Without feedback a player cannot learn from what they just did, no matter how good the underlying decision was.', do:'Build a feedback matrix for your three most common player actions: what confirms the input, and what confirms the outcome. Find the empty cells.', min:30 },
        { kind:'topic', ref:'controls-and-friction', why:'Every extra step between intent and action is friction, and friction reads to the player as the game fighting them.', do:'Count the inputs required for your three most common actions, and cut one step from whichever has the most.', min:25 },
        { kind:'smell', ref:'floaty-combat', why:'Floaty is what players say when feedback lags behind or contradicts the input that caused it, not necessarily when the numbers are wrong.', do:'Check your feedback matrix from the last step against its causes, based on the “Combat feels floaty” smell.', min:15 },
        { kind:'checklist', ref:'design-review', why:'Feel and control decisions are exactly the kind of thing that looks fine to the person who has played it a thousand times.', do:'Run the design review checklist against your control scheme and feedback pass specifically, not the whole feature.', min:25 },
        { kind:'prompt', ref:'ux-audit', why:'The UX friction audit gives you a structured way to turn your own blind spots into a list instead of a feeling.', do:'Run the UX friction audit prompt against your own build, and write down the one friction point you had stopped noticing.', min:25 }
      ],
      review:['encounter-design'],
      check:{
        recall:['What are the two things feedback has to confirm for every action?','Why is “floaty” usually a feedback problem, not a physics problem?','What is friction, in one sentence?'],
        build:'Fill your feedback matrix for the three most common actions, then run the design review checklist against the control scheme alone.',
        skip:['Can you name the empty cell in your feedback matrix right now?','Can you count the inputs your most common action takes without checking?','Have you already fixed a “floaty” complaint by changing feedback timing instead of a physics value?','Do you know the one friction point in your own build you have stopped noticing?']
      } },
    { id:'s4', t:'Onboarding and accessibility', level:'advanced',
      goal:'Teach the first five minutes by doing, and make sure the interface does not silently exclude someone.', hours:2,
      steps:[
        { kind:'topic', ref:'onboarding', why:'The first minutes teach more than any tutorial text, and they are where most players who quit actually leave.', do:'Write the first three things a new player has to learn, and for each say whether they learn it by doing or by reading.', min:25 },
        { kind:'topic', ref:'accessibility', why:'An interface that only works for one set of senses or one input method is cutting players out before they ever reach your pacing or your loop.', do:'Pick one accessibility dimension (color, input, text size, audio cues) and audit your current build against it for ten minutes.', min:25 },
        { kind:'checklist', ref:'onboarding-audit', why:'The silent onboarding audit is built specifically to catch a tutorial that teaches with words instead of consequences.', do:'Run the silent onboarding audit against your first five minutes, with the sound off and no tutorial text visible if you can manage it.', min:25 },
        { kind:'smell', ref:'english-shaped-ui', why:'An interface built around one language’s word lengths and reading direction breaks quietly in every other one.', do:'Check one screen of your UI against its causes, even if you have no plans to localize yet, based on the “The interface breaks in other languages” smell.', min:20 },
        { kind:'reflect', why:'The highest-leverage onboarding fix is rarely the flashiest one. Naming it plainly is what gets it actually built.', do:'Write the one onboarding change you would make first, and why it beats the other changes you considered.', min:25 }
      ],
      review:['feedback-and-affordance'],
      check:{
        recall:['What is the difference between teaching by doing and teaching by reading?','Name one accessibility dimension your build has not been checked against.','What does the silent onboarding audit remove on purpose, and why?'],
        build:'Run the silent onboarding audit with sound off and tutorial text hidden, and write the three things it caught that you would have missed otherwise.',
        skip:['Can you run your first five minutes with sound off and text hidden and still explain what happened?','Can you name which accessibility dimension your current build is weakest on?','Have you already caught an onboarding problem by watching a silent playtest instead of reading feedback?','Do you know the one onboarding change you would make first, right now?']
      } },
    { id:'s5', t:'Ship the pass', level:'advanced',
      goal:'Take a real level from another game apart, then apply the same eye to your own before you call it done.', hours:2,
      steps:[
        { kind:'topic', ref:'goals-horizons', why:'A single level’s pacing only makes sense against the goals a player is chasing at three different horizons. Get those wrong and no amount of local pacing fixes it.', do:'Write the immediate, session and long-term goal your level is currently serving, and check that your pacing graph actually supports all three.', min:25 },
        { kind:'tool', ref:'dissect', why:'Dissecting a level you did not build is the fastest way to see structure, pacing and readability choices you have stopped noticing in your own.', do:'Pick a level from a game you know well and dissect its structure, pacing and one readability choice using Reference Dissection.', min:30 },
        { kind:'checklist', ref:'playtest-prep', why:'A pacing and onboarding pass is still a guess until it meets a player who has never seen it.', do:'Run the playtest session preparation checklist for a session built to test your onboarding and pacing changes specifically.', min:30 },
        { kind:'reflect', why:'Writing the comparison down is what turns noticing something into a change you will actually carry into the next level.', do:'Write two sentences: what the dissected level did that yours does not yet, and the one change you will make because of it.', min:25 }
      ],
      review:['onboarding'],
      check:{
        recall:['What are the three horizons a level’s pacing has to serve?','What did dissecting someone else’s level show you about your own that reading could not?','What makes a playtest session actually test onboarding, rather than just running it again?'],
        build:'Dissect one level from a game you know, then write the one change to your own level that dissection justified.',
        skip:['Can you name your level’s immediate, session and long-term goal without checking notes?','Have you already dissected a level from another game and found something concrete to steal or avoid?','Can you plan a playtest session aimed at one specific question instead of a general “how did that feel”?','Do you know the single next change your level needs, right now, without re-reading this stage?']
      } }
  ]
});

PATH('idea-to-prototype-30-days', {
  t:'Idea to prototype in 30 days', tag:'A deliberately short path: one idea, one loop, one honest test.',
  track:'design', level:'beginner', hours:10,
  audience:'Solo or small-team builders who want a fast, motivating first win instead of a long syllabus.',
  outcome:'You end with a shaped idea, a tested core loop, a real hypothesis and playtest behind it, and a scoped 30-day plan you can actually run.',
  prereq:[], next:['game-designer-foundations'],
  stages:[
    { id:'s1', t:'Find and shape an idea', level:'beginner',
      goal:'Go from a vague itch to one idea you can defend in a paragraph, using real games as evidence.', hours:2.5,
      steps:[
        { kind:'topic', ref:'finding-an-idea', why:'An idea shaped against the market beats an idea invented in a vacuum, and this is the cheapest research you will ever do.', do:'Name three existing games closest to your itch, and write one sentence each on what they do well and one thing every one of them gets wrong.', min:30 },
        { kind:'tool', ref:'dissect', why:'Dissecting a reference game turns liking it into specific, stealable structure.', do:'Pick two of the three games from the last step and dissect each one, focused on the piece you actually want to borrow.', min:40 },
        { kind:'tool', ref:'idea', why:'The Idea Shaper forces your idea through the same filter twice, once for you and once against the gap you just found in existing games.', do:'Run your idea through the Idea Shaper and export the one-line pitch it produces.', min:40 },
        { kind:'reflect', why:'Writing the comparison in your own words is what tells you whether the idea earns its place, before you spend a day on it.', do:'Write why your idea beats the two games you dissected, in one paragraph, naming the specific gap it fills.', min:30 }
      ],
      review:[],
      check:{
        recall:['What does dissecting a reference game give you that just enjoying it does not?','What is the one gap your idea is supposed to fill?','What would make you conclude your idea does not actually beat its closest reference?'],
        build:'Export the Idea Shaper’s one-line pitch and attach your one-paragraph case for why it beats the two games you dissected.',
        skip:['Can you name the exact gap your idea fills in under one paragraph, right now?','Have you already dissected a close reference game for this exact idea?','Can you state your idea’s one-line pitch without checking your notes?','Do you know the one thing every close reference to your idea gets wrong?']
      } },
    { id:'s2', t:'Core experience and the loop', level:'beginner',
      goal:'Turn the idea into one experience statement and the smallest loop that could test it.', hours:2.5,
      steps:[
        { kind:'topic', ref:'core-experience', why:'The core experience statement is the target every later system exists to serve, and skipping it is how scope creeps in by day three.', do:'Write a one-paragraph core experience statement for your idea, and read it aloud to someone who has not heard the pitch yet.', min:35 },
        { kind:'tool', ref:'canvas', why:'The Core Experience Canvas forces every part of the idea to answer to the same statement in one sitting.', do:'Fill the Core Experience Canvas for your idea end to end, leaving no box blank even if the answer is a guess.', min:40 },
        { kind:'tool', ref:'loop', why:'A loop is the smallest thing you can actually build and test. Everything else is scope you have not earned yet.', do:'Build the smallest loop that could test your core experience statement, and mark its weakest link before you build anything.', min:40 },
        { kind:'checklist', ref:'pre-prototype', why:'A prototype without a hypothesis, a scope cut and a way to observe it is a demo with extra steps.', do:'Run the pre-prototype checklist against the loop you just built, and fix whatever it fails before day one of the 30 days starts.', min:35 }
      ],
      review:['finding-an-idea'],
      check:{
        recall:['What does the core experience statement have to survive, going forward?','Why is the smallest loop the right thing to build first?','What does the pre-prototype checklist catch that excitement about the idea does not?'],
        build:'Export your Core Experience Canvas and your Game Loop Builder diagram with the weak link marked, and note what the pre-prototype checklist caught.',
        skip:['Can you say your core experience statement from memory, in one sentence?','Can you name your loop’s weakest link without opening the tool again?','Have you already run a pre-prototype checklist and cut scope because of what it found?','Do you know the smallest version of your idea that would still test the thing you actually care about?']
      } },
    { id:'s3', t:'Prototype and test', level:'intermediate',
      goal:'Turn the loop into a real hypothesis, and get it in front of a player before you trust your own opinion of it.', hours:2.5,
      steps:[
        { kind:'topic', ref:'hypothesis-driven-design', why:'A hypothesis with a signal and a kill criterion is what turns thinking this works into something you can actually be wrong about.', do:'Write one hypothesis in the standard form: player, behavior, reason, signal, kill criterion, based on the loop you just built.', min:25 },
        { kind:'tool', ref:'hypothesis', why:'The Hypothesis Builder keeps the four parts honest and exports the brief that tells you, and anyone helping you build, what you are actually testing.', do:'Enter your hypothesis into the Hypothesis Builder and export the prototype brief it produces.', min:35 },
        { kind:'topic', ref:'playtesting', why:'What a player says is useful. What a player does is evidence, and only one of those actually tests your hypothesis.', do:'Plan a fifteen-minute silent playtest: who you would recruit, what you would watch for, and the one question you ask only after they finish.', min:25 },
        { kind:'checklist', ref:'playtest-prep', why:'A playtest without a plan turns into a demo you narrate, which teaches you nothing you did not already believe.', do:'Run the playtest session preparation checklist for the session you just planned.', min:30 },
        { kind:'reflect', why:'Predicting the result before you run the test is what makes a surprising result actually count as evidence.', do:'Write down what you predict will happen in the playtest, before you run it, so you can compare afterward.', min:25 }
      ],
      review:['core-experience'],
      check:{
        recall:['What are the four parts a hypothesis needs?','What is the difference between what a player says and what a player does?','Why does predicting the result beforehand matter?'],
        build:'Export your Hypothesis Builder brief and your playtest prep checklist, and run the fifteen-minute silent playtest they describe.',
        skip:['Have you already written a hypothesis with a real kill criterion for this idea?','Can you name the one question you would ask a tester only after they finish playing?','Do you know what result would make you kill this version of the idea?','Have you predicted a playtest result in writing before running the session, and checked yourself against it?']
      } },
    { id:'s4', t:'One worked example and the 30-day plan', level:'intermediate',
      goal:'See how a real project turned discipline into a written rule, then cut your own plan down to what 30 days can actually hold.', hours:2.5,
      steps:[
        { kind:'part', ref:'cs-go-game-backend/process/process-red-first', why:'One real engineering team turned test-before-you-build into a written rule because skipping it under deadline pressure was too easy otherwise. Your 30 days needs the same kind of forcing function.', do:'Write the one rule that would stop you from quietly skipping your own kill criterion when day 25 gets tight, based on how this team enforces red-first discipline.', min:30 },
        { kind:'topic', ref:'vertical-slice-mvp', why:'A vertical slice proves the whole loop works end to end at the smallest scope that still tells the truth about the idea.', do:'Cut your 30-day plan down to the smallest vertical slice that would still test your hypothesis, and list what you are deliberately leaving out.', min:35 },
        { kind:'topic', ref:'risk-and-dependencies', why:'The riskiest, least certain part of your plan is the part that should happen first, not last, while you still have time to change course.', do:'List the three riskiest assumptions in your 30-day plan, and reorder your plan so the riskiest one gets tested in week one.', min:25 },
        { kind:'checklist', ref:'scope-sanity', why:'A 30-day plan with no scope check is a wish list with dates on it.', do:'Run the scope sanity checklist against your 30-day plan now, before day one, not after you are already behind.', min:30 },
        { kind:'reflect', why:'A plan you have written down in your own words is one you can actually be held to, including by yourself.', do:'Write your day-by-day 30-day plan in one page: what ships each week, and what you would cut first if you fall behind.', min:30 }
      ],
      review:['hypothesis-driven-design'],
      check:{
        recall:['Why does a forcing function matter more on day 25 than on day one?','What makes a slice vertical instead of just small?','Why should the riskiest assumption get tested first, not last?'],
        build:'Write the one-page 30-day plan: what ships each week, the riskiest assumption tested first, and the cut list a scope check produced.',
        skip:['Can you name your riskiest assumption and when in your plan it gets tested?','Do you have a written forcing function that would stop you from skipping your own kill criterion?','Can you describe your vertical slice in one sentence without it including something you already agreed to cut?','Have you already run a scope check against a real plan and cut something because of it?']
      } }
  ]
});

PATH('technical-lead', {
  t:'Technical lead', tag:'Delegation, review and the incident that becomes a rule instead of a scar.',
  track:'leadership', level:'advanced', hours:10,
  audience:'Senior designers or engineers stepping into leading a small team, who already do the work and now have to make other people’s work better too.',
  outcome:'You can delegate and say no on purpose, run a review that actually improves the thing being reviewed, and turn an incident or a cut into a rule the team keeps.',
  prereq:['systems-designer','level-and-ux-designer'], next:[],
  stages:[
    { id:'s1', t:'What a lead actually does', level:'advanced',
      goal:'Separate what only you can do from what you are doing out of habit, and practice saying no on purpose.', hours:2,
      steps:[
        { kind:'topic', ref:'lead-role', why:'The job changes from doing the work to making other people’s work better, and most new leads keep doing the first job by default.', do:'List everything you did last week, and mark each item as only I can do this or someone else could, and it is time they did.', min:15 },
        { kind:'topic', ref:'lead-one-on-ones', why:'A 1:1 is the one recurring room where you actually find out what is wrong before it becomes a postmortem.', do:'Write the three questions you will ask in your next 1:1 that are not status updates, and the one thing you will do differently if the answer surprises you.', min:15 },
        { kind:'topic', ref:'team-and-collaboration', why:'Most lead failures are collaboration failures wearing a technical costume: unclear ownership, silent handoffs, decisions nobody remembers making.', do:'Pick one recent handoff on your team that went badly, and write down where ownership was unclear before anything else went wrong.', min:20 },
        { kind:'topic', ref:'lead-saying-no', why:'Every yes you give away is a commitment someone else now has to keep, usually without the context you had when you said it.', do:'Write the last three requests you said yes to, and for each, the one sentence you should have said instead if you had said no on purpose.', min:20 },
        { kind:'tool', ref:'delegate', why:'A task feels un-delegatable right up until you write down what it would actually take to hand it off, which the Delegation Planner forces you to do.', do:'Run one task from your only-I-can-do-this list through the AI Delegation Planner, and change its category if the plan shows it is wrong.', min:30 },
        { kind:'reflect', why:'Naming the change in your own words is what makes it a decision instead of an intention.', do:'Write one thing you are currently doing that should be delegated or refused, and the first concrete step you will take this week to make that true.', min:20 }
      ],
      review:[],
      check:{
        recall:['What is the difference between a job only you can do and one you are just used to doing?','Why does unclear ownership usually cause a handoff failure before anything technical does?','What does saying no on purpose require that saying yes by default does not?'],
        build:'Run the Delegation Planner on one real task and write the concrete first step for delegating or refusing it this week.',
        skip:['Can you sort your current task list into only-me and someone-else-now without hesitating?','Do you already ask at least one non-status question in every 1:1?','Can you point to a recent handoff failure and name exactly where ownership was unclear?','Have you already said no on purpose this month, and can you name what you said instead?']
      } },
    { id:'s2', t:'Conventions, onboarding and code review', level:'advanced',
      goal:'See how three real teams turned hard lessons into rules other people actually follow, then run a review that does the same.', hours:2.5,
      steps:[
        { kind:'topic', ref:'lead-conventions', why:'A convention nobody wrote down is a preference. A convention written down with the reason attached is a rule someone can follow without you in the room.', do:'Pick one unwritten rule your team already follows by habit, and write it down with the specific incident or cost that justifies it.', min:20 },
        { kind:'topic', ref:'lead-onboarding', why:'What a new person cannot find in their first week, they will either guess wrong or interrupt you to ask, forever.', do:'List the three things it took you longest to learn when you joined your current team, and check whether any of them are written down yet.', min:20 },
        { kind:'topic', ref:'lead-code-review', why:'A review that only checks for bugs misses the slower failure: a codebase nobody but the original author can safely change.', do:'Look at your last five reviews and count how many comments were about correctness versus about a future reader’s ability to understand the change.', min:20 },
        { kind:'part', ref:'cs-go-game-backend/process/process-conventions', why:'This backend team turned a lesson about migration PRs into a rule file instead of relying on memory. That is the exact move your unwritten rule from the first step needs to make.', do:'Check your own written rule from step one against the same test: would a new hire follow it without asking you?, based on how this team separated migration PRs and used rule files as memory.', min:20 },
        { kind:'part', ref:'cs-unity-mobile-client-ci/conv/conv-pr-review', why:'A bilingual PR template with a fixed checklist is what turned this team’s review from whatever the reviewer remembers to check into something repeatable.', do:'Compare your team’s actual review checklist, written or not, against this one, and write the single biggest gap.', min:20 },
        { kind:'part', ref:'cs-unity-multiplatform-port/process/process-conventions', why:'Two coding styles under one roof forced this team to write down a null policy instead of arguing about it per pull request. Most teams have an equivalent argument still happening live.', do:'Name one recurring argument on your own team that a written convention, like this one, would end for good.', min:20 },
        { kind:'checklist', ref:'design-review', why:'Running the same checklist on someone else’s work as on your own is what proves it is a real standard and not just your taste.', do:'Run the design review checklist on a pull request or design doc you did not write, and compare your verdict with the author’s own sense of it.', min:25 }
      ],
      review:['lead-role'],
      check:{
        recall:['What turns a preference into a convention someone can actually follow?','What did comparing correctness comments to readability comments in your reviews show you?','What test decides whether a written convention is actually working?'],
        build:'Write down one previously unwritten rule with its justifying incident, and run the design review checklist on a piece of work you did not author.',
        skip:['Can you name an unwritten rule your team follows, and the incident that caused it?','Do you already know what a new hire on your team would waste their first week guessing at?','Have you compared your own review comments for correctness versus readability, and did the split surprise you?','Can you name a recurring argument on your team that a written convention would settle?']
      } },
    { id:'s3', t:'Incidents, risk and postmortems', level:'advanced',
      goal:'Treat an incident as a source of a rule instead of a source of blame, and keep a risk register that actually gets read.', hours:2,
      steps:[
        { kind:'topic', ref:'lead-incidents', why:'A blameless postmortem is not about being nice. It is the only version that gets you the truth about what actually happened.', do:'Write down your team’s last incident in two versions: the blame version and the systems version. Notice which one actually points at a fix.', min:25 },
        { kind:'topic', ref:'pm-risk', why:'A risk register nobody reads is a document, not a tool. The order you de-risk things in matters more than the list itself.', do:'List your three biggest current risks, and reorder them by which one would hurt most if it hit tomorrow, not by which one is easiest to write about.', min:25 },
        { kind:'topic', ref:'pm-postmortems', why:'A postmortem that does not produce a rule or a written change is a story. Only the second kind actually prevents a repeat.', do:'Take your last postmortem, or write one now for your last incident, and check whether it produced an actual rule or just an apology.', min:25 },
        { kind:'checklist', ref:'design-review', why:'Reviewing the fix that came out of a postmortem catches the version that treats the symptom instead of the actual failure.', do:'Run the design review checklist against your last postmortem’s proposed fix, before it becomes a task nobody revisits.', min:20 },
        { kind:'reflect', why:'The risk you are avoiding naming out loud is usually the one doing the most damage by staying unnamed.', do:'Write the risk you are most currently ignoring, and the one piece of evidence that would force you to finally act on it.', min:20 }
      ],
      review:['lead-conventions'],
      check:{
        recall:['Why does a blameless version of an incident point at a fix better than a blame version?','What is the ordering test for a risk register, and why does it matter more than the list?','What does a postmortem have to produce to count as more than a story?'],
        build:'Write or revisit one postmortem and run the design review checklist against its proposed fix before it goes into the backlog unreviewed.',
        skip:['Can you write both a blame version and a systems version of your last incident, and see the difference?','Is your risk register ordered by actual damage, or by whatever was easiest to write down?','Can you point to a postmortem that produced a real rule, not just an apology?','Do you know the risk you are currently avoiding naming, and what would force your hand?']
      } },
    { id:'s4', t:'Scope, planning and quality', level:'advanced',
      goal:'Make the cut on purpose, plan against a real milestone, and treat build health as a number you own, not an accident.', hours:2,
      steps:[
        { kind:'topic', ref:'pm-scoping-cuts', why:'A scope cut you make on purpose beats a scope cut that happens to you two weeks before a deadline.', do:'Look at your current plan and name the one item you would cut first if the deadline moved a month closer today.', min:25 },
        { kind:'topic', ref:'planning-and-milestones', why:'A milestone that only tracks dates hides the actual question, which is what has to be true for the next milestone to even make sense.', do:'For your next milestone, write the one thing that has to be true by then for the milestone after it to still make sense.', min:25 },
        { kind:'topic', ref:'quality-and-build-health', why:'Build health is a leading indicator, not a housekeeping task. A team that ignores it is reading the wrong dashboard.', do:'Check your team’s current build health signal (pass rate, flake rate, time to green) and write whether it is trending toward or away from the next milestone.', min:25 },
        { kind:'checklist', ref:'scope-sanity', why:'A scope check applied to the whole roadmap catches what a scope check on one feature never will.', do:'Run the scope sanity checklist against your team’s current roadmap, not just your own task list.', min:25 },
        { kind:'reflect', why:'The cut you are avoiding making is usually costing the team more than the feature it is protecting is worth.', do:'Write the one cut you are avoiding making, and what it is currently costing the team by staying in scope.', min:20 }
      ],
      review:['lead-incidents'],
      check:{
        recall:['Why is a scope cut made on purpose better than one made under deadline pressure?','What question should a milestone actually answer, beyond a date?','Why is build health a leading indicator rather than housekeeping?'],
        build:'Run the scope sanity checklist against the full roadmap, and write the one cut it justifies that you have been avoiding.',
        skip:['Can you name the item you would cut first if your deadline moved a month closer, right now?','Do you know what has to be true by your next milestone for the one after it to make sense?','Is your build health signal trending toward or away from your next milestone, and do you know why?','Can you name the cut you are avoiding, and its actual cost to the team?']
      } },
    { id:'s5', t:'One workflow, seen whole', level:'advanced',
      goal:'See a process end to end instead of just your own step in it, and turn what you notice into a change.', hours:1.5,
      steps:[
        { kind:'flow', ref:'cs-unity-mobile-client-ci/pull-request', why:'Most people only ever see their own step in a pull request. Seeing the whole shape is what lets a lead spot where the process actually breaks.', do:'Walk this workflow chart end to end and write down the one step where your own team’s process differs from it, and why.', min:30 },
        { kind:'smell', ref:'docs-nobody-reads', why:'A written convention nobody reads is exactly as useful as one that was never written, and this is the smell for catching that quietly.', do:'Check one convention you wrote earlier in this path against it: would anyone actually find it?, based on the “The documents are stale or ignored” smell.', min:20 },
        { kind:'checklist', ref:'design-review', why:'Turning what you just saw into a checklist gate is what makes a good process observation into an actual change.', do:'Run the design review checklist one more time, but this time write down which of its questions your own team’s process currently has no way to answer.', min:25 },
        { kind:'reflect', why:'The change you can name and defend is the one you will actually make, past this session.', do:'Write the one process change you would make to your own team’s pull request or review flow, and who you would need to convince first.', min:20 }
      ],
      review:['pm-scoping-cuts'],
      check:{
        recall:['What can seeing a whole workflow chart show you that seeing only your own step cannot?','What test does the docs-nobody-reads smell suggest for a written convention?','What made the process change you named the right one to lead with?'],
        build:'Write the one process change you would propose, who you need to convince, and the one question from the design review checklist your team currently cannot answer.',
        skip:['Have you already walked a workflow end to end and found where your own process actually differs?','Can you name one of your team’s written conventions that nobody actually reads anymore?','Do you know the one process change you would lead with, and who would need to agree to it?','Can you defend that change to someone who is happy with how things work today?']
      } }
  ]
});

PATH('interview-prep-designer', {
  t:'Interview prep: designer', tag:'The stories and the frameworks, rehearsed until they are fast.',
  track:'interview', level:'intermediate', hours:10,
  audience:'Designers preparing for a job interview who already have the fundamentals and need to turn them into fast, concrete answers.',
  outcome:'You can answer a question in any core design category in under two minutes, back it with a real story, and speak to at least one engineering constraint you have actually worked against.',
  prereq:['game-designer-foundations','systems-designer','level-and-ux-designer'], next:[],
  stages:[
    { id:'s1', t:'Player, motivation and the story you tell', level:'intermediate',
      goal:'Rehearse the player and experience questions out loud, and have one game you can dissect on demand.', hours:2,
      steps:[
        { kind:'topic', ref:'who-is-the-player', tab:'interview', why:'Interviewers ask you to defend a player before they ask about a mechanic. If you cannot name one fast, everything after sounds invented.', do:'Open the interview tab for Who is the player? and answer two of its questions out loud, timing yourself at two minutes each.', min:25 },
        { kind:'topic', ref:'core-experience', tab:'interview', why:'The core experience question is where a vague pitch gets caught. Practicing it out loud is the only way to find the vague part before an interviewer does.', do:'Open the interview tab for Core experience and answer its hardest question out loud, then write the one word you kept repeating without defining it.', min:30 },
        { kind:'tool', ref:'dissect', why:'A dissected reference game is the fastest way to have a concrete example ready when someone asks what game you admire and why.', do:'Dissect one game you did not design, and write the two-sentence version you would actually say out loud in an interview.', min:30 },
        { kind:'reflect', why:'A story is only fast to tell once you have written it down once already.', do:'Write one story in Situation, Task, Action, Result form about a time you had to defend a player or a fantasy choice against pushback.', min:25 }
      ],
      review:[],
      check:{
        recall:['What does defending a player actually mean in an interview answer?','What word did you catch yourself using without defining it?','What is the fastest way to have a concrete reference-game example ready?'],
        build:'Write the two-sentence dissection summary and the full STAR story, then say both out loud once, timed.',
        skip:['Can you answer who is the player for your own project in under two minutes, unscripted?','Do you already have a reference game dissected and ready to describe in two sentences?','Have you written a STAR story about a player or fantasy decision before today?','Can you catch yourself using an undefined term like fun or engaging and replace it on the spot?']
      } },
    { id:'s2', t:'Loops, decisions and systems under pressure', level:'intermediate',
      goal:'Answer the systems questions with a real constraint behind them, not just theory.', hours:2,
      steps:[
        { kind:'topic', ref:'core-loop', tab:'interview', why:'Walk me through your core loop is close to a universal design interview question, and it rewards precision over enthusiasm.', do:'Open the interview tab for The core loop and answer its question about a weak loop out loud, using a real loop you have built.', min:25 },
        { kind:'topic', ref:'economy-and-resources', tab:'interview', why:'Economy questions test whether you can explain a system’s tradeoffs simply, without hiding behind spreadsheet vocabulary.', do:'Open the interview tab for Economy and resources and answer its hardest question as if explaining it to a non-designer on the hiring panel.', min:25 },
        { kind:'checklist', ref:'design-review', why:'How do you know a feature is worth building is best answered with a structure, not a vibe, and the design review checklist is that structure.', do:'Answer how do you know a feature is worth building using the design review checklist’s own categories as your outline.', min:20 },
        { kind:'part', ref:'cs-go-game-backend/realtime/realtime-matchmaking', why:'A concrete engineering constraint you can speak to shows you have actually worked across a boundary, not just theorized about one from the design side.', do:'Write the two sentences you would use to explain a matchmaking or fairness tradeoff to a non-technical interviewer, based on this part on ticket-based matchmaking.', min:25 },
        { kind:'reflect', why:'Interviewers remember the specific story, not the general claim behind it.', do:'Write a STAR story about a time an economy or loop decision met a real constraint, technical or otherwise, and what you changed because of it.', min:25 }
      ],
      review:['who-is-the-player'],
      check:{
        recall:['What makes a core loop answer precise instead of just enthusiastic?','How would you explain your economy’s central tradeoff to someone non-technical?','What did the matchmaking part give you that pure design theory would not?'],
        build:'Write your two-sentence engineering-tradeoff explanation and your STAR story about a systems decision under a real constraint.',
        skip:['Can you describe your core loop’s weak link out loud in under a minute?','Can you explain your economy’s central tradeoff to someone with no design background?','Have you already got a concrete engineering-constraint story ready for a systems interview question?','Do you have a STAR story about a system decision that met real pushback?']
      } },
    { id:'s3', t:'Level, UX and reading a room', level:'advanced',
      goal:'Answer the level and UX questions with evidence from watching a player, not from a survey.', hours:2,
      steps:[
        { kind:'topic', ref:'level-structure', tab:'interview', why:'How do you pace a level is a question that rewards a name for what you did, not just a description of it.', do:'Open the interview tab for Level structure and answer its question out loud, naming the structural beats you actually used.', min:25 },
        { kind:'topic', ref:'onboarding', tab:'interview', why:'How do you make sure players understand something is one of the most common UX interview questions, and the strongest answers describe watching, not asking.', do:'Open the interview tab for Onboarding and answer its hardest question, making sure your answer describes what you watched a player do, not what they told you.', min:25 },
        { kind:'checklist', ref:'onboarding-audit', why:'Quoting a specific line from a real audit is more convincing than describing your process in general terms.', do:'Prepare your onboarding answer by running the silent onboarding audit and picking one line from it to quote directly.', min:20 },
        { kind:'part', ref:'cs-go-game-backend/simparity/simparity-determinism', why:'Fairness and cheating come up in almost every systems or live-game interview, and a real story about keeping simulation fair across clients beats a general claim about caring about fairness.', do:'Write the sentence you would use if asked about fairness or cheating in your own game, based on how this team kept simulation results fair and reproducible across clients and servers.', min:25 },
        { kind:'reflect', why:'The best UX stories are diagnostic, not decorative. Writing one down forces it to actually be diagnostic.', do:'Write a STAR story about a UX or level problem you diagnosed by watching a player instead of by asking them what they thought.', min:25 }
      ],
      review:['core-loop'],
      check:{
        recall:['Why does naming the structural beats you used beat describing the level generally?','What should a strong onboarding answer describe watching, instead of asking?','What did the determinism part give you for a fairness question?'],
        build:'Quote one line from your onboarding audit run and write your STAR story about a UX problem diagnosed by observation.',
        skip:['Can you name the structural beats in a level you have shipped or built, on the spot?','Do you have a specific line from an onboarding audit ready to quote?','Can you speak to a fairness or cheating question with a concrete example, not just a value statement?','Do you have a STAR story about a UX fix that came from watching, not asking?']
      } },
    { id:'s4', t:'Production judgment', level:'advanced',
      goal:'Show you know when to stop prototyping, and that a playtest has actually changed your mind before.', hours:2,
      steps:[
        { kind:'topic', ref:'playtesting', tab:'interview', why:'Tell me about a playtest that surprised you tests whether you actually update on evidence, which is what the role is really asking about.', do:'Open the interview tab for Playtesting and answer its question about a surprising result out loud, using a real session if you have one.', min:25 },
        { kind:'topic', ref:'hypothesis-driven-design', tab:'interview', why:'How do you know when to stop prototyping rewards a structure, a hypothesis with a kill criterion, not a feeling about being done.', do:'Open the interview tab for Hypothesis-driven design and answer its hardest question, naming an actual kill criterion you have used.', min:25 },
        { kind:'checklist', ref:'pre-prototype', why:'Rehearsing this answer against a real checklist keeps it concrete instead of aspirational.', do:'Rehearse how do you know when to stop prototyping using the pre-prototype checklist as your list of evidence, not just your gut.', min:20 },
        { kind:'tool', ref:'dissect', why:'A second dissected game, in a genre you have not worked in, shows range beyond your one comfortable example.', do:'Dissect a second game, this time in a genre you have never worked in, and note the one thing that transfers to your own work.', min:25 },
        { kind:'reflect', why:'A time I was wrong is one of the hardest interview questions to answer well without a story ready in advance.', do:'Write a STAR story about a time a playtest or a hypothesis proved you wrong, and exactly what you did differently afterward.', min:25 }
      ],
      review:['level-structure'],
      check:{
        recall:['What does the stop-prototyping answer reward, structure or feeling?','What kill criterion have you actually used, and can you name it fast?','What transferred from the second game you dissected?'],
        build:'Write your kill-criterion example and your STAR story about being proven wrong by a playtest.',
        skip:['Can you name a real kill criterion you have used to stop prototyping, without inventing one on the spot?','Do you have a second dissected game outside your usual genre ready to reference?','Can you tell a playtest-surprised-me story in under two minutes?','Do you have a story ready for tell me about a time you were wrong that is not generic?']
      } },
    { id:'s5', t:'Put it together', level:'advanced',
      goal:'Rehearse the harder, less scripted questions and the two-minute walkthrough that ties everything together.', hours:2,
      steps:[
        { kind:'diagnostic', ref:'fun', why:'What makes your game fun is a question that punishes vague answers, and the fun diagnostic forces you to name dimensions instead of adjectives.', do:'Run the fun diagnostic on your strongest project and write the one-sentence summary you would give an interviewer who asks what makes it fun.', min:25 },
        { kind:'smell', ref:'pillars-are-slogans', why:'What are your design pillars is a trap for slogans. This smell exists specifically to catch a pillar that cannot decide anything.', do:'Write how you would answer what are your design pillars without reciting a slogan that decides nothing, based on the “The pillars cannot decide anything” smell.', min:20 },
        { kind:'checklist', ref:'ai-verify', why:'How do you use AI in your process is now a near-universal interview question, and the strongest answers describe a safeguard, not just a workflow.', do:'Prepare your answer to how do you use AI tools in your process using the AI output verification checklist as your concrete example of a safeguard.', min:25 },
        { kind:'tool', ref:'feature', why:'Rehearsing a feature defense against the same nine questions you would actually use makes the answer sound like judgment, not improvisation.', do:'Rehearse defending a real feature decision using the Should We Build This? questions as your talking points, out loud, timed.', min:30 },
        { kind:'reflect', why:'Walk me through your process is the question every other answer in this path has been building toward.', do:'Write the answer to walk me through your process end to end, in under two minutes spoken, using one project as the spine of the answer.', min:25 }
      ],
      review:['playtesting'],
      check:{
        recall:['What does the fun diagnostic force you to name instead of an adjective?','What makes a design pillar a slogan instead of a decision tool?','What should an AI-process answer describe, beyond a workflow?'],
        build:'Write and time your two-minute walk-through-your-process answer, and your one-sentence fun-diagnostic summary.',
        skip:['Can you answer what makes your game fun in one sentence, using a real dimension, not an adjective?','Can you state a design pillar that has actually killed a bad idea, with the story attached?','Do you have a concrete answer ready for how you use AI tools, with a named safeguard?','Can you deliver your full walk-through-your-process answer in under two minutes, timed?']
      } }
  ]
});
