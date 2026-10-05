/* =====================================================================
   CONTENT MODEL
   DOMAINS: the areas on the map. Each domain file (20-38) pushes its own
   entry, whose links say in one line why it connects to another domain;
   those lines power the map edges. File order is map order.
   TOPICS: every node has the same 8-part practical structure:
     what / why / think / how / ai / prompts / verify / test (+ related)
   A domain file defines each topic with T(), then attaches that topic's
   optional techniques (TECH), engine views (ENGINE) and interview
   (INTERVIEW) right after it, so one topic reads top to bottom in one place.
   The typedefs below are the same contract validate.js enforces; with
   // @ts-check at the top of a data file an editor flags a missing or
   misspelled field as you type, and `npx -p typescript tsc -p jsconfig.json`
   checks every data file at once.
   ===================================================================== */
/**
 * @typedef {object} Domain
 * @property {string} id
 * @property {'design'|'eng'} lens   which map lens shows it (LENSES)
 * @property {'required'|'optional'|'none'} [eng]  Godot and Unity views on its topics (default required)
 * @property {string} t
 * @property {string} short   one line under the title
 * @property {string} color   a --d-<id> CSS variable
 * @property {string} sum
 * @property {Array<[string, string]>} links   [domain id, why this connects]
 * @property {Record<string, string>} [titles] section titles by key, overriding SECTION_META
 * @property {string[]} [topics]               topic ids, filled in by the app
 */
/**
 * @typedef {object} Topic
 * @property {string} [id]   set by T()
 * @property {string} d      domain id
 * @property {string} t      title
 * @property {string} tag    one-line pitch
 * @property {string} what
 * @property {string[]} why
 * @property {{q: string[], trade: string[], traps: string[], good: string[], bad: string[]}} think
 * @property {string[]} how
 * @property {{yes: string[], no: string[]}} ai
 * @property {Array<{l: string, p: string}>} prompts
 * @property {string[]} verify
 * @property {string[]} test
 * @property {Array<[string, string]>} rel   [topic id or VIEW_LINKS id, why it connects]
 * @property {Technique[]} [tech]   attached by TECH()
 * @property {Engine} [eng]         attached by ENGINE()
 * @property {GoView} [go]          attached by GO(); backend, server and infra topics only
 * @property {Interview} [iv]       attached by INTERVIEW()
 * @property {Fact[]} [facts]       attached by FACTS()
 * @property {Worked[]} [worked]    attached by WORKED()
 * @property {Diagram} [diagram]    attached by DIAGRAM()
 * @property {Explainer} [explainer]   attached by EXPLAINER()
 * @property {Clip} [clip]    attached by CLIP()
 */
/**
 * A diagram drawn from data by 87-diagrams.js. `kind` picks the shape:
 * loop {steps}, stack {layers, taper?, arrow?}, matrix {rows, cols, cells},
 * quad {x, y, points, q?}, curve {x, y, series, band?, beats?, alt},
 * economy {nodes, edges}, state {states, edges, start}, screen {aspect,
 * regions}, flow {steps, edges}. `note` is an optional caption (a source).
 * @typedef {{kind: string, title: string, note?: string, [k: string]: any}} Diagram
 */
/**
 * A rule, ruling or number that changes. `asOf` is the day it was last
 * checked against `src`; the validator warns once it is a year old.
 * @typedef {{claim: string, asOf: string, src: string}} Fact
 */
/** @typedef {{n: string, how: string, fit: string, cost: string, alt: string}} Technique */
/** @typedef {{term: string, api: string[], snippet: string, pitfall: string, map: string}} EngineView */
/** @typedef {{godot: EngineView, unity: EngineView, note?: string}} Engine */
/** @typedef {{api: string[], snippet: string, pitfall: string}} GoView  snippet is a whole Go file */
/** @typedef {{q: string, a: string, follow: string, red: string}} Question */
/** @typedef {{junior: Question[], mid: Question[], senior: Question[]}} Interview */

/** @type {Domain[]} */
const DOMAINS = [];
/** @type {Array<[string, string, string]>} */
const SECTION_META = [
  ['what','A','What is it?'],['why','B','Why does it matter?'],['think','C','How should a human think about it?'],
  ['how','D','How do I actually do it?'],['ai','E','What should AI do (and not do)?'],['prompts','F','How should I prompt AI?'],
  ['verify','G','How do I verify AI output?'],['test','H','What should I playtest?']
];
/** @type {Record<string, Topic>} */
const TOPICS = {};
/** @param {string} id @param {Topic} o */
function T(id, o){ o.id = id; TOPICS[id] = o; }
/* Engine and interview views, attached after the topics are defined (same
   pattern as TECH). eng: how this concept is built in Godot 4 and Unity 6.
   iv: the questions an interviewer asks about it, grouped by seniority.
     eng = { godot:{term,api:[],snippet,pitfall,map}, unity:{...}, note? }
     iv  = { junior:[{q,a,follow,red}], mid:[...], senior:[...] } */
/** @param {string} id @param {Engine} o */
function ENGINE(id, o){ const t = TOPICS[id]; if(!t) throw new Error('ENGINE: unknown topic '+id); t.eng = o; }
/** @param {string} id @param {GoView} o */
function GO(id, o){ const t = TOPICS[id]; if(!t) throw new Error('GO: unknown topic '+id); t.go = o; }
/** @param {string} id @param {Interview} o */
function INTERVIEW(id, o){ const t = TOPICS[id]; if(!t) throw new Error('INTERVIEW: unknown topic '+id); t.iv = o; }

/* =====================================================================
   TECHNIQUE BREAKDOWNS
   Adds the optional "Techniques to compare" section to existing topics
   where there is a real implementation decision: which technique, how it
   works, when it fits, what it costs. Attached after the topics are
   defined so the topic files stay focused on design intent.
   ===================================================================== */
/** @param {string} id @param {Technique[]} arr */
function TECH(id, arr){
  const t = TOPICS[id];
  if(!t) throw new Error('TECH: unknown topic ' + id);
  t.tech = arr;
}

/* Dated facts: store rules, laws and rulings a topic depends on. Principles
   stay in the eight parts; anything that can change by next year goes here
   with the date it was checked and its source. */
/** @param {string} id @param {Fact[]} arr */
function FACTS(id, arr){
  const t = TOPICS[id];
  if(!t) throw new Error('FACTS: unknown topic ' + id);
  t.facts = arr;
}

/* A topic's diagram, shown at the top of its Overview. Shape rules are in
   validate.js; whether it fits a phone is checked by check-layout.js. */
/** @param {string} id @param {Diagram} spec */
function DIAGRAM(id, spec){
  const t = TOPICS[id];
  if(!t) throw new Error('DIAGRAM: unknown topic ' + id);
  t.diagram = spec;
}

/* A topic's stepped explainer, for an idea that is a change over time (a packet
   stream, a frame being built, power rising across releases): 3 to 8 frames,
   each a caption `t`, an optional longer `d`, and `spec`, a diagram of any
   DIAGRAM kind drawn for that moment. The reader steps through it (nothing
   plays by itself); "Diagram as text" lists every frame. Shape rules are in
   validate.js; every frame is laid out by check-layout.js. */
/**
 * @typedef {{kind: 'explainer', title: string, note?: string,
 *   frames: Array<{t: string, d?: string, spec: Omit<Diagram, 'title'> & {title?: string}}>}} Explainer
 */
/** @param {string} id @param {Explainer} spec */
function EXPLAINER(id, spec){
  const t = TOPICS[id];
  if(!t) throw new Error('EXPLAINER: unknown topic ' + id);
  t.explainer = spec;
}

/* A short silent clip for an idea whose point is motion (how a fixed step
   moves, how a hit lands), rendered from code by src/clips-make.js into
   assets/clips/. It never plays by itself; `text` says in words what it
   shows, for anyone who cannot or does not play it. */
/** @typedef {{src: string, poster: string, title: string, text: string}} Clip */
/** @param {string} id @param {Clip} c */
function CLIP(id, c){
  const t = TOPICS[id];
  if(!t) throw new Error('CLIP: unknown topic ' + id);
  t.clip = c;
}

/* Worked examples: a table or a filled document a topic shows under "Worked
   examples" on its Overview, each with a download. `kind:'table'` carries
   columns [{h, unit?}], rows (arrays of strings or numbers, one per column),
   optional formulas [{col, f}] and a CSV file name; `kind:'doc'` carries
   sections [{h, body}] and a Markdown file name. Both carry id (unique across
   the site), t, intro, note (where the numbers or text come from), try (2 or
   more questions) and file. Shape rules are in validate.js. */
/**
 * @typedef {{id: string, t: string, intro: string, note: string, try: string[], file: string,
 *   kind: 'table'|'doc', columns?: Array<{h: string, unit?: string}>, rows?: Array<Array<string|number>>,
 *   formulas?: Array<{col: string, f: string}>, sections?: Array<{h: string, body: string}>}} Worked
 */
/** @param {string} id @param {Worked} w */
function WORKED(id, w){
  const t = TOPICS[id];
  if(!t) throw new Error('WORKED: unknown topic ' + id);
  (t.worked = t.worked || []).push(w);
}
