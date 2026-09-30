# Map UX audit (M1)
Screenshots: scratchpad/work/map-ux/. Automated with Playwright/msedge; times are scripted wall-clock, so hesitation notes come from screenshots and behaviour, not a human.

## 1. Research summary
Sources opened or search-verified (two fetches failed; marked):
- Nesbit & Adesope (2006), Review of Educational Research 76(3), 413-448. Verified via search of the abstract (full page fetch failed): 55 studies, 67 effect sizes, 5,818 participants, Grade 4 to postsecondary. Concept maps associated with better retention; effect small to large depending on use and comparison. Does not show: benefit of a big pre-made site-wide map for self-directed adult browsing; most studies were about studying or building a map for one lesson.
- Amadieu et al. (Open Univ. repository, about 2009; snippet-level check): prior knowledge and concept-map structure vs disorientation, cognitive load, learning (HIV hypertext task). Low-prior-knowledge learners felt more disorientation with a network map than a hierarchical one, and learned more conceptual knowledge from hierarchical; no difference for high prior knowledge. Does not show: large maps or field settings. Supports keeping the map a tree for novices.
- Ghoniem, Fekete & Castagliola (Information Visualization, 2005), via search summary: 7 tasks, random graphs of 3 sizes and densities, node-link vs matrix. Above about 20 nodes matrix beat node-link on most tasks; only path finding favoured node-link. Does not show: trees, or learning outcomes.
- Shneiderman (1996) "overview first, zoom and filter, details on demand": PDF fetched but unparseable; cited from prior knowledge, unverified here. A design guideline, not empirical.
- Not opened: Novak's concept-map work, NN/g mind-map article (URL 404), hairball literature.

Good for: seeing the structure and size of a field, orientation, finding related ideas by adjacency, progress by region. Bad for: finding a known item (search and lists win, confirmed below) and reading (nodes hold only titles). Evidence favours a small hierarchical per-topic or per-path map over one giant network for novices.

## 2. Task results
| # | Task | Width | Time | Clicks | Success | Problems |
|---|---|---|---|---|---|---|
| 1 | First visit, 5 s read | 1440 dark/light | first node 0.5-0.8 s | 0 | Partly | Centre "Make something people want to play" plus 15 domain boxes; last 2 (In-game AI, Studio) below the fold at 900 px (home-1440-dark.png). Purpose only stated in the right panel. |
| 1 | same | 375 | 0.67 s | 0 | Poor | About 7 of 15 domains visible; centre node off-screen; toolbar wraps; text is behind "content >" (home-375-dark.png). |
| 1 | same | 1920 light | 0.52 s | 0 | Partly | Same layout, extra width unused (home-1920-light.png). |
| 2a | "Rollback netcode" via map only | 1440, 375 | 7.3 s, 14 clicks scripted, not found | 14 | No | Not in the Design lens; it sits under Engineering > Game Server. Best path: lens, domain, scan 9 topics (3-4 clicks) if you already know. |
| 2b | Same via search | 1440, 375 | 2.2 s | 3 (Ctrl+K, type, Enter) | Yes | Lands on /map/t/server-rollback-netcode. Search wins. |
| 3 | Unknown domain (Game Server), pick 2 related | 1440 | about 2 actions | 2 | Yes | Domain nodes list the same 9 topics as the left rail and the right panel (eng-home.png, domain-1440.png). |
| 4 | From topic: related topics, games, smells, tools, paths | 1440 | 1 click (Show map) | 1 | Partly | Map shows domain siblings and 4 "leaf" related topics only. No games, smells, tools, checklists, prompts or paths (node kinds: center, domain, topic, leaf). Map hidden behind "Show map"; frame crops the centre and domain node (topicmap-1440.png). Leaf click navigates, browser Back returns. |
| 4 | same | 375 | - | - | No | Frame shows middle topics; the 4 leaves fall outside the viewport (scripted click failed "outside viewport") (topicmap-375.png). |
| 5 | Path map: where am I, what next | 1440 | 1 | 1 | Yes | Good: stage nodes "0/7 done", topics and games as children, "Next" bar, path list (pathmap-1440.png). In one probe the path page's "Map" control went to the concept map (/map), so the lens link is unclear. |
| 6 | Project map: one system's parts | 1440/375 | 1 | 1 | Yes | 9 domains with "3 parts" counts; labels long (e.g. "Engineering process: rules, red-first, migration PRs, E2E integrity"). proj-*.png |
| 7 | Keyboard only | 1440 | 55 Tab presses to first node | 55 | Yes, costly | role=button nodes, roving tabindex, arrows, Enter, Home. Container role=group with aria-label. No tree role, no level/position, no live announcement. Focus = thicker border only (kbd-focus.png). |
| 8 | Progress | 1440 | 0 | 0 | Partly | Domain nodes "0/9 read", path stages "0/7 done", header "Topics read 0/206". Read state on individual topic nodes not verified (I did not mark any read). |

Performance: wheel zoom, 80 frames: median 16.7 ms, p95 16.8 ms, max 33.3 ms. JS heap about 24.5 MB. No console or page errors in any run. Colour: both themes read; domain colours distinct but no legend; node text about 10-11 px.

## 3. Findings
| id | area | problem | evidence | severity | suggested change |
|---|---|---|---|---|---|
| MU-1 | Purpose | Concept map duplicates the left rail and concept index; the site says "the index and the map do the same work" | home panel text; domain nodes equal rail list | High | Give the map a job lists cannot do (cross-links, progress) or demote it |
| MU-2 | Integration | Topic map omits games, smells, tools, checklists, prompts, advanced paths | node kinds only center/domain/topic/leaf; task 4 | High | Typed neighbour nodes with legend and filter |
| MU-3 | Find known item | Map cannot find "rollback netcode"; search takes 3 actions, 2 s | task 2 | Medium | Add find-in-map that centres and highlights; point to search |
| MU-4 | Mobile | 375 px: half the domains and the centre off-screen, toolbar wraps, topic leaves off-screen, map and content mutually exclusive | home-375-dark, topicmap-375 | High | Default to outline on phones; map opt-in; fit including leaves |
| MU-5 | Framing | Home does not fit all 15 domains at 1440x900; topic map crops centre and domain nodes | home-1440-dark, topicmap-1440 | Medium | Fit whole tree on load; keep breadcrumb as location cue |
| MU-6 | Keyboard | 55 Tab stops before the map | task 7 | Medium | Skip-to-map link or earlier map in DOM |
| MU-7 | Screen reader | Flat buttons, no tree/level/position semantics, expansion not announced | svg role=group; nodes role=button | Medium | role=tree/treeitem with aria-level and aria-expanded, live status, or an outline alternative |
| MU-8 | Focus | Focus is only a thicker stroke; `.kgraph .node:focus{outline:none}` (playable.html line 1030) | kbd-focus.png | Low-Med | High-contrast offset ring |
| MU-9 | Legibility | No legend for colour, dashed vs solid edges, leaf meaning; leaf "why" text on hover only | screenshots, data-why | Medium | Legend; show why on focus and touch |
| MU-10 | Progress | Region counts are the map's clearest value, but no unread/next cue on nodes confirmed | task 8 | Medium | Read/unread styling, "next unread" |
| MU-11 | Path lens | Path map works well but entry via the path page's Map control landed on the concept map | task 5 | Low-Med | Make lens switch explicit; check the target |
| MU-12 | Labels | Long project labels, 10-11 px text | proj screenshots | Low | Wrap with tooltip; raise minimum size |
| MU-13 | Wide screens | 1920 shows no extra information | home-1920-light | Low | Use width for detail or leaves |
| MU-14 | Performance | Fine: 0.5-0.8 s render, 16.7 ms median frame, 24.5 MB heap | measurements | None | Re-test once leaf/game nodes are added |

## 4. Verdict
Worth changing, with a smaller default role for the concept home. Keep it: it is smooth, error-free, hierarchical (which the Amadieu findings favour for novices), and the path and project maps do real work. But the concept home and domain views repeat the rail and index, cannot find a known item (search is 3 actions), and phones are poor. The unrealised value is cross-linking and progress: the topic map should show the games, smells, tools, checklists, prompts and paths tied to a topic, which no list shows in one view. Recommended: feature the topic and path maps, make the concept home secondary (outline first on phones), add find-in-map, a legend, better fit, tree ARIA and a skip link. Caveats: no human hesitation measured; leaf-level read state untested; Novak, NN/g and hairball literature not opened; Shneiderman cited unverified.
