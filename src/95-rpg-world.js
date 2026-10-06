/* =====================================================================
   PATH WORLD (built on demand with 96-rpg.js; see docs/rpg-2026-10/plan.md)
   Turns one learning path into the tile world the path game draws: each
   stage is a town on one road, each step a person beside the road, each
   checkpoint a guardian beside the road at the town's far end. Nothing
   stands on the road, so nothing is ever in the way. Pure data, no DOM:
   the same path always gives the same world.
   ===================================================================== */
(function(A){
'use strict';
// Positions in assets/rpg/tiles.png (src/rpg-tiles-make.js writes it in this order).
const T = { grass:0, grass2:1, flowers:2, tree:3, tree2:4, bush:5, autumn:6, road:7, roofL:8, roofM:9, roofR:10, wallL:11, door:12, wallR:13, sign:14, stone:15,
  player:16, npc:[17, 18, 19, 20, 21, 22, 23, 24, 25], guard:[26, 27, 28, 29], mon:[30, 31, 32, 33], wall:34, well:35, chest:39 };
const SOLID = new Set([T.tree, T.tree2, T.bush, T.autumn, T.roofL, T.roofM, T.roofR, T.wallL, T.door, T.wallR, T.sign, T.wall, T.well]);
// A town is 11 rows: houses, a row of people, the road (row 5), a row of people, houses.
const TH = 11, ROAD = 5, GAP_X = 9, GAP_Y = 5, MARGIN = 4;

// A small deterministic random source, seeded by the path id.
function seeded(str){
  let h = 2166136261; for(let i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
}

function buildWorld(pth){
  const n = pth.stages.length, cols = n > 4 ? 3 : 2, rows = Math.ceil(n / cols);
  // every town in a path has the same width: room for its largest stage, two people per house pair
  const perSide = Math.max(2, ...pth.stages.map(s => Math.ceil(s.steps.length / 2)));
  const TW = 3 + 4 * perSide;
  const w = MARGIN * 2 + cols * TW + (cols - 1) * GAP_X + 4, h = MARGIN * 2 + rows * TH + (rows - 1) * GAP_Y;
  const ground = new Int16Array(w * h).fill(T.grass), obj = new Int16Array(w * h).fill(-1);
  const at = new Map();   // "x,y" -> what stands there: { type:'person'|'guardian'|'sign', town, i }
  const set = (x, y, g, o) => { if(x < 0 || y < 0 || x >= w || y >= h) return; const k = y * w + x; if(g != null) ground[k] = g; if(o !== undefined) obj[k] = o; };
  const road = new Set(), rnd = seeded(pth.id);
  const carve = (x1, y1, x2, y2) => {   // a straight piece of road
    for(let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) for(let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++){ set(x, y, T.road, -1); road.add(y * w + x); }
  };
  const towns = pth.stages.map((st, k) => {
    const r = Math.floor(k / cols), east = r % 2 === 0, c = east ? k % cols : cols - 1 - k % cols;
    const ox = MARGIN + c * (TW + GAP_X), oy = MARGIN + r * (TH + GAP_Y), ry = oy + ROAD;
    // the town travelled east enters on its west side; travelled west, on its east side
    const entry = { x: east ? ox : ox + TW - 1, y: ry }, exit = { x: east ? ox + TW - 1 : ox, y: ry };
    const town = { stage: st.id, k, x: ox, y: oy, w: TW, h: TH, east, entry, exit, people: [], guardian: null, sign: null };
    for(let y = oy; y < oy + TH; y++) for(let x = ox; x < ox + TW; x++){
      const edge = y === oy || y === oy + TH - 1 || ((x === ox || x === ox + TW - 1) && (y < oy + 3 || y > oy + TH - 4));
      set(x, y, T.grass, edge ? (rnd() < 0.5 ? T.tree : T.tree2) : -1);
    }
    carve(ox, ry, ox + TW - 1, ry);
    // houses: roof row and wall row, above the top row of people and below the bottom row
    for(let j = 0; j < perSide; j++){
      const hx = ox + 2 + 4 * j;
      for(const top of [oy + 1, oy + TH - 3]){ set(hx, top, null, T.roofL); set(hx + 1, top, null, T.roofM); set(hx + 2, top, null, T.roofR); set(hx, top + 1, null, T.wallL); set(hx + 1, top + 1, null, T.door); set(hx + 2, top + 1, null, T.wallR); }
    }
    // people in the order of the steps, alternating sides, met in that order along the road
    st.steps.forEach((step, i) => {
      const j = Math.floor(i / 2), col = east ? ox + 3 + 4 * j : ox + TW - 4 - 4 * j, y = i % 2 === 0 ? ry - 1 : ry + 1;
      const p = { i, x: col, y, look: T.npc[(i * 7 + k * 3) % T.npc.length] };
      town.people.push(p); at.set(col + ',' + y, { type: 'person', town, i });
    });
    // the sign by the way in, the guardian by the way out; both beside the road, above it
    town.sign = { x: east ? ox + 1 : ox + TW - 2, y: ry - 1 };
    set(town.sign.x, town.sign.y, null, T.sign); at.set(town.sign.x + ',' + town.sign.y, { type: 'sign', town });
    town.guardian = { x: east ? ox + TW - 2 : ox + 1, y: ry - 1, look: T.guard[k % T.guard.length] };
    set(town.guardian.x, town.guardian.y, T.stone);   // the guardian keeps a paved spot of its own
    at.set(town.guardian.x + ',' + town.guardian.y, { type: 'guardian', town });
    return town;
  });
  // the road from each town's way out to the next town's way in
  towns.forEach((a, k) => {
    const b = towns[k + 1]; if(!b) return;
    if(a.exit.y === b.entry.y) return carve(a.exit.x, a.exit.y, b.entry.x, b.entry.y);
    // the next row runs the other way: out past the end of this row, down, and in again
    const bend = a.east ? a.exit.x + 3 : a.exit.x - 3;
    carve(a.exit.x, a.exit.y, bend, a.exit.y); carve(bend, a.exit.y, bend, b.entry.y); carve(bend, b.entry.y, b.entry.x, b.entry.y);
  });
  // the country between towns: grass, flowers, trees and bushes, never on or beside the road
  const inTown = (x, y) => towns.some(t => x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h);
  const nearRoad = (x, y) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => road.has((y + dy) * w + x + dx));
  for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){
    if(inTown(x, y) || road.has(y * w + x)) continue;
    if(x === 0 || y === 0 || x === w - 1 || y === h - 1){ set(x, y, T.grass, T.tree); continue; }
    const v = rnd();
    if(nearRoad(x, y)){ if(v < 0.12) set(x, y, T.flowers); continue; }
    if(v < 0.14) set(x, y, null, T.tree); else if(v < 0.18) set(x, y, null, T.tree2); else if(v < 0.21) set(x, y, null, T.bush);
    else if(v < 0.28) set(x, y, T.flowers); else if(v < 0.4) set(x, y, T.grass2);
  }
  const walkable = (x, y) => x >= 0 && y >= 0 && x < w && y < h && !SOLID.has(obj[y * w + x]) && !at.has(x + ',' + y);
  return { w, h, ground, obj, at, towns, walkable, townAt: (x, y) => towns.find(t => x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h) || null };
}
A.RPG_T = T;
A.buildRpgWorld = buildWorld;
})(window.PlayableApp);
