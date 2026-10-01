# Learner audit: Playable (Game Design OS)

The full report is not in `report.md`. The harness blocked my Write call ("Subagents should return findings as text"), so `<scratch>/report.md` only holds my earlier running notes. The full report is below. Screenshots are in the same folder (prefix `r`). The `p*` and `s*` files from the interrupted run were not used as evidence.

## 1. Who I am and how I audited
I am a gamer with no programming background who has a vague wish to make a game one day. I used only the browser: Edge driven by Playwright through `driver.js`, at http://localhost:8765/playable.html. I read nothing from the repository, not even the README.
- **Laptop (1366x768, light, plus one dark check):** about 20 distinct pages. They were the front page (#/paths), How to use this site, the path chooser, the Game designer foundations path page, 8 path steps, the stage 1 checkpoint, Review, The core loop, Map, the fallback page shown at #/library, Reference games, Celeste, Diagnose, the "I do not have an idea" diagnosis, Idea Lab, AI Workflow and Projects.
- **Phone (375x812, touch):** 8 pages. They were the front page, the chooser, the path page, step 1, Library, Celeste, Behaviour Ladder, the ☰ drawer (on Library, a game page and Map) and the MORE menu.
- **Path progress:** 1 of 23 paths, 1 of 4 stages done, 8 of 31 steps marked done.
- **Lessons:** I read 2 lessons fully (Who is the player?, Player motivation) and 1 partly (The core loop). I also read 2 game lenses (Pokémon business, Celeste gameplay). I skimmed the other 4 steps and marked them done without reading them properly.
- **Tools:** I used 2 for real (Behaviour Ladder, Idea Lab first 2 steps), with the example and with my own text.
- **Checkpoint:** I opened 2 of 4 questions and added 1 to Review.
- **Searches:** 6 (boss, glossary, retention, greybox, smell, "what is a game designer").
- **Time:** about 60 minutes.

## 2. First impression (first five minutes)
- I landed on "Learning paths" (r01). Nothing on that first screen tells me in plain words what this site is or who made it. The logo says "GAME DESIGN OS · AI ERA", and "OS" and "AI era" mean nothing to me. [Confirmed, r01]
- There are seven header sections, a "Topics read 0/206" bar and a form with 9 + 3 + 3 buttons. It felt like a dashboard for professionals, not a welcome. [Opinion, r01]
- The "First time here? How to use this site" box saved me. The guide's first sentence was the first time I learned what the site is: "A guide to making games, from design to engineering to shipping." It should be on the front page. [Confirmed, r02]
- The guide's route cards are packed with words I did not know: "lens", "smells", "Reference Dissection", "dated fact", "agent rules file". [Confirmed, r02]
- The three-question chooser worked well and quickly. I picked Design games, New to it and 2 hours, and it suggested "Game designer foundations" with a reason (r03). I felt helped.

## 3. Good: what works well
- **The path chooser.** It is three taps, gives one suggestion and says why. [Confirmed, r03]
- **The "next step" banner.** It follows me across sections with my task and one big "Mark done and continue" button, so I was never lost on the path. [Confirmed, r05, r08, r09, r12]
- **Lessons explain the basic idea well.**
  - "Who is the player?" opens with a plain sentence ("A concrete person… Not 'gamers'").
  - "The core loop" has a 5-box diagram and a worked Bejeweled example. That is the first time "core loop" became clear to me.
  - [Confirmed, r05, r18]
- **The Reference games library is the best part for someone like me.**
  - 107 games I know, with box art, filters by genre and lens, and one-line hooks such as "Make every fight a person to read" (r21).
  - The Celeste page explains coyote time and jump buffering in words I understood, quotes the designer and says what the trick costs. I learned something real. [Confirmed, r22]
- **Path steps open straight at the right place.** The Pokémon step opened directly on the business lens it asked me to read. [Confirmed, r09]
- **Behaviour Ladder.** "Load the crafting example" fills every box with a convincing example, and my own text appeared live in the output (r11, r12). The tool was easy to use.
- **The checkpoint is honest and low-pressure.** "Answer in your head first, then open it", short answer outlines, and "Review later" goes into a spaced queue that says when the question comes back. [Confirmed, r14, r17]
- **Diagnose speaks my language.** The symptoms are phrased as things players say: "Combat feels floaty", "The game feels unfair", "I do not have an idea". [Confirmed, r23]
- **Phone basics are solid.** There is no horizontal scroll (scrollWidth 375 on every page I measured), lessons are readable and the banner shrinks to a "1/4 … Done ✓" strip. [Confirmed, r39, r40]
- **Dark mode on a game page is clean and readable.** [Confirmed, r35]

## 4. Bad: what is wrong, broken, confusing or weak
1. **The site never says what it is on the first screen.**
   - The front page is the paths form (r01). The one-sentence description only appears inside How to use this site (r02).
   - I could not tell who made it or why I should trust it. The Projects page talks in the first person ("I joined as one of several server engineers") and never says who "I" is (r34).
   - [Confirmed]
2. **The paths assume I already have a game project and a team.**
   - Step 1 asks for a "four-sentence sketch of your player". Later steps say "read it aloud to someone who has not seen the project" and "Take one feature you already want to build" (r04, r13).
   - The "I do not have an idea" diagnosis talks about "the team argues about genre", "the market", "incumbents" and "greybox" (r24).
   - Someone with no project is never told "pick an imaginary game first" or given a starter idea. [Confirmed]
3. **There is nowhere on the path to write the answers it asks for.** Every step task says "Write…", but the topic page has no box. My writing would have to happen in another app, and then "Mark done" means nothing. [Confirmed, r05, r08]
4. **Jargon is used before it is explained, and there is no glossary.**
   - "Core loop" appears in the stage 1 promise ("build and defend a core loop") and in Player motivation ("Which need does the core loop feed"). It is only defined in stage 2 (r18).
   - The following words were never explained anywhere I looked: smell, lens, retention, telemetry, churn, greybox / "grey boxes", heuristic, taxonomy, Bartle types, onboarding budget, cohorts, Markdown, prompt, soft launch, metrics.
   - Searching "glossary" returns nothing useful (r32). Searching "smell" returns paths, not a definition. [Confirmed]
5. **Search for "boss" does not help a game player.** The first topic result is "Memory, allocation and garbage collection". No topic is about boss design; only reference games mention bosses (r31). [Confirmed]
6. **Every lesson carries three AI sections (E, F, G).**
   - These are "What should AI do", "How should I prompt AI" and "How do I verify AI output", plus a technique comparison (r06, r07).
   - For a beginner, about half of each lesson is about using a chatbot. The prompts have "[LIST]" brackets I cannot fill without a project. [Confirmed for 2 lessons; Likely for all lessons, since the guide says every topic has the same eight parts]
7. **Godot, Unity and Interview tabs sit on every design lesson.** On "Who is the player?", tabs for programming engines look like more homework for someone who does not code. [Confirmed, r05]
8. **The ☰ ("Browse concepts") button on phone Library pages showed only a floating X.**
   - On #/games and #/games/celeste it did nothing visible (r43, r43b, r46). `document.elementFromPoint(100,400)` returned the page H1, not the drawer, although the drawer was "open" at 0,106, 323x706.
   - On Map the same button shows the drawer correctly (r44).
   - Later, after tapping MORE, a drawer was suddenly visible over the library (r47). What I see does not match the button I pressed.
   - [Confirmed it happened; why is Likely a stacking/visibility problem]
9. **On phone the Build tools put the list of 11 tools above the tool itself.** The Behaviour Ladder's first box was about 1,900 px down the page (500 px scroll plus 1,399 px). A phone visitor who opens "Behaviour Ladder" sees a menu, not the tool (r48). [Confirmed]
10. **The chooser numbers contradict themselves.** It said "Also fits: IDEA TO PROTOTYPE IN 30 DAYS (about 7 weeks)" (r03). [Confirmed]
11. **"Topics read" counts clicks, not reading.** I pressed "Mark done and continue" on Fantasy and desire, Core experience and Pillars without reading them, and they counted toward "Topics read 5/206" (r12). This is fair enough as self-report, but the label says "read". [Confirmed]
12. **The Idea Lab evidence chips are unexplained on the page.**
    - The chips are OBSERVED / REPORTED / INFERRED / HYPOTHESIZED / SIMULATED / VALIDATED. Their meaning ("simulated = AI predicted it") is only in a hover title, so a phone user never sees it (r28, r30).
    - The step's "example" button fills in a Stardew Valley answer even when I wrote about Hollow Knight. [Confirmed]
13. **The front page is long and full of jargon.**
    - Under the chooser it lists all 23 paths as large cards. They include "Netcode / game-server engineer", "Build and release engineer" and "Own architecture, checks and team when agents write code" (r01 text).
    - Most of these are irrelevant to me, and the list adds to the overwhelm. [Confirmed, Opinion on effect]
14. **On phone, the collapsed path banner on the path page has no button.** It shows "1/4 Who is the player?" with no Next (r38b), while on a lesson the collapsed strip has "Done ✓" (r40). I had to scroll back up to find "Next →". [Confirmed]

## 5. Useful: what I would actually use or come back for
- **The Reference games library.** I would come back for it, reading games I love through "The idea worth stealing" and the lenses (r21, r22).
- **The core loop topic and its diagram.** (r18)
- **Diagnose,** once I actually have a prototype and a friend says "it feels unfair". (r23)
- **The path chooser and the Game designer foundations stage list.** As a reading order they are better than anything I would find alone. (r03, r04)
- **Behaviour Ladder with the example loaded.** (r11)

## 6. Useless to me: what I would never use, or what adds nothing
- **Projects:** a backend/CI portfolio of an unnamed author (r34).
- **AI Workflow's 12-step loop:** it is about "the team" and "exit criteria" (r33).
- **Engineering, leadership and interview paths, and the Godot/Unity tabs on design lessons.** (r01, r05)
- **The "copy AI prompt" buttons and long prompt templates.** I do not have the "[CONTEXT]" or "[EVIDENCE]" to fill them. (r07, r24)
- **The "Topics read 0/206" bar in the header.** 206 is a demoralising denominator for a beginner. (r01)

## 7. Expand: what I want more of
- **A true zero-knowledge start.** "Never made a game? Start here": pick a tiny pretend game (a one-button game) and carry it through the path, so the "write your player sketch" steps have a subject.
- **A glossary with hover definitions** for every term in section 4 item 4.
- **More of the Library style inside lessons.** Every lesson should open with a game I know (as Core loop does with Bejeweled) before any framework.
- **Topics for player words.** Bosses, levels, difficulty spikes and "why this boss feels unfair" should come up when I search a player's word.
- **A text box on each path step** to write the answer, saved like the tools, so the path produces something.

## 8. Less: what I want cut or simplified
- **Hide AI sections E-G** and the engine/interview tabs behind a "more" toggle on beginner paths.
- **Shrink the front page** to: what this is, the three-question chooser, the suggestion. Move the 23-path catalogue to a link.
- **Fewer header sections for newcomers.** Seven sections, a progress bar, search, help, a grid icon and a theme toggle is too much on the first screen.
- **Drop the "OS · AI ERA" branding words,** or explain them.

## 9. Top 10 changes, ranked
1. **High: a plain "what is this, for whom, by whom" line at the top of the front page.**
   - Evidence: r01 has none; the description only appears in #/guide (r02).
   - Change: put the guide's first sentence plus "who made it" above the chooser.
2. **High: give beginners without a project something to design.**
   - Evidence: step tasks in r04 and r13 assume a project, a team and a feature; r24 talks about a team and a market.
   - Change: add a "practice game" option at the start of Game designer foundations and phrase every task as "for your game, or the practice game".
3. **High: a glossary, and definitions on first use.**
   - Evidence: "core loop" is used in stage 1 and defined in stage 2 (r18); 15+ undefined terms (section 4 item 4); searching "glossary" finds nothing (r32).
   - Change: a glossary page plus inline tooltips that also work on tap.
4. **Medium: fix the phone ☰ drawer on Library pages.**
   - Evidence: r43, r43b, r46 show only an X; elementFromPoint returned H1; the drawer appeared later after MORE (r47).
   - Change: open a visible drawer, or hide the button where no drawer applies.
5. **Medium: a place to write each path step's answer.**
   - Evidence: r05 and r08 have "Your task: Write…" and no input.
   - Change: a saved notes box under the banner, exportable like the tools.
6. **Medium: collapse AI sections E-G and the Godot/Unity/Interview tabs on beginner paths.**
   - Evidence: r05, r06, r07.
   - Change: a "beginner view" or a default-collapsed "Using AI with this" block.
7. **Medium: put the tool itself first on phone Build pages.**
   - Evidence: the Behaviour Ladder input was about 1,900 px down (r48).
   - Change: put the tool list in the ☰ drawer or below the tool.
8. **Medium: rank search results for player words toward design topics.**
   - Evidence: "boss" put "Memory, allocation and garbage collection" first among topics (r31).
   - Change: down-rank engineering topics when the visitor is on a design path, or add a boss/encounter design topic.
9. **Low: fix the chooser's "30 days (about 7 weeks)" text.**
   - Evidence: r03.
   - Change: say "30 days of work, about 7 weeks at 2 h/week", or rename the path.
10. **Low: show the Idea Lab evidence chip meanings in text** and keep the path-page collapsed banner's action button on phone.
    - Evidence: r28 and r30 (meanings only in title tooltips); r38b vs r40.
    - Change: put a one-line legend under the chips, and add the Next button to the collapsed strip.

## 10. Set aside (judged out of scope for a visitor)
- Engineering paths, Platforms, Engines, Checklists and Prompts content were not read in depth: they are not what this persona came for.
- Accuracy of the game facts (sales figures, dates, quotes): I cannot verify them as a visitor.
- The image credits and their wording ("Store art: … from the official store page"), and whether they meet licensing terms: this is a legal question, not a learner one.
- Performance and load time: the pages felt instant on localhost, which says nothing about real hosting.
- The file:// version of the site: I used the http server only.
- The Back up / Restore / Reset all progress buttons: not tried, to avoid touching state I did not need.
- Accessibility beyond what a sighted mouse/touch user sees (screen reader, keyboard order): not this persona's experience.
- How progress is stored and whether it survives across browsers: the site says "this browser only", which is enough for a visitor.
- The Projects page's privacy/anonymisation choices: not my business as a learner.

## 11. What I could not check, and why
- **Most of the path:** stages 2-4 and the other 22 paths. There was not enough time; I did 8 of 31 steps of one path.
- **Real reading time against the stated minutes (25 min, 20 min):** I skimmed via extracted text, so I cannot judge whether the minutes are honest.
- **Phone dark mode and reduced motion:** not tested.
- **Real touch gestures:** I used Playwright tap and mouse wheel, not real finger swipes, so the drawer behaviour may differ on a real phone. The ☰ result is as observed in emulation.
- **The Review queue over days:** it says a question returns after 1 day; I could not wait.
- **The cause of the ☰ drawer bug:** I did not read the source code, as the rules required.