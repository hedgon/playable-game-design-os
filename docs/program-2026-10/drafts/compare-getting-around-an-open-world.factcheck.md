# Fact-check: getting-around-an-open-world (elden-ring vs skyrim)

**Verdict: PASS WITH FIXES**

New comparison (no existing `getting-around-an-open-world` in `src/46-comparisons.js`), so the
"dropped section or source" check does not apply.

Counts: WRONG 2, UNSUPPORTED 2, OUTDATED 0.

Most serious: the draft says Elden Ring fast travel starts *from a Site of Grace*. It starts
from the map, anywhere in the open field, and it is blocked inside caves and catacombs even at a
Grace inside them. Section 2a and the matrix cell "Fast travel" are wrong on this point. The
error also weakens the comparison's own argument: Elden Ring makes the crossing cheaper than
the draft says.

## Claims

| Claim (short) | Location | Verdict | Correct value | Source |
| --- | --- | --- | --- | --- |
| Torrent "is the main way to cross the Lands Between" | sections[0].a | CONFIRMED | Wikipedia: "the main mode of transportation" | https://en.wikipedia.org/wiki/Elden_Ring |
| Torrent can gallop, jump, outrun a fight | sections[0].a | CONFIRMED | Library: gallop, double-jump, "often simply outrun a fight" | src/18-games-genres.js elden-ring `signature.mechanism` |
| Skyrim: horse, paid ride from a city stable, fast travel | sections[0].b | CONFIRMED | Same, word for word on Wikipedia | https://en.wikipedia.org/wiki/The_Elder_Scrolls_V:_Skyrim |
| Mountain terrain makes the straight line harder | sections[0].b | CONFIRMED | Wikipedia: "mountainous topography ... more difficult to traverse than Cyrodiil" | Skyrim Wikipedia |
| "fast travel **from a Site of Grace** to any Grace already found, outside combat" | sections[1].a | **WRONG** | Fast travel is opened from the map, from anywhere in the open world, to any found Grace, outside combat. It is **not** available inside caves, catacombs and similar small dungeons, even standing at a Grace inside one; the player must leave first | PCGamesN headline "Elden Ring has 'from anywhere' fast travel" https://www.pcgamesn.com/elden-ring/fast-travel-combat (403 to fetch; headline and search summary only); Sites of Grace guide summaries (game8, eldenring.fandom.com/wiki/Sites_of_Grace) |
| Graces heal and level the player | sections[1].a | CONFIRMED | Wikipedia: increase attributes, change spells, fast travel | Elden Ring Wikipedia |
| "Dying sends the player back to the last Grace visited" | sections[1].a | CONFIRMED, incomplete | Wikipedia: last Grace interacted with, **or** a nearby Stake of Marika. Suggest "usually the last Grace, or a Stake of Marika near the fight" | Elden Ring Wikipedia |
| Skyrim: fast travel to any discovered location, not in combat, not from interiors | sections[1].b | CONFIRMED | Also blocked when enemies are nearby and when over-encumbered | Search summaries of Skyrim fast-travel guides; library skyrim `lens.ui.evidence` ("any location already discovered on foot") |
| Erdtree and landmarks read for heading | sections[2].a | CONFIRMED (library) | | src/18-games-genres.js elden-ring `why` |
| Compass shows nearby places; visited look different | sections[2].b | CONFIRMED | Undiscovered known places black, visited white | gamerguides compass page (403; search summary), elderscrolls.fandom Map Symbols |
| Reviewer: hard to walk a minute without a cave, shack, ruin | sections[2].b | CONFIRMED, attribute it | Tom Francis, PC Gamer, quoted on Wikipedia ("cave ... lonely shack ... haunted fort"; "ruin" is a paraphrase of "haunted fort", acceptable). Name the reviewer: "PC Gamer's reviewer" | Skyrim Wikipedia |
| Torrent cannot be summoned in legacy dungeons such as Stormveil | sections[3].a | CONFIRMED (library) | Also barred in caves, catacombs and most boss arenas inside them | Library elden-ring `lens.gameplay.evidence`, which cites https://en.wikipedia.org/wiki/Torrent_(Elden_Ring). Add that URL to `sources` |
| Return trip shortened by opened shortcuts (gate, lift) to a Grace | sections[3].a | CONFIRMED (library) | | Library elden-ring `signature.teach` |
| Skyrim dungeon exit is "usually a loop that ends near the entrance" | sections[3].b | UNSUPPORTED | Likely true (Bethesda's dungeon loop-back pattern), but the draft cites nothing. Candidate developer source: Joel Burgess's GDC 2013 talk / blog on Skyrim's modular level design; check it says the loop | none in draft |
| Skyrim bars fast travel from interiors, so a dungeon is crossed on foot | sections[3].b, matrix | CONFIRMED | | as above |
| "early fast travel" removes the whole-field shortcut; costs Lordran-style spatial memory | sections[5].a | CONFIRMED (library, marked "arguably") | | Library elden-ring lines 1189, 1194 |
| Many players may fast travel and see little | sections[5].b | judgement, marked | | |
| Matrix "From any found Site of Grace, not in combat" | diagram.cells[1][0] | **WRONG** | Same fix as sections[1].a: e.g. "From the map, outside combat; not in caves or catacombs" (fits the ~70-char cell) | as above |
| Matrix "Mount (Torrent), outside dungeons" | diagram.cells[0][0] | CONFIRMED | | |

## Disagreements with the library

- **elden-ring `signature.mechanism`** says "a Site of Grace nearby offers ... unrestricted fast
  travel to any other Grace already found". The draft copied the "from a Grace" reading. Both
  are imprecise: fast travel is from the map anywhere in the field, and it is restricted in
  caves and catacombs. The library sentence should be corrected too ("from the map, almost
  anywhere outside combat and small dungeons"). The library line 1189 ("unrestricted fast
  travel almost from the start") is right in spirit; "unrestricted" overstates it.
- skyrim: the draft agrees with the library (fast travel to places reached on foot; compass).

## Missing coverage

- All three brief topics are linked and exist (the writer validated). Six sections, including
  "What each choice risks". Diagram present and labelled as a summary.
- Sources are weak for a brief that asks for developer sources first: two Wikipedia pages, a
  guide site (gamerguides, 403) and a fan wiki. No developer source for either game. Add the
  Torrent Wikipedia page (already used by the library) and, if it holds, a Bethesda level-design
  source for the Skyrim dungeon loop. Drop `skyrim.fandom.com/wiki/World_Map` if nothing cites it.
- Thin: Skyrim's carriages can take the player to a hold city not yet visited, which is the one
  case where Skyrim shortens a trip the player has not already walked. Worth one clause in
  sections[0].b, since it bears on "who decides".

## Code issues

None (no code).

## Teaching issues

- Section 5 ("Who decides") is stronger once 2a is fixed: Elden Ring lets the player leave
  the field from anywhere, so the designer's control lies in the places where travel is barred
  (caves, catacombs, Torrent-free dungeons), not in where Graces sit. Reword 2a around that.
- Section 2a's "one place serves as a rest stop, a checkpoint and a transport point" is fine
  as the destination side; it is wrong as the departure side.

## Style

No hype words, British spelling, plain sentences. No owner employer, colleague or internal
project named.

## Set aside

- "Torrent ... jump": it is a double jump; "jump" is not wrong.
- Whether map fast travel works inside legacy dungeons such as Stormveil: not claimed by the
  draft, not checked.
- Skyrim's over-encumbrance and nearby-enemy limits: the draft names "combat", close enough;
  listed in the table as optional detail.
- "ruin" vs Tom Francis's "haunted fort": a fair paraphrase of a list.
- Section 1b "Walking is the base speed": trivially true.
- Shadow of the Erdtree changes to travel: not claimed.
