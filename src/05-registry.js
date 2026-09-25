/* =====================================================================
   REGISTRY
   The fixed catalogue of tools, diagnostics and in-app view links. It is
   data rather than UI code because learning paths, the validator, the
   inventory and the layout checker all resolve ids against it, and each of
   them used to keep its own copy.
   ===================================================================== */

// [id, title, one-line pitch]. A path's 'tool' step refs an id; the Build
// view lists them in this order.
const TOOLS = [
  ['idea','Idea Shaper','Read a market for an unserved want, then shape one core idea to fill it'],
  ['dissect','Reference Dissection','Is my idea actually good? Cross-reference it against games that succeeded'],
  ['loop','Game Loop Builder','Action → Decision → Feedback → Reward → New situation, with a weak-link check'],
  ['canvas','Core Experience Canvas','Player, fantasy, emotions, goals, what it is not'],
  ['ladder','Behavior Ladder','From a feature idea to the behavior and back to the smallest mechanic'],
  ['feature','Should We Build This?','Nine questions → BUILD / PROTOTYPE FIRST / SIMPLIFY / DEFER / REMOVE'],
  ['hypothesis','Playtest Hypothesis Builder','We believe… we will know when… we will kill it if…'],
  ['delegate','AI Delegation Planner','Human, AI, both, or player evidence required'],
  ['sysmap','System Relationship Map','Nodes and typed edges. Collision questions generated'],
  ['prompt','AI Prompt Generator','CONTEXT + INTENT + CONSTRAINTS + EVIDENCE + ROLE + TASK + OUTPUT + CRITIQUE'],
  ['gameai','In-game AI Technique Chooser','Decision shape + team + budget → primary technique, trade-offs, debug view']
];

// [id, tab label, full title]. The Diagnose view's tabs after "Design
// smells", in this order; a path's 'diagnostic' step refs an id.
const DIAGNOSTICS = [
  ['fun','Fun diagnostic','Fun diagnostic'],
  ['loop','Core loop','Core loop diagnostic'],
  ['unfair','Unfairness','Unfairness diagnostic'],
  ['depth','Depth vs complexity','Depth vs complexity'],
  ['content','Content or mechanic?','Content or mechanic?']
];

// [id, title, goal]. The map shows one lens at a time: the design operating
// system, or the engineering and career material around it. Every domain
// names its lens; the goal labels the centre of that lens's map.
const LENSES = [
  ['design','Design','Make something people want to play'],
  ['eng','Engineering & Career','Build it, ship it, lead the team']
];

// A topic's `rel` or a loop step's `top` may name one of these instead of a
// topic: [route, label]. The app adds project-part links at runtime.
// Every page a reader can land on: search finds them as pages, the All pages
// index lists them, and the empty search box offers the common ones.
// [route, title, section, purpose, synonyms]. validate.js checks each route
// is one the router handles.
// The screen, drawn for the guide page: where each part of the layout is.
const GUIDE_LAYOUT = { kind:'screen', title:'Where things are on a wide screen', aspect:'16:9',
  regions:[
    { t:'Header', g:'list', d:'the seven sections, search, All pages, help and theme', x:0, y:0, w:1, h:0.1 },
    { t:'Index', g:'list', d:'every domain and topic; a lens switch at the top', x:0, y:0.1, w:0.2, h:0.9 },
    { t:'The map', g:'map', kind:'world', d:'topics as a mind map; on other pages, the page’s own diagram', x:0.2, y:0.1, w:0.43, h:0.9 },
    { t:'Your path', g:'button', d:'when you follow a path: where you are and the next step', x:0.64, y:0.1, w:0.36, h:0.12 },
    { t:'The page', g:'text', d:'what you are reading: a topic, a game, a guide or a tool', x:0.64, y:0.22, w:0.36, h:0.78 }
  ],
  note:'On a phone the index and the page open as drawers over the map; the close button shuts the top one.' };
const PAGES = [
  ['#/paths', 'Learning paths', 'Paths', 'Guided sequences from beginner to expert, with a chooser that suggests one.', ['courses', 'curriculum', 'tutorial', 'learn', 'start here', 'roadmap']],
  ['#/review', 'Review queue', 'Paths', 'Questions you marked, brought back on a spaced schedule.', ['spaced repetition', 'flashcards', 'review later', 'practice', 'quiz']],
  ['#/map', 'Map', 'Map', 'The mind map of every domain and topic.', ['mind map', 'overview', 'home', 'topics']],
  ['#/explore', 'Topic list', 'Map', 'Every domain and topic as a list.', ['list', 'all topics', 'domains', 'browse', 'contents']],
  ['#/concepts', 'Concept index', 'Map', 'Topics ranked by how many other topics reference them.', ['concepts', 'glossary', 'terms', 'vocabulary']],
  ['#/games', 'Library', 'Library', 'The collections: reference games, platforms, checklists, prompts and sources.', ['collections', 'resources']],
  ['#/games', 'Reference games', 'Library', 'Successful games taken apart with one template, with loop and screen schematics.', ['game library', 'examples', 'games', 'reference', 'analysis', 'case studies', 'jrpg', 'teardown']],
  ['#/platforms', 'Platforms', 'Library', 'How to get onto each store, console and UGC platform, from access to release.', ['stores', 'publishing', 'steam', 'console', 'roblox', 'release', 'certification', 'shipping']],
  ['#/guide', 'How to use this site', 'Start here', 'What each section is for, the fastest route for you, and where things are on screen.', ['help', 'guide', 'how to use', 'getting started', 'tutorial', 'start here', 'lost', 'features', 'manual']],
  ['#/engines', 'Engines and tools', 'Library', 'Each engine and tool: how it is built, the editor, the pipeline, deploying, cost, AI and interview questions.', ['engines', 'unity', 'unreal', 'godot', 'gamemaker', 'three.js', 'blender', 'web', 'html5', 'deploy', 'build']],
  ['#/checklists', 'Checklists', 'Library', 'Practical reviews whose ticks are saved.', ['checklist', 'pre-submission', 'audit']],
  ['#/prompts', 'Prompts', 'Library', 'Reusable AI prompt templates built on the formula.', ['prompt library', 'templates', 'ai prompts']],
  ['#/sources', 'Sources and lineage', 'Library', 'The frameworks the guide draws on, and how solid each one is.', ['references', 'bibliography', 'citations', 'research', 'credits']],
  ['#/lab', 'Idea Lab', 'Make', 'Shape an idea step by step into an Idea Card.', ['ideation', 'brainstorm', 'new idea', 'concept']],
  ['#/build', 'Build tools', 'Make', 'Canvases and tools that export Markdown.', ['tools', 'canvas', 'worksheet', 'templates']],
  ['#/diagnose', 'Diagnose', 'Diagnose', 'Start from a symptom you see in players: causes, experiments, a prompt.', ['problem', 'fix', 'troubleshoot', 'debug design']],
  ['#/diagnose/smells', 'Design smells', 'Diagnose', 'Thirty-odd symptoms with their likely causes and experiments.', ['smells', 'symptoms', 'issues']],
  ['#/playtest', 'Playtest', 'Diagnose', 'The playtest question bank and methods.', ['testing', 'user testing', 'questions', 'observation']],
  ['#/ai', 'AI Workflow', 'AI Workflow', 'How to delegate design work to AI without handing it the decisions.', ['ai', 'llm', 'chatgpt', 'claude', 'workflow']],
  ['#/ai/loop', 'The 12-step AI loop', 'AI Workflow', 'The design loop with who does each step, human or AI.', ['process', 'steps']],
  ['#/ai/ladder', 'Prompt ladder', 'AI Workflow', 'How far up the ladder of delegation each stage can go.', ['delegation', 'stages']],
  ['#/ai/philosophy', 'Bottleneck shift', 'AI Workflow', 'Why cheap generation moves the bottleneck to judgement.', ['philosophy', 'bottleneck']],
  ['#/ai/roles', 'AI roles', 'AI Workflow', 'Role cards: what to ask an AI to be, and what not.', ['roles', 'personas']],
  ['#/ai/matrix', 'Responsibility matrix', 'AI Workflow', 'Who owns each decision, human or AI.', ['raci', 'ownership', 'matrix']],
  ['#/ai/framework', 'Prompting framework', 'AI Workflow', 'The eight-part formula behind every prompt here.', ['formula', 'prompting']],
  ['#/ai/failures', 'When AI makes it worse', 'AI Workflow', 'Failure modes of AI-assisted design and their fixes.', ['failures', 'risks', 'mistakes']],
  ['#/experience', 'Projects', 'Projects', 'Anonymised shipped projects: architecture, decisions, workflows and stories.', ['portfolio', 'experience', 'case study', 'star stories']],
  ['#/index', 'All pages', 'Help', 'Every page in the guide, by section.', ['sitemap', 'index', 'directory', 'menu', 'navigation']]
];
const VIEW_LINKS = {
  'playtest-view':['#/playtest','Playtest view: question bank and hypothesis builder'],
  'ai-roles-view':['#/ai/roles','AI Workflow: interactive role cards'],
  'matrix-view':['#/ai/matrix','AI Workflow: responsibility matrix'],
  'loop-view':['#/ai/loop','AI Workflow: the 12-step loop'],
  'ai-failures-view':['#/ai/failures','AI Workflow: when AI makes your game worse'],
  'checklists-view':['#/checklists','Checklists view'],
  'prompt-library':['#/prompts','Prompt library'],
  'should-we-build-this':['#/build/feature','Build: Should we build this? decision tree']
};
