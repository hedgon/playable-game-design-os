---
status: active
updated: 2026-10-05
---

# The curriculum: each rule and the evidence behind it

The learning paths (src/50-paths.js, src/51-paths-engineering.js) follow the rules
below. Each cites the evidence row in [learning-science.md](learning-science.md) and how
strong it is there. "Abstract" means the number was read from an abstract or a
secondary summary, not the full paper; no rule rests on a number marked "not verified".

| Rule | Evidence (row, strength) | How the site enforces it |
| --- | --- | --- |
| Every stage ends in free-recall questions, asked before the answer is shown, with an answer outline to compare against | Retrieval practice beats restudy (rows 1-3: Adesope g = 0.61, Rowland d = 0.50; larger with feedback; larger for recall than recognition, which is CONTESTED: Adesope’s summary found multiple choice stronger). Abstract/secondary | Validator: 2 to 4 recall questions with answers per stage. P9: the boss asks them one at a time, the outline is hidden until the reader has answered |
| Answers are compared against a short list of ideas, not a gut "did I get it?" | Self-judgement is unreliable when the answer is in sight (row 18, Koriat & Bjork); feedback works through information, not praise (row 12, d = 0.48) | P9: the outline is split into ideas the reader ticks; a confidence tap comes before the reveal. Validator reports answers that yield a single idea |
| Missed and partly recalled questions come back on a widening schedule (1, 2, 4, 8, 16 days) | Spacing is the best-supported single feature (rows 4, 5, 5b: Cepeda; Dunlosky "high utility") | Review queue. The checkpoint queues every answer: misses, partials and right answers marked as a guess come back tomorrow, other right answers at the next gap. Treating a right guess as partial is our judgement (row 18: confidence is a scheduling input, not a verdict) |
| A later stage revisits topics from earlier stages (`review`) | Spacing and retrieval (rows 2, 4) | Validator: 0 to 2 review topics; reports stages from the second on with none, and review topics not studied in an earlier stage |
| No more than four topics in a row from one domain | Interleaving, moderate and material-dependent (row 6: g = 0.42; mixed for maths) | Validator: fails a run of five or more |
| Each step says why it comes now and gives an exercise | Self-explanation (row 13: g = 0.55, secondary); active learning (row 15) | Validator: every step has `why` and `do` |
| Stages are built around a whole task (a build task per stage), with support that fades | Whole-task design (row 14: 4C/ID, Merrill), guidance for novices (row 9) | Validator: a build task on every stage; levels never go down within a path |
| Novices see worked examples before they practise, and a reference solution after they try the build task; experts can test out | Worked examples (row 7: g = 0.48, mathematics; its rule is the example before the learner produces one); expertise reversal (row 8); informational feedback and fading support (rows 12, 14). A solution shown after the attempt is feedback and fading, not row 7’s order: that reading is ours | Topics carry worked examples (WORKED tables) before practice; the stage’s `solution` sits behind a closed disclosure ("open after you try"); the validator reports beginner and intermediate stages without one. "I already know this" became a test-out (P9) |
| A stage is short enough to finish in a sitting (steps of 10 to 60 minutes) | Segmenting (learning-science section 3, Rey 2019: small to medium, for media segments; applying it to study sessions is an inference, and pacing is unresolved) | Validator: step minutes 10-60, stage hours within 10% of its steps |
| Progress means what you can recall, not what you clicked | Mastery learning (row 11: Kulik d = 0.52, with the Bloom replication caveat) | P9: the overworld shows recall state per stage; nothing is locked (judgement: a free site for adults gains little from hard gates) |
| No points, streaks, badges or leaderboards | Expected tangible rewards undermine intrinsic motivation (Deci, Koestner & Ryan 1999; contested by Cameron & Pierce); no learning evidence for streaks | Not built; the adventure (P9) uses thin fiction only, off by default |
| No "learning style" choice | Meshing hypothesis unsupported (row 17: myth) | Not built |
| Diagrams by default; stepped animation only where change over time is the idea; short silent clips only where motion is the point | Höffler & Leutner d = 0.37 (procedural-motor d = 1.06); Berney & Bétrancourt g = 0.226; seductive details hurt (Rey 2012) | P4: DIAGRAM, EXPLAINER, CLIP; no decorative motion in the reading column |

## Where the new material sits (P6, P7)

Each new topic and game joins at least one path (the validator fails otherwise), at the
stage whose goal it serves, after the topics it builds on and before the build task that
uses it; existing stages add it as a step or as a `review` topic. Two new paths take the
deep engineering material, because adding it to existing stages would double their
length: realtime-at-scale-engineer and performance-engineer (research/content-gaps.md).

## What is not enforced, and why

- The quality of an answer outline (whether its ideas are the right ones) is a judgement
  a fact-check or reviewer makes, not a rule.
- Interleaving is a default, not a hard rule beyond "no five in a row from one domain",
  because its effect depends on how similar the categories are (row 6).
- Whether the adventure skin helps cannot be measured on a static site with no
  analytics; it ships off by default.

## What the guides found (2026-10-05, before P6)

`node src/validate.js` prints these under LONG, never as errors:

- Spacing: every stage after the first revisits an earlier topic; every review topic
  was studied earlier in its path. Nothing to fix.
- Reference solutions: 35 beginner or intermediate stages have none. Content work,
  not a rule failure; new stages written in P6 and P7 carry one.
- Answer ideas: 185 of 419 answer outlines were one sentence, so the checkpoint would
  show one idea to tick and could never say "partly". After the final review found the
  split had not been done, the outlines whose one sentence holds several ideas were given
  `ideas:[]` lists copied word for word from the outline (checked by script); the rest
  stay single (see tasks P10.1 for the count).
