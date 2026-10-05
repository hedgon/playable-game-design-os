# Fact-check: pixel-art-direction

Checked 2026-10-05 against `drafts/pixel-art-direction.js` and `drafts/pixel-art-direction.sources.md`.
Draft not edited. Sources fetched raw with curl into the scratchpad (Godot class XML and docs .rst from
the engine repos, Unity 6000.0 ScriptReference and manual, package manual, developer articles).
NESdev and w3.org returned a Cloudflare challenge; the W3C text was read from the `w3c/wcag` repo instead.

## Verdict: PASS WITH FIXES

Counts: WRONG 2, UNSUPPORTED 2, OUTDATED 2. The arithmetic is all correct. The most serious issue
is the Schlitter hue-shift numbers: the draft says "about 20 degrees within a ramp". The source's 20 degrees
is the shift between each pair of neighbouring swatches, so a 9-swatch ramp turns about 160 degrees. A reader
who follows the draft gets almost straight ramps, which is the beginner mistake the source warns against.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
|---|---|---|---|---|
| Schlitter: "about 20 degrees within a ramp and 45 between ramps" | how[2] | WRONG | The source shows 9 swatches per ramp, with "20 degrees of positive hue shift between each swatch". That is about 160 degrees across one ramp. The 45 degrees is 360/8, because that example palette has 8 ramps. It is not a general between-ramp rule. | https://www.slynyrd.com/blog/2018/1/10/pixelblog-1-color-palettes |
| Snippet and api list labelled "Godot 4": `Window.content_scale_stretch`, `CONTENT_SCALE_STRETCH_INTEGER`, scale mode integer | ENGINE.godot, facts[0] | WRONG (version scope) | Not in the 4.1 `Window.xml`; present from 4.2. Write "Godot 4.2+". On 4.0 or 4.1 the snippet fails to parse. | raw godot `4.1`, `4.2`, `master` doc/classes/Window.xml |
| "Godot 4 projects default to … no stretch (mode disabled) and scale mode fractional" | facts[0] | OUTDATED | The setting's stored default is still `"disabled"`, but the docs now say `canvas_items` "is the default for projects created starting in Godot 4.7". The latest stable release is 4.7.2. The aspect default for new projects changed in 4.7 too. Say "the setting default; projects created in 4.7+ start with canvas_items, still not viewport". | ProjectSettings.xml (master), class_projectsettings.rst (stable); GitHub releases API |
| Pixel Perfect Camera properties (Assets PPU, Reference Resolution, Upscale Render Texture, Pixel Snapping, Crop Frame), shown as the Unity component | facts[3], ENGINE.unity api, TECH rows 1-2 | OUTDATED for Unity 6 URP (the draft leaves this as "check") | This answers the writer's open question. Unity 6's URP manual says the 2D Pixel Perfect package "works only with the Built-In Render Pipeline". The URP Pixel Perfect Camera has a **Grid Snapping** setting whose options are None, Pixel Snapping and Upscale Render Texture. Its **Crop Frame** is a dropdown that includes Stretch Fill. Name the URP component and these fields, and keep the package names for Built-In only. | https://docs.unity3d.com/6000.0/Documentation/Manual/urp/2d-pixelperfect-ref.html ; package 5.0 manual |
| NES "no more than 8 on one scanline", "8 by 8 or 8 by 16" | what, facts[4] | UNSUPPORTED (this session) | Believed correct. NESdev (PPU_OAM) and its archive copy were blocked, and the Wikipedia NES article text does not state it. Re-read NESdev in a browser before integrating. | https://www.nesdev.org/wiki/PPU_OAM |
| HD-2D adds "dynamic light, depth of field, tilt-shift and bloom" (Octopath) | TECH row 8 | UNSUPPORTED (bloom only) | Dynamic lighting, depth of field and tilt-shift are CONFIRMED (Wikipedia HD-2D, citing the Unreal Engine spotlight). No source names bloom. Drop it or source it. | https://en.wikipedia.org/wiki/HD-2D |
| NES 25 colours on screen, 64-entry master palette, 64 sprites | what, facts[4] | CONFIRMED (secondary) | The Wikipedia NES article gives 25 simultaneous colours out of 54 usable, and OAM for 64 sprites. "Master palette of 64" means 64 entries, of which about 54 are distinct. Optionally say "64 entries, about 54 usable". | Wikipedia "Nintendo Entertainment System" (raw) |
| PICO-8 128x128, 16 colours | what, facts[4] | CONFIRMED | Vendor specification: Display 128x128 16 colours; Sprites 256 8x8. | https://www.lexaloffle.com/pico-8.php |
| Godot: 640x360 baseline scales to 720p/1080p/1440p/4K with no bars; 256x224 to 640x480 | why[1], facts[2] | CONFIRMED | Pixel art section. | godot-docs multiple_resolutions.rst |
| Godot: integer scale mode "prevents uneven pixel scaling"; fractional makes line widths in logo and text "vary wildly" | what, why[1] | CONFIRMED | | same |
| Godot: viewport mode, no sub-pixel move/rotate; use canvas_items | TECH row 1-2 | CONFIRMED | | same |
| snap_2d_transforms/vertices default false; crisper "at the cost of less smooth movement, especially when Camera2D smoothing"; not recommended together, "prefer only enabling" transforms | why[2], facts[1], ENGINE pitfall | CONFIRMED | | ProjectSettings.xml (master) |
| gui/common/snap_controls_to_pixels default true | sources 5 | CONFIRMED | | same |
| default_texture_filter default 1 = Linear, 0 = Nearest | facts[0] | CONFIRMED | Default 1 in the XML. The enum order Nearest, Linear, … is from `scene/main/viewport.cpp` (`canvas_item_default_texture_filter` hint). | ProjectSettings.xml; viewport.cpp |
| Window CONTENT_SCALE_MODE_VIEWPORT and CONTENT_SCALE_STRETCH_INTEGER descriptions | sources 8 | CONFIRMED | | Window.xml (master) |
| Camera2D smoothing default false, speed 5.0 | sources 7 | CONFIRMED | | Camera2D.xml |
| Pixel font: Nearest, integer multiple of design size and integer Control scale or "may look blurry"; subpixel positioning Disabled or "uneven pixel" | think.traps[4], ENGINE pitfall | CONFIRMED | | godot-docs gui_using_fonts.rst |
| TileSet "Use Texture Padding" 1-pixel edge | sources 10 | CONFIRMED | | godot-docs using_tilesets.rst |
| Unity package: match Assets PPU to all sprites; pixel snapping "does not affect any GameObjects' Transform positions"; Filter Mode Point, Compression None | facts[3], ENGINE.unity pitfall, how[4] | CONFIRMED (Built-In RP) | See the OUTDATED row for URP. | package 5.0 manual |
| Celeste/TowerFall: integer positions, float remainder, move only when the rounded remainder is non-zero, one pixel at a time | what, TECH row 3, interview | CONFIRMED | Read on the raw page (MoveX code and text). | maddymakesgames.com article |
| Dead Cells: 3D pipeline for lack of bandwidth; 50 px in-game height; no antialiasing; 30 fps; flickering pixels; less detail | what, TECH row 7 | CONFIRMED, one wording fix | The source's "30Fps" is the animation frame rate. "rendered … at 30 frames per second" reads as the game's frame rate; write "animated at 30 frames per second". The detail limit is confirmed ("disappointing level of details"). Reference games: KoF, Blazblue, Guilty Gear. | gamedeveloper.com deep dive (raw) |
| Octopath: "rich-looking pixel art enhanced by modern technology"; too much resolution and saturation lost the appeal; sprites "lonely and simple"; fixed by more tile variations and colours | what, interview senior | CONFIRMED | | siliconera.com interview (raw) |
| Octopath in Unreal Engine 4 | TECH row 8 | CONFIRMED (secondary) | Wikipedia infobox and HD-2D article. The Unreal spotlight returned 403. | Wikipedia |
| WCAG 2.2 3:1 for graphical objects (1.4.11) | how[3] | CONFIRMED | "meaningful visual cues achieve 3:1". This is a WCAG 2.1 criterion, kept in 2.2 (level AA). | w3c/wcag repo, understanding/21/non-text-contrast.html |
| Blob set: 256 masks reduce to 47; edge set 2^4 = 16 | TECH row 6, how[6] | CONFIRMED (arithmetic) | I re-enumerated in Node and got 47. | own computation |
| 1366/320 = 4.27, 768/180 = 4.27; bars 43 and 24; 57,600 vs 2,073,600 = 1/36; 16/180 = 8.9%, 32/180 = 17.8%; 20 x 11.25 and 40 x 22.5 tiles; 320x180 x4/6/8/12 and 640x360 x2/3/4/6 | what, why, how, interview, explainer | CONFIRMED (arithmetic) | All recomputed. | own computation |
| 1 px outline adds 2 px to width and height | TECH row 9 | CONFIRMED (arithmetic) | | |
| Unity API: AssetPostprocessor.OnPreprocessTexture, assetPath/assetImporter, TextureImporter.textureType, spritePixelsPerUnit, filterMode, textureCompression, mipmapEnabled | ENGINE.unity | CONFIRMED | All listed on the Unity 6000.0 ScriptReference pages. | TextureImporter.html, AssetPostprocessor.OnPreprocessTexture.html |
| Godot API: content_scale_size/mode/aspect, CanvasItem.TEXTURE_FILTER_NEAREST (=1), roundf | ENGINE.godot | CONFIRMED (4.2+) | `roundf` is in @GlobalScope.xml. | class XML |

## Code issues

- **Godot snippet**: read line by line. It is valid GDScript 2 for **Godot 4.2+ only**, because `content_scale_stretch` does not exist in 4.1. Typed inference is fine (`get_window()` returns Window; `roundf` returns float). `texture_filter = NEAREST` on this Node2D affects only this node and the children that inherit it. That is correct, but it is not the project-wide setting the prose describes; say so in a line. Not run in an engine.
- **Unity snippet**: compiles in my reading against the Unity 6 API. Assigning the int 16 to the float `spritePixelsPerUnit` is fine. The draft already notes the Editor folder requirement. Not compiled.
- **Unity api list**: the "Pixel Perfect Camera (… Upscale Render Texture, Pixel Snapping)" entry describes the Built-In package. On URP (the Unity 6 2D default) these are options of Grid Snapping. See the claims table.
- No Go code. Nothing was left unconfirmed in the APIs.

## Teaching issues

1. Explainer frame 5 says that at 0.5 px per frame the jump comes "at frames 2, 4, 6 and 8". That depends on the rounding rule. The draft's own Godot `roundf` rounds halves away from zero, so it moves on frames 1, 3, 5 and 7. C#'s default `Math.Round` uses banker's rounding and gives 2, 4, 6, 8. Say "every second frame" or name the rounding mode.
2. In the senior interview, "10 states at 3 to 8 frames each gives about 50 to 60 frames" conflicts with the draft's own table (idle 2-4, jump/fall/hurt 1-3). Three to eight frames times 10 states is 30-80. Show the small state table that adds up to the number.
3. how[2] has the hue-shift numbers wrong (see WRONG above), and "so shadows lean cool and highlights warm" is presented as following from the source. The source says positive hue shift as brightness rises. Cool-dark and warm-light is common practice, and it depends on the start hue. Present it as practice.
4. The Unity setup guidance (how[4], ENGINE map/note) should state which component Unity 6 URP uses rather than leave "verify".

## Missing coverage (brief "Must cover" and examples)

- All the "Must cover" subjects are present.
- The brief's named examples are absent. Stardew Valley, Hollow Knight (the hand-drawn contrast), Undertale and CrossCode are never mentioned. Pedro Medeiros's tutorials, a named practitioner source in the brief, are not used either. Celeste is the only example game. Add at least the Hollow Knight contrast and a Stardew Valley 16 px grid mention (sources items 22 and 23 already exist).
- The Godot tab mentions snap 2D transforms only in the pitfall. That is acceptable.

## Validation

`PLAYABLE_DRAFTS=docs/program-2026-10/drafts/pixel-art-direction.js node src/validate.js` printed "OK: all cross-links resolve, all topics complete." The only draft-specific lines were "WARN topics with no inbound links: pixel-art-direction" and "DRAFT not in any learning path", both expected for a draft. I re-ran with the `craft-gpu-rendering-cost` sibling draft also loaded, and it was still OK. All 7 `rel` targets exist in `content/topic/`. `craft-gpu-rendering-cost` exists there and also as a draft. The draft does not repeat that sibling: the sibling only mentions pixel art in passing, and this draft links to it for the render-target cost.

## Style

No hype words found. UK spelling throughout (colour, grey, greyscale; no "color", "gray" or "center"). No employer, colleague or internal project names.

## Set aside

- Celeste 320x180 (sources 16): used only as an example base resolution, never attributed to Celeste.
- "Lospec lists hundreds" of palettes: an understatement, not a false claim.
- `facts` given as a `T()` field rather than a separate `FACTS()` call: the validator accepts it, so the coordinator decides.
- Frame-count starting points (idle 2-4 and so on): presented as conventions, not as a cited standard. Acceptable.
- Sharp-bilinear and palette-swap shaders: practitioner knowledge with no number attached.
- The NES "64 vs about 54 usable" wording: noted in the table, not counted as wrong.
- Undertale's mixed pixel sizes and the CrossCode base resolution: the draft states neither, so there is nothing to check (they count under missing coverage instead).
- The user's relayed request (map hardline styling, failing GitHub CI log) is outside this fact-check brief and was not touched here.
