// Layout QA for the maps: render every state (each domain open, each topic
// selected, every project and path state) and report overlapping node cards.
// Fails the build (exit 1) when any overlap is found, so content cannot
// silently ship a collision. Labels the renderer had to shorten are listed
// but do not fail the build. The checker itself lives in layout-core.js so a
// synthetic dataset can be exercised too.
const fs = require('fs'), path = require('path');
const { DATA, FLOW, GRAPH } = require('./manifest.js');
const { overlaps } = require('./layout-core.js');
const src = [...DATA, FLOW, GRAPH].map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const window = {};
const ctx = new Function('window', src + '\nreturn {DOMAINS,TOPICS,CASE_STUDIES,PATHS};')(window);
const G = window.PlayableGraph;
const { states, problems, clipped } = overlaps(G, ctx.DOMAINS, ctx.TOPICS, ctx.CASE_STUDIES, window.PlayableFlow, ctx.PATHS);
console.log(`states checked: ${states}; overlaps: ${problems.length}; shortened labels: ${clipped.length}`);
problems.slice(0, 40).forEach(p => console.log('  ' + p));
clipped.slice(0, 20).forEach(c => console.log('  shortened: ' + c));
if (problems.length) process.exit(1);
