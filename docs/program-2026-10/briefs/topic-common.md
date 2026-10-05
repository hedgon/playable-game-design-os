# Brief: writing one new topic (common rules)

You write ONE topic for the Playable learning site, as a draft file outside the build.
The coordinator integrates it, adds it to learning paths and gets it fact-checked.
Your topic's own scope is in `docs/program-2026-10/briefs/topics.md` under `## <topic id>`.

## Read first (targeted, not whole files)

- `CONTRIBUTING.md`, sections "Topics" and "Diagrams" (the data shape and every rule).
- Two exemplar topics, complete with their ENGINE / GO / INTERVIEW / FACTS / DIAGRAM /
  TECH calls: `src/36-topics-server.js` lines 754-900 (`server-scaling`) and
  `src/39b-topics-craft.js` lines 443-560 (`craft-performance`). Match their shape,
  tone and density; go deeper than them on your subject.
- The topics your scope says to link (`rel`): read their `t`, `tag` and `what` only, so
  you link with a precise reason and do not repeat what they already teach.
- `src/10-schema.js` for the JSDoc types of every field.

## Output

- `docs/program-2026-10/drafts/<topic id>.js`: plain script with, in this order,
  `T('<id>', {...})`, `TECH(...)` (when techniques compete), `ENGINE(...)` (unless the
  domain is `eng:'none'`; required for domains without `eng:` set, optional for `craft`
  and `platforms`, where you include it when code shows the point), `GO(...)` (server and
  backend only, when code shows the point), `INTERVIEW(...)`, `FACTS(...)` (anything that
  can change: versions, prices, limits, platform rules), `DIAGRAM(...)`.
- `docs/program-2026-10/drafts/<topic id>.sources.md`: every specific claim (a number,
  a named technique attributed to a company or engine, a quote, a default value, a
  benchmark) on its own line, with the https source that supports it and whether you
  read the source itself or only a summary. The fact-checker works from this file.

## Depth bar (owner, 2026-10-05: "in-depth, evidenced with official knowledge and clever tricks in the trade")

- Teach the mechanism, with numbers: budgets, sizes, rates, orders of magnitude, the
  point where an approach stops working ("fine at 10 users, breaks at 100,000 because").
- Prefer official sources: engine manuals (Godot docs, Unity manual and Unity's own
  optimisation e-books, Unreal docs), vendor guides (Arm, Qualcomm, Apple, Android, NVIDIA,
  AMD GPUOpen, Microsoft), platform docs, RFCs, the engineering blog of the company that
  built the system, GDC or conference talks by the people who built it, peer-reviewed
  papers. A secondary summary is acceptable only beside the primary.
- Name the tricks of the trade practitioners actually use, each with when it pays, what
  it costs and the alternative (the `TECH` rows are the place for this).
- Every `how` step is something a reader can do this week. Every `verify` item is a
  check that would show the work failing. `test` is what to playtest or measure.
- `think.traps` are the mistakes people really make, not strawmen.
- Interview: 6 to 10 questions, at least one per level, each `{q, a, follow, red}`; the
  senior ones ask for trade-offs under constraints.

## Diagram

Give one static `DIAGRAM()` of a kind in CONTRIBUTING's table that shows the structure.
If change over time is the idea (a packet stream, a frame being built, a player's route
growing as abilities unlock, power rising across expansions), ALSO write, after the
DIAGRAM call, a comment block:

```
/* EXPLAINER
title: <under 90 characters>
frame 1: <caption, one sentence> | <what is drawn and what changed from the last frame>
frame 2: ...
(3 to 8 frames; the last frame is the complete picture)
*/
```

The coordinator turns it into a stepped animated explainer.

## Style

Plain words, short sentences, active voice, UK spelling. No hype, no filler, no
"crucial", "robust", "leverage", "delve". Frameworks are lenses to test, not laws; mark
contested claims as contested. Never name a real employer, colleague, internal project or
host of the site's owner; public companies and products (Discord, Riot, Valve, Unity) are
fine. Length is earned by sourced detail, never by padding; there is no upper cap.

## Self-check before you finish

```bash
PLAYABLE_DRAFTS=docs/program-2026-10/drafts/<topic id>.js node src/validate.js
```

It must end with `OK: all cross-links resolve, all topics complete.` Lines starting
`DRAFT not in any learning path` are expected. Fix every error it prints. Engine snippets:
real GDScript (Godot 4) or C# (Unity 6), 15 lines or fewer and 900 characters or fewer,
using the APIs named in `api[]`. Go snippets: a whole file starting with `package`, Go
1.23 or later, compiles alone.

Do not edit any file under `src/`. Do not run the build. Never run git. Never read or
search anything under D:\Personal outside D:\Personal\playable-game-design-os. Return the
two file paths and a 5-line summary: what the topic teaches, the 3 strongest sources, and
anything you could not verify.
