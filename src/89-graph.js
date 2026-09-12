/* =====================================================================
   HORIZONTAL COLLAPSIBLE MIND MAP
   The radial map was replaced because a circle cannot hold names as the
   content grows. This is a tidy horizontal tree (the structure XMind and
   d3.tree use): the root sits on the left, domains on the next layer, and
   a domain's topics on the third layer only while it is open. Nodes are
   labelled cards, always readable, and the layout grows by stacking and
   panning, not by shrinking. Coordinates are centred on (0,0) per row and
   the caller fits the viewBox.
   ===================================================================== */
window.PlayableGraph = (function(){
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const SIZE = { root:{ w:280, h:74 }, domain:{ w:262, h:46 }, topic:{ w:300, h:34 } };
  const COL = 340, VGAP = 11, PAD = 40;

  const cut = (s, n) => s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
  const maxFor = kind => kind === 'root' ? 30 : kind === 'domain' ? 24 : 36;

  function build(state, seen){
    const root = { kind:'center', id:'root', label:'Make something people want to play', w:SIZE.root.w, h:SIZE.root.h, children:[] };
    DOMAINS.forEach(d => {
      const sn = d.topics.filter(t => seen.has(t)).length;
      const node = { kind:'domain', id:d.id, label:d.t, sub:`${sn}/${d.topics.length} read`, color:d.color, open:state.dom === d.id, w:SIZE.domain.w, h:SIZE.domain.h, children:[] };
      if(state.dom === d.id) d.topics.forEach(t => node.children.push({ kind:'topic', id:t, label:TOPICS[t].t, color:d.color, seen:seen.has(t), w:SIZE.topic.w, h:SIZE.topic.h, children:[] }));
      root.children.push(node);
    });

    // tidy vertical layout: leaves take the next slot, parents centre on their children
    let cursor = 0;
    const assign = (n, depth) => {
      n.x = depth * COL;
      if(!n.children.length){ n.y = cursor; cursor += n.h + VGAP; }
      else {
        const ys = []; n.children.forEach(c => { assign(c, depth + 1); ys.push(c.y); });
        n.y = (ys[0] + ys[ys.length - 1]) / 2;
        const span = ys[ys.length - 1] - ys[0];
        if(span < n.h) cursor += (n.h - span) + VGAP;
      }
    };
    assign(root, 0);

    const nodes = [], edges = [], xs = [], ys = [];
    const walk = (n, parent) => {
      nodes.push(n); xs.push(n.x, n.x + n.w); ys.push(n.y - n.h / 2, n.y + n.h / 2);
      if(parent){
        const sx = parent.x + parent.w, sy = parent.y, ex = n.x, ey = n.y, mx = sx + (ex - sx) / 2;
        edges.push(`<path class="edge ${parent.open ? 'open' : ''}" data-key="e:${parent.id}>${n.id}" d="M${sx},${sy} H${mx} V${ey} H${ex}"/>`);
      }
      n.children.forEach(c => walk(c, n));
    };
    walk(root, null);

    const mark = (n) => {
      const x = n.x, y = n.y - n.h / 2, dc = n.color ? ` style="--dc:${n.color}"` : '';
      const cls = n.kind === 'center' ? 'center' : n.kind === 'domain' ? (n.open ? 'domain open' : 'domain') : (n.seen ? 'topic seen' : 'topic');
      const fs = n.kind === 'center' ? 15 : n.kind === 'domain' ? 14 : 13;
      const tx = x + 14, ty = n.sub ? n.y - 2 : n.y + 4;
      let g = `<g class="node ${cls}" data-key="${n.kind === 'center' ? 'c' : (n.kind === 'domain' ? 'd:' : 't:') + n.id}" data-kind="${n.kind}" data-id="${n.id}"${dc}>`;
      g += `<rect class="disc" x="${x}" y="${y}" width="${n.w}" height="${n.h}" rx="3"/>`;
      if(n.kind === 'domain') g += `<text class="glyph" x="${x + n.w - 16}" y="${n.y + 4}" text-anchor="middle" font-size="12">${n.open ? '−' : '+'}</text>`;
      g += `<text class="lbl" x="${tx}" y="${ty}" text-anchor="start" font-size="${fs}">${esc(cut(n.label, maxFor(n.kind)))}</text>`;
      if(n.sub) g += `<text class="lbl sub" x="${tx}" y="${n.y + 14}" text-anchor="start" font-size="9.5">${esc(n.sub)}</text>`;
      g += `</g>`;
      return g;
    };

    const inner = `<g class="lay guides"></g><g class="lay edges">${edges.join('')}</g><g class="lay nodes">${nodes.map(mark).join('')}</g>`;
    const bbox = { x: Math.min(...xs) - PAD, y: Math.min(...ys) - PAD, w: Math.max(...xs) - Math.min(...xs) + PAD * 2, h: Math.max(...ys) - Math.min(...ys) + PAD * 2 };
    return { inner, bbox, focus:null, nodes };
  }
  return { build };
})();
