// Layout QA for the brain map: render every state (each domain open, each topic
// selected) and report label-vs-label and label-vs-node overlaps. Fails the
// build (exit 1) when any overlap is found, so content cannot silently ship a
// collision. The checker itself lives in layout-core.js so a synthetic large
// dataset can be exercised too.
const fs = require('fs'), path = require('path');
const { DATA, GRAPH } = require('./manifest.js');
const { overlaps } = require('./layout-core.js');
const src = [...DATA, GRAPH].map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const window = {};
const ctx = new Function('window', src + '\nreturn {DOMAINS,TOPICS,CASE_STUDIES};')(window);
const G = window.PlayableGraph;
const { states, problems } = overlaps(G, ctx.DOMAINS, ctx.TOPICS, ctx.CASE_STUDIES);
console.log(`states checked: ${states}; overlaps: ${problems.length}`);
problems.slice(0, 40).forEach(p => console.log('  ' + p));
if (problems.length) process.exit(1);
