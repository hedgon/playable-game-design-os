# Sources: server-bandwidth-and-interest-management

Read = the page itself was fetched and read on 2026-10-05 (through a summarising fetch tool, so exact wording was not verified). Summary only = learned from a search-result summary, page not read.

## Cited claims

- Fiedler, 901 cubes at 60 Hz start at 17.38 Mbit/s; each cube 321 bits (128 orientation, 96 velocity, 96 position, 1 bool). https://gafferongames.com/post/snapshot_compression/ (read)
- Smallest three: 2-bit index of the largest component plus three at 9 bits = 29 bits, range plus or minus 0.707107. Same page (read)
- Position 50 bits (X, Y 18 bits at 512 values per metre, Z 14 bits); delta position averages 26.1 bits; delta orientation 23.3 bits; the article states 256 kbit/s as the target (the end result is shown only in videos); 26.1 bits is the average for changed positions only. Same page (read)
- Delta against an acknowledged baseline: receiver acks the newest snapshot, sender sets it as baseline; flag for "relative to initial state" before any ack. Same page (read)
- Priority accumulator: float per object kept frame to frame, add priority each frame, sort, fill packet to budget, reset only for serialised objects; 256 kbit/s limit as the example. https://gafferongames.com/post/state_synchronization/ (read)
- Bounded quantisation formula, bits = ceil(log2(range+1)) (example 0..1000 is 10 bits). https://gafferongames.com/post/serialization_strategies/ (read)
- Bit packing: a bool wastes 7 bits as a byte, 0..1000 needs 10 bits not 16. https://gafferongames.com/post/reading_and_writing_packets/ (read)
- Real-world MTU 1500 bytes (2016, IPv4); conservative safe packet size 1200 bytes; fragment loss compounds (1% loss: 2 fragments about 2%, 10 about 9.5%, 256 about 92.4%). https://gafferongames.com/post/packet_fragmentation_and_reassembly/ (read)
- Replication Graph: Battle Royale starts with 100 players and about 50,000 replicated actors; the standard per-actor, per-client relevancy bottlenecks server CPU; persistent graph nodes (spatial grid, dormancy, always relevant, attachment) share precomputed lists across frames and connections. https://dev.epicgames.com/documentation/en-us/unreal-engine/replication-graph-in-unreal-engine (read)
- Unreal relevancy rule order (bAlwaysRelevant, owner, bOnlyRelevantToOwner, bNetUseOwnerRelevancy, NetCullDistanceSquared). https://dev.epicgames.com/documentation/en-us/unreal-engine/actor-relevancy-in-unreal-engine (read; only used as background, no numbers cited)
- Unreal networking overview: priority controls importance per frame under limited bandwidth; dormancy controls whether an actor is in a connection's replication list and is called one of the most significant optimisations. https://dev.epicgames.com/documentation/en-us/unreal-engine/networking-overview-for-unreal-engine (read)
- Iris: opt-in alongside legacy; keeps a quantised copy of replicated state; shared work; native filtering and prioritisation; the page labelled it experimental and listed four enable steps and -UseIrisReplication. The legacy system stays default. https://dev.epicgames.com/documentation/en-us/unreal-engine/introduction-to-iris-in-unreal-engine (read; check the current status label before publishing, it is the most likely line to be stale)
- Godot MultiplayerSynchronizer properties and defaults (replication_interval 0.0, delta_interval 0.0, public_visibility true, visibility_update_mode default idle, add_visibility_filter, set_visibility_for, update_visibility). https://docs.godotengine.org/en/stable/classes/class_multiplayersynchronizer.html (read). The snippet uses VISIBILITY_PROCESS_NONE and the claim that the default re-runs filters every process frame is inferred from "VISIBILITY_PROCESS_IDLE" default; fact-checker please confirm against the class page.
- Netcode for GameObjects visibility: hidden object despawns on that client and sends no traffic; CheckObjectVisibility called on connect or just before spawn; absent callback means visible to all. https://mp-docs.dl.it.unity3d.com/netcode/2.3.2/basics/object-visibility/ (fact-check read the page itself; the 2.3.2 page is marked unmaintained, current is 2.4+). NetworkShow, NetworkHide and IsNetworkVisibleTo are used in the snippet from memory of the NGO API; verify they exist in the NGO 2.x release.
- Mirror interest management: three reasons (scale, visibility, cheating prevention); built-in spatial hashing, distance, scene, match, team. https://mirror-networking.gitbook.io/docs/manual/interest-management (read)
- Valve Source: cl_updaterate default 20; server never sends more than simulated ticks or the client rate; delta snapshots against last acknowledged; sv_minrate and sv_maxrate in bytes per second. https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking (summary only, from search result; the page itself returned 403)

## Computed in the text (our arithmetic, no source needed; fact-check the sums)

- 100 players: 100 x 99 = 9,900 updates per tick; 10,000 players about 10^8.
- 1,200 bytes x 30 Hz = 36,000 B/s. 256 kbit/s = 115.2 MB per hour; 20 kbit/s = 9 MB per hour; 5 MB per hour = about 11.1 kbit/s.
- IPv4 20 + UDP 8 = 28 bytes (RFC 791 and RFC 768); 28 x 30 = 840 B/s; 28 x 20 = 560 B/s.
- 2,000 m at 5 cm = 40,000 steps = 16 bits; 200 m at 5 cm = 4,000 steps = 12 bits; total 44 bits.
- Smallest-three at 9 bits: step 1.4142 / 512 about 0.0028.
- 4 km map, 150 m cells: 27 x 27 = 729 cells; 3 x 3 block = 202,500 m2 / 16,000,000 m2 = 1.27 per cent. (250/150)^2 = 2.78.
- Explainer accumulator arithmetic in the EXPLAINER block.

## Not verified / author judgement

- Halo Reach networking talk (Aldridge, GDC 2011, "I Shot You First", https://www.gdcvault.com/play/1014345/I-Shot-You-First-Networking): the GDC Vault page is behind a paywall. Title and speaker confirmed; no claim in the topic rests on its content.
- The Tribes networking model (GDC 2000) was not retrieved and is not cited.
- Distance tier values (20 m / 60 m / 150 m, every 1 / 3 / 10 ticks / 1 s) and the 20 per cent hysteresis are the author's starting values, labelled as such in the text, not from a source.
- Unreal NetUpdateFrequency / MinNetUpdateFrequency defaults and Fortnite's actual Replication Graph cell size are not stated; not verified.
- Smallest-three 10-bit variant (32 bits) is arithmetic on the same scheme, not a figure from the source.
- The Go snippet could not be compiled: Go is not installed here. Run node src/check-go.js where Go 1.23+ exists.

## Added after the fact-check (2026-10-05)

- Iris enablement: four steps (plugin in .uproject, SetupIrisSupport(Target) in .Build.cs, bUseIris = true in .Target.cs, DefaultEngine.ini entries), runtime switch -UseIrisReplication. https://dev.epicgames.com/documentation/en-us/unreal-engine/introduction-to-iris-in-unreal-engine (page read by the fact-checker)
- Unreal relevancy: bAlwaysRelevant overrides bOnlyRelevantToOwner; bOnlyRelevantToOwner; NetCullDistanceSquared is the square of the maximum distance from the client's viewport. https://dev.epicgames.com/documentation/en-us/unreal-engine/actor-relevancy-in-unreal-engine (read)
- NetUpdateFrequency is the maximum updates per second, MinNetUpdateFrequency the minimum; adaptive: an actor with no meaningful update for over 2 seconds lowers its rate, reaching the minimum after 7 seconds. https://dev.epicgames.com/documentation/en-us/unreal-engine/property-replication-in-unreal-engine (summary only, from a search result; please read the page)
- IPv6 IP plus UDP headers = 40 + 8 = 48 bytes. RFC 8200 and RFC 768 (from memory; not fetched).
- Upstream example (illustrative, our assumption): about 10-byte input packet + 28 header = 38 B x 30 Hz = 1,140 B/s = 9.1 kbit/s. Downstream example: 20 entities x 6 B x 30 Hz = 3,600 B/s + 840 B/s headers = 4,440 B/s = 35.5 kbit/s.
- 10,000 clients x 64 kbit/s = 640 Mbit/s; x 256 kbit/s = 2.56 Gbit/s (arithmetic).
- Crowd cap of 64 entities, 0.25 s refresh, all-pairs "10,000 checks at 100 players", and "dozens of players" for the profiler line are the author's illustrative values, labelled as such in the text. The 20 per cent hysteresis is labelled a starting value in how[7].
- Interview mid 3 now states 1.25 others in the 3 by 3 block and about 0.4 in the 150 m circle (99 x 1.27 per cent; 99 x pi x 150^2 / 16e6 = 0.44).
- Go snippet changed (still not compiled, Go is not installed): Read returns ErrShort, Decode and ReadQ reject values above Steps, hi <= lo gives Steps 0, widths over 32 return ErrRange. Unity snippet handles a null player object and skips the host id (ServerClientId is from the fact-check's API read; the NGO refusal to hide from the server is unconfirmed).
- Halo Reach talk left out: not readable.
