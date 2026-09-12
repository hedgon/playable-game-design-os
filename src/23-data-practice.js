/* =====================================================================
   PRACTICE (part 2): build health, launch, live operations, localization,
   ethics. Plus the smells that tie the studio layer into the diagnostics
   and the technique breakdowns for every new topic.
   ===================================================================== */

T('quality-and-build-health',{ d:'studio', t:'Quality assurance and build health', tag:'A game that cannot be played cannot be tested. Keep a build that runs, and triage bugs by whether they block evidence.',
  what:`Keeping the game playable enough to learn from: a regular playable build, bug triage by severity and by whether a bug blocks testing, regression tracking back to the change that caused it, and technical debt measured against how fast the team can still iterate.`,
  why:[`A broken build stops the evidence loop, and the evidence loop is the design process.`,`Bugs that block the core loop matter more than cosmetic bugs, yet the opposite is often prioritized.`,`Regressions quietly erase work that was already validated.`],
  think:{ q:[`Can a designer get a playable build today?`,`Which bugs block the core loop or a specific test?`,`What regressed since the last known-good build, and which change caused it?`,`What technical debt is slowing iteration right now?`],
    trade:[`Cleaning everything is slow. Ignoring debt is slower.`,`Fixing and adding at once increases risk. A short freeze protects the next test.`],
    traps:[`Prioritizing cosmetic bugs over blocking ones.`,`No build cadence, so testing waits on a lucky merge.`,`No regression check, so the same bug returns.`,`It works on my machine.`],
    good:[`A playable build on a known cadence.`,`A known-broken list the testers understand.`],
    bad:[`Testers cannot reach the new system.`,`The same bug returns after every milestone.`] },
  how:[`Keep a named playable build and a cadence for producing it.`,`Triage bugs as blocker, loop, or cosmetic, and fix blockers first.`,`Log regressions with the change that caused them.`,`Budget debt paydown against iteration speed, not against taste.`],
  ai:{ yes:[`Cluster crash and error logs and draft a triage list.`,`Summarize a regression report and link symptoms to likely causes.`,`Write test cases for a specific rule or system.`],
       no:[`Decide what ships with a known defect.`] },
  prompts:[{l:'Triage pass',p:`Here are our open bugs with severity and area: [LIST]. Our current test goal is: [GOAL]. Order the list by whether each bug blocks the goal or the core loop, then by severity. Name any bug marked cosmetic that actually blocks evidence.`},{l:'Regression hunt',p:`Between build [A] and build [B], these changes landed: [CHANGES]. These symptoms appeared: [SYMPTOMS]. Propose the most likely causes in order, and the smallest check for each to confirm or rule it out.`}],
  verify:[`Is there a playable build right now?`,`Is every blocker assigned and tracked?`,`Is the latest regression linked to a change?`],
  test:[`Ask a designer to reach the newest system in a build. If they cannot, the build has failed before any player sees it.`],
  rel:[['playtesting','A test needs a build that reaches the thing being tested.'],['iteration-and-evidence','Build health is what keeps iteration possible.'],['risk-and-dependencies','Unstable foundations are a risk you must retire early.'],['ai-for-playtest-analysis','Clean builds make AI analysis of logs and replays meaningful.']] });

T('launch-and-discoverability',{ d:'product', t:'Launch and discoverability', tag:'A game nobody finds is not a game. The store page is the first level.',
  what:`How players discover and choose the game: the store page and capsule, wishlists, the demo, festivals and streamer moments, the trailer, and the first impression. Discoverability is a design constraint because it decides what the first minute has to prove.`,
  why:[`Most games fail on discovery, not on craft.`,`The store page is where the game is judged before it is played, and it must match the real hook.`,`Wishlists and demos convert attention into launch volume.`,`The first impression sets what the game is allowed to be.`],
  think:{ q:[`Can a stranger explain the hook from the capsule alone?`,`Does the page promise what the first ten minutes deliver?`,`What does the first minute of the trailer show the player doing?`,`Which beats build an audience before launch, and which are too late?`],
    trade:[`A bold capsule wins clicks and can mislead. An honest one converts fewer and keeps them.`,`Marketing spends time that could be spent making the game better, and without it the game is unseen.`],
    traps:[`Marketing that describes a different game.`,`Launching with no audience built beforehand.`,`Treating the store page as an afterthought.`,`A trailer that shows nothing the player actually does.`],
    good:[`A fan can say what the game is from the capsule.`,`Wishlists grow before launch and the demo converts them.`],
    bad:[`Nobody can tell what the game is.`,`The page is a feature list.`] },
  how:[`Write the hook as one sentence and keep it honest.`,`Build the capsule around the core verb.`,`Make a demo or a festival beat that shows the loop.`,`Grow wishlists and test the page language as you go.`,`Align the page, the trailer and the first minute.`],
  ai:{ yes:[`Draft store copy and trailer beat sheets.`,`Generate capsule concepts and A/B variants.`,`Mine reviews of comparables for the language players actually use.`],
       no:[`Decide the hook.`,`Promise something the game does not deliver.`] },
  prompts:[{l:'Hook and page',p:`Here is our game, its player and its core loop: [CONTEXT]. Write one hook sentence a stranger could repeat, a short store description that promises only what the first ten minutes deliver, and a list of the three things a trailer must show. Mark anything you were unsure of.`},{l:'Discoverability plan',p:`Our genre, platform and timeline are: [CONTEXT]. List the realistic beats that could build an audience before launch, ordered by cost and expected effect, and the one demo or festival moment that would best show our loop.`}],
  verify:[`Does the page promise match the first minutes of play?`,`Is the hook mechanical rather than a theme?`],
  test:[`Show the capsule to ten matched players. Can they say what the game is and what they would do in it?`],
  rel:[['audience-and-positioning','Discoverability tests the positioning in public.'],['business-model','The store page states the model before players commit.'],['learning-from-success','Comparables show how similar games were framed.'],['onboarding','The first minute must deliver on the page promise.']] });

T('live-operations',{ d:'product', t:'Post-launch and live operations', tag:'Release is a milestone, not a finish line. Decide what the game becomes after players arrive.',
  what:`What happens after launch: update cadence, balance and bug patches, seasons or events, community and support, and how ongoing content funds itself. A premium game, an update-driven game and a live-service game need different post-launch designs.`,
  why:[`Players find balance and exploit problems that testing missed.`,`Post-launch decisions are still design decisions, and they change what the game is.`,`Promising ongoing support is a design commitment, not a marketing line.`],
  think:{ q:[`What does the first update fix, and what does it add?`,`What cadence can the team actually sustain?`,`How do players report problems, and who answers?`,`Does the content model fund the updates?`,`What do we owe the players who arrived first?`],
    trade:[`Live content retains players and risks a treadmill, fatigue and scope.`,`Fast patches are responsive and can thrash the balance.`],
    traps:[`Launching a live plan with no capacity to run it.`,`Nerfing in silence.`,`Ignoring the community.`,`Monetizing the fix for a problem the design created.`],
    good:[`A realistic cadence.`,`A channel for feedback.`,`Updates that keep the original promise.`],
    bad:[`Radio silence.`,`Contradictory patches.`,`A roadmap nobody can build.`] },
  how:[`Plan the first ninety days before launch.`,`Separate fixes from features and say which a patch is.`,`Set a cadence you can keep and protect it.`,`Give players a channel and answer it visibly.`,`Watch the same signals you watched before launch and decide with the evidence.`],
  ai:{ yes:[`Cluster community feedback and summarize sentiment.`,`Draft patch notes and update plans.`,`Simulate balance changes against player data.`],
       no:[`Decide what to change in response to the community.`] },
  prompts:[{l:'First update plan',p:`Here is our launch state, player feedback and team capacity: [CONTEXT]. Propose the first update split into fixes and additions, each with the player problem it addresses and the signal you would watch to know it worked. Flag anything the cadence cannot sustain.`}],
  verify:[`Does the promised cadence match the team?`,`Is there a feedback channel and an owner?`],
  test:[`Publish patch notes for one planned update. Can a player tell what changed and why?`],
  rel:[['business-model','The model determines what post-launch has to fund.'],['metrics-and-success','Post-launch you decide with the same signals.'],['launch-and-discoverability','The first players set the community tone.'],['iteration-and-evidence','Live updates are iterations on a larger stage.']] });

T('localization-and-culture',{ d:'product', t:'Localization and culturalization', tag:'Text, layout and meaning all change between languages and markets. Design for it before it is expensive.',
  what:`Designing text, interface and content to survive translation and cultural change: string expansion and contraction, gendered and plural grammar, text baked into images or spoken aloud, right-to-left layout, icons and colours that carry meaning, and the platform or age requirements of each market.`,
  why:[`English layout assumptions break in German and shrink in Chinese.`,`Meaning does not always translate, and references can fail or offend.`,`Retrofitting localization costs far more than designing for it.`,`A market can refuse a launch for a rating or payment reason.`],
  think:{ q:[`How much can this string grow, and does the layout absorb it?`,`Is the meaning in text, in an icon, or in a voice line?`,`What in our art or writing is culture-specific?`,`What does each target market require for rating, language and payment?`,`Who approves the translated tone?`],
    trade:[`Designing for all languages constrains voice and layout.`,`Localizing everything costs and reaches more players.`],
    traps:[`Text baked into images.`,`Hard-coded grammar assumptions.`,`Symbols and colours treated as universal.`,`Translation started at the end.`],
    good:[`Layouts survive the longest translation.`,`Tone guides exist and strings are externalized.`],
    bad:[`The interface breaks in German.`,`Jokes fall flat.`,`A market cannot launch for a rating reason.`] },
  how:[`Externalize every string.`,`Budget for text expansion and test the longest language.`,`Annotate context for translators, including tone and speaker.`,`Use locale-aware formatting for numbers, dates and currency.`,`Check platform and rating requirements early.`],
  ai:{ yes:[`Pre-translate drafts and flag expansion risk.`,`Explain cultural references and adapt tone against a guide.`,`Generate pseudo-localized strings to test layout.`],
       no:[`Sign off the final localized tone or the cultural fit.`] },
  prompts:[{l:'Localization prep',p:`Here are our UI strings and their layout constraints: [LIST]. For each, state the maximum expansion the layout allows, whether the meaning depends on grammar, gender or word order, and the terms that need a glossary entry. Flag strings whose meaning is carried by an image or a voice line.`}],
  verify:[`Are all strings externalized?`,`Has the longest target language been tested in layout?`,`Are platform and rating requirements known?`],
  test:[`Pseudo-localize every string with a longer language and open every screen. Note what overflows or clips.`],
  rel:[['ux-as-design','Localization is a layout and information problem.'],['readability-and-hierarchy','Translation changes the length and weight of everything.'],['premise-and-world','Cultural references live in the writing and the art.'],['platform-and-session','Markets bring their own platform and rating rules.']] });

T('ethics-and-responsibility',{ d:'product', t:'Ethics and responsibility', tag:'Dark patterns, compulsion and data are design decisions. Make them on purpose, or make them by accident.',
  what:`The ethical constraints a design chooses: monetization that respects the player, engagement versus compulsion, gambling-like mechanics, data and privacy, representation, and honest claims. Treat these as constraints in the same family as scope or platform, applied early rather than reviewed at the end.`,
  why:[`The same loop that retains can manipulate, and the difference is whether the player would endorse it knowing the design.`,`Player trust is a long-term asset and a short-term temptation.`,`Regulation and platform rules keep moving, so designing late means costly rework.`],
  think:{ q:[`Would the player consent to this design if they could see it?`,`Does this pressure the player or inform them?`,`Does it respect their time, money and data?`,`Who is excluded or stereotyped by the defaults?`,`Does the store promise match what the game does?`],
    trade:[`Respectful design can earn less per player and more trust.`,`Aggressive design can earn more now and cost the audience later.`],
    traps:[`Fear of missing out used as the retention engine.`,`Reward mechanics that blur their own value.`,`Pay to skip a problem the design created.`,`Opaque data use.`,`Default characters who quietly exclude.`],
    good:[`The model is explainable and the player would accept it.`,`The values sit next to the pillars.`],
    bad:[`The game is easier to describe as a habit than as an experience.`] },
  how:[`Write the design values next to the pillars.`,`Review the monetization loop for pressure rather than value.`,`Make odds and data use explicit.`,`Watch the target player for discomfort in a test.`,`Revisit before launch and at each update.`],
  ai:{ yes:[`Stress-test a loop for manipulative patterns.`,`Draft clear disclosure copy.`,`Review content and defaults for representation gaps.`,`Flag regulation risk as a starting point.`],
       no:[`Decide the ethical line.`,`Claim legal compliance.`] },
  prompts:[{l:'Ethics stress test',p:`Here is our loop, monetization and data flow: [CONTEXT]. Identify where the design pressures rather than informs, where a player might feel misled or ashamed, and where the defaults exclude or stereotype. For each, propose the smallest change that keeps the experience and removes the pressure.`}],
  verify:[`Can the model be explained to a player without embarrassment?`,`Are odds and data use disclosed?`,`Were the defaults reviewed for representation?`],
  test:[`Describe the loop to a matched player without defending it. Note hesitation, discomfort or a sense of being tricked.`],
  rel:[['business-model','The model is where most ethical pressure is designed in.'],['player-motivation','Compulsion and intrinsic motivation pull in opposite directions.'],['return-and-quit','Players eventually leave the loop they do not endorse.'],['design-pillars','Values belong beside the pillars, not in a review at the end.']] });

/* ---------- smells that connect the studio layer to the diagnostics ---------- */
SMELLS.push(
  { id:'pillars-are-slogans', t:'The pillars cannot decide anything', dom:['studio','experience'],
    sym:`The values are generic, every feature can be justified, and arguments are settled by seniority rather than by the game's intent.`,
    causes:[
      {c:'Pillars written as values any game could claim', top:'design-pillars', exp:`Rewrite each pillar as something it forbids. A pillar with no cost is a slogan.`},
      {c:'No non-goals, so the game grows in every direction', top:'scope-control', exp:`Write the non-goals next to the pillars and cut features that violate them.`},
      {c:'Features that contradict the pillars survive', top:'feature-vs-experience', exp:`Run the current feature list through the pillars and flag the contradictions.`}],
    prompt:`Here are our design pillars and our current feature list: [PILLARS, FEATURES]. For each feature, say which pillar it serves or violates. Then name the decisions our pillars cannot resolve and rewrite the weakest pillar so it forbids something concrete.` },
  { id:'docs-nobody-reads', t:'The documents are stale or ignored', dom:['studio'],
    sym:`Three documents disagree about the core loop, the design lives in chat, and new people keep asking what the game is.`,
    causes:[
      {c:'Documents written once and never updated', top:'design-documents', exp:`Keep a living decision log and retire documents that stopped being true.`},
      {c:'A heavy specification the team stopped reading', top:'design-documents', exp:`Cut the document to the decisions the reader needs, then test it on someone new.`},
      {c:'No single source of truth', top:'team-and-collaboration', exp:`Name one owner and one canonical document per decision area.`}],
    prompt:`Here are our design documents and recent decisions: [DOCUMENTS]. List every contradiction between documents, every settled decision with no record, and the three documents that could be replaced by one living page.` },
  { id:'vanity-metrics', t:'We measure what is easy, not what matters', dom:['studio','product'],
    sym:`Dashboards show big numbers nobody acts on, no metric names the behaviour the design expects, and no baseline exists.`,
    causes:[
      {c:'No success criterion before the change', top:'metrics-and-success', exp:`Pre-register the signal and the kill criterion with every hypothesis.`},
      {c:'Measuring a proxy a player can game', top:'metrics-and-success', exp:`Pair every proxy with the outcome it is meant to stand for.`},
      {c:'Reporting a number with no decision attached', top:'iteration-and-evidence', exp:`Every report ends with the decision it did or did not change.`}],
    prompt:`Here are the metrics we report and the decisions they supposedly inform: [LIST]. For each, say what behaviour it actually measures, how it could be gamed, and whether it is leading or lagging. Cut every metric with no decision attached.` },
  { id:'scope-outruns-plan', t:'The plan is a feature list with dates', dom:['studio','production'],
    sym:`Every milestone is a tally of features, the riskiest work is scheduled last, there is no buffer, and the cut list is decided in a panic.`,
    causes:[
      {c:'Milestones defined as feature counts', top:'planning-and-milestones', exp:`Define each milestone by the question it answers and its exit criterion.`},
      {c:'Estimating in optimism with no buffer', top:'planning-and-milestones', exp:`Estimate in ranges and state the buffer explicitly.`},
      {c:'No pre-agreed cut list', top:'scope-control', exp:`Agree what goes first before the schedule is tight.`}],
    prompt:`Here is our milestone plan: [PLAN]. Identify milestones that are feature counts rather than questions, work scheduled after the risk it depends on, and the absence of a buffer. Propose a risk-first ordering and a pre-agreed cut list.` },
  { id:'testers-cannot-play', t:'No playable build to test', dom:['studio','production'],
    sym:`A designer cannot get a build that runs, testers cannot reach the new system, and the same bug returns after every merge.`,
    causes:[
      {c:'No playable build cadence', top:'quality-and-build-health', exp:`Name a build and a cadence, and protect them.`},
      {c:'Bugs triaged by visibility rather than by blocked evidence', top:'quality-and-build-health', exp:`Triage blockers first, cosmetics last, no matter how loud each is.`},
      {c:'Regressions not linked to their change', top:'iteration-and-evidence', exp:`Log each regression against the change that caused it.`}],
    prompt:`Here is our open bug list and current test goal: [LIST, GOAL]. Order the bugs by whether they block the goal or the core loop, and name the cosmetic bugs that are actually blocking evidence.` },
  { id:'invisible-launch', t:'Nobody can tell what the game is', dom:['product'],
    sym:`The capsule and store page describe a different game, launch arrives with no audience, and the hook is a feature list.`,
    causes:[
      {c:'No one-sentence hook', top:'launch-and-discoverability', exp:`Write the hook as one sentence a stranger could repeat, and make the capsule show it.`},
      {c:'The page promises what the first ten minutes do not deliver', top:'launch-and-discoverability', exp:`Test the page against the first minutes and cut every promise the build does not keep.`},
      {c:'No audience built before launch', top:'audience-and-positioning', exp:`Pick the beats that build wishlists before release and work them early.`}],
    prompt:`Here is our store copy, capsule description and first ten minutes: [CONTEXT]. Identify every promise the build does not keep, then rewrite the hook so it is mechanical and true to the first minute.` },
  { id:'launch-and-abandon', t:'A live plan with no capacity', dom:['product','studio'],
    sym:`The roadmap promises seasons the team cannot build, feedback goes unanswered, and patches contradict each other.`,
    causes:[
      {c:'Post-launch promised without staffing it', top:'live-operations', exp:`Set a cadence the team can keep, then promise only that.`},
      {c:'No channel for player feedback', top:'live-operations', exp:`Give players a channel and an owner who answers it.`},
      {c:'Monetization that funds nothing players can feel', top:'business-model', exp:`Connect each revenue stream to something the player can see and value.`}],
    prompt:`Here is our post-launch plan and our team capacity: [CONTEXT]. Flag everything the cadence cannot sustain and rewrite the plan so every promise maps to capacity and to something the player can feel.` },
  { id:'english-shaped-ui', t:'The interface breaks in other languages', dom:['product','ux'],
    sym:`Text overflows its button in German, grammar assumptions break, meaning is baked into images, and translation starts last.`,
    causes:[
      {c:'Strings not externalized', top:'localization-and-culture', exp:`Externalize every string and test with pseudo-localization.`},
      {c:'Layouts do not budget for expansion', top:'localization-and-culture', exp:`Design for the longest language, not the current one.`},
      {c:'Culture-specific references treated as universal', top:'premise-and-world', exp:`Mark references that will not translate and decide their replacement.`}],
    prompt:`Here are our screens and strings: [LIST]. For each screen, give the maximum expansion the layout allows, which strings depend on grammar or word order, and which meaning is carried by an image or voice line rather than text.` },
  { id:'pressure-not-want', t:'Retention by pressure, not by want', dom:['product','player'],
    sym:`Players return to avoid losing progress rather than because they want to play, and the model is hard to describe without the word trap.`,
    causes:[
      {c:'The loop pressures rather than informs', top:'ethics-and-responsibility', exp:`Remove the pressure and check whether the loop still retains.`},
      {c:'A model that pays for a problem the design created', top:'ethics-and-responsibility', exp:`Fix the design problem instead of selling the skip.`},
      {c:'Engagement measured without asking whether the player would endorse it', top:'metrics-and-success', exp:`Add a signal for regret and for voluntary return, not only for return.`}],
    prompt:`Here is our retention loop and monetization: [CONTEXT]. Identify where the design pressures rather than informs, propose the smallest change that keeps the experience and removes the pressure, and name the signal that would show players are returning by choice.` }
);

/* ---------- technique breakdowns for the new topics ---------- */
TECH('design-pillars',[
  {n:'Pillar set', how:`Two to four statements of what must always hold, each with what it forbids.`, fit:`New projects and any team larger than two people.`, cost:`Aims the whole project and excludes options.`, alt:`A single sentence of intent when the project is tiny.`},
  {n:'Non-goals list', how:`The adjacent experiences and features the game deliberately refuses.`, fit:`Projects with scope pressure from every direction.`, cost:`Requires saying no to appealing ideas up front.`, alt:`A written cut list at the first scheduling crunch.`},
  {n:'Decision test', how:`Replay five current disputes against the pillars and rewrite any that cannot resolve them.`, fit:`Auditing an existing, inherited pillar set.`, cost:`Reopens decisions people considered settled.`, alt:`Run the test once per milestone.`}
]);
TECH('design-documents',[
  {n:'One-pager', how:`A single page: player, fantasy, pillars, hook, comparables, biggest open question.`, fit:`Pitches, alignment, and any new collaborator.`, cost:`Forces every claim to be short enough to be testable.`, alt:`A pitch deck when a live audience is expected.`},
  {n:'Living design doc', how:`The current rules and intent, updated when a decision changes, never a write-once bible.`, fit:`An active team that needs one truth.`, cost:`Needs an owner or it goes stale.`, alt:`A decision log plus the prototype for small teams.`},
  {n:'Decision log', how:`Date, decision, reason, and what would reverse it.`, fit:`Any project longer than a month.`, cost:`Discipline to write it after each call.`, alt:`Meeting summaries with owners, if they are actually kept.`}
]);
TECH('metrics-and-success',[
  {n:'Leading indicators', how:`Behaviour inside a session, such as completion, retries, and time to first decision.`, fit:`Changes you need to read within a week.`, cost:`Do not directly show retention.`, alt:`Pair each leading signal with the lagging outcome it predicts.`},
  {n:'Cohort analysis', how:`Compare groups by when they joined rather than one blended average.`, fit:`Retention and any change that ships to everyone over time.`, cost:`Needs enough players per cohort to read.`, alt:`Use matched test groups for small samples.`},
  {n:'Pre-registered hypothesis', how:`Write the signal and the kill criterion before the change ships.`, fit:`Every design change with a measurable claim.`, cost:`Removes the freedom to reinterpret results afterward.`, alt:`Log the decision and its expected signal in the decision log.`}
]);
TECH('team-and-collaboration',[
  {n:'Responsibility map', how:`For each task, who decides, who builds, who reviews, and the handoff artifact.`, fit:`Teams where decisions stall or duplicate.`, cost:`Exposes ownership gaps people avoided.`, alt:`A one-page team charter for very small teams.`},
  {n:'Cross-discipline review', how:`Each discipline asks the same question of the work: does it serve the shared target?`, fit:`Preventing local optimization.`, cost:`Meeting time and some friction.`, alt:`Asynchronous review notes against the pillars.`},
  {n:'Handoff artifact', how:`The document or spec that travels with the work between roles.`, fit:`Any handoff where intent is lost.`, cost:`Writing it takes time the author would rather spend building.`, alt:`A recorded walkthrough for one-off cases.`}
]);
TECH('planning-and-milestones',[
  {n:'Risk-first ordering', how:`Sequence work so the biggest unknown is tested earliest.`, fit:`All projects, especially those with unproven systems.`, cost:`Delays visible progress on features.`, alt:`A timeboxed spike for the single riskiest assumption.`},
  {n:'Estimate ranges', how:`Give each task a low and high estimate, then add an explicit buffer.`, fit:`Honest scheduling and renegotiation.`, cost:`Harder to communicate than a single date.`, alt:`Reference-class estimates from past similar work.`},
  {n:'Pre-agreed cut list', how:`Decide, in calm conditions, what is removed first if time runs short.`, fit:`Protecting the core when the schedule tightens.`, cost:`Requires saying no to features people love.`, alt:`Scope tiers, with the outer tier explicitly optional.`}
]);
TECH('quality-and-build-health',[
  {n:'Playable build cadence', how:`A build that runs on a known schedule, named and available to testers.`, fit:`Any project doing regular playtests.`, cost:`Engineering time to keep it green.`, alt:`A daily automated build with a known-broken list.`},
  {n:'Blocker-first triage', how:`Classify bugs by whether they block the current test goal or the core loop, then by severity.`, fit:`Small teams with more bugs than time.`, cost:`Cosmetic complaints stay open longer.`, alt:`A rotating bug budget alongside feature work.`},
  {n:'Regression log', how:`Every reappearing bug recorded against the change that caused it.`, fit:`Projects with frequent merges.`, cost:`Overhead on every fix.`, alt:`A smoke test that exercises the core loop before testers see a build.`}
]);
TECH('launch-and-discoverability',[
  {n:'Hook sentence', how:`One mechanical sentence a stranger could repeat.`, fit:`Capsule, page and press together.`, cost:`Forces the game to have one clear idea.`, alt:`A positioning statement from the comparables.`},
  {n:'Demo beat', how:`A short playable or festival moment that shows the loop rather than the story.`, fit:`Building wishlists before launch.`, cost:`Content that must be maintained and kept current.`, alt:`A trailer built from real gameplay when no demo is possible.`},
  {n:'Wishlist funnel', how:`Track where attention comes from and how it converts to wishlists and then sales.`, fit:`Any game with a marketing runway.`, cost:`Ongoing measurement and page iteration.`, alt:`Listen to comparables and festival feedback when the audience is small.`}
]);
TECH('live-operations',[
  {n:'First-90-days plan', how:`Fixes and additions mapped to the first quarter after launch.`, fit:`Every launch, premium included.`, cost:`Commits capacity after the launch push.`, alt:`A smaller hotfix plan when live content is not intended.`},
  {n:'Feedback channel', how:`One visible place where players report problems and one owner who answers.`, fit:`Building trust and catching issues early.`, cost:`Triage load and expectation management.`, alt:`A public changelog and a monitored community thread.`},
  {n:'Update cadence', how:`A rhythm of patches and content that the team can actually sustain.`, fit:`Live games and update-driven games.`, cost:`Promise made in public.`, alt:`Milestone-sized updates rather than a fixed clock.`}
]);
TECH('localization-and-culture',[
  {n:'String externalization', how:`All display text separated from code and layout.`, fit:`Any game that may ship in more than one language.`, cost:`Up-front engineering and discipline.`, alt:`A late extraction pass for tiny projects, at higher cost.`},
  {n:'Pseudo-localization', how:`Replace strings with a longer, accented version to test layout before translation.`, fit:`Catching overflow early and cheaply.`, cost:`Another build variant to maintain.`, alt:`Design with the longest known language in mind.`},
  {n:'Cultural review', how:`A pass on references, symbols, colours and representation per target market.`, fit:`Markets and content where meaning is not universal.`, cost:`Slows a launch and can require art changes.`, alt:`Flag risky content and localize only what is necessary.`}
]);
TECH('ethics-and-responsibility',[
  {n:'Consent test', how:`Ask whether the player would endorse the design if they could see it.`, fit:`Reviewing monetization and engagement loops.`, cost:`Kills some profitable ideas.`, alt:`A written values statement beside the design pillars.`},
  {n:'Disclosure', how:`Explicit odds, data use and honest claims.`, fit:`Randomized rewards, currencies and personal data.`, cost:`Can reduce conversion in the short term.`, alt:`Plain-language summaries alongside the legal text.`},
  {n:'Representation review', how:`Check the defaults, characters and content for who is included or stereotyped.`, fit:`Any content with characters or player identity.`, cost:`Requires care and sometimes redesign.`, alt:`A diverse review group before content is locked.`}
]);
