# Senior designer research (D1)

Sources note: web search returned job-ad and summary pages, not full ladders. Claims resting on a book or talk I know but did not re-fetch are marked (book, not re-fetched). Verify before quoting on the site.

## 1. Competencies that separate senior from mid
Mid = owns a feature and its outcome. Senior = owns a system, a pillar set, or a designer's growth.

| # | Competency | Source |
|---|---|---|
| C1 | Owns a design vision and pillars across a team | Playground Games principal ad, "creative vision" (huntukvisasponsors.com/job/principal-game-designer-at-playground-games-c310frvstykj); Reliance Games lead ad (reliancegames.com/careers/lead-game-designer-USA.html); Schell, The Art of Game Design (book, not re-fetched) |
| C2 | Designs and balances whole economies and progressions with models | GDC Vault "Balancing the Economy for Albion Online" (gdcvault.com/play/1024070); Castronova/Machinations "Building Sustainable Game Economies" (gdcvault.com/play/1028982); thatgamecompany lead systems/economy ad (builtinchicago.org/job/lead-systems-designer-economy-and-engagement-focus/8430589) |
| C3 | Live-game design and roadmap decisions with data | Principal ad, "optimize based on data" (builtin.com/job/principal-game-designer/7093636); Glu Director of Game Design ad (hitmarker.net/jobs/glu-mobile-director-of-game-design-757397) |
| C4 | Documentation that scales, decision logs, review culture | Riot senior designer posting (riotgames.com/de/j/7875361); Fullerton, Game Design Workshop (book, not re-fetched) |
| C5 | Cross-discipline trade-offs with engineering, art, production | Principal ad, collaborating with engineers and artists; Fullerton (book) |
| C6 | Mentors designers, gives design feedback | Senior ad, "mentor game designers on the team" (keywordsstudios.com/en/careers/browse-careers/xFq-senior-game-designer/); Manager of Game Design ad, "supporting designer growth" |
| C7 | Scope and cut decisions | Lead/producer ads; Fullerton (book) |
| C8 | Pitching to stakeholders and publishers | Schell pitching chapter (book); Director ads |
| C9 | Analysing and critiquing others' designs, wide genre knowledge | Senior ad, "exceptional knowledge of games across genres and platforms"; resumegeni.com/blog/game-designer-career-path |
| C10 | Ethics and player-respecting monetisation | Live/F2P lead ads; Schell lens of responsibility (book) |
| C11 | Shipped titles as evidence | Principal ad: 5+ years, 2 shipped titles |

## 2. Coverage map (topics read, not just titles)
| # | Existing content | Verdict |
|---|---|---|
| C1 | `design-pillars` (write, forbid, non-goals, test on 5 debated decisions), `core-experience`, `feature-vs-experience`, `audience-and-positioning`; tools canvas, feature; smell pillars-are-slogans | Thin. Pillars taught as an author's tool; nothing on owning a vision across a team, defending it under pressure, changing it |
| C2 | `economy-and-resources` (one how-step: simulate in spreadsheet or script; Cookie Clicker price rule), `progression`, `difficulty`, `craft-gameplay-math`, `monetisation-design`, tool sysmap, systems-designer path | Thin. No method for anchors, source/sink math, inflation, archetype simulation, calibrating to telemetry |
| C3 | `live-operations` (90-day plan, cadence), `metrics-and-success`, `pm-liveops-cadence`, `server-liveops`, `return-and-quit`; games candy-crush-saga, subway-surfers, fortnite, hearthstone | Thin. Cadence and metric definitions exist; season/event design, cohort data into roadmap, A/B judgement are not taught |
| C4 | `design-documents`, `lead-conventions`, checklist design-review | Covered at working level; design review culture thin |
| C5 | `team-and-collaboration`, `pm-cross-discipline`, `risk-and-dependencies` | Covered (handoffs); designer-side costing thin |
| C6 | `lead-one-on-ones`, `lead-feedback-performance`, `lead-conflict-growth` (generic, in technical-lead path) | Thin: nothing design-specific |
| C7 | `scope-control`, `pm-scoping-cuts`, checklist scope-sanity, `vertical-slice-mvp` | Covered |
| C8 | Fragments in `design-documents`, `lead-saying-no`, `audience-and-positioning` | Missing |
| C9 | `learning-from-success`, tool dissect, 107 reference games with lenses, study-the-hits paths | Covered for own learning; missing a method for critiquing to a team |
| C10 | `ethics-and-responsibility`, `monetisation-design` | Covered; deepen in the live topic |

## 3. Proposed new topics (4 new, 3 deepenings)
1. `economy-modelling-and-balance` (systems). Balance anchors, source/sink rates, inflation and time-to-target, spreadsheet then archetype simulation, calibrating to telemetry. Why: C2 thin. Refs: Woodward, Albion GDC talk; Castronova/Machinations GDC; Adams and Dormans, Game Mechanics: Advanced Game Design (book). Alternative: deepen `economy-and-resources`; I prefer new because it needs its own sitting.
2. `live-design-seasons-and-data` (product). Season and event design, reading cohorts into roadmap choices, A/B limits, guardrails against monetisation eating fun. Why: C3. Refs: King level-data facts already in the library; find specific GDC live-service talks to cite.
3. `design-critique-and-feedback` (studio). Running a design review, critiquing without owning, feedback on a junior's design, teardown for a team. Why: C6, C9. Refs: Schell lenses; Fullerton; existing design-review checklist.
4. `pitching-and-stakeholders` (studio). Pitch structure, evidence ladder, objections, decision memos. Why: C8 missing. Refs: Schell; Fullerton.
Deepen instead of new: `design-pillars` (vision ownership, pillar conflict, change control) for C1; `pm-cross-discipline` (designer costing of features) for C5; `ethics-and-responsibility` for C10.

## 4. Path outline
`senior-game-designer`, track design, level advanced, about 22 h, pick line under 60 characters, e.g. "Own the vision, the numbers and the team's designs".
Audience: mid-level designers who own features and now must own a game's pillars, economy and other designers' work.
Outcome: You can write a vision with pillars a team can decide by, model and tune an economy, plan a live season from data, run a design review and a cut list, and pitch the result.
prereq: game-designer-foundations, systems-designer. prereqAny: level-and-ux-designer, casual-game-people-keep, games-that-broke-the-mould (each must list the new path in `next`). next: technical-lead, studio-practice-ai-era, interview-prep-designer.
Stages (all advanced):
1. Vision (4 h): design-pillars, core-experience, audience-and-positioning, tool canvas, smell pillars-are-slogans, two games read by lens for pillars. Build: vision doc with pillars, non-goals and five debated decisions resolved, for a real shipped game.
2. Economies (5 h): new economy-modelling-and-balance, economy-and-resources, progression, craft-gameplay-math, tool sysmap, games cookie-clicker and hearthstone. Build: balanced economy in a spreadsheet plus a simulation, with the failure it exposed.
3. Live (4.5 h): new live-design-seasons-and-data, live-operations, metrics-and-success, monetisation-design, ethics-and-responsibility, games candy-crush-saga and fortnite. Build: a one-season plan from a given data sheet, with guardrails.
4. Reviewing and growing designers (4 h): new design-critique-and-feedback, lead-one-on-ones, design-documents, checklist design-review, team-and-collaboration. Build: a design review of a shipped game plus a feedback note on a sample design.
5. Scope, pitch, trade-offs (4.5 h): scope-control, pm-scoping-cuts, pm-cross-discipline, new pitching-and-stakeholders, lead-saying-no, checklist scope-sanity. Build: a cut list with reasoning, then a five-minute pitch of the whole.
Validator rules to meet: 3+ steps per stage, a checkpoint (2-4 recall, build, 3-5 skip) on each, step minutes within 10% of stage hours, no more than 4 consecutive topics from one domain, new topics need all eight parts plus 6-10 interview questions and must appear in a step.

## 5. Chooser
Goal design, level senior: put `senior-game-designer` first, then keep systems-designer, level-and-ux-designer, casual-game-people-keep, games-that-broke-the-mould, study-the-hits-play, study-the-hits-worlds (gaps a mentor would still fill). Leave `some` unchanged. Goal lead, senior: keep technical-lead first; optionally add senior-game-designer third. Ship and interview goals unchanged. Add the id to CHOOSER.paths and satisfy prereq/next reciprocity so the validator passes.
