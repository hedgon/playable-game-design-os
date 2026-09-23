// Contrast QA: every text colour token against the surfaces it sits on, in
// both themes, plus the mind-map labels on every domain's card tint. The
// tokens, tint percentages and label colours are read from 01-head.html, so
// a palette change is checked without editing this file. WCAG AA for normal
// text is 4.5:1; the build fails below it.
// Usage: node src/check-contrast.js [--all]   (--all prints every pair)
const fs = require('fs'), path = require('path');
const css = fs.readFileSync(path.join(__dirname, '01-head.html'), 'utf8');
const MIN = 4.5;

// The last rule with a selector is the one in force (the sheet keeps some
// older rules that later ones of equal specificity override).
const rule = sel => {
  const i = css.lastIndexOf(sel + '{');
  if (i < 0) throw new Error('check-contrast: rule not found: ' + sel);
  return css.slice(i + sel.length + 1, css.indexOf('}', i));
};
const tokensOf = body => Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map(m => [m[1], m[2]]));
const themes = { dark: tokensOf(rule(':root')) };
themes.light = Object.assign({}, themes.dark, tokensOf(rule('html[data-theme="light"]')));

const rgb = h => h.slice(1).match(/../g).map(x => parseInt(x, 16));
const lum = c => { const v = c.map(x => x / 255).map(x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// color-mix(in srgb, A p%, B): a straight per-channel mix of the encoded values
const mix = (a, b, p) => a.map((v, i) => Math.round(v * p + b[i] * (1 - p)));

// "fill:color-mix(in srgb,var(--X[,...]) P%,var(--Y))" -> { tint: X or null (domain colour), pct, base }
const tintOf = sel => {
  const m = rule(sel).match(/fill:color-mix\(in srgb,var\(--([\w-]+)(?:,var\(--[\w-]+\))?\) (\d+)%,var\(--([\w-]+)\)\)/);
  if (!m) throw new Error('check-contrast: no color-mix fill in ' + sel);
  return { tint: m[1] === 'dc' ? null : m[1], pct: +m[2] / 100, base: m[3] };
};
const fillOf = sel => { const m = rule(sel).match(/fill:var\(--([\w-]+)\)/); if (!m) throw new Error('check-contrast: no fill in ' + sel); return m[1]; };

const MAP = {
  label: fillOf('.kgraph .node .lbl'),
  sub: fillOf('.kgraph .node .lbl.sub'),
  subOpen: fillOf('.kgraph .node.domain.open .lbl.sub'),
  leafLabel: fillOf('.kgraph .node.leaf .lbl'),
  domain: tintOf('.kgraph .node.domain .disc'),
  domainOpen: tintOf('.kgraph .node.domain.open .disc'),
  topic: tintOf('.kgraph .node.topic .disc'),
  leaf: tintOf('.kgraph .node.leaf .disc'),
  smell: tintOf('.kgraph .node.smell .disc'),
  view: tintOf('.kgraph .node.view .disc')
};

const pairs = [];
for (const [theme, T] of Object.entries(themes)) {
  const col = n => { if (!T[n]) throw new Error(`check-contrast: --${n} missing in ${theme}`); return rgb(T[n]); };
  for (const fg of ['fg', 'fg2', 'fg3']) for (const bg of ['bg', 'bg2', 'bg3', 'panel']) pairs.push([theme, `--${fg} on --${bg}`, col(fg), col(bg)]);
  for (const fg of ['accent', 'accent2', 'ok', 'warn', 'bad']) for (const bg of ['bg', 'bg2', 'panel']) pairs.push([theme, `--${fg} on --${bg}`, col(fg), col(bg)]);
  const domains = Object.keys(T).filter(k => k.startsWith('d-'));
  // A domain colour written in a form tokensOf skips would silently drop its
  // pairs from the count, so every declared --d-* token has to parse.
  const declared = new Set([...rule(':root').matchAll(/--(d-[\w-]+):/g)].map(m => m[1]));
  if (!domains.length || domains.length !== declared.size) throw new Error(`check-contrast: ${declared.size} --d-* tokens declared in ${theme}, ${domains.length} read as #rrggbb`);
  const card = (t, dc) => mix(t.tint ? col(t.tint) : col(dc), col(t.base), t.pct);
  for (const d of domains) {
    pairs.push([theme, `map label on ${d} card`, col(MAP.label), card(MAP.domain, d)]);
    pairs.push([theme, `map label on open ${d} card`, col(MAP.label), card(MAP.domainOpen, d)]);
    pairs.push([theme, `map sub-label on ${d} card`, col(MAP.sub), card(MAP.domain, d)]);
    pairs.push([theme, `map sub-label on open ${d} card`, col(MAP.subOpen), card(MAP.domainOpen, d)]);
    pairs.push([theme, `map topic label on ${d} card`, col(MAP.label), card(MAP.topic, d)]);
    pairs.push([theme, `map leaf label on ${d} card`, col(MAP.leafLabel), card(MAP.leaf, d)]);
  }
  pairs.push([theme, 'map leaf label on smell card', col(MAP.leafLabel), card(MAP.smell)]);
  pairs.push([theme, 'map leaf label on view card', col(MAP.leafLabel), card(MAP.view)]);
}
const results = pairs.map(([theme, name, a, b]) => ({ theme, name, r: ratio(a, b) }));
const failed = results.filter(x => x.r < MIN);
const worst = results.reduce((m, x) => x.r < m.r ? x : m);
if (process.argv.includes('--all')) results.forEach(x => console.log(`${x.r.toFixed(2).padStart(6)}  ${x.theme.padEnd(5)} ${x.name}`));
console.log(`contrast pairs: ${results.length}; below ${MIN}:1: ${failed.length}; lowest ${worst.r.toFixed(2)} (${worst.theme}, ${worst.name})`);
failed.slice(0, 40).forEach(x => console.log(`  ${x.r.toFixed(2)}  ${x.theme}  ${x.name}`));
if (failed.length) process.exit(1);
