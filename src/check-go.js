// Compiles the Go snippets: writes every GO() snippet into its own temp folder with a go.mod,
// then runs `gofmt -l` and `go vet` on each. Not part of build.js.
// Run with `node src/check-go.js`. Without `go` on the PATH it prints NOT MEASURED and exits 0.
const fs = require('fs'), os = require('os'), path = require('path');
const { spawnSync } = require('child_process');
const { DATA } = require('./manifest.js');

const probe = spawnSync('go', ['version'], { encoding: 'utf8' });
if (probe.error || probe.status !== 0) { console.log('NOT MEASURED: Go is not installed'); process.exit(0); }

const src = DATA.map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const { TOPICS } = new Function(src + '\nreturn {TOPICS};')();
const entries = Object.values(TOPICS).filter(t => t.go);
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'playable-go-'));
const failures = [];
for (const t of entries) {
  const dir = path.join(root, t.id);
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'go.mod'), 'module snippet\n\ngo 1.23\n');
  fs.writeFileSync(path.join(dir, 'main.go'), t.go.snippet);
  const fmt = spawnSync('gofmt', ['-l', '.'], { cwd: dir, encoding: 'utf8' });
  if (fmt.status !== 0) failures.push(`${t.id}: gofmt failed\n${fmt.stderr}`);
  else if (fmt.stdout.trim()) failures.push(`${t.id}: not gofmt-clean (${fmt.stdout.trim()})`);
  const vet = spawnSync('go', ['vet', './...'], { cwd: dir, encoding: 'utf8' });
  if (vet.status !== 0) failures.push(`${t.id}: go vet failed\n${(vet.stderr || vet.stdout).trim()}`);
}
fs.rmSync(root, { recursive: true, force: true });
console.log(`${probe.stdout.trim()}: ${entries.length} Go snippet${entries.length === 1 ? '' : 's'} checked, ${failures.length} failed`);
for (const f of failures) console.log('FAIL ' + f);
process.exit(failures.length ? 1 : 0);
