# Sources: server-framework-landscape (checked 2026-10-05)

Read = I fetched the page itself (the fetch tool returns a model summary of the page, so quotes are from that summary). Search = only a search-result summary of the page. Photon's documentation host (doc.photonengine.com) blocks automated fetches (security interstitial), so Photon mechanism claims come from the doc-us-test mirror or search summaries.

## Unity
- NfE 1.8.0 is server-authoritative with client prediction, built on ECS, supports Unity 2022.3 LTS and Unity 6 LTS. https://docs.unity3d.com/Packages/com.unity.netcode@1.8/manual/index.html (read)
- NfE prediction: simulation tick 60 Hz, network tick 60 Hz, command slack 2 ticks, rollback and replay on snapshot, "very CPU intensive", predicted and owner-predicted modes. https://docs.unity3d.com/Packages/com.unity.netcode@1.8/manual/intro-to-prediction.html (read)
- NGO 2.0.0 targets Unity 2021.3, 2022.3, 2023.2. https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.0/manual/index.html (read)
- NGO topologies client-server and distributed authority; v2.0.0 supports DA. https://mp-docs.dl.it.unity3d.com/netcode/2.0.0/terms-concepts/network-topologies/ (search summary only)
- DA: session owner re-selected, depends on Multiplayer Services package, no single physics simulation, easier to cheat, "not suitable for high-performance competitive games". https://mp-docs.dl.it.unity3d.com/netcode/2.3.2/terms-concepts/distributed-authority/ (read)
- NGO snippet APIs (NetworkVariable permissions, [Rpc(SendTo.Server)], method name ending in Rpc) are from my knowledge of NGO 2.x, not fetched this session. Fact-checker: confirm against https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.0/manual/advanced-topics/message-system/rpc.html (UNVERIFIED by me).

## Photon
- Pricing: free 20 CCU dev, free 100 CCU launch (one app, ~40k MAU, 0.3 TB), 500/1,000/2,000 CCU at $125/$250/$500 a month, premium $0.50 per CCU with $1,000 minimum. https://www.photonengine.com/fusion/pricing (read)
- Free 100 CCU announced 11 March 2024, one app per studio, not combinable with paid plans. https://blog.photonengine.com/?p=5466 (read)
- Fusion 2: three topologies (dedicated server, client-host, shared authority), client-side prediction, lag compensation, area of interest. https://doc-us-test.photonengine.com/fusion/current/fusion-intro (read mirror)
- Fusion shared mode has no prediction/rollback/resimulation loop, suited to mobile/web and very high player counts, more prone to cheating. https://doc.photonengine.com/fusion/2-shared/fusion-shared-intro (search summary only)
- Quantum 3: deterministic ECS for up to 128 players, predict/rollback on input only, blittable structs, no garbage. https://doc-us-test.photonengine.com/quantum/current/quantum-intro (read mirror)
- Quantum FP type Q48.16 (16 fractional, 48 integer bits). https://doc-api.photonengine.com/en/quantum/current/namespace_photon_1_1_deterministic.html (search summary only)

## Mirror, Fish-Net
- Mirror MIT, Unity 2019-2022 LTS and 6000.1, features list, 480 CCU worst case from 2019. https://github.com/MirrorNetworking/Mirror (read)
- Mirror server authority and host mode. https://mirror-networking.gitbook.io/docs/manual/general (read)
- Fish-Net free, server authoritative, no CCU caps. https://fish-networking.gitbook.io/docs (read)

## Unreal
- Client-server, authoritative server, listen vs dedicated, generic replication, Replication Graph, Iris, relevancy. https://dev.epicgames.com/documentation/en-us/unreal-engine/networking-overview-for-unreal-engine (read)
- Iris experimental, opt-in, "up to 100 players per server instance" (Fortnite Battle Royale), enable steps. https://dev.epicgames.com/documentation/en-us/unreal-engine/introduction-to-iris-in-unreal-engine (read)
- Not claimed: character movement component prediction (named in the Godot `map` note from general knowledge; UNVERIFIED this session).

## Godot
- ENet default, WebRTC, WebSocket peers; authority default server; RPC modes; transfer modes. https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html (read)
- MultiplayerSynchronizer intervals default 0.0, visibility API, replication_config. https://docs.godotengine.org/en/stable/classes/class_multiplayersynchronizer.html (read; page shows Godot 4.7)
- Claim "Godot has no prediction or lag compensation" is my reading: the pages describe none. Not stated as a sentence in the docs.
- MultiplayerSpawner spawn_function must be set on every peer: from my knowledge of the API, not fetched. UNVERIFIED.

## Backends
- Nakama relayed and authoritative modes, turn-based tick rate 1, "hundreds or thousands of matches" per node. https://heroiclabs.com/docs/nakama/concepts/multiplayer/ (read)
- Nakama Apache-2.0, CockroachDB or Postgres-compatible, Lua/TS/Go, Heroic Cloud. https://github.com/heroiclabs/nakama (read)
- Colyseus MIT, schema, binary delta patches, 50 ms default patch rate, SDK list, Colyseus Cloud. https://docs.colyseus.io/ and https://github.com/colyseus/colyseus (read)

## Platform services
- Steam sockets relay through Valve by default, larger messages, reliable delivery, direct connection when appropriate; no cost stated on page. https://partner.steamgames.com/doc/features/multiplayer/networking (read)
- EOS free for any engine, store, platform; voice relayed; matchmaking, lobbies, leaderboards. https://onlineservices.epicgames.com/news/epic-online-services-launches-two-new-free-services (search summary only). The EOS docs pages themselves did not load.

## Hosting
- GameLift fleet types, FlexMatch with queue. https://docs.aws.amazon.com/gameliftservers/latest/developerguide/fleets-intro.html and fleets-intro-anywhere.html (read)
- GameLift pricing: per instance hour, c6a.4xlarge $0.741, Spot 50-85% savings, bandwidth free for generation 6 and later. https://aws.amazon.com/gamelift/servers/pricing/ (read)
- Agones: Apache 2.0, GameServer/Fleet/FleetAutoscaler/GameServerAllocation. https://agones.dev/site/docs/overview/ (read). "Does not describe matchmaking" is an absence in the overview page only.
- Edgegap pricing figures and "Relays carry no compute and are not authoritative servers". https://edgegap.com/pricing (read)
- Hathora: acquired by Fireworks AI March 2026, hosting off 5 May 2026, customers to Nitrado. https://gamesbeat.com/?p=318174 and https://crux.supercraft.host/blog/hathora-shut-down-where-to-go-after-may-2026/ (search summaries only; the vendor's own site redirects to gamefabric.com and says nothing). Secondary; fact-checker should find a primary notice.

## Non-game real-time
- Socket.IO: long-polling first then upgrade, ping 25 s, timeout 20 s. https://socket.io/docs/v4/how-it-works/ (read)
- Socket.IO delivery: at-most-once default, ordering guaranteed, retries option. https://socket.io/docs/v4/delivery-guarantees/ (read)
- Phoenix Channels: WebSocket or long poll, topics, PubSub across nodes, at-most-once. https://phoenix.hexdocs.pm/channels.html (read)
- Ably free tier 6,000,000 messages, 200 connections, 200 channels; $2.50 per million messages; $1.00 per million connection minutes and channel minutes; Standard $29, Pro $399. https://ably.com/docs/platform/pricing (read)
- Firebase Realtime Database: 200,000 simultaneous connections, 100 on Spark, 1,000 writes/s. https://firebase.google.com/docs/database/usage/limits (read)
- Pusher: limits page URL returned 404; no Pusher number is used. Pusher is named only as a category.

## Changes after the fact-check (2026-10-05)

Most fact-check items were already applied by an earlier pass (NGO Unity 6 requirement, Photon premium up to 50,000 CCU, shared-mode arbitration wording, Agones integration patterns, Hathora hedge, Ably "concurrent", Nakama CockroachDB-only, Unity snippet using FireRpc with `using UnityEngine;`, Godot spawn_path comment, Mirror 2022 benchmark, Socket.IO "by default", diagram family fixes). Verified present in the file this pass. New in this pass:
- Go snippet: closed input channel now returns (`case i, ok := <-in`), and every Dx/Dy goes through `clamp` (maxStep 5), matching the comment. Fact-check code issue, no source needed; not compiled (Go not installed), read against Go 1.23 (built-in min and max).
- junior Q3 grammar fixed ("is wrong for").
- how[4] and how[7] shortened to pointers to the stack-choices topic plus a framework-specific line (repetition item). New how step: game type to family.
- Godot `map` note: added Replication Graph versus Iris. Sourced from https://dev.epicgames.com/documentation/en-us/unreal-engine/introduction-to-iris-in-unreal-engine (read via fetch summary): Iris keeps a quantized copy of replicated state, separates replication and game-thread data, is Experimental, works alongside the existing system. The page does not mention Replication Graph, so the draft says it gives no comparison and calls the choice a measurement. Replication Graph facts: existing FACTS line.
- Diagram: Mirror moved to the no-built-in-prediction row, labelled "prediction not checked" because https://mirror-networking.gitbook.io/docs front page (read via fetch summary) mentions no prediction. Licence/cost cells added for Godot (MIT, FACTS), Mirror (MIT, README), NGO 2.x needs Unity 6 (registry, FACTS). Unreal royalty terms were NOT sourced: https://www.unrealengine.com/en-US/license returned 403, so the cell says "licence terms not checked here, see Epic". Netcode for Entities cost cell says check Unity's current terms; no price was sourced.
- Still unverified: Unreal licence terms; Mirror prediction support; Go compile.
