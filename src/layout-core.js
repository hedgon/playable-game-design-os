// Reusable brain-map layout QA. Given a map renderer (PlayableGraph) and a
// dataset, render every state (overview, each domain open, each topic selected)
// and report label-vs-label and label-vs-node overlaps using oriented boxes and
// a separating-axis test. Kept separate from check-layout.js so a synthetic
// large dataset can be exercised without touching the real data files.
function boxes(svgInner) {
  const groups = [...svgInner.matchAll(/<g class="node ([^"]*)"[^>]*data-kind="(\w+)"(?: data-id="([^"]*)")?[^>]*>([\s\S]*?)<\/g>/g)];
  const out = [];
  for (const g of groups) {
    const kind = g[2], id = g[3] || 'center', inner = g[4];
    const texts = [...inner.matchAll(/<text class="lbl[^"]*" x="([-\d.]+)" y="([-\d.]+)"(?: dy="[^"]*")? text-anchor="(\w+)" font-size="([\d.]+)"(?: transform="[^"]*" data-rad="([-\d.]+)" data-w="([\d.]+)")?>([^<]*)<\/text>/g)];
    if (!texts.length) continue;
    const polys = [];
    for (const t of texts) {
      const x = +t[1], y = +t[2], size = +t[4];
      if (t[5] !== undefined) { const a = +t[5], w = +t[6]; const c = Math.cos(a), s = Math.sin(a), h = size * 0.5; const nx = -s * h, ny = c * h; polys.push([[x + nx, y + ny], [x + c * w + nx, y + s * w + ny], [x + c * w - nx, y + s * w - ny], [x - nx, y - ny]]); continue; }
      const w = t[7].length * size * 0.56; const anc = t[3]; const lx = anc === 'start' ? x : anc === 'end' ? x - w : x - w / 2; polys.push([[lx, y - size * 0.9], [lx + w, y - size * 0.9], [lx + w, y + size * 0.2], [lx, y + size * 0.2]]);
    }
    const disc = inner.match(/<(?:circle|rect) class="disc"[^>]*(?:cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"|x="([-\d.]+)" y="([-\d.]+)"(?: width="([\d.]+)" height="([\d.]+)")?)/);
    let discPoly = null;
    if (disc) { if (disc[3]) { const cx = +disc[1], cy = +disc[2], r = +disc[3] * 0.85; discPoly = [[cx - r, cy - r], [cx + r, cy - r], [cx + r, cy + r], [cx - r, cy + r]]; } else { const x = +disc[4], y = +disc[5], w = disc[6] ? +disc[6] : 20, h = disc[7] ? +disc[7] : 20; discPoly = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; } }
    out.push({ kind, id, polys, disc: discPoly });
  }
  return out;
}
function sat(A, B) {
  const axes = [];
  for (const P of [A, B]) for (let i = 0; i < 4; i++) { const dx = P[(i + 1) % 4][0] - P[i][0], dy = P[(i + 1) % 4][1] - P[i][1]; axes.push([-dy, dx]); }
  for (const [ax, ay] of axes) { const pa = A.map(p => p[0] * ax + p[1] * ay), pb = B.map(p => p[0] * ax + p[1] * ay); if (Math.max(...pa) <= Math.min(...pb) + 1e-6 || Math.max(...pb) <= Math.min(...pa) + 1e-6) return false; }
  return true;
}
const anyOv = (ps, qs) => ps.some(p => qs.some(q => sat(p, q)));

// Returns { states, problems }. A problem is a human-readable string.
// CASE_STUDIES is optional; when given, every project map state is rendered
// too (project overview, each system open, each part selected) and the
// "seen in practice" leaves are fed into the domain states, so the checker
// sees the same fourth layer the app draws.
// `F` is the flow renderer (PlayableFlow), optional. When given, every flow's
// cards are laid out in node and axis-aligned-box tested against each other:
// the chart is deterministic, so a collision found here is a collision in the
// browser. The direction has to be the one the app renders, because the two
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
function overlaps(G, DOMAINS, TOPICS, CASE_STUDIES, F) {
  DOMAINS.forEach(d => d.topics = Object.values(TOPICS).filter(t => t.d === d.id).map(t => t.id));
  const seen = new Set();
  const pl = G.practiceLinks ? G.practiceLinks(CASE_STUDIES || []) : { views: {}, extra: {} };
  let states = 0; const problems = [];
  const scan = (inner, name) => {
    states++;
    const b = boxes(inner);
    for (let i = 0; i < b.length; i++) for (let j = i + 1; j < b.length; j++) {
      if (anyOv(b[i].polys, b[j].polys)) problems.push(`${name}: label "${b[i].id}" overlaps label "${b[j].id}"`);
      if (b[j].disc && anyOv(b[i].polys, [b[j].disc])) problems.push(`${name}: label "${b[i].id}" overlaps node "${b[j].id}"`);
      if (b[i].disc && anyOv(b[j].polys, [b[i].disc])) problems.push(`${name}: label "${b[j].id}" overlaps node "${b[i].id}"`);
      if (b[i].disc && b[j].disc && anyOv([b[i].disc], [b[j].disc])) problems.push(`${name}: node "${b[i].id}" overlaps node "${b[j].id}"`);
    }
  };
  const check = (state, name) => scan(G.build(state, seen, pl.views).inner, name);
  check({ dom: null, topic: null }, 'overview');
  for (const d of DOMAINS) {
    check({ dom: d.id, topic: null }, `open:${d.id}`);
    for (const t of d.topics) check({ dom: d.id, topic: t, extra: pl.extra[t] || [] }, `sel:${t}`);
  }
  for (const c of (CASE_STUDIES || [])) {
    if (!c.systems || !c.systems.length) continue;
    scan(G.buildProject(c, { sys: null, part: null }, TOPICS, DOMAINS).inner, `proj:${c.id}`);
    for (const s of c.systems) {
      scan(G.buildProject(c, { sys: s.id, part: null }, TOPICS, DOMAINS).inner, `proj:${c.id}/${s.id}`);
      for (const p of (s.parts || [])) scan(G.buildProject(c, { sys: s.id, part: p.id }, TOPICS, DOMAINS).inner, `proj:${c.id}/${s.id}/${p.id}`);
    }
    // the Workflows branch is a node on the same map, so its open state and
    // every flow selected under it are states the map has to survive too.
    if ((c.flows || []).length) {
      scan(G.buildProject(c, { sys: 'workflows', part: null }, TOPICS, DOMAINS).inner, `proj:${c.id}/workflows`);
      for (const f of c.flows) scan(G.buildProject(c, { sys: 'workflows', part: f.id }, TOPICS, DOMAINS).inner, `proj:${c.id}/workflows/${f.id}`);
    }
  }
  if (F) states += flowOverlaps(F, CASE_STUDIES, problems);
  return { states, problems };
}
module.exports = { boxes, sat, overlaps, flowOverlaps };
