// Reusable map layout QA. Given a map renderer (PlayableGraph) and a dataset,
// render every state (overview, each domain open, each topic selected, every
// project and path state) and report any two node cards that overlap. The
// renderer returns its placed nodes (x = left edge, y = vertical centre, w,
// h), so the check reads that geometry directly instead of parsing the SVG.
// Labels cannot escape their card: the renderer wraps a label onto a second
// line and makes the card taller, shortening only what two lines cannot
// hold, so a card-vs-card test covers label collisions too. Labels that were
// still shortened are counted and reported (from the renderer's own lines),
// because a clipped name is lost information even when nothing overlaps.
// Kept separate from check-layout.js so a synthetic dataset can be
// exercised without the real data files.
const fits = n => !n.label || (n.lines || [n.label]).join(' ') === n.label;

function cardOverlaps(nodes, name, problems) {
  const r = nodes.map(n => ({ id: n.kind === 'center' ? 'center' : n.id, x: n.x, y: n.y - n.h / 2, w: n.w, h: n.h }));
  for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) {
    const a = r[i], b = r[j];
    if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) problems.push(`${name}: node "${a.id}" overlaps node "${b.id}"`);
  }
}

// `F` is the flow renderer (PlayableFlow), optional. When given, every flow's
// cards are laid out and box-tested against each other: the chart is
// deterministic, so a collision found here is a collision in the browser.
// The direction has to be the one the app renders, because the two
// directions have different card sizes and gaps.
const FLOW_DIR = 'v';
function flowOverlaps(F, CASE_STUDIES, problems) {
  let states = 0;
  for (const c of (CASE_STUDIES || [])) for (const f of (c.flows || [])) {
    states++;
    const name = `flow:${c.id}/${f.id}`;
    const g = F.layout(f, FLOW_DIR);
    const nodes = g.nodes;
    // a card outside the viewBox would be clipped rather than merely ugly.
    for (const n of nodes) if (n.x < 0 || n.y < 0 || n.x + n.w > g.w + 1e-6 || n.y + n.h > g.h + 1e-6) problems.push(`${name}: card "${n.id}" falls outside the chart box`);
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) problems.push(`${name}: card "${a.id}" overlaps card "${b.id}"`);
    }
  }
  return states;
}

// Returns { states, problems, clipped }. A problem is a human-readable string;
// `clipped` lists the labels the renderer had to shorten, once each.
// CASE_STUDIES is optional; when given, every project map state is rendered
// too (project overview, each system open, each part selected) and the
// "seen in practice" leaves are fed into the domain states, so the checker
// sees the same fourth layer the app draws.
function overlaps(G, DOMAINS, TOPICS, CASE_STUDIES, F, PATHS) {
  DOMAINS.forEach(d => d.topics = Object.values(TOPICS).filter(t => t.d === d.id).map(t => t.id));
  const seen = new Set();
  const pl = G.practiceLinks ? G.practiceLinks(CASE_STUDIES || []) : { views: {}, extra: {} };
  let states = 0; const problems = []; const clipped = new Map();
  const scan = (g, name) => {
    states++;
    cardOverlaps(g.nodes, name, problems);
    for (const n of g.nodes) if (!fits(n)) clipped.set(n.kind + ':' + n.label, name);
  };
  // Every state is checked in both layouts: two-sided (wide screens) and
  // one-sided (phones).
  for (const oneSided of [false, true]) {
    const tag = oneSided ? '1side ' : '';
    const check = (state, name) => scan(G.build(Object.assign({ oneSided }, state), seen, pl.views), tag + name);
    for (const lens of new Set(DOMAINS.map(d => d.lens))) check({ dom: null, topic: null, lens }, `overview:${lens}`);
    for (const d of DOMAINS) {
      check({ dom: d.id, topic: null, lens: d.lens }, `open:${d.id}`);
      for (const t of d.topics) check({ dom: d.id, topic: t, lens: d.lens, extra: pl.extra[t] || [] }, `sel:${t}`);
    }
    for (const c of (CASE_STUDIES || [])) {
      if (!c.systems || !c.systems.length) continue;
      const proj = (sys, part, name) => scan(G.buildProject(c, { sys, part, oneSided }, TOPICS, DOMAINS), tag + name);
      proj(null, null, `proj:${c.id}`);
      for (const s of c.systems) {
        proj(s.id, null, `proj:${c.id}/${s.id}`);
        for (const p of (s.parts || [])) proj(s.id, p.id, `proj:${c.id}/${s.id}/${p.id}`);
      }
      // the Workflows branch is a node on the same map, so its open state and
      // every flow selected under it are states the map has to survive too.
      if ((c.flows || []).length) {
        proj('workflows', null, `proj:${c.id}/workflows`);
        for (const f of c.flows) proj('workflows', f.id, `proj:${c.id}/workflows/${f.id}`);
      }
    }
    // path states: a path's overview (no stage open) and every stage opened.
    // An empty progress record is enough: node width does not depend on
    // which steps a reader has ticked, only on the label text.
    for (const pth of (PATHS || [])) {
      if (!pth.stages || !pth.stages.length) continue;
      scan(G.buildPath(pth, { stage: null, oneSided }, { steps: {}, stages: {} }), `${tag}path:${pth.id}`);
      for (const st of pth.stages) scan(G.buildPath(pth, { stage: st.id, oneSided }, { steps: {}, stages: {} }), `${tag}path:${pth.id}/${st.id}`);
    }
  }
  if (F) states += flowOverlaps(F, CASE_STUDIES, problems);
  return { states, problems, clipped: [...clipped.keys()] };
}
// Diagrams (87-diagrams.js). Each spec is laid out exactly as the app draws
// it. A problem is two boxes (cards, labels, points, regions) that touch, a
// box outside the canvas, a text the renderer had to shorten, or a canvas
// wider than a phone shows at a readable scale. Flow-kind specs get the same
// card test as the project workflows.
function diagramProblems(D, F, specs) {
  const problems = [];
  const clash = (bs, name) => {
    for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
      const a = bs[i], b = bs[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) problems.push(`${name}: ${a.id} overlaps ${b.id}`);
    }
  };
  for (const [name, spec] of specs) {
    const g = spec.kind === 'flow' ? F.layout(spec, FLOW_DIR) : D.layout(spec);
    if (g.w > D.MAX_W) problems.push(`${name}: canvas is ${Math.round(g.w)} wide, limit ${D.MAX_W}`);
    const boxes = spec.kind === 'flow' ? g.nodes.map(n => ({ id: 'step ' + n.id, x: n.x, y: n.y, w: n.w, h: n.h })) : g.boxes;
    for (const t of (g.cut || [])) problems.push(`${name}: text does not fit: "${t}"`);
    for (const b of boxes) if (b.x < -0.5 || b.y < -0.5 || b.x + b.w > g.w + 0.5 || b.y + b.h > g.h + 0.5) problems.push(`${name}: ${b.id} falls outside the canvas`);
    clash(boxes, name);
  }
  return problems;
}
module.exports = { overlaps, flowOverlaps, cardOverlaps, diagramProblems };
