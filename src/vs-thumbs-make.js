// Cuts the small art a comparison card shows (assets/games/vs/<game id>.jpg, 368 by 136) from each
// compared game's card or header image, so the card does not load two full headers. Not part of
// the build: run it with ffmpeg on the PATH after adding a comparison, and commit the files.
// The header's credit on the game page covers the crop, as it does for a library card.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { COMPARISONS, REFERENCE_GAMES } = require('./load-data.js')();
const root = path.join(__dirname, '..'), out = path.join(root, 'assets', 'games', 'vs');
fs.mkdirSync(out, { recursive: true });
for (const id of new Set(COMPARISONS.flatMap(c => c.games))) {
  const g = REFERENCE_GAMES.find(x => x.id === id);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(root, g.card || g.img),
    '-vf', 'scale=368:136:force_original_aspect_ratio=increase,crop=368:136', '-q:v', '6', path.join(out, id + '.jpg')]);
  console.log(id, fs.statSync(path.join(out, id + '.jpg')).size);
}
