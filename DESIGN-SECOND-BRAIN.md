# The game design second brain: architecture and method

This is the reasoning behind the redesign, kept as a working document. It is not a
sales page; the self-audit at the end lists what is still weak.

## Old architecture, new architecture

**Old.** A radial brain map was the front door and the only navigator. A topic lived
in a reading drawer beside the map, and every other view replaced the map, so you had
to click a floating dock to get back. Ideation was a single fifteen-field form (the
Idea Shaper) that produced a report. The map was attractive, but a radial fan cannot
hold names as nodes grow: labels shrink, rotate, truncate, and the only way to read a
node was to hover.

**New.** Three layers that do different jobs.

- **Index** (left): domains and topics, named and counted, with a search box. Expand
  what you need.
- **Mind map** (centre): the always-visible map, drawn as a horizontal collapsible tidy
  tree. The goal sits in the middle with the fourteen domains split into two balanced
  groups, one on each side, and a domain's topics on the next layer while it is open.
  Selecting a topic grows another layer of smaller nodes: the concepts it relates to, the
  smells it diagnoses and the tools it points to. Faint dashed cross-branch links connect
  domains to each other, an open topic to a related concept's domain, and a leaf back to
  its home domain, and hover highlights a node's links. Nodes are labelled cards joined by
  smooth curves, so names never depend on hover, and the tree grows by stacking and panning
  rather than by shrinking a circle.
  Dragging a node nudges its whole branch (persisted per node key; **drag** puts the nodes
  back in the tidy layout and **default** collapses every branch and fits the overview);
  dragging empty space pans, and wheel or pinch zooms. Every gesture is
  pointer-based, so mouse and touch behave the same.
- **Content** (right): whatever you are reading or doing.

All three are visible at once on desktop; panels are resized by dragging the dividers and
collapsed from the toolbar. On phones the index and content are slide-over drawers with a
tap-away scrim, and the map fills the width.

This replaced a radial map whose fan could not hold names as the content grew. Expanding
the circle and shrinking the nodes both hurt readability, so the map is a tree now. The
principle: a graph is for relationships, a list is for navigation, a workflow is a flow, a
diagnostic is a decision tree.

## Ideation methodology (the Idea Lab)

An idea is a chain of reasoning, not a filled-in form. The Idea Lab (`#/lab`) is the
first door. Five entry modes accept almost nothing: "I noticed something", "I want
players to feel something", "I like a game, but", "I have a constraint", "I do not
know what to make". They feed a chain of small artifacts:

    Observe -> Signal -> Tension -> Opportunity -> Design question
            -> Design space -> Mechanisms -> Critique -> Converge
            -> Experiment -> Decide -> Idea Card

Two refinements to the flow this was built from matter. First, **Opportunity** is its
own step: a tension is something you observed, an opportunity is a claim that it is
worth building for, and collapsing the two is where "complaint becomes feature"
mistakes happen. Second, **Decide** is a first-class step (kill / iterate / prototype /
commit): a process that cannot abandon an idea cheaply is not a design process.

Every artifact carries an **evidence level** (observed, reported, inferred,
hypothesized, simulated, validated). This is the main defence against AI-assisted
false confidence. Convergence uses ten lenses rated high / medium / low / unknown with
a reason, never a fake score, because a number would pretend to an objectivity the
judgement does not have. The Idea Card is the compression at the end, not the form at
the start; it feeds the Idea Shaper tool.

## AI collaboration model

AI is a partner per rung, never the decider. The Prompt Ladder (`#/ai/ladder`) is the
visual form of this: twelve rungs, each naming the human decision, the AI partner,
a prompt, and the failure to avoid.

| Rung | AI partner | Human keeps |
| --- | --- | --- |
| Observe | Observer | what is evidence |
| Signal -> Tension | Opportunity analyst | what is interesting |
| Tension -> Opportunity | Opportunity analyst | whether it is worth building |
| Opportunity -> Design question | Question generator | which question matters |
| Design question -> Design space | Space explorer | which axes are noise |
| Design space -> Mechanisms | Mechanism designer | which mechanism is not a reskin |
| Mechanisms -> Critique | Devil's advocate | what the critique kills |
| Critique -> Hypothesis | Hypothesis framer | willingness to be wrong |
| Hypothesis -> Prototype | Prototype designer | scope |
| Player evidence | Playtest analyst | interpretation and context |
| Evidence -> Decision | none | the decision itself |
| Decision -> Idea Card | Concept editor | the final words |

The rule throughout: **AI expands the design space, humans choose the direction,
players provide reality.** The methodology works with the AI removed; every stage has a
non-AI action.

## Key UX changes

- Form to chain: the Idea Shaper was fifteen fields before any thinking. It is now the
  Idea Card, produced after the Idea Lab chain.
- Persistent rail: navigation no longer replaces the map or requires a return click.
- Named, scalable navigation: names never depend on hover.
- Progressive disclosure: each artifact is one question, an example behind a toggle,
  and a stage-specific prompt.
- Evidence levels on claims, and confidence instead of scores at convergence.
- Symptom router on the home panel ("What are you trying to solve?") that routes ten
  common symptoms into the smell, cause, and experiment.
- Reference library with official local art, and a system map that wraps node names.
- Tab strip on every topic (Overview / Godot / Unity / Interview), added rather than
  a second parallel page, so a topic still has exactly one URL and one place in the
  map and rail. Overview stays the default tab because the eight-part practical
  argument is what the whole guide teaches; the engine and interview material are a
  translation of that argument for a specific audience (an implementer in a specific
  engine, an interviewer), not a replacement for it, and a reader who came for the
  design thinking should never have to click past code or interview questions to
  reach it.
- A second map sharing one stage: opening a project under Experience does not open a
  separate view, it swaps what the same centre mind map draws, systems and parts
  instead of domains and topics, with the same drag, zoom, fit and reset gestures a
  reader already knows. The two maps never fight over state (each keeps its own open
  branch, offsets and camera) and stay connected in both directions: a part's guide
  topics are leaves that travel onto the domain map, and a topic gains a chip back to
  every part that demonstrates it in practice.

## Research notes

- **Game ideation** (Kultima; Wagar on design space; design-ideation literature).
  Ideas mature by bouncing and are fragmentary early, so capture fragments rather than
  demanding finished fields. Guided ideation supports beat free brainstorming.
  "Design space" is how many differentiated things a mechanic affords, which is why
  mapping axes before choosing a concept is right.
- **Progressive disclosure** (Nielsen Norman Group; IBM; GitHub Primer). Two levels
  at most, strong information scent, reveal on demand, never hide essential
  information. Applied to every tool.
- **AI for creative work** (practitioner sentiment, 2024 to 2026). Use AI for
  exploration, comparison, critique, simulation and analysis; keep framing, taste and
  decision human. Avoid generic idea spam, premature convergence and proposal theater.
- **Existing guide principles** (say/do/context, hypothesis-driven design, content
  multiplies systems) are preserved rather than replaced.

## Self-audit and remaining weaknesses

- The **Idea Lab is linear** in the rendered order. It is resumable and every artifact
  is independent, but a true non-linear canvas (drag artifacts, branch, side-by-side
  concept comparison) is not built.
- **Convergence** gives structured judgement, but does not yet compare multiple
  concepts side by side. The proposal asked for it.
- The **tool UX pass is partial**: the Idea Lab, the Prompt Ladder and examples for
  the Loop and Canvas tools follow the new pattern; the other tools still use their
  older forms.
- **Concept architecture** now ships in a bounded form: `#/concepts` lists all 90
  concepts ranked by how many other concepts reference them, and every topic page has an
  "Appears in" panel showing its home domain plus every concept that references it, the
  smells it diagnoses and the loops it serves. The article is not duplicated. What is not
  built is a data-level canonical model where a concept can be authored once and rendered
  in several domain structures; the relationship layer is derived from the existing `rel`
  links instead.
- **Search** understands symptoms for smells via keyword lists, and topics via their
  text, but there is no dedicated symptom index across the whole guide.
- **Reference art** covers eleven of fifteen games; four use typographic tiles.
- The **mind map** is a horizontal tidy tree with four layers used (goal, domains, topics,
  selected-topic leaves). It holds names and scales by stacking and panning, but a domain
  with very many topics makes a tall column, and the cross-branch links show as one faint
  dashed layer; a future pass could add node search-in-map or edge filtering.
- Verdict and confidence are qualitative by design. Where a reader wants a number,
  there deliberately is none.
