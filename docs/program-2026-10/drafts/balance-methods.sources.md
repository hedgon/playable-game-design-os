# balance-methods: sources

"Read" means I fetched the page (the fetch tool returns a model summary of the page, not raw text, except the arXiv PDF, which I extracted with pdftotext and read). "Search only" means I saw a search-result summary and did not open the page.

## Sourced claims

1. Schreiber and Romero, "Game Balance", CRC Press 2021, 806 pages; covers intransitive mechanics and payoff matrices.
   https://www.routledge.com/Game-Balance/Schreiber-Romero/p/book/9781498799577 (search snippet only; book itself not read)
2. Cost curve method: baseline point, price of resources, benefits converted to numbers, price abilities by subtraction between near-identical items; Magic example values (first coloured mana +2, second +3, colourless +1; keywords about +1; deathtouch +2 or +3).
   https://gamebalanceconcepts.wordpress.com/2010/07/21/level-3-transitive-mechanics-and-cost-curves/ (read, tool summary). The Level 4 intransitive page 404ed; the payoff-matrix method in the topic is standard zero-sum maths I derived and checked by hand, see 14.
3. Magic vanilla test; Limited creatures need about twice the mana value in total stats (1/3 or 2/2 for 2, 3/3 or 2/4 for 3), scale flattens at high cost; calibrated for post-2017 designs.
   https://mtg.wiki/page/Vanilla (search snippet only, secondary; page returned 403). I could not find a Wizards-authored article for the formula. Fact-checker: find a primary or soften.
4. The "2 x cost + 1" curve in the worked table is my own illustrative curve, labelled as such. The Hearthstone convention (x mana, 2x+1 stats) appears on community pages (https://dotesports.com/hearthstone/news/understanding-card-value-and-stat-distribution-29647, search snippet only); the topic does not attribute the formula to Blizzard.
5. Riot champion balance framework: four groups (average, skilled, elite, pro); June 30 2020 update widened elite from top 0.1% to top 0.5%; tightened overpowered bands for average and skilled by 0.5 points each; metrics win rate, ban rate, pick rate, pro presence.
   https://www.leagueoflegends.com/en-gb/news/dev/dev-balance-framework-update/ (read, tool summary)
6. Original 2019 framework post with specific bands (reported 54.5% falling to 52.5% at 5x ban rate for average play; 54% to 52% for skilled; 49% bottom end). NOT used as a number in the topic. Secondary only: https://www.esports.net/news/lol/riot-games-buff-nerf-criteria (search snippet). The primary https://nexus.leagueoflegends.com/en-au/2019/05/dev-champion-balance-framework/ redirects to the home page.
7. Blizzard StarCraft II: adjusted win percentage removes matchmaker effects and factors in player skill; about 55:45 acceptable, beyond 60:40 investigated; millions of games, hundreds of thousands of players (November 2010 data).
   https://news.blizzard.com/en-us/article/1136961/starcraft-ii-the-balancing-act (read, tool summary)
8. David Kim: rarely decides from one region's numbers; even small changes can have sweeping effects.
   https://news.blizzard.com/en-us/article/4135187/q-a-with-david-kim (read, tool summary)
9. Slay the Spire (Giovannetti, GDC 2019): key metrics are how often a card is picked when offered and how often it appears in winning decks; metric server from prototype stage; 90+ filtered metrics by skill, character and progression; single-player makes balance looser; Early Access allowed weekly patches.
   https://www.gdcvault.com/play/1025731/-Slay-the-Spire-Metrics (search snippet only, paywalled)
   https://www.gamedeveloper.com/design/how-i-slay-the-spire-i-s-devs-use-data-to-balance-their-roguelike-deck-builder (read, tool summary; the "single-player" and "weekly patches" lines)
   I did not watch the talk. The topic says Mega Crit made the single-player point; fact-checker should confirm against the talk video https://www.youtube.com/watch?v=7rqfbvnO_H0.
10. Zook, Fruchter and Riedl, "Automatic Playtesting for Game Parameter Tuning via Active Learning": shoot-em-up case study, 138 players and 991 waves for regression, upper confidence bound best, about 70 samples for the largest gain, random sampling never reached it on their data.
    https://arxiv.org/abs/1908.01417 (PDF read in full via pdftotext; the abs page URL is the canonical link)
11. Gudmundsson et al., "Human-like playtesting with deep learning" (King, 2018): supervised CNN on player data predicts level difficulty, better correlation than MCTS, iteration from 7 days to under a minute.
    https://www.gwern.net/doc/reinforcement-learning/imitation-learning/2018-gudmundsson.pdf (search snippet of the abstract only; paper not read)
12. Metagame autobalancing: designer-drawn target graph, simulation-based optimisation; shown on rock-paper-scissors variants and an asymmetric fighting game (2020).
    https://arxiv.org/abs/2006.04419 (abstract read)
13. Overwatch 2-2-2 role queue: official developer update 18 July 2019; reached live with patch 1.39; per-role skill ratings.
    https://www.pcgamesn.com/overwatch/overwatch-league-role-lock (search snippet only, secondary press; no Blizzard primary opened)
14. Maths I computed (verify by hand): 95% margin = 1.96 x sqrt(p(1-p)/n): n=1,000 gives 3.1 points, n=10,000 gives 0.98, n=100,000 gives 0.31 at p=0.5. 160 options x 5% = 8 expected false flags. RPS matrix with entries (0,-1,2; 1,0,-1; -2,1,0): column conditions p=2s, s=r, p=2r, so (r,p,s)=(0.25,0.5,0.25), every pure payoff 0. With rock-vs-scissors worth 3 the mix is (0.2,0.6,0.2). Field (0.4,0.4,0.2) gives payoffs (0, 0.2, -0.4).
15. Sirlin, "Balancing Multiplayer Games: opportunity, power and relativity" (opportunity cost, power concentration, relative balance): https://www.gamedeveloper.com/design/balancing-multiplayer-games-opportunity-power-and-relativity (read, tool summary). Not cited as a number; informs the "decision matrix" view.

## Claims I could not verify
- Supercell Clash Royale use-rate and win-rate target ranges (4 to 12%, 45 to 55%): a search summary gave them, but the official post I read (https://supercell.com/en/games/clashroyale/blog/release-notes/balance-changes-coming-1, 13 Feb 2017) says only that Supercell combines playtesting with card use rates and win rates. Numbers omitted from the topic.
- The statement in the topic that "Riot, Blizzard and Supercell all publish patch notes" is general knowledge, not tied to one link.
- "Win rate when picked" inflation by self-selection is a statistical argument I made, not a quoted claim from a named source.
- The teaching illustrations (160 options, an average 125 games per option in an elite tier) are labelled illustrative.
- Illustrative-only: the cost-curve table, the payoff matrix and the patch-step EXPLAINER numbers are invented, not from a shipped game.

## Updates after the fact-check (2026-10-05)

- Zook, Fruchter and Riedl: Foundations of Digital Games 2014; arXiv v1 posted 4 Aug 2019. Topic now says "presented in 2014 (posted to arXiv in 2019)". The 70-sample figure is tied to the "largest gain over random sampling", not to "best accuracy". Source: https://arxiv.org/abs/1908.01417 (PDF read).
- Overwatch role queue: replaced the PCGamesN link with Blizzard's own page, https://overwatch.blizzard.com/en-us/news/23060961/introducing-role-queue/ (published 18 July 2019; beta season in patch 1.39, 13 Aug to 1 Sep; full release 1 Sep 2019; separate SR per role; as reported by the fact-checker from the raw page, which I did not re-open). The 5v5 (1 tank, 2 damage, 2 support) claim for Overwatch 2 since October 2022 and the 6v6 tests: https://overwatch.blizzard.com/en-us/news/24104605/director-s-take-opening-up-the-conversation-on-5v5-and-6v6/ and https://news.blizzard.com/en-us/article/23865965/overwatch-2-developer-blog-post-launch-updates-on-gameplay-maps-and-competitive (fact-checker's reading; I did not open them).
- Magic: the vanilla test and the "about twice the mana value in total stats" rule are a Limited players' rule of thumb described on https://mtg.wiki/page/Vanilla (community wiki; no Wizards source found). The topic labels it that way. The mana curve (distribution of costs in a deck) is stated as general Magic knowledge, no source link.
- Supercell, Clash Royale: "combination of playtesting and looking at the stats - in particular, card use rates and win rates", post dated 13 Feb 2017: https://supercell.com/en/games/clashroyale/blog/release-notes/balance-changes-coming-1 (read; no numeric targets in it).
- Slay the Spire's two core metrics (pick rate when offered; presence in winning decks, with "too low is basically not a card" and "too high is overpowered"): taken from search summaries of the GDC 2019 talk page https://www.gdcvault.com/play/1025731/-Slay-the-Spire-Metrics and the Game Developer write-up https://www.gamedeveloper.com/design/how-i-slay-the-spire-i-s-devs-use-data-to-balance-their-roguelike-deck-builder (the metrics themselves; the fact-checker confirmed the page text). The talk video was not watched.
- Riot nerf-versus-buff rule (overpowered in any group means nerf; buff only when underpowered in all four): reported in a secondary summary of the 2019 framework (techraptor.net search snippet) and said by the fact-checker to be in the Riot source I read; verify against https://www.leagueoflegends.com/en-gb/news/dev/dev-balance-framework-update/ and the framework page.
- Equilibrium maths corrected: at 25/50/25 the row options' expected payoffs are 0, but win rates differ: rock wins 25% of games (vs scissors), paper 25% (vs rock), scissors 50% (vs paper). Own computation.
- Margins: 55% at n=1,000 is 5 points above 50, z about 3.2 (standard error 1.58 points); at n=300 the 95% margin is 1.96 x sqrt(0.25/300) = 5.7 points. Own computation.
- EXPLAINER arithmetic: target -6 points, nerf -10, ratio about 1.7; buff 47 to 53 is +6. Own arithmetic.
- Unity snippet now 15 lines, 551 characters. Removed the particle-system claim about UnityEngine.Random (it was unsupported); the remaining claim, that UnityEngine.Random is one shared static state, is from API knowledge and not opened against the Unity docs.
- Godot-versus-System.Random wording corrected (the two give different sequences for one seed).
