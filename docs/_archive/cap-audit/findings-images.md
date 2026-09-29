# Image audit (A1, A2, A3)

Raw inventory, scripts and montages stayed in the session scratchpad (not committed).

## 1. Summary
- 531 files under assets/ (425 webp, 105 jpg, 1 svg); 531 references in src/*.js. Missing files: 0. Unreferenced files: 0. Missing credit: 0 (209 use the game's dev + store page fallback, which validate.js accepts). Duplicated pictures (phash distance <=12): 0 real (portal/undertale at d=12 are unrelated).
- Caps: 222 game lens shots and 26 guide shots at 150 KB, 176 series entry shots at 40 KB, 106 headers uncapped. Over or near cap: return-of-the-obra-dinn-logbook 104% (159 KB, dither noise; raised on purpose in 965e7b0), sonic-e-mania 92%, age-of-empires-ii-siege 85%.
- History: 546 files have history, 124 have more than one version. Nearly every change went UP in dims and bytes. Flags: dimension down 3 (all header re-crops), aspect change 6, bytes down at same dims 2, replaced picture 5, ended below peak 4, deleted 15 (none removed for size: 13 remnants, 2 unused).
- Remaining cap-driven loss: the 176 series entry shots are all at most 512 px wide (112 at 480x270), the only class still sized by the old 40 KB cap. Lens/guide shots are 960 wide (226 of 248); the 22 under 960 are source-limited.
- On-page cropping: only library cards (.refcard img, aspect-ratio 460/215, object-fit cover) hide image area (18 headers lose 12-74%). Game, series, guide pages and the click-to-enlarge viewer show whole images (checked at 375 and 1440).

## 2. Findings
| id | image | used by | problem | evidence | severity | fix |
|---|---|---|---|---|---|---|
| I1 | 176 series entry shots in assets/games/shots (e.g. *-e-*.webp, *-entry-*.webp) | series entries[i].shot on 22 series pages | Whole class held to <=480 px wide by the 40 KB cap. Readable but soft; the viewer upscales 480 to 1200 px at 1440. Only the Sonic set was raised (400 to 480, e6de7bf; quality in 965e7b0) | 112 at 480x270, sizes 10-37 KB, bpp 0.27-2.3; softest: ea-sports-fc-e2, xeno-entry-xs2/xs3/xc3, zelda-e8, pokemon-e-goldsilver | medium | re-source from each credit url at 960 px (as done for lens shots in 73909d1..4466a54); re-encode from original at higher quality |
| I2 | assets/games/candy-crush-saga.jpg | game candy-crush-saga img | Header cut from 355x592 portrait to a 355x166 strip; logo touches the top edge, game art gone | 8b69ad7 | medium | restore version 00f789b |
| I3 | assets/games/angry-birds.jpg | game angry-birds img | Different, cropped picture: 512x512 to 460x215 | 8b69ad7 | low | restore version 00f789b or re-source uncropped |
| I4 | assets/games/fruit-ninja.jpg | game fruit-ninja img | 460x343 cropped to 460x215 | 8b69ad7 | low | restore version 00f789b |
| I5 | assets/games/subway-surfers.jpg | game subway-surfers img | Portrait 370x658 in a 460:215 card: 26% visible; JPEG q~48 | pw.json | medium | change CSS (card crop or contain); re-source at higher quality |
| I6 | wordle.svg, hearthstone, elden-ring, euro-truck-simulator-2, pokemon, world-of-warcraft, super-smash-bros, animal-crossing-nh, the-sims, fire-emblem, mario-kart-8, xeno, super-mario, zelda, fortnite, tetris, minecraft (assets/games) | library cards (#/games) | .refcard img crops with object-fit cover, hiding 12-42% top/bottom on cards | visible fraction 0.58 wordle, 0.75 hearthstone, 0.81-0.88 rest | low | change CSS (contain or object-position) |
| I7 | assets/games/euro-truck-simulator-2.jpg | game header | JPEG q~40, soft at 616x353 | 1.08 bpp | medium | re-source from store url at higher quality |
| I8 | mario-kart-8, fortnite, world-of-warcraft (q55-62) and about 13 other headers at q60-65 | game headers | Low JPEG quality (headers uncapped; probably store-native thumbnails) | q 55-65 | low | re-source only if a larger source exists; else none |
| I9 | assets/engines/godot-editor.webp (800x424), unity-scene-view.webp (850x570) | engine guides | Full-window editor screens at under 900 px: panel and menu text tiny (Godot unreadable at page size) | 0.85 bpp | medium | re-source from credit url at 960+ |
| I10 | assets/games/shots/contra-e-superc.webp | series contra entry | Game picture only about 168 px wide inside a black 480x270 frame | montage | low | re-crop to the game area |
| I11 | pokemon-e-goldsilver.webp, megami-tensei-entry-smt1.webp | series entries | Content clipped at edge: PIDGEY name at top, SMT1 status list at bottom | montage | low | re-source at full frame |
| I12 | mega-man-x-e-x1-snes.webp | series entry | Banding blocks in top border | montage | low | re-source |
| I13 | angry-birds-stars.webp, wordle-grid.webp | game lens shots | Stars, bird, phone cut at frame edge; same framing as the first versions (upscaled in dd0f316), so source crop, not cap loss | mont/cmp_abstars, cmp_wordle | low | none (source framing) |
| I14 | doom-hud.webp | game doom lens | Bytes down at same 960x540 (34276 to 27076, e57337f); side by side identical | mont/cmp_doom.png | low | none (false positive) |
| I15 | valkyria-chronicles-action.webp | game lens | Re-encoded 56320 to 49992 B at 960x540 (1b2b738); looks clean, text readable | montage | low | none, or re-encode from original |
| I16 | contra-e-shattered.webp | series entry | 480x336 (raised from 223x163 in e6de7bf); source-limited, French UI | montage | low | none |
| I17 | wii-sports-boxing (341x196), doom-gameplay (640x400), google-play-data-safety (239x512) | lens/guide shots under 960 | Small but readable, source-limited | montage | low | none |
| I18 | return-of-the-obra-dinn-logbook.webp | game lens | 104% of 150 KB cap; intended per owner rule | 159382 B | low | none |
| I19 | 15 deleted images | - | All removed as unused (1304c72, 42f0e2a), none for size; 4 drawn svgs replaced by store art | image-log | low | none |
| I20 | candy-crush-saga.jpg, wordle.svg, subway-surfers.jpg | game page | Shown at 460 px vs 355/332/370 natural: mild upscale | pw.json | low | none |

## 3. Checked and fine
- Montages viewed: all 22 sub-960 lens/guide shots; the 3 near-cap shots; 12 lowest-bpp series shots; 6 lowest-bpp lens shots; history-flag shots (doom-hud, valkyria, contra-e-shattered, wii-sports-tennis, angry-birds-stars, candy-crush-saga-map); header re-crops; controls: dota-2-loadout, rocket-league-aerial, persona-5-royal-battle, civilization-hexes, gta-v-atv, skyrim-vista, sonic-e-s1, fire-emblem-e-genealogy, super-smash-bros-e3, final-fantasy-xiv-1-0, ea-sports-fc-e3, super-mario-e-wonder; headers plants-vs-zombies, metal-gear-solid, halo, stardew-valley, counter-strike-2, dota-2. Sharp, readable, no edge cuts. Not individually viewed: the other roughly 450 images (covered by metrics only).
- Pages screenshotted at 375 and 1440 (work/images/shots): #/games; series sonic, xeno, contra; games candy-crush-saga, wordle, subway-surfers; engines godot, unity; platforms google-play, steam. Viewer opened on a sonic entry shot and on candy-crush-saga and doom lens shots: whole image shown, fitted, no clipping. Entry shots use object-fit contain with max-height 180px (nothing hidden); lens shots width auto, max-height min(78vh,640px).
- No history step reduced dimensions of any lens or guide shot; all 800 to 960 re-cuts raised size. No missing, unreferenced, uncredited or duplicated image.
