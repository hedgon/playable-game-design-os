# Batch ea log (new evidence-first topics), 2026-09-30

Validate: 0 errors except "not in any learning path" for the four new topics (the same message also names four other topics from other batches). check-layout: 0 overlaps. Warning only: craft-security-review-of-generated-code eng.unity.snippet is 1054 chars (guide 900).

Word counts (whole entry incl. engine code and interview; approximate): uplift ~2,370, security ~2,330, cost ~2,320, junior ~1,850.

## craft-measuring-ai-uplift (craft, advanced) - src/39b-topics-craft.js
| Source | Date | Sample | Finding | Limits | URL |
|---|---|---|---|---|---|
| METR RCT (Becker et al.) | Jul 2025, rev Feb 2026 | 16 devs, 246 tasks | 19% slower (CI +2 to +39); forecast 24% faster, believed 20% faster | mature OSS repos, early-2025 tools | https://arxiv.org/abs/2507.09089 |
| METR uplift update | 24 Feb 2026 | 57 devs, 800+ tasks | returning -18% time (CI -38 to +9), new -4% (-15 to +9); "very weak evidence" | selection, broken time tracking | https://metr.org/blog/2026-02-24-uplift-update/ |
| Cui et al. | Feb 2025 | 4,867 devs, 3 RCTs | +26.08% tasks (SE 10.3), +13.55% commits, +38.38% compiles | no quality data, autocomplete era | https://economics.mit.edu/sites/default/files/inline-files/draft_copilot_experiments.pdf |
| Peng et al. | Feb 2023 | one task | 55.8% faster | greenfield, one task | https://arxiv.org/abs/2302.06590 |
| He et al. | Nov 2025 | 806 vs 1,380 repos | lines +281% then faded; warnings +30%, complexity +42% | observational, OSS | https://arxiv.org/abs/2511.04427 |
| DORA 2024/2025 | 2024, 2025 | survey | 2024 -1.5% throughput, -7.2% stability; 2025 throughput positive, stability negative | correlational | https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report |
| Stack Overflow 2025 | 2025 | 33,662 | 66% "almost right", 45.2% debugging longer | self-report | https://survey.stackoverflow.co/2025/ai |
Rule of thumb (no evidence): the trial design (random by task, metrics, 30-day window, re-run date); the remark that a 20-task trial detects only large effects is reasoning from METR's interval, not a power calculation.
Unverified: DORA 2024 blog and Stack Overflow figures taken from the research file (not reopened by me); DORA 2025 per-capability numbers not used.

## craft-security-review-of-generated-code (craft, advanced)
| Source | Date | Sample | Finding | Limits | URL |
|---|---|---|---|---|---|
| Pearce et al. | Aug 2021 | 89 scenarios, 1,689 programs | ~40% vulnerable | old model | https://arxiv.org/abs/2108.09293 |
| Perry et al. | Nov 2022 / Dec 2023 | 47 (33 AI, 14 control), 66% undergrads | less secure (3% vs 21% message signing; 12% vs 29% file access), more confident | Codex, lab, 2 h | https://arxiv.org/abs/2211.03622 |
| Veracode (vendor) | 2025 | 100+ models | 45% failed; XSS defended 14%; bigger not safer | vendor; task count and prompts not stated | https://www.veracode.com/blog/genai-code-security-report/ |
Rule of thumb (labelled in topic): all game-specific review order (client trust, saves, receipts, secrets, anti-cheat as friction), package-name check (no study cited), hostile-input tests. Perry SQL-injection figure (36%) omitted because the research file was ambiguous about which group it describes.
Engine snippets: full code is in the topic (Godot `load_inventory`, Unity `SaveValidator.Load`). Not compiled or run here (no engine available); written against Godot 4 FileAccess/JSON.parse_string/clampi and Unity JsonUtility/Mathf.Clamp/C# 9 target-typed new. Recommend a reviewer run them.

## craft-ai-cost-latency-budget (craft, advanced)
Sources: Anthropic pricing page read live 30 Sep 2026 (https://platform.claude.com/docs/en/about-claude/pricing): Sonnet 5.5 $2/$10, Haiku 4.5 $1/$5, Opus 5.5 $4/$20, Fable 5.1 $10/$50 per MTok; cache 5 min 1.25x, 1 h 2x, read 0.1x (0.05x Opus 5.5, 0.025x Fable 5.1); Batch 50%; tokenizer ~30% more tokens for 4.7+; Sonnet 5 $2/$10 made permanent (planned $3/$15 rise cancelled). METR time horizons (updated 8 May 2026, from research file, not reopened): https://metr.org/time-horizons/.
Unsourced: no latency figures from any vendor; latency guidance (p95, streaming, loading states) is a rule of thumb. Other vendors' prices not checked. The worked interview numbers ($0.008 per call, 20 calls) are illustrative. Engine snippets (AiBudget) are small arithmetic classes, not compiled here.

## lead-junior-skill-formation-with-ai (leadership, advanced) - src/38-topics-leadership.js
Sources: Anthropic, 29 Jan 2026 (https://www.anthropic.com/research/AI-assistance-coding-skills): 52 mostly junior engineers, Trio, quiz 50% vs 67%, d 0.738, p=0.01, ~2 min faster n.s., delegation/AI debugging <40%, explanations 65%+; vendor-run, small, immediate quiz. Cui et al. as above. Numbers from the research file (the Anthropic page was not reopened by me).
Rule of thumb: everything in `how` (explain-first, no-assistant reps, cold explanation, milestone) is the site's approach; the topic says so.

## Proposed game tags
None. No game lens was read as showing these points; no games tagged.

## Proposed path placement (path senior-game-developer-ai-era, proposed, from the outline)
- craft-security-review-of-generated-code: stage "Review and security", after lead-code-review; do: review one AI-written loader against the boundary list and write three hostile-input tests; 45 min.
- craft-measuring-ai-uplift: stage "Measure, budget and choose", first step; do: write the paired-task plan with metrics; 50 min.
- craft-ai-cost-latency-budget: same stage, after models-prompt-caching; do: fill the budget sheet for one feature with dated prices and a cap; 45 min.
- lead-junior-skill-formation-with-ai: stage "Grow the team", first step; do: write a mentoring plan for one junior with a cold-explanation review and a skill milestone; 40 min.

## Reverse rel links to add (not done: files owned by another worker or outside my scope)
No edits made to the five locked files. Links I would add from existing topics (in files I did not touch): lead-code-review -> craft-security-review-of-generated-code; lead-onboarding and lead-one-on-ones -> lead-junior-skill-formation-with-ai (src/38 is mine but I limited edits to appending); models-prompt-caching and models-security-and-operations -> craft-ai-cost-latency-budget (src/39a); craft-engineer-in-the-ai-era -> craft-measuring-ai-uplift; craft-save-systems -> craft-security-review-of-generated-code. Inbound links already exist from my new topics' rel lists (orphan check passed).

## For models-reasoning-and-scaling (another batch)
Do not quote SWE-bench Verified as "human-validated" without a caveat: the OpenAI page "Why we no longer evaluate SWE-bench Verified" returned 403 for the researcher, and the claimed figures (59.4% of 138 hard problems with test or description issues, contamination, OpenAI stopped reporting, recommends SWE-bench Pro) are second-hand and must be re-fetched from https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/ before use. Add the METR Feb 2026 uplift numbers (see above) and the 16-hour ceiling from the time-horizons page. craft-benchmarks-and-vendor-claims was not created, as instructed.

## Not done
- Overstated claims in existing topics (research section 4) were not edited; not in scope.
- 39b intro still says "an agent writes half the code" (research item 3).
