// Build: compile the data into the page's light index and the content files,
// write playable.html, then validate the data, the map layout, colour contrast
// and the bundled JS syntax.
// Usage: node src/build.js
const fs = require('fs'), path = require('path'), vm = require('vm'), zlib = require('zlib'), { execSync } = require('child_process');
const { HEAD, DATA, SHARED, CONTENT, DIAGRAM, FLOW, GRAPH, APP, PAGE } = require('./manifest.js');
const { compile } = require('./content-build.js');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
// content/ is emptied and written again, so a renamed or removed entity leaves no file behind
const c = compile({ srcDir: __dirname, dataFiles: DATA, sharedFile: SHARED, outDir: path.join(root, 'content'), pageCode: PAGE.map(read).join('\n') });
// The page scripts ship without their whole-line comments (a sixth of their
// gzipped size); the sources keep them. A line goes only when it is a comment
// from its first character to its last, so code and strings stay as written.
const strip = s => s.replace(/^[ \t]*\/\*(?:(?!\*\/)[^])*\*\/[ \t]*\r?\n/gm, '').replace(/^[ \t]*\/\/.*\r?\n/gm, '');
// the head's stylesheet ships without its comments too
const head = read(HEAD).replace(/<style>[^]*?<\/style>/, css => css.replace(/\/\*(?:(?!\*\/)[^])*\*\//g, ''));
// Each part is its own <script> element, so the browser runs them as separate tasks
// instead of one long one; top-level declarations are still shared between them.
const out = [head + '\n' + c.script, ...PAGE.map(f => strip(read(f)))].join('\n</script>\n<script>\n');
fs.writeFileSync(path.join(root, 'playable.html'), out);
const gz = zlib.gzipSync(out).length;
console.log(`playable.html: ${(out.length / 1024).toFixed(0)} KB (${(gz / 1024).toFixed(0)} KB gzipped); content/: ${c.files} files, ${(c.contentBytes / 1024).toFixed(0)} KB, search index ${(c.searchBytes / 1024).toFixed(0)} KB; build ${c.build}; data the page never reads, left out: ${c.dropped.join(', ')}`);
// The page loads on every visit and has a budget; content loads per page and
// never does (owner, 2026-10-05: no cap cuts content).
const SHELL_BUDGET_KB = 300;
if (gz / 1024 > SHELL_BUDGET_KB) { console.error(`playable.html is ${(gz / 1024).toFixed(0)} KB gzipped, over the ${SHELL_BUDGET_KB} KB budget: move a field read only on its own page into content (LIGHT in src/content-build.js)`); process.exit(1); }
// env is forwarded so PLAYABLE_STRICT=0 reaches the validator through the build.
execSync(`node "${path.join(__dirname, 'validate.js')}"`, { stdio: 'inherit', env: process.env });
execSync(`node "${path.join(__dirname, 'check-layout.js')}"`, { stdio: 'inherit' });
execSync(`node "${path.join(__dirname, 'check-contrast.js')}"`, { stdio: 'inherit' });
const blocks = [...out.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const expected = (head.match(/<script>/g) || []).length + PAGE.length;
if (blocks.length !== expected) throw new Error(`build: ${blocks.length} <script> blocks in the bundle, expected ${expected}`);
// Compiles without running; a SyntaxError names the block and its line.
blocks.forEach((b, i) => new vm.Script(b, { filename: `playable.html <script> ${i + 1}` }));
// Every script file must also parse on its own, so a file can be linted and
// type-checked alone and no file leans on another's open brackets.
for (const f of [...DATA, SHARED, CONTENT, DIAGRAM, FLOW, GRAPH, ...APP]) new vm.Script(fs.readFileSync(path.join(__dirname, f), 'utf8'), { filename: f });
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
// A width the scripts test with matchMedia must also be a stylesheet
// breakpoint: the script decides which pane a route shows, the CSS decides
// where the drawers are, and between two different widths they disagree.
const css = fs.readFileSync(path.join(__dirname, HEAD), 'utf8');
const jsWidths = [...appSrc.matchAll(/matchMedia\('\(max-width:\s*(\d+)px\)'\)/g)].map(m => +m[1]);
const cssWidths = new Set([...css.matchAll(/@media \(max-width:\s*(\d+)px\)/g)].map(m => +m[1]));
const unpaired = jsWidths.filter(w => !cssWidths.has(w));
if (!jsWidths.length) { console.error('breakpoints: no matchMedia width found in the app files'); process.exit(1); }
if (unpaired.length) { console.error('matchMedia widths with no CSS breakpoint: ' + unpaired.join(', ') + ' px'); process.exit(1); }
console.log(`breakpoints: ${jsWidths.join(' and ')} px match the stylesheet`);
