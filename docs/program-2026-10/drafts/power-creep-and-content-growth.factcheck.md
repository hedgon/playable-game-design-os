# Fact-check: power-creep-and-content-growth

Checked 2026-10-05 against the draft `power-creep-and-content-growth.js`, its claim list
`power-creep-and-content-growth.sources.md`, `briefs/topics.md` (section
`## power-creep-and-content-growth`) and `briefs/topic-common.md`.

Validator run:
`PLAYABLE_DRAFTS=docs/program-2026-10/drafts/power-creep-and-content-growth.js,docs/program-2026-10/drafts/balance-methods.js node src/validate.js`
Result: exit 0, "OK: all cross-links resolve, all topics complete". Two warnings for these
drafts: `WARN topics with no inbound links: power-creep-and-content-growth` and
`DRAFT not in any learning path (topic): power-creep-and-content-growth, balance-methods`.

## Verdict: PASS WITH FIXES

The structure, the arithmetic of the worked table and the diagram, the engine code and
most sourced claims hold. Five factual or arithmetic errors need a one-line fix each, and
four claims need a primary source or softer wording. None changes the topic's argument.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
|---|---|---|---|---|
| Wizards' designers name the mechanisms: near-copies (eight of an effect), fixing underperformers, missed interactions; "power creep is relative" | `what` | CONFIRMED | Sam Stoddard, "Dealing With Power Creep", 9 Aug 2013: all three sources named; "Power creep is relative, because Magic has so many formats" | https://magic.wizards.com/en/news/feature/dealing-power-creep-2013-08-09 (raw page read) |
| Stoddard calls creating Standard "by far, the most important thing" (2013) | `TECH` Rotation | CONFIRMED | Exact text: "By far, the most important thing that was done in the early years was the creation of the Standard format." | same |
| Its developers explained in 2011 that numbers had grown beyond what they intended | `what` | UNSUPPORTED (primary) | A Developer Watercooler post of 3/4 Nov 2011 ("The Great Item Squish (or Not) of Pandaria") is recorded by the community wiki only; the Blizzard original could not be fetched. The 6.0.2 patch notes give the same reasoning ("After 4 expansions and over 9 years of this growth ... numbers ... are no longer easy to grasp"): cite those instead, and say 2014 | 6.0.2 patch notes, reproduced in full by JudgeHype: https://worldofwarcraft.judgehype.com/patch-wow-ptr-602/ |
| By Mists of Pandaria a raid boss neared the signed 32-bit maximum (2,147,483,647), per the community wiki | `what` | CONFIRMED as attributed (wiki only) | Ra-den about 1.5 billion health in 25-player heroic, about 70% of the limit. The limit value is correct. Blizzard's published reasons are readability and granularity, not overflow; keep the "according to the community wiki" attribution | warcraft.wiki.gg/wiki/Stat_squish (blocked to curl; search summaries agree) |
| The 2014 squish took most numbers to about 4% and player health to about 8% | `what`, `TECH` Stat squish | CONFIRMED (secondary) | A Blizzard designer's tweet (Celestalon), quoted by the wiki: "numbers about ~4% of what they were. Except player health, which is at ~8%". The official notes back the health part: "essentially doubling (post-squish) player health". Name Blizzard's designer rather than "the community wiki" if it is kept | 6.0.2 notes (above); warcraft.wiki.gg via search |
| "...to about 4% ... **so** a Fireball that hit for 450,000 of 3,000,000 now hit for 30,000 of 200,000" | `what` | WRONG (inconsistent) | The example is Blizzard's own, word for word in the 6.0.2 notes, but it is a scale of 1/15 (6.7%), not 4% (1/25). "So" presents it as following from 4%. Fix: "Blizzard's own patch-note example: a Fireball that hit for 450,000 ... now hits for 30,000 ... still 15%." | 6.0.2 notes (above) |
| Squishes in 2014, 2018, 2020 (with the level squish) and the Midnight pre-patch | `TECH` Stat squish, `INTERVIEW` junior 2 | CONFIRMED | 6.0.2 live 14 Oct 2014; 8.0.1 live 17 Jul 2018 (item-level and stat squish); 9.0.1 live 13 Oct 2020 (levels 120 to 50, cap 60); Midnight pre-expansion update live 20 Jan 2026 | Blizzard Watch 12 Jul 2018 (https://blizzardwatch.com/2018/07/12/officially-less-week-mage-tower-appearances-patch-8-0-launches-july-17/); Blizzard support "Level Squish and Related Changes with Shadowlands Launch" https://us.battle.net/support/en/article/275327; Midnight notes below |
| Blizzard says relative power to enemies is unchanged and the point is clearer numbers | `TECH` Stat squish, `FACTS` 4 | CONFIRMED | Midnight notes: "Numbers across the game are being reduced to improve clarity and readability. As always, your power level relative to that of your enemies will remain the same"; 6.0.2: "this is not a nerf" | https://news.blizzard.com/en-us/article/24244455/midnight-pre-expansion-content-update-notes (raw page read) |
| Number inflation "all of these have forced squishes" (health near its integer limit, UI, logs) | `why` 4 | UNSUPPORTED (in part) | No Blizzard source names integer overflow as a reason for any squish; the stated reasons are readability and granularity. Soften to "can force" or attribute the overflow risk to the community record | 6.0.2 and Midnight notes |
| Hearthstone Standard announced 2 Feb 2016: current and previous calendar year plus Basic and Classic; Wild keeps every card; goals fresher meta, designer freedom, easier start | `why` 2, `TECH` Rotation, `FACTS` 1 | CONFIRMED | Post "A New Way to Play", Daxxarri, 02/02/2016, all points as written | https://hearthstone.blizzard.com/en-us/news/19995505 (raw page read) |
| "Hearthstone published its two-year rule in 2016, long before the first rotation" / "Publish it long before the first rotation, as Hearthstone did in 2016" | `how` 6, `INTERVIEW` senior 2 | WRONG | The first rotation came with the spring 2016 expansion (Whispers of the Old Gods, April 2016), about 12 weeks after the 2 Feb announcement; the announcement itself says Standard arrives "this spring". Fix: "announced it in February 2016, about three months before the first rotation, with the list of sets that would leave" | same |
| 2021 Core Set of 235 cards, refreshed each year, replaces Basic and Classic; "Blizzard moved the Hall of Fame cards out of Standard" | `FACTS` 2 | WRONG (last clause) | Core Set, 235 cards, yearly refresh: confirmed (post dated 02/09/2021). Hall of Fame cards were already out of Standard; in 2021 Blizzard retired the Hall of Fame itself and moved its cards to the Legacy set in Wild (Shadowform returned to Standard in the Core Set). Fix: "and retired the Hall of Fame, moving its cards to Wild" | https://hearthstone.blizzard.com/en-us/news/23620129/introducing-the-core-set-and-classic-format (raw page read) |
| Wizards moved Standard to three years in 2023, no rotation at Wilds of Eldraine, for "more longevity" | `TECH` Rotation, `FACTS` 3 | CONFIRMED | "Revitalizing Standard", Aaron Forsythe and Billy Jensen, 7 May 2023 | https://magic.wizards.com/en/news/announcements/revitalizing-standard (raw page read) |
| Wizards set a target power level and raised it deliberately "for a set of years (Guilds of Ravnica to Throne of Eldraine)", then adjusted after missing on Oko | `TECH` Per-release power budget | CONFIRMED, wording | "we intentionally powered up our marquee sets ... from Guilds of Ravnica through Throne of Eldraine"; Oko "much stronger than we intended". That span is about one year (Oct 2018 to Oct 2019), so "for a year of sets", not "a set of years". The same article says Standard strength is "such a nebulous concept that we don't try to rigidly and rigorously define it" (see Teaching) | https://magic.wizards.com/en/articles/archive/feature/play-design-lessons-learned-2019-11-18 (raw page read) |
| League of Legends: damage x 100 / (100 + armour); 100 armour halves; 200 armour gives 66.7% | `TECH` Soft caps, `FACTS` 6 | CONFIRMED (secondary) | Formula agrees across search results for the official wiki; the wiki page itself returns 403 or a bot wall to curl and WebFetch. Arithmetic checked: 100/200 = 50%, 200/300 = 66.7% | https://wiki.leagueoflegends.com/en-us/Armor (not readable raw) |
| Oblivion scaled enemies and loot to the player, widely criticised; the 2025 remaster changed levelling to Skyrim-style rules with a fixed number of points per level | `TECH` Scaling | CONFIRMED in part, wording | The remaster gives 12 points per level to spend (secondary: Steam discussions, Beebom). Its developers describe it as a mix of the old system and Skyrim's, not Skyrim-style. "Widely criticised" has no primary source (common knowledge; set aside). See Teaching: the remaster changed character levelling, not enemy scaling | search summaries only; no Bethesda page fetched |
| Slay the Spire's designers aim for every card to have a place and avoid anything too warping | `TECH` Sidegrades | CONFIRMED (secondary) | Anthony Giovannetti, GDC 2019, "'Slay the Spire': Metrics Driven Design and Balance"; the GDC news page loaded without the talk text, Game Developer and video summaries agree | https://www.gdcvault.com/play/1025731 |
| Overwatch's roster as horizontal design | `TECH` Sidegrades | UNSUPPORTED | The writer's own judgement; no source. Acceptable as an example if labelled as such | none |
| Destiny 2 sunsetting: max power stops a year after release, Season 11 cap of 1,060 on older legendary gear, Beyond Light era; later removed so gear that can reach the cap reaches future caps | `TECH` Gear expiry, `trade` 5 | CONFIRMED (secondary) | Season of Arrivals (Season 11) cap 1,060; Beyond Light raised the cap to 1,260 and the sunset gear stayed at 1,060. Removal announced Feb 2021 by Joe Blackburn (State of Destiny): "all weapons and armor that can currently be infused to the current Power Level cap can be raised to future caps". Bungie's help page and the GameSpot article return 403 | https://windowscentral.com/bungie-removing-sunsetting-destiny-2 (raw page read); Shacknews and search summaries for 1,060 |
| HoYoverse said in a Honkai: Star Rail developer radio that older characters would get "new combat modes and strengthening, so power creep would not leave them behind" | `TECH` Retroactive buffs | UNSUPPORTED (wording) | The quoted statement (3.0 developer radio, early 2025, via press) is: "difficulty deploying older characters on the battlefield and the strengthening of these older characters, are already on the schedule." It does not promise new combat modes, and "so power creep would not leave them behind" is the press's framing. Later buffs for Silver Wolf, Kafka, Blade and Jingliu in 3.4 were announced (secondary). The Sportskeeda page is a bot wall to curl | https://www.gosugamers.net/honkai-star-rail/news/74256-honkai-star-rail-announce-buffs-to-older-characters-are-already-in-the-works (search summary) |
| Pokémon VGC uses "numbered" regulation sets, each lasting one to three months, announced up to 30 days ahead, restricting species and restricted legendaries | `TECH` Format control, `FACTS` 5 | WRONG ("numbered"), rest CONFIRMED | The handbook (last revision 1 Sep 2026, 22 pages, read through pypdf) says "regulation sets that may last between one and three months" and "may be announced up to 30 days prior", with eligible and restricted Pokémon listed in Pokémon HOME. Sets in Scarlet and Violet were lettered (Regulation Set A to I), not numbered. The current handbook applies them to Pokémon Champions; the FACTS line could say so | https://www.pokemon.com/static-assets/content-assets/cms2/pdf/play-pokemon/rules/play-pokemon-vgc-tournament-handbook-en.pdf; https://www.pokemon.com/us/pokemon-news/regulation-set-f-returns-as-the-pokemon-vgc-format-starting-december-1-2025 |
| "A 5% step against the last release is a 34% rise after six" | `traps` 4 | CONFIRMED | 1.05^6 = 1.3401 | computed |
| A bleed of 7 at divisor 15 "rounds to 0 and is raised to 1, which is now 15 times as strong relative to the rest" | `ENGINE` unity pitfall | WRONG | 7/15 = 0.467; raised to 1 it is 1/0.467 = 2.14 times its intended value (it now equals an old 15 instead of 7). Fix: "about twice as strong" | computed |
| WORKED table: eight releases at 6%, gap with and without a three-release rotation | `WORKED` | CONFIRMED | Recomputed every cell: powers 100.0, 106.0, 112.4, 119.1, 126.2, 133.8, 141.9, 150.4; gaps 1.00 to 1.50; rotation gap 1.00, 1.06, then 1.12 from release 3. All match to the rounding shown. A five-release window (the second "try" question) gives 1.06^4 = 1.26 | computed |
| DIAGRAM points and EXPLAINER frames ("ending near 150", "about 1.12 times from release 3 on") | `DIAGRAM`, `EXPLAINER` | CONFIRMED | Points are 0.625 x 1.06^(n-1): 0.6625, 0.70225, 0.744, 0.789, 0.836, 0.887, 0.940; 0.940 / 0.625 = 1.504 | computed |
| x / (x + K): half the benefit at x = K | `how` 8, `TECH` Soft caps | CONFIRMED | Arithmetic | computed |

Counts: WRONG 5 (Hearthstone "long before", Hall of Fame clause, VGC "numbered", the 4%
"so" Fireball link, the "15 times" bleed). UNSUPPORTED 4 (2011 primary, overflow as a
forcing motive, HSR "new combat modes", Overwatch example). OUTDATED 0.

## Missing coverage (against "Must cover")

- **Banning** is in the toolbox list, `trade` 7 and two `alt` fields but has no TECH entry
  or example (Magic bans such as Oko, Hearthstone nerfs, the Hall of Fame as a power-level
  tool). Thin.
- **Reprints**: the brief says "reprint/rebalancing old content". Rebalancing is covered;
  reprinting (Magic reprints, Hearthstone's Core Set bringing old cards back at curated power)
  is not named. The Core Set fact is already in FACTS and could carry it.
- **Elden Ring contrast**: the brief names "Elder Scrolls / Elden Ring"; the draft says
  "Soulslike games" without Elden Ring. One clause fixes it.
- **Mark Rosewater on power level** is a named source in the brief and is not used (the
  writer rejected a summary-only claim, correctly). A Rosewater column, or a line saying
  none was used, would close it.
- **Library examples**: ea-sports-fc (Ultimate Team promo cards are the textbook case of
  sold power creep) and street-fighter (balance patches across a long-running roster) are
  not mentioned. EA FC in particular would make the gacha and monetisation paragraph
  concrete.
- **Gacha specifics** are argued as a pressure and an ethics question only; the HSR item is
  the one concrete case. Acceptable given the writer found no measurement, but thin.

## Code issues

- Unity: `Mathf.Max(int, int)`, `Mathf.RoundToInt(float)` and `Mathf.Sqrt(float)` are real
  Unity 6 APIs with these signatures; the C# compiles (expression-bodied static members,
  explicit `(float)` cast). No issue.
- Godot 4: `class_name`, `static func`, `maxi()`, `roundi()`, `sqrt()` and `float()` are
  real Godot 4 globals and syntax; `float(value) / divisor` is float division. The GDScript
  integer-division pitfall is correct. No issue.
- The Unity `pitfall` arithmetic is wrong (see table: about 2.1 times, not 15 times).
- `api` lists checked against the snippets: all used, none unused.

## Teaching issues

1. The Fireball example and the 4% figure are joined by "so", which teaches that the
   example follows from 4%. It is 1/15. Readers who check will distrust the rest.
2. `TECH` Scaling: the paragraph says Oblivion scaled enemies and loot and was criticised,
   then that the remaster changed levelling. Read together it implies the remaster fixed
   enemy scaling. It changed how the character gains attribute points; world scaling is a
   separate system. Say which problem the remaster addressed.
3. `TECH` Per-release power budget presents Wizards as a public example of a written,
   numeric power budget. Wizards' own article says it does not rigidly define Standard power
   and targets a range by reference to past formats. That is a qualitative target; the
   draft's numeric index-and-ceiling method is the writer's own proposal and should be
   labelled as such, with Wizards as the evidence that a target exists, not that it is a
   number.
4. `why` 4 and the senior interview present integer overflow as a forcing cause of
   squishes. For the one case cited, the publisher's stated reasons were readability and
   granularity. Teach overflow as a risk to track (which the `how` and `good` items already
   do well), not as what forced WoW.
5. `TECH` Format control `alt`: "Tier lists made by community (the Smogon model), which leave
   the rules unchanged". Smogon tiers are community-run formats with their own bans and
   clauses; they change the rules of their formats, just not the official ones. Reword to
   "community-run formats with their own ban lists".
6. Repetition with balance-methods (see below): the new-versus-old win-rate method, margin
   of error and self-selection are taught again in `how` 4, `verify` 2, `ai.yes` 2,
   `traps` 3 and two mid interview answers. balance-methods covers margin of error,
   self-selection and tiered telemetry in depth ("Telemetry bands by skill tier",
   "Adjusted win rate"). Keep one sentence here and point to balance-methods.
7. `TECH` Gear expiry `cost`: "the tested benefit is a smaller combination space" uses
   "tested" for a benefit Bungie stated, not one anyone tested. Use "stated".

## Overlap and links with balance-methods

- Division of labour is clean: balance-methods prices one release (cost curve, vanilla
  test, payoff matrix, Monte Carlo, telemetry) and says "the drift is called power creep";
  this topic tracks the curve across releases and links back in `rel` and `what`. No TECH
  entry repeats.
- Repeated content: win-rate reading with self-selection and margins of error (item 6
  above). The 57% interview and "sample size to tell 52% from 50%" follow-up duplicate
  balance-methods' interview material on margin of error.
- balance-methods does not link to this topic, which is why the validator warns that
  power-creep-and-content-growth has no inbound links. Recommend adding
  `['power-creep-and-content-growth', ...]` to balance-methods' `rel` at integration.

## Style

- No hype words found. US spelling: none in prose (the only `-izing` hit is the Wizards URL
  slug `revitalizing-standard`). British forms used throughout (armour, monetisation,
  levelling, offence).
- No employer, colleague or internal project of the site's owner appears.
- `TECH` Sidegrades: "slay-the-spire style card sets" reads as an id, not prose; write
  "Slay the Spire-style card sets".

## Set aside

- "Wild and Legacy-style formats keep the old pool ... and the creep still lives there":
  a design judgement consistent with the Hearthstone post's own "the wilder and more
  unpredictable Wild will be"; not flagged.
- "As Magic fans argued after 2023" (longer windows mean more sets that each must be
  strong): attributed to fans, sourced to fan press; hedged correctly, not flagged.
- Gacha "a character better than the last is a sales tool": presented as a pressure and an
  ethics question, not as a finding; the writer says so in the claim list. Not flagged.
- "Widely criticised" for Oblivion's level scaling: common knowledge, no primary source
  expected; not flagged beyond the wording note.
- Whether Wizards has changed the three-year rotation since 2023: I found nothing saying it
  has, but did not search exhaustively; not marked OUTDATED.
- Catch-up mechanics: general practice with no claim to a source; not flagged.
- Hearthstone "Standard launched 26 April 2016" is in the claim list only, not in the draft;
  not checked further.
- Midnight squish figures (item levels down by 560 and so on): in the claim list as unused;
  correctly kept out of the draft.
- The diagram uses normalised coordinates without axis numbers; the validator accepts the
  `curve` kind and the `alt` text gives the values. Not flagged.
- The validator's "not in any learning path" note applies to both drafts and is an
  integration task, not a draft defect.
