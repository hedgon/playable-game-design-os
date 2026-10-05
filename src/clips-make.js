// Renders the short silent clips in assets/clips/ from code, so they are
// reproducible and carry no footage of anyone's game. Each clip is a
// deterministic canvas drawing of time t, captured frame by frame in a
// browser and encoded to WebM (VP9) with ffmpeg. Not part of the build: run it
// when a clip changes. Needs Playwright and ffmpeg on the PATH.
// Usage: node src/clips-make.js [clip-id]   (PLAYWRIGHT_CHANNEL=msedge uses Edge)
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const OUT = path.join(__dirname, '..', 'assets', 'clips');
const W = 640, H = 300, FPS = 30;

// Each clip: seconds, and a draw(ctx, t) function run in the page. Two panels,
// left and right, each with a caption; the drawing is a pure function of t.
const CLIPS = {
  'fixed-timestep': { secs: 6, draw: `(ctx, t) => {
    // the same ball, simulated two ways, while the frame times stutter (a fixed, repeating pattern of 8, 33 and 16 ms)
    const pattern = [8, 33, 16, 8, 50, 16, 8, 16], g = 900, floor = 250, top = 70;
    const sim = (stepOf) => { let y = top, v = 0, time = 0, i = 0; const states = [];
      while (time < t * 1000) { const dt = stepOf(pattern[i++ % pattern.length]); v += g * dt / 1000; y += v * dt / 1000; if (y > floor) { y = floor; v = -v * 0.85; } time += dt; states.push(y); } return states; };
    // left: one step per frame with the frame's own time (variable step)
    const left = sim(ms => ms); const yl = left.length ? left[left.length - 1] : top;
    // right: fixed 16.7 ms steps, drawn blended between the last two states
    const steps = Math.floor(t * 1000 / 16.67), alpha = (t * 1000 / 16.67) - steps; let y = top, v = 0, prev = top;
    for (let i = 0; i < steps; i++) { prev = y; v += g * 0.01667; y += v * 0.01667; if (y > floor) { y = floor; v = -v * 0.85; } }
    const yr = prev + (y - prev) * alpha;
    const panel = (x, label, sub, by) => { ctx.fillStyle = '#15171b'; ctx.fillRect(x, 0, W / 2 - 4, H); ctx.fillStyle = '#ece7dc'; ctx.font = '600 15px system-ui, sans-serif'; ctx.fillText(label, x + 14, 26); ctx.fillStyle = '#b3ada1'; ctx.font = '13px system-ui, sans-serif'; ctx.fillText(sub, x + 14, 46);
      ctx.strokeStyle = '#3a3f48'; ctx.beginPath(); ctx.moveTo(x + 10, floor + 14); ctx.lineTo(x + W / 2 - 14, floor + 14); ctx.stroke(); ctx.fillStyle = '#ffb454'; ctx.beginPath(); ctx.arc(x + W / 4, by, 14, 0, Math.PI * 2); ctx.fill(); };
    ctx.fillStyle = '#101114'; ctx.fillRect(0, 0, W, H);
    panel(0, 'Variable step', 'moves by each frame\\'s time: jerky, bounces drift', yl);
    panel(W / 2 + 4, 'Fixed step + interpolation', '16.7 ms steps, blended: smooth, repeatable', yr);
  }` },
  'hit-feel': { secs: 6, draw: `(ctx, t) => {
    // the same hit every 1.5 s, bare on the left, with hitstop, flash and shake on the right
    const period = 1.5, k = t % period, hitAt = 0.6;
    ctx.fillStyle = '#101114'; ctx.fillRect(0, 0, W, H);
    const panel = (x, label, sub, juicy) => {
      // the striker moves in, hits at hitAt, and returns; with juice, time freezes for 60 ms at contact
      let local = k; if (juicy && k > hitAt) local = k < hitAt + 0.06 ? hitAt : k - 0.06;
      const phase = Math.min(1, local / hitAt), back = local > hitAt ? Math.min(1, (local - hitAt) / 0.4) : 0;
      const sx = x + 40 + 150 * phase - 150 * back, contact = juicy && k >= hitAt && k < hitAt + 0.18;
      const shake = juicy && k >= hitAt && k < hitAt + 0.15 ? Math.sin(k * 180) * 5 : 0;
      ctx.save(); ctx.translate(shake, 0);
      ctx.fillStyle = '#15171b'; ctx.fillRect(x, 0, W / 2 - 4, H);
      ctx.fillStyle = '#ece7dc'; ctx.font = '600 15px system-ui, sans-serif'; ctx.fillText(label, x + 14, 26); ctx.fillStyle = '#b3ada1'; ctx.font = '13px system-ui, sans-serif'; ctx.fillText(sub, x + 14, 46);
      ctx.fillStyle = '#5eead4'; ctx.fillRect(sx, 150, 40, 40);
      const squash = contact ? 0.8 : 1; ctx.fillStyle = contact ? '#ffffff' : '#ff7a6b'; ctx.fillRect(x + 220, 150 + 40 * (1 - squash), 50 / squash, 40 * squash);
      ctx.restore(); };
    panel(0, 'Bare', 'the box is hit: nothing else happens', false);
    panel(W / 2 + 4, 'Hitstop, flash, shake, squash', '60 ms pause at contact makes it land', true);
  }` },
  'snapshot-interpolation': { secs: 6, draw: `(ctx, t) => {
    // a remote player moving in a circle; the server sends 20 snapshots a second
    const pos = s => [Math.cos(s * 1.4), Math.sin(s * 1.4)];
    const snap = s => Math.floor(s * 20) / 20;
    ctx.fillStyle = '#101114'; ctx.fillRect(0, 0, W, H);
    const panel = (x, label, sub, p) => { ctx.fillStyle = '#15171b'; ctx.fillRect(x, 0, W / 2 - 4, H); ctx.fillStyle = '#ece7dc'; ctx.font = '600 15px system-ui, sans-serif'; ctx.fillText(label, x + 14, 26); ctx.fillStyle = '#b3ada1'; ctx.font = '13px system-ui, sans-serif'; ctx.fillText(sub, x + 14, 46);
      const cx = x + W / 4, cy = 175; ctx.strokeStyle = '#3a3f48'; ctx.beginPath(); ctx.arc(cx, cy, 90, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = '#ffb454'; ctx.beginPath(); ctx.arc(cx + p[0] * 90, cy + p[1] * 90, 12, 0, Math.PI * 2); ctx.fill(); };
    // left: draw the newest snapshot as it arrives (jumps 20 times a second)
    panel(0, 'Newest snapshot', 'jumps at 20 Hz', pos(snap(t)));
    // right: draw 100 ms in the past, blended between the two snapshots around that time
    const rt = t - 0.1, a = snap(rt), b = a + 0.05, f = (rt - a) / 0.05, pa = pos(a), pb = pos(b);
    panel(W / 2 + 4, 'Interpolated, 100 ms behind', 'smooth at 60 frames a second', [pa[0] + (pb[0] - pa[0]) * f, pa[1] + (pb[1] - pa[1]) * f]);
  }` }
};

(async () => {
  const only = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  for (const [id, clip] of Object.entries(CLIPS)) {
    if (only && only !== id) continue;
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clip-'));
    await page.setContent(`<body style="margin:0;background:#101114"><canvas id="c" width="${W}" height="${H}"></canvas></body>`);
    await page.evaluate(([src, w, h]) => { window.W = w; window.H = h; window.draw = eval(src); }, [clip.draw, W, H]);
    const n = clip.secs * FPS;
    for (let i = 0; i < n; i++) {
      await page.evaluate(t => window.draw(document.getElementById('c').getContext('2d'), t), i / FPS);
      await page.locator('#c').screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.png') });
    }
    const out = path.join(OUT, id + '.webm');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, '%04d.png'), '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '38', '-pix_fmt', 'yuv420p', '-an', out]);
    // the first frame, as the poster shown before play
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(dir, '0045.png'), '-q:v', '80', path.join(OUT, id + '.webp')]);
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`${id}: ${(fs.statSync(out).size / 1024).toFixed(0)} KB, ${clip.secs} s`);
  }
  await browser.close();
})();
