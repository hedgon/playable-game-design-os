# Learner walk: findings

Screenshots stayed in the session scratchpad (not committed). Widths: 1440 desktop, 375 phone. Walked with Edge via Playwright, first-visit state, light theme plus a dark check.

## Verdicts

**Persona A (engineer moving into games, 5 h/week).** The home page and the "Which path is for me?" chooser are clear, and every step has a "why" line and a concrete do-action. Blockers:
- The chooser sent an engineer who asked to "Program gameplay / Some experience / A few weeks" to an Intermediate path ("Program game AI players can read"). That path lists the Godot and Unity gameplay-engineer paths as prerequisites. The two paths that fit are only mentioned as "Also fits".
- Once inside a step, the task text disappears.
- The Godot guide is a shipping walkthrough, not a "start building" guide.
- Neither the chooser nor the path shows how the hours fit into weeks.

**Persona B (junior designer, systems and analysis).** This is the best experience. Systems designer was suggested with the prerequisite named, the steps alternate topic, game, tool and smell, and the Plants vs. Zombies lens is excellent (numbered screenshot callouts, evidence, cost, lesson). Diagnose starts from symptoms and ends in an experiment and a prompt. Blockers:
- Each step's do-action ("list your five relationships") lives only on the path page.
- Games are hard to browse by what they teach.
- Diagnose never points to games that show the fix.

## Findings (most important first)

| id | area | where | what happened | why it matters | suggested change | effort |
|---|---|---|---|---|---|---|
| L1 | UX | topic, game, tool and engine pages reached from a path, 1440 and 375 | Clicking a step opens the page, but the step's do-action ("Write one agent's job in one sentence...") is gone. The banner shows only "Path · Stage 1 of 4 · Next: title", truncated ("Program game AI pla...") in the narrow pane. See 05-step1.png, 08-step2.png, 08-step4.png. | The action is the point of the step. Learners read a 6k-character topic with no reminder of what to produce, so they read instead of doing. | Add the step's action sentence and time to the banner as an expandable line ("Your task: ... 20 min"). Keep it visible while scrolling. | M |
| L2 | UX | path banner on any step page | "Mark done and continue" does not continue. The URL stays the same and the button turns into "Next". See 07-afterdone.png. | The label promises one click and delivers two. It breaks flow, and learners will double-click or leave. | Make it mark the step done and navigate to the next step. Or rename it "Mark done" with a separate "Next". | S |
| L3 | content, UX | `#/paths`, chooser at 1440 | For "Program gameplay / Some experience / A few weeks" the suggestion is the Intermediate "Program game AI players can read" (03-chooser.png, 04-path.png). Its prerequisites are Gameplay engineer, Godot and Unity, which appear as inert chips. Those paths sit in "Also fits". Nothing asks how many hours a week you have. | The engineer's likely first click leads to a path that assumes skills they have not built. "A few weeks" also says nothing about 5 h/week. | Rank paths whose prerequisites are unmet lower, or show "Start here first: Gameplay engineer, Godot" as the primary result. Make prerequisite chips links. Replace the time buttons with hours per week and show "about N weeks". | M |
| L4 | content | path "Program game AI...", stage 1 | Stage 1 lists "Scripted vs simulated" twice (steps 3 and 5). It also lists the Godot guide and the Unity guide as two separate steps, so the stage totals 7 steps (04-path.png). | Repeated titles look like a bug. A Godot learner is told to read the Unity guide too, which inflates the hour estimate. | Show the second "Scripted vs simulated" step as "Scripted vs simulated: build it in Godot/Unity". Merge the engine guides into one step with an engine picker that remembers a choice. | S |
| L5 | UI | `#/map` and topic pages at 1440 | The mind map renders at about 6 px type and is unreadable at "fit" (33-map.png, 05-step1.png). Half of the topic view is a blank, tiny graph. The reading pane is only about 420 px wide and wraps the title to three lines. | The map is the site's signature feature, but it cannot be read, and it squeezes the text learners come for. | Set a minimum readable font in fit mode and cluster to the domain level until zoomed. Default topic pages to a wider text column with the map collapsed. | M |
| L6 | structure | Library, Make, Diagnose at 1440 | The left column is always the Design concept index (14 domains, 100+ links), even on Engines, Checklists, Make and Projects (12-godot.png, 13-library.png). | Users must ignore a big panel that does not apply. It reads as clutter and is a second copy of the Map. | Make the left column contextual: engine list on Engines, tool list on Make, smell filters on Diagnose. Collapse the index by default outside Map. | M |
| L7 | navigation | header, 375 | The section strip is cut off: "AI WORKFLOW" shows as "AI" and "PROJECTS" is clipped (50-m-home.png, 52-m-topic.png). A path or topic opens as a drawer over the dimmed, tiny map, and it needs the round close button to escape. | Phone users cannot tell what "AI" is, cannot see the last tab, and land in an overlay they did not ask for. | Use short labels ("AI") with an icon, or an overflow menu. Open paths and topics as full pages on phones, with the map behind a "Map" toggle. | M |
| L8 | content | game pages (Pac-Man 21k chars, Fire Emblem 46k) and path steps such as "Read the Pac-Man gameplay lens" | A long page opens on overview and lens tabs sit far down. The step names one lens, but the link lands at the top and the lens is not in the URL. Series pages open on one entry's first 30 seconds. | The step tells you which lens to read but the link does not take you there. | Deep-link the step to the lens (`#/games/pac-man/gameplay`). Add an on-page contents strip and the lens list near the top. For a series, show the series-level takeaway first. | M |
| L9 | structure | Library, Diagnose | The library groups games only by genre. Tags such as SYSTEMS and "analysed through ten lenses" sit behind a collapsed "Filter by tag" (72-filter.png). Diagnose smells (43-smell.png) link to topics but not to games that show the fix. | Persona B wants "games that teach economy design" or "show a fix for one dominant build". They must guess by genre. | Add lens and topic chips at the top of the library ("Economy", "Feedback loops"). On each smell, add a "See it in games" row. | M |
| L10 | UX | `#/make` | Eleven tools sit in an unordered grid under two tabs (Idea Lab, Build tools) with no "use this when" order or link to the topic that motivates each (73-make.png). The In-game AI Technique Chooser looks the same as the general canvases. | Learners do not know which tool to start with, so they skip Make unless a path sends them. | Group tools by job (Shape an idea, Test an idea, Systems, AI). Add the recommended path or topic to each card, and a "start here" mark. | S |
| L11 | navigation | header | "PROJECTS" is a top-level section and also a sidebar button "❖ PROJECTS" on every page, both pointing to a route named `#/experience`. The content is anonymised, interview-style engineering write-ups (44-projects), which suits only one persona. | Two identical labels split attention, and "Projects" reads like "my projects" to a learner. | Keep one entry. Rename to "Case studies" and move it under Library. | S |
| L12 | UX | guide page, first-visit hint | The hint promises the guide "takes two minutes and shows which route fits you". The guide is eight route cards plus a long seven-section reference (02-guide.png). "Programming or shipping a game" is one card and does not name the Godot or Unity gameplay paths. | Engineers do not learn which of the first two paths to take. | Link the route cards straight to the paths ("Gameplay engineer, Godot / Unity"). Trim the guide to the eight cards plus one diagram. | S |

## Should not change (works well)
- Steps that pair a "why" sentence with a concrete do-action, time estimate and type badge (TOPIC, GAME, TOOL, SMELL, ENGINE).
- The soft checkpoint with "answer in your head, then open" questions, a build deliverable, and "Skip ahead: I already know this". It matches the stated no-streaks philosophy.
- Game pages: the fixed template (want served, core verb, first 30 seconds, decision every minute), annotated screenshots and the cost/lesson/what-copies-miss structure. "Part of paths" links at the bottom tie games back to lessons (21-lenses.png, 22-lens.png).
- Topic pages: the A-H sections with "IN REAL GAMES" chips and "Related concepts and why they connect".
- Diagnose: symptom first, ranked causes, one experiment each, then a copyable prompt.
- Search (Ctrl K or /): grouped by type, keyboard navigable, shows counts. The shortcuts dialog is complete and honest about single-key rules (number keys 1-7 worked).
- Dark theme is consistent and readable (61-dark-path.png, 62-m-game-dark.png). No horizontal overflow at 375 px on home or path pages.
- The "Topics read 0/186" progress counter, with progress stored locally and an export option.

## Not verified
- Review queue and spaced-repetition flow (the `#/paths/review` route did not open the Review tab in my test).
- Mobile Tab order and focus rings (my Tab test started inside page content, so the header order is unconfirmed).
- Later stages (2 to 4) of both paths.
