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
    // one topic per diagram kind
    ...['core-loop', 'feature-vs-experience', 'choosing-ai-technique', 'depth-vs-complexity', 'pacing', 'economy-and-resources', 'perception-and-awareness', 'infra-ci-pipelines'].map(id => '#/map/t/' + id + '/overview')
  ];
};
// The smallest label on the map, as drawn on screen, and whether a domain node is in view.
// Node labels on the map that the stage edge cuts off (horizontally), for nodes in view.
const CUT_LABELS = () => {
  const w = document.getElementById('mapwrap').getBoundingClientRect(), cut = [];
  for (const t of document.querySelectorAll('#mapsvg .node .lbl')) { const r = t.getBoundingClientRect(); if (r.right > w.left && r.left < w.right && r.top < w.bottom && r.bottom > w.top && (r.left < w.left - 1 || r.right > w.right + 1)) cut.push(t.textContent.trim().slice(0, 30)); }
  return cut;
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
        gacha: hrefs('gacha').includes('#/map/t/monetisation-design'), netcode: hrefs('networking').includes('#/map/t/server-rollback-netcode') };
    });
    if (!found.license || found.license !== found.licence) failures.push(`search: "license" finds ${found.license} topics, "licence" ${found.licence}`);
    if (!found.oneOnOne || !found.oneToOne) failures.push('search: "one on one" / "1:1" does not find lead-one-on-ones');
    if (!found.rules) failures.push('search: "3.1.1 loot boxes" does not find monetisation-design');
    if (!found.n311) failures.push('search: "3.1.1" finds nothing');
    if (!found.gacha) failures.push('search: "gacha" does not find monetisation-design');
    if (!found.netcode) failures.push('search: "networking" does not find server-rollback-netcode');
    if (errors.length) failures.push('cross-links page errors: ' + errors.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await browser.close(); server.close();
  console.log(`smoke: ${visits} route visits at 4 widths; failures: ${failures.length}`);
  failures.slice(0, 40).forEach(f => console.log('  ' + f));
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
