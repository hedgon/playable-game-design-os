// Build-time content compiler: turns the evaluated data into the page's data
// script (every binding the data files declare, with each entity reduced to its
// light fields) and one content file per entity holding the rest, plus the
// search index. Used by build.js; see docs/program-2026-10/research/split-architecture.md.
//
// LIGHT says, per kind, which fields stay in the page: `true` keeps the field
// whole, an object recurses into it, `[spec]` maps every item of an array, and
// `'present'` keeps an empty placeholder of the same type ({} or []) when the
// field is set, so code that only asks "does it have one?" still works. Every
// other field is heavy and goes to content/<kind>/<id>.js. The build checks that
// light merged with heavy gives back exactly the original, so nothing is lost.
const fs = require('fs'), path = require('path'), crypto = require('crypto');

const LIGHT = {
  topic: { id: true, d: true, t: true, tag: true, rel: 'ids', iv: 'present' },
  game: {
    id: true, t: true, kind: true, family: true, tags: true, aka: true, genre: true, year: true, img: true, card: true, cardPos: true,
    dev: true, want: true,
    entries: [{ year: true }],
    diagrams: [{ kind: true, topics: true }],
    signature: { idea: true },
    lens: { '*': { topics: true, na: 'present' } }
  },
  path: {
    id: true, t: true, tag: true, track: true, level: true, hours: true, pick: true, prereq: true, prereqAny: true, next: true, audience: true,
    stages: [{ id: true, t: true, level: true, hours: true, steps: [{ kind: true, ref: true, tab: true, alt: true, lens: true, min: true }] }]
  },
  case: {
    id: true, t: true, code: true, sub: true, role: true, period: true, stack: true, rel: true, context: true,
    systems: [{ id: true, t: true, kind: true, parts: [{ id: true, t: true, rel: true, links: true }] }],
    flows: [{ id: true, t: true }]
  },
  platform: { id: true, t: true, sub: true, short: true, kind: true, glance: true, topics: true, checklists: true },
  engine: { id: true, t: true, sub: true, short: true, kind: true, glance: true, topics: true },
  compare: { id: true, t: true, games: true, problem: true, topics: true },
  smell: { id: true, dom: true, t: true, sym: true, fun: true, dims: true, causes: [{ top: true }] },
  checklist: { id: true, t: true, desc: true, topics: true, platforms: true },
  prompt: { id: true, t: true, cat: true, topics: true }
};
const STORES = { topic: 'TOPICS', game: 'REFERENCE_GAMES', path: 'PATHS', case: 'CASE_STUDIES', platform: 'PLATFORMS', engine: 'ENGINES', compare: 'COMPARISONS', smell: 'SMELLS', checklist: 'CHECKLISTS', prompt: 'PROMPT_TEMPLATES' };

const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const empty = v => v === undefined || (isObj(v) && !Object.keys(v).length) || (Array.isArray(v) && v.every(x => x === null));
// [light, heavy] for one value under one spec; heavy is undefined when nothing is left over.
// 'ids' is a list of [id, reason] pairs: the page keeps the ids, the file the reasons.
function split(v, spec) {
  if (spec === true) return [v, undefined];
  if (spec === 'ids') return Array.isArray(v) ? [v.map(x => [x[0]]), v.map(x => [null, ...x.slice(1)])] : [v, undefined];
  if (spec === 'present') return [Array.isArray(v) ? [] : isObj(v) ? {} : v, Array.isArray(v) || isObj(v) ? v : undefined];
  if (Array.isArray(spec)) {
    if (!Array.isArray(v)) return [v, undefined];
    const pairs = v.map(x => split(x, spec[0]));
    const heavy = pairs.map(p => p[1] === undefined ? null : p[1]);
    return [pairs.map(p => p[0]), heavy.every(x => x === null) ? undefined : heavy];
  }
  if (!isObj(v)) return [v, undefined];
  const light = {}, heavy = {};
  for (const [k, x] of Object.entries(v)) {
    const s = spec[k] !== undefined ? spec[k] : spec['*'];
    if (s === undefined) { heavy[k] = x; continue; }
    const [l, h] = split(x, s);
    if (l !== undefined) light[k] = l;
    if (h !== undefined && !empty(h)) heavy[k] = h;
  }
  return [light, Object.keys(heavy).length ? heavy : undefined];
}
// The same merge the page's loader does (src/86-content.js), to prove the split is
// lossless: objects and arrays merge key by key; null in the long part means "nothing here".
function merge(dst, src) {
  for (const [k, v] of Object.entries(src)) {
    const d = dst[k];
    if (v && typeof v === 'object' && d && typeof d === 'object') merge(d, v);
    else if (v !== null) dst[k] = v;
  }
  return dst;
}
// Equal as data: key order does not matter (a merge appends the long fields after the light ones).
const canon = v => Array.isArray(v) ? v.map(canon) : isObj(v) ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v;
const sameJSON = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
// JSON that is safe inside an inline <script>: no "</script>", no line separators.
const LS = new RegExp('[\u2028\u2029]', 'g');
const js = v => JSON.stringify(v).replace(/<\/(script)/gi, '<\\/$1').replace(LS, c => '\\u' + c.charCodeAt(0).toString(16));
const hash = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);

// Every top-level binding the data files declare, in order, with the keyword it
// was declared with. Lines inside code snippets look like declarations too; the
// evaluation below keeps only the names that really exist.
function declarations(srcDir, files) {
  const out = [], seen = new Set();
  for (const f of files) for (const m of fs.readFileSync(path.join(srcDir, f), 'utf8').matchAll(/^(const|let|var|function)\s+([A-Za-z_$][\w$]*)/gm))
    if (!seen.has(m[2])) { seen.add(m[2]); out.push({ name: m[2], kw: m[1] }); }
  return out;
}

function compile({ srcDir, dataFiles, sharedFile, outDir, pageCode }) {
  const decl = declarations(srcDir, dataFiles);
  const src = dataFiles.map(f => fs.readFileSync(path.join(srcDir, f), 'utf8')).join('\n') + '\n' + fs.readFileSync(path.join(srcDir, sharedFile), 'utf8');
  const probe = decl.map(d => `${JSON.stringify(d.name)}: typeof ${d.name} === "undefined" ? undefined : ${d.name}`).join(',');
  const ctx = new Function(src + '\nreturn { __search: searchIndexData(), __cited: citedSourcesData(), ' + probe + ' };')();
  // Only what the page can reach: names its scripts mention, and what the data's own
  // functions mention in turn (registration helpers and build-only tables stay out).
  const all = decl.filter(d => ctx[d.name] !== undefined), byName = new Map(all.map(d => [d.name, d]));
  const words = s => new Set(s.match(/[A-Za-z_$][\w$]*/g) || []);
  const reach = new Set(), todo = [...words(pageCode)].filter(n => byName.has(n));
  while (todo.length) { const n = todo.pop(); if (reach.has(n)) continue; reach.add(n); const v = ctx[n]; if (typeof v === 'function') for (const w of words(v.toString())) if (byName.has(w) && !reach.has(w)) todo.push(w); }
  const real = all.filter(d => reach.has(d.name));

  // split every entity
  const files = {}, contents = [];
  const lightStores = {};
  for (const [kind, store] of Object.entries(STORES)) {
    const all = ctx[store], list = Array.isArray(all) ? all : Object.values(all);
    const lightList = [];
    for (const e of list) {
      const [light, heavy] = split(e, LIGHT[kind]);
      if (!sameJSON(merge(JSON.parse(JSON.stringify(light)), JSON.parse(JSON.stringify(heavy || {}))), e))
        throw new Error(`content: splitting ${kind} ${e.id} loses data`);
      lightList.push(light);
      // a topic's file also carries the reasons other topics give for linking to it,
      // which the map shows on the selected topic's leaves (89-graph.js neighbours)
      const extra = kind === 'topic' ? { relIn: list.filter(x => x.id !== e.id).flatMap(x => (x.rel || []).filter(r => r[0] === e.id).map(r => [x.id, r[1]])) } : null;
      if (heavy || extra) contents.push({ kind, id: e.id, heavy: Object.assign({}, heavy, extra) });
    }
    lightStores[store] = Array.isArray(all) ? lightList : Object.fromEntries(lightList.map(l => [l.id, l]));
  }

  // the content files, named by kind and id, versioned by their own hash
  const BUILD = hash(JSON.stringify(lightStores) + contents.map(c => JSON.stringify(c.heavy)).join(''));
  fs.rmSync(outDir, { recursive: true, force: true });
  const write = (kind, id, data) => {
    const body = `PlayableContent.put(${js(kind)},${js(id)},${js(data)},${js(BUILD)});\n`;
    const dir = path.join(outDir, kind); fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, id + '.js'), body);
    (files[kind] = files[kind] || {})[id] = hash(body);
    return body.length;
  };
  let bytes = 0;
  for (const c of contents) bytes += write(c.kind, c.id, c.heavy);
  // search: the head (titles, synonyms, snippets) answers at once; the bodies follow
  const searchBytes = write('file', 'search', ctx.__search.head) + write('file', 'search-body', ctx.__search.body);
  write('file', 'cited', ctx.__cited);

  // the page's data script: every real binding, entities reduced to their light part
  const lines = [`window.PLAYABLE_BUILD = ${js(BUILD)};`, `window.PLAYABLE_FILES = ${js(files)};`];
  for (const d of real) {
    const v = ctx[d.name];
    if (typeof v === 'function') {
      const s = v.toString();
      lines.push(d.kw === 'function' && /^function\b/.test(s) ? s : `const ${d.name} = ${s};`);
    } else if (v instanceof Set) lines.push(`const ${d.name} = new Set(${js([...v])});`);
    else if (v instanceof Map || v instanceof RegExp) throw new Error(`content: ${d.name} is a ${v.constructor.name}; add it to content-build.js`);
    else {
      // a large value is parsed with JSON.parse, which V8 reads faster than the same object literal
      const text = js(lightStores[d.name] !== undefined ? lightStores[d.name] : v);
      lines.push(`const ${d.name} = ${text.length > 10000 ? `JSON.parse(${JSON.stringify(text)})` : text};`);
    }
  }
  return { script: lines.join('\n'), build: BUILD, files: contents.length + 3, contentBytes: bytes, searchBytes, dropped: all.filter(d => !reach.has(d.name)).map(d => d.name) };
}

module.exports = { compile, split, merge, LIGHT, STORES };
