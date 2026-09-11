// Build: concatenate sources into playable.html, strip legacy code, run the validator.
// Usage: node src/build.js
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const root = path.join(__dirname, '..');
const order = ['01-head.html','10-data-domains.js','11-data-topics-systems.js','12-data-topics-ux.js','13-data-topics-product-ai.js','14-data-diagnostics.js','15-data-ai.js','16-data-references.js','89-graph.js','90-app.js','91-map.js','92-ideas.js','99-tail.js'];
let out = order.map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
// Remove the superseded first-generation map renderer (kept in source for reference until the graph settles).
const start = out.indexOf('function renderMapLegacy(){');
if (start >= 0) {
  const end = out.indexOf('/* =====================================================================\n   MAP — the knowledge graph', start);
  if (end > start) out = out.slice(0, start) + out.slice(end);
}
fs.writeFileSync(path.join(root, 'playable.html'), out);
console.log(`playable.html: ${(out.length/1024).toFixed(0)} KB`);
execSync(`node "${path.join(__dirname, 'validate.js')}"`, { stdio: 'inherit' });
// syntax check of the bundled script
const js = out.split('\n<script>\n')[1].split('\n</script>')[0];
fs.writeFileSync(path.join(__dirname, '_bundle-check.js'), js);
try { execSync(`node --check "${path.join(__dirname, '_bundle-check.js')}"`, { stdio: 'inherit' }); console.log('JS syntax OK'); }
finally { fs.unlinkSync(path.join(__dirname, '_bundle-check.js')); }
