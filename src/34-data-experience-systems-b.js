/* =====================================================================
   PROJECT SYSTEMS - B: the Unity mobile client and its CI
   Case: cs-unity-mobile-client-ci (defined in 29-data-experience.js)

   Shape (full contract and field meanings live in 29-data-experience.js):

     SYSTEMS('cs-unity-mobile-client-ci', [{
       id:'', t:'', kind:'', sum:'', stack:[''],
       parts:[{ id:'', t:'', what:'', how:[''], why:'', trade:'',
                rel:[['topic-id','why']], links:[['part-id','why']], story:'' }]
     }])

   Rules:
   - 6 to 8 systems, 2 to 5 parts each. Ids unique inside the project and
     every part id prefixed by its system id ("assets-scopes").
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
   - Content comes only from the client and CI survey, never from memory of
     the original project.

   Breakdown used here (8 systems): assembly architecture, boot, DI and
   scene routing (client) merged into one foundational system, asset
   pipeline (data), networking (client), platform bridges and store
   identity (client), testing (tooling), client build pipeline (cicd), CI
   repository (cicd), conventions and docs (process).
   ===================================================================== */

SYSTEMS('cs-unity-mobile-client-ci', [
  {
    id:'arch', t:'Assembly architecture, boot and scene routing', kind:'client',
    sum:`The layering that keeps a large client compiling in pieces, the boot sequence that turns a cold process into a playable scene, and the router that moves between scenes without every screen remembering to clean up after itself.`,
    stack:['Unity','C#','UniTask'],
    parts:[
      {
        id:'arch-layering', t:'Assembly boundaries and the one way dependency chain',
        what:`A stack of Unity assemblies runs from an entry layer with almost no code down through a client layer holding every screen, a game layer for in-game systems, a shared layer for cross-app glue, to a core layer of engine-adjacent primitives. Imports only ever point down the stack. The direction is a fact the team defends, not a preference weighed feature by feature.`,
        how:[
          `Boot sits above everything, the leanest assembly, entry point only.`,
          `Core is the lowest layer, asset loading, transport, pooling, scene routing.`,
          `Client is the largest assembly, holding almost all screen and feature logic, with dozens of internal references.`,
          `overrideReferences plus an explicit precompiled DLL list on assemblies touching vendor binaries, so a vendor DLL cannot leak into a layer that never asked for it.`,
          `The direction is written in a rules file and defended in review, not enforced by a build-time check.`
        ],
        why:`A one way graph is the property that keeps a client this size compiling in pieces and keeps the lower layers reusable outside any single feature.`,
        trade:`Enforcement is social. Nothing fails a build if a feature quietly imports the wrong direction, so the rule survives only as long as reviewers catch it.`,
        rel:[
          ['backend-layering',`Same ring argument, rules inward and drivers outward, just enforced by review here instead of by a build-time import check.`]
        ]
      },
      {
        id:'arch-asmref', t:'Folding features in without new assemblies',
        what:`A new feature folder joins the client assembly through an assembly reference file instead of becoming its own assembly definition. Dozens of internal references and dozens more precompiled DLL references sit on that one assembly, and everything inside it recompiles together.`,
        how:[
          `A folder gets an assembly definition reference, not a new assembly definition.`,
          `Everything under that reference recompiles with the rest of the client assembly.`,
          `The choice is made once at feature creation, not revisited as the feature grows.`
        ],
        why:`A new assembly is another compile unit, another set of references to keep straight, and another chance to reference the wrong direction. Folding in avoids all three at the cost of one large assembly.`,
        trade:`The client assembly is the one everyone's editor waits on to recompile, and nothing inside it is structurally stopped from reaching anything else inside it.`,
        rel:[
          ['systemic-design',`A convention with no enforcement is a system with implicit rules about what may touch what, and it decays the same way an unenforced game system does.`]
        ]
      },
      {
        id:'arch-di', t:'Dependency injection as a typed static service locator',
        what:`One instance per type sits in a generic static cache. Registration runs as a fluent chain during boot, with a small local injector per layer for scene-owned objects. Both failure modes are loud: registering a type twice throws, and resolving a type nobody registered throws.`,
        how:[
          `Register throws on double registration for a given type.`,
          `Get throws if nothing is registered for the requested type.`,
          `A scene object owns the disposable handles it created and disposes them on destroy.`,
          `An editor-only branch defers disposal past a domain reload, so an editor recompile does not tear down live singletons.`,
          `Where a value is not registered yet at the point another registration needs it, that registration takes a resolver function instead of a value, so the ordering is visible in the method that reads top to bottom.`
        ],
        why:`No reflection cost on a mobile device, registration order visible by reading one bootstrap method top to bottom, and both failure modes surface immediately instead of a null reference three calls later.`,
        trade:`It is global mutable state wearing a type safe name. Ordering bugs concentrate at boot, and the resolver-function workaround is a wart that needs a comment every time it appears.`,
        rel:[
          ['backend-di-modes',`The same one binary, one wiring story as compile-time dependency injection, minus the compile-time guarantee. Mistakes throw at runtime instead of failing a build.`]
        ],
        links:[
          ['arch-layering',`The service locator is registered from a bootstrap method that only core and above may call, so the wiring itself still obeys the layering rule.`]
        ]
      },
      {
        id:'arch-scenes', t:'Scene routing and layered transitions',
        what:`A router addresses two persistent layers, a base scene and an overlay scene, by virtual scene names distinct from Unity's own scene names. Boot runs a fixed sequence: boot scene, serializer setup, an async bootstrap that registers services in order, an additive persistent manager scene, the first transition, then the boot scene unloads itself. A soft reset back to the first screen is a first class path, not a special case added later.`,
        how:[
          `The router raises events for scene changed, Unity scene activated and virtual scene activated, so other systems react without polling it.`,
          `Base and overlay are separate layers, so a modal can sit above the current screen without unloading it.`,
          `The async bootstrap is one long method that registers services in a fixed order, so what exists at each point in boot is a fact readable top to bottom.`,
          `Soft reset is a named item on the pull request checklist, because a partial reset is worse than a full one.`
        ],
        why:`Two layers cover almost every screen shape a mobile game needs, a modal over content, without a general purpose window stack solving stacking problems the game never has.`,
        trade:`A virtual scene name is one more name to keep in sync with the Unity scene it points at, and a soft reset that skips one system's cleanup is invisible until that system's state carries into the next session.`,
        rel:[
          ['ux-as-design',`How the client moves between full screens and overlays is UX architecture before it is a code decision.`]
        ]
      }
    ]
  },
  {
    id:'assets', t:'Asset pipeline: scopes, tiers and delivery', kind:'data',
    sum:`Everything a scene needs arrives through one wrapper over Addressables, scoped to how long it should live and tiered to what the device can afford to download.`,
    stack:['Unity','Addressables'],
    parts:[
      {
        id:'assets-scopes', t:'A four value scope wrapping Addressables',
        what:`A wrapper reduces every load to one of four scopes: resident, current base scene, current overlay, next scene. A scene transition promotes next scene into current base and releases whatever the old current base and overlay held, so lifetime is tied to an event the code already raises instead of to a load and unload someone has to remember.`,
        how:[
          `Addressables handles are grabbed and stored per scope, never handled raw at the call site.`,
          `A transition event calls release on the scopes that just ended and promotes next scene into current base.`,
          `A custom object pool sits alongside it, because the engine pool resets its own counters on clear in a way that hides a leak.`,
          `Double release detection on the pool compiles in only under a debug define, and it warns instead of throwing, so a pooling bug degrades instead of taking the session down.`,
          `Release diagnostics under the same define let a leak be attributed to the scope that held it.`
        ],
        why:`Bundle leaks are the default failure of a large Addressables project, and tying release to a transition event that already fires means nobody has to remember a matching release call.`,
        trade:`A handle given the wrong scope survives until that scope changes, which shows up as memory growth rather than an error, so it is only findable through the debug diagnostics.`,
        rel:[
          ['infra-cdn-assets',`Scope and release policy is the client half of the same asset delivery problem infra solves with CDN paths and manifests.`]
        ],
        story:`Memory climbed slowly across sessions that moved through several screens, and it only showed on real devices after a long run, which made the usual profiler loop too slow to iterate on. I tied every asset handle to the scope enum built from the transition events we already had, so a transition promotes the next scope and releases the one before it. Then I made the object pool's double release detection a warning instead of an exception. Throwing would have ended a session over a pooling bug that a warning could just log, and a session ending is a worse outcome than the bug it was meant to catch. The climb flattened, and the scope is now the thing reviewers ask about whenever a new load call appears.`
      },
      {
        id:'assets-channels-tiers', t:'Two delivery channels and a graphics tier fallback',
        what:`Assets reach the player two ways, downloaded from a CDN or shipped inside the build, with a generated manifest for whatever ships inline. A graphics tier system picks a lower quality resource list for weaker devices, fetched from the same CDN path with a tier suffix, so tiering costs no extra storage.`,
        how:[
          `Per platform resource lists resolve from a low tier suffix to the plain platform name, depending on the device's assigned tier.`,
          `The in-build manifest is generated at build time, so nothing has to hand maintain which assets shipped inline against which stream from the CDN.`,
          `Runtime quality tier and manifest tier are the same decision, made once from a device classification taken at start up.`
        ],
        why:`One CDN path serving several tiers keeps the storage and publishing cost of supporting a low end device close to zero, instead of a parallel asset set for every tier.`,
        trade:`A tier boundary that later needs one more value means retagging every asset's resource list, and a mistagged asset only surfaces as an unexpectedly large download on a device nobody profiled that day.`,
        rel:[
          ['infra-cdn-assets',`One CDN path with a tier suffix is a direct instance of designing asset delivery around bandwidth as a constraint.`]
        ],
        links:[
          ['assets-scopes',`The tier decision changes which resource list a scope resolves against, not the scope logic itself.`]
        ]
      },
      {
        id:'assets-providers', t:'Custom resource providers',
        what:`Addressables' default providers are replaced by a small set of custom ones, a bundle provider, a bundled asset provider, a web request queue and a provider that tolerates a missing location instead of failing. Replacing the defaults is the point where diagnostics and request shaping actually attach.`,
        how:[
          `The web request queue caps concurrent downloads so a scene transition does not open dozens of connections at once on a mobile network.`,
          `The allow-not-found provider returns a typed miss instead of an exception, for content that is legitimately optional per platform or region.`,
          `Each custom provider is the attachment point for the release diagnostics used to find scope leaks.`
        ],
        why:`The engine's defaults have no hook for a concurrency limit or for a soft miss, and rewriting them once is cheaper than working around their absence at every call site.`,
        trade:`A custom provider is code that has to track every Addressables upgrade by hand, since nothing guarantees the base API it wraps stays compatible.`,
        rel:[
          ['infra-cdn-assets',`Concurrency limits on a download queue are a bandwidth and reliability decision, the same one any CDN client has to make.`]
        ]
      }
    ]
  },
  {
    id:'net', t:'Networking: request, push and relay', kind:'client',
    sum:`Three separate channels carry three different kinds of traffic, ordinary request and response calls, server initiated push, and a hand framed relay socket for realtime and chat.`,
    stack:['C#','protobuf','gRPC','UnityWebRequest'],
    parts:[
      {
        id:'net-protobuf-http', t:'Protobuf over HTTP with a fluent header contract',
        what:`Game API traffic is protobuf messages carried over ordinary HTTP, called through hand written thin wrappers over the generated message types rather than a generated client. A fluent header builder centralises platform, app version, session, player id, country, language and content version, plus the parser and error handling that turns a bad response into a typed error object instead of an exception.`,
        how:[
          `One static wrapper class per API domain, calling a typed post with the generated response type as its type parameter.`,
          `The header builder attaches the values every request needs, so no call site rebuilds them.`,
          `A content-type mismatch on the response becomes a synthetic protobuf error object, not a thrown exception, so a bad response is data the caller can branch on.`,
          `Post-process hooks and an injected error handler sit behind the same config object, so retry and error display policy live in one place.`
        ],
        why:`A hand written thin wrapper is small enough to read end to end, and it keeps the header contract, error handling and versioning out of every screen that happens to call the network.`,
        trade:`There is no generated client stub, so a new endpoint is a wrapper someone writes by hand, and a header the server started requiring is missed on the client until someone notices the failure.`,
        rel:[
          ['backend-api-protocol',`This is the client side of the same protobuf over HTTP choice, paid for here in hand written wrappers instead of generated ones.`]
        ]
      },
      {
        id:'net-grpc-push', t:'A gRPC push and notification channel',
        what:`A second channel, separate from the request and response API, carries push notifications over HTTP/2 through a managed gRPC client. Keepalive interval, timeout and while-idle behaviour are set explicitly, mapped to the option names the underlying transport expects.`,
        how:[
          `HTTP/2-only mode is forced so the transport does not silently fall back to a mode without long-lived streaming.`,
          `Keepalive settings are explicit rather than left at a default tuned for a different kind of traffic.`,
          `The channel is additive to the request and response API, not a replacement for it, so a push failure does not affect ordinary calls.`
        ],
        why:`Push needs a long-lived connection the request and response API was never built for, and a separate channel keeps that concern from leaking into every ordinary call's error handling.`,
        trade:`Two network stacks means two things that can be half broken at once, and a keepalive value tuned for one network can be wrong for another.`,
        rel:[
          ['server-realtime-protocol',`Push and realtime delivery share the same question, how a server reaches a client without the client asking first.`]
        ]
      },
      {
        id:'net-relay-framing', t:'Hand rolled binary framing over a relay socket',
        what:`A realtime assembly carries chat, presence and matched session traffic over a WebSocket, framed by hand as a type, a message id, an op code and a payload rather than through a generic message wrapper. A reply correlation table lets a request and response pattern work over a socket with no built-in concept of one, and the transport itself swaps at compile time between a native and a WebGL socket behind one interface.`,
        how:[
          `Every frame carries the same four fields regardless of payload, so parsing is one small routine reused everywhere.`,
          `A pending reply table keyed by message id resolves the matching response when it arrives, with a timeout for the case where it never does.`,
          `A synchronization context posts every incoming message back to the main thread, since the socket callback does not arrive on it.`,
          `The transport implementation swaps at compile time for WebGL, since that platform has no raw socket access.`,
          `A separate relay layer of pub-sub and chat clients sits above the same socket, validated per channel, with JSON and protobuf bodies resolved behind one interface.`
        ],
        why:`A push socket has no request and response contract by default, and correlation by message id is the smallest addition that gives one back without a heavier protocol.`,
        trade:`Hand rolled framing means every new message type is a manual addition to the type and op code tables, and a mismatched table between client and server fails at runtime with no schema to catch it first.`,
        rel:[
          ['server-realtime-protocol',`The framing and correlation scheme is the client half of a hand rolled realtime protocol, with the authoritative side of the same design living on the server.`]
        ],
        links:[
          ['net-grpc-push',`Push and relay are two different answers to the same problem, a long-lived channel, chosen for different traffic on the same client.`]
        ]
      }
    ]
  },
  {
    id:'platform', t:'Platform bridges and store identity', kind:'client',
    sum:`Where platform stops being an abstraction and starts deciding identity, which store the client claims to be, and which native SDK answers a given call.`,
    stack:['Unity','C#'],
    parts:[
      {
        id:'platform-facade', t:'A compile-time platform facade with no silent fallback',
        what:`One static facade resolves every platform branch a client needs, mapping the build's platform defines to a platform string and a store identifier. The final branch is a compile error rather than a default, so an unsupported platform fails at compile time instead of shipping with a guessed identity.`,
        how:[
          `A single conditional chain across iOS, Android, server, standalone and WebGL defines, each branch returning the values the rest of the codebase reads.`,
          `The store identifier is a further compile-time choice nested inside the platform branch, an alternative store defined separately on Android and a disabled path on desktop.`,
          `Every other system reads the facade's values instead of testing a platform define itself.`
        ],
        why:`The store identifier has to match a claim the server checks, so guessing it at runtime is not worth the risk, and a compile error is cheaper to fix than a silent wrong identity shipped to a store.`,
        trade:`Adding a platform means editing the one file that already knows about every other platform, and that file is dense with defines nobody wants to touch without testing all of them.`,
        rel:[
          ['platform-and-session',`The facade is where platform stops being an abstraction and starts deciding what identity the client presents to the server.`]
        ]
      },
      {
        id:'platform-bridges', t:'Native SDK bridges owned by an interface',
        what:`Anything backed by a native SDK, a web view, ads, purchases, sits behind an interface declared in the core layer with its implementation in the app layer, injected at boot like any other service. A hand maintained vendor inventory records what was imported, when and from where.`,
        how:[
          `A web view bridge, an ads bridge and a purchase bridge each declare the shape the game needs, not the shape the SDK happens to expose.`,
          `Implementations live in the app layer, so a native SDK's assembly never has to be visible to core.`,
          `A vendor record keeps name, import date, version, source and any manual post-import step, since these are the imports a package manager cannot fully automate.`
        ],
        why:`A native SDK's own API is written for every game that might use it, not this one, and an interface narrows that to the handful of calls the game actually makes.`,
        trade:`Every SDK update is a manual comparison against the bridge interface, and a hand maintained vendor log is only as good as the last person who remembered to update it.`,
        rel:[
          ['risk-and-dependencies',`A native SDK is exactly the kind of dependency that can quietly change behaviour under an update nobody scheduled time to test.`]
        ],
        links:[
          ['platform-facade',`A bridge implementation is chosen the same way the platform string is, at compile time behind the facade.`]
        ]
      }
    ]
  },
  {
    id:'testing', t:'Testing: tiers, device walk and spec generation', kind:'tooling',
    sum:`Four tiers of evidence about whether the client works, from a pure logic test that runs in a second to a spreadsheet a non-engineer can read.`,
    stack:['Unity Test Framework','NUnit'],
    parts:[
      {
        id:'testing-tiers', t:'EditMode and PlayMode in assemblies that cannot ship',
        what:`Test code lives only in dedicated test assemblies, each restricted to the editor platform and gated by a test-only define, so it cannot end up in a shipped build. Pure logic gets an ordinary attribute-based test, and anything touching GameObjects or frames gets the coroutine-style variant, with a house rule to assert on logged values rather than on anything read from the GUI.`,
        how:[
          `Editor-only platform inclusion plus a define constraint on a test-only symbol, two independent reasons the code cannot ship.`,
          `A plain test attribute covers pure logic with no scene dependency.`,
          `A coroutine-style test covers anything that needs a frame to pass or a GameObject to exist.`,
          `Assertions read a value the code already logged, not a screenshot or a visual read of the GUI.`
        ],
        why:`A test assembly that could theoretically ship is a build configuration mistake waiting to happen, and asserting on a logged value survives a UI relayout that would break an assertion aimed at the screen.`,
        trade:`Two attributes and two ways of writing a test is a small tax on every new test author, who has to know which situation they are in before writing the first line.`,
        rel:[
          ['backend-testing',`Same tiering instinct, pure logic gets a fast test and anything with real dependencies gets a slower one that actually exercises them.`]
        ]
      },
      {
        id:'testing-smoke-walk', t:'An on-device smoke walk as a third tier',
        what:`A smoke test runs on a real device, walks every non-debug scene, taps at random, and measures transition time, memory, CPU and frame rate along the way, screenshotting as it goes and posting a report. Its cases are numbered and cited directly in commit and pull request text, so a fix references the exact case it addresses.`,
        how:[
          `The walk enumerates every non-debug scene rather than a hand picked subset, so a forgotten scene cannot hide from it.`,
          `Random taps exercise input paths a scripted walk would never try.`,
          `The harness is restricted to public APIs and component lookup, no reflection and no edits to production code, so what it measures is what a player's device would actually do.`,
          `A report posts automatically with the numbers and screenshots attached.`
        ],
        why:`A profiler session on a desk misses failures that only appear after the memory and thermal state a real device reaches after several minutes of play.`,
        trade:`It is slower and noisier than a unit test, since a random tap can wander into a state nobody planned for, so its failures need a person to read the report rather than a simple pass or fail.`,
        rel:[
          ['pm-qa-release',`A device smoke walk with numbered cases is what a release gate looks like when unit tests alone are not enough evidence.`]
        ],
        links:[
          ['testing-tiers',`The smoke walk is the tier above PlayMode, trading speed for the chance to catch what only a device shows.`]
        ]
      },
      {
        id:'testing-device-farm', t:'A device farm harness gated by its own define',
        what:`A separate harness runs the actual game loop across a farm of real devices, compiled only under its own define so it never touches a normal build. Each scenario implements a shared interface, and every run produces boot time, lap time and system info records that CI can compare across runs.`,
        how:[
          `A define constraint keeps every device-farm type out of any build that does not explicitly ask for it.`,
          `Scenarios share one interface, so a new device-farm test is an implementation, not a new harness.`,
          `CI triggers a downstream job passing scenario numbers, a device preset and a timeout, rather than running the whole farm on every push.`,
          `Report records are structured, boot time, lap time, system info, so a regression across devices is a comparison instead of a read-through.`
        ],
        why:`A single device gives one data point, and mobile performance regressions hide in the spread across hardware more than in the average.`,
        trade:`A device farm is expensive and slow enough that it cannot run on every commit, so it is triggered deliberately, which means a regression can sit for a while before the farm catches it.`,
        rel:[
          ['infra-monitoring',`Structured performance records across a device fleet are the same idea as production monitoring, aimed at a build instead of a live service.`]
        ]
      },
      {
        id:'testing-spec-gen', t:'A human test-spec generator',
        what:`A generator turns structured input into markdown test plans per screen, pushed to a spreadsheet so non-engineers can read and run them. Test design becomes a versioned artefact instead of tribal knowledge someone has to ask for.`,
        how:[
          `Test plans are generated per screen from the same source that describes the screen's behaviour.`,
          `Output lands in a spreadsheet, the format the people who actually execute manual tests already use.`,
          `Because it is generated, a plan does not silently drift from the feature it describes the way a hand written one would.`
        ],
        why:`Manual test coverage only holds up if the people testing can find the current plan, and generating it keeps that plan attached to the thing it tests instead of living in someone's memory.`,
        trade:`The generator is one more thing that has to be kept in sync with whatever changed about how a screen's behaviour is described, or its output quietly goes stale.`,
        rel:[
          ['pm-qa-release',`Turning test design into a generated artefact is a QA planning decision as much as a tooling one.`]
        ]
      }
    ]
  },
  {
    id:'build', t:'Client build pipeline', kind:'cicd',
    sum:`One entry point, parameterised entirely by flags, turns a checked-out repository into a signed, provenance-stamped artefact for whichever target asked for it.`,
    stack:['Unity','IL2CPP','fastlane'],
    parts:[
      {
        id:'build-cli-entry', t:'One CLI-parameterised entry point',
        what:`A single editor entry point builds every target, driven entirely by command line flags: product name, bundle id, environment, region, build number, debuggable, development build, app bundle, script debugging, deep profile, test lab, version patch, an XML file and a build-skip flag. Configuration layers from a default key-value file, to a region and environment file, to a free-text override passed at run time.`,
        how:[
          `Every target-specific value arrives as a flag rather than a value baked into a scene or asset.`,
          `Define symbols act as the runtime switch for debug behaviour, read by conditional attributes so a call site disappears entirely on a release define instead of hiding behind preprocessor noise.`,
          `Config layering resolves default, then region and environment, then a free-text override, so a one-off build does not need a new committed file.`,
          `IL2CPP codegen, scripting backend fallback, managed stripping level and web build compression are all set from the same switch statement keyed on target.`
        ],
        why:`One entry point parameterised by flags means the difference between many targets is data, not many copies of a build script.`,
        trade:`The flag list is now the build's real interface, and a required flag missing from a manual invocation fails in a way that only makes sense if you already know the flag exists.`,
        rel:[
          ['infra-ci-pipelines',`A CLI entry point that a pipeline calls with different flags per target is exactly the shape a CI system wants to drive.`]
        ]
      },
      {
        id:'build-exclusion-lists', t:'Declarative content exclusion mirrored into source control',
        what:`Content that should not reach a given target is listed in XML, sections for data, app and debug content, and the builder deletes those paths from the asset database before building. The same lists are mirrored as sparse checkout excludes in CI, so excluded content never reaches the build agent for that target at all.`,
        how:[
          `One XML file per target lists path sections the builder deletes before invoking the build.`,
          `The debug section is skipped from deletion when the debug define is on, so a debug build keeps its debug content on purpose.`,
          `CI reads the same path lists to configure a sparse checkout, removing the content before checkout rather than after.`,
          `A folder renamed in one list and not the other either breaks the build or ships something meant to stay internal.`
        ],
        why:`Content missing from disk cannot be built into a player by accident, a stronger guarantee than trusting every build step to remember to exclude it.`,
        trade:`Two lists have to agree, one for the asset deletion and one for the sparse checkout, and nothing enforces that they describe the same paths.`,
        rel:[
          ['infra-ci-pipelines',`Excluding content before checkout instead of after build is a pipeline design decision, not just an asset one.`]
        ],
        links:[
          ['build-cli-entry',`The exclusion file is one more path the entry point reads, keyed off the same target flag.`]
        ]
      },
      {
        id:'build-two-pass', t:'A two-pass build around an asset-deletion timing wart',
        what:`The build runs the editor entry point twice. The first pass runs with the build-skip flag inside a swallowed try and catch, purely to let the asset deletions from the exclusion step settle, before the real build runs as the second pass. It is a documented workaround, not an accident.`,
        how:[
          `The first invocation performs the deletions and any asset database refresh they trigger, then exits without producing a player.`,
          `Its own failures are caught and ignored, since the only job of this pass is to let deletion side effects settle before anything reads the asset database for real.`,
          `The second invocation runs the actual build against a now stable asset database.`,
          `A comment at the call site explains why the pass exists, so nobody removes it thinking it is a duplicate.`
        ],
        why:`The asset database did not reliably finish reacting to a bulk deletion before a build read it in the same editor session, and a second, isolated editor invocation was the workaround that was actually reliable.`,
        trade:`Doubling the entry point call doubles a chunk of setup time on every build, on top of confusion for anyone who reads the pipeline before they read the comment.`,
        rel:[
          ['infra-ci-pipelines',`It is the kind of pipeline-level workaround that exists because a tool's timing does not match what the pipeline needs, and it earns a place in the pipeline itself rather than upstream.`]
        ],
        story:`A build would occasionally include a file the exclusion list had just deleted, and it only happened on the platforms with the largest exclusion lists, which pointed at timing rather than at the list itself. Deleting from the asset database and then immediately reading it in the same editor session did not reliably finish before the build step ran. The fix was blunt rather than clever: run the entry point once with a build-skip flag purely to let the deletion and its asset database refresh settle, swallow whatever that pass throws since it never produces a player anyway, then run the real build as a second, separate invocation. It costs a second editor startup on every build. I left a comment at the call site because a two-pass build looks exactly like a mistake to whoever reads the pipeline next, right up until they hit the timing bug it was written to avoid.`
      },
      {
        id:'build-signing-artefacts', t:'Signing, hardening and generated artefacts',
        what:`Signing runs platform by platform, Android through an external obfuscation step and a re-sign, Windows through extracting and hardening two sensitive binaries before re-merging, iOS through a standard signing and packaging toolchain. Every wrapped step checks a real exit code, and the artefacts a build produces include a generated release note carrying job, repository, branch and commit provenance since the last successful build.`,
        how:[
          `Each external tool invocation is wrapped so a non-zero exit fails the build stage instead of silently continuing.`,
          `Android obfuscation runs before the final signature, since the signature has to cover the obfuscated binary, not the one before it.`,
          `The release note is generated, not written by hand, from the job, repo, branch and the commit range since the last green build.`,
          `A resources-size list is scraped from the editor log and kept alongside the binary and the log itself, so a size regression has a paper trail.`
        ],
        why:`A signing or hardening step that appears to succeed but did not is a failure that only surfaces at store submission, far from where it actually went wrong, so checking the real exit code at each step is the cheapest place to catch it.`,
        trade:`Signing material has to exist somewhere the pipeline can reach it at build time, and where that lives is exactly the decision that goes wrong when convenience wins over a credential store.`,
        rel:[
          ['infra-secrets',`Signing keys and passwords are exactly the credentials a secrets store exists to hold instead of a repository or a build script.`]
        ],
        links:[
          ['build-cli-entry',`Signing is one more per-target branch inside the same switch that already decides the rest of the platform-specific build behaviour.`]
        ],
        story:`Live secrets were sitting in plaintext across the CI configuration, the build scripts and the client repository, a bot token, a service account key file, a signing password typed into a build script and the signing key itself. None of it was malicious, a pipeline needed each value at a path and committing it was the fastest way to get there at the time. I treated every one of those values as already compromised the moment I found them, because a pushed secret cannot be un-pushed, only rotated. The real fix was injecting each value from a credential store at build time instead of reading it from a checked-out file, and the number worth tracking afterward was how long a full rotation took, not whether the files were removed.`
      }
    ]
  },
  {
    id:'ci', t:'CI repository: pipelines, agents and self-tests', kind:'cicd',
    sum:`The pipelines that call that entry point, table-driven instead of duplicated, tested against their own configuration, and honest about which failures destroy a build and which just need a retry.`,
    stack:['Jenkins','PowerShell','Groovy'],
    parts:[
      {
        id:'ci-pipeline-table', t:'One pipeline driven by a job-name table',
        what:`A single declarative pipeline replaces eight near identical trigger jobs, with stages per target guarded by a condition on the job name, and a table keyed on job name supplying the handful of values that used to differ between the eight. A test asserts that table against the values actually configured on the CI server, ending with a case that feeds the test a deliberately corrupted table to prove the check can fail.`,
        how:[
          `Stages guard themselves with a condition reading an environment value that names the target.`,
          `A job-name-keyed map holds the small set of values that differ per job, so the difference between targets is data in one file, not eight separate job definitions.`,
          `Before deleting the old jobs, the values driving the new table were read from the live configuration of all eight and captured in the table under test.`,
          `The test's last case corrupts one field on purpose and asserts the check fails, since a test with no failing case has never been observed to work.`
        ],
        why:`Eight jobs drifting apart is a maintenance problem that scales with headcount, and collapsing them into one file readable top to bottom fixes the drift, but only if the migration is provably faithful to what was actually running.`,
        trade:`One pipeline is now a single point of failure for every target, so a change intended for one job has to be reasoned about against all of them before it merges.`,
        rel:[
          ['infra-ci-pipelines',`Collapsing near identical jobs into one table-driven pipeline is the concrete version of treating CI configuration as code with its own tests.`]
        ],
        story:`Before deleting eight jobs that had drifted apart under years of manual edits, I wrote a table meant to reproduce their live configuration and a test asserting my table matched the values actually measured off the CI server. The test passed immediately, which should have worried me more than it did, because it was passing by comparing the table to itself, not because it proved anything about the migration. I added a final case that feeds the test a deliberately corrupted table and requires the check to fail, and only once that case failed correctly did the earlier passing cases mean anything. Any test written to authorise a deletion needs a case that proves it can fail, or it has never actually been observed working.`
      },
      {
        id:'ci-agents-retries', t:'Label-driven agents, caching and retry discipline',
        what:`Agents are selected by label rather than by name, with separate handling for mac and windows shells, and long-lived named agents with persistent workspaces double as an implicit cache. Every checkout retries, CDN uploads retry with backoff, and native tool exit codes are checked explicitly through one wrapper instead of trusted from the shell.`,
        how:[
          `A label picks a machine class, keeping a pipeline portable across whichever physical agent currently holds that label.`,
          `A shallow clone with a fixed depth, sparse checkout and shallow submodules keeps checkout fast on a persistent workspace that already holds most of the history.`,
          `Checkout retries a fixed number of times, and a CDN upload wraps its own retry with backoff separately, since the two have different failure shapes.`,
          `A native command wrapper checks the real exit code, so a native tool's failure fails the stage instead of continuing on a shell that swallowed it.`,
          `Whole-pipeline timeouts differ by job kind, several hours for a player build and longer for asset bundles.`
        ],
        why:`Network flakiness during checkout and upload is common enough on a CI network to plan for by default, and an unchecked exit code from a native tool is exactly the failure that looks like success until someone tries to use the artefact.`,
        trade:`Retries hide a failure that happens often enough to need retrying, so a step that always needs its third attempt to pass is a problem wearing a workaround instead of being fixed.`,
        rel:[
          ['infra-ci-pipelines',`Label-driven agents, shallow clones and layered retries are the operational texture of a pipeline that runs for years, not the demo version of one.`]
        ]
      },
      {
        id:'ci-failure-notify', t:'Grading failures and detecting them from two signals',
        what:`Unity build failures are detected two independent ways, a curated list of fatal log patterns and the process exit code, because either signal alone had already let a broken artefact through. Failures are graded rather than treated as one outcome: a compile failure fails the stage hard since the output is worthless, while a failed symbol or store upload only marks the run unstable and keeps the artefact for a manual upload. Every pipeline notifies on an unsuccessful run, with a separate success notice for store uploads.`,
        how:[
          `A curated regex list flags known fatal log lines that the editor can emit while still exiting zero.`,
          `The process exit code is checked independently, since the editor can also exit non-zero after producing a usable build.`,
          `Only agreement between both signals, or a fatal pattern alone, is treated as ground truth, since a mismatch is the reason both exist.`,
          `A network-touching final stage like a store upload is graded unstable rather than failed, so a valid artefact from a long build is not discarded over a flaky last step.`,
          `An unsuccessful notification fires on every pipeline, plus a distinct success notice for store uploads and a chat upload of the generated release note.`
        ],
        why:`A single signal for build success had already been wrong in both directions, reporting success on a failure and failure on a success, so trusting either alone is a decision that has already cost a broken artefact once.`,
        trade:`The fatal-pattern list needs review after every engine upgrade, since it is a list of known failure text rather than a structural check, and it is silently wrong by default the moment the engine's own messages change.`,
        rel:[
          ['quality-and-build-health',`Two independent failure signals and a graded outcome are what a trustworthy pass or fail signal actually costs, instead of a single green tick that got lucky.`]
        ],
        links:[
          ['build-signing-artefacts',`A failed signing or upload step is exactly the kind of failure this grading is built to keep from discarding a good build.`]
        ],
        story:`A build had failed and the pipeline reported it as a success, and the artefact it produced could not be installed. The process exit code alone was the signal we trusted, and the editor had exited zero after a failure that mattered. I added a second, independent signal, a curated list of fatal patterns in the build log, and made the pipeline distrust an exit code that disagreed with what the log actually said happened. What that incident taught me is to verify the verifier: a signal a pipeline trusts has to be checked against a build you already know is broken, or it has never actually been observed catching anything.`
      }
    ]
  },
  {
    id:'conv', t:'Conventions and documentation', kind:'process',
    sum:`The rules and templates that keep the previous seven systems legible to the next person, written down because review memory does not scale past a few people.`,
    stack:['Markdown'],
    parts:[
      {
        id:'conv-rule-files', t:'Narrow, origin-stamped rule files that outrank memory',
        what:`Roughly twenty narrow rule files cover assembly boundaries, planning workflow, feature-context docs, a red-first reproduction rule, test integrity, comment discipline, a formatting-by-imitation rule since no linter enforces style, a merge review checklist, automated-review triage, commit hygiene and doc freshness. Each is stamped with the incident that produced it, and an explicit precedence rule states that project rules outrank accumulated session memory.`,
        how:[
          `Each rule file is narrow enough to read in under a minute and cites the incident that justified it.`,
          `A written precedence rule states project rules win over anything remembered from a longer working session, with the incident that made that necessary recorded alongside it.`,
          `Commit hygiene follows a fixed module-and-summary shape rather than a generic convention borrowed from another ecosystem.`,
          `A living per-feature overview document sits under a docs folder per feature, with numbered phase documents for design decisions, specification, code design, file structure and known issues.`
        ],
        why:`A rule remembered only in one person's head does not survive that person's absence, and a rule with its origin incident attached is easier to trust than one stated as an unexplained preference.`,
        trade:`Twenty files is enough that finding the relevant one takes a search, and a rule stated too narrowly for its origin incident can miss the next situation that is almost, but not quite, the same shape.`,
        rel:[
          ['lead-conventions',`This is exactly what a written convention looks like at the scale where review memory alone stops being enough.`]
        ]
      },
      {
        id:'conv-pr-review', t:'A bilingual PR template and a fixed review checklist',
        what:`A pull request template asks explicitly what data the reviewer needs to verify a change, whether the run produced zero warnings or errors, and whether a soft reset still runs clean. Automated review findings get a written triage step rather than being applied or dismissed on sight.`,
        how:[
          `The template's checklist items are the same for every pull request, so a reviewer is never guessing what evidence to ask for.`,
          `Soft reset verification is a named checklist item because a partial reset had been a real failure before it became a checklist item.`,
          `Automated review comments are triaged, fixed, declined with a stated reason, or escalated, rather than always applied or always ignored.`,
          `The checklist is bilingual, so it reads the same for every reviewer regardless of which language they think in day to day.`
        ],
        why:`A checklist that names the specific evidence needed catches the kind of regression a general approval reliably misses, and naming it in the template means it does not depend on the specific reviewer remembering to ask.`,
        trade:`A fixed checklist can turn into a box-ticking exercise if nobody reads why each item is there, and it needs the same origin-stamping the rule files get or it decays into ritual.`,
        rel:[
          ['lead-code-review',`A template that asks for the exact verification evidence is a code review process decision made once instead of re-litigated on every pull request.`]
        ],
        links:[
          ['conv-rule-files',`The PR template is one more rule file, just one that fires automatically on every pull request instead of waiting to be read.`]
        ]
      }
    ]
  }
]);
