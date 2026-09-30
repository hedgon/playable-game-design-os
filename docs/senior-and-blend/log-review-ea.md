# Review of batch ea (2026-09-30)
item | kind | verdict | change
METR RCT 2507.09089 (16 devs, 246 tasks, 19%, 24%/20%, +2 to +39 CI) | fact | ok | none
METR uplift update (57 devs, 143 repos, 800+ tasks, -18%/-4%, CIs, 30-50% skipped, "very weak") | fact | ok | none
Cui et al. (4,867, 26.08 SE 10.3, 13.55, 38.38) | fact | fix | paper counts tasks as weekly pull requests; commits SE 10.0 flagged as not clearly nonzero
Peng 2023 55.8% | fact | ok | none
He et al. (806/1,380, +281.3, +48.4, warnings 30.3, complexity 41.6) | fact | ok | none
DORA 2025 (positive throughput, negative stability, ~5,000, amplifier) | fact | ok | none
DORA 2024 (-1.5%, -7.2% per 25% adoption) | fact | ok (confirmed via secondary reports and search, dora.dev PDF not opened) | none
Stack Overflow 2025 (84%, 66%, 45.2%) | fact | fix | 33,662 is the AI-use question count; survey is 49,000+ responses; wording corrected
Pearce 2021 (89, 1,689, ~40%) | fact | ok | none
Perry et al. (47 = 33+14, 66% undergrads, 3 vs 21, 12 vs 29) | fact | ok | added clear SQL result: 36% vs 7% injectable (assistant vs control)
Veracode 2025 (45%, 72/45/43/38, XSS 14% defended) | fact | ok (vendor label kept) | none
Anthropic pricing (all listed prices, cache multipliers, batch, tokenizer, Sonnet 5 note, fast mode) | fact | ok | none
METR time horizons (8 May 2026, 16 h, exponential) | fact | ok | none
Anthropic skill-formation study | fact | fix | usage groups have only 2 to 7 people; caveat added; junior interview answer softened to "hinted"
Godot load_inventory | code | ok (compiles in 4.x) | pitfall text corrected (int() on a string converts, on array/null errors)
Unity SaveValidator | code | ok (C# 9 target-typed new, Unity 6) | none
Godot/Unity AiBudget | code | ok | api lists named APIs the snippet does not use; trimmed and marked
Interview depth | content | fix | validate required 6+ questions; added one question to each of the four topics
Reverse rel links (7) | content | done | code-review, onboarding, one-on-ones (38); prompt-caching, security-and-ops (39a); engineer-in-ai-era, save-systems (39b)
validate: 0 errors except allowed "not in any path"; check-layout: 0 overlaps
