/* =====================================================================
   PERSISTENT MIND MAP (centre) + INDEX (left) + CONTENT (right)
   The map is always on screen. It is a horizontal collapsible tidy tree,
   not a circle, so it grows by stacking and panning rather than shrinking.
   Routes: #/map  #/map/d/<domain>  #/map/t/<topic>  #/map/s/<smell>  #/map/home
   ===================================================================== */
const START_PATHS = [
  ['#/lab','I want to shape an idea','Observe a signal, find the tension, turn it into a design question, design mechanisms and test them.',''],
  ['#/build/dissect','I have an idea and want to know if it is good','Cross-reference it against games that already won the audience you want.','var(--accent2)'],
  ['#/build/ladder','I have a feature idea','Climb from the feature to the behavior, then decide whether to build it.','var(--d-core)'],
  ['#/diagnose','I have a design problem','Start from the symptom: likely causes, experiments and a prompt.','var(--bad)']
];
function startPathsHTML(){
  return START_PATHS.map(([href, b, s, c]) => `<button class="path" onclick="location.hash='${href}'"${c?` style="border-left-color:${c}"`:''}><b>${esc(b)}</b><span>${esc(s)}</span></button>`).join('');
}
const SYMPTOMS = [
  ['I do not have an idea','no-idea'],['Players do not know what to do','dont-know-what-to-do'],['The game feels repetitive','repetitive'],
  ['Players use only one build','one-build'],['They enjoy it but do not return','fun-but-no-return'],['Progression is just numbers','meaningless-progression'],
  ['Combat feels floaty','floaty-combat'],['Players say it is unfair','unfair'],['Too many features, not better','features-not-better'],['AI keeps giving generic ideas','ai-ideas-none-right']
];
function symptomsHTML(){ return `<div class="symptoms">${SYMPTOMS.map(([s,id]) => `<button class="symptom" onclick="location.hash='#/smell/${id}'">${esc(s)}</button>`).join('')}<a class="symptom more" href="#/diagnose/smells">All ${SMELLS.length} smells →</a></div>`; }
function openStart(){ closeModals(); const el = $('#startPaths'); if(el) el.innerHTML = startPathsHTML(); $('#startModal').classList.add('show'); }
{ const sc = $('#startClose'); if(sc) sc.onclick = () => closeModals(); }

const mapState = Object.assign({ dom:null, topic:null, smell:null, vb:null }, store.get('mapState', {}));
function saveMap(){ store.set('mapState', mapState); }

/* ---- two maps, one stage ----
   'domains' draws the guide. 'project' draws one case study as systems and
   parts. The two states never touch: leaving a project restores the domain
   map exactly as it was, and coming back to a project restores that project.
   Each project keeps its own open system, selected part, node offsets and
   camera under projMap.<cs>. */
let mapMode = 'domains';
let projState = null;
function saveProj(){ if(projState) store.set('projMap.' + projState.cs, projState); }
function projCase(){ return projState ? CASE_STUDIES.find(x => x.id === projState.cs) : null; }
// Called by the router before the pane renders: the route is the truth about
// which system is open and which part is selected, the store only supplies the
// camera and the dragged-node offsets.
function enterProject(c, s, p){
  if(!projState || projState.cs !== c.id) projState = Object.assign({ sys:null, part:null, off:{}, vb:null }, store.get('projMap.' + c.id, {}), { cs:c.id });
  projState.sys = s ? s.id : null;
  projState.part = p ? p.id : null;
  mapMode = 'project';
  saveProj();
}
function curState(){ return mapMode === 'project' && projState ? projState : mapState; }
function saveCur(){ if(mapMode === 'project') saveProj(); else saveMap(); }
// The domain map's fourth layer gains the project parts that demonstrate the
// selected topic. They are runtime links, not data, so they ride along on a
// copy of mapState instead of being stored in it.
function buildGraph(){
  const c = projCase();
  if(mapMode === 'project' && c) return PlayableGraph.buildProject(c, projState, TOPICS, DOMAINS);
  const pr = practice();
  return PlayableGraph.build(Object.assign({}, mapState, { extra: (mapState.topic && pr.extra[mapState.topic]) || [] }), seen, VIEW_LINKS);
}

function mapCrumbs(){
  if(mapMode === 'project'){
    const c = projCase(); if(!c) return `<div class="mapcrumbs"></div>`;
    const s = (c.systems || []).find(x => x.id === projState.sys);
    const parts = [`<button onclick="location.hash='#/experience'">Projects</button>`, `<span>›</span><button onclick="location.hash='#/experience/${c.id}'">${esc(c.t)}</button>`];
    if(s) parts.push(`<span>›</span><button onclick="location.hash='#/experience/${c.id}/${s.id}'">${esc(s.t)}</button>`);
    const p = s ? (s.parts || []).find(x => x.id === projState.part) : null;
    if(p) parts.push(`<span>›</span><b>${esc(p.t)}</b>`);
    return `<div class="mapcrumbs">${parts.join('')}</div>`;
  }
  const parts = [`<button onclick="location.hash='#/map/home'">All domains</button>`];
  if(mapState.dom && DOM[mapState.dom]) parts.push(`<span>›</span><button onclick="location.hash='#/map/d/${mapState.dom}'">${esc(DOM[mapState.dom].t)}</button>`);
  if(mapState.topic && TOPICS[mapState.topic]) parts.push(`<span>›</span><button onclick="location.hash='#/map/t/${mapState.topic}'">${esc(TOPICS[mapState.topic].t)}</button>`);
  if(mapState.smell){ const s = SMELLS.find(x => x.id===mapState.smell); if(s) parts.push(`<span>›</span><b>${esc(s.t)}</b>`); }
  return `<div class="mapcrumbs">${parts.join('')}</div>`;
}
function startPanel(){
  return `<span class="overline">Field manual · ${TOPIC_LIST.length} topics · ${SMELLS.length} smells · ${TOOLS.length} tools</span>
    <h1 style="margin:6px 0 8px">Make something people want to play.</h1>
    <p class="dim">The mind map on the left is always here. Click a domain to expand it in place, click a topic to read it in this panel. The index and the map do the same work, so use whichever suits you.</p>
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
  const links = d.links.map(([to, why]) => `<li><b style="color:${DOM[to].color};cursor:pointer" onclick="location.hash='#/map/d/${to}'">${esc(DOM[to].t)}</b> <span class="why">${esc(why)}</span></li>`).join('');
  const inbound = DOMAINS.filter(o => o.links.some(([to]) => to===d.id) && !d.links.some(([to]) => to===o.id)).map(o => { const why = o.links.find(([to]) => to===d.id)[1]; return `<li><b style="color:${o.color};cursor:pointer" onclick="location.hash='#/map/d/${o.id}'">${esc(o.t)}</b> <span class="why">${esc(why)}</span></li>`; }).join('');
  return `<div class="chips" style="margin-bottom:6px">${domChip(d.id)}<span class="chip">${d.topics.length} topics · ${d.topics.filter(t=>seen.has(t)).length} read</span></div><h1 style="margin-bottom:6px">${esc(d.t)}</h1><p class="dim">${esc(d.sum)}</p>
    <h4>Topics</h4><div class="grid auto" style="margin-bottom:14px">${d.topics.map(t => `<div class="card clickable tint" style="--dc:${d.color};padding:10px 12px" onclick="location.hash='#/map/t/${t}'"><b>${esc(TOPICS[t].t)}</b> ${seen.has(t)?'<span class="chip ok">read</span>':''}<div class="small dim">${esc(TOPICS[t].tag)}</div></div>`).join('')}</div>
    <h4>Why it connects</h4><ul class="mapside-list">${links}${inbound}</ul>`;
}
function drawerHTML(){
  if(mapState.smell){ const s = SMELLS.find(x => x.id===mapState.smell); if(s) return `<div class="row between" style="margin-bottom:8px"><button class="btn sm ghost" onclick="location.hash='${mapState.topic ? '#/map/t/'+mapState.topic : mapState.dom ? '#/map/d/'+mapState.dom : '#/map/home'}'">← back</button><a class="btn sm" href="#/smell/${s.id}">Open in Diagnose</a></div>${smellsView(s.id).replace(/<div class="row between">.*?<\/div>\s*<h2/s, '<h2')}`; }
  if(mapState.topic && TOPICS[mapState.topic]) return topicBody(mapState.topic);
  if(mapState.dom && DOM[mapState.dom]) return domainPanel(DOM[mapState.dom]);
  return startPanel();
}

/* ---- camera ---- */
function fitBox(b){ const A = 1.18; let {x,y,w,h} = b; if(w/h < A){ const nw = h*A; x -= (nw-w)/2; w = nw; } else { const nh = w/A; y -= (nh-h)/2; h = nh; } return {x,y,w,h}; }
function applyVB(svg, vb){ svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`); }
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
function mapAnimateTo(to, ms=480){
  const M = MAP; if(!M) return; if(M.anim) cancelFrame(M.anim.h);
  const from = Object.assign({}, M.vb); const t0 = performance.now(); const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
  const step = now => { const k = Math.min(1, (now - t0)/ms), e = ease(k); M.vb = { x: from.x + (to.x-from.x)*e, y: from.y + (to.y-from.y)*e, w: from.w + (to.w-from.w)*e, h: from.h + (to.h-from.h)*e }; applyVB(M.svg, M.vb); if(k < 1) M.anim.h = nextFrame(step); else { M.anim = null; M.vb = to; applyVB(M.svg, to); mapPersistCamera(); } };
  M.anim = { h: nextFrame(step) };
}
function mapStopAnim(){ if(MAP && MAP.anim){ cancelFrame(MAP.anim.h); MAP.anim = null; } }
function mapPersistCamera(){ if(!MAP) return; curState().vb = { x:MAP.vb.x, y:MAP.vb.y, w:MAP.vb.w, h:MAP.vb.h }; saveCur(); }

function projTipHTML(n){
  const kind = n.dataset.kind, id = n.dataset.id, why = n.dataset.why || '';
  const c = projCase(); if(!c) return '';
  if(kind==='center') return `<b style="color:var(--accent2)">${esc(c.t)}</b><div>${esc(c.role)} · ${esc(c.period)}</div><div class="muted">${projState.sys ? 'click to collapse back to the project' : 'click to read the project page'}</div>`;
  if(kind==='domain'){ const s = (c.systems||[]).find(x => x.id===id); if(!s) return ''; return `<b style="color:${KIND_COLOR[s.kind]||'var(--accent2)'}">${esc(s.t)}</b><div>${esc(s.sum)}</div><div class="muted">${n.classList.contains('open')?'click to collapse':`click to open its ${(s.parts||[]).length} parts`}</div>`; }
  if(kind==='topic'){ const s = (c.systems||[]).find(x => x.id===projState.sys); const p = s && (s.parts||[]).find(x => x.id===id); if(!p) return ''; return `<b>${esc(p.t)}</b><div>${esc(p.why)}</div><div class="muted">click to read this part</div>`; }
  if(kind==='leaf'){ const t = TOPICS[id]; if(!t) return ''; return `<b>${esc(t.t)}</b><div>${esc(t.tag)}</div>${why?`<div class="why"><b>What it demonstrates:</b> ${esc(why)}</div>`:''}<div class="muted">click to read the topic on the guide map</div>`; }
  return '';
}
function mapTipHTML(n){
  if(n.dataset.scope === 'project') return projTipHTML(n);
  const kind = n.dataset.kind, id = n.dataset.id, why = n.dataset.why || '';
  if(kind==='center') return `<b>Make something people want to play</b><div class="muted">${mapState.dom || mapState.topic || mapState.smell ? 'click to reset the branch' : 'click for the starting paths'}</div>`;
  if(kind==='domain'){ const d = DOM[id]; return `<b style="color:${d.color}">${esc(d.t)}</b><div>${esc(d.short)}</div><div class="muted">${n.classList.contains('open')?'click to collapse':'click to expand and read'}</div>`; }
  if(kind==='topic'){ const t = TOPICS[id]; return `<b>${esc(t.t)}</b><div>${esc(t.tag)}</div><div class="muted">click to read in the panel</div>`; }
  if(kind==='leaf'){ const t = TOPICS[id]; if(!t) return ''; return `<b>${esc(t.t)}</b><div>${esc(t.tag)}</div>${why?`<div class="why"><b>Why it connects:</b> ${esc(why)}</div>`:''}<div class="muted">click to open this concept</div>`; }
  if(kind==='smell'){ const s = SMELLS.find(x => x.id===id); return `<b style="color:var(--bad)">Design smell</b><div>${esc(s?s.t:id)}</div>${why?`<div class="why">${esc(why)}</div>`:''}<div class="muted">click to open in Diagnose</div>`; }
  if(kind==='view'){ const v = VIEW_LINKS[id];
    // v[2] is only set on the runtime "seen in practice" links, where it names
    // the project the part belongs to.
    if(v && v[2]) return `<b style="color:var(--accent2)">Seen in practice</b><div>${esc(v[2])}</div><div>${esc(v[1].replace(/^◆\s*/, ''))}</div>${why?`<div class="why">${esc(why)}</div>`:''}<div class="muted">click to open that part of the project</div>`;
    return `<b style="color:var(--accent2)">Tool</b><div>${esc(v?v[1]:id)}</div>${why?`<div class="why">${esc(why)}</div>`:''}<div class="muted">click to open</div>`; }
  return '';
}
function mapMoveTip(e){ const M = MAP; const r = M.wrap.getBoundingClientRect(); let x = e.clientX - r.left + 14, y = e.clientY - r.top + 14; if(x + 260 > r.width) x -= 280; if(y + 90 > r.height) y -= 100; M.tip.style.left = x + 'px'; M.tip.style.top = y + 'px'; }
function mapHover(n, e){
  const M = MAP; if(M.hover === n){ if(n && e) mapMoveTip(e); return; }
  if(M.hover){ M.svg.classList.remove('dimmed'); $$('.hl', M.svg).forEach(x => x.classList.remove('hl')); M.tip.hidden = true; }
  M.hover = n; if(!n) return;
  const key = n.dataset.key;
  M.svg.classList.add('dimmed'); n.classList.add('hl');
  $$('.edge', M.svg).forEach(ed => { const hit = ed.dataset.a === key || ed.dataset.b === key; ed.classList.toggle('hl', hit); if(hit){ const other = ed.dataset.a === key ? ed.dataset.b : ed.dataset.a; const on = other && M.svg.querySelector(`.node[data-key="${other}"]`); if(on) on.classList.add('hl'); } });
  if(e && e.pointerType !== 'touch'){ M.tip.innerHTML = mapTipHTML(n); M.tip.hidden = false; mapMoveTip(e); }
}
function projClick(n){
  const kind = n.dataset.kind, id = n.dataset.id, c = projCase();
  if(!c) return;
  if(kind==='center') return go(`#/experience/${c.id}`);
  if(kind==='domain') return go(n.classList.contains('open') ? `#/experience/${c.id}` : `#/experience/${c.id}/${id}`);
  if(kind==='topic') return go(`#/experience/${c.id}/${projState.sys}/${id}`);
  if(kind==='leaf') return go('#/map/t/' + id);
}
function mapClick(n){
  if(n.dataset.scope === 'project') return projClick(n);
  const kind = n.dataset.kind, id = n.dataset.id;
  if(kind==='center'){ if(mapState.dom || mapState.topic || mapState.smell) return go('#/map/home'); return openStart(); }
  if(kind==='domain') return go(n.classList.contains('open') ? '#/map/home' : '#/map/d/'+id);
  if(kind==='topic') return go('#/map/t/'+id);
  if(kind==='leaf') return go('#/map/t/'+id);
  if(kind==='smell') return go('#/map/s/'+id);
  if(kind==='view'){ const v = VIEW_LINKS[id]; if(v) go(v[0]); }
}

function fitMap(){ if(MAP && MAP.g){ mapStopAnim(); mapAnimateTo(fitBox(MAP.g.bbox)); } }
window.__fitMap = fitMap;
function redrawGraph(){
  if(!MAP || !document.body.contains(MAP.svg)) return;
  const g = buildGraph();
  g.focus = treeFocus(g);
  MAP.g = g; MAP.hover = null; MAP.tip.hidden = true; MAP.svg.classList.remove('dimmed');
  MAP.svg.innerHTML = g.inner;
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
  mapState.dom = null; mapState.topic = null; mapState.smell = null;
  mapState.off = {}; mapState.vb = null;
  saveMap();
  if(MAP) MAP.vb = null;
  go('#/map/home');
}
function initMapStage(){
  if(MAP && document.body.contains(MAP.svg)) return;
  const wrap = $('#mapwrap'), svg = $('#mapsvg'), tip = $('#maptip');
  MAP = { wrap, svg, tip, g:null, vb:null, anim:null, hover:null };
  const screenToVB = (cx, cy) => { const r = svg.getBoundingClientRect(); return [MAP.vb.x + (cx - r.left)/r.width*MAP.vb.w, MAP.vb.y + (cy - r.top)/r.height*MAP.vb.h]; };
  const zoomAbout = (fx, fy, f) => { const vb = MAP.vb, fit = fitBox(MAP.g ? MAP.g.bbox : vb); const nw = Math.min(Math.max(vb.w*f, 120), fit.w*3), nh = nw/(vb.w/vb.h); MAP.vb = { x: fx - (fx - vb.x)*(nw/vb.w), y: fy - (fy - vb.y)*(nh/vb.h), w: nw, h: nh }; applyVB(svg, MAP.vb); mapPersistCamera(); };
  let drag = null, nodeDrag = null, suppressClick = false, pinch = null, raf = 0; const touchPts = new Map();
  const nodeKeyAt = e => { const n = e.target.closest ? e.target.closest('.node') : null; return n ? n.dataset.key : null; };
  // Offsets belong to whichever map is on stage, so a nudge on the project map
  // never lands in the domain map's saved layout.
  const startNode = (key, x, y, id) => { const off = curState().off; const o = (off && off[key]) || { x:0, y:0 }; nodeDrag = { key, id, x, y, base:{ x:o.x, y:o.y }, moved:false }; };
  const moveNode = e => {
    if(nodeDrag.id !== undefined && e.pointerId !== undefined && e.pointerId !== nodeDrag.id) return;
    const r = svg.getBoundingClientRect();
    const dx = (e.clientX - nodeDrag.x)/r.width*MAP.vb.w, dy = (e.clientY - nodeDrag.y)/r.height*MAP.vb.h;
    if(Math.abs(e.clientX-nodeDrag.x)+Math.abs(e.clientY-nodeDrag.y) > 4) nodeDrag.moved = true;
    if(!nodeDrag.moved) return;
    const st = curState();
    st.off = st.off || {};
    st.off[nodeDrag.key] = { x: nodeDrag.base.x + dx, y: nodeDrag.base.y + dy };
    if(!raf) raf = requestAnimationFrame(() => { raf = 0; redrawGraph(); });
  };
  svg.addEventListener('pointerdown', e => {
    if(e.pointerType === 'touch'){ touchPts.set(e.pointerId, { x:e.clientX, y:e.clientY }); mapStopAnim();
      if(touchPts.size === 1){ const key = nodeKeyAt(e); if(key) startNode(key, e.clientX, e.clientY, e.pointerId); else drag = { x:e.clientX, y:e.clientY, vx:MAP.vb.x, vy:MAP.vb.y, moved:false }; }
      else if(touchPts.size === 2){ drag = null; nodeDrag = null; const p = [...touchPts.values()]; pinch = { dist: Math.hypot(p[0].x-p[1].x, p[0].y-p[1].y) }; }
      return; }
    if(e.button !== 0) return; mapStopAnim();
    const key = nodeKeyAt(e);
    if(key) startNode(key, e.clientX, e.clientY, e.pointerId);
    else drag = { x:e.clientX, y:e.clientY, vx:MAP.vb.x, vy:MAP.vb.y, moved:false };
  });
  const onMove = e => {
    if(!document.body.contains(svg)) return;
    if(e.pointerType === 'touch'){
      if(touchPts.has(e.pointerId)) touchPts.set(e.pointerId, { x:e.clientX, y:e.clientY });
      if(touchPts.size >= 2 && pinch){ const p = [...touchPts.values()]; const dist = Math.hypot(p[0].x-p[1].x, p[0].y-p[1].y); if(dist > 0){ const mid = screenToVB((p[0].x+p[1].x)/2, (p[0].y+p[1].y)/2); zoomAbout(mid[0], mid[1], pinch.dist/dist); pinch = { dist }; suppressClick = true; } }
      else if(touchPts.size === 1){ if(nodeDrag) moveNode(e); else if(drag){ const r = svg.getBoundingClientRect(); const dx = (e.clientX - drag.x)/r.width*MAP.vb.w, dy = (e.clientY - drag.y)/r.height*MAP.vb.h; if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y) > 5) drag.moved = true; if(drag.moved){ MAP.vb = Object.assign({}, MAP.vb, { x: drag.vx - dx, y: drag.vy - dy }); applyVB(svg, MAP.vb); } } }
      return;
    }
    if(nodeDrag){ moveNode(e); return; }
    if(!drag) return; const r = svg.getBoundingClientRect(); const dx = (e.clientX - drag.x)/r.width*MAP.vb.w, dy = (e.clientY - drag.y)/r.height*MAP.vb.h; if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y) > 5) drag.moved = true; if(drag.moved){ MAP.vb = Object.assign({}, MAP.vb, { x: drag.vx - dx, y: drag.vy - dy }); applyVB(svg, MAP.vb); } };
  const onUp = e => {
    if(nodeDrag){ if(nodeDrag.moved){ saveCur(); suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); } nodeDrag = null; if(!e || e.pointerType !== 'touch'){ drag = null; return; } }
    if(e && e.pointerType === 'touch'){ touchPts.delete(e.pointerId); if(touchPts.size < 2) pinch = null; if(touchPts.size === 1){ const p = [...touchPts.values()][0]; drag = { x:p.x, y:p.y, vx:MAP.vb.x, vy:MAP.vb.y, moved:false }; } else if(touchPts.size === 0){ drag = null; if(suppressClick) setTimeout(() => { suppressClick = false; }, 60); } mapPersistCamera(); return; }
    if(drag && drag.moved){ mapPersistCamera(); suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); } drag = null; };
  window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onUp);
  const clearTouches = () => { touchPts.clear(); pinch = null; drag = null; nodeDrag = null; }; window.addEventListener('blur', clearTouches);
  svg.addEventListener('wheel', e => { e.preventDefault(); mapStopAnim(); const p = screenToVB(e.clientX, e.clientY); zoomAbout(p[0], p[1], e.deltaY > 0 ? 1.12 : 1/1.12); }, {passive:false});
  svg.addEventListener('pointermove', e => { if(e.pointerType === 'touch' || nodeDrag || drag) return; const n = e.target.closest ? e.target.closest('.node') : null; mapHover(n, e); });
  svg.addEventListener('pointerleave', () => { if(!nodeDrag && !drag) mapHover(null); });
  svg.addEventListener('click', e => { if(suppressClick) return; const n = e.target.closest ? e.target.closest('.node') : null; if(n) mapClick(n); });
  $('#mapFit').onclick = fitMap;
  $('#mapResetDrag').onclick = resetMapDrag;
  $('#mapResetDefault').onclick = resetMapDefault;
  $('#mapZoomIn').onclick = () => zoomAbout(MAP.vb.x + MAP.vb.w/2, MAP.vb.y + MAP.vb.h/2, 1/1.15);
  $('#mapZoomOut').onclick = () => zoomAbout(MAP.vb.x + MAP.vb.w/2, MAP.vb.y + MAP.vb.h/2, 1.15);
}
function treeFocus(g){
  if(!g.nodes) return null;
  const openId = mapMode === 'project' ? (projState && projState.sys) : mapState.dom;
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
function renderTree(kind){
  if(!MAP || !document.body.contains(MAP.svg)) initMapStage();
  const st = curState();
  const g = buildGraph();
  g.focus = treeFocus(g);
  MAP.g = g; MAP.hover = null; MAP.tip.hidden = true; MAP.svg.classList.remove('dimmed');
  MAP.svg.innerHTML = g.inner;
  const bar = $('.mapbar .mapcrumbs'); if(bar) bar.innerHTML = mapCrumbs();
  const stageKey = mapMode === 'project' && projState ? 'project:' + projState.cs : 'domains';
  if(mapStage !== stageKey){
    mapStage = stageKey; mapStopAnim();
    MAP.vb = st.vb && st.vb.w ? Object.assign({}, st.vb) : null;
    if(MAP.vb) applyVB(MAP.svg, MAP.vb);
  }
  const stored = st.vb && st.vb.w ? st.vb : null;
  if(!MAP.vb){ MAP.vb = fitBox(g.bbox); applyVB(MAP.svg, MAP.vb); }
  let target = cameraTarget(g, stored || MAP.vb, kind);
  if(window.innerWidth <= 1100 && target.w > 720){ const A = target.w / target.h, w = 720, h = w / A; const cx = target.x + target.w/2, cy = target.y + target.h/2; target = { x: cx - w/2, y: cy - h/2, w, h }; }
  mapAnimateTo(target);
}
// `tab` is the fourth route part (#/map/t/<id>/<tab>). It selects which topic
// view the content pane shows and is deliberately kept out of mapState: the
// tree does not change when the tab does.
function renderMap(kind, id, tab){
  mapMode = 'domains';
  if(!kind || kind==='home'){ mapState.dom = null; mapState.topic = null; mapState.smell = null; }
  else if(kind==='d' && DOM[id]){ mapState.dom = id; mapState.topic = null; mapState.smell = null; }
  else if(kind==='t' && TOPICS[id]){ mapState.dom = TOPICS[id].d; mapState.topic = id; mapState.smell = null; setTopicTab(TOPICS[id], tab); }
  else if(kind==='s' && SMELLS.some(s => s.id===id)){ mapState.smell = id; }
  saveMap();
  if(mapState.topic) markSeen(mapState.topic);
  setView(drawerHTML());
  renderTree(kind);
}
