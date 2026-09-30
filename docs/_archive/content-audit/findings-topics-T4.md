# T4 topics audit (backend, infra, server)

No facts fields exist on these topics. Only 3 topics have game links (via CS2 and StarCraft lenses); fine but weak.

## Verdicts
backend-layering | ok | prose, interview, snippets read; nothing found
backend-di-modes | ok | prose, interview, snippets read; nothing found
backend-api-protocol | issues | T4-19, T4-21
backend-request-context | ok | prose, interview, snippets read; nothing found
backend-errors | ok | prose, interview, snippets read; nothing found
backend-data-access | issues | T4-1, T4-22 (has high)
backend-caching-redis | issues | T4-9
backend-migrations-config | issues | T4-27
backend-observability | ok | prose, interview, snippets read; nothing found
backend-testing | issues | T4-6 (has high)
backend-go-idioms | ok | prose, interview, snippets read; nothing found
infra-containers | ok | prose, interview, snippets read; nothing found
infra-deploy-models | issues | T4-12, T4-28
infra-ci-pipelines | issues | T4-17
infra-artifacts-provenance | ok | prose, interview, snippets read; nothing found
infra-secrets | issues | T4-26
infra-cdn-assets | issues | T4-13
infra-data-stores | ok | prose, interview, snippets read; nothing found
infra-monitoring | issues | T4-16
server-authority | ok | prose, interview, snippets read; nothing found
server-determinism | issues | T4-10, T4-11, T4-23
server-state-sync | issues | T4-24
server-realtime-protocol | issues | T4-7, T4-25
server-matchmaking | issues | T4-8
server-scaling | issues | T4-20
server-anticheat | issues | T4-4, T4-5, T4-14, T4-15 (has high)
server-liveops | issues | T4-2, T4-3, T4-18 (has high)

## Findings
id | topic.field | problem | evidence | severity | fix
---|---|---|---|---|---
T4-1 | backend-data-access.eng.unity.snippet | FlushIfDirty calls File.Replace(tmp,_statePath,_backupPath) with no existence check; on first save the destination is missing so it throws. infra-data-stores guards this case, this one does not. | MS docs: FileNotFoundException "The file described by sourceFileName or destinationFileName parameter could not be found." https://learn.microsoft.com/en-us/dotnet/api/system.io.file.replace | high | Guard like infra-data-stores: if (File.Exists(_statePath)) File.Replace(...); else File.Move(tmp,_statePath). Also JsonUtility cannot serialise Dictionary<string,object>; name a serializer that can.
T4-2 | server-liveops.eng.unity.snippet | `gate.MinClientVersion > Application.version` compares strings with >, which does not compile in C#. | CS0019, string has no > operator | high | Parse both with System.Version (new Version(a) < new Version(b)) or compare integer build numbers.
T4-3 | server-liveops.eng.godot.snippet | `body.min_client_version > APP_VERSION` compares version strings lexicographically, so "1.10.0" sorts below "1.9.0" and the force-update gate lets old clients through. | GDScript String comparison is lexicographic | high | Compare integer build numbers, or split on "." and compare ints.
T4-4 | server-anticheat.eng.godot.snippet | submit_run passes a PackedByteArray to Sim.run(seed, inputs: PackedInt32Array), a type error, then calls .hash() on a PackedInt64Array; packed arrays have no hash() method (global hash() does). | server-determinism snippet declares run(seed:int, inputs:PackedInt32Array)->PackedInt64Array | high | Take PackedInt32Array inputs, and use hash(trace) or a sha256 of trace.to_byte_array().
T4-5 | server-anticheat.eng.unity.snippet | SubmitServerRpc passes byte[] inputs to Sim.Run(int seed, int[] inputs) and calls Sim.Hash, which does not exist; does not compile. | server-determinism Sim.Run signature | high | Use int[] inputs in the RPC (or convert), and add a Sim.Hash helper.
T4-6 | backend-testing.eng.godot.snippet | StubApi extends RefCounted is passed to PlayerGateway._init(api: ApiClient), a type error; the stub also takes and returns PackedByteArray while the gateway calls api.post with a Dictionary and passes the result to Player.from_dict. | backend-layering godot snippet: _init(api: ApiClient), _api.post("/player/get", {"id": id}) -> Player.from_dict(body) | high | Make StubApi extend ApiClient and have post return the Dictionary {"id":7,"name":"ada"}.
T4-7 | server-realtime-protocol.eng.unity.snippet | On !EndOfMessage it calls Grow(buf,r) which cannot reassign the local buf, and the next ReceiveAsync writes at offset 0 again, so split messages are corrupted; r.Count also covers only the last fragment. | code as published | medium | Track a running offset (MemoryStream), parse only when EndOfMessage.
T4-8 | server-matchmaking.eng.godot.pitfall | Claims loading the match scene frees the node owning multiplayer_peer and so drops the peer. multiplayer_peer lives on the SceneTree MultiplayerAPI and survives scene changes; what is lost is signal connections on the freed node. Verify against Godot docs. | https://docs.godotengine.org/en/stable/classes/class_multiplayerapi.html (unverified) | medium | Say the freed node loses its server_disconnected connection and awaits; keep the session owner on an autoload.
T4-9 | backend-caching-redis.eng.godot.snippet | Decodes the server response with bytes_to_var, which reads only Godot binary Variant format; a Go server cannot produce it, and backend-api-protocol says Godot has no built-in protobuf. | load_master: bytes_to_var(body) | medium | Parse JSON (JSON.parse_string) or the generated protobuf decoder, and say which.
T4-10 | server-determinism.eng.unity.snippet+eng.godot | Uses System.Random(seed) and Godot RandomNumberGenerator and says the server re-runs the exact function, but the backend is Go and .NET does not guarantee seeded sequences across versions. | MS docs: "the example may produce different sequences of random numbers if run on different versions of .NET." https://learn.microsoft.com/en-us/dotnet/api/system.random | medium | Show a small hand-written integer PRNG both sides implement, and say built-in RNGs are not a cross-runtime spec.
T4-11 | server-determinism.eng.unity.pitfall | Says PhysX repeats results "with Enhanced Determinism on". I could not confirm Unity exposes such a setting. | Unverified in Unity 6 Physics docs | medium | Drop the phrase or cite the Unity manual page.
T4-12 | infra-deploy-models.eng.godot.pitfall | Last two sentences contradict: placeholders are "memory and money not spent on pixels nobody sees. On a fleet that is memory and money spent on pixels nobody sees." | pitfall text | medium | Delete the second sentence.
T4-13 | infra-cdn-assets.eng.godot.snippet | http.download_file to user://packs/x.pck fails if user://packs does not exist; snippet never creates it. HTTPRequest node is never freed. | Godot HTTPRequest.download_file needs existing directory | medium | Add DirAccess.make_dir_recursive_absolute("user://packs") and http.queue_free().
T4-14 | server-anticheat.eng.godot.api | Lists Crypto.hmac_digest() for submission signing; a key held in the client binary cannot authenticate a cheating client (contradicts infra-secrets). | infra-secrets pitfall | medium | Remove, or say it only catches accidental corruption.
T4-15 | server-anticheat.eng.unity.snippet | [DoNotObfuscateClass] belongs to a third-party obfuscator, not Unity or NGO, and is not introduced as such. | attribute not in UnityEngine/Netcode namespaces | medium | Name the obfuscator or use a comment.
T4-16 | infra-monitoring.eng.godot.snippet | _worst is never reset, so the custom monitor reports the worst frame since launch, not spikes per window. | snippet | medium | Reset _worst after each sample interval.
T4-17 | infra-ci-pipelines.eng.unity.snippet | locationPathName "build/app.aab" without EditorUserBuildSettings.buildAppBundle = true; missing using System.Linq. | snippet | medium | Set buildAppBundle = true before BuildPlayer.
T4-18 | server-liveops.tech | Topic has no tech field; the other 26 have four entries. | TECH: undefined | medium | Add 3-4 tech options.
T4-19 | backend-api-protocol.eng.unity.snippet | ApiException(responseCode, error) carries the HTTP status, but backend-errors branches on e.Code as a domain ErrorCode. ct is unused. | both snippets | medium | Parse the domain code from the payload into ApiException; register ct.Register(www.Abort).
T4-20 | server-scaling.eng snippets | Net.send(OP, string) and socket.Send(Op, long) do not match the realtime-protocol send(op,id,body) signature. | server-realtime-protocol snippets | low | Align or note pseudo-code.
T4-21 | backend-api-protocol.eng.godot.snippet | Sends ProjectSettings version as client version, while infra-artifacts-provenance pitfall says that hand-bumped value is wrong. | both topics | low | Read the injected build_info.json.
T4-22 | backend-data-access.eng.godot.snippet | Loop variable `name` shadows Node.name (warning); same for `name` in Telemetry.event and `seed` in Sim.run. | GDScript shadow warnings | low | Rename.
T4-23 | server-determinism.eng.godot.pitfall | "Iterating a Dictionary and assuming order": Godot 4 Dictionaries keep insertion order. | Godot 4 Dictionary docs | low | Say order follows insertion order, so build identically.
T4-24 | server-state-sync.eng.godot.snippet | Comment says remote peers live "one buffer in the past" but code is exponential smoothing; `sync` var unused. | snippet | low | Fix comment.
T4-25 | server-realtime-protocol.games | CS2 sub-tick lens links here but is about input timing; server-state-sync, which describes sub-tick, has no game link. | counter-strike-2 lens ui topics | low | Link the lens to server-state-sync.
T4-26 | infra-secrets.iv.senior | Says a store keystore "is unrecoverable"; WHY says Play App Signing lets you reset the upload key. | same topic | low | Qualify: where the store holds no copy.
T4-27 | backend-migrations-config.iv.junior | Typo "a additive nullable column". | iv text | low | "an additive".
T4-28 | infra-deploy-models.eng.unity.term | Says Dedicated Server "is a build target, not a define"; Unity also defines UNITY_SERVER. | Unity Dedicated Server docs | low | Mention UNITY_SERVER.
