/* =====================================================================
   PERSISTENT MIND MAP (centre) + INDEX (left) + CONTENT (right)
   The map is always on screen. It is a horizontal collapsible tidy tree,
   not a circle, so it grows by stacking and panning rather than shrinking.
   Below 700px the same tree is drawn as an expandable outline instead of a canvas.
   Routes: #/map  #/map/d/<domain>  #/map/t/<topic>  #/map/s/<smell>  #/map/home
   (home shows the lens the reader last chose; a domain or topic route sets its own)
   ===================================================================== */
(function(A){
'use strict';
const { $, $$, app, esc, DOM, TOPIC_LIST, store, seen, markSeen, go, route, isNarrow, setView, crumbs, domChip, list,
  chainHTML, practice, setTopicTab, topicBody, smellsView, pathProgress, renderPaths, showPathStep, closeModals, openModal } = A;
const START_PATHS = [
  ['#/paths','I want to learn step by step','Pick a path and follow one visible next step at a time, with a soft checkpoint per stage.',''],
  ['#/lab','I want to shape an idea','Observe a signal, find the tension, turn it into a design question, design mechanisms and test them.',''],
  ['#/build/dissect','I have an idea and want to know if it is good','Cross-reference it against games that already won the audience you want.','var(--accent2)'],
  ['#/build/ladder','I have a feature idea','Climb from the feature to the behaviour, then decide whether to build it.','var(--d-core)'],
  ['#/diagnose','I have a design problem','Start from the symptom: likely causes, experiments and a prompt.','var(--bad)']
];
function startPathsHTML(){
  return START_PATHS.map(([href, b, s, c]) => `<button class="path" data-href="${href}"${c?` style="border-left-color:${c}"`:''}><b>${esc(b)}</b><span>${esc(s)}</span></button>`).join('');
}
const SYMPTOMS = [
  ['I do not have an idea','no-idea'],['Players do not know what to do','dont-know-what-to-do'],['The game feels repetitive','repetitive'],
  ['Players use only one build','one-build'],['They enjoy it but do not return','fun-but-no-return'],['Progression is just numbers','meaningless-progression'],
  ['Combat feels floaty','floaty-combat'],['Players say it is unfair','unfair'],['Too many features, not better','features-not-better'],['AI keeps giving generic ideas','ai-ideas-none-right']
];
function symptomsHTML(){ return `<div class="symptoms">${SYMPTOMS.map(([s,id]) => `<button class="symptom" data-href="#/smell/${id}">${esc(s)}</button>`).join('')}<a class="symptom more" href="#/diagnose/smells">All ${SMELLS.length} smells →</a></div>`; }
function openStart(){ const el = $('#startPaths'); if(el) el.innerHTML = startPathsHTML(); openModal('startModal'); }
{ const sc = $('#startClose'); if(sc) sc.onclick = () => closeModals(); }

/* ---- persisted state: checked on the way in, written on the way out ----
   Three stores share one shape: mapState (the guide), projMap.<case> and
   pathMap.<path>. Anything the data no longer knows (a renamed topic, a
   removed project, a hand-edited value) is dropped when the state is loaded,
   and the offsets are capped, so a stale store cannot grow or misdraw the map.
   `vb` is the camera the reader left a branch with. It is written only while
   a branch is open: the overview (no branch open) is always framed afresh,
   so a camera saved there would never be read. */
const GROUP_IDS = /^(rel|game|smell|tool|guide|checklist|prompt|path|part|lens:[\w-]+)$/;
const OFF_CAP = 150;
const isNum = v => typeof v === 'number' && isFinite(v);
function cleanCamera(vb){ return vb && typeof vb === 'object' && [vb.x, vb.y, vb.w, vb.h, vb.sw, vb.sh].every(isNum) && vb.w > 0 && vb.h > 0 && vb.sw > 0 ? vb : null; }
// `keyOk` says whether a node key still names something the data has.
function cleanOffsets(off, keyOk){
  const out = {}; let n = 0;
  if(off && typeof off === 'object') for(const k of Object.keys(off)){
    const o = off[k];
    if(n >= OFF_CAP || !keyOk(k) || !o || !isNum(o.x) || !isNum(o.y)) continue;
    out[k] = { x: Math.max(-5000, Math.min(5000, o.x)), y: Math.max(-5000, Math.min(5000, o.y)) }; n++;
  }
  return out;
}
const leafKeyOk = k => /^l:/.test(k) && k.length <= 120;
const guideKeyOk = k => k === 'c' || (/^d:/.test(k) && !!DOM[k.slice(2)]) || (/^t:/.test(k) && !!TOPICS[k.slice(2)]) || (/^g:/.test(k) && GROUP_IDS.test(k.slice(2))) || leafKeyOk(k);
function cleanGuideState(raw){
  const s = Object.assign({ dom:null, topic:null, smell:null, vb:null, lens:LENSES[0][0], grp:{}, off:{} }, raw && typeof raw === 'object' ? raw : {});
  if(!LENSES.some(l => l[0] === s.lens)) s.lens = LENSES[0][0];
  if(!DOM[s.dom]) s.dom = null;
  if(!TOPICS[s.topic]) s.topic = null;
  if(!SMELLS.some(x => x.id === s.smell)) s.smell = null;
  s.vb = cleanCamera(s.vb);
  s.grp = Object.fromEntries(Object.entries(s.grp && typeof s.grp === 'object' ? s.grp : {}).filter(([k, v]) => GROUP_IDS.test(k) && typeof v === 'boolean'));
  s.off = cleanOffsets(s.off, guideKeyOk);
  return s;
}
function cleanProjState(s, c){
  const sysIds = new Set(['workflows', ...(c.systems || []).map(x => x.id)]);
  const partIds = new Set([...(c.systems || []).flatMap(x => (x.parts || []).map(p => p.id)), ...(c.flows || []).map(f => f.id)]);
  s.vb = cleanCamera(s.vb);
  s.off = cleanOffsets(s.off, k => k === 'c' || (/^sys:/.test(k) && sysIds.has(k.slice(4))) || (/^part:/.test(k) && partIds.has(k.slice(5))) || leafKeyOk(k));
  return s;
}
function cleanPathState(s, pth){
  const stageIds = new Set((pth.stages || []).map(x => x.id));
  s.vb = cleanCamera(s.vb);
  s.off = cleanOffsets(s.off, k => k === 'c' || (/^stage:/.test(k) && stageIds.has(k.slice(6))) || (/^step:/.test(k) && stageIds.has(k.slice(5).split('/')[0])) || leafKeyOk(k));
  return s;
}
// A project or path that was removed leaves its saved map behind; drop those once, on load.
try {
  const live = { 'projMap.': new Set(CASE_STUDIES.map(c => c.id)), 'pathMap.': new Set(PATHS.map(p => p.id)) };
  Object.keys(localStorage).forEach(k => { const m = /^playable\.(projMap\.|pathMap\.)(.+)$/.exec(k); if(m && !live[m[1]].has(m[2])) localStorage.removeItem(k); });
} catch(e){}
const mapState = cleanGuideState(store.get('mapState', {}));
// One place decides which store a state belongs to, so a write scheduled for one
// map can never land in another's.
const stateKeyOf = st => 'cs' in st ? 'projMap.' + st.cs : 'stage' in st ? 'pathMap.' + st.id : 'mapState';
const persist = st => { if(st) store.set(stateKeyOf(st), st); };
// The camera changes on every wheel tick and animation end; it is written once,
// after the gesture settles, and at once when the page is hidden.
const camSave = { st:null, t:0 };
function flushPersist(){ clearTimeout(camSave.t); camSave.t = 0; if(camSave.st){ persist(camSave.st); camSave.st = null; } }
function persistSoon(st){ if(camSave.st && camSave.st !== st) flushPersist(); camSave.st = st; clearTimeout(camSave.t); camSave.t = setTimeout(flushPersist, 250); }
window.addEventListener('pagehide', flushPersist);
document.addEventListener('visibilitychange', () => { if(document.hidden) flushPersist(); });
function saveMap(){ persist(mapState); }
// The domain map shows one lens; a domain or topic route switches to its own.
const lensOf = domId => (DOM[domId] || {}).lens || LENSES[0][0];
function currentLens(){ return LENSES.find(l => l[0] === mapState.lens) || LENSES[0]; }
function setLens(id){ mapState.lens = id; mapState.dom = null; mapState.topic = null; mapState.smell = null; mapState.grp = {}; saveMap(); go('#/map/home'); }
// Phones get the one-sided tree, read one column at a time.
const phoneQuery = window.matchMedia('(max-width: 700px)');

/* ---- three maps, one stage ----
   'domains' draws the guide. 'project' draws one case study as systems and
   parts. 'path' draws one learning path as stages and steps. The three
   states never touch: leaving one restores whichever the reader had before
   exactly as it was. Each project keeps its own open system, selected part,
   node offsets and camera under projMap.<cs>; each path keeps the same
   under pathMap.<id>. */
let mapMode = 'domains';
let projState = null;
let pathMapState = null;
function saveProj(){ persist(projState); }
function projCase(){ return projState ? CASE_STUDIES.find(x => x.id === projState.cs) : null; }
function savePathMap(){ persist(pathMapState); }
function curPath(){ return pathMapState ? PATHS.find(x => x.id === pathMapState.id) : null; }
// Called by the router before the pane renders: the route is the truth about
// which branch is open and which child is selected, the store only supplies
// the camera and the dragged-node offsets. `sysId` is a system id or the
// reserved 'workflows'; `partId` is then a part id or a flow id.
function enterProject(c, sysId, partId){
  if(!projState || projState.cs !== c.id){ flushPersist(); projState = cleanProjState(Object.assign({ sys:null, part:null, off:{}, vb:null }, store.get('projMap.' + c.id, {}), { cs:c.id }), c); }
  projState.sys = sysId || null;
  projState.part = partId || null;
  mapMode = 'project';
  saveProj();
}
// Same shape, for the path map: `stageId` is a stage id or null, matching
// `sysId` above. Called by renderPaths before the pane renders.
function enterPathMap(pth, stageId){
  if(!pathMapState || pathMapState.id !== pth.id){ flushPersist(); pathMapState = cleanPathState(Object.assign({ stage:null, off:{}, vb:null }, store.get('pathMap.' + pth.id, {}), { id:pth.id }), pth); }
  pathMapState.stage = stageId || null;
  mapMode = 'path';
  savePathMap();
}
function curState(){ return mapMode === 'project' && projState ? projState : mapMode === 'path' && pathMapState ? pathMapState : mapState; }
function saveCur(){ if(mapMode === 'project') saveProj(); else if(mapMode === 'path') savePathMap(); else saveMap(); }
// The first topic the reader has not read, in map order: the open domain first,
// then the lens from its first domain. Null when everything is read.
function nextUnread(){
  const first = ds => { for(const d of ds) for(const t of d.topics) if(!seen.has(t) && t !== mapState.topic) return t; return null; };
  const open = mapState.dom && DOM[mapState.dom];
  return (open && first([open])) || first(DOMAINS.filter(d => d.lens === currentLens()[0]));
}
function updateNext(){
  const a = $('#mapNext'); if(!a) return;
  const id = mapMode === 'domains' ? nextUnread() : null;
  a.hidden = !id;
  if(!id) return;
  a.href = '#/map/t/' + id; a.onclick = () => A.pinMap();
  a.textContent = 'Next unread: ' + TOPICS[id].t + ' →';
  a.setAttribute('aria-label', 'Next unread topic: ' + TOPICS[id].t);
}
// A stage too narrow for both halves of the tree at a readable size gets the
// one-sided tree, the way a phone does.
const TWO_SIDED_MIN = 1060;
const oneSidedNow = () => phoneQuery.matches || (!!MAP && MAP.wrap.clientWidth > 50 && MAP.wrap.clientWidth < TWO_SIDED_MIN);
function buildGraph(){
  const oneSided = oneSidedNow(), c = projCase();
  if(MAP) MAP.oneSided = oneSided;
  if(mapMode === 'project' && c) return PlayableGraph.buildProject(c, Object.assign({}, projState, { oneSided }), TOPICS, DOMAINS);
  const pth = curPath();
  if(mapMode === 'path' && pth) return PlayableGraph.buildPath(pth, Object.assign({}, pathMapState, { oneSided }), pathProgress(pth.id));
  practice(); // fills VIEW_LINKS with the runtime links the neighbourhood reads
  return PlayableGraph.build(Object.assign({}, mapState, { oneSided, next: nextUnread() }), seen, VIEW_LINKS);
}

function mapCrumbs(){
  if(mapMode === 'path'){
    const pth = curPath(); if(!pth) return `<div class="mapcrumbs"></div>`;
    const parts = [`<button data-href="#/paths">Paths</button>`, `<span>›</span><button data-href="#/paths/${pth.id}">${esc(pth.t)}</button>`];
    const st = pth.stages.find(x => x.id === pathMapState.stage);
    if(st) parts.push(`<span>›</span><b>${esc(st.t)}</b>`);
    return `<div class="mapcrumbs">${parts.join('')}</div>`;
  }
  if(mapMode === 'project'){
    const c = projCase(); if(!c) return `<div class="mapcrumbs"></div>`;
    const parts = [`<button data-href="#/experience">Projects</button>`, `<span>›</span><button data-href="#/experience/${c.id}">${esc(c.t)}</button>`];
    if(projState.sys === 'workflows'){
      parts.push(`<span>›</span><button data-href="#/experience/${c.id}/workflows">Workflows</button>`);
      const f = (c.flows || []).find(x => x.id === projState.part);
      if(f) parts.push(`<span>›</span><b>${esc(f.t)}</b>`);
      return `<div class="mapcrumbs">${parts.join('')}</div>`;
    }
    const s = (c.systems || []).find(x => x.id === projState.sys);
    if(s) parts.push(`<span>›</span><button data-href="#/experience/${c.id}/${s.id}">${esc(s.t)}</button>`);
    const p = s ? (s.parts || []).find(x => x.id === projState.part) : null;
    if(p) parts.push(`<span>›</span><b>${esc(p.t)}</b>`);
    return `<div class="mapcrumbs">${parts.join('')}</div>`;
  }
  const parts = [`<button data-href="#/map/home">${esc(currentLens()[1])}</button>`];
  if(mapState.dom && DOM[mapState.dom]) parts.push(`<span>›</span><button data-href="#/map/d/${mapState.dom}">${esc(DOM[mapState.dom].t)}</button>`);
  if(mapState.topic && TOPICS[mapState.topic]) parts.push(`<span>›</span><button data-href="#/map/t/${mapState.topic}">${esc(TOPICS[mapState.topic].t)}</button>`);
  if(mapState.smell){ const s = SMELLS.find(x => x.id===mapState.smell); if(s) parts.push(`<span>›</span><b>${esc(s.t)}</b>`); }
  return `<div class="mapcrumbs">${parts.join('')}</div>`;
}
// The one lens switch. The index rail carries it; the start panel carries a copy
// the stylesheet hides while the rail is on screen (see .lens-switch.inpane).
function lensSwitchHTML(cls){
  const cur = currentLens()[0];
  return `<div class="lens-switch${cls ? ' ' + cls : ''}" role="group" aria-label="Map lens">${LENSES.map(([id, t]) => `<button type="button" data-action="lens" data-lens="${id}" aria-pressed="${id === cur}">${esc(t)}</button>`).join('')}</div>`;
}
function engPanel(lens){
  const doms = DOMAINS.filter(d => d.lens === lens[0]);
  const n = doms.reduce((a, d) => a + d.topics.length, 0);
  return `${lensSwitchHTML('inpane')}<span class="overline">${esc(lens[1])} · ${n} topics · ${CASE_STUDIES.length} projects</span>
    <h1 style="margin:6px 0 8px">${esc(lens[2])}.</h1>
    <p class="dim">The server, the pipeline and the team around a game: backend and infrastructure design, the game server, project management and leadership, platforms and publishing, how the AI models the team now depends on work, the code craft that still pays, and careers beyond games. Every topic has an interview tab, and the shipped projects show the same ideas in the field.</p>
    <div class="grid auto">${doms.map(d => `<a class="card clickable tint lnk blk" style="--dc:${d.color}" href="#/map/d/${d.id}"><h3>${esc(d.t)}</h3><p class="dim small" style="margin:0">${esc(d.short)}</p></a>`).join('')}</div>
    <div class="row" style="margin-top:14px"><a class="btn" href="#/paths">Engineering, leadership and interview paths</a></div>`;
}
function startPanel(){
  const lens = currentLens();
  if(lens[0] !== LENSES[0][0]) return engPanel(lens);
  return `${lensSwitchHTML('inpane')}<span class="overline">Field manual · ${DOMAINS.filter(d => d.lens === lens[0]).reduce((a, d) => a + d.topics.length, 0)} topics · ${SMELLS.length} smells · ${TOOLS.length} tools</span>
    <h1 style="margin:6px 0 8px">Make something people want to play.</h1>
    <p class="dim">The mind map on the left is always here. Click a domain to open it and see its topics, click a topic to read it in this panel and see what it connects to: related topics, games, smells and paths. Type in Find in map to jump to a topic by name. The index lists the same topics; the map adds how they connect and what you have read.</p>
    <div class="paths">${startPathsHTML()}</div>
    <div class="section-head" style="margin-top:22px"><h2>What are you trying to solve?</h2><span class="muted">symptom to likely cause to experiment</span></div>
    ${symptomsHTML()}
    <div class="section-head" style="margin-top:22px"><h2>Two chains to hold in your head</h2></div>
    <div class="stack">
    <div class="card"><h4>How a game becomes an experience</h4>${chainHTML([['Player','#/map/t/who-is-the-player'],['Desire','#/map/t/player-motivation'],['Fantasy','#/map/t/fantasy'],['Core experience','#/map/t/core-experience'],['Game loop','#/map/t/core-loop'],['Mechanics','#/map/t/mechanics-and-rules'],['Decisions','#/map/t/decisions'],['Challenge','#/map/t/challenge-failure-recovery'],['Feedback','#/map/t/feedback-and-affordance'],['Progression','#/map/t/progression'],['Content','#/map/t/content-multiplies'],['UX','#/map/t/ux-as-design'],['Retention','#/map/t/return-and-quit']])}<p class="small muted" style="margin:6px 0 0">Read left to right to design, right to left to diagnose.</p></div>
    <div class="card"><h4>How a design becomes true</h4>${chainHTML([['Human judgment','#/map/t/bottleneck-shift','human'],['AI assistance','#/map/t/ai-roles','ai'],['Prototype','#/map/t/prototyping','ai'],['Playtest','#/map/t/playtesting','evidence'],['Evidence','#/map/t/iteration-and-evidence','evidence'],['Revision','#/map/t/hypothesis-driven-design','human'],['Repeat','#/ai/loop','']])}<p class="small muted" style="margin:6px 0 0">The only step that tells the truth is the one with players in it. <a href="#/ai/philosophy">Why the bottleneck moved →</a></p></div>
    </div>`;
}
function domainPanel(d){
  const links = d.links.map(([to, why]) => `<li><a class="lnk strong" style="color:${DOM[to].color};cursor:pointer" href="#/map/d/${to}">${esc(DOM[to].t)}</a> <span class="why">${esc(why)}</span></li>`).join('');
  const inbound = DOMAINS.filter(o => o.links.some(([to]) => to===d.id) && !d.links.some(([to]) => to===o.id)).map(o => { const why = o.links.find(([to]) => to===d.id)[1]; return `<li><a class="lnk strong" style="color:${o.color};cursor:pointer" href="#/map/d/${o.id}">${esc(o.t)}</a> <span class="why">${esc(why)}</span></li>`; }).join('');
  return `<div class="chips" style="margin-bottom:6px">${domChip(d.id)}<span class="chip">${d.topics.length} topics · ${d.topics.filter(t=>seen.has(t)).length} read</span></div><h1 style="margin-bottom:6px">${esc(d.t)}</h1><p class="dim">${esc(d.sum)}</p>
    <h4>Topics</h4><div class="grid auto" style="margin-bottom:14px">${d.topics.map(t => `<a class="card clickable tint lnk blk" style="--dc:${d.color};padding:10px 12px" href="#/map/t/${t}"><b>${esc(TOPICS[t].t)}</b> ${seen.has(t)?'<span class="chip ok">read</span>':''}<div class="small dim">${esc(TOPICS[t].tag)}</div></a>`).join('')}</div>
    <h4>Why it connects</h4><ul class="mapside-list">${links}${inbound}</ul>`;
}
function drawerHTML(){
  if(mapState.smell){ const s = SMELLS.find(x => x.id===mapState.smell); if(s) return `<div class="row between" style="margin-bottom:8px"><button class="btn sm ghost" data-href="${mapState.topic ? '#/map/t/'+mapState.topic : mapState.dom ? '#/map/d/'+mapState.dom : '#/map/home'}">← back</button><a class="btn sm" href="#/smell/${s.id}">Open in Diagnose</a></div>${smellsView(s.id).replace(/<div class="row between">.*?<\/div>\s*<h2/s, '<h2')}`; }
  if(mapState.topic && TOPICS[mapState.topic]) return topicBody(mapState.topic);
  if(mapState.dom && DOM[mapState.dom]) return domainPanel(DOM[mapState.dom]);
  return startPanel();
}

/* ---- find in the map ----
   Typing rings the topics (and the closed domains that hold them) whose name
   matches, on whichever lens is drawn; Enter opens the first match, switching
   lens if it lives in the other one, and repeated Enter steps to the next.
   Words are folded the way the site search folds them (UK and US spellings,
   plurals, synonyms such as gacha and loot box). A query no title answers falls
   back to the site search for a few topics whose text does. */
const titleWords = new Map();
function findMatches(q){
  const qs = A.searchWords(q).filter(w => !A.STOP_WORDS.has(w)); if(!qs.length) return [];
  const words = (id, t, tag) => titleWords.get(id) || (titleWords.set(id, { t: A.searchWords(t), g: A.searchWords(tag || '') }), titleWords.get(id));
  const hits = [];
  const test = (kind, id, dom, t, tag) => {
    const w = words(kind + id, t, tag); let score = 0;
    for(const x of qs){
      if(w.t.includes(x)) score += 10; else if(w.t.some(y => y.startsWith(x))) score += 6; else if(w.g.includes(x)) score += 3; else if(w.g.some(y => y.startsWith(x))) score += 2; else return;
    }
    if(w.t.join(' ') === qs.join(' ')) score += 20;
    hits.push({ kind, id, dom, lens: lensOf(dom), title: t, score });
  };
  TOPIC_LIST.forEach(t => test('t', t.id, t.d, t.t, t.tag));
  DOMAINS.forEach(d => test('d', d.id, d.id, d.t, d.short));
  // a title that answers wins; a tag alone only answers when no title does
  if(hits.length) return (hits.some(h => h.score >= 6) ? hits.filter(h => h.score >= 6) : hits).sort((a, b) => b.score - a.score);
  const out = [];
  for(const it of A.search(q)){
    const m = /^#\/map\/t\/([^/]+)$/.exec(it.href);
    if(m && TOPICS[m[1]]) out.push({ kind:'t', id:m[1], dom:TOPICS[m[1]].d, lens:lensOf(TOPICS[m[1]].d), title:it.t });
    if(out.length >= 8) break;
  }
  return out;
}
function findSummary(f){
  if(!f.q.trim()) return '';
  if(!f.matches.length) return 'No match';
  const cur = currentLens()[0], other = f.matches.filter(m => m.lens !== cur);
  return f.matches.length + (f.matches.length === 1 ? ' match' : ' matches') + (other.length ? ', ' + other.length + ' in ' + (LENSES.find(l => l[0] === other[0].lens) || [0, other[0].lens])[1] : '');
}
// Rings the matches that are drawn; the rest recede so the rings read at a glance.
function applyFind(){
  if(!MAP || !MAP.find) return;
  const f = MAP.find, root = treeRoot(); if(!root) return;
  let n = 0;
  root.querySelectorAll('[data-key]').forEach(el => {
    const k = el.dataset.kind, id = el.dataset.id;
    const on = mapMode === 'domains' && !el.dataset.scope && f.matches.length > 0 && !f.quiet && ((k === 'topic' || k === 'leaf') ? f.ids.has(id) : k === 'domain' ? f.doms.has(id) && !el.classList.contains('open') : false);
    el.classList.toggle('found', on); if(on) n++;
  });
  MAP.svg.classList.toggle('finding', n > 0);
  MAP.outline.classList.toggle('finding', n > 0);
}

/* ---- camera ---- */
// The box is widened to the stage's own shape, so the tree fills the stage on
// both axes instead of being framed for a fixed 1.18 ratio.
function fitBox(b){ const A = MAP && MAP.wrap.clientWidth > 50 && MAP.wrap.clientHeight > 50 ? Math.min(3, Math.max(0.4, MAP.wrap.clientWidth / MAP.wrap.clientHeight)) : 1.18; let {x,y,w,h} = b; if(w/h < A){ const nw = h*A; x -= (nw-w)/2; w = nw; } else { const nh = w/A; y -= (nh-h)/2; h = nh; } return {x,y,w,h}; }
function applyVB(svg, vb){ svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`); updateMoreCues(); }
// "N more" pills at the stage edges: the leaves and items the window cuts off, by direction.
function updateMoreCues(){
  const el = $('#mapmore'); if(!el || !MAP || !MAP.g || !MAP.vb) return;
  const cnt = { l:0, r:0, u:0, d:0 }, cx = { u:0, d:0 }, vb = MAP.vb;
  if(!phoneQuery.matches && MAP.wrap.clientWidth > 50 && MAP.wrap.clientHeight > 50)
    for(const n of MAP.g.nodes){
      if(n.kind !== 'leaf' && n.kind !== 'item') continue;
      // a card whose middle is above or below the window is "more"; one beside it is "cut off" once a sixth of it is hidden
      if(n.y > vb.y + vb.h){ cnt.d++; cx.d += n.x + n.w / 2; } else if(n.y < vb.y){ cnt.u++; cx.u += n.x + n.w / 2; }
      else if(n.x + n.w > vb.x + vb.w + n.w / 6) cnt.r++; else if(n.x < vb.x - n.w / 6) cnt.l++;
    }
  // the up and down pills sit over the column of leaves they count
  const at = k => cnt[k] ? Math.max(12, Math.min(88, (cx[k] / cnt[k] - vb.x) / vb.w * 100)) : 50;
  const ARROW = { l:'←', r:'→', u:'↑', d:'↓' }, sig = JSON.stringify([cnt, at('u'), at('d')]);
  if(el.dataset.sig === sig) return;
  el.dataset.sig = sig;
  el.innerHTML = Object.keys(cnt).filter(k => cnt[k]).map(k => `<button type="button" class="morecue ${k}" data-dir="${k}" tabindex="-1"${k === 'u' || k === 'd' ? ` style="left:${at(k).toFixed(1)}%"` : ''} aria-hidden="true" title="Pan the map to show them">${cnt[k]} ${k === 'l' || k === 'r' ? 'cut off' : 'more'} ${ARROW[k]}</button>`).join('');
}
const nextFrame = fn => document.hidden ? { kind:'t', id: setTimeout(() => fn(performance.now()), 16) } : { kind:'r', id: requestAnimationFrame(fn) };
const cancelFrame = h => { if(!h) return; if(h.kind === 't') clearTimeout(h.id); else cancelAnimationFrame(h.id); };
function cameraTarget(g, cam, kind){
  const fit = fitBox(g.bbox);
  if(!cam || kind === 'home' || !g.focus) return fit;
  const f = g.focus, A = cam.w / cam.h; const cx = f.x + f.w/2, cy = f.y + f.h/2;
  let w = cam.w, h = cam.h; const needW = Math.max(f.w*1.12, f.h*1.12*A); if(needW > w){ w = needW; h = w/A; }
  return { x: cx - w/2, y: cy - h/2, w, h };
}

let MAP = null; // { wrap, svg, tip, g, vb, anim, hover }
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function mapAnimateTo(to, ms=480){
  const M = MAP; if(!M) return; if(M.anim) cancelFrame(M.anim.h);
  if(ms <= 0 || reducedMotion.matches){ M.anim = null; M.vb = to; applyVB(M.svg, to); mapPersistCamera(); return; }
  const from = Object.assign({}, M.vb); const t0 = performance.now(); const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
  const step = now => { const k = Math.min(1, (now - t0)/ms), e = ease(k); M.vb = { x: from.x + (to.x-from.x)*e, y: from.y + (to.y-from.y)*e, w: from.w + (to.w-from.w)*e, h: from.h + (to.h-from.h)*e }; applyVB(M.svg, M.vb); if(k < 1) M.anim.h = nextFrame(step); else { M.anim = null; M.vb = to; applyVB(M.svg, to); mapPersistCamera(); } };
  M.anim = { h: nextFrame(step) };
}
function mapStopAnim(){ if(MAP && MAP.anim){ cancelFrame(MAP.anim.h); MAP.anim = null; } }
// The camera is stored with the stage size it was framed for; a camera saved
// on a different screen is not restored, the tree is framed afresh instead.
function mapPersistCamera(){
  // the overview is framed afresh every time, so there is nothing to remember there
  if(!MAP || !MAP.vb || !MAP.g || !MAP.g.focus) return;
  // a map folded away (a topic page is text-first) has no size: what it would
  // frame there is not the reader's camera, and must not overwrite theirs
  if(MAP.wrap.clientWidth < 50 || MAP.wrap.clientHeight < 50) return;
  const st = curState();
  st.vb = { x:MAP.vb.x, y:MAP.vb.y, w:MAP.vb.w, h:MAP.vb.h, sw:MAP.wrap.clientWidth, sh:MAP.wrap.clientHeight };
  persistSoon(st);
}
function savedCamera(vb){
  if(!vb || !vb.w || !vb.sw) return null;
  const w = MAP.wrap.clientWidth, h = MAP.wrap.clientHeight;
  if(w < 50 || h < 50) return vb;   // folded away: keep it until the map is shown and measured
  return Math.abs(vb.sw - w) <= w * 0.2 && Math.abs(vb.sh - h) <= h * 0.2 ? vb : null;
}
// On a phone the one-sided tree is read one column at a time: the column the
// reader is choosing from (branches, or the open branch's items) fills the
// width at a readable scale, starting at its top or at the selected item.
function phoneTarget(g){
  const open = g.nodes.find(n => n.kind === 'domain' && n.open);
  const col = g.nodes.filter(n => open ? n.kind === 'topic' : n.kind === 'domain');
  const list = col.length ? col : g.nodes;
  const minX = Math.min(...list.map(n => n.x)) - 16, maxX = Math.max(...list.map(n => n.x + n.w)) + 16;
  const w = maxX - minX, h = w * Math.max(1, MAP.wrap.clientHeight) / Math.max(1, MAP.wrap.clientWidth);
  const selId = mapMode === 'project' ? projState && projState.part : mapMode === 'path' ? null : mapState.topic;
  const sel = selId && list.find(n => n.id === selId);
  const top = Math.min(...list.map(n => n.y - n.h / 2)) - 16;
  return { x: minX, y: sel ? sel.y - h / 2 : top, w, h };
}
// A path opens framed to its open stage and that stage's steps; framed to the
// whole tree its nodes are too small to read.
function pathStageTarget(g){
  const f = treeFocus(g); if(!f) return null;
  const A = Math.max(0.5, MAP.wrap.clientWidth / Math.max(1, MAP.wrap.clientHeight));
  let x = f.x - f.w * 0.05, y = f.y - f.h * 0.05, w = f.w * 1.1, h = f.h * 1.1;
  if(w / h < A){ const nw = h * A; x -= (nw - w) / 2; w = nw; } else { const nh = w / A; y -= (nh - h) / 2; h = nh; }
  return { x, y, w, h };
}
/* ---- readable labels ----
   Labels never render smaller than MIN_LABEL_PX on screen. When the whole tree
   does not fit at that size, the camera shows the part the reader is on (the
   selected node and its children, or the first column at the domain level)
   instead of shrinking every label; the reader expands a domain by clicking it
   or zooms out by hand. */
const MIN_LABEL_PX = 11;
// The node the route selected, else null (the domain level).
function selectedNode(g){
  const pick = (kind, id) => (g.nodes || []).find(n => n.kind === kind && n.id === id) || null;
  if(mapMode === 'project' && projState) return (projState.part && pick('topic', projState.part)) || (projState.sys && pick('domain', projState.sys)) || null;
  if(mapMode === 'path' && pathMapState) return (pathMapState.stage && pick('domain', pathMapState.stage)) || null;
  return (mapState.topic && pick('topic', mapState.topic)) || (mapState.dom && pick('domain', mapState.dom)) || null;
}
// The window, in graph units, that a stage shows at exactly the minimum size.
function readableSize(){
  const px = MAP.labelPx || 13.5, s = MIN_LABEL_PX / px;
  return { w: MAP.wrap.clientWidth / s, h: MAP.wrap.clientHeight / s };
}
function keepReadable(t, g){
  if(!MAP || MAP.wrap.clientWidth < 50 || MAP.wrap.clientHeight < 50) return t;
  const max = readableSize(), clamp = !(t.w <= max.w * 1.001 && t.h <= max.h * 1.001);
  // a window narrower than the tree fades at its right edge, so a card cut off there reads as "more this way"
  MAP.wrap.classList.toggle('fade-right', clamp);
  const sel = selectedNode(g);
  const below = n => [n, ...(n.children || []).flatMap(below)];
  // a selected topic's neighbourhood must sit inside the window even when the
  // window is small enough to be readable already (a tablet's 720-wide frame)
  const nb = sel && sel.children && sel.children.length ? below(sel).slice(1) : null;
  const nbLo = nb ? Math.min(...nb.map(n => n.x)) : 0, nbHi = nb ? Math.max(...nb.map(n => n.x + n.w)) : 0;
  // ... and the topic itself is whole or wholly out, never cut by the stage's edge
  const straddle = !!nb && ((t.x > sel.x && t.x < sel.x + sel.w) || (t.x + t.w > sel.x && t.x + t.w < sel.x + sel.w));
  const nbIn = !nb || (t.x <= nbLo - 8 && t.x + t.w >= nbHi + 8 && !straddle);
  // the selected node is whole inside the window, or the window has to move
  const selIn = tt => !sel || (sel.x >= tt.x + 8 && sel.x + sel.w <= tt.x + tt.w - 8 && sel.y - sel.h / 2 >= tt.y && sel.y + sel.h / 2 <= tt.y + tt.h);
  if(!clamp && nbIn && selIn(t)) return t;
  const w = clamp ? max.w : t.w, h = clamp ? max.h : t.h, root = (g.nodes || []).find(n => n.kind === 'center');
  const from = sel || root;
  if(!from) return t;
  // the part of the tree to show: the node and its children, or the first column
  const group = sel ? below(sel) : (root.children && root.children.length ? root.children : [root]);
  const lo = Math.min(...group.map(n => n.x)), hi = Math.max(...group.map(n => n.x + n.w));
  const left = sel ? sel.side >= 0 : (root.children[0] || {}).side >= 0;
  let x0;
  if(hi - lo + 48 <= w) x0 = (lo + hi) / 2 - w / 2;
  // too wide for the stage: keep the selected topic's neighbourhood (its groups and
  // leaves), starting at a column edge so no card is cut, even if the topic itself
  // then sits just off the stage
  else if(sel && sel.children.length && (() => { const nb = below(sel).slice(1); const nlo = Math.min(...nb.map(n => n.x)), nhi = Math.max(...nb.map(n => n.x + n.w)); return nhi - nlo + 48 <= w; })()){
    const nb = below(sel).slice(1), nlo = Math.min(...nb.map(n => n.x)), nhi = Math.max(...nb.map(n => n.x + n.w));
    x0 = left ? nlo - 24 : nhi + 24 - w;  // `left`: the tree grows to the right, so its near edge is the low x
  }
  else if(sel) x0 = left ? hi + 24 - w : lo - 24;
  else x0 = left ? lo - 24 : hi + 24 - w;
  // include the root beside the first column when both fit
  if(!sel && root && root.x + root.w <= x0 + w && left && hi + 24 - (root.x - 20) <= w) x0 = root.x - 20;
  const ylo = Math.min(...group.map(n => n.y - n.h / 2)), yhi = Math.max(...group.map(n => n.y + n.h / 2));
  let y0;
  if(yhi - ylo + 48 <= h) y0 = (ylo + yhi) / 2 - h / 2;
  else y0 = sel ? sel.y - h / 2 : ylo - 24;
  const r = { x: x0, y: y0, w, h };
  if(!sel || selIn(r)) return r;
  const k = keepInView(r, sel, left);
  if(nb && left && k.x + w < nbHi + 8) MAP.wrap.classList.add('fade-right');
  return k;
}
// The selected node is never dropped off the stage. When its neighbourhood is
// wider than the stage, the node keeps the edge nearest the goal and the leaves
// run on past the far edge (pan, or press Right, to reach them), so the reader
// always sees where they are. `left` is true when the tree grows to the right.
function keepInView(r, sel, left){
  const m = 16, w = r.w, h = r.h;
  let { x, y } = r;
  if(sel.x < x + m || sel.x + sel.w > x + w - m) x = left ? sel.x - m : sel.x + sel.w + m - w;
  if(sel.y - sel.h / 2 < y + m) y = sel.y - sel.h / 2 - m; else if(sel.y + sel.h / 2 > y + h - m) y = sel.y + sel.h / 2 + m - h;
  return { x, y, w, h };
}
/* ---- framing the selected branch ----
   The selected node, its children and their children (a topic with its groups
   and open leaves; a stage with its steps) are framed as a block. The block
   starts at the selected node's own column edge, so the columns before it (the
   domain, the centre) sit wholly off-stage and never half-cut, and it is drawn
   as large as it fits without the labels dropping under MIN_LABEL_PX or growing
   past MAX_LABEL_PX. When the block is wider or taller than the stage at the
   smallest size, the selected node and its group column stay in view and the
   leaves run on past the edge; updateMoreCues says how many. */
const MAX_LABEL_PX = 14;
function branchFrame(g, sel){
  if(!MAP || !sel || sel.kind === 'center' || !(sel.children || []).length) return null;
  const W = MAP.wrap.clientWidth, H = MAP.wrap.clientHeight;
  if(W < 50 || H < 50) return null;
  const below = n => [n, ...(n.children || []).flatMap(below)];
  const all = below(sel), max = readableSize(), px = MAP.labelPx || 13.5;
  const lo = Math.min(...all.map(n => n.x)), hi = Math.max(...all.map(n => n.x + n.w)), right = sel.side >= 0;
  const need = hi - lo + 48, w = Math.min(max.w, Math.max(need, W * px / MAX_LABEL_PX)), h = w * H / W;
  const top = n => n.y - n.h / 2, bot = n => n.y + n.h / 2;
  const span = ns => [Math.min(...ns.map(top)), Math.max(...ns.map(bot))];
  const [ylo, yhi] = span(all), [clo, chi] = span([sel, ...sel.children]);
  // whole block if it fits, else the selected node with its group column, else the node alone
  const y = yhi - ylo + 48 <= h ? (ylo + yhi) / 2 - h / 2 : chi - clo + 48 <= h ? (clo + chi) / 2 - h / 2 : sel.y - h / 2;
  const x = right ? lo - 24 : hi + 24 - w;
  MAP.wrap.classList.toggle('fade-right', need > w + 1 && right);
  return { x, y, w, h };
}
// Where the camera should be for this graph on this stage.
function stageTarget(g, kind, cam){
  if(phoneQuery.matches) return phoneTarget(g);
  { const f = branchFrame(g, selectedNode(g)); if(f) return f; }
  if(mapMode === 'path' && kind === 'stage'){ const t = pathStageTarget(g); if(t) return keepReadable(t, g); }
  let target = cameraTarget(g, cam, kind);
  if(isNarrow() && target.w > 720){ const A = target.w / target.h, w = 720, h = w / A; const cx = target.x + target.w/2, cy = target.y + target.h/2; target = { x: cx - w/2, y: cy - h/2, w, h }; }
  return keepReadable(target, g);
}

function projTipHTML(n){
  const kind = n.dataset.kind, id = n.dataset.id, why = n.dataset.why || '';
  const c = projCase(); if(!c) return '';
  if(kind==='center') return `<b style="color:var(--accent2)">${esc(c.t)}</b>${c.sub?`<div>${esc(c.sub)}</div>`:''}<div>${esc(c.role)} · ${esc(c.period)}</div><div class="muted">${projState.sys ? 'click to collapse back to the project' : 'click to read the project page'}</div>`;
  if(kind==='domain' && id==='workflows'){ const n2 = (c.flows||[]).length; return `<b style="color:var(--accent2)">Workflows</b><div>How this project behaves end to end, drawn as charts.</div><div class="muted">${n.classList.contains('open')?'click to collapse':`click to open its ${n2} flow${n2===1?'':'s'}`}</div>`; }
  if(kind==='domain'){ const s = (c.systems||[]).find(x => x.id===id); if(!s) return ''; return `<b style="color:${KIND_COLOR[s.kind]||'var(--accent2)'}">${esc(s.t)}</b><div>${esc(s.sum)}</div><div class="muted">${n.classList.contains('open')?'click to collapse':`click to open its ${(s.parts||[]).length} parts`}</div>`; }
  if(kind==='topic' && projState.sys==='workflows'){ const f = (c.flows||[]).find(x => x.id===id); if(!f) return ''; return `<b style="color:var(--accent2)">${esc(f.t)}</b><div>${esc(f.sum)}</div><div class="muted">click to open this workflow chart</div>`; }
  if(kind==='topic'){ const s = (c.systems||[]).find(x => x.id===projState.sys); const p = s && (s.parts||[]).find(x => x.id===id); if(!p) return ''; return `<b>${esc(p.t)}</b><div>${esc(p.why)}</div><div class="muted">click to read this part</div>`; }
  if(kind==='leaf'){ const t = TOPICS[id]; if(!t) return ''; return `<b>${esc(t.t)}</b><div>${esc(t.tag)}</div>${why?`<div class="why"><b>What it demonstrates:</b> ${esc(why)}</div>`:''}<div class="muted">click to read the topic on the guide map</div>`; }
  return '';
}
function pathTipHTML(n){
  const kind = n.dataset.kind, id = n.dataset.id;
  const pth = curPath(); if(!pth) return '';
  if(kind==='center') return `<b style="color:var(--accent2)">${esc(pth.t)}</b><div>${esc(pth.tag)}</div><div class="muted">${pathMapState.stage ? 'click to collapse back to the path' : 'click to open the path page'}</div>`;
  if(kind==='domain'){ const st = pth.stages.find(x => x.id===id); if(!st) return ''; return `<b style="color:var(--accent2)">${esc(st.t)}</b><div>${esc(st.goal)}</div><div class="muted">${n.classList.contains('open')?'click to collapse':`click to open its ${(st.steps||[]).length} steps`}</div>`; }
  if(kind==='topic'){ const [stageId, i] = id.split('/'); const st = pth.stages.find(x => x.id===stageId); const step = st && st.steps[+i]; if(!step) return ''; return `<b>${esc(stepTitle(step))}</b><div>${esc(step.why)}</div><div class="muted">click to show this step in the stage</div>`; }
  return '';
}
const ITEM_NAMES = { game:'Reference game', smell:'Design smell', tool:'Tool', guide:'Guide', checklist:'Checklist', prompt:'Prompt template', path:'Learning path', part:'Seen in practice', view:'Tool page' };
function mapTipHTML(n){
  if(n.dataset.scope === 'project') return projTipHTML(n);
  if(n.dataset.scope === 'path') return pathTipHTML(n);
  const kind = n.dataset.kind, id = n.dataset.id, why = n.dataset.why || '';
  if(kind==='center') return `<b>Make something people want to play</b><div class="muted">${mapState.dom || mapState.topic || mapState.smell ? 'click to reset the branch' : 'click for the starting paths'}</div>`;
  if(kind==='domain'){ const d = DOM[id]; return `<b style="color:${d.color}">${esc(d.t)}</b><div>${esc(d.short)}</div><div class="muted">${n.classList.contains('open')?'click to collapse':'click to expand and read'}</div>`; }
  if(kind==='topic'){ const t = TOPICS[id]; return `<b>${esc(t.t)}</b><div>${esc(t.tag)}</div><div class="muted">${seen.has(id) ? 'read · ' : ''}click to read in the panel</div>`; }
  // a leaf's "why" is drawn beside the card (showWhy), so the tip keeps to what and where
  if(kind==='leaf'){ const t = TOPICS[id]; if(!t) return ''; const other = n.dataset.type === 'other';
    return `<b>${esc(t.t)}</b><div>${esc(t.tag)}</div><div class="muted">${other ? 'lives in ' + esc(lensOf(t.d) === LENSES[0][0] ? LENSES[0][1] : LENSES[1][1]) + ' · click to switch lens and open it' : 'click to open this concept'}</div>`; }
  if(kind==='group'){ const open = n.classList.contains('open'); return `<b>${esc(n.getAttribute('aria-label').replace(/,.*$/, ''))}</b><div class="muted">${open ? 'click to collapse' : 'click to show all'}</div>`; }
  if(kind==='item'){ const type = n.dataset.type;
    return `<b>${esc(ITEM_NAMES[type] || 'Link')}</b><div class="muted">click to open</div>`; }
  return '';
}
/* ---- a leaf's "why", beside its card ----
   Hover, keyboard focus or a tap draws the reason a leaf is linked in a small
   note attached to the card, so the reason is on the map and not only in a
   tooltip. The note is redrawn with the graph and never takes pointer events. */
const noteLines = (s, n) => { const out = []; let a = ''; for(const w of String(s).split(' ')){ if(a && a.length + 1 + w.length > n){ out.push(a); a = w; } else a = a ? a + ' ' + w : w; } if(a) out.push(a); return out; };
function hideWhy(){ if(MAP && MAP.svg){ const g = MAP.svg.querySelector('.whynote'); if(g) g.remove(); } }
function showWhy(n, pan){
  hideWhy();
  if(!MAP || !n || !n.dataset.why || (n.dataset.kind !== 'leaf' && n.dataset.kind !== 'item')) return;
  const r = n.querySelector('.disc'); if(!r) return;
  const x = +r.getAttribute('x'), y = +r.getAttribute('y'), w = +r.getAttribute('width'), h = +r.getAttribute('height');
  const NW = 300, PADX = 10, lines = noteLines(n.dataset.why, Math.floor((NW - 2 * PADX) / 6.8)), lh = 15, nh = lines.length * lh + 12;
  const left = n.querySelector('.lbl').getAttribute('text-anchor') === 'end';
  // Where the note goes: beside the card on its outer side first (leaves are the
  // outermost layer, so nothing is out there), then below, then above. A place
  // is taken only if it covers no other card and stays inside the window the
  // reader is looking at; failing that, the place that covers the least.
  const vb = MAP.vb, others = [...MAP.svg.querySelectorAll('.node .disc')].filter(d => d !== r).map(d => ({ x:+d.getAttribute('x'), y:+d.getAttribute('y'), w:+d.getAttribute('width'), h:+d.getAttribute('height') }));
  const cand = [ [left ? x - NW - 8 : x + w + 8, y + h / 2 - nh / 2], [left ? x + w - NW : x, y + h + 3], [left ? x + w - NW : x, y - nh - 3] ];
  const cost = ([cx, cy]) => others.filter(o => cx < o.x + o.w && cx + NW > o.x && cy < o.y + o.h && cy + nh > o.y).length * 10 + (vb && (cx < vb.x + 4 || cx + NW > vb.x + vb.w - 4 || cy < vb.y + 4 || cy + nh > vb.y + vb.h - 4) ? 1 : 0);
  let best = cand[0], bc = Infinity; cand.forEach(c => { const k = cost(c); if(k < bc){ bc = k; best = c; } });
  const nx = best[0], ny = best[1];
  // Keyboard focus: if the note sits past the edge of the window, bring it into view.
  if(pan && vb && best === cand[0]){
    const dx = nx < vb.x + 8 ? nx - vb.x - 8 : nx + NW > vb.x + vb.w - 8 ? nx + NW - vb.x - vb.w + 8 : 0;
    if(dx) mapAnimateTo({ x: vb.x + dx, y: vb.y, w: vb.w, h: vb.h });
  }
  const t = lines.map((l, i) => `<tspan x="${nx + PADX}" dy="${i ? lh : 0}">${esc(l)}</tspan>`).join('');
  MAP.svg.insertAdjacentHTML('beforeend', `<g class="whynote" pointer-events="none"><rect x="${nx}" y="${ny}" width="${NW}" height="${nh}" rx="3"/><text x="${nx + PADX}" y="${ny + 17}" font-size="12">${t}</text></g>`);
}
function mapMoveTip(e){ const M = MAP; const r = M.wrap.getBoundingClientRect(); let x = e.clientX - r.left + 14, y = e.clientY - r.top + 14; if(x + 260 > r.width) x -= 280; if(y + 90 > r.height) y -= 100; M.tip.style.left = x + 'px'; M.tip.style.top = y + 'px'; }
function mapHover(n, e){
  const M = MAP; if(M.hover === n){ if(n && e) mapMoveTip(e); return; }
  if(M.hover){ hideWhy(); M.svg.classList.remove('dimmed'); $$('.hl', M.svg).forEach(x => x.classList.remove('hl')); M.tip.hidden = true; }
  M.hover = n; if(!n){ hideWhy(); return; }
  showWhy(n);
  const key = n.dataset.key;
  M.svg.classList.add('dimmed'); n.classList.add('hl');
  $$('.edge', M.svg).forEach(ed => { const hit = ed.dataset.a === key || ed.dataset.b === key; ed.classList.toggle('hl', hit); if(hit){ const other = ed.dataset.a === key ? ed.dataset.b : ed.dataset.a; const on = other && M.svg.querySelector(`.node[data-key="${other}"]`); if(on) on.classList.add('hl'); } });
  // a leaf with a reason gets the note beside its card, which replaces the tip
  const noted = n.dataset.why && (n.dataset.kind === 'leaf' || n.dataset.kind === 'item');
  if(e && e.pointerType !== 'touch' && !noted){ M.tip.innerHTML = mapTipHTML(n); M.tip.hidden = false; mapMoveTip(e); }
}
function projClick(n){
  const kind = n.dataset.kind, id = n.dataset.id, c = projCase();
  if(!c) return;
  if(kind==='center') return go(`#/experience/${c.id}`);
  if(kind==='domain') return go(n.classList.contains('open') ? `#/experience/${c.id}` : `#/experience/${c.id}/${id}`);
  if(kind==='topic' && projState.sys==='workflows') return go(`#/experience/${c.id}/flow/${id}`);
  if(kind==='topic') return go(`#/experience/${c.id}/${projState.sys}/${id}`);
  if(kind==='leaf') return go('#/map/t/' + id);
}
function pathMapClick(n){
  const kind = n.dataset.kind, id = n.dataset.id, pth = curPath();
  if(!pth) return;
  if(kind==='center') return go(`#/paths/${pth.id}`);
  if(kind==='domain') return go(n.classList.contains('open') ? `#/paths/${pth.id}` : `#/paths/${pth.id}/${id}`);
  if(kind==='topic') showPathStep(pth.id, id);
}
// The polite live region: what a keyboard or screen-reader user needs to hear
// when a node opens, closes or takes them to a page.
let sayT = 0;
function say(msg){
  const el = $('#maplive'); if(!el) return;
  el.textContent = ''; clearTimeout(sayT);
  sayT = setTimeout(() => { el.textContent = msg; }, 60);
}
function announce(n){
  const kind = n.dataset.kind, info = MAP && MAP.idx && MAP.idx.byKey.get(n.dataset.key), label = info ? info.n.label : '';
  if(!label || kind === 'center') return;
  if(kind === 'domain' || kind === 'group'){
    const open = n.classList.contains('open') || n.getAttribute('aria-expanded') === 'true', kids = kind === 'domain' && mapMode === 'domains' && DOM[n.dataset.id] ? DOM[n.dataset.id].topics.length : 0;
    say(open ? 'Collapsed ' + label : 'Expanded ' + label + (kids ? ', ' + kids + ' topics' : ''));
  }
  else if(kind === 'topic') say('Opened ' + label);
  else say('Opening ' + label);
}
function mapClick(n){
  announce(n);
  A.pinMap();   // a click inside the map keeps the map shown, even on the pages that fold it away
  if(n.dataset.scope === 'project') return projClick(n);
  if(n.dataset.scope === 'path') return pathMapClick(n);
  const kind = n.dataset.kind, id = n.dataset.id;
  if(kind==='center'){ if(mapState.dom || mapState.topic || mapState.smell) return go('#/map/home'); return openStart(); }
  if(kind==='domain') return go(n.classList.contains('open') ? '#/map/home' : '#/map/d/'+id);
  if(kind==='topic') return go('#/map/t/'+id);
  // a related topic, also one that lives in the other lens: the route sets the lens
  if(kind==='leaf') return go('#/map/t/'+id);
  if(kind==='group') return toggleGroup(n);
  if(kind==='item' && n.dataset.href) return go(n.dataset.href);
}
// A group of leaves opens or closes in place; the reader's choice is kept per
// group until another topic is selected.
function toggleGroup(n){
  const id = n.dataset.id, open = n.classList.contains('open') || n.getAttribute('aria-expanded') === 'true';
  mapState.grp = mapState.grp || {}; mapState.grp[id] = !open; saveMap();
  MAP.focusKey = n.dataset.key; MAP.keyNav = false;
  paintGraph();
  // the branch is framed again with the group open or closed: the topic and its group column stay in view
  MAP.userCamera = false; mapStopAnim();
  mapAnimateTo(stageTarget(MAP.g, MAP.kind, MAP.vb));
}

function fitMap(){ if(MAP && MAP.g){ mapStopAnim(); MAP.userCamera = false; mapAnimateTo(keepReadable(fitBox(MAP.g.bbox), MAP.g)); } }
// True once after Enter or Space on a map node, so the route that follows
// leaves keyboard focus on the map instead of moving it to the content.
function consumeMapKeyNav(){ const k = !!(MAP && MAP.keyNav); if(MAP) MAP.keyNav = false; return k; }
// The node a keyboard user lands on when tabbing into the map: the one the
// route selected, else the open branch, else the centre.
function currentKey(){
  if(mapMode === 'project' && projState) return projState.part ? 'part:' + projState.part : projState.sys ? 'sys:' + projState.sys : 'c';
  if(mapMode === 'path' && pathMapState) return pathMapState.stage ? 'stage:' + pathMapState.stage : 'c';
  return mapState.topic ? 't:' + mapState.topic : mapState.dom ? 'd:' + mapState.dom : 'c';
}
/* ---- the tree: one index, two views ----
   Both views (the canvas and the phone outline) are built from the same graph
   nodes and answer to the same keys. The index lets the keyboard find a node's
   parent, its children and its neighbours in reading order without asking the DOM. */
function indexTree(g){
  const byKey = new Map(), order = [];
  const walk = (n, parent) => { byKey.set(n.key, { n, parent }); order.push(n); n.children.forEach(c => walk(c, n)); };
  if(g.nodes && g.nodes[0]) walk(g.nodes[0], null);
  return { byKey, order };
}
// Which view is showing: the outline on a phone, the canvas elsewhere.
const treeRoot = () => phoneQuery.matches ? MAP.outline : MAP.svg;
const itemFor = key => key && treeRoot().querySelector('[data-key="' + CSS.escape(key) + '"]');
// The phone outline: the graph's own nodes as nested, expandable list items.
function outlineHTML(g){
  const root = g.nodes && g.nodes[0]; if(!root) return '';
  const scope = mapMode === 'domains' ? '' : mapMode;
  const row = n => {
    const mark = n.kind === 'domain' || n.kind === 'group' ? (n.open ? '−' : '+')
      : typeof n.rd === 'boolean' ? (n.rd ? '<span class="rd-x">✓</span>' : '<span class="rd-o"></span>') : '';
    const why = n.why && (n.kind === 'leaf' || n.kind === 'item') ? `<span class="oi-why">${esc(n.why)}</span>` : '';
    return `<div class="oi-row"><span class="oi-mark" aria-hidden="true">${mark}</span><span class="oi-body"><span class="oi-t">${esc(n.label)}</span>${n.sub ? `<span class="oi-sub">${esc(n.sub)}</span>` : ''}${why}</span>${n.next ? '<span class="oi-flag" aria-hidden="true">Next</span>' : ''}</div>`;
  };
  const item = n => `<li class="${PlayableGraph.nodeClass(n)}" ${PlayableGraph.nodeAttrs(n, scope)}>${row(n)}${n.children.length ? `<ul role="group">${n.children.map(item).join('')}</ul>` : ''}</li>`;
  return `<ul role="none">${item(root)}</ul>`;
}
// Scrolls the outline so the selected item (else the open branch) sits mid-screen.
function outlineReveal(){
  const o = MAP.outline; if(!o || !phoneQuery.matches) return;
  const li = o.querySelector('[aria-selected="true"]') || o.querySelector('li.open:not([data-kind="center"])');
  const row = li && li.querySelector(':scope > .oi-row');
  if(!row){ o.scrollTop = 0; return; }
  const r = row.getBoundingClientRect(), b = o.getBoundingClientRect();
  o.scrollTop += r.top - b.top - (o.clientHeight - r.height) / 2;
}
// Draws the graph with one item in the tab order (a roving tab stop). A
// redraw replaces every node, so focus is handed to the item with the same
// key and arrow-key travel or Enter never drops the reader out of the map.
function paintGraph(){
  const hadFocus = MAP.svg.contains(document.activeElement) || MAP.outline.contains(document.activeElement);
  const g = buildGraph();
  g.focus = treeFocus(g);
  MAP.g = g; MAP.hover = null; MAP.idx = indexTree(g);
  MAP.labelPx = 0; MAP.tip.hidden = true; MAP.svg.classList.remove('dimmed');
  MAP.svg.innerHTML = g.inner;
  MAP.outline.innerHTML = phoneQuery.matches ? outlineHTML(g) : '';
  { const px = [...MAP.svg.querySelectorAll('.lbl:not(.sub)')].slice(0, 60).map(t => parseFloat(getComputedStyle(t).fontSize)).filter(Boolean); MAP.labelPx = px.length ? Math.min(...px) : 13.5; }
  const root = treeRoot(), byKey = k => k && root.querySelector('[data-key="' + CSS.escape(k) + '"]');
  const stop = byKey(MAP.focusKey) || byKey(currentKey()) || root.querySelector('[role="treeitem"]');
  if(stop){ stop.setAttribute('tabindex', '0'); if(hadFocus) stop.focus({ preventScroll: true }); }
  updateMoreCues(); applyFind();
  return g;
}
function nodeCentre(el){ const r = el.querySelector('.disc'); return { x: +r.getAttribute('x') + +r.getAttribute('width') / 2, y: +r.getAttribute('y') + +r.getAttribute('height') / 2 }; }
// Moves keyboard focus to one item and keeps it on screen: the canvas pans to
// it, the outline scrolls to it.
function focusItem(n){
  const el = itemFor(n.key); if(!el) return;
  treeRoot().querySelectorAll('[tabindex="0"]').forEach(x => x.setAttribute('tabindex', '-1'));
  el.setAttribute('tabindex', '0'); el.focus({ preventScroll: true }); MAP.focusKey = n.key;
  if(phoneQuery.matches){ el.scrollIntoView({ block: 'nearest' }); return; }
  // the whole card is brought inside the window, by the smallest move
  const d = el.querySelector('.disc'), vb = MAP.vb, m = 20;
  const bx = +d.getAttribute('x'), by = +d.getAttribute('y'), bw = +d.getAttribute('width'), bh = +d.getAttribute('height');
  const shift = (lo, size, vlo, vsize) => lo < vlo + m ? lo - m - vlo : lo + size > vlo + vsize - m ? lo + size + m - vlo - vsize : 0;
  const dx = bw + 2 * m > vb.w ? nodeCentre(el).x - vb.x - vb.w / 2 : shift(bx, bw, vb.x, vb.w), dy = bh + 2 * m > vb.h ? 0 : shift(by, bh, vb.y, vb.h);
  if(dx || dy){ MAP.userCamera = true; mapAnimateTo({ x: vb.x + dx, y: vb.y + dy, w: vb.w, h: vb.h }, 260); }
}
/* The ARIA tree keys. Down and Up walk the items in reading order; Right opens a
   closed branch or steps into an open one; Left closes an open branch or steps
   out to the parent; Home and End go to the first and last item; Enter and Space
   open. A branch on the left of the goal grows leftwards, so its Right and Left
   swap: the arrow always points the way the branch goes. */
function treeKey(e){
  const el = e.target.closest && e.target.closest('[role="treeitem"]');
  if(!el || !MAP || !MAP.idx || e.altKey || e.ctrlKey || e.metaKey) return;
  const info = MAP.idx.byKey.get(el.dataset.key); if(!info) return;
  const n = info.n, k = e.key, order = MAP.idx.order, i = order.indexOf(n);
  if(k === 'Enter' || k === ' '){ e.preventDefault(); MAP.focusKey = n.key; MAP.keyNav = true; mapClick(el); return; }
  let to = null;
  if(k === 'ArrowDown') to = order[i + 1];
  else if(k === 'ArrowUp') to = order[i - 1];
  else if(k === 'Home') to = order[0];
  else if(k === 'End') to = order[order.length - 1];
  else if(k === 'ArrowRight' || k === 'ArrowLeft'){
    const dir = k === 'ArrowRight' ? 1 : -1, expandable = el.hasAttribute('aria-expanded'), isOpen = el.getAttribute('aria-expanded') === 'true';
    if(n.kind === 'center') to = n.children.find(c => (c.side < 0 ? -1 : 1) === dir);
    else if(dir === (n.side < 0 ? -1 : 1)){
      // toward the children: open a closed branch, else step into the first child
      if(expandable && !isOpen){ e.preventDefault(); MAP.focusKey = n.key; MAP.keyNav = true; mapClick(el); return; }
      to = n.children[0];
    } else {
      // toward the goal: close an open branch (a selected topic stays), else step out to the parent
      if(expandable && isOpen && n.kind !== 'topic'){ e.preventDefault(); MAP.focusKey = n.key; MAP.keyNav = true; mapClick(el); return; }
      to = info.parent;
    }
  } else return;
  e.preventDefault();
  if(to) focusItem(to);
}
function redrawGraph(){
  if(!MAP || !document.body.contains(MAP.svg)) return;
  paintGraph();
}
function resetMapDrag(){ curState().off = {}; saveCur(); redrawGraph(); }
function resetMapDefault(){
  if(mapMode === 'project' && projState){
    const c = projCase();
    projState.sys = null; projState.part = null; projState.off = {}; projState.vb = null;
    saveProj();
    if(MAP) MAP.vb = null;
    return go('#/experience/' + (c ? c.id : projState.cs));
  }
  if(mapMode === 'path' && pathMapState){
    const pth = curPath();
    pathMapState.stage = null; pathMapState.off = {}; pathMapState.vb = null;
    savePathMap();
    if(MAP) MAP.vb = null;
    return go('#/paths/' + (pth ? pth.id : pathMapState.id));
  }
  mapState.dom = null; mapState.topic = null; mapState.smell = null;
  mapState.off = {}; mapState.vb = null;
  saveMap();
  if(MAP) MAP.vb = null;
  go('#/map/home');
}
function initMapStage(){
  if(MAP && document.body.contains(MAP.svg)) return;
  if(MAP && MAP.dispose) MAP.dispose();   // a rebuilt stage must not leave the old one's listeners behind
  const wrap = $('#mapwrap'), svg = $('#mapsvg'), tip = $('#maptip'), outline = $('#mapoutline');
  MAP = { wrap, svg, tip, outline, g:null, idx:null, vb:null, anim:null, hover:null };
  const undo = [];
  const on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); undo.push(() => target.removeEventListener(type, fn, opts)); };
  const screenToVB = (cx, cy) => { const r = svg.getBoundingClientRect(); return [MAP.vb.x + (cx - r.left)/r.width*MAP.vb.w, MAP.vb.y + (cy - r.top)/r.height*MAP.vb.h]; };
  // Zooming in stops at 120 units wide. Zooming out stops where the labels would
  // drop under MIN_LABEL_PX, so no gesture leaves them too small to read; the
  // fit button and the route targets never go past it either.
  const zoomAbout = (fx, fy, f) => {
    const vb = MAP.vb, ratio = vb.w / vb.h, cap = MAP.wrap.clientWidth > 50 && MAP.wrap.clientHeight > 50 ? readableSize() : { w: Infinity, h: Infinity };
    const floorW = Math.min(cap.w, cap.h * ratio);
    const nw = f > 1 ? Math.min(vb.w * f, Math.max(floorW, vb.w)) : Math.max(vb.w * f, 120), nh = nw / ratio;
    MAP.vb = { x: fx - (fx - vb.x)*(nw/vb.w), y: fy - (fy - vb.y)*(nh/vb.h), w: nw, h: nh };
    applyVB(svg, MAP.vb); MAP.userCamera = true; mapPersistCamera();
  };
  let drag = null, nodeDrag = null, suppressClick = false, pinch = null; const touchPts = new Map();
  const nodeKeyAt = e => { const n = e.target.closest ? e.target.closest('.node') : null; return n ? n.dataset.key : null; };
  // Offsets belong to whichever map is on stage, so a nudge on the project map
  // never lands in the domain map's saved layout.
  const startNode = (key, x, y, id) => { const off = curState().off; const o = (off && off[key]) || { x:0, y:0 }; nodeDrag = { key, id, x, y, base:{ x:o.x, y:o.y }, moved:false, els:null }; };
  // While a card is dragged, it and its branch move by a transform and the lines
  // that would stretch are dimmed; the tree is laid out and drawn once, on release.
  const dragParts = () => {
    const info = MAP.idx && MAP.idx.byKey.get(nodeDrag.key), keys = new Set();
    const walk = n => { keys.add(n.key); n.children.forEach(walk); };
    if(info) walk(info.n);
    nodeDrag.els = [...svg.querySelectorAll('.node')].filter(el => keys.has(el.dataset.key));
    nodeDrag.lines = [...svg.querySelectorAll('.edge')].map(ed => { const a = keys.has(ed.dataset.a), b = keys.has(ed.dataset.b); return a && b ? [ed, true] : a || b ? [ed, false] : null; }).filter(Boolean);
    nodeDrag.lines.forEach(([ed, moves]) => { if(!moves) ed.style.opacity = '0.15'; });
    hideWhy(); tip.hidden = true;
  };
  const moveNode = e => {
    if(nodeDrag.id !== undefined && e.pointerId !== undefined && e.pointerId !== nodeDrag.id) return;
    const r = svg.getBoundingClientRect();
    const dx = (e.clientX - nodeDrag.x)/r.width*MAP.vb.w, dy = (e.clientY - nodeDrag.y)/r.height*MAP.vb.h;
    if(Math.abs(e.clientX-nodeDrag.x)+Math.abs(e.clientY-nodeDrag.y) > 4) nodeDrag.moved = true;
    if(!nodeDrag.moved) return;
    const st = curState();
    st.off = st.off || {};
    st.off[nodeDrag.key] = { x: nodeDrag.base.x + dx, y: nodeDrag.base.y + dy };
    if(!nodeDrag.els) dragParts();
    const t = `translate(${dx} ${dy})`;
    nodeDrag.els.forEach(el => el.setAttribute('transform', t));
    nodeDrag.lines.forEach(([ed, moves]) => { if(moves) ed.setAttribute('transform', t); });
  };
  const dropNode = () => { const moved = nodeDrag && nodeDrag.moved; nodeDrag = null; if(moved) redrawGraph(); return moved; };
  on(svg, 'pointerdown', e => {
    if(e.pointerType === 'touch'){ touchPts.set(e.pointerId, { x:e.clientX, y:e.clientY }); mapStopAnim();
      if(touchPts.size === 1){ const key = nodeKeyAt(e); if(key) startNode(key, e.clientX, e.clientY, e.pointerId); else drag = { x:e.clientX, y:e.clientY, vx:MAP.vb.x, vy:MAP.vb.y, moved:false }; }
      else if(touchPts.size === 2){ drag = null; dropNode(); const p = [...touchPts.values()]; pinch = { dist: Math.hypot(p[0].x-p[1].x, p[0].y-p[1].y) }; }
      return; }
    if(e.button !== 0) return; mapStopAnim();
    const key = nodeKeyAt(e);
    if(key) startNode(key, e.clientX, e.clientY, e.pointerId);
    else drag = { x:e.clientX, y:e.clientY, vx:MAP.vb.x, vy:MAP.vb.y, moved:false };
  });
  const panBy = e => { const r = svg.getBoundingClientRect(); const dx = (e.clientX - drag.x)/r.width*MAP.vb.w, dy = (e.clientY - drag.y)/r.height*MAP.vb.h; if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y) > 5) drag.moved = true; if(drag.moved){ MAP.vb = Object.assign({}, MAP.vb, { x: drag.vx - dx, y: drag.vy - dy }); applyVB(svg, MAP.vb); } };
  const onMove = e => {
    if(!document.body.contains(svg)) return;
    if(e.pointerType === 'touch'){
      if(touchPts.has(e.pointerId)) touchPts.set(e.pointerId, { x:e.clientX, y:e.clientY });
      if(touchPts.size >= 2 && pinch){ const p = [...touchPts.values()]; const dist = Math.hypot(p[0].x-p[1].x, p[0].y-p[1].y); if(dist > 0){ const mid = screenToVB((p[0].x+p[1].x)/2, (p[0].y+p[1].y)/2); zoomAbout(mid[0], mid[1], pinch.dist/dist); pinch = { dist }; suppressClick = true; } }
      else if(touchPts.size === 1){ if(nodeDrag) moveNode(e); else if(drag) panBy(e); }
      return;
    }
    if(nodeDrag){ moveNode(e); return; }
    if(drag) panBy(e);
  };
  const onUp = e => {
    if(nodeDrag){ if(nodeDrag.moved){ saveCur(); suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); } dropNode(); if(!e || e.pointerType !== 'touch'){ drag = null; return; } }
    if(e && e.pointerType === 'touch'){ touchPts.delete(e.pointerId); if(touchPts.size < 2) pinch = null; if(touchPts.size === 1){ const p = [...touchPts.values()][0]; drag = { x:p.x, y:p.y, vx:MAP.vb.x, vy:MAP.vb.y, moved:false }; } else if(touchPts.size === 0){ drag = null; if(suppressClick) setTimeout(() => { suppressClick = false; }, 60); } mapPersistCamera(); return; }
    if(drag && drag.moved){ MAP.userCamera = true; mapPersistCamera(); suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); } drag = null; };
  on(window, 'pointermove', onMove); on(window, 'pointerup', onUp); on(window, 'pointercancel', onUp);
  on(window, 'blur', () => { touchPts.clear(); pinch = null; drag = null; dropNode(); });
  on(svg, 'wheel', e => { e.preventDefault(); mapStopAnim(); const p = screenToVB(e.clientX, e.clientY); zoomAbout(p[0], p[1], e.deltaY > 0 ? 1.12 : 1/1.12); }, {passive:false});
  on(svg, 'pointermove', e => { if(e.pointerType === 'touch' || nodeDrag || drag) return; const n = e.target.closest ? e.target.closest('.node') : null; mapHover(n, e); });
  on(svg, 'pointerleave', () => { if(!nodeDrag && !drag) mapHover(null); });
  on(svg, 'click', e => { if(suppressClick) return; const n = e.target.closest ? e.target.closest('.node') : null; if(n) mapClick(n); });
  on(svg, 'keydown', treeKey);
  on(svg, 'focusin', e => { const n = e.target.closest && e.target.closest('.node'); if(n) showWhy(n, true); });
  on(svg, 'focusout', () => hideWhy());
  // the phone outline: a tap on a row is a click on its item
  on(outline, 'click', e => { const row = e.target.closest && e.target.closest('.oi-row'); if(row){ const li = row.parentElement; MAP.focusKey = li.dataset.key; mapClick(li); } });
  on(outline, 'keydown', treeKey);
  $('#mapFit').onclick = fitMap;
  const fi = $('#mapFind'), fn = $('#mapFindN');
  if(fi){
    MAP.find = { q:'', matches:[], ids:new Set(), doms:new Set(), idx:-1 };
    let ft = 0;
    const run = () => {
      clearTimeout(ft); ft = 0;
      const q = fi.value, m = findMatches(q);
      MAP.find = { q, matches:m, ids:new Set(m.filter(x => x.kind === 't').map(x => x.id)), doms:new Set(m.map(x => x.dom)), idx:-1 };
      const sum = findSummary(MAP.find);
      const away = m.filter(x => x.lens !== currentLens()[0]).length;
      fn.textContent = sum && m.length ? m.length + (m.length === 1 ? ' match' : ' matches') + (away ? ' · ' + away + ' other lens' : '') : sum; fn.title = sum;
      applyFind();
      say(q.trim() ? sum + (m.length ? '. Enter opens ' + m[0].title + '.' : '.') : 'Find cleared');
    };
    on(fi, 'input', () => { clearTimeout(ft); ft = setTimeout(run, 120); });
    on(fi, 'keydown', e => {
      if(e.key === 'Escape'){ if(fi.value){ e.preventDefault(); e.stopPropagation(); fi.value = ''; run(); } return; }
      if(e.key !== 'Enter') return;
      e.preventDefault();
      if(ft || MAP.find.q !== fi.value) run();
      const f = MAP.find; if(!f.matches.length) return;
      f.idx = (f.idx + 1) % f.matches.length;
      const m = f.matches[f.idx], to = m.kind === 't' ? '#/map/t/' + m.id : '#/map/d/' + m.id;
      f.quiet = true; applyFind();   // the rings have done their job once a match is opened
      A.pinMap(); MAP.keyNav = true; setTimeout(() => { if(MAP) MAP.keyNav = false; }, 800);
      say('Opening ' + m.title + (m.lens !== currentLens()[0] ? ', in ' + (LENSES.find(l => l[0] === m.lens) || [0, m.lens])[1] : ''));
      if(location.hash === to) return;
      go(to);
    });
  }
  // a "N more" pill pans the window most of the way toward the leaves it counts
  on($('#mapmore'), 'click', e => {
    const b = e.target.closest && e.target.closest('.morecue'); if(!b || !MAP.vb) return;
    const d = b.dataset.dir, vb = MAP.vb; mapStopAnim(); MAP.userCamera = true;
    mapAnimateTo({ x: vb.x + (d === 'r' ? vb.w * 0.8 : d === 'l' ? -vb.w * 0.8 : 0), y: vb.y + (d === 'd' ? vb.h * 0.8 : d === 'u' ? -vb.h * 0.8 : 0), w: vb.w, h: vb.h }, 320);
  });
  const lgBtn = $('#mapLegendBtn'), lg = $('#maplegend');
  if(lgBtn && lg){
    lg.innerHTML = legendHTML();
    const setLegend = on => { lg.hidden = !on; lgBtn.setAttribute('aria-expanded', on); lgBtn.classList.toggle('on', on); };
    setLegend(!!store.get('mapLegend', false));
    lgBtn.onclick = () => { const on = lg.hidden; setLegend(on); store.set('mapLegend', on); };
  }
  // When the stage changes size (window, rotation, a panel collapsed or
  // dragged) the camera is framed again, unless the reader moved it.
  let resizeT = 0;
  const ro = new ResizeObserver(() => { clearTimeout(resizeT); resizeT = setTimeout(() => {
    if(!MAP.g || !document.body.contains(svg) || wrap.clientWidth < 50) return;
    // crossing the two-sided width swaps the tree's shape
    if(oneSidedNow() !== MAP.oneSided){
      mapStopAnim(); MAP.userCamera = false; paintGraph();
      // the stage was first measured before it settled: put back the camera the reader left
      if(MAP.restoredCam){ MAP.vb = keepReadable(MAP.restoredCam, MAP.g); MAP.restoredCam = null; MAP.userCamera = true; applyVB(svg, MAP.vb); return; }
    }
    MAP.restoredCam = null;
    if(MAP.userCamera) return;
    mapStopAnim(); const t = stageTarget(MAP.g, MAP.kind, MAP.vb); MAP.vb = t; applyVB(svg, t); mapPersistCamera();
  }, 150); });
  ro.observe(wrap);
  MAP.dispose = () => { undo.forEach(f => f()); ro.disconnect(); clearTimeout(resizeT); };
  $('#mapResetDrag').onclick = resetMapDrag;
  $('#mapResetDefault').onclick = resetMapDefault;
  $('#mapZoomIn').onclick = () => zoomAbout(MAP.vb.x + MAP.vb.w/2, MAP.vb.y + MAP.vb.h/2, 1/1.15);
  $('#mapZoomOut').onclick = () => zoomAbout(MAP.vb.x + MAP.vb.w/2, MAP.vb.y + MAP.vb.h/2, 1.15);
}
function treeFocus(g){
  if(!g.nodes) return null;
  const openId = mapMode === 'project' ? (projState && projState.sys) : mapMode === 'path' ? (pathMapState && pathMapState.stage) : mapState.dom;
  const dom = openId ? g.nodes.find(n => n.kind==='domain' && n.id===openId) : null;
  if(!dom) return null;
  const xs = [], ys = [];
  const walk = n => { xs.push(n.x, n.x + n.w); ys.push(n.y - n.h/2, n.y + n.h/2); (n.children || []).forEach(walk); };
  walk(dom);
  const top = Math.min(...ys) - 20, bot = Math.max(...ys) + 20;
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  return { x: minX - 20, y: top, w: maxX - minX + 40, h: bot - top };
}
// `stageKey` is the mode plus, in project mode, which project: switching stage
// swaps the camera for the one that stage last had instead of carrying the
// other map's viewBox across.
let mapStage = null;
// What the colours, marks and lines on the guide map mean. The swatches use the
// map's own classes, so they cannot drift from the nodes they describe.
function legendHTML(){
  const sw = (c, t) => `<span class="lgi"><svg class="lgsw" viewBox="0 0 26 14" aria-hidden="true"><rect class="${c}" x="1" y="1" width="24" height="12" rx="3"/></svg>${t}</span>`;
  const ln = (c, t) => `<span class="lgi"><svg class="lgsw" viewBox="0 0 26 14" aria-hidden="true"><path class="edge ${c}" d="M1,7 L25,7"/></svg>${t}</span>`;
  const rd = (on, t) => `<span class="lgi"><svg class="lgsw" viewBox="0 0 14 14" aria-hidden="true"><circle class="rd${on ? ' on' : ''}" cx="7" cy="7" r="6"/>${on ? '<text class="chk" x="7" y="10.5" text-anchor="middle" font-size="9">✓</text>' : ''}</svg>${t}</span>`;
  return `<div class="lgrow"><b>Cards</b><div class="lgset">${sw('domain', 'Domain: its colour marks its topics')}${sw('topic', 'Topic')}${rd(true, 'Read')}${rd(false, 'Not read yet')}</div></div>
    <div class="lgrow"><b>Topics around it</b><div class="lgset">${sw('leaf', 'Related topic')}${sw('leaf other', 'Also in the other lens (click to switch)')}${sw('group', 'Group: click to open or close')}</div></div>
    <div class="lgrow"><b>Other links</b><div class="lgset">${sw('item t-game', '◇ Game')}${sw('item t-smell', '! Smell')}${sw('item t-tool', 'Tool')}${sw('item t-checklist', 'Checklist')}${sw('item t-prompt', 'Prompt')}${sw('item t-path', 'Path')}${sw('item t-part', '◆ Project part')}</div></div>
    <div class="lgrow"><b>Lines</b><div class="lgset">${ln('open', 'Parent to child')}${ln('dd', 'Domains that connect')}${ln('cross', 'Topic to another domain')}${ln('home', 'Related topic to its own domain')}</div></div>`;
}
function renderTree(kind){
  if(!MAP || !document.body.contains(MAP.svg)) initMapStage();
  const st = curState();
  const g = paintGraph();
  const bar = $('.mapbar .mapcrumbs'); if(bar) bar.innerHTML = mapCrumbs();
  updateNext();
  const stageKey = mapMode === 'project' && projState ? 'project:' + projState.cs : mapMode === 'path' && pathMapState ? 'path:' + pathMapState.id : 'domains';
  const stored = savedCamera(st.vb);
  // Coming back to a stage (a reload, or another map and back) restores the
  // camera the reader left, exactly; only a move within the stage re-frames.
  // (the shell draws once as 'home' before the route draws the real place: both restore)
  const restore = (mapStage !== stageKey || MAP.bootHome) && !!stored && !phoneQuery.matches && g.focus;
  if(mapStage !== stageKey){
    mapStage = stageKey; mapStopAnim();
    MAP.vb = stored ? Object.assign({}, stored) : null;
    if(MAP.vb) applyVB(MAP.svg, MAP.vb);
  }
  if(!MAP.vb){ MAP.vb = fitBox(g.bbox); applyVB(MAP.svg, MAP.vb); }
  // drawing the same place again (not a move to another) keeps a camera the reader has set
  const sig = JSON.stringify([kind, mapMode, mapState.dom, mapState.topic, mapState.smell, projState && [projState.cs, projState.sys, projState.part], pathMapState && [pathMapState.id, pathMapState.stage]]);
  const again = sig === MAP.sig && MAP.userCamera && !phoneQuery.matches; MAP.bootHome = !MAP.sig && kind === 'home'; MAP.sig = sig;
  MAP.kind = kind; MAP.userCamera = !!restore || again; MAP.restoredCam = restore ? Object.assign({}, stored) : null;
  if(again) return outlineReveal();
  if(restore) mapAnimateTo(keepReadable(Object.assign({}, stored), g), 0);
  else mapAnimateTo(stageTarget(g, kind, stored || MAP.vb));
  outlineReveal();
}
// `tab` is the fourth route part (#/map/t/<id>/<tab>). It selects which topic
// view the content pane shows and is deliberately kept out of mapState: the
// tree does not change when the tab does.
function renderMap(kind, id, tab){
  mapMode = 'domains';
  if(!kind || kind==='home'){ mapState.dom = null; mapState.topic = null; mapState.smell = null; }
  else if(kind==='d' && DOM[id]){ mapState.dom = id; mapState.topic = null; mapState.smell = null; mapState.lens = lensOf(id); }
  else if(kind==='t' && TOPICS[id]){ if(mapState.topic !== id) mapState.grp = {}; mapState.dom = TOPICS[id].d; mapState.topic = id; mapState.smell = null; mapState.lens = lensOf(TOPICS[id].d); setTopicTab(TOPICS[id], tab); }
  else if(kind==='s' && SMELLS.some(s => s.id===id)){ mapState.smell = id; }
  saveMap();
  setView(drawerHTML());
  renderTree(kind);
}
// The centre stage shows either the guide map or one project's map. Every
// route that is not a project page puts it back to the guide map, whose own
// state (open domain, selected topic, node offsets, camera) was never touched
// while the project map was up.
function syncMapMode(view, id){
  if(mapMode === 'project'){
    if(view === 'experience' && id && CASE_STUDIES.some(c => c.id === id)) return;
  } else if(mapMode === 'path'){
    if(view === 'paths' && id && pathMapState && pathMapState.id === id) return;
  } else return;
  mapMode = 'domains';
  if(view !== 'map' && MAP && MAP.g) renderTree();
}

// Crossing the phone width swaps the two-sided tree for the one-sided one.
phoneQuery.addEventListener('change', () => { if(MAP && MAP.g && document.body.contains(MAP.svg)) renderTree(MAP.kind); });
// A topic was marked read or unread: the map's marks, counts and next-unread cue follow.
function mapProgress(){
  if(!MAP || !MAP.g || mapMode !== 'domains' || !document.body.contains(MAP.svg)) return;
  paintGraph(); updateNext();
}
// Keyboard shortcut past the header and the index rail: "Skip to the map" is
// offered whenever a map is drawn. If the topic page has the map folded away it
// is shown first (the page's own Show map toggle), then focus lands on the
// map's single tab stop.
{
  const sk = $('#skipBtn'), sm = $('#skipMapBtn');
  const drawn = () => !!(MAP && document.body.contains(MAP.svg));
  const visible = () => drawn() && MAP.wrap.getClientRects().length > 0;
  const focusMap = () => {
    if(!visible()) return;
    const stop = treeRoot().querySelector('[tabindex="0"]') || treeRoot().querySelector('[role="treeitem"]');
    if(stop){ stop.setAttribute('tabindex', '0'); stop.focus({ preventScroll: true }); }
  };
  sk.addEventListener('focus', () => { sm.hidden = !drawn(); });
  sm.addEventListener('click', () => {
    if(!drawn()) return;
    if(visible()) return focusMap();
    const t = document.querySelector('#pane [data-action="toggle-map"]');
    if(t){ t.click(); setTimeout(focusMap, 750); }
  });
}
Object.assign(A, { SYMPTOMS, mapProgress, lensSwitchHTML, renderMap, renderTree, syncMapMode, enterProject, enterPathMap, fitMap, consumeMapKeyNav, currentLens, setLens });
})(window.PlayableApp);
