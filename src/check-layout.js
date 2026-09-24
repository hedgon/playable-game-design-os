// Layout QA for the maps: render every state (each domain open, each topic
// selected, every project and path state) and report overlapping node cards.
// Fails the build (exit 1) when any overlap is found, so content cannot
// silently ship a collision. Labels the renderer had to shorten are counted
// (listed with --list) but do not fail the build. The checker itself lives in
// layout-core.js so a synthetic dataset can be exercised too.
const fs = require('fs'), path = require('path');
const { DATA, DIAGRAM, FLOW, GRAPH } = require('./manifest.js');
const { overlaps, diagramProblems } = require('./layout-core.js');
const src = [...DATA, DIAGRAM, FLOW, GRAPH].map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const window = {};
const ctx = new Function('window', src + '\nreturn {DOMAINS,TOPICS,CASE_STUDIES,PATHS,REFERENCE_GAMES,contentTreeFlow,PLATFORMS,platformMatrix,stagesOf};')(window);
const G = window.PlayableGraph;
const { states, problems, clipped } = overlaps(G, ctx.DOMAINS, ctx.TOPICS, ctx.CASE_STUDIES, window.PlayableFlow, ctx.PATHS, ctx.REFERENCE_GAMES);
// Diagrams: every spec on a topic or a reference game, laid out as the app
// draws it. A shortened text is a failure here, not a count: diagram labels
// are short by design, so a cut one means the data needs rewording.
const specs = [];
Object.values(ctx.TOPICS).forEach(t => { if (t.diagram) specs.push(['topic:' + t.id, t.diagram]); });
specs.push(['diagnose:content-tree', ctx.contentTreeFlow()]);
(ctx.PLATFORMS || []).forEach(p => { if (p.flow) specs.push(['platform:' + p.id, p.flow]); ctx.stagesOf(p).forEach(([k]) => { const d = p.stages[k] && p.stages[k].diagram; if (d) specs.push(['platform:' + p.id + '/' + k, d]); }); });
if ((ctx.PLATFORMS || []).length) specs.push(['platforms:table', ctx.platformMatrix()]);
(ctx.REFERENCE_GAMES || []).forEach(g => (g.diagrams || []).forEach((d, i) => specs.push([`game:${g.id}/${i}`, d])));
problems.push(...diagramProblems(window.PlayableDiagram, window.PlayableFlow, specs));
console.log(`states checked: ${states}; diagrams: ${specs.length}; overlaps: ${problems.length}; shortened labels: ${clipped.length}`);
problems.slice(0, 40).forEach(p => console.log('  ' + p));
if (process.argv.includes('--list')) clipped.forEach(c => console.log('  shortened: ' + c));
if (problems.length) process.exit(1);
