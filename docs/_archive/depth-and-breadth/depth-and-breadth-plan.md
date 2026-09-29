---
status: shipped
updated: 2026-09-29
---

# Depth and breadth: more genres, engines, platforms, AI and code craft (archive)

The full working version, with per-row status prose and pass narration, is in git history before this archive commit.

## 1. Mục tiêu / Scope

The owner asked on 2026-09-25 for more depth and breadth: long-running series, classics, visual novels, open world, casual games, engines and platforms in depth, how AI models work, the engineer's role in the AI era, careers outside games, and code craft. The new material had to be taught, not only browsed, so it was tied into the learning paths. Every content pass followed the [analysis method](../../references/analysis-method.md): research notes with sources, a draft, an independent fact-check (reviewers may not launch sub-agents), corrections, validation, and a visual check of images on the rendered page.

## Owner requests and what delivered them

| # | Request | Delivered by |
| --- | --- | --- |
| R1 | Long-running series (Fire Emblem, Pokémon, Xeno) | F1, G1.1-G1.3, G1.7+ |
| R2 | Classics (Mega Man, Contra, Mario) | G1.4-G1.6 |
| R3 | Visual novels (Ace Attorney, Steins;Gate) | G2, E8 |
| R4 | Open world (Skyrim, GTA, Fallout) | G3 |
| R5 | Old-school fun (Musou, Worms) | G4 |
| R6 | Casual (Candy Crush, Angry Birds, Fruit Ninja, PopCap, Subway Surfers) | G5, T2 |
| R7 | Blend games into learning, not an isolated library | I1-I3 every pass; I4, I6, I7 |
| R8 | Platforms and engines in depth, images, deploy process | E1-E9, P1-P6 |
| R9 | AI-friendly platforms and tools (HTML, three.js, Blender) | E6, E7, E8, T1 |
| R10 | AI in depth (hallucination, distillation, harness, caching, attention, open weights) | A1-A14 |
| R11 | Engineer's shift in the AI era; test "AI orchestrates, tools compute" | V1-V4 |
| R12 | Pivoting out of games, "or just be a farmer" | C1-C6 |
| R13 | Coding craft, over-defensive code, teaching agents pitfalls | K1-K8 |
| R14 | Improve old content and UI/UX | U1-U4 |
| R15 | Detailed todo, nothing missed or drifting | status column; coverage check each pass |
| R16 | Update learning paths to match new content | L1-L4 |
| R17 | Guide page on how to use the site | H1-H3 |
| R18 | Why entries on the same core game were praised or panned | F1 (`reception`, `receptionLesson`) |
| R19 | Series pages show evolution with a real screen per entry | X1 |
| R20 | Only important shelves; award winners replace casual and genre shelves | X2 |
| R21 | Flappy Bird image, real screens only | X3 |
| R22 | Always follow the checklist and plan | this table, every pass |
| R23 | Mega Man X as well as the classic line | X4 |
| R24 | Touhou Project (fan-friendly IP) | X5 |
| R25 | No "no licensable screenshot" placeholders; use gaming news | X6 |
| R26 | Recheck omissions for lack of image; click to enlarge, phone-safe | X6, X7 |
| R27 | Fix wrong or duplicated images | X9 |
| R28 | Parse an X post about a claimed Andrew Ng graph-engineering course | I9 |
| R29 | Reverify tags (Tony Hawk, Rocket League under Action) | X10 |
| R30 | Crash Bandicoot and Sonic as series | G6.1, G6.2 |
| R31 | Add Dragon Quest and Pac-Man back | G6.3, G6.4 |
| R32 | Integrate everything into paths and lessons | L5 |
| R33 | Never shrink an image if it hurts clarity; no padding; quality pass last | X11, standing rule |
| R34 | Image sources include Wikipedia, LaunchBox, community wikis; recheck and refill | X11 |
| R35 | Clean up unused remnants at the end | U5 |

## Work rows (all landed unless noted)

**Library at scale**
- U1: headless sweep at 375, 1024 and 1440 px in both themes; quick fixes.
- U2: curated shelves beside family groups; phone-safe filter row; capped "In real games" strip.
- X1: series entry screens (`entries[].shot`); validate.js requires at least half and at least four per series.
- X2: shelves cut to Long-running series and Top award winners; awards are data (`awards`) from a closed list. Nine games hold one.
- X3: Flappy Bird shows a CC BY 2.0 Commons photo of the licensed 2018 arcade cabinet.
- X4, X5: `mega-man-x` and `touhou` series.
- X6: press screenshots (licence `press`) allowed; placeholder removed; closed by X11's refill.
- X7: image viewer with callouts; closes one layer at a time; fits phones.
- X8: real portal screens from public documentation for Steam, Google Play, Apple, Xbox, Quest, Epic, Roblox and Fortnite. Nintendo, PlayStation, web portals and itch.io show none: none public, or blocked by a bot check.
- X9: image audit of 406 images by eye and perceptual hash; 10 series screens and 2 store headers replaced.
- X10: new `sports` family (Sports and racing).
- X11: 96 of 104 small lens shots re-cut at 960 px. Eight stay small because no larger original exists (Wii Sports x2, Pac-Man x2, Doom DOS, a Fire Emblem GBA frame, a World of Warcraft raid shot behind blocked downloads, the Animal Crossing museum, since replaced). 11 misplaced callouts fixed. Crash of the Titans filled from LaunchBox. Engine and platform guide screens added for Unity, GameMaker, Ren'Py, Defold, Cocos Creator and the web guide. Left out: Unreal (image reached around a download block), Blender and itch.io (Cloudflare), Nintendo and PlayStation (no public tool screen). Owner accepted Sony's store text on the God of War shots and the Obra Dinn logbook at quality 0.53 under the 150 KB cap.

**Games**
- G5.1-G5.8, T2: eight casual games (incl. Flappy Bird, Cookie Clicker) and the soft-launch and playable-ads topic.
- F1: series frame with the Mega Man pilot.
- G1.1-G1.7+: Fire Emblem, Pokémon, Xeno, Mega Man, Contra, Super Mario, then Civilization, Street Fighter, Zelda, Monster Hunter.
- G2: Ace Attorney, Steins;Gate; Doki Doki Literature Club. Zero Escape: 999 and Danganronpa steps were queued in L2.
- G3: Skyrim, GTA V, Fallout: New Vegas, Elden Ring, The Witcher 3 (Breath of the Wild inside Zelda).
- G4: Dynasty Warriors, Worms Armageddon, Katamari Damacy, Diablo II, Doom (1993 screens are database captures).
- G6.1-G6.4: Crash Bandicoot, Sonic, Dragon Quest series; Pac-Man game.
- F2-F4: every game carries `series:{id,t,n}`; Megami Tensei and Final Fantasy series entries; ten membership-only games. Into the Breach carries none.

**Integration**
- I1: every new game names at least two topics (validate.js).
- I4: path "Make a casual game people keep". I7: path "AI engineering for game developers" with three new checklists. I8: chooser reaches the new paths.
- I6: a topic's game leaf prefers the game whose lens lists it earliest.
- I9: the X post's video is a re-edited copy of DeepLearning.AI's 2024 "AI Agents in LangGraph" (Chase, Weiss), not an Andrew Ng graph-engineering course. The original is cited as a dated fact in models-agent-harnesses; the post is not cited.

**Engines and tools:** E1 Godot pilot (Godot 4.7.2, two CC BY 3.0 editor screens); E2 Unity; E3 Unreal 5.8; E5 GameMaker LTS 2026.0; E6 web stack; E7 Blender 5.2; E8 Ren'Py 8.5.3 with RPG Maker note; E9 Defold and Cocos Creator; T1 tools that work with AI; T3 choosing an engine; T4 source control for games. Topic engine tabs stay Godot and Unity only.

**Platforms:** P1 deploy walkthrough frame (Steam pilot); P2 a numbered walkthrough on every guide, enforced by validate.js; P3 build automation, signing, test tracks, staged rollout; P4 privacy prompts, EU DMA, accessibility, patch sizes; P5 five or more interview items per guide; P6 curated channels (Apple Arcade, WeChat mini games, GOG; Game Pass and Netflix Games excluded with reason).

**AI and craft:** A1-A14 fourteen topics in `39a-topics-models.js`; V1-V4 and K1-K8 in `39b-topics-craft.js` (the owner's claim tested against PAL, Toolformer and GSM-Symbolic); C1-C6 a six-topic careers domain in `39c-topics-careers.js`.

**Paths:** L1 inventory (76 topics, 45 games and several guides were in no path); L2 49 new steps across the 14 older paths (not placed for lack of a fitting stage: GTA V, Fallout: New Vegas, Dynasty Warriors, Elden Ring, The Witcher 3, Age of Empires II, Dota 2, EA Sports FC, Euro Truck Simulator 2, Baldur's Gate 3, Subnautica; L5 later placed them); L3 path `game-skills-elsewhere`; L4 nine chooser goals; L5 four more paths (study-the-hits-play, study-the-hits-worlds, studio-practice-ai-era, game-ai-programmer) so validate.js fails the build if any topic, game, engine guide, platform guide or checklist is in no path.

**Site help and cleanup:** H1-H3 "How to use this site" page, reachable from the header, paths page and a first-visit hint. U3 old snippet fixes (blocking Godot snippet, Unity threading, obfuscation framed as raising cost, not hiding secrets). U4 final sweep: validate, types, smoke 229 route visits, e2e-paths 44/44, 1396-route sweeps at 1440 and 375 px, all clean. U5 final cleanup (2026-09-29, list approved by the owner): two unreferenced images removed; this plan, DESIGN-AUDIT.md and DESIGN-SECOND-BRAIN.md compacted and moved to docs/_archive (full text in git history); scratch image caches deleted, tools and briefs kept.

## Standing rules and decisions

- **Series model.** `SERIES()` entries hold 4 to 9 timeline entries; base fields are read series-wide. `reception` has 3 to 7 sourced entries, at least one praised and one mixed or poor, plus a `receptionLesson`. Existing games gain `series` and link both ways.
- **Images are real screens only.** Order: store screenshots, official press screenshots (including news republication, licence `press`), then free licences (Commons, Wikipedia, LaunchBox, community wikis, CC BY, MIT). Never a watermarked image or a video frame. Portal screens come from the platform's own public documentation. A schematic is for a diagram, never a stand-in for a screen. Licence comes from a closed list; each image carries source, author and licence.
- **Size rules.** Caps per image stay. The 12 MB folder cap was replaced (2026-09-28) by a 350 KB per-page image budget in validate.js, because images load lazily, so a visitor downloads only the page opened (heaviest page, Street Fighter's series, 259 KB). The folder total is reported, not capped. No image was re-encoded to fit.
- **Readability first.** Never cut or shrink an image to fit a budget if that makes it less readable. Add an image or text only where needed, never to pad. The image quality pass ran last.
- **Fact-check pipeline.** Research, draft, independent fact-check, corrections, validation, visual check. Model-specific facts are dated facts with a source.
- **Every item is in a path.** Every topic, game, engine guide, platform guide and checklist is reached from at least one path step (L5), enforced by validate.js.
- **Other decisions.** Careers is its own domain. No Japanese shelf or tag. Tier 2 was deferred for art budget and then completed. Git: a standing yes for this plan only to commit and push to main after each passing pass, never force.

## Genre matrix outcome

The matrix gave every popular genre at least one entry, ranked by market data (RPG and action-adventure first, then survival, shooters, strategy). Tier 1 (about 55 entries: 14 series, 41 games) is complete. Tier 2 is complete: God of War (2018), Valheim, Halo: Combat Evolved, Call of Duty 4, Overwatch, Crusader Kings III, Tony Hawk's Pro Skater, Wii Sports, Forza Horizon 5, Microsoft Flight Simulator, Farming Simulator, Super Smash Bros., Five Nights at Freddy's, Metal Gear Solid, Deus Ex, Hearthstone, Beat Saber.

## Excluded on purpose

- Games: Higurashi, Fate/stay night, Earth Defense Force, merge games. Clash Royale (comparison only), PUBG (lineage inside Fortnite), League of Legends (comparison inside Dota 2).
- Engines: Bevy, O3DE, MonoGame, CryEngine.
- Channels: Game Pass, Netflix Games.
- Images not used: sources with no accepted licence (Unity, Unreal, itch.io documentation), sites behind bot checks, and console portals under NDA.
