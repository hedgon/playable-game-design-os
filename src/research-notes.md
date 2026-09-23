# Research notes: established game-design thinking (verified 2026-09-11)

Attributions below were checked via web search on 2026-09-11; sections 20 to 22 on 2026-09-23. Items marked **[unconfirmed]** could not be verified to the level of author/date and should be treated as tentative.

## 1. MDA framework and the "8 kinds of fun"
- **MDA** (Mechanics, Dynamics, Aesthetics) — Robin Hunicke, Marc LeBlanc, Robert Zubek, AAAI workshop paper 2004, growing out of GDC game-tuning workshops. Mechanics are the rules the designer writes; dynamics are the run-time behavior those rules produce; aesthetics are the emotional responses evoked in the player.
- Key asymmetry: designers build bottom-up (mechanics first), players experience top-down (aesthetics first), so designers must reason across the gap.
- The **8 kinds of fun** (LeBlanc's aesthetics vocabulary, listed in the MDA paper): Sensation, Fantasy, Narrative, Challenge, Fellowship, Discovery, Expression, Submission. The paper presents this as a non-exhaustive working taxonomy, not a closed set.
- Source: https://aaai.org/papers/ws04-04-001-mda-a-formal-approach-to-game-design-and-game-research/ ; https://en.wikipedia.org/wiki/MDA_framework

## 2. Nicole Lazzaro's "4 Keys to Fun"
- Nicole Lazzaro (XEODesign), from observational research on players' facial/emotional expressions (2004 whitepaper "Why We Play Games"). Four emotion clusters: **Hard Fun** (challenge, mastery, *fiero*), **Easy Fun** (curiosity, exploration, role-play), **People Fun** (social amusement from cooperation/competition), **Serious Fun** (meaning, changing oneself or one's world).
- Lazzaro's heuristic: best-selling games offer at least three of the four, because players rotate between them within a session.
- Source: https://www.nicolelazzaro.com/the4-keys-to-fun/

## 3. Self-Determination Theory in games
- Richard Ryan, Scott Rigby, Andrew Przybylski, "The Motivational Pull of Video Games" (Motivation and Emotion, 2006): game enjoyment and continued play are predicted by satisfaction of three basic needs — **competence**, **autonomy**, **relatedness**. Introduced the PENS (Player Experience of Need Satisfaction) measure; a 2010 follow-up (Przybylski, Rigby, Ryan) generalized the model.
- *Glued to Games* (Rigby & Ryan, 2011) popularized this for designers: clear, mastery-friendly controls and feedback (competence), meaningful choice of goals/strategies (autonomy), and cooperative social play (relatedness) matter more than surface narrative.
- Source: https://selfdeterminationtheory.org/SDT/documents/2006_RyanRigbyPrzybylski_MandE.pdf ; https://selfdeterminationtheory.org/player-experience-of-needs-satisfaction-pens/

## 4. Flow and Jenova Chen's thesis
- Mihaly Csikszentmihalyi's **flow**: absorbed, intrinsically rewarding engagement when challenge matches skill; too much challenge yields anxiety, too little yields boredom.
- Jenova Chen, MFA thesis *Flow in Games* (USC, 2006; demonstrated by the Flash game *flOw*): argues different players have different flow zones, so games should widen the zone and let players steer their own difficulty through play choices ("active DDA") rather than relying on hidden dynamic difficulty adjustment.
- Source: https://www.jenovachen.com/flowingames/Flow_in_games_final.pdf

## 5. Sid Meier: "a series of interesting decisions"
- Attributed to Meier from a 1989 GDC remark; expanded in his GDC 2012 talk "Interesting Decisions". Uninteresting decisions: ones players always resolve the same way, or by coin-flip.
- Properties of interesting decisions per the talk: **tradeoffs** (gain one thing, give up another), **situational** (the right answer depends on the current game state), **personal** (expresses a play style, e.g. cautious vs. aggressive), plus **risk vs. reward**, **short- vs. long-term**, and **persistence** of consequences. Decisions need visible consequences and enough information to choose meaningfully.
- Source: https://www.gamedeveloper.com/design/gdc-2012-sid-meier-on-how-to-see-games-as-sets-of-interesting-decisions ; https://gdcvault.com/play/1015756/Interesting

## 6. Depth vs. complexity; elegance
- **Extra Credits**, "Depth vs. Complexity" (written by James Portnow; aired Jan 2013 per episode listings): complexity is the number of rules/components a player must hold in mind; depth is the richness of meaningful decisions those rules generate. Adding features raises complexity without guaranteeing depth.
- **Elegance** (widely used definition, e.g. Justin Gary's "Designing for Elegance"): maximum depth from minimum complexity.
- **Soren Johnson** (Civ IV lead designer): "Water Finds a Crack" (Game Developer column, March 2011) — players will find and exploit any hole in a system, so designers must account for optimization behavior. **[unconfirmed]** that Johnson authored a specific "depth vs complexity" piece; his relevant confirmed writing is the Designer Notes columns.
- Source: https://www.youtube.com/watch?v=jVL4st0blGU ; https://www.designer-notes.com/game-developer-column-17-water-finds-a-crack/ ; https://justingarydesign.substack.com/p/designing-for-elegance

## 7. Raph Koster, *A Theory of Fun for Game Design* (2004)
- Fun is the pleasure of **learning and mastering patterns**; the brain is a pattern-recognizing machine, and games are puzzles that feed it.
- Boredom arrives when the pattern is fully learned (nothing left to grok), when it is too trivial to engage, or when it is too noisy to perceive at all. Designers must keep the game in the band between "already learned" and "cannot learn".
- Source: https://www.theoryoffun.com/

## 8. Jesse Schell, *The Art of Game Design: A Book of Lenses* (2008)
- The **Elemental Tetrad**: Mechanics, Story, Aesthetics, Technology — all equally important, arranged with aesthetics most visible to the player and technology least.
- The **lenses**: ~100 short question-sets ("Lens of Fun", "Lens of Curiosity", "Lens of the Elemental Tetrad") that force a designer to look at a design from one angle at a time.
- Source: https://en.wikipedia.org/wiki/Elemental_tetrad ; https://game-studies.fandom.com/wiki/The_Art_of_Game_Design:_A_Book_of_Lenses

## 9. Game feel and "juice"
- **Steve Swink**, *Game Feel* (2008): game feel = "real-time control of virtual objects in a simulated space, with interactions emphasized by polish". Three pillars — real-time control (response within ~100 ms), a simulated space with weight/collision/speed, and polish effects that emphasize without changing the simulation.
- **Jan Willem Nijman (Vlambeer)**, "The Art of Screenshake", INDIGO Classes 2013: live demo layering feedback onto a bare shooter (screen shake, hit-stop, muzzle flash, recoil, camera lerp, permanence, sound, knockback) to show how much perceived quality comes from feedback rather than rules.
- Source: https://en.wikipedia.org/wiki/Game_feel ; https://www.youtube.com/watch?v=AJdEqssNZ-U

## 10. Kishōtenketsu in Nintendo level design
- **Koichi Hayashida** (director, Super Mario 3D Land / 3D World) described Nintendo's level structure as four beats borrowed from four-panel manga and classical East Asian poetry: **introduce** a mechanic safely, **develop** it in a harder scenario, **twist** it with an unexpected reframing, **conclude** with a mastery test. First laid out in a 2012 Gamasutra interview about 3D Land; restated in a 2015 Nintendo video about 3D World.
- Each level is a self-contained ~5-minute lesson about one idea, then discarded.
- Source: https://www.gamedeveloper.com/design/the-secret-to-i-mario-i-level-design ; https://www.engadget.com/2015-03-17-super-mario-3d-world-design.html

## 11. Clint Hocking, "ludonarrative dissonance"
- Coined by Clint Hocking on his Click Nothing blog, 7 Oct 2007, critiquing *BioShock*: the game's mechanics reward Randian self-interest while its story pushes the player toward altruism, so the ludic contract and the narrative contract contradict each other.
- Source: https://clicknothing.com/2007/10/07/ludonarrative-d/

## 12. Kate Compton, "10,000 bowls of oatmeal"
- From Compton's "So you want to build a generator..." (2016): a generator can make 10,000 mathematically unique bowls of oatmeal that all read as "oatmeal". **Perceptual uniqueness** (each artifact has its own character) is the real bar; **perceptual differentiation** (this one is not the last one) is the easier, sometimes sufficient bar.
- Source: https://galaxykate0.tumblr.com/post/139774965871/so-you-want-to-build-a-generator

## 13. Game UX: Hodent, Norman, Nielsen
- **Celia Hodent**, *The Gamer's Brain* (2017; GDC talks 2015-16): game UX splits into **usability** (can players play it — measurable) and **engage-ability** (is it compelling — subjective). Her seven usability pillars: signs & feedback, clarity, form follows function, consistency, minimum workload (cognitive/memory/physical), error prevention/recovery, flexibility. Cognitive load is the budget; onboarding spends it.
- **Don Norman** (*The Design of Everyday Things*): **affordances** and signifiers — objects should communicate what can be done with them; Hodent extends this to cognitive affordances in UI.
- **Jakob Nielsen's 10 usability heuristics** (visibility of status, consistency, error prevention, recognition over recall, etc.) are commonly adapted for games but do not cover engagement or intentional difficulty.
- Source: https://celiahodent.com/gamers-brain-ux-onboarding/ ; https://ixdf.org/literature/article/the-game-ux-twist-usability-principles-for-games

## 14. Playtesting practice
- **Mike Ambinder (Valve)**, GDC 2009 "Valve's Approach to Playtesting: The Application of Empiricism": treat designs as hypotheses and playtests as experiments; favor direct observation and behavioral data over self-report, since think-aloud and surveys are useful but biased. Practical rule: watch what players do, and weigh what they say against it.
- **Richard Lemarchand**, *A Playful Production Process* (MIT Press, 2021): four phases (ideation, preproduction, full production, post-production); preproduction ends with a **vertical slice**; **concentric development** — finish core mechanics to polished quality before layering secondary systems; regular, structured playtesting throughout with observation before interview.
- **Dan Cook (Lostgarden)**, "The Chemistry of Game Design" (2007) and "Loops and Arcs" (2012): the **skill atom** — action, simulation, feedback, and the player's model update — is the fractal unit of learning in games; **loops** are repeatable mastery cycles, **arcs** are one-shot content (story, set pieces) that are consumed and not repeated.
- Source: https://www.gdcvault.com/play/1566/Valve-s-Approach-to-Playtesting ; https://mitpress.mit.edu/9780262045513/a-playful-production-process/ ; https://lostgarden.com/2007/07/19/the-chemistry-of-game-design/ ; https://lostgarden.com/2012/04/30/loops-and-arcs/

## 15. Tynan Sylvester, *Designing Games: A Guide to Engineering Experiences* (O'Reilly, 2013)
- Games are systems for generating experiences; the designer's target is **emotion**, not "fun" narrowly. **Emergence**: mechanics that interact to produce plot, character and theme in response to player decisions. **Elegance**: maximize emotional power while minimizing burden on players and the team.
- Source: https://tynansylvester.com/book/

## 16. Studio maxims
- **"30 seconds of fun"** — Jaime Griesemer (Bungie, Halo). Often misread as "one repeated loop"; Griesemer clarified (Engadget interview, 2011) that the intent was nested loops (roughly 3-second, 30-second, 3-minute) whose combinations create variety.
- **"Easy to learn, hard to master"** — Blizzard's stated philosophy (Rob Pardo, Mike Morhaime), but the line originates as **Bushnell's Law** (Nolan Bushnell, Atari): "All the best games are easy to learn and difficult to master."
- Source: https://www.engadget.com/2011-07-14-half-minute-halo-an-interview-with-jaime-griesemer.html ; https://en.wikipedia.org/wiki/Bushnell%27s_Law ; https://www.gamedeveloper.com/game-platforms/gdc-blizzard-s-core-game-design-concepts

## 17. Hypothesis-driven design
- The template "We believe [change] will [outcome] for [players] because [reason]; we'll know when [measurable signal]" comes from **Lean Startup** (Eric Ries) and **Lean UX** (Jeff Gothelf & Josh Seiden), not from a game-specific source. **[unconfirmed]**: no canonical game-design author for the exact phrasing.
- Its game analogue is Ambinder's Valve framing (design = hypothesis, playtest = experiment) and Lemarchand's "playtest with a question". Useful discipline: write the hypothesis before the playtest so the observation cannot be rationalized afterward.
- Source: https://www.thoughtworks.com/en-us/insights/articles/how-implement-hypothesis-driven-development ; https://www.stevebromley.com/blog/2011/09/01/valves-philosophy-with-user-research-in-games-habe-newell-and-mike-ambinder/

## 18. Generative AI / LLMs in design workflows (2024-2026 practitioner commentary)
- **GDC State of the Game Industry 2026** (survey of ~3,000 developers): 52% say generative AI is harming the industry (30% in 2025, 18% in 2024); 7% positive. Designers/narrative are among the most negative (63%). Yet 36% use it, mainly for research/brainstorming (81%), code assistance (47%), prototyping (35%) — not shipped assets.
- **Rez Graham** (ex-Sims 4 designer), GDC 2025 "The Human Cost of Generative AI": output is derivative of scraped work; demand for "more content" drives volume over quality; usable only if creators control training and the tool serves their workflow.
- **Raph Koster**, "Depth and Design: Contrasting Human and AI Understandings" (2024-25 talk): questions whether models can perceive systemic depth as designers do.
- Recurring practitioner pattern (Game Developer coverage, GDC panels, 2025 qualitative studies): LLMs help with brainstorming breadth, placeholders, and boilerplate; they fail on originality, cultural nuance, and taste, and over-reliance yields generic ("slop") output. Designers keep judgment by owning the first prototype, using AI to widen options rather than choose them, and validating via playtests.
- Source: https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/ ; https://www.gamedeveloper.com/business/developers-still-aren-t-warming-up-to-generative-ai ; https://gdcvault.com/play/1035183/Game-AI-Summit-The-Human ; https://www.raphkoster.com/games/presentations/depth-and-design-contrasting-ai-and-human-understandings/ ; https://pmc.ncbi.nlm.nih.gov/articles/PMC12193870/

## 19. Postmortem lessons that generalize
- **Into the Breach** (Matthew Davis, Subset Games, GDC 2019): four years of cut content; decide what to cut by whether it serves the core decision loop; steal ideas openly but re-derive them from your own constraints. https://www.gdcvault.com/play/1025772/-Into-the-Breach-Design
- **Spelunky** (Derek Yu, Boss Fight Books, 2016): finishing beats perfecting; procedural generation earned its place only once the hand-tuned "room template" hook made runs readable. https://bossfightbooks.com/products/spelunky-by-derek-yu
- **Celeste** (Maddy Thorson, GDC 2017 Level Design Workshop): hundreds of short rooms keep failure cheap; each screen teaches one movement idea; story and level design iterated together. https://www.gdcvault.com/play/1024307/Level-Design-Workshop-Designing-Celeste
- **Slay the Spire** (Mega Crit, GDC 2019 "Metrics Driven Design and Balance"): Early Access telemetry (pick rates, win rates) guided balance while designers kept the final call. https://www.gdcvault.com/play/1025731/-Slay-the-Spire-Metrics
- **Hades** (Greg Kasavin, Amir Rao, Supergiant; AIAS Game Maker's Notebook / GDC interviews): shipping in Early Access forced a playable build every few weeks and made tuning against real players routine. https://www.gamedeveloper.com/design/watch-greg-kasavin-discuss-the-development-of-supergiant-games-i-hades-i-

## 20. Quantic Foundry's Gamer Motivation Model
- Nick Yee and Quantic Foundry: twelve motivations from factor analysis of player survey data, in six pairs: **Action** (destruction, excitement), **Social** (competition, community), **Mastery** (challenge, strategy), **Achievement** (completion, power), **Immersion** (fantasy, story), **Creativity** (design, discovery). The pairs group into three clusters: Action-Social, Mastery-Achievement, Immersion-Creativity.
- Motivations are continuous scales, not exclusive types, which is why the guide places the model beside Self-Determination Theory rather than beside Bartle's types. It profiles self-reported tendencies of a player population; it does not measure a game.
- Source: https://quanticfoundry.com/2015/12/15/handy-reference/ ; https://quanticfoundry.com/2015/12/21/map-of-gaming-motivations/ ; https://quanticfoundry.com/gamer-motivation-model/

## 21. AI-era practice: agents, evals, generative characters
- **Model judges**: Zheng et al., "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena" (2023) showed strong models can approximate human preference judgements and documented position, verbosity and self-enhancement bias. The guide's rule follows: calibrate a judge against human labels and never let a model grade its own output.
- **Generative agents**: Park et al., "Generative Agents: Interactive Simulacra of Human Behavior" (UIST 2023): language-model characters with memory, reflection and planning produce believable behaviour in a sandbox. Research demos leave out the shipping constraints the guide adds (latency, cost, moderation, ratings, fallbacks).
- **Prompt injection**: the OWASP Top 10 for LLM Applications ranks prompt injection first (LLM01). A character that reads player text is exposed to it by design, hence the action allow-list checked in game code.
- Source: https://arxiv.org/abs/2306.05685 ; https://arxiv.org/abs/2304.03442 ; https://genai.owasp.org/llmrisk/llm01-prompt-injection/

## 22. Dated rules (checked 2026-09-23)
These change, so the guide keeps them as dated facts on the topics that depend on them (validate.js warns once one is a year old). Summary with sources:
- Steam rewrote its AI content disclosure survey in January 2026 (first reported 16 January): player-facing pre-generated and live-generated content is disclosed, live-generated content with its guardrails; efficiency gains from AI development tools are not covered. https://partner.steamgames.com/doc/gettingstarted/contentsurvey ; https://www.gamedeveloper.com/business/valve-tweaks-and-clarifies-ai-disclosure-rules-for-steam
- EU AI Act Article 50 transparency duties apply from 2 August 2026, with a marking grace period to 2 December 2026 for systems already on the market. https://www.goodwinlaw.com/en/insights/publications/2026/08/alerts-technology-dpc-eu-ai-act-transparency-obligations-now-in-force
- US Copyright Office, Copyright and Artificial Intelligence Part 2 (January 2025): prompts alone are not authorship. https://copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf
- SAG-AFTRA Interactive Media Agreement (July 2025): consent and disclosure for digital replicas. https://www.sagaftra.org/sag-aftra-members-approve-2025-video-game-agreement
- Loot box odds disclosure: Apple guideline 3.1.1 (since December 2017), Google Play (since May 2019), ESRB "In-Game Purchases (Includes Random Items)" (since April 2020). https://developer.apple.com/app-store/review/guidelines/ ; https://www.gamedeveloper.com/business/games-on-the-google-play-store-now-required-to-disclose-loot-box-odds ; https://www.esrb.org/blog/in-game-purchases-includes-random-items/
- FTC and Cognosphere (Genshin Impact), January 2025: $20 million; no loot box sales to under-16s without parental consent. https://www.ftc.gov/news-events/news/press-releases/2025/01/genshin-impact-game-developer-will-be-banned-selling-lootboxes-teens-under-16-without-parental
- Amended COPPA Rule: full compliance from 22 April 2026. https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule
- Epic v. Apple, Ninth Circuit, 11 December 2025: contempt upheld; on the US App Store Apple may not block links to outside purchases but may stop them being more prominent than its own buttons; a total commission ban was overbroad, and a commission limited to genuine link-handling costs went back to the district court. Supreme Court review granted 30 June 2026, limited to the first question of Apple's petition (No. 25-1311). https://cdn.ca9.uscourts.gov/datastore/opinions/2025/12/11/25-2935.pdf ; https://www.supremecourt.gov/docket/docketfiles/html/public/25-1311.html

## Contested / heuristics, not laws
- **Bartle's player types** (Achievers/Explorers/Socializers/Killers, 1996) came from text MUDs and were never empirically validated as exclusive types; Nick Yee's factor-analytic motivations and Quantic Foundry's model treat motivations as continuous scales. Use as vocabulary, not segmentation.
- **Flow-channel literalism**: researchers note no consensus definition of flow in games and frequent conflation with immersion or enjoyment; deliberately frustrating, meditative, or narrative games sit outside a challenge/skill band on purpose.
- **What "fun" is**: Koster (learning), Lazzaro (four emotion clusters), LeBlanc (eight aesthetics, explicitly non-exhaustive), Meier (decisions), Sylvester (emotion, not fun) — complementary lenses, not a single theory.
- **"30 seconds of fun"** is routinely quoted to mean the opposite of Griesemer's intent.
- **"Easy to learn, hard to master"** is a slogan, not a method; it does not say how.
- **Depth vs. complexity** is a useful vocabulary but has no agreed metric; "elegance" is a value judgment.
- **Ludonarrative dissonance** is sometimes a deliberate expressive tool, not always a defect.
- **SDT and flow** are backed by research; most designer frameworks (MDA, tetrad, lenses, 4 keys) are practitioner heuristics and should be presented as such.
