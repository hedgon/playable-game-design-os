# Map layout and spacing: research and recommendation

Scope: horizontal tidy tree of labelled cards (src/89-graph.js, camera in src/91-map.js). Not covered here: colour, fonts, animation, layout family (decided). The earlier usefulness research (docs/_archive/map-audit/findings-map-ux.md) is not repeated.

Evidence labels: **Confirmed** = I read the source page or abstract named. **Snippet-only** = I saw a search-result summary, not the page. **Heuristic** = practitioner rule with no evidence behind it. **Computed** = my own arithmetic on this repo's constants (scripts in the session scratchpad, not in the repo).

## 1. What the code does today (read, confirmed)

- Gaps (graph units): GAP_X domain 40, topic 56, group 44, leaf 36, item 36; GAP_Y domain 4, topic 8, group 8, leaf 6, item 6. Phone caps GAP_X at 20 and caps card widths (centre 190, domain 150, topic 190).
- Every tree edge is one cubic `M sx,sy C mx,sy mx,ey ex,ey` with `mx` at the midpoint (src/89-graph.js:156-158), stroke about 1.4, opacity .55-.7.
- The camera never shrinks labels below 11 px: `keepReadable` clamps the window and pans instead (src/91-map.js:375-434). `branchFrame` frames the selected node plus its children and aims for labels of 11-14 px. So horizontal space is a budget measured in label pixels, not a free parameter (section 4).

## 2. Defaults of tools and libraries, as ratios

Ratios use this map's topic card (300 wide x 34 high) as the yardstick for absolute-pixel tools, because most libraries publish absolute defaults, not ratios.

| Tool | Level gap (default) | Sibling gap (default) | Level gap / card width | Sibling gap / card height | Source and status |
|---|---|---|---|---|---|
| Graphviz dot | ranksep 0.5 in | nodesep 0.25 in; default node 0.75 x 0.5 in | 0.67 (own default node, rankdir=LR) | 0.5 (own default node) | Confirmed: [ranksep](https://graphviz.org/docs/attrs/ranksep/), [nodesep](https://graphviz.org/docs/attrs/nodesep/), [width](https://graphviz.org/docs/attrs/width/). Level:sibling = 2:1 |
| ELK layered | nodeNodeBetweenLayers 20 | spacing.nodeNode 20 | 0.07 | 0.59 | Confirmed: [between layers](https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-spacing-nodeNodeBetweenLayers.html), [nodeNode](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-nodeNode.html). 1:1. Spacing starts at the node margin, not the border ([doc](https://eclipse.dev/elk/documentation/tooldevelopers/graphdatastructure/spacingdocumentation.html)) |
| ELK mrtree | not separate | nodeNode 20, edgeNode 3 | n/a | 0.59 | Confirmed: [mrtree](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-mrtree.html) |
| yFiles LayeredNodePlacer | layerSpacing 40 | spacing 20 | 0.13 | 0.59 | layerSpacing Confirmed ([Java API](https://docs.yworks.com/yfiles/doc/api/y/layout/tree/LayeredNodePlacer.html)); spacing 20 Snippet-only (search summary of the HTML API). Bus alignment default 0.5, i.e. the connector trunk sits midway between layers (same Java page) |
| GoJS TreeLayout | layerSpacing 50 | nodeSpacing 20; rowSpacing 25; breadthLimit 0 | 0.17 | 0.59 | Confirmed: [GoJS TreeLayout](https://gojs.net/latest/api/symbols/TreeLayout.html). 2.5:1 |
| dagre (Mermaid's engine) | ranksep 50 | nodesep 50, edgesep 10 | 0.17 | 1.47 | Confirmed: [dagre wiki](https://github.com/dagrejs/dagre/wiki). 1:1 |
| markmap (horizontal mind map, closest analogue) | spacingHorizontal 80 | spacingVertical 5; paddingX 8; nodeMinHeight 16 | 0.27 | 0.15 (0.31 of its own 16 px row) | Confirmed: [markmap constants](https://raw.githubusercontent.com/markmap/markmap/master/packages/markmap-view/src/constants.ts). 16:1. Text rows without card borders |
| d3.tree | none in px; `separation` = 1 for siblings, 2 for non-siblings; `nodeSize([dx,dy])` | same | n/a | n/a | Confirmed: [d3-hierarchy tree](https://d3js.org/d3-hierarchy/tree). You choose dy; the library only fixes the 1:2 sibling:cousin ratio |
| d3-flextree | `spacing` default 0 | same | n/a | n/a | Confirmed: [d3-flextree](https://github.com/Klortho/d3-flextree) |
| **This map today** | 40 / 56 / 44 / 36 | 4 / 8 / 8 / 6 | 0.16 domain, 0.19 topic, 0.15 leaf | 0.11 domain, 0.24 topic, 0.23 leaf | Confirmed (code). Level:sibling about 7-10:1 |
| XMind, MindNode, Miro, Obsidian Canvas | no published numeric defaults found | | | | One search for XMind found nothing numeric; the others not found. Not claimed |

Reading the table honestly:

1. In absolute terms the level gaps (36-56) are already in the middle of the library defaults (20-80). Library defaults therefore do not by themselves justify "wider". They are tuned for fans of 2-5 children and for nodes of 100-150 px, not 11-14 siblings in 250-300 px cards. Only markmap, built for outlines with many children, goes to 80.
2. The sibling gap is the outlier: 4-8 units is below every default except markmap's 5, and markmap draws no card borders. Three libraries use 20 between box nodes. That, not the level gap, is the likely source of "cramped".
3. The level:sibling ratio is high in this map (7-10:1) versus 1:1 to 2.5:1 in tools. Proximity grouping is not the problem; the level gap is long enough compared with sibling gaps. The fan of edges inside it is.

## 3. Research findings

| # | Finding | Status | Implication here |
|---|---|---|---|
| R1 | Edge crossings are by far the most important aesthetic for understanding; bends and symmetry matter less; maximising the minimum angle at a node and snapping edges to an orthogonal grid had no significant effect. Purchase, GD 1997. [Monash record](https://research.monash.edu/en/publications/which-aesthetic-has-the-greatest-effect-on-human-understanding/) | Confirmed (abstract only; general small graphs, not trees) | A tree has no crossings by construction, so crossing research does not argue for width. It also gives no reason to avoid elbow (orthogonal) edges. Cross-links drawn over tree edges are the only crossings; keep them faint (already) |
| R2 | After path length, continuity (multi-edge paths as straight as possible) and edge crossings are the most important factors. Ware, Purchase, Colpoys, McGill, Information Visualization 2002. [Monash record](https://research.monash.edu/en/publications/cognitive-measurements-of-graph-aesthetics/) | Snippet-only (search summary; task was shortest-path in spring layouts) | Tracing root > domain > topic > leaf is a path task. Edges that enter and leave each card horizontally preserve continuity; steep S-curves squeezed into a narrow band break it |
| R3 | Curved vs straight edges differ significantly; clear differences between curvature variants. Xu et al., TVCG 2012. [MDX record](https://repository.mdx.ac.uk/item/84218) | Abstract Confirmed; the direction (curves slower) is Snippet-only (search summary). General graphs | No evidence that curves help legibility. Weak evidence against strong curvature. The curve is an aesthetic choice here, not an evidence-backed one |
| R4 | Grouping by uniform connectedness and common region is a stronger cue than proximity as the number of groups grows; proximity is as fast as connectedness only with few groups. Palmer and Rock 1994 (via search summaries of the literature, e.g. [UCL copy](https://discovery-pp.ucl.ac.uk/id/eprint/3782/1/3782.pdf)) | Snippet-only | A visible shared trunk (connectedness) says "these 13 cards belong to that parent" better than widening gaps does. Widening relies on proximity alone |
| R5 | Tidy-tree algorithms optimise compactness: same-depth nodes aligned, parent centred over children, identical subtrees drawn identically, drawing as narrow as possible. Reingold and Tilford 1981 ([secondary summary](https://towardsdatascience.com/reingold-tilford-algorithm-explained-with-walkthrough-be5810e8ed93)); Walker's and Buchheim et al.'s versions handle unbounded degree in linear time ([Springer, GD 2002](https://link.springer.com/doi/10.1007/3-540-36151-0_32), via search summary) | Snippet-only | The algorithms are built to be narrow; breathing room is the caller's separation setting, which is why d3 and flextree expose it. This map already meets the centred-parent and aligned-column criteria |
| R6 | In menu/web hierarchies, depth hurt search; a medium breadth/depth mix beat the broadest, shallowest one. Larson and Czerwinski, CHI 1998. [Microsoft Research](https://www.microsoft.com/en-us/research/publication/web-page-design-implications-memory-structure-scent-information-retrieval/) | Confirmed (abstract; breadth numbers not seen) | No evidence that 11-14 siblings need folding; the tested "broadest" cases were larger. Do not add a level to split 14 items |
| R7 | Overview+detail, zooming, focus+context and cue-based highlighting are the four ways to manage large spaces. Cockburn, Karlson, Bederson, ACM Computing Surveys 2008. [Microsoft Research](https://www.microsoft.com/en-us/research/?p=155152) | Snippet-only (abstract via search) | The map's "pan at a readable zoom floor" is zooming; dimming non-active branches is the cue-based option and costs no width |
| R8 | Node-link beats matrix only for path finding; above about 20 vertices matrix wins on most tasks. Ghoniem et al., 2005 | Snippet-only; random general graphs, cited by the archived audit | Not applicable to a tree; listed so it is not re-read |
| H1 | "Golden ratio" or "1.618" gap rules in blog posts | Heuristic, no evidence | Not used |
| H2 | "7 plus or minus 2" as a limit on children per node | Heuristic here (Miller was about working-memory span, not on-screen lists) | Not used as a folding threshold |
| H3 | Microsoft SmartArt/Google org-chart "hanging" layouts for many reports (a vertical stack hung off a trunk) | Heuristic; not verified in this session | Same shape as the elbow connector recommended below |

### Computed: why widening alone does not fix the smear

For a parent with N children at pitch p, the current cubic has every edge pass through the same few units near the parent and separate only near its own child. Min distance between adjacent edges, as a share of the band (edges must be 4 or more units apart to read as separate lines at stroke 1.4):

| Fan | Band 40-56 (today) | Band 96-120 |
|---|---|---|
| 13 children, pitch 42-44 | 28-36% of the band clear; outermost edge about 84 degrees from horizontal | 48-57% clear; about 77-80 degrees |
| 7 children (root to one side, pitch 40-44) | 44% clear at band 40 | 70% clear at band 96 |

Doubling the band lifts a 13-child fan from about a third to a bit over half clear, which is a real gain but leaves the outer edges almost vertical, because the fan's height (about 550 units) stays 5 to 10 times its width. Widening helps; a trunk-and-stub connector removes the problem (stubs are parallel, one pitch apart, over the whole stub length).

## 4. The pane budget (Computed)

On-screen label size = label size in graph units x pane width / frame width, capped at 14, floored at 11 by `keepReadable`. Frames are what `branchFrame` shows. Assumed pane widths: 576 (1280 screen), 680 (1440), 920 (1920).

| Frame | Gap | 576 px | 680 px | 920 px |
|---|---|---|---|---|
| domain + topics (label 13) | 56 today | 11.4 | 13.5 | 14 |
| | 80 | 11.0 | 13.0 | 14 |
| | 104 | 10.6 | 12.5 | 14 |
| | 120 | 10.4 | 12.3 | 14 |
| topic + leaves (label 12) | 36 today | 11.1 | 13.2 | 14 |
| | 64 | 10.7 | 12.6 | 14 |
| | 96 | 10.2 | 12.0 | 14 |
| root + domains (one side, label 13) | 40 today | 13.5 | 14 | 14 |
| | 80 | 12.6 | 14 | 14 |
| Phone 350 px: domain 150 + topic 190 | 20 today | 11.2 | | |
| | 24 / 28 / 32 | 11.0 / 10.9 / 10.8 | | |

Reading it: at the 1440 reference width, gaps roughly twice today's still leave labels around 12.5 px, above the 11 px floor. At 1280 the labels are at the floor even today, so extra width means a few percent more panning (the existing clamp handles it). At 1920 the cap of 14 px applies, so extra gap is free. On a phone there is no slack: a gap above about 24 pushes labels under 11 px, so the phone should not get wider gaps unless card widths shrink.

## 5. Recommendation

### Gaps (graph units)

| Level | GAP_X today | Desktop | Phone | GAP_Y today | Desktop and phone |
|---|---|---|---|---|---|
| root to domain | 40 | **80** | 20 | domain 4 | **8** |
| domain to topic | 56 | **104** | 24 | topic 8 | **10** |
| topic to group | 44 | **64** | 20 | group 8 | 8 (keep) |
| topic or group to leaf/item | 36 | **64** | 20 | leaf/item 6 | **8** |

Reasoning:
- About 1.8 to 2 times the level gap lands at markmap's 80, the only many-children tool in the table, and keeps 12-13 px labels at 1440. Going to 120+ buys little more edge clarity (57% clear at 120 vs 55% at 112 for 13 children) and costs label size.
- Sibling gaps go to 8-10 because box cards at 4 units (about 3.5 px on screen) sit nearer than every tool default except text-only markmap. Cost: 14 domains rise from 560 to 616 units tall and 13 topics from 546 to 572. Keep the level:sibling ratio at 8-10:1, so proximity still shows levels (the tools use 1:1 to 2.5:1; this map stays well above that).
- Phone: do not widen X. The 11 px floor leaves about 4 units of slack. Spend the phone's slack vertically (GAP_Y), which pans naturally.
- Optional (judgment, not evidence): derive the gap from the pane width so a wide pane spends its slack on gaps. Not required for the number above.

### Edge shape

Primary: replace the S-curve with a **rounded elbow with a shared trunk** for every tree edge: horizontal from the parent edge to a trunk at 50% of the gap (yFiles default bus alignment is 0.5), vertical along the trunk, horizontal stub into the child with a corner radius of about 8 (never more than half the vertical step). Draw one trunk path per parent and one stub per child, solid, with opacity on the group, so the shared trunk does not darken from overlapping alpha and dashes do not misalign on shared segments. Keep dashes for cross-links only, which also gives the legend a clean "solid = parent/child, dashed = related" rule.

Why: R4 (connectedness beats proximity as groups multiply), R1 (orthogonal edges are not penalised; crossings are the only strong effect and a tree has none), R2 (horizontal entry and exit keep continuity), and the computed fan table (stubs stay one pitch apart for their whole length). On phone the same shape works inside a 20-24 band: trunk at about 8, stub about 12-16, which curves cannot offer.

Fallback if curves must stay: keep the cubic, use the widths above, and move the control-point share from 0.5 to about 0.3 to 0.35 so the vertical move happens near the parent and each edge runs horizontal for more of its length at the child end. This is my geometric reasoning, not tested; check by screenshot.

### Tall sibling columns (11-14 topics)

- Do not fold or add a level. R6 gives no support (depth hurt; the broadest cases tested were larger than 14), and the leaf column already collapses groups above 6 (`GROUP_OPEN`).
- Make the fan legible with the elbow trunk plus the wider band. Parent stays centred on its children (the Reingold-Tilford criterion the code already meets).
- Use a cue (Cockburn's cue-based option) instead of width: draw the open or hovered parent's trunk and stubs at full strength and the rest at low opacity. The CSS already has `.open` and `.hl` states.
- Where several parents share a column (path stages with steps, project parts), set the gap between subtrees to about 2 times the sibling gap, as d3's default separation does (1 sibling, 2 non-sibling). In the concept map only one topic opens leaves at a time, so this is low priority there.

### Keeping it readable when the tree gets wider

- Keep the 11 px floor and the pan-at-floor behaviour; do not fit the whole tree. The budget table shows the recommended gaps cost about 1 px of label size at 1440.
- Verify by geometry, not by eye: the smoke test already measures label px; add the same measurement at 1280 and 1440 for the recommended gaps, and confirm the domain+topics frame stays at 11 px or more where practical.
- Horizontal scrolling as a separate control is not recommended; the camera already pans, and the fade-right cue exists for "more this way".

## 6. Set aside

| Considered | Why set aside |
|---|---|
| Golden-ratio or fixed-ratio spacing rules | Practitioner heuristic with no evidence; absolute label pixels are the real constraint |
| "7 plus or minus 2" child limit | Heuristic; not about on-screen lists; R6 argues against extra depth |
| Folding 11-14 siblings into "more..." nodes | No evidence of benefit at this size; adds a click per topic; hides the list the map exists to show |
| Wrapping siblings into several columns (GoJS breadthLimit/rowSpacing, yFiles multi-row) | Breaks the one-column-per-level reading that makes the tree scannable |
| Gaps of 120-160 | Edge clarity gains flatten (57-65% clear) and 680 px labels drop to 11.7-12.3 px |
| Widening the phone gap | The 11 px floor leaves about 4 units of slack |
| Straight diagonal edges | Fan is tall and narrow; diagonals converge at the parent like the curves do; no evidence they are clearer |
| Edge bundling | Meant for dense cross-links, not a clean tree; hides which child is which |
| Ghoniem et al. matrix vs node-link | Random general graphs; the layout family is decided |
| Purchase minimum-angle and symmetry results | Not significant or not applicable to a tree |
| Per-tool XMind, MindNode, Miro, Obsidian Canvas defaults | No published numbers found in budget; not claimed |
| Org-chart style references (Microsoft, Google) | Not verified in this session; used only as a labelled heuristic |
| d3 `nodeSize` and flextree internals | They accept caller spacing; no numbers to borrow |
| Colour, fonts, animation, radial or force layout | Out of scope or decided |

## 7. Judgment calls and limits

- Pane widths (576, 680, 920) are my estimates from "45-50% of a 1440 screen"; label sizes assume `labelPx` is the smallest label font in graph units (it is read that way at src/91-map.js:753). Real numbers need a measurement in the app.
- The fan table and pane budget are my arithmetic, not literature; the 4-unit separation threshold is my choice (about 3 stroke widths).
- Purchase 1997 is abstract-only; Ware 2002, Xu 2012, Palmer and Rock 1994, Cockburn 2008 and Ghoniem 2005 are snippet-level. The full Xu paper (403) and the Springer chapter (login redirect) could not be read.
- No spacing numbers exist in the literature for this exact case; the recommended gaps follow from the tool defaults, the computed geometry and the label-size budget. They should be tuned with a screenshot at 1280, 1440 and 350 px before shipping.
