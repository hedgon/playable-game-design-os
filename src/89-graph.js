/* =====================================================================
   ONE BRAIN MAP
   A single radial mind map that expands and collapses in place:
     centre  : the goal
     ring 1  : the domains (always visible)
     ring 2  : topics of the ONE expanded domain, fanned around it
     ring 3  : for the selected topic: related topics, smells it diagnoses,
               tools it points to - fanned around the topic. Related topics
               draw a dashed line home to their own domain.
   Coordinates are centred on (0,0); the caller fits the viewBox.
   Labels are always outside nodes, wrapped, anchored by angle.
   ===================================================================== */
window.PlayableGraph = (function(){
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pol = (r, a) => [r*Math.cos(a), r*Math.sin(a)];
  // Geometry is adaptive: ring radii grow with content so spacing never
  // collapses. The base values keep the current look; a ring only expands when
  // a fan would otherwise cram its nodes closer than the minimum gap.
  const R1 = 230, R2 = 440, R3 = 720; // base radii (kept for external reference)
  const DOMAIN_ARC = 120;   // px of ring-1 arc reserved per domain
  const T_GAP = 70, T_MAXSPAN = 2.6, T_BASE = 560;  // topic ring
  const L_GAP = 38, L_MAXSPAN = 2.2, L_BASE = 720;  // leaf ring
  const ringR = (n, base, gap, maxSpan) => n < 2 ? base : Math.max(base, (n - 1) * gap / maxSpan);
  const fanA = (center, n, r, gap, maxSpan, minStep) => {
    if (n <= 1) return [center];
    const span = Math.min(maxSpan, Math.max((n - 1) * minStep, (n - 1) * gap / r));
    return Array.from({ length: n }, (_, i) => center + (i - (n - 1) / 2) * (span / (n - 1)));
  };

  function lines(label, max=14){
    if(label.length <= max) return [label];
    const words = label.split(' '); const out = []; let cur = '';
    for(const w of words){ if((cur+' '+w).trim().length <= max || !cur) cur = (cur+' '+w).trim(); else { out.push(cur); cur = w; } }
    if(cur) out.push(cur);
    if(out.length > 2){ out[1] = out.slice(1).join(' '); out.length = 2; if(out[1].length > max+4) out[1] = out[1].slice(0, max+2) + '…'; }
    return out;
  }
  function outsideLabel(x, y, a, gap, text, sub, cls, size, max){
    const c = Math.cos(a), s = Math.sin(a);
    const anchor = c > .3 ? 'start' : c < -.3 ? 'end' : 'middle';
    const lx = x + c*gap, ly = y + s*gap;
    const ls = lines(text, max || 14);
    const lh = size*1.15, total = ls.length*lh + (sub ? size*.85 : 0);
    let startY = ly - total/2 + size*.85;
    if(anchor === 'middle') startY = s > 0 ? ly + size*.9 : ly - total + size*.85;
    let html = ls.map((l,i) => `<text class="${cls}" x="${lx}" y="${startY + i*lh}" text-anchor="${anchor}" font-size="${size}">${esc(l)}</text>`).join('');
    if(sub) html += `<text class="${cls} sub" x="${lx}" y="${startY + ls.length*lh - size*.15}" text-anchor="${anchor}" font-size="${size*.78}">${esc(sub)}</text>`;
    return { html, ext:[lx + (anchor==='start'? size*.55*Math.max(...ls.map(l=>l.length)) : anchor==='end' ? -size*.55*Math.max(...ls.map(l=>l.length)) : 0), ly] };
  }
  const curve = (x1,y1,x2,y2,bend=.18) => { const mx=(x1+x2)/2*(1-bend), my=(y1+y2)/2*(1-bend); return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`; };

  /* state = { dom, topic, smell } ; seen = Set of read topic ids */
  function build(state, seen){
    const D = Object.fromEntries(DOMAINS.map(d => [d.id, d]));
    const pts = []; // for the whole-map bbox
    const fpts = []; // for the focus bbox: centre + open domain + its fan + selected leaves
    let edges = '', nodes = '', guides = '';
    const mark = (x,y,m=60) => { pts.push([x-m,y-m],[x+m,y+m]); };
    const fmark = (x,y,m=40) => { fpts.push([x-m,y-m],[x+m,y+m]); };
    fmark(0,0,95);
    const dAngle = {}; DOMAINS.forEach((d,i) => dAngle[d.id] = -Math.PI/2 + i*2*Math.PI/DOMAINS.length);
    const r1 = Math.max(R1, DOMAINS.length * DOMAIN_ARC / (2 * Math.PI));
    const dPos = {}; DOMAINS.forEach(d => dPos[d.id] = pol(r1, dAngle[d.id]));
    // guides
    guides += `<circle class="guide" data-key="g:ring1" cx="0" cy="0" r="${r1}"/>`;
    // domain-domain links (faint, highlight on hover)
    DOMAINS.forEach(d => d.links.forEach(([to, why]) => { const [x1,y1]=dPos[d.id], [x2,y2]=dPos[to]; edges += `<path class="edge dd" data-key="e:dd:${d.id}:${to}" data-a="d:${d.id}" data-b="d:${to}" d="${curve(x1,y1,x2,y2,.35)}"><title>${esc(why)}</title></path>`; }));
    // centre
    nodes += `<g class="node center" data-kind="center" data-key="c"><circle class="halo" r="86"/><circle class="core" r="72"/>${['MAKE SOMETHING','PEOPLE WANT','TO PLAY'].map((l,i) => `<text class="ctitle" y="${-14+i*17}" text-anchor="middle" font-size="12.5">${l}</text>`).join('')}<text class="csub" y="44" text-anchor="middle" font-size="8.5">${state.dom ? 'click to collapse' : 'start here'}</text></g>`;
    mark(0,0,90);
    // expanded domain
    const ex = state.dom && D[state.dom] ? D[state.dom] : null;
    const tPos = {};
    let topicR = 0;
    if(ex){
      const a = dAngle[ex.id]; const n = ex.topics.length;
      const r2 = Math.max(T_BASE, r1 + 210, ringR(n, T_BASE, T_GAP, T_MAXSPAN)); topicR = r2;
      const angles = fanA(a, n, r2, T_GAP, T_MAXSPAN, 0.18);
      if(n > 1) guides += `<path class="guide arc" data-key="g:arc:${ex.id}" d="${arcPath(r2, angles[0] - .08, angles[n-1] + .08)}"/>`;
      angles.forEach((ta, i) => { const t = ex.topics[i]; tPos[t] = [pol(r2, ta), ta]; });
      const [dx,dy] = dPos[ex.id];
      ex.topics.forEach(t => { const [[x,y]] = tPos[t]; edges += `<path class="edge dt" data-key="e:dt:${t}" data-a="d:${ex.id}" data-b="t:${t}" d="${curve(dx,dy,x,y,.05)}"/>`; });
      // cross links from topics to other domains (faint, shown on hover)
      ex.topics.forEach(t => (TOPICS[t].rel||[]).forEach(([rid, why]) => { const rt = TOPICS[rid]; if(!rt || rt.d === ex.id) return; const [x1,y1] = tPos[t][0], [x2,y2] = dPos[rt.d]; edges += `<path class="edge cross" data-key="e:x:${t}:${rid}" data-a="t:${t}" data-b="d:${rt.d}" d="${curve(x1,y1,x2,y2,.4)}"><title>${esc(rt.t)}: ${esc(why)}</title></path>`; }));
    }
    // selected topic leaves
    const sel = state.topic && TOPICS[state.topic] && ex && TOPICS[state.topic].d === ex.id ? TOPICS[state.topic] : null;
    const leaves = [];
    if(sel){
      const [[sx,sy], sa] = tPos[sel.id];
      (sel.rel||[]).forEach(([rid, why]) => { if(TOPICS[rid]) leaves.push({kind:'topic', id:rid, why, t:TOPICS[rid]}); else leaves.push({kind:'view', id:rid, why}); });
      SMELLS.filter(s => s.causes.some(c => c.top === sel.id)).slice(0,4).forEach(s => leaves.push({kind:'smell', id:s.id, why:s.sym, s}));
      const k = leaves.length;
      const r3 = Math.max(L_BASE, topicR + 240, ringR(k, L_BASE, L_GAP, L_MAXSPAN));
      fanA(sa, k, r3, L_GAP, L_MAXSPAN, 0.14).forEach((la, i) => { const [x,y] = pol(r3, la); leaves[i].x = x; leaves[i].y = y; leaves[i].a = la;
        edges += `<path class="edge tl ${leaves[i].kind}" data-key="e:tl:${sel.id}:${leaves[i].id}" data-a="t:${sel.id}" data-b="l:${i}" d="${curve(sx,sy,x,y,.05)}"><title>${esc(leaves[i].why)}</title></path>`;
        if(leaves[i].kind==='topic'){ const [hx,hy] = dPos[leaves[i].t.d]; edges += `<path class="edge home" data-key="e:h:${sel.id}:${leaves[i].id}" data-a="l:${i}" data-b="d:${leaves[i].t.d}" d="${curve(x,y,hx,hy,.45)}"><title>${esc(leaves[i].t.t)} lives in ${esc(D[leaves[i].t.d].t)}</title></path>`; } });
    }
    // domain nodes
    DOMAINS.forEach((d,i) => { const [x,y] = dPos[d.id]; const a = dAngle[d.id]; const n = d.topics.length, sn = d.topics.filter(t => seen.has(t)).length; const r = 30; const circ = 2*Math.PI*(r+6); const open = ex && ex.id===d.id;
      const lbl = outsideLabel(x, y, a, r+14, d.t, `${sn}/${n} read`, 'lbl', 13, 18);
      nodes += `<g class="node domain ${open?'open':''}" data-kind="domain" data-id="${d.id}" data-key="d:${d.id}" style="--dc:${d.color}"><circle class="hit" cx="${x}" cy="${y}" r="${r+14}"/><circle class="ring" cx="${x}" cy="${y}" r="${r+6}" stroke-dasharray="${circ*sn/n} ${circ}" transform="rotate(-90 ${x} ${y})"/><circle class="disc" cx="${x}" cy="${y}" r="${r}"/><text class="glyph" x="${x}" y="${y+5}" text-anchor="middle">${open?'−':String(i+1).padStart(2,'0')}</text>${lbl.html}</g>`;
      mark(x,y,r+20); pts.push(lbl.ext); if(open){ fmark(x,y,r+20); fpts.push(lbl.ext); } });
    // topic nodes
    if(ex) ex.topics.forEach((t, ti) => { const [[x,y]] = tPos[t]; const isSel = sel && sel.id===t; const r = isSel ? 26 : 20;
      nodes += `<g class="node topic ${seen.has(t)?'seen':''} ${isSel?'active':''}" data-kind="topic" data-id="${t}" data-key="t:${t}" style="--dc:${ex.color}"><circle class="hit" cx="${x}" cy="${y}" r="${r+14}"/><circle class="disc" cx="${x}" cy="${y}" r="${r}"/>${seen.has(t)?`<circle class="dot" cx="${x}" cy="${y}" r="4.5"/>`:''}<text class="glyph" x="${x}" y="${y+4}" text-anchor="middle" font-size="${isSel?12:11}">${ti+1}</text></g>`;
      mark(x,y,r+16); fmark(x,y,r+16); });
    // leaf nodes
    leaves.forEach((l,i) => { const {x,y} = l;
      if(l.kind==='smell'){ nodes += `<g class="node smell" data-kind="smell" data-id="${l.id}" data-key="l:${i}"><circle class="hit" cx="${x}" cy="${y}" r="30"/><rect class="disc" x="${x-13}" y="${y-13}" width="26" height="26" transform="rotate(45 ${x} ${y})"/><text class="glyph" x="${x}" y="${y+4}" text-anchor="middle" font-size="11">!</text></g>`; }
      else if(l.kind==='view'){ nodes += `<g class="node view" data-kind="view" data-id="${l.id}" data-key="l:${i}"><circle class="hit" cx="${x}" cy="${y}" r="30"/><rect class="disc" x="${x-13}" y="${y-13}" width="26" height="26" rx="3"/><text class="glyph" x="${x}" y="${y+4}" text-anchor="middle" font-size="11">▸</text></g>`; }
      else { const od = D[l.t.d]; nodes += `<g class="node topic leaf ${seen.has(l.id)?'seen':''}" data-kind="leaf" data-id="${l.id}" data-key="l:${i}" style="--dc:${od.color}"><circle class="hit" cx="${x}" cy="${y}" r="30"/><circle class="disc" cx="${x}" cy="${y}" r="15"/>${seen.has(l.id)?`<circle class="dot" cx="${x}" cy="${y}" r="4"/>`:''}</g>`; }
      mark(x,y,30); fmark(x,y,30); });
    // bboxes
    const box = P => { const xs = P.map(p=>p[0]), ys = P.map(p=>p[1]); return { x: Math.min(...xs)-30, y: Math.min(...ys)-30, w: Math.max(...xs)-Math.min(...xs)+60, h: Math.max(...ys)-Math.min(...ys)+60 }; };
    // three layers so in-place patching can append new elements without breaking z-order
    const inner = `<g class="lay guides">${guides}</g><g class="lay edges">${edges}</g><g class="lay nodes">${nodes}</g>`;
    return { inner, bbox: box(pts), focus: ex ? box(fpts) : null, leaves, tPos, dPos };
  }
  function arcPath(r, a0, a1){ const [x0,y0]=pol(r,a0), [x1,y1]=pol(r,a1); return `M${x0},${y0} A${r},${r} 0 ${a1-a0>Math.PI?1:0} 1 ${x1},${y1}`; }
  return { build, R1, R2, R3 };
})();
