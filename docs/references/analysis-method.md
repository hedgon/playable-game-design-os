---
status: active
updated: 2026-09-24
---

# How the library analyses a game

Owner feedback on the first pilots: the lenses read as description, not
analysis. This is the method every game analysis now follows, synthesised
from academic game analysis and practitioner critique (sources at the end).

## Description versus analysis

Description says what is there. Analysis says what it does, how, to whom, at
what cost, compared with what, and it can be wrong.

- A descriptive sentence cannot be disputed by anyone who has played the game
  ("the score uses taiko drums and brass").
- An analytical claim can be ("the score keeps the squad human between
  battles by splitting martial and personal registers").

Three recurring errors: developer intent presented as player effect; credits
and trivia presented as context; adjectives ("atmospheric", "iconic") in place
of a mechanism.

## The entry (one per lens, ten per game)

| Field | What it holds |
| --- | --- |
| Claim | One arguable sentence: what this aspect does and why it matters in this game. |
| Evidence | Two or three specific moments: a place, encounter, screen or number, sourced. |
| Mechanism | How it produces the result: a rule, signal, layout, timing or channel, named with the lens's framework where one fits. |
| Effect | What the player feels, learns, decides or does differently because of it. |
| Comparison | The genre convention or a named alternative game, and the difference. |
| Cost | What the choice gives up, and who pays: players, the team, the budget. |
| Principle | The lesson that transfers beyond this game. |
| Context (optional) | A constraint that explains the choice; only if it explains something. |
| Sources | Links behind the evidence. |

Target 150 to 330 words per lens. If a lens is genuinely thin for a game (Tetris
has no lore), the entry argues why in a short paragraph instead.

## Frameworks per lens

| Lens | Frameworks and vocabulary |
| --- | --- |
| Gameplay and systems | MDA (mechanics, dynamics, aesthetics); core loop and meta loop; skill atoms (Cook); positive and negative feedback loops; interesting decisions (Meier); emergence; verbs and resistance (Anthropy and Clark). |
| UI and HUD | Diegetic, non-diegetic, spatial and meta interfaces (Fagerholt and Lorentzon); information hierarchy (always, contextual, on demand); modal versus live menus; feedback chain (input, acknowledgement, result, consequence). |
| Art direction | Silhouette and value hierarchy for readability; shape language; colour coding and saturation budgets; noise budgets; stylisation as a clarity budget (Valve on Team Fortress 2, Riot on League clarity). |
| Sound direction | IEZA (effect, zone, interface, affect: Huiberts and van Tol); diegetic versus non-diegetic; adaptive music (horizontal re-sequencing, vertical layering); sound as information and telegraph; leitmotif; silence. |
| Lore and narrative | Evoked, enacted, embedded and emergent narrative (Jenkins); ludonarrative harmony or dissonance (Hocking); procedural rhetoric (Bogost); agency; delivery channels; loops versus arcs. |
| World building | Infrastructures: maps, timelines, genealogies, nature, culture, language, mythology, philosophy; invention, completeness and consistency (Wolf). |
| Environmental storytelling | Staging player space so it reads as a meaningful whole (Smith and Worch); cause-and-effect vignettes, breadcrumbs, contrast (Carson); mise-en-scène. |
| Business and release | How the business model shapes design (premium, free-to-play, subscription); release model (early access, episodic, live service, remaster); platform strategy; pricing; lifecycle. |
| Replayability and difficulty | Sources of variation; what stays fixed so skill accumulates; cost of failure (Juul's paradox of failure); dynamic difficulty; difficulty versus accessibility options. |
| Lineage | Borrowed, transformed or rejected; evidence of influence (statements, dates, feature correspondence); what descendants took, mechanism or surface. |

## Reviewer rubric

Each item passes or fails. An entry passes with seven of ten, and items 1 to 4
must all pass.

1. The first sentence is an arguable claim about function or effect.
2. It names a mechanism: how, not an adjective.
3. It names an effect on the player.
4. It cites at least two specific moments, not "throughout the game".
5. It compares with a named convention or game, and says the difference.
6. It states a cost.
7. Any credit or business fact is tied to a design consequence.
8. The principle applies beyond this game.
9. Intent comes from a developer source, effect from play or reception.
10. Swap test: with another game's name, the entry becomes false.

Automatic rejection: more than half the sentences are "X has / uses /
features Y"; facts with no consequence; evaluative adjectives without a
mechanism; plot summary over two sentences; framework names dropped without
being applied.

Quick tests: so what (each sentence answered by the next); verb test (makes,
forces, rewards, trades, withholds, rather than has, features, includes);
dispute test; swap test; deletion test (remove comparison and cost; if nothing
is lost, they were decoration).

## Workflow

1. Gather the facts per lens with sources (research notes).
2. Pick one claim per lens: the most revealing thing, not full coverage.
3. Chain claim, evidence, mechanism, effect, comparison, cost, principle;
   mark any unsupported slot and verify it or cut it.
4. Run the rubric; rewrite anything failing items 1 to 4.
5. Fact-check before publishing; judgement stays marked as judgement.

## Sources

- Fernández-Vara, *Introduction to Game Analysis* (Routledge): context, formal
  elements, close reading, thesis.
- Aarseth, "Playing Research: Methodological approaches to game analysis"
  (2003): gameplay, game structure, game world.
- Consalvo and Dutton, "Game analysis: Developing a methodological toolkit",
  *Game Studies* 6.1 (2006): object inventory, interface study, interaction
  map, gameplay log. https://gamestudies.org/0601/articles/consalvo_dutton
- Lankoski and Björk, "Formal analysis of gameplay" (ETC Press, 2015).
- Hunicke, LeBlanc and Zubek, "MDA" (2004).
  https://users.cs.northwestern.edu/~hunicke/MDA.pdf
- Bogost, *Persuasive Games* (MIT Press, 2007): procedural rhetoric.
- Fagerholt and Lorentzon, *Beyond the HUD* (Chalmers, 2009).
  https://publications.lib.chalmers.se/records/fulltext/111921.pdf
- Huiberts and van Tol, IEZA framework.
  https://www.gamedeveloper.com/audio/ieza-a-framework-for-game-audio
- Jenkins, "Game Design as Narrative Architecture" (2004).
- Wolf, *Building Imaginary Worlds* (Routledge, 2012).
- Smith and Worch, "What Happened Here? Environmental Storytelling" (GDC 2010).
- Carson, "Environmental Storytelling: lessons from the theme park industry"
  (Gamasutra, 2000).
- Practitioner models: Game Maker's Toolkit; Game Developer's Game Design Deep
  Dive series; GDC postmortems; Deconstructor of Fun; Game UI Database.
