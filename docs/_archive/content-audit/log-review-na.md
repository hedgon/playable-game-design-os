# Review of batch na (six new topics + lag-compensation example)

item | kind | verdict | change made
--- | --- | --- | ---
server-authority lag-compensation example | fact | fix | labelled illustrative; added fire time 9.950 s so 9.850 s follows; target shown 150 ms behind (was 200 ms, which is the clamp, not the delay)
server-rollback-netcode GGPO fact | fact | fix | README only supports prediction + speculative execution; save/load/advance callbacks moved to a second fact citing DeveloperGuide.md
server-rollback-netcode Fiedler fact | fact | ok | inputs only, bit-exact, playout buffer, redundant inputs verified
rollback Godot snippet | code | ok | none
rollback Unity snippet | code | fix | OnRemote wrote remote[]/conf[] before the age guard, contradicting its own pitfall; guard moved first
craft-gameplay-math Godot snippet (Basis.looking_at, Quaternion, slerp) | code | ok | none
craft-gameplay-math Unity snippet | code | ok | none
Unity LookRotation zero pitfall | fact | fix | docs say it logs an error, not a warning
Godot transform / Unity Slerp facts | fact | ok | verified
craft-game-loop Godot and Unity snippets | code | ok | none
Unity/Godot cap "map" line | fact | fix | maximumDeltaTime (seconds) is not max_physics_steps_per_frame (step count); reworded, default 8 added
Unity Time / Godot Engine facts | fact | ok | verified
craft-entities Godot Health snippet | code | ok | none
craft-entities Unity Spin system | code | fix | added [BurstCompile] on OnUpdate; API otherwise valid for Entities 1.x
Entities pitfall "API throws" | fact | fix | qualified: throws with safety checks (Editor)
Godot scene organisation fact | fact | fix | page does not use "call down, signal up"; claim rewritten to what the page says (no dependencies, node paths break, signals respond)
Entities fact | fact | fix | index page has no definitions; source changed to concepts-intro.html, claim narrowed
Nystrom fact | fact | fix | Data Locality is a separate chapter; claim narrowed to the Component chapter
craft-physics Godot snippet (get_gravity 4.3+) | code | ok | pitfall already states 4.3+; PhysicsBody2D.get_gravity exists
craft-physics Unity snippet | code | fix | comment that the Input System package is required
Unity collisionDetectionMode fact | fact | ok | verified incl. box/sphere/capsule restriction
Celeste controls fact and "Maddy published the windows" | fact | fix | maddythorson.com/celeste-controls could not be opened and coyote/buffer frame counts are unverified; removed that claim, replaced with the Celeste/TowerFall physics article (opened; it covers Actors/Solids, not coyote time)
"huge tiny ratio" wording | content | fix | reworded to extreme size or mass ratios
craft-save Godot snippet | code | ok | none (no read-back of the tmp file; stated in how, not in snippet)
craft-save "rename not atomic" pitfall | fact | fix | Godot docs say rename overwrites; POSIX rename is atomic; MoveFileEx replace-existing has no atomicity statement; pitfall rewritten around the two-rename crash window
craft-save Unity snippet | code | fix | Read now tries .bak and catches invalid JSON (ArgumentException); File.Replace guarded by Exists (destination must exist, verified)
Godot user:// fact | fact | fix | data_paths page has no FileAccess/DirAccess claims; narrowed to per-user platform folders; added DirAccess, POSIX and MoveFileEx facts
Unity persistentDataPath fact | fact | ok | verified
File.Replace fact | fact | fix | added null backup, destination-must-exist, cross-volume notes (verified)
Not verified | fact | open | Celeste coyote/buffer numbers (site unreachable); "about 0.1 s" left as an example tuned by play

validate.js: only the expected error (six topics in no path). check-layout.js: 0 overlaps.
