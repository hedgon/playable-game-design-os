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
    '#/paths/' + p.id, '#/paths/' + p.id + '/' + st.id, '#/review', '#/sources', '#/games', '#/games/' + REFERENCE_GAMES[0].id, '#/games/pac-man/gameplay', '#/platforms', '#/platforms/' + PLATFORMS[0].id, '#/platforms/' + PLATFORMS.find(x => x.kind === 'ugc').id, '#/engines', ...ENGINES.map(e => '#/engines/' + e.id), '#/guide',
    // worked examples and comparisons (each only when the data has one)
    ...Object.values(TOPICS).filter(t => t.worked && t.worked.length).slice(0, 1).map(t => '#/map/t/' + t.id + '/overview'),
    ...(COMPARISONS.length ? ['#/games/compare', '#/games/compare/' + COMPARISONS[0].id] : []),
    // one topic per diagram kind
    ...['core-loop', 'feature-vs-experience', 'choosing-ai-technique', 'depth-vs-complexity', 'pacing', 'economy-and-resources', 'perception-and-awareness', 'infra-ci-pipelines'].map(id => '#/map/t/' + id + '/overview')
  ];
};
// The smallest label on the map, as drawn on screen, and whether a domain node is in view.
// Node labels on the map that the stage edge cuts off (horizontally), for nodes in view.
const CUT_LABELS = () => {
  const w = document.getElementById('mapwrap').getBoundingClientRect(), cut = [];
  // a selected topic's leaves may run on past the far edge of a stage that is too narrow for them (the topic stays in view and the reader pans); every other card is whole or wholly out
  for (const t of document.querySelectorAll('#mapsvg .node:not(.leaf) .lbl')) { const r = t.getBoundingClientRect(); if (r.right > w.left && r.left < w.right && r.top < w.bottom && r.bottom > w.top && (r.left < w.left - 1 || r.right > w.right + 1)) cut.push(t.textContent.trim().slice(0, 30)); }
  return cut;
};
// The map camera as drawn, and the widest the old clamp allowed (three times the fitted tree; the label floor stops a zoom-out well before that).
const hashOf = page => page.evaluate(() => location.hash);
const MAP_VB = () => {
  const svg = document.getElementById('mapsvg'), v = svg.viewBox.baseVal; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const r of svg.querySelectorAll('.disc')) { const x = +r.getAttribute('x'), y = +r.getAttribute('y'), w = +r.getAttribute('width'), h = +r.getAttribute('height'); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + w); y1 = Math.max(y1, y + h); }
  let w = x1 - x0 + 80; const h = y1 - y0 + 80; if (w / h < 1.18) w = h * 1.18;
  return { x: v.x, y: v.y, w: v.width, h: v.height, maxW: w * 3 };
};
const MAP_LABEL_PX = () => {
  const svg = document.getElementById('mapsvg'), r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, scale = Math.min(r.width / vb.width, r.height / vb.height);
  const sizes = [...svg.querySelectorAll('.lbl:not(.sub)')].map(t => parseFloat(getComputedStyle(t).fontSize) * scale);
  const w = document.getElementById('mapwrap').getBoundingClientRect();
  return { nodes: sizes.length, min: Math.min(...sizes), inView: [...svg.querySelectorAll('.node')].some(n => { const b = n.getBoundingClientRect(); return b.right > w.left && b.left < w.right && b.bottom > w.top && b.top < w.bottom; }) };
};
// Routes that only reshape the map keep it in front on a narrow screen.
const mapOnly = r => /^#\/map\/(home|d\/[^/]+)$/.test(r) || /^#\/experience\/[^/]+\/(?!workflows$|interview$|overview$|flow\/)[^/]+$/.test(r);

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = `http://localhost:${server.address().port}/`;
  const browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
  const failures = [], notes = []; let visits = 0;   // notes are observations, they never fail the run
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
      // Nothing inside the content pane may run past its right edge, unless it sits inside a horizontal scroller.
      const over = await page.evaluate(() => {
        const p = document.getElementById('pane'), pr = p.getBoundingClientRect(), bad = [];
        for (const el of p.querySelectorAll('*')) {
          if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
          const r = el.getBoundingClientRect(); if (!r.width && !r.height) continue;
          if (r.right <= pr.right + 1) continue;
          let a = el.parentElement, scroller = false;
          while (a && a !== p) { const o = getComputedStyle(a).overflowX; if (o === 'auto' || o === 'scroll') { scroller = true; break; } a = a.parentElement; }
          if (!scroller) bad.push(el.tagName.toLowerCase() + (el.className && el.className.baseVal === undefined ? '.' + String(el.className).split(' ')[0] : ''));
        }
        return bad.slice(0, 3);
      });
      if (over.length) failures.push(`${w}px ${r}: content runs past the pane edge (${over.join(', ')})`);
      if (errors.length) failures.push(`${w}px ${r}: ${errors[0]}`);
      if (s.text < 40) failures.push(`${w}px ${r}: content pane nearly empty (${s.text} chars)`);
      if (r.startsWith('#/map/t/') && r.endsWith('/overview') && await page.evaluate(id => !!(TOPICS[id] && TOPICS[id].diagram) && !document.querySelector('#pane .dgm-card svg'), r.split('/')[3])) failures.push(`${w}px ${r}: topic has a diagram but none is drawn`);
      if (w <= 1100 && !mapOnly(r) && !s.onScreen) failures.push(`${w}px ${r}: content pane off screen`);
      if (w <= 1100 && mapOnly(r) && s.onScreen) failures.push(`${w}px ${r}: map-only route covered the map`);
    }
    // A worked example renders as a card with a table that scrolls inside itself, the page does not widen, and the download holds the table.
    {
      const wid = await page.evaluate(() => { const t = Object.values(TOPICS).find(x => x.worked && x.worked.length); return t && { topic: t.id, w: t.worked[0] }; });
      if (wid) {
        await page.evaluate(route => { location.hash = route; }, '#/map/t/' + wid.topic + '/overview'); await page.waitForTimeout(250);
        const card = await page.evaluate(id => { const c = document.getElementById('worked-' + id); return c && { caption: !!c.querySelector('caption'), ths: [...c.querySelectorAll('th')].every(h => h.getAttribute('scope') === 'col'), rows: c.querySelectorAll('tbody tr').length, btn: (c.querySelector('[data-action="worked-download"]') || {}).textContent, wide: document.documentElement.scrollWidth }; }, wid.w.id);
        if (!card) failures.push(w + 'px worked example card is missing on ' + wid.topic);
        else {
          if (!card.caption || !card.ths || card.rows !== wid.w.rows.length) failures.push(w + 'px worked table: ' + JSON.stringify(card));
          if (w === 375 && card.wide > 375) failures.push('375px worked example widens the page to ' + card.wide);
          const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 4000 }), page.click('#worked-' + wid.w.id + ' [data-action="worked-download"]')]).catch(() => []);
          if (!dl) failures.push(w + 'px worked example download did not start');
          else {
            const body = fs.readFileSync(await dl.path(), 'utf8');
            const want = wid.w.rows.map(r => r.join(',')).join('\n');
            if (dl.suggestedFilename() !== wid.w.file || !body.includes(want) || !body.startsWith(wid.w.columns[0].h)) failures.push(w + 'px worked example download wrong: ' + dl.suggestedFilename() + ' ' + JSON.stringify(body.slice(0, 80)));
          }
        }
        const found = await page.evaluate(async q => { document.getElementById('searchBtn').click(); const inp = document.getElementById('searchInput'); inp.value = q; inp.dispatchEvent(new Event('input')); await new Promise(r => setTimeout(r, 250)); return [...document.querySelectorAll('#searchResults .res')].some(r => r.textContent.includes('Worked examples') || r.querySelector('.type').textContent === 'worked example'); }, wid.w.t);
        if (!found) failures.push(w + 'px search does not find the worked example "' + wid.w.t + '"');
        await page.keyboard.press('Escape');
      }
    }
    // A comparison page shows both games with a link to each page, the shelf is on the library, and each game lists it.
    {
      const cmp = await page.evaluate(() => COMPARISONS[0] && { id: COMPARISONS[0].id, games: COMPARISONS[0].games, n: COMPARISONS[0].sections.length });
      if (cmp) {
        await page.evaluate(route => { location.hash = route; }, '#/games/compare/' + cmp.id); await page.waitForTimeout(250);
        const pg = await page.evaluate(() => ({ links: [...document.querySelectorAll('#pane .comparehead')].map(a => a.getAttribute('href')), imgs: [...document.querySelectorAll('#pane .comparehead img')].every(i => i.complete && i.naturalWidth > 0), secs: document.querySelectorAll('#pane .comparesec').length, wide: document.documentElement.scrollWidth }));
        if (pg.links.join() !== cmp.games.map(g => '#/games/' + g).join() || !pg.imgs || pg.secs !== cmp.n) failures.push(w + 'px comparison page: ' + JSON.stringify(pg));
        if (w === 375 && pg.wide > 375) failures.push('375px comparison page widens the page to ' + pg.wide);
        await page.evaluate(route => { location.hash = route; }, '#/games'); await page.waitForTimeout(250);
        if (!await page.evaluate(() => !!document.querySelector('#pane a[href^="#/games/compare/"]'))) failures.push(w + 'px library has no "Two games, one problem" shelf');
        await page.evaluate(route => { location.hash = route; }, '#/games/' + cmp.games[0]); await page.waitForTimeout(250);
        if (!await page.evaluate(id => !!document.querySelector('#pane a[href="#/games/compare/' + id + '"]'), cmp.id)) failures.push(w + 'px game page does not list its comparison');
        await page.evaluate(route => { location.hash = route; }, '#/games/compare/nope'); await page.waitForTimeout(150);
        if (await page.evaluate(() => (document.querySelector('#pane h1') || {}).textContent) !== 'Not found') failures.push(w + 'px unknown comparison is not a not-found page');
      }
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
    // Every reference card with art shows an image that actually loaded; a game
    // with no licensable art shows its title tile instead, never an empty card.
    await page.evaluate(() => { location.hash = '#/games'; });
    await page.evaluate(() => document.querySelectorAll('#pane .refcard img').forEach(i => { i.loading = 'eager'; }));
    await page.waitForFunction(() => [...document.querySelectorAll('#pane .refcard img')].every(i => i.complete), null, { timeout: 8000 }).catch(() => {});
    const art = await page.evaluate(() => { const cards = [...document.querySelectorAll('#pane .refcard')]; return { cards: cards.length, broken: cards.filter(c => { const i = c.querySelector('img'); return i ? !i.naturalWidth : !c.querySelector('.tile'); }).map(c => c.querySelector('b').textContent) }; });
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
    // A resize reaches the page's media-query listener after a variable delay,
    // so wait for the expected state (up to 2 s) instead of a fixed sleep.
    const settle = async ok => { let s = await state(); for (let t = 0; t < 40 && !ok(s); t++) { await page.waitForTimeout(50); s = await state(); } return s; };
    const narrowOpen = await state();
    await page.setViewportSize({ width: 1440, height: 900 });
    const wide = await settle(s => !s.open && !s.scrim);
    await page.setViewportSize({ width: 375, height: 812 });
    const narrowAgain = await settle(s => s.open);
    if (!narrowOpen.open) failures.push('resize: pane not open on a narrow topic route');
    if (wide.open || wide.scrim) failures.push('resize: drawer state kept after widening ' + JSON.stringify(wide));
    if (!narrowAgain.open) failures.push('resize: pane rule not applied after narrowing again');
    await page.evaluate(() => { location.hash = '#/map/home'; });
    await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(900);
    const fits = await page.evaluate(MAP_LABEL_PX);
    if (!fits.nodes || fits.min < 10.9) failures.push(`resize: overview map labels are ${fits.min.toFixed(1)}px after the stage widened (need 11)`);
    visits++;
    await ctx.close();
  }
  // The map keeps its labels readable at fit: about 11px on screen or more, never shrunk to fit the whole tree.
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(base);
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    await page.evaluate(() => localStorage.setItem('playable.hideMap', 'false'));
    for (const r of ['#/map/home', '#/map/d/' + await page.evaluate(() => DOMAINS[2].id), '#/map/t/core-loop/overview', '#/map/t/economy-and-resources/overview']) {
      await page.evaluate(route => { location.hash = route; }, r); await page.waitForTimeout(700);
      const m = await page.evaluate(MAP_LABEL_PX);
      if (m.min < 10.9) failures.push(`1440px ${r}: map labels draw at ${m.min.toFixed(1)}px (need 11 or more)`);
      if (!m.inView) failures.push(`1440px ${r}: the map fit shows no domain`);
      if (r.includes('/t/')) { const cut = await page.evaluate(CUT_LABELS); if (cut.length) failures.push(`1440px ${r}: map labels cut off: ${cut.slice(0, 3).join(' | ')}`); }
      visits++;
    }
    // A topic page hides the map by default and gives the text the room; the toggle shows it and remembers.
    await page.evaluate(() => { localStorage.removeItem('playable.hideMap'); location.hash = '#/map/t/decisions/overview'; }); await page.waitForTimeout(300);
    await page.evaluate(() => { location.hash = '#/map/t/core-loop/overview'; }); await page.waitForTimeout(400);
    const col = await page.evaluate(() => { const p = document.getElementById('pane'), h = document.querySelector('#pane h1'), lh = parseFloat(getComputedStyle(h).lineHeight) || 30; return { w: p.getBoundingClientRect().width - 40, lines: Math.round(h.getBoundingClientRect().height / lh), toggle: !!document.querySelector('#pane [data-action="toggle-map"]'), map: getComputedStyle(document.getElementById('mapstage')).display }; });
    if (col.w < 640) failures.push(`1440px topic page: text column is ${Math.round(col.w)}px, need 640 or more`);
    if (col.lines > 2) failures.push(`1440px topic page: title wraps to ${col.lines} lines`);
    if (col.map !== 'none') failures.push('1440px topic page: the map is not hidden by default');
    if (!col.toggle) failures.push('1440px topic page: no Show map toggle');
    else {
      await page.click('#pane [data-action="toggle-map"]'); await page.waitForTimeout(700);
      const shown = await page.evaluate(() => ({ map: getComputedStyle(document.getElementById('mapstage')).display, rail: getComputedStyle(document.getElementById('rail')).display, w: document.getElementById('mapwrap').getBoundingClientRect().width }));
      shown.cut = await page.evaluate(CUT_LABELS);
      if (shown.map === 'none' || shown.rail !== 'none') failures.push('1440px topic page: Show map should show the map and fold the index ' + JSON.stringify(shown));
      if (shown.cut.length) failures.push('1440px topic page: map labels cut off: ' + shown.cut.slice(0, 3).join(' | '));
      await page.reload(); await page.waitForTimeout(500);
      if (await page.evaluate(() => getComputedStyle(document.getElementById('mapstage')).display) === 'none') failures.push('1440px topic page: the Show map choice was not remembered');
      await page.click('#pane [data-action="toggle-map"]'); await page.waitForTimeout(300);
      if (await page.evaluate(() => getComputedStyle(document.getElementById('rail')).display) === 'none') failures.push('1440px topic page: hiding the map did not bring the index back');
    }
    // Each section shows the list that fits it in the left column, or gives the column back.
    const rail = async route => { await page.evaluate(r => { location.hash = r; }, route); await page.waitForTimeout(250); return page.evaluate(() => ({ shown: getComputedStyle(document.getElementById('rail')).display !== 'none', links: [...document.querySelectorAll('#rail a.railproj')].map(a => a.textContent.trim()), domains: document.querySelectorAll('#rail .raildom').length, projects: document.querySelectorAll('#rail a[href="#/experience"]').length })); };
    const eng = await rail('#/engines'), make = await rail('#/build'), diag = await rail('#/diagnose'), chk = await rail('#/checklists');
    if (!eng.shown || eng.domains || !eng.links.some(t => /Godot/.test(t))) failures.push('#/engines: left column is not the engine list');
    if (!make.shown || make.domains || make.links.length < 11) failures.push('#/build: left column is not the tool list');
    if (!diag.shown || diag.domains || diag.links.length < 8) failures.push('#/diagnose: left column is not the symptom list');
    if (!chk.shown || chk.domains || chk.links.length < 3) failures.push('#/checklists: left column is not the checklist list');
    for (const route of ['#/games', '#/prompts', '#/platforms', '#/ai', '#/experience']) { const x = await rail(route); if (x.shown) failures.push(route + ': the left column stays open with nothing that fits'); }
    const home = await rail('#/map/home');
    if (!home.shown || !home.domains) failures.push('#/map/home: the concept index is missing from the left column');
    if (home.projects) failures.push('Projects has a second entry point in the left column');
    // Make: tools grouped by job, each with a "use this when", a link to why, and one start-here mark.
    await page.evaluate(() => { location.hash = '#/build'; }); await page.waitForTimeout(250);
    const mk = await page.evaluate(() => ({ groups: document.querySelectorAll('#pane .toolgrid').length, cards: document.querySelectorAll('#pane .toolcard').length, when: document.querySelectorAll('#pane .toolcard .toolwhen').length, why: document.querySelectorAll('#pane .toolcard .toollinks a[href^="#/map/t/"]').length, start: document.querySelectorAll('#pane .toolcard.start').length, tools: TOOLS.length }));
    if (mk.groups < 4 || mk.cards !== mk.tools || mk.when !== mk.tools || mk.why !== mk.tools || mk.start !== 1) failures.push('#/build: tools are not grouped with a use-when line, a why link and one start-here mark ' + JSON.stringify(mk));
    // Library: topic chips filter to the games that teach the topic. A smell links to games that show it.
    await page.evaluate(() => { location.hash = '#/games'; }); await page.waitForTimeout(250);
    await page.evaluate(() => document.querySelector('#pane [data-action="lib-more"]')?.click()); await page.waitForTimeout(150);
    const chips = await page.evaluate(() => [...document.querySelectorAll('#pane .libteach [data-k="topic"]')].map(b => b.dataset.v));
    if (chips.length < 8 || !chips.includes('economy-and-resources') || !chips.includes('onboarding')) failures.push('#/games: topic chips missing (' + chips.length + ')');
    else {
      const before = await page.evaluate(() => document.querySelectorAll('#pane .refcard').length);
      await page.click('#pane .libteach [data-v="onboarding"]'); await page.waitForTimeout(200);
      const after = await page.evaluate(() => document.querySelectorAll('#pane .refcard').length);
      if (!(after > 0 && after < before)) failures.push(`#/games: the Onboarding chip left ${after} of ${before} games`);
    }
    await page.evaluate(() => { location.hash = '#/smell/repetitive'; }); await page.waitForTimeout(250);
    const sg = await page.evaluate(() => [...document.querySelectorAll('#pane .smellgames a')].map(a => a.getAttribute('href')));
    if (sg.length < 2 || !sg.some(h => /^#\/games\/topic\//.test(h))) failures.push('smell page: no "See it in games" row ' + JSON.stringify(sg));
    else {
      await page.evaluate(h => { location.hash = h; }, sg[sg.length - 1]); await page.waitForTimeout(250);
      if (!await page.evaluate(() => document.querySelectorAll('#pane .refcard').length)) failures.push('"See it in games" leads to an empty library');
    }
    // The path bar shows its whole line: no clipping, no ellipsis.
    const clipped = await page.evaluate(async () => {
      const bad = [];
      for (const p of PATHS.slice(0, 6)) for (const st of p.stages.slice(0, 2)) for (const step of st.steps.slice(0, 3)) {
        location.hash = stepHref(step, p.id, st.id); await new Promise(r => setTimeout(r, 40));
        const el = document.querySelector('#pane .pathbar-info'); if (!el) continue;
        const cs = getComputedStyle(el);
        if (el.scrollWidth > el.clientWidth + 1 || cs.textOverflow === 'ellipsis' || cs.whiteSpace === 'nowrap') bad.push(location.hash);
      }
      return bad;
    });
    if (clipped.length) failures.push('1440px path bar clips its text on ' + clipped.slice(0, 2).join(', '));
    await ctx.close();
  }
  // Tablet: a topic opens as a page with the map hidden; with the map shown no label is cut.
  {
    const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
    const page = await ctx.newPage();
    await page.goto(base + '#/map/t/core-loop/overview'); await page.waitForTimeout(500);
    const pane = await page.evaluate(() => document.getElementById('pane').getBoundingClientRect().width);
    if (pane < 1000) failures.push('1024px topic page: the map is not hidden by default (pane ' + Math.round(pane) + 'px)');
    await page.click('#pane [data-action="toggle-map"]'); await page.waitForTimeout(800);
    const cut = await page.evaluate(CUT_LABELS);
    if (cut.length) failures.push('1024px topic page: map labels cut off: ' + cut.slice(0, 3).join(' | '));
    visits++;
    await ctx.close();
  }
  // Phone: every section is reachable with a whole label, and a topic is a full page with the map one tap away.
  {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto(base);
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    await page.evaluate(() => { location.hash = '#/map/home'; }); await page.waitForTimeout(300);
    const bar = await page.evaluate(() => [...document.querySelectorAll('#primaryNav button')].filter(b => b.offsetParent).map(b => { const r = b.getBoundingClientRect(); return { t: b.textContent.trim(), left: r.left, right: r.right, clipped: b.scrollWidth > b.clientWidth + 1, font: parseFloat(getComputedStyle(b).fontSize) }; }));
    for (const b of bar) if (b.left < 0 || b.right > 376 || b.clipped || b.font < 11) failures.push(`375px header: "${b.t}" is clipped or too small ${JSON.stringify(b)}`);
    const names = await page.evaluate(() => [...document.querySelectorAll('#primaryNav button[data-group]')].map(b => b.textContent.trim()));
    await page.click('#navMore'); await page.waitForTimeout(100);
    const more = await page.evaluate(() => [...document.querySelectorAll('#primaryNav .nav-extra')].map(b => { const r = b.getBoundingClientRect(); return { t: b.textContent.trim(), ok: r.width > 0 && r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight }; }));
    for (const n of names.slice(5)) if (!more.some(m => m.t === n && m.ok)) failures.push(`375px header: "${n}" is not reachable from More`);
    await page.locator('#primaryNav .nav-extra').last().click(); await page.waitForTimeout(250);
    if (await page.evaluate(() => location.hash) !== '#/experience') failures.push('375px header: More did not open Projects');
    await page.evaluate(() => { location.hash = '#/map/t/core-loop/overview'; }); await page.waitForTimeout(400);
    const pg = await page.evaluate(() => { const p = document.getElementById('pane').getBoundingClientRect(); return { left: p.left, right: p.right, scrim: document.getElementById('scrim').classList.contains('show'), btn: document.getElementById('drawerClose').textContent.trim() }; });
    if (pg.left > 1 || pg.right < 374 || pg.scrim) failures.push('375px topic: not a full page ' + JSON.stringify(pg));
    if (!/Map/.test(pg.btn)) failures.push('375px topic: no Map button to leave the page ' + JSON.stringify(pg));
    await page.keyboard.press('Escape'); await page.waitForTimeout(250);
    if (await page.evaluate(() => document.getElementById('pane').classList.contains('open'))) failures.push('375px topic: Escape did not return to the map');
    await page.evaluate(() => { location.hash = '#/map/t/decisions/overview'; }); await page.waitForTimeout(300);
    await page.click('#drawerClose'); await page.waitForTimeout(250);
    if (await page.evaluate(() => document.getElementById('pane').classList.contains('open'))) failures.push('375px topic: the Map button did not show the map');
    visits++;
    await ctx.close();
  }
  // A 1920px screen: grids fill their column (more columns, not a capped strip) and a
  // two-column page leaves no big blank beside its content.
  {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(base);
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    const go = async r => { await page.evaluate(h => { location.hash = '#/paths'; }); await page.evaluate(h => { location.hash = h; }, r); await page.waitForTimeout(250); };
    for (const [r, sel] of [['#/games', '.reflib'], ['#/platforms', '.grid.auto'], ['#/engines', '.grid.auto'], ['#/paths', '.grid.auto'], ['#/prompts', '.grid.auto'], ['#/build', '.toolgrid'], ['#/experience', '.grid.auto']]) {
      await go(r);
      const m = await page.evaluate(sel => { const g = document.querySelector('#pane .view ' + sel), v = g && g.parentElement; return g && { grid: g.getBoundingClientRect().width, view: v.getBoundingClientRect().width }; }, sel);
      if (!m) failures.push(`1920px ${r}: no ${sel}`);
      else if (m.grid < m.view * 0.9) failures.push(`1920px ${r}: the grid is ${Math.round(m.grid)}px of a ${Math.round(m.view)}px column`);
    }
    const two = await page.evaluate(() => { const g = REFERENCE_GAMES.find(x => x.kind !== 'series'); return ['#/map/t/core-loop/overview', '#/games/' + g.id, '#/engines/' + ENGINES[0].id, '#/platforms/' + PLATFORMS[0].id, '#/prompts/' + PROMPT_TEMPLATES[0].id, '#/checklists/' + CHECKLISTS[0].id, '#/smell/' + SMELLS[0].id, '#/build/' + TOOLS[0][0]]; });   // project and path pages keep the map beside them, so their pane is too narrow for a side column
    for (const r of two) {
      await go(r);
      const m = await page.evaluate(() => { const s = document.querySelector('#pane .wside'); return { shown: !!s && getComputedStyle(s).display !== 'none' && s.getBoundingClientRect().width > 250, right: s ? s.getBoundingClientRect().right : 0, wide: document.documentElement.scrollWidth > innerWidth + 1 }; });
      if (!m.shown) failures.push(`1920px ${r}: no side column`);
      else if (1920 - m.right > 1920 * 0.25) failures.push(`1920px ${r}: ${Math.round(1920 - m.right)}px empty beside the content`);
      if (m.wide) failures.push(`1920px ${r}: horizontal scroll`);
      visits++;
    }
    if (errors.length) failures.push('1920px page errors: ' + errors.slice(0, 3).join(' | '));
    await ctx.close();
  }
  // Cross-links: a topic page lists the tools and prompts that use it, no page kind is a dead end, and search folds spelling and phrasing.
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(base);
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    const go = async r => { await page.evaluate(h => { location.hash = '#/paths'; }); await page.evaluate(h => { location.hash = h; }, r); await page.waitForTimeout(250); };
    const data = await page.evaluate(() => {
      const first = (a, f) => a.find(f), cs = CASE_STUDIES[0];
      const toolTopic = TOOLS.map(t => t[4]).find(id => TOPICS[id]), promptTopic = (PROMPT_TEMPLATES.find(p => (p.topics || []).some(id => TOPICS[id])) || { topics: [] }).topics.find(id => TOPICS[id]);
      const checklist = CHECKLISTS.find(c => (c.topics || []).length), platform = PLATFORMS.find(p => (p.checklists || []).length);
      return { toolTopic, promptTopic, kinds: [
        ['prompt', '#/prompts/' + PROMPT_TEMPLATES.find(p => (p.topics || []).length).id], ['checklist', '#/checklists/' + checklist.id],
        ['platform guide', '#/platforms/' + platform.id], ['engine guide', '#/engines/' + ENGINES[0].id], ['smell', '#/smell/' + SMELLS[0].id],
        ['diagnostic', '#/diagnose/loop'], ['diagnostic', '#/diagnose/unfair'], ['tool', '#/build/' + TOOLS[0][0]], ['project', '#/experience/' + cs.id],
        ['path', '#/paths/' + PATHS[0].id], ['topic', '#/map/t/' + (toolTopic || 'core-loop')], ['game', '#/games/' + REFERENCE_GAMES[0].id], ['guide', '#/guide'], ['sources', '#/sources']] };
    });
    for (const [what, id, label] of [['Tools', data.toolTopic, 'a tool'], ['Prompts', data.promptTopic, 'a prompt template']]) {
      if (!id) { failures.push(`cross-links: no topic is named by ${label}`); continue; }
      await go('#/map/t/' + id + '/overview');
      const has = await page.evaluate(w => [...document.querySelectorAll('#pane .contexts b')].some(b => b.textContent.trim() === w + ':'), what);
      if (!has) failures.push(`cross-links: topic ${id} does not show a ${what} row`);
    }
    for (const [kind, r] of data.kinds) {
      await go(r); visits++;
      const n = await page.evaluate(() => {
        const skip = '.tabs,.pill-tabs,.crumbs,.tool-nav,.toolgroups,.makejobs,.pathbar,.topic-nav,.subnav';
        return [...document.querySelectorAll('#pane .view a[href^="#/"]')].filter(a => !a.closest(skip)).length;
      });
      if (!n) failures.push(`cross-links: ${kind} page ${r} is a dead end (no link to another part)`);
    }
    // Every new-style row on those pages links to something that exists.
    await go('#/sources');
    if (!(await page.evaluate(() => !!document.querySelector('#pane details.cited .citedgroup a[href^="http"]')))) failures.push('sources: no "Cited across the site" list');
    await go('#/guide');
    const gp = await page.evaluate(() => PATHS.filter(p => !document.querySelector('#pane a[href="#/paths/' + p.id + '"]')).map(p => p.id));
    if (gp.length) failures.push('guide: paths not reachable from the guide: ' + gp.join(', '));
    const found = await page.evaluate(() => {
      const search = PlayableApp.search, hrefs = q => search(q).map(r => r.href);
      return { license: search('license').filter(r => r.type === 'topic').length, licence: search('licence').filter(r => r.type === 'topic').length,
        oneOnOne: hrefs('one on one').includes('#/map/t/lead-one-on-ones'), oneToOne: hrefs('1:1').includes('#/map/t/lead-one-on-ones'),
        rules: hrefs('3.1.1 loot boxes').includes('#/map/t/monetisation-design'), n311: search('3.1.1').length,
        metr: hrefs('METR').slice(0, 3), licTop: hrefs('license').slice(0, 5), rollFirst: hrefs('rollback')[0],
        gacha: hrefs('gacha').includes('#/map/t/monetisation-design'), netcode: hrefs('networking').includes('#/map/t/server-rollback-netcode') };
    });
    if (!found.license || found.license !== found.licence) failures.push(`search: "license" finds ${found.license} topics, "licence" ${found.licence}`);
    if (!found.oneOnOne || !found.oneToOne) failures.push('search: "one on one" / "1:1" does not find lead-one-on-ones');
    if (!found.rules) failures.push('search: "3.1.1 loot boxes" does not find monetisation-design');
    if (!found.n311) failures.push('search: "3.1.1" finds nothing');
    if (!found.metr.some(h => h.endsWith('craft-measuring-ai-uplift'))) failures.push('search: "METR" top 3 lacks craft-measuring-ai-uplift: ' + found.metr.join(', '));
    if (!found.licTop.includes('#/map/t/models-open-and-closed')) failures.push('search: "license" top 5 lacks models-open-and-closed: ' + found.licTop.join(', '));
    if (found.rollFirst !== '#/map/t/server-rollback-netcode') failures.push('search: "rollback" first result is ' + found.rollFirst);
    if (!found.gacha) failures.push('search: "gacha" does not find monetisation-design');
    if (!found.netcode) failures.push('search: "networking" does not find server-rollback-netcode');
    if (errors.length) failures.push('cross-links page errors: ' + errors.slice(0, 3).join(' | '));
    await ctx.close();
  }
  // Map interaction, at desktop and phone width: keyboard travel, wheel zoom and
  // its clamp, dragging a node (kept after a reload), the fit / reset buttons,
  // the lens switch, the project map's camera, rapid route changes, and reduced
  // motion. It also covers the tree (roles, one Tab stop, ARIA arrow keys, live
  // announcements, groups), the label floor under zoom, the selected topic staying
  // in view, dimmed-leaf contrast, the focus ring, and the phone outline. Below 700px
  // the canvas is the default view (one-sided, moved by touch); a third run flips the
  // phone to its List view, where those tests read the outline instead.
  for (const [w, h, view] of [[1440, 900, 'map'], [375, 812, 'map'], [375, 812, 'list']]) {
    const ctx = await browser.newContext(w < 700 ? { viewport: { width: w, height: h }, hasTouch: true, isMobile: true } : { viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const tag = `${w}px map` + (view === 'list' ? ' (List)' : '');
    const fail = m => failures.push(`${tag}: ${m}`);
    const hash = () => page.evaluate(() => location.hash);
    const goto = async r => { await page.evaluate(x => { location.hash = x; }, r); await page.waitForTimeout(750); };
    const vb = () => page.evaluate(MAP_VB);
    // the map's own buttons, pressed in the page: on a phone a content pane can sit over them
    const press = id => page.evaluate(i => document.getElementById(i).click(), id);
    await page.goto(base + '#/map/home'); await page.evaluate(v => { localStorage.setItem('playable.hideMap', 'false'); if (v === 'list') localStorage.setItem('playable.mapPhoneView', '"list"'); }, view);
    await page.reload(); await page.waitForTimeout(800);
    const D = await page.evaluate(() => ({ doms: DOMAINS.map(d => d.id), lenses: LENSES.map(l => [l[0], l[2]]), cs: CASE_STUDIES[0].id, sys: CASE_STUDIES[0].systems[0].id, path: PATHS[0].id, stage: PATHS[0].stages[0].id }));

    // -- the tree: roles and names on the map (or the outline on a phone), the zoom buttons' names
    const canvas = view !== 'list', ROOT = canvas ? '#mapsvg' : '#mapoutline', ITEM = ROOT + ' [role="treeitem"]';
    const live = () => page.evaluate(() => document.getElementById('maplive').textContent);
    {
      const t = await page.evaluate(([root, item]) => {
        const r = document.querySelector(root), items = [...document.querySelectorAll(item)];
        return { role: r.getAttribute('role'), tabindex: r.getAttribute('tabindex'), n: items.length, bad: items.filter(n => !(+n.getAttribute('aria-level') >= 1) || !(+n.getAttribute('aria-setsize') >= 1) || !(+n.getAttribute('aria-posinset') >= 1) || !n.getAttribute('aria-label') || !n.hasAttribute('aria-selected')).length,
          names: ['mapZoomIn', 'mapZoomOut', 'mapFit', 'mapResetDrag'].map(id => document.getElementById(id).getAttribute('aria-label')), liveRole: document.getElementById('maplive').getAttribute('aria-live') };
      }, [ROOT, ITEM]);
      if (t.role !== 'tree' || !t.n || t.bad) fail('tree roles ' + JSON.stringify(t));
      if (canvas && t.tabindex !== '-1') fail('the drawing itself must not take a Tab stop (tabindex ' + t.tabindex + ')');
      if (t.names.join('|') !== 'Zoom in|Zoom out|Fit map|Reset layout') fail('zoom buttons are named ' + JSON.stringify(t.names));
      if (t.liveRole !== 'polite') fail('no polite live region for map announcements');
    }

    // -- keyboard: Tab into the tree (one tab stop), the ARIA tree keys, Enter keeps focus in the map
    await page.evaluate(() => { document.activeElement && document.activeElement.blur(); document.body.focus(); });
    const stops = await page.evaluate(s => document.querySelectorAll(s + '[tabindex="0"]').length, ITEM);
    if (stops !== 1) fail(`${stops} tab stops in the map (need exactly 1)`);
    // the skip link: second Tab stop on the page, Enter lands on the map's tab stop
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
    const skipAt = await page.evaluate(() => document.activeElement.id);
    if (skipAt !== 'skipMapBtn') fail('the second Tab stop should be "Skip to the map" (got "' + skipAt + '")');
    else {
      await page.keyboard.press('Enter'); await page.waitForTimeout(900);
      const landed = await page.evaluate(r => !!document.activeElement.closest(r) && !!document.activeElement.closest('[role="treeitem"]'), ROOT);
      if (!landed) fail('"Skip to the map" did not put focus on a map item');
    }
    await page.evaluate(() => { document.activeElement && document.activeElement.blur(); document.body.focus(); });
    let inMap = false;
    let mapStops = 0;   // Tab presses that land inside the map before an item has focus (the drawing itself, if it takes a stop)
    for (let i = 0; i < 120 && !inMap; i++) { await page.keyboard.press('Tab'); const at = await page.evaluate(r => ({ inside: !!document.activeElement.closest(r), node: !!document.activeElement.closest('[role="treeitem"]') }), ROOT); if (at.inside && !at.node) mapStops++; inMap = at.inside && at.node; }
    if (mapStops) fail(`${mapStops} Tab stop(s) in the map before the first item (need none)`);
    if (!inMap) fail('Tab never reached the map');
    else {
      const key = () => page.evaluate(() => document.activeElement.dataset.key || '');
      const state = () => page.evaluate(([root, item]) => ({ hash: location.hash, inMap: !!document.activeElement.closest(root), tabStops: document.querySelectorAll(item + '[tabindex="0"]').length, expanded: document.activeElement.getAttribute('aria-expanded'), open: [...document.querySelectorAll(item + '.domain.open')].map(n => n.dataset.key) }), [ROOT, ITEM]);
      const keys = await page.evaluate(s => [...document.querySelectorAll(s)].map(n => n.dataset.key), ITEM);
      await page.keyboard.press('Home'); const home = await key();
      if (home !== keys[0] || home !== 'c') fail(`Home moved focus to "${home}", not the first item "${keys[0]}"`);
      await page.keyboard.press('End'); const last = await key();
      if (last !== keys[keys.length - 1]) fail(`End moved focus to "${last}", not the last item "${keys[keys.length - 1]}"`);
      await page.keyboard.press('Home'); await page.keyboard.press('ArrowDown');
      if (await key() !== keys[1]) fail(`ArrowDown from the first item reached "${await key()}", not the next in reading order "${keys[1]}"`);
      await page.keyboard.press('ArrowUp');
      if (await key() !== keys[0]) fail('ArrowUp did not return to the first item');
      // Right from the goal steps into a branch (a canvas whose branches also sit on the left uses Left for those)
      let fwd = 'ArrowRight', back = 'ArrowLeft';
      await page.keyboard.press(fwd); let k1 = await key();
      if (!k1.startsWith('d:')) { await page.keyboard.press('Home'); await page.keyboard.press(back); k1 = await key(); fwd = 'ArrowLeft'; back = 'ArrowRight'; }
      if (!k1.startsWith('d:')) fail(`arrow keys from the goal reached "${k1}", not a domain`);
      await page.keyboard.press('ArrowDown'); const k2 = await key();
      await page.keyboard.press('ArrowUp'); const k3 = await key();
      if (k2 === k1 || k3 !== k1) fail(`ArrowDown/ArrowUp from ${k1} went to "${k2}" then "${k3}"`);
      // toward the children opens a closed branch: the route follows, focus stays, the state and the live region say so
      const before = k1;
      await page.keyboard.press(fwd); await page.waitForTimeout(800);
      const opened = await state();
      if (!opened.hash.startsWith('#/map/d/')) fail(`${fwd} on ${before} left the route at ${opened.hash}`);
      if (!opened.inMap) fail('after opening a branch by key, focus left the map');
      if (opened.tabStops !== 1) fail(`${opened.tabStops} tab stops after opening a branch (need exactly 1)`);
      if (opened.expanded !== 'true' || !opened.open.includes(before)) fail(`${fwd} on ${before} did not expand it (aria-expanded ${opened.expanded}; open: ${opened.open.join(',') || 'none'})`);
      if (!/^Expanded /.test(await live())) fail(`opening ${before} was not announced: "${await live()}"`);
      // ... again steps into the first topic; the other way steps back out, then closes
      await page.keyboard.press(fwd); const child = await key();
      if (!child.startsWith('t:')) fail(`${fwd} inside an open domain reached "${child}", not a topic`);
      await page.keyboard.press(back);
      if (await key() !== before) fail(`${back} from a topic did not return to its domain ${before}`);
      await page.keyboard.press(back); await page.waitForTimeout(800);
      const closed = await state();
      if (closed.hash !== '#/map/home' || closed.expanded !== 'false' || closed.open.length) fail(`${back} on an open domain did not close it: ${JSON.stringify(closed)}`);
      if (!/^Collapsed /.test(await live())) fail(`closing ${before} was not announced: "${await live()}"`);
      await page.keyboard.press(back);
      if (await key() !== 'c') fail(`${back} on a closed top-level branch did not step out to the goal`);
      // Enter opens as well, and keeps focus in the map
      await page.keyboard.press(fwd); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
      const entered = await state();
      if (!entered.hash.startsWith('#/map/d/') || !entered.inMap || entered.tabStops !== 1) fail(`Enter on a domain: ${JSON.stringify(entered)}`);
    }
    if (errors.length) fail('page error during keyboard travel: ' + errors[0]);

    if (canvas) {
    // -- wheel zoom stays inside its clamp; fit restores the framing
    await goto('#/map/home');
    await press('mapFit'); await page.waitForTimeout(700);
    const fit0 = await vb();
    const wrapBox = await page.evaluate(() => { const r = document.getElementById('mapwrap').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    await page.mouse.move(wrapBox.x, wrapBox.y);
    for (let i = 0; i < 60; i++) await page.mouse.wheel(0, -120);
    await page.waitForTimeout(150);
    const zin = await vb();
    if (!(zin.w < fit0.w * 0.5)) fail(`wheel-in barely zoomed (${fit0.w.toFixed(0)} to ${zin.w.toFixed(0)})`);
    if (zin.w < 119.5) fail(`wheel-in went past the clamp: viewBox ${zin.w.toFixed(1)} wide (minimum 120)`);
    for (let i = 0; i < 90; i++) await page.mouse.wheel(0, 120);
    await page.waitForTimeout(150);
    const zout = await vb();
    if (zout.w < fit0.w - 1) fail(`wheel-out shrank the view (${fit0.w.toFixed(0)} to ${zout.w.toFixed(0)})`);
    if (zout.w > zout.maxW + 1) fail(`wheel-out went past the clamp: viewBox ${zout.w.toFixed(0)} wide (maximum ${zout.maxW.toFixed(0)})`);
    // the zoom floor: no wheel or button gesture draws labels under 11px
    { const px = await page.evaluate(MAP_LABEL_PX); if (px.min < 10.9) fail(`labels are ${px.min.toFixed(1)}px at the furthest wheel zoom-out (need 11 or more)`); }
    for (let i = 0; i < 30; i++) await press('mapZoomOut');
    { const px = await page.evaluate(MAP_LABEL_PX); if (px.min < 10.9) fail(`labels are ${px.min.toFixed(1)}px after the zoom-out button (need 11 or more)`); }
    await press('mapFit'); await page.waitForTimeout(700);
    const fit1 = await vb();
    if (Math.abs(fit1.w - fit0.w) > 1) fail(`Fit did not restore the framing after zooming (${fit0.w.toFixed(0)} then ${fit1.w.toFixed(0)})`);

    // -- drag a node; the offset is saved and survives a reload; the drag button resets it
    // the overview always re-frames on load (a saved zoom is not restored on #/map/home): after a reload the framing is the fitted one
    await goto('#/map/d/' + D.doms[0]); await goto('#/map/home');
    const hfit = await vb();
    await page.mouse.move(wrapBox.x, wrapBox.y); for (let i = 0; i < 3; i++) await page.mouse.wheel(0, -120);
    await page.waitForTimeout(200);
    await page.reload(); await page.waitForTimeout(1000);
    const hz2 = await vb();
    if (Math.abs(hz2.w - hfit.w) > 1) fail(`the overview came back ${hz2.w.toFixed(0)} wide after a reload, a fresh visit frames ${hfit.w.toFixed(0)}`);
    await goto('#/map/home');
    const pick = () => page.evaluate(() => {
      const w = document.getElementById('mapwrap').getBoundingClientRect();
      for (const n of document.querySelectorAll('#mapsvg .node.domain')) { const r = n.querySelector('.disc').getBoundingClientRect(); if (r.left > w.left + 5 && r.right < w.right - 5 && r.top > w.top + 5 && r.bottom < w.bottom - 45) return { key: n.dataset.key, x: r.x + r.width / 2, y: r.y + r.height / 2 }; }
      return null;
    });
    const nodePos = key => page.evaluate(k => { const r = document.querySelector('#mapsvg .node[data-key="' + k + '"] .disc'); return r && { x: +r.getAttribute('x'), y: +r.getAttribute('y') }; }, key);
    const target = await pick();
    if (!target) fail('no domain node fully in view to drag');
    else {
      const p0 = await nodePos(target.key);
      await page.mouse.move(target.x, target.y); await page.mouse.down();
      await page.mouse.move(target.x + 30, target.y + 12, { steps: 4 }); await page.mouse.move(target.x + 60, target.y + 30, { steps: 4 }); await page.mouse.up();
      await page.waitForTimeout(200);
      const p1 = await nodePos(target.key);
      if (!p1 || (Math.abs(p1.x - p0.x) < 1 && Math.abs(p1.y - p0.y) < 1)) fail(`dragging ${target.key} did not move it`);
      if (await hash() !== '#/map/home') fail(`dragging ${target.key} also opened it (route ${await hash()})`);
      const saved = await page.evaluate(k => { const s = JSON.parse(localStorage.getItem('playable.mapState') || '{}'); return !!(s.off && s.off[k]); }, target.key);
      if (!saved) fail(`the drag of ${target.key} was not saved`);
      await page.reload(); await page.waitForTimeout(900);
      const p2 = await nodePos(target.key);
      if (!p2 || Math.abs(p2.x - p1.x) > 0.5 || Math.abs(p2.y - p1.y) > 0.5) fail(`${target.key} came back at ${JSON.stringify(p2)} after a reload, dragged to ${JSON.stringify(p1)}`);
      await press('mapResetDrag'); await page.waitForTimeout(300);
      const p3 = await nodePos(target.key);
      if (!p3 || Math.abs(p3.x - p0.x) > 0.5 || Math.abs(p3.y - p0.y) > 0.5) fail(`the drag reset button left ${target.key} at ${JSON.stringify(p3)}, tidy is ${JSON.stringify(p0)}`);
      if (await page.evaluate(() => Object.keys((JSON.parse(localStorage.getItem('playable.mapState') || '{}').off) || {}).length)) fail('the drag reset button left offsets in storage');
    }

    }
    // -- default reset: from an open domain back to the overview
    await goto('#/map/d/' + D.doms[0]);
    await press('mapResetDefault'); await page.waitForTimeout(800);
    if (await hash() !== '#/map/home') fail(`the default button led to ${await hash()}, not #/map/home`);
    if (await page.evaluate(() => document.querySelectorAll('#mapsvg .node.domain.open').length)) fail('the default button left a domain open');

    // -- lens switch: the other lens draws its own domains and centre, and is remembered
    for (const [lid, goal] of D.lenses.slice().reverse()) {
      await page.evaluate(l => document.querySelector('[data-action="lens"][data-lens="' + l + '"]').click(), lid); await page.waitForTimeout(800);
      const got = await page.evaluate(() => ({ centre: (document.querySelector('#mapsvg .node.center') || { getAttribute: () => '' }).getAttribute('aria-label'), doms: document.querySelectorAll('#mapsvg .node.domain').length, saved: JSON.parse(localStorage.getItem('playable.mapState') || '{}').lens, hash: location.hash }));
      const want = await page.evaluate(l => DOMAINS.filter(d => d.lens === l).length, lid);
      if (got.doms !== want || !got.centre || !got.centre.includes(goal) || got.saved !== lid || got.hash !== '#/map/home') fail(`lens ${lid}: ${JSON.stringify(got)}, expected ${want} domains and the goal "${goal}"`);
      if (canvas) { const px = await page.evaluate(MAP_LABEL_PX); if (px.min < 10.9) fail(`lens ${lid}: labels ${px.min.toFixed(1)}px after the switch`); }
    }
    await page.evaluate(l => document.querySelector('[data-action="lens"][data-lens="' + l + '"]').click(), D.lenses[0][0]); await page.waitForTimeout(700);

    // -- project map: own camera, saved under its own key, restored after a reload
    await goto('#/experience/' + D.cs + '/' + D.sys);
    const pm = await page.evaluate(() => ({ scope: [...document.querySelectorAll('#mapsvg .node')].every(n => n.dataset.scope === 'project'), n: document.querySelectorAll('#mapsvg .node').length }));
    if (!pm.n || !pm.scope) fail('project route does not draw the project map ' + JSON.stringify(pm));
    if (canvas) {
    const pl = await page.evaluate(MAP_LABEL_PX);
    if (pl.min < 10.9) fail(`project map labels ${pl.min.toFixed(1)}px (need 11)`);
    const pb = await page.evaluate(() => { const r = document.getElementById('mapwrap').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    await page.mouse.move(pb.x, pb.y); for (let i = 0; i < 4; i++) await page.mouse.wheel(0, -120);
    await page.waitForTimeout(500);   // the camera is written once the gesture settles
    const pv1 = await vb();
    const stored = await page.evaluate(id => (JSON.parse(localStorage.getItem('playable.projMap.' + id) || '{}').vb || null), D.cs);
    if (!stored || Math.abs(stored.w - pv1.w) > 0.5) fail(`the project camera was not saved under projMap (${JSON.stringify(stored)} vs ${pv1.w})`);
    const domainCam = await page.evaluate(() => (JSON.parse(localStorage.getItem('playable.mapState') || '{}').vb || {}).w);
    if (domainCam && Math.abs(domainCam - pv1.w) < 0.01) fail('the project map wrote its camera into the guide map state');
    await page.reload(); await page.waitForTimeout(900);
    const pv2 = await vb();
    // the project map re-centres on the open system at the saved zoom, so the size may grow to keep the branch in view; what must hold is a readable, populated view
    const pp = await page.evaluate(MAP_LABEL_PX);
    if (!pp.inView || pp.min < 10.9) fail(`the project map after a reload: labels ${pp.min.toFixed(1)}px, node in view ${pp.inView} (camera was ${pv1.w.toFixed(0)} wide, is ${pv2.w.toFixed(0)})`);
    }
    await press('mapResetDefault'); await page.waitForTimeout(700);
    if (await hash() !== '#/experience/' + D.cs) fail(`the default button on a project map led to ${await hash()}`);

    // -- rapid route changes while the camera animates: last route wins, no error
    errors.length = 0;
    const seq = ['#/map/d/' + D.doms[0], '#/map/t/core-loop/overview', '#/map/home', '#/experience/' + D.cs + '/' + D.sys, '#/map/d/' + D.doms[1], '#/paths/' + D.path + '/' + D.stage, '#/map/t/decisions/overview', '#/map/d/' + D.doms[2]];
    for (const r of seq) { await page.evaluate(x => { location.hash = x; }, r); await page.waitForTimeout(60); }
    await page.waitForTimeout(1000);
    const end = await page.evaluate(() => ({ hash: location.hash, open: [...document.querySelectorAll('#mapsvg .node.domain.open')].map(n => n.dataset.key), nodes: document.querySelectorAll('#mapsvg .node').length }));
    if (end.hash !== seq[seq.length - 1] || !end.open.includes('d:' + D.doms[2])) fail(`after 8 quick route changes: ${JSON.stringify(end)}`);
    if (errors.length) fail('page error during rapid route changes: ' + errors[0]);
    if (canvas) { const px = await page.evaluate(MAP_LABEL_PX); if (px.min < 10.9 || !px.inView) fail(`after rapid route changes labels are ${px.min.toFixed(1)}px, in view: ${px.inView}`); }

    // -- a topic's neighbourhood: groups open in place; on the canvas the selected topic stays in view and hovered leaves keep readable words
    await goto('#/map/t/scope-control/overview');
    {
      const groups = await page.evaluate(([root, item]) => [...document.querySelectorAll(item + '[data-kind="group"]')].map(n => ({ key: n.dataset.key, expanded: n.getAttribute('aria-expanded') })), [ROOT, ITEM]);
      const closedG = groups.find(g => g.expanded === 'false');
      if (!groups.length) fail('a topic with many leaves shows no group (data-kind="group")');
      else if (!closedG) fail('no group starts collapsed with aria-expanded="false"');
      else {
        const count = () => page.evaluate(s => document.querySelectorAll(s).length, ITEM);
        const nb = await count();
        await page.evaluate(([k, canv, root]) => { const n = document.querySelector(root + ' [data-key="' + CSS.escape(k) + '"]'); (canv ? n : n.querySelector(':scope > .oi-row')).dispatchEvent(new MouseEvent('click', { bubbles: true })); }, [closedG.key, canvas, ROOT]);
        await page.waitForTimeout(600);
        if (await count() <= nb) fail('opening a group did not add its leaves');
        if (!/^Expanded /.test(await live())) fail(`opening a group was not announced: "${await live()}"`);
      }
    }
    if (canvas) {
      // the selected topic is whole inside the stage at 1440, 1280 and 1024 wide, for the topics with the widest neighbourhoods
      for (const [vw, vh] of w > 700 ? [[1440, 900], [1280, 800], [1024, 768]] : [[w, h]]) {
        await page.setViewportSize({ width: vw, height: vh }); await page.waitForTimeout(500);
        for (const t of ['scope-control', 'core-loop', 'economy-and-resources']) {
          await goto('#/map/home'); await goto('#/map/t/' + t + '/overview');
          const v = await page.evaluate(() => { const wr = document.getElementById('mapwrap').getBoundingClientRect(), s = document.querySelector('#mapsvg .node.sel .disc'); if (!s) return null; const r = s.getBoundingClientRect(); return { l: r.left - wr.left, r: wr.right - r.right, t: r.top - wr.top, b: wr.bottom - r.bottom, wrapW: wr.width }; });
          if (!v) fail(`${t} at ${vw}px: no selected topic node`);
          else if (v.wrapW > 50 && Math.min(v.l, v.r, v.t, v.b) < -0.5) fail(`${t} at ${vw}px: the selected topic is cut by the stage edge ${JSON.stringify(v)}`);
        }
      }
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(500);
      await goto('#/map/t/scope-control/overview');
      // hover a leaf with a reason: one note (no tooltip over it), and the faded cards keep 4.5:1 for their words, in both themes
      const CONTRAST = () => {
        const cv = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
        const rgba = c => { cv.clearRect(0, 0, 1, 1); cv.fillStyle = '#000'; cv.fillStyle = c; cv.fillRect(0, 0, 1, 1); const d = cv.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
        const over = (fg, bg) => [0, 1, 2].map(i => fg[i] * fg[3] + bg[i] * (1 - fg[3]));
        const lum = c => { const v = c.map(x => x / 255).map(x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
        const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
        const panel = rgba(getComputedStyle(document.getElementById('mapwrap')).backgroundColor), svg = document.getElementById('mapsvg');
        let min = 99, n = 0;
        for (const node of svg.querySelectorAll('.node:not(.hl):not(.center)')) {
          const disc = node.querySelector('.disc'), lbl = node.querySelector('.lbl'); if (!disc || !lbl) continue;
          const d = rgba(getComputedStyle(disc).fill), op = parseFloat(getComputedStyle(disc).opacity) * parseFloat(getComputedStyle(node).opacity);
          const card = over([d[0], d[1], d[2], d[3] * op], panel), text = over([...rgba(getComputedStyle(lbl).fill).slice(0, 3), parseFloat(getComputedStyle(node).opacity)], panel);
          min = Math.min(min, ratio(text, card)); n++;
        }
        const ring = svg.querySelector('.node:focus-visible .fring');
        return { min, n, dimmed: svg.classList.contains('dimmed'), ring: ring ? { shown: getComputedStyle(ring).display !== 'none', width: parseFloat(getComputedStyle(ring).strokeWidth), ratio: ratio(rgba(getComputedStyle(ring).stroke).slice(0, 3), panel) } : null };
      };
      for (const scheme of w > 700 ? ['light', 'dark'] : []) {   // hover and the keyboard ring are desktop checks; a touch screen has no hover
        await page.emulateMedia({ colorScheme: scheme }); await page.waitForTimeout(300);
        const leaf = await page.evaluate(() => { const l = [...document.querySelectorAll('#mapsvg .node.leaf')].find(x => x.dataset.why); if (!l) return null; const r = l.querySelector('.disc').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
        if (!leaf) { fail('no leaf with a reason to hover'); break; }
        await page.mouse.move(leaf.x, leaf.y); await page.waitForTimeout(300);
        const hv = await page.evaluate(() => ({ notes: document.querySelectorAll('#mapsvg .whynote').length, tip: !document.getElementById('maptip').hidden }));
        if (hv.notes !== 1) fail(`hovering a leaf with a reason shows ${hv.notes} notes (${scheme})`);
        if (hv.tip) fail(`the tooltip is shown over the note (${scheme})`);
        const c = await page.evaluate(CONTRAST);
        if (!c.dimmed || !c.n) fail(`hover did not fade the other cards (${scheme}) ${JSON.stringify(c)}`);
        else if (c.min < 4.5) fail(`faded cards drop to ${c.min.toFixed(2)}:1 for their words (${scheme}; need 4.5)`);
        await page.mouse.move(2, 2); await page.waitForTimeout(200);
        // the focus ring on the first item: drawn, and 3:1 against the stage
        await page.evaluate(() => { document.querySelector('#mapsvg .node.sel').focus(); });
        await page.keyboard.press('ArrowDown'); await page.waitForTimeout(200);
        const rg = (await page.evaluate(CONTRAST)).ring;
        if (!rg || !rg.shown || rg.width < 2) fail(`no focus ring on a keyboard-focused node (${scheme}) ${JSON.stringify(rg)}`);
        else if (rg.ratio < 3) fail(`the focus ring is ${rg.ratio.toFixed(2)}:1 against the stage (${scheme}; need 3)`);
      }
      await page.emulateMedia({ colorScheme: null });
    }

    // -- the phone canvas: the same one-sided tree, moved by touch; a tap is a click, no node dragging, nothing scrolls sideways, and Map | List flips views
    if (w < 700 && canvas) {
      await goto('#/map/home');
      const cdp = await ctx.newCDPSession(page);
      const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p[0], y: p[1], id: i })) });
      const geo = () => page.evaluate(() => { const r = document.getElementById('mapwrap').getBoundingClientRect();
        return { sw: document.documentElement.scrollWidth, vw: innerWidth, wrapW: r.width, wrapH: r.height, top: r.top, svgShown: getComputedStyle(document.getElementById('mapsvg')).display !== 'none', outShown: getComputedStyle(document.getElementById('mapoutline')).display !== 'none', nodes: document.querySelectorAll('#mapsvg .node').length, wide: [...document.querySelectorAll('body *')].filter(e => !e.closest('svg') && e.getBoundingClientRect().width > innerWidth + 1).length }; });
      const g0 = await geo();
      if (!g0.svgShown || g0.outShown || !g0.nodes) fail('phone: the canvas must be the default view ' + JSON.stringify(g0));
      if (g0.sw > g0.vw || g0.wide) fail('phone map: something is wider than the screen ' + JSON.stringify(g0));
      if (g0.wrapH < 400) fail('phone map: the stage is only ' + g0.wrapH.toFixed(0) + 'px tall');
      { const px = await page.evaluate(MAP_LABEL_PX); if (px.min < 10.9) fail('phone map: labels are ' + px.min.toFixed(1) + 'px at the first view (need 11 or more)'); }
      // the switch and the zoom buttons are 44px targets
      const tg = await page.evaluate(() => ['mapPhoneView', 'mapZoomIn', 'mapZoomOut', 'mapFit'].map(id => { const e = document.getElementById(id); const b = id === 'mapPhoneView' ? e.querySelector('button') : e; const r = b.getBoundingClientRect(); return [id, r.width, r.height]; }));
      for (const [id, tw, th] of tg) if (tw < 43.5 || th < 43.5) fail('phone map: #' + id + ' is ' + tw.toFixed(0) + 'x' + th.toFixed(0) + ', under 44px');
      // the first view holds the whole root and every domain card, nothing clipped on either side
      await page.waitForTimeout(500);
      const inStage = sel => page.evaluate(s => { const w = document.getElementById('mapwrap').getBoundingClientRect(); const ds = [...document.querySelectorAll(s)].map(n => n.querySelector('.disc').getBoundingClientRect()); return { n: ds.length, out: ds.filter(r => r.left < w.left - 0.5 || r.right > w.right + 0.5 || r.top < w.top - 0.5 || r.bottom > w.bottom + 0.5).length }; }, sel);
      { const f = await inStage('#mapsvg .node.center, #mapsvg .node.domain'); if (f.n < 2 || f.out) fail('phone map: the first view clips ' + f.out + ' of ' + f.n + ' root and domain cards'); }
      // one finger pans
      const c0 = await page.evaluate(() => { const r = document.getElementById('mapwrap').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height * 0.8]; });
      const v0 = await vb();
      await touch('touchStart', [[c0[0], c0[1]]]);
      for (let i = 1; i <= 8; i++) await touch('touchMove', [[c0[0] - i * 12, c0[1] - i * 14]]);
      await touch('touchEnd', []); await page.waitForTimeout(300);
      const v1 = await vb();
      if (Math.abs(v1.x - v0.x) < 1 || Math.abs(v1.y - v0.y) < 1) fail('phone map: one finger did not pan ' + JSON.stringify([v0, v1]));
      if (await hash() !== '#/map/home') fail('phone map: a pan opened something (' + await hash() + ')');
      if ((await geo()).sw > 375) fail('phone map: the page scrolled sideways after a pan');
      // two fingers pinch zoom; the labels never drop under 11px
      const mid = await page.evaluate(() => { const r = document.getElementById('mapwrap').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
      await touch('touchStart', [[mid[0] - 20, mid[1]], [mid[0] + 20, mid[1]]]);
      for (let i = 1; i <= 8; i++) await touch('touchMove', [[mid[0] - 20 - i * 10, mid[1]], [mid[0] + 20 + i * 10, mid[1]]]);
      await touch('touchEnd', []); await page.waitForTimeout(250);
      const v2 = await vb();
      if (!(v2.w < v1.w * 0.8)) fail('phone map: pinching out did not zoom in (' + v1.w.toFixed(0) + ' to ' + v2.w.toFixed(0) + ')');
      await touch('touchStart', [[mid[0] - 140, mid[1]], [mid[0] + 140, mid[1]]]);
      for (let i = 1; i <= 24; i++) await touch('touchMove', [[mid[0] - 140 + i * 5.8, mid[1]], [mid[0] + 140 - i * 5.8, mid[1]]]);
      await touch('touchEnd', []); await page.waitForTimeout(250);
      { const px = await page.evaluate(MAP_LABEL_PX); if (px.min < 10.9) fail('phone map: labels are ' + px.min.toFixed(1) + 'px after pinching in (need 11 or more)'); }
      for (let i = 0; i < 20; i++) await press('mapZoomOut');
      { const px = await page.evaluate(MAP_LABEL_PX); if (px.min < 10.9) fail('phone map: labels are ' + px.min.toFixed(1) + 'px after the zoom-out button'); }
      await press('mapFit'); await page.waitForTimeout(700);
      // a tap on a domain opens it, a tap on a topic opens the topic
      const tapAt = async sel => { const p = await page.evaluate(s => { const n = document.querySelector(s); if (!n) return null; const r = n.querySelector('.disc').getBoundingClientRect(), w = document.getElementById('mapwrap').getBoundingClientRect(), x0 = Math.max(r.left, w.left), x1 = Math.min(r.right, w.right); return [(x0 + x1) / 2, r.y + r.height / 2]; }, sel); if (!p) return false; await touch('touchStart', [p]); await touch('touchEnd', []); await page.waitForTimeout(900); return true; };
      const domId = await page.evaluate(() => document.querySelector('#mapsvg .node.domain').dataset.id);
      if (!await tapAt('#mapsvg .node.domain[data-id="' + domId + '"]')) fail('phone map: no domain card to tap');
      else {
        if (await hash() !== '#/map/d/' + domId) fail('phone map: tapping a domain went to ' + await hash());
        const open = await page.evaluate(() => document.querySelectorAll('#mapsvg .node.topic').length);
        if (!open) fail('phone map: the tapped domain shows no topics');
        const topId = await page.evaluate(() => document.querySelector('#mapsvg .node.topic').dataset.id);
        const g1 = await geo(); if (g1.sw > 375) fail('phone map: the opened domain widened the page ' + JSON.stringify(g1));
        if (!await tapAt('#mapsvg .node.topic[data-id="' + topId + '"]')) fail('phone map: no topic card to tap');
        else {
          const pane = await page.evaluate(() => document.getElementById('pane').classList.contains('open'));
          if (await hash() !== '#/map/t/' + topId || !pane) fail('phone map: tapping a topic gave ' + await hash() + ', pane open: ' + pane);
          await page.evaluate(() => document.getElementById('drawerClose').click()); await page.waitForTimeout(600);
          const sel = await page.evaluate(() => { const n = document.querySelector('#mapsvg .node.sel .disc'); if (!n) return null; const r = n.getBoundingClientRect(), w = document.getElementById('mapwrap').getBoundingClientRect(); return r.left >= w.left - 1 && r.right <= w.right + 1 && r.top >= w.top - 1 && r.bottom <= w.bottom + 1; });
          if (sel !== true) fail('phone map: the selected topic is not whole inside the stage on returning to the map (' + sel + ')');
          { const px = await page.evaluate(MAP_LABEL_PX); if (px.min < 10.9) fail('phone map: labels are ' + px.min.toFixed(1) + 'px with a topic selected'); }
        }
      }
      // an open domain is framed: its card and every topic card are whole inside the stage
      await goto('#/map/d/' + domId); await page.waitForTimeout(700);
      { const f = await inStage('#mapsvg .node.domain.open, #mapsvg .node.topic'); if (f.n < 2 || f.out) fail('phone map: on the open domain ' + f.out + ' of ' + f.n + ' cards (domain and topics) are outside the stage'); const px = await page.evaluate(MAP_LABEL_PX); if (px.min < 10.9) fail('phone map: labels are ' + px.min.toFixed(1) + 'px on the open domain'); }
      // the faint cross-branch curves are not drawn on a phone
      if (await page.evaluate(() => document.querySelectorAll('#mapsvg .edge.dd, #mapsvg .edge.cross, #mapsvg .edge.home').length)) fail('phone map: cross-branch dashed curves are drawn');
      // the stage ends at the bottom of the screen
      { const b = await page.evaluate(() => ({ bottom: document.getElementById('mapwrap').getBoundingClientRect().bottom, vh: innerHeight })); if (Math.abs(b.bottom - b.vh) > 1.5) fail('phone map: the stage ends at ' + b.bottom.toFixed(0) + ', the screen at ' + b.vh); }
      // the toolbar below Find is at most two rows, each button 44px or more
      { const t = await page.evaluate(() => { const bs = [...document.querySelectorAll('.mapbar .mapctl > *:not([hidden])')].map(e => e.getBoundingClientRect()).filter(r => r.width); return { rows: new Set(bs.map(r => Math.round(r.top / 20))).size, small: bs.filter(r => r.height < 43.5).length }; }); if (t.rows > 2 || t.small) fail('phone map: toolbar is ' + t.rows + ' rows with ' + t.small + ' short buttons'); }
      // no dashed card borders on the phone canvas: "next" is a solid accent outline
      const dash = await page.evaluate(() => [...document.querySelectorAll('#mapsvg .node .disc')].filter(d => { const s = getComputedStyle(d).strokeDasharray; return s && s !== 'none' && s !== '0'; }).length);
      if (dash) fail('phone map: ' + dash + ' cards have a dashed border');
      // Map | List: List shows the outline, remembered across a reload; Map brings the canvas back
      await goto('#/map/home');
      await page.click('#mapPhoneView button[data-view="list"]'); await page.waitForTimeout(700);
      const lst = await page.evaluate(() => ({ svg: getComputedStyle(document.getElementById('mapsvg')).display !== 'none', out: getComputedStyle(document.getElementById('mapoutline')).display !== 'none', rows: document.querySelectorAll('#mapoutline .oi-row').length, stored: localStorage.getItem('playable.mapPhoneView'), pressed: document.querySelector('#mapPhoneView [data-view="list"]').getAttribute('aria-pressed') }));
      if (lst.svg || !lst.out || !lst.rows || lst.stored !== '"list"' || lst.pressed !== 'true') fail('phone map: the List switch ' + JSON.stringify(lst));
      await page.reload(); await page.waitForTimeout(900);
      if (!await page.evaluate(() => getComputedStyle(document.getElementById('mapoutline')).display !== 'none')) fail('phone map: List was not remembered after a reload');
      await page.click('#mapPhoneView button[data-view="map"]'); await page.waitForTimeout(800);
      const mp = await page.evaluate(() => ({ svg: getComputedStyle(document.getElementById('mapsvg')).display !== 'none', out: getComputedStyle(document.getElementById('mapoutline')).display !== 'none', stored: localStorage.getItem('playable.mapPhoneView') }));
      if (!mp.svg || mp.out || mp.stored !== '"map"') fail('phone map: the Map switch ' + JSON.stringify(mp));
      if (errors.length) fail('page error on the phone map: ' + errors[0]);
    }

    // -- the phone outline (List view): the same tree as a list, groups with counts, read marks, next unread, 44px rows, and the routes
    if (!canvas) {
      await goto('#/map/home');
      const ol = await page.evaluate(() => {
        const o = document.getElementById('mapoutline'), svg = document.getElementById('mapsvg'), rows = [...o.querySelectorAll('.oi-row')];
        const small = rows.slice(0, 20).filter(r => r.getBoundingClientRect().height < 43.5).length;
        const next = document.getElementById('mapNext');
        return { shown: getComputedStyle(o).display !== 'none', svgShown: getComputedStyle(svg).display !== 'none', rows: rows.length, small, doms: o.querySelectorAll('li[data-kind="domain"]').length, domsWant: DOMAINS.filter(d => d.lens === LENSES[0][0]).length,
          counts: [...o.querySelectorAll('li[data-kind="domain"] .oi-sub')].filter(s => /\d+ of \d+ read/.test(s.textContent)).length, unread: o.querySelectorAll('.rd-o').length, next: !!next && !next.hidden && /Next unread/.test(next.textContent), wrapsAll: o.scrollWidth <= o.clientWidth + 1 };
      });
      if (!ol.shown || ol.svgShown) fail('phone: the outline must show and the canvas must not ' + JSON.stringify(ol));
      if (ol.doms !== ol.domsWant) fail(`phone outline lists ${ol.doms} domains, the lens has ${ol.domsWant}`);
      if (ol.small) fail(`phone outline: ${ol.small} rows are under 44px tall`);
      if (ol.counts !== ol.doms) fail(`phone outline: ${ol.counts} of ${ol.doms} domains show their read count`);
      if (!ol.next) fail('phone outline: no "Next unread" button');
      if (!ol.wrapsAll) fail('phone outline scrolls sideways');
      // expand a group of the outline: a domain opens in place, and the route follows
      const dom = await page.evaluate(() => document.querySelector('#mapoutline li[data-kind="domain"]').dataset.id);
      await page.click('#mapoutline li[data-kind="domain"] > .oi-row'); await page.waitForTimeout(800);
      const ex = await page.evaluate(() => { const li = document.querySelector('#mapoutline li[data-kind="domain"]'), topics = li.querySelectorAll('li[data-kind="topic"]'), o = document.getElementById('mapoutline'), r = li.getBoundingClientRect(), b = o.getBoundingClientRect(); return { hash: location.hash, expanded: li.getAttribute('aria-expanded'), topics: topics.length, want: DOMAINS.find(d => d.id === li.dataset.id).topics.length, inView: r.top < b.bottom && r.bottom > b.top, live: document.getElementById('maplive').textContent }; });
      if (ex.hash !== '#/map/d/' + dom || ex.expanded !== 'true' || ex.topics !== ex.want || !ex.inView) fail('phone outline: opening a domain ' + JSON.stringify(ex));
      if (!/^Expanded /.test(ex.live)) fail(`phone outline: opening a domain was not announced "${ex.live}"`);
      // open a topic: it becomes a page, selected in the outline, and the way back shows it in view
      const tid = await page.evaluate(() => document.querySelector('#mapoutline li[data-kind="topic"]').dataset.id);
      await page.click('#mapoutline li[data-kind="topic"] > .oi-row'); await page.waitForTimeout(900);
      const pg = await page.evaluate(() => ({ hash: location.hash, pane: document.getElementById('pane').classList.contains('open'), sel: [...document.querySelectorAll('#mapoutline [aria-selected="true"]')].map(n => n.dataset.id), back: document.getElementById('drawerClose').textContent, backLabel: document.getElementById('drawerClose').getAttribute('aria-label') }));
      if (pg.hash !== '#/map/t/' + tid || !pg.pane || pg.sel.join() !== tid) fail('phone outline: opening a topic ' + JSON.stringify(pg));
      if (!/Map/.test(pg.back) || !/outline/.test(pg.backLabel || '')) fail(`the back button on a phone reads "${pg.back}" / "${pg.backLabel}"`);
      await page.evaluate(() => document.getElementById('drawerClose').click()); await page.waitForTimeout(500);
      const back = await page.evaluate(() => { const li = document.querySelector('#mapoutline [aria-selected="true"]'), o = document.getElementById('mapoutline'), r = li.querySelector(':scope > .oi-row').getBoundingClientRect(), b = o.getBoundingClientRect(); return { shown: getComputedStyle(o).display !== 'none' && o.getBoundingClientRect().width > 0, inView: r.top >= b.top - 1 && r.bottom <= b.bottom + 1, groups: o.querySelectorAll('li[data-kind="group"]').length }; });
      if (!back.shown || !back.inView) fail('phone outline: the selected topic is not in view on returning ' + JSON.stringify(back));
    }
    await ctx.close();
  }
  // The map follow-ups: a selected topic is framed with its groups (and the leaves the
  // window cuts off are counted in "more" pills), a click inside the map keeps the map
  // shown, find in map, the skip link from a folded page, and a toolbar that stays on one line.
  for (const w of [1280, 1440]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
    const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    const fail = m => failures.push(`${w}px map follow-ups: ${m}`);
    const fresh = async (hash, keep) => {
      await page.goto(base + '#/map/home');
      await page.evaluate(k => { localStorage.clear(); localStorage.setItem('playable.visited', 'true'); if(k) localStorage.setItem('playable.hideMap', 'false'); }, keep);
      await page.goto(base + hash); await page.reload(); await page.waitForTimeout(1100);
    };
    // framing: the topic and its group column are in view, labels stay readable, cut-off leaves are counted
    for (const id of ['who-is-the-player', 'server-rollback-netcode', 'core-loop']) {
      await fresh('#/map/t/' + id, true);
      if (id === 'core-loop') { await page.evaluate(() => { const g = document.querySelector('#mapsvg .node[data-kind="group"][data-id="game"]'); if(g && !g.classList.contains('open')) g.dispatchEvent(new MouseEvent('click', { bubbles: true })); }); await page.waitForTimeout(900); }
      const r = await page.evaluate(() => {
        const wr = document.getElementById('mapwrap').getBoundingClientRect(), vb = document.getElementById('mapsvg').viewBox.baseVal, k = wr.width / vb.width;
        const rect = n => n.getBoundingClientRect();
        const inside = n => { const b = rect(n); return b.left >= wr.left - 1 && b.right <= wr.right + 1 && b.top >= wr.top - 1 && b.bottom <= wr.bottom + 1; };
        const sel = document.querySelector('#mapsvg .node.topic[aria-selected="true"]');
        const groups = [...document.querySelectorAll('#mapsvg .node[data-kind="group"]')];
        const leaves = [...document.querySelectorAll('#mapsvg .node[data-kind="leaf"], #mapsvg .node[data-kind="item"]')];
        const cutOff = leaves.filter(n => { const b = rect(n), cy = (b.top + b.bottom) / 2; return cy < wr.top || cy > wr.bottom || b.right > wr.right + b.width / 6 || b.left < wr.left - b.width / 6; }).length;
        const lbl = [...document.querySelectorAll('#mapsvg .node .lbl:not(.sub)')].filter(t => inside(t.closest('.node'))).map(t => parseFloat(getComputedStyle(t).fontSize) * k);
        return { sel: !!sel && inside(sel), groupsIn: groups.filter(inside).length, groups: groups.length, cutOff, pills: document.querySelectorAll('#mapmore .morecue').length, minLabel: lbl.length ? Math.min(...lbl) : 99 };
      });
      if (!r.sel) fail(`${id}: the selected topic is not whole in the window`);
      if (id === 'core-loop' ? r.groupsIn < 1 : r.groupsIn !== r.groups) fail(`${id}: only ${r.groupsIn} of ${r.groups} groups are in view`);
      if (r.minLabel < 10.9) fail(`${id}: labels drawn at ${r.minLabel.toFixed(1)}px, under the 11px floor`);
      if ((r.cutOff > 0) !== (r.pills > 0)) fail(`${id}: ${r.cutOff} leaves are cut off but ${r.pills} "more" pills are shown`);
      if (id === 'core-loop' && !r.pills) fail('core-loop with Games open: no "more" cue for the leaves past the edge');
    }
    // a click inside the map keeps the map shown, on a page that folds it away by default; the reader's own choice wins
    await fresh('#/map/home', false);
    const shown = () => page.evaluate(() => { const s = document.getElementById('shell'), m = document.getElementById('mapwrap'); return !s.classList.contains('nomap') && m.getBoundingClientRect().width > 200; });
    await page.locator('#mapsvg .node[data-kind="domain"]').nth(2).click({ force: true }); await page.waitForTimeout(900);
    if (!/^#\/map\/d\//.test(await hashOf(page))) fail('clicking a domain did not open its page');
    if (!await shown()) fail('clicking a domain on the map hid the map');
    await page.locator('#mapsvg .node[data-kind="topic"]').first().click({ force: true }); await page.waitForTimeout(900);
    if (!/^#\/map\/t\//.test(await hashOf(page))) fail('clicking a topic did not open it');
    if (!await shown()) fail('clicking a topic on the map hid the map');
    await page.click('[data-action="toggle-map"]'); await page.waitForTimeout(500);
    if (await shown()) fail('Hide map did not hide the map');
    await page.evaluate(() => { location.hash = '#/map/d/core'; }); await page.waitForTimeout(700);
    if (await shown()) fail('the reader hid the map, but a later page showed it again');
    // find in map: type, count, Enter opens the first match (switching lens), Escape clears
    await fresh('#/map/home', true);
    await page.fill('#mapFind', 'fantasy'); await page.waitForTimeout(500);
    const f1 = await page.evaluate(() => ({ n: document.getElementById('mapFindN').textContent, live: document.getElementById('maplive').textContent, found: document.querySelectorAll('#mapsvg .node.found').length }));
    if (!/\d+ match/.test(f1.n) || !/match/.test(f1.live)) fail('find in map gave no count: ' + JSON.stringify(f1));
    await page.keyboard.press('Enter'); await page.waitForTimeout(1000);
    if (!/^#\/map\/t\/fantasy/.test(await hashOf(page))) fail('Enter in find did not open the first match (' + await hashOf(page) + ')');
    if (!await shown()) fail('opening a find match hid the map');
    await page.fill('#mapFind', 'fantasy'); await page.waitForTimeout(400);
    if (!await page.evaluate(() => document.querySelectorAll('#mapsvg .node.found').length)) fail('find in map rings nothing for "fantasy"');
    await page.fill('#mapFind', 'rollback'); await page.waitForTimeout(400); await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
    const f2 = await page.evaluate(() => ({ hash: location.hash, lens: document.querySelector('.lens-switch [aria-pressed="true"]').dataset.lens }));
    if (!/server-rollback-netcode/.test(f2.hash) || f2.lens !== 'eng') fail('find "rollback" did not switch to the engineering lens ' + JSON.stringify(f2));
    await page.press('#mapFind', 'Escape'); await page.waitForTimeout(300);
    const f3 = await page.evaluate(() => ({ v: document.getElementById('mapFind').value, found: document.querySelectorAll('#mapsvg .node.found').length, n: document.getElementById('mapFindN').textContent }));
    if (f3.v || f3.found || f3.n) fail('Escape did not clear find ' + JSON.stringify(f3));
    // the skip link from a topic page whose map is folded away opens the map and lands on it
    await fresh('#/map/t/decisions', false);
    await page.evaluate(() => { document.activeElement && document.activeElement.blur(); document.body.focus(); });
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
    if (await page.evaluate(() => document.activeElement.id) !== 'skipMapBtn') fail('the second Tab stop on a topic page is not "Skip to the map"');
    await page.keyboard.press('Enter'); await page.waitForTimeout(1300);
    if (!await shown() || !await page.evaluate(() => !!document.activeElement.closest('#mapsvg [role="treeitem"]'))) fail('"Skip to the map" on a folded page did not show the map and focus it');
    // the toolbar: crumbs and find on the first line, every button on one line, at the narrowest stage the desktop gives
    const pathId = await page.evaluate(() => PATHS[0].id);
    for (const hash of ['#/map/home', '#/map/t/core-loop', '#/paths/' + pathId]) {
      await fresh(hash, true);
      const bar = await page.evaluate(() => { const els = [...document.querySelectorAll('.mapbar .mapctl > *:not([hidden])')].map(e => e.getBoundingClientRect()).filter(b => b.width), find = document.getElementById('mapFind').getBoundingClientRect(), wr = document.getElementById('mapstage').getBoundingClientRect(); return { oneLine: Math.max(...els.map(b => b.top)) < Math.min(...els.map(b => b.bottom)), inside: Math.max(...els.map(b => b.right)) <= wr.right + 1, find: find.width > 100 }; });
      if (!bar.oneLine) fail(`the map toolbar wraps on ${hash}`);
      if (!bar.inside) fail(`the map toolbar runs past the stage on ${hash}`);
      if (!bar.find) fail(`the find field is too narrow on ${hash}`);
    }
    if (errors.length) fail('page error ' + errors[0]);
    await ctx.close();
  }
  // Reference solutions, the Go tab, snippet labels and glossary toggletips.
  for (const [w, h] of [[375, 812], [1440, 900]]) {
    const fail = m => failures.push(`${w}px reading aids: ${m}`);
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 700, isMobile: w < 700 });
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(String(e)));
    await page.goto(base); await page.evaluate(() => { localStorage.setItem('playable.visited', 'true'); localStorage.setItem('playable.hideMap', 'true'); });
    const data = await page.evaluate(() => {
      const withSol = PATHS.flatMap(p => p.stages.filter(s => s.check.solution).map(s => ({ path: p.id, stage: s.id })))[0] || null;
      const go = Object.values(TOPICS).find(t => t.go);
      return { withSol, go: go ? go.id : null, goWhole: go ? /^package /.test(go.go.snippet) : false };
    });
    const goto = async hash => { await page.goto(base + hash); await page.reload(); await page.waitForTimeout(500); };
    // a path stage with a reference solution shows it closed, under the build task
    if (data.withSol) {
      await goto('#/paths/' + data.withSol.path + '/' + data.withSol.stage);
      const sol = await page.evaluate(() => { const d = document.querySelector('details.pathsolution'); return d ? { open: d.open, text: d.querySelector('summary').textContent.trim(), items: d.querySelectorAll('li').length } : null; });
      if (!sol) fail('a path stage with a reference solution does not show it');
      else if (sol.open || !/^Reference solution: open after you try/.test(sol.text) || sol.items < 2) fail('reference solution disclosure is wrong ' + JSON.stringify(sol));
    }
    // the Go tab and the snippet labels
    if (data.go) {
      await goto('#/map/t/' + data.go + '/go');
      const g = await page.evaluate(() => ({ tab: [...document.querySelectorAll('.topictabs [role=tab]')].map(b => b.textContent), note: (document.querySelector('.engview .snipnote') || {}).textContent || '', code: (document.querySelector('.engview pre.snippet') || {}).textContent || '', copy: !!document.querySelector('.engview .copybtn') }));
      if (!g.tab.includes('Go')) fail('a topic with a GO entry has no Go tab ' + JSON.stringify(g.tab));
      if (!/^package /.test(g.code) || !g.copy) fail('the Go tab has no whole-file snippet with a copy button');
      if (!/Whole file/.test(g.note)) fail('the Go tab has no "Whole file" label');
    }
    for (const tab of ['godot', 'unity']) {
      await goto('#/map/t/core-loop/' + tab);
      const note = await page.evaluate(() => (document.querySelector('.engview .snipnote') || {}).textContent || '');
      if (!/Whole script|Excerpt/.test(note)) fail(`the ${tab} tab has no snippet label (got "${note}")`);
    }
    // a toggletip opens on tap or click, speaks through a status region, and closes with Escape
    await goto('#/map/t/core-loop/overview');
    const gt = page.locator('.sec.open button.gt').first();
    if (!await gt.count()) fail('no glossary toggletip on core-loop');
    else {
      const bubble = () => page.evaluate(() => { const b = document.getElementById('gtBubble'); return b ? { text: b.textContent, role: b.getAttribute('role') } : null; });
      if (w < 700) await gt.tap(); else await gt.click();
      await page.waitForTimeout(250);
      const b1 = await bubble(), exp = await gt.getAttribute('aria-expanded');
      if (!b1 || !b1.text.trim() || b1.role !== 'status' || exp !== 'true') fail('the toggletip did not open ' + JSON.stringify({ b1, exp }));
      const box = await page.evaluate(() => { const r = document.getElementById('gtBubble').getBoundingClientRect(); return r.left >= 0 && r.right <= document.documentElement.clientWidth && r.top >= 0 && r.bottom <= innerHeight; });
      if (!box) fail('the toggletip bubble runs off the screen');
      await page.keyboard.press('Escape'); await page.waitForTimeout(150);
      const b2 = await bubble();
      if (b2 && b2.text.trim() || await gt.getAttribute('aria-expanded') !== 'false') fail('Escape did not close the toggletip');
      if (w < 700) await gt.tap(); else await gt.click();
      await page.waitForTimeout(250);
      if (w < 700) await gt.tap(); else await gt.click();
      await page.waitForTimeout(150);
      if (await gt.getAttribute('aria-expanded') !== 'false') fail('a second tap did not close the toggletip');
    }
    if (errors.length) fail('page error ' + errors[0]);
    await ctx.close();
  }
  // Reduced motion: the camera moves in one step and CSS transitions are cut.
  {
    const probe = async reduce => {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: reduce ? 'reduce' : 'no-preference' });
      const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(String(e)));
      await page.goto(base + '#/map/home'); await page.evaluate(() => localStorage.setItem('playable.hideMap', 'false')); await page.reload(); await page.waitForTimeout(900);
      // count the camera writes after the route change: an animation writes the viewBox every frame, an immediate move writes it once or twice (the stage refit)
      const writes = await page.evaluate(() => new Promise(res => { let n = 0; const svg = document.getElementById('mapsvg'); const mo = new MutationObserver(() => { n++; }); mo.observe(svg, { attributes: true, attributeFilter: ['viewBox'] }); location.hash = '#/map/t/scope-control/overview'; setTimeout(() => { mo.disconnect(); res(n); }, 1200); }));
      const tr = await page.evaluate(() => getComputedStyle(document.querySelector('#mapsvg .edge')).transitionDuration);
      await ctx.close();
      return { writes, tr, errors };
    };
    const r = await probe(true), c = await probe(false);
    if (r.writes > 3) failures.push(`reduced motion: the camera was written ${r.writes} times after a route change (an animation), expected at most 3`);
    if (parseFloat(r.tr) > 0.001) failures.push(`reduced motion: edges still transition (${r.tr})`);
    if (c.writes < 5) failures.push(`reduced motion test is not meaningful: with motion on the camera was written only ${c.writes} times`);
    if (r.errors.length) failures.push('reduced motion: page error ' + r.errors[0]);
  }
  await browser.close(); server.close();
  console.log(`smoke: ${visits} route visits at 4 widths; failures: ${failures.length}`);
  failures.slice(0, 40).forEach(f => console.log('  ' + f));
  notes.forEach(n => console.log('  note: ' + n));
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
