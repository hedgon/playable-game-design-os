---
status: active
updated: 2026-09-25
---

# Depth and breadth: more genres, engines, platforms, AI and code craft

The owner’s request (2026-09-25) is traced clause by clause in 1.1, and every
todo in 1.2 carries a status that is updated after each pass, so nothing is
dropped or drifts. Every content pass follows the library’s
[analysis method](../references/analysis-method.md) and the pipeline that
held up last time: research notes with sources, a draft, an independent
fact-check (reviewers may not launch sub-agents), corrections applied,
validation, and a visual check of images on the rendered page. An
independent audit of the first draft of this plan (2026-09-25) changed
the image policy, the taxonomy, the order of work and the AI and engine
scope; its findings are folded in below.

## 1. Mục tiêu / Scope

### 1.1 Request traceability

| # | What the owner asked | Todo ids |
| --- | --- | --- |
| R1 | Long-running series with consistent output: Fire Emblem, Pokémon, the Xeno series (Gears, Blade, Saga), “etc” | F1, G1.1–G1.3, G1.7+ |
| R2 | Classics: Mega Man, Contra, Mario, “etc” | G1.4–G1.6 |
| R3 | Visual novels: Ace Attorney, Steins;Gate, “etc” | G2, E8 (Ren’Py) |
| R4 | Open world: Skyrim, GTA, Fallout, “etc” | G3 |
| R5 | Old-school “dumb fun”: Musou, Worms, “etc” | G4 |
| R6 | Casual: Candy Crush, Angry Birds, Fruit Ninja, PopCap, Subway Surfers, “etc” | G5, T2 (playable ads) |
| R7 | Blend the games into actual learning, not an isolated library | I1–I3 in every pass; I4, I6, I7 |
| R8 | Platforms and engines in depth; images of what the platform looks like; the deploy process (interview relevant); related knowledge | E1–E9, P1–P6 |
| R9 | AI-friendly platforms and tools: HTML, three.js, Blender, “etc” | E6, E7, E8, T1 |
| R10 | AI in depth: hallucination, distillation, harness, what affects agent intelligence, cache hit and miss, attention, open weights, “etc” | A1–A14 |
| R11 | The engineer’s shift in the AI era; research the owner-quoted “AI orchestrates, tools compute” claim; is it right and useful; refine into core values that survive fast capability growth | V1–V4 |
| R12 | Pivoting out of games; transferable skills; “or just be a farmer” | C1–C6 |
| R13 | Coding: best practice, memory, performance, design patterns, clean code (still needed?), over-defensive code and its causes (missing context, schema), what still matters, teaching agents to avoid pitfalls | K1–K8 |
| R14 | Improve old content and UI/UX along the way | U1–U4 |
| R15 | Research in depth; a detailed todo list; organise one by one; nothing missed or drifting | 1.2 status column; the coverage check in 6(c) re-run every pass |
| R16 | (2026-09-25, later) After everything, research and update the learning paths to match all the new content | L1–L4 |
| R17 | (2026-09-25, later) A guide page on how to use the site: “kinda lost with so many features” | H1–H3 |
| R18 | (2026-09-25, later) In every series analysis: why entries built on the same core game were praised or received badly, which entries, what each did right or wrong, and the lesson | F1 (`reception`, `receptionLesson`), every series entry |
| R19 | (2026-09-25, later) Series pages show how the series evolved: more images, one real screen per timeline entry | X1 |
| R20 | (2026-09-25, later) Shelves are not editable on the site, so only important ones: keep Long-running series; replace Casual and mobile (and the genre-like shelves) with an award-winners shelf for the very top games | X2 |
| R21 | (2026-09-25, later) Flappy Bird has no image; real screens only, never drawn | X3 |
| R22 | (2026-09-25, later) Always follow the checklist and the plan so nothing is missed | this table, every pass |
| R23 | (2026-09-25, later) Mega Man X as well as the classic line: no new mainline entry since 2004, yet a large fan-game scene | X4 |
| R24 | (2026-09-25, later) Touhou Project as a long-running series: a creator who lets fans use the IP freely, even commercially, and the IP still thrives | X5 |

The owner’s named examples are always included; “etc” candidates are listed
with a verdict (add, or excluded with a reason) and confirmed in decision 2.

### 1.2 Todo list (status: todo, researching, drafted, checked, landed)

**Library at scale (before new entries arrive)**

| Id | Todo | Status |
| --- | --- | --- |
| U1 | Headless screenshot sweep of every page type at 375, 1024 and 1440 px, both themes; issue list; quick fixes | landed |
| U2 | Library at scale: curated shelves (Series, Open world, Casual and mobile, Old-school fun, Visual novels) alongside family groups; filter row that stays usable on a phone; “In real games” strip capped and grouped on topic pages | landed |
| X1 | Series entry screenshots: `entries[].shot` (real screen, credited, at most 40 KB), required on at least half the entries and at least four; drawn in the timeline beside each entry; Mega Man first, then every series | frame landed; Mega Man in progress |
| X2 | Shelves: Long-running series and Top award winners only. Awards are data (`awards:[{t, year, src}]` from a closed list of the top awards), shown on the game page; the shelf lists games with at least one. Open world, casual, old-school and visual-novel stay as tags in the tag filter | landed: nine games (Portal, Minecraft, Papers, Please, Outer Wilds, Return of the Obra Dinn, Hades, Vampire Survivors, Balatro, Clair Obscur); every new game checks the award lists |
| X3 | Flappy Bird image: a real screen with a licence the site accepts (Commons, archived official listing), or none | landed: a CC BY 2.0 Commons photo of the licensed 2018 arcade cabinet, captioned as such (`CC BY 2.0` added to the licences) |
| X4 | SERIES `mega-man-x` (X to X8, 1993 to 2004, plus collections and spin-offs where they explain it): the formula split from the classic line, the stall after X6, why fans keep making X games; linked both ways with `mega-man` | researching |
| X5 | SERIES `touhou` (ZUN, from 1996): the main shooting games, the fan-work guidelines that allow commercial fan games, and fan games that reached Steam and consoles; reception from sourced evidence only | researching |

**Games** (each: research, draft, fact-check, images where licensable,
callouts checked on the rendered page; I1–I3 done in the same pass)

| Id | Todo | Status |
| --- | --- | --- |
| G5.1–G5.6 | Casual and mobile: Candy Crush Saga, Angry Birds, Fruit Ninja, Plants vs. Zombies, Bejeweled (PopCap), Subway Surfers | landed (in `18-games-casual.js`) |
| G5.7–G5.8 | Proposed: Flappy Bird (hyper-casual), Cookie Clicker (idle) | landed (Flappy Bird without images: no licensable screenshot of the 2013 original was found; real screens only, never a drawing, so retry the Internet Archive copy of the original store listing, which answered HTTP 429 on 2026-09-25) |
| T2 | Topic: playable ads and soft launch (a casual-mobile production practice) | landed (`soft-launch-and-playable-ads`, product; a step in `ship-it` s4) |
| F1 | Series frame, landed with one pilot (Mega Man): see Design | landed (`18-games-series.js`, with the R18 `reception` rule) |
| G1.1–G1.6 | Fire Emblem, Pokémon, the Xeno lineage (Xenogears, Xenosaga, Xenoblade Chronicles; framed as a lineage across three publishers), Mega Man, Contra, Super Mario | researching (Fire Emblem, Pokémon) |
| G1.7+ | Proposed: Civilization (the “one-third old, improved, new” renewal rule), Street Fighter (the missing fighting genre), The Legend of Zelda, Monster Hunter | todo |
| G2.1–G2.2 | Visual novels: Ace Attorney, Steins;Gate | todo |
| G2.3+ | Proposed: Zero Escape: 999, Danganronpa, Doki Doki Literature Club | todo |
| G3.1–G3.3 | Open world: Skyrim, Grand Theft Auto V (GTA III as lineage), Fallout: New Vegas (Fallout 3/4 as context) | todo |
| G3.4+ | Proposed: Breath of the Wild, Elden Ring, The Witcher 3 (the Ubisoft tower formula as the compare counter-example, not an entry) | todo |
| G4.1–G4.2 | Old-school fun: Dynasty Warriors (musou), Worms Armageddon | todo |
| G4.3+ | Proposed: Katamari Damacy, Diablo II (the Vampire Survivors ancestor), Doom | todo |

**Series consistency (owner decision 1).** Games already in the library that
belong to a series must fit the new series model:

| Id | Todo | Status |
| --- | --- | --- |
| F2 | Series membership: every single-game entry gains `series:{id, t, n}` (series id, name, place in it); a series entry lists its analysed games as `ref` entries, and each side links the other | landed |
| F3 | Series entries for series the library already analyses a game from: Megami Tensei (Shin Megami Tensei III: Nocturne and Persona 5 Royal as its two analysed branches) and Final Fantasy (Final Fantasy XII) | landed (Megami Tensei, Final Fantasy; entries with their own page lend its art to the timeline) |
| F4 | Membership only (no series entry): Dark Souls (FromSoftware’s Souls games, with Elden Ring), Valkyria Chronicles, NieR (with Drakengard), Hades (Hades II), Chrono Trigger, Undertale (Deltarune), Slay the Spire (Slay the Spire 2), Hollow Knight (Silksong), Portal (Portal 2), Into the Breach, Celeste, Minecraft, Among Us: the lineage lens names the series and the entry carries `series` | todo |

**Genre coverage (owner: “cover most popular genres as much as
possible”).** Market data (GAMIVO’s 2025 bestseller analysis via Yahoo
Finance; Statista; RocketBrush’s genre revenue overview) ranks role-playing
and action-adventure first (21% each of bestsellers), then survival (18%),
shooters (15%) and strategy (12%); shooters lead PC and console revenue,
casual games reach the most players, and RPG and strategy lead mobile
revenue per user. The matrix gives every popular genre at least one entry;
Tier 1 is committed, Tier 2 follows if the art and bundle budgets allow.

| Genre | Already in the library | Tier 1 | Tier 2 |
| --- | --- | --- | --- |
| RPG | Persona 5 Royal, Nocturne, FFXII, Chrono Trigger, Clair Obscur, Disco Elysium, Undertale | Baldur’s Gate 3; series: Final Fantasy, Megami Tensei, Pokémon, Fire Emblem, Xeno | |
| Action-adventure | Hollow Knight, NieR: Automata, Dark Souls | Zelda (series), Breath of the Wild | God of War (2018) |
| Open world | | Skyrim, GTA V, Fallout: New Vegas, Elden Ring, The Witcher 3 | |
| Survival and crafting | Minecraft | Subnautica | Valheim |
| Shooter | Superhot | Doom, Half-Life 2, Counter-Strike 2 | Halo: Combat Evolved, Call of Duty 4 |
| Battle royale | | Fortnite (links the UGC guide; PUBG as lineage) | |
| MOBA and hero games | | Dota 2 (League of Legends as the comparison) | Overwatch |
| Strategy | Into the Breach, Valkyria Chronicles | StarCraft, Age of Empires II, Civilization (series) | Crusader Kings III |
| Sports | | EA Sports FC / FIFA (series), Rocket League | Tony Hawk’s Pro Skater, Wii Sports |
| Racing | | Mario Kart 8 | Forza Horizon 5 |
| Simulation | Stardew Valley, Animal Crossing, Factorio, Papers, Please | The Sims (series), Cities: Skylines, Euro Truck Simulator 2, Kerbal Space Program | Microsoft Flight Simulator, Farming Simulator |
| Fighting | | Street Fighter (series) | Super Smash Bros. |
| MMO | | World of Warcraft | |
| Horror | | Resident Evil 4 | Five Nights at Freddy’s |
| Stealth and immersive sim | | | Metal Gear Solid, Deus Ex |
| Card games | Slay the Spire, Balatro | | Hearthstone |
| Rhythm | | | Beat Saber |
| Platformer and action classics | Celeste | Super Mario, Mega Man, Contra (series) | |
| Visual novel | | Ace Attorney, Steins;Gate, Zero Escape: 999, Danganronpa, Doki Doki Literature Club | |
| Casual and mobile | Wordle, Tetris | Candy Crush Saga, Angry Birds, Fruit Ninja, Plants vs. Zombies, Bejeweled, Subway Surfers, Flappy Bird, Cookie Clicker | |
| Old-school fun | Vampire Survivors | Dynasty Warriors, Worms Armageddon, Katamari Damacy, Diablo II | |
| Hunting and co-op | | Monster Hunter (series) | |

Tier 1 is about 55 new entries (14 series, 41 games); Tier 2 adds 17.

Excluded on purpose (named so the choice is visible): Dragon Quest, Sonic,
Higurashi, Fate/stay night, Pac-Man, Earth Defense Force, merge games,
Clash Royale (a comparison only), PUBG (lineage inside Fortnite), League of
Legends (the comparison inside Dota 2).

**Integration** (the library is taught, not only browsed)

| Id | Todo | Status |
| --- | --- | --- |
| I1 | Every new game names the topics its lenses illustrate (at least two), enforced by validate.js on every build | per pass |
| I2 | Topic prose cites a game where it is the clearest example (a sentence and a link) | per pass |
| I3 | Path steps for new games where a game teaches best, re-balancing stage minutes and hours | per pass |
| I4 | New path “Make a casual game people keep” (casual design, free-to-play economy, soft launch, playable ads, live ops) | todo (queued from pass 5: the Subway Surfers and Bejeweled game steps, one new game step per existing stage being the cap) |
| I5 | Series lessons feed `learning-from-success` and `genre-hybrids` (what a formula keeps and changes) | per pass |
| I6 | Map game leaf prefers a game whose lens is about that topic: coded in `practiceLinks`, checked in validate.js | todo |
| I7 | New path “AI engineering for game developers” over A, V, K and T1, with new checklists (agent rules file, where AI sits in an architecture, submission per platform family) | todo |
| I8 | Path chooser updated so the new paths are reachable | todo |

**Engines and tools** (a new Library collection, like platform guides)

| Id | Todo | Status |
| --- | --- | --- |
| E1 | `ENGINE_GUIDE()` frame, landed with the Godot pilot (open licence, real editor images allowed) | frame landed; Godot pilot todo |
| E2 | Unity (render pipelines, DOTS, the 2023 Runtime Fee announced and withdrawn as the licensing-risk lesson) | todo |
| E3 | Unreal Engine (Blueprints versus C++, UAT and BuildGraph) | todo |
| E4 | Godot (pilot, see E1) | todo |
| E5 | GameMaker | todo |
| E6 | The web stack: HTML5 Canvas, WebGL and WebGPU, three.js, Babylon.js, Phaser, PlayCanvas; web portals (Poki, CrazyGames), itch.io, static hosts, wrappers | todo |
| E7 | Blender as a game tool: modelling to engine export, the Python API, why it pairs with AI | todo |
| E8 | Ren’Py (visual novels; plain-text scripts) and a note on RPG Maker | todo |
| E9 | Defold and Cocos Creator (casual mobile, playable ads, mini-game platforms) | todo |
| T1 | Topic “Tools that work well with AI”: text formats, open docs, scriptability, fast feedback, MCP servers, vision for 3D; the limits | todo |
| T3 | Topic “Choosing an engine” (a comparison across E2–E9) | todo |
| T4 | Topic “Source control for games” (Git LFS, Perforce, large binaries) | todo |

Topic engine tabs stay Godot and Unity only; no Unreal tab is added to the
existing topics (the Unreal guide says so). Excluded engines: Bevy, O3DE,
MonoGame, CryEngine.

**Platforms** (deepen the twelve guides; split by family)

| Id | Todo | Status |
| --- | --- | --- |
| P1 | `deploy` walkthrough frame, landed with the Steam pilot: numbered steps through the real screens, each with a schematic of the screen | todo |
| P2 | Walkthroughs for PC and web (Steam, itch.io, web, Epic), mobile (Google Play, Apple), consoles and VR (Nintendo, PlayStation, Xbox, Quest: public information only; dev kits, what is public and what is under NDA), UGC (Roblox, Fortnite) | todo |
| P3 | Build automation to the store: SteamPipe and steamcmd, fastlane, Gradle Play Publisher, GameCI, Unreal BuildGraph; signing (Play App Signing, iOS certificates and provisioning); test tracks (TestFlight, Play testing tracks, Steam beta branches); staged rollout | todo |
| P4 | Related knowledge: privacy prompts (iOS ATT, Play Data safety), alternative payments and the EU DMA, accessibility requirements (Xbox Accessibility Guidelines), store optimisation (ASO), crash reporting and analytics SDKs, patch sizes | todo |
| P5 | Interview questions per guide with model answers (“walk me through shipping a patch on X”) | todo |
| P6 | Curated subscriptions (Apple Arcade, Game Pass, Netflix Games), GOG, WeChat mini games: a note each, or excluded by name | todo |

**AI: how models work** (a new engineering domain; engine tabs off)

| Id | Todo | Status |
| --- | --- | --- |
| A1 | Tokens, embeddings, the context window | todo |
| A2 | Attention, the KV cache, and why long context degrades (lost in the middle, context rot) | todo |
| A3 | Sampling: temperature, top-p, determinism | todo |
| A4 | Hallucination and sycophancy: causes, detection, reduction (extends, and links, `verifying-ai-output` and `ai-failure-modes`) | todo |
| A5 | How models are made: pre-training, fine-tuning (LoRA and other parameter-efficient methods; when it beats prompting), RLHF and other feedback training, distillation, quantisation | todo |
| A6 | Model architecture choices that matter to users: mixture of experts (total versus active parameters), multimodal models | todo |
| A7 | Open-weight and closed models; small, on-device models; routing and cascades | todo |
| A8 | Prompt caching: what a cache hit is, what breaks it, cost and latency (the KV cache from A2 as the mechanism) | todo |
| A9 | Context engineering: what goes into the window, in what order, and why | todo |
| A10 | Agent harnesses: the loop, tools, sub-agents, memory (extends `ai-agentic-implementation`) | todo |
| A11 | What makes an agent capable: model, context, tools, instructions, feedback, evals, with evidence | todo |
| A12 | Tool use, MCP, structured outputs and JSON schema; RAG (embeddings search, chunking, reranking) versus long context | todo |
| A13 | Reasoning models and test-time compute; benchmarks, contamination, scaling laws (why capability moves fast) | todo |
| A14 | Security and operations: prompt injection, cost control, evals in production (links `ai-evals`); LLMs inside games links the `gameai` domain | todo |

Model-specific facts (caching rules, context sizes, prices) come from current
official documentation at writing time, as dated facts with sources.

**Engineering in the AI era**

| Id | Todo | Status |
| --- | --- | --- |
| V1 | Research the owner-quoted claim: where evidence supports it, where it is already dated, where it fails | todo |
| V2 | Draw the owner’s pipeline (question, interpretation, tool selection, structured input, computation, result, explanation, visualisation) as a flow diagram with the probabilistic and deterministic parts marked, and one worked game example (“is this economy inflating?”: model, simulation or spreadsheet, chart) | todo |
| V3 | Test the owner’s own values as written (clarity, correctness, reasoning over over-engineering, completeness or polish, a clear line between probabilistic and deterministic parts); refine them into core values that hold as capability grows | todo |
| V4 | What is expected of an engineer now: judgement, specification, verification, architecture; the interview angle. `bottleneck-shift` and the AI philosophy page link here instead of repeating it | todo |

**Code craft** (a new engineering domain; engine tabs where code helps)

| Id | Todo | Status |
| --- | --- | --- |
| K1 | Best practice that still pays, and what changed with AI | todo |
| K2 | Memory: garbage collection and allocation (C# in Unity and Godot 4, incremental GC, `new` in Update), pooling, value types, Godot reference counting, C++ ownership; links `backend-go-idioms` for servers | todo |
| K3 | Performance: profile first, frame budgets, CPU and GPU, data-oriented design and ECS; links `backend-observability` | todo |
| K4 | Design patterns in games (Nystrom’s Game Programming Patterns and others): which help, which are over-applied | todo |
| K5 | Clean code in the age of AI: what still matters (readability for reviewers and agents, context size, naming), and what was always taste | todo |
| K6 | Over-defensive code: why people and agents write it (missing context, unknown schemas, the unseen caller), its cost, the fix (guards at boundaries, trust upstream guarantees) | todo |
| K7 | What matters most now: understanding over output, verification, simplicity | todo |
| K8 | Teaching agents to avoid pitfalls: rules files, types and schemas, tests, linters, examples, review checklists (extends and links `lead-conventions`, `lead-code-review`, `ai-agentic-implementation`) | todo |

**Careers** (a new domain, or folded into leadership: decision 5)

| Id | Todo | Status |
| --- | --- | --- |
| C1 | Transferable skills from game development, by discipline | todo |
| C2 | Where people go: simulation and digital twins, film and virtual production, education and training, UX and product, automotive and embedded HMI, AR and VR, AI tooling, backend and data; each with evidence | todo |
| C3 | Repositioning a portfolio and CV for another industry | todo |
| C4 | Interviewing outside games | todo |
| C5 | The AI tooling market as a destination | todo |
| C6 | The farmer, answered properly: agritech and simulation, and the honest version of leaving tech | todo |

**Learning paths, after all content lands (R16)**

| Id | Todo | Status |
| --- | --- | --- |
| L1 | Research: how the paths should change: an inventory of every new topic, game, series, engine guide and platform walkthrough against the 14 paths; learning-design evidence already used by the paths (retrieval practice, spacing, interleaving, worked examples) applied to the new material | todo |
| L2 | Update existing paths: new topic and game steps where they teach best, stages re-balanced (3 to 8 steps, minutes within 10%), recall and skip questions revised, engineering paths linked to engine guides and deploy walkthroughs, interview paths to the new interview questions | todo |
| L3 | New paths from the plan: casual (I4), AI engineering (I7), plus any the L1 inventory shows are missing (for example engine and platform interview prep, pivoting out of games) | todo |
| L4 | Chooser and the paths landing page updated so every path is reachable and the choice stays simple | todo |

**How to use the site (R17)**

| Id | Todo | Status |
| --- | --- | --- |
| H1 | A “How to use this site” page (): what each section is for (Paths, Map, Library, Make, Diagnose, AI Workflow, Projects), the fastest route for each kind of visitor (new designer, engineer, interview prep, looking something up), search, progress and review, keyboard keys; with small schematics of where things are | landed |
| H2 | Reachable everywhere: from the header help button and dialog, All pages, empty search, the paths landing page, and a one-time dismissible first-visit hint | landed |
| H3 | Kept true: written first with today’s features (so the owner has it now), revised at the end with engines, shelves, series and the new paths; smoke visits it | todo |

**Old content and UI/UX**

| Id | Todo | Status |
| --- | --- | --- |
| U3 | Known leftovers: code snippets the last review left out of scope (a Godot snippet that blocks the main thread, Photon calls listed as Unity API, a Unity snippet that breaks its own threading warning); the obfuscator contradiction (owner decision) | todo |
| U4 | Final headless sweep; README, CONTRIBUTING, docs | todo |

## 2. Bối cảnh / Survey hiện trạng

- 20 domains, 150 topics. The AI Collaboration domain is workflow-level; it
  mentions hallucination and harnesses in passing and has nothing on
  distillation, caching, open weights, sampling or quantisation.
- Engines appear only as Godot and Unity tabs inside topics.
- Twelve platform guides: text stages, dated facts, a flowchart, a comparison
  table; no images, no step-by-step deploy; deploy text is not indexed by
  search today (only points and facts are).
- 32 reference games, all analysed; families: roguelike, sim, action,
  strategy, social, puzzle, rpg, narrative. The dissect tool copies each
  game’s base fields; image credits are one tuple per game.
- Fourteen paths; game steps exist; no casual or AI-engineering path.
- Art folder about 3.5 MB of a 5 MB budget, and the budget counts only
  `assets/games`. `playable.html` is 4.3 MB; at about 30 KB per analysed
  game and about 150 KB per domain, the plan would take it to about 6 to
  7 MB.
- CI runs build, the built-file diff, the type check (data files only) and
  smoke; e2e-paths runs locally only.

## 3. Design

**Series (F1).** `SERIES({...})` pushes into `REFERENCE_GAMES` with
`kind:'series'` and `entries:[{t, year, platform, added}]` (4 to 9, drawn
with the existing `flow` diagram kind, which allows up to 9 steps). Base
fields are read series-wide: `want`, `verb`, `why`, `complaints`, `lesson`,
`misses`; `first30` is the first 30 seconds of the entry that defined the
formula; `minute` the decision the series keeps asking. New fields:
`constant` and `changed` paragraphs, and (R18) `reception`: 3 to 7 entries
`{entry, year, verdict, evidence, why, src, ref?}` with at least one praised
and one mixed or poorly received, each sourced, plus a `receptionLesson`
paragraph; rendered as “Hits and misses” on the series page. `year` stays the first release; the card
shows the range from `entries`. Images may carry their own `dev`, `store`
and licence (the Xeno lineage spans Square, Namco and Monolith/Nintendo), so
validate.js and the shot caption gain per-image credits. The dissect tool
shows a series with its series-wide fields.

**Taxonomy.** `family` stays a genre. `visual-novel` is added as a family
only if decision 2 confirms; otherwise visual novels sit in `narrative`.
New tags: `open-world`, `casual`, `mobile`, `ads`, `hyper-casual`, `idle`.
The owner’s groupings are curated library shelves (U2), not families.

**Engine guides.** `ENGINE_GUIDE()` in a new data file mirrors `PLATFORM()`:
stages (what it is; architecture; the editor; content pipeline; build and
deploy per platform family with a step list; licensing and cost; working
with AI; interview questions), dated facts, a diagram and images. Touches:
manifest, validate.js (shape, images, interview items), the router and
`render()`, NAV (Library gains Engines), `PAGES`, the index, search, the
layout checker (collect engine diagrams), smoke routes, inventory, a
typedef for the type check, and a path step kind `engine`.

**Platform deploy.** Stages gain an optional `deploy:[{t, d, shot?}]`
rendered as a numbered walkthrough, and `iv` interview items. Search
indexes deploy steps. The image caption says where the image came from and
under which licence.

**Images.** One credit model for games, platforms and engines:
`{src, author, licence}` with the licence from a closed list (store art,
`CC BY 4.0`, `CC BY 3.0`, `CC BY-SA 4.0`, `MIT`, `own`), and a `changed`
flag for BY-SA images. Sources and what they allow:

| Source | Licence | Images covered | Use |
| --- | --- | --- | --- |
| Game store pages (Steam, publisher stores) | publisher promotional art | yes, for promotion, credited | as now |
| Godot documentation | CC BY 3.0 (credit Juan Linietsky, Ariel Manzur and the Godot community) | yes | editor images in E4 |
| Blender manual | CC BY-SA 4.0 (logos and icons excluded) | yes, share-alike | unmodified files; callouts stay HTML overlays |
| three.js, Phaser repositories | MIT | yes | E6 examples |
| Microsoft docs repos with a CC BY 4.0 LICENSE | CC BY 4.0 | per repo | only where the repo licence says so |
| Google developer docs | CC BY 4.0 for text; images excluded | no | text facts only |
| Steamworks, App Store Connect, Play Console, Partner Center, console portals | all rights reserved; consoles under NDA | no | our own schematic of the screen |
| Unity, Unreal, itch.io docs | not verified | treat as no | schematics until verified |

Portal screens are therefore drawn by us with the existing `screen` diagram
kind (numbered regions, glyphs, a legend), labelled as schematics.

**New domains.** `models` (How AI models work) and `craft` (Code craft) in
the engineering lens; `careers` if decision 5 chooses a domain. File names
`39a-topics-models.js`, `39b-topics-craft.js`, `39c-topics-careers.js`
(the type check glob `src/3*.js` covers them); engine guides in
`19-engines.js`. Rules: `models` and `careers` have engine tabs off;
`craft` has them on. Section-title overrides where a part does not fit
(“What should I playtest?” becomes “How do I check it?”). Two new domain
colour tokens per theme, checked by the contrast checker. The engineering
lens grows from 6 to 8 or 9 domains: the layout checker and a phone
screenshot decide whether it stays one lens.

**Budgets.** The art budget counts all of `assets/` and rises only by
decision 4. build.js warns when `playable.html` passes a size threshold;
size is reported after every pass.

## 4. Commit breakdown (order of work)

Each pass: research, draft, fact-check, apply, validate, visual check,
update the status column, then commit, and push only as decision 3 allows.

1. Decisions (section 7), no code. Done 2026-09-25.
2. U1 sweep and quick fixes. Done: phone load 3.3 s cold at 4.2 MB uncompressed (4x CPU); no lazy loading needed yet.
3. U2 library at scale. Done.
4. Image credit model (one change for games, platforms and engines). Done.
5. G5 casual and T2, with I1–I3. Done.
6. F1 series frame with the Mega Man pilot, and F2 membership on the
   existing games. Done.
7. F3 (Megami Tensei, Final Fantasy) and G1 remaining series, in passes of
   two or three.
8. G2 visual novels. 9. G3 open world. 10. G4 old-school fun.
10a. Genre matrix Tier 1 in passes of two to four by genre: shooters and
   battle royale; strategy and MOBA; sports and racing; simulation;
   RPG, survival, MMO, horror. 10b. Tier 2 if budgets allow.
11. E1 engine guide frame with the Godot pilot.
12. E2, E3, E5 engines. 13. E6, E7, E8, E9, T1, T3, T4.
14. P1 deploy frame with the Steam pilot.
15. P2 to P6 by family: PC and web; mobile; consoles and VR; UGC.
16. A1–A7 foundations. 17. A8–A14 agents and operations.
18. V1–V4.
19. K1–K4. 20. K5–K8.
21. C1–C6.
22. I4 casual path, I7 AI path, I6 map preference, I8 chooser.
22a. H1–H2 guide page, first version (done early, since it helps now).
22b. L1–L4 learning paths, after all content has landed.
23. H3 guide revised, U3, U4, README, CONTRIBUTING, docs; the plan marked shipped.

## 5. Seed data the planner must provide

Decisions 1 to 5 in section 7, including which “etc” candidates to take.

## 6. E2E test plan

- (a) validate.js: series shape and per-image credits; new tags; engine
  guides; platform deploy steps and interview items; new domains complete;
  every new game with at least two topic links (I1) and every image with a
  licence from the closed list.
- (b) Visual: every image and callout checked on the rendered page.
- (c) Coverage: the 1.1 table re-checked after every pass, and the 1.2
  status column updated; at the end every row shows shipped content.
- (d) Layout checker: map states for the new domains and engine diagrams,
  no overlaps; a phone screenshot of the engineering lens.
- (e) CI checks (build, built-file diff, type check, smoke with new routes
  added: engines, a series, a visual novel, a new-domain topic, a deploy
  walkthrough) plus e2e-paths locally and the headless UI sweep.
- (f) Facts: independent fact-check of every new entry; dated facts with a
  source and a date; licences checked for every image source.
- (g) Size: `playable.html` and `assets/` reported after every pass.

## 7. Owner decisions (2026-09-25)

1. Series: a `series` entry with a timeline, and existing games that belong
   to a series kept consistent with it (F2 to F4).
2. Extras: all proposed series, visual novel, open-world, old-school and
   casual candidates, plus strategy, sports and simulation, covering the most
   popular genres (the genre matrix above).
3. Git: a standing yes for this plan only: after each pass passes the build,
   type check, smoke, path tests and the UI sweep, commit and push to main.
   Never force; ends when this plan ships.
4. Images: our own schematics for portal screens plus licensed images where
   the licence allows; art budget raised to 10 MB counting all of `assets/`.
   Tier 1 at about 110 KB per entry plus engine images needs about 11 to
   12 MB: images are capped at two shots of 40 KB and a 30 KB header per
   entry, and the owner is asked before the budget passes 10 MB.
5. Careers: a new domain of six topics (the recommended option, taken as
   the default; the owner can still move it into leadership).
6. No Japanese shelf or tag (later the same day): every game is treated the
   same, found by genre, family, series and design tags instead.

Still open: `playable.html` grows to about 7 MB with Tier 1. If a phone
load test in U1 shows it is too slow, lazy-loading game analyses is raised
as a separate decision.
