# Fact-check: balance-methods

Checked 2026-10-05 against `drafts/balance-methods.js`, `drafts/balance-methods.sources.md`,
`briefs/topics.md` (## balance-methods) and `briefs/topic-common.md`.
I read raw sources wherever I could: the Riot, Blizzard (StarCraft II and Overwatch), Routledge,
arXiv and Game Developer pages were downloaded with curl and searched as text, not through a
summarising tool. The Zook and Gudmundsson papers were read as PDF text (pdftotext).

## Verdict: PASS WITH FIXES

The sourced figures hold up against the raw pages. I recomputed the maths and it is right.
The fixes are teaching errors around the maths: the draft says equal expected payoff means
equal win rate, and it calls a 55% win rate over 1,000 games "noise" when it is well outside the margin.
Also: the Zook paper is dated 2019 but is from 2014, the Overwatch 2-2-2 claim is in the present
tense though it is out of date, and the Magic "twice the mana value" rule has no Wizards source.

## Maths I recomputed

- Payoff matrix rows Rock (0, -1, 2), Paper (1, 0, -1), Scissors (-2, 1, 0). It is skew-symmetric (A = -Aᵀ).
  Against the column mix (r, p, s) the row payoffs are Rock -p + 2s, Paper r - s and Scissors -2r + p.
  Setting all three to 0 gives s = r, p = 2r, so **(0.25, 0.50, 0.25). CONFIRMED.** The draft's
  per-column equations (p - 2s, -r + s, 2r - p) are the same system read from the other side. Every
  row's expected payoff against the mix is 0: Rock 0 - 0.5 + 0.5, Paper 0.25 - 0.25, Scissors -0.5 + 0.5.
- If rock beating scissors is worth 3: s = r, p = 3r, giving (0.2, 0.6, 0.2). CONFIRMED (sources.md item 14).
  Against a field of (0.4, 0.4, 0.2) the payoffs are Rock 0, Paper +0.2, Scissors -0.4. CONFIRMED.
  Adding 1 to every cell leaves the equilibrium unchanged (a constant shift). The try-question's premise is sound.
- 95% margin = 1.96 x sqrt(0.25/n): n = 1,000 gives 0.0310 (3.1 points), 10,000 gives 0.0098, 100,000 gives 0.0031.
  **CONFIRMED.** 160 x 0.05 = 8 and 150 x 0.05 = 7.5 ("7 or 8"). CONFIRMED, if every option is truly at 50%.
- WORKED cost curve: every Total value, Budget, Surplus and Verdict cell is correct. Scout 3/3/0,
  Guard 5/5/0, Sprinter 7/5/+2 Over, Archer 7/7/0, Medic 8/7/+1, Brute 10/9/+1, Drake 12/11/+1, Colossus 12/15/-3 Under.
  The sheet formulas match the column letters (A Card, B Cost, C Attack, D Health, E Ability, F Total, G Budget, H Surplus):
  `=C2+D2+E2`, `=2*B2+1`, `=F2-G2`, and the nested IF matches the plus-or-minus 1 tolerance stated in TECH.
- WORKED payoff table: `=B2*0.25+C2*0.5+D2*0.25` is correct for the column layout, and all three rows come to 0.
- DIAGRAM: the curve points are (c/8, (2c+1)/17) for c = 1..7, all correct. The card points are 3, 7, 7, 10, 12 and 12
  at costs 1, 2, 3, 4, 5 and 7, and they match the WORKED rows. The alt text ("two-cost above, seven-cost below") is right.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
|---|---|---|---|---|
| "Game Balance" (CRC Press, 2021, 806 pages) covers cost curves, payoff matrices, spreadsheets | FACTS, what, WORKED intro/note | CONFIRMED | The publisher page lists "Copyright 2021", "806 Pages", "by CRC Press", the chapters "Transitive Mechanics and Cost Curves" and "Intransitive Mechanics and Payoff Matrices", and spreadsheet techniques in every chapter | https://www.routledge.com/Game-Balance/Schreiber-Romero/p/book/9781498799577 (raw HTML) |
| Riot framework watches four groups (average, skilled, elite, pro) | FACTS, trade, TECH, interview | CONFIRMED | "four different player groups: Average, Skilled, Elite, and Professional" | https://www.leagueoflegends.com/en-gb/news/dev/dev-balance-framework-update/ (raw, dated 2020-06-30) |
| June 2020: elite widened from top 0.1% to top 0.5% for enough games for win rates | FACTS | CONFIRMED | Matches the source word for word in substance | same |
| OP bands for average and skilled tightened "by 0.5 points each" | FACTS | CONFIRMED | Riot writes "by 0.5% each". The bands are win-rate thresholds, so "0.5 points" is the correct reading | same |
| Small tiers lean on pick/ban rate | TECH, interview mid | CONFIRMED (paraphrase) | Elite originally used "pure ban rate", and Pro uses presence | same |
| SC2 adjusted win percentage removes matchmaker effect, factors in skill, millions of games | FACTS, TECH, how | CONFIRMED | "removing the skewing effects of the matchmaker and factoring in player skill ... millions of games ... hundreds of thousands of players" | https://news.blizzard.com/en-us/article/1136961/starcraft-ii-the-balancing-act (raw) |
| About 55:45 acceptable, beyond 60:40 prompts investigation; 2010 article | FACTS | CONFIRMED | The page says "approximately 55%:45% ... within acceptable boundaries" and "exceeding 60%:40% ... merit further investigation". The data is dated 11 November 2010 | same |
| "In a 2019 study" (Zook, Fruchter, Riedl) | FACTS | WRONG | The paper is from the Foundations of Digital Games conference, 2014. arXiv posted it on 4 Aug 2019. Its reference list ends in 2013. Write "a 2014 study (posted to arXiv in 2019)" | arXiv PDF v1 header and references; FDG 2014 per publication listings (e.g. Semantic Scholar/ACM via search) |
| Shoot-em-up case study, 138 players, 991 waves, UCB best | FACTS, TECH | CONFIRMED | "data from 138 players and 991 waves", "We found UCB was most effective" | https://arxiv.org/pdf/1908.01417 (pdftotext) |
| About 70 samples; random sampling never reached it | TECH | CONFIRMED | "Approximately 70 samples were needed to train the successful AL methods for the largest peak performance improvements; random sampling never achieved this level of performance on our data set" | same |
| UCB "reached the best difficulty-tuning accuracy with about 70 playtest samples" | FACTS | CONFIRMED with wording fix | The paper ties the 70 samples to the largest improvement over random sampling, not to "best accuracy". Use the TECH wording ("the largest gain") | same |
| Human-like agents from a casual-puzzle studio: more accurate than MCTS, days to minutes | TECH | CONFIRMED | Gudmundsson et al. (King, 2018) say it "increases correlation with average level difficulty", relative to MCTS. The "previous 7 days needed with human playtesting" became "less than a minute". The 7-day baseline was human playtesting, not MCTS, which the draft's sentence allows | https://gwern.net/doc/reinforcement-learning/imitation-learning/2018-gudmundsson.pdf (pdftotext) |
| Metagame autobalancing: designer target graph, simulation-based optimisation, RPS variants and an asymmetric fighting game, 2020 | TECH | CONFIRMED | The abstract says exactly this. Submitted 8 Jun 2020 (Hernandez et al.) | https://arxiv.org/abs/2006.04419 (raw) |
| Mega Crit said single-player makes balance looser | trade | CONFIRMED | Giovannetti says being a single-player roguelike "makes balancing its many cards a lot easier": "decks do not need to be equal". The source is the Game Developer interview, not necessarily the GDC talk itself | https://www.gamedeveloper.com/design/how-i-slay-the-spire-i-s-devs-use-data-to-balance-their-roguelike-deck-builder (raw) |
| Overwatch 2-2-2 role queue announced 18 July 2019, live with patch 1.39 | FACTS | CONFIRMED; change the source | Blizzard's own page has datePublished 2019-07-18. It says role queue would come "to live servers starting with a Role Queue Beta Season in Patch 1.39" (13 Aug to 1 Sep), with full release on 1 Sep 2019 (Season 18), and separate SR per role. Replace the PCGamesN link with this primary | https://overwatch.blizzard.com/en-us/news/23060961/introducing-role-queue/ (raw) |
| "Overwatch's role queue (2 tanks, 2 damage, 2 support) fixes team shape" (present tense) | how (last step) | OUTDATED | Since Overwatch 2 (October 2022) standard role queue has been 5v5, 1 tank / 2 damage / 2 support, and Blizzard has run 6v6 tests since. Say "Overwatch's 2019 role queue (2-2-2), now 1-2-2 in Overwatch 2" | https://news.blizzard.com/en-us/article/23865965/overwatch-2-developer-blog-post-launch-updates-on-gameplay-maps-and-competitive ; https://overwatch.blizzard.com/en-us/news/24104605/director-s-take-opening-up-the-conversation-on-5v5-and-6v6/ |
| "rated on its own" (role SR) | how | CONFIRMED | "separate skill ratings (SR) for each role" | Blizzard role queue page above |
| "tuned against its own job" as the reason for role queue | how | UNSUPPORTED (inference) | Blizzard gives fairer matches and role freedom as the reasons. "Tuning each role against its own job" is the writer's inference. Soften to "which also lets each role be tuned..." | same |
| Magic vanilla test: strip abilities, judge stats against cost | what, how | CONFIRMED as a community heuristic | It is described on mtg.wiki and by draft-strategy sites. I found no Wizards of the Coast article that defines or names it | https://mtg.wiki/page/Vanilla (via search snippet; the page returns 403 to fetch) |
| Limited creature needs "about twice its mana value in total stats", flattening at high cost | how | UNSUPPORTED by a primary source | Only mtg.wiki (community) states it. The 1/3 or 2/2 for 2 and the 4-drop at 7 points, 5-drop at 9 points examples come from the wiki. A search found no Wizards/Rosewater source. Attribute it: "Limited players' rule of thumb (mtg.wiki)" | as above |
| Riot, Blizzard and Supercell all publish patch notes | traps | CONFIRMED (general knowledge) | — | — |
| "calling UnityEngine.Random ... anything else that uses it (a particle system, an AI script) changes the sequence" | ENGINE unity pitfall | UNSUPPORTED (likely wrong example) | The shared-state point is right: UnityEngine.Random is one static state. But particle systems seed from their own `ParticleSystem.randomSeed`, and I found nothing saying they consume UnityEngine.Random. Keep "any other script that calls UnityEngine.Random" and drop the particle example | Unity Scripting API, Random / ParticleSystem.randomSeed (not opened; from API knowledge, so flagged as unconfirmed) |
| "Godot's RandomNumberGenerator with a seed gives the same repeatable run as System.Random(seed)" | ENGINE godot map | Misleading wording | Each is repeatable within its own engine, but the two give different sequences for the same seed. Say "is repeatable in the same way as" | — |
| EXPLAINER frame 2: 56% to 46% was "about three times too large" | EXPLAINER | WRONG (arithmetic) | The goal was -6 points and the patch did -10, which is about 1.7 times too large. Change to "nearly twice too large", or make the drop 56 to 38 | own arithmetic |
| EXPLAINER frame 4: "a buff of the same size swings it back to 53%" | EXPLAINER | Inconsistent | Going from 47 to 53 is +6, not the -10 of the nerf. Say "a buff of about the same size in the stat" or drop "same size" | own arithmetic |
| Trap: at the worked equilibrium "every option wins exactly as often as the others" | think.traps | WRONG | Equilibrium means equal **expected payoff** (0 each), not equal win rate. Against 25/50/25, Rock wins 25% / ties 25% / loses 50%, Paper wins 25% / ties 50% / loses 25%, and Scissors wins 50% / ties 25% / loses 25%. Win rates are unequal because the stakes are. Write "every option scores the same on average" | own computation |
| Mid interview: "At 1,000 games the margin is about plus or minus 3 points, so 55% may be noise" | INTERVIEW mid | WRONG | At n = 1,000, 55% is 5 points above 50, which is z of about 3.2. That is well outside the 95% margin of 3.1, so it is not plausibly noise. Use a smaller sample (at 300 games the margin is about 5.7 points), or say the question is whether 55% reflects the hero rather than who plays it | own computation |
| Senior Q: "the practical check is ... whether win rates are equal" (and the follow-up 49/53/48) | INTERVIEW senior | Misleading | In a matrix with unequal stakes, the equilibrium test is equal expected points per pick, not equal win rates. Say "whether average points (or win rate in a 1-point-stakes game) are equal" | own computation |

## Missing or thin coverage (against "Must cover")

- **Magic's mana curve** (the cost distribution of a deck) is named in the brief and absent. The draft
  covers only the vanilla test and a power curve. One sentence would separate the two meanings of "curve".
- **Nerf vs buff** is not discussed as a choice. The brief asks for it. There is nothing on why teams
  prefer buffs, or when a nerf is unavoidable. Riot's rule (nerf if over in any group, buff only if
  under in all four) is in the source the writer already read and would serve.
- **Slay the Spire's metrics** are used only for the single-player point. The talk's two core metrics
  (picked when offered, presence in winning decks) are the clearest real-world case of "pick rate" and
  "win rate when picked", and the sources file has them. Add them to the telemetry step or a TECH row.
- **Supercell** is named only in "everyone publishes patch notes". The brief lists Supercell dev posts.
  The writer rightly left out the unverified 4-12% / 45-55% bands. The official 2017 post (playtests plus
  use rate and win rate) could support one sentence.
- Schreiber's Game Balance Concepts blog (in the brief's source list) is not cited in the draft.
- Everything else is covered: what balanced means, transitive vs intransitive, solving a matrix, spreadsheets
  and their limits, Monte Carlo, automated playtesting, telemetry signals and the top-1% trap, small
  patches and communication, PvE vs PvP, and asymmetric balance (StarCraft II; Overwatch needs the fix above).

## Code issues

- Unity snippet is **17 lines**. topic-common.md caps engine snippets at 15 lines. It is 603 characters,
  under 900. The validator checks only the 900 characters, so it will not catch this.
- Unity snippet: `public struct` and a `public static` method sit at top level. They would need a containing
  class to compile. This is acceptable as an excerpt but worth a wrapping `static class BalanceSim {}`
  if lines allow.
- Godot snippet (14 lines, 470 characters) is valid Godot 4 GDScript: `RandomNumberGenerator.new()`,
  `.seed`, `.randf()`, `for i in runs`, and dictionary dot access `a.hp`. Edge case, set aside below:
  if both `acc` are 0 the while loop never ends.
- `api[]` lists names that the snippets do not use (FileAccess.open, Array.append, --headless --script,
  ScriptableObject, -batchmode -executeMethod, MenuItem, File.WriteAllText, Mathf.Sqrt). All are real APIs
  and CLI flags. topic-common asks that snippets use the listed APIs, so the coordinator should decide
  whether this matches house practice in the exemplars.
- Not opened against the official API pages this pass: RandomNumberGenerator, System.Random.NextDouble,
  and the Unity CLI flags. All are long-standing and match my API knowledge. No signature looks wrong.

## Teaching issues

1. Equal payoff is presented as equal win rate (trap, senior answer and follow-up). This is the most serious
   issue, because the topic's own point is that weighted stakes change the healthy mix.
2. The "55% may be noise at 1,000 games" example contradicts the margin the draft itself teaches.
3. The WORKED cost-curve intro says "the plain cards fix the curve", but two of the four vanilla cards
   are off it (Brute +1, Colossus -3). Say the curve was set from the cheap plain cards. The try-question
   on Colossus then reads as intended.
4. The EXPLAINER arithmetic ("three times too large", "same size") is off; see the table.
5. "160 options, about 8 outside a 95% interval by chance" holds only if all options are truly at 50%.
   Add "even if every option is balanced".

## Style

UK spelling throughout (optimisation, behaviour). No hype words found by grep (crucial, robust, leverage,
delve, powerful, seamless). No employer, colleague or internal project of the owner. "King" is named
only indirectly ("a casual-puzzle studio"); naming it would be fine, as it is a public company.

## Set aside (considered, not flagged)

- Riot "0.5%" vs draft "0.5 points": the bands are win-rate percentages, so points is the more precise word.
- Riot's original 2019 bands (54.5% etc.): the draft does not use them.
- "Riot, Blizzard and Supercell all publish patch notes": general knowledge, true.
- David Kim Q&A (sources item 8) and the Game Balance Concepts Magic values (item 2): the draft does not use either.
- The Hearthstone 2x+1 convention: the draft labels its 2 x cost + 1 curve as illustrative and does not attribute it.
- The Godot infinite loop when both accuracies are 0: a teaching snippet, not production code. Out of scope.
- The "10% not 50%" (how) vs "5 to 10%" (TECH) step sizes: both are presented as examples, and they do not conflict.
- The fourth-option try-question (beats paper, loses to rock and scissors): the premise is coherent and the option is dominated-ish by design.
- "Win rate when picked inflated by self-selection": a reasoned statistical argument, labelled as such in the sources file.
- The Gudmundsson "7 days" baseline being human playtesting, not MCTS: the draft's sentence ("cut the iteration from days to minutes") is accurate as written.
