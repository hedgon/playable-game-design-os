# Blend data log (B2)
## Prompt templates: `topics` (17 prompts, 33 links)
brainstorm: finding-an-idea, ai-roles (idea options; the brainstormer role)
critique: hypothesis-driven-design, ai-roles (assumptions and disproving behaviours; the critic role)
system-analysis: systemic-design, agency-and-emergence (interactions between mechanics)
mechanic: mechanics-and-rules, feature-vs-experience (mechanic from a behaviour goal)
economy: economy-and-resources, economy-modelling-and-balance (economy design and simulation)
progression: progression, return-and-quit (progression audit against churn)
level: level-structure, encounter-design
ux-audit: ux-as-design, readability-and-hierarchy
narrative: ludonarrative-alignment
playtest-analysis: ai-for-playtest-analysis, playtesting
balancing: economy-modelling-and-balance, builds-and-loadouts (niches, not equalisation)
scope: scope-control, pm-scoping-cuts
prototype: prototyping, hypothesis-driven-design
implement: ai-for-implementation, ai-agentic-implementation
refactor: ai-for-implementation, craft-clean-code-ai-era
postmortem: pm-postmortems, iteration-and-evidence
verify: verifying-ai-output, ai-evals
## Checklists: `topics` (12 checklists, 30 links) and `platforms`
design-review: feature-vs-experience, design-pillars, scope-control
onboarding-audit: onboarding, playtesting
ai-verify: verifying-ai-output, ai-failure-modes
pre-prototype: prototyping, hypothesis-driven-design
playtest-prep: playtesting, iteration-and-evidence
scope-sanity: scope-control, pm-scoping-cuts
submit-pc: certification-and-review, store-presence, ratings-and-disclosures; platforms steam, epic, itch, xbox (Microsoft Store)
submit-console: certification-and-review, platform-requirements, ratings-and-disclosures; platforms nintendo, playstation, xbox
submit-mobile: platform-requirements, ratings-and-disclosures, release-and-updates; platforms google-play, apple
agent-rules-file: ai-agentic-implementation, craft-teaching-agents, models-agent-harnesses
ai-architecture-boundary: ai-budgets-and-debugging, ingame-ai-purpose, ai-failure-modes
ai-submission-by-platform: ai-disclosure-policy, certification-and-review, ai-generative-assets; platforms steam, epic, itch, web, xbox, nintendo, playstation, google-play, apple, roblox, fortnite (its groups cover each family)
## Platform guides: `checklists` (11 guides, 21 links; the reverse of the `platforms` above)
steam, epic, itch: submit-pc, ai-submission-by-platform. xbox: submit-console, submit-pc, ai-submission-by-platform. nintendo, playstation: submit-console, ai-submission-by-platform. google-play, apple: submit-mobile, ai-submission-by-platform. web, roblox, fortnite: ai-submission-by-platform. Quest has none (no checklist covers it).
## Engine guides: craft topics added (8 guides, 15 links; reason is what the guide text covers)
godot: craft-game-loop-timestep (_process v _physics_process), craft-entities-and-scenes (nodes, scenes), craft-physics-and-collision
unity: craft-entities-and-scenes (GameObjects, DOTS), craft-game-loop-timestep (player loop, FixedUpdate), craft-performance (profiler)
gamemaker: craft-entities-and-scenes (objects, rooms), craft-performance (texture groups, runner)
unreal: craft-performance, craft-memory-and-gc
web: craft-game-loop-timestep (fixed timestep, rAF), craft-memory-and-gc, craft-performance (phone memory)
renpy: craft-save-systems (rollback and saves)
defold: craft-entities-and-scenes (collections, proxies)
cocos: craft-entities-and-scenes (scenes, nodes, prefabs)
Not added: craft-gameplay-math (no guide stage concerns it); blender (asset pipeline, none apply).
## Smells and diagnostics
All 33 smells' cause topics already exist (validated). Loop parts (`top`) and unfair causes (`top`) already carry topic links, all valid; no change needed.
## validate.js
New block "Cross-kind links": every prompt has 1 to 3 known topics; every checklist has at least one known topic; checklist `platforms` and platform `checklists` must exist and name each other; every `submit-*` checklist must be linked by a platform; engine and platform `topics` must exist.
## CONTRIBUTING.md: three one-line notes (platform `checklists`, engine craft topics, prompt/checklist `topics`/`platforms`)
## Spelling changes (UK)
13-ai-workflow.js: behavior(s)->behaviour(s) (line 25), Judgment->Judgement (53), judgment->judgement (142), Analyze->Analyse (63), Behavior->Behaviour (88), Summarize->Summarise (93), player-behavior->player-behaviour (106)
12-diagnostics.js: Behavior->Behaviour (103), Monetization->Monetisation (117, 341), behavior->behaviour (126), Judgment->Judgement (163), monetization->monetisation (356)
Left alone: URL slugs, Partner Center, Game Center, Help Center, MIT/Apache License names, Unity "Asset Serialization", Epic "artifact" (API term), template var {{BEHAVIOR}}, data keys (behavior:, dims optimization), topic id localization-and-culture.
## US spellings in files not owned
Tool "Behavior Ladder" and topic title "Localization and culturalization" (see B-12); check 05-registry.js and the localization topic file.
