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
function overlaps(G, DOMAINS, TOPICS) {
  DOMAINS.forEach(d => d.topics = Object.values(TOPICS).filter(t => t.d === d.id).map(t => t.id));
  const seen = new Set();
  let states = 0; const problems = [];
  const check = (state, name) => {
    states++;
    const b = boxes(G.build(state, seen).inner);
    for (let i = 0; i < b.length; i++) for (let j = i + 1; j < b.length; j++) {
      if (anyOv(b[i].polys, b[j].polys)) problems.push(`${name}: label "${b[i].id}" overlaps label "${b[j].id}"`);
      if (b[j].disc && anyOv(b[i].polys, [b[j].disc])) problems.push(`${name}: label "${b[i].id}" overlaps node "${b[j].id}"`);
      if (b[i].disc && anyOv(b[j].polys, [b[i].disc])) problems.push(`${name}: label "${b[j].id}" overlaps node "${b[i].id}"`);
      if (b[i].disc && b[j].disc && anyOv([b[i].disc], [b[j].disc])) problems.push(`${name}: node "${b[i].id}" overlaps node "${b[j].id}"`);
    }
  };
  check({ dom: null, topic: null }, 'overview');
  for (const d of DOMAINS) { check({ dom: d.id, topic: null }, `open:${d.id}`); for (const t of d.topics) check({ dom: d.id, topic: t }, `sel:${t}`); }
  return { states, problems };
}
module.exports = { boxes, sat, overlaps };
