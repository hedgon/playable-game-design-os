# Learner walk 2: verification of L1 to L12 and new findings

Edge via Playwright on `playable.html`, fresh state, 1440x900 and 375x812. Screenshots in `..\work\learner2\` (prefix d- desktop, m- phone). Personas: A = Gameplay engineer, Godot (all of stage 1, stage 2 to the checkpoint and skip); B = Systems designer (stages 1 to 4 walked to the checkpoints, all continue clicks ran).

## 1. L1 to L12

| id | status | evidence | remaining gap |
|---|---|---|---|
| L1 | fixed on desktop, partly on phone | d-step1.png shows "Your task: ... 20 min" in the sticky bar; m-step1-scroll.png | On phone the bar sticks at y=200, not at the top (N1), and takes 130 px. |
| L2 | fixed | Godot stage 1: 7 clicks of "Mark done and continue" move topic, topic, tool, topic, topic, engine, topic, then the checkpoint; URL changes each time; Systems designer 30 clicks, none stuck | none |
| L3 | fixed | chooser (Program gameplay / Some experience / 5 hours) suggests "Gameplay engineer, Godot ... 14.25 hours, about 3 weeks at 5 hours a week", Unity and AI path under "Also fits" | Prerequisite chip "Game designer foundations" on the path is still a plain chip to check; not tested as a link. |
| L4 | fixed | Godot stage 1 lists "The core loop", "The core loop: in Godot", "Meaningful decisions: in Godot", one "Godot guide" (d-path.png) | AI path not re-walked. |
| L5 | fixed | d-r_map.png (domain labels readable), d-step1.png topic text-first with "Show map" | none |
| L6 | fixed | Make (d-sec-MAKE.png), Diagnose (d-sec-DIAGNOSE.png), Paths, Library all have a section-specific left column or none | Library and Projects have no left column at all (fine). |
| L7 | partly fixed | Header strip fits (m-home.png), drawer opens and Escape closes (m-drawer.png), topics open as full pages | "More" opens a menu that cannot be seen or clicked on every phone page except Map (N2). |
| L8 | fixed on desktop, partly on phone | `#/games/sonic/gameplay` from a path lands on the lens card just under the bar (d-lens-gameplay.png) | On phone the lens heading lands under the misplaced bar (m-lens-gameplay.png, N1). |
| L9 | fixed | Library "What it teaches" and lens chips (d-sec-LIBRARY.png); smell page ends with "See it in games" + "All 78 games" (d-smell-games.png) | Chips push games below the fold on phone (N5). |
| L10 | partly fixed | Desktop Make left column groups tools by job with "Start here" on Idea Shaper (d-sec-MAKE.png) | On phone the grouped tool list is only in the drawer; the Make page shows only the Idea Lab text (m-make.png), so tools are hidden (N6). |
| L11 | fixed (one entry) | One PROJECTS entry, no sidebar duplicate (d-sec-PROJECTS.png) | Still named "Projects"; content is anonymised case studies (N9). |
| L12 | fixed | Guide cards link to paths (checked via route list; not re-screenshot) and hint text now points to How to use this site | Not re-verified visually at 375. |

## 2. New findings (ranked)

| id | area | where | what happened | why it matters | suggested change | effort |
|---|---|---|---|---|---|---|
| N1 | UI | sticky path bar on every step page at 375 | The bar is `position: sticky` with top about 200 px on phone. Unscrolled it sits under a blank gap (m-step1.png). Scrolled, page text shows above it and it covers 130 px (16% of the screen) in the middle (m-step1-scroll.png). On lens deep links the lens heading lands under it (m-lens-gameplay.png). Desktop is fine (top 74 px) but a 14 px strip of scrolled text shows above the bar (d-afterdone/d-lens-gameplay). | The one element meant to keep the task in view covers content on the device that has least room. | Set sticky top to the header height on phone (about 96 px). Collapse the task line to one row with "More" (already there) by default. Give the pane a top padding so no text shows above the bar. | S |
| N2 | navigation | "More" menu at 375 on Paths, Library, Make, Diagnose, Guide, AI, Projects | Tapping More sets aria-expanded true and the menu exists (opacity 1), but `elementFromPoint` at the menu returns the page pane, so AI Workflow and Projects are covered and unclickable (m-more2.png). Only the Map page shows it. | Two of seven sections cannot be reached from the phone header. | Give the menu a z-index above `#pane` (and a shadow/border). Add a smoke check that clicks an item at 375. | S |
| N3 | accessibility | phone Tab order | Tab enters the off-canvas path drawer while it is closed ("Jump to a path", index links at x = -313) (Tab 12 to 40 on the path page); 12 stops to leave the header and then a lot of invisible stops. Opening the drawer does not move focus into it. | Keyboard and switch users tab into content they cannot see. | Set the closed drawer to `inert`/`visibility:hidden`; move focus into it on open and back to the button on Esc (Esc close works). | S |
| N4 | discoverability | Export / Import / Reset | Progress export and import work (1.4 KB JSON, wipe and import restored "3 / 35 steps" and Topics read 2/186) but they live only in the "?" keyboard-shortcuts dialog (d-helpmodal.png). | Anyone who fears losing localStorage progress will not look under "Keyboard shortcuts". | Add "Back up progress" link to the paths page or the footer, and name the dialog "Help and data". | S |
| N5 | UI | Library at 375 and 1440 | "What it teaches" (about 5 rows on desktop, a sideways-scrolling row on phone) then lens, shelves, genre, filter come before the first game. First card at y=700 on desktop and below the fold on phone (d/m-sec-LIBRARY.png). On phone the chip rows are cut off without a hint that they scroll. | Landing on the library shows controls, not games. | Collapse "What it teaches" to one row + "All topics" and make the lens chips a select on phone. Add a fade edge on scrollable rows. | M |
| N6 | navigation | Make at 375 | The desktop left column (tools by job, "Start here") does not appear on the page on phone; the page shows only Idea Lab text, and tools are behind ☰ or the "Build tools" tab (m-make.png). | The fix for L10 is desktop-only. | Show the job groups as a header block on phone, above Idea Lab. | M |
| N7 | UX | "Map" pill at 375 | A "◂ MAP" floating pill sits under the header on Paths, Library, Make, Review, Guide (m-home.png, m-r_library.png). On the map page it reads as a toggle. | A control that looks like a back button on pages that have no map. | Show it only where a map/list toggle exists, or label "Show map". | S |
| N8 | UX | path bar wording | On a checkpoint the bar reads "Next: The loop, in Godot checkpoint" and shows "Open the checkpoint" while the checkpoint is already open; before the first step it reads "· Next: The core loop" with a leading dot on desktop (d-path.png). | Small text glitches on the most viewed element. | Hide "Open the checkpoint" when already open; drop the leading separator; write "Next: checkpoint for The loop, in Godot". | S |
| N9 | navigation | Projects section | Label still "Projects"; cards are "Project S · Backend" anonymised interviews (d-sec-PROJECTS.png). | Reads as "my projects". | Rename to "Case studies". | S |
| N10 | UX | Review queue | Empty state explains how items arrive (d-review-empty.png). After "Review later" on 2 checkpoint questions: "Due today 0 of 2, next in 1 day; nothing is due today" (d-review.png). | Honest but a first-time learner cannot try the feature for a day. | Offer "Practise now anyway" on that screen. | S |
| N11 | UX | Topics read | Opening a topic page counts it as read (Topics read 1/186 after opening one; the index shows a tick) even if not scrolled or marked. | Inflates progress. | Count on "Mark done" for the path step or after scroll. | S |

## 3. What works well now

- Stage flow: one click moves step to step, the last step lands on the checkpoint, "Mark stage done" opens the next stage with an Undo toast; "Skip ahead" is a real self-check (four yes/no questions) and moves to the next stage.
- The task line is on every step page on desktop; the chooser now gives the right answer for the engineer persona and shows weeks at 5 h.
- Reload mid-path keeps stage, ticks and steps; export/import round trip works.
- Review queue: clear rules ("no streaks: skip a day and the queue simply waits"); the empty state says where items come from.
- Contextual left columns (Make groups, Diagnose symptoms) and the smell-to-games row.
- Escape closes the ☰ drawer; desktop Tab order is header first, with visible focus rings everywhere; no horizontal overflow at 375 or 1440 on the nine routes checked.
- Overall: a new learner now sees where to start (chooser, then path), what to do (task line) and how the library, topics, tools and paths connect (path steps alternate topic, tool, game, checklist). The remaining problems are phone-specific.
