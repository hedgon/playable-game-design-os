// Layout QA for the brain map: render every state (each domain open, each topic selected)
// and report label-vs-label and label-vs-node overlaps using estimated text boxes.
const fs = require('fs'), path = require('path');
const src = ['10-data-domains.js','11-data-topics-systems.js','12-data-topics-ux.js','13-data-topics-product-ai.js','14-data-diagnostics.js','15-data-ai.js','16-data-references.js','89-graph.js']
  .map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const window = {};
const ctx = new Function('window', src + '\nreturn {DOMAINS,TOPICS};')(window);
const { DOMAINS, TOPICS } = ctx;
DOMAINS.forEach(d => d.topics = Object.values(TOPICS).filter(t => t.d === d.id).map(t => t.id));
const G = window.PlayableGraph;
const seen = new Set();
function boxes(svgInner){
  // split into node groups
  const groups = [...svgInner.matchAll(/<g class="node ([^"]*)"[^>]*data-kind="(\w+)"(?: data-id="([^"]*)")?[^>]*>([\s\S]*?)<\/g>/g)];
  const out = [];
  for(const g of groups){
    const cls = g[1], kind = g[2], id = g[3] || 'center', inner = g[4];
    const texts = [...inner.matchAll(/<text class="lbl[^"]*" x="([-\d.]+)" y="([-\d.]+)"(?: dy="[^"]*")? text-anchor="(\w+)" font-size="([\d.]+)"(?: transform="[^"]*" data-rad="([-\d.]+)" data-w="([\d.]+)")?>([^<]*)<\/text>/g)];
    if(!texts.length) continue;
    // each label becomes one or more oriented rectangles (polygons of 4 points)
    const polys = [];
    for(const t of texts){ const x=+t[1], y=+t[2], size=+t[4];
      if(t[5] !== undefined){ const a=+t[5], w=+t[6]; const c=Math.cos(a), s=Math.sin(a), h=size*0.5; const nx=-s*h, ny=c*h; polys.push([[x+nx,y+ny],[x+c*w+nx,y+s*w+ny],[x+c*w-nx,y+s*w-ny],[x-nx,y-ny]]); continue; }
      const w=t[7].length*size*0.56; const anc=t[3]; const lx = anc==='start'?x : anc==='end'? x-w : x-w/2; polys.push([[lx,y-size*0.9],[lx+w,y-size*0.9],[lx+w,y+size*0.2],[lx,y+size*0.2]]); }
    const disc = inner.match(/<(?:circle|rect) class="disc"[^>]*(?:cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"|x="([-\d.]+)" y="([-\d.]+)")/);
    let discPoly = null; if(disc){ if(disc[3]){ const cx=+disc[1], cy=+disc[2], r=+disc[3]*0.85; discPoly=[[cx-r,cy-r],[cx+r,cy-r],[cx+r,cy+r],[cx-r,cy+r]]; } else { const x=+disc[4], y=+disc[5]; discPoly=[[x+3,y+3],[x+23,y+3],[x+23,y+23],[x+3,y+23]]; } }
    out.push({ kind, id, polys, disc: discPoly });
  }
  return out;
}
// separating-axis test for two convex quads
function sat(A, B){ const axes = []; for(const P of [A,B]) for(let i=0;i<4;i++){ const dx=P[(i+1)%4][0]-P[i][0], dy=P[(i+1)%4][1]-P[i][1]; axes.push([-dy,dx]); }
  for(const [ax,ay] of axes){ const pa=A.map(p=>p[0]*ax+p[1]*ay), pb=B.map(p=>p[0]*ax+p[1]*ay); if(Math.max(...pa) <= Math.min(...pb) + 1e-6 || Math.max(...pb) <= Math.min(...pa) + 1e-6) return false; } return true; }
const anyOv = (ps, qs) => ps.some(p => qs.some(q => sat(p,q)));
let states = 0, problems = [];
const check = (state, name) => { states++; const b = boxes(G.build(state, seen).inner); for(let i=0;i<b.length;i++) for(let j=i+1;j<b.length;j++){ if(anyOv(b[i].polys, b[j].polys)) problems.push(`${name}: label "${b[i].id}" overlaps label "${b[j].id}"`); if(b[j].disc && anyOv(b[i].polys, [b[j].disc])) problems.push(`${name}: label "${b[i].id}" overlaps node "${b[j].id}"`); if(b[i].disc && anyOv(b[j].polys, [b[i].disc])) problems.push(`${name}: label "${b[j].id}" overlaps node "${b[i].id}"`); } };
check({dom:null,topic:null}, 'overview');
for(const d of DOMAINS){ check({dom:d.id, topic:null}, `open:${d.id}`); for(const t of d.topics) check({dom:d.id, topic:t}, `sel:${t}`); }
console.log(`states checked: ${states}; overlaps: ${problems.length}`);
problems.slice(0, 40).forEach(p => console.log('  ' + p));
