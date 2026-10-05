# Fact-check: craft-mobile-gpu-and-thermals

Checked 2026-10-05 against raw primary pages fetched with curl (not through a summariser), the
Godot class XML and engine source on `master`, and the Unity 6 / package API pages.

## Verdict: PASS WITH FIXES

Counts: WRONG 3, UNSUPPORTED 7, OUTDATED 0.

Most serious: the Unity frame-cap advice is the desktop rule, and on mobile it is the reverse.
On Android and iOS, Unity ignores `vSyncCount > 0` and `targetFrameRate` is the control. The
draft says the opposite in `how`, in the targetFrameRate FACT row, in TECH "Cap the frame rate on
purpose" and in the Unity `map`.

## Claims

| Claim (short) | Location | Verdict | Correct value | Source |
|---|---|---|---|---|
| "Application.targetFrameRate is ignored when vSyncCount is not 0 and Unity's manual recommends vSyncCount for pacing" / "vSyncCount takes priority when it is not 0" | how[1]; facts[2]; TECH cap (`vSyncCount or targetFrameRate`); ENGINE.unity.map | WRONG (for mobile) | That is the Desktop and Web section. The Android and iOS sections say "QualitySettings.vSyncCount > 0 are ignored", and tell you to use targetFrameRate. Default -1 → fixed 30 fps, and rounding down (25 → 20 on 60 Hz) are CONFIRMED. | https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Application-targetFrameRate.html |
| "the NDK AThermal functions need API level 31" | facts[0] | WRONG | `AThermal_acquireManager` and `AThermal_getCurrentThermalStatus` are available from API 30. `AThermal_getThermalHeadroom` is API 31. | https://developer.android.com/ndk/reference/group/thermal |
| "read PowerManager.getCurrentThermalStatus() and getThermalHeadroom()" | how[0] | WRONG (signature) | `getThermalHeadroom(int forecastSeconds)` takes an argument. Google's own sample calls `getThermalHeadroom(0)`. | https://developer.android.com/reference/android/os/PowerManager |
| getCurrentThermalStatus API 29, getThermalHeadroom API 30 | facts[0] | CONFIRMED | | PowerManager reference |
| Status levels NONE … SHUTDOWN; headroom 0.0 none to 1.0 severe; do not call more than once every 10 s; NaN; some devices report NONE while throttled; "recommend using getThermalHeadroom instead" | what, traps, facts[0] | CONFIRMED | Nuance: the PowerManager reference says calling much more often than once *per second* may return NaN, and that 0.0 "does not correspond to any particular thermal status". The games page says 10 s and "0.0f (no throttling)". The draft follows the games page, which is the cited source. | https://developer.android.com/games/optimize/adpf/thermal |
| "about 0.85 is a warning, 0.95 moderate, 1.0 severe" | how[9] | CONFIRMED (wording nit) | Google: 0.85 → possibly LIGHT, 0.95 → MODERATE or higher, > 1.0 → SEVERE or higher. Prefer "light" over "a warning". | thermal page |
| Swappy works with OpenGL ES and Vulkan; 60 Hz: 60/30/20; 60+90 Hz: 90/60/45/30; Unity Optimized Frame Pacing | facts[1], how[2] | CONFIRMED | Unity 2019.2+, Player > Android > Resolution and Presentation. | https://developer.android.com/games/sdk/frame-pacing |
| ETC2 > 95 %, ASTC > 80 %, ETC2 guaranteed with OpenGL ES 3.0 and Vulkan, texture compression targeting | facts[3], how[7], interview | CONFIRMED | | https://developer.android.com/guide/playcore/asset-delivery/texture-compression |
| ASTC 128-bit blocks; 4x4 8.00, 5x5 5.12, 6x6 3.56, 8x8 2.00, 10x10 1.28, 12x12 0.89; LDR/HDR/full profiles | facts[4], how[7] | CONFIRMED | | astc-encoder Docs/FormatOverview.md (raw) |
| ETC2 "4 bits per pixel for RGB and 8 for RGBA" | TECH ASTC alt | UNSUPPORTED (RGBA half) | 4 bpt RGB is implied by Arm's overview, which compares ASTC 3.56 with "4 bpt" ETC2. 8 bpp RGBA follows from the 128-bit EAC+ETC2 block, but no page was opened for it. The writer also lists it as unread. It is correct by the format definition, so add a source. | FormatOverview.md; Khronos spec not opened |
| Mali 16x16 tiles, only the tile colour written back, ~120 mW per GB/s DRAM, on-chip about an order of magnitude cheaper, MSAA in tile memory | what, why[1], facts[5] | UNSUPPORTED (raw page unreachable) | developer.arm.com and community.arm.com returned 403, and the Wayback Machine returned 429. The values match the fact-checker's memory of the 2014 post, but they were not seen on a page. Re-check before integration. | Arm blog "The Mali GPU: an abstract machine, part 2" |
| Adreno "falling back to direct rendering when binning is not worth it" (FlexRender) | what[1] | UNSUPPORTED | The raw Qualcomm overview confirms binning into GMEM and the resolve to system memory. It does not mention direct-mode fallback or FlexRender. The writer had only a search snippet. | https://docs.qualcomm.com/bundle/publicresource/80-78185-2/topics/overview.md |
| Framebuffer fetch "disables LRZ and early Z rejection" | how[4], facts[6] | UNSUPPORTED (half) | The raw page lists framebuffer fetch among the cases where LRZ is disabled *for the current draw*. Early-Z is not stated for it. Drop "and early Z", or find the line. | Qualcomm mobile_best_practices.md (raw) |
| "Qualcomm says MSAA 2x is likely to be practically free … for small mobile screens none at all may do" | how[6], facts[6] ("2x is likely close to free") | UNSUPPORTED | The raw page has no MSAA 2x or "free" text. The only MSAA mention is lazily allocated MSAA attachments. The writer saw it only through a summariser. | Qualcomm mobile_best_practices.md and overview.md (raw) |
| Qualcomm: minimise render passes, CLEAR/DONT_CARE load ops, ASTC, half precision "twice the performance", upscaling | how[4,8], facts[6] | CONFIRMED | "can be twice as power-efficient and deliver twice the performance … Use strict half-precision types". | Qualcomm mobile_best_practices.md |
| PowerVR: avoid discard and alpha test, deferred depth writes, order opaque → alpha-tested → blended | how[5], facts[7], TECH | CONFIRMED | Imagination prefers alpha blending over discard. | https://docs.imgtec.com/…/do-not-use-discard.html (raw, 200) |
| Apple thermal state nominal, fair, serious, critical | what | CONFIRMED | The writer's "warm" doubt is resolved: the four cases are nominal, fair, serious, critical. | developer.apple.com JSON for ProcessInfo.ThermalState |
| MTLStorageMode.memoryless: GPU-only, exists only during a render pass | how[3], TECH | CONFIRMED | | developer.apple.com JSON for memoryless |
| Adaptive Performance: Holder.Instance (IAdaptivePerformance), Active, ThermalStatus, ThermalMetrics, WarningLevel NoWarning/ThrottlingImminent/Throttling, TemperatureLevel [0,1], TemperatureTrend [-1,1] | facts[8], ENGINE.unity | CONFIRMED | | com.unity.adaptiveperformance@5.1 API pages |
| "Holder.Instance is null on devices where the provider is not available" | ENGINE.unity.pitfall | UNSUPPORTED | The Holder page says only that Instance becomes available after initialisation and is removed by Deinitialize. The documented readiness check is `Active` (and `Initialized`). The snippet checks both null and Active, so the code is fine. | Holder / IAdaptivePerformance pages |
| UniversalRenderPipeline.asset (static), renderScale float get/set, msaaSampleCount int get/set | ENGINE.unity, TECH | CONFIRMED | | URP 17.0 API pages |
| Godot Viewport.scaling_3d_scale (default 1.0, AMD presets 0.77/0.67/0.59/0.5), scaling_3d_mode (bilinear, FSR, FSR2, MetalFX spatial/temporal, nearest), msaa_3d default 0, Engine.max_fps (default 0), get_viewport_rid, clampf | ENGINE.godot, how[6] | CONFIRMED | | Godot master doc/classes XML |
| viewport_get_measured_render_time_gpu: ms, 0.0 unless measurement enabled, reflects GPU load under a cap, power-state caveat | facts[9], ENGINE.godot.pitfall | CONFIRMED | master XML. Not cross-checked on a 4.x stable tag. | RenderingServer.xml |
| "Godot has no thermal API" | how[9], ENGINE.godot | CONFIRMED | There is no "thermal" in OS.xml, DisplayServer.xml or Engine.xml. | Godot master XML |
| "A flagship can run its GPU and CPU at peak clocks for tens of seconds" | what[3] | UNSUPPORTED | No source given or found. The writer lists sustained-to-peak figures as not verified. Soften to "for a while", or cite a measurement. | — |
| Arithmetic: 1,080×2,400 = 2,592,000 px; ×4 B = 10.37 MB; ×60 = 622 MB/s; ×0.12 W per GB/s = 74.6 mW; 1000/30,60,90,120 = 33.3/16.7/11.1/8.3; (16.7+33.3)/2 = 25 ms = 40 fps; 0.67² = 0.449; 128/36 = 3.56; 2048²×4 = 16 MiB; ASTC 6x6 = 342²×16 B = 1.78 MiB; BUDGET_MS = 26.64 | what, why, how, TECH, snippet | CONFIRMED | All recomputed. The 75 mW inherits the unverified 120 mW figure, and the draft labels it illustrative. | own arithmetic |

## Code issues

Neither snippet was compiled or run. Every API name was confirmed on the official reference
(Unity 6: Adaptive Performance 5.1 and URP 17.0 pages; Godot: master class XML). The GDScript is
valid Godot 4 syntax line by line. The C# compiles in reading: the usings cover Holder,
WarningLevel and UniversalRenderPipeline, and the ternary chain is typed float. There are no Go
snippets.

1. **Godot: the governor reallocates the 3D render buffers on almost every frame.** This is
   verified in engine source. `RendererViewport::viewport_set_scaling_3d_scale` returns early only
   when the value is unchanged. Otherwise it calls `_configure_3d_render_buffers`, which calls
   `RenderSceneBuffersRD::configure` → `cleanup()` and `create_texture(...)` for colour, depth and
   MSAA (`servers/rendering/renderer_viewport.cpp` around line 1089;
   `servers/rendering/renderer_rd/storage_rd/render_scene_buffers_rd.cpp` `configure`). The
   snippet changes the scale by `0.2 * delta` on every frame it is over budget, so it frees and
   recreates the render targets each frame. That causes hitches and allocation churn, which is the
   opposite of the topic's own "move slowly and rarely". Fix: quantise the scale to steps (for
   example 0.1) and change it only after the signal has stayed over or under for a few seconds.
2. **Unity: same pattern, not verified in source.** `Mathf.MoveTowards` writes a new
   `renderScale` on every frame for about 7 s per transition. URP sizes its camera targets from
   renderScale, so every distinct value probably reallocates them. The same fix applies: discrete
   steps and a hold time.
3. The Unity pitfall text is correct that writing to the asset persists in the Editor.

## Teaching issues

- The Unity frame-cap rule (WRONG above) is a teaching error as well as a factual one. A reader
  who follows "use vSyncCount for pacing" on a phone gets no cap, because Unity ignores it.
  Rewrite: on Android and iOS use `Application.targetFrameRate` (a divisor of the refresh rate)
  together with Optimized Frame Pacing, and leave vSyncCount to desktop.
- "Combine bloom, colour grading and tone mapping in one pass" (how[4], TECH "Merge
  post-processing", interview senior[1]). Bloom needs a downsample and blur chain that reads
  neighbouring pixels, so it cannot fold into one full-screen pass. Vulkan subpasses with input
  attachments only read the same pixel, so they cannot carry a blur either. What merges is the
  bloom *composite* with grading, tone mapping and vignette (an uber pass, as URP already does).
  Say that, and give the cost of bloom's own passes.
- "Unity's Adaptive Performance is the only built-in thermal signal" (ENGINE.note). It is an
  optional package that needs a provider plug-in. Say "package" rather than "built-in".
- Swappy "such as 30, 45 or 60 on a 90 Hz panel" (how[2]). 60 requires a device that can switch
  the panel to 60 Hz; Google's set is for "60 Hz + 90 Hz devices". Minor.
- The poll interval: the draft gives the games page's 10 s and attributes it correctly. It could
  add that the API reference says once per second is the useful limit, so 10 s is conservative.
  Optional.

## Missing or thin coverage (brief "Must cover")

- **ADPF** is never named in the text, only in a URL. The brief asks for "Android's Thermal API /
  ADPF". One line is needed on ADPF as the umbrella: thermal, performance hint sessions, Game Mode
  API. The writer read that page but did not use it.
- **Arm Mali best practices guide** is not cited. Arm content comes only from a 2014 blog post
  (the writer could not load the guide). Arm's own load/store, MSAA and subpass guidance would
  replace the unverified blog figures with current ones.
- Apple GPU / Metal best practices: only the drawables page and a WWDC transcript summary are
  used. This is adequate, but the load/store and MSAA claims attributed to Apple rest on a summary.
- Everything else on the list is covered: TBDR and bandwidth, load/store, MSAA on tile,
  framebuffer fetch, sustained versus peak, Apple thermal state, Swappy, 30/60/120 budgets and
  battery, ASTC/ETC2, render scale, half precision, Qualcomm, PowerVR.

## Siblings and validation

- `PLAYABLE_DRAFTS=…/craft-mobile-gpu-and-thermals.js node src/validate.js`: one error,
  `rel -> unknown craft-gpu-rendering-cost`. That is a sibling draft.
- With `craft-mobile-gpu-and-thermals.js,craft-gpu-rendering-cost.js` loaded, this draft has no
  errors. The remaining error is the sibling's own (`rel -> unknown
  craft-cpu-cache-and-data-layout`). Loading that file as well leaves only its
  `server-world-partitioning` link. Expected: "WARN topics with no inbound links:
  craft-mobile-gpu-and-thermals" and "DRAFT not in any learning path".
- Repetition: `craft-gpu-rendering-cost` mentions bandwidth, heat, discard on tile GPUs and
  texture formats in a sentence each. This draft develops them and says so in its `rel` line. It
  is not a repeat. The sibling does not link back to this topic, which is the cause of the
  no-inbound-links warning. Consider adding the reverse rel when integrating.

## Style

No hype words. British spelling throughout ("optimise", "colour", "artefacts", "normalised").
"Optimized Frame Pacing" is Unity's product label, and "optimize" appears only inside a URL. No
employer, colleague or internal project is named.

## Set aside

- Tag "60 fps … 38 fps at minute ten": an illustrative scenario, not a factual claim.
- "Mali and Adreno are tile-based immediate-mode, Apple and PowerVR deferred": a standard
  classification. PowerVR is confirmed by Imagination's page. Apple TBDR and HSR are well known,
  and the writer's WWDC source was a summary only. Not flagged.
- "OpenGL ES: invalidate the framebuffer before the end of the pass" and "Vulkan transient
  attachments": standard API practice. Qualcomm's raw page confirms lazily allocated memory for
  MSAA and depth attachments.
- Thermal status SHUTDOWN and the full enum: present in the PowerManager reference. Not re-quoted.
- `Engine.max_fps` and the scaling API on the 4.x stable tag: checked on master only. These
  members have been stable since 4.0 (MetalFX modes since 4.4). Not flagged.
- `Time.deltaTime` and `Mathf.MoveTowards`: core Unity APIs. Not opened.
- The Unity snippet's Editor persistence: already covered by the draft's own pitfall.
- The Arm "how low can you go" figures (150 pJ/byte, Transaction Elimination 75 %) are in the
  sources file only and not in the text. Not checked.
- The Interview and verify/test sections: process advice with no factual claims beyond those in
  the table.
