# Review of batch eb (2026-09-30)
item | kind | verdict | change
METR update 2026-02-24 (57 = 10+47, 143 repos, 800+ tasks, -18% [-38,+9], -4% [-15,+9], "very weak", selection) | fact | ok | none
METR "30% to 50% skipped tasks" (4 places, 39a/39b) | fact | fix | METR says 30% to 50% of developers said they held back tasks; reworded
METR 2025 RCT (19%, +2 to +39) | fact | ok | none
Peng 2023 55.8% (HTTP server, JS, Copilot) | fact | ok | none
He et al. 2511.04427 (transient velocity, persistent warnings/complexity) | fact | ok (abstract confirms direction; +30%/+42%/+281%/+48% not re-read from PDF, ea review confirmed them) | none
Veracode 2025 (100+ models, 45%, 72/45/43/38, XSS 86% failed = 14% defended, no gain from newer models) | fact | ok | none
DORA 2025 (~5,000, amplifier, throughput +, stability -) | fact | ok | none
Stack Overflow 2025 (84%, 66%, 45.2%) | fact | ok | none
SWE-bench Verified caveat (39a, 39b) | fact | fix | OpenAI page still 403. Wording kept as "secondary coverage" (The Decoder, search summaries agree: 27.6% subset, at least 59.4% of audited problems flawed, GPT-5.2/Opus 4.5/Gemini 3 Flash reproduce some fixes). Dropped "given only a task id" (no source). Replaced "near 80% Verified vs ~23% Pro" with the Pro paper's own figure (23% for Opus 4.1/GPT-5 vs over 70% Verified, Sept 2025) and said it is a two-benchmark gap
swebench.com/verified.html | fact | ok | says only "human-filtered 500 instances" (supports "human-validated" line); no flaw notice there
Claim 9 GDC 2026 | fact | fix | layoff line (28%, 33%, 2,300+) was already in 39c and matches the GDC page. Added a 39c fact with AI figures (36% use, 52% negative vs 30%/18%, 7% positive vs 13%, roles 64/63/59, uses 81/47/35) and source
Claim 9 research file "~3,000 respondents" | fact | flagged | GDC says more than 2,300; only src/research-notes.md line 92 (not editable here) repeats ~3,000
Claims 1 to 8 rewording | content | ok | Text now says greenfield 55.8%, mature 19% slower, 2026 inconclusive; nothing correct lost versus log
Code snippets | code | ok | eb changed no snippets
Validate / layout | check | ok | validate: only the 4 allowed "not in any path" errors; layout: 0 overlaps
