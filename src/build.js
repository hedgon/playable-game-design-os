// Build: concatenate sources into playable.html, then validate the data, the
// map layout and the bundled JS syntax.
// Usage: node src/build.js
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const { ORDER } = require('./manifest.js');
const root = path.join(__dirname, '..');
const out = ORDER.map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
fs.writeFileSync(path.join(root, 'playable.html'), out);
console.log(`playable.html: ${(out.length/1024).toFixed(0)} KB`);
// env is forwarded so PLAYABLE_STRICT=0 reaches the validator through the build.
execSync(`node "${path.join(__dirname, 'validate.js')}"`, { stdio: 'inherit', env: process.env });
execSync(`node "${path.join(__dirname, 'check-layout.js')}"`, { stdio: 'inherit' });
const match = out.match(/<script>([\s\S]*)<\/script>/);
const js = match ? match[1] : '';
fs.writeFileSync(path.join(__dirname, '_bundle-check.js'), js);
try { execSync(`node --check "${path.join(__dirname, '_bundle-check.js')}"`, { stdio: 'inherit' }); console.log('JS syntax OK'); }
finally { fs.unlinkSync(path.join(__dirname, '_bundle-check.js')); }
