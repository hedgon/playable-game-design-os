(function(A){
'use strict';
const { $, $$, esc, ACTIONS, DOM, store } = A;
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const pct = x => Math.round(x * 100);
const btn = (act, label, cls, extra) => `<button type="button" class="${cls || 'btn sm'}" data-action="demo" data-do="${act}"${extra || ''}>${label}</button>`;
const slider = (name, label, min, max, step, val, unit) => `<label class="demo-set"><span>${label} <b data-v="${name}" data-unit="${unit || ''}">${val}${unit || ''}</b></span><input type="range" data-set="${name}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
const bar = (cls, label) => `<div class="demo-bar ${cls}"><span>${label}</span><i></i><b></b></div>`;
const setBar = (fig, cls, frac, text) => { const el = $('.demo-bar.' + cls, fig); $('i', el).style.width = Math.max(0, Math.min(100, frac * 100)) + '%'; $('b', el).textContent = text; };

const KINDS = {};

const HIT_LABEL = { knock: 'Knockback', stop: 'Hit stop', shake: 'Shake', flash: 'Flash', squash: 'Squash' };
KINDS.hit = {
  t: 'The same hit, layer by layer',
  init: () => ({ knock: false, stop: false, shake: false, flash: false, squash: false, hp: 5 }),
  html: s => `<div class="demo-stage hit-stage"><i class="hit-you"></i><i class="hit-foe"></i></div>${bar('hp', 'Health')}
    <div class="row">${btn('hit', 'Hit', 'btn primary')}${Object.keys(HIT_LABEL).map(k => btn('toggle', HIT_LABEL[k], 'chip lnk', ` data-k="${k}" aria-pressed="false"`)).join('')}</div>`,
  sync: (fig, s) => setBar(fig, 'hp', s.hp / 5, s.hp + ' of 5'),
  act(fig, s, what, el){
    if(what === 'toggle'){ const k = el.dataset.k; s[k] = !s[k]; el.classList.toggle('on', s[k]); el.setAttribute('aria-pressed', s[k]); return; }
    s.hp = s.hp > 1 ? s.hp - 1 : 5;
    const you = $('.hit-you', fig), foe = $('.hit-foe', fig), hit = 90, hold = s.stop ? 110 : 0, after = hit + hold;
    if(!calm()){
      you.animate([{ transform: 'none' }, { transform: 'translateX(56px)', offset: hit / (after + 160) }, { transform: 'translateX(56px)', offset: after / (after + 160) }, { transform: 'none' }], { duration: after + 160, easing: 'linear' });
      if(s.knock) foe.animate([{ transform: 'none' }, { transform: 'translateX(14px)' }, { transform: 'none' }], { duration: 180, delay: after, easing: 'ease-out' });
      if(s.flash) foe.animate([{ filter: 'brightness(2.4) saturate(0)' }, { filter: 'none' }], { duration: 120 + hold, delay: hit });
      if(s.squash) foe.animate([{ transform: 'scale(.72,1.22)' }, { transform: 'scale(1.1,.92)', offset: .55 }, { transform: 'none' }], { duration: 260, delay: after, easing: 'ease-out', composite: 'add' });
      if(s.shake) $('.hit-stage', fig).animate([5, -4, 3, -2, 1, 0].map((d, i) => ({ transform: `translate(${d}px,${i % 2 ? d / 2 : -d / 2}px)` })), { duration: 240, delay: after });
    }
    this.sync(fig, s);
  },
  say(s){
    const on = Object.keys(HIT_LABEL).filter(k => s[k]);
    return (on.length ? 'Layers on: ' + on.map(k => HIT_LABEL[k].toLowerCase()).join(', ') + '.' : 'No layers: the block that is hit does not react, and only the health bar moves.') + ' Health ' + s.hp + ' of 5.' + (on.length === Object.keys(HIT_LABEL).length ? ' Same rules, same damage: it only feels heavier.' : '');
  }
};

function jumpArc(s){
  const pts = []; let y = 0, vy = s.v, top = 0, rise = 0;
  for(let f = 0; f < 400; f++){ pts.push(y); vy -= vy > 0 ? s.up : s.down; y += vy; if(y > top){ top = y; rise = f + 1; } if(y <= 0) break; }
  pts.push(0);
  return { pts, top, rise, frames: pts.length - 1 };
}
KINDS.jump = {
  t: 'Tune a jump',
  init: () => ({ v: 9, up: .45, down: .9 }),
  html: s => `<div class="demo-stage jump-stage"><svg viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true"><polyline fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 4" vector-effect="non-scaling-stroke" points=""/></svg><i class="jump-dot"></i></div>
    ${slider('v', 'Take-off speed', 5, 14, .5, s.v, ' px/frame')}${slider('up', 'Gravity going up', .2, 1.2, .05, s.up, ' px/frame²')}${slider('down', 'Gravity coming down', .2, 2, .05, s.down, ' px/frame²')}
    <div class="row">${btn('jump', 'Jump', 'btn primary')}</div>`,
  layout(s){ const a = jumpArc(s), sx = Math.min(3, 290 / a.frames), sy = Math.min(1, 108 / Math.max(1, a.top)); return { a, at: f => [5 + f * sx, a.pts[f] * sy] }; },
  sync(fig, s){ const { a, at } = this.layout(s); $('polyline', fig).setAttribute('points', a.pts.map((_, f) => { const [x, y] = at(f); return x.toFixed(1) + ',' + (118 - y).toFixed(1); }).join(' ')); },
  act(fig, s){
    if(calm()) return;
    const { a, at } = this.layout(s);
    $('.jump-dot', fig).animate(a.pts.map((_, f) => { const [x, y] = at(f); return { left: (x / 300 * 100) + '%', bottom: (2 / 120 * 100 + y / 120 * 100) + '%' }; }), { duration: a.frames * 1000 / 60, easing: 'linear' });
  },
  say(s){ const a = jumpArc(s); return `Peak ${Math.round(a.top)} px after ${a.rise} frames, down in ${a.frames - a.rise}: ${a.frames} frames in the air (${Math.round(a.frames * 1000 / 60)} ms at 60 frames a second).` + (s.down > s.up * 1.5 ? ' It rises gently and falls fast.' : s.down < s.up ? ' It hangs on the way down.' : ''); }
};

KINDS.telegraph = {
  t: 'How long must a wind-up be?',
  init: () => ({ w: 400, phase: 'idle', t0: 0, tries: 0, dodged: 0, last: 'Press Start, wait for the block to light up, then Dodge before it strikes.', timer: 0 }),
  html: s => `<div class="demo-stage tele-stage"><i class="tele-foe"><b></b></i><span class="tele-cue" hidden>Wind-up!</span></div>
    ${slider('w', 'Wind-up', 100, 700, 50, s.w, ' ms')}<div class="row">${btn('start', 'Start', 'btn')}${btn('dodge', 'Dodge', 'btn primary')}</div>`,
  sync(){},
  rest(fig, s, text){ clearTimeout(s.timer); s.phase = 'idle'; s.tries++; s.last = text; $('.tele-cue', fig).hidden = true; $('.tele-foe', fig).classList.remove('cue'); $('.tele-foe b', fig).getAnimations().forEach(a => a.cancel()); },
  act(fig, s, what){
    if(what === 'start'){
      if(s.phase !== 'idle') return;
      s.phase = 'wait'; s.last = 'Wait for it…';
      s.timer = setTimeout(() => {
        s.phase = 'cue'; s.t0 = performance.now(); s.cue = s.w; $('.tele-cue', fig).hidden = false; $('.tele-foe', fig).classList.add('cue');
        if(!calm()) $('.tele-foe b', fig).animate([{ width: '0%' }, { width: '100%' }], { duration: s.cue, easing: 'linear', fill: 'forwards' });
        s.timer = setTimeout(() => { this.rest(fig, s, `Hit: a ${s.cue} ms wind-up was too short for you this time.`); out(fig, this.say(s)); }, s.cue);
        out(fig, 'Wind-up!');
      }, 700 + Math.random() * 1200);
    } else if(s.phase === 'wait') this.rest(fig, s, 'Too early: you moved before the cue. That is a guess, not a read.');
    else if(s.phase === 'cue'){ const r = Math.round(performance.now() - s.t0); s.dodged++; this.rest(fig, s, `Dodged ${r} ms into a ${s.cue} ms wind-up.`); }
    else s.last = 'Press Start first.';
  },
  say: s => s.last + (s.tries ? ` Dodged ${s.dodged} of ${s.tries}.` : '')
};

const luck = n => ({ gain: 10 * (n + 1), risk: Math.min(.9, .1 * (n + 1)) });
KINDS.pushluck = {
  t: 'Push on, or bank it?',
  init: () => ({ n: 0, pot: 0, bank: 0, odds: false, last: '' }),
  html: () => `${bar('pot', 'At risk')}${bar('bank', 'Banked')}<div class="row">${btn('push', 'Push on', 'btn primary')}${btn('bank', 'Bank it', 'btn')}${btn('odds', 'Show the odds', 'chip lnk', ' aria-pressed="false"')}</div>`,
  sync(fig, s){ setBar(fig, 'pot', s.pot / 200, String(s.pot)); setBar(fig, 'bank', s.bank / 400, String(s.bank)); },
  act(fig, s, what, el){
    const { gain, risk } = luck(s.n);
    if(what === 'odds'){ s.odds = !s.odds; el.classList.toggle('on', s.odds); el.setAttribute('aria-pressed', s.odds); }
    else if(what === 'bank'){ s.last = s.pot ? `Banked ${s.pot}.` : 'Nothing to bank.'; s.bank += s.pot; s.pot = 0; s.n = 0; }
    else if(Math.random() < risk){ s.last = `Lost ${s.pot} at a ${pct(risk)}% risk.`; s.pot = 0; s.n = 0; }
    else { s.pot += gain; s.n++; s.last = `Won ${gain}.`; }
    this.sync(fig, s);
  },
  say(s){ const { gain, risk } = luck(s.n), ev = Math.round((1 - risk) * gain - risk * s.pot); return `${s.last} Next push: +${gain} at a ${pct(risk)}% risk of losing the ${s.pot} at risk.` + (s.odds ? ` On average that push is worth ${ev > 0 ? '+' : ''}${ev}.` : ''); }
};

function econ(s){
  const bal = [], buys = []; let b = 0, price = s.price;
  for(let m = 1; m <= 30; m++){ b += s.inc * (1 - s.sink / 100); if(b >= price){ b -= price; buys.push(m); price *= 1 + s.grow / 100; } bal.push(b); }
  return { bal, buys, price };
}
KINDS.economy = {
  t: 'Run a thirty-minute economy',
  init: () => ({ inc: 100, sink: 30, price: 600, grow: 20 }),
  html: s => `<div class="demo-stage econ-stage" aria-hidden="true">${Array.from({ length: 30 }, () => '<i></i>').join('')}</div>
    ${slider('inc', 'Earned a minute', 20, 300, 10, s.inc, '')}${slider('sink', 'Spent on upkeep', 0, 90, 5, s.sink, '%')}${slider('price', 'Price of the thing wanted', 100, 3000, 100, s.price, '')}${slider('grow', 'Each one costs more by', 0, 100, 5, s.grow, '%')}`,
  sync(fig, s){ const e = econ(s), top = Math.max(1, ...e.bal); $$('.econ-stage i', fig).forEach((el, i) => { el.style.height = Math.max(2, e.bal[i] / top * 100) + '%'; el.classList.toggle('buy', e.buys.includes(i + 1)); }); },
  act(){},
  say(s){
    const e = econ(s), n = e.buys.length;
    if(!n) return 'Nothing is bought in thirty minutes: the price is a wall, not a goal.';
    const gap = n > 1 ? e.buys[n - 1] - e.buys[n - 2] : 0;
    return `First purchase at minute ${e.buys[0]}, ${n} in the session` + (n > 1 ? `, the last two ${gap} minute${gap === 1 ? '' : 's'} apart.` : '.') + (n >= 15 ? ' Buying every other minute is not a decision any more: the sink is too weak.' : gap >= 10 ? ` A wait of ${gap} minutes is a third of the session or more: the player may leave before the next one.` : '');
  }
};

KINDS.rps = {
  t: 'Change what a win is worth',
  init: () => ({ a: 2, b: 1, c: 1 }),
  html: s => `${bar('r', 'Rock')}${bar('p', 'Paper')}${bar('s', 'Scissors')}
    ${slider('a', 'A win with rock is worth', 1, 5, 1, s.a, '')}${slider('b', 'A win with paper is worth', 1, 5, 1, s.b, '')}${slider('c', 'A win with scissors is worth', 1, 5, 1, s.c, '')}`,
  mix: s => { const t = s.a + s.b + s.c; return { r: s.c / t, p: s.a / t, s: s.b / t }; },
  sync(fig, s){ const m = this.mix(s); for(const k of ['r', 'p', 's']) setBar(fig, k, m[k], pct(m[k]) + '%'); },
  act(){},
  say(s){
    const m = this.mix(s), names = { r: 'Rock', p: 'Paper', s: 'Scissors' }, max = Math.max(m.r, m.p, m.s), tops = Object.keys(m).filter(k => m[k] === max);
    return `Balanced play: rock ${pct(m.r)}%, paper ${pct(m.p)}%, scissors ${pct(m.s)}%.` + (tops.length === 3 ? ' Equal stakes, equal picks.' : tops.length === 2 ? ` ${names[tops[0]]} and ${names[tops[1]].toLowerCase()} are picked most, and equally: the wins they beat are worth the same.` : ` ${names[tops[0]]} is picked most without having the most valuable win: it beats the option that has it.`);
  }
};

const SAMPLE_N = [100, 300, 1000, 3000, 10000, 30000];
KINDS.sample = {
  t: 'How many games before a win rate means something?',
  init: () => ({ p: 52, ni: 2, runs: [] }),
  fmt: (name, v) => name === 'ni' ? SAMPLE_N[v].toLocaleString('en-GB') + ' games' : v + '%',
  html: s => `<div class="demo-stage sample-stage" aria-hidden="true"><em class="sample-band"></em><em class="sample-mid"></em></div>
    ${slider('p', 'True win rate', 45, 58, .5, s.p, '%')}${slider('ni', 'Sample', 0, 5, 1, s.ni, '')}<div class="row">${btn('run', 'Measure it 20 times', 'btn primary')}</div>`,
  margin: s => 2 * Math.sqrt(s.p / 100 * (1 - s.p / 100) / SAMPLE_N[s.ni]) * 100,
  x: v => Math.max(0, Math.min(100, (v - 40) / 24 * 100)),   // the stage shows 40% to 64%
  sync(fig, s){
    const st = $('.sample-stage', fig), m = this.margin(s), band = $('.sample-band', st);
    band.style.left = this.x(s.p - m) + '%'; band.style.width = (this.x(s.p + m) - this.x(s.p - m)) + '%'; $('.sample-mid', st).style.left = this.x(50) + '%';
    $$('i', st).forEach(el => el.remove());
    s.runs.forEach((v, i) => { const d = document.createElement('i'); d.style.left = this.x(v) + '%'; d.style.top = (8 + i * 4.2) + '%'; st.appendChild(d); });
  },
  act(fig, s){
    const sd = Math.sqrt(s.p / 100 * (1 - s.p / 100) / SAMPLE_N[s.ni]) * 100;
    s.runs = Array.from({ length: 20 }, () => s.p + sd * Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random()));
    this.sync(fig, s);
  },
  say(s){
    const m = this.margin(s), below = s.runs.filter(v => v < 50).length, wrong = s.p < 50 ? 20 - below : below;
    return `At ${SAMPLE_N[s.ni].toLocaleString('en-GB')} games the margin of error is about ±${m.toFixed(1)} points.` + (!s.runs.length ? ' Measure it and see how far twenty honest readings spread.' : s.p === 50 ? ` ${20 - below} of 20 measurements read above 50% and ${below} below, with no real difference to find.` : ` ${wrong} of 20 measurements landed on the wrong side of 50%.`);
  }
};

const HICK_WORDS = ['Jump', 'Dash', 'Block', 'Parry', 'Craft', 'Trade', 'Build', 'Scout', 'Heal', 'Steal', 'Climb', 'Swim', 'Shoot', 'Throw', 'Hide', 'Talk', 'Cook', 'Fish', 'Mine', 'Plant', 'Ride', 'Glide', 'Push', 'Pull', 'Lock', 'Open', 'Read', 'Map', 'Sell', 'Buy', 'Rest', 'Run'];
KINDS.hick = {
  t: 'Find it among more and more options',
  init: () => ({ n: 8, target: '', t0: 0, results: [], last: 'Press Start, then pick the named action as fast as you can.' }),
  html: s => `<div class="hick-find">&nbsp;</div><div class="hick-grid"></div>${slider('n', 'Options on screen', 4, 32, 4, s.n, '')}<div class="row">${btn('start', 'Start', 'btn primary')}</div>`,
  sync(){},
  act(fig, s, what, el){
    const grid = $('.hick-grid', fig), find = $('.hick-find', fig);
    if(what === 'start'){
      const words = HICK_WORDS.slice().sort(() => Math.random() - .5).slice(0, s.n);
      s.target = words[Math.floor(Math.random() * words.length)]; s.shown = s.n;
      grid.innerHTML = words.map(w => btn('pick', w, 'chip lnk', ` data-w="${w}"`)).join(''); find.textContent = 'Find: ' + s.target; s.t0 = performance.now(); s.last = 'Find: ' + s.target + '.';
    } else if(el.dataset.w === s.target){
      const ms = Math.round(performance.now() - s.t0); s.results.push([s.shown, ms]); s.last = `Found among ${s.shown} in ${ms} ms.`; s.target = ''; grid.innerHTML = ''; find.innerHTML = '&nbsp;';
      $('[data-do="start"]', fig).focus();   // the picked button is gone: a keyboard user continues from Start
    } else s.last = 'Not that one: find ' + s.target + '.';
  },
  say: s => s.last + (s.results.length > 1 ? ' So far: ' + s.results.slice(-6).map(([n, ms]) => `${n} options ${ms} ms`).join(', ') + '.' : '')
};

KINDS.odds = {
  t: 'What a drop rate means for the unlucky',
  init: () => ({ p: 2, pity: 0 }),
  fmt: (name, v) => name === 'pity' ? (v ? 'at ' + v + ' pulls' : 'none') : v + '%',
  html: s => `${bar('med', 'Half of players')}${bar('p90', 'Nine in ten')}${bar('p99', 'The unluckiest 1%')}${slider('p', 'Drop rate', .5, 10, .5, s.p, '%')}${slider('pity', 'Guaranteed', 0, 200, 10, s.pity, '')}`,
  need(s, share){ const n = Math.ceil(Math.log(1 - share) / Math.log(1 - s.p / 100)); return s.pity ? Math.min(n, s.pity) : n; },
  sync(fig, s){ const top = this.need(s, .99); for(const [k, q] of [['med', .5], ['p90', .9], ['p99', .99]]){ const n = this.need(s, q); setBar(fig, k, n / top, n + ' pulls'); } },
  act(){},
  say(s){
    const reach = s.pity ? Math.pow(1 - s.p / 100, s.pity - 1) * 100 : 0;
    return `At ${s.p}% half of players have it within ${this.need(s, .5)} pulls, nine in ten within ${this.need(s, .9)}, and one in a hundred needs ${this.need(s, .99)}` + (s.pity ? `. The guarantee at ${s.pity} is where ${reach < 1 ? 'fewer than 1' : Math.round(reach)}% of players end up.` : ' or more: without a guarantee there is no worst case.');
  }
};

const nf = (x, d = 0) => x.toLocaleString('en-GB', { maximumFractionDigits: d });
const cap = w => w[0].toUpperCase() + w.slice(1);
const count = (n, many) => nf(n, 1) + ' ' + (n === 1 ? many.replace(/s$/, '') : many);
const calc = (t, sliders, out, fmt) => ({
  t, fmt,
  init: (topic, spec) => Object.assign({ words: (spec && spec.w) || [] }, ...sliders.map(a => ({ [a[0]]: a[5] }))),
  html: s => out(s).bars.map((b, i) => bar('c' + i, b[0])).join('') + sliders.map(([n, l, ...rest]) => slider(n, typeof l === 'function' ? l(s) : l, ...rest)).join(''),
  sync(fig, s){ out(s).bars.forEach((b, i) => setBar(fig, 'c' + i, b[1], b[2])); },
  act(){},
  say: s => out(s).say
});

KINDS.pairs = calc('Every part meets every other part', [['n', s => 'How many ' + (s.words[0] || 'parts'), 2, 24, 1, 6, '']], s => {
  const p = s.n * (s.n - 1) / 2, w = s.words[0] || 'parts';
  return { bars: [[cap(w), s.n / 24, String(s.n)], ['Pairs', p / 276, String(p)]], say: `${s.n} ${w} make ${count(p, 'pairs')} that can interact. Adding one more adds ${s.n} new pairs, not one.` };
});

KINDS.combos = calc('Content multiplies', [['a', s => cap(s.words[0] || 'enemy types'), 1, 8, 1, 4, ''], ['b', s => cap(s.words[1] || 'weapons'), 1, 8, 1, 3, ''], ['c', s => cap(s.words[2] || 'arenas'), 1, 6, 1, 2, '']], s => {
  const [A, B, C, R, P] = [s.words[0] || 'enemy types', s.words[1] || 'weapons', s.words[2] || 'arenas', s.words[3] || 'situations', s.words[4] || 'pieces of content'];
  const n = s.a * s.b * s.c, made = s.a + s.b + s.c, min = Math.min(s.a, s.b, s.c);
  return { bars: [[cap(P), made / 22, String(made)], [cap(R), n / 384, nf(n)]], say: `${count(s.a, A)} × ${count(s.b, B)} × ${count(s.c, C)}: ${count(n, R)}` + (s.words.length ? `. One more in the shortest list adds ${nf(n / min)}.` : ` from ${made} ${P}. One more in the shortest list adds ${nf(n / min)}; whether they play differently is the design work.`) };
});

KINDS.ttk = calc('Damage only matters at a hit boundary', [['d', 'Damage per hit', 5, 100, 1, 34, ''], ['r', 'Hits a second', .5, 10, .5, 2, ''], ['h', 'Enemy health', 50, 1000, 10, 100, '']], s => {
  const hits = Math.ceil(s.h / s.d), ttk = (hits - 1) / s.r, next = Math.ceil(s.h / (hits - 1 || 1));
  return { bars: [['Hits to kill', hits / 20, String(hits)], ['Time to kill', ttk / 10, ttk.toFixed(2) + ' s']], say: `${hits} hit${hits === 1 ? '' : 's'} to kill, ${ttk.toFixed(2)} s from the first hit to the last.` + (hits > 1 ? ` Damage has to reach ${next} before it saves a hit: every point below that changes nothing.` : ' One hit: more damage changes nothing at all.') };
});

KINDS.funnel = calc('Every step loses a few', [['n', 'Steps in a row', 1, 20, 1, 6, ''], ['r', 'Share that gets through each step', 5, 100, 1, 90, '%']], s => {
  const w = s.words[0] || 'players', r = s.r / 100, end = Math.pow(r, s.n), half = Math.pow(r, Math.ceil(s.n / 2));
  return { bars: [['After step 1', r, nf(r * 1000)], ['Halfway', half, nf(half * 1000)], ['At the end', end, nf(end * 1000)]], say: `Of 1,000 ${w} that start, ${nf(end * 1000)} get through ${s.n === 1 ? 'the one step' : `all ${s.n} steps`} at ${s.r}% each.` + (s.r === 100 ? ' Nothing is lost at any step.' : ` Removing one step saves ${nf((Math.pow(r, s.n - 1) - end) * 1000)} of them, and no single step looks like the problem.`) };
});

KINDS.loop = calc('What a loop costs when it repeats', [['l', 'One loop takes', 5, 300, 5, 30, ' s'], ['d', 'Share of it spent waiting', 0, 90, 1, 15, '%'], ['m', 'Session', 5, 120, 5, 20, ' min']], s => {
  const n = Math.floor(s.m * 60 / s.l), each = s.l * s.d / 100, wait = n * each / 60;
  return { bars: [['Playing', 1 - s.d / 100, (100 - s.d) + '%'], ['Waiting', s.d / 100, s.d + '%']], say: `${n} loop${n === 1 ? '' : 's'} in a ${s.m}-minute session. ${nf(each, 1)} s of waiting in each adds up to ${count(+wait.toFixed(1), 'minutes')} of the session that ${+wait.toFixed(1) === 1 ? 'is' : 'are'} not play.` };
});

KINDS.estimate = calc('Three guesses instead of one', [['o', 'If all goes well', 1, 30, 1, 4, ' days'], ['m', 'Most likely', 1, 60, 1, 6, ' days'], ['p', 'If it goes badly', 1, 120, 1, 20, ' days']], s => {
  const e = (s.o + 4 * s.m + s.p) / 6, sd = (s.p - s.o) / 6, bars = [['Most likely', s.m / 120, s.m + ' days'], ['Expected', e / 120, e.toFixed(1) + ' days'], ['Expected plus two spreads', (e + 2 * sd) / 120, (e + 2 * sd).toFixed(1) + ' days']];
  if(s.o > s.m || s.p < s.m) return { bars, say: 'Put the three in order first: the good case no later than the likely one, the bad case no earlier.' };
  return { bars, say: `Expected ${e.toFixed(1)} days (best, plus four times likely, plus worst, over six), spread ${sd.toFixed(1)}.` + (e > s.m + .05 ? ` The plan says ${s.m}; the average outcome is ${(e - s.m).toFixed(1)} days later, because the bad case is further away than the good one.` : ' Here the bad case is no further away than the good one, which is rare: look again at the bad case.') };
});

KINDS.risk = calc('What a risk costs on average', [['p', 'Chance it happens', 5, 95, 5, 30, '%'], ['i', 'Days lost if it does', 1, 90, 1, 30, ' days'], ['c', 'Days to find out now', 0, 30, 1, 3, ' days']], s => {
  const e = s.p / 100 * s.i;
  return { bars: [['Exposure', e / 90, e.toFixed(1) + ' days'], ['Cost of finding out now', s.c / 90, s.c + ' days']], say: `A ${s.p}% chance of losing ${s.i} days is ${e.toFixed(1)} days of exposure. ` + (s.c < e ? `Spending ${s.c} to find out now costs less than carrying it does on average: do it first.` : `Finding out costs ${s.c}, which is no less than the risk costs on average: accept it, or find a cheaper test.`) };
});

KINDS.cycles = calc('How many tries before the date?', [['h', 'One full loop takes', .25, 200, .25, 16, ' h'], ['wk', 'Weeks left', 1, 52, 1, 8, '']], s => {
  const n = Math.floor(s.wk * 40 / s.h), n2 = Math.floor(s.wk * 40 / (s.h / 2));
  return { bars: [['Tries', n / Math.max(1, n2), String(n)], ['At half the loop', 1, String(n2)]], say: `${nf(n)} tries before the date, at 40 working hours a week. Halving the loop to ${s.h / 2} h gives ${nf(n2)}: the speed of the loop is the number of chances to be wrong and fix it.` };
});

KINDS.amdahl = calc('Speed up one part, and the rest becomes the job', [['f', 'Share of the work that gets faster', 5, 95, 5, 30, '%'], ['k', 'How much faster that part gets', 1.5, 20, .5, 5, '×']], s => {
  const f = s.f / 100, t = 1 - f + f / s.k;
  return { bars: [['Time before', 1, '100%'], ['Time after', t, pct(t) + '%'], ['If that part were instant', 1 - f, pct(1 - f) + '%']], say: `Making ${s.f}% of the work ${s.k}× faster makes the whole ${(1 / t).toFixed(2)}× faster. Make that part instant and the limit is ${(1 / (1 - f)).toFixed(2)}×: the other ${100 - s.f}% is now the whole job.` };
});

KINDS.baserate = calc('Who gets flagged?', [['b', s => 'Share that really ' + (s.words[1] || 'have the problem'), .5, 20, .5, 1, '%'], ['d', 'Of those, the share the check catches', 50, 100, 1, 95, '%'], ['f', 'Share of the rest it flags by mistake', .1, 10, .1, 2, '%']], s => {
  const who = s.words[0] || 'cases', bad = 10000 * s.b / 100, tp = bad * s.d / 100, fp = (10000 - bad) * s.f / 100, share = fp / (tp + fp);
  return { bars: [['Flagged rightly', 1 - share, nf(tp)], ['Flagged wrongly', share, nf(fp)]], say: `Of 10,000 ${who}, ${nf(bad)} really ${s.words[1] || 'have the problem'}. The check flags ${nf(tp)} of them and ${nf(fp)} of the others: ${pct(share)}% of everything flagged is a false alarm.` };
});

KINDS.tick = calc('What an update rate costs', [['n', 'Players in the match', 2, 100, 1, 10, ''], ['hz', 'Updates a second', 10, 128, 1, 30, ''], ['b', 'Bytes per player per update', 8, 200, 4, 40, '']], s => {
  const per = s.n * s.b * s.hz * 8 / 1000, total = per * s.n / 1000;
  return { bars: [['To each client', per / 2000, nf(per) + ' kbit/s'], ['From the server', total / 200, nf(total, 2) + ' Mbit/s']], say: `Each client is sent ${s.n} players × ${s.b} bytes × ${s.hz} times a second: ${nf(per)} kbit/s, before packet headers. The server sends that to all ${s.n}: ${nf(total, 2)} Mbit/s. Double the players and the total is four times as much.` };
});

KINDS.rollback = calc('How far back does the game rewind?', [['ping', 'Round trip between the players', 0, 300, 10, 100, ' ms'], ['d', 'Input delay', 0, 9, 1, 2, ' frames']], s => {
  const late = Math.ceil(s.ping / 2 / (1000 / 60)), back = Math.max(0, late - s.d), own = Math.round(s.d * 1000 / 60);
  return { bars: [['Rewound after a wrong guess', back / 9, back + ' frames'], ['Your own button waits', s.d / 9, own + ' ms']], say: `At 60 frames a second the other player’s input arrives ${late} frame${late === 1 ? '' : 's'} after it was pressed. With ${s.d} frame${s.d === 1 ? "" : "s"} of input delay the game rewinds ${back} frame${back === 1 ? "" : "s"} when it guessed wrong` + (back ? ', and the player sees the correction.' : `: nothing on screen is ever corrected, and every press answers ${own} ms late.`) };
});

const CCU = [1000, 5000, 20000, 100000, 500000];
KINDS.capacity = calc('From players to servers to a bill', [['c', 'Players online at the peak', 0, 4, 1, 2, ''], ['per', 'Players one server holds', 50, 2000, 50, 500, ''], ['head', 'Spare room kept', 0, 100, 10, 30, ''], ['cost', 'One server for an hour', .05, 2, .05, .2, '']], s => {
  const n = Math.ceil(CCU[s.c] / s.per), m = Math.ceil(n * (1 + s.head / 100)), bill = m * s.cost * 730;
  return { bars: [['Servers needed', n / m, nf(n)], ['With spare room', 1, nf(m)]], say: `${nf(CCU[s.c])} players at ${nf(s.per)} a server is ${nf(n)} server${n === 1 ? '' : 's'}, ${nf(m)} with ${s.head}% spare: about $${nf(bill)} a month if they all run all day. The peak sets the bill unless servers are added and removed with the load.` };
}, (name, v) => name === 'c' ? nf(CCU[v]) : name === 'head' ? v + '%' : name === 'cost' ? '$' + v : nf(v));

const NINES = [99, 99.5, 99.9, 99.95, 99.99];
KINDS.uptime = calc('What the nines allow', [['a', 'Availability of one service', 0, 4, 1, 2, ''], ['n', 'Services a request needs in a row', 1, 12, 1, 4, '']], s => {
  const a = NINES[s.a] / 100, all = Math.pow(a, s.n), min = x => (1 - x) * 30 * 24 * 60, t = m => m >= 120 ? nf(m / 60, 1) + ' hours' : nf(m, 1) + ' minutes';
  return { bars: [['One service down', min(a) / 1800, t(min(a))], ['The request failing', min(all) / 1800, t(min(all))]], say: `${NINES[s.a]}% allows ${t(min(a))} of downtime in a 30-day month. A request that needs ${s.n} such service${s.n === 1 ? '' : 's'} in a row, failing independently, gets ${(all * 100).toFixed(2)}%: ${t(min(all))}. Every dependency spends from the same budget.` };
}, (name, v) => name === 'a' ? NINES[v] + '%' : String(v));

KINDS.cache = calc('What a hit rate buys', [['h', 'Hit rate', 0, 99, 1, 80, '%'], ['c', 'A hit takes', .2, 5, .2, 1, ' ms'], ['o', 'A miss takes', 5, 500, 5, 60, ' ms']], s => {
  const h = s.h / 100, mean = h * s.c + (1 - h) * s.o;
  return { bars: [['Average read', mean / s.o, nf(mean, 1) + ' ms'], ['Reads reaching the database', 1 - h, (100 - s.h) + '%']], say: `With a hit rate of ${s.h}% the average read takes ${nf(mean, 1)} ms and ${100 - s.h}% of reads still reach the database. Going from 90% to 99% cuts that load ten times, not by a tenth.` };
});

KINDS.tail = calc('One slow call in a hundred', [['p', 'Calls that are slow', .1, 5, .1, 1, '%'], ['n', 'Calls one request waits for', 1, 100, 1, 20, '']], s => {
  const x = 1 - Math.pow(1 - s.p / 100, s.n);
  return { bars: [['One call slow', s.p / 100, s.p + '%'], ['The request slow', x, nf(x * 100, 1) + '%']], say: `If ${s.p}% of calls are slow, independently, and a request waits for ${s.n} of them, ${nf(x * 100, 1)}% of requests are slow.` + (s.n > 1 ? ` The rare case of one service is the common case of the page that calls it ${s.n} times.` : ' Add calls and watch the rare case become the common one.') };
});

KINDS.scope = calc('Does it fit?', [['f', 'Features', 3, 40, 1, 14, ''], ['e', 'Person-weeks each', .5, 8, .5, 3, ''], ['p', 'People', 1, 20, 1, 4, ''], ['t', 'Weeks to the date', 4, 52, 1, 12, ''], ['u', 'Share of time that goes to features', 30, 90, 5, 60, '%']], s => {
  const need = s.f * s.e, have = s.p * s.t * s.u / 100, top = Math.max(need, have), cut = Math.ceil((need - have) / s.e);
  return { bars: [['Asked for', need / top, nf(need, 1)], ['Available', have / top, nf(have, 1)]], say: `${s.f} features × ${s.e} = ${nf(need, 1)} person-weeks. ${s.p === 1 ? '1 person' : s.p + ' people'} × ${s.t} weeks × ${s.u}% = ${nf(have, 1)}. ` + (need > have ? `Over by ${nf(need - have, 1)}: ${cut === 1 ? '1 feature comes' : cut + ' features come'} out, or the date moves. Choose which now, while it is a choice.` : `It fits, with ${nf(have - need, 1)} person-weeks spare for what nobody has listed yet.`) };
});

KINDS.wip = calc('Start less, finish sooner', [['wip', s => cap(s.words[0] || 'things') + ' ' + (s.words[1] || 'in progress'), 1, 200, 1, 12, ''], ['th', 'Finished a week', 1, 50, 1, 4, '']], s => {
  const lt = s.wip / s.th, state = s.words[1] || 'in progress';
  return { bars: [['Average wait for one', lt / 40, count(+lt.toFixed(1), 'weeks')], ['With half as many ' + state, lt / 80, count(+(lt / 2).toFixed(1), 'weeks')]], say: `${count(s.wip, s.words[0] || 'things')} ${state} and ${s.th} finished a week: in a steady flow each one takes ${count(+lt.toFixed(1), 'weeks')} to get through. Halve what is ${state} and the wait halves, without anyone working faster.` };
});

KINDS.treadmill = calc('Can content keep up with players?', [['c', 'Person-weeks to make one hour of play', 1, 40, 1, 10, ''], ['p', 'People making content', 1, 60, 1, 12, ''], ['u', 'Hours a keen player plays a week', 1, 30, 1, 8, '']], s => {
  const made = s.p / s.c, top = Math.max(made, s.u);
  return { bars: [['Made in a week', made / top, nf(made, 1) + ' h'], ['Played in a week', s.u / top, s.u + ' h']], say: `The team makes ${nf(made, 1)} hours of play a week and a keen player uses ${s.u}. ` + (made < s.u ? `Players finish it ${nf(s.u / made, 1)} times faster than it is made: new content alone cannot hold them, so something has to be worth replaying.` : 'Content keeps pace here: check what it costs to keep doing that every week.') };
});

KINDS.creep = calc('A little stronger, every release', [['g', 'Each release is stronger by', 0, 30, 1, 8, '%'], ['n', 'Releases a year', 1, 12, 1, 4, ''], ['y', 'Years', 1, 6, 1, 3, '']], s => {
  const x = Math.pow(1 + s.g / 100, s.n * s.y);
  return { bars: [['The newest item', 1, nf(x, 2) + '×'], ['A launch item beside it', 1 / x, pct(1 / x) + '%']], say: `After ${s.n * s.y} releases at +${s.g}% each, the newest item is ${nf(x, 2)}× a launch one, and launch content is worth ${pct(1 / x)}% of the best.` + (s.g ? ' Nobody chose that number: it is what a small, reasonable step compounds to.' : ' No growth: new content has to be different instead of stronger.') };
});

const WORDS = [200, 1000, 5000, 20000, 100000];
KINDS.tokens = calc('What a prompt costs when it runs all day', [['wd', 'Words sent with each call', 0, 4, 1, 2, ''], ['n', 'Calls a day', 100, 50000, 100, 2000, ''], ['price', 'Price per million input tokens', .1, 15, .1, 3, '']], s => {
  const tok = WORDS[s.wd] * 4 / 3, day = tok * s.n / 1e6 * s.price;
  return { bars: [['Tokens in each call', tok / 133334, nf(tok)], ['Cost of a day', Math.min(1, day / 1000), '$' + nf(day, 2)]], say: `${nf(WORDS[s.wd])} English words is roughly ${nf(tok)} tokens (about three words to four tokens). ${nf(s.n)} calls a day at $${s.price} per million comes to about $${nf(day, 2)} a day, $${nf(day * 30)} a month, before any output is paid for.` };
}, (name, v) => name === 'wd' ? nf(WORDS[v]) : name === 'price' ? '$' + v : nf(v));

KINDS.camera = calc('Where does the character sit on screen?', [['v', 'Run speed', 1, 12, .5, 6, ' px/frame'], ['k', 'Gap the camera closes each frame', 2, 100, 1, 10, '%'], ['la', 'Look-ahead', 0, 240, 10, 0, ' px']], s => {
  const k = s.k / 100, lag = s.v * (1 - k) / k, raw = 320 - lag + s.la, ahead = Math.max(0, Math.min(640, raw));
  return { bars: [['Screen behind the character', 1 - ahead / 640, nf(640 - ahead) + ' px'], ['Screen ahead of it', ahead / 640, nf(ahead) + ' px']], say: `On a screen 640 px wide, running right at ${s.v} px a frame, the camera settles ${nf(lag)} px behind ` + (s.la ? `a point ${s.la} px ahead of the character` : 'the character') + (raw <= 0 ? ': the character runs off the edge of the screen.' : `. That leaves ${nf(ahead)} px of screen ahead: ${(ahead / s.v / 60).toFixed(1)} s to see what is coming.` + (ahead < 320 ? ' More of the screen shows where the player has been than where they are going.' : '')) };
});

KINDS.window = calc('How wide is “on the beat”?', [['bpm', 'Tempo', 60, 200, 5, 120, ' BPM'], ['hw', 'Hit window, each side', 10, 150, 5, 50, ' ms'], ['lat', 'Delay nobody has corrected', 0, 150, 5, 0, ' ms']], s => {
  const beat = 60000 / s.bpm, share = Math.min(1, 2 * s.hw / beat), room = Math.max(0, s.hw - s.lat);
  return { bars: [['Of the beat that counts as a hit', share, pct(share) + '%'], ['Room left after the delay', room / 150, room + ' ms']], say: `At ${s.bpm} BPM a beat lasts ${nf(beat)} ms, and a ±${s.hw} ms window accepts ${pct(share)}% of it.` + (!s.lat ? ' Add some delay to see what an uncalibrated screen or headset does to it.' : s.lat > s.hw ? ` With ${s.lat} ms of delay, a press exactly on the beat reads ${s.lat} ms late: a miss every time, and the player blames themselves.` : ` With ${s.lat} ms of delay, a press exactly on the beat reads ${s.lat} ms late: still a hit, with ${room} ms to spare instead of ${s.hw}.`) };
});

KINDS.pacing = {
  t: 'Draw an intensity curve',
  init: () => ({ b0: 2, b1: 4, b2: 6, b3: 3, b4: 8, b5: 5 }),
  html: s => `<div class="demo-stage econ-stage" aria-hidden="true">${'<i></i>'.repeat(6)}</div>` + [0, 1, 2, 3, 4, 5].map(i => slider('b' + i, 'Beat ' + (i + 1), 0, 10, 1, s['b' + i], '')).join(''),
  sync(fig, s){ $$('.econ-stage i', fig).forEach((el, i) => { el.style.height = Math.max(2, s['b' + i] * 10) + '%'; }); },
  act(){},
  say(s){
    const v = [0, 1, 2, 3, 4, 5].map(i => s['b' + i]), top = Math.max(...v), peak = v.indexOf(top) + 1, drops = v.filter((x, i) => i && x < v[i - 1]).length;
    if(top === Math.min(...v)) return 'All six beats are level, so there is no peak: nothing reads as a high point because nothing is quiet.';
    return `Peak at beat ${peak}, ${drops} drop${drops === 1 ? '' : 's'} in intensity.` + (top - Math.min(...v) <= 2 ? ' Nearly flat: nothing reads as a high point because nothing is quiet.' : !drops ? ' It only climbs: with no drop there is no relief, and the peak has nothing to stand against.' : peak === 1 ? ' The strongest moment comes first, so everything after it is a way down.' : v[peak - 2] <= top - 3 ? ' The beat before the peak is quiet, which is what makes the peak land.' : '');
  }
};

KINDS.branch = calc('What a branching story costs to write', [['c', 'Options at each choice', 2, 4, 1, 2, ''], ['d', 'Choices in a row', 1, 10, 1, 5, '']], s => {
  const ends = Math.pow(s.c, s.d), scenes = (Math.pow(s.c, s.d + 1) - 1) / (s.c - 1);
  return { bars: [['Seen by one player', (s.d + 1) / scenes, (s.d + 1) + ' scenes'], ['Written', 1, nf(scenes) + ' scenes']], say: `${s.c} options at each of ${s.d} choice${s.d === 1 ? '' : 's'}, with no branches rejoining: ${nf(ends)} endings and ${nf(scenes)} scenes to write, of which one player sees ${s.d + 1}. Folding branches back together, and carrying the difference in state, is how the count is kept writable.` };
});

const lum = g => { const c = g / 100; return c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); };
KINDS.contrast = {
  t: 'Can this text be read?',
  init: () => ({ fg: 15, bg: 90 }),
  html: s => `<div class="demo-stage contrast-stage"><span>Health 42 / 100</span><small>Press A to continue</small></div>${slider('fg', 'Text lightness', 0, 100, 1, s.fg, '%')}${slider('bg', 'Background lightness', 0, 100, 1, s.bg, '%')}`,
  ratio(s){ const a = lum(s.fg), b = lum(s.bg); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); },
  sync(fig, s){ const st = $('.contrast-stage', fig), g = v => { const c = Math.round(v * 2.55); return `rgb(${c},${c},${c})`; }; st.style.background = g(s.bg); st.style.color = g(s.fg); },
  act(){},
  say(s){ const r = this.ratio(s); return `Contrast ${r.toFixed(2)} to 1. ` + (r >= 4.5 ? 'That passes the 4.5 to 1 that WCAG asks of body text.' : r >= 3 ? 'Enough for large text (3 to 1), not for body text (4.5 to 1): the small line fails.' : 'Below 3 to 1: it fails for text of any size, and a player in sunlight or with low vision loses it first.'); }
};

const jumpPeak = (v, g, fps) => { let y = 0, vy = v, top = 0; const dt = 1 / fps; for(let i = 0; i < 5000; i++){ vy -= g * dt; y += vy * dt; if(y > top) top = y; if(y <= 0) break; } return top; };
KINDS.timestep = calc('One step a frame, three frame rates', [['v', 'Jump speed', 3, 12, .5, 7, ' m/s'], ['g', 'Gravity', 10, 60, 1, 25, ' m/s²']], s => {
  const h = [30, 60, 144].map(f => jumpPeak(s.v, s.g, f)), exact = s.v * s.v / (2 * s.g), cm = Math.round((h[2] - h[0]) * 100);
  return { bars: [['At 30 frames a second', h[0] / exact, h[0].toFixed(2) + ' m'], ['At 60', h[1] / exact, h[1].toFixed(2) + ' m'], ['At 144', h[2] / exact, h[2].toFixed(2) + ' m']], say: `The same jump peaks at ${h[0].toFixed(2)} m at 30 frames a second, ${h[1].toFixed(2)} m at 60 and ${h[2].toFixed(2)} m at 144; the exact answer is ${exact.toFixed(2)} m. Stepping once a frame, the player on the fast machine jumps ${cm} cm higher: a fixed step makes every machine agree.` };
});

KINDS.tunnel = calc('Can it pass through the wall?', [['v', 'Speed', 5, 900, 5, 300, ' m/s'], ['w', 'Wall thickness', .05, 2, .05, .2, ' m'], ['f', 'Steps a second', 30, 240, 30, 60, '']], s => {
  const d = s.v / s.f, top = Math.max(d, s.w);
  return { bars: [['Moved in one step', d / top, nf(d, 2) + ' m'], ['Wall', s.w / top, s.w + ' m']], say: `At ${s.v} m/s the object moves ${nf(d, 2)} m between two steps. ` + (d > s.w ? `That is more than the ${s.w} m wall: it can be on one side at one step and on the other at the next, and a check of positions alone never sees a hit. Sweep the path, not the point.` : `That is no more than the ${s.w} m wall, so some step always lands inside it and a point check catches it.`) };
});

const TEX = [256, 512, 1024, 2048, 4096];
KINDS.texmem = calc('What textures weigh in memory', [['sz', 'Texture size', 0, 4, 1, 3, ''], ['n', 'How many', 1, 400, 1, 60, ''], ['bpp', 'Bits a pixel', 4, 32, 4, 32, '']], s => {
  const side = TEX[s.sz], mb = side * side * s.bpp / 8 * 4 / 3 * s.n / 1e6, sz = x => x < 1 ? nf(x * 1000) + ' KB' : nf(x, x < 10 ? 1 : 0) + ' MB';
  return { bars: [['In memory', Math.min(1, mb / 4096), sz(mb)], ['At half the side', Math.min(1, mb / 16384), sz(mb / 4)]], say: `${s.n} texture${s.n === 1 ? '' : 's'} of ${side} × ${side} at ${s.bpp} bits a pixel, with mipmaps (a third more): ${sz(mb)}. ${s.bpp === 32 ? 'That is uncompressed colour; a block-compressed format at 8 bits a pixel takes a quarter of it.' : 'Uncompressed colour is 32 bits a pixel.'} Halving the side divides it by four: ${sz(mb / 4)}.` };
}, (name, v) => name === 'sz' ? TEX[v] + ' px' : String(v));

const RES = [[1280, 720, '720p'], [1920, 1080, '1080p'], [2560, 1440, '1440p'], [3840, 2160, '4K']];
KINDS.overdraw = calc('How many pixels are shaded a second?', [['r', 'Resolution', 0, 3, 1, 1, ''], ['l', 'Times each pixel is drawn', 1, 10, .5, 2.5, ''], ['f', 'Frames a second', 30, 120, 30, 60, '']], s => {
  const [w, h, name] = RES[s.r], m = w * h * s.l * s.f / 1e6, base = w * h * s.f / 1e6;
  return { bars: [['Drawn once', base / m, nf(base) + ' million'], ['As set', 1, nf(m) + ' million']], say: `${name} is ${nf(w * h / 1e6, 1)} million pixels. Drawn ${s.l} time${s.l === 1 ? '' : 's'} each at ${s.f} frames a second: ${nf(m)} million pixel-shader runs a second. Going from 1080p to 4K multiplies that by four before a single effect is added.` };
}, (name, v) => name === 'r' ? RES[v][2] : String(v));

KINDS.budget = calc('Does it fit in a frame?', [['n', s => 'How many ' + (s.words[0] || 'agents'), 10, 5000, 10, 300, ''], ['c', 'Cost of updating one', 1, 200, 1, 20, ' µs'], ['f', 'Frames a second', 30, 120, 30, 60, ''], ['a', 'Share of the frame this may use', 5, 50, 5, 15, '%']], s => {
  const w = s.words[0] || 'agents', frame = 1000 / s.f, t = s.n * s.c / 1000, allow = frame * s.a / 100, k = Math.ceil(t / allow);
  return { bars: [['Allowed', allow / frame, nf(allow, 1) + ' ms'], ['Used', t / frame, nf(t, 1) + ' ms']], say: `At ${s.f} frames a second a frame is ${nf(frame, 1)} ms, and ${s.a}% of it is ${nf(allow, 1)} ms. ${nf(s.n)} ${w} × ${s.c} µs is ${nf(t, 1)} ms: ` + (t > allow ? `over. Updating each one every ${k} frames fits, and so does making one update ${k} times cheaper.` : 'it fits.') };
});

KINDS.gc = calc('How often does the collector run?', [['kb', 'Allocated every frame', 0, 256, 4, 32, ' KB'], ['mb', 'Room before a collection', 1, 64, 1, 4, ' MB'], ['f', 'Frames a second', 30, 120, 30, 60, '']], s => {
  const rate = s.kb * s.f / 1024;
  return { bars: [['Allocated a second', Math.min(1, rate / 30), nf(rate, 1) + ' MB']], say: s.kb ? `${s.kb} KB a frame at ${s.f} frames a second is ${nf(rate, 1)} MB a second, so ${s.mb} MB of room fills every ${nf(s.mb / rate, 1)} s. Each time it fills the collector runs, and a collection that takes longer than the frame has to spare is a hitch the player sees.` : 'Nothing is allocated per frame, so the collector has no reason to run during play: that is what pooling and reuse are for.' };
});

const NET = [.4, 1.6, 10, 50];
KINDS.weight = calc('How long until the page has arrived?', [['kb', 'Page weight as served', 100, 10000, 100, 2000, ''], ['net', 'Your reader’s connection', 0, 3, 1, 1, '']], s => {
  const sec = x => s.kb * 8 / 1000 / x;
  return { bars: NET.map(x => [x + ' Mbit/s', Math.min(1, sec(x) / 60), nf(sec(x), 1) + ' s']), say: `${nf(s.kb)} KB over ${NET[s.net]} Mbit/s takes ${nf(sec(NET[s.net]), 1)} s to arrive, before any of it is parsed or run. Every KB is paid by each visitor on their own connection, not on yours.` };
}, (name, v) => name === 'net' ? NET[v] + ' Mbit/s' : nf(v) + ' KB');

const PLAYERS = [1000, 10000, 100000, 1000000];
KINDS.cdn = calc('What a patch costs to deliver', [['mb', 'Patch size', 10, 5000, 10, 800, ''], ['pl', 'Players who download it', 0, 3, 1, 2, ''], ['c', 'Price per GB delivered', .01, .12, .01, .05, '']], s => {
  const gb = s.mb * PLAYERS[s.pl] / 1000, cost = gb * s.c, usd = x => '$' + (x < 10 ? x.toFixed(2) : nf(x));
  return { bars: [['This patch', 1, usd(cost)], ['A tenth the size', .1, usd(cost / 10)]], say: `${nf(PLAYERS[s.pl])} players × ${nf(s.mb)} MB is ${nf(gb / 1000, gb < 1000 ? 2 : 1)} TB. At $${s.c} a GB that patch costs about ${usd(cost)} to deliver, and every player waits for all of it. A patch that sends only what changed costs in proportion to what changed.` };
}, (name, v) => name === 'pl' ? nf(PLAYERS[v]) : name === 'c' ? '$' + v : nf(v) + ' MB');

KINDS.queue = calc('A tighter match, a longer wait', [['r', 'Players who start searching each minute', 5, 2000, 5, 120, ''], ['sh', 'Share close enough in skill', 2, 100, 2, 20, '%'], ['n', 'Players in a match', 2, 100, 1, 10, '']], s => {
  const sec = (s.n - 1) / (s.r * s.sh / 100) * 60, dur = x => x >= 7200 ? nf(x / 3600, 1) + ' hours' : x >= 120 ? nf(x / 60, 1) + ' minutes' : nf(x) + ' s';
  return { bars: [['Wait for a match', Math.min(1, sec / 300), dur(sec)], ['With the skill band halved', Math.min(1, sec / 150), dur(sec * 2)]], say: `A player needs ${s.n - 1} other${s.n === 2 ? '' : 's'} near their skill. With ${nf(s.r)} joining a minute and ${s.sh}% of them close enough, that takes about ${dur(sec)}. Halve the band and the wait doubles: fairness is paid for in waiting, and a small population pays most.` };
});

const NEXT = [['sword', 4], ['blade', 3], ['bow', 2], ['breath', 1], ['passport', -1]];
KINDS.temp = {
  t: 'What temperature does to the next word',
  init: () => ({ T: 1, picks: [], at: 0 }),
  probs(s){ const e = NEXT.map(([, x]) => Math.exp(x / s.T)), sum = e.reduce((a, b) => a + b, 0); return e.map(x => x / sum); },
  html: s => `<p class="temp-line">The knight drew his <b>…</b></p>${NEXT.map(([w], i) => bar('c' + i, w)).join('')}${slider('T', 'Temperature', .1, 2, .1, s.T, '')}<div class="row">${btn('pick', 'Write it 10 times', 'btn primary')}</div>`,
  sync(fig, s){ this.probs(s).forEach((p, i) => setBar(fig, 'c' + i, p, nf(p * 100, 1) + '%')); },
  act(fig, s){ const p = this.probs(s); s.at = s.T; s.picks = Array.from({ length: 10 }, () => { let r = Math.random(), i = 0; while(i < p.length - 1 && r >= p[i]){ r -= p[i]; i++; } return NEXT[i][0]; }); },
  say(s){ const p = this.probs(s); return `At temperature ${s.T}, “${NEXT[0][0]}” is chosen ${nf(p[0] * 100, 1)}% of the time and “${NEXT[4][0]}” ${nf(p[4] * 100, 1)}%.` + (s.picks.length && s.at === s.T ? ` Ten tries: ${s.picks.join(', ')}.` : '') + (s.T <= .3 ? ' Near zero the top word wins almost every time: repeatable, and never surprising.' : s.T >= 1.5 ? ' High up, unlikely words get real chances: more variety, and more nonsense.' : ''); }
};

const LOCALE = [['English', 'Settings'], ['German', 'Einstellungen'], ['French', 'Paramètres'], ['Spanish', 'Configuración'], ['Finnish', 'Asetukset'], ['Russian', 'Настройки'], ['Japanese', '設定']];
KINDS.locale = {
  t: 'Will the label still fit?',
  init: () => ({ i: 0, fits: true }),
  html: () => `<div class="demo-stage locale-stage"><span class="locale-btn">Settings</span></div><div class="row">${btn('next', 'Next language', 'btn primary')}</div>`,
  sync(){},
  act(fig, s){ s.i = (s.i + 1) % LOCALE.length; const b = $('.locale-btn', fig); b.textContent = LOCALE[s.i][1]; s.fits = b.scrollWidth <= b.clientWidth; },
  say(s){ const [lang, word] = LOCALE[s.i], n = [...word].length; return s.i ? `${lang}: “${word}”, ${n} characters against 8 in English. ` + (s.fits ? 'It fits the button drawn for English' + (n < 5 ? ', with room that now looks like a mistake.' : '.') : 'It does not fit the button drawn for English: it is cut off, and nobody who reads only English sees that before release.') : 'A button drawn to fit its English label, “Settings”. Step through the languages.'; }
};

const PW = 8, PH = 5, PA = 16, PB = 20;
KINDS.path = {
  t: 'Wall it up and watch the search',
  init: () => ({ walls: new Set([11, 19, 27]) }),
  search(s){
    const prev = new Map([[PA, -1]]), q = [PA]; let seen = 0;
    while(q.length){
      const c = q.shift(), x = c % PW, y = (c - x) / PW; seen++; if(c === PB) break;
      for(const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const nx = x + dx, ny = y + dy, n = ny * PW + nx; if(nx < 0 || ny < 0 || nx >= PW || ny >= PH || s.walls.has(n) || prev.has(n)) continue; prev.set(n, c); q.push(n); }
    }
    const path = []; if(prev.has(PB)) for(let c = PB; c !== -1; c = prev.get(c)) path.push(c);
    return { path, seen, open: PW * PH - s.walls.size };
  },
  html: () => `<div class="path-grid">${Array.from({ length: PW * PH }, (_, i) => i === PA || i === PB ? `<span class="path-end">${i === PA ? 'A' : 'B'}</span>` : btn('wall', '', 'path-cell', ` data-i="${i}" aria-label="Column ${i % PW + 1}, row ${Math.floor(i / PW) + 1}" aria-pressed="false"`)).join('')}</div><div class="row">${btn('clear', 'Clear the walls', 'btn primary')}</div>`,
  sync(fig, s){ const r = this.search(s); $$('.path-cell', fig).forEach(el => { const i = +el.dataset.i, wall = s.walls.has(i); el.classList.toggle('wall', wall); el.classList.toggle('on', r.path.includes(i)); el.setAttribute('aria-pressed', wall); }); },
  act(fig, s, what, el){ if(what === 'clear') s.walls.clear(); else { const i = +el.dataset.i; if(s.walls.has(i)) s.walls.delete(i); else s.walls.add(i); } this.sync(fig, s); },
  say(s){ const r = this.search(s); return r.path.length ? `Shortest route from A to B: ${r.path.length - 1} steps. The search looked at ${r.seen} of the ${r.open} open cells and stopped when it reached B.` : `No route from A to B. A search that fails cannot stop early: it looked at every cell it could reach, ${count(r.seen, 'cells')}, to be sure.`; }
};

KINDS.lights = {
  t: 'Five lights, one rule',
  init: () => ({ on: [0, 0, 0, 0, 0], n: 0, t0: 0, last: 'Light all five. A press flips that light and the ones next to it.' }),
  html: () => `<div class="lights-row">${[0, 1, 2, 3, 4].map(i => btn('flip', String(i + 1), 'lights-cell', ` data-i="${i}" aria-pressed="false"`)).join('')}</div><div class="row">${btn('reset', 'Start again', 'btn primary')}</div>`,
  sync(fig, s){ $$('.lights-cell', fig).forEach((el, i) => { el.classList.toggle('on', !!s.on[i]); el.setAttribute('aria-pressed', !!s.on[i]); el.innerHTML = (i + 1) + (s.on[i] ? '<small>on</small>' : ''); }); },
  act(fig, s, what, el){
    if(what === 'reset'){ s.on = [0, 0, 0, 0, 0]; s.n = 0; s.last = 'All off again. Fewer presses this time?'; }
    else {
      const i = +el.dataset.i; if(!s.n) s.t0 = performance.now(); s.n++;
      for(const j of [i - 1, i, i + 1]) if(j >= 0 && j < 5) s.on[j] ^= 1;
      const lit = s.on.reduce((a, b) => a + b, 0), times = `${s.n} press${s.n === 1 ? '' : 'es'}`;
      s.last = lit === 5 ? `Solved in ${times} and ${((performance.now() - s.t0) / 1000).toFixed(1)} s. ` + (s.n > 2 ? 'It can be done in 2: the rule never changed, only how well you can see what one press does.' : 'That is the shortest there is: you read the rule instead of trying things.') : `${lit} of 5 lit after ${times}` + (lit ? ` (${s.on.map((x, k) => x ? k + 1 : 0).filter(Boolean).join(', ')}).` : '.');
    }
    this.sync(fig, s);
  },
  say: s => s.last
};

const ROOMS = ['Hall', 'Vault', 'Shrine', 'Pit', 'Forge', 'Crypt', 'Garden', 'Cell'];
KINDS.seed = {
  t: 'A thousand seeds, one dungeon?',
  init: () => ({ seed: 1, k: 3 }),
  row(s){ let x = s.seed * 7919; const r = () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; r(); return Array.from({ length: 10 }, () => ROOMS[Math.floor(r() * s.k)]); },
  html: s => `<div class="seed-row"></div>${slider('seed', 'Seed', 1, 1000, 1, s.seed, '')}${slider('k', 'Kinds of room', 1, 8, 1, s.k, '')}`,
  sync(fig, s){ $('.seed-row', fig).innerHTML = this.row(s).map(x => `<span>${x}</span>`).join(''); },
  act(){},
  say(s){ return `Seed ${s.seed}: ${this.row(s).join(', ')}. ` + (s.k === 1 ? 'One kind of room: every seed is the same dungeon.' : `${nf(Math.pow(s.k, 10))} different rows are possible from ${s.k} kinds of room, and after a few they read alike: what a player notices is the kinds, not the order.`); }
};

KINDS.tone = {
  t: 'The same sound, five times',
  init: () => ({ v: 0, last: 'Press Play: five hits in a row.' }),
  html: s => `${slider('v', 'Pitch varies by up to', 0, 12, 1, s.v, '%')}<div class="row">${btn('play', 'Play five hits', 'btn primary')}</div>`,
  sync(){},
  act(fig, s){
    const rates = [-1, -.5, 0, .5, 1].sort(() => Math.random() - .5).map(x => 1 + x * s.v / 100); let heard = true;
    try {
      const ac = s.ac || (s.ac = new (window.AudioContext || window.webkitAudioContext)());
      rates.forEach((r, i) => { const t = ac.currentTime + .05 + i * .16, o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(220 * r, t); o.frequency.exponentialRampToValueAtTime(70 * r, t + .09); g.gain.setValueAtTime(.25, t); g.gain.exponentialRampToValueAtTime(.001, t + .12); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + .13); });
    } catch(e){ heard = false; }
    s.last = (heard ? '' : 'No sound could be played here. ') + (s.v ? `Five hits, pitched ${rates.map(r => { const p = +((r - 1) * 100).toFixed(1); return (p > 0 ? '+' : p < 0 ? '−' : '') + Math.abs(p) + '%'; }).join(', ')}: no two are the same, so each reads as its own event.` : 'Five identical hits: played back to back an exact copy is easy to hear, and the weapon starts to sound like a machine.');
  },
  say: s => s.last
};

KINDS.breakeven = calc('Where does the heavier option pay for itself?', [
  ['a0', s => cap(s.words[1] || 'the plain way') + ': to set up', 0, 200, 5, 0, ''],
  ['a1', s => cap(s.words[1] || 'the plain way') + ': each time', 0, 40, .5, 4, ''],
  ['b0', s => cap(s.words[2] || 'the built way') + ': to set up', 0, 400, 5, 60, ''],
  ['b1', s => cap(s.words[2] || 'the built way') + ': each time', 0, 40, .5, 1, ''],
  ['n', s => 'How many ' + (s.words[0] || 'times'), 1, 200, 1, 10, '']], s => {
  const A = s.words[1] || 'the plain way', B = s.words[2] || 'the built way', units = s.words[0] || 'times', u = s.words[3] || 'hours';
  const ca = s.a0 + s.a1 * s.n, cb = s.b0 + s.b1 * s.n, top = Math.max(ca, cb, 1);
  const [hi, lo, h0, h1, l0, l1] = s.b0 >= s.a0 ? [B, A, s.b0, s.b1, s.a0, s.a1] : [A, B, s.a0, s.a1, s.b0, s.b1];
  const verdict = h0 === l0 ? (h1 === l1 ? 'They cost the same at any number.' : `They cost the same to set up, so ${h1 < l1 ? hi : lo} wins at any number.`)
    : h1 >= l1 ? `${cap(hi)} costs more to set up and no less each time: it never pays for itself.`
    : `${cap(hi)} pays for itself after ${count(Math.floor((h0 - l0) / (l1 - h1)), units)}: below that, ${lo} is cheaper, however much better the other looks.`;
  return { bars: [[cap(A), ca / top, nf(ca, 1) + ' ' + u], [cap(B), cb / top, nf(cb, 1) + ' ' + u]], say: `For ${count(s.n, units)}: ${A} costs ${nf(ca, 1)} ${u}, ${B} ${nf(cb, 1)}. ` + verdict };
});

KINDS.profile = {
  t: 'Where does it actually score?',
  init: (t, spec) => { const words = (spec && spec.w) || ['one', 'two', 'three'], s = { words }; words.forEach((_, i) => { s['d' + i] = [7, 5, 3, 4, 2, 6][i]; }); return s; },
  html: s => s.words.map((w, i) => slider('d' + i, cap(w), 0, 10, 1, s['d' + i], '')).join(''),
  sync(){},
  act(){},
  say(s){
    const v = s.words.map((w, i) => [w, s['d' + i]]).sort((a, b) => b[1] - a[1]), total = v.reduce((a, x) => a + x[1], 0);
    if(!total) return 'Nothing scored yet.';
    if(v[0][1] === v[v.length - 1][1]) return 'Everything scores the same: nothing has been chosen yet, and a profile that claims everything equally claims nothing.';
    return `Strongest: ${v[0][0]} and ${v[1][0]}, ${pct((v[0][1] + v[1][1]) / total)}% of the total between them. Weakest: ${v[v.length - 1][0]}.`;
  }
};

KINDS.busy = calc('How long things wait when you are nearly full', [['a', s => cap(s.words[0] || 'jobs') + ' arriving ' + (s.words[1] || 'a week'), 1, 60, 1, 9, ''], ['c', s => 'Can be finished ' + (s.words[1] || 'a week'), 1, 60, 1, 10, '']], s => {
  const w = s.words[0] || 'jobs', rho = s.a / s.c, m = 1 / (1 - rho), label = 'Time through, against an empty desk';
  if(rho >= 1) return { bars: [['Busy', 1, '100%'], [label, 1, 'no limit']], say: `${count(s.a, w)} ${s.a === 1 ? 'arrives' : 'arrive'} and ${s.c} can be finished: no less comes in than goes out, so the queue grows without limit and each one waits longer than the last.` };
  return { bars: [['Busy', rho, pct(rho) + '%'], [label, Math.min(1, m / 20), nf(m, 1) + '×']], say: `${count(s.a, w)} ${s.a === 1 ? 'arrives' : 'arrive'} and ${s.c} can be finished: ${pct(rho)}% busy. When they arrive unevenly, each one takes about ${nf(m, 1)}× as long to get through as it would with nothing ahead of it. At 80% busy that is 5×; at 95%, 20×.` };
});

KINDS.busfactor = calc('What is known by only one person?', [['n', 'People', 1, 12, 1, 5, ''], ['p', 'Share of the whole that each one knows', 10, 100, 5, 30, '%']], s => {
  const p = s.p / 100, none = Math.pow(1 - p, s.n), one = s.n * p * Math.pow(1 - p, s.n - 1);
  return { bars: [['Known by nobody', none, pct(none) + '%'], ['Known by exactly one', one, pct(one) + '%'], ['Known by two or more', 1 - none - one, pct(1 - none - one) + '%']], say: `If ${s.n === 1 ? 'the one person' : 'each of ' + s.n + ' people'} knows ${s.p}% of the whole${s.n === 1 ? '' : ', independently'}, ${pct(none)}% is known by nobody and ${pct(one)}% by exactly one: that share stops moving when one person is ill, busy or gone.` };
});

KINDS.compound = calc('A little, every week', [['g', 'Change each week', -2, 5, .25, 1, '%'], ['wk', 'Weeks', 4, 260, 4, 52, '']], s => {
  const x = Math.pow(1 + s.g / 100, s.wk), half = Math.pow(1 + s.g / 100, s.wk / 2), top = Math.max(1, x);
  return { bars: [['At the start', 1 / top, '1×'], ['Halfway', half / top, nf(half, 2) + '×'], ['At the end', x / top, nf(x, 2) + '×']], say: `${s.g > 0 ? '+' : s.g < 0 ? '−' : ''}${Math.abs(s.g)}% a week for ${s.wk} weeks is ${nf(x, 2)}× where it started` + (s.g > 0 ? `, and only ${nf(half, 2)}× at the halfway mark: most of the gain arrives late, which is why it is easy to give up on early.` : s.g < 0 ? `: a loss too small to notice in any one week leaves ${pct(x)}%.` : ': nothing changes.') };
});

KINDS.sight = calc('What can it see, and for how long?', [['r', 'Sight range', 2, 40, 1, 12, ' m'], ['ang', 'Angle of the cone', 20, 360, 10, 90, '°'], ['d', 'Reaction delay', 0, 2, .1, .5, ' s'], ['v', 'Speed of the target', 1, 10, .5, 5, ' m/s']], s => {
  const area = s.ang / 360 * Math.PI * s.r * s.r, dot = Math.cos(s.ang / 2 * Math.PI / 180), t = s.r / s.v, room = Math.min(1, area / 900);
  return { bars: [['Of a 30 × 30 m room covered', room, pct(room) + '%'], ['In view while running in', Math.min(1, t / 10), nf(t, 1) + ' s']], say: `The cone covers ${nf(area)} m². A target is inside it when it is within ${s.r} m and the dot product of the facing direction and the unit direction to the target is at least ${dot < -.004 ? '−' : ''}${Math.abs(dot).toFixed(2)}. Running straight in at ${s.v} m/s, a target is in view for ${nf(t, 1)} s` + (t <= s.d ? `: no longer than the ${s.d} s reaction delay, so it arrives before anything reacts.` : `, ${nf(t - s.d, 1)} s of it after the ${s.d} s reaction delay.`) };
});

KINDS.repeat = calc('How often is each line heard?', [['n', 'Lines recorded', 1, 200, 1, 12, ''], ['e', 'One is spoken every', 5, 600, 5, 45, ' s'], ['h', 'Hours of play', 1, 100, 1, 20, '']], s => {
  const total = s.h * 3600 / s.e, each = total / s.n;
  return { bars: [['Times each line is heard', Math.min(1, each / 200), nf(each)]], say: `${nf(total)} lines are spoken over ${count(s.h, 'hours')}, from ${nf(s.n)} recorded: ${each < 1 ? 'most are never heard' : 'each is heard about ' + count(Math.round(each), 'times')}. Speak less often, record more, or let the situation choose the line: those are the three levers.` };
});

KINDS.loss = calc('What one lost packet costs', [['p', 'Packets lost', 0, 20, .5, 2, '%'], ['k', 'Packets one message is split into', 1, 20, 1, 3, ''], ['rto', 'Wait before a resend', 20, 500, 10, 100, ' ms']], s => {
  const ok = Math.pow(1 - s.p / 100, s.k);
  return { bars: [['Messages that arrive whole', ok, nf(ok * 100, 1) + '%'], ['Messages hit by a loss', 1 - ok, nf((1 - ok) * 100, 1) + '%']], say: `With ${s.p}% of packets lost, a message split into ${count(s.k, 'packets')} arrives whole ${nf(ok * 100, 1)}% of the time. A reliable, ordered channel resends what is missing about ${s.rto} ms later and holds back everything sent after it until then; an unreliable one drops that message and moves on.` };
});

KINDS.net = calc('What one sale is worth to you', [['price', 'Price', 1, 80, 1, 20, ''], ['share', 'The store keeps', 0, 90, 5, 30, ''], ['tax', 'Tax and refunds', 0, 40, 5, 20, ''], ['cost', 'Cost of getting onto this platform', 5, 500, 5, 60, '']], s => {
  const net = s.price * (1 - s.tax / 100) * (1 - s.share / 100), copies = Math.ceil(s.cost * 1000 / net);
  return { bars: [['Price', 1, '$' + s.price], ['Reaches you', net / s.price, '$' + net.toFixed(2)]], say: `Of a $${s.price} sale, about $${net.toFixed(2)} reaches you after ${s.tax}% tax and refunds and the store’s ${s.share}%. Recovering $${nf(s.cost * 1000)} takes ${nf(copies)} copies on this platform alone.` };
}, (name, v) => name === 'price' ? '$' + v : name === 'cost' ? '$' + nf(v * 1000) : v + '%');

KINDS.pcache = calc('What a stable prefix saves', [['pre', 'Share of the prompt that never changes', 0, 95, 5, 80, '%'], ['hit', 'Calls that find it cached', 0, 100, 5, 90, '%'], ['c', 'A cached token costs, against a normal one', 5, 100, 5, 10, '%']], s => {
  const rel = 1 - s.pre / 100 * s.hit / 100 * (1 - s.c / 100);
  return { bars: [['Uncached', 1, '100%'], ['With the cache', rel, pct(rel) + '%']], say: `With ${s.pre}% of each prompt identical from call to call, ${s.hit}% of calls finding it cached and a cached token billed at ${s.c}% of a normal one, the input costs ${pct(rel)}% of what it would uncached, before any charge for writing the cache. Put one changing line above the stable part and the hit rate, and the saving, go to zero.` };
});

KINDS.guards = calc('The same check, at every layer', [['l', 'Layers a value passes through', 1, 8, 1, 4, ''], ['v', 'Values checked', 1, 20, 1, 6, ''], ['n', 'Lines one check takes', 1, 6, 1, 3, '']], s => {
  const all = s.l * s.v * s.n, once = s.v * s.n;
  return { bars: [['Checked at every layer', 1, count(all, 'lines')], ['Checked once, where it enters', once / all, count(once, 'lines')]], say: s.l === 1 ? `One layer: ${count(once, 'lines')} of checks at the boundary, and nothing to remove.` : `Checked at each of ${s.l} layers: ${count(all, 'lines')}. Checked once where the value enters: ${count(once, 'lines')}. The other ${nf(all - once)} can never fire, and each one tells the next reader that the value might be bad here.` };
});

KINDS.repo = calc('What binaries do to a repository', [['mb', 'One version of an asset', 1, 500, 1, 40, ' MB'], ['n', 'Changed versions committed a week', 1, 200, 1, 25, ''], ['wk', 'Weeks', 4, 156, 4, 52, '']], s => {
  const gb = s.mb * s.n * s.wk / 1000;
  return { bars: [['History after that time', Math.min(1, gb / 500), nf(gb, 1) + ' GB']], say: `${count(s.n, 'changed versions')} a week at ${s.mb} MB, each kept whole because a compressed binary rarely shrinks to a difference: ${nf(gb, 1)} GB of history after ${s.wk} weeks. Every full clone carries it unless old versions are stored outside the history and fetched on demand.` };
});

KINDS.gap = calc('Do the two agree?', [['a', s => s.words[0] || 'What is said', 0, 10, 1, 8, ''], ['b', s => s.words[1] || 'What is done', 0, 10, 1, 3, '']], s => {
  const g = Math.abs(s.a - s.b);
  return { bars: [], say: g <= 1 ? `${s.a} and ${s.b} of 10: the two agree.` : `${s.a} against ${s.b} of 10: a gap of ${g}. ${s.words[2] || ''}` };
});

KINDS.horizons = calc('Three horizons in one session', [['sh', 'A short goal is reached every', 5, 300, 5, 30, ' s'], ['m', 'A medium goal every', 1, 120, 1, 15, ' min'], ['h', 'A long goal every', 1, 60, 1, 8, ' h'], ['len', 'Session', 5, 180, 5, 30, ' min']], s => {
  const ns = s.len * 60 / s.sh, nm = s.len / s.m, sessions = s.h * 60 / s.len;
  return { bars: [['Short goals a session', Math.min(1, ns / 200), nf(ns)], ['Medium goals a session', Math.min(1, nm / 20), nf(nm, 1)], ['Sessions to one long goal', Math.min(1, sessions / 100), nf(sessions, 1)]], say: `In a ${s.len}-minute session the player reaches ${count(Math.round(ns), 'short goals')} and ${nf(nm, 1)} medium ${+nm.toFixed(1) === 1 ? 'one' : 'ones'}; the long goal is ${count(+sessions.toFixed(1), 'sessions')} away.` + (nm < 1 ? ' No medium goal completes inside a session, so the session has no ending of its own to aim at.' : '') };
});

const state = new WeakMap();
const S = fig => { let s = state.get(fig); if(!s){ const t = TOPICS[fig.dataset.topic]; s = KINDS[fig.dataset.demo].init(t, t.demo); state.set(fig, s); } return s; };
const out = (fig, text) => { $('.demo-out', fig).textContent = text; };

function demoCard(id, featured){
  const t = TOPICS[id], spec = t && t.demo, k = spec && KINDS[spec.kind]; if(!k) return '';
  const s = k.init(t, spec), ask = spec.ask;
  return `<figure class="card demo" data-demo="${spec.kind}" data-topic="${esc(id)}" style="--dc:${DOM[t.d] ? DOM[t.d].color : 'var(--accent2)'}">
    <figcaption class="demo-head"><span class="overline">Try it${featured ? ' · from ' + esc(t.t) : ''}</span><b>${esc(spec.t || k.t)}</b></figcaption>
    <div class="demo-body">${k.html(s)}</div>
    <p class="small demo-out" aria-live="polite">${esc(k.say(s))}</p>
    ${ask ? `<p class="small demo-ask"><b>Try this.</b> ${esc(ask)}</p>` : ''}
    ${featured ? `<div class="row"><a class="btn sm" href="#/map/t/${esc(id)}">Open the topic →</a><button type="button" class="btn sm ghost" data-action="demo-next">Another demo</button></div>` : ''}</figure>`;
}
function demoPaint(root){
  $$('.demo', root || document).forEach(fig => {
    if(state.has(fig)) return;
    const k = KINDS[fig.dataset.demo], s = S(fig);
    if(k.fmt) $$('[data-v]', fig).forEach(el => { el.textContent = k.fmt(el.dataset.v, s[el.dataset.v]); });
    k.sync(fig, s);
  });
}

ACTIONS['demo'] = el => { const fig = el.closest('.demo'), k = KINDS[fig.dataset.demo], s = S(fig); k.act(fig, s, el.dataset.do, el); out(fig, k.say(s)); };
ACTIONS['demo-next'] = el => {
  const ids = A.demoFeatured(), fig = el.closest('.demo'), next = ids[(ids.indexOf(fig.dataset.topic) + 1) % ids.length];
  PlayableContent.need('topic', next).then(() => {
    if(!fig.isConnected) return;
    store.set('demoAt', next); fig.outerHTML = demoCard(next, true); demoPaint();
    $('.pland .demo [data-action="demo-next"]').focus();
  }, err => console.warn(err));
};
document.addEventListener('input', e => {
  const el = e.target, fig = el.dataset && el.dataset.set && el.closest('.demo'); if(!fig) return;
  const k = KINDS[fig.dataset.demo], s = S(fig), name = el.dataset.set, v = +el.value, label = $(`[data-v="${name}"]`, fig);
  s[name] = v; label.textContent = k.fmt ? k.fmt(name, v) : v + label.dataset.unit;
  k.sync(fig, s); out(fig, k.say(s));
});

Object.assign(A, { demoCard, demoPaint, demoKinds: Object.keys(KINDS) });
})(window.PlayableApp);

PlayableContent.put("code","demos",null,"ebde4b94");
