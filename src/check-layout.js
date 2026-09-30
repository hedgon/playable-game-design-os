// Layout QA for the maps: render every state (each domain open, each topic
// selected, every project and path state, plus any state the map code lists
// in PlayableGraph.checkStates) with the labels a reader sees, and check:
//   1. no two node cards overlap (pure geometry, from the renderer);
//   2. no card's text sticks out of its card. This part runs in a real
//      browser on the built playable.html, so the font, the size and the
//      letter-spacing are the ones the CSS really applies (the layout only
//      estimates them). Needs Playwright, like smoke.js; the built page must
//      be current (node src/build.js). --no-browser skips it.
// Both fail the build (exit 1). Reported, never failing: edge crossings
// (drawn edge pairs that cross) and words split across lines. The layout
// checker lives in layout-core.js so a synthetic dataset can be exercised too.
// Without Playwright or a browser the text-fit half is reported as NOT MEASURED
// (the build still runs); --require-browser turns that into a failure.
// Usage: node src/check-layout.js [--list] [--no-browser] [--require-browser]
//   (PLAYWRIGHT_CHANNEL=msedge or chrome uses an installed browser)
const fs = require('fs'), path = require('path');
const { DATA, DIAGRAM, FLOW, GRAPH } = require('./manifest.js');
const { overlaps, diagramProblems } = require('./layout-core.js');
const src = [...DATA, DIAGRAM, FLOW, GRAPH].map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const window = {};
const ctx = new Function('window', src + '\nreturn {DOMAINS,TOPICS,CASE_STUDIES,PATHS,REFERENCE_GAMES,VIEW_LINKS,contentTreeFlow,PLATFORMS,platformMatrix,stagesOf,ENGINES,GUIDE_LAYOUT};')(window);
const G = window.PlayableGraph;

// Text against card, in the real page. Every state is drawn into a hidden
// .mapwrap svg (so `.mapwrap .node text` and `.kgraph .lbl` apply), then each
// label's box is compared with its card. Runs inside the page.
function textFitSweep(layoutCoreSource) {
  const LC = (new Function('module', layoutCoreSource + '\nreturn module.exports;'))({ exports: {} });
  const views = Object.assign({}, VIEW_LINKS);
  const states = LC.graphStates(PlayableGraph, DOMAINS, TOPICS, CASE_STUDIES, PATHS, REFERENCE_GAMES, views);
  const wrap = document.createElement('div'); wrap.className = 'mapwrap';
  wrap.style.cssText = 'position:absolute;left:-99999px;top:0;width:auto;height:auto;border:0;overflow:visible';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'kgraph');
  svg.style.cssText = 'width:auto;height:auto;overflow:visible';
  wrap.appendChild(svg); document.body.appendChild(wrap);
  const bad = [], sizes = new Map(); let cards = 0, texts = 0;
  const TOL = 0.75;
  for (const st of states) {
    const g = st.make(), b = g.bbox;
    svg.setAttribute('viewBox', `${b.x} ${b.y} ${b.w} ${b.h}`); svg.setAttribute('width', b.w); svg.setAttribute('height', b.h);
    svg.innerHTML = g.inner;
    for (const node of svg.querySelectorAll('g.node')) {
      cards++;
      const r = node.querySelector('rect.disc'); if (!r) continue;
      const x = +r.getAttribute('x'), y = +r.getAttribute('y'), w = +r.getAttribute('width'), h = +r.getAttribute('height');
      const glyph = node.querySelector('text.glyph'), gb = glyph ? glyph.getBBox() : null;
      const boxes = [];
      for (const t of node.querySelectorAll('text.lbl')) {
        texts++;
        const tb = t.getBBox(), kind = node.getAttribute('data-kind') + (t.classList.contains('sub') ? ' sub' : '');
        const cs = getComputedStyle(t); sizes.set(kind + ' ' + cs.fontSize, (sizes.get(kind + ' ' + cs.fontSize) || 0) + 1);
        const over = [];
        if (tb.x < x - TOL) over.push(`left by ${(x - tb.x).toFixed(1)}`);
        if (tb.x + tb.width > x + w + TOL) over.push(`right by ${(tb.x + tb.width - x - w).toFixed(1)}`);
        if (tb.y < y - TOL) over.push(`top by ${(y - tb.y).toFixed(1)}`);
        if (tb.y + tb.height > y + h + TOL) over.push(`bottom by ${(tb.y + tb.height - y - h).toFixed(1)}`);
        if (gb && !t.classList.contains('sub') && tb.x < gb.x + gb.width && gb.x < tb.x + tb.width && tb.y < gb.y + gb.height && gb.y < tb.y + tb.height) over.push('runs into the +/- mark');
        if (over.length) bad.push({ n: st.name, m: `"${node.getAttribute('aria-label')}" (${node.getAttribute('data-kind')}, ${cs.fontSize}) text sticks out: ${over.join(', ')}` });
        boxes.push(tb);
      }
      if (boxes.length === 2) { const [a, c] = boxes; if (a.y < c.y + c.height - 1 && c.y < a.y + a.height - 1 && a.x < c.x + c.width && c.x < a.x + a.width) bad.push({ n: st.name, m: `"${node.getAttribute('aria-label')}" label and sub line overlap` }); }
    }
  }
  wrap.remove();
  return { states: states.length, cards, texts, bad, sizes: [...sizes.entries()].sort(), font: getComputedStyle(document.body).fontFamily.slice(0, 60) };
}

(async () => {
  const { states, problems, split, crossings } = overlaps(G, ctx.DOMAINS, ctx.TOPICS, ctx.CASE_STUDIES, window.PlayableFlow, ctx.PATHS, ctx.REFERENCE_GAMES, ctx.VIEW_LINKS);
  // Diagrams: every spec on a topic or a reference game, laid out as the app
  // draws it. A label is a name: a box grows with its text up to five lines, and
  // explanation belongs in the node description and "Diagram as text". A text
  // that would need more than five lines is a failure here, not a count.
  const specs = [];
  Object.values(ctx.TOPICS).forEach(t => { if (t.diagram) specs.push(['topic:' + t.id, t.diagram]); });
  specs.push(['diagnose:content-tree', ctx.contentTreeFlow()]);
  (ctx.PLATFORMS || []).forEach(p => { if (p.flow) specs.push(['platform:' + p.id, p.flow]); ctx.stagesOf(p).forEach(([k]) => { const d = p.stages[k] && p.stages[k].diagram; if (d) specs.push(['platform:' + p.id + '/' + k, d]); }); });
  if ((ctx.PLATFORMS || []).length) specs.push(['platforms:table', ctx.platformMatrix()]);
  if (ctx.GUIDE_LAYOUT) specs.push(['guide:layout', ctx.GUIDE_LAYOUT]);
  (ctx.ENGINES || []).forEach(e => { if (e.flow) specs.push(['engine:' + e.id, e.flow]); Object.entries(e.stages || {}).forEach(([k, s]) => { if (s.diagram) specs.push(['engine:' + e.id + '/' + k, s.diagram]); }); });
  (ctx.REFERENCE_GAMES || []).forEach(g => (g.diagrams || []).forEach((d, i) => specs.push([`game:${g.id}/${i}`, d])));
  problems.push(...diagramProblems(window.PlayableDiagram, window.PlayableFlow, specs));
  // A topic's game leaf on the map must come from a game whose lens is about
  // that topic whenever such a game exists, not from one whose diagram only
  // shows it (plan row I6).
  const lensTopics = new Set(); (ctx.REFERENCE_GAMES || []).forEach(g => Object.values(g.lens || {}).forEach(l => { if (l && !l.na) (l.topics || []).forEach(t => lensTopics.add(t)); }));
  const leaves = G.practiceLinks(ctx.CASE_STUDIES || [], 2, ctx.REFERENCE_GAMES || []).extra; let leafCount = 0;
  Object.entries(leaves).forEach(([tid, list]) => list.filter(([vid]) => vid.startsWith('game:')).forEach(([vid, why]) => { leafCount++; if (lensTopics.has(tid) && !/ lens$/.test(why)) problems.push(`map leaf for ${tid}: ${vid} is a diagram match although a game lens covers this topic`); }));
  console.log(`game leaves: ${leafCount}, lens-backed where a lens exists`);

  // the browser pass: text against card with the real font
  let fit = null, skipped = null;
  if (!process.argv.includes('--no-browser')) {
    let chromium; try { ({ chromium } = require('playwright')); } catch (e) { skipped = 'Playwright is not installed (npm i --no-save --no-package-lock playwright)'; }
    if (chromium) try {
      const html = path.join(__dirname, '..', 'playable.html');
      if (!fs.existsSync(html)) problems.push('text-fit check needs the built playable.html (node src/build.js)');
      else {
        const browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
        try {
          const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
          const pageErrors = []; page.on('pageerror', e => pageErrors.push(String(e)));
          await page.goto(require('url').pathToFileURL(html).href); await page.waitForTimeout(400);
          await page.evaluate(() => document.fonts.ready);
          fit = await page.evaluate(textFitSweep, fs.readFileSync(path.join(__dirname, 'layout-core.js'), 'utf8'));
          if (pageErrors.length) problems.push('text-fit page error: ' + pageErrors[0]);
          const grouped = new Map(); fit.bad.forEach(b => { const e = grouped.get(b.m) || { first: b.n, n: 0 }; e.n++; grouped.set(b.m, e); });
          grouped.forEach((e, m) => problems.push(`${m} (${e.n} state${e.n === 1 ? '' : 's'}, first ${e.first})`));
        } finally { await browser.close(); }
      }
    } catch (e) { if (/Executable doesn|browserType.launch|Failed to launch/.test(String(e))) skipped = 'no browser could be launched (' + String(e.message).split(/\r?\n/)[0] + ')'; else throw e; }
  }
  const unfit = fit ? fit.bad.length : 'NOT MEASURED' + (skipped ? ': ' + skipped : ' (--no-browser)');
if (skipped && process.argv.includes('--require-browser')) problems.push('text-fit not measured: ' + skipped);
  console.log(`states checked: ${states}; diagrams: ${specs.length}; overlaps and problems: ${problems.length}; labels that do not fit their card: ${unfit}`);
  console.log(`reported, not failing: edge crossings ${crossings.total} in total (most in one state: ${crossings.worst}${crossings.worstName ? ' in ' + crossings.worstName : ''}); words split across lines: ${split.length}`);
  if (fit) console.log(`text measured in the browser: ${fit.states} states, ${fit.cards} cards, ${fit.texts} texts; sizes drawn: ${fit.sizes.map(([k, n]) => `${k} x${n}`).join(', ')}`);
  problems.slice(0, 40).forEach(p => console.log('  ' + p));
  if (problems.length > 40) console.log(`  ... and ${problems.length - 40} more`);
  if (process.argv.includes('--list')) split.forEach(c => console.log('  split word: ' + c));
  if (problems.length) process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
