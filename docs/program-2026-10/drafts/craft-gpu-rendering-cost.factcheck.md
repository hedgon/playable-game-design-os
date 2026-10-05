# Fact-check: craft-gpu-rendering-cost

Checked 2026-10-05 against the raw pages (curl, HTML stripped to text), not summaries.
Draft and claim list read in full. The draft was not edited.

## Verdict: PASS WITH FIXES

WRONG 3, UNSUPPORTED 5, OUTDATED 0. All the fixes are wording changes; none needs a structural rewrite.

The most serious issue is that the draft states, as a Unity fact, that static batching loses per-object culling. Unity's manual says the opposite. It names static batching as the method to use when you want combined static meshes culled individually.

## Validation

- `PLAYABLE_DRAFTS=<this draft> node src/validate.js` gives one error: `rel -> unknown craft-cpu-cache-and-data-layout`. That target is a sibling draft.
- With `craft-cpu-cache-and-data-layout.js` loaded too, this draft has no errors. The run still prints errors from the sibling's own rel (`server-world-partitioning`), and loading that draft as well prints errors from its rels. None of these errors belong to this draft.
- This draft gets two warnings, both expected: `WARN topics with no inbound links: craft-gpu-rendering-cost` and `DRAFT not in any learning path`.
- Repeats a sibling? No. `craft-cpu-cache-and-data-layout` teaches cache lines, data layout and threads. This draft only points to it for the culling loop.
- There is some overlap with the existing `craft-performance` topic, which already teaches the CPU-or-GPU-bound check and the "lower the resolution" test. This draft goes deeper on both and says so in its rel. Acceptable, but the coordinator may want to trim the first `how` step.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
|---|---|---|---|---|
| stat unit shows Frame, Game, Draw, GPU, RHIT, DynRes; frame ≈ thread time means that thread is the bottleneck | what, facts[0], how[0] | CONFIRMED | | https://dev.epicgames.com/documentation/en-us/unreal-engine/stat-commands-in-unreal-engine |
| "the GPU figure includes idle time, so it only counts when it is the longest on its own" (also interview junior q1) | what, interview | UNSUPPORTED | The current page says only that GPU time "is synced to the frame" and "will likely be similar to Frame time". The idle-time sentence was not found on the stat-commands page or the UE5 profiling pages. Either cite a page that says it, or rephrase as "GPU time tracks the frame, so it is often close to Frame time even when the GPU is not the bottleneck". | same page |
| stat GPU exists | how[2], ENGINE note | CONFIRMED | "GPU: Displays GPU statistics for the frame". profilegpu was not found on the fetched pages; it is a long-standing command (set aside). | same page |
| Dynamic resolution scales primary screen percentage from previous frames' GPU workload; Min 50, Max 100, FrameTimeBudget 33.3 ms; consoles plus PC DX12/Vulkan | how[9], facts[1], interview | CONFIRMED | The page lists Xbox One/Series, PS4/PS5, Switch and PC DX12/Vulkan. | https://dev.epicgames.com/documentation/en-us/unreal-engine/dynamic-resolution-in-unreal-engine |
| "Unreal's documentation makes the same point: 50 percent screen percentage means a quarter of the pixels" | why[2] | UNSUPPORTED | The arithmetic is correct (0.5² = 0.25). The attribution was not found on the dynamic-resolution page or the screen-percentage page. Drop the attribution, or keep it as plain arithmetic. | dynamic resolution page; https://dev.epicgames.com/documentation/en-us/unreal-engine/screen-percentage-with-temporal-upscale-in-unreal-engine |
| SRP Batcher reduces render-state changes, not draw count; URP, HDRP, custom SRP, not Built-in | facts[2], TECH row 1 | CONFIRMED | | https://docs.unity3d.com/6000.0/Documentation/Manual/SRPBatcher.html |
| MaterialPropertyBlock breaks SRP Batcher compatibility ("some MaterialPropertyBlock use") | TECH row 1, traps | CONFIRMED, wording too soft | The manual says the GameObject "mustn't use MaterialPropertyBlocks" at all. Change "some MaterialPropertyBlock use" to "any MaterialPropertyBlock". | https://docs.unity3d.com/6000.0/Documentation/Manual/SRPBatcher-Materials.html |
| Dynamic batching: 300 vertices / 900 attributes, "no longer recommended" because CPU overhead may exceed a draw call; recommended only on low-end | trade[1], facts[3], TECH | CONFIRMED | The manual also says dynamic batching is not supported in HDRP. Worth adding. | https://docs.unity3d.com/6000.0/Documentation/Manual/DrawCallBatching.html |
| Static batch buffer holds up to 64,000 vertices | trade[0], facts[3] | CONFIRMED | | same page |
| Static batching costs "the loss of per-object culling inside the batch" | trade[0], TECH "Static and dynamic batching" cost | WRONG | Unity's manual: manually combined meshes can't be culled individually; "If the meshes are static and you want Unity to individually cull them, use static batching." Static batching costs extra CPU memory for the combined meshes, not culling. Move the culling loss to manual mesh combining. | https://docs.unity3d.com/6000.0/Documentation/Manual/combining-meshes.html ; https://docs.unity3d.com/6000.0/Documentation/Manual/static-batching-enable.html |
| GPU instancing: one draw for many objects sharing mesh and material; no Skinned Mesh Renderers; URP/HDRP custom shaders need SRP Batcher off or the shader incompatible | trade[2], facts[4], TECH, ENGINE pitfall | CONFIRMED | | https://docs.unity3d.com/6000.0/Documentation/Manual/GPUInstancing.html |
| Frame Debugger shows why each batch broke | how[3], trap, TECH, ENGINE | CONFIRMED with a limit | The manual's "Batch cause" field gives the reason the **SRP Batcher** could not batch an event, and "is only relevant if your application uses the SRP Batcher". Say so. | https://docs.unity3d.com/6000.0/Documentation/Manual/frame-debugger-window-event-information.html |
| Unity pitfall: "check that it shows one instanced draw with the expected instance count" (snippet draws 1,000) | ENGINE unity.pitfall | WRONG | The RenderMeshInstanced reference says the maximum per draw is 1023 instances, and 511 by default because each instance carries objectToWorld and worldToObject. 1,000 instances is more than 511, so expect at least two instanced draws unless the shader uses `#pragma instancing_options assumeuniformscaling`. | https://docs.unity3d.com/6000.0/ScriptReference/Graphics.RenderMeshInstanced.html |
| RenderMeshIndirect takes arguments from a GraphicsBuffer and only works where compute shaders are supported | how[4], facts[5], TECH | CONFIRMED | | https://docs.unity3d.com/6000.0/ScriptReference/Graphics.RenderMeshIndirect.html |
| ASTC on iOS and on Android with GLES 3.1/Vulkan, 8 bpp (4×4) to 0.89 bpp (12×12); DXT1 4 bpp, BC7/DXT5 8 bpp; ETC2 the older Android fallback | how[11], facts[9], TECH, interview | CONFIRMED | The manual says ASTC on Apple A8 (2014) and later. | https://docs.unity3d.com/6000.0/Documentation/Manual/texture-choose-format-by-platform.html |
| ASTC block is always 128 bits | how[11], TECH | CONFIRMED (derived) | 8 bpp × 16 texels = 128 and 0.89 × 144 ≈ 128, from Unity's own figures. The Khronos specification was not opened. | Unity page above |
| MultiMesh: thousands in one call; no per-instance screen or frustum culling, all or nothing | trade[2], how[3], facts[6], ENGINE | CONFIRMED | The manual says "up to millions of objects in one go". | https://docs.godotengine.org/en/stable/tutorials/performance/using_multimesh.html |
| MultiMesh API: instance_count (clears and resizes buffers; format set afterwards has no effect), visible_instance_count (-1 = all), transform_format (default 0 = TRANSFORM_2D), set_instance_transform(int, Transform3D) | ENGINE godot | CONFIRMED | | https://docs.godotengine.org/en/stable/classes/class_multimesh.html |
| Godot automatic instancing in Forward+ only | ENGINE godot.term | CONFIRMED | Only for opaque or alpha-tested materials. | https://docs.godotengine.org/en/stable/tutorials/performance/optimizing_3d_performance.html |
| "Godot's documentation says occluders can cut overdraw by 10 times or 100 times in the right scene" | how[5] | WRONG | Godot says a naive renderer can end up "attempting to render 10× or 100× more than what is visible". It then says the depth prepass already keeps the GPU from fully shading hidden pixels. Occlusion culling saves the draws and vertices of hidden objects, not mainly overdraw. Reword: "Godot's docs note a naive renderer in a town can try to render 10 or 100 times more than is visible". | same optimising page |
| Godot advises baked lighting, especially for mobile | trade[4], TECH | CONFIRMED | | same page |
| Alpha scissor is faster than blending; order-independent transparency is costly and not provided | trade[3], TECH | CONFIRMED | | https://docs.godotengine.org/en/stable/tutorials/3d/3d_rendering_limitations.html |
| Visual Profiler: rendering CPU time on the left, GPU on the right, by category; CPU side covers rendering only | how[0], ENGINE, facts[7] | CONFIRMED | facts[7] cites the wrong page. The Visual Profiler is documented on debugger_panel.html, not the_profiler.html. | https://docs.godotengine.org/en/stable/tutorials/scripting/debug/debugger_panel.html |
| Visual Profiler percentage view uses a target frame time hard-coded to 16.67 ms | facts[7] | UNSUPPORTED | Not on debugger_panel.html or the_profiler.html. The latter mentions only 16.66 ms as the default frame time of the general profiler. Cut it, or cite the engine source. | both pages |
| Monitors tab shows draw calls | ENGINE godot.term | CONFIRMED | RENDER_TOTAL_DRAW_CALLS_IN_FRAME | https://docs.godotengine.org/en/stable/classes/class_performance.html |
| scaling_3d_scale < 1.0 renders lower; modes bilinear, FSR 1.0, FSR 2.2, MetalFX spatial/temporal; AMD presets 0.77, 0.67, 0.59, 0.5 | how[9], facts[8], TECH | CONFIRMED | | https://docs.godotengine.org/en/stable/classes/class_viewport.html |
| RenderDoc: Vulkan, D3D11, D3D12, OpenGL, OpenGL ES on Windows, Linux, Android, Nintendo Switch | how[2], facts[10] | CONFIRMED | | https://renderdoc.org/docs/index.html |
| PIX for D3D12 "on Windows and Xbox" | how[2] | UNSUPPORTED | The fetched PIX pages cover PIX on Windows only, and the GDK PIX page returned 404. Xbox PIX ships with the GDK, but no public page was confirmed. Cite one or say "Windows (and Xbox through the GDK)". | https://devblogs.microsoft.com/pix/documentation/ |
| CSM: a shadow map per subfrustum; per-frame split recalculation shimmers, so use static intervals per scenario; overhead views need fewer cascades | how[10], TECH | CONFIRMED | The page states the opposite case as geometry with a high dynamic range in Z. "A camera low to the ground with far views" is a fair paraphrase of that. | https://learn.microsoft.com/en-us/windows/win32/dxtecharts/cascaded-shadow-maps |
| "AMD's guide notes fewer vector registers let more waves run at once, hiding memory latency" | how[7] | CONFIRMED, wrong source | The RDNA performance guide only says FP16 and intrinsics reduce VGPR pressure. The latency-hiding explanation is in AMD's "Occupancy explained". Cite that. | https://gpuopen.com/learn/occupancy-explained/ |
| Arm: split a translucent mesh into an opaque core drawn front to back and a small translucent edge drawn back to front | how[6] | UNSUPPORTED | developer.arm.com returned access denied or empty pages to curl, and the writer had only a search summary. Cite a readable Arm page, or drop the attribution and keep the advice as general practice. | Arm pages (blocked) |

### Arithmetic (all recomputed)

- 1,920 × 1,080 = 2,073,600. × 60 = 124,416,000, so "about 124 million" is right. × 3 = 373,248,000, so "about 373 million" is right.
- 0.67² = 0.4489, so "about 45 percent" is right.
- 2,048² × 4 B = 16,777,216 B = 16 MiB. × 4/3 = 21.33 MiB, so "about 21.3 MiB" is right. "A third more" for mips is right.
- ASTC 4×4 at 8 bpp: 2,048² × 1 B = 4 MiB, so "a factor of four" is right.
- ASTC bpp = 128 / texels: 8 (4×4), 3.56 (6×6, "about 3.6"), 2 (8×8), 0.889 (12×12). All right.
- 3 / 16.7 = 17.96 %, so "18 percent" is right.
- Unity snippet grid: 1,000 instances at 40 per row gives 25 rows. Godot: 10,000 instances at 100 per row gives a 100 × 100 grid. Both consistent.

## Code issues

Neither snippet was compiled: Unity and Godot are not installed here. I read both line by line against the API references. There is no Go snippet.

- **Unity (C#, Unity 6)**
  - Compiles in my reading. `Graphics.RenderMeshInstanced<T>(in RenderParams, Mesh, int, T[], int = -1, int = 0) where T : unmanaged` takes `in`, not `ref`. The doc page renders it as "ref", but UnityCsReference `Runtime/Export/Graphics/Graphics.cs` shows `in`. So passing `new RenderParams(material)` is legal. `RenderParams(Material)` and `Matrix4x4.TRS` are confirmed.
  - Runtime: the call throws InvalidOperationException unless `material.enableInstancing` is true. The comment covers this.
  - Runtime: 1,000 instances is more than the documented default of 511 per draw (see WRONG above). Either fix the pitfall's "one instanced draw", or use 500 instances.
  - The snippet is 16 lines. topic-common.md says 15 or fewer; the validator does not check line count. Remove one blank line.
- **Godot (GDScript, Godot 4)**: all APIs confirmed (MultiMeshInstance3D.multimesh, MultiMesh.TRANSFORM_3D, mesh, instance_count, set_instance_transform, visible_instance_count, BoxMesh, Transform3D(Basis, Vector3), floorf). The order is correct: format before count.
- APIs I could not confirm on a page: Unreal `profilegpu` (not on the fetched pages; widely documented elsewhere).

## Teaching issues

1. **Static batching and culling** (WRONG above). The trade-off is taught backwards for Unity, in trade[0] and in the TECH row.
2. **Occlusion and overdraw** (how[5]). Godot's own page says the depth prepass already handles most hidden-pixel shading. Teaching occlusion as an overdraw cut sends readers to the wrong lever. Its gain is draws, vertices and shadow work.
3. **"Alpha test is cheaper"** (trade[3], how[6], interview mid q2). The advice is unconditional where it is given. The TECH row notes that alpha test can disable early depth rejection, but the trade and how lines do not. On tile-based mobile GPUs, especially Apple and PowerVR hidden-surface removal, discard in a fragment shader can cost more than blending. Add "measure on the device; on tile-based GPUs discard can defeat hidden-surface removal" where the trick is given.
4. **ENGINE unity.pitfall, SRP Batcher precedence.** The precedence rule applies to GameObjects with Mesh Renderers. A direct `Graphics.RenderMeshInstanced` call uses instancing explicitly. Next to this snippet the sentence may read as "your RenderMeshInstanced call will be taken over". Scope it to GameObjects.
5. **Frame Debugger "why the batch broke".** Say that "Batch cause" explains SRP Batcher breaks.

## Missing coverage (against the brief)

All items on the Must-cover list are present. Thin spots:
- The brief names **NVIDIA** among the sources, and no NVIDIA source is cited. One NVIDIA source would round out the vendor set, for example its guidance on early-Z and alpha test, or on GPU-driven rendering for the indirect-draw row.
- **Xcode GPU tools** are named only. The writer could not verify them. A one-line source (Apple's Metal debugger docs) would do.
- Dynamic batching is not supported in HDRP. This is a one-word addition to the batching row.

## Style

- No hype words. No US spellings found (rasterise, optimisation, colour and artefacts are UK). No owner employer, colleague or internal project named.
- The only style breach is the 16-line Unity snippet.

## Set aside

- "The two run in parallel on different frames, so the slower one sets the frame time": standard pipelining description, not a sourced claim.
- "Arithmetic is cheap relative to fetches and bandwidth": general GPU knowledge. It is framed as "often", which is fair.
- "Draw opaque front to back so early depth rejection works": correct for immediate-mode GPUs. On Apple and PowerVR HSR it matters less. Not wrong as worded ("engines sort for you").
- "LOD by screen size, not distance": engine practice (Unity LOD Group and Unreal both use screen size). Not attributed to anyone.
- Impostors, HLOD, depth pyramid culling and shader variant prewarming are named as practice, not attributed. Godot's page lists "Visibility ranges (HLOD)".
- profilegpu: a real Unreal console command, absent from the fetched pages. It is not a fact the topic depends on.
- PIX on Xbox is true in practice (GDK). It is marked UNSUPPORTED only because no public page was confirmed in this session.
- The EXPLAINER and DIAGRAM pass order (shadows, optional depth pre-pass, opaque, alpha test, transparent, post, UI) is a generic forward-renderer order and fine as a teaching model.
- Validator errors from the chained drafts' rels (`server-world-partitioning`, `server-bandwidth-and-interest-management`, `server-transport-and-relays`) belong to those drafts, not this one.
