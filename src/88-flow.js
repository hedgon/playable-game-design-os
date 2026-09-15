/* =====================================================================
   WORKFLOW CHARTS
   One generic renderer for the flows attached to a project by FLOWS(). A
   flow is a small directed acyclic graph of steps; this draws it as a
   layered chart in the same visual language as the mind map: labelled cards
   joined by curves, CSS variables only, no images.

   Layout. A step sits in the RANK of its longest path from steps[0], so a
   step never comes before something it depends on and the chart reads in
   the order the work actually happens. Steps sharing a rank are laid out in
   data order and the group is centred on the chart's middle line, so a
   branch fans out symmetrically. Nothing here is random or time dependent:
   the same flow always produces the same boxes, which is what lets the
   layout checker AABB-test the cards in node.

   Direction. 'v' (the default, and what the app renders) puts a rank on a
   row and reads top to bottom, sized so that a two way branch fits the
   content pane at phone width without sideways scrolling. 'h' puts a rank
   in a column and reads left to right; it is kept because it is the shape
   a wide screen wants, and either direction can be laid out and checked.

   `layout(flow, dir)` returns the geometry ({ w, h, nodes, edges }) and is
   what the checker calls. `render(flow, colorOf, dir)` returns the SVG
   string and is what the app calls; `colorOf(sysId)` supplies the card's
   accent so a step is coloured by the system it belongs to.
   ===================================================================== */
window.PlayableFlow = (function(){
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Vertical is sized so a two way branch (2 cards + the gap + both pads)
  // is 412px, which fits the content pane inside a 375px phone drawer with
  // only a slight scale down. Horizontal keeps the wider card.
  const DIM = {
    v: { W:184, H:44, HGAP:20, VGAP:34, PAD:12 },
    h: { W:220, H:44, HGAP:92, VGAP:26, PAD:20 }
  };
  const FS = 12.5, LFS = 9.5;
  // Same per-character estimate the map's label fitting uses, so a title is
  // only broken or shortened when it would really not fit the card.
  const charsFor = W => Math.floor((W - 24) / (FS * 0.56));

  // Break a title into at most two lines on a word boundary, shortening the
  // second line rather than letting it run past the card.
  function lines(t, chars){
    const words = String(t || '').split(/\s+/).filter(Boolean);
    const out = [''];
    for(const word of words){
      const line = out[out.length - 1];
      const next = line ? line + ' ' + word : word;
      if(next.length <= chars || !line) out[out.length - 1] = next;
      else if(out.length < 2) out.push(word);
      else out[1] = out[1] + ' ' + word;
    }
    out.forEach((l, i) => { if(l.length > chars) out[i] = l.slice(0, chars - 1).trimEnd() + '…'; });
    return out.filter(Boolean);
  }

  // Rank of every step: the longest path from steps[0]. On an acyclic graph
  // whose every node is reachable from the first, relaxing each edge forward
  // settles in at most |steps| passes.
  function ranks(steps, live){
    const rank = {};
    steps.forEach(s => { rank[s.id] = 0; });
    for(let pass = 0; pass < steps.length; pass++){
      let moved = false;
      live.forEach(([a, b]) => { if(rank[b] < rank[a] + 1){ rank[b] = rank[a] + 1; moved = true; } });
      if(!moved) break;
    }
    const groups = [];
    steps.forEach(s => { const r = rank[s.id]; (groups[r] || (groups[r] = [])).push(s); });
    return groups;
  }

  function layout(flow, dir){
    dir = dir === 'h' ? 'h' : 'v';
    const D = DIM[dir];
    const steps = (flow && flow.steps) || [], edges = (flow && flow.edges) || [];
    const known = {};
    steps.forEach(s => { known[s.id] = true; });
    const live = edges.filter(([a, b]) => known[a] && known[b] && a !== b);
    const groups = ranks(steps, live);
    const widest = groups.reduce((n, g) => Math.max(n, g ? g.length : 0), 0);
    // "main" runs along the reading direction, "cross" across it.
    const mainPitch = dir === 'v' ? D.H + D.VGAP : D.W + D.HGAP;
    const crossPitch = dir === 'v' ? D.W + D.HGAP : D.H + D.VGAP;
    // Card extent across the reading direction: its width when reading down,
    // its height when reading right.
    const crossCard = dir === 'v' ? D.W : D.H;
    const crossSize = (widest - 1) * crossPitch + crossCard;
    const mainSize = (groups.length - 1) * mainPitch + (dir === 'v' ? D.H : D.W);
    const nodes = [], byId = {};
    groups.forEach((list, r) => {
      const span = (list.length - 1) * crossPitch + crossCard;
      const start = D.PAD + (crossSize - span) / 2;
      list.forEach((s, i) => {
        const along = D.PAD + r * mainPitch;
        const across = start + i * crossPitch;
        const n = { id:s.id, t:s.t, d:s.d, sys:s.sys || null, rank:r, at:i,
          x: dir === 'v' ? across : along, y: dir === 'v' ? along : across, w:D.W, h:D.H };
        n.cx = n.x + D.W / 2; n.cy = n.y + D.H / 2;
        nodes.push(n); byId[s.id] = n;
      });
    });
    // Edges leave the trailing edge of a card and enter the leading edge of
    // the next, so the curve's tangents are along the reading direction. The
    // midpoint of that cubic is the arithmetic midpoint of its two ends,
    // which is where an edge label sits.
    const out = live.map(([a, b, label]) => {
      const A = byId[a], B = byId[b];
      const p = dir === 'v'
        ? { x1:A.cx, y1:A.y + A.h, x2:B.cx, y2:B.y }
        : { x1:A.x + A.w, y1:A.cy, x2:B.x, y2:B.cy };
      return Object.assign({ a, b, label: label || '' }, p, { mx:(p.x1 + p.x2) / 2, my:(p.y1 + p.y2) / 2 });
    });
    return {
      dir,
      w: D.PAD * 2 + (dir === 'v' ? crossSize : mainSize),
      h: D.PAD * 2 + (dir === 'v' ? mainSize : crossSize),
      chars: charsFor(D.W), nodes, edges: out, byId
    };
  }

  function render(flow, colorOf, dir){
    const g = layout(flow, dir);
    const arrow = 'fa-' + String(flow.id || 'flow').replace(/[^\w-]/g, '');
    const paths = g.edges.map(e => {
      const d = g.dir === 'v'
        ? `M${e.x1},${e.y1} C${e.x1},${e.my} ${e.x2},${e.my} ${e.x2},${e.y2}`
        : `M${e.x1},${e.y1} C${e.mx},${e.y1} ${e.mx},${e.y2} ${e.x2},${e.y2}`;
      return `<path class="fedge" d="${d}" marker-end="url(#${arrow})"/>`;
    }).join('');
    const labels = g.edges.filter(e => e.label).map(e => {
      const w = e.label.length * LFS * 0.62 + 12;
      return `<g class="flabel"><rect x="${(e.mx - w / 2).toFixed(1)}" y="${(e.my - 8).toFixed(1)}" width="${w.toFixed(1)}" height="16" rx="2"/>`
        + `<text x="${e.mx.toFixed(1)}" y="${(e.my + 3.5).toFixed(1)}" text-anchor="middle" font-size="${LFS}">${esc(e.label)}</text></g>`;
    }).join('');
    // The number on a card is its position in the data, so it matches the
    // numbered step list under the chart rather than the layout order.
    const order = {};
    (flow.steps || []).forEach((s, i) => { order[s.id] = i + 1; });
    const cards = g.nodes.map(n => {
      const dc = (colorOf && colorOf(n.sys)) || 'var(--accent2)';
      const ls = lines(n.t, g.chars);
      const text = ls.length > 1
        ? `<text class="flbl" x="${n.cx}" y="${(n.cy - 3).toFixed(1)}" text-anchor="middle" font-size="${FS}"><tspan x="${n.cx}">${esc(ls[0])}</tspan><tspan x="${n.cx}" dy="14">${esc(ls[1])}</tspan></text>`
        : `<text class="flbl" x="${n.cx}" y="${(n.cy + 4.5).toFixed(1)}" text-anchor="middle" font-size="${FS}">${esc(ls[0] || '')}</text>`;
      return `<g class="flownode" data-step="${esc(n.id)}" style="--dc:${dc}"><title>${esc(n.d)}</title>`
        + `<rect class="fdisc" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="3"/>`
        + `<text class="fnum" x="${n.x + 8}" y="${(n.y + 13).toFixed(1)}" font-size="9.5">${order[n.id] || ''}</text>`
        + text + `</g>`;
    }).join('');
    // max-width pins the chart at 1:1 on a wide pane and lets a narrow one
    // scale it down, which is why there is no min-width and no side scroll.
    return `<svg class="flowsvg" viewBox="0 0 ${g.w.toFixed(0)} ${g.h.toFixed(0)}" style="max-width:${g.w.toFixed(0)}px" role="img" aria-label="${esc(flow.t || 'Workflow')}">`
      + `<defs><marker id="${arrow}" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto"><path class="farrow" d="M0,0 L7,3 L0,6 Z"/></marker></defs>`
      + `<g class="lay edges">${paths}</g><g class="lay labels">${labels}</g><g class="lay nodes">${cards}</g></svg>`;
  }

  return { render, layout };
})();
