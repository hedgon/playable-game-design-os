# Brief: writing one reference-game entry (programme 2026-10)

You write ONE entry for the reference library as a draft file outside the build. The
coordinator integrates it, downloads and converts the images, adds it to paths and gets
it fact-checked.

## Read first (targeted)

- `docs/references/analysis-method.md` (the whole file: the method every lens follows,
  the rubric, the frameworks per lens). This is the quality bar.
- `CONTRIBUTING.md`, the part of "Diagrams" from "Reference games carry their own
  `diagrams`" to the end of that section, and the series paragraph ("A long-running
  series is one `SERIES({...})` entry").
- `src/14-references.js` lines 1-60 and 140-260 (families, tags, lenses, licences,
  `GAME()`, `SERIES()`, `RECEPTION_VERDICTS`).
- Exemplars: a game: `src/18-games-genres.js` from the line `GAME({ id:'beat-saber'`
  to its closing `});`; a series: `src/18-games-series.js` lines 10-188 (`mega-man`).
  Match their fields, depth and tone.

## Entries

### crosscode (GAME)
CrossCode (Radical Fish Games, 2018; Deck13). Owner's questions: how it blends small
puzzle sections into an action RPG (ball-throwing and element puzzles built from the
combat kit, dungeons that alternate puzzle rooms and fights, the puzzle grammar extending
into boss fights, optional puzzle-heavy side content); its pixel art style (16-bit-style
pixel art with modern effects, readable isometric-ish height in a 2D game, animation);
how its world was built (an MMO inside a single-player game, the in-fiction game
"CrossWorlds" and the real world around it, areas with identities, NPC "players" who chat
and party). Family `rpg` (action RPG). Lenses that matter most: gameplay, art, world,
lore, lineage (Secret of Mana, Zelda, Phantasy Star Online / MMO lineage; developers'
own statements), business (Indiegogo crowdfunding 2015, Early Access, console ports,
DLC "A New Home").

### rhythm-heaven (SERIES)
Rhythm Heaven / Rhythm Tengoku (Nintendo SPD and TNX: Tsunku♂; Game Boy Advance 2006
(Japan only), DS 2008 (Rhythm Heaven), Wii 2011 (Rhythm Heaven Fever), 3DS 2015/2016
(Rhythm Heaven Megamix), and the next entry Rhythm Heaven Groove for Switch if it has
released by your check date: verify, and only include it with a source). Owner's
questions: what makes this simple, non-traditional rhythm series so successful, and why
so many imitators fail, with only a few such as 7th Beat Games coming close. Cover: cue
by sound rather than a note highway (play by ear, eyes optional); one-button or
two-button inputs with a short minigame per idea; practice sections and the "remix"
stages that combine earlier games; comedic, surreal art that is also timing information;
grading by "feel" on a few key beats; off-beat and swing traps; Tsunku's role as a music
producer; reception per entry (DS Rhythm Heaven's stylus flicks, Fever's praised return
to buttons, Megamix as a compilation). Family `action`. `reception` needs at least one
praised and one mixed or poorly received verdict with sources; if no entry was poorly
received, use the weakest-received entry and say what reviewers criticised. The
`lineage` lens must answer the owner's imitator question with evidence: which games
tried the formula (for example Rhythm Doctor, Melatonin, Bits & Bops, the WarioWare
link), what they copied (surface: minigames, art) versus the mechanism (audio cue +
fixed rhythm + one input), and why most fall short. Mark judgement as judgement.

### rhythm-doctor (GAME)
Rhythm Doctor (7th Beat Games, Early Access 2021 on Steam; full release only if it has
happened by your check date: verify). One button, press on the seventh beat; the
"patients" are rows of beats; the game then breaks its own interface (screen effects,
window moves, swing rhythms, polyrhythms) as the challenge. Owner's angle: one of the few
games that captured what Rhythm Heaven does. Cover what it takes from Rhythm Heaven
(cue-by-ear, one input, a fixed rule per level) and what it changes (one shared rule
across the game, visual disruption as difficulty, accessibility and calibration options,
a level editor and community levels). 7th Beat Games' earlier game A Dance of Fire and
Ice is lineage context. Family `action`.

## Output

- `docs/program-2026-10/drafts/<id>.js`: the whole `GAME({...})` or `SERIES({...})`
  call, with every field the exemplar has, the signature (six parts, 380 words or more),
  all ten lenses to the analysis method (each 150 words or more, claim, evidence,
  mechanism, effect, compare, cost, principle, topics, https sources), the loop diagram,
  a screen diagram if the game has a distinctive screen, `lens.*.topics` naming existing
  topic ids (check they exist with grep), and `shots: []` left empty for now.
  Use `img: 'assets/games/<id>.jpg'` (the coordinator supplies the header image) and for
  series entries `shot` objects with the image path you propose
  (`assets/games/shots/<id>-e<n>.webp`).
- `docs/program-2026-10/drafts/<id>.shots.md`: the official images you propose: for each,
  the source page (Steam store page, the publisher's press kit, Nintendo's official press
  or product pages; a LaunchBox Games Database capture only when no official screen
  exists), the direct image URL if you can see it, which lens it illustrates, alt text, a
  caption naming what to look at, and optional callouts (x, y as fractions). Real screens
  only, never generated or drawn images. Header: the Steam header capsule or the
  publisher's key art.
- `docs/program-2026-10/drafts/<id>.sources.md`: every specific claim (date, number,
  sales figure, quote, developer statement, review score) with its https source and
  whether you read the source itself.

## Self-check

```bash
PLAYABLE_DRAFTS=docs/program-2026-10/drafts/<id>.js node src/validate.js
```

Image-existence errors for your proposed image paths are expected (the coordinator adds
the files); every other error must be fixed. `DRAFT not in any learning path` lines are
expected.

Plain words, UK spelling, no hype. Do not edit any file under `src/`. Do not download
images. Never run git. Never read or search anything under D:\Personal outside
D:\Personal\playable-game-design-os. Return the three file paths and a 5-line summary.
