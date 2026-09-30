---
status: active
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
| D3 | The advanced design path, chooser senior picks, e2e checks, reviewed | todo | |
| DE | Evidence pass on the senior-design topics: frontier, tested evidence per topic, then revise them | doing | |
| E1 | Research the senior developer role in the AI era, with evidence (studies, surveys, measurements); map to topics; gaps; path outline | doing | |
| E2 | New or deepened topics for the senior developer gaps, evidence-first, reviewed | todo | |
| E3 | The advanced developer path, chooser picks, e2e checks, reviewed | todo | |
| B2 | Integration fixes, reviewed | doing | data half done (prompts 33 topic links, checklists 30 topic and 22 platform links, platform guides 21 checklist links, engine guides 15 craft links; validate enforces them; 13 US-to-UK spellings); rendering half next |
| V1 | Checks, CI replay, second learner check as a senior designer, archive | todo | |
