# Sources: craft-cpu-cache-and-data-layout

"read" = page fetched on 2026-10-05 through a summarising fetch tool (exact wording not verified). "summary only" = from a search-result summary, page not read. "not verified" = stated from general knowledge, no source read.

## Cited claims

- Cache line is 64 bytes; early caches used 32; access cost on a Pentium M: register at most 1 cycle, L1d about 3, L2 about 14, main memory about 240. https://lwn.net/Articles/252125/ (Drepper, "What every programmer should know about memory", part 2, "CPU caches"; read)
- MESI protocol; a write to a line held by another processor needs a Request For Ownership (basis of the false-sharing explanation). Same page (read)
- Hundreds of cycles to fetch a byte from RAM; hot and cold splitting (AI component keeping loot data apart); keep live particles at the front of the array by swapping, so the loop has no branch; the author reports a 50x difference in one comparison (not quoted in the topic). https://gameprogrammingpatterns.com/data-locality.html (read)
- Spatial partition: all pairs is O(n squared); options grid, quadtree/octree, BSP and k-d tree, bounding volume hierarchy; a grid costs memory and an update when objects move. https://gameprogrammingpatterns.com/spatial-partition.html (read)
- Mike Acton, "Data-Oriented Design and C++", CppCon 2014: code transforms data, design from the data and hardware. https://www.youtube.com/watch?v=rX0ItVEVjHc (page text not retrievable; claim is the same one the existing craft-performance topic already carries; not verified here)
- Unity ECS archetype chunks are 16 KiB; each component type stored as its own array in the chunk; the dense layout helps cache efficiency. https://docs.unity3d.com/Packages/com.unity.entities@1.3/manual/concepts-archetypes.html (read)
- Burst compiles High-Performance C# (a subset) with LLVM; designed for the job system; supports SIMD intrinsics. https://docs.unity3d.com/Packages/com.unity.burst@1.8/manual/index.html (read)
- Branches in a loop can stop auto vectorisation; [NoAlias]; Loop.ExpectVectorized needs UNITY_BURST_EXPERIMENTAL_LOOP_INTRINSICS and errors if not vectorised. https://docs.unity3d.com/Packages/com.unity.burst@1.8/manual/optimization-loop-vectorization.html (read)
- Burst Inspector: addps/mulps style instructions are vectorised, addss/mulss scalar. https://docs.unity3d.com/Packages/com.unity.burst@1.6/manual/docs/OptimizationGuidelines.html (summary only, from search result)
- Unity job system: worker threads match CPU core count; jobs receive copies of data, blittable types only; work stealing; pairs with Burst. https://docs.unity3d.com/6000.0/Documentation/Manual/job-system-overview.html (read)
- IJobParallelFor Schedule(jobData, arrayLength, innerloopBatchCount, dependsOn); batch count is the number of iterations stolen at a time (example 32). https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Unity.Jobs.IJobParallelForExtensions.Schedule.html (read). The two-argument call in the snippet relies on dependsOn having a default value: not verified against the page.
- Unity ObjectPool<T>: constructor delegates, collectionCheck, defaultCapacity, maxSize; stack storage so objects are not contiguous; not safe from background threads. https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Pool.ObjectPool_1.html (read). The page's parameter names are quoted from the summary as actionOnTake/actionOnReturn; the FACTS line uses actionOnGet/actionOnRelease, the names in the Unity API; recheck.
- Unity Profile Analyzer compares two sets of frames and aggregates marker data. https://docs.unity3d.com/Packages/com.unity.performance.profile-analyzer@1.2/manual/index.html (read)
- Godot WorkerThreadPool: add_task, add_group_task(action, elements, tasks_needed = -1, high_priority = false, description = ""), wait_for_group_task_completion; tasks must be awaited; pool can hurt performance if tasks are not computationally expensive. https://docs.godotengine.org/en/stable/classes/class_workerthreadpool.html (read). That the group action receives the element index as its first argument is not verified against the page.
- Godot thread-safe APIs: scene tree not thread-safe; servers mostly are; containers need a mutex when resized. https://docs.godotengine.org/en/stable/tutorials/performance/thread_safe_apis.html (read)
- Godot debugger Profiler: self and inclusive modes, does not currently support C#; manual timing with Time.get_ticks_usec(). https://docs.godotengine.org/en/stable/tutorials/scripting/debug/the_profiler.html (read)
- Unreal Tasks System: UE::Tasks::Launch, priorities, prerequisites, nested tasks, pipes; shares backend scheduler and worker threads with TaskGraph. https://dev.epicgames.com/documentation/en-us/unreal-engine/tasks-systems-in-unreal-engine (read)
- Unreal Insights: trace events, .utrace files, -trace=cpu. https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-insights-in-unreal-engine (read)
- Tracy: nanosecond resolution hybrid frame and sampling profiler; CPU, GPU, memory, locks. https://github.com/wolfpld/tracy (read)
- Superluminal: CPU profiler for Windows, Linux, PlayStation, Xbox; supports Unreal, Unity, Godot. https://superluminal.eu/ (read)
- C++17 hardware_destructive_interference_size defined to avoid false sharing; typically 64 on x86-64. https://en.cppreference.com/w/cpp/thread/hardware_destructive_interference_size (read; the benchmark timings on that page were not used)

## Claims with weaker support

- L2 about 12 to 15 cycles, L3 about 40 to 50 cycles, Zen 4 L2 14 and L3 50 cycles, single-core idle DRAM latency about 83 ns on a Ryzen 9 7950X3D. Chips and Cheese via search-result summary only; the underlying article was not read. https://chipsandcheese.com/ (summary only) and https://www.guru3d.com/news-story/amd-zen-4-die-cache-sizeslatencies-and-transistor-counts-detailed.html (summary only). The topic phrases these as orders of magnitude and tells the reader to measure.
- Branch misprediction penalty about 15 to 20 cycles on recent x86 (Skylake 16 to 17, Zen about 18 to 19). Agner Fog, https://www.agner.org/optimize/microarchitecture.pdf (summary only; the PDF could not be parsed by the fetch tool).
- Cortex-A78 L1D line 64 bytes, 4-cycle load-to-use. Wikipedia/WikiChip summary via search only; not cited in the topic text beyond "64 bytes on many Arm cores". https://en.wikichip.org/wiki/arm_holdings/microarchitectures/cortex-a78 (summary only)
- Unity optimisation e-book "Optimize your game performance for mobile, XR, and the web in Unity (Unity 6 edition)" exists (Oct 2024). Not cited in the topic. https://unity.com/resources/mobile-xr-web-game-performance-optimization-unity-6 (summary only)

## Worked arithmetic (ours, illustrative)

- 5,000 enemies x 128 B = 640,000 B; 640,000 / 64 = 10,000 lines spanned; reading 12 B per enemy touches 5,000 to 10,000 lines depending on field placement; SoA 5,000 x 12 B = 60,000 B, 60,000 / 64 = about 938 lines.
- n(n-1)/2: n = 2,000 gives 1,999,000; n = 3,000 gives about 4.5 million; n = 10,000 gives about 50 million.
- Slicing: 1,000 agents x 0.05 ms = 50 ms; 100 per frame = 5 ms; 10 frames at 60 Hz is 167 ms.

## Not verified

- "Mispredicted branch" and "hundreds of cycles" are orders of magnitude, not benchmarks run here.
- Whether Unreal has a first-class parallel-for named in the topic ("a parallel-for over chunks"); the page read covers UE::Tasks only. Recheck.
- Apple Silicon cache line size (128 B reported elsewhere) was not checked and is not claimed.

## Changes after the independent fact-check (2026-10-05)

- Drepper figures (about 3, 14 and 240 cycles): attribution changed from "Drepper measured" to "Drepper quotes Intel's figures for a Pentium M". Source: https://lwn.net/Articles/252125/ (read by the checker).
- 128-byte object, 16 bytes read: waste now stated as seven eighths of the object (112/128) and three quarters of each line (48/64). Own arithmetic. Replaced the wrong "more than nine tenths of every line".
- Worked example changed from 12 to 16 bytes to match the snippet's two float2 fields: SoA 5,000 x 16 B = 80,000 B, 80,000 / 64 = 1,250 lines; AoS 640 KB. Own arithmetic. The L2 claim was rewritten: 640 KB fits the L2 of recent desktop cores (Zen 4 1,024 KB, Golden Cove 1,280 KB), so the topic now says the gain on desktop is fewer lines and prefetch, and that the working set exceeds L1 and many phone L2s. Source for desktop L2 sizes: https://chipsandcheese.com/p/amds-zen-4-part-2-memory-subsystem-and-conclusion (via the fact-check; I did not re-read it). The "many phone cores have 256 to 512 KB L2" wording is the fact-checker's and unsourced here; the topic phrases it as "many phone cores".
- Diagram L3 changed to "about 40 to 70 cycles" and main memory to "about 70 to 100 ns idle", and the `what` text to "forty to seventy or more", on the fact-check's Chips and Cheese figures (Zen 4 L3 about 46 to 51 cycles; Golden Cove L3 slower; DRAM 73 ns). Same source as above.
- Godot pitfall: an element is one Callable call, not one task; tasks_needed (default -1) controls distribution to worker threads. Chunking helps by cutting per-call GDScript dispatch. Source: https://docs.godotengine.org/en/stable/classes/class_workerthreadpool.html (checker read). Added that immediate wait removes overlap (checker's code review; same logic as the Unity pitfall).
- Godot thread safety: rendering and physics servers need thread-safe operation enabled in project settings. https://docs.godotengine.org/en/stable/tutorials/performance/thread_safe_apis.html (checker read).
- Cache-line size in engines: Unity exposes JobsUtility.CacheLineSize ("The size of a cache line"). https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Unity.Jobs.LowLevel.Unsafe.JobsUtility.CacheLineSize.html (read). The Unreal equivalent was dropped because it could not be sourced.
- Deep Profile: Unity's manual says Deep Profiling instruments all function calls, is resource-intensive and makes the application run significantly slower. https://docs.unity3d.com/6000.0/Documentation/Manual/profiler-deep-profiling.html (read). The claim that small functions are hit hardest is labelled "our inference" in the text. Added to FACTS.
- Branch-miss counters: the topic now names hardware-counter tools (Intel VTune, AMD uProf, Linux perf) and says the engine profilers do not report branch misses. VTune microarchitecture and memory bottleneck analysis: https://www.intel.com/content/www/us/en/developer/tools/oneapi/vtune-profiler.html (read, marketing page). That uProf and perf expose branch-miss counters and that the engine profilers lack them is the fact-checker's finding; not independently re-read.
- Profilers by name added to how[0]: Unity Profiler, Profile Analyzer (https://docs.unity3d.com/Packages/com.unity.performance.profile-analyzer@1.2/manual/index.html), Unreal Insights, Godot Profiler, Superluminal (https://superluminal.eu/), Tracy (https://github.com/wolfpld/tracy). Sources listed above, already read.
- SIMD sentence added (one instruction on 4, 8 or 16 values; needs contiguous same-type data). General knowledge, labelled by the Burst SIMD sources already listed; no new source.
- Acton talk: wording changed to "as commonly summarised"; title and year confirmed by the checker from the video page, content still unverified.
- Mispredict cost 15 to 20 cycles: now confirmed by the checker against Agner Fog's PDF (16, max 20 Intel; about 18 Zen 1 to 3; 15 to 18 Zen 4; 15 to 25 Zen 5). https://www.agner.org/optimize/microarchitecture.pdf
- Unity snippet: added a comment on allocating and disposing the NativeArrays; removed a blank line to stay within 15 lines.
- Senior interview question: the duplicate "work is too small" reason replaced by "job reads managed data or does a lookup per element" (judgement, no source). Grammar fix "an Update method".
- Earlier "not verified" notes now resolved by the checker: two-argument Schedule appears in Unity 6 examples; the Godot group action receives the element index first; Unreal ParallelFor exists in the Core API reference (https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/Core/ParallelFor, not re-read by me); ObjectPool constructor names are actionOnGet/actionOnRelease.
