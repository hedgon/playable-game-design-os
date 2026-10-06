/* =====================================================================
   PATH GAME (#/play/<path>): walk a learning path as a small top-down
   RPG in the manner of the first Dragon Quest. The world comes from
   95-rpg-world.js. A canvas draws only the map; every word (talk, the
   guardian's questions, travel) is page text over it, so it reads, zooms
   and works with a screen reader like the rest of the site. Rules from
   docs/rpg-2026-10/plan.md section 3: the only battle verb is recalling,
   nothing is locked or in the way, no points, no timers, no sound; the
   game reads and writes the same progress, notes and review queue as the
   path page, and reading happens on the step's own page.
   ===================================================================== */
(function(A){
'use strict';
const { $, $$, esc, store, go, setView, pathProgress, savePathProgress, markStageStatus, scheduleRecall, recallItems, recallIdeas,
  CONFIDENCE, OUTCOME, reviewItems, today, pathNextStep, rpgCount: count, RPG_T: T, buildRpgWorld } = A;

const TILE = 16, STEP_MS = 130, STILL_MS = 120;
const DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0], W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0] };
const tiles = new Image();
window.addEventListener('blur', () => { if(G) G.held = null; });
// a held key is let go wherever focus has moved since it went down, or the player walks on by itself
document.addEventListener('keyup', e => { if(G && DIRS[e.key] && G.held === DIRS[e.key]) G.held = null; });
let G = null;   // the world on screen: one at a time, rebuilt by each visit to the route

const saveKey = id => 'rpg.' + id;
const settings = () => store.get('rpg.settings', {});
const reduceMotion = () => settings().motion === 'off' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function renderRpg(id){
  if(id === 'stats') return renderStats();
  const pth = PATHS.find(p => p.id === id);
  store.set('paths.active', pth.id);
  setView(`<div class="rpg">
    <div class="rpg-head"><a class="btn sm" href="#/paths/${pth.id}">Use the list instead</a><h1>${esc(pth.t)}</h1></div>
    <div class="rpg-stage" tabindex="0" aria-label="The world of this path. Arrow keys or W A S D walk; Enter talks to whoever is beside you." aria-describedby="rpgHelp">
      <p class="rpg-status" role="status" aria-live="polite"></p>
      <canvas aria-hidden="true"></canvas>
      <div class="rpg-box" hidden></div>
    </div>
    <div class="rpg-controls">
      <div class="rpg-pad" role="group" aria-label="Walk">${[['up', '▲', 'Walk up', 0, -1], ['left', '◀', 'Walk left', -1, 0], ['right', '▶', 'Walk right', 1, 0], ['down', '▼', 'Walk down', 0, 1]].map(([k, s, l, dx, dy]) => `<button type="button" class="pad-${k}" data-pad="${dx},${dy}" aria-label="${l}">${s}</button>`).join('')}</div>
      <div class="rpg-cmds"><button type="button" class="btn sm primary" data-rpg="talk">Talk</button><button type="button" class="btn sm" data-rpg="travel">Travel</button><button type="button" class="btn sm ghost" data-rpg="motion" aria-pressed="${!reduceMotion()}">Smooth walking: ${reduceMotion() ? 'off' : 'on'}</button></div>
    </div>
    <p class="small muted" id="rpgHelp">Each town is a stage of this path, and each person in it is one of its steps, met in order along the road. The guardian at the far end of a town asks the stage’s checkpoint questions. Nothing is locked: walk anywhere, or use Travel. Tap a tile to walk there.</p>
  </div>`);
  const root = $('#pane .rpg'), world = buildRpgWorld(pth), saved = store.get(saveKey(pth.id), {});
  G = { pth, world, root, stage: $('.rpg-stage', root), cv: $('canvas', root), box: $('.rpg-box', root), status: $('.rpg-status', root),
    me: null, face: [0, 1], anim: null, held: null, queue: [], then: null, raf: 0, fight: null, said: '' };
  G.ctx = G.cv.getContext('2d');
  G.visited = new Set(Array.isArray(saved.visited) ? saved.visited : []);
  // where to stand: back beside the person whose page was opened, else where the walk stopped, else the current stage's way in
  const back = saved.back && world.towns.find(t => t.stage === saved.back.stage), person = back && back.people[saved.back.i];
  if(person){ G.me = { x: person.x, y: back.y + 5 }; G.face = [0, person.y < back.y + 5 ? -1 : 1]; if(saved.back.at) count('readMs', Math.min(Date.now() - saved.back.at, 30 * 60000)); }
  else if(Number.isInteger(saved.x) && world.walkable(saved.x, saved.y)) G.me = { x: saved.x, y: saved.y };
  else { const t = world.towns.find(t => t.stage === nextStageId()) || world.towns[0]; G.me = { ...t.entry }; }
  save();
  if(!tiles.src) tiles.src = 'assets/rpg/tiles.png?v=' + (window.PLAYABLE_BUILD || '');
  if(!tiles.complete) tiles.addEventListener('load', () => draw(), { once: true });
  new ResizeObserver(() => { if(G && G.root === root) fit(); }).observe(G.stage);
  bind(root);
  fit(); arrived(true);
}

/* ---------- the view: integer scale, crisp at any device pixel ratio ---------- */
function fit(){
  const cw = G.stage.clientWidth || 320;
  // a tile is at least 32 CSS px: x2 on a phone, x3 or x4 on wider screens
  const S = cw >= 700 ? 3 : 2, cols = Math.max(7, Math.floor(cw / (TILE * S)));
  const rows = Math.max(7, Math.min(13, Math.floor(window.innerHeight * 0.62 / (TILE * S))));
  const dpr = window.devicePixelRatio || 1, k = Math.max(1, Math.round(S * dpr));
  G.view = { cols, rows, k };
  G.cv.width = cols * TILE * k; G.cv.height = rows * TILE * k;
  G.cv.style.width = (cols * TILE * k / dpr) + 'px'; G.cv.style.height = (rows * TILE * k / dpr) + 'px';
  draw();
}
const sprite = (t, x, y) => G.ctx.drawImage(tiles, (t % 16) * TILE, Math.floor(t / 16) * TILE, TILE, TILE, x, y, TILE, TILE);
function draw(now){
  if(!G || !tiles.complete || !G.view) return;
  const { ctx, world, view } = G, W = view.cols * TILE, H = view.rows * TILE;
  // the player's drawn position: between two tiles while a smooth step is under way
  let px = G.me.x * TILE, py = G.me.y * TILE;
  if(G.anim && G.anim.smooth){ const p = Math.min(1, ((now || performance.now()) - G.anim.t0) / G.anim.dur); px = Math.round((G.anim.fx + (G.me.x - G.anim.fx) * p) * TILE); py = Math.round((G.anim.fy + (G.me.y - G.anim.fy) * p) * TILE); }
  const camX = world.w * TILE <= W ? (world.w * TILE - W) / 2 : Math.max(0, Math.min(world.w * TILE - W, px + 8 - W / 2));
  const camY = world.h * TILE <= H ? (world.h * TILE - H) / 2 : Math.max(0, Math.min(world.h * TILE - H, py + 8 - H / 2));
  const cx = Math.round(camX), cy = Math.round(camY);
  ctx.setTransform(view.k, 0, 0, view.k, 0, 0); ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#2e7d32'; ctx.fillRect(0, 0, W, H);
  const x0 = Math.max(0, Math.floor(cx / TILE)), y0 = Math.max(0, Math.floor(cy / TILE)), x1 = Math.min(world.w, x0 + view.cols + 2), y1 = Math.min(world.h, y0 + view.rows + 2);
  for(let y = y0; y < y1; y++) for(let x = x0; x < x1; x++){
    const i = y * world.w + x, dx = x * TILE - cx, dy = y * TILE - cy;
    sprite(world.ground[i], dx, dy); if(world.obj[i] >= 0) sprite(world.obj[i], dx, dy);
  }
  const prog = pathProgress(G.pth.id), next = pathNextStep(G.pth.id);
  for(const t of world.towns){
    const st = G.pth.stages[t.k];
    t.people.forEach(p => { sprite(p.look, p.x * TILE - cx, p.y * TILE - cy); if(prog.steps[`${st.id}/${p.i}`]) badge(p.x * TILE - cx, p.y * TILE - cy);
      if(next && next.type === 'step' && next.stage.id === st.id && next.index === p.i) marker(p.x * TILE - cx, p.y * TILE - cy); });
    sprite(t.guardian.look, t.guardian.x * TILE - cx, t.guardian.y * TILE - cy);
    if(prog.check[st.id]) badge(t.guardian.x * TILE - cx, t.guardian.y * TILE - cy);
    if(next && next.type === 'checkpoint' && next.stage.id === st.id) marker(t.guardian.x * TILE - cx, t.guardian.y * TILE - cy);
  }
  sprite(T.player, px - cx, py - cy);
}
// Done: a light square with a dark tick at the sprite's corner, a shape as well as a colour.
function badge(x, y){
  const c = G.ctx; c.fillStyle = '#fff'; c.fillRect(x + 9, y - 1, 8, 8); c.strokeStyle = '#1b5e20'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(x + 10.5, y + 3); c.lineTo(x + 12.5, y + 5); c.lineTo(x + 15.5, y + 0.5); c.stroke();
}
// The suggested next one: a still arrow above the head (no bobbing, nothing moves while you read).
function marker(x, y){ const c = G.ctx; c.fillStyle = '#ffd54f'; c.strokeStyle = '#3e2723'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 4, y - 7); c.lineTo(x + 12, y - 7); c.lineTo(x + 8, y - 2); c.closePath(); c.fill(); c.stroke(); }

/* ---------- walking ---------- */
function kick(){ if(!G.raf) G.raf = requestAnimationFrame(tick); }
function tick(now){
  G.raf = 0;
  if(!G.root.isConnected){ G = null; return; }
  if(G.anim && now - G.anim.t0 >= G.anim.dur){ G.anim = null; arrived(); }
  if(!G.anim && !openBox()){ const d = G.queue.length ? G.queue.shift() : G.held; if(d) step(d, now); }
  draw(now);
  if(G && (G.anim || ((G.held || G.queue.length) && !openBox()))) kick();
}
// A tap is one step, taken at once (a key can go up before the next frame); during a step it is the next one.
function press(d){ if(G.anim) G.queue = [d]; else { G.queue = []; step(d, performance.now()); } }
function step([dx, dy], now){
  G.face = [dx, dy];
  const nx = G.me.x + dx, ny = G.me.y + dy;
  if(!G.world.walkable(nx, ny)){ G.queue = []; G.then = null; return; }
  const smooth = !reduceMotion();
  G.anim = { fx: G.me.x, fy: G.me.y, t0: now, dur: smooth ? STEP_MS : STILL_MS, smooth };
  G.me = { x: nx, y: ny };
  count('walkMs', G.anim.dur);
}
function arrived(first){
  const t = G.world.townAt(G.me.x, G.me.y);
  if(t && !G.visited.has(t.stage)) G.visited.add(t.stage);
  save(); say(first);
  if(!G.queue.length && G.then){ const at = G.then; G.then = null; talkTo(at); }
}
function save(){
  const s = store.get(saveKey(G.pth.id), {}); delete s.back;
  store.set(saveKey(G.pth.id), Object.assign(s, { x: G.me.x, y: G.me.y, visited: [...G.visited] }));
}
const nextStageId = () => { const n = pathNextStep(G.pth.id); return n ? n.stage.id : null; };
const stageOf = t => G.pth.stages[t.k];
const townName = t => `Town ${t.k + 1}, ${stageOf(t).t}`;
// What stands on a tile next to the player, the one faced first.
function beside(){
  const order = [G.face, [0, -1], [0, 1], [-1, 0], [1, 0]];
  for(const [dx, dy] of order){ const e = G.world.at.get((G.me.x + dx) + ',' + (G.me.y + dy)); if(e) return { ...e, x: G.me.x + dx, y: G.me.y + dy }; }
  return null;
}
function nameOf(e){
  const st = stageOf(e.town);
  if(e.type === 'person'){ const s = st.steps[e.i], done = pathProgress(G.pth.id).steps[`${st.id}/${e.i}`]; return `${stepTitle(s)}${done ? ' (done)' : ''}`; }
  return e.type === 'guardian' ? `the guardian of ${st.t}` : `the sign of ${townName(e.town)}`;
}
// The status line says where you are and who is beside you; it speaks only when that changes. It lies
// over the top of the map, so a longer line never moves the map (the owner found the jump distracting).
function say(first){
  const t = G.world.townAt(G.me.x, G.me.y), e = beside();
  const stop = s => /[.?!]$/.test(s) ? s : s + '.';
  const where = stop(t ? townName(t) : 'On the road'), near = e ? stop(nameOf(e)) : '';
  const text = where + near;
  if(text !== G.said || first){ G.said = text; G.status.innerHTML = `<span>${esc(where)}</span>${e ? `<span class="rpg-near"> Beside you: ${esc(near)}</span><span class="sr-only"> Press Enter or Talk.</span>` : ''}`; }
}

/* ---------- tap to walk: the shortest way there, beside it if someone stands there ---------- */
function walkTo(tx, ty){
  const w = G.world, target = w.at.get(tx + ',' + ty);
  const goals = target ? [[0, -1], [0, 1], [-1, 0], [1, 0]].map(([dx, dy]) => [tx + dx, ty + dy]).filter(([x, y]) => w.walkable(x, y)) : (w.walkable(tx, ty) ? [[tx, ty]] : []);
  if(!goals.length) return;
  const goal = new Set(goals.map(([x, y]) => x + ',' + y)), from = new Map([[G.me.x + ',' + G.me.y, null]]), q = [[G.me.x, G.me.y]];
  let end = goal.has(G.me.x + ',' + G.me.y) ? [G.me.x, G.me.y] : null;
  while(q.length && !end && from.size < 6000){
    const [x, y] = q.shift();
    for(const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]){
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if(from.has(k) || !w.walkable(nx, ny)) continue;
      from.set(k, [x, y, dx, dy]); if(goal.has(k)){ end = [nx, ny]; break; } q.push([nx, ny]);
    }
  }
  if(!end) return;
  const path = []; let k = end[0] + ',' + end[1];
  while(from.get(k)){ const [x, y, dx, dy] = from.get(k); path.unshift([dx, dy]); k = x + ',' + y; }
  G.queue = path;
  G.then = target ? { ...target, x: tx, y: ty } : null;
  if(!path.length && G.then){ const at = G.then; G.then = null; G.face = [Math.sign(tx - G.me.x), Math.sign(ty - G.me.y)]; talkTo(at); return; }
  kick();
}

/* ---------- talk ---------- */
// A step's why, cut at sentence ends into boxes of about 150 characters that the player advances.
function pages(text, max = 150){
  const out = [];
  for(const s of String(text || '').split(/(?<=[.!?])\s+/)){ if(out.length && (out[out.length - 1] + ' ' + s).length <= max) out[out.length - 1] += ' ' + s; else out.push(s); }
  return out.length ? out : [''];
}
const openBox = () => G && !G.box.hidden;
function showBox(html, battle){
  G.box.innerHTML = html; G.box.hidden = false;
  G.root.classList.toggle('battling', !!battle); G.box.classList.toggle('battle', !!battle);
  G.held = null;
  const f = G.box.querySelector('[data-focus]') || G.box.querySelector('[data-primary]') || G.box.querySelector('button');
  if(f) f.focus({ preventScroll: !battle });
  if(battle) G.root.scrollIntoView({ block: 'start' });
}
function closeBox(){
  if(!G) return;
  G.box.hidden = true; G.box.innerHTML = ''; G.root.classList.remove('battling'); G.box.classList.remove('battle'); G.fight = null; G.talk = null;
  G.stage.focus({ preventScroll: true }); draw(); say(true);
}
function talkTo(e){
  G.face = [Math.sign(e.x - G.me.x), Math.sign(e.y - G.me.y)];
  const st = stageOf(e.town);
  if(e.type === 'sign') return showBox(`<p class="rpg-who">${esc(townName(e.town))}</p>
    <p class="rpg-say" tabindex="-1" data-focus>Stage ${e.town.k + 1} of ${G.pth.stages.length}. ${esc(st.goal || '')}</p>
    <p class="rpg-say small">The people along this road are the stage’s ${st.steps.length} steps, in order. The guardian at the far end asks its checkpoint questions.</p>
    <div class="rpg-opts"><button type="button" data-rpg="close" data-primary>Close</button></div>`);
  if(e.type === 'guardian') return guardian(e.town);
  G.talk = { town: e.town, i: e.i, page: 0, notes: false };
  person();
}
function person(){
  const { town, i, page } = G.talk, st = stageOf(town), s = st.steps[i], text = pages(s.why), last = page >= text.length - 1;
  const key = `${st.id}/${i}`, done = !!pathProgress(G.pth.id).steps[key], note = `${G.pth.id}.${st.id}.${i}`;
  const head = `<p class="rpg-who">${esc(stepTitle(s))}<span class="muted"> · step ${i + 1} of ${st.steps.length}${s.min ? ` · ${s.min} min` : ''}</span></p>
    <p class="rpg-say" tabindex="-1" data-focus>${esc(text[Math.min(page, text.length - 1)])}</p>`;
  if(!last) return showBox(`${head}<div class="rpg-opts"><button type="button" data-rpg="more" data-primary>Next ▸</button><button type="button" data-rpg="close">Later</button></div>`);
  const notes = G.talk.notes ? `<label class="small" for="rpgNote">Your notes (saved as you type; the same notes as on the path page)</label><textarea id="rpgNote" rows="4" data-pathnote="${esc(note)}">${esc(store.get('pathnote.' + note, ''))}</textarea>` : '';
  showBox(`${head}<p class="rpg-task"><b>Your task:</b> ${esc(s.do)}</p>${notes}
    <div class="rpg-opts">${s.kind === 'reflect' ? (G.talk.notes ? '' : `<button type="button" data-rpg="notes" data-primary>Write it here</button>`) : `<button type="button" data-rpg="goto" data-primary>Go there</button>`}
      <button type="button" data-rpg="done" aria-pressed="${done}">${done ? 'Done ✓' : 'Mark done'}</button>
      <button type="button" data-rpg="close">${G.talk.notes ? 'Close' : 'Later'}</button></div>`);
}

/* ---------- the guardian: the stage checkpoint, one question at a time ----------
   The same round as the path page's checkpoint (90-app.js): free recall, a
   "how sure am I?" tap before the outline, the ideas the reader ticks, the
   same outcomes and the same review schedule. The outcome is said in words;
   nothing is damaged and nothing is lost, and the guardian steps aside when
   the round ends whatever it was. A round is not kept across a reload. */
function guardian(town){
  const st = stageOf(town), n = recallItems(st).length, last = pathProgress(G.pth.id).check[st.id];
  showBox(`<p class="rpg-who">The guardian of ${esc(st.t)}</p>
    <p class="rpg-say" tabindex="-1" data-focus>I ask this stage’s ${n} question${n === 1 ? '' : 's'}, one at a time, from memory. Say how sure you are, then compare your answer with the outline. There is no score, and you can walk away at any time.</p>
    ${last ? `<p class="small">Last time (${esc(new Date(last.at).toLocaleDateString())}): ${last.got} of ${last.n} recalled${last.partial ? `, ${last.partial} partly` : ''}.</p>` : ''}
    <div class="rpg-opts">${n ? `<button type="button" data-rpg="fight" data-k="${town.k}" data-primary>Begin</button>` : ''}<button type="button" data-rpg="close">Not now</button></div>`);
}
function startFight(k){
  const town = G.world.towns[k], st = stageOf(town), n = recallItems(st).length;
  G.fight = { town, round: 1, order: [...Array(n).keys()], at: 0, phase: 'ask', conf: null, answer: '', first: Array(n).fill(null), said: '', t0: Date.now() };
  fight();
}
function fight(){
  const f = G.fight, st = stageOf(f.town), items = recallItems(st);
  const foe = `<div class="rpg-foe"><canvas width="16" height="16" aria-hidden="true"></canvas><p class="rpg-who">The guardian of ${esc(st.t)}</p></div>`;
  if(f.phase === 'end') return fightEnd(foe);
  const x = items[f.order[f.at]];
  const head = `${foe}<p class="small rpg-pos" role="status">${f.said ? `That answer: ${esc(f.said)}. ` : ''}${f.round === 2 ? 'Once more, the ones that were not there yet: question' : 'Question'} ${f.at + 1} of ${f.order.length}</p>
    <h2 class="rpg-q" tabindex="-1" data-focus>${esc(x.q)}</h2>`;
  if(f.phase === 'ask') showBox(`${head}
    <label class="small" for="rpgAns">Your answer, from memory (writing it is optional; saying it works too)</label>
    <textarea id="rpgAns" rows="3" data-rpg-answer>${esc(f.answer)}</textarea>
    <div class="small" id="rpgConfL">How sure are you?</div>
    <div class="rpg-opts" role="group" aria-labelledby="rpgConfL">${CONFIDENCE.map(([v, t]) => `<button type="button" data-rpg="conf" data-v="${v}" aria-pressed="${f.conf === v}">${t}</button>`).join('')}</div>
    <div class="rpg-opts"><button type="button" data-rpg="reveal" data-primary ${f.conf ? '' : 'disabled'}>Show the outline</button><button type="button" data-rpg="flee">Walk away</button></div>`, true);
  else showBox(`${head}${f.answer ? `<p class="small"><b>You wrote:</b> ${esc(f.answer)}</p>` : ''}
    <fieldset class="rpg-ideas"><legend class="small">Tick each idea your answer had</legend>${recallIdeas(x).map((t, i) => `<label><input type="checkbox" data-idea="${i}"> ${esc(t)}</label>`).join('')}</fieldset>
    <div class="rpg-opts"><button type="button" data-rpg="mark" data-primary>Next</button></div>`, true);
  drawFoe();
}
function drawFoe(){
  const c = G.box.querySelector('.rpg-foe canvas'); if(!c || !tiles.complete) return;
  const x = c.getContext('2d'), t = G.fight.town.guardian.look; x.imageSmoothingEnabled = false; x.clearRect(0, 0, 16, 16);
  x.drawImage(tiles, (t % 16) * TILE, Math.floor(t / 16) * TILE, TILE, TILE, 0, 0, 16, 16);
}
function mark(){
  const f = G.fight, st = stageOf(f.town), items = recallItems(st), idx = f.order[f.at];
  const boxes = $$('[data-idea]', G.box), had = boxes.filter(b => b.checked).length;
  const outcome = had === 0 ? 'missed' : had === boxes.length ? 'got' : 'partial';
  // the first answer in a round decides the schedule; asked again at the end, it is practice
  if(f.round === 1){ f.first[idx] = outcome; scheduleRecall(G.pth, st, items[idx], outcome, f.conf); }
  f.said = OUTCOME[outcome].toLowerCase(); f.at++; f.phase = 'ask'; f.conf = null; f.answer = '';
  if(f.at >= f.order.length){
    const again = f.round === 1 ? f.first.map((r, i) => r !== 'got' ? i : -1).filter(i => i >= 0) : [];
    if(again.length){ f.round = 2; f.order = again; f.at = 0; }
    else {
      f.phase = 'end';
      const n = items.length, got = f.first.filter(r => r === 'got').length, partial = f.first.filter(r => r === 'partial').length;
      const prog = pathProgress(G.pth.id); prog.check[st.id] = { at: Date.now(), mode: 'check', n, got, partial, missed: n - got - partial }; prog.last = Date.now(); if(!prog.started) prog.started = prog.last;
      savePathProgress(G.pth.id, prog); count('gameChecks', 1); count('answerMs', Date.now() - f.t0);
    }
  }
  fight();
}
function fightEnd(foe){
  const f = G.fight, st = stageOf(f.town), items = recallItems(st), n = items.length;
  const got = f.first.filter(r => r === 'got').length, partial = f.first.filter(r => r === 'partial').length, missed = n - got - partial;
  const queued = reviewItems(), when = items.map(x => queued[`ck:${G.pth.id}:${st.id}:${x.q}`]).filter(Boolean).map(r => r.due - today());
  const soon = when.filter(d => d <= 1).length, later = when.length - soon, status = pathProgress(G.pth.id).stages[st.id];
  showBox(`${foe}<h2 class="rpg-q" tabindex="-1" data-focus>What you recalled</h2>
    <ul class="rpg-sum"><li>${got} of ${n}: got it</li>${partial ? `<li>${partial}: partly</li>` : ''}${missed ? `<li>${missed}: not yet</li>` : ''}</ul>
    <p class="small">The guardian steps aside. Coming back: ${soon ? `${soon} tomorrow` : ''}${soon && later ? ', ' : ''}${later ? `${later} after a longer gap` : ''}${!soon && !later ? 'nothing queued' : ''} (your <a href="#/review">review queue</a>).</p>
    <p><b>Build:</b> ${esc(st.check.build)}</p>
    ${st.check.solution ? `<p class="small">A reference solution is on <a href="#/paths/${G.pth.id}/${st.id}">the stage page</a>, under the checkpoint: open it after you try.</p>` : ''}
    <div class="rpg-opts"><button type="button" data-rpg="close" data-primary>Back to the town</button><button type="button" data-rpg="stage-done" data-stage="${st.id}" ${status ? 'disabled' : ''}>${status === 'done' ? 'Stage marked done' : 'Mark stage done'}</button></div>`, true);
  drawFoe();
}

/* ---------- travel: to any town, visited or not; nothing is locked ---------- */
function travel(){
  const next = nextStageId();
  showBox(`<p class="rpg-who">Travel</p><p class="rpg-say" tabindex="-1" data-focus>Go to the way in of any town.</p>
    <div class="rpg-opts rpg-list">${G.world.towns.map(t => `<button type="button" data-rpg="go-town" data-k="${t.k}">${esc(townName(t))}${t.stage === next ? ' · next' : ''}${G.visited.has(t.stage) ? '' : ' · not visited yet'}</button>`).join('')}
      <button type="button" data-rpg="close">Stay here</button></div>`);
}

/* ---------- input ---------- */
function bind(root){
  root.addEventListener('keydown', e => {
    if(!G || G.root !== root || e.ctrlKey || e.metaKey || e.altKey) return;
    const typing = e.target.matches('textarea, input, select');
    if(openBox()){
      if(e.key === 'Escape' && (!G.fight || G.fight.phase === 'end')){ e.preventDefault(); closeBox(); }
      else if(!typing && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === 'ArrowLeft')){
        // a menu cursor, as in the old games: arrows move between the box's buttons
        const bs = $$('button:not([disabled])', G.box), i = bs.indexOf(document.activeElement), d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
        if(bs.length){ e.preventDefault(); bs[(i + d + bs.length) % bs.length].focus(); }
      }
      else if(!typing && e.key === 'Enter' && !e.target.closest('button, a, label, summary')){ const p = G.box.querySelector('[data-primary]:not([disabled])'); if(p){ e.preventDefault(); p.click(); } }
      return;
    }
    if(typing || e.target.closest('a')) return;
    const d = DIRS[e.key];
    if(d){ e.preventDefault(); G.then = null; if(!e.repeat) press(d); G.held = d; kick(); return; }
    if((e.key === 'Enter' || e.key === ' ') && !e.target.closest('button')){ e.preventDefault(); const b = beside(); if(b) talkTo(b); }
  });
  G.cv.addEventListener('click', e => {
    if(openBox()) return;
    const r = G.cv.getBoundingClientRect(), v = G.view, W = v.cols * TILE, H = v.rows * TILE;
    const px = G.me.x * TILE, py = G.me.y * TILE, w = G.world;
    const camX = w.w * TILE <= W ? (w.w * TILE - W) / 2 : Math.max(0, Math.min(w.w * TILE - W, px + 8 - W / 2));
    const camY = w.h * TILE <= H ? (w.h * TILE - H) / 2 : Math.max(0, Math.min(w.h * TILE - H, py + 8 - H / 2));
    walkTo(Math.floor((camX + (e.clientX - r.left) / r.width * W) / TILE), Math.floor((camY + (e.clientY - r.top) / r.height * H) / TILE));
    G.stage.focus({ preventScroll: true });
  });
  // the pad: hold to keep walking; a click from the keyboard takes one step
  $$('[data-pad]', root).forEach(b => {
    const d = b.dataset.pad.split(',').map(Number), stop = () => { if(G && G.held === d) G.held = null; };
    b.addEventListener('pointerdown', e => { if(openBox()) return; e.preventDefault(); G.then = null; press(d); G.held = d; kick(); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => b.addEventListener(t, stop));
    b.addEventListener('click', e => { if(e.detail === 0 && !openBox()){ G.queue = [d]; kick(); } });
  });
  root.addEventListener('input', e => { if(G && G.fight && e.target.matches('[data-rpg-answer]')) G.fight.answer = e.target.value; });
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-rpg]'); if(!b || !G) return;
    const f = G.fight;
    switch(b.dataset.rpg){
      case 'talk': { const t = beside(); if(t) talkTo(t); else G.status.textContent = 'There is nobody beside you. Walk up to a person, a sign or a guardian.'; break; }
      case 'travel': travel(); break;
      case 'motion': { const s = settings(); s.motion = reduceMotion() ? 'on' : 'off'; store.set('rpg.settings', s); b.setAttribute('aria-pressed', !reduceMotion()); b.textContent = 'Smooth walking: ' + (reduceMotion() ? 'off' : 'on'); break; }
      case 'close': closeBox(); break;
      case 'more': G.talk.page++; person(); break;
      case 'notes': G.talk.notes = true; person(); { const t = $('#rpgNote', G.box); if(t) t.focus(); } break;
      case 'done': { const st = stageOf(G.talk.town), key = `${st.id}/${G.talk.i}`, prog = pathProgress(G.pth.id);
        prog.steps[key] = !prog.steps[key]; prog.last = Date.now(); if(!prog.started) prog.started = prog.last; savePathProgress(G.pth.id, prog);
        person(); draw(); break; }
      case 'goto': { const st = stageOf(G.talk.town), s = st.steps[G.talk.i];
        store.set(saveKey(G.pth.id), Object.assign(store.get(saveKey(G.pth.id), {}), { back: { stage: st.id, i: G.talk.i, at: Date.now() } }));
        go(stepHref(s, G.pth.id, st.id)); break; }
      case 'fight': startFight(+b.dataset.k); break;
      case 'conf': f.conf = b.dataset.v; f.answer = ($('[data-rpg-answer]', G.box) || {}).value || f.answer; fight(); { const r = G.box.querySelector('[data-rpg="reveal"]'); if(r) r.focus(); } break;
      case 'reveal': if(f.conf){ f.answer = ($('[data-rpg-answer]', G.box) || {}).value || f.answer; f.phase = 'reveal'; fight(); } break;
      case 'mark': mark(); break;
      case 'flee': closeBox(); break;
      case 'stage-done': markStageStatus(G.pth.id, b.dataset.stage, 'done'); b.disabled = true; b.textContent = 'Stage marked done'; draw(); break;
      case 'go-town': { const t = G.world.towns[+b.dataset.k]; G.me = { ...t.entry }; G.face = t.east ? [1, 0] : [-1, 0]; closeBox(); arrived(); draw(); break; }
    }
  });
}

/* ---------- #/play/stats: the plan's walking-cost check, for the owner ---------- */
function renderStats(){
  const s = store.get('rpg.stats', {}), min = ms => ((ms || 0) / 60000).toFixed(1);
  setView(`<h1>Path game: time and use</h1><p class="dim">Kept only in this browser. Compares time spent walking with time spent reading a step’s page and answering a guardian, and counts checkpoint rounds finished in the game and on the path page.</p>
    <table class="tbl"><tbody>
      <tr><th scope="row">Walking</th><td>${min(s.walkMs)} min</td></tr>
      <tr><th scope="row">Reading a step’s page (from the game, capped at 30 min a visit)</th><td>${min(s.readMs)} min</td></tr>
      <tr><th scope="row">Answering guardians</th><td>${min(s.answerMs)} min</td></tr>
      <tr><th scope="row">Checkpoint rounds finished in the game</th><td>${s.gameChecks || 0}</td></tr>
      <tr><th scope="row">Checkpoint rounds finished on the path page</th><td>${s.pageChecks || 0}</td></tr>
      <tr><th scope="row">Review answers graded on the Review page</th><td>${s.pageReviews || 0}</td></tr>
    </tbody></table>`);
}
A.renderRpg = renderRpg;
})(window.PlayableApp);
