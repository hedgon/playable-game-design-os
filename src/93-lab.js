/* =====================================================================
   IDEA LAB
   The ideation surface. Not a form: a chain of small artifacts that turns
   an observation into a design question, a design space, mechanisms and an
   experiment. The Idea Shaper becomes the Idea Card the chain compresses
   into. Methodology works without AI.
   Chain: Observe -> Signal -> Tension -> Opportunity -> Design question
          -> Design space -> Mechanisms -> Critique -> Converge -> Experiment
          -> Decide -> Idea Card
   ===================================================================== */

const LAB_MODES = [
  ['observe','I noticed something','Start from one specific thing players do, complain about, work around or build tools for.','e.g. Players build spreadsheets to plan their factory before building it.'],
  ['desire','I want players to feel something','Start from the emotion, then work down to the behaviour and the rule that creates it.','e.g. I want players to feel clever.'],
  ['like','I like a game, but...','Decompose what you enjoy into behaviour, then keep, remove, flip and combine.','e.g. I like Stardew, but the checklist eventually feels like work.'],
  ['constraint','I have a constraint','Let the constraint remove options until an unusual design space appears.','e.g. One button. Thirty-minute sessions. Solo.'],
  ['unknown','I do not know what to make','Answer five short questions. You do not need an idea yet.','']
];

// mode-specific relabels of the first two steps and the first-step prompt
const LAB_MODE_STEPS = {
  desire: { signal:{ t:'Desired emotion', q:'What should the player feel, and in what rhythm?', ex:'Clever, then uncertain, then clever again.' }, tension:{ t:'What blocks it', q:'What currently stops that feeling, or makes it cheap?', ex:'Systems that solve the problem for the player remove the feeling of cleverness.' } },
  like:   { signal:{ t:'The game and what you enjoy', q:'Name the game, and the exact behaviour that produces the enjoyment.', ex:'Stardew Valley. The enjoyment is tending a place that visibly grows because I chose where to spend the day.' }, tension:{ t:'What frustrates you', q:'Which part is friction you would remove, and which part is essential to the enjoyment?', ex:'Friction: the daily checklist. Essential: the compounding, visible growth.' } },
  constraint:{ signal:{ t:'The constraint', q:'What limit are you designing inside?', ex:'One button, thirty-minute sessions, solo, no combat.' }, tension:{ t:'What it prevents and what it forces', q:'What does the constraint make impossible, and what unusual space does that open?', ex:'It forbids twitch execution, so the whole game has to live in timing and choice.' } },
  unknown: { signal:{ t:'Five short questions', q:'1. What player behaviour do you find fascinating? 2. What game is almost great, and why? 3. What experience do you wish existed? 4. What constraint sounds interesting? 5. What system do you enjoy thinking about?', ex:'Answer in fragments. Any line can become the signal.' } }
};

const LAB_STEPS = [
  { id:'signal', t:'Signal', q:'What do players repeatedly do, complain about, work around, or build tools for?', ex:'Players build spreadsheets to plan the factory before building it.', ev:true,
    p:'Here is a player observation: [SIGNAL]. Split it into fact, inference and speculation. Then list the recurring behaviours inside it and the effort players are already spending. Do not propose game ideas.' },
  { id:'tension', t:'Tension', q:'What contradiction or unmet desire sits underneath it?', ex:'They want the plan to matter, but planning is easier outside the game than inside it.', ev:true,
    p:'Observation: [SIGNAL]. The apparent tension is: [TENSION]. List the other tensions this observation could support, and say what evidence would separate them. Do not propose solutions.' },
  { id:'opportunity', t:'Opportunity', q:'What does this make possible that no shipped game serves?', ex:'Make planning inside the game as satisfying as the spreadsheet, without removing the consequence.', ev:true,
    p:'Signals: [SIGNAL]. Tensions: [TENSION]. State the opportunity in one sentence that names a player, a desire and what they do today instead. Mark what is observed and what is inferred.' },
  { id:'question', t:'Design question', q:'Turn the opportunity into a can-we question. A question, not a pitch.', ex:'Can planning inside the game be more satisfying than planning outside it?', ev:false,
    p:'Opportunity: [OPPORTUNITY]. Write 5 design questions in the form "Can we ... ?" that explore different directions. Do not propose solutions. Rank them by how much they change what the player does.' },
  { id:'space', t:'Design space', q:'Name three dimensions along which the problem can be solved, and the options on each.', ex:'Object: layout / throughput / supply / defence. Uncertainty: demand / terrain / events / rivals. Meaning of done: steady state / record / resilience.', ev:false,
    p:'Design question: [QUESTION]. Identify the 3 axes that matter most and 3 to 5 concrete options on each. Then describe the extreme corners of this space. Do not choose one.' },
  { id:'mech', t:'Mechanisms', q:'Three mechanically different answers. For each: the rule, the decision it creates, the emotion, the failure mode.', ex:'Rule: the plan previews live throughput before you build. Decision: build for now or for the next tier. Emotion: foresight. Failure: the preview removes all surprise.', ev:false,
    p:'Design question: [QUESTION]. Design space: [SPACE]. Propose 6 mechanically distinct mechanisms, smallest first. For each: the rule in one sentence, the decision it creates every minute, the intended emotion, the systemic interactions, and the failure mode. Do not recommend one.' },
  { id:'critique', t:'Critique', q:'Attack it. Who would not care, what breaks after ten hours, and what is the single riskiest assumption?', ex:'Who would not care: discovery players. Ten hours: the optimum is found and planning becomes copying. Riskiest assumption: players want foresight more than surprise.', ev:false,
    p:'Mechanisms: [MECHANISMS]. Act as a hostile reviewer. For each: why a player would not care, why it might be a reskin, what breaks after 30 minutes and after 10 hours, what an incumbent could copy, and the one assumption carrying the whole idea.' },
  { id:'converge', t:'Converge', q:'Judge the strongest mechanism against ten lenses. Confidence, not a score.', ex:'Player value high. Distinctiveness medium. Prototypeability high. Evidence low.', ev:false,
    p:'Design question: [QUESTION]. Candidate mechanisms: [MECHANISMS]. For each of these lenses, rate the strongest mechanism high, medium, low or unknown and say why in one line: player value, mechanical distinctiveness, experience, systemic potential, novelty, clarity, prototypeability, production viability, defensibility, evidence. Do not average them into a score.' },
  { id:'experiment', t:'Experiment', q:'The cheapest test of the riskiest assumption, the signal you will watch, and the kill criterion.', ex:'Test: a whiteboard planner with one forecasting rule. Signal: players replan unprompted. Kill: nobody uses the forecast twice.', ev:false,
    p:'Riskiest assumption: [RISK]. Design the cheapest experiment that could prove it false: what to build, what to observe, the signal, and the kill criterion. Behaviour only, no surveys.' },
  { id:'decide', t:'Decide', q:'Kill, iterate, prototype, or commit. Name the reason, not the mood.', ex:'Prototype. The riskiest assumption is testable in a day, and it is the one thing that would change the decision.', ev:false,
    p:'Evidence so far: [EVIDENCE]. Present the four options kill, iterate, prototype, commit with the tradeoffs of each and the cheapest next action. Recommend nothing. I decide.' }
];

const LAB_LENSES = ['Player value','Mechanical distinctiveness','Experience','Systemic potential','Novelty','Clarity','Prototypeability','Production viability','Defensibility','Evidence'];
const LAB_CONF = ['high','medium','low','unknown'];

const LAB_EV = ['observed','reported','inferred','hypothesized','simulated','validated'];
const LAB_EV_HINT = { observed:'you saw it happen', reported:'a player said it', inferred:'you read a pattern', hypothesized:'a belief to test', simulated:'AI predicted it', validated:'prototype or player evidence' };

function labDefaults(){ return { mode:'', step:{}, ev:{}, lens:{}, decision:'', spaceAxes:['','',''], spaceOpts:[['','',''],['','',''],['','','']], mech:[{rule:'',decision:'',emotion:'',fail:''},{rule:'',decision:'',emotion:'',fail:''},{rule:'',decision:'',emotion:'',fail:''}], card:{promise:'',mechanism:'',verb:'',player:'',fantasy:'',constraints:''} }; }

function renderLab(){
  const saved = Object.assign(labDefaults(), store.get('lab', {}));
  const save = () => store.set('lab', saved);
  const modeStep = k => (LAB_MODE_STEPS[saved.mode] && LAB_MODE_STEPS[saved.mode][k]) || {};
  const stepMeta = id => { const s = LAB_STEPS.find(x => x.id === id); const o = modeStep(id); return Object.assign({}, s, o); };

  const modeBtns = LAB_MODES.map(([id,t,d]) => `<button class="labmode ${saved.mode===id?'active':''}" data-m="${id}"><b>${esc(t)}</b><span>${esc(d)}</span></button>`).join('');

  const evChips = id => `<div class="evrow">${LAB_EV.map(e => `<button class="evchip ${saved.ev[id]===e?'on':''}" data-step="${id}" data-ev="${e}" title="${esc(LAB_EV_HINT[e])}">${e}</button>`).join('')}</div>`;

  const stepCard = id => {
    const s = stepMeta(id);
    return `<div class="labstep" id="lab_${id}">
      <div class="row between" style="align-items:baseline"><div class="step-num" style="margin:0">${esc(s.t)}</div>${s.ev ? evChips(id) : ''}</div>
      <p class="small dim" style="margin:4px 0 6px">${esc(s.q)}</p>
      <textarea id="labv_${id}" rows="3" placeholder="${esc(s.ex)}">${esc(saved.step[id]||'')}</textarea>
      <div class="row" style="margin-top:6px;gap:6px"><button class="btn sm ghost labex" data-step="${id}">example</button><button class="btn sm ghost labpr" data-step="${id}">copy AI prompt</button></div>
      <div class="labex-box small dim" id="labex_${id}" hidden>${esc(s.ex)}</div>
    </div>`;
  };

  const spaceCard = () => `<div class="labstep">
    <div class="step-num">${esc(stepMeta('space').t)}</div>
    <p class="small dim" style="margin:4px 0 6px">${esc(stepMeta('space').q)}</p>
    ${[0,1,2].map(a => `<div class="labaxis"><input class="labax" data-a="${a}" placeholder="Axis ${a+1} (e.g. the object being chosen)" value="${esc(saved.spaceAxes[a]||'')}"><input class="labaxo" data-a="${a}" placeholder="options, comma separated" value="${esc((saved.spaceOpts[a]||[]).join(', '))}"></div>`).join('')}
    <div class="row" style="margin-top:6px;gap:6px"><button class="btn sm ghost labex" data-step="space">example</button><button class="btn sm ghost labpr" data-step="space">copy AI prompt</button></div>
    <div class="labex-box small dim" id="labex_space" hidden>${esc(stepMeta('space').ex)}</div>
  </div>`;

  const mechCard = () => `<div class="labstep">
    <div class="step-num">${esc(stepMeta('mech').t)}</div>
    <p class="small dim" style="margin:4px 0 6px">${esc(stepMeta('mech').q)}</p>
    ${[0,1,2].map(i => `<div class="labmech"><b>Mechanism ${i+1}</b>
      <input class="labm" data-i="${i}" data-k="rule" placeholder="The rule, one sentence" value="${esc(saved.mech[i].rule||'')}">
      <input class="labm" data-i="${i}" data-k="decision" placeholder="The decision it creates every minute" value="${esc(saved.mech[i].decision||'')}">
      <input class="labm" data-i="${i}" data-k="emotion" placeholder="Intended emotion" value="${esc(saved.mech[i].emotion||'')}">
      <input class="labm" data-i="${i}" data-k="fail" placeholder="Failure mode" value="${esc(saved.mech[i].fail||'')}">
    </div>`).join('')}
    <div class="row" style="margin-top:6px;gap:6px"><button class="btn sm ghost labex" data-step="mech">example</button><button class="btn sm ghost labpr" data-step="mech">copy AI prompt</button></div>
    <div class="labex-box small dim" id="labex_mech" hidden>${esc(stepMeta('mech').ex)}</div>
  </div>`;

  const convergeCard = () => `<div class="labstep">
    <div class="step-num">${esc(stepMeta('converge').t)}</div>
    <p class="small dim" style="margin:4px 0 6px">${esc(stepMeta('converge').q)} Confidence, not a score, so you can see which claim is load-bearing.</p>
    ${LAB_LENSES.map(l => `<div class="lablens"><span class="ll">${esc(l)}</span><select class="labconf" data-l="${esc(l)}">${['', ...LAB_CONF].map(c => `<option value="${c}" ${(((saved.lens[l]||{}).c)||'')===c?'selected':''}>${c||'-'}</option>`).join('')}</select><input class="labwhy" data-l="${esc(l)}" placeholder="why, one line" value="${esc((saved.lens[l]||{}).n||'')}"></div>`).join('')}
    <div class="row" style="margin-top:6px"><button class="btn sm ghost labpr" data-step="converge">copy AI prompt</button></div>
  </div>`;
  const decideCard = () => `<div class="labstep">
    <div class="step-num">${esc(stepMeta('decide').t)}</div>
    <p class="small dim" style="margin:4px 0 6px">${esc(stepMeta('decide').q)}</p>
    <div class="evrow">${['kill','iterate','prototype','commit'].map(d => `<button class="decidebtn ${saved.decision===d?'on':''}" data-d="${d}">${d}</button>`).join('')}</div>
    <textarea id="labv_decide" rows="2" placeholder="${esc(stepMeta('decide').ex)}" style="margin-top:8px">${esc(saved.step.decide||'')}</textarea>
    <div class="row" style="margin-top:6px"><button class="btn sm ghost labpr" data-step="decide">copy AI prompt</button></div>
  </div>`;
  const cardField = (k,l,ph,rows) => `<div class="field"><label>${esc(l)}</label>${rows?`<textarea class="labcard" data-k="${k}" rows="${rows}" placeholder="${esc(ph)}">${esc(saved.card[k]||'')}</textarea>`:`<input class="labcard" data-k="${k}" placeholder="${esc(ph)}" value="${esc(saved.card[k]||'')}">`}</div>`;

  const ready = (saved.step.signal||'').trim() && (saved.step.tension||'').trim() && (saved.step.question||'').trim();
  setView(`${crumbs([['Map','#/map'],['Idea Lab']])}<h1>Idea Lab</h1>
    <p class="dim" style="max-width:900px">An idea is a chain of reasoning, not a filled-in form. Start with almost nothing and move down the chain: observe a signal, name the tension underneath it, turn that into a design question, map the design space, design mechanisms, attack them, converge, then run the cheapest experiment and decide. The <b>Idea Card</b> at the end is compression, not the beginning.</p>
    <div class="labchain">${['Observe','Signal','Tension','Opportunity','Design question','Design space','Mechanisms','Critique','Converge','Experiment','Decide','Idea Card'].map((x,i,a)=>`${i?'<span class="arrow">→</span>':''}<span class="cn">${x}</span>`).join('')}</div>
    <div class="labmodes">${modeBtns}</div>
    <div class="grid c2"><div>
      ${stepCard('signal')}${stepCard('tension')}${stepCard('opportunity')}${stepCard('question')}${spaceCard()}${mechCard()}${stepCard('critique')}${convergeCard()}${stepCard('experiment')}${decideCard()}
    </div><div id="lab_out"><div class="card">
      <h4>Your reasoning chain</h4>
      <div id="lab_chain"><div class="empty">Start with a mode and one sentence. The chain builds as you go.</div></div>
      <h4 style="margin-top:14px">Idea Card</h4>
      <p class="small dim">Compress the chain. This is the communication artifact, and it can be done before or after the experiment.</p>
      ${cardField('player','Player','A specific person, not gamers',0)}
      ${cardField('promise','Promise','The experience this uniquely provides',2)}
      ${cardField('mechanism','Mechanism','The one rule that carries it',2)}
      ${cardField('verb','Core verb','What the player does most',0)}
      ${cardField('fantasy','Fantasy','In this game I get to be someone who...',2)}
      ${cardField('constraints','Constraints','Team, time, platform, skills',2)}
      <div class="row" style="margin-top:8px"><button class="btn primary sm" id="lab_tocard" ${ready?'':'disabled title="Fill signal, tension and design question first"'}>Open the Idea Card tool</button><button class="btn sm" id="lab_export">Copy chain as Markdown</button></div>
      <p class="small muted" style="margin-top:8px">AI expands the design space. You choose the direction. Players provide the reality. Every claim above has an evidence level, so keep them honest.</p>
    </div></div></div>`);

  const out = () => {
    const v = id => (saved.step[id]||'').trim();
    const chain = LAB_STEPS.map(s => { let txt = v(s.id);
      if(s.id==='converge') txt = LAB_LENSES.filter(l => (saved.lens[l]||{}).c).map(l => l+': '+saved.lens[l].c).join(', ');
      if(s.id==='decide') txt = saved.decision ? saved.decision.toUpperCase() + (v('decide') ? ', ' + v('decide') : '') : v('decide');
      return txt ? `<div class="labchainrow"><span class="k">${esc(stepMeta(s.id).t)}</span><span>${esc(txt)}</span></div>` : ''; }).join('');
    const chainEl = $('#lab_chain'); if(chainEl) chainEl.innerHTML = chain || '<div class="empty">Start with a mode and one sentence. The chain builds as you go.</div>';
    const btn = $('#lab_tocard'); if(btn) btn.disabled = !((saved.step.signal||'').trim() && (saved.step.tension||'').trim() && (saved.step.question||'').trim());
  };
  const pushToCard = () => { const idea = store.get('ideaTool', {}); const card = saved.card; const v = id => (saved.step[id]||'').trim();
    Object.assign(idea, { player: card.player||idea.player, wish: card.promise||idea.wish, mechanism: card.mechanism||idea.mechanism, verb: card.verb||idea.verb, fantasy: card.fantasy||idea.fantasy, constraints: card.constraints||idea.constraints, complaints: v('tension')||idea.complaints, market: v('signal')||idea.market });
    store.set('ideaTool', idea); location.hash = '#/build/idea'; };
  $('#lab_tocard').onclick = pushToCard;
  $('#lab_export').onclick = () => __copy(labMarkdown());

  const labMarkdown = () => {
    const v = id => (saved.step[id]||'').trim() || '(blank)';
    const axes = [0,1,2].map(a => `- ${saved.spaceAxes[a]||'(axis)'}: ${(saved.spaceOpts[a]||[]).filter(Boolean).join(', ')}`).join('\n');
    const mech = saved.mech.map((m,i) => `### Mechanism ${i+1}\n- Rule: ${m.rule||'?'}\n- Decision: ${m.decision||'?'}\n- Emotion: ${m.emotion||'?'}\n- Failure: ${m.fail||'?'}`).join('\n');
    return `# Idea Lab chain\n\n**Mode:** ${saved.mode||'none'}\n\n## Signal\n${v('signal')}${saved.ev.signal?`\n_evidence: ${saved.ev.signal}_`:''}\n\n## Tension\n${v('tension')}${saved.ev.tension?`\n_evidence: ${saved.ev.tension}_`:''}\n\n## Opportunity\n${v('opportunity')}${saved.ev.opportunity?`\n_evidence: ${saved.ev.opportunity}_`:''}\n\n## Design question\n${v('question')}\n\n## Design space\n${axes}\n\n## Mechanisms\n${mech}\n\n## Critique\n${v('critique')}\n\n## Converge\n${LAB_LENSES.map(l => '- '+l+': '+(((saved.lens[l]||{}).c)||'unknown')+(((saved.lens[l]||{}).n)?' ('+saved.lens[l].n+')':'')).join('\n')}\n\n## Experiment\n${v('experiment')}\n\n## Decide\n${(saved.decision||'undecided')}${v('decide')?', '+v('decide'):''}\n\n## Idea Card\n- Player: ${saved.card.player||'?'}\n- Promise: ${saved.card.promise||'?'}\n- Mechanism: ${saved.card.mechanism||'?'}\n- Core verb: ${saved.card.verb||'?'}\n- Fantasy: ${saved.card.fantasy||'?'}\n- Constraints: ${saved.card.constraints||'?'}\n`;
  };

  // wiring
  $$('.labmode').forEach(b => b.onclick = () => { saved.mode = b.dataset.m; save(); renderLab(); });
  $$('.labex').forEach(b => b.onclick = () => { const box = $('#labex_' + b.dataset.step); if(box) box.hidden = !box.hidden; });
  $$('.labpr').forEach(b => b.onclick = () => { const s = stepMeta(b.dataset.step); __copy(labPrompt(s.id)); toast('AI prompt copied'); });
  $$('.evchip').forEach(b => b.onclick = () => { saved.ev[b.dataset.step] = saved.ev[b.dataset.step]===b.dataset.ev ? '' : b.dataset.ev; save(); renderLab(); });
  LAB_STEPS.forEach(s => { const el = $('#labv_' + s.id); if(el) el.addEventListener('input', () => { saved.step[s.id] = el.value; save(); out(); }); });
  $$('.labax').forEach(i => i.addEventListener('input', () => { saved.spaceAxes[+i.dataset.a] = i.value; save(); }));
  $$('.labaxo').forEach(i => i.addEventListener('input', () => { saved.spaceOpts[+i.dataset.a] = i.value.split(',').map(x => x.trim()).filter(Boolean); save(); }));
  $$('.labm').forEach(i => i.addEventListener('input', () => { saved.mech[+i.dataset.i][i.dataset.k] = i.value; save(); }));
  $$('.labconf').forEach(s => s.addEventListener('change', () => { const l = s.dataset.l; (saved.lens[l] = saved.lens[l] || {}).c = s.value; save(); out(); }));
  $$('.labwhy').forEach(i => i.addEventListener('input', () => { const l = i.dataset.l; (saved.lens[l] = saved.lens[l] || {}).n = i.value; save(); }));
  $$('.decidebtn').forEach(b => b.onclick = () => { saved.decision = saved.decision === b.dataset.d ? '' : b.dataset.d; save(); $$('.decidebtn').forEach(x => x.classList.toggle('on', x.dataset.d === saved.decision)); out(); });
  $$('.labcard').forEach(i => i.addEventListener('input', () => { saved.card[i.dataset.k] = i.value; save(); }));

  const labPrompt = id => { const s = stepMeta(id); const v = k => (saved.step[k]||'[not filled]').trim(); return (s.p||'')
    .replace('[SIGNAL]', v('signal')).replace('[TENSION]', v('tension')).replace('[OPPORTUNITY]', v('opportunity')).replace('[QUESTION]', v('question'))
    .replace('[SPACE]', (saved.spaceAxes.filter(Boolean).join(' / ') || '[design space]')).replace('[MECHANISMS]', (saved.mech.map(m=>m.rule).filter(Boolean).join(' | ') || '[mechanisms]')).replace('[RISK]', v('critique')); };

  out();
}
