// Path game end-to-end checks (#/play/<path>, 96-rpg.js) in a fresh browser
// profile, at desktop and phone widths: the path page offers the game; the
// game draws a world with no path bar above it; the keyboard walks and talks
// and the site's own shortcuts stay quiet; a person's last box opens the
// step's page and the path bar leads back to the same person; Mark done is
// the path page's own tick; a reflect step's notes are the path page's notes;
// a guardian's round writes the same checkpoint record and review entries as
// the page's; tapping walks there; a reload keeps the place; reduced motion
// turns smooth walking off. Needs Playwright, like smoke.js.
// Usage: node src/e2e-rpg.js   (PLAYWRIGHT_CHANNEL=msedge uses Edge)
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]) === '/' ? 'playable.html' : decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (err, data) => { if (err) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': ({ '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.js': 'text/javascript' })[path.extname(p)] || 'application/octet-stream' }); res.end(data); });
});
const ID = 'game-designer-foundations';
(async () => {
  await new Promise(r => server.listen(0, r));
  const BASE = `http://localhost:${server.address().port}/playable.html`;
  const browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail: ok ? '' : String(detail).slice(0, 900) });
  for (const [w, h] of [[1440, 900], [375, 812]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage(), tag = `${w}px`;
    const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const settled = () => page.evaluate(() => window.PlayableApp.settled());
    const nav = async r => { await page.evaluate(r => { location.hash = r; }, r); await page.waitForTimeout(30); await settled(); };
    const status = () => page.textContent('#pane .rpg-status');
    const box = async () => (await page.textContent('#pane .rpg-box')).replace(/\s+/g, ' ').trim();
    const prog = () => page.evaluate(id => JSON.parse(localStorage.getItem('playable.path.' + id) || '{"steps":{},"stages":{},"check":{}}'), ID);
    const key = async (k, n = 1) => { for (let i = 0; i < n; i++) { await page.keyboard.press(k); await page.waitForTimeout(150); } };
    const pages = async () => { for (let i = 0; i < 8 && await page.$('#pane .rpg-box [data-rpg="more"]'); i++) await page.click('#pane .rpg-box [data-rpg="more"]'); };
    // the world the page builds, to know where each person stands
    const world = () => page.evaluate(id => { const W = window.PlayableApp.buildRpgWorld(PATHS.find(p => p.id === id)); return W.towns.map(t => ({ k: t.k, east: t.east, entry: t.entry, people: t.people.map(p => [p.x, p.y]), guardian: [t.guardian.x, t.guardian.y], sign: [t.sign.x, t.sign.y] })); }, ID);
    // along the road from a town's way in to the road tile beside person i (or the guardian), facing them
    const walkToPerson = async (t, xy) => { await page.focus('#pane .rpg-stage'); const dx = xy[0] - t.entry.x; await key(dx > 0 ? 'ArrowRight' : 'ArrowLeft', Math.abs(dx)); await key(xy[1] < t.entry.y ? 'ArrowUp' : 'ArrowDown'); };
    const travel = async k => { await page.click('#pane [data-rpg="travel"]'); await page.click(`#pane .rpg-box [data-rpg="go-town"][data-k="${k}"]`); await page.waitForTimeout(60); };

    await page.goto(BASE + `#/paths/${ID}`); await settled();
    check(`${tag} the path page offers the game`, await page.$(`#pane .rpgplay a[href="#/play/${ID}"]`));
    await nav(`#/play/${ID}`); await page.waitForSelector('#pane .rpg canvas');
    const shell = await page.evaluate(() => ({ bar: !!document.querySelector('#pane .pathbar'), sub: !!document.querySelector('#pane .subnav'), first: document.querySelector('#pane .rpg a, #pane .rpg button')?.textContent, cw: document.querySelector('#pane .rpg canvas').width, h1: document.querySelector('#pane h1')?.textContent }));
    check(`${tag} the game draws a world, with no path bar or sub-navigation, and "Use the list instead" first`, !shell.bar && !shell.sub && shell.first === 'Use the list instead' && shell.cw > 0 && shell.h1, JSON.stringify(shell));
    const W = await world();
    check(`${tag} the game starts at the first town's way in`, /^Town 1,/.test(await status()), await status());

    // --- the site's shortcuts stay quiet in the game: digits leave the page, t changes the theme
    await page.focus('#pane .rpg-stage');
    const theme = await page.evaluate(() => document.documentElement.dataset.theme || '');
    await page.keyboard.press('2'); await page.keyboard.press('t'); await page.waitForTimeout(100);
    check(`${tag} the game keeps 2 and t from the site's shortcuts`, (await page.evaluate(() => location.hash)) === `#/play/${ID}` && (await page.evaluate(() => document.documentElement.dataset.theme || '')) === theme);

    // --- walk to the first person and talk
    const t0 = W[0];
    await walkToPerson(t0, t0.people[0]);
    const st1 = await page.evaluate(id => stepTitle(PATHS.find(p => p.id === id).stages[0].steps[0]), ID);
    check(`${tag} the status line names the person beside the player`, (await status()).includes(st1), await status());
    await page.keyboard.press('Enter'); await page.waitForTimeout(80);
    const inBox = await page.evaluate(() => !!document.activeElement.closest('#pane .rpg-box'));
    check(`${tag} Enter talks, and focus moves into the box`, (await box()).includes(st1) && inBox, await box());
    await pages();
    const href = await page.evaluate(id => { const p = PATHS.find(p => p.id === id); return stepHref(p.stages[0].steps[0], id, p.stages[0].id); }, ID);
    await page.click('#pane .rpg-box [data-rpg="goto"]'); await settled();
    check(`${tag} Go there opens the step's own page`, (await page.evaluate(() => location.hash)) === href, await page.evaluate(() => location.hash));
    check(`${tag} the path bar offers the way back to the world`, await page.$(`#pane .pathbar a[href="#/play/${ID}"]`));
    await page.click(`#pane .pathbar a[href="#/play/${ID}"]`); await settled(); await page.waitForSelector('#pane .rpg canvas');
    check(`${tag} coming back puts the player beside the same person`, (await status()).includes(st1), await status());
    const barGone = await page.evaluate(id => !JSON.parse(localStorage.getItem('playable.rpg.' + id) || '{}').back, ID);
    check(`${tag} the way back is used once`, barGone);

    // --- Mark done is the path page's tick
    await page.focus('#pane .rpg-stage'); await page.keyboard.press('Enter'); await pages();
    await page.click('#pane .rpg-box [data-rpg="done"]');
    check(`${tag} Mark done ticks the step under the path page's key`, (await prog()).steps['s1/0'] === true, JSON.stringify((await prog()).steps));
    await page.keyboard.press('Escape'); await page.waitForTimeout(60);
    check(`${tag} Escape closes the box and gives focus back to the world`, await page.evaluate(() => document.querySelector('#pane .rpg-box').hidden && document.activeElement === document.querySelector('#pane .rpg-stage')));

    // --- a reflect step's notes are the path page's notes
    const t3 = W[3];
    await travel(3); await walkToPerson(t3, t3.people[6]);
    await page.keyboard.press('Enter'); await pages();
    await page.click('#pane .rpg-box [data-rpg="notes"]');
    await page.fill('#pane .rpg-box textarea[data-pathnote]', 'notes from the world');
    const note = await page.evaluate(id => localStorage.getItem(`playable.pathnote.${id}.s4.6`), ID);
    check(`${tag} a reflect step writes its notes where the path page keeps them`, note === JSON.stringify('notes from the world'), note);
    await page.click('#pane .rpg-box [data-rpg="close"]');

    // --- the guardian's round: the same record and the same review entries as the page's checkpoint
    await travel(0); await walkToPerson(t0, t0.guardian);
    check(`${tag} the guardian stands beside the road`, /guardian of/.test(await status()), await status());
    await page.keyboard.press('Enter'); await page.click('#pane .rpg-box [data-rpg="fight"]');
    const fightShell = await page.evaluate(() => ({ map: getComputedStyle(document.querySelector('#pane .rpg-stage > canvas')).display, foe: !!document.querySelector('#pane .rpg-foe canvas'), q: document.activeElement.matches('.rpg-q') }));
    check(`${tag} a battle takes the map's place and focuses the question`, fightShell.map === 'none' && fightShell.foe && fightShell.q, JSON.stringify(fightShell));
    check(`${tag} the outline stays hidden until a confidence tap`, !(await page.$('#pane .rpg-box [data-idea]')) && await page.$('#pane .rpg-box [data-rpg="reveal"][disabled]'));
    for (let q = 0; q < 10 && !(await page.$('#pane .rpg-sum')); q++) {
      if (await page.$('#pane .rpg-box [data-rpg="conf"]')) { await page.click('#pane .rpg-box [data-rpg="conf"][data-v="sure"]'); await page.click('#pane .rpg-box [data-rpg="reveal"]'); }
      // in the first round, the first two are recalled in full and the rest not at all
      const ideas = await page.$$('#pane .rpg-box [data-idea]');
      if (q < 2) for (const i of ideas) await i.check();
      await page.click('#pane .rpg-box [data-rpg="mark"]');
      if (q === 0) check(`${tag} the outcome is said in words, with no score`, /That answer: got it/.test(await box()) && !/hp|damage|points/i.test(await box()), await box());
    }
    const rec = (await prog()).check.s1, rv = await page.evaluate(id => Object.keys(JSON.parse(localStorage.getItem('playable.review') || '{}')).filter(k => k.startsWith(`ck:${id}:s1:`)).length, ID);
    check(`${tag} the round keeps the page's checkpoint record`, rec && rec.mode === 'check' && rec.n === 4 && rec.got === 2 && rec.missed === 2, JSON.stringify(rec));
    check(`${tag} every question goes into the review queue under the page's keys`, rv === 4, rv);
    check(`${tag} the end shows the build task and Mark stage done`, /Build:/.test(await box()) && await page.$('#pane .rpg-box [data-rpg="stage-done"]'), await box());
    await page.keyboard.press('Escape'); await page.waitForTimeout(60);
    await nav(`#/paths/${ID}`);
    const map = await page.evaluate(() => document.querySelector('#pane .overworld .region')?.textContent || '');
    check(`${tag} the path page shows the game's round in its stage map`, /2 of 4 recalled/.test(map), map);

    // --- tap to walk: tapping the sign walks there and reads it
    await nav(`#/play/${ID}`); await page.waitForSelector('#pane .rpg canvas'); await travel(0);
    // where the sign is drawn: the tile size in CSS px is the canvas's CSS width over its column count, the
    // column count is the backing width over 16 * k with k = round(scale * dpr), and the camera follows the
    // player at the town's way in exactly as the game's draw() places it
    const geo = await page.evaluate(() => { const c = document.querySelector('#pane .rpg canvas'), r = c.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      for (const S of [2, 3]) { const k = Math.max(1, Math.round(S * dpr)); if (c.width % (16 * k) === 0 && Math.abs(r.width - c.width / dpr) < 1) { const cols = c.width / (16 * k), rows = c.height / (16 * k); return { x: r.x, y: r.y, tile: r.width / cols, cols, rows }; } }
      return null; });
    const dims = await page.evaluate(id => { const W = window.PlayableApp.buildRpgWorld(PATHS.find(p => p.id === id)); return [W.w, W.h]; }, ID);
    const cam = (p, view, size) => size * 16 <= view * 16 ? (size * 16 - view * 16) / 2 : Math.max(0, Math.min(size * 16 - view * 16, p * 16 + 8 - view * 16 / 2));
    const camX = Math.round(cam(t0.entry.x, geo.cols, dims[0])), camY = Math.round(cam(t0.entry.y, geo.rows, dims[1]));
    await page.mouse.click(geo.x + ((t0.sign[0] * 16 - camX) + 8) * geo.tile / 16, geo.y + ((t0.sign[1] * 16 - camY) + 8) * geo.tile / 16);
    await page.waitForTimeout(800);
    check(`${tag} tapping the sign walks to it and reads it`, /Stage 1 of 4/.test(await box()), await box());
    await page.keyboard.press('Escape');

    // --- the place is kept across a reload
    await page.focus('#pane .rpg-stage'); await key('ArrowRight', 2);
    const here = await status();
    await page.reload(); await page.waitForSelector('#pane .rpg canvas'); await settled();
    check(`${tag} a reload keeps the player's place`, (await status()) === here, `${here} / ${await status()}`);

    check(`${tag} no console errors`, !errors.length, errors[0]);
    await ctx.close();
  }
  // --- reduced motion: smooth walking is off
  const c2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }), p2 = await c2.newPage();
  await p2.goto(BASE + `#/play/${ID}`); await p2.waitForSelector('#pane .rpg canvas');
  check('reduced motion turns smooth walking off', (await p2.textContent('#pane [data-rpg="motion"]')).includes('off'));
  await c2.close();
  await browser.close(); server.close();
  const bad = results.filter(r => !r.ok);
  results.forEach(r => console.log((r.ok ? 'PASS ' : 'FAIL ') + r.name + (r.ok ? '' : ' :: ' + r.detail)));
  console.log(`e2e-rpg: ${results.length - bad.length}/${results.length} passed`);
  if (process.env.GITHUB_ACTIONS) bad.forEach(r => console.log('::error title=e2e-rpg::' + (r.name + ' :: ' + r.detail).replace(/\r?\n/g, ' ')));
  process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
