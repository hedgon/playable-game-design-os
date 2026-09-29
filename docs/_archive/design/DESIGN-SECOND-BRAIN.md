---
status: archived
updated: 2026-09-29
---

# The game design second brain: architecture and method (archive)

Snapshot of 2026-09-24, compacted on 2026-09-29; counts and coverage have changed since; see [README](../../../README.md) for current scope.

This was the reasoning behind the redesign. The full text is in git history.

## Old architecture, new architecture

**Old.** A radial brain map was the front door and the only navigator. Topics opened in a reading drawer beside it, and every other view replaced the map. Ideation was one fifteen-field form (the Idea Shaper). A radial fan cannot hold names as nodes grow: labels shrink, rotate and truncate, and reading a node needed hover.

**New.** Three layers, each with one job.

- **Index (left).** Domains and topics, named and counted, with search and a lens switch (Design, or Engineering and Career).
- **Mind map (centre).** Always visible, drawn as a horizontal collapsible tidy tree. The lens goal sits in the middle, its domains split into two balanced groups, and a domain's topics appear on the next layer when open. Selecting a topic grows a further layer of related concepts, smells it diagnoses and tools. Faint dashed cross-branch links connect domains, and hover highlights a node's links. Nodes are labelled cards joined by curves, so names never depend on hover. Dragging a node nudges its branch (persisted per node key). **drag** restores the tidy layout and **default** collapses everything and fits the overview. Dragging empty space pans; wheel or pinch zooms. All gestures are pointer-based, so mouse and touch behave the same.
- **Content (right).** Whatever you are reading or doing.

On desktop all three show at once; panels resize by dragging dividers and collapse from the toolbar. On narrow screens the index and content are slide-over drawers with a tap-away scrim, and a reading route opens the content while a structure route shows the map. On phones the tree draws one side only.

Principle: a graph is for relationships, a list is for navigation, a workflow is a flow, a diagnostic is a decision tree.

## Ideation method: the Idea Lab

An idea is a chain of reasoning, not a filled-in form. The Idea Lab (`#/lab`, under Make) has five entry modes that accept almost nothing: "I noticed something", "I want players to feel something", "I like a game, but", "I have a constraint", "I do not know what to make". A sixth, "I watch a market", opens the Idea Shaper. The chain, shown one step at a time with a step bar:

    Observe -> Signal -> Tension -> Opportunity -> Design question
            -> Design space -> Mechanisms -> Critique -> Converge
            -> Experiment -> Decide -> Idea Card

- **Opportunity is its own step.** A tension is observed. An opportunity is a claim that it is worth building for. Merging them is where "complaint becomes feature" mistakes happen.
- **Decide is first-class** (kill, iterate, prototype, commit). A process that cannot abandon an idea cheaply is not a design process.
- **Evidence levels** on every artifact (observed, reported, inferred, hypothesized, simulated, validated) are the main defence against AI-assisted false confidence.
- **Convergence** rates ten lenses high, medium, low or unknown with a reason, never a fake score.
- **The Idea Card** is the compression at the end, not the form at the start, and it feeds the Idea Shaper.

## AI collaboration model

AI is a partner per rung, never the decider. The Prompt Ladder (`#/ai/ladder`) has twelve rungs, each naming the human decision, the AI partner, a prompt and the failure to avoid.

| Rung | AI partner | Human keeps |
| --- | --- | --- |
| Observe | Observer | what is evidence |
| Signal to Tension | Opportunity analyst | what is interesting |
| Tension to Opportunity | Opportunity analyst | whether it is worth building |
| Opportunity to Design question | Question generator | which question matters |
| Design question to Design space | Space explorer | which axes are noise |
| Design space to Mechanisms | Mechanism designer | which mechanism is not a reskin |
| Mechanisms to Critique | Devil's advocate | what the critique kills |
| Critique to Hypothesis | Hypothesis framer | willingness to be wrong |
| Hypothesis to Prototype | Prototype designer | scope |
| Player evidence | Playtest analyst | interpretation and context |
| Evidence to Decision | none | the decision itself |
| Decision to Idea Card | Concept editor | the final words |

The rule throughout: **AI expands the design space, humans choose the direction, players provide reality.** The method works with the AI removed; every stage has a non-AI action.

## Key UX choices

- Paths are the front door for first-time visitors, because a graph is for relationships and a path is for learning. Paths only order references to content that already exists.
- Two lenses share one build, one search and cross-links.
- Topic tabs (Overview, Godot, Unity, Interview) are added, not a parallel page. Overview stays default because the eight-part argument is what the guide teaches.
## Research behind it

- **Game ideation** (Kultima; Wagar on design space). Ideas mature by bouncing and are fragmentary early, so capture fragments. Guided ideation beats free brainstorming. Mapping design-space axes before choosing a concept is right.
- **Progressive disclosure** (Nielsen Norman Group, IBM, GitHub Primer). Two levels at most, strong information scent, never hide essential information.
- **AI for creative work** (practitioner sentiment, 2024 to 2026). Use AI for exploration, comparison, critique, simulation and analysis; keep framing, taste and decision human. Avoid idea spam, premature convergence and proposal theater.
## Weaknesses the self-audit named

- The Idea Lab is linear. A non-linear canvas (drag artifacts, branch, compare concepts side by side) was not built.
- Convergence does not compare multiple concepts side by side, though the proposal asked for it.
- The tool UX pass was partial: the Idea Lab, Prompt Ladder and examples for the Loop and Canvas tools followed the new pattern; other tools kept older forms.
- Concept architecture shipped in bounded form: a concept index and an "Appears in" panel derived from existing `rel` links. There is no data-level canonical model where a concept is authored once and rendered in several domain structures.
- Search understands symptoms for smells via keyword lists, and topics via text, but has no symptom index across the guide.
- Reference art covered some games only; the rest used typographic tiles.
- The tidy tree holds names and scales by stacking and panning, but a domain with many topics makes a tall column, and cross-branch links show as one faint layer. Node search in the map and edge filtering were left for later.
- Verdict and confidence are qualitative by design. Where a reader wants a number, there deliberately is none.
