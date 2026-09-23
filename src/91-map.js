/* =====================================================================
   PERSISTENT MIND MAP (centre) + INDEX (left) + CONTENT (right)
   The map is always on screen. It is a horizontal collapsible tidy tree,
   not a circle, so it grows by stacking and panning rather than shrinking.
   Routes: #/map  #/map/d/<domain>  #/map/t/<topic>  #/map/s/<smell>  #/map/home
   ===================================================================== */
(function(A){
'use strict';
const { $, $$, app, esc, DOM, TOPIC_LIST, store, seen, markSeen, go, route, isNarrow, setView, crumbs, domChip, list,
  chainHTML, practice, setTopicTab, topicBody, smellsView, pathProgress, renderPaths, closeModals, openModal } = A;
const START_PATHS = [
  ['#/paths','I want to learn step by step','Pick a path and follow one visible next step at a time, with a soft checkpoint per stage.',''],
  ['#/lab','I want to shape an idea','Observe a signal, find the tension, turn it into a design question, design mechanisms and test them.',''],
  ['#/build/dissect','I have an idea and want to know if it is good','Cross-reference it against games that already won the audience you want.','var(--accent2)'],
  ['#/build/ladder','I have a feature idea','Climb from the feature to the behavior, then decide whether to build it.','var(--d-core)'],
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

const mapState = Object.assign({ dom:null, topic:null, smell:null, vb:null }, store.get('mapState', {}));
function saveMap(){ store.set('mapState', mapState); }

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
function saveProj(){ if(projState) store.set('projMap.' + projState.cs, projState); }
function projCase(){ return projState ? CASE_STUDIES.find(x => x.id === projState.cs) : null; }
function savePathMap(){ if(pathMapState) store.set('pathMap.' + pathMapState.id, pathMapState); }
function curPath(){ return pathMapState ? PATHS.find(x => x.id === pathMapState.id) : null; }
// Called by the router before the pane renders: the route is the truth about
// which branch is open and which child is selected, the store only supplies
// the camera and the dragged-node offsets. `sysId` is a system id or the
// reserved 'workflows'; `partId` is then a part id or a flow id.
function enterProject(c, sysId, partId){
  if(!projState || projState.cs !== c.id) projState = Object.assign({ sys:null, part:null, off:{}, vb:null }, store.get('projMap.' + c.id, {}), { cs:c.id });
  projState.sys = sysId || null;
  projState.part = partId || null;
  mapMode = 'project';
  saveProj();
}
// Same shape, for the path map: `stageId` is a stage id or null, matching
// `sysId` above. Called by renderPaths before the pane renders.
function enterPathMap(pth, stageId){
  if(!pathMapState || pathMapState.id !== pth.id) pathMapState = Object.assign({ stage:null, off:{}, vb:null }, store.get('pathMap.' + pth.id, {}), { id:pth.id });
  pathMapState.stage = stageId || null;
  mapMode = 'path';
  savePathMap();
}
function curState(){ return mapMode === 'project' && projState ? projState : mapMode === 'path' && pathMapState ? pathMapState : mapState; }
function saveCur(){ if(mapMode === 'project') saveProj(); else if(mapMode === 'path') savePathMap(); else saveMap(); }
// The domain map's fourth layer gains the project parts that demonstrate the
// selected topic. They are runtime links, not data, so they ride along on a
// copy of mapState instead of being stored in it.
function buildGraph(){
  const c = projCase();
  if(mapMode === 'project' && c) return PlayableGraph.buildProject(c, projState, TOPICS, DOMAINS);
  const pth = curPath();
  if(mapMode === 'path' && pth) return PlayableGraph.buildPath(pth, pathMapState, pathProgress(pth.id));
  const pr = practice();
  return PlayableGraph.build(Object.assign({}, mapState, { extra: (mapState.topic && pr.extra[mapState.topic]) || [] }), seen, VIEW_LINKS);
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
  const parts = [`<button data-href="#/map/home">All domains</button>`];
  if(mapState.dom && DOM[mapState.dom]) parts.push(`<span>›</span><button data-href="#/map/d/${mapState.dom}">${esc(DOM[mapState.dom].t)}</button>`);
  if(mapState.topic && TOPICS[mapState.topic]) parts.push(`<span>›</span><button data-href="#/map/t/${mapState.topic}">${esc(TOPICS[mapState.topic].t)}</button>`);
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
function mapPersistCamera(){ if(!MAP) return; curState().vb = { x:MAP.vb.x, y:MAP.vb.y, w:MAP.vb.w, h:MAP.vb.h, sw:MAP.wrap.clientWidth, sh:MAP.wrap.clientHeight }; saveCur(); }
function savedCamera(vb){
  if(!vb || !vb.w || !vb.sw) return null;
  const w = MAP.wrap.clientWidth, h = MAP.wrap.clientHeight;
  return Math.abs(vb.sw - w) <= w * 0.2 && Math.abs(vb.sh - h) <= h * 0.2 ? vb : null;
}
// Where the camera should be for this graph on this stage.
function stageTarget(g, kind, cam){
  let target = cameraTarget(g, cam, kind);
  if(isNarrow() && target.w > 720){ const A = target.w / target.h, w = 720, h = w / A; const cx = target.x + target.w/2, cy = target.y + target.h/2; target = { x: cx - w/2, y: cy - h/2, w, h }; }
  return target;
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
  if(kind==='topic'){ const [stageId, i] = id.split('/'); const st = pth.stages.find(x => x.id===stageId); const step = st && st.steps[+i]; if(!step) return ''; return `<b>${esc(stepTitle(step))}</b><div>${esc(step.why)}</div><div class="muted">click to open</div>`; }
  return '';
}
function mapTipHTML(n){
  if(n.dataset.scope === 'project') return projTipHTML(n);
  if(n.dataset.scope === 'path') return pathTipHTML(n);
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
  if(kind==='topic' && projState.sys==='workflows') return go(`#/experience/${c.id}/flow/${id}`);
  if(kind==='topic') return go(`#/experience/${c.id}/${projState.sys}/${id}`);
  if(kind==='leaf') return go('#/map/t/' + id);
}
function pathMapClick(n){
  const kind = n.dataset.kind, id = n.dataset.id, pth = curPath();
  if(!pth) return;
  if(kind==='center') return go(`#/paths/${pth.id}`);
  if(kind==='domain') return go(n.classList.contains('open') ? `#/paths/${pth.id}` : `#/paths/${pth.id}/${id}`);
  if(kind==='topic'){
    const i = id.lastIndexOf('/'), stageId = id.slice(0, i), idx = id.slice(i + 1);
    const st = pth.stages.find(x => x.id===stageId), step = st && st.steps[+idx];
    if(step) go(stepHref(step, pth.id, stageId));
  }
}
function mapClick(n){
  if(n.dataset.scope === 'project') return projClick(n);
  if(n.dataset.scope === 'path') return pathMapClick(n);
  const kind = n.dataset.kind, id = n.dataset.id;
  if(kind==='center'){ if(mapState.dom || mapState.topic || mapState.smell) return go('#/map/home'); return openStart(); }
  if(kind==='domain') return go(n.classList.contains('open') ? '#/map/home' : '#/map/d/'+id);
  if(kind==='topic') return go('#/map/t/'+id);
  if(kind==='leaf') return go('#/map/t/'+id);
  if(kind==='smell') return go('#/map/s/'+id);
  if(kind==='view'){ const v = VIEW_LINKS[id]; if(v) go(v[0]); }
}

function fitMap(){ if(MAP && MAP.g){ mapStopAnim(); MAP.userCamera = false; mapAnimateTo(fitBox(MAP.g.bbox)); } }
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
// Draws the graph with one node in the tab order (a roving tab stop). A
// redraw replaces every node, so focus is handed to the node with the same
// key and arrow-key travel or Enter never drops the reader out of the map.
function paintGraph(){
  const hadFocus = MAP.svg.contains(document.activeElement);
  const g = buildGraph();
  g.focus = treeFocus(g);
  MAP.g = g; MAP.hover = null; MAP.tip.hidden = true; MAP.svg.classList.remove('dimmed');
  MAP.svg.innerHTML = g.inner;
  const byKey = k => k && MAP.svg.querySelector('.node[data-key="' + CSS.escape(k) + '"]');
  const stop = byKey(MAP.focusKey) || byKey(currentKey()) || MAP.svg.querySelector('.node');
  if(stop){ stop.setAttribute('tabindex', '0'); if(hadFocus) stop.focus({ preventScroll: true }); }
  return g;
}
function nodeCentre(el){ const r = el.querySelector('.disc'); return { x: +r.getAttribute('x') + +r.getAttribute('width') / 2, y: +r.getAttribute('y') + +r.getAttribute('height') / 2 }; }
// Arrow keys travel spatially: the nearest node in that direction, with
// sideways distance counting double so the move follows rows and columns.
function nearestNode(from, dx, dy){
  const a = nodeCentre(from); let best = null, bestScore = Infinity;
  for(const el of MAP.svg.querySelectorAll('.node')){
    if(el === from) continue;
    const b = nodeCentre(el), vx = b.x - a.x, vy = b.y - a.y, along = vx * dx + vy * dy;
    if(along <= 1) continue;
    const score = along + 2 * Math.abs(vx * dy - vy * dx);
    if(score < bestScore){ bestScore = score; best = el; }
  }
  return best;
}
function focusNode(el){
  MAP.svg.querySelectorAll('.node[tabindex="0"]').forEach(x => x.setAttribute('tabindex', '-1'));
  el.setAttribute('tabindex', '0'); el.focus({ preventScroll: true }); MAP.focusKey = el.dataset.key;
  const c = nodeCentre(el), vb = MAP.vb;
  if(c.x < vb.x || c.x > vb.x + vb.w || c.y < vb.y || c.y > vb.y + vb.h) mapAnimateTo({ x: c.x - vb.w / 2, y: c.y - vb.h / 2, w: vb.w, h: vb.h });
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
  const wrap = $('#mapwrap'), svg = $('#mapsvg'), tip = $('#maptip');
  MAP = { wrap, svg, tip, g:null, vb:null, anim:null, hover:null };
  const screenToVB = (cx, cy) => { const r = svg.getBoundingClientRect(); return [MAP.vb.x + (cx - r.left)/r.width*MAP.vb.w, MAP.vb.y + (cy - r.top)/r.height*MAP.vb.h]; };
  const zoomAbout = (fx, fy, f) => { const vb = MAP.vb, fit = fitBox(MAP.g ? MAP.g.bbox : vb); const nw = Math.min(Math.max(vb.w*f, 120), fit.w*3), nh = nw/(vb.w/vb.h); MAP.vb = { x: fx - (fx - vb.x)*(nw/vb.w), y: fy - (fy - vb.y)*(nh/vb.h), w: nw, h: nh }; applyVB(svg, MAP.vb); MAP.userCamera = true; mapPersistCamera(); };
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
    if(drag && drag.moved){ MAP.userCamera = true; mapPersistCamera(); suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); } drag = null; };
  window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onUp);
  const clearTouches = () => { touchPts.clear(); pinch = null; drag = null; nodeDrag = null; }; window.addEventListener('blur', clearTouches);
  svg.addEventListener('wheel', e => { e.preventDefault(); mapStopAnim(); const p = screenToVB(e.clientX, e.clientY); zoomAbout(p[0], p[1], e.deltaY > 0 ? 1.12 : 1/1.12); }, {passive:false});
  svg.addEventListener('pointermove', e => { if(e.pointerType === 'touch' || nodeDrag || drag) return; const n = e.target.closest ? e.target.closest('.node') : null; mapHover(n, e); });
  svg.addEventListener('pointerleave', () => { if(!nodeDrag && !drag) mapHover(null); });
  svg.addEventListener('click', e => { if(suppressClick) return; const n = e.target.closest ? e.target.closest('.node') : null; if(n) mapClick(n); });
  svg.addEventListener('keydown', e => {
    const n = e.target.closest && e.target.closest('.node'); if(!n) return;
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); MAP.focusKey = n.dataset.key; MAP.keyNav = true; mapClick(n); return; }
    if(e.key === 'Home'){ e.preventDefault(); focusNode(svg.querySelector('.node[data-kind="center"]')); return; }
    const d = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0] }[e.key];
    if(!d) return;
    e.preventDefault();
    const next = nearestNode(n, d[0], d[1]); if(next) focusNode(next);
  });
  $('#mapFit').onclick = fitMap;
  // When the stage changes size (window, rotation, a panel collapsed or
  // dragged) the camera is framed again, unless the reader moved it.
  let resizeT = 0;
  new ResizeObserver(() => { clearTimeout(resizeT); resizeT = setTimeout(() => {
    if(!MAP.g || MAP.userCamera || !document.body.contains(svg)) return;
    mapStopAnim(); const t = stageTarget(MAP.g, MAP.kind, MAP.vb); MAP.vb = t; applyVB(svg, t); mapPersistCamera();
  }, 150); }).observe(wrap);
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
function renderTree(kind){
  if(!MAP || !document.body.contains(MAP.svg)) initMapStage();
  const st = curState();
  const g = paintGraph();
  const bar = $('.mapbar .mapcrumbs'); if(bar) bar.innerHTML = mapCrumbs();
  const stageKey = mapMode === 'project' && projState ? 'project:' + projState.cs : mapMode === 'path' && pathMapState ? 'path:' + pathMapState.id : 'domains';
  const stored = savedCamera(st.vb);
  if(mapStage !== stageKey){
    mapStage = stageKey; mapStopAnim();
    MAP.vb = stored ? Object.assign({}, stored) : null;
    if(MAP.vb) applyVB(MAP.svg, MAP.vb);
  }
  if(!MAP.vb){ MAP.vb = fitBox(g.bbox); applyVB(MAP.svg, MAP.vb); }
  MAP.kind = kind; MAP.userCamera = false;
  mapAnimateTo(stageTarget(g, kind, stored || MAP.vb));
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

Object.assign(A, { renderMap, renderTree, syncMapMode, enterProject, enterPathMap, fitMap, consumeMapKeyNav });
})(window.PlayableApp);
