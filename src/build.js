// Build: concatenate sources into playable.html, then validate the data, the
// map layout and the bundled JS syntax.
// Usage: node src/build.js
const fs = require('fs'), path = require('path'), vm = require('vm'), { execSync } = require('child_process');
const { ORDER, DATA, FLOW, GRAPH, APP } = require('./manifest.js');
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
// Every script file must also parse on its own, so a file can be linted and
// type-checked alone and no file leans on another's open brackets.
for (const f of [...DATA, FLOW, GRAPH, ...APP]) new vm.Script(fs.readFileSync(path.join(__dirname, f), 'utf8'), { filename: f });
console.log('JS syntax OK (bundle and each file)');
// Markup names its click behaviour with data-action; each name needs a
// handler in ACTIONS, or the button silently does nothing.
const appSrc = APP.map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const used = new Set([...appSrc.matchAll(/data-action="([\w-]+)"/g)].map(m => m[1]));
const defined = new Set([...appSrc.matchAll(/ACTIONS(?:\.(\w+)|\['([\w-]+)'\])\s*=/g)].map(m => m[1] || m[2]));
const missing = [...used].filter(a => !defined.has(a)), unused = [...defined].filter(a => !used.has(a));
if (unused.length) console.log('actions defined but never used: ' + unused.join(', '));
if (missing.length) { console.error('data-action with no handler: ' + missing.join(', ')); process.exit(1); }
console.log(`actions: ${used.size}, all handled`);
