// Data integrity check: run with `node src/validate.js`
const fs = require('fs'), path = require('path');
const { DATA } = require('./manifest.js');
const src = DATA
  .map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const RETURNS = '\nreturn {DOMAINS,TOPICS,SECTION_META,SMELLS,LOOP_PARTS,UNFAIR_CAUSES,FUN_DIMS,ROLES,FAILURES,MATRIX,LOOP_STEPS,PROMPT_TEMPLATES,CHECKLISTS,FEATURE_TREE,CONTENT_TREE,REFERENCE_GAMES,PLATFORMS,PLATFORM_STAGES,stagesOf,platformMatrix,CHOOSER,choosePath,PAGES,GAME_FAMILIES,GAME_TAGS,GAME_SHELVES,AWARDS,GAME_AWARDS,RECEPTION_VERDICTS,IMAGE_LICENCES,ENGINES,ENGINE_STAGES,GUIDE_LAYOUT,GAME_LENSES,SIGNATURE_PARTS,CASE_STUDIES,PATHS,TRACKS,LEVELS,TOOLS,DIAGNOSTICS,VIEW_LINKS,LENSES};';
const ctx = new Function(src + RETURNS)();
const { DOMAINS, TOPICS, SECTION_META, SMELLS, LOOP_PARTS, UNFAIR_CAUSES, LOOP_STEPS, CASE_STUDIES, PATHS, TRACKS, LEVELS, TOOLS, DIAGNOSTICS } = ctx;
// Content for the engine and interview tabs lands file by file. Until it is
// all in, `PLAYABLE_STRICT=0` (or --lenient) downgrades "missing eng/iv" from
// an error to a warning count. Shape errors in the data that IS there always
// fail, in both modes.
const STRICT = !(process.env.PLAYABLE_STRICT === '0' || process.argv.includes('--lenient'));
const warns = { eng: 0, iv: 0, sys: 0, few: 0, flows: 0, fewFlows: 0, projIv: 0, sysIv: 0 };
const SYSTEM_KINDS = new Set(['client', 'server', 'backend', 'data', 'infra', 'cicd', 'tooling', 'process']);
// Route words under #/experience/<cs>/... A system id claiming one would
// shadow the page that word routes to.
const RESERVED_SYSTEM_IDS = new Set(['workflows', 'interview', 'flow', 'overview']);
// One shape check for both scales of interview data. Topic and project use the
// level object, a system uses a flat array of the same items.
function checkIvItems(arr, where, errors) {
  arr.forEach((x, i) => { for (const k of ['q', 'a', 'follow', 'red']) if (!x[k] || !String(x[k]).trim()) errors.push(`${where}[${i}].${k} empty`); });
}
const VIEW_LINKS = Object.keys(ctx.VIEW_LINKS);
// Topics with a hand-drawn diagram, read from the DIAGRAMS map in 90-app.js.
// Glyph names a screen region may use, read from the renderer's GLYPH table.
const GLYPHS = [...(fs.readFileSync(path.join(__dirname, '87-diagrams.js'), 'utf8').match(/const GLYPH = \{([\s\S]*?)\n  \};/) || ['', ''])[1].matchAll(/^\s+(\w+):/gm)].map(m => m[1]);
const HAND_DRAWN = new Set([...(fs.readFileSync(path.join(__dirname, '90-app.js'), 'utf8').match(/const DIAGRAMS = \{([^}]*)\}/) || ['', ''])[1].matchAll(/'([\w-]+)':/g)].map(m => m[1]));
// Shape of a diagram spec (87-diagrams.js draws it). Layout and fit are the
// layout checker's job; this checks what the renderer needs to exist.
function checkDiagram(g, where, errors) {
  const str = v => typeof v === 'string' && v.trim().length > 0;
  const unit = v => typeof v === 'number' && v >= 0 && v <= 1;
  const count = (arr, lo, hi, name) => { if (!Array.isArray(arr) || arr.length < lo || arr.length > hi) { errors.push(`${where}: ${name} needs ${lo} to ${hi} entries`); return false; } return true; };
  const ids = (arr, name) => { const s = new Set(); arr.forEach((x, i) => { if (!str(x.id)) errors.push(`${where}: ${name}[${i}].id empty`); else if (s.has(x.id)) errors.push(`${where}: duplicate ${name} id ${x.id}`); s.add(x.id); }); return s; };
  const edges = (list, known) => (list || []).forEach(e => { if (!Array.isArray(e) || !known.has(e[0]) || !known.has(e[1])) errors.push(`${where}: edge ${JSON.stringify(e)} names an unknown node`); else if (e[2] !== undefined && !str(e[2])) errors.push(`${where}: edge ${e[0]} -> ${e[1]} has an empty label`); });
  const KINDS = ['loop', 'stack', 'matrix', 'quad', 'curve', 'economy', 'state', 'screen', 'flow'];
  if (!g || !KINDS.includes(g.kind)) return errors.push(`${where}: kind must be one of ${KINDS.join(', ')}`);
  if (!str(g.title) || g.title.length > 90) errors.push(`${where}: title must be 1 to 90 characters`);
  if (g.note !== undefined && !str(g.note)) errors.push(`${where}: note is empty`);
  switch (g.kind) {
    case 'loop': if (count(g.steps, 3, 7, 'steps')) g.steps.forEach((s, i) => { if (!str(s.t)) errors.push(`${where}: steps[${i}].t empty`); }); break;
    case 'stack': if (count(g.layers, 2, 6, 'layers')) g.layers.forEach((s, i) => { if (!str(s.t)) errors.push(`${where}: layers[${i}].t empty`); }); break;
    case 'matrix':
      if (count(g.rows, 1, 7, 'rows') && count(g.cols, 2, 3, 'cols')) {
        if (![...g.rows, ...g.cols].every(str)) errors.push(`${where}: every row and column needs a name`);
        if (!Array.isArray(g.cells) || g.cells.length !== g.rows.length || g.cells.some(r => !Array.isArray(r) || r.length !== g.cols.length || r.some(c => typeof c !== 'string'))) errors.push(`${where}: cells must be rows x cols strings`);
      } break;
    case 'quad':
      if (!str(g.x) || !str(g.y)) errors.push(`${where}: x and y axis names needed`);
      if (count(g.points, 2, 8, 'points')) g.points.forEach((p, i) => { if (!str(p.t) || !unit(p.x) || !unit(p.y)) errors.push(`${where}: points[${i}] needs t and x, y in 0..1`); });
      if (g.q !== undefined && (!Array.isArray(g.q) || g.q.length !== 4)) errors.push(`${where}: q must name the four quadrants (top left, top right, bottom left, bottom right)`);
      break;
    case 'curve':
      if (!str(g.x) || !str(g.y)) errors.push(`${where}: x and y axis names needed`);
      if (!str(g.alt)) errors.push(`${where}: a curve needs alt, a sentence saying what the shape shows`);
      if (count(g.series, 1, 2, 'series')) g.series.forEach((s, i) => { if (!str(s.t) || !Array.isArray(s.pts) || s.pts.length < 2 || s.pts.some(p => !unit(p[0]) || !unit(p[1])) || s.pts.some((p, k) => k && p[0] <= s.pts[k - 1][0])) errors.push(`${where}: series[${i}] needs t and 2+ points in 0..1 with rising x`); });
      if (g.band !== undefined && (!str(g.band.t) || !unit(g.band.from) || !unit(g.band.to) || g.band.from >= g.band.to)) errors.push(`${where}: band needs t and 0 <= from < to <= 1`);
      (g.beats || []).forEach((b, i) => { if (!str(b.t) || !unit(b.at)) errors.push(`${where}: beats[${i}] needs t and at in 0..1`); });
      break;
    case 'economy':
      if (count(g.nodes, 2, 10, 'nodes')) {
        g.nodes.forEach((n, i) => { if (!str(n.t) || !['source', 'pool', 'converter', 'sink'].includes(n.type)) errors.push(`${where}: nodes[${i}] needs t and type source, pool, converter or sink`); });
        edges(g.edges, ids(g.nodes, 'node'));
        if (!Array.isArray(g.edges) || !g.edges.length) errors.push(`${where}: an economy needs flows (edges)`);
      } break;
    case 'state':
      if (count(g.states, 2, 7, 'states')) {
        const known = ids(g.states, 'state');
        g.states.forEach((s, i) => { if (!str(s.t)) errors.push(`${where}: states[${i}].t empty`); });
        edges(g.edges, known);
        if (!known.has(g.start)) errors.push(`${where}: start must be a state id`);
      } break;
    case 'screen':
      if (!['16:9', '4:3', '9:16'].includes(g.aspect)) errors.push(`${where}: aspect must be 16:9, 4:3 or 9:16`);
      if (count(g.regions, 1, 9, 'regions')) g.regions.forEach((r, i) => { if (!str(r.t) || ![r.x, r.y, r.w, r.h].every(unit) || r.x + r.w > 1.0001 || r.y + r.h > 1.0001) errors.push(`${where}: regions[${i}] needs t and x, y, w, h in 0..1 inside the frame`); });
      (g.regions || []).forEach((r, i) => { if (r.kind !== undefined && !['hud', 'world'].includes(r.kind)) errors.push(`${where}: regions[${i}].kind must be hud or world`); if (r.g !== undefined && !GLYPHS.includes(r.g)) errors.push(`${where}: regions[${i}].g must be one of ${GLYPHS.join(', ')}`); });
      break;
    case 'flow':
      if (count(g.steps, 2, 9, 'steps')) {
        const known = ids(g.steps, 'step');
        g.steps.forEach((s, i) => { if (!str(s.t)) errors.push(`${where}: steps[${i}].t empty`); });
        edges(g.edges, known);
        // the layered layout needs an acyclic graph reachable from the first step
        const out = {}; g.steps.forEach(s => { out[s.id] = []; }); (g.edges || []).forEach(([a, b]) => { if (out[a] && known.has(b)) out[a].push(b); });
        const state = {}; let cycle = false;
        const visit = id => { if (state[id] === 2) return; if (state[id] === 1) { cycle = true; return; } state[id] = 1; out[id].forEach(visit); state[id] = 2; };
        g.steps.forEach(s => visit(s.id));
        if (cycle) errors.push(`${where}: a flow cannot have a cycle (use a loop or state diagram)`);
        const seen = new Set(), walk = id => { if (seen.has(id)) return; seen.add(id); out[id].forEach(walk); };
        walk(g.steps[0].id);
        if (seen.size !== g.steps.length) errors.push(`${where}: every step must be reachable from the first`);
      } break;
  }
}
const errors = [];
// A fact older than a year is a warning, not an error: the build must not
// break because the calendar moved, but the line tells you what to recheck.
const staleFacts = [];
// Dated facts, on topics and platform guides: a claim, the day it was checked,
// and a source that parses as https (the page reads its host with new URL()).
function checkFacts(list, where) {
  if (!Array.isArray(list) || !list.length) return errors.push(`${where}: facts present but empty`);
  list.forEach((f, i) => {
    if (!f.claim || !String(f.claim).trim()) errors.push(`${where}: facts[${i}].claim empty`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.asOf || '') || isNaN(Date.parse(f.asOf))) errors.push(`${where}: facts[${i}].asOf must be YYYY-MM-DD`);
    else if (Date.now() - Date.parse(f.asOf) > 365 * 86400000) staleFacts.push(`${where}: "${String(f.claim).slice(0, 60)}..." checked ${f.asOf}`);
    let host = '';
    try { const u = new URL(f.src); if (u.protocol === 'https:') host = u.hostname; } catch (e) {}
    if (!host) errors.push(`${where}: facts[${i}].src must be an https URL with a host`);
  });
}
for (const [name, list] of [['TOOLS', TOOLS], ['DIAGNOSTICS', DIAGNOSTICS]]) {
  const ids = list.map(x => x[0]);
  if (new Set(ids).size !== ids.length) errors.push(`${name}: duplicate id`);
  list.forEach(x => { if (x.some(v => !String(v).trim())) errors.push(`${name}: ${x[0]} has an empty field`); });
}
const domIds = new Set(DOMAINS.map(d => d.id));
const lensIds = new Set(ctx.LENSES.map(([id]) => id));
for (const d of DOMAINS) if (!lensIds.has(d.lens)) errors.push(`domain ${d.id}: lens ${d.lens} is not one of ${[...lensIds].join(', ')}`);
for (const id of lensIds) if (!DOMAINS.some(d => d.lens === id)) errors.push(`lens ${id} has no domain`);
const topics = Object.values(TOPICS);
const required = ['d','t','tag','what','why','think','how','ai','prompts','verify','test','rel'];
for (const t of topics) {
  for (const k of required) if (t[k] === undefined || (Array.isArray(t[k]) && !t[k].length)) errors.push(`${t.id}: missing ${k}`);
  if (!domIds.has(t.d)) errors.push(`${t.id}: unknown domain ${t.d}`);
  for (const k of ['q','trade','traps','good','bad']) if (!t.think[k] || !t.think[k].length) errors.push(`${t.id}: think.${k} empty`);
  if (!t.ai.yes?.length || !t.ai.no?.length) errors.push(`${t.id}: ai.yes/no empty`);
  for (const [rid] of t.rel) if (!TOPICS[rid] && !VIEW_LINKS.includes(rid)) errors.push(`${t.id}: rel -> unknown ${rid}`);
  for (const p of t.prompts) if (!p.l || !p.p) errors.push(`${t.id}: prompt missing label/text`);
  if (t.facts !== undefined) checkFacts(t.facts, t.id);
  if (t.diagram !== undefined) {
    checkDiagram(t.diagram, `${t.id}: diagram`, errors);
    if (HAND_DRAWN.has(t.id)) errors.push(`${t.id}: has both a hand-drawn diagram (DIAGRAMS in 90-app.js) and a DIAGRAM() spec`);
  }
  if (t.tech !== undefined) {
    if (!Array.isArray(t.tech) || !t.tech.length) errors.push(`${t.id}: tech present but empty`);
    else for (const x of t.tech) for (const k of ['n', 'how', 'fit', 'cost', 'alt']) if (!x[k]) errors.push(`${t.id}: tech entry missing ${k}`);
  }
  // eng: the domain says whether its topics need Godot and Unity views
  // ('required', the default), may have them ('optional'), or must not ('none').
  const engRule = (DOMAINS.find(d => d.id === t.d) || {}).eng || 'required';
  if (t.eng === undefined) { if (engRule === 'required') { if (STRICT) errors.push(`${t.id}: missing eng`); else warns.eng++; } }
  else {
    if (engRule === 'none') errors.push(`${t.id}: eng present on a ${t.d} topic, which has no engine counterpart`);
    for (const e of ['godot', 'unity']) {
      const v = t.eng[e];
      if (!v) { errors.push(`${t.id}: eng.${e} missing`); continue; }
      for (const k of ['term', 'pitfall', 'map']) if (!v[k] || !String(v[k]).trim()) errors.push(`${t.id}: eng.${e}.${k} empty`);
      if (!Array.isArray(v.api) || !v.api.length || v.api.some(a => !String(a).trim())) errors.push(`${t.id}: eng.${e}.api must be a non-empty array of non-empty strings`);
      if (!v.snippet || !String(v.snippet).trim()) errors.push(`${t.id}: eng.${e}.snippet empty`);
      else if (v.snippet.length > 900) errors.push(`${t.id}: eng.${e}.snippet is ${v.snippet.length} chars, limit 900`);
    }
  }
  // iv: every topic needs interview questions, 6 to 10 of them, all three levels used.
  if (t.iv === undefined) { if (STRICT) errors.push(`${t.id}: missing iv`); else warns.iv++; }
  else {
    let total = 0;
    for (const lvl of ['junior', 'mid', 'senior']) {
      const arr = t.iv[lvl];
      if (!Array.isArray(arr) || !arr.length) { errors.push(`${t.id}: iv.${lvl} needs at least one question`); continue; }
      total += arr.length;
      arr.forEach((x, i) => { for (const k of ['q', 'a', 'follow', 'red']) if (!x[k] || !String(x[k]).trim()) errors.push(`${t.id}: iv.${lvl}[${i}].${k} empty`); });
    }
    if (total < 6 || total > 10) errors.push(`${t.id}: iv has ${total} questions, expected 6 to 10`);
  }
}
// Reference games: every diagram has a valid shape, a screen layout names
// real topics, and store art is credited with its developer and store page.
// The analysis frame (see 14-references.js): family, tags and names on
// every game; signature, lenses and screenshots checked where written.
const FAMILY_IDS = new Set((ctx.GAME_FAMILIES || []).map(f => f[0])), TAG_IDS = new Set(ctx.GAME_TAGS || []), LENS_KEYS = (ctx.GAME_LENSES || []).map(l => l[0]);
const wordCount = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;
// An image credit: a licence from the closed list; an author and an https
// source unless it is our own schematic; share-alike images say if changed.
const LICENCE_SET = new Set(ctx.IMAGE_LICENCES || []);
function checkCredit(c, where) {
  if (!LICENCE_SET.has(c.licence)) { errors.push(`${where}: licence ${c.licence} is not one of ${[...LICENCE_SET].join(', ')}`); return; }
  if (c.licence === 'own') return;
  if (!c.author || !String(c.author).trim()) errors.push(`${where}: credit needs an author`);
  let ok = false; try { ok = new URL(c.url).protocol === 'https:'; } catch (e) {}
  if (!ok) errors.push(`${where}: credit needs an https source url`);
  if ((c.licence === 'press' || c.licence === 'capture') && !String(c.source || '').trim()) errors.push(`${where}: a ${c.licence} credit needs a source (the site it came from)`);
  if (/SA/.test(c.licence) && typeof c.changed !== 'boolean') errors.push(`${where}: a share-alike image must say whether it was changed (changed: true or false)`);
}
// The fields of a lens analysis and their minimum words (analysis-method.md).
const LENS_FIELDS = [['claim', 12], ['evidence', 30], ['mechanism', 25], ['effect', 18], ['compare', 18], ['cost', 15], ['principle', 10]];
const LENS_FIELD_NAMES = new Set([...LENS_FIELDS.map(f => f[0]), 'context', 'topics', 'sources']);
let analysedGames = 0;
function checkAnalysis(g){
  const where = `game ${g.id}`, s = g.signature;
  if (!s) errors.push(`${where}: an analysed game needs a signature`);
  else {
    for (const k of ['idea', ...ctx.SIGNATURE_PARTS.map(p => p[0])]) if (!s[k] || !String(s[k]).trim()) errors.push(`${where}: signature.${k} empty`);
    const n = ctx.SIGNATURE_PARTS.reduce((m, [k]) => m + wordCount(s[k]), 0);
    if (n < 380 || n > 700) errors.push(`${where}: signature is ${n} words, expected 400 to 650`);
    for (const [k] of ctx.SIGNATURE_PARTS) if (wordCount(s[k]) < 55) errors.push(`${where}: signature.${k} is ${wordCount(s[k])} words, expected a paragraph of 60 or more`);
  }
  // The game's own summary fields are paragraphs too, once it is analysed.
  for (const [f, min] of [['first30', 30], ['minute', 30], ['why', 60], ['complaints', 35], ['lesson', 35], ['misses', 35]]) if (wordCount(g[f]) < min) errors.push(`${where}: ${f} is ${wordCount(g[f])} words, expected ${min} or more for an analysed game`);
  const L = g.lens || {};
  for (const k of LENS_KEYS) {
    const l = L[k];
    if (!l) { errors.push(`${where}: lens ${k} missing`); continue; }
    if (l.na !== undefined) { if (wordCount(l.na) < 30) errors.push(`${where}: lens ${k} says it does not apply; argue why in 30 words or more`); continue; }
    // An analysis, not a description: every field present and substantial.
    let total = 0;
    for (const [f, min] of LENS_FIELDS) { const n = wordCount(l[f]); total += n; if (!n) errors.push(`${where}: lens ${k} needs ${f}`); else if (n < min) errors.push(`${where}: lens ${k}.${f} is ${n} words, expected ${min} or more`); }
    total += wordCount(l.context);
    if (total < 150 || total > 380) errors.push(`${where}: lens ${k} is ${total} words, expected 150 to 350`);
    for (const f of Object.keys(l)) if (!LENS_FIELD_NAMES.has(f)) errors.push(`${where}: lens ${k} has unknown field ${f}`);
    for (const t of (l.topics || [])) if (!TOPICS[t]) errors.push(`${where}: lens ${k} names unknown topic ${t}`);
    for (const u of (l.sources || [])) { let ok = false; try { ok = new URL(u).protocol === 'https:'; } catch (e) {} if (!ok) errors.push(`${where}: lens ${k} source is not an https URL: ${u}`); }
  }
  for (const k of Object.keys(L)) if (!LENS_KEYS.includes(k)) errors.push(`${where}: unknown lens ${k}`);
  (g.shots || []).forEach((sh, i) => {
    const sw = `${where}: shot ${i}`;
    if (!LENS_KEYS.includes(sh.lens) || (L[sh.lens] && L[sh.lens].na !== undefined)) errors.push(`${sw}: attached to lens ${sh.lens}, which is not a lens in use`);
    for (const f of ['img', 'alt', 'caption']) if (!sh[f] || !String(sh[f]).trim()) errors.push(`${sw}: ${f} empty`);
    const file = sh.img && path.join(__dirname, '..', sh.img);
    if (file && !fs.existsSync(file)) errors.push(`${sw}: image ${sh.img} does not exist`);
    else if (file && fs.statSync(file).size > 150 * 1024) errors.push(`${sw}: image ${sh.img} is ${Math.round(fs.statSync(file).size / 1024)} KB, limit 150 KB`);
    (sh.callouts || []).forEach((c, j) => { if (!(c.x >= 0 && c.x <= 1 && c.y >= 0 && c.y <= 1) || !c.t || !String(c.t).trim()) errors.push(`${sw}: callout ${j} needs t and x, y in 0..1`); });
    if (sh.credit) checkCredit(sh.credit, sw);
    else if (!g.dev || !g.store) errors.push(`${sw}: a screenshot needs the game's developer credit and store page`);
  });
  if ((g.shots || []).length > 4) errors.push(`${where}: ${g.shots.length} screenshots, keep it to four or fewer`);
}
for (const [id, , q] of (ctx.GAME_SHELVES || [])) if (q.tag && !TAG_IDS.has(q.tag)) errors.push(`shelf ${id}: tag ${q.tag} is not in GAME_TAGS`);
{ const awardIds = new Set((ctx.AWARDS || []).map(a => a[0])), gameIds = new Set((ctx.REFERENCE_GAMES || []).map(g => g.id));
  for (const [gid, list] of Object.entries(ctx.GAME_AWARDS || {})) {
    if (!gameIds.has(gid)) errors.push(`awards: unknown game ${gid}`);
    (list || []).forEach((a, i) => { const w = `awards ${gid}[${i}]`;
      if (!awardIds.has(a.id)) errors.push(`${w}: award ${a.id} is not one of ${[...awardIds].join(', ')}`);
      if (typeof a.year !== 'number' || a.year < 1990) errors.push(`${w}: needs the ceremony year`);
      if (!/^https:\/\/\S+$/.test(a.src || '')) errors.push(`${w}: needs an https source`); });
  } }
// Series: the entry's own shape, and membership that agrees on both sides.
const GAMES_BY_ID = new Map((ctx.REFERENCE_GAMES || []).map(g => [g.id, g]));
for (const g of (ctx.REFERENCE_GAMES || [])) {
  if (g.series !== undefined && (!g.series || !/^[a-z0-9-]+$/.test(g.series.id || '') || !String(g.series.t || '').trim() || !String(g.series.n || '').trim())) errors.push(`game ${g.id}: series needs id (kebab-case), t and n`);
  if (g.kind === 'series') {
    if (!Array.isArray(g.entries) || g.entries.length < 4 || g.entries.length > 9) errors.push(`series ${g.id}: needs 4 to 9 entries`);
    else g.entries.forEach((e, i) => {
      if (!String(e.t || '').trim() || typeof e.year !== 'number' || !String(e.platform || '').trim() || wordCount(e.added) < 8) errors.push(`series ${g.id}: entries[${i}] needs t, year, platform and what it added (8 words or more)`);
      if (e.ref !== undefined) { const r = GAMES_BY_ID.get(e.ref); if (!r) errors.push(`series ${g.id}: entries[${i}] refers to unknown game ${e.ref}`); else if (!r.series || r.series.id !== g.id) errors.push(`series ${g.id}: ${e.ref} is listed but does not carry series.id '${g.id}'`); }
      if (e.shot !== undefined) {
        const w = `series ${g.id}: entries[${i}].shot`, s = e.shot || {};
        if (!String(s.img || '').trim() || !String(s.alt || '').trim()) errors.push(`${w} needs img and alt`);
        else { const file = path.join(__dirname, '..', s.img); if (!fs.existsSync(file)) errors.push(`${w}: image ${s.img} does not exist`); else if (fs.statSync(file).size > 40 * 1024) errors.push(`${w}: image ${s.img} is over 40 KB`); }
        if (!s.credit) errors.push(`${w} needs a credit`); else checkCredit(s.credit, w);
      }
    });
    // A series shows how it evolved: a real screen for most of its entries.
    const shotCount = (g.entries || []).filter(e => e.shot).length;
    if (Array.isArray(g.entries) && shotCount < Math.max(4, Math.ceil(g.entries.length / 2))) errors.push(`series ${g.id}: ${shotCount} entries have a screenshot, expected at least ${Math.max(4, Math.ceil(g.entries.length / 2))} (a real screen per entry shows how the series evolved)`);
    for (const k of ['constant', 'changed']) if (wordCount(g[k]) < 60) errors.push(`series ${g.id}: ${k} is ${wordCount(g[k])} words, expected 60 or more`);
    // Hits and misses: the same core game, received differently, and why.
    const verdicts = (ctx.RECEPTION_VERDICTS || []).map(v => v[0]);
    if (!Array.isArray(g.reception) || g.reception.length < 3 || g.reception.length > 7) errors.push(`series ${g.id}: reception needs 3 to 7 entries (which entries landed, which did not, and why)`);
    else {
      g.reception.forEach((r, i) => {
        const w = `series ${g.id}: reception[${i}]`;
        if (!String(r.entry || '').trim() || typeof r.year !== 'number') errors.push(`${w} needs entry and year`);
        if (!verdicts.includes(r.verdict)) errors.push(`${w}: verdict must be one of ${verdicts.join(', ')}`);
        if (wordCount(r.evidence) < 25) errors.push(`${w}: evidence is ${wordCount(r.evidence)} words, expected 25 or more (scores, sales or critics’ words, with the source named)`);
        if (wordCount(r.why) < 40) errors.push(`${w}: why is ${wordCount(r.why)} words, expected 40 or more`);
        if (!Array.isArray(r.src) || !r.src.length || r.src.some(u => !/^https:\/\/\S+$/.test(u))) errors.push(`${w}: needs at least one https source`);
        if (r.ref !== undefined && !GAMES_BY_ID.get(r.ref)) errors.push(`${w} refers to unknown game ${r.ref}`);
      });
      if (!g.reception.some(r => r.verdict === 'praised') || !g.reception.some(r => r.verdict === 'mixed' || r.verdict === 'panned')) errors.push(`series ${g.id}: reception needs at least one praised entry and one mixed or poorly received entry`);
    }
    if (wordCount(g.receptionLesson) < 60) errors.push(`series ${g.id}: receptionLesson is ${wordCount(g.receptionLesson)} words, expected 60 or more`);
  }
  if (g.series && g.kind !== 'series') { const S = GAMES_BY_ID.get(g.series.id); if (S && S.kind === 'series' && !(S.entries || []).some(e => e.ref === g.id)) errors.push(`game ${g.id}: series ${g.series.id} exists but does not list it as an entry with ref`); }
}
for (const g of (ctx.REFERENCE_GAMES || [])) {
  if (!FAMILY_IDS.has(g.family)) errors.push(`game ${g.id}: family must be one of ${[...FAMILY_IDS].join(', ')}`);
  for (const t of (g.tags || [])) if (!TAG_IDS.has(t)) errors.push(`game ${g.id}: unknown tag ${t}`);
  if (!Array.isArray(g.aka)) errors.push(`game ${g.id}: aka must be an array (may be empty)`);
  if (g.signature || g.lens || g.shots) { analysedGames++; checkAnalysis(g); }
  (g.diagrams || []).forEach((d, i) => {
    checkDiagram(d, `game ${g.id}: diagram ${i}`, errors);
    for (const tid of (d.topics || [])) if (!TOPICS[tid]) errors.push(`game ${g.id}: diagram ${i} names unknown topic ${tid}`);
  });
  if (g.img && !fs.existsSync(path.join(__dirname, '..', g.img))) errors.push(`game ${g.id}: image file ${g.img} does not exist`);
  if (g.artLicence && !LICENCE_SET.has(g.artLicence)) errors.push(`game ${g.id}: art licence ${g.artLicence} is not in IMAGE_LICENCES`);
  if (g.imgCredit) { if (!g.img) errors.push(`game ${g.id}: imgCredit without img`); checkCredit(g.imgCredit, `game ${g.id}: header image`); }
  if (g.img && !g.drawn && !g.imgCredit) {
    if (!g.dev || !String(g.dev).trim()) errors.push(`game ${g.id}: store art without a developer credit`);
    let host = ''; try { const u = new URL(g.store); if (u.protocol === 'https:') host = u.hostname; } catch (e) {}
    if (!host) errors.push(`game ${g.id}: store art without an https store page`);
  }
}
// Third-party images live in one folder with a size budget, so the repo's
// history does not grow without anyone deciding it should.
const folderBytes = dir => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? folderBytes(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size), 0);
// The budget counts every image folder (games, platforms, engines), so no
// new collection escapes it. Raised to 10 MB by owner decision (2026-09-25).
const artBytes = folderBytes(path.join(__dirname, '..', 'assets'));
if (artBytes > 10 * 1024 * 1024) errors.push(`assets is ${(artBytes / 1048576).toFixed(1)} MB, budget 10 MB`);
console.log(`reference games: ${(ctx.REFERENCE_GAMES || []).length}, analysed: ${analysedGames}, assets: ${Math.round(artBytes / 1024)} KB of 10240`);
// Platform guides: every guide walks all six stages, with dated facts where
// rules change, a zero-to-live flow, and links to real topics.
const platIds = new Set();
// The parts a guide stage may carry beyond points and facts, shared by
// platform and engine guides: a numbered deploy walkthrough, credited
// images, and interview items.
function checkGuideStage(s, where) {
  if (s.deploy !== undefined) {
    if (!Array.isArray(s.deploy) || s.deploy.length < 2) errors.push(`${where}: deploy needs 2 or more steps`);
    else s.deploy.forEach((d, i) => { if (!String(d.t || '').trim() || wordCount(d.d) < 6) errors.push(`${where}: deploy[${i}] needs t and a d of 6 words or more`); if (d.shot) checkGuideShot(d.shot, `${where}: deploy[${i}].shot`); });
  }
  (s.shots || []).forEach((sh, i) => checkGuideShot(sh, `${where}: shots[${i}]`));
  if (s.iv !== undefined) { if (!Array.isArray(s.iv) || !s.iv.length) errors.push(`${where}: iv must list interview items`); else checkIvItems(s.iv, `${where}: iv`, errors); }
}
function checkGuideShot(sh, where) {
  for (const f of ['img', 'alt', 'caption']) if (!sh[f] || !String(sh[f]).trim()) errors.push(`${where}: ${f} empty`);
  if (!sh.credit) errors.push(`${where}: a guide image needs a credit with its licence`); else checkCredit(sh.credit, where);
  const file = sh.img && path.join(__dirname, '..', sh.img);
  if (file && !fs.existsSync(file)) errors.push(`${where}: image ${sh.img} does not exist`);
  else if (file && fs.statSync(file).size > 150 * 1024) errors.push(`${where}: image ${sh.img} is over 150 KB`);
  (sh.callouts || []).forEach((c, j) => { if (!(c.x >= 0 && c.x <= 1 && c.y >= 0 && c.y <= 1) || !c.t) errors.push(`${where}: callout ${j} needs t and x, y in 0..1`); });
}
for (const p of (ctx.PLATFORMS || [])) {
  const where = `platform ${p.id}`;
  if (platIds.has(p.id)) errors.push(`${where}: duplicate id`); platIds.add(p.id);
  for (const k of ['t', 'sub', 'short']) if (!p[k] || !String(p[k]).trim()) errors.push(`${where}: ${k} empty`);
  if (!['pc', 'console', 'mobile', 'open', 'ugc'].includes(p.kind)) errors.push(`${where}: kind must be pc, console, mobile, open or ugc`);
  if (p.kind !== 'ugc' && (!Array.isArray(p.glance) || p.glance.length !== 3 || p.glance.some(g => !String(g).trim()))) errors.push(`${where}: glance needs access, review gate and turnaround`);
  if (p.nda !== undefined && !String(p.nda).trim()) errors.push(`${where}: nda is empty`);
  const stageKeys = ctx.stagesOf(p).map(s => s[0]);
  for (const k of Object.keys(p.stages || {})) if (!stageKeys.includes(k)) errors.push(`${where}: stage ${k} is not a ${p.kind === 'ugc' ? 'UGC' : 'store'} stage`);
  for (const k of stageKeys) {
    const s = (p.stages || {})[k];
    if (!s) { errors.push(`${where}: stage ${k} missing`); continue; }
    if (!Array.isArray(s.points) || !s.points.length || s.points.some(x => !String(x).trim())) errors.push(`${where}: stage ${k} needs points`);
    if (s.facts !== undefined) checkFacts(s.facts, `${where}/${k}`);
    if (s.diagram !== undefined) checkDiagram(s.diagram, `${where}/${k}: diagram`, errors);
    checkGuideStage(s, `${where}/${k}`);
  }
  if (p.flow !== undefined) checkDiagram(p.flow, `${where}: flow`, errors);
  if (p.kind !== 'open' && !p.flow) errors.push(`${where}: a store or console guide needs a zero-to-live flow`);
  for (const tid of (p.topics || [])) if (!TOPICS[tid]) errors.push(`${where}: names unknown topic ${tid}`);
}
if ((ctx.PLATFORMS || []).length) checkDiagram(ctx.platformMatrix(), 'platform comparison table', errors);
if (ctx.GUIDE_LAYOUT) checkDiagram(ctx.GUIDE_LAYOUT, 'guide: layout schematic', errors);
// Engine and tool guides: all eight stages, a build-to-release flow, dated
// facts where terms change, interview items in the last stage.
const engIds = new Set();
for (const e of (ctx.ENGINES || [])) {
  const where = `engine ${e.id}`;
  if (engIds.has(e.id)) errors.push(`${where}: duplicate id`); engIds.add(e.id);
  for (const k of ['t', 'sub', 'short']) if (!e[k] || !String(e[k]).trim()) errors.push(`${where}: ${k} empty`);
  if (!['engine', 'web', 'tool'].includes(e.kind)) errors.push(`${where}: kind must be engine, web or tool`);
  if (!Array.isArray(e.glance) || e.glance.length !== 3 || e.glance.some(g => !String(g).trim())) errors.push(`${where}: glance needs licence and cost, languages, and targets`);
  const keys = (ctx.ENGINE_STAGES || []).map(s => s[0]);
  for (const k of Object.keys(e.stages || {})) if (!keys.includes(k)) errors.push(`${where}: stage ${k} is not an engine stage`);
  for (const k of keys) {
    const s = (e.stages || {})[k];
    if (!s) { errors.push(`${where}: stage ${k} missing`); continue; }
    if (k === 'interview') { if (!s.iv || s.iv.length < 4) errors.push(`${where}: the interview stage needs 4 or more iv items`); }
    else if (!Array.isArray(s.points) || s.points.length < 2 || s.points.some(x => wordCount(x) < 8)) errors.push(`${where}: stage ${k} needs 2 or more points of 8 words or more`);
    if (s.facts !== undefined) checkFacts(s.facts, `${where}/${k}`);
    if (s.diagram !== undefined) checkDiagram(s.diagram, `${where}/${k}: diagram`, errors);
    checkGuideStage(s, `${where}/${k}`);
  }
  if (!e.flow) errors.push(`${where}: needs a build-to-release flow`); else checkDiagram(e.flow, `${where}: flow`, errors);
  for (const tid of (e.topics || [])) if (!TOPICS[tid]) errors.push(`${where}: names unknown topic ${tid}`);
}
const SECTION_KEYS = new Set(SECTION_META.map(m => m[0]));
for (const d of DOMAINS) if (d.titles) for (const k of Object.keys(d.titles)) {
  if (!SECTION_KEYS.has(k)) errors.push(`domain ${d.id}: titles key "${k}" is not a section`);
  if (!d.titles[k] || !String(d.titles[k]).trim()) errors.push(`domain ${d.id}: titles.${k} empty`);
}
const caseIds = new Set();
for (const c of (CASE_STUDIES || [])) {
  const where = `case ${c.id || '(no id)'}`;
  for (const k of ['id', 't', 'code', 'sub', 'role', 'period', 'context']) if (!c[k] || !String(c[k]).trim()) errors.push(`${where}: ${k} empty`);
  if (caseIds.has(c.id)) errors.push(`${where}: duplicate id`); else caseIds.add(c.id);
  for (const k of ['stack', 'arch']) if (!Array.isArray(c[k]) || !c[k].length || c[k].some(x => !String(x).trim())) errors.push(`${where}: ${k} must be a non-empty array of non-empty strings`);
  const shapes = { decisions: ['d', 'why', 'trade'], lessons: ['what', 'lesson'], stories: ['s', 't', 'a', 'r'] };
  for (const [k, fields] of Object.entries(shapes)) {
    if (!Array.isArray(c[k]) || !c[k].length) { errors.push(`${where}: ${k} empty`); continue; }
    c[k].forEach((x, i) => fields.forEach(f => { if (!x[f] || !String(x[f]).trim()) errors.push(`${where}: ${k}[${i}].${f} empty`); }));
  }
  if (!Array.isArray(c.rel) || !c.rel.length) errors.push(`${where}: rel empty`);
  else for (const [rid, why] of c.rel) { if (!TOPICS[rid]) errors.push(`${where}: rel -> unknown topic ${rid}`); if (!why || !String(why).trim()) errors.push(`${where}: rel ${rid} has no why`); }
  // systems: the case as a browsable project. Content lands file by file, so
  // a case with no systems at all is a warning in lenient mode; anything
  // that IS there is shape-checked in both modes.
  if (c.systems === undefined) { if (STRICT) errors.push(`${where}: missing systems`); else warns.sys++; }
  else if (!Array.isArray(c.systems)) errors.push(`${where}: systems must be an array`);
  else {
    // Too few systems is incompleteness, so lenient mode counts it as a warning
    // the way a missing eng tab is. Too many is over budget for the map and
    // always fails.
    if (c.systems.length > 8) errors.push(`${where}: has ${c.systems.length} systems, expected 5 to 8`);
    else if (c.systems.length < 5) { if (STRICT) errors.push(`${where}: has ${c.systems.length} systems, expected 5 to 8`); else warns.few++; }
    const sysIds = new Set(), partIds = new Set();
    for (const s of c.systems) {
      const sw = `${where} system ${s.id || '(no id)'}`;
      for (const k of ['id', 't', 'kind', 'sum']) if (!s[k] || !String(s[k]).trim()) errors.push(`${sw}: ${k} empty`);
      if (RESERVED_SYSTEM_IDS.has(s.id)) errors.push(`${sw}: "${s.id}" is a reserved route word, pick another system id`);
      if (s.kind && !SYSTEM_KINDS.has(s.kind)) errors.push(`${sw}: unknown kind "${s.kind}", expected one of ${[...SYSTEM_KINDS].join(', ')}`);
      // iv: three "likely questions" on the system page. Lands file by file,
      // so absence is a warning in lenient mode like a missing engine tab.
      if (s.iv === undefined) { if (STRICT) errors.push(`${sw}: missing iv`); else warns.sysIv++; }
      else if (!Array.isArray(s.iv) || s.iv.length !== 3) errors.push(`${sw}: iv has ${Array.isArray(s.iv) ? s.iv.length : 'no'} questions, expected exactly 3`);
      else checkIvItems(s.iv, `${sw}: iv`, errors);
      if (!Array.isArray(s.stack) || !s.stack.length || s.stack.some(x => !String(x).trim())) errors.push(`${sw}: stack must be a non-empty array of non-empty strings`);
      if (sysIds.has(s.id)) errors.push(`${sw}: duplicate system id`); else sysIds.add(s.id);
      if (!Array.isArray(s.parts) || s.parts.length < 2 || s.parts.length > 5) { errors.push(`${sw}: has ${Array.isArray(s.parts) ? s.parts.length : 'no'} parts, expected 2 to 5`); continue; }
      for (const p of s.parts) {
        const pw = `${sw} part ${p.id || '(no id)'}`;
        for (const k of ['id', 't', 'what', 'why', 'trade']) if (!p[k] || !String(p[k]).trim()) errors.push(`${pw}: ${k} empty`);
        if (p.id && s.id && !String(p.id).startsWith(s.id + '-')) errors.push(`${pw}: part id must start with "${s.id}-"`);
        if (partIds.has(p.id)) errors.push(`${pw}: duplicate part id`); else partIds.add(p.id);
        if (!Array.isArray(p.how) || !p.how.length || p.how.some(x => !String(x).trim())) errors.push(`${pw}: how must be a non-empty array of non-empty strings`);
        if (!Array.isArray(p.rel) || !p.rel.length) errors.push(`${pw}: rel must name at least one topic`);
        else for (const [rid, why] of p.rel) { if (!TOPICS[rid]) errors.push(`${pw}: rel -> unknown topic ${rid}`); if (!why || !String(why).trim()) errors.push(`${pw}: rel ${rid} has no why`); }
        if (p.story !== undefined && !String(p.story).trim()) errors.push(`${pw}: story present but empty`);
      }
    }
    // links resolve only after every part id in the project is known.
    for (const s of c.systems) for (const p of (Array.isArray(s.parts) ? s.parts : [])) {
      if (p.links === undefined) continue;
      if (!Array.isArray(p.links)) { errors.push(`${where} part ${p.id}: links must be an array`); continue; }
      for (const [pid, why] of p.links) {
        if (!partIds.has(pid)) errors.push(`${where} part ${p.id}: links -> unknown part ${pid} in this project`);
        if (pid === p.id) errors.push(`${where} part ${p.id}: links to itself`);
        if (!why || !String(why).trim()) errors.push(`${where} part ${p.id}: links ${pid} has no why`);
      }
    }
  }
  // flows: the workflow charts. Like systems, content lands file by file, so
  // absence is a warning in lenient mode and a shape error in both modes.
  const knownSys = new Set((Array.isArray(c.systems) ? c.systems : []).map(s => s.id));
  if (c.flows === undefined) { if (STRICT) errors.push(`${where}: missing flows`); else warns.flows++; }
  else if (!Array.isArray(c.flows)) errors.push(`${where}: flows must be an array`);
  else {
    if (c.flows.length > 4) errors.push(`${where}: has ${c.flows.length} flows, expected 2 to 4`);
    else if (c.flows.length < 2) { if (STRICT) errors.push(`${where}: has ${c.flows.length} flows, expected 2 to 4`); else warns.fewFlows++; }
    const flowIds = new Set();
    for (const f of c.flows) {
      const fw = `${where} flow ${f.id || '(no id)'}`;
      for (const k of ['id', 't', 'sum']) if (!f[k] || !String(f[k]).trim()) errors.push(`${fw}: ${k} empty`);
      if (flowIds.has(f.id)) errors.push(`${fw}: duplicate flow id`); else flowIds.add(f.id);
      if (!Array.isArray(f.steps) || f.steps.length < 4 || f.steps.length > 9) { errors.push(`${fw}: has ${Array.isArray(f.steps) ? f.steps.length : 'no'} steps, expected 4 to 9`); continue; }
      const stepIds = new Set();
      for (const s of f.steps) {
        const sw = `${fw} step ${s.id || '(no id)'}`;
        for (const k of ['id', 't', 'd']) if (!s[k] || !String(s[k]).trim()) errors.push(`${sw}: ${k} empty`);
        if (stepIds.has(s.id)) errors.push(`${sw}: duplicate step id`); else stepIds.add(s.id);
        if (s.sys !== undefined && !knownSys.has(s.sys)) errors.push(`${sw}: sys -> unknown system ${s.sys} in this project`);
      }
      if (!Array.isArray(f.edges) || !f.edges.length) { errors.push(`${fw}: edges must be a non-empty array`); continue; }
      const out = {};
      f.steps.forEach(s => { out[s.id] = []; });
      let edgesOk = true;
      for (const e of f.edges) {
        if (!Array.isArray(e) || e.length < 2) { errors.push(`${fw}: an edge must be [from, to] or [from, to, label]`); edgesOk = false; continue; }
        const [a, b, label] = e;
        if (!stepIds.has(a)) { errors.push(`${fw}: edge from unknown step ${a}`); edgesOk = false; continue; }
        if (!stepIds.has(b)) { errors.push(`${fw}: edge to unknown step ${b}`); edgesOk = false; continue; }
        if (a === b) { errors.push(`${fw}: step ${a} has an edge to itself`); edgesOk = false; continue; }
        if (label !== undefined && !String(label).trim()) errors.push(`${fw}: edge ${a} -> ${b} has an empty label`);
        out[a].push(b);
      }
      if (!edgesOk) continue;
      // acyclic: a depth-first walk that meets a node already on the stack
      // has found a cycle, which the layered layout cannot draw.
      const state = {};
      let cycle = null;
      const visit = id => {
        if (state[id] === 2) return;
        if (state[id] === 1) { cycle = id; return; }
        state[id] = 1;
        out[id].forEach(visit);
        state[id] = 2;
      };
      f.steps.forEach(s => visit(s.id));
      if (cycle) errors.push(`${fw}: edges form a cycle through step ${cycle}`);
      // reachability from the first step, which is where the layout starts.
      const seenSteps = new Set();
      const walk = id => { if (seenSteps.has(id)) return; seenSteps.add(id); out[id].forEach(walk); };
      walk(f.steps[0].id);
      const stranded = f.steps.filter(s => !seenSteps.has(s.id)).map(s => s.id);
      if (stranded.length) errors.push(`${fw}: steps not reachable from ${f.steps[0].id}: ${stranded.join(', ')}`);
    }
  }
  // iv: the project-level interview, 10 to 12 questions, at least 2 per level.
  if (c.iv === undefined) { if (STRICT) errors.push(`${where}: missing iv`); else warns.projIv++; }
  else {
    let total = 0;
    for (const lvl of ['junior', 'mid', 'senior']) {
      const arr = c.iv[lvl];
      if (!Array.isArray(arr) || arr.length < 2) { errors.push(`${where}: iv.${lvl} needs at least two questions`); continue; }
      total += arr.length;
      checkIvItems(arr, `${where}: iv.${lvl}`, errors);
    }
    if (total < 10 || total > 12) errors.push(`${where}: iv has ${total} questions, expected 10 to 12`);
  }
}
// ---- learning paths ----
const TOOL_IDS = new Set(TOOLS.map(([id]) => id));
const CHECKLIST_IDS = new Set((ctx.CHECKLISTS || []).map(c => c.id));
const DIAGNOSTIC_IDS = new Set(DIAGNOSTICS.map(([id]) => id));
const PROMPT_IDS = new Set((ctx.PROMPT_TEMPLATES || []).map(p => p.id));
const LEVEL_IDS = new Set((LEVELS || []).map(l => l[0]));
const TRACK_IDS = new Set((TRACKS || []).map(t => t[0]));
const TOPIC_TAB_KEYS = new Set(['overview', 'godot', 'unity', 'interview']);
const partKey = (cs, sys, part) => `${cs}/${sys}/${part}`;
const validPartKeys = new Set();
const validFlowKeys = new Set();
for (const c of (CASE_STUDIES || [])) {
  for (const s of (c.systems || [])) for (const p of (s.parts || [])) validPartKeys.add(partKey(c.id, s.id, p.id));
  for (const f of (c.flows || [])) validFlowKeys.add(`${c.id}/${f.id}`);
}
const pathIds = new Set((PATHS || []).map(p => p.id));
let pathStepCount = 0, recallNoAnswer = 0;
for (const pth of (PATHS || [])) {
  const where = `path ${pth.id || '(no id)'}`;
  for (const k of ['t', 'tag', 'track', 'level', 'audience', 'outcome', 'pick']) if (!pth[k] || !String(pth[k]).trim()) errors.push(`${where}: ${k} empty`);
  if (pth.pick && pth.pick.length >= 60) errors.push(`${where}: pick is ${pth.pick.length} characters, expected under 60`);
  if (pth.track && !TRACK_IDS.has(pth.track)) errors.push(`${where}: unknown track ${pth.track}`);
  if (pth.level && !LEVEL_IDS.has(pth.level)) errors.push(`${where}: unknown level ${pth.level}`);
  if (typeof pth.hours !== 'number' || pth.hours <= 0) errors.push(`${where}: hours must be a positive number`);
  for (const k of ['prereq', 'next']) {
    if (!Array.isArray(pth[k])) { errors.push(`${where}: ${k} must be an array (may be empty)`); continue; }
    for (const id of pth[k]) if (!pathIds.has(id)) errors.push(`${where}: ${k} -> unknown path ${id}`);
  }
  if (!Array.isArray(pth.stages) || pth.stages.length < 4 || pth.stages.length > 6) { errors.push(`${where}: has ${Array.isArray(pth.stages) ? pth.stages.length : 'no'} stages, expected 4 to 6`); continue; }
  const stageIds = new Set();
  let hoursSum = 0, prevLevelIdx = -1, levelDrop = false;
  pth.stages.forEach((st, si) => {
    const sw = `${where} stage ${st.id || '(no id)'}`;
    for (const k of ['id', 't', 'goal', 'level']) if (!st[k] || !String(st[k]).trim()) errors.push(`${sw}: ${k} empty`);
    if (st.id) { if (stageIds.has(st.id)) errors.push(`${sw}: duplicate stage id`); else stageIds.add(st.id); }
    if (st.level && !LEVEL_IDS.has(st.level)) errors.push(`${sw}: unknown level ${st.level}`);
    if (typeof st.hours !== 'number' || st.hours <= 0) errors.push(`${sw}: hours must be a positive number`);
    if (st.level) { const idx = [...LEVEL_IDS].indexOf(st.level); const order = (LEVELS || []).map(l => l[0]); const oi = order.indexOf(st.level); if (oi < prevLevelIdx) levelDrop = true; prevLevelIdx = Math.max(prevLevelIdx, oi); }
    if (!Array.isArray(st.steps) || st.steps.length < 3 || st.steps.length > 8) { errors.push(`${sw}: has ${Array.isArray(st.steps) ? st.steps.length : 'no'} steps, expected 3 to 8`); return; }
    let minSum = 0, hasToolOrChecklist = false, runDomain = null, runLen = 0;
    st.steps.forEach((step, i) => {
      pathStepCount++;
      const stw = `${sw} step ${i} (${step.kind || 'no kind'})`;
      if (!step.why || !String(step.why).trim()) errors.push(`${stw}: why empty`);
      if (!step.do || !String(step.do).trim()) errors.push(`${stw}: do empty`);
      if (typeof step.min !== 'number' || step.min < 10 || step.min > 60) errors.push(`${stw}: min must be 10-60`);
      else minSum += step.min;
      if (step.kind === 'tool' || step.kind === 'checklist') hasToolOrChecklist = true;
      switch (step.kind) {
        case 'topic': {
          const t = TOPICS[step.ref];
          if (!t) errors.push(`${stw}: ref -> unknown topic ${step.ref}`);
          if (step.tab !== undefined && !TOPIC_TAB_KEYS.has(step.tab)) errors.push(`${stw}: tab "${step.tab}" is not overview/godot/unity/interview`);
          if (t && (step.tab === 'godot' || step.tab === 'unity') && !t.eng?.[step.tab]) errors.push(`${stw}: tab "${step.tab}" but topic ${step.ref} has no eng.${step.tab}`);
          if (t && step.tab === 'interview' && !t.iv) errors.push(`${stw}: tab "interview" but topic ${step.ref} has no iv`);
          if (t) { if (t.d === runDomain) runLen++; else { runDomain = t.d; runLen = 1; } if (runLen > 4) errors.push(`${sw}: more than 4 consecutive topic steps from domain ${runDomain}`); }
          break;
        }
        case 'tool': if (!TOOL_IDS.has(step.ref)) errors.push(`${stw}: ref -> unknown tool ${step.ref}`); runDomain = null; runLen = 0; break;
        case 'checklist': if (!CHECKLIST_IDS.has(step.ref)) errors.push(`${stw}: ref -> unknown checklist ${step.ref}`); runDomain = null; runLen = 0; break;
        case 'smell': if (!SMELLS.some(s => s.id === step.ref)) errors.push(`${stw}: ref -> unknown smell ${step.ref}`); runDomain = null; runLen = 0; break;
        case 'diagnostic': if (!DIAGNOSTIC_IDS.has(step.ref)) errors.push(`${stw}: ref -> unknown diagnostic ${step.ref}`); runDomain = null; runLen = 0; break;
        case 'prompt': if (!PROMPT_IDS.has(step.ref)) errors.push(`${stw}: ref -> unknown prompt ${step.ref}`); runDomain = null; runLen = 0; break;
        case 'part': if (!validPartKeys.has(step.ref)) errors.push(`${stw}: ref -> unknown part ${step.ref}`); runDomain = null; runLen = 0; break;
        case 'flow': if (!validFlowKeys.has(step.ref)) errors.push(`${stw}: ref -> unknown flow ${step.ref}`); runDomain = null; runLen = 0; break;
        case 'platform': if (!(ctx.PLATFORMS || []).some(p => p.id === step.ref)) errors.push(`${stw}: ref -> unknown platform ${step.ref}`); runDomain = null; runLen = 0; break;
        case 'engine': if (!(ctx.ENGINES || []).some(e => e.id === step.ref)) errors.push(`${stw}: ref -> unknown engine guide ${step.ref}`); runDomain = null; runLen = 0; break;
        case 'game': if (!(ctx.REFERENCE_GAMES || []).some(g => g.id === step.ref)) errors.push(`${stw}: ref -> unknown reference game ${step.ref}`); runDomain = null; runLen = 0; break;
        case 'reflect': if (step.ref !== undefined) errors.push(`${stw}: reflect steps take no ref`); runDomain = null; runLen = 0; break;
        default: errors.push(`${stw}: unknown kind ${step.kind}`);
      }
    });
    if (!hasToolOrChecklist) errors.push(`${sw}: needs at least one tool or checklist step`);
    const target = st.hours * 60;
    if (target > 0 && Math.abs(minSum - target) / target > 0.1) errors.push(`${sw}: step minutes sum to ${minSum}, expected close to ${target} (hours*60, within 10%)`);
    if (Array.isArray(st.review)) { if (st.review.length > 2) errors.push(`${sw}: review names ${st.review.length} topics, expected 0 to 2`); for (const rid of st.review) if (!TOPICS[rid]) errors.push(`${sw}: review -> unknown topic ${rid}`); } else errors.push(`${sw}: review must be an array (may be empty)`);
    if (!st.check) errors.push(`${sw}: missing check`);
    else {
      const { recall, build, skip } = st.check;
      if (!Array.isArray(recall) || recall.length < 2 || recall.length > 4) errors.push(`${sw}: check.recall has ${Array.isArray(recall) ? recall.length : 'no'} questions, expected 2 to 4`);
      else recall.forEach((x, i) => {
        const q = typeof x === 'string' ? x : x && x.q;
        if (!q || !String(q).trim()) errors.push(`${sw}: check.recall[${i}] empty`);
        if (typeof x === 'string') recallNoAnswer++;
        else if (!x.a || !String(x.a).trim()) errors.push(`${sw}: check.recall[${i}] has an empty answer outline`);
        else if (x.a.length > 420) errors.push(`${sw}: check.recall[${i}] answer outline is ${x.a.length} characters, expected an outline under 420`);
      });
      if (!build || !String(build).trim()) errors.push(`${sw}: check.build empty`);
      if (!Array.isArray(skip) || skip.length < 3 || skip.length > 5) errors.push(`${sw}: check.skip has ${Array.isArray(skip) ? skip.length : 'no'} questions, expected 3 to 5`);
      else skip.forEach((q, i) => { if (!q || !String(q).trim()) errors.push(`${sw}: check.skip[${i}] empty`); });
    }
    hoursSum += (typeof st.hours === 'number' ? st.hours : 0);
  });
  if (levelDrop) errors.push(`${where}: stage levels must be non-decreasing`);
  if (typeof pth.hours === 'number' && hoursSum > 0 && Math.abs(hoursSum - pth.hours) / pth.hours > 0.1) errors.push(`${where}: stage hours sum to ${hoursSum}, path declares ${pth.hours} (expected within 10%)`);
}
// A prerequisite points forward to the path that needs it: every path named
// in a prereq lists this path in its own next.
for (const pth of (PATHS || [])) for (const id of (pth.prereq || [])) {
  const pre = (PATHS || []).find(p => p.id === id);
  if (pre && !(pre.next || []).includes(pth.id)) errors.push(`path ${pth.id}: prereq ${id} does not list ${pth.id} in its next`);
}
// Every page in PAGES is a route the app's router handles.
const ROUTER_VIEWS = new Set([...((fs.readFileSync(path.join(__dirname, '90-app.js'), 'utf8').match(/function render\(view, parts\)\{([\s\S]*?)\n\}/) || ['', ''])[1].matchAll(/case '([\w-]+)'/g))].map(m => m[1]));
for (const [href, t] of (ctx.PAGES || [])) { const v = href.replace(/^#\//, '').split('/')[0]; if (!ROUTER_VIEWS.has(v)) errors.push(`page ${t}: route ${href} is not handled by the router`); }
if (!ROUTER_VIEWS.size) errors.push('pages: could not read the router cases from 90-app.js');
// ...and every view in the header navigation has a page, so search and All pages list it.
const NAV_VIEWS = [...((fs.readFileSync(path.join(__dirname, '90-app.js'), 'utf8').match(/const NAV = \[([\s\S]*?)\n\];/) || ['', ''])[1].matchAll(/\['([\w-]+)','/g))].map(m => m[1]);
const PAGE_VIEWS = new Set((ctx.PAGES || []).map(([href]) => href.replace(/^#\//, '').split('/')[0]));
for (const v of NAV_VIEWS) if (!PAGE_VIEWS.has(v)) errors.push(`navigation view ${v} has no entry in PAGES`);
if (!NAV_VIEWS.length) errors.push('pages: could not read NAV from 90-app.js');
// The door's chooser must suggest a real path for every combination of answers.
let chooserCombos = 0;
if (ctx.CHOOSER) for (const [g] of ctx.CHOOSER.goals) for (const [l] of ctx.CHOOSER.levels) for (const [t] of ctx.CHOOSER.times) {
  chooserCombos++;
  const r = ctx.choosePath(g, l, t);
  if (!r) errors.push(`chooser: no path for ${g} / ${l} / ${t}`);
}
for (const [g, byLevel] of Object.entries(ctx.CHOOSER ? ctx.CHOOSER.paths : {})) for (const ids of Object.values(byLevel)) for (const id of ids) if (!pathIds.has(id)) errors.push(`chooser: ${g} names unknown path ${id}`);
if (recallNoAnswer) errors.push(`paths: ${recallNoAnswer} checkpoint recall questions have no answer outline`);
console.log(`paths: ${(PATHS || []).length}, chooser combinations: ${chooserCombos}, stages: ${(PATHS || []).reduce((n, p) => n + (Array.isArray(p.stages) ? p.stages.length : 0), 0)}, steps: ${pathStepCount}`);

for (const d of DOMAINS) for (const [to] of d.links) if (!domIds.has(to)) errors.push(`domain ${d.id}: link -> unknown ${to}`);
for (const s of SMELLS) { for (const c of s.causes) if (!TOPICS[c.top]) errors.push(`smell ${s.id}: cause -> unknown topic ${c.top}`); for (const d of s.dom) if (!domIds.has(d)) errors.push(`smell ${s.id}: unknown domain ${d}`); if (s.fun && !s.dims?.length) errors.push(`smell ${s.id}: fun without dims`); }
for (const p of LOOP_PARTS) for (const t of p.top) if (!TOPICS[t]) errors.push(`loop part ${p.id}: unknown topic ${t}`);
for (const u of UNFAIR_CAUSES) if (!TOPICS[u.top]) errors.push(`unfair ${u.id}: unknown topic ${u.top}`);
for (const s of LOOP_STEPS) for (const t of s.top) if (!TOPICS[t] && !VIEW_LINKS.includes(t)) errors.push(`loop step ${s.n}: unknown topic ${t}`);
// inbound link coverage: every topic should be linked from at least one other place
const inbound = new Set();
topics.forEach(t => t.rel.forEach(([rid]) => inbound.add(rid)));
SMELLS.forEach(s => s.causes.forEach(c => inbound.add(c.top)));
LOOP_PARTS.forEach(p => p.top.forEach(t => inbound.add(t)));
LOOP_STEPS.forEach(s => s.top.forEach(t => inbound.add(t)));
const orphans = topics.filter(t => !inbound.has(t.id)).map(t => t.id);
const factCount = topics.reduce((n, t) => n + (t.facts || []).length, 0);
const platFacts = (ctx.PLATFORMS || []).reduce((n, p) => n + Object.values(p.stages || {}).reduce((m, s) => m + (s.facts || []).length, 0), 0);
console.log(`dated facts: ${factCount} on ${topics.filter(t => t.facts).length} topics, ${platFacts} in ${(ctx.PLATFORMS || []).length} platform guides; older than a year: ${staleFacts.length}`);
staleFacts.forEach(s => console.log('  recheck: ' + s));
console.log(`domains: ${DOMAINS.length}, topics: ${topics.length}, smells: ${SMELLS.length}, roles: ${ctx.ROLES.length}, failures: ${ctx.FAILURES.length}, prompts: ${ctx.PROMPT_TEMPLATES.length}, checklists: ${ctx.CHECKLISTS.length}`);
console.log('topics per domain:', DOMAINS.map(d => `${d.id}=${topics.filter(t => t.d === d.id).length}`).join(' '));
const sysCases = (CASE_STUDIES || []).filter(c => Array.isArray(c.systems));
const partCount = sysCases.reduce((n, c) => n + c.systems.reduce((m, s) => m + (Array.isArray(s.parts) ? s.parts.length : 0), 0), 0);
console.log(`case studies: ${(CASE_STUDIES || []).length}, engine views: ${topics.filter(t => t.eng).length}, interview views: ${topics.filter(t => t.iv).length}`);
console.log(`projects with systems: ${sysCases.length}, systems: ${sysCases.reduce((n, c) => n + c.systems.length, 0)}, parts: ${partCount}`);
if (orphans.length) console.log('WARN topics with no inbound links:', orphans.join(', '));
const flowCount = (CASE_STUDIES || []).reduce((n, c) => n + (Array.isArray(c.flows) ? c.flows.length : 0), 0);
console.log(`workflows: ${flowCount}, projects with an interview: ${(CASE_STUDIES || []).filter(c => c.iv).length}, systems with likely questions: ${sysCases.reduce((n, c) => n + c.systems.filter(s => s.iv).length, 0)}`);
if (!STRICT) console.log(`WARN lenient mode: ${warns.eng} topics missing eng, ${warns.iv} topics missing iv, ${warns.sys} case studies with no systems, ${warns.few} with fewer than 5`);
if (!STRICT) console.log(`WARN lenient mode: ${warns.flows} case studies with no flows, ${warns.fewFlows} with fewer than 2, ${warns.projIv} with no project interview, ${warns.sysIv} systems with no likely questions`);
if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
console.log('OK: all cross-links resolve, all topics complete.');
