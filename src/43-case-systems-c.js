/* =====================================================================
   PROJECT SYSTEMS - C: the Unity multiplatform port
   Case: cs-unity-multiplatform-port (defined in 40-cases.js)

   Shape (full contract and field meanings live in 40-cases.js):

     SYSTEMS('cs-unity-multiplatform-port', [{
       id:'', t:'', kind:'', sum:'', stack:[''],
       parts:[{ id:'', t:'', what:'', how:[''], why:'', trade:'',
                rel:[['topic-id','why']], links:[['part-id','why']], story:'' }]
     }])

   Rules:
   - 6 to 8 systems, 2 to 5 parts each. Ids unique inside the project and
     every part id prefixed by its system id ("platform-saves").
   - kind is one of client, server, backend, data, infra, cicd, tooling,
     process. It picks the colour the node gets on the project map.
   - what is 2 to 4 sentences, how is 3 to 6 bullets, why and trade are 1 to
     3 sentences each. Every part needs at least one rel to a real topic id
     with a reason. links point at other parts of the same project.
   - Anonymised like the case itself: no product, codename, employer, host,
     schema, internal package, colleague name or business figure. Public
     libraries and tools are fine. Short declarative sentences, no em
     dashes, no clause-joining semicolons.
   - story is optional and written in first person. It is a draft for the
     reader to rewrite in their own words.
   - Content comes only from the multiplatform port survey, never from
     memory of the original project.

   Eight systems, thirty parts: code architecture and state, multiplayer,
   platform abstraction, asset pipeline, obfuscation layers, build pipelines
   and CI, logging/settings/memory budgets, and testing/rationing/conventions.
   ===================================================================== */

SYSTEMS('cs-unity-multiplatform-port', [
  {
    id:'arch', t:'Code architecture and state', kind:'client',
    sum:`The default assembly kept deliberately monolithic, three coexisting source styles, and the lookup and state-machine conventions that hold a decompiler-derived codebase together.`,
    stack:['Unity','C#','IL2CPP'],
    iv:[
      {
        q:`Why does gameplay stay in one default assembly instead of splitting into layered assemblies?`,
        a:`Because the code obfuscator that runs at player build time picks its protected target by assembly name, and that target is the default assembly. Splitting gameplay into feature assemblies would have moved most of the game outside the set the obfuscator protects, with no build error to announce it. A slower compile that everyone waits on was judged cheaper than a build that still passed and shipped unprotected. The real cost outside compile time lands on the test side. A test assembly can never reference the game assembly, so verification has to go through a reflection harness instead of a direct reference.`,
        follow:`How did the team find out the assembly split would have broken obfuscation before it shipped that way?`,
        red:`Proposing to split the assembly anyway and add an obfuscator exemption to cover the fallout. That inverts the whole reason the assembly stayed whole.`
      },
      {
        q:`What do the two component lookup helpers actually decide, and why not just call the engine's raw lookup?`,
        a:`One helper is for a reference that may legitimately be missing, like an optional companion on a prefab variant, and it returns null quietly. The other is for a reference whose absence means the scene or prefab is wired wrong, and it throws immediately with the component and object name. Raw lookup is banned in new code by written convention, so the author has to decide, at the call site, which of those two facts they are looking at, instead of leaving every missing reference read the same way in a log.`,
        follow:`Old call sites written before the convention still use the raw lookup. What happens to those?`,
        red:`Saying the two helpers are interchangeable, or that the required one should log and continue instead of throwing. That defeats the entire point of naming the difference.`
      },
      {
        q:`Why a hand-rolled state machine instead of a general framework, and why not reuse the animation system's own state graph?`,
        a:`Each state declares its own transitions from an event id in its own file, so the table stays close to the state it belongs to, which matters most in a codebase that already carries three coexisting source styles. The animation library has its own internal state machine, but that graph drives playback of clips, not gameplay decisions, and reusing it would have coupled two concerns that only accidentally share the word state. One simpler mode uses a plain begin and update state object, because the full hierarchical machine was judged too heavy for a mode that never needed hierarchy or a transition table.`,
        follow:`How does adding a new state actually work, file by file?`,
        red:`Suggesting the animation system's state graph should have driven gameplay too, to avoid maintaining two state concepts. That is exactly the coupling the design avoided.`
      }
    ],
    parts:[
      {
        id:'arch-monolith', t:'One default assembly, kept whole on purpose',
        what:`Gameplay compiles into the engine's single default assembly instead of being split into layered assemblies, and the reason is downstream rather than architectural: the code obfuscator that runs at player build time selects its protected target by assembly name. Only a handful of project-owned assemblies exist at all, for logging, an editor automation module, a prefab-extraction tool and two test assemblies, and none of them carry gameplay.`,
        how:[
          `Every gameplay type across three source styles lands in the one assembly the obfuscator is configured to rename.`,
          `The handful of assemblies that do exist are chosen because they never need the obfuscator to reach them: logging, editor tooling, and tests.`,
          `A tidy split into feature assemblies was considered and rejected once the obfuscation dependency was traced.`,
          `Compile time for the one large assembly becomes the number everyone waits on, with no partial-recompile relief.`
        ],
        why:`Splitting gameplay into its own assemblies would have silently moved most of the game outside the set the obfuscator protects, with no build error to say so. A build that still passed and still shipped, and quietly stopped protecting the thing it was bought to protect, is worse than the slower compiles it would have avoided.`,
        trade:`No assembly-boundary compile wins and no assembly-level layering enforcement. A test assembly can never reference the game assembly either, which pushes verification toward reflection elsewhere in the project.`,
        rel:[
          ['quality-and-build-health',`A build convention chosen for a downstream tool instead of for compile speed is a build-health trade-off made explicit rather than discovered later.`]
        ],
        links:[
          ['obf-code-renaming',`The renaming pass this assembly stays whole for is described here.`],
          ['process-reflection-harness',`The reflection harness exists because this same assembly boundary keeps test code out.`]
        ]
      },
      {
        id:'arch-style-roots', t:'Three source styles under one game',
        what:`The codebase runs three visibly different styles at once instead of pretending to be one: an inherited root of about eighteen hundred files in a flat namespace with an older naming convention, decompiler-derived from an earlier title on a different platform, a newer set of feature modules in their own namespaces, and a support layer for audio, localisation, memory and UI that neither owns gameplay nor imports it.`,
        how:[
          `The legacy root keeps its original indentation, naming and lack of namespaces rather than being reformatted to match.`,
          `Newer feature modules live in their own namespace tree and follow the current style guide.`,
          `The support layer is a one way dependency. Gameplay and features may call into audio, memory and UI helpers, but the support layer never calls back into gameplay.`,
          `The written convention for anyone editing either style is to match the file, not to migrate it while passing through.`
        ],
        why:`Reformatting eighteen hundred inherited files to match a newer style would touch every line without changing behaviour, and a diff that size hides the one line that does change. Leaving the seam visible costs nothing and warns every reader where the older assumptions live.`,
        trade:`Two idioms live in one codebase indefinitely, and a new engineer has to learn to recognise which file they are in before they can guess how it behaves.`,
        story:`The first time I opened the legacy root I tried to clean up a file while fixing an unrelated bug, matching brace style and adding namespaces as I went. Review came back asking why an eleven line fix had a four hundred line diff. That was the moment "match the file you are editing, never reformat untouched lines" stopped being an abstract convention and became something I actually checked before opening a pull request.`,
        rel:[
          ['lead-conventions',`A written rule to match the surrounding style instead of reformatting on the way through is exactly what a convention is for.`]
        ],
        links:[
          ['process-conventions',`The same two-style reality is written down as policy there.`]
        ]
      },
      {
        id:'arch-component-lookup', t:'Two lookup helpers instead of raw GetComponent',
        what:`Component lookup across the project goes through two small extension helpers instead of the engine's raw lookup call. One is for a reference that may legitimately be missing, the other is for a reference whose absence means the scene or prefab is set up wrong, and new code is not allowed to call the raw lookup directly.`,
        how:[
          `A "may be absent" helper returns null quietly, for optional companions on a prefab that only some variants carry.`,
          `A "required" helper throws immediately with the component and object name, for wiring that should never be missing outside of a broken scene.`,
          `Raw component lookup is banned in new code by written convention, enforced at review rather than by a compiler rule.`,
          `The distinction forces a decision at the call site instead of leaving every missing reference looking the same in a log.`
        ],
        why:`A missing reference and an optional reference are different facts, and treating them identically means every silent null is either a bug hiding as a feature or a feature hiding as a bug. Naming the difference in the helper name makes the author decide, once, which one this is.`,
        trade:`Two helpers to remember and a rule that only holds because reviewers enforce it. Old call sites written before the convention still use the raw lookup and read as exceptions rather than violations.`,
        rel:[
          ['backend-errors',`Deciding at the call site whether an absence is expected or broken is the same discipline a domain error type enforces on a server, just applied to component wiring.`]
        ]
      },
      {
        id:'arch-state-machines', t:'Hierarchical state machines built from an event table',
        what:`Gameplay states run on a hand-written state machine that builds its transition table from an event id enum, one file per state, rather than a general framework. A separate animation library is used only for played-back animation curves, and its own internal state machine never becomes the game's state layer. One simpler mode uses a plain begin and update state object where the full machine would be overkill.`,
        how:[
          `Each state declares its outgoing transitions by event id in its own file, so the table is readable one state at a time.`,
          `The animation system stays a playback tool. Its state graph drives clips, not gameplay decisions.`,
          `A lighter generic state object with just begin and update callbacks covers the one mode that does not need hierarchy or transition tables.`,
          `Adding a state means adding a file and its transitions, not touching a central switch statement.`
        ],
        why:`A hand-rolled machine keeps the transition table close to the state it belongs to, which matters most in a codebase already carrying two other unrelated styles. Reusing the animation system's state graph for gameplay would have coupled two concerns that only accidentally share the word state.`,
        trade:`There is no shared framework to fall back on across projects, so the mental model has to be taught fresh to every new engineer, and the lighter mode exists precisely because the full machine was judged too heavy for it.`,
        rel:[
          ['systemic-design',`A one file per state transition table is a system design choice about where behaviour lives, not just a coding style.`]
        ]
      }
    ]
  },
  {
    id:'mp', t:'Multiplayer', kind:'server',
    sum:`A commercial tick-based transport underneath an inherited authoritative protocol, host mode instead of dedicated servers, and the two policies that make disconnection and protection simple by being strict.`,
    stack:['Fusion','C#'],
    iv:[
      {
        q:`Why layer a hand-written authoritative protocol on top of a commercial netcode SDK instead of using the SDK's own networked-property system?`,
        a:`The hand-written protocol was inherited from an earlier title, proven across a shipped release and understood by the team, and replacing it with the SDK's native property system would have meant re-deriving behaviour that already worked. The SDK carries one networked property in the whole project, a player-id value with a change callback, plus two remote procedure calls. Everything else moves over a hand-rolled binary protocol on the SDK's reliable and unreliable data channels, with reliable sends carrying a per-target monotonic sequence number so ordering can be checked without trusting the transport alone.`,
        follow:`What does that sequence number actually protect against that the transport alone would not?`,
        red:`Proposing to rewrite everything onto the SDK's native networked properties for simplicity, without weighing the cost of re-deriving a protocol that already shipped once.`
      },
      {
        q:`Why interpolation with light prediction instead of rollback, and what does the room code's environment tag actually protect against?`,
        a:`Sessions run as host mode with lag compensation and host migration both off. Small cooperative sessions cared more about remote motion looking smooth than about frame-accurate contention, so interpolation strategies chosen per entity type, plus a lightweight prediction that the next authoritative message reconciles, bought the right thing for less cost than rollback. The room code is a short number prefixed with a letter naming which environment issued it, because development and live share one backend application id, and that tag only prevents a mismatch it can see. It does nothing for two rooms colliding inside the same environment.`,
        follow:`What kind of collision does the environment tag not protect against?`,
        red:`Claiming the environment tag prevents any two rooms from colliding. It only rules out a cross-environment mismatch.`
      },
      {
        q:`Tell me about the collision between the obfuscator and the netcode. How was it found and fixed?`,
        a:`Remote players stopped appearing in a build the week code renaming was turned on, and only in that build. The editor stayed healthy, so the usual breakpoint debugging loop was unavailable. Bisecting by build configuration rather than by code, disabling each protection layer in turn, pointed at the renaming pass rather than the asset hashing pass within two attempts. The networking library resolves its generated members by name at runtime, so renaming them had silently broken remote player registration. The whole generated class was exempted rather than the specific members that had broken, with a short comment left at the attribute explaining why.`,
        follow:`Why exempt the whole class instead of just the members that actually broke?`,
        red:`Proposing a member-level exemption as tidier. That approach had already been tried and had already failed once when the SDK regenerated a member.`
      }
    ],
    parts:[
      {
        id:'mp-netcode-layers', t:'A commercial transport under a hand-written protocol',
        what:`Networking runs in two stacked layers. A commercial tick-based SDK supplies transport, sessions and matchmaking, and a hand-written authoritative client-server protocol inherited from an earlier title rides on top of it with its own message types and per-entity synchronisers. Almost nothing uses the SDK's own networked-property system directly.`,
        how:[
          `The SDK carries one networked property in the whole project, a player-id value with a change callback, plus two remote procedure calls.`,
          `Everything else moves over a hand-rolled binary protocol on the SDK's reliable and unreliable data channels.`,
          `Reliable sends carry a per-target monotonic sequence number so ordering can be checked without trusting the transport alone.`,
          `An unreliable send that would exceed the transport's message size ceiling is automatically retried as reliable instead of being dropped.`
        ],
        why:`The inherited protocol was proven across a shipped title and understood by the team, and replacing it with the SDK's native property system would have meant re-deriving behaviour that already worked. Using the SDK only for transport and session lifecycle kept the risk in the new part of the stack small.`,
        trade:`Two systems now own overlapping ideas of a network message, one from the SDK and one hand-rolled, and a newcomer has to learn both to add a single message type.`,
        rel:[
          ['server-realtime-protocol',`A hand-written binary protocol riding on a third-party transport is a direct answer to what a realtime protocol has to decide.`],
          ['risk-and-dependencies',`Keeping a proven inherited protocol and bounding a new dependency to transport only is a deliberate risk trade.`]
        ]
      },
      {
        id:'mp-host-interp', t:'Host mode, interpolation and measured latency',
        what:`Sessions run as host mode rather than a dedicated server, with lag compensation and host migration both off. Remote players are shown through swappable interpolation strategies driven by incoming messages rather than by rollback, and latency is measured in the application itself with a rolling average instead of trusted from the transport layer. Lobby discovery uses a short numeric room code, prefixed with a one-letter tag naming which environment issued it, because the development and live environments share a single backend application id.`,
        how:[
          `A handful of interchangeable lerp strategies handle different motion shapes for remote entities, chosen per entity type.`,
          `Local interaction predicts a target position that the next authoritative message reconciles, a lightweight version of prediction rather than full rollback.`,
          `Latency is sampled at an application-level rate and rolling-averaged over a few samples rather than read once from the SDK.`,
          `A disposable session-search object lists open rooms for public matchmaking, separate from the private room-code path.`,
          `The environment letter in the room code exists purely so a support conversation about a code can start by ruling out the wrong environment.`
        ],
        why:`Small cooperative sessions cared more about remote motion looking smooth than about frame-accurate contention, so interpolation plus light prediction bought the right thing for less cost than rollback. Sharing one backend id between environments made an environment tag in the room code the cheapest way to stop a mismatched join before it happens.`,
        trade:`No lag compensation means a player with a poor connection sees their own actions corrected rather than smoothed away, and there is no contention resolution to hide it. The environment tag only prevents a mismatch it can see, it does nothing for two rooms colliding inside the same environment.`,
        story:`A support ticket came in about a player who joined a session that "did not feel like the same game", and the first suspicion was matchmaking. It was two different environments sharing a listing because a tester had used a build pointed at the wrong one before the environment tag existed on room codes. Adding the one-letter prefix took an afternoon and turned an entire class of confused support tickets into an immediate, visible mismatch instead of a mystery.`,
        rel:[
          ['server-state-sync',`Interpolation plus a reconciled local prediction, instead of rollback, is a specific state-synchronisation trade-off with a name.`],
          ['server-matchmaking',`A shared backend id across environments and the room-code tag it forces is a matchmaking constraint, not a networking one.`]
        ],
        links:[
          ['mp-netcode-layers',`The interpolation and latency measurement both ride on the hand-written protocol described there.`]
        ]
      },
      {
        id:'mp-no-reconnect', t:'Treating a suspended session as already dead',
        what:`When the operating system suspends the application during a session, the client tears the session down immediately rather than waiting to see if the player comes back. The network runner's lifetime is tied to the session rather than to a scene, and marked to survive scene loads so it cannot be destroyed by an unrelated transition while a session is still live.`,
        how:[
          `A suspend notification is treated as a fatal event for the current session, not as a pause.`,
          `There is no reconnect path. Coming back from a suspend always means a fresh join.`,
          `The runner object is marked to persist across scene loads so a scene change during play cannot orphan it.`,
          `The policy is applied uniformly regardless of how long the suspend lasts, rather than trying to guess a reasonable timeout.`
        ],
        why:`A phone that backgrounds for an incoming call leaves a session in an ambiguous state either way, and the team chose a state nobody could misread over a window where a dead session might still be operated by a stale client or by leftover server-side code. A loud, immediate failure was judged safer than a silent, inconsistent one.`,
        trade:`Anyone who takes a call mid-session loses it outright, with no grace period and no way back in. It is a decision a service with a stronger continuity requirement would have to revisit, and the project knew that going in.`,
        rel:[
          ['platform-and-session',`Deciding what a mobile session even means the moment the OS interrupts it is a platform-and-session question before it is a networking one.`]
        ]
      },
      {
        id:'mp-obf-conflict', t:'When a renaming pass meets name-based networking',
        what:`The netcode SDK resolves some of its generated network members by name at runtime rather than through a stable identifier, which makes it structurally incompatible with any tool that renames members. The project's code obfuscator does exactly that at player build time, and the two collided in a way that only ever showed up in the build the editor never produces.`,
        how:[
          `The weaved network classes the SDK generates are marked to be skipped entirely by the renaming pass.`,
          `The exemption is written at the class level rather than picked member by member, because a partial exemption breaks again on the next generated member.`,
          `A short comment sits next to the exemption explaining why it exists, so it survives the next person who is tempted to remove it as clutter.`,
          `The failure mode this exemption prevents cannot be seen in the editor at all, only in a protected player build.`
        ],
        why:`Once the SDK's reflection dependency was understood, exempting the whole class was the only fix that would not silently break again the next time the SDK regenerated its weaved members. Partial exemptions had already been tried and had already failed once.`,
        trade:`Every exemption is a hole in the protection the obfuscator exists to provide, and each one has to be justified on its own rather than assumed safe by association with this one.`,
        rel:[
          ['server-anticheat',`A protection layer that has to carve exceptions for the netcode it runs alongside is the anti-tamper version of a compatibility problem.`]
        ],
        links:[
          ['obf-exemptions',`The incident and the diagnosis technique behind this exemption are told in full there.`],
          ['obf-code-renaming',`This is the specific failure mode the renaming pass in that part causes for networked code.`]
        ]
      }
    ]
  },
  {
    id:'platform', t:'Platform abstraction', kind:'client',
    sum:`One facade so gameplay never learns which platform it is running on, and the three places platform actually has to leak through: identity, saves and touch.`,
    stack:['Unity','C#'],
    iv:[
      {
        q:`How does the game avoid a platform branch anywhere in gameplay code?`,
        a:`A single using alias per build target picks the concrete platform manager once, at compile time, before any other code compiles, and the facade class itself has no logic. Eleven small coordinator interfaces split platform services by responsibility, session, invites, friends, avatar images, privileges, connection state, notifications and the rest, and every implementation of every interface honours the same contract. Gameplay written against the interface never contains its own platform check.`,
        follow:`What happens when a new capability only makes sense on one platform?`,
        red:`Proposing runtime platform detection with branches inside gameplay as a simpler alternative. That is exactly what the facade exists to avoid.`
      },
      {
        q:`How was touch added to a game that never had it, without teaching gameplay a second input source?`,
        a:`On-screen widgets feed the existing controller and binding layer as if they were another physical device, rather than gameplay learning a second input path. All twelve files that make up the touch module live together, and the platform conditional that decides whether touch exists at all appears in exactly one of them. An editor-only preview define lets the mobile UI be exercised and tuned on a desktop machine without a device in hand.`,
        follow:`Why does it matter that the platform conditional lives in exactly one file instead of being local to each of the twelve?`,
        red:`Branching at every call site where gameplay reads a controller. That was the first draft, and it doubled the input paths through code the port was not otherwise meant to touch.`
      },
      {
        q:`Why keep the list of build define symbols so short, and what does CI do with the diagnostics one?`,
        a:`Every define symbol is a build configuration nobody tests directly, so each one multiplies the number of builds that could theoretically differ from the one anybody ran. The list stays to five symbols, each with a single stated purpose: memory diagnostics, a development-build flag, a sideload-friendly package format, a mobile UI preview, and a marker for code shared with the originating project. CI reads the current define string, appends or removes the diagnostics symbol for the run, builds, and restores the original string afterward as its own step.`,
        follow:`What happens if CI's restore step is skipped or fails after a run?`,
        red:`Suggesting a symbol be added per team request without a maintenance bar. That is exactly the growth the short list is meant to resist.`
      }
    ],
    parts:[
      {
        id:'platform-facade', t:'A compile-time facade over platform services',
        what:`An empty class deriving from a compile-time type alias picks which platform implementation backs every online service the game needs, chosen by a preprocessor condition once per build target rather than by a branch anywhere in gameplay. Eleven small coordinator interfaces cover session, invites, friends, avatar images, privileges, connection state and notifications, each with its own desktop, console and mobile implementation behind the same interface.`,
        how:[
          `A single using alias per build target picks the concrete manager type before any other code compiles.`,
          `The facade class itself has no logic. It exists only so the alias has somewhere to attach.`,
          `Eleven coordinator interfaces split platform services by responsibility instead of exposing one large platform object.`,
          `Every implementation of every interface honours the same contract, so gameplay code written against the interface never needs its own platform check.`
        ],
        why:`A single facade selected at compile time means gameplay never contains a platform branch at all, which is worth the eleven interfaces it takes to keep the contract narrow enough that a desktop and a console implementation can both honestly satisfy it.`,
        trade:`Adding a twelfth capability means touching the interface and every implementation behind it, and a capability that only makes sense on one platform still has to produce something plausible everywhere else.`,
        rel:[
          ['platform-and-session',`Isolating everything a platform can differ on behind one selected implementation is the practical shape platform abstraction takes in shipped code.`]
        ]
      },
      {
        id:'platform-saves-ids', t:'Saves and player identity, one manager per platform',
        what:`Save data goes through platform-specific managers behind a common entry point, the same shape as the online services facade. Player identity follows the same split at the data level. The networked player-id value is a different byte size depending on platform, wide enough to carry a console's native account identifier where that exists and narrower everywhere else.`,
        how:[
          `A save manager per platform target implements the same interface the rest of the game calls.`,
          `The identity struct is conditionally compiled to two different widths, picked by the same build-target conditions as everything else.`,
          `Code that reads or writes a player id never needs to know which width it compiled to. It only ever sees the struct.`,
          `The persistence backend for settings is swapped along the same seam as saves.`
        ],
        why:`Save format and identity are exactly the two things a platform vendor can require by certification, so keeping both behind the same seam as the rest of platform abstraction meant one certification change never touched gameplay code.`,
        trade:`Two players on two platforms are represented by structurally different data, which has to be reconciled anywhere the two need to be compared, such as a friends list spanning platforms.`,
        rel:[
          ['backend-migrations-config',`A value whose width depends on the environment it runs in is the same shape of problem a schema-per-shard configuration solves on a server, just compiled instead of configured.`]
        ],
        links:[
          ['platform-facade',`Saves and identity are two more instances of the same compile-time selection this system leads with.`]
        ]
      },
      {
        id:'platform-touch', t:'Touch as one module with one branch point',
        what:`Touch support was added to a game that had never had it, by bridging on-screen sticks and buttons into the same controller and binding layer gameplay already reads from, rather than teaching gameplay a second input source. All twelve files that make up the touch module live together, and the platform conditional that decides whether touch exists at all appears in exactly one of them.`,
        how:[
          `On-screen widgets feed the existing binding layer as if they were another physical device.`,
          `Every other platform check the touch module needs follows a project convention that keeps a module's conditional compilation in one file, not scattered through the twelve.`,
          `An editor-only preview define lets the mobile touch UI be exercised and tuned on a desktop machine, without a device in hand.`,
          `Gameplay code that reads input never changed, because from its side a touch press and a controller press are the same event.`
        ],
        why:`Branching at every call site where input might come from a touch screen would have doubled the input paths through code the port was not otherwise meant to touch. Bridging touch into the layer that already existed kept the blast radius to one new module.`,
        trade:`The single file carrying the platform conditional becomes a hot spot everyone eventually edits, and keeping the rule true occasionally costs an extra layer of indirection where a local check would have been two lines.`,
        story:`The obvious way to add touch would have been an if-mobile branch wherever gameplay reads a controller, and the first draft looked like exactly that. It got reverted before review because it meant relearning the same input decision in a dozen places for anyone who touched that code afterward. Bridging on-screen widgets into the controller middleware instead meant gameplay stayed provably unaware that touch existed, and the whole feature landed as twelve files behind one branch point, with a preview define so it could be tuned from a desk instead of only on a device.`,
        rel:[
          ['controls-and-friction',`Adding a second input method without adding a second decision path anywhere in gameplay is the friction problem controls design exists to solve.`]
        ]
      },
      {
        id:'platform-defines', t:'A short, purposeful list of build define symbols',
        what:`The project keeps its preprocessor define symbols deliberately few: one for memory diagnostics, one flagging a development build environment, one for a sideload-friendly package format, one enabling a mobile UI preview inside the editor, and one marking code shared with the project this port came from. CI applies the diagnostics symbol from a pipeline parameter and restores the original define string afterward rather than leaving it changed.`,
        how:[
          `Each symbol has a single stated purpose and a name that says what it does, not which team asked for it.`,
          `CI reads the current define string, appends or removes the diagnostics symbol for the run, builds, and restores the original string as its own step.`,
          `The legacy-marker symbol exists purely to flag code shared with the originating project, not to change behaviour by itself.`,
          `A short list is treated as a target to maintain, not a starting point to grow from.`
        ],
        why:`Every define symbol is a build configuration nobody tests directly, so each one multiplies the number of builds that could theoretically differ from the one anybody ran. Keeping the list short keeps that number small enough to reason about.`,
        trade:`Restoring the define string after CI touches it is one more step that has to run even when the build fails, or a later local build silently starts life with diagnostics baked in that nobody meant to ship.`,
        rel:[
          ['quality-and-build-health',`Treating define symbols as a maintained list instead of an ever-growing pile is a build-health habit with a direct payoff in how many configurations actually get tested.`]
        ],
        links:[
          ['runtime-logger',`The diagnostics symbol here is the one that turns the logger in that part on or off.`]
        ]
      }
    ]
  },
  {
    id:'assets', t:'Asset pipeline', kind:'data',
    sum:`Bundles managed by hand instead of by the engine's own asset system, protected two ways, scoped to a lifetime, and shaped for a store that ships megabytes instead of gigabytes.`,
    stack:['AssetBundles','C#'],
    iv:[
      {
        q:`Why hand-manage encrypted, name-hashed bundles instead of using the engine's built-in asset system?`,
        a:`The content is worth datamining and the binary is worth reverse engineering, and those are different threats with different defences. Bundles ship AES-encrypted, loaded through a small runtime of five files behind one asset service, and file and folder names outside a short exclusion list are separately hashed to a fixed length. Managing bundles by hand instead of through the built-in system was also already true of the inherited project, and there was no budget to migrate a shipped pipeline mid-port.`,
        follow:`Why are encryption and name hashing two separate settings instead of one obfuscation switch?`,
        red:`Saying the project should just adopt the engine's managed asset system, without addressing either the threat model or the cost of migrating a shipped pipeline mid-port.`
      },
      {
        q:`How does reference counting by lifetime scope avoid the manual bookkeeping that had already failed once?`,
        a:`Every loaded asset is counted against one of four lifetime scopes, boot, session, scene or screen, and released automatically when its scope exits rather than by a call a person has to remember. The table mapping each scope to its release trigger is generated by enumerating the scope values themselves, so a new scope cannot be added without also getting an entry in the table, closing the exact gap that manual bookkeeping had already failed at once before.`,
        follow:`What does a load counted against the wrong scope look like in practice?`,
        red:`Proposing manual unload calls reviewed carefully at code review as sufficient. That is the exact approach that had already failed on this codebase.`
      },
      {
        q:`Walk me through the tier rule and the kill switch. What does each one actually catch?`,
        a:`The tier rule sorts scenes into dependency tiers, boot, shell UI, meta world and gameplay, and each tier has a forbidden list of bundle shards it may never reference, checked as part of the build. A shell UI scene pulling in character-model or motion bundles fails at build time and names the scene and the shard together, instead of only showing up as a memory number later. The kill switch is a different tool for a different moment. A persistent-data flag disables the real unload call at runtime, so a suspected leak can be isolated on a device by comparing memory with the flag on and off, without a rebuild for every hypothesis.`,
        follow:`Why does the kill switch still count references while skipping the actual unload call?`,
        red:`Treating the kill switch as something that could ship on. It is a diagnostic tool only, confirmed off before every release build.`
      }
    ],
    parts:[
      {
        id:'assets-encrypted-bundles', t:'Hand-managed, encrypted, and name-hashed',
        what:`Assets ship as AES-encrypted bundle files rather than through the engine's managed asset system, loaded through a small runtime of five files: a manifest loader, a from-file loader, a decrypt cache, a key resolver, and one service that is the single entry point for every load. Everything under the asset folder outside a short exclusion list is also renamed to a fixed-length hash for its shipped path, with the real-name mapping kept in project settings rather than in the shipped data.`,
        how:[
          `A single asset service is the only call site allowed to touch the loaders, so every consumer goes through one place.`,
          `Bundles are encrypted at build time and decrypted through a cache as they load, rather than decrypted once to disk.`,
          `File and folder names outside the exclusion list are hashed to a fixed length before packaging, independent of the encryption step.`,
          `The two protections are separate settings, so encryption can run without name hashing and the reverse.`,
          `A fast path skips the loader entirely for a bundle already resident from an earlier load.`
        ],
        why:`The content is worth datamining and the binary is worth reverse engineering, and those are different threats with different defences. Managing bundles by hand instead of through the built-in asset system was also already true of the inherited project, and there was no budget to migrate a shipped pipeline mid-port.`,
        trade:`Every one of those five files is bespoke code the project now owns forever, doing a job the built-in system does for other projects out of the box, and both protections make anything that resolves a path or a name at runtime a candidate for breaking.`,
        rel:[
          ['infra-cdn-assets',`Choosing to hand-roll bundle loading, encryption and delivery instead of a managed asset system is exactly the kind of decision infra-cdn-assets exists to weigh.`]
        ],
        links:[
          ['obf-code-renaming',`File and folder hashing here is the asset-side counterpart to the code renaming pass described there.`]
        ]
      },
      {
        id:'assets-lifetime-scopes', t:'Reference counting by lifetime scope',
        what:`Every loaded asset is counted against one of four lifetime scopes, boot, session, scene or screen, and released automatically when its scope exits rather than by a call a person has to remember to write. The table that maps each scope to its release trigger is generated by enumerating the scope values themselves, so a new scope cannot be added without also getting an entry in the table.`,
        how:[
          `The asset service counts references per scope and key, incrementing on load and decrementing on scope exit.`,
          `A scope exiting drops every reference counted against it to zero and triggers release for anything that reaches zero.`,
          `The scope table is built by walking the enum, not maintained by hand alongside it, closing the gap where a new scope could be forgotten.`,
          `A file-presence flag in persistent data can disable the actual unload call while leaving every other part of the counting logic running.`
        ],
        why:`Manual load and unload bookkeeping had already failed once on this codebase before the port started, and generating the table from the enum removes the one step a person could skip.`,
        trade:`A load counted against the wrong scope is invisible until memory reports it, because the counting mechanism has no way to know a scope choice was wrong, only that it was made.`,
        rel:[
          ['quality-and-build-health',`An automatically generated release table closing a class of forgettable steps is a build-health investment that pays back every time someone adds a scope.`]
        ],
        links:[
          ['assets-kill-switch',`The disable-unload flag mentioned here is the tool that part uses to bisect a leak.`]
        ]
      },
      {
        id:'assets-tier-rules', t:'Scenes classified into tiers with forbidden shared bundles',
        what:`Scenes are sorted into dependency tiers, boot, shell UI, meta world and gameplay, and each tier has a list of bundle shards it is forbidden to pull in. A shell UI scene that ends up depending on character-model or motion bundles fails at build time rather than shipping and only showing up as a memory number later.`,
        how:[
          `Each tier declares the shard categories it may never reference, checked as part of the build rather than left to a reviewer to notice.`,
          `A dependency check walks a scene's actual bundle references and compares them against its tier's forbidden list before the build proceeds.`,
          `The tier a scene belongs to is a small, explicit classification maintained alongside the scene list, not inferred.`,
          `A violation reports the scene and the forbidden shard together, so the fix is obvious from the failure message.`
        ],
        why:`A shell screen that accidentally pulls in gameplay-weight content is the cheapest kind of memory regression to introduce and one of the most expensive to diagnose once it has shipped, because nothing about the screen looks wrong until a device runs low on memory.`,
        trade:`The tier table itself needs upkeep, and a legitimate new dependency between tiers turns into a conversation about updating the table rather than a five-minute code change.`,
        story:`A UI engineer wired a shell screen to preview an equipped character, calling straight into a helper that happened to load the full character-model bundle just to read one icon. It never would have shown up in a diff review, because the code looked completely reasonable in isolation. The build failed instead, naming the shell scene and the forbidden shard in the same line, and the fix was an icon-only asset instead of the full model. That failure is the exact reason the tier rule exists. The mistake was invisible in code and would have been invisible in a memory profile until someone happened to load that particular screen on a low-tier device.`,
        rel:[
          ['quality-and-build-health',`Turning a memory regression into a build failure instead of a runtime discovery is the build-health principle in its most literal form.`]
        ]
      },
      {
        id:'assets-kill-switch', t:'A runtime kill switch for bisecting leaks',
        what:`A flag stored in persistent data can disable real asset unloading at runtime without a rebuild, so a suspected leak can be isolated on a device by turning release off and watching whether memory behaviour changes, rather than by adding logging and shipping a new build for every hypothesis.`,
        how:[
          `The flag lives in persistent data so it survives an app restart and can be set without touching a build.`,
          `When set, the asset service still counts references and still calls the same code path, but the actual unload call is skipped.`,
          `Comparing memory behaviour with the flag on and off narrows a leak to either the counting logic or somewhere else entirely, in one session instead of several build cycles.`,
          `The flag is a diagnostic tool only. It is never a shipped behaviour and gets confirmed off before a release build.`
        ],
        why:`A protected player build on this project could take hours, so any technique that turns a hypothesis into an answer without another full build was worth building deliberately rather than improvising once and forgetting it.`,
        trade:`The flag has to be remembered and confirmed off before shipping, which is one more item on a release checklist for a tool that most builds never need.`,
        story:`Memory climbed steadily across a long play session on a low-memory device, and the profiler loop to chase it was too slow to be useful, a two-hour build for every guess. I set the kill-switch flag on a build already in hand, ran the same session, and watched memory climb identically, which ruled out double-loading and pointed at something never being requested for release in the first place rather than something being released and reloaded. That single comparison, on a build I already had, saved what would have been three or four more overnight builds chasing the wrong half of the system.`,
        rel:[
          ['quality-and-build-health',`A cheap way to test a memory hypothesis without a new build is exactly the kind of tooling investment that makes build health affordable to maintain.`]
        ],
        links:[
          ['assets-lifetime-scopes',`The flag disables exactly the unload call that scope exit would otherwise trigger.`]
        ]
      }
    ]
  },
  {
    id:'obf', t:'Obfuscation layers', kind:'tooling',
    sum:`Two independent protections for two different threats, each one switchable alone so a failure can be told apart from the other.`,
    stack:['IL2CPP'],
    iv:[
      {
        q:`Why two independent obfuscation layers instead of one obfuscation switch?`,
        a:`Asset-name hashing and code renaming defend against two different things, datamining of shipped content and reverse engineering of the shipped binary. Bundling both into a single switch would have made a failure in either one indistinguishable from a failure in the other. Pipeline configuration exposes both as separate booleans, so a diagnostic build can disable one while keeping the other, which is what makes an obfuscation-related bug findable at all instead of a shrug.`,
        follow:`Given a bug report, how do you tell which of the two layers is actually responsible?`,
        red:`Proposing to bundle the two protections for simplicity. That removes the one property, isolating a failure to one layer, that makes either of them diagnosable.`
      },
      {
        q:`What actually breaks when the code renaming pass runs, and why does it only show up in one kind of build?`,
        a:`Anything in the game that resolves a type or member by its name at runtime is a candidate to break once renaming runs, because the obfuscator rewrites namespace, class and member names in the compiled output after compilation. A session-state flag skips the whole pass for local or debug builds, so the failure only appears in a protected player build, the one configuration the editor never produces on its own.`,
        follow:`Why does the pass run after compilation instead of as a source transform on the checked-in code?`,
        red:`Assuming the editor would surface any renaming-related failure. The editor build stays healthy precisely because it skips the pass entirely.`
      },
      {
        q:`When you have to exempt code from the renamer, how do you decide the scope of the exemption?`,
        a:`The exemption is written at the class level, with a skip attribute and a short comment recording why, rather than picked member by member. A partial exemption had already been tried once and had already broken again the next time that generated code changed shape, because a regenerated member simply was not covered. Exempting the whole class is the version of the fix that does not need revisiting.`,
        follow:`What is the downside of exempting at the class level instead of picking individual members?`,
        red:`Defaulting to member-level exemptions as more precise or safer. That is the approach already shown to fail on this project.`
      }
    ],
    parts:[
      {
        id:'obf-code-renaming', t:'Renaming the default assembly at build time',
        what:`A commercial obfuscator rewrites namespace, class and member names, and obfuscates strings, inside the default assembly as part of the player build. It can be skipped entirely through a session-state flag for a build that needs to stay readable, and it runs after compilation rather than as a source transform, so the checked-in code never changes.`,
        how:[
          `The obfuscator targets the default assembly specifically, which is also why gameplay is kept there rather than split out.`,
          `Renaming and string obfuscation are applied to the compiled output, leaving source untouched and reviewable.`,
          `A session-state flag skips the whole pass for local or debug builds where readability inside the build matters more than protection.`,
          `Anything in the game that resolves a type or member by its name at runtime is a candidate to break once this pass runs.`
        ],
        why:`The shipped binary is an offline title with no server to hide game logic behind, so anti-reverse-engineering has to live in the artefact itself, and rewriting names after compilation protects the shipped code without ever touching the source a person reads.`,
        trade:`Anything relying on reflection, string-based lookup, or a tool that inspects type names by name breaks in exactly the build that matters most, and the fix is always a targeted exemption rather than a general one.`,
        rel:[
          ['infra-artifacts-provenance',`A build-time transform that changes what ships without changing what is reviewed is a provenance question worth being explicit about.`]
        ],
        links:[
          ['arch-monolith',`This is the transform the whole-assembly decision in that part exists to protect.`]
        ]
      },
      {
        id:'obf-two-threats', t:'Two switchable layers for two different threats',
        what:`Asset-name hashing and code renaming are two independent settings rather than one obfuscation switch, because they defend against two different things: datamining of shipped content, and reverse engineering of the shipped binary. Either can be turned off per build pipeline without touching the other.`,
        how:[
          `Asset-name hashing runs against the content tree and has nothing to do with the compiled assembly.`,
          `Code renaming runs against the compiled assembly and has nothing to do with content file names.`,
          `Pipeline configuration exposes both as separate booleans, so a diagnostic build can disable one while keeping the other.`,
          `Turning a layer off for a build is a documented, deliberate step, not a debug habit someone remembers by word of mouth.`
        ],
        why:`Bundling both protections into a single switch would have made a failure in either one indistinguishable from a failure in the other, and being able to isolate one is what makes an obfuscation-related bug findable at all instead of a shrug.`,
        trade:`Two settings to configure and remember to re-enable, and a build produced with one layer off is not the build that ships, which has to be tracked so a diagnostic build is never mistaken for a release candidate.`,
        rel:[
          ['risk-and-dependencies',`Two protections against two named threats, each independently disableable, is risk management applied to a build pipeline rather than to a schedule.`]
        ]
      },
      {
        id:'obf-exemptions', t:'Exempting what the renamer must never touch',
        what:`Some code has to be told to skip the renaming pass entirely, marked with an attribute and a short comment recording why, because certain generated code resolves its own members by name at runtime and breaks the moment those names change. The exemption is written at the class level so a future regeneration of that code stays covered.`,
        how:[
          `A skip attribute on the whole class, not on individual members, so regenerated members stay exempt automatically.`,
          `A one or two line comment next to the attribute states the reason, so it reads as a decision rather than dead code to a later editor.`,
          `Diagnosing whether a failure comes from renaming or from something else starts by disabling the renaming layer alone and reproducing.`,
          `The failure this protects against only appears in a protected player build, never in the editor, which is why the exemption has to be found once and then trusted.`
        ],
        why:`A partial exemption, picking individual members instead of the whole class, had already been tried and had already broken again the next time that generated code changed shape. Exempting the class was the version of the fix that does not need revisiting.`,
        trade:`Every exemption is a small hole in the protection the obfuscator is there to provide, and it has to be justified in isolation rather than assumed safe because a similar exemption existed elsewhere.`,
        story:`Remote players stopped appearing in a build the week code renaming was turned on for the first time, and only in that build. The editor was completely healthy, so the usual debugging loop, breakpoints and step-through, was not available at all. I bisected by build configuration instead of by code, disabling each protection layer on its own and rebuilding, which pointed at the renaming pass rather than the asset hashing pass within two attempts. The networking library resolves its generated members by name at runtime, so renaming them had silently broken remote player registration. I exempted the whole generated class rather than the specific members that had broken, because a partial exemption meant the next regenerated member would break the same way again, and left a short note at the attribute explaining why. We shipped with both protections on and never saw that failure again.`,
        rel:[
          ['quality-and-build-health',`A signal that only exists in the build nobody runs in the editor is the sharpest version of why a build has to be verified in the configuration it ships in.`]
        ],
        links:[
          ['mp-obf-conflict',`The networking-specific version of this exemption and its consequence is described there.`]
        ]
      }
    ]
  },
  {
    id:'cicd', t:'Build pipelines and CI', kind:'cicd',
    sum:`Ten desktop pipelines behind one entry point, three declarative CI pipelines around them, and the marks and markers that make a two-hour build tell the truth about itself.`,
    stack:['Jenkins','PowerShell'],
    iv:[
      {
        q:`Why one long entry-point script for ten pipelines instead of ten separate scripts?`,
        a:`Ten separate scripts for what is really one build with different endpoints would have drifted the way similar client build jobs elsewhere already had. A single entry point branches internally on which named pipeline was requested, and a table documenting all ten, with time estimates, is the reference anyone consults before choosing one. Naming follows what a pipeline produces and skips, full, full-skip-upload, player-only, rather than a number or a date.`,
        follow:`What is the cost of one script now being a single point of failure for every one of the ten pipelines?`,
        red:`Proposing to split the pipelines back into separate scripts for isolation. That reintroduces the exact drift the single entry point exists to prevent.`
      },
      {
        q:`Why does the wrapper trust a result marker the build writes over the process exit code?`,
        a:`The editor could exit non-zero after a build that had actually succeeded, and could also exit zero after one that had not, specifically in the way this project launched it headless. A signal that lies in both directions cannot be trusted alone, so the build now writes a one-line result marker near the end of its own run, and the wrapper treats that as the pass or fail signal. Every stage also writes a start and end trace into a phases log and a one-line status file, so a two-hour build can be triaged by reading one line instead of scrolling to the end.`,
        follow:`What happens if the build crashes before it gets far enough to write the result marker?`,
        red:`Saying the exit code should simply be fixed at the source. In this launch mode the exit code had already been observed lying in both directions, which is why a second, build-authored signal was needed instead.`
      },
      {
        q:`Walk me through why restoring the workspace is its own explicit CI stage, and how failures are graded.`,
        a:`The build process itself mutates the local working tree, deleting scenes and files and patching a few third-party sources, so restoring it back to a starting state is an explicit first stage rather than an assumption that the previous run cleaned up after itself. Free-text parameters are validated in a cheap setup stage before anything expensive starts. A compile or build failure stops the pipeline hard, because the resulting artefact would be worthless, while a failed symbol or store upload marks the run unstable instead of failed, keeping the built artefact so it can be uploaded by hand.`,
        follow:`What is the risk if the list of paths the build touches and the list restore reverses drift apart?`,
        red:`Treating every CI failure the same, either all hard fails or all soft warnings, instead of grading by what the failure actually destroys.`
      }
    ],
    parts:[
      {
        id:'cicd-ten-pipelines', t:'Ten named pipelines behind one entry point',
        what:`Every desktop build path, a full build, upload-only, an unprotected build for debugging, a scripts-only compile check and the rest, runs through one build-script entry point roughly fifteen hundred lines long, selected by an environment variable or a command-line argument rather than by ten separate scripts. A table documenting all ten, with time estimates, is the reference anyone consults before choosing one.`,
        how:[
          `A single entry point branches internally on which named pipeline was requested, instead of ten scripts duplicating setup and teardown.`,
          `Each pipeline is documented in one table alongside the others, with an estimated run time, so the cost of a choice is visible before it is made.`,
          `A scripts-only pipeline exists purely to check that the codebase compiles for the target platform, without producing a shippable build, for fast iteration.`,
          `Naming follows what the pipeline produces and skips, full, full-skip-upload, player-only, rather than a number or a date.`,
          `A large set of headless editor job and query scripts, callable from the same command line, extend what an automated run can inspect or fix without opening the editor interactively.`
        ],
        why:`Ten separate scripts for what is really one build with different endpoints would have drifted the way similar client build jobs elsewhere already had. One entry point with a documented table keeps the differences visible instead of duplicated.`,
        trade:`One script is now a single point of failure for every pipeline it contains, and a change intended for one named path has to be reasoned about for all ten before it ships.`,
        rel:[
          ['infra-ci-pipelines',`Collapsing near-duplicate build paths into one parameterised pipeline with a documented table is a direct answer to pipeline sprawl.`]
        ],
        links:[
          ['cicd-declarative',`The declarative CI layer around these ten pipelines is described there.`]
        ]
      },
      {
        id:'cicd-phase-trace', t:'Phase tracing and a result marker over the exit code',
        what:`Every build stage writes a start and end trace into a phases log and updates a one-line status file, and any failure is re-prefixed with the name of the phase that failed, so a two-hour log can be triaged by reading one line instead of scrolling to the end. The wrapper scripts that launch the editor prefer a result marker the build itself writes over trusting the process exit code, because that exit code had already proven unreliable in this launch mode.`,
        how:[
          `Every stage emits a start and end trace tagged with the pipeline name and phase name into a shared log.`,
          `A separate one-line status file gets overwritten at each phase boundary, so a glance answers where it is now without opening the log.`,
          `A failure message gets the failing phase name prepended before it surfaces anywhere else, so the very first thing read names the stage.`,
          `The wrapper reads a result marker line the build process writes near the end of its own run, and treats that as the pass or fail signal instead of the exit code.`,
          `The exit code is still recorded, but only as a secondary signal, never as the deciding one.`
        ],
        why:`The editor could exit non-zero after a build that had actually succeeded, and could also exit zero after one that had not, in the specific way this project launched it headless. A signal that lies in both directions cannot be trusted alone, and the fix chosen was to have the build state its own result rather than infer it from the process.`,
        trade:`The result marker only helps if the build gets far enough to write it, so a hard crash before that point still falls back to the less trustworthy exit code, and the phase log is one more artefact that has to be kept and read.`,
        story:`A two-hour build reported success and produced an artefact nobody could install. Reading the raw log to find out why took most of an afternoon, because nothing in it said where to look. Phase tracing turned that afternoon into a one-line answer the next time something failed, and the result marker turned reported success into something the build itself had to state rather than something inferred from an exit code we had already caught lying twice. The rule I still apply is that a status signal earns trust only after it has been watched failing correctly at least once, and this one had not been, which is exactly why it fooled us.`,
        rel:[
          ['quality-and-build-health',`A pipeline signal shown to lie in both directions, and the decision to stop trusting it alone, is the build-health lesson in its most concrete form.`]
        ],
        links:[
          ['cicd-ten-pipelines',`These traces run inside the ten pipelines that part describes.`]
        ]
      },
      {
        id:'cicd-declarative', t:'Three declarative CI pipelines, one stage shape',
        what:`Desktop, Android and iOS builds run through three separate CI pipeline definitions that nonetheless share one stage shape: checkout, a setup stage that validates parameters and resolves the editor version and path, a workspace restore, applying build metadata, the build itself, symbol upload, an optional archive, and a conditional final upload. Android adds a step converting the bundle to an installable package for test distribution, and iOS adds its own packaging and symbol upload steps particular to that platform's toolchain.`,
        how:[
          `All three pipelines declare the same named stages in the same order, so a person who knows one can read the other two.`,
          `Setup resolves the editor version from project settings and the editor install path from an environment value, before anything expensive starts.`,
          `Android's extra stage converts the primary build artefact into a format installable directly on a test device.`,
          `iOS's extra stages install native dependencies and export the platform-specific installable through the packaging method the pipeline parameter selects.`,
          `Every platform-specific difference lives inside a stage that all three share, rather than as a fourth, divergent pipeline.`
        ],
        why:`A shared stage shape means a change to how setup validates parameters, or how upload is graded, is one edit that applies to every platform, instead of three edits that can drift out of sync with each other.`,
        trade:`A platform-specific need that does not fit the shared stage shape has to be squeezed into it anyway, or the shape itself has to change for all three pipelines at once.`,
        rel:[
          ['infra-ci-pipelines',`Three pipelines sharing one stage shape across different platform toolchains is a specific, workable answer to keeping CI consistent without pretending the platforms are identical.`]
        ],
        links:[
          ['cicd-discipline',`Setup validation, grading and restore, described there, are shared stages every one of these three pipelines runs.`]
        ]
      },
      {
        id:'cicd-discipline', t:'Validating, grading and restoring around every build',
        what:`Free-text parameters are checked in a cheap setup stage before anything expensive starts, so a bad upload target or a wrong build-info key fails in the first minute rather than after a two-hour build. Failures are then graded rather than treated as one outcome, and because the build process itself mutates the local working tree, deleting scenes and files and patching a few third-party sources, restoring that tree back to its starting state is an explicit first stage of its own rather than an assumption.`,
        how:[
          `Setup validates the upload target against a fixed set of accepted values and the build-info key against the settings asset it is supposed to name, before the build stage runs.`,
          `A compile or build failure stops the pipeline hard, because the resulting artefact would be worthless.`,
          `A failed symbol or store upload marks the run unstable instead of failed, keeping the built artefact so it can be uploaded by hand.`,
          `Network-touching steps get a small number of retries with backoff before they are allowed to fail the run.`,
          `Restore always runs first, undoing exactly the paths the build process is known to mutate, deliberately leaving source, editor scripts and project settings untouched.`,
          `Local development swaps a couple of these decisions for marker dotfiles a developer can toggle directly, rather than needing the full parameter set for a quick check.`
        ],
        why:`A network flake at the very end of a long build had been discarding a good artefact and forcing a restart from checkout, and a build that mutates its own working tree cannot assume the previous run cleaned up after itself, especially one that was cancelled or crashed partway through.`,
        trade:`Grading adds a state between pass and fail that everyone reading pipeline results has to understand, and two lists, what the build touches and what restore reverses, have to be kept in agreement by hand or a forgotten path breaks the next run.`,
        rel:[
          ['infra-ci-pipelines',`Early validation, graded failure, and an explicit restore stage are three separate, concrete answers to keeping a pipeline that mutates state predictable across many runs.`],
          ['pm-qa-release',`Deciding which failures should stop a release process and which should only flag it for a person is a release-planning question wearing CI mechanics.`]
        ],
        links:[
          ['cicd-declarative',`Setup, grading and restore are stages every one of the three pipelines in that part runs.`]
        ]
      }
    ]
  },
  {
    id:'runtime', t:'Logging, settings and memory budgets', kind:'client',
    sum:`A logger that costs nothing in a release build, settings that survive a missing key gracefully, and quality defaults chosen from the hardware actually in the player's hand.`,
    stack:['Unity','C#'],
    iv:[
      {
        q:`How does the logging facade cost nothing in a release build?`,
        a:`Every method on the facade carries compile-time conditional attributes tied to editor and development-build symbols. In a release build the call sites disappear entirely, arguments and all, rather than running and being filtered by a level check. A runtime level check still pays the cost of building the log message before deciding to discard it, and on a fixed lower-tier device that cost is not free. Removing the call site at compile time removes the cost along with the log line.`,
        follow:`What has to happen for a diagnostic that must survive into a release build to actually work?`,
        red:`Proposing a runtime log-level check as equivalent. It still builds the message, interpolated string and all, before deciding not to print it.`
      },
      {
        q:`Why does loading settings default a missing key instead of treating it as an error?`,
        a:`Player settings are string keys mapping to enum-defined integer values, persisted through the same platform-swapped save backend as everything else. Loading applies a documented default for any key the save data does not contain, which is what lets a new setting be added later as just a new key with a documented default, requiring no migration of existing save data. The risk is that a wrong default is much harder to notice than a wrong current value, because it only shows up for players who never touched that setting.`,
        follow:`How would you catch a wrong default before it ships, given it is invisible until a player who never touched it is affected?`,
        red:`Proposing to fail loudly on any missing key. That breaks every existing save the moment a new setting is added, which is the exact migration cost defaulting was meant to avoid.`
      },
      {
        q:`Why derive memory budgets from measured device memory instead of from the platform name?`,
        a:`Two phones running the same platform can carry very different amounts of installed memory, and capping quality by platform alone would have let the weaker half of the installed base pick settings the device could not sustain through a load spike. A tier classifier reads installed memory at start-up and sorts the device into low, mid or high, publishing three separate numbers per tier, a steady-state budget, a peak-during-load allowance, and a loading-stage budget.`,
        follow:`Why does the loading spike get its own separate number instead of folding into the steady-state budget?`,
        red:`Proposing one single memory number per tier instead of the three separate figures. That collapses exactly the distinction the load-spike allowance exists to make.`
      }
    ],
    parts:[
      {
        id:'runtime-logger', t:'A logging facade that disappears in release',
        what:`The logging facade mirrors the engine's own debug surface as a drop-in, but every method on it carries compile-time conditional attributes tied to editor and development-build symbols. In a release build the call sites disappear entirely, arguments and all, rather than running and being filtered by a level check.`,
        how:[
          `Every facade method is attributed to compile out entirely unless an editor or development-build symbol is present.`,
          `Because the attribute removes the call site, an interpolated string built just for that log line is never evaluated in release either.`,
          `A separate console-platform logger exists for the one platform that needs its own output channel, kept apart from the general facade.`,
          `Diagnostics that must survive into a release build, memory diagnostics among them, are gated behind their own distinct define rather than riding on the general debug symbols.`
        ],
        why:`A runtime level check still pays the cost of building the log message before deciding to discard it, and on a fixed lower-tier device that cost is not free. Removing the call site at compile time removes the cost along with the log line.`,
        trade:`A diagnostic someone needs in a release build has to be deliberately placed behind its own define, and forgetting that means it silently does not exist in exactly the build where it might have mattered.`,
        rel:[
          ['quality-and-build-health',`Making a debug facility provably free in the build that ships is a performance and build-health decision made once, at the facade, rather than repeated at every call site.`]
        ],
        links:[
          ['platform-defines',`The diagnostics define this logger checks is one of the small set of symbols kept there.`]
        ]
      },
      {
        id:'runtime-settings', t:'Enum-keyed settings with documented defaults',
        what:`Player settings are stored as string keys mapping to integer values, each integer meaningful through its own per-option enum, persisted through the same platform-swapped save backend the rest of the game uses. Loading applies a documented default for any key the save data does not contain, rather than treating a missing key as an error.`,
        how:[
          `Each setting has a stable string key and an enum defining what its integer values mean.`,
          `Load reads whatever keys are present and fills in a written default for anything missing, rather than failing or leaving the setting unset.`,
          `The persistence backend underneath is the same one that varies by platform, so settings inherit that abstraction rather than needing their own.`,
          `A new setting added later is simply a new key with a documented default, requiring no migration of existing save data.`
        ],
        why:`A settings format is one of the longest-lived contracts a game has with data it already shipped, and defaulting a missing key gracefully is what lets a new setting be added without a migration step for every existing save.`,
        trade:`A default has to be chosen and documented for every setting up front, and a wrong default is much harder to notice than a wrong current value, because it only shows up for players who never touched that setting.`,
        rel:[
          ['backend-migrations-config',`Defaulting a missing key instead of requiring a migration is the client-side version of the same forward-compatibility problem a schema migration solves on a server.`]
        ]
      },
      {
        id:'runtime-budgets', t:'Memory budgets set from the hardware, not the platform',
        what:`A memory-tier classifier reads installed device memory at start-up and sorts it into low, mid or high, publishing an explicit budget in megabytes for each, with a separate allowance for the spike a scene load causes and a further separate figure for the loading stage itself. Selectable quality options are then capped by the tier the device actually reports, not by which platform it is.`,
        how:[
          `Device tier is decided once, at start-up, from measured installed memory rather than from a platform check.`,
          `Each tier publishes three numbers: a steady-state budget, a peak-during-load allowance, and a loading-stage budget.`,
          `Quality settings the player could otherwise choose are capped by whichever tier the device landed in.`,
          `The same classification is reused wherever a decision needs to know how much headroom the device actually has, not just whether it is a phone.`
        ],
        why:`Two phones running the same platform can carry very different amounts of memory, and capping quality by platform alone would have let the weaker half of the installed base pick settings the device could not sustain during a load spike.`,
        trade:`A budget nobody can fail is a wish rather than a control, so setting real numbers per tier means some devices are deliberately locked out of quality settings they could technically render, just not sustain through a load.`,
        story:`The port had to fit a console-sized asset library into a phone with a fraction of the memory, and the first attempt at a single memory budget either crashed the low end or wasted headroom on the high end, because a phone covers an enormous spread of actual hardware. Classifying by measured installed memory instead of by platform name, and publishing separate numbers for steady state and for the spike a load causes, was what let quality defaults follow the device in front of the player instead of a guess about phones in general. The regression that used to show up as a crash report from a low-tier device later showed up as a build failure from the tier rule instead, which is exactly the direction I wanted that kind of bug to move in.`,
        rel:[
          ['platform-and-session',`Deriving a memory budget from measured hardware rather than assumed platform capability is what platform-and-session thinking looks like once it reaches actual numbers.`]
        ],
        links:[
          ['assets-tier-rules',`The regression this budget protects against is the same one that part catches at build time.`]
        ]
      }
    ]
  },
  {
    id:'process', t:'Testing, rationing and conventions', kind:'process',
    sum:`Tests that resolve the game by name because they are not allowed to reference it, a compiler that is the real gate, and the written rules that keep two coding eras and a null policy from colliding.`,
    stack:['Unity Test Framework'],
    iv:[
      {
        q:`Why do tests resolve game types by name through reflection instead of referencing the game assembly directly?`,
        a:`Test code lives only in dedicated, editor-only assemblies that never reference the game assembly, a direct consequence of keeping gameplay in the one assembly the obfuscator protects. That forces every test that needs a game type to resolve it by string name from the loaded application domain and drive it through reflected accessors, and that reflection is centralised in one harness file rather than scattered across every test.`,
        follow:`What kind of bug does this move from a compile error into a test failure instead?`,
        red:`Proposing that tests simply reference the game assembly and exempt it from obfuscation. That reopens the exact gap the assembly boundary exists to close.`
      },
      {
        q:`Why do the settings tests boot the real boot scene instead of mocking startup?`,
        a:`A test that mocks initialisation only proves the mock works. The settings suite loads the actual boot scene, waits with an explicit timeout for a specific runtime object that only exists once meta-progress has initialised, and fails loudly if that object never appears. Assertions afterward read logged or stored values, setting a non-default value, saving, reloading, and asserting the value came back, never a visual check.`,
        follow:`What kind of bug would a mocked version of this test have missed entirely?`,
        red:`Proposing to mock initialisation to speed the suite up, since it is slower and more fragile than a unit test. That trades away the one thing this suite exists to catch.`
      },
      {
        q:`Walk me through the build-rationing ladder. Why isn't a clean compile good enough on its own?`,
        a:`Compiling clean, with no new warnings introduced, is the bar every change has to clear before anything more expensive runs, and it is the de facto gate for most changes. Above it sits a written ladder: static inspection of the diff and logs, a compile-only check, editor play mode, one batched device build, and a second device build only if the first falsifies the hypothesis being tested. A protected player build took hours, so treating every question as needing one would have made iteration impossibly slow, while never reaching for one would have missed exactly the failures that only appear on a device.`,
        follow:`What keeps the ladder from becoming a licence to guess under deadline pressure?`,
        red:`Saying every uncertain change should just go straight to a device build to be safe, since that is the most trustworthy answer. That is precisely the instinct the ladder exists to interrupt.`
      }
    ],
    parts:[
      {
        id:'process-reflection-harness', t:'Reflection harnesses, because tests cannot reference the game',
        what:`Test code lives only in dedicated, editor-only assemblies that never reference the game assembly, a direct consequence of keeping gameplay in one assembly the obfuscator protects. That forces every test that needs to touch a game type to resolve it by name from the loaded application domain and drive it through reflected accessors, and that reflection is centralised in one harness file rather than scattered across every test.`,
        how:[
          `Test assemblies are configured not to auto-reference the game assembly, and nothing in them is allowed to import a game type directly.`,
          `A single harness function resolves a game type by its string name from the running application domain.`,
          `Reflected field and method access goes through helpers in the same harness file, so a rename inside the game surfaces as one broken helper instead of many broken tests.`,
          `The trade was accepted deliberately, in exchange for keeping the shippable assembly single and fully obfuscatable.`
        ],
        why:`A test assembly that could reference the game would have forced gameplay to leave the protected assembly, or would have forced tests into the same assembly the obfuscator targets, and neither was acceptable next to the obfuscation requirement.`,
        trade:`A rename inside the game is invisible to the compiler from the test side and only shows up when a reflection lookup fails at runtime, which pushes a class of bug that would normally be a compile error into a test failure instead.`,
        rel:[
          ['backend-testing',`Choosing where reflection lives instead of avoiding it entirely is the same kind of testing-integrity trade-off a server test suite has to make around its own boundaries.`]
        ],
        links:[
          ['arch-monolith',`This harness exists because of the assembly decision made there.`]
        ]
      },
      {
        id:'process-boot-tests', t:'Tests that boot the real application',
        what:`A settings-focused test suite does not mock startup. It loads the actual boot scene, waits with an explicit timeout for a specific runtime object that only exists once meta-progress has initialised, and fails loudly if that object never appears, verifying the real initialisation path rather than a stand-in for it.`,
        how:[
          `The test loads the same boot scene a player's device loads, not a stripped test scene.`,
          `It waits for a named object to exist, with an explicit timeout and an assertion failure rather than an indefinite wait.`,
          `Assertions after boot read logged or stored values, setting a non-default value, saving, reloading, and asserting the value came back, never a visual check.`,
          `Each assertion carries its own message, so a failure names what was expected without anyone having to re-run it under a debugger.`
        ],
        why:`A test that mocks initialisation only proves the mock works. Booting the real scene is the only way to catch an initialisation-order bug that a mock would have quietly skipped past.`,
        trade:`Booting the real application makes these tests slower and more fragile to unrelated startup changes than a unit test would be, which is why they stay a small, deliberately chosen suite rather than the default shape for every test.`,
        rel:[
          ['backend-testing',`Verifying the real path instead of a convenient stand-in is the same integrity question a server test suite asks about its own expected values.`]
        ]
      },
      {
        id:'process-compile-gate-ladder', t:'Compile as the real gate, and a ladder above it',
        what:`The de facto gate for most changes on this project is simply that the open editor compiles with zero errors and zero new warnings, with an actual player build rationed above that because it is expensive. A written ladder orders the escalation: static inspection of the diff and logs, a compile-only check, editor play mode, one batched device build, and a second device build only if the first falsifies the hypothesis being tested.`,
        how:[
          `Compiling clean, with no new warnings introduced, is treated as the bar every change has to clear before anything more expensive runs.`,
          `The ladder is written down as a rule, not left to individual judgement, with each step explicitly labelled by whether it needs a build at all.`,
          `Plans for risky changes state up front which rung of the ladder they expect to need.`,
          `Pull requests record builds expected against builds actually used, so the ladder's honesty can be checked after the fact.`,
          `A device build only happens a second time if the first one disproves what was being tested, not to double-check a result that already answered the question.`
        ],
        why:`A protected player build on this project took hours, so treating every question as one that needs a device build would have made iteration impossibly slow, while treating no question that way would have missed exactly the failures that only appear on a device.`,
        trade:`The ladder can become a licence to guess if nobody checks whether it is being followed honestly, which is the whole reason it asks pull requests to record expected builds against used ones rather than trusting memory.`,
        story:`Under a milestone deadline, the instinct with any uncertain change is to just build it on a device and look, because that answer feels the most trustworthy. The ladder existed specifically to interrupt that instinct: read the diff and the logs first, then compile only, then try it in editor play mode, and only then reach for the two-hour build, and only a second time if the first genuinely failed to answer the question. Writing builds expected into the plan before starting, and comparing it against builds used afterward, turned a habit that could have quietly drifted back into build-everything-to-be-sure into something the next pull request review could actually check.`,
        rel:[
          ['pm-estimation',`A written escalation ladder with an expected-versus-used check is estimation discipline applied directly to the cost of verifying a change.`]
        ],
        links:[
          ['cicd-ten-pipelines',`The expensive rung of this ladder is exactly the build these pipelines produce.`]
        ]
      },
      {
        id:'process-conventions', t:'Written conventions for two styles and one null policy',
        what:`Project rules live in layered instruction files that auto-attach to matching paths by declared file patterns, plus a docs folder that walks every feature through six phases from request to report, with finished work swept into an archive folder so the live docs stay current. Two of those written rules matter every day: match the style of the file you are editing rather than reformatting it, and treat a missing reference as either nullable data or a broken setup, never as a case to silently paper over.`,
        how:[
          `Rule files carry metadata describing which paths they apply to, so a rule attaches itself rather than needing to be remembered.`,
          `The six-phase docs structure, request, analysis, plan, implementation, verification, report, gives every feature the same shape to review against.`,
          `Finished feature docs move to an archive folder, keeping the live set small enough that someone would actually read it.`,
          `The style rule explicitly names the two coexisting conventions in the codebase and says which one wins in which file.`,
          `The null policy separates a value that is legitimately absent, which the code should handle, from a broken wiring, which should fail loudly rather than being silently defaulted.`
        ],
        why:`Review memory does not scale past a handful of people, and both of these rules exist because the alternative, relearning the same argument in every review, had already happened enough times to be worth writing down once.`,
        trade:`A rule file only helps the people who read it, and a docs structure with six phases is more ceremony than a one-line comment for the smallest changes, which tempts people to skip it exactly when it would have caught the most.`,
        rel:[
          ['lead-conventions',`Writing down a style rule and a null-handling policy instead of re-explaining them in every review is what a convention is for.`]
        ],
        links:[
          ['arch-style-roots',`The two-style reality this convention names in writing is described in practice there.`]
        ]
      }
    ]
  }
]);

/* ---------------------------------------------------------------------
   FLOWS and PROJECT_INTERVIEW for cs-unity-multiplatform-port.
   Contract and step/edge rules live in src/40-cases.js.
   Content sourced only from the multiplatform port survey and the
   systems and parts already written above.
   --------------------------------------------------------------------- */
FLOWS('cs-unity-multiplatform-port', [
  {
    id:'session',
    t:'A multiplayer session',
    sum:`One session from a room code to a torn-down runner. The interesting parts are the ones that only exist because two environments share one backend id, and the one that only exists because a phone can be interrupted at any time.`,
    steps:[
      { id:'room-code', t:'Room code with env tag', sys:'mp',
        d:`A short numeric room code is issued with a one-letter prefix naming which environment issued it, because the development and live environments share a single backend application id.` },
      { id:'join', t:'Session join attempt', sys:'mp',
        d:`The client submits the room code to the commercial SDK's session join call, which is the only decision point between a normal join and a refusal.` },
      { id:'join-fail', t:'Join fails, back to lobby', sys:'mp',
        d:`A join can be refused for a wrong code, a full room, or a mismatched environment, and any of those returns the client to the lobby screen to try again with a fresh code.` },
      { id:'host-mode', t:'Host mode starts', sys:'mp',
        d:`A successful join starts the session in host mode rather than a dedicated server, with lag compensation and host migration both off.` },
      { id:'protocol', t:'Custom protocol runs', sys:'mp',
        d:`The hand-written authoritative protocol inherited from an earlier title takes over messaging, riding the SDK's reliable and unreliable data channels with its own message types.` },
      { id:'interp', t:'Remote entities interpolate', sys:'mp',
        d:`Remote players are shown through swappable interpolation strategies driven by incoming messages, while local interaction predicts a target the next authoritative message reconciles.` },
      { id:'suspend', t:'OS suspend detected', sys:'mp',
        d:`When the operating system suspends the application during play, the client treats the notification as fatal for the current session rather than as a pause.` },
      { id:'teardown', t:'Session torn down', sys:'mp',
        d:`The session ends immediately with no reconnect path, so coming back from a suspend always means a fresh join through a new room code.` }
    ],
    edges:[
      ['room-code','join'],
      ['join','join-fail','refused'],
      ['join','host-mode','accepted'],
      ['host-mode','protocol'],
      ['protocol','interp'],
      ['interp','suspend'],
      ['suspend','teardown']
    ]
  },
  {
    id:'release-build',
    t:'Desktop release build',
    sum:`Ten pipelines behind one entry point, walked as the one path that matters: markers to a restored workspace, with the build's own result marker deciding which branch the end of the run takes.`,
    steps:[
      { id:'markers', t:'Marker toggles set', sys:'cicd',
        d:`Local dotfiles or CI parameters pick which pipeline runs, which branch to pull, and which build-info key names the target environment.` },
      { id:'restore-git', t:'Git restore, clean, pull', sys:'cicd',
        d:`The working tree is restored, cleaned and pulled fresh before any step that mutates it runs, because a leftover change from a cancelled build cannot be assumed gone.` },
      { id:'prepare', t:'Workspace prepared', sys:'cicd',
        d:`A prepare step deletes every scene outside the boot scene from the build set and patches a few third-party sources, mutations the restore stage will later undo.` },
      { id:'pipeline', t:'Phase-traced pipeline runs', sys:'cicd',
        d:`The chosen named pipeline builds through the engine headless, with every stage writing a start and end trace and a one-line status file as it goes.` },
      { id:'obfuscate', t:'Optional obfuscation', sys:'obf',
        d:`Asset name hashing and code renaming run unless a session-state flag skips one or both for a build that needs to stay readable or fast.` },
      { id:'result', t:'RESULT marker read', sys:'cicd',
        d:`The wrapper reads a result marker line the build process writes near the end of its own run, because the exit code alone had already proven unreliable in this launch mode.` },
      { id:'upload', t:'Symbol upload, store or archive', sys:'cicd',
        d:`On a passing result, symbols are uploaded and the build either goes to the store or is archived, depending on the pipeline parameter that chose the upload target.` },
      { id:'restore', t:'Workspace restored', sys:'cicd',
        d:`The mutated paths are restored to their pre-build state as an explicit step, leaving source, editor scripts and project settings untouched throughout.` }
    ],
    edges:[
      ['markers','restore-git'],
      ['restore-git','prepare'],
      ['prepare','pipeline'],
      ['pipeline','obfuscate'],
      ['obfuscate','result'],
      ['result','upload','pass'],
      ['result','restore','fail'],
      ['upload','restore']
    ]
  },
  {
    id:'memory-triage',
    t:'Memory regression triage',
    sum:`How a memory number becomes a fix without burning a two-hour build on every guess: a build-time check for the cheap case, and a kill-switch bisect for the case that only shows up on a device.`,
    steps:[
      { id:'report', t:'Memory report arrives', sys:'runtime',
        d:`A device shows memory climbing across a long session, or a scene fails the tier check outright during a build.` },
      { id:'tier-check', t:'Tier rule checked', sys:'assets',
        d:`The scene's actual bundle dependencies are compared against its dependency tier's forbidden shard list before the build proceeds any further.` },
      { id:'tier-fail', t:'Build fails early', sys:'assets',
        d:`A forbidden dependency, such as a shell screen pulling in a character-model bundle, fails the build immediately and names the scene and the shard together.` },
      { id:'snapshot', t:'Memory snapshot taken', sys:'runtime',
        d:`When the tier rule passes and the regression is a runtime one, a profiler snapshot narrows the suspect scope before any device build gets scheduled.` },
      { id:'bisect', t:'Kill-switch bisect', sys:'assets',
        d:`A persistent-data flag disables the real unload call on a build already in hand, and comparing memory with the flag on and off narrows the leak without a rebuild.` },
      { id:'device-build', t:'One batched device build', sys:'cicd',
        d:`A single on-device build validates the hypothesis the kill-switch comparison pointed at, rather than reaching for a build for every guess.` },
      { id:'fix', t:'Fix applied', sys:'arch',
        d:`The actual cause the bisect narrowed to, such as a load never released or never counted against the right scope, gets corrected in code.` },
      { id:'remeasure', t:'Budgets re-measured', sys:'runtime',
        d:`The device's memory behaviour is re-checked against its tier's steady-state and peak-during-load budgets to confirm the fix actually holds.` }
    ],
    edges:[
      ['report','tier-check'],
      ['tier-check','tier-fail','fails'],
      ['tier-check','snapshot','passes'],
      ['snapshot','bisect'],
      ['bisect','device-build'],
      ['device-build','fix'],
      ['fix','remeasure']
    ]
  }
]);

PROJECT_INTERVIEW('cs-unity-multiplatform-port', {
  junior:[
    {
      q:`What was this project, and what part of it did you personally own?`,
      a:`It was porting a shipped console title to desktop and mobile in Unity, keeping its multiplayer and content while fitting a fraction of the original memory budget. Work started across the client as a general engineer on the port, then moved into a technical lead role. Day to day that meant the platform abstraction layer, the asset pipeline's memory budgets, and later the build pipelines and CI, plus features like adding touch input to a game that had never had it.`,
      follow:`Which of those areas did you spend the most time in, and why?`,
      red:`Describing the whole project in vague generalities without naming a single system or decision actually touched.`
    },
    {
      q:`Walk me through what happens when a player joins a multiplayer session, from the room code to being in the game.`,
      a:`A room code is a short number prefixed with a letter naming which environment issued it, because development and live share one backend application id. The client submits the code through the commercial SDK's session join call. If it is accepted, the session starts in host mode, and a hand-written authoritative protocol running over the SDK's data channels takes over messaging. Remote players are shown through interpolation driven by incoming messages rather than prediction and rollback. If the join fails, the client just goes back to the lobby to try again.`,
      follow:`Why does the room code need an environment tag at all?`,
      red:`Describing this as if the commercial SDK's own networked-property system carries gameplay state. Almost none of it does. The SDK is transport and session only.`
    }
  ],
  mid:[
    {
      q:`Why does gameplay code stay in one big default assembly instead of being split into smaller ones?`,
      a:`The code obfuscator that protects the shipped binary selects its target by assembly name, and that target is the default assembly. Splitting gameplay out would have quietly moved most of the game outside the set the obfuscator protects, with no build error telling anyone. A slower compile everyone waits on was judged a better trade than a build that ships unprotected without saying so.`,
      follow:`What did that decision cost on the testing side?`,
      red:`Saying the split should happen anyway because compile time matters more, without engaging with what an unprotected build with no error means for an offline shippable binary.`
    },
    {
      q:`Tell me about the hardest bug you debugged on this project.`,
      a:`Remote players stopped appearing on device the week code obfuscation was turned on, and only in that build, never in the editor. Bisecting by build configuration instead of by code, disabling each protection layer on its own and rebuilding, pointed at the renaming pass rather than the asset-hashing pass. The networking SDK resolves its generated network members by name at runtime, so renaming them had silently broken remote player registration. The whole generated class was exempted rather than individual members, because a partial exemption had already failed once when the SDK regenerated a member, with a comment left explaining why.`,
      follow:`Why did bisecting by build configuration work faster than bisecting by code here?`,
      red:`Jumping straight to a networking explanation and debugging the protocol, when the move that actually found it was isolating which build-time transform was responsible.`
    },
    {
      q:`How did the team decide when a change needed an actual device build versus just compiling?`,
      a:`There was a written escalation ladder: static inspection of the diff and logs, a compile-only check, editor play mode, then one batched device build, and a second device build only if the first one disproved the hypothesis being tested. A protected player build took hours, so treating every question as needing a device build would have made iteration impossibly slow, but skipping device builds entirely would have missed exactly the failures that only show up on one. Pull requests recorded which rungs of the ladder were expected against which were actually used, so the ladder could not quietly turn into everyone just guessing.`,
      follow:`What stopped the ladder from becoming a licence to skip verification under deadline pressure?`,
      red:`Saying the team always built on device for anything uncertain. That ignores the entire reason the ladder existed.`
    },
    {
      q:`Walk me through what a desktop release build actually does, end to end.`,
      a:`It starts from marker-file toggles for a local run or parameters for CI, restores and cleans the git working tree and pulls, then a prepare step strips non-boot scenes and patches a few third-party sources, because the build process itself mutates the working tree. The chosen named pipeline runs with a phase trace written at the start and end of every stage. Code obfuscation runs unless a flag skips it. The wrapper reads a result marker the build itself writes, because the process exit code had proven unreliable in that launch mode, rather than trusting the exit code alone. On success, symbols are uploaded and the build either goes to the store or gets archived. Either way, the workspace gets explicitly restored afterward, undoing exactly the paths the build is known to mutate.`,
      follow:`Why does restoring the workspace need to be its own explicit stage rather than an assumption?`,
      red:`Skipping the restore-workspace step in the walkthrough entirely, as if the build touches nothing outside its own artefact.`
    }
  ],
  senior:[
    {
      q:`Walk me through the overall architecture: what already existed, what you added, and how the pieces talk to each other.`,
      a:`The inherited base was a console title's gameplay: three source styles under one default assembly, a hand-written authoritative network protocol, and a large body of decompiler-derived code. The port layered a commercial tick-based SDK under that protocol for transport and sessions, added a per-platform online services facade behind eleven coordinator interfaces so gameplay never branches on platform, bridged touch into the existing input middleware as a virtual device, moved assets to hand-managed encrypted bundles with scope-based reference counting, and built ten named desktop pipelines behind one entry point with three declarative CI pipelines around them. Almost everything new had to slot in without disturbing the assembly boundary the obfuscator depends on.`,
      follow:`Which of those additions had to be most careful about not breaking that assembly boundary, and why?`,
      red:`Describing the port as a rewrite rather than as new layers added around an inherited core. That misrepresents both the risk profile and the actual work.`
    },
    {
      q:`What would you do differently if you started the port again?`,
      a:`Treating an operating system suspend as instant session death was the right call for correctness, but it is the decision the team knew going in that a live service with a stronger continuity requirement would have to revisit. A design pass on a real reconnect path would be worth doing even if it shipped disabled at first, rather than an architecture with no path to add one later. The tier table and the obfuscation exemption list would also be worth reviewing on a schedule instead of only when something breaks, since both are lists that go stale silently.`,
      follow:`What would a minimal reconnect path have needed that a same-session teardown does not?`,
      red:`Claiming the memory or obfuscation trade-offs would have been avoided entirely. Both were deliberate, load-bearing decisions with named alternatives already rejected for good reasons.`
    },
    {
      q:`Tell me about a release incident: something that went wrong close to shipping and how you handled it.`,
      a:`A two-hour build reported success through its exit code after actually failing, and the artefact it produced could not be installed. The exit code had proven unreliable in the specific way the pipeline launched the editor headless, in both directions, reporting success after failure and failure after success. The fix was to stop trusting it alone. The build itself now writes a result marker line near the end of its run, and the wrapper treats that as the deciding signal, with phase traces at every stage boundary so a failure that does happen can be triaged from one status line instead of an hour of log reading.`,
      follow:`What made the team confident the new result-marker signal was actually trustworthy, rather than just a second guess?`,
      red:`Treating the exit code as fixable in isolation, or assuming a second signal is automatically more trustworthy without ever having watched it fail correctly first.`
    },
    {
      q:`How was the port scoped and rationed, given it had to fit a fraction of the original memory budget?`,
      a:`Budgets were set per device tier from measured installed memory rather than from the platform name, with separate numbers for steady state, the spike during a scene load, and the loading stage itself, because a phone covers a huge spread of actual hardware. Scenes were classified into dependency tiers with a forbidden-shard list per tier, so an accidental dependency became a build failure instead of a memory regression discovered later. Manual load and unload bookkeeping had already failed once, so reference counting moved to lifetime scopes with the release table generated from the enum, and a runtime kill switch let a suspected leak be isolated on a device without a multi-hour rebuild for every hypothesis.`,
      follow:`Why does the loading-stage budget need its own number instead of being covered by the steady-state figure?`,
      red:`Describing memory management here as reactive profiling rather than as budgets enforced ahead of time at build and design level.`
    },
    {
      q:`Two people disagree about whether an inherited convention, like the reflection-only test harness or an obfuscator exemption, should be relaxed. How do you make that call?`,
      a:`The move is to trace what the convention is actually protecting before touching it. The reflection harness exists only because test assemblies cannot reference the game assembly, itself a direct consequence of keeping gameplay in the one assembly the obfuscator protects. Relaxing it means either weakening that protection or moving gameplay out of the protected set, and both have to be argued on those terms, not on test convenience alone. An obfuscation exemption is narrower. It is justified once, for a specific class, with a comment saying why, and a new exemption has to be justified on its own rather than assumed safe because a similar one exists elsewhere. Either way the decision has to be traced back to the threat the convention defends against, not decided by which team is more annoyed by it today.`,
      follow:`What would actually change your mind about relaxing the assembly restriction itself?`,
      red:`Treating both conventions as arbitrary friction to be removed for developer convenience, without naming what either one is defending against.`
    }
  ]
});
