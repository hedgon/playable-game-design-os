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

// A topic's `rel` or a loop step's `top` may name one of these instead of a
// topic: [route, label]. The app adds project-part links at runtime.
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
