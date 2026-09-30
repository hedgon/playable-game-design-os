---
status: shipped
updated: 2026-09-30
---

# Advanced paths for senior designers and senior developers, and one site that hangs together

## Goal

The owner asked on 2026-09-30 for two things:
- **A senior design path.** Add an advanced design path for senior designers. This closes P-32 from the content audit: there was no advanced design path, so the chooser gave senior designers the same picks as mid-level ones.
- **An integration check.** Double-check that every part of the project blends well. Topics, reference games, paths, Make tools, Diagnose smells, engine and platform guides, checklists, prompts, AI workflow, Projects, sources and the guide should connect to each other rather than sit side by side.

The rules are the same as the earlier audits:
- Opus orchestrates. Sonnet 5.5 workers do the work, at most two at once.
- Audits come first and are read-only. Fixes go in batches with separate file ownership, and a second agent reviews each batch.
- The checklist is updated after each task.
- Each phase is committed and pushed only after the CI steps pass on that commit in a clean worktree.
- No AI attribution.

**Added 2026-09-30 by the owner:**
- Add an advanced path for senior developers, updated for the age of AI, in which the developer's original role shifts greatly.
- Research every new advanced topic with frontier, up-to-date knowledge. Prefer practices with real evidence that have been tested, and do the research before building.

**Evidence standard for every new advanced topic:**
- **Research comes before writing.** A claim that a practice works needs evidence: a controlled study, a large survey, a published measurement or a documented case with outcomes. Record the date, the sample and what the evidence does not show.
- **Contested or early findings are labelled.** Say that a finding is contested or early, and give the counter-evidence.
- **A practice with no evidence is presented as a rule of thumb.**

## Checklist

Status: `todo`, `doing`, `done`.

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| D1 | Research what a senior designer must do well; map it against the 198 topics; list real gaps; draft the path outline | done | 11 senior competencies from studio job ladders and GDC talks; covered: scope, docs, ethics, analysis; thin: vision and pillars, economy modelling, live design with data, design mentoring; missing: pitching. Path outline senior-game-designer, 5 stages, about 22 h |
| B1 | Integration audit: cross-links, orphans, one-way links, naming, dead ends, duplicated or contradictory content across parts | done | 16 findings (2 high: checklist and prompt pages are dead ends; 8 medium; 6 low); no broken links and no contradictory advice. Fixes split into a data half and a rendering half |
| D2 | New topics for the confirmed senior-design gaps, reviewed | done | 4 new topics and 3 deepened; review: 11 fixes (Braintrust now from Catmull in HBR, two engine pitfalls corrected, invented methods labelled as the site's approach, illustrations labelled); evidence pass next (DE) |
| D3 | The advanced design path, chooser senior picks, e2e checks, reviewed | done | senior-game-designer: advanced, 22 h, 5 stages (Vision, Economies, Live, Reviewing and growing designers, Scope pitch and trade-offs), prereqAny over four intermediate design paths, steps built on the evidence-rebuilt topics, 6 game lenses; chooser: first pick for design at Experienced, third for lead; e2e 92/92 |
| DE | Evidence pass on the senior-design topics: frontier, tested evidence per topic, then revise them | done | rebuilt from primary texts; independent review re-opened them and made 8 fixes (CUPED pre-period advice corrected, SRM check made concrete, pitching association not causation, loot-box spend bands, labels); game A/B numbers and novelty decay stated as unmeasured |
| E1 | Research the senior developer role in the AI era, with evidence (studies, surveys, measurements); map to topics; gaps; path outline | done | 16 sources opened (METR RCT and 2026 update, Cui et al. field RCTs, Anthropic skill-formation RCT, Perry et al., Veracode, Cursor diff-in-diff, DORA 2025 and others); 14 competencies; missing: security review of generated code, junior skill formation; thin: architecture, specs, measuring uplift, cost and latency; 9 overstated AI claims on the site to correct; path outline 6 stages, about 23 h |
| E2 | New or deepened topics for the senior developer gaps, evidence-first, reviewed | done | ea: 4 topics, reviewed (5 fixes); eb: all 9 overstated claims corrected and 7 topics deepened, reviewed (4 fixes: METR skipped-task wording, SWE-bench wording from sources opened, SWE-bench Pro dated, GDC 2026 AI sentiment added). SWE-bench Verified audit stays labelled secondary (OpenAI page blocked) |
| E3 | The advanced developer path, chooser picks, e2e checks, reviewed | done | senior-game-developer-ai-era: advanced, 23 h, 6 stages; outcome promises local measurement, not speed; reviewed with every linked topic read (18 fixes); chooser first at Experienced for gameplay, backend and AI |
| B2 | Integration fixes, reviewed | done | topic pages show tools, guides, checklists, prompts and paths; no page kind is a dead end (smoke checks 14 kinds); search folds UK and US spelling, synonyms, version numbers and dated facts; guide lists all paths and explains the chip rows; Sources lists everything cited; wide layout on every page kind; UK spelling |
| V1 | Checks, CI replay, second learner check as a senior designer, archive | done | senior walk: both paths judged good; its 10 findings fixed (search ranks exact matches first, chooser says why and trims alternatives, prerequisite lists collapse, METR step gives sample and update, stage 1 audits instead of basics, checklists link back); validate 0 errors, 206/206 topics in paths, layout, contrast, tsc, smoke 260, e2e 100/100 |

## Outcome

- **Two advanced paths, each researched before it was built.**
  - `senior-game-designer` (22 h): vision, economies, live design, reviewing and growing designers, scope and pitching.
  - `senior-game-developer-ai-era` (23 h): architecture under budgets, specs and evals, reviewing AI-written code for security, measuring AI uplift locally, cost and latency budgets, growing juniors, incidents and direction. It promises local measurement, not speed.
  - The chooser gives each path first to Experienced learners with the matching goal, and says why.
- **Eight new advanced topics built on opened primary evidence.**
  - The developer evidence: METR's RCT and its 2026 update, field RCTs at three firms, Anthropic's skill-formation RCT, Perry and Pearce on insecure generated code, and DORA 2025.
  - The design evidence: Kluger and DeNisi on feedback, Elsbach and Kramer on pitches, Johari, Deng and Fabijan on experiment pitfalls, Zendle and Cairns on loot boxes, and EVE's economic reports.
  - Each claim carries its date, sample and limits. Practices without evidence are labelled as rules of thumb.
- **Existing topics corrected.** Nine AI claims that overstated the evidence are fixed, and ten existing topics are deepened.
- **The parts connect.**
  - Topic pages show their tools, guides, checklists, prompts, paths and games, and no page kind is a dead end.
  - Search folds UK and US spelling and synonyms, and ranks exact matches first.
  - The guide lists every path and explains how the parts connect.
  - Sources lists everything the site cites.
- **Open for later.**
  - The SWE-bench Verified audit is cited from secondary coverage, because OpenAI's page stayed blocked.
  - Castronova 2001 and Nagappan 2008 are cited from summaries.
  - No published game A/B test with numbers, and no measurement of how fast novelty effects fade, could be found. The topics say so.
  - Engine snippets were checked against the docs, not compiled.
