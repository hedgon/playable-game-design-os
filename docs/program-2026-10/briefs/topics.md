# Topic scopes (programme 2026-10)

Each section is one topic. Common rules: `topic-common.md`. Gap evidence:
`docs/program-2026-10/research/content-gaps.md`. Reference games named here exist in the
library (link them in prose by name; the coordinator wires game links).

## backtracking-and-return-trips
Domain `level`. Title idea: "Backtracking and return trips".
Owner's question: how do non-linear games make returning to old places feel natural, not a chore?
Must cover: why games ask you to return (ability gates, keys, knowledge gates, world state changes); the Metroid/Castlevania lineage; return trips that reveal new routes (the "lock you saw before the key" pattern); shortcuts that fold the map (Dark Souls' Firelink Shrine loops, elevator shortcuts); fast-travel trade-offs (when it kills the world, when its absence is a chore); map design and annotation (Hollow Knight's buy-the-map and pins, Metroid Dread's map highlights of interactable blocks); traversal upgrades that change how old rooms play (not just open a door); respawning content versus a changed world; signposting and memory aids; pacing return trips against new content; measuring chore (time between new things, repeated traversal length, telemetry heatmaps). Name what makes it a chore with mechanisms. Examples from the library: hollow-knight, dark-souls, elden-ring, zelda, mega-man-x, outer-wilds (knowledge gates), skyrim (fast travel). Sources: GDC talks (e.g. Metroid Dread / Mercury Steam, Team Cherry interviews), Game Maker's Toolkit "Boss Keys" as practitioner analysis, developer interviews.
Rel: spatial-composition, level-structure, knowledge-as-progression, quests-and-events, pacing, onboarding.
Do not repeat: spatial-composition's general exploration content.

## balance-methods
Domain `systems`. Title idea: "Balance methods: curves, matrices and simulation".
Must cover: what "balanced" means (viable choices, not equal ones); transitive balance and cost curves (power vs cost, the curve as a design tool, Magic's mana curve and vanilla tests); intransitive balance (rock-paper-scissors matrices, payoff matrices, solving a simple one); spreadsheets and their limits; simulation and bots (Monte Carlo of fights, automated playtesting); telemetry signals (pick rate, win rate, win rate when picked, play rate by skill tier, the trap of balancing on the top 1%); patch practice (small steps, nerf vs buff, communicating changes); balance for PvE versus PvP; asymmetric balance (StarCraft races, Overwatch roles). Worked example: a small cost-curve table (WORKED, kind table, with formulas) is welcome. Sources: Ian Schreiber's Game Balance Concepts and Schreiber & Romero "Game Balance" (book), Riot / Blizzard / Supercell dev posts on balance philosophy, Slay the Spire's metrics talk (GDC 2019), academic work on automated playtesting.
Rel: economy-modelling-and-balance, builds-and-loadouts, difficulty, depth-vs-complexity, metrics-and-success, live-design-seasons-and-data.
Do not repeat: economy-modelling-and-balance's sources-and-sinks economy content.

## power-creep-and-content-growth
Domain `systems`. Title idea: "Power creep: balance as content keeps growing".
Must cover: what power creep is and why it happens (new content must sell or feel exciting, so it is stronger); vertical versus horizontal progression; consequences (old content obsolete, new players lost, the meta narrows, numbers inflate); tools against it: rotation/standard formats (Magic, Hearthstone), sidegrades and horizontal design, normalisation and stat squishes (World of Warcraft's item-level squishes), soft caps and diminishing returns, scaling content to the player (level scaling, Elder Scrolls/ Elden Ring contrast), catch-up mechanics, banning, reprint/rebalancing old content, designing the power budget per release; gacha and live-service specifics (character power creep, "powercreep as monetisation" and its ethics); measuring it (power index of new releases over time, win-rate of new vs old cards). Examples in the library: hearthstone, world-of-warcraft, pokemon, ea-sports-fc, overwatch, street-fighter, slay-the-spire. Sources: official patch notes and dev blogs (Blizzard on the squish, Hearthstone Standard format announcement, Wizards of the Coast on rotation), Mark Rosewater on power level, GDC talks.
Rel: balance-methods, progression, live-design-seasons-and-data, monetisation-design, ethics-and-responsibility, content-multiplies.
Use an EXPLAINER: power rising across releases with and without rotation/squish.

## server-bandwidth-and-interest-management
Domain `server`. Title idea: "Bandwidth and interest management".
Must cover: the bandwidth budget (bytes per player per tick, why it is N players x M entities, upstream vs downstream, mobile data caps); what costs bytes; serialisation (bit packing, quantisation of positions/rotations with worked numbers, smallest-three quaternion compression), delta compression against the last acknowledged state, priority accumulators and send budgets (as in Glenn Fiedler's "Networking for Game Programmers" / Gaffer on Games and Halo Reach networking GDC talk), relevancy and interest management (grid/spatial hash, area of interest, visibility, Unreal's relevancy and Replication Graph, Iris), update rate per distance, dormancy; measuring bandwidth; what scales to 100 players (battle royale) vs 10,000 in a shard. Numbers wherever possible.
Rel: server-state-sync, server-realtime-protocol, server-scaling, server-authority, craft-memory-and-gc.
Go tab: a small bit-packer or quantiser with a test-friendly API (whole file).

## server-transport-and-relays
Domain `server`. Title idea: "Transports: UDP, reliability, QUIC, WebRTC and relays".
Must cover: why games use UDP; building reliability and ordering on UDP (sequence numbers, acks, redundancy); head-of-line blocking with TCP; QUIC and HTTP/3 (what it fixes, where it is used); WebSockets and WebRTC data channels for browser games; NAT traversal (STUN, TURN, hole punching) and relay services (Steam Datagram Relay, Epic Online Services P2P relay, Unity Relay); DDoS exposure and hiding server IPs; MTU, fragmentation, packet loss and jitter numbers; connection migration on mobile networks. Sources: RFC 9000 (QUIC), RFC 8445 (ICE), RFC 8656 (TURN), Valve's GameNetworkingSockets docs, Glenn Fiedler articles.
Rel: server-realtime-protocol, server-state-sync, server-anticheat, server-stack-choices, backend-api-protocol.

## server-world-partitioning
Domain `server`. Title idea: "Partitioning a world: shards, zones, instances and seamless servers".
Must cover: why one process cannot hold everyone (CPU per tick, bandwidth, memory); shards/realms (World of Warcraft realms, cross-realm), zones and handoff, instances and layering/phasing, seamless worlds (EVE Online's single shard and time dilation, SpatialOS's promise and its limits as a lesson, New World / Amazon's spatial partitioning as reported), dynamic load balancing by region splitting, cross-server interaction (chat, trade, guilds) via services, persistence at shard scale; what a battle royale does instead (one match per process). Sources: CCP dev blogs on TiDi, Blizzard on layering, published talks.
Rel: server-scaling, server-matchmaking, infra-data-stores, multiplayer-design, server-bandwidth-and-interest-management.
EXPLAINER welcome: a zone splitting as players crowd in.

## server-load-testing-and-capacity
Domain `server`. Title idea: "Load testing and capacity planning".
Must cover: why "fine with 10 users" says nothing about 100,000 (contention, connection limits, file descriptors, GC pauses, queue build-up, Little's law); headless bot clients and replaying recorded traffic; ramp, soak, spike and breakpoint tests; what to measure (tick time p99, packet loss, server CPU per CCU, memory per room, DB QPS, error rates); capacity models (players per core, cost per CCU), launch-day lessons (queues, login storms, thundering herd, back-off with jitter); chaos testing. Tools: k6, Locust, Gatling, custom bot frameworks; Agones/GameLift fleet scaling as context. Sources: AWS GameLift docs, Google SRE book chapters on load and overload, published launch post-mortems.
Rel: server-scaling, server-matchmaking, infra-monitoring, backend-testing, server-liveops.

## server-framework-landscape
Domain `server`. Title idea: "Multiplayer frameworks compared: how each one works".
Must cover a mechanism matrix (authority model, topology, sync model, prediction/rollback support, hosting, scale ceiling, licence/cost) for: Unity Netcode for GameObjects and Netcode for Entities; Photon Fusion and Photon Quantum (deterministic); Mirror and FishNet; Unreal Engine replication (and Iris); Godot high-level multiplayer (MultiplayerSpawner/Synchronizer, ENet/WebRTC); Nakama; Colyseus; Steamworks and Epic Online Services; hosting: AWS GameLift, Agones, Edgegap / Hathora-style providers as a category. And for non-game real-time software: Socket.IO, Phoenix Channels, Ably/Pusher-type managed pub/sub, Firebase Realtime Database. How to choose by game type. Versions, prices and limits are FACTS with asOf dates. Sources: each framework's official docs.
Rel: server-stack-choices (keep that topic as the layer-choice process; this one is the landscape), server-authority, server-rollback-netcode, platform-choice, platforms-choosing-an-engine.

## realtime-connection-tier-at-scale
Domain `backend`. Title idea: "Real-time connections at scale: gateways, pub/sub and fan-out".
Must cover: holding many long-lived connections (memory per connection, epoll/kqueue, file descriptor limits, the C10k/C10M framing); the gateway tier versus the logic tier; presence; pub/sub fan-out (Redis pub/sub, NATS, Kafka for durable streams), fan-out cost for large rooms (a 100,000-member channel), batching and coalescing, backpressure and slow consumers, sticky sessions and reconnect storms, sharding by room/guild; BEAM processes as a model (Discord's Elixir guild processes, WhatsApp's Erlang 2M connections per server as reported); mobile realities (push notifications vs sockets, background limits); MQTT for IoT-style fan-out. Sources: Discord engineering blog, WhatsApp/Erlang talks, Slack engineering blog, Redis and NATS docs.
Rel: server-scaling, server-realtime-protocol, backend-caching-redis, infra-monitoring, backend-api-protocol.
Go tab: a hub with per-client buffered send channels that drops or disconnects slow consumers.

## craft-cpu-cache-and-data-layout
Domain `craft`. Title idea: "CPU time, caches and data layout".
Must cover: the memory hierarchy with latency numbers (L1/L2/L3/RAM), cache lines, why arrays of structs vs structs of arrays matter, data-oriented design (Mike Acton's CppCon 2014 talk), hot/cold splitting, branch prediction, SIMD at a high level, job systems and multithreading (Unity Jobs + Burst, Unreal task graph, Godot WorkerThreadPool), false sharing, amortisation and time slicing (spread work over frames), spatial partitioning to avoid O(n²) (grids, quadtrees, BVH), dirty flags and caching results, object pooling (when it helps, when it does not), measuring with profilers (Unity Profiler and Profile Analyzer, Unreal Insights, Godot profiler, Superluminal/Tracy/VTune as names). Tricks of the trade with when they pay.
Rel: craft-performance, craft-entities-and-scenes, craft-memory-and-gc, craft-game-loop-timestep, ai-budgets-and-debugging.

## craft-gpu-rendering-cost
Domain `craft`. Title idea: "GPU cost: draw calls, overdraw, shaders and LOD".
Must cover: how a frame is built (CPU submits, GPU executes, the pipeline stages); CPU-bound vs GPU-bound and how to tell; draw calls and state changes, batching (static/dynamic batching, SRP Batcher, GPU instancing, indirect draws), overdraw and transparency, fill rate and resolution scaling (dynamic resolution, upscalers as a category), shader cost (ALU vs texture fetches, variants), LOD and impostors, culling (frustum, occlusion, distance), lighting cost (baked vs real-time, light count, shadows cascades), texture memory and compression; profiling with RenderDoc, PIX, Xcode GPU tools, Unity Frame Debugger, Unreal stat GPU, Godot visual profiler. Sources: Unity, Unreal and Godot official optimisation docs; NVIDIA, AMD GPUOpen, Microsoft PIX docs.
Rel: craft-performance, visual-language, animation-and-vfx, level-blockout-and-metrics, camera-design.
EXPLAINER welcome: one frame being built pass by pass.

## craft-mobile-gpu-and-thermals
Domain `craft`. Title idea: "Mobile GPUs, battery and heat".
Must cover: tile-based deferred rendering and why bandwidth is the mobile cost (load/store actions, MSAA on tile, avoiding framebuffer fetch round trips); thermal throttling and sustained versus peak performance (Android's Thermal API / ADPF, Apple's thermal state), frame pacing (Android Frame Pacing / Swappy), 30 vs 60 vs 120 fps budgets and battery, texture compression (ASTC, ETC2), resolution and render scale, half precision, GPU vendors' guides (Arm Mali best practices, Qualcomm Adreno, Apple GPU / Metal best practices, Imagination PowerVR). Sources: those official guides and Android developer docs.
Rel: platform-and-session, craft-gpu-rendering-cost, platform-requirements, craft-performance.

## craft-memory-loading-and-streaming
Domain `craft`. Title idea: "Memory budgets, loading and streaming".
Must cover: memory budgets per platform (and why to set them early), what eats memory (textures, audio, meshes, animation), asset compression and formats, load-time anatomy (I/O, decompression, deserialisation, shader compilation and the shader-stutter problem, PSO caching), async loading and streaming (Unity Addressables, Unreal World Partition and streaming levels, Godot ResourceLoader threaded loading), DirectStorage and SSD-era design (Ratchet & Clank: Rift Apart as an example of design enabled by streaming), level design for streaming (corridors, elevators, airlocks as hidden loads), download size and patch size. Sources: official engine docs, Microsoft DirectStorage docs, platform docs, GDC talks.
Rel: craft-memory-and-gc, infra-cdn-assets, release-and-updates, vertical-slice-mvp, craft-performance.

## web-performance-basics
Domain `craft`. Title idea: "Web performance: load fast, stay responsive".
Must cover: Core Web Vitals (LCP, INP, CLS) with thresholds and what moves each; the critical rendering path; JavaScript cost (parse/compile/execute, long tasks, main-thread work, code splitting and lazy loading); caching (HTTP cache headers, content-hashed file names, service workers); compression (gzip, Brotli), images (formats, sizes, lazy loading), fonts (font-display, subsetting); measuring (Lighthouse, Chrome DevTools Performance panel, field data vs lab data, RUM); HTML5 and playable-ad budgets (initial payload limits of ad networks as FACTS); WebGL/WebGPU game specifics (asset streaming, WASM size). A short case study welcome: this site itself moved from one 8.7 MB file (2.8 MB gzipped) to a small shell with content files loaded on demand. Sources: web.dev, MDN, Chrome developers docs, ad network spec pages.
Rel: infra-cdn-assets, soft-launch-and-playable-ads, craft-performance.

## backend-latency-and-query-optimisation
Domain `backend`. Title idea: "Backend latency: find it, then cut it".
Must cover: percentiles not averages (p50/p99/p999, tail latency and fan-out amplification, "The Tail at Scale"), latency budgets per request, profiling (pprof, flame graphs, distributed tracing), the usual culprits (N+1 queries, missing indexes, lock contention, chatty services, serialisation, GC), query optimisation (EXPLAIN, index design, covering indexes, pagination by keyset not offset), connection pooling, caching layers and their invalidation (link, do not repeat backend-caching-redis), batching and coalescing, timeouts, retries with jitter and hedged requests, queueing and Little's law, load shedding. Sources: Dean & Barroso "The Tail at Scale" (CACM 2013), Google SRE book, PostgreSQL and MySQL official docs, Go pprof docs, Brendan Gregg on flame graphs.
Rel: backend-data-access, backend-caching-redis, backend-observability, infra-monitoring, infra-data-stores.
Go tab: a handler with a context deadline and a hedged second request, or a keyset-paginated query.

## puzzles-in-action-spaces
Domain `content`. Title idea: "Puzzles inside an action game".
Must cover: puzzles built from the combat kit (the same verbs solve rooms and fights: CrossCode's ball-throwing, Zelda's items), dungeon structure that alternates puzzle and combat beats (pacing), teaching a dungeon's gimmick then combining it, fairness and retry (checkpoint placement inside puzzle rooms, resetting rooms), skill puzzles versus logic puzzles (timing under pressure), optional versus required puzzles, accessibility (skip options), and how the puzzle grammar extends into boss fights. Examples: zelda, portal (contrast: pure puzzle), hollow-knight (platforming as puzzle). CrossCode is being added to the library; refer to it by name. Sources: developer interviews (Radical Fish Games for CrossCode), Nintendo developer talks, Game Maker's Toolkit "Boss Keys" (practitioner).
Rel: puzzle-design, level-structure, encounter-design, items-weapons-abilities, challenge-failure-recovery, onboarding.

## pixel-art-direction
Domain `presentation`. Title idea: "Pixel art direction".
Must cover: pixel art as a set of constraints chosen on purpose (resolution, grid, palette size), choosing the base resolution and pixel-perfect scaling (integer scaling, camera snapping, sub-pixel motion problems), palette design and value/hue readability, readability of characters at small sizes (silhouette, outline choices), tile sets and modular environments, animation frame counts and timing, mixing pixel art with modern lighting and effects (HD-2D as a case), UI in a pixel game, scope and cost (pixel art is not automatically cheap), consistency rules for a team (style guide). Engine tabs: Godot (texture filter Nearest, stretch mode viewport, snap 2D transforms) and Unity (Pixel Perfect Camera, point filtering, sprite import settings). Examples: celeste, stardew-valley, hollow-knight (contrast: hand-drawn), undertale; CrossCode by name. Sources: engine docs, developer talks (e.g. Celeste's art, Octopath/HD-2D interviews), Pedro Medeiros (Celeste artist) tutorials as practitioner sources.
Rel: visual-language, readability-and-hierarchy, animation-and-vfx, scope-control, game-feel-and-juice.

## worldbuilding-method
Domain `narrative`. Title idea: "Building a world players can read".
Must cover: Wolf's invention, completeness and consistency as working tests; infrastructures (maps, timelines, cultures, languages, ecology) and which ones a game actually needs; the world as systems (factions with goals, economies, ecologies that react); delivering the world through space, objects, interface and play rather than exposition (link environmental-storytelling); a world bible and how teams keep it consistent; regions with identities that also serve gameplay (CrossCode's areas, Hollow Knight's kingdom, Outer Wilds' planets); the danger of lore nobody can reach. Sources: Mark J. P. Wolf, Building Imaginary Worlds; developer talks; Jenkins on narrative architecture.
Rel: premise-and-world, environmental-storytelling, spatial-composition, narrative-pacing.
Do not repeat: premise-and-world's premise and lore split.

## rhythm-and-music-timed-design
Domain `core`. Title idea: "Rhythm and music-timed play".
Must cover: why rhythm play feels good (entrainment, anticipation, the beat as a shared clock); two families: note-chart games (a highway of notes: Guitar Hero, Beat Saber) and cue-based games (the music and a character cue tell you when: Rhythm Heaven, Rhythm Doctor); timing windows and judgement (perfect/great/miss windows in milliseconds, forgiveness, early versus late), latency calibration as a design feature, charting as level design (Beat Saber's flow), teaching by ear (Rhythm Heaven's practice sections, off-beat traps), accessibility (visual cues for the hard of hearing, assist options, Rhythm Doctor's options), rhythm mixed into other genres (Crypt of the NecroDancer, Hi-Fi Rush, Metal: Hellsinger as named examples). Examples in the library: beat-saber; Rhythm Heaven and Rhythm Doctor are being added (refer by name). Sources: developer interviews (Tsunku and Nintendo on Rhythm Heaven, 7th Beat Games' dev posts), GDC talks on rhythm games, published timing-window documentation of games.
Rel: time-and-turns, skill-and-mastery, game-feel-and-juice, audio-and-music, tension-release, accessibility, controls-and-friction.

## craft-audio-clock-and-input-latency
Domain `craft`. Title idea: "Audio clock, input latency and calibration".
Must cover: why frame time is the wrong clock for music (drift, frame jitter), using the audio DSP clock (Unity AudioSettings.dspTime and PlayScheduled; Godot AudioServer.get_time_since_last_mix and get_output_latency, AudioStreamPlayer.get_playback_position), scheduling sounds ahead, input timestamps versus frame polling, the latency chain (input device, OS, engine, display, audio output, Bluetooth), measuring and calibrating (tap tests, audio and visual offset settings), judging hits against the song position with offset compensation, fixed timestep interaction. Engine tabs required for both. Sources: Unity and Godot official docs (the "Sync the gameplay with audio and music" Godot doc page), platform audio latency docs (Android AAudio/Oboe, Apple Core Audio).
Rel: craft-game-loop-timestep, audio-implementation, controls-and-friction, craft-performance.
EXPLAINER welcome: frame clock drifting against the audio clock over a song.
