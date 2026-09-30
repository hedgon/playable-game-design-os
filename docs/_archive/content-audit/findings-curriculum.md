# Curriculum audit (K1)
Scope: 186 topics, 23 domains (14 design, 9 engineering/career), 107 reference games, 10 game lens categories. Scripts in work\curriculum. Level is not a per-topic field (tag holds a one-line summary), so level progression per domain was not checked.

## Gaps
| id | missing or thin topic | why | reference | home / level | severity |
|---|---|---|---|---|---|
| K-1 | Rollback netcode / deterministic lockstep as a topic (lockstep only appears inside server-determinism and server-authority) | Fighting games, RTS and co-op need it; different from server-authoritative prediction | Fiedler, Gaffer on Games (Deterministic Lockstep, Snapshot Interpolation); GGPO docs; Valve Source Multiplayer Networking | server, advanced | medium |
| K-2 | Gameplay math and coding-interview drills (vectors, quaternions, easing, spatial queries, complexity). careers-interviewing-outside-games covers loop shape and system design only | Lead partly confirmed: no math or algorithm practice anywhere | Gregory, Game Engine Architecture ch.5 (3D math); Nystrom, Game Programming Patterns | craft or careers, intermediate | high |
| K-3 | Client-side engine architecture: game loop and fixed timestep, scene/entity models (ECS vs OOP), object pooling, input handling, rendering basics, threading. No topic id covers them; only craft-design-patterns and craft-memory-and-gc touch them | Engineering track is server/backend heavy; nothing on the client runtime | Nystrom (Game Loop, Component, Object Pool, State); Gregory ch.1,7,8; Godot 4 and Unity 6 manuals | craft, beginner to advanced | high |
| K-4 | Physics and collision (character controllers, tunnelling, determinism) | Core to feel and to netcode | Gregory ch.13; Godot 4 physics docs | craft, intermediate | medium |
| K-5 | Save systems, serialization and data versioning (client side) | Every shipped game needs it; only backend-migrations covers server data | Gregory ch.16 (resources); Unity/Godot save docs | craft, intermediate | medium |
| K-6 | Audio implementation (middleware, mixing, ducking); audio-and-music is design only. No FMOD/Wwise mention anywhere | Common studio practice | Gregory ch.14; IGDA Curriculum Framework (audio) | presentation or craft, intermediate | medium |
| K-7 | Game economy balancing math and monetization design (gacha, battle pass, pricing) beyond business-model | Large share of shipping mobile work | Schell ch.12 (economies); Fullerton ch.9 | systems / product, advanced | medium |
| K-8 | Multiplayer game design (co-op, PvP balance, matchmaking as a design problem); social-experience is the only design topic | Server track teaches plumbing, design track has no multiplayer design | Salen and Zimmerman, Rules of Play (social play); Fullerton | core or experience, intermediate | medium |
| K-9 | Tools, pipelines and build/asset optimization for content teams (tools programming, profiling, memory budgets on device) | Thin: profiling appears in 5 topics, no owner topic | Gregory ch.2,10; Unity 6 profiler docs | craft, intermediate | low |
| K-10 | Netcode client half stays thin: server-state-sync covers prediction, reconciliation and interpolation (lead was WRONG on those: they exist, lines 227-237, 317 of 36-topics-server.js); lag compensation exists inside server-authority (line 28) but has no worked topic | Fair-hit design is a common interview question | Valve Source Multiplayer Networking; Fiedler | server, advanced | low |

## Overlaps and contradictions (script shortlist, Jaccard on what/why/how; all under 0.21, so none are near duplicates)
| pair | note |
|---|---|
| models-context-engineering / models-agent-harnesses / models-attention-long-context / models-tokens-context / models-prompt-caching | Five topics circle context; overlap of framing, likely intentional but worth a cross-check for repeated advice |
| craft-core-values-that-last / craft-what-matters-now / craft-best-practice-now / craft-verification-as-the-job | Four similar "what matters in the AI era" topics; risk of repeated messages |
| encounters-and-enemies / encounter-design | Content vs level view of the same idea; distinguish in the tag lines |
| ai-agentic-implementation / craft-tools-that-work-with-ai / craft-teaching-agents / models-agent-harnesses | Same agent-workflow advice in four places |
| certification-and-review / ratings-and-disclosures / release-and-updates | Adjacent store-rules topics |
| backend-observability / infra-monitoring, backend-testing / infra-ci-pipelines | Domain boundary blur |
No contradictions found by the shortlist; I did not read all pairs in full.

## Structure notes
- Domain sizes range 4 (level, presentation) to 14 (models, craft). Level design and Art/Audio/Feel are thin against Schell and Fullerton.
- Design domains are ordered player to studio; Engineering has no entry topic that is client-side (see K-3).
- Topics with no inbound rel: localization-and-culture, perception-and-awareness, adaptive-and-director-ai.
- 9 rel targets are view ids (should-we-build-this, playtest-view, ai-roles-view, prompt-library, checklists-view, ai-failures-view, matrix-view, loop-view), not topics; fine if the renderer resolves them.
- Two domains (models, craft) are 15% of topics, all AI-era; relative weight is high against classic fundamentals.

## Games to topics
- GAME_LENSES has 10 categories that name only 15 distinct topics (core-loop, mechanics-and-rules, ux-as-design, readability-and-hierarchy, visual-language, audio-and-music, premise-and-world, narrative-agency, spatial-composition, environmental-storytelling, business-model, live-operations, difficulty, mastery-discovery-expression, learning-from-success). About 88 of the 100 design topics are not reachable from any game lens.
- Never lensed: all of player, most of experience, content, level-design (except spatial-composition), production, gameai, ai, studio domains. Suggest lens categories for game AI, level pacing, onboarding, progression and production.
- Genres are mostly single-game (about 45 of 107 genre labels appear once), so genre-hybrids and per-genre topics have thin evidence.
- All engineering-track topics (77 topics) have no reference game.

## Currency
- Models domain dated 2026-09-28 (asOf) and cites GPT-5.6, Claude Opus 4.6; looks current. Older benchmark citations (GPT-4o, o1, Claude 3.5 Sonnet SWE-bench) are historic but framed as such; recheck each has an "as of" note.
- Engine docs: Unity 6 and Godot 4 appear in only about 5 and 21 files respectively; version-specific advice (Godot 4.x, Unity 6 Input System and URP) was not checked line by line. Not verified.
- Platform rules (ATT, Play target API level, store review) not rechecked against September 2026.

## Orchestrator corrections

- **Games to topics.** The count of "15 topics reachable from game lenses" is wrong: it counted lens categories, not the `topics` each lens lists. A recount over every lens's `topics` gives **82 of 186 topics shown by at least one reference game**.
  - Design domains are fully or nearly fully covered: core, systems, content, level, ux, narrative and presentation all 100%; player 4/5; experience 5/8; product 8/10; production 5/7.
  - The domains with no game at all are ai (0/13), backend (0/11), infra (0/8), leadership (0/8), models (0/14), craft (0/14) and careers (0/6). The partial ones are gameai 5/11, server 3/8, studio 2/5, management 4/8 and platforms 5/9.
  - Most of the uncovered topics are about how studios and AI tooling work, not about what players see, so no game can show them. The exception is server and netcode (prediction, reconciliation, rollback): games like Rocket League, Street Fighter or Fortnite could show those.
- **Paths-audit lead on netcode.** Prediction, reconciliation, interpolation and lag compensation are covered in server-state-sync and server-authority. Only rollback netcode lacks its own topic (K-1).
