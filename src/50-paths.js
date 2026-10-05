/* =====================================================================
   LEARNING PATHS: beginner to expert, sequencing existing content
   A path does not duplicate a topic, tool, checklist, smell, diagnostic,
   project part, workflow chart or prompt. It walks the reader through the
   ones that already exist, in an order, with a reason for each stop, a
   concrete exercise, and a checkpoint per stage (asked one question at a
   time; see 90-app.js: fightHTML). Progress lives in
   localStorage (see 90-app.js: pathProgress, pathNextStep, stepHref,
   stepTitle). No streaks, no badges, no guilt copy.

   PATH(id, {
     t:'', tag:'',                          // title, one-line pitch
     track:'',                              // one of TRACKS below
     level:'',                              // one of LEVELS below: the ENTRY level
     hours:0,                               // sum of stage hours
     audience:'', outcome:'',               // 1-2 sentences each
     pick:'',                               // under 60 characters: the quick-pick line on the door
     prereq:[''], next:[''],                // other path ids, may be empty
     prereqAny:[''],                        // optional: paths of which ONE is enough (the learner has done any one of them)
     stages:[{
       id:'', t:'', level:'', goal:'', hours:0,
       steps:[{
         kind:'topic'|'tool'|'checklist'|'smell'|'diagnostic'|'part'|'flow'|'prompt'|'platform'|'game'|'engine'|'reflect',
         ref:'',                            // omitted for 'reflect'
         tab:'',                            // optional, topic only: 'overview'|'godot'|'unity'|'interview'
         alt:'',                            // optional: the other engine ('godot'|'unity') the step also covers; the learner's last choice picks the page
         lens:'',                           // optional, game steps only: the one lens the step reads
         why:'', do:'', min:0                // why now (1 sentence), the exercise (1-3 sentences), 10-60
       }],
       review:[''],                          // 0-2 topic ids from EARLIER stages, for retrieval and spacing
       check:{ recall:[{q:'', a:''}], build:'', skip:[''] }  // 2-4 recall questions with answer outlines, one build task, 3-5 skip questions
     }]
   })

   Ref resolution by kind:
     topic      -> TOPICS[ref]                                    #/map/t/<ref>
     tool       -> an id in TOOLS (05-registry.js)                 #/build/<ref>
     checklist  -> an id in CHECKLISTS                             #/checklists/<ref>
     smell      -> an id in SMELLS                                 #/smell/<ref>
     diagnostic -> an id in DIAGNOSTICS (05-registry.js)           #/diagnose/<ref>
     part       -> '<cs>/<sys>/<part>' resolving through CASE_STUDIES  #/experience/<cs>/<sys>/<part>
     flow       -> '<cs>/<flowId>' resolving through CASE_STUDIES  #/experience/<cs>/flow/<flowId>
     prompt     -> an id in PROMPT_TEMPLATES                       #/prompts/<ref>
     platform   -> an id in PLATFORMS (15-platforms.js)            #/platforms/<ref>
     game       -> an id in REFERENCE_GAMES (14-references.js)     #/games/<ref>  (lens:'<id>' opens #/games/<ref>/<lens>)
     reflect    -> no ref; 'do' is the writing prompt, answered on the path page itself

   Rules (checked by validate.js): 4-6 stages; 3-8 steps per stage; every
   step's min is 10-60; a stage's hours is the sum of its step minutes
   rounded to hours, within 10%; a path's hours is the sum of its stages,
   within 10%; every ref resolves for its kind; no stage runs more than 4
   consecutive 'topic' steps from one domain (interleave); at least one
   'tool' or 'checklist' step in the path (a stage holds one only when it serves the stage goal); every stage has a check with 2-4
   recall questions, a non-empty build task, and 3-5 skip questions; stage
   levels are non-decreasing across a path; prereq and next resolve to
   other path ids (prereqAny too, and a prereqAny path also lists this path in its
   next); ids are unique.
   ===================================================================== */
/**
 * @typedef {object} PathStep
 * @property {'topic'|'tool'|'checklist'|'smell'|'diagnostic'|'part'|'flow'|'prompt'|'platform'|'game'|'engine'|'reflect'} kind
 * @property {string} [ref]   omitted for 'reflect'
 * @property {'overview'|'godot'|'unity'|'interview'} [tab]   topic steps only
 * @property {string} [lens]   game steps only: the lens the step reads
 * @property {'godot'|'unity'} [alt]   the other engine a godot/unity step also covers
 * @property {string} why
 * @property {string} do
 * @property {number} min
 */
/**
 * @typedef {object} PathStage
 * @property {string} id
 * @property {string} t
 * @property {string} level
 * @property {string} goal
 * @property {number} hours
 * @property {PathStep[]} steps
 * @property {string[]} review
 * @property {{recall: (string|{q: string, a: string, ideas?: string[]})[], build: string, skip: string[], solution?: {outline: string, selfcheck: string[]}}} check
 */
/**
 * @typedef {object} Path
 * @property {string} [id]   set by PATH()
 * @property {string} t
 * @property {string} tag
 * @property {string} track
 * @property {string} level
 * @property {number} hours
 * @property {string} audience
 * @property {string} outcome
 * @property {string} pick
 * @property {string[]} prereq
 * @property {string[]} [prereqAny]   one of these is enough
 * @property {string[]} next
 * @property {PathStage[]} stages
 */
/** @type {Path[]} */
const PATHS = [];
/** @param {string} id @param {Path} o */
function PATH(id, o){ o.id = id; PATHS.push(o); }
const TRACKS = [['design','Design'],['engineering','Engineering'],['production','Production'],['leadership','Leadership'],['interview','Interview prep']];
/* The chooser on the paths door: three answers pick one path. Each goal and
   level lists candidate paths in order of preference; paths whose
   prerequisites are not done move behind those whose are, and when the pick
   still has an unmet prerequisite the door says to start there first. A path's
   prereqAny (one of several) never forces that detour: the door only names
   the paths that make a good base for someone new to it. The
   time answer is hours per week: it only turns a path's own hours into
   "about N weeks"; it never changes the pick. validate.js checks that every combination picks a real
   path. */
const CHOOSER = {
  goals: [['design','Design games'],['gameplay','Program gameplay'],['backend','Build backends and servers'],['ship','Ship a game'],['lead','Lead a team'],['iv-design','Interview for a design job'],['iv-eng','Interview for an engineering job'],['ai','Build with AI'],['elsewhere','Take game skills elsewhere']],
  levels: [['new','New to it'],['some','Some experience'],['senior','Experienced']],
  times: /** @type {[string, string, number][]} */ ([['2','2 hours a week',2],['5','5 hours a week',5],['10','10 hours a week or more',10]]),
  paths: /** @type {Record<string, Record<string, string[]>>} */ ({
    design:{ new:['first-tiny-game','game-designer-foundations','idea-to-prototype-30-days'], some:['systems-designer','level-and-ux-designer','casual-game-people-keep','games-that-broke-the-mould','study-the-hits-play','study-the-hits-worlds'], senior:['senior-game-designer','systems-designer','level-and-ux-designer','casual-game-people-keep','games-that-broke-the-mould','study-the-hits-play','study-the-hits-worlds'] },
    gameplay:{ new:['gameplay-engineer-godot','gameplay-engineer-unity'], some:['gameplay-engineer-godot','gameplay-engineer-unity','game-ai-programmer','performance-engineer'], senior:['senior-game-developer-ai-era','game-ai-programmer','gameplay-engineer-godot','gameplay-engineer-unity','performance-engineer'] },
    backend:{ new:['live-game-backend-engineer'], some:['live-game-backend-engineer','netcode-server-engineer','performance-engineer'], senior:['senior-game-developer-ai-era','netcode-server-engineer','live-game-backend-engineer','realtime-at-scale-engineer','performance-engineer'] },
    ship:{ new:['ship-it'], some:['ship-it','build-and-release-engineer','casual-game-people-keep'], senior:['ship-it','build-and-release-engineer','casual-game-people-keep'] },
    lead:{ new:['technical-lead'], some:['technical-lead','studio-practice-ai-era'], senior:['technical-lead','senior-game-developer-ai-era','studio-practice-ai-era','senior-game-designer'] },
    'iv-design':{ new:['interview-prep-designer'], some:['interview-prep-designer'], senior:['interview-prep-designer'] },
    'iv-eng':{ new:['interview-prep-engineer'], some:['interview-prep-engineer'], senior:['interview-prep-engineer'] },
    ai:{ new:['ai-engineering-for-game-devs'], some:['ai-engineering-for-game-devs'], senior:['senior-game-developer-ai-era','ai-engineering-for-game-devs'] },
    elsewhere:{ new:['game-skills-elsewhere'], some:['game-skills-elsewhere'], senior:['game-skills-elsewhere'] }
  })
};
/** Whole weeks a path takes at a pace of `hpw` hours a week. @param {{hours:number}} p @param {number} hpw */
const pathWeeks = (p, hpw) => Math.max(1, Math.ceil(p.hours / hpw));
/** @param {string} goal @param {string} level @param {string} time @param {string[]} [done] ids of finished paths */
function choosePath(goal, level, time, done = []){
  const list = ((CHOOSER.paths[goal] || {})[level] || []).map(id => PATHS.find(p => p.id === id)).filter(p => !!p);
  if(!list.length) return null;
  const t = CHOOSER.times.find(x => x[0] === time), hpw = t ? t[2] : 0;
  // Experienced learners are taken to know a root beginner path; anyone else has to have done it.
  const unmet = p => p.prereq.map(id => PATHS.find(x => x.id === id)).filter(x => x && !done.includes(x.id) && !(level !== 'new' && x.level === 'beginner' && !x.prereq.length));
  const ranked = list.map(p => ({ p, gap: unmet(p).length > 0 })).sort((a, b) => +a.gap - +b.gap).map(x => x.p);
  const path = ranked[0]; let start = unmet(path)[0] || null;
  while(start && unmet(start).length) start = unmet(start)[0];
  // prereqAny is a soft entry: it never forces a detour, but a learner new to it is told which paths make a good base.
  const anyOf = level === 'new' && (path.prereqAny || []).length && !path.prereqAny.some(id => done.includes(id)) ? path.prereqAny.map(id => PATHS.find(x => x.id === id)).filter(x => !!x) : [];
  return { path, alt: ranked.slice(1), start, anyOf, hpw, weeks: hpw ? pathWeeks(path, hpw) : 0 };
}
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
   Tool and diagnostic titles come from the registry (05-registry.js), which
   the layout checker's sandbox loads with the rest of the data.
   --------------------------------------------------------------------- */
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
// A step that offers both engines ('alt') opens the one this browser chose last
// (the app stores it under playable.engine), else the step's own.
function pickedEngine(step){
  const own = step.kind === 'engine' ? step.ref : step.tab; let c = null;
  try { c = JSON.parse(/** @type {any} */ (globalThis).localStorage.getItem('playable.engine')); } catch(e){}
  return step.alt && (c === own || c === step.alt) ? c : own;
}
const ENGINE_NAMES = { godot:'Godot', unity:'Unity' };
// A topic step on an engine or interview tab says so, so the same topic listed
// twice in a stage reads as two different tasks.
function topicTabSuffix(step){
  if(step.alt) return `: build it in ${ENGINE_NAMES[step.tab]} or ${ENGINE_NAMES[step.alt]}`;
  return ({ godot:': in Godot', unity:': in Unity', interview:': interview questions' })[step.tab] || '';
}
function stepTitle(step){
  switch(step.kind){
    case 'topic': { const t = TOPICS[step.ref]; return (t ? t.t : step.ref) + topicTabSuffix(step); }
    case 'tool': { const x = TOOLS.find(([id]) => id === step.ref); return x ? x[1] : step.ref; }
    case 'checklist': { const x = CHECKLISTS.find(c => c.id === step.ref); return x ? x.t : step.ref; }
    case 'smell': { const x = SMELLS.find(s => s.id === step.ref); return x ? x.t : step.ref; }
    case 'diagnostic': { const x = DIAGNOSTICS.find(([id]) => id === step.ref); return x ? (/diagnostic/i.test(x[2]) ? x[2] : `${x[2]} (diagnostic)`) : step.ref; }
    case 'prompt': { const x = PROMPT_TEMPLATES.find(p => p.id === step.ref); return x ? x.t : step.ref; }
    case 'part': { const { part } = findCasePart(step.ref); return part ? part.t : step.ref; }
    case 'flow': { const { flow } = findCaseFlow(step.ref); return flow ? flow.t : step.ref; }
    case 'platform': { const x = PLATFORMS.find(p => p.id === step.ref); return x ? `${x.t} guide` : step.ref; }
    case 'game': { const x = REFERENCE_GAMES.find(g => g.id === step.ref); return x ? `${x.t}, taken apart` : step.ref; }
    case 'engine': { if(step.alt) return `${ENGINE_NAMES[step.ref]} or ${ENGINE_NAMES[step.alt]} guide`; const x = ENGINES.find(e => e.id === step.ref); return x ? `${x.t} guide` : step.ref; }
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
    case 'topic': return '#/map/t/' + step.ref + '/' + (step.alt ? pickedEngine(step) : step.tab || 'overview');
    case 'tool': return '#/build/' + step.ref;
    case 'checklist': return '#/checklists/' + step.ref;
    case 'smell': return '#/smell/' + step.ref;
    case 'diagnostic': return '#/diagnose/' + step.ref;
    case 'prompt': return '#/prompts/' + step.ref;
    case 'platform': return '#/platforms/' + step.ref;
    case 'game': return '#/games/' + step.ref + (step.lens ? '/' + step.lens : '');
    case 'engine': return '#/engines/' + (step.alt ? pickedEngine(step) : step.ref);
    case 'part': { const { cs, sys, part } = findCasePart(step.ref); return cs && sys && part ? `#/experience/${cs.id}/${sys.id}/${part.id}` : '#/experience'; }
    case 'flow': { const { cs, flow } = findCaseFlow(step.ref); return cs && flow ? `#/experience/${cs.id}/flow/${flow.id}` : '#/experience'; }
    case 'reflect': return pathId ? '#/paths/' + pathId + (stageId ? '/' + stageId : '') : '#/paths';
    default: return '#/paths';
  }
}

PATH('first-tiny-game', {
  t:'Never made a game? Make a tiny one', tag:'Play like a designer, plan one small game on paper, build it and watch someone play.',
  pick:'You play a lot, have never made a game, and have no project',
  track:'design', level:'beginner', hours:8.33,
  audience:'Someone who plays a lot of games, has never made one, is not a programmer and has no project yet.',
  outcome:'You have made and tested one tiny game of your own, a one-button jumper, and you can say what you pressed, what happened, what you decided and what you would change next.',
  prereq:[], next:['game-designer-foundations'],
  stages:[
    { id:'s1', t:'Play like a designer', level:'beginner',
      goal:'Look at games you already know as a designer would, and meet the practice game this whole path builds.', hours:2,
      steps:[
        { kind:'topic', ref:'who-is-the-player', why:'Before you look at any game, decide who it is for. You will need that answer for your own.', do:'Meet the practice game you will make in this path: a one-button game where you jump over obstacles that come faster and faster. Write three sentences about who would enjoy it and who would quit in the first minute.', min:20 },
        { kind:'game', ref:'flappy-bird', lens:'gameplay', why:'Flappy Bird is one button and one rule, which is close to the game you are about to make.', do:'Read its gameplay lens. Then write what the one button does in Flappy Bird and what you would have to decide each time you press it.', min:15 },
        { kind:'game', ref:'tetris', lens:'gameplay', why:'Tetris gets harder only because the pieces fall faster, which is the same trick your practice game will use.', do:'Read its gameplay lens. Then write what gets faster as you play Tetris, and what that does to your decisions.', min:15 },
        { kind:'game', ref:'super-mario', lens:'art', why:'Mario shows how a game tells the player what is safe, what is dangerous and what to do next without any words.', do:'Read its art lens. Then note two things on screen that tell a jumping player what to do, and sketch how your practice game could show an obstacle in the same way.', min:15 },
        { kind:'topic', ref:'core-loop', why:'The core loop is what a player does again and again. It is the first thing to get right in any game.', do:'Pick one game you know well and write its loop in five short lines: what you decide, what you do, what happens, what the game shows you, and the new situation you are in.', min:25 },
        { kind:'reflect', why:'Writing down what you do while playing is the habit that turns a player into a designer.', do:'Play one short game for ten minutes. Write down what you press, what happens on screen and what you decide, in three short lists. Keep them for the next stage.', min:30 }
      ],
      review:[],
      check:{
        recall:[
          { q:'What is a core loop?', a:'The short set of steps a player repeats: they decide, act, see what happened and face a new situation. It is the part of the game they do the most.' },
          { q:'Why does Tetris get harder over time?', a:'The pieces fall faster, so there is less time to decide. The rules stay the same; only the pressure changes.' },
          { q:'Why write down what you press, what happens and what you decide?', a:'It splits a game into the player action, the game response and the choice in between. If one of those is missing, the game has a gap you can fix.' }
        ],
        build:'Write the three lists (what you press, what happens, what you decide) for one game you played in this stage, on one page.',
        skip:['Can you describe the loop of a game you know in five lines?','Can you say what one button does in a game and what you decide before pressing it?','Can you say who the practice game is for and who would quit?']
      } },
    { id:'s2', t:'Plan the jumper on paper', level:'beginner',
      goal:'Write down how the practice game works before you build anything.', hours:1.5,
      steps:[
        { kind:'topic', ref:'feedback-and-affordance', why:'A player with one button must be able to see when to press it and what it did.', do:'For the practice game, write what the player sees and hears when they jump, land and crash, and what shows an obstacle is coming.', min:20 },
        { kind:'topic', ref:'difficulty', why:'Your game gets harder by getting faster. You need to decide how fast and how soon.', do:'Write the speed of the first obstacle, how it changes every ten seconds, and the point where you think most players will fail.', min:20 },
        { kind:'topic', ref:'mechanics-and-rules', why:'A tiny game needs very few rules. Fewer rules means less to build.', do:'List every rule of the practice game in one line each, such as the jump height or what happens on a crash. Cross out any rule you can live without.', min:20 },
        { kind:'tool', ref:'loop', why:'Putting the loop in a diagram shows the weak link before you spend time building it.', do:'Build the practice game loop in the Game Loop Builder, run its weak-link check and write down the one change you will make.', min:30 }
      ],
      review:['core-loop'],
      check:{
        recall:[
          { q:'How does the practice game get harder?', a:'The obstacles come faster. The jump and the rules stay the same, so the player has less time to decide.' },
          { q:'Why plan the rules before building?', a:'Every extra rule is more to build and more to test. A short list lets you cut what the game does not need while cutting is still cheap.' },
          { q:'What does feedback do for a one-button game?', a:'It tells the player what their press did and when to press next, such as a sound on landing or a clear shape for the obstacle.', ideas:['what their press did', 'when to press next'] }
        ],
        build:'Write a one-page plan for the practice game: the loop, the rules, the starting speed, how it speeds up and what the player sees and hears.',
        skip:['Do you know how fast the first obstacle moves?','Can you list the rules of the practice game on one page?','Do you know the one weak link in your loop?']
      } },
    { id:'s3', t:'Build it', level:'beginner',
      goal:'Make the practice game playable, with a player who jumps, obstacles that move and a crash that ends the run.', hours:3.33,
      steps:[
        { kind:'topic', ref:'prototyping', why:'A prototype is the cheapest thing that lets you try your idea. Yours is only a few shapes.', do:'Write the one question your first build has to answer: is jumping over obstacles fun for one minute? Plan to use plain boxes and no art.', min:20 },
        { kind:'engine', ref:'godot', alt:'unity', why:'Godot is free and its scripting language is easy to read. Unity is the other common first choice; use its guide instead if you prefer it.', do:'Install Godot 4 and follow the first tutorial on its own site for one hour. If you do not finish it, that is normal; you will use what you learned in the next two steps.', min:60 },
        { kind:'topic', ref:'three-cs', why:'How the box moves, what the button asks of it and what you can see decide whether the jump feels good.', do:'In the engine, make a box that sits on a floor and jumps when you press one key. Then change the jump height and write down which of character, controls or camera you changed.', min:60 },
        { kind:'topic', ref:'difficulty', why:'Your game gets harder by getting faster, and that is the part you build last.', do:'Add boxes that slide towards the box, make them speed up every ten seconds, end the run on a collision and restart on a key press. Take the numbers from your plan in the last stage.', min:60 }
      ],
      review:['feedback-and-affordance'],
      check:{
        recall:[
          { q:'What question should the first build answer?', a:'Whether jumping over obstacles is fun for one minute. It does not need art, sound or menus to answer that.' },
          { q:'Why use plain boxes?', a:'Boxes are quick to make and change, so the time goes into the jump and the speed, which are what the game is about.', ideas:['Boxes are quick to make and change', 'the time goes into the jump and the speed, which are what the game is about'] },
          { q:'What can you tune first to make the jump feel right?', a:'The jump height and how fast the box falls back down, checked against the speed of the first obstacle.', ideas:['The jump height', 'how fast the box falls back down', 'checked against the speed of the first obstacle'] }
        ],
        build:'Have a version of the practice game where one key makes a box jump over moving obstacles and a crash restarts the run.',
        skip:['Can you press a key and see the box jump?','Do obstacles come towards the player and end the run on a crash?','Can you change the jump height and see the result at once?']
      } },
    { id:'s4', t:'Test it and finish', level:'beginner',
      goal:'Watch someone else play, polish the feel and decide what to change next.', hours:1.5,
      steps:[
        { kind:'topic', ref:'playtesting', why:'You know your game too well to see its problems. A new player shows you them in a minute.', do:'Ask one friend to play the practice game for five minutes while you stay quiet. Write down where they crashed, where they hesitated and what they said.', min:20 },
        { kind:'checklist', ref:'playtest-prep', why:'A short checklist keeps you from explaining the game and spoiling the test.', do:'Run the checklist before your test, then note one item you missed.', min:15 },
        { kind:'topic', ref:'game-feel-and-juice', why:'Small touches such as a sound or a bounce make a plain game feel good to play.', do:'Add one touch to the practice game, such as a sound when you jump or a small shake when you crash, and ask your tester which version they preferred.', min:35 },
        { kind:'reflect', why:'Deciding what to change next is what makes the next game better than this one.', do:'Write what you would change next in the practice game and why, using what your tester did rather than what they said. Pick one change only.', min:20 }
      ],
      review:['difficulty','prototyping'],
      check:{
        recall:[
          { q:'Why stay quiet while someone plays?', a:'If you explain, you hide the problems a new player would hit. Silence shows where the game fails to teach itself.' },
          { q:'Which is better evidence, what a tester says or what they do?', a:'What they do. Words are useful for guessing why, but where they crash and hesitate shows the real problem.' },
          { q:'What is game feel?', a:'How the game answers a press: how quickly, how predictably and how it looks and sounds. Sound, bounce and shake (juice) are one layer of it.' },
          { q:'Why pick only one change to make next?', a:'One change can be tested clearly. Several changes at once leave you unable to tell which one helped.' }
        ],
        build:'Write a short note with what your tester did, the one touch you added and the one change you will make next.',
        skip:['Have you watched someone play without saying anything?','Do you know where your tester crashed most often?','Have you picked the single next change?']
      } }
  ]
});
PATH('game-designer-foundations', {
  t:'Game designer foundations', tag:'Player, loop, and the discipline to test before you build.',
  pick:'Design a game that holds up before you build it',
  track:'design', level:'beginner', hours:10.25,
  audience:'Anyone starting in game design, or an engineer, producer or artist picking up design responsibility for the first time.',
  outcome:'You can name a player and a promise, build and defend a core loop, judge whether a feature idea creates a real decision, and turn a hunch into a hypothesis before you write a line of code.',
  prereq:[], next:['systems-designer','level-and-ux-designer','games-that-broke-the-mould','gameplay-engineer-godot','gameplay-engineer-unity','live-game-backend-engineer','build-and-release-engineer','study-the-hits-play','study-the-hits-worlds','interview-prep-designer'],
  stages:[
    { id:'s1', t:'The player and the promise', level:'beginner',
      goal:'Name a real player, the fantasy you are selling them, and the one sentence that has to survive every later decision.', hours:2.75,
      steps:[
        { kind:'topic', ref:'who-is-the-player', why:'Every later decision is a guess until you can name who you are designing for.', do:'Write a four-sentence sketch of your player: who they are, what they already play, what they want from a session, and what would make them quit. No game yet? Use a practice game for every task in this path: a one-button game where you jump over obstacles that come faster and faster.', min:25 },
        { kind:'topic', ref:'player-motivation', why:'Wants are not needs. Knowing what drives your player tells you which promise to make.', do:'List the three motivations your player sketch implies, ranked by strength, and name one existing game that serves each of them badly.', min:20 },
        { kind:'topic', ref:'fantasy', why:'The fantasy is the promise stated as a verb the player wants to perform.', do:'Write ten fantasy sentences that start “I get to be someone who…” for your player. Keep the one whose verb you would enjoy performing for ten minutes in grey boxes.', min:25 },
        { kind:'game', ref:'pokemon', lens:'business', why:'Pokémon’s promise, fill the Pokédex, is built so it cannot be kept alone: paired versions make trading a structural requirement, so the fantasy is enforced by the game’s structure rather than stated in text.', do:'Read its business lens, then write which part of the promise of your game (or the practice game) its structure enforces, and which part is only stated in a menu or a trailer.', min:15 },
        { kind:'topic', ref:'core-experience', why:'The experience statement is the target every later system exists to serve.', do:'Turn your fantasy sentence into a one-paragraph core experience statement, and read it aloud to someone who has not seen your game (or the practice game).', min:20 },
        { kind:'topic', ref:'design-pillars', tab:'overview', why:'Pillars turn the core experience statement into two to four statements anyone on the team can use to settle an argument without you.', do:'Write two pillars that follow from your core experience statement, and for each name one feature it would forbid.', min:20 },
        { kind:'tool', ref:'ladder', why:'Feature thinking sneaks in early. The ladder keeps you starting from a behaviour instead.', do:'Take one feature you want to build in your game (or the practice game) and climb the ladder: feature, behaviour, experience, system, mechanic, then back down to the smallest version.', min:25 },
        { kind:'game', ref:'flappy-bird', lens:'gameplay', why:'Flappy Bird makes the smallest promise in the library, beat your last score with one tap, and shows what is left when the ladder from behaviour down to mechanic is followed to the very end.', do:'Read its gameplay lens, then run one feature idea for your game (or the practice game) down the Behaviour Ladder as far as Flappy Bird went, and write the single sentence your game would keep if everything else were cut.', min:15 }
      ],
      review:[],
      check:{
        recall:[
          { q:'What makes a design pillar more than a slogan?', a:'A pillar can say no: it is specific enough that it forbids a feature someone wants, so the team can settle an argument by checking it instead of asking the director.', ideas:['A pillar can say no', 'it is specific enough that it forbids a feature someone wants', 'the team can settle an argument by checking it instead of asking the director'] },
          { q:'What is the difference between a want and a fantasy sentence?', a:'A want is the underlying motivation driving play, like competence or autonomy. A fantasy sentence turns that want into the identity the player gets to inhabit, phrased as “I get to be someone who...”. The want explains why; the fantasy states the promise as a verb.' },
          { q:'Why does experience thinking start from a behaviour instead of a feature?', a:'A feature is a solution guessed too early. Starting from the behaviour you want the player to perform, then climbing the Behaviour Ladder through experience, system and mechanic, keeps the design serving the player instead of just implementing whatever came to mind first.' },
          { q:'What breaks if you skip straight from a feature idea to a feature?', a:'You build the first implementation you imagined instead of the smallest mechanic that produces the intended behaviour, so the result is often bigger or more complex than what the ladder would have found, or aimed at the wrong experience.', ideas:['You build the first implementation you imagined instead of the smallest mechanic that produces the intended behaviour', 'the result is often bigger or more complex than what the ladder would have found', 'aimed at the wrong experience'] }
        ],
        build:'Write your player sketch, your chosen fantasy sentence and your one-paragraph core experience statement on one page. Read it aloud to someone who has not seen the project.',
        skip:['Can you name a feature one of your pillars would forbid?','Can you write a player sketch and a fantasy sentence for a new idea in under ten minutes?','Can you explain why “a roguelike deckbuilder” names a genre, not an experience?','Have you already run the Behaviour Ladder on a real feature idea and changed the plan because of it?','Can you name what your player wants from a session without describing a feature?']
      } },
    { id:'s2', t:'The loop and its variables', level:'beginner',
      goal:'Turn the fantasy into a loop the player repeats, and find its weakest link before you add anything else.', hours:2.5,
      steps:[
        { kind:'topic', ref:'core-loop', why:'The loop is the machine the player repeats. If it is not compelling alone, nothing later rescues it.', do:'Describe your core loop in five sentences: decision, action, consequence, feedback, new situation. Mark the weakest link.', min:25 },
        { kind:'game', ref:'angry-birds', lens:'gameplay', why:'Angry Birds shows the loop’s feedback-to-decision link at its barest: the dotted trail left by the last bird is the feedback, and the next pull is the decision it informs.', do:'Read its gameplay lens and loop diagram, then name the one piece of feedback your own loop leaves on screen for the next decision, and what the player would do without it.', min:15 },
        { kind:'topic', ref:'decisions', why:'Depth lives in the decisions the loop creates, not in the actions themselves.', do:'List the three most common decisions your loop asks the player to make, and write the trade-off sentence for each.', min:20 },
        { kind:'game', ref:'slay-the-spire', lens:'gameplay', why:'Slay the Spire’s card reward, one card from three or none, is a loop where every reward is a decision: the last two topics working together in one screen.', do:'Read its gameplay lens and write the decision its card reward asks for, and what would turn that reward into a formality.', min:15 },
        { kind:'game', ref:'mario-kart-8', lens:'gameplay', why:'Mario Kart 8 weights its whole item table towards whoever is losing, with the Blue Shell as the famous case, so every position in the race, not only first, still carries a decision worth making.', do:'Read its gameplay lens, then name the player your own loop stops asking for decisions (far ahead or far behind), and one rule that would give them a decision back.', min:15 },
        { kind:'topic', ref:'mechanics-and-rules', why:'Mechanics are the rules that generate those decisions. You want the smallest set that produces them.', do:'List every mechanic your loop needs, and cross out any that does not feed a decision you just wrote down.', min:20 },
        { kind:'tool', ref:'loop', why:'Building the loop as a diagram exposes the weak link a paragraph hides.', do:'Build your loop in the Loop Builder, run its weak-link check, and fix the link it flags.', min:25 },
        { kind:'smell', ref:'repetitive', why:'Repetitive is the most common failure of an unfinished loop, and this smell names its causes before you ship one.', do:'Write which of its five causes your current loop is most at risk from, before you have even tested it, based on the repetitive-loop smell.', min:20 }
      ],
      review:['fantasy'],
      check:{
        recall:[
          { q:'How can a game keep decisions alive for a player who is losing, and what does Mario Kart 8’s item table show about it?', a:'Its item table is weighted towards whoever is behind, so a trailing player still gets strong items and a real choice about when to use them, and the leader still has a position to defend.', ideas:['Its item table is weighted towards whoever is behind', 'a trailing player still gets strong items and a real choice about when to use them', 'the leader still has a position to defend'] },
          { q:'What are the five links in the core loop?', a:'Decision, action, consequence, feedback, and new situation: the player decides, acts, the game state changes, the game shows what changed, and the changed state is a fresh situation that asks for another decision.' },
          { q:'What makes a decision meaningful rather than merely present?', a:'The options must be different with no dominant choice, the right answer must change with the situation, and different players must choose differently. The player needs enough information to reason but not enough to be certain.' },
          { q:'How do you tell a load-only mechanic from one that creates a decision?', a:'Ask what decision would disappear if you removed it. If none, it only adds a rule to track without changing any trade-off, so it is load-only rather than decision- or interaction-creating.' }
        ],
        build:'Export your Loop Builder diagram with the weakest link marked and the one change you made to strengthen it.',
        skip:['Do you know which player your loop stops offering decisions to?','Can you describe your core loop in five sentences without leaving out a link?','Can you write the trade-off sentence for every option in your game right now?','Have you already run a weak-link check on a loop and fixed what it found?','Do you know which of your mechanics would go unnoticed if you deleted it?']
      } },
    { id:'s3', t:'Depth, feedback, and teaching', level:'intermediate',
      goal:'Judge whether a feature idea is worth its cost, and whether your system teaches itself.', hours:2.5,
      steps:[
        { kind:'topic', ref:'depth-vs-complexity', why:'Complexity is what the player must learn. Depth is what they can do with it. You want to buy depth, not complexity.', do:'List ten rules in your current design (or the practice game) and classify each as creating a decision, enabling an interaction, or load only.', min:20 },
        { kind:'topic', ref:'feedback-and-affordance', why:'Without feedback the player cannot learn from what they just did, no matter how good the decision was.', do:'Build a small feedback matrix for your three most common actions: what confirms the input, and what confirms the outcome. Find the empty cells.', min:20 },
        { kind:'game', ref:'super-mario', lens:'art', why:'Super Mario’s 2D games teach the power-up ladder through Mario’s own body, with no text: small Mario, a taller Super Mario after a Mushroom, a white-and-red Fire Mario, so a watching player always knows what he can currently do.', do:'Read its art lens, then name one state in your own game (or the practice game) a player currently has to open a menu or check a HUD to know, and sketch how the character or object itself could show it instead.', min:15 },
        { kind:'game', ref:'zelda', lens:'gameplay', why:'Breath of the Wild dropped the series’ oldest rule, a dungeon item that unlocks an obstacle elsewhere, by handing Link every core rune on the opening Great Plateau, before any real dungeon, so every later obstacle is met with tools the player already holds.', do:'Read its gameplay lens, list the tools your game (or the practice game) withholds until later, and for one of them write what a player could already do with it if it were taught in the first area.', min:15 },
        { kind:'topic', ref:'onboarding', why:'The first minutes teach more than any tutorial text, and they are where most players are lost.', do:'Write the first three things a new player would have to learn, and for each say whether they would learn it by doing or by reading.', min:20 },
        { kind:'tool', ref:'feature', why:'Nine questions catch a feature that sounds good and does nothing, before you spend a week on it.', do:'Run one feature idea for your game (or the practice game) that you are excited about through Should We Build This? and accept the verdict even if you do not like it.', min:20 },
        { kind:'checklist', ref:'design-review', why:'A design review forces every group, including AI, to answer instead of shrug, before you commit production time.', do:'Run the design review checklist on the same feature idea and write down what each group answered.', min:20 },
        { kind:'diagnostic', ref:'depth', why:'The rule audit turns “depth vs complexity” from an idea into a number you can act on.', do:'Run the depth-vs-complexity rule audit on your own mechanic list and cut every rule that only adds load.', min:15 }
      ],
      review:['core-loop'],
      check:{
        recall:[
          { q:'What did Breath of the Wild give up by handing out its core runes early?', a:'The series’ lock-and-key rule, where a dungeon item opens an obstacle elsewhere. In exchange every core tool is in hand from the opening area, and later obstacles are solved by combining those tools through shared physics rather than by finding a new key item.' },
          { q:'What is the difference between complexity and depth?', a:'Complexity is what the player must learn: rules, exceptions, state. Depth is what they can do with it: the meaningful, situationally different decisions those rules generate. Elegance means high depth for little complexity, so aim to buy depth, not complexity.' },
          { q:'Why does feedback need to show cause, not only outcome?', a:'Confirming that something happened without showing why gives the player nothing to correct. Cause feedback lets them update their understanding and act differently next time; without it, a failure feels unfair regardless of whether it was.' },
          { q:'Which two of the nine “Should we build this?” questions carry the heaviest penalty in the tool’s scoring?', a:'In the tool’s own scoring the heaviest penalties sit on two questions: could a simpler change deliver the same experience, and what happens if we do not build it. An idea that a change to an existing system could deliver, or whose absence nobody would notice, loses the most points.' }
        ],
        build:'Run the design review checklist on one feature you are considering, and either cut it or write down what each group answered.',
        skip:['Can you say which of your withheld tools could be taught in the first area?','Can you run a rule audit on your own systems and say which rules earn their place?','Can you name the empty cell in your current feedback matrix?','Have you already used “Should we build this?” to kill an idea you liked?','Can you explain teaching by doing to someone in one sentence?']
      } },
    { id:'s4', t:'Prototype, test, decide', level:'intermediate',
      goal:'Turn a hunch into a hypothesis, build the cheapest test, and use a real playtest as evidence.', hours:2.5,
      steps:[
        { kind:'topic', ref:'prototyping', why:'A prototype that answers no question is a demo, however good it looks.', do:'Name the one question your next build has to answer, and the medium that answers it for the least work.', min:20 },
        { kind:'topic', ref:'three-cs', why:'The first thing worth prototyping in a game you control is how the character moves, how the controls ask for it and what the camera shows; the three cannot be tuned one at a time.', do:'In a greybox with a flat floor and a default camera, write down the character’s speed, jump and one forgiving rule, then change the camera angle and note which of the other two now feel wrong.', min:25 },
        { kind:'topic', ref:'hypothesis-driven-design', why:'A hypothesis with a signal and a kill criterion is what turns an opinion into something you can be wrong about.', do:'Write one hypothesis in the standard form: player, behaviour, reason, signal, kill criterion.', min:15 },
        { kind:'tool', ref:'hypothesis', why:'The builder keeps the five parts honest and exports the brief you hand to whoever builds the prototype.', do:'Enter your hypothesis into the Hypothesis Builder and export the prototype brief it produces.', min:20 },
        { kind:'checklist', ref:'pre-prototype', why:'A prototype without a hypothesis, a scope cut and instrumentation is a demo with extra steps.', do:'Run the pre-prototype checklist against the brief you just exported and fix whatever it fails.', min:15 },
        { kind:'topic', ref:'playtesting', why:'What a player says is useful. What a player does is evidence. Only one of them tests your hypothesis.', do:'Plan a fifteen-minute silent playtest for your prototype: who you would recruit, what you would watch for, and the one question you would ask afterwards.', min:20 },
        { kind:'reflect', why:'Writing your own answer, not the guide’s, is what makes the plan yours to run.', do:'In your own words, write what you will build next, the hypothesis it tests, and the signal that would make you kill it.', min:20 },
        { kind:'game', ref:'contra', lens:'gameplay', why:'Contra’s own signature prototype, one corridor, one weak default gun, one weapon pickup that is visibly stronger, is a hypothesis in miniature: does making players lose that weapon on death change how cautiously they play before losing it?', do:'Read Contra’s signature and gameplay lens, then write your own next prototype as the same shape: one corridor, one rule you are testing, and the one behaviour change that would prove it worked.', min:15 }
      ],
      review:['mechanics-and-rules','depth-vs-complexity'],
      check:{
        recall:[
          { q:'What five parts does a hypothesis need?', a:'Player, behaviour and reason, in the form “we believe [player] will [behaviour] because [reason]”, plus the observable signal that shows it is true and a kill criterion written before the build.', ideas:['Player, behaviour and reason', 'the observable signal that shows it is true', 'a kill criterion written before the build'] },
          { q:'Why is a prototype that answers no question a demo?', a:'A prototype’s value is the question it answers and how fast it answers it; fidelity is a cost, not a virtue. Without a specific question and kill criterion, a build only shows something off, which makes it a demo.' },
          { q:'What is the difference between what a player says and what a player does?', a:'What a player says is self-report: useful but unreliable, since they report what they think they felt or think you want to hear. What they do is observed behaviour, the actual evidence. Believe the behaviour; use the words to form hypotheses about why.' }
        ],
        build:'Write one hypothesis in the standard form, the smallest prototype that tests it, and the kill criterion, using the Hypothesis Builder.',
        skip:['Have you already written a hypothesis with a signal and a kill criterion for your current idea?','Can you name the smallest medium that would answer your current design question?','Do you know what result would make you kill your favourite idea?','Can you separate what a tester said from what they did in your last playtest?']
      } }
  ]
});

PATH('systems-designer', {
  t:'Systems designer', tag:'Economy, progression, and the discipline to prove a system by breaking it.',
  pick:'Own an economy, a progression curve or any system',
  track:'design', level:'intermediate', hours:14,
  audience:'Designers past the basics who want to own an economy, a progression curve, or any system with more than three moving parts.',
  outcome:'You can map a system’s parts and feedback loops, run a rule audit that separates decisions from load, and turn a design smell into a testable experiment instead of a guess.',
  prereq:['game-designer-foundations'], next:['senior-game-designer','technical-lead','interview-prep-designer','study-the-hits-play'],
  stages:[
    { id:'s1', t:'Systems and their pieces', level:'intermediate',
      goal:'See a system as parts and the relationships between them, not just a list of numbers.', hours:2.5,
      steps:[
        { kind:'topic', ref:'systemic-design', why:'A system is not its numbers. It is the relationships between the numbers, and those are what produce behaviour.', do:'Pick a system you already run (an economy, a progression curve, a build system) and list its five most important relationships as A affects B sentences.', min:25 },
        { kind:'topic', ref:'mechanics-and-rules', why:'Every relationship you just listed is enforced by a specific rule. Naming the rule is what makes the relationship changeable later.', do:'For each relationship from the last step, write the exact rule that enforces it, in one sentence each.', min:20 },
        { kind:'topic', ref:'economy-and-resources', why:'Currencies and sinks are the most common system a designer inherits half built. Knowing the vocabulary lets you diagnose it fast.', do:'List every currency and every sink in your system, and mark which sinks currently have no meaningful choice attached to them.', min:25 },
        { kind:'game', ref:'plants-vs-zombies', lens:'gameplay', why:'Plants vs. Zombies never pays its in-level currency, sun, for kills, so growing income always costs a square a weapon could use instead.', do:'Read its gameplay lens and mark, in your own economy, whether any currency is earned by the same action it is meant to create a trade-off against.', min:15 },
        { kind:'game', ref:'civilization', lens:'gameplay', why:'Civilization runs a city’s build queue, a technology’s research and a unit’s movement on separate, unsynchronised clocks, so the relationship between them, not any single number, is why a turn is never a clean place to stop.', do:'Read its gameplay lens, then add one timing relationship to your list: when A finishing changes when B matters, and what that does to the moment a player stops.', min:15 },
        { kind:'tool', ref:'sysmap', why:'A relationship map on paper hides feedback loops that a diagram makes obvious in thirty seconds.', do:'Build your system in the System Relationship Map, and circle the first feedback loop it reveals that you had not written down.', min:25 },
        { kind:'smell', ref:'same-way', why:'A system with too few real choices collapses into one dominant path, and that is a system smell, not a balance number.', do:'Check whether your map from the last step has a dominant node with no real competitor, based on the “Everyone plays the same way” smell.', min:20 }
      ],
      review:[],
      check:{
        recall:[
          { q:'Why do systems on separate clocks stop a turn being a clean stopping point, as in Civilization?', a:'Build queues, research and movement run on separate clocks that finish at different turns, so there is almost always something about to complete. The pull comes from how the parts relate in time, not from any one value.' },
          { q:'What is the difference between a relationship and a rule in a system?', a:'A relationship is the observed dependency between two parts, stated as “A affects B.” A rule is the exact mechanic that enforces that relationship. Naming the rule, not just the relationship, is what makes it changeable later.' },
          { q:'Why does listing sinks with no attached choice matter before you touch numbers?', a:'A sink with no meaningful choice attached is really a progress bar, not a resource decision, so tuning its numbers will not create engagement. Finding these first shows where the economy needs a new trade-off rather than a balance pass.' },
          { q:'What does a feedback loop look like on your relationship map that a spreadsheet would hide?', a:'It appears as a visible cycle of edges, where one node’s output loops back to affect itself or an earlier node, such as abundance lowering its own value. A spreadsheet’s linear rows of numbers make that cycle much harder to notice.' }
        ],
        build:'Export your System Relationship Map with the feedback loop you found circled, and the rule sentence for the relationship that causes it.',
        skip:['Can you name a timing relationship in your own system?','Can you name the feedback loops in your current system without opening the map tool?','Can you list every currency and sink in your game from memory, sink by sink?','Do you already know which sink in your economy has no real choice attached?','Have you built a relationship map for a system before and found something you had not noticed?']
      } },
    { id:'s2', t:'Progression and its pressure', level:'intermediate',
      goal:'Balance the curve a player climbs, and name what breaks when it goes wrong.', hours:2.5,
      steps:[
        { kind:'topic', ref:'progression', why:'Progression is the pacing of the whole game compressed into one curve. Get the curve wrong and every other system inherits the problem.', do:'Sketch your progression curve for the first two hours, marking every point where the pace changes and why you chose it there.', min:25 },
        { kind:'topic', ref:'difficulty', why:'Progression and difficulty are two names for the same pressure. If they are not tuned together, one always undercuts the other.', do:'Mark on your progression curve where difficulty rises faster than player power, and where it is the reverse.', min:20 },
        { kind:'smell', ref:'meaningless-progression', why:'A curve that always goes up but never changes what the player can do is a treadmill, not progression.', do:'Check whether your last three unlocks changed a decision, or only a number, based on the “Progression feels meaningless” smell.', min:20 },
        { kind:'smell', ref:'too-many-currencies', why:'Currencies multiply faster than any other part of a system, usually because each one solved a problem alone instead of together.', do:'List every currency in your game against the one unique decision it enables. Cut any that do not have one, based on the “There are too many currencies” smell.', min:15 },
        { kind:'game', ref:'candy-crush-saga', lens:'business', why:'Candy Crush Saga’s five-life cap turns a single currency into the whole session’s pacing, gating play itself rather than a purchase inside it.', do:'Read its business lens and write the one decision lives create that gold bars do not (retry now, wait, or ask a friend), then check that each currency in your own game has a decision of its own.', min:20 },
        { kind:'game', ref:'diablo-ii', lens:'gameplay', why:'Diablo II makes every drop a two-speed decision: the coloured name gives the tier at a glance, but the affix roll still has to be read before the player knows whether it beats what they wear, so loot progression stays a decision rather than a number.', do:'Read its gameplay lens, then check your last three unlocks: did the player have anything to read or weigh before knowing it was an upgrade, or did the number decide for them?', min:15 },
        { kind:'checklist', ref:'design-review', why:'A design review forces you to answer for the curve out loud, before a player has to live with it.', do:'Run the design review checklist against your progression curve specifically, not the whole game.', min:20 },
        { kind:'diagnostic', ref:'depth', why:'The rule audit turns depth vs complexity from a feeling into a count you can act on.', do:'Run the depth-vs-complexity rule audit against every rule your progression curve depends on, and cut whatever only adds load.', min:15 }
      ],
      review:['systemic-design'],
      check:{
        recall:[
          { q:'What keeps a loot drop a decision instead of a reflex, as in Diablo II?', a:'The colour gives its tier instantly, but the affixes and where each one rolled in its range must be read and weighed against the equipped item, so the upgrade is judged, not handed over.', ideas:['The colour gives its tier instantly', 'the affixes and where each one rolled in its range must be read and weighed against the equipped item', 'the upgrade is judged, not handed over'] },
          { q:'What breaks when progression and difficulty are tuned separately?', a:'Progression and difficulty are two names for the same pressure. If power grows faster than demand the game turns boringly easy, and if demand outpaces power it turns unfair; tuned apart, one curve silently undercuts the other.' },
          { q:'What is the test for whether an unlock is meaningful?', a:'Ask what new capability, decision, or experience the unlock creates, not what number it changes. A step that only raises a stat without changing what the player can do or choose is “number goes up,” not real progression.' },
          { q:'What does a currency need to justify existing, according to the smell you just read?', a:'It needs to create a spending decision, a trade-off, that no other currency in the game already creates. A currency added only to gate a system, with no unique choice attached, should be merged into an existing one or cut.' }
        ],
        build:'Run the design review checklist on your progression curve and the depth-vs-complexity rule audit on its rules, and write down what each one caught.',
        skip:['Does a player have to weigh your rewards before knowing they are upgrades?','Can you point to the exact spot on your curve where difficulty and power cross?','Can you defend every currency in your game with the one decision it alone enables?','Have you already cut an unlock because a rule audit showed it was load, not depth?','Can you name a real game whose progression curve you would redesign, and why?']
      } },
    { id:'s3', t:'Depth, content, and diminishing returns', level:'advanced',
      goal:'Tell a system problem from a content problem, and know when adding more stops helping.', hours:3,
      steps:[
        { kind:'topic', ref:'depth-vs-complexity', why:'Depth and complexity look identical on a feature list. Only the player’s decisions tell them apart.', do:'Take the ten rules that drive your economy or progression (not your whole game) and, for each, write which decision disappears if you delete it. Count the rules whose deletion removes none.', min:25 },
        { kind:'topic', ref:'content-multiplies', why:'Content only multiplies a system’s value if the system can absorb it. Past that point, more content just adds cost.', do:'List the last five content items you added to this system, and mark which ones created a new decision versus just a new skin on an old one.', min:25 },
        { kind:'topic', ref:'power-creep-and-content-growth', why:'Every release adds content, and if each is a little stronger than the last, the older pool quietly stops being worth choosing. Rotation and a stat squish change the symptoms; only a written power budget changes the rate.', do:'Take your content plan for the next three releases and write the power budget each new item is held to, then name the old items your plan makes pointless and what you will do about them.', min:30 },
        { kind:'game', ref:'balatro', lens:'gameplay', why:'Balatro multiplies a small card vocabulary with Jokers that rewrite how a hand scores, a clear case of content that multiplies rather than adds.', do:'Read its gameplay lens and count how many rules a single Joker changes, then name one piece of your content that could work the same way.', min:15 },
        { kind:'game', ref:'cookie-clicker', lens:'gameplay', why:'Cookie Clicker is the counterweight to Balatro in this stage: its twenty buildings are content that adds rather than multiplies, each changing only a production rate on the same 15% price curve, yet players stay for hundreds of hours.', do:'Read its gameplay lens, then sort your own content into items that change a decision and items that change only a number, and write what each number-only item is for.', min:20 },
        { kind:'diagnostic', ref:'content', why:'The content-or-mechanic diagnostic gives you a repeatable answer instead of a guess, the next time someone asks for more content.', do:'Run the content-or-mechanic diagnostic on your next planned addition and act on what it tells you.', min:15 },
        { kind:'smell', ref:'one-build', why:'When one build or strategy dominates, the system has stopped offering real choices, whatever the patch notes say.', do:'Check your own system against its causes list, honestly, based on the “Players only use one build or strategy” smell.', min:15 },
        { kind:'smell', ref:'no-experiment', why:'Players who never experiment are telling you the system does not reward trying something new.', do:'Name the one change that would make trying something new worth the risk in your system, based on the “Players do not experiment” smell.', min:15 },
        { kind:'checklist', ref:'scope-sanity', why:'Diminishing returns are easiest to see from outside your own backlog, which is what a monthly scope check is for.', do:'Run the scope sanity checklist against your current system backlog and cut the item that scores worst.', min:20 }
      ],
      review:['progression'],
      check:{
        recall:[
          { q:'What separates a decision rule from a load-only rule?', a:'A decision rule creates a situational choice that would be missed if removed. A load-only rule only adds cognitive or implementation cost with no decision or interaction behind it. The rule audit classifies each rule this way before anything is cut.' },
          { q:'When does more content stop adding value to a system?', a:'Once the system can no longer absorb it, meaning new content stops creating a situation or decision the existing pieces do not already produce. Past that point content only adds cost, and the system itself needs work, not more pieces.' },
          { q:'What is the one change the no-experiment smell asked you to name?', a:'The one change that would make trying something new worth the risk, usually by lowering the cost of failure, rewarding curiosity with real feedback, hiding the obviously optimal option, or exposing a visible cross-system interaction worth chasing.' }
        ],
        build:'Run the content-or-mechanic diagnostic on your next planned addition, and either build it differently or cut it based on the result.',
        skip:['Can you classify a rule as decision, interaction, or load in under ten seconds?','Can you name the point where adding content to your system stopped paying off?','Have you already found a one-build problem in your own system and named its cause?','Do you know which item in your backlog a scope check would cut first?']
      } },
    { id:'s4', t:'Experiments, not opinions', level:'advanced',
      goal:'Turn a smell you found into an experiment with a real signal, not just a fix you feel confident about.', hours:3.5,
      steps:[
        { kind:'topic', ref:'builds-and-loadouts', why:'Builds and loadouts are where depth becomes visible to the player. A healthy build space is the clearest proof a system is working.', do:'List every viable build in your system today, and rank them by how often you would guess players pick each one.', min:25 },
        { kind:'topic', ref:'balance-methods', why:'Balanced means every option has a situation where picking it is right. A cost curve, a payoff matrix and a seeded simulation check that before players do, and telemetry checks it after.', do:'Fit a cost curve to the plain options in your game, price each ability on top of it and list the ones more than a set margin over or under. Then write the win-rate claim, with skill tier and sample size, you would need before changing one.', min:35 },
        { kind:'topic', ref:'combat-design', why:'Combat is a system with a build space of its own: attack timings, commitment and enemy patterns are the numbers that decide whether a fight has one answer or several.', do:'Write three of your attacks as anticipation, active and recovery, then name the answer each one asks of the player and whether a second answer exists.', min:20 },
        { kind:'game', ref:'monster-hunter', lens:'replay', why:'Monster Hunter’s replay loop is repeating hunts for better gear against harder versions of monsters already beaten, and Monster Hunter Wilds launching with too little endgame shows what happens when that gear has nothing left to be tested against.', do:'Read its replay lens, then for each build on your list name the content it is tested against, and mark any build that has no reason to exist once that content runs out.', min:15 },
        { kind:'smell', ref:'ignore-mechanics', why:'A mechanic nobody uses is not neutral. It is a cost the system pays for a decision players never make.', do:'Mark which of your mechanics you would bet is currently ignored, based on the “Players ignore half the mechanics” smell.', min:20 },
        { kind:'smell', ref:'features-not-better', why:'Adding a fix on top of a smell without testing it is how a system accumulates features that do not solve the actual problem.', do:'Check whether your last three system changes were tested or just shipped, based on the “We keep adding features but the game is not better” smell.', min:20 },
        { kind:'game', ref:'megami-tensei', why:'Persona cut demon negotiation for two games and then restored it, and its staff said Social Links carried a disguised version of it: a rare natural experiment in removing a mechanic from a running series.', do:'Read its changed and reception text, then name one mechanic in your own system that players ignore, the payoff it delivers, where that payoff would go if you cut it, and the signal that would tell you the cut worked.', min:20 },
        { kind:'tool', ref:'hypothesis', why:'A fix without a signal and a kill criterion is an opinion wearing a plan’s clothes.', do:'Turn your fix for the one-build or ignored-mechanic problem into a hypothesis with a signal and a kill criterion, using the Hypothesis Builder.', min:30 },
        { kind:'reflect', why:'Writing the experiment in your own words is what makes you run it instead of just agreeing it sounds right.', do:'Write the exact change you will make, the signal that means it worked, and the signal that means you should revert it.', min:25 }
      ],
      review:['depth-vs-complexity'],
      check:{
        recall:[
          { q:'What does a build need from the content around it to be tested, as Monster Hunter Wilds’ launch showed?', a:'Gear needs a harder rung to be tested against. Without enough endgame hunts, veterans reached the top of the available content within days and had nothing left to convert their gear into, so the replay loop stalled until Capcom pulled a major endgame patch forward.' },
          { q:'Why is an ignored mechanic a cost, not a neutral feature?', a:'The system still pays for it, in complexity budget, teaching cost and upkeep, even though no player ever uses the decision it was built to create. An ignored mechanic is a tax the game pays for a choice nobody makes.' },
          { q:'What turns a fix into an experiment?', a:'Writing it as a hypothesis with an observable signal and a kill criterion before shipping it. A fix with no predicted result and no way to know if it failed is an opinion that was shipped and hoped for, not tested.' },
          { q:'What are the two signals your hypothesis needs?', a:'The signal that would confirm the hypothesis worked, an observable behaviour you expect if it is true, and the kill criterion, the result that would make you revert or abandon the change. Both must be visible in a real playtest.' }
        ],
        build:'Export your Hypothesis Builder brief for the system fix you chose, with a real signal and a real kill criterion.',
        skip:['Can you name the content each of your builds is tested against?','Have you already written a hypothesis with a kill criterion for a system fix?','Can you name a mechanic in your game you are fairly sure nobody uses, and why?','Do you know what evidence would make you revert your last system change?','Can you tell a tested fix from a shipped-and-hoped fix in your own recent work?']
      } },
    { id:'s5', t:'The full audit', level:'advanced',
      goal:'Run a complete system audit end to end, and leave with a plan a player will meet.', hours:2.5,
      steps:[
        { kind:'topic', ref:'risk-reward', why:'Every currency sink and every build choice is a risk-reward decision wearing different clothes. Naming it that way is what lets you tune it on purpose.', do:'Take your redesigned system and mark, for each major decision point, what the player risks and what they stand to gain. Flag any point with reward and no real risk.', min:30 },
        { kind:'tool', ref:'sysmap', why:'A full relationship map, built after the redesign, is the only way to see whether you fixed the loop or just moved the smell somewhere else.', do:'Rebuild your System Relationship Map for the redesigned system across every subsystem you touched, annotating each smell you found earlier directly on the map.', min:30 },
        { kind:'game', ref:'cities-skylines', lens:'gameplay', why:'Cities: Skylines simulates each citizen with a home and a job, so a traffic jam traces back to one road decision instead of a difficulty number, and its info-views show the city one variable at a time: an audit that follows the cause, not the symptom.', do:'Read its gameplay lens, then take one smell on your rebuilt map and trace it back to the single decision causing it, looking at one variable at a time the way an info-view does.', min:15 },
        { kind:'checklist', ref:'playtest-prep', why:'A redesigned system is still a guess until a player meets it. The session that tests it needs the same rigour as the redesign did.', do:'Run the playtest session preparation checklist for a session built specifically to probe the smell you targeted, not a general playtest.', min:25 },
        { kind:'reflect', why:'The audit only counts as finished once someone else could pick it up and act on it without you in the room.', do:'Write the one-page audit: the smells you found, the experiment you ran or are about to run, and what you expect to see change.', min:30 },
        { kind:'game', ref:'fire-emblem', lens:'gameplay', why:'Fire Emblem’s weapon triangle turns a simple hit-and-damage roll into a second, positional risk: standing a unit on the wrong side of sword, axe and lance costs a hit bonus before any dice are rolled.', do:'Read its gameplay lens, then find one decision point in your own system where a roll alone decides the outcome, and design a positional or timing rule that lets the player change the odds before committing.', min:15 }
      ],
      review:['builds-and-loadouts'],
      check:{
        recall:[
          { q:'Why should a simulated failure point at a traceable cause, as a traffic jam does in Cities: Skylines?', a:'Each citizen is simulated with a home and a job, so congestion is the traceable result of a specific road or zoning decision, and the info-views isolate one variable so the player can find it.', ideas:['Each citizen is simulated with a home and a job', 'congestion is the traceable result of a specific road or zoning decision', 'the info-views isolate one variable so the player can find it'] },
          { q:'What does flagging reward with no risk tell you about a decision point?', a:'It means the point is not really a risk-reward choice: there is a payoff but nothing at stake, so the “decision” is a formality. It needs a real, legible cost attached, or players will always take it.' },
          { q:'What is the difference between fixing a loop and moving its smell?', a:'Fixing a loop removes the underlying cause, such as adding a real counter or constraint that changes behaviour. Moving the smell just relocates the same symptom, like nerfing a dominant build only for the next-best one to take its place at the same rate.' },
          { q:'What has to be true of an audit for someone else to act on it without you?', a:'It has to name the smells found with evidence, the experiment run or planned, and the expected result on one page, with a build task concrete enough that another person could run it and interpret the result without asking you first.', ideas:['name the smells found with evidence', 'the experiment run or planned', 'the expected result on one page', 'a build task concrete enough that another person could run it and interpret the result without asking you first'] }
        ],
        build:'Write the one-page system audit and attach the relationship map and the playtest prep checklist you ran against the redesigned system.',
        skip:['Can you trace one smell in your system to the single decision causing it?','Can you point to a decision point in your system with reward and no real risk?','Have you already rebuilt your relationship map after a redesign and found the smell had just moved?','Can you write a playtest plan built around one specific smell, not a general session?','Could someone else run your audit’s build task from your one-page writeup alone?']
      } }
  ]
});

PATH('level-and-ux-designer', {
  t:'Level and UX designer', tag:'Pacing, readability, and the first five minutes nobody skips.',
  pick:'Pace levels and teach players without a wall of text',
  track:'design', level:'intermediate', hours:13.84,
  audience:'Designers who block out levels or own onboarding and moment-to-moment feedback, and want players to know what to do without a wall of text.',
  outcome:'You can pace a level on purpose, diagnose why players stall, and run an onboarding pass that teaches by doing instead of telling.',
  prereq:['game-designer-foundations'], next:['senior-game-designer','technical-lead','interview-prep-designer','study-the-hits-worlds'],
  stages:[
    { id:'s1', t:'Level structure and pacing', level:'intermediate',
      goal:'Build a level as a deliberate sequence of teach, test and rest, not a pile of encounters.', hours:3.42,
      steps:[
        { kind:'topic', ref:'level-structure', why:'Teach, test, twist, combine, master, rest is a sequence for a reason. Skip a step and the player either stalls or gets bored.', do:'Take a level you are building or know well, and label each section with one of the six beats. Mark any beat that is missing entirely.', min:25 },
        { kind:'topic', ref:'pacing', why:'Pacing is not just difficulty. It is the rhythm of intensity and rest, and a level with no rest beat exhausts players before it challenges them.', do:'Graph the intensity of your level over its length by hand, on paper, and mark the flattest and steepest sections.', min:25 },
        { kind:'topic', ref:'spatial-composition', why:'Where the player can see, and where they cannot, shapes the pacing graph you just drew as much as any encounter does.', do:'Mark on your level layout the three sightlines that most control what the player expects to happen next.', min:25 },
        { kind:'topic', ref:'level-blockout-and-metrics', why:'Pacing and sightlines are opinions until they are built to the character’s real metrics in plain boxes and walked by someone else.', do:'Measure your character’s jump height, jump distance and cover height, then block out your level’s critical path and one optional room to those numbers.', min:20 },
        { kind:'game', ref:'hollow-knight', lens:'world', why:'Hollow Knight makes being lost part of the design: regions with their own look and sound, few markers, and a map the player has to buy.', do:'Read its world lens and list the cues it gives a lost player instead of a marker.', min:15 },
        { kind:'topic', ref:'backtracking-and-return-trips', why:'A connected world asks the player to come back, and whether the return feels like discovery or a chore is designed: what changed, how long the walk is, and what shortens it.', do:'Draw the map of one area of your level with every lock, the key that opens it and the walk between them. Mark where a shortcut or a fast-travel point would cut the longest return, and what is new in each room the player passes again.', min:30 },
        { kind:'game', ref:'half-life-2', lens:'gameplay', why:'Half-Life 2 dresses each room with the props its fights need, sawblades and barrels placed as ammunition, so what is left lying in a room sets how hard its fight is as much as the enemies do.', do:'Read its gameplay lens, then mark on your own layout the three objects a player sees on entering one combat space, and what each one tells them to do next.', min:15 },
        { kind:'checklist', ref:'design-review', why:'A pacing graph and a beat map are opinions until someone else is forced to check them against a real question.', do:'Run the design review checklist against your level’s pacing plan before you block anything out.', min:20 },
        { kind:'smell', ref:'tutorial-too-long', why:'A tutorial that runs long is usually a pacing problem wearing a teaching-text costume.', do:'Check whether your first teach beat is one beat, or three beats pretending to be one, based on the “The tutorial is too long” smell.', min:15 },
        { kind:'game', ref:'mega-man-x', lens:'gameplay', why:'Mega Man X hides Heart Tanks, Sub Tanks and armour capsules off the route through each stage, so one level carries a critical path and an optional one without ever blocking a player who finds nothing.', do:'Read its gameplay lens, then mark on your own level layout the critical path and one optional branch whose reward would change how the player tackles every later level.', min:15 }
      ],
      review:[],
      check:{
        recall:[
          { q:'How can level dressing shape a fight, as props do for the Gravity Gun in Half-Life 2?', a:'Props are placed as ammunition for the Gravity Gun, so reading a room means finding what can be thrown, and the designer controls the fight by what is left lying around rather than only by enemy count.', ideas:['Props are placed as ammunition for the Gravity Gun, so reading a room means finding what can be thrown', 'the designer controls the fight by what is left lying around rather than only by enemy count'] },
          { q:'What are the six beats a level structure moves through?', a:'Teach, test, twist, combine, master, rest: introduce the idea safely, demand it under pressure, reframe it unexpectedly, mix it with something known, demand fluency, then release.' },
          { q:'Why can a level be well paced and still exhaust a player?', a:'Pacing has two curves, intensity and cognitive load, and a level can manage one while leaving the other constantly high, or vary intensity correctly but never give a genuine rest beat that carries a reward, so the player never recovers.', ideas:['Pacing has two curves, intensity and cognitive load', 'a level can manage one while leaving the other constantly high', 'vary intensity correctly but never give a genuine rest beat that carries a reward'] },
          { q:'How does a sightline control pacing before an encounter even starts?', a:'What is visible from the entrance, the goal, the danger, or the choice, sets the player’s expectation and readiness before anything happens, so the sightline paces anticipation and tension ahead of the encounter design itself.', ideas:['What is visible from the entrance, the goal, the danger, or the choice', 'the sightline paces anticipation and tension ahead of the encounter design itself'] }
        ],
        build:'Draw the pacing graph for your level by hand and label each of the six beats on your layout, then run the design review checklist against the plan.',
        skip:['Can you say what the props in your combat spaces tell the player to do?','Can you label the six structural beats on a level you know without looking them up?','Can you draw your own level’s intensity graph from memory and defend the shape?','Have you already found a sightline problem in your own level by walking it, not reading about it?','Can you tell a pacing problem from a difficulty problem when a tester stalls?']
      } },
    { id:'s2', t:'Encounters and readability', level:'intermediate',
      goal:'Design one encounter as a readable loop, and catch where a player stops knowing what to do.', hours:2.92,
      steps:[
        { kind:'topic', ref:'encounter-design', why:'An encounter is a small core loop with its own setup, engagement, shift and resolution. Design it like one instead of like a room full of enemies.', do:'Pick one encounter and write its four parts: setup, engagement, shift, resolution. Mark which part is currently the weakest.', min:25 },
        { kind:'topic', ref:'readability-and-hierarchy', why:'A player who cannot read the encounter cannot make a decision in it, however good the decision space is.', do:'Screenshot or sketch your encounter and circle the three things a player should notice first. Ask whether the visual hierarchy points there.', min:25 },
        { kind:'topic', ref:'pixel-art-direction', why:'At low resolution readability is a budget of pixels: the base resolution, the scale and the palette decide what the player can tell apart before any level is laid out.', do:'Take one screen of your game at its base resolution, count how many pixels the player character and the most important hazard have, and check both against the background in greyscale.', min:30 },
        { kind:'game', ref:'doom', lens:'art', why:'Doom gives each of its monsters a distinct silhouette and attack range rather than a palette swap, so a player can name the threat, and the right response, before it has fired once.', do:'Read its art lens, then sketch your encounter’s enemies as solid black shapes and check whether a player could tell each one’s threat and range from the shape alone.', min:15 },
        { kind:'smell', ref:'dont-know-what-to-do', why:'This is the single most common symptom of a readability failure, and it is usually blamed on the player instead of the screen.', do:'Match your encounter against its causes list, based on the “Players do not know what to do” smell.', min:20 },
        { kind:'game', ref:'skyrim', lens:'ui', why:'Skyrim answers the “don’t know what to do” problem with the opposite default to Hollow Knight earlier in this path: an always-on compass and quest marker point to the next objective from the moment the game begins, trading earned orientation for near-total legibility.', do:'Read its UI lens, then decide, for one moment in your own game, whether a marker should be on by default, earned through play, or absent entirely, and write what the player loses either way.', min:10 },
        { kind:'tool', ref:'loop', why:'Modeling the encounter as a loop exposes a weak link that a verbal description hides.', do:'Build your encounter in the Game Loop Builder as its own small loop, run the weak-link check, and fix what it flags.', min:30 },
        { kind:'reflect', why:'Naming the fix in your own words is what turns a diagnosis into a change you make.', do:'Write the one readability cue you would add first, and exactly where on screen or in space it goes.', min:20 }
      ],
      review:['level-structure'],
      check:{
        recall:[
          { q:'Why does distinct enemy silhouette and range count as readability, as in Doom?', a:'Each monster has its own silhouette and attack range, so the player identifies the threat and chooses a response from the shape before the enemy acts, instead of learning it by being hit.', ideas:['Each monster has its own silhouette and attack range', 'the player identifies the threat and chooses a response from the shape before the enemy acts', 'instead of learning it by being hit'] },
          { q:'What are the four parts of an encounter as a small loop?', a:'Setup, where the player reads what is coming; engagement, the execution; shift, something that changes the plan partway through; and resolution. An encounter is a small core loop with its own version of feedback and consequence.' },
          { q:'What is the difference between a decision-space problem and a readability problem?', a:'A decision-space problem means the choices themselves are missing or bad, with nothing meaningful to decide. A readability problem means the choices exist but the player cannot perceive them in time, so the fix is feedback or hierarchy, not more content.' },
          { q:'What causes does the “players do not know what to do” smell point to?', a:'The smell lists four candidates: no visible short-term goal in the world, unclear affordances, a goal that exists only in text or a log the player skipped, or a poorly composed space with no sightlines or landmarks. The fix targets the world and feedback, not more text.' }
        ],
        build:'Export your Game Loop Builder diagram for the encounter with its weak link marked and fixed.',
        skip:['Could a player tell your enemies apart by silhouette alone?','Can you name the weakest of the four parts in any encounter you are currently building?','Can you point to the exact visual element that should draw a player’s eye first, and check whether it does?','Have you already fixed a “players do not know what to do” report by changing readability instead of adding text?','Do you know the difference between a loop weak link and a readability weak link?']
      } },
    { id:'s3', t:'Feedback, feel and control', level:'advanced',
      goal:'Make every input confirm itself, and every outcome confirm the input that caused it.', hours:3,
      steps:[
        { kind:'topic', ref:'feedback-and-affordance', why:'Without feedback a player cannot learn from what they just did, no matter how good the underlying decision was.', do:'Build a feedback matrix for one level: rows are its triggers (door, checkpoint, hazard, pickup), columns are what confirms the input and what confirms the outcome. Find the empty cells.', min:30 },
        { kind:'topic', ref:'controls-and-friction', why:'Every extra step between intent and action is friction, and friction reads to the player as the game fighting them.', do:'Count the inputs required for your three most common actions, and cut one step from whichever has the most.', min:25 },
        { kind:'game', ref:'fruit-ninja', lens:'sound', why:'Fruit Ninja manufactures the physical impact a touchscreen cannot give: the whole feel of a hit comes from sound and splatter timed to the swipe, not from any resistance in the input itself.', do:'Read its sound lens, then list one action in your own game with no physical resistance behind it, and name the single feedback channel, sound, particles or screen shake, you would add first to sell the hit.', min:15 },
        { kind:'topic', ref:'animation-and-vfx', why:'Anticipation tells the player what is coming and impact tells them it happened; animation timing is where the outcome half of your feedback matrix is won or lost.', do:'For your most common action, write its anticipation, impact and follow-through timings and its commitment window, and mark which one currently carries no feedback.', min:20 },
        { kind:'topic', ref:'camera-design', why:'The camera decides what the player can see at the moment they choose, so it sets what a level can ask of them, and it can also make them ill.', do:'Pick the hardest decision point in one level and list everything the player needs to see to make it. Mark what your camera hides there, and write one fix.', min:25 },
        { kind:'smell', ref:'floaty-combat', why:'Floaty is what players say when feedback lags behind or contradicts the input that caused it, not necessarily when the numbers are wrong.', do:'Check your feedback matrix from the last step against its causes, based on the “Combat feels floaty” smell.', min:15 },
        { kind:'checklist', ref:'design-review', why:'Feel and control decisions are exactly the kind of thing that looks fine to the person who has played it a thousand times.', do:'Run the design review checklist against your control scheme and feedback pass specifically, not the whole feature.', min:25 },
        { kind:'prompt', ref:'ux-audit', why:'The UX friction audit gives you a structured way to turn your own blind spots into a list instead of a feeling.', do:'Run the UX friction audit prompt against your own build, and write down the one friction point you had stopped noticing.', min:25 }
      ],
      review:['encounter-design'],
      check:{
        recall:[
          { q:'What do anticipation and impact each tell the player?', a:'Anticipation warns what is about to happen, giving time to read or react; impact confirms that it happened. In gameplay that timing is a rules decision: it sets the telegraph and commitment windows the player reads.' },
          { q:'What are the two things feedback has to confirm for every action?', a:'That the input registered, ideally within about a hundred milliseconds, and what the outcome was and why, including for failure. Confirming input without outcome, or outcome without cause, both break the player’s ability to learn.' },
          { q:'Why is “floaty” usually a feedback problem, not a physics problem?', a:'Floaty is what players say when feedback lags behind or contradicts the input that caused it, such as a missing impact cue or a hit with no visible consequence, rather than the underlying physics values being wrong.', ideas:['Floaty is what players say when feedback lags behind or contradicts the input that caused it', 'rather than the underlying physics values being wrong'] },
          { q:'What is friction, in one sentence?', a:'Friction is the cost in inputs, mode switches, menu depth or latency between the player’s intent and the game’s response, and every unintended increment of it is a tax on the action, even though some deliberate friction can add real weight.', ideas:['Friction is the cost in inputs, mode switches, menu depth or latency', 'every unintended increment of it is a tax on the action', 'some deliberate friction can add real weight'] }
        ],
        build:'Fill your feedback matrix for the three most common actions, then run the design review checklist against the control scheme alone.',
        skip:['Can you name the anticipation, impact and commitment window of your most common action?','Can you name the empty cell in your feedback matrix right now?','Can you count the inputs your most common action takes without checking?','Have you already fixed a “floaty” complaint by changing feedback timing instead of a physics value?','Do you know the one friction point in your own build you have stopped noticing?']
      } },
    { id:'s4', t:'Onboarding and accessibility', level:'advanced',
      goal:'Teach the first five minutes by doing, and make sure the interface does not silently exclude someone.', hours:2.25,
      steps:[
        { kind:'topic', ref:'onboarding', why:'The first minutes teach more than any tutorial text, and they are where most players who quit leave.', do:'Write the first three things a new player has to learn, and for each say whether they learn it by doing or by reading.', min:25 },
        { kind:'game', ref:'the-witness', lens:'gameplay', why:'The Witness teaches every puzzle rule with panels and no words, the extreme case of onboarding by doing.', do:'Read its gameplay lens and compare one of its panel sequences with the first thing your own game teaches.', min:10 },
        { kind:'topic', ref:'accessibility', why:'An interface that only works for one set of senses or one input method is cutting players out before they ever reach your pacing or your loop.', do:'Pick one accessibility dimension (colour, input, text size, audio cues) and audit your current build against it for ten minutes.', min:25 },
        { kind:'game', ref:'street-fighter', lens:'replay', why:'Street Fighter 6’s Modern controls show accessibility priced openly rather than given away: a stated damage cut on shortcut specials buys a beginner a single-button special move instead of a full joystick motion.', do:'Read its replay lens, then write, for one demanding input in your own game, what a simplified version should honestly cost the player who chooses it.', min:10 },
        { kind:'checklist', ref:'onboarding-audit', why:'The silent onboarding audit is built specifically to catch a tutorial that teaches with words instead of consequences.', do:'Run the silent onboarding audit against your first five minutes, with the sound off and no tutorial text visible if you can manage it.', min:25 },
        { kind:'smell', ref:'english-shaped-ui', why:'An interface built around one language’s word lengths and reading direction breaks quietly in every other one.', do:'Check one screen of your UI against its causes, even if you have no plans to localise yet, based on the “The interface breaks in other languages” smell.', min:20 },
        { kind:'reflect', why:'The highest-leverage onboarding fix is rarely the flashiest one. Naming it plainly is what gets it built.', do:'Write the one onboarding change you would make first, and why it beats the other changes you considered.', min:25 }
      ],
      review:['feedback-and-affordance'],
      check:{
        recall:[
          { q:'What is the difference between teaching by doing and teaching by reading?', a:'Teaching by doing puts the player in a situation that demands the mechanic and lets them learn from the consequence. Teaching by reading tells them with text they can skip. Good onboarding is level design and feedback doing the work, with text only as a fallback.' },
          { q:'Name one accessibility dimension your build has not been checked against.', a:'Common candidates are colour redundancy, input remapping and hold-versus-toggle alternatives, text scale at real viewing distance, and captioned audio cues. Pick whichever your last build never tested and audit that one channel specifically.' },
          { q:'What does the silent onboarding audit remove on purpose, and why?', a:'At its core it removes you: no help and no explanation during play, so every hesitation shows what the level and feedback fail to teach. This path also asks you to turn sound off and hide tutorial text where you can, so a tooltip cannot take credit for learning the space should have done.' }
        ],
        build:'Run the silent onboarding audit with sound off and tutorial text hidden, and write the three things it caught that you would have missed otherwise.',
        skip:['Can you run your first five minutes with sound off and text hidden and still explain what happened?','Can you name which accessibility dimension your current build is weakest on?','Have you already caught an onboarding problem by watching a silent playtest instead of reading feedback?','Do you know the one onboarding change you would make first, right now?']
      } },
    { id:'s5', t:'Ship the pass', level:'advanced',
      goal:'Take a real level from another game apart, then apply the same eye to your own before you call it done.', hours:2.25,
      steps:[
        { kind:'topic', ref:'goals-horizons', why:'A single level’s pacing only makes sense against the goals a player is chasing at three different horizons. Get those wrong and no amount of local pacing fixes it.', do:'Write the immediate, session and long-term goal your level is currently serving, and check that your pacing graph supports all three.', min:25 },
        { kind:'topic', ref:'environmental-storytelling', why:'A space can carry story while the player keeps moving, at no cost in player time, and a landmark can promise the place a level is heading for; players trust what they find more than what they are told.', do:'List three things your level tells the player through props, damage or layout alone, and one story beat now told in text that the space could carry instead.', min:20 },
        { kind:'tool', ref:'dissect', why:'Dissecting a level you did not build is the fastest way to see structure, pacing and readability choices you have stopped noticing in your own.', do:'Pick a level from a game you know well and dissect its structure, pacing and one readability choice using Reference Dissection.', min:30 },
        { kind:'checklist', ref:'playtest-prep', why:'A pacing and onboarding pass is still a guess until it meets a player who has never seen it.', do:'Run the playtest session preparation checklist for a session built to test your onboarding and pacing changes specifically.', min:30 },
        { kind:'reflect', why:'Writing the comparison down is what turns noticing something into a change you will carry into the next level.', do:'Write two sentences: what the dissected level did that yours does not yet, and the one change you will make because of it.', min:25 },
        { kind:'game', ref:'god-of-war', lens:'world', why:'God of War returns the player again and again to one hub, the Lake of the Nine, and fills boat rides across it with Mímir’s stories as rest beats, so it is a clear level to dissect for pacing across three horizons.', do:'Read its world lens, then map one return to the lake: what the trip offers in the next minute, in the session and across the game, and which of the three your own hub leaves empty.', min:15 }
      ],
      review:['onboarding'],
      check:{
        recall:[
          { q:'Why do players trust environmental storytelling more than text?', a:'They discover it themselves by reading the space, so the conclusion feels owned, while told story feels imposed; it also costs no player time, because it is read while playing.', ideas:['They discover it themselves by reading the space, so the conclusion feels owned', 'it also costs no player time, because it is read while playing'] },
          { q:'What are the three horizons a level’s pacing has to serve?', a:'Short-term, seconds to a minute; session, the current sitting; and long-term, across sessions. A level’s pacing has to support the immediate action while still advancing the session’s and the game’s larger goals.' },
          { q:'What does dissecting someone else’s level show that reading about it cannot?', a:'Dissection forces you to name the exact structural beats, sightlines and readability choices another designer made, giving concrete mechanisms to compare directly against your own level, which reading about level design in the abstract cannot surface.', ideas:['Dissection forces you to name the exact structural beats, sightlines and readability choices another designer made', 'giving concrete mechanisms to compare directly against your own level'] },
          { q:'What makes a playtest session test onboarding, rather than just running it again?', a:'A specific written question and hypothesis about onboarding or pacing, fresh matched players who have never seen the build, silent observation, and a protocol aimed at the exact change made. Without those it is just another playthrough, not a test.' }
        ],
        build:'Dissect one level from a game you know, then write the one change to your own level that dissection justified.',
        skip:['Can you name a story beat your level tells with space alone?','Can you name your level’s immediate, session and long-term goal without checking notes?','Have you already dissected a level from another game and found something concrete to steal or avoid?','Can you plan a playtest session aimed at one specific question instead of a general “how did that feel”?','Do you know the single next change your level needs, right now, without re-reading this stage?']
      } }
  ]
});

PATH('games-that-broke-the-mould', {
  t:'Learn from games that broke the mould', tag:'Rules that teach themselves, knowledge as progress, time bent, genres fused.',
  pick:'Study the games that invented something new',
  track:'design', level:'intermediate', hours:16.25,
  audience:'Designers who know the fundamentals and want to see how some of the most original games of the last twenty-five years solved problems the usual answers could not.',
  outcome:'You can take apart an unusual game through ten lenses, name the one idea it contributed, and adapt that idea to your own design without copying its surface.',
  prereq:['game-designer-foundations'], next:['systems-designer','level-and-ux-designer','senior-game-designer','study-the-hits-play'],
  stages:[
    { id:'s1', t:'Rules that teach themselves', level:'intermediate',
      goal:'See how a game can teach its rules with no words, and design one rule that teaches itself.', hours:2.25,
      steps:[
        { kind:'game', ref:'the-witness', lens:'gameplay', why:'The Witness teaches every puzzle rule through a sequence of panels and no text, a clear example of teaching by doing.', do:'Read its gameplay lens, then list three rules it teaches and the panel sequence that teaches each one: introduce, confirm, then combine.', min:30 },
        { kind:'game', ref:'steins-gate', lens:'gameplay', why:'Steins;Gate teaches its entire branching mechanic, replying to a text or ignoring a call, through a long, low-stakes opening stretch of ordinary messages, with no tutorial pop-up ever naming the system.', do:'Read its gameplay lens and signature teach section, then write the one low-stakes action your own game repeats early that it is quietly training the player to trust before a real decision depends on it.', min:20 },
        { kind:'topic', ref:'onboarding', why:'The general principles behind wordless teaching live here, so you can tell what The Witness does from what any good tutorial does.', do:'Compare The Witness’s panel sequences with the onboarding topic’s advice, and note one thing it does that most tutorials do not.', min:20 },
        { kind:'game', ref:'baba-is-you', lens:'gameplay', why:'Baba Is You turns the rules themselves into objects you push, so learning the rules and breaking them are the same act.', do:'Read its gameplay lens and write down the one moment where a rule you took for granted became something you could change.', min:25 },
        { kind:'topic', ref:'puzzle-design', why:'Both games depend on a solution space that is fair: every answer can be confirmed from what the player already knows.', do:'Sketch one puzzle for your own game and name its aha: the one insight that unlocks it and the clue that makes that insight fair.', min:25 },
        { kind:'checklist', ref:'onboarding-audit', why:'A wordless rule is only taught if a player who has never seen it learns it.', do:'Run the silent onboarding audit against the puzzle you just sketched, imagining a player who reads nothing.', min:20 }
      ],
      review:[],
      check:{
        recall:[
          { q:'How can a puzzle teach a rule without words, as The Witness does?', a:'It isolates the rule in a panel that can only be solved one way, then confirms it with variations that fail if the rule is misunderstood, then combines it with rules learned earlier. The panel sequence is the tutorial.' },
          { q:'What changes when a puzzle’s rules are themselves manipulable objects, as in Baba Is You?', a:'Its rules are written as word blocks in the level, and pushing the blocks rewrites the rules, so the player solves puzzles by changing what is true rather than by working within fixed rules.', ideas:['Its rules are written as word blocks in the level', 'pushing the blocks rewrites the rules', 'the player solves puzzles by changing what is true rather than by working within fixed rules'] },
          { q:'What makes a puzzle fair?', a:'The answer can be reached and confirmed from information the player has already been given, so the aha is a realisation rather than a guess or a hunt for a hidden clue.' }
        ],
        build:'Design one wordless rule for your game as a three-step sequence: an isolated introduction, a confirmation that fails if misunderstood, and a combination with an earlier rule.',
        skip:['Can you name the three steps of a wordless teaching sequence and give an example of each?','Can you explain how a puzzle is confirmed as fair without playing it?','Have you already taught a rule in your own game with no text and watched a new player learn it?']
      } },
    { id:'s2', t:'Knowledge as progression', level:'intermediate',
      goal:'Understand games where progress is what the player knows, and plan a gate that is understanding rather than a lock.', hours:3.42,
      steps:[
        { kind:'topic', ref:'knowledge-as-progression', why:'Most games store progress in stats and items. A few store it only in the player’s head, which changes how every gate and reward works.', do:'List three gates in a game you know and say whether each is a lock (an item or stat) or an understanding (something the player must know).', min:25 },
        { kind:'topic', ref:'backtracking-and-return-trips', why:'A knowledge gate opens by understanding and an item gate by a key, and both send the player back through space they know. What has changed on the way decides whether the return feels like a reward.', do:'Take one knowledge gate from the games in this stage and write the return trip it causes: where the player has to go back to, how long the walk takes, and what they now see differently on the way.', min:25 },
        { kind:'game', ref:'outer-wilds', lens:'gameplay', why:'Outer Wilds resets the solar system every 22 minutes and keeps only what the player learned, the clearest case of knowledge as the only progression.', do:'Read its gameplay lens and write how the ship’s log keeps a player oriented without telling them the answer.', min:30 },
        { kind:'game', ref:'return-of-the-obra-dinn', lens:'gameplay', why:'Obra Dinn turns deduction into a ledger and confirms fates only in sets of three, so single guesses cannot be checked and reasoning is rewarded.', do:'Read its gameplay lens and explain in two sentences why confirming in threes changes how players reason.', min:30 },
        { kind:'game', ref:'zero-escape-999', lens:'lore', why:'999 rations its explanation across six mutually exclusive endings, so one run leaves the player with a wrong theory on purpose, and what they learned in earlier runs is the real progression.', do:'Read its lore lens, then write what a player knows after their first ending that changes their next run, and how the later flowchart changed the cost of reaching that knowledge.', min:25 },
        { kind:'tool', ref:'hypothesis', why:'Knowledge gates fail silently: players who miss a clue just stall. The hypothesis turns “they will figure it out” into something you can test.', do:'Write a playtest hypothesis for one knowledge gate: what a player must know, where they learn it, and how you will see whether they did.', min:25 },
        { kind:'smell', ref:'dont-know-what-to-do', why:'A knowledge game’s most common failure looks exactly like this smell, and the fixes differ from a normal game’s.', do:'Check the smell’s causes against your gate and mark which one a knowledge game is most exposed to.', min:20 },
        { kind:'game', ref:'ace-attorney', lens:'gameplay', why:'Ace Attorney never gates a verdict behind an item the player has not already found; the only thing that changes between a wrong guess and a right one is whether the player has understood which sentence is the lie.', do:'Read its gameplay lens, then write the one rule that keeps its Court Record fair (every possible answer already in the player’s hands) and check whether your own hardest gate follows the same rule.', min:25 }
      ],
      review:['puzzle-design'],
      check:{
        recall:[
          { q:'Why might a design withhold its explanation across several runs, as 999 does?', a:'Its explanation is split across six exclusive endings, and only the true ending, reachable after one specific other ending, supplies all of it; the knowledge carried into later runs is what moves the player forward.', ideas:['Its explanation is split across six exclusive endings', 'only the true ending, reachable after one specific other ending, supplies all of it', 'the knowledge carried into later runs is what moves the player forward'] },
          { q:'What is the difference between a lock and an understanding as a gate?', a:'A lock opens when the player has an item or stat, whoever they are; an understanding opens when the player knows something, so a new save with the same knowledge can pass it at once.', ideas:['A lock opens when the player has an item or stat, whoever they are', 'an understanding opens when the player knows something', 'a new save with the same knowledge can pass it at once'] },
          { q:'What does a log do in a game where progress is only knowledge, as in Outer Wilds?', a:'The log records what the player has found and where threads lead without solving them, so the player stays oriented across resets while the reasoning stays theirs.', ideas:['The log records what the player has found and where threads lead without solving them', 'the player stays oriented across resets while the reasoning stays theirs'] },
          { q:'What does Obra Dinn’s three-at-a-time confirmation prevent?', a:'Brute-force guessing: a single wrong answer hides which fates are right, so the player has to reason several deductions to certainty before the game confirms any of them.', ideas:['Brute-force guessing', 'a single wrong answer hides which fates are right', 'the player has to reason several deductions to certainty before the game confirms any of them'] }
        ],
        build:'Write the hypothesis for one knowledge gate in your game, including the observation that would prove players learned it and the one that would prove they guessed.',
        skip:['Can you name what a player carries from one run of your game into the next?','Can you tell a knowledge gate from a lock in a game you are designing?','Have you already playtested a gate that depends on the player noticing something?','Can you explain how a game keeps players oriented without giving answers away?']
      } },
    { id:'s3', t:'Time and turns', level:'intermediate',
      goal:'Compare the ways games structure time, and choose the one that makes your core decision matter.', hours:3.93,
      steps:[
        { kind:'topic', ref:'time-and-turns', why:'Real time, turns and everything between them decide what kind of skill a game asks for: thinking, reacting, or both.', do:'Place five games you know on a line from pure turns to pure real time, and write what skill each one tests.', min:25 },
        { kind:'topic', ref:'rhythm-and-music-timed-design', why:'A rhythm game is the extreme case of time as a rule: the clock is the music, and the judgement window decides whether a press counts. Its forgiveness choices transfer to any timed input.', do:'Pick one timed action in your game and write its window in milliseconds and in frames at your frame rate, and whether early and late presses are judged the same. Then say what a player who is 40 ms late every time would experience.', min:30 },
        { kind:'game', ref:'rhythm-heaven', lens:'gameplay', why:'Rhythm Heaven makes the song the rulebook: each minigame is one timing idea learned by ear, with no note lane on screen.', do:'Read its gameplay lens, then design a cue for one timed action in your game that a player could follow by ear alone, and say how the game shows a miss.', min:25 },
        { kind:'game', ref:'valkyria-chronicles', lens:'gameplay', why:'Valkyria Chronicles puts real-time movement inside a turn, so a plan is tested by the player’s own run under fire.', do:'Read its gameplay lens and name the one rule that makes real-time movement risky rather than a slower way to click a tile.', min:25 },
        { kind:'game', ref:'smt-iii-nocturne', lens:'gameplay', why:'Press Turn makes the turn itself a resource: hitting weaknesses earns extra actions and missing costs them.', do:'Read its gameplay lens and explain how Press Turn changes what a player wants to do on their first action of a turn.', min:28 },
        { kind:'game', ref:'superhot', lens:'gameplay', why:'Superhot slows time to a crawl whenever you stand still, turning an action game into a sequence of tiny decisions.', do:'Read its gameplay lens and write what a player can do in Superhot that they cannot in a normal shooter.', min:28 },
        { kind:'game', ref:'worms-armageddon', lens:'gameplay', why:'Worms Armageddon splits each turn into a gamble on an aimed shot under random wind, then a few real-time seconds of retreat from the crater it made, so a turn-based game still tests execution.', do:'Read its gameplay lens, then write which part of one of your own turns is planning and which is execution, and what a short real-time window after the decision would add or cost.', min:15 },
        { kind:'tool', ref:'loop', why:'The time structure sits inside the core loop; drawing it shows where the decision and the execution happen.', do:'Build your core loop in the Game Loop Builder and mark which steps happen in real time and which in turns.', min:30 },
        { kind:'game', ref:'final-fantasy', why:'Final Fantasy changed its own answer to the time question five times, from menu turns to Active Time Battle, strictly turn-based CTB, gambit-driven real time and full action, while keeping its crisis and motifs constant.', do:'Read its timeline and its changed section, then name which of those time structures best suits your own game’s core decision, and what the others would cost it.', min:30 }
      ],
      review:['knowledge-as-progression'],
      check:{
        recall:[
          { q:'What does a retreat window after the attack add to a turn, as in Worms Armageddon?', a:'The worm gets a few seconds of real-time retreat to get clear of the crater its own shot made, so the turn tests aim under wind and then quick movement.', ideas:['The worm gets a few seconds of real-time retreat to get clear of the crater its own shot made', 'the turn tests aim under wind and then quick movement'] },
          { q:'What can a hybrid keep from turn-based tactics and what must it change, as Valkyria Chronicles’ BLiTZ does?', a:'It keeps turns, units and command points; it changes moving a unit into a real-time run in which enemies in sight open fire, so carrying out the plan becomes a skill.', ideas:['It keeps turns, units and command points', 'it changes moving a unit into a real-time run in which enemies in sight open fire', 'carrying out the plan becomes a skill'] },
          { q:'How does Press Turn reward hitting a weakness?', a:'A weakness or critical hit costs only half a turn icon, giving the side extra actions, while misses and blocked or nullified attacks cost more, so the turn itself becomes a resource.', ideas:['A weakness or critical hit costs only half a turn icon, giving the side extra actions', 'misses and blocked or nullified attacks cost more', 'the turn itself becomes a resource'] },
          { q:'What skill does a game test when time moves only as the player moves, as in Superhot?', a:'Planning under a near-frozen clock: because time runs at full speed only when the player moves, it tests reading the scene and choosing a sequence rather than reaction speed.', ideas:['Planning under a near-frozen clock', 'time runs at full speed only when the player moves', 'it tests reading the scene and choosing a sequence rather than reaction speed'] }
        ],
        build:'Mark each step of your core loop as real time or turn-based in the Game Loop Builder, and write one sentence on why that choice fits the decision it serves.',
        skip:['Can you say which part of your turn is planning and which is execution?','Can you name four time structures between pure turns and pure real time with an example of each?','Can you say what skill your own game’s time structure tests?','Have you already changed a game’s time structure and seen what it did to players?']
      } },
    { id:'s4', t:'Genres blended', level:'intermediate',
      goal:'Learn when two genres make one game and when they make two half-games, and test a blend of your own.', hours:3.65,
      steps:[
        { kind:'topic', ref:'genre-hybrids', why:'A hybrid works when each loop feeds the other; otherwise the player plays one and tolerates the other.', do:'Pick a hybrid you know and draw an arrow from each loop to what it gives the other. Mark any arrow that is missing.', min:25 },
        { kind:'topic', ref:'puzzles-in-action-spaces', why:'The blend works when the puzzle is built from the action game’s own verbs, so a puzzle room teaches the fight and the fight tests the puzzle. Pausing the action for a separate puzzle game is the failure.', do:'List the verbs of an action game you know, then design one puzzle room that uses only those verbs and a fight right after it that asks for the same one under pressure.', min:30 },
        { kind:'game', ref:'crosscode', lens:'gameplay', why:'CrossCode’s puzzles are its combat kit used on a room instead of a monster, so a puzzle dungeon and an action RPG train one set of skills.', do:'Read its gameplay lens, then list two puzzle rooms that use a combat verb and the fight that follows each, and say which skill the room trained for the fight.', min:25 },
        { kind:'game', ref:'persona-5-royal', lens:'gameplay', why:'Persona 5 Royal wraps a dungeon crawler in a school calendar, and each side makes the other stronger.', do:'Read its gameplay lens and write the two arrows: what the calendar gives the dungeons, and what the dungeons give the calendar.', min:30 },
        { kind:'game', ref:'slay-the-spire', lens:'gameplay', why:'Slay the Spire fused a deckbuilder with a roguelike so closely that it popularised a genre of its own.', do:'Read its gameplay lens and name what each parent genre would lose if the other were removed.', min:20 },
        { kind:'game', ref:'danganronpa', lens:'gameplay', why:'Danganronpa takes Ace Attorney’s testimony argument and turns picking the lie into a timed shooting gallery, so working out the answer and hitting it in time become two separate skills in one blend.', do:'Read its gameplay lens, then write the arrow each half gives the other, and say whether the shooting half feeds the deduction or only taxes it.', min:24 },
        { kind:'tool', ref:'sysmap', why:'Mapping how systems feed each other shows whether a blend is one game or two.', do:'Map the two loops of your blend in the System Relationship Map and check that each has at least one arrow into the other.', min:25 },
        { kind:'smell', ref:'features-not-better', why:'A second genre bolted on without a feedback arrow is a common way features stop making the game better.', do:'Check your blend against the smell’s causes and mark whether the second loop is a feature or a partner.', min:20 },
        { kind:'game', ref:'touhou', lens:'business', why:'Touhou Luna Nights carries the Touhou shooters’ graze system into a Metroidvania, so bullets become something to approach, not only avoid: a blend that works by taking one rule from the source genre into the new one.', do:'Read its entries and business lens, then write the arrow the graze system gives Luna Nights’ exploration loop, and say whether Touhou: Scarlet Curiosity, faulted for combat where no special beat the basic combo, carried any such arrow across.', min:20 }
      ],
      review:['time-and-turns'],
      check:{
        recall:[
          { q:'How can a hybrid add an execution demand to a deduction move, as Danganronpa does to Ace Attorney’s?', a:'It keeps arguing testimony apart but makes selecting the lie a timed aiming task, so deduction and execution become two skills, and drops the law and judge in favour of persuasion alone.', ideas:['It keeps arguing testimony apart', 'makes selecting the lie a timed aiming task, so deduction and execution become two skills', 'drops the law and judge in favour of persuasion alone'] },
          { q:'What makes a genre hybrid work?', a:'Each loop produces something the other needs, so playing one makes the player better at or more invested in the other; if a loop only consumes, it becomes a chore.', ideas:['Each loop produces something the other needs, so playing one makes the player better at or more invested in the other', 'if a loop only consumes, it becomes a chore'] },
          { q:'What can a calendar give the dungeons of a hybrid, as in Persona 5 Royal?', a:'Time spent with Confidants and on social stats unlocks abilities, fusion bonuses and options that make the party stronger, while the calendar’s deadlines give the dungeons urgency.', ideas:['Time spent with Confidants and on social stats unlocks abilities, fusion bonuses and options that make the party stronger', 'deadlines give the dungeons urgency'] },
          { q:'How can you tell a blend is two half-games?', a:'Players skip or rush one side, its rewards do not change how the other side plays, and removing it would not change the other loop.', ideas:['Players skip or rush one side', 'its rewards do not change how the other side plays', 'removing it would not change the other loop'] }
        ],
        build:'Map your blend in the System Relationship Map with at least one arrow from each loop into the other, and write what you would cut if one arrow is missing.',
        skip:['Can you say whether the second half of your blend feeds the first or only taxes it?','Can you name the arrows between the two loops of a hybrid you admire?','Have you already cut or rebuilt a second genre in your own game because it did not feed the first?','Can you tell a feature from a partner loop at a glance?']
      } },
    { id:'s5', t:'Presentation as design', level:'advanced',
      goal:'See how interface, voice and framing can be the mechanic, not decoration, and design one piece of presentation that carries a rule.', hours:3,
      steps:[
        { kind:'game', ref:'papers-please', lens:'ui', why:'Papers, Please makes paperwork the game, and the friction of its desk is its moral argument.', do:'Read its UI lens and write how the desk’s layout adds pressure beyond the shift clock on the wall.', min:25 },
        { kind:'game', ref:'nier-automata', lens:'ui', why:'NieR: Automata turns the HUD, and even the android’s OS, into plug-in chips you can remove, the OS one fatally.', do:'Read its UI lens and explain what the game says by letting the player uninstall their own interface.', min:25 },
        { kind:'topic', ref:'ux-as-design', why:'Both games treat the interface as part of the design rather than a layer on top; this topic gives the general principles.', do:'List three pieces of interface in your game and say which could carry a rule or a theme instead of only information.', min:20 },
        { kind:'game', ref:'disco-elysium', lens:'lore', why:'Disco Elysium turns skills into voices in the character’s head, so the character sheet becomes the narrator.', do:'Read its lore lens and write how making a stat speak changes how a player thinks about building a character.', min:25 },
        { kind:'game', ref:'undertale', lens:'lore', why:'Undertale remembers what you did even after you reload, so the save system itself becomes part of the story.', do:'Read its lore lens and name the moment where the game shows it remembers, and what that does to the player’s next choice.', min:25 },
        { kind:'game', ref:'doki-doki-literature-club', lens:'ui', why:'Doki Doki Literature Club goes one step further than a save file remembering a reset: it asks the player to leave the game window and delete a real file from their own computer, turning the operating system itself into part of the interface.', do:'Read its ui lens and compare it directly to the Undertale step above: name what changes when a meta interface is made literally real rather than only referenced by the fiction.', min:20 },
        { kind:'topic', ref:'ludonarrative-alignment', why:'Every game in this stage makes what the player does carry what the story says; this topic names the rule behind them: when doing and story disagree, players believe the doing.', do:'Name one action your player repeats most, write what it says about the character or world, and check whether your story says the same thing.', min:20 },
        { kind:'checklist', ref:'design-review', why:'Presentation that carries a rule still has to pass the same review as any feature.', do:'Run the design review checklist against the piece of presentation you chose, and check that it still gives players the information they need.', min:20 }
      ],
      review:['genre-hybrids', 'onboarding'],
      check:{
        recall:[
          { q:'What do players believe when play and story disagree?', a:'The play. Players spend far more time doing than watching, so the mechanics are the loudest narrator, and a gap between them breaks belief in both story and system unless it is deliberate and meant to be felt.' },
          { q:'How can a game create pressure from a desk and a clock, as Papers, Please does?', a:'Through the desk: limited space, documents that must be cross-checked, a day that ends with rent and family needs, so every careful check costs money and every shortcut risks a citation.', ideas:['Through the desk: limited space, documents that must be cross-checked, a day that ends with rent and family needs', 'every careful check costs money and every shortcut risks a citation'] },
          { q:'What does it mean for the HUD to be a system the player can change, as in NieR: Automata?', a:'Remove parts of the HUD to free chip space for abilities, and even remove the OS chip that keeps the android running, so the interface becomes a resource and part of the game’s theme.', ideas:['Remove parts of the HUD to free chip space for abilities', 'even remove the OS chip that keeps the android running', 'the interface becomes a resource'] },
          { q:'Why does it matter when a game remembers the player’s resets, as Undertale does?', a:'It removes the usual safety of reloading: some characters, such as Flowey and Sans, remember what a reload undid, so the player treats a choice as real rather than as a branch to try and undo.', ideas:['It removes the usual safety of reloading', 'some characters, such as Flowey and Sans, remember what a reload undid', 'the player treats a choice as real'] }
        ],
        build:'Design one piece of presentation (a HUD element, a menu, a save screen or a voice) that carries a rule or theme of your game, and run it through the design review checklist.',
        skip:['Can you say what your most repeated action tells the player about your story?','Can you name a piece of interface in a game that is also a mechanic?','Have you already designed presentation that carries a rule, not just information?','Can you explain how presentation can make a moral or thematic argument?']
      } }
  ]
});

PATH('study-the-hits-play', {
  t:'Study the hits: how play holds people', tag:'Why some games are played for years: the dimensions of fun, skill you can feel, content that keeps asking, systems that surprise, stakes and other people.',
  pick:'Learn what keeps players playing from the hits',
  track:'design', level:'intermediate', hours:14.17,
  audience:'Designers who know the fundamentals and want to see, through fifteen well-known games, how play holds people past the first hour.',
  outcome:'You can name the dimensions of fun a game runs on, say what the player is getting better at, judge whether content asks a new question, and find the rhythm and the other people your own design depends on.',
  prereq:['game-designer-foundations'], next:['games-that-broke-the-mould','systems-designer'],
  stages:[
    { id:'s1', t:'What fun is made of', level:'intermediate',
      goal:'Split “fun” into named dimensions, and say what makes a player come back or leave.', hours:2.5,
      steps:[
        { kind:'topic', ref:'fun-dimensions', why:'“Make it more fun” cannot be acted on; naming which dimension is present or flat can.', do:'Pick a game you know and list the two or three dimensions it is mostly made of, and one it leaves out.', min:20 },
        { kind:'game', ref:'vampire-survivors', lens:'gameplay', why:'Vampire Survivors strips combat to one input, movement, and puts every decision in the level-up screen, so one dimension is easy to see.', do:'Read its gameplay lens and write what the player is deciding at each level-up and why the game needs no aim button.', min:25 },
        { kind:'game', ref:'wordle', lens:'replay', why:'Wordle keeps players returning after they have mastered the puzzle, which shows return coming from something other than challenge.', do:'Read its replay lens and write what the player has at stake by day two hundred, and how the puzzle’s difficulty relates to it.', min:25 },
        { kind:'topic', ref:'return-and-quit', why:'Return and quit have causes you can name, and Wordle’s streak is one of them.', do:'Classify Wordle’s pull to return using the topic’s list of return forces, then name the force in your own game you would rely on.', min:20 },
        { kind:'game', ref:'stardew-valley', lens:'world', why:'Stardew Valley plans a town around a calendar of festivals, which shows a game giving players a reason to come back on a particular day.', do:'Read its world lens and list two festival days and what each does to the shops and the clock, then say what a player plans around them.', min:20 },
        { kind:'topic', ref:'mastery-discovery-expression', why:'Mastery, discovery and expression are three engines that keep play going once novelty fades.', do:'For each of the three games above, name which engine it runs on and how it would fail if that engine ran dry.', min:20 },
        { kind:'tool', ref:'canvas', why:'A core experience needs its dimensions written down before a feature can be judged against them.', do:'Fill in the Core Experience Canvas for your game, naming its dominant dimension and its main return force.', min:25 }
      ],
      review:[],
      check:{
        recall:[
          { q:'Why is “make it more fun” not actionable?', a:'Fun is a bundle of dimensions, so the useful question is which dimension is flat or missing, such as mastery, discovery or tension.' },
          { q:'What brings players back after mastery, as the streak does in Wordle?', a:'The streak counter: one puzzle a day, no replay, and one failed day resets the number to zero, so what is at stake is the unbroken streak, not a fresh challenge.', ideas:['The streak counter', 'one puzzle a day, no replay', 'one failed day resets the number to zero'] },
          { q:'What are the three engines of long-term engagement?', a:'Mastery (getting better at something perceivable), discovery (finding what you did not know was there) and expression (shaping the game to reflect yourself). Most great games run on at least two.' }
        ],
        build:'Write your game’s core experience on the Core Experience Canvas: its dominant dimension, the engine that keeps play going after novelty, and the reason a player returns.',
        skip:['Can you name the two or three dimensions your game is mostly made of?','Can you separate the causes of returning from the causes of quitting?','Can you say which of mastery, discovery or expression your game runs on?']
      } },
    { id:'s2', t:'Skill you can feel', level:'intermediate',
      goal:'Say what a player gets better at in a game, how the game shows them, and why a loss feels fair or not.', hours:3.42,
      steps:[
        { kind:'topic', ref:'skill-and-mastery', why:'A skill has to be perceivable to reward the player, and this topic gives the vocabulary for what the game asks and how it shows growth.', do:'List the skills one game you know asks for, and mark each as taught, exercised, combined or shown back to the player.', min:20 },
        { kind:'game', ref:'celeste', lens:'gameplay', why:'Celeste hides forgiving timing windows under a punishing-looking platformer, so a death reads as the player’s mistake rather than the game’s.', do:'Read its gameplay lens and pick two of the timing windows it names, then write what a death would feel like without each.', min:25 },
        { kind:'topic', ref:'rhythm-and-music-timed-design', why:'Celeste forgives a late jump with a few frames of grace; a rhythm game makes that forgiveness the whole design. Timing windows are how a game decides that a press was skilful.', do:'Compare one of Celeste’s grace windows with a rhythm game’s judgement window: write both in milliseconds, and what each forgives and what it still asks of the player.', min:30 },
        { kind:'game', ref:'rhythm-heaven', lens:'lineage', why:'Many games copied Rhythm Heaven’s look; its lineage lens separates what imitators copied (short minigames, comic art) from the mechanism the few close ones kept and changed.', do:'Read its lineage lens, then name one thing an imitator kept and one thing it missed, and which of the two your own game would need.', min:20 },
        { kind:'game', ref:'rhythm-doctor', lens:'lineage', why:'Rhythm Doctor is one of the few games that captured what Rhythm Heaven does: it keeps the mechanism (a cue by ear, one button, a rule that holds within a level) and changes the structure, instead of copying the look.', do:'Read its lineage lens beside Rhythm Heaven’s, then write what Rhythm Doctor kept, what it changed, and the one change that made it its own game rather than a copy.', min:20 },
        { kind:'game', ref:'tetris', lens:'replay', why:'Tetris shows how changing the piece generator changed what a high score measures, luck or skill.', do:'Read its replay lens and write what a high score measured before and after the seven-bag generator.', min:25 },
        { kind:'game', ref:'into-the-breach', lens:'gameplay', why:'Into the Breach shows every queued attack and removes chance from attacks, so a lost mech traces back to a misread.', do:'Read its gameplay lens and write the one misread that could lose a mech, then say how the game makes that misread visible.', min:25 },
        { kind:'tool', ref:'hypothesis', why:'A claim that players can see their improvement is a hypothesis until a playtest shows it.', do:'Write a playtest hypothesis for one skill in your game: what players should get better at, and what you will observe to know they did.', min:25 },
        { kind:'reflect', why:'Celeste, Tetris and Into the Breach each make a loss point at the player, and it helps to write your own answer down.', do:'Write what your game does so that a loss reads as “I misread that”, and what it does that makes a loss read as bad luck.', min:15 }
      ],
      review:['mastery-discovery-expression'],
      check:{
        recall:[
          { q:'How can a hard game feel kind, as Celeste does?', a:'It hides forgiving timing windows such as coyote time and jump buffering, so a death reads as a mistimed jump rather than an unregistered input, and players keep retrying.', ideas:['It hides forgiving timing windows such as coyote time and jump buffering', 'a death reads as a mistimed jump rather than an unregistered input', 'players keep retrying'] },
          { q:'What does a piece generator change about what a score measures, using Tetris’s seven-bag as the example?', a:'It removed droughts of unlucky pieces by dealing every shape once before reshuffling, so a high score measures placement skill more than surviving bad luck.', ideas:['It removed droughts of unlucky pieces by dealing every shape once before reshuffling', 'a high score measures placement skill more than surviving bad luck'] },
          { q:'Why does showing every queued attack make a loss traceable to the player, as in Into the Breach?', a:'Attacks never miss, damage is fixed and every queued Vek attack shows on the tile it will hit, so a loss traces to one ignored icon rather than to chance.', ideas:['Attacks never miss, damage is fixed', 'every queued Vek attack shows on the tile it will hit', 'a loss traces to one ignored icon rather than to chance'] }
        ],
        build:'Take one skill in your game and write how it is taught, how the player sees themselves improve, and the hypothesis that would show players did improve.',
        skip:['Can you list the skills your game asks for and say which one it never teaches?','Can you say whether a loss in your game reads as the player’s misread or as luck?','Have you already watched a new player and a veteran play the same level to compare?']
      } },
    { id:'s3', t:'Content that keeps asking', level:'intermediate',
      goal:'Tell content that poses a new question from content that repeats one, and judge a generator by what it changes for the player.', hours:2.75,
      steps:[
        { kind:'topic', ref:'encounters-and-enemies', why:'Each enemy should pose a distinct question, and this topic gives the test for whether it does.', do:'Choose three enemies from a game you know and write the question each asks and the player verb that answers it.', min:20 },
        { kind:'game', ref:'dynasty-warriors', lens:'gameplay', why:'Dynasty Warriors builds a crowd that poses almost no question, so the few named officers are where the real decision sits.', do:'Read its gameplay lens and write which enemies in a stage are scenery and which are the question, and what the stage asks the player to decide.', min:25 },
        { kind:'topic', ref:'items-weapons-abilities', why:'Items are the most common reward, and the best change what the player considers doing rather than a number.', do:'Classify five items from a game you know as new verb, changed priority or changed parameter.', min:20 },
        { kind:'game', ref:'hades', lens:'gameplay', why:'Hades makes its gods compete for five ability slots, so every boon taken is another refused and a build is a series of trade-offs.', do:'Read its gameplay lens and write two boons that compete for the same slot and what a player gives up by choosing one.', min:25 },
        { kind:'topic', ref:'procedural-content', why:'A generator can produce endless content and still bury a game in sameness, so it has to be judged by what it changes for the player.', do:'For a generator you know, write what it varies that changes the player’s decision and what it varies only in appearance.', min:20 },
        { kind:'game', ref:'minecraft', lens:'world', why:'Minecraft builds every world from a seed, which shows a small ruleset producing an effectively unlimited number of distinct places.', do:'Read its world lens and write how sharing a seed differs from sharing a hand-made map, and what a returning player gets from a fresh seed.', min:25 },
        { kind:'tool', ref:'loop', why:'Content lives in a loop, and drawing it shows where a repeated question would wear the loop out.', do:'Build your core loop in the Game Loop Builder and mark the step where your content should pose a new question each time.', min:25 }
      ],
      review:['skill-and-mastery','mastery-discovery-expression'],
      check:{
        recall:[
          { q:'What test does the encounters topic give an enemy?', a:'It should ask a distinct question that needs a distinct answer from the player’s verbs; an enemy that asks the same question with more health is a slower version of the same fight.', ideas:['It should ask a distinct question that needs a distinct answer', 'an enemy that asks the same question with more health is a slower version of the same fight'] },
          { q:'What makes a build a series of trade-offs, as contested ability slots do in Hades?', a:'Five ability slots (Attack, Special, Cast, Dash, Call) are contested by different gods, so taking one god’s boon for a slot means refusing or replacing another’s.' },
          { q:'What does a single seed value give players of a generated world, as in Minecraft?', a:'A single value that reproduces a whole world, so the same ruleset gives an effectively unlimited number of distinct worlds and players can share a seed like a recipe.', ideas:['A single value that reproduces a whole world', 'the same ruleset gives an effectively unlimited number of distinct worlds', 'players can share a seed like a recipe'] },
          { q:'How should a generator be judged?', a:'By whether it varies the player’s decision or only decoration; mathematically unique outputs that feel identical are oatmeal, not content.' }
        ],
        build:'List the enemies and items in your game with the question each asks, then mark any pair that asks the same question and say what you would change.',
        skip:['Can you write the question each enemy in your game asks?','Can you classify your items as new verb, changed priority or changed parameter?','Can you tell what your generator varies for the player and what it varies for the eye?']
      } },
    { id:'s4', t:'Systems that surprise', level:'advanced',
      goal:'See how rules that touch each other produce play nobody scripted, and connect two systems in your own design on purpose.', hours:2,
      steps:[
        { kind:'topic', ref:'agency-and-emergence', why:'Agency is the player causing things and emergence is the game surprising its designers, and both depend on systems reaching each other.', do:'For a game you know, write one story a player could tell that nobody on the team scripted, and the systems that produced it.', min:25 },
        { kind:'game', ref:'factorio', lens:'gameplay', why:'Factorio makes solving one shortage create the next, so the game never has to design a new problem by hand.', do:'Read its gameplay lens and write the chain from one shortage to the next, and what a player learns to ask instead of whether they have won.', min:25 },
        { kind:'game', ref:'portal', lens:'gameplay', why:'Portal gives the player one tool that edits space, so every puzzle is a question of where to place it rather than how to survive.', do:'Read its gameplay lens and write two different uses of the portal gun and what the player has to reason about each time.', min:25 },
        { kind:'tool', ref:'sysmap', why:'Emergence needs systems that can affect each other, and a map shows which walls stand between them.', do:'Map the systems in your game in the System Relationship Map and find one pair with no arrow between them.', min:30 },
        { kind:'smell', ref:'same-way', why:'When every player plays the same way, the systems are not reaching each other.', do:'Check the smell’s causes against your map and note which missing arrow would open a second way to play.', min:20 }
      ],
      review:['encounters-and-enemies','items-weapons-abilities'],
      check:{
        recall:[
          { q:'What separates agency from emergence?', a:'Agency is the player perceiving that their choices cause outcomes; emergence is behaviour arising from rule interactions that were not individually authored. Together they produce stories players tell as their own.' },
          { q:'Why can a system game keep producing new problems, as Factorio does?', a:'Solving one shortage always exposes the next limit, such as furnaces then belts then inserters, so the player keeps diagnosing what is starved.', ideas:['Solving one shortage always exposes the next limit, such as furnaces then belts then inserters', 'the player keeps diagnosing what is starved'] },
          { q:'How can one tool change what a puzzle asks, as the portal gun does?', a:'It edits which two points in a level are adjacent, so puzzles ask where the two ends must sit rather than whether the player survives what stands in the way.', ideas:['It edits which two points in a level are adjacent', 'puzzles ask where the two ends must sit rather than whether the player survives what stands in the way'] }
        ],
        build:'Connect two systems in your game that share no arrow, prototype the link, and write down the strategy that surprised you.',
        skip:['Can you point to a system in your game that cannot affect any other?','Can you say whether a strategy players found was one to celebrate, tune or remove?','Have you already watched players do something with your rules that you did not plan?']
      } },
    { id:'s5', t:'Stakes, rhythm and other people', level:'advanced',
      goal:'Shape the rise and fall of stakes over a session, and design what your players do for, against and with each other.', hours:3.5,
      steps:[
        { kind:'topic', ref:'tension-release', why:'Emotion is a rhythm, and flat tension is boredom while constant tension is exhaustion.', do:'Draw the intended intensity curve for one session of a game you know, marking peaks, valleys and what causes each.', min:20 },
        { kind:'game', ref:'dark-souls', lens:'gameplay', why:'Dark Souls makes the bonfire the price of every resource, so each fork is weighed as a budget and finding a bonfire is a release.', do:'Read its gameplay lens and write what a bonfire refills and what it resets, then mark where the tension rises and falls on your curve.', min:25 },
        { kind:'game', ref:'age-of-empires-ii', lens:'gameplay', why:'Advancing an Age in Age of Empires II is paid up front and stops villager training, so it opens a window of risk the player chooses.', do:'Read its gameplay lens and write what an Age advance costs and what a rival can do while it runs.', min:25 },
        { kind:'topic', ref:'social-experience', why:'Who a player matters to changes how long a game lives, and the topic asks what the social act inside the game is.', do:'Name the social act your game supports (compete, cooperate, show, share, teach or be seen) and what it makes visible.', min:20 },
        { kind:'topic', ref:'multiplayer-design', why:'Other players are the content: roles, counterplay and matching decide whether a shared game is fair before any server exists.', do:'Read the topic, then write the roles, one counter for each strong move and a matching rule for a 4v4 game, and simulate ten queue rounds on paper or in a spreadsheet to see how lopsided they get.', min:45 },
        { kind:'game', ref:'among-us', lens:'gameplay', why:'Among Us turns busywork into evidence, so completing a chore is also how a player is believed.', do:'Read its gameplay lens and write how a witnessed task clears a player and how a common task lets a claim be checked.', min:25 },
        { kind:'game', ref:'dota-2', lens:'gameplay', why:'Dota 2 gives the same creep two opposite actions, last-hit and deny, so farming becomes open conflict between players.', do:'Read its gameplay lens and write what each action gives its player and what a lane opponent who only does one still loses.', min:25 },
        { kind:'checklist', ref:'design-review', why:'A rhythm and a social act are still features, and they need the same review as any other.', do:'Run the design review checklist against the intensity curve or social act you designed, and note its weakest answer.', min:30 }
      ],
      review:['fun-dimensions','agency-and-emergence'],
      check:{
        recall:[
          { q:'What are the failures of flat and constant tension?', a:'Flat tension is boredom and constant tension is exhaustion; release is what makes the next tension legible and lets a peak be felt.', ideas:['Flat tension is boredom and constant tension is exhaustion', 'release is what makes the next tension legible and lets a peak be felt'] },
          { q:'How can busywork become evidence, as tasks do in Among Us?', a:'Most tasks are meaningless chores, but some animate for anyone nearby and Impostors cannot do tasks, so one witnessed animation clears a player; common tasks let a claimed route be checked.', ideas:['Most tasks are meaningless chores, but some animate for anyone nearby', 'Impostors cannot do tasks, so one witnessed animation clears a player', 'common tasks let a claimed route be checked'] },
          { q:'How can two opposite actions on the same unit turn farming into open conflict, as last-hitting and denying do in Dota 2?', a:'Last-hitting takes the gold from a creep for yourself and denying takes experience away from the enemy, so two opposite actions on the same creep make farming into conflict.', ideas:['Last-hitting takes the gold from a creep for yourself', 'denying takes experience away from the enemy', 'two opposite actions on the same creep make farming into conflict'] },
          { q:'How does a paid, chosen window of risk work, as an Age advance does in Age of Empires II?', a:'A lump sum paid when it is queued, which empties the stockpile, and Town Centre time in which no villagers are trained, so a rival can raid while resources are sunk.', ideas:['A lump sum paid when it is queued, which empties the stockpile', 'Town Centre time in which no villagers are trained', 'a rival can raid while resources are sunk'] }
        ],
        build:'Design one rhythm beat and one social act for your game: the intensity curve of a session, and what players do for, against or with each other, then run the design review checklist on both.',
        skip:['Can you draw the tension curve of a typical session of your game?','Can you name the social act your game supports and what it makes visible?','Have you watched a group play and seen where the falling-behind player ends up?']
      } }
  ]
});

PATH('idea-to-prototype-30-days', {
  t:'Idea to prototype in 30 days', tag:'A deliberately short path: one idea, one loop, one honest test.',
  pick:'Go from an idea to a tested prototype in 30 days',
  track:'design', level:'beginner', hours:14,
  audience:'Solo or small-team builders who want a fast, motivating first win instead of a long syllabus.',
  outcome:'You end with a shaped idea, a tested core loop, a real hypothesis and playtest behind it, and a scoped 30-day plan you can run.',
  prereq:[], next:['game-designer-foundations','casual-game-people-keep'],
  stages:[
    { id:'s1', t:'Find and shape an idea', level:'beginner',
      goal:'Go from a vague itch to one idea you can defend in a paragraph, using real games as evidence.', hours:3,
      steps:[
        { kind:'topic', ref:'finding-an-idea', why:'An idea shaped against the market beats an idea invented in a vacuum, and this is the cheapest research you will ever do.', do:'Name three existing games closest to your itch, and write one sentence each on what they do well and one thing every one of them gets wrong. No game yet? Use a practice game for every task in this path: a one-button game where you jump over obstacles that come faster and faster.', min:30 },
        { kind:'tool', ref:'dissect', why:'Dissecting a reference game turns liking it into specific, stealable structure.', do:'Pick two of the three games from the last step and dissect each one, focused on the piece you want to borrow.', min:40 },
        { kind:'game', ref:'mega-man', why:'Mega Man kept one system, bosses whose weapons beat each other in an order the player picks, across eleven main entries while its hardware, art style and even the people in charge changed.', do:'Read its constant and changed text, then write one sentence naming the single system your own idea must never change, and one surface choice that is free to vary.', min:25 },
        { kind:'game', ref:'rocket-league', lens:'lineage', why:'Rocket League is an idea that failed once and was worth rebuilding: Psyonix diagnosed why its 2008 predecessor underperformed and built the sequel around fixing each cause.', do:'Read its lineage lens, then take the closest reference that failed or faded in your space and write the causes of its failure, and which one your idea fixes.', min:15 },
        { kind:'tool', ref:'idea', why:'The Idea Shaper forces your idea through the same filter twice, once for you and once against the gap you just found in existing games.', do:'Run your idea through the Idea Shaper and export the one-line pitch it produces.', min:40 },
        { kind:'reflect', why:'Writing the comparison in your own words is what tells you whether the idea earns its place, before you spend a day on it.', do:'Write why your idea beats the two games you dissected, in one paragraph, naming the specific gap it fills.', min:30 }
      ],
      review:[],
      check:{
        recall:[
          { q:'What should you do with a failed predecessor before rebuilding its idea, as Psyonix did for Rocket League?', a:'It diagnosed the specific reasons its 2008 predecessor underperformed and rebuilt the game around fixing each one, rather than abandoning the idea or repeating it unchanged.', ideas:['It diagnosed the specific reasons its 2008 predecessor underperformed', 'rebuilt the game around fixing each one', 'rather than abandoning the idea or repeating it unchanged'] },
          { q:'What does dissecting a reference game give you that just enjoying it does not?', a:'It turns liking a game into specific, stealable structure, the exact mechanism of information, decision, time pressure, consequence and feedback that produces the feeling you admire, rather than a vague impression you cannot act on.', ideas:['It turns liking a game into specific, stealable structure', 'the exact mechanism of information, decision, time pressure, consequence and feedback that produces the feeling you admire'] },
          { q:'What is the one gap your idea is supposed to fill?', a:'It should be an exit reason or an unmet want players state or work around in reviews and forums for close reference games, never a tolerated cost or your own taste, named precisely enough to quote a player’s own words for it.', ideas:['It should be an exit reason or an unmet want players state or work around in reviews and forums for close reference games', 'never a tolerated cost or your own taste', 'named precisely enough to quote a player’s own words for it'] },
          { q:'What would make you conclude your idea does not beat its closest reference?', a:'If you cannot name the specific gap your idea fills that the reference does not, if players of the reference do not recognise the gap when you describe it, or if an incumbent could ship your mechanism without breaking their own model.', ideas:['If you cannot name the specific gap your idea fills that the reference does not', 'if players of the reference do not recognise the gap when you describe it', 'if an incumbent could ship your mechanism without breaking their own model'] }
        ],
        build:'Export the Idea Shaper’s one-line pitch and attach your one-paragraph case for why it beats the two games you dissected.',
        skip:['Can you name why the closest failed game in your space failed?','Can you name the exact gap your idea fills in under one paragraph, right now?','Have you already dissected a close reference game for this exact idea?','Can you state your idea’s one-line pitch without checking your notes?','Do you know the one thing every close reference to your idea gets wrong?']
      } },
    { id:'s2', t:'Core experience and the loop', level:'beginner',
      goal:'Turn the idea into one experience statement and the smallest loop that could test it.', hours:4.5,
      steps:[
        { kind:'topic', ref:'core-experience', why:'The core experience statement is the target every later system exists to serve, and skipping it is how scope creeps in by day three.', do:'Write a one-paragraph core experience statement for your idea, and read it aloud to someone who has not heard the pitch yet.', min:35 },
        { kind:'topic', ref:'feature-vs-experience', why:'“We need crafting” is a feature; the experience it serves is the goal, and a 30-day prototype only has room for the goal.', do:'List the three features you already picture in your idea, rewrite each as the observable player behaviour it is meant to produce, and keep only the one your statement needs.', min:20 },
        { kind:'tool', ref:'canvas', why:'The Core Experience Canvas forces every part of the idea to answer to the same statement in one sitting.', do:'Fill the Core Experience Canvas for your idea end to end, leaving no box blank even if the answer is a guess.', min:40 },
        { kind:'tool', ref:'loop', why:'A loop is the smallest thing you can build and test. Everything else is scope you have not earned yet.', do:'Build the smallest loop that could test your core experience statement, and mark its weakest link before you build anything.', min:40 },
        { kind:'checklist', ref:'pre-prototype', why:'A prototype without a hypothesis, a scope cut and a way to observe it is a demo with extra steps.', do:'Run the pre-prototype checklist against the loop you just built, and fix whatever it fails before day one of the 30 days starts.', min:35 },
        { kind:'engine', ref:'godot', alt:'unity', why:'Choose this one if you can code and want an engine you can carry into a full game.', do:'Choose this step or the GameMaker one, not both. Install Godot 4 (or Unity 6), create a project, read the guide’s architecture stage, and write which node (or GameObject) will hold your loop’s player verb.', min:25 },
        { kind:'engine', ref:'gamemaker', why:'Choose this one if your loop is 2D and you want the shortest road to something playable: a 2D-first engine built on objects, events and rooms.', do:'Choose this step or the Godot and Unity one, not both. Read the guide’s architecture and pipeline stages, then build one room with a player object that moves and a Step event that applies your loop’s consequence, and export it to the web.', min:60 },
        { kind:'game', ref:'valheim', lens:'gameplay', why:'Valheim shows a small team making gather-and-craft serve one clear goal, because each boss drop is the only key to the next material.', do:'Draw Valheim’s loop from gather to boss to unlock, then mark which step your own loop is missing: the thing that turns gathering into a goal.', min:15 }
      ],
      review:['finding-an-idea'],
      check:{
        recall:[
          { q:'What is the difference between a feature and a design goal?', a:'A feature is a proposed solution, like crafting; a design goal is the experience it should create, like meaningful preparation decisions. Starting from the goal leaves room for a smaller solution.' },
          { q:'What does the core experience statement have to survive, going forward?', a:'Every later decision and every discipline’s local optimization: it is the one-sentence target that every system, feature review and scope cut answers to, so it has to survive contact with a real prototype and a real playtest, not just a pitch meeting.' },
          { q:'Why is the smallest loop the right thing to build first?', a:'The loop is the machine the player repeats most, and everything else multiplies it. Testing and fixing a weak loop first is the cheapest way to validate the core experience before investing in progression, content or polish that would only multiply a weakness.' },
          { q:'What does the pre-prototype checklist catch that excitement about the idea does not?', a:'Whether the hypothesis is written in standard form with a kill criterion, whether the scope is cut to the cheapest medium that answers the question, and whether the test is instrumented. Excitement alone tends to skip the kill criterion and let a demo grow instead.' }
        ],
        build:'Export your Core Experience Canvas and your Game Loop Builder diagram with the weak link marked, and note what the pre-prototype checklist caught.',
        skip:['Can you rewrite each feature in your idea as the experience it serves?','Can you say your core experience statement from memory, in one sentence?','Can you name your loop’s weakest link without opening the tool again?','Have you already run a pre-prototype checklist and cut scope because of what it found?','Do you know the smallest version of your idea that would still test the thing you care about?']
      } },
    { id:'s3', t:'Prototype and test', level:'intermediate',
      goal:'Turn the loop into a real hypothesis, and get it in front of a player before you trust your own opinion of it.', hours:3.75,
      steps:[
        { kind:'topic', ref:'hypothesis-driven-design', why:'A hypothesis with a signal and a kill criterion is what turns thinking this works into something you can be wrong about.', do:'Write one hypothesis in the standard form: player, behaviour, reason, signal, kill criterion, based on the loop you just built.', min:25 },
        { kind:'tool', ref:'hypothesis', why:'The Hypothesis Builder keeps the five parts honest and exports the brief that tells you, and anyone helping you build, what you are testing.', do:'Enter the hypothesis for the prototype you are about to build and export the brief, adding the first value you will test on the slider you build next.', min:35 },
        { kind:'topic', ref:'prototyping', tab:'godot', alt:'unity', why:'A hypothesis needs something to test, and a grey-box prototype of your loop is the cheapest thing a stranger can play; without it the playtest below tests nothing.', do:'In the engine you set up in stage two, build the smallest playable version of your loop: grey boxes only, the player verb, the one consequence from your loop, and the number your hypothesis is least sure about as an exported slider. It must be playable for five minutes. In GameMaker, build the same in the room you made.', min:60 },
        { kind:'game', ref:'katamari-damacy', lens:'business', why:'Katamari Damacy began as a prototype built with about ten Namco Digital Hollywood Game Laboratory students, and an internal review of that prototype, not a design document, won it full development.', do:'Read its signature and business lens, then write your own next prototype as a single hypothesis: the one rule you would build first, and the sign that would tell a sceptical reviewer it was worth funding further.', min:15 },
        { kind:'topic', ref:'playtesting', why:'What a player says is useful. What a player does is evidence, and only one of those tests your hypothesis.', do:'Plan a fifteen-minute silent playtest: who you would recruit, what you would watch for, and the one question you ask only after they finish.', min:25 },
        { kind:'checklist', ref:'playtest-prep', why:'A playtest without a plan turns into a demo you narrate, which teaches you nothing you did not already believe.', do:'Run the playtest session preparation checklist for the session you just planned.', min:30 },
        { kind:'reflect', why:'Predicting the result before you run the test is what makes a surprising result count as evidence, and the session is the whole point of the prototype.', do:'Before you run it, write what you predict the tester will do, and ask someone to play today (a message takes five minutes; allow a day for the reply). Then run the fifteen-minute silent playtest on your prototype with one person, say nothing while they play, and write what they did at each moment your signal names next to your prediction.', min:55 }
      ],
      review:['core-experience'],
      check:{
        recall:[
          { q:'What are the five parts a hypothesis needs?', a:'Player, behaviour and reason, in the form “we believe [player] will [behaviour] because [reason]”, plus the observable signal that shows it is true and a kill criterion written before the build.', ideas:['Player, behaviour and reason', 'the observable signal that shows it is true', 'a kill criterion written before the build'] },
          { q:'What is the difference between what a player says and what a player does?', a:'What players say is self-report, useful but unreliable since they report what they think they felt or think you want to hear. What they do is observed behaviour, the actual evidence. Believe the behaviour; treat the words as leads.' },
          { q:'Why does predicting the result beforehand matter?', a:'Writing the prediction before running the test is what lets a surprising result count as real evidence instead of being rationalised afterwards into whatever happened, which prevents you from unconsciously reading confirmation into an ambiguous outcome.' }
        ],
        build:'Attach your Hypothesis Builder brief and playtest prep checklist, the prototype you built, and your notes from the fifteen-minute silent playtest you ran on it: what the tester did at each moment your signal names.',
        skip:['Have you already written a hypothesis with a real kill criterion for this idea?','Can you name the one question you would ask a tester only after they finish playing?','Do you know what result would make you kill this version of the idea?','Have you predicted a playtest result in writing before running the session, and checked yourself against it?']
      } },
    { id:'s4', t:'Scope the 30-day plan', level:'intermediate',
      goal:'Cut your own plan down to what 30 days can hold, and write down the rule that keeps you honest when time runs short.', hours:2.75,
      steps:[
        { kind:'topic', ref:'vertical-slice-mvp', why:'A vertical slice proves the whole loop works end to end at the smallest scope that still tells the truth about the idea.', do:'Cut your 30-day plan down to the smallest vertical slice that would still test your hypothesis, and list what you are deliberately leaving out.', min:35 },
        { kind:'topic', ref:'risk-and-dependencies', why:'The riskiest, least certain part of your plan is the part that should happen first, not last, while you still have time to change course.', do:'List the three riskiest assumptions in your 30-day plan, and reorder your plan so the riskiest one gets tested in week one.', min:25 },
        { kind:'topic', ref:'pm-scoping-cuts', why:'A cut you make on purpose is a design decision, and a cut made on day 25 is damage control, so the order of cuts and the rule that triggers them have to be written while the deadline is far away.', do:'Write your cut list for the 30 days in order, with what each cut costs the player, and one rule that stops you quietly skipping your own kill criterion when day 25 gets tight.', min:30 },
        { kind:'checklist', ref:'scope-sanity', why:'A 30-day plan with no scope check is a wish list with dates on it.', do:'Run the scope sanity checklist against your 30-day plan now, before day one, not after you are already behind.', min:30 },
        { kind:'smell', ref:'scope-outruns-plan', why:'A 30-day plan fails when it is a feature list with dates on it, and this smell names the causes while there is still time to cut.', do:'Check your 30-day plan against each cause the smell lists, and rewrite the week that matches the most of them.', min:20 },
        { kind:'reflect', why:'A plan you have written down in your own words is one you can be held to, including by yourself.', do:'Write your day-by-day 30-day plan in one page: what ships each week, and what you would cut first if you fall behind.', min:30 }
      ],
      review:['hypothesis-driven-design'],
      check:{
        recall:[
          { q:'Why does a forcing function matter more on day 25 than on day one?', a:'The temptation to quietly skip your own kill criterion grows as the deadline nears and sunk cost builds up. A rule written calmly on day one is what stops you rationalising past your own evidence once pressure is high.' },
          { q:'What makes a slice vertical instead of just small?', a:'A vertical slice cuts through every layer, art, feel and systems, to shipping quality in one small section end to end, proving both the experience and the real cost per unit, unlike a small build that stays shallow across every discipline.', ideas:['A vertical slice cuts through every layer, art, feel and systems, to shipping quality in one small section end to end', 'proving both the experience and the real cost per unit', 'unlike a small build that stays shallow across every discipline'] },
          { q:'Why should the riskiest assumption get tested first, not last?', a:'Everything scheduled after an unvalidated assumption is a bet on it being true. Testing the riskiest thing first, while there is still time to change direction, is cheaper than discovering it is false after building everything downstream of it.' }
        ],
        build:'Write the one-page 30-day plan: what ships each week, the riskiest assumption tested first, and the cut list a scope check produced.',
        skip:['Can you name your riskiest assumption and when in your plan it gets tested?','Do you have a written forcing function that would stop you from skipping your own kill criterion?','Can you describe your vertical slice in one sentence without it including something you already agreed to cut?','Have you already run a scope check against a real plan and cut something because of it?']
      } }
  ]
});

PATH('study-the-hits-worlds', {
  t:'Study the hits: worlds, stories and audiences', tag:'How fifteen well-known games build a place, let a story land, look and sound like themselves, and tell an audience who they are for.',
  pick:'Learn how hits build worlds, stories and audiences',
  track:'design', level:'intermediate', hours:14.33,
  audience:'Designers who know the fundamentals and want to see, through fifteen well-known games, how a world, a story and a presentation are built and pitched.',
  outcome:'You can state a premise a system backs up, make a choice leave a mark the player connects to it, place story beats on the play timeline, give sights and sounds a fixed grammar, and say who your game is for and what changes between markets.',
  prereq:['game-designer-foundations'], next:['interview-prep-designer'],
  stages:[
    { id:'s1', t:'A premise the world backs up', level:'intermediate',
      goal:'Write a premise sentence and say which of your world’s rules a system also enforces.', hours:3,
      steps:[
        { kind:'topic', ref:'premise-and-world', why:'A premise gives the stakes and a world gives the systems somewhere to live, and this topic keeps the two apart so each can be tested.', do:'Write the premise sentence for a game you know, with the player’s role and the stakes, then list two world rules that a system also enforces.', min:20 },
        { kind:'topic', ref:'worldbuilding-method', why:'A premise is a sentence; a world is the set of facts that keep it true everywhere the player looks. Invention, completeness and consistency are tests you can run on a design document.', do:'Write five facts about your world that the player will meet in play, then run each through the three tests and name the place, object, interface or rule that carries it to the player.', min:30 },
        { kind:'game', ref:'crosscode', lens:'world', why:'CrossCode builds its world in two layers, an online game with its own towns and players and the real world behind it, and the gap between them is the plot.', do:'Read its world lens, then write one rule of your own world that a frame like this could explain, and what the frame would cost the story.', min:20 },
        { kind:'game', ref:'viewfinder', lens:'world', why:'Viewfinder splits its world into five hubs, four of them built by a named scientist, so moving to the next hub is meeting someone new.', do:'Read its world lens and write how a hub shows whose workspace it is, and what a player who hurries through the puzzles misses.', min:25 },
        { kind:'game', ref:'subnautica', lens:'world', why:'Subnautica runs several unrelated groups’ histories across one hand-built map, so the world is one place with many pasts.', do:'Read its world lens and list the groups that leave remains on the map, then write what nothing in the game makes the player read in order.', min:25 },
        { kind:'game', ref:'baldurs-gate-3', lens:'world', why:'Baldur’s Gate 3 borrows a published tabletop setting whole, which shows what a world costs when it is borrowed rather than built.', do:'Read its world lens and write what a player who knows the lore gets, what a new player is given, and what the writers cannot change.', min:20 },
        { kind:'tool', ref:'canvas', why:'A premise sentence stays a slogan until the fantasy and what the game is not are written beside it.', do:'Fill in the Core Experience Canvas for your game and check that its fantasy line agrees with the premise sentence you wrote.', min:25 },
        { kind:'reflect', why:'Three worlds built from people, from one shared map and from a borrowed setting are easier to compare once your own is written down.', do:'Write whether your world is built, borrowed or bought in part, and name one piece of its lore that no system or decision touches.', min:15 }
      ],
      review:[],
      check:{
        recall:[
          { q:'How does a hub structure shape what a player takes from a world, as Viewfinder’s five hubs do?', a:'Into five hubs: the first four belong to the simulation’s researchers, Aharon, Hiraya, Chi Leung and Mirren, each themed to its owner, and the fifth holds the finale. Their quirks show through Post-it notes and journals, which is easy to miss.' },
          { q:'How can one fixed map hold several stories, as Subnautica’s does?', a:'The Aurora’s crew, the Sunbeam, the Degasi and the Precursors all leave physical remains on the same fixed map, and the player reconstructs each fate independently, in whatever order their descent takes them.' },
          { q:'What does borrowing an existing setting gain and cost, as Baldur’s Gate 3 shows?', a:'It gains a setting that feels complete at once to anyone who knows Dungeons & Dragons; it gives up freedom to retire or contradict factions, gods or endings, because the canon belongs to a licensor, Wizards of the Coast.', ideas:['It gains a setting that feels complete at once to anyone who knows Dungeons & Dragons', 'it gives up freedom to retire or contradict factions, gods or endings', 'the canon belongs to a licensor, Wizards of the Coast'] }
        ],
        build:'Write the premise sentence for your game, list three world rules with the system that enforces each, and cut or mark optional any lore no system or decision touches.',
        skip:['Can you say your game’s premise in one sentence to someone who has not seen it?','Can you name the system behind each of your world’s rules?','Is there lore in your game that nothing the player does can reach?']
      } },
    { id:'s2', t:'Choices that leave a mark', level:'intermediate',
      goal:'Say what the player sees change after a choice, and how a game earns a story that nobody wrote in advance.', hours:2.75,
      steps:[
        { kind:'topic', ref:'narrative-agency', why:'Agency in story is perceived consequence, so the question is what the player sees change and whether they connect it to their choice.', do:'List three choices in a game you know, with the consequence, when it is seen and how the player connects it to the cause.', min:20 },
        { kind:'game', ref:'fallout-new-vegas', lens:'lore', why:'New Vegas lets Caesar argue his own case in person, so choosing who rules the Mojave is a judgement and not a scoreboard.', do:'Read its lore lens and write the argument Caesar makes, who argues back, and what the schedule cost the Legion’s content.', min:25 },
        { kind:'game', ref:'gta-v', lens:'lore', why:'Grand Theft Auto V condemns chasing money in its story and pays the player cash for it in play, so the story and the reward loop disagree.', do:'Read its lore lens and write what the plot says about wealth, what every heist pays, and why some reviewers read the gap as emptiness.', min:25 },
        { kind:'game', ref:'the-sims', lens:'lore', why:'The Sims writes no plot at all, so a household’s story is only what its aspirations and its memory log leave behind.', do:'Read its lore lens and write what a Sim rolls or logs that a story can be told from, and what the game has in reserve when a stretch is dull.', min:20 },
        { kind:'game', ref:'crusader-kings-iii', lens:'lore', why:'Crusader Kings III makes acting against a ruler’s nature cost stress, so the player’s choices produce a story of breakdowns and compromises.', do:'Read its lore lens and write one act that would stress a chaste ruler, what follows, and what it costs to play against type.', min:25 },
        { kind:'engine', ref:'renpy', why:'Ren’Py is a script-only engine for story-first games, and a menu that sets a flag is the smallest working form of a choice that leaves a mark.', do:'Read the guide’s architecture and ai stages, then write one scene with a menu and two labels, where the choice sets a flag that changes a later line, and run Lint on it.', min:20 },
        { kind:'tool', ref:'hypothesis', why:'A consequence only counts if players connect it to its cause, and that can be tested.', do:'Write a playtest hypothesis for one choice in your game: what changes, when the player sees it, and what recalling the cause would sound like.', min:25 }
      ],
      review:['premise-and-world'],
      check:{
        recall:[
          { q:'Why is choosing a faction in New Vegas a judgement?', a:'Caesar voices a coherent argument for order, and companions such as Boone argue back from lived experience, so the player weighs a case against testimony instead of picking the winner of a scoreboard.', ideas:['Caesar voices a coherent argument for order', 'companions such as Boone argue back from lived experience', 'the player weighs a case against testimony instead of picking the winner of a scoreboard'] },
          { q:'What gap can open between a story’s message and its mechanics, as some reviewers see in Grand Theft Auto V?', a:'The plot frames the pursuit of wealth as corrosive, yet every heist pays the player in cash and nothing docks a character for succeeding at crime, so some read emptiness rather than critique.', ideas:['The plot frames the pursuit of wealth as corrosive', 'every heist pays the player in cash and nothing docks a character for succeeding at crime', 'some read emptiness rather than critique'] },
          { q:'Where can a game’s stories come from when no plot is authored, as in The Sims and Crusader Kings III?', a:'In The Sims from aspirations and a memory log with no authored plot, so a dull stretch has nothing scripted in reserve; in Crusader Kings III from stress gained by acting against a ruler’s personality.', ideas:['In The Sims from aspirations and a memory log with no authored plot', 'a dull stretch has nothing scripted in reserve', 'in Crusader Kings III from stress gained by acting against a ruler’s personality'] }
        ],
        build:'Take three choices in your game and write each one’s consequence, when the player sees it and what shows the link to its cause, then replace one invisible branch with a visible acknowledgment.',
        skip:['Can you name a consequence in your game that a player can trace back to their choice?','Can you say which of your branches a player would never notice?','Does your reward loop agree with what your story says?']
      } },
    { id:'s3', t:'When the story arrives', level:'intermediate',
      goal:'Put story beats and play beats on one timeline, and pick where a reveal lands.', hours:2.25,
      steps:[
        { kind:'topic', ref:'narrative-pacing', why:'Story beats are pacing beats, so they belong on the same timeline as the play curve and not in a separate document.', do:'Draw the beats of a game you know on one timeline, story and play together, and mark the longest stretch with no play.', min:20 },
        { kind:'game', ref:'chrono-trigger', lens:'lore', why:'Chrono Trigger lets the player walk back to a familiar place and find the change already there, so the story lands as a discovery and not a speech.', do:'Read its lore lens and write one place you revisit across eras and what the player notices before any character says it.', min:25 },
        { kind:'game', ref:'final-fantasy-xii', lens:'lore', why:'Final Fantasy XII sends the player after nethicite for the whole game and makes the turning point giving it up.', do:'Read its lore lens and write what the player expects the last fight to use, what Ashe does instead, and how the hours of chasing shards read afterwards.', min:25 },
        { kind:'game', ref:'witcher-3', lens:'lore', why:'The Witcher 3 gives a side quest the craft of its main plot, so a quiet quest is not a rest from the story.', do:'Read its lore lens and write what Family Matters turns into and why a player stops skipping notice-board contracts.', min:25 },
        { kind:'tool', ref:'loop', why:'Story is the best rest-beat content, and the loop shows where a beat would land in play.', do:'Build your core loop in the Game Loop Builder and mark the step where a story beat can arrive as the answer to a question the play raised.', min:25 },
        { kind:'reflect', why:'Chrono Trigger reveals by consequence, Final Fantasy XII by reversal and The Witcher 3 by its side content, and your own timing needs a choice too.', do:'Write the one story beat in your game you would move later, and the play that should come before it.', min:15 }
      ],
      review:['premise-and-world','narrative-agency'],
      check:{
        recall:[
          { q:'How can a game show that the past has changed without saying so, as Chrono Trigger does?', a:'It rarely says so: the player revisits a familiar place across eras and finds the change already there, and the payoff is noticing it before any character comments.', ideas:['It rarely says so', 'the player revisits a familiar place across eras and finds the change already there', 'the payoff is noticing it before any character comments'] },
          { q:'What does a plot’s turning point do, using Final Fantasy XII’s as the example?', a:'Ashe rejects the Occuria’s revenge plan and has the Sun-cryst destroyed rather than use nethicite, which recasts the hunt for shards as a story about restraint.', ideas:['Ashe rejects the Occuria’s revenge plan', 'has the Sun-cryst destroyed rather than use nethicite', 'which recasts the hunt for shards as a story about restraint'] },
          { q:'What does the Bloody Baron questline show about side content?', a:'That a side quest can carry main-plot craft: Family Matters becomes a story about the Baron’s drinking and violence towards his family, so players stop treating contracts as a lesser tier.' },
          { q:'Where does the topic put exposition?', a:'After the first meaningful play, delivered as answers to questions the play raised, with the longest cutscenes converted to in-play delivery where possible.', ideas:['After the first meaningful play, delivered as answers to questions the play raised', 'with the longest cutscenes converted to in-play delivery where possible'] }
        ],
        build:'Put your game’s story beats and its intensity beats on one timeline, move one exposition scene after the first meaningful play, and convert the longest cutscene to in-play delivery if you can.',
        skip:['Can you see your story beats and play beats on one timeline?','Can you find the longest stretch of your game with no play in it?','Is there a reveal in your game that the player could notice before anyone says it?']
      } },
    { id:'s4', t:'What the eye and ear are told', level:'intermediate',
      goal:'Give the important things in your game one look and one sound each, and keep them consistent.', hours:3.83,
      steps:[
        { kind:'topic', ref:'visual-language', why:'Players read the world before the HUD, so a consistent visual grammar teaches by seeing.', do:'List five meanings the player must read in a game you know, and the shape, colour or motion that signals each.', min:20 },
        { kind:'topic', ref:'pixel-art-direction', why:'Pixel art is a visual language with hard limits, and those limits are a style choice and a scope tool at once: they decide how much art the team can make and keep consistent.', do:'Write the three limits of a pixel-art game you admire (base resolution, grid, palette size), then the same three for your own game and the art they save or cost.', min:30 },
        { kind:'game', ref:'elden-ring', lens:'art', why:'Elden Ring gives grace one colour, gold, so a player learns to follow a glow before reading what it does.', do:'Read its art lens and write the gold things it names, and what a player who has never seen the Guidance of Grace does with it.', min:25 },
        { kind:'topic', ref:'audio-and-music', why:'Sound reaches the player while their eyes are busy, and music sets the felt intensity without changing a rule.', do:'List a game’s critical signals and give each a sound and a visual backup, then map its music states to its intensity curve.', min:20 },
        { kind:'topic', ref:'audio-implementation', tab:'godot', alt:'unity', why:'Choosing what should be heard is one job; making it play, mix and duck within a voice budget on real hardware is another, and speech buried by music fails at the second.', do:'Read the Godot tab (this step needs Godot 4 or Unity 6 installed; if you have neither, the engine guides cover setup, so allow extra time), then build Music, SFX and Voice buses, duck Music by 12 dB while Voice plays, wire a settings slider to the Music bus, and count the voices in your loudest scene. In Unity, use an AudioMixer with an exposed MusicVol.', min:45 },
        { kind:'game', ref:'animal-crossing-nh', lens:'sound', why:'New Horizons scores every hour of the real day differently, so the music tells the time with no HUD element.', do:'Read its sound lens and write what the hourly score tells a player, and what the season and weather variations add.', min:25 },
        { kind:'game', ref:'euro-truck-simulator-2', lens:'sound', why:'Euro Truck Simulator 2 hands its mood to live internet radio, which shows what a team gains and gives up when it does not score the drive.', do:'Read its sound lens and write what the player controls through the radio and what the designers give up against a fixed score.', min:20 },
        { kind:'checklist', ref:'playtest-prep', why:'A visual grammar and a sound plan are claims about what players notice, and a session is how you find out.', do:'Run the checklist for a session with one written question: whether new players read your danger signal and your key sounds, and note what you expect to watch for. Then book one person (a message takes five minutes) and run a 15-minute session, watching which signals they miss.', min:45 }
      ],
      review:['narrative-pacing'],
      check:{
        recall:[
          { q:'How can a consistent visual cue teach trust, as the gold of grace does in Elden Ring?', a:'It shares the warm gold of the Sites of Grace and the Erdtree, so a player follows the glow on sight, before reading the optional tip that explains it.', ideas:['It shares the warm gold of the Sites of Grace and the Erdtree', 'a player follows the glow on sight, before reading the optional tip that explains it'] },
          { q:'What does New Horizons’ hourly score do?', a:'A distinct piece plays for each hour of the real day, with variations for season and weather, so an experienced player can tell roughly what time it is by music alone.', ideas:['A distinct piece plays for each hour of the real day', 'with variations for season and weather', 'an experienced player can tell roughly what time it is by music alone'] },
          { q:'What trade does a game make when it hands its mood to outside audio, as Euro Truck Simulator 2 does?', a:'It streams real internet stations and the player’s own files, giving up control of the mood in exchange for a soundtrack that is free and always changing.', ideas:['It streams real internet stations', 'giving up control of the mood in exchange for a soundtrack that is free and always changing'] }
        ],
        build:'List the meanings and critical signals in your game, give each a look and a sound with a backup in the other channel, then watch one session to see which the players missed.',
        skip:['Can you list what a player must read in your game and its signal for each?','Does the same signal ever mean two things in your game?','Have you played your game muted and with the screen squinted?']
      } },
    { id:'s5', t:'Who it is for, and where', level:'advanced',
      goal:'Write the sentence that tells a stranger who your game is for, and list what changes when it crosses a market.', hours:2.5,
      steps:[
        { kind:'topic', ref:'audience-and-positioning', why:'A finished game nobody can describe is a game nobody recommends, so the promise has to be said for someone who has not played.', do:'Write your positioning sentence, then send it to three strangers first (replies take a day) and ask what game it describes; write what they expected.', min:35 },
        { kind:'game', ref:'ea-sports-fc', lens:'world', why:'FIFA builds its world by licensing the real one, and the fictional names Pro Evolution Soccer needed show what an unlicensed football game costs its player.', do:'Read its world lens and write what a licensed name saves a player compared with “Man Red”, and what licence FIFA 19 added.', min:25 },
        { kind:'game', ref:'clair-obscur', lens:'art', why:'Expedition 33 chose a Belle Époque France over a familiar Victorian steampunk so its look would be identifiably its makers’.', do:'Read its art lens and write what the team rejected and chose, and what players read before any exposition.', min:25 },
        { kind:'topic', ref:'localization-and-culture', why:'Text, layout and meaning change between languages and markets, and adapting a game removes things as well as smoothing them.', do:'List the strings, images and icons in your game that would break or change meaning in another market, and one thing adapting them would remove.', min:20 },
        { kind:'tool', ref:'dissect', why:'A differentiator is only real against the games it is compared to.', do:'Run your game through the Reference Dissection against two games players would compare it to, and note the difference you could show in ten seconds.', min:25 },
        { kind:'reflect', why:'A licence and a national look are both ways to say who a game is for, and your own way needs writing down.', do:'Write one thing in your game that says who it is for in the first ten minutes, and one thing that would need to change for another market.', min:15 }
      ],
      review:['visual-language','narrative-pacing'],
      check:{
        recall:[
          { q:'What does FIFA’s licensed world buy over Pro Evolution Soccer’s?', a:'A player does not have to decode fictional stand-ins such as “Man Red” or “West London Blue” back to real clubs, and FIFA added the Champions League and Europa League licences in FIFA 19 once Konami’s UEFA deal expired.', ideas:['A player does not have to decode fictional stand-ins such as', 'FIFA added the Champions League and Europa League licences in FIFA 19 once Konami’s UEFA deal expired'] },
          { q:'Why choose a setting tied to the team’s own culture, as Clair Obscur did with Belle Époque France?', a:'The team weighed a Steampunk Victorian England and chose a look tied to Sandfall’s French origin, so players read Lumière as a particular place before exposition and feel the impossible geometry as a break from it.', ideas:['The team weighed a Steampunk Victorian England and chose a look tied to Sandfall’s French origin', 'so players read Lumière as a particular place before exposition', 'feel the impossible geometry as a break from it'] },
          { q:'What does the localization topic ask you to budget for?', a:'Externalised strings, text expansion in the longest language, translator context, locale-aware formats and early platform and rating checks, and to weigh what an adaptation removes as well as what it smooths.', ideas:['Externalised strings, text expansion in the longest language, translator context, locale-aware formats and early platform and rating checks', 'to weigh what an adaptation removes as well as what it smooths'] }
        ],
        build:'Write your game’s positioning sentence and test it on three strangers, then list what would change for a second market: strings, images, icons and any rating or platform requirement.',
        skip:['Can you say who your game is for in one sentence?','Is your differentiator visible in the first ten minutes and in one screenshot?','Can you list the text baked into your images or voice?']
      } }
  ]
});

PATH('senior-game-designer', {
  t:'Senior game designer', tag:'Own the vision, the numbers, the live calendar and the team’s designs, and make the case for all of it.',
  pick:'Own the vision, the numbers and the team’s designs',
  track:'design', level:'advanced', hours:23.42,
  audience:'Working designers with a few shipped features or a shipped game, who own a feature and its outcome and now have to own a pillar set, an economy, a season or other designers’ work.',
  outcome:'You can write pillars a team decides by, model and tune an economy, plan a live season with pre-registered metrics and guardrails, run a design review that keeps the owner in charge, and pitch the result with a cut list behind it.',
  prereq:[], prereqAny:['systems-designer','level-and-ux-designer','casual-game-people-keep','games-that-broke-the-mould'], next:['technical-lead','studio-practice-ai-era','interview-prep-designer'],
  stages:[
    { id:'s1', t:'Vision', level:'advanced',
      goal:'Turn a game’s intent into pillars that settle real arguments, and defend or change them on purpose.', hours:4,
      steps:[
        { kind:'topic', ref:'design-pillars', why:'At this level the pillars are a team’s decision tool, so they need forbidden things, a rank for the pairs that collide, an owner and a written change rule.', do:'Take a game you know well and write three pillars, what each forbids, the tie-break for the pair most likely to collide, and who may change them and on what evidence.', min:40 },
        { kind:'topic', ref:'core-experience', why:'Pillars are the core experience turned into decisions, so a vague experience gives vague pillars.', do:'Audit the core experience of a shipped game (or your own live game) against its pillars: write where the pillars serve it and where they do not, and what you would change and why.', min:30 },
        { kind:'tool', ref:'canvas', why:'One page that holds player, fantasy, emotions and what the game is not gives reviewers something to hold a feature against.', do:'Fill in the Core Experience Canvas for the same game and check that its “what it is not” box matches your pillars’ forbidden lists.', min:30 },
        { kind:'game', ref:'hades', lens:'gameplay', why:'The lens shows one rule held on purpose: boons are a small, legible choice at a door, never a random pickup mid-fight, and that shows what a built pillar forbids and costs.', do:'Read the gameplay lens and write the rule Hades holds (what it forbids), the player experience that rule protects, and the cost the lens names for it. Then phrase the rule as a pillar with its forbidden thing.', min:25 },
        { kind:'topic', ref:'audience-and-positioning', why:'A pillar set has to survive contact with a market, and the positioning sentence is where pillars meet the audience.', do:'Audit the positioning of a shipped game (or your own live game) against its pillars: does the store promise match what the pillars deliver, who does it exclude, and what would you change and why?', min:30 },
        { kind:'smell', ref:'pillars-are-slogans', why:'The most common failure is a pillar that sounds good and cannot decide anything, and this smell is the test.', do:'Run the smell on your three pillars, then take five decisions the team is debating and mark which pillars settle them. Rewrite any pillar that settles none.', min:25 },
        { kind:'game', ref:'celeste', lens:'gameplay', why:'A second game read for the same question, what rule does it hold on purpose, keeps the first one from looking like a special case.', do:'Read the gameplay lens and list three of the grace windows Celeste builds in, the difficulty style it refuses by doing so, and the pillar you infer they protect.', min:20 },
        { kind:'reflect', why:'The hardest part of owning a vision is the moment someone senior asks for something that breaks it.', do:'Write the reply you would give a publisher or a lead who asks for a feature that breaks your top pillar: what it costs in the pillar’s terms and an alternative that meets their need.', min:40 }
      ],
      review:[],
      check:{
        recall:[
          { q:'What makes a pillar more than a slogan?', a:'It forbids something and can settle a real, debated decision. A pillar with no cost, or one that settles none of five live arguments, is decoration and must be rewritten.' },
          { q:'Why write a tie-break and a change rule for the pillar set?', a:'Pillars collide and drift. A rank or tie-break decides the collision before a deadline does, and an owner plus an evidence rule for change, with each change logged, makes a change a decision instead of drift.' },
          { q:'How do you know the pillars are being used rather than owned by one person?', a:'A team member can cite one to reject a feature, including against the owner, and a new joiner can say them and what each forbids. Silent exceptions mean they are eroding. No study shows pillars improve outcomes, so the tests are the evidence.' }
        ],
        build:'Write a vision doc for a shipped game: three pillars with what each forbids, non-goals, the tie-break for the colliding pair, the change rule, and five debated decisions resolved by the pillars alone.',
        skip:['Can you give the tie-break between your two most likely colliding pillars?','Did your last pillar set settle at least five real debates in writing?','Could a new joiner name each pillar and what it forbids?','Do you know who may change a pillar and what evidence they need?']
      } },
    { id:'s2', t:'Economies', level:'advanced',
      goal:'Model an economy as numbers you can run, find its hole before players do, and check the model against what they did.', hours:5.75,
      steps:[
        { kind:'topic', ref:'economy-and-resources', why:'The parts come first: sources, sinks, converters and what each does to pacing.', do:'List every resource in a game you know with its sources and sinks, and mark which resource piles up first.', min:40 },
        { kind:'topic', ref:'economy-modelling-and-balance', why:'This is the method: an anchor, rates per archetype, sweeps and a check against logs, so design and monetisation can argue about numbers.', do:'Build your economy in a spreadsheet with a balance anchor and three archetypes, sweep each input by 10 percent, and mark any where time-to-target moves by more than 30 percent as fragile.', min:60 },
        { kind:'topic', ref:'balance-methods', why:'An economy prices currencies; balance prices the options themselves, and the two meet in what an item costs. A senior designer owns both, and decides when the data overrules the curve.', do:'Write how your team decides a balance change: what balanced means for your game in three sentences, the target skill tier, the data and sample size that justify a change, and the size of the step you take.', min:45 },
        { kind:'topic', ref:'progression', why:'Progression is paid for through the economy, and its pacing is the archetype’s time-to-target.', do:'Write the hours each archetype needs to reach your anchor item, and say which one your progression is really built for.', min:35 },
                { kind:'tool', ref:'sysmap', why:'Two economies that touch each other are where the hidden loops live, and the map asks the collision questions.', do:'Map your resources as nodes with typed edges and answer the collision questions the tool generates for the loop that inflates.', min:35 },
        { kind:'game', ref:'cookie-clicker', lens:'gameplay', why:'An economy stripped to one price rule shows what a single growth curve does on its own, before any anchor is added.', do:'Read the gameplay lens, write its price rule as a formula, then compute the price of the 1st, 10th and 50th copy of a 100-cookie building and say what that does to the value of buying more of it.', min:30 },
        { kind:'game', ref:'hearthstone', lens:'business', why:'A converter with a fixed loss shows an economy model meeting the business: the loss is what keeps pack sales necessary.', do:'Read the business lens and write what a free player and a spender each get from dust, and what the lossy conversion (a fixed loss of three-quarters or more) does for pack sales.', min:40 },
        { kind:'reflect', why:'A model is a hypothesis, and writing the failure it exposed is what proves you ran it. Moving it to a script with a fixed seed is what lets others rerun it.', do:'Port your model to a small script with a fixed random seed and make one flat reward a drop rate, then rerun the three archetypes. Write the hole your model found, the input change that fixed it, and what real log you would compare it with at day seven.', min:60 }
      ],
      review:['design-pillars'],
      check:{
        recall:[
          { q:'What is a balance anchor and why use one?', a:'A single fixed number, such as hours of play to earn a standard item, against which every price and reward is expressed. Without it each price is a separate opinion and the catalogue drifts into contradictions.' },
          { q:'Why simulate archetypes rather than the average player?', a:'The average earns at a speed nobody plays at. Casual and heavy players can differ by an order of magnitude in time-to-target, and only separate archetypes show who hits a wall or a surplus.' },
          { q:'What should you do when a model and the live logs disagree?', a:'Treat the model as a hypothesis. Find the first week they part, reconcile the totals from separate data sources before trusting either, then fix the model, and change the game only after that.' },
          { q:'What does an input sweep tell you?', a:'Which numbers are levers and which are safe. If a 10 percent change in one source moves time-to-target by more than about 30 percent (this site’s rule of thumb), the economy is fragile there and needs a stabilising sink.' }
        ],
        build:'Build a balanced economy in a spreadsheet, port it to a small script with three archetypes and a fixed seed, and write up the failure it exposed and the change that fixed it.',
        skip:['Can you state your economy’s anchor in one sentence and read any price against it?','Have you run at least three archetypes, not just an average?','Have you swept each input and named the fragile ones?','Can you say how you would compare the model with real balances at day seven?','Have you reconciled flow totals from two data sources before?']
      } },
    { id:'s3', t:'Live', level:'advanced',
      goal:'Plan a season from cohorts, pre-registered metrics and guardrails, and know which questions data cannot answer.', hours:5.17,
      steps:[
        { kind:'topic', ref:'live-design-seasons-and-data', why:'Live design is a judgement about which cohort to trust and when a test result is real, and the topic gives the checks that stop a result being chosen afterwards.', do:'Take a season plan and write its goal as one question, two guardrails, the smallest effect worth shipping, the sample size and the end date, before you look at any data.', min:60 },
        { kind:'topic', ref:'metrics-and-success', why:'A season goal is only as good as the metric definitions under it.', do:'Define the goal metric and both guardrails precisely: population, window and what counts as an event.', min:35 },
        { kind:'topic', ref:'live-operations', why:'The 90-day plan and the calendar set how much a season can hold with slack.', do:'Set the season length from your last three releases and mark the release you would have missed.', min:45 },
        { kind:'topic', ref:'power-creep-and-content-growth', why:'A live game sells new content, and content that must be stronger to sell is how power creep starts. The decision belongs in the live plan, not in a later rebalance.', do:'Write the power budget and the rotation, if any, for your next year of releases, and the measurement that would show creep has started: how often older content is picked against newer.', min:40 },
        { kind:'game', ref:'candy-crush-saga', lens:'business', why:'A game whose revenue sits on one moment of failure shows why a goal metric needs guardrails set against each other: easier levels convert less, and retention is the counterweight.', do:'Read the business lens and name the moment it turns into a purchase, then write the goal metric and the retention guardrail you would set for a season that makes levels easier.', min:25 },
        { kind:'topic', ref:'monetisation-design', why:'A season plan has to say what it sells, and monetisation is where a metric can start eating the fun.', do:'List what your season sells and mark any offer that depends on a few heavy spenders.', min:30 },
        { kind:'topic', ref:'ethics-and-responsibility', why:'Guardrails are ethical as well as commercial, and a senior designer should hand the decision record to a lawyer or a journalist without embarrassment.', do:'Write a decision record for one monetisation choice in the season: the pattern, who approved it, the guardrail and the date to revisit.', min:45 },
        { kind:'game', ref:'fortnite', lens:'business', why:'A game that pays creators from an engagement pool shows what a season metric rewards, and what it does not.', do:'Read the business lens and write what the engagement pool pays for, what it does not, and which guardrail metric would show a shallow, endlessly replayed island beating a deeper one.', min:30 }
      ],
      review:['economy-modelling-and-balance'],
      check:{
        recall:[
          { q:'Why pre-register the metric, the guardrails and the end date?', a:'Writing the goal metric, two guardrails, the smallest effect worth shipping, the sample size and the end date before the data arrives stops a result from being chosen afterwards, and stops peeking from inflating false positives.', ideas:['Writing the goal metric, two guardrails, the smallest effect worth shipping, the sample size and the end date before the data arrives stops a result from being chosen afterwards', 'stops peeking from inflating false positives'] },
          { q:'What does a split check do, and when do you run it?', a:'It counts players per arm and tests the counts against the planned ratio before any result is read. A failure means the split was not random, so you find the cause before reading the result. About 6 percent of Microsoft experiments failed it.' },
          { q:'What can data not decide in a live game?', a:'What the game should be, which players you want, and whether a profitable pattern is one you are willing to run. Guardrails and a named owner of player-facing risk cover those, not a metric.' },
          { q:'How do you keep novelty from fooling you after shipping a winner?', a:'Keep a small long-term holdout and compare it later, split by how long players had played. If the lift fades it was partly novelty. That is Runge’s advice, and no published decay rate exists.' }
        ],
        build:'From a data sheet of cohort retention and revenue (your own game’s, or six cohorts of invented numbers that you label as invented), write a one-season plan: the goal question, two guardrails, the pre-registered test design, the content list with cadence, and one thing you would refuse to run even if it lifted revenue.',
        skip:['Do you write the metric, guardrails and stopping rule down before a test starts?','Have you checked a split for a sample ratio mismatch?','Do you read cohorts by install week rather than one blended average?','Do you keep a holdout after shipping a winner?','Can you name a monetisation pattern you would refuse to run?']
      } },
    { id:'s4', t:'Reviewing and growing designers', level:'advanced',
      goal:'Review a design against its intent and give feedback that keeps the owner in charge and helps the designer improve.', hours:4,
      steps:[
        { kind:'topic', ref:'design-critique-and-feedback', why:'A review without a stated intent is an argument about taste, and feedback aimed at the person can lower performance instead of raising it.', do:'Write your notes on a design in three columns, what I saw, what it means and what I would try, keep every note about the work, then rewrite any note that describes the person or is generic praise.', min:60 },
        { kind:'checklist', ref:'design-review', why:'The checklist says what to check, so the critique can spend its time on the intent.', do:'Run the design review checklist on a feature of a shipped game or a design you did not write, and list where its questions found something your gut reaction had missed.', min:35 },
        { kind:'topic', ref:'learning-from-success', why:'A dissection of comparables is the cheapest critique practice, and a fixed template keeps you from collecting opinions.', do:'Dissect one shipped game on the topic’s template (want served, core verb, first 30 seconds, decision per minute, why it worked, complaints), then fill the teardown sheet from the critique topic: core loop, inferred pillars, three decisions that work, three that cost, and what to steal, adapt or avoid.', min:40 },
        { kind:'topic', ref:'design-documents', why:'The review and the decisions it produces only outlive the meeting if they are written down.', do:'Write the decision log entry for your review: the top three problems, the owner’s choices and the date you will check the result.', min:30 },
        { kind:'topic', ref:'lead-one-on-ones', why:'The 1:1 is where feedback to a designer lands or is lost.', do:'Write three questions for your next 1:1 with a designer you mentor (or would mentor) that are not status updates.', min:25 },
        { kind:'topic', ref:'lead-feedback-performance', why:'Good feedback separates what you saw from a judgement and names its effect, and it has a fair, written next step when it fails.', do:'Write a feedback note to a sample junior design in this order: their goal, what you saw, the effect on the player, a question, one habit to watch. Compare it with their earlier version so they see progress, and name what specifically worked.', min:25 },
        { kind:'topic', ref:'team-and-collaboration', why:'Reviews fail at the seams between owners, so who decides has to be clear before anyone critiques.', do:'Write who owns each decision your review touches and who has only advice to give.', min:25 }
      ],
      review:['metrics-and-success'],
      check:{
        recall:[
          { q:'What does a critique compare a design against?', a:'Its stated intent: the goal, the player and the pillar it serves. Without an intent the review is an argument between tastes, and the loudest opinion wins.' },
          { q:'Why keep the owner in charge of a review?', a:'If critics can order changes, the design becomes the average of the room and nobody is accountable. The Braintrust model gives notes that are not mandatory, and the owner decides.' },
          { q:'What does the feedback research warn about?', a:'Kluger and DeNisi pooled 607 effects and found feedback helped on average but over a third of effects were negative. It did worst when attention moved to the self, so aim feedback at the task and the goal.' }
        ],
        build:'Run a design review of a shipped game on the teardown sheet, then write a feedback note in the goal, observation, effect, question order on a design from your own early work, treated as a junior’s.',
        skip:['Does each review start from a written intent?','Can the owner name their top three problems after a review?','Do you sort your notes into saw, meant and would try?','Do you check later whether a review’s changes fixed the problem?']
      } },
    { id:'s5', t:'Scope, pitch and trade-offs', level:'advanced',
      goal:'Cost a design with the people who build it, cut it on purpose and pitch the result for a decision.', hours:4.5,
      steps:[
        { kind:'topic', ref:'scope-control', why:'Cheap implementation makes scope the risk, so the senior designer decides what stays out.', do:'List what your design has to leave out and the adjacent experiences you refuse.', min:30 },
        { kind:'topic', ref:'pm-scoping-cuts', why:'A cut you make on purpose is a design decision, and one made under a deadline is damage control.', do:'Write a cut list for your design with the reason, the cost to the player and what each cut frees.', min:35 },
        { kind:'topic', ref:'pm-cross-discipline', why:'A design nobody who builds it has costed is a wish, and ownership at the seams predicts where the work breaks.', do:'Get a rough range from engineering, art and audio for each item (from colleagues, or your own labelled guesses if you work alone), and give the version that fits, the cheaper version that keeps the pillar, and the cut.', min:45 },
        { kind:'checklist', ref:'scope-sanity', why:'A check over the whole plan catches what a check on one feature never will.', do:'Run scope sanity over the full plan and mark what it forces you to cut.', min:30 },
        { kind:'topic', ref:'pitching-and-stakeholders', why:'A pitch is a decision request, and the evidence rung and the answer to each kind of no decide whether it lands.', do:'Write the ask with a date, name each listener’s need, pick the cheapest evidence rung, list three objections and rehearse a ten-minute pitch with a sceptic.', min:60 },
        { kind:'topic', ref:'lead-saying-no', why:'The pitch topic taught you to sort the noes you hear; this one is about the noes you give, which only stay fair when they name what would leave and offer a smaller shape.', do:'Write three requests you would get on your design (a publisher, a lead, a player). For each, state what it is for, what it would displace and a smaller version you could say yes to. Then sort the noes your pitch rehearsal drew into not now, not this, not this way or not you.', min:30 },
        { kind:'reflect', why:'A pitch only becomes a decision when it is followed by a written memo.', do:'Write the decision memo that would follow your rehearsed pitch, as if the sceptic had decided: what was decided, by whom, what changes and the date of the next check.', min:40 }
      ],
      review:['design-pillars','live-design-seasons-and-data'],
      check:{
        recall:[
          { q:'What must a pitch contain?', a:'An ask with a date, the claim tied to a pillar or goal, evidence at the cheapest rung that removes the doubt, the main risk and the answers to likely objections.' },
          { q:'How do you cost a design as a senior?', a:'In each discipline’s own units, asking engineering, art, audio and QA for ranges and what they would drop. Offer the full, the cheaper that keeps the pillar, and the cut, with the player cost of each.' },
          { q:'What are the four kinds of no?', a:'Not now (timing, ask for a date), not this (fit, ask what would fit), not this way (method, offer options), not you (trust, find a sponsor). Write down which one it was.' }
        ],
        build:'Write a cut list with reasoning for your vision, season and economy work, then pitch the whole in ten minutes or less to a sceptic (a colleague, or an AI role-playing one) and record their objections.',
        skip:['Can your pitch state its ask and date in one sentence?','Have you costed your design with those who build it?','Do you offer options, not one demand?','Do you send a decision memo the same day?']
      } }
  ]
});

PATH('technical-lead', {
  t:'Technical lead', tag:'Delegation, review and the incident that becomes a rule instead of a scar.',
  pick:'Lead a small team and make its work better',
  track:'leadership', level:'advanced', hours:12.25,
  audience:'Senior designers or engineers stepping into leading a small team, who already do the work and now have to make other people’s work better too.',
  outcome:'You can delegate and say no on purpose, run a review that improves the thing being reviewed, and turn an incident or a cut into a rule the team keeps.',
  prereq:[], prereqAny:['systems-designer','level-and-ux-designer','senior-game-designer','gameplay-engineer-godot','gameplay-engineer-unity','live-game-backend-engineer','build-and-release-engineer'], next:['studio-practice-ai-era'],
  stages:[
    { id:'s1', t:'What a lead does', level:'advanced',
      goal:'Separate what only you can do from what you are doing out of habit, and practice saying no on purpose.', hours:3.75,
      steps:[
        { kind:'topic', ref:'lead-role', why:'The job changes from doing the work to making other people’s work better, and most new leads keep doing the first job by default.', do:'List everything you did last week, and mark each item as only I can do this or someone else could, and it is time they did.', min:15 },
        { kind:'topic', ref:'lead-one-on-ones', why:'A 1:1 is the one recurring room where you find out what is wrong before it becomes a postmortem.', do:'Write the three questions you will ask in your next 1:1 that are not status updates, and the one thing you will do differently if the answer surprises you.', min:15 },
        { kind:'topic', ref:'lead-feedback-performance', why:'Feedback that fails needs a fair, documented next step, and a lead who cannot give one is the one who lets a problem grow.', do:'Write an observation-only feedback note for a real case (what you saw, its effect, what you ask for), then a mock improvement plan with the expectation, the support, the measures, a review date and the HR check.', min:40 },
        { kind:'topic', ref:'team-and-collaboration', why:'Most lead failures are collaboration failures wearing a technical costume: unclear ownership, silent handoffs, decisions nobody remembers making.', do:'Pick one recent handoff on your team that went badly, and write down where ownership was unclear before anything else went wrong.', min:20 },
        { kind:'topic', ref:'lead-saying-no', why:'Every yes you give away is a commitment someone else now has to keep, usually without the context you had when you said it.', do:'Write the last three requests you said yes to, and for each, the one sentence you should have said instead if you had said no on purpose.', min:20 },
        { kind:'tool', ref:'delegate', why:'A task feels un-delegatable right up until you write down what it would take to hand it off, which the Delegation Planner forces you to do.', do:'Run one task from your only-I-can-do-this list through the AI Delegation Planner, and change its category if the plan shows it is wrong.', min:30 },
        { kind:'topic', ref:'lead-conflict-growth', why:'Leads settle disputes and grow people, and both go better when the decision is written down and the task handed over with a brief.', do:'Write a decision record for a real dispute (the options, who decides, the reason) and a delegation brief for one task you hold (the outcome, the limits, the check-in).', min:40 },
        { kind:'topic', ref:'lead-hiring', why:'A lead now decides who joins the team, and a loop that tests puzzles instead of the actual work produces noise that gets treated as signal, while a bad hire costs the team a year.', do:'Write the three tasks a new hire on your team does most in their first six months, and design one interview exercise that tests the most important of them.', min:20 },
        { kind:'reflect', why:'Naming the change in your own words is what makes it a decision instead of an intention.', do:'Write one thing you are currently doing that should be delegated or refused, and the first concrete step you will take this week to make that true.', min:20 }
      ],
      review:[],
      check:{
        recall:[
          { q:'Where should a hiring loop be designed from?', a:'Backwards from the work: the tasks the hire will actually do, each tested by an exercise that resembles it, rather than puzzles that test whether a candidate enjoys interviews.' },
          { q:'What is the difference between a job only you can do and one you are just used to doing?', a:'A job only you can do needs judgement, authority or context nobody else currently has. A job you are just used to doing is one you keep out of habit even though someone else could now own it, and it is time they did.' },
          { q:'Why does unclear ownership usually cause a handoff failure before anything technical does?', a:'Most lead failures are collaboration failures wearing a technical costume. When nobody knows who decided what, handoffs happen silently and decisions get made twice or not at all, so the visible technical symptom is downstream of that ownership gap.' },
          { q:'What does saying no on purpose require that saying yes by default does not?', a:'It requires naming what the request is for, sizing its real cost, and stating what it would displace. A deliberate no trades explicitly, while a default yes just accumulates commitments nobody accounted for.' }
        ],
        build:'Run the Delegation Planner on one real task and write the concrete first step for delegating or refusing it this week.',
        skip:['Does every exercise in your hiring loop resemble real work on your team?','Can you sort your current task list into only-me and someone-else-now without hesitating?','Do you already ask at least one non-status question in every 1:1?','Can you point to a recent handoff failure and name exactly where ownership was unclear?','Have you already said no on purpose this month, and can you name what you said instead?']
      } },
    { id:'s2', t:'Conventions, onboarding and code review', level:'advanced',
      goal:'See how three real teams turned hard lessons into rules other people follow, then run a review that does the same.', hours:2.5,
      steps:[
        { kind:'topic', ref:'lead-conventions', why:'A convention nobody wrote down is a preference. A convention written down with the reason attached is a rule someone can follow without you in the room.', do:'Pick one unwritten rule your team already follows by habit, and write it down with the specific incident or cost that justifies it.', min:20 },
        { kind:'topic', ref:'lead-onboarding', why:'What a new person cannot find in their first week, they will either guess wrong or interrupt you to ask, forever.', do:'List the three things it took you longest to learn when you joined your current team, and check whether any of them are written down yet.', min:20 },
        { kind:'topic', ref:'lead-code-review', why:'A review that only checks for bugs misses the slower failure: a codebase nobody but the original author can safely change.', do:'Look at your last five reviews and count how many comments were about correctness versus about a future reader’s ability to understand the change.', min:20 },
        { kind:'topic', ref:'ai-agentic-implementation', why:'Agent-written diffs arrive faster than anyone can read them. The review standard you hold people to has to hold for agents too, or it quietly stops holding for everyone.', do:'Take the last change an agent or assistant wrote on your team and check it against your review standard: was every changed line read, and did a check fail before it passed?', min:15 },
        { kind:'part', ref:'cs-go-game-backend/process/process-conventions', why:'This backend team turned a lesson about migration PRs into a rule file instead of relying on memory. That is the exact move your unwritten rule from the first step needs to make.', do:'Based on how this team separated migration PRs and used rule files as memory, check your own written rule from step one against the same test: would a new hire follow it without asking you?', min:20 },
        { kind:'part', ref:'cs-unity-mobile-client-ci/conv/conv-pr-review', why:'A bilingual PR template with a fixed checklist is what turned this team’s review from whatever the reviewer remembers to check into something repeatable.', do:'Compare your team’s actual review checklist, written or not, against this one, and write the single biggest gap.', min:20 },
        { kind:'part', ref:'cs-unity-multiplatform-port/process/process-conventions', why:'Two coding styles under one roof forced this team to write down a null policy instead of arguing about it per pull request. Most teams have an equivalent argument still happening live.', do:'Name one recurring argument on your own team that a written convention, like this one, would end for good.', min:20 },
        { kind:'checklist', ref:'design-review', why:'Running the same checklist on someone else’s work as on your own is what proves it is a real standard and not just your taste.', do:'Run the design review checklist on a pull request or design doc you did not write, and compare your verdict with the author’s own sense of it.', min:25 }
      ],
      review:['lead-role'],
      check:{
        recall:[
          { q:'What turns a preference into a convention someone can follow?', a:'Writing it down with the specific incident or cost that justifies it, stated in the imperative, dated, and placed where the decision happens. An unwritten rule is only a habit, and a written one with no origin is nearly as unfollowable.' },
          { q:'What does comparing correctness comments with readability comments in a review history show?', a:'Whether review is only catching bugs or also protecting the next reader’s ability to safely change the code. A review skewed entirely towards correctness misses the slower failure of a codebase only its original author can maintain.' },
          { q:'What test decides whether a written convention is working?', a:'Whether someone who has not been told directly, like a new hire, can find and follow the rule for a situation they have not met yet without asking. If they cannot, the convention is in the wrong place or was never really adopted.' }
        ],
        build:'Write down one previously unwritten rule with its justifying incident, and run the design review checklist on a piece of work you did not author.',
        skip:['Can you name an unwritten rule your team follows, and the incident that caused it?','Do you already know what a new hire on your team would waste their first week guessing at?','Have you compared your own review comments for correctness versus readability, and did the split surprise you?','Can you name a recurring argument on your team that a written convention would settle?']
      } },
    { id:'s3', t:'Incidents, risk and postmortems', level:'advanced',
      goal:'Treat an incident as a source of a rule instead of a source of blame, and keep a risk register that gets read.', hours:2,
      steps:[
        { kind:'topic', ref:'lead-incidents', why:'A blameless postmortem is not about being nice. It is the version most likely to get the truth, because people stop hiding what they did when the report asks about guards, not culprits.', do:'Write down your team’s last incident in two versions: the blame version and the systems version. Notice which one points at a fix.', min:25 },
        { kind:'topic', ref:'pm-risk', why:'A risk register nobody reads is a document, not a tool. The order you de-risk things in matters more than the list itself.', do:'List your three biggest current risks, and reorder them by which one would hurt most if it hit tomorrow, not by which one is easiest to write about.', min:25 },
        { kind:'topic', ref:'pm-postmortems', why:'A postmortem that does not produce a rule or a written change is a story. Only the second kind prevents a repeat.', do:'Take your last postmortem, or write one now for your last incident, and check whether it produced an actual rule or just an apology.', min:25 },
        { kind:'checklist', ref:'design-review', why:'Reviewing the fix that came out of a postmortem catches the version that treats the symptom instead of the actual failure.', do:'Run the design review checklist against your last postmortem’s proposed fix, before it becomes a task nobody revisits.', min:20 },
        { kind:'game', ref:'kerbal-space-program', lens:'lineage', why:'Kerbal Space Program 2 announced a release date at Gamescom 2019 before a stable build existed, slipped it from early 2020 to 2023 through a full studio handover, and still carried that schedule risk unretired when Take-Two closed the studio in 2024.', do:'Read its lineage lens, then write the single early-warning signal that, watched from 2019 onward, would have flagged Kerbal Space Program 2’s release date as the risk nobody had actually closed.', min:15 },
        { kind:'reflect', why:'The risk you are avoiding naming out loud is usually the one doing the most damage by staying unnamed.', do:'Write the risk you are most currently ignoring, and the one piece of evidence that would force you to finally act on it.', min:20 }
      ],
      review:['lead-conventions'],
      check:{
        recall:[
          { q:'Why does a blameless version of an incident point at a fix better than a blame version?', a:'Blame ends the investigation at a person, while the blameless version keeps asking why the guard that should have caught the mistake was missing. That missing guard, not the individual, is the thing that can be fixed.' },
          { q:'What is the ordering test for a risk register, and why does it matter more than the list?', a:'Order risks by how much they would hurt if they hit tomorrow, not by which is easiest to write about. A long unordered list looks thorough, but the ordering is what tells the team which risk this month’s work is meant to retire.' },
          { q:'What does a postmortem have to produce to count as more than a story?', a:'A small number of owned changes with dates, placed where the next person will encounter them, such as a checklist, a template or a rule file. A postmortem that only narrates events without producing a change is a story, not a fix.' }
        ],
        build:'Write or revisit one postmortem and run the design review checklist against its proposed fix before it goes into the backlog unreviewed.',
        skip:['Can you write both a blame version and a systems version of your last incident, and see the difference?','Is your risk register ordered by actual damage, or by whatever was easiest to write down?','Can you point to a postmortem that produced a real rule, not just an apology?','Do you know the risk you are currently avoiding naming, and what would force your hand?']
      } },
    { id:'s4', t:'Scope, planning and quality', level:'advanced',
      goal:'Make the cut on purpose, plan against a real milestone, and treat build health as a number you own, not an accident.', hours:2.5,
      steps:[
        { kind:'topic', ref:'pm-scoping-cuts', why:'A scope cut you make on purpose beats a scope cut that happens to you two weeks before a deadline.', do:'Look at your current plan and name the one item you would cut first if the deadline moved a month closer today.', min:25 },
        { kind:'topic', ref:'planning-and-milestones', why:'A milestone that only tracks dates hides the actual question, which is what has to be true for the next milestone to even make sense.', do:'For your next milestone, write the one thing that has to be true by then for the milestone after it to still make sense.', min:25 },
        { kind:'topic', ref:'pm-estimation', why:'A milestone date is only as good as the estimates under it, and an estimate is a range with a confidence, not a promise.', do:'Re-estimate your next milestone’s three biggest items as ranges with a confidence, and write the one thing that would narrow the widest range.', min:20 },
        { kind:'topic', ref:'quality-and-build-health', why:'Build health is a leading indicator, not a housekeeping task. A team that ignores it is reading the wrong dashboard.', do:'Check your team’s current build health signal (pass rate, flake rate, time to green) and write whether it is trending towards or away from the next milestone.', min:25 },
        { kind:'checklist', ref:'scope-sanity', why:'A scope check applied to the whole roadmap catches what a scope check on one feature never will.', do:'Run the scope sanity checklist against your team’s current roadmap, not just your own task list.', min:25 },
        { kind:'reflect', why:'The cut you are avoiding making is usually costing the team more than the feature it is protecting is worth.', do:'Write the one cut you are avoiding making, and what it is currently costing the team by staying in scope.', min:20 },
        { kind:'game', ref:'xeno', why:'Xenogears ran out of schedule and told its second disc as narration, and Xenosaga’s six planned episodes became three, so its finale absorbed story cut from Episode II.', do:'Read its complaints and reception, then write the cut list Xenogears’ team could have made in its first year instead of its last months.', min:20 }
      ],
      review:['lead-incidents'],
      check:{
        recall:[
          { q:'What is the useful output of an estimate?', a:'The spread and the confidence, plus what would narrow it. A single number hides the uncertainty the plan most needs to see.' },
          { q:'Why is a scope cut made on purpose better than one made under deadline pressure?', a:'A cut made calmly, before pressure, is a design decision with its tail, tools, data, tests, considered and the team’s agreement secured. A cut made in the last week is damage control that usually leaves the tail behind and blindsides the team.' },
          { q:'What question should a milestone answer, beyond a date?', a:'What has to be true by that point for the next milestone to still make sense. A milestone is a question with an exit criterion that retires a risk or settles a decision, not a tally of features hit by a date.' },
          { q:'Why is build health a leading indicator rather than housekeeping?', a:'A broken or unstable build stops the evidence loop: no playable build means no playtest, which means the next decision gets made on opinion instead of evidence. Build health predicts whether the team can keep learning, not just whether the code is tidy.' }
        ],
        build:'Run the scope sanity checklist against the full roadmap, and write the one cut it justifies that you have been avoiding.',
        skip:['Are your milestone estimates written as ranges with a confidence?','Can you name the item you would cut first if your deadline moved a month closer, right now?','Do you know what has to be true by your next milestone for the one after it to make sense?','Is your build health signal trending towards or away from your next milestone, and do you know why?','Can you name the cut you are avoiding, and its actual cost to the team?']
      } },
    { id:'s5', t:'One workflow, seen whole', level:'advanced',
      goal:'See a process end to end instead of just your own step in it, and turn what you notice into a change.', hours:1.5,
      steps:[
        { kind:'flow', ref:'cs-unity-mobile-client-ci/pull-request', why:'Most people only ever see their own step in a pull request. Seeing the whole shape is what lets a lead spot where the process breaks.', do:'Walk this workflow chart end to end and write down the one step where your own team’s process differs from it, and why.', min:30 },
        { kind:'smell', ref:'docs-nobody-reads', why:'A written convention nobody reads is exactly as useful as one that was never written, and this is the smell for catching that quietly.', do:'Using the “documents are stale or ignored” smell, check one convention you wrote earlier in this path: would anyone find it?', min:20 },
        { kind:'checklist', ref:'design-review', why:'Turning what you just saw into a checklist gate is what makes a good process observation into an actual change.', do:'Run the design review checklist one more time, but this time write down which of its questions your own team’s process currently has no way to answer.', min:25 },
        { kind:'reflect', why:'The change you can name and defend is the one you will make, past this session.', do:'Write the one process change you would make to your own team’s pull request or review flow, and who you would need to convince first.', min:20 }
      ],
      review:['pm-scoping-cuts'],
      check:{
        recall:[
          { q:'What can seeing a whole workflow chart show you that seeing only your own step cannot?', a:'Where the process breaks structurally: which handoffs have no artifact, which gates exist because of a past incident, and where your own team’s process diverges from a working example, none of which is visible from inside a single step.', ideas:['which handoffs have no artifact', 'which gates exist because of a past incident', 'where your own team’s process diverges from a working example'] },
          { q:'What test does the docs-nobody-reads smell suggest for a written convention?', a:'Whether anyone would find and read it. Check whether it is stale, contradicted by another document, or whether there is no single source of truth for that decision area, since a convention nobody encounters is as useful as one never written.' },
          { q:'What made the process change you named the right one to lead with?', a:'The strongest first change is one traceable to a real gap the workflow walk or a design review checklist surfaced, small enough to run right away, and named alongside exactly who needs to agree to it before it can happen.', ideas:['The strongest first change is one traceable to a real gap the workflow walk or a design review checklist surfaced', 'small enough to run right away', 'named alongside exactly who needs to agree to it before it can happen'] }
        ],
        build:'Write the one process change you would propose, who you need to convince, and the one question from the design review checklist your team currently cannot answer.',
        skip:['Have you already walked a workflow end to end and found where your own process differs?','Can you name one of your team’s written conventions that nobody reads anymore?','Do you know the one process change you would lead with, and who would need to agree to it?','Can you defend that change to someone who is happy with how things work today?']
      } }
  ]
});

PATH('interview-prep-designer', {
  t:'Interview prep: designer', tag:'The stories and the frameworks, rehearsed until they are fast.',
  pick:'Answer design interview questions with real stories',
  track:'interview', level:'intermediate', hours:11.75,
  audience:'Designers preparing for a job interview who already have the fundamentals and need to turn them into fast, concrete answers.',
  outcome:'You can answer a question in any core design category in under two minutes, back it with a real story, and speak to at least one engineering constraint you have worked against.',
  prereq:['game-designer-foundations'], next:['study-the-hits-worlds'],
  stages:[
    { id:'s1', t:'Player, motivation and the story you tell', level:'intermediate',
      goal:'Rehearse the player and experience questions out loud, and have one game you can dissect on demand.', hours:2.25,
      steps:[
        { kind:'topic', ref:'who-is-the-player', tab:'interview', why:'Interviewers ask you to defend a player before they ask about a mechanic. If you cannot name one fast, everything after sounds invented.', do:'Open the interview tab for Who is the player? and answer two of its questions out loud, timing yourself at two minutes each.', min:25 },
        { kind:'topic', ref:'core-experience', tab:'interview', why:'The core experience question is where a vague pitch gets caught. Practicing it out loud is the only way to find the vague part before an interviewer does.', do:'Open the interview tab for Core experience and answer its hardest question out loud, then write the one word you kept repeating without defining it.', min:30 },
        { kind:'topic', ref:'careers-transferable-skills', tab:'interview', why:'If you also interview outside games, most of what a designer knows transfers but the vocabulary does not, and a few things you are proud of matter to nobody outside games.', do:'Open the interview tab for Transferable skills by discipline and answer its game-designer-into-UX question out loud, then retell one of your own stories with the game and genre nouns stripped out.', min:20 },
        { kind:'tool', ref:'dissect', why:'A dissected reference game is the fastest way to have a concrete example ready when someone asks what game you admire and why.', do:'Dissect one game you did not design, and write the two-sentence version you would say out loud in an interview.', min:30 },
        { kind:'reflect', why:'A story is only fast to tell once you have written it down once already.', do:'Write one story in Situation, Task, Action, Result form about a time you had to defend a player or a fantasy choice against pushback.', min:25 },
        { kind:'game', ref:'call-of-duty-4', lens:'replay', why:'Call of Duty 4: Modern Warfare is a clear case of a progression layer that keeps players returning to the same short match: unlocks, perks, killstreaks and Prestige.', do:'Read its signature and replay lens, then explain in two minutes, as you would in an interview, which of its three reward horizons you would keep for a new shooter and which you would cut, and why.', min:15 }
      ],
      review:[],
      check:{
        recall:[
          { q:'When a game designer moves into UX, what maps and what does not?', a:'Systems thinking, onboarding and feedback loops, prototyping and playtesting as observational research map. Formal research methods, accessibility standards, business metrics and designing for users who want to finish a task quickly do not map directly.' },
          { q:'What does defending a player mean in an interview answer?', a:'Naming a concrete player model, recent games they finished, session shape, device, the feeling they came for, then giving one real decision that model changed, such as a cut tutorial or a rejected control scheme, instead of a demographic label like “gamers.”', ideas:['Naming a concrete player model, recent games they finished, session shape, device, the feeling they came for', 'giving one real decision that model changed, such as a cut tutorial or a rejected control scheme'] },
          { q:'Which words do designers lean on in answers without defining them, and how do you fix that?', a:'Usual offenders are words like fun, engaging, immersive or deep. The exercise is noticing which undefined word you leaned on while answering, then replacing it with the specific emotion, behaviour or mechanism you meant.' },
          { q:'What is the fastest way to have a concrete reference-game example ready?', a:'Dissect one game you did not design ahead of time, using Reference Dissection, so you already hold the two-sentence structural summary of what it does and why, instead of improvising an analysis live in the interview.' }
        ],
        build:'Write the two-sentence dissection summary and the full STAR story, then say both out loud once, timed.',
        skip:['Can you tell your strongest story with the game and genre nouns stripped out?','Can you answer who is the player for your own project in under two minutes, unscripted?','Do you already have a reference game dissected and ready to describe in two sentences?','Have you written a STAR story about a player or fantasy decision before today?','Can you catch yourself using an undefined term like fun or engaging and replace it on the spot?']
      } },
    { id:'s2', t:'Loops, decisions and systems under pressure', level:'intermediate',
      goal:'Answer the systems questions with a real constraint behind them, not just theory.', hours:2.25,
      steps:[
        { kind:'topic', ref:'core-loop', tab:'interview', why:'Walk me through your core loop is close to a universal design interview question, and it rewards precision over enthusiasm.', do:'Open the interview tab for The core loop and answer its question about a weak loop out loud, using a real loop you have built.', min:25 },
        { kind:'topic', ref:'economy-and-resources', tab:'interview', why:'Economy questions test whether you can explain a system’s trade-offs simply, without hiding behind spreadsheet vocabulary.', do:'Open the interview tab for Economy and resources and answer its hardest question as if explaining it to a non-designer on the hiring panel.', min:25 },
        { kind:'game', ref:'starcraft', lens:'gameplay', why:'StarCraft balances three races that share no unit by making the economy the level field: minerals, gas and a strict supply cap put the same macro discipline on every player, a compact example for any balance question.', do:'Read its gameplay lens, then answer “how would you balance asymmetric factions?” out loud in two minutes, using StarCraft’s shared economy as your example and naming the equivalent in your own game.', min:15 },
        { kind:'checklist', ref:'design-review', why:'How do you know a feature is worth building is best answered with a structure, not a vibe, and the design review checklist is that structure.', do:'Answer “How do you know a feature is worth building?” using the design review checklist’s own categories as your outline.', min:20 },
        { kind:'part', ref:'cs-go-game-backend/realtime/realtime-matchmaking', why:'A concrete engineering constraint you can speak to shows you have worked across a boundary, not just theorised about one from the design side.', do:'Write the two sentences you would use to explain a matchmaking or fairness trade-off to a non-technical interviewer, based on this part on ticket-based matchmaking.', min:25 },
        { kind:'reflect', why:'Interviewers remember the specific story, not the general claim behind it.', do:'Write a STAR story about a time an economy or loop decision met a real constraint, technical or otherwise, and what you changed because of it.', min:25 }
      ],
      review:['who-is-the-player'],
      check:{
        recall:[
          { q:'How can unlike factions stay fair, as StarCraft’s races do?', a:'Through the shared economy rather than matched units: every race gathers minerals and gas under a strict supply cap, so macro discipline is the same test for everyone however different the armies look.', ideas:['Through the shared economy rather than matched units', 'every race gathers minerals and gas under a strict supply cap', 'macro discipline is the same test for everyone however different the armies look'] },
          { q:'What makes a core loop answer precise instead of just enthusiastic?', a:'Walking one concrete iteration of a real loop through its five beats, decision, action, consequence, feedback, new situation, and naming how long an iteration takes and what changes between iterations. Precision comes from specifics, not from calling the loop fun.' },
          { q:'How would you explain your economy’s central trade-off to someone non-technical?', a:'Name the one decision a currency forces, what a player gives up now to get something later, in plain terms, without spreadsheet vocabulary, and say why that tension is the actual point of the currency existing.', ideas:['Name the one decision a currency forces, what a player gives up now to get something later, in plain terms, without spreadsheet vocabulary', 'say why that tension is the actual point of the currency existing'] },
          { q:'What did the matchmaking part give you that pure design theory would not?', a:'A concrete design and engineering tradeoff: tickets carry capacity plus rule predicates and are scanned under one mutex, which keeps matching rules easy to evolve and correctness easy to reason about, at the cost of throughput that a later scaling pass must replace. It shows you have met the constraint, not just theorised about match quality.' }
        ],
        build:'Write your two-sentence engineering-tradeoff explanation and your STAR story about a systems decision under a real constraint.',
        skip:['Can you answer an asymmetric-balance question with a concrete example?','Can you describe your core loop’s weak link out loud in under a minute?','Can you explain your economy’s central trade-off to someone with no design background?','Have you already got a concrete engineering-constraint story ready for a systems interview question?','Do you have a STAR story about a system decision that met real pushback?']
      } },
    { id:'s3', t:'Level, UX and reading a room', level:'advanced',
      goal:'Answer the level and UX questions with evidence from watching a player, not from a survey.', hours:2.5,
      steps:[
        { kind:'topic', ref:'level-structure', tab:'interview', why:'How do you pace a level is a question that rewards a name for what you did, not just a description of it.', do:'Open the interview tab for Level structure and answer its question out loud, naming the structural beats you used.', min:25 },
        { kind:'topic', ref:'onboarding', tab:'interview', why:'How do you make sure players understand something is one of the most common UX interview questions, and the strongest answers describe watching, not asking.', do:'Open the interview tab for Onboarding and answer its hardest question, making sure your answer describes what you watched a player do, not what they told you.', min:25 },
        { kind:'topic', ref:'environmental-storytelling', tab:'interview', why:'Level interviews often ask how a space tells its story, and the strong answer names what a player found without being told.', do:'Open the interview tab for Environmental storytelling and answer one question out loud, using one space from your own work or a game you know.', min:20 },
        { kind:'checklist', ref:'onboarding-audit', why:'Quoting a specific line from a real audit is more convincing than describing your process in general terms.', do:'Prepare your onboarding answer by running the silent onboarding audit and picking one line from it to quote directly.', min:20 },
        { kind:'game', ref:'resident-evil-4', lens:'gameplay', why:'Resident Evil 4 roots the player while aiming, so its opening village is a clear case of an encounter built from space, crowd and a small magazine rather than enemy count.', do:'Read its gameplay lens, then explain in two minutes, as you would in an interview, how you would redesign the village fight if the player could move while aiming.', min:12 },
        { kind:'part', ref:'cs-go-game-backend/simparity/simparity-determinism', why:'Fairness and cheating come up in almost every systems or live-game interview, and a real story about keeping simulation fair across clients beats a general claim about caring about fairness.', do:'Write the sentence you would use if asked about fairness or cheating in your own game, based on how this team kept simulation results fair and reproducible across clients and servers.', min:25 },
        { kind:'reflect', why:'The best UX stories are diagnostic, not decorative. Writing one down forces it to be diagnostic.', do:'Write a STAR story about a UX or level problem you diagnosed by watching a player instead of by asking them what they thought.', min:25 }
      ],
      review:['core-loop'],
      check:{
        recall:[
          { q:'What makes an environmental storytelling answer strong?', a:'A concrete space, the event behind it and the evidence a player read without text, plus how you checked it: ask players what they think happened there and watch where they stop unprompted.', ideas:['A concrete space, the event behind it and the evidence a player read without text', 'how you checked it: ask players what they think happened there and watch where they stop unprompted'] },
          { q:'Why does naming the structural beats you used beat describing the level generally?', a:'Naming teach, test, twist, combine, master or rest proves the level was designed as a deliberate lesson rather than assembled as a pile of encounters, and it gives the interviewer something specific to probe instead of a vague description.', ideas:['Naming teach, test, twist, combine, master or rest proves the level was designed as a deliberate lesson rather than assembled as a pile of encounters', 'it gives the interviewer something specific to probe instead of a vague description'] },
          { q:'What should a strong onboarding answer describe watching, instead of asking?', a:'What a new player did in the first minutes, where they hesitated, what they tried unprompted, what they missed, rather than what a tester said they thought. Onboarding evidence comes from silent observation, not from asking whether it was clear.' },
          { q:'What did the determinism part give you for a fairness question?', a:'A concrete story about keeping simulation results bit-exact between client and server, a ported random generator, forbidding a compiler fold that changed outcomes, diffing traces step by step, which beats a general claim about caring about fairness.', ideas:['A concrete story about keeping simulation results bit-exact between client and server', 'a ported random generator, forbidding a compiler fold that changed outcomes, diffing traces step by step'] }
        ],
        build:'Quote one line from your onboarding audit run and write your STAR story about a UX problem diagnosed by observation.',
        skip:['Can you describe one space that tells a story without text?','Can you name the structural beats in a level you have shipped or built, on the spot?','Do you have a specific line from an onboarding audit ready to quote?','Can you speak to a fairness or cheating question with a concrete example, not just a value statement?','Do you have a STAR story about a UX fix that came from watching, not asking?']
      } },
    { id:'s4', t:'Production judgement', level:'advanced',
      goal:'Show you know when to stop prototyping, and that a playtest has changed your mind before.', hours:2.25,
      steps:[
        { kind:'topic', ref:'playtesting', tab:'interview', why:'Tell me about a playtest that surprised you tests whether you update on evidence, which is what the role is really asking about.', do:'Open the interview tab for Playtesting and answer its question about a surprising result out loud, using a real session if you have one.', min:25 },
        { kind:'topic', ref:'hypothesis-driven-design', tab:'interview', why:'How do you know when to stop prototyping rewards a structure, a hypothesis with a kill criterion, not a feeling about being done.', do:'Open the interview tab for Hypothesis-driven design and answer its hardest question, naming an actual kill criterion you have used.', min:25 },
        { kind:'checklist', ref:'pre-prototype', why:'Rehearsing this answer against a real checklist keeps it concrete instead of aspirational.', do:'Rehearse your answer to “How do you know when to stop prototyping?” using the pre-prototype checklist as your list of evidence, not your gut.', min:20 },
        { kind:'tool', ref:'dissect', why:'A second dissected game, in a genre you have not worked in, shows range beyond your one comfortable example.', do:'Dissect a second game, this time in a genre you have never worked in, and note the one thing that transfers to your own work.', min:25 },
        { kind:'reflect', why:'A time I was wrong is one of the hardest interview questions to answer well without a story ready in advance.', do:'Write a STAR story about a time a playtest or a hypothesis proved you wrong, and exactly what you did differently afterwards.', min:25 },
        { kind:'game', ref:'overwatch', lens:'replay', why:'Overwatch changed its own team rules four times and cancelled the PvE mode its sequel was sold on, a public record of design judgement being revised under evidence.', do:'Read the Overwatch replay lens, then pick one of its changes, Role Queue, 5v5 or the PvE cancellation, and say in two minutes what evidence you would have wanted before making it.', min:15 }
      ],
      review:['level-structure'],
      check:{
        recall:[
          { q:'What does the stop-prototyping answer reward, structure or feeling?', a:'Structure: a real kill criterion agreed before the test, not a feeling that the team already knew it was fun. Naming the actual criterion used, and whether it was honoured, is what makes the answer credible.' },
          { q:'What kill criterion have you used, and can you name it fast?', a:'It should be a concrete rate or behaviour stated before a real prototype was tested, such as a voluntary-repetition rate below a stated threshold, that you can recall instantly rather than inventing on the spot for the interview.', ideas:['It should be a concrete rate or behaviour stated before a real prototype was tested', 'that you can recall instantly rather than inventing on the spot for the interview'] },
          { q:'What transferred from the second game you dissected?', a:'One specific mechanism, a pacing beat, a feedback technique, a risk-reward structure, from a game outside your usual genre that applies to your own project, showing dissection works as a general skill and not just on games like yours.', ideas:['One specific mechanism, a pacing beat, a feedback technique, a risk-reward structure, from a game outside your usual genre that applies to your own project', 'showing dissection works as a general skill and not just on games like yours'] }
        ],
        build:'Write your kill-criterion example and your STAR story about being proven wrong by a playtest.',
        skip:['Can you name a real kill criterion you have used to stop prototyping, without inventing one on the spot?','Do you have a second dissected game outside your usual genre ready to reference?','Can you tell a playtest-surprised-me story in under two minutes?','Do you have a story ready for tell me about a time you were wrong that is not generic?']
      } },
    { id:'s5', t:'Put it together', level:'advanced',
      goal:'Rehearse the harder, less scripted questions and the two-minute walkthrough that ties everything together.', hours:2.5,
      steps:[
        { kind:'diagnostic', ref:'fun', why:'What makes your game fun is a question that punishes vague answers, and the fun diagnostic forces you to name dimensions instead of adjectives.', do:'Run the fun diagnostic on your strongest project and write the one-sentence summary you would give an interviewer who asks what makes it fun.', min:25 },
        { kind:'smell', ref:'pillars-are-slogans', why:'What are your design pillars is a trap for slogans. This smell exists specifically to catch a pillar that cannot decide anything.', do:'Write how you would answer what are your design pillars without reciting a slogan that decides nothing, based on the “The pillars cannot decide anything” smell.', min:20 },
        { kind:'checklist', ref:'ai-verify', why:'How do you use AI in your process is now a near-universal interview question, and the strongest answers describe a safeguard, not just a workflow.', do:'Prepare your answer to how do you use AI tools in your process using the AI output verification checklist as your concrete example of a safeguard.', min:25 },
        { kind:'tool', ref:'feature', why:'Rehearsing a feature defence against the same nine questions you would use makes the answer sound like judgement, not improvisation.', do:'Rehearse defending a real feature decision using the Should We Build This? questions as your talking points, out loud, timed.', min:30 },
        { kind:'topic', ref:'careers-interviewing-outside-games', tab:'interview', why:'If you also interview outside games, expect some form of “why are you leaving games?”, and a defensive or bitter answer can lose an offer the technical rounds had already won.', do:'Open the interview tab for Interviewing outside games and answer its why-are-you-leaving-games question out loud in two sentences: what the new work offers you and what you bring, without criticising your current studio.', min:20 },
        { kind:'reflect', why:'Walk me through your process is the question every other answer in this path has been building towards.', do:'Write the answer to walk me through your process end to end, in under two minutes spoken, using one project as the spine of the answer.', min:25 },
        { kind:'game', ref:'tony-hawks-pro-skater', lens:'gameplay', why:'Tony Hawk’s Pro Skater fits a whole design, a timed run, a written goal list and a combo held until landing, into two minutes, which makes it a compact case to explain end to end.', do:'Read the signature and the gameplay lens, then explain in two minutes how the clock, the goal list and the held combo depend on each other, and what breaks if you remove one.', min:15 }
      ],
      review:['playtesting'],
      check:{
        recall:[
          { q:'What should a why-are-you-leaving answer do?', a:'Look forward: name what the new role offers that you want, such as its problem space or users, and what you bring. If you were laid off, say so plainly, and do not complain about crunch, layoffs or a former studio.' },
          { q:'What does the fun diagnostic force you to name instead of an adjective?', a:'A specific fun dimension, such as mastery, discovery, tension or expression, with observable evidence for it, instead of a vague adjective like fun or engaging. Naming the dimension makes the claim checkable against actual player behaviour.' },
          { q:'What makes a design pillar a slogan instead of a decision tool?', a:'A pillar is a slogan if it is generic enough that any game could claim it and it never says no to anything. A real pillar can be rewritten as something it forbids, and it has killed a bad idea, with a story attached.' },
          { q:'What should an AI-process answer describe, beyond a workflow?', a:'A concrete safeguard, such as the AI output verification checklist covering assumptions, sources, problem fit, testability and who owns the embedded decisions, rather than just a description of which AI tools get used and when.' }
        ],
        build:'Write and time your two-minute walk-through-your-process answer, and your one-sentence fun-diagnostic summary.',
        skip:['Can you answer why you are leaving games in two sentences, without a complaint?','Can you answer what makes your game fun in one sentence, using a real dimension, not an adjective?','Can you state a design pillar that has killed a bad idea, with the story attached?','Do you have a concrete answer ready for how you use AI tools, with a named safeguard?','Can you deliver your full walk-through-your-process answer in under two minutes, timed?']
      } }
  ]
});

PATH('casual-game-people-keep', {
  t:'Make a casual game people keep', tag:'From a one-thumb loop to a free-to-play game that survives soft launch and live ops.',
  pick:'Make a casual mobile game people keep',
  track:'design', level:'intermediate', hours:12.5,
  audience:'Designers and small teams building a casual or hyper-casual mobile game who want it played on day 30, not just installed on day 1.',
  outcome:'You can design a loop a new player understands in seconds, tie progression and a free-to-play economy to it without breaking trust, plan a soft launch with playable ads, with kill and scale thresholds and a worked LTV:CPI calculation, so retention and install cost can be judged, and plan a live-ops cadence the team can sustain.',
  prereq:[], next:['systems-designer','senior-game-designer','ship-it'],
  stages:[
    { id:'s1', t:'A loop that works in seconds', level:'intermediate',
      goal:'Build a core loop a player grasps without text and wants to repeat at a bus stop.', hours:2.75,
      steps:[
        { kind:'topic', ref:'core-loop', why:'Players spend most of their time in the core loop, and in a casual game there is little else to carry the session.', do:'Write your loop in five sentences from the player’s point of view, one per link: decision, action, consequence, feedback, new situation. Then time how long one cycle takes.', min:20 },
        { kind:'game', ref:'flappy-bird', lens:'ui', why:'Flappy Bird topped the free charts with exactly one input: a tap, a pipe gap, and a game-over panel one button press from the next try.', do:'Read its UI lens, then list every element on its play screen and mark which elements on your own play screen could move to the menus before and after a run.', min:15 },
        { kind:'game', ref:'fruit-ninja', lens:'sound', why:'Fruit Ninja’s swipe worked within days, and Halfbrick then spent two months on the slice sound and spraying juice that make a cut on flat glass feel like it connected.', do:'Read its sound lens and write the feedback that fires the moment a swipe lands, then note what that feedback cannot tell the player.', min:15 },
        { kind:'topic', ref:'game-feel-and-juice', why:'Feel is the first thing players judge, but juice only amplifies feedback that already exists, so it goes on after the bare loop is replayed.', do:'Rank the outcomes of your main verb by importance, then plan emphasis for the top one in order (anticipation, impact, result), one channel at a time, and write how you will check it reads clearer rather than louder.', min:20 },
        { kind:'topic', ref:'platform-and-session', why:'Session length, interruptions and posture are design constraints, and a loop that needs twenty minutes fails where sessions last five.', do:'Write your session profile (median length, interruption pattern, device, posture), then where a player stops a session and what they see when they come back after a phone call.', min:15 },
        { kind:'topic', ref:'onboarding', why:'Players do not read, and the first session is where retention drops hardest.', do:'Storyboard your first 60 seconds with no text at all, and mark the first action, the first failure and the moment the player first succeeds.', min:20 },
        { kind:'tool', ref:'loop', why:'The loop builder makes the chain from action to new situation explicit and checks it for a weak link before you build.', do:'Run your loop through the loop builder and keep the one weakest link it exposes.', min:15 },
        { kind:'topic', ref:'prototyping', why:'The build for this stage needs something a stranger can play, and the cheapest medium that answers the question is the right one.', do:'Read the topic, then build the cheapest version of one level or run (paper, spreadsheet or grey box) with the number you are least sure about easy to change. Ask one person to play it (a message takes five minutes) and watch their first 60 seconds without explaining anything.', min:45 }
      ],
      review:[],
      check:{
        recall:[
          { q:'What should a new player be doing in the first 30 seconds?', a:'Using the core verb with their hands, without reading: level design and feedback do the teaching and text is the fallback. The first-session timeline plans the first action, decision, failure, mastery moment, reward and reason to return.' },
          { q:'When does juice go into a casual game, and what can it not do?', a:'After the bare loop is voluntarily replayed. Juice amplifies feedback that already exists and cannot manufacture meaning the design lacks; on a weak loop it only delays finding out the loop is weak.' },
          { q:'How does the platform shape the session?', a:'You write a session profile (median length, interruptions, device, posture), build a satisfying unit that fits inside the median session, and treat saving and resuming as core features so an interruption loses nothing.', ideas:['You write a session profile (median length, interruptions, device, posture)', 'build a satisfying unit that fits inside the median session', 'treat saving and resuming as core features so an interruption loses nothing'] }
        ],
        build:'Build or paper-prototype one level or run that a stranger can play for 60 seconds with no explanation, and note where they hesitated.',
        skip:['Can you write your core loop link by link and time one cycle?','Does your first minute need no text to be understood?','Can you name the feedback events on your main verb?']
      } },
    { id:'s2', t:'Levels and progression that pull players back', level:'intermediate',
      goal:'Give the loop a horizon: levels, stars, meta goals and a difficulty curve that brings players back tomorrow.', hours:2,
      steps:[
        { kind:'game', ref:'angry-birds', lens:'replay', why:'Angry Birds answers the stuck player and the finished player with one tool, the Mighty Eagle, and holds its three-star verdict until the level ends.', do:'Read its replay lens, then write what your game offers a player stuck on a level and a player who has already three-starred it, and whether either is paid.', min:15 },
        { kind:'game', ref:'bejeweled', lens:'replay', why:'Bejeweled 3 puts one board under three rules for failure: none in Zen, a soft end in Classic, a one-minute clock in Lightning.', do:'Read its replay lens, list the modes with the single rule each one changes, and write which mood your main mode serves.', min:20 },
        { kind:'topic', ref:'progression', why:'Progression is the long-horizon goal and the reason to return, and it fails when steps only change numbers.', do:'List your first ten progression steps and write the new capability, decision or experience each unlocks; mark any step that only changes a number as a candidate to merge or cut.', min:20 },
        { kind:'topic', ref:'difficulty', why:'Too hard too early churns players before they can see their own progress, and King tracks each Candy Crush Saga level’s time to quit and time to pass as two separate numbers.', do:'Plot the intended difficulty of your first 20 levels, mark where the first real challenge and the first rest level sit, and name the two numbers you will track per level.', min:20 },
        { kind:'topic', ref:'goals-horizons', why:'Players stay when a short, a medium and a long goal are always in view.', do:'Name one goal of each horizon a player sees on your home screen after day three.', min:15 },
        { kind:'game', ref:'plants-vs-zombies', why:'Plants vs. Zombies hands over roughly one new plant per level and makes its campaign its own tutorial, so its progression and its onboarding are the same system.', do:'Read its first 30 seconds and why it worked, then write how each of your first five unlocks would teach one idea.', min:20 },
        { kind:'tool', ref:'ladder', why:'The Behaviour Ladder works from a feature back to the behaviour it should produce and the smallest mechanic that gets it.', do:'Run one planned meta feature, such as stars or a level map, through the ladder and cut whatever the smallest mechanic does not need.', min:15 }
      ],
      review:['core-loop'],
      check:{
        recall:[
          { q:'How can one assist tool solve two problems for casual players, and at what cost, as the Mighty Eagle does?', a:'It clears a level a stuck player cannot beat, and on a beaten level it opens a second goal, Total Destruction. Because it was sold, it invites the suspicion that hard levels are tuned to sell the skip.' },
          { q:'How do you tune casual difficulty from data?', a:'Plot the intended curve and overlay observed failure rates per level, fix spikes by teaching before lowering demands, and track time to quit and time to pass as two numbers, as King does, since a hard level can still be fun if it is short.', ideas:['Plot the intended curve and overlay observed failure rates per level', 'fix spikes by teaching before lowering demands', 'track time to quit and time to pass as two numbers'] },
          { q:'How can one board carry several modes?', a:'By changing only the rule for failure: none (Zen), a soft end when no move remains (Classic) or a clock (Lightning). Players then pick a mode by mood, with nothing new to learn.' }
        ],
        build:'Write a 20-level plan with the idea each level introduces, its intended difficulty and its star thresholds.',
        skip:['Can you name your player’s goal at each of the three horizons?','Do you have a difficulty curve with planned rest levels?','Can you say what each of your first unlocks teaches?']
      } },
    { id:'s3', t:'A free-to-play economy players trust', level:'intermediate',
      goal:'Choose a business model and build currencies, sinks and offers that fund the game without souring it.', hours:2.75,
      steps:[
        { kind:'topic', ref:'business-model', why:'The model decides what retention means and which metrics the team will be pushed to optimise, before any price is set.', do:'Pick your model, write which player behaviour it pays for, and list every system that exists only because of the model.', min:20 },
        { kind:'topic', ref:'monetisation-design', tab:'godot', alt:'unity', why:'Once the model is chosen, the store, the prices and any random reward are the design, and they carry rules about odds disclosure that differ by market.', do:'Read the Godot tab, then write the rules table for one random reward (base rate, soft pity, hard pity), run its effective-rate function over 10,000 simulated pulls, and list the disclosure rules the topic names for the markets you ship in. In Unity, use the C# Gacha class.', min:45 },
        { kind:'game', ref:'candy-crush-saga', lens:'business', why:'Candy Crush Saga places its main purchase at the moment a player is about to fail: five extra moves, a life or a booster, under a five-life cap.', do:'Read its business lens, list each paid item it names with the failure it rescues, and write down the trust cost the lens records.', min:20 },
        { kind:'topic', ref:'economy-and-resources', why:'Sources and sinks decide whether a resource still forces a decision at hour 20, and small imbalances compound into surplus or starvation.', do:'Draw your resources as nodes with every source and sink, and mark where one would pile up unused.', min:25 },
        { kind:'game', ref:'cookie-clicker', lens:'gameplay', why:'Cookie Clicker paces twenty buildings with one pricing rule, a 15% rise per copy owned, and its building list shows the game running out of straight-faced material.', do:'Read its gameplay lens, then write the one pricing rule your own store could use, and mark the point in Cookie Clicker’s list where a new building stops feeling new.', min:15 },
        { kind:'topic', ref:'ethics-and-responsibility', why:'Apple and Google require odds disclosure for paid random items, and the FTC’s Genshin Impact order bans selling loot boxes to US players under 16 without a parent’s consent.', do:'Audit your offers for fear-of-missing-out timers, undisclosed odds and paid skips for problems the design created, and remove or disclose each one.', min:20 },
        { kind:'tool', ref:'sysmap', why:'A systems map shows how the economy loops back into progression and difficulty.', do:'Map currency, lives, boosters and level difficulty together, and mark any loop where selling harder levels becomes the incentive.', min:20 }
      ],
      review:['progression'],
      check:{
        recall:[
          { q:'What is the difference between selling value and selling relief?', a:'Value is expression, content or convenience players did not need to be annoyed into wanting. Relief removes a pain the design created on purpose, such as timers to sell skips. The test: would the player value it if the game had no store?' },
          { q:'Why does every source need a sink?', a:'Without sinks strong enough to keep a resource scarce, it piles up and stops forcing decisions: players hoard because nothing is worth buying, or spend without thinking because everything is affordable.', ideas:['Without sinks strong enough to keep a resource scarce, it piles up and stops forcing decisions', 'players hoard because nothing is worth buying', 'spend without thinking because everything is affordable'] },
          { q:'Name two monetisation patterns that damage trust.', a:'Undisclosed odds on paid random items, which Apple and Google both require to be shown, and fear of missing out used as the retention engine; a paid skip for a problem the design created is a third.', ideas:['Undisclosed odds on paid random items, which Apple and Google both require to be shown', 'fear of missing out used as the retention engine', 'a paid skip for a problem the design created is a third'] }
        ],
        build:'Write a one-page economy sheet: currencies, sources, sinks, the first three offers with prices, and the ethics check each passed.',
        skip:['Have you picked ads, purchases or a hybrid and written what it rewards?','Does every currency in your game have a sink?','Have you checked your offers against dark patterns and odds disclosure?']
      } },
    { id:'s4', t:'Soft launch and playable ads', level:'advanced',
      goal:'Test retention, monetisation and install cost in a limited market before paying for a global launch.', hours:2.75,
      steps:[
        { kind:'topic', ref:'soft-launch-and-playable-ads', why:'Soft launch is where retention and revenue guesses meet a small market before global acquisition spend, and a playable ad is the instrument that brings those players in.', do:'Write your kill, iterate and scale criteria before any test-market user arrives: the D1/D7/D30 line, the CPI ceiling and the LTV:CPI ratio needed to scale, plus the markets you would test in and why.', min:30 },
        { kind:'topic', ref:'metrics-and-success', why:'A soft launch without agreed metrics produces arguments, not decisions.', do:'Define the funnel events your build must log, from install to first purchase, the baseline for each and the decision each one feeds.', min:20 },
        { kind:'engine', ref:'defold', why:'Size is Defold’s main selling point: an empty HTML5 project is a compressed download of under 1 MB, which matters for a light casual game and for a playable ad under a network cap.', do:'Read the Defold guide and note its export targets and empty HTML5 build size, then set them against the 5 MB playable-ad caps listed in the soft-launch topic and estimate what your one-level ad’s art and sound could use.', min:20 },
        { kind:'engine', ref:'web', why:'Playable ads and instant games are HTML5, so a web build is the cheapest thing that can be both the ad and the prototype.', do:'Read the guide’s pipeline and deploy stages, then build a one-screen HTML5 prototype of your ad moment and note its total size against the 5 MB cap.', min:25 },
        { kind:'engine', ref:'cocos', why:'Cocos Creator publishes web and mini-game targets from one project, the route many casual games take into markets where the store is a super-app.', do:'Read the guide’s deploy stage, then write the command-line build with a saved config for one web target, and list what the WeChat mini game target adds.', min:20 },
        { kind:'game', ref:'subway-surfers', lens:'gameplay', why:'Subway Surfers shows its whole loop within seconds of the first run: the chase, three lanes and the first barrier, the material a playable ad is cut from.', do:'Read its first 30 seconds and gameplay lens, then storyboard a 15-second playable ad for your own game that shows only a moment a player really reaches, and mark the end-card moment.', min:20 },
        { kind:'platform', ref:'google-play', why:'An Android soft launch goes through Google Play’s test tracks first, and a new personal account must run a 12-tester, 14-day closed test before production.', do:'Read the Google Play guide and plan which track each soft-launch build goes to, whether the closed-test rule applies to your account, and how you would halt a staged rollout of a bad update.', min:15 },
        { kind:'tool', ref:'hypothesis', why:'Each soft-launch build should test one written guess, or the data will not tell you what changed.', do:'Write the hypothesis for your first soft-launch build and the metric that would disprove it.', min:15 }
      ],
      review:['business-model','onboarding'],
      check:{
        recall:[
          { q:'Why soft launch in a few countries first?', a:'To measure real retention, monetisation and install cost at small spend, and fix or kill the game before the expensive global marketing push.', ideas:['To measure real retention, monetisation and install cost at small spend', 'fix or kill the game before the expensive global marketing push'] },
          { q:'What makes a good playable ad?', a:'It is built from a real moment a player reaches in the current build, fits in one self-contained file under the network’s cap (5 MB at Unity, AppLovin, Google and Meta), routes its call to action through the network’s own click API, and is tested on strangers like the game itself.', ideas:['It is built from a real moment a player reaches in the current build', 'fits in one self-contained file under the network’s cap', 'routes its call to action through the network’s own click API', 'is tested on strangers like the game itself'] },
          { q:'Why write the kill criteria before the data arrives?', a:'Otherwise the team moves the bar once disappointing numbers come in. A hypothesis without a signal and a kill criterion is a hope, and soft launch is a real gate: Supercell has launched 5 hits and killed more than 30 games.' }
        ],
        build:'Write a soft-launch plan: markets, kill and scale gates for D1, D7 and D30 retention, install cost and LTV:CPI, the events to log, a storyboard for one playable ad, and one worked calculation (for example a CPI of $1.00 and an LTV of $1.40 give an LTV:CPI of 1.4, so say whether that clears your scale gate and what it does to your test budget).',
        skip:['Do you have numeric go and no-go gates for soft launch?','Can you list the funnel events your build logs?','Can you describe a playable ad’s limits and structure?']
      } },
    { id:'s5', t:'Live ops the team can sustain', level:'advanced',
      goal:'Keep the game fresh after launch with events and updates on a cadence that does not burn out the team.', hours:2.25,
      steps:[
        { kind:'topic', ref:'live-operations', why:'Release is a milestone, not a finish line: Subway Surfers has changed its city every three or four weeks since 2013 while the run underneath stays the same.', do:'Plan your first ninety days after launch: what the first update fixes and adds, one event per cycle with the content it needs, and how that content pays for itself.', min:25 },
        { kind:'topic', ref:'pm-liveops-cadence', why:'Teams burn out on cadence long before they burn out on any single feature, and store review adds days you do not control.', do:'Lay out three cycles (live, in QA, being authored), put store review, localisation and a buffer in as fixed blocks, and keep one quiet week per cycle.', min:20 },
        { kind:'topic', ref:'quests-and-events', why:'Events are time-bound quests, and an event that only adds a timer and fear of missing out is the trap the topic names.', do:'Design one limited-time event using only mechanics your game already has: write its situation, its decision and what it changes.', min:20 },
        { kind:'topic', ref:'server-liveops', why:'Balance and content shipped as versioned data turn a week-long release into a same-day change.', do:'List the values that must change without a client build on day one, such as level difficulty, prices and event dates, and check each against the client versions that will read it.', min:20 },
        { kind:'topic', ref:'learning-from-success', why:'Copies fail on what they leave out, so a borrowed pattern needs the context it worked in.', do:'Pick one mechanic from Candy Crush Saga or Subway Surfers you want to borrow, and write the context that made it work there and whether it holds for your player.', min:15 },
        { kind:'checklist', ref:'submit-mobile', why:'Every client update goes back through store review against the same checklist.', do:'Walk the mobile submission checklist against your next update and mark the items to re-check every release, such as the Data safety form and odds disclosure.', min:15 },
        { kind:'reflect', why:'A path ends by deciding what to do next.', do:'Write which stage of this path your game is weakest at today and the one change you will make this week.', min:10 },
        { kind:'game', ref:'forza-horizon-5', lens:'business', why:'Forza Horizon 5 renews one shared map every Thursday by changing its season and publishing a new playlist of events, so years of live ops come mostly from altering ground players already know.', do:'Read its business lens, then list which parts of your weekly update reuse existing content and which need new work; cut one new-work item by re-using a space in a changed state instead.', min:15 }
      ],
      review:['soft-launch-and-playable-ads','economy-and-resources'],
      check:{
        recall:[
          { q:'How can live content stay sustainable, as Subway Surfers’ World Tour shows?', a:'Since 2013 it has changed the visible city every three or four weeks while the lane-and-swipe run never changes, so the game stays current without touching the mechanic that makes it playable.' },
          { q:'What should be changeable without a client build at launch?', a:'Values you expect to tune often, such as level difficulty, prices and offers, and event dates and rewards, shipped as versioned data the installed clients can read, so changes do not wait on a store review.', ideas:['Values you expect to tune often, such as level difficulty, prices and offers, and event dates and rewards', 'shipped as versioned data the installed clients can read', 'changes do not wait on a store review'] },
          { q:'How do you know a live-ops cadence is sustainable?', a:'Measure planned against delivered items per cycle over a quarter and build the next calendar on the delivered number, with review, localisation and a buffer as fixed blocks and one quiet week per cycle.', ideas:['Measure planned against delivered items per cycle over a quarter', 'build the next calendar on the delivered number', 'with review, localisation and a buffer as fixed blocks and one quiet week per cycle'] }
        ],
        build:'Write a first-quarter live-ops plan: the event calendar, the remote-config values it uses, team days per event, and the metric each event should move.',
        skip:['Do you have an event calendar costed in team days?','Can you tune difficulty and prices without a store update?','Do your events reuse the existing core loop?']
      } }
  ]
});

PATH('game-skills-elsewhere', {
  t:'Take your game skills somewhere else', tag:'Name what transfers, pick a destination you can reach, and translate your CV and stories for it.',
  pick:'Move from games into another industry',
  track:'interview', level:'intermediate', hours:8,
  audience:'Experienced game developers in any discipline, laid off or choosing to leave, who want to move into another industry without starting over.',
  outcome:'You have a skill inventory stated as techniques and outcomes, one destination with named employers and a closing gap, a translated CV and one domain portfolio piece planned, and rehearsed answers for the interview formats and the why-leave-games question.',
  prereq:[], next:['ai-engineering-for-game-devs','technical-lead'],
  stages:[
    { id:'s1', t:'What transfers', level:'intermediate',
      goal:'Turn five pieces of game work into techniques and outcomes a non-games reader recognises, and list the gaps honestly.', hours:2,
      steps:[
        { kind:'topic', ref:'careers-transferable-skills', why:'Hiring managers outside games will often not know what a gameplay programmer or live-ops designer does, so if you cannot name the transferable part they will not guess it.', do:'Write down five things you did in the last two years that took the most skill, strip the game noun from each, and write the technique plus outcome that is left.', min:30 },
        { kind:'topic', ref:'careers-transferable-skills', tab:'interview', why:'The red flag these questions name is listing engines and genres and expecting the interviewer to infer the rest, which is easiest to catch when you say it out loud.', do:'Pick the interview question closest to your discipline (gameplay programmer, QA, designer or producer), answer it out loud in two minutes, then rewrite any sentence that named an engine or genre instead of a technique.', min:20 },
        { kind:'topic', ref:'lead-role', why:'If you led people, the transferable part is the decisions other people could make without asking you, not the code you shipped.', do:'Write two sentences describing your lead work as decisions and delegation, with no game vocabulary in them.', min:20 },
        { kind:'tool', ref:'prompt', why:'A model is useful for stripping the game noun from a bullet, and it will invent metrics you cannot defend in an interview unless the prompt forbids it.', do:'Build the strip-the-game-noun prompt for two of your items in the AI Prompt Generator: the items and a named industry as CONTEXT, only the numbers you can defend as EVIDENCE, and "add no numbers I did not give you" as CRITIQUE. Run it, then strike any number in the output you did not supply.', min:20 },
        { kind:'reflect', why:'Whether you are leaving because you want to or because you have to changes how much retraining is worth.', do:'Write which it is for you, then list your gaps against three real postings, marking each as learnable in a month, learnable in six, or a credential gate.', min:30 },
        { kind:'game', ref:'wii-sports', lens:'gameplay', why:'Wii Sports went from a game console into care homes and rehabilitation hospitals, which shows that designing for people who never play games is a skill other fields use.', do:'Read the signature and the gameplay lens, then write one line describing its design choice, automating everything the gesture cannot express, in the words of a health-tech or training product role.', min:10 }
      ],
      review:[],
      check:{
        recall:[
          { q:'What is the difference between listing an engine feature and stating a transferable skill?', a:'The skill survives changing the tool. "Unity DOTS" names a tool; "held 60 fps on a mid-range phone with 4,000 moving agents" names the technique and an outcome, which a recruiter outside games can read.' },
          { q:'Which game skills are sometimes valued more outside games than inside?', a:'Frame-budget engineering in automotive or simulation, test design in regulated software, and tech-art pipelines in film and industrial 3D. Separately, do not undervalue production: scheduling with unknown scope across disciplines is project management in its hardest form.' },
          { q:'What rarely transfers?', a:'Genre knowledge, engine-specific trivia, the assumption that the user wants to be entertained, and passion for the medium, which outside games can read as a sign you will go back at the first chance.' }
        ],
        build:'Write the five-line skill inventory as technique plus outcome, and the gap list classified by how long each gap takes to close.',
        skip:['Can you state five of your skills with no engine, genre or game noun in them?','Do you have a gap list checked against real postings rather than your own guess?','Can you say whether you are leaving by choice or by necessity, and what that means for retraining?','Can you tell which of your skills are tool-specific and which are the underlying technique?']
      } },
    { id:'s2', t:'Where people go', level:'intermediate',
      goal:'Choose one destination with named employers, live postings and a stated price of entry, including the AI tooling market as an option.', hours:2,
      steps:[
        { kind:'topic', ref:'careers-destinations', why:'Job boards do not label a role good for ex-game developers, and each destination has its own gates: domain knowledge, safety standards, degrees or clearances.', do:'Pick two destinations from the map, and for each write five named employers, the price of entry, and how exposed the field is to the same cycles as games.', min:30 },
        { kind:'topic', ref:'careers-ai-tooling-market', why:'AI tooling is arguably one of the few areas still hiring engineers in numbers, and it is an unstable market that rises and falls with funding.', do:'Pick one role family (applied, evaluation, developer tools or forward-deployed) and read ten postings for it, listing the requirements that keep coming up.', min:25 },
        { kind:'topic', ref:'careers-ai-tooling-market', tab:'interview', why:'What an eval is sits at the junior end of these questions, and its playtest-rubric follow-up is an honest bridge from game work.', do:'Answer what an eval is and how it is like a playtest rubric out loud, in under a minute.', min:15 },
        { kind:'topic', ref:'craft-engineer-in-the-ai-era', why:'If you are heading into AI tooling or engineering, judgement, specification, verification and architecture are what the job now rewards, not typing speed.', do:'For each of the four skills, write one piece of game work that is evidence you already have it, and mark the weakest one.', min:25 },
        { kind:'tool', ref:'hypothesis', why:'A career move is a bet, and stating it as a hypothesis with a kill criterion stops you applying blind for months.', do:'Fill the builder with hiring managers in your chosen field as the player and shortlisting you as the behaviour, the reason from your skill inventory, a signal such as ten live postings you meet most of, and a kill criterion that would make you switch to your other destination.', min:25 },
        { kind:'game', ref:'farming-simulator', lens:'business', why:'Farming Simulator is a working bridge between games and agriculture: an established studio building real-time 3D around licensed real machinery.', do:'Read the business lens, then list three skills from your own work that GIANTS’ kind of product would need, such as simulation, vehicle handling or tools for modders.', min:12 }
      ],
      review:['careers-transferable-skills'],
      check:{
        recall:[
          { q:'Why is a vendor case study weak evidence of a hiring market?', a:'It proves the work exists, not that many people are hired for it; a famous project may have employed a few dozen specialists. Cross-check with live postings and headcounts, and note if the customer later changed tools, as ILM did with Helios for Mandalorian season two.' },
          { q:'What is the trade between an engine-adjacent destination and backend or data?', a:'Adjacent real-time fields such as virtual production, digital twins and HMI value engine skills directly but are partly exposed to the same vendors and cycles as games. Backend, data and product are larger and more stable, and there you compete on general skill.' },
          { q:'How do you judge whether an AI tooling employer is safe?', a:'Dated funding and runway from the company or its investors, paying customers, spending against revenue, and whether the product survives the model provider shipping the same feature.', ideas:['Dated funding and runway from the company or its investors', 'paying customers', 'spending against revenue', 'whether the product survives the model provider shipping the same feature'] }
        ],
        build:'Write the destination hypothesis with its kill criterion, backed by five named employers and your requirement list from ten postings.',
        skip:['Can you name five real employers in your target field with live postings?','Do you know the credential or standard gates for your destination?','Can you say how exposed your destination is to the same funding cycle as games?','Can you explain what an eval is and how it resembles a playtest rubric?']
      } },
    { id:'s3', t:'Repositioning your CV and portfolio', level:'intermediate',
      goal:'Rewrite the CV in the target field’s words and plan one portfolio piece built around that field’s problem.', hours:2,
      steps:[
        { kind:'topic', ref:'careers-repositioning', why:'Ladders measured an average initial CV screen of 7.4 seconds, so an untranslated game term can cost you the whole read.', do:'Build a translation table of every game term on your CV, then rewrite each bullet as problem, action and result, keeping only numbers you can defend and saying whose they are.', min:30 },
        { kind:'topic', ref:'metrics-and-success', why:'Outcome bullets need the same habit as product metrics: a measure you can attribute to a change you made.', do:'For your three strongest bullets, write what was measured before and after, and cut any bullet where you cannot.', min:20 },
        { kind:'topic', ref:'lead-hiring', why:'Seeing hiring from the other side of the table shows what evidence a screener trusts and what they skim past.', do:'Read your rewritten CV as the hiring manager designing a loop for the target role, and write the one question each bullet would make you ask.', min:25 },
        { kind:'tool', ref:'prompt', why:'A portfolio piece costs about two weeks, so choose it against what the target field’s postings ask for, not what is most fun to build.', do:'Build the portfolio-piece prompt in the AI Prompt Generator: your skills as CONTEXT, the recurring requirements from your ten postings as EVIDENCE, two weeks and the tools you have as CONSTRAINTS. Of the three projects it proposes, keep the one that covers the most posting requirements and that you could explain line by line in an interview.', min:20 },
        { kind:'topic', ref:'craft-verification-as-the-job', why:'A portfolio piece that shows how you know it works, with checks and measurements, proves more than one that only looks finished.', do:'Write the checks your chosen piece will ship with, such as a frame budget, a load benchmark or an eval set, and what each would catch failing.', min:15 },
        { kind:'topic', ref:'careers-repositioning', tab:'interview', why:'The team-effort question and the hide-your-background question are where a repositioned CV gets tested.', do:'Answer how you put a team achievement on your CV and whether you hide your game background, out loud, then check that each answer names your own part.', min:15 }
      ],
      review:['careers-destinations'],
      check:{
        recall:[
          { q:'How would you translate "vertical slice" and "live ops" for a non-games reader?', a:'A vertical slice is a production-quality prototype that validated scope and cost; live ops is running a weekly release and experiment cadence against retention and revenue metrics.', ideas:['A vertical slice is a production-quality prototype that validated scope and cost', 'live ops is running a weekly release and experiment cadence against retention and revenue metrics'] },
          { q:'What should a portfolio case study cover, following the Nielsen Norman Group checklist?', a:'The problem, your role and who you worked with, how you reached the solution, the outcome, the challenges and discarded options, the effect on users and the business, and what you learned; keep three to five pieces, not everything.', ideas:['The problem, your role and who you worked with', 'how you reached the solution, the outcome, the challenges and discarded options', 'the effect on users and the business, and what you learned', 'keep three to five pieces, not everything'] },
          { q:'Should you hide your game background?', a:'No. Hiding it can make the gap look worse. Frame it as craft, scale and delivery under pressure, and put it below the domain piece that fits the target.' }
        ],
        build:'Produce the translated CV and a one-page plan for the chosen portfolio piece, including its checks and what the case study will say.',
        skip:['Has someone outside games read your CV for thirty seconds and named the role you want, not games?','Is every number on your CV one you can explain and attribute?','Do you have at least one portfolio piece that solves a problem from the target field?','Can you say what checks your portfolio piece ships with?']
      } },
    { id:'s4', t:'Interviewing outside games', level:'advanced',
      goal:'Rehearse the formats you will meet, build the story bank, and settle a calm answer to why you are leaving games.', hours:2,
      steps:[
        { kind:'topic', ref:'careers-interviewing-outside-games', why:'Experienced developers fail system-design and structured behavioural rounds for lack of practice, not lack of ability.', do:'Ask or look up the loop for one target company, then build six stories from your game work in STAR form, each with your own action and a number.', min:30 },
        { kind:'topic', ref:'careers-interviewing-outside-games', tab:'interview', why:'The leaderboard design question lets you use game knowledge honestly while being scored on requests, storage, consistency and scale.', do:'Answer the leaderboard design question out loud with a timer, covering requirements, load, the data model, the hot key and what breaks first.', min:25 },
        { kind:'topic', ref:'team-and-collaboration', why:'Behavioural rounds ask about conflict and collaboration, and interviewers score the "I", not the "we".', do:'Write one story about a disagreement across disciplines, then rewrite every "we" as what you personally decided or did.', min:15 },
        { kind:'tool', ref:'delegate', why:'A model is a good mock interviewer and sparring partner, and a poor source for a company’s current loop, its values or your own stories.', do:'In the AI Delegation Planner, list your prep tasks and mark them: AI for the behavioural mock and system-design sparring, Human for writing the stories, and the evidence-required option for the loop and values, which only the recruiter or the company’s own site can supply. Then run one mock with the values pasted from that site.', min:15 },
        { kind:'topic', ref:'careers-the-farmer-answered', why:'The half-joke about farming often stands for wanting work that is physical, local and finished at the end of the day, and it deserves a real answer before you commit to any move.', do:'Read the two paths, staying in software (agritech or farm simulation) and leaving tech for small-scale farming, and write which of them, if either, speaks to what you actually want from the next job.', min:20 },
        { kind:'reflect', why:'"Why are you leaving games?" can lose an offer the technical rounds already won if the answer sounds bitter.', do:'Write your two-sentence answer: one on what you are moving towards, one on what you bring. If you were laid off, say so plainly, then read it to someone outside games.', min:15 }
      ],
      review:['careers-repositioning','lead-hiring'],
      check:{
        recall:[
          { q:'What goes wrong when a game engineer answers a system-design round?', a:'They describe an engine architecture, an update loop and an entity system, instead of starting from requirements and load, drawing the data path, and naming the bottleneck and failure mode.', ideas:['They describe an engine architecture, an update loop and an entity system', 'instead of starting from requirements and load, drawing the data path, and naming the bottleneck and failure mode'] },
          { q:'What makes a strong answer to "why are you leaving games"?', a:'A short, forward-looking answer naming what the new work offers and what you bring, not what the old work lacked; if laid off, say so plainly, with no complaints about crunch or a former studio.', ideas:['A short, forward-looking answer naming what the new work offers and what you bring, not what the old work lacked', 'if laid off, say so plainly, with no complaints about crunch or a former studio'] },
          { q:'How should you treat an open-ended take-home?', a:'Confirm the time limit and stay near it, ship a working core with a README on how to run it and the trade-offs, and decline or negotiate one that looks like real product work or comes with no feedback.', ideas:['Confirm the time limit and stay near it', 'ship a working core with a README on how to run it and the trade-offs', 'decline or negotiate one that looks like real product work or comes with no feedback'] },
          { q:'What does USDA data say about leaving tech for small-scale farming?', a:'The median farm household loses money on farming and depends on off-farm income, so work a season first, budget for several years of farm losses, and keep an income.', ideas:['The median farm household loses money on farming and depends on off-farm income', 'work a season first', 'budget for several years of farm losses', 'keep an income'] }
        ],
        build:'Write the six-story bank mapped to one company’s published values, a timed leaderboard design answer, and your two-sentence why-leave-games answer.',
        skip:['Do you have six rehearsed STAR stories, each with your own action and a number?','Can you run a 45-minute system-design answer from requirements to failure mode?','Do you have a two-sentence why-leave-games answer that a friend outside games did not hear as a complaint?','Do you know the rounds and formats of the loop at your target company?']
      } }
  ]
});
