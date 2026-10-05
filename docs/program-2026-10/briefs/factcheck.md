# Brief: fact-checking one draft (programme 2026-10)

You check ONE draft written by another agent. You did not write it. Your report decides
whether it is integrated. Read-only on the draft: do not edit it.

## Inputs

- The draft: `docs/program-2026-10/drafts/<id>.js`
- The writer's claim list: `docs/program-2026-10/drafts/<id>.sources.md`
- Its brief: `docs/program-2026-10/briefs/topics.md` (section `## <id>`),
  `briefs/games.md` or `briefs/comparisons.md`, and `briefs/topic-common.md` for topics.
- For games: `docs/references/analysis-method.md` (the rubric, items 1-10 and the
  automatic rejections).

## What to check

1. Every specific factual claim in the draft: numbers, dates, versions, prices, limits,
   API names and signatures, defaults, quotes, attributions ("Valve says", "Discord
   built"), sales and review figures, release facts. Not only the ones in the claim list:
   read the draft itself and find claims the list missed.
   For each: open the source (prefer the primary source; search for one when the writer
   gave none or a weak one). Verdict: CONFIRMED, WRONG (with the correct value and
   source), UNSUPPORTED (no source found either way), or OUTDATED.
2. Code: engine snippets use real APIs of Godot 4 and Unity 6 with the right
   signatures (check the official API reference pages); Go snippets compile in your head
   against Go 1.23 (imports used, types right). Name every API you could not confirm.
3. Teaching: anything misleading, oversimplified to the point of being wrong, or a
   "trick of the trade" presented without its cost or when it backfires.
4. Coverage against the brief's "Must cover" list: name what is missing or thin.
5. For games: the rubric per lens (pass/fail on items 1-4 and the score of 10).
6. Style: hype words, padding, US spelling, any named employer, colleague or internal
   project of the site's owner (none may appear).

## Output

Write `docs/program-2026-10/drafts/<id>.factcheck.md`:
- verdict: PASS, PASS WITH FIXES, or FAIL;
- a table: claim (quoted short) | location (field) | verdict | correct value | source;
- missing coverage; code issues; teaching issues; rubric scores (games);
- a "Set aside" list: what you considered and did not flag, with the reason.

Return the file path and a 5-line summary (verdict, counts of WRONG / UNSUPPORTED /
OUTDATED, the most serious issue). Never run git. Never read or search anything under
D:\Personal outside D:\Personal\playable-game-design-os.
