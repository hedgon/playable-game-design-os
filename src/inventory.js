// Reference inventory: every id a learning-path step can point to, printed by
// kind, so a content author writing a PATH() in 50-paths.js or 51-paths-engineering.js can
// pick a real ref instead of guessing one. Loads the DATA files the same way
// validate.js does (a bare `new Function` over the concatenated source: the
// data files declare plain consts with no browser dependency).
// Usage: node src/inventory.js
const fs = require('fs'), path = require('path');
const { DATA } = require('./manifest.js');
const src = DATA.map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const RETURNS = '\nreturn {DOMAINS,TOPICS,SMELLS,CHECKLISTS,PROMPT_TEMPLATES,CASE_STUDIES,TOOLS,DIAGNOSTICS,PLATFORMS};';
const ctx = new Function(src + RETURNS)();
const { TOPICS, SMELLS, CHECKLISTS, PROMPT_TEMPLATES, CASE_STUDIES, TOOLS, PLATFORMS } = ctx;
const DIAGNOSTICS = ctx.DIAGNOSTICS.map(([id]) => id);

function section(title) { console.log('\n=== ' + title + ' ==='); }

section('topics (id  domain  title)');
Object.values(TOPICS).sort((a, b) => a.id.localeCompare(b.id)).forEach(t => console.log(`${t.id}\t${t.d}\t${t.t}`));

section("tools (id  title) -> kind:'tool'");
TOOLS.forEach(([id, t]) => console.log(`${id}\t${t}`));

section("checklists (id  title) -> kind:'checklist'");
CHECKLISTS.forEach(c => console.log(`${c.id}\t${c.t}`));

section("smells (id  title) -> kind:'smell'");
SMELLS.forEach(s => console.log(`${s.id}\t${s.t}`));

section("diagnostics (id) -> kind:'diagnostic'");
DIAGNOSTICS.forEach(id => console.log(id));

section("prompts (id  title) -> kind:'prompt'");
PROMPT_TEMPLATES.forEach(p => console.log(`${p.id}\t${p.t}`));

section("platform guides (id  title) -> kind:'platform'");
PLATFORMS.forEach(p => console.log(`${p.id}\t${p.t}`));

section("project parts (cs/sys/part  title) -> kind:'part', ref:'cs/sys/part'");
(CASE_STUDIES || []).forEach(c => (c.systems || []).forEach(s => (s.parts || []).forEach(p =>
  console.log(`${c.id}/${s.id}/${p.id}\t${p.t}`))));

section("flows (cs/flow  title) -> kind:'flow', ref:'cs/flow'");
(CASE_STUDIES || []).forEach(c => (c.flows || []).forEach(f =>
  console.log(`${c.id}/${f.id}\t${f.t}`)));

console.log(`\n${Object.keys(TOPICS).length} topics, ${TOOLS.length} tools, ${CHECKLISTS.length} checklists, ${SMELLS.length} smells, ${DIAGNOSTICS.length} diagnostics, ${PROMPT_TEMPLATES.length} prompts, ${PLATFORMS.length} platform guides.`);
