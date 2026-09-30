# Topic audit T5 (management, leadership, platforms; 25 topics)

Scope note: platform facts, dates and numbers were checked against the official pages (Google Play, Apple, Steamworks, Microsoft GDK XRs, PEGI, Meta, Roblox, Epic, W4, GameMaker). Epic's revenue-share page returned 403 and could not be checked. Engine snippets were read as code.

## Verdicts
pm-scoping-cuts | ok | Sound; Xenogears example fine
pm-estimation | ok | Sound techniques
pm-risk | ok | KSP2 and Runtime Fee dates check out
pm-agile-gamedev | ok | Sound
pm-cross-discipline | ok | Sound
pm-qa-release | ok | Sound
pm-liveops-cadence | ok | Sound
pm-postmortems | ok | Sound
lead-role | ok | Sound
lead-one-on-ones | ok | Sound
lead-code-review | ok | Sound
lead-conventions | ok | Sound
lead-onboarding | ok | Sound
lead-hiring | ok | Sound
lead-incidents | ok | Sound
lead-saying-no | ok | Sound
platform-choice | issues | Unity snippet does not show per-profile defines; Godot snippet has an odd line; W4 plan eligibility missing
platform-access | ok | All dated facts verified
platform-requirements | issues | Snippet robustness notes only; all dated facts verified
certification-and-review | issues | Meta claim slightly loose
ratings-and-disclosures | ok | IARC list and PEGI June 2026 verified
store-presence | ok | Google Play schedule verified; Epic terms unchecked (403)
release-and-updates | issues | Snippets migrate nothing; Meta metadata review nuance
ugc-platforms | issues | "In real games" links show modding, not a UGC platform
platforms-choosing-an-engine | ok | Prices and thresholds verified

## Findings (severity order)
| id | topic.field | problem | evidence | severity | fix |
|---|---|---|---|---|---|
| T5-1 | ugc-platforms."In real games" (games listing it) | Games that list ugc-platforms (Factorio replay, Animal Crossing art, Cities: Skylines difficulty, Beat Saber) show player mods or in-game editors, not building on Roblox/Fortnite-style platforms the topic defines | src/16-games-analysis.js 1190, 1699; src/18-games-genres.js 2909, 5887; topic what: "Building a game inside another company's platform" | medium | Retag those lenses to a modding/creator-tools topic, or add one line to the topic saying it also covers modding and player-authored content |
| T5-2 | platform-choice.eng.unity.snippet | Snippet uses built-in UNITY_STANDALONE/ANDROID symbols, so it does not show the Build Profile custom define the term and pitfall describe; no #else, so WebGL/console get no scale call | snippet: "#if UNITY_STANDALONE ... #elif UNITY_ANDROID \|\| UNITY_IOS" | medium | Use a profile define such as `#if STEAMDECK_UI` and add `#else SetScale(1f);` |
| T5-3 | platform-choice.eng.godot.snippet | `get_viewport().gui_embed_subwindows = true` in the mobile branch is unrelated to UI scale; it compiles but confuses | snippet mobile branch | low | Remove the line |
| T5-4 | platform-choice.facts (W4) | Omits that the $800/$2,000 Starter plan is for under 30 staff and under $300,000 revenue or funding | https://www.w4games.com/w4consoles | medium | Add the eligibility limit to the claim |
| T5-5 | platform-requirements.eng.unity.snippet | Handles only InputDeviceChange.Disconnected; a removed device fires Removed. Also lacks `using System.IO;` and `using UnityEngine.InputSystem;` | https://docs.unity3d.com/Packages/com.unity.inputsystem@1.14/api/UnityEngine.InputSystem.InputDeviceChange.html | low | Test `c == Disconnected \|\| c == Removed`; show the usings |
| T5-6 | platform-requirements.eng.godot.snippet | FileAccess.open result is not null-checked; FOCUS_OUT saves on every alt-tab on desktop; paused tree is never resumed in the sample | snippet _save_now | low | Add a null check; note the alt-tab cost |
| T5-7 | certification-and-review.why | "Steam and Meta Quest let updates go live without a new review": Meta reviews metadata changes (1-2 business days) though not binaries | https://developers.meta.com/horizon/resources/publish-after-sub/ | low | "...without a binary review (Meta still reviews metadata changes)" |
| T5-8 | release-and-updates.eng snippets (both) | `_migrate` and `Migrate` never change saved data; the Godot one never writes the new version back | snippets | low | Add a line showing a field being upgraded and the version being saved |
| T5-9 | store-presence.facts (Epic) | Could not be verified: Epic news page returned 403 | src URL | low | Recheck by hand |

## Addendum: full read of management and leadership, and re-checks

Re-checks: Steam Direct fee ($100, recoupable after $1,000 adjusted gross revenue) verified on the Steamworks fee page. Epic revenue share (100% of first $1M net per product per year, reset each 1 January, then 88/12, retroactive from 2025-06-01) confirmed from Epic's own text via search (its news page returns 403 to fetch; archive.org is blocked here). T5-9 is therefore resolved; the claim is right but should add "for payments Epic processes" and mention Epic First Run.

No frameworks, authors or studies are named in these 16 topics, so nothing is misattributed. None of them has engine snippets. Interview answers and rel reasons read as sound.

### Verdicts (all 16 read in full)
pm-scoping-cuts | ok | Concrete and correct; one unsourced number
pm-estimation | ok | Sound, right level
pm-risk | ok | KSP2 and Runtime Fee facts match the game lens; quadrant labels correct
pm-agile-gamedev | ok | Sound; only game link is a loose fit
pm-cross-discipline | ok | Sound
pm-qa-release | ok | Sound
pm-liveops-cadence | ok | Sound; Valheim link fits
pm-postmortems | ok | Sound; KSP2 link fits
lead-role | ok | Sound; one bottleneck claim stated as law
lead-one-on-ones | ok | Sound (situation-behaviour-impact feedback unattributed but not wrong)
lead-code-review | ok | Sound
lead-conventions | ok | Sound
lead-onboarding | ok | Sound; one unsourced timing
lead-hiring | ok | Sound; legal aside is jurisdiction-specific
lead-incidents | ok | Sound
lead-saying-no | ok | Sound

### New findings
| id | topic.field | problem | evidence | severity | fix |
|---|---|---|---|---|---|
| T5-10 | release-and-updates."In real games" | Persona expanded editions (src/18-games-series.js 563) and Microsoft Flight Simulator 2020 (src/18-games-genres.js 5127) list it, but show re-release design and a streamed-scenery reboot, not release day, patches or early access | lens text at those lines | medium | Retag or drop those two; Valheim (3958) and Subnautica-style early access fit |
| T5-11 | pm-agile-gamedev."In real games" | Subnautica lens (src/18-games-genres.js 3423) is about public early-access feedback and roadmap, not sprint vs kanban | lens mechanism text | low | Keep only if the topic mentions open development, else retag |
| T5-12 | pm-scoping-cuts.how | "It is usually a quarter of the week" is an unsourced figure | how list | low | "often a large share of the week; measure yours" |
| T5-13 | pm-scoping-cuts.why, lead-role.why | "Date, quality and scope cannot all be fixed" and "throughput is set by its worst bottleneck" are stated as laws (iron triangle, theory of constraints) without naming them as lenses | why lists | low | Prefix "As a rule of thumb" or name the lens |
| T5-14 | lead-hiring.think.traps | "Ask every candidate the same right-to-work question" is jurisdiction-specific | trap text | low | "Ask only what your local law allows, the same way for everyone" |
| T5-15 | lead-onboarding.iv | "that view expires in about two weeks" is unsourced | junior answer | low | Drop the number |
| T5-16 | store-presence.facts (Epic) | Verified, but omits that it applies to payments Epic processes and that First Run exists | Epic text via search | low | Add the qualifier |
