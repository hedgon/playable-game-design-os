# Fact-check: server-bandwidth-and-interest-management

Checked 2026-10-05 against `drafts/server-bandwidth-and-interest-management.js`, its
`.sources.md`, `briefs/topics.md` (`## server-bandwidth-and-interest-management`) and
`briefs/topic-common.md`. Sources were fetched raw with curl and read as text. The Valve
page sits behind a bot check for curl and the Wayback Machine returned 429. It was read
as the full page text through the r.jina.ai reader. Draft validation:
`PLAYABLE_DRAFTS=... node src/validate.js` ends `OK: all cross-links resolve, all topics complete.`

## Verdict: PASS WITH FIXES

No error changes what the topic teaches. The fixes are 1 minor WRONG wording (Iris enable
steps), 4 unsourced specifics to source, soften or label as the writer's own, 1 banned word,
and some thin coverage (see below).

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
|---|---|---|---|---|
| "100 players is 9,900 … 10,000 players about 100 million" | why[0], interview junior 1 | CONFIRMED | 100x99 = 9,900; 10,000x9,999 = about 1.0e8 | arithmetic |
| "packet over about 1,200 bytes risks fragmentation" | why[1], diagram, interview | CONFIRMED | Fiedler: MTU 1500 in 2016; 1200 bytes is his "conservative lower bound" | https://gafferongames.com/post/packet_fragmentation_and_reassembly/ |
| "roughly 36 kB per second at 30 Hz" | why[1] | CONFIRMED | 1,200 x 30 = 36,000 B/s | arithmetic |
| "256 kbit/s uses about 115 MB an hour … 20 kbit/s about 9 MB" | why[2] | CONFIRMED | 115.2 MB; 9.0 MB | arithmetic |
| "Mirror's documentation lists cheating prevention as one of its three reasons" | why[3] | CONFIRMED | Reasons listed: Scale, Visibility, Cheating | https://mirror-networking.gitbook.io/docs/manual/interest-management |
| "Float32 holds 24 bits of precision" | think.traps[0] | CONFIRMED | 23 stored + 1 implicit bit | IEEE 754 binary32 |
| "28 bytes of IPv4 and UDP headers" | traps, how[0], interview, prompt | CONFIRMED | 20 (IPv4, no options) + 8 (UDP). On IPv6 it is 48 (see teaching notes) | RFC 791, RFC 768 |
| "2 km … at 5 cm is 40,000 steps … 16 bits … 4,000 steps … 12 bits … 44 bits, not 96" | how[1], TECH quantisation, interview junior 2 | CONFIRMED | ceil(log2(40,001)) = 16; ceil(log2(4,001)) = 12; 16+16+12 = 44 | arithmetic |
| "0 to 1000 is 10 bits … five members is 3 bits" | how[2] | CONFIRMED | ceil(log2 1001) = 10; ceil(log2 5) = 3 | https://gafferongames.com/post/serialization_strategies/ |
| "smallest three … 29 or 32 bits instead of 128" | how[3], TECH, interview mid 4 | CONFIRMED | 2+3x9 = 29 (Fiedler's figure); 2+3x10 = 32 (arithmetic); 4 x float32 = 128 | https://gafferongames.com/post/snapshot_compression/ |
| "smaller three lie in [-0.7071, +0.7071]" | TECH, interview | CONFIRMED | Fiedler: [-0.707107, +0.707107] | same |
| "At 9 bits the step is about 0.0028" | TECH smallest-three cost | CONFIRMED | 1.41421/511 = 0.00277 (or /512 = 0.00276) | arithmetic |
| "Fiedler's cube demo cut a position from 50 bits to 26.1 on average" | TECH delta, fit | CONFIRMED with note | 26.1 is the average for *changed* positions encoded against the baseline; say "changed positions" | snapshot_compression |
| Priority accumulator: float per object kept frame to frame, add, sort, fill to budget, reset only those sent | how[5], TECH, interview mid 2 | CONFIRMED | Fiedler also skips an update that does not fit and tries the next | https://gafferongames.com/post/state_synchronization/ |
| Ack newest snapshot, encode against it, flag for initial state before any ack | how[4], TECH, interview mid 1 | CONFIRMED | | snapshot_compression |
| "4 km square map at a 150 m radius, the 3 by 3 block is 1.3 per cent" / "27 by 27, or 729 cells" | TECH grid, interview mid 3 | CONFIRMED | 4000/150 = 26.7, so 27; 202,500/16,000,000 = 1.27% | arithmetic |
| "an evenly spread crowd of 100 gives each player one or two others" | interview mid 3 | CONFIRMED with note | 99 x 1.27% = 1.25 in the 3x3 *block*. Inside the exact 150 m circle it is 0.44. Say which. | arithmetic |
| "(250/150)² … about 2.8 times" | interview senior 3 | CONFIRMED | 2.78 | arithmetic |
| "5 MB an hour is about 11 kbit/s … 20 packets per second are 560 bytes per second, about 4.5 kbit/s" | interview senior 2 | CONFIRMED | 11.1 kbit/s; 4.48 kbit/s; leaves about 6.6 kbit/s | arithmetic |
| "28 x 30 = 840 bytes per second" | interview junior 3 | CONFIRMED | | arithmetic |
| "All-pairs distance checks … fine to about 100 players" | TECH grid alt | UNSUPPORTED | No source. Label as a rough rule of thumb or drop the number | none found |
| "the first thing a profiler shows at 64 players" | ENGINE unity pitfall | UNSUPPORTED | No source. Drop "at 64 players" or label as illustrative | none found |
| "4 times a second is plenty for a 150 m radius" | ENGINE godot pitfall | UNSUPPORTED (writer judgement) | Label as a starting value, as how[9] does for the tiers | none |
| Epic: Fortnite BR "100 connected players and about 50,000 replicated Actors"; per-actor per-client strategy "will bottleneck the server's CPU" | TECH replication graph alt, FACTS[0], interview senior 1 | CONFIRMED | Epic's page names Fortnite Battle Royale | https://dev.epicgames.com/documentation/en-us/unreal-engine/replication-graph-in-unreal-engine |
| Iris "opt-in … alongside", "experimental", legacy stays default, runtime switch -UseIrisReplication | FACTS[1] | CONFIRMED | UE 5.8 page (current default): "Learn to use this Experimental feature", page metadata `"readiness":"experimental"`; "the existing replication system is still used as the default"; switch is `-UseIrisReplication=1` / `=0` | https://dev.epicgames.com/documentation/en-us/unreal-engine/introduction-to-iris-in-unreal-engine |
| Iris "enabled by a plugin, a build setting and a configuration entry" | FACTS[1] | WRONG (minor) | Four steps: Iris plugin in the .uproject, `SetupIrisSupport(Target)` in .Build.cs, `bUseIris = true` in .Target.cs, `net.SubObjects.DefaultUseSubObjectReplicationList=1` (and `net.Iris.UseIrisReplication=1` past 5.1) in DefaultEngine.ini. Write "a plugin, two build settings and configuration entries" | same |
| "Iris moves in the same direction with quantised state and shared work" | interview senior 1 | CONFIRMED | Iris keeps "a full copy of all replicated state data in a quantized form" so work can be shared between connections | same |
| Dormancy "controls whether an actor is added to a connection's list … one of the most significant optimisations" | TECH dormancy fit, FACTS[2] | CONFIRMED | Exact text: "one of the most significant optimizations you can make in your network gameplay" | https://dev.epicgames.com/documentation/en-us/unreal-engine/networking-overview-for-unreal-engine |
| Godot: replication_interval and delta_interval default 0.0 = every network process frame; public_visibility true; add_visibility_filter, set_visibility_for, update_visibility; visibility_update_mode default 0 = every process frame; VISIBILITY_PROCESS_NONE = manual update_visibility() | FACTS[3], ENGINE godot | CONFIRMED | Godot 4.7 stable page. Filter "should take a peer ID int and return a bool". update_visibility(for_peer = 0) updates all peers | https://docs.godotengine.org/en/stable/classes/class_multiplayersynchronizer.html |
| NGO: hidden object despawned on that client, no traffic; CheckObjectVisibility invoked on connect or just before spawn; unset = visible to all | FACTS[4], ENGINE unity term | CONFIRMED | Read on the page itself (the writer had only a summary). The 2.3.2 page says it is no longer maintained; the latest is 2.4.2. Consider citing the current version | https://mp-docs.dl.it.unity3d.com/netcode/2.3.2/basics/object-visibility/ |
| Valve: cl_updaterate default 20; server never sends more updates than ticks or the client rate; sv_minrate / sv_maxrate in bytes/second | FACTS[5] | CONFIRMED | Live page text: "`cl_updaterate` (default 20), but the server will never send more updates than simulated ticks or exceed the requested client `rate` limit … `sv_minrate` and `sv_maxrate` (both in bytes/second)" | https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking |
| Fiedler "starts from 17.38 Mbit/s for 901 cubes at 60 Hz" | FACTS[6] | CONFIRMED | Prose says 17.37 and the worked sum says 17.38. 321 bits per cube | snapshot_compression |
| Fiedler "reaches about 256 kbit/s" | FACTS[6] | UNSUPPORTED | In the article text 256 kbit/s is only the *target* ("Our target bandwidth is 256 kilobits per-second"). The end result is shown only in videos ("the end result is pretty good"). Write "targets 256 kbit/s" | snapshot_compression |
| Fiedler "positions at 50 bits" | FACTS[6] | CONFIRMED | 18+18+14 at 512 values per metre | snapshot_compression |
| Distance tiers 20/60/150 m, every 1/3/10 ticks / 1 s | how[9] | CONFIRMED as labelled | "A sensible start … Tune the tiers" shows they are a starting value | writer's own |
| Hysteresis "about 20 per cent" | how[7]; snippets 150/180 | LABELLING GAP | how[7] gives it as an instruction with no "starting value" wording, so the sources.md note "labelled as such in the text" does not hold here. Snippets use 150/180 (= 20%, consistent). Add "a starting value, tune it" | writer's own |
| Explainer arithmetic (4/3/2/0.5/0.1, three slots; door 2.5 beats grenade 2 at tick 5) | EXPLAINER | CONFIRMED | Simulated: tick 4 is a tie (door 2.0 = grenade 2.0, settled by order); tick 5 sends P,E,D. The crate is first sent at tick 22, so "every entity eventually sent" holds | node simulation |

## Code issues

**Go (not compiled: Go is not installed on this machine).** I read it line by line against Go 1.23:
- Imports: only `math`, and it is used (Round, Ceil, Min, Max). No unused variables. `package netpack` with no main is fine.
- `uint64(1)<<bits` with `bits uint`: valid. The loop stops at the smallest `bits` with 2^bits > steps, which means 2^bits >= steps+1. That is the same as ceil(log2(steps+1)). Checked: steps 40,000 gives 16, steps 4,000 gives 12, steps 1,023 gives 10, steps 1,024 gives 11.
- `NewQuantiser(0, 2000, 0.05)`: 2000/0.05 is 40000.0 in float64. The error (about 2e-12) is below half the spacing between doubles at 40,000 (about 3.6e-12), so Ceil gives 40,000, not 40,001. In general, float noise in the quotient can make Ceil add one step. That is harmless because the step gets finer.
- `v>>i&1 == 1`: `>>` and `&` share precedence and associate left, and `==` binds lower, so this is `((v>>i)&1) == 1`. Correct.
- `w.buf[w.bits/8] |= 1 << (w.bits % 8)`: the untyped 1 takes type `byte` from the `|=` context. The shift is under 8, so there is no overflow. It compiles.
- `uint32(r.buf[r.bits/8]>>(r.bits%8)&1) << i`: byte shift, then mask, then convert, then shift by `uint`. Correct.
- Edge cases, not compile errors: (a) `hi == lo` gives `Steps = 0`, so Encode computes 0/0 = NaN and `uint32(NaN)` is implementation-defined. (b) A NaN input to Encode passes through Min and Max as NaN with the same result. (c) `n > 32` in Read or Write silently drops high bits. None of these is reachable with the topic's examples. A one-line doc comment ("hi > lo, n <= 32") would be enough.
- Teaching gap: how[2] says "make the reader reject a value outside its declared range", the pitfall says the same, and test[3] says the reader "must reject or clamp, never crash". But the snippet's `Reader.Read` panics on a short buffer, and nothing checks `n <= Steps` in Decode. The comment admits the panic. Either add a `ReadQ(q Quantiser) (float64, bool)` that checks the range and the length, or say plainly that the check is left to the caller.

**Unity NGO 2.x.** Every API name was confirmed on the NGO 2.5 API reference (docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.5/api/):
`NetworkObject.CheckObjectVisibility` (a `VisibilityDelegate` field, "if null it will assume true"),
`public void NetworkShow(ulong clientId)`, `public void NetworkHide(ulong clientId)`,
`public bool IsNetworkVisibleTo(ulong clientId)`, `NetworkManager.ConnectedClientsIds`
(`IReadOnlyList<ulong>`), `NetworkSpawnManager.GetPlayerNetworkObject(ulong clientId)`.
The snippet follows Unity's own example on the visibility page. Snippet risks:
- `GetPlayerNetworkObject(id)` returns null when that client has no player object (no player prefab, or the callback runs before the player spawns). `Dist` then throws a NullReferenceException. Unity's own example makes the same assumption. Add a null check that returns false.
- In host mode `ConnectedClientsIds` includes the host's own client id. From memory, NGO refuses to hide an object from the server, and I did not confirm this on the reference. Consider skipping `NetworkManager.ServerClientId` too.
- Unity's example refreshes on `NetworkTickSystem.Tick` and the draft uses `InvokeRepeating`. Both work.

**Godot 4.** All the API names exist with these signatures (see the table). `visibility_update_mode = VISIBILITY_PROCESS_NONE` plus a Timer calling `update_visibility()` is the documented manual mode. `Game.player_distance` is a placeholder and is commented as one.

## Teaching issues

- Header cost assumes IPv4 (28 bytes). A large share of mobile traffic is IPv6, where IP+UDP is 48 bytes. One clause ("48 on IPv6") would make the mobile budget honest.
- Fiedler's "26.1 bits" applies to changed positions only, and the 50-to-26.1 wording could read as all positions.
- The interview answer "one or two others" counts the 3x3 block, not the radius. After the exact filter it is fewer than one.
- "Fiedler's … reaches about 256 kbit/s" (FACTS) overstates what the text shows.
- The tricks are given with their costs (TECH `cost` and `alt` are filled for every row). No trick is presented without one.

## Missing or thin coverage (brief "Must cover")

- **Halo Reach GDC talk**: named in the brief, absent from the draft. The writer could not access it and said so. It is still a gap. Even a one-line attribution of its priority/budget scheme would need a readable source, such as the GDC Vault free video or slides if available.
- **Unreal relevancy (not the graph)**: NetCullDistanceSquared, bAlwaysRelevant, bOnlyRelevantToOwner and NetUpdateFrequency are not taught. The draft covers only the Replication Graph, dormancy and Iris. Thin.
- **Upstream vs downstream**: one sentence in `what`, with no numbers. For example, an input packet's size and rate against a snapshot's. Thin.
- **100 (battle royale) vs 10,000 in a shard**: 10,000 appears only in the N² line. The draft does not say what changes at shard scale (per-cell crowd caps, aggregate or impostor tiers, splitting the interest work across servers). The rel to server-scaling and the world-partitioning topic may carry it. Thin.
- Everything else on the list is covered with numbers: the budget, mobile caps, bit packing, quantisation, smallest-three, delta against the ack, the priority accumulator, the grid / spatial hash, the Replication Graph, Iris, rate by distance, dormancy and measuring.

## Style

- "robust" appears once: TECH delta `alt`, "trivially robust". It is a banned word. Use "trivially safe against loss".
- No other hype words. No US spellings found (I searched for -ize/-ization/-yze/-avior/-color/-center). The quoted Unreal text is paraphrased in UK spelling.
- No employer, colleague or internal project of the site owner. Named companies (Epic, Valve, Unity, Mirror) are public.

## Set aside

- Valve's FACTS entry is not used in the body text. That is fine: FACTS can hold context.
- "64 kbit/s down on mobile or 256 kbit/s on desktop" (how[0]) is presented as an example budget the reader picks, not as a measured fact. Not flagged.
- Fiedler's "17.37" vs "17.38": the article uses both, and the draft's 17.38 is his worked total. Not flagged.
- The NGO doc cited is version 2.3.2, now marked unmaintained. The claims still hold on 2.4/2.5, so it is not OUTDATED, only a suggestion to cite the current version.
- The Godot snippet's `_seen` dictionary is never cleared for disconnected peers. That is a small leak, and the snippet is clearly a sketch. Not flagged.
- `CheckObjectVisibility = …` (assignment) vs Unity's `+=`: the field is a delegate, and assignment is valid and arguably clearer. Not flagged.
- Smallest-three at 10 bits = 32 is the writer's arithmetic and is labelled so in sources.md. Correct.
- Distance tiers 20/60/150 m: correctly labelled as a starting value in how[9]. They appear nowhere else.
- How I read the Valve page: curl hit a bot check and the Wayback Machine returned 429. The text came from the r.jina.ai reader of the live page, not a search summary.
