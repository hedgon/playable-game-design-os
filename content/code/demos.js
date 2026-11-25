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
  return { bars: [[cap(w), s.n / 24, String(s.n)], ['Pairs', p / 276, String(p)]], say: `${s.n} ${w} make ${p} pairs that can interact. Adding one more adds ${s.n} new pairs, not one.` };
});

KINDS.combos = calc('Content multiplies', [['a', 'Enemy types', 1, 8, 1, 4, ''], ['b', 'Weapons', 1, 8, 1, 3, ''], ['c', 'Arenas', 1, 6, 1, 2, '']], s => {
  const n = s.a * s.b * s.c, made = s.a + s.b + s.c, min = Math.min(s.a, s.b, s.c);
  return { bars: [['Pieces made', made / 22, String(made)], ['Situations', n / 384, nf(n)]], say: `${s.a} enemy types × ${s.b} weapons × ${s.c} arenas: ${nf(n)} situations from ${made} pieces of content. One more in the shortest list adds ${nf(n / min)}; whether they play differently is the design work.` };
});

KINDS.ttk = calc('Damage only matters at a hit boundary', [['d', 'Damage per hit', 5, 100, 1, 34, ''], ['r', 'Hits a second', .5, 10, .5, 2, ''], ['h', 'Enemy health', 50, 1000, 10, 100, '']], s => {
  const hits = Math.ceil(s.h / s.d), ttk = (hits - 1) / s.r, next = Math.ceil(s.h / (hits - 1 || 1));
  return { bars: [['Hits to kill', hits / 20, String(hits)], ['Time to kill', ttk / 10, ttk.toFixed(2) + ' s']], say: `${hits} hit${hits === 1 ? '' : 's'} to kill, ${ttk.toFixed(2)} s from the first hit to the last.` + (hits > 1 ? ` Damage has to reach ${next} before it saves a hit: every point below that changes nothing.` : ' One hit: more damage changes nothing at all.') };
});

KINDS.funnel = calc('Every step loses a few', [['n', 'Steps in a row', 1, 20, 1, 6, ''], ['r', 'Share that gets through each step', 50, 99, 1, 90, '%']], s => {
  const w = s.words[0] || 'players', r = s.r / 100, end = Math.pow(r, s.n), half = Math.pow(r, Math.ceil(s.n / 2));
  return { bars: [['After step 1', r, nf(r * 1000)], ['Halfway', half, nf(half * 1000)], ['At the end', end, nf(end * 1000)]], say: `Of 1,000 ${w} that start, ${nf(end * 1000)} get through all ${s.n} step${s.n === 1 ? '' : 's'} at ${s.r}% each. Removing one step saves ${nf((Math.pow(r, s.n - 1) - end) * 1000)} of them, and no single step looks like the problem.` };
});

KINDS.loop = calc('What a loop costs when it repeats', [['l', 'One loop takes', 5, 300, 5, 30, ' s'], ['d', 'Share of it spent waiting', 0, 90, 1, 15, '%'], ['m', 'Session', 5, 120, 5, 20, ' min']], s => {
  const n = Math.floor(s.m * 60 / s.l), each = s.l * s.d / 100, wait = n * each / 60;
  return { bars: [['Playing', 1 - s.d / 100, (100 - s.d) + '%'], ['Waiting', s.d / 100, s.d + '%']], say: `${n} loop${n === 1 ? '' : 's'} in a ${s.m}-minute session. ${nf(each, 1)} s of waiting in each adds up to ${nf(wait, 1)} minutes of the session that are not play.` };
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

KINDS.cycles = calc('How many tries before the date?', [['h', 'One full loop takes', .25, 80, .25, 16, ' h'], ['wk', 'Weeks left', 1, 52, 1, 8, '']], s => {
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
  return { bars: [['To each client', per / 2000, nf(per) + ' kbit/s'], ['From the server', total / 200, nf(total, 1) + ' Mbit/s']], say: `Each client is sent ${s.n} players × ${s.b} bytes × ${s.hz} times a second: ${nf(per)} kbit/s, before packet headers. The server sends that to all ${s.n}: ${nf(total, 1)} Mbit/s. Double the players and the total is four times as much.` };
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
  return { bars: [['One call slow', s.p / 100, s.p + '%'], ['The request slow', x, nf(x * 100, 1) + '%']], say: `If ${s.p}% of calls are slow, independently, and a request waits for ${s.n} of them, ${nf(x * 100, 1)}% of requests are slow. The rare case of one service is the common case of the page that calls it ${s.n} time${s.n === 1 ? '' : 's'}.` };
});

KINDS.scope = calc('Does it fit?', [['f', 'Features', 3, 40, 1, 14, ''], ['e', 'Person-weeks each', .5, 8, .5, 3, ''], ['p', 'People', 1, 20, 1, 4, ''], ['t', 'Weeks to the date', 4, 52, 1, 12, ''], ['u', 'Share of time that goes to features', 30, 90, 5, 60, '%']], s => {
  const need = s.f * s.e, have = s.p * s.t * s.u / 100, top = Math.max(need, have), cut = Math.ceil((need - have) / s.e);
  return { bars: [['Asked for', need / top, nf(need, 1)], ['Available', have / top, nf(have, 1)]], say: `${s.f} features × ${s.e} = ${nf(need, 1)} person-weeks. ${s.p} people × ${s.t} weeks × ${s.u}% = ${nf(have, 1)}. ` + (need > have ? `Over by ${nf(need - have, 1)}: ${cut} feature${cut === 1 ? '' : 's'} come out, or the date moves. Choose which now, while it is a choice.` : `It fits, with ${nf(have - need, 1)} person-weeks spare for what nobody has listed yet.`) };
});

KINDS.wip = calc('Start less, finish sooner', [['wip', s => cap(s.words[0] || 'things') + ' in progress', 1, 40, 1, 12, ''], ['th', 'Finished a week', 1, 20, 1, 4, '']], s => {
  const lt = s.wip / s.th;
  return { bars: [['Average wait for one', lt / 40, nf(lt, 1) + ' weeks'], ['With half as much in progress', lt / 80, nf(lt / 2, 1) + ' weeks']], say: `${s.wip} ${s.words[0] || 'things'} in progress and ${s.th} finished a week: in a steady flow each one takes ${nf(lt, 1)} weeks to get through. Halve what is in progress and the wait halves, without anyone working faster.` };
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
  return { bars: [['Of the beat that counts as a hit', share, pct(share) + '%'], ['Room left after the delay', room / 150, room + ' ms']], say: `At ${s.bpm} BPM a beat lasts ${Math.round(beat)} ms, and a ±${s.hw} ms window accepts ${pct(share)}% of it.` + (!s.lat ? ' Add some delay to see what an uncalibrated screen or headset does to it.' : s.lat > s.hw ? ` With ${s.lat} ms of delay, a press exactly on the beat reads ${s.lat} ms late: a miss every time, and the player blames themselves.` : ` With ${s.lat} ms of delay, a press exactly on the beat reads ${s.lat} ms late: still a hit, with ${room} ms to spare instead of ${s.hw}.`) };
});

KINDS.pacing = {
  t: 'Draw an intensity curve',
  init: () => ({ b0: 2, b1: 4, b2: 6, b3: 3, b4: 8, b5: 5 }),
  html: s => `<div class="demo-stage econ-stage" aria-hidden="true">${'<i></i>'.repeat(6)}</div>` + [0, 1, 2, 3, 4, 5].map(i => slider('b' + i, 'Beat ' + (i + 1), 0, 10, 1, s['b' + i], '')).join(''),
  sync(fig, s){ $$('.econ-stage i', fig).forEach((el, i) => { el.style.height = Math.max(2, s['b' + i] * 10) + '%'; }); },
  act(){},
  say(s){
    const v = [0, 1, 2, 3, 4, 5].map(i => s['b' + i]), top = Math.max(...v), peak = v.indexOf(top) + 1, drops = v.filter((x, i) => i && x < v[i - 1]).length;
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

KINDS.check = {
  t: 'Hold your own project up to this topic',
  ask: t => `Answer for the project as it is today, not as it was planned. Then put this topic’s first question to it: “${t.think.q[0]}”`,
  init: t => ({ items: [...t.think.bad, ...t.think.traps].slice(0, 5), test: t.test[0], i: 0, ans: [] }),
  html: () => `<p class="overline check-n"></p><div class="check-q" aria-live="polite"></div>
    <div class="row check-row">${btn('yes', 'True of us', 'btn primary')}${btn('no', 'Not us', 'btn')}${btn('unsure', 'Not sure', 'btn')}${btn('again', 'Start again', 'btn', ' hidden')}</div>`,
  sync(fig, s){
    const done = s.i >= s.items.length, yes = s.items.filter((_, i) => s.ans[i] === 'yes');
    $('.check-n', fig).textContent = done ? 'True of your project' : `${s.i + 1} of ${s.items.length}`;
    $('.check-q', fig).innerHTML = done ? (yes.length ? '<ul>' + yes.map(x => `<li>${esc(x)}</li>`).join('') + '</ul>' : 'Nothing marked true.') : esc(s.items[s.i]);
    $$('.check-row button', fig).forEach(b => { b.hidden = (b.dataset.do === 'again') !== done; });
  },
  act(fig, s, what){
    if(what === 'again'){ s.i = 0; s.ans = []; } else s.ans[s.i++] = what;
    this.sync(fig, s);
    $('.check-row button:not([hidden])', fig).focus();
  },
  say(s){
    const n = s.items.length, c = v => s.ans.filter(a => a === v).length, yes = c('yes'), unsure = c('unsure');
    if(s.i < n) return s.i ? `${s.i} of ${n} answered: ${yes} true of your project, ${unsure} not sure.` : `${n} statements from this topic. Is each one true of your project?`;
    const test = ` The first test this topic gives: “${s.test}”`;
    if(yes) return `${yes} of ${n} ${yes === 1 ? 'is' : 'are'} true of your project${unsure ? `, and ${unsure} you could not say` : ''}. Start with the first of them.` + test;
    if(unsure) return `None marked true, and ${unsure} you could not say. Not knowing is the finding.` + test;
    return `None of the ${n}. Either this is in good shape, or nobody has looked from outside yet.` + test;
  }
};

const state = new WeakMap();
const S = fig => { let s = state.get(fig); if(!s){ const t = TOPICS[fig.dataset.topic]; s = KINDS[fig.dataset.demo].init(t, t.demo); state.set(fig, s); } return s; };
const out = (fig, text) => { $('.demo-out', fig).textContent = text; };

function demoCard(id, featured){
  const t = TOPICS[id], spec = t && t.demo, k = spec && KINDS[spec.kind]; if(!k) return '';
  const s = k.init(t, spec), ask = spec.ask || (k.ask ? k.ask(t) : '');
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
  const ids = Object.keys(TOPICS).filter(id => TOPICS[id].demo && TOPICS[id].demo.ask), fig = el.closest('.demo'), next = ids[(ids.indexOf(fig.dataset.topic) + 1) % ids.length];
  store.set('demoAt', next); fig.outerHTML = demoCard(next, true); demoPaint();
  $('.pland .demo [data-action="demo-next"]').focus();
};
document.addEventListener('input', e => {
  const el = e.target, fig = el.dataset && el.dataset.set && el.closest('.demo'); if(!fig) return;
  const k = KINDS[fig.dataset.demo], s = S(fig), name = el.dataset.set, v = +el.value, label = $(`[data-v="${name}"]`, fig);
  s[name] = v; label.textContent = k.fmt ? k.fmt(name, v) : v + label.dataset.unit;
  k.sync(fig, s); out(fig, k.say(s));
});

Object.assign(A, { demoCard, demoPaint, demoKinds: Object.keys(KINDS) });
})(window.PlayableApp);

PlayableContent.put("code","demos",null,"bfd2ab02");
