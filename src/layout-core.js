// Reusable map layout QA. Given a map renderer (PlayableGraph) and a dataset,
// render every state (overview, each domain open, each topic selected, every
// project and path state) and report any two node cards that overlap. The
// renderer returns its placed nodes (x = left edge, y = vertical centre, w,
// h), so the check reads that geometry directly instead of parsing the SVG.
// Labels cannot escape their card: the renderer shortens a label to the
// card's inner width with the same per-character estimate used here, so a
// card-vs-card test covers label collisions too. Labels that had to be
// shortened are counted and reported, because a clipped name is still lost
// information even when nothing overlaps. Kept separate from check-layout.js
// so a synthetic dataset can be exercised without the real data files.

// Must match the renderer's font sizes and per-character estimate
// (89-graph.js, `mark` and `maxFor`): 26 px of padding, 0.56 em per char.
const FONT = { center: 15, domain: 14, topic: 13, leaf: 12, smell: 12, view: 12 };
const fits = n => !n.label || n.label.length <= Math.max(4, Math.floor((n.w - 26) / ((FONT[n.kind] || 12) * 0.56)));

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
  const check = (state, name) => scan(G.build(state, seen, pl.views), name);
  check({ dom: null, topic: null }, 'overview');
  for (const d of DOMAINS) {
    check({ dom: d.id, topic: null }, `open:${d.id}`);
    for (const t of d.topics) check({ dom: d.id, topic: t, extra: pl.extra[t] || [] }, `sel:${t}`);
  }
  for (const c of (CASE_STUDIES || [])) {
    if (!c.systems || !c.systems.length) continue;
    scan(G.buildProject(c, { sys: null, part: null }, TOPICS, DOMAINS), `proj:${c.id}`);
    for (const s of c.systems) {
      scan(G.buildProject(c, { sys: s.id, part: null }, TOPICS, DOMAINS), `proj:${c.id}/${s.id}`);
      for (const p of (s.parts || [])) scan(G.buildProject(c, { sys: s.id, part: p.id }, TOPICS, DOMAINS), `proj:${c.id}/${s.id}/${p.id}`);
    }
    // the Workflows branch is a node on the same map, so its open state and
    // every flow selected under it are states the map has to survive too.
    if ((c.flows || []).length) {
      scan(G.buildProject(c, { sys: 'workflows', part: null }, TOPICS, DOMAINS), `proj:${c.id}/workflows`);
      for (const f of c.flows) scan(G.buildProject(c, { sys: 'workflows', part: f.id }, TOPICS, DOMAINS), `proj:${c.id}/workflows/${f.id}`);
    }
  }
  if (F) states += flowOverlaps(F, CASE_STUDIES, problems);
  // path states: a path's overview (no stage open) and every stage opened
  // are states the map has to survive, same as a project's overview and each
  // system opened above. An empty progress record is enough: node width does
  // not depend on which steps a reader has ticked, only on the label text.
  for (const pth of (PATHS || [])) {
    if (!pth.stages || !pth.stages.length) continue;
    scan(G.buildPath(pth, { stage: null }, { steps: {}, stages: {} }), `path:${pth.id}`);
    for (const st of pth.stages) scan(G.buildPath(pth, { stage: st.id }, { steps: {}, stages: {} }), `path:${pth.id}/${st.id}`);
  }
  return { states, problems, clipped: [...clipped.keys()] };
}
module.exports = { overlaps, flowOverlaps, cardOverlaps };
