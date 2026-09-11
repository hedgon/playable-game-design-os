/* =====================================================================
   APPLICATION
   Hash router -> views. All state in localStorage under "playable.*".
   ===================================================================== */
(function(){
'use strict';
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));
const app = $('#app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DOM = Object.fromEntries(DOMAINS.map(d => [d.id, d]));
const TOPIC_LIST = Object.values(TOPICS);
DOMAINS.forEach(d => d.topics = TOPIC_LIST.filter(t => t.d === d.id).map(t => t.id));

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
function applyTheme(t){ document.documentElement.setAttribute('data-theme', t); store.set('theme', t); }
applyTheme(store.get('theme', (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark'));
$('#themeBtn').onclick = () => applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');

/* ---------- toast / copy ---------- */
let toastT;
function toast(msg){ const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove('show'), 1600); }
async function copyText(text){ try { await navigator.clipboard.writeText(text); toast('Copied to clipboard'); } catch(e){ const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); toast('Copied'); }catch(err){ toast('Copy failed: select and copy manually'); } ta.remove(); } }
window.__copy = copyText;

/* ---------- router ---------- */
const VIEWS = [['map','Map'],['explore','Explore'],['diagnose','Diagnose'],['build','Build'],['ai','AI Workflow'],['playtest','Playtest'],['prompts','Prompts'],['checklists','Checklists']];
const VIEW_LINKS = { 'playtest-view':['#/playtest','Playtest view: question bank and hypothesis builder'], 'ai-roles-view':['#/ai/roles','AI Workflow: interactive role cards'], 'matrix-view':['#/ai/matrix','AI Workflow: responsibility matrix'], 'loop-view':['#/ai/loop','AI Workflow: the 12-step loop'], 'ai-failures-view':['#/ai/failures','AI Workflow: when AI makes your game worse'], 'checklists-view':['#/checklists','Checklists view'], 'prompt-library':['#/prompts','Prompt library'], 'should-we-build-this':['#/build/feature','Build: Should we build this? decision tree'] };
function go(hash){ if(location.hash === hash) route(); else location.hash = hash; }
function route(){
  const h = location.hash.replace(/^#\/?/, '') || 'map';
  const parts = h.split('/').filter(Boolean);
  const view = parts[0];
  $$('#primaryNav button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  closeModals();
  updateDock();
  switch(view){
    case 'map': return renderMap(parts[1], parts[2]);
    case 'explore': return renderExplore(parts[1]);
    case 'topic': return location.replace(TOPICS[parts[1]] ? '#/map/t/'+parts[1] : '#/map');
    case 'diagnose': return renderDiagnose(parts[1], parts[2]);
    case 'smell': return renderDiagnose('smells', parts[1]);
    case 'build': return renderBuild(parts[1]);
    case 'ai': return renderAI(parts[1], parts[2]);
    case 'playtest': return renderPlaytest();
    case 'prompts': return renderPrompts(parts[1]);
    case 'checklists': return renderChecklists(parts[1]);
    case 'sources': return renderSources();
    default: return renderMap();
  }
}
window.addEventListener('hashchange', route);
$('#primaryNav').innerHTML = VIEWS.map(([id, t]) => `<button data-view="${id}" onclick="location.hash='#/${id}'">${t}</button>`).join('');
$('#brandBtn').onclick = () => go('#/map');

function setView(html){ app.innerHTML = `<div class="view">${html}</div>`; app.scrollTop = 0; window.scrollTo({top:0}); }
function crumbs(items){ return `<div class="crumbs">${items.map((it, i) => (i ? '<span class="sep">›</span>' : '') + (it[1] ? `<button onclick="location.hash='${it[1]}'">${esc(it[0])}</button>` : `<span>${esc(it[0])}</span>`)).join('')}</div>`; }
function domChip(id){ const d = DOM[id]; return d ? `<span class="chip dom" style="--dc:${d.color}">${esc(d.t)}</span>` : ''; }
function topicLink(id, label){ const t = TOPICS[id]; if(t) return `<a href="#/map/t/${id}">${esc(label || t.t)}</a>`; const v = VIEW_LINKS[id]; if(v) return `<a href="${v[0]}">${esc(label || v[1])}</a>`; return esc(label || id); }
function promptBox(label, text){ const id = 'p'+Math.random().toString(36).slice(2); return `<div class="promptbox">${label ? `<div class="lbl">${esc(label)}</div>` : ''}<pre id="${id}">${esc(text)}</pre><button class="btn sm copybtn" onclick="__copy(document.getElementById('${id}').textContent)">Copy</button></div>`; }
function list(arr){ return `<ul>${(arr||[]).map(x => `<li>${esc(x)}</li>`).join('')}</ul>`; }
function chainHTML(items, cls){ return `<div class="chain">${items.map((it, i) => (i ? '<span class="arrow">→</span>' : '') + `<span class="cn ${it[2]||cls||''}" onclick="location.hash='${it[1]}'" title="${esc(it[3]||'')}">${esc(it[0])}</span>`).join('')}</div>`; }

/* =====================================================================
   MAP
   ===================================================================== */
/* MAP: see 91-map.js */

/* =====================================================================
   EXPLORE + TOPIC
   ===================================================================== */
function sidebar(activeDomain, activeTopic){
  const open = new Set(store.get('sideOpen', [activeDomain].filter(Boolean)));
  if(activeDomain) open.add(activeDomain);
  return `<aside class="side sticky" id="side"><button class="btn side-toggle" onclick="this.parentElement.classList.toggle('open')"><span>☰ Browse topics</span><span class="car">▸</span></button>${DOMAINS.map(d => `<div class="dom ${open.has(d.id)?'open':''}" data-id="${d.id}" style="--dc:${d.color}">
    <button onclick="__toggleDom('${d.id}')"><span class="dot"></span>${esc(d.t)}<span class="n">${d.topics.filter(t=>seen.has(t)).length}/${d.topics.length}</span><span class="car">▸</span></button>
    <div class="topics">${d.topics.map(tid => `<button class="${tid===activeTopic?'active':''} ${seen.has(tid)?'seen':''}" onclick="location.hash='#/topic/${tid}'"><span class="seen"></span>${esc(TOPICS[tid].t)}</button>`).join('')}</div></div>`).join('')}</aside>`;
}
window.__toggleDom = id => { const el = $(`.side .dom[data-id="${id}"]`); if(!el) return; el.classList.toggle('open'); store.set('sideOpen', $$('.side .dom.open').map(e => e.dataset.id)); };

function renderExplore(domainId){
  const d = DOM[domainId];
  let main;
  if(d){
    main = `${crumbs([['Map','#/map'],['Explore','#/explore'],[d.t]])}
      <div class="domain-hero" style="--dc:${d.color}"><h1>${esc(d.t)}</h1><p class="dim" style="font-size:1.05rem;max-width:820px">${esc(d.sum)}</p>
        <div class="chips">${d.links.map(([to]) => `<span class="chip dom" style="--dc:${DOM[to].color};cursor:pointer" onclick="location.hash='#/explore/${to}'">→ ${esc(DOM[to].t)}</span>`).join('')}</div></div>
      <div class="row" style="margin-bottom:10px"><a class="btn sm primary" href="#/map/d/${d.id}">Open this branch on the map ↗</a></div>
      <div class="section-head"><h2>Topics</h2></div>
      <div class="grid auto">${d.topics.map(tid => { const t = TOPICS[tid]; return `<div class="card clickable tint" style="--dc:${d.color}" onclick="location.hash='#/topic/${tid}'"><h3>${esc(t.t)} ${seen.has(tid)?'<span class="chip ok">read</span>':''}</h3><p class="dim small" style="margin:0">${esc(t.tag)}</p></div>`; }).join('')}</div>
      <div class="section-head"><h2>Why this connects</h2></div>
      <div class="grid c2">${d.links.map(([to, why]) => `<div class="card clickable" onclick="location.hash='#/explore/${to}'"><b style="color:${DOM[to].color}">${esc(d.t)} ↔ ${esc(DOM[to].t)}</b><p class="dim small" style="margin:4px 0 0">${esc(why)}</p></div>`).join('')}
      ${DOMAINS.filter(o => o.links.some(([to]) => to === d.id) && !d.links.some(([to]) => to === o.id)).map(o => { const why = o.links.find(([to]) => to===d.id)[1]; return `<div class="card clickable" onclick="location.hash='#/explore/${o.id}'"><b style="color:${o.color}">${esc(o.t)} ↔ ${esc(d.t)}</b><p class="dim small" style="margin:4px 0 0">${esc(why)}</p></div>`; }).join('')}</div>`;
  } else {
    main = `${crumbs([['Map','#/map'],['Explore']])}<h1>Explore all domains</h1><p class="dim">Twelve domains, ${TOPIC_LIST.length} topics. Each topic has the same eight practical parts, so you always know where the prompt patterns, verification questions and playtest questions are.</p>
      <div class="grid auto">${DOMAINS.map(d => `<div class="card clickable tint" style="--dc:${d.color}" onclick="location.hash='#/explore/${d.id}'"><h3>${esc(d.t)}</h3><p class="dim small">${esc(d.short)}</p><div class="small muted">${d.topics.length} topics · ${d.topics.filter(t=>seen.has(t)).length} read</div></div>`).join('')}</div>`;
  }
  setView(`<div class="split">${sidebar(domainId)}<div>${main}</div></div>`);
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
    case 'ai': return `<div class="ai-split"><div class="box yes"><h4 style="color:var(--d-ai)">AI is good at</h4>${list(t.ai.yes)}</div><div class="box no"><h4 style="color:var(--d-player)">AI should not decide</h4>${list(t.ai.no)}</div></div>`;
    case 'prompts': return (t.prompts||[]).map(p => promptBox(p.l, p.p)).join('') + `<p class="small muted" style="margin-top:8px">Every prompt assumes you filled the brackets with your real player, fantasy, loop, constraints and evidence. Unfilled brackets produce genre averages. See ${topicLink('prompting-framework')} and the <a href="#/build/prompt">Prompt Generator</a>.</p>`;
    case 'verify': return list(t.verify) + `<details><summary>Universal verification questions (apply to every AI output)</summary><div class="body">${list(['What assumptions are you making? Mark each as given, inferred, or invented.','What evidence supports this?','What could make this fail?','What player behavior would prove this wrong?','Is this solving the actual problem or producing more content?','Is this complexity necessary?','What is the smallest prototype that tests this?','What alternatives did we reject?','What tradeoff are we making?'])}<a class="btn sm" href="#/checklists/ai-verify">Open the verification checklist</a></div></details>`;
    case 'test': return list(t.test) + `<div class="row"><a class="btn sm" href="#/build/hypothesis">Write the hypothesis</a><a class="btn sm" href="#/playtest">Playtest question bank</a></div>`;
  }
  return '';
}

function topicBody(id){
  const t = TOPICS[id];
  if(!t){ return `<div class="empty">Unknown topic: ${esc(id)}</div>`; }
  markSeen(id);
  const d = DOM[t.d];
  const idx = d.topics.indexOf(id);
  const prev = idx > 0 ? d.topics[idx-1] : null, next = idx < d.topics.length-1 ? d.topics[idx+1] : null;
  const openSecs = new Set(store.get('openSecs', ['what','why','think']));
  const secs = SECTION_META.map(([key, letter, title]) => `<section class="sec ${openSecs.has(key)?'open':''}" data-key="${key}" style="--dc:${d.color}"><header onclick="__toggleSec(this.parentElement)"><span class="letter">${letter}</span><h3>${esc(title)}</h3><span class="car">▸</span></header><div class="body">${sectionBody(key, t)}</div></section>`).join('');
  const rel = (t.rel||[]).map(([rid, why]) => { const rt = TOPICS[rid]; const v = VIEW_LINKS[rid]; const href = rt ? `#/topic/${rid}` : (v ? v[0] : '#/explore'); const label = rt ? rt.t : (v ? v[1] : rid); const dc = rt ? DOM[rt.d].color : 'var(--accent)'; return `<div class="rel" onclick="location.hash='${href}'" style="border-left:3px solid ${dc}"><b>${esc(label)}</b><div class="why">${esc(why)}</div></div>`; }).join('');
  const smells = SMELLS.filter(s => s.causes.some(c => c.top === id));
  const main = `${crumbs([['Map','#/map'],['Explore','#/explore'],[d.t,'#/explore/'+d.id],[t.t]])}
    <div class="topic-head"><div style="flex:1"><div class="chips" style="margin-bottom:6px">${domChip(t.d)}<span class="chip">${idx+1} of ${d.topics.length}</span></div><h1>${esc(t.t)}</h1><p class="tag">${esc(t.tag)}</p></div>
      <div class="row"><button class="btn sm" onclick="__expandAll(true)">Expand all</button><button class="btn sm ghost" onclick="__expandAll(false)">Collapse</button></div></div>
    ${secs}
    <div class="section-head"><h2>Related concepts</h2><span class="muted">and why they connect</span></div>
    <div class="related">${rel}</div>
    ${smells.length ? `<div class="section-head"><h2>Design smells this topic helps diagnose</h2></div><div class="chips">${smells.map(s => `<span class="chip" style="cursor:pointer;padding:6px 10px" onclick="location.hash='#/smell/${s.id}'">${esc(s.t)}</span>`).join('')}</div>` : ''}
    <div class="topic-nav">${prev ? `<button class="btn" onclick="location.hash='#/map/t/${prev}'">← ${esc(TOPICS[prev].t)}</button>` : `<button class="btn ghost" onclick="location.hash='#/map/d/${d.id}'">← ${esc(d.t)} overview</button>`}<button class="btn ghost" onclick="location.hash='#/explore/${d.id}'">List view</button>${next ? `<button class="btn" onclick="location.hash='#/map/t/${next}'">${esc(TOPICS[next].t)} →</button>` : `<button class="btn" onclick="location.hash='#/map/home'">All domains →</button>`}</div>`;
  return main;
}
window.__toggleSec = el => { el.classList.toggle('open'); store.set('openSecs', $$('.sec.open').map(s => s.dataset.key)); };
window.__expandAll = on => { $$('.sec').forEach(s => s.classList.toggle('open', on)); store.set('openSecs', on ? SECTION_META.map(m => m[0]) : []); };

/* =====================================================================
   DIAGNOSE
   ===================================================================== */
function renderDiagnose(sub='smells', arg){
  const tabs = [['smells','Design smells'],['fun','Fun diagnostic'],['loop','Core loop'],['unfair','Unfairness'],['depth','Depth vs complexity'],['content','Content or mechanic?']];
  const head = `${crumbs([['Map','#/map'],['Diagnose']])}<h1>Diagnose</h1><p class="dim">Start from what you observe in players, not from what you built. Each diagnosis ends in an experiment and a prompt.</p>
    <div class="tabs">${tabs.map(([id, t]) => `<button class="${id===sub?'active':''}" onclick="location.hash='#/diagnose/${id}'">${t}</button>`).join('')}</div>`;
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

function smellCard(s){ return `<div class="smell" onclick="location.hash='#/smell/${s.id}'"><h3>${esc(s.t)}</h3><div class="small dim">${esc(s.sym)}</div><div class="chips" style="margin-top:6px">${s.dom.map(domChip).join('')}</div></div>`; }
function smellsView(id){
  const s = SMELLS.find(x => x.id === id);
  if(s){
    return `<div class="row between"><button class="btn ghost" onclick="location.hash='#/diagnose/smells'">← All smells</button><div class="chips">${s.dom.map(domChip).join('')}</div></div>
      <h2 style="margin-top:10px">${esc(s.t)}</h2><p class="dim">${esc(s.sym)}</p>
      ${s.dims ? `<div class="chips" style="margin-bottom:10px"><span class="small muted">Fun dimensions implicated:</span>${s.dims.map(d => `<span class="chip" style="cursor:pointer" onclick="location.hash='#/diagnose/fun/${d}'">${d}</span>`).join('')}</div>` : ''}
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
  return `<div class="callout"><b>Ask "what is the player actually enjoying here?"</b> not "what feature should we add?" Different games combine these dimensions differently; the working set below draws on LeBlanc's eight kinds of fun, Lazzaro's four keys, Koster's fun-as-learning and Self-Determination Theory. It is a vocabulary, not a law.</div>
    <h3>Dimensions of fun <span class="muted small">click one to see its test question and the smells where it goes flat</span></h3>
    <div class="dims">${FUN_DIMS.map(d => `<button class="${d[0]===dim?'active':''}" onclick="location.hash='#/diagnose/fun/${d[0]}'">${d[0]}<div class="small muted" style="font-weight:400">${esc(d[1])}</div></button>`).join('')}</div>
    ${active ? `<div class="card" style="margin-top:12px"><h3>${active[0]}</h3><p>${esc(active[1])}</p><p><b>Playtest question:</b> ${esc(active[2])}</p><h4>Smells where ${active[0]} goes flat</h4><div class="smell-list">${funSmells.filter(s => s.dims && s.dims.includes(active[0])).map(smellCard).join('') || '<div class="empty">No smell tagged with this dimension yet.</div>'}</div></div>` : ''}
    <div class="section-head"><h2>Symptom → dimensions → causes → experiments</h2></div>
    <div class="smell-list">${funSmells.map(s => `<div class="smell" onclick="location.hash='#/smell/${s.id}'"><h3>${esc(s.t)}</h3><div class="chips">${(s.dims||[]).map(d => `<span class="chip">${d}</span>`).join('')}</div></div>`).join('')}</div>
    ${promptBox('Ask AI to tag a playtest by fun dimension', `Here are timestamped observer notes from a playtest: [NOTES]. Tag each moment of visible engagement or disengagement with the fun dimension involved (${FUN_DIMS.map(d=>d[0]).join(', ')}). Summarize the distribution, compare it to our intended mix ([INTENDED]), and identify the largest gap. Propose one change to an existing interaction, not a new system, that would close it.`)}`;
}

function loopView(part){
  const p = LOOP_PARTS.find(x => x.id === part) || LOOP_PARTS[0];
  return `<div class="callout">Action → Feedback → Decision → Consequence → New situation. Click a link to see what happens when it is weak. Then fix that link before adding anything.</div>
    <div class="loopviz">${LOOP_PARTS.map(x => `<button class="${x.id===p.id?'active':''}" onclick="location.hash='#/diagnose/loop/${x.id}'">${esc(x.t)}<small>${esc(x.sub)}</small></button>`).join('')}</div>
    <div class="card"><h2>Weak ${esc(p.t)}</h2><p class="dim">${esc(p.weak)}</p>
      <div class="think-grid"><div class="box bad"><h4>Symptoms in playtests</h4>${list(p.sym)}</div><div class="box trap"><h4>Likely causes</h4>${list(p.causes)}</div><div class="box good"><h4>Fixes</h4>${list(p.fixes)}</div><div class="box"><h4>Go deeper</h4><ul>${p.top.map(t => `<li>${topicLink(t)}</li>`).join('')}</ul></div></div>
      ${promptBox('Ask AI to audit this link', `Act as a skeptical systems designer. Here is our core loop from the player's perspective: [FIVE SENTENCES]. Focus on the ${p.t.toLowerCase()} link. Rate its strength using only evidence from my description, name the playtest symptom that would appear if it is weak, and propose 3 mechanically distinct fixes with the decision each creates, the emotion intended, the likely failure mode, and the observable signal that would validate it. Do not recommend one.`)}
      <div class="row"><a class="btn" href="#/build/loop">Build your loop in the Loop Builder</a></div></div>`;
}

function unfairView(){
  return `<div class="callout"><b>"Unfair" is a specific complaint with specific causes.</b> Treating it as "too hard" leads to the wrong fix. Tick the signs you observed; the likely causes rise to the top. Every fix preserves the challenge.</div>
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
  const saved = store.get('ruleAudit', [{r:'Attack costs stamina; stamina regenerates when not attacking', k:'decision'},{r:'Three currency types with separate wallets', k:'load'},{r:'Fire spreads on grass; enemies avoid fire', k:'interaction'}]);
  return `<div class="grid c2">
    <div class="card"><h3>Complexity</h3><p>The number of rules, exceptions and pieces of state the player must understand to play. Paid up front, by every player, before any depth is reached.</p><h3>Depth</h3><p>The number of meaningful, situationally different decisions those rules generate. Enjoyed only by players who stay.</p><h3>Elegance</h3><p>Depth per unit of complexity. Chess: few rules, enormous depth. A game with 300 stats can be shallow. No agreed metric exists; use the audit as a lens.</p>
      <div class="callout warn"><b>AI-era note:</b> adding rules is now nearly free. Complexity inflation is the default failure. Cut rules that create no decision.</div>
      ${promptBox('Depth audit prompt', `Evaluate this system for depth rather than feature count: [RULES]. For each rule, classify it as (a) creates a situational decision, (b) enables an interaction with another rule, or (c) adds cognitive or implementation load only. Propose merges or deletions for every (c), stating what the player would lose. Estimate how many distinct meaningful decisions the simplified system still produces.`)}</div>
    <div class="card rule-audit"><h3>Rule audit <span class="muted small">saved locally</span></h3><p class="small dim">List your rules. Mark what each does. The meter shows depth per rule; the list shows what to cut.</p>
      <div id="rules">${saved.map(x => ruleRow(x)).join('')}</div>
      <div class="row" style="margin-top:8px"><input id="newRule" placeholder="Add a rule…" style="flex:1"><button class="btn" id="addRule">Add</button></div>
      <div id="ruleStats" style="margin-top:12px"></div></div></div>`;
}
function ruleRow(x){ return `<div class="rule"><input value="${esc(x.r)}" class="rtext"><select class="rkind"><option value="decision" ${x.k==='decision'?'selected':''}>creates a decision</option><option value="interaction" ${x.k==='interaction'?'selected':''}>enables an interaction</option><option value="load" ${x.k==='load'?'selected':''}>load only</option></select><button class="btn sm ghost danger rdel" title="Remove">✕</button></div>`; }
function wireDepth(){
  const rules = $('#rules'); if(!rules) return;
  const read = () => $$('.rule', rules).map(r => ({ r: $('.rtext', r).value, k: $('.rkind', r).value }));
  const update = () => { const rs = read(); store.set('ruleAudit', rs); const n = rs.length, dec = rs.filter(x => x.k==='decision').length, inter = rs.filter(x => x.k==='interaction').length, load = rs.filter(x => x.k==='load').length; const score = n ? Math.round(100*(dec+inter)/n) : 0;
    $('#ruleStats').innerHTML = n ? `<div class="kv"><dt>Rules (complexity)</dt><dd>${n}</dd><dt>Decision rules</dt><dd>${dec}</dd><dt>Interaction rules</dt><dd>${inter}</dd><dt>Load-only rules</dt><dd style="color:${load?'var(--bad)':'inherit'}">${load}</dd><dt>Elegance</dt><dd><div class="meter"><i style="width:${score}%"></i></div><span class="small muted">${score}% of rules earn their place</span></dd></div>${load ? `<div class="callout bad" style="margin-top:10px"><b>Cut list:</b> ${rs.filter(x=>x.k==='load').map(x=>esc(x.r)).join('; ')}. Prototype without them. Most players will not notice.</div>` : ''}` : '<div class="empty">No rules yet.</div>'; };
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
      if(typeof nxt === 'string'){ const verdict = nxt.split(':')[0]; html += `<div class="verdict ${verdict.startsWith('ADD')?'BUILD':verdict.startsWith('STOP')?'REMOVE':'SIMPLIFY'}"><h2>${esc(verdict)}</h2><p>${esc(nxt.slice(verdict.length+1).trim())}</p><div class="row"><a class="btn sm" href="#/topic/content-multiplies">Content multiplies systems</a><a class="btn sm" href="#/topic/core-loop">The core loop</a></div></div>`; break; }
      i = nxt; }
    el.innerHTML = html + (answers.length ? `<button class="btn ghost sm" id="ctreeReset" style="margin-top:8px">Start over</button>` : '');
    $$('.opts button', el).forEach(b => b.onclick = () => { const i = +b.dataset.i; answers.length = i; answers[i] = b.dataset.a; render(); });
    const r = $('#ctreeReset'); if(r) r.onclick = () => { answers.length = 0; render(); }; };
  render();
}

/* =====================================================================
   BUILD (tools)
   ===================================================================== */
const TOOLS = [
  ['idea','Idea Finder','From no idea to a concept people want: player → want → fantasy → verb → test'],
  ['dissect','Reference Dissection','Is my idea actually good? Cross-reference it against games that succeeded'],
  ['loop','Game Loop Builder','Action → Decision → Feedback → Reward → New situation, with a weak-link check'],
  ['canvas','Core Experience Canvas','Player, fantasy, emotions, goals, what it is not'],
  ['ladder','Behavior Ladder','From a feature idea to the behavior and back to the smallest mechanic'],
  ['feature','Should We Build This?','Nine questions → BUILD / PROTOTYPE FIRST / SIMPLIFY / DEFER / REMOVE'],
  ['hypothesis','Playtest Hypothesis Builder','We believe… we will know when… we will kill it if…'],
  ['delegate','AI Delegation Planner','Human, AI, both, or player evidence required'],
  ['sysmap','System Relationship Map','Nodes and typed edges; collision questions generated'],
  ['prompt','AI Prompt Generator','CONTEXT + INTENT + CONSTRAINTS + EVIDENCE + ROLE + TASK + OUTPUT + CRITIQUE']
];
function renderBuild(tool='idea'){
  const head = `${crumbs([['Map','#/map'],['Build']])}<h1>Build</h1><p class="dim">Lightweight canvases that force the questions this guide keeps asking. Everything saves in your browser. Every tool exports Markdown you can paste into a document or a prompt.</p>
    <div class="tool-nav">${TOOLS.map(([id, t, s]) => `<button class="${id===tool?'active':''}" onclick="location.hash='#/build/${id}'">${t}<small>${s}</small></button>`).join('')}</div>`;
  const fn = { idea: toolIdea, dissect: toolDissect, loop: toolLoop, canvas: toolCanvas, ladder: toolLadder, feature: toolFeature, hypothesis: toolHypothesis, delegate: toolDelegate, sysmap: toolSysmap, prompt: toolPrompt }[tool] || toolIdea;
  setView(head + `<div class="tool" id="tool"></div>`);
  fn($('#tool'));
}
function field(id, label, hint, val, rows){ return `<div class="field"><label for="${id}">${esc(label)}</label>${rows ? `<textarea id="${id}" rows="${rows}">${esc(val||'')}</textarea>` : `<input id="${id}" value="${esc(val||'')}">`}${hint ? `<div class="hint">${esc(hint)}</div>` : ''}</div>`; }
function bindForm(key, ids, onChange){ const data = store.get(key, {}); ids.forEach(id => { const el = $('#'+id); if(!el) return; if(data[id] !== undefined && !el.value) el.value = data[id]; el.addEventListener('input', () => { data[id] = el.value; store.set(key, data); onChange && onChange(data); }); }); onChange && onChange(data); return data; }
function outputBox(md){ const id = 'o'+Math.random().toString(36).slice(2); return `<div class="output promptbox"><pre id="${id}">${esc(md)}</pre><button class="btn sm copybtn" onclick="__copy(document.getElementById('${id}').textContent)">Copy</button></div>`; }
function toolHead(t, p, key){ return `<div class="toolhead"><div><h2>${esc(t)}</h2><p>${p}</p></div><button class="btn ghost sm danger" onclick="if(confirm('Clear this tool?')){localStorage.removeItem('playable.${key}');location.reload();}">Clear</button></div>`; }

function toolLoop(el){
  const parts = [['action','Action','What does the player physically do, most often? Is it the fantasy verb?'],['feedback','Feedback','How does the game tell them what happened and why, within ~100 ms?'],['decision','Decision','What choice do they face next, and what is the tradeoff?'],['consequence','Consequence and reward','What changes because of the choice, visibly, now?'],['situation','New situation','How is the next iteration different from this one?']];
  el.innerHTML = toolHead('Game Loop Builder', 'Write the loop from the player’s point of view, one sentence per link. Then answer the weak-link question for each. If you cannot answer it, that link is where to look first.', 'loopTool') +
    `<div class="grid c2"><div>${parts.map(([id, l, h]) => field('lb_'+id, l, h, '', 2) + field('lb_'+id+'_ev', 'How would a playtest show this link is strong?', 'Observable behavior, not opinion.', '', 1)).join('')}</div><div id="lb_out"></div></div>`;
  bindForm('loopTool', parts.flatMap(([id]) => ['lb_'+id, 'lb_'+id+'_ev']), d => {
    const weak = parts.filter(([id]) => !(d['lb_'+id]||'').trim() || !(d['lb_'+id+'_ev']||'').trim());
    const md = `# Core loop\n\n${parts.map(([id, l]) => `**${l}:** ${d['lb_'+id]||'(blank)'}\n  - Evidence it is strong: ${d['lb_'+id+'_ev']||'(blank)'}`).join('\n')}\n\n## Diagnosis\n${weak.length ? `Weak or untested links: ${weak.map(w=>w[1]).join(', ')}. Fix these before multiplying the loop with content or progression.` : 'All links described with evidence. Now build the bare loop in grey boxes and test whether players repeat it voluntarily.'}\n\n## Prompt\nAct as a skeptical systems designer. Here is our core loop as the player experiences it:\n${parts.map(([id,l]) => `- ${l}: ${d['lb_'+id]||''}`).join('\n')}\nFor each link, rate its strength using only my description, name the playtest symptom if weak, and propose 3 mechanically distinct fixes for the weakest link with the decision created, intended emotion, failure mode and validating signal. Do not recommend one.`;
    $('#lb_out').innerHTML = `<h4>Live output</h4>${outputBox(md)}${weak.length ? `<div class="callout warn"><b>Look first at:</b> ${weak.map(w => `<a href="#/diagnose/loop/${w[0]}">${w[1]}</a>`).join(', ')}</div>` : '<div class="callout ok">Every link has a claim and an observable. Prototype the bare loop next.</div>'}`;
  });
}

function toolCanvas(el){
  const fields = [['player','Player','A specific person: their last three games, their session, their device.',2],['fantasy','Fantasy','"In this game I get to be someone who…"',1],['verbs','Fantasy verbs','Three verbs the fantasy implies. Are they the loop verbs?',1],['emotions','Target emotions and rhythm','Two or three emotions and the order they alternate in.',1],['moment','Moment-to-moment','What the player does with hands and mind every few seconds.',2],['session','Session goal','What a satisfying session accomplishes.',1],['long','Long-term goal','Why they come back next week.',1],['not','What this game is NOT','Adjacent experiences you refuse. The not-list.',2],['refs','Reference moments','Moments from other games that produce the target feeling, and what exactly produces it.',2]];
  el.innerHTML = toolHead('Core Experience Canvas', 'One page that every discipline aims at. If any field is hard to fill, that is the design work to do first.', 'canvasTool') + `<div class="grid c2"><div>${fields.map(([id,l,h,r]) => field('cv_'+id, l, h, '', r)).join('')}</div><div id="cv_out"></div></div>`;
  bindForm('canvasTool', fields.map(f => 'cv_'+f[0]), d => {
    const st = `A ${d.cv_emotions||'[emotions]'} experience where ${d.cv_player||'[player]'} gets to be ${d.cv_fantasy||'[fantasy]'} by ${d.cv_moment||'[moment-to-moment]'}. Not ${d.cv_not||'[what it is not]'}.`;
    const md = `# Core experience\n\n> ${st}\n\n${fields.map(([id,l]) => `**${l}:** ${d['cv_'+id]||'(blank)'}`).join('\n\n')}\n\n## Check\n- Do the fantasy verbs appear in the moment-to-moment activity?\n- Can the target emotions be produced by the mechanics described?\n- Would a playtester use the emotion words unprompted?`;
    $('#cv_out').innerHTML = `<h4>Experience statement (draft)</h4><div class="quotebig" style="font-size:1.05rem">${esc(st)}</div>${outputBox(md)}<div class="row"><a class="btn sm" href="#/topic/core-experience">Read: core experience</a><a class="btn sm" href="#/topic/fantasy">Read: fantasy</a></div>`;
  });
}

function toolLadder(el){
  const rungs = [['feature','Feature idea','The noun someone proposed. "Crafting." "A pet system." "Daily quests."'],['behavior','Desired player behavior','Observable in a playtest. What would they DO differently?'],['experience','Experience','What they feel while doing it.'],['system','System','The situation that produces the behavior: constraints, information, consequences.'],['mechanic','Smallest mechanic','The least rule that implements the system.'],['refeature','Feature, revisited','Now: which feature, if any? Is it the one you started with?']];
  el.innerHTML = toolHead('Behavior Ladder', 'Feature thinking: feature → implementation → justification. Experience thinking: behavior → experience → system → mechanic → feature. Start at the top with the noun you were handed, climb to the behavior, then descend.', 'ladderTool') +
    `<div class="row" style="margin-bottom:10px"><button class="btn sm" id="ladderEx">Load the crafting example</button></div><div class="grid c2"><div class="ladder">${rungs.map(([id,l,h]) => `<div class="rung"><b>${esc(l)}</b><div>${field('ld_'+id, '', h, '', 2)}</div></div>`).join('')}</div><div id="ld_out"></div></div>`;
  const d = bindForm('ladderTool', rungs.map(r => 'ld_'+r[0]), d => {
    const same = (d.ld_feature||'').trim() && (d.ld_refeature||'').trim() && d.ld_feature.trim().toLowerCase() === d.ld_refeature.trim().toLowerCase();
    const md = `# Behavior ladder\n\n${rungs.map(([id,l]) => `**${l}:** ${d['ld_'+id]||'(blank)'}`).join('\n\n')}\n\n## Prompt\nSomeone proposed the feature "${d.ld_feature||'[FEATURE]'}". The behavior we actually want is: ${d.ld_behavior||'[BEHAVIOR]'}. Propose 5 mechanics, smallest first, that would produce this behavior; for each, the rule in one sentence, the decision it creates, what it interacts with, and how we would observe the behavior in a 15-minute test. Then argue that an existing system could be changed to produce it without any new mechanic.`;
    $('#ld_out').innerHTML = `<h4>Live output</h4>${outputBox(md)}${same ? '<div class="callout warn">You landed on the same feature you started with. Fine if the ladder really led there; suspicious if you wrote the behavior to justify the noun.</div>' : ''}<div class="row"><a class="btn sm" href="#/build/feature">Now run: Should we build this?</a><a class="btn sm" href="#/topic/feature-vs-experience">Read: experience thinking</a></div>`;
  });
  $('#ladderEx').onclick = () => { const ex = LADDER_EXAMPLE; const map = {feature:ex.feature, behavior:ex.behavior, experience:ex.experience, system:ex.system, mechanic:ex.mechanic, refeature:ex.refeature}; Object.entries(map).forEach(([k,v]) => { const i = $('#ld_'+k); i.value = v; i.dispatchEvent(new Event('input')); }); };
}

function toolFeature(el){
  const saved = store.get('featureTool', {name:'', answers:{}});
  el.innerHTML = toolHead('Should we build this?', 'Nine questions a feature must survive. The verdict is a heuristic that weights evidence, decisions and loop impact; use it to structure the argument, not to end it.', 'featureTool') +
    field('ft_name', 'Feature under review', '', saved.name) + `<div id="ft_qs"></div><div id="ft_verdict"></div>`;
  const render = () => { const a = saved.answers; let score = 0, done = 0;
    $('#ft_qs').innerHTML = FEATURE_TREE.map((q, qi) => { const sel = a[q.id]; if(sel !== undefined){ score += q.opts[sel][1]; done++; } return `<div class="tree-q"><b>${qi+1}. ${esc(q.q)}</b><div class="opts">${q.opts.map((o, oi) => `<button class="${sel===oi?'sel':''}" data-q="${q.id}" data-o="${oi}">${esc(o[0])}</button>`).join('')}</div></div>`; }).join('');
    $$('#ft_qs .opts button').forEach(b => b.onclick = () => { saved.answers[b.dataset.q] = +b.dataset.o; store.set('featureTool', saved); render(); });
    if(done === FEATURE_TREE.length){ const [v, text] = featureVerdict(score, a); const label = v==='PROTOTYPE' ? 'PROTOTYPE FIRST' : v;
      const md = `# Feature review: ${saved.name||'(unnamed)'}\n\nVerdict: **${label}** (score ${score})\n\n${FEATURE_TREE.map((q,i) => `${i+1}. ${q.q}\n   → ${q.opts[a[q.id]][0]}`).join('\n')}\n\n${text}`;
      $('#ft_verdict').innerHTML = `<div class="verdict ${v}"><h2>${label}</h2><p>${esc(text)}</p><div class="row"><a class="btn sm" href="#/build/hypothesis">Write the hypothesis</a><a class="btn sm" href="#/topic/scope-control">Read: scope control</a><a class="btn sm" href="#/build/ladder">Climb the behavior ladder</a></div></div>${outputBox(md)}`; }
    else $('#ft_verdict').innerHTML = `<div class="empty">${FEATURE_TREE.length-done} question${FEATURE_TREE.length-done>1?'s':''} left</div>`; };
  $('#ft_name').addEventListener('input', e => { saved.name = e.target.value; store.set('featureTool', saved); });
  render();
}

function toolHypothesis(el){
  const f = [['who','We believe [PLAYER]','Which player, specifically? Not "players": the sketch.'],['will','will [BEHAVIOR]','Observable in a 15-minute session. What they do, not what they feel.'],['because','because [REASON]','The mechanism. Why would the design cause the behavior?'],['signal','We will know it is working when [SIGNAL]','A rate, a count, a repeated behavior. Something you could log.'],['kill','We will kill or change it if [KILL CRITERION]','The result that ends the idea. If you cannot write one, you are hoping, not testing.'],['smallest','Smallest experiment','Paper? Spreadsheet? Grey boxes? How long to build? How many players?'],['alt','Alternative explanation','What else would produce the signal even if the hypothesis is false?']];
  el.innerHTML = toolHead('Playtest Hypothesis Builder', 'Every significant design decision, expressible as a claim about player behavior with a signal and a kill criterion, written before the build.', 'hypTool') + `<div class="grid c2"><div>${f.map(([id,l,h]) => field('hy_'+id, l, h, '', 2)).join('')}</div><div id="hy_out"></div></div>`;
  bindForm('hypTool', f.map(x => 'hy_'+x[0]), d => {
    const st = `We believe ${d.hy_who||'[PLAYER]'} will ${d.hy_will||'[BEHAVIOR]'} because ${d.hy_because||'[REASON]'}. We will know this is working when ${d.hy_signal||'[SIGNAL]'}. We will kill or change it if ${d.hy_kill||'[KILL CRITERION]'}.`;
    const md = `# Hypothesis\n\n> ${st}\n\n**Smallest experiment:** ${d.hy_smallest||'(blank)'}\n\n**Alternative explanation to rule out:** ${d.hy_alt||'(blank)'}\n\n## Prototype brief (paste to AI)\nAct as a prototype engineer. Hypothesis: ${st} Build the smallest playable test in [ENGINE]: only the mechanics needed, shapes only, no menus or saves. Expose [VALUES] as live sliders. Log with timestamps every input, decision point with the option chosen, failure with cause, and session start/end; export CSV. Before coding, list the design decisions the code will embed and wait for my choices.\n\n## Observation protocol (paste to AI)\nDesign a silent observation protocol for this hypothesis with [N] players for [MINUTES]: what to log, a non-leading interview guide ordered from behavior to opinion, a coding scheme, and a results template that separates behavior from self-report.`;
    const warn = []; if(/feel|enjoy|like|fun/i.test(d.hy_will||'')) warn.push('The behavior mentions feeling or fun. Rewrite it as something observable.'); if(!(d.hy_kill||'').trim()) warn.push('No kill criterion yet.');
    $('#hy_out').innerHTML = `<h4>Hypothesis</h4><div class="quotebig" style="font-size:1.05rem">${esc(st)}</div>${warn.length ? `<div class="callout warn">${warn.map(esc).join('<br>')}</div>` : ''}${outputBox(md)}<div class="row"><a class="btn sm" href="#/topic/hypothesis-driven-design">Read: hypothesis-driven design</a><a class="btn sm" href="#/playtest">Playtest question bank</a></div>`;
  });
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
    const W=520, H=400, cx=W/2, cy=H/2, R=Math.min(W,H)/2-50; const pos = {}; N.forEach((n,i) => { const a = -Math.PI/2 + i*2*Math.PI/Math.max(N.length,1); pos[n.n] = [cx+R*Math.cos(a), cy+R*Math.sin(a)]; });
    const col = {resource:'var(--d-systems)',mechanic:'var(--d-core)',ability:'var(--d-experience)',enemy:'var(--d-product)',environment:'var(--d-level)',progression:'var(--d-production)','player choice':'var(--d-player)'};
    $('#sm_svg').innerHTML = `<svg viewBox="0 0 ${W} ${H}"><defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--fg3)"/></marker></defs>
      ${E.map(e => { const [x1,y1]=pos[e[0]], [x2,y2]=pos[e[2]]; const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy)||1; const ex=x2-dx/len*30, ey=y2-dy/len*30, sx=x1+dx/len*30, sy=y1+dy/len*30; const mx=(sx+ex)/2 - dy/len*14, my=(sy+ey)/2 + dx/len*14; return `<path class="se ${e[1]}" d="M${sx},${sy} Q${mx},${my} ${ex},${ey}" marker-end="url(#arr)"/><text class="se-label" x="${mx}" y="${my}" text-anchor="middle">${e[1]}</text>`; }).join('')}
      ${N.map(n => { const [x,y]=pos[n.n]; const deg = E.filter(e => e[0]===n.n||e[2]===n.n).length; return `<g class="sn" transform="translate(${x},${y})"><circle r="26" fill="${col[n.t]||'var(--accent)'}" opacity="${deg?0.25:0.08}" stroke="${deg?col[n.t]:'var(--bad)'}" stroke-width="${deg?2:1.5}" stroke-dasharray="${deg?'':'4 3'}"/><text text-anchor="middle" y="3">${esc(n.n.length>11?n.n.slice(0,10)+'…':n.n)}</text><text text-anchor="middle" y="40" style="font-size:9px;fill:var(--fg3);font-weight:400">${n.t}</text></g>`; }).join('')}</svg>`;
    // analysis
    const isolated = N.filter(n => !E.some(e => e[0]===n.n||e[2]===n.n));
    const pairs = []; for(let i=0;i<N.length;i++) for(let j=i+1;j<N.length;j++){ const a=N[i].n, b=N[j].n; if(!E.some(e => (e[0]===a&&e[2]===b)||(e[0]===b&&e[2]===a))) pairs.push([N[i],N[j]]); }
    const questions = pairs.slice(0,8).map(([a,b]) => `What happens when <b>${esc(a.n)}</b> (${a.t}) meets <b>${esc(b.n)}</b> (${b.t})? Could one ${a.t==='resource'||b.t==='resource'?'consume or produce':'amplify or counter'} the other?`);
    const md = `# System map\n\nNodes: ${N.map(n=>`${n.n} (${n.t})`).join(', ')}\n\nEdges:\n${E.map(e=>`- ${e[0]} ${e[1]} ${e[2]}`).join('\n')}\n\nIsolated: ${isolated.map(n=>n.n).join(', ')||'none'}\n\n## Prompt\nHere are our systems and their relationships: ${E.map(e=>`${e[0]} ${e[1]} ${e[2]}`).join('; ')}. Nodes with no relationships: ${isolated.map(n=>n.n).join(', ')||'none'}. For the ${pairs.length} unconnected pairs, propose one concrete interaction rule each where it would fit the fantasy "[FANTASY]", the emergent strategy it might produce, and the smallest prototype that would show it. Then list the 3 most dangerous existing interactions that could produce exploits.`;
    $('#sm_analysis').innerHTML = `<h4 style="margin-top:12px">Analysis</h4>${isolated.length ? `<div class="callout warn"><b>Isolated:</b> ${isolated.map(n=>esc(n.n)).join(', ')}. A system that touches nothing is a mini-game. Connect it or cut it.</div>` : '<div class="callout ok">No isolated nodes.</div>'}<h4>Collision questions <span class="muted">(${pairs.length} unconnected pairs)</span></h4><ul class="small">${questions.map(q=>`<li>${q}</li>`).join('')||'<li>Every pair is connected. Now ask which existing edges could be exploited.</li>'}</ul>${outputBox(md)}<div class="row"><a class="btn sm" href="#/topic/systemic-design">Read: systemic design</a><a class="btn sm" href="#/topic/agency-and-emergence">Read: emergence</a></div>`; };
  $('#sm_addn').onclick = () => { const v = $('#sm_nn').value.trim(); if(!v || saved.nodes.some(n=>n.n===v)) return; saved.nodes.push({n:v, t:$('#sm_nt').value}); $('#sm_nn').value=''; store.set('sysmapTool', saved); render(); };
  $('#sm_nn').onkeydown = e => { if(e.key==='Enter') $('#sm_addn').click(); };
  $('#sm_adde').onclick = () => { const a=$('#sm_ea').value, b=$('#sm_eb').value, k=$('#sm_ek').value; if(!a||!b||a===b) return; saved.edges.push([a,k,b]); store.set('sysmapTool', saved); render(); };
  render();
}

function toolPrompt(el){
  const parts = [['context','CONTEXT','Player, fantasy, core loop, systems. The situation as it is.',3],['intent','INTENT','The experience you want and the decision you need to make.',2],['constraints','CONSTRAINTS','Platform, scope, team, what is off the table.',2],['evidence','EVIDENCE','Playtest results, telemetry, known problems. If none, say so; the task should then be a test design.',2],['role','ROLE','Skeptical systems designer? UX researcher? Devil’s advocate? Pick one stance.',1],['task','TASK','Analyze, generate, compare, build, simulate, code. Specific verbs, specific counts.',2],['output','OUTPUT FORMAT','Table columns, ranked list, code with logging, a hypothesis in standard form.',1],['critique','CRITIQUE','What the AI should attack in its own output, and what it must not do (recommend, decide, add scope).',2]];
  el.innerHTML = toolHead('AI Prompt Generator', 'The formula: CONTEXT + INTENT + CONSTRAINTS + EVIDENCE + ROLE + TASK + OUTPUT FORMAT + CRITIQUE. Fill what you know. Blanks are shown as brackets so you notice what you have not decided yet.', 'promptTool') +
    `<div class="formula">${parts.map(p => `<button onclick="document.getElementById('pg_${p[0]}').focus()">${p[1]}</button>`).join('<span class="plus">+</span>')}</div><div class="grid c2"><div>${parts.map(([id,l,h,r]) => field('pg_'+id, l, h, '', r)).join('')}</div><div id="pg_out"></div></div>`;
  bindForm('promptTool', parts.map(p => 'pg_'+p[0]), d => {
    const v = k => (d['pg_'+k]||'').trim();
    const txt = `CONTEXT: ${v('context')||'[player, fantasy, loop, systems]'}\n\nINTENT: ${v('intent')||'[the experience we want; the decision I must make]'}\n\nCONSTRAINTS: ${v('constraints')||'[platform, scope, team, off-limits]'}\n\nEVIDENCE: ${v('evidence')||'[playtest results, telemetry, known problems; or "none yet"]'}\n\nROLE: Act as a skeptical ${v('role')||'[role]'}.\n\nTASK: ${v('task')||'Analyze the design space, identify the assumptions in the current design, generate mechanically distinct alternatives, compare their tradeoffs, and propose the smallest experiments that would distinguish between them.'}\n\nOUTPUT FORMAT: ${v('output')||'[table columns / ranked list / code with logging]'}\n\nCRITIQUE: ${v('critique')||'Finally, attack your own output: what assumptions did you make (mark given, inferred, invented), what could make each alternative fail, what player behavior would prove it wrong, and what did you leave out? Do not recommend a final choice; I will decide.'}`;
    const missing = parts.filter(p => !v(p[0])).map(p => p[1]);
    $('#pg_out').innerHTML = `<h4>Generated prompt</h4>${outputBox(txt)}${missing.length ? `<div class="callout warn"><b>Unfilled:</b> ${missing.join(', ')}. ${missing.includes('EVIDENCE') ? 'No evidence: consider making the task "design the test" instead of "design the feature".' : ''} ${missing.includes('INTENT') ? 'No intent: the AI will pick the decision for you.' : ''}</div>` : '<div class="callout ok">All eight terms filled. After the output, run the verification pass.</div>'}<div class="row"><a class="btn sm" href="#/prompts/verify">Verification pass prompt</a><a class="btn sm" href="#/ai/roles">Choose a role</a><a class="btn sm" href="#/prompts">Prompt library</a></div>`;
  });
}

/* ---------- Idea Finder: from no idea to a concept people want ---------- */
const IDEA_BANK = {
  roles:['thief','lighthouse keeper','cartographer','negotiator','gardener','smuggler','detective','conductor','shepherd','tinkerer','courier','archivist','diver','beekeeper','warden','forger','innkeeper','stormchaser'],
  verbs:['sneak past','barter with','chart','tend','rebuild','deduce the secrets of','herd','orchestrate','salvage from','forecast','disguise yourself among','bind','dismantle','translate','ration','lure','outlast','befriend'],
  objects:['a city that forgets you every night','a sea that keeps its dead','a machine nobody understands','a town of rivals who trade favors','a forest that moves when unwatched','a market of liars','a fleet of ghosts','a border that shifts daily','an orchestra of monsters','a mountain of debts','a garden that grows from memories','a rail network of feuding families'],
  tensions:['while the light runs out','before the tide returns','as the map redraws itself','with a rival who learns from you','while every mistake is remembered','with one chance per day','as your tools wear out','while the truth changes hands','with less room each time','while someone is counting on you']
};
const IDEA_PRESETS = [
  ['Commuter','Commuter, 8-minute sessions, phone, one thumb; plays puzzle and auto-battler games; quits when a session cannot finish cleanly.'],
  ['Couch co-op pair','Two people on a couch, 45-minute evenings, controllers; finish story and co-op games together; hate when one player idles.'],
  ['Ladder competitor','Competitive PC player, 2-hour sessions; chases rank in tactics or fighting games; quits when losses feel unexplainable.'],
  ['Cozy completionist','30-minute sessions on Switch; collects everything in farming and life sims; leaves when the checklist becomes a chore.'],
  ['Systems tinkerer','PC, 3-hour weekends; builds factories and breaks economies; leaves when the optimum is found.'],
  ['Story-first','Any platform, 1-hour sessions; finishes narrative games and replays choices; leaves when choices stop mattering.']
];
function toolIdea(el){
  const saved = store.get('ideaTool', { player:'', games:'', complaints:'', wish:'', dims:[], constraints:'', fantasy:'', verb:'', loop_action:'', loop_decision:'', loop_change:'', alternatives:'', cands:[] });
  const save = () => store.set('ideaTool', saved);
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  const gen = () => Array.from({length:6}, () => `You are a ${pick(IDEA_BANK.roles)} who must ${pick(IDEA_BANK.verbs)} ${pick(IDEA_BANK.objects)}, ${pick(IDEA_BANK.tensions)}.`);
  if(!saved.cands.length) saved.cands = gen();
  el.innerHTML = toolHead('Idea Finder', 'You do not need an idea. You need a want: a specific person, what they already love, what they complain about, and what they wish existed. Ideas that start there get played; ideas that start from "wouldn’t it be cool" get admired. Eight steps, live output, ending in three tests that show whether people want it before you build it.', 'ideaTool') +
  `<div class="grid c2"><div>
    <div class="step-num">Step 1 · Who is the player?</div>
    <div class="presets">${IDEA_PRESETS.map((p,i) => `<button data-p="${i}">${esc(p[0])}</button>`).join('')}</div>
    ${field('id_player','A specific person','Session length, device, the games they finish, when they quit. Pick a preset or write your own. Not "gamers".', saved.player, 2)}
    <div class="step-num">Step 2 · What do they already want?</div>
    ${field('id_games','Three games they love','Name them. These are the conventions they know and the bar you are measured against.', saved.games, 1)}
    ${field('id_complaints','What they complain about in those games','Read their reviews and forum threads. Complaints are unmet wants with a price tag already attached.', saved.complaints, 2)}
    ${field('id_wish','What they wish existed','"I wish there was a game where I could…" Write three. Steal from real conversations.', saved.wish, 2)}
    <div class="step-num">Step 3 · Which kinds of fun? (pick two or three)</div>
    <div class="dims" id="id_dims">${FUN_DIMS.map(d => `<button data-d="${d[0]}" class="${saved.dims.includes(d[0])?'active':''}" title="${esc(d[1])}">${d[0]}</button>`).join('')}</div>
    <div class="step-num">Step 4 · Constraints</div>
    ${field('id_constraints','Team, time, platform, skills','"Two people, four months, PC, strong at systems and weak at art." Constraints are where distinctive ideas come from.', saved.constraints, 2)}
    <div class="step-num">Step 5 · Fantasy: who do they get to be?</div>
    <p class="small dim">Random collisions to react to. None of these is your game; the one that makes you say "no, but…" is the lead. Click to adopt, then rewrite it in your own words.</p>
    <div class="idea-cands" id="id_cands"></div>
    <div class="row" style="margin:8px 0"><button class="btn sm" id="id_reroll">Reroll</button></div>
    ${field('id_fantasy','Your fantasy sentence','"In this game I get to be someone who…" Must contain a verb the player performs constantly.', saved.fantasy, 2)}
    <div class="step-num">Step 6 · The core verb and the loop</div>
    ${field('id_verb','Core verb','The one thing the player does most. It must be the fantasy verb.', saved.verb, 1)}
    ${field('id_loop_action','Action: what do they do, physically, every few seconds?','', saved.loop_action, 1)}
    ${field('id_loop_decision','Decision: what tradeoff do they face every minute?','', saved.loop_decision, 1)}
    ${field('id_loop_change','Change: what is different after each loop?','', saved.loop_change, 1)}
    <div class="step-num">Step 7 · Versus what?</div>
    ${field('id_alternatives','What will this player play instead of yours?','Name the two or three games your player already has. The concept has to beat them on the want from step 2, not on feature count.', saved.alternatives, 1)}
    <div class="step-num">Step 8 · Is it actually good? Dissect the games that succeeded</div>
    <div class="callout" style="margin-top:4px"><p>A raw idea is a guess. Take the games from step 7 apart with one template (want served, core verb, decision per minute, why it worked, what players complain about), then answer seven cross-reference questions. The verdict tells you whether you are promising, derivative, unproven or undeliverable, and what to test first.</p><div class="row"><a class="btn primary sm" href="#/build/dissect">Open Reference Dissection →</a><a class="btn sm" href="#/map/t/learning-from-success">Read: dissect games that succeeded</a></div>${(() => { const ds = store.get('dissectTool', null); if(!ds || !ds.comps || !ds.comps.length) return ''; const done = XREF_QS.filter(q => ds.answers && ds.answers[q.id] !== undefined).length; const score = XREF_QS.reduce((s,q) => s + (ds.answers && ds.answers[q.id] !== undefined ? q.opts[ds.answers[q.id]][1] : 0), 0); return `<div class="small" style="margin-top:8px">Comparables: <b>${ds.comps.map(c => esc(c.t)).join(', ')}</b>. ${done === XREF_QS.length ? 'Verdict: <b>'+dissectVerdict(ds.answers, score)[0]+'</b>' : (XREF_QS.length-done)+' cross-reference questions left.'}</div>`; })()}</div>
  </div><div id="id_out"></div></div>`;
  const ids = ['player','games','complaints','wish','constraints','fantasy','verb','loop_action','loop_decision','loop_change','alternatives'];
  const renderCands = () => { $('#id_cands').innerHTML = saved.cands.map((c,i) => `<button data-i="${i}" class="${saved.fantasy===c?'sel':''}">${esc(c)}</button>`).join(''); $$('#id_cands button').forEach(b => b.onclick = () => { saved.fantasy = saved.cands[+b.dataset.i]; $('#id_fantasy').value = saved.fantasy; save(); renderCands(); out(); }); };
  const out = () => {
    const v = k => (saved[k]||'').trim();
    const dims = saved.dims;
    const warn = [];
    if(!v('complaints') && !v('wish')) warn.push('No wants yet. An idea without a want is a genre reflex. Fill step 2 before step 5.');
    if(dims.length > 3) warn.push('More than three kinds of fun. Focus produces a game people can describe; breadth produces "something for everyone".');
    if(v('fantasy') && v('verb') && !v('fantasy').toLowerCase().includes(v('verb').toLowerCase().split(' ')[0])) warn.push('The core verb does not appear in the fantasy sentence. One of them is wrong.');
    if(!v('constraints')) warn.push('No constraints. Constraints are what make an idea buildable and distinctive.');
    const who = v('player') ? v('player').split(/[,;.\n]/)[0].trim() : '[PLAYER]';
    const pos = `For ${who} who ${v('wish')?('want '+v('wish').split(/[.\n]/)[0].trim().replace(/^i wish (there was|for)?\s*/i,'').replace(/\bI could\b/g,'they can').replace(/\bI\b/g,'they')):(v('complaints')?('are tired of '+v('complaints').split(/[.\n]/)[0].trim()):'[WANT]')}, this is the game where you ${v('verb')||'[CORE VERB]'}${v('fantasy')?(' as '+v('fantasy').replace(/^In this game I get to be someone who\s*/i,'').replace(/^You are\s*/i,'')):''}, unlike ${v('alternatives')||'[ALTERNATIVES]'}.`;
    const hyp = `We believe ${v('player')?v('player').split(/[,.]/)[0]:'[PLAYER]'} will voluntarily replay a 10-minute paper or grey-box prototype of "${v('verb')||'[CORE VERB]'}" because it delivers ${dims.length?dims.slice(0,3).join(', '):'[KINDS OF FUN]'} that ${v('alternatives')||'[ALTERNATIVES]'} do not. We will know when at least 3 of 5 matched players ask to play again or describe the fantasy in first person. We will kill it if nobody replays and nobody can say what they were trying to do.`;
    const md = `# Concept: ${v('fantasy')||'(untitled)'}\n\n**Player:** ${v('player')||'(blank)'}\n**They love:** ${v('games')||'(blank)'}\n**They complain about:** ${v('complaints')||'(blank)'}\n**They wish:** ${v('wish')||'(blank)'}\n**Kinds of fun:** ${dims.join(', ')||'(none chosen)'}\n**Constraints:** ${v('constraints')||'(blank)'}\n**Fantasy:** ${v('fantasy')||'(blank)'}\n**Core verb:** ${v('verb')||'(blank)'}\n**Loop:** action: ${v('loop_action')||'?'} · decision: ${v('loop_decision')||'?'} · change: ${v('loop_change')||'?'}\n**Instead of:** ${v('alternatives')||'(blank)'}\n\n## Positioning\n${pos}\n\n## Hypothesis\n${hyp}\n\n## Want tests (run before building anything)\n1. Stranger pitch: say the positioning sentence to 10 people who match the player. Count who asks a question about how it plays and who asks when they can play it. Kill if fewer than 3 ask anything.\n2. Fake one-pager: one image (a mock screenshot, even drawn) plus the sentence. Show it to 10 matched players; ask "what do you think you would do in this?" Pass if their answer contains the core verb. Kill if they describe a different game.\n3. Paper or grey-box loop: one day to build, 10 minutes per player, 5 matched players. Pass if 3 replay voluntarily and can say what they were trying to do.\n\n## Prompts\n### Complaint mining\nHere are review excerpts and forum posts for ${v('games')||'[THREE GAMES]'} written by players like this: ${v('player')||'[PLAYER]'}. Cluster complaints and praise by underlying want (competence, autonomy, relatedness, fantasy, novelty, comfort). For each cluster, state the want in the players' own words, how often it appears, and which of the three games comes closest to satisfying it. Do not propose game ideas.\n\n### Concept expansion\nPlayer: ${v('player')||'[PLAYER]'}. Their wants: ${v('complaints')||'[COMPLAINTS]'} / ${v('wish')||'[WISHES]'}. Kinds of fun to serve: ${dims.join(', ')||'[DIMS]'}. Constraints: ${v('constraints')||'[CONSTRAINTS]'}. Lead fantasy: ${v('fantasy')||'[FANTASY]'}. Generate 8 mechanically distinct concepts that serve these wants inside these constraints. For each: fantasy sentence, core verb, the first 30 seconds of play, the decision the player faces every minute, why THIS player would choose it over ${v('alternatives')||'[ALTERNATIVES]'}, and the cheapest test that would show they want it. Reject your own concepts that are genre averages. Do not recommend.\n\n### Devil's advocate\nArgue that nobody wants "${v('fantasy')||'[FANTASY]'}": that ${v('alternatives')||'[ALTERNATIVES]'} already satisfy the want, that the core verb "${v('verb')||'[VERB]'}" is not fun for 10 minutes in grey boxes, and that the constraints (${v('constraints')||'[CONSTRAINTS]'}) make the fantasy undeliverable. Then state exactly what evidence from the three want tests would change your mind.`;
    $('#id_out').innerHTML = `<h4>Positioning</h4><div class="quotebig" style="font-size:1.05rem">${esc(pos)}</div>${warn.length ? `<div class="callout warn">${warn.map(esc).join('<br>')}</div>` : '<div class="callout ok">Every step has an answer. Run the three want tests before writing a line of production code.</div>'}<h4>Hypothesis</h4><p class="small">${esc(hyp)}</p><h4>Concept one-pager, tests and prompts</h4>${outputBox(md)}<div class="row"><a class="btn sm" href="#/topic/finding-an-idea">Read: start from a want</a><a class="btn sm" href="#/build/canvas">Next: Core Experience Canvas</a><a class="btn sm" href="#/build/hypothesis">Hypothesis Builder</a><a class="btn sm" href="#/topic/audience-and-positioning">Positioning</a></div>`;
  };
  ids.forEach(k => { const e = $('#id_'+k); e.addEventListener('input', () => { saved[k] = e.value; save(); if(k==='fantasy') renderCands(); out(); }); });
  $$('.presets button', el).forEach(b => b.onclick = () => { saved.player = IDEA_PRESETS[+b.dataset.p][1]; $('#id_player').value = saved.player; save(); out(); });
  $$('#id_dims button').forEach(b => b.onclick = () => { const d = b.dataset.d; saved.dims = saved.dims.includes(d) ? saved.dims.filter(x => x!==d) : [...saved.dims, d]; b.classList.toggle('active'); save(); out(); });
  $('#id_reroll').onclick = () => { saved.cands = gen(); save(); renderCands(); };
  renderCands(); out();
}

/* =====================================================================
   AI WORKFLOW
   ===================================================================== */
function renderAI(sub='loop', arg){
  const tabs = [['loop','The 12-step loop'],['philosophy','Bottleneck shift'],['roles','AI roles'],['matrix','Responsibility matrix'],['framework','Prompting framework'],['failures','When AI makes it worse']];
  const head = `${crumbs([['Map','#/map'],['AI Workflow']])}<h1>AI Workflow</h1><p class="dim">How to delegate design work to AI without delegating design judgment.</p><div class="tabs">${tabs.map(([id,t]) => `<button class="${id===sub?'active':''}" onclick="location.hash='#/ai/${id}'">${t}</button>`).join('')}</div>`;
  let body = '';
  if(sub==='loop') body = aiLoopView(arg);
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
window.__loopHere = n => { store.set('loopHere', n); renderAI('loop', String(n)); };
function aiLoopView(arg){
  const here = store.get('loopHere', null);
  const n = +(arg || here || 1); const s = LOOP_STEPS[n-1] || LOOP_STEPS[0];
  return `<div class="callout"><b>The visual backbone of this guide.</b> Player evidence sits between exploration and commitment. Mark where your project is; it persists. Skipping steps 5 to 8 is how AI-era projects fail.</div>
    <div class="stepper">${LOOP_STEPS.map(x => `<button class="${x.n===s.n?'active':''} ${x.n===here?'here':''}" onclick="location.hash='#/ai/loop/${x.n}'"><b>${x.n}</b>${esc(x.t)}</button>`).join('')}</div>
    <div class="card"><div class="row between"><h2 style="margin:0">${s.n}. ${esc(s.t)} <span class="muted" style="font-weight:500;font-size:1rem">${esc(s.goal)}</span></h2><button class="btn sm ${here===s.n?'primary':''}" onclick="__loopHere(${s.n})">${here===s.n?'✓ We are here':'Mark: we are here'}</button></div>
      <div class="think-grid" style="margin-top:12px"><div class="box" style="border-color:color-mix(in srgb,var(--d-player) 50%,transparent)"><h4 style="color:var(--d-player)">Human does</h4><p>${esc(s.human)}</p></div><div class="box" style="border-color:color-mix(in srgb,var(--d-ai) 50%,transparent)"><h4 style="color:var(--d-ai)">AI does</h4><p>${esc(s.ai)}</p></div><div class="box good"><h4>Output</h4><p>${esc(s.out)}</p><h4>Exit criterion</h4><p>${esc(s.exit)}</p></div><div class="box bad"><h4>Common failure</h4><p>${esc(s.fail)}</p><h4 style="color:var(--fg2)">Go deeper</h4><ul>${s.top.map(t => `<li>${topicLink(t)}</li>`).join('')}</ul></div></div>
      <div class="row" style="margin-top:10px">${s.n>1?`<button class="btn" onclick="location.hash='#/ai/loop/${s.n-1}'">← ${esc(LOOP_STEPS[s.n-2].t)}</button>`:''}${s.n<12?`<button class="btn" onclick="location.hash='#/ai/loop/${s.n+1}'">${esc(LOOP_STEPS[s.n].t)} →</button>`:`<button class="btn" onclick="location.hash='#/ai/loop/1'">Repeat → Define</button>`}</div></div>
    <div class="section-head"><h2>Versus the workflow that fails</h2></div>
    <div class="grid c2"><div class="card" style="border-color:color-mix(in srgb,var(--ok) 50%,transparent)"><h4 style="color:var(--ok)">Hypothesis-driven</h4>${chainHTML([['Hypothesis','#/topic/hypothesis-driven-design'],['Prototype','#/topic/prototyping'],['Test','#/topic/playtesting'],['Evidence','#/topic/iteration-and-evidence'],['Decision','#/ai/loop/9']])}<p class="small dim">Scope follows validated value: Idea → Prototype → Evidence → Commit.</p></div>
    <div class="card" style="border-color:color-mix(in srgb,var(--bad) 50%,transparent)"><h4 style="color:var(--bad)">Hope-driven</h4>${chainHTML([['Idea','#/topic/scope-control'],['Huge implementation','#/ai/failures'],['Polish','#/topic/polish-when'],['Hope','#/topic/ai-failure-modes']])}<p class="small dim">Idea → Production commitment. AI makes this cheaper and therefore more tempting.</p></div></div>`;
}
function aiPhilosophyView(){
  const t = TOPICS['bottleneck-shift'];
  return `<div class="card"><h2>AI changes the bottleneck</h2>
    <div class="workflow-compare"><div><h4>Traditional</h4>${chainHTML([['Human thinks','#/topic/bottleneck-shift','human'],['Human designs','#/topic/bottleneck-shift','human'],['Human documents','#/topic/bottleneck-shift','human'],['Human implements','#/topic/bottleneck-shift','human']])}</div>
    <div><h4>AI era</h4>${chainHTML([['Human frames','#/topic/prompting-framework','human'],['AI expands, searches, analyzes','#/topic/ai-roles','ai'],['Human judges','#/topic/verifying-ai-output','human'],['AI prototypes, implements','#/topic/ai-for-implementation','ai'],['Players provide evidence','#/topic/playtesting','evidence'],['Human decides','#/topic/iteration-and-evidence','human'],['AI iterates','#/ai/loop','ai']])}</div></div>
    <div class="bottleneck" style="margin-top:14px"><div class="col"><h4>No longer the bottleneck</h4><ul><li class="strike">writing</li><li class="strike">coding</li><li class="strike">generating content</li><li class="strike">producing variations</li><li class="strike">documentation</li></ul></div><div class="mid">→</div><div class="col"><h4>The bottleneck now</h4><ul><li>taste</li><li>judgment</li><li>problem framing</li><li>prioritization</li><li>understanding players</li><li>recognizing fun</li><li>separating signal from noise</li><li>making tradeoffs</li><li>knowing what NOT to build</li></ul></div></div>
    <div class="quotebig">AI can generate possibilities extremely cheaply. Humans must decide what is worth making.</div>
    <div class="quotebig" style="border-left-color:var(--bad)">A polished bad idea is still a bad game.</div>
    <div class="grid c2" style="margin-top:12px"><div class="box"><h4>Questions to ask yourself weekly</h4>${list(t.think.q)}</div><div class="box"><h4>Traps</h4>${list(t.think.traps)}</div></div>
    <div class="row" style="margin-top:12px"><a class="btn" href="#/topic/bottleneck-shift">Full topic: the bottleneck shift</a><a class="btn" href="#/topic/scope-control">Scope control</a></div>
    <div class="callout" style="margin-top:14px"><b>Field note (2024 to 2026):</b> industry surveys and GDC talks in this period report designers using generative AI mostly for research, brainstorming, code assistance and prototyping rather than shipped assets, with widespread concern about generic output and volume over quality. The practitioners who report it working keep the first prototype, use AI to widen options rather than choose them, and validate with playtests. That is the pattern this guide encodes.</div></div>`;
}
function aiRolesView(arg){
  return `<div class="callout">Ask for a role, not for "ideas". Click a card for when to use it, when to keep it away, a starter prompt and what to verify. None of the nine roles is "decider".</div>
    <div class="grid c3">${ROLES.map(r => `<div class="role ${arg===r.id?'open':''}" id="role-${r.id}"><h3 style="color:var(--d-ai)">${esc(r.t)}</h3><p class="dim" style="margin:0">${esc(r.job)}</p><div class="more"><h4 style="color:var(--ok)">Use when</h4>${list(r.use)}<h4 style="color:var(--bad)">Do not use when</h4>${list(r.avoid)}${promptBox('Starter prompt', r.starter)}<h4>Verify</h4>${list(r.verify)}</div><div class="small muted" style="margin-top:6px">click to ${arg===r.id?'collapse':'expand'}</div></div>`).join('')}</div>
    <div class="section-head"><h2>A good sequence</h2></div>${chainHTML([['Brainstormer','#/ai/roles/brainstormer','ai'],['Critic','#/ai/roles/critic','ai'],['Systems designer','#/ai/roles/systems','ai'],['Human decides what to test','#/topic/hypothesis-driven-design','human'],['Prototype engineer','#/ai/roles/engineer','ai'],['Players','#/topic/playtesting','evidence'],['Playtest analyst','#/ai/roles/analyst','ai'],['Human interprets and decides','#/ai/loop/9','human'],["Devil's advocate before commit",'#/ai/roles/devil','ai'],['Content generator, after validation','#/ai/roles/content','ai']])}`;
}
function aiMatrixView(){
  return `<div class="callout">Decide who owns each task before the work starts. <span class="chip human">PRIMARY human</span> <span class="chip ai">PRIMARY AI</span> <span class="chip shared">Shared</span> Click a row for the reason. Filter to see the pattern: judgment stays human; volume, simulation and production go to AI.</div>
    <div class="pill-tabs" id="mxFilter"><button class="active" data-f="">All</button><button data-f="human">Human primary</button><button data-f="ai">AI primary</button><button data-f="shared">Shared</button></div>
    <div class="tablewrap"><table class="matrix"><thead><tr><th>Task</th><th>Human</th><th>AI</th></tr></thead><tbody id="mxBody">${MATRIX.map((m, i) => { const cls = m[1]==='PRIMARY'&&m[2]!=='PRIMARY' ? 'human' : m[2]==='PRIMARY'&&m[1]!=='PRIMARY' ? 'ai' : 'shared'; return `<tr data-f="${cls}" data-i="${i}" style="cursor:pointer"><td>${esc(m[0])}</td><td class="who"><span class="chip ${m[1]==='PRIMARY'?'human':''}">${m[1]}</span></td><td class="who"><span class="chip ${m[2]==='PRIMARY'?'ai':''}">${m[2]}</span></td></tr><tr class="why hidden" data-for="${i}"><td colspan="3" class="small dim" style="background:var(--bg2)">${esc(m[3])}</td></tr>`; }).join('')}</tbody></table></div>
    <div class="row" style="margin-top:12px"><a class="btn" href="#/build/delegate">Plan your own tasks in the Delegation Planner</a><a class="btn" href="#/topic/responsibility-matrix">Read the topic</a></div>`;
}
function wireMatrix(){
  $$('#mxBody tr[data-i]').forEach(r => r.onclick = () => { const w = $(`#mxBody tr.why[data-for="${r.dataset.i}"]`); w.classList.toggle('hidden'); });
  $$('#mxFilter button').forEach(b => b.onclick = () => { $$('#mxFilter button').forEach(x => x.classList.remove('active')); b.classList.add('active'); const f = b.dataset.f; $$('#mxBody tr[data-i]').forEach(r => { const show = !f || r.dataset.f === f; r.classList.toggle('hidden', !show); const w = $(`#mxBody tr.why[data-for="${r.dataset.i}"]`); if(!show) w.classList.add('hidden'); }); });
}
function aiFrameworkView(){
  const terms = FORMULA_TERMS;
  return `<div class="callout">The best prompt is rarely "give me ideas". It is: <i>here is the player, fantasy, current loop, constraints, evidence and known problems; analyze the design space, identify assumptions, generate alternatives, compare tradeoffs, and propose the smallest experiments that distinguish between them.</i></div>
    <div class="formula" id="fmla">${terms.map((t,i) => `<button data-i="${i}" class="${i===0?'active':''}">${t[0]}</button>`).join('<span class="plus">+</span>')}</div>
    <div class="card" id="fmlaInfo"><h3>${terms[0][0]}</h3><p>${esc(terms[0][1])}</p></div>
    <div class="grid c2" style="margin-top:14px"><div class="card" style="border-color:color-mix(in srgb,var(--bad) 50%,transparent)"><h4 style="color:var(--bad)">Weak</h4><pre>Design a fun combat system.</pre><p class="small dim">No player, no fantasy, no constraint, no evidence, no role, no output shape. You will get the genre average with confidence.</p></div>
    <div class="card" style="border-color:color-mix(in srgb,var(--ok) 50%,transparent)"><h4 style="color:var(--ok)">Strong</h4>${promptBox('', `Act as a skeptical systems designer. Here is the intended player fantasy, target skill level, desired decision density, and current prototype: [CONTEXT]. Generate 5 mechanically distinct solutions. For each, identify the player decision created, intended emotion, likely failure mode, implementation complexity, and what evidence would validate or invalidate the hypothesis. Do not recommend a solution yet.`)}${promptBox('Then', `Now challenge these concepts. Assume the game feels repetitive after 20 minutes. Identify which underlying decisions are too shallow and propose the smallest experiments that could test your diagnosis.`)}</div></div>
    <div class="row" style="margin-top:12px"><a class="btn primary" href="#/build/prompt">Open the Prompt Generator</a><a class="btn" href="#/prompts">Prompt library</a><a class="btn" href="#/topic/prompting-framework">Read the topic</a></div>`;
}
const FORMULA_TERMS = [['CONTEXT','Player, fantasy, core loop, systems. The world as it is. Without it you get the genre average.'],['INTENT','The experience you want and the decision you need to make. Without it the AI picks the decision.'],['CONSTRAINTS','Platform, scope, team, off-limits. Without them you get the biggest plausible answer.'],['EVIDENCE','Playtest results, telemetry, known problems. Without it the task should be "design the test", not "design the feature".'],['ROLE','The stance: skeptical systems designer, UX researcher, devil’s advocate. Without it you get mild everything.'],['TASK','Analyze, generate N, compare, simulate, build with logging. Specific verbs and counts.'],['OUTPUT FORMAT','A table, a ranked list, code with an exposed tuning panel, a hypothesis in standard form. How you will consume it.'],['CRITIQUE','What the AI must attack in its own output and what it must not do: recommend, decide, add scope.']];
function wireFramework(){ $$('#fmla button').forEach(b => b.onclick = () => { $$('#fmla button').forEach(x => x.classList.remove('active')); b.classList.add('active'); const t = FORMULA_TERMS[+b.dataset.i]; $('#fmlaInfo').innerHTML = `<h3>${esc(t[0])}</h3><p>${esc(t[1])}</p>`; }); }
function aiFailuresView(){
  return `<h2>When AI makes your game worse</h2><p class="dim">Fourteen systematic failures. Each follows from AI strengths (fluency, volume, plausibility) meeting human weaknesses (deference, impatience, fear of deciding). Symptom → why → how to detect → how to correct.</p>
    <div class="grid c2">${FAILURES.map(f => `<div class="fail"><h3>${esc(f.t)}</h3><dl class="kv"><dt>Symptom</dt><dd>${esc(f.sym)}</dd><dt>Why it happens</dt><dd>${esc(f.why)}</dd><dt>How to detect</dt><dd>${esc(f.detect)}</dd><dt>How to correct</dt><dd><b>${esc(f.fix)}</b></dd></dl></div>`).join('')}</div>
    <div class="row" style="margin-top:14px"><a class="btn" href="#/checklists/ai-verify">AI output verification checklist</a><a class="btn" href="#/checklists/scope-sanity">Monthly scope sanity</a><a class="btn" href="#/topic/ai-failure-modes">Read the topic</a></div>`;
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
      <tr><td>Think-aloud</td><td>Mental model, intent</td><td>Distorts behavior and pace</td><td>Transcribe; extract model statements</td></tr>
      <tr><td>Task-based usability</td><td>Whether specific things can be done</td><td>Engagement</td><td>Design tasks; compute success and time</td></tr>
      <tr><td>Interview</td><td>Memory, meaning, what stuck</td><td>Accuracy; politeness bias</td><td>Draft non-leading guides; code answers</td></tr>
      <tr><td>Telemetry</td><td>Choices, retries, session ends at scale</td><td>Why</td><td>Correlate with observed events; find distributions</td></tr>
      <tr><td>Replay analysis</td><td>Strategies, unintended approaches</td><td>What the player was thinking</td><td>Classify approaches; count variety</td></tr>
      <tr><td>Retention</td><td>Whether they came back</td><td>Everything else</td><td>Segment by first-session behavior</td></tr></tbody></table></div>
    <div class="section-head"><h2>Session flow</h2></div>
    ${chainHTML([['Write the question and hypothesis','#/build/hypothesis','human'],['Recruit matched players','#/topic/who-is-the-player','human'],['Silent observation, timestamped notes','#/topic/playtesting','evidence'],['Tasks if needed','#/topic/ux-as-design','evidence'],['Open interview, behavior first','#/topic/playtesting','evidence'],['AI codes and clusters','#/topic/ai-for-playtest-analysis','ai'],['Human adds context, interprets','#/ai/loop/8','human'],['Decide one or two changes','#/ai/loop/9','human'],['Log it','#/topic/iteration-and-evidence','human']])}
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
  setView(`${crumbs([['Map','#/map'],['Prompt library']])}<h1>Prompt library</h1><p class="dim">Reusable patterns built on the formula. Fill the variables; the prompt updates live. Every template ends with a stop or critique instruction so the AI does not decide for you.</p>
    <div class="split"><aside class="side sticky"><button class="btn side-toggle" onclick="this.parentElement.classList.toggle('open')"><span>☰ Browse templates</span><span class="car">▸</span></button>${cats.map(c => `<div class="dom open"><button style="cursor:default"><span class="dot" style="background:var(--d-ai)"></span>${c}</button><div class="topics">${PROMPT_TEMPLATES.filter(p => p.cat===c).map(p => `<button class="${p.id===id?'active':''}" onclick="location.hash='#/prompts/${p.id}'">${esc(p.t)}</button>`).join('')}</div></div>`).join('')}</aside>
    <div id="promptMain">${sel ? '' : `<div class="grid auto">${PROMPT_TEMPLATES.map(p => `<div class="card clickable" onclick="location.hash='#/prompts/${p.id}'"><span class="chip ai">${p.cat}</span><h3 style="margin-top:6px">${esc(p.t)}</h3><p class="small dim" style="margin:0">${esc(p.p.slice(0,140))}…</p></div>`).join('')}</div><div class="callout" style="margin-top:14px">Want to compose your own? The <a href="#/build/prompt">Prompt Generator</a> walks the eight terms. Topic pages each carry prompts specific to that concept.</div>`}</div></div>`);
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
  setView(`${crumbs([['Map','#/map'],['Checklists']])}<h1>Checklists</h1><p class="dim">Practical reviews. Checkbox state is saved per checklist; reset when you start a new feature or session.</p>
    <div class="pill-tabs">${CHECKLISTS.map(c => `<button class="${c.id===sel.id?'active':''}" onclick="location.hash='#/checklists/${c.id}'">${esc(c.t)}</button>`).join('')}</div>
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
  ['MDA framework and the eight kinds of fun','Hunicke, LeBlanc and Zubek (2004): mechanics are what designers write, dynamics what happens at runtime, aesthetics what players feel. Designers build bottom-up; players experience top-down. LeBlanc’s eight aesthetics (sensation, fantasy, narrative, challenge, fellowship, discovery, expression, submission) are an explicitly non-exhaustive vocabulary.','Used in: Fun dimensions, Mechanics and rules.','heuristic'],
  ['Four keys to fun','Nicole Lazzaro (2004), from observing players’ emotional expressions: hard fun (mastery, fiero), easy fun (curiosity), people fun (social), serious fun (meaning). Her heuristic: successful games offer at least three.','Used in: Fun dimensions.','heuristic'],
  ['Self-Determination Theory in games','Ryan, Rigby and Przybylski (2006) and Rigby and Ryan, Glued to Games (2011): enjoyment and continued play track satisfaction of competence, autonomy and relatedness. One of the few research-backed models here.','Used in: Player motivation, Return and quit, Social experience.','research'],
  ['Flow and player-steered difficulty','Csikszentmihalyi’s flow (challenge matching skill); Jenova Chen’s thesis Flow in Games (2006) argues for letting players steer difficulty through play rather than hidden adjustment. Flow-channel literalism is contested; some games live outside the band on purpose.','Used in: Difficulty, Fun dimensions.','contested'],
  ['Interesting decisions','Sid Meier (GDC 2012): a game is a series of interesting decisions; interesting ones involve tradeoffs, depend on the situation, and express the player. Decisions need visible consequences and enough information to reason.','Used in: Meaningful decisions, Risk and reward, Core loop diagnostic.','heuristic'],
  ['Depth versus complexity; elegance','Popularized by Extra Credits (2013) and widely used since: complexity is what the player must learn, depth is the meaningful decisions that result; elegance is depth per rule. Soren Johnson’s Water Finds a Crack (2011): players exploit every hole. No agreed metric; use as a lens.','Used in: Depth vs complexity, Rule audit tool.','heuristic'],
  ['A Theory of Fun','Raph Koster (2004): fun is the pleasure of learning and mastering patterns; boredom arrives when the pattern is exhausted, trivial, or too noisy to perceive.','Used in: Fun dimensions, Skill and mastery, Repetitive smell.','heuristic'],
  ['The Art of Game Design','Jesse Schell (2008): the elemental tetrad (mechanics, story, aesthetics, technology) and the lenses, question-sets that force one viewpoint at a time. This guide’s eight-part topic structure is in that spirit.','Used in: the topic structure, Narrative and Presentation domains.','heuristic'],
  ['Game Feel and the Art of Screenshake','Steve Swink (2008): real-time control of virtual objects, in a simulated space, emphasized by polish; response within about 100 ms. Jan Willem Nijman (Vlambeer, 2013): a live demo of how much perceived quality comes from layered feedback.','Used in: Game feel and juice, Feedback, Floaty combat smell.','heuristic'],
  ['Kishōtenketsu level structure','Koichi Hayashida (Nintendo, 2012 interview on Super Mario 3D Land): introduce, develop, twist, conclude; each level a short lesson about one idea. Celeste (Maddy Thorson, GDC 2017): one movement idea per room, failure kept cheap.','Used in: Level structure (teach, test, twist, combine, master, rest).','heuristic'],
  ['Ludonarrative dissonance','Clint Hocking (2007), on a game whose mechanics rewarded self-interest while its story preached altruism. Sometimes a deliberate expressive tool, not always a defect.','Used in: Ludonarrative alignment.','heuristic'],
  ['Ten thousand bowls of oatmeal','Kate Compton (2016): a generator can make endless mathematically unique outputs that all read as the same thing. Perceptual uniqueness is the real bar; perceptual differentiation the minimum.','Used in: Procedural and AI-generated content, Content spam failure mode.','heuristic'],
  ['Game UX: usability and engage-ability','Celia Hodent, The Gamer’s Brain (2017): usability (signs and feedback, clarity, form follows function, consistency, minimum workload, error recovery, flexibility) versus engage-ability. Don Norman’s affordances and signifiers; Nielsen’s heuristics adapted for games.','Used in: the whole UX domain.','research'],
  ['Playtesting as empiricism','Mike Ambinder (Valve, GDC 2009): designs are hypotheses, playtests are experiments, observe behavior and weigh self-report against it. Richard Lemarchand, A Playful Production Process (2021): concentric development, vertical slice, regular structured playtesting. Dan Cook: skill atoms, loops and arcs.','Used in: Playtesting, Hypothesis-driven design, Vertical slice, Content multiplies.','practice'],
  ['Designing Games','Tynan Sylvester (2013): games are systems for generating experiences; target emotion, design for emergence, and maximize emotional power while minimizing burden on players and team.','Used in: Core experience, Systemic design, Agency and emergence.','heuristic'],
  ['Studio maxims, read carefully','Jaime Griesemer’s “30 seconds of fun” (Bungie) meant nested loops of roughly 3 seconds, 30 seconds and 3 minutes, not one repeated loop. “Easy to learn, hard to master” is Bushnell’s Law (Atari), adopted by Blizzard; a slogan, not a method.','Used in: Core loop, Goals at three horizons.','contested'],
  ['Hypothesis-driven design','The “We believe X will Y because Z; we will know when W” template comes from Lean Startup (Eric Ries) and Lean UX (Gothelf and Seiden), not from a game-specific source; its game analogue is Ambinder’s and Lemarchand’s practice of testing with a written question.','Used in: Hypothesis Builder, the 12-step loop.','practice'],
  ['Generative AI in design workflows (2024 to 2026)','Industry surveys in this period report rising developer concern about generative AI, with usage concentrated in research, brainstorming, code assistance and prototyping rather than shipped assets. Talks and articles (for example Rez Graham, GDC 2025; Raph Koster on depth and AI understanding) warn of derivative output and volume over quality. The recurring success pattern: designers own the first prototype, use AI to widen options rather than choose them, and validate with playtests.','Used in: the whole AI Collaboration domain, When AI makes your game worse.','practice'],
  ['Postmortems that generalize','Into the Breach (Subset Games): cut by whether it serves the core decision loop. Spelunky (Derek Yu): generation earned its place after authored room templates made runs readable. Slay the Spire (Mega Crit): telemetry guided balance, designers kept the call. Hades (Supergiant): early access forced regular playable builds and tuning against real players.','Used in: Scope control, Procedural content, Builds and loadouts, Iteration on evidence.','practice'],
  ['Player taxonomies','Bartle’s types (1996) came from text MUDs and were never validated as exclusive segments; later work (Nick Yee, Quantic Foundry) treats motivations as continuous scales. This guide uses taxonomies as vocabulary, never as segmentation.','Used in: Who is the player, Player motivation.','contested']
];
function renderSources(){
  const tag = k => ({research:'<span class="chip ok">research-backed</span>', heuristic:'<span class="chip">practitioner heuristic</span>', contested:'<span class="chip warn">contested</span>', practice:'<span class="chip shared">practice</span>'})[k];
  setView(`${crumbs([['Map','#/map'],['Sources and lineage']])}<h1>Sources and lineage</h1><p class="dim" style="max-width:820px">This guide synthesizes established game-design thinking rather than inventing a framework. Nothing here is a law. Most of it is practitioner heuristics that have survived across genres; a few items rest on research; several are contested and marked as such. Verify against your players.</p>
    <div class="grid c2">${SOURCES.map(s => `<div class="card"><div class="row between"><h3 style="margin:0">${esc(s[0])}</h3>${tag(s[3])}</div><p style="margin:8px 0 6px">${esc(s[1])}</p><div class="small muted">${esc(s[2])}</div></div>`).join('')}</div>
    <div class="callout" style="margin-top:14px"><b>How the synthesis was done.</b> Frameworks were checked for attribution and date; where a maxim is routinely misquoted, the guide states the original intent. Where a template has no game-specific origin (the hypothesis form), the guide says so. Where ideas conflict (definitions of fun, flow literalism, player types), they are presented as lenses and the reader is told to test against players.</div>`);
}

/* =====================================================================
   SEARCH
   ===================================================================== */
const INDEX = [];
TOPIC_LIST.forEach(t => INDEX.push({ type:'topic', t:t.t, snip:t.tag, href:'#/map/t/'+t.id, text:[t.t, t.tag, t.what, ...(t.why||[]), ...(t.think.q||[]), ...(t.think.traps||[]), ...(t.how||[]), ...(t.prompts||[]).map(p=>p.l+' '+p.p)].join(' ').toLowerCase() }));
DOMAINS.forEach(d => INDEX.push({ type:'domain', t:d.t, snip:d.short, href:'#/explore/'+d.id, text:(d.t+' '+d.short+' '+d.sum).toLowerCase() }));
const SMELL_KW = { 'repetitive':'samey boring grind monotonous stale loop', 'one-build':'meta dominant strategy convergence balance pick rate', 'ignore-mechanics':'unused abilities never touched', 'tutorial-too-long':'onboarding skip text explain', 'impressive-but-boring':'polish spectacle graphics demo', 'fun-but-no-return':'retention churn day two return', 'meaningless-progression':'grind number goes up unlock pointless', 'too-many-currencies':'economy wallet gems coins', 'floaty-combat':'weight impact hit feel juice', 'unfair':'cheap random punishing difficulty spike', 'no-experiment':'curiosity try things safe', 'same-way':'style variety identical', 'features-not-better':'feature creep scope bloat roadmap', 'ai-ideas-none-right':'generic brainstorm options proposals', 'quit-early':'drop off first session bounce', 'dont-understand-system':'mental model confusing rules', 'ignore-content':'skip side content rush optional', 'players-lose-agency':'choices do not matter cutscene control', 'dont-know-what-to-do':'lost aimless wander objective' };
SMELLS.forEach(s => INDEX.push({ type:'smell', t:s.t, snip:s.sym, href:'#/smell/'+s.id, text:(s.t+' '+s.sym+' '+(SMELL_KW[s.id]||'')+' '+s.causes.map(c=>c.c+' '+c.exp).join(' ')).toLowerCase() }));
PROMPT_TEMPLATES.forEach(p => INDEX.push({ type:'prompt', t:p.t, snip:p.cat+' · '+p.p.slice(0,100)+'…', href:'#/prompts/'+p.id, text:(p.t+' '+p.cat+' '+p.p).toLowerCase() }));
ROLES.forEach(r => INDEX.push({ type:'AI role', t:r.t, snip:r.job, href:'#/ai/roles/'+r.id, text:(r.t+' '+r.job+' '+r.use.join(' ')+' '+r.avoid.join(' ')+' '+r.starter).toLowerCase() }));
SOURCES.forEach(s => INDEX.push({ type:'source', t:s[0], snip:s[1].slice(0,110)+'…', href:'#/sources', text:(s[0]+' '+s[1]).toLowerCase() }));
REFERENCE_GAMES.forEach(g => INDEX.push({ type:'reference', t:g.t, snip:`${g.year} · ${g.genre} · ${g.lesson.slice(0,90)}…`, href:'#/build/dissect', text:(g.t+' '+g.genre+' '+g.want+' '+g.verb+' '+g.why+' '+g.lesson+' '+g.misses).toLowerCase() }));
FAILURES.forEach(f => INDEX.push({ type:'failure', t:f.t, snip:f.sym, href:'#/ai/failures', text:(f.t+' '+f.sym+' '+f.why+' '+f.fix).toLowerCase() }));
TOOLS.forEach(([id,t,s]) => INDEX.push({ type:'tool', t, snip:s, href:'#/build/'+id, text:(t+' '+s).toLowerCase() }));
CHECKLISTS.forEach(c => INDEX.push({ type:'checklist', t:c.t, snip:c.desc, href:'#/checklists/'+c.id, text:(c.t+' '+c.desc+' '+c.groups.flatMap(g=>g[1]).join(' ')).toLowerCase() }));
LOOP_STEPS.forEach(s => INDEX.push({ type:'loop step', t:`${s.n}. ${s.t}`, snip:s.goal, href:'#/ai/loop/'+s.n, text:(s.t+' '+s.goal+' '+s.human+' '+s.ai+' '+s.fail).toLowerCase() }));
FUN_DIMS.forEach(d => INDEX.push({ type:'fun', t:d[0], snip:d[1], href:'#/diagnose/fun/'+d[0], text:(d[0]+' '+d[1]+' '+d[2]).toLowerCase() }));
INDEX.push({ type:'diagnostic', t:'Core loop diagnostic', snip:'Action, feedback, decision, consequence, new situation', href:'#/diagnose/loop', text:'core loop diagnostic action feedback decision consequence new situation weak link' });
INDEX.push({ type:'diagnostic', t:'Unfairness diagnostic', snip:'Why players say the game is unfair', href:'#/diagnose/unfair', text:'unfair cheap random punishment checkpoint telegraph difficulty diagnostic' });
INDEX.push({ type:'diagnostic', t:'Depth vs complexity rule audit', snip:'Which rules earn their place', href:'#/diagnose/depth', text:'depth complexity elegance rule audit cut rules' });
INDEX.push({ type:'diagnostic', t:'Content or mechanic?', snip:'Should we add another enemy, level, weapon, quest?', href:'#/diagnose/content', text:'content decision tree add enemy level weapon quest improve interaction' });

let searchSel = 0, searchResults = [];
function search(q){ q = q.trim().toLowerCase(); if(!q) return []; const words = q.split(/\s+/); return INDEX.map(it => { let score = 0; words.forEach(w => { if(it.t.toLowerCase().includes(w)) score += 10; if(it.snip.toLowerCase().includes(w)) score += 4; if(it.text.includes(w)) score += 1; }); if(it.t.toLowerCase().startsWith(q)) score += 8; return [score, it]; }).filter(x => x[0] > 0).sort((a,b) => b[0]-a[0]).slice(0, 30).map(x => x[1]); }
function renderSearch(){ const q = $('#searchInput').value; searchResults = search(q); searchSel = Math.min(searchSel, Math.max(searchResults.length-1, 0));
  $('#searchResults').innerHTML = searchResults.length ? searchResults.map((r, i) => `<div class="res ${i===searchSel?'sel':''}" data-i="${i}"><span class="type">${r.type}</span><div><b>${esc(r.t)}</b><div class="snip">${esc(r.snip)}</div></div></div>`).join('') : (q.trim() ? '<div class="empty">Nothing matches. Try a symptom ("repetitive"), a concept ("depth"), or a role ("critic").</div>' : `<div class="res" style="cursor:default"><span class="type">try</span><div class="snip">repetitive · one build · onboarding · depth · economy · critic · playtest analysis · should we build this · unfair</div></div>`);
  $('#searchCount').textContent = searchResults.length ? `${searchResults.length} results` : '';
  $$('#searchResults .res[data-i]').forEach(el => { el.onmouseenter = () => { searchSel = +el.dataset.i; $$('#searchResults .res').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); }; el.onclick = () => openResult(+el.dataset.i); }); }
function openResult(i){ const r = searchResults[i]; if(!r) return; closeModals(); go(r.href); }
function openSearch(){ $('#searchModal').classList.add('show'); const inp = $('#searchInput'); inp.value = ''; searchSel = 0; renderSearch(); setTimeout(() => inp.focus(), 10); }
function closeModals(){ $$('.modal-bg').forEach(m => m.classList.remove('show')); }
$('#searchBtn').onclick = openSearch;
$('#searchInput').addEventListener('input', () => { searchSel = 0; renderSearch(); });
$('#searchInput').addEventListener('keydown', e => { if(e.key==='ArrowDown'){ e.preventDefault(); searchSel = Math.min(searchSel+1, searchResults.length-1); renderSearch(); } else if(e.key==='ArrowUp'){ e.preventDefault(); searchSel = Math.max(searchSel-1, 0); renderSearch(); } else if(e.key==='Enter'){ openResult(searchSel); } });
$$('.modal-bg').forEach(m => m.addEventListener('click', e => { if(e.target === m) closeModals(); }));
$('#helpBtn').onclick = () => $('#helpModal').classList.add('show');
$('#helpClose').onclick = closeModals;
$('#resetAll').onclick = () => { if(confirm('Reset all saved data (progress, tool inputs, checklists)?')){ store.clear(); location.reload(); } };

/* ---------- keyboard ---------- */
document.addEventListener('keydown', e => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openSearch(); return; }
  if(e.key==='Escape'){ closeModals(); return; }
  if(typing) return;
  if(e.key==='/'){ e.preventDefault(); openSearch(); return; }
  if(e.key==='?'){ $('#helpModal').classList.add('show'); return; }
  if(/^[1-8]$/.test(e.key)){ go('#/'+VIEWS[+e.key-1][0]); return; }
  if(e.key.toLowerCase()==='m'){ go(mapHash()); return; }
  if(e.key.toLowerCase()==='t'){ $('#themeBtn').click(); return; }
  const m = location.hash.match(/^#\/map\/t\/([\w-]+)/);
  if(m){ const t = TOPICS[m[1]]; if(!t) return; const list = DOM[t.d].topics, i = list.indexOf(m[1]);
    if(e.key===']' && i < list.length-1) go('#/map/t/'+list[i+1]);
    if(e.key==='[' && i > 0) go('#/map/t/'+list[i-1]);
    if(e.key.toLowerCase()==='e'){ const anyClosed = $$('.sec').some(s => !s.classList.contains('open')); window.__expandAll(anyClosed); } }
});

