# Senior learner walkthrough (V1)

The walk was done with Edge through Playwright at 1440, 375 and 1920 px, with two personas:
- **S1:** a senior game designer with eight years and two shipped live games.
- **S2:** a senior gameplay developer with ten years, whose team uses AI coding agents daily.

The walker followed every step's link target (topic, game lens, tool, checklist, prompt and smell). All targets rendered with no console or page errors, and nothing overflowed at 375 or 1920 px.

## Verdicts

**S1, senior game designer: good.**
- The advice is senior-level: pillars that forbid things, tie-breaks, pre-registered live metrics, feedback aimed at the task (Kluger and DeNisi), and the four kinds of no.
- The builds are portfolio-grade: a vision doc, an economy model script, a season plan, a review with a feedback note, a cut list and a rehearsed pitch.
- The only re-taught basics are in stage 1.

**S2, senior developer: good.**
- The framing of AI is neither hype nor dismissal. The outcome text says the evidence does not promise a speedup, and every study carries its numbers and limits. Verification, review and architecture are the core, and measuring locally is stage 4.
- No sentence promises speed or dismisses AI.

## Findings

| id | persona | where | problem | fix |
| --- | --- | --- | --- | --- |
| F1 | both | search "METR" | The METR-study topics ranked 18th and 21st of 25, behind fuzzy matches | Rank exact whole-word matches first |
| F2 | S1 | search "license" | Noise after the first hit | The same ranking fix, and confirm UK/US folding applies to the query |
| F3 | both | chooser card | It did not say why the path fits | Add one "Suggested because…" line |
| F4 | S1 | chooser card | "Also fits" listed six lower-level paths for an Experienced learner | Show at most 3, at the same or a higher level |
| F5 | S2 | chooser blurb | "when AI codes" overstated AI's role | Use "when agents write much of the code" |
| F6 | S2 | stage 4 step `why` | "19% slower" appeared without the sample, the tool date or the 2026 update | Add all three |
| F7 | S2 | path header | Six prerequisite chips formed a wall that wrapped at 375 px | Show "Any one engineering path" with an expander |
| F8 | S2 | AI-era topic pages | They did not link to the path's own checklists or prompt | Add those topics to the checklists' and prompt's `topics` |
| F9 | S1 | stage 1 steps | Basic exercises for a senior | Reframe them as audits of a shipped or live game |
| F10 | S2 | stage 6 | It reused the designer path's topics without noting it | Make the `do` developer-specific and note the other side |

## What works well

- The chooser puts the matching advanced path first for both personas.
- Evidence is dated and sourced, with sample sizes, intervals and what each study does not show. Recall answers carry limits too.
- Every step produces a concrete artifact.
- Path pages make the fit explicit. The phone layout reads well, and the 1920 px layout uses its space.
- Search finds "loot box", "one on one" and "rollback" correctly.
