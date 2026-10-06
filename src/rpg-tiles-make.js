// Cuts the tiles the path game draws (96-rpg.js) out of two CC0 tile sheets by
// Kenney (kenney.nl): Tiny Town and Tiny Dungeon, 16x16 tiles, packed sheets of
// 12 x 11. It writes assets/rpg/tiles.png, one row of 16 tiles after another, in
// the order of TILES below; 96-rpg.js names each tile by that position (its T
// table must match). Not part of the build: run it when the tile list changes.
// Usage: node src/rpg-tiles-make.js <dir with tiny-town.png and tiny-dungeon.png>
//   (the two files are each pack's Tilemap/tilemap_packed.png; PLAYWRIGHT_CHANNEL=msedge uses Edge)
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const OUT = path.join(__dirname, '..', 'assets', 'rpg', 'tiles.png');
// [name, sheet, index in the packed sheet]
const TILES = [
  ['grass', 'town', 0], ['grass2', 'town', 1], ['flowers', 'town', 2], ['tree', 'town', 16], ['tree2', 'town', 28], ['bush', 'town', 5], ['autumn', 'town', 27], ['road', 'town', 25],
  ['roofL', 'town', 52], ['roofM', 'town', 53], ['roofR', 'town', 54], ['wallL', 'town', 72], ['door', 'town', 74], ['wallR', 'town', 75], ['sign', 'town', 83], ['stone', 'town', 109],
  ['player', 'dungeon', 97], ['npc1', 'dungeon', 84], ['npc2', 'dungeon', 85], ['npc3', 'dungeon', 86], ['npc4', 'dungeon', 87], ['npc5', 'dungeon', 88], ['npc6', 'dungeon', 98], ['npc7', 'dungeon', 99],
  ['npc8', 'dungeon', 100], ['npc9', 'dungeon', 112], ['guard1', 'dungeon', 110], ['guard2', 'dungeon', 122], ['guard3', 'dungeon', 121], ['guard4', 'dungeon', 124], ['mon1', 'dungeon', 108], ['mon2', 'dungeon', 120],
  ['mon3', 'dungeon', 123], ['mon4', 'dungeon', 109], ['wall', 'town', 73], ['well', 'town', 104], ['gateL', 'town', 111], ['gateR', 'town', 114], ['cwall', 'town', 100], ['chest', 'dungeon', 89]
];
(async () => {
  const dir = process.argv[2]; if (!dir) { console.error('usage: node src/rpg-tiles-make.js <dir>'); process.exit(1); }
  const uri = f => 'data:image/png;base64,' + fs.readFileSync(path.join(dir, f)).toString('base64');
  const b = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
  const p = await b.newPage();
  const png = await p.evaluate(async ({ town, dungeon, tiles }) => {
    const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
    const sheets = { town: await load(town), dungeon: await load(dungeon) };
    const c = document.createElement('canvas'); c.width = 16 * 16; c.height = 16 * Math.ceil(tiles.length / 16);
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    tiles.forEach(([, s, n], i) => x.drawImage(sheets[s], (n % 12) * 16, Math.floor(n / 12) * 16, 16, 16, (i % 16) * 16, Math.floor(i / 16) * 16, 16, 16));
    return c.toDataURL('image/png');
  }, { town: uri('tiny-town.png'), dungeon: uri('tiny-dungeon.png'), tiles: TILES });
  await b.close();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, Buffer.from(png.split(',')[1], 'base64'));
  console.log(`${OUT}: ${TILES.length} tiles, ${fs.statSync(OUT).size} bytes`);
  console.log(TILES.map(([n], i) => `${n}:${i}`).join(' '));
})();
