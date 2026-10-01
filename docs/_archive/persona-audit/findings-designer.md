# Playable: senior game designer audit

I could not save this report to `report.md` in the scratch folder: the harness blocks report files from sub-agents. All paths below are relative to `<scratch>/`, unless they start with `src/` or `README.md`, which are in the repository.

## 1. Who I am and how I audited

**Persona:** a senior game designer with 15 years across console, PC and mobile, who has led design teams and worked closely with UI/UX.

**What I looked at, with counts.** This run reused screenshots and scripts left by an interrupted earlier run. I re-checked everything I report here, either by running it again or by reading the screenshot myself.

- **Routes run fresh this session (11):**
  - First load, which redirects to `#/paths`.
  - `#/paths/game-designer-foundations`, where I ticked one step.
  - `#/map/t/core-loop`, with all eight sections expanded, plus the Interview tab.
  - `#/map/t/meaningful-decisions` and `#/map/t/business-model`.
  - `#/build/feature`: all 9 questions answered and the Markdown exported.
  - 5 design smells: `floaty-combat`, `too-many-currencies`, `unfair`, `tutorial-too-long`, `pressure-not-want`.
- **Search:** 7 queries.
- **Contrast scan:** 4 routes in both colour schemes.
- **Screenshots I looked at myself (13):**
  - 1440 dark: first run, path detail, the checkpoint, the state after ticking a step, and the Should We Build This tool.
  - 375: dark paths, dark path detail, light topic.
  - 768 light Celeste, 1920 light Celeste, 1280 dark map.
  - Widths covered: 375, 768, 1280, 1440 and 1920. Both colour schemes.
- **Text read in full or in large part:**
  - One topic in full, the core loop (all 8 sections, Techniques and Interview).
  - One reference game in full, Celeste (about 4,900 words).
  - The full step lists of two paths: Idea to prototype in 30 days, and Senior game designer.
  - Stage 1 of Game designer foundations and its checkpoint.
  - The AI Prompt ladder, the How to use this site guide and the Fun diagnostic.
- **Data scanned, read-only, by loading `src/manifest.js` in Node:**
  - All 206 topics: words per domain.
  - All 107 reference games: words and hedge-word counts.
  - All 23 paths: steps, minutes and stated hours.

## 2. First impression (the first five minutes)

The site looks like a serious tool, not a blog. It has a dark, terminal-flavoured header, condensed display headings and orange accents (`shots/v-first-1440d.png`). Then it asks a lot of me straight away.

**The first screen does five things at once:**
- It shows a "First time here?" banner.
- It shows progress-backup controls, including a red **Reset all**, before I have any progress.
- It asks a three-question path chooser.
- It lists 23 path cards, nine of them under "What do you want to be able to do?".
- It shows a "Topics read 0/206" counter in the header.

The page also names itself three times: a "Paths" breadcrumb, a "Learning paths" tab and an h1 "Learning paths".

When I opened a path I got three columns (`shots/p01-path-detail.png`): a path list, a mind map and the lesson. The mind map takes the widest, central column and is mostly empty dark space. The actual reading is squeezed into a column about 420 px wide on the right.

**Verdict after five minutes:** impressive ambition, and real craft in places. But it reads as a product built to prove coverage ("every topic is in at least one path", "206 topics"), not one built around a junior's first hour.

## 3. Good: what works well

- **The topic template is the right shape for practitioners.** (Confirmed, `text/v-topic-core-loop.txt`)
  - Every topic covers: what it is, why it matters, how to think about it, how to do it, what AI should and should not do, prompts, how to check AI output, and what to playtest.
  - The playtest section and the "signals of good / bad design" are what juniors usually never get taught.
  - The core loop's "How do I actually do it" is correct and actionable: grey-box the loop alone, test whether players repeat it voluntarily, fix one link at a time.
- **The Celeste analysis is genuinely good.** It is better than most GDC-blog teardowns. (Confirmed, `text/r1440d-games_celeste.txt`, `shots/w1920l-games_celeste.png`)
  - It covers concrete mechanics: coyote time, jump buffering, the 2 px and 5 px wall-jump windows, half gravity at the peak of a jump.
  - It gives the cost of each choice.
  - Each lens has a comparison, for example Super Meat Boy's Dark World against B-Sides, and Brothers against the double dash.
  - It has a "what copies miss" section, which is exactly what a senior wants.
  - Every lens cites its sources.
- **The Senior game designer path has real senior exercises.** I would assign these to my own leads. (Confirmed, path dump from `node v-stats.js`) Examples:
  - Sweep every economy input by 10% against a balance anchor.
  - Port the economy model to a script with a fixed random seed.
  - Pre-register the goal metric, two guardrails, the smallest effect worth shipping and the sample size.
  - Write critique in three columns: saw, means, would try.
  - Write a cut list that states the cost to the player.
- **The prompts are disciplined.** Lines like "Do not recommend one yet", "Mark what is observed and what is inferred" and "Do not answer any of them". The ladder separates the human decision from the AI's job at every rung. It is the best "AI for designers" framing I have seen, because judgement stays with the designer. (Confirmed, `text/r1440d-ai_ladder.txt`)
- **The Interview tab and its "Your story" box.** Junior, mid and senior questions, plus a private notes box ("An outline is not an answer"), is good coaching. (Confirmed)
- **Both themes read well.**
  - The light theme (cream, ink, ochre) is warm and readable.
  - The dark theme passed my contrast scan on all 4 routes.
  - Light failed only on two small chips: the 10.5 px teal chips (4.33:1) and one "ALL" chip (3.19:1).
  - (Confirmed, `node v-contrast.js`)
- **Mobile reflows cleanly.** The header becomes two rows, cards stack, and diagrams stay legible at 375 px (`shots/w375l-map_t_core-loop.png`, `shots/w375d-paths_game-designer-foundations.png`). (Confirmed for the screenshots viewed)
- **Progress stays in sync.** Ticking one path step updated the step count (1/31), the map node ("1 of 8 done" with a check) and the header ("Topics read 1/206"). (Confirmed, `shots/v-walk-after8.png`)
- **No streaks or badges, and progress stays in the browser.** These are the right calls for a professional audience. (Opinion)

## 4. Bad: what is wrong, broken, confusing or weak

1. **"See it in games" on the design smells is automated noise.** (Confirmed, `node v-smells.js`)

   | Smell | Games shown | Games linked in total |
   |---|---|---|
   | Combat feels floaty | Katamari Damacy, Rocket League, **Age of Empires II, Among Us, Bejeweled**, Beat Saber | 57 |
   | Too many currencies | Includes DOOM and Factorio | 106 of 107 |
   | The tutorial is too long | Includes Pac-Man and Wii Sports | 32 |

   For floaty combat, the library already contains DOOM, Hades, Dark Souls, Monster Hunter, God of War and Street Fighter. A junior shown Bejeweled for floaty combat learns that the links mean nothing; a senior stops clicking them.

2. **Paths are padded to satisfy a coverage rule.** The README states the rule: "Every topic, reference game, engine guide, platform guide and checklist is a step in at least one path". Idea to prototype in 30 days shows what it does:
   - Its final stage, "the 30-day plan", ends with "engine renpy 20m: write one scene with a menu and two labels, and run Lint on it". Ren'Py is a visual-novel engine and has nothing to do with the reader's game.
   - The same stage's "worked example" is `cs-go-game-backend/process/process-red-first`, a Go backend team's test discipline.
   - Stage 1 sends a beginner to Mega Man's "constant and changed" text, then to Rocket League's "lineage" lens.

   These are coverage slots, not teaching choices. (Confirmed, path dump from `node v-stats.js`; README "Start here")

3. **The time estimates are not credible.** (Confirmed for the step times; Likely for the conclusion)
   - Idea to prototype in 30 days totals 13.5 h.
   - Within that, a beginner gets 25 min to install Godot or Unity, and 45 min to "build the smallest playable version of your loop".
   - Reference-game steps get 15 min, but the analyses average about 4,900 words (`node games-stats.js`: 107 games, 522,697 words).
   - Two engine steps say "choose this one or the other", yet both are counted in the total.

4. **The core-loop model is internally muddled, and it is the site's keystone idea.** (Likely: content judgement; `text/v-topic-core-loop.txt`)
   - The model is "Action → Feedback → Decision → Consequence → New situation".
   - It puts the Decision after Feedback, and the Consequence after the Decision.
   - Yet the worked example makes the cascade (the Consequence) a result of the swap (the Action), not of the decision. In Bejeweled the decision comes before the swap.
   - Established models put the decision before the action, and feedback after it: Dan Cook's skill atom (action → simulation → feedback → model update), and the common decide → act → feedback.
   - The topic's own Techniques section repeats the five-link chain.

5. **The Should We Build This tool gives a canned verdict that contradicts my answers.** (Confirmed, `node v-feature.js`, `shots/v-feature-verdict.png`)
   - I answered that the feature creates "a new trade-off with situational variance", and that without it "the game is thinner".
   - The tool returned **REMOVE (score -1)**, with the fixed text "The feature creates no decision, or nothing observable is lost without it".
   - It never says which answers drove the score.
   - Every question lists the virtuous answer first, so the tool is easy to game.
   - It scores "a problem we predict but have not observed" negatively. That punishes every feature in pre-production, which is exactly where this tool would be used.

6. **The design side is thin where juniors need depth, while engineering is wide.** (Confirmed, `node v-stats.js`)
   - Topics per domain: Level Design 4, Narrative 5, Art/Audio/Feel 5, UX 6.
   - Against: Code Craft 22, How AI models work 14, AI Collaboration 13, Backend 11.
   - There is no combat-design topic: hitboxes, frame data, hit-stop budgets. Searching "combat" returns only one smell and 59 games.
   - There is no level blockout / greybox metrics topic.
   - There is no camera-design topic; camera is folded into "Animation, VFX and camera".

7. **The path page layout inverts the hierarchy.** (Confirmed, `shots/p01-path-detail.png`, `shots/w1280d-map.png`)
   - At 1440 the decorative mind map gets the central, widest column, and the lesson text gets about 420 px on the right.
   - On the map home, the domain list appears twice side by side: once in the sidebar and once as map nodes, with identical "0/N" counts.

8. **The first-run screen is overloaded.** (Confirmed, `shots/v-first-1440d.png`, `shots/w375d-paths.png`)
   - The page names itself three times.
   - A red "Reset all" sits next to empty progress.
   - A banner, a three-question chooser and 23 cards all compete.
   - On a phone, the banner's link wraps away from its own sentence ("How to use this site" / "lists a route for…").

9. **A house style in the prose hurts reading.** (Confirmed by count; Opinion on the effect)
   - There are no em dashes at all in the topics, games and paths. Asides are carried by commas instead, for example:
     - "Pokémon's promise, fill the Pokédex, is built so it cannot be kept alone"
     - "Hide generous timing windows under a difficult game, coyote time, buffered inputs, wide wall-jump windows, so…"
   - Juniors and non-native readers will misread these.
   - "arguably" appears 473 times, up to 11 times on one game page (Call of Duty 4).

10. **Some game lenses pick a weak subject.** Celeste's "Business and release" lens is about the studio renaming itself. Its real business lessons go unexamined: a premium price, a launch on several platforms at once including Switch, and free DLC as goodwill and a long tail. (Opinion, `text/r1440d-games_celeste.txt`)

11. **Search ranking is weak.** (Confirmed, `node v-search.js`)
    - "flow" lists *Sprints, kanban and content-heavy teams* as its first topic.
    - "balancing" puts a prompt and Civilization ahead of the *Economy modelling and balance* topic.
    - "gdd" finds nothing, although *Design documents and communication* exists.

12. **The Fun diagnostic offers 19 overlapping "dimensions".** Examples: social, cooperation and competition; choice and expression; collection and progression. That is a vocabulary list, not a diagnostic. LeBlanc's eight kinds of fun, which the page itself cites, is more usable. (Opinion, `text/d-diagnose_fun.txt`)

13. **The README is out of date.** It says "Twenty-one paths" and "186 topics"; the site shows 23 paths and 206 topics. (Confirmed: `README.md` "Start here" and "What is inside", against the header's "Topics read 0/206")

14. **There are too many small all-caps monospace chips**, at about 10.5 px: path tags, "In real games" chips, cross-links. They are hard to scan, and they dominate some pages; the core-loop footer has about 15 "Appears in" chips. (Size confirmed in `node v-contrast.js`; Opinion on the effect)

## 5. Useful: what I would actually use or come back for

- **Reference game pages of Celeste quality**, for "what copies miss" and the cost lines. I would send juniors to them before a teardown exercise.
- **The Senior game designer path exercises**, as a syllabus for developing leads.
- **The prompt ladder and the per-topic prompts**, copied as they are, plus the "verify AI output" questions.
- **The Design smells** (symptom → likely cause → experiment), once the game links are removed.
- **The topic playtest sections and the Playtest question bank.**
- **Should We Build This**, as an agenda for a feature-review meeting. I would use the questions, not the score.

## 6. Useless: what I would never use, or what adds nothing

- The "See it in games" and "All N games" link blocks on smells (Bad 1).
- The path mind-map column on desktop. The stage list on the right already shows the same structure with progress.
- The cloud of 19 fun-dimension chips.
- The "Appears in" chip wall at the foot of each topic, which duplicates "Related concepts".
- Engine and backend steps inside design paths, such as Ren'Py and Go red-first in a designer's 30-day prototype.

## 7. Expand: what I want more of, or deeper

- **Combat design:**
  - attack anatomy: anticipation, active frames, recovery
  - hit-stop budgets
  - enemy telegraph readability
  - damage feedback

  The floaty-combat smell needs a home topic.
- **Level design:**
  - blockout and greybox metrics (jump distances, cover spacing)
  - critical path against optional space
  - gating
  - the 3Cs (character, camera, control)

  Four topics are not enough for a whole discipline.
- **Worked numbers:** one fully worked economy spreadsheet and one difficulty curve with real values, which juniors can download, instead of "build your economy in a spreadsheet".
- **Real design documents, shown filled in:** an example one-page spec, a feature brief and a decision-log entry.
- **Comparative teardowns:** two games, one problem. For example, how Hades and Dead Cells each make death count as progress. The per-lens "Compared with" lines show the author can do this.

## 8. Less: what I want cut or simplified

- Drop the coverage rule from path design. Let a path skip engines and backend parts that do not serve its outcome.
- Cut "arguably" by about 90%. Either make the claim or attribute it.
- Reduce the first-run screen to one question ("What do you want to do?") with three answers, and move backup and reset into Help.
- Use fewer chips and fewer cross-link blocks per page.
- Trim the AI weight on the design side: 13 AI-collaboration topics, 7 AI-workflow pages and 17 prompts sit alongside only 4 level-design topics.

## 9. Top 10 changes, ranked

| # | Severity | Change | Evidence | Concrete change |
|---|---|---|---|---|
| 1 | High | Choose the game links on smells and topics by hand | Floaty combat links Bejeweled, Among Us and Age of Empires II; Too many currencies links 106 of 107 games (`node v-smells.js`) | Replace the automatic matching (any game that shares a topic) with 3 to 5 hand-picked games per smell, each with one line on why it shows the smell or its fix. Remove "All N games". |
| 2 | High | Remove coverage padding from paths | Ren'Py and Go red-first steps in Idea to prototype in 30 days; the README's "every … is a step in at least one path" | Drop the coverage rule. Make every step justify itself against the path's outcome, and keep engine and backend steps in engineering paths. |
| 3 | High | Make the time estimates honest | 45 min to build a first prototype; 15 min for analyses of about 4,900 words; both "choose one" steps counted (`node v-stats.js`) | Split reading time from doing time. Add realistic build time to the 30-day path, or rename it. Count "choose one" steps once. |
| 4 | High | Fix the core-loop model | The decision sits after feedback, and the Bejeweled example contradicts the order (`text/v-topic-core-loop.txt`) | Restate it as decide → act → feedback → updated understanding, with the state change shown as part of feedback. Cite Dan Cook's skill atom, and rewrite the examples to match. |
| 5 | Medium | Make Should We Build This explain its verdict | REMOVE with a reason that contradicts the answers (`node v-feature.js`) | Show the weight of each answer and name the 2 or 3 answers that drove the verdict. Shuffle the option order. Treat "predicted, not yet observed" as neutral in pre-production. |
| 6 | Medium | Rebalance the domains towards design craft | Level Design 4, Narrative 5, UX 6, against Code Craft 22 and How AI models work 14 (`node v-stats.js`) | Add combat design, level blockout and metrics, camera, and a worked-economy topic before adding more engineering topics. |
| 7 | Medium | Give the lesson the main column | Map central and wide; lesson column about 420 px (`shots/p01-path-detail.png`) | On path and topic pages, make the map a collapsible panel that opens on demand, and give the reading the widest column. |
| 8 | Medium | Simplify the first run | Triple title, red Reset all, 23 cards (`shots/v-first-1440d.png`, `shots/w375d-paths.png`) | Ask one question, suggest three paths, add a "show all paths" link. Move backup and reset into Help. Fix the banner wrap on mobile. |
| 9 | Medium | Fix the prose style | No em dashes, comma-carried asides, 473 uses of "arguably" (`node v-stats.js`) | Allow dashes or parentheses for asides. Do one editing pass on hedges, keeping "arguably" only where a claim really is contested. |
| 10 | Low | Fix search ranking and synonyms, and correct the README | "flow" ranks the Sprints topic first; "gdd" finds nothing; README says 21 paths and 186 topics | Rank title matches on topics above body matches. Add synonyms (gdd, balance, FTUE, juice). Generate the README counts from the data. |

## 10. Set aside

- **Legal standing of the store screenshots on game pages:** outside my role. They are credited per image.
- **Engineering correctness** of the backend, server, infrastructure and Code craft topics, and of the Godot and Unity snippets: an engineering auditor's job.
- **Performance and load time:** the first load produced no console errors. I did not measure further; it is not a design concern.
- **Accuracy of the dated platform and store facts:** needs a platform specialist.
- **The Projects section:** mostly engineering content. I only noted that one of its parts is misused in a design path.
- **Screen-reader and keyboard accessibility in depth:** scripts from the earlier run exist (`kbd.js`, `a11y.js`), but I did not re-run them, so I report nothing from them.

## 11. What I could not check, and why

- **21 of 23 paths were not walked step by step**, because of the time budget. I judged them only from two full step lists and stage 1 of Game designer foundations.
- **203 of 206 topics were not read in full.** I judged them only by word counts per domain. I depth-read only the core loop. The meaningful-decisions and business-model dumps were captured but not read closely.
- **106 of 107 game analyses were not read closely.** The thinnest by word count are Wii Sports (1,849 lens words), Deus Ex and Microsoft Flight Simulator; they may be weaker than Celeste.
- **The Celeste claim that the Assist Mode launch text was rewritten in 2019 is unverified.** A web search neither confirmed nor refuted it. It did confirm the September 2019 Farewell release. Sources: [Thumbsticks](https://www.thumbsticks.com/celeste-free-farewell-update-09062019/), [Game Developer](https://gamedeveloper.com/design/check-out-i-celeste-s-i-remarkably-granular-assist-options), [Vice](https://www.vice.com/en_us/article/d3w887/celeste-difficulty-assist-mode).
- **The core-loop critique relies on my own knowledge** of Dan Cook's skill atom ("The Chemistry of Game Design", 2007). I did not fetch the article this run.
- **Two floating buttons were not tested:** an "×" at 768 px (`shots/w768l-games_celeste.png`) and a "◂ MAP" pill at 375 px (`shots/w375l-map_t_core-loop.png`). I don't know what they do, so I report no finding on them.
- **Not re-captured this run:** reduced-motion behaviour, and 1440 light.
- **No report file:** the harness refused the write to `report.md`, so this text is the only copy.