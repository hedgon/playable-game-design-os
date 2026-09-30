# Map re-check (built playable.html, mtime 2026-09-30 18:06; tested from about 18:12)
Screenshots: scratchpad/work/map-recheck/ (home-*, legend-*, tmap-*, d-topic-player, read-topic-1440, pathpage-1440, kbd-*). Scripted Playwright/msedge; times are wall-clock, no human hesitation measured. No page errors in any run.

## Task table (same eight tasks)
| # | Task | 1440 | 1920 | 375 | Result vs audit |
|---|---|---|---|---|---|
| 1 | First visit | all 15 domains + centre fit vertically (home-1440-dark/light); node text readable, "Next unread" and Legend in bar; toolbar still wraps to 2 lines ("content" drops) | same, fits, extra width empty | outline: centre + domains with "0 of N read", NEXT badge on first, all 15 reachable by scroll (home-375-dark) | Fixed at 1440/1920/375. Load about 1.0-1.3 s |
| 2a | Rollback netcode via map | not tried by clicking; still needs Engineering lens, Game Server, scan 9 topics (3-4 clicks); no find-in-map | same | outline: same path, plus scrolling | Not fixed |
| 2b | Same via search | 3 actions (Ctrl+K, type, Enter), 1.7-1.8 s | 1.8 s | 2.0 s | Unchanged, works |
| 3 | Unknown domain, pick 2 related | 2 actions; clicking a domain (even its + glyph) navigates to the domain page and hides the map (d-plus) | same | outline expands in place | Works, but home text still says "expand it in place" |
| 4 | Topic: related, games, smells, tools, paths | 1 click ("Show map"). Who is the player? shows Related (7), Games (2), Smells (2), Paths (2) (d-topic-player). Rollback shows Related (3), Also in Design (1), Paths (1). Right-hand leaves clipped at the pane edge, centre and domains cut at left | 1 click; fits better but centre node is cut at left (tmap-1920-light) | 1 click; topic outline with groups, why-text in place (tmap-375-dark) | Largely fixed (content), fit only partly |
| 5 | Path map | 1 action; stage node with "0 of 8 done", steps as children, centre node cut at left edge (pathpage-1440) | not re-shot | not re-shot | Good, framing rough |
| 6 | Project map | not re-tested in depth | - | - | Not re-checked |
| 7 | Keyboard only | 54 Tab presses to first map item (unchanged), then arrows/roving; focus ring now visible | 54 | 22 | Not fixed for Tab count; focus fixed |
| 8 | Progress | marked "Who is the player?" read: header 1/206, node shows green check, home domain "Player 1 of 5 read", Next unread moved to "Player motivation" (read-topic-1440) | same | same on outline | Fixed |

## MU status
| id | status | evidence |
|---|---|---|
| MU-1 purpose | Fixed (mostly) | Topic map now shows neighbourhood plus progress and a next cue; concept home is still similar to the rail, and the home panel still says "the index and the map do the same work" (stale copy) |
| MU-2 typed neighbours | Fixed | Games, Smells, Paths, Also in Design, Related groups (d-topic-player). Tools/checklists/prompts groups not seen on the two topics tried; legend lists them |
| MU-3 find in map | Not fixed | no find control; only "Next unread" |
| MU-4 mobile | Fixed | 375 outline, no half-visible canvas (home-375-dark, tmap-375-dark) |
| MU-5 framing | Partly fixed | Home fits. Topic map does not fit: leaves cut right and centre cut left at 1440, centre cut at 1920 (d-topic-player, tmap-1920-light) |
| MU-6 Tab stops | Not fixed | 54 at 1440/1920, 22 at 375 |
| MU-7 SR semantics | Fixed (by inspection) | role=tree/treeitem, aria-level, setsize, posinset, selected, aria-label incl. "not read yet, next unread"; live region present. Not tested with a screen reader |
| MU-8 focus | Fixed | thick ring on focused node (kbd-1440-dark) |
| MU-9 legend/why | Fixed | Legend button and panel (legend-1440-light); why-text shown in outline. Legend text is small and dense (about 10 px, 5 rows) |
| MU-10 progress | Fixed | see task 8 |
| MU-11 path lens link | Not re-checked | path page shows the path map directly |
| MU-12 labels | Partly fixed | node text now 11 px+ and readable; project labels not re-checked |
| MU-13 wide screens | Not fixed | 1920 has the same content, more empty space |
| MU-14 performance | Still fine | 1.0-1.3 s cold load from file, no errors |
Status line: fixed 8 (MU-1, 2, 4, 7, 8, 9, 10, 14), partly 3 (MU-5, 12; MU-1 nearly), not fixed 3 (MU-3, 6, 13), not re-checked 1 (MU-11).

## As a learner
The map now earns its place on a topic page: one glance shows what to read next, what is related, which games and smells illustrate it, and what is read. That is not something the index, list or search gives. Progress marks and the "Next unread" button work and are easy to understand. Light theme is very readable; dark is fine once settled. Legend answers "what do the dashed boxes mean". The phone outline is clear, easy to scroll and touch-friendly, though long.

## New findings, ranked
1. High: topic map is not fitted at 1440 (three-column layout). The far-right leaves (Pac-Man, Wii Sports, Netcode / game-server engineer) run off the edge, the centre and domain nodes are cut at the left, and the topic sits at the edge (d-topic-player). Suggest: fit to the visible subtree (topic + groups + open leaves) on load and after opening a group; auto-fit when a group opens; make the fit include leaves.
2. Medium: clicking a domain node or its + goes to the domain page and hides the map, while the home text says "Click a domain to expand it in place". Suggest: fix the copy, or make + toggle in place and the label navigate.
3. Medium: Tab count unchanged (54). Suggest: a "Skip to map" link, or Tab order with the map before the rail.
4. Medium: no find-in-map (MU-3); "Next unread" helps but does not find a named topic. Suggest: a small filter that highlights matching nodes, or a "Search" pointer.
5. Low-Med: on the topic page the map is behind "Show map" on desktop; the main connection view is a click away. Suggest: remember the choice or default open for topics with 2+ groups.
6. Low: toolbar wraps at 1440 with the three-column layout ("content" alone on a second row), and the legend text is small and dense.
7. Low: "Next unread" changes label per lens (Engineering vs Design), which is correct but the destination is not obvious when the lens differs from the current one.
8. Low: centre node cut at the left on path pages and at 1920 topic maps.
9. Low: 1920 uses no extra width (MU-13).

## Verdict
The rework works. The map now does a job the index, list and search do not: it shows a topic's neighbourhood (related, games, smells, paths, other lens) and reading progress with a Next unread cue, and the phone outline is a real improvement. It is clear and pleasant, especially in light theme. Remaining weak spots are fit and clipping on the topic map at desktop widths, stale "expand in place" copy, 54 Tab stops and no find-in-map. Not broken, no errors. Ship after fixing the topic-map fit.
