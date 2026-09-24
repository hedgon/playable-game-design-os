/* =====================================================================
   REFERENCE DISSECTION - is my idea actually good?
   Cross-reference a concept against games that succeeded with a similar
   want. Library entries prefill the template; custom games get a prompt.
   Seven questions produce a verdict and the next test.
   ===================================================================== */
(function(A){
'use strict';
const { $, $$, esc, store, go, promptBox, DIAGRAM_DISSECTION, field, outputBox, toolHead } = A;
const DISSECT_FIELDS = [['want','Player want it served'],['verb','Core verb'],['first30','First 30 seconds'],['minute','Decision per minute'],['why','Why it worked (mechanism, not numbers)'],['complaints','What players complain about'],['misses','What copies of it usually miss']];
const XREF_QS = [
  { id:'shared', q:'Which proven want from the comparables does my concept serve?', opts:[['Clearly the same want, stated in the same words their players use',3],['A neighboring want. The overlap is partial',1],['None of them serve my want',0]], hint:'A shared want is evidence the audience exists. No shared want means the idea is unproven, not bad.' },
  { id:'diff', q:'What do I do that none of them do, and is it visible in one screenshot or the first ten minutes?', opts:[['A mechanical difference visible immediately',3],['A real difference that only shows after an hour',1],['Theme, setting, art or more content',-2]], hint:'Cosmetic differentiators are how "like X but Y" ideas die.' },
  { id:'complaint', q:'Which recurring complaint about the comparables does my concept answer?', opts:[['A complaint their players actually make, in their words',3],['Something I personally dislike about them',0],['None',-1]], hint:'Answered complaints are pre-validated wants.' },
  { id:'borrowed', q:'The patterns I am borrowing: did I re-derive each from my player and constraints?', opts:[['Yes. Each borrowed pattern has a behavior it produces for my player',2],['Some. Others are there because the genre has them',0],['I copied the structure wholesale',-2]], hint:'Borrowed patterns carry the original’s assumptions. Re-derive on the Behavior Ladder.' },
  { id:'weaker', q:'Where would a fan of the comparable find mine weaker?', opts:[['On things that do not matter for the want I serve',2],['On things that matter, but I know it and it is a deliberate trade',0],['On the core of what made them work',-3]], hint:'Weaker on the core means you are competing on their ground.' },
  { id:'bar', q:'Can my team reach the quality bar they set on the things that matter for the want?', opts:[['Yes, within our constraints',2],['Partially. We must narrow scope to reach it',0],['No',-3]], hint:'The bar is set by the comparables, not by your ambition.' },
  { id:'audience', q:'Did the comparables prove this audience exists and is underserved on this want?', opts:[['Yes: they sold to my player and their players complain about exactly this',3],['They sold, but the underserved want is my inference',1],['Unclear or no',-1]], hint:'Existence of the audience and existence of the gap are two separate facts.' }
];
function dissectVerdict(a, score){
  const shared = a.shared, diff = a.diff, weaker = a.weaker, bar = a.bar;
  if(bar === 2 || weaker === 2) return ['UNDELIVERABLE','Undeliverable as framed. Either you are weaker on the core of what made the comparables work, or your team cannot reach the quality bar on the things that matter. Narrow the want, change the comparable set, or change the concept before any test.'];
  if(shared === 2) return ['UNPROVEN','Unproven. No successful game serves this want for this player. That is not a rejection. It is a warning that the audience is a hypothesis. Run the stranger pitch and the one-day loop before anything else, and look again for comparables in adjacent genres.'];
  if(diff === 2 || (diff === 1 && a.complaint !== 0)) return ['DERIVATIVE','Derivative. You share a proven want but your difference is cosmetic or invisible. Fans will say "so it is like X". Find the complaint their players actually make and build the mechanical answer to it, or stop.'];
  if(score >= 12) return ['PROMISING','Promising. A proven want, a visible mechanical differentiator, an answered complaint, borrowed patterns you re-derived, and a bar you can reach. Now prove people want it: stranger pitch to fans of the comparables, the one-pager next to their screenshot, the one-day loop.'];
  return ['NEEDS WORK','Needs work. The structure is there but something is soft: the differentiator shows late, the borrowed patterns are half re-derived, or the audience gap is inferred. Fix the weakest answer above, then run the want tests.'];
}
function toolDissect(el){
  const saved = store.get('dissectTool', { concept:'', comps:[], answers:{}, notes:{} });
  const idea = store.get('ideaTool', {});
  const save = () => store.set('dissectTool', saved);
  if(!saved.concept && (idea.fantasy || idea.verb)) saved.concept = [idea.fantasy, idea.verb ? 'Core verb: '+idea.verb : '', idea.player ? 'Player: '+idea.player.split(/[,;.]/)[0] : ''].filter(Boolean).join(' · ');
  el.innerHTML = toolHead('Reference Dissection: is my idea actually good?', 'Pick the three to five games your player already plays for a similar want. Dissect each with one template (library entries are prefilled and editable. Your own games get a prompt). Then answer seven cross-reference questions. The verdict says whether the idea is promising, derivative, unproven or undeliverable, and names the next test. Success narratives are heuristics: verify anything you rely on.', 'dissectTool') +
  `<div class="card diagram-card">${DIAGRAM_DISSECTION}</div>
  <div class="grid c2"><div>
    <div class="step-num">Step 1 · Your concept in one line</div>
    ${field('ds_concept','Concept','Fantasy, core verb, player. Prefilled from the Idea Shaper if you used it.', saved.concept, 2)}
    <div class="step-num">Step 2 · Comparables: what your player plays instead</div>
    <p class="small dim">Choose from the library or add your own. Choose what your player plays, not what you admire.</p>
    <div class="reflib" id="ds_lib">${REFERENCE_GAMES.map(g => `<div class="refcard ${saved.comps.some(c=>c.id===g.id)?'on':''}" data-g="${g.id}">${g.img?`<img src="${g.img}" alt="${esc(g.t)}" loading="lazy">`:`<div class="tile">${esc(g.t)}</div>`}<div class="meta"><b>${esc(g.t)}</b><small>${g.year} · ${esc(g.genre)}</small><div class="want">${esc(g.want)}</div>${g.dev ? `<small class="credit">Art: ${esc(g.dev)}</small>` : ''}</div></div>`).join('')}</div>
    <div class="row" style="margin-bottom:10px"><input id="ds_custom" placeholder="Add a game not in the library…" style="flex:1"><button class="btn" id="ds_add">Add</button></div>
    <div id="ds_comps"></div>
    <div class="step-num">Step 3 · Cross-reference</div>
    <div id="ds_qs"></div>
  </div><div id="ds_out"></div></div>`;
  const renderLib = () => $$('#ds_lib .refcard').forEach(b => b.classList.toggle('on', saved.comps.some(c => c.id===b.dataset.g)));
  const compCard = (c, i) => { const lib = REFERENCE_GAMES.find(g => g.id===c.id);
    return `<details class="comp" ${i===saved.comps.length-1?'open':''}><summary>${esc(c.t)} ${lib ? `<span class="chip">${lib.year} · ${esc(lib.genre)}</span>` : '<span class="chip warn">custom</span>'}<button class="btn sm ghost danger ds_del" data-i="${i}" style="margin-left:auto">✕</button></summary><div class="body">
      ${lib ? `<div class="chips" style="margin:6px 0">${lib.engines.map(e => `<span class="chip">${e}</span>`).join('')}</div><p class="small"><a href="#/games/${lib.id}">See the ${esc(lib.t)} schematics</a></p>` : ''}
      ${DISSECT_FIELDS.map(([k,l]) => `<div class="field"><label>${l}</label><textarea rows="2" data-i="${i}" data-k="${k}">${esc(c[k]||'')}</textarea></div>`).join('')}
      ${lib ? `<div class="callout" style="padding:8px 10px"><b>Lesson:</b> ${esc(lib.lesson)}</div>` : promptBox('Ask AI to dissect this game (verify the sources)', `Dissect ${c.t} as a designer, using public postmortems, GDC talks, developer interviews and critical consensus. For each: the player want it served, the core verb. The first 30 seconds. The decision the player faces every minute. The engines it runs on. Why it worked as developers and critics explain it. What players most often complain about. The transferable lesson. What copies usually miss. One to three sentences each. Cite a source for every claim about why it worked or write "unknown". Do not cite sales figures.`)}
    </div></details>`; };
  const renderComps = () => { $('#ds_comps').innerHTML = saved.comps.length ? saved.comps.map(compCard).join('') : '<div class="empty">No comparables yet. Without them the verdict is a guess.</div>';
    $$('#ds_comps textarea').forEach(t => t.addEventListener('input', () => { saved.comps[+t.dataset.i][t.dataset.k] = t.value; save(); out(); }));
    $$('#ds_comps .ds_del').forEach(b => b.onclick = e => { e.preventDefault(); saved.comps.splice(+b.dataset.i,1); save(); renderLib(); renderComps(); out(); }); };
  const renderQs = () => { $('#ds_qs').innerHTML = XREF_QS.map((q,qi) => `<div class="tree-q"><b>${qi+1}. ${esc(q.q)}</b><div class="small muted" style="margin-top:2px">${esc(q.hint)}</div><div class="opts">${q.opts.map((o,oi) => `<button data-q="${q.id}" data-o="${oi}" class="${saved.answers[q.id]===oi?'sel':''}">${esc(o[0])}</button>`).join('')}</div><input placeholder="Your note (what exactly, for which comparable)" data-n="${q.id}" value="${esc(saved.notes[q.id]||'')}" style="margin-top:8px"></div>`).join('');
    $$('#ds_qs .opts button').forEach(b => b.onclick = () => { saved.answers[b.dataset.q] = +b.dataset.o; save(); renderQs(); out(); });
    $$('#ds_qs input[data-n]').forEach(i => i.addEventListener('input', () => { saved.notes[i.dataset.n] = i.value; save(); out(); })); };
  const out = () => { const a = saved.answers; const done = XREF_QS.filter(q => a[q.id] !== undefined).length; const score = XREF_QS.reduce((s,q) => s + (a[q.id] !== undefined ? q.opts[a[q.id]][1] : 0), 0);
    const matrix = saved.comps.length ? `<div class="tablewrap"><table class="small"><thead><tr><th></th><th>Want</th><th>Verb</th><th>Decision / minute</th></tr></thead><tbody><tr><td><b>Mine</b></td><td>${esc((idea.wish||idea.complaints||'').split(/[.\n]/)[0]||'?')}</td><td>${esc(idea.verb||'?')}</td><td>${esc(idea.loop_decision||idea.mechanism||'?')}</td></tr>${saved.comps.map(c => `<tr><td><b>${esc(c.t)}</b></td><td>${esc((c.want||'').slice(0,90))}</td><td>${esc((c.verb||'').slice(0,60))}</td><td>${esc((c.minute||'').slice(0,90))}</td></tr>`).join('')}</tbody></table></div>` : '';
    let verdict = '';
    if(done === XREF_QS.length){ const [v, text] = dissectVerdict(a, score); verdict = `<div class="verdict ${v==='PROMISING'?'BUILD':v==='DERIVATIVE'?'SIMPLIFY':v==='UNPROVEN'?'PROTOTYPE':v==='UNDELIVERABLE'?'REMOVE':'DEFER'}"><h2>${v}</h2><p>${esc(text)}</p></div>`; }
    else verdict = `<div class="empty">${XREF_QS.length-done} question${XREF_QS.length-done>1?'s':''} left for a verdict</div>`;
    const md = `# Reference dissection\n\nConcept: ${saved.concept||'(blank)'}\n\n## Comparables\n${saved.comps.map(c => `### ${c.t}\n${DISSECT_FIELDS.map(([k,l]) => `- ${l}: ${c[k]||'?'}`).join('\n')}`).join('\n\n')}\n\n## Cross-reference\n${XREF_QS.map((q,i) => `${i+1}. ${q.q}\n   → ${a[q.id]!==undefined ? q.opts[a[q.id]][0] : '(unanswered)'}${saved.notes[q.id] ? '\n   note: '+saved.notes[q.id] : ''}`).join('\n')}\n\n## Verdict\n${done===XREF_QS.length ? dissectVerdict(a, score).join(': ') : 'incomplete'} (score ${score})\n\n## Prompts\n### Steelman the comparables\nMy concept: ${saved.concept||'[CONCEPT]'}. Comparables: ${saved.comps.map(c=>c.t).join(', ')||'[GAMES]'}. Argue, as a devoted fan of each comparable, why you would not switch to my concept. Name the exact thing the comparable does that I do not, and whether it matters for the want. Then state the single change to my concept that would make you try it.\n\n### Complaint mining\nHere are reviews and forum posts about ${saved.comps.map(c=>c.t).join(', ')||'[GAMES]'} from players like ${idea.player ? idea.player.split(/[,;.]/)[0] : '[PLAYER]'}: [PASTE]. Cluster complaints into wants, count frequency, and for each want say whether my concept (${saved.concept||'[CONCEPT]'}) answers it mechanically, cosmetically, or not at all.`;
    $('#ds_out').innerHTML = `<h4>Cross-reference matrix</h4>${matrix || '<div class="empty">Add comparables to see the matrix.</div>'}<h4 style="margin-top:12px">Verdict</h4>${verdict}${outputBox(md)}<div class="row"><a class="btn sm" href="#/map/t/learning-from-success">Read: dissect games that succeeded</a><a class="btn sm" href="#/build/idea">Idea Shaper</a><a class="btn sm" href="#/build/ladder">Re-derive borrowed patterns</a><a class="btn sm" href="#/build/hypothesis">Write the test</a></div>`; };
  $('#ds_concept').addEventListener('input', e => { saved.concept = e.target.value; save(); out(); });
  $$('#ds_lib .refcard').forEach(b => b.onclick = () => { const g = REFERENCE_GAMES.find(x => x.id===b.dataset.g); const i = saved.comps.findIndex(c => c.id===g.id); if(i >= 0) saved.comps.splice(i,1); else saved.comps.push({ id:g.id, t:g.t, want:g.want, verb:g.verb, first30:g.first30, minute:g.minute, why:g.why, complaints:g.complaints, misses:g.misses }); save(); renderLib(); renderComps(); out(); });
  $('#ds_add').onclick = () => { const v = $('#ds_custom').value.trim(); if(!v) return; saved.comps.push({ id:'custom-'+Date.now(), t:v }); $('#ds_custom').value=''; save(); renderComps(); out(); };
  $('#ds_custom').onkeydown = e => { if(e.key==='Enter') $('#ds_add').click(); };
  renderComps(); renderQs(); out();
}
A.toolDissect = toolDissect;
})(window.PlayableApp);
