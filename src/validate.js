// Data integrity check: run with `node src/validate.js`
const fs = require('fs'), path = require('path');
const { DATA } = require('./manifest.js');
const src = DATA
  .map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const RETURNS = '\nreturn {DOMAINS,TOPICS,SECTION_META,SMELLS,LOOP_PARTS,UNFAIR_CAUSES,FUN_DIMS,ROLES,FAILURES,MATRIX,LOOP_STEPS,PROMPT_TEMPLATES,CHECKLISTS,FEATURE_TREE,CONTENT_TREE,CASE_STUDIES,PATHS,TRACKS,LEVELS,TOOLS,DIAGNOSTICS,VIEW_LINKS,LENSES};';
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
const errors = [];
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
  if (t.tech !== undefined) {
    if (!Array.isArray(t.tech) || !t.tech.length) errors.push(`${t.id}: tech present but empty`);
    else for (const x of t.tech) for (const k of ['n', 'how', 'fit', 'cost', 'alt']) if (!x[k]) errors.push(`${t.id}: tech entry missing ${k}`);
  }
  // eng: every topic outside the two people domains needs a Godot and a Unity view.
  const needsEng = t.d !== 'management' && t.d !== 'leadership';
  if (t.eng === undefined) { if (needsEng) { if (STRICT) errors.push(`${t.id}: missing eng`); else warns.eng++; } }
  else {
    if (!needsEng) errors.push(`${t.id}: eng present on a ${t.d} topic, which has no engine counterpart`);
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
let pathStepCount = 0;
for (const pth of (PATHS || [])) {
  const where = `path ${pth.id || '(no id)'}`;
  for (const k of ['t', 'tag', 'track', 'level', 'audience', 'outcome']) if (!pth[k] || !String(pth[k]).trim()) errors.push(`${where}: ${k} empty`);
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
      else recall.forEach((q, i) => { if (!q || !String(q).trim()) errors.push(`${sw}: check.recall[${i}] empty`); });
      if (!build || !String(build).trim()) errors.push(`${sw}: check.build empty`);
      if (!Array.isArray(skip) || skip.length < 3 || skip.length > 5) errors.push(`${sw}: check.skip has ${Array.isArray(skip) ? skip.length : 'no'} questions, expected 3 to 5`);
      else skip.forEach((q, i) => { if (!q || !String(q).trim()) errors.push(`${sw}: check.skip[${i}] empty`); });
    }
    hoursSum += (typeof st.hours === 'number' ? st.hours : 0);
  });
  if (levelDrop) errors.push(`${where}: stage levels must be non-decreasing`);
  if (typeof pth.hours === 'number' && hoursSum > 0 && Math.abs(hoursSum - pth.hours) / pth.hours > 0.1) errors.push(`${where}: stage hours sum to ${hoursSum}, path declares ${pth.hours} (expected within 10%)`);
}
console.log(`paths: ${(PATHS || []).length}, stages: ${(PATHS || []).reduce((n, p) => n + (Array.isArray(p.stages) ? p.stages.length : 0), 0)}, steps: ${pathStepCount}`);

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
