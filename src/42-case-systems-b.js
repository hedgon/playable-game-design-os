/* =====================================================================
   PROJECT SYSTEMS - B: the Unity mobile client and its CI
   Case: cs-unity-mobile-client-ci (defined in 40-cases.js)

   Shape (full contract and field meanings live in 40-cases.js):

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
    iv:[
      {
        q:`The one way assembly dependency direction is enforced by review, not by a build step. What happens the first time someone gets it past review, and would you add a compile time check?`,
        a:`It has happened. A feature folder ends up referencing something one layer up because the fastest fix that day was a direct call instead of an interface, and it survives until a later reviewer notices the import list looks wrong. The rule holds mostly because it is written down and everyone defends it the same way, not because a tool stops it. I looked at a script that walks assembly definition references and fails the build on a forward reference, and the reason it never shipped is that assembly definitions already state their references explicitly, so the same information a linter would compute is visible in the inspector. The cost of building the check never beat the cost of a reviewer reading one file.`,
        follow:`If you had shipped that check, what is the first false positive you would have expected from it?`,
        red:`Saying the rule never gets violated. A convention enforced by humans gets violated sometimes, and pretending otherwise means the candidate has not actually maintained one.`
      },
      {
        q:`Walk me through what happens at boot when one registration needs a value that is not registered yet.`,
        a:`The bootstrap method registers services in a fixed order, so a later registration can always read an earlier one directly. The problem is the other direction, when an earlier registration would want something that only exists later in the same method. Instead of reordering the whole method around one dependency, that registration takes a resolver function, a small closure that looks the value up when it is actually called rather than when it is registered. It reads as a wart because it is one, and every place it appears carries a comment saying why, because the alternative was rewriting boot around one exception.`,
        follow:`Why not just move the earlier registration later instead of adding a resolver function?`,
        red:`Proposing a full dependency graph resolver as the fix. That is a real answer for a bigger project, but it replaces a five line workaround with a subsystem for a boot sequence that runs once and rarely changes.`
      },
      {
        q:`A soft reset skips one system's cleanup. What does that actually look like to a player, and how would you catch it before they do?`,
        a:`It does not throw. The system's state just carries into the next session looking like normal data, so the first symptom is usually a support report describing behaviour that only makes sense if some earlier session never really ended. That is why soft reset is its own item on the pull request checklist rather than something assumed to work because the router fires the right events. Catching it earlier means a test that runs a soft reset and asserts specific state was cleared, not just that the screen changed, because the screen changing is the part that was never actually broken.`,
        follow:`What would that assertion actually check, given the state lives across several unrelated systems?`,
        red:`Treating a soft reset as equivalent to a full app restart. The whole reason it is a distinct path is that it deliberately keeps some state alive, so the checklist item is about which state, not whether any state survives.`
      }
    ],
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
    iv:[
      {
        q:`Why four scopes, resident, current base, current overlay, next scene, instead of two, resident and everything else?`,
        a:`Two scopes would answer whether something survives a transition, but not which transition. A base scene and an overlay above it die at different moments, a modal closing should not release what the screen behind it is still showing, and content staged for the next scene has to exist before the transition that needs it happens. Four values map directly onto the scene layers the router already has, so a load site states a fact about when it stops mattering instead of a guess. Fewer scopes would have pushed that decision back into ad hoc release calls, which is exactly the pattern that was leaking memory before.`,
        follow:`Give me a concrete asset that would be scoped resident versus current overlay, and why the difference matters.`,
        red:`Saying more scopes are always better. A finer grained scope model is a bigger surface to get wrong at the call site, and four was chosen because it matched the transitions that already exist, not because more granularity is free.`
      },
      {
        q:`The pool's double release detection warns instead of throwing. Walk me through why you picked that.`,
        a:`A double release is a real bug, but it is a bug in one object's lifecycle, not proof the whole session is unsafe to continue. Throwing turns that local bug into a crashed session for the player holding the phone, which is a worse outcome than the bug itself in almost every case I saw. Warning under a debug define means the bug is loud to whoever is testing with diagnostics on, and costs nothing in a released build, since the check compiles out entirely outside that define. The trade is that a shipped build with the define off could theoretically hit the same bug silently, so the warning only protects the people actually looking.`,
        follow:`What would make you flip that to a hard throw instead?`,
        red:`Arguing every bug should throw in every build to surface it as early as possible. That is true for a build breaking bug, not for one that degrades a pool and would otherwise take the whole session down over something recoverable.`
      },
      {
        q:`Walk me through exactly when the graphics tier decision gets made and what it actually changes.`,
        a:`Tier is decided once, from a device classification read at start up, and it drives two things off the same value: which quality settings the game runs at and which resource list suffix the asset fetch uses. Because both come from one decision made at one point in time, a session never ends up running high quality settings against a low tier manifest or the other way around. The resource list itself is just a suffixed path on the same CDN location, so supporting a new tier costs a new list, not a new delivery pipeline.`,
        follow:`What happens if a device's classification would change mid session, say thermal throttling kicks in?`,
        red:`Assuming tier is re-evaluated per frame or per scene. It is a start up decision on purpose, because re-evaluating it mid session would mean re-fetching assets against a different manifest while the game is running.`
      }
    ],
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
    iv:[
      {
        q:`Why two separate network stacks, request and response over HTTP and a hand framed socket for realtime, instead of putting everything on one WebSocket?`,
        a:`They serve traffic with different shapes. Game API calls are one request, one response, need to survive being replayed by a flaky mobile connection, and benefit from every piece of HTTP infrastructure already in place, proxies, load balancers, caching headers. Chat, presence and matched sessions are long lived and server initiated, which HTTP was never built for. Forcing both onto one socket would mean either giving up the HTTP guarantees the API traffic depends on, or building request and response semantics on top of a socket for traffic that never needed them. Keeping them separate means a socket disconnect never breaks an ordinary API call, and an API outage never drops a live match.`,
        follow:`What would actually break first if you merged them onto one channel?`,
        red:`Claiming a single channel is simpler with no real cost named. Simplicity on paper here trades away the HTTP semantics the request and response side depends on, and that cost has to be named to make the trade honestly.`
      },
      {
        q:`There is no built in request and response pairing on a WebSocket. Walk me through how a reply actually finds its request.`,
        a:`Every frame carries a message id alongside its type and op code. Sending a request stores a pending entry keyed by that id before the frame goes out, and when a frame comes back with the same id, the dispatch loop resolves whichever caller is waiting on it. A timeout clears the entry if nothing ever comes back, so a caller does not wait forever on a dropped reply. It is a small table, not a protocol, and it only works because both sides agree on the id being unique for as long as the pending entry lives.`,
        follow:`What happens if two different requests are accidentally sent with the same message id?`,
        red:`Assuming the socket itself guarantees ordering or delivery. It does neither on its own, which is exactly why the correlation table and its timeout exist instead of just trusting replies to arrive in order.`
      },
      {
        q:`WebGL has no raw socket access. Walk me through the compile-time swap and what changes for that platform.`,
        a:`The relay transport sits behind one interface, and which concrete implementation satisfies it is chosen by platform define at compile time, the same pattern the platform facade uses elsewhere. On WebGL, the implementation goes through the browser's own socket support instead of a native one, but everything above that interface, framing, correlation, the relay clients on top, stays identical because it only ever talks to the interface. The gameplay and chat code that uses the relay never has a WebGL branch of its own.`,
        follow:`What is the actual behavioural difference a player on WebGL would notice, if any?`,
        red:`Saying WebGL just works the same as native with no adaptation needed. The transport swap exists specifically because it does not, and pretending otherwise skips the actual engineering decision.`
      }
    ],
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
    iv:[
      {
        q:`The platform facade fails to compile on an unsupported platform rather than falling back to a default. Why is that the right trade for something like a store identifier?`,
        a:`The store identifier is not cosmetic, it is a claim the server checks against, so a wrong guess at runtime is not a display bug, it is the client telling the server something false. A compile error catches an unsupported platform the moment someone tries to build for it, at the point where the fix is obvious, add the branch. A runtime default would ship silently and the wrong identity would only surface when a server side check rejected it, far from the code that caused it. Paying the cost at compile time is cheaper than paying it after a build reaches a store.`,
        follow:`Where else in the client did you make the same call, fail loud at compile time instead of guessing at runtime?`,
        red:`Arguing a sensible runtime default is always friendlier to developers. Friendlier to a developer building locally is not the same as safe for an identity value the server trusts, and the two get confused easily.`
      },
      {
        q:`Walk me through adding support for a new store. What actually has to change, and where?`,
        a:`The platform facade gets a new branch inside its existing conditional chain, nested the same way the alternative Android store or the disabled desktop path already are, returning the platform string and store identifier for the new case. Everything else in the codebase reads the facade's values rather than testing a define itself, so nothing outside that one file needs to know a new store exists. The actual risk is in that one file getting dense enough that adding a branch means understanding several existing ones first, since every platform's logic lives together there.`,
        follow:`At what point would you split that facade into more than one file, and what would the split be along?`,
        red:`Describing the change as touching many files across the codebase. If it does, the abstraction has already leaked, because the whole point of the facade is that only it knows about the new define.`
      },
      {
        q:`Why put a purchase bridge behind an interface shaped for the game instead of wrapping the native SDK's own API directly?`,
        a:`A native SDK's API is written for every game that might integrate it, so it carries configuration and callback shapes this game never uses. An interface declared in core states only the handful of calls the game actually makes, purchase, restore, price lookup, and the app layer implementation is the only place that has to know the SDK's real shape. That keeps an SDK migration or a version bump contained to one implementation file instead of every call site across the client.`,
        follow:`What happens when the SDK's next version changes a callback shape the interface assumed?`,
        red:`Saying the interface should just mirror the SDK one to one for completeness. That defeats the purpose, since a one to one mirror carries the SDK's whole surface into the game instead of narrowing it to what is actually used.`
      }
    ],
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
    iv:[
      {
        q:`The house rule is assert on logged values, never on the GUI. Why, and what did you see go wrong when a test read the screen instead?`,
        a:`A GUI assertion is really an assertion about layout, spacing, a font, whatever happened to be on screen, and a legitimate relayout breaks it for a reason that has nothing to do with the behaviour the test claims to check. Asserting on a value the code already logged means the test survives a visual change and only fails when the actual computed result changes. It also means a test author writes the log line as part of implementing the feature, not as an afterthought bolted onto the test.`,
        follow:`What do you do when the value you need was never logged in the first place?`,
        red:`Defending a GUI assertion as fine because relayouts do not happen often. That confidence is exactly what a relayout later punishes, and the rule exists so nobody has to guess how often is often enough.`
      },
      {
        q:`What does the on device smoke walk actually catch that a PlayMode test running in the editor would not?`,
        a:`PlayMode runs in the editor's own memory and thermal conditions, which never resemble a mid tier phone five minutes into a session. The smoke walk measures transition time, memory, CPU and frame rate on a real device after walking every non debug scene, so it catches the failure mode that only exists after sustained real use, a leak that shows up as a slow climb, a scene that is fine alone but expensive after several transitions. Numbered cases get cited directly in commits, so a fix references the exact case it addressed instead of a vague description.`,
        follow:`Random taps exercise the app during the walk. What is a real failure that found, and how would a scripted walk have missed it?`,
        red:`Claiming the smoke walk replaces PlayMode tests. It is slower and noisier by design, useful for exactly the failures a fast deterministic test cannot reach, not a substitute for one.`
      },
      {
        q:`Why gate the device farm behind its own define instead of running it as part of every normal build?`,
        a:`Every device farm type compiles only under that define specifically so a normal build has zero chance of shipping test scaffolding by accident, which matters more than convenience for the person running the farm. Running the farm itself is expensive and slow enough that it cannot ride along with every commit either, so it is triggered deliberately with scenario numbers, a device preset and a timeout, and CI compares boot time, lap time and system info across runs rather than reading through logs.`,
        follow:`Given it only runs when triggered, how long could a regression sit before the farm catches it, and is that acceptable?`,
        red:`Suggesting the farm run on every push regardless of cost. That ignores exactly the trade the gating exists to manage, cost and turnaround against how often a device only regression actually happens.`
      }
    ],
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
    iv:[
      {
        q:`Walk me through the two-pass build. Why does that workaround exist and why not fix the underlying timing bug instead?`,
        a:`The asset database did not reliably finish reacting to a bulk deletion before a build read it in the same editor session, so a build would sometimes still include a file the exclusion step had just deleted. The fix runs the entry point once with a build skip flag purely to let the deletion and its refresh settle, swallowing whatever that pass throws since it never produces a player, then runs the real build as a second, separate invocation. Fixing the underlying timing would mean patching how the asset database itself schedules its refresh, which is engine internals, not something the pipeline owns. A second isolated invocation was the workaround that was actually reliable, at the cost of a second editor startup on every build.`,
        follow:`What would you check first if you suspected this workaround itself had started masking a different bug?`,
        red:`Calling the two-pass build an obvious design flaw without asking why it exists. It reads that way until you learn about the timing bug, which is exactly why the comment at the call site exists.`
      },
      {
        q:`The exclusion XML and the CI sparse checkout excludes are two lists that have to describe the same paths. What happens when they drift?`,
        a:`A folder renamed in one list and not the other either breaks the build, because the builder expects a path that sparse checkout never brought down, or it ships something meant to stay internal, because sparse checkout brought a path down that the builder no longer excludes. Nothing today enforces that the two lists agree, so it is caught by review or by a build failure, not by a check that runs before either. The two lists exist as two systems because sparse checkout has to act before the agent even has the files, while the builder's deletion acts on what is already checked out.`,
        follow:`How would you make the two lists provably the same instead of trusting them to stay in sync?`,
        red:`Saying this has never actually caused a problem so it is not worth worrying about. Two lists with no enforced agreement is a live risk regardless of whether it has bitten yet.`
      },
      {
        q:`How do you decide what belongs in the CLI flag list versus what goes into the layered config file?`,
        a:`A flag is for something that changes per invocation, per target, per job, the build number, whether it is a development build, which XML exclusion file applies. Config layering, default then region and environment then a free text override, is for values that are mostly stable per environment but occasionally need a one off exception without a new committed file. The dividing line is whether a human is likely to type it fresh for this specific run or whether it describes a place the build is going, and getting that wrong in either direction either bloats the flag list past what a manual invocation can hold in their head or forces a config file edit for a genuinely one off run.`,
        follow:`Give me an example of a value you moved from one side to the other, and what made you move it.`,
        red:`Treating flags and config as interchangeable with no principle for which goes where. That is exactly how a flag list grows past what anyone can invoke by hand.`
      }
    ],
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
    iv:[
      {
        q:`Walk me through the negative control in the job table test. Why did the test need a case that proves it can fail?`,
        a:`The test asserted my table matched the values measured off the live CI server, and it passed immediately, which should have worried me more than it did, because at that point it was only comparing the table to itself. It had never been observed failing, so it had not actually proven the migration was faithful, only that I had not made an obvious typo. I added a final case that corrupts one field on purpose and requires the check to fail, and only once that case failed correctly did the earlier passing cases mean the table really matched the eight jobs I was about to delete.`,
        follow:`What is a plausible way that test could still pass while the migration was wrong?`,
        red:`Treating a passing migration test as sufficient proof with no negative control mentioned. A test that has never been shown capable of failing has not actually tested anything yet.`
      },
      {
        q:`Why detect a Unity build failure two ways, a log pattern list and the exit code, instead of trusting one signal?`,
        a:`Both had already been wrong on their own. The editor can emit a fatal error and still exit zero, and it can also exit non zero after producing something usable, so either signal alone had already let a broken artefact through at some point. Requiring agreement, or a fatal pattern on its own, treats a mismatch as exactly the situation both signals exist to catch, instead of picking one and hoping it stays reliable.`,
        follow:`The pattern list needs review after every engine upgrade. How would you know it had gone stale before it let something through?`,
        red:`Saying the exit code alone is good enough because it is usually right. Usually right is exactly the failure mode that let a broken build through the first time, which is why a second signal exists at all.`
      },
      {
        q:`What is the actual risk of collapsing eight near identical jobs into one pipeline, and how did you mitigate it?`,
        a:`One pipeline is a single point of failure for every target it now serves, so a change intended for one job has to be reasoned about against all of them before it merges, which was not true when each job was its own file. The mitigation was sequencing the migration itself: read the live configuration of all eight jobs into a table, prove that table matches with a test that includes a negative control, then move targets one at a time, keeping the old job alive until its replacement produced a green artefact. Collapsing the jobs did not remove the risk, it just made the risk visible in one place instead of eight.`,
        follow:`How would you structure a change today that only needs to affect one target, given the collapsed pipeline?`,
        red:`Presenting the collapse as risk free because it reduced duplication. Reducing duplication and concentrating blast radius are the same move, and only one of those gets mentioned if the answer stops at less duplication.`
      }
    ],
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
    iv:[
      {
        q:`Why do the rule files have to state explicitly that project rules outrank accumulated session memory? What made that necessary instead of assumed?`,
        a:`Without it, the default is a person or an agent falling back on whatever pattern feels most familiar from other projects or from an earlier point in the same working session, which quietly overrides a decision the team already made and wrote down for a reason. Stating precedence explicitly, with the incident that made it necessary recorded next to it, means the fallback is not needed because the rule is genuinely easy to find and easy to trust as current. It is a small sentence that exists because relying on memory to defer to documentation had already failed at least once.`,
        follow:`Tell me about a time you saw memory win over a written rule, and what happened.`,
        red:`Treating this as obvious and not worth writing down. It is obvious in hindsight, which is exactly the kind of rule that gets skipped until the incident that forces someone to write it.`
      },
      {
        q:`Twenty rule files is a lot to keep alive. How do you stop them decaying into ritual nobody actually reads?`,
        a:`Each one is narrow enough to read in under a minute and carries the incident that justified it, so reading a rule also tells you why it exists, not just what to do. That does not fully solve staleness on its own, a rule stated too narrowly for its origin incident can miss a situation that is almost but not quite the same shape, and nobody was formally assigned to prune them. What kept them alive in practice was that they sat next to the code they governed, so they were in the way of the next change rather than in a folder nobody opened.`,
        follow:`What would an actual pruning process for these files look like, if you built one?`,
        red:`Claiming the files maintain themselves once written. Every one of them needs someone to notice when the practice it describes has moved on, and that upkeep does not happen automatically.`
      },
      {
        q:`What does the PR template's fixed checklist protect against that a general approval from a reviewer would not catch?`,
        a:`A general approval depends entirely on what the specific reviewer happens to remember to ask that day, and soft reset verification is the clearest example of an item that used to fail exactly that way, a reviewer approving a change because everything they thought to check looked fine. Naming the evidence explicitly, does this run clean with zero warnings, does a soft reset still work, means the checklist does not depend on any one reviewer's memory, and a new reviewer asks for the same evidence a senior one would.`,
        follow:`What is a category of regression this checklist still would not catch, because nobody put it on the list?`,
        red:`Saying a good enough reviewer makes the checklist unnecessary. The whole point is that the checklist does not depend on how good today's reviewer happens to be.`
      }
    ],
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

/* ---------------------------------------------------------------------
   WORKFLOWS for this project (shape and rules in 40-cases.js).
   3 flows: boot to the first playable scene, a player build from job
   parameters to a device-tested artefact, and a pull request from branch
   to a merged, smoke-tested main. Steps stay reachable from steps[0] and
   the edges form a DAG, branches allowed where the project actually has
   a pass/fail or approve/request-changes fork.
   --------------------------------------------------------------------- */
FLOWS('cs-unity-mobile-client-ci', [
  {
    id:'boot',
    t:'Boot and first scene',
    sum:`A cold process turning into a playable scene. Nothing here reads as exciting on its own, but the order is the whole point: each step exists to make the next one safe to run.`,
    steps:[
      { id:'boot-scene', t:'Boot scene loads', sys:'arch',
        d:`The boot scene is the entry point, the leanest assembly in the stack, holding no gameplay code of its own.` },
      { id:'serializer-init', t:'Serializer set up', sys:'arch',
        d:`Boot's own startup step initializes the serializer resolver and shows a caution graphic held for a minimum display floor.` },
      { id:'bootstrap', t:'Async bootstrap runs', sys:'arch',
        d:`One long async method registers services in a fixed order, so what exists at each point in boot is a fact readable top to bottom.` },
      { id:'di-chain', t:'DI chain resolves', sys:'arch',
        d:`Each registration either reads a value already resolved or takes a resolver function when the value is not ready yet, so ordering stays visible in the method itself.` },
      { id:'manager-scene', t:'Manager scene loads', sys:'arch',
        d:`An additive persistent manager scene loads on top of boot, carrying the systems every later scene depends on.` },
      { id:'resource-list', t:'Resource list fetched', sys:'assets',
        d:`A per platform resource list resolves against the device's graphics tier, so a low end device fetches a smaller manifest from the same CDN path.` },
      { id:'scopes-resolved', t:'Addressables scopes resolved', sys:'assets',
        d:`The four value scope wrapper primes resident content and stages next scene, ready for the first transition to promote it.` },
      { id:'first-transition', t:'First transition fires', sys:'arch',
        d:`The router promotes next scene into current base, the boot scene unloads itself, and the player reaches the first real screen.` }
    ],
    edges:[
      ['boot-scene','serializer-init'],
      ['serializer-init','bootstrap'],
      ['bootstrap','di-chain'],
      ['di-chain','manager-scene'],
      ['manager-scene','resource-list'],
      ['resource-list','scopes-resolved'],
      ['scopes-resolved','first-transition']
    ]
  },
  {
    id:'player-build',
    t:'Player build',
    sum:`One CLI invocation turning a checked-out repository into a signed, provenance-stamped artefact ready for a device farm, with the pipeline grading a hardening failure hard while everything downstream stays retryable.`,
    steps:[
      { id:'job-params', t:'Job parameters read', sys:'build',
        d:`The CLI entry point reads product name, bundle id, environment, region and every other flag the job passed in.` },
      { id:'sparse-checkout', t:'Sparse checkout excludes', sys:'ci',
        d:`CI reads the same exclusion lists the build XML declares and checks the repository out with the excluded paths never touching the agent's disk.` },
      { id:'two-pass', t:'Two-pass build settles', sys:'build',
        d:`A skip pass lets the exclusion deletions and their asset database refresh settle, then the real build runs against a stable database.` },
      { id:'harden', t:'Obfuscate and re-sign', sys:'build',
        d:`Android runs an external obfuscation step and a re-sign, Windows hardens two extracted binaries, and each wrapped step checks its real exit code.` },
      { id:'build-fails', t:'Build fails hard', sys:'ci',
        d:`A non-zero exit from the hardening step fails the stage outright, because a mis-signed artefact is worthless to upload anywhere.` },
      { id:'artefacts', t:'Artefacts and release note', sys:'build',
        d:`A generated release note carries job, repo, branch and commit provenance since the last successful build, alongside the binary and its log.` },
      { id:'upload-lane', t:'Upload lane runs', sys:'ci',
        d:`A graded upload step marks a network failure unstable rather than failed, so a valid artefact is never discarded over a flaky last step.` },
      { id:'device-tests', t:'Downstream device tests', sys:'testing',
        d:`A downstream job triggers the device farm with scenario numbers, a device preset and a timeout against the freshly built artefact.` }
    ],
    edges:[
      ['job-params','sparse-checkout'],
      ['sparse-checkout','two-pass'],
      ['two-pass','harden'],
      ['harden','build-fails','fails'],
      ['harden','artefacts','signed'],
      ['artefacts','upload-lane'],
      ['upload-lane','device-tests']
    ]
  },
  {
    id:'pull-request',
    t:'A pull request',
    sum:`How one change actually reaches main. The checklist and the two CI gates exist because a general approval had already let a partial soft reset and an under-tested change through before.`,
    steps:[
      { id:'branch', t:'Feature branch cut', sys:'conv',
        d:`Work starts on a branch named for the change, following the same commit hygiene the rule files already state.` },
      { id:'pr-template', t:'PR template filled', sys:'conv',
        d:`The bilingual template asks what data the reviewer needs to verify the change and whether the run produced zero warnings or errors.` },
      { id:'review', t:'Review checklist run', sys:'conv',
        d:`A reviewer works the fixed checklist, including the soft reset item added after a partial reset once slipped through.` },
      { id:'changes-requested', t:'Changes requested', sys:'conv',
        d:`A checklist item that fails sends the branch back with a specific reason instead of a general request for more polish.` },
      { id:'ci-checks', t:'CI lint and EditMode', sys:'ci',
        d:`An approved pull request runs lint and EditMode tests, fast enough to give feedback inside the same review cycle.` },
      { id:'merge', t:'Merge to main', sys:'ci',
        d:`The branch merges once its checks are green and its checklist items are all satisfied, not before either one.` },
      { id:'smoke-report', t:'Nightly smoke walk report', sys:'testing',
        d:`A scheduled run walks every non-debug scene on a real device and posts transition time, memory and frame rate against the newly merged main.` }
    ],
    edges:[
      ['branch','pr-template'],
      ['pr-template','review'],
      ['review','changes-requested','changes'],
      ['review','ci-checks','approved'],
      ['ci-checks','merge'],
      ['merge','smoke-report']
    ]
  }
]);

/* ---------------------------------------------------------------------
   PROJECT INTERVIEW for this project (shape and rules in
   40-cases.js). 11 questions total: 3 junior, 4 mid, 4 senior.
   Outlines stay consistent with the systems and stories already written
   above and in 40-cases.js.
   --------------------------------------------------------------------- */
PROJECT_INTERVIEW('cs-unity-mobile-client-ci', {
  junior:[
    {
      q:`Walk me through the architecture of this client at a high level.`,
      a:`It is one Unity codebase producing a mobile client, a desktop build, a WebGL build and a headless server process from the same source, with content excluded per target. Assemblies are layered in one direction, entry point down to app, game, shared and core, and a feature only ever imports something below it. Boot is one explicit sequence, boot scene, an async bootstrap that registers services in order, a persistent manager scene, then the first transition into the game. Dependency injection is a typed static service locator rather than a container, and assets go through Addressables behind a four value scope wrapper tied to scene transitions.`,
      follow:`Which of those pieces would you point to as the one decision that shaped everything else?`,
      red:`Describing only the feature they personally worked on with no picture of how it fits the rest of the client. A CV level architecture answer has to place the work inside the whole system, not just describe one corner of it.`
    },
    {
      q:`What did you personally own on this project?`,
      a:`I started on client systems, screens and feature work inside the layered assemblies, and moved into owning the build and pipeline side, which is where most of the interesting failures actually lived. That meant the CLI-parameterised build entry point, the content exclusion lists and their CI mirror, the two-pass build workaround, signing and hardening per platform, and the CI repository itself, the table-driven pipeline that replaced eight near identical jobs and the failure detection and grading around it.`,
      follow:`Of everything on that list, what is the piece you would want to be quizzed on in more depth?`,
      red:`A vague answer like "I worked on the client" with no specific system named. Ownership on a CV should map to something a follow-up question can actually probe.`
    },
    {
      q:`How is testing structured on a project like this, and where does your work show up in it?`,
      a:`There are three tiers. Editor-only test assemblies gated by a test define hold EditMode tests for pure logic and PlayMode tests for anything needing a frame or a GameObject, both asserting on logged values rather than reading the GUI. Above that sits an on-device smoke walk that tours every non-debug scene, taps randomly, and measures transition time, memory and frame rate on real hardware, with numbered cases cited in commits. A separate device farm harness runs actual game loop scenarios across many devices, gated behind its own compile define so it never reaches a normal build.`,
      follow:`Why does the smoke walk need to run on a real device instead of just in the editor with a simulated frame budget?`,
      red:`Only mentioning unit tests and nothing about device-level verification. On a mobile client, most of the interesting failures only show up on hardware.`
    }
  ],
  mid:[
    {
      q:`What is the hardest bug you debugged on this project?`,
      a:`Memory climbed steadily across sessions that moved through several screens, and it only reproduced on real devices after a long run, which made the normal profiler loop too slow to iterate on. I tied every asset handle to the scope enum built from the scene transition events we already had, so a transition promotes the next scope and releases the one before it, then added release diagnostics and a warning level double release check under a debug define instead of a throw, since ending the session over a pooling bug was worse than logging it. The climb flattened and stayed flat, and the scope is now the thing reviewers ask about whenever a new load call appears.`,
      follow:`Why did the profiler loop being too slow matter so much here, and what would have made it faster?`,
      red:`Jumping straight to "we added logging" with no account of how the leak was actually isolated to scope, or no mention of why a throw was the wrong choice for the double release check.`
    },
    {
      q:`Walk me through a build or release incident you were close to, and what changed afterward.`,
      a:`A store upload failing at the end of a two hour build used to discard the whole run and force a restart from checkout, so any last stage network flake cost the entire build. I graded failures instead of treating them as one outcome, a compile failure still fails the stage hard because the output is worthless, but a failed symbol or store upload marks the run unstable and keeps the artefact for a manual upload. I also wrapped every network touching step in retry with backoff and moved parameter validation into a cheap early stage, so an invalid upload target fails in a minute instead of after two hours.`,
      follow:`How did you decide which failures deserved a hard stop versus which deserved the unstable grading?`,
      red:`Treating "add retries everywhere" as the whole fix. Retrying blindly would have hidden the cases that genuinely needed to fail hard, like a compile failure.`
    },
    {
      q:`How did the review process actually work day to day, and what did the checklist catch that a general approval would not?`,
      a:`Every pull request went through a bilingual template with a fixed checklist, what data the reviewer needs to verify the change, whether the run produced zero warnings or errors, and whether a soft reset still runs clean. Soft reset was on there specifically because a partial reset had already been a real failure before it became a checklist item, and a reviewer who was not specifically prompted to check it would approve on the strength of everything else looking fine. Automated review findings went through a written triage, fix, decline with a reason, or escalate, rather than being auto-applied or ignored.`,
      follow:`Tell me about a time the checklist caught something a plain "looks good to me" would have missed.`,
      red:`Describing review as purely a human judgment call with no mention of what the template forced reviewers to check regardless of who they were.`
    },
    {
      q:`Explain the scope design behind the Addressables wrapper. Why four values?`,
      a:`Resident, current base scene, current overlay and next scene map onto the scene layers the router already has, so a load site states when it stops mattering instead of someone guessing. A transition promotes next scene into current base and releases whatever the old current base and overlay held, tying release to an event that already fires instead of a call somebody has to remember. Fewer scopes would have collapsed distinctions that actually matter, a modal closing should not release what the screen behind it is still showing, and more would have added granularity nobody asked for.`,
      follow:`Give a concrete example of something that would be scoped wrong and what symptom that produces.`,
      red:`Describing the scope system as "just tagging assets" with no explanation of why the specific four values were chosen over some other number.`
    }
  ],
  senior:[
    {
      q:`What decision on this project would you reverse if you could go back?`,
      a:`I would have written the job-name table and its negative-control test the moment a fifth near-identical CI job appeared, instead of waiting until there were eight and the drift between them was already expensive to reconstruct. By the time I did the migration, reconstructing the live configuration of all eight jobs into one trustworthy table was itself a project, and a test that could prove it wrong was what made deleting the old jobs safe. Catching the pattern at job four or five would have made the whole thing a small refactor instead of a migration with real risk attached.`,
      follow:`What signal would have told you, in the moment, that job three or four was already the start of a pattern worth stopping?`,
      red:`Naming a decision that had no real cost, or answering with a generic "communicate more" instead of a specific engineering call that was made too late.`
    },
    {
      q:`Tell me about a time you had to hold a technical line against pressure from the team or a deadline.`,
      a:`A teammate asked to let a lower layer reference the screen layer so a feature could ship on time, one day before a milestone. The one-way assembly direction was the architectural rule we actually enforced, and saying yes once would have ended it as a rule rather than a preference. I said no to the inversion and spent the next hour on the alternative instead of the argument, declaring the dependency as an interface in the lower layer, implemented in the screen layer and injected at boot, which turned out to be about the same amount of code and shipped on the same milestone. I wrote the reasoning into the rule file afterward as a worked example.`,
      follow:`What would you have done if the interface-based alternative had actually cost significantly more time than the inversion?`,
      red:`Framing this as pure stubbornness, "I just said no." The part that actually mattered was supplying a working alternative within the hour, not the refusal itself.`
    },
    {
      q:`Describe a build or CI incident where the system reported success incorrectly, and what you changed structurally.`,
      a:`A build had failed and the pipeline reported success anyway, and the artefact it produced could not be installed, because the process exit code was the only signal trusted and the editor had exited zero after a failure that mattered. I added a second, independent signal, a curated list of fatal log patterns, and made the pipeline distrust an exit code that disagreed with what the log actually said happened. The structural change was treating agreement between two signals as the only real pass, not picking whichever single signal seemed more reliable, because both signals had already been wrong once on their own.`,
      follow:`How do you keep the fatal-pattern list from silently going stale after an engine upgrade changes its own message text?`,
      red:`Presenting the fix as "we added more logging." The actual fix was changing what the pipeline trusted as a pass signal, not just producing more information for a human to read.`
    },
    {
      q:`How did you approach owning conventions and rule files for a team, rather than just writing code?`,
      a:`I treated a rule remembered only in one person's head as a rule that does not survive that person leaving the room, so decisions like the assembly direction, the exclusion list mirroring, and the PR checklist items all got written into narrow files stamped with the incident that justified them. An explicit precedence rule said project rules outrank whatever anyone remembers from a previous session, because relying on memory to defer to documentation had already failed once. The trade is real, twenty-odd files take a search to navigate, and a rule stated too narrowly for its origin can miss the next situation that is almost but not quite the same shape.`,
      follow:`How do you know when a rule file has gone stale, versus just narrow?`,
      red:`Treating documentation as a one-time writing exercise. The senior part of this is the precedence rule and the incident-stamping, not just that documents existed.`
    }
  ]
});
