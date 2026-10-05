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

   Three maps are built from the same layout code. `build` draws the domain
   map (the guide). `buildProject` draws one case study as a project: the
   project title in the middle, its systems where the domains sit, their
   parts where the topics sit, and the guide topics a part demonstrates as
   leaves. `buildPath` draws one learning path as stages and steps. Node
   kinds stay center|domain|topic|leaf|group|item so the CSS is shared;
   project nodes carry data-scope="project" and keys sys:<id> / part:<id>,
   path nodes data-scope="path" and keys stage:<id> / step:<id>.
   Every node is a tree item (role="treeitem" with its level, position and
   expanded state) so the flat SVG reads as the tree it is; the phone outline
   in 91-map.js is built from the same nodes.
   ===================================================================== */
window.PlayableGraph = (function(){
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Sizes are graph units. The domain layer is compact (one card per 44 units)
  // so a lens of fourteen domains fits a 600 px stage at a readable size.
  const SIZE = { root:{ w:220, h:74 }, domain:{ w:250, h:36 }, topic:{ w:300, h:34 }, group:{ w:176, h:28 }, leaf:{ w:236, h:26 } };
  const PAD = 12;
  // The horizontal gap between a node and its parent, and the vertical gap
  // after a node, by kind. Columns follow the widths above, not a fixed step.
  // From docs/program-2026-10/research/map-layout.md: a level gap about 1.8 to 2
  // times the old one leaves room for the edges to fan out one per child,
  // and sibling gaps of 8 to 10 match the tool defaults for boxed cards (4 sat
  // nearer than any of them). A phone's stage has no width to spare, so it keeps
  // narrow columns and spends its slack vertically.
  // The two leaf-level gaps stay at 48 (research said 64): a group holds six
  // leaves or fewer, so its fan is short, and at 48 a selected topic with its
  // groups and leaves fits a 1440 px screen's map pane whole at the label floor.
  const GAP_X = { domain:80, topic:104, group:48, leaf:48, item:48 };
  const GAP_X_PHONE = { domain:20, topic:24, group:20, leaf:20, item:20 };
  const GAP_Y = { domain:8, topic:10, group:8, leaf:8, item:8, center:8 };
  // a phone's first view must hold the root and every domain at the 11 px floor, so its domain column stays tight
  const GAP_Y_PHONE = Object.assign({}, GAP_Y, { domain:4 });
  // Card widths for a one-sided tree: a phone (about 350 px) needs the narrowest
  // cards; a desktop pane too narrow for two sides (about 560 to 1,060 px) keeps
  // cards a little narrower than the two-sided map so the wider gaps still fit.
  const CAP_PHONE = { center:190, domain:150, topic:190 };
  const CAP_PANE = { center:210, domain:200, topic:210 };
  // A group of leaves with more than this many starts collapsed.
  const GROUP_OPEN = 6;

  const fontOf = n => n.kind === 'center' ? 15 : n.kind === 'domain' ? 14 : (n.kind === 'topic' || n.kind === 'group') ? 13 : 12;
  const lineGap = fs => Math.round(fs * 1.25);
  // A label that does not fit one line wraps at word breaks onto as many
  // lines as it needs; nothing is shortened (owner, 2026-09-29: no cap may
  // cut content). A single word longer than a line is broken, not cut.
  const wrap = (s, n) => {
    if(s.length <= n) return [s];
    const lines = []; let a = '';
    for(const w of s.split(' ')){
      a = !a ? w : a.length + 1 + w.length <= n ? a + ' ' + w : (lines.push(a), w);
      while(a.length > n){ lines.push(a.slice(0, n)); a = a.slice(n); }
    }
    if(a) lines.push(a);
    return lines;
  };
  // Lines are fixed before layout, so a two-line card is taller and the tidy
  // tree spaces it like any other card.
  const fitLabels = n => {
    // a card with a mark on its right (a +/- glyph or a read mark) keeps its text clear of it
    const gut = (n.kind === 'domain' || n.kind === 'group' || typeof n.rd === 'boolean') ? 22 : 0;
    if(n.label){ const fs = fontOf(n); n.lines = wrap(n.label, maxFor(n.w - gut, fs)); n.h += (n.lines.length - 1) * lineGap(fs); }
    if(n.sub){ n.subLines = wrap(n.sub, maxForSub(n.w - gut)); n.h += (n.subLines.length - 1) * lineGap(12); }
    n.children.forEach(fitLabels);
  };
  // Longest line that fits the node's inner width, from the same
  // per-character estimate the layout checker uses. It sets where a label
  // wraps; nothing is ever cut.
  const maxFor = (w, fs) => Math.max(4, Math.floor((w - 26) / (fs * 0.56)));
  // Sub-labels are set in the monospace font, about 0.65 em a character with its spacing.
  const maxForSub = w => Math.max(4, Math.floor((w - 26) / (12 * 0.68)));
  // Horizontal-tangent cubic between two points; dx is how far the control
  // points sit from each end (negative to bow left, as the cross links do).
  const link = (ax, ay, bx, by, dx) => `M${ax},${ay} C${ax + dx},${ay} ${bx + dx},${by} ${bx},${by}`;
  const smooth = (ax, ay, bx, by) => `M${ax},${ay} C${(ax + bx) / 2},${ay} ${(ax + bx) / 2},${by} ${bx},${by}`;

  const LEAF_KINDS = { leaf:1, item:1, group:1 };
  const innerX = n => n.side < 0 ? n.x + n.w : n.x;   // edge facing the root
  const leafKey = n => 'l:' + (n.gid ? n.gid + ':' : '') + n.id;

  const DKEY = n => n.kind === 'center' ? 'c' : n.kind === 'domain' ? 'd:' + n.id : n.kind === 'topic' ? 't:' + n.id : n.kind === 'group' ? 'g:' + n.id : leafKey(n);
  const PKEY = n => n.kind === 'center' ? 'c' : n.kind === 'domain' ? 'sys:' + n.id : n.kind === 'topic' ? 'part:' + n.id : 'l:' + n.id;

  /* ---- shared layout: two-sided tidy tree + dragged-node offsets ---- */
  // The root's children split into two balanced groups, one on each side of
  // the root, so cross links fan out instead of piling up. A dragged node
  // nudges its whole branch, so descendants inherit the offset and the
  // edges keep following the nodes.
  // `root.oneSided` puts every branch on the right: on a phone, or in a desktop
  // pane too narrow for both halves, the map reads as columns instead of two
  // halves off both edges. `root.phone` narrows the cards and the gaps further.
  function place(root, off, keyOf){
    // one-sided, the root and a column, or an open branch and its children, must fit the stage at a readable size
    if(root.oneSided){ const cap = root.phone ? CAP_PHONE : CAP_PANE; const shrink = n => { if(cap[n.kind]) n.w = Math.min(n.w, cap[n.kind]); n.children.forEach(shrink); }; shrink(root); }
    fitLabels(root);
    root.side = 0;
    const half = Math.ceil(root.children.length / 2);
    root.children.forEach((node, i) => { node.side = root.oneSided || i < half ? 1 : -1; });
    // a column sits beside its parent's far edge, so a wide card pushes its children on
    const gaps = root.phone ? GAP_X_PHONE : GAP_X;
    const xFor = (n, p) => {
      const gap = gaps[n.kind] || 40;
      return n.side < 0 ? p.x - gap - n.w : p.x + p.w + gap;
    };
    const gapY = n => (root.phone ? GAP_Y_PHONE : GAP_Y)[n.kind] || 8;
    // `cursors` is the next free top edge in each column; a node sits at its
    // cursor, and a parent is centred on its children, pushed down if it is
    // taller than they are, so cards of any height never touch.
    const cursors = { '1': 0, '-1': 0 };
    const shift = (n, dy) => { n.y += dy; n.children.forEach(c => shift(c, dy)); };
    const assign = (n, depth, parent) => {
      n.depth = depth;
      n.x = n.kind === 'center' ? -n.w / 2 : xFor(n, parent);
      if(n.kind !== 'center') n.children.forEach(c => { c.side = n.side; });
      const start = cursors[n.side] || 0;
      if(!n.children.length){ n.y = start + n.h / 2; cursors[n.side] = start + n.h + gapY(n); return; }
      n.children.forEach(c => assign(c, depth + 1, n));
      n.y = (n.children[0].y + n.children[n.children.length - 1].y) / 2;
      if(n.kind === 'center') return;
      const top = n.y - n.h / 2;
      if(top < start){ const dy = start - top; shift(n, dy); cursors[n.side] += dy; }
      cursors[n.side] = Math.max(cursors[n.side] || 0, n.y + n.h / 2 + gapY(n));
    };
    assign(root, 0, null);
    const fin = n => { n.lx = n.x; n.ly = n.y; n.children.forEach(fin); };
    fin(root);
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
    const walk = (n, parent, pos, size) => {
      n.key = keyOf(n); n.pos = pos; n.set = size;   // the tree item's place among its siblings
      nodes.push(n); byKey[n.key] = n; xs.push(n.x, n.x + n.w); ys.push(n.y - n.h / 2, n.y + n.h / 2);
      if(parent){
        const sx = n.side < 0 ? parent.x : parent.x + parent.w, sy = parent.y;
        const ext = LEAF_KINDS[n.kind] ? ' ext' : '';
        edges.push(`<path class="edge ${parent.open ? 'open' : ''}${ext}" data-a="${keyOf(parent)}" data-b="${keyOf(n)}" d="${smooth(sx, sy, innerX(n), n.y)}"/>`);
      }
      n.children.forEach((c, i) => walk(c, n, i + 1, n.children.length));
    };
    walk(root, null, 1, 1);
    return { nodes, byKey, edges, xs, ys };
  }

  // The class list of a node, shared by the canvas card and the phone outline item.
  const classOf = n => n.kind === 'center' ? 'center'
    : n.kind === 'domain' ? 'domain' + (n.open ? ' open' : '') + (n.next ? ' next' : '')
    : n.kind === 'group' ? 'group' + (n.open ? ' open' : '')
    : n.kind === 'topic' ? 'topic' + (n.rd ? ' seen' : '') + (n.sel ? ' sel' : '') + (n.next ? ' next' : '')
    : n.kind === 'item' ? 'leaf item t-' + n.type
    : 'leaf' + (n.other ? ' other' : '') + (n.rd ? ' seen' : '');
  // The accessible name is the full label, then its state (read or not, next to
  // read) and what it is for, so none of it rests on colour or on hover.
  const nameOf = n => {
    let name = n.sub ? `${n.label}, ${n.sub}` : n.label;
    if(typeof n.rd === 'boolean') name += ', ' + (n.rd ? n.rdWord[0] : n.rdWord[1]);
    if(n.next) name += n.kind === 'domain' ? ', holds the next unread topic' : ', next unread';
    if(n.why) name += '. ' + n.why;
    return name;
  };
  // Everything a node carries besides its shape: the keys the app reads, the tree
  // item semantics (level, place among siblings, expanded state, selection) and
  // the name. Needs n.key, n.pos and n.set from `collect`.
  function attrs(n, scope){
    const dc = n.color ? ` style="--dc:${n.color}"` : '';
    const why = n.why ? ` data-why="${esc(n.why)}"` : '';
    const sc = scope ? ` data-scope="${scope}"` : '';
    const href = n.href ? ` data-href="${esc(n.href)}"` : '';
    const typ = n.kind === 'item' ? ` data-type="${n.type}"` : n.other ? ' data-type="other"' : '';
    // expandable: a domain, a group, or a topic showing its neighbourhood
    const expandable = n.kind === 'domain' || n.kind === 'group' || (n.kind === 'topic' && n.children.length);
    const expanded = expandable ? ` aria-expanded="${n.kind === 'topic' ? true : !!n.open}"` : '';
    return `data-key="${n.key}"${sc} data-kind="${n.kind}" data-id="${n.id}"${n.gid ? ` data-gid="${n.gid}"` : ''}${typ}${href}${why}${dc} tabindex="-1" role="treeitem" aria-level="${n.depth + 1}" aria-setsize="${n.set}" aria-posinset="${n.pos}" aria-selected="${!!n.sel}" aria-label="${esc(nameOf(n))}"${expanded}`;
  }

  function mark(n, keyOf, scope){
    const x = n.x, y = n.y - n.h / 2, left = n.side < 0;
    const cls = classOf(n), hasRd = typeof n.rd === 'boolean';
    const fs = fontOf(n), lines = n.lines || [n.label], extra = (lines.length - 1) * lineGap(fs);
    const subs = n.subLines || (n.sub ? [n.sub] : []), subExtra = subs.length ? (subs.length - 1) * lineGap(12) : 0;
    const tx = left ? x + n.w - 14 : x + 14, ty = (n.sub ? n.y - 3 : n.y + 4) - (extra + subExtra) / 2, anchor = left ? 'end' : 'start';
    let g = `<g class="node ${cls}" ${attrs(n, scope)}>`;
    g += `<rect class="disc" x="${x}" y="${y}" width="${n.w}" height="${n.h}" rx="0"/><rect class="fring" x="${x - 4}" y="${y - 4}" width="${n.w + 8}" height="${n.h + 8}" rx="0"/>`;
    const mx = left ? x + 16 : x + n.w - 16;
    if(n.kind === 'domain' || n.kind === 'group') g += `<text class="glyph" x="${mx}" y="${n.y + 4}" text-anchor="middle" font-size="12">${n.open ? '−' : '+'}</text>`;
    // read state: a ring for unread, a filled ring with a tick for read
    else if(hasRd) g += `<circle class="rd${n.rd ? ' on' : ''}" cx="${mx}" cy="${n.y}" r="7"/>` + (n.rd ? `<text class="chk" x="${mx}" y="${n.y + 4}" text-anchor="middle" font-size="11">✓</text>` : '');
    g += `<text class="lbl" x="${tx}" y="${ty}" text-anchor="${anchor}" font-size="${fs}">${lines.map((l, i) => `<tspan x="${tx}"${i ? ` dy="${lineGap(fs)}"` : ''}>${esc(l)}</tspan>`).join('')}</text>`;
    if(n.sub) g += `<text class="lbl sub" x="${tx}" y="${n.y + 13 + (extra - subExtra) / 2}" text-anchor="${anchor}" font-size="12">${subs.map((l, i) => `<tspan x="${tx}"${i ? ` dy="${lineGap(12)}"` : ''}>${esc(l)}</tspan>`).join('')}</text>`;
    g += `</g>`;
    return g;
  }

  function frame(c, keyOf, scope){
    const inner = `<g class="lay edges">${c.edges.join('')}</g><g class="lay nodes">${c.nodes.map(n => mark(n, keyOf, scope)).join('')}</g>`;
    const bbox = { x: Math.min(...c.xs) - PAD, y: Math.min(...c.ys) - PAD, w: Math.max(...c.xs) - Math.min(...c.xs) + PAD * 2, h: Math.max(...c.ys) - Math.min(...c.ys) + PAD * 2 };
    return { inner, bbox };
  }

  /* ---- a topic's neighbourhood: everything the data links to it ---- */
  // Returns [{ id, label, leaves }] with the groups in reading order. Nothing is
  // written by hand: related topics come from `rel` (both ways), the rest from
  // the games' lenses and diagrams, the smells' causes, the tools' motivating
  // topic, the guides, checklists and prompts that name the topic, the paths
  // with a step on it and the project parts that demonstrate it. Topics that
  // live in the other lens get a group of their own ("Also in Engineering").
  // Pure: it reads the data files only, so the layout checker draws the same map.
  function neighbours(tid, views){
    views = views || {};
    const t = TOPICS[tid]; if(!t) return [];
    const safe = f => { try { return f() || []; } catch(e){ return []; } };
    const dom = id => DOMAINS.find(x => x.id === id);
    const lensOfDom = id => { const d = dom(id); return d ? d.lens : null; };
    const my = lensOfDom(t.d);
    const groups = [], add = (id, label, leaves) => { if(leaves.length) groups.push({ id, label, leaves }); };
    const item = (type, id, label, why, href) => ({ kind:'item', type, id, label, why, href });

    // related topics, in both directions, split by the lens they live in
    const same = [], other = {}, used = new Set([tid]);
    const relTopic = (rid, why) => {
      const rt = TOPICS[rid]; if(!rt || used.has(rid)) return; used.add(rid);
      const lens = lensOfDom(rt.d), leaf = { kind:'leaf', id:rid, label:rt.t, color:(dom(rt.d) || {}).color || 'var(--accent)', why, home:rt.d };
      if(lens && my && lens !== my){ leaf.other = true; (other[lens] || (other[lens] = [])).push(leaf); } else same.push(leaf);
    };
    (t.rel || []).forEach(([rid, why]) => {
      if(TOPICS[rid]) return relTopic(rid, why);
      const v = views[rid] || safe(() => [VIEW_LINKS[rid]])[0];
      if(v && !used.has(rid)){ used.add(rid); same.push(item('view', rid, v[1], why, v[0])); }
    });
    // the page keeps only link ids for topics it has not loaded; a loaded topic brings the
    // reasons others give for linking to it (relIn, written by the build) in the same order
    (t.relIn || Object.values(TOPICS).map(x => [x.id, ((x.rel || []).find(([rid]) => rid === tid) || [])[1], (x.rel || []).some(([rid]) => rid === tid)]).filter(r => r[2]))
      .forEach(([xid, why]) => relTopic(xid, why));
    add('rel', 'Related topics', same);
    LENSES.forEach(([lid, lname]) => { if(other[lid]) add('lens:' + lid, 'Also in ' + lname.split(/[ &]/)[0], other[lid]); });

    // games whose lenses (or loop and screen diagrams) name the topic, best match first
    const games = [];
    safe(() => REFERENCE_GAMES).forEach(g => {
      let best = null;
      const offer = (rank, why, key) => { if(!best || rank < best.rank) best = { rank, why, key }; };
      if(g.lens) safe(() => GAME_LENSES).forEach(([k, label]) => { const l = g.lens[k]; if(l && !l.na && (l.topics || []).includes(tid)) offer(l.topics.indexOf(tid), `${label} lens`, k); });
      (g.diagrams || []).forEach(d => { if((d.topics || []).includes(tid)) offer(100, d.kind === 'screen' ? 'its screen shows this idea' : 'its loop shows this idea'); });
      if(best) games.push({ rank:best.rank, leaf:item('game', g.id, '◇ ' + g.t, `${g.t}: ${best.why}`, '#/games/' + g.id + (best.key ? '/' + best.key : '')) });
    });
    add('game', 'Games', games.sort((a, b) => a.rank - b.rank).map(x => x.leaf));

    add('smell', 'Smells', safe(() => SMELLS).filter(s => s.causes.some(c => c.top === tid)).map(s => item('smell', s.id, '! ' + s.t, s.sym, '#/map/s/' + s.id)));
    add('tool', 'Tools', safe(() => TOOLS).filter(x => x[4] === tid).map(x => item('tool', x[0], x[1], x[2], '#/build/' + x[0])));
    add('guide', 'Guides', [...safe(() => PLATFORMS).map(g => ['platforms', g]), ...safe(() => ENGINES).map(g => ['engines', g])].filter(([, g]) => (g.topics || []).includes(tid)).map(([k, g]) => item('guide', k + ':' + g.id, g.t, k === 'platforms' ? 'Platform guide' : 'Engine guide', `#/${k}/${g.id}`)));
    add('checklist', 'Checklists', safe(() => CHECKLISTS).filter(c => (c.topics || []).includes(tid)).map(c => item('checklist', c.id, c.t, c.desc, '#/checklists/' + c.id)));
    add('prompt', 'Prompts', safe(() => PROMPT_TEMPLATES).filter(p => (p.topics || []).includes(tid)).map(p => item('prompt', p.id, p.t, p.cat ? p.cat + ' prompt' : 'Prompt template', '#/prompts/' + p.id)));
    const paths = [];
    safe(() => PATHS).forEach(p => { const st = (p.stages || []).find(s => (s.steps || []).some(x => x.kind === 'topic' && x.ref === tid)); if(st) paths.push(item('path', p.id, p.t, `Stage: ${st.t}`, `#/paths/${p.id}/${st.id}`)); });
    add('path', 'Paths', paths);
    const parts = [];
    safe(() => CASE_STUDIES).forEach(c => { const r = (c.rel || []).find(([rid]) => rid === tid); if(r) parts.push(item('part', c.id, '◆ ' + c.t, 'Project: ' + r[1], '#/experience/' + c.id)); });
    safe(() => CASE_STUDIES).forEach(c => (c.systems || []).forEach(s => (s.parts || []).forEach(p => { const r = (p.rel || []).find(([rid]) => rid === tid); if(r) parts.push(item('part', c.id + '/' + s.id + '/' + p.id, '◆ ' + p.t, `${c.t}: ${r[1]}`, `#/experience/${c.id}/${s.id}/${p.id}`)); })));
    add('part', 'Projects and parts', parts);
    return groups;
  }

  /* ---- the guide map: goal, domains, topics, leaves ---- */
  function build(state, seen, views){
    views = views || {};
    const dcolor = id => { const d = DOMAINS.find(x => x.id === id); return d ? d.color : 'var(--accent)'; };
    const dtitle = id => { const d = DOMAINS.find(x => x.id === id); return d ? d.t : id; };

    // One lens at a time: its domains, its goal at the centre.
    const lens = LENSES.find(l => l[0] === state.lens) || LENSES[0];
    const doms = DOMAINS.filter(d => d.lens === lens[0]);
    const root = { kind:'center', id:'root', label:lens[2], w:SIZE.root.w, h:SIZE.root.h, children:[], oneSided:!!state.oneSided, phone:!!state.phone };
    let sel = null;
    const READ = ['read', 'not read yet'];
    doms.forEach(d => {
      const sn = d.topics.filter(t => seen.has(t)).length;
      const node = { kind:'domain', id:d.id, label:d.t, sub:`${sn} of ${d.topics.length} read`, color:d.color, open:state.dom === d.id, next:!!state.next && d.topics.includes(state.next), w:SIZE.domain.w, h:SIZE.domain.h, children:[] };
      if(state.dom === d.id) d.topics.forEach(t => {
        const tn = { kind:'topic', id:t, label:TOPICS[t].t, color:d.color, rd:seen.has(t), rdWord:READ, next:state.next === t, sel:state.topic === t, w:SIZE.topic.w, h:SIZE.topic.h, children:[] };
        if(state.topic === t) sel = tn;
        node.children.push(tn);
      });
      root.children.push(node);
    });

    // fourth layer: the selected topic's whole neighbourhood, read from the
    // data and grouped by kind. A group with more than GROUP_OPEN leaves is
    // collapsed to "Games (14)" and opens on a click, so nothing is cut.
    // `state.grp` holds the reader's open/closed choices by group id.
    if(sel){
      const groups = state.groups || neighbours(state.topic, views);
      groups.forEach(gr => {
        const open = state.grp && gr.id in state.grp ? !!state.grp[gr.id] : gr.leaves.length <= GROUP_OPEN;
        const gn = { kind:'group', id:gr.id, label:`${gr.label} (${gr.leaves.length})`, open, w:SIZE.group.w, h:SIZE.group.h, children:[] };
        if(open) gr.leaves.forEach(l => gn.children.push(Object.assign({}, l, { gid:gr.id, w:SIZE.leaf.w, h:SIZE.leaf.h, children:[] }, l.kind === 'leaf' ? { rd:seen.has(l.id), rdWord:READ } : {})));
        sel.children.push(gn);
      });
    }

    place(root, state.off || {}, DKEY);
    const c = collect(root, DKEY);

    // cross-branch links: faint dashed curves that leave the tree. Same-side
    // links bow away from the goal; cross-side links pass under it.
    // (not drawn on a phone: beside the cards they read as a hairball of dashes)
    // On a one-sided map the gap between the root and the domains holds the tree's
    // trunk, so the overview bows these links out past the domains' far edge, where
    // nothing else is drawn, and frames them; with a domain open its topics fill that
    // side, so the links are left to the reading pane ("Why it connects").
    const outerX = n => n.side < 0 ? n.x : n.x + n.w, BOW = 55;
    if(!state.phone && !(root.oneSided && state.dom)) doms.forEach(d => (d.links || []).forEach(([to, why]) => {
      const a = c.byKey['d:' + d.id], b = c.byKey['d:' + to];
      if(!a || !b) return;
      const out = root.oneSided && a.side === b.side;
      // a cubic whose control points sit BOW out reaches three quarters of the way
      if(out) c.xs.push(outerX(a) + a.side * BOW * 0.75);
      const path = a.side !== b.side ? smooth(innerX(a), a.y, innerX(b), b.y)
        : out ? link(outerX(a), a.y, outerX(b), b.y, a.side * BOW)
        : link(innerX(a), a.y, innerX(b), b.y, -a.side * BOW);
      c.edges.push(`<path class="edge dd" data-a="d:${d.id}" data-b="d:${to}" d="${path}"><title>${esc(why)}</title></path>`);
    }));
    if(state.dom && !state.phone){
      (DOMAINS.find(d => d.id === state.dom).topics || []).forEach(tid => {
        const tn = c.byKey['t:' + tid]; if(!tn) return;
        (TOPICS[tid].rel || []).forEach(([rid, why]) => {
          const rt = TOPICS[rid]; if(!rt || rt.d === state.dom) return;
          const dn = c.byKey['d:' + rt.d]; if(!dn) return;
          c.edges.push(`<path class="edge cross" data-a="t:${tid}" data-b="d:${rt.d}" d="${smooth(innerX(tn), tn.y, innerX(dn), dn.y)}"><title>${esc(rt.t)}: ${esc(why)}</title></path>`);
        });
      });
    }
    if(sel && !state.phone) sel.children.forEach(gn => gn.children.filter(l => l.home && l.home !== state.dom).forEach(l => {
      const dn = c.byKey['d:' + l.home]; if(!dn) return;
      c.edges.push(`<path class="edge home" data-a="${DKEY(l)}" data-b="d:${l.home}" d="${smooth(innerX(l), l.y, innerX(dn), dn.y)}"><title>${esc(l.label)} lives in ${esc(dtitle(l.home))}</title></path>`);
    }));

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
    const rootSub = cs.sub && both.length > maxForSub(SIZE.root.w) ? cs.sub : both;
    const root = { kind:'center', id:cs.id, label:cs.t, sub:rootSub, w:SIZE.root.w, h:SIZE.root.h, children:[] };
    let sel = null, open = null;
    systems.forEach(s => {
      const color = (typeof KIND_COLOR === 'undefined' ? null : KIND_COLOR[s.kind]) || 'var(--accent2)';
      const parts = s.parts || [];
      const node = { kind:'domain', id:s.id, label:s.t, sub:`${parts.length} part${parts.length === 1 ? '' : 's'}`, color, open:state.sys === s.id, w:SIZE.domain.w, h:SIZE.domain.h, children:[] };
      if(state.sys === s.id){
        open = s;
        parts.forEach(p => {
          const pn = { kind:'topic', id:p.id, label:p.t, color, sel:state.part === p.id, w:SIZE.topic.w, h:SIZE.topic.h, children:[] };
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

    root.oneSided = !!state.oneSided; root.phone = !!state.phone;
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

  /* ---- the path map: one learning path as stages and steps ---- */
  // `state` is { stage, off }: a stage id or null, and dragged-node offsets,
  // the same shape the project map uses for `sys`/`part`. `done` is the
  // progress record store.get('path.'+id) returns: { steps, stages }, so a
  // stage node's sub-label and a step node's `seen` style read the same
  // truth the path page and the path bar do. `stepTitle` is the pure global
  // helper from 50-paths.js; it is not passed in because it needs no
  // per-call state, only the data files already loaded by the time any map
  // is actually drawn.
  const PKEY2 = n => n.kind === 'center' ? 'c' : n.kind === 'domain' ? 'stage:' + n.id : n.kind === 'topic' ? 'step:' + n.id : 'l:' + n.id;
  function buildPath(pth, state, done){
    state = state || {}; done = done || { steps:{}, stages:{} };
    const stages = pth.stages || [];
    const root = { kind:'center', id:pth.id, label:pth.t, sub:`${stages.length} stage${stages.length === 1 ? '' : 's'} · ${pth.hours}h`, w:SIZE.root.w, h:SIZE.root.h, children:[] };
    stages.forEach(st => {
      const steps = st.steps || [];
      const k = steps.filter((_, i) => done.steps && done.steps[`${st.id}/${i}`]).length;
      const status = done.stages && done.stages[st.id];
      const color = status === 'done' ? 'var(--ok)' : status === 'skipped' ? 'var(--warn)' : 'var(--accent2)';
      const node = { kind:'domain', id:st.id, label:st.t, sub:`${k} of ${steps.length} done`, color, open:state.stage === st.id, w:SIZE.domain.w, h:SIZE.domain.h, children:[] };
      if(state.stage === st.id) steps.forEach((step, i) => {
        const sid = `${st.id}/${i}`;
        node.children.push({ kind:'topic', id:sid, label:(typeof stepTitle === 'function' ? stepTitle(step) : step.ref || step.kind), color, rd:!!(done.steps && done.steps[sid]), rdWord:['done', 'not done'], w:SIZE.topic.w, h:SIZE.topic.h, children:[] });
      });
      root.children.push(node);
    });
    root.oneSided = !!state.oneSided; root.phone = !!state.phone;
    place(root, state.off || {}, PKEY2);
    const c = collect(root, PKEY2);
    const f = frame(c, PKEY2, 'path');
    return { inner:f.inner, bbox:f.bbox, focus:null, nodes:c.nodes };
  }

  /* ---- reverse index: guide topic -> the project parts that show it ---- */
  // One traversal serves three consumers: the "Seen in practice" chips on a
  // topic page (`hits`), the runtime view links the map leaves travel
  // through (`views`), and the capped leaf list the domain map and the
  // layout checker both render (`extra`). The cap keeps the fourth layer
  // from growing past what the overlap checker allows. `games` adds at most
  // one reference-game leaf per topic, on its own cap: the first game whose
  // loop or screen schematic, or a lens, names the topic.
  function practiceLinks(cases, cap, games){
    cap = cap || 2;
    const hits = {}, views = {}, extra = {}, gameLeaf = {};
    (cases || []).forEach(c => (c.systems || []).forEach(s => (s.parts || []).forEach(p => (p.rel || []).forEach(([tid, why]) => {
      const vid = `exp:${c.id}/${s.id}/${p.id}`;
      views[vid] = [`#/experience/${c.id}/${s.id}/${p.id}`, `◆ ${p.t}`, c.t];
      (hits[tid] || (hits[tid] = [])).push({ cs:c, sys:s, part:p, why, vid });
      const list = extra[tid] || (extra[tid] = []);
      if(list.length < cap) list.push([vid, why]);
    }))));
    const lensLabel = k => { const l = (typeof GAME_LENSES !== 'undefined' ? GAME_LENSES : []).find(x => x[0] === k); return l ? l[1] : k; };
    // A topic's game leaf prefers a game whose lens is about that topic (the
    // topic listed earliest in a lens wins), and falls back to a game whose
    // loop or screen diagram only shows it.
    const best = {};
    const offer = (tid, g, rank, why) => { const b = best[tid]; if(!b || rank < b.rank) best[tid] = { g, rank, why }; };
    (games || []).forEach(g => {
      Object.entries(g.lens || {}).forEach(([k, l]) => { if(l && !l.na) (l.topics || []).forEach((t, i) => offer(t, g, i, `${g.t}, through its ${lensLabel(k).toLowerCase()} lens`)); });
      (g.diagrams || []).forEach(d => (d.topics || []).forEach(t => offer(t, g, 100, `${g.t}: its ${d.kind === 'screen' ? 'screen' : 'loop'} shows this idea`)));
    });
    Object.entries(best).forEach(([tid, b]) => { const vid = `game:${b.g.id}`; gameLeaf[tid] = [vid, b.why]; views[vid] = [`#/games/${b.g.id}`, `◇ ${b.g.t}`, 'Reference game']; });
    Object.entries(gameLeaf).forEach(([tid, leaf]) => (extra[tid] || (extra[tid] = [])).push(leaf));
    return { hits, views, extra };
  }

  return { build, buildProject, buildPath, practiceLinks, neighbours, GROUP_OPEN, nodeAttrs: attrs, nodeClass: classOf, nodeName: nameOf };
})();
