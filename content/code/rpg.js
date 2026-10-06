(function(A){
'use strict';
const T = { grass:0, grass2:1, flowers:2, tree:3, tree2:4, bush:5, autumn:6, road:7, roofL:8, roofM:9, roofR:10, wallL:11, door:12, wallR:13, sign:14, stone:15,
  player:16, npc:[17, 18, 19, 20, 21, 22, 23, 24, 25], guard:[26, 27, 28, 29], mon:[30, 31, 32, 33], wall:34, well:35, chest:39 };
const SOLID = new Set([T.tree, T.tree2, T.bush, T.autumn, T.roofL, T.roofM, T.roofR, T.wallL, T.door, T.wallR, T.sign, T.wall, T.well]);
const TH = 11, ROAD = 5, GAP_X = 9, GAP_Y = 5, MARGIN = 4;

function seeded(str){
  let h = 2166136261; for(let i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
}

function buildWorld(pth){
  const n = pth.stages.length, cols = n > 4 ? 3 : 2, rows = Math.ceil(n / cols);
  const perSide = Math.max(2, ...pth.stages.map(s => Math.ceil(s.steps.length / 2)));
  const TW = 3 + 4 * perSide;
  const w = MARGIN * 2 + cols * TW + (cols - 1) * GAP_X + 4, h = MARGIN * 2 + rows * TH + (rows - 1) * GAP_Y;
  const ground = new Int16Array(w * h).fill(T.grass), obj = new Int16Array(w * h).fill(-1);
  const at = new Map();   // "x,y" -> what stands there: { type:'person'|'guardian'|'sign', town, i }
  const set = (x, y, g, o) => { if(x < 0 || y < 0 || x >= w || y >= h) return; const k = y * w + x; if(g != null) ground[k] = g; if(o !== undefined) obj[k] = o; };
  const road = new Set(), rnd = seeded(pth.id);
  const carve = (x1, y1, x2, y2) => {   // a straight piece of road
    for(let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) for(let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++){ set(x, y, T.road, -1); road.add(y * w + x); }
  };
  const towns = pth.stages.map((st, k) => {
    const r = Math.floor(k / cols), east = r % 2 === 0, c = east ? k % cols : cols - 1 - k % cols;
    const ox = MARGIN + c * (TW + GAP_X), oy = MARGIN + r * (TH + GAP_Y), ry = oy + ROAD;
    const entry = { x: east ? ox : ox + TW - 1, y: ry }, exit = { x: east ? ox + TW - 1 : ox, y: ry };
    const town = { stage: st.id, k, x: ox, y: oy, w: TW, h: TH, east, entry, exit, people: [], guardian: null, sign: null };
    for(let y = oy; y < oy + TH; y++) for(let x = ox; x < ox + TW; x++){
      const edge = y === oy || y === oy + TH - 1 || ((x === ox || x === ox + TW - 1) && (y < oy + 3 || y > oy + TH - 4));
      set(x, y, T.grass, edge ? (rnd() < 0.5 ? T.tree : T.tree2) : -1);
    }
    carve(ox, ry, ox + TW - 1, ry);
    for(let j = 0; j < perSide; j++){
      const hx = ox + 2 + 4 * j;
      for(const top of [oy + 1, oy + TH - 3]){ set(hx, top, null, T.roofL); set(hx + 1, top, null, T.roofM); set(hx + 2, top, null, T.roofR); set(hx, top + 1, null, T.wallL); set(hx + 1, top + 1, null, T.door); set(hx + 2, top + 1, null, T.wallR); }
    }
    st.steps.forEach((step, i) => {
      const j = Math.floor(i / 2), col = east ? ox + 3 + 4 * j : ox + TW - 4 - 4 * j, y = i % 2 === 0 ? ry - 1 : ry + 1;
      const p = { i, x: col, y, look: T.npc[(i * 7 + k * 3) % T.npc.length] };
      town.people.push(p); at.set(col + ',' + y, { type: 'person', town, i });
    });
    town.sign = { x: east ? ox + 1 : ox + TW - 2, y: ry - 1 };
    set(town.sign.x, town.sign.y, null, T.sign); at.set(town.sign.x + ',' + town.sign.y, { type: 'sign', town });
    town.guardian = { x: east ? ox + TW - 2 : ox + 1, y: ry - 1, look: T.guard[k % T.guard.length] };
    set(town.guardian.x, town.guardian.y, T.stone);   // the guardian keeps a paved spot of its own
    at.set(town.guardian.x + ',' + town.guardian.y, { type: 'guardian', town });
    return town;
  });
  towns.forEach((a, k) => {
    const b = towns[k + 1]; if(!b) return;
    if(a.exit.y === b.entry.y) return carve(a.exit.x, a.exit.y, b.entry.x, b.entry.y);
    const bend = a.east ? a.exit.x + 3 : a.exit.x - 3;
    carve(a.exit.x, a.exit.y, bend, a.exit.y); carve(bend, a.exit.y, bend, b.entry.y); carve(bend, b.entry.y, b.entry.x, b.entry.y);
  });
  const inTown = (x, y) => towns.some(t => x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h);
  const nearRoad = (x, y) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => road.has((y + dy) * w + x + dx));
  for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){
    if(inTown(x, y) || road.has(y * w + x)) continue;
    if(x === 0 || y === 0 || x === w - 1 || y === h - 1){ set(x, y, T.grass, T.tree); continue; }
    const v = rnd();
    if(nearRoad(x, y)){ if(v < 0.12) set(x, y, T.flowers); continue; }
    if(v < 0.14) set(x, y, null, T.tree); else if(v < 0.18) set(x, y, null, T.tree2); else if(v < 0.21) set(x, y, null, T.bush);
    else if(v < 0.28) set(x, y, T.flowers); else if(v < 0.4) set(x, y, T.grass2);
  }
  const walkable = (x, y) => x >= 0 && y >= 0 && x < w && y < h && !SOLID.has(obj[y * w + x]) && !at.has(x + ',' + y);
  return { w, h, ground, obj, at, towns, walkable, townAt: (x, y) => towns.find(t => x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h) || null };
}
A.RPG_T = T;
A.buildRpgWorld = buildWorld;
})(window.PlayableApp);

(function(A){
'use strict';
const { $, $$, esc, store, go, setView, pathProgress, savePathProgress, markStageStatus, scheduleRecall, recallItems, recallIdeas,
  CONFIDENCE, OUTCOME, reviewItems, today, pathNextStep, rpgCount: count, RPG_T: T, buildRpgWorld } = A;

const TILE = 16, STEP_MS = 130, STILL_MS = 120;
const DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0], W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0] };
const tiles = new Image();
window.addEventListener('blur', () => { if(G) G.held = null; });
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
    <p class="small rpg-status" role="status" aria-live="polite"></p>
    <div class="rpg-stage" tabindex="0" aria-label="The world of this path. Arrow keys or W A S D walk; Enter talks to whoever is beside you." aria-describedby="rpgHelp">
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

function fit(){
  const cw = G.stage.clientWidth || 320;
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
function badge(x, y){
  const c = G.ctx; c.fillStyle = '#fff'; c.fillRect(x + 9, y - 1, 8, 8); c.strokeStyle = '#1b5e20'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(x + 10.5, y + 3); c.lineTo(x + 12.5, y + 5); c.lineTo(x + 15.5, y + 0.5); c.stroke();
}
function marker(x, y){ const c = G.ctx; c.fillStyle = '#ffd54f'; c.strokeStyle = '#3e2723'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 4, y - 7); c.lineTo(x + 12, y - 7); c.lineTo(x + 8, y - 2); c.closePath(); c.fill(); c.stroke(); }

function kick(){ if(!G.raf) G.raf = requestAnimationFrame(tick); }
function tick(now){
  G.raf = 0;
  if(!G.root.isConnected){ G = null; return; }
  if(G.anim && now - G.anim.t0 >= G.anim.dur){ G.anim = null; arrived(); }
  if(!G.anim && !openBox()){ const d = G.queue.length ? G.queue.shift() : G.held; if(d) step(d, now); }
  draw(now);
  if(G && (G.anim || ((G.held || G.queue.length) && !openBox()))) kick();
}
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
function say(first){
  const t = G.world.townAt(G.me.x, G.me.y), e = beside();
  const stop = s => /[.?!]$/.test(s) ? s : s + '.';
  const text = `${stop(t ? townName(t) : 'On the road')}${e ? ` Beside you: ${stop(nameOf(e))} Press Enter or Talk.` : ''}`;
  if(text !== G.said || first){ G.said = text; G.status.textContent = text; }
}

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

function travel(){
  const next = nextStageId();
  showBox(`<p class="rpg-who">Travel</p><p class="rpg-say" tabindex="-1" data-focus>Go to the way in of any town.</p>
    <div class="rpg-opts rpg-list">${G.world.towns.map(t => `<button type="button" data-rpg="go-town" data-k="${t.k}">${esc(townName(t))}${t.stage === next ? ' · next' : ''}${G.visited.has(t.stage) ? '' : ' · not visited yet'}</button>`).join('')}
      <button type="button" data-rpg="close">Stay here</button></div>`);
}

function bind(root){
  root.addEventListener('keydown', e => {
    if(!G || G.root !== root || e.ctrlKey || e.metaKey || e.altKey) return;
    const typing = e.target.matches('textarea, input, select');
    if(openBox()){
      if(e.key === 'Escape' && (!G.fight || G.fight.phase === 'end')){ e.preventDefault(); closeBox(); }
      else if(!typing && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === 'ArrowLeft')){
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

PlayableContent.put("code","rpg",null,"8b8298a9");
