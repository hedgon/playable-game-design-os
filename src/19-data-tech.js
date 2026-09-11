/* =====================================================================
   TECHNIQUE BREAKDOWNS (continued)
   Presentation, UX, narrative, production and meta topics. Same
   optional "Techniques to compare" section as 18-data-tech.js.
   ===================================================================== */

TECH('game-feel-and-juice',[
  {n:'Response and control feel', how:`Tune acceleration, input buffering and coyote-time so the character answers the player within milliseconds and forgives small timing errors.`, fit:`Any real-time control scheme; the foundation before adding effects.`, cost:`Over-assisting removes weight and mastery; too little feels unresponsive.`, alt:`Tune control first, then layer effects.`},
  {n:'Hitstop and impact', how:`Freeze or slow both parties for a few frames on a hit, plus a scale/pose snap, to sell weight.`, fit:`Melee, shooting and any impact that must read as powerful.`, cost:`Too much breaks flow and combos; needs per-weapon tuning.`, alt:`Vary hitstop by damage and by weapon feel.`},
  {n:'Screenshake, particles and VFX layers', how:`Compose several cheap effects (shake, flash, particles, decals, sound) on the same event.`, fit:`Making routine actions feel consequential.`, cost:`Noise competes with readability; motion sickness for some players.`, alt:`Make intensity configurable and reserve the biggest effects for rare events.`},
  {n:'Easing and animation curves', how:`Shape motion over time with non-linear curves; anticipation and follow-through imply force.`, fit:`Menus, camera, UI and character motion.`, cost:`Inconsistent curves make a game feel cheap; needs a shared vocabulary.`, alt:`A small shared easing library beats per-element improvisation.`}
]);

TECH('animation-and-vfx',[
  {n:'State-machine animation', how:`Blend between clips driven by gameplay state and transitions with blend times.`, fit:`Most character animation where states are discrete and readable.`, cost:`Transitions can pop; combinatorics grow with layered actions.`, alt:`Add blending/IK for the seams; consider motion matching for large, smooth sets.`},
  {n:'Motion matching / procedural motion', how:`Pick the best-matching pose from a database each frame, or generate motion procedurally.`, fit:`Large, fluid movement sets (locomotion, parkour) where authored transitions are too costly.`, cost:`Data-heavy, harder to control authorially, debuggability is poor.`, alt:`Keep authored clips for signature moves; motion match locomotion.`},
  {n:'Camera behaviour as design', how:`Rules for framing, follow, shake, zoom and cut that carry information and emotion.`, fit:`Tension, speed, scale and combat readability.`, cost:`A camera that fights the player is one of the worst bugs to ship; needs playtests.`, alt:`Treat camera as a first-class system with its own tuning and accessibility options.`}
]);

TECH('audio-and-music',[
  {n:'Interactive music layering', how:`Stems or transitions that add and remove layers based on game state or tension.`, fit:`Dynamic pacing, combat escalation, exploration.`, cost:`Composition and implementation cost; transitions can feel mechanical.`, alt:`Vertical layering plus a few authored stingers may be enough.`},
  {n:'Adaptive/foley and audio feedback', how:`Sound is triggered by state and carries information (material, distance, readiness).`, fit:`Readability and game feel; confirming actions and threats.`, cost:`Mix clutter; needs priority and ducking.`, alt:`Reserve the foreground for gameplay-critical cues.`},
  {n:'Mixing, ducking and accessibility', how:`Priority systems, dynamic range control and visual alternatives (subtitles, captions, haptics).`, fit:`Ensuring critical information survives any audio setup.`, cost:`Extra work; under-planned until a playtest reveals it.`, alt:`Design the information hierarchy first, then mix to it.`}
]);

TECH('visual-language',[
  {n:'Silhouette and shape language', how:`Distinct silhouettes and shape families communicate function and threat instantly.`, fit:`Readability at a glance; enemies, items, interactables.`, cost:`Constrains art direction; needs a deliberate grammar.`, alt:`Define shape rules before detailed art.`},
  {n:'Value, contrast and colour hierarchy', how:`Control contrast and colour to direct attention and encode meaning.`, fit:`Guiding the eye, marking interactables and threats, supporting accessibility.`, cost:`Stylistic constraints; a beautiful palette can bury gameplay signals.`, alt:`Do a grey-scale readability pass before colour, and colourblind checks after.`},
  {n:'Style as a promise', how:`Choose and hold a visual style that reinforces the fantasy and is deliverable.`, fit:`Positioning and cohesion across all content.`, cost:`Ambition over reach leaves an unfinished game; consistency is hard at scale.`, alt:`Pick a style the team can ship at volume.`}
]);

TECH('onboarding',[
  {n:'Teach through level design', how:`Introduce one mechanic at a time in a safe space, then test it, then combine (kishotenketsu).`, fit:`Almost all games; the strongest form of onboarding.`, cost:`Authoring cost per concept; risks over-teaching if rigid.`, alt:`A silent onboarding audit is the measurement (see the checklist).`},
  {n:'Diegetic and just-in-time prompts', how:`Explain at the moment of need, in-world, rather than front-loading a tutorial.`, fit:`Reducing friction without a wall of text.`, cost:`Easy to over-trigger and annoy; hard to get the timing right.`, alt:`Show, then prompt, then remove the prompt once demonstrated.`},
  {n:'Time-to-fun and first-session goals', how:`Measure how long until the player does the core verb and feels the core emotion; shorten it.`, fit:`Any game competing for attention; retention begins here.`, cost:`None; it is a measurement discipline.`, alt:`Instrument it; treat "first fun moment" as a metric and a design constraint.`}
]);

TECH('accessibility',[
  {n:'Input remapping and alternatives', how:`Full remapping, one-handed modes, hold-vs-toggle, and adjustable sensitivity.`, fit:`Motor accessibility; basic good practice.`, cost:`UI and testing; sometimes conflicts with tutorial prompts.`, alt:`Ship remapping early; it is expected, not optional.`},
  {n:'Perception options', how:`Subtitles, captions, colourblind palettes, high-contrast and reduced-motion modes, and audio cue visualisation.`, fit:`Sensory accessibility and clarity for everyone.`, cost:`Design and QA across states; some effects lose meaning without careful substitution.`, alt:`Design the information hierarchy so it can survive without any one channel.`},
  {n:'Assist and difficulty options', how:`Adjustable difficulty, aim assist, invulnerability, skips, and no-fail modes.`, fit:`Cognitive and motor accessibility; widening the audience.`, cost:`Design and balance; must not be hidden or framed as "lesser".`, alt:`Offer options without judgement and without breaking the intended experience for those who skip them.`}
]);

TECH('readability-and-hierarchy',[
  {n:'Information hierarchy and affordances', how:`Rank every piece of on-screen and in-world information; only the top rank should dominate.`, fit:`Action and systems-heavy games where the screen floods.`, cost:`Requires discipline; designers add information faster than they remove it.`, alt:`Cap the "always visible" set and move the rest to demand.`},
  {n:'Cognitive load budgeting', how:`Count the simultaneous demands on attention and memory, and reduce them.`, fit:`Onboarding, complex systems, and moments of high action.`, cost:`Quantifying load is heuristic; use think-aloud tests.`, alt:`Pair with the readability playtest questions.`},
  {n:'Grey box / clarity pass', how:`Do the game readable in grey boxes before art; if it fails without polish, polish will not fix it.`, fit:`Early validation of layout and feedback.`, cost:`Some feel depends on art; schedule a later feel pass.`, alt:`Clarity first, then emotion, then spectacle.`}
]);

TECH('controls-and-friction',[
  {n:'Input buffering and forgiveness', how:`Queue inputs briefly and accept small timing errors so intent is honored.`, fit:`Action games with punishing timing.`, cost:`Too much buffer causes unintended actions; tune per action type.`, alt:`Separate buffer windows for defensive vs offensive actions.`},
  {n:'Menu and interaction friction', how:`Count the steps to common tasks (equip, compare, retry, invite) and shorten them.`, fit:`Any game with menus; a hidden cause of churn.`, cost:`Shortcuts add UI complexity; needs telemetry or observation.`, alt:`Instrument the top task flows and cut steps where players actually go.`},
  {n:'Default and preset schemes', how:`Sensible defaults (invert, sensitivity, control layout) so most players never open the menu.`, fit:`Broad audiences and multiple input devices.`, cost:`Defaults that fight conventions for the genre annoy veterans.`, alt:`Default to genre convention; make the rest reachable, not required.`}
]);

TECH('narrative-agency',[
  {n:'Branching and state tracking', how:`Track choices in state (flags, variables) and let later content and dialogue read them.`, fit:`Choice-and-consequence storytelling.`, cost:`Combinatorial content cost; branches must reconverge or content explodes.`, alt:`Track state and use it for variation in delivery and consequence, not fully separate plots.`},
  {n:'Dialogue and quest systems', how:`Data-driven dialogue graphs and quest state machines with conditions and effects.`, fit:`Authoring large narrative content without code per line.`, cost:`Tooling and localization cost; brittle conditions.`, alt:`Invest in an authoring tool; writers must own the data.`},
  {n:'Emergent and systemic narrative', how:`Story emerges from systems (AI, simulation, reputation) rather than script.`, fit:`Sandboxes, sims and games where player stories are the product.`, cost:`Unreliable; you cannot guarantee a meaningful arc.`, alt:`Systemic for texture and player stories; scripted for the beats that must land.`}
]);

TECH('environmental-storytelling',[
  {n:'Set dressing and visual narrative', how:`Objects, damage and arrangement imply history and events without text.`, fit:`Worlds where the environment carries meaning and rewards attention.`, cost:`Art cost; players may miss it entirely (that is often acceptable).`, alt:`Reinforce plot-critical beats with other channels.`},
  {n:'Gating and traversal as story', how:`The path and its obstacles tell the story through what the player must do.`, fit:`Making space a narrative agent, not just a backdrop.`, cost:`Can conflict with clean level flow if overdone.`, alt:`Let environment and level design be one workflow.`},
  {n:'Diegetic audio and documents', how:`Audio logs, graffiti, signs and ambient sound convey history in-world.`, fit:`Deepening a world for players who seek detail.`, cost:`Recording/writing and localization; can slow pacing if foregrounded.`, alt:`Keep optional and out of the critical path.`}
]);

TECH('prototyping',[
  {n:'Grey-box prototyping', how:`Build the interaction with placeholder art to test the mechanic before investment.`, fit:`Testing whether the core loop is fun.`, cost:`Discipline to resist polishing; prototypes are disposable.`, alt:`Throw it away or explicitly promote with a refactor plan.`},
  {n:'Paper and physical prototypes', how:`Model the rules on paper or with tokens to test decisions in hours.`, fit:`Economies, card and board-like systems, turn structure.`, cost:`Does not test real-time feel or execution.`, alt:`Paper for decisions; digital for feel.`},
  {n:'Instrumented prototypes', how:`Expose tuning values and log every event so the prototype answers a question with data.`, fit:`Any prototype meant to test a hypothesis.`, cost:`Extra build time; log without a question is noise.`, alt:`Define the hypothesis and the signal before building (see Hypothesis-driven design).`}
]);

TECH('playtesting',[
  {n:'Silent observation', how:`Watch without explaining; log hesitation, repetition, drift, experimentation and quits with timestamps.`, fit:`Learning what players do, not what they say.`, cost:`Feels passive; needs a coding scheme to be useful.`, alt:`Pair with a short behavior-first interview.`},
  {n:'A/B and one-variable tests', how:`Change one important variable between builds and compare player behavior.`, fit:`Deciding between two designs on evidence.`, cost:`Requires enough players and controlled conditions; small samples mislead.`, alt:`Within-subject ordering with a deterministic counter.`},
  {n:'Telemetry and replay analysis', how:`Instrument choices, retries and session ends at scale; review replays for strategies.`, fit:`Confirming patterns beyond the playtest room.`, cost:`Shows what, not why; privacy and pipeline cost.`, alt:`Telemetry proposes, observation explains.`}
]);

TECH('scope-control',[
  {n:'Vertical slice', how:`Build a thin, polished, end-to-end slice that proves the full experience at production quality.`, fit:`De-risking the whole pipeline before mass production.`, cost:`Expensive; does not prove content volume.`, alt:`Slice for pipeline risk; prototype for mechanic risk.`},
  {n:'Cut list discipline and scope ladders', how:`Rank features by value/effort and pre-agree what is cut first when time runs out.`, fit:`Any fixed-date project.`, cost:`Hard to hold when a feature is loved; needs a decision owner.`, alt:`Decide the cut order while calm, before crunch.`},
  {n:'Content budget from validated value', how:`Commit content volume only after the system is shown fun and the pipeline is measured.`, fit:`Preventing content pipelines from outrunning the design.`, cost:`Slows commitment; some stakeholders want the volume promised early.`, alt:`Idea → prototype → evidence → commit.`}
]);

TECH('risk-and-dependencies',[
  {n:'Risk-first ordering', how:`Attack the riskiest assumption first; build the thing most likely to kill the project before anything comfortable.`, fit:`Every project; the core of production discipline.`, cost:`Feels backwards to stakeholders who want visible progress.`, alt:`Make the risk visible and its test small and fast.`},
  {n:'Spikes and technical prototypes', how:`Time-boxed experiments that answer one technical question and are then discarded.`, fit:`Unproven tech, platform limits, novel pipelines.`, cost:`Can become unowned production code if not discarded.`, alt:`Define the question and delete the spike after the answer.`},
  {n:'Dependency mapping and critical path', how:`Graph what depends on what; see what blocks the most and can be parallelized.`, fit:`Planning production and tooling order.`, cost:`Maps go stale; needs upkeep.`, alt:`Re-map at each milestone; keep it short.`}
]);

TECH('who-is-the-player',[
  {n:'Interviews and observation', how:`Watch matched players and ask behavior-first questions after play.`, fit:`Building the player model from reality rather than assumption.`, cost:`Time; small samples; politeness bias.`, alt:`Combine with telemetry for scale.`},
  {n:'Surveys and motivation scales', how:`Structured instruments (e.g. validated motivation scales) to compare groups.`, fit:`Measuring motivation and preference across many players.`, cost:`Self-report bias; needs careful wording.`, alt:`Treat as one input alongside behavior.`},
  {n:'Review and forum mining', how:`Cluster complaints and praise from comparable games to infer unmet wants.`, fit:`Understanding a genre's audience before building.`, cost:`Noisy; vocal minorities; needs a coding scheme.`, alt:`Use AI to cluster, a human to interpret.`}
]);

TECH('player-motivation',[
  {n:'Need mapping', how:`Map each system to the psychological need it feeds and find gaps.`, fit:`Auditing whether the loop and meta feed competence, autonomy and relatedness.`, cost:`Heuristic; needs behavioral validation.`, alt:`Pair with playtest language analysis.`},
  {n:'Flow and challenge calibration', how:`Keep challenge near skill and let players steer difficulty; watch for boredom and anxiety bands.`, fit:`Pacing moment-to-moment engagement.`, cost:`Flow-channel literalism is contested; some games live outside it on purpose.`, alt:`Use as a lens, not a law.`},
  {n:'Motivation measurement in playtests', how:`Code player language ("I figured out" vs "I got") and return behavior as evidence.`, fit:`Turning psychology claims into observable signals.`, cost:`Needs a coding scheme and enough sessions.`, alt:`Ask "why did you keep going?" at a natural stop.`}
]);

TECH('business-model',[
  {n:'Premium / one-time purchase', how:`Charge once; the design can be tuned to respect the player's time.`, fit:`Craft-driven, finite or narrative games; trust-sensitive audiences.`, cost:`Needs reach; no live revenue to fund long-term content.`, alt:`Premium plus paid expansions.`},
  {n:'Free-to-play with monetization', how:`Free entry, revenue from cosmetic, convenience or progression sales; economy design becomes central.`, fit:`Large live audiences and long retention.`, cost:`Pressure to design paywalls and grind; risks perceived manipulation and churn.`, alt:`Cosmetic-first and transparent, with no power purchase.`},
  {n:'Subscriptions / season passes / live service', how:`Recurring revenue tied to ongoing content cadence.`, fit:`Games with a content pipeline and a live team.`, cost:`Requires sustained production; punishing if cadence slips.`, alt:`Only if the team can ship on schedule indefinitely.`}
]);

TECH('platform-and-session',[
  {n:'Session-shape design', how:`Design the loop and save points around the platform's real session length (phone 3 min, couch 45 min, PC 2 h).`, fit:`Every platform choice; drives structure, save and pacing decisions.`, cost:`Multi-platform support forces compromises and separate tuning.`, alt:`Pick a lead platform and design to its session shape first.`},
  {n:'Input and posture fit', how:`Match control scheme, text size and UI density to the device and posture (one thumb, controller, desk).`, fit:`Readability and friction; mobile especially.`, cost:`Porting UI is not free; needs redesign, not scaling.`, alt:`Design for the tightest target and expand outward.`},
  {n:'Platform services integration', how:`Achievements, cloud saves, multiplayer services, and store requirements.`, fit:`Certification and expected features per platform.`, cost:`Certification and per-platform work; late integration is a common slip.`, alt:`Plan services integration as production scope, not a polish task.`}
]);
