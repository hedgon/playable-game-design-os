// Layout QA for the brain map: render every state (each domain open, each topic
// selected) and report label-vs-label and label-vs-node overlaps. Fails the
// build (exit 1) when any overlap is found, so content cannot silently ship a
// collision. The checker itself lives in layout-core.js so a synthetic large
// dataset can be exercised too.
const fs = require('fs'), path = require('path');
const { DATA, FLOW, GRAPH, APP } = require('./manifest.js');
const { overlaps } = require('./layout-core.js');
const src = [...DATA, FLOW, GRAPH].map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const window = {};
// TOOLS is set by the app file as `window.TOOLS` (see 90-app.js), not a data
// file, because it is UI copy; a path's 'tool' step still needs a real title
// for its map node here, so it is extracted the same way validate.js and
// inventory.js do and fed onto this sandbox's own stand-in `window`.
const appSrc = fs.readFileSync(path.join(__dirname, APP[0]), 'utf8');
const toolsMatch = appSrc.match(/(?:const TOOLS|window\.TOOLS) = (\[[\s\S]*?\n\]);/);
window.TOOLS = toolsMatch ? new Function('return ' + toolsMatch[1])() : [];
const ctx = new Function('window', src + '\nreturn {DOMAINS,TOPICS,CASE_STUDIES,PATHS};')(window);
const G = window.PlayableGraph;
const { states, problems } = overlaps(G, ctx.DOMAINS, ctx.TOPICS, ctx.CASE_STUDIES, window.PlayableFlow, ctx.PATHS);
console.log(`states checked: ${states}; overlaps: ${problems.length}`);
problems.slice(0, 40).forEach(p => console.log('  ' + p));
if (problems.length) process.exit(1);
