/* =====================================================================
   ONE BRAIN MAP + READING DRAWER + RETURN DOCK
   The map is the guide. Expand a domain, select a topic, and read it in
   the drawer beside the map. State (open branch, selected node, pan and
   zoom) persists; every other view shows a dock that returns you here.
   The SVG is patched in place on every change: persistent elements are
   updated, new ones fade in, removed ones disappear. No full re-render,
   so the map never flashes.
   Routes: #/map  #/map/d/<domain>  #/map/t/<topic>  #/map/s/<smell>  #/map/home
   ===================================================================== */
/* The four doors into the guide. Shared by the start panel in the drawer and
   the overlay the centre node opens, so the copy lives in one place. */
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
function openStart(){ const el = $('#startPaths'); if(el) el.innerHTML = startPathsHTML(); $('#startModal').classList.add('show'); }
{ const sc = $('#startClose'); if(sc) sc.onclick = () => closeModals(); }

const mapState = Object.assign({ dom:null, topic:null, smell:null, vb:null }, store.get('mapState', {}));
function saveMap(){ store.set('mapState', mapState); }
function mapHash(){ return mapState.smell ? `#/map/s/${mapState.smell}` : mapState.topic ? `#/map/t/${mapState.topic}` : mapState.dom ? `#/map/d/${mapState.dom}` : '#/map'; }
function mapPathLabel(){ const parts = [mapState.dom && DOM[mapState.dom] && DOM[mapState.dom].t, mapState.topic && TOPICS[mapState.topic] && TOPICS[mapState.topic].t, mapState.smell && (SMELLS.find(s => s.id===mapState.smell)||{}).t].filter(Boolean); return parts.length ? parts.join(' › ') : 'overview'; }
function updateDock(){ /* removed: the knowledge rail is always visible */ }

function mapCrumbs(){
  const parts = [`<button onclick="location.hash='#/map/home'">All domains</button>`];
  if(mapState.dom && DOM[mapState.dom]) parts.push(`<span>›</span><button onclick="location.hash='#/map/d/${mapState.dom}'">${esc(DOM[mapState.dom].t)}</button>`);
  if(mapState.topic && TOPICS[mapState.topic]) parts.push(`<span>›</span><button onclick="location.hash='#/map/t/${mapState.topic}'">${esc(TOPICS[mapState.topic].t)}</button>`);
  if(mapState.smell){ const s = SMELLS.find(x => x.id===mapState.smell); if(s) parts.push(`<span>›</span><b>${esc(s.t)}</b>`); }
  return `<div class="mapcrumbs">${parts.join('')}</div>`;
}
function startPanel(){
  return `<span class="overline">Field manual · ${TOPIC_LIST.length} topics · ${SMELLS.length} smells · ${TOOLS.length} tools</span>
    <h1 style="margin:6px 0 8px">Make something people want to play.</h1>
    <p class="dim">The knowledge rail on the left is always here. Open a domain, pick a topic, and it reads in this pane. Use <b>Graph overview</b> when you want the radial map as a picture.</p>
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
// rAF pauses in hidden tabs, so fall back to a timer there; the result is identical either way.
const nextFrame = fn => document.hidden ? { kind:'t', id: setTimeout(() => fn(performance.now()), 16) } : { kind:'r', id: requestAnimationFrame(fn) };
const cancelFrame = h => { if(!h) return; if(h.kind === 't') clearTimeout(h.id); else cancelAnimationFrame(h.id); };
function cameraTarget(g, cam, kind){
  const fit = fitBox(g.bbox);
  if(!cam || kind === 'home' || !g.focus) return fit;
  const f = g.focus, A = cam.w / cam.h; const cx = f.x + f.w/2, cy = f.y + f.h/2;
  let w = cam.w, h = cam.h; const needW = Math.max(f.w*1.12, f.h*1.12*A); if(needW > w){ w = needW; h = w/A; }
  return { x: cx - w/2, y: cy - h/2, w, h };
}

/* ---- the live map: one context, patched in place ---- */
let MAP = null; // { wrap, svg, tip, g, vb, anim, hover }
function mapAnimateTo(to, ms=520){
  const M = MAP; if(!M) return; if(M.anim) cancelFrame(M.anim.h);
  const from = Object.assign({}, M.vb); const t0 = performance.now(); const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
  const step = now => { const k = Math.min(1, (now - t0)/ms), e = ease(k); M.vb = { x: from.x + (to.x-from.x)*e, y: from.y + (to.y-from.y)*e, w: from.w + (to.w-from.w)*e, h: from.h + (to.h-from.h)*e }; applyVB(M.svg, M.vb); if(k < 1) M.anim.h = nextFrame(step); else { M.anim = null; M.vb = to; applyVB(M.svg, to); mapPersistCamera(); } };
  M.anim = { h: nextFrame(step) };
}
function mapStopAnim(){ if(MAP && MAP.anim){ cancelFrame(MAP.anim.h); MAP.anim = null; } }
function mapPersistCamera(){ if(!MAP) return; mapState.vb = { x:MAP.vb.x, y:MAP.vb.y, w:MAP.vb.w, h:MAP.vb.h }; store.set('mapState', mapState); }

// Patch one layer: keyed reconcile. Existing elements are updated in place (no
// animation restarts), new ones are appended with data-new (they fade in), gone ones removed.
function patchLayer(layer, fresh){
  const have = new Map(); [...layer.children].forEach(el => have.set(el.dataset.key, el));
  const keep = new Set();
  [...fresh.children].forEach(nel => { const k = nel.dataset.key; keep.add(k); const old = have.get(k);
    if(old){ [...nel.attributes].forEach(a => { if(a.name !== 'data-new' && old.getAttribute(a.name) !== a.value) old.setAttribute(a.name, a.value); }); [...old.attributes].forEach(a => { if(!nel.hasAttribute(a.name) && a.name !== 'data-new') old.removeAttribute(a.name); }); if(old.innerHTML !== nel.innerHTML) old.innerHTML = nel.innerHTML; }
    else { nel.setAttribute('data-new', '1'); layer.appendChild(nel); } });
  have.forEach((el, k) => { if(!keep.has(k)) el.remove(); });
}
function patchMapSVG(g){
  const tpl = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); tpl.innerHTML = g.inner;
  const layers = ['guides','edges','nodes'];
  layers.forEach(name => { const cur = MAP.svg.querySelector(`.lay.${name}`), nu = tpl.querySelector(`.lay.${name}`); if(cur && nu) patchLayer(cur, nu); });
  setTimeout(() => { if(MAP) $$('[data-new]', MAP.svg).forEach(el => el.removeAttribute('data-new')); }, 600);
}
function mapTipHTML(n){
  const kind = n.dataset.kind, id = n.dataset.id;
  if(kind==='domain'){ const d = DOM[id]; return `<b style="color:${d.color}">${esc(d.t)}</b><div>${esc(d.short)}</div><div class="muted">${n.classList.contains('open')?'click to collapse':'click to expand'}</div>`; }
  if(kind==='topic' || kind==='leaf'){ const t = TOPICS[id]; const leaf = kind==='leaf' ? MAP.g.leaves[+n.dataset.key.slice(2)] : null; return `<b>${esc(t.t)}</b><div>${esc(t.tag)}</div>${leaf ? `<div class="why"><b>Why it connects:</b> ${esc(leaf.why)}</div>` : ''}<div class="muted">${kind==='leaf' ? 'click to travel there' : n.classList.contains('active') ? 'click to collapse' : 'click to read'}</div>`; }
  if(kind==='smell'){ const s = SMELLS.find(x => x.id===id); return `<b style="color:var(--bad)">Design smell</b><div>${esc(s.t)}</div><div class="muted">${esc(s.sym)}</div>`; }
  if(kind==='view'){ const v = VIEW_LINKS[id]; return `<b style="color:var(--accent2)">Tool</b><div>${esc(v ? v[1] : id)}</div>`; }
  if(kind==='center') return `<b>Make something people want to play</b><div class="muted">${mapState.dom ? 'click to collapse everything' : 'click for the starting paths'}</div>`;
  return '';
}
function mapHover(n, e){
  const M = MAP; if(M.hover === n) { if(n && e) mapMoveTip(e); return; }
  if(M.hover){ M.svg.classList.remove('dimmed'); $$('.hl', M.svg).forEach(x => x.classList.remove('hl')); M.tip.hidden = true; }
  M.hover = n; if(!n) return;
  const key = n.dataset.key;
  M.svg.classList.add('dimmed'); n.classList.add('hl');
  $$('.edge', M.svg).forEach(ed => { const hit = ed.dataset.a === key || ed.dataset.b === key; ed.classList.toggle('hl', hit); if(hit){ const other = ed.dataset.a === key ? ed.dataset.b : ed.dataset.a; const on = M.svg.querySelector(`.node[data-key="${other}"]`); if(on) on.classList.add('hl'); } });
  if(e && e.pointerType !== 'touch'){ M.tip.innerHTML = mapTipHTML(n); M.tip.hidden = false; mapMoveTip(e); }
}
function mapMoveTip(e){ const M = MAP; const r = M.wrap.getBoundingClientRect(); let x = e.clientX - r.left + 14, y = e.clientY - r.top + 14; if(x + 260 > r.width) x -= 280; if(y + 90 > r.height) y -= 100; M.tip.style.left = x + 'px'; M.tip.style.top = y + 'px'; }
function mapClick(n){
  const kind = n.dataset.kind, id = n.dataset.id;
  if(kind==='center'){ if(mapState.dom || mapState.topic || mapState.smell) return go('#/map/home'); return openStart(); }
  if(kind==='domain') return go(n.classList.contains('open') ? '#/map/home' : '#/map/d/'+id);
  if(kind==='topic') return go(n.classList.contains('active') ? '#/map/d/'+mapState.dom : '#/map/t/'+id);
  if(kind==='leaf') return go('#/map/t/'+id);
  if(kind==='smell') return go('#/map/s/'+id);
  if(kind==='view'){ const v = VIEW_LINKS[id]; if(v) go(v[0]); }
}
function initMap(g, kind){
  const wrap = $('#mapwrap'), svg = $('#mapsvg'), tip = $('#maptip');
  const stored = mapState.vb && mapState.vb.w ? { x:mapState.vb.x, y:mapState.vb.y, w:mapState.vb.w, h:mapState.vb.h } : null;
  MAP = { wrap, svg, tip, g, vb: stored || fitBox(g.bbox), anim:null, hover:null };
  applyVB(svg, MAP.vb);
  const target = cameraTarget(g, stored, kind);
  if(stored) mapAnimateTo(target); else { MAP.vb = target; applyVB(svg, target); mapPersistCamera(); }
  // delegated events: one set of listeners for the life of the map
  let drag = null, suppressClick = false;
  svg.addEventListener('pointerdown', e => { if(e.button !== 0) return; mapStopAnim(); drag = { x:e.clientX, y:e.clientY, vx:MAP.vb.x, vy:MAP.vb.y, moved:false }; });
  const onMove = e => { if(!document.body.contains(svg)){ window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onUp); return; } if(!drag) return; const r = svg.getBoundingClientRect(); const dx = (e.clientX - drag.x)/r.width*MAP.vb.w, dy = (e.clientY - drag.y)/r.height*MAP.vb.h; if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y) > 5) drag.moved = true; if(drag.moved){ MAP.vb = Object.assign({}, MAP.vb, { x: drag.vx - dx, y: drag.vy - dy }); applyVB(svg, MAP.vb); } };
  const onUp = () => { if(drag && drag.moved){ mapPersistCamera(); suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); } drag = null; };
  window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onUp);
  svg.addEventListener('wheel', e => { e.preventDefault(); mapStopAnim(); const vb = MAP.vb, fit = fitBox(MAP.g.bbox); const r = svg.getBoundingClientRect(); const px = vb.x + (e.clientX - r.left)/r.width*vb.w, py = vb.y + (e.clientY - r.top)/r.height*vb.h; const f = e.deltaY > 0 ? 1.12 : 1/1.12; const nw = Math.min(Math.max(vb.w*f, 260), fit.w*3); const nh = nw/(vb.w/vb.h); MAP.vb = { x: px - (px - vb.x)*(nw/vb.w), y: py - (py - vb.y)*(nh/vb.h), w: nw, h: nh }; applyVB(svg, MAP.vb); mapPersistCamera(); }, {passive:false});
  svg.addEventListener('pointermove', e => { const n = e.target.closest ? e.target.closest('.node') : null; mapHover(n, e); });
  svg.addEventListener('pointerleave', () => mapHover(null));
  svg.addEventListener('click', e => { if(suppressClick) return; const n = e.target.closest ? e.target.closest('.node') : null; if(n) mapClick(n); });
  $('#mapFit').onclick = () => { mapStopAnim(); mapAnimateTo(fitBox(MAP.g.bbox)); };
  $('#mapCollapse').onclick = () => go('#/map/home');
}
function patchMap(g, kind){
  const M = MAP; M.g = g; M.hover = null; M.tip.hidden = true; M.svg.classList.remove('dimmed');
  patchMapSVG(g);
  $('.mapbar .mapcrumbs').outerHTML = mapCrumbs();
  const dr = $('#drawer'); dr.innerHTML = drawerHTML(); dr.scrollTop = 0;
  const cur = M.anim ? M.vb : M.vb; mapStopAnim(); const target = cameraTarget(g, cur, kind);
  if(Math.abs(target.x-cur.x) > 1 || Math.abs(target.y-cur.y) > 1 || Math.abs(target.w-cur.w) > 1) mapAnimateTo(target); else mapPersistCamera();
  document.querySelector('.mapstage').classList.toggle('open', !!mapState.dom);
}
function renderMap(kind, id){
  if(!kind || kind==='home'){ mapState.dom = null; mapState.topic = null; mapState.smell = null; }
  else if(kind==='d' && DOM[id]){ mapState.dom = id; mapState.topic = null; mapState.smell = null; }
  else if(kind==='t' && TOPICS[id]){ mapState.dom = TOPICS[id].d; mapState.topic = id; mapState.smell = null; }
  else if(kind==='s' && SMELLS.some(s => s.id===id)){ mapState.smell = id; }
  saveMap();
  if(mapState.topic) markSeen(mapState.topic);
  setView(`${mapCrumbs()}${drawerHTML()}`);
}
