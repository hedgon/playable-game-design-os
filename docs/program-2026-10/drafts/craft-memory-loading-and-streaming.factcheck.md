# Fact-check: craft-memory-loading-and-streaming

Checked 2026-10-05 against the raw primary pages (curl, text extracted locally), not through a summariser, except where noted.

## Verdict: PASS WITH FIXES

WRONG 1, UNSUPPORTED 1, OUTDATED 1. Most serious: the App Store `__TEXT` limit in `facts[8]` is wrong. For iOS 9 and later the limit is 500 MB, not 80 MB. The 80 MB figure applies only to apps targeting versions earlier than iOS 7.0.

## Validation

- `PLAYABLE_DRAFTS=<this draft> node src/validate.js`: 3 errors. The rel links to `craft-gpu-rendering-cost`, `craft-mobile-gpu-and-thermals` and `craft-cpu-cache-and-data-layout` are unknown, because those topics exist only as sibling drafts.
- With the three sibling drafts also loaded in PLAYABLE_DRAFTS: no errors for this draft. The only error left belongs to a sibling: `craft-cpu-cache-and-data-layout: rel -> unknown server-world-partitioning`. Warnings for this draft: no inbound links, and it is not in any learning path. Both are expected for a new topic.
- Every other rel target exists in `src/`: craft-memory-and-gc, craft-performance, infra-cdn-assets, release-and-updates, vertical-slice-mvp, level-structure.
- Repetition of siblings: there is no material overlap. The one shared fact is ASTC 6x6 at "under 2 MiB" in `craft-mobile-gpu-and-thermals`, and it agrees with this draft's 1.8 MiB. No sibling covers PSO caching, backgroundLoadingPriority, Addressables, DirectStorage or ResourceLoader.

## Claims

| Claim (short) | Location | Verdict | Correct value | Source |
|---|---|---|---|---|
| os_proc_available_memory = memory left before the system terminates the app | why[0], how[0] | CONFIRMED (claim list R; not re-fetched, the doc is a JS app) | | developer.apple.com/documentation/os/os_proc_available_memory |
| 2048x2048 RGBA8 = 16 MiB; with mips about 21 MiB | why[1], interview junior[0] | CONFIRMED (arithmetic) | 4 x 4,194,304 = 16,777,216 B = 16 MiB; x 4/3 = 21.33 MiB | own arithmetic |
| Mipmaps add 33 % on disk and in memory; Mipmap Streaming | why[1], facts[9] | CONFIRMED | manual: "increase the size of a texture by 33%, both on disk and in memory" | docs.unity3d.com/6000.0/.../texture-mipmaps-introduction.html |
| ASTC 6x6 is about 1.8 MiB before mips | why[1], junior[0] | CONFIRMED (arithmetic) | ASTC block = 128 bits (16 B); ceil(2048/6) = 342; 342^2 = 116,964 blocks x 16 B = 1,871,424 B = 1.78 MiB; 128/36 = 3.56 bpp | ASTC fixed 128-bit block (Khronos Data Format spec); own arithmetic |
| "a factor of nine" | why[1] | CONFIRMED | 16 / 1.785 = 8.96 | own arithmetic |
| 48 kHz 16-bit stereo = 192 KB/s; ten minutes about 115 MB | how[3], TECH[2] | CONFIRMED | 48,000 x 2 x 2 = 192,000 B/s; x 600 = 115.2 MB (decimal) | own arithmetic |
| PSO on demand can take 100 ms or more | why[3], facts[4] | CONFIRMED | "can take 100 or more milliseconds" | dev.epicgames.com/.../optimizing-rendering-with-pso-caches-in-unreal-engine (5.8 page) |
| 100 ms = six frames at 60 fps | why[3] | CONFIRMED | 100 / 16.67 = 6.0 | own arithmetic |
| Ray tracing PSOs not cached in UE 5.0 | facts[4] | CONFIRMED | "UE 5.0 does not support PSO caching for ray tracing data" | same Epic page |
| backgroundLoadingPriority Low 2 / BelowNormal 4 / Normal 10 / High 50 ms; default BelowNormal; player only | how[5], facts[0], Unity snippet comment | CONFIRMED | UWP overrides to High, consoles to Normal; "no effect in the Editor" | docs.unity3d.com/6000.0/ScriptReference/Application-backgroundLoadingPriority.html |
| Addressables counts references per asset and per bundle; the bundle unloads at zero; you cannot unload part of a bundle | how[6], traps[4], facts[1], interview mid[2] | CONFIRMED | | docs.unity3d.com/Packages/com.unity.addressables@2.3/manual/MemoryManagement.html |
| Releasing the last item and then reloading from the same bundle unloads and reloads it ("asset churn") | traps[3], Unity pitfall | CONFIRMED | | same page, "Avoid asset churn" |
| LZMA smallest and decompressed whole; LZ4 near-uncompressed load with chunks; cache converts LZMA to LZ4 | how[7], TECH[5] | CONFIRMED | LZ4 chunks are 128 KB; recompression happens with UnityWebRequestAssetBundle caching | docs.unity3d.com/6000.0/.../assetbundles-compression-format.html |
| GraphicsStateCollection: development builds only, experimental, trace per graphics API and platform, .graphicsstate | how[8], facts[3], mid[1] | CONFIRMED | | docs.unity3d.com/6000.0/.../shader-pso-trace.html |
| Godot 4.4+ ubershaders and load-time precompilation, Forward+ and Mobile only, not Compatibility | how[8], facts[2] | CONFIRMED | the page also says 2D (canvas) pipelines are not precompiled | docs.godotengine.org/en/stable/tutorials/performance/pipeline_compilations.html |
| Godot: keep spawned effects in the scene once during load so their pipelines are found | how[8], mid[1] | CONFIRMED | "Pipeline precompilation instancing" section | same page |
| Godot Debugger Monitors show pipeline compilation counts | Godot term | CONFIRMED | Performance.PIPELINE_COMPILATIONS_CANVAS / MESH / SURFACE / DRAW / SPECIALIZATION | docs.godotengine.org/en/stable/classes/class_performance.html |
| load_threaded_request(path, type_hint, use_sub_threads, cache_mode); progress 0 to 1; load_threaded_get blocks if not ready; use_sub_threads true is faster but can slow the main thread | Godot term, map, TECH[3] | CONFIRMED | signature `load_threaded_request(path: String, type_hint: String = "", use_sub_threads: bool = false, cache_mode: CacheMode = 1)` | docs.godotengine.org/en/stable/classes/class_resourceloader.html |
| instantiate() / add_child() of a big scene runs on the main thread and hitches | Godot pitfall | CONFIRMED (in substance) | Godot's thread-safety page says interacting with the active scene tree is not thread-safe, and that instancing nodes that render is not thread-safe by default | docs.godotengine.org/en/stable/tutorials/performance/thread_safe_apis.html |
| "Godot has no equivalent of a per-frame integration cap" | Godot map | UNSUPPORTED | no page states it either way; plausible, because resources finish on worker threads. Soften to "Godot does not expose a per-frame cap like Unity's" or drop it | none found |
| DirectStorage Xbox: 50,000 requests/s for 5 to 10 % of one core | facts[5] | CONFIRMED | page: "only use between 5% and 10% of a single CPU core" (it also says "at most 10%" elsewhere) | learn.microsoft.com/.../directstorage-overview?view=gdk-2604 |
| 2.0 GB/s minimum over 250 ms, raw | facts[5] | CONFIRMED | | same page |
| Submit all requests, do not hold back | facts[5] | CONFIRMED | "There's no benefit to holding some requests back" | same page |
| DirectStorage 1.1: GPU decompression, GDeflate, independent 64 KiB tiles; CPU threads or GPU thread groups in parallel | facts[6], senior[2] | CONFIRMED | vendor metacommands with a DirectCompute fallback, then CPU | devblogs.microsoft.com/directx/directstorage-1-1-now-available/ |
| Google Play: asset pack 1.5 GB, install-time total 4 GB, on-demand plus fast-follow 30 GB | facts[7] | CONFIRMED (live page) | base module 500 MB; the overall total is 34 GB | support.google.com/googleplay/android-developer/answer/9859372 |
| "Play warns users about large downloads" | why[4] | CONFIRMED | above 200 MB, users on mobile data see a non-blocking dialog. Suggest stating "over 200 MB on mobile data" | same page |
| App Store: max uncompressed 4 GB for iOS 9+ | facts[8] | CONFIRMED | | developer.apple.com/help/app-store-connect/reference/app-uploads/maximum-build-file-sizes/ |
| App Store: "counts at most 80 MB of executable __TEXT sections" | facts[8] | WRONG | iOS 9.0 and later: 500 MB for the total of all __TEXT sections. 80 MB applies only to apps targeting earlier than iOS 7.0; iOS 7.x to 8.x is 60 MB per slice | same page |
| "On-Demand Resources ... on iOS" as the background-pack route | how[11], TECH[9] | OUTDATED | NSBundleResourceRequest (ODR) now carries "Use Background Assets instead", with deprecatedAt 27.0. App Store Connect now documents Apple-hosted asset packs (Background Assets). Name Background Assets / Apple-hosted asset packs and call ODR legacy | developer.apple.com/documentation/foundation/nsbundleresourcerequest (JSON: deprecationSummary); App Store Connect help, "Overview of Apple-hosted asset packs" |
| Insomniac's Mike Fitzgerald: SSD and I/O get any texture or resource into memory almost instantly; freed from traditional memory budgeting | facts[10] | CONFIRMED | wording on the page matches; title "Director, Core Technology at Insomniac Games" | playstation.com/en-au/editorial/how-ps5-helped-make-ratchet-and-clank-rift-apart-possible/ |
| SSD-designed world-hopping game stutters or freezes on a hard drive (Rift Apart, senior[2]) | senior[2] | CONFIRMED (secondary) | the VGC page is behind a Cloudflare challenge and was not read. GamingBolt (27 Jul 2023), reporting Digital Foundry's test, confirms that the PC port struggles on a PS4 HDD; a search summary of the DF coverage says it stutters, then freezes in the portal sequence. Cite Digital Foundry or GamingBolt instead of VGC | gamingbolt.com/ratchet-and-clank-rift-aparts-pc-port-struggles-to-run-on-a-ps4-hdd-after-all |
| Dash triples speed, so the deadline is a third | senior[1] | CONFIRMED (arithmetic) | deadline = margin / speed | own arithmetic |
| Margin = top speed x load time x 2, consistent with "load time over half the deadline" | how[9], TECH[7] | CONFIRMED (internally consistent; the writer's own method, labelled C) | | own arithmetic |

## Code issues

Unity snippet (checked against the Addressables 2.3 API reference and the Unity 6 ScriptReference; not compiled):
- `AssetReference.InstantiateAsync(Transform parent = null, bool instantiateInWorldSpace = false)` returns `AsyncOperationHandle<GameObject>`, so the code is correct. `AssetReferenceGameObject` derives from `AssetReferenceT<GameObject>`.
- `Addressables.ReleaseInstance` has overloads for `AsyncOperationHandle`, `AsyncOperationHandle<GameObject>` and `GameObject`. The call is valid and not ambiguous.
- `ThreadPriority.Low` resolves to `UnityEngine.ThreadPriority`, because `System.Threading` is not imported. It is correct.
- No defects found. The `api` list names "Memory Profiler", which is a package, not an API. This is cosmetic.

Godot snippet (checked against the Godot stable (4.7) class reference; not executed):
- All signatures and enum names are correct: `THREAD_LOAD_IN_PROGRESS=1`, `FAILED=2`, `LOADED=3`.
- Gap: there is no `THREAD_LOAD_INVALID_RESOURCE` branch. If `load_threaded_request` fails (wrong path or type), the status stays INVALID_RESOURCE and `_process` polls silently forever. Add the branch to the FAILED arm, or check the `Error` that `load_threaded_request` returns.
- Matching on `ResourceLoader.THREAD_LOAD_*` as constant patterns is valid GDScript 2 syntax as far as I know. Not run.

No Go snippet in this draft.

## Teaching issues

1. Unreal PSO advice (how[8], mid[1], TECH[6]) describes only recording and bundling a PSO cache. Since UE 5.x, Epic's primary mechanism is **PSO precaching**: the engine compiles PSOs at load or component creation and delays drawing a proxy until its PSO is ready. Epic's precaching page (5.5 to 5.8) positions a small bundled cache as a complement for global shaders. Name precaching first and the bundled cache second (dev.epicgames.com/documentation/en-us/unreal-engine/pso-precaching-for-unreal-engine).
2. Bundle compression (TECH[5] alt, "Everything in LZMA: ... the slowest, whole-bundle load"). Unity's manual calls LZMA the preferred format for CDN-downloaded bundles, and with UnityWebRequestAssetBundle caching the bundle is recompressed to LZ4 on download. Remote LZMA therefore does not mean slow loads after the first download. The cost falls on local, uncached or custom-cached LZMA bundles. Reword to say that.
3. Godot 4.4 precompilation (how[8], facts[2]): add that 2D canvas pipelines are not precompiled. The official page states it, and 2D-heavy readers will otherwise assume they are covered.
4. "A phone or console enforces its memory limit by terminating the process" (why[0]). It is accurate for iOS and Android. On consoles the usual failure is an allocation failure the title crashes on, not an OS kill. This is acceptable for a summary sentence; optional softening.

## Missing or thin coverage (against the brief's Must cover)

- **Unreal World Partition and streaming levels**: named once in how[5] and once in TECH[3], but not explained (grid cells, streaming sources, data layers, HLOD). The writer read the page, and the claim list notes the content. Thin.
- **Patch size**: the brief asks for "download size and patch size". Download size is covered; patch size (delta patches, how bundle layout and compression affect patch size, e.g. LZMA whole-file changes against LZ4 chunks) is absent apart from a rel note. Missing.
- **What eats memory: meshes and animation** are listed but get no numbers or fixes, while textures and audio do. Thin.
- **GDC talks**: the brief lists them as a source type. None is cited, and the level-design hides (lifts, airlocks, crawl spaces) have no first-hand source. The claim list flags this itself.
- Everything else on the list is covered: budgets, compression and formats, load anatomy including PSO and shader stutter, Addressables, Godot threaded loading, DirectStorage, Rift Apart, level design for streaming.

## Style

- No hype words. The only US spelling is "optimizing", inside an Epic URL (fine). No employer, colleague or internal project names found (grep).
- British spelling is consistent (deserialise, colour).

## Set aside

- "Safety margin of at least 10 to 15 percent" (how[0]): the writer's own method, labelled C. A rule of thumb, not a factual claim.
- "Hard drive bound by reads, SSD by decompression and deserialisation" (what): general practice, partly supported by the DirectStorage CPU-cost text and the Digital Foundry finding that NVMe speeds of 3.5 and 7.1 GB/s make little difference. Not flagged.
- The level-design hides list: presented as examples, not attributed to a game. This is a coverage gap (see above), not a false claim.
- The Play Asset Delivery mode names (install-time, fast-follow, on-demand): standard and correct. Not re-fetched in detail.
- The Unreal tool names (memreport, Memory Insights, trace scopes) and Unity ProfilerMarker: real tools, no version-sensitive claim attached.
- The PS5 5.5 GB/s figure and the World Partition default cell sizes: in the claim list but not used in the draft, so not checked.
- The DirectStorage read-size (32 to 64 KiB) and queue-capacity (4x) guidance: in the claim list only. Both are confirmed on the page, but the draft text does not use them.
- The validator warnings (no inbound links, not in a learning path): integration work, not draft defects.
