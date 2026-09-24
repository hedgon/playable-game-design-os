// Browser smoke test. Serves the repo, opens the built playable.html in
// Chromium at phone, tablet and desktop widths, visits one route of every
// kind, and fails on a page or console error, on an empty content pane, or
// when a narrow screen leaves the content pane off screen for a route that
// should show it. A fresh visit must land on the paths door with it visible.
// Needs Playwright (not a dependency of the guide itself):
//   npm i --no-save --no-package-lock playwright && npx playwright install chromium
// Usage: node src/smoke.js        (PLAYWRIGHT_CHANNEL=chrome uses an installed Chrome)
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.json': 'application/json' };

const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]) === '/' ? 'playable.html' : decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (err, data) => { if (err) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); res.end(data); });
});

// One route of every kind, read from the page's own data.
const ROUTES_IN_PAGE = () => {
  const first = a => a && a[0];
  const cs = first(CASE_STUDIES), sys = cs && first(cs.systems), part = sys && first(sys.parts), flow = cs && first(cs.flows);
  const p = first(PATHS), st = p && first(p.stages);
  return [
    '#/paths', '#/lab', '#/map/home', '#/map/d/' + DOMAINS[0].id, '#/map/t/core-loop/overview', '#/map/t/core-loop/godot',
    '#/map/t/core-loop/interview', '#/map/s/' + SMELLS[0].id, '#/explore', '#/explore/' + DOMAINS[0].id, '#/concepts',
    '#/diagnose/smells', '#/smell/' + SMELLS[0].id, ...DIAGNOSTICS.map(d => '#/diagnose/' + d[0]),
    ...TOOLS.map(t => '#/build/' + t[0]), ...['loop', 'ladder', 'philosophy', 'roles', 'matrix', 'framework', 'failures'].map(t => '#/ai/' + t),
    '#/playtest', '#/prompts', '#/prompts/' + PROMPT_TEMPLATES[0].id, '#/checklists', '#/checklists/' + CHECKLISTS[0].id,
    '#/experience', '#/experience/' + cs.id, '#/experience/' + cs.id + '/workflows', '#/experience/' + cs.id + '/interview',
    '#/experience/' + cs.id + '/flow/' + flow.id, '#/experience/' + cs.id + '/' + sys.id, '#/experience/' + cs.id + '/' + sys.id + '/' + part.id,
    '#/paths/' + p.id, '#/paths/' + p.id + '/' + st.id, '#/review', '#/sources', '#/games', '#/games/' + REFERENCE_GAMES[0].id, '#/platforms', '#/platforms/' + PLATFORMS[0].id, '#/platforms/' + PLATFORMS.find(x => x.kind === 'ugc').id,
    // one topic per diagram kind
    ...['core-loop', 'feature-vs-experience', 'choosing-ai-technique', 'depth-vs-complexity', 'pacing', 'economy-and-resources', 'perception-and-awareness', 'infra-ci-pipelines'].map(id => '#/map/t/' + id + '/overview')
  ];
};
// Routes that only reshape the map keep it in front on a narrow screen.
const mapOnly = r => /^#\/map\/(home|d\/[^/]+)$/.test(r) || /^#\/experience\/[^/]+\/(?!workflows$|interview$|overview$|flow\/)[^/]+$/.test(r);

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = `http://localhost:${server.address().port}/`;
  const browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
  const failures = []; let visits = 0;
  for (const [w, h] of [[375, 812], [1024, 768], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(base);
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    const first = await page.evaluate(() => { const r = document.getElementById('pane').getBoundingClientRect(); return { hash: location.hash, onScreen: r.left >= -1 && r.right <= innerWidth + 1 }; });
    if (first.hash !== '#/paths' || !first.onScreen) failures.push(`${w}px first visit: ${JSON.stringify(first)}`);
    const routes = await page.evaluate(ROUTES_IN_PAGE);
    for (const r of routes) {
      visits++;
      errors.length = 0;
      await page.evaluate(route => new Promise(res => { if (location.hash === route) return res(); const f = () => { removeEventListener('hashchange', f); res(); }; addEventListener('hashchange', f); location.hash = route; }), r);
      const s = await page.evaluate(() => { const p = document.getElementById('pane'), rect = p.getBoundingClientRect(); return { text: (p.querySelector('.view') || p).innerText.trim().length, onScreen: rect.width > 0 && rect.left >= -1 && rect.right <= innerWidth + 1 }; });
      if (errors.length) failures.push(`${w}px ${r}: ${errors[0]}`);
      if (s.text < 40) failures.push(`${w}px ${r}: content pane nearly empty (${s.text} chars)`);
      if (r.startsWith('#/map/t/') && r.endsWith('/overview') && await page.evaluate(id => !!(TOPICS[id] && TOPICS[id].diagram) && !document.querySelector('#pane .dgm-card svg'), r.split('/')[3])) failures.push(`${w}px ${r}: topic has a diagram but none is drawn`);
      if (w <= 1100 && !mapOnly(r) && !s.onScreen) failures.push(`${w}px ${r}: content pane off screen`);
      if (w <= 1100 && mapOnly(r) && s.onScreen) failures.push(`${w}px ${r}: map-only route covered the map`);
    }
    // Wayfinding: from deep pages, one click on Library reaches Reference games.
    for (const deep of ['#/map/t/core-loop/overview', '#/platforms/' + (await page.evaluate(() => PLATFORMS[0].id)), '#/checklists/' + (await page.evaluate(() => CHECKLISTS[0].id)), '#/paths/' + (await page.evaluate(() => PATHS[0].id + '/' + PATHS[0].stages[0].id))]) {
      await page.evaluate(route => { location.hash = route; }, deep); await page.waitForTimeout(150);
      await page.evaluate(() => document.querySelector('#primaryNav [data-group="library"]').click()); await page.waitForTimeout(150);
      const at = await page.evaluate(() => location.hash);
      if (at !== '#/games') failures.push(`${w}px ${deep}: the Library button led to ${at}, not #/games`);
    }
    // Search: a page is found by its name, a synonym or with one typo, and a
    // word that matches nothing excludes the item. The empty box lists pages.
    if (w === 1440) {
      const ask = q => page.evaluate(async q => { const inp = document.getElementById('searchInput'); document.getElementById('searchBtn').click(); inp.value = q; inp.dispatchEvent(new Event('input')); await new Promise(r => setTimeout(r, 30)); const first = document.querySelector('#searchResults .res b'); const all = [...document.querySelectorAll('#searchResults .res b')].map(b => b.textContent); document.querySelector('.modal-bg.show') && document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return { first: first && first.textContent, all }; }, q);
      for (const [q, want] of [['reference games', 'Reference games'], ['games', 'Reference games'], ['library', 'Library'], ['platforms', 'Platforms'], ['review queue', 'Review queue'], ['checklist', 'Checklists'], ['all pages', 'All pages'], ['refrence games', 'Reference games'], ['platfroms', 'Platforms']]) {
        const r = await ask(q);
        if (r.first !== want) failures.push(`search "${q}": first result is "${r.first}", expected "${want}"`);
      }
      const none = await ask('platforms zzqx');
      if (none.all.length) failures.push(`search "platforms zzqx": expected nothing, got ${none.all.slice(0, 3).join(', ')}`);
      const empty = await ask('');
      if (!empty.all.includes('Reference games')) failures.push('search: the empty box does not offer the common pages');
      await page.evaluate(() => { location.hash = '#/nowhere'; }); await page.waitForTimeout(150);
      const lost = await page.evaluate(() => (document.querySelector('#pane h1') || {}).textContent);
      if (lost !== 'All pages') failures.push(`unknown route shows "${lost}", expected the All pages index`);
      const idx = await page.evaluate(() => [...document.querySelectorAll('#pane .view a[href^="#/"]')].map(a => a.getAttribute('href').split('/')[1]));
      for (const v of ['paths', 'review', 'map', 'explore', 'concepts', 'games', 'platforms', 'checklists', 'prompts', 'sources', 'lab', 'build', 'diagnose', 'playtest', 'ai', 'experience'])
        if (!idx.includes(v)) failures.push(`All pages does not link #/${v}`);
    }
    // Every reference card shows an image that actually loaded.
    await page.evaluate(() => { location.hash = '#/games'; });
    await page.evaluate(() => document.querySelectorAll('#pane .refcard img').forEach(i => { i.loading = 'eager'; }));
    await page.waitForFunction(() => [...document.querySelectorAll('#pane .refcard img')].every(i => i.complete), null, { timeout: 8000 }).catch(() => {});
    const art = await page.evaluate(() => { const cards = [...document.querySelectorAll('#pane .refcard')]; return { cards: cards.length, broken: cards.filter(c => { const i = c.querySelector('img'); return !i || !i.naturalWidth; }).map(c => c.querySelector('b').textContent) }; });
    if (!art.cards || art.broken.length) failures.push(`${w}px #/games: cards without a loaded image: ${art.broken.join(', ') || 'no cards'}`);
    await ctx.close();
  }
  // Crossing the narrow width with a topic open: widening drops the drawer
  // state, narrowing again applies the route's pane rule, and the overview
  // map is reframed for the new stage.
  {
    const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
    const page = await ctx.newPage();
    await page.goto(base + '#/map/t/core-loop/overview');
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    const state = () => page.evaluate(() => ({ open: document.getElementById('pane').classList.contains('open'), scrim: document.getElementById('scrim').classList.contains('show') }));
    const narrowOpen = await state();
    await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(300);
    const wide = await state();
    await page.setViewportSize({ width: 375, height: 812 }); await page.waitForTimeout(300);
    const narrowAgain = await state();
    if (!narrowOpen.open) failures.push('resize: pane not open on a narrow topic route');
    if (wide.open || wide.scrim) failures.push('resize: drawer state kept after widening ' + JSON.stringify(wide));
    if (!narrowAgain.open) failures.push('resize: pane rule not applied after narrowing again');
    await page.evaluate(() => { location.hash = '#/map/home'; });
    await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(900);
    const fits = await page.evaluate(() => { const w = document.getElementById('mapwrap').getBoundingClientRect(); return [...document.querySelectorAll('#mapsvg .node[data-kind="domain"]')].every(n => { const r = n.getBoundingClientRect(); return r.left >= w.left - 1 && r.right <= w.right + 1 && r.top >= w.top - 1 && r.bottom <= w.bottom + 1; }); });
    if (!fits) failures.push('resize: overview map not reframed for the wider stage');
    visits++;
    await ctx.close();
  }
  await browser.close(); server.close();
  console.log(`smoke: ${visits} route visits at 3 widths; failures: ${failures.length}`);
  failures.slice(0, 40).forEach(f => console.log('  ' + f));
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
