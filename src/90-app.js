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
// Defined by the files that load after this one (91-map.js, and 93-lab.js,
// which loads on demand), so they are looked up on the shared namespace at call time.
const late = name => (...a) => A[name](...a);
const renderMap = late('renderMap'), renderTree = late('renderTree'), syncMapMode = late('syncMapMode'),
  enterProject = late('enterProject'), enterPathMap = late('enterPathMap'),
  renderLab = late('renderLab'), renderRpg = late('renderRpg'), fitMap = late('fitMap'),
  consumeMapKeyNav = late('consumeMapKeyNav'), currentLens = late('currentLens'), setLens = late('setLens'),
  lensSwitchHTML = late('lensSwitchHTML'), mapProgress = late('mapProgress');

/* ---------- storage ---------- */
// A stored value whose kind differs from the default's (array, plain object,
// number, string, boolean) is treated as absent, so old or edited data cannot
// break a view. With no default (null or undefined) the value is returned as is.
const kindOf = v => Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v;
const store = {
  get(k, def){ try { const v = localStorage.getItem('playable.'+k); if(v === null) return def; const x = JSON.parse(v); return def == null || kindOf(x) === kindOf(def) ? x : def; } catch(e){ return def; } },
  set(k, v){ try { localStorage.setItem('playable.'+k, JSON.stringify(v)); } catch(e){} },
  clear(){ try { Object.keys(localStorage).filter(k => k.startsWith('playable.')).forEach(k => localStorage.removeItem(k)); } catch(e){} }
};
const seen = new Set(store.get('seen', []));
function markSeen(id){ if(!seen.has(id)){ seen.add(id); store.set('seen', [...seen]); updateProgress(); } }
// Opening a topic does not count it: a topic is read once the learner marks it read
// at the foot of the page, or marks its path step done. Stored marks stay as they were.
function unmarkSeen(id){ if(seen.delete(id)){ store.set('seen', [...seen]); updateProgress(); } }
function updateProgress(){ const n = TOPIC_LIST.length, s = [...seen].filter(id => TOPICS[id]).length; $('#progressText').textContent = `Topics read ${s}/${n}`; $('#progressBar').style.width = (100*s/n)+'%'; if(A.mapProgress) mapProgress(); }

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
// An action toast (Undo) stays longer and takes clicks; a plain one does not.
function toast(msg, act){
  const t = $('#toast'); t.textContent = msg; t.classList.toggle('act', !!act);
  if(act){ const b = document.createElement('button'); b.type = 'button'; b.className = 'toastbtn'; b.textContent = act.label; Object.assign(b.dataset, act.data); t.appendChild(b); }
  t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show', 'act'), act ? 6000 : 1600);
}
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
// A topic or domain page folds the map away by default. A click inside the map is
// the reader asking for the map, so it stays shown for that visit; a Show or Hide
// choice the reader has made themselves always wins over both.
let mapPinned = false;
const mapHidden = () => { const v = store.get('hideMap', null); return v === null ? !mapPinned : !!v; };
const pinMap = () => { mapPinned = true; };
ACTIONS['toggle-map'] = el => { const h = !mapHidden(); store.set('hideMap', h); keepScroll = true; route(); if(isNarrow() && !h){ $('#pane').classList.remove('open'); syncScrim(); } };
ACTIONS.lens = el => setLens(el.dataset.lens);
ACTIONS.focus = el => document.getElementById(el.dataset.target).focus();
ACTIONS['toggle-parent'] = el => el.parentElement.classList.toggle('open');
ACTIONS['clear-tool'] = el => { if(confirm('Clear this tool?')){ localStorage.removeItem('playable.' + el.dataset.key); location.reload(); } };

/* ---------- router ---------- */
// Keys 1-9 map to the first nine entries, so anything added here goes last.
// Seven groups in the top bar; each opens its first view, and a group with
// several views shows them as a row of sub-tabs on every page of the group.
// Keys 1-7 open the groups in this order. The Library holds the collections
// (games, platforms, checklists, prompts, sources), so "where are the
// games?" has one answer.
const NAV = [
  { id:'paths', t:'Paths', views:[['paths','Learning paths'],['review','Review']] },
  { id:'map', t:'Map', views:[['map','Map'],['explore','List'],['concepts','Concept index']] },
  { id:'library', t:'Library', views:[['games','Reference games'],['platforms','Platforms'],['engines','Engines'],['checklists','Checklists'],['prompts','Prompts'],['sources','Sources']] },
  { id:'make', t:'Make', views:[['lab','Idea Lab'],['build','Build tools']] },
  { id:'diagnose', t:'Diagnose', views:[['diagnose','Diagnose'],['playtest','Playtest']] },
  { id:'ai', t:'AI Workflow', views:[['ai','AI Workflow']] },
  { id:'experience', t:'Projects', views:[['experience','Projects']] }
];
const VIEW_GROUP = {};
NAV.forEach(g => g.views.forEach(([v]) => { VIEW_GROUP[v] = g; }));
VIEW_GROUP.smell = VIEW_GROUP.diagnose; VIEW_GROUP.topic = VIEW_GROUP.map; VIEW_GROUP.play = VIEW_GROUP.paths;
function go(hash){ if(location.hash === hash) route(); else location.hash = hash; }
// Below this width the index and the content are drawers over the map.
const narrowQuery = window.matchMedia('(max-width: 1100px)');   // the same width as the drawer CSS
const isNarrow = () => narrowQuery.matches;
// The drawers open below the header so its controls stay reachable. The
// header wraps at some widths, so the CSS reads its measured height.
const topbar = $('.topbar');
new ResizeObserver(() => document.documentElement.style.setProperty('--hdr', topbar.offsetHeight + 'px')).observe(topbar);
const currentParts = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
// Routes that only reshape the map: home, a domain, a project's system.
// On a narrow screen they keep the map in front; every other route is
// something to read or use, so the content drawer opens for it.
/* A detail route whose id does not exist: [kind, id, index href, index label], or null.
   Every other route (valid ids, indexes, tabs) returns null and renders as before. */
function missing(parts){
  if(!Array.isArray(parts)) return null;
  const [v, a, b, c] = parts, mapIx = ['#/map', 'Map'];
  const has = (list, id) => list.some(x => x.id === id);
  switch(v){
    case 'map':
      if(a === 't' && b && !TOPICS[b]) return ['topic', b, ...mapIx];
      if(a === 's' && b && !has(SMELLS, b)) return ['smell', b, '#/diagnose/smells', 'Design smells'];
      if(a === 'd' && b && !DOM[b]) return ['domain', b, ...mapIx];
      return null;
    case 'topic': return a && !TOPICS[a] ? ['topic', a, ...mapIx] : null;
    case 'smell': return a && !has(SMELLS, a) ? ['smell', a, '#/diagnose/smells', 'Design smells'] : null;
    case 'diagnose': return a === 'smells' && b && !has(SMELLS, b) ? ['smell', b, '#/diagnose/smells', 'Design smells'] : null;
    case 'games':
      if(a === 'compare') return b && !has(COMPARISONS, b) ? ['comparison', b, '#/games/compare', 'Two games, one problem'] : null;
      return a && a !== 'topic' && !has(REFERENCE_GAMES, a) ? ['game', a, '#/games', 'Reference games'] : null;
    case 'platforms': return a && !has(PLATFORMS, a) ? ['platform', a, '#/platforms', 'Platforms'] : null;
    case 'engines': return a && !has(ENGINES, a) ? ['engine', a, '#/engines', 'Engines'] : null;
    case 'paths': return a && a !== 'review' && !has(PATHS, a) ? ['path', a, '#/paths', 'Learning paths'] : null;
    case 'play': return a !== 'stats' && !has(PATHS, a) ? ['path', a || '', '#/paths', 'Learning paths'] : null;
    case 'checklists': return a && !has(CHECKLISTS, a) ? ['checklist', a, '#/checklists', 'Checklists'] : null;
    case 'prompts': return a && !has(PROMPT_TEMPLATES, a) ? ['prompt', a, '#/prompts', 'Prompts'] : null;
    case 'build': return a && !TOOLS.some(t => t[0] === a) ? ['build tool', a, '#/build', 'Build tools'] : null;
    case 'experience': {
      const ix = ['#/experience', 'Projects'];
      if(!a) return null;
      const cs = CASE_STUDIES.find(x => x.id === a);
      if(!cs) return ['project', a, ...ix];
      const back = ['#/experience/' + cs.id, cs.t];
      if(!b || ['workflows', 'interview', 'overview'].includes(b)) return null;
      if(b === 'flow') return c && !has(cs.flows || [], c) ? ['workflow', c, ...back] : null;
      const sys = (cs.systems || []).find(x => x.id === b);
      if(!sys) return ['system', b, ...back];
      return c && !has(sys.parts || [], c) ? ['part', c, '#/experience/' + cs.id + '/' + sys.id, sys.t] : null;
    }
  }
  return null;
}
function notFoundHTML([kind, id, href, label]){
  return `<h1>Not found</h1><p>There is no ${esc(kind)} called '${esc(id)}'.</p>
    <p><a class="btn" href="${esc(href)}">Back to ${esc(label)}</a> <a class="btn ghost" href="#/index">All pages</a></p>`;
}
function mapOnly(parts){
  if(missing(parts)) return false;
  const [v, a, b, c] = parts;
  if(!v || v === 'map') return !a || a === 'home' || a === 'd';
  if(v === 'experience' && a && b && !c) return !['workflows', 'interview', 'flow', 'overview'].includes(b);
  return false;
}
// A topic, domain or smell page is read beside the map; the reader can fold the
// map away to give the text the whole width (see .shell.nomap).
const mapReading = parts => (parts[0] === 'map' && ['t', 'd', 's'].includes(parts[1])) || parts[0] === 'topic';
// A path's own page keeps its map, but folds the rail and gives the reading pane the topic page's width (audit N3).
const isPathPage = parts => parts[0] === 'paths' && !!parts[1] && parts[1] !== 'review';
// Views with nothing on the map use the work layout (see .shell.work).
function usesMap(parts){
  const [v, a] = parts;
  if(missing(parts)) return false;
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
let lastRouteKey = null, booted = false, afterRoute = null;
/* The long text of a topic, game, path, project, guide or comparison is in its
   own file (86-content.js). A route first loads what it shows, then draws; a
   reader who moves on before the file arrives is not dragged back. */
function contentNeeds(parts){
  const [v, a, b] = parts;
  const every = (kind, list) => list.map(x => [kind, x.id]);
  switch(v){
    case 'map': return a === 't' && b ? [['topic', b]] : a === 's' && b ? [['smell', b]] : [];
    case 'smell': return a ? [['smell', a]] : [];
    case 'diagnose': return a === 'smells' && b ? [['smell', b]] : [];
    case 'checklists': return a ? [['checklist', a]] : every('checklist', CHECKLISTS);
    case 'prompts': case 'playtest': return a && v === 'prompts' ? [['prompt', a]] : every('prompt', PROMPT_TEMPLATES);
    case 'explore': return a && DOMAIN_DIAGRAMS[a] ? [['topic', DOMAIN_DIAGRAMS[a]]] : [];
    case 'games': return a === 'compare' ? (b ? [['compare', b]] : []) : a && a !== 'topic' ? [['game', a]] : [];
    case 'paths': return a && a !== 'review' ? [['path', a]] : [];
    case 'experience': return a ? [['case', a]] : [];
    case 'platforms': return a ? [['platform', a]] : [];
    case 'engines': return a ? [['engine', a]] : [];
    case 'ai': return a === 'philosophy' ? [['topic', 'bottleneck-shift']] : [];
    case 'sources': return [['file', 'cited']];
    // a tool's code loads with the first tool opened (manifest LAZY); the dissection
    // tool also shows each saved comparable's long fields (engines, lesson)
    case 'build': return !a ? [] : [['code', 'tools'], ...(a === 'dissect' ? (store.get('dissectTool', {}).comps || []).filter(c => c && REFERENCE_GAMES.some(g => g.id === c.id)).map(c => ['game', c.id]) : [])];
    case 'lab': return [['code', 'lab']];
    // the path game: its code, and the path's steps and checkpoint questions
    case 'play': return a === 'stats' ? [['code', 'rpg']] : [['code', 'rpg'], ['path', a]];
  }
  return [];
}
let routeSeq = 0, routePending = false, routedHash = null;
// For tests and tools: resolves once the page for the current address is drawn,
// including a hash change whose event has not fired yet.
const settled = () => new Promise(res => { const check = () => routedHash === location.hash && !routePending ? res() : setTimeout(check, 10); check(); });
function route(){
  const seq = ++routeSeq, at = location.hash; routedHash = null;
  const parts = (location.hash.replace(/^#\/?/, '') || 'map').split('/').filter(Boolean);
  const needs = missing(parts) ? [] : contentNeeds(parts).filter(([k, id]) => !PlayableContent.has(k, id));
  routePending = true;
  const finish = () => { if(seq !== routeSeq) return; routePending = false; routedHash = at; };   // a redirect while drawing leaves the next route to settle
  if(!needs.length){ drawRoute(); finish(); return; }
  const slow = setTimeout(() => { if(seq === routeSeq) setView(`<p class="dim" role="status">Loading…</p>`); }, 150);
  // draw only if the address is still the one this route loaded for: a new hash can be
  // set before its hashchange event runs, and that route will draw itself
  PlayableContent.needAll(needs).then(() => { clearTimeout(slow); if(seq === routeSeq && location.hash === at){ drawRoute(); finish(); } }, err => {
    clearTimeout(slow); if(seq !== routeSeq) return;
    console.warn(err);
    setView(`<h1>This page could not be loaded</h1><div class="callout"><p>Its content file did not arrive. If you are offline, the pages you have opened before still work.</p><p><button type="button" class="btn sm" data-action="reload-page">Try again</button></p></div>`);
    finish();
  });
}
function drawRoute(){
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
  $$('#primaryNav button[data-group]').forEach(b => { const on = !!group && b.dataset.group === group.id; b.classList.toggle('active', on); if(on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  $('#navMore').classList.toggle('active', !!group && NAV.indexOf(group) >= NAV_BAR); closeNavMore();
  closeModals(); closeTip();
  syncMapMode(view, parts[1]);
  // the pane's open state for this route is set before the view draws, so the map
  // knows whether the pane will cover it (renderTree); showPaneFor below syncs the rest
  ensureShell(); if(isNarrow()) $('#pane').classList.toggle('open', !mapOnly(parts));
  drawView(view, parts);
  rememberPage();
  $("#shell").classList.toggle("work", !usesMap(parts));
  $("#shell").classList.toggle("reading", mapReading(parts) || isPathPage(parts));
  // On a topic page the map is folded away until the reader asks for it. Once shown it
  // takes the place of the concept index (one click back), so no node is cut.
  const sh = $("#shell"), reading = mapReading(parts), hideIt = reading && mapHidden();
  sh.classList.toggle("nomap", hideIt);
  if((reading || isPathPage(parts)) && !hideIt && !isNarrow()){ if(!sh.classList.contains('hide-left')){ sh.classList.add('hide-left'); sh.dataset.autofold = '1'; } }
  else if(sh.dataset.autofold){ delete sh.dataset.autofold; if(!store.get('hideLeft')) sh.classList.remove('hide-left'); }
  showPaneFor(parts);
  const key = routeKey(parts), samePage = key === lastRouteKey;
  lastRouteKey = key;
  // The first render keeps the browser's own focus; later ones move it.
  if(booted) placeFocus(parts, samePage);
  booted = true;
  if(afterRoute){ const f = afterRoute; afterRoute = null; f(); }
  const h1 = $('#pane .view h1'), t = h1 && h1.textContent.trim();
  if(t) document.title = t + ' · Playable';
  if(restoreScroll){ const r = restoreScroll; restoreScroll = null; applyScroll(r); requestAnimationFrame(() => applyScroll(r)); }
}
/* Back and Forward restore the scroll the page had. The position (window and
   pane, since which one scrolls depends on the layout) is kept in history.state
   as the reader scrolls; a new navigation still starts at the top. */
let restoreScroll = null, scrollT = 0;
const applyScroll = r => { window.scrollTo({ top: r.sy || 0 }); $('#pane').scrollTop = r.py || 0; };
if('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('scroll', () => {
  if(scrollT) return;
  scrollT = setTimeout(() => { scrollT = 0; try { history.replaceState(Object.assign({}, history.state, { sy: window.scrollY, py: $('#pane').scrollTop }), ''); } catch(e){} }, 120);
}, { capture: true, passive: true });
window.addEventListener('popstate', e => { restoreScroll = e.state && typeof e.state.sy === 'number' ? e.state : null; setTimeout(() => { restoreScroll = null; }, 500); });
// The last pages this browser visited, for the empty search box: a capped,
// per-browser convenience, keyed by route.
function rememberPage(){
  const h1 = $('#pane .view h1'), crumb = $('#pane .view .crumbs'); if(!h1 || /^#\/index/.test(location.hash)) return;
  const list = recentPages().filter(r => r.href !== location.hash);
  list.unshift({ href: location.hash, t: h1.textContent.trim(), snip: crumb ? crumb.textContent.replace(/\s*›\s*/g, ' › ').trim() : '' });
  store.set('recent', list.slice(0, 8));
}
function drawView(view, parts){
  const nf = missing(parts);
  try { if(nf) return setView(notFoundHTML(nf)); return render(view, parts); }
  catch(err){
    console.error(err);
    setView(`<h1>This page could not be drawn</h1><div class="callout"><p>This page could not be drawn, probably because of saved data from an older version.</p>
      <div class="row"><button type="button" class="btn sm" data-action="data-export">Back up progress</button><button type="button" class="btn sm ghost danger" data-action="data-reset">Reset all</button></div></div>`);
  }
}
function render(view, parts){
  switch(view){
    case 'paths': return renderPaths(parts[1], parts[2]);
    case 'map': return renderMap(parts[1], parts[2], parts[3]);
    case 'lab': renderLab(); return addMakeJobs();
    case 'play': return renderRpg(parts[1]);
    case 'explore': return renderExplore(parts[1]);
    case 'concepts': return renderConcepts();
    case 'glossary': return renderGlossary(parts[1]);
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
    case 'games': return renderGames(parts[1], parts[2]);
    case 'platforms': return renderPlatforms(parts[1]);
    case 'engines': return renderEngines(parts[1]);
    case 'guide': return renderGuide();
    case 'index': return renderIndex();
    default: return renderIndex(view);
  }
}
window.addEventListener('hashchange', route);
// On a phone a long group name shows its short form; the accessible name stays whole.
// On a phone the first five sections sit in the bar and the rest open from "More",
// so every label is whole and nothing is clipped.
const NAV_BAR = 5;
$('#primaryNav').innerHTML = NAV.map((g, i) => `<button type="button" data-group="${g.id}" data-href="#/${g.views[0][0]}"${i >= NAV_BAR ? ' class="nav-extra"' : ''}>${g.t}</button>`).join('') + '<button type="button" class="nav-morebtn" id="navMore" data-action="nav-more" aria-haspopup="true" aria-expanded="false">More</button>';
const closeNavMore = () => { $('#primaryNav').classList.remove('more-open'); $('#navMore').setAttribute('aria-expanded', 'false'); };
ACTIONS['nav-more'] = el => { const on = $('#primaryNav').classList.toggle('more-open'); el.setAttribute('aria-expanded', on); };
document.addEventListener('click', e => { if(!e.target.closest('#navMore')) closeNavMore(); });
$('#brandBtn').onclick = () => go('#/map');
$('#railToggle').onclick = () => { const r = $('#rail'); if(r){ r.classList.toggle('open'); syncScrim(); } };

/* ---------- persistent shell: index (left) + mind map (centre) + content (right) ---------- */
let SHELL = false;
function ensureShell(){
  if(SHELL) return;
  app.innerHTML = `<div class="shell" id="shell">
    <nav class="rail" id="rail" aria-label="Index"></nav>
    <div class="splitter" id="splitL" title="Drag to resize"></div>
    <section class="mapstage" id="mapstage" aria-label="Map"><h1 class="sr-only" id="mapH1" hidden>Map</h1>
      <div class="mapbar"><div class="mapcrumbs"></div>
        <div class="mapfind"><input type="search" id="mapFind" placeholder="Find in map" aria-label="Find in map" aria-describedby="mapFindN" autocomplete="off" spellcheck="false"><span class="mapfind-n" id="mapFindN"></span></div>
        <div class="row mapctl" style="gap:4px">
        <a class="btn sm mapnext" id="mapNext" href="#/map" hidden>Next unread</a>
        <button type="button" class="btn sm ghost" id="mapLegendBtn" aria-expanded="false" aria-controls="maplegend" title="What the colours, marks and lines mean">Legend</button>
        <div class="lens-switch mapviewsw" id="mapPhoneView" role="group" aria-label="Phone map view"><button type="button" data-view="map" aria-pressed="true">Map</button><button type="button" data-view="list" aria-pressed="false">List</button></div>
        <button type="button" class="btn sm ghost" id="mapZoomOut" title="Zoom out" aria-label="Zoom out">−</button>
        <button type="button" class="btn sm ghost" id="mapZoomIn" title="Zoom in" aria-label="Zoom in">+</button>
        <button type="button" class="btn sm ghost" id="mapFit" title="Fit the map" aria-label="Fit map">⤢<span class="btn-long"> fit</span></button>
        <button type="button" class="btn sm ghost" id="mapResetDrag" title="Reset dragged nodes to the tidy layout" aria-label="Reset layout">↺</button>
        <button type="button" class="btn sm ghost" id="mapResetDefault" title="Reset the map to the default overview" aria-label="Reset map to the overview">⟲</button>
        <button type="button" class="btn sm ghost mapbtn-left" id="collapseLeft" title="Toggle index">⟨ index</button>
        <button type="button" class="btn sm ghost mapbtn-right" id="collapseRight" title="Toggle content">content ⟩</button>
      </div></div>
      <div class="maplegend-panel kgraph" id="maplegend" hidden></div>
      <div class="mapwrap" id="mapwrap"><svg class="kgraph" id="mapsvg" viewBox="0 0 1200 800" role="tree" tabindex="-1" aria-label="Mind map. Tab into it, move with the arrow keys, Right and Left open and close, Enter opens."></svg><div class="mapoutline" id="mapoutline" role="tree" aria-label="Map outline. Move with the arrow keys, Right and Left open and close, Enter opens."></div><div class="maptip" id="maptip" hidden></div><div class="mapmore" id="mapmore"></div></div>
      <div class="mapfoot-live" id="maplive" role="status" aria-live="polite" aria-atomic="true"></div>
    </section>
    <div class="splitter" id="splitR" title="Drag to resize"></div>
    <main class="pane" id="pane"></main>
  </div><div class="scrim" id="scrim"></div><button type="button" class="drawer-close" id="drawerClose" aria-label="Close panel">✕</button>`;
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
    const startRail = $('#rail').getBoundingClientRect().width || 300;
    const startPane = $('#pane').getBoundingClientRect().width || 460;
    const move = ev => { if(which === 'L'){ const w = Math.max(200, Math.min(560, startRail + (ev.clientX - startX))); shell.style.setProperty('--railW', w + 'px'); store.set('railW', w); } else { const w = Math.max(300, Math.min(820, startPane - (ev.clientX - startX))); shell.style.setProperty('--paneW', w + 'px'); store.set('paneW', w); } };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  });
  dragSplit($('#splitL'), 'L'); dragSplit($('#splitR'), 'R');
  const scrim = $('#scrim');
  // The drawers are layers: whichever opened last sits on top, and the close
  // button (or a tap on the scrim) closes only that one, like going back.
  const drawerOrder = [];
  // A closed drawer is inert (no Tab stop, no reading order); opening one moves focus
  // into it and closing it hands focus back to the control that opened it.
  const openers = new Map();
  // Only a change of the open state moves a drawer in the order: other class changes
  // (the pane's "nopill") must not lift the pane above a rail drawer opened after it.
  const wasOpen = new WeakMap();
  const trackDrawer = el => new MutationObserver(() => {
    const isOpen = el.classList.contains('open');
    if(wasOpen.get(el) === isOpen) return;
    wasOpen.set(el, isOpen);
    const i = drawerOrder.indexOf(el); if(i >= 0) drawerOrder.splice(i, 1);
    if(isOpen) drawerOrder.push(el);
    syncInert();
    if(isNarrow()){
      if(isOpen && !el.contains(document.activeElement)){
        const op = document.activeElement; if(op && op !== document.body) openers.set(el, op);
        if(el.id === 'rail') (el.querySelector('#railSearch') || el.querySelector('button, a[href]'))?.focus({ preventScroll: true });
      } else if(!isOpen && openers.has(el)){
        const op = openers.get(el); openers.delete(el);
        const a = document.activeElement;
        if((!a || a === document.body || el.contains(a)) && op.isConnected) op.focus({ preventScroll: true });
      }
    }
    drawerOrder.forEach((d, k) => { d.style.zIndex = isNarrow() ? String(80 + k) : ''; });
  }).observe(el, { attributes: true, attributeFilter: ['class'] });
  [$('#rail'), $('#pane')].forEach(el => { const open = el.classList.contains('open'); wasOpen.set(el, open); if(open) drawerOrder.push(el); });
  trackDrawer($('#rail')); trackDrawer($('#pane'));
  syncInert();
  const closeTopDrawer = () => { const top = drawerOrder[drawerOrder.length - 1]; if(top) top.classList.remove('open'); syncScrim(); };
  scrim.onclick = closeTopDrawer;
  $('#drawerClose').onclick = closeTopDrawer;
  $('#collapseLeft').onclick = () => { delete shell.dataset.autofold; if(isNarrow()){ $('#rail').classList.toggle('open'); } else { const h = shell.classList.toggle('hide-left'); store.set('hideLeft', h); } syncScrim(); };
  $('#collapseRight').onclick = () => { if(isNarrow()){ $('#pane').classList.toggle('open'); } else { const h = shell.classList.toggle('hide-right'); store.set('hideRight', h); } syncScrim(); };
  // on a phone the route's pane may cover the map: say so before the first draw, so it waits (renderTree)
  if(isNarrow()) $('#pane').classList.toggle('open', !mapOnly(currentParts()));
  renderTree('home');
}
function railHTML(activeDom, activeTopic){
  const openSet = new Set(store.get('sideOpen', [])); if(activeDom) openSet.add(activeDom);
  const lens = currentLens()[0];
  return `<div class="railhead">
      ${lensSwitchHTML()}
      <a class="railgraph" href="#/concepts">⌘ Concept index</a>
      <input type="text" class="railsearch" id="railSearch" placeholder="Jump to a concept…" autocomplete="off">
    </div>
    <div class="raillist">${DOMAINS.filter(d => d.lens === lens).map(d => { const isOpen = openSet.has(d.id); return `<div class="raildom ${isOpen?'open':''}" data-dom="${d.id}" style="--dc:${d.color}">
      <button type="button" class="raildom-btn"><span class="rdot"></span><span class="rt">${esc(d.t)}</span><span class="rn">${d.topics.filter(t=>seen.has(t)).length}/${d.topics.length}</span></button>
      <div class="railtopics">${d.topics.map(t => `<button type="button" class="railtopic ${t===activeTopic?'active':''} ${seen.has(t)?'seen':''}" data-topic="${t}">${esc(TOPICS[t].t)}</button>`).join('')}</div></div>`; }).join('')}
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
      <button type="button" class="raildom-btn" data-sys="workflows"><span class="rdot"></span><span class="rt">Workflows</span><span class="rn">${flows.length}</span></button>
      <div class="railtopics">${flows.map(f => `<button type="button" class="railtopic ${sysId === 'flow' && f.id === partId ? 'active' : ''}" data-flow="${f.id}">${esc(f.t)}</button>`).join('')}</div></div>` : '';
  return `<div class="railhead">
      <a class="railgraph" href="#/map">← Domains</a>
      <input type="text" class="railsearch" id="railSearch" placeholder="Jump to a part…" autocomplete="off">
    </div>
    <div class="railprojects"><span class="railtitle">Projects</span>${CASE_STUDIES.map(x => `<a class="railproj ${x.id === c.id ? 'active' : ''}" href="#/experience/${x.id}">${esc(x.t)}</a>`).join('')}</div>
    <div class="raillist">${flowGroup}${systems.map(s => `<div class="raildom ${s.id === sysId ? 'open' : ''}" data-dom="${s.id}" style="--dc:${kindColor(s.kind)}">
      <button type="button" class="raildom-btn" data-sys="${s.id}"><span class="rdot"></span><span class="rt">${esc(s.t)}</span><span class="rn">${(s.parts || []).length}</span></button>
      <div class="railtopics">${(s.parts || []).map(p => `<button type="button" class="railtopic ${p.id === partId ? 'active' : ''}" data-sys="${s.id}" data-part="${p.id}">${esc(p.t)}</button>`).join('')}</div></div>`).join('')}
    </div>
    ${systems.length ? '' : '<div class="empty">No systems written for this project yet.</div>'}`;
}
// The rail in path mode lists the paths, by track, with the open one marked.
// The path's own stages and steps are shown once, in the stage view.
function railPathHTML(pth){
  return `<div class="railhead">
      <a class="railgraph" href="#/paths">← All paths</a>
      <input type="text" class="railsearch" id="railSearch" placeholder="Jump to a path…" autocomplete="off">
    </div>
    <div class="raillist">${TRACKS.map(([tid, tlabel]) => { const list = PATHS.filter(p => p.track === tid); if(!list.length) return '';
      return `<div class="raildom open" data-dom="track-${tid}" style="--dc:var(--accent2)">
      <button type="button" class="raildom-btn"><span class="rdot"></span><span class="rt">${esc(tlabel)}</span><span class="rn">${list.length}</span></button>
      <div class="railtopics">${list.map(p => `<button type="button" class="railtopic ${p.id === pth.id ? 'active' : ''}" data-path="${p.id}" ${p.id === pth.id ? 'aria-current="page"' : ''}>${esc(p.t)}</button>`).join('')}</div></div>`; }).join('')}
    </div>`;
}
function railActive(){
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if(parts[0]==='map'){ if(parts[1]==='t' && TOPICS[parts[2]]) return { dom: TOPICS[parts[2]].d, topic: parts[2] }; if(parts[1]==='d' && DOM[parts[2]]) return { dom: parts[2], topic: null }; }
  if(parts[0]==='topic' && TOPICS[parts[1]]) return { dom: TOPICS[parts[1]].d, topic: parts[1] };
  if(parts[0]==='explore' && DOM[parts[1]]) return { dom: parts[1], topic: null };
  return { dom: null, topic: null };
}
// On a phone the content opens as a full page: no dimmed map behind it, and the
// way out is a labelled "Map" button instead of a round close mark.
const phoneMQ = window.matchMedia('(max-width: 700px)');
// Off-canvas panels are unreachable while closed; wide screens show them in the layout.
function syncInert(){ const railOpen = !!$('#rail') && $('#rail').classList.contains('open'); ['#rail', '#pane'].forEach(s => { const el = $(s); if(el) el.inert = isNarrow() && (!el.classList.contains('open') || (s === '#pane' && railOpen)); }); }
function syncScrim(){
  syncInert();
  // a map drawing deferred while the phone pane covered it is drawn once it can be seen
  if(A.drawPendingMap) A.drawPendingMap();
  const railOpen = $('#rail').classList.contains('open'), paneOpen = $('#pane').classList.contains('open'), narrow = isNarrow();
  $('#scrim').classList.toggle('show', narrow && (railOpen || (paneOpen && !phoneMQ.matches)));
  // With the reading pane closed on a narrow screen the map is the page: it takes the
  // main landmark and a heading; when the pane opens, the pane has both again.
  const mapMain = narrow && !paneOpen, ms = $('#mapstage'), mh = $('#mapH1');
  if(ms){ if(mapMain) ms.setAttribute('role', 'main'); else ms.removeAttribute('role'); }
  if(mh) mh.hidden = !mapMain;
  const dc = $('#drawerClose'); if(!dc) return;
  const page = narrow && paneOpen && !railOpen && phoneMQ.matches;
  // The "Map" pill belongs to pages whose content is part of the map (topics, domains,
  // smells, a project's systems), not to full pages, and not under a path bar.
  const parts = currentParts(), pill = page && (mapReading(parts) || (parts[0] === 'experience' && !!parts[1])) && !$('#pane .pathbar');
  $('#pane').classList.toggle('nopill', page && !pill);
  dc.classList.toggle('show', narrow && (railOpen || (paneOpen && (!page || pill)))); dc.classList.toggle('text', page);
  dc.textContent = page ? '◂ Map' : '✕'; dc.setAttribute('aria-label', page ? 'Back to the map outline' : 'Close panel');
}
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
// What the left column shows outside the map: the list that fits the section
// (engines, Make's tools, Diagnose's symptoms, the checklists), or nothing.
function railSection(p){
  const v = p[0];
  if(v === 'engines') return { id: 'engines', toggle: 'Browse engines' };
  if(v === 'lab' || v === 'build') return { id: 'make', toggle: 'Browse tools' };
  if(v === 'diagnose' || v === 'smell') return { id: 'diagnose', toggle: 'Browse symptoms' };
  if(v === 'checklists') return { id: 'checklists', toggle: 'Browse checklists' };
  return null;
}
function sectionRailHTML(sec, p){
  const link = (href, t, on, sub) => `<a class="railproj ${on ? 'active' : ''}" href="${href}"${on ? ' aria-current="page"' : ''}>${esc(t)}${sub ? `<small class="railsub">${esc(sub)}</small>` : ''}</a>`;
  const group = (title, links) => `<div class="railprojects"><span class="railtitle">${esc(title)}</span>${links.join('')}</div>`;
  const idx = `<div class="railfoot"><a class="railgraph" href="#/map">⌘ Design concept index</a></div>`;
  if(sec.id === 'engines') {
    return [['engine', 'Game engines'], ['web', 'The web stack'], ['tool', 'Tools']].map(([k, t]) => { const xs = ENGINES.filter(e => e.kind === k); return xs.length ? group(t, xs.map(e => link('#/engines/' + e.id, e.t, p[1] === e.id))) : ''; }).join('') + idx;
  }
  if(sec.id === 'make') {
    const cur = p[0] === 'build' ? p[1] : '';
    return group('Ideation', [link('#/lab', 'Idea Lab', p[0] === 'lab', 'Observe, tension, idea card')]) +
      TOOL_GROUPS.map(([gid, t, ids]) => group(t, ids.map(id => { const x = TOOLS.find(y => y[0] === id); return link('#/build/' + id, x[1], cur === id, id === TOOL_START ? 'Start here' : ''); }))).join('') + idx;
  }
  if(sec.id === 'diagnose') {
    const cur = p[0] === 'smell' ? p[1] : p[2];
    return group('What are you seeing?', A.SYMPTOMS.map(([s, id]) => link('#/smell/' + id, s, cur === id))) +
      group('Other diagnostics', [link('#/diagnose/smells', `All ${SMELLS.length} smells`, p[0] === 'diagnose' && (!p[1] || p[1] === 'smells') && !cur), ...DIAGNOSTICS.map(([id, t]) => link('#/diagnose/' + id, t, p[0] === 'diagnose' && p[1] === id))]) + idx;
  }
  return group('Checklists', CHECKLISTS.map(c => link('#/checklists/' + c.id, c.t, (p[1] || CHECKLISTS[0].id) === c.id))) + idx;
}
function updateRail(){
  ensureShell(); const r = $('#rail'); if(!r) return;
  $('#shell').classList.remove('norail');
  const hash =location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
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
    r.innerHTML = railPathHTML(pth);
    r.querySelectorAll('.raildom-btn').forEach(b => b.addEventListener('click', () => b.parentElement.classList.toggle('open')));
    r.querySelectorAll('.railtopic').forEach(b => b.addEventListener('click', () => { go('#/paths/' + b.dataset.path); closeRailDrawer(r); }));
    railFilter(r, '.railtopic');
    return;
  }
  // Outside the map the column shows what fits the section, or collapses
  // (the concept index is still in the drawer on a phone, and on the Map).
  const sec = railSection(hash);
  if(sec){ r.innerHTML = sectionRailHTML(sec, hash); $('#railToggle').title = $('#railToggle').ariaLabel = sec.toggle; return; }
  $('#shell').classList.toggle('norail', !usesMap(hash));
  $('#railToggle').title = 'Browse concepts'; $('#railToggle').ariaLabel = 'Browse concepts';
  const a = railActive(); r.innerHTML = railHTML(a.dom, a.topic);
  r.querySelectorAll('.raildom-btn').forEach(b => b.addEventListener('click', () => { const dom = b.parentElement; dom.classList.toggle('open'); store.set('sideOpen', [...r.querySelectorAll('.raildom.open')].map(x => x.dataset.dom)); }));
  r.querySelectorAll('.railtopic').forEach(b => b.addEventListener('click', () => { go('#/map/t/' + b.dataset.topic); closeRailDrawer(r); }));
  railFilter(r, '.railtopic');
}
// keepScroll is set for one render by an action that re-renders the page the
// reader is on (ticking a step); every other render starts at the top.
let keepScroll = false;
/* ---------- image viewer ---------- */
// Opens a screenshot, header or timeline image as large as the screen
// allows (small files up to 2.5x), keeping a screenshot's numbered callouts
// by cloning its frame, whose markers are placed in percentages.
const ZOOMABLE = '.shotframe img, .entryshot img, .gameart img';
function openLightbox(img){
  const lb = $('#lightbox'), stage = $('.lbstage', lb), frame = img.closest('.shotframe');
  const node = frame ? frame.cloneNode(true) : img.cloneNode(false); stage.replaceChildren(node);
  const big = node.tagName === 'IMG' ? node : node.querySelector('img');
  big.removeAttribute('tabindex'); big.removeAttribute('role'); big.removeAttribute('aria-label'); big.loading = 'eager';
  const fig = img.closest('figure'), cap = fig && fig.querySelector('figcaption');
  $('.lbcap', lb).innerHTML = cap ? cap.innerHTML : esc(img.alt || '');
  const fit = () => { const w = big.naturalWidth || img.naturalWidth, h = big.naturalHeight || img.naturalHeight; if(!w || !h) return;
    const capH = $('.lbcap', lb).offsetHeight + 40, s = Math.min(innerWidth * 0.96 / w, (innerHeight * 0.92 - capH) / h, 2.5);
    big.style.width = Math.round(w * s) + 'px'; big.style.height = 'auto'; };
  openModal('lightbox', '.lbclose'); if(big.complete) fit(); else big.onload = fit;
}
document.addEventListener('click', e => {
  const img = e.target.closest && e.target.closest(ZOOMABLE); if(img && !img.closest('#lightbox')){ e.preventDefault(); openLightbox(img); return; }
  const lb = e.target.closest && e.target.closest('#lightbox'); if(lb && (e.target === lb || e.target.closest('[data-lbclose]'))) closeModals();
});
document.addEventListener('keydown', e => { if((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches(ZOOMABLE)){ e.preventDefault(); openLightbox(e.target); } });
let pbWatch = null;
// On a phone, once the page is scrolled the path bar shrinks to one line (stage, task, Done);
// tapping the task line, or scrolling back to the top, shows the whole bar again.
const BAR_MINI = 44;
function syncBarCompact(){
  const pane = $('#pane'), bar = $('.pathbar', pane); if(!bar) return;
  const phone = window.matchMedia('(max-width: 700px)').matches, y = pane.scrollTop, on = bar.classList.contains('compact');
  if(y < 20) delete bar.dataset.pinned;
  const want = phone && !bar.dataset.pinned && (on ? y > 20 : y > 90);
  if(want === on) return;
  if(want){ bar.dataset.full = bar.offsetHeight; bar.classList.add('compact'); bar.style.marginBottom = Math.max(14, bar.dataset.full - BAR_MINI + 14) + 'px'; }
  else { bar.classList.remove('compact'); bar.style.marginBottom = ''; }
}
ACTIONS['bar-expand'] = el => { const bar = el.closest('.pathbar'); bar.dataset.pinned = '1'; syncBarCompact(); };
// A wide screen gives a reading page a partner column: `side` is a sticky column
// beside `main` (see .wide2 in the CSS). Blocks the side repeats carry .wdup in the
// main column and are hidden there while the side shows. Under 1600px of pane
// width the side is not shown and the page reads exactly as before.
const wide2 = (main, side, label) => side ? `<div class="wide2"><div class="wmain">${main}</div><aside class="wside" aria-label="${label || 'On this page'}">${side}</aside></div>` : main;
const wideBlock = (title, inner) => inner ? `<div class="wblock">${title ? `<span class="overline">${title}</span>` : ''}${inner}</div>` : '';
const wideJump = items => wideBlock('On this page', `<ol>${items.map(([label, attrs]) => `<li><button type="button" data-action="wide-jump" ${attrs}>${esc(label)}</button></li>`).join('')}</ol>`);
ACTIONS['wide-jump'] = el => {
  const sec = el.dataset.sec && document.querySelector(`.wmain .sec[data-key="${el.dataset.sec}"]`);
  if(sec && !sec.classList.contains('open')) ACTIONS['toggle-sec'](sec.querySelector('.sec-btn'));
  const t = sec || document.getElementById(el.dataset.to); if(t) t.scrollIntoView({ block: 'start' });
};
function setView(html){
  ensureShell(); const pane = $('#pane'), keep = keepScroll, y = window.scrollY, py = pane.scrollTop; keepScroll = false;
  const play = currentParts()[0] === 'play';
  pane.innerHTML = `${play ? '' : pathBarHTML()}${play ? '' : subNavHTML()}<div class="view">${html}</div>`; updateRail();
  // Every picture can be opened larger, by click, tap or keyboard.
  $$(ZOOMABLE, pane).forEach(i => { i.tabIndex = 0; i.setAttribute('role', 'button'); i.setAttribute('aria-label', 'View larger: ' + (i.alt || 'image')); });
  // The sticky path bar's height, so an anchor or lens link lands below it (see #pane [id] in the CSS).
  if(pbWatch) pbWatch.disconnect();
  const bar = $('.pathbar', pane); pane.style.setProperty('--pbH', bar ? bar.offsetHeight + 'px' : '0px');
  if(!pane.dataset.barScroll){ pane.dataset.barScroll = '1'; pane.addEventListener('scroll', syncBarCompact, { passive: true }); }
  if(bar){ pbWatch = new ResizeObserver(() => pane.style.setProperty('--pbH', bar.offsetHeight + 'px')); pbWatch.observe(bar); }
  // A new page starts at its top, in the window and in the pane's own scroll.
  // (only when it is not there already: setting a scroll position forces a layout of the new page)
  if(keep){ window.scrollTo({ top: y }); pane.scrollTop = py; } else { if(y) window.scrollTo({ top: 0 }); if(py) pane.scrollTop = 0; }
}
// The views of the current group, as sub-tabs. The map group shows them on
// its landing views only, not above every domain and topic page.
function subNavHTML(){
  const p = currentParts(), v = p[0] || 'map', g = VIEW_GROUP[v];
  if(!g || g.views.length < 2) return '';
  // a path's own page carries its stages and review count itself (audit N4: less chrome above the h1)
  if(isPathPage(p)) return '';
  const cur = v === 'smell' ? 'diagnose' : v;
  const due = g.id === 'paths' ? reviewDue().length : 0;
  const hidden = mapHidden();
  const toggle = mapReading(p) ? `<button type="button" class="btn sm ghost maptoggle" data-action="toggle-map" aria-pressed="${hidden}">${hidden ? 'Show map' : 'Hide map'}</button>` : '';
  return `<nav class="subnav" aria-label="${esc(g.t)}">${g.views.map(([id, t]) => `<a href="#/${id}"${id === cur ? ' class="active" aria-current="page"' : ''}>${esc(t)}${id === 'review' && due ? ` (${due} due)` : ''}</a>`).join('')}${toggle}</nav>`;
}
function crumbs(items){ return `<div class="crumbs">${items.map((it, i) => (i ? '<span class="sep">›</span>' : '') + (it[1] ? `<button type="button" data-href="${it[1]}">${esc(it[0])}</button>` : `<span>${esc(it[0])}</span>`)).join('')}</div>`; }
function domChip(id){ const d = DOM[id]; return d ? `<span class="chip dom" style="--dc:${d.color}">${esc(d.t)}</span>` : ''; }
/* ---------- reference games: dissections, schematics, credited art ---------- */
function gameArt(g){
  if(!g.img) return '';
  // A game with no store art has an original drawing of ours, and says so.
  if(g.drawn) return `<figure class="gameart"><img src="${g.img}" alt="${esc(g.t)}: an original drawing, not official art" loading="lazy"><figcaption>An original drawing for this guide, not official art: this game has no store page we can credit.</figcaption></figure>`;
  // A header from anywhere but the store carries its own credit.
  if(g.imgCredit) return `<figure class="gameart"><img src="${g.img}" alt="${esc(g.imgCredit.alt || g.t + ': a screenshot')}" loading="lazy"><figcaption>${creditLine(g.imgCredit)}</figcaption></figure>`;
  // A free-licensed image names its licence and where it came from.
  if(g.artLicence) return `<figure class="gameart"><img src="${g.img}" alt="${esc(g.t)}: a screenshot" loading="lazy"><figcaption>Image: ${esc(g.dev)}, ${esc(g.artLicence)}, via <a href="${esc(g.store)}" target="_blank" rel="noopener noreferrer">${esc(g.artSource)}</a>.</figcaption></figure>`;
  return `<figure class="gameart"><img src="${g.img}" alt="${esc(g.t)}: store art" loading="lazy"><figcaption>Store art: ${esc(g.dev)}, from the <a href="${esc(g.store)}" target="_blank" rel="noopener noreferrer">official store page</a>.</figcaption></figure>`;
}
// The library's view and filters are a per-browser convenience.
const libState = () => { const s = store.get('library', { view:'grid', shelf:'', family:'', tag:'', lens:'', topic:'', lensk:'' }); if (s.tag && !GAME_TAGS.includes(s.tag)) s.tag = ''; if (s.shelf && !GAME_SHELVES.some(x => x[0] === s.shelf)) s.shelf = ''; return s; };
// From a game page: open the library showing that game's family.
ACTIONS['lib-family'] = el => store.set('library', Object.assign(libState(), { shelf: '', family: el.dataset.v, tag: '', lens: '', topic: '', lensk: '' }));
ACTIONS['lib-set'] = el => { const s = libState(); s[el.dataset.k] = s[el.dataset.k] === el.dataset.v ? '' : el.dataset.v; if(el.dataset.k === 'view') s.view = el.dataset.v; store.set('library', s); keepScroll = true; renderGames(); };
ACTIONS['lib-more'] = () => { store.set('libMore', !store.get('libMore', false)); keepScroll = true; renderGames(); };
document.addEventListener('change', e => { const el = e.target.closest && e.target.closest('select[data-lib]'); if(!el) return; const s = libState(); s[el.dataset.lib] = el.value; store.set('library', s); keepScroll = true; renderGames(); });
// The games whose lenses name a topic (see gameLinks), as a set of game ids.
const topicGameIds = tid => new Set((gameLinks()[tid] || []).map(x => x.g.id));
// What a game teaches, for the chips at the top of the library: the topics that
// games actually list in their lenses. A topic nearly every game lists (art,
// sound, business model) tells the reader nothing, so those are left out.
function libraryTopics(){
  const n = REFERENCE_GAMES.length;
  return Object.keys(gameLinks()).filter(t => TOPICS[t]).map(t => [t, topicGameIds(t).size]).filter(([, c]) => c >= 6 && c <= n * 0.5).sort((x, y) => y[1] - x[1] || TOPICS[x[0]].t.localeCompare(TOPICS[y[0]].t)).slice(0, 32);
}
const shortTopic = t => TOPICS[t].t.split(/:| and | vs /)[0].trim();
/* ---------- Worked examples (WORKED) and comparisons (COMPARE) ---------- */
const csvCell = v => { const x = String(v); return /[",\n\r]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
function workedFile(w){
  if(w.kind === 'table') return [w.columns.map(c => csvCell(c.unit ? c.h + ' (' + c.unit + ')' : c.h)).join(','), ...w.rows.map(r => r.map(csvCell).join(','))].join('\n') + '\n';
  return ['# ' + w.t, '', w.intro, '', ...w.sections.flatMap(s => ['## ' + s.h, '', s.body, '']), '## Try it', '', ...w.try.map(q => '- ' + q), '', '_' + w.note + '_', ''].join('\n');
}
function workedCard(w, color){
  const table = w.kind === 'table' ? `<div class="tablewrap" tabindex="0" role="region" aria-label="${esc(w.t)}, table"><table class="worked"><caption>${esc(w.t)}</caption><thead><tr>${w.columns.map(c => `<th scope="col">${esc(c.h)}${c.unit ? ` <span class="muted small">(${esc(c.unit)})</span>` : ''}</th>`).join('')}</tr></thead><tbody>${w.rows.map(r => `<tr>${r.map(v => typeof v === 'number' ? `<td class="num">${esc(v)}</td>` : `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
    : w.sections.map(s => `<h4>${esc(s.h)}</h4><p>${esc(s.body)}</p>`).join('');
  const formulas = (w.formulas || []).length ? `<p class="small"><b>How it is worked out.</b></p><ul class="small">${w.formulas.map(f => `<li><b>${esc(f.col)}:</b> ${esc(f.f)}</li>`).join('')}</ul>` : '';
  return `<div class="card worked-card" id="worked-${esc(w.id)}" style="--dc:${color}"><h3 class="h4look">${esc(w.t)}</h3><p class="small dim">${esc(w.intro)}</p>${table}${formulas}<p class="small"><b>Try it.</b></p><ul class="small">${w.try.map(q => `<li>${esc(q)}</li>`).join('')}</ul><p class="small muted">${esc(w.note)}</p><button type="button" class="btn sm" data-action="worked-download" data-topic="${esc(w.topic)}" data-w="${esc(w.id)}">${w.kind === 'table' ? 'Download CSV' : 'Download Markdown'}</button></div>`;
}
function workedHTML(t, color){
  if(!t.worked || !t.worked.length) return '';
  return `<div class="wdup"><div class="section-head"><h2>Worked examples</h2><span class="muted">numbers and documents to copy</span></div>${t.worked.map(w => workedCard(Object.assign({ topic: t.id }, w), color)).join('')}</div>`;
}
ACTIONS['worked-download'] = el => {
  const w = ((TOPICS[el.dataset.topic] || {}).worked || []).find(x => x.id === el.dataset.w); if(!w) return;
  const url = URL.createObjectURL(new Blob([workedFile(w)], { type: w.kind === 'table' ? 'text/csv;charset=utf-8' : 'text/markdown;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = w.file; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const compareCard = c => `<a class="card lnk comparecard" href="#/games/compare/${esc(c.id)}"><div class="overline">${esc(compareTitle(c))}</div><b>${esc(c.t)}</b><p class="small dim" style="margin:6px 0 0">${esc(c.problem)}</p></a>`;
// The comparisons page: one section per shared problem, its pairs in reading order; any comparison not on a shelf follows under More.
function compareShelvesHTML(){
  const placed = new Set(COMPARE_SHELVES.flatMap(s => s.ids)), rest = COMPARISONS.filter(c => !placed.has(c.id));
  const shelf = (t, why, list) => list.length ? `<section class="compareshelf"><div class="section-head"><h2>${esc(t)}</h2></div>${why ? `<p class="dim small" style="max-width:760px;margin-top:0">${esc(why)}</p>` : ''}<ol class="grid auto compareorder">${list.map(c => `<li>${compareCard(c)}</li>`).join('')}</ol></section>` : '';
  return COMPARE_SHELVES.map(s => shelf(s.t, s.why, s.ids.map(id => COMPARISONS.find(c => c.id === id)).filter(Boolean))).join('') + shelf('More', '', rest);
}
function compareShelf(){
  return COMPARISONS.length ? `<div class="section-head"><h2>Two games, one problem</h2><span class="muted"><a href="#/games/compare">${COMPARISONS.length} comparison${COMPARISONS.length === 1 ? '' : 's'}</a></span></div><div class="grid auto">${COMPARISONS.map(compareCard).join('')}</div>` : '';
}
function comparedWith(g){
  const list = COMPARISONS.filter(c => c.games.includes(g.id));
  return list.length ? `<div class="card"><div class="overline">Compared with</div><ul class="small">${list.map(c => { const o = gameById(c.games.find(x => x !== g.id)); return `<li><a href="#/games/compare/${esc(c.id)}">${esc(c.t)}</a>, against <a href="#/games/${esc(o.id)}">${esc(o.t)}</a></li>`; }).join('')}</ul></div>` : '';
}
function renderCompare(id){
  const c = COMPARISONS.find(x => x.id === id);
  if(!c){
    setView(`${crumbs([['Library','#/games'],['Two games, one problem']])}<h1>Two games, one problem</h1><p class="dim" style="max-width:820px">The same design problem, solved two ways. Each comparison sets two reference games side by side, says what each choice costs and gains, and ends with the lesson that carries over.</p>${COMPARISONS.length ? compareShelvesHTML() : '<div class="empty">No comparisons yet.</div>'}`);
    return;
  }
  const [A, B] = c.games.map(gameById);
  const head = g => `<a class="comparehead lnk" href="#/games/${esc(g.id)}">${g.img ? `<img src="${esc(g.card || g.img)}" alt="${esc(g.t)}: header art" loading="lazy">` : ''}<b>${esc(g.t)}</b><span class="small muted">${gameYears(g)} · ${esc(g.genre)}</span></a>`;
  const host = u => new URL(u).hostname.replace(/^www\./, '');
  setView(`${crumbs([['Library','#/games'],['Two games, one problem','#/games/compare'],[c.t]])}<h1>${esc(c.t)}</h1>
    <p class="dim" style="max-width:820px">${esc(c.problem)}</p>
    <div class="compareheads">${head(A)}${head(B)}</div>
    ${c.diagram ? diagramCard(c.diagram) : ""}
    <h2 class="sr-only">Side by side</h2>${c.sections.map(s => `<section class="card comparesec"><h3>${esc(s.h)}</h3><div class="comparecols"><div><div class="overline">${esc(A.t)}</div><p>${esc(s.a)}</p></div><div><div class="overline">${esc(B.t)}</div><p>${esc(s.b)}</p></div></div></section>`).join('')}
    <div class="card"><div class="overline">What each choice costs and gains</div><p>${esc(c.verdict)}</p></div>
    <div class="card sigcard"><div class="overline">The principle to take away</div><p><b>${esc(c.principle)}</b></p></div>
    ${c.topics.length ? `<div class="dgm-foot"><span class="overline">Topics</span><span class="chips">${c.topics.map(t => `<a class="chip lnk" href="#/map/t/${esc(t)}">${esc(TOPICS[t].t)}</a>`).join('')}</span></div>` : ''}
    <p class="small muted">Sources: ${c.sources.map(u => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(host(u))}</a>`).join(' · ')}</p>`);
}
function libraryHTML(){
  const s = libState(), analysed = REFERENCE_GAMES.filter(g => g.lens).length;
  const wantTopics = s.topic ? s.topic.split('+').filter(t => TOPICS[t]) : [];
  const wantIds = new Set(wantTopics.flatMap(t => [...topicGameIds(t)]));
  const pick = g => (!s.shelf || onShelf(g, s.shelf)) && (!s.family || g.family === s.family) && (!s.tag || (g.tags || []).includes(s.tag)) && (!s.lens || !!g.lens) && (!wantTopics.length || wantIds.has(g.id)) && (!s.lensk || !!(g.lens && g.lens[s.lensk] && !g.lens[s.lensk].na));
  const shelves = GAME_SHELVES.filter(([id]) => REFERENCE_GAMES.some(g => onShelf(g, id)));
  const list = REFERENCE_GAMES.filter(pick);
  const btn = (k, v, t, on) => `<button type="button" class="chip lnk ${on ? 'on' : ''}" data-action="lib-set" data-k="${k}" data-v="${esc(v)}" aria-pressed="${!!on}">${esc(t)}</button>`;
  const usedTags = GAME_TAGS.filter(t => REFERENCE_GAMES.some(g => (g.tags || []).includes(t)));
  const deepLenses = REFERENCE_GAMES.some(g => g.lens) ? [['analysed', 'Analysed through ten lenses']] : [];
  const card = x => `<a class="refcard lnk" href="#/games/${x.id}">${x.img ? `<div class="refart"><img src="${x.card || x.img}" alt="" loading="lazy"${!x.card && x.cardPos ? ` style="object-position:${esc(x.cardPos)}"` : ''}></div>` : `<div class="tile">${esc(x.t)}</div>`}<div class="meta"><b>${esc(x.t)}</b><small>${gameYears(x)} · ${esc(x.kind === 'series' ? 'series · ' + x.genre : x.genre)}</small><div class="want">${esc(x.signature ? x.signature.idea : x.want)}</div></div></a>`;
  const grid = xs => `<div class="reflib">${xs.map(card).join('')}</div>`;
  const body = !list.length ? '<div class="empty">No game matches these filters.</div>'
    : s.view === 'list' ? `<div class="tablewrap"><table class="reflist"><thead><tr><th>Game</th><th>Year</th><th>Family</th><th>The idea worth stealing</th></tr></thead><tbody>${list.map(x => `<tr><td><a href="#/games/${x.id}">${esc(x.t)}</a></td><td>${gameYears(x)}</td><td>${esc(familyLabel(x.family))}</td><td>${esc(x.signature ? x.signature.idea : x.want)}</td></tr>`).join('')}</tbody></table></div>`
    : s.family || s.shelf ? grid(list)
    : GAME_FAMILIES.map(([f, label]) => { const xs = list.filter(x => x.family === f); return xs.length ? `<div class="section-head"><h2>${esc(label)}</h2><span class="muted">${xs.length}</span></div>${grid(xs)}` : ''; }).join('');
  const topics = libraryTopics();
  // One row of the most common topics, the rest behind "More topics"; a chosen topic always shows.
  const moreOpen = store.get('libMore', false), LIB_TOPICS_SHOWN = 8;
  const shownTopics = moreOpen ? topics : topics.filter(([t], i) => i < LIB_TOPICS_SHOWN || t === s.topic);
  const sel = (k, label, opts, cur) => `<label class="libsel"><span class="overline">${label}</span><select data-lib="${k}" aria-label="${label}"><option value="">Any</option>${opts.map(([v, t]) => `<option value="${esc(v)}"${cur === v ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></label>`;
  const teaches = `<div class="librow libteach"><span class="overline">What it teaches</span><span class="chips libscroll">${wantTopics.length > 1 ? btn('topic', s.topic, 'Topics of one smell (clear)', true) : ''}${shownTopics.map(([t, c]) => btn('topic', t, `${shortTopic(t)} ${c}`, s.topic === t)).join('')}${topics.length > LIB_TOPICS_SHOWN ? `<button type="button" class="chip lnk libmore" data-action="lib-more" aria-expanded="${moreOpen}">${moreOpen ? 'Fewer topics' : `More topics (${topics.length - shownTopics.length})`}</button>` : ''}</span></div>`;
  return `${crumbs([['Library','#/games'],['Reference games']])}<h1>Reference games</h1><p class="dim libintro" style="max-width:820px">${REFERENCE_GAMES.length} games that succeeded or broke the mould, taken apart with one template${analysed === REFERENCE_GAMES.length ? ', each read through ten lenses, from UI and art direction to business and lineage' : analysed ? `; ${analysed} of them read through ten lenses, from UI and art direction to business and lineage` : ''}. Schematics are our own drawings; store art and screenshots are credited to their developers.</p>
    ${compareShelf()}
    ${teaches}
    <div class="libbar"><span class="libview">${btn('view', 'grid', 'Grid', s.view !== 'list')}${btn('view', 'list', 'List', s.view === 'list')}</span>${sel('lensk', 'Read by lens', GAME_LENSES.map(([k, t]) => [k, t]), s.lensk)}${shelves.length ? sel('shelf', 'Shelf', shelves.map(([id, t]) => [id, t]), s.shelf) : ''}${sel('family', 'Genre', GAME_FAMILIES.filter(([f]) => REFERENCE_GAMES.some(g => g.family === f)).map(([f, t]) => [f, t]), s.family)}</div>
    <details class="libfilters" ${s.tag || s.lens ? 'open' : ''}><summary>Filter by tag, or show only games analysed in depth</summary><div class="chips">${usedTags.map(t => btn('tag', t, t, s.tag === t)).join('')}</div>${deepLenses.length ? `<div class="chips" style="margin-top:6px">${deepLenses.map(([k, t]) => btn('lens', k, t, s.lens === k)).join('')}</div>` : ''}</details>
    <p class="small muted">${list.length} of ${REFERENCE_GAMES.length} games</p>${body}`;
}
// A screenshot attached to a lens: numbered callouts over the image, the
// caption naming what to look at, and the developer's credit.
// One credit line for every image: a publisher's store screenshot, a
// free-licensed image named with its licence and source, or our schematic.
function creditLine(c){
  if(c.licence === 'own') return 'Our own schematic, not a screenshot.';
  const link = (label) => c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>` : esc(label);
  if(c.licence === 'capture') return `Screen capture of ${esc(c.author || 'the publisher')}’s game, via ${link(c.source || 'source')}.`;
  if(c.licence === 'press') return `Press screenshot: ${esc(c.author || 'the publisher')}, via ${link(c.source || (() => { try { return new URL(c.url).hostname.replace(/^www./, ''); } catch(e) { return 'source'; } })())}.`;
  if(c.licence === 'store') return `Screenshot: ${esc(c.author || 'the developer')}, from the ${link('official store page')}.`;
  let host = c.source || ''; if(!host && c.url){ try { host = new URL(c.url).hostname.replace(/^www\./, ''); } catch(e) {} }
  return `Image: ${esc(c.author)}, ${esc(c.licence)}${c.changed ? ', cropped' : ''}, via ${link(host || 'source')}.`;
}
function shotHTML(g, s){
  const co = s.callouts || [];
  const credit = s.credit || { author: g.dev, url: g.store, licence: 'store' };
  return `<figure class="shot"><div class="shotframe"><img src="${esc(s.img)}" alt="${esc(s.alt)}" loading="lazy">${co.map((c, i) => `<span class="calloutdot" style="left:${c.x * 100}%;top:${c.y * 100}%" aria-hidden="true">${i + 1}</span>`).join('')}</div>
    <figcaption>${esc(s.caption)}${co.length ? `<ol class="calloutlist">${co.map(c => `<li>${esc(c.t)}</li>`).join('')}</ol>` : ''}<span class="small muted"> ${creditLine(credit)}</span></figcaption></figure>`;
}
function lensesHTML(g, openLens){
  if(!g.lens) return '';
  const topicChips = (l, k) => `<span class="chips">${lensTopics(l, k).filter(t => TOPICS[t]).map(t => `<a class="chip lnk" href="#/map/t/${t}">${esc(TOPICS[t].t)}</a>`).join('')}</span>`;
  const shots = k => (g.shots || []).filter(s => s.lens === k).map(s => shotHTML(g, s)).join('');
  // Each lens is an argument. The page shows each one's name and claim, the
  // argument opens on request (all ten open made a game page fifteen screens of
  // prose): the evidence (with any screenshot), how it works, what it does to
  // the player, how it compares, what it costs, and the lesson that travels.
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch(e){ return u; } };
  const src = l => (l.sources || []).length ? `<details class="lenssrc small"><summary>Sources (${l.sources.length})</summary><ul>${l.sources.map(u => `<li><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(host(u))}</a></li>`).join('')}</ul></details>` : '';
  const part = (label, v, extra) => v ? `<dt>${label}</dt><dd>${esc(v)}${extra || ''}</dd>` : '';
  const keys = GAME_LENSES.filter(([k]) => g.lens[k]);
  return `<div class="section-head"><h2>Through ten lenses</h2><span class="muted">each a claim you can dispute, then its evidence, mechanism, effect, comparison, cost and principle</span></div>
    <div class="row lensbar"><nav class="lensnav chips" aria-label="Lenses">${keys.map(([k, label]) => `<button type="button" class="chip lnk" data-action="lens-jump" data-lens="${k}">${esc(label)}</button>`).join('')}</nav><button type="button" class="btn sm ghost" data-action="lens-all">Open all</button></div>
    ${keys.map(([k, label]) => { const l = g.lens[k]; return `<details class="card lenscard" id="lens-${k}"${k === openLens ? ' open' : ''}>
      <summary><h3 class="lenshead">${esc(label)}</h3>${l.na ? `<span class="lensclaim muted">Does not apply here: open to read why.</span>` : `<span class="lensclaim">${esc(l.claim)}</span>`}</summary>
      ${l.na ? `<p>${esc(l.na)}</p>` : `<dl class="lensparts">${part('Evidence', l.evidence, shots(k))}${part('How it works', l.mechanism)}${part('What it does to the player', l.effect)}${part('Compared with', l.compare)}${part('The cost', l.cost)}${part('Context', l.context)}</dl>
      ${l.principle ? `<p class="steal"><b>Principle.</b> ${esc(l.principle)}</p>` : ''}`}
      ${topicChips(l, k)}${src(l)}</details>`; }).join('')}`;
}
// A compact contents strip under the summary: each lens is a link that opens the page on it.
const lensContents = g => `<nav class="lensnav chips lenscontents wdup" aria-label="Lenses on this page"><span class="small muted">Jump to</span>${GAME_LENSES.filter(([k]) => g.lens[k]).map(([k, label]) => `<a class="chip lnk" href="#/games/${g.id}/${k}">${esc(label)}</a>`).join('')}</nav>`;
ACTIONS['lens-jump'] = el => { const c = document.getElementById('lens-' + el.dataset.lens); if(c){ c.open = true; c.scrollIntoView({ block: 'start' }); } };
ACTIONS['lens-all'] = el => { const all = $$('#pane details.lenscard'), open = !all.every(d => d.open); all.forEach(d => { d.open = open; }); el.textContent = open ? 'Close all' : 'Open all'; };
function signatureHTML(g){
  const s = g.signature; if(!s) return '';
  return `<section class="card sigcard"><div class="overline">The idea worth stealing</div><h2>${esc(s.idea)}</h2>${SIGNATURE_PARTS.map(([k, label]) => `<h3 class="h4look">${esc(label)}</h3><p>${esc(s[k])}</p>`).join('')}</section>`;
}
// Series pages list their entries (linking any analysed on its own) and say
// what the formula keeps and changes; a game in a series links back to it.
function seriesHTML(g){
  if(g.kind === 'series') return `<div class="card seriescard"><h2 class="overline">The series, entry by entry</h2><ol class="serieslist${g.entries.some(e => e.shot) ? ' withshots' : ''}">${g.entries.map(e => `<li>${e.shot ? `<figure class="entryshot"><img src="${esc(e.shot.img)}" alt="${esc(e.shot.alt)}" loading="lazy"><figcaption class="small muted">${creditLine(e.shot.credit)}</figcaption></figure>` : (g.entries.some(x => x.shot) ? entryRefArt(e) || '<div></div>' : '')}<div><b>${e.ref ? `<a href="#/games/${e.ref}">${esc(e.t)}</a>` : esc(e.t)}</b> <span class="muted small">${e.year} · ${esc(e.platform)}</span><br>${esc(e.added)}${e.ref ? ' <span class="small muted">(analysed on its own page)</span>' : ''}</div></li>`).join('')}</ol>
    <h3 class="h4look">What stays constant</h3><p>${esc(g.constant)}</p><h3 class="h4look">What changes</h3><p>${esc(g.changed)}</p></div>${receptionHTML(g)}`;
  if(!g.series) return '';
  const S = REFERENCE_GAMES.find(x => x.kind === 'series' && x.id === g.series.id);
  return `<p class="small seriesnote">Part of ${S ? `<a href="#/games/${S.id}">${esc(g.series.t)}</a>` : esc(g.series.t)}: ${esc(g.series.n)}.</p>`;
}
// Hits and misses: entries built on the same core game, how each was
// received, what it did differently, and the lesson across them.
// A series entry analysed on its own page lends that page's header art to the timeline.
function entryRefArt(e){
  const r = e.ref && REFERENCE_GAMES.find(x => x.id === e.ref); if(!r || !r.img) return '';
  const credit = r.imgCredit || { author: r.dev, url: r.store, licence: 'store' };
  return `<figure class="entryshot"><a href="#/games/${esc(r.id)}"><img src="${esc(r.img)}" alt="${esc(r.t)}: header art from its own page in this library" loading="lazy"></a><figcaption class="small muted">${creditLine(credit)}</figcaption></figure>`;
}
function receptionHTML(g){
  if(!(g.reception || []).length) return '';
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } };
  const verdict = v => RECEPTION_VERDICTS.find(x => x[0] === v) || [v, v, ''];
  return `<div class="card receptioncard"><div class="overline">Hits and misses</div><p class="small muted" style="margin:4px 0 10px">The same core game, received differently: which entries landed, which did not, and what each did to earn it.</p>
    ${g.reception.map(r => { const [, label, cls] = verdict(r.verdict); return `<div class="recitem"><div class="rechead"><b>${r.ref ? `<a href="#/games/${esc(r.ref)}">${esc(r.entry)}</a>` : esc(r.entry)}</b> <span class="muted">${r.year}</span> <span class="chip ${cls}">${esc(label)}</span></div>
      <p class="small"><b>How it was received.</b> ${esc(r.evidence)}</p><p class="small"><b>What it did differently.</b> ${esc(r.why)}</p>
      <div class="small muted">Sources: ${r.src.map(u => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(host(u))}</a>`).join(' · ')}</div></div>`; }).join('')}
    <h3 class="h4look">What the difference teaches</h3><p>${esc(g.receptionLesson)}</p></div>`;
}
function renderGames(id, lensId){
  if(id === 'compare') return renderCompare(lensId);
  // #/games/topic/<id> (or <id>+<id>) opens the library on the games that teach it.
  if(id === 'topic' && lensId) store.set('library', Object.assign(libState(), { shelf: '', family: '', tag: '', lens: '', lensk: '', topic: lensId.split('+').filter(t => TOPICS[t]).join('+') }));
  const g = REFERENCE_GAMES.find(x => x.id === id);
  if(!g){ setView(libraryHTML()); return; }
  const row = (label, v) => v ? `<p><b>${label}</b> ${esc(v)}</p>` : '';
  // The side column (wide screens only) repeats the lens list and adds the series and the topics shown.
  const lensList = g.lens ? GAME_LENSES.filter(([k]) => g.lens[k]) : [];
  const shown = g.lens ? [...new Set(lensList.flatMap(([k]) => lensTopics(g.lens[k], k)).filter(t => TOPICS[t]))].slice(0, 12) : [];
  const side = wideBlock('Lenses on this page', lensList.length ? `<ol>${lensList.map(([k, label]) => `<li><button type="button" data-action="wide-jump" data-to="lens-${k}">${esc(label)}</button></li>`).join('')}</ol>` : '') +
    (g.kind === 'series' ? wideBlock('The series, entry by entry', `<ol>${g.entries.map(e => `<li>${e.ref ? `<a href="#/games/${e.ref}">${esc(e.t)}</a>` : `<span class="small dim" style="display:block;padding:5px 6px">${esc(e.t)}</span>`}</li>`).join('')}</ol>`) : '') +
    wideBlock('Topics it shows', shown.length ? `<div class="chips">${shown.map(t => `<a class="chip lnk" href="#/map/t/${t}">${esc(TOPICS[t].t)}</a>`).join('')}</div>` : '') +
    wideBlock('', `<a class="btn" href="#/build/dissect">Dissect your idea against it</a>`);
  setView(crumbs([['Library','#/games'],['Reference games','#/games'],[g.t]]) + wide2(`<h1>${esc(g.t)}</h1><p class="dim">${gameYears(g)} · ${esc(g.kind === 'series' ? 'series · ' + g.genre : g.genre)}</p>${seriesHTML(g).startsWith('<p') ? seriesHTML(g) : ''}
    <div class="chips" style="margin:-4px 0 12px"><a class="chip dom lnk" href="#/games" data-action="lib-family" data-v="${esc(g.family)}">${esc(familyLabel(g.family))}</a>${(g.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
    ${gameAwards(g).length ? `<p class="small gameawards"><b>Awards.</b> ${gameAwards(g).map(a => `<a href="${esc(a.src)}" target="_blank" rel="noopener noreferrer">${esc((AWARDS.find(x => x[0] === a.id) || [, a.id])[1])} (${a.year}${a.for ? ', ' + esc(a.for) : ''})</a>`).join(' · ')}</p>` : ''}
    <div class="gamesum">${gameArt(g)}<div class="sumtext">
    ${g.kind === 'series' && g.lesson ? `<section class="card sigcard seriestake"><div class="overline">The takeaway across the series</div><p><b>${esc(g.lesson)}</b></p></section>` : ''}
    <div class="card">${row('Want served.', g.want)}${row('Core verb.', g.verb)}${row('First 30 seconds.', g.first30)}${row('The decision every minute.', g.minute)}</div></div></div>
    ${g.lens ? lensContents(g) : ''}
    ${g.kind === 'series' ? seriesHTML(g) : ''}
    ${signatureHTML(g)}
    ${(g.diagrams || []).map(d => diagramCard(d, null, d.topics ? `<div class="dgm-foot"><span class="overline">Illustrates</span><span class="chips">${d.topics.filter(t => TOPICS[t]).map(t => `<a class="chip lnk" href="#/map/t/${t}">${esc(TOPICS[t].t)}</a>`).join('')}</span></div>` : '')).join('')}
    ${lensesHTML(g, lensId)}
    <div class="card">${row('Why it worked.', g.why)}${row('What players complain about.', g.complaints)}${row('The lesson.', g.lesson)}${row('What copies miss.', g.misses)}${pathChips('game:' + g.id, 'game')}</div>
    ${comparedWith(g)}
    <div class="row wdup"><a class="btn" href="#/build/dissect">Dissect your idea against it</a></div>`, side, 'This game'));
  // #/games/<id>/<lens> lands on that lens.
  // Runs once the route has settled its layout; pictures above the lens load late and
  // move it, so it re-aligns until the reader scrolls.
  const card = lensId && document.getElementById('lens-' + lensId);
  if(card) afterRoute = () => {
    const pane = $('#pane'), align = () => card.scrollIntoView({ block: 'start' }), stop = () => { pane.removeEventListener('load', align, true); ['wheel', 'touchstart', 'keydown'].forEach(e => removeEventListener(e, stop)); };
    align(); card.classList.add('flash'); pane.addEventListener('load', align, true); ['wheel', 'touchstart', 'keydown'].forEach(e => addEventListener(e, stop, { once: true })); setTimeout(stop, 3000);
  };
}
// Reverse index: topic -> the games that show it, from screen and loop
// schematics and from lenses that go deep or name their topics. Default
// topics of a short lens do not count, or every game would link the loop.
let _GAME_LINKS = null;
function gameLinks(){
  if(!_GAME_LINKS){
    _GAME_LINKS = {};
    const add = (tid, g, label) => { const l = _GAME_LINKS[tid] || (_GAME_LINKS[tid] = []); if(!l.some(x => x.g === g && x.label === label)) l.push({ g, label }); };
    REFERENCE_GAMES.forEach(g => {
      (g.diagrams || []).forEach(d => (d.topics || []).forEach(t => add(t, g, d.kind === 'screen' ? 'the screen' : 'the loop')));
      if(g.lens) GAME_LENSES.forEach(([k, label]) => { const l = g.lens[k]; if(l && !l.na && l.topics && l.topics.length) l.topics.forEach(t => add(t, g, label)); });
    });
  }
  return _GAME_LINKS;
}
/* ---------- All pages: every section, view and collection ---------- */
// Also where an unknown route lands, with a line saying so.
function renderIndex(unknown){
  const count = { '#/paths': PATHS.length + ' paths', '#/games': REFERENCE_GAMES.length + ' games', '#/platforms': PLATFORMS.length + ' guides', '#/engines': ENGINES.length + ' guides', '#/checklists': CHECKLISTS.length + ' checklists', '#/prompts': PROMPT_TEMPLATES.length + ' templates', '#/explore': TOPIC_LIST.length + ' topics', '#/concepts': TOPIC_LIST.length + ' concepts', '#/diagnose/smells': SMELLS.length + ' smells', '#/build': TOOLS.length + ' tools', '#/experience': CASE_STUDIES.length + ' projects', '#/sources': SOURCES.length + ' sources' };
  const sections = [...new Set(PAGES.map(p => p[2]))];
  const item = p => `<a class="card clickable lnk blk idxcard" href="${p[0]}"><b>${esc(p[1])}</b>${count[p[0]] ? ` <span class="chip">${esc(count[p[0]])}</span>` : ''}<div class="small dim">${esc(p[3])}</div></a>`;
  const domains = `<div class="chips" style="margin-top:8px">${DOMAINS.map(d => `<a class="chip dom lnk" style="--dc:${d.color}" href="#/explore/${d.id}">${esc(d.t)}</a>`).join('')}</div>`;
  setView(`${crumbs([['All pages']])}<h1>All pages</h1>
    ${unknown ? `<div class="callout">There is no page at <code>#/${esc(unknown)}</code>. Everything the guide has is listed below.</div>` : ''}
    <p class="dim" style="max-width:820px">Every page in the guide, by section. The header groups open these same sections; search (Ctrl K or /) finds any page, topic, game or tool by name.</p>
    ${sections.map(s => `<div class="section-head"><h2>${esc(s)}</h2></div><div class="grid auto">${PAGES.filter(p => p[2] === s && !(p[1] === 'Library')).map(item).join('')}</div>${s === 'Map' ? domains : ''}`).join('')}`);
}
/* ---------- platform guides: access to patches, per store ---------- */
function factItems(list){
  return list && list.length ? `<ul class="pfacts">${list.map(f => `<li>${esc(f.claim)} <span class="small muted"><span class="when">Checked ${esc(f.asOf)}</span> · <a href="${esc(f.src)}" target="_blank" rel="noopener noreferrer">${esc(new URL(f.src).hostname.replace(/^www\./, ''))}</a></span></li>`).join('')}</ul>` : '';
}
function renderPlatforms(id){
  const P = PLATFORMS.find(x => x.id === id);
  const note = '<p class="small muted">Not legal or tax advice. Every dated fact links its source; open it before you rely on a number.</p>';
  if(!P){
    const card = p => `<a class="card clickable lnk blk" href="#/platforms/${p.id}"><b>${esc(p.t)}</b><div class="small dim">${esc(p.sub)}</div><p class="small" style="margin:6px 0 0">${esc(p.short)}</p></a>`;
    const main = PLATFORMS.filter(p => p.kind !== 'open' && p.kind !== 'ugc'), ugc = PLATFORMS.filter(p => p.kind === 'ugc'), other = PLATFORMS.filter(p => p.kind === 'open');
    setView(`${crumbs([['Library','#/games'],['Platforms']])}<h1>Platforms</h1><p class="dim" style="max-width:820px">How to get a game onto each store, from access to patches. Every store and console guide walks the same six stages; a UGC platform, which is engine, hosting and economy in one, walks seven of its own. Numbers and rules that change are dated facts with their source, and whatever a platform keeps under NDA is named, not guessed.</p>
      ${diagramCard(platformMatrix())}
      <div class="section-head"><h2>Stores and consoles</h2></div><div class="grid auto">${main.map(card).join('')}</div>
      ${ugc.length ? `<div class="section-head"><h2>UGC platforms</h2></div><p class="small dim" style="max-width:820px">You build inside the platform’s own editor, it runs the servers, and players find and pay for your game in its economy.</p><div class="grid auto">${ugc.map(card).join('')}</div>` : ''}
      ${other.length ? `<div class="section-head"><h2>Other channels</h2></div><div class="grid auto">${other.map(card).join('')}</div>` : ''}
      ${PLATFORM_NOTES.length ? `<div class="section-head"><h2>Curated and regional channels</h2></div><p class="small dim" style="max-width:820px">Too closed or too small for a full guide: what each one is, and the fact that decides whether it fits you.</p><div class="grid auto">${PLATFORM_NOTES.map(n => `<div class="card"><b>${esc(n.t)}</b>${n.excluded ? ' <span class="chip">not covered</span>' : ''}<p class="small" style="margin:6px 0 0">${esc(n.d)}</p>${factItems(n.facts)}</div>`).join('')}</div>` : ''}${note}`);
    return;
  }
  const stage = ([k, label]) => guideStageHTML(P.stages[k], label);
  const pTopics = (P.topics || []).length ? `<p class="small wdup">Topics: ${P.topics.map(t => topicLink(t)).join(', ')}</p>` : '';
  const next = nextBlocks([['Checklists', chipLinks((P.checklists || []).map(id => CHECKLISTS.find(c => c.id === id)).filter(Boolean).map(c => ['#/checklists/' + c.id, c.t]))], ['Part of paths', pathsBlock('platform:' + P.id)]]);
  const side = guideSide(stagesOf(P), (P.topics || []).map(t => topicLink(t)), null, next);
  setView(crumbs([['Library','#/games'],['Platforms','#/platforms'],[P.t]]) + wide2(`<h1>${esc(P.t)}</h1><p class="dim">${esc(P.sub)}</p><p style="max-width:820px">${esc(P.short)}</p>
    ${P.nda ? `<div class="callout"><b>Under NDA.</b> ${esc(P.nda)}</div>` : ''}
    ${P.flow ? diagramCard(P.flow) : ''}
    ${stagesOf(P).map(stage).join('')}
    ${pTopics}${next.main}${note}`, side, 'This platform'));
}
// One stage of a platform or engine guide: its diagram, points, a numbered
// deploy walkthrough (a step may carry a credited image), images, dated
// facts, and interview questions with answers behind a toggle.
// Side column of an engine or platform page: its stages, what it is at a glance, its topics.
function guideSide(stages, topics, glance, extra){
  return wideJump(stages.map(([, label]) => [label, `data-to="wj-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}"`])) +
    wideBlock('At a glance', (glance || []).length ? `<div class="chips">${glance.map(g => `<span class="chip">${esc(g)}</span>`).join('')}</div>` : '') +
    wideBlock('Topics', topics.length ? `<ul>${topics.map(t => `<li>${t}</li>`).join('')}</ul>` : '') + (extra ? extra.side : '');
}
function guideStageHTML(s, label){
  const deploy = (s.deploy || []).length ? `<ol class="deploysteps">${s.deploy.map(d => `<li><b>${esc(d.t)}</b> ${esc(d.d)}${d.shot ? shotHTML({}, d.shot) : ''}</li>`).join('')}</ol>` : '';
  const iv = (s.iv || []).length ? `<div class="guideiv">${s.iv.map(x => `<details class="card"><summary><b>${esc(x.q)}</b></summary><p>${esc(x.a)}</p><p class="small"><b>Follow-up:</b> ${esc(x.follow)}</p><p class="small"><b>Red flag:</b> ${esc(x.red)}</p></details>`).join('')}</div>` : '';
  return `<section class="pstage" id="wj-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}"><h2>${label}</h2>${s.diagram ? diagramCard(s.diagram) : ''}${s.points ? list(s.points) : ''}${deploy}${(s.shots || []).map(sh => shotHTML({}, sh)).join('')}${factItems(s.facts)}${iv}</section>`;
}
/* ---------- how to use the site ---------- */
// One page that says what each section is for and which route fits which
// reader, with a schematic of the screen. Linked from help, All pages,
// empty search and the paths page.
function renderGuide(){
  const sec = (href, t, what, when) => `<a class="card clickable lnk blk" href="${href}"><b>${esc(t)}</b><div class="small" style="margin-top:4px">${esc(what)}</div><div class="small muted" style="margin-top:4px">${esc(when)}</div></a>`;
  const route = (t, steps) => `<div class="card"><b>${esc(t)}</b><ol class="small" style="margin:6px 0 0;padding-left:20px">${steps.map(s => `<li>${s}</li>`).join('')}</ol></div>`;
  setView(`${crumbs([['How to use this site']])}<h1>How to use this site</h1>
    <p class="dim" style="max-width:820px">A guide to making games, from design to engineering to shipping. Pick the route that matches why you came and ignore the rest until you need it.</p>
    <p class="small" style="max-width:820px">New to the words? The <a href="#/glossary">Glossary</a> explains each one in plain English and links to the lesson that teaches it.</p>
    <div class="section-head"><h2>Pick your route</h2></div>
    <div class="grid auto">
      ${route('New to game design', ['Open <a href="#/paths">Learning paths</a> and answer the three questions, or start <a href="#/paths/game-designer-foundations">Game designer foundations</a>.', 'Follow one step at a time: the banner keeps your current task in view, and each stage ends in a checkpoint you can skip.'])}
      ${route('Programming or shipping a game', ['To program gameplay, start <a href="#/paths/gameplay-engineer-godot">Gameplay engineer, Godot</a> or <a href="#/paths/gameplay-engineer-unity">Gameplay engineer, Unity</a>. For servers, see the other engineering paths on <a href="#/paths">Learning paths</a>.', 'On most topics the <b>Godot</b> and <b>Unity</b> tabs show the idea in code.', 'To ship, follow <a href="#/paths/ship-it">Ship a game on PC, console and mobile</a>, then read <a href="#/platforms">Platforms</a> and <a href="#/engines">Engines and tools</a>.'])}
      ${route('Preparing for an interview', ['Start <a href="#/paths/interview-prep-designer">Interview prep: designer</a> or <a href="#/paths/interview-prep-engineer">Interview prep, engineering</a>.', 'Every topic has an <b>Interview</b> tab: questions, answers, follow-ups and red flags.', 'Mark questions for <a href="#/review">Review</a>; they come back after 1, 2, 4, 8 and 16 days.'])}
      ${route('Stuck on a game you are making', ['Describe what players do in <a href="#/diagnose">Diagnose</a>: each symptom leads to causes, an experiment and a prompt.', 'Shape an idea in the <a href="#/lab">Idea Lab</a>, or a loop, canvas or hypothesis in <a href="#/build">Build tools</a>.', 'Compare it with the <a href="#/games">Reference games</a>, using <a href="#/build/dissect">Reference Dissection</a>.'])}
      ${route('Building with AI', ['Start <a href="#/paths/ai-engineering-for-game-devs">AI engineering for game developers</a>, or read the <b>How AI models work</b> and <b>Code craft</b> domains on the <a href="#/map">Map</a> under Engineering &amp; Career.', 'The checklists include an agent rules file, the AI architecture boundary and AI-assisted submission per platform.', 'Every vendor number (prices, cache rules, context sizes) is a dated fact with its source.'])}
      ${route('Making a casual mobile game', ['Start <a href="#/paths/casual-game-people-keep">Make a casual game people keep</a>: the loop, levels, a fair economy, soft launch and live ops.', 'The casual games in the <a href="#/games">Library</a> are taken apart lens by lens; Defold and Cocos in <a href="#/engines">Engines</a> cover playable ads and mini games.'])}
      ${route('Thinking of leaving games', ['Start <a href="#/paths/game-skills-elsewhere">Take your game skills somewhere else</a>: transferable skills, where people go, the CV and the interview, and the farmer question answered properly.'])}
      ${route('Looking one thing up', ['Press <kbd>Ctrl</kbd>/<kbd>⌘</kbd> <kbd>K</kbd> or <kbd>/</kbd> and type: pages, topics, games, platforms, engines, paths, tools, checklists, prompts, smells, projects and interview questions all appear. UK and US spellings both work.', 'Or open <a href="#/index">All pages</a>, or the <a href="#/concepts">Concept index</a> for topics A to Z.'])}
    </div>
    <div class="section-head"><h2>All ${PATHS.length} learning paths</h2><span class="muted">by track</span></div>
    <div class="grid auto">${TRACKS.map(([tid, tl]) => { const ps = PATHS.filter(p => p.track === tid); return ps.length ? `<div class="card"><b>${esc(tl)}</b><ul class="small" style="margin:6px 0 0;padding-left:18px">${ps.map(p => `<li><a href="#/paths/${p.id}">${esc(p.t)}</a></li>`).join('')}</ul></div>` : ''; }).join('')}</div>
    <p class="small muted"><a href="#/paths">Open Learning paths</a> to answer the three questions and get a suggestion.</p>
    <div class="section-head"><h2>How the parts connect</h2></div>
    <div class="card"><p class="small" style="margin:0 0 6px">A topic is the idea. Everything else is a place to use it, and the pages link both ways, so you can start from either end. The same rows are built from the data on every topic page:</p>
    <ul class="small" style="margin:0"><li><b>In real games</b>: reference games whose lenses list the topic.</li><li><b>Seen in practice</b>: a part of a shipped project that is this idea in the field.</li><li><b>Part of paths</b>: the learning paths and stages that walk through it. Tools, checklists, prompts, guides, smells and projects show the same row.</li><li><b>Tools</b>: build tools made for the idea.</li><li><b>Guides</b>: engine and platform guides that cite it.</li><li><b>Checklists</b> and <b>Prompts</b>: the reviews and prompt templates that name it.</li></ul></div>
    <div class="section-head"><h2>Where things are</h2></div>
    ${diagramCard(GUIDE_LAYOUT)}
    <div class="section-head"><h2>The seven sections</h2><span class="muted">keys 1 to 7</span></div>
    <div class="grid auto">
      ${sec('#/paths', '1 · Paths', 'Guided routes, one visible next step at a time, with checkpoints and a spaced review queue.', 'When you want to learn a role, not one fact.')}
      ${sec('#/map', '2 · Map', 'Every topic as a mind map, a list, or a concept index, in two lenses: Design, and Engineering & Career (which includes How AI models work, Code craft and Careers beyond games). A topic page has the same eight parts everywhere, plus engine and interview tabs.', 'When you want to see how ideas connect, or read a topic.')}
      ${sec('#/games', '3 · Library', 'Reference games taken apart through ten lenses, with long-running series shown entry by entry and a shelf of top award winners; platform guides with step-by-step release walkthroughs; engine and tool guides from Godot to Blender; checklists; prompt templates; sources.', 'When you want examples, a store’s rules, an engine’s trade-offs, or a checklist.')}
      ${sec('#/lab', '4 · Make', 'The Idea Lab and build tools: loop builder, core experience canvas, behaviour ladder, playtest hypothesis, AI delegation planner and more. Your answers stay in this browser.', 'When you are shaping your own game.')}
      ${sec('#/diagnose', '5 · Diagnose', 'Start from what players do (“they quit early”, “combat feels floaty”) and get causes, an experiment and a prompt; plus a playtest question bank.', 'When something in your game is not working.')}
      ${sec('#/ai', '6 · AI Workflow', 'How to work with AI on a game: where it helps, where it must not decide, how to prompt and how to check its output.', 'When you use AI tools in production.')}
      ${sec('#/experience', '7 · Projects', 'Real shipped systems taken apart: architecture, workflows and interview questions for each part.', 'When you want to see the ideas in a working codebase.')}
    </div>
    <div class="section-head"><h2>Your progress</h2></div>
    <div class="card"><ul class="small" style="margin:0">
      <li>Opening a topic ticks it; the header shows how many you have read.</li>
      <li>A path remembers your steps and stages; the banner above the page shows your current task, and <b>Leave path</b> hides it.</li>
      <li>Everything is saved in this browser only. Export or import it from the help dialog (<kbd>?</kbd>), which also lists every keyboard shortcut.</li>
    </ul></div>`);
}
/* ---------- engine and tool guides ---------- */
function renderEngines(id){
  const E = ENGINES.find(x => x.id === id);
  const note = '<p class="small muted">Prices and licence terms change; every dated fact links its source. Images are credited with their licence; screens we cannot license are drawn as schematics.</p>';
  if(!E){
    const card = e => `<a class="card clickable lnk blk" href="#/engines/${e.id}"><b>${esc(e.t)}</b><div class="small dim">${esc(e.sub)}</div><p class="small" style="margin:6px 0 0">${esc(e.short)}</p><div class="chips" style="margin-top:6px">${e.glance.map(g => `<span class="chip">${esc(g)}</span>`).join('')}</div></a>`;
    const groups = [['engine', 'Game engines'], ['web', 'The web stack'], ['tool', 'Tools']];
    setView(`${crumbs([['Library','#/games'],['Engines']])}<h1>Engines and tools</h1><p class="dim" style="max-width:820px">What each engine is, how it is built, the editor, the content pipeline, how a build gets to each platform, what it costs, how it works with AI, and the questions interviews ask. Topic pages keep their Godot and Unity tabs; these guides cover the rest.</p>
      ${ENGINES.length ? groups.map(([k, t]) => { const xs = ENGINES.filter(e => e.kind === k); return xs.length ? `<div class="section-head"><h2>${t}</h2></div><div class="grid auto">${xs.map(card).join('')}</div>` : ''; }).join('') : '<div class="empty">Engine guides are being written.</div>'}${note}`);
    return;
  }
  const next = nextBlocks([['Part of paths', pathsBlock('engine:' + E.id)]]);
  const side = guideSide(ENGINE_STAGES, (E.topics || []).map(t => topicLink(t)), E.glance, next);
  setView(crumbs([['Library','#/games'],['Engines','#/engines'],[E.t]]) + wide2(`<h1>${esc(E.t)}</h1><p class="dim">${esc(E.sub)}</p><p style="max-width:820px">${esc(E.short)}</p>
    <div class="chips wdup" style="margin:-4px 0 12px">${E.glance.map(g => `<span class="chip">${esc(g)}</span>`).join('')}</div>
    ${diagramCard(E.flow)}
    ${ENGINE_STAGES.map(([k, label]) => guideStageHTML(E.stages[k], label)).join('')}
    ${(E.topics || []).length ? `<p class="small wdup">Topics: ${E.topics.map(t => topicLink(t)).join(', ')}</p>` : ''}${next.main}${note}`, side, 'This engine'));
}
function topicLink(id, label){ const t = TOPICS[id]; if(t) return `<a href="#/map/t/${id}">${esc(label || t.t)}</a>`; const v = VIEW_LINKS[id]; if(v) return `<a href="${v[0]}">${esc(label || v[1])}</a>`; return esc(label || id); }
function promptBox(label, text){ return `<div class="promptbox">${label ? `<div class="lbl">${esc(label)}</div>` : ''}<pre>${esc(text)}</pre><button type="button" class="btn sm copybtn" data-action="copy">Copy</button></div>`; }
function list(arr){ return `<ul>${(arr||[]).map(x => `<li>${esc(x)}</li>`).join('')}</ul>`; }
function chainHTML(items, cls){ return `<div class="chain">${items.map((it, i) => (i ? '<span class="arrow">→</span>' : '') + `<a class="cn ${it[2]||cls||''} lnk" title="${esc(it[3]||'')}" href="${it[1]}">${esc(it[0])}</a>`).join('')}</div>`; }

/* ---------- inline SVG diagrams (theme-aware, no external assets) ---------- */
const DIAGRAM_DISSECTION = `<svg class="diagram" viewBox="0 0 704 258" role="img" aria-label="Dissect each comparable with one template, then cross-reference your concept against all of them">
  <defs><marker id="arrds" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path class="fill-b" d="M0,0 L6,3 L0,6 Z"/></marker></defs>
  <text class="dhead" x="0" y="13">Dissect each comparable with one template</text>
  <rect class="box" x="0" y="24" width="160" height="58" rx="0"/><text class="dt" x="14" y="48">Want served</text><text x="14" y="66">the reason they play</text>
  <rect class="box" x="182" y="24" width="160" height="58" rx="0"/><text class="dt" x="196" y="48">Core verb</text><text x="196" y="66">what they do most</text>
  <rect class="box" x="364" y="24" width="160" height="58" rx="0"/><text class="dt" x="378" y="48">First 30s</text><text x="378" y="66">what teaches the game</text>
  <rect class="box" x="546" y="24" width="160" height="58" rx="0"/><text class="dt" x="560" y="48">Decision/min</text><text x="560" y="66">the repeatable choice</text>
  <line class="stroke-b" x1="162" y1="53" x2="178" y2="53" marker-end="url(#arrds)"/>
  <line class="stroke-b" x1="344" y1="53" x2="360" y2="53" marker-end="url(#arrds)"/>
  <line class="stroke-b" x1="526" y1="53" x2="542" y2="53" marker-end="url(#arrds)"/>
  <text class="dhead" x="0" y="118">Then cross-reference your concept against all of them</text>
  <rect class="box" x="0" y="130" width="160" height="58" rx="0"/><text class="dt" x="14" y="154">Why it worked</text><text x="14" y="172">the mechanism, cited</text>
  <rect class="box" x="182" y="130" width="160" height="58" rx="0"/><text class="dt" x="196" y="154">Complaints</text><text x="196" y="172">the want left unserved</text>
  <rect class="box" x="364" y="130" width="160" height="58" rx="0"/><text class="dt" x="378" y="154">Lesson</text><text x="378" y="172">what you must not skip</text>
  <rect class="box" x="546" y="130" width="160" height="58" rx="0"/><text class="dt" x="560" y="154">Copies miss</text><text x="560" y="172">the usual failure</text>
  <text x="0" y="222">Shared want, a difference visible in one screenshot, an answered complaint, and a bar you can reach.</text>
  <text class="muted" x="0" y="242">Sources are heuristics. Verify every claim about why a game worked, or mark it unknown.</text>
</svg>`;
const DIAGRAMS = { 'learning-from-success': DIAGRAM_DISSECTION };
// A domain page can open with one of its topics' data diagrams.
const DOMAIN_DIAGRAMS = { ux: 'ux-as-design' };
// A diagram drawn from data (DIAGRAM() in the topic files, 87-diagrams.js),
// with the same content as a list for screen readers and for anyone who
// prefers text.
// `footer` is extra HTML that belongs to the diagram (the real games that
// show it), kept inside the card so it reads as part of it.
function diagramCard(spec, color, footer){
  const D = window.PlayableDiagram;
  return `<figure class="card dgm-card" style="--dc:${color || 'var(--accent2)'}"><figcaption class="dgm-title">${esc(spec.title)}</figcaption>${D.render(spec)}${D.legend(spec)}${spec.note ? `<p class="dgm-note">${esc(spec.note)}</p>` : ''}${footer || ''}<details class="dgm-text"><summary>Diagram as text</summary>${D.describe(spec)}</details></figure>`;
}

/* A stepped explainer: one frame at a time, moved by the reader. Research
   behind it (docs/program-2026-10/research/learning-science.md section 3):
   animation helps when change over time is the idea, and learner-paced steps
   help most; nothing plays by itself, the caption is read out as it changes,
   and "Diagram as text" lists every frame. Play steps through once, a frame
   every few seconds, and stops at the end; reduced motion turns the fade off. */
function explainerCard(x, color, key){
  const D = window.PlayableDiagram, n = x.frames.length;
  const frames = x.frames.map((f, i) => `<div class="xp-frame" data-i="${i}"${i ? ' hidden' : ''}>${D.render(Object.assign({ title: f.t }, f.spec))}${D.legend(f.spec)}</div>`).join('');
  const text = x.frames.map((f, i) => `<li><b>${i + 1}. ${esc(f.t)}</b>${f.d ? ` ${esc(f.d)}` : ''}${D.describe(Object.assign({ title: f.t }, f.spec))}</li>`).join('');
  return `<figure class="card dgm-card explainer" style="--dc:${color || 'var(--accent2)'}" data-xp="${esc(key)}" data-n="${n}" data-at="0">
    <figcaption class="dgm-title">${esc(x.title)} <span class="small muted">· step through it</span></figcaption>
    <div class="xp-stage">${frames}</div>
    <p class="xp-cap" aria-live="polite"><span class="xp-num">1 of ${n}</span> <b>${esc(x.frames[0].t)}</b>${x.frames[0].d ? ` ${esc(x.frames[0].d)}` : ''}</p>
    <div class="row xp-ctl"><button type="button" class="btn sm ghost" data-action="xp-step" data-d="-1" disabled>◂ Back</button><button type="button" class="btn sm" data-action="xp-step" data-d="1">Next ▸</button><button type="button" class="btn sm ghost" data-action="xp-play" aria-pressed="false">Play</button><button type="button" class="btn sm ghost" data-action="xp-step" data-d="0">Start again</button></div>
    ${x.note ? `<p class="dgm-note">${esc(x.note)}</p>` : ''}
    <details class="dgm-text"><summary>Diagram as text</summary><ol class="xp-text">${text}</ol></details></figure>`;
}
// A short silent clip: the reader starts it; the same content is in words beneath.
function clipCard(c, color){
  return `<figure class="card dgm-card clip" style="--dc:${color || 'var(--accent2)'}"><figcaption class="dgm-title">${esc(c.title)} <span class="small muted">· a short silent clip</span></figcaption>
    <video controls muted playsinline loop preload="none" poster="${esc(c.poster)}" width="640" height="300"><source src="${esc(c.src)}" type="video/webm"></video>
    <p class="small">${esc(c.text)}</p></figure>`;
}
function xpShow(fig, i){
  const n = +fig.dataset.n, at = Math.max(0, Math.min(n - 1, i)), x = TOPICS[fig.dataset.xp] && TOPICS[fig.dataset.xp].explainer;
  fig.dataset.at = at;
  $$('.xp-frame', fig).forEach(f => { f.hidden = +f.dataset.i !== at; });
  const fr = x && x.frames[at];
  if(fr) $('.xp-cap', fig).innerHTML = `<span class="xp-num">${at + 1} of ${n}</span> <b>${esc(fr.t)}</b>${fr.d ? ` ${esc(fr.d)}` : ''}`;
  $('[data-action="xp-step"][data-d="-1"]', fig).disabled = at === 0;
  $('[data-action="xp-step"][data-d="1"]', fig).disabled = at === n - 1;
  return at;
}
const xpTimers = new WeakMap();
function xpStop(fig){ clearInterval(xpTimers.get(fig)); xpTimers.delete(fig); const b = $('[data-action="xp-play"]', fig); if(b){ b.setAttribute('aria-pressed', 'false'); b.textContent = 'Play'; } }
ACTIONS['xp-step'] = el => { const fig = el.closest('.explainer'); xpStop(fig); const d = +el.dataset.d; xpShow(fig, d === 0 ? 0 : +fig.dataset.at + d); };
ACTIONS['xp-play'] = el => {
  const fig = el.closest('.explainer'); if(xpTimers.has(fig)) return xpStop(fig);
  if(+fig.dataset.at >= +fig.dataset.n - 1) xpShow(fig, 0);
  el.setAttribute('aria-pressed', 'true'); el.textContent = 'Pause';
  xpTimers.set(fig, setInterval(() => { if(!document.body.contains(fig)) return xpStop(fig); const at = xpShow(fig, +fig.dataset.at + 1); if(at >= +fig.dataset.n - 1) xpStop(fig); }, 3200));
};

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
      ${DOMAIN_DIAGRAMS[d.id] && TOPICS[DOMAIN_DIAGRAMS[d.id]].diagram ? diagramCard(TOPICS[DOMAIN_DIAGRAMS[d.id]].diagram, d.color) : ''}
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
      <div class="box"><h3 class="h4look">Questions to ask</h3>${list(t.think.q)}</div>
      <div class="box"><h3 class="h4look">Tradeoffs</h3>${list(t.think.trade)}</div>
      <div class="box trap"><h3 class="h4look">Common traps</h3>${list(t.think.traps)}</div>
      <div class="box good"><h3 class="h4look">Signals of good design</h3>${list(t.think.good)}<h3 class="h4look" style="margin-top:8px;color:var(--bad)">Signals of bad design</h3>${list(t.think.bad)}</div></div>`;
    case 'how': return `<ol class="numbered">${t.how.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`;
    case 'tech': return `<p class="small dim">Techniques that solve this, compared on how they work, when they fit, and what they cost. Pick one to prototype, not all of them.</p><div class="think-grid">${(t.tech||[]).map(x => `<div class="box"><h3 class="h4look">${esc(x.n)}</h3><div class="small"><b>How it works.</b> ${esc(x.how)}</div><div class="small" style="margin-top:4px"><b>Fits when.</b> ${esc(x.fit)}</div><div class="small" style="margin-top:4px"><b>Cost / risk.</b> ${esc(x.cost)}</div><div class="small muted" style="margin-top:4px"><b>Watch out / instead.</b> ${esc(x.alt)}</div></div>`).join('')}</div>`;
    case 'ai': return `<div class="ai-split"><div class="box yes"><h3 class="h4look" style="color:var(--d-ai)">AI is good at</h3>${list(t.ai.yes)}</div><div class="box no"><h3 class="h4look" style="color:var(--d-player)">AI should not decide</h3>${list(t.ai.no)}</div></div>`;
    case 'prompts': return (t.prompts||[]).map(p => promptBox(p.l, p.p)).join('') + `<p class="small muted" style="margin-top:8px">Every prompt assumes you filled the brackets with your real player, fantasy, loop, constraints and evidence. Unfilled brackets produce genre averages. See ${topicLink('prompting-framework')} and the <a href="#/build/prompt">Prompt Generator</a>.</p>`;
    case 'verify': return list(t.verify) + `<details><summary>Universal verification questions (apply to every AI output)</summary><div class="body">${list(['What assumptions are you making? Mark each as given, inferred, or invented.','What evidence supports this?','What could make this fail?','What player behaviour would prove this wrong?','Is this solving the actual problem or producing more content?','Is this complexity necessary?','What is the smallest prototype that tests this?','What alternatives did we reject?','What tradeoff are we making?'])}<a class="btn sm" href="#/checklists/ai-verify">Open the verification checklist</a></div></details>`;
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
  if(!_PRACTICE){ _PRACTICE = PlayableGraph.practiceLinks(CASE_STUDIES, 2, REFERENCE_GAMES); Object.assign(VIEW_LINKS, _PRACTICE.views); }
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
// Every part of the site that uses a topic, read from the data: the tools it motivates, the engine and
// platform guides that cite it, the checklists and prompt templates that name it.
function topicParts(id){
  const guides = [...PLATFORMS.map(g => ['platforms', g]), ...ENGINES.map(g => ['engines', g])].filter(([, g]) => (g.topics || []).includes(id));
  return [
    ['Tools', TOOLS.filter(x => x[4] === id).map(x => ['#/build/' + x[0], x[1]])],
    ['Guides', guides.map(([k, g]) => [`#/${k}/${g.id}`, g.t])],
    ['Checklists', CHECKLISTS.filter(c => (c.topics || []).includes(id)).map(c => ['#/checklists/' + c.id, c.t])],
    ['Prompts', PROMPT_TEMPLATES.filter(p => (p.topics || []).includes(id)).map(p => ['#/prompts/' + p.id, p.t])]
  ].filter(r => r[1].length);
}
const PART_NOTE = { Tools:'build tools made for this idea', Guides:'engine and platform guides that cite it', Checklists:'reviews that check it', Prompts:'prompt templates for it' };
const partsRowsHTML = id => topicParts(id).map(([label, items]) => `<div class="small" style="margin-top:8px"><b>${label}:</b> ${PART_NOTE[label]}.</div><div class="chips" style="margin-top:5px">${items.map(([h, t]) => `<a class="chip lnk" href="${h}">${esc(t)}</a>`).join('')}</div>`).join('');
function contextsPanel(t){
  const c = topicContexts(t);
  const chips = [`<span class="chip dom" style="--dc:${c.home.color}">${esc(c.home.t)} · home</span>`]
    .concat(c.refs.map(x => `<a class="chip lnk" style="cursor:pointer" href="#/map/t/${x.id}">${esc(DOM[x.d].t)} · ${esc(x.t)}</a>`));
  return `<div class="card contexts"><h2 class="h4look">Appears in</h2><div class="small muted">One concept, several contexts. Its home domain, then every concept that references it. The article is not duplicated.</div>
    <div class="chips" style="margin-top:8px">${chips.join('')}</div>
    ${c.smells.length ? `<div class="small" style="margin-top:8px"><b>Diagnoses smells:</b> ${c.smells.map(s => `<a href="#/smell/${s.id}">${esc(s.t)}</a>`).join(', ')}</div>` : ''}
    ${c.loops.length ? `<div class="small" style="margin-top:4px"><b>Core-loop links:</b> ${c.loops.map(p => esc(p.t)).join(', ')}</div>` : ''}
    ${c.steps.length ? `<div class="small" style="margin-top:4px"><b>AI-era loop steps:</b> ${c.steps.map(s => `<a href="#/ai/loop/${s.n}">${s.n}</a>`).join(', ')}</div>` : ''}
    ${practiceChips(t.id)}${partsRowsHTML(t.id) ? `<div class="wdup">${partsRowsHTML(t.id)}</div>` : ''}${pathChips(t.id) ? `<div class="wdup">${pathChips(t.id)}</div>` : ''}</div>`;
}
function renderGlossary(focusId){
  const list = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity:'base' }));
  const letterOf = g => g.term.charAt(0).toUpperCase();
  const letters = [...new Set(list.map(letterOf))];
  const firstOf = {}; list.forEach(g => { const l = letterOf(g); if(!firstOf[l]) firstOf[l] = g.id; });
  const entry = g => `<div class="gl-entry" style="margin:0 0 14px" id="g-${esc(g.id)}"><dt><b>${esc(g.term)}</b>${g.aka && g.aka.length ? ` <span class="small dim">also: ${g.aka.map(esc).join(', ')}</span>` : ''}</dt><dd style="margin:2px 0 0">${esc(g.def)}${g.topic && TOPICS[g.topic] ? `<div class="small" style="margin-top:4px"><a href="#/map/t/${esc(g.topic)}">Learn it: ${esc(TOPICS[g.topic].t)}</a></div>` : ''}</dd></div>`;
  setView(`${crumbs([['Start here','#/guide'],['Glossary']])}<h1>Glossary</h1><p class="dim" style="max-width:820px">Words this guide uses, in plain English. Each links to the lesson that teaches it.</p>
    <div class="field" style="max-width:420px"><label for="glFilter">Filter the terms</label><input type="text" id="glFilter" placeholder="Type a word: loop, retention, rollback…" autocomplete="off"></div>
    <nav class="chips" aria-label="Jump to a letter">${letters.map(l => `<a class="chip lnk" href="#/glossary/${esc(firstOf[l])}">${esc(l)}</a>`).join('')}</nav>
    <div class="gl-list" style="max-width:820px">${letters.map(l => `<section class="gl-letter"><h2 class="h4look">${esc(l)}</h2><dl>${list.filter(g => letterOf(g) === l).map(entry).join('')}</dl></section>`).join('')}</div>
    <p class="small muted" id="glNone" hidden>No term matches. Try a shorter word, or search the whole guide (Ctrl+K).</p>`);
  // the filter hides the terms (and empty letters) whose name, other names and definition miss the typed words
  const f = $('#glFilter');
  if(f) f.oninput = () => { const ws = searchWords(f.value); let shown = 0;
    $$('.gl-letter').forEach(sec => { let any = false; $$('.gl-entry', sec).forEach(e => { const ok = !ws.length || ws.every(w => searchWords(e.textContent).some(x => x.startsWith(w))); e.hidden = !ok; if(ok){ any = true; shown++; } }); sec.hidden = !any; });
    $('#glNone').hidden = shown > 0; };
  if(focusId){ afterRoute = () => { const el = document.getElementById('g-' + focusId); if(el) el.scrollIntoView({ block:'start' }); }; }
}
function renderConcepts(){
  const rows = TOPIC_LIST.map(t => ({ t, n: TOPIC_LIST.filter(x => x.id !== t.id && (x.rel||[]).some(([rid]) => rid === t.id)).length })).sort((a, b) => b.n - a.n || a.t.t.localeCompare(b.t.t));
  const card = r => `<a class="card clickable tint lnk blk" style="--dc:${DOM[r.t.d].color}" href="#/map/t/${r.t.id}"><b>${esc(r.t.t)}</b><div class="small dim">${esc(DOM[r.t.d].t)} · referenced by ${r.n}</div></a>`;
  setView(`${crumbs([['Map','#/map'],['Concept index']])}<h1>Concept index</h1><p class="dim">All ${TOPIC_LIST.length} concepts, most referenced first. A concept lives in one home domain and is referenced from others, so it belongs to several contexts without being copied.</p>
    <div class="field"><input type="text" id="ciFilter" placeholder="Filter concepts…"></div>
    <div class="grid auto" id="ciList">${rows.map(card).join('')}</div>`);
  const f = $('#ciFilter'); f.addEventListener('input', () => { const q = f.value.trim().toLowerCase(); $('#ciList').innerHTML = rows.filter(r => r.t.t.toLowerCase().includes(q) || DOM[r.t.d].t.toLowerCase().includes(q)).map(card).join('') || '<div class="empty">No concept matches.</div>'; });
}
/* ---------- glossary toggletips ----------
   glossify() turns the first use on a page of each glossary entry (its term or any aka) into a button.
   It walks the text nodes of the rendered HTML, never the markup, and leaves headings, links,
   buttons, code, chips and diagrams alone. One bubble at a time lives in <body>, in a
   role="status" region so a screen reader hears the definition when it fills.
   Each button is <button type="button" data-action="gloss-tip">, handled below. */
let _GLOSS = null;
function glossMatcher(){
  if(_GLOSS) return _GLOSS;
  const by = new Map();
  GLOSSARY.forEach(g => [g.term, ...(g.aka || [])].forEach(w => { const k = w.toLowerCase(); if(w.length >= 3 && !by.has(k)) by.set(k, g); }));
  const words = [...by.keys()].sort((a, b) => b.length - a.length).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return (_GLOSS = { by, re: new RegExp('(?<![\\w-])(' + words.join('|') + ')(?![\\w-])', 'gi') });
}
const GLOSS_SKIP = 'h1,h2,h3,h4,h5,h6,a,button,code,pre,summary,svg,textarea,.chip,.dgm-foot,.diagram-card';
// opts.cur: the topic this page teaches (its own "Learn it" link is left out); opts.only: a selector the text must sit inside.
function glossify(html, opts = {}){
  const { by, re } = glossMatcher(), seen = new Set();
  const tpl = document.createElement('template'); tpl.innerHTML = html;
  const walker = document.createTreeWalker(tpl.content, NodeFilter.SHOW_TEXT), nodes = [];
  for(let n; (n = walker.nextNode());) nodes.push(n);
  for(const node of nodes){
    const p = node.parentElement;
    if(!p || p.closest(GLOSS_SKIP) || (opts.only && !p.closest(opts.only))) continue;
    const text = node.nodeValue; let m, last = 0, frag = null; re.lastIndex = 0;
    while((m = re.exec(text))){
      const g = by.get(m[1].toLowerCase()); if(seen.has(g.id)) continue;
      seen.add(g.id); frag = frag || document.createDocumentFragment();
      frag.append(text.slice(last, m.index));
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'gt'; b.setAttribute('aria-expanded', 'false'); b.dataset.action = 'gloss-tip'; b.dataset.gloss = g.id;
      if(g.topic && g.topic !== opts.cur && TOPICS[g.topic]) b.dataset.learn = g.topic;
      b.textContent = m[1]; frag.append(b); last = m.index + m[1].length;
    }
    if(frag){ frag.append(text.slice(last)); node.replaceWith(frag); }
  }
  return tpl.innerHTML;
}
let tipBtn = null, tipEl = null, tipAt = 0;
function tipNode(){
  if(!tipEl){ tipEl = document.createElement('div'); tipEl.id = 'gtBubble'; tipEl.className = 'gtbubble'; tipEl.setAttribute('role', 'status'); document.body.appendChild(tipEl); }
  return tipEl;
}
function closeTip(refocus){
  if(!tipBtn) return;
  const b = tipBtn; tipBtn = null; b.setAttribute('aria-expanded', 'false'); tipNode().textContent = '';
  if(refocus && document.contains(b)) b.focus();
}
ACTIONS['gloss-tip'] = el => {
  if(tipBtn === el){ closeTip(); return; }
  closeTip();
  const g = GLOSSARY.find(x => x.id === el.dataset.gloss); if(!g) return;
  tipBtn = el; tipAt = Date.now(); el.setAttribute('aria-expanded', 'true');
  // The region is already in the page and empty; filling it a moment later is what gets it announced.
  setTimeout(() => {
    if(tipBtn !== el) return;
    const n = tipNode();
    n.innerHTML = `<b>${esc(g.term)}</b> ${esc(g.def)}${el.dataset.learn ? ` <a href="#/map/t/${esc(el.dataset.learn)}">Learn it</a>` : ''}`;
    const r = el.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = window.innerHeight;
    const w = n.offsetWidth, h = n.offsetHeight;
    n.style.left = Math.max(12, Math.min(r.left, vw - w - 12)) + 'px';
    n.style.top = (r.bottom + 6 + h > vh - 12 ? Math.max(12, r.top - h - 6) : r.bottom + 6) + 'px';
  }, 30);
};
document.addEventListener('click', e => { if(tipBtn && !e.target.closest('.gt, #gtBubble')) closeTip(); });
document.addEventListener('scroll', () => { if(tipBtn && Date.now() - tipAt > 400) closeTip(); }, true);
window.addEventListener('resize', () => closeTip());
/* ---------- topic tabs: overview / godot / unity / go / interview ---------- */
const TOPIC_TABS = [['overview','Overview'],['godot','Godot'],['unity','Unity'],['go','Go'],['interview','Interview']];
// A tab only exists when the topic carries its data, so nothing renders blank.
function tabsFor(t){ return TOPIC_TABS.filter(([k]) => k === 'overview' || (k === 'interview' ? !!t.iv : k === 'go' ? !!t.go : !!(t.eng && t.eng[k]))); }
let topicTab = 'overview';
// The tab in the URL wins; otherwise the last one this browser used; unknown
// or unavailable falls back to overview. Only an explicit URL tab is stored.
function setTopicTab(t, tab){
  const avail = tabsFor(t).map(x => x[0]);
  const want = tab || store.get('topicTab', 'overview');
  topicTab = avail.includes(want) ? want : 'overview';
  // A search result for a worked example arrives as .../worked-<id>: show the Overview and scroll to that card.
  if(tab && tab.startsWith('worked-')) afterRoute = () => { const el = document.getElementById(tab); if(el){ el.scrollIntoView({ block: 'start' }); el.classList.add('flash'); } };
  if(tab){ store.set('topicTab', topicTab); if(topicTab === 'godot' || topicTab === 'unity') store.set('engine', topicTab); }
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
// Says plainly whether a snippet stands alone or assumes the reader's project. Always visible text, never a tooltip.
const GODOT_WHOLE = /^(extends|class_name|@tool)\b/;
function snippetLabel(kind, t, v){
  if(kind === 'go'){
    const src = String(v.snippet), pkg = (src.match(/^package (\w+)/m) || [])[1], hasTest = /^func Test\w+\(/m.test(src);
    const how = pkg === 'main' ? 'A program: save it as main.go in its own folder, run go mod init example, then go run .'
      : hasTest ? 'A package with its test: save it as name_test.go in its own folder, run go mod init example, then go test ./...'
      : 'A package, not a program: save it in its own folder, run go mod init example, then go vet ./...';
    return ['Whole file', how + ' Needs Go 1.23 or later.'];
  }
  if(kind === 'unity') return UNITY_WHOLE.has(t.id) ? ['Whole script', 'Compiled on its own against the Unity engine assemblies.'] : ['Excerpt: assumes names from your project', 'Read it as a pattern. It will not compile on its own, because it uses types and fields from your project.'];
  const first = String(v.snippet).split('\n').map(l => l.trim()).find(l => l && !l.startsWith('#')) || '';
  return GODOT_WHOLE.test(first) ? ['Whole script', 'A complete script: save it as a .gd file and attach it to a node.'] : ['Excerpt', 'A few lines to place inside your own script.'];
}
const snippetNote = ([label, why]) => `<p class="snipnote"><span class="chip">${esc(label)}</span> <span class="small dim">${esc(why)}</span></p>`;
function goBody(t){
  const v = t.go, d = DOM[t.d];
  return `<div class="engview" style="--dc:${d.color}">
    <div class="overline">Go · the same idea in a Go service</div>
    <h2 class="h4look">Reach for</h2><div class="chips apis">${v.api.map(a => `<span class="chip api">${esc(a)}</span>`).join('')}</div>
    ${snippetNote(snippetLabel('go', t, v))}
    <div class="promptbox"><pre class="snippet">${esc(v.snippet)}</pre><button type="button" class="btn sm copybtn" data-action="copy">Copy</button></div>
    <div class="callout bad"><b>Pitfall.</b> ${esc(v.pitfall)}</div></div>`;
}
function engineBody(t, which){
  const v = t.eng[which], d = DOM[t.d];
  return `<div class="engview" style="--dc:${d.color}">
    <div class="overline">${which === 'godot' ? 'Godot 4' : 'Unity 6'} · what this is called here</div>
    <p>${esc(v.term)}</p>
    <h2 class="h4look">Reach for</h2><div class="chips apis">${v.api.map(a => `<span class="chip api">${esc(a)}</span>`).join('')}</div>
    ${snippetNote(snippetLabel(which, t, v))}
    <div class="promptbox"><pre class="snippet">${esc(v.snippet)}</pre><button type="button" class="btn sm copybtn" data-action="copy">Copy</button></div>
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
  // Keyed by the question's text, not its position, so adding or reordering
  // questions never marks the wrong one as queued.
  return `<div class="ivlist">${arr.map(x => { const k = `${key}:${x.q}`, on = !!queued[k];
    return `<details class="ivq" style="--dc:${color}"><summary>${esc(x.q)}</summary><div class="body">
    <h3 class="h4look">Answer outline</h3><p>${esc(x.a)}</p>
    <h3 class="h4look">Follow-up coming</h3><p>${esc(x.follow)}</p>
    <h3 class="h4look redflag">Red flag</h3><p>${esc(x.red)}</p>
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
    .map(([dir, id]) => `<a class="btn" href="#/map/t/${id}/interview">${dir === 'prev' ? '← ' : ''}${esc(TOPICS[id].t)}${dir === 'next' ? ' →' : ''}</a>`).join('');
  return interviewBody(t.iv, d.color, 'story.' + t.id, near);
}
function topicBody(id){
  const t = TOPICS[id];
  if(!t){ return `<div class="empty">Unknown topic: ${esc(id)}</div>`; }
  const d = DOM[t.d];
  const idx = d.topics.indexOf(id);
  const prev = idx > 0 ? d.topics[idx-1] : null, next = idx < d.topics.length-1 ? d.topics[idx+1] : null;
  const openSecs = new Set(store.get('openSecs', ['what','why','think']));
  const secTitle = key => (d.titles && d.titles[key]) || SECTION_META.find(m => m[0] === key)[2];
  const secs = glossify(SECTION_META.map(([key, letter]) => `<section class="sec ${openSecs.has(key)?'open':''}" data-key="${key}" style="--dc:${d.color}"><header><span class="letter">${letter}</span><h2 class="sec-h"><button type="button" class="sec-btn" data-action="toggle-sec" aria-expanded="${openSecs.has(key)}">${esc(secTitle(key))}</button></h2><span class="car" aria-hidden="true">▸</span></header><div class="body">${sectionBody(key, t)}</div></section>`).join(''), { cur: id });
  const techSec = (t.tech && t.tech.length) ? `<section class="sec ${openSecs.has('tech')?'open':''}" data-key="tech" style="--dc:${d.color}"><header><span class="letter">T</span><h2 class="sec-h"><button type="button" class="sec-btn" data-action="toggle-sec" aria-expanded="${openSecs.has('tech')}">Techniques to compare</button></h2><span class="car" aria-hidden="true">▸</span></header><div class="body">${sectionBody('tech', t)}</div></section>` : '';
  const rel = (t.rel||[]).map(([rid, why]) => { const rt = TOPICS[rid]; const v = VIEW_LINKS[rid]; const href = rt ? `#/map/t/${rid}` : (v ? v[0] : '#/explore'); const label = rt ? rt.t : (v ? v[1] : rid); const dc = rt ? DOM[rt.d].color : 'var(--accent)'; return `<a class="rel lnk blk" style="border-left:3px solid ${dc}" href="${href}"><b>${esc(label)}</b><div class="why">${esc(why)}</div></a>`; }).join('');
  const smells = SMELLS.filter(s => s.causes.some(c => c.top === id));
  // Diagram and "Appears in" belong to the Overview body, so the engine and
  // interview tabs start directly under the strip instead of below the fold.
  // "Appears in" follows the sections: the article comes first, its
  // cross-references after it (on a phone the chips pushed "What is it?"
  // more than a screen down).
  // Rules and rulings that change, each with the day it was checked.
  const facts = (t.facts && t.facts.length) ? `<div class="card facts" style="--dc:${d.color}"><h2 class="h4look">Dated facts</h2><p class="small dim">Rules and rulings that change. Each line says when it was last checked; open the source before relying on it.</p><ul>${t.facts.map(f => `<li>${esc(f.claim)} <span class="small muted"><span class="when">Checked ${esc(f.asOf)}</span> · <a href="${esc(f.src)}" target="_blank" rel="noopener noreferrer">${esc(new URL(f.src).hostname.replace(/^www\./, ''))}</a></span></li>`).join('')}</ul></div>` : '';
  const inGames = gameLinks()[id] || [];
  const smellChips = `<div class="chips">${smells.map(s => `<a class="chip lnk" style="cursor:pointer;padding:6px 10px" href="#/smell/${s.id}">${esc(s.t)}</a>`).join('')}</div>`;
  // Six chips, then the rest behind a toggle: with sixty games a common
  // topic would otherwise carry a wall of links above the article.
  const gameChip = x => `<a class="chip lnk" href="#/games/${x.g.id}">${esc(x.g.t)}: ${esc(x.label.charAt(0).toLowerCase() + x.label.slice(1))}</a>`;
  const gameFoot = inGames.length ? `<div class="dgm-foot wdup"><span class="overline">In real games</span><span class="chips">${inGames.slice(0, 6).map(gameChip).join('')}</span>${inGames.length > 6 ? `<details class="more-games"><summary>${inGames.length - 6} more</summary><span class="chips">${inGames.slice(6).map(gameChip).join('')}</span></details>` : ''}</div>` : '';
  const overview = `${DIAGRAMS[id] ? `<div class="card diagram-card">${DIAGRAMS[id]}${gameFoot}</div>` : t.diagram ? diagramCard(t.diagram, d.color, gameFoot) : gameFoot ? `<div class="card">${gameFoot}</div>` : ''}${t.explainer ? explainerCard(t.explainer, d.color, t.id) : ''}${t.clip ? clipCard(t.clip, d.color) : ''}
    ${secs}${techSec}${facts}${workedHTML(t, d.color)}
    <div class="wdup"><div class="section-head"><h2>Related concepts</h2><span class="muted">and why they connect</span></div>
    <div class="related">${rel}</div></div>
    ${smells.length ? `<div class="wdup"><div class="section-head"><h2>Design smells this topic helps diagnose</h2></div>${smellChips}</div>` : ''}
    ${contextsPanel(t)}
    <div class="readmark">${readMarkHTML(id)}</div>
    <div class="topic-nav">${prev ? `<a class="btn" href="#/map/t/${prev}">← ${esc(TOPICS[prev].t)}</a>` : `<a class="btn ghost" href="#/map/d/${d.id}">← ${esc(d.t)} overview</a>`}<a class="btn ghost" href="#/explore/${d.id}">List view</a>${next ? `<a class="btn" href="#/map/t/${next}">${esc(TOPICS[next].t)} →</a>` : `<a class="btn" href="#/map/home">All domains →</a>`}</div>`;
  const tabs = tabsFor(t);
  const tab = tabs.some(x => x[0] === topicTab) ? topicTab : 'overview';
  // One tab means there is nothing to choose, so the strip is not drawn at all.
  const strip = tabs.length > 1 ? `<div class="tabs topictabs" role="tablist" aria-label="Topic views">${tabs.map(([k, label]) => `<button type="button" role="tab" aria-selected="${k === tab}" tabindex="${k === tab ? 0 : -1}" class="${k === tab ? 'active' : ''}" data-tab="${k}" data-action="topic-tab" data-topic="${id}">${label}</button>`).join('')}</div>` : '';
  // On a wide screen the overview keeps its sections in one column and the page's
  // contents, real games, related concepts and smells in a sticky column beside it.
  const secKeys = [...SECTION_META.map(m => m[0]), ...(t.tech && t.tech.length ? ['tech'] : [])];
  const side = wideJump(secKeys.map(k => [k === 'tech' ? 'Techniques to compare' : secTitle(k), `data-sec="${k}"`])) +
    wideBlock('In real games', inGames.length ? gameFoot.replace(' wdup', '').replace('<span class="overline">In real games</span>', '') : '') +
    topicParts(id).map(([label, items]) => wideBlock(label, chipLinks(items))).join('') + wideBlock('Part of paths', pathsBlock(id)) +
    wideBlock('Related concepts', `<div class="related">${rel}</div>`) + (smells.length ? wideBlock('Design smells this topic helps diagnose', smellChips) : '');
  const body = tab === 'interview' ? topicInterviewBody(t) : (tab === 'godot' || tab === 'unity') ? engineBody(t, tab) : tab === 'go' ? goBody(t) : wide2(overview, side);
  return `<div class="topic-head"><div style="flex:1"><div class="chips" style="margin-bottom:6px">${domChip(t.d)}<span class="chip">${idx+1} of ${d.topics.length}</span></div><h1>${esc(t.t)}</h1><p class="tag">${esc(t.tag)}</p></div>
      ${tab === 'overview' ? `<div class="row"><button type="button" class="btn sm" data-action="expand-all" data-open="1">Expand all</button><button type="button" class="btn sm ghost" data-action="expand-all" data-open="0">Collapse</button></div>` : ''}</div>
    ${strip}<div class="tabbody" role="tabpanel">${body}</div>`;
}
const readMarkHTML = id => seen.has(id)
  ? '<span class="chip ok">Read</span> <button type="button" class="btn sm ghost" data-action="topic-read" data-topic="' + id + '" data-on="0">Mark as not read</button>'
  : '<button type="button" class="btn sm" data-action="topic-read" data-topic="' + id + '" data-on="1">Mark as read</button> <span class="small muted">Counts toward "Topics read".</span>';
ACTIONS['topic-read'] = el => {
  const id = el.dataset.topic; if(el.dataset.on === '1') markSeen(id); else unmarkSeen(id);
  const box = el.closest('.readmark'); if(box) box.innerHTML = readMarkHTML(id);
  const rt = document.querySelector('#rail .railtopic[data-topic="' + id + '"]'); if(rt) rt.classList.toggle('seen', seen.has(id));
};
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
  const head = `${crumbs([['Diagnose']])}<h1>Diagnose</h1><p class="dim">Start from what you observe in players, not from what you built. Each diagnosis ends in an experiment and a prompt.</p>
    <div class="tabs">${tabs.map(([id, t]) => `<button type="button" class="${id===sub?'active':''}" data-href="#/diagnose/${id}">${t}</button>`).join('')}</div>`;
  let body = '';
  if(sub === 'smells') body = smellsView(arg);
  else if(sub === 'fun') body = funView(arg);
  else if(sub === 'loop') body = loopView(arg);
  else if(sub === 'unfair') body = unfairView();
  else if(sub === 'depth') body = depthView();
  else if(sub === 'content') body = contentTreeView();
  // The other diagnostics end in topics and paths as well, so no tab is a dead end.
  if(sub !== 'smells') body =withNext(body, [['Topics to read next', topicChipLinks(diagTopics(sub))], ['Part of paths', pathsBlock('diagnostic:' + sub)]], 'This diagnostic');
  setView(head + body);
  if(sub === 'smells') wireSmellSearch();
  if(sub === 'unfair') wireUnfair();
  if(sub === 'depth') wireDepth();
  if(sub === 'content') wireContentTree();
}

// The topics a diagnostic tab leans on, read from its own data.
function diagTopics(sub){
  if(sub === 'loop') return LOOP_PARTS.flatMap(p => p.top || []);
  if(sub === 'unfair') return UNFAIR_CAUSES.map(c => c.top);
  if(sub === 'fun' || sub === 'smells') return SMELLS.filter(s => sub === 'smells' || s.fun).flatMap(s => s.causes.map(c => c.top)).slice(0, 12);
  return [];
}
function smellCard(s){ return `<a class="smell lnk blk" href="#/smell/${s.id}"><h3>${esc(s.t)}</h3><div class="small dim">${esc(s.sym)}</div><div class="chips" style="margin-top:6px">${s.dom.map(domChip).join('')}</div></a>`; }
// Games that show a smell's causes: those whose lenses list the topics its causes
// name, best match first, each with the lens that lists the topic.
function smellGames(s){
  const tops = [...new Set(s.causes.map(c => c.top))].filter(t => TOPICS[t]), by = {};
  tops.forEach(t => (gameLinks()[t] || []).forEach(({ g, label }) => { const e = by[g.id] || (by[g.id] = { g, topics: new Set(), lens: '' }); e.topics.add(t); const k = (GAME_LENSES.find(l => l[1] === label) || [''])[0]; if(k && !e.lens) e.lens = k; }));
  // A topic many games list says little, so each topic weighs log(all games / games that list it). A game stays when
  // it matches two or more of the causes, or one cause that fewer than a quarter of all games list.
  const total = REFERENCE_GAMES.length, listed = {};
  tops.forEach(t => { listed[t] = new Set((gameLinks()[t] || []).map(x => x.g.id)).size; });
  const weight = t => Math.log(total / Math.max(listed[t], 1));
  const games = Object.values(by).map(e => ({ ...e, score: [...e.topics].reduce((n, t) => n + weight(t), 0) }))
    .filter(e => e.topics.size >= 2 || listed[[...e.topics][0]] < total / 4)
    .sort((a, b) => b.score - a.score || a.g.t.localeCompare(b.g.t));
  return { tops, games };
}
function smellGamesHTML(s){
  const { tops, games } = smellGames(s); if(!games.length) return '';
  const shown = games.slice(0, 6);
  return `<div class="smellgames"><b>See it in games</b><span class="chips">${shown.map(e => `<a class="chip lnk" href="#/games/${e.g.id}${e.lens ? '/' + e.lens : ''}" title="Lists ${[...e.topics].map(t => esc(TOPICS[t].t)).join(', ')}">${esc(e.g.t)}</a>`).join('')}${games.length > shown.length ? `<a class="chip lnk" href="#/games/topic/${tops.join('+')}">More games for these topics →</a>` : ''}</span></div>`;
}
function smellsView(id){
  const s = SMELLS.find(x => x.id === id);
  if(s){
    const { tops, games } = smellGames(s);
    return withNext(`<div class="row between"><a class="btn ghost" href="#/diagnose/smells">← All smells</a><div class="chips">${s.dom.map(domChip).join('')}</div></div>
      <h2 style="margin-top:10px">${esc(s.t)}</h2><p class="dim">${esc(s.sym)}</p>
      ${s.dims ? `<div class="chips" style="margin-bottom:10px"><span class="small muted">Fun dimensions implicated:</span>${s.dims.map(d => `<a class="chip lnk" style="cursor:pointer" href="#/diagnose/fun/${d}">${d}</a>`).join('')}</div>` : ''}
      <h3>Likely causes and the experiment for each</h3>
      ${s.causes.map((c, i) => `<div class="cause"><div class="t"><span class="badge-num" style="--dc:var(--accent)">${i+1}</span>${esc(c.c)} <span class="chip">${topicLink(c.top)}</span></div><div class="exp"><b>Experiment:</b> ${esc(c.exp)}</div></div>`).join('')}
      ${smellGamesHTML(s)}
      <h3 style="margin-top:16px">Ask AI to help diagnose</h3>${promptBox('Diagnostic prompt', s.prompt)}
      <div class="callout"><b>Then:</b> write the hypothesis for the cause you believe most, in the <a href="#/build/hypothesis">Hypothesis Builder</a>. Test the cheapest experiment. Change one important variable. Test again.</div>`,
      [['Topics behind the causes', topicChipLinks(tops)], ['Games that show it', games.length ? chipLinks([...games.slice(0, 6).map(e => ['#/games/' + e.g.id + (e.lens ? '/' + e.lens : ''), e.g.t]), ...(games.length > 6 ? [['#/games/topic/' + tops.join('+'), `More games for these topics`]] : [])]) : ''], ['Part of paths', pathsBlock('smell:' + s.id)]], 'This smell');
  }
  return `<div class="field"><input type="text" id="smellSearch" placeholder="Filter smells: repetitive, build, tutorial, unfair, return…"></div>
    <div class="pill-tabs" id="smellDomFilter"><button type="button" class="active" data-d="">All</button>${DOMAINS.filter(d => SMELLS.some(s => s.dom.includes(d.id))).map(d => `<button type="button" data-d="${d.id}">${esc(d.t)}</button>`).join('')}</div>
    <h2 class="sr-only">Every smell</h2><div class="smell-list" id="smellList">${SMELLS.map(smellCard).join('')}</div>`;
}
function wireSmellSearch(){
  const inp = $('#smellSearch'); if(!inp) return; let dom = '';
  const apply = () => { const q = inp.value.trim().toLowerCase(); $('#smellList').innerHTML = SMELLS.filter(s => (!dom || s.dom.includes(dom)) && (!q || (s.t+' '+s.sym+' '+s.causes.map(c=>c.c).join(' ')).toLowerCase().includes(q))).map(smellCard).join('') || '<div class="empty">No smell matches. Try the global search (Ctrl K) for topics and prompts.</div>'; };
  // No autofocus: focus goes to the heading like every other page, and a
  // focused field would swallow the single-key shortcuts as typed text.
  inp.oninput = apply;
  $$('#smellDomFilter button').forEach(b => b.onclick = () => { $$('#smellDomFilter button').forEach(x => x.classList.remove('active')); b.classList.add('active'); dom = b.dataset.d; apply(); });
}

function funView(dim){
  const funSmells = SMELLS.filter(s => s.fun);
  const active = FUN_DIMS.find(d => d[0] === dim);
  return `<div class="callout"><b>Ask "what is the player actually enjoying here?"</b> not "what feature should we add?" Different games combine these dimensions differently. The working set below draws on LeBlanc's eight kinds of fun, Lazzaro's four keys, Koster's fun-as-learning and Self-Determination Theory. It is a vocabulary, not a law.</div>
    <h3>Dimensions of fun <span class="muted small">click one to see its test question and the smells where it goes flat</span></h3>
    <div class="dims">${FUN_DIMS.map(d => `<button type="button" class="${d[0]===dim?'active':''}" data-href="#/diagnose/fun/${d[0]}">${d[0]}<div class="small muted" style="font-weight:400">${esc(d[1])}</div></button>`).join('')}</div>
    ${active ? `<div class="card" style="margin-top:12px"><h3>${active[0]}</h3><p>${esc(active[1])}</p><p><b>Playtest question:</b> ${esc(active[2])}</p><h4>Smells where ${active[0]} goes flat</h4><div class="smell-list">${funSmells.filter(s => s.dims && s.dims.includes(active[0])).map(smellCard).join('') || '<div class="empty">No smell tagged with this dimension yet.</div>'}</div></div>` : ''}
    <div class="section-head"><h2>Symptom → dimensions → causes → experiments</h2></div>
    <div class="smell-list">${funSmells.map(s => `<a class="smell lnk blk" href="#/smell/${s.id}"><h3>${esc(s.t)}</h3><div class="chips">${(s.dims||[]).map(d => `<span class="chip">${d}</span>`).join('')}</div></a>`).join('')}</div>
    ${promptBox('Ask AI to tag a playtest by fun dimension', `Here are timestamped observer notes from a playtest: [NOTES]. Tag each moment of visible engagement or disengagement with the fun dimension involved (${FUN_DIMS.map(d=>d[0]).join(', ')}). Summarise the distribution, compare it to our intended mix ([INTENDED]), and identify the largest gap. Propose one change to an existing interaction, not a new system, that would close it.`)}`;
}

function loopView(part){
  const p = LOOP_PARTS.find(x => x.id === part) || LOOP_PARTS[0];
  return `<div class="callout">Decision → Action → Consequence → Feedback → New situation. Click a link to see what happens when it is weak. Then fix that link before adding anything.</div>
    <div class="loopviz">${LOOP_PARTS.map(x => `<button type="button" class="${x.id===p.id?'active':''}" data-href="#/diagnose/loop/${x.id}">${esc(x.t)}<small>${esc(x.sub)}</small></button>`).join('')}</div>
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
      <div class="row" style="margin-top:8px"><input type="text" id="newRule" placeholder="Add a rule…" style="flex:1"><button type="button" class="btn" id="addRule">Add</button></div>
      <div id="ruleStats" style="margin-top:12px"></div></div></div>`;
}
function ruleRow(x){ return `<div class="rule"><input type="text" value="${esc(x.r)}" class="rtext"><select class="rkind"><option value="decision" ${x.k==='decision'?'selected':''}>creates a decision</option><option value="interaction" ${x.k==='interaction'?'selected':''}>enables an interaction</option><option value="load" ${x.k==='load'?'selected':''}>load only</option></select><button type="button" class="btn sm ghost danger rdel" title="Remove" aria-label="Remove">✕</button></div>`; }
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
  return `<div class="callout"><b>Content multiplies a good system. It does not rescue a bad one.</b> Before authoring another enemy, level, weapon or quest, answer these in order.</div><div class="grid c2"><div id="ctree"></div><div id="ctreeChart">${diagramCard(contentTreeFlow())}</div></div>`;
}
function wireContentTree(){
  const el = $('#ctree'); if(!el) return; const answers = [];
  const render = () => { let html = ''; let i = 0;
    while(true){ const node = CONTENT_TREE[i]; const a = answers[i];
      html += `<div class="tree-q"><b>${i+1}. ${esc(node.q)}</b><div class="opts"><button type="button" class="${a==='yes'?'sel':''}" data-i="${i}" data-a="yes">Yes</button><button type="button" class="${a==='no'?'sel':''}" data-i="${i}" data-a="no">No</button></div></div>`;
      if(a === undefined) break;
      const nxt = node[a];
      if(typeof nxt === 'string'){ const verdict = nxt.split(':')[0]; html += `<div class="verdict ${verdict.startsWith('ADD')?'BUILD':verdict.startsWith('STOP')?'REMOVE':'SIMPLIFY'}"><h2>${esc(verdict)}</h2><p>${esc(nxt.slice(verdict.length+1).trim())}</p><div class="row"><a class="btn sm" href="#/map/t/content-multiplies">Content multiplies systems</a><a class="btn sm" href="#/map/t/core-loop">The core loop</a></div></div>`; break; }
      i = nxt; }
    el.innerHTML = html + (answers.length ? `<button type="button" class="btn ghost sm" id="ctreeReset" style="margin-top:8px">Start over</button>` : '');
    // Mark the reader's path on the chart: each answered question and where it led.
    const on = new Set(); let k = 0;
    while(answers[k] !== undefined){ on.add('q' + k); const nx = CONTENT_TREE[k][answers[k]]; if(typeof nx === 'number') k = nx; else { on.add('v' + k + answers[k]); break; } }
    if(answers[k] === undefined) on.add('q' + k);
    $$('#ctreeChart .flownode').forEach(n => n.classList.toggle('on', on.has(n.dataset.step)));
    $$('.opts button', el).forEach(b => b.onclick = () => { const i = +b.dataset.i; answers.length = i; answers[i] = b.dataset.a; render(); });
    const r = $('#ctreeReset'); if(r) r.onclick = () => { answers.length = 0; render(); }; };
  render();
}

/* =====================================================================
   BUILD (tools)
   ===================================================================== */
// The first path step that uses a tool, so a card can say where it is taught.
function toolPathStep(id){
  for(const p of PATHS) for(const st of p.stages){ const step = st.steps.find(s => s.kind === 'tool' && s.ref === id); if(step) return { p, st, step }; }
  return null;
}
// On a phone the left column is a drawer, so the tools-by-job list is also part of the Make page itself.
function addMakeJobs(){
  const view = $('#pane .view'); if(!view) return;
  const h1 = view.querySelector('h1');
  const html = `<nav class="makejobs card" aria-label="Tools by job"><div class="overline">Tools by job</div>${TOOL_GROUPS.map(([gid, gt, ids]) => `<div class="toolgroup"><span class="small muted">${esc(gt)}</span><span class="chips">${ids.map(id => { const x = TOOLS.find(y => y[0] === id); return `<a class="chip lnk${id === TOOL_START ? ' ok' : ''}" href="#/build/${id}">${esc(x[1])}${id === TOOL_START ? ' · Start here' : ''}</a>`; }).join('')}</span></div>`).join('')}</nav>`;
  (h1 || view).insertAdjacentHTML(h1 ? 'afterend' : 'afterbegin', html);
}
function toolCardHTML(id){
  const [, t, pitch, when, topic] = TOOLS.find(x => x[0] === id), ps = toolPathStep(id);
  return `<article class="toolcard ${id === TOOL_START ? 'start' : ''}"><a class="toolcard-main" href="#/build/${id}"><b>${esc(t)}</b>${id === TOOL_START ? '<span class="chip ok">Start here</span>' : ''}<span class="small dim">${esc(pitch)}</span></a>
    <p class="small toolwhen"><b>Use this when</b> ${esc(when)}</p>
    <div class="small toollinks">${TOPICS[topic] ? `<a href="#/map/t/${topic}">Why: ${esc(TOPICS[topic].t)}</a>` : ''}${ps ? `<a href="${stepHref(ps.step, ps.p.id, ps.st.id)}">In the path: ${esc(ps.p.t)}</a>` : ''}</div></article>`;
}
function renderBuild(tool){
  const cur = TOOLS.find(x => x[0] === tool);
  if(!cur){
    setView(`${crumbs([['Make','#/lab'],['Build tools']])}<h1>Build tools</h1><p class="dim" style="max-width:820px">Lightweight canvases that force the questions this guide keeps asking, grouped by the job you are doing. Everything saves in your browser and exports Markdown you can paste into a document or a prompt. Not sure where to begin? Open the <a href="#/build/${TOOL_START}">${esc(TOOLS.find(x => x[0] === TOOL_START)[1])}</a>, or the <a href="#/lab">Idea Lab</a> if you have no idea yet.</p>
      ${TOOL_GROUPS.map(([gid, gt, ids]) => `<div class="section-head"><h2>${esc(gt)}</h2></div><div class="toolgrid">${ids.map(toolCardHTML).join('')}</div>`).join('')}`);
    return;
  }
  const head = `${crumbs([['Make','#/lab'],['Build tools','#/build'],[cur[1]]])}<h1>Build</h1><p class="dim">Lightweight canvases that force the questions this guide keeps asking. Everything saves in your browser. Every tool exports Markdown you can paste into a document or a prompt.</p>
    <p class="small toolwhen"><b>Use this when</b> ${esc(cur[3])} ${TOPICS[cur[4]] ? `<a href="#/map/t/${cur[4]}">Why: ${esc(TOPICS[cur[4]].t)}</a>` : ''}</p>
    `;
  // Below the tool, so a phone reaches the tool first; from 1101 px the index column lists the tools and this block is hidden.
  const groups = `<div class="toolgroups" style="margin-top:18px"><h2>Other build tools</h2>${TOOL_GROUPS.map(([gid, gt, ids]) => `<div class="toolgroup"><span class="overline">${esc(gt)}</span><div class="tool-nav">${ids.map(id => { const [, t, s] = TOOLS.find(x => x[0] === id); return `<button type="button" class="${id === tool ? 'active' : ''}" data-href="#/build/${id}">${t}<small>${s}</small></button>`; }).join('')}</div></div>`).join('')}</div>`;
  // the tools load with content/code/tools.js, which the router awaits (contentNeeds)
  const fn = A[{ idea: 'toolIdea', dissect: 'toolDissect', loop: 'toolLoop', canvas: 'toolCanvas', ladder: 'toolLadder', feature: 'toolFeature', hypothesis: 'toolHypothesis', delegate: 'toolDelegate', sysmap: 'toolSysmap', prompt: 'toolPrompt', gameai: 'toolGameAI' }[tool]] || A.toolIdea;
  setView(head + withNext(`<div class="tool" id="tool"></div>${groups}`, [['Topic behind this tool', topicChipLinks([cur[4]])], ['Part of paths', pathsBlock('tool:' + cur[0])]], 'This tool'));
  fn($('#tool'));
}
function field(id, label, hint, val, rows){ return `<div class="field"><label for="${id}">${esc(label)}</label>${rows ? `<textarea id="${id}" rows="${rows}">${esc(val||'')}</textarea>` : `<input type="text" id="${id}" value="${esc(val||'')}">`}${hint ? `<div class="hint">${esc(hint)}</div>` : ''}</div>`; }
function bindForm(key, ids, onChange){ const data = store.get(key, {}); ids.forEach(id => { const el = $('#'+id); if(!el) return; if(data[id] !== undefined && !el.value) el.value = data[id]; el.addEventListener('input', () => { data[id] = el.value; store.set(key, data); onChange && onChange(data); }); }); onChange && onChange(data); return data; }
function outputBox(md){ return `<div class="output promptbox"><pre>${esc(md)}</pre><button type="button" class="btn sm copybtn" data-action="copy">Copy</button></div>`; }
function toolHead(t, p, key){ return `<div class="toolhead"><div><h2>${esc(t)}</h2><p>${p}</p><div class="small muted">Autosaved in this browser. Export copies Markdown.</div></div><button type="button" class="btn ghost sm danger" data-action="clear-tool" data-key="${key}">Clear</button></div>`; }

/* =====================================================================
   AI WORKFLOW
   ===================================================================== */
function renderAI(sub='loop', arg){
  const tabs = [['loop','The 12-step loop'],['ladder','Prompt ladder'],['philosophy','Bottleneck shift'],['roles','AI roles'],['matrix','Responsibility matrix'],['framework','Prompting framework'],['failures','When AI makes it worse']];
  const head = `${crumbs([['AI Workflow']])}<h1>AI Workflow</h1><p class="dim">How to delegate design work to AI without delegating design judgement.</p><div class="tabs">${tabs.map(([id,t]) => `<button type="button" class="${id===sub?'active':''}" data-href="#/ai/${id}">${t}</button>`).join('')}</div>`;
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
    <div class="stepper">${LOOP_STEPS.map(x => `<button type="button" class="${x.n===s.n?'active':''} ${x.n===here?'here':''}" data-href="#/ai/loop/${x.n}"><b>${x.n}</b>${esc(x.t)}</button>`).join('')}</div>
    <div class="card"><div class="row between"><h2 style="margin:0">${s.n}. ${esc(s.t)} <span class="muted" style="font-weight:500;font-size:1rem">${esc(s.goal)}</span></h2><button type="button" class="btn sm ${here===s.n?'primary':''}" data-action="loop-here" data-n="${s.n}">${here===s.n?'✓ We are here':'Mark: we are here'}</button></div>
      <div class="think-grid" style="margin-top:12px"><div class="box" style="border-color:color-mix(in srgb,var(--d-player) 50%,transparent)"><h3 class="h4look" style="color:var(--d-player)">Human does</h3><p>${esc(s.human)}</p></div><div class="box" style="border-color:color-mix(in srgb,var(--d-ai) 50%,transparent)"><h3 class="h4look" style="color:var(--d-ai)">AI does</h3><p>${esc(s.ai)}</p></div><div class="box good"><h3 class="h4look">Output</h3><p>${esc(s.out)}</p><h3 class="h4look">Exit criterion</h3><p>${esc(s.exit)}</p></div><div class="box bad"><h3 class="h4look">Common failure</h3><p>${esc(s.fail)}</p><h3 class="h4look" style="color:var(--fg2)">Go deeper</h3><ul>${s.top.map(t => `<li>${topicLink(t)}</li>`).join('')}</ul></div></div>
      <div class="row" style="margin-top:10px">${s.n>1?`<a class="btn" href="#/ai/loop/${s.n-1}">← ${esc(LOOP_STEPS[s.n-2].t)}</a>`:''}${s.n<12?`<a class="btn" href="#/ai/loop/${s.n+1}">${esc(LOOP_STEPS[s.n].t)} →</a>`:`<a class="btn" href="#/ai/loop/1">Repeat → Define</a>`}</div></div>
    <div class="section-head"><h2>Versus the workflow that fails</h2></div>
    <div class="grid c2"><div class="card" style="border-color:color-mix(in srgb,var(--ok) 50%,transparent)"><h3 class="h4look" style="color:var(--ok)">Hypothesis-driven</h3>${chainHTML([['Hypothesis','#/map/t/hypothesis-driven-design'],['Prototype','#/map/t/prototyping'],['Test','#/map/t/playtesting'],['Evidence','#/map/t/iteration-and-evidence'],['Decision','#/ai/loop/9']])}<p class="small dim">Scope follows validated value: Idea → Prototype → Evidence → Commit.</p></div>
    <div class="card" style="border-color:color-mix(in srgb,var(--bad) 50%,transparent)"><h3 class="h4look" style="color:var(--bad)">Hope-driven</h3>${chainHTML([['Idea','#/map/t/scope-control'],['Huge implementation','#/ai/failures'],['Polish','#/map/t/polish-when'],['Hope','#/map/t/ai-failure-modes']])}<p class="small dim">Idea → Production commitment. AI makes this cheaper and therefore more tempting.</p></div></div>`;
}
function aiPhilosophyView(){
  const t = TOPICS['bottleneck-shift'];
  return `<div class="card"><h2>AI changes the bottleneck</h2>
    <div class="workflow-compare"><div><h4>Traditional</h4>${chainHTML([['Human thinks','#/map/t/bottleneck-shift','human'],['Human designs','#/map/t/bottleneck-shift','human'],['Human documents','#/map/t/bottleneck-shift','human'],['Human implements','#/map/t/bottleneck-shift','human']])}</div>
    <div><h4>AI era</h4>${chainHTML([['Human frames','#/map/t/prompting-framework','human'],['AI expands, searches, analyses','#/map/t/ai-roles','ai'],['Human judges','#/map/t/verifying-ai-output','human'],['AI prototypes, implements','#/map/t/ai-for-implementation','ai'],['Players provide evidence','#/map/t/playtesting','evidence'],['Human decides','#/map/t/iteration-and-evidence','human'],['AI iterates','#/ai/loop','ai']])}</div></div>
    <div class="bottleneck" style="margin-top:14px"><div class="col"><h4>No longer the bottleneck</h4><ul><li class="strike">writing</li><li class="strike">coding</li><li class="strike">generating content</li><li class="strike">producing variations</li><li class="strike">documentation</li></ul></div><div class="mid">→</div><div class="col"><h4>The bottleneck now</h4><ul><li>taste</li><li>judgement</li><li>problem framing</li><li>prioritisation</li><li>understanding players</li><li>recognising fun</li><li>separating signal from noise</li><li>making tradeoffs</li><li>knowing what NOT to build</li></ul></div></div>
    <div class="quotebig">AI can generate possibilities extremely cheaply. Humans must decide what is worth making.</div>
    <div class="quotebig" style="border-left-color:var(--bad)">A polished bad idea is still a bad game.</div>
    <div class="grid c2" style="margin-top:12px"><div class="box"><h4>Questions to ask yourself weekly</h4>${list(t.think.q)}</div><div class="box"><h4>Traps</h4>${list(t.think.traps)}</div></div>
    <div class="row" style="margin-top:12px"><a class="btn" href="#/map/t/bottleneck-shift">Full topic: the bottleneck shift</a><a class="btn" href="#/map/t/scope-control">Scope control</a><a class="btn" href="#/map/t/craft-engineer-in-the-ai-era">What is expected of an engineer now</a></div>
    <div class="callout" style="margin-top:14px"><b>Field note (2024 to 2026):</b> industry surveys and GDC talks in this period report designers using generative AI mostly for research, brainstorming, code assistance and prototyping rather than shipped assets, with widespread concern about generic output and volume over quality. The practitioners who report it working keep the first prototype, use AI to widen options rather than choose them, and validate with playtests. That is the pattern this guide encodes.</div></div>`;
}
function aiRolesView(arg){
  return `<div class="callout">Ask for a role, not for "ideas". Click a card for when to use it, when to keep it away, a starter prompt and what to verify. None of the nine roles is "decider".</div>
    <div class="grid c3">${ROLES.map(r => `<div class="role ${arg===r.id?'open':''}" id="role-${r.id}"><h3 style="color:var(--d-ai)">${esc(r.t)}</h3><p class="dim" style="margin:0">${esc(r.job)}</p><div class="more"><h4 style="color:var(--ok)">Use when</h4>${list(r.use)}<h4 style="color:var(--bad)">Do not use when</h4>${list(r.avoid)}${promptBox('Starter prompt', r.starter)}<h4>Verify</h4>${list(r.verify)}</div><div class="small muted" style="margin-top:6px">click to ${arg===r.id?'collapse':'expand'}</div></div>`).join('')}</div>
    <div class="section-head"><h2>A good sequence</h2></div>${chainHTML([['Brainstormer','#/ai/roles/brainstormer','ai'],['Critic','#/ai/roles/critic','ai'],['Systems designer','#/ai/roles/systems','ai'],['Human decides what to test','#/map/t/hypothesis-driven-design','human'],['Prototype engineer','#/ai/roles/engineer','ai'],['Players','#/map/t/playtesting','evidence'],['Playtest analyst','#/ai/roles/analyst','ai'],['Human interprets and decides','#/ai/loop/9','human'],["Devil's advocate before commit",'#/ai/roles/devil','ai'],['Content generator, after validation','#/ai/roles/content','ai']])}`;
}
function aiMatrixView(){
  return `<div class="callout">Decide who owns each task before the work starts. <span class="chip human">PRIMARY human</span> <span class="chip ai">PRIMARY AI</span> <span class="chip shared">Shared</span> Click a row for the reason. Filter to see the pattern: judgement stays human, volume, simulation and production go to AI.</div>
    <div class="pill-tabs" id="mxFilter"><button type="button" class="active" data-f="">All</button><button type="button" data-f="human">Human primary</button><button type="button" data-f="ai">AI primary</button><button type="button" data-f="shared">Shared</button></div>
    <div class="tablewrap"><table class="matrix"><thead><tr><th>Task</th><th>Human</th><th>AI</th></tr></thead><tbody id="mxBody">${MATRIX.map((m, i) => { const cls = m[1]==='PRIMARY'&&m[2]!=='PRIMARY' ? 'human' : m[2]==='PRIMARY'&&m[1]!=='PRIMARY' ? 'ai' : 'shared'; return `<tr data-f="${cls}" data-i="${i}" style="cursor:pointer"><td>${esc(m[0])}</td><td class="who"><span class="chip ${m[1]==='PRIMARY'?'human':''}">${m[1]}</span></td><td class="who"><span class="chip ${m[2]==='PRIMARY'?'ai':''}">${m[2]}</span></td></tr><tr class="why hidden" data-for="${i}"><td colspan="3" class="small dim" style="background:var(--bg2)">${esc(m[3])}</td></tr>`; }).join('')}</tbody></table></div>
    <div class="row" style="margin-top:12px"><a class="btn" href="#/build/delegate">Plan your own tasks in the Delegation Planner</a><a class="btn" href="#/map/t/responsibility-matrix">Read the topic</a></div>`;
}
function wireMatrix(){
  $$('#mxBody tr[data-i]').forEach(r => r.onclick = () => { const w = $(`#mxBody tr.why[data-for="${r.dataset.i}"]`); w.classList.toggle('hidden'); });
  $$('#mxFilter button').forEach(b => b.onclick = () => { $$('#mxFilter button').forEach(x => x.classList.remove('active')); b.classList.add('active'); const f = b.dataset.f; $$('#mxBody tr[data-i]').forEach(r => { const show = !f || r.dataset.f === f; r.classList.toggle('hidden', !show); const w = $(`#mxBody tr.why[data-for="${r.dataset.i}"]`); if(!show) w.classList.add('hidden'); }); });
}
function aiFrameworkView(){
  const terms = FORMULA_TERMS;
  return `<div class="callout">The best prompt is rarely "give me ideas". It is: <i>here is the player, fantasy, current loop, constraints, evidence and known problems, analyse the design space, identify assumptions, generate alternatives, compare tradeoffs, and propose the smallest experiments that distinguish between them.</i></div>
    <div class="formula" id="fmla">${terms.map((t,i) => `<button type="button" data-i="${i}" class="${i===0?'active':''}">${t[0]}</button>`).join('<span class="plus">+</span>')}</div>
    <div class="card" id="fmlaInfo"><h3>${terms[0][0]}</h3><p>${esc(terms[0][1])}</p></div>
    <div class="grid c2" style="margin-top:14px"><div class="card" style="border-color:color-mix(in srgb,var(--bad) 50%,transparent)"><h4 style="color:var(--bad)">Weak</h4><pre>Design a fun combat system.</pre><p class="small dim">No player, no fantasy, no constraint, no evidence, no role, no output shape. You will get the genre average with confidence.</p></div>
    <div class="card" style="border-color:color-mix(in srgb,var(--ok) 50%,transparent)"><h4 style="color:var(--ok)">Strong</h4>${promptBox('', `Act as a skeptical systems designer. Here is the intended player fantasy, target skill level, desired decision density, and current prototype: [CONTEXT]. Generate 5 mechanically distinct solutions. For each, identify the player decision created, intended emotion, likely failure mode, implementation complexity, and what evidence would validate or invalidate the hypothesis. Do not recommend a solution yet.`)}${promptBox('Then', `Now challenge these concepts. Assume the game feels repetitive after 20 minutes. Identify which underlying decisions are too shallow and propose the smallest experiments that could test your diagnosis.`)}</div></div>
    <div class="row" style="margin-top:12px"><a class="btn primary" href="#/build/prompt">Open the Prompt Generator</a><a class="btn" href="#/prompts">Prompt library</a><a class="btn" href="#/map/t/prompting-framework">Read the topic</a></div>`;
}
const FORMULA_TERMS = [['CONTEXT','Player, fantasy, core loop, systems. The world as it is. Without it you get the genre average.'],['INTENT','The experience you want and the decision you need to make. Without it the AI picks the decision.'],['CONSTRAINTS','Platform, scope, team, off-limits. Without them you get the biggest plausible answer.'],['EVIDENCE','Playtest results, telemetry, known problems. Without it the task should be "design the test", not "design the feature".'],['ROLE','The stance: skeptical systems designer, UX researcher, devil’s advocate. Without it you get mild everything.'],['TASK','Analyse, generate N, compare, simulate, build with logging. Specific verbs and counts.'],['OUTPUT FORMAT','A table, a ranked list, code with an exposed tuning panel, a hypothesis in standard form. How you will consume it.'],['CRITIQUE','What the AI must attack in its own output and what it must not do: recommend, decide, add scope.']];
function wireFramework(){ $$('#fmla button').forEach(b => b.onclick = () => { $$('#fmla button').forEach(x => x.classList.remove('active')); b.classList.add('active'); const t = FORMULA_TERMS[+b.dataset.i]; $('#fmlaInfo').innerHTML = `<h3>${esc(t[0])}</h3><p>${esc(t[1])}</p>`; }); }
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
  setView(`${crumbs([['Diagnose','#/diagnose'],['Playtest']])}<h1>Playtest: the truth machine</h1><p class="dim">Observe players instead of defending your design. Turn hypotheses into experiments, and keep AI in analysis while humans interpret and decide.</p>
    <div class="quotebig">What players say is useful. What players do is evidence. Neither should be interpreted without context.</div>
    <div class="grid c3">
      <div class="card"><h3>Say</h3><p class="small">Interviews, surveys, think-aloud. Reveals intent and mental models. Biased by politeness, memory and what they think you want. Ask open questions, after play, from behaviour to opinion.</p></div>
      <div class="card"><h3>Do</h3><p class="small">Silent observation, logs, replays, retention. Reveals what actually happened. Silent about why. Log hesitation, repetition, drift, experimentation, quits, with timestamps.</p></div>
      <div class="card"><h3>Context</h3><p class="small">What was intended, what changed since last time, who the tester is, what the room felt like. Only the human in the room has it. It is why AI analyses and humans interpret.</p></div>
    </div>
    <div class="section-head"><h2>Question bank</h2><span class="muted">Not "is it fun?" These.</span></div>
    <div class="grid c2">${bank.map(([g, qs]) => `<div class="card"><h4>${g}</h4>${list(qs)}</div>`).join('')}</div>
    <div class="section-head"><h2>Methods and what each is for</h2></div>
    <div class="tablewrap"><table><thead><tr><th>Method</th><th>Reveals</th><th>Blind to</th><th>AI can</th></tr></thead><tbody>
      <tr><td>Silent observation</td><td>Behaviour, hesitation, confusion, replay</td><td>Intent, feeling</td><td>Code timestamped notes into clusters</td></tr>
      <tr><td>Think-aloud</td><td>Mental model, intent</td><td>Distorts behaviour and pace</td><td>Transcribe. Extract model statements</td></tr>
      <tr><td>Task-based usability</td><td>Whether specific things can be done</td><td>Engagement</td><td>Design tasks. Compute success and time</td></tr>
      <tr><td>Interview</td><td>Memory, meaning, what stuck</td><td>Accuracy. Politeness bias</td><td>Draft non-leading guides. Code answers</td></tr>
      <tr><td>Telemetry</td><td>Choices, retries, session ends at scale</td><td>Why</td><td>Correlate with observed events. Find distributions</td></tr>
      <tr><td>Replay analysis</td><td>Strategies, unintended approaches</td><td>What the player was thinking</td><td>Classify approaches. Count variety</td></tr>
      <tr><td>Retention</td><td>Whether they came back</td><td>Everything else</td><td>Segment by first-session behaviour</td></tr></tbody></table></div>
    <div class="section-head"><h2>Session flow</h2></div>
    ${chainHTML([['Write the question and hypothesis','#/build/hypothesis','human'],['Recruit matched players','#/map/t/who-is-the-player','human'],['Silent observation, timestamped notes','#/map/t/playtesting','evidence'],['Tasks if needed','#/map/t/ux-as-design','evidence'],['Open interview, behaviour first','#/map/t/playtesting','evidence'],['AI codes and clusters','#/map/t/ai-for-playtest-analysis','ai'],['Human adds context, interprets','#/ai/loop/8','human'],['Decide one or two changes','#/ai/loop/9','human'],['Log it','#/map/t/iteration-and-evidence','human']])}
    <div class="grid c2" style="margin-top:12px"><div class="card"><h3>Hypothesis first</h3><p class="dim small">Write it before the session so the observation cannot be rationalized afterwards.</p><a class="btn primary" href="#/build/hypothesis">Open the Hypothesis Builder</a></div><div class="card"><h3>Prepare the session</h3><p class="dim small">Question, players, protocol, and what happens after.</p><a class="btn" href="#/checklists/playtest-prep">Open the preparation checklist</a> <a class="btn" href="#/checklists/onboarding-audit">Silent onboarding audit</a></div></div>
    <div class="section-head"><h2>Prompts</h2></div>
    ${promptBox('Observation protocol', PROMPT_TEMPLATES.find(p=>p.id==='playtest-analysis') ? `We are testing the hypothesis "[HYPOTHESIS]" with [N] players matching [PLAYER MODEL] for [MINUTES]. Design a silent observation protocol: what to log with timestamps (hesitations, repeats, drift, experiments, quits, speech), a task list if needed, and an interview guide of open, non-leading questions ordered from behaviour to opinion. Include a coding scheme and a results template that separates behaviour from self-report.` : '')}
    ${promptBox('Analysis without recommendations', PROMPT_TEMPLATES.find(p=>p.id==='playtest-analysis').p.replace(/\{\{(\w+)\}\}/g, '[$1]'))}
    <div class="callout warn"><b>The rule:</b> ask AI to analyse in one pass and, only afterwards and separately, to hypothesize causes. Never let the analysis output become the change list. Read ${topicLink('ai-for-playtest-analysis')} and ${topicLink('playtesting')}.</div>`);
}

/* =====================================================================
   PROMPTS
   ===================================================================== */
function renderPrompts(id){
  const cats = [...new Set(PROMPT_TEMPLATES.map(p => p.cat))];
  const sel = PROMPT_TEMPLATES.find(p => p.id === id);
  setView(`${crumbs([['Library','#/games'],['Prompts']])}<h1>Prompt library</h1><p class="dim">Reusable patterns built on the formula. Fill the variables. The prompt updates live. Every template ends with a stop or critique instruction so the AI does not decide for you.</p>
    <div class="split"><aside class="side sticky"><button type="button" class="btn side-toggle" data-action="toggle-parent"><span>☰ Browse templates</span><span class="car">▸</span></button>${cats.map(c => `<div class="dom open"><button type="button" style="cursor:default"><span class="dot" style="background:var(--d-ai)"></span>${c}</button><div class="topics">${PROMPT_TEMPLATES.filter(p => p.cat===c).map(p => `<button type="button" class="${p.id===id?'active':''}" data-href="#/prompts/${p.id}">${esc(p.t)}</button>`).join('')}</div></div>`).join('')}</aside>
    <div id="promptMain">${sel ? '' : `<div class="grid auto">${PROMPT_TEMPLATES.map(p => `<a class="card clickable lnk blk" href="#/prompts/${p.id}"><span class="chip ai">${p.cat}</span><h3 style="margin-top:6px">${esc(p.t)}</h3><p class="small dim" style="margin:0">${esc(snip(p.p, 140))}</p></a>`).join('')}</div><div class="callout" style="margin-top:14px">Want to compose your own? The <a href="#/build/prompt">Prompt Generator</a> walks the eight terms. Topic pages each carry prompts specific to that concept.</div>`}</div></div>`);
  if(sel){
    const saved = store.get('promptVars.'+sel.id, {});
    const main = $('#promptMain');
    const others = PROMPT_TEMPLATES.filter(p => p.id !== sel.id && p.cat === sel.cat).map(p => ['#/prompts/' + p.id, p.t]);
    main.innerHTML = withNext(`<span class="chip ai">${sel.cat}</span><h2 style="margin-top:6px">${esc(sel.t)}</h2>${sel.vars.length ? `<div class="grid c2">${sel.vars.map(v => `<div class="field"><label>${v.replace(/_/g,' ')}</label><textarea rows="2" data-v="${v}">${esc(saved[v]||'')}</textarea></div>`).join('')}</div>` : '<p class="small muted">No variables: paste this as a follow-up to any AI output.</p>'}<h4>Prompt</h4><div id="pOut"></div>
      <div class="callout"><b>After the output:</b> run the <a href="#/prompts/verify">verification pass</a>. Then write the <a href="#/build/hypothesis">hypothesis</a> for what you will test.</div>`,
      [['Topics behind this prompt', topicChipLinks(sel.topics)], ['Part of paths', pathsBlock('prompt:' + sel.id)], ['More in this group', chipLinks(others)]], 'This prompt');
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
  const tabs = CHECKLISTS.map(c => `<button type="button" class="${c.id===sel.id?'active':''}" data-href="#/checklists/${c.id}">${esc(c.t)}</button>`).join('');
  setView(`${crumbs([['Library','#/games'],['Checklists']])}<h1>Checklists</h1><p class="dim">Practical reviews. Checkbox state is saved per checklist. Reset when you start a new feature or session.</p>
    <div class="pill-tabs cktabs">${tabs}</div>
    ${withNext(`<div class="card"><div class="row between"><div><h2>${esc(sel.t)}</h2><p class="dim" style="margin:0">${esc(sel.desc)}</p></div><div class="row"><span class="chip" id="ckCount"></span><button type="button" class="btn sm" id="ckExport">Export Markdown</button><button type="button" class="btn sm ghost danger" id="ckReset">Reset</button></div></div>
      <div class="grid c2 fill" style="margin-top:12px">${sel.groups.map(([g, items], gi) => `<div class="checklist"><h4>${esc(g)}</h4>${items.map((it, ii) => { const k = gi+'.'+ii; return `<label class="${state[k]?'done':''}"><input type="checkbox" data-k="${k}" ${state[k]?'checked':''}><span>${esc(it)}</span></label>`; }).join('')}</div>`).join('')}</div></div>`,
      [['Topics behind this checklist', topicChipLinks(sel.topics)], ['Platform guides', chipLinks((sel.platforms || []).map(id => PLATFORMS.find(p => p.id === id)).filter(Boolean).map(p => ['#/platforms/' + p.id, p.t]))], ['Part of paths', pathsBlock('checklist:' + sel.id)]], 'This checklist')}`);
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
// Every dated fact in the data, grouped by the page that cites it: [title, href, facts] for topics, platform
// and engine guides, and the curated channels.
const hostOf = src => { try { return new URL(src).hostname.replace(/^www\./, ''); } catch(e) { return src; } };
// Every dated fact's source, grouped by page: read from every topic's and guide's
// long fields, so the build works it out (citedSourcesData in 85-shared.js).
function citedSources(){ return PlayableContent.blob('cited') || []; }
function citedHTML(){
  const groups = citedSources(), n = groups.reduce((k, g) => k + g[2].length, 0), hosts = new Set(groups.flatMap(g => g[2].map(f => hostOf(f.src))));
  if(!n) return '';
  const item = f => `<li><a href="${esc(f.src)}" target="_blank" rel="noopener noreferrer">${esc(hostOf(f.src))}</a> <span class="small muted">checked ${esc(f.asOf)}</span></li>`;
  return `<div class="section-head"><h2>Cited across the site</h2><span class="muted">${n} dated facts, ${hosts.size} sites</span></div>
    <details class="card cited"><summary><b>Every source behind a dated fact</b>, grouped by the page that cites it</summary>
    <p class="small dim">Built from the data, so it cannot drift from the pages. Each line is the site and the day the fact was last checked. Open the source before you rely on a number.</p>
    <div class="citedlist">${groups.map(([t, href, facts]) => `<details class="citedgroup"><summary><a href="${href}">${esc(t)}</a> <span class="muted small">${facts.length}</span></summary><ul class="pfacts">${facts.map(item).join('')}</ul></details>`).join('')}</div></details>`;
}
function renderSources(){
  const tag = k => ({research:'<span class="chip ok">research-backed</span>', heuristic:'<span class="chip">practitioner heuristic</span>', contested:'<span class="chip warn">contested</span>', practice:'<span class="chip shared">practice</span>'})[k];
  setView(`${crumbs([['Library','#/games'],['Sources and lineage']])}<h1>Sources and lineage</h1><p class="dim" style="max-width:820px">This guide synthesises established game-design thinking rather than inventing a framework. Nothing here is a law. Most of it is practitioner heuristics that have survived across genres. A few items rest on research. Several are contested and marked as such. Verify against your players.</p>
    <h2>The frameworks it draws on</h2><div class="grid c2 fill">${SOURCES.map(s => `<div class="card"><div class="row between"><h3 style="margin:0">${esc(s[0])}</h3>${tag(s[3])}</div><p style="margin:8px 0 6px">${esc(s[1])}</p><div class="small muted">${esc(s[2])}</div></div>`).join('')}</div>
    ${citedHTML()}
    <div class="callout" style="margin-top:14px"><b>How the synthesis was done.</b> Frameworks were checked for attribution and date. Where a maxim is routinely misquoted, the guide states the original intent. Where a template has no game-specific origin (the hypothesis form), the guide says so. Where ideas conflict (definitions of fun, flow literalism, player types), they are presented as lenses and the reader is told to test against players.</div>`);
}

/* =====================================================================
   EXPERIENCE: anonymised case studies
   ===================================================================== */
// A snippet cut on a word boundary; "…" only when text was actually cut.
function caseCard(c){ return `<a class="card clickable tint lnk blk" style="--dc:var(--accent2)" href="#/experience/${c.id}"><h3>${esc(c.t)}</h3>${c.sub ? `<div class="casesub">${esc(c.sub)}</div>` : ''}<div class="small muted">${esc(c.role)} · ${esc(c.period)}</div><p class="dim small" style="margin:6px 0 0"><span class="csnip">${esc(snip(c.context, 180))}</span><span class="cfull">${esc(c.context)}</span></p><div class="chips" style="margin-top:8px">${c.stack.slice(0, 5).map(s => `<span class="chip">${esc(s)}</span>`).join('')}</div></a>`; }
// The head is separate from the body because the project page puts a tab
// strip between them: the codename, its description and the chips stay put
// while Overview, Workflows and Interview swap underneath.
function caseHead(c){
  return `${crumbs([['Projects','#/experience'],[c.t]])}
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
    <div class="topic-nav"><a class="btn ghost" href="#/experience/${c.id}">← ${esc(c.t)}</a></div>`;
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
    <div class="topic-nav">${prev ? `<a class="btn" href="#/experience/${c.id}/${s.id}/${prev.id}">← ${esc(prev.t)}</a>` : `<a class="btn ghost" href="#/experience/${c.id}/${s.id}">← ${esc(s.t)}</a>`}<a class="btn ghost" href="#/experience/${c.id}">Project</a>${next ? `<a class="btn" href="#/experience/${c.id}/${s.id}/${next.id}">${esc(next.t)} →</a>` : `<a class="btn" href="#/experience">All projects →</a>`}</div>`;
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
  const strip = tabs.length > 1 ? `<div class="tabs topictabs" role="tablist" aria-label="Project views">${tabs.map(([k, label]) => `<button type="button" role="tab" aria-selected="${k === tab}" tabindex="${k === tab ? 0 : -1}" class="${k === tab ? 'active' : ''}" data-tab="${k}" data-action="proj-tab" data-case="${c.id}">${label}</button>`).join('')}</div>` : '';
  const body = tab === 'workflows' ? workflowsBody(c)
    : tab === 'interview' ? interviewBody(c.iv, 'var(--accent2)', 'story.' + c.id)
    : withNext(casePage(c), [['Related topics', topicChipLinks((c.rel || []).map(r => r[0]))], ['Part of paths', pathsBlock('case:' + c.id)]], 'This project');
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
    <div class="topic-nav">${prev ? `<a class="btn" href="#/experience/${c.id}/flow/${prev.id}">← ${esc(prev.t)}</a>` : `<a class="btn ghost" href="#/experience/${c.id}/workflows">← All workflows</a>`}<a class="btn ghost" href="#/experience/${c.id}">Project</a>${next ? `<a class="btn" href="#/experience/${c.id}/flow/${next.id}">${esc(next.t)} →</a>` : `<a class="btn" href="#/experience/${c.id}">${esc(c.t)} →</a>`}</div>`;
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
  setView(`${crumbs([['Projects']])}<h1>Projects</h1><p class="dim" style="max-width:820px">The author’s own shipped projects, anonymised: codenames replace the real names, and the techniques are what travels.</p><p class="dim" style="max-width:820px">Shipped work told the way an interview actually asks for it: the shape of the system, the decisions and what each one cost, what went wrong, and the stories that go with them. Anonymised on purpose. The technique travels, the names do not.</p>
    ${CASE_STUDIES.length ? `<div class="grid auto fit">${CASE_STUDIES.map(caseCard).join('')}</div>` : '<div class="empty">No case studies yet. They live in src/40-cases.js and appear here as soon as one is written.</div>'}`);
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
// Days are counted in the reader's time zone, so "tomorrow" starts at their
// midnight, not at midnight UTC (hours away, or minutes, for most readers).
const today = () => { const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); };
// Private counters for the path game's walking-cost check (#/play/stats).
function rpgCount(k, v = 1){ const s = store.get('rpg.stats', {}); s[k] = (s[k] || 0) + v; store.set('rpg.stats', s); }
const reviewItems = () => Object.fromEntries(Object.entries(store.get('review', {})).filter(([, r]) => r && typeof r === 'object' && !Array.isArray(r)));
const reviewDue = () => Object.entries(reviewItems()).filter(([, r]) => r.due <= today());
ACTIONS['reload-page'] = () => location.reload();
ACTIONS['review-toggle'] = el => {
  const items = reviewItems(), k = el.dataset.key, body = el.closest('.body'), q = el.closest('details').querySelector('summary').textContent;
  if(items[k]) delete items[k];
  else items[k] = { q, a: body.querySelector('p').textContent, src: location.hash, box: 0, due: today() + REVIEW_DAYS[0] };
  store.set('review', items);
  const on = !!items[k]; el.setAttribute('aria-pressed', on); el.textContent = on ? 'In your review queue' : 'Review later';
  toast(on ? 'Added to your review queue; it comes back tomorrow' : 'Removed from your review queue');
};
ACTIONS['review-grade'] = el => {
  const items = reviewItems(), r = items[el.dataset.key]; if(!r) return;
  r.box = el.dataset.grade === 'got' ? Math.min(REVIEW_DAYS.length - 1, r.box + 1) : 0;
  r.due = today() + REVIEW_DAYS[r.box];
  store.set('review', items); rpgCount('pageReviews'); renderReview();
};
// "Practise now": a run through questions that are not due yet, soonest first. It never
// touches their schedule, so the spacing stays what the rules say.
let practiseOn = false; const practiseDone = new Set();
ACTIONS['review-practise'] = () => { practiseOn = true; practiseDone.clear(); renderReview(); };
ACTIONS['review-practise-next'] = el => { practiseDone.add(el.dataset.key); renderReview(); };
ACTIONS['review-practise-end'] = () => { practiseOn = false; practiseDone.clear(); renderReview(); };
ACTIONS['review-remove'] = el => { const items = reviewItems(); delete items[el.dataset.key]; store.set('review', items); renderReview(); };
function renderReview(){
  const all = Object.entries(reviewItems()), due = reviewDue(), later = all.length - due.length;
  const upcoming = all.filter(([, r]) => r.due > today()).sort((a, b) => a[1].due - b[1].due);
  const next = upcoming.length ? upcoming[0][1].due : undefined;
  const practise = practiseOn && !due.length ? upcoming.slice(0, 5).filter(([k]) => !practiseDone.has(k)) : [];
  const inDays = n => `in ${n} day${n === 1 ? '' : 's'}`;
  const card = ([k, r], practice) => `<details class="ivq review-item"><summary>${esc(r.q)}</summary><div class="body">
      <h4>Answer outline</h4><p>${esc(r.a)}</p>
      <div class="row">${practice ? `<button type="button" class="btn sm" data-action="review-practise-next" data-key="${esc(k)}">Done, next</button>` : `<button type="button" class="btn sm" data-action="review-grade" data-key="${esc(k)}" data-grade="got">I recalled it</button><button type="button" class="btn sm ghost" data-action="review-grade" data-key="${esc(k)}" data-grade="again">Not yet</button>`}<a class="btn sm ghost" href="${esc(r.src)}">Open the source</a><button type="button" class="btn sm ghost danger" data-action="review-remove" data-key="${esc(k)}">Remove</button></div></div></details>`;
  const pcard = e => card(e, true);
  setView(`${crumbs([['Paths','#/paths'],['Review']])}<h1>Review</h1>
    <p class="dim" style="max-width:820px">Answer each question in your head or out loud first, then open it and compare with the outline. Recalled questions come back after a longer gap; missed ones come back tomorrow. No streaks: skip a day and the queue simply waits.</p>
    ${all.length ? `<div class="section-head"><h2>Due today</h2><span class="muted">${due.length} of ${all.length} questions${later ? ` · ${later} later${next ? `, next ${inDays(next - today())}` : ''}` : ''}</span></div>
    ${due.length ? `<div class="ivlist">${due.map(card).join('')}</div>` : practiseOn ? `<div class="callout"><b>Practice run.</b> These are not due yet, so this does not change when they come back. <button type="button" class="btn sm ghost" data-action="review-practise-end">Stop practising</button></div>${practise.length ? `<div class="ivlist">${practise.map(pcard).join('')}</div>` : '<div class="empty">That is the practice run done. Your schedule is unchanged.</div>'}` : `<div class="empty">Nothing is due today. A question comes back a day after you add it, and each time you recall it the gap doubles (1, 2, 4, 8, then 16 days). <div class="row" style="margin-top:8px"><button type="button" class="btn sm" data-action="review-practise">Practise now</button><span class="small muted">Practice does not change the schedule.</span></div></div>`}
    ${upcoming.length ? `<details class="review-later"><summary>Coming up (${upcoming.length})</summary><ul>${upcoming.map(([k, r]) => `<li><span>${esc(r.q)}</span><span class="small muted">${inDays(r.due - today())}</span><button type="button" class="btn sm ghost danger" data-action="review-remove" data-key="${esc(k)}">Remove</button></li>`).join('')}</ul></details>` : ''}`
    : '<div class="empty">The queue is empty. Open any interview question (a topic\'s Interview tab, a project\'s questions) or a checkpoint question on a learning path, and press "Review later". It comes back a day later, then after longer gaps each time you recall it.</div>'}`);
}

/* =====================================================================
   LEARNING PATHS
   A path sequences existing content; it never duplicates it. Progress is
   { steps:{'<stageId>/<i>':true}, stages:{'<stageId>':'done'|'skipped'},
   check:{'<stageId>':{at, mode, n, got, partial, missed}}, started, last }
   under localStorage key path.<id>; check holds the last checkpoint result. `paths.active` names
   the one path the path bar (see pathBarHTML, called from setView) tracks
   across every route. stepTitle/stepHref are pure globals defined in
   50-paths.js so the path map (89-graph.js) can use them too.
   ===================================================================== */
function pathProgress(id){
  const p = store.get('path.' + id, {}), plain = v => v && typeof v === 'object' && !Array.isArray(v);
  return Object.assign({ started:null, last:null }, p, { steps: plain(p.steps) ? p.steps : {}, stages: plain(p.stages) ? p.stages : {}, check: plain(p.check) ? p.check : {} });
}
function savePathProgress(id, prog){ store.set('path.' + id, prog); }
function trackLabel(id){ const x = TRACKS.find(t => t[0] === id); return x ? x[1] : id; }
function levelLabel(id){ const x = LEVELS.find(l => l[0] === id); return x ? x[1] : id; }
/** True when a path names any prerequisite, all-of or one-of. */
function hasPrereq(p){ return p.prereq.length > 0 || (p.prereqAny || []).length > 0; }
/** A path's prerequisites as HTML: the all-of ones, then "one of A or B" for prereqAny. @param {{prereq:string[], prereqAny?:string[]}} p @param {(id:string)=>string} fmt @param {string} join */
/** A long prereqAny list, shortened to one line with the full list in an expander. @param {{prereq:string[], prereqAny?:string[]}} p */
function prereqSummaryHtml(p){
  const any = p.prereqAny || [], design = any.every(id => (PATHS.find(x => x.id === id) || {}).track === 'design'), eng = any.every(id => (PATHS.find(x => x.id === id) || {}).track === 'engineering');
  const kind = design ? 'design ' : eng ? 'engineering ' : '';
  return `${p.prereq.length ? p.prereq.map(pathLinkChip).join(', ') + ', and ' : ''}Any one ${kind}path (or equivalent experience) <details class="small" style="display:inline-block;vertical-align:top"><summary>Show the list</summary>${any.map(pathLinkChip).join(', ')}</details>`;
}
function prereqHtml(p, fmt, join){ const parts = p.prereq.map(fmt); if((p.prereqAny || []).length) parts.push(`one of ${p.prereqAny.map(fmt).join(', ')}`); return parts.join(join); }
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
function nextStepLabel(next){ return next ? (next.type === 'step' ? stepTitle(next.step) : `checkpoint for ${next.stage.t}`) : 'All stages complete'; }
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
// Ticking re-renders the same page in place, then brings the next unticked
// step of the open stage into view.
function tickPathStep(pathId, key, checked){
  const prog = pathProgress(pathId); prog.steps[key] = !!checked; prog.last = Date.now(); if(!prog.started) prog.started = prog.last;
  savePathProgress(pathId, prog); store.set('paths.active', pathId);
  // a topic step marked done counts that topic as read
  const pth = PATHS.find(p => p.id === pathId), st = pth && pth.stages.find(s => s.id === key.slice(0, key.lastIndexOf('/'))), step = st && st.steps[+key.slice(key.lastIndexOf('/') + 1)];
  if(checked && step && step.kind === 'topic' && TOPICS[step.ref]) markSeen(step.ref);
}
function togglePathStep(pathId, key, checked){
  tickPathStep(pathId, key, checked); keepScroll = true; route();
  const nextRow = checked && document.querySelector('#pane .pathstage.open .pathstep:not(.done)');
  if(nextRow) nextRow.scrollIntoView({ block: 'nearest' });
}
function clearStageStatus(pathId, stageId){
  const prog = pathProgress(pathId); delete prog.stages[stageId]; prog.last = Date.now(); savePathProgress(pathId, prog);
}
const undoToast = (msg, el) => toast(msg, { label: 'Undo', data: { action: 'stage-undo', path: el.dataset.path, stage: el.dataset.stage } });
ACTIONS['stage-done'] = el => { markStageStatus(el.dataset.path, el.dataset.stage, 'done'); goPastStage(el.dataset.path, el.dataset.stage); undoToast('Stage marked done', el); };
ACTIONS['stage-skip'] = el => { markStageStatus(el.dataset.path, el.dataset.stage, 'skipped'); goPastStage(el.dataset.path, el.dataset.stage); undoToast('Stage skipped', el); };
ACTIONS['stage-undo'] = el => { clearStageStatus(el.dataset.path, el.dataset.stage); $('#toast').classList.remove('show', 'act'); go(`#/paths/${el.dataset.path}/${el.dataset.stage}`); };
// A step node clicked on the path map opens that step in the stage view.
let focusStep = null;
const showPathStep = (pathId, key) => { focusStep = key; go(`#/paths/${pathId}/${key.slice(0, key.lastIndexOf('/'))}`); };
// A stage is never marked done from the path bar: "continue" at a checkpoint
// opens the checkpoint, and marking it done stays a click inside it.
let focusCheckpoint = null;
// "Mark done and continue" ticks the step and moves on in one click: to the
// next step, to the stage checkpoint after a stage's last step, or to the path
// page once nothing is left.
ACTIONS['path-continue'] = el => {
  const pathId = el.dataset.path, next = pathNextStep(pathId); if(!next) return;
  if(next.type === 'step'){
    tickPathStep(pathId, `${next.stage.id}/${next.index}`, true);
    const nx = pathNextStep(pathId);
    if(nx && nx.type === 'checkpoint' && nx.stage.id === next.stage.id) focusCheckpoint = nx.stage.id;
    keepScroll = false; go(nx ? nextStepHref(nx) : `#/paths/${pathId}`);
  } else { focusCheckpoint = next.stage.id; go(`#/paths/${pathId}/${next.stage.id}`); }
};
ACTIONS['task-toggle'] = el => { const t = el.closest('.pathbar-task'), on = t.classList.toggle('open'); el.setAttribute('aria-expanded', on); el.textContent = on ? 'Less' : 'More'; };
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
  // On the stage page whose checkpoint is next, that checkpoint is already open there.
  const atCheckpoint = !!(onNext && next.type === 'checkpoint');
  // The step this page belongs to (an asset page opened from a step), so its
  // task stays in view: the unticked match first, else any match.
  const here = location.hash, prog = pathProgress(pth.id); let cur = null;
  for(const st of pth.stages) st.steps.forEach((s, i) => { if(s.kind !== 'reflect' && stepHref(s, pth.id, st.id) === here && (!cur || (cur.done && !prog.steps[`${st.id}/${i}`]))) cur = { step:s, done:!!prog.steps[`${st.id}/${i}`], note:`${pth.id}.${st.id}.${i}` }; });
  const task = cur ? `<div class="pathbar-task"><span class="pt-text"><b>Your task:</b> ${esc(cur.step.do)}${cur.step.min ? ` <span class="muted">· ${cur.step.min} min</span>` : ''}</span><button type="button" class="btn sm ghost pt-more" data-action="task-toggle" aria-expanded="false">More</button></div>${stepNoteHTML(cur.note)}` : '';
  return `<div class="pathbar">
    <div class="pathbar-info"><b>${esc(pth.t)}</b> <span class="muted pb-where">Stage ${curIdx} of ${pth.stages.length}</span> <span class="muted pb-next">${atCheckpoint ? `You are at the checkpoint for ${esc(next.stage.t)}` : `Next: ${esc(nextStepLabel(next))}`}</span></div>${task}
    <div class="pathbar-mini"><span class="pm-stage">${curIdx}/${pth.stages.length}</span><button type="button" class="pm-text" data-action="bar-expand" aria-label="Show the whole path bar">${cur ? esc(cur.step.do) : atCheckpoint ? 'Checkpoint' : esc(nextStepLabel(next))}</button>${next && onNext && !atCheckpoint ? `<button type="button" class="btn sm primary pm-done" data-action="path-continue" data-path="${pth.id}">Done ✓</button>` : next && !onNext ? `<a class="btn sm primary pm-done" href="${href}">Next →</a>` : ''}</div>
    <div class="pathbar-actions">
      ${next && !atCheckpoint ? (onNext ? `<button type="button" class="btn sm primary" data-action="path-continue" data-path="${pth.id}">Mark done and continue</button>` : `<a class="btn sm primary" href="${href}">${next.type === 'checkpoint' ? 'Open the checkpoint' : 'Next →'}</a>`) : ''}
      ${store.get('rpg.' + pth.id, {}).back ? `<a class="btn sm" href="#/play/${pth.id}">Back to the world</a>` : ''}
      <button type="button" class="btn sm ghost" data-action="leave-path">Leave path</button>
    </div></div>`;
}

const pathTitle = id => { const p = PATHS.find(x => x.id === id); return p ? p.t : id; };
function pathCard(p, picked){
  const { pct } = pathProgressCounts(p);
  return `<a class="card clickable tint lnk blk ${picked ? 'picked' : ''}" style="--dc:var(--accent2)" href="#/paths/${p.id}" data-path-card="${p.id}">
    <div class="chips" style="margin-bottom:6px"><span class="chip">${esc(levelLabel(p.level))}</span><span class="chip">${p.hours}h</span>${picked ? '<span class="chip ok">Suggested for you</span>' : ''}</div>
    <b>${esc(p.t)}</b><div class="small dim">${esc(p.tag)}</div>
    <div class="small clamp2" title="${esc(p.audience)}" style="margin-top:6px"><b>For</b> ${esc(p.audience)}</div>
    <div class="small muted">${hasPrereq(p) ? `After ${prereqHtml(p, id => esc(pathTitle(id)), ', ')}` : 'No prerequisites'}</div>
    <div class="progress" style="margin-top:8px"><span class="small muted">${pct}%</span><span class="bar"><i style="width:${pct}%"></i></span></div></a>`;
}
// Progress lives in this browser only, so the backup controls sit where the learner looks for progress.
// True once anything the reader did is saved: topics read, path progress, or tool data. Display preferences and navigation memory do not count.
const UI_ONLY_KEYS = new Set(['theme', 'guideHint', 'chooser', 'sideOpen', 'railW', 'paneW', 'hideLeft', 'hideRight', 'hideMap', 'recent', 'visited', 'openSecs', 'topicTab', 'projTab', 'libMore', 'library', 'engine', 'loopHere', 'keys', 'mapState', 'mapLegend']);
function hasSavedProgress(){
  const ignored = k => UI_ONLY_KEYS.has(k) || k === 'seen' || /^(projMap|pathMap)\./.test(k);
  try { return [...seen].some(id => TOPICS[id]) || Object.keys(localStorage).some(k => k.startsWith('playable.') && !ignored(k.slice(9))); } catch(e){ return false; }
}
function dataRowHTML(){
  const read = [...seen].filter(id => TOPICS[id]).length;
  if(!hasSavedProgress()) return `<div class="datarow small" role="group" aria-label="Saved progress"><span class="muted">Progress is saved in this browser only.</span><button type="button" class="btn sm ghost" data-action="data-import">Restore from a backup…</button></div>`;
  return `<div class="datarow small" role="group" aria-label="Your saved progress"><span class="muted">Your progress (${read} of ${TOPIC_LIST.length} topics read) is saved in this browser only.</span>
    <button type="button" class="btn sm ghost" data-action="data-export">Back up progress</button><button type="button" class="btn sm ghost" data-action="data-import">Restore from a backup…</button><button type="button" class="btn sm ghost danger" data-action="data-reset">Reset all</button></div>`;
}
function pathsDoorHTML(){
  const activeId = store.get('paths.active', null);
  const active = activeId && PATHS.find(p => p.id === activeId);
  const continueCard = active ? (() => {
    const next = pathNextStep(active.id);
    return `<div class="card tint" style="--dc:var(--accent2);margin-bottom:18px"><div class="overline">Continue</div><h3 style="margin:2px 0 4px">${esc(active.t)}</h3><p class="dim small">Next: ${esc(nextStepLabel(next))}</p>
      <div class="row"><a class="btn primary" href="${nextStepHref(next)}">Continue →</a><a class="btn ghost" href="#/paths/${active.id}">Open the path</a></div></div>`;
  })() : '';
  const ans = chooserAnswers(), rec = ans.goal && ans.level && ans.time ? choosePath(ans.goal, ans.level, ans.time, donePathIds()) : null;
  const tracks = TRACKS.map(([tid, tlabel]) => {
    const list = PATHS.filter(p => p.track === tid); if(!list.length) return '';
    return `<div class="section-head"><h2>${esc(tlabel)}</h2></div><div class="grid auto">${list.map(p => pathCard(p, !!rec && rec.path === p)).join('')}</div>`;
  }).join('');
  // A first visit gets one dismissible pointer to the guide; after that, a
  // quiet link stays under the intro.
  const hint = store.get('guideHint', true) ? `<div class="callout guidehint"><span class="guidehint-text"><b>First time here?</b> <a href="#/guide">How to use this site</a> lists a route for each reason you might have come, and what each section is for.</span> <button type="button" class="btn sm ghost" data-action="guide-hint-close">Dismiss</button></div>` : `<p class="small"><a href="#/guide">How to use this site</a></p>`;
  // The choice comes first, so a phone shows it on the first screen (audit N1); the
  // all-paths list follows once, and the first-visit pointer and the backup controls go
  // to the foot, since a first-time learner has nothing to restore (N1, N2).
  return `${crumbs([['Paths']])}<h1>Learning paths</h1><p class="lead" style="max-width:760px">A free guide to making games people want to play: design, engineering, shipping and leading a team. Say what you want to do and it suggests where to start.</p>
    ${continueCard}
    ${chooserHTML(ans, rec)}
    ${tracks || '<div class="empty">No paths written yet. They live in src/50-paths.js and src/51-paths-engineering.js.</div>'}
    <p class="dim" style="max-width:760px;margin-top:18px">Each path shows one next step at a time. Every stage ends in a checkpoint you answer from memory, or a test-out if you already know it. No streaks, no badges.</p>
    ${hint}
    ${dataRowHTML()}
    <p class="row" style="margin-top:10px"><a class="btn ghost" href="#/map">or explore the full map →</a></p>`;
}

// The three-question chooser. Answers are a per-browser convenience; the
// pick itself is choosePath (50-paths.js), shared with the validator.
const chooserAnswers = () => store.get('chooser', {});
ACTIONS['guide-hint-close'] = () => { store.set('guideHint', false); keepScroll = true; renderPaths(); };
ACTIONS.choose = el => { const a = chooserAnswers(); a[el.dataset.q] = el.dataset.v; store.set('chooser', a); keepScroll = true; renderPaths(); };
const donePathIds = () => PATHS.filter(p => { const prog = pathProgress(p.id); return p.stages.every(s => prog.stages[s.id]); }).map(p => p.id);
function chooserHTML(ans, rec){
  const q = (key, label, opts) => `<div class="chooser-q"><div class="overline" id="cq-${key}">${label}</div><div class="dims" role="group" aria-labelledby="cq-${key}">${opts.map(([v, t]) => `<button type="button" data-action="choose" data-q="${key}" data-v="${v}" class="${ans[key] === v ? 'active' : ''}" aria-pressed="${ans[key] === v}">${esc(t)}</button>`).join('')}</div></div>`;
  const wk = (p, hpw) => `about ${pathWeeks(p, hpw)} week${pathWeeks(p, hpw) === 1 ? '' : 's'} at ${hpw} hours a week`;
  // One answer already narrows the list; all three pick one path, with the reason (audit N2).
  const forGoal = ans.goal && !rec ? [...new Set(Object.values(CHOOSER.paths[ans.goal] || {}).flat())] : [];
  let out = forGoal.length ? `<p class="small" style="margin:0 0 6px">Paths for this: ${forGoal.map(pathLinkChip).join(' ')}</p><p class="small muted">Add your experience and time, and one of them is suggested, with the reason.</p>` : '<p class="small muted">Answer all three and one path is suggested, with the reason.</p>';
  if(rec){
    const p = rec.path, s = rec.start, hpw = rec.hpw, why = [esc(`${p.pick}. ${p.hours} hours, ${wk(p, hpw)}.`)];
    // An experienced learner is not offered easier paths as alternatives, and never more than three.
    const rank = x => LEVELS.findIndex(l => l[0] === x.level);
    const alts = ans.level === 'senior' ? rec.alt.filter(a => rank(a) >= rank(p)).slice(0, 3) : rec.alt;
    const goalLabel = (CHOOSER.goals.find(g => g[0] === ans.goal) || [0, ans.goal])[1], levelLabel = (CHOOSER.levels.find(l => l[0] === ans.level) || [0, ans.level])[1];
    const fit = ans.level === 'senior' ? 'it assumes you have shipped work' : ans.level === 'some' ? 'it builds on the basics you already have' : 'it starts from the ground up' + (hasPrereq(p) ? ', after the paths it builds on' : '');
    const because = `<p class="small muted" style="margin:0 0 8px">${esc(`Suggested because you chose ${goalLabel} and ${levelLabel}: ${fit}.`)}</p>`;
    if(alts.length) why.push(`Also fits: ${alts.map(a => `${pathLinkChip(a.id)} (${wk(a, hpw)})`).join(', ')}.`);
    const head = s ? `<div class="overline">Start here first</div><h3 style="margin:2px 0 4px">${esc(s.t)}</h3><p class="small" style="margin:0 0 8px">${esc(`${s.pick}. ${s.hours} hours, ${wk(s, hpw)}.`)} Your first pick, ${pathLinkChip(p.id)}, builds on ${prereqHtml(p, pathLinkChip, ' and ')} (${esc(wk(p, hpw))}).${alts.length ? ` Also fits: ${alts.map(a => `${pathLinkChip(a.id)} (${esc(wk(a, hpw))})`).join(', ')}.` : ''}</p>${because}<a class="btn primary sm" href="#/paths/${s.id}">Open ${esc(s.t)} →</a> <a class="btn ghost sm" href="#/paths/${p.id}">Look at ${esc(p.t)}</a>`
      : `<div class="overline">Suggested path</div><h3 style="margin:2px 0 4px">${esc(p.t)}</h3><p class="small" style="margin:0 0 8px">${why.join(' ')}${rec.anyOf.length ? ` A good base first: one of ${rec.anyOf.map(a => pathLinkChip(a.id)).join(', ')}.` : ''}</p>${because}<a class="btn primary sm" href="#/paths/${p.id}">Open the path →</a>`;
    out = `<div class="card tint chooser-pick" style="--dc:var(--accent2)">${head}</div>`;
  }
  return `<section class="chooser"><div class="section-head"><h2>Which path is for me?</h2></div>
    ${q('goal', 'I want to', CHOOSER.goals)}${q('level', 'My experience', CHOOSER.levels)}${q('time', 'Hours a week I can give', CHOOSER.times)}
    <div class="chooser-out" aria-live="polite">${out}</div></section>`;
}
// A step that covers both engines shows the choice; it is remembered for every such step.
ACTIONS['engine-pick'] = el => { store.set('engine', el.dataset.engine); keepScroll = true; route(); };
const enginePickHTML = step => { const own = step.kind === 'engine' ? step.ref : step.tab, cur = pickedEngine(step); return `<span class="small enginepick" role="group" aria-label="Engine">Engine: ${[own, step.alt].map(e => `<button type="button" class="chip ${e === cur ? 'ok' : ''}" data-action="engine-pick" data-engine="${e}" aria-pressed="${e === cur}">${ENGINE_NAMES[e]}</button>`).join(' ')}</span>`; };
// A step's notes: one textarea per step, saved as the reader types (playable.pathnote.<path>.<stage>.<step index>).
const stepNote = id => store.get('pathnote.' + id, '');
function stepNoteHTML(id){
  const v = stepNote(id);
  return `<details class="pathnote"${v ? ' open' : ''}><summary>Notes</summary><textarea rows="3" data-pathnote="${id}" aria-label="Notes for this step" placeholder="Write here. Saved in this browser as you type.">${esc(v)}</textarea></details>`;
}
document.addEventListener('input', e => {
  const t = e.target.closest && e.target.closest('textarea[data-pathnote]'); if(!t) return;
  if(t.value) store.set('pathnote.' + t.dataset.pathnote, t.value); else { try { localStorage.removeItem('playable.pathnote.' + t.dataset.pathnote); } catch(err){} }
});
function stepRowHTML(pth, st, i, step, prog, isNext){
  const key = `${st.id}/${i}`, checked = !!prog.steps[key], href = stepHref(step, pth.id, st.id);
  // The row is a list item: the checkbox with its label (the kind chip), then the
  // step itself. Its text holds links and glossary buttons, which a label must not contain.
  const id = `ps-${pth.id}-${st.id}-${i}`;
  return `<li class="pathstep ${checked ? 'done' : ''} ${isNext ? 'next' : ''}" data-row="${key}">
    <input type="checkbox" id="${id}" ${checked ? 'checked' : ''} data-path="${pth.id}" data-step="${key}" aria-label="${esc((checked ? 'Done: ' : 'Mark done: ') + stepTitle(step))}">
    <label class="chip kindchip" for="${id}">${isNext ? 'next' : esc(step.kind)}</label>
    <div class="pathstep-body"><a href="${href}">${esc(stepTitle(step))}</a>${step.min ? ` <span class="muted small">${step.min} min</span>` : ''}
      <div class="small dim gl">${esc(step.why)}</div><div class="small gl">${esc(step.do)}</div>${step.alt ? `<div>${enginePickHTML(step)}</div>` : ''}${step.kind === 'reflect' ? '' : stepNoteHTML(`${pth.id}.${st.id}.${i}`)}</div>
  </li>`;
}
// The reference answer to the build task, closed so the reader tries first.
function solutionHTML(st){
  const s = st.check.solution; if(!s) return '';
  return `<details class="pathsolution"><summary>Reference solution: open after you try</summary><div class="body"><h4>Outline of a good answer</h4><p>${esc(s.outline)}</p><h4>Check yourself</h4><ul>${s.selfcheck.map(q => `<li>${esc(q)}</li>`).join('')}</ul></div></details>`;
}
function stageFooterHTML(pth, st, prog){
  const next = pathNextStep(pth.id), live = fight && fight.path === pth.id && fight.stage === st.id ? fight : null;
  const checkpointOpen = (!!next && next.type === 'checkpoint' && next.stage.id === st.id) || (live && live.mode === 'check') || keepCheckOpen === pth.id + '/' + st.id;
  const review = (st.review || []).map(tid => { const t = TOPICS[tid]; return t ? `<a class="chip lnk" style="cursor:pointer" href="#/map/t/${tid}">${esc(t.t)}</a>` : ''; }).join('');
  const status = prog.stages[st.id], last = prog.check[st.id], skin = adventureSkin(), asked = recallItems(st).length;
  const lastLine = last ? `<p class="small muted">Last time (${esc(new Date(last.at).toLocaleDateString())}): ${last.got} of ${last.n} recalled${last.partial ? `, ${last.partial} partly` : ''}.</p>` : '';
  return `${review ? `<div class="small" style="margin-top:10px"><b>Review:</b> ${review}</div>` : ''}
    <details class="pathcheck" style="margin-top:10px" ${checkpointOpen ? 'open' : ''}><summary>${skin ? 'The castle: this stage’s checkpoint' : 'Checkpoint'}</summary><div class="body">
      <h3 class="h4look">Can you answer these?</h3>
      ${asked ? `<p class="small" style="margin:0 0 6px">One question at a time, from memory: answer, say how sure you are, then compare with the outline. Questions you miss come back in your review queue.</p>
      <div class="fight" data-mode="check">${live && live.mode === 'check' ? fightHTML(pth, st) : `${lastLine}<button type="button" class="btn sm primary" data-action="fight-start" data-mode="check" data-path="${pth.id}" data-stage="${st.id}">${skin ? 'Enter the castle' : 'Start the checkpoint'} (${asked} question${asked === 1 ? '' : 's'})</button><span class="small muted blk" style="margin-top:4px">A round in progress is not kept if you leave or reload the page; answers you have given stay in your review queue.</span>`}</div>
      <details class="small allq"><summary>Or see all the questions at once</summary>${recallHTML(pth, st)}</details>` : recallHTML(pth, st)}
      <h3 class="h4look">Build</h3><p>${esc(st.check.build)}</p>${solutionHTML(st)}
      <button type="button" class="btn sm primary" ${status ? 'disabled' : ''} data-action="stage-done" data-path="${pth.id}" data-stage="${st.id}">${status === 'done' ? 'Stage marked done' : 'Mark stage done'}</button>
    </div></details>
    <details class="pathskip" style="margin-top:6px" ${live && live.mode === 'testout' ? 'open' : ''}><summary>Test out: I may know this already</summary><div class="body">
      <p class="small">Answer this stage’s checkpoint questions before the steps. If you recall most of them, the stage is marked as tested out and the questions go to your review queue; if not, start at the first step, knowing what to look for.</p>
      <h3 class="h4look">Ask yourself first</h3><ul>${(st.check.skip || []).map(q => `<li>${esc(q)}</li>`).join('')}</ul>
      <div class="fight" data-mode="testout">${live && live.mode === 'testout' ? fightHTML(pth, st) : `<div class="row">${asked ? `<button type="button" class="btn sm" data-action="fight-start" data-mode="testout" data-path="${pth.id}" data-stage="${st.id}" ${status ? 'disabled' : ''}>Test out</button>` : ''}<button type="button" class="btn sm ghost" ${status ? 'disabled' : ''} data-action="stage-skip" data-path="${pth.id}" data-stage="${st.id}">${status === 'skipped' ? 'Stage skipped' : 'Skip without testing'}</button></div>`}</div>
    </div></details>`;
}

/* ---------- the checkpoint, one question at a time ----------
   Free recall before the answer is shown, then informational feedback
   (research/learning-science.md, rows 1-3 and 12): the question alone, a
   "how sure am I?" tap before the reveal (row 18), the outline as a list of
   ideas the reader ticks, and an outcome from the ticks: all = got it, some =
   partly, none = not yet. Not-yet and partly come back once at the end of the
   round and go into the review queue for tomorrow; got it goes in at the next
   gap of 1, 2, 4, 8, 16 days, except a "guess" that was right, which comes
   back tomorrow like a partial answer. There is no score and nothing is
   locked; the result is kept per stage for the stage map. */
let fight = null;
// Closing a checkpoint's result keeps that checkpoint open: the reader is still in it.
let keepCheckOpen = null;
const CONFIDENCE = [['guess', 'A guess'], ['fair', 'Fairly sure'], ['sure', 'Sure']];
const OUTCOME = { got: 'Got it', partial: 'Partly', missed: 'Not yet' };
// The ideas a good answer contains: the outline's own list when it has one, else its sentences.
const recallIdeas = x => Array.isArray(x.ideas) && x.ideas.length ? x.ideas : String(x.a).split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/).filter(t => t.trim());
const recallItems = st => (st.check.recall || []).filter(x => typeof x === 'object' && x.a);
const adventureSkin = () => store.get('pathSkin', false) === true;
function fightHTML(pth, st){
  const f = fight, items = recallItems(st);
  if(f.phase === 'end') return fightEndHTML(pth, st);
  const idx = f.order[f.at], x = items[idx], round = f.round === 2 ? 'Once more, the ones that were not there yet: ' : '';
  const head = `<p class="small muted fight-pos" role="status">${round}question ${f.at + 1} of ${f.order.length}</p><h4 class="fight-q" tabindex="-1">${esc(x.q)}</h4>`;
  if(f.phase === 'ask') return `${head}
    <label class="small" for="fightAns">Your answer, from memory (writing it is optional; saying it works too)</label>
    <textarea id="fightAns" rows="3" data-fight-answer>${esc(f.answer || '')}</textarea>
    <div class="small" id="fightConfL" style="margin-top:6px">How sure are you?</div>
    <div class="dims" role="group" aria-labelledby="fightConfL">${CONFIDENCE.map(([v, t]) => `<button type="button" data-action="fight-conf" data-v="${v}" aria-pressed="${f.conf === v}" class="${f.conf === v ? 'active' : ''}">${t}</button>`).join('')}</div>
    <button type="button" class="btn sm primary" data-action="fight-reveal" ${f.conf ? '' : 'disabled'}>Show the outline</button>`;
  const ideas = recallIdeas(x);
  return `${head}${f.answer ? `<div class="small"><b>You wrote:</b> ${esc(f.answer)}</div>` : ''}
    <fieldset class="fight-ideas"><legend class="small">Tick each idea your answer had</legend>${ideas.map((t, i) => `<label class="fight-idea"><input type="checkbox" data-fight-idea="${i}">${esc(t)}</label>`).join('')}</fieldset>
    <button type="button" class="btn sm primary" data-action="fight-mark">Next</button>`;
}
function fightEndHTML(pth, st){
  const f = fight, items = recallItems(st), first = f.first, n = items.length;
  const got = first.filter(r => r === 'got').length, partial = first.filter(r => r === 'partial').length, missed = n - got - partial;
  const queued = reviewItems(), when = items.map(x => queued[`ck:${pth.id}:${st.id}:${x.q}`]).filter(Boolean).map(r => r.due - today());
  const soon = when.filter(d => d <= 1).length, later = when.length - soon;
  const testedOut = f.mode === 'testout' && got >= Math.ceil(2 * n / 3);
  const steps = st.steps.map((s, i) => `<li><a href="${stepHref(s, pth.id, st.id)}">${esc(stepTitle(s))}</a></li>`).join('');
  const action = f.mode === 'testout'
    ? (testedOut ? `<p><b>You know most of this stage.</b> It is marked as tested out, and its questions are in your review queue.</p><div class="row"><button type="button" class="btn sm primary" data-action="fight-close" data-next="1" data-path="${pth.id}" data-stage="${st.id}">Go to the next stage</button></div>`
      : `<p><b>Start with the first step.</b> You now know what this stage asks; the questions you missed are in your review queue.</p><div class="row"><a class="btn sm primary" href="${stepHref(st.steps[0], pth.id, st.id)}" data-action="fight-close">Open the first step</a></div>`)
    : `<div class="row"><button type="button" class="btn sm" data-action="fight-close" data-path="${pth.id}" data-stage="${st.id}">Close</button></div>`;
  return `<h4 class="fight-q" tabindex="-1">What you recalled</h4>
    <ul class="fight-sum"><li>${got} of ${n}: got it</li>${partial ? `<li>${partial}: partly</li>` : ''}${missed ? `<li>${missed}: not yet</li>` : ''}</ul>
    <p class="small">Coming back: ${soon ? `${soon} tomorrow` : ''}${soon && later ? ', ' : ''}${later ? `${later} after a longer gap` : ''}${!soon && !later ? 'nothing queued' : ''} (<a href="#/review">your review queue</a>).</p>
    ${missed || partial ? `<details class="small"><summary>This stage’s steps, to go back over</summary><ul>${steps}</ul></details>` : ''}
    ${action}`;
}
// Puts one answer into the review queue at the gap its outcome earns.
function scheduleRecall(pth, st, x, outcome, conf){
  const items = reviewItems(), k = `ck:${pth.id}:${st.id}:${x.q}`, r = items[k] || { q: x.q, a: x.a, src: `#/paths/${pth.id}/${st.id}`, box: -1 };
  // a right answer earns the next gap only when the question was new or due: answering it
  // again the same day is practice, as on the Review page, and must not stretch the spacing
  if(outcome === 'got' && conf !== 'guess'){ if(items[k] && items[k].due > today()) return; r.box = Math.min(REVIEW_DAYS.length - 1, r.box + 1); }
  else r.box = 0;
  r.due = today() + REVIEW_DAYS[r.box];
  items[k] = r; store.set('review', items);
}
// After a redraw focus goes to the new question, or, after a confidence tap, to the reveal it unlocked.
function redrawFight(focus){
  keepScroll = true; route();
  const q = document.querySelector('#pane .fight ' + (focus || '.fight-q')); if(q) q.focus({ preventScroll: true });
}
ACTIONS['fight-start'] = el => {
  const pth = PATHS.find(p => p.id === el.dataset.path), st = pth && pth.stages.find(s => s.id === el.dataset.stage); if(!st) return;
  const n = recallItems(st).length; if(!n) return;
  fight = { path: pth.id, stage: st.id, mode: el.dataset.mode, round: 1, order: [...Array(n).keys()], at: 0, phase: 'ask', conf: null, answer: '', first: Array(n).fill(null) };
  store.set('paths.active', pth.id);
  redrawFight();
};
ACTIONS['fight-conf'] = el => { fight.conf = el.dataset.v; redrawFight('[data-action="fight-reveal"]'); };
ACTIONS['fight-reveal'] = () => { if(fight.conf){ fight.phase = 'reveal'; redrawFight(); } };
ACTIONS['fight-mark'] = el => {
  const f = fight, pth = PATHS.find(p => p.id === f.path), st = pth.stages.find(s => s.id === f.stage), items = recallItems(st), idx = f.order[f.at];
  const boxes = [...el.closest('.fight').querySelectorAll('[data-fight-idea]')], had = boxes.filter(b => b.checked).length;
  const outcome = had === 0 ? 'missed' : had === boxes.length ? 'got' : 'partial';
  // the first answer in a round decides the schedule; the second asking is practice with the same feedback
  if(f.round === 1){ f.first[idx] = outcome; scheduleRecall(pth, st, items[idx], outcome, f.conf); }
  f.at++; f.phase = 'ask'; f.conf = null; f.answer = '';
  if(f.at >= f.order.length){
    const again = f.round === 1 ? f.first.map((r, i) => r !== 'got' ? i : -1).filter(i => i >= 0) : [];
    if(again.length){ f.round = 2; f.order = again; f.at = 0; }
    else {
      f.phase = 'end';
      const n = items.length, got = f.first.filter(r => r === 'got').length, partial = f.first.filter(r => r === 'partial').length;
      const prog = pathProgress(pth.id); prog.check[st.id] = { at: Date.now(), mode: f.mode, n, got, partial, missed: n - got - partial }; prog.last = Date.now(); if(!prog.started) prog.started = prog.last;
      savePathProgress(pth.id, prog); rpgCount('pageChecks');
      if(f.mode === 'testout' && got >= Math.ceil(2 * n / 3) && !prog.stages[st.id]) markStageStatus(pth.id, st.id, 'skipped');
    }
  }
  redrawFight();
};
ACTIONS['fight-close'] = el => { const next = el.dataset.next === '1', p = el.dataset.path, s = el.dataset.stage; keepCheckOpen = fight && fight.mode === 'check' ? fight.path + '/' + fight.stage : null; fight = null; if(next) goPastStage(p, s); else if(p) { keepScroll = true; route(); } };
document.addEventListener('input', e => { if(fight && e.target.matches && e.target.matches('textarea[data-fight-answer]')) fight.answer = e.target.value; });

// The stage map: every stage as a region with what is true of it (steps read,
// what the checkpoint recalled, questions due), the current one marked. It is
// a view, never a gate: every region opens at any time. "Plain list" shows
// every stage's steps instead. The adventure skin (off by default) only
// changes the look and two labels; nothing moves while the reader is reading.
function overworldHTML(pth, prog, curStage, next){
  const due = reviewDue(), skin = adventureSkin(), view = pathView();
  const regions = pth.stages.map((st, si) => {
    const done = st.steps.filter((_, i) => prog.steps[`${st.id}/${i}`]).length, c = prog.check[st.id], status = prog.stages[st.id];
    const recall = c ? (c.got === c.n ? 'all recalled' : `${c.got} of ${c.n} recalled`) : 'checkpoint not tried';
    const dueHere = due.filter(([k]) => k.startsWith(`ck:${pth.id}:${st.id}:`)).length;
    const here = st.id === curStage;
    return `<li class="region ${here ? 'here' : ''} ${status || ''}"><a class="lnk" href="#/paths/${pth.id}/${st.id}"${here ? ' aria-current="step"' : ''}>
      <span class="rnum" aria-hidden="true">${status === 'done' ? '✓' : status === 'skipped' ? '⇥' : si + 1}</span><span class="rtext"><b>${esc(st.t)}</b><span class="small muted blk">${done} of ${st.steps.length} steps · ${recall}${status === 'skipped' ? ' · tested out or skipped' : status === 'done' ? ' · done' : ''}${dueHere ? ` · ${dueHere} to review` : ''}</span>${here ? `<span class="you blk">${skin ? '▲ ' : ''}You are here</span>` : ''}</span></a></li>`;
  }).join('');
  return `<section class="overworld ${skin ? 'skin' : ''}" aria-labelledby="owH">
    <div class="row between owhead"><h2 id="owH" class="h4look">${skin ? 'The road through this path' : 'Stages'}</h2><span class="chips" role="group" aria-label="How to show the stages"><button type="button" class="chip" data-action="path-view" data-v="world" aria-pressed="${view === 'world'}">Stage map</button><button type="button" class="chip" data-action="path-view" data-v="list" aria-pressed="${view === 'list'}">Plain list</button><button type="button" class="chip" data-action="path-skin" data-v="${skin ? '0' : '1'}" aria-pressed="${skin}">Adventure look</button></span></div>
    ${view === 'world' ? `<ol class="regions">${regions}</ol>` : ''}
    <p class="small ownext">Next: <a href="${nextStepHref(next)}">${esc(nextStepLabel(next))}</a>${due.length ? ` · <a href="#/review">${due.length} question${due.length === 1 ? '' : 's'} to review today</a>` : ''}</p></section>`;
}
const pathView = () => store.get('pathView', 'world') === 'list' ? 'list' : 'world';
ACTIONS['path-view'] = el => { store.set('pathView', el.dataset.v); keepScroll = true; route(); };
ACTIONS['path-skin'] = el => { store.set('pathSkin', el.dataset.v === '1'); keepScroll = true; route(); };
// Checkpoint recall: answer first, then open a question to compare with its
// outline. Each can go into the review queue, keyed by its text.
function recallHTML(pth, st){
  const queued = reviewItems(), items = (st.check.recall || []).map(x => typeof x === 'string' ? { q: x, a: '' } : x);
  return `<p class="small muted" style="margin:0 0 6px">Answer each one in your head first, then open it to compare.</p><div class="ivlist recall">${items.map(x => {
    if(!x.a) return `<div class="ivq plain">${esc(x.q)}</div>`;
    const k = `ck:${pth.id}:${st.id}:${x.q}`, on = !!queued[k];
    return `<details class="ivq" style="--dc:var(--accent2)"><summary>${esc(x.q)}</summary><div class="body"><h4>Answer outline</h4><p>${esc(x.a)}</p>
      <button type="button" class="btn sm ghost" data-action="review-toggle" data-key="${esc(k)}" aria-pressed="${on}">${on ? 'In your review queue' : 'Review later'}</button></div></details>`; }).join('')}</div>`;
}
function stageSectionHTML(pth, st, si, curStage, prog, next){
  const status = prog.stages[st.id];
  const nextIdx = next && next.type === 'step' && next.stage === st ? next.index : -1;
  const isOpen = st.id === curStage;
  const doneCount = st.steps.filter((_, i) => prog.steps[`${st.id}/${i}`]).length;
  const tick = status === 'done' ? '✓' : status === 'skipped' ? '⇥' : String(si + 1);
  return `<section class="pathstage ${isOpen ? 'open' : ''} ${status || ''}" data-stage="${st.id}">
    <header data-href="#/paths/${pth.id}/${st.id}"><span class="letter">${tick}</span><div style="flex:1"><h2><a class="lnk sec-link" href="#/paths/${pth.id}/${st.id}">${esc(st.t)}</a></h2><div class="small muted">${esc(st.goal)}</div></div>${status ? `<button type="button" class="btn sm ghost" data-action="stage-undo" data-path="${pth.id}" data-stage="${st.id}">Undo ${status === 'done' ? 'done' : 'skip'}</button>` : ''}<span class="chip">${doneCount}/${st.steps.length}</span><span class="car">▸</span></header>
    <div class="body"><ol class="pathsteps">${st.steps.map((step, i) => stepRowHTML(pth, st, i, step, prog, i === nextIdx)).join('')}</ol>${stageFooterHTML(pth, st, prog)}</div>
  </section>`;
}
// The paths that can be walked as a game (#/play/<path>, 96-rpg.js).
const RPG_PATHS = ['game-designer-foundations'];
function pathPageHTML(pth, stageIdParam){
  const curStage = (stageIdParam && pth.stages.some(s => s.id === stageIdParam)) ? stageIdParam : currentStageId(pth);
  const { prog, total, done, doneStages, pct } = pathProgressCounts(pth);
  const next = pathNextStep(pth.id);
  const main = glossify(`<div class="chips" style="margin-bottom:8px"><span class="chip dom" style="--dc:var(--accent2)">${esc(trackLabel(pth.track))}</span><span class="chip">${esc(levelLabel(pth.level))} entry</span><span class="chip">${pth.hours}h</span></div>
    <h1>${esc(pth.t)}</h1><p class="tag">${esc(pth.tag)}</p>
    <p class="dim"><b>Who it is for.</b> ${esc(pth.audience)}</p>
    <p class="dim"><b>What you can do after.</b> ${esc(pth.outcome)}</p>
    ${hasPrereq(pth) ? `<div class="small muted" style="margin:1em 0">Prereq: ${(pth.prereqAny || []).length > 3 ? prereqSummaryHtml(pth) : prereqHtml(pth, pathLinkChip, ', ')}</div>` : ''}
    <div class="progress pathprogress" style="margin:10px 0 14px"><span>${doneStages} / ${pth.stages.length} stages · ${done} / ${total} steps${next ? '' : ' · all stages complete'}</span><span class="bar"><i style="width:${pct}%"></i></span></div>
    ${RPG_PATHS.includes(pth.id) ? `<p class="rpgplay"><a class="btn primary" href="#/play/${pth.id}">Play this path</a> <span class="small muted">Walk it as a small game: each town is a stage, each person a step.</span></p>` : ''}
    ${overworldHTML(pth, prog, curStage, next)}
    <div class="pathstages">${pth.stages.map((st, si) => pathView() === 'list' || st.id === curStage ? stageSectionHTML(pth, st, si, curStage, prog, next) : '').join('')}</div>
    ${pth.next.length ? `<div class="wdup"><div class="section-head"><h2>Where to go next</h2></div><div class="chips">${pth.next.map(pathLinkChip).join('')}</div></div>` : ''}`, { only: '.pathstep-body .gl' });
  const side = wideBlock('Stages', `<ol>${pth.stages.map(st => `<li><a class="lnk" href="#/paths/${pth.id}/${st.id}">${esc(st.t)}</a></li>`).join('')}</ol>`) + wideBlock('Where to go next', pth.next.length ? `<div class="chips">${pth.next.map(pathLinkChip).join('')}</div>` : '');
  return wide2(main, side, 'This path');
}
function renderPaths(id, stageId){
  if(id === 'review') return location.replace('#/review');
  const pth = id && PATHS.find(p => p.id === id);
  if(pth){
    store.set('paths.active', pth.id);
    const openStage = (stageId && pth.stages.some(s => s.id === stageId)) ? stageId : currentStageId(pth);
    enterPathMap(pth, openStage);
    setView(pathPageHTML(pth, stageId));
    if(focusCheckpoint){
      const sum = document.querySelector(`#pane .pathstage[data-stage="${focusCheckpoint}"] .pathcheck summary`); focusCheckpoint = null;
      if(sum){ sum.scrollIntoView({ block: 'start' }); sum.focus(); }
    }
    if(focusStep){
      const row = document.querySelector(`#pane .pathstep[data-row="${focusStep}"]`); focusStep = null;
      if(row){ row.scrollIntoView({ block: 'center' }); row.classList.add('flash'); const box = row.querySelector('input'); if(box) box.focus({ preventScroll: true }); }
    }
    return renderTree('stage');
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
    // Topics key by id, every other kind by kind + ':' + ref (an engine step with an alternative also counts
    // for the alternative; a case part or workflow also counts for its project as 'case:' + id).
    const add = (key, pth, st) => { const l = _PATH_LINKS[key] || (_PATH_LINKS[key] = []); if(!l.some(h => h.path === pth && h.stage === st)) l.push({ path:pth, stage:st }); };
    PATHS.forEach(pth => pth.stages.forEach(st => st.steps.forEach(step => {
      if(step.kind === 'reflect') return;
      if(step.kind === 'topic') return add(step.ref, pth, st);
      add(step.kind + ':' + step.ref, pth, st);
      if(step.alt) add(step.kind + ':' + step.alt, pth, st);
      if(step.kind === 'part' || step.kind === 'flow'){ const { cs } = step.kind === 'part' ? findCasePart(step.ref) : findCaseFlow(step.ref); if(cs) add('case:' + cs.id, pth, st); }
    })));
  }
  return _PATH_LINKS;
}
const pathChipList = key => (pathLinks()[key] || []).map(h => `<a class="chip prac lnk" href="#/paths/${h.path.id}/${h.stage.id}">${esc(h.path.t)} · ${esc(h.stage.t)}</a>`).join('');
function pathChips(topicId, what){
  const hits = pathLinks()[topicId] || [];
  if(!hits.length) return '';
  return `<div class="small" style="margin-top:8px"><b>Part of paths:</b> a guided sequence that walks through this ${what || 'topic'}.</div>
    <div class="chips" style="margin-top:5px">${pathChipList(topicId)}</div>`;
}
// The next-step rows of a page that has no other way on: [title, html] pairs. In the wide layout the side
// column carries them and the copies in the page are hidden (.wdup); narrower, the page carries them.
function nextBlocks(rows){
  rows = rows.filter(r => r[1]);
  return { main: rows.map(([t, h]) => `<div class="wdup nextblock"><div class="section-head"><h2>${t}</h2></div>${h}</div>`).join(''), side: rows.map(([t, h]) => wideBlock(t, h)).join('') };
}
const chipLinks = items => items.length ? `<div class="chips">${items.map(([href, label]) => `<a class="chip lnk" href="${href}">${esc(label)}</a>`).join('')}</div>` : '';
const topicChipLinks = ids => chipLinks([...new Set(ids || [])].filter(id => TOPICS[id] || VIEW_LINKS[id]).map(id => [TOPICS[id] ? '#/map/t/' + id : VIEW_LINKS[id][0], TOPICS[id] ? TOPICS[id].t : VIEW_LINKS[id][1]]));
const pathsBlock = key => { const h = pathChipList(key); return h ? `<div class="chips">${h}</div>` : ''; };
// A wide page: `main` beside its next-step rows.
const withNext = (main, rows, label) => { const b = nextBlocks(rows); return wide2(main + b.main, b.side, label); };

/* =====================================================================
   SEARCH
   ===================================================================== */
// The build makes the index from the full content (searchIndexData in 85-shared.js)
// and writes it to its own file, loaded the first time search opens.
let _INDEX = null, _indexLoad = null, _bodyLoaded = false;
const refreshSearch = () => { if($('#searchModal').classList.contains('show') && $('#searchInput').value.trim()) renderSearch(); };
function loadIndex(){
  if(!_indexLoad) _indexLoad = PlayableContent.needFile('search').then(ix => {
    _INDEX = ix; refreshSearch();
    // each entry's own words, in the same order as the head
    return PlayableContent.needFile('search-body').then(body => { body.forEach(([b, c], i) => { ix[i]._b = b; ix[i]._c = c; }); _bodyLoaded = true; refreshSearch(); });
  }).catch(() => { _indexLoad = null; });
  return _indexLoad;
}
function ensureIndex(){ return _INDEX || []; }

let searchSel = 0, searchResults = [];
// Search: every query word (after stop words, with simple plurals folded)
// must match somewhere; a title match outranks a synonym, a snippet or the
// body; one typo is forgiven on words of five letters or more, against
// titles and synonyms only. Results come back grouped, pages first.
// True when a and b differ by one insertion, deletion, substitution or swap.
function oneEdit(a, b){
  if(a === b || Math.abs(a.length - b.length) > 1) return a === b;
  let i = 0; while(i < a.length && a[i] === b[i]) i++;
  if(a.length === b.length) return a.slice(i + 1) === b.slice(i + 1) || (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
  return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
}
const SEARCH_GROUPS = [['page', 'Pages'], ['worked example', 'Worked examples'], ['comparison', 'Two games, one problem'], ['topic', 'Topics'], ['reference', 'Reference games'], ['platform', 'Platforms'], ['term', 'Terms'], ['path', 'Learning paths'], ['tool', 'Build tools'], ['checklist', 'Checklists'], ['prompt', 'Prompts'], ['smell', 'Design smells'], ['interview', 'Interview questions'], ['experience', 'Projects']];
function search(q){
  const whole = q.trim().toLowerCase(), qs = searchWords(whole).filter(w => !STOP_WORDS.has(w)); if(!qs.length) return [];
  const hits = [];
  for(const it of ensureIndex()){
    const body = it._b || '';   // the full text arrives a moment after the head
    // tier per word: 3 whole word in the title or a synonym, 2 whole word in the snippet or body,
    // 1 prefix match, 0 typo-forgiven; a hit is only as good as its weakest word.
    let score = 0, ok = true, tier = 3;
    for(const w of qs){
      let s, tw;
      if(it._t.includes(w)){ s = 20; tw = 3; }
      else if(it._a.includes(w)){ s = 12; tw = 3; }
      else if(it._s.includes(' ' + w + ' ')){ s = 6; tw = 2; }
      else if(body.includes(' ' + w + ' ')){ s = 4 + ((it._c && it._c[w]) || 1); tw = 2; } // a topic that keeps returning to the word is about it
      else if(it._t.some(t => t.startsWith(w))){ s = 14; tw = 1; }
      else if(it._a.some(a => a.startsWith(w))){ s = 12; tw = 1; }
      else if(it._s.includes(' ' + w)){ s = 5; tw = 1; }
      else if(body.includes(' ' + w)){ s = 2; tw = 1; }
      else if(w.length >= 5 && (it._t.some(t => oneEdit(t, w)) || it._a.some(a => oneEdit(a, w)))){ s = 8; tw = 0; }
      else { ok = false; break; }
      score += s; tier = Math.min(tier, tw);
    }
    if(!ok) continue;
    const titleAll = qs.every(w => it._t.includes(w));
    const t = it.t.toLowerCase();
    if(t === whole) score += 100; else if(t.startsWith(whole)) score += 40;
    if(it.type === 'page') score += 5;
    hits.push([score, it, tier, titleAll ? 1 : 0]);
  }
  // Exact whole-word matches lead; prefix and typo matches are dropped once three exact ones exist.
  const exact = hits.filter(h => h[2] >= 2).length;
  return hits.filter(h => exact < 3 || h[2] >= 2).sort((a, b) => b[3] - a[3] || b[2] - a[2] || b[0] - a[0]).map(x => x[1]);
}
// The results list, grouped by kind; each group shows its first six and can
// be opened in full. With an empty box it is a jump list: pages visited in
// this browser, then the pages people look for most.
let searchOpenGroups = new Set();
ACTIONS['search-more'] = el => { searchOpenGroups.add(el.dataset.group); renderSearch(); };
const COMMON_PAGES = ['#/guide', '#/paths', '#/games', '#/platforms', '#/map', '#/checklists', '#/index'];
const recentPages = () => store.get('recent', []);
function renderSearch(){
  const q = $('#searchInput').value.trim();
  let html = '';
  if(!q){
    const recent = recentPages().slice(0, 5), seenHref = new Set(recent.map(r => r.href));
    const common = COMMON_PAGES.filter(h => !seenHref.has(h)).map(h => PAGES.find(p => p[0] === h && p[1] !== 'Library')).filter(Boolean).map(p => ({ type:'page', t:p[1], snip:`${p[2]} · ${p[3]}`, href:p[0] }));
    searchResults = [...recent.map(r => ({ type:'recent', t:r.t, snip:r.snip || '', href:r.href })), ...common];
    const row = (r, i) => `<div class="res ${i===searchSel?'sel':''}" role="option" id="sr-${i}" aria-selected="${i===searchSel}" data-i="${i}"><span class="type">${r.type === 'recent' ? 'recent' : 'page'}</span><div><b>${esc(r.t)}</b><div class="snip">${esc(r.snip)}</div></div></div>`;
    html = (recent.length ? `<div class="resgroup" role="presentation">Visited recently</div>${searchResults.slice(0, recent.length).map(row).join('')}` : '') + `<div class="resgroup" role="presentation">Jump to</div>${searchResults.slice(recent.length).map((r, k) => row(r, recent.length + k)).join('')}`;
  } else if(!_INDEX){
    loadIndex(); searchResults = [];
    html = `<div class="empty" role="status">Loading the search index…</div>`;
  } else {
    const all = search(q), byType = {};
    all.forEach(r => { (byType[r.type] || (byType[r.type] = [])).push(r); });
    // pages first, then each kind in the order its best result ranks
    const ordered = [...(byType.page ? ['page'] : []), ...Object.keys(byType).filter(t => t !== 'page').sort((x, y) => all.indexOf(byType[x][0]) - all.indexOf(byType[y][0]))];
    searchResults = [];
    for(const t of ordered){
      const list = byType[t], open = searchOpenGroups.has(t), shown = open ? list : list.slice(0, 6);
      const label = (SEARCH_GROUPS.find(g => g[0] === t) || [t, t.charAt(0).toUpperCase() + t.slice(1)])[1];
      html += `<div class="resgroup" role="presentation">${esc(label)} <span class="muted">${list.length}</span></div>` + shown.map(r => { const i = searchResults.push(r) - 1; return `<div class="res ${i===searchSel?'sel':''}" role="option" id="sr-${i}" aria-selected="${i===searchSel}" data-i="${i}"><span class="type">${esc(r.type)}</span><div><b>${esc(r.t)}</b><div class="snip">${esc(r.snip)}</div></div></div>`; }).join('')
        + (list.length > shown.length ? `<button type="button" class="btn sm ghost resmore" data-action="search-more" data-group="${esc(t)}">Show all ${list.length}</button>` : '');
    }
    if(!_bodyLoaded) html = `<div class="small muted" role="status">Searching titles; the full text is still loading.</div>` + html;
    if(!all.length && _bodyLoaded) html = `<div class="empty">Nothing matches every word. Try fewer words, a symptom ("repetitive"), a concept ("depth"), or open <a href="#/index">All pages</a>.</div>`;
  }
  searchSel = Math.min(searchSel, Math.max(searchResults.length - 1, 0));
  $('#searchResults').innerHTML = html;
  const inp = $('#searchInput'), n = searchResults.length;
  $('#searchCount').textContent = q ? (n === 1 ? '1 result' : `${n} results`) : '';
  inp.setAttribute('aria-expanded', String(n > 0));
  if(n) inp.setAttribute('aria-activedescendant', 'sr-' + searchSel); else inp.removeAttribute('aria-activedescendant');
  const mark = i => { searchSel = i; $$('#searchResults .res').forEach(x => { const on = +x.dataset.i === i; x.classList.toggle('sel', on); x.setAttribute('aria-selected', String(on)); }); inp.setAttribute('aria-activedescendant', 'sr-' + i); };
  $$('#searchResults .res[data-i]').forEach(el => { el.onmouseenter = () => mark(+el.dataset.i); el.onclick = () => openResult(+el.dataset.i); });
  const cur = $('#searchResults .res.sel'); if(cur && cur.scrollIntoView) cur.scrollIntoView({ block:'nearest' });
}
function openResult(i){ const r = searchResults[i]; if(!r) return; closeModals(); go(r.href); }
function openSearch(){ const inp = $('#searchInput'); inp.value = ''; searchSel = 0; searchOpenGroups = new Set(); loadIndex(); renderSearch(); openModal('searchModal', '#searchInput'); }
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
  $('#searchInput').setAttribute('aria-expanded', 'false');
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
$('#indexBtn').onclick = () => go('#/index');
$('#searchInput').addEventListener('input', () => { searchSel = 0; searchOpenGroups = new Set(); renderSearch(); });
$('#searchInput').addEventListener('keydown', e => { if(e.key==='ArrowDown'){ e.preventDefault(); searchSel = Math.min(searchSel+1, searchResults.length-1); renderSearch(); } else if(e.key==='ArrowUp'){ e.preventDefault(); searchSel = Math.max(searchSel-1, 0); renderSearch(); } else if(e.key==='Enter'){ openResult(searchSel); } });
$$('.modal-bg').forEach(m => m.addEventListener('click', e => { if(e.target === m) closeModals(); }));
$('#helpBtn').onclick = () => openModal('helpModal', 'h2');
$('#helpClose').onclick = closeModals;
const resetAllData = () => { if(confirm('Reset all saved data (progress, tool inputs, checklists)?')){ store.clear(); location.reload(); } };
$('#resetAll').onclick = resetAllData;
ACTIONS['data-reset'] = resetAllData;
// Single-letter shortcuts can fire by accident under speech input or a
// screen reader, so they can be switched off (WCAG 2.1.4).
const keysOn = () => store.get('keys', true);
$('#keysToggle').checked = keysOn();
$('#keysToggle').onchange = e => store.set('keys', e.target.checked);
// Everything the reader writes lives in localStorage, which a browser may
// clear; export and import move it as one JSON file.
const OWN = k => k.startsWith('playable.');
const exportData = () => {
  const data = {}; Object.keys(localStorage).filter(OWN).forEach(k => { data[k] = localStorage.getItem(k); });
  const blob = new Blob([JSON.stringify({ app: 'playable', v: 1, exportedAt: new Date().toISOString(), data }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'playable-data-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  if(navigator.storage && navigator.storage.persist) navigator.storage.persist();
  toast(`Exported ${Object.keys(data).length} saved items`);
};
$('#exportData').onclick = exportData;
ACTIONS['data-export'] = exportData;
ACTIONS['data-import'] = () => $('#importFile').click();
$('#importData').onclick = () => $('#importFile').click();
$('#importFile').onchange = async e => {
  const file = e.target.files[0]; e.target.value = ''; if(!file) return;
  let obj; try { obj = JSON.parse(await file.text()); } catch(err){ return toast('That file is not a Playable export'); }
  const entries = obj && obj.app === 'playable' && obj.data && typeof obj.data === 'object' ? Object.entries(obj.data) : null;
  const validJSON = v => { try { JSON.parse(v); return true; } catch(err){ return false; } };
  if(!entries || !entries.every(([k, v]) => OWN(k) && typeof v === 'string' && validJSON(v))) return toast('That file is not a Playable export');
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
  if(e.target.closest && e.target.closest('.rpg')) return;
  if(e.key==='Escape'){ if(tipBtn){ closeTip(true); return; } if(!document.querySelector('.modal-bg.show') && isNarrow() && $('#drawerClose').classList.contains('show') && (!typing || document.activeElement.closest('#rail'))){ $('#drawerClose').click(); return; } closeModals(); return; }
  if(typing || !keysOn()) return;
  if(e.key==='/'){ e.preventDefault(); openSearch(); return; }
  if(e.key==='?'){ openModal('helpModal', 'h2'); return; }
  if(/^[1-9]$/.test(e.key) && NAV[+e.key - 1]){ go('#/' + NAV[+e.key - 1].views[0][0]); return; }
  if(e.key.toLowerCase()==='m'){ fitMap(); return; }
  if(e.key.toLowerCase()==='t'){ $('#themeBtn').click(); return; }
  const m = location.hash.match(/^#\/map\/t\/([\w-]+)/);
  if(m){ const t = TOPICS[m[1]]; if(!t) return; const list = DOM[t.d].topics, i = list.indexOf(m[1]);
    if(e.key===']' && i < list.length-1) go('#/map/t/'+list[i+1]);
    if(e.key==='[' && i > 0) go('#/map/t/'+list[i-1]);
    if(e.key.toLowerCase()==='e'){ const anyClosed = $$('.sec').some(s => !s.classList.contains('open')); expandAll(anyClosed); } }
});

// What the later files import from this one.
Object.assign(A, { $, $$, app, esc, DOM, TOPIC_LIST, store, seen, markSeen, updateProgress, toast, copyText, go, route, settled, isNarrow,
  setView, crumbs, domChip, list, chainHTML, promptBox, diagramCard, field, bindForm, outputBox, toolHead, practice, setTopicTab,
  topicBody, smellsView, pathProgress, savePathProgress, markStageStatus, pathNextStep, scheduleRecall, recallItems, recallIdeas, CONFIDENCE, OUTCOME, reviewItems, today, rpgCount, renderPaths, showPathStep, closeModals, openModal, DIAGRAM_DISSECTION, search, loadIndex, searchWords, STOP_WORDS, pinMap });
})(window.PlayableApp = {});

