// Learning-path end-to-end checks in a fresh browser profile, at desktop and
// phone widths: continue opens the checkpoint instead of marking the stage
// done, ticking a step keeps the reader's place, done and skipped stages can
// be undone, an open path shows exactly four structure indicators, the map
// opens framed to the current stage, the chooser suggests a path for every
// answer combination, and a checkpoint question can go into Review and out.
// Needs Playwright, like smoke.js.
// Usage: node src/e2e-paths.js   (PLAYWRIGHT_CHANNEL=chrome uses an installed Chrome)
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]) === '/' ? 'playable.html' : decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (err, data) => { if (err) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); res.end(data); });
});
(async () => {
  await new Promise(r => server.listen(0, r));
  const BASE = `http://localhost:${server.address().port}/playable.html`;
  const browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail: ok ? '' : String(detail).slice(0, 240) });
  for (const [w, h] of [[1440, 900], [375, 812]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const nav = async r => { await page.evaluate(r => new Promise(res => { if (location.hash === r) return res(); const f = () => { removeEventListener('hashchange', f); res(); }; addEventListener('hashchange', f); location.hash = r; }), r); await page.waitForTimeout(120); };
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
    const barBtn = await page.evaluate(() => { const b = document.querySelector('.pathbar [data-action="path-continue"]'); return b && b.textContent; });
    check(`${tag} at a checkpoint the bar offers "Open the checkpoint"`, barBtn === 'Open the checkpoint', barBtn);
    await page.evaluate(() => document.querySelector('.pathbar [data-action="path-continue"]')?.click()); await page.waitForTimeout(150);
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
      // a step node opens that step in the stage view
      await page.evaluate(() => { const nodes = document.querySelectorAll('#mapsvg .node[data-scope="path"][data-kind="topic"]'); nodes[nodes.length - 1].dispatchEvent(new MouseEvent('click', { bubbles: true })); }); await page.waitForTimeout(400);
      const flashed = await page.evaluate(() => { const r = document.querySelector('#pane .pathstep.flash'); if (!r) return null; const b = r.getBoundingClientRect(); return { row: r.dataset.row, inView: b.top >= 0 && b.bottom <= innerHeight, hash: location.hash }; });
      check(`${tag} clicking a step node shows that step in the stage view`, flashed && flashed.inView && /^#\/paths\/systems-designer\/[^/]+$/.test(flashed.hash), JSON.stringify(flashed));
    }

    // --- chooser: three answers suggest one path, and its card is marked
    await nav('#/paths');
    for (const [q, v] of [['goal', 'ship'], ['level', 'new'], ['time', 'short']]) { await page.evaluate(([q, v]) => document.querySelector(`#pane [data-action="choose"][data-q="${q}"][data-v="${v}"]`)?.click(), [q, v]); await page.waitForTimeout(80); }
    const pick = await page.evaluate(() => ({ title: document.querySelector('#pane .chooser-pick h3')?.textContent, picked: [...document.querySelectorAll('#pane .card.picked')].map(c => c.dataset.pathCard), pressed: document.querySelectorAll('#pane .chooser [aria-pressed="true"]').length }));
    check(`${tag} the chooser suggests a path and marks its card`, pick.title === 'Ship a game on PC, console and mobile' && pick.picked.length === 1 && pick.picked[0] === 'ship-it' && pick.pressed === 3, JSON.stringify(pick));
    const allCombos = await page.evaluate(() => { let n = 0, bad = []; for (const [g] of CHOOSER.goals) for (const [l] of CHOOSER.levels) for (const [t] of CHOOSER.times) { n++; const r = choosePath(g, l, t); if (!r || !PATHS.includes(r.path)) bad.push([g, l, t].join('/')); } return { n, bad }; });
    check(`${tag} every chooser combination (${allCombos.n}) suggests a path`, allCombos.n === 63 && !allCombos.bad.length, JSON.stringify(allCombos.bad));

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

    check(`${tag} no console errors`, !errors.length, errors[0]);
    await ctx.close();
  }
  await browser.close(); server.close();
  const bad = results.filter(r => !r.ok);
  results.forEach(r => console.log((r.ok ? 'PASS ' : 'FAIL ') + r.name + (r.ok ? '' : ' :: ' + r.detail)));
  console.log(`e2e-paths: ${results.length - bad.length}/${results.length} passed`);
  process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
