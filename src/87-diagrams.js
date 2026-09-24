/* =====================================================================
   DIAGRAMS
   One renderer for the topic and reference-game diagrams declared as data
   with DIAGRAM(). Same contract as the workflow charts (88-flow.js): pure
   functions, no DOM, no randomness, CSS variables only, so the same spec
   always gives the same boxes and the layout checker can test them in node.

   Kinds: loop (a cycle of steps), stack (bands, optionally tapering), matrix
   (rows by columns), quad (a 2x2 with plotted points), curve (one or two
   lines over time, with an optional band and beat markers), economy
   (sources, pools, converters and sinks joined by flows), state (states in
   a two-column grid with labelled transitions) and screen (an annotated screen
   layout). `flow` specs are handed to PlayableFlow unchanged.

   Size. Every kind is laid out on a 380 unit wide canvas, so on a 375px
   phone the chart scales to about 0.8 and its 13px labels stay legible; the
   "diagram as text" list under each chart carries the same content.
   A text that does not fit its box is not silently cut: `layout` reports
   it in `cut`, and the layout checker fails the build on it.

   `layout(spec)` returns { w, h, boxes, cut } and is what the checker
   calls; `render(spec)` returns the SVG string; `describe(spec)` returns
   the "diagram as text" HTML shown under it.
   ===================================================================== */
window.PlayableDiagram = (function(){
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const W = 380, PAD = 12, FS = 13, SFS = 10.5, LH = 15, SLH = 13;
  // Display labels use the map's estimate; the mono sub-labels are 0.6em a character.
  const perChar = fs => fs === FS ? FS * 0.56 : fs * 0.6;
  const hash = s => { let x = 5381; for (let i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) | 0; return (x >>> 0).toString(36); };

  // Greedy word wrap into at most `max` lines of `width` units. A text that
  // needs more lines keeps an ellipsis and is reported in `cut`.
  function wrap(text, width, fs, max, cut){
    const chars = Math.max(3, Math.floor(width / perChar(fs)));
    const words = String(text || '').split(/\s+/).filter(Boolean), out = [];
    let line = '';
    for (const w of words) {
      const next = line ? line + ' ' + w : w;
      if (next.length <= chars) line = next;
      else { if (line) out.push(line); line = w; }
    }
    if (line) out.push(line);
    let shortened = out.length > max || out.some(l => l.length > chars);
    const res = out.slice(0, max).map(l => l.length > chars ? l.slice(0, chars - 1) + '…' : l);
    if (out.length > max) res[max - 1] = res[max - 1].slice(0, Math.max(1, chars - 1)).trimEnd() + '…';
    if (shortened && cut) cut.push(String(text));
    return res;
  }

  // A card: number, title lines, sub lines. Height follows the text.
  function card(w, t, d, cut, opt = {}){
    const tl = wrap(t, w - 20, FS, opt.tLines || 2, cut);
    const dl = d ? wrap(d, w - 20, SFS, opt.dLines || 2, cut) : [];
    const tag = opt.tag ? 1 : 0;
    const h = 12 + tag * SLH + tl.length * LH + dl.length * SLH + 6;
    return { w, h, tl, dl, tag: opt.tag || '' };
  }
  function cardSVG(n, num){
    let y = n.y + 10;
    let s = `<g class="dnode"><rect class="dcard${n.shape ? ' ' + n.shape : ''}" x="${f(n.x)}" y="${f(n.y)}" width="${f(n.w)}" height="${f(n.h)}" rx="${n.shape === 'pool' ? 16 : 3}"/>`;
    if (num) s += `<text class="dnum" x="${f(n.x + n.w - 8)}" y="${f(n.y + 12)}" text-anchor="end" font-size="9.5">${num}</text>`;
    if (n.tag) { y += SLH - 2; s += `<text class="dtag" x="${f(n.x + 10)}" y="${f(y)}" font-size="9">${esc(n.tag.toUpperCase())}</text>`; }
    n.tl.forEach(l => { y += LH; s += `<text class="dlbl" x="${f(n.x + 10)}" y="${f(y - 3)}" font-size="${FS}">${esc(l)}</text>`; });
    n.dl.forEach(l => { y += SLH; s += `<text class="dsub" x="${f(n.x + 10)}" y="${f(y - 2)}" font-size="${SFS}">${esc(l)}</text>`; });
    return s + '</g>';
  }
  const f = v => (Math.round(v * 10) / 10).toString();
  const box = (id, x, y, w, h) => ({ id, x, y, w, h });
  // Where a line from a card's centre toward (tx, ty) leaves the card.
  function exitPoint(n, tx, ty, grow = 3){
    const cx = n.x + n.w / 2, cy = n.y + n.h / 2, dx = tx - cx, dy = ty - cy;
    if (!dx && !dy) return [cx, cy];
    const hw = n.w / 2 + grow, hh = n.h / 2 + grow;
    const k = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
    return [cx + dx * k, cy + dy * k];
  }

  // A quadratic curve from card A to card B bent through (qx, qy), ending on
  // the card edges; (lx, ly) is its midpoint, where a label sits.
  function curveTo(A, B, qx, qy){
    const [x1, y1] = exitPoint(A, qx, qy), [x2, y2] = exitPoint(B, qx, qy);
    return { d: `M${f(x1)},${f(y1)} Q${f(qx)},${f(qy)} ${f(x2)},${f(y2)}`, lx: 0.25 * x1 + 0.5 * qx + 0.25 * x2, ly: 0.25 * y1 + 0.5 * qy + 0.25 * y2 };
  }
  const mid = n => [n.x + n.w / 2, n.y + n.h / 2];

  // A cycle drawn as a racetrack of two columns, clockwise: with an odd
  // count the first card sits centred on top, then the right column runs
  // down and the left column back up, so the last step lands beside the
  // first. Two 152-wide columns always fit the canvas, whatever the count.
  function track(items, cw, gapY, top){
    const n = items.length, ch = Math.max(...items.map(c => c.h));
    const lx = PAD + 6, rx = W - PAD - 6 - cw, odd = n % 2, k = Math.floor(n / 2);
    const at = (c, x, r) => Object.assign({}, c, { h: ch, x, y: top + r * (ch + gapY) });
    const nodes = odd ? [at(items[0], (W - cw) / 2, 0)] : [];
    for (let i = 0; i < k; i++) nodes.push(at(items[odd + i], rx, odd + i));
    for (let i = 0; i < k; i++) nodes.push(at(items[odd + k + i], lx, odd + k - 1 - i));
    const rows = odd + k;
    return { nodes, h: top + rows * ch + (rows - 1) * gapY + PAD };
  }
  // Between neighbours on the track: straight within a row or column, an
  // L-shaped curve from the top card into a column and back.
  function link(A, B){
    const [ax, ay] = mid(A), [bx, by] = mid(B);
    if (Math.abs(ax - bx) < 1 || Math.abs(ay - by) < 1) return curveTo(A, B, (ax + bx) / 2, (ay + by) / 2);
    return ay < by ? curveTo(A, B, bx, ay) : curveTo(A, B, ax, by);
  }

  const L = {};
  L.loop = spec => {
    const cut = [], cw = 152;
    const items = spec.steps.map(s => card(cw, s.t, s.d, cut));
    const r = track(items, cw, 30, PAD);
    const edges = r.nodes.map((n, i) => link(n, r.nodes[(i + 1) % r.nodes.length]));
    return { w: W, h: r.h, nodes: r.nodes, edges, cut, boxes: r.nodes.map((n, i) => box('step ' + (i + 1), n.x, n.y, n.w, n.h)) };
  };

  // States in a grid of two columns, in data order (order the states so most
  // transitions join neighbours). The gaps between columns and rows hold the
  // transition labels; the top margin holds the start marker and any
  // self-transition.
  L.state = spec => {
    const cut = [], cw = 128, top = 30, gapY = 46;
    const items = spec.states.map(s => card(cw, s.t, s.d, cut, { dLines: 1 }));
    const ch = Math.max(...items.map(c => c.h)), lx = PAD, rx = W - PAD - cw;
    const nodes = items.map((c, i) => Object.assign({}, c, { h: ch, x: i % 2 ? rx : lx, y: top + Math.floor(i / 2) * (ch + gapY) }));
    const rows = Math.ceil(nodes.length / 2);
    const idx = {}; spec.states.forEach((s, i) => { idx[s.id] = i; });
    const pairs = new Set(spec.edges.map(e => e[0] + '>' + e[1]));
    const edges = spec.edges.map(([a, b, label]) => {
      const A = nodes[idx[a]], B = nodes[idx[b]];
      if (a === b) {
        const x = A.x + A.w - 26, y = A.y;
        return { d: `M${f(x)},${f(y)} C${f(x - 4)},${f(y - 28)} ${f(x + 30)},${f(y - 28)} ${f(x + 18)},${f(y - 2)}`, lx: x + 12, ly: y - 22, label };
      }
      const [ax, ay] = mid(A), [bx, by] = mid(B);
      const len = Math.hypot(bx - ax, by - ay) || 1, px = -(by - ay) / len, py = (bx - ax) / len;
      // A pair of opposite transitions bows apart, one to each side.
      const off = pairs.has(b + '>' + a) ? 22 : 0;
      let qx = (ax + bx) / 2 + px * off, qy = (ay + by) / 2 + py * off;
      // Two states in one column with a state between them: bend into the middle gap.
      if (Math.abs(ax - bx) < 1 && Math.abs(ay - by) > ch + gapY + 1) qx = W / 2;
      const e = curveTo(A, B, qx, qy);
      e.vertical = Math.abs(by - ay) > Math.abs(bx - ax) * 1.5;
      e.side = off ? Math.sign(px * off || 1) : 0;
      return Object.assign(e, { label });
    });
    const labels = edges.filter(e => e.label).map(e => {
      const l = labelBox(e);
      // On a vertical pair the labels sit beside their lines, not on them.
      if (e.vertical && e.side) l.x += e.side * (l.w / 2 + 6);
      return l;
    });
    return { w: W, h: top + rows * ch + (rows - 1) * gapY + PAD, nodes, edges, labels, start: nodes[idx[spec.start]], cut,
      boxes: nodes.map((n, i) => box('state ' + spec.states[i].id, n.x, n.y, n.w, n.h)).concat(labels.map(l => box('label ' + l.text, l.x, l.y, l.w, l.h)))
        .concat(spec.start ? [box('start marker', nodes[idx[spec.start]].x + 14, nodes[idx[spec.start]].y - 24, 48, 20)] : []) };
  };
  const LFS = 9.5;
  function labelBox(e){ const w = e.label.length * LFS * 0.62 + 10; return { text: e.label, x: e.lx - w / 2, y: e.ly - 8, w, h: 16 }; }

  L.stack = spec => {
    const cut = [], gutter = spec.arrow ? 24 : 0, full = W - 2 * PAD - gutter, n = spec.layers.length;
    let y = PAD + (spec.arrow ? 16 : 0);
    const nodes = spec.layers.map((l, i) => {
      const w = spec.taper ? full * (1 - 0.34 * (n > 1 ? i / (n - 1) : 0)) : full;
      const c = card(w, l.t, l.d, cut, { dLines: 3 });
      const node = Object.assign(c, { x: PAD + gutter, y });
      y += c.h + 10;
      return node;
    });
    return { w: W, h: y - 10 + PAD, nodes, cut, gutter, boxes: nodes.map((b, i) => box('layer ' + (i + 1), b.x, b.y, b.w, b.h)) };
  };

  L.matrix = spec => {
    const cut = [], rh = 96, cols = spec.cols.length, cw = (W - 2 * PAD - rh) / cols;
    const head = spec.cols.map(c => wrap(c, cw - 10, SFS, 2, cut));
    const hh = 10 + Math.max(...head.map(h => h.length)) * SLH;
    let y = PAD + hh;
    const rows = spec.rows.map((r, i) => {
      const rl = wrap(r, rh - 12, FS, 3, cut);
      const cells = spec.cols.map((_, j) => wrap((spec.cells[i] || [])[j] || '', cw - 10, SFS, 4, cut));
      const h = Math.max(rl.length * LH, ...cells.map(c => c.length * SLH)) + 12;
      const row = { y, h, rl, cells }; y += h; return row;
    });
    // Rows are stacked by construction; registering them still checks that
    // the table stays inside its canvas.
    return { w: W, h: y + PAD, rh, cw, hh, head, rows, cut,
      boxes: [box('header', PAD, PAD, W - 2 * PAD, hh)].concat(rows.map((r, i) => box('row ' + (i + 1), PAD, r.y, W - 2 * PAD, r.h))) };
  };

  L.quad = spec => {
    const cut = [], gx = PAD + 18, S = W - gx - PAD, top = PAD;
    const pts = spec.points.map(p => {
      const px = gx + p.x * S, py = top + (1 - p.y) * S;
      const lines = wrap(p.t, 118, SFS, 2, cut), lw = Math.max(...lines.map(l => l.length)) * SFS * 0.6 + 4;
      const right = p.x < 0.62, lx = right ? px + 8 : px - 8 - lw;
      return { px, py, lines, lx, ly: py - 7, lw, lh: lines.length * SLH + 2, right };
    });
    const qs = (spec.q || []).map(q => wrap(q, S / 2 - 16, 9.5, 2, cut));
    // Quadrant names sit in the four corners; they are boxes too, so a point
    // label cannot land on one unnoticed. So are the two axis names.
    const mid = S / 2, corner = [[gx + 6, top + 14], [gx + mid + 6, top + 14], [gx + 6, top + mid + 14], [gx + mid + 6, top + mid + 14]];
    const qBoxes = qs.map((q, i) => box('quadrant ' + spec.q[i], corner[i][0], corner[i][1] - 9, Math.max(...q.map(l => l.length)) * 9.5 * 0.6, q.length * 11 + 2));
    const xw = (spec.x.length + 2) * SFS * 0.6, yw = (spec.y.length + 2) * SFS * 0.6;
    const axes = [box('x axis name', gx + S / 2 - xw / 2, top + S + 8, xw, 13), box('y axis name', PAD + 1, top + S / 2 - yw / 2, 13, yw)];
    return { w: W, h: top + S + 30, gx, S, top, pts, qs, corner, cut,
      boxes: pts.map((p, i) => box('point ' + spec.points[i].t, p.lx, p.ly, p.lw, p.lh)).concat(pts.map((p, i) => box('dot ' + spec.points[i].t, p.px - 4, p.py - 4, 8, 8)), qBoxes, axes) };
  };

  L.curve = spec => {
    const cut = [], gx = PAD + 18, PW = W - gx - PAD, PH = 170, top = PAD;
    const X = v => gx + v * PW, Y = v => top + (1 - v) * PH;
    const beats = (spec.beats || []).map((b, i) => {
      const lines = wrap(b.t, 70, 9.5, 2, cut), lw = Math.max(...lines.map(l => l.length)) * 9.5 * 0.6 + 4;
      return { x: X(b.at), lines, lw, row: 0, t: b.t };
    });
    // Beat labels that would touch drop to a second row.
    beats.forEach((b, i) => { const prev = beats[i - 1]; if (prev && prev.row === 0 && b.x - b.lw / 2 < prev.x + prev.lw / 2 + 4) b.row = 1; });
    const beatTop = top + PH + 8;
    beats.forEach(b => { b.y = beatTop + b.row * 28; });
    const legendY = beatTop + (beats.length ? (beats.some(b => b.row) ? 60 : 32) : 4) + 14;
    const legend = spec.series.map((s, i) => ({ t: s.t, x: gx + i * (PW / 2), y: legendY }));
    spec.series.forEach(s => wrap(s.t, PW / 2 - 34, SFS, 1, cut));
    const xw = (spec.x.length + 2) * SFS * 0.6, yw = (spec.y.length + 2) * SFS * 0.6;
    const extra = [box('x axis name', gx + PW - xw, top + PH - 16, xw, 13), box('y axis name', PAD + 1, top + PH / 2 - yw / 2, 13, yw)]
      .concat(legend.map(l => box('legend ' + l.t, l.x, l.y - 10, 30 + l.t.length * SFS * 0.6, 14)));
    if (spec.band) { const bw = spec.band.t.length * 9.5 * 0.6; extra.push(box('band ' + spec.band.t, gx + PW - 6 - bw, Y(spec.band.to) + 3, bw, 11)); }
    return { w: W, h: legendY + 12 + PAD, gx, PW, PH, top, X, Y, beats, legend, cut,
      boxes: beats.map(b => box('beat ' + b.t, b.x - b.lw / 2, b.y, b.lw, b.lines.length * 12 + 2)).concat(extra) };
  };

  L.economy = spec => {
    const cut = [], cw = 104, gap = 14, vgap = 42;
    const defRow = { source: 0, pool: 1, converter: 2, sink: 3 };
    const nodes = spec.nodes.map(n => Object.assign(card(cw, n.t, n.d, cut, { tag: n.type, dLines: 1 }), { id: n.id, type: n.type, row: n.row ?? defRow[n.type], shape: n.type }));
    const rows = [...new Set(nodes.map(n => n.row))].sort((a, b) => a - b);
    let y = PAD;
    rows.forEach(r => {
      const list = nodes.filter(n => n.row === r), h = Math.max(...list.map(n => n.h));
      const span = list.length * cw + (list.length - 1) * gap, x0 = (W - span) / 2;
      list.forEach((n, i) => { n.x = x0 + i * (cw + gap); n.y = y; n.h = h; });
      y += h + vgap;
    });
    const by = {}; nodes.forEach(n => { by[n.id] = n; });
    // A flow between rows leaves one card's bottom (or top, going up) and
    // enters the other's top (or bottom). Every flow on the same side of a
    // card gets its own point along that side, in the order of the cards at
    // the other end, so converging flows and their labels do not stack.
    const sides = spec.edges.map(([a, b]) => by[b].row > by[a].row ? ['bottom', 'top'] : by[b].row < by[a].row ? ['top', 'bottom'] : null);
    const slot = (k, end) => {
      const self = spec.edges[k][end], side = sides[k][end];
      const list = spec.edges.map((e, i) => i).filter(i => sides[i] && [0, 1].some(e => spec.edges[i][e] === self && sides[i][e] === side));
      const other = i => { const o = by[spec.edges[i][spec.edges[i][0] === self ? 1 : 0]]; return o.x + o.w / 2; };
      list.sort((p, q) => other(p) - other(q));
      const n = by[self];
      return n.x + n.w * (list.indexOf(k) + 1) / (list.length + 1);
    };
    const edges = spec.edges.map(([a, b, label], k) => {
      const A = by[a], B = by[b];
      let x1, y1, x2, y2, c1x, c1y, c2x, c2y, t = 0.5;
      if (B.row !== A.row) {
        const dn = B.row > A.row;
        x1 = slot(k, 0); y1 = dn ? A.y + A.h : A.y; x2 = slot(k, 1); y2 = dn ? B.y - 3 : B.y + B.h + 3;
        c1x = x1; c1y = (y1 + y2) / 2; c2x = x2; c2y = (y1 + y2) / 2;
        if (Math.abs(B.row - A.row) > 1) t = 0.25;
      }
      else { const right = B.x > A.x; x1 = right ? A.x + A.w : A.x; y1 = A.y + A.h / 2; x2 = right ? B.x - 3 : B.x + B.w + 3; y2 = B.y + B.h / 2; c1x = (x1 + x2) / 2; c1y = y1; c2x = (x1 + x2) / 2; c2y = y2; }
      // A flow that skips a row puts its label in the first gap, not on the skipped row.
      const u = 1 - t, bz = (p0, p1, p2, p3) => u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
      const lx = bz(x1, c1x, c2x, x2), ly = bz(y1, c1y, c2y, y2);
      return { d: `M${f(x1)},${f(y1)} C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(x2)},${f(y2)}`, lx, ly, label };
    });
    const labels = edges.filter(e => e.label).map(labelBox);
    return { w: W, h: y - vgap + PAD, nodes, edges, labels, cut,
      boxes: nodes.map(n => box('node ' + n.id, n.x, n.y, n.w, n.h)).concat(labels.map(l => box('label ' + l.text, l.x, l.y, l.w, l.h))) };
  };

  L.screen = spec => {
    const cut = [], tall = spec.aspect === '9:16';
    const FW = tall ? 236 : W - 2 * PAD, FH = tall ? 420 : Math.round((W - 2 * PAD) * (spec.aspect === '4:3' ? 3 / 4 : 9 / 16));
    const fx = (W - FW) / 2, fy = PAD;
    const regions = spec.regions.map((r, i) => {
      const x = fx + r.x * FW, y = fy + r.y * FH, w = r.w * FW, h = r.h * FH;
      const l = wrap((i + 1) + ' ' + r.t, w - 8, SFS, Math.max(1, Math.min(4, Math.floor((h - 6) / SLH))), cut);
      if (h < 18) cut.push(r.t);
      return { x, y, w, h, l };
    });
    return { w: W, h: fy + FH + PAD, fx, fy, FW, FH, regions, cut, boxes: regions.map((r, i) => box('region ' + spec.regions[i].t, r.x, r.y, r.w, r.h)) };
  };

  // Flow specs are laid out by PlayableFlow; the checker handles them there.
  function layout(spec){ return spec.kind === 'flow' ? null : L[spec.kind](spec); }

  // --- rendering ---------------------------------------------------------
  const marker = id => `<defs><marker id="${id}" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path class="darrow" d="M0,0 L7,3 L0,6 Z"/></marker></defs>`;
  const open = (g, spec) => `<svg class="dgm" viewBox="0 0 ${Math.ceil(g.w)} ${Math.ceil(g.h)}" style="max-width:${Math.ceil(g.w * 1.25)}px" role="img" aria-label="${esc(spec.title)}">`;
  const R = {};
  R.loop = (spec, g, id) => marker(id) + g.edges.map(e => `<path class="dedge" d="${e.d}" marker-end="url(#${id})"/>`).join('') + g.nodes.map((n, i) => cardSVG(n, i + 1)).join('');
  R.state = (spec, g, id) => {
    let s = marker(id) + g.edges.map(e => `<path class="dedge" d="${e.d}" marker-end="url(#${id})"/>`).join('');
    s += g.labels.map(l => `<g class="dlabel"><rect x="${f(l.x)}" y="${f(l.y)}" width="${f(l.w)}" height="${f(l.h)}" rx="2"/><text x="${f(l.x + l.w / 2)}" y="${f(l.y + 11.5)}" text-anchor="middle" font-size="${LFS}">${esc(l.text)}</text></g>`).join('');
    const st = g.start; if (st) s += `<path class="dedge" d="M${f(st.x + 18)},${f(st.y - 24)} L${f(st.x + 18)},${f(st.y - 4)}" marker-end="url(#${id})"/><text class="dtag" x="${f(st.x + 26)}" y="${f(st.y - 13)}" font-size="9">START</text>`;
    return s + g.nodes.map(n => cardSVG(n, 0)).join('');
  };
  R.stack = (spec, g, id) => {
    let s = '';
    if (spec.arrow) {
      const x = PAD + 9, y1 = g.nodes[0].y, y2 = g.nodes[g.nodes.length - 1].y + g.nodes[g.nodes.length - 1].h;
      s += marker(id) + `<text class="dtag" x="${PAD}" y="${PAD + 8}" font-size="9">${esc(spec.arrow.toUpperCase())}</text><path class="dedge" d="M${x},${f(y1)} L${x},${f(y2 - 4)}" marker-end="url(#${id})"/>`;
    }
    return s + g.nodes.map((n, i) => cardSVG(n, i + 1)).join('');
  };
  R.matrix = (spec, g) => {
    const x0 = PAD, cols = spec.cols.length;
    let s = `<rect class="dgrid" x="${x0}" y="${PAD}" width="${W - 2 * PAD}" height="${f(g.h - 2 * PAD)}"/>`;
    g.head.forEach((h, j) => {
      const x = x0 + g.rh + j * g.cw;
      s += `<rect class="dhead" x="${f(x)}" y="${PAD}" width="${f(g.cw)}" height="${f(g.hh)}"/>`;
      h.forEach((l, k) => { s += `<text class="dlbl dsmall" x="${f(x + 5)}" y="${f(PAD + 14 + k * SLH)}" font-size="${SFS}">${esc(l)}</text>`; });
    });
    g.rows.forEach((r, i) => {
      s += `<line class="dline" x1="${x0}" y1="${f(r.y)}" x2="${W - PAD}" y2="${f(r.y)}"/>`;
      r.rl.forEach((l, k) => { s += `<text class="dlbl" x="${x0 + 6}" y="${f(r.y + 17 + k * LH)}" font-size="${FS}">${esc(l)}</text>`; });
      r.cells.forEach((c, j) => { const x = x0 + g.rh + j * g.cw; c.forEach((l, k) => { s += `<text class="dsub" x="${f(x + 5)}" y="${f(r.y + 16 + k * SLH)}" font-size="${SFS}">${esc(l)}</text>`; }); });
    });
    for (let j = 0; j < cols; j++) { const x = x0 + g.rh + j * g.cw; s += `<line class="dline" x1="${f(x)}" y1="${PAD}" x2="${f(x)}" y2="${f(g.h - PAD)}"/>`; }
    return s;
  };
  R.quad = (spec, g) => {
    const { gx, S, top } = g, mid = S / 2;
    let s = `<rect class="dgrid" x="${f(gx)}" y="${top}" width="${f(S)}" height="${f(S)}"/><line class="dline" x1="${f(gx + mid)}" y1="${top}" x2="${f(gx + mid)}" y2="${f(top + S)}"/><line class="dline" x1="${f(gx)}" y1="${f(top + mid)}" x2="${f(gx + S)}" y2="${f(top + mid)}"/>`;
    const corner = g.corner;
    g.qs.forEach((q, i) => q.forEach((l, k) => { s += `<text class="dtag" x="${f(corner[i][0])}" y="${f(corner[i][1] + k * 11)}" font-size="9.5">${esc(l)}</text>`; }));
    s += `<text class="dsub" x="${f(gx + S / 2)}" y="${f(top + S + 18)}" text-anchor="middle" font-size="${SFS}">${esc(spec.x)} →</text>`;
    s += `<text class="dsub" transform="translate(${PAD + 8},${f(top + S / 2)}) rotate(-90)" text-anchor="middle" font-size="${SFS}">${esc(spec.y)} →</text>`;
    g.pts.forEach(p => {
      s += `<circle class="ddot" cx="${f(p.px)}" cy="${f(p.py)}" r="4"/>`;
      p.lines.forEach((l, k) => { s += `<text class="dlbl dsmall" x="${f(p.right ? p.lx : p.lx + p.lw)}" y="${f(p.py + 4 + k * SLH)}" text-anchor="${p.right ? 'start' : 'end'}" font-size="${SFS}">${esc(l)}</text>`; });
    });
    return s;
  };
  function smooth(pts, X, Y){
    const P = pts.map(([x, y]) => [X(x), Y(y)]);
    if (P.length < 3) return 'M' + P.map(p => f(p[0]) + ',' + f(p[1])).join(' L');
    let d = `M${f(P[0][0])},${f(P[0][1])}`;
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
    }
    return d;
  }
  R.curve = (spec, g) => {
    const { gx, PW, PH, top, X, Y } = g;
    let s = '';
    if (spec.band) s += `<rect class="dband" x="${f(gx)}" y="${f(Y(spec.band.to))}" width="${f(PW)}" height="${f(Y(spec.band.from) - Y(spec.band.to))}"/><text class="dtag" x="${f(gx + PW - 6)}" y="${f(Y(spec.band.to) + 12)}" text-anchor="end" font-size="9.5">${esc(spec.band.t)}</text>`;
    s += `<line class="daxis" x1="${f(gx)}" y1="${top}" x2="${f(gx)}" y2="${f(top + PH)}"/><line class="daxis" x1="${f(gx)}" y1="${f(top + PH)}" x2="${f(gx + PW)}" y2="${f(top + PH)}"/>`;
    s += `<text class="dsub" x="${f(gx + PW)}" y="${f(top + PH - 6)}" text-anchor="end" font-size="${SFS}">${esc(spec.x)} →</text>`;
    s += `<text class="dsub" transform="translate(${PAD + 8},${f(top + PH / 2)}) rotate(-90)" text-anchor="middle" font-size="${SFS}">${esc(spec.y)} →</text>`;
    g.beats.forEach(b => { s += `<line class="dbeat" x1="${f(b.x)}" y1="${top}" x2="${f(b.x)}" y2="${f(top + PH)}"/>`; b.lines.forEach((l, k) => { s += `<text class="dtag" x="${f(b.x)}" y="${f(b.y + 10 + k * 12)}" text-anchor="middle" font-size="9.5">${esc(l)}</text>`; }); });
    spec.series.forEach((sr, i) => { s += `<path class="dline${i + 1}" d="${smooth(sr.pts, X, Y)}"/>`; });
    g.legend.forEach((l, i) => { s += `<line class="dline${i + 1}" x1="${f(l.x)}" y1="${f(l.y - 4)}" x2="${f(l.x + 24)}" y2="${f(l.y - 4)}"/><text class="dsub" x="${f(l.x + 30)}" y="${f(l.y)}" font-size="${SFS}">${esc(l.t)}</text>`; });
    return s;
  };
  R.economy = (spec, g, id) => marker(id) + g.edges.map(e => `<path class="dedge" d="${e.d}" marker-end="url(#${id})"/>`).join('')
    + g.labels.map(l => `<g class="dlabel"><rect x="${f(l.x)}" y="${f(l.y)}" width="${f(l.w)}" height="${f(l.h)}" rx="2"/><text x="${f(l.x + l.w / 2)}" y="${f(l.y + 11.5)}" text-anchor="middle" font-size="${LFS}">${esc(l.text)}</text></g>`).join('')
    + g.nodes.map(n => cardSVG(n, 0)).join('');
  R.screen = (spec, g) => {
    let s = `<rect class="dframe" x="${f(g.fx)}" y="${f(g.fy)}" width="${f(g.FW)}" height="${f(g.FH)}" rx="6"/>`;
    g.regions.forEach(r => { s += `<rect class="dregion" x="${f(r.x)}" y="${f(r.y)}" width="${f(r.w)}" height="${f(r.h)}" rx="2"/>`; r.l.forEach((l, k) => { s += `<text class="dlbl dsmall" x="${f(r.x + 4)}" y="${f(r.y + 12 + k * SLH)}" font-size="${SFS}">${esc(l)}</text>`; }); });
    return s;
  };

  function render(spec){
    if (spec.kind === 'flow') return window.PlayableFlow.render(Object.assign({ id: 'dg' + hash(JSON.stringify(spec)) }, spec), () => 'var(--dc,var(--accent2))', 'v');
    const g = layout(spec), id = 'dg-' + hash(JSON.stringify(spec));
    return open(g, spec) + R[spec.kind](spec, g, id) + '</svg>';
  }

  // --- the same content as text -----------------------------------------
  const pos = r => (r.y + r.h / 2 < 0.34 ? 'top' : r.y + r.h / 2 > 0.66 ? 'bottom' : 'middle') + ' ' + (r.x + r.w / 2 < 0.34 ? 'left' : r.x + r.w / 2 > 0.66 ? 'right' : 'centre');
  function describe(spec){
    const li = xs => `<ol>${xs.map(x => `<li>${x}</li>`).join('')}</ol>`;
    const td = (t, d) => `<b>${esc(t)}</b>${d ? ': ' + esc(d) : ''}`;
    const name = {}; (spec.nodes || spec.states || spec.steps || []).forEach(n => { name[n.id] = n.t; });
    const flows = es => es.map(([a, b, l]) => `${esc(name[a] || a)} → ${esc(name[b] || b)}${l ? ` (${esc(l)})` : ''}`);
    switch (spec.kind) {
      case 'loop': return li(spec.steps.map(s => td(s.t, s.d))) + '<p class="small muted">The last step leads back to the first.</p>';
      case 'stack': return (spec.arrow ? `<p class="small muted">${esc(spec.arrow)}.</p>` : '') + li(spec.layers.map(l => td(l.t, l.d)));
      case 'matrix': return `<table class="dgm-table"><thead><tr><th></th>${spec.cols.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${spec.rows.map((r, i) => `<tr><th scope="row">${esc(r)}</th>${spec.cols.map((_, j) => `<td>${esc((spec.cells[i] || [])[j] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      case 'quad': return `<p class="small muted">Across: ${esc(spec.x)}. Up: ${esc(spec.y)}.${spec.q ? ` Quadrants: top left ${esc(spec.q[0])}; top right ${esc(spec.q[1])}; bottom left ${esc(spec.q[2])}; bottom right ${esc(spec.q[3])}.` : ''}</p>` + li(spec.points.map(p => `${esc(p.t)}: ${p.x >= 0.5 ? 'more' : 'less'} ${esc(spec.x.toLowerCase())}, ${p.y >= 0.5 ? 'more' : 'less'} ${esc(spec.y.toLowerCase())}`));
      case 'curve': return `<p>${esc(spec.alt)}</p>${spec.band ? `<p class="small muted">Shaded band: ${esc(spec.band.t)}.</p>` : ''}` + (spec.beats && spec.beats.length ? li(spec.beats.map(b => esc(b.t))) : '');
      case 'economy': return li(spec.nodes.map(n => `<b>${esc(n.t)}</b> (${esc(n.type)})${n.d ? ': ' + esc(n.d) : ''}`)) + `<p class="small muted">Flows:</p>` + li(flows(spec.edges));
      case 'state': return li(spec.states.map(s => td(s.t, s.d) + (s.id === spec.start ? ' (start)' : ''))) + `<p class="small muted">Transitions:</p>` + li(flows(spec.edges));
      case 'screen': return li(spec.regions.map(r => `${td(r.t, r.d)} <span class="muted">(${pos(r)})</span>`));
      case 'flow': return li(spec.steps.map(s => td(s.t, s.d)));
    }
    return '';
  }

  // MAX_W: the widest canvas the layout checker accepts (a two-way flow is 412).
  return { layout, render, describe, MAX_W: 420 };
})();
