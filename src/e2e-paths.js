// Learning-path end-to-end checks in a fresh browser profile, at desktop and
// phone widths: continue opens the checkpoint instead of marking the stage
// done, ticking a step keeps the reader's place, done and skipped stages can
// be undone, an open path shows exactly four structure indicators, the map
// opens framed to the current stage, the chooser suggests a path for every
// answer combination, a checkpoint question can go into Review and out, the
// checkpoint asks one question at a time and schedules what it found, a test-out
// marks a known stage, the stage map and the plain list both show every stage,
// and the adventure look is off by default and still under reduced motion.
// Needs Playwright, like smoke.js.
// Usage: node src/e2e-paths.js   (PLAYWRIGHT_CHANNEL=chrome uses an installed Chrome)
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]) === '/' ? 'playable.html' : decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (err, data) => { if (err) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': ({ '.html': 'text/html; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' })[path.extname(p)] || 'application/octet-stream' }); res.end(data); });
});
(async () => {
  await new Promise(r => server.listen(0, r));
  const BASE = `http://localhost:${server.address().port}/playable.html`;
  const browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail: ok ? '' : String(detail).slice(0, 900) });
  for (const [w, h] of [[1440, 900], [375, 812]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const nav = async r => { await page.evaluate(r => new Promise(res => { if (location.hash === r) return res(); const f = () => { removeEventListener('hashchange', f); res(); }; addEventListener('hashchange', f); location.hash = r; }), r); await page.evaluate(() => window.PlayableApp.settled()); await page.waitForTimeout(120); };
    await page.goto(BASE + '#/paths'); await page.waitForTimeout(300);
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    const P = await page.evaluate(() => ({ id: PATHS[0].id, s1: PATHS[0].stages[0].id, s2: PATHS[0].stages[1].id, n: PATHS[0].stages[0].steps.length }));
    const prog = () => page.evaluate(id => JSON.parse(localStorage.getItem('playable.path.' + id) || '{"steps":{},"stages":{}}'), P.id);
    const tag = `${w}px`;

    // --- keep the place: ticking a step does not jump to the top
    await nav(`#/paths/${P.id}/${P.s1}`);
    const scroller = await page.evaluate(() => { const p = document.getElementById('pane'); return p.scrollHeight > p.clientHeight + 4 && getComputedStyle(p).overflowY !== 'visible' ? 'pane' : 'window'; });
    const scrollTop = () => page.evaluate(s => s === 'pane' ? document.getElementById('pane').scrollTop : window.scrollY, scroller);
    const rows = `#pane .pathstage.open .pathstep input[type=checkbox]`;
    await page.evaluate(sel => document.querySelectorAll(sel)[2].scrollIntoView({ block: 'center' }), rows);
    const before = await scrollTop();
    await page.evaluate(sel => document.querySelectorAll(sel)[0]?.click(), rows);
    await page.waitForTimeout(120);
    const after = await scrollTop();
    check(`${tag} ticking a step keeps the scroll position (${scroller})`, before > 20 && Math.abs(after - before) < 80, `before ${before} after ${after}`);
    const nextVisible = await page.evaluate(() => { const r = document.querySelector('#pane .pathstage.open .pathstep:not(.done)'); if (!r) return false; const b = r.getBoundingClientRect(); return b.top >= 0 && b.bottom <= innerHeight; });
    check(`${tag} the next unticked step is in view`, nextVisible);

    // --- checkpoint first
    for (let i = 1; i < P.n; i++) { await page.evaluate(([sel, i]) => document.querySelectorAll(sel)[i]?.click(), [rows, i]); await page.waitForTimeout(60); }
    await nav('#/map/home'); await nav(`#/paths/${P.id}/${P.s1}`);
    const barCp = await page.evaluate(() => ({ btn: !!document.querySelector('.pathbar [data-action="path-continue"], .pathbar a.primary'), text: document.querySelector('.pathbar-info').textContent, open: !!document.querySelector('#pane .pathcheck[open]') }));
    check(`${tag} at an open checkpoint the bar says so and does not offer to open it`, !barCp.btn && barCp.open && /checkpoint for/i.test(barCp.text) && !/^\s*·/.test(barCp.text), JSON.stringify(barCp));
    // ticking the last step and continuing lands on the checkpoint, focused
    await page.evaluate(([sel, i]) => document.querySelectorAll(sel)[i]?.click(), [rows, P.n - 1]); await page.waitForTimeout(200);
    const lastHref = await page.evaluate(([pid, sid, n]) => { const st = PATHS.find(p => p.id === pid).stages.find(s => s.id === sid); return stepHref(st.steps[n - 1], pid, sid); }, [P.id, P.s1, P.n]);
    await nav(lastHref);
    await page.evaluate(() => document.querySelector('.pathbar [data-action="path-continue"]')?.click()); await page.waitForTimeout(250);
    const cp = await page.evaluate(s1 => { const d = document.querySelector(`#pane .pathstage[data-stage="${s1}"] .pathcheck`); return { open: d && d.open, focused: document.activeElement === (d && d.querySelector('summary')) }; }, P.s1);
    check(`${tag} continue opens and focuses the checkpoint`, cp.open && cp.focused, JSON.stringify(cp));
    check(`${tag} continue does not mark the stage done`, !(await prog()).stages[P.s1], JSON.stringify((await prog()).stages));

    // --- undo from the toast
    await page.evaluate(s1 => document.querySelector(`#pane .pathstage[data-stage="${s1}"] [data-action="stage-done"]`)?.click(), P.s1); await page.waitForTimeout(200);
    check(`${tag} marking done records it`, (await prog()).stages[P.s1] === 'done');
    const toastBtn = await page.evaluate(() => { const b = document.querySelector('#toast.show .toastbtn'); if (!b) return null; const r = b.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { text: b.textContent, reachable: hit === b }; });
    check(`${tag} the toast offers a reachable Undo`, toastBtn && toastBtn.text === 'Undo' && toastBtn.reachable, JSON.stringify(toastBtn));
    await page.evaluate(() => document.querySelector('#toast .toastbtn')?.click()); await page.waitForTimeout(200);
    check(`${tag} Undo in the toast reopens the stage`, !(await prog()).stages[P.s1] && (await page.evaluate(() => location.hash)).endsWith('/' + P.s1), JSON.stringify((await prog()).stages));

    // --- undo from the stage header
    await nav(`#/paths/${P.id}/${P.s2}`);
    await page.evaluate(s2 => document.querySelector(`#pane .pathstage[data-stage="${s2}"] [data-action="stage-skip"]`)?.click(), P.s2); await page.waitForTimeout(200);
    await nav(`#/paths/${P.id}/${P.s2}`);
    const hdr = await page.evaluate(s2 => { const b = document.querySelector(`#pane .pathstage[data-stage="${s2}"] header [data-action="stage-undo"]`); return b && b.textContent; }, P.s2);
    check(`${tag} a skipped stage shows "Undo skip" in its header`, hdr === 'Undo skip', hdr);
    await page.evaluate(s2 => document.querySelector(`#pane .pathstage[data-stage="${s2}"] header [data-action="stage-undo"]`)?.click(), P.s2); await page.waitForTimeout(200);
    check(`${tag} Undo in the header clears the skip`, !(await prog()).stages[P.s2]);

    // --- one structure view: exactly the four named indicators on an open path
    await nav('#/paths/systems-designer'); await page.waitForTimeout(700);
    const ind = await page.evaluate(() => ({
      bar: document.querySelectorAll('#pane .pathbar').length,
      mapNodes: document.querySelectorAll('#mapsvg .node[data-scope="path"]').length,
      progress: document.querySelectorAll('#pane .progress').length,
      stages: document.querySelectorAll('#pane .pathstages').length,
      crumbs: document.querySelectorAll('#pane .view .crumbs').length,
      callouts: document.querySelectorAll('#pane .view > .callout').length,
      railSteps: document.querySelectorAll('#rail .railtopic[data-step]').length,
      railPaths: document.querySelectorAll('#rail .railtopic[data-path]').length,
      counter: document.getElementById('progressText').textContent
    }));
    check(`${tag} an open path shows exactly: path bar, map path nodes, one progress line, the stage view`, ind.bar === 1 && ind.mapNodes > 0 && ind.progress === 1 && ind.stages === 1, JSON.stringify(ind));
    check(`${tag} no second breadcrumb, no Next callout, no rail step outline`, !ind.crumbs && !ind.callouts && !ind.railSteps && ind.railPaths >= 12, JSON.stringify(ind));
    check(`${tag} the global counter reads "Topics read N/M"`, /^Topics read \d+\/\d+$/.test(ind.counter), ind.counter);
    const next = await page.evaluate(() => { const r = document.querySelector('#pane .pathstage.open .pathstep.next'); return r ? r.dataset.row : null; });
    check(`${tag} the next step is marked in the open stage`, !!next, next);
    if (w >= 1100) {
      const framed = await page.evaluate(() => { const wrap = document.getElementById('mapwrap').getBoundingClientRect(); const steps = [...document.querySelectorAll('#mapsvg .node[data-scope="path"][data-kind="topic"]')].map(n => n.getBoundingClientRect()); return { n: steps.length, inside: steps.every(r => r.left >= wrap.left - 1 && r.right <= wrap.right + 1 && r.top >= wrap.top - 1 && r.bottom <= wrap.bottom + 1), minH: Math.min(...steps.map(r => r.height)) }; });
      check(`${tag} the map opens framed to the current stage, steps readable`, framed.n > 0 && framed.inside && framed.minH >= 22, JSON.stringify(framed));
      // a click on another stage keeps the zoom: the scale on screen is unchanged (unless its labels were under 11px) and the stage's own card is whole in the stage
      {
        const SC = () => { const v = document.getElementById('mapsvg').viewBox.baseVal, r = document.getElementById('mapwrap').getBoundingClientRect(); return Math.min(r.width / v.width, r.height / v.height); };
        const s0 = await page.evaluate(SC);
        const clicked = await page.evaluate(() => { const n = document.querySelector('#mapsvg .node[data-scope="path"][data-kind="domain"]:not(.open)'); if (!n) return false; n.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; });
        await page.waitForTimeout(800);
        const after = await page.evaluate(() => { const wr = document.getElementById('mapwrap').getBoundingClientRect(), n = document.querySelector('#mapsvg .node[data-scope="path"][data-kind="domain"].open .disc'); if (!n) return null; const r = n.getBoundingClientRect(); return { inside: r.left >= wr.left - 1 && r.right <= wr.right + 1 && r.top >= wr.top - 1 && r.bottom <= wr.bottom + 1 }; });
        const s1 = await page.evaluate(SC);
        check(`${tag} clicking another stage on the map keeps the zoom and keeps that stage in view`, clicked && !!after && after.inside && s1 >= s0 * 0.99 && (s1 <= s0 * 1.01 || s0 * 13.5 < 11.5), JSON.stringify({ clicked, after, s0, s1 }));
      }
      // a step node opens that step in the stage view
      await page.evaluate(() => { const nodes = document.querySelectorAll('#mapsvg .node[data-scope="path"][data-kind="topic"]'); nodes[nodes.length - 1].dispatchEvent(new MouseEvent('click', { bubbles: true })); }); await page.waitForTimeout(400);
      const flashed = await page.evaluate(() => { const r = document.querySelector('#pane .pathstep.flash'); if (!r) return null; const b = r.getBoundingClientRect(); return { row: r.dataset.row, inView: b.top >= 0 && b.bottom <= innerHeight, hash: location.hash }; });
      check(`${tag} clicking a step node shows that step in the stage view`, flashed && flashed.inView && /^#\/paths\/systems-designer\/[^/]+$/.test(flashed.hash), JSON.stringify(flashed));
    }
    if (w < 700) {
      // the phone map: the same path tree on the canvas (Map pill shows it), nothing wider than the screen, readable labels, a tap on a stage opens it; List keeps the outline
      await page.evaluate(() => document.getElementById('drawerClose').click()); await page.waitForTimeout(700);
      const pm = await page.evaluate(() => { const wr = document.getElementById('mapwrap').getBoundingClientRect(), lbl = [...document.querySelectorAll('#mapsvg .node[data-scope="path"] .lbl:not(.sub)')].map(t => t.getBoundingClientRect().height).filter(Boolean);
        return { svg: getComputedStyle(document.getElementById('mapsvg')).display !== 'none', out: getComputedStyle(document.getElementById('mapoutline')).display !== 'none', nodes: document.querySelectorAll('#mapsvg .node[data-scope="path"]').length, sw: document.documentElement.scrollWidth, wrapH: wr.height, wide: [...document.querySelectorAll('body *')].filter(e => !e.closest('svg') && e.getBoundingClientRect().width > innerWidth + 1).length, minLbl: lbl.length ? Math.min(...lbl) : 0 }; });
      check(`${tag} the path map is the canvas on a phone, fits the width, fills the stage`, pm.svg && !pm.out && pm.nodes > 0 && pm.sw <= 375 && !pm.wide && pm.wrapH > 350, JSON.stringify(pm));
      const px = await page.evaluate(() => { const t = document.querySelector('#mapsvg .node[data-scope="path"] .lbl:not(.sub)'); return t ? parseFloat(getComputedStyle(t).fontSize) * (document.getElementById('mapsvg').getBoundingClientRect().width / document.getElementById('mapsvg').viewBox.baseVal.width) : 0; });
      check(`${tag} path map labels are at least 11px on a phone`, px >= 10.9, px);
      await page.evaluate(() => { const st = document.querySelector('#mapsvg .node[data-scope="path"][data-kind="domain"]:not(.open)'); st.dispatchEvent(new MouseEvent('click', { bubbles: true })); }); await page.waitForTimeout(600);
      const stg = await page.evaluate(() => ({ hash: location.hash, sw: document.documentElement.scrollWidth }));
      check(`${tag} tapping a stage on the phone path map opens it`, /^#\/paths\/[^/]+\/[^/]+$/.test(stg.hash) && stg.sw <= 375, JSON.stringify(stg));
      await page.evaluate(() => { localStorage.setItem('playable.mapPhoneView', '"list"'); }); await nav('#/paths/' + P.id + '/' + P.s1); await page.reload(); await page.waitForTimeout(700);
      await page.evaluate(() => document.getElementById('drawerClose').click()); await page.waitForTimeout(500);
      const lst = await page.evaluate(() => ({ out: getComputedStyle(document.getElementById('mapoutline')).display !== 'none', svg: getComputedStyle(document.getElementById('mapsvg')).display !== 'none', rows: document.querySelectorAll('#mapoutline [data-scope="path"] .oi-row').length }));
      check(`${tag} List shows the path as the outline`, lst.out && !lst.svg && lst.rows > 0, JSON.stringify(lst));
      await page.evaluate(() => { localStorage.setItem('playable.mapPhoneView', '"map"'); }); await page.reload(); await page.waitForTimeout(500);
    }

    // --- chooser: three answers suggest one path, and its card is marked
    await nav('#/paths');
    for (const [q, v] of [['goal', 'ship'], ['level', 'new'], ['time', '5']]) { await page.evaluate(([q, v]) => document.querySelector(`#pane [data-action="choose"][data-q="${q}"][data-v="${v}"]`)?.click(), [q, v]); await page.waitForTimeout(80); }
    const pick = await page.evaluate(() => ({ title: document.querySelector('#pane .chooser-pick h3')?.textContent, picked: [...document.querySelectorAll('#pane .card.picked')].map(c => c.dataset.pathCard), pressed: document.querySelectorAll('#pane .chooser [aria-pressed="true"]').length }));
    check(`${tag} the chooser suggests a path and marks its card`, pick.title === 'Ship a game on PC, console and mobile' && pick.picked.length === 1 && pick.picked[0] === 'ship-it' && pick.pressed === 3, JSON.stringify(pick));
    const allCombos = await page.evaluate(() => { let n = 0, bad = []; for (const [g] of CHOOSER.goals) for (const [l] of CHOOSER.levels) for (const [t] of CHOOSER.times) { n++; const r = choosePath(g, l, t); if (!r || !PATHS.includes(r.path)) bad.push([g, l, t].join('/')); } return { n, bad, expect: CHOOSER.goals.length * CHOOSER.levels.length * CHOOSER.times.length }; });
    check(`${tag} every chooser combination (${allCombos.n}) suggests a path`, allCombos.n === allCombos.expect && !allCombos.bad.length, JSON.stringify(allCombos.bad));

    // --- the chooser sends an unprepared learner to the prerequisite first, with weeks and links
    for (const [q, v] of [['goal', 'iv-design'], ['level', 'new'], ['time', '5']]) { await page.evaluate(([q, v]) => document.querySelector(`#pane [data-action="choose"][data-q="${q}"][data-v="${v}"]`)?.click(), [q, v]); await page.waitForTimeout(80); }
    const pre = await page.evaluate(() => ({ over: document.querySelector('#pane .chooser-pick .overline')?.textContent, h: document.querySelector('#pane .chooser-pick h3')?.textContent, txt: document.querySelector('#pane .chooser-pick p')?.textContent, links: [...document.querySelectorAll('#pane .chooser-pick a')].map(a => a.getAttribute('href')) }));
    check(`${tag} an unprepared designer is told to start with the prerequisite, with weeks`, pre.over === 'Start here first' && pre.h === 'Game designer foundations' && /about \d+ weeks?/.test(pre.txt) && pre.links.includes('#/paths/game-designer-foundations') && pre.links.includes('#/paths/interview-prep-designer'), JSON.stringify(pre));
    for (const [q, v] of [['goal', 'gameplay'], ['level', 'some'], ['time', '5']]) { await page.evaluate(([q, v]) => document.querySelector(`#pane [data-action="choose"][data-q="${q}"][data-v="${v}"]`)?.click(), [q, v]); await page.waitForTimeout(80); }
    const exp = await page.evaluate(() => document.querySelector('#pane .chooser-pick h3')?.textContent);
    check(`${tag} an engineer with some experience is taken straight to the engine path`, exp === 'Gameplay engineer, Godot', exp);
    // the advanced design path: an experienced designer is taken straight to it, and its five stages render
    for (const [q, v] of [['goal', 'design'], ['level', 'senior'], ['time', '5']]) { await page.evaluate(([q, v]) => document.querySelector(`#pane [data-action="choose"][data-q="${q}"][data-v="${v}"]`)?.click(), [q, v]); await page.waitForTimeout(80); }
    const sen = await page.evaluate(() => ({ h: document.querySelector('#pane .chooser-pick h3')?.textContent, picked: [...document.querySelectorAll('#pane .card.picked')].map(c => c.dataset.pathCard) }));
    check(`${tag} an experienced designer is taken first to the senior design path`, sen.h === 'Senior game designer' && sen.picked.length === 1 && sen.picked[0] === 'senior-game-designer', JSON.stringify(sen));
    await nav('#/paths/senior-game-designer'); await page.waitForTimeout(300);
    const senStages = await page.evaluate(() => [...document.querySelectorAll('#pane .overworld .region a')].map(e => e.getAttribute('href').split('/').pop()));
    check(`${tag} the senior design path page renders its five stages`, senStages.length === 5 && senStages.join() === 's1,s2,s3,s4,s5', senStages.join());
    // the advanced developer path: an experienced gameplay, backend or AI learner is taken first to it, and its six stages render
    await nav('#/paths'); await page.waitForTimeout(200);
    for (const [q, v] of [['level', 'senior'], ['time', '5']]) { await page.evaluate(([q, v]) => document.querySelector(`#pane [data-action="choose"][data-q="${q}"][data-v="${v}"]`)?.click(), [q, v]); await page.waitForTimeout(80); }
    for (const g of ['gameplay', 'backend', 'ai']) {
      for (const [q, v] of [['goal', g]]) { await page.evaluate(([q, v]) => document.querySelector(`#pane [data-action="choose"][data-q="${q}"][data-v="${v}"]`)?.click(), [q, v]); await page.waitForTimeout(80); }
      const dev = await page.evaluate(() => ({ h: document.querySelector('#pane .chooser-pick h3')?.textContent, picked: [...document.querySelectorAll('#pane .card.picked')].map(c => c.dataset.pathCard) }));
      check(`${tag} an experienced ${g} learner is taken first to the senior developer path`, dev.h === 'Senior game developer in the AI era' && dev.picked.length === 1 && dev.picked[0] === 'senior-game-developer-ai-era', JSON.stringify(dev));
    }
    await nav('#/paths/senior-game-developer-ai-era'); await page.waitForTimeout(300);
    const devStages = await page.evaluate(() => [...document.querySelectorAll('#pane .overworld .region a')].map(e => e.getAttribute('href').split('/').pop()));
    check(`${tag} the senior developer path page renders its six stages`, devStages.join() === 's1,s2,s3,s4,s5,s6', devStages.join());
    await nav('#/paths'); await page.waitForTimeout(200);
    // a one-of prerequisite (prereqAny) never forces a detour: the pick is direct, with the good bases named
    for (const [q, v] of [['goal', 'iv-eng'], ['level', 'new'], ['time', '5']]) { await page.evaluate(([q, v]) => document.querySelector(`#pane [data-action="choose"][data-q="${q}"][data-v="${v}"]`)?.click(), [q, v]); await page.waitForTimeout(80); }
    const anyOf = await page.evaluate(() => ({ h: document.querySelector('#pane .chooser-pick h3')?.textContent, over: document.querySelector('#pane .chooser-pick .overline')?.textContent, txt: document.querySelector('#pane .chooser-pick p')?.textContent }));
    check(`${tag} a one-of prerequisite is named as a good base, not forced first`, anyOf.over === 'Suggested path' && anyOf.h === 'Interview prep, engineering' && /A good base first: one of/.test(anyOf.txt), JSON.stringify(anyOf));

    // --- the path bar keeps the step's task in view; continue ticks and moves on
    await nav('#/paths/game-ai-programmer'); await page.waitForTimeout(200);
    const S = await page.evaluate(() => { const st = PATHS.find(p => p.id === 'game-ai-programmer').stages[0]; return { h0: stepHref(st.steps[0], 'game-ai-programmer', st.id), h1: stepHref(st.steps[1], 'game-ai-programmer', st.id), do0: st.steps[0].do, min0: st.steps[0].min }; });
    await nav(S.h0); await page.waitForTimeout(200);
    const tk = await page.evaluate(() => { const t = document.querySelector('#pane .pathbar-task'); const r = t && t.getBoundingClientRect(); const more = t && t.querySelector('.pt-more'); return t ? { text: t.textContent, top: r.top, moreShown: getComputedStyle(more).display !== 'none' } : null; });
    check(`${tag} a page opened from a step shows the step's task and time in the bar`, tk && tk.text.includes(S.do0) && tk.text.includes(S.min0 + ' min'), JSON.stringify(tk));
    if (w < 700) {
      const tg = await page.evaluate(() => { const t = document.querySelector('#pane .pathbar-task'), tx = t.querySelector('.pt-text'), before = tx.scrollHeight > tx.clientHeight + 2; t.querySelector('.pt-more').click(); const after = document.querySelector('#pane .pathbar-task .pt-text'); return { clipped: before, open: document.querySelector('#pane .pathbar-task').classList.contains('open'), full: after.scrollHeight <= after.clientHeight + 2 }; });
      check(`${tag} on a phone the task is one line and expands to the whole text`, tg.clipped && tg.open && tg.full, JSON.stringify(tg));
    }
    await page.evaluate(() => { document.getElementById('pane').scrollTo(0, 600); window.scrollTo(0, 600); }); await page.waitForTimeout(100);
    const stuck = await page.evaluate(() => { const t = document.querySelector('#pane .pathbar-task'); const r = t.getBoundingClientRect(); return { top: r.top, visible: r.top >= 0 && r.bottom <= innerHeight }; });
    const innerH = h;
    check(`${tag} the task line stays visible while scrolling`, stuck.visible && stuck.top < innerH * 0.4, JSON.stringify(stuck));
    await page.evaluate(() => document.querySelector('.pathbar [data-action="path-continue"]')?.click()); await page.waitForTimeout(250);
    const cont = await page.evaluate(() => ({ hash: location.hash, ticked: JSON.parse(localStorage.getItem('playable.path.game-ai-programmer') || '{}').steps }));
    check(`${tag} "Mark done and continue" ticks the step and opens the next one`, cont.hash === S.h1 && cont.ticked && cont.ticked['s1/0'], JSON.stringify(cont));

    // --- a game lens has its own address and lands on the lens
    await nav('#/games/pac-man/gameplay'); await page.waitForTimeout(300);
    const ln = await page.evaluate(() => { const c = document.getElementById('lens-gameplay'); const r = c && c.getBoundingClientRect(); return { top: r && r.top, inView: !!r && r.top >= 0 && r.top < innerHeight * 0.6, strip: document.querySelectorAll('#pane .lenscontents a[href^="#/games/pac-man/"]').length }; });
    check(`${tag} #/games/pac-man/gameplay scrolls the gameplay lens into view, with a contents strip`, ln.inView && ln.strip >= 5, JSON.stringify(ln));
    const stepLens = await page.evaluate(() => { const st = PATHS.find(p => p.id === 'game-ai-programmer').stages[0].steps.find(s => s.ref === 'pac-man'); return { kind: st.kind, href: stepHref(st, 'game-ai-programmer', 's1') }; });
    check(`${tag} a step that reads one lens links to it`, stepLens.href === '#/games/pac-man/gameplay', JSON.stringify(stepLens));
    await nav('#/games/zelda'); await page.waitForTimeout(200);
    const ser = await page.evaluate(() => { const t = document.querySelector('#pane .seriestake'), w = document.querySelector('#pane .view .card:not(.seriestake)'); return !!t && !!w && (t.compareDocumentPosition(w) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0; });
    check(`${tag} a series page leads with the series takeaway`, ser);

    // --- the review queue answers on #/paths/review too
    await nav('#/paths/review'); await page.waitForTimeout(250);
    const rv = await page.evaluate(() => ({ hash: location.hash, h1: document.querySelector('#pane h1')?.textContent }));
    check(`${tag} #/paths/review opens the Review queue`, rv.hash === '#/review' && rv.h1 === 'Review', JSON.stringify(rv));

    // --- checkpoint recall: answer outline, review later, coming up, remove
    await nav('#/paths/ship-it/s1');
    const rq = await page.evaluate(() => { const d = document.querySelector('#pane .pathstage[data-stage="s1"] .recall details.ivq'); if (!d) return null; d.open = true; return { q: d.querySelector('summary').textContent, a: d.querySelector('.body p').textContent.length }; });
    check(`${tag} a checkpoint question opens to its answer outline`, rq && rq.a > 40, JSON.stringify(rq));
    await page.evaluate(() => document.querySelector('#pane .pathstage[data-stage="s1"] .recall [data-action="review-toggle"]')?.click()); await page.waitForTimeout(100);
    const key = `ck:ship-it:s1:${rq && rq.q}`;
    const stored = await page.evaluate(k => { const r = JSON.parse(localStorage.getItem('playable.review') || '{}')[k]; return r ? { a: r.a.length, src: r.src } : null; }, key);
    check(`${tag} "Review later" queues it with its outline and source`, stored && stored.a > 40 && stored.src === '#/paths/ship-it/s1', JSON.stringify(stored));
    await nav('#/review');
    const up = await page.evaluate(q => [...document.querySelectorAll('#pane .review-later li span:first-child')].some(s => s.textContent === q), rq && rq.q);
    check(`${tag} it appears under Coming up on the Review page`, up);
    await page.evaluate(() => document.querySelector('#pane .review-later [data-action="review-remove"]')?.click()); await page.waitForTimeout(100);
    const gone = await page.evaluate(k => !JSON.parse(localStorage.getItem('playable.review') || '{}')[k], key);
    check(`${tag} it can be removed from the queue`, gone);

    // --- second walkthrough: bar position, deep links, More menu, drawers, Make jobs, Map pill, data controls, read marks, practice
    const stepH = await page.evaluate(() => { const P0 = PATHS.find(p => p.id === 'game-ai-programmer'), st = P0.stages[0]; return stepHref(st.steps[0], P0.id, st.id); });
    await nav('#/paths/game-ai-programmer'); await nav(stepH); await page.waitForTimeout(200);
    await page.evaluate(() => { document.getElementById('pane').scrollTo(0, 700); window.scrollTo(0, 700); }); await page.waitForTimeout(250);
    if (w < 700) {
      const cb = await page.evaluate(() => { const b = document.querySelector('#pane .pathbar'); return { c: b.classList.contains('compact'), h: b.getBoundingClientRect().height, done: !!b.querySelector('.pm-done') }; });
      check(`${tag} scrolled, the phone path bar is one compact line (<= 56px)`, cb.c && cb.h <= 56, JSON.stringify(cb));
      await page.evaluate(() => document.querySelector('#pane .pathbar .pm-text').click()); await page.waitForTimeout(200);
      const ex = await page.evaluate(() => { const b = document.querySelector('#pane .pathbar'); return { c: b.classList.contains('compact'), h: b.getBoundingClientRect().height }; });
      check(`${tag} tapping the compact task line shows the whole bar`, !ex.c && ex.h > 80, JSON.stringify(ex));
      await page.evaluate(() => { document.getElementById('pane').scrollTo(0, 0); }); await page.waitForTimeout(150); await page.evaluate(() => { document.getElementById('pane').scrollTo(0, 700); }); await page.waitForTimeout(250);
    }
    const pos = await page.evaluate(() => { const b = document.querySelector('#pane .pathbar').getBoundingClientRect(), paneR = document.getElementById('pane').getBoundingClientRect(), hd = document.querySelector('.topbar').getBoundingClientRect().bottom; return { top: b.top, paneTop: paneR.top, hd, narrow: innerWidth <= 1100 }; });
    check(`${tag} the path bar sticks at the top of the scrolling pane (below the header)`, Math.abs(pos.top - (pos.narrow ? pos.paneTop : pos.hd)) <= 2, JSON.stringify(pos));
    await nav('#/games/pac-man/gameplay'); await page.waitForTimeout(500);
    const dl = await page.evaluate(() => ({ card: document.getElementById('lens-gameplay').getBoundingClientRect().top, bar: document.querySelector('#pane .pathbar').getBoundingClientRect().bottom }));
    check(`${tag} a lens deep link lands below the path bar`, dl.card >= dl.bar - 1, JSON.stringify(dl));
    await nav('#/paths'); await page.waitForTimeout(150);
    const dataBtns = await page.evaluate(() => ['data-export', 'data-import', 'data-reset'].map(a => !!document.querySelector('#pane [data-action="' + a + '"]')));
    check(`${tag} Export, Import and Reset are on the paths page`, dataBtns.every(Boolean), JSON.stringify(dataBtns));
    if (w < 700) {
      for (const r of ['#/paths', '#/games', '#/lab', '#/map/t/core-loop/overview', '#/games/pac-man']) {
        await nav(r);
        await page.click('#navMore'); await page.waitForTimeout(120);
        const hit = await page.evaluate(() => [...document.querySelectorAll('.nav-extra')].map(b => { const q = b.getBoundingClientRect(), e = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return e === b || b.contains(e); }));
        check(`${tag} the More menu items are clickable on ${r}`, hit.length >= 2 && hit.every(Boolean), JSON.stringify(hit));
        await page.click('#navMore');
      }
      await nav('#/map/home');
      const closed = await page.evaluate(() => ['rail', 'pane'].map(id => { const el = document.getElementById(id); return el.classList.contains('open') ? 0 : [...el.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(e => !e.closest('[inert]') && e.tabIndex >= 0).length; }));
      check(`${tag} a closed drawer has no focusable element`, closed.every(n => n === 0), JSON.stringify(closed));
      await page.click('#railToggle'); await page.waitForTimeout(250);
      const inRail = await page.evaluate(() => document.getElementById('rail').contains(document.activeElement));
      await page.keyboard.press('Escape'); await page.waitForTimeout(250);
      const back = await page.evaluate(() => ({ open: document.getElementById('rail').classList.contains('open'), id: document.activeElement.id }));
      check(`${tag} opening a drawer focuses it; Escape closes it and returns focus to the opener`, inRail && !back.open && back.id === 'railToggle', JSON.stringify(back));
      await nav('#/lab');
      const jobs = await page.evaluate(() => { const j = document.querySelector('#pane .makejobs'); return !!j && j.getBoundingClientRect().width > 0 && /Start here/.test(j.textContent) && j.querySelectorAll('a').length >= 8; });
      check(`${tag} Make shows the tools by job, with Start here, in the page`, jobs);
      await page.evaluate(() => document.querySelector('.pathbar [data-action="leave-path"]')?.click()); await page.waitForTimeout(150);
      const pill = async r => { await nav(r); return page.evaluate(() => { const d = document.getElementById('drawerClose'); return d.classList.contains('show') && getComputedStyle(d).display !== 'none'; }); };
      const pills = { topic: await pill('#/map/t/core-loop/overview'), paths: await pill('#/paths'), library: await pill('#/games'), make: await pill('#/lab'), review: await pill('#/review') };
      check(`${tag} the Map pill shows on a topic and not on Paths, Library, Make or Review`, pills.topic && !pills.paths && !pills.library && !pills.make && !pills.review, JSON.stringify(pills));
    }
    // opening a topic does not count it as read; marking it does
    const tid = await page.evaluate(() => Object.keys(TOPICS).find(t => !JSON.parse(localStorage.getItem('playable.seen') || '[]').includes(t)));
    await nav('#/map/t/' + tid + '/overview'); await page.waitForTimeout(200);
    const seenBefore = await page.evaluate(t => JSON.parse(localStorage.getItem('playable.seen') || '[]').includes(t), tid);
    await page.evaluate(() => document.querySelector('#pane [data-action="topic-read"]')?.click()); await page.waitForTimeout(100);
    const seenAfter = await page.evaluate(t => JSON.parse(localStorage.getItem('playable.seen') || '[]').includes(t), tid);
    check(`${tag} opening a topic does not mark it read; "Mark as read" does`, !seenBefore && seenAfter, JSON.stringify({ seenBefore, seenAfter }));
    // review: nothing due, so Practise now offers items without touching the schedule
    await page.evaluate(() => { const due = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000) + 3; localStorage.setItem('playable.review', JSON.stringify({ a: { q: 'Q one', a: 'A one', src: '#/paths', box: 1, due }, b: { q: 'Q two', a: 'A two', src: '#/paths', box: 0, due: due + 2 } })); });
    await nav('#/paths'); await nav('#/review'); await page.waitForTimeout(150);
    const rvBefore = await page.evaluate(() => localStorage.getItem('playable.review'));
    const empt = await page.evaluate(() => ({ text: document.querySelector('#pane .empty')?.textContent || '', btn: !!document.querySelector('#pane [data-action="review-practise"]') }));
    check(`${tag} an empty due list explains when items return and offers Practise now`, empt.btn && /comes back a day after/.test(empt.text), JSON.stringify(empt));
    await page.evaluate(() => document.querySelector('#pane [data-action="review-practise"]')?.click()); await page.waitForTimeout(100);
    const pr = await page.evaluate(() => document.querySelectorAll('#pane .review-item').length);
    await page.evaluate(() => document.querySelector('#pane [data-action="review-practise-next"]')?.click()); await page.waitForTimeout(100);
    const rvAfter = await page.evaluate(() => localStorage.getItem('playable.review'));
    check(`${tag} Practise now lists not-yet-due items and leaves the schedule unchanged`, pr === 2 && rvBefore === rvAfter, JSON.stringify({ pr }));
    await page.evaluate(() => localStorage.removeItem('playable.review'));

    // --- the checkpoint, one question at a time (research/learning-science.md 2.3)
    await page.evaluate(() => { localStorage.removeItem('playable.review'); localStorage.removeItem('playable.path.performance-engineer'); localStorage.removeItem('playable.pathView'); });
    await nav('#/paths/performance-engineer/s1'); await page.waitForTimeout(150);
    const F = '#pane .pathstage[data-stage="s1"] .fight[data-mode="check"]';
    await page.evaluate(() => { document.querySelector('#pane .pathstage[data-stage="s1"] .pathcheck').open = true; });
    await page.click(F + ' [data-action="fight-start"]');
    const ask = await page.evaluate(f => { const el = document.querySelector(f); return { q: !!el.querySelector('.fight-q'), outline: !!el.querySelector('[data-fight-idea]'), revealDisabled: el.querySelector('[data-action="fight-reveal"]').disabled, focus: document.activeElement === el.querySelector('.fight-q') }; }, F);
    check(`${tag} the checkpoint asks one question alone, the outline hidden until a confidence tap`, ask.q && !ask.outline && ask.revealDisabled && ask.focus, JSON.stringify(ask));
    // the first answer is right but marked a guess; the second is missed, so it is asked once more
    const answer = async (sel, conf, tickAll) => { await page.click(`${sel} [data-action="fight-conf"][data-v="${conf}"]`); await page.click(sel + ' [data-action="fight-reveal"]'); if (tickAll) await page.evaluate(f => document.querySelectorAll(f + ' [data-fight-idea]').forEach(b => { b.checked = true; }), sel); await page.click(sel + ' [data-action="fight-mark"]'); };
    await answer(F, 'guess', true); await answer(F, 'sure', false);
    const again = await page.evaluate(f => document.querySelector(f + ' .fight-pos').textContent, F);
    check(`${tag} a missed question is asked once more at the end of the round`, /Once more/.test(again) && /1 of 1/.test(again), again);
    await answer(F, 'sure', true);
    const endF = await page.evaluate(f => document.querySelector(f).textContent, F);
    const fr = await page.evaluate(() => ({ review: JSON.parse(localStorage.getItem('playable.review') || '{}'), check: (JSON.parse(localStorage.getItem('playable.path.performance-engineer') || '{}').check || {}).s1 }));
    const boxes = Object.values(fr.review).map(r => r.box);
    check(`${tag} the end shows what was recalled, no score, and the guess and the miss come back tomorrow`, /What you recalled/.test(endF) && /1 of 2: got it/.test(endF) && !/score|points/i.test(endF) && boxes.length === 2 && boxes.every(b => b === 0), JSON.stringify({ boxes, endF: endF.slice(0, 200) }));
    check(`${tag} the checkpoint result is kept for the stage map`, fr.check && fr.check.n === 2 && fr.check.got === 1 && fr.check.missed === 1, JSON.stringify(fr.check));
    // --- the test-out: recalling everything marks the stage tested out and moves on
    await nav('#/paths/performance-engineer/s2'); await page.waitForTimeout(150);
    const T = '#pane .pathstage[data-stage="s2"] .fight[data-mode="testout"]';
    await page.evaluate(() => { document.querySelector('#pane .pathstage[data-stage="s2"] .pathskip').open = true; });
    await page.click(T + ' [data-action="fight-start"]');
    for (let k = 0; k < 8 && await page.evaluate(t => !!document.querySelector(t + ' [data-action="fight-conf"]'), T); k++) await answer(T, 'sure', true);
    const to = await page.evaluate(t => ({ stage: (JSON.parse(localStorage.getItem('playable.path.performance-engineer')).stages || {}).s2, text: document.querySelector(t).textContent }), T);
    check(`${tag} a test-out that recalls the stage marks it tested out`, to.stage === 'skipped' && /You know most of this stage/.test(to.text), JSON.stringify({ stage: to.stage, text: to.text.slice(0, 160) }));
    await page.click(T + ' [data-action="fight-close"][data-next="1"]'); await page.waitForTimeout(200);
    check(`${tag} after a test-out, "Go to the next stage" opens it`, (await page.evaluate(() => location.hash)).endsWith('/s3'), await page.evaluate(() => location.hash));
    // --- the stage map is a view: every stage opens, its state comes from recall; the plain list shows every stage
    await nav('#/paths/performance-engineer'); await page.waitForTimeout(150);
    const ow = await page.evaluate(() => [...document.querySelectorAll('#pane .overworld .region')].map(r => ({ t: r.textContent, href: r.querySelector('a').getAttribute('href') })));
    check(`${tag} the stage map lists every stage as a link with its recall state`, ow.length === 6 && ow.every(r => /^#\/paths\/performance-engineer\/s\d$/.test(r.href)) && /1 of 2 recalled/.test(ow[0].t) && /tested out/.test(ow[1].t) && /checkpoint not tried/.test(ow[2].t), JSON.stringify(ow.map(r => r.t.slice(0, 90))));
    await page.click('#pane [data-action="path-view"][data-v="list"]'); await page.waitForTimeout(150);
    const pl = await page.evaluate(() => ({ sections: document.querySelectorAll('#pane .pathstage').length, regions: document.querySelectorAll('#pane .overworld .region').length, pressed: document.querySelector('#pane [data-action="path-view"][data-v="list"]').getAttribute('aria-pressed') }));
    check(`${tag} the plain list shows every stage's steps`, pl.sections === 6 && pl.regions === 0 && pl.pressed === 'true', JSON.stringify(pl));
    await page.click('#pane [data-action="path-view"][data-v="world"]'); await page.waitForTimeout(100);
    await page.evaluate(() => { localStorage.removeItem('playable.review'); localStorage.removeItem('playable.path.performance-engineer'); });
    // --- the adventure look is off by default; when on, its one entrance movement stops under reduced motion
    for (const rm of ['no-preference', 'reduce']) {
      const c2 = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: rm }), p2 = await c2.newPage();
      await p2.goto(BASE + '#/paths/performance-engineer'); await p2.waitForTimeout(500);
      const off = await p2.evaluate(() => !!document.querySelector('#pane .overworld') && !document.querySelector('#pane .overworld.skin'));
      await p2.evaluate(() => document.querySelector('#pane [data-action="path-skin"]').click()); await p2.waitForTimeout(200);
      const an = await p2.evaluate(() => { const y = document.querySelector('#pane .overworld.skin .you'); return y ? getComputedStyle(y).animationName : 'missing'; });
      check(`${tag} the adventure look is off by default; its marker ${rm === 'reduce' ? 'does not move under reduced motion' : 'steps in once'}`, off && (rm === 'reduce' ? an === 'none' : an === 'walkin'), JSON.stringify({ off, an }));
      await c2.close();
    }

    check(`${tag} no console errors`, !errors.length, errors[0]);
    await ctx.close();
  }
  await browser.close(); server.close();
  const bad = results.filter(r => !r.ok);
  results.forEach(r => console.log((r.ok ? 'PASS ' : 'FAIL ') + r.name + (r.ok ? '' : ' :: ' + r.detail)));
  console.log(`e2e-paths: ${results.length - bad.length}/${results.length} passed`);
  // GitHub shows annotations to anyone, job logs only to signed-in users.
  if (process.env.GITHUB_ACTIONS) bad.forEach(r => console.log('::error title=e2e-paths::' + (r.name + ' :: ' + r.detail).replace(/\r?\n/g, ' ')));
  process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
