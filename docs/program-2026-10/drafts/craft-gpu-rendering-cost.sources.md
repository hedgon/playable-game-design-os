# Sources: craft-gpu-rendering-cost

Read means the page was fetched in this session (through a fetch tool that returns a model summary of the page, not raw text, so exact wording should be rechecked). Summary means only a search-result summary. Memory means general knowledge, no source read; the fact-checker should confirm or cut.

## Official, read

- Unreal stat unit lists Frame, Game, Draw, GPU, RHIT, DynRes; frame bound by game or render thread when equal to it. https://dev.epicgames.com/documentation/en-us/unreal-engine/stat-commands-in-unreal-engine (read)
- "GPU time contains idle time, so it is only the bottleneck if it is longest and stands alone"; stat gpu and profilegpu (Ctrl+Shift+;) described. Search-result summary of Epic pages (Performance and Profiling Overview, Stat Commands): https://dev.epicgames.com/documentation/en-us/unreal-engine/performance-and-profiling-overview (summary; confirm the exact sentence and page)
- Unreal dynamic resolution: scales primary screen percentage from previous frames' GPU load; defaults r.DynamicRes.MinScreenPercentage 50, Max 100, FrameTimeBudget 33.3 ms; 50 percent screen percentage means 25 percent of pixels; supported on Xbox, PlayStation, Switch, PC DX12/Vulkan. https://dev.epicgames.com/documentation/unreal-engine/dynamic-resolution-in-unreal-engine (read)
- Unity SRP Batcher reduces render-state changes between draws, not the draw count; URP, HDRP and custom SRP, not Built-in. https://docs.unity3d.com/6000.0/Documentation/Manual/SRPBatcher.html (read)
- Unity GPU instancing: one draw call for many GameObjects with same mesh and material; Skinned Mesh Renderers not supported; URP/HDRP custom shaders need SRP Batcher disabled or shader incompatible with it. https://docs.unity3d.com/6000.0/Documentation/Manual/GPUInstancing.html (read)
- Unity dynamic batching: 300 vertices and 900 vertex attributes; "no longer recommended" because CPU overhead may exceed draw call cost; static batch buffer up to 64,000 vertices. https://docs.unity3d.com/6000.0/Documentation/Manual/DrawCallBatching.html (read; the manual URL for dynamic batching redirects here)
- Unity Frame Debugger steps through the events of a frame and shows the scene state at each. https://docs.unity3d.com/6000.0/Documentation/Manual/FrameDebugger.html (read). Claim in the draft that it shows why a batch broke: from memory of the Frame Debugger UI, not in the fetched summary. Unverified; recheck on the page.
- Unity Graphics.RenderMeshIndirect: renders instances with arguments from a GraphicsBuffer; only on platforms supporting compute shaders. https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Graphics.RenderMeshIndirect.html (read)
- Unity texture formats: ASTC on iOS and on Android with GLES 3.1 or Vulkan, 8 bpp (4x4) to 0.89 bpp (12x12); ETC2 for GLES 3.0; desktop DXT1 4 bpp, BC7/DXT5 8 bpp. https://docs.unity3d.com/6000.0/Documentation/Manual/texture-choose-format-by-platform.html (read)
- Godot optimizing 3D performance: MultiMesh for thousands of identical objects; automatic instancing in Forward+; occlusion culling can cut overdraw "10x or 100x"; transparent objects sorted back to front, use as few as possible; baked lighting preferred on mobile. https://docs.godotengine.org/en/stable/tutorials/performance/optimizing_3d_performance.html (read)
- Godot MultiMesh: one draw call for thousands of instances; instance_count, visible_instance_count (-1 = all), transform_format, use_colors. https://docs.godotengine.org/en/stable/classes/class_multimesh.html (read)
- Godot using MultiMesh: no per-instance frustum culling, one AABB for the whole MultiMesh; split into several by area. https://docs.godotengine.org/en/stable/tutorials/performance/using_multimesh.html (read)
- Godot 3D rendering limitations: alpha scissor faster than blend; order-independent transparency costly and not provided. https://docs.godotengine.org/en/stable/tutorials/3d/3d_rendering_limitations.html (read)
- Godot Visual Profiler: CPU left, GPU right graphs; CPU side is rendering tasks only; percentage view uses hard-coded 16.67 ms; "(Parallel)" labels. https://docs.godotengine.org/en/stable/tutorials/scripting/debug/the_profiler.html (search-result summary; the page was not fetched here. Confirm the 16.67 ms and the left/right layout.)
- Godot Viewport scaling: scaling_3d_mode bilinear, FSR, FSR2, MetalFX spatial and temporal; scale below 1.0 renders lower; FSR presets 0.77, 0.67, 0.59, 0.5. https://docs.godotengine.org/en/stable/classes/class_viewport.html (read). The draft says "FSR 2.2" and "UI stays native"; the second is general practice, not stated in the page.
- Microsoft cascaded shadow maps: a shadow map is rendered for each sub-frustum; static cascade intervals per scenario because per-frame recalculation causes shimmer; low ground cameras with far views need more cascades, overhead views fewer; D3D11-class GPUs run pixels in 2x2 quads. https://learn.microsoft.com/en-us/windows/win32/dxtecharts/cascaded-shadow-maps (read in full)
- AMD RDNA performance guide: sort draws by pipeline, at least 10 draws per command buffer; FP16 and intrinsics reduce VGPR pressure. https://gpuopen.com/learn/rdna-performance-guide/ (read, summary). The draft sentence "fewer vector registers let more waves run at once, which hides latency" is the standard occupancy explanation; the fetched summary did not state it. Memory; confirm on the page or cut.
- RenderDoc supports Vulkan, D3D11, D3D12, OpenGL, OpenGL ES on Windows, Linux, Android, Nintendo Switch. https://renderdoc.org/docs/index.html (read)
- PIX on Windows: GPU captures and timing captures; DirectX 12. https://devblogs.microsoft.com/pix/documentation/ (read). Xbox support is stated in the draft; the page summary only implied it. Confirm.
- Arm Mali best practices guide (structure, pipeline stages). https://developer.arm.com/community/arm-community-blogs/b/mobile-graphics-and-gaming-blog/posts/new-developer-guide-arm-mali-application-developer-best-practices (read, but the page is only an index and gives no overdraw numbers)
- Arm overdraw factor definition and the advice to split translucent meshes into an opaque core drawn front to back and a small translucent part drawn back to front. Found in the search summary of Arm community pages (https://developer.arm.com/community/arm-community-blogs/b/mobile-graphics-and-gaming-blog/posts/mali-gpu-tools-a-case-study-part-2-frame-analysis-with-mali-graphics-debugger and the Arm community forum thread "translucent"). Summary only; the fact-checker should open them.

## Arithmetic (ours, checkable)

- 1920 x 1080 = 2,073,600 pixels; x 60 = 124,416,000 per second; x 3 layers = about 373 million.
- 0.67 x 0.67 = 0.449 of the pixels.
- 2048 x 2048 x 4 bytes = 16,777,216 bytes = 16 MiB; with a full mip chain x 4/3 = about 21.3 MiB.
- ASTC block is 128 bits: 128 / (w x h) bits per pixel gives 8 (4x4), 3.56 (6x6), 2 (8x8), 0.89 (12x12). The 8 and 0.89 figures match the Unity page; the block size of 128 bits is from the ASTC specification (https://registry.khronos.org/DataFormat/specs/1.3/dataformat.1.3.html#ASTC, memory, not read here).
- ASTC 4x4 at 8 bpp: 2048 x 2048 = 4 MiB (draft says "a factor of four before mips").
- 3 ms of a 16.7 ms frame = 18 percent.

## Not sourced (general practice, flagged contested or memory)

- Alpha test can disable early depth rejection on some GPUs (Memory; the Apple TBDR page summary also says alpha test and blending limit hidden surface removal, https://developer.apple.com/documentation/metal/tailor-your-apps-for-apple-gpus-and-tile-based-deferred-rendering, summary only and the summary had errors, so the page needs a real read).
- Impostors, HLOD, depth pre-pass and depth pyramid GPU culling as techniques (Memory; Unreal and Godot docs name HLOD and visibility ranges: Godot's page lists "visibility ranges (HLOD)", read).
- Xcode Metal tools for GPU capture: named, not verified (the Apple page fetched gave no usable content).
- "Prewarm shader variants in a loading screen" and keyword stripping: widely used practice, no source read; Unity and Unreal both document variant stripping and PSO or shader precompilation, not fetched.
- "MaterialPropertyBlock can break SRP Batcher compatibility": from memory of Unity's SRP Batcher compatibility notes; the fetched page did not carry it. Confirm at https://docs.unity3d.com/6000.0/Documentation/Manual/SRPBatcher-Compatibility.html (not fetched).
- Graphics.RenderMeshInstanced array overload instance cap per call: draft says 1,000 matrices in the snippet and does not claim a limit; confirm the limit at https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Graphics.RenderMeshInstanced.html (not fetched).
- Unity URP light and shadow limits, Unity occlusion culling manual and LOD Group details: pages 404 or were thin, so no number from them appears in the draft.

## Changes after the fact-check (2026-10-05)

Sourcing for the corrections below is the fact-check's own raw-page reads (curl, HTML stripped) unless a line says otherwise.

- WRONG: static batching loses per-object culling. Now: static batching costs extra CPU memory, and Unity says to use it when you want static meshes culled individually; only manually combined meshes lose individual culling. https://docs.unity3d.com/6000.0/Documentation/Manual/combining-meshes.html and https://docs.unity3d.com/6000.0/Documentation/Manual/static-batching-enable.html (fact-check read). TECH row, trade[0] and facts[3] changed.
- WRONG: Unity pitfall "one instanced draw" for 1,000 instances. Now: one instanced draw is capped at 1,023 instances, 511 by default (two matrices per instance), `assumeuniformscaling` raises it. Snippet cut to 500 instances (fits one draw) and to 15 lines. https://docs.unity3d.com/6000.0/ScriptReference/Graphics.RenderMeshInstanced.html (fact-check read).
- Pitfall scoped: SRP Batcher precedence applies to GameObjects with Mesh Renderers; a direct RenderMeshInstanced call uses instancing explicitly. Source: the fact-check's reading of the same pages; teaching-issue 4.
- WRONG: Godot "occluders cut overdraw 10x or 100x". Now: a naive renderer in a town may try to render 10 or 100 times more than is visible; the depth pre-pass already limits hidden-pixel shading, so occlusion mainly saves draws, vertices and shadow work. https://docs.godotengine.org/en/stable/tutorials/performance/optimizing_3d_performance.html (fact-check read).
- UNSUPPORTED "GPU figure includes idle time": replaced by "GPU time is synced to the frame, so it is often close to Frame time". https://dev.epicgames.com/documentation/en-us/unreal-engine/stat-commands-in-unreal-engine (fact-check read). what and interview junior q1 changed.
- UNSUPPORTED "Unreal's documentation makes the same point" about 50 percent screen percentage: attribution dropped, kept as arithmetic (0.5 x 0.5 = 0.25).
- UNSUPPORTED Visual Profiler hard-coded 16.67 ms: cut from facts[7]; facts source changed to https://docs.godotengine.org/en/stable/tutorials/scripting/debug/debugger_panel.html (CPU left, GPU right). Unreal dynamic resolution fact URL given its en-us form.
- UNSUPPORTED PIX on Xbox: now "Windows (Xbox PIX ships with the GDK; not confirmed on a public page)". https://devblogs.microsoft.com/pix/documentation/
- UNSUPPORTED Arm translucent split: attribution removed, kept as "a common practice" (judgement; Arm pages were unreadable).
- Wrong source, AMD occupancy: now cites https://gpuopen.com/learn/occupancy-explained/ (per fact-check; I did not open it myself).
- MaterialPropertyBlock wording: "any MaterialPropertyBlock" makes a GameObject SRP Batcher incompatible. https://docs.unity3d.com/6000.0/Documentation/Manual/SRPBatcher-Materials.html (fact-check read).
- Frame Debugger: "Batch cause" explains SRP Batcher breaks only. https://docs.unity3d.com/6000.0/Documentation/Manual/frame-debugger-window-event-information.html (fact-check read).
- Dynamic batching not supported in HDRP: added to TECH, mid interview and facts. https://docs.unity3d.com/6000.0/Documentation/Manual/DrawCallBatching.html (fact-check read).
- Microsoft CSM wording changed to the page's own case (high dynamic range in depth), with the low-camera case as a paraphrase. https://learn.microsoft.com/en-us/windows/win32/dxtecharts/cascaded-shadow-maps
- Alpha test caveat added where the trick is given (trade, how, TECH, mid interview). New source, read this session through a fetch tool that returns a model summary: NVIDIA GPU Gems chapter 28, "Graphics Pipeline Performance" (2004, so dated): early-z works best front to back or with a depth-only pass, alpha test and discard can interfere with early-z in shading passes; also the method of finding the bottleneck by varying resolution and shader cost. https://developer.nvidia.com/gpugems/gpugems/part-v-performance-and-practicalities/chapter-28-graphics-pipeline-performance. The tile-based mobile GPU claim (discard can defeat hidden-surface removal) is labelled judgement in the text; Apple's tile-based GPU page https://developer.apple.com/documentation/metal/tailor-your-apps-for-apple-gpus-and-tile-based-deferred-rendering returned only its title, so it is not confirmed.
- Xcode Metal tools: still unverified. The Apple capture page https://developer.apple.com/documentation/xcode/capturing-a-metal-workload-programmatically returned only its title. The text says "named from practice".
- Not done: an NVIDIA source for GPU-driven rendering or indirect draws was not found (the NVIDIA Vulkan do's and don'ts page does not cover it).
