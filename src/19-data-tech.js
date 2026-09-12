/* =====================================================================
   TECHNIQUE BREAKDOWNS (continued)
   Presentation, UX, narrative, production and meta topics. Same
   optional "Techniques to compare" section as 18-data-tech.js.
   ===================================================================== */

TECH('game-feel-and-juice',[
  {n:'Response and control feel', how:`Tune acceleration, input buffering and coyote-time so the character answers the player within milliseconds and forgives small timing errors.`, fit:`Any real-time control scheme. The foundation before adding effects.`, cost:`Over-assisting removes weight and mastery. Too little feels unresponsive.`, alt:`Tune control first, then layer effects.`},
  {n:'Hitstop and impact', how:`Freeze or slow both parties for a few frames on a hit, plus a scale/pose snap, to sell weight.`, fit:`Melee, shooting and any impact that must read as powerful.`, cost:`Too much breaks flow and combos. Needs per-weapon tuning.`, alt:`Vary hitstop by damage and by weapon feel.`},
  {n:'Screenshake, particles and VFX layers', how:`Compose several cheap effects (shake, flash, particles, decals, sound) on the same event.`, fit:`Making routine actions feel consequential.`, cost:`Noise competes with readability. Motion sickness for some players.`, alt:`Make intensity configurable and reserve the biggest effects for rare events.`},
  {n:'Easing and animation curves', how:`Shape motion over time with non-linear curves. Anticipation and follow-through imply force.`, fit:`Menus, camera, UI and character motion.`, cost:`Inconsistent curves make a game feel cheap. Needs a shared vocabulary.`, alt:`A small shared easing library beats per-element improvisation.`}
]);

TECH('animation-and-vfx',[
  {n:'State-machine animation', how:`Blend between clips driven by gameplay state and transitions with blend times.`, fit:`Most character animation where states are discrete and readable.`, cost:`Transitions can pop. Combinatorics grow with layered actions.`, alt:`Add blending/IK for the seams. Consider motion matching for large, smooth sets.`},
  {n:'Motion matching / procedural motion', how:`Pick the best-matching pose from a database each frame, or generate motion procedurally.`, fit:`Large, fluid movement sets (locomotion, parkour) where authored transitions are too costly.`, cost:`Data-heavy, harder to control authorially, debuggability is poor.`, alt:`Keep authored clips for signature moves. Motion match locomotion.`},
  {n:'Camera behaviour as design', how:`Rules for framing, follow, shake, zoom and cut that carry information and emotion.`, fit:`Tension, speed, scale and combat readability.`, cost:`A camera that fights the player is one of the worst bugs to ship. Needs playtests.`, alt:`Treat camera as a first-class system with its own tuning and accessibility options.`}
]);

TECH('audio-and-music',[
  {n:'Interactive music layering', how:`Stems or transitions that add and remove layers based on game state or tension.`, fit:`Dynamic pacing, combat escalation, exploration.`, cost:`Composition and implementation cost. Transitions can feel mechanical.`, alt:`Vertical layering plus a few authored stingers may be enough.`},
  {n:'Adaptive/foley and audio feedback', how:`Sound is triggered by state and carries information (material, distance, readiness).`, fit:`Readability and game feel. Confirming actions and threats.`, cost:`Mix clutter. Needs priority and ducking.`, alt:`Reserve the foreground for gameplay-critical cues.`},
  {n:'Mixing, ducking and accessibility', how:`Priority systems, dynamic range control and visual alternatives (subtitles, captions, haptics).`, fit:`Ensuring critical information survives any audio setup.`, cost:`Extra work. Under-planned until a playtest reveals it.`, alt:`Design the information hierarchy first, then mix to it.`}
]);

TECH('visual-language',[
  {n:'Silhouette and shape language', how:`Distinct silhouettes and shape families communicate function and threat instantly.`, fit:`Readability at a glance. Enemies, items, interactables.`, cost:`Constrains art direction. Needs a deliberate grammar.`, alt:`Define shape rules before detailed art.`},
  {n:'Value, contrast and colour hierarchy', how:`Control contrast and colour to direct attention and encode meaning.`, fit:`Guiding the eye, marking interactables and threats, supporting accessibility.`, cost:`Stylistic constraints. A beautiful palette can bury gameplay signals.`, alt:`Do a grey-scale readability pass before colour, and colourblind checks after.`},
  {n:'Style as a promise', how:`Choose and hold a visual style that reinforces the fantasy and is deliverable.`, fit:`Positioning and cohesion across all content.`, cost:`Ambition over reach leaves an unfinished game. Consistency is hard at scale.`, alt:`Pick a style the team can ship at volume.`}
]);

TECH('onboarding',[
  {n:'Teach through level design', how:`Introduce one mechanic at a time in a safe space, then test it, then combine (kishotenketsu).`, fit:`Almost all games. The strongest form of onboarding.`, cost:`Authoring cost per concept. Risks over-teaching if rigid.`, alt:`A silent onboarding audit is the measurement (see the checklist).`},
  {n:'Diegetic and just-in-time prompts', how:`Explain at the moment of need, in-world, rather than front-loading a tutorial.`, fit:`Reducing friction without a wall of text.`, cost:`Easy to over-trigger and annoy. Hard to get the timing right.`, alt:`Show, then prompt, then remove the prompt once demonstrated.`},
  {n:'Time-to-fun and first-session goals', how:`Measure how long until the player does the core verb and feels the core emotion. Shorten it.`, fit:`Any game competing for attention. Retention begins here.`, cost:`None. It is a measurement discipline.`, alt:`Instrument it. Treat "first fun moment" as a metric and a design constraint.`}
]);

TECH('accessibility',[
  {n:'Input remapping and alternatives', how:`Full remapping, one-handed modes, hold-vs-toggle, and adjustable sensitivity.`, fit:`Motor accessibility. Basic good practice.`, cost:`UI and testing. Sometimes conflicts with tutorial prompts.`, alt:`Ship remapping early. It is expected, not optional.`},
  {n:'Perception options', how:`Subtitles, captions, colourblind palettes, high-contrast and reduced-motion modes, and audio cue visualisation.`, fit:`Sensory accessibility and clarity for everyone.`, cost:`Design and QA across states. Some effects lose meaning without careful substitution.`, alt:`Design the information hierarchy so it can survive without any one channel.`},
  {n:'Assist and difficulty options', how:`Adjustable difficulty, aim assist, invulnerability, skips, and no-fail modes.`, fit:`Cognitive and motor accessibility. Widening the audience.`, cost:`Design and balance. Must not be hidden or framed as "lesser".`, alt:`Offer options without judgement and without breaking the intended experience for those who skip them.`}
]);

TECH('readability-and-hierarchy',[
  {n:'Information hierarchy and affordances', how:`Rank every piece of on-screen and in-world information. Only the top rank should dominate.`, fit:`Action and systems-heavy games where the screen floods.`, cost:`Requires discipline. Designers add information faster than they remove it.`, alt:`Cap the "always visible" set and move the rest to demand.`},
  {n:'Cognitive load budgeting', how:`Count the simultaneous demands on attention and memory, and reduce them.`, fit:`Onboarding, complex systems, and moments of high action.`, cost:`Quantifying load is heuristic. Use think-aloud tests.`, alt:`Pair with the readability playtest questions.`},
  {n:'Grey box / clarity pass', how:`Do the game readable in grey boxes before art. If it fails without polish, polish will not fix it.`, fit:`Early validation of layout and feedback.`, cost:`Some feel depends on art. Schedule a later feel pass.`, alt:`Clarity first, then emotion, then spectacle.`}
]);

TECH('controls-and-friction',[
  {n:'Input buffering and forgiveness', how:`Queue inputs briefly and accept small timing errors so intent is honored.`, fit:`Action games with punishing timing.`, cost:`Too much buffer causes unintended actions. Tune per action type.`, alt:`Separate buffer windows for defensive vs offensive actions.`},
  {n:'Menu and interaction friction', how:`Count the steps to common tasks (equip, compare, retry, invite) and shorten them.`, fit:`Any game with menus. A hidden cause of churn.`, cost:`Shortcuts add UI complexity. Needs telemetry or observation.`, alt:`Instrument the top task flows and cut steps where players actually go.`},
  {n:'Default and preset schemes', how:`Sensible defaults (invert, sensitivity, control layout) so most players never open the menu.`, fit:`Broad audiences and multiple input devices.`, cost:`Defaults that fight conventions for the genre annoy veterans.`, alt:`Default to genre convention. Make the rest reachable, not required.`}
]);

TECH('narrative-agency',[
  {n:'Branching and state tracking', how:`Track choices in state (flags, variables) and let later content and dialogue read them.`, fit:`Choice-and-consequence storytelling.`, cost:`Combinatorial content cost. Branches must reconverge or content explodes.`, alt:`Track state and use it for variation in delivery and consequence, not fully separate plots.`},
  {n:'Dialogue and quest systems', how:`Data-driven dialogue graphs and quest state machines with conditions and effects.`, fit:`Authoring large narrative content without code per line.`, cost:`Tooling and localization cost. Brittle conditions.`, alt:`Invest in an authoring tool. Writers must own the data.`},
  {n:'Emergent and systemic narrative', how:`Story emerges from systems (AI, simulation, reputation) rather than script.`, fit:`Sandboxes, sims and games where player stories are the product.`, cost:`Unreliable. You cannot guarantee a meaningful arc.`, alt:`Systemic for texture and player stories. Scripted for the beats that must land.`}
]);

TECH('environmental-storytelling',[
  {n:'Set dressing and visual narrative', how:`Objects, damage and arrangement imply history and events without text.`, fit:`Worlds where the environment carries meaning and rewards attention.`, cost:`Art cost. Players may miss it entirely (that is often acceptable).`, alt:`Reinforce plot-critical beats with other channels.`},
  {n:'Gating and traversal as story', how:`The path and its obstacles tell the story through what the player must do.`, fit:`Making space a narrative agent, not just a backdrop.`, cost:`Can conflict with clean level flow if overdone.`, alt:`Let environment and level design be one workflow.`},
  {n:'Diegetic audio and documents', how:`Audio logs, graffiti, signs and ambient sound convey history in-world.`, fit:`Deepening a world for players who seek detail.`, cost:`Recording/writing and localization. Can slow pacing if foregrounded.`, alt:`Keep optional and out of the critical path.`}
]);

TECH('prototyping',[
  {n:'Grey-box prototyping', how:`Build the interaction with placeholder art to test the mechanic before investment.`, fit:`Testing whether the core loop is fun.`, cost:`Discipline to resist polishing. Prototypes are disposable.`, alt:`Throw it away or explicitly promote with a refactor plan.`},
  {n:'Paper and physical prototypes', how:`Model the rules on paper or with tokens to test decisions in hours.`, fit:`Economies, card and board-like systems, turn structure.`, cost:`Does not test real-time feel or execution.`, alt:`Paper for decisions. Digital for feel.`},
  {n:'Instrumented prototypes', how:`Expose tuning values and log every event so the prototype answers a question with data.`, fit:`Any prototype meant to test a hypothesis.`, cost:`Extra build time. Log without a question is noise.`, alt:`Define the hypothesis and the signal before building (see Hypothesis-driven design).`}
]);

TECH('playtesting',[
  {n:'Silent observation', how:`Watch without explaining. Log hesitation, repetition, drift, experimentation and quits with timestamps.`, fit:`Learning what players do, not what they say.`, cost:`Feels passive. Needs a coding scheme to be useful.`, alt:`Pair with a short behavior-first interview.`},
  {n:'A/B and one-variable tests', how:`Change one important variable between builds and compare player behavior.`, fit:`Deciding between two designs on evidence.`, cost:`Requires enough players and controlled conditions. Small samples mislead.`, alt:`Within-subject ordering with a deterministic counter.`},
  {n:'Telemetry and replay analysis', how:`Instrument choices, retries and session ends at scale. Review replays for strategies.`, fit:`Confirming patterns beyond the playtest room.`, cost:`Shows what, not why. Privacy and pipeline cost.`, alt:`Telemetry proposes, observation explains.`}
]);

TECH('scope-control',[
  {n:'Vertical slice', how:`Build a thin, polished, end-to-end slice that proves the full experience at production quality.`, fit:`De-risking the whole pipeline before mass production.`, cost:`Expensive. Does not prove content volume.`, alt:`Slice for pipeline risk. Prototype for mechanic risk.`},
  {n:'Cut list discipline and scope ladders', how:`Rank features by value/effort and pre-agree what is cut first when time runs out.`, fit:`Any fixed-date project.`, cost:`Hard to hold when a feature is loved. Needs a decision owner.`, alt:`Decide the cut order while calm, before crunch.`},
  {n:'Content budget from validated value', how:`Commit content volume only after the system is shown fun and the pipeline is measured.`, fit:`Preventing content pipelines from outrunning the design.`, cost:`Slows commitment. Some stakeholders want the volume promised early.`, alt:`Idea → prototype → evidence → commit.`}
]);

TECH('risk-and-dependencies',[
  {n:'Risk-first ordering', how:`Attack the riskiest assumption first. Build the thing most likely to kill the project before anything comfortable.`, fit:`Every project. The core of production discipline.`, cost:`Feels backwards to stakeholders who want visible progress.`, alt:`Make the risk visible and its test small and fast.`},
  {n:'Spikes and technical prototypes', how:`Time-boxed experiments that answer one technical question and are then discarded.`, fit:`Unproven tech, platform limits, novel pipelines.`, cost:`Can become unowned production code if not discarded.`, alt:`Define the question and delete the spike after the answer.`},
  {n:'Dependency mapping and critical path', how:`Graph what depends on what. See what blocks the most and can be parallelized.`, fit:`Planning production and tooling order.`, cost:`Maps go stale. Needs upkeep.`, alt:`Re-map at each milestone. Keep it short.`}
]);

TECH('who-is-the-player',[
  {n:'Interviews and observation', how:`Watch matched players and ask behavior-first questions after play.`, fit:`Building the player model from reality rather than assumption.`, cost:`Time, small samples, politeness bias.`, alt:`Combine with telemetry for scale.`},
  {n:'Surveys and motivation scales', how:`Structured instruments (e.g. validated motivation scales) to compare groups.`, fit:`Measuring motivation and preference across many players.`, cost:`Self-report bias. Needs careful wording.`, alt:`Treat as one input alongside behavior.`},
  {n:'Review and forum mining', how:`Cluster complaints and praise from comparable games to infer unmet wants.`, fit:`Understanding a genre's audience before building.`, cost:`Noisy, vocal minorities, needs a coding scheme.`, alt:`Use AI to cluster, a human to interpret.`}
]);

TECH('player-motivation',[
  {n:'Need mapping', how:`Map each system to the psychological need it feeds and find gaps.`, fit:`Auditing whether the loop and meta feed competence, autonomy and relatedness.`, cost:`Heuristic. Needs behavioral validation.`, alt:`Pair with playtest language analysis.`},
  {n:'Flow and challenge calibration', how:`Keep challenge near skill and let players steer difficulty. Watch for boredom and anxiety bands.`, fit:`Pacing moment-to-moment engagement.`, cost:`Flow-channel literalism is contested. Some games live outside it on purpose.`, alt:`Use as a lens, not a law.`},
  {n:'Motivation measurement in playtests', how:`Code player language ("I figured out" vs "I got") and return behavior as evidence.`, fit:`Turning psychology claims into observable signals.`, cost:`Needs a coding scheme and enough sessions.`, alt:`Ask "why did you keep going?" at a natural stop.`}
]);

TECH('business-model',[
  {n:'Premium / one-time purchase', how:`Charge once. The design can be tuned to respect the player's time.`, fit:`Craft-driven, finite or narrative games. Trust-sensitive audiences.`, cost:`Needs reach. No live revenue to fund long-term content.`, alt:`Premium plus paid expansions.`},
  {n:'Free-to-play with monetization', how:`Free entry, revenue from cosmetic, convenience or progression sales. Economy design becomes central.`, fit:`Large live audiences and long retention.`, cost:`Pressure to design paywalls and grind. Risks perceived manipulation and churn.`, alt:`Cosmetic-first and transparent, with no power purchase.`},
  {n:'Subscriptions / season passes / live service', how:`Recurring revenue tied to ongoing content cadence.`, fit:`Games with a content pipeline and a live team.`, cost:`Requires sustained production. Punishing if cadence slips.`, alt:`Only if the team can ship on schedule indefinitely.`}
]);

TECH('platform-and-session',[
  {n:'Session-shape design', how:`Design the loop and save points around the platform's real session length (phone 3 min, couch 45 min, PC 2 h).`, fit:`Every platform choice. Drives structure, save and pacing decisions.`, cost:`Multi-platform support forces compromises and separate tuning.`, alt:`Pick a lead platform and design to its session shape first.`},
  {n:'Input and posture fit', how:`Match control scheme, text size and UI density to the device and posture (one thumb, controller, desk).`, fit:`Readability and friction. Mobile especially.`, cost:`Porting UI is not free. Needs redesign, not scaling.`, alt:`Design for the tightest target and expand outward.`},
  {n:'Platform services integration', how:`Achievements, cloud saves, multiplayer services, and store requirements.`, fit:`Certification and expected features per platform.`, cost:`Certification and per-platform work. Late integration is a common slip.`, alt:`Plan services integration as production scope, not a polish task.`}
]);
