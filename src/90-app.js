/* =====================================================================
   APPLICATION
   Hash router -> views. All state in localStorage under "playable.*".
   ===================================================================== */
(function(A){
'use strict';
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));
const app = $('#app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DOM = Object.fromEntries(DOMAINS.map(d => [d.id, d]));
const TOPIC_LIST = Object.values(TOPICS);
DOMAINS.forEach(d => d.topics = TOPIC_LIST.filter(t => t.d === d.id).map(t => t.id));
// Defined by the files that load after this one (91-map.js, 92-ideas.js,
// 93-lab.js), so they are looked up on the shared namespace at call time.
const late = name => (...a) => A[name](...a);
const renderMap = late('renderMap'), renderTree = late('renderTree'), syncMapMode = late('syncMapMode'),
  enterProject = late('enterProject'), enterPathMap = late('enterPathMap'),
  toolDissect = late('toolDissect'), renderLab = late('renderLab'), fitMap = late('fitMap'),
  consumeMapKeyNav = late('consumeMapKeyNav'), currentLens = late('currentLens'), setLens = late('setLens');

/* ---------- storage ---------- */
const store = {
  get(k, def){ try { const v = localStorage.getItem('playable.'+k); return v === null ? def : JSON.parse(v); } catch(e){ return def; } },
  set(k, v){ try { localStorage.setItem('playable.'+k, JSON.stringify(v)); } catch(e){} },
  clear(){ try { Object.keys(localStorage).filter(k => k.startsWith('playable.')).forEach(k => localStorage.removeItem(k)); } catch(e){} }
};
const seen = new Set(store.get('seen', []));
function markSeen(id){ if(!seen.has(id)){ seen.add(id); store.set('seen', [...seen]); updateProgress(); } }
function updateProgress(){ const n = TOPIC_LIST.length, s = [...seen].filter(id => TOPICS[id]).length; $('#progressText').textContent = `${s} / ${n} topics`; $('#progressBar').style.width = (100*s/n)+'%'; }

/* ---------- theme ---------- */
// The theme follows the system until the reader picks one with the toggle;
// only that explicit choice is stored, and Reset returns to the system.
const lightQuery = window.matchMedia('(prefers-color-scheme: light)');
const systemTheme = () => lightQuery.matches ? 'light' : 'dark';
function applyTheme(t){ document.documentElement.setAttribute('data-theme', t); }
applyTheme(store.get('theme', null) || systemTheme());
lightQuery.addEventListener('change', () => { if(!store.get('theme', null)) applyTheme(systemTheme()); });
$('#themeBtn').onclick = () => { const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; applyTheme(t); store.set('theme', t); };

/* ---------- toast / copy ---------- */
let toastT;
function toast(msg){ const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove('show'), 1600); }
async function copyText(text){ try { await navigator.clipboard.writeText(text); toast('Copied to clipboard'); } catch(e){ const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); toast('Copied'); }catch(err){ toast('Copy failed: select and copy manually'); } ta.remove(); } }

/* ---------- one delegated listener per event ----------
   Navigation is markup: <a href="#/..."> for links, data-href on buttons.
   Everything else is a named action: data-action plus its data-* arguments,
   looked up in ACTIONS. No inline handlers and no window globals. */
const ACTIONS = {};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-href],[data-action]');
  if(!el) return;
  if(el.dataset.href !== undefined){
    // A real link inside a data-href container navigates by itself.
    const link = e.target.closest('a[href]');
    if(!link || !el.contains(link)) location.hash = el.dataset.href;
    return;
  }
  const act = ACTIONS[el.dataset.action];
  if(act) act(el, e);
});
document.addEventListener('keydown', e => { if(e.target.closest && e.target.closest('.topictabs [role="tab"]')) tabKey(e); });
document.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.story; if(k) store.set(k, e.target.value); });
document.addEventListener('change', e => { const d = e.target.dataset; if(d && d.step !== undefined && d.path) togglePathStep(d.path, d.step, e.target.checked); });
ACTIONS.copy = el => copyText(el.closest('.promptbox').querySelector('pre').textContent);
ACTIONS['fit-map'] = () => fitMap();
ACTIONS.lens = el => setLens(el.dataset.lens);
ACTIONS.focus = el => document.getElementById(el.dataset.target).focus();
ACTIONS['toggle-parent'] = el => el.parentElement.classList.toggle('open');
ACTIONS['clear-tool'] = el => { if(confirm('Clear this tool?')){ localStorage.removeItem('playable.' + el.dataset.key); location.reload(); } };

/* ---------- router ---------- */
// Keys 1-9 map to the first nine entries, so anything added here goes last.
// Six groups in the top bar; each opens its first view, and a group with
// several views shows them as a row of sub-tabs on those views. Keys 1-6
// open the groups in this order.
const NAV = [
  { id:'paths', t:'Paths', views:[['paths','Learning paths'],['review','Review']] },
  { id:'map', t:'Map', views:[['map','Map'],['explore','List'],['concepts','Concept index']] },
  { id:'make', t:'Make', views:[['lab','Idea Lab'],['build','Build tools'],['prompts','Prompts'],['checklists','Checklists']] },
  { id:'diagnose', t:'Diagnose', views:[['diagnose','Diagnose'],['playtest','Playtest']] },
  { id:'ai', t:'AI Workflow', short:'AI', views:[['ai','AI Workflow']] },
  { id:'experience', t:'Projects', views:[['experience','Projects']] }
];
const VIEW_GROUP = {};
NAV.forEach(g => g.views.forEach(([v]) => { VIEW_GROUP[v] = g; }));
VIEW_GROUP.smell = VIEW_GROUP.diagnose; VIEW_GROUP.topic = VIEW_GROUP.map;
function go(hash){ if(location.hash === hash) route(); else location.hash = hash; }
// Below this width the index and the content are drawers over the map.
const narrowQuery = window.matchMedia('(max-width: 1100px)');   // the same width as the drawer CSS
const isNarrow = () => narrowQuery.matches;
const currentParts = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
// Routes that only reshape the map: home, a domain, a project's system.
// On a narrow screen they keep the map in front; every other route is
// something to read or use, so the content drawer opens for it.
function mapOnly(parts){
  const [v, a, b, c] = parts;
  if(!v || v === 'map') return !a || a === 'home' || a === 'd';
  if(v === 'experience' && a && b && !c) return !['workflows', 'interview', 'flow', 'overview'].includes(b);
  return false;
}
// Views with nothing on the map use the work layout (see .shell.work).
function usesMap(parts){
  const [v, a] = parts;
  return !v || v === "map" || v === "topic" || ((v === "paths" || v === "experience") && !!a);
}
function showPaneFor(parts){
  if(!isNarrow()) return;
  $('#pane').classList.toggle('open', !mapOnly(parts));
  $('#rail').classList.remove('open');
  syncScrim();
}
// A tab, tool or stage change inside one page is the same page for focus.
function routeKey(p){
  const [v, a, b, c] = p;
  if(!v || v === 'map') return a === 't' || a === 's' ? `map/${a}/${b}` : 'map';
  if(v === 'experience'){
    if(!a) return 'experience';
    if(!b || ['workflows', 'interview', 'overview'].includes(b)) return 'experience/' + a;
    return b === 'flow' ? `experience/${a}/flow/${c}` : `experience/${a}/${b}/${c || ''}`;
  }
  if(['diagnose', 'smell', 'ai', 'build', 'prompts', 'checklists'].includes(v)) return v === 'smell' ? 'diagnose' : v;
  if(v === 'paths') return a ? 'paths/' + a : 'paths';
  return p.slice(0, 2).join('/');
}
// After a navigation the new content gets focus, so keyboard and screen
// reader users land on what changed. A new page focuses its heading; a tab
// change keeps focus on the active tab. Keyboard travel inside the map, a
// view that placed focus itself (a search box) and map-only routes are left
// alone.
function placeFocus(parts, samePage){
  if(consumeMapKeyNav() || mapOnly(parts)) return;
  const pane = $('#pane');
  if(isNarrow() && !pane.classList.contains('open')) return;
  const a = document.activeElement;
  if(a && a !== document.body && pane.contains(a)) return;
  const t = (samePage && pane.querySelector('.tabs .active, .tool-nav .active')) || pane.querySelector('h1');
  if(!t) return;
  if(!t.matches('a, button, input, select, textarea')) t.setAttribute('tabindex', '-1');
  t.focus({ preventScroll: true });
}
let lastRouteKey = null, booted = false;
function route(){
  const raw = location.hash.replace(/^#\/?/, '');
  // First-ever load (no hash, nothing in this browser yet) opens the door
  // instead of the map. Every other route, including a later empty hash
  // once `visited` is set, behaves as before.
  if(!raw && !store.get('visited', false)){ store.set('visited', true); location.hash = '#/paths'; return; }
  store.set('visited', true);
  const h = raw || 'map';
  const parts = h.split('/').filter(Boolean);
  const view = parts[0];
  const group = VIEW_GROUP[view || 'map'];
  $$('#primaryNav button').forEach(b => { const on = !!group && b.dataset.group === group.id; b.classList.toggle('active', on); if(on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  closeModals();
  syncMapMode(view, parts[1]);
  render(view, parts);
  $("#shell").classList.toggle("work", !usesMap(parts));
  showPaneFor(parts);
  const key = routeKey(parts), samePage = key === lastRouteKey;
  lastRouteKey = key;
  // The first render keeps the browser's own focus; later ones move it.
  if(booted) placeFocus(parts, samePage);
  booted = true;
}
function render(view, parts){
  switch(view){
    case 'paths': return renderPaths(parts[1], parts[2]);
    case 'map': return renderMap(parts[1], parts[2], parts[3]);
    case 'lab': return renderLab();
    case 'explore': return renderExplore(parts[1]);
    case 'concepts': return renderConcepts();
    case 'topic': return location.replace(TOPICS[parts[1]] ? '#/map/t/'+parts[1] : '#/map');
    case 'diagnose': return renderDiagnose(parts[1], parts[2]);
    case 'smell': return renderDiagnose('smells', parts[1]);
    case 'build': return renderBuild(parts[1]);
    case 'ai': return renderAI(parts[1], parts[2]);
    case 'playtest': return renderPlaytest();
    case 'prompts': return renderPrompts(parts[1]);
    case 'checklists': return renderChecklists(parts[1]);
    case 'experience': return renderExperience(parts[1], parts[2], parts[3]);
    case 'review': return renderReview();
    case 'sources': return renderSources();
    default: return renderMap();
  }
}
window.addEventListener('hashchange', route);
// On a phone a long group name shows its short form; the accessible name stays whole.
$('#primaryNav').innerHTML = NAV.map(g => `<button data-group="${g.id}" data-href="#/${g.views[0][0]}"${g.short ? ` aria-label="${g.t}"` : ''}>${g.short ? `<span class="nav-long">${g.t}</span><span class="nav-short">${g.short}</span>` : g.t}</button>`).join('');
$('#brandBtn').onclick = () => go('#/map');
$('#railToggle').onclick = () => { const r = $('#rail'); if(r){ r.classList.toggle('open'); syncScrim(); } };

/* ---------- persistent shell: index (left) + mind map (centre) + content (right) ---------- */
let SHELL = false;
function ensureShell(){
  if(SHELL) return;
  app.innerHTML = `<div class="shell" id="shell">
    <aside class="rail" id="rail"></aside>
    <div class="splitter" id="splitL" title="Drag to resize"></div>
    <section class="mapstage" id="mapstage">
      <div class="mapbar"><div class="mapcrumbs"></div><div class="row" style="gap:4px">
        <button class="btn sm ghost" id="mapZoomOut" title="Zoom out">－</button>
        <button class="btn sm ghost" id="mapZoomIn" title="Zoom in">＋</button>
        <button class="btn sm ghost" id="mapFit" title="Fit the map">⤢ fit</button>
        <button class="btn sm ghost" id="mapResetDrag" title="Reset dragged nodes to the tidy layout">↺ drag</button>
        <button class="btn sm ghost" id="mapResetDefault" title="Reset the map to the default overview">⟲ default</button>
        <button class="btn sm ghost mapbtn-left" id="collapseLeft" title="Toggle index">⟨ index</button>
        <button class="btn sm ghost mapbtn-right" id="collapseRight" title="Toggle content">content ⟩</button>
      </div></div>
      <div class="mapwrap" id="mapwrap"><svg class="kgraph" id="mapsvg" viewBox="0 0 1200 800" role="group" aria-label="Mind map. Tab into it, move with the arrow keys, open a node with Enter."></svg><div class="maptip" id="maptip" hidden></div></div>
    </section>
    <div class="splitter" id="splitR" title="Drag to resize"></div>
    <section class="pane" id="pane"></section>
  </div><div class="scrim" id="scrim"></div><button class="drawer-close" id="drawerClose" aria-label="Close panel">✕</button>`;
  SHELL = true; wireShell();
}
function wireShell(){
  const shell = $('#shell');
  if(store.get('railW')) shell.style.setProperty('--railW', store.get('railW') + 'px');
  if(store.get('paneW')) shell.style.setProperty('--paneW', store.get('paneW') + 'px');
  if(store.get('hideLeft')) shell.classList.add('hide-left');
  if(store.get('hideRight')) shell.classList.add('hide-right');
  const dragSplit = (handle, which) => handle.addEventListener('pointerdown', e => {
    e.preventDefault(); const startX = e.clientX;
    const startRail = parseInt(getComputedStyle(shell).getPropertyValue('--railW')) || 300;
    const startPane = parseInt(getComputedStyle(shell).getPropertyValue('--paneW')) || 460;
    const move = ev => { if(which === 'L'){ const w = Math.max(200, Math.min(560, startRail + (ev.clientX - startX))); shell.style.setProperty('--railW', w + 'px'); store.set('railW', w); } else { const w = Math.max(300, Math.min(820, startPane - (ev.clientX - startX))); shell.style.setProperty('--paneW', w + 'px'); store.set('paneW', w); } };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  });
  dragSplit($('#splitL'), 'L'); dragSplit($('#splitR'), 'R');
  const scrim = $('#scrim');
  const closeDrawers = () => { $('#rail').classList.remove('open'); $('#pane').classList.remove('open'); syncScrim(); };
  scrim.onclick = closeDrawers;
  $('#drawerClose').onclick = closeDrawers;
  $('#collapseLeft').onclick = () => { if(isNarrow()){ $('#rail').classList.toggle('open'); } else { const h = shell.classList.toggle('hide-left'); store.set('hideLeft', h); } syncScrim(); };
  $('#collapseRight').onclick = () => { if(isNarrow()){ $('#pane').classList.toggle('open'); } else { const h = shell.classList.toggle('hide-right'); store.set('hideRight', h); } syncScrim(); };
  renderTree('home');
}
function railHTML(activeDom, activeTopic){
  const openSet = new Set(store.get('sideOpen', [])); if(activeDom) openSet.add(activeDom);
  const lens = currentLens()[0];
  return `<div class="railhead">
      <div class="lens-switch" role="group" aria-label="Map lens">${LENSES.map(([id, t]) => `<button type="button" data-action="lens" data-lens="${id}" aria-pressed="${id === lens}">${esc(t)}</button>`).join('')}</div>
      <button class="railgraph" id="railFit" data-action="fit-map">⤢ Fit map</button>
      <a class="railgraph" href="#/concepts">⌘ Concept index</a>
      <a class="railgraph" href="#/experience">❖ Projects</a>
      <input class="railsearch" id="railSearch" placeholder="Jump to a concept…" autocomplete="off">
    </div>
    <div class="raillist">${DOMAINS.filter(d => d.lens === lens).map(d => { const isOpen = openSet.has(d.id); return `<div class="raildom ${isOpen?'open':''}" data-dom="${d.id}" style="--dc:${d.color}">
      <button class="raildom-btn"><span class="rdot"></span><span class="rt">${esc(d.t)}</span><span class="rn">${d.topics.filter(t=>seen.has(t)).length}/${d.topics.length}</span></button>
      <div class="railtopics">${d.topics.map(t => `<button class="railtopic ${t===activeTopic?'active':''} ${seen.has(t)?'seen':''}" data-topic="${t}">${esc(TOPICS[t].t)}</button>`).join('')}</div></div>`; }).join('')}
    </div>`;
}
// The rail follows the centre stage: in project mode it lists the projects and
// this project's systems and parts, using the same markup the domain list uses.
function railProjectHTML(c, sysId, partId){
  const systems = c.systems || [], flows = c.flows || [];
  // Workflows is a group beside the systems, listing the flows the way a
  // system lists its parts. It is open on the Workflows tab and on a flow
  // route, where sysId is the route word 'flow' and partId the flow id.
  const flowOpen = sysId === 'workflows' || sysId === 'flow';
  const flowGroup = flows.length ? `<div class="raildom ${flowOpen ? 'open' : ''}" data-dom="workflows" style="--dc:var(--accent2)">
      <button class="raildom-btn" data-sys="workflows"><span class="rdot"></span><span class="rt">Workflows</span><span class="rn">${flows.length}</span></button>
      <div class="railtopics">${flows.map(f => `<button class="railtopic ${sysId === 'flow' && f.id === partId ? 'active' : ''}" data-flow="${f.id}">${esc(f.t)}</button>`).join('')}</div></div>` : '';
  return `<div class="railhead">
      <a class="railgraph" href="#/map">← Domains</a>
      <input class="railsearch" id="railSearch" placeholder="Jump to a part…" autocomplete="off">
    </div>
    <div class="railprojects"><span class="railtitle">Projects</span>${CASE_STUDIES.map(x => `<a class="railproj ${x.id === c.id ? 'active' : ''}" href="#/experience/${x.id}">${esc(x.t)}</a>`).join('')}</div>
    <div class="raillist">${flowGroup}${systems.map(s => `<div class="raildom ${s.id === sysId ? 'open' : ''}" data-dom="${s.id}" style="--dc:${kindColor(s.kind)}">
      <button class="raildom-btn" data-sys="${s.id}"><span class="rdot"></span><span class="rt">${esc(s.t)}</span><span class="rn">${(s.parts || []).length}</span></button>
      <div class="railtopics">${(s.parts || []).map(p => `<button class="railtopic ${p.id === partId ? 'active' : ''}" data-sys="${s.id}" data-part="${p.id}">${esc(p.t)}</button>`).join('')}</div></div>`).join('')}
    </div>
    ${systems.length ? '' : '<div class="empty">No systems written for this project yet.</div>'}`;
}
// The rail in path mode: a path list header, stages as groups (like domains),
// steps as items (like topics), ticked the same way a read topic is.
function railPathHTML(pth, stageId){
  const prog = pathProgress(pth.id);
  return `<div class="railhead">
      <a class="railgraph" href="#/paths">← All paths</a>
      <input class="railsearch" id="railSearch" placeholder="Jump to a step…" autocomplete="off">
    </div>
    <div class="raillist">${pth.stages.map(st => { const status = prog.stages[st.id];
      return `<div class="raildom ${st.id === stageId ? 'open' : ''}" data-dom="${st.id}" style="--dc:var(--accent2)">
      <button class="raildom-btn" data-stage="${st.id}"><span class="rdot"></span><span class="rt">${status === 'done' ? '✓ ' : status === 'skipped' ? '⇥ ' : ''}${esc(st.t)}</span><span class="rn">${st.steps.filter((_, i) => prog.steps[`${st.id}/${i}`]).length}/${st.steps.length}</span></button>
      <div class="railtopics">${st.steps.map((step, i) => `<button class="railtopic ${prog.steps[`${st.id}/${i}`] ? 'seen' : ''}" data-stage="${st.id}" data-step="${i}">${esc(stepTitle(step))}</button>`).join('')}</div></div>`; }).join('')}
    </div>`;
}
function railActive(){
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if(parts[0]==='map'){ if(parts[1]==='t' && TOPICS[parts[2]]) return { dom: TOPICS[parts[2]].d, topic: parts[2] }; if(parts[1]==='d' && DOM[parts[2]]) return { dom: parts[2], topic: null }; }
  if(parts[0]==='topic' && TOPICS[parts[1]]) return { dom: TOPICS[parts[1]].d, topic: parts[1] };
  if(parts[0]==='explore' && DOM[parts[1]]) return { dom: parts[1], topic: null };
  return { dom: null, topic: null };
}
function syncScrim(){ const open = ($('#rail').classList.contains('open') || $('#pane').classList.contains('open')) && isNarrow(); $('#scrim').classList.toggle('show', open); const dc = $('#drawerClose'); if(dc) dc.classList.toggle('show', open); }
function closeRailDrawer(r){ if(isNarrow()){ r.classList.remove('open'); syncScrim(); } }
// Crossing the narrow width swaps drawers for panes: drop drawer state when
// widening, and apply the route's pane rule when narrowing.
narrowQuery.addEventListener('change', () => {
  if(isNarrow()) showPaneFor(currentParts());
  else { $('#rail').classList.remove('open'); $('#pane').classList.remove('open'); syncScrim(); }
});
function railFilter(r, sel){
  const s = $('#railSearch'); if(!s) return;
  s.addEventListener('input', () => { const q = s.value.trim().toLowerCase();
    r.querySelectorAll('.raildom').forEach(de => { let any = false;
      de.querySelectorAll(sel).forEach(tb => { const hit = !q || tb.textContent.toLowerCase().includes(q); tb.style.display = hit ? '' : 'none'; if(hit) any = true; });
      const dn = de.querySelector('.rt').textContent.toLowerCase();
      de.style.display = (!q || any || dn.includes(q)) ? '' : 'none';
      if(q && any) de.classList.add('open'); }); });
}
function updateRail(){
  ensureShell(); const r = $('#rail'); if(!r) return;
  const hash = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const proj = hash[0] === 'experience' && hash[1] ? CASE_STUDIES.find(x => x.id === hash[1]) : null;
  if(proj){
    r.innerHTML = railProjectHTML(proj, hash[2], hash[3]);
    r.querySelectorAll('.raildom-btn').forEach(b => b.addEventListener('click', () => { const open = b.parentElement.classList.contains('open'); location.hash = open ? `#/experience/${proj.id}` : `#/experience/${proj.id}/${b.dataset.sys}`; }));
    r.querySelectorAll('.railtopic').forEach(b => b.addEventListener('click', () => { go(b.dataset.flow ? `#/experience/${proj.id}/flow/${b.dataset.flow}` : `#/experience/${proj.id}/${b.dataset.sys}/${b.dataset.part}`); closeRailDrawer(r); }));
    railFilter(r, '.railtopic');
    return;
  }
  const pth = hash[0] === 'paths' && hash[1] ? PATHS.find(x => x.id === hash[1]) : null;
  if(pth){
    r.innerHTML = railPathHTML(pth, hash[2]);
    r.querySelectorAll('.raildom-btn').forEach(b => b.addEventListener('click', () => { const open = b.parentElement.classList.contains('open'); location.hash = open ? `#/paths/${pth.id}` : `#/paths/${pth.id}/${b.dataset.stage}`; }));
    r.querySelectorAll('.railtopic').forEach(b => b.addEventListener('click', () => { const st = pth.stages.find(s => s.id === b.dataset.stage); const step = st && st.steps[+b.dataset.step]; if(step) go(stepHref(step, pth.id, st.id)); closeRailDrawer(r); }));
    railFilter(r, '.railtopic');
    return;
  }
  const a = railActive(); r.innerHTML = railHTML(a.dom, a.topic);
  r.querySelectorAll('.raildom-btn').forEach(b => b.addEventListener('click', () => { const dom = b.parentElement; dom.classList.toggle('open'); store.set('sideOpen', [...r.querySelectorAll('.raildom.open')].map(x => x.dataset.dom)); }));
  r.querySelectorAll('.railtopic').forEach(b => b.addEventListener('click', () => { go('#/map/t/' + b.dataset.topic); closeRailDrawer(r); }));
  railFilter(r, '.railtopic');
}
function setView(html){ ensureShell(); const pane = $('#pane'); pane.innerHTML = `${pathBarHTML()}${subNavHTML()}<div class="view">${html}</div>`; updateRail(); window.scrollTo({ top: 0 }); }
// The views of the current group, as sub-tabs. The map group shows them on
// its landing views only, not above every domain and topic page.
function subNavHTML(){
  const p = currentParts(), v = p[0] || 'map', g = VIEW_GROUP[v];
  if(!g || g.views.length < 2 || (v === 'map' && p[1] && p[1] !== 'home')) return '';
  const cur = v === 'smell' ? 'diagnose' : v;
  const due = g.id === 'paths' ? reviewDue().length : 0;
  return `<nav class="subnav" aria-label="${esc(g.t)}">${g.views.map(([id, t]) => `<a href="#/${id}"${id === cur ? ' class="active" aria-current="page"' : ''}>${esc(t)}${id === 'review' && due ? ` (${due} due)` : ''}</a>`).join('')}</nav>`;
}
function crumbs(items){ return `<div class="crumbs">${items.map((it, i) => (i ? '<span class="sep">›</span>' : '') + (it[1] ? `<button data-href="${it[1]}">${esc(it[0])}</button>` : `<span>${esc(it[0])}</span>`)).join('')}</div>`; }
function domChip(id){ const d = DOM[id]; return d ? `<span class="chip dom" style="--dc:${d.color}">${esc(d.t)}</span>` : ''; }
function topicLink(id, label){ const t = TOPICS[id]; if(t) return `<a href="#/map/t/${id}">${esc(label || t.t)}</a>`; const v = VIEW_LINKS[id]; if(v) return `<a href="${v[0]}">${esc(label || v[1])}</a>`; return esc(label || id); }
function promptBox(label, text){ return `<div class="promptbox">${label ? `<div class="lbl">${esc(label)}</div>` : ''}<pre>${esc(text)}</pre><button class="btn sm copybtn" data-action="copy">Copy</button></div>`; }
function list(arr){ return `<ul>${(arr||[]).map(x => `<li>${esc(x)}</li>`).join('')}</ul>`; }
function chainHTML(items, cls){ return `<div class="chain">${items.map((it, i) => (i ? '<span class="arrow">→</span>' : '') + `<a class="cn ${it[2]||cls||''} lnk" title="${esc(it[3]||'')}" href="${it[1]}">${esc(it[0])}</a>`).join('')}</div>`; }

/* ---------- inline SVG diagrams (theme-aware, no external assets) ---------- */
const DIAGRAM_HIERARCHY = `<svg class="diagram" viewBox="0 0 640 232" role="img" aria-label="Information hierarchy: one attention budget, sorted by how fast it must be read">
  <text class="dhead" x="0" y="13">One attention budget, sorted by how fast it must be read</text>
  <rect class="bar1" x="0" y="26" width="632" height="52" rx="2"/>
  <text class="dt" x="14" y="48">The decision in action</text>
  <text x="14" y="66">size, contrast and motion, never text</text>
  <rect class="bar2" x="0" y="92" width="452" height="52" rx="2"/>
  <text class="dt" x="14" y="114">State checked between actions</text>
  <text x="14" y="132">recognition, not recall. The world can carry most of it</text>
  <rect class="bar3" x="0" y="158" width="300" height="52" rx="2"/>
  <text class="dt" x="14" y="180">Reference only</text>
  <text x="14" y="198">read when stopped. If nobody uses it, cut it</text>
</svg>`;
const DIAGRAM_FEEDBACK = `<svg class="diagram" viewBox="0 0 620 246" role="img" aria-label="The feedback loop: action, simulation, feedback, model update">
  <defs><marker id="arrfb" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path class="fill-a" d="M0,0 L6,3 L0,6 Z"/></marker></defs>
  <text class="dhead" x="0" y="13">The loop that teaches: Dan Cook's skill atom</text>
  <rect class="box" x="20" y="30" width="220" height="64" rx="2"/><text class="dt" x="34" y="54">Action</text><text x="34" y="72">the player does something</text>
  <rect class="box" x="380" y="30" width="220" height="64" rx="2"/><text class="dt" x="394" y="54">Simulation</text><text x="394" y="72">the rules resolve it</text>
  <rect class="box" x="380" y="150" width="220" height="64" rx="2"/><text class="dt" x="394" y="174">Feedback</text><text x="394" y="192">the game shows what happened</text>
  <rect class="box" x="20" y="150" width="220" height="64" rx="2"/><text class="dt" x="34" y="174">Model update</text><text x="34" y="192">the player updates belief</text>
  <line class="stroke-a" x1="242" y1="62" x2="374" y2="62" marker-end="url(#arrfb)"/>
  <line class="stroke-a" x1="490" y1="96" x2="490" y2="144" marker-end="url(#arrfb)"/>
  <line class="stroke-a" x1="378" y1="182" x2="246" y2="182" marker-end="url(#arrfb)"/>
  <line class="stroke-a" x1="130" y1="148" x2="130" y2="100" marker-end="url(#arrfb)"/>
</svg>`;
const DIAGRAM_DISSECTION = `<svg class="diagram" viewBox="0 0 704 258" role="img" aria-label="Dissect each comparable with one template, then cross-reference your concept against all of them">
  <defs><marker id="arrds" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path class="fill-b" d="M0,0 L6,3 L0,6 Z"/></marker></defs>
  <text class="dhead" x="0" y="13">Dissect each comparable with one template</text>
  <rect class="box" x="0" y="24" width="160" height="58" rx="2"/><text class="dt" x="14" y="48">Want served</text><text x="14" y="66">the reason they play</text>
  <rect class="box" x="182" y="24" width="160" height="58" rx="2"/><text class="dt" x="196" y="48">Core verb</text><text x="196" y="66">what they do most</text>
  <rect class="box" x="364" y="24" width="160" height="58" rx="2"/><text class="dt" x="378" y="48">First 30s</text><text x="378" y="66">what teaches the game</text>
  <rect class="box" x="546" y="24" width="160" height="58" rx="2"/><text class="dt" x="560" y="48">Decision/min</text><text x="560" y="66">the repeatable choice</text>
  <line class="stroke-b" x1="162" y1="53" x2="178" y2="53" marker-end="url(#arrds)"/>
  <line class="stroke-b" x1="344" y1="53" x2="360" y2="53" marker-end="url(#arrds)"/>
  <line class="stroke-b" x1="526" y1="53" x2="542" y2="53" marker-end="url(#arrds)"/>
  <text class="dhead" x="0" y="118">Then cross-reference your concept against all of them</text>
  <rect class="box" x="0" y="130" width="160" height="58" rx="2"/><text class="dt" x="14" y="154">Why it worked</text><text x="14" y="172">the mechanism, cited</text>
  <rect class="box" x="182" y="130" width="160" height="58" rx="2"/><text class="dt" x="196" y="154">Complaints</text><text x="196" y="172">the want left unserved</text>
  <rect class="box" x="364" y="130" width="160" height="58" rx="2"/><text class="dt" x="378" y="154">Lesson</text><text x="378" y="172">what you must not skip</text>
  <rect class="box" x="546" y="130" width="160" height="58" rx="2"/><text class="dt" x="560" y="154">Copies miss</text><text x="560" y="172">the usual failure</text>
  <text x="0" y="222">Shared want, a difference visible in one screenshot, an answered complaint, and a bar you can reach.</text>
  <text class="muted" x="0" y="242">Sources are heuristics. Verify every claim about why a game worked, or mark it unknown.</text>
</svg>`;
const DIAGRAMS = { 'ux-as-design': DIAGRAM_HIERARCHY, 'readability-and-hierarchy': DIAGRAM_HIERARCHY, 'feedback-and-affordance': DIAGRAM_FEEDBACK, 'learning-from-success': DIAGRAM_DISSECTION };
const DOMAIN_DIAGRAMS = { ux: DIAGRAM_HIERARCHY };

/* =====================================================================
   MAP
   ===================================================================== */
/* MAP: see 91-map.js */

/* =====================================================================
   EXPLORE + TOPIC
   ===================================================================== */

function renderExplore(domainId){
  const d = DOM[domainId];
  let main;
  if(d){
    main = `${crumbs([['Map','#/map'],['Explore','#/explore'],[d.t]])}
      <div class="domain-hero" style="--dc:${d.color}"><h1>${esc(d.t)}</h1><p class="dim" style="max-width:820px">${esc(d.sum)}</p>
        <div class="chips">${d.links.map(([to]) => `<a class="chip dom lnk" style="--dc:${DOM[to].color};cursor:pointer" href="#/explore/${to}">→ ${esc(DOM[to].t)}</a>`).join('')}</div></div>
      ${DOMAIN_DIAGRAMS[d.id] ? `<div class="card diagram-card">${DOMAIN_DIAGRAMS[d.id]}</div>` : ''}
      <div class="row" style="margin-bottom:10px"><a class="btn sm primary" href="#/map/d/${d.id}">Open this branch on the map ↗</a></div>
      <div class="section-head"><h2>Topics</h2></div>
      <div class="grid auto">${d.topics.map(tid => { const t = TOPICS[tid]; return `<a class="card clickable tint lnk blk" style="--dc:${d.color}" href="#/map/t/${tid}"><h3>${esc(t.t)} ${seen.has(tid)?'<span class="chip ok">read</span>':''}</h3><p class="dim small" style="margin:0">${esc(t.tag)}</p></a>`; }).join('')}</div>
      <div class="section-head"><h2>Why this connects</h2></div>
      <div class="grid c2">${d.links.map(([to, why]) => `<a class="card clickable lnk blk" href="#/explore/${to}"><b style="color:${DOM[to].color}">${esc(d.t)} ↔ ${esc(DOM[to].t)}</b><p class="dim small" style="margin:4px 0 0">${esc(why)}</p></a>`).join('')}
      ${DOMAINS.filter(o => o.links.some(([to]) => to === d.id) && !d.links.some(([to]) => to === o.id)).map(o => { const why = o.links.find(([to]) => to===d.id)[1]; return `<a class="card clickable lnk blk" href="#/explore/${o.id}"><b style="color:${o.color}">${esc(o.t)} ↔ ${esc(d.t)}</b><p class="dim small" style="margin:4px 0 0">${esc(why)}</p></a>`; }).join('')}</div>`;
  } else {
    main = `${crumbs([['Map','#/map'],['Explore']])}<h1>Explore all domains</h1><p class="dim">${DOMAINS.length} domains, ${TOPIC_LIST.length} topics. Each topic has the same practical parts (some add a techniques breakdown to compare implementation approaches), so you always know where the prompt patterns, verification questions and playtest questions are.</p>
      ${LENSES.map(([lid, lt]) => `<div class="section-head"><h2>${esc(lt)}</h2></div><div class="grid auto">${DOMAINS.filter(d => d.lens === lid).map(d => `<a class="card clickable tint lnk blk" style="--dc:${d.color}" href="#/explore/${d.id}"><h3>${esc(d.t)}</h3><p class="dim small">${esc(d.short)}</p><div class="small muted">${d.topics.length} topics · ${d.topics.filter(t=>seen.has(t)).length} read</div></a>`).join('')}</div>`).join('')}`;
  }
  setView(main);
}

function sectionBody(key, t){
  switch(key){
    case 'what': return `<p>${esc(t.what)}</p>`;
    case 'why': return list(t.why);
    case 'think': return `<div class="think-grid">
      <div class="box"><h4>Questions to ask</h4>${list(t.think.q)}</div>
      <div class="box"><h4>Tradeoffs</h4>${list(t.think.trade)}</div>
      <div class="box trap"><h4>Common traps</h4>${list(t.think.traps)}</div>
      <div class="box good"><h4>Signals of good design</h4>${list(t.think.good)}<h4 style="margin-top:8px;color:var(--bad)">Signals of bad design</h4>${list(t.think.bad)}</div></div>`;
    case 'how': return `<ol class="numbered">${t.how.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`;
    case 'tech': return `<p class="small dim">Techniques that solve this, compared on how they work, when they fit, and what they cost. Pick one to prototype, not all of them.</p><div class="think-grid">${(t.tech||[]).map(x => `<div class="box"><h4>${esc(x.n)}</h4><div class="small"><b>How it works.</b> ${esc(x.how)}</div><div class="small" style="margin-top:4px"><b>Fits when.</b> ${esc(x.fit)}</div><div class="small" style="margin-top:4px"><b>Cost / risk.</b> ${esc(x.cost)}</div><div class="small muted" style="margin-top:4px"><b>Watch out / instead.</b> ${esc(x.alt)}</div></div>`).join('')}</div>`;
    case 'ai': return `<div class="ai-split"><div class="box yes"><h4 style="color:var(--d-ai)">AI is good at</h4>${list(t.ai.yes)}</div><div class="box no"><h4 style="color:var(--d-player)">AI should not decide</h4>${list(t.ai.no)}</div></div>`;
    case 'prompts': return (t.prompts||[]).map(p => promptBox(p.l, p.p)).join('') + `<p class="small muted" style="margin-top:8px">Every prompt assumes you filled the brackets with your real player, fantasy, loop, constraints and evidence. Unfilled brackets produce genre averages. See ${topicLink('prompting-framework')} and the <a href="#/build/prompt">Prompt Generator</a>.</p>`;
    case 'verify': return list(t.verify) + `<details><summary>Universal verification questions (apply to every AI output)</summary><div class="body">${list(['What assumptions are you making? Mark each as given, inferred, or invented.','What evidence supports this?','What could make this fail?','What player behavior would prove this wrong?','Is this solving the actual problem or producing more content?','Is this complexity necessary?','What is the smallest prototype that tests this?','What alternatives did we reject?','What tradeoff are we making?'])}<a class="btn sm" href="#/checklists/ai-verify">Open the verification checklist</a></div></details>`;
    case 'test': return list(t.test) + `<div class="row"><a class="btn sm" href="#/build/hypothesis">Write the hypothesis</a><a class="btn sm" href="#/playtest">Playtest question bank</a></div>`;
  }
  return '';
}

// Reverse index from every project part's `rel` back to the guide topic it
// demonstrates. Built once, on first use, and shared by three readers: the
// "Seen in practice" chips below, the runtime view links the domain map's
// leaves travel through, and the map itself.
let _PRACTICE = null;
function practice(){
  if(!_PRACTICE){ _PRACTICE = PlayableGraph.practiceLinks(CASE_STUDIES, 2); Object.assign(VIEW_LINKS, _PRACTICE.views); }
  return _PRACTICE;
}
function practiceChips(topicId){
  const hits = practice().hits[topicId] || [];
  if(!hits.length) return '';
  return `<div class="small" style="margin-top:8px"><b>Seen in practice:</b> one part of a shipped project that is this idea in the field.</div>
    <div class="chips" style="margin-top:5px">${hits.map(h => `<a class="chip prac lnk" title="${esc(h.why)}" href="#/experience/${h.cs.id}/${h.sys.id}/${h.part.id}">◆ ${esc(h.cs.t)} · ${esc(h.part.t)}</a>`).join('')}</div>`;
}
function topicContexts(t){
  return {
    home: DOM[t.d],
    refs: TOPIC_LIST.filter(x => x.id !== t.id && (x.rel||[]).some(([rid]) => rid === t.id)),
    smells: SMELLS.filter(s => s.causes.some(c => c.top === t.id)),
    loops: LOOP_PARTS.filter(p => (p.top||[]).includes(t.id)),
    steps: LOOP_STEPS.filter(s => (s.top||[]).includes(t.id))
  };
}
function contextsPanel(t){
  const c = topicContexts(t);
  const chips = [`<span class="chip dom" style="--dc:${c.home.color}">${esc(c.home.t)} · home</span>`]
    .concat(c.refs.map(x => `<a class="chip lnk" style="cursor:pointer" href="#/map/t/${x.id}">${esc(DOM[x.d].t)} · ${esc(x.t)}</a>`));
  return `<div class="card contexts"><h4>Appears in</h4><div class="small muted">One concept, several contexts. Its home domain, then every concept that references it. The article is not duplicated.</div>
    <div class="chips" style="margin-top:8px">${chips.join('')}</div>
    ${c.smells.length ? `<div class="small" style="margin-top:8px"><b>Diagnoses smells:</b> ${c.smells.map(s => `<a href="#/smell/${s.id}">${esc(s.t)}</a>`).join(', ')}</div>` : ''}
    ${c.loops.length ? `<div class="small" style="margin-top:4px"><b>Core-loop links:</b> ${c.loops.map(p => esc(p.t)).join(', ')}</div>` : ''}
    ${c.steps.length ? `<div class="small" style="margin-top:4px"><b>AI-era loop steps:</b> ${c.steps.map(s => `<a href="#/ai/loop/${s.n}">${s.n}</a>`).join(', ')}</div>` : ''}
    ${practiceChips(t.id)}${pathChips(t.id)}</div>`;
}
function renderConcepts(){
  const rows = TOPIC_LIST.map(t => ({ t, n: TOPIC_LIST.filter(x => x.id !== t.id && (x.rel||[]).some(([rid]) => rid === t.id)).length })).sort((a, b) => b.n - a.n || a.t.t.localeCompare(b.t.t));
  const card = r => `<a class="card clickable tint lnk blk" style="--dc:${DOM[r.t.d].color}" href="#/map/t/${r.t.id}"><b>${esc(r.t.t)}</b><div class="small dim">${esc(DOM[r.t.d].t)} · referenced by ${r.n}</div></a>`;
  setView(`${crumbs([['Map','#/map'],['Concept index']])}<h1>Concept index</h1><p class="dim">All ${TOPIC_LIST.length} concepts, most referenced first. A concept lives in one home domain and is referenced from others, so it belongs to several contexts without being copied.</p>
    <div class="field"><input id="ciFilter" placeholder="Filter concepts…"></div>
    <div class="grid auto" id="ciList">${rows.map(card).join('')}</div>`);
  const f = $('#ciFilter'); f.addEventListener('input', () => { const q = f.value.trim().toLowerCase(); $('#ciList').innerHTML = rows.filter(r => r.t.t.toLowerCase().includes(q) || DOM[r.t.d].t.toLowerCase().includes(q)).map(card).join('') || '<div class="empty">No concept matches.</div>'; });
}
/* ---------- topic tabs: overview / godot / unity / interview ---------- */
const TOPIC_TABS = [['overview','Overview'],['godot','Godot'],['unity','Unity'],['interview','Interview']];
// A tab only exists when the topic carries its data, so nothing renders blank.
function tabsFor(t){ return TOPIC_TABS.filter(([k]) => k === 'overview' || (k === 'interview' ? !!t.iv : !!(t.eng && t.eng[k]))); }
let topicTab = 'overview';
// The tab in the URL wins; otherwise the last one this browser used; unknown
// or unavailable falls back to overview. Only an explicit URL tab is stored.
function setTopicTab(t, tab){
  const avail = tabsFor(t).map(x => x[0]);
  const want = tab || store.get('topicTab', 'overview');
  topicTab = avail.includes(want) ? want : 'overview';
  if(tab) store.set('topicTab', topicTab);
}
// Overview is omitted from the URL, so its hash equals the bare topic hash and
// route() would re-resolve the tab from the store. Record the choice first.
ACTIONS['topic-tab'] = el => { const tab = el.dataset.tab; store.set('topicTab', tab); go('#/map/t/' + el.dataset.topic + (tab === 'overview' ? '' : '/' + tab)); };
// Arrow keys, Home and End move along a tab strip (topic and project tabs).
function tabKey(e){
  const strip = e.target.closest && e.target.closest('.topictabs'); if(!strip) return;
  if(!/^(ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End)$/.test(e.key)) return;
  e.preventDefault();
  const btns = $$('button', strip), i = btns.indexOf(e.target);
  const n = e.key === 'Home' ? 0 : e.key === 'End' ? btns.length - 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? (i - 1 + btns.length) % btns.length : (i + 1) % btns.length;
  btns[n].click();
  setTimeout(() => { const b = $('.topictabs button.active'); if(b) b.focus(); }, 0);
}
function engineBody(t, which){
  const v = t.eng[which], d = DOM[t.d];
  return `<div class="engview" style="--dc:${d.color}">
    <div class="overline">${which === 'godot' ? 'Godot 4' : 'Unity 6'} · what this is called here</div>
    <p>${esc(v.term)}</p>
    <h4>Reach for</h4><div class="chips apis">${v.api.map(a => `<span class="chip api">${esc(a)}</span>`).join('')}</div>
    <div class="promptbox"><pre class="snippet">${esc(v.snippet)}</pre><button class="btn sm copybtn" data-action="copy">Copy</button></div>
    <div class="callout bad"><b>Pitfall.</b> ${esc(v.pitfall)}</div>
    <div class="callout ok"><b>Same idea, different name.</b> ${esc(v.map)}</div>
    ${t.eng.note ? `<div class="callout"><b>Why this is the counterpart.</b> ${esc(t.eng.note)}</div>` : ''}</div>`;
}
// One interview renderer for both scales. `iv` is the { junior, mid, senior }
// object, `color` tints the cards, `storyKey` is the storage key of the "your
// story" textarea (story.<topic-id> for a topic, story.<case-id> for a
// project) and `near` is optional prev/next button HTML.
// `key` names the question set (topic, project or system and level) so each
// question can sit in the review queue under a stable key.
function ivCards(arr, color, key){
  const queued = reviewItems();
  return `<div class="ivlist">${arr.map((x, i) => { const k = `${key}:${i}`, on = !!queued[k];
    return `<details class="ivq" style="--dc:${color}"><summary>${esc(x.q)}</summary><div class="body">
    <h4>Answer outline</h4><p>${esc(x.a)}</p>
    <h4>Follow-up coming</h4><p>${esc(x.follow)}</p>
    <h4 class="redflag">Red flag</h4><p>${esc(x.red)}</p>
    <button type="button" class="btn sm ghost" data-action="review-toggle" data-key="${esc(k)}" aria-pressed="${on}">${on ? 'In your review queue' : 'Review later'}</button></div></details>`; }).join('')}</div>`;
}
function interviewBody(iv, color, storyKey, near){
  const LV = [['junior','Junior'],['mid','Mid'],['senior','Senior']];
  const groups = LV.map(([k, label]) => { const arr = (iv && iv[k]) || []; if(!arr.length) return '';
    return `<div class="section-head"><h2>${label}</h2><span class="muted">${arr.length} question${arr.length === 1 ? '' : 's'}</span></div>
      ${ivCards(arr, color, `iv:${storyKey.slice(6)}:${k}`)}`; }).join('');
  return `<div class="ivview">${groups}
    <div class="section-head"><h2>Your story</h2><span class="muted">the one you will actually tell</span></div>
    <p class="small dim">An outline is not an answer. Write the time you did this, what you changed and what happened, in your own words. Autosaved in this browser, never in the data, never sent anywhere.</p>
    <div class="field"><textarea id="ivStory" rows="6" placeholder="Situation, what I decided, the trade-off I accepted, what actually happened…" data-story="${storyKey}">${esc(store.get(storyKey, ''))}</textarea><div class="hint">Autosaved in this browser as you type.</div></div>
    ${near ? `<div class="topic-nav">${near}</div>` : ''}</div>`;
}
function topicInterviewBody(t){
  const d = DOM[t.d];
  const idx = d.topics.indexOf(t.id);
  const near = [['prev', idx > 0 ? d.topics[idx-1] : null], ['next', idx < d.topics.length-1 ? d.topics[idx+1] : null]]
    .filter(([, id]) => id && TOPICS[id] && TOPICS[id].iv)
    .map(([dir, id]) => `<button class="btn" data-href="#/map/t/${id}/interview">${dir === 'prev' ? '← ' : ''}${esc(TOPICS[id].t)}${dir === 'next' ? ' →' : ''}</button>`).join('');
  return interviewBody(t.iv, d.color, 'story.' + t.id, near);
}
function topicBody(id){
  const t = TOPICS[id];
  if(!t){ return `<div class="empty">Unknown topic: ${esc(id)}</div>`; }
  markSeen(id);
  const d = DOM[t.d];
  const idx = d.topics.indexOf(id);
  const prev = idx > 0 ? d.topics[idx-1] : null, next = idx < d.topics.length-1 ? d.topics[idx+1] : null;
  const openSecs = new Set(store.get('openSecs', ['what','why','think']));
  const secTitle = key => (d.titles && d.titles[key]) || SECTION_META.find(m => m[0] === key)[2];
  const secs = SECTION_META.map(([key, letter]) => `<section class="sec ${openSecs.has(key)?'open':''}" data-key="${key}" style="--dc:${d.color}"><header data-action="toggle-sec"><span class="letter">${letter}</span><h3><button type="button" class="sec-btn" data-action="toggle-sec" aria-expanded="${openSecs.has(key)}">${esc(secTitle(key))}</button></h3><span class="car" aria-hidden="true">▸</span></header><div class="body">${sectionBody(key, t)}</div></section>`).join('');
  const techSec = (t.tech && t.tech.length) ? `<section class="sec ${openSecs.has('tech')?'open':''}" data-key="tech" style="--dc:${d.color}"><header data-action="toggle-sec"><span class="letter">T</span><h3><button type="button" class="sec-btn" data-action="toggle-sec" aria-expanded="${openSecs.has('tech')}">Techniques to compare</button></h3><span class="car" aria-hidden="true">▸</span></header><div class="body">${sectionBody('tech', t)}</div></section>` : '';
  const rel = (t.rel||[]).map(([rid, why]) => { const rt = TOPICS[rid]; const v = VIEW_LINKS[rid]; const href = rt ? `#/map/t/${rid}` : (v ? v[0] : '#/explore'); const label = rt ? rt.t : (v ? v[1] : rid); const dc = rt ? DOM[rt.d].color : 'var(--accent)'; return `<a class="rel lnk blk" style="border-left:3px solid ${dc}" href="${href}"><b>${esc(label)}</b><div class="why">${esc(why)}</div></a>`; }).join('');
  const smells = SMELLS.filter(s => s.causes.some(c => c.top === id));
  // Diagram and "Appears in" belong to the Overview body, so the engine and
  // interview tabs start directly under the strip instead of below the fold.
  // "Appears in" follows the sections: the article comes first, its
  // cross-references after it (on a phone the chips pushed "What is it?"
  // more than a screen down).
  const overview = `${DIAGRAMS[id] ? `<div class="card diagram-card">${DIAGRAMS[id]}</div>` : ''}
    ${secs}${techSec}
    <div class="section-head"><h2>Related concepts</h2><span class="muted">and why they connect</span></div>
    <div class="related">${rel}</div>
    ${smells.length ? `<div class="section-head"><h2>Design smells this topic helps diagnose</h2></div><div class="chips">${smells.map(s => `<a class="chip lnk" style="cursor:pointer;padding:6px 10px" href="#/smell/${s.id}">${esc(s.t)}</a>`).join('')}</div>` : ''}
    ${contextsPanel(t)}
    <div class="topic-nav">${prev ? `<button class="btn" data-href="#/map/t/${prev}">← ${esc(TOPICS[prev].t)}</button>` : `<button class="btn ghost" data-href="#/map/d/${d.id}">← ${esc(d.t)} overview</button>`}<button class="btn ghost" data-href="#/explore/${d.id}">List view</button>${next ? `<button class="btn" data-href="#/map/t/${next}">${esc(TOPICS[next].t)} →</button>` : `<button class="btn" data-href="#/map/home">All domains →</button>`}</div>`;
  const tabs = tabsFor(t);
  const tab = tabs.some(x => x[0] === topicTab) ? topicTab : 'overview';
  // One tab means there is nothing to choose, so the strip is not drawn at all.
  const strip = tabs.length > 1 ? `<div class="tabs topictabs" role="tablist" aria-label="Topic views">${tabs.map(([k, label]) => `<button role="tab" aria-selected="${k === tab}" tabindex="${k === tab ? 0 : -1}" class="${k === tab ? 'active' : ''}" data-tab="${k}" data-action="topic-tab" data-topic="${id}">${label}</button>`).join('')}</div>` : '';
  const body = tab === 'interview' ? topicInterviewBody(t) : (tab === 'godot' || tab === 'unity') ? engineBody(t, tab) : overview;
  return `<div class="topic-head"><div style="flex:1"><div class="chips" style="margin-bottom:6px">${domChip(t.d)}<span class="chip">${idx+1} of ${d.topics.length}</span></div><h1>${esc(t.t)}</h1><p class="tag">${esc(t.tag)}</p></div>
      ${tab === 'overview' ? `<div class="row"><button class="btn sm" data-action="expand-all" data-open="1">Expand all</button><button class="btn sm ghost" data-action="expand-all" data-open="0">Collapse</button></div>` : ''}</div>
    ${strip}<div class="tabbody" role="tabpanel">${body}</div>`;
}
ACTIONS['toggle-sec'] = el => { const sec = el.closest('.sec'), open = sec.classList.toggle('open'); sec.querySelector('.sec-btn').setAttribute('aria-expanded', open); store.set('openSecs', $$('.sec.open').map(s => s.dataset.key)); };
// No-op when no sections are on screen (an engine or interview tab), so the
// head buttons and the E shortcut cannot silently wipe the overview's state.
function expandAll(on){ const secs = $$('.sec'); if(!secs.length) return; secs.forEach(s => { s.classList.toggle('open', on); s.querySelector('.sec-btn').setAttribute('aria-expanded', on); }); store.set('openSecs', on ? SECTION_META.map(m => m[0]) : []); }
ACTIONS['expand-all'] = el => expandAll(el.dataset.open === '1');

/* =====================================================================
   DIAGNOSE
   ===================================================================== */
function renderDiagnose(sub='smells', arg){
  const tabs = [['smells','Design smells'], ...DIAGNOSTICS.map(([id, tab]) => [id, tab])];
  const head = `${crumbs([['Map','#/map'],['Diagnose']])}<h1>Diagnose</h1><p class="dim">Start from what you observe in players, not from what you built. Each diagnosis ends in an experiment and a prompt.</p>
    <div class="tabs">${tabs.map(([id, t]) => `<button class="${id===sub?'active':''}" data-href="#/diagnose/${id}">${t}</button>`).join('')}</div>`;
  let body = '';
  if(sub === 'smells') body = smellsView(arg);
  else if(sub === 'fun') body = funView(arg);
  else if(sub === 'loop') body = loopView(arg);
  else if(sub === 'unfair') body = unfairView();
  else if(sub === 'depth') body = depthView();
  else if(sub === 'content') body = contentTreeView();
  setView(head + body);
  if(sub === 'smells') wireSmellSearch();
  if(sub === 'unfair') wireUnfair();
  if(sub === 'depth') wireDepth();
  if(sub === 'content') wireContentTree();
}

function smellCard(s){ return `<a class="smell lnk blk" href="#/smell/${s.id}"><h3>${esc(s.t)}</h3><div class="small dim">${esc(s.sym)}</div><div class="chips" style="margin-top:6px">${s.dom.map(domChip).join('')}</div></a>`; }
function smellsView(id){
  const s = SMELLS.find(x => x.id === id);
  if(s){
    return `<div class="row between"><button class="btn ghost" data-href="#/diagnose/smells">← All smells</button><div class="chips">${s.dom.map(domChip).join('')}</div></div>
      <h2 style="margin-top:10px">${esc(s.t)}</h2><p class="dim">${esc(s.sym)}</p>
      ${s.dims ? `<div class="chips" style="margin-bottom:10px"><span class="small muted">Fun dimensions implicated:</span>${s.dims.map(d => `<a class="chip lnk" style="cursor:pointer" href="#/diagnose/fun/${d}">${d}</a>`).join('')}</div>` : ''}
      <h3>Likely causes and the experiment for each</h3>
      ${s.causes.map((c, i) => `<div class="cause"><div class="t"><span class="badge-num" style="--dc:var(--accent)">${i+1}</span>${esc(c.c)} <span class="chip">${topicLink(c.top)}</span></div><div class="exp"><b>Experiment:</b> ${esc(c.exp)}</div></div>`).join('')}
      <h3 style="margin-top:16px">Ask AI to help diagnose</h3>${promptBox('Diagnostic prompt', s.prompt)}
      <div class="callout"><b>Then:</b> write the hypothesis for the cause you believe most, in the <a href="#/build/hypothesis">Hypothesis Builder</a>. Test the cheapest experiment. Change one important variable. Test again.</div>`;
  }
  return `<div class="field"><input id="smellSearch" placeholder="Filter smells: repetitive, build, tutorial, unfair, return…"></div>
    <div class="pill-tabs" id="smellDomFilter"><button class="active" data-d="">All</button>${DOMAINS.filter(d => SMELLS.some(s => s.dom.includes(d.id))).map(d => `<button data-d="${d.id}">${esc(d.t)}</button>`).join('')}</div>
    <div class="smell-list" id="smellList">${SMELLS.map(smellCard).join('')}</div>`;
}
function wireSmellSearch(){
  const inp = $('#smellSearch'); if(!inp) return; let dom = '';
  const apply = () => { const q = inp.value.trim().toLowerCase(); $('#smellList').innerHTML = SMELLS.filter(s => (!dom || s.dom.includes(dom)) && (!q || (s.t+' '+s.sym+' '+s.causes.map(c=>c.c).join(' ')).toLowerCase().includes(q))).map(smellCard).join('') || '<div class="empty">No smell matches. Try the global search (Ctrl K) for topics and prompts.</div>'; };
  inp.oninput = apply; inp.focus();
  $$('#smellDomFilter button').forEach(b => b.onclick = () => { $$('#smellDomFilter button').forEach(x => x.classList.remove('active')); b.classList.add('active'); dom = b.dataset.d; apply(); });
}

function funView(dim){
  const funSmells = SMELLS.filter(s => s.fun);
  const active = FUN_DIMS.find(d => d[0] === dim);
  return `<div class="callout"><b>Ask "what is the player actually enjoying here?"</b> not "what feature should we add?" Different games combine these dimensions differently. The working set below draws on LeBlanc's eight kinds of fun, Lazzaro's four keys, Koster's fun-as-learning and Self-Determination Theory. It is a vocabulary, not a law.</div>
    <h3>Dimensions of fun <span class="muted small">click one to see its test question and the smells where it goes flat</span></h3>
    <div class="dims">${FUN_DIMS.map(d => `<button class="${d[0]===dim?'active':''}" data-href="#/diagnose/fun/${d[0]}">${d[0]}<div class="small muted" style="font-weight:400">${esc(d[1])}</div></button>`).join('')}</div>
    ${active ? `<div class="card" style="margin-top:12px"><h3>${active[0]}</h3><p>${esc(active[1])}</p><p><b>Playtest question:</b> ${esc(active[2])}</p><h4>Smells where ${active[0]} goes flat</h4><div class="smell-list">${funSmells.filter(s => s.dims && s.dims.includes(active[0])).map(smellCard).join('') || '<div class="empty">No smell tagged with this dimension yet.</div>'}</div></div>` : ''}
    <div class="section-head"><h2>Symptom → dimensions → causes → experiments</h2></div>
    <div class="smell-list">${funSmells.map(s => `<a class="smell lnk blk" href="#/smell/${s.id}"><h3>${esc(s.t)}</h3><div class="chips">${(s.dims||[]).map(d => `<span class="chip">${d}</span>`).join('')}</div></a>`).join('')}</div>
    ${promptBox('Ask AI to tag a playtest by fun dimension', `Here are timestamped observer notes from a playtest: [NOTES]. Tag each moment of visible engagement or disengagement with the fun dimension involved (${FUN_DIMS.map(d=>d[0]).join(', ')}). Summarize the distribution, compare it to our intended mix ([INTENDED]), and identify the largest gap. Propose one change to an existing interaction, not a new system, that would close it.`)}`;
}

function loopView(part){
  const p = LOOP_PARTS.find(x => x.id === part) || LOOP_PARTS[0];
  return `<div class="callout">Action → Feedback → Decision → Consequence → New situation. Click a link to see what happens when it is weak. Then fix that link before adding anything.</div>
    <div class="loopviz">${LOOP_PARTS.map(x => `<button class="${x.id===p.id?'active':''}" data-href="#/diagnose/loop/${x.id}">${esc(x.t)}<small>${esc(x.sub)}</small></button>`).join('')}</div>
    <div class="card"><h2>Weak ${esc(p.t)}</h2><p class="dim">${esc(p.weak)}</p>
      <div class="think-grid"><div class="box bad"><h4>Symptoms in playtests</h4>${list(p.sym)}</div><div class="box trap"><h4>Likely causes</h4>${list(p.causes)}</div><div class="box good"><h4>Fixes</h4>${list(p.fixes)}</div><div class="box"><h4>Go deeper</h4><ul>${p.top.map(t => `<li>${topicLink(t)}</li>`).join('')}</ul></div></div>
      ${promptBox('Ask AI to audit this link', `Act as a skeptical systems designer. Here is our core loop from the player's perspective: [FIVE SENTENCES]. Focus on the ${p.t.toLowerCase()} link. Rate its strength using only evidence from my description, name the playtest symptom that would appear if it is weak, and propose 3 mechanically distinct fixes with the decision each creates, the emotion intended, the likely failure mode, and the observable signal that would validate it. Do not recommend one.`)}
      <div class="row"><a class="btn" href="#/build/loop">Build your loop in the Loop Builder</a></div></div>`;
}

function unfairView(){
  return `<div class="callout"><b>"Unfair" is a specific complaint with specific causes.</b> Treating it as "too hard" leads to the wrong fix. Tick the signs you observed. The likely causes rise to the top. Every fix preserves the challenge.</div>
    <div class="grid c2"><div class="card checklist" id="unfairSigns"><h3>What did you observe?</h3>${UNFAIR_CAUSES.flatMap(c => c.signs.map(s => `<label><input type="checkbox" data-c="${c.id}"><span>${esc(s)}</span></label>`)).join('')}</div>
    <div id="unfairResult"><div class="empty">Tick signs on the left to rank causes.</div></div></div>`;
}
function wireUnfair(){
  const box = $('#unfairSigns'); if(!box) return;
  const apply = () => { const counts = {}; $$('input:checked', box).forEach(i => counts[i.dataset.c] = (counts[i.dataset.c]||0)+1);
    const ranked = UNFAIR_CAUSES.map(c => [c, counts[c.id]||0]).filter(x => x[1] > 0).sort((a,b) => b[1]-a[1]);
    $('#unfairResult').innerHTML = ranked.length ? ranked.map(([c, n]) => `<div class="cause"><div class="t">${esc(c.t)} <span class="chip ${n>=2?'bad':'warn'}">${n} sign${n>1?'s':''}</span> <span class="chip">${topicLink(c.top)}</span></div><div class="exp"><b>Fix that preserves the challenge:</b> ${esc(c.fix)}</div></div>`).join('') + promptBox('Diagnostic prompt', `Players report that [SECTION] feels unfair. Observed signs: ${ranked.map(([c])=>c.t.toLowerCase()).join(', ')}. Notes: [NOTES]. For each likely cause, cite the evidence and propose a fix that does not reduce the challenge itself. Only then propose a number change, if still needed.`) : '<div class="empty">Tick signs on the left to rank causes.</div>'; };
  box.onchange = apply;
}

function depthView(){
  const saved = store.get('ruleAudit', [{r:'Attack costs stamina. Stamina regenerates when not attacking', k:'decision'},{r:'Three currency types with separate wallets', k:'load'},{r:'Fire spreads on grass. Enemies avoid fire', k:'interaction'}]);
  return `<div class="grid c2">
    <div class="card"><h3>Complexity</h3><p>The number of rules, exceptions and pieces of state the player must understand to play. Paid up front, by every player, before any depth is reached.</p><h3>Depth</h3><p>The number of meaningful, situationally different decisions those rules generate. Enjoyed only by players who stay.</p><h3>Elegance</h3><p>Depth per unit of complexity. Chess: few rules, enormous depth. A game with 300 stats can be shallow. No agreed metric exists. Use the audit as a lens.</p>
      <div class="callout warn"><b>AI-era note:</b> adding rules is now nearly free. Complexity inflation is the default failure. Cut rules that create no decision.</div>
      ${promptBox('Depth audit prompt', `Evaluate this system for depth rather than feature count: [RULES]. For each rule, classify it as (a) creates a situational decision, (b) enables an interaction with another rule, or (c) adds cognitive or implementation load only. Propose merges or deletions for every (c), stating what the player would lose. Estimate how many distinct meaningful decisions the simplified system still produces.`)}</div>
    <div class="card rule-audit"><h3>Rule audit <span class="muted small">saved locally</span></h3><p class="small dim">List your rules. Mark what each does. The meter shows depth per rule. The list shows what to cut.</p>
      <div id="rules">${saved.map(x => ruleRow(x)).join('')}</div>
      <div class="row" style="margin-top:8px"><input id="newRule" placeholder="Add a rule…" style="flex:1"><button class="btn" id="addRule">Add</button></div>
      <div id="ruleStats" style="margin-top:12px"></div></div></div>`;
}
function ruleRow(x){ return `<div class="rule"><input value="${esc(x.r)}" class="rtext"><select class="rkind"><option value="decision" ${x.k==='decision'?'selected':''}>creates a decision</option><option value="interaction" ${x.k==='interaction'?'selected':''}>enables an interaction</option><option value="load" ${x.k==='load'?'selected':''}>load only</option></select><button class="btn sm ghost danger rdel" title="Remove">✕</button></div>`; }
function wireDepth(){
  const rules = $('#rules'); if(!rules) return;
  const read = () => $$('.rule', rules).map(r => ({ r: $('.rtext', r).value, k: $('.rkind', r).value }));
  const update = () => { const rs = read(); store.set('ruleAudit', rs); const n = rs.length, dec = rs.filter(x => x.k==='decision').length, inter = rs.filter(x => x.k==='interaction').length, load = rs.filter(x => x.k==='load').length; const score = n ? Math.round(100*(dec+inter)/n) : 0;
    $('#ruleStats').innerHTML = n ? `<div class="kv"><dt>Rules (complexity)</dt><dd>${n}</dd><dt>Decision rules</dt><dd>${dec}</dd><dt>Interaction rules</dt><dd>${inter}</dd><dt>Load-only rules</dt><dd style="color:${load?'var(--bad)':'inherit'}">${load}</dd><dt>Elegance</dt><dd><div class="meter"><i style="width:${score}%"></i></div><span class="small muted">${score}% of rules earn their place</span></dd></div>${load ? `<div class="callout bad" style="margin-top:10px"><b>Cut list:</b> ${rs.filter(x=>x.k==='load').map(x=>esc(x.r)).join('. ')}. Prototype without them. Most players will not notice.</div>` : ''}` : '<div class="empty">No rules yet.</div>'; };
  rules.addEventListener('input', update); rules.addEventListener('change', update);
  rules.addEventListener('click', e => { if(e.target.classList.contains('rdel')){ e.target.closest('.rule').remove(); update(); } });
  $('#addRule').onclick = () => { const v = $('#newRule').value.trim(); if(!v) return; rules.insertAdjacentHTML('beforeend', ruleRow({r:v,k:'decision'})); $('#newRule').value=''; update(); };
  $('#newRule').onkeydown = e => { if(e.key==='Enter') $('#addRule').click(); };
  update();
}

function contentTreeView(){
  return `<div class="callout"><b>Content multiplies a good system. It does not rescue a bad one.</b> Before authoring another enemy, level, weapon or quest, answer these in order.</div><div id="ctree"></div>`;
}
function wireContentTree(){
  const el = $('#ctree'); if(!el) return; const answers = [];
  const render = () => { let html = ''; let i = 0;
    while(true){ const node = CONTENT_TREE[i]; const a = answers[i];
      html += `<div class="tree-q"><b>${i+1}. ${esc(node.q)}</b><div class="opts"><button class="${a==='yes'?'sel':''}" data-i="${i}" data-a="yes">Yes</button><button class="${a==='no'?'sel':''}" data-i="${i}" data-a="no">No</button></div></div>`;
      if(a === undefined) break;
      const nxt = node[a];
      if(typeof nxt === 'string'){ const verdict = nxt.split(':')[0]; html += `<div class="verdict ${verdict.startsWith('ADD')?'BUILD':verdict.startsWith('STOP')?'REMOVE':'SIMPLIFY'}"><h2>${esc(verdict)}</h2><p>${esc(nxt.slice(verdict.length+1).trim())}</p><div class="row"><a class="btn sm" href="#/map/t/content-multiplies">Content multiplies systems</a><a class="btn sm" href="#/map/t/core-loop">The core loop</a></div></div>`; break; }
      i = nxt; }
    el.innerHTML = html + (answers.length ? `<button class="btn ghost sm" id="ctreeReset" style="margin-top:8px">Start over</button>` : '');
    $$('.opts button', el).forEach(b => b.onclick = () => { const i = +b.dataset.i; answers.length = i; answers[i] = b.dataset.a; render(); });
    const r = $('#ctreeReset'); if(r) r.onclick = () => { answers.length = 0; render(); }; };
  render();
}

/* =====================================================================
   BUILD (tools)
   ===================================================================== */
function renderBuild(tool='idea'){
  const head = `${crumbs([['Map','#/map'],['Build']])}<h1>Build</h1><p class="dim">Lightweight canvases that force the questions this guide keeps asking. Everything saves in your browser. Every tool exports Markdown you can paste into a document or a prompt.</p>
    <div class="tool-nav">${TOOLS.map(([id, t, s]) => `<button class="${id===tool?'active':''}" data-href="#/build/${id}">${t}<small>${s}</small></button>`).join('')}</div>`;
  const fn = { idea: toolIdea, dissect: toolDissect, loop: toolLoop, canvas: toolCanvas, ladder: toolLadder, feature: toolFeature, hypothesis: toolHypothesis, delegate: toolDelegate, sysmap: toolSysmap, prompt: toolPrompt, gameai: toolGameAI }[tool] || toolIdea;
  setView(head + `<div class="tool" id="tool"></div>`);
  fn($('#tool'));
}
function field(id, label, hint, val, rows){ return `<div class="field"><label for="${id}">${esc(label)}</label>${rows ? `<textarea id="${id}" rows="${rows}">${esc(val||'')}</textarea>` : `<input id="${id}" value="${esc(val||'')}">`}${hint ? `<div class="hint">${esc(hint)}</div>` : ''}</div>`; }
function bindForm(key, ids, onChange){ const data = store.get(key, {}); ids.forEach(id => { const el = $('#'+id); if(!el) return; if(data[id] !== undefined && !el.value) el.value = data[id]; el.addEventListener('input', () => { data[id] = el.value; store.set(key, data); onChange && onChange(data); }); }); onChange && onChange(data); return data; }
function outputBox(md){ return `<div class="output promptbox"><pre>${esc(md)}</pre><button class="btn sm copybtn" data-action="copy">Copy</button></div>`; }
function toolHead(t, p, key){ return `<div class="toolhead"><div><h2>${esc(t)}</h2><p>${p}</p><div class="small muted">Autosaved in this browser. Export copies Markdown.</div></div><button class="btn ghost sm danger" data-action="clear-tool" data-key="${key}">Clear</button></div>`; }

function toolLoop(el){
  const parts = [['action','Action','What does the player physically do, most often? Is it the fantasy verb?'],['feedback','Feedback','How does the game tell them what happened and why, within ~100 ms?'],['decision','Decision','What choice do they face next, and what is the tradeoff?'],['consequence','Consequence and reward','What changes because of the choice, visibly, now?'],['situation','New situation','How is the next iteration different from this one?']];
  el.innerHTML = toolHead('Game Loop Builder', 'Write the loop from the player’s point of view, one sentence per link. Then answer the weak-link question for each. If you cannot answer it, that link is where to look first.', 'loopTool') +
    `<div class="row" style="margin-bottom:10px"><button class="btn sm" id="loopEx">Load a worked example</button></div><div class="grid c2"><div>${parts.map(([id, l, h]) => field('lb_'+id, l, h, '', 2) + field('lb_'+id+'_ev', 'How would a playtest show this link is strong?', 'Observable behavior, not opinion.', '', 1)).join('')}</div><div id="lb_out"></div></div>`;
  bindForm('loopTool', parts.flatMap(([id]) => ['lb_'+id, 'lb_'+id+'_ev']), d => {
    const weak = parts.filter(([id]) => !(d['lb_'+id]||'').trim() || !(d['lb_'+id+'_ev']||'').trim());
    const md = `# Core loop\n\n${parts.map(([id, l]) => `**${l}:** ${d['lb_'+id]||'(blank)'}\n  - Evidence it is strong: ${d['lb_'+id+'_ev']||'(blank)'}`).join('\n')}\n\n## Diagnosis\n${weak.length ? `Weak or untested links: ${weak.map(w=>w[1]).join(', ')}. Fix these before multiplying the loop with content or progression.` : 'All links described with evidence. Now build the bare loop in grey boxes and test whether players repeat it voluntarily.'}\n\n## Prompt\nAct as a skeptical systems designer. Here is our core loop as the player experiences it:\n${parts.map(([id,l]) => `- ${l}: ${d['lb_'+id]||''}`).join('\n')}\nFor each link, rate its strength using only my description, name the playtest symptom if weak, and propose 3 mechanically distinct fixes for the weakest link with the decision created, intended emotion, failure mode and validating signal. Do not recommend one.`;
    $('#lb_out').innerHTML = `<h4>Live output</h4>${outputBox(md)}${weak.length ? `<div class="callout warn"><b>Look first at:</b> ${weak.map(w => `<a href="#/diagnose/loop/${w[0]}">${w[1]}</a>`).join(', ')}</div>` : '<div class="callout ok">Every link has a claim and an observable. Prototype the bare loop next.</div>'}`;
  });
  $('#loopEx').onclick = () => { const ex = { action:'move to dodge the crowd and sweep up the gems they drop', feedback:'enemies pop on contact with your aura, gems burst, a level-up chime, the screen shakes', decision:'which of three upgrades to take, and whether to risk the chest now', consequence:'your build changes and the same crowd now dies twice as fast', situation:'the next wave is denser and you are stronger than the last one' }; Object.entries(ex).forEach(([k,v]) => { const i = $('#lb_'+k); if(i){ i.value = v; i.dispatchEvent(new Event('input')); } }); };
}

function toolCanvas(el){
  const fields = [['player','Player','A specific person: their last three games, their session, their device.',2],['fantasy','Fantasy','"In this game I get to be someone who…"',1],['verbs','Fantasy verbs','Three verbs the fantasy implies. Are they the loop verbs?',1],['emotions','Target emotions and rhythm','Two or three emotions and the order they alternate in.',1],['moment','Moment-to-moment','What the player does with hands and mind every few seconds.',2],['session','Session goal','What a satisfying session accomplishes.',1],['long','Long-term goal','Why they come back next week.',1],['not','What this game is NOT','Adjacent experiences you refuse. The not-list.',2],['refs','Reference moments','Moments from other games that produce the target feeling, and what exactly produces it.',2]];
  el.innerHTML = toolHead('Core Experience Canvas', 'One page that every discipline aims at. If any field is hard to fill, that is the design work to do first.', 'canvasTool') + `<div class="row" style="margin-bottom:10px"><button class="btn sm" id="cvEx">Load a worked example</button></div><div class="grid c2"><div>${fields.map(([id,l,h,r]) => field('cv_'+id, l, h, '', r)).join('')}</div><div id="cv_out"></div></div>`;
  bindForm('canvasTool', fields.map(f => 'cv_'+f[0]), d => {
    const st = `A ${d.cv_emotions||'[emotions]'} experience where ${d.cv_player||'[player]'} gets to be ${d.cv_fantasy||'[fantasy]'} by ${d.cv_moment||'[moment-to-moment]'}. Not ${d.cv_not||'[what it is not]'}.`;
    const md = `# Core experience\n\n> ${st}\n\n${fields.map(([id,l]) => `**${l}:** ${d['cv_'+id]||'(blank)'}`).join('\n\n')}\n\n## Check\n- Do the fantasy verbs appear in the moment-to-moment activity?\n- Can the target emotions be produced by the mechanics described?\n- Would a playtester use the emotion words unprompted?`;
    $('#cv_out').innerHTML = `<h4>Experience statement (draft)</h4><div class="quotebig sm">${esc(st)}</div>${outputBox(md)}<div class="row"><a class="btn sm" href="#/map/t/core-experience">Read: core experience</a><a class="btn sm" href="#/map/t/fantasy">Read: fantasy</a></div>`;
  });
  $('#cvEx').onclick = () => { const ex = { player:'A commuter with 25 minutes on a laptop who finished Hades and Slay the Spire', fantasy:'In this game I get to be someone who reads a fight and picks the exact tool for it', verbs:'read, choose, commit', emotions:'tension, then clarity, then satisfaction', moment:'scan the board, commit to one of three options, watch it resolve', session:'finish one run and understand why it went the way it did', long:'unlock one new tool that changes how a familiar fight reads', not:'a twitch action game, a grind, a story you cannot steer', refs:'Into the Breach: every consequence is visible before you commit. Slay the Spire: the reward is the decision.' }; Object.entries(ex).forEach(([k,v]) => { const i = $('#cv_'+k); if(i){ i.value = v; i.dispatchEvent(new Event('input')); } }); };
}

function toolLadder(el){
  const rungs = [['feature','Feature idea','The noun someone proposed. "Crafting." "A pet system." "Daily quests."'],['behavior','Desired player behavior','Observable in a playtest. What would they DO differently?'],['experience','Experience','What they feel while doing it.'],['system','System','The situation that produces the behavior: constraints, information, consequences.'],['mechanic','Smallest mechanic','The least rule that implements the system.'],['refeature','Feature, revisited','Now: which feature, if any? Is it the one you started with?']];
  el.innerHTML = toolHead('Behavior Ladder', 'Feature thinking: feature → implementation → justification. Experience thinking: behavior → experience → system → mechanic → feature. Start at the top with the noun you were handed, climb to the behavior, then descend.', 'ladderTool') +
    `<div class="row" style="margin-bottom:10px"><button class="btn sm" id="ladderEx">Load the crafting example</button></div><div class="grid c2"><div class="ladder">${rungs.map(([id,l,h]) => `<div class="rung"><b>${esc(l)}</b><div>${field('ld_'+id, '', h, '', 2)}</div></div>`).join('')}</div><div id="ld_out"></div></div>`;
  const d = bindForm('ladderTool', rungs.map(r => 'ld_'+r[0]), d => {
    const same = (d.ld_feature||'').trim() && (d.ld_refeature||'').trim() && d.ld_feature.trim().toLowerCase() === d.ld_refeature.trim().toLowerCase();
    const md = `# Behavior ladder\n\n${rungs.map(([id,l]) => `**${l}:** ${d['ld_'+id]||'(blank)'}`).join('\n\n')}\n\n## Prompt\nSomeone proposed the feature "${d.ld_feature||'[FEATURE]'}". The behavior we actually want is: ${d.ld_behavior||'[BEHAVIOR]'}. Propose 5 mechanics, smallest first, that would produce this behavior. For each, the rule in one sentence, the decision it creates, what it interacts with, and how we would observe the behavior in a 15-minute test. Then argue that an existing system could be changed to produce it without any new mechanic.`;
    $('#ld_out').innerHTML = `<h4>Live output</h4>${outputBox(md)}${same ? '<div class="callout warn">You landed on the same feature you started with. Fine if the ladder really led there. Suspicious if you wrote the behavior to justify the noun.</div>' : ''}<div class="row"><a class="btn sm" href="#/build/feature">Now run: Should we build this?</a><a class="btn sm" href="#/map/t/feature-vs-experience">Read: experience thinking</a></div>`;
  });
  $('#ladderEx').onclick = () => { const ex = LADDER_EXAMPLE; const map = {feature:ex.feature, behavior:ex.behavior, experience:ex.experience, system:ex.system, mechanic:ex.mechanic, refeature:ex.refeature}; Object.entries(map).forEach(([k,v]) => { const i = $('#ld_'+k); i.value = v; i.dispatchEvent(new Event('input')); }); };
}

function toolFeature(el){
  const saved = store.get('featureTool', {name:'', answers:{}});
  el.innerHTML = toolHead('Should we build this?', 'Nine questions a feature must survive. The verdict is a heuristic that weights evidence, decisions and loop impact. Use it to structure the argument, not to end it.', 'featureTool') +
    field('ft_name', 'Feature under review', '', saved.name) + `<div id="ft_qs"></div><div id="ft_verdict"></div>`;
  const render = () => { const a = saved.answers; let score = 0, done = 0;
    $('#ft_qs').innerHTML = FEATURE_TREE.map((q, qi) => { const sel = a[q.id]; if(sel !== undefined){ score += q.opts[sel][1]; done++; } return `<div class="tree-q"><b>${qi+1}. ${esc(q.q)}</b><div class="opts">${q.opts.map((o, oi) => `<button class="${sel===oi?'sel':''}" data-q="${q.id}" data-o="${oi}">${esc(o[0])}</button>`).join('')}</div></div>`; }).join('');
    $$('#ft_qs .opts button').forEach(b => b.onclick = () => { saved.answers[b.dataset.q] = +b.dataset.o; store.set('featureTool', saved); render(); });
    if(done === FEATURE_TREE.length){ const [v, text] = featureVerdict(score, a); const label = v==='PROTOTYPE' ? 'PROTOTYPE FIRST' : v;
      const md = `# Feature review: ${saved.name||'(unnamed)'}\n\nVerdict: **${label}** (score ${score})\n\n${FEATURE_TREE.map((q,i) => `${i+1}. ${q.q}\n   → ${q.opts[a[q.id]][0]}`).join('\n')}\n\n${text}`;
      $('#ft_verdict').innerHTML = `<div class="verdict ${v}"><h2>${label}</h2><p>${esc(text)}</p><div class="row"><a class="btn sm" href="#/build/hypothesis">Write the hypothesis</a><a class="btn sm" href="#/map/t/scope-control">Read: scope control</a><a class="btn sm" href="#/build/ladder">Climb the behavior ladder</a></div></div>${outputBox(md)}`; }
    else $('#ft_verdict').innerHTML = `<div class="empty">${FEATURE_TREE.length-done} question${FEATURE_TREE.length-done>1?'s':''} left</div>`; };
  $('#ft_name').addEventListener('input', e => { saved.name = e.target.value; store.set('featureTool', saved); });
  render();
}

function toolHypothesis(el){
  const f = [['who','We believe [PLAYER]','Which player, specifically? Not "players": the sketch.'],['will','will [BEHAVIOR]','Observable in a 15-minute session. What they do, not what they feel.'],['because','because [REASON]','The mechanism. Why would the design cause the behavior?'],['signal','We will know it is working when [SIGNAL]','A rate, a count, a repeated behavior. Something you could log.'],['kill','We will kill or change it if [KILL CRITERION]','The result that ends the idea. If you cannot write one, you are hoping, not testing.'],['smallest','Smallest experiment','Paper? Spreadsheet? Grey boxes? How long to build? How many players?'],['alt','Alternative explanation','What else would produce the signal even if the hypothesis is false?']];
  el.innerHTML = toolHead('Playtest Hypothesis Builder', 'Every significant design decision, expressible as a claim about player behavior with a signal and a kill criterion, written before the build.', 'hypTool') + `<div class="row" style="margin-bottom:10px"><button class="btn sm" id="hyEx">Load a worked example</button></div><div class="grid c2"><div>${f.map(([id,l,h]) => field('hy_'+id, l, h, '', 2)).join('')}</div><div id="hy_out"></div></div>`;
  bindForm('hypTool', f.map(x => 'hy_'+x[0]), d => {
    const st = `We believe ${d.hy_who||'[PLAYER]'} will ${d.hy_will||'[BEHAVIOR]'} because ${d.hy_because||'[REASON]'}. We will know this is working when ${d.hy_signal||'[SIGNAL]'}. We will kill or change it if ${d.hy_kill||'[KILL CRITERION]'}.`;
    const md = `# Hypothesis\n\n> ${st}\n\n**Smallest experiment:** ${d.hy_smallest||'(blank)'}\n\n**Alternative explanation to rule out:** ${d.hy_alt||'(blank)'}\n\n## Prototype brief (paste to AI)\nAct as a prototype engineer. Hypothesis: ${st} Build the smallest playable test in [ENGINE]: only the mechanics needed, shapes only, no menus or saves. Expose [VALUES] as live sliders. Log with timestamps every input, decision point with the option chosen, failure with cause, and session start/end. Export CSV. Before coding, list the design decisions the code will embed and wait for my choices.\n\n## Observation protocol (paste to AI)\nDesign a silent observation protocol for this hypothesis with [N] players for [MINUTES]: what to log, a non-leading interview guide ordered from behavior to opinion, a coding scheme, and a results template that separates behavior from self-report.`;
    const warn = []; if(/feel|enjoy|like|fun/i.test(d.hy_will||'')) warn.push('The behavior mentions feeling or fun. Rewrite it as something observable.'); if(!(d.hy_kill||'').trim()) warn.push('No kill criterion yet.');
    $('#hy_out').innerHTML = `<h4>Hypothesis</h4><div class="quotebig sm">${esc(st)}</div>${warn.length ? `<div class="callout warn">${warn.map(esc).join('<br>')}</div>` : ''}${outputBox(md)}<div class="row"><a class="btn sm" href="#/map/t/hypothesis-driven-design">Read: hypothesis-driven design</a><a class="btn sm" href="#/playtest">Playtest question bank</a></div>`;
  });
  $('#hyEx').onclick = () => { const ex = { who:'a commuter who plays 30-minute Slay the Spire runs and quits when a run feels lost by minute five', will:'replan their deck before the first fight instead of taking the first card offered', because:'the reward screen shows the long-run consequence of each card before they commit', signal:'6 of 10 testers read the preview twice or more in their first three runs', kill:'fewer than 3 of 10 ever read the preview, or they read it and still pick at random', smallest:'a paper deck with printed consequence cards, 15 minutes per tester, 8 matched players', alt:'players read the preview because it is novel, not because it changes the card they pick' }; Object.entries(ex).forEach(([k,v]) => { const i = $('#hy_'+k); if(i){ i.value = v; i.dispatchEvent(new Event('input')); } }); };
}

function toolDelegate(el){
  const saved = store.get('delegateTool', {tasks:[{t:'Define the player fantasy', w:'Human'},{t:'Generate five loop variations', w:'AI'},{t:'Decide whether the loop is fun', w:'Player evidence required'},{t:'Analyze playtest logs for choice variance', w:'Human + AI'}]});
  const opts = ['Human','AI','Human + AI','Player evidence required'];
  el.innerHTML = toolHead('AI Delegation Planner', 'For each task in your current cycle, decide the owner before the work starts. Compare with the responsibility matrix. "Player evidence required" means nobody can own it yet.', 'delegateTool') +
    `<div class="grid c2"><div><div id="dl_rows"></div><div class="row" style="margin-top:8px"><input id="dl_new" placeholder="Add a task…" style="flex:1"><button class="btn" id="dl_add">Add</button></div><p class="small muted" style="margin-top:8px">Suggestions come from the <a href="#/ai/matrix">responsibility matrix</a> by keyword and are only a starting point.</p></div><div id="dl_out"></div></div>`;
  const suggest = t => { const l = t.toLowerCase(); const hit = MATRIX.find(m => m[0].toLowerCase().split(' ').filter(w=>w.length>4).some(w => l.includes(w))); if(!hit) return null; const h = hit[1], a = hit[2]; if(h==='PRIMARY' && a!=='PRIMARY') return 'Human'; if(a==='PRIMARY' && h!=='PRIMARY') return 'AI'; return 'Human + AI'; };
  const render = () => { $('#dl_rows').innerHTML = saved.tasks.map((x, i) => { const s = suggest(x.t); return `<div class="plan-row"><div><input value="${esc(x.t)}" data-i="${i}" class="dl_t">${s && s!==x.w ? `<div class="small muted">matrix suggests: ${s}</div>` : ''}</div><select data-i="${i}" class="dl_w">${opts.map(o => `<option ${o===x.w?'selected':''}>${o}</option>`).join('')}</select><button class="btn sm ghost danger dl_del" data-i="${i}">✕</button></div>`; }).join('') || '<div class="empty">No tasks.</div>';
    const counts = Object.fromEntries(opts.map(o => [o, saved.tasks.filter(x => x.w===o).length]));
    const md = `# Delegation plan\n\n${saved.tasks.map(x => `- [${x.w}] ${x.t}`).join('\n')}\n\n## Balance\n${opts.map(o => `- ${o}: ${counts[o]}`).join('\n')}\n\n## Checks\n- Every AI task: what decisions will the work embed, and which human owns them?\n- Every "player evidence required" task: what is the smallest test?\n- Human tasks: are these judgment, or production you could delegate?`;
    $('#dl_out').innerHTML = `<h4>Balance</h4><div class="chips" style="margin-bottom:8px">${opts.map(o => `<span class="chip ${o==='Human'?'human':o==='AI'?'ai':o==='Human + AI'?'shared':'evidence'}">${o}: ${counts[o]}</span>`).join('')}</div>${counts['Player evidence required']===0 && saved.tasks.length>3 ? '<div class="callout warn">Nothing needs player evidence? Either the cycle has no design risk, or judgment calls are being assigned to humans or AI that only players can settle.</div>' : ''}${outputBox(md)}`;
    $$('.dl_t').forEach(i => i.oninput = () => { saved.tasks[+i.dataset.i].t = i.value; store.set('delegateTool', saved); });
    $$('.dl_w').forEach(s => s.onchange = () => { saved.tasks[+s.dataset.i].w = s.value; store.set('delegateTool', saved); render(); });
    $$('.dl_del').forEach(b => b.onclick = () => { saved.tasks.splice(+b.dataset.i, 1); store.set('delegateTool', saved); render(); }); };
  $('#dl_add').onclick = () => { const v = $('#dl_new').value.trim(); if(!v) return; saved.tasks.push({t:v, w: suggest(v) || 'Human + AI'}); $('#dl_new').value=''; store.set('delegateTool', saved); render(); };
  $('#dl_new').onkeydown = e => { if(e.key==='Enter') $('#dl_add').click(); };
  render();
}

function toolSysmap(el){
  const KINDS = ['amplifies','counters','consumes','produces','unlocks','requires'];
  const TYPES = ['resource','mechanic','ability','enemy','environment','progression','player choice'];
  const saved = store.get('sysmapTool', { nodes:[{n:'Stamina',t:'resource'},{n:'Dodge',t:'ability'},{n:'Heavy attack',t:'mechanic'},{n:'Fire',t:'environment'},{n:'Grass',t:'environment'},{n:'Wolf pack',t:'enemy'},{n:'Torch upgrade',t:'progression'}], edges:[['Dodge','consumes','Stamina'],['Heavy attack','consumes','Stamina'],['Fire','counters','Wolf pack'],['Grass','amplifies','Fire'],['Torch upgrade','unlocks','Fire'],['Heavy attack','counters','Wolf pack']] });
  el.innerHTML = toolHead('System Relationship Map', 'Add the things your systems read and write, then the typed relationships between them. Isolated nodes and unconnected pairs are where depth is waiting. Collision questions are generated for every pair that does not yet touch.', 'sysmapTool') +
    `<div class="grid c2"><div>
      <h4>Nodes</h4><div id="sm_nodes" class="chips"></div><div class="row" style="margin-top:8px"><input id="sm_nn" placeholder="Node name" style="flex:1"><select id="sm_nt" style="width:auto">${TYPES.map(t => `<option>${t}</option>`).join('')}</select><button class="btn" id="sm_addn">Add</button></div>
      <h4 style="margin-top:14px">Relationships</h4><div id="sm_edges"></div><div class="row" style="margin-top:8px"><select id="sm_ea" style="width:auto"></select><select id="sm_ek" style="width:auto">${KINDS.map(k => `<option>${k}</option>`).join('')}</select><select id="sm_eb" style="width:auto"></select><button class="btn" id="sm_adde">Link</button></div>
      <div class="legend" style="margin-top:10px">${KINDS.map(k => `<span><i style="background:${({amplifies:'var(--ok)',counters:'var(--bad)',consumes:'var(--warn)',produces:'var(--d-ux)',unlocks:'var(--d-narrative)',requires:'var(--fg3)'})[k]}"></i>${k}</span>`).join('')}</div>
    </div><div><div class="sysmap" id="sm_svg"></div><div id="sm_analysis"></div></div></div>`;
  const render = () => { const N = saved.nodes, E = saved.edges.filter(e => N.some(n=>n.n===e[0]) && N.some(n=>n.n===e[2]));
    $('#sm_nodes').innerHTML = N.map((n, i) => `<span class="chip" title="${n.t}">${esc(n.n)} <span class="muted">${n.t}</span> <button class="btn sm ghost danger" style="padding:0 4px" data-i="${i}">✕</button></span>`).join('') || '<span class="muted">No nodes.</span>';
    $$('#sm_nodes button').forEach(b => b.onclick = () => { const name = N[+b.dataset.i].n; N.splice(+b.dataset.i,1); saved.edges = saved.edges.filter(e => e[0]!==name && e[2]!==name); store.set('sysmapTool', saved); render(); });
    $('#sm_edges').innerHTML = E.map((e, i) => `<div class="row small" style="padding:3px 0;border-bottom:1px dashed var(--line)"><span>${esc(e[0])} <b>${e[1]}</b> ${esc(e[2])}</span><button class="btn sm ghost danger" style="margin-left:auto;padding:0 6px" data-i="${saved.edges.indexOf(e)}">✕</button></div>`).join('') || '<div class="muted small">No relationships.</div>';
    $$('#sm_edges button').forEach(b => b.onclick = () => { saved.edges.splice(+b.dataset.i,1); store.set('sysmapTool', saved); render(); });
    const optsHTML = N.map(n => `<option>${esc(n.n)}</option>`).join(''); $('#sm_ea').innerHTML = optsHTML; $('#sm_eb').innerHTML = optsHTML;
    // svg
    const W=560, H=440, NR=34, cx=W/2, cy=H/2, R=Math.min(W,H)/2-72; const pos = {}; N.forEach((n,i) => { const a = -Math.PI/2 + i*2*Math.PI/Math.max(N.length,1); pos[n.n] = [cx+R*Math.cos(a), cy+R*Math.sin(a)]; });
    const col = {resource:'var(--d-systems)',mechanic:'var(--d-core)',ability:'var(--d-experience)',enemy:'var(--d-product)',environment:'var(--d-level)',progression:'var(--d-production)','player choice':'var(--d-player)'};
    const wrapName = s => { const words = String(s).split(/\s+/).filter(Boolean); const lines = []; let cur = ''; for(const w of words){ if(!cur) cur = w; else if((cur+' '+w).length <= 9) cur += ' '+w; else { lines.push(cur); cur = w; } } if(cur) lines.push(cur); if(lines.length > 3){ lines[2] = lines.slice(2).join(' '); lines.length = 3; } return lines.map(l => l.length > 12 ? l.slice(0,11)+'…' : l); };
    const geo = (e,i) => { const [x1,y1]=pos[e[0]], [x2,y2]=pos[e[2]]; const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy)||1; const side = i%2 ? 1 : -1; const sx=x1+dx/len*(NR+4), sy=y1+dy/len*(NR+4), ex=x2-dx/len*(NR+9), ey=y2-dy/len*(NR+9); const b=20*side; const mx=(sx+ex)/2 - dy/len*b, my=(sy+ey)/2 + dx/len*b; return { sx, sy, ex, ey, mx, my, side }; };
    const labelPos = (g,i) => { const t=[0.5,0.34,0.66][i%3], u=1-t; const px=u*u*g.sx+2*u*t*g.mx+t*t*g.ex, py=u*u*g.sy+2*u*t*g.my+t*t*g.ey; const tx=2*u*(g.mx-g.sx)+2*t*(g.ex-g.mx), ty=2*u*(g.my-g.sy)+2*t*(g.ey-g.my); const tl=Math.hypot(tx,ty)||1; const off=14*g.side; return [px - (ty/tl)*off, py + (tx/tl)*off]; };
    const edgePath = (e,i) => { const g=geo(e,i); return `<path class="se ${e[1]}" d="M${g.sx.toFixed(1)},${g.sy.toFixed(1)} Q${g.mx.toFixed(1)},${g.my.toFixed(1)} ${g.ex.toFixed(1)},${g.ey.toFixed(1)}" marker-end="url(#arr)"/>`; };
    const edgeLabel = (e,i) => { const g=geo(e,i); const p=labelPos(g,i); const lx=p[0], ly=p[1]; const w = e[1].length*5.8+8; return `<g><rect x="${(lx-w/2).toFixed(1)}" y="${(ly-8).toFixed(1)}" width="${w.toFixed(1)}" height="13" rx="2" fill="var(--bg2)" stroke="var(--line)" stroke-width="0.5"/><text class="se-label" x="${lx.toFixed(1)}" y="${(ly+1).toFixed(1)}" text-anchor="middle">${e[1]}</text></g>`; };
    const nodeG = n => { const [x,y]=pos[n.n]; const deg = E.filter(e => e[0]===n.n||e[2]===n.n).length; const lines = wrapName(n.n); const first = lines.length>1 ? -(lines.length-1)*6.5 : 3; return `<g class="sn" transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><circle r="${NR}" fill="${col[n.t]||'var(--accent)'}" opacity="${deg?0.25:0.08}" stroke="${deg?col[n.t]:'var(--bad)'}" stroke-width="${deg?2:1.5}" stroke-dasharray="${deg?'':'4 3'}"/><text text-anchor="middle" font-size="11">${lines.map((l,k)=>`<tspan x="0" dy="${k===0?first:13}">${esc(l)}</tspan>`).join('')}</text><text text-anchor="middle" y="${NR+13}" style="font-size:9px;fill:var(--fg3);font-weight:400">${esc(n.t)}</text></g>`; };
    $('#sm_svg').innerHTML = `<svg viewBox="0 0 ${W} ${H}"><defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--fg3)"/></marker></defs>${E.map(edgePath).join('')}${E.map((e,i)=>edgeLabel(e,i)).join('')}${N.map(nodeG).join('')}</svg>`;
    // analysis
    const isolated = N.filter(n => !E.some(e => e[0]===n.n||e[2]===n.n));
    const pairs = []; for(let i=0;i<N.length;i++) for(let j=i+1;j<N.length;j++){ const a=N[i].n, b=N[j].n; if(!E.some(e => (e[0]===a&&e[2]===b)||(e[0]===b&&e[2]===a))) pairs.push([N[i],N[j]]); }
    const questions = pairs.slice(0,8).map(([a,b]) => `What happens when <b>${esc(a.n)}</b> (${a.t}) meets <b>${esc(b.n)}</b> (${b.t})? Could one ${a.t==='resource'||b.t==='resource'?'consume or produce':'amplify or counter'} the other?`);
    const md = `# System map\n\nNodes: ${N.map(n=>`${n.n} (${n.t})`).join(', ')}\n\nEdges:\n${E.map(e=>`- ${e[0]} ${e[1]} ${e[2]}`).join('\n')}\n\nIsolated: ${isolated.map(n=>n.n).join(', ')||'none'}\n\n## Prompt\nHere are our systems and their relationships: ${E.map(e=>`${e[0]} ${e[1]} ${e[2]}`).join('. ')}. Nodes with no relationships: ${isolated.map(n=>n.n).join(', ')||'none'}. For the ${pairs.length} unconnected pairs, propose one concrete interaction rule each where it would fit the fantasy "[FANTASY]", the emergent strategy it might produce, and the smallest prototype that would show it. Then list the 3 most dangerous existing interactions that could produce exploits.`;
    $('#sm_analysis').innerHTML = `<h4 style="margin-top:12px">Analysis</h4>${isolated.length ? `<div class="callout warn"><b>Isolated:</b> ${isolated.map(n=>esc(n.n)).join(', ')}. A system that touches nothing is a mini-game. Connect it or cut it.</div>` : '<div class="callout ok">No isolated nodes.</div>'}<h4>Collision questions <span class="muted">(${pairs.length} unconnected pairs)</span></h4><ul class="small">${questions.map(q=>`<li>${q}</li>`).join('')||'<li>Every pair is connected. Now ask which existing edges could be exploited.</li>'}</ul>${outputBox(md)}<div class="row"><a class="btn sm" href="#/map/t/systemic-design">Read: systemic design</a><a class="btn sm" href="#/map/t/agency-and-emergence">Read: emergence</a></div>`; };
  $('#sm_addn').onclick = () => { const v = $('#sm_nn').value.trim(); if(!v || saved.nodes.some(n=>n.n===v)) return; saved.nodes.push({n:v, t:$('#sm_nt').value}); $('#sm_nn').value=''; store.set('sysmapTool', saved); render(); };
  $('#sm_nn').onkeydown = e => { if(e.key==='Enter') $('#sm_addn').click(); };
  $('#sm_adde').onclick = () => { const a=$('#sm_ea').value, b=$('#sm_eb').value, k=$('#sm_ek').value; if(!a||!b||a===b) return; saved.edges.push([a,k,b]); store.set('sysmapTool', saved); render(); };
  render();
}

function toolPrompt(el){
  const parts = [['context','CONTEXT','Player, fantasy, core loop, systems. The situation as it is.',3],['intent','INTENT','The experience you want and the decision you need to make.',2],['constraints','CONSTRAINTS','Platform, scope, team, what is off the table.',2],['evidence','EVIDENCE','Playtest results, telemetry, known problems. If none, say so. The task should then be a test design.',2],['role','ROLE','Skeptical systems designer? UX researcher? Devil’s advocate? Pick one stance.',1],['task','TASK','Analyze, generate, compare, build, simulate, code. Specific verbs, specific counts.',2],['output','OUTPUT FORMAT','Table columns, ranked list, code with logging, a hypothesis in standard form.',1],['critique','CRITIQUE','What the AI should attack in its own output, and what it must not do (recommend, decide, add scope).',2]];
  el.innerHTML = toolHead('AI Prompt Generator', 'The formula: CONTEXT + INTENT + CONSTRAINTS + EVIDENCE + ROLE + TASK + OUTPUT FORMAT + CRITIQUE. Fill what you know. Blanks are shown as brackets so you notice what you have not decided yet.', 'promptTool') +
    `<div class="row" style="margin-bottom:10px"><button class="btn sm" id="pgEx">Load a worked example</button><a class="btn sm ghost" href="#/ai/ladder">See the prompt ladder</a></div><div class="formula">${parts.map(p => `<button data-action="focus" data-target="pg_${p[0]}">${p[1]}</button>`).join('<span class="plus">+</span>')}</div><div class="grid c2"><div>${parts.map(([id,l,h,r]) => field('pg_'+id, l, h, '', r)).join('')}</div><div id="pg_out"></div></div>`;
  bindForm('promptTool', parts.map(p => 'pg_'+p[0]), d => {
    const v = k => (d['pg_'+k]||'').trim();
    const txt = `CONTEXT: ${v('context')||'[player, fantasy, loop, systems]'}\n\nINTENT: ${v('intent')||'[the experience we want. The decision I must make]'}\n\nCONSTRAINTS: ${v('constraints')||'[platform, scope, team, off-limits]'}\n\nEVIDENCE: ${v('evidence')||'[playtest results, telemetry, known problems. Or "none yet"]'}\n\nROLE: Act as a skeptical ${v('role')||'[role]'}.\n\nTASK: ${v('task')||'Analyze the design space, identify the assumptions in the current design, generate mechanically distinct alternatives, compare their tradeoffs, and propose the smallest experiments that would distinguish between them.'}\n\nOUTPUT FORMAT: ${v('output')||'[table columns / ranked list / code with logging]'}\n\nCRITIQUE: ${v('critique')||'Finally, attack your own output: what assumptions did you make (mark given, inferred, invented), what could make each alternative fail, what player behavior would prove it wrong, and what did you leave out? Do not recommend a final choice. I will decide.'}`;
    const missing = parts.filter(p => !v(p[0])).map(p => p[1]);
    $('#pg_out').innerHTML = `<h4>Generated prompt</h4>${outputBox(txt)}${missing.length ? `<div class="callout warn"><b>Unfilled:</b> ${missing.join(', ')}. ${missing.includes('EVIDENCE') ? 'No evidence: consider making the task "design the test" instead of "design the feature".' : ''} ${missing.includes('INTENT') ? 'No intent: the AI will pick the decision for you.' : ''}</div>` : '<div class="callout ok">All eight terms filled. After the output, run the verification pass.</div>'}<div class="row"><a class="btn sm" href="#/prompts/verify">Verification pass prompt</a><a class="btn sm" href="#/ai/roles">Choose a role</a><a class="btn sm" href="#/prompts">Prompt library</a></div>`;
  });
  $('#pgEx').onclick = () => { const ex = { context:'Roguelike deckbuilder on PC for the Slay the Spire audience. The loop is choose a card, fight, choose again.', intent:'The player should understand a card by its consequence, not its numbers. I need to decide whether a preview rule is worth building.', constraints:'Two people, five months, PC, no new content pipeline.', evidence:'Early greybox: 4 of 6 testers alt-tabbed to a wiki during card picks.', role:'skeptical systems designer', task:'Generate 5 mechanically distinct preview rules, each with the decision it creates and its failure mode.', output:'A table: rule, decision per minute, failure mode, implementation cost.', critique:'Attack each preview rule for removing surprise, and state what you left out. Do not recommend one.' }; Object.entries(ex).forEach(([k,v]) => { const i = $('#pg_'+k); if(i){ i.value = v; i.dispatchEvent(new Event('input')); } }); };
}

/* ---------- In-game AI Technique Chooser ---------- */
function toolGameAI(el){
  const cfg = store.get('gameaiTool', { shape:'states', author:'designer', debug:'explain', agents:'medium', goal:'' });
  const save = () => store.set('gameaiTool', cfg);
  const OPTS = {
    shape:[['states','One mode at a time (idle, patrol, chase, attack, flee)'],['tasks','Prioritised tasks and shared sub-behaviour'],['factors','Many factors trade off every moment (fight, cover, heal, reposition)'],['plan','A multi-step plan to reach a goal']],
    author:[['designer','A designer retunes behaviour in data after launch'],['engineer','Only an engineer changes behaviour (it lives in code)']],
    debug:[['explain','Every choice must be explainable on the spot'],['opaque','I accept hard-to-explain if it is tunable']],
    agents:[['low','A few agents at once (under 10)'],['medium','A moderate crowd (10 to 40)'],['high','Many (40+) or an open world']]
  };
  const LABEL = { shape:'Decision shape', author:'Who retunes behaviour after launch', debug:'Explainability', agents:'Worst-case simultaneous agents' };
  el.innerHTML = toolHead('In-game AI Technique Chooser','Describe the hardest decision the agent must make, then answer what shape it is and the constraints that actually decide architecture: who retunes it, how much you must explain, and how many agents run at once. The tool names a primary technique, its trade-offs, and the debug view and budget you will need. It is a heuristic, not a verdict.','gameaiTool') +
    `<div class="grid c2"><div>
      ${field('ga_goal','The hardest decision the agent must make','Plain language. Example: "choose between attacking, taking cover, healing an ally, or repositioning, many times a minute."', cfg.goal, 3)}
      ${Object.keys(OPTS).map(k => `<div class="field"><label>${LABEL[k]}</label><select data-k="${k}">${OPTS[k].map(([v,l]) => `<option value="${v}" ${cfg[k]===v?'selected':''}>${esc(l)}</option>`).join('')}</select></div>`).join('')}
    </div><div id="ga_out"></div></div>`;
  const recommend = () => {
    const base = {
      states:{ primary:'Finite state machine (FSM)', why:'Exclusive modes with explicit transitions are the easiest thing to reason about, hand-author and debug.', cost:'Transitions multiply combinatorially and it handles decisions that mix several factors badly.', fallback:'Move to a behaviour tree once shared sub-behaviour or the state count grows.', debug:'Current state, plus the condition that caused the last transition.' },
      tasks:{ primary:'Behaviour tree', why:'Composable priorities and reusable subtrees that a designer can read and extend.', cost:'Priority mistakes cause never-fires branches. Conditions must stay cheap.', fallback:'Add a utility selector when the "priorities" are really weighted trade-offs.', debug:'The active path from root, with the failed condition at each fall-through.' },
      factors:{ primary:'Utility AI (decision layer) + a BT/FSM executor', why:'Scores many competing considerations smoothly and is tunable through weights and response curves.', cost:'Hard to explain a single decision. Poor curves make behaviour feel mushy.', fallback:'A BT with explicit priorities if the factors reduce to a clear order.', debug:'The score of every candidate action and each consideration contribution.' },
      plan:{ primary:'Goal-oriented planner (GOAP / HTN)', why:'Long-horizon, emergent, multi-step behaviour that uses the same world rules as the player.', cost:'Heavy action authoring, a search budget, valid-but-absurd plans, and the hardest debugging of the family.', fallback:'Keep a BT/utility system for the mass of agents and the planner for one showcase archetype.', debug:'The chosen plan, the actions considered, their costs and unmet preconditions.' }
    }[cfg.shape];
    const warn = [];
    if(cfg.author === 'engineer') warn.push('Behaviour in code means designers wait on engineering for every balance pass. Budget a data/tooling layer or accept slow iteration.');
    if(cfg.debug === 'explain' && (cfg.shape === 'factors' || cfg.shape === 'plan')) warn.push('This technique is the hardest of the family to explain. The debug view is not optional, and neither is a fallback for the cheap common case.');
    if(cfg.agents === 'high') warn.push('At this agent count, stagger perception and decisions, time-slice pathfinding, and LOD distant agents. Most agents must run cheap behaviour. Reserve the full system for the few on camera.');
    if(cfg.agents === 'high' && cfg.shape === 'plan') warn.push('A planner for the whole crowd is usually a budget and debug trap. Keep it to a handful of agents.');
    const budget = cfg.agents === 'low' ? 'Cap pathfinding frequency and cache routes. You still have headroom, but do not path every frame.'
      : cfg.agents === 'medium' ? 'Set an explicit per-frame AI budget, stagger perception (~10 Hz) and decisions (~5 Hz), keep motion every frame.'
      : 'Partition and LOD are mandatory: the many run cheap behaviour, the few get the full system. Test at the worst-case count on target hardware.';
    return { ...base, warn, budget };
  };
  const out = () => {
    const r = recommend();
    const goal = (cfg.goal || '[THE HARDEST DECISION]').trim();
    const md = `# In-game AI technique plan\n\n**Hardest decision:** ${goal}\n\n**Recommendation:** ${r.primary}\n\n- Why: ${r.why}\n- Cost / risk: ${r.cost}\n- If it fails: ${r.fallback}\n- Debug view: ${r.debug}\n- Budget: ${r.budget}\n\n## Prompt (paste to AI)\nAct as a gameplay AI engineer. Our agent must make this decision: ${goal}. Team constraints: ${cfg.author === 'designer' ? 'designers retune behaviour in data after launch' : 'behaviour changes require an engineer'}. Explainability need: ${cfg.debug === 'explain' ? 'every choice must be explainable on the spot' : 'opaque is acceptable if it is tunable'}. Worst-case simultaneous agents: ${cfg.agents}. We are leaning toward ${r.primary}. Attack this choice: name the specific failure that would make us regret it, describe the debug view we need, the worst-case test we must run, and the cheapest fallback if we are wrong. Do not write code.`;
    $('#ga_out').innerHTML = `<h4>Recommendation</h4><div class="quotebig sm">${esc(r.primary)}</div>
      <div class="small" style="margin:6px 0"><b>Why.</b> ${esc(r.why)}</div>
      <div class="small"><b>Cost / risk.</b> ${esc(r.cost)}</div>
      <div class="small"><b>If it fails.</b> ${esc(r.fallback)}</div>
      <div class="small"><b>Debug view.</b> ${esc(r.debug)}</div>
      <div class="small"><b>Budget.</b> ${esc(r.budget)}</div>
      ${r.warn.length ? `<div class="callout warn" style="margin-top:8px">${r.warn.map(esc).join('<br>')}</div>` : '<div class="callout ok" style="margin-top:8px">No architectural red flags from these answers.</div>'}
      ${outputBox(md)}<div class="row"><a class="btn sm" href="#/map/d/gameai">Read the In-game AI domain</a><a class="btn sm" href="#/map/t/choosing-ai-technique">Choosing a behaviour technique</a></div>`;
  };
  $$('select[data-k]', el).forEach(s => s.onchange = () => { cfg[s.dataset.k] = s.value; save(); out(); });
  const g = $('#ga_goal'); g.addEventListener('input', () => { cfg.goal = g.value; save(); out(); });
  out();
}

/* ---------- Idea Shaper: read a market, find the gap, shape one idea ---------- */
const GAP_KINDS = [
  ['exit','Exit reason','Players quit because of it. The strongest kind of gap.'],
  ['unmet','Unmet want','Players ask for something no shipped game delivers.'],
  ['tolerated','Tolerated cost','Players accept it as the price of the genre. Fixing it wins no one.'],
  ['taste','Your taste','You dislike it but the audience does not. That is taste, not a want.']
];
function ideaVerdict(s){
  const v = k => (s[k]||'').trim();
  if(s.gap_class === 'taste') return ['NOT A WANT','You dislike this but the audience does not. That is taste, not a gap. Drop it or find something players actually leave over.'];
  if(s.gap_class === 'tolerated') return ['NOT A WEDGE','Players accept this as the price of the genre. Fixing it wins you no one and costs you scope. Look for an exit reason or an unmet want instead.'];
  if(!v('keeps') || !v('complaints')) return ['NOT OBSERVED YET','You have played this market, you have not observed it. Read the reviews, the forums and the patch-note reactions before you shape anything.'];
  if(!/mechanic|rule|system|loop|control|interface|economy|card|board|budget|resource/i.test(v('gap_mech'))) return ['FEATURE, NOT A WEDGE','The gap is not mechanical. Content, theme, price and polish do not reshape the core loop, so they cannot carry a new game. Turn it into a rule or drop it.'];
  if(!v('why_open')) return ['LOUD GAP, WEAK WEDGE','Nothing structural stops an incumbent from closing this gap the moment it proves to work. Name why they cannot, or you are about to build their next patch.'];
  if(!v('copybarrier')) return ['COPIABLE','Your mechanism could be lifted by an incumbent in a patch. A differentiator that can be copied is a feature, not a wedge.'];
  if(!v('constraints')) return ['UNBUILDABLE','No constraints stated. A mechanism only becomes unique when it is shaped by what you can actually build.'];
  return ['REAL WEDGE','Players leave over this or ask for it, incumbents structurally cannot serve it, and one mechanism your constraints allow keeps the promise. Now try to kill it cheaply with the market tests below.'];
}
function toolIdea(el){
  const saved = store.get('ideaTool', { market:'', games:'', proof:'', keeps:'', complaints:'', workaround:'', gap_class:'', gap_mech:'', why_open:'', wish:'', mechanism:'', copybarrier:'', verb:'', player:'', fantasy:'', constraints:'' });
  const save = () => store.set('ideaTool', saved);
  const fields = [
    ['market','The market you already watch','Genre, platform and audience in one line. Pick a space you have spent real time in, not one that looks hot.','2'],
    ['games','Three to five shipped games to observe','Name them. You will watch these, not admire them.','1'],
    ['proof','Where you watch this market','Forums, review sections, streamer chats, patch-note reactions, achievement data. No source means you are guessing.','1'],
    ['keeps','What keeps players here, in their words','Recurring praise. Quote it and note where you saw it.','2'],
    ['complaints','What players leave about, in their words','Recurring complaints. Quote it and note where you saw it.','2'],
    ['workaround','What players do to get around the gap','Mods, spreadsheets, house rules, third-party tools, alt accounts. Work is the strongest evidence of an unserved want.','2'],
    ['gap_mech','Can a rule address it, or is it content, theme or price?','Say which. If the fix is more content, a new theme or a lower price, it is not a wedge.','2'],
    ['why_open','Why has no incumbent closed this gap already?','Their business model forbids it, their scope cannot afford it, their design assumes the opposite, they cannot teach it, or it is hard to build. Name the structural reason.','2'],
    ['wish','The promise, in the player words','Finish this line: you will be able to ______ without ______.','1'],
    ['mechanism','The one mechanic that keeps the promise','A single rule, not a feature list. If it needs three rules, you have not found the idea yet.','2'],
    ['copybarrier','Why an incumbent cannot copy it without breaking what works for them','The moat is a conflict with their constraints, not a head start. If they could ship it in a patch, it is a feature.','2'],
    ['verb','The core verb','The one thing the player does most. It must be the action the mechanism rewards.','1'],
    ['player','The specific player','Session length, device, the games they finish, when they quit. Not gamers.','2'],
    ['fantasy','The fantasy','In this game I get to be someone who...','2'],
    ['constraints','Your team, time, platform and skills','Two people, four months, PC, strong at systems and weak at art. Constraints are what make a mechanism yours.','2']
  ];
  const F = Object.fromEntries(fields.map(f => [f[0], f]));
  const fl = k => field('id_'+k, F[k][1], F[k][2], saved[k], +F[k][3]);
  el.innerHTML = toolHead('Idea Card · Idea Shaper', 'Compression, not the beginning. The <a href="#/lab">Idea Lab</a> builds the reasoning chain; this tool turns it into a communicable card: market, want, promise, one mechanism, moat, constraints. Fill it from the chain or from what you already know.', 'ideaTool') +
  `<div class="grid c2"><div>
    <div class="step-num">Step 1 · Choose the market you already watch</div>
    <p class="small dim">Observation beats survey. You can read a market alone at any scale. You cannot interview it.</p>
    ${fl('market')}${fl('games')}${fl('proof')}
    <div class="step-num">Step 2 · Observe, do not survey</div>
    <p class="small dim">Watch what players do and quote what they say. Praise tells you what the incumbent protects. Complaints tell you where it bleeds.</p>
    ${fl('keeps')}${fl('complaints')}${fl('workaround')}
    <div class="step-num">Step 3 · Classify the gap</div>
    <p class="small dim">Pick the one complaint you will build against, then say what kind it is. Only two kinds are worth a game.</p>
    <div class="dims" id="id_gapkinds">${GAP_KINDS.map(([id,t,d]) => `<button data-k="${id}" class="${saved.gap_class===id?'active':''}" title="${esc(d)}">${t}</button>`).join('')}</div>
    ${fl('gap_mech')}${fl('why_open')}
    <div class="step-num">Step 4 · The promise</div>
    ${fl('wish')}
    <div class="step-num">Step 5 · One mechanic, and the moat</div>
    <p class="small dim">Uniqueness is not being first. It is a conflict between your mechanism and the constraints that keep the incumbents where they are.</p>
    ${fl('mechanism')}${fl('copybarrier')}${fl('verb')}
    <div class="step-num">Step 6 · Who it is for, and what you may build</div>
    ${fl('player')}${fl('fantasy')}${fl('constraints')}
  </div><div id="id_out"></div></div>`;
  const out = () => {
    const v = k => (saved[k]||'').trim();
    const who = v('player') ? v('player').split(/[,.\n]/)[0].trim() : '[PLAYER]';
    const promise = v('wish') || '[A PROMISE PLAYERS CANNOT GET TODAY]';
    const pos = `For ${who} in ${v('market')||'[MARKET]'}, this is the game where you ${v('verb')||'[CORE VERB]'}. One rule carries it: ${v('mechanism')||'[MECHANISM]'}. The incumbents (${v('games')||'[COMPARABLES]'}) cannot copy it. The barrier: ${v('copybarrier')||'[STRUCTURAL REASON]'}.`;
    const hyp = `We believe ${who} will choose this over ${v('games')||'[COMPARABLES]'} because it lets them ${promise}. We will know it is working when players of ${v('games')||'[COMPARABLES]'} describe the ${v('verb')||'[CORE VERB]'} in their own words without a prompt, and ask to keep playing after one session. We will kill it if they compare it to ${v('games')||'[COMPARABLES]'} and cannot say what it does differently.`;
    const warn = [];
    if(!v('keeps') || !v('complaints')) warn.push('No observation yet. Read the reviews and the forums before you trust this shape.');
    if(!v('workaround')) warn.push('No workaround found. If the want were strong, some players would already be hacking around it.');
    if(!saved.gap_class) warn.push('Classify the gap in step 3. Exit reason and unmet want are wedges. Tolerated cost and taste are not.');
    if(v('mechanism') && v('mechanism').split(',').length > 2) warn.push('That mechanism reads like several rules. Cut it to the one that carries the promise.');
    if(v('wish') && /fun|epic|immersive|engaging|addictive|unique/i.test(v('wish'))) warn.push('The promise uses a word any game could claim. Say what the player does, not how it feels.');
    if(v('fantasy') && v('verb') && !v('fantasy').toLowerCase().includes(v('verb').toLowerCase().split(' ')[0])) warn.push('The core verb does not appear in the fantasy. One of them is wrong.');
    const res = ideaVerdict(saved);
    const verdict = res[0], text = res[1];
    const cls = verdict==='REAL WEDGE' ? 'BUILD' : verdict==='FEATURE, NOT A WEDGE' ? 'SIMPLIFY' : verdict==='UNBUILDABLE' ? 'REMOVE' : 'DEFER';
    const gapLabel = (GAP_KINDS.find(g => g[0] === saved.gap_class) || [,'(not classified)'])[1];
    const md = `# Idea shape: ${v('fantasy')||'(untitled)'}\n\n**Market:** ${v('market')||'(blank)'}\n**Observed games:** ${v('games')||'(blank)'}\n**Where observed:** ${v('proof')||'(blank)'}\n**What keeps players here:** ${v('keeps')||'(blank)'}\n**What players leave about:** ${v('complaints')||'(blank)'}\n**Workaround:** ${v('workaround')||'(blank)'}\n**Gap class:** ${gapLabel}\n**Mechanical or not:** ${v('gap_mech')||'(blank)'}\n**Why still open:** ${v('why_open')||'(blank)'}\n**Promise:** ${promise}\n**Mechanism:** ${v('mechanism')||'(blank)'}\n**Copy barrier:** ${v('copybarrier')||'(blank)'}\n**Core verb:** ${v('verb')||'(blank)'}\n**Player:** ${v('player')||'(blank)'}\n**Fantasy:** ${v('fantasy')||'(blank)'}\n**Constraints:** ${v('constraints')||'(blank)'}\n\n## Positioning\n${pos}\n\n## Hypothesis\n${hyp}\n\n## Market tests (observation, not surveys)\n1. Workaround audit. Search the incumbent communities for mods, spreadsheets, house rules and third-party tools that already do the thing. Count the distinct tools and the interest around them. No workarounds means the want is weak.\n2. Comment mining. Watch three sessions of the incumbents on stream or video and timestamp every unprompted complaint or wish that matches your gap. Frequency and intensity are the evidence, not a poll.\n3. One-mechanism greybox. Build only the mechanism, in one day. Put it in front of three players of the incumbent and watch. Do they describe the promised verb unprompted, and ask to keep going? Behaviour, not satisfaction.\n4. Store-page side by side. Put your one image next to the incumbent store page. A fan should state your mechanism without being told. If they say it is like X but Y, the wedge is invisible.\n\n## Prompts\n### Complaint mining\nHere are review excerpts and forum posts for ${v('games')||'[GAMES]'} written by players like ${who}: [PASTE]. Cluster complaints and praise by underlying want, count frequency, and for each want say whether my mechanism (${v('mechanism')||'[MECHANISM]'}) answers it mechanically, cosmetically, or not at all. Do not propose game ideas.\n\n### Structural moat\nMy mechanism is: ${v('mechanism')||'[MECHANISM]'}. The incumbents are: ${v('games')||'[GAMES]'} with business models and design assumptions [DESCRIBE]. Argue, as each incumbent, why you would not ship this mechanism and what you would have to give up to do it. Then name the one move that would neutralise it.\n\n### Steelman the market\nYou are a player who loves ${v('games')||'[GAMES]'}, not a designer. My promise is: ${promise}. Give the strongest reasons you would ignore it, keep playing what you have, and never hear about it. Then name the single thing that would change your mind.\n\n### Five mechanisms\nPromise: ${promise}. Constraints: ${v('constraints')||'[CONSTRAINTS]'}. Propose 5 mechanically distinct ways to keep that promise, smallest first. For each: the rule in one sentence, the decision it creates every minute, the emotion intended, the incumbent it threatens, and the likely failure mode. Do not recommend one.\n\n### Genericness audit\nHere is my positioning: ${pos}. List every word or phrase that could describe any game in this market, then rewrite the sentence using only concrete, checkable claims.`;
    $('#id_out').innerHTML = `<div class="verdict ${cls}"><h2>${verdict}</h2><p>${esc(text)}</p></div><h4>Positioning</h4><div class="quotebig sm">${esc(pos)}</div>${warn.length ? `<div class="callout warn">${warn.map(esc).join('<br>')}</div>` : '<div class="callout ok">The chain is complete. Run the market tests before you write production code.</div>'}<h4>Hypothesis</h4><p class="small">${esc(hyp)}</p>${outputBox(md)}<div class="row"><a class="btn sm primary" href="#/build/dissect">Check it against the comparables</a><a class="btn sm" href="#/build/canvas">Core Experience Canvas</a><a class="btn sm" href="#/build/hypothesis">Hypothesis Builder</a><a class="btn sm" href="#/map/t/finding-an-idea">Read: start from a want</a></div>`;
  };
  fields.forEach(f => { const e = $('#id_'+f[0]); e.addEventListener('input', () => { saved[f[0]] = e.value; save(); out(); }); });
  $$('#id_gapkinds button').forEach(b => b.onclick = () => { saved.gap_class = b.dataset.k; save(); $$('#id_gapkinds button').forEach(x => x.classList.toggle('active', x===b)); out(); });
  out();
}

/* =====================================================================
   AI WORKFLOW
   ===================================================================== */
function renderAI(sub='loop', arg){
  const tabs = [['loop','The 12-step loop'],['ladder','Prompt ladder'],['philosophy','Bottleneck shift'],['roles','AI roles'],['matrix','Responsibility matrix'],['framework','Prompting framework'],['failures','When AI makes it worse']];
  const head = `${crumbs([['Map','#/map'],['AI Workflow']])}<h1>AI Workflow</h1><p class="dim">How to delegate design work to AI without delegating design judgment.</p><div class="tabs">${tabs.map(([id,t]) => `<button class="${id===sub?'active':''}" data-href="#/ai/${id}">${t}</button>`).join('')}</div>`;
  let body = '';
  if(sub==='loop') body = aiLoopView(arg);
  else if(sub==='ladder') body = aiLadderView();
  else if(sub==='philosophy') body = aiPhilosophyView();
  else if(sub==='roles') body = aiRolesView(arg);
  else if(sub==='matrix') body = aiMatrixView();
  else if(sub==='framework') body = aiFrameworkView();
  else if(sub==='failures') body = aiFailuresView();
  setView(head + body);
  if(sub==='roles') $$('.role').forEach(r => r.onclick = e => { if(e.target.closest('a,button,pre')) return; r.classList.toggle('open'); });
  if(sub==='matrix') wireMatrix();
  if(sub==='framework') wireFramework();
}
ACTIONS['loop-here'] = el => { const n = +el.dataset.n; store.set('loopHere', n); renderAI('loop', String(n)); };
function aiLoopView(arg){
  const here = store.get('loopHere', null);
  const n = +(arg || here || 1); const s = LOOP_STEPS[n-1] || LOOP_STEPS[0];
  return `<div class="callout"><b>The visual backbone of this guide.</b> Player evidence sits between exploration and commitment. Mark where your project is. It persists. Skipping steps 5 to 8 is how AI-era projects fail.</div>
    <div class="stepper">${LOOP_STEPS.map(x => `<button class="${x.n===s.n?'active':''} ${x.n===here?'here':''}" data-href="#/ai/loop/${x.n}"><b>${x.n}</b>${esc(x.t)}</button>`).join('')}</div>
    <div class="card"><div class="row between"><h2 style="margin:0">${s.n}. ${esc(s.t)} <span class="muted" style="font-weight:500;font-size:1rem">${esc(s.goal)}</span></h2><button class="btn sm ${here===s.n?'primary':''}" data-action="loop-here" data-n="${s.n}">${here===s.n?'✓ We are here':'Mark: we are here'}</button></div>
      <div class="think-grid" style="margin-top:12px"><div class="box" style="border-color:color-mix(in srgb,var(--d-player) 50%,transparent)"><h4 style="color:var(--d-player)">Human does</h4><p>${esc(s.human)}</p></div><div class="box" style="border-color:color-mix(in srgb,var(--d-ai) 50%,transparent)"><h4 style="color:var(--d-ai)">AI does</h4><p>${esc(s.ai)}</p></div><div class="box good"><h4>Output</h4><p>${esc(s.out)}</p><h4>Exit criterion</h4><p>${esc(s.exit)}</p></div><div class="box bad"><h4>Common failure</h4><p>${esc(s.fail)}</p><h4 style="color:var(--fg2)">Go deeper</h4><ul>${s.top.map(t => `<li>${topicLink(t)}</li>`).join('')}</ul></div></div>
      <div class="row" style="margin-top:10px">${s.n>1?`<button class="btn" data-href="#/ai/loop/${s.n-1}">← ${esc(LOOP_STEPS[s.n-2].t)}</button>`:''}${s.n<12?`<button class="btn" data-href="#/ai/loop/${s.n+1}">${esc(LOOP_STEPS[s.n].t)} →</button>`:`<button class="btn" data-href="#/ai/loop/1">Repeat → Define</button>`}</div></div>
    <div class="section-head"><h2>Versus the workflow that fails</h2></div>
    <div class="grid c2"><div class="card" style="border-color:color-mix(in srgb,var(--ok) 50%,transparent)"><h4 style="color:var(--ok)">Hypothesis-driven</h4>${chainHTML([['Hypothesis','#/map/t/hypothesis-driven-design'],['Prototype','#/map/t/prototyping'],['Test','#/map/t/playtesting'],['Evidence','#/map/t/iteration-and-evidence'],['Decision','#/ai/loop/9']])}<p class="small dim">Scope follows validated value: Idea → Prototype → Evidence → Commit.</p></div>
    <div class="card" style="border-color:color-mix(in srgb,var(--bad) 50%,transparent)"><h4 style="color:var(--bad)">Hope-driven</h4>${chainHTML([['Idea','#/map/t/scope-control'],['Huge implementation','#/ai/failures'],['Polish','#/map/t/polish-when'],['Hope','#/map/t/ai-failure-modes']])}<p class="small dim">Idea → Production commitment. AI makes this cheaper and therefore more tempting.</p></div></div>`;
}
function aiPhilosophyView(){
  const t = TOPICS['bottleneck-shift'];
  return `<div class="card"><h2>AI changes the bottleneck</h2>
    <div class="workflow-compare"><div><h4>Traditional</h4>${chainHTML([['Human thinks','#/map/t/bottleneck-shift','human'],['Human designs','#/map/t/bottleneck-shift','human'],['Human documents','#/map/t/bottleneck-shift','human'],['Human implements','#/map/t/bottleneck-shift','human']])}</div>
    <div><h4>AI era</h4>${chainHTML([['Human frames','#/map/t/prompting-framework','human'],['AI expands, searches, analyzes','#/map/t/ai-roles','ai'],['Human judges','#/map/t/verifying-ai-output','human'],['AI prototypes, implements','#/map/t/ai-for-implementation','ai'],['Players provide evidence','#/map/t/playtesting','evidence'],['Human decides','#/map/t/iteration-and-evidence','human'],['AI iterates','#/ai/loop','ai']])}</div></div>
    <div class="bottleneck" style="margin-top:14px"><div class="col"><h4>No longer the bottleneck</h4><ul><li class="strike">writing</li><li class="strike">coding</li><li class="strike">generating content</li><li class="strike">producing variations</li><li class="strike">documentation</li></ul></div><div class="mid">→</div><div class="col"><h4>The bottleneck now</h4><ul><li>taste</li><li>judgment</li><li>problem framing</li><li>prioritization</li><li>understanding players</li><li>recognizing fun</li><li>separating signal from noise</li><li>making tradeoffs</li><li>knowing what NOT to build</li></ul></div></div>
    <div class="quotebig">AI can generate possibilities extremely cheaply. Humans must decide what is worth making.</div>
    <div class="quotebig" style="border-left-color:var(--bad)">A polished bad idea is still a bad game.</div>
    <div class="grid c2" style="margin-top:12px"><div class="box"><h4>Questions to ask yourself weekly</h4>${list(t.think.q)}</div><div class="box"><h4>Traps</h4>${list(t.think.traps)}</div></div>
    <div class="row" style="margin-top:12px"><a class="btn" href="#/map/t/bottleneck-shift">Full topic: the bottleneck shift</a><a class="btn" href="#/map/t/scope-control">Scope control</a></div>
    <div class="callout" style="margin-top:14px"><b>Field note (2024 to 2026):</b> industry surveys and GDC talks in this period report designers using generative AI mostly for research, brainstorming, code assistance and prototyping rather than shipped assets, with widespread concern about generic output and volume over quality. The practitioners who report it working keep the first prototype, use AI to widen options rather than choose them, and validate with playtests. That is the pattern this guide encodes.</div></div>`;
}
function aiRolesView(arg){
  return `<div class="callout">Ask for a role, not for "ideas". Click a card for when to use it, when to keep it away, a starter prompt and what to verify. None of the nine roles is "decider".</div>
    <div class="grid c3">${ROLES.map(r => `<div class="role ${arg===r.id?'open':''}" id="role-${r.id}"><h3 style="color:var(--d-ai)">${esc(r.t)}</h3><p class="dim" style="margin:0">${esc(r.job)}</p><div class="more"><h4 style="color:var(--ok)">Use when</h4>${list(r.use)}<h4 style="color:var(--bad)">Do not use when</h4>${list(r.avoid)}${promptBox('Starter prompt', r.starter)}<h4>Verify</h4>${list(r.verify)}</div><div class="small muted" style="margin-top:6px">click to ${arg===r.id?'collapse':'expand'}</div></div>`).join('')}</div>
    <div class="section-head"><h2>A good sequence</h2></div>${chainHTML([['Brainstormer','#/ai/roles/brainstormer','ai'],['Critic','#/ai/roles/critic','ai'],['Systems designer','#/ai/roles/systems','ai'],['Human decides what to test','#/map/t/hypothesis-driven-design','human'],['Prototype engineer','#/ai/roles/engineer','ai'],['Players','#/map/t/playtesting','evidence'],['Playtest analyst','#/ai/roles/analyst','ai'],['Human interprets and decides','#/ai/loop/9','human'],["Devil's advocate before commit",'#/ai/roles/devil','ai'],['Content generator, after validation','#/ai/roles/content','ai']])}`;
}
function aiMatrixView(){
  return `<div class="callout">Decide who owns each task before the work starts. <span class="chip human">PRIMARY human</span> <span class="chip ai">PRIMARY AI</span> <span class="chip shared">Shared</span> Click a row for the reason. Filter to see the pattern: judgment stays human, volume, simulation and production go to AI.</div>
    <div class="pill-tabs" id="mxFilter"><button class="active" data-f="">All</button><button data-f="human">Human primary</button><button data-f="ai">AI primary</button><button data-f="shared">Shared</button></div>
    <div class="tablewrap"><table class="matrix"><thead><tr><th>Task</th><th>Human</th><th>AI</th></tr></thead><tbody id="mxBody">${MATRIX.map((m, i) => { const cls = m[1]==='PRIMARY'&&m[2]!=='PRIMARY' ? 'human' : m[2]==='PRIMARY'&&m[1]!=='PRIMARY' ? 'ai' : 'shared'; return `<tr data-f="${cls}" data-i="${i}" style="cursor:pointer"><td>${esc(m[0])}</td><td class="who"><span class="chip ${m[1]==='PRIMARY'?'human':''}">${m[1]}</span></td><td class="who"><span class="chip ${m[2]==='PRIMARY'?'ai':''}">${m[2]}</span></td></tr><tr class="why hidden" data-for="${i}"><td colspan="3" class="small dim" style="background:var(--bg2)">${esc(m[3])}</td></tr>`; }).join('')}</tbody></table></div>
    <div class="row" style="margin-top:12px"><a class="btn" href="#/build/delegate">Plan your own tasks in the Delegation Planner</a><a class="btn" href="#/map/t/responsibility-matrix">Read the topic</a></div>`;
}
function wireMatrix(){
  $$('#mxBody tr[data-i]').forEach(r => r.onclick = () => { const w = $(`#mxBody tr.why[data-for="${r.dataset.i}"]`); w.classList.toggle('hidden'); });
  $$('#mxFilter button').forEach(b => b.onclick = () => { $$('#mxFilter button').forEach(x => x.classList.remove('active')); b.classList.add('active'); const f = b.dataset.f; $$('#mxBody tr[data-i]').forEach(r => { const show = !f || r.dataset.f === f; r.classList.toggle('hidden', !show); const w = $(`#mxBody tr.why[data-for="${r.dataset.i}"]`); if(!show) w.classList.add('hidden'); }); });
}
function aiFrameworkView(){
  const terms = FORMULA_TERMS;
  return `<div class="callout">The best prompt is rarely "give me ideas". It is: <i>here is the player, fantasy, current loop, constraints, evidence and known problems, analyze the design space, identify assumptions, generate alternatives, compare tradeoffs, and propose the smallest experiments that distinguish between them.</i></div>
    <div class="formula" id="fmla">${terms.map((t,i) => `<button data-i="${i}" class="${i===0?'active':''}">${t[0]}</button>`).join('<span class="plus">+</span>')}</div>
    <div class="card" id="fmlaInfo"><h3>${terms[0][0]}</h3><p>${esc(terms[0][1])}</p></div>
    <div class="grid c2" style="margin-top:14px"><div class="card" style="border-color:color-mix(in srgb,var(--bad) 50%,transparent)"><h4 style="color:var(--bad)">Weak</h4><pre>Design a fun combat system.</pre><p class="small dim">No player, no fantasy, no constraint, no evidence, no role, no output shape. You will get the genre average with confidence.</p></div>
    <div class="card" style="border-color:color-mix(in srgb,var(--ok) 50%,transparent)"><h4 style="color:var(--ok)">Strong</h4>${promptBox('', `Act as a skeptical systems designer. Here is the intended player fantasy, target skill level, desired decision density, and current prototype: [CONTEXT]. Generate 5 mechanically distinct solutions. For each, identify the player decision created, intended emotion, likely failure mode, implementation complexity, and what evidence would validate or invalidate the hypothesis. Do not recommend a solution yet.`)}${promptBox('Then', `Now challenge these concepts. Assume the game feels repetitive after 20 minutes. Identify which underlying decisions are too shallow and propose the smallest experiments that could test your diagnosis.`)}</div></div>
    <div class="row" style="margin-top:12px"><a class="btn primary" href="#/build/prompt">Open the Prompt Generator</a><a class="btn" href="#/prompts">Prompt library</a><a class="btn" href="#/map/t/prompting-framework">Read the topic</a></div>`;
}
const FORMULA_TERMS = [['CONTEXT','Player, fantasy, core loop, systems. The world as it is. Without it you get the genre average.'],['INTENT','The experience you want and the decision you need to make. Without it the AI picks the decision.'],['CONSTRAINTS','Platform, scope, team, off-limits. Without them you get the biggest plausible answer.'],['EVIDENCE','Playtest results, telemetry, known problems. Without it the task should be "design the test", not "design the feature".'],['ROLE','The stance: skeptical systems designer, UX researcher, devil’s advocate. Without it you get mild everything.'],['TASK','Analyze, generate N, compare, simulate, build with logging. Specific verbs and counts.'],['OUTPUT FORMAT','A table, a ranked list, code with an exposed tuning panel, a hypothesis in standard form. How you will consume it.'],['CRITIQUE','What the AI must attack in its own output and what it must not do: recommend, decide, add scope.']];
function wireFramework(){ $$('#fmla button').forEach(b => b.onclick = () => { $$('#fmla button').forEach(x => x.classList.remove('active')); b.classList.add('active'); const t = FORMULA_TERMS[+b.dataset.i]; $('#fmlaInfo').innerHTML = `<h3>${esc(t[0])}</h3><p>${esc(t[1])}</p>`; }); }
const LADDER = [
  { n:1, stage:'Observe', role:'Observer', you:'Collect what players actually do: reviews, forums, streams, patch-note reactions, mods, spreadsheets, third-party tools.', ai:'Structure the raw artefacts, cluster recurring behaviour, and mark each claim fact, inference or speculation.', caution:'AI must never invent evidence. If it cannot cite the artefact, it is speculation.', prompt:`Here are raw player artefacts (reviews, forum posts, clips, tool descriptions): [PASTE]. Extract the recurring behaviours. For each, give the artefact it came from and label it fact, inference or speculation. Do not propose game ideas.` },
  { n:2, stage:'Signal to tension', role:'Opportunity analyst', you:'Decide which signal is interesting. Complaints are not automatically opportunities.', ai:'Find the want underneath the behaviour: what players are trying to do, what they tolerate, what they work around, where the contradiction is.', caution:'Do not let AI turn every complaint into a feature.', prompt:`Signals: [SIGNALS]. For each, state the underlying want in the players' own words, the contradiction or friction around it, and the workaround players already use. Mark what is observed and what is inferred. Do not propose solutions.` },
  { n:3, stage:'Tension to opportunity', role:'Opportunity analyst', you:'Decide whether the tension is worth building for.', ai:'State the opportunity in one sentence that names a player, a desire we can serve, and what they do instead today.', caution:'An opportunity is a claim, not a fact. Keep the evidence level attached.', prompt:`Tensions: [TENSIONS]. Write one opportunity sentence per tension: for [PLAYER], there may be an opportunity to [DO SOMETHING] that today they get from [WORKAROUND] instead. For each, say what evidence exists and what is only inferred.` },
  { n:4, stage:'Opportunity to design question', role:'Question generator', you:'Choose the question that changes what the player does.', ai:'Turn opportunities into can-we questions. Questions only.', caution:'If AI starts answering, stop it. A question is the product of this stage.', prompt:`Opportunity: [OPPORTUNITY]. Write 5 design questions in the form Can we ... ? Each should change the player's behaviour rather than add a feature. Rank them by how much they change what the player does. Do not answer any of them.` },
  { n:5, stage:'Design question to design space', role:'Design-space explorer', you:'Recognise which axes matter and which are noise.', ai:'Name the dimensions along which the problem can be solved, the options on each, and the extreme corners of the space.', caution:'Do not converge here. Expansion is the point.', prompt:`Design question: [QUESTION]. Identify the 3 axes that matter most for solving it, 3 to 5 options on each, and describe the extreme corner of each combination. Do not choose a direction.` },
  { n:6, stage:'Design space to mechanisms', role:'Mechanism designer', you:'Look for rules that produce genuinely different behaviour, not reskins.', ai:'Generate mechanically distinct rules. For each: the rule, the decision it creates every minute, the intended emotion, the systemic interactions, the failure mode, the implementation cost.', caution:'Mechanisms, not pitches. Do not ask which is best yet.', prompt:`Design question: [QUESTION]. Design space: [SPACE]. Propose 6 mechanically distinct mechanisms, smallest first. For each: the rule in one sentence, the decision it creates, the intended emotion, the systems it touches, the failure mode, and the cheapest way to fake it for a test. Do not recommend one.` },
  { n:7, stage:'Mechanisms to critique', role:"Devil's advocate", you:'Weigh the critique. Decide what it kills.', ai:'Attack each mechanism: who would not care, what breaks after 30 minutes and after 10 hours, why it might be a reskin, what an incumbent could copy, and the one assumption carrying it.', caution:'A critique is input, not a verdict. AI does not decide.', prompt:`Mechanisms: [MECHANISMS]. As a hostile reviewer, for each mechanism give: why a player would not care, the behaviour after 30 minutes and after 10 hours, whether the difference is mechanical or cosmetic, which incumbent could copy it, and the single assumption it depends on.` },
  { n:8, stage:'Critique to hypothesis', role:'Hypothesis framer', you:'Commit to a claim you are willing to kill.', ai:'Help write it in standard form: we believe [player] will [behaviour] because [reason]. Signal. Kill criterion.', caution:'If the kill criterion is missing, it is hope, not a hypothesis.', prompt:`Chosen direction: [DIRECTION]. Write it as: we believe [PLAYER] will [OBSERVABLE BEHAVIOUR] because [MECHANISM]. We will know it works when [SIGNAL]. We will kill it if [CRITERION]. Then name the alternative explanation that would produce the same signal.` },
  { n:9, stage:'Hypothesis to prototype', role:'Prototype designer', you:'Accept the scope. The prototype proves one thing.', ai:'Design the smallest test: only the mechanics needed, exposed tuning values, full logging, exclusions.', caution:'If the prototype answers more than the hypothesis, it is too big.', prompt:`Hypothesis: [HYPOTHESIS]. Build the smallest playable test in [ENGINE] that could disprove it. Only the mechanics needed, grey boxes, no menus or saves, expose [VALUES] as live sliders, log every input, decision, failure and session boundary with timestamps. List the design decisions the code will embed before writing it.` },
  { n:10, stage:'Player evidence', role:'Playtest analyst', you:'Watch the players. Interpret the context only you have.', ai:'Find patterns in notes, transcripts and logs. Separate behaviour from self-report. Surface contradictions.', caution:'Simulation is not evidence. Only real players count.', prompt:`Here are observer notes, transcripts and logs: [DATA]. Cluster behaviour, mark patterns present in 3 or more players versus outliers, align notes to telemetry by time, and separate what players did from what they said. State what the evidence does and does not support. Do not interpret causes or recommend changes.` },
  { n:11, stage:'Evidence to decision', role:'You, the human', you:'Kill, iterate, prototype again, or commit. Nobody else can make this call.', ai:'Summarize the evidence and the open questions. Nothing more.', caution:'If AI is choosing whether to continue, the process has failed.', prompt:`Here is the evidence: [EVIDENCE]. Summarize what it shows, what it cannot show, and the open questions. Present the options kill, iterate, prototype again, or commit, with the tradeoffs of each. Recommend nothing.` },
  { n:12, stage:'Decision to Idea Card', role:'Concept editor', you:'Own the final words.', ai:'Compress the chain into the Idea Card: player, promise, mechanism, core verb, fantasy, constraints, hypothesis, biggest risk, cheapest test, evidence level.', caution:'Compression, not creation. If the card contains a claim the chain does not, delete it.', prompt:`Here is the full reasoning chain: [CHAIN]. Compress it into an Idea Card with: player, desire, tension, opportunity, promise, core verb, mechanism, differentiation, fantasy, constraints, hypothesis, biggest risk, cheapest test, and the evidence level of each claim. Do not add anything that is not in the chain.` }
];
function aiLadderView(){
  return `<div class="callout"><b>Do not ask AI for the game.</b> Ask it for one rung at a time, in order. Each rung names the partner, what you decide, what AI does, a prompt, and the failure to avoid.</div>
    <div class="ladderflow">${LADDER.map(s => `<div class="rung-card"><div class="rung-num">${s.n}</div><div class="rung-body"><div class="rung-stage">${esc(s.stage)}</div><div class="rung-grid"><div class="box"><h4>You decide</h4><p>${esc(s.you)}</p></div><div class="box"><h4>AI partner · ${esc(s.role)}</h4><p>${esc(s.ai)}</p></div></div>${promptBox('Prompt for this rung', s.prompt)}<div class="callout warn" style="margin-top:6px"><b>Failure to avoid:</b> ${esc(s.caution)}</div></div></div>`).join('<div class="rung-arrow">↓</div>')}</div>
    <div class="row" style="margin-top:12px"><a class="btn sm primary" href="#/lab">Open the Idea Lab</a><a class="btn sm" href="#/ai/roles">AI roles</a><a class="btn sm" href="#/ai/matrix">Responsibility matrix</a></div>`;
}
function aiFailuresView(){
  return `<h2>When AI makes your game worse</h2><p class="dim">Fourteen systematic failures. Each follows from AI strengths (fluency, volume, plausibility) meeting human weaknesses (deference, impatience, fear of deciding). Symptom → why → how to detect → how to correct.</p>
    <div class="grid c2">${FAILURES.map(f => `<div class="fail"><h3>${esc(f.t)}</h3><dl class="kv"><dt>Symptom</dt><dd>${esc(f.sym)}</dd><dt>Why it happens</dt><dd>${esc(f.why)}</dd><dt>How to detect</dt><dd>${esc(f.detect)}</dd><dt>How to correct</dt><dd><b>${esc(f.fix)}</b></dd></dl></div>`).join('')}</div>
    <div class="row" style="margin-top:14px"><a class="btn" href="#/checklists/ai-verify">AI output verification checklist</a><a class="btn" href="#/checklists/scope-sanity">Monthly scope sanity</a><a class="btn" href="#/map/t/ai-failure-modes">Read the topic</a></div>`;
}

/* =====================================================================
   PLAYTEST
   ===================================================================== */
function renderPlaytest(){
  const bank = [
    ['Understanding',['Do players understand the goal without explanation?','Do they understand why they succeeded?','Do they understand why they failed?','Can they explain a rule correctly after one use?']],
    ['Decisions',['Do they notice the meaningful choice?','Do they hesitate before choosing?','Do different players make different choices?','Can they state the tradeoff?']],
    ['Engagement',['Do they voluntarily repeat the interaction?','Do they experiment?','Do they develop strategies?','Do they create their own goals?','Do they talk about the mechanic afterward?']],
    ['Failure points',['Where do they become bored (pace up, attention drifts)?','Where do they become confused (pause, map, questions)?','Where do they lose agency ("it did not matter")?','Where do sessions end, and what preceded it?']],
    ['Return',['What will they do next time? (specific answer predicts return)','Do they return the next day unprompted?','What do they remember a week later?']]
  ];
  setView(`${crumbs([['Map','#/map'],['Playtest']])}<h1>Playtest: the truth machine</h1><p class="dim">Observe players instead of defending your design. Turn hypotheses into experiments, and keep AI in analysis while humans interpret and decide.</p>
    <div class="quotebig">What players say is useful. What players do is evidence. Neither should be interpreted without context.</div>
    <div class="grid c3">
      <div class="card"><h3>Say</h3><p class="small">Interviews, surveys, think-aloud. Reveals intent and mental models. Biased by politeness, memory and what they think you want. Ask open questions, after play, from behavior to opinion.</p></div>
      <div class="card"><h3>Do</h3><p class="small">Silent observation, logs, replays, retention. Reveals what actually happened. Silent about why. Log hesitation, repetition, drift, experimentation, quits, with timestamps.</p></div>
      <div class="card"><h3>Context</h3><p class="small">What was intended, what changed since last time, who the tester is, what the room felt like. Only the human in the room has it. It is why AI analyzes and humans interpret.</p></div>
    </div>
    <div class="section-head"><h2>Question bank</h2><span class="muted">Not "is it fun?" These.</span></div>
    <div class="grid c2">${bank.map(([g, qs]) => `<div class="card"><h4>${g}</h4>${list(qs)}</div>`).join('')}</div>
    <div class="section-head"><h2>Methods and what each is for</h2></div>
    <div class="tablewrap"><table><thead><tr><th>Method</th><th>Reveals</th><th>Blind to</th><th>AI can</th></tr></thead><tbody>
      <tr><td>Silent observation</td><td>Behavior, hesitation, confusion, replay</td><td>Intent, feeling</td><td>Code timestamped notes into clusters</td></tr>
      <tr><td>Think-aloud</td><td>Mental model, intent</td><td>Distorts behavior and pace</td><td>Transcribe. Extract model statements</td></tr>
      <tr><td>Task-based usability</td><td>Whether specific things can be done</td><td>Engagement</td><td>Design tasks. Compute success and time</td></tr>
      <tr><td>Interview</td><td>Memory, meaning, what stuck</td><td>Accuracy. Politeness bias</td><td>Draft non-leading guides. Code answers</td></tr>
      <tr><td>Telemetry</td><td>Choices, retries, session ends at scale</td><td>Why</td><td>Correlate with observed events. Find distributions</td></tr>
      <tr><td>Replay analysis</td><td>Strategies, unintended approaches</td><td>What the player was thinking</td><td>Classify approaches. Count variety</td></tr>
      <tr><td>Retention</td><td>Whether they came back</td><td>Everything else</td><td>Segment by first-session behavior</td></tr></tbody></table></div>
    <div class="section-head"><h2>Session flow</h2></div>
    ${chainHTML([['Write the question and hypothesis','#/build/hypothesis','human'],['Recruit matched players','#/map/t/who-is-the-player','human'],['Silent observation, timestamped notes','#/map/t/playtesting','evidence'],['Tasks if needed','#/map/t/ux-as-design','evidence'],['Open interview, behavior first','#/map/t/playtesting','evidence'],['AI codes and clusters','#/map/t/ai-for-playtest-analysis','ai'],['Human adds context, interprets','#/ai/loop/8','human'],['Decide one or two changes','#/ai/loop/9','human'],['Log it','#/map/t/iteration-and-evidence','human']])}
    <div class="grid c2" style="margin-top:12px"><div class="card"><h3>Hypothesis first</h3><p class="dim small">Write it before the session so the observation cannot be rationalized afterwards.</p><a class="btn primary" href="#/build/hypothesis">Open the Hypothesis Builder</a></div><div class="card"><h3>Prepare the session</h3><p class="dim small">Question, players, protocol, and what happens after.</p><a class="btn" href="#/checklists/playtest-prep">Open the preparation checklist</a> <a class="btn" href="#/checklists/onboarding-audit">Silent onboarding audit</a></div></div>
    <div class="section-head"><h2>Prompts</h2></div>
    ${promptBox('Observation protocol', PROMPT_TEMPLATES.find(p=>p.id==='playtest-analysis') ? `We are testing the hypothesis "[HYPOTHESIS]" with [N] players matching [PLAYER MODEL] for [MINUTES]. Design a silent observation protocol: what to log with timestamps (hesitations, repeats, drift, experiments, quits, speech), a task list if needed, and an interview guide of open, non-leading questions ordered from behavior to opinion. Include a coding scheme and a results template that separates behavior from self-report.` : '')}
    ${promptBox('Analysis without recommendations', PROMPT_TEMPLATES.find(p=>p.id==='playtest-analysis').p.replace(/\{\{(\w+)\}\}/g, '[$1]'))}
    <div class="callout warn"><b>The rule:</b> ask AI to analyze in one pass and, only afterwards and separately, to hypothesize causes. Never let the analysis output become the change list. Read ${topicLink('ai-for-playtest-analysis')} and ${topicLink('playtesting')}.</div>`);
}

/* =====================================================================
   PROMPTS
   ===================================================================== */
function renderPrompts(id){
  const cats = [...new Set(PROMPT_TEMPLATES.map(p => p.cat))];
  const sel = PROMPT_TEMPLATES.find(p => p.id === id);
  setView(`${crumbs([['Map','#/map'],['Prompt library']])}<h1>Prompt library</h1><p class="dim">Reusable patterns built on the formula. Fill the variables. The prompt updates live. Every template ends with a stop or critique instruction so the AI does not decide for you.</p>
    <div class="split"><aside class="side sticky"><button class="btn side-toggle" data-action="toggle-parent"><span>☰ Browse templates</span><span class="car">▸</span></button>${cats.map(c => `<div class="dom open"><button style="cursor:default"><span class="dot" style="background:var(--d-ai)"></span>${c}</button><div class="topics">${PROMPT_TEMPLATES.filter(p => p.cat===c).map(p => `<button class="${p.id===id?'active':''}" data-href="#/prompts/${p.id}">${esc(p.t)}</button>`).join('')}</div></div>`).join('')}</aside>
    <div id="promptMain">${sel ? '' : `<div class="grid auto">${PROMPT_TEMPLATES.map(p => `<a class="card clickable lnk blk" href="#/prompts/${p.id}"><span class="chip ai">${p.cat}</span><h3 style="margin-top:6px">${esc(p.t)}</h3><p class="small dim" style="margin:0">${esc(p.p.slice(0,140))}…</p></a>`).join('')}</div><div class="callout" style="margin-top:14px">Want to compose your own? The <a href="#/build/prompt">Prompt Generator</a> walks the eight terms. Topic pages each carry prompts specific to that concept.</div>`}</div></div>`);
  if(sel){
    const saved = store.get('promptVars.'+sel.id, {});
    const main = $('#promptMain');
    main.innerHTML = `<span class="chip ai">${sel.cat}</span><h2 style="margin-top:6px">${esc(sel.t)}</h2>${sel.vars.length ? `<div class="grid c2">${sel.vars.map(v => `<div class="field"><label>${v.replace(/_/g,' ')}</label><textarea rows="2" data-v="${v}">${esc(saved[v]||'')}</textarea></div>`).join('')}</div>` : '<p class="small muted">No variables: paste this as a follow-up to any AI output.</p>'}<h4>Prompt</h4><div id="pOut"></div>
      <div class="callout"><b>After the output:</b> run the <a href="#/prompts/verify">verification pass</a>. Then write the <a href="#/build/hypothesis">hypothesis</a> for what you will test.</div>`;
    const update = () => { $$('textarea[data-v]', main).forEach(t => saved[t.dataset.v] = t.value); store.set('promptVars.'+sel.id, saved); const txt = sel.p.replace(/\{\{(\w+)\}\}/g, (m, v) => (saved[v]||'').trim() || `[${v.replace(/_/g,' ')}]`); $('#pOut').innerHTML = outputBox(txt); };
    main.addEventListener('input', update); update();
  }
}

/* =====================================================================
   CHECKLISTS
   ===================================================================== */
function renderChecklists(id){
  const sel = CHECKLISTS.find(c => c.id === id) || CHECKLISTS[0];
  const state = store.get('check.'+sel.id, {});
  setView(`${crumbs([['Map','#/map'],['Checklists']])}<h1>Checklists</h1><p class="dim">Practical reviews. Checkbox state is saved per checklist. Reset when you start a new feature or session.</p>
    <div class="pill-tabs">${CHECKLISTS.map(c => `<button class="${c.id===sel.id?'active':''}" data-href="#/checklists/${c.id}">${esc(c.t)}</button>`).join('')}</div>
    <div class="card"><div class="row between"><div><h2>${esc(sel.t)}</h2><p class="dim" style="margin:0">${esc(sel.desc)}</p></div><div class="row"><span class="chip" id="ckCount"></span><button class="btn sm" id="ckExport">Export Markdown</button><button class="btn sm ghost danger" id="ckReset">Reset</button></div></div>
      <div class="grid c2" style="margin-top:12px">${sel.groups.map(([g, items], gi) => `<div class="checklist"><h4>${esc(g)}</h4>${items.map((it, ii) => { const k = gi+'.'+ii; return `<label class="${state[k]?'done':''}"><input type="checkbox" data-k="${k}" ${state[k]?'checked':''}><span>${esc(it)}</span></label>`; }).join('')}</div>`).join('')}</div></div>`);
  const total = sel.groups.reduce((n,g) => n+g[1].length, 0);
  const count = () => { const n = Object.values(state).filter(Boolean).length; $('#ckCount').textContent = `${n} / ${total}`; $('#ckCount').className = 'chip ' + (n===total ? 'ok' : ''); };
  $$('input[data-k]').forEach(i => i.onchange = () => { state[i.dataset.k] = i.checked; i.closest('label').classList.toggle('done', i.checked); store.set('check.'+sel.id, state); count(); });
  $('#ckReset').onclick = () => { Object.keys(state).forEach(k => delete state[k]); store.set('check.'+sel.id, state); renderChecklists(sel.id); };
  $('#ckExport').onclick = () => copyText(`# ${sel.t}\n\n${sel.groups.map(([g, items], gi) => `## ${g}\n${items.map((it, ii) => `- [${state[gi+'.'+ii]?'x':' '}] ${it}`).join('\n')}`).join('\n\n')}`);
  count();
}

/* =====================================================================
   SOURCES AND LINEAGE
   ===================================================================== */
const SOURCES = [
  ['MDA framework and the eight kinds of fun','Hunicke, LeBlanc and Zubek (2004): mechanics are what designers write, dynamics what happens at runtime, aesthetics what players feel. Designers build bottom-up. Players experience top-down. LeBlanc’s eight aesthetics (sensation, fantasy, narrative, challenge, fellowship, discovery, expression, submission) are an explicitly non-exhaustive vocabulary.','Used in: Fun dimensions, Mechanics and rules.','heuristic'],
  ['Four keys to fun','Nicole Lazzaro (2004), from observing players’ emotional expressions: hard fun (mastery, fiero), easy fun (curiosity), people fun (social), serious fun (meaning). Her heuristic: successful games offer at least three.','Used in: Fun dimensions.','heuristic'],
  ['Self-Determination Theory in games','Ryan, Rigby and Przybylski (2006) and Rigby and Ryan, Glued to Games (2011): enjoyment and continued play track satisfaction of competence, autonomy and relatedness. One of the few research-backed models here.','Used in: Player motivation, Return and quit, Social experience.','research'],
  ['Flow and player-steered difficulty','Csikszentmihalyi’s flow (challenge matching skill). Jenova Chen’s thesis Flow in Games (2006) argues for letting players steer difficulty through play rather than hidden adjustment. Flow-channel literalism is contested. Some games live outside the band on purpose.','Used in: Difficulty, Fun dimensions.','contested'],
  ['Interesting decisions','Sid Meier (GDC 2012): a game is a series of interesting decisions, interesting ones involve tradeoffs, depend on the situation, and express the player. Decisions need visible consequences and enough information to reason.','Used in: Meaningful decisions, Risk and reward, Core loop diagnostic.','heuristic'],
  ['Depth versus complexity. Elegance','Popularized by Extra Credits (2013) and widely used since: complexity is what the player must learn, depth is the meaningful decisions that result, elegance is depth per rule. Soren Johnson’s Water Finds a Crack (2011): players exploit every hole. No agreed metric. Use as a lens.','Used in: Depth vs complexity, Rule audit tool.','heuristic'],
  ['A Theory of Fun','Raph Koster (2004): fun is the pleasure of learning and mastering patterns, boredom arrives when the pattern is exhausted, trivial, or too noisy to perceive.','Used in: Fun dimensions, Skill and mastery, Repetitive smell.','heuristic'],
  ['The Art of Game Design','Jesse Schell (2008): the elemental tetrad (mechanics, story, aesthetics, technology) and the lenses, question-sets that force one viewpoint at a time. This guide’s eight-part topic structure is in that spirit.','Used in: the topic structure, Narrative and Presentation domains.','heuristic'],
  ['Game Feel and the Art of Screenshake','Steve Swink (2008): real-time control of virtual objects, in a simulated space, emphasized by polish, response within about 100 ms. Jan Willem Nijman (Vlambeer, 2013): a live demo of how much perceived quality comes from layered feedback.','Used in: Game feel and juice, Feedback, Floaty combat smell.','heuristic'],
  ['Kishōtenketsu level structure','Koichi Hayashida (Nintendo, 2012 interview on Super Mario 3D Land): introduce, develop, twist, conclude, each level a short lesson about one idea. Celeste (Maddy Thorson, GDC 2017): one movement idea per room, failure kept cheap.','Used in: Level structure (teach, test, twist, combine, master, rest).','heuristic'],
  ['Ludonarrative dissonance','Clint Hocking (2007), on a game whose mechanics rewarded self-interest while its story preached altruism. Sometimes a deliberate expressive tool, not always a defect.','Used in: Ludonarrative alignment.','heuristic'],
  ['Ten thousand bowls of oatmeal','Kate Compton (2016): a generator can make endless mathematically unique outputs that all read as the same thing. Perceptual uniqueness is the real bar. Perceptual differentiation the minimum.','Used in: Procedural and AI-generated content, Content spam failure mode.','heuristic'],
  ['Game UX: usability and engage-ability','Celia Hodent, The Gamer’s Brain (2017): usability (signs and feedback, clarity, form follows function, consistency, minimum workload, error recovery, flexibility) versus engage-ability. Don Norman’s affordances and signifiers. Nielsen’s heuristics adapted for games.','Used in: the whole UX domain.','research'],
  ['Playtesting as empiricism','Mike Ambinder (Valve, GDC 2009): designs are hypotheses, playtests are experiments, observe behavior and weigh self-report against it. Richard Lemarchand, A Playful Production Process (2021): concentric development, vertical slice, regular structured playtesting. Dan Cook: skill atoms, loops and arcs.','Used in: Playtesting, Hypothesis-driven design, Vertical slice, Content multiplies.','practice'],
  ['Designing Games','Tynan Sylvester (2013): games are systems for generating experiences, target emotion, design for emergence, and maximize emotional power while minimizing burden on players and team.','Used in: Core experience, Systemic design, Agency and emergence.','heuristic'],
  ['Studio maxims, read carefully','Jaime Griesemer’s “30 seconds of fun” (Bungie) meant nested loops of roughly 3 seconds, 30 seconds and 3 minutes, not one repeated loop. “Easy to learn, hard to master” is Bushnell’s Law (Atari), adopted by Blizzard. A slogan, not a method.','Used in: Core loop, Goals at three horizons.','contested'],
  ['Hypothesis-driven design','The “We believe X will Y because Z. We will know when W” template comes from Lean Startup (Eric Ries) and Lean UX (Gothelf and Seiden), not from a game-specific source. Its game analogue is Ambinder’s and Lemarchand’s practice of testing with a written question.','Used in: Hypothesis Builder, the 12-step loop.','practice'],
  ['Generative AI in design workflows (2024 to 2026)','Industry surveys in this period report rising developer concern about generative AI, with usage concentrated in research, brainstorming, code assistance and prototyping rather than shipped assets. Talks and articles (for example Rez Graham, GDC 2025. Raph Koster on depth and AI understanding) warn of derivative output and volume over quality. The recurring success pattern: designers own the first prototype, use AI to widen options rather than choose them, and validate with playtests.','Used in: the whole AI Collaboration domain, When AI makes your game worse.','practice'],
  ['Postmortems that generalize','Into the Breach (Subset Games): cut by whether it serves the core decision loop. Spelunky (Derek Yu): generation earned its place after authored room templates made runs readable. Slay the Spire (Mega Crit): telemetry guided balance, designers kept the call. Hades (Supergiant): early access forced regular playable builds and tuning against real players.','Used in: Scope control, Procedural content, Builds and loadouts, Iteration on evidence.','practice'],
  ['Player taxonomies','Bartle’s types (1996) came from text MUDs and were never validated as exclusive segments. Later work (Nick Yee, Quantic Foundry) treats motivations as continuous scales. This guide uses taxonomies as vocabulary, never as segmentation.','Used in: Who is the player, Player motivation.','contested'],
  ['Behaviour trees and reactive architectures','Popularised in AAA by Damian Isla’s GDC talks on Halo 2’s behaviour tree, and by the constraints of the period: FSMs that grew unreadable, and the need for re-usable, designer-tunable sub-behaviour. Behaviour trees are now the default reactive layer in engines (Unity, Unreal).','Used in: Choosing a behaviour technique, In-game AI domain.','practice'],
  ['Utility AI and goal-oriented planners','Dave Mark’s GDC work on utility/infinite-axis utility, and Jeff Orkin’s F.E.A.R. talk (GDC 2006) on a goal-oriented action planner, are the standard practitioner references for scoring competing actions and for long-horizon, emergent plans. Both are heuristics tuned per game, not general algorithms.','Used in: Choosing a behaviour technique, Adaptive AI and directors.','practice'],
  ['Game AI as experience, not optimality','A long-standing practitioner position (Mick West on Killer Instinct’s readable AI, Richard Evans on The Sims, the “AI is a lie” thread in Game AI Pro) holds that in-game AI is judged by the experience it creates, not by how smart it is. Faked, scripted and telegraphed behaviour often reads better than simulation.','Used in: What in-game AI is for, Readable and fair AI, Scripted vs simulated.','practice'],
  ['Learning-based game AI','Yannakakis and Togelius, Artificial Intelligence and Games (2018), plus headline results (DeepMind AlphaStar, OpenAI Five): learned policies reach superhuman play, but shipping constraints (determinism, debuggability, cost, unfair-but-strong play) keep most production wins in testing, balance, animation and control rather than shipped opponents.','Used in: Learning-based and ML-driven AI.','contested']
];
function renderSources(){
  const tag = k => ({research:'<span class="chip ok">research-backed</span>', heuristic:'<span class="chip">practitioner heuristic</span>', contested:'<span class="chip warn">contested</span>', practice:'<span class="chip shared">practice</span>'})[k];
  setView(`${crumbs([['Map','#/map'],['Sources and lineage']])}<h1>Sources and lineage</h1><p class="dim" style="max-width:820px">This guide synthesizes established game-design thinking rather than inventing a framework. Nothing here is a law. Most of it is practitioner heuristics that have survived across genres. A few items rest on research. Several are contested and marked as such. Verify against your players.</p>
    <div class="grid c2">${SOURCES.map(s => `<div class="card"><div class="row between"><h3 style="margin:0">${esc(s[0])}</h3>${tag(s[3])}</div><p style="margin:8px 0 6px">${esc(s[1])}</p><div class="small muted">${esc(s[2])}</div></div>`).join('')}</div>
    <div class="callout" style="margin-top:14px"><b>How the synthesis was done.</b> Frameworks were checked for attribution and date. Where a maxim is routinely misquoted, the guide states the original intent. Where a template has no game-specific origin (the hypothesis form), the guide says so. Where ideas conflict (definitions of fun, flow literalism, player types), they are presented as lenses and the reader is told to test against players.</div>`);
}

/* =====================================================================
   EXPERIENCE: anonymised case studies
   ===================================================================== */
function caseCard(c){ return `<a class="card clickable tint lnk blk" style="--dc:var(--accent2)" href="#/experience/${c.id}"><h3>${esc(c.t)}</h3>${c.sub ? `<div class="casesub">${esc(c.sub)}</div>` : ''}<div class="small muted">${esc(c.role)} · ${esc(c.period)}</div><p class="dim small" style="margin:6px 0 0">${esc(c.context.slice(0, 180))}${c.context.length > 180 ? '…' : ''}</p><div class="chips" style="margin-top:8px">${c.stack.slice(0, 5).map(s => `<span class="chip">${esc(s)}</span>`).join('')}</div></a>`; }
// The head is separate from the body because the project page puts a tab
// strip between them: the codename, its description and the chips stay put
// while Overview, Workflows and Interview swap underneath.
function caseHead(c){
  return `${crumbs([['Map','#/map'],['Projects','#/experience'],[c.t]])}
    <div class="casehead"><h1>${esc(c.t)}</h1>${c.sub ? `<p class="casesub">${esc(c.sub)}</p>` : ''}<div class="chips">${[c.role, c.period].map(x => `<span class="chip">${esc(x)}</span>`).join('')}${c.stack.map(s => `<span class="chip api">${esc(s)}</span>`).join('')}</div></div>`;
}
function casePage(c){
  return `<p class="dim" style="max-width:820px">${esc(c.context)}</p>
    ${systemsSection(c)}
    <div class="section-head"><h2>Architecture</h2><span class="muted">what the pieces were</span></div>
    <ul class="archlist">${c.arch.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
    <div class="section-head"><h2>Decisions</h2><span class="muted">each one cost something</span></div>
    <div class="grid c2">${c.decisions.map(x => `<div class="card casedec"><b>${esc(x.d)}</b><div class="small" style="margin-top:6px"><b>Why.</b> ${esc(x.why)}</div><div class="small muted" style="margin-top:4px"><b>Trade-off.</b> ${esc(x.trade)}</div></div>`).join('')}</div>
    <div class="section-head"><h2>What went wrong</h2><span class="muted">and what it taught</span></div>
    <div class="stack">${c.lessons.map(x => `<div class="callout warn"><b>${esc(x.what)}</b><div class="small" style="margin-top:4px">${esc(x.lesson)}</div></div>`).join('')}</div>
    <div class="section-head"><h2>Interview stories</h2><span class="muted">situation, task, action, result</span></div>
    <div class="ivlist">${c.stories.map(s => `<details class="ivq" style="--dc:var(--accent2)"><summary>${esc(s.s)}</summary><div class="body"><h4>Task</h4><p>${esc(s.t)}</p><h4>Action</h4><p>${esc(s.a)}</p><h4>Result</h4><p>${esc(s.r)}</p></div></details>`).join('')}</div>
    <div class="section-head"><h2>Related concepts</h2><span class="muted">what this case is evidence for</span></div>
    <div class="related">${c.rel.map(([rid, why]) => { const rt = TOPICS[rid]; if(!rt) return ''; return `<a class="rel lnk blk" style="border-left:3px solid ${DOM[rt.d].color}" href="#/map/t/${rid}"><b>${esc(rt.t)}</b><div class="why">${esc(why)}</div></a>`; }).join('')}</div>`;
}
/* ---------- a case study as a browsable project ---------- */
const kindColor = k => (KIND_COLOR[k] || 'var(--accent2)');
const kindChip = k => `<span class="chip kind" style="--dc:${kindColor(k)}">${esc(KIND_LABEL[k] || k)}</span>`;
const partCount = s => `${(s.parts || []).length} part${(s.parts || []).length === 1 ? '' : 's'}`;
function findPart(c, pid){ for(const s of (c.systems || [])){ const p = (s.parts || []).find(x => x.id === pid); if(p) return { s, p }; } return null; }
function sysCard(c, s){
  return `<a class="card clickable tint lnk blk" style="--dc:${kindColor(s.kind)}" href="#/experience/${c.id}/${s.id}">
    <div class="chips" style="margin-bottom:7px">${kindChip(s.kind)}<span class="chip">${partCount(s)}</span></div>
    <b>${esc(s.t)}</b><div class="small dim" style="margin-top:5px">${esc(s.sum)}</div></a>`;
}
function systemsSection(c){
  const systems = c.systems || [];
  if(!systems.length) return '';
  return `<div class="section-head"><h2>Systems</h2><span class="muted">the pieces, and what is inside each</span></div>
    <p class="small muted" style="margin:0 0 10px">The map in the centre is this project. Click a system to open its parts, click a part to read it and to see which topics of the guide it demonstrates.</p>
    <div class="grid auto">${systems.map(s => sysCard(c, s)).join('')}</div>`;
}
function relCards(rel){
  return `<div class="related">${(rel || []).map(([rid, why]) => { const rt = TOPICS[rid]; if(!rt) return ''; return `<a class="rel lnk blk" style="border-left:3px solid ${DOM[rt.d].color}" href="#/map/t/${rid}"><b>${esc(rt.t)}</b><div class="why">${esc(why)}</div></a>`; }).join('')}</div>`;
}
function systemPage(c, s){
  const dc = kindColor(s.kind), parts = s.parts || [];
  return `${crumbs([['Projects','#/experience'],[c.t,'#/experience/'+c.id],[s.t]])}
    <div class="casehead" style="border-left-color:${dc}">
      <div class="chips" style="margin-bottom:7px">${kindChip(s.kind)}<span class="chip">${partCount(s)}</span></div>
      <h1>${esc(s.t)}</h1>
      <div class="chips">${(s.stack || []).map(x => `<span class="chip api">${esc(x)}</span>`).join('')}</div></div>
    <p class="dim" style="max-width:820px">${esc(s.sum)}</p>
    <div class="section-head"><h2>Parts</h2><span class="muted">what each one is, and the decision behind it</span></div>
    <div class="grid auto">${parts.map(p => `<a class="card clickable tint lnk blk" style="--dc:${dc}" href="#/experience/${c.id}/${s.id}/${p.id}">
      <b>${esc(p.t)}</b><div class="small dim" style="margin-top:6px">${esc(p.what)}</div>
      <div class="small" style="margin-top:6px"><b>Why.</b> ${esc(p.why)}</div></a>`).join('')}</div>
    ${(s.iv && s.iv.length) ? `<div class="section-head"><h2>Likely questions</h2><span class="muted">what an interviewer asks once this system is on the table</span></div>
    ${ivCards(s.iv, dc, `iv:${c.id}/${s.id}`)}` : ''}
    <div class="topic-nav"><button class="btn ghost" data-href="#/experience/${c.id}">← ${esc(c.t)}</button></div>`;
}
function partPage(c, s, p){
  const dc = kindColor(s.kind), parts = s.parts || [], i = parts.indexOf(p);
  const prev = i > 0 ? parts[i-1] : null, next = i < parts.length - 1 ? parts[i+1] : null;
  const linked = (p.links || []).map(([pid, why]) => { const o = findPart(c, pid); return o ? `<div class="small partlink"><a class="chip lnk" href="#/experience/${c.id}/${o.s.id}/${o.p.id}">${esc(o.p.t)}</a> <span class="why">${esc(why)}</span></div>` : ''; }).join('');
  return `${crumbs([['Projects','#/experience'],[c.t,'#/experience/'+c.id],[s.t,`#/experience/${c.id}/${s.id}`],[p.t]])}
    <div class="casehead" style="border-left-color:${dc}">
      <div class="chips" style="margin-bottom:7px">${kindChip(s.kind)}<span class="chip">${esc(s.t)}</span><span class="chip">${i+1} of ${parts.length}</span></div>
      <h1>${esc(p.t)}</h1></div>
    <p class="dim" style="max-width:820px">${esc(p.what)}</p>
    <div class="section-head"><h2>How it actually worked</h2></div>
    <ol class="howlist" style="--dc:${dc}">${(p.how || []).map(h => `<li>${esc(h)}</li>`).join('')}</ol>
    <div class="callout"><b>Why it was done this way.</b> ${esc(p.why)}</div>
    <div class="callout warn"><b>What it cost.</b> ${esc(p.trade)}</div>
    ${p.story ? `<div class="section-head"><h2>The story</h2><span class="muted">a draft to rewrite in your own words</span></div><div class="card"><p style="margin:0">${esc(p.story)}</p></div>` : ''}
    <div class="section-head"><h2>Topics this demonstrates</h2><span class="muted">read the idea, then come back</span></div>
    ${relCards(p.rel)}
    ${linked ? `<div class="section-head"><h2>Depends on</h2><span class="muted">other parts of this project</span></div><div class="stack">${linked}</div>` : ''}
    <div class="topic-nav">${prev ? `<button class="btn" data-href="#/experience/${c.id}/${s.id}/${prev.id}">← ${esc(prev.t)}</button>` : `<button class="btn ghost" data-href="#/experience/${c.id}/${s.id}">← ${esc(s.t)}</button>`}<button class="btn ghost" data-href="#/experience/${c.id}">Project</button>${next ? `<button class="btn" data-href="#/experience/${c.id}/${s.id}/${next.id}">${esc(next.t)} →</button>` : `<button class="btn" data-href="#/experience">All projects →</button>`}</div>`;
}
/* ---------- project tabs: overview / workflows / interview ---------- */
// Same component as the topic tab strip, down to the class and the keyboard
// handler, so there is one tab behaviour in the app rather than two.
const PROJ_TABS = [['overview','Overview'],['workflows','Workflows'],['interview','Interview']];
function projTabsFor(c){ return PROJ_TABS.filter(([k]) => k === 'overview' || (k === 'workflows' ? !!(c.flows && c.flows.length) : !!c.iv)); }
let projTab = 'overview';
function setProjTab(c, tab){
  const avail = projTabsFor(c).map(x => x[0]);
  const want = tab || store.get('projTab', 'overview');
  projTab = avail.includes(want) ? want : 'overview';
  if(tab) store.set('projTab', projTab);
}
// Overview is omitted from the URL, so its hash equals the bare project hash
// and route() would re-resolve the tab from the store. Record the choice first.
ACTIONS['proj-tab'] = el => { const tab = el.dataset.tab; store.set('projTab', tab); go('#/experience/' + el.dataset.case + (tab === 'overview' ? '' : '/' + tab)); };
function flowColorOf(c){ return sys => { const s = (c.systems || []).find(x => x.id === sys); return s ? kindColor(s.kind) : 'var(--accent2)'; }; }
function workflowsBody(c){
  const flows = c.flows || [];
  if(!flows.length) return '<div class="empty">No workflows written for this project yet.</div>';
  return `<p class="small muted" style="margin:0 0 10px">How the project behaves end to end rather than what it is made of. Each chart is the same shape as the map: cards for the steps, curves for what follows what, colour for the system the step belongs to.</p>
    <div class="grid auto">${flows.map(f => `<a class="card clickable tint lnk blk" style="--dc:var(--accent2)" href="#/experience/${c.id}/flow/${f.id}">
      <b>${esc(f.t)}</b><div class="small dim" style="margin-top:6px">${esc(f.sum)}</div>
      <div class="chips" style="margin-top:8px"><span class="chip">${(f.steps || []).length} steps</span></div></a>`).join('')}</div>`;
}
function projectPage(c){
  const tabs = projTabsFor(c);
  const tab = tabs.some(x => x[0] === projTab) ? projTab : 'overview';
  const strip = tabs.length > 1 ? `<div class="tabs topictabs" role="tablist" aria-label="Project views">${tabs.map(([k, label]) => `<button role="tab" aria-selected="${k === tab}" tabindex="${k === tab ? 0 : -1}" class="${k === tab ? 'active' : ''}" data-tab="${k}" data-action="proj-tab" data-case="${c.id}">${label}</button>`).join('')}</div>` : '';
  const body = tab === 'workflows' ? workflowsBody(c)
    : tab === 'interview' ? interviewBody(c.iv, 'var(--accent2)', 'story.' + c.id)
    : casePage(c);
  return `${caseHead(c)}${strip}<div class="tabbody" role="tabpanel">${body}</div>`;
}
function flowPage(c, f){
  const flows = c.flows || [], i = flows.indexOf(f);
  const prev = i > 0 ? flows[i-1] : null, next = i < flows.length - 1 ? flows[i+1] : null;
  const colorOf = flowColorOf(c);
  const steps = f.steps || [];
  const touched = [];
  steps.forEach(s => { if(s.sys && !touched.includes(s.sys)) touched.push(s.sys); });
  const sysChips = touched.map(sid => { const s = (c.systems || []).find(x => x.id === sid); if(!s) return '';
    return `<a class="chip kind lnk" style="--dc:${kindColor(s.kind)};cursor:pointer" href="#/experience/${c.id}/${s.id}">${esc(s.t)}</a>`; }).join('');
  return `${crumbs([['Projects','#/experience'],[c.t,'#/experience/'+c.id],['Workflows',`#/experience/${c.id}/workflows`],[f.t]])}
    <div class="casehead"><div class="chips" style="margin-bottom:7px"><span class="chip">Workflow</span><span class="chip">${steps.length} steps</span></div>
      <h1>${esc(f.t)}</h1></div>
    <p class="dim" style="max-width:820px">${esc(f.sum)}</p>
    <div class="card diagram-card flowwrap">${PlayableFlow.render(f, colorOf)}</div>
    <div class="section-head"><h2>The steps</h2><span class="muted">in the order the work happens</span></div>
    <ol class="flowsteps">${steps.map(s => `<li><span class="fsdot" style="--dc:${colorOf(s.sys)}"></span><b>${esc(s.t)}</b><div class="small dim">${esc(s.d)}</div></li>`).join('')}</ol>
    ${sysChips ? `<div class="section-head"><h2>Systems this touches</h2><span class="muted">read the piece, then come back</span></div><div class="chips">${sysChips}</div>` : ''}
    <div class="topic-nav">${prev ? `<button class="btn" data-href="#/experience/${c.id}/flow/${prev.id}">← ${esc(prev.t)}</button>` : `<button class="btn ghost" data-href="#/experience/${c.id}/workflows">← All workflows</button>`}<button class="btn ghost" data-href="#/experience/${c.id}">Project</button>${next ? `<button class="btn" data-href="#/experience/${c.id}/flow/${next.id}">${esc(next.t)} →</button>` : `<button class="btn" data-href="#/experience/${c.id}">${esc(c.t)} →</button>`}</div>`;
}
// `a` is a system id, or one of the reserved route words: 'workflows' and
// 'interview' select a tab of the project page, 'flow' makes `b` a flow id.
function renderExperience(id, a, b){
  const c = CASE_STUDIES.find(x => x.id === id);
  if(c){
    if(a === 'flow'){
      const f = (c.flows || []).find(x => x.id === b);
      if(f){ enterProject(c, 'workflows', f.id); setView(flowPage(c, f)); return renderTree('part'); }
    }
    const s = (c.systems || []).find(x => x.id === a) || null;
    if(!s){
      setProjTab(c, ['overview', 'workflows', 'interview'].includes(a) ? a : null);
      enterProject(c, projTab === 'workflows' ? 'workflows' : null, null);
      setView(projectPage(c));
      return renderTree(projTab === 'workflows' ? 'sys' : 'home');
    }
    const p = (s.parts || []).find(x => x.id === b) || null;
    enterProject(c, s.id, p ? p.id : null);
    setView(p ? partPage(c, s, p) : systemPage(c, s));
    return renderTree(p ? 'part' : 'sys');
  }
  setView(`${crumbs([['Map','#/map'],['Projects']])}<h1>Projects</h1><p class="dim" style="max-width:820px">Shipped work told the way an interview actually asks for it: the shape of the system, the decisions and what each one cost, what went wrong, and the stories that go with them. Anonymised on purpose. The technique travels, the names do not.</p>
    ${CASE_STUDIES.length ? `<div class="grid auto">${CASE_STUDIES.map(caseCard).join('')}</div>` : '<div class="empty">No case studies yet. They live in src/40-cases.js and appear here as soon as one is written.</div>'}`);
}

/* =====================================================================
   REVIEW QUEUE
   Retrieval practice with spacing: a question the reader marks "Review
   later" comes back after 1 day, and each time they recall it the gap
   doubles (1, 2, 4, 8, 16 days); a miss starts it over. The question and
   its answer outline are copied into the queue, so an edited topic cannot
   silently change what is being practised. Stored under playable.review.
   ===================================================================== */
const REVIEW_DAYS = [1, 2, 4, 8, 16];
const today = () => Math.floor(Date.now() / 86400000);
const reviewItems = () => store.get('review', {});
const reviewDue = () => Object.entries(reviewItems()).filter(([, r]) => r.due <= today());
ACTIONS['review-toggle'] = el => {
  const items = reviewItems(), k = el.dataset.key, body = el.closest('.body'), q = el.closest('details').querySelector('summary').textContent;
  if(items[k]) delete items[k];
  else items[k] = { q, a: body.querySelector('p').textContent, src: location.hash, box: 0, due: today() + REVIEW_DAYS[0] };
  store.set('review', items);
  const on = !!items[k]; el.setAttribute('aria-pressed', on); el.textContent = on ? 'In your review queue' : 'Review later';
  toast(on ? 'Added to your review queue' : 'Removed from your review queue');
};
ACTIONS['review-grade'] = el => {
  const items = reviewItems(), r = items[el.dataset.key]; if(!r) return;
  r.box = el.dataset.grade === 'got' ? Math.min(REVIEW_DAYS.length - 1, r.box + 1) : 0;
  r.due = today() + REVIEW_DAYS[r.box];
  store.set('review', items); renderReview();
};
ACTIONS['review-remove'] = el => { const items = reviewItems(); delete items[el.dataset.key]; store.set('review', items); renderReview(); };
function renderReview(){
  const all = Object.entries(reviewItems()), due = reviewDue(), later = all.length - due.length;
  const next = all.filter(([, r]) => r.due > today()).map(([, r]) => r.due).sort((a, b) => a - b)[0];
  const card = ([k, r]) => `<details class="ivq review-item"><summary>${esc(r.q)}</summary><div class="body">
      <h4>Answer outline</h4><p>${esc(r.a)}</p>
      <div class="row"><button type="button" class="btn sm" data-action="review-grade" data-key="${esc(k)}" data-grade="got">I recalled it</button><button type="button" class="btn sm ghost" data-action="review-grade" data-key="${esc(k)}" data-grade="again">Not yet</button><a class="btn sm ghost" href="${esc(r.src)}">Open the source</a><button type="button" class="btn sm ghost danger" data-action="review-remove" data-key="${esc(k)}">Remove</button></div></div></details>`;
  setView(`${crumbs([['Paths','#/paths'],['Review']])}<h1>Review</h1>
    <p class="dim" style="max-width:820px">Answer each question in your head or out loud first, then open it and compare with the outline. Recalled questions come back after a longer gap; missed ones come back tomorrow. No streaks: skip a day and the queue simply waits.</p>
    ${all.length ? `<div class="section-head"><h2>Due today</h2><span class="muted">${due.length} of ${all.length} questions${later ? ` · ${later} later${next ? `, next in ${next - today()} day${next - today() === 1 ? '' : 's'}` : ''}` : ''}</span></div>
    ${due.length ? `<div class="ivlist">${due.map(card).join('')}</div>` : '<div class="empty">Nothing is due. Come back when the next one is.</div>'}`
    : '<div class="empty">The queue is empty. Open any interview question (a topic\'s Interview tab, a project\'s questions) and press "Review later".</div>'}`);
}

/* =====================================================================
   LEARNING PATHS
   A path sequences existing content; it never duplicates it. Progress is
   { steps:{'<stageId>/<i>':true}, stages:{'<stageId>':'done'|'skipped'},
   started, last } under localStorage key path.<id>. `paths.active` names
   the one path the path bar (see pathBarHTML, called from setView) tracks
   across every route. stepTitle/stepHref are pure globals defined in
   50-paths.js so the path map (89-graph.js) can use them too.
   ===================================================================== */
function pathProgress(id){ return store.get('path.' + id, { steps:{}, stages:{}, started:null, last:null }); }
function savePathProgress(id, prog){ store.set('path.' + id, prog); }
function trackLabel(id){ const x = TRACKS.find(t => t[0] === id); return x ? x[1] : id; }
function levelLabel(id){ const x = LEVELS.find(l => l[0] === id); return x ? x[1] : id; }
function pathLinkChip(id){ const p = PATHS.find(x => x.id === id); return p ? `<a class="chip lnk" style="cursor:pointer" href="#/paths/${p.id}">${esc(p.t)}</a>` : esc(id); }
// The stage a path page opens on when the URL does not name one: the first
// stage that is neither done nor skipped, or the last stage once all are.
function currentStageId(pth){
  const prog = pathProgress(pth.id);
  const st = pth.stages.find(s => !prog.stages[s.id]);
  return st ? st.id : pth.stages[pth.stages.length - 1].id;
}
// The one visible next step: the first unticked step in the first stage not
// done or skipped, or a 'checkpoint' result when every step in that stage is
// ticked but the stage itself has not been marked done or skipped yet, or
// null once every stage is done or skipped.
function pathNextStep(id){
  const pth = PATHS.find(p => p.id === id); if(!pth) return null;
  const prog = pathProgress(id);
  for(const st of pth.stages){
    const status = prog.stages[st.id];
    if(status === 'done' || status === 'skipped') continue;
    for(let i = 0; i < st.steps.length; i++) if(!prog.steps[`${st.id}/${i}`]) return { type:'step', path:pth, stage:st, index:i, step:st.steps[i] };
    return { type:'checkpoint', path:pth, stage:st };
  }
  return null;
}
function nextStepLabel(next){ return next ? (next.type === 'step' ? stepTitle(next.step) : `${next.stage.t} checkpoint`) : 'All stages complete'; }
function nextStepHref(next){ return next ? (next.type === 'step' ? stepHref(next.step, next.path.id, next.stage.id) : `#/paths/${next.path.id}/${next.stage.id}`) : '#/paths'; }
function pathProgressCounts(pth){
  const prog = pathProgress(pth.id);
  const total = pth.stages.reduce((n, s) => n + s.steps.length, 0);
  const done = Object.values(prog.steps).filter(Boolean).length;
  const doneStages = pth.stages.filter(s => prog.stages[s.id]).length;
  return { prog, total, done, doneStages, pct: total ? Math.round(100 * done / total) : 0 };
}
function markStageStatus(pathId, stageId, status){
  const prog = pathProgress(pathId); prog.stages[stageId] = status; prog.last = Date.now(); if(!prog.started) prog.started = prog.last;
  savePathProgress(pathId, prog); store.set('paths.active', pathId);
}
function goPastStage(pathId, stageId){
  const pth = PATHS.find(p => p.id === pathId); const idx = pth.stages.findIndex(s => s.id === stageId); const nxt = pth.stages[idx + 1];
  go(nxt ? `#/paths/${pathId}/${nxt.id}` : `#/paths/${pathId}`);
}
function togglePathStep(pathId, key, checked){
  const prog = pathProgress(pathId); prog.steps[key] = !!checked; prog.last = Date.now(); if(!prog.started) prog.started = prog.last;
  savePathProgress(pathId, prog); store.set('paths.active', pathId); route();
}
ACTIONS['stage-done'] = el => { markStageStatus(el.dataset.path, el.dataset.stage, 'done'); goPastStage(el.dataset.path, el.dataset.stage); };
ACTIONS['stage-skip'] = el => { markStageStatus(el.dataset.path, el.dataset.stage, 'skipped'); goPastStage(el.dataset.path, el.dataset.stage); };
ACTIONS['path-continue'] = el => {
  const pathId = el.dataset.path, next = pathNextStep(pathId); if(!next) return;
  if(next.type === 'step') togglePathStep(pathId, `${next.stage.id}/${next.index}`, true);
  else { markStageStatus(pathId, next.stage.id, 'done'); route(); }
};
// Leaving while sitting on that path's own page would otherwise re-activate
// it on the very next render (renderPaths always activates the path it
// shows), so a leave taken from a #/paths/<id>... route steps back to the
// door instead of re-rendering the page it just left.
ACTIONS['leave-path'] = () => {
  store.set('paths.active', null);
  if(/^#\/paths\//.test(location.hash)) go('#/paths'); else route();
};

// Slim bar at the top of the content pane, on every route, while a path is
// active. It is the one visible next step the plan calls for: where you are
// in the path and the one button that moves you forward.
function pathBarHTML(){
  const activeId = store.get('paths.active', null);
  const pth = activeId && PATHS.find(p => p.id === activeId);
  if(!pth) return '';
  const next = pathNextStep(pth.id);
  const curIdx = pth.stages.findIndex(s => s.id === currentStageId(pth)) + 1;
  const href = nextStepHref(next);
  const onNext = next && location.hash.replace(/^#/, '') === href.replace(/^#/, '');
  return `<div class="pathbar">
    <div class="pathbar-info"><b>${esc(pth.t)}</b><span class="muted"> · Stage ${curIdx} of ${pth.stages.length} · Next: ${esc(nextStepLabel(next))}</span></div>
    <div class="pathbar-actions">
      ${next ? (onNext ? `<button class="btn sm primary" data-action="path-continue" data-path="${pth.id}">Mark done and continue</button>` : `<a class="btn sm primary" href="${href}">Next →</a>`) : ''}
      <button class="btn sm ghost" data-action="leave-path">Leave path</button>
    </div></div>`;
}

function pathCard(p){
  const { pct } = pathProgressCounts(p);
  return `<a class="card clickable tint lnk blk" style="--dc:var(--accent2)" href="#/paths/${p.id}">
    <div class="chips" style="margin-bottom:6px"><span class="chip">${esc(levelLabel(p.level))}</span><span class="chip">${p.hours}h</span></div>
    <b>${esc(p.t)}</b><div class="small dim">${esc(p.tag)}</div>
    <div class="progress" style="margin-top:8px"><span class="small muted">${pct}%</span><span class="bar"><i style="width:${pct}%"></i></span></div></a>`;
}
function pathsDoorHTML(){
  const activeId = store.get('paths.active', null);
  const active = activeId && PATHS.find(p => p.id === activeId);
  const continueCard = active ? (() => {
    const next = pathNextStep(active.id);
    return `<div class="card tint" style="--dc:var(--accent2);margin-bottom:18px"><div class="overline">Continue</div><h3 style="margin:2px 0 4px">${esc(active.t)}</h3><p class="dim small">Next: ${esc(nextStepLabel(next))}</p>
      <div class="row"><a class="btn primary" href="${nextStepHref(next)}">Continue →</a><a class="btn ghost" href="#/paths/${active.id}">Open the path</a></div></div>`;
  })() : '';
  const outcomes = PATHS.length ? `<div class="paths">${PATHS.map(p => `<button class="path" data-href="#/paths/${p.id}"><b>${esc(p.outcome.split(/(?<=\.)\s/)[0])}</b><span>${esc(p.tag)}</span></button>`).join('')}</div>` : '';
  const tracks = TRACKS.map(([tid, tlabel]) => {
    const list = PATHS.filter(p => p.track === tid); if(!list.length) return '';
    return `<div class="section-head"><h2>${esc(tlabel)}</h2></div><div class="grid auto">${list.map(pathCard).join('')}</div>`;
  }).join('');
  return `${crumbs([['Paths']])}<h1>Learning paths</h1><p class="dim" style="max-width:760px">Pick a path and follow one visible next step at a time. Every stage ends in a soft checkpoint, or a skip if you already know it. Progress is steps done and stages done: no streaks, no badges.</p>
    ${continueCard}
    ${outcomes ? `<div class="section-head"><h2>What do you want to be able to do?</h2></div>${outcomes}` : ''}
    ${tracks || '<div class="empty">No paths written yet. They live in src/50-paths.js and src/51-paths-engineering.js.</div>'}
    <p class="row" style="margin-top:10px"><a class="btn ghost" href="#/map">or explore the full map →</a></p>`;
}

function stepRowHTML(pth, st, i, step, prog){
  const key = `${st.id}/${i}`, checked = !!prog.steps[key], href = stepHref(step, pth.id, st.id);
  return `<label class="pathstep ${checked ? 'done' : ''}">
    <input type="checkbox" ${checked ? 'checked' : ''} data-path="${pth.id}" data-step="${key}">
    <span class="chip kindchip">${esc(step.kind)}</span>
    <span class="pathstep-body"><a href="${href}">${esc(stepTitle(step))}</a>${step.min ? ` <span class="muted small">${step.min} min</span>` : ''}
      <div class="small dim">${esc(step.why)}</div><div class="small">${esc(step.do)}</div></span>
  </label>`;
}
function stageFooterHTML(pth, st, prog){
  const review = (st.review || []).map(tid => { const t = TOPICS[tid]; return t ? `<a class="chip lnk" style="cursor:pointer" href="#/map/t/${tid}">${esc(t.t)}</a>` : ''; }).join('');
  const status = prog.stages[st.id];
  return `${review ? `<div class="small" style="margin-top:10px"><b>Review:</b> ${review}</div>` : ''}
    <details class="pathcheck" style="margin-top:10px"><summary>Checkpoint</summary><div class="body">
      <h4>Can you answer these?</h4><ul>${(st.check.recall || []).map(q => `<li>${esc(q)}</li>`).join('')}</ul>
      <h4>Build</h4><p>${esc(st.check.build)}</p>
      <button class="btn sm primary" ${status ? 'disabled' : ''} data-action="stage-done" data-path="${pth.id}" data-stage="${st.id}">${status === 'done' ? 'Stage marked done' : 'Mark stage done'}</button>
    </div></details>
    <details class="pathskip" style="margin-top:6px"><summary>Skip ahead: I already know this</summary><div class="body">
      <ul>${(st.check.skip || []).map(q => `<li>${esc(q)}</li>`).join('')}</ul>
      <button class="btn sm ghost" ${status ? 'disabled' : ''} data-action="stage-skip" data-path="${pth.id}" data-stage="${st.id}">${status === 'skipped' ? 'Stage skipped' : 'I can answer these, skip this stage'}</button>
    </div></details>`;
}
function stageSectionHTML(pth, st, si, curStage, prog){
  const status = prog.stages[st.id];
  const isOpen = st.id === curStage;
  const doneCount = st.steps.filter((_, i) => prog.steps[`${st.id}/${i}`]).length;
  const tick = status === 'done' ? '✓' : status === 'skipped' ? '⇥' : String(si + 1);
  return `<section class="pathstage ${isOpen ? 'open' : ''} ${status || ''}" data-stage="${st.id}">
    <header data-href="#/paths/${pth.id}/${st.id}"><span class="letter">${tick}</span><div style="flex:1"><h3><a class="lnk sec-link" href="#/paths/${pth.id}/${st.id}">${esc(st.t)}</a></h3><div class="small muted">${esc(st.goal)}</div></div><span class="chip">${doneCount}/${st.steps.length}</span><span class="car">▸</span></header>
    <div class="body"><div class="pathsteps">${st.steps.map((step, i) => stepRowHTML(pth, st, i, step, prog)).join('')}</div>${stageFooterHTML(pth, st, prog)}</div>
  </section>`;
}
function pathPageHTML(pth, stageIdParam){
  const curStage = (stageIdParam && pth.stages.some(s => s.id === stageIdParam)) ? stageIdParam : currentStageId(pth);
  const { prog, total, done, doneStages, pct } = pathProgressCounts(pth);
  const next = pathNextStep(pth.id);
  const nextCallout = next
    ? `<div class="callout"><b>Next:</b> ${esc(nextStepLabel(next))} <a class="btn sm primary" style="margin-left:8px" href="${nextStepHref(next)}">Go →</a></div>`
    : `<div class="callout ok"><b>All stages complete.</b> Revisit any stage below, or start another path.</div>`;
  return `${crumbs([['Paths', '#/paths'], [pth.t]])}
    <div class="chips" style="margin-bottom:8px"><span class="chip dom" style="--dc:var(--accent2)">${esc(trackLabel(pth.track))}</span><span class="chip">${esc(levelLabel(pth.level))} entry</span><span class="chip">${pth.hours}h</span></div>
    <h1>${esc(pth.t)}</h1><p class="tag">${esc(pth.tag)}</p>
    <p class="dim"><b>Who it is for.</b> ${esc(pth.audience)}</p>
    <p class="dim"><b>What you can do after.</b> ${esc(pth.outcome)}</p>
    ${pth.prereq.length ? `<p class="small muted">Prereq: ${pth.prereq.map(pathLinkChip).join(', ')}</p>` : ''}
    <div class="progress" style="margin:10px 0 14px"><span>${doneStages} / ${pth.stages.length} stages · ${done} / ${total} steps</span><span class="bar"><i style="width:${pct}%"></i></span></div>
    ${nextCallout}
    <div class="pathstages">${pth.stages.map((st, si) => stageSectionHTML(pth, st, si, curStage, prog)).join('')}</div>
    ${pth.next.length ? `<div class="section-head"><h2>Where to go next</h2></div><div class="chips">${pth.next.map(pathLinkChip).join('')}</div>` : ''}`;
}
function renderPaths(id, stageId){
  const pth = id && PATHS.find(p => p.id === id);
  if(pth){
    store.set('paths.active', pth.id);
    const openStage = (stageId && pth.stages.some(s => s.id === stageId)) ? stageId : currentStageId(pth);
    enterPathMap(pth, openStage);
    setView(pathPageHTML(pth, stageId));
    return renderTree(stageId ? 'stage' : 'home');
  }
  setView(pathsDoorHTML());
}

// Reverse index: guide topic -> every path/stage that walks through it as a
// 'topic' step. Built once, like practice(), and read by pathChips below for
// a topic page's "Part of paths" chips.
let _PATH_LINKS = null;
function pathLinks(){
  if(!_PATH_LINKS){
    _PATH_LINKS = {};
    PATHS.forEach(pth => pth.stages.forEach(st => st.steps.forEach(step => {
      if(step.kind !== 'topic') return;
      (_PATH_LINKS[step.ref] || (_PATH_LINKS[step.ref] = [])).push({ path:pth, stage:st });
    })));
  }
  return _PATH_LINKS;
}
function pathChips(topicId){
  const hits = pathLinks()[topicId] || [];
  if(!hits.length) return '';
  return `<div class="small" style="margin-top:8px"><b>Part of paths:</b> a guided sequence that walks through this topic.</div>
    <div class="chips" style="margin-top:5px">${hits.map(h => `<a class="chip prac lnk" href="#/paths/${h.path.id}/${h.stage.id}">${esc(h.path.t)} · ${esc(h.stage.t)}</a>`).join('')}</div>`;
}

/* =====================================================================
   SEARCH
   ===================================================================== */
let _INDEX = null;
function buildIndex(){
  const INDEX = [];
const engText = t => t.eng ? ['godot','unity'].flatMap(k => t.eng[k] ? [t.eng[k].term, ...(t.eng[k].api||[]), t.eng[k].pitfall, t.eng[k].map] : []) : [];
const ivQ = t => t.iv ? ['junior','mid','senior'].flatMap(k => (t.iv[k]||[]).map(x => x.q)) : [];
TOPIC_LIST.forEach(t => INDEX.push({ type:'topic', t:t.t, snip:t.tag, href:'#/map/t/'+t.id, text:[t.t, t.tag, t.what, ...(t.why||[]), ...(t.think.q||[]), ...(t.think.traps||[]), ...(t.how||[]), ...(t.prompts||[]).map(p=>p.l+' '+p.p), ...engText(t), ...ivQ(t)].join(' ').toLowerCase() }));
TOPIC_LIST.filter(t => t.iv).forEach(t => INDEX.push({ type:'interview', t:t.t+' · interview', snip:`${DOM[t.d].t} · questions, model answers and red flags`, href:'#/map/t/'+t.id+'/interview', text:('interview questions answers red flag junior mid senior '+t.t+' '+ivQ(t).join(' ')).toLowerCase() }));
CASE_STUDIES.forEach(c => INDEX.push({ type:'experience', t:c.t, snip:`${c.sub ? c.sub + ' · ' : ''}${c.role} · ${c.period}`, href:'#/experience/'+c.id, text:(c.t+' '+(c.sub||'')+' '+c.role+' '+c.stack.join(' ')+' '+c.context+' '+c.arch.join(' ')+' '+c.decisions.map(x=>x.d+' '+x.why+' '+x.trade).join(' ')+' '+c.lessons.map(x=>x.what+' '+x.lesson).join(' ')+' '+c.stories.map(s=>s.s+' '+s.t+' '+s.a+' '+s.r).join(' ')).toLowerCase() }));
CASE_STUDIES.forEach(c => (c.systems||[]).forEach(s => (s.parts||[]).forEach(p => INDEX.push({ type:'experience', t:c.t+' · '+p.t, snip:`${s.t} · ${p.why}`, href:`#/experience/${c.id}/${s.id}/${p.id}`, text:(c.t+' '+s.t+' '+s.kind+' '+(s.stack||[]).join(' ')+' '+p.t+' '+p.what+' '+(p.how||[]).join(' ')+' '+p.why+' '+p.trade+' '+(p.story||'')).toLowerCase() }))));
CASE_STUDIES.forEach(c => (c.flows||[]).forEach(f => INDEX.push({ type:'experience', t:(c.code||c.t)+' · '+f.t, snip:`Workflow · ${(f.steps||[]).length} steps · ${f.sum}`, href:`#/experience/${c.id}/flow/${f.id}`, text:('workflow flow chart '+(c.code||c.t)+' '+f.t+' '+f.sum+' '+(f.steps||[]).map(s=>s.t+' '+s.d).join(' ')+' '+(f.edges||[]).map(e=>e[2]||'').join(' ')).toLowerCase() })));
CASE_STUDIES.filter(c => c.iv).forEach(c => INDEX.push({ type:'interview', t:c.t+' · interview', snip:`${c.sub || c.role} · questions, model answers and red flags`, href:'#/experience/'+c.id+'/interview', text:('interview questions answers red flag junior mid senior project '+c.t+' '+(c.sub||'')+' '+['junior','mid','senior'].flatMap(k => (c.iv[k]||[]).map(x => x.q+' '+x.a)).join(' ')).toLowerCase() }));
CASE_STUDIES.forEach(c => (c.systems||[]).filter(s => s.iv).forEach(s => INDEX.push({ type:'interview', t:c.t+' · '+s.t, snip:'Likely questions on this system', href:`#/experience/${c.id}/${s.id}`, text:('interview likely questions '+c.t+' '+s.t+' '+s.iv.map(x=>x.q+' '+x.a).join(' ')).toLowerCase() })));
DOMAINS.forEach(d => INDEX.push({ type:'domain', t:d.t, snip:d.short, href:'#/explore/'+d.id, text:(d.t+' '+d.short+' '+d.sum).toLowerCase() }));
const SMELL_KW = { 'repetitive':'samey boring grind monotonous stale loop repetitive', 'one-build':'meta dominant strategy convergence balance pick rate', 'ignore-mechanics':'unused abilities never touched dead system', 'tutorial-too-long':'onboarding skip text explain wall of text', 'impressive-but-boring':'polish spectacle graphics demo shallow', 'fun-but-no-return':'retention churn day two return come back', 'meaningless-progression':'grind number goes up unlock pointless power creep', 'too-many-currencies':'economy wallet gems coins exchange', 'floaty-combat':'weight impact hit feel juice combat fight melee attack', 'unfair':'cheap random punishing difficulty spike fair fairness gank', 'no-experiment':'curiosity try things safe optimal', 'same-way':'style variety identical converge', 'features-not-better':'feature creep scope bloat roadmap bloat', 'ai-ideas-none-right':'generic brainstorm options proposals average', 'quit-early':'drop off first session bounce choke', 'dont-understand-system':'mental model confusing rules opaque', 'ignore-content':'skip side content rush optional poi', 'players-lose-agency':'choices do not matter cutscene control railroad', 'dont-know-what-to-do':'lost aimless wander objective direction' };
SMELLS.forEach(s => INDEX.push({ type:'smell', t:s.t, snip:s.sym, href:'#/smell/'+s.id, text:(s.t+' '+s.sym+' '+(SMELL_KW[s.id]||'')+' '+s.causes.map(c=>c.c+' '+c.exp).join(' ')).toLowerCase() }));
PROMPT_TEMPLATES.forEach(p => INDEX.push({ type:'prompt', t:p.t, snip:p.cat+' · '+p.p.slice(0,100)+'…', href:'#/prompts/'+p.id, text:(p.t+' '+p.cat+' '+p.p).toLowerCase() }));
ROLES.forEach(r => INDEX.push({ type:'AI role', t:r.t, snip:r.job, href:'#/ai/roles/'+r.id, text:(r.t+' '+r.job+' '+r.use.join(' ')+' '+r.avoid.join(' ')+' '+r.starter).toLowerCase() }));
SOURCES.forEach(s => INDEX.push({ type:'source', t:s[0], snip:s[1].slice(0,110)+'…', href:'#/sources', text:(s[0]+' '+s[1]).toLowerCase() }));
REFERENCE_GAMES.forEach(g => INDEX.push({ type:'reference', t:g.t, snip:`${g.year} · ${g.genre} · ${g.lesson.slice(0,90)}…`, href:'#/build/dissect', text:(g.t+' '+g.genre+' '+g.want+' '+g.verb+' '+g.why+' '+g.lesson+' '+g.misses).toLowerCase() }));
FAILURES.forEach(f => INDEX.push({ type:'failure', t:f.t, snip:f.sym, href:'#/ai/failures', text:(f.t+' '+f.sym+' '+f.why+' '+f.fix).toLowerCase() }));
LADDER.forEach(s => INDEX.push({ type:'ladder', t:s.n+'. '+s.stage, snip:'AI partner: '+s.role, href:'#/ai/ladder', text:(s.stage+' '+s.role+' '+s.you+' '+s.ai+' '+s.caution).toLowerCase() }));
TOOLS.forEach(([id,t,s]) => INDEX.push({ type:'tool', t, snip:s, href:'#/build/'+id, text:(t+' '+s).toLowerCase() }));
PATHS.forEach(p => INDEX.push({ type:'path', t:p.t, snip:p.tag, href:'#/paths/'+p.id, text:(p.t+' '+p.tag+' '+p.audience+' '+p.outcome+' '+p.stages.map(s=>s.t).join(' ')+' '+p.stages.flatMap(s=>s.steps).map(s=>s.do||'').join(' ')).toLowerCase() }));
CHECKLISTS.forEach(c => INDEX.push({ type:'checklist', t:c.t, snip:c.desc, href:'#/checklists/'+c.id, text:(c.t+' '+c.desc+' '+c.groups.flatMap(g=>g[1]).join(' ')).toLowerCase() }));
LOOP_STEPS.forEach(s => INDEX.push({ type:'loop step', t:`${s.n}. ${s.t}`, snip:s.goal, href:'#/ai/loop/'+s.n, text:(s.t+' '+s.goal+' '+s.human+' '+s.ai+' '+s.fail).toLowerCase() }));
FUN_DIMS.forEach(d => INDEX.push({ type:'fun', t:d[0], snip:d[1], href:'#/diagnose/fun/'+d[0], text:(d[0]+' '+d[1]+' '+d[2]).toLowerCase() }));
INDEX.push({ type:'diagnostic', t:'Core loop diagnostic', snip:'Action, feedback, decision, consequence, new situation', href:'#/diagnose/loop', text:'core loop diagnostic action feedback decision consequence new situation weak link' });
INDEX.push({ type:'diagnostic', t:'Unfairness diagnostic', snip:'Why players say the game is unfair', href:'#/diagnose/unfair', text:'unfair cheap random punishment checkpoint telegraph difficulty diagnostic' });
INDEX.push({ type:'diagnostic', t:'Depth vs complexity rule audit', snip:'Which rules earn their place', href:'#/diagnose/depth', text:'depth complexity elegance rule audit cut rules' });
INDEX.push({ type:'diagnostic', t:'Content or mechanic?', snip:'Should we add another enemy, level, weapon, quest?', href:'#/diagnose/content', text:'content decision tree add enemy level weapon quest improve interaction' });
  return INDEX;
}
function ensureIndex(){ return _INDEX || (_INDEX = buildIndex()); }

let searchSel = 0, searchResults = [];
function search(q){ q = q.trim().toLowerCase(); if(!q) return []; const words = q.split(/\s+/); return ensureIndex().map(it => { let score = 0; words.forEach(w => { if(it.t.toLowerCase().includes(w)) score += 10; if(it.snip.toLowerCase().includes(w)) score += 4; if(it.text.includes(w)) score += 1; }); if(it.t.toLowerCase().startsWith(q)) score += 8; return [score, it]; }).filter(x => x[0] > 0).sort((a,b) => b[0]-a[0]).slice(0, 30).map(x => x[1]); }
function renderSearch(){ const q = $('#searchInput').value; searchResults = search(q); searchSel = Math.min(searchSel, Math.max(searchResults.length-1, 0));
  $('#searchResults').innerHTML = searchResults.length ? searchResults.map((r, i) => `<div class="res ${i===searchSel?'sel':''}" data-i="${i}"><span class="type">${r.type}</span><div><b>${esc(r.t)}</b><div class="snip">${esc(r.snip)}</div></div></div>`).join('') : (q.trim() ? '<div class="empty">Nothing matches. Try a symptom ("repetitive"), a concept ("depth"), or a role ("critic").</div>' : `<div class="res" style="cursor:default"><span class="type">try</span><div class="snip">repetitive · one build · onboarding · depth · economy · critic · playtest analysis · should we build this · unfair</div></div>`);
  $('#searchCount').textContent = searchResults.length ? `${searchResults.length} results` : '';
  $$('#searchResults .res[data-i]').forEach(el => { el.onmouseenter = () => { searchSel = +el.dataset.i; $$('#searchResults .res').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); }; el.onclick = () => openResult(+el.dataset.i); }); }
function openResult(i){ const r = searchResults[i]; if(!r) return; closeModals(); go(r.href); }
function openSearch(){ const inp = $('#searchInput'); inp.value = ''; searchSel = 0; renderSearch(); openModal('searchModal', '#searchInput'); }
// A dialog takes focus when it opens, keeps Tab inside while open, and hands
// focus back to whatever opened it when it closes.
let modalOpener = null;
const focusables = m => $$('button, [href], input:not([hidden]), select, textarea', m).filter(x => !x.disabled && x.offsetParent !== null);
function openModal(id, focusSel){
  closeModals();
  modalOpener = document.activeElement;
  const m = $('#' + id); m.classList.add('show');
  const f = (focusSel && $(focusSel, m)) || focusables(m)[0];
  if(f) f.focus();
}
function closeModals(){
  const open = $$('.modal-bg.show'); if(!open.length) return;
  const hadFocus = open.some(m => m.contains(document.activeElement));
  open.forEach(m => m.classList.remove('show'));
  if(hadFocus){ if(modalOpener && modalOpener.isConnected && modalOpener !== document.body) modalOpener.focus(); else document.activeElement.blur(); }
  modalOpener = null;
}
document.addEventListener('keydown', e => {
  if(e.key !== 'Tab') return;
  const m = $('.modal-bg.show'); if(!m) return;
  const f = focusables(m); if(!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if(!m.contains(document.activeElement)){ e.preventDefault(); first.focus(); }
  else if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
});
$('#searchBtn').onclick = openSearch;
$('#searchInput').addEventListener('input', () => { searchSel = 0; renderSearch(); });
$('#searchInput').addEventListener('keydown', e => { if(e.key==='ArrowDown'){ e.preventDefault(); searchSel = Math.min(searchSel+1, searchResults.length-1); renderSearch(); } else if(e.key==='ArrowUp'){ e.preventDefault(); searchSel = Math.max(searchSel-1, 0); renderSearch(); } else if(e.key==='Enter'){ openResult(searchSel); } });
$$('.modal-bg').forEach(m => m.addEventListener('click', e => { if(e.target === m) closeModals(); }));
$('#helpBtn').onclick = () => openModal('helpModal');
$('#helpClose').onclick = closeModals;
$('#resetAll').onclick = () => { if(confirm('Reset all saved data (progress, tool inputs, checklists)?')){ store.clear(); location.reload(); } };
// Single-letter shortcuts can fire by accident under speech input or a
// screen reader, so they can be switched off (WCAG 2.1.4).
const keysOn = () => store.get('keys', true);
$('#keysToggle').checked = keysOn();
$('#keysToggle').onchange = e => store.set('keys', e.target.checked);
// Everything the reader writes lives in localStorage, which a browser may
// clear; export and import move it as one JSON file.
const OWN = k => k.startsWith('playable.');
$('#exportData').onclick = () => {
  const data = {}; Object.keys(localStorage).filter(OWN).forEach(k => { data[k] = localStorage.getItem(k); });
  const blob = new Blob([JSON.stringify({ app: 'playable', v: 1, exportedAt: new Date().toISOString(), data }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'playable-data-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  if(navigator.storage && navigator.storage.persist) navigator.storage.persist();
  toast(`Exported ${Object.keys(data).length} saved items`);
};
$('#importData').onclick = () => $('#importFile').click();
$('#importFile').onchange = async e => {
  const file = e.target.files[0]; e.target.value = ''; if(!file) return;
  let obj; try { obj = JSON.parse(await file.text()); } catch(err){ return toast('That file is not a Playable export'); }
  const entries = obj && obj.app === 'playable' && obj.data && typeof obj.data === 'object' ? Object.entries(obj.data) : null;
  if(!entries || !entries.every(([k, v]) => OWN(k) && typeof v === 'string')) return toast('That file is not a Playable export');
  if(!confirm(`Replace everything saved in this browser with the ${entries.length} items exported ${String(obj.exportedAt || '').slice(0, 10)}?`)) return;
  const before = Object.keys(localStorage).filter(OWN).map(k => [k, localStorage.getItem(k)]);
  try { before.forEach(([k]) => localStorage.removeItem(k)); entries.forEach(([k, v]) => localStorage.setItem(k, v)); }
  catch(err){ Object.keys(localStorage).filter(OWN).forEach(k => localStorage.removeItem(k)); before.forEach(([k, v]) => localStorage.setItem(k, v)); return toast('Import failed; nothing was changed'); }
  location.reload();
};
$('#skipBtn').onclick = () => {
  const p = $('#pane'); if(isNarrow()){ p.classList.add('open'); syncScrim(); }
  const h = p.querySelector('h1'); if(h){ h.setAttribute('tabindex', '-1'); h.focus(); }
};

/* ---------- keyboard ---------- */
document.addEventListener('keydown', e => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openSearch(); return; }
  if(e.key==='Escape'){ closeModals(); return; }
  if(typing || !keysOn()) return;
  if(e.key==='/'){ e.preventDefault(); openSearch(); return; }
  if(e.key==='?'){ openModal('helpModal'); return; }
  if(/^[1-6]$/.test(e.key)){ go('#/' + NAV[+e.key - 1].views[0][0]); return; }
  if(e.key.toLowerCase()==='m'){ fitMap(); return; }
  if(e.key.toLowerCase()==='t'){ $('#themeBtn').click(); return; }
  const m = location.hash.match(/^#\/map\/t\/([\w-]+)/);
  if(m){ const t = TOPICS[m[1]]; if(!t) return; const list = DOM[t.d].topics, i = list.indexOf(m[1]);
    if(e.key===']' && i < list.length-1) go('#/map/t/'+list[i+1]);
    if(e.key==='[' && i > 0) go('#/map/t/'+list[i-1]);
    if(e.key.toLowerCase()==='e'){ const anyClosed = $$('.sec').some(s => !s.classList.contains('open')); expandAll(anyClosed); } }
});

// What the later files import from this one.
Object.assign(A, { $, $$, app, esc, DOM, TOPIC_LIST, store, seen, markSeen, updateProgress, toast, copyText, go, route, isNarrow,
  setView, crumbs, domChip, list, chainHTML, promptBox, field, outputBox, toolHead, practice, setTopicTab,
  topicBody, smellsView, pathProgress, renderPaths, closeModals, openModal, DIAGRAM_DISSECTION });
})(window.PlayableApp = {});

