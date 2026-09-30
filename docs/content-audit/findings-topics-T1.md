# Topic audit T1 (player, experience, core, systems, content, level: 39 topics)

Checked against sources: Cookie Clicker offline production (wiki), Wrath Classic Dungeon Finder (GameSpot, NME), Karma Police (PC Gamer), 999 flowchart (Zero Escape wiki), Mega Man 11 Double Gear (MMKB), Candy Crush 100 levels (mobilegamer.biz), Unity 6 OverlapSphereNonAlloc (not obsolete), Godot is_class docs. No topic in this batch has a facts field.

## Verdicts

who-is-the-player | ok | low code nit
player-motivation | ok | Quantic Foundry model correct
fantasy | ok | minor Unity subscription leak
return-and-quit | ok | Cookie Clicker 91 percent for 7 days 8 hours confirmed
finding-an-idea | ok | no games linked
core-experience | ok | no games linked, minor snippet nit
fun-dimensions | ok | no games linked
goals-horizons | ok | two weak game links
tension-release | ok | minor naming
mastery-discovery-expression | ok | solid
social-experience | issues | WoW Dungeon Finder facts confirmed; Unity RPC snippet incomplete
feature-vs-experience | ok | no games linked
design-pillars | issues | Godot find_children with class_name likely fails; weak game links
core-loop | ok | solid
decisions | issues | Unity focus bug; Karma Police claim confirmed
risk-reward | ok | minor wording and links
agency-and-emergence | ok | solid
challenge-failure-recovery | issues | Godot retry timer never prints
skill-and-mastery | issues | Unity snippet null reference
time-and-turns | issues | what is a wall
genre-hybrids | issues | what is a wall
mechanics-and-rules | ok | solid
depth-vs-complexity | ok | solid
systemic-design | ok | minor code and link nits
economy-and-resources | ok | Hearthstone, StarCraft, Diablo II facts fine
progression | ok | solid
difficulty | issues | Mega Man 11 claim wrong
builds-and-loadouts | ok | weak links only
knowledge-as-progression | ok | long what; 999 and Steins;Gate claims confirmed
content-multiplies | ok | solid
encounters-and-enemies | ok | solid
items-weapons-abilities | issues | Godot pitfall text truncated
quests-and-events | ok | solid
procedural-content | ok | MSFS and Compton facts fine
puzzle-design | issues | what is a wall; diagram misstates lock rule
level-structure | issues | game links do not show the pattern
pacing | issues | game links are environment claims
spatial-composition | issues | game links are world claims
encounter-design | ok | solid

## Findings (ranked)

| id | topic.field | problem | evidence | severity | fix |
|---|---|---|---|---|---|
| T1-1 | difficulty.how (Mega Man 11 bullet) | Says a player on critical health can "fire both Double Gears once, at the price of being left one hit from death". Double Gear is one ability that runs both gears at once; it needs critical health, cannot be cancelled, and its price is a long overheat (no gears, no charge shots, one shot at a time), not "one hit from death". | MMKB Double Gear System: after it ends Mega Man cannot use the gears or fire charge shots until cooled down (https://megaman.fandom.com/wiki/Double_Gear_System) | high | Replace with: "Mega Man 11 lets a player on critical health trigger Double Gear, both gears at once, at the price of a long overheat afterwards, beside four ordinary difficulty presets." |
| T1-2 | items-weapons-abilities.eng.godot.pitfall | The pitfall sentence is cut off: "A typo such as mods.get( Declare the keys as StringName constants..." The example typo and what goes wrong at runtime are missing. | src/24-topics-content.js line 233: A typo such as mods.get( Declare the keys as StringName constants | medium | Rewrite: "A typo such as mods.get(&\"raech\", 0.0) returns the default and no error, so the stat silently does nothing. Declare the keys as StringName constants in one place, so a typo fails at the reference instead." |
| T1-3 | design-pillars.eng.godot.snippet | find_children("*", "EscapeRoute") looks for a script class_name type. Godot documents that is_class ignores script class_name, and find_children matches type by class check, so the check would likely flag every level as violating the pillar. | Godot docs, Object.is_class: "This method ignores class_name declarations in the object's script." (https://docs.godotengine.org/en/stable/classes/class_object.html) | medium | Find by group: filter find_children("*", "", true, false) with n.is_in_group("escape_route"), or test `n is EscapeRoute` in a loop. |
| T1-4 | social-experience.eng.unity.snippet | CheerRpc calls ShowCheerRpc(from, RpcTarget.Single(...)) but no such method is declared. Netcode for GameObjects needs a second [Rpc(SendTo.SpecifiedInParams)] method taking RpcParams, so the snippet does not compile as shown. | Snippet: ShowCheerRpc(from, RpcTarget.Single(targetId, RpcTargetUse.Temp)); with no declaration | medium | Add [Rpc(SendTo.SpecifiedInParams)] void ShowCheerRpc(ulong from, RpcParams p = default) { ... } to the class. |
| T1-5 | challenge-failure-recovery.eng.godot.snippet | die() calls reload_current_scene() then awaits a frame to print the retry time. The node running die() belongs to the scene being freed, so the coroutine is dropped and the retry time never prints. | reload_current_scene frees the current scene; the awaiting node is part of it | medium | Start the timer in an autoload that survives the reload and print from there on the next process_frame. |
| T1-6 | skill-and-mastery.eng.unity.snippet | JumpWindows declares CharacterController cc but never assigns it (no Awake with GetComponent), so Update throws NullReferenceException on the first frame. | Snippet: CharacterController cc; then cc.isGrounded in Update, no assignment | medium | Add: void Awake() => cc = GetComponent<CharacterController>(); |
| T1-7 | decisions.eng.unity.snippet | Present() ends by selecting template.transform.parent.GetChild(0). Child 0 is usually the template itself (inactive), not a generated option, so no option gets focus and a pad cannot answer. | Snippet: SetSelectedGameObject(template.transform.parent.GetChild(0).gameObject) | medium | Keep the first created button in a variable and select that. |
| T1-8 | time-and-turns.what | One block of about 500 words naming nine systems (ATB, CTB, Press Turn, BLiTZ, pausable real time, Superhot, simultaneous turns, Clair Obscur, Civilization, CK3) before the learner has a working definition of a time structure. It reads as a wall. | what field, src/22-topics-core.js | medium | Keep the first sentences (real time, turn based, hybrids) in what. Move the named systems to short one-line examples under how. |
| T1-9 | genre-hybrids.what | About 600 words and seven games in one paragraph before it says how to spot or test a bridge. The definition is clear in the first sentence; the rest is padding for a learner. | what field, src/22-topics-core.js | medium | Cut to the definition, the failure sentence and two examples (Persona, Into the Breach). Move the rest to game pages. |
| T1-10 | puzzle-design.what | The what field mixes seven ideas (solution space, aha, red herring, batch confirmation, difficulty rhythm, hint ladder, onboarding rule) plus Ace Attorney and Danganronpa, about 500 words. Terms are defined in passing. | what field, puzzle-design | medium | Keep solution space and aha in what; move red herring, hints and batch confirmation to how. |
| T1-11 | pacing.games (In real games) | The five linked games come from environment and setting lenses (God of War hub, CoD4 Pripyat, Overwatch escort map, Beat Saber stage). None shows intensity and cognitive load being paced. | GAME_LENSES links: god-of-war [env], call-of-duty-4 [env], beat-saber [env], overwatch [env] | medium | Link games whose gameplay lens argues about pacing (Resident Evil 4, Halo, Half-Life 2) or set lens topics explicitly. |
| T1-12 | level-structure.games (In real games) | Linked claims are world-building or setting ones (Hollow Knight route map, Sonic tracks, Megami Tensei Tokyo, Katamari size gate). They do not show teach, test, twist, combine, master, rest. Only crash-bandicoot fits. | GAME_LENSES links: hollow-knight [world], sonic [world], megami-tensei [env], katamari-damacy [world] | medium | Use games whose lens describes a taught-then-twisted sequence (Celeste, Portal, Super Mario 3D Land), or add per-lens topics arrays. |
| T1-13 | spatial-composition.games (In real games) | Many of the 55 links are world-lens claims about culture, timelines or seeds (Stardew festivals, Minecraft seed, Final Fantasy XII factions). They do not demonstrate sightlines, landmarks or forks. | GAME_LENSES links: stardew-valley [world], minecraft [world], final-fantasy-xii [world] | medium | Restrict to lenses that argue about space (Elden Ring world, Hollow Knight world). |
| T1-14 | knowledge-as-progression.what | About 550 words with six games and two ending-gate details before any design advice. | what field | low | Trim to Outer Wilds, Obra Dinn and Tunic; move the rest to game pages. |
| T1-15 | knowledge-as-progression.rel | The reason for mastery-discovery-expression says discovery is one of the "three core experience dimensions"; that topic calls them long term engines. The reason for decisions is thin. | rel array | low | Use: "Discovery is one of the three long term engines; here it is the only one." |
| T1-16 | decisions.eng.godot.snippet | present() calls queue_free() on old buttons and then grab_focus() on get_child(0). Freed nodes stay until end of frame, so on a second call focus goes to a dying button. | Godot Node.queue_free deletes at end of frame | low | Call remove_child before queue_free, or await one frame before focusing. |
| T1-17 | puzzle-design.diagram | Diagram note says a conclusion locks once several independent clues agree (edge "3 independent"). Obra Dinn locks when three fates are correct at once, not when three clues agree. | Diagram note vs what field on batch confirmation | low | Label the edge "3 correct fates at once" and reword the note. |
| T1-18 | tension-release.what | Calls the Five Nights at Freddy's tune "Freddy's Toreador Song". The music box tune is Bizet's Toreador March, also called the Toreador Song. | Common naming in FNaF sources (not checked against one citation) | low | Write "Freddy's music box playing the Toreador March". |
| T1-19 | risk-reward.what | Calls the Fire Emblem weapon triangle a "positional" risk and says a sword-user "standing next to" an axe-user changes the odds. The triangle is a matchup rule (sword beats axe) applied when one attacks the other, not a position. | Fire Emblem weapon triangle rules | low | Say "a matchup risk: a sword-user attacking an axe-user has changed the odds before the roll". |
| T1-20 | fantasy.eng.unity.snippet | OnEnable adds a new lambda to each action every time the component is enabled and never unsubscribes, so re-enabling doubles every verb event. | Snippet: a.performed += _ => ... in OnEnable, no OnDisable | low | Store the delegate and remove it in OnDisable. |
| T1-21 | who-is-the-player.eng.godot.snippet | current = p assigns a variable that is never declared in the snippet. | Snippet | low | Add var current: PlayerProfile above _ready. |
| T1-22 | core-experience.eng.godot.snippet | img.save_png("user://shots/...") fails silently if user://shots does not exist. | Snippet | low | Add DirAccess.make_dir_recursive_absolute("user://shots") before saving. |
| T1-23 | systemic-design.eng.godot.snippet | ground.local_to_map(global_position) passes a global position; TileMapLayer.local_to_map expects local coordinates. | Godot TileMapLayer.local_to_map | low | Use ground.local_to_map(ground.to_local(global_position)). |
| T1-24 | systemic-design.games (In real games) | Persona 5 and Nocturne world-lens claims (setting consistency) are listed as examples; they are not about shared-state systems. | GAME_LENSES links: persona-5-royal [world], smt-iii-nocturne [world] | low | Keep Minecraft, Factorio, Cookie Clicker; drop the two setting links. |
| T1-25 | builds-and-loadouts.games (In real games) | Hollow Knight healing and the CoD4 UAV HUD claims are linked but are not about builds or loadouts. | GAME_LENSES links: hollow-knight [gameplay], call-of-duty-4 [ui] | low | Keep Hades, Diablo II, Final Fantasy XII. |
| T1-26 | design-pillars.games (In real games) | Only three links, all lineage or setting claims (Skyrim, Witcher 3, Overwatch tone). None shows a pillar deciding a design choice. | GAME_LENSES links: skyrim, witcher-3 [lineage], overwatch [world] | low | Add a game whose lens states a pillar and what it forbids. |
| T1-27 | goals-horizons.games (In real games) | Crusader Kings III and Microsoft Flight Simulator claims (dynasty succession, portable skill) do not show goal horizons; Flappy Bird, Crash and Valheim fit. | GAME_LENSES links | low | Drop or re-lens CK3 and MSFS. |
| T1-28 | risk-reward.games (In real games) | Stardew Valley energy budget and Disco Elysium check voices are linked but neither is a risk versus reward choice. | GAME_LENSES links: stardew-valley, disco-elysium | low | Keep Hollow Knight, Dark Souls, Nocturne. |
| T1-29 | core-experience, fun-dimensions, feature-vs-experience, finding-an-idea .games | These four topics have no games in "In real games" (0 links), so the learner gets no worked example beyond the prose. | Link map shows GAMES(0) | low | Add lens topics for at least two games each. |
