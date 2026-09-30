// Reusable map layout QA. Given a map renderer (PlayableGraph) and a dataset,
// render every state (overview, each domain open, each topic selected, every
// project and path state) and report any two node cards that overlap. The
// renderer returns its placed nodes (x = left edge, y = vertical centre, w,
// h), so the check reads that geometry directly instead of parsing the SVG.
// The states are built with the labels a reader sees: the static tool links
// (VIEW_LINKS) and the practice links, not raw ids.
// The renderer wraps a label onto as many lines as it needs and makes the card
// taller, so a card-vs-card test covers label collisions here. Whether the
// wrapped text really stays inside its card depends on the font the browser
// draws, so check-layout.js repeats the states in a real browser and measures
// the text against the card (textFitSweep in check-layout.js).
// Two numbers are only reported: `split` (a word longer than a line was broken
// across two lines, from the renderer's own lines) and edge crossings (how
// many drawn edge pairs cross, counted from the SVG paths).
// Kept separate from check-layout.js so a synthetic dataset can be
// exercised without the real data files.
const splitWord = n => !!n.label && (n.lines || [n.label]).join(' ') !== n.label;

function cardOverlaps(nodes, name, problems) {
  const r = nodes.map(n => ({ id: n.kind === 'center' ? 'center' : n.id, x: n.x, y: n.y - n.h / 2, w: n.w, h: n.h }));
  for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) {
    const a = r[i], b = r[j];
    if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) problems.push(`${name}: node "${a.id}" overlaps node "${b.id}"`);
  }
}

// Edge crossings, counted from the drawn paths: each edge is a cubic curve,
// sampled into a polyline. Two edges that share a node are not counted (they
// meet by design). Information only, never a failure.
function edgeCrossings(g) {
  const edges = []; const re = /<path class="edge[^"]*" data-a="([^"]*)" data-b="([^"]*)" d="([^"]*)"/g; let m;
  while ((m = re.exec(g.inner || ''))) {
    const v = m[3].match(/-?\d+(?:\.\d+)?/g); if (!v || v.length < 8) continue;
    const [x0, y0, x1, y1, x2, y2, x3, y3] = v.map(Number), pts = [];
    for (let i = 0; i <= 14; i++) { const t = i / 14, u = 1 - t; pts.push([u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]); }
    edges.push({ a: m[1], b: m[2], pts, x: Math.min(...pts.map(p => p[0])), X: Math.max(...pts.map(p => p[0])), y: Math.min(...pts.map(p => p[1])), Y: Math.max(...pts.map(p => p[1])) });
  }
  const side = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const cross = (p, q, r, s) => side(p, q, r) * side(p, q, s) < 0 && side(r, s, p) * side(r, s, q) < 0;
  let n = 0;
  for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) {
    const A = edges[i], B = edges[j];
    if (A.a === B.a || A.a === B.b || A.b === B.a || A.b === B.b) continue;
    if (A.X < B.x || B.X < A.x || A.Y < B.y || B.Y < A.y) continue;
    let hit = false;
    for (let k = 0; k < A.pts.length - 1 && !hit; k++) for (let l = 0; l < B.pts.length - 1; l++) if (cross(A.pts[k], A.pts[k + 1], B.pts[l], B.pts[l + 1])) { hit = true; break; }
    if (hit) n++;
  }
  return n;
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
    for (const t of g.cut) problems.push(`${name}: step title does not fit in 5 lines: "${t}"`);
    // a card outside the viewBox would be clipped rather than merely ugly.
    for (const n of nodes) if (n.x < 0 || n.y < 0 || n.x + n.w > g.w + 1e-6 || n.y + n.h > g.h + 1e-6) problems.push(`${name}: card "${n.id}" falls outside the chart box`);
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) problems.push(`${name}: card "${a.id}" overlaps card "${b.id}"`);
    }
  }
  return states;
}

// Every map state as a list of { name, make() }: make() builds the graph
// (nodes + SVG). Nothing is listed by hand per topic or per kind: the states
// come from the data, and from `G.checkStates(ctx)` when the map code offers
// it (grouped leaves, expanded groups, cross-lens leaves, the legend, and so
// on), so a state the map learns to draw is checked without editing this
// file. A hook state is { name, make } or { name, graph }, and `ctx` carries
// DOMAINS, TOPICS, CASE_STUDIES, PATHS, GAMES, views and seen.
// `views` is the label table the app uses for tool and practice leaves.
function graphStates(G, DOMAINS, TOPICS, CASE_STUDIES, PATHS, GAMES, views) {
  DOMAINS.forEach(d => d.topics = Object.values(TOPICS).filter(t => t.d === d.id).map(t => t.id));
  const seen = new Set(), out = [];
  const pl = G.practiceLinks ? G.practiceLinks(CASE_STUDIES || [], 2, GAMES || []) : { views: {}, extra: {} };
  views = Object.assign({}, views || {}, pl.views);
  const add = (name, make) => out.push({ name, make });
  // Every state is checked in both layouts: two-sided (wide screens) and
  // one-sided (phones).
  for (const oneSided of [false, true]) {
    const tag = oneSided ? '1side ' : '';
    const dom = (state, name) => add(tag + name, () => G.build(Object.assign({ oneSided }, state), seen, views));
    for (const lens of new Set(DOMAINS.map(d => d.lens))) dom({ dom: null, topic: null, lens }, `overview:${lens}`);
    for (const d of DOMAINS) {
      dom({ dom: d.id, topic: null, lens: d.lens }, `open:${d.id}`);
      for (const t of d.topics) {
        dom({ dom: d.id, topic: t, lens: d.lens, extra: pl.extra[t] || [] }, `sel:${t}`);
        // Leaves are grouped by kind and a big group starts collapsed; the same
        // topic with every group opened is the widest state it can reach.
        // Read from the map code itself (neighbours, GROUP_OPEN), no hand list.
        if (typeof G.neighbours === 'function') {
          const groups = G.neighbours(t, views) || [], grp = {};
          groups.forEach(gr => { grp[gr.id] = true; });
          if (groups.some(gr => gr.leaves.length > (G.GROUP_OPEN || 0))) dom({ dom: d.id, topic: t, lens: d.lens, extra: pl.extra[t] || [], grp }, `sel-all-groups-open:${t}`);
        }
      }
    }
    for (const c of (CASE_STUDIES || [])) {
      if (!c.systems || !c.systems.length) continue;
      const proj = (sys, part, name) => add(tag + name, () => G.buildProject(c, { sys, part, oneSided }, TOPICS, DOMAINS));
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
      add(`${tag}path:${pth.id}`, () => G.buildPath(pth, { stage: null, oneSided }, { steps: {}, stages: {} }));
      for (const st of pth.stages) add(`${tag}path:${pth.id}/${st.id}`, () => G.buildPath(pth, { stage: st.id, oneSided }, { steps: {}, stages: {} }));
    }
  }
  if (typeof G.checkStates === 'function') {
    for (const s of G.checkStates({ DOMAINS, TOPICS, CASE_STUDIES, PATHS, GAMES, views, seen }) || []) add('hook ' + s.name, s.make || (() => s.graph));
  }
  return out;
}

// Returns { states, problems, split, crossings }. A problem is a
// human-readable string; `split` lists the labels in which a word had to be
// broken across lines, once each; `crossings` = { total, worst, worstName }.
// CASE_STUDIES is optional; when given, every project map state is rendered
// too (project overview, each system open, each part selected) and the
// "seen in practice" leaves are fed into the domain states, so the checker
// sees the same fourth layer the app draws. VIEWS is the app's VIEW_LINKS.
function overlaps(G, DOMAINS, TOPICS, CASE_STUDIES, F, PATHS, GAMES, VIEWS) {
  let states = 0; const problems = []; const split = new Map(); const crossings = { total: 0, worst: 0, worstName: '' };
  for (const st of graphStates(G, DOMAINS, TOPICS, CASE_STUDIES, PATHS, GAMES, VIEWS)) {
    const g = st.make(); states++;
    cardOverlaps(g.nodes, st.name, problems);
    for (const n of g.nodes) if (splitWord(n)) split.set(n.kind + ':' + n.label, st.name);
    const x = edgeCrossings(g); crossings.total += x;
    if (x > crossings.worst) { crossings.worst = x; crossings.worstName = st.name; }
  }
  if (F) states += flowOverlaps(F, CASE_STUDIES, problems);
  return { states, problems, split: [...split.keys()], crossings };
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
module.exports = { overlaps, graphStates, edgeCrossings, flowOverlaps, cardOverlaps, diagramProblems };
