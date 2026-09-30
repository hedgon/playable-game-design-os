# New topics, batch sd (senior designer)

Validate: only "not in any learning path" for the four new ids. check-layout: 0 overlaps. No Godot or dotnet on this machine, so snippets were checked by reading against the docs, not run.

## Topics
| id | domain | level | words (whole block) |
|---|---|---|---|
| economy-modelling-and-balance | systems | advanced | 2558 |
| live-design-seasons-and-data | product | advanced | 2628 |
| pitching-and-stakeholders | product | advanced | 2247 |
| design-critique-and-feedback | studio | advanced | 2308 |

## Sources
- Woodward, GDC 2017 Albion Online economy: https://gdcvault.com/play/1024070 (page fetched, summary only)
- Castronova, GDC 2023: https://gdcvault.com/play/1028982 (fetched, summary only)
- Adams and Dormans, Game Mechanics: Advanced Game Design: https://www.peachpit.com/store/adamsgame-mechanics-p1-9780321820273 (publisher listing via search: internal economy and Machinations chapters)
- Evan Miller, How Not to Run an A/B Test (26.1 percent figure): https://www.evanmiller.org/how-not-to-run-an-ab-test.html
- Pixar Braintrust, no power to mandate solutions: https://www.atlassian.com/blog/productivity/braintrusts-build-a-candid-think-tank-culture-at-work (secondary; the HBR body could not be fetched)

## Unsourced or generic
- Schell and Fullerton book claims: not used (not verified).
- pitching-and-stakeholders has no facts entry. The pitch structure, evidence ladder and four kinds of no are synthesis.
- design-critique: the observation/inference/preference split, teardown sheet and mentee feedback order are synthesis. Only the Braintrust is cited, from a secondary page.
- live-design: the season length of 6 to 12 weeks is a common range stated without a source.
- Unity Input System default is hedged ("many Unity 6 templates"). Engine APIs were checked from memory of the docs only.

## Engine snippets
Full text is in the ENGINE(id) block of each topic: economy in src/23-topics-systems.js, live and pitching in src/29-topics-product.js, critique in src/33-topics-studio.js.
- economy: godot headless SceneTree econ_sim (hours_to_target per archetype); unity EconSim ContextMenu with a tuple array.
- live: godot SeasonPlan Resource (is_live, z_score guarded by min_per_arm); unity SeasonPlan ScriptableObject (DateTimeOffset, ZScore).
- critique: godot ReviewStamp autoload (F8, CSV row); unity ReviewStamp with Keyboard.current and File.AppendAllText.
- pitching: godot Pitch autoload (--pitch user arg, seed, max_fps); unity Pitch static RuntimeInitializeOnLoadMethod.

## Games tagged
None (no game edits allowed). Proposed for a later step, to confirm against the lens text:
- economy-modelling-and-balance: cookie-clicker, hearthstone.
- live-design-seasons-and-data: candy-crush-saga, fortnite, hearthstone, subway-surfers.
- design-critique-and-feedback and pitching-and-stakeholders: no game fits truthfully.

## Path placement (senior-game-designer)
- Economies: economy-modelling-and-balance first. do: build a spreadsheet plus script for a shipped game's economy and record the failure it exposes. 60 min.
- Live: live-design-seasons-and-data first. do: write a one-season plan with a goal, two guardrails and a stop condition from a given data sheet. 60 min.
- Reviewing and growing designers: design-critique-and-feedback first. do: review a shipped game on the teardown sheet and write a feedback note on a sample design. 60 min.
- Scope, pitch and trade-offs: pitching-and-stakeholders after pm-cross-discipline. do: five-minute pitch of the cut list with the ask, the evidence rung and three objections. 60 min.
- Vision: design-pillars (deepened, already in the path).

Rel links added from existing topics to the new ones: economy-and-resources, live-operations, metrics-and-success, lead-feedback-performance, design-documents, lead-saying-no, audience-and-positioning. design-pillars and ethics-and-responsibility also link out to new topics.

## Deepenings (before / after; AFTER = old text plus the addition, nothing cut)
Entries with "AFTER" containing the old text plus new items, per topic below.

## design-pillars
BEFORE: Would a new team member know what to cut just from reading them?`],
AFTER: Would a new team member know what to cut just from reading them?`,`Who owns the pillars now, who may change them, and is that written down?`,`When two pillars collide in a real decision, which one wins, and did we say so before the deadline forced it?`],

## design-pillars
BEFORE: No non-goals, so the project grows in every direction at once.`],
AFTER: No non-goals, so the project grows in every direction at once.`,`Owning the pillars as the author only: the team follows them while the author is in the room and drifts when the author is not.`,`Granting exceptions one at a time, in private, until the pillars say one thing and the game another.`],

## design-pillars
BEFORE: Publish them and change them only with evidence.`],
AFTER: Publish them and change them only with evidence.`,`Name an owner for the pillar set and write the change rule: who may propose a change, what evidence it needs, and who decides. Log each change with its reason, so the team can see a decision and not drift.`,`Rank the pillars, or write the tie-break for the pair most likely to collide, such as mastery against accessibility. Settle it before a deadline settles it for you.`,`Carry the pillars into daily work: put each on the review template, ask in every design review which pillar the change serves, and let any team member cite a pillar to reject a feature, including against the owner. If the owner cannot be argued with, the pillars are the owner's taste.`,`Defend them under pressure. When a publisher, a metric or a senior asks for something that breaks a pillar, answer in the pillar's terms: what it costs, and an alternative that meets the need. Record the outcome. If you keep granting exceptions, change the pillar on purpose instead.`],

## design-pillars
BEFORE: Could each have been made from the pillars alone?`],
AFTER: Could each have been made from the pillars alone?`,`Ask someone who joined this month to say the pillars and what each forbids. Compare with the owner's answer.`,`List the last three exceptions granted to a pillar. Each should have a logged reason. Silent ones mean the pillars are eroding.`],

## design-pillars
BEFORE: ['audience-and-positioning','The pillars shape what the positioning sentence can promise.']]
AFTER: ['audience-and-positioning','The pillars shape what the positioning sentence can promise.'],['lead-saying-no','Defending a pillar under pressure is a no given with reasons.'],['pitching-and-stakeholders','Carrying the pillars to a lead or a publisher is a pitch.']]

## pm-cross-discipline
BEFORE: Who reviews a piece of content against the design intent, and does that happen before it is polished?`],
AFTER: Who reviews a piece of content against the design intent, and does that happen before it is polished?`,`What does this proposal cost each discipline in its own units (engineer-weeks, art-days, audio passes, QA cases), and did they estimate it or did I?`,`Who pays for a late change, and did they agree to?`],

## pm-cross-discipline
BEFORE: Building the tool costs weeks now and removes a dependency for the rest of the project.`],
AFTER: Building the tool costs weeks now and removes a dependency for the rest of the project.`,`A cut made early is cheap and feels bad. A cut made late feels easier to argue and costs the whole team more to ship.`],

## pm-cross-discipline
BEFORE: Localisation treated as a final step rather than a constraint on layout, fonts and string assembly.`],
AFTER: Localisation treated as a final step rather than a constraint on layout, fonts and string assembly.`,`Asking for a change without asking what it displaces.`,`Absorbing the cost of a late change silently, which teaches the team that cost is not worth reporting.`],

## pm-cross-discipline
BEFORE: Track blocked time per seam and fix the worst seam each milestone.`],
AFTER: Track blocked time per seam and fix the worst seam each milestone.`,`As a senior designer, cost every proposal in each discipline's own units before you argue for it. Ask engineering, art, audio and QA for a rough range and what they would drop to fit. A design nobody who builds it has costed is a wish.`,`Offer options, not one demand: the full version, a cheaper version that keeps the pillar, and a cut. Say what each costs the player, so the trade is a choice made in the open.`,`Make late changes visible. When a change lands after animation, voice or localisation is authored, list the rework and agree who absorbs it or what moves out.`,`Settle conflicts between design, engineering and art against a shared budget (memory, frame time, content per week), agreed beforehand, and not by rank.`],

## pm-cross-discipline
BEFORE: Ask a designer to change a balance value without an engineer. Time it.`],
AFTER: Ask a designer to change a balance value without an engineer. Time it.`,`Take the last three late design changes and list the rework each caused per discipline. If you cannot, the cost was hidden.`],

## ethics-and-responsibility
BEFORE: Does the store promise match what the game does?`,
AFTER: Does the store promise match what the game does?`,`If a regulator, a journalist or a parent asked, who is accountable for this design, and does that person know how it works?`,

## ethics-and-responsibility
BEFORE: Default characters who quietly exclude.`],
AFTER: Default characters who quietly exclude.`,`Treating the business asked for it as the reason. The designer who built the loop is accountable for it.`,`Accountability that belongs to everyone, so nobody can stop a release.`],

## ethics-and-responsibility
BEFORE: Revisit before launch and at each update.`],
AFTER: Revisit before launch and at each update.`,`Name who on the team is accountable for player-facing risk, and give them the right to stop a release.`,`Keep a short decision record for each monetisation or data choice: the pattern, who approved it, the guardrail and the date to revisit. A senior designer should be able to hand it to a lawyer or a journalist without embarrassment.`,`Say no in the terms the room uses: fines, store rejection, refund rate, trust, and the retention of the players who pay longest. Offer an alternative that still meets the revenue goal.`,`Run the consent test on your own work last, and ask a peer to run it first. It is easier to see in a colleague's loop than in yours.`],

## ethics-and-responsibility
BEFORE: Note hesitation, discomfort or a sense of being tricked.`],
AFTER: Note hesitation, discomfort or a sense of being tricked.`,`Pick one live offer and find who approved it, what its guardrail is, and when it was last reviewed. Missing answers are the finding.`],

## ethics-and-responsibility
BEFORE: ['monetisation-design','The store rules and odds disclosure that limit what you may build.']]
AFTER: ['monetisation-design','The store rules and odds disclosure that limit what you may build.'],['live-design-seasons-and-data','Guardrails and the list of decisions data does not get to make.']]

