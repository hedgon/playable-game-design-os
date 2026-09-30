# Review: game-links (In real games tags)

## Additions: 89 checked, 79 kept, 10 removed (edited in the game files)

Removed as stretched:
- viewfinder [lineage] vertical-slice-mvp: a jam demo growing into a game is prototyping (kept), not a shipping-quality slice
- subway-surfers [gameplay] platform-and-session: lens text is about two axes at reflex speed; no session or device claim
- fruit-ninja [replay] feature-vs-experience: session-length modes are replay variety, not feature versus experience thinking
- counter-strike-2 [ui] server-state-sync: sub-tick is input timing (the same reason server-realtime-protocol was removed), not state reaching displays
- minecraft [world] server-determinism: world seed is procedural generation, not parity of two simulations
- fortnite [lore] premise-and-world: live-event delivery is narrative pacing (kept), not the premise
- kerbal-space-program [lore] premise-and-world: a default crew roster is not world or premise
- overwatch [lore] premise-and-world: story outside the match; the lens is about marketing a story, not the world
- dark-souls [ui] animation-and-vfx: a sparse HUD is not animation
- angry-birds [sound] polish-when: one sound added in final polish is anecdote, not a when-to-polish lesson

All other 79 kept (lens text shows the topic as defined), including borderline: halo/vertical-slice-mvp, street-fighter/server-matchmaking, half-life-2/server-scaling, rocket-league/server-authority, dynasty-warriors/team-and-collaboration.

Side effects: kerbal-space-program [lore] and overwatch [lore] now have empty topics arrays (allowed by validate). server-determinism and server-state-sync have no game again.

## Removals: 60 sampled (weighted to level-structure 9, spatial-composition 12, narrative-agency 12, pacing 5, systemic-design 5, mastery 5, difficulty 3, others 9)
- Right: 59 (one, papers-please env spatial-composition, was unverifiable in the parser and treated as right)
- Wrong: 0. Restored: 0. Threshold of 10 not approached, no widening.
- Notes: level-structure is teach-test-twist (hollow-knight route network, CS2 lanes, deus-ex goal-in-view are spatial-composition, which they keep). genre-hybrids requires two composed loops; clair-obscur grafting one input verb was judged correctly removed. ugc-platforms is building inside another company's platform; mod pipelines were correctly removed.

## validate.js
No topic-count errors. Only errors: server-rollback-netcode (allowed) plus craft-gameplay-math, craft-game-loop-timestep, craft-entities-and-scenes, craft-physics-and-collision, craft-save-systems not in any learning path (new craft topics from another task, not caused by this review).
