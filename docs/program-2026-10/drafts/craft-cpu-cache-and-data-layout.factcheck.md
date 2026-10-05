# Fact-check: craft-cpu-cache-and-data-layout

Checked 2026-10-05 against raw primary pages fetched with curl (HTML stripped locally), not through a summariser. No Go snippet in this draft. The Unity C# and GDScript snippets were read line by line, not compiled or run (no Unity or Godot here).

## Verdict: PASS WITH FIXES

The structure, coverage and teaching hold up. Six factual errors need fixing, and all are small edits. The most serious is the Godot pitfall, which describes `add_group_task` wrongly: an element is not a task. Other errors are one misattribution, two arithmetic or hardware claims about the 5,000-enemy example, one L3 figure and one claim about engines. Two claims stay unsupported. The profiler tools the brief names are mostly missing.

Counts: WRONG 6, UNSUPPORTED 2, OUTDATED 0.

Validation: `PLAYABLE_DRAFTS=<this>,server-world-partitioning.js,server-bandwidth-and-interest-management.js,server-transport-and-relays.js node src/validate.js` exits 0 with no errors. It shows only the expected warnings: the topic has no inbound links and is in no learning path. With this draft loaded alone, the run fails on `rel -> unknown server-world-partitioning`, because that rel target is a sibling draft. The sibling `server-world-partitioning` is about server shards and zones and does not repeat this topic. This topic does overlap with the existing `craft-performance` topic on Acton and data layout, but it goes deeper, which is intended (see Set aside).

## Claims

| Claim (short) | Location | Verdict | Correct value | Source |
|---|---|---|---|---|
| "Drepper measured about 3 cycles for L1d, 14 for L2 and 240 for main memory on a Pentium M" | facts[6] | WRONG (attribution) | The figures are right (≤1 / ~3 / ~14 / ~240), but Drepper gives them as "the numbers Intel lists for a Pentium M", not his own measurements. Change "Drepper measured" to "Drepper quotes Intel's figures". | https://lwn.net/Articles/252125/ (this is "Memory part 2: CPU caches"; the sources file wrongly calls it part 3) |
| Cache lines moved from 32 to 64 bytes | what | CONFIRMED | "In early caches these lines were 32 bytes long; now the norm is 64 bytes" | LWN 252125 |
| 64-byte lines on x86-64 | what, TECH, facts | CONFIRMED | cppreference gives 64 for hardware_destructive_interference_size on x86-64 | https://en.cppreference.com/w/cpp/thread/hardware_destructive_interference_size |
| MESI, write to a line held elsewhere needs RFO (false sharing) | what, traps | CONFIRMED | MESI is section 3.3.4; Request For Ownership is on the page | LWN 252125 |
| "A 128-byte object read for 12 bytes wastes more than nine tenths of every line" | think.q[1] | WRONG (arithmetic) | Per 64-byte line, 12 bytes used wastes 52/64 = 81%. "More than nine tenths" (116/128 = 90.6%) is true of the object, not of every line. It also contradicts how[1], which says "at most 12 of every 64 bytes". Say "wastes more than nine tenths of the object, and about four fifths of each line fetched". | own arithmetic |
| 5,000 × 128 B = 640,000 B; 5,000 to 10,000 lines | how[1], EXPLAINER | CONFIRMED | 640,000 / 64 = 10,000. One line per enemy at best, two at worst (12 bytes can straddle at most one boundary) | own arithmetic |
| SoA 60,000 B, about 940 lines | how[1], EXPLAINER f4 | CONFIRMED | 60,000 / 64 = 937.5, so 938 | own arithmetic |
| "the working set drops from larger than most L2 caches to something that fits in one" | how[1], EXPLAINER f5 | WRONG | 640 KB is smaller than every recent desktop L2: Zen 4 has 1,024 KB and Golden Cove 1,280 KB (Chips and Cheese). The loop also touches only 320 to 640 KB of lines. The claim holds only for cores with 256 to 512 KB of L2, such as many phone cores. Say "larger than the L2 of many phone cores" or "larger than L1, well inside L2". | https://chipsandcheese.com/p/amds-zen-4-part-2-memory-subsystem-and-conclusion |
| n(n-1)/2: 2,000 → about 2 million; 3,000 → about 4.5 million; 10,000 → about 50 million; 50 ms at 1 ns each | how[5], interview mid[1] | CONFIRMED | 1,999,000 / 4,498,500 / 49,995,000; 49,995,000 ns = 50.0 ms | own arithmetic |
| 3,000 units, 12 fps, 70% in pair check | interview mid[1] | CONFIRMED (plausible) | 83.3 ms × 0.7 = 58 ms over 4.5 M tests is about 13 ns per test, which is consistent | own arithmetic |
| Slicing: 1,000 × 0.05 ms = 50 ms; 100 per frame = 5 ms; 10 frames at 60 Hz about 167 ms | how[6] | CONFIRMED | 166.7 ms | own arithmetic |
| 40 ms spike into eight 5 ms steps | why[4] | CONFIRMED | 8 × 5 = 40 | own arithmetic |
| L1 "about 4 cycles", L2 "about 12 to 15" | DIAGRAM, what | CONFIRMED | Zen 4: L1D 4 cycles, L2 14. Golden Cove: L1D 5, L2 15 | Chips and Cheese Zen 4 part 2 |
| L3 "About 40 to 50 cycles" for "recent desktop cores" | DIAGRAM layer 4 | WRONG (incomplete) | Zen 4 L3 is about 8 to 9 ns at 5.7 GHz, so about 46 to 51 cycles. On the same test Golden Cove's L3 is 13.72 ns against Zen 4's 9.47 ns, which is well over 50 cycles at any current boost clock. The `what` text says "forty to fifty or more" and is fine; the diagram should say "about 40 to 70 cycles". | Chips and Cheese Zen 4 part 2 |
| Main memory "about 80 to 100 ns idle"; what: "tens to a hundred or so nanoseconds" | DIAGRAM, what | CONFIRMED (approx.) | Chips and Cheese measured 73.35 ns on Zen 4 and 72.76 ns on a 3950X. "About 70 to 100 ns" would be more accurate. | Chips and Cheese Zen 4 part 2 |
| Mispredicted branch costs about 15 to 20 cycles on recent x86 | how[8] | CONFIRMED | Agner Fog: 16, max 20 (Intel); about 18 (Zen 1 to 3); 15 to 18 (Zen 4); 15 to 25 (Zen 5) | https://www.agner.org/optimize/microarchitecture.pdf (PDF parsed with pdftotext) |
| Acton CppCon 2014 talk; "the job of code is to transform data" | what | UNSUPPORTED (content) | Title and year confirmed from the YouTube page title "CppCon 2014: Mike Acton "Data-Oriented Design and C++"". The paraphrase of the talk is not confirmed, because no transcript was retrievable. Low risk: it matches the existing craft-performance wording. | https://www.youtube.com/watch?v=rX0ItVEVjHc |
| Nystrom: hot and cold splitting (loot data), particle swap, hundreds of cycles per byte | what, how[4] | CONFIRMED | "hundreds of cycles to fetch a byte"; the "Hot/cold splitting" section uses the loot example; deactivate swaps with the last active particle | https://gameprogrammingpatterns.com/data-locality.html |
| Unity ECS 16 KiB chunks, one array per component type | facts[0], ENGINE unity | CONFIRMED | "Each chunk consists of 16 KiB"; "a chunk contains an array for each component type" (plus an entity ID array) | Entities 1.3 concepts-archetypes |
| ObjectPool<T> ctor parameters; stack; not contiguous; not safe from background threads | facts[1], TECH | CONFIRMED | ctor (createFunc, actionOnGet, actionOnRelease, actionOnDestroy, collectionCheck, defaultCapacity, maxSize); "stack-like collection, so don't assume physical contiguity"; "not safe to call from background threads" | ScriptReference/Pool.ObjectPool_1.html and ObjectPool_1-ctor.html (6000.0) |
| Burst HPC# subset, LLVM; branch can stop vectorisation; Loop.ExpectVectorized behind UNITY_BURST_EXPERIMENTAL_LOOP_INTRINSICS, compile-time error | facts[2], ENGINE unity pitfall | CONFIRMED | Error BC1321. The page also says the intrinsics do not work inside if statements. | Burst 1.8 index and optimization-loop-vectorization |
| Schedule(..., 64): "64 iterations per steal"; two-argument call | ENGINE unity snippet | CONFIRMED | The innerloopBatchCount doc says "a value of 32 means the job queue steals 32 iterations". The two-argument form appears in Unity 6's own examples: `job.Schedule(position.Length, 64)` on the IJobParallelFor page | ScriptReference IJobParallelForExtensions.Schedule and Unity.Jobs.IJobParallelFor (6000.0) |
| "C++17 exposes the idea as std::hardware_destructive_interference_size; engines mostly make you pick the size yourself" | TECH "Pad or localise" cost | WRONG (second half) | Unity exposes `Unity.Jobs.LowLevel.Unsafe.JobsUtility.CacheLineSize` ("The size of a cache line"). Unreal's `PLATFORM_CACHE_LINE_SIZE` exists to my knowledge, but its page did not render here. Say "Unity exposes JobsUtility.CacheLineSize; otherwise use 64 and check the target". | ScriptReference JobsUtility.CacheLineSize (6000.0) |
| add_group_task(action, elements, tasks_needed = -1, high_priority = false, description = "") runs a Callable once per element | facts[4], ENGINE godot | CONFIRMED | Exact signature, returns int. The Callable is called with 0..elements-1 as its first argument, so `_step.bind(dt)` gives `_step(c, dt)` correctly | class_workerthreadpool (stable) |
| "Each element index is one task. Handing the pool 100,000 single-element tasks costs more than the work; the snippet makes each task a chunk of 1,024" | ENGINE godot pitfall | WRONG | The docs say "the number of threads the task is distributed to is defined by tasks_needed, where the default value -1 means it is distributed to all worker threads". An element is one Callable call, not one task. Chunking still helps, but because it cuts per-element Callable dispatch in GDScript, not task scheduling. Reword: "Each element is one call of the Callable; 100,000 calls of a tiny GDScript function cost more than the work, so the snippet makes each call handle 1,024 elements." | class_workerthreadpool (stable) |
| Every group task must be waited on; the pool can hurt when tasks are not computationally expensive | ENGINE godot pitfall, traps | CONFIRMED | Warning on add_group_task; the note at the top of the class | class_workerthreadpool |
| Scene tree not thread-safe; most servers callable from threads | facts[4], ENGINE godot term | CONFIRMED | Rendering and physics servers need thread-safe operation enabled in project settings first, which is worth a clause. Element reads and writes on GDScript containers from several threads are OK without a resize, so the snippet's disjoint writes are allowed | tutorials/performance/thread_safe_apis |
| Godot Profiler: self and inclusive; no C# support; Rider and dotTrace instead | facts[3], ENGINE godot term | CONFIRMED | "does not currently support C# scripts ... JetBrains Rider and JetBrains dotTrace with the Godot support plugin" | tutorials/scripting/debug/the_profiler |
| UE::Tasks::Launch, prerequisites, nested, pipes, same scheduler and worker threads as TaskGraph | facts[5], ENGINE note | CONFIRMED | "Tasks System and TaskGraph both use the same backend (the scheduler and worker threads)" | dev.epicgames.com tasks-systems-in-unreal-engine |
| Unreal "a parallel-for over chunks" | how[9] | CONFIRMED | A `ParallelFor` API page exists in the UE 5.8 reference (Runtime/Core) | dev.epicgames.com API/Runtime/Core/ParallelFor |
| "Trusting a Deep Profile ... Instrumentation inflates small functions" | traps[6], verify[6] | UNSUPPORTED | Standard advice, but no Unity page was opened for it. Cite the Unity Profiler "Deep Profiling" manual page. | none read |

## Missing coverage (brief "Must cover")

- **Profilers by name**: the brief asks for the Unity Profiler and Profile Analyzer, plus Superluminal, Tracy and VTune as names. None of Profile Analyzer, Superluminal, Tracy or VTune appears in the draft. The writer's sources file lists Profile Analyzer, Tracy and Superluminal as read, but the text never uses them. The Unity Profiler appears only through "Deep Profile". Unreal Insights and the Godot profiler are covered. Add one sentence to `how[0]` or ENGINE.
- **SIMD at a high level**: thin. It is named five times but never explained (one instruction on 4, 8 or 16 lanes, which needs contiguous same-type data). One sentence would do, ideally tying SoA to SIMD loads.
- Everything else on the list is covered: hierarchy with numbers, cache lines, AoS/SoA, Acton, hot and cold splitting, branch prediction, Jobs and Burst / UE Tasks / WorkerThreadPool, false sharing, slicing, grid/quadtree/BVH, dirty flags, pooling when and when not.

## Code issues

- **Unity snippet** (read, not compiled). These APIs are confirmed on the Unity 6 reference: `IJobParallelFor`, `[BurstCompile]`, `NativeArray<float2>`, `[ReadOnly]`, two-argument `Schedule`, `JobHandle.Complete()`. `pos[i] += vel[i] * dt` is valid because the NativeArray indexer has get and set. The commented call omits allocating and disposing `pos` and `vel` (Allocator.Persistent plus Dispose). That is acceptable for a sketch, but a one-line comment would stop readers leaking. `Time.deltaTime` needs `using UnityEngine;`, which is fine because it sits in a comment.
- **Godot snippet** (read, not run). `ceili(float) -> int`, `mini(int, int) -> int` and `Callable.bind(...)` are confirmed on the stable reference. `add_group_task`/`wait_for_group_task_completion` are confirmed. Bind order is right: the element index comes first, then `dt`. Writes go to disjoint ranges of a fixed-size packed array, which the thread-safety page allows. One issue: calling `wait_for_group_task_completion` immediately removes any overlap with the main thread, the same point the Unity pitfall makes. The Godot pitfall should say so too.
- **Data inconsistency**: the worked example says "12 bytes of position and velocity", but the Unity snippet's position plus velocity are two `float2` (16 bytes). 12 bytes fits only 3 floats or half precision. Use 16 bytes (80,000 B, 1,250 lines) or name the fields so that 12 is right (for example a 2D position plus a packed heading).

## Teaching issues

- The Godot pitfall teaches the wrong cost model for the pool (see the WRONG row above).
- TECH "Bucket by type", cost: "Measure with the profiler's branch-miss counter". The engine profilers the topic names have no branch-miss counter. That needs hardware counters (VTune, AMD uProf, Linux perf, Superluminal does not either). Name the tool, or this is advice the reader cannot follow.
- Interview senior[0] gives "five reasons", but "chunks too small so scheduling dominates" and "the work is too small" are the same reason. Replace one, for example with a job that reads managed data through a lookup, or with Burst disabled.
- The working-set-in-L2 framing (how[1], EXPLAINER f5) oversells the SoA gain on desktop, where 640 KB already fits in L2. The real gain there is fewer lines fetched per frame, plus prefetch.
- Godot pitfall "no task may touch nodes or the scene tree" is slightly stricter than the docs, which allow building nodes outside the active tree. It is acceptable as a safe rule.

## Style

- No hype words, no US spellings in prose. The only "optimization" is inside a Unity URL. No employer, colleague or internal-project names.
- Grammar: bad[1] "Every enemy has a Update method" should be "an Update method".

## Set aside

- The sources file calls LWN 252125 "part 3": it is "Memory part 2: CPU caches". The error is only in the sources file, not in the draft.
- Registers "under 1 cycle, a few hundred bytes": Drepper gives ≤1 cycle. The architectural register size depends on the ISA (GPRs about 128 B, vector registers 0.5 to 2 KB). This is an order-of-magnitude label, so not flagged.
- L1 "32 to 64 KB per core": true for current x86 (Zen 4 32 KB, Golden Cove 48 KB). Apple cores are larger, but the diagram says "recent desktop cores".
- Overlap with craft-performance: both cite Acton and data layout. This topic is the deeper CPU-side follow-up the brief asks for, and rel[0] says so, so it is not a repeat.
- The 1,000-float follow-up question has no answer in the draft. 4,000 / 64 = 62.5, so 63 lines aligned and up to 64 unaligned. That is fine for an interviewer prompt.
- Cortex-A78, Apple 128-byte lines and the Unity e-book are in the sources file but not claimed in the draft.
- Adjacent-line prefetch on Intel can fetch both lines of a 128-byte struct anyway. This is a nuance that does not change the example's point.
- Generic engineering advice (grid cell size about the query radius, a 3 × 3 neighbourhood, dirty-flag placement, the 1x/2x/4x scaling test) is standard and needs no source.
- The Unity `Time.deltaTime` without `using UnityEngine` sits in a comment.
