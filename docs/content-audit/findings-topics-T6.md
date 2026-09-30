# T6 audit: models, craft, careers (34 topics)

Checked 2026-09-30 against vendor pages: Anthropic pricing, prompt caching, vision, Messages API; OpenAI caching and simple-evals; MCP spec; Claude Code memory and costs docs; METR; Unity SmartMerge and DevOps; Perforce; GDC 2026; AGENTS.md. No game lens references these topic ids, so no In-real-games links exist to check. All rel targets exist. No engine snippet was found that fails for a reason other than undefined helper types.

## Verdicts
models-tokens-context | ok | facts match pricing page (low: newer Sonnet 5.5 exists)
models-attention-long-context | ok | Liu 2023 and Chroma claims correctly hedged as superseded
models-sampling | issues | solid; top_k/determinism wording not confirmed on API page
models-hallucination-sycophancy | ok | papers and GPT-5 card numbers plausible, not re-fetched
models-how-models-are-made | ok | paper claims match abstracts
models-architecture-choices | ok | image token figures match vision docs exactly
models-open-and-closed | ok | Llama 3.1 licence terms current; OSI definition cited
models-prompt-caching | ok | Anthropic and OpenAI caching numbers verified on vendor pages
models-context-engineering | ok | CLAUDE.md 200 lines, 25KB auto memory, /compact cost verified in Claude Code docs
models-agent-harnesses | issues | unsourced Sept 2026 repost claim in traps
models-what-makes-agents-capable | issues | METR doubling figure may be stale
models-tools-mcp-rag | ok | MCP 2026-07-28 claims match the spec
models-reasoning-and-scaling | ok | o1/AIME, Chinchilla, simple-evals GPQA numbers verified
models-security-and-operations | ok | no errors found
craft-ai-orchestrates-tools-compute | issues | code runs; tau-bench evidence dated
craft-core-values-that-last | issues | meta wording 'as the owner wrote them'
craft-engineer-in-the-ai-era | ok | METR and DORA figures correct
craft-verification-as-the-job | ok | Codex, EvalPlus, IOI numbers correct
craft-best-practice-now | ok | no errors found
craft-memory-and-gc | issues | snippets reference undefined Bullet/reset()
craft-performance | issues | snippet runs but warning spams every frame
craft-design-patterns | issues | Godot snippet has unguarded null target
craft-clean-code-ai-era | ok | Ousterhout/Martin and GitClear figures correct
craft-over-defensive-code | issues | snippet uses undefined Health type
craft-what-matters-now | ok | no errors found
craft-teaching-agents | ok | AGENTS.md/CLAUDE.md behaviour matches current Claude Code docs
craft-tools-that-work-with-ai | ok | no errors found
craft-source-control-for-games | ok | Perforce, Unity DevOps, UnityYAMLMerge Helpers path, LFS facts verified
careers-transferable-skills | issues | layoff tracker stops at 2024
careers-destinations | issues | two vendor claims dated
careers-repositioning | ok | Ladders and NN/g claims correct
careers-interviewing-outside-games | ok | no errors found
careers-ai-tooling-market | issues | investment cited as hiring evidence
careers-the-farmer-answered | ok | USDA figures consistent

## Findings (severity order)

id | topic.field | problem | evidence | severity | fix
---|---|---|---|---|---
T6-1 | models-what-makes-agents-capable.facts/what | METR 7-month doubling is stated as the headline trend; METR's own page now shows measurements up to May 2026 (Claude Mythos Preview) and warns >16 h is unreliable. The topic never says whether the 7-month figure still holds in Sept 2026. | https://metr.org/time-horizons/ (latest model Claude Mythos Preview, 8 May 2026); topic fact dated 2025-03 | medium | Add a dated sentence with METR's current doubling estimate, or label the 7-month figure 'as of March 2025' in the what text and link the live page.
T6-2 | models-agent-harnesses.think.traps[6] | Trap describes a September 2026 post that resold a re-edited, watermarked copy of the 2024 LangGraph course as Andrew Ng's new graph engineering course. No source is cited and a web search found no report of it, only the genuine DeepLearning.AI course page. | Topic text 'A September 2026 post sold a re-edited, watermarked copy...'; https://www.deeplearning.ai/courses/ai-agents-in-langgraph | medium | Add a fact with a source for the incident, or reword as a generic warning: 'Reposted courses are often re-edited copies; find the original page, authors and date before you cite one.'
T6-3 | craft-memory-and-gc.eng.unity.snippet, eng.godot.snippet | Snippets are not self-contained. Unity Gun uses Bullet, Bullet.ResetState() and Bullet.Launch(transform, pool), never defined, so pasted code does not compile. Godot BulletPool calls b.call('reset'), which errors at runtime unless the bullet script defines reset(). | Unity: pool.Get().Launch(transform, pool) and b.ResetState(); Godot: b.call("reset") | medium | Add a short Bullet class (Unity: ResetState, Launch storing the pool) and a bullet script with func reset() (Godot), or say in the term text that they are the reader's own.
T6-4 | craft-over-defensive-code.eng.godot.snippet | Snippet uses the type Health and Health.tick(), not defined; as pasted, the script fails to parse. Same for Unity's Health.Tick(). | @export var target_health: Health | low | Add a one-line class_name Health stub or a comment 'Health is your own component'.
T6-5 | craft-design-patterns.eng.godot.snippet | _sees_target() dereferences target with no wiring check; if the export is unassigned the node errors every physics frame, odd in a set that teaches validating wiring once. | return global_position.distance_to(target.global_position) < 128.0 | low | Add assert(target != null) in _ready().
T6-6 | craft-performance.eng.godot.snippet | push_warning fires on every frame over budget and spams the log. pos starts all zero so the loop moves nothing, so the example shows the monitor but no real work. | push_warning("process over 60 fps budget") | low | Warn once per second or on a counter; seed pos with non-zero values.
T6-7 | craft-ai-orchestrates-tools-compute.facts (tau-bench), what | tau-bench evidence is GPT-4o era (2024) and used to say agents are unreliable across repeated runs; by Sept 2026 that is dated and the topic does not say newer models were not re-tested. | GPT-4o succeeded on under 50% of tasks, pass^8 below 25%: https://arxiv.org/abs/2406.12045 | low | Add 'on 2024 models; re-measure on yours', as the models domain does for other benchmarks.
T6-8 | craft-core-values-that-last.what | Learner-facing text says 'as the owner wrote them', a meta reference to the site author that means nothing to a reader. | A starting set of engineering values, as the owner wrote them | low | Replace with 'A starting set of engineering values:'.
T6-9 | models-sampling.facts[2] | Fact says the Messages API reference states results are not fully deterministic at temperature 0.0 and that newer models do not accept top_k. The fetched reference confirmed only that models after Claude Opus 4.6 accept temperature 1.0 only (others get 400); the determinism and top_k wording was not seen. | https://platform.claude.com/docs/en/api/messages | low | Re-check the exact sentences on the reference page and cite top_k to its own page if it lives elsewhere.
T6-10 | models-tokens-context.facts[1] | Price example names Sonnet 5, but the pricing page now also lists Sonnet 5.5 ($2/$10), Opus 5.5 ($4/$20) and Fable 5.1 ($10/$50). Claim is true; the example is no longer the newest mid-tier. | https://platform.claude.com/docs/en/about-claude/pricing | low | Name Sonnet 5.5 as well, or say Sonnet 5 and 5.5 are $2 and $10.
T6-11 | careers-transferable-skills.why, facts[0] | Text speaks of a 2022 to 2025 layoff cycle but the tracker figures stop at 2024 (14,600). No 2025 count is given. | about 8,500 in 2022, 10,500 in 2023 and 14,600 in 2024 | low | Add the 2025 total from the same source, or say 2022 to 2024.
T6-12 | careers-destinations.facts[2], facts[4] | Two vendor claims are dated: over 35 car models comes from Epic's five-year article and the Mercedes-Benz-chose-Unity claim from a November 2023 talk. Neither is re-checked for Sept 2026. | https://www.unrealengine.com/news/five-years-35-car-models-how-unreal-engine-is-accelerating-hmi-innovation ; https://unity.com/resources/unite-mercedes-benz | low | Say 'as of Epic's 2025 article' and confirm Mercedes still uses Unity for MB.OS 3D.
T6-13 | careers-ai-tooling-market.why[0] | Argues the area is still hiring engineers in large numbers but cites only private investment (AI Index 2026), which is not hiring data. | private AI investment more than doubled in 2025 | low | Cite job-posting data, or reword: funding is high so roles exist, but check each employer.

Not re-verified: GPT-5 system card SimpleQA numbers, Chroma revision dates, quantisation-study figures.
