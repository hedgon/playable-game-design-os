/* =====================================================================
   DEMOS
   A topic's "Try it" card: one small thing to operate that shows the
   topic's point (DEMO() in 47-demos.js names the kind and frames it for
   that topic). Loaded on demand with the first page that shows one: the
   build writes this file to content/code/demos.js.
   Each kind is { t, init, html, sync, act, say }: init makes the state
   (from the topic, for a kind that draws on the topic's own text),
   html draws it once, sync updates the drawing after a slider moves,
   act answers a button, say is the sentence under the demo (the result
   in words, so nothing depends on seeing the motion).
   ===================================================================== */
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

/* One hit, and the feedback layers the reader switches on. */
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
    // Contact is 90 ms in. A stop holds both blocks there for 110 ms before anything reacts.
    const you = $('.hit-you', fig), foe = $('.hit-foe', fig), hit = 90, hold = s.stop ? 110 : 0, after = hit + hold;
    if(!calm()){
      you.animate([{ transform: 'none' }, { transform: 'translateX(56px)', offset: hit / (after + 160) }, { transform: 'translateX(56px)', offset: after / (after + 160) }, { transform: 'none' }], { duration: after + 160, easing: 'linear' });
      // With no layer on, the block that is hit does nothing at all: only the attacker moves.
      if(s.knock) foe.animate([{ transform: 'none' }, { transform: 'translateX(14px)' }, { transform: 'none' }], { duration: 180, delay: after, easing: 'ease-out' });
      if(s.flash) foe.animate([{ filter: 'brightness(2.4) saturate(0)' }, { filter: 'none' }], { duration: 120 + hold, delay: hit });
      if(s.squash) foe.animate([{ transform: 'scale(.72,1.22)' }, { transform: 'scale(1.1,.92)', offset: .55 }, { transform: 'none' }], { duration: 260, delay: after, easing: 'ease-out', composite: 'add' });
      // The picture shakes, and the shake fades: big first, small last.
      if(s.shake) $('.hit-stage', fig).animate([5, -4, 3, -2, 1, 0].map((d, i) => ({ transform: `translate(${d}px,${i % 2 ? d / 2 : -d / 2}px)` })), { duration: 240, delay: after });
    }
    this.sync(fig, s);
  },
  say(s){
    const on = Object.keys(HIT_LABEL).filter(k => s[k]);
    return (on.length ? 'Layers on: ' + on.map(k => HIT_LABEL[k].toLowerCase()).join(', ') + '.' : 'No layers: the block that is hit does not react, and only the health bar moves.') + ' Health ' + s.hp + ' of 5.' + (on.length === Object.keys(HIT_LABEL).length ? ' Same rules, same damage: it only feels heavier.' : '');
  }
};

/* A jump as a take-off speed and two gravities, counted in frames at 60 a second. */
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
  // The arc is drawn to fit: 3 px a frame across, the peak scaled into the stage.
  layout(s){ const a = jumpArc(s), sx = Math.min(3, 290 / a.frames), sy = Math.min(1, 108 / Math.max(1, a.top)); return { a, at: f => [5 + f * sx, a.pts[f] * sy] }; },
  sync(fig, s){ const { a, at } = this.layout(s); $('polyline', fig).setAttribute('points', a.pts.map((_, f) => { const [x, y] = at(f); return x.toFixed(1) + ',' + (118 - y).toFixed(1); }).join(' ')); },
  act(fig, s){
    if(calm()) return;
    const { a, at } = this.layout(s);
    $('.jump-dot', fig).animate(a.pts.map((_, f) => { const [x, y] = at(f); return { left: (x / 300 * 100) + '%', bottom: (2 / 120 * 100 + y / 120 * 100) + '%' }; }), { duration: a.frames * 1000 / 60, easing: 'linear' });
  },
  say(s){ const a = jumpArc(s); return `Peak ${Math.round(a.top)} px after ${a.rise} frames, down in ${a.frames - a.rise}: ${a.frames} frames in the air (${Math.round(a.frames * 1000 / 60)} ms at 60 frames a second).` + (s.down > s.up * 1.5 ? ' It rises gently and falls fast.' : s.down < s.up ? ' It hangs on the way down.' : ''); }
};

/* A wind-up of a chosen length: read the cue, then dodge before the strike. */
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
        // The length is fixed when the wind-up starts: moving the slider now changes the next one.
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

/* Push your luck: a growing pot against a growing chance of losing it. */
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

/* An income, a sink and a price, run for a thirty-minute session. */
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

/* Rock, paper, scissors with unequal stakes: the mix at which no option does better than another. */
KINDS.rps = {
  t: 'Change what a win is worth',
  init: () => ({ a: 2, b: 1, c: 1 }),
  html: s => `${bar('r', 'Rock')}${bar('p', 'Paper')}${bar('s', 'Scissors')}
    ${slider('a', 'A win with rock is worth', 1, 5, 1, s.a, '')}${slider('b', 'A win with paper is worth', 1, 5, 1, s.b, '')}${slider('c', 'A win with scissors is worth', 1, 5, 1, s.c, '')}`,
  // Each option's share is the stake of the option it beats: rock ∝ scissors' win, paper ∝ rock's, scissors ∝ paper's.
  mix: s => { const t = s.a + s.b + s.c; return { r: s.c / t, p: s.a / t, s: s.b / t }; },
  sync(fig, s){ const m = this.mix(s); for(const k of ['r', 'p', 's']) setBar(fig, k, m[k], pct(m[k]) + '%'); },
  act(){},
  say(s){
    const m = this.mix(s), names = { r: 'Rock', p: 'Paper', s: 'Scissors' }, max = Math.max(m.r, m.p, m.s), tops = Object.keys(m).filter(k => m[k] === max);
    return `Balanced play: rock ${pct(m.r)}%, paper ${pct(m.p)}%, scissors ${pct(m.s)}%.` + (tops.length === 3 ? ' Equal stakes, equal picks.' : tops.length === 2 ? ` ${names[tops[0]]} and ${names[tops[1]].toLowerCase()} are picked most, and equally: the wins they beat are worth the same.` : ` ${names[tops[0]]} is picked most without having the most valuable win: it beats the option that has it.`);
  }
};

/* The same true win rate, measured twenty times at a chosen sample size. */
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

/* Find one word among N: the more options on screen, the longer the choice takes. */
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

/* A drop rate, as the number of pulls different players need. */
KINDS.odds = {
  t: 'What a drop rate means for the unlucky',
  init: () => ({ p: 2, pity: 0 }),
  fmt: (name, v) => name === 'pity' ? (v ? 'at ' + v + ' pulls' : 'none') : v + '%',
  html: s => `${bar('med', 'Half of players')}${bar('p90', 'Nine in ten')}${bar('p99', 'The unluckiest 1%')}${slider('p', 'Drop rate', .5, 10, .5, s.p, '%')}${slider('pity', 'Guaranteed', 0, 200, 10, s.pity, '')}`,
  need(s, share){ const n = Math.ceil(Math.log(1 - share) / Math.log(1 - s.p / 100)); return s.pity ? Math.min(n, s.pity) : n; },
  sync(fig, s){ const top = this.need(s, .99); for(const [k, q] of [['med', .5], ['p90', .9], ['p99', .99]]){ const n = this.need(s, q); setBar(fig, k, n / top, n + ' pulls'); } },
  act(){},
  say(s){
    // With a guarantee at N, the players who reach it are those who missed N - 1 times in a row.
    const reach = s.pity ? Math.pow(1 - s.p / 100, s.pity - 1) * 100 : 0;
    return `At ${s.p}% half of players have it within ${this.need(s, .5)} pulls, nine in ten within ${this.need(s, .9)}, and one in a hundred needs ${this.need(s, .99)}` + (s.pity ? `. The guarantee at ${s.pity} is where ${reach < 1 ? 'fewer than 1' : Math.round(reach)}% of players end up.` : ' or more: without a guarantee there is no worst case.');
  }
};

/* The topic's own warning signs and traps, held up against the reader's project one at a time.
   Nothing here is written for the demo: the statements, the question and the test are the topic's. */
KINDS.check = {
  t: 'Hold your own project up to this topic',
  ask: t => `Answer for the project as it is today, not as it was planned. Then put this topic’s first question to it: “${t.think.q[0]}”`,
  init: t => ({ items: [...t.think.bad, ...t.think.traps].slice(0, 5), test: t.test[0], i: 0, ans: [] }),
  html: () => `<p class="overline check-n"></p><div class="check-q"></div>
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
    // The pressed button may now be hidden: a keyboard user continues from the first one shown.
    $('.check-row button:not([hidden])', fig).focus();
  },
  say(s){
    const n = s.items.length, c = v => s.ans.filter(a => a === v).length, yes = c('yes'), unsure = c('unsure');
    if(s.i < n) return s.i ? `${s.i} of ${n} answered: ${yes} true of your project, ${unsure} not sure.` : `${n} statements from this topic. Is each one true of your project?`;
    const test = ` The first test this topic gives: “${s.test}”`;
    if(yes) return `${yes} of ${n} ${yes === 1 ? 'is' : 'are'} true of your project${unsure ? `, and ${unsure} you could not say` : ''}. Start with the first one listed.` + test;
    if(unsure) return `None you are sure of, and ${unsure} you could not say. Not knowing is the finding.` + test;
    return `None of the ${n}. Either this is in good shape, or nobody has looked from outside yet.` + test;
  }
};

const state = new WeakMap();
const S = fig => { let s = state.get(fig); if(!s){ s = KINDS[fig.dataset.demo].init(TOPICS[fig.dataset.topic]); state.set(fig, s); } return s; };
const out = (fig, text) => { $('.demo-out', fig).textContent = text; };

// The card for a topic's demo. `featured` adds the topic's name and the way to it (the landing).
// A card starts fresh each time its page is drawn: what a reader did in it is not kept.
function demoCard(id, featured){
  const t = TOPICS[id], spec = t && t.demo, k = spec && KINDS[spec.kind]; if(!k) return '';
  const s = k.init(t), ask = spec.ask || (k.ask ? k.ask(t) : '');
  return `<figure class="card demo" data-demo="${spec.kind}" data-topic="${esc(id)}" style="--dc:${DOM[t.d] ? DOM[t.d].color : 'var(--accent2)'}">
    <figcaption class="demo-head"><span class="overline">Try it${featured ? ' · from ' + esc(t.t) : ''}</span><b>${esc(spec.t || k.t)}</b></figcaption>
    <div class="demo-body">${k.html(s)}</div>
    <p class="small demo-out" aria-live="polite">${esc(k.say(s))}</p>
    ${ask ? `<p class="small demo-ask"><b>Try this.</b> ${esc(ask)}</p>` : ''}
    ${featured ? `<div class="row"><a class="btn sm" href="#/map/t/${esc(id)}">Open the topic →</a><button type="button" class="btn sm ghost" data-action="demo-next">Another demo</button></div>` : ''}</figure>`;
}
// A drawing that depends on the state (an arc, bars) is painted once the card is in the page.
function demoPaint(root){
  $$('.demo', root || document).forEach(fig => {
    if(state.has(fig)) return;
    const k = KINDS[fig.dataset.demo], s = S(fig);
    if(k.fmt) $$('[data-v]', fig).forEach(el => { el.textContent = k.fmt(el.dataset.v, s[el.dataset.v]); });
    k.sync(fig, s);
  });
}

ACTIONS['demo'] = el => { const fig = el.closest('.demo'), k = KINDS[fig.dataset.demo], s = S(fig); k.act(fig, s, el.dataset.do, el); out(fig, k.say(s)); };
// The landing shows one demo at a time; this moves to the next topic that has one of its own
// (a demo with an `ask`: the check kind needs the topic's text, which the landing has not loaded).
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
