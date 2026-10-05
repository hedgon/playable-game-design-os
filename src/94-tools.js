/* =====================================================================
   BUILD TOOLS
   The canvases behind #/build/<tool>, loaded with the Reference Dissection
   (92-ideas.js) the first time a tool opens: the build writes both to
   content/code/tools.js and leaves them out of the page.
   ===================================================================== */
(function(A){
'use strict';
const { $, $$, esc, store, field, outputBox, toolHead, bindForm } = A;
function toolLoop(el){
  const parts = [['action','Action','What does the player physically do, most often? Is it the fantasy verb?'],['feedback','Feedback','How does the game tell them what happened and why, within ~100 ms?'],['decision','Decision','What choice do they face next, and what is the tradeoff?'],['consequence','Consequence and reward','What changes because of the choice, visibly, now?'],['situation','New situation','How is the next iteration different from this one?']];
  el.innerHTML = toolHead('Game Loop Builder', 'Write the loop from the player’s point of view, one sentence per link. Then answer the weak-link question for each. If you cannot answer it, that link is where to look first.', 'loopTool') +
    `<div class="row" style="margin-bottom:10px"><button type="button" class="btn sm" id="loopEx">Load a worked example</button></div><div class="grid c2"><div>${parts.map(([id, l, h]) => field('lb_'+id, l, h, '', 2) + field('lb_'+id+'_ev', 'How would a playtest show this link is strong?', 'Observable behaviour, not opinion.', '', 1)).join('')}</div><div id="lb_out"></div></div>`;
  bindForm('loopTool', parts.flatMap(([id]) => ['lb_'+id, 'lb_'+id+'_ev']), d => {
    const weak = parts.filter(([id]) => !(d['lb_'+id]||'').trim() || !(d['lb_'+id+'_ev']||'').trim());
    const md = `# Core loop\n\n${parts.map(([id, l]) => `**${l}:** ${d['lb_'+id]||'(blank)'}\n  - Evidence it is strong: ${d['lb_'+id+'_ev']||'(blank)'}`).join('\n')}\n\n## Diagnosis\n${weak.length ? `Weak or untested links: ${weak.map(w=>w[1]).join(', ')}. Fix these before multiplying the loop with content or progression.` : 'All links described with evidence. Now build the bare loop in grey boxes and test whether players repeat it voluntarily.'}\n\n## Prompt\nAct as a skeptical systems designer. Here is our core loop as the player experiences it:\n${parts.map(([id,l]) => `- ${l}: ${d['lb_'+id]||''}`).join('\n')}\nFor each link, rate its strength using only my description, name the playtest symptom if weak, and propose 3 mechanically distinct fixes for the weakest link with the decision created, intended emotion, failure mode and validating signal. Do not recommend one.`;
    $('#lb_out').innerHTML = `<h4>Live output</h4>${outputBox(md)}${weak.length ? `<div class="callout warn"><b>Look first at:</b> ${weak.map(w => `<a href="#/diagnose/loop/${w[0]}">${w[1]}</a>`).join(', ')}</div>` : '<div class="callout ok">Every link has a claim and an observable. Prototype the bare loop next.</div>'}`;
  });
  $('#loopEx').onclick = () => { const ex = { action:'move to dodge the crowd and sweep up the gems they drop', feedback:'enemies pop on contact with your aura, gems burst, a level-up chime, the screen shakes', decision:'which of three upgrades to take, and whether to risk the chest now', consequence:'your build changes and the same crowd now dies twice as fast', situation:'the next wave is denser and you are stronger than the last one' }; Object.entries(ex).forEach(([k,v]) => { const i = $('#lb_'+k); if(i){ i.value = v; i.dispatchEvent(new Event('input')); } }); };
}

function toolCanvas(el){
  const fields = [['player','Player','A specific person: their last three games, their session, their device.',2],['fantasy','Fantasy','"In this game I get to be someone who…"',1],['verbs','Fantasy verbs','Three verbs the fantasy implies. Are they the loop verbs?',1],['emotions','Target emotions and rhythm','Two or three emotions and the order they alternate in.',1],['moment','Moment-to-moment','What the player does with hands and mind every few seconds.',2],['session','Session goal','What a satisfying session accomplishes.',1],['long','Long-term goal','Why they come back next week.',1],['not','What this game is NOT','Adjacent experiences you refuse. The not-list.',2],['refs','Reference moments','Moments from other games that produce the target feeling, and what exactly produces it.',2]];
  el.innerHTML = toolHead('Core Experience Canvas', 'One page that every discipline aims at. If any field is hard to fill, that is the design work to do first.', 'canvasTool') + `<div class="row" style="margin-bottom:10px"><button type="button" class="btn sm" id="cvEx">Load a worked example</button></div><div class="grid c2"><div>${fields.map(([id,l,h,r]) => field('cv_'+id, l, h, '', r)).join('')}</div><div id="cv_out"></div></div>`;
  bindForm('canvasTool', fields.map(f => 'cv_'+f[0]), d => {
    const st = `A ${d.cv_emotions||'[emotions]'} experience where ${d.cv_player||'[player]'} gets to be ${d.cv_fantasy||'[fantasy]'} by ${d.cv_moment||'[moment-to-moment]'}. Not ${d.cv_not||'[what it is not]'}.`;
    const md = `# Core experience\n\n> ${st}\n\n${fields.map(([id,l]) => `**${l}:** ${d['cv_'+id]||'(blank)'}`).join('\n\n')}\n\n## Check\n- Do the fantasy verbs appear in the moment-to-moment activity?\n- Can the target emotions be produced by the mechanics described?\n- Would a playtester use the emotion words unprompted?`;
    $('#cv_out').innerHTML = `<h4>Experience statement (draft)</h4><div class="quotebig sm">${esc(st)}</div>${outputBox(md)}<div class="row"><a class="btn sm" href="#/map/t/core-experience">Read: core experience</a><a class="btn sm" href="#/map/t/fantasy">Read: fantasy</a></div>`;
  });
  $('#cvEx').onclick = () => { const ex = { player:'A commuter with 25 minutes on a laptop who finished Hades and Slay the Spire', fantasy:'In this game I get to be someone who reads a fight and picks the exact tool for it', verbs:'read, choose, commit', emotions:'tension, then clarity, then satisfaction', moment:'scan the board, commit to one of three options, watch it resolve', session:'finish one run and understand why it went the way it did', long:'unlock one new tool that changes how a familiar fight reads', not:'a twitch action game, a grind, a story you cannot steer', refs:'Into the Breach: every consequence is visible before you commit. Slay the Spire: the reward is the decision.' }; Object.entries(ex).forEach(([k,v]) => { const i = $('#cv_'+k); if(i){ i.value = v; i.dispatchEvent(new Event('input')); } }); };
}

function toolLadder(el){
  const rungs = [['feature','Feature idea','The noun someone proposed. "Crafting." "A pet system." "Daily quests."'],['behavior','Desired player behavior','Observable in a playtest. What would they DO differently?'],['experience','Experience','What they feel while doing it.'],['system','System','The situation that produces the behavior: constraints, information, consequences.'],['mechanic','Smallest mechanic','The least rule that implements the system.'],['refeature','Feature, revisited','Now: which feature, if any? Is it the one you started with?']];
  el.innerHTML = toolHead('Behaviour Ladder', 'Feature thinking: feature → implementation → justification. Experience thinking: behaviour → experience → system → mechanic → feature. Start at the top with the noun you were handed, climb to the behaviour, then descend.', 'ladderTool') +
    `<div class="row" style="margin-bottom:10px"><button type="button" class="btn sm" id="ladderEx">Load the crafting example</button></div><div class="grid c2"><div class="ladder">${rungs.map(([id,l,h]) => `<div class="rung"><b>${esc(l)}</b><div>${field('ld_'+id, '', h, '', 2)}</div></div>`).join('')}</div><div id="ld_out"></div></div>`;
  const d = bindForm('ladderTool', rungs.map(r => 'ld_'+r[0]), d => {
    const same = (d.ld_feature||'').trim() && (d.ld_refeature||'').trim() && d.ld_feature.trim().toLowerCase() === d.ld_refeature.trim().toLowerCase();
    const md = `# Behaviour ladder\n\n${rungs.map(([id,l]) => `**${l}:** ${d['ld_'+id]||'(blank)'}`).join('\n\n')}\n\n## Prompt\nSomeone proposed the feature "${d.ld_feature||'[FEATURE]'}". The behaviour we actually want is: ${d.ld_behavior||'[BEHAVIOR]'}. Propose 5 mechanics, smallest first, that would produce this behaviour. For each, the rule in one sentence, the decision it creates, what it interacts with, and how we would observe the behaviour in a 15-minute test. Then argue that an existing system could be changed to produce it without any new mechanic.`;
    $('#ld_out').innerHTML = `<h4>Live output</h4>${outputBox(md)}${same ? '<div class="callout warn">You landed on the same feature you started with. Fine if the ladder really led there. Suspicious if you wrote the behaviour to justify the noun.</div>' : ''}<div class="row"><a class="btn sm" href="#/build/feature">Now run: Should we build this?</a><a class="btn sm" href="#/map/t/feature-vs-experience">Read: experience thinking</a></div>`;
  });
  $('#ladderEx').onclick = () => { const ex = LADDER_EXAMPLE; const map = {feature:ex.feature, behavior:ex.behavior, experience:ex.experience, system:ex.system, mechanic:ex.mechanic, refeature:ex.refeature}; Object.entries(map).forEach(([k,v]) => { const i = $('#ld_'+k); i.value = v; i.dispatchEvent(new Event('input')); }); };
}

function toolFeature(el){
  const saved = store.get('featureTool', {name:'', answers:{}});
  el.innerHTML = toolHead('Should we build this?', 'Nine questions a feature must survive. The verdict is a heuristic that weights evidence, decisions and loop impact. Use it to structure the argument, not to end it.', 'featureTool') +
    field('ft_name', 'Feature under review', '', saved.name) + `<div id="ft_qs"></div><div id="ft_verdict"></div>`;
  const render = () => { const a = saved.answers; let score = 0, done = 0;
    $('#ft_qs').innerHTML = FEATURE_TREE.map((q, qi) => { const sel = a[q.id]; if(sel !== undefined){ score += q.opts[sel][1]; done++; } return `<div class="tree-q"><b>${qi+1}. ${esc(q.q)}</b><div class="opts">${q.opts.map((o, oi) => `<button type="button" class="${sel===oi?'sel':''}" data-q="${q.id}" data-o="${oi}">${esc(o[0])}</button>`).join('')}</div></div>`; }).join('');
    $$('#ft_qs .opts button').forEach(b => b.onclick = () => { saved.answers[b.dataset.q] = +b.dataset.o; store.set('featureTool', saved); render(); });
    if(done === FEATURE_TREE.length){ const [v, text] = featureVerdict(score, a); const label = v==='PROTOTYPE' ? 'PROTOTYPE FIRST' : v;
      const drivers = featureDrivers(a, v), up = v === 'BUILD';
      const md = `# Feature review: ${saved.name||'(unnamed)'}

Verdict: **${label}** (score ${score})

${FEATURE_TREE.map((q,i) => `${i+1}. ${q.q}
   → ${q.opts[a[q.id]][0]} (${featurePts(q.opts[a[q.id]][1])})`).join('\n')}

## What drove this
${drivers.map(d => `- ${d.q} ${d.opt} (${featurePts(d.pts)})`).join('\n')}

${text}`;
      $('#ft_verdict').innerHTML = `<div class="verdict ${v}"><h2>${label}</h2><p>${esc(text)}</p><p class="small"><b>What drove this</b> (the two answers that pulled the score ${up ? 'up' : 'down'} most):</p><ul class="small">${drivers.map(d => `<li>${esc(d.q)} ${esc(d.opt)} <b>(${featurePts(d.pts)})</b></li>`).join('')}</ul><details class="small" open><summary>Every answer, with its points (score ${score})</summary><ol>${FEATURE_TREE.map(q => `<li>${esc(q.q)} ${esc(q.opts[a[q.id]][0])} <b>(${featurePts(q.opts[a[q.id]][1])})</b></li>`).join('')}</ol></details><div class="row"><a class="btn sm" href="#/build/hypothesis">Write the hypothesis</a><a class="btn sm" href="#/map/t/scope-control">Read: scope control</a><a class="btn sm" href="#/build/ladder">Climb the behaviour ladder</a></div></div>${outputBox(md)}`; }
    else $('#ft_verdict').innerHTML = `<div class="empty">${FEATURE_TREE.length-done} question${FEATURE_TREE.length-done>1?'s':''} left</div>`; };
  $('#ft_name').addEventListener('input', e => { saved.name = e.target.value; store.set('featureTool', saved); });
  render();
}

function toolHypothesis(el){
  const f = [['who','We believe [PLAYER]','Which player, specifically? Not "players": the sketch.'],['will','will [BEHAVIOR]','Observable in a 15-minute session. What they do, not what they feel.'],['because','because [REASON]','The mechanism. Why would the design cause the behaviour?'],['signal','We will know it is working when [SIGNAL]','A rate, a count, a repeated behaviour. Something you could log.'],['kill','We will kill or change it if [KILL CRITERION]','The result that ends the idea. If you cannot write one, you are hoping, not testing.'],['smallest','Smallest experiment','Paper? Spreadsheet? Grey boxes? How long to build? How many players?'],['alt','Alternative explanation','What else would produce the signal even if the hypothesis is false?']];
  el.innerHTML = toolHead('Playtest Hypothesis Builder', 'Every significant design decision, expressible as a claim about player behaviour with a signal and a kill criterion, written before the build.', 'hypTool') + `<div class="row" style="margin-bottom:10px"><button type="button" class="btn sm" id="hyEx">Load a worked example</button></div><div class="grid c2"><div>${f.map(([id,l,h]) => field('hy_'+id, l, h, '', 2)).join('')}</div><div id="hy_out"></div></div>`;
  bindForm('hypTool', f.map(x => 'hy_'+x[0]), d => {
    const st = `We believe ${d.hy_who||'[PLAYER]'} will ${d.hy_will||'[BEHAVIOR]'} because ${d.hy_because||'[REASON]'}. We will know this is working when ${d.hy_signal||'[SIGNAL]'}. We will kill or change it if ${d.hy_kill||'[KILL CRITERION]'}.`;
    const md = `# Hypothesis\n\n> ${st}\n\n**Smallest experiment:** ${d.hy_smallest||'(blank)'}\n\n**Alternative explanation to rule out:** ${d.hy_alt||'(blank)'}\n\n## Prototype brief (paste to AI)\nAct as a prototype engineer. Hypothesis: ${st} Build the smallest playable test in [ENGINE]: only the mechanics needed, shapes only, no menus or saves. Expose [VALUES] as live sliders. Log with timestamps every input, decision point with the option chosen, failure with cause, and session start/end. Export CSV. Before coding, list the design decisions the code will embed and wait for my choices.\n\n## Observation protocol (paste to AI)\nDesign a silent observation protocol for this hypothesis with [N] players for [MINUTES]: what to log, a non-leading interview guide ordered from behaviour to opinion, a coding scheme, and a results template that separates behaviour from self-report.`;
    const warn = []; if(/feel|enjoy|like|fun/i.test(d.hy_will||'')) warn.push('The behaviour mentions feeling or fun. Rewrite it as something observable.'); if(!(d.hy_kill||'').trim()) warn.push('No kill criterion yet.');
    $('#hy_out').innerHTML = `<h4>Hypothesis</h4><div class="quotebig sm">${esc(st)}</div>${warn.length ? `<div class="callout warn">${warn.map(esc).join('<br>')}</div>` : ''}${outputBox(md)}<div class="row"><a class="btn sm" href="#/map/t/hypothesis-driven-design">Read: hypothesis-driven design</a><a class="btn sm" href="#/playtest">Playtest question bank</a></div>`;
  });
  $('#hyEx').onclick = () => { const ex = { who:'a commuter who plays 30-minute Slay the Spire runs and quits when a run feels lost by minute five', will:'replan their deck before the first fight instead of taking the first card offered', because:'the reward screen shows the long-run consequence of each card before they commit', signal:'6 of 10 testers read the preview twice or more in their first three runs', kill:'fewer than 3 of 10 ever read the preview, or they read it and still pick at random', smallest:'a paper deck with printed consequence cards, 15 minutes per tester, 8 matched players', alt:'players read the preview because it is novel, not because it changes the card they pick' }; Object.entries(ex).forEach(([k,v]) => { const i = $('#hy_'+k); if(i){ i.value = v; i.dispatchEvent(new Event('input')); } }); };
}

function toolDelegate(el){
  const saved = store.get('delegateTool', {tasks:[{t:'Define the player fantasy', w:'Human'},{t:'Generate five loop variations', w:'AI'},{t:'Decide whether the loop is fun', w:'Player evidence required'},{t:'Analyse playtest logs for choice variance', w:'Human + AI'}]});
  const opts = ['Human','AI','Human + AI','Player evidence required'];
  el.innerHTML = toolHead('AI Delegation Planner', 'For each task in your current cycle, decide the owner before the work starts. Compare with the responsibility matrix. "Player evidence required" means nobody can own it yet.', 'delegateTool') +
    `<div class="grid c2"><div><div id="dl_rows"></div><div class="row" style="margin-top:8px"><input type="text" id="dl_new" placeholder="Add a task…" style="flex:1"><button type="button" class="btn" id="dl_add">Add</button></div><p class="small muted" style="margin-top:8px">Suggestions come from the <a href="#/ai/matrix">responsibility matrix</a> by keyword and are only a starting point.</p></div><div id="dl_out"></div></div>`;
  const suggest = t => { const l = t.toLowerCase(); const hit = MATRIX.find(m => m[0].toLowerCase().split(' ').filter(w=>w.length>4).some(w => l.includes(w))); if(!hit) return null; const h = hit[1], a = hit[2]; if(h==='PRIMARY' && a!=='PRIMARY') return 'Human'; if(a==='PRIMARY' && h!=='PRIMARY') return 'AI'; return 'Human + AI'; };
  const render = () => { $('#dl_rows').innerHTML = saved.tasks.map((x, i) => { const s = suggest(x.t); return `<div class="plan-row"><div><input type="text" value="${esc(x.t)}" data-i="${i}" class="dl_t">${s && s!==x.w ? `<div class="small muted">matrix suggests: ${s}</div>` : ''}</div><select data-i="${i}" class="dl_w">${opts.map(o => `<option ${o===x.w?'selected':''}>${o}</option>`).join('')}</select><button type="button" class="btn sm ghost danger dl_del" aria-label="Remove this row" data-i="${i}">✕</button></div>`; }).join('') || '<div class="empty">No tasks.</div>';
    const counts = Object.fromEntries(opts.map(o => [o, saved.tasks.filter(x => x.w===o).length]));
    const md = `# Delegation plan\n\n${saved.tasks.map(x => `- [${x.w}] ${x.t}`).join('\n')}\n\n## Balance\n${opts.map(o => `- ${o}: ${counts[o]}`).join('\n')}\n\n## Checks\n- Every AI task: what decisions will the work embed, and which human owns them?\n- Every "player evidence required" task: what is the smallest test?\n- Human tasks: are these judgement, or production you could delegate?`;
    $('#dl_out').innerHTML = `<h4>Balance</h4><div class="chips" style="margin-bottom:8px">${opts.map(o => `<span class="chip ${o==='Human'?'human':o==='AI'?'ai':o==='Human + AI'?'shared':'evidence'}">${o}: ${counts[o]}</span>`).join('')}</div>${counts['Player evidence required']===0 && saved.tasks.length>3 ? '<div class="callout warn">Nothing needs player evidence? Either the cycle has no design risk, or judgement calls are being assigned to humans or AI that only players can settle.</div>' : ''}${outputBox(md)}`;
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
      <h4>Nodes</h4><div id="sm_nodes" class="chips"></div><div class="row" style="margin-top:8px"><input type="text" id="sm_nn" placeholder="Node name" style="flex:1"><select id="sm_nt" style="width:auto">${TYPES.map(t => `<option>${t}</option>`).join('')}</select><button type="button" class="btn" id="sm_addn">Add</button></div>
      <h4 style="margin-top:14px">Relationships</h4><div id="sm_edges"></div><div class="row" style="margin-top:8px"><select id="sm_ea" style="width:auto"></select><select id="sm_ek" style="width:auto">${KINDS.map(k => `<option>${k}</option>`).join('')}</select><select id="sm_eb" style="width:auto"></select><button type="button" class="btn" id="sm_adde">Link</button></div>
      <div class="legend" style="margin-top:10px">${KINDS.map(k => `<span><i style="background:${({amplifies:'var(--ok)',counters:'var(--bad)',consumes:'var(--warn)',produces:'var(--d-ux)',unlocks:'var(--d-narrative)',requires:'var(--fg3)'})[k]}"></i>${k}</span>`).join('')}</div>
    </div><div><div class="sysmap" id="sm_svg"></div><div id="sm_analysis"></div></div></div>`;
  const render = () => { const N = saved.nodes, E = saved.edges.filter(e => N.some(n=>n.n===e[0]) && N.some(n=>n.n===e[2]));
    $('#sm_nodes').innerHTML = N.map((n, i) => `<span class="chip" title="${n.t}">${esc(n.n)} <span class="muted">${n.t}</span> <button type="button" class="btn sm ghost danger" style="padding:0 4px" aria-label="Remove" data-i="${i}">✕</button></span>`).join('') || '<span class="muted">No nodes.</span>';
    $$('#sm_nodes button').forEach(b => b.onclick = () => { const name = N[+b.dataset.i].n; N.splice(+b.dataset.i,1); saved.edges = saved.edges.filter(e => e[0]!==name && e[2]!==name); store.set('sysmapTool', saved); render(); });
    $('#sm_edges').innerHTML = E.map((e, i) => `<div class="row small" style="padding:3px 0;border-bottom:1px dashed var(--line)"><span>${esc(e[0])} <b>${e[1]}</b> ${esc(e[2])}</span><button type="button" class="btn sm ghost danger" style="margin-left:auto;padding:0 6px" aria-label="Remove this link" data-i="${saved.edges.indexOf(e)}">✕</button></div>`).join('') || '<div class="muted small">No relationships.</div>';
    $$('#sm_edges button').forEach(b => b.onclick = () => { saved.edges.splice(+b.dataset.i,1); store.set('sysmapTool', saved); render(); });
    const optsHTML = N.map(n => `<option>${esc(n.n)}</option>`).join(''); $('#sm_ea').innerHTML = optsHTML; $('#sm_eb').innerHTML = optsHTML;
    // svg
    const W=560, H=440, NR=34, cx=W/2, cy=H/2, R=Math.min(W,H)/2-72; const pos = {}; N.forEach((n,i) => { const a = -Math.PI/2 + i*2*Math.PI/Math.max(N.length,1); pos[n.n] = [cx+R*Math.cos(a), cy+R*Math.sin(a)]; });
    const col = {resource:'var(--d-systems)',mechanic:'var(--d-core)',ability:'var(--d-experience)',enemy:'var(--d-product)',environment:'var(--d-level)',progression:'var(--d-production)','player choice':'var(--d-player)'};
    const wrapName = s => { const words = String(s).split(/\s+/).filter(Boolean); const lines = []; let cur = ''; for(const w of words){ if(!cur) cur = w; else if((cur+' '+w).length <= 9) cur += ' '+w; else { lines.push(cur); cur = w; } } if(cur) lines.push(cur); if(lines.length > 3){ lines[2] = lines.slice(2).join(' '); lines.length = 3; } return lines.map(l => l.length > 12 ? l.slice(0,11)+'…' : l); };
    const geo = (e,i) => { const [x1,y1]=pos[e[0]], [x2,y2]=pos[e[2]]; const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy)||1; const side = i%2 ? 1 : -1; const sx=x1+dx/len*(NR+4), sy=y1+dy/len*(NR+4), ex=x2-dx/len*(NR+9), ey=y2-dy/len*(NR+9); const b=20*side; const mx=(sx+ex)/2 - dy/len*b, my=(sy+ey)/2 + dx/len*b; return { sx, sy, ex, ey, mx, my, side }; };
    const labelPos = (g,i) => { const t=[0.5,0.34,0.66][i%3], u=1-t; const px=u*u*g.sx+2*u*t*g.mx+t*t*g.ex, py=u*u*g.sy+2*u*t*g.my+t*t*g.ey; const tx=2*u*(g.mx-g.sx)+2*t*(g.ex-g.mx), ty=2*u*(g.my-g.sy)+2*t*(g.ey-g.my); const tl=Math.hypot(tx,ty)||1; const off=14*g.side; return [px - (ty/tl)*off, py + (tx/tl)*off]; };
    const edgePath = (e,i) => { const g=geo(e,i); return `<path class="se ${e[1]}" d="M${g.sx.toFixed(1)},${g.sy.toFixed(1)} Q${g.mx.toFixed(1)},${g.my.toFixed(1)} ${g.ex.toFixed(1)},${g.ey.toFixed(1)}" marker-end="url(#arr)"/>`; };
    const edgeLabel = (e,i) => { const g=geo(e,i); const p=labelPos(g,i); const lx=p[0], ly=p[1]; const w = e[1].length*5.8+8; return `<g><rect x="${(lx-w/2).toFixed(1)}" y="${(ly-8).toFixed(1)}" width="${w.toFixed(1)}" height="13" rx="0" fill="var(--bg2)" stroke="var(--line)" stroke-width="0.5"/><text class="se-label" x="${lx.toFixed(1)}" y="${(ly+1).toFixed(1)}" text-anchor="middle">${e[1]}</text></g>`; };
    const nodeG = n => { const [x,y]=pos[n.n]; const deg = E.filter(e => e[0]===n.n||e[2]===n.n).length; const lines = wrapName(n.n); const first = lines.length>1 ? -(lines.length-1)*6.5 : 3; return `<g class="sn" transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><title>${esc(n.n)}</title><circle r="${NR}" fill="${col[n.t]||'var(--accent)'}" opacity="${deg?0.25:0.08}" stroke="${deg?col[n.t]:'var(--bad)'}" stroke-width="${deg?2:1.5}" stroke-dasharray="${deg?'':'4 3'}"/><text text-anchor="middle" font-size="11">${lines.map((l,k)=>`<tspan x="0" dy="${k===0?first:13}">${esc(l)}</tspan>`).join('')}</text><text text-anchor="middle" y="${NR+13}" style="font-size:9px;fill:var(--fg3);font-weight:400">${esc(n.t)}</text></g>`; };
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
  const parts = [['context','CONTEXT','Player, fantasy, core loop, systems. The situation as it is.',3],['intent','INTENT','The experience you want and the decision you need to make.',2],['constraints','CONSTRAINTS','Platform, scope, team, what is off the table.',2],['evidence','EVIDENCE','Playtest results, telemetry, known problems. If none, say so. The task should then be a test design.',2],['role','ROLE','Skeptical systems designer? UX researcher? Devil’s advocate? Pick one stance.',1],['task','TASK','Analyse, generate, compare, build, simulate, code. Specific verbs, specific counts.',2],['output','OUTPUT FORMAT','Table columns, ranked list, code with logging, a hypothesis in standard form.',1],['critique','CRITIQUE','What the AI should attack in its own output, and what it must not do (recommend, decide, add scope).',2]];
  el.innerHTML = toolHead('AI Prompt Generator', 'The formula: CONTEXT + INTENT + CONSTRAINTS + EVIDENCE + ROLE + TASK + OUTPUT FORMAT + CRITIQUE. Fill what you know. Blanks are shown as brackets so you notice what you have not decided yet.', 'promptTool') +
    `<div class="row" style="margin-bottom:10px"><button type="button" class="btn sm" id="pgEx">Load a worked example</button><a class="btn sm ghost" href="#/ai/ladder">See the prompt ladder</a></div><div class="formula">${parts.map(p => `<button type="button" data-action="focus" data-target="pg_${p[0]}">${p[1]}</button>`).join('<span class="plus">+</span>')}</div><div class="grid c2"><div>${parts.map(([id,l,h,r]) => field('pg_'+id, l, h, '', r)).join('')}</div><div id="pg_out"></div></div>`;
  bindForm('promptTool', parts.map(p => 'pg_'+p[0]), d => {
    const v = k => (d['pg_'+k]||'').trim();
    const txt = `CONTEXT: ${v('context')||'[player, fantasy, loop, systems]'}\n\nINTENT: ${v('intent')||'[the experience we want. The decision I must make]'}\n\nCONSTRAINTS: ${v('constraints')||'[platform, scope, team, off-limits]'}\n\nEVIDENCE: ${v('evidence')||'[playtest results, telemetry, known problems. Or "none yet"]'}\n\nROLE: Act as a skeptical ${v('role')||'[role]'}.\n\nTASK: ${v('task')||'Analyse the design space, identify the assumptions in the current design, generate mechanically distinct alternatives, compare their tradeoffs, and propose the smallest experiments that would distinguish between them.'}\n\nOUTPUT FORMAT: ${v('output')||'[table columns / ranked list / code with logging]'}\n\nCRITIQUE: ${v('critique')||'Finally, attack your own output: what assumptions did you make (mark given, inferred, invented), what could make each alternative fail, what player behaviour would prove it wrong, and what did you leave out? Do not recommend a final choice. I will decide.'}`;
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
    <div class="dims" id="id_gapkinds">${GAP_KINDS.map(([id,t,d]) => `<button type="button" data-k="${id}" class="${saved.gap_class===id?'active':''}" title="${esc(d)}">${t}</button>`).join('')}</div>
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

Object.assign(A, { toolIdea, toolLoop, toolCanvas, toolLadder, toolFeature, toolHypothesis, toolDelegate, toolSysmap, toolPrompt, toolGameAI });
})(window.PlayableApp);
