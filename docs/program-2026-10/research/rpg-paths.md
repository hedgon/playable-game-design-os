---
status: research
updated: 2026-10-06
---

# A playable Dragon Quest-style path: evidence, precedents, tech, assets, accessibility

Scope: decide how to turn a learning path into a real, simple top-down RPG (overworld = path, towns and NPCs = steps, boss = the stage's recall questions). Builds on `learning-science.md` section 2 (Sailer & Homner, Deci, Habgood & Ainsworth, Rey, expertise reversal), which is not repeated here.

Labels: **Confirmed** = I read the source text. **Abstract/Snippet** = only an abstract or search-result snippet. **Heuristic/Opinion** = my inference, or knowledge I did not re-verify in this session. Sizes marked "measured" were downloaded and gzipped (`gzip -9`) by me on 2026-10-06.

## Headline findings

1. The evidence supports a game *if* the game is thin, schematic, single-player, played over several sessions, and gives informational feedback. It does not support story depth, realism or point systems as learning aids.
2. The commonest failure of RPG-wrapped learning (Prodigy) is the quiz as toll booth: the learner answers to unlock the "real" game. Dragon Quest's own grammar has no such layer, so a faithful port can avoid it.
3. Hand-written Canvas 2D is the only option that is safe from `file://`, small, and pixel-exact. Every engine tested is 70-350 KB gzipped, and the WebGL ones have a documented `file://` texture problem.
4. All needed art, a pixel font and sound can come from CC0/OFL/MIT sources. Avoid the LPC family.
5. Put dialogue, menus and the battle in real DOM over a canvas that only draws the map. That one decision serves accessibility, text size, zoom, translation and the "plain list" fallback.

---

## 1. Learning evidence for game-based learning (beyond learning-science.md)

| Finding | Source URL | Label |
|---|---|---|
| Clark, Tanner-Smith & Killingsworth 2016 (K-16, Review of Educational Research): games vs non-game instruction g = 0.33 (95% CI 0.19-0.48, k = 57); augmented vs standard game designs g = 0.34 (k = 20). The authors' point: design of the intervention matters as much as the medium. | https://pmc.ncbi.nlm.nih.gov/articles/PMC4748544 | Confirmed |
| Same: **multiple sessions** g = 0.44 [0.29, 0.59] vs **single session** g = 0.08 [-0.24, 0.39] (p = .03). | same | Confirmed |
| Same: **narrative**. Irrelevant story g = 0.63 vs relevant story g = 0.17 (p = .01). None/thin story depth g = 0.44-0.47 vs medium depth g = -0.03. These are observational moderator contrasts across different studies, so confounded; read as "no support for story as a learning aid", not as "story hurts". | same | Confirmed |
| Same: **feedback/scaffolding**. Success/fail/points g = 0.26; enhanced scaffolding 0.48; teacher-provided 0.58 (teacher vs points p = .05). | same | Confirmed |
| Same: **visuals**. Schematic g = 0.48, cartoon 0.32, realistic -0.01. | same | Confirmed |
| Same: **players**. Single non-collaborative 0.45 vs multiplayer/MMO -0.05 (p < .001). Game-mechanics sophistication: no significant differences. | same | Confirmed |
| Wouters et al. 2013 (J. Educ. Psychol. 105:249-265; 77 studies, N = 5,547): games beat conventional instruction for learning d = 0.29 and retention d = 0.36, but were **not** more motivating. Learners gained more when the game was **supplemented with other instruction**, with **multiple sessions**, and in **groups**. Games without narrative may have been more effective than games with narrative (not significant). Fuller moderator numbers were not retrievable (paywall; PDF unreadable). | https://research-portal.uu.nl/en/publications/a-meta-analysis-of-the-cognitive-and-motivational-effects-of-seri/ and https://karlkapp.com/?p=4333 | Abstract/Snippet |
| Mayer 2019, Annual Review of Psychology 70:531-549: value-added research points to five promising features: modality, personalization, pretraining, coaching, self-explanation. Games look promising versus conventional media in science, mathematics and second-language learning. Future work should pin down the mechanisms. I did not read the full text. | https://www.annualreviews.org/doi/10.1146/annurev-psych-010418-102744 | Abstract/Snippet |
| Time cost of mechanics: Habgood & Ainsworth 2011 (already in learning-science.md) found 7 times more free-choice play on the intrinsically integrated version. No meta-analysis I found measures time-on-task cost of game mechanics directly; Clark's "no difference by mechanics sophistication" is the closest. The cost question is therefore answered by case reports (section 2), not by pooled estimates. | https://shura.shu.ac.uk/3556/ | Abstract/Snippet |

**What helps:** several sessions, real feedback (more than points), schematic/cartoon art, single-player, instruction around the game (Wouters). Pretraining and coaching (Mayer) map directly onto "read the steps first, then fight" and "outline shown after your attempt".

**What does not:** story depth, realistic visuals, multiplayer, and points-only feedback. No evidence says a narrative wrapper adds learning.

**Recommendation for this site.** Treat the game as a thin, schematic skin over the existing instruction, not a replacement for it. That matches the evidence: steps stay the instruction (Wouters' "supplemented"), the boss is retrieval with outline feedback (Clark's enhanced scaffolding), and the existing spaced Review queue gives the multiple-session effect (single-session g = 0.08 is the warning: a game played once teaches little). Keep story to one-line NPC text. Pixel art counts as schematic. No co-op or leaderboard. No points: points-only feedback was the weakest feedback tier. The earlier verdict in learning-science.md still holds: nothing animated sits between the learner and content, and every region stays open.

---

## 2. Educational RPG precedents

| Finding | Source URL | Label |
|---|---|---|
| Prodigy (answer maths questions to cast spells/battle pets): the company's Council Bluffs study reports each extra hour answering questions in Prodigy associated with +0.73 scale-score points on the Iowa state test (grades 5-6). That is vendor-published and correlational. The company also states an independent ESSA Tier 3 rating, commissioned by itself. | https://www.prodigygame.com/blog/council-bluffs | Abstract/Snippet |
| Prodigy classroom observation (Morrison et al. 2020, via a teacher-education summary): students were engaged by the story and kept attention most of the time; one observed 8-year-old spent almost the whole session shopping, digging for bones and viewing pets; teachers asked for a time limit on shopping and avatar customisation. Only anecdotes; no percentage of on-task time exists in what I found. | https://ecampusontario.pressbooks.pub/techinthecurriculum/chapter/prodigy/ (page blocked to me; read via search snippets) | Abstract/Snippet |
| Prodigy criticism (advocacy source): 2021 complaint to the US FTC; in a 19-minute observation 16 membership ads vs 4 maths problems; claims about ~888 questions per test-score point (derived from the vendor's own numbers); cosmetic membership creating visible class inequity. Strongest claims are the advocates', not neutral research. | https://fairplayforkids.org/pf/prodigy/ and https://edweek.org/technology/popular-interactive-math-game-prodigy-is-target-of-complaint-to-federal-trade-commission/2021/02 | Confirmed for what Fairplay says; Opinion as to truth |
| Common Sense Media parent view: battles, pets and upgrade prompts distract; questions feel like a toll to reach play; core features behind membership tiers. | https://www.commonsensemedia.org/app-reviews/prodigy-kids-math-game | Abstract/Snippet |
| Classcraft: a classroom-management RPG layer, not a content game. One physics study: more time-on-task and perceived engagement, no clear difference on summative tests. IES-funded randomised study under way; I found no completed RCT. | https://ies.ed.gov/use-work/awards/initial-efficacy-study-classcraft-gamified-approach-classroom-management | Abstract/Snippet |
| CodeCombat: only small quasi-experiments (e.g. 49 grade-one students over two weeks; 32 vs 32 classes; one with a non-significant difference). Weak, short, and mostly computational-thinking self-measures. | https://research.mpu.edu.mo/en/publications/the-influence-of-codecombat-on-computational-thinking-in-python-p/ | Abstract/Snippet |
| RPG-format learning in general: reviews report promise in science and language but rely on small or correlational studies. No rigorous test of an "RPG wrapper vs the same questions in a list" exists in what I found. | https://www.edsurge.com/n/2013-08-19-a-meta-analyses-on-the-research-behind-game-based-learning (general GBL summary) | Abstract/Snippet |

**Fraction of play that is on-task:** I found no credible number for any of these. The honest answer is "unmeasured; anecdotes and critics say it can be most of the session". That gap is itself a reason to measure ours.

**Recommendation for this site.** Learn Prodigy's lesson as a structure, not a monetisation point: the question was a toll to reach the game, so time drifted to shops and pets. Rules that follow: (a) no shop, no gold, no gear, no pet, no customisation, nothing to spend time on that is not a step or a question; (b) there is no second game inside the battle: the only battle verb is recalling; (c) walking is short and skippable (tap a region to fast-travel after first visit); (d) no ads, no upsell (the site is free, so this is automatic). Log, locally and privately, time spent walking vs reading vs answering, and compare it with the plain list after launch. If walking exceeds reading time, shrink the map.

---

## 3. Dragon Quest's design grammar as a model of approachability

| Finding | Source URL | Label |
|---|---|---|
| Horii wanted games "intuitive and accessible for anybody", says he does not read manuals, kept the hero silent so the player feels they are the hero, and described progress as climbing a steep mountain by persistence (including dying and grinding). Also wanted warmth against computers' coldness. | https://www.gamedeveloper.com/business/25-years-of-i-dragon-quest-i-an-interview-with-yuji-horii | Confirmed (via fetch summary of the interview) |
| 64 KB cartridge; one character instead of a party; mechanics simplified; because RPGs were niche and people "didn't know what to do", the game is "a kind of linear rail" into the genre. | https://www.siliconera.com/dragon-quest-creator-yuji-horii-reminisces-on-the-making-of-the-first-game/ | Confirmed |
| 1989 Miyamoto-Horii talk: Horii does not want anything in a game "that can't be undone"; wants players to feel they drive the plot; the silent protagonist avoids breaking the illusion. | https://glitterberri.com/developer-interviews/miyamoto-horii-discussion/ | Confirmed |
| Design aim: "a system that was easy to understand and emotionally involving" for people who did not know the genre; simplified Western computer-RPG input into layered windowed menus; no need for tabletop experience or hundreds of hours of rote fighting. | https://en.wikipedia.org/wiki/Dragon_Quest_(video_game) and https://dragon-quest.org/wiki/Yuji_Hori | Confirmed (Wikipedia) / Snippet (wiki) |
| Structure: overworld from Tantegel Castle, towns with shops, inns and NPCs whose talk points you to the next place; the villain's castle stays visible as a goal; battle is one enemy at a time with four commands (fight, run, spell, item); the king is the save point (battery save in the Western release). Death returns you to the castle with half your gold. | https://en.wikipedia.org/wiki/Dragon_Quest_(video_game) | Confirmed |
| Opening: you start in the castle, talk to the king and guards, open three chests in the throne room (gold, torch, key), use the key on a door, search a pot for a herb. Core verbs (talk, chest, search, door, stairs) are taught by doing, inside one safe building. | https://en.wikibooks.org/wiki/Dragon_Quest/Castle_Tantegel (via search snippet) | Snippet |
| Horii aimed for players to keep growing and to clear the game however many times they died; EXP is kept on death. A 1989 development discussion reportedly aimed to make battles less repetitive than older grind-heavy RPGs. | https://automaton-media.com/en/news/dragon-quest-creator-yuji-horii-finally-reveals-why-you-lose-half-your-money-when-you-die-in-the-games/ | Snippet |

**Random encounters and grinding.** Horii's own words endorse persistence and grinding as the genre's reward loop. That is the one DQ pillar to refuse: grinding is repeated non-content actions, which a learning game must not demand. Retrieval repetition is good, but it should be the content (spaced review), not walking in circles until a counter fills.

**Recommendation for this site.** Borrow the grammar, drop the grind:
- Overworld: the path is a short map, one region per stage, the next goal always visible (like the Dragonlord's castle).
- Towns and NPCs: each step is an NPC, and a conversation is the step's "why" and "do" (short; link to the full page). Town = stage's steps; the castle = the checkpoint.
- First minute teaches by doing: spawn inside a tiny first room whose NPC says what to press, with three chests that hold the first real recall question and the instruction "you can skip this game any time" (the list). This copies Tantegel without a tutorial screen.
- Battle: menu, turn-based, no timers. Reduce the four commands to what the learner can actually do: "Answer", "See hint (the step)", "Skip" (the third is the DQ "run" and must cost nothing: Horii's "nothing that can't be undone").
- No random encounters, no XP, no gold, no levelling. Enemies are fixed and visible. Optional, later: a "wandering monster" that is one due Review item, opt-in only.
- Save: autosave to localStorage on every action; the king is a decorative "Notes/Review" NPC. Death does not exist; a miss is neutral (the earlier doc's rule).
- Horii's warmth point supports plain, kind NPC text over jokes.

---

## 4. Tech for a small browser RPG under these constraints

Sizes: measured by downloading the jsDelivr distribution file and `gzip -9` (GitHub Pages' gzip is usually a little larger). "Min" = as shipped, includes all modules; tree-shaken builds can be smaller.

| Option | Version, licence | Raw / gzipped | `file://` and pixel-art notes | Label |
|---|---|---|---|---|
| Hand-written Canvas 2D | none (own code) | est. 10-25 KB min+gz for map, movement, dialogue, input | Draws `<img>` from `file://` without trouble; canvas is only "tainted" for `getImageData`/`toDataURL`/`toBlob`, which a game does not need. `imageSmoothingEnabled = false` gives crisp pixels. | Measured: none; MDN Confirmed; size estimate Heuristic |
| KAPLAY | 3001.0.19, MIT (Kaboom fork; Kaboom unmaintained since Aug 2024) | 189 KB / **69.5 KB** | WebGL renderer; images from `file://` hit the WebGL cross-origin rule. Has tile levels, input, touch. | Size measured; licence Confirmed (package.json); `file://` Snippet |
| LittleJS | 1.25.0, MIT | 436 KB / **134.6 KB** for `littlejs.min.js` (the "7 KB zip" claim is for a size-coded starter built with extra packing) | WebGL2, tilemaps, touch gamepad built in. Same `file://` texture rule. | Size measured; MIT in file header |
| Excalibur | 0.32.0, BSD-2-Clause | 574 KB / **147.2 KB** | TypeScript engine with tilemap and input; WebGL default. | Size measured; licence Confirmed |
| PixiJS (renderer only) | 8.22.0, MIT | 841 KB / **236.8 KB** | Renderer only; you still write the game. | Size measured |
| Phaser 3 | 3.90.0, MIT | 1.20 MB / **314.9 KB** (arcade-physics build 282 KB) | Loader fetches assets by XHR/Image; fails on `file://` without a server. | Size measured; `file://` Snippet |
| Phaser 4 | 4.2.1, MIT | 1.38 MB / **352.2 KB** | Same. Larger than the whole current site budget. | Size measured |
| `file://` WebGL texture rule | Chrome throws `SecurityError: The cross-origin image at file:/// may not be loaded` for `texImage2D` on `file://` images | | Applies to any WebGL engine unless images are data URIs or the page is served over http. | Snippet (https://www.html5gamedevs.com/topic/4402-uncaught-securityerror-failed-to-execute-teximage2d-on-webglrenderingcontext) |
| Tiled maps | export formats: JSON, Lua, CSV (no JavaScript format) | | JSON needs `fetch`, which `file://` blocks. Use a build step to wrap output in a `.js` file, or skip Tiled and generate the map from path data. | Confirmed (https://doc.mapeditor.org/en/stable/manual/export-generic/) |

**Other constraints.**
- Pixel-perfect integer scaling: render a fixed logical size (for example 240 x 160 = 15 x 10 tiles of 16 px), pick the largest integer scale that fits, set `imageSmoothingEnabled = false`, and size the backing store in device pixels (CSS size divided by `devicePixelRatio`) to avoid fractional scaling blur. Smoothing flag and `image-rendering: pixelated`: Confirmed (MDN, https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled). The DPR step is Heuristic.
- Touch: use Pointer Events. Tap-to-walk (path-find over the tile grid) plus an optional on-screen d-pad; menus and dialogue are DOM buttons, so they inherit touch behaviour for free. Heuristic.
- Assets on `file://`: embed the tileset as a data-URI string in a JS file loaded on demand. Data-URI images are not cross-origin, so the WebGL rule does not bite and no extra requests are made. I believe this works in all three engines' browsers but did not test; a one-hour spike on Chrome, Firefox and Safari is needed before committing to a WebGL engine. Heuristic.
- Maps as `.js` constants (ASCII rows or arrays), matching how `content/code/*.js` already loads. Heuristic.

**Recommendation for this site.** Hand-write Canvas 2D, about 800-1,200 lines, in one on-demand `content/code/rpg.js` plus one data-URI tileset. Reasons: (1) it is the only option that sidesteps the `file://` WebGL rule and engine loaders, (2) the game needs only a tile grid, a player, collision, NPC talk, and a menu battle, which a game engine adds little to, (3) 10-25 KB is a lot kinder on phones than 70-350 KB, (4) DOM overlay handles text and menus, which no engine does as well for accessibility. If the owner later wants animation, particles or physics, KAPLAY (MIT, 70 KB) is the fallback, after the data-URI spike passes.

---

## 5. Art and sound assets compatible with a public GitHub repo

| Asset | Licence | Tile / size | Download page | Label |
|---|---|---|---|---|
| Kenney Tiny Town | CC0 | 16 x 16, 130 tiles, v1.1 (2023) | https://kenney.nl/assets/tiny-town | Confirmed |
| Kenney Tiny Dungeon | CC0 | 16 x 16, 130 tiles (2022) | https://kenney.nl/assets/tiny-dungeon | Confirmed |
| Kenney 1-Bit Pack | CC0 | 16 x 16, 1,078 tiles (2021) | https://kenney.nl/assets/1-bit-pack | Confirmed |
| Kenney Roguelike/RPG Pack | CC0 | 16 x 16, 1,700 tiles incl. town elements, furniture, UI panels (2015); I recall a 1 px gutter between tiles, check before slicing | https://kenney.nl/assets/roguelike-rpg-pack | Confirmed (page); gutter Heuristic |
| Kenney RPG Base | CC0 | tile size not stated on the page; 230 tiles (2014). Do not plan on it without opening the zip | https://kenney.nl/assets/rpg-base | Confirmed (CC0); size Not verified |
| 0x72 DungeonTileset II | CC0 (credit welcome, not required) | 16 x 16; dungeon interiors and characters only, no overworld | https://0x72.itch.io/dungeontileset-ii | Snippet (page returned 403) |
| Press Start 2P (font) | SIL OFL 1.1, by CodeMan38, reserved font name "Press Start 2P" | 8 px design grid; Latin, Cyrillic, Greek | https://fonts.google.com/specimen/Press+Start+2P | Confirmed (licence in google/fonts repo) |
| DotGothic16, Pixelify Sans (fonts) | SIL OFL 1.1 | DotGothic16 includes Japanese | https://fonts.google.com/specimen/DotGothic16 , https://fonts.google.com/specimen/Pixelify+Sans | Confirmed (licence headers) |
| Kenney RPG Audio | CC0 | about 50 WAV/OGG foley, footsteps and weapon sounds | https://kenney.nl/assets/rpg-audio | Confirmed |
| ZzFX | MIT | under 1 KB code; synthesises sound effects, no audio files | https://github.com/KilledByAPixel/ZzFX | Confirmed |
| Liberated Pixel Cup (LPC) base assets | **CC-BY-SA 3.0 and GPL 3.0** (a few artists CC-BY) | 32 x 32 | https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles | Confirmed |

**Why LPC is incompatible by default.** Share-alike obliges anyone who adapts or combines the art to release the result under the same terms, and attribution has to be shown to the player. GPL 3.0 for art is awkward for a site whose own content licence differs. The credits file lists many artists, so compliance means tracking each. Skip unless the owner accepts SA on the game bundle. (Reasoning is Heuristic; the licence names are Confirmed.)

**Other cautions.** Anything from Square Enix is copyrighted: reproduce the grammar, not the sprites or music. OFL fonts may be embedded and redistributed with the licence text, but subsetting or converting counts as modification, which a reserved font name forbids reusing; if the font is subset, rename it (Heuristic from OFL, verify before shipping). Pixel fonts are hard to read at small sizes, so use them for headings and labels only (section 6). No tile pack has a Toriyama look; Tiny Town's 16 px top-down villagers give the NES-era feel.

**Recommendation for this site.** Use Kenney Tiny Town for overworld and towns, Tiny Dungeon for the boss castle, and ZzFX for a few optional sound effects (default off). Put a `CREDITS` line and the CC0 notes in the repo even though CC0 does not require it; it helps audit. Keep one tileset PNG under about 20 KB after palette reduction.

---

## 6. Accessibility for a small browser game

| Finding | Source URL | Label |
|---|---|---|
| Game Accessibility Guidelines "Basic" tier, relevant: simple controls or a simpler alternative; remappable controls; large well-spaced virtual controls; all UI reachable with the gameplay input; let players advance text at their own pace; no flicker; interactive tutorials; simple language; start without deep menus; readable default size; high contrast; no information by colour alone; no essential information by sound alone; separate volume or mutes; subtitles for speech; remember settings; document features in-game. | https://gameaccessibilityguidelines.com/basic/ | Confirmed |
| Canvas is opaque to assistive tech: only the fallback content and an ARIA text equivalent are exposed. | HTML spec | Heuristic (not re-read) |
| WCAG 2.2 criteria 2.2.1 Timing Adjustable (time limits must be adjustable unless real-time or essential), 2.3.3 Animation from Interactions, 2.5.8 Target Size (Minimum) of 24 CSS px, 1.4.3 contrast 4.5:1 and 1.4.4 resize to 200%. I could not open the W3C pages (403); these are from memory. | https://www.w3.org/WAI/WCAG22/Understanding/ | Heuristic |
| `prefers-reduced-motion` media query and `matchMedia` let the page remove non-essential motion. | MDN | Heuristic (not re-read) |
| This site's own baseline already fails colour contrast on 40 of 44 checks and has heading-order problems; a game must not add to that. | `docs/program-2026-10/research/a11y-html-baseline.md` | Confirmed (repo) |

**What a "plain list" fallback must cover.** It is not a lesser mode; it is the same content and the same stored state:
1. Every stage in order, with each step's title, "why" and "do", and a link to its full page (what NPC talk shows).
2. The stage checkpoint with all recall questions, in the same free-recall, then rate, then outline-reveal flow as the boss, using plain form controls.
3. Progress, ratings and the Review queue, written to the same localStorage keys. A learner switching between the game and the list in the middle of a stage must lose nothing.
4. Build task, test-out questions, and any in-game hints (the "See hint" command = a link to the step).
5. Every item reachable by keyboard in a logical order, with headings and landmarks, and no information that only the map shows (such as "next step", "3 to review today").

**Recommendation for this site.**
- Architecture: the game is a *view* over the existing pages. One function per learner action (open step, rate a question, mark known) is shared by the list and the game. No game-only state.
- Dialogue, menus, battle prompts and rating buttons are DOM elements positioned over a canvas that only draws the map and sprites. They inherit browser zoom, the site font and contrast tokens, text selection, and screen-reader reading. Do not draw body text in a pixel font on the canvas.
- Controls: arrows/WASD to walk, Enter/Space to talk or confirm, Esc for the menu, tap-to-walk and a d-pad on touch (hit targets at least 44 CSS px; 24 is the WCAG floor), no key that needs holding for long. Remapping: keep the set small and fixed at launch, and note it as a limitation.
- No timed input anywhere. Battles are turn-based, there is no countdown, and dialogue advances only on a keypress or tap, never automatically. Walk speed is a tile per move, with an option to jump region to region.
- Reduced motion (media query plus a visible toggle): no walking tween (snap per tile), no screen shake or flash, no transitions. No flicker at any time.
- Colour: states (visited, due, boss ahead) use shape or label as well as colour; check contrast on both themes.
- Screen readers: the canvas gets a short label and a "Skip the game and use the list" button as the first tab stop; dialogue also goes to a polite live region only while the game is open. Offering the list first for those users is judgement, not evidence (Opinion).
- Sound: off by default, one mute toggle, no essential information in sound.
- Settings persist (motion, sound, size) in localStorage; features are described on the game's first screen.

---

## Set aside (considered and dropped)

- **Phaser 3/4 and PixiJS**: heavier than the whole current page budget, and loaders assume a server. Dropped on size and `file://` grounds.
- **Tiled as the map editor**: no JavaScript export, and JSON needs `fetch`. Generated maps from path data are simpler and stay in step with the content.
- **Kenney RPG Base**: tile size unverified and dated (2014); not needed since Tiny Town covers the look.
- **LPC / OpenGameArt CC-BY-SA and GPL asset families**: share-alike and credit burden, see section 5.
- **XP, gold, equipment, shops, random encounters, levelling**: no learning evidence, and it is exactly where Prodigy's time drifted; not in the design.
- **Multiplayer, leaderboards, guilds (Classcraft style)**: Clark found multiplayer g = -0.05, and the earlier doc already rejected competition.
- **A rich story**: Clark's story-depth result and Wouters' narrative result show no benefit; one-line NPC text only.
- **Full-text read of Wouters 2013 and Mayer 2019**: paywalled; their abstracts suffice for the decisions here but their detailed moderator numbers are not in this document.
- **Prodigy percentages of on-task time**: no neutral source found; the only numbers are vendor- or advocate-produced, and I labelled them so.
- **Hands-on testing of data-URI textures with WebGL engines on `file://`**: not done (read-only, no browser run); listed as a spike if an engine is ever considered.
- **W3C and MDN pages for WCAG 2.2.1, 2.5.8 and `prefers-reduced-motion`**: two returned 403; the criteria are stated from memory and marked Heuristic.
