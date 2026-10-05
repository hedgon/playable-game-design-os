# Sources: pixel-art-direction

Status key: READ = I fetched and read the page (or the engine's own doc source on GitHub); SUMMARY = only a search or fetch summary reached me, not the full page; MEMORY = widely known, not re-read this session; ARITHMETIC = computed here.

## Engine behaviour

1. Godot pixel art setup: stretch mode viewport, aspect keep, scale mode integer ("prevents uneven pixel scaling"); with fractional scaling a checkerboard looks uneven and logo and text line widths vary. READ. https://docs.godotengine.org/en/stable/tutorials/rendering/multiple_resolutions.html
2. Godot recommends 640 by 360 as a baseline because it scales to 1280x720, 1920x1080, 2560x1440 and 3840x2160 without bars under integer scaling; viewport sizes from 256x224 to 640x480 are listed. READ. Same URL.
3. Godot warns that viewport stretch mode does not allow sub-pixel movement or rotation; use canvas_items if sub-pixel is wanted. READ. Same URL.
4. display/window/stretch/mode default "disabled"; scale_mode default "fractional"; "integer" floors the scale to an integer. READ (class XML in the engine repo). https://raw.githubusercontent.com/godotengine/godot/master/doc/classes/ProjectSettings.xml (rendered at https://docs.godotengine.org/en/stable/classes/class_projectsettings.html)
5. snap_2d_transforms_to_pixel and snap_2d_vertices_to_pixel default false; crisper look at the cost of less smooth movement, especially with Camera2D smoothing; not recommended to enable both; Control nodes snap by default (gui/common/snap_controls_to_pixels). READ. Same XML.
6. rendering/textures/canvas_textures/default_texture_filter default value 1 (Linear; 0 is Nearest, from the enum). Value 1 READ; the enum mapping is MEMORY. Same XML.
7. Camera2D position_smoothing_enabled default false, speed 5.0. READ. https://raw.githubusercontent.com/godotengine/godot/master/doc/classes/Camera2D.xml
8. Window.content_scale_mode VIEWPORT ("rendered at the base size then scaled; more performant than CANVAS_ITEMS but pixelated"), CONTENT_SCALE_STRETCH_INTEGER ("stretched only according to an integer factor, preserving sharp pixels; may leave a black background"). READ. https://raw.githubusercontent.com/godotengine/godot/master/doc/classes/Window.xml. The version that added content_scale_stretch is NOT verified; I wrote "Godot 4" only, and the snippet uses the master API.
9. Godot pixel fonts: set default texture filter to Nearest; subpixel positioning Disabled; font size an integer multiple of the design size and the Control scaled by an integer multiple. READ. https://docs.godotengine.org/en/stable/tutorials/ui/gui_using_fonts.html
10. Godot TileSet terrains: match modes corners and sides, corners, sides; peering bits; "Use Texture Padding" adds a 1-pixel transparent edge to prevent bleeding when filtering is enabled. READ. https://docs.godotengine.org/en/stable/tutorials/2d/using_tilesets.html
11. Unity 2D Pixel Perfect package 5.0.3: properties Assets Pixels Per Unit (match to all sprites), Reference Resolution, Upscale Render Texture, Pixel Snapping ("does not affect any GameObjects' Transform positions"), Crop Frame, Stretch Fill; import with Filter Mode Point and Compression None. READ (the first fetch was a summary of the page; the second confirmed the PPU and snapping lines). https://docs.unity3d.com/Packages/com.unity.2d.pixel-perfect@5.0/manual/index.html. NOT VERIFIED: whether Unity 6 URP 2D uses this package or its own built-in Pixel Perfect Camera; the draft says to check. The URP page URLs I tried returned a redirect and a 404.
12. Unity sprite import: Pixels Per Unit, Mesh Type (Full Rect or Tight), Filter Mode Point (no filter), Generate Mip Maps. READ (summary of the page). https://docs.unity3d.com/6000.0/Documentation/Manual/texture-type-sprite.html. The page gave no pixel-art guidance; the settings recommended in the draft come from the Pixel Perfect package page (item 11).
13. Unity C# API names used in the snippet (AssetPostprocessor.OnPreprocessTexture, TextureImporter.spritePixelsPerUnit, filterMode, textureCompression, mipmapEnabled): MEMORY, not re-read. Reviewer should check them against https://docs.unity3d.com/6000.0/Documentation/ScriptReference/TextureImporter.html
14. Unity Rule Tile: 3x3 neighbour grid, each neighbour Don't Care, This or Not This; outputs Fixed, Random, Animation; rotation and mirror transforms. READ. https://docs.unity3d.com/Packages/com.unity.2d.tilemap.extras@3.1/manual/RuleTile.html

## Games and practitioners

15. Celeste and TowerFall store positions as integers with a float remainder; movement is applied one pixel at a time with collision checks ("we only move when the rounded remainder is non-zero"). READ (fetch summary of the article by the games' programmer). https://maddymakesgames.com/articles/celeste_and_towerfall_physics/index.html
16. Celeste renders at 320x180. SUMMARY: a search summary quoting community forum posts ("renders at a constant 320x180 regardless of window size"); the forum pages returned 403 to me. No primary source found. Used only in the draft as an example base resolution and not stated as sourced fact in FACTS. https://itch.io/t/188781/launch-the-game-in-another-resolution
17. Dead Cells: the artist built a 3D-to-pixel pipeline for lack of bandwidth; reference games King of Fighters and Guilty Gear; 50 pixel in-game character height; 30 fps; antialiasing removed; limits "flickering pixels" and lower detail than hand-drawn. READ (fetch summary of the developer's own article). https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-
18. Octopath Traveler HD-2D: director said the aim was rich-looking pixel art enhanced by modern technology; early attempts lacked depth or over-emphasised resolution and saturation; the fix was more tile variations and colours; sprites looked "lonely and simple" on a larger screen. READ (fetch summary of the developer interview). https://www.siliconera.com/project-octopath-traveler-developers-answer-project-started-troubles-developing-hd-2d/
19. Octopath Traveler built in Unreal Engine 4, with depth of field and tilt-shift as HD-2D signatures. SUMMARY only (search summary of the Unreal Engine spotlight, which returned 403, and of Wikipedia). https://www.unrealengine.com/en-US/spotlights/octopath-traveler-s-hd-2d-art-style-and-story-make-for-a-jrpg-dream-come-true . Reviewer should confirm.
20. Raymond Schlitter (Slynyrd) colour ramps: 9-swatch example ramp, about 20 degree hue shifts within a ramp and 45 between ramps, positive shifts warmer toward light, saturation peaks in the middle, share colours between ramps. READ (fetch summary). https://www.slynyrd.com/blog/2018/1/10/pixelblog-1-color-palettes
21. Pedro Medeiros (Celeste artist) free tutorials, page lists titles including Outlines, Silhouette, Shading, Subpixel, RunCycleSimple, Walk, Jump, WallSlide, Squash, Planning. READ (titles only; I did not read the tutorials' content, so no rule in the draft is attributed to them). https://saint11.art/blog/pixel-art-tutorials/
22. Hollow Knight as the hand-drawn contrast: Team Cherry moved away from pixel art to a hand-drawn look. SUMMARY of a search result (Game Informer making-of); not read in full. The draft does not state it as a fact. https://gameinformer.com/2018/10/15/the-making-of-hollow-knight
23. Stardew Valley maps and tilesheets use 16 by 16 pixel tiles. READ (modding wiki, community-maintained, secondary). https://stardewvalleywiki.com/Modding:Maps . The draft uses 16 px only as an example grid.
24. Undertale scaling: community discussion says sprites are drawn at a low resolution and moved in screen pixels, producing mixed pixel sizes. SUMMARY of forum search results; not used as a stated fact in the draft.
25. CrossCode: searched for its base resolution, nothing reliable found; the draft does not state a number for it.

## Hardware limits

26. NES: up to 25 colours on screen, 4 background and 4 sprite palettes of 4 colours, 64-colour master palette. READ. https://www.nesdev.org/wiki/PPU_palettes
27. NES: 64 sprites in OAM, 8 per scanline, 8x8 or 8x16 sprites. READ. https://www.nesdev.org/wiki/PPU_OAM
28. PICO-8: 128x128, 16 colours, 256 8x8 sprites. READ (vendor page). https://www.lexaloffle.com/pico-8.php

## Autotiling

29. Blob set: 8-neighbour bitmask where a corner counts only if both its adjacent edges are set reduces 256 combinations to 47. ARITHMETIC: I enumerated all 256 masks with that rule in Node and got 47. The usual write-up is cr31's tile bitmasking article, which I could not read (page returned no content). A 4-neighbour edge set has 2^4 = 16 tiles (ARITHMETIC).

## Memory or arithmetic only

30. WCAG 2.2 asks for 3:1 contrast for graphical objects (success criterion 1.4.11 Non-text Contrast). MEMORY; the W3C page returned 403 and curl gave no match. https://www.w3.org/TR/WCAG22/#non-text-contrast
31. Scale table, from arithmetic: 320x180 scales by 4, 6, 8, 12 to 1280x720, 1920x1080, 2560x1440, 3840x2160. 1366x768 gives 768/180 = 4.27, so integer 4 = 1280x720 with bars of (1366-1280)/2 = 43 px at the sides and (768-720)/2 = 24 px top and bottom. 320x180 = 57,600 pixels; 1920x1080 = 2,073,600; ratio 36. 16 px figure = 16/180 = 8.9% of height; 32 px = 17.8%. 320/16 = 20 tiles, 180/16 = 11.25. 0.5 px per frame lands on a new pixel every second frame. ARITHMETIC.
32. Starting frame counts for animation states (idle 2 to 4, walk or run 6 to 8, and so on) are working conventions from practice, not a cited standard. MEMORY. The draft presents them as starting points.
33. Palette-swap shaders, sharp-bilinear style scaling, and mixel as a term: practitioner knowledge, MEMORY. Sharp-bilinear is not in the draft's TECH rows.
34. Sprite cost estimates in the senior interview answer (about 50 to 60 frames for a 10-state player) are illustrative arithmetic, not from a shipped game.

## Fact-check changes (2026-10-05)

Sourced from the fact-check file (which read the raw sources) unless marked READ here.

35. Schlitter hue shift corrected: 9 swatches per ramp, 20 degrees between each neighbouring swatch (about 160 across a ramp); 45 degrees is 360/8 for that example's 8 ramps. Cool-dark, warm-light is now labelled common practice, not a source claim. https://www.slynyrd.com/blog/2018/1/10/pixelblog-1-color-palettes
36. Godot version scope: Window.content_scale_stretch and integer scale mode are in 4.2 and later, absent in 4.1 (Window.xml compared at 4.1, 4.2, master). Draft now says 4.2 or later. https://github.com/godotengine/godot/blob/master/doc/classes/Window.xml
37. Godot defaults updated: stored default stretch mode is still disabled, but the docs say canvas_items is the default for projects created from 4.7; still not viewport. https://docs.godotengine.org/en/stable/classes/class_projectsettings.html
38. Unity 6 URP: the 2D Pixel Perfect package works only with the Built-In Render Pipeline; the URP Pixel Perfect Camera has Grid Snapping (None, Pixel Snapping, Upscale Render Texture) and a Crop Frame dropdown including Stretch Fill. Draft names the URP component and fields and drops "verify". https://docs.unity3d.com/6000.0/Documentation/Manual/urp/2d-pixelperfect-ref.html (supersedes item 11's open question)
39. NES 64 sprites in OAM, 8 per scanline (32-byte secondary OAM), 8x8 or 8x16 sprites: now READ on https://www.nesdev.org/wiki/PPU_OAM this session (via fetch tool summary of the page). Facts source for the NES line is the PPU_palettes page for colours and PPU_OAM for sprites.
40. Octopath HD-2D list: "bloom" removed; dynamic light, depth of field and tilt-shift are confirmed by Wikipedia HD-2D, citing the Unreal Engine spotlight. https://en.wikipedia.org/wiki/HD-2D
41. Dead Cells 30 frames per second is the animation rate; wording changed to "animated at 30 frames per second". https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-
42. WCAG 1.4.11 Non-text Contrast, 3:1, level AA (introduced in 2.1, kept in 2.2): w3c/wcag repo, understanding/21/non-text-contrast.html. https://www.w3.org/TR/WCAG22/#non-text-contrast
43. Added Hollow Knight contrast: art supervisor describes hand-drawn sketches scanned into the engine, "keep it simple" as the visual goal, a large world made in two years. READ via fetch summary; the page states no resolution and calls it hand-drawn, not pixel art. https://gameinformer.com/2018/10/15/the-making-of-hollow-knight
44. Added Stardew Valley 16 by 16 tile size: item 23, community-maintained modding wiki (secondary). https://stardewvalleywiki.com/Modding:Maps
45. Added Pedro Medeiros tutorials as a reference to compare against; titles only (item 21), no rule attributed. https://saint11.art/blog/pixel-art-tutorials/
46. Godot snippet: texture_filter on the node affects that node and inheriting children, not the project; pitfall now says so. Fact-check reading of the Godot API; snippet not run in an engine.
47. Explainer frame 5 and the mid interview answer: the frames on which a 0.5 px/frame sprite jumps depend on rounding. Godot roundf rounds halves away from zero (jumps at frames 1, 3, 5, 7); C# Math.Round default is banker's rounding (2, 4, 6, 8). Now stated as every second frame with both cases.
48. Senior interview frame count replaced with an explicit state table (player 46 frames: idle 4, walk 8, run 8, jump 2, fall 2, hurt 2, attack 6, second attack 6, dash 4, interact 4; enemy 18 frames). Illustrative arithmetic, not from a shipped game.

Not done: Undertale mixed pixel sizes and CrossCode base resolution remain unstated (no reliable source found, items 24 and 25).
