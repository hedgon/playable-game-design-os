# Content gaps: what the site already says on six subjects (2026-10-05)

Method: Grep and Read over `src/*.js`, judging whether a passage teaches the subject or only contains the word. All line numbers are `src/` files as of this date. Counts: 211 topics (grep `^T('`), domains in use: ai, backend, careers, content, core, craft, experience, gameai, infra, leadership, level, management, models, narrative, platforms, player, presentation, product, production, server, studio, systems, ux. Only four comparisons exist (`46-comparisons.js:6,31,53,75`: failed-run, teaching-without-words, hard-for-everyone, daily-habit); none touches these six subjects, so they are omitted below. The glossary (`06-glossary.js`) has 85 lines; relevant terms are noted per subject.

Path and stage ids below are from `50-paths.js` and `51-paths-engineering.js`. The programme plan (`docs/program-2026-10/plan.md`, G2-G8, P6-P7) already schedules CrossCode, Rhythm Heaven and Rhythm Doctor as game entries and new topics for G4, G5, G7, G8; this note feeds those.

---

## S1. Backtracking in non-linear games

### (a) What exists

Depth reached: one-liners and game-lens evidence. No topic teaches backtracking, gate taxonomy, fast travel or return-trip design.

- `spatial-composition` (`25-topics-level.js:209-216`): names "a shortcut back" as something attention should earn (212), lists "Backtracking through unchanged space" as a trap (214), and the "good" signal "players treat a return trip as a reward, not a repeat" with Doom keycards (215). Deepest direct statement, still three sentences.
- `level-blockout-and-metrics` (`25:409-478`): critical path versus optional space; Mega Man X hides upgrades off-route (478). Not about return trips.
- `knowledge-as-progression` (`23:707-724`): lock-and-key versus comprehension gate classification (716, 718, 724). Gives the vocabulary for gates, no ability gates.
- `puzzle-design` (`24:481-`): solution-space mapping catches "unintended shortcut" solutions (497). Different meaning of shortcut.
- `progression` (`23:385`): "unlocks (access)" listed as one kind (386). `items-weapons-abilities` (`24:199-200`): abilities that change the verb set; nothing on abilities as keys.
- `companion AI` (`32:639,644,653,700`): stuck allies force backtracking, "the loudest immersion break". Useful negative example only.
- Smell `ignore-content` cause "No promise: the environment does not signal value" (`12-diagnostics.js:187`) points to `spatial-composition`.
- Glossary: no entry (Checkpoint exists, `06-glossary.js`, not relevant).

Reference games with real S1 content (lens text):
- `hollow-knight`: world lens, `16-games-analysis.js:89-98` (many-route network versus Super Metroid's mostly set order, stag stations as speed reward, "plan how a lost player finds the next step"); loop diagram `14-references.js:101`; map as purchase `16:132-133`.
- `dark-souls`: `17-games-japan.js:805-824` (shortcut loops, bonfire, fast travel withheld until the Lordvessel, 811, 813, 820-824, 843).
- `elden-ring`: `18-games-genres.js:1090` (Torrent and Graces) and 1189-1194 (fast travel replaces the world-scale shortcut loop; the cost line 1194 says the field loses the spatial-memory reward). Best treatment of fast travel as a trade.
- `skyrim`: fast travel to discovered places `18-genres:159,177`; towers contrast 220.
- `valheim`: `18-genres:3871-3883, 3937-3945` (portals refuse ore: restrict what fast travel carries, not where it goes; principle at 3943).
- `doom`: `18-genres:1611,1613,1693-1697` (key hunts, backtracking is the design, varied heights show a room from a new angle).
- `zelda` series: `18-games-series.js:2273-2361` (item-as-key loop; copies fail because new tools are stronger, not answers to a seen obstacle, 2284, 2361); Breath of the Wild drops the lock, `50-paths.js:380`.
- `mega-man-x`: `18-series:1159-1233` (optional Sub Tank corners, 1233).
- `touhou` (Luna Nights): `18-series:804-831`. `outer-wilds`: gates are knowledge gaps, `18-games-innovative.js:436`. `diablo-ii`: waypoints `18-genres:1551`.
- Super Metroid is cited in text (`16:94,98`) but is not an entry.

Path coverage today: `level-and-ux-designer` s1 (`50:555-559`, spatial-composition then Hollow Knight world lens) and s2 (Skyrim UI lens, `50:583`); `games-that-broke-the-mould` s2 (knowledge gates, `50:697`); `game-designer-foundations` s3 (Zelda gameplay lens, `50:380`); `study-the-hits-play` s5 (Dark Souls gameplay lens, `50:880`, Valheim `50:941` in `idea-to-prototype-30-days` s2).

### (b) Missing sub-subjects
1. Gate taxonomy: ability, key, knowledge, stat, story, social; sequence-breaking and soft gates.
2. Return-trip economics: travel-time budget, how often a player re-crosses a space, number targets.
3. Payoff types for revisiting: new vantage, changed state, new reachability ("of course" moment), loop-closing shortcut.
4. Shortcut design: one-way doors, place and unlock cost, loop length.
5. Fast travel design space: when unlocked, node cost, restrictions, combat-lock; its cost to spatial memory.
6. Map as design tool: bought maps, annotations/pins, markers for unreachable places, memory aids ("I could not reach that").
7. Enemy and resource rules on re-entry (respawn, scaling, level-gating) and what makes a return trip a chore.
8. World-state change so old rooms read differently; content budget of reuse.
9. Telemetry and playtest: where players stall, how to detect a chore (distance walked per ability found).
10. Accessibility: memory load of long-gated maps, optional waypoint aids.
11. Quest-level backtracking in RPGs (`quests-and-events`, `24:291`, has none).

### (c) Recommendation
- Create `backtracking-and-return-trips`, domain `level`. Scope: gate taxonomy and return-trip budgeting; revisit payoffs and shortcut loops; map, fast travel and memory aids. Rel: `spatial-composition`, `level-structure`, `level-blockout-and-metrics`, `knowledge-as-progression`, `progression`, `quests-and-events`, `pacing`, `controls-and-friction`, `onboarding` (marker defaults).
- Optional second topic `fast-travel-and-world-traversal` (domain `level`) only if the first grows past one read; it must not repeat the gate taxonomy.
- Do not rewrite `spatial-composition`; instead replace its trap line (214) with a pointer. Rule `verification-first.md` forbids pruning, so extend, do not delete.
- Lens candidates: add a `world`-lens `topics:` link from Hollow Knight, Dark Souls, Elden Ring, Valheim to the new topic.

### (d) Placement
- `level-and-ux-designer` s1 (`level structure and pacing`), after `spatial-composition` (`50:557`) and before the Hollow Knight step (`50:559`).
- `systems-designer` s2 ("Progression and its pressure", `50:452-474`): as the gate view of progression.
- `games-that-broke-the-mould` s2 as the contrast to knowledge gates (new `review` entry).
- No new path.

---

## S2. Game balancing and power creep as content grows

### (a) What exists
"Power creep" is named in no topic. It appears only in game lenses: Hearthstone `18-games-genres.js:5773` (rotation slows power creep), EA FC `18-games-series.js:3183` ("power creep used as a retention engine"), `90-app.js:2691`. "Sidegrade" and "intransitive" appear nowhere; "transitive" nowhere.

Topics:
- `economy-modelling-and-balance` (`23-topics-systems.js:805-887`): balance anchor, source/sink model, archetype simulation, spreadsheet-first method, Cookie Clicker example, Albion Online GDC balance-anchor fact (820), worked ten-day currency table (922). Economy balance, not combat or content balance.
- `economy-and-resources` (`23:284-363`): cost and reward curves as linear/polynomial/exponential functions (301), Monte Carlo / spreadsheeted balance (303), inflation traps.
- `builds-and-loadouts` (`23:607-698`): dominance, counters not equalisation, pick/win rate, balance simulation by build (626), "nerf then second-best takes its place" interview (684-686), cadence of counters over emergency nerfs (698). Closest to balance methods.
- `items-weapons-abilities` (`24:199-286`): dominant item with no counter; check content supports niches before touching numbers (276-286).
- `core` / `decisions` (`22:112-205`): dominance analysis technique (130), simulation finds ceilings (199-205). `multiplayer-design` (`22:789-797`): counterplay, win-rate trap (794). `difficulty` (`23:480-606`): TTK table (583).
- `content-multiplies` (`24:10-`): content as parameters; redundant content is the failure (what, line 11). Says nothing about content arriving over years.
- `live-operations` (`29:590-`): nerfing in silence (595, 652-654); `live-design-seasons-and-data` (`29:1149-`): Hearthstone rotation named (1150), A/B pitfalls; `monetisation-design` (`29:1032-1045`): pity-rule effective-rate simulation; `server-liveops` (`36:1027`): balance shipped as versioned data (path use `50:1565`).
- Headless simulation harness is one technique row (`23:29`). Smell `one-build` (`12-diagnostics.js:56-63`). Glossary `balance` (`06-glossary.js`, topic `economy-modelling-and-balance`), `gacha` (topic `ethics-and-responsibility`).

Reference games: `slay-the-spire` (telemetry-led balance, `16-games-analysis.js:160-166`, dashboard 3 to 90 graphs); `hearthstone` (rotation, Wild, `18-genres:5770-5778`; dust loss, business lens, `50:1150`); `world-of-warcraft` (level squish 2020, `18-genres:3468,3479`); `pokemon` (type chart changes once per generation, Fairy for Dragon, `18-series:672-678`); `ea-sports-fc` (`18-series:3183`); `overwatch` (rule changes remove dominant strategies, `18-genres:4366-4373`; path `50:1428`); `mega-man`, `street-fighter`, `fire-emblem` (closed rock-paper-scissors, `18-series:19,79,996,2157-2166`); `dota-2` (`18-genres:2470,2506`); `rocket-league` (cosmetic-only versus EA FC, `18-genres:2622`, `18-series:3184`); `cookie-clicker` (exponential cost curve, `18-casual:959`).

Path coverage: `systems-designer` s1-s4 (`50:435,455-456,478-479,500`), `senior-game-designer` s2 and s3 (`50:1145-1147,1167-1171`), `casual-game-people-keep` s3 (`50:1520-1522`).

### (b) Missing sub-subjects
1. Define power creep; vertical versus horizontal power; why content growth forces it; the three levers (powerful new, weakened old, reset).
2. Cost curves in card/unit games (mana curve, stat budget per cost, vanilla test, rarity budgets).
3. Transitive versus intransitive relationships, counter graphs, tier lists, meta-game cycles.
4. Method kit: spreadsheet stat budgets, headless simulation / self-play, win-rate statistics with sample sizes and confidence, matchup matrices, telemetry dashboards, qualitative cross-checks.
5. Power creep by genre: card rotation and formats, MMO gear treadmill and level squish, gacha unit power (and the pity/odds side already in `monetisation-design`), live-service and seasonal power.
6. Countermeasures: rotation, normalisation (fixed stats, role queue, level sync), sidegrades, stat squish/reset, caps, power-budget review.
7. Balance cadence and communication (patch vs generation vs data hot-fix), nerf psychology.
8. PvE versus PvP balance; skill-tier balance (low and high rank).

### (c) Recommendation
- Create `power-creep-and-content-growth`, domain `systems`. Scope: definition and why it happens; the countermeasure set (rotation, normalisation, sidegrade, squish, reset); genre cases; business pressure in gacha and live games. Rel: `content-multiplies`, `economy-modelling-and-balance`, `builds-and-loadouts`, `live-design-seasons-and-data`, `live-operations`, `monetisation-design`, `depth-vs-complexity`, `return-and-quit`.
- Create `balance-methods`, domain `systems`. Scope: cost curves and stat budgets; transitive/intransitive structure and counter graphs; spreadsheets, simulation, win-rate and pick-rate statistics, telemetry loop. Rel: `builds-and-loadouts`, `items-weapons-abilities`, `economy-modelling-and-balance` (explicitly: that topic = currencies and time-to-target, this = relative strength of options), `difficulty`, `multiplayer-design`, `metrics-and-success`, `server-liveops`.
- Do not duplicate `economy-modelling-and-balance` (anchor/sink/archetype); link instead. Fix nothing in existing topics.

### (d) Placement
- `power-creep-and-content-growth`: `systems-designer` s3 ("Depth, content, and diminishing returns", `50:475-496`) beside `content-multiplies` (`50:479`); `senior-game-designer` s3 "Live" (`50:1164-1185`); optionally `casual-game-people-keep` s5.
- `balance-methods`: `systems-designer` s4 ("Experiments, not opinions", `50:497-519`) beside `builds-and-loadouts` (`50:500`); `senior-game-designer` s2 "Economies" (`50:1142-1163`).
- Game steps to add: Hearthstone `replay` lens, WoW and EA FC lenses in those stages. No new path.

---

## S3. Networking for multiplayer at scale, and real-time software at scale

### (a) What exists
The server domain is the deepest area on the site, but scale content is concentrated in a few sentences and one case.

- `server-state-sync` (`36-topics-server.js:310-420`): delta sync against acknowledged state (329), interest management as a technique row (330: "first thing to reach for when bandwidth grows with player count", cost: entry state, popping), snapshot interpolation (327), bandwidth = size x rate x players (312, 389), code at 60 Hz with a snapshot every third tick = 20 Hz (422), tick rate as fairness (374-377), do not fix teleporting by raising tick rate (398-401). No numbers beyond arithmetic recipe.
- `server-realtime-protocol` (`36:442-595`): WebSocket framing, op codes, TCP head-of-line (447), reliable/unreliable channels (460), fan-out of a shared chat channel (542), fuzz and burst tests (456).
- `server-scaling` (`36:754-870`): stateless versus stateful split, room directory, sharded pub/sub fan-out (772), world/shard partitioning (773), drain on deploy (760), fan-out arithmetic prompt (765), load-test on concurrent sessions not RPS (768), diagnose tier by tier (843-847), whether to split population into worlds (823-831, 847). Strongest coverage, still no numbers.
- `server-stack-choices` (`36:1333-1440`): names Netcode for GameObjects, Mirror, Photon Fusion 2, Fish-Net, Godot multiplayer, Agones, GameLift, PlayFab, Nakama, UGS (1334); trade-offs managed versus self-hosted (1337); dated facts for GameLift, Agones, Nakama, Mirror (1434-1437). Names, no mechanism comparison.
- Engine tabs: Netcode for GameObjects (`36:64,349,1374`), Photon Fusion (`36:635`, in matchmaking), Godot `MultiplayerSynchronizer` (`36:334,346`). Unreal Iris appears only as a release fact (`19-engines.js:188`).
- Neighbours: `server-authority` (`36:24-168`, lag compensation 29), `server-determinism` (169-309), `server-rollback-netcode` (1162-1332), `server-matchmaking` (595-753; load testing 686-688), `server-liveops` (1027), `server-anticheat` (893), `backend-api-protocol` (`34:398`), `backend-caching-redis` (`34:1114`, pub/sub sharding 1143), `infra-data-stores` (`35:900-911`, shard key), `infra-deploy-models` (`35:185-265`), `infra-monitoring` (`35:1034`).
- Worked case `cs-go-game-backend` (`41-case-systems-a.js:36`; parts `realtime-fanout` 159-174, `data-redis-jobs` 356-371, `data-migrations-sharding` 375-386; context `40-cases.js:183-192`): hash-modulo channel sharding with the trade-off that resizing remaps channels (168).
- Glossary: `Netcode`, `Latency`, `Rollback netcode`, `Dedicated server`, `Orchestration`.
- Absent (grep verified, whole `src/`): MQTT, Erlang, Elixir, Discord, WhatsApp, Kafka, RabbitMQ, NATS, Colyseus, Quantum, Steam networking, QUIC, WebRTC, WebTransport, quantisation, bit-packing, dead reckoning, seamless zoning, reconnect/connection storm (only `thundering herd` for caches, `34:1122`), autoscaling beyond one line (`35:265`).

Reference games: `counter-strike-2` (sub-tick, 64 versus Valorant 128 tick, `18-genres:1911-1916`); `fortnite` (hundred-player drop, building needs netcode, `18-genres:2010,2020`); `rocket-league` (concurrency `18-genres:2622`); `world-of-warcraft` (40-player raids, `18-genres:3479`); `among-us` (`16-games-analysis.js:1254`, off-platform voice only). Few real scale lessons exist in lens text; most would be new facts.

Path coverage: `netcode-server-engineer` s1 to s5 (`51:436-573`: authority s1, state sync and protocol s2 `51:469-470`, rollback s2b, stack choices s3 `51:509`, scaling s4 `51:531-533`, liveops s5); `live-game-backend-engineer` s3-s4 (`51:387-435`); `interview-prep-engineer` s1-s2.

### (b) Missing sub-subjects
1. Bandwidth budgeting with real numbers; quantisation and bit-packing; priority and relevance; per-field cost.
2. Interest management as its own method: grids/cells, visibility sets, enter/leave, hysteresis, per-tick cost of computing it.
3. Transport: UDP versus TCP versus QUIC/WebRTC/WebTransport, reliability layers, relays and NAT, MTU.
4. World partitioning: zoning, instancing, layering, seamless borders and hand-off, hot spots; its relationship to matchmaking.
5. Connection tier: gateways, connections per node, sticky routing and consistent hashing (the case's modulo remap), backpressure and slow consumers, reconnect storms, graceful drain.
6. Pub/sub and fan-out maths at 10 to 100k+ concurrency; the "10 users versus 100,000" step changes.
7. Load testing real-time systems: bots, headless clients, soak, failure injection, capacity model, p99 under join storms.
8. Framework mechanics (not names): Photon Fusion/Quantum, Netcode for GameObjects/Entities, Mirror, FishNet, Unreal replication and Iris, Godot, Colyseus, Nakama, Steam/EOS networking, GameLift, Agones: which authority/sync/prediction/interest each offers.
9. Software equivalents: WebSockets at scale, MQTT, BEAM (Erlang/Elixir), Discord/WhatsApp-style per-connection processes, presence and fan-out, with official or engineering-blog sources.
10. Observability and cost of realtime at scale (CCU cost model, egress).

### (c) Recommendation
New topics (all need official/vendor sources and `asOf` dates):
1. `server-bandwidth-and-interest-management` (`server`): items 1-2, replacing the one-line technique row as the reference. Rel: `server-state-sync`, `server-realtime-protocol`, `server-scaling`, `craft-memory-and-gc`.
2. `server-world-partitioning` (`server`): item 4. Rel: `server-scaling`, `server-matchmaking`, `infra-data-stores`, `multiplayer-design`.
3. `realtime-connection-tier-at-scale` (`backend`): items 5-6 and 9 (WebSockets at scale, MQTT, BEAM-style processes, Discord/WhatsApp-style architectures). Rel: `server-scaling`, `server-realtime-protocol`, `backend-caching-redis`, `infra-monitoring`, `backend-api-protocol`, `cs-go-game-backend/realtime-fanout`.
4. `server-load-testing-and-capacity` (`server`; or `infra` if the load tools dominate): item 7. Rel: `server-scaling`, `server-matchmaking`, `infra-monitoring`, `backend-testing`.
5. `server-framework-landscape` (`server`): item 8, a mechanism matrix, deliberately separate from `server-stack-choices` (which stays the layer-choice process). Rel: `server-stack-choices`, `server-authority`, `server-rollback-netcode`, `platform-choice`, `platforms-choosing-an-engine`.
6. Optional `server-transport-and-relays` (`server`): item 3.

New path warranted: `realtime-at-scale-engineer` (track `engineering`, level `advanced`), prereq `netcode-server-engineer`. Suggested stages: "Budget the bytes" (topics 1, 6), "Who sees what" (1, 2), "Many connections" (3), "Many rooms" (2, `server-scaling`), "Pick a framework" (5, `server-stack-choices`), "Prove it" (4, `infra-monitoring`). Reason: `netcode-server-engineer` s4 (`51:528`) is only 2.5 hours and already packs scaling, shard key, memory and anti-cheat; the new content would double it.

### (d) Placement
- Also join `netcode-server-engineer` s2 (topic 1) and s3 (topic 5) as optional steps or `review`; topic 3 to `live-game-backend-engineer` s4 ("Observe and operate live", `51:409`); topic 4 to `netcode-server-engineer` s4.
- Games to add as lens steps: `counter-strike-2` tick lens in the new path.

---

## S4. Optimisation of games and software in depth

### (a) What exists
- `craft-performance` (`39b-topics-craft.js:443-516`): the only general optimisation topic. Covers 16.7 ms and 8.3 ms budgets (444), measure on target device, CPU-bound versus GPU-bound test (451), data-oriented design with Mike Acton fact (447, 460), structure of arrays, named profiler markers, benchmark scene in CI with p99 (457), Unity Profiler/Frame Debugger/`ProfilerMarker` (463-486), Godot monitors (488), Deep Profile trap (486). The GPU side is one sentence ("reducing draw calls does nothing for a fill-rate frame", 445).
- `craft-memory-and-gc` (`39b:318-440`): allocation, pooling, GC spikes, orphan nodes. `craft-game-loop-timestep` (1161), `craft-entities-and-scenes` (1261, ECS appears), `craft-ai-cost-latency-budget` (1736), `ai-budgets-and-debugging` (`32:939-958`: AI LOD, time-slicing, budget), `craft-physics-and-collision` (1357).
- GPU appears only incidentally: shared materials, SRP Batcher and the `Renderer.material` clone trap (`28:45-58`); occlusion-culling bake staleness (`25:250,264`); GPU instancing for scatter (`27:233`); frame-rate cap, battery and heat (`29:144-160`).
- Loading and delivery: Addressables tabs (`24:42-55`, `29:626-640`), build size and load time quoted from the editor trap (`30:450`), `infra-cdn-assets` (`35:762-775`, download budget prompt 774), soft-launch technical phase (`29:683,706`).
- Backend: `backend-data-access` (`34:925-1064`: N+1 939, index then EXPLAIN on production-like counts 955, query review prompt 963), `backend-caching-redis` (`34:1114-1230`: tiers, stampede and single-flight 1128/1140, hit rate per prefix 1157), `backend-observability` (`34:1457-`: pprof 1458/1485/1511, flame graph 1485, trace versus profile 1459), `infra-monitoring` (`35:1034`), `infra-data-stores` (`35:900`), `backend-go-idioms` (`34:1807`).
- Web performance: absent (no Core Web Vitals, bundle size, main thread, render-blocking) beyond playable-ad size limits (`29:815`).
- Smells: `ai-black-box` (`12-diagnostics.js:213`). Cases/paths: `craft-performance` appears in `gameplay-engineer-godot` s3 (`51:101`), `gameplay-engineer-unity` s3 (`51:250`), `live-game-backend-engineer` s4 (`51:417`), `interview-prep-engineer` s2 (`51:830`), `senior-game-developer-ai-era` s1 (`51:929`).

Reference games (evidence in lens text): `skyrim` (seamless world, draw distance, `18-genres:157,217`); `diablo-ii` (no loading screen forces music design, `18-genres:1530-1536`); `elden-ring` (PC frame-rate complaints, `18-genres:1082,1170`); `cities-skylines` (individual citizens simulated, `18-genres:2798-2813`; path `50:525`); `kerbal-space-program` (second game's performance complaints, `18-genres:3178-3180`); `fallout-new-vegas` (stability, frame rate, `18-genres:416`); `factorio` (pre-rendered sprite sheet pipeline, `16-games-analysis.js:1122-1127`); `minecraft` (cheap 16x16 blocks, `16:1570`); `worms` (collision follows pixels, `18-genres:587-593`). None teaches an optimisation method; they are illustrations.

### (b) Missing sub-subjects
1. CPU: cache lines and misses with measured costs, AoS versus SoA, ECS/Jobs/Burst in depth, false sharing, branchiness, SIMD, multithreading limits.
2. GPU: draw calls, batching and instancing, overdraw and fill rate, shader cost (ALU, texture fetch, bandwidth), LOD, frustum and occlusion culling, texture compression and mip-maps, post-processing cost, GPU profilers (RenderDoc, vendor tools).
3. Mobile GPU: tile-based rendering, bandwidth and thermal throttling, frame pacing, sustained versus peak performance.
4. Memory and loading: budgets per platform, asset memory, async and streaming loads, bundle layout, startup time, hitching.
5. Frame-time statistics: percentiles, spike versus average, benchmark automation.
6. Backend latency: percentiles/tail latency, latency budgets across hops, connection pools, batching, load shedding, query plans, cache hit economics.
7. Web performance: Core Web Vitals, main-thread work, bundle size, caching and CDN, image/font loading (this site's own performance, plan G9).
8. Method: hypothesis, change one thing, re-measure; tricks of the trade from official engine and vendor docs.

### (c) Recommendation
`craft-performance` stays the hub (do not rewrite). New topics, domain `craft` unless noted, official engine/vendor sources:
1. `craft-cpu-cache-and-data-layout`: item 1. Rel: `craft-performance`, `craft-entities-and-scenes`, `craft-memory-and-gc`, `craft-game-loop-timestep`, `ai-budgets-and-debugging`.
2. `craft-gpu-rendering-cost`: items 2 and 5 (GPU half). Rel: `craft-performance`, `visual-language`, `animation-and-vfx`, `level-blockout-and-metrics`, `camera-design`.
3. `craft-mobile-gpu-and-thermals`: item 3. Rel: `platform-and-session`, `craft-gpu-rendering-cost`, `platform-requirements`.
4. `craft-memory-loading-and-streaming`: item 4. Rel: `craft-memory-and-gc`, `infra-cdn-assets`, `release-and-updates`, `vertical-slice-mvp`.
5. `backend-latency-and-query-optimisation` (`backend`): item 6, consolidating the scattered points (data-access, caching, observability) into a method without repeating them. Rel: `backend-data-access`, `backend-caching-redis`, `backend-observability`, `infra-monitoring`, `infra-data-stores`.
6. `web-performance-basics` (`craft`, or `platforms` if aimed at HTML5 playables): item 7. Rel: `infra-cdn-assets`, `soft-launch-and-playable-ads`.
Possible merge: 2 and 3 into one if the writer budget is tight, but keep mobile separate because thermals are the most engine-agnostic mobile lesson.

New path warranted: `performance-engineer` (track `engineering`, level `intermediate`/`advanced`). Stages: "Measure first" (`craft-performance`), "The CPU and its data" (1, `craft-memory-and-gc`), "The GPU" (2, 3), "Memory and loading" (4, `infra-cdn-assets`), "Services and queries" (5, `backend-observability`), "The web" (6). Prereq: either engine path (`gameplay-engineer-godot`/`-unity`) or `live-game-backend-engineer`.

### (d) Placement
- Existing: topics 1-4 as `review` or optional steps in `gameplay-engineer-godot`/`-unity` s3 ("Feel") and s4 ("Choose and see"); topic 5 in `live-game-backend-engineer` s3 ("Cache, migrate, secure", `51:387`) and s4; `interview-prep-engineer` s2.
- `senior-game-developer-ai-era` s4 "Measure, budget and choose" (`51:991`) should link topic 1 or 2 beside the budget steps.

---

## S5. Puzzle sections in action RPGs; pixel-art direction and world building

### (a) What exists
CrossCode has zero hits in `src/` (grep verified; planned in plan.md G2/P7).

Puzzles:
- `puzzle-design` (`24:481-`): solution space, aha moment, fair versus obscure, red herrings, hint sequencing, Ace Attorney and Danganronpa examples (487-489, 497); Godot tab: check solved state on the action, not by polling (502). General puzzle craft, almost entirely from knowledge/logic puzzles.
- `knowledge-as-progression` (`23:707-724`), `systemic-design` (`23:193`), `items-weapons-abilities` (`24:199`).
- Games: `zelda` series (dungeon item loop, `18-series:2273-2361`), `portal` (`14-references.js:24`; comparison `46:31`), `baba-is-you` (`18-games-innovative.js:540`), `the-witness` (141), `viewfinder` (274), `outer-wilds` (407), `return-of-the-obra-dinn` (8), `celeste` timing windows (`16-games-analysis.js:734-744`). None is an action-RPG with embedded puzzles.
- Paths: `games-that-broke-the-mould` s1 (puzzle-design, Witness, Baba, `50:677-681`), s2 review `puzzle-design`.

Pixel art:
- No topic teaches pixel art, resolution, palette ramps, dithering, tiles, sprite animation budgets. `visual-language` (`28:10`) and its palette bullets (`28:15,27,81,89`) concern gameplay signals.
- Lens evidence only: `stardew-valley` (pixel grid as scope tool, `16:421-427`), `into-the-breach` (flat distinct colours for legibility, `16:301`), `balatro` (CRT filter shapes visual language, `16:662-665`), `vampire-survivors` (asset-pack style, `16:543`), `minecraft` (`16:1570`), `chrono` (sprites faithful to Toriyama, `17-japan:586`), `flappy-bird` (`18-casual:786`), `worms` (`18-genres:587-593`), `factorio` pre-render (`16:1122-1127`).

World building:
- `premise-and-world` (`27:10-100`): premise, world, characters; `environmental-storytelling` (`27:192-290`); `spatial-composition` (`25:209`); the reference "World building" lens group maps to those two (`14-references.js:209`).
- Game lenses use Wolf's criteria (invention, completeness, consistency) repeatedly (e.g. `16:89-98`, `18-genres:2486,3672`, `18-genres:1324`), but no topic teaches Wolf's framework (grep: no "Wolf" in `27-topics-narrative.js`).
- Paths: `study-the-hits-worlds` s1 (`50:1006-1025`: Viewfinder, Subnautica, BG3 world lenses) and s4 (`50:1068-1088`).

### (b) Missing sub-subjects
1. Puzzles inside real-time combat spaces: puzzle verbs borrowed from the combat kit (aim, dash, bounce), puzzle versus combat pacing in one dungeon, failure and retry cost for execution puzzles, fairness for players who are strong at action but not logic, hints and skippability.
2. Puzzle and encounter fusion (combat rooms that are puzzles), puzzle difficulty curves versus combat curves.
3. Pixel art direction: native resolution and scale, palette size and ramps, dithering, outline and silhouette rules, tilesets and autotiling, sprite animation frames and anticipation at low resolution, camera/perspective in 2D, consistency of pixel density, production and scope cost.
4. World building craft: Wolf's criteria as a method, regional identity, ecology and culture, how space and system encode lore, consistency across art, UI and gameplay.
5. Reading density: legibility of puzzle elements in busy pixel art.

### (c) Recommendation
- Game: CrossCode (plan P7) as a lens source for 1-5.
- Create `puzzles-in-action-spaces`, domain `content`. Scope: combat-kit puzzles; interleaving puzzle and combat beats; fairness and retry. Rel: `puzzle-design` (explicitly: that topic = logic puzzles and the aha; this = embedding), `level-structure`, `encounter-design`, `items-weapons-abilities`, `challenge-failure-recovery`, `onboarding`.
- Create `pixel-art-direction`, domain `presentation`. Scope: grid, palette, readability, animation; scope as a design tool. Rel: `visual-language`, `readability-and-hierarchy`, `animation-and-vfx`, `scope-control`, `game-feel-and-juice`.
- Create `worldbuilding-method`, domain `narrative`. Scope: Wolf's invention/completeness/consistency applied; regions as systems; space and interface as lore carriers. Rel: `premise-and-world`, `environmental-storytelling`, `spatial-composition`, `narrative-pacing`. Do not duplicate `premise-and-world`'s premise/lore split.
- Alternative (cheaper): extend `puzzle-design` with an "in action games" section. I recommend a new topic because `puzzle-design` already carries the logic-puzzle method and Zelda and CrossCode need combat-pacing content.

### (d) Placement
- `puzzles-in-action-spaces`: `games-that-broke-the-mould` s1 or s4 ("Genres blended", `50:738`); `level-and-ux-designer` s2 ("Encounters and readability", `50:576`).
- `pixel-art-direction`: `study-the-hits-worlds` s4 (`50:1068`), `level-and-ux-designer` s2 or s3.
- `worldbuilding-method`: `study-the-hits-worlds` s1 (`50:1006`), after `premise-and-world` (`50:1009`).
- No new path; the three reads fit existing "worlds" and "mould" paths.

---

## S6. Rhythm games

### (a) What exists
- Only one rhythm game: `beat-saber` (`18-genres:5799-5896`): chart as the design object (5824), rules inside the notes (5834), readability of neon (5844), composer writing to the charts (5854), choreographed stage (5866), community maps (5886), prototype origin (5896); loop diagram (5811). Not used in any path (grep: no `ref:'beat-saber'` in `50-paths.js` or `51-paths-engineering.js`).
- Timing-window craft appears elsewhere: Celeste coyote time and buffering (`16:734-744`, in `50:819,1129`); feedback timing windows technique ~100 ms (`22:29`); `controls-and-friction` latency (`26:395`).
- Audio engineering: `audio-and-music` (`28:199-294`; Unity layers on `dspTime` (237-252) with the "layers drift by milliseconds" pitfall); `audio-implementation` (`28:389-`; beat or bar boundary transitions, 491). No beat clock, latency calibration or judgement windows.
- "Rhythm" is used as a metaphor in `tension-release` (`21:284`) and `core-experience` (`21:13-18`), not as musical timing. `time-and-turns` (`22:593-`) compares real-time and turn structure.
- Glossary: none. Comparisons: none.

### (b) Missing sub-subjects
1. What makes a rhythm game: chart as the level, note types, density curves, readability, scoring and judgement windows.
2. Cue-based simple-rhythm design (Rhythm Heaven-style: one rule per micro-game, audio cue then action), why it is hard to imitate.
3. Audio clock versus frame clock; input-to-audio latency; calibration and offset; engine audio APIs (Unity `dspTime`, Godot `AudioServer`).
4. Visual and haptic feedback against latency; accessibility (visual cues, adjustable windows).
5. Music-driven level design and licensing/authoring pipelines; community charts.
6. Physical rhythm in VR (Beat Saber ergonomics).

### (c) Recommendation
- Games (plan P7): Rhythm Heaven series and Rhythm Doctor entries; keep `beat-saber`.
- Create `rhythm-and-music-timed-design`, domain `core`. Scope: chart-as-level; cue-based versus note-chart rhythm; judgement and forgiveness. Rel: `time-and-turns`, `skill-and-mastery`, `game-feel-and-juice`, `audio-and-music`, `tension-release`, `accessibility`, `controls-and-friction`.
- Create `craft-audio-clock-and-input-latency`, domain `craft`, with Godot and Unity tabs. Scope: audio clock versus frame time, calibration, scheduled playback. Rel: `craft-game-loop-timestep`, `audio-implementation`, `controls-and-friction`, `craft-performance`.
- Do not deepen `audio-implementation`; it covers mixing and voices.

### (d) Placement
- `rhythm-and-music-timed-design`: `games-that-broke-the-mould` s3 ("Time and turns", `50:716`); `study-the-hits-play` s2 ("Skill you can feel", `50:815`) beside Celeste's timing windows.
- `craft-audio-clock-and-input-latency`: `gameplay-engineer-godot` and `gameplay-engineer-unity` s3 "Feel" (`51:91`, `51:240`).
- No new path.

---

## Cross-cutting observations
- New topics need `interview` items to match the site pattern (e.g. `server-scaling` has them, `36:819-847`).
- `craft-performance` is referenced in five paths; new craft topics can piggyback by `review` lists rather than new steps.
- Existing path hour totals are fixed per path (`hours:`); adding steps needs the totals updated (not checked here).

## Set aside (considered and rejected)
- `keyboard shortcut` hits (`26:412,513`), debug shortcuts (`33:543`), exploit shortcuts (`22:764-765`), "unintended shortcut" solutions (`24:497`): not backtracking, though the last two can be cross-linked.
- Wave Function Collapse "backtracking" (`24:401`): algorithmic term, unrelated.
- `time-and-turns` and `tension-release` as rhythm coverage: they use rhythm as metaphor or real-time versus turns, not musical timing.
- "Rotation" hits in Rocket League (`18-genres:2554,2569`), camera and Tetris pieces: not card or content rotation. Hearthstone rotation kept.
- `backend` "gateway" (`34:88-111`, `235`, `269`): the Go data-access gateway pattern, not a network gateway tier.
- "Shard" in games (Elden Ring shards, Superhot shards): not partitioning.
- "Cost curve" in `35-topics-infra.js` and `37-topics-management.js`: cloud/project cost, not design cost curves. `18-casual:959` and `18-genres:1449` Cookie Clicker exponential curves kept as the only idle cost-curve evidence.
- `profil` hits in `20-topics-player.js`, `29-topics-product.js`, `39-topics-platforms.js`: player/profile or platform profiles, not performance profiling.
- Unreal Iris (`19-engines.js:188`): a release-status fact, not teaching; counted as name-only.
- `44-worked-samples.js`, `45-go-samples.js`, `87-diagrams.js`, `88-flow.js`, `92-ideas.js`, `13-ai-workflow.js`: grep for the subject keywords returned zero hits; not read further. `93-lab.js:25` "rhythm" is metaphorical.
- I did not read the full lens text of every game; entries listed are those the keyword greps surfaced. Games whose lenses mention these subjects only in passing (e.g. Subway Surfers pooling, Vampire Survivors entity counts) are unverified and omitted.
- I did not judge fact accuracy of existing lens claims; line references show what the site says, not that it is verified.
- I did not check the exact current `hours:` totals or path validator rules, so stage additions may need hour re-balancing.
