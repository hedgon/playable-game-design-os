# fix-fa log (T1 + T2). Full new snippets are in the source files named below.
T1-1 | fixed | difficulty (23): Mega Man 11 triggers Double Gear, both gears at once, long overheat afterwards | MMKB Double Gear System
T1-2 | fixed | items-weapons-abilities godot pitfall (24) now shows mods.get(&"raech", 0.0)
T1-3 | fixed | design-pillars godot (21): find_children("*","",true,false).filter(is_in_group("escape_route")), scene.free()
T1-4 | fixed | social-experience unity (21): added [Rpc(SendTo.SpecifiedInParams)] void ShowCheerRpc(ulong from, RpcParams p = default)
T1-5 | fixed | challenge-failure-recovery godot (22): die() moved to Checkpoint autoload with declared vars
T1-6 | fixed | skill-and-mastery unity (22): Awake() => cc = GetComponent<CharacterController>()
T1-7 | fixed | decisions unity (22): keeps first created Button, selects it
T1-8 | fixed | time-and-turns (22): what shortened to definition; named systems moved into how as 10 bullets
T1-9 | fixed | genre-hybrids (22): what = definition + failure sentence; examples moved to how
T1-10 | fixed | puzzle-design (24): what = solution space + aha; rest moved to how
T1-11..13, T1-24..29 | skipped: In real games link findings
T1-14 | fixed | knowledge-as-progression (23): what trimmed, examples moved to how
T1-15 | fixed | rel text "one of the three long term engines; here it is the only one"
T1-16 | fixed | decisions godot: remove_child before queue_free
T1-17 | fixed | puzzle-design diagram: edge "3 correct at once", note reworded
T1-18 | fixed | FNaF "music box playing the Toreador March"
T1-19 | fixed | Fire Emblem "matchup risk ... attacking"
T1-20 | fixed | fantasy unity (20): handlers dictionary, OnDisable unsubscribes
T1-21 | fixed | who-is-the-player godot (20): var current: PlayerProfile
T1-22 | fixed | core-experience godot (21): DirAccess.make_dir_recursive_absolute("user://shots")
T1-23 | fixed | systemic-design godot (23): ground.local_to_map(ground.to_local(global_position))
T2-1 | fixed | controls-and-friction godot (26): apply_bind / rebind / save_binds (all actions to one ConfigFile) / load_binds (apply only)
T2-2 | fixed | Titor posts "2000 to 2001" | wikipedia John_Titor
T2-3 | fixed | learning-from-success godot (29): echo check dropped, break after first match, pitfall about one key bound to several actions
T2-4 | fixed | visual-language unity (28): shared Material[] per step, term/api/pitfall/map explain MPB vs SRP Batcher | Unity SRPBatcher-Incompatible docs
T2-5 | fixed | narrative-pacing unity (27): Hold wrap, Evaluate, Pause, Stop only after state applied
T2-6 | fixed | platform-and-session godot (29): auto_accept_quit and quit_on_go_back false; close/back saves then quit()
T2-7 | fixed | audio godot pitfall reworded around -80 dB floor / 0 dB
T2-8 | fixed | audio unity: mixer field and MusicVol line removed
T2-9 | fixed | vertical-slice unity term and pitfall: BuildReport gives size/time, effort from time tracking
T2-10 | fixed | controls unity: also excludes <Mouse>/delta
T2-11 | fixed | PvZ free mobile "by 2013" | wikipedia Plants_vs._Zombies; GTA V largest-revenue claim NOT verified, left
T2-12..18, T2-26 | skipped: games link findings
T2-19 | fixed | playtesting prompt: 3+ matched pattern, 2 hint, 1 outlier
T2-20 | fixed | launch godot comment: run exported trailer preset
T2-21 | fixed | auto_translate_mode (Godot 4.3+)
T2-22 | fixed | Dota "well over a hundred heroes"
T2-23 | fixed | prototyping unity split into two file-labelled classes
T2-24 | fixed | ethics unity term: "before Analytics SDK 6.1"
T2-25 | fixed | polish godot: camera tween kept and killed
