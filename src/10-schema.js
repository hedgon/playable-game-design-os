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
   ===================================================================== */
const DOMAINS = [];
const SECTION_META = [
  ['what','A','What is it?'],['why','B','Why does it matter?'],['think','C','How should a human think about it?'],
  ['how','D','How do I actually do it?'],['ai','E','What should AI do (and not do)?'],['prompts','F','How should I prompt AI?'],
  ['verify','G','How do I verify AI output?'],['test','H','What should I playtest?']
];
const TOPICS = {};
function T(id, o){ o.id = id; TOPICS[id] = o; }
/* Engine and interview views, attached after the topics are defined (same
   pattern as TECH). eng: how this concept is built in Godot 4 and Unity 6.
   iv: the questions an interviewer asks about it, grouped by seniority.
     eng = { godot:{term,api:[],snippet,pitfall,map}, unity:{...}, note? }
     iv  = { junior:[{q,a,follow,red}], mid:[...], senior:[...] } */
function ENGINE(id, o){ const t = TOPICS[id]; if(!t) throw new Error('ENGINE: unknown topic '+id); t.eng = o; }
function INTERVIEW(id, o){ const t = TOPICS[id]; if(!t) throw new Error('INTERVIEW: unknown topic '+id); t.iv = o; }

/* =====================================================================
   TECHNIQUE BREAKDOWNS
   Adds the optional "Techniques to compare" section to existing topics
   where there is a real implementation decision: which technique, how it
   works, when it fits, what it costs. Attached after the topics are
   defined so the topic files stay focused on design intent.
   ===================================================================== */
function TECH(id, arr){
  const t = TOPICS[id];
  if(!t) throw new Error('TECH: unknown topic ' + id);
  t.tech = arr;
}
