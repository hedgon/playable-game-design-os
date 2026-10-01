# R1b review: engineering content (Go snippets, server-stack-choices, engine snippets, path solutions)

Reviewer: independent, read-only on the repository. Working copies of the extracted snippets are in
scratchpad/r1b/ (extracted by loading the data files with node; the repository was not touched).
No Go toolchain exists here, so nothing was compiled; every Go file was read line by line as `go build` / `go vet` would.

## Headline

- 29 of 29 Go files: I found no compile error and no vet error. Every import is used, every identifier exists with the used signature (builtin min/max, math/rand/v2 rand.N / NewPCG / IntN, atomic.Pointer[T], atomic.Bool, errors.Join, slog.LogValuer, Request.Pattern all checked against pkg.go.dev or Go source).
- 0 must-fix items in the Go code. 7 should-fix items (one is a real logic bug: NaN passes the authority check).
- server-stack-choices: all 5 FACTS opened and confirmed. No wrong claim found in the text.
- Engine snippets: no wrong API name. One inconsistency in a MAP sentence, one design choice (legacy Input) to change.
- Path solutions: 58 of 58 read (not a sample). 1 should-fix, a few nits.

## Findings

### Go snippets

1. **should-fix, Confirmed (by reasoning)** - server-authority NaN passes the speed check.
   src/36-topics-server.js:156 `if m.DX*m.DX+m.DY*m.DY > maxStep*maxStep {`
   If DX or DY is NaN the comparison is false (IEEE 754), so the move is accepted and `p.X += NaN` poisons the position forever. Floats arrive from binary decoding in a real server (JSON cannot carry NaN, a binary protocol can). This is the one snippet whose whole purpose is "never trust the client".
   Fix: write the test so NaN fails: `if !(m.DX*m.DX+m.DY*m.DY <= maxStep*maxStep) {` with the comment `// written so NaN is rejected`. (Infinity is already rejected.)

2. **should-fix, Confirmed** - backend-observability logs an empty route when stacked under the request-context middleware.
   src/34-topics-backend.js:1602 `slog.String("route", r.Pattern)`
   Evidence: net/http ServeMux.ServeHTTP (go1.23.0 server.go) does `h, r.Pattern, r.pat, r.matches = mux.findHandler(r)` then `h.ServeHTTP(w, r)`: Pattern is written onto the *Request pointer the mux receives*. `Logging` only sees it if it passes the same pointer to the mux. The sibling snippet backend-request-context calls `next.ServeHTTP(w, r.WithContext(...))`, which hands the mux a copy; stack `Logging(Middleware(mux))` and the outer `r.Pattern` stays "". The topic's pitfall says "use the route pattern", so a reader who combines the two topics gets an empty field.
   Fix: add one sentence to the pitfall or a comment above line 1602: `// r.Pattern is filled in by the mux on the request it receives: Logging must wrap the mux directly, or any middleware between them must not replace r.`
   Also: Request.Pattern needs Go 1.23. No page states a minimum Go version (grep of src/3[456]-*.js, src/90-app.js, README.md found none). Fix: state "Go 1.23 or newer" once in the Go-tab label text (src/90-app.js:1236), since this file would otherwise fail with `r.Pattern undefined` on 1.22.

3. **should-fix, Confirmed** - infra-containers exits 0 when the server cannot bind.
   src/35-topics-infra.js:161 `slog.Error("listen", "err", err); stop()` then main returns normally.
   A container whose port is taken (or LISTEN_ADDR is invalid) logs and exits with status 0, so the orchestrator sees a clean exit. The topic is about container behaviour, where exit status is the signal.
   Fix: record the failure and `os.Exit(1)` after shutdown, e.g. `var failed bool` set in the goroutine before `stop()` (guard with the channel or atomic), then `if failed { os.Exit(1) }` after `Shutdown`. Simplest: copy the `errCh` pattern already used in backend-go-idioms and return the error from a `run` function.

4. **should-fix, Confirmed** - infra-secrets comment over-claims.
   src/35-topics-infra.js ~720 `// Secret never prints its value, even when logged by mistake.`
   `Secret` implements String() and LogValue(), which covers `%v`, `%s`, `%q` and slog. It does not cover `%#v` (uses GoStringer, not Stringer: prints `secrets.Secret("hunter2")`) and `json.Marshal` (marshals the underlying string). The snippet's own pitfall already admits a second leak path (the value inside another string).
   Fix: add `func (Secret) MarshalText() ([]byte, error) { return []byte("[redacted]"), nil }` and `func (Secret) GoString() string { return "[redacted]" }`, or soften the comment to "when printed with %v/%s or logged with slog".

5. **should-fix, Confirmed** - server-matchmaking pitfall says "set a hard cap" but the code has none.
   src/36-topics-server.js:725 `band := 100 + 25*int(waited.Seconds())`; pitfall: "Widen the band with waiting time and set a hard cap so the match is still fair."
   The snippet teaches uncapped widening: after 10 minutes the band is 15 100 rating points, i.e. any pair matches.
   Fix: `band := min(100+25*int(waited.Seconds()), 600)` and add a `const maxBand = 600`.

6. **should-fix, Confirmed** - infra-monitoring pitfall teaches an Unwrap method the snippet lacks (same wrapper in backend-observability).
   src/35-topics-infra.js (statusWriter, ~line 1136) and src/34-topics-backend.js:~1580. Pitfall: "Add an Unwrap method returning the inner writer so http.ResponseController can reach it." Neither statusWriter has it, so as written they break Flusher/Hijacker (SSE, WebSocket upgrade), the very failure the pitfall describes.
   Fix: add to both: `func (w *statusWriter) Unwrap() http.ResponseWriter { return w.ResponseWriter }`.
   Related nit: infra-monitoring comment says "counts ... slow replies" but slow replies are only logged, not counted. Change to "counts status codes and logs slow replies".

7. **should-fix, Confirmed** - the "Whole file ... builds as it stands" label is false for the testing snippet and misleading for the rest.
   src/90-app.js:1236 "A complete Go file. Save it as main.go in its own folder and it builds as it stands."
   (a) backend-testing contains `func TestCanClaim` in the same file as the code; saved as main.go, `go test` reports "no test files" (tests must be in `_test.go`). The snippet also pulls package `testing` into non-test code. Fix: split into two labelled files, or tell the reader to put the test function in `daily_test.go`.
   (b) 26 of the 29 snippets are not `package main` (only backend-di-modes, backend-go-idioms and infra-containers are) (e.g. `package layering`); "save it as main.go" then builds only as a library and runs nothing; `go build` also needs a `go.mod` (`go mod init example`) which the label does not mention. Fix: change the label to "A complete Go file (a package, not a program). Put it in its own folder with `go mod init example`, then `go build ./...` or `go vet ./...`", and use a different wording for the ones with `func main`.

8. **should-fix, Likely** - server-determinism teaches replay determinism on the standard-library generator.
   src/36-topics-server.js:293 `rand.New(rand.NewPCG(seed, seed^0x9e3779b97f4a7c15))`.
   pkg.go.dev/math/rand/v2 (opened) gives signatures New(Source), NewPCG(seed1, seed2 uint64), N, IntN(n int) as used, but contains no statement that the output of `Rand` methods such as IntN is stable across Go versions. Saved replays or a client in another language need a generator you own. The snippet does not say this and the pitfall covers only map order.
   Fix: add one sentence to the pitfall: "The Go standard library does not promise IntN gives the same numbers in a later Go version. If replays are stored, write the 20-line generator yourself or vendor one."
   Related nit: field `tick` is written and never read (src/36:~288); harmless but a reader may look for its purpose.

9. **nit** - several small points, none wrong.
   - backend-api-protocol (src/34): body over 1 MiB returns 400 `invalid JSON body`; `MaxBytesReader` errors deserve 413 (`var mbe *http.MaxBytesError; errors.As(err, &mbe)`). Also no check for trailing data after the first JSON value.
   - backend-data-access (src/34): `Transfer` accepts `amount <= 0`; a negative amount moves gold the wrong way. If the handler validates upstream, add the comment "amount > 0 validated by the caller".
   - backend-di-modes (src/34): the topic is "one binary, many modes" but the snippet shows no mode (no flag). The path stage live-game-backend-engineer/s1 asks for a "mode flag, read once in main". Add 3 lines: `mode := flag.String("mode", "api", "api or worker")` and a switch in `build`.
   - infra-ci-pipelines (src/35:445): after the last failed try it still waits `i+1` seconds before returning "gave up"; check `i == tries-1` before the select. `tries <= 0` returns `fmt.Errorf("... %w", nil)`.
   - infra-deploy-models (src/35): `RunEvery` returns on cancel without waiting for the running job; mention or add a WaitGroup.
   - infra-secrets: `FromFile` fine. infra-cdn-assets: `http.FileServer` also lists directories; add `// note: FileServer serves directory listings` or use a hardened handler.
   - server-state-sync (src/36): a Ticker drops ticks when Step is slow, so "simulates at 60 Hz" is only true when Step is fast; the pitfall says this. OK.
   - server-realtime-protocol (src/36): `WriteFrame` does not check `len(body) > maxBody` (the reader rejects it, the writer should not produce it); `uint32(len(body))` truncates above 4 GiB.
   - server-rollback-netcode (src/36): `Rollback` replays exactly `len(inputs)` frames; if the caller passes fewer than `cur.Frame-frame`, the game ends behind where it was and nothing says so. I traced the ring-buffer bounds (`frame >= g.cur.Frame-window`) and they are correct: slot `frame%8` is overwritten only when Advance runs at `Frame = frame+8`.
   - backend-observability and infra-monitoring duplicate `statusWriter`; fine as separate snippets.
   - gofmt: could not run it. I checked by script for space indentation, trailing whitespace, CRLF and missing final newline (none) and checked the alignment of the two one-line methods in infra-secrets by column (correct). Operator spacing looked gofmt-conformant on all multi-operator expressions I read.

### server-stack-choices: facts (all opened with WebFetch, 2026-10-01)

10. **Confirmed OK** FACTS[0] Unity Multiplay: https://status.unity.com/info_notices/362941 says deprecation effective April 1 2026, migration cut-off March 31 2026, "Customers can no longer scale new game servers or make new allocations", and customers who told Unity they would migrate to Multiplay by Rocket Science before the deadline may continue until migration finishes. Matches the claim and `asOf`.
11. **Confirmed OK** FACTS[1] GameLift Servers: docs page says "deploy, operate, and scale dedicated ... servers ... for session-based multiplayer games"; has a FlexMatch section and "Amazon GameLift Servers Anywhere ... on your own hardware, on-premises infrastructure, or other cloud providers". No retirement notice on the page.
12. **Confirmed OK** FACTS[2] Agones: agones.dev says "Host, Run and Scale dedicated game servers on Kubernetes" and "can run anywhere Kubernetes can run" (site shows v1.61.0).
13. **Confirmed OK** FACTS[3] Nakama: server framework page lists JavaScript, Go, Lua runtimes. Nit (should-fix at most): the page says "Heroic Labs recommends use of the JavaScript VM" and lists JavaScript first; the claim's order "Go, JavaScript or Lua" is harmless. The page excerpt does not state the licence; the claim does not assert one.
14. **Confirmed OK** FACTS[4] Mirror MIT: GitHub README badge "License: MIT", self-described as "#1 Open Source Unity Networking Library".
15. Uncited claims in the text, checked by search/fetch: PlayFab Multiplayer Servers exists and is documented as current (Microsoft Learn page opened; no retirement notice; a search found PlayFab Insights APIs retiring on 2026-03-31, not MPS). Photon Fusion 2: SDK 2.0.9 released 2025-12-08 (search result, Likely). Fish-Net: active repository, no archive notice. Unity Gaming Services Lobby/Relay/Matchmaker: still offered; Matchmaker documented to keep working with Relay and Distributed Authority after the Multiplay end (search result, Likely). Netcode for GameObjects 2.x API opened (see 17).
16. **Dated-claim risk (nit)**: the text states no hosting product's price or status except through FACTS, and the interview answer says to date every claim. Good. One hosting casualty not mentioned that a reader will meet: a search result reported Hathora shut down in May 2026 (blog source, not verified, Likely). Not an error in the text; could be added to FACTS if wanted.

### Engine snippets

17. **Confirmed OK** server-stack-choices Unity: NetworkManager.Singleton, StartServer/StartHost/StartClient (return bool), OnClientConnectedCallback is `Action<ulong>` (so `id => Debug.Log("joined " + id)` compiles), `UnityTransport.SetConnectionData(string ipv4Address, ushort port, string listenAddress = null)` (all opened in the NGO 2.4 API docs). `Application.isBatchMode` exists. Nits: (a) `SetConnectionData("0.0.0.0", port)` runs in every build, so a client build would try to connect to 0.0.0.0; move it inside the `isBatchMode` branch or add a client branch; (b) `isBatchMode` is true for any `-batchmode` run, including CI test runs; Unity 6's Dedicated Server build target defines `UNITY_SERVER`, which is the more precise guard (`#if UNITY_SERVER`); (c) no `using Unity.Netcode; using Unity.Netcode.Transports.UTP;`, consistent with the "Excerpt" label.
18. **Confirmed OK** server-stack-choices Godot: feature tag `dedicated_server` (docs: introduced in Godot 4.0, export forces --headless), `ENetMultiplayerPeer.create_server(port, max_clients)`, `multiplayer.multiplayer_peer`, `peer_connected(id)`. Nit: the return value (Error) of `create_server` is ignored; a port in use then silently runs with no server: `var err := peer.create_server(...)` and `if err != OK: push_error(...)`.

19. **should-fix, Confirmed** three-cs Unity snippet uses legacy `Input.GetButtonDown` (the known suspect).
   src/22-topics-core.js:1060 `sincePress = Input.GetButtonDown("Jump") ? ...`
   Evidence: Unity issue tracker entries and the error text "You are trying to read Input using the UnityEngine.Input class, but you have switched active Input handling to Input System package in Player Settings." (InvalidOperationException) when Active Input Handling is "Input System Package (New)". Whether a given Unity 6 new project has "New" or "Both" depends on the template (Likely: current templates ship the Input System package; the tracker shows both defaults occurring).
   Does the pitfall handle it? Yes and correctly: the pitfall says the legacy manager throws when only the new package is active, and gives both fixes (enable both modes, or read an InputAction). It is accurate. But a reader copies the snippet before reading the pitfall, and in a "New"-only project the first Play press throws. The chip list also advertises `Input.GetButtonDown()`.
   Fix (preferred): make the snippet safe by default and keep the legacy line as the pitfall's example:
   ```
   using UnityEngine.InputSystem;
   [SerializeField] InputActionReference jump;   // Jump action, enabled in OnEnable
   void OnEnable() => jump.action.Enable();
   ...
   sincePress = jump.action.WasPressedThisFrame() ? 0f : sincePress + Time.deltaTime;
   ```
   and change the api chip to `InputAction.WasPressedThisFrame()`. Minimum fix: add to the TERM line "Uses the legacy Input Manager: set Player settings > Active Input Handling to Both, or see the pitfall."

20. **should-fix, Confirmed** three-cs MAP sentences contradict each other and the code.
   src/22-topics-core.js:1050 (Godot MAP) says Godot's _physics_process "plays the part of Unity's FixedUpdate with a Rigidbody2D"; the Unity MAP says the Unity code's `Update` "plays the part of Godot's _physics_process". The Unity snippet reads input and sets `linearVelocity` in `Update`, not `FixedUpdate`, so the first sentence describes code that is not shown. Also the Godot pitfall tells the reader to "read input and act on it in the same function" (physics), while the Unity version does it in Update with a physics body.
   Fix: Godot MAP: "Godot's _physics_process with move_and_slide is where Unity code would set a Rigidbody2D's velocity; the Unity snippet does it in Update so GetButtonDown is not missed between FixedUpdate steps." Keep the Unity MAP.

21. **nit, Confirmed** three-cs Godot: all APIs verified (`is_on_floor`, `Input.is_action_just_pressed` valid inside `_physics_process`, `@export var x := 0.1`, ternary form). Rigidbody2D.linearVelocity is correct for Unity 6 (docs opened: replaces `velocity`). Unity `Physics2D.OverlapCircle(...)` returns Collider2D which converts to bool through UnityEngine.Object's implicit operator: compiles. Behavioural nit: in Unity the ground check at the pivot with 0.1 radius may still be true for a frame or two after the jump starts, so `sinceGround` is reset to 0 and a second press inside the buffer can double-jump; Godot's `is_on_floor` is false right after leaving the floor. Not worth a change unless someone reports it.

22. **nit, Confirmed** combat-design.
   - Godot: `SceneTree.create_timer(time_sec, process_always=true, process_in_physics=false, ignore_time_scale=false)` (opened). The pitfall says "pass true for process_in_physics", which is the *third* argument; a reader must write `create_timer(active, true, true)`. Show the call in the pitfall.
   - Godot snippet never sets `hitbox.monitoring = false` at start; the Unity snippet says "disabled in the prefab". Add `# set Monitoring off in the scene` or `_ready(): hitbox.monitoring = false`.
   - Unity: the API chips list `OnTriggerEnter(Collider)` and `OnDisable()` but neither is in the snippet (OnDisable is in the pitfall text). Unity uses a 3D `Collider` while Godot uses `Area2D`; MAP compares them as equals. The pitfall about OnDisable is accurate: SetActive(false) stops coroutines; Busy stays true.
   - `IEnumerator` needs `using System.Collections;` (excerpt label covers it).

23. **Confirmed OK** camera-design: Godot `Camera2D.process_callback` default is IDLE (1), `CAMERA2D_PROCESS_PHYSICS` = 0, `drag_horizontal_enabled`, `drag_left_margin`, `drag_right_margin`, `position_smoothing_enabled`, `position_smoothing_speed`, `offset` all exist with these names (Godot stable docs opened). `signf` and `lerpf` are valid GDScript. Unity: `Vector2 d = target.position - transform.position;` compiles (Vector3 to Vector2 implicit), `Vector3.SmoothDamp(current, target, ref velocity, smoothTime)` correct, dead-zone arithmetic correct (moves only the overshoot). Pitfall (Rigidbody in FixedUpdate + LateUpdate camera, fix Interpolate) is correct.

24. **Confirmed OK / nit** level-blockout-and-metrics: formulas right (height v^2/2g; distance = run * 2v/g). Godot setting name `physics/2d/default_gravity` is correct for Godot 4 (default 980); `class_name X extends Resource` on one line is valid. Unity snippet compiles; numbers (8 m/s jump, g 9.81) give a 3.3 m jump height and a 9.8 m jump distance at 6 m/s: not wrong, but unlike the Godot defaults (about 118 px and 255 px) it is not a human-scale platformer; use `jumpVelocity = 5f` (1.3 m) and `runSpeed = 5f` (2.5 m) if a realistic example is wanted. Pitfall wording "Rigidbody gravity scale" is `Rigidbody2D.gravityScale` in a 2D game; say so.

### Path `solution` outlines (src/51-paths-engineering.js)

I read all 58 outlines against their stage goal, steps and build text (extracted to scratchpad/r1b/solutions.txt), not a sample. 11 of 11 paths covered.

25. **should-fix, Likely** live-game-backend-engineer/s2 (src/51:362) tells the learner to put "caller identity" in the request context. The same course's backend-request-context pitfall (src/34:740) says context values must not carry business inputs "such as the player or a feature flag", while its interview answer (src/34, mid answer on context) lists "request id, player, session, locale" as acceptable request-scoped values. The topic contradicts itself, and the outline follows the interview answer. Fix: reword the pitfall to "business inputs such as a price, a feature flag or optional parameters" and keep identity as accepted metadata, or reword the outline to "request id and deadline in the context, caller identity passed as a typed argument".

26. **nit** gameplay-engineer-unity/s1 (src/51 ~line 180): "Do not scale a Rigidbody velocity by deltaTime a second time" implies it is scaled once; velocity is never multiplied by deltaTime. Say "Do not multiply a Rigidbody velocity by deltaTime."

27. **nit** live-game-backend-engineer/s5: "no ignored returns" while the library's own snippets deliberately write `_ = json.NewEncoder(w).Encode(v)` and `_, _ = rand.Read(b)`. Say "no silently ignored errors; ignore deliberately with `_ =` and a reason". Also `go test -race` needs cgo (a C compiler) and fails in a minimal Alpine/CGO_ENABLED=0 container; add "on a machine with a C compiler".

28. **nit** Stage steps that the outline never uses (the learner is told to do work with no payoff in the checkpoint): build-and-release-engineer/s1 lists `engine:blender`, s2 lists `topic:ai-generative-assets`, s4 lists `engine:unreal` and `platform:itch`, ship-it/s2 lists `topic:infra-ci-pipelines`. The itch step is used (butler); the others are not referenced by the outline or build text. Not wrong; confirm they are intended.

29. **nit** live-game-backend-engineer stage order in the file is s1, s2, s5, s3, s4 (s5 "Idioms and tests" sits before s3). If ids are display order this is a bug; other reviewer's scope, flagged only because I saw it.

30. **Checked, no defect**: outlines for netcode-server-engineer s1 to s5 and s2b agree with the matching topics (lag compensation is in the server-authority facts; the rollback test of one input three frames late is valid against a window of 8; the ticket outline matches the matchmaking snippet except "mode", which the Ticket struct lacks, and "three tickets" where the snippet matches two); gameplay-engineer-godot/unity all stages (move_and_slide already applies delta is correct for Godot 4; EditMode and GdUnit4 are named in existing topics, src/33:488 and src/30:342); build-and-release-engineer s1 to s5 (hashed assets, -X stamping, secret rotation not just deletion are correct); interview-prep-engineer (generic by design: the structure and the timed-answer format are the content); senior-game-developer-ai-era, studio-practice-ai-era, ship-it, ai-engineering-for-game-devs, game-ai-programmer (specific, testable, none contradicts its topics).
   The `reflect:undefined` seen in my extraction is my printing a `reflect` step that has no `ref`, not a data defect (src/51:146 shows `{ kind:'reflect', why:..., do:... }`).

## Set aside (considered, judged fine or out of scope)

- Unused-variable/import check on all 29 Go files: none found; named results `a, b Ticket, ok bool` in matchmaking are legal.
- `Request.PathValue`, `"GET /healthz"` patterns need Go 1.22: fine given the 1.23 requirement already needed.
- math/rand/v2 `rand.N(time.Minute)`: legal because time.Duration's underlying type is int64 and satisfies the `intType` constraint.
- `time.After` in a loop (infra-ci): fine on Go 1.23; the backend-testing pitfall already explains the older behaviour correctly.
- atomic.Pointer[map[string]bool] and atomic.Bool inside structs: only used through pointer receivers, no copylocks diagnostic.
- `syscall.SIGTERM` on Windows: compiles.
- `database/sql` snippets use `$1` placeholders and no driver: fine, the comment says so.
- server-liveops: swapping a pointer to a freshly built map is race-free as taught.
- Unity `UNITY_WHOLE` list claims (src/07-snippet-scope.js): includes backend-data-access, infra-ci-pipelines, infra-containers (their C# tabs, not Go): out of scope (C# tabs of old topics).
- Design topics, comparisons and worked examples: out of scope, not reviewed.

## Could not check

- Compilation and `gofmt -l` / `go vet` of the 29 Go files (no Go toolchain; src/check-go.js prints NOT MEASURED without it). The fastest closing step is to run `node src/check-go.js` on a machine with Go 1.23+.
- Any Godot or Unity snippet in an editor (no engines run here); API names were checked against opened docs for Godot SceneTree/Camera2D/dedicated server export, Unity Rigidbody2D and NGO 2.4 NetworkManager/UnityTransport only. Not opened: Godot `Area2D.monitoring`, `MultiplayerSpawner`, `ENetMultiplayerPeer.create_server` pages (names known and not doubted, but not fetched); Unity `Physics2D.OverlapCircle` page; whether `0.0.0.0` as the connection address listens on all interfaces in UnityTransport (docs fetched did not say; behaviour from memory of the package source, Likely).
- Unity 6 template default for Active Input Handling by template (the tracker entries show both "New" and "Both" occurring; I could not open a fresh Unity 6 project).
- Photon Fusion 2 / UGS status and the Hathora report come from search-result text only, not from the vendors' own pages.
- That `Request.Pattern` was added in Go 1.23 (taken from the brief and the 1.23 source; I did not open the 1.22 source).
