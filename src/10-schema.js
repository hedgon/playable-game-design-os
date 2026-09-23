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
 * @property {Interview} [iv]       attached by INTERVIEW()
 */
/** @typedef {{n: string, how: string, fit: string, cost: string, alt: string}} Technique */
/** @typedef {{term: string, api: string[], snippet: string, pitfall: string, map: string}} EngineView */
/** @typedef {{godot: EngineView, unity: EngineView, note?: string}} Engine */
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
