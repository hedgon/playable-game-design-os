// Build: concatenate sources into playable.html, then validate the data, the
// map layout and the bundled JS syntax.
// Usage: node src/build.js
const fs = require('fs'), path = require('path'), vm = require('vm'), { execSync } = require('child_process');
const { ORDER } = require('./manifest.js');
const root = path.join(__dirname, '..');
const out = ORDER.map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
fs.writeFileSync(path.join(root, 'playable.html'), out);
console.log(`playable.html: ${(out.length/1024).toFixed(0)} KB`);
// env is forwarded so PLAYABLE_STRICT=0 reaches the validator through the build.
execSync(`node "${path.join(__dirname, 'validate.js')}"`, { stdio: 'inherit', env: process.env });
execSync(`node "${path.join(__dirname, 'check-layout.js')}"`, { stdio: 'inherit' });
const match = out.match(/<script>([\s\S]*)<\/script>/);
if (!match) throw new Error('build: no <script> block in the bundle');
// Compiles without running; a SyntaxError names the bundle line.
new vm.Script(match[1], { filename: 'playable.html <script>' });
console.log('JS syntax OK');
