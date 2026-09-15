/* =====================================================================
   HORIZONTAL COLLAPSIBLE MIND MAP
   The radial map was replaced because a circle cannot hold names as the
   content grows. This is a tidy horizontal tree (the structure XMind and
   d3.tree use): the root sits on the left, domains on the next layer, and
   a domain's topics on the third layer while it is open. The selected
   topic grows a fourth layer of smaller leaf nodes: the concepts it
   relates to, the smells it helps diagnose and the tools it points to.
   Nodes are labelled cards, always readable, and the layout grows by
   stacking and panning, not by shrinking. Coordinates are centred on (0,0)
   per row and the caller fits the viewBox.

   Cross-branch links are drawn as faint dashed curves, matching the old
   radial map: domain <-> domain, an open topic -> a related topic's
   domain, and a leaf -> its home domain. They carry a title so hovering an
   edge names the relationship; the app's hover handler highlights the
   edges attached to the hovered node using data-a / data-b node keys.

   Two maps are built from the same layout code. `build` draws the domain
   map (the guide). `buildProject` draws one case study as a project: the
   project title in the middle, its systems where the domains sit, their
   parts where the topics sit, and the guide topics a part demonstrates as
   leaves. Node kinds stay center|domain|topic|leaf so the CSS is shared;
   project nodes carry data-scope="project" and keys sys:<id> / part:<id>.
   ===================================================================== */
window.PlayableGraph = (function(){
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const SIZE = { root:{ w:330, h:74 }, domain:{ w:262, h:46 }, topic:{ w:300, h:34 }, leaf:{ w:236, h:30 } };
  const COL = 340, VGAP = 30, PAD = 40;

  const cut = (s, n) => s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
  // Longest label that fits the node's inner width. Derived from the same
  // per-character estimate the layout checker uses, so the text is only
  // shortened when it would actually not fit the card.
  const maxFor = (w, fs) => Math.max(4, Math.floor((w - 26) / (fs * 0.56)));
  // Horizontal-tangent cubic between two points; dx is how far the control
  // points sit from each end (negative to bow left, as the cross links do).
  const link = (ax, ay, bx, by, dx) => `M${ax},${ay} C${ax + dx},${ay} ${bx + dx},${by} ${bx},${by}`;
  const smooth = (ax, ay, bx, by) => `M${ax},${ay} C${(ax + bx) / 2},${ay} ${(ax + bx) / 2},${by} ${bx},${by}`;

  const LEAF_KINDS = { leaf:'leaf', smell:'smell', view:'view' };
  const innerX = n => n.side < 0 ? n.x + n.w : n.x;   // edge facing the root

  const DKEY = n => n.kind === 'center' ? 'c' : n.kind === 'domain' ? 'd:' + n.id : n.kind === 'topic' ? 't:' + n.id : 'l:' + n.id;
  const PKEY = n => n.kind === 'center' ? 'c' : n.kind === 'domain' ? 'sys:' + n.id : n.kind === 'topic' ? 'part:' + n.id : 'l:' + n.id;

  /* ---- shared layout: two-sided tidy tree + dragged-node offsets ---- */
  // The root's children split into two balanced groups, one on each side of
  // the root, so cross links fan out instead of piling up. A dragged node
  // nudges its whole branch, so descendants inherit the offset and the
  // edges keep following the nodes.
  function place(root, off, keyOf){
    root.side = 0;
    const half = Math.ceil(root.children.length / 2);
    root.children.forEach((node, i) => { node.side = i < half ? 1 : -1; });
    const xFor = (n, depth) => n.side < 0 ? -(depth * COL) - n.w : depth * COL;
    const cursors = { '1': 0, '-1': 0 };
    const assign = (n, depth) => {
      n.depth = depth;
      n.x = n.kind === 'center' ? -n.w / 2 : xFor(n, depth);
      if(n.kind !== 'center') n.children.forEach(c => { c.side = n.side; });
      if(!n.children.length){ const c = cursors[n.side] || 0; n.y = c; cursors[n.side] = c + n.h + VGAP; }
      else {
        const ys = []; n.children.forEach(c => { assign(c, depth + 1); ys.push(c.y); });
        n.y = (ys[0] + ys[ys.length - 1]) / 2;
        const span = ys[ys.length - 1] - ys[0];
        if(span < n.h){ const c = cursors[n.side] || 0; cursors[n.side] = c + (n.h - span) + VGAP; }
      }
      n.lx = n.x; n.ly = n.y;
    };
    assign(root, 0);
    // centre each side on the root so it sits between the two groups
    const shiftSide = s => {
      const list = []; const collectSide = n => { list.push(n); n.children.forEach(collectSide); };
      root.children.filter(n => n.side === s).forEach(collectSide);
      if(!list.length) return;
      const top = Math.min(...list.map(n => n.y - n.h / 2)), bot = Math.max(...list.map(n => n.y + n.h / 2));
      const mid = (top + bot) / 2;
      list.forEach(n => { n.y -= mid; n.ly -= mid; });
    };
    shiftSide(1); shiftSide(-1);
    root.y = 0; root.ly = 0;
    const applyOff = (n, px, py) => {
      const o = off[keyOf(n)];
      n.dx = px + (o ? o.x : 0); n.dy = py + (o ? o.y : 0);
      n.x = n.lx + n.dx; n.y = n.ly + n.dy;
      n.children.forEach(c => applyOff(c, n.dx, n.dy));
    };
    applyOff(root, 0, 0);
  }

  /* ---- shared emit: walk the placed tree into nodes, edges and extents ---- */
  function collect(root, keyOf){
    const nodes = [], byKey = {}, edges = [], xs = [], ys = [];
    const walk = (n, parent) => {
      nodes.push(n); byKey[keyOf(n)] = n; xs.push(n.x, n.x + n.w); ys.push(n.y - n.h / 2, n.y + n.h / 2);
      if(parent){
        const sx = n.side < 0 ? parent.x : parent.x + parent.w, sy = parent.y;
        const ex = innerX(n), ey = n.y, mx = sx + (ex - sx) / 2;
        const ext = LEAF_KINDS[n.kind] ? ' ext' : '';
        edges.push(`<path class="edge ${parent.open ? 'open' : ''}${ext}" data-a="${keyOf(parent)}" data-b="${keyOf(n)}" d="M${sx},${sy} C${mx},${sy} ${mx},${ey} ${ex},${ey}"/>`);
      }
      n.children.forEach(c => walk(c, n));
    };
    walk(root, null);
    return { nodes, byKey, edges, xs, ys };
  }

  function mark(n, keyOf, scope){
    const x = n.x, y = n.y - n.h / 2, left = n.side < 0, dc = n.color ? ` style="--dc:${n.color}"` : '';
    const cls = n.kind === 'center' ? 'center' : n.kind === 'domain' ? (n.open ? 'domain open' : 'domain') : n.kind === 'topic' ? (n.seen ? 'topic seen' : 'topic') : ('leaf ' + n.kind);
    const fs = n.kind === 'center' ? 15 : n.kind === 'domain' ? 14 : n.kind === 'topic' ? 13 : 12;
    const tx = left ? x + n.w - 14 : x + 14, ty = n.sub ? n.y - 2 : n.y + 4, anchor = left ? 'end' : 'start';
    const why = n.why ? ` data-why="${esc(n.why)}"` : '';
    const sc = scope ? ` data-scope="${scope}"` : '';
    let g = `<g class="node ${cls}" data-key="${keyOf(n)}"${sc} data-kind="${n.kind}" data-id="${n.id}"${why}${dc}>`;
    g += `<rect class="disc" x="${x}" y="${y}" width="${n.w}" height="${n.h}" rx="3"/>`;
    if(n.kind === 'domain') g += `<text class="glyph" x="${left ? x + 16 : x + n.w - 16}" y="${n.y + 4}" text-anchor="middle" font-size="12">${n.open ? '−' : '+'}</text>`;
    g += `<text class="lbl" x="${tx}" y="${ty}" text-anchor="${anchor}" font-size="${fs}">${esc(cut(n.label, maxFor(n.w, fs)))}</text>`;
    if(n.sub) g += `<text class="lbl sub" x="${tx}" y="${n.y + 14}" text-anchor="${anchor}" font-size="9.5">${esc(cut(n.sub, maxFor(n.w, 9.5)))}</text>`;
    g += `</g>`;
    return g;
  }

  function frame(c, keyOf, scope){
    const inner = `<g class="lay guides"></g><g class="lay edges">${c.edges.join('')}</g><g class="lay nodes">${c.nodes.map(n => mark(n, keyOf, scope)).join('')}</g>`;
    const bbox = { x: Math.min(...c.xs) - PAD, y: Math.min(...c.ys) - PAD, w: Math.max(...c.xs) - Math.min(...c.xs) + PAD * 2, h: Math.max(...c.ys) - Math.min(...c.ys) + PAD * 2 };
    return { inner, bbox };
  }

  /* ---- the guide map: goal, domains, topics, leaves ---- */
  function build(state, seen, views){
    views = views || {};
    const dcolor = id => { const d = DOMAINS.find(x => x.id === id); return d ? d.color : 'var(--accent)'; };
    const dtitle = id => { const d = DOMAINS.find(x => x.id === id); return d ? d.t : id; };

    const root = { kind:'center', id:'root', label:'Make something people want to play', w:SIZE.root.w, h:SIZE.root.h, children:[] };
    let sel = null;
    DOMAINS.forEach(d => {
      const sn = d.topics.filter(t => seen.has(t)).length;
      const node = { kind:'domain', id:d.id, label:d.t, sub:`${sn}/${d.topics.length} read`, color:d.color, open:state.dom === d.id, w:SIZE.domain.w, h:SIZE.domain.h, children:[] };
      if(state.dom === d.id) d.topics.forEach(t => {
        const tn = { kind:'topic', id:t, label:TOPICS[t].t, color:d.color, seen:seen.has(t), w:SIZE.topic.w, h:SIZE.topic.h, children:[] };
        if(state.topic === t) sel = tn;
        node.children.push(tn);
      });
      root.children.push(node);
    });

    // fourth layer: the selected topic's related concepts, smells and tools.
    // `state.extra` carries runtime-only leaves (the project parts that
    // demonstrate this topic); they render exactly like a tool leaf.
    if(sel){
      const t = TOPICS[state.topic] || {};
      (t.rel || []).forEach(([rid, why]) => {
        const rt = TOPICS[rid];
        if(rt) sel.children.push({ kind:'leaf', id:rid, label:rt.t, color:dcolor(rt.d), why, home:rt.d, w:SIZE.leaf.w, h:SIZE.leaf.h, children:[] });
        else sel.children.push({ kind:'view', id:rid, label:(views[rid] ? views[rid][1] : rid), why, w:SIZE.leaf.w, h:SIZE.leaf.h, children:[] });
      });
      SMELLS.filter(s => s.causes.some(c => c.top === state.topic)).slice(0, 4)
        .forEach(s => sel.children.push({ kind:'smell', id:s.id, label:`! ${s.t}`, color:'var(--bad)', why:s.sym, w:SIZE.leaf.w, h:SIZE.leaf.h, children:[] }));
      (state.extra || []).forEach(([vid, why]) => sel.children.push({ kind:'view', id:vid, label:(views[vid] ? views[vid][1] : vid), why, w:SIZE.leaf.w, h:SIZE.leaf.h, children:[] }));
    }

    place(root, state.off || {}, DKEY);
    const c = collect(root, DKEY);

    // cross-branch links: faint dashed curves that leave the tree. Same-side
    // links bow away from the goal; cross-side links pass under it.
    DOMAINS.forEach(d => (d.links || []).forEach(([to, why]) => {
      const a = c.byKey['d:' + d.id], b = c.byKey['d:' + to];
      if(!a || !b) return;
      const path = a.side === b.side ? link(innerX(a), a.y, innerX(b), b.y, -a.side * 55) : smooth(innerX(a), a.y, innerX(b), b.y);
      c.edges.push(`<path class="edge dd" data-a="d:${d.id}" data-b="d:${to}" d="${path}"><title>${esc(why)}</title></path>`);
    }));
    if(state.dom){
      (DOMAINS.find(d => d.id === state.dom).topics || []).forEach(tid => {
        const tn = c.byKey['t:' + tid]; if(!tn) return;
        (TOPICS[tid].rel || []).forEach(([rid, why]) => {
          const rt = TOPICS[rid]; if(!rt || rt.d === state.dom) return;
          const dn = c.byKey['d:' + rt.d]; if(!dn) return;
          c.edges.push(`<path class="edge cross" data-a="t:${tid}" data-b="d:${rt.d}" d="${smooth(innerX(tn), tn.y, innerX(dn), dn.y)}"><title>${esc(rt.t)}: ${esc(why)}</title></path>`);
        });
      });
    }
    if(sel) sel.children.filter(l => l.home && l.home !== state.dom).forEach(l => {
      const dn = c.byKey['d:' + l.home]; if(!dn) return;
      c.edges.push(`<path class="edge home" data-a="l:${l.id}" data-b="d:${l.home}" d="${smooth(innerX(l), l.y, innerX(dn), dn.y)}"><title>${esc(l.label)} lives in ${esc(dtitle(l.home))}</title></path>`);
    });

    const f = frame(c, DKEY, '');
    return { inner:f.inner, bbox:f.bbox, focus:null, nodes:c.nodes };
  }

  /* ---- the project map: one case study as systems and parts ---- */
  // `state` is { sys, part, off }. Parts appear while their system is open,
  // leaves while a part is selected. Leaf -> home domain edges are not drawn
  // here because no domain node is on this map to draw them to.
  function buildProject(cs, state, T, D){
    state = state || {};
    T = T || (typeof TOPICS === 'undefined' ? {} : TOPICS);
    D = D || (typeof DOMAINS === 'undefined' ? [] : DOMAINS);
    const dcolor = id => { const d = D.find(x => x.id === id); return d ? d.color : 'var(--accent)'; };
    const systems = cs.systems || [], flows = cs.flows || [];
    // The root names the project by its codename, so the descriptive line has
    // to travel with it. The system count joins it only when both fit inside
    // the card; otherwise the description wins, because the count is also on
    // every system node.
    const count = `${systems.length} system${systems.length === 1 ? '' : 's'}`;
    const both = cs.sub ? `${cs.sub} · ${count}` : count;
    const rootSub = cs.sub && both.length > maxFor(SIZE.root.w, 9.5) ? cs.sub : both;
    const root = { kind:'center', id:cs.id, label:cs.t, sub:rootSub, w:SIZE.root.w, h:SIZE.root.h, children:[] };
    let sel = null, open = null;
    systems.forEach(s => {
      const color = (typeof KIND_COLOR === 'undefined' ? null : KIND_COLOR[s.kind]) || 'var(--accent2)';
      const parts = s.parts || [];
      const node = { kind:'domain', id:s.id, label:s.t, sub:`${parts.length} part${parts.length === 1 ? '' : 's'}`, color, open:state.sys === s.id, w:SIZE.domain.w, h:SIZE.domain.h, children:[] };
      if(state.sys === s.id){
        open = s;
        parts.forEach(p => {
          const pn = { kind:'topic', id:p.id, label:p.t, color, w:SIZE.topic.w, h:SIZE.topic.h, children:[] };
          if(state.part === p.id) sel = pn;
          node.children.push(pn);
        });
      }
      root.children.push(node);
    });
    // One extra branch beside the systems: the project's workflow charts. It
    // behaves like a system node (open on state.sys === 'workflows') and its
    // children are the flows, which is why 'workflows' is a reserved system id.
    if(flows.length){
      const node = { kind:'domain', id:'workflows', label:'Workflows', sub:`${flows.length} flow${flows.length === 1 ? '' : 's'}`, color:'var(--accent2)', open:state.sys === 'workflows', w:SIZE.domain.w, h:SIZE.domain.h, children:[] };
      if(state.sys === 'workflows') flows.forEach(f => node.children.push({ kind:'topic', id:f.id, label:f.t, color:'var(--accent2)', w:SIZE.topic.w, h:SIZE.topic.h, children:[] }));
      root.children.push(node);
    }
    if(sel && open){
      const p = (open.parts || []).find(x => x.id === state.part) || {};
      (p.rel || []).forEach(([rid, why]) => {
        const rt = T[rid];
        sel.children.push({ kind:'leaf', id:rid, label:rt ? rt.t : rid, color:rt ? dcolor(rt.d) : 'var(--accent)', why, w:SIZE.leaf.w, h:SIZE.leaf.h, children:[] });
      });
    }

    place(root, state.off || {}, PKEY);
    const c = collect(root, PKEY);

    // a part's dependencies on other parts, drawn like the domain map's
    // cross links. Both ends only exist while the system holding them is open.
    systems.forEach(s => (s.parts || []).forEach(p => (p.links || []).forEach(([pid, why]) => {
      const a = c.byKey['part:' + p.id], b = c.byKey['part:' + pid];
      if(!a || !b) return;
      const path = a.side === b.side ? link(innerX(a), a.y, innerX(b), b.y, -a.side * 55) : smooth(innerX(a), a.y, innerX(b), b.y);
      c.edges.push(`<path class="edge cross" data-a="part:${p.id}" data-b="part:${pid}" d="${path}"><title>${esc(p.t)}: ${esc(why)}</title></path>`);
    })));

    const f = frame(c, PKEY, 'project');
    return { inner:f.inner, bbox:f.bbox, focus:null, nodes:c.nodes };
  }

  /* ---- reverse index: guide topic -> the project parts that show it ---- */
  // One traversal serves three consumers: the "Seen in practice" chips on a
  // topic page (`hits`), the runtime view links the map leaves travel
  // through (`views`), and the capped leaf list the domain map and the
  // layout checker both render (`extra`). The cap keeps the fourth layer
  // from growing past what the overlap checker allows.
  function practiceLinks(cases, cap){
    cap = cap || 2;
    const hits = {}, views = {}, extra = {};
    (cases || []).forEach(c => (c.systems || []).forEach(s => (s.parts || []).forEach(p => (p.rel || []).forEach(([tid, why]) => {
      const vid = `exp:${c.id}/${s.id}/${p.id}`;
      views[vid] = [`#/experience/${c.id}/${s.id}/${p.id}`, `◆ ${p.t}`, c.t];
      (hits[tid] || (hits[tid] = [])).push({ cs:c, sys:s, part:p, why, vid });
      const list = extra[tid] || (extra[tid] = []);
      if(list.length < cap) list.push([vid, why]);
    }))));
    return { hits, views, extra };
  }

  return { build, buildProject, practiceLinks };
})();
