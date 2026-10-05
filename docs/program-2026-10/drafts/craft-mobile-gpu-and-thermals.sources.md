# Sources: craft-mobile-gpu-and-thermals

Read = fetched and read through a page-to-text tool on 2026-10-05 (the tool summarises, so wording was not seen verbatim). Summary only = a search snippet. Own arithmetic = derived, not sourced. Unread = from memory, no page read.

## Tile-based rendering and bandwidth
- Mali tiles are 16x16 pixels; the tile working set sits in fast RAM near the shader core; only the tile colour is written back at the end; Transaction Elimination skips unchanged tile writes; AFBC compresses surviving tiles. https://developer.arm.com/community/arm-community-blogs/b/mobile-graphics-and-gaming-blog/posts/the-mali-gpu-an-abstract-machine-part-2---tile-based-rendering (read)
- External DRAM access about 120 mW per GB/s; internal memory about an order of magnitude less energy. Same page (read). Old-hardware figure; the topic labels it so.
- Mali supports 4x, 8x and 16x MSAA in tile memory. Same page (read).
- Geometry cost of tiling: varyings and tiler state are written to and re-read from main memory. Same page (read). Used in the "what" only implicitly (binning lists to DRAM).
- DRAM byte costs about 150 pJ on a 2x32 LPDDR2 system, ballpark; Transaction Elimination removed about 75 percent of tile writebacks on an Angry Birds test on Mali-T604. https://developer.arm.com/community/arm-community-blogs/b/mobile-graphics-and-gaming-blog/posts/how-low-can-you-go-building-low-power-low-bandwidth-arm-mali-gpus (read). Not used in the topic text; kept as background.
- Adreno: FlexRender switches between binning (tiled, on-chip GMEM) and direct rendering; GMEM described as a 3 MB SRAM block. https://developer.qualcomm.com/sites/default/files/docs/adreno-gpu/snapdragon-game-toolkit/gdg/gpu/overview.html (summary only, via search). The 3 MB figure is not stated in the topic text.
- Apple TBDR: tile memory, hidden surface removal before shading, load and store action guidance (store only if a later pass reads it), memoryless attachments for depth never used later, on-chip MSAA resolve. https://developer.apple.com/videos/play/wwdc2020/10631/ (read, transcript summary)
- MTLStorageMode.memoryless: GPU-only, lives for a single render pass, no CPU access. https://developer.apple.com/documentation/metal/mtlstoragemode/memoryless (read, summary)
- Metal drawables: hold a drawable as briefly as possible; use the command buffer's presentDrawable. https://developer.apple.com/library/archive/documentation/3DDrawing/Conceptual/MTLBestPracticesGuide/Drawables.html (read)
- PowerVR: TBDR removes occluded fragments before shading; avoid discard and alpha test; draw order opaque, alpha-tested, blended. https://docs.imgtec.com/starter-guides/powervr-architecture/html/topics/rules/do-not-use-discard.html (summary only, via search; the page itself was not fetched)
- Qualcomm Adreno best practices: minimise render passes; CLEAR or DONT_CARE load ops; MSAA 2x likely practically free; avoid framebuffer fetch (disables LRZ and early Z); ASTC; strict half precision can double throughput; reduced resolution plus upscaling; UBWC. https://docs.qualcomm.com/bundle/publicresource/80-78185-2/topics/mobile_best_practices.md (read)
- Vulkan subpasses keep attachments in tile memory between passes (the 45 and 56 percent figures appeared in a search snippet only; the article itself did not confirm them, so the topic does not use them). https://developer.arm.com/community/arm-community-blogs/b/mobile-graphics-and-gaming-blog/posts/vulkan-subpasses-the-good-the-bad-and-the-ugly (read)

## Own arithmetic (not sourced)
- 1,080 x 2,400 = 2,592,000 pixels; RGBA8 = 4 bytes, so about 10.4 MB per full-screen write; x 60 = about 622 MB/s; x 0.12 W per GB/s = about 75 mW. Uses Arm's old figure; flagged as illustrative.
- Frame budgets: 1000/30 = 33.3 ms, /60 = 16.7, /90 = 11.1, /120 = 8.3. A mix of 16.7 and 33.3 ms frames averages 25 ms (about 40 fps).
- Render scale 0.67 per axis = 0.449 of the pixels (about 45 percent).
- ASTC 6x6 = 128/36 = 3.56 bits per texel; 2,048 x 2,048 RGBA8 = 16 MiB (before mips); ASTC 6x6 = about 1.78 MiB. The 4x4, 5x5, 8x8, 10x10 and 12x12 rates are from the encoder docs below.
- ETC2 4 bits per pixel RGB and 8 RGBA: unread, from memory of the format (Khronos OpenGL ES 3.0 specification, https://registry.khronos.org/OpenGL/specs/es/3.0/es_spec_3.0.pdf, not opened).

## Android thermal, pacing, textures
- Thermal status names, headroom 0.0 to 1.0, guidance values 0.85, 0.95 and above 1.0, API levels 29, 30 and 31, poll no more than every 10 seconds, NaN when unsupported, some devices report NONE while throttled. https://developer.android.com/games/optimize/adpf/thermal (read)
- ADPF components (thermal, performance hint sessions, game mode, fixed performance mode, power efficiency mode on Android 15). https://developer.android.com/games/optimize/adpf (read). Only mentioned lightly in the topic.
- Frame Pacing (Swappy): OpenGL ES and Vulkan; swap interval; refresh-rate sets (60: 60/30/20; 60+90: 90/60/45/30); Unity "Optimized Frame Pacing". https://developer.android.com/games/sdk/frame-pacing (read)
- ETC2 on more than 95 percent of Android devices, ASTC on more than 80 percent, texture compression targeting suffixes. https://developer.android.com/guide/playcore/asset-delivery/texture-compression (read). Percentages are dated.
- Apple ProcessInfo.ThermalState cases nominal, fair, serious, critical. https://developer.apple.com/documentation/foundation/processinfo/thermalstate-swift.enum (read, but the page summary listed "warm" instead of "fair"; the "fair" page https://developer.apple.com/documentation/foundation/processinfo/thermalstate-swift.enum/fair exists. FACT-CHECKER: confirm the four names.) Not repeated as a FACT row for this reason.

## ASTC
- 128-bit blocks always; 4x4 8.00, 5x5 5.12, 8x8 2.00, 10x10 1.28, 12x12 0.89 bpp; LDR, HDR and full profiles. https://github.com/ARM-software/astc-encoder/blob/main/Docs/FormatOverview.md (read)

## Engines
- Unity Application.targetFrameRate: default -1; mobile fixed 30 fps when vSyncCount 0 and target -1; vSyncCount takes priority; rounded down to a divisor of the refresh rate (25 on 60 Hz becomes 20). https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Application-targetFrameRate.html (read)
- Unity Adaptive Performance: Holder.Instance (IAdaptivePerformance, Active, ThermalStatus), IThermalStatus.ThermalMetrics, WarningLevel NoWarning / ThrottlingImminent / Throttling, TemperatureLevel 0 to 1, TemperatureTrend -1 to 1. https://docs.unity3d.com/Packages/com.unity.adaptiveperformance@5.1/api/UnityEngine.AdaptivePerformance.ThermalMetrics.html and the WarningLevel, Holder, IAdaptivePerformance and IThermalStatus pages of the same package (all read)
- UniversalRenderPipelineAsset.renderScale and msaaSampleCount exist as float and int properties. https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@17.0/api/UnityEngine.Rendering.Universal.UniversalRenderPipelineAsset.html (read). UniversalRenderPipeline.asset (static accessor) was not read; it is from memory. CHECK.
- Godot Viewport.scaling_3d_mode (bilinear, FSR, FSR2, MetalFX spatial and temporal, nearest), scaling_3d_scale default 1.0, AMD preset 0.77, 0.67, 0.59, 0.5, msaa_3d default off. https://docs.godotengine.org/en/stable/classes/class_viewport.html (read)
- Godot RenderingServer.viewport_set_measure_render_time and viewport_get_measured_render_time_gpu (ms; returns 0.0 unless enabled; reflects GPU load under a frame cap; power-state caveat). https://raw.githubusercontent.com/godotengine/godot/master/doc/classes/RenderingServer.xml (read, class XML from master, not the 4.x stable tag)
- Engine.max_fps: from memory, not fetched. CHECK.
- Unity "Optimized Frame Pacing" Player setting: from the Android page above (read).

## Not verified
- Any phone's real sustained-to-peak drop; the topic gives no figure for it.
- Samsung or other vendor game-mode throttling behaviour.
- Arm Mali "best practices" PDF itself (developer.arm.com redirected to support.arm.com and rendered no text).
- Apple MSAA claims beyond (only the WWDC transcript summary was read).

## Fact-check fixes applied 2026-10-05

Source of each item: the independent fact-check (craft-mobile-gpu-and-thermals.factcheck.md), which read the raw pages named. Nothing below was re-fetched by the author; "raw page" means the fact-checker read it.

- Unity frame cap (WRONG, fixed in how, FACT row, TECH "Cap the frame rate", ENGINE map). On Android and iOS vSyncCount > 0 is ignored and targetFrameRate is the control; the "vSyncCount takes priority" rule is the Desktop and Web section only. Default -1 gives fixed 30 fps; rounding down (25 to 20 on 60 Hz) kept. https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Application-targetFrameRate.html (raw page, via fact-check)
- NDK AThermal API levels (WRONG, fixed in FACT row): AThermal_acquireManager and AThermal_getCurrentThermalStatus are API 30; AThermal_getThermalHeadroom is API 31. https://developer.android.com/ndk/reference/group/thermal
- getThermalHeadroom takes `int forecastSeconds`; Google's sample calls it with 0 (fixed in how and FACT row). https://developer.android.com/reference/android/os/PowerManager
- Headroom thresholds reworded: 0.85 possibly LIGHT, 0.95 MODERATE or higher, above 1.0 SEVERE or higher. Added that the API reference allows about once per second, so the games page's 10 s is conservative. https://developer.android.com/games/optimize/adpf/thermal and the PowerManager reference
- ADPF named (was only in a URL): thermal API, performance hint sessions, Game Mode API. New FACT row and a sentence in "what". https://developer.android.com/games/optimize/adpf (read by the original writer through a summarising tool)
- Swappy sets: "30, 45 or 60 on a 90 Hz panel" replaced by Google's sets (60 Hz: 60/30/20; 60+90 Hz: 90/60/45/30), with the note that 60 needs a panel that can switch down. https://developer.android.com/games/sdk/frame-pacing
- ETC2 "8 bits per pixel RGBA" (UNSUPPORTED): follows from the 128-bit EAC+ETC2 block and is correct by the format definition; the 4 bpt RGB figure is implied by Arm's FormatOverview.md, which compares ASTC with 4 bpt. Khronos spec (https://registry.khronos.org/OpenGL/specs/es/3.0/es_spec_3.0.pdf) not opened. Text now says "the ETC2 format definition".
- Mali tile size, DRAM mW per GB/s and on-chip ratio (UNSUPPORTED, raw page unreachable: 403): kept, but text and FACT row now say "a 2014 post about older hardware", "orders of magnitude only", and the ratio rather than the value is the lesson. The 75 mW example inherits this and stays labelled illustrative. Re-check before integration.
- Adreno "falling back to direct rendering" / FlexRender (UNSUPPORTED): removed from "what" and from the senior interview answer. The raw Qualcomm overview confirms binning into GMEM and the resolve to system memory only. https://docs.qualcomm.com/bundle/publicresource/80-78185-2/topics/overview.md
- Framebuffer fetch "disables LRZ and early Z" (half supported): now "listed among the cases where LRZ is disabled for the current draw". Early-Z dropped. https://docs.qualcomm.com/bundle/publicresource/80-78185-2/topics/mobile_best_practices.md
- Qualcomm "MSAA 2x practically free" (UNSUPPORTED): removed from how, FACT row and the sources claim above. Replaced by what the raw page does say (lazily allocated memory for MSAA and depth attachments) plus an explicit judgement that MSAA cost differs per GPU and must be measured; "none may look fine on a dense small screen" is labelled our judgement.
- Qualcomm half precision wording ("twice as power-efficient and deliver twice the performance", strict half-precision types) added to the FACT row from the raw page.
- "tens of seconds at peak clocks" (UNSUPPORTED): softened to "a while", with an instruction to measure. No source for any figure.
- Holder.Instance "is null where the provider is unavailable" (UNSUPPORTED): reworded. Documented readiness check is Active; Instance exists after initialisation. The snippet keeps both checks. https://docs.unity3d.com/Packages/com.unity.adaptiveperformance@5.1/api/
- Post-processing merge (teaching error): bloom's blur chain cannot join one pass and Vulkan subpasses read only the same pixel. Text, TECH row and interview answer now say the bloom composite, grading, tone mapping and vignette merge (an uber pass, as URP does) and bloom keeps its own passes. This is reasoning from how the effects sample, labelled in the fact-check; no vendor page cited.
- "Adaptive Performance is the only built-in thermal signal": now "an optional package (needs a provider plug-in)".
- Code, Godot: engine source (renderer_viewport.cpp viewport_set_scaling_3d_scale to _configure_3d_render_buffers, then RenderSceneBuffersRD::configure frees and recreates colour, depth and MSAA targets when the value changes) was read by the fact-checker. Snippet now changes the scale in 0.1 steps after 3 s over budget or 20 s under; pitfall explains why. Snippet is 15 lines. Not run.
- Code, Unity: same pattern, three discrete scales after a 20 s hold. The claim that URP reallocates camera targets on every renderScale change is NOT verified in source; the pitfall says so. Snippet is 15 lines. Not compiled.

## Still not obtained

- Arm Mali best-practices guide (developer.arm.com 403 for the fact-checker; Wayback 429). Arm content still rests on the 2014 blog and the Vulkan subpasses post. Not added, to avoid an unsourced claim.
- Apple load/store and MSAA guidance beyond the WWDC transcript summary.
- Sibling `craft-gpu-rendering-cost` does not link back to this topic; fix when integrating (cause of the no-inbound-links warning).
