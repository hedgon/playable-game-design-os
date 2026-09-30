# Topics T3 (ai, gameai, studio, 29 topics)

Not verified: Godot ternary inference, Unity -quit with -runTests, EU AI Act 2 Dec 2026 date, Steam Jan 2026 survey date. Godot avoidance_priority direction checked against the docs and the topic is right.

## Verdicts
bottleneck-shift | ok | prose, links and code read; no real problem found
ai-roles | issues | see findings
prompting-framework | ok | prose, links and code read; no real problem found
verifying-ai-output | ok | prose, links and code read; no real problem found
ai-evals | ok | prose, links and code read; no real problem found
ai-failure-modes | issues | see findings
responsibility-matrix | ok | prose, links and code read; no real problem found
ai-for-implementation | issues | see findings
ai-agentic-implementation | ok | prose, links and code read; no real problem found
ai-for-playtest-analysis | ok | prose, links and code read; no real problem found
ai-generative-assets | ok | prose, links and code read; no real problem found
ai-disclosure-policy | ok | prose, links and code read; no real problem found
ai-loop | ok | prose, links and code read; no real problem found
ingame-ai-purpose | issues | see findings
choosing-ai-technique | ok | prose, links and code read; no real problem found
perception-and-awareness | issues | see findings
navigation-and-pathfinding | ok | prose, links and code read; no real problem found
readable-and-fair-ai | issues | see findings
adaptive-and-director-ai | issues | see findings
allies-and-companions | issues | see findings
learning-based-ai | issues | see findings
generative-characters | ok | prose, links and code read; no real problem found
ai-budgets-and-debugging | issues | see findings
scripted-vs-simulated | issues | see findings
design-documents | issues | see findings
metrics-and-success | issues | see findings
team-and-collaboration | issues | see findings
planning-and-milestones | issues | see findings
quality-and-build-health | issues | see findings

## Findings
|id|topic.field|problem|evidence|severity|fix|
|-|-|-|-|-|-|
|T3-1|adaptive-and-director-ai.eng.godot.snippet|_ready() uses run_seed and _on_beat_timeout() calls spawn(); neither is declared, so the script fails to parse.|_rng.seed = run_seed ... spawn(table.pick(_rng)) with no var run_seed or func spawn|high|Declare var run_seed := 0 (or @export) and a func spawn(entry) -> void stub.|
|T3-2|metrics-and-success.eng.godot.snippet|_notification calls flush(), which is never defined, so the autoload fails to parse. It also calls get_tree().quit() right after flush(), so a network flush would be cut off, the failure the pitfall describes.|flush() then get_tree().quit(); pitfall: an HTTPRequest started in the handler never completes|high|Define flush() to write the queue to user:// synchronously and send on next launch, or await the request before quit().|
|T3-3|scripted-vs-simulated.eng.godot.snippet|CONNECT_ONE_SHOT plus an early return for non-player bodies disconnects the handler on the first body of any kind (a crate, an enemy), so the ambush never fires. The pitfall advice to combine one-shot with a group filter is wrong.|body_entered.connect(_fire, CONNECT_ONE_SHOT) ... if not body.is_in_group("player"): return|high|Connect normally, filter by group, then disconnect or set_deferred("monitoring", false) after the player passes the filter. Fix the pitfall text.|
|T3-4|learning-based-ai.eng.godot.snippet|StreamPeerTCP is used without poll() or waiting for STATUS_CONNECTED. connect_to_host returns at once, put_utf8_string fails while connecting, and get_utf8_string right after a put has no reply yet; JSON.parse_string("") gives null and _apply(null) follows.|_link.connect_to_host(...) in _initialize, then put/get in _process with no _link.poll()|high|Call _link.poll() each step, wait for STATUS_CONNECTED, and read only when get_available_bytes() > 0.|
|T3-5|quality-and-build-health.eng.unity.snippet|The class is marked Tests/Editor asmdef, so the [UnityTest] runs in Edit Mode, where SceneManager.LoadSceneAsync is not allowed. The scene must also be in Build Settings. The test fails as written.|// Tests/Editor asmdef above yield return SceneManager.LoadSceneAsync("Arena"); the pitfall itself asks for a PlayMode test|high|Move ArenaSceneLoadsWithNoErrors to a PlayMode test assembly and mention Build Settings.|
|T3-6|ai-budgets-and-debugging.eng.unity.snippet|Slicing by Time.frameCount inside FixedUpdate. FixedUpdate runs zero or several times per frame, so slices are skipped or repeated. The Godot tab correctly uses the physics frame counter. The term promises ProfilerRecorder read-back that the snippet lacks.|int phase = Time.frameCount % slices; in void FixedUpdate()|medium|Slice in Update, or keep a counter incremented in FixedUpdate.|
|T3-7|quality-and-build-health.eng.godot.snippet|Director.new() conflicts with the Director autoload used in ai-loop and adaptive-and-director-ai (an autoload name is an instance, and a class_name of that name is rejected). build_wave and tension do not exist in the adaptive topic. The Unity test likewise calls a static Director.BuildWave that the Unity Director lacks.|auto_free(Director.new()); ai-loop: Director.reset()|medium|Use a distinct class such as WaveBuilder in both tabs.|
|T3-8|planning-and-milestones.eng.unity.snippet|The comment says batchmode exits 0 without Exit, but with -executeMethod and no -quit the editor does not exit at all. The command line shown has no -quit while the pitfall discusses -quit.|EditorApplication.Exit(ok ? 0 : 1);   // batchmode exits 0 without this|medium|Say that without -quit or Exit the process stays open, and that with -quit a failed build still exits 0.|
|T3-9|planning-and-milestones.eng.godot.snippet|var node := packed.instantiate() if packed else null uses := on a ternary with null; GDScript is likely to refuse to infer the type. Not run.|var node := packed.instantiate() if packed else null|medium|Write var node: Node = packed.instantiate() if packed else null.|
|T3-10|ai-failure-modes.eng.godot.snippet|get_dependencies returns direct dependencies only, and get_slice("::", 2) is empty for entries without the uid::type::path form. A content file used only through another resource is counted as an orphan.|reachable[dep.get_slice("::", 2)] = true|medium|Recurse through dependencies, handle the plain-path form, and call the count an upper bound.|
|T3-11|ingame-ai-purpose.eng.godot+unity.snippet|The charge is a single move_and_slide() or controller.Move(), so it moves for one frame. wind_up() is never called, and in Unity a StateMachineBehaviour cannot call OnWindUpEnded without a reference.|_charge() sets velocity then one move_and_slide()|medium|Move each physics tick while a charging flag is set, for a fixed duration.|
|T3-12|allies-and-companions.eng.unity.snippet|agent.SetDestination() runs every Update, which navigation-and-pathfinding tells learners not to do. The pitfall also says equal priority makes allies immovable and deadlock, which overstates it.|void Update() { agent.SetDestination(followSlot.position);|medium|Repath only when followSlot moved past a threshold. Soften the deadlock claim.|
|T3-14|metrics-and-success.eng.godot|The Godot tab relies on NOTIFICATION_WM_CLOSE_REQUEST, which does not fire when a mobile app is suspended, while the Unity tab says mobile sessions end on pause. NOTIFICATION_APPLICATION_PAUSED appears only in the map.|map: Unity OnApplicationPause is Godot NOTIFICATION_APPLICATION_PAUSED|medium|Add a NOTIFICATION_APPLICATION_PAUSED branch to the snippet.|
|T3-16|team-and-collaboration.eng.godot.snippet|"References inside a .tscn resolve by index" is Godot 3. Godot 4 uses string ids (id="1_abcde"). Also .uid files (Godot 4.4+) must be committed and are not listed with .import and .godot/.|## References inside a .tscn resolve by index, so a hand merge renumbers them.|medium|Say ids are strings, and add: commit the .uid files beside scripts.|
|T3-22|perception-and-awareness.In real games|The Resident Evil 4 [sound] lens is about the player hearing enemies, not about how an agent senses the player.|lens claim: enemies be heard as a crowd before they are seen|medium|Replace it, or keep only Metal Gear Solid.|
|T3-23|readable-and-fair-ai.In real games|Two of three linked lenses do not show readable or fair AI: Pac-Man [art] is about sprite colour and Metal Gear Solid [lineage] is about design history. Only the MGS [ui] lens fits.|lens keys art and lineage|medium|Link Pac-Man [gameplay] and drop the lineage lens.|
|T3-13|allies-and-companions.eng.godot.snippet|The leash teleport runs every frame the ally is out of range, and the off-camera comment has no check.|# last resort, off camera only|low|Add a VisibleOnScreenNotifier3D test.|
|T3-15|metrics-and-success.eng.unity.snippet|"OnApplicationQuit never fires on mobile" is too strong.|// desktop only, never fires on mobile|low|Say "is not reliable on mobile".|
|T3-17|perception-and-awareness.eng.unity.pitfall|queriesHitTriggers only matters when a trigger sits on the mask layers; the snippet passes an occluders mask, so the described failure is overstated.|the Linecast stops on the first trigger volume between the eye and the target|low|Say "if a trigger is on an occluder layer".|
|T3-18|learning-based-ai.eng.unity.api|Sentis was renamed Inference Engine; package id com.unity.ai.inference, namespace Unity.InferenceEngine. The topic names com.unity.sentis. Later the display name reverted to Sentis.|https://discussions.unity.com/t/did-inference-engine-package-revert-to-the-old-sentis-name/1695183|low|Write Sentis (package com.unity.ai.inference).|
|T3-19|ai-roles.eng.snippets|VariantSpec is undeclared in both tabs; the Godot code loops a hard-coded 24 rather than count; the Unity code needs Assets/Content to exist.|var v := VariantSpec.new()|low|Add a short VariantSpec class and use count.|
|T3-20|ai-for-implementation.eng.unity.snippet|The line StringBuilder is built and never used. Setting the global time scale from a disposable prototype conflicts with the topic own advice.|line.Append("gold ").Append(gold);|low|Use the buffer or delete it; reset time scale on exit.|
|T3-21|design-documents.eng.unity.snippet|HelpURL("docs/encounters.md") is a relative path; HelpURL expects a URL.|[HelpURL("docs/encounters.md")]|low|Use a full https URL.|
|T3-24|allies-and-companions.In real games|God of War [ui] is about the camera; only the [lore] lens is about the companion.|claim: close camera hides the space behind Kratos|low|Keep the lore lens only.|
|T3-25|metrics-and-success.In real games|Wii Sports [business] is about a sales figure, not telemetry or success criteria for a design change.|claim: sales figure measures consoles sold|low|Keep as a proxy-metric example or replace.|
|T3-26|team-and-collaboration.In real games|Sonic Mania [lineage] shows an outside developer being hired, not roles, ownership or handoffs.|claim: came from a fan developer|low|Replace with a lens about ownership or handoffs.|
