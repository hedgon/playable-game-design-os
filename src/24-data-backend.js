/* =====================================================================
   BACKEND (Go-first)
   The server side of a live game seen as a design surface: how the code is
   layered, how requests are shaped, how state is stored and cached, and how
   the whole thing is kept observable and testable. Same 8-part topic
   structure as every other domain, plus eng (how the client consumes this)
   and iv (interview questions).

   Topic inventory for this file (ids fixed, write them with T(...) below,
   then ENGINE(...) and INTERVIEW(...) for each at the end of the file):
     backend-layering          Clean layering and dependency direction
     backend-di-modes          Compile-time DI and one binary, many modes
     backend-api-protocol      API protocol choices: REST/JSON, protobuf over HTTP, gRPC
     backend-request-context   Request context, middleware and idempotency gates
     backend-errors            Domain error taxonomy and wrapping
     backend-data-access       Transactions, SQL builders vs ORMs, delta state sync
     backend-caching-redis     Caching tiers and Redis patterns
     backend-migrations-config Schema migrations, configuration and secrets
     backend-observability     Logging, tracing, profiling, action logs
     backend-testing           Testing tiers and test-integrity rules
     backend-go-idioms         Go concurrency, lifecycle, generics, module hygiene
   ===================================================================== */

DOMAINS.push({ id:'backend', t:'Backend', short:'Layering, APIs, data access, caching, observability, testing', color:'var(--d-backend)',
  sum:`The service behind a live game. Backend work is design work: the layering decides what can be changed safely, the protocol decides what the client can ask for, and the data access decides what the game is allowed to be true about. Most live-game failures are not algorithmic. They are a boundary nobody defended.`,
  links:[['server','The game server is a backend with a tick. Everything here is the part that does not simulate.'],['product','Session length, monetization and platform decide the shape of the API and the cost of the data model.'],['production','Backend risk is schedule risk. The riskiest query and the riskiest migration belong in the first milestone.'],['studio','Conventions, code review and written decisions are what keep a service readable after the third person joins.'],['systems','Economy and progression rules eventually live on a server, because anything the client owns can be edited.']],
  titles:{ test:'What should I test or measure?' } });

/* ---------------- BACKEND ---------------- */
T('backend-layering',{ d:'backend', t:'Clean layering and dependency direction', tag:'Dependencies point inward. The code that knows the game rules must not know which database or which transport delivered them.',
  what:`A layout where the service is cut into rings: entities and rules at the centre, use cases around them, adapters (HTTP handlers, repositories, cache clients) on the outside, and one wiring package that knows both sides. Imports only ever point inward. In Go the enforcement is real: the use case package declares the interface for what it needs, the adapter package implements it, and nothing in the centre imports a driver.`,
  why:[`The centre is where the game rules live. If it imports a SQL driver you cannot test a drop table, a price or a cooldown without a database, and every rule test becomes an integration test.`,
    `Adapters are the part that gets replaced. Storage moves, the transport changes from JSON to protobuf, a cache appears in front of a hot table. A boundary makes each of those a one package change.`,
    `Ports written by the consumer stay small. An interface declared next to the interactor has the three methods that interactor needs, not the forty a generated repository happens to expose.`,
    `Direction is checkable. An import graph, a depguard rule in golangci-lint and a build that fails on a backward import turn an architecture diagram into something CI enforces.`],
  think:{ q:[`Which packages would change if we swapped the storage engine, and is that one package or thirty?`,
      `Who owns each interface: the code that needs it, or the code that implements it?`,
      `Can I run a rule test with no database, no cache and no network? If not, the rule is not in the centre.`,
      `Is this layer real, or is it a folder that passes arguments through untouched?`,
      `What does the wiring package know that no other package is allowed to know?`],
    trade:[`Strict layering costs an interface and a mapping per boundary. On a service with four tables that is ceremony. On a live game with seven schemas it is what keeps the test suite runnable.`,
      `A pass-through layer looks tidy and buys nothing. Deleting it early is cheap. Deleting it in year three is a large diff nobody wants to review.`],
    traps:[`Declaring the interface next to the implementation. The consumer then imports the adapter package and the direction is already broken.`,
      `Letting the database row struct be the domain entity, so every schema change reaches the rules.`,
      `A service layer that forwards to one use case with an identical signature.`,
      `Handlers that build SQL because it was faster this once. It is never once.`,
      `Treating generated code as exempt. Generated adapters still belong on the outside.`],
    good:[`A new endpoint touches one handler, one use case and one repository, and the reviewer can name all three before opening the diff.`,
      `Rule tests run in a second with no containers started.`],
    bad:[`Adding a column requires editing the HTTP layer.`,
      `Nobody can say where a rule lives, so it gets implemented a second time somewhere else.`] },
  how:[`Draw the rings once: entities, use cases, adapters, wiring. Write down which ring may import which, then encode it as a depguard section in golangci-lint so the rule is enforced rather than remembered.`,
    `Declare ports in the use case package, one interface per need. Something like type PlayerRepo interface { Find(ctx context.Context, id int64) (*Player, error) } sitting beside the interactor that calls it.`,
    `Implement the port in an adapter package and bind it in exactly one place: a wire provider set, or a constructor in main.`,
    `Keep entities free of tags and drivers. If the entity wants db or json tags, add a separate row struct and a mapping function.`,
    `Give each ring its own error vocabulary and translate at the boundary. The interactor returns a domain error, the handler turns it into a status code and a wire payload.`,
    `Split by feature inside a ring, not by technical noun. A usecase/quest and a usecase/shop package beat one usecase/services package.`,
    `Read the import graph on a schedule. go list -deps or a graph tool shows the first backward edge long before there are fifty.`],
  ai:{ yes:[`Given a package listing and an import graph, find edges pointing outward and rank them by how much code would have to move.`,
      `Draft the port interface for a described use case, minimal method set, with a note on what each method must not do.`,
      `Generate the mapping functions between a row struct and a domain entity, which is exactly the tedious half.`,
      `Review a diff for layer violations: a handler importing a driver, an entity carrying db tags, an interactor importing generated protobuf.`],
    no:[`Decide where the ring boundaries go. That is shaped by your team size and deploy model, neither of which the model can see.`,
      `Judge whether a layer is earning its keep. Only you know how often it actually changed.`,
      `Describe what your code does from memory. Hand it the import graph or it will describe a textbook.`] },
  prompts:[{l:'Import direction audit',p:`Here is go list -deps output for our service plus a one line description of each package: [PASTE]. Our intended layering is entities then use cases then adapters then wiring, with imports pointing inward only. List every import that points the wrong way, grouped by the ring that leaks. For each, state the smallest change that fixes it and what that change would break. Do not propose a rewrite.`},
    {l:'Port extraction',p:`This interactor calls a repository directly: [PASTE CODE]. Extract the smallest interface the interactor actually needs, written from the caller's point of view, and show the constructor change. List every method you dropped and say why this interactor does not need it.`}],
  verify:[`Did the answer name your packages, or a generic diagram? Every package it mentions should appear in your repository.`,
    `Are the extracted interfaces minimal, or the same forty methods with a new name?`,
    `Does the proposed fix move code inward, or does it move a rule outward into a handler?`],
  test:[`Time a full run of the use case test package with no containers running. If it cannot start, something in the centre needs infrastructure.`,
    `Count packages touched by the last ten feature commits. Healthy layering shows a small stable number.`,
    `Add a deliberate backward import on a scratch branch and confirm CI fails. An unenforced rule decays quietly.`],
  rel:[['systemic-design','Layers are a system with rules about what may touch what, and they decay the same way game systems do.'],
    ['design-documents','The ring diagram plus the import rules is the one document a new engineer actually needs.'],
    ['backend-di-modes','Wiring is the single place allowed to know both the port and the adapter.'],
    ['backend-data-access','The repository port is where layering meets the database.'],
    ['lead-conventions','A layering rule only survives if it is written down and checked by a tool.']],
  tech:[
    {n:'Clean / hexagonal layering', how:`Entities at the centre, interactors around them, ports declared by the consumer, adapters injected from outside.`, fit:`Long lived services with several storage backends and a test suite that must run without them.`, cost:`An interface and a mapping per boundary. Slow to start, and the ceremony can be mistaken for the point.`, alt:`Transaction script now, with the rings added when a rule appears twice.`},
    {n:'Transaction script', how:`One function per endpoint doing validation, query and response inline.`, fit:`Admin tools, internal services, anything under a dozen endpoints.`, cost:`Rules duplicate across scripts and no rule is testable without a database.`, alt:`Extract a use case package the moment a rule exists in two scripts.`},
    {n:'Vertical slices (package per feature)', how:`Each feature owns its handler, interactor and repository in one package, with a small shared kernel for cross cutting types.`, fit:`Teams where one person owns a feature end to end and merge conflicts are the daily pain.`, cost:`Cross feature reuse is awkward and shared logic drifts into copies.`, alt:`Slices inside rings: keep the direction rule, split each ring by feature.`},
    {n:'Modular monolith vs separate services', how:`One binary with enforced module boundaries, or several deployables with network boundaries between them.`, fit:`Split when teams need independent deploy cadence, not when the diagram looks crowded.`, cost:`Every split turns a compile error into a runtime error and a function call into a retry policy.`, alt:`Enforce module boundaries first. If that is not painful, splitting will not help.`}] });

T('backend-di-modes',{ d:'backend', t:'Compile-time DI and one binary, many modes', tag:'Assemble the object graph at build time, and let one binary boot as any of its process roles.',
  what:`Two decisions that travel together. How dependencies get assembled: google/wire generates the constructor graph at build time, so a missing binding is a compile error instead of a nil pointer during an event. And how one codebase serves several process roles: main reads a mode flag and calls a different injector per role, so the API server, the admin tool, the realtime server and twenty batch binaries share entities and interactors while each builds only the graph it needs.`,
  why:[`A runtime reflection container fails when the request arrives. A generated graph fails when you build, which is the only place failure is free.`,
    `Roles have different dependencies. A nightly aggregation job should not open a WebSocket hub and a session cache just because they live in the same repository.`,
    `One module means one set of entities. Split the batch jobs into their own repository and the next schema change teaches you what drift costs.`,
    `The injector list is an honest inventory of the service. Twenty injectors is twenty things that can be deployed, scheduled, monitored and broken separately.`],
  think:{ q:[`If a binding is missing, do I find out at build, at boot, or at the first request that needs it?`,
      `Which roles genuinely need a different graph, and which are the same graph with a different entry point?`,
      `What does this binary open at startup that this role never uses?`,
      `Can someone add a dependency without reading the generated file?`,
      `Is the mode flag selecting a process role, or has it quietly become a feature flag inside request handling?`],
    trade:[`Codegen DI costs a generate step and a large generated file in review. Manual wiring costs one long function that everybody edits at once.`,
      `One binary many modes keeps code shared and makes every image carry every role. Separate binaries per role are lean and drift apart.`],
    traps:[`Editing the generated wiring file by hand. The next generate reverts it and the reason is lost.`,
      `Providers that do work in the constructor, so building the graph opens connections and a use case test boots the world.`,
      `Reaching dependencies through package level variables, which is a container nobody declared.`,
      `One giant provider set, so every role builds every dependency anyway and the split is cosmetic.`,
      `Adding a mode for something that is a flag on an existing mode.`],
    good:[`Adding a repository is one line in a provider set plus a regenerate.`,
      `Each role's startup log lists only the connections that role uses.`],
    bad:[`A nil dependency panic in production that a build step could have caught.`,
      `The generated file has been hand edited, so regeneration has become something nobody dares run.`] },
  how:[`Declare provider sets by concern: infrastructure, controllers, one gateway set per domain. Keep them small enough that a role can pick a subset.`,
    `Put wire declarations behind a build tag (//go:build wireinject) so the declaration file and the generated graph never compile together.`,
    `Use wire.Bind to map each interface to its implementation once, in the wiring layer, and nowhere else.`,
    `Give main a mode flag and one injector per role, InitializeAPI, InitializeRealtime, InitializeBatchX, each returning the server plus a cleanup func.`,
    `Keep constructors cheap and free of side effects. Open connections in a Start step that the injector hands back, not inside a provider.`,
    `Return a cleanup func from every resource provider and defer them in main so cancel, Close and pool release happen in reverse order.`,
    `Regenerate in CI and fail the build if the generated file differs from the committed one. That is how a hand edit gets caught.`,
    `Give every batch binary a header comment stating its schedule and whether it is cron driven or manual recovery only. The binary list is operational documentation.`],
  ai:{ yes:[`Draft provider sets from a list of constructors grouped by concern, flagging constructors that do work instead of constructing.`,
      `Explain a wire error message, which is famously terse, and name the missing or ambiguous binding.`,
      `Diff what two injectors build and list the dependencies only one of them needs.`,
      `Generate shutdown ordering and cleanup boilerplate for a set of resources.`],
    no:[`Decide which process roles exist. That is a deploy and on-call decision.`,
      `Hand edit generated output to make an error disappear.`,
      `Choose between codegen and manual wiring without knowing how many roles you run and how many people edit main.`] },
  prompts:[{l:'Provider set design',p:`Here are the constructors in our service with parameters and return types: [PASTE]. Group them into google/wire provider sets by concern, then show which sets each of these roles needs: [ROLES]. Flag every constructor that opens a connection, reads a file or starts a goroutine, and say why that work belongs in a start step instead.`},
    {l:'Wire error triage',p:`This is our wire error plus the relevant provider sets and interfaces: [PASTE]. Explain in plain language which binding is missing or ambiguous, give the smallest change that fixes it, and say whether the fix belongs in the provider set or in the interface declaration.`}],
  verify:[`Does the suggested change touch the declaration file rather than the generated one? Only the declaration is editable.`,
    `Did it actually move work out of constructors, or only rename things?`,
    `Does each role's set still exclude what that role does not use, or did the answer collapse everything into one set?`],
  test:[`Run the generator in CI and diff against the committed file. A difference is a failed build, not a warning.`,
    `Boot every role in a test and assert it starts and shuts down cleanly. It is the cheapest proof the graph is real.`,
    `Measure what each role opens at startup, connections and goroutines, and compare that to what the role needs.`],
  rel:[['backend-layering','Wiring is the one package allowed to know both the port and the adapter.'],
    ['planning-and-milestones','Each process role is a deployable unit, so the injector list and the milestone plan describe the same things.'],
    ['backend-observability','Startup logging is where you discover what the graph actually built.'],
    ['infra-deploy-models','A mode flag only pays off if the deploy model can run the modes separately.'],
    ['backend-testing','A graph you can build inside a test is a graph you can test against real infrastructure.']],
  tech:[
    {n:'Compile-time DI codegen (google/wire)', how:`Declare provider sets, run a generator, get a plain constructor function with no reflection at runtime.`, fit:`Large graphs with many roles, where a missing binding must be a build failure.`, cost:`A generate step, a large generated file in review, and terse errors.`, alt:`Manual wiring while the graph is small.`},
    {n:'Runtime reflection container', how:`Register types in a container and resolve them by type at runtime.`, fit:`Prototypes and plugin style systems where the graph is not known at build time.`, cost:`Errors surface at boot or first use, and the graph is invisible to the compiler and to grep.`, alt:`Codegen for anything that stays in production.`},
    {n:'Manual constructor wiring', how:`One function calls every constructor in order and returns the server.`, fit:`Roughly thirty dependencies or fewer, with one or two roles.`, cost:`Merge conflicts in a single file, and ordering maintained by hand.`, alt:`Split per role first, reach for a generator when the split stops helping.`},
    {n:'Service locator or package globals', how:`A global registry any package can ask for a dependency.`, fit:`Almost nothing. It arrives as an accident, not a decision.`, cost:`Hidden dependencies, untestable packages, initialization order bugs.`, alt:`Pass dependencies explicitly. If the signature is too long, the type is doing too much.`}] });

T('backend-api-protocol',{ d:'backend', t:'API protocol choices', tag:'REST/JSON, protobuf over HTTP and gRPC are three different bets about schema, tooling and who your client is.',
  what:`The wire contract between the game client and the service: transport, encoding, the schema source of truth and the versioning rule. A common middle point for mobile games is protobuf messages carried over plain net/http, which keeps ordinary HTTP infrastructure (load balancers, proxies, WAFs, CDN edges) while giving both sides generated typed models and a compact payload. gRPC goes further and brings its own connection model. REST with JSON is the most inspectable and the least typed.`,
  why:[`The encoding sets the payload budget. With a large player state on a mobile connection, a protobuf response can be a third of the JSON, which is the difference between a fast reconnect and a visible stall.`,
    `A schema both sides generate from is a schema they cannot disagree about. Hand written client models drift the day someone renames a field.`,
    `The transport decides your infrastructure. Plain HTTP works with every proxy and every mobile SDK. gRPC wants HTTP/2 end to end and real support in the client engine.`,
    `Versioning policy is a product decision in disguise. A force update is cheap for the server and expensive for the player.`],
  think:{ q:[`Who generates the client code, and does that generator have a maintained plugin for our engine and platform?`,
      `Can an on-call engineer reproduce a failing request by hand? If not, what replaces curl?`,
      `When a field is added, do old clients ignore it or break?`,
      `Do we need server push and streaming, or only request and response?`,
      `Where does the client version live: a header, a URL segment, or nowhere yet?`],
    trade:[`Binary encoding is small and fast and unreadable in a log. You will build the decoding tool, so budget for owning it.`,
      `A strict schema catches mistakes at build time and slows down the designer who wants one more field this afternoon.`],
    traps:[`Renumbering a protobuf field or reusing a deleted number. Old clients then decode the wrong bytes into the wrong field, silently.`,
      `Putting the version in the URL and also in a header and letting them disagree.`,
      `Letting generated message types reach the interactor layer, so the protocol and the rules are now the same change.`,
      `Shipping a breaking change and using store review time as the migration window.`,
      `Reflection bound form parameters with no schema, so an added field is discovered by a runtime error in production.`],
    good:[`Client and server regenerate from the same schema files in the same CI step.`,
      `An added optional field ships without a client release.`],
    bad:[`Every API change needs a coordinated client and server release.`,
      `The only way to see what a request contained is to attach a debugger.`] },
  how:[`Pick one schema source of truth and generate both sides from it: protoc with the Go plugin for the server and the matching plugin for the client engine.`,
    `Keep generated types at the boundary. Map them to domain entities in the handler so the interactor never imports generated code.`,
    `Carry protocol facts in headers rather than in the body: session token, client version, platform, language, master data version, and a state generation counter.`,
    `Write the compatibility rule down: fields are added, never renumbered, never reused, and removal means reserved.`,
    `Implement the version gate as middleware with an explicit allow list of paths that must work on an old client, including the force update endpoint itself and the maintenance status endpoint.`,
    `Keep a JSON path for admin tooling and debugging even when the game path is binary. Same handlers, different marshaller.`,
    `Check a payload decoder tool into the repository so anyone on call can read a captured request.`],
  ai:{ yes:[`Draft message definitions from a described endpoint and flag fields that should be optional for forward compatibility.`,
      `Review a schema diff for breaking changes: renumbered fields, changed types, reused numbers, narrowed enums.`,
      `Generate the mapping layer between generated messages and domain structs.`,
      `Lay out the trade-offs of gRPC versus protobuf over HTTP for a specific client engine, given what that engine's network stack supports.`],
    no:[`Choose the protocol. It is bounded by the engine's network stack and by your operations team, and the model can see neither.`,
      `Set the force update policy. That is product and support.`,
      `Assume a plugin exists for your engine and platform. Verify that yourself.`] },
  prompts:[{l:'Schema compatibility review',p:`Here is the diff of our protobuf definitions: [PASTE]. Our clients cannot be force updated for two weeks. List every change that would break an old client, ordered by severity, with a compatible alternative for each. Then list the changes that are safe and say why they are safe at the wire level, not just at the source level.`},
    {l:'Protocol choice',p:`Our client is [ENGINE AND VERSION], our players are on mobile networks, our largest payload is [SIZE AND SHAPE], and our infrastructure is [DESCRIBE]. Compare REST with JSON, protobuf over plain HTTP, and gRPC for this case. For each, cover client library support, debuggability, payload size, and what it demands from proxies and load balancers. End with the one question I must answer before deciding.`}],
  verify:[`Does the review cite field numbers, or only field names? Only numbers decide wire compatibility.`,
    `Did it check that a maintained plugin exists for your engine, or did it assume one?`,
    `Will the headers it proposes actually survive your CDN and your proxies?`],
  test:[`Decode a captured production payload with the checked in tool. If nobody can, your on-call debugging story has a hole.`,
    `Run the previous client build against the new server in CI. That is the only honest forward compatibility test.`,
    `Measure payload size and decode time for your largest response on a mid range device, not on a workstation.`],
  rel:[['platform-and-session','Session shape and network conditions decide how much one response is allowed to cost.'],
    ['onboarding','A first launch that downloads an enormous state is an onboarding problem before it is a protocol problem.'],
    ['backend-request-context','The headers this contract defines are what the middleware reads on every request.'],
    ['backend-errors','The error payload is part of the protocol and needs the same compatibility rules as everything else.'],
    ['server-realtime-protocol','The realtime channel is this same schema decision made again, with framing on top.']],
  tech:[
    {n:'REST with JSON', how:`Resource style URLs, JSON bodies, schema documented rather than generated.`, fit:`Web clients, admin panels, third party integrations, anything where readability beats bytes.`, cost:`No generated types, so drift shows up at runtime. Large payloads on mobile.`, alt:`JSON with a generated schema (OpenAPI) when you want both.`},
    {n:'Protobuf over plain HTTP', how:`Generated messages marshalled into the body of ordinary HTTP requests and responses.`, fit:`Mobile game clients behind standard proxies and CDNs, where payload size and typed clients both matter.`, cost:`Payloads are unreadable without tooling you have to own.`, alt:`gRPC when you also want streaming and deadlines from the framework.`},
    {n:'gRPC', how:`HTTP/2 framing, generated stubs, deadlines, streaming and interceptors provided by the framework.`, fit:`Service to service traffic, and clients on platforms with first class support.`, cost:`HTTP/2 end to end, extra proxy configuration, weaker engine support and more trouble on hostile mobile networks.`, alt:`gRPC internally, protobuf over HTTP at the player facing edge.`},
    {n:'GraphQL', how:`One endpoint, the client declares the shape it wants, the server resolves fields.`, fit:`Companion apps and internal tools with many varied read shapes.`, cost:`Query cost control becomes your problem and response caching stops being free.`, alt:`Fixed endpoints for the game client, GraphQL for tooling if it earns its keep.`}] });

T('backend-request-context',{ d:'backend', t:'Request context, middleware and idempotency gates', tag:'One place seeds everything a request needs, and one gate stops the same request being applied twice.',
  what:`The per request plumbing. A context.Context carrying request scoped values (player, session, locale, client version, a logging handle, a trace transaction, a per request memo cache), a middleware chain that seeds and enforces them in a fixed order, and an idempotency gate that stops a retried request from being applied twice. On mobile, retries are not exceptional. A tunnel drops, the player taps again, and the same purchase arrives twice.`,
  why:[`Mobile clients retry. Without a duplicate gate a double tap on a flaky connection spends a currency twice or grants a reward twice, and the player only reports the one that hurt.`,
    `Context is how you avoid threading eight parameters through every function. It is also how you leak, the moment something that is not request scoped goes in.`,
    `Middleware order is policy. Maintenance before auth means an expired session still sees the maintenance screen. Version gate after auth means an old client gets a login error instead of an update prompt.`,
    `A per request memo cache removes the duplicate read nobody planned: three interactors in one request each loading the same player row.`],
  think:{ q:[`What is genuinely request scoped, and what went on the context because it was convenient?`,
      `In what order must maintenance, version gate, auth, ban check and duplicate gate run, and what does the player see when each one rejects?`,
      `What is the identity of a request for deduplication: player plus endpoint, or a client generated request id?`,
      `How long should the duplicate lock live, and what happens to a legitimate second attempt after it expires?`,
      `If a handler panics, what still runs?`],
    trade:[`Typed context accessors cost a getter and a setter per key and turn a class of runtime mistakes into compile errors. A map of string to any costs nothing today and everything later.`,
      `A short idempotency window lets a genuine retry through and a long one blocks a legitimate repeat action. No single setting is right for every endpoint.`],
    traps:[`Putting a database handle or an open transaction on the context, so a connection's lifetime is now controlled by whoever copied the context.`,
      `Using a plain string as a context key, which two packages will eventually collide on. Use a private key type.`,
      `Deduplicating on the path alone, so two different players are treated as the same request.`,
      `A per request cache that is never flushed, which quietly becomes a process wide cache with a request's worth of invalidation.`,
      `Ignoring context cancellation, so a client that hung up still pays for the full query.`,
      `Running the duplicate gate after the write, which is a race dressed as a guard.`],
    good:[`The chain order lives in one file and every position has a comment saying why it is there.`,
      `A retried purchase returns the original result instead of charging again.`],
    bad:[`A handler reads a context value a middleware forgot to set, and the zero value looks plausible.`,
      `Duplicate reward reports that nobody can reproduce on a good network.`] },
  how:[`Define a private key type (type ctxKey int) with one constant per value, and expose typed Get and Set helpers returning (T, error) instead of a raw type assertion at every call site.`,
    `Seed everything in one init middleware at the top of the chain, and flush the per request cache in a defer so nothing survives the response.`,
    `Fix the order and write it down: recover, request id and logging, trace, maintenance gate, client version gate with an exempt path list, session auth, ban check, duplicate gate, handler.`,
    `Implement the duplicate gate as an add-if-absent on a distributed cache, keyed by player plus method plus path, with a short TTL. Add succeeds exactly once, so the first request wins and the rest get a defined answer.`,
    `Decide per endpoint whether a duplicate is rejected or replayed. Replaying the stored result is friendlier to the player and costs you somewhere to store it.`,
    `Thread context.Context as the first argument everywhere and honour cancellation in queries, so a dropped client stops costing the database.`,
    `Carry a virtual now on the context rather than calling time.Now inside rules, so a test can run a seasonal event without touching the machine clock.`],
  ai:{ yes:[`List what a described handler reads from the request and propose the minimum set of context keys, flagging anything that is not request scoped.`,
      `Draft the middleware chain in order with the failure response for each stage, then critique its own ordering.`,
      `Generate the typed accessor boilerplate for a key list, which is pure repetition.`,
      `Enumerate the retry scenarios an endpoint faces and say what the client sees in each.`],
    no:[`Choose the TTL. That depends on your client's retry policy and on how a designer expects the action to behave.`,
      `Decide which endpoints must be idempotent. That is a money and fairness question.`,
      `Assume a popular framework. Name your router and your cache or the answer will be about somebody else's stack.`] },
  prompts:[{l:'Middleware order review',p:`Our middleware chain is, in order: [LIST]. For each stage, state what it reads, what it sets, and the exact response a client receives when it rejects. Then find orderings that produce a confusing player experience, for example an expired session during maintenance, or an old client that cannot reach the force update endpoint. Propose the smallest reordering and say exactly what it changes.`},
    {l:'Idempotency design',p:`This endpoint does: [DESCRIBE THE WRITE]. Our clients retry on timeout and on app resume. Propose an idempotency key, a window, and the behaviour for a duplicate (reject or replay the original result). Then work through three failure cases: the first request times out after the write committed, two devices act at the same moment, the cache is unavailable. For each, say what the player sees.`}],
  verify:[`Is the proposed key unique per player, or would two players collide on it?`,
    `Does the gate run before the write, and does it fail closed when the cache is unavailable?`,
    `Does anything it puts on the context outlive the request?`],
  test:[`Fire the same write twice concurrently against a running server and assert exactly one applied. Run it against the real cache, not a stub.`,
    `Cut the connection after the write commits but before the response, then retry, and check what the player is left holding.`,
    `Count duplicate reads per request with the memo cache on and off. The gap is what the cache is buying you.`],
  rel:[['backend-api-protocol','The headers the protocol defines are exactly what this chain reads.'],
    ['backend-errors','Every middleware rejection is an error with a code the client has to act on.'],
    ['ethics-and-responsibility','A duplicate charge is a trust failure before it is a bug.'],
    ['backend-caching-redis','The duplicate gate and the per request memo are both cache decisions.'],
    ['server-liveops','Maintenance gates and force update checks live in this chain.']],
  tech:[
    {n:'Add-if-absent cache key', how:`Write a key of player plus method plus path with a short TTL using an add operation that fails when the key already exists.`, fit:`High volume endpoints where the realistic duplicate is a retry within seconds.`, cost:`Only covers the TTL window, and a cache outage must fail closed or the gate is gone.`, alt:`A client supplied request id when the client can generate one.`},
    {n:'Client supplied request id', how:`The client generates one id per intent and repeats it on every retry. The server stores the outcome and replays it.`, fit:`Purchases, rewards, anything the player must never receive twice.`, cost:`Requires client discipline plus storage for outcomes.`, alt:`Combine them: request ids for money, add-if-absent for everything else.`},
    {n:'Database unique constraint', how:`Make the duplicate impossible at the storage layer with a unique key on the natural identity of the action.`, fit:`Writes with a natural identity, such as one claim per player per event day.`, cost:`The error path becomes a constraint violation you have to translate into a friendly answer.`, alt:`Use it alongside a cache gate. The constraint is the truth, the cache is the speed.`},
    {n:'Distributed lock with retry', how:`Take a named lock for the duration of the action and release it in a defer.`, fit:`Multi step actions touching several stores that must not interleave.`, cost:`Lock lifetime versus request lifetime bugs, and a stuck lock blocks that player until it expires.`, alt:`Prefer a unique constraint when the action has a natural identity. Locks are for sequences.`}] });

T('backend-errors',{ d:'backend', t:'Domain error taxonomy and wrapping', tag:'An error is part of your API. Give it a code, a status, something the client can act on, and the stack where it started.',
  what:`One error type for the service that carries a numeric domain code, maps to an HTTP status and a wire payload, and captures a stack at the point it was wrapped. Interactors wrap causes with a code, handlers translate at the boundary, and errors.Is and errors.As do the matching. Codes are allocated in blocks per subsystem, so a code tells whoever is on call where to look before they open a log.`,
  why:[`The client must behave differently for session expired, not enough currency, and the server is broken. A single 500 with a string forces the client to parse prose.`,
    `Where an error started matters more than where it was printed. Capturing the stack at the wrap site is the difference between a five minute and a five hour investigation.`,
    `A code block per subsystem turns a number into a routing decision during an incident.`,
    `Sentinels let callers make decisions. A cache not-stored result meaning first writer wins is a rule, not a failure, and only errors.Is expresses that cleanly.`],
  think:{ q:[`Which errors are the client's business and which are only ours?`,
      `Does this need a code the client branches on, or a status the client merely logs?`,
      `Where is the stack captured, and does wrapping twice capture it twice?`,
      `Is this a failure, or an expected outcome wearing an error type?`,
      `What does the player actually see for each code, in each language we ship?`],
    trade:[`A rich error type gives you codes, status and stacks and couples every package to it. Plain wrapped errors stay idiomatic and push the whole taxonomy into the handler.`,
      `Fine grained codes help support and multiply the client's branching. Coarse codes are easy to ship and useless at 2am.`],
    traps:[`Wrapping and dropping the cause, so errors.Is stops working three layers up.`,
      `Formatting with the verb that discards the error instead of the one that wraps it. Same mistake, shorter fuse.`,
      `Returning an internal message to the client, which leaks table names and file paths.`,
      `Reusing a code for a second meaning because it happened to sit near the right block.`,
      `Logging the error at every level on the way out, so one failure becomes five lines and your failure count is wrong.`,
      `Treating record-not-found as an error everywhere, so every read grows an error branch that means nothing.`],
    good:[`Someone on call reads a code and knows the subsystem before opening a dashboard.`,
      `The client shows the right dialog without matching on strings.`],
    bad:[`The same failure arrives with three different codes depending on which path reached it.`,
      `Every log line is at error level, so the error level carries no information.`] },
  how:[`Define one interface exposing Code(), StatusCode(), a wire payload and Unwrap(). Construct it through a helper like app.Err(code, cause) that captures the stack once, at the first wrap.`,
    `Allocate code blocks per subsystem, a thousand apart, and keep the allocation table in one file beside the constants.`,
    `Wrap where the meaning changes, not at every return. A repository returns a storage failure, the interactor turns it into a domain code.`,
    `Use errors.As at the HTTP boundary to pull the domain error out, and errors.Is for sentinels such as sql.ErrNoRows or a cache not-stored signal.`,
    `Log once, at the boundary, with the code, the stack and the request id. Everywhere else, just return.`,
    `Keep the client message and the internal message apart. The wire payload gets a code and a localization key. The log gets everything else.`,
    `Decide the default: an unmapped error becomes a generic 500 with a generic code and leaks nothing.`],
  ai:{ yes:[`Propose a code block allocation from a list of subsystems and flag the blocks likely to run out first.`,
      `Review a package for wrapping that drops the cause and for errors discarded into the blank identifier.`,
      `Draft the client side mapping from code to dialog, retry behaviour and localization key.`,
      `Find failures that get logged repeatedly on their way up the stack.`],
    no:[`Decide which internal detail is safe to send to a client. That is a security judgement.`,
      `Invent codes for failures you have not classified. A taxonomy is a commitment, not a guess.`,
      `Decide what counts as an error and what is an expected outcome. That is domain knowledge.`] },
  prompts:[{l:'Error taxonomy pass',p:`Here are our subsystems and the failures each can produce: [LIST]. Propose a numeric code taxonomy in blocks, with an HTTP status per code and a one line client facing meaning. Mark each code the client must branch on, and each code that is internal only. Flag any failure that should be an expected outcome rather than an error at all.`},
    {l:'Wrapping audit',p:`Here is a Go package: [PASTE]. Find every place an error loses its cause, gets logged more than once on the way out, or leaks internal detail into a response. For each, show the minimal corrected line and name the caller's errors.Is or errors.As check that was broken by it.`}],
  verify:[`Does every proposed code have a distinct client behaviour, or are some of them cosmetic?`,
    `Did the audit actually distinguish wrapping from formatting, or only comment on style?`,
    `Is any internal string reaching the wire payload?`],
  test:[`Force each code from a test and assert the status, the wire payload, and that the captured stack points at the origin rather than the handler.`,
    `Count distinct error codes emitted per week. A code nobody ever emits is dead, and a code that dominates is a design problem.`,
    `Wrap a deliberately ugly internal error and confirm it becomes the generic 500 and leaks nothing.`],
  rel:[['backend-api-protocol','The error payload is part of the wire contract and versions with it.'],
    ['feedback-and-affordance','A code the client cannot turn into a useful message is invisible to the player.'],
    ['backend-observability','Codes and stacks are what make a log searchable under pressure.'],
    ['backend-request-context','Every middleware rejection is an error in this taxonomy.'],
    ['lead-incidents','A code taxonomy is the first tool an incident responder reaches for.']],
  tech:[
    {n:'Wrapped sentinel errors', how:`Package level error values compared with errors.Is, wrapped on the way up so the cause survives.`, fit:`Libraries and small services where callers branch on a handful of conditions.`, cost:`No codes and no status mapping, so the handler grows a translation table instead.`, alt:`Add a typed error once that table has more than a few rows.`},
    {n:'Custom error type with codes', how:`One interface carrying a numeric code, an HTTP status, a wire payload and a captured stack, constructed at the wrap site.`, fit:`Player facing services where the client and support both need a stable vocabulary.`, cost:`Every package depends on the error package, and the code table needs an owner.`, alt:`Sentinels plus a handler side map when there is only one consumer.`},
    {n:'Codes as enums in the schema', how:`The code list lives in the protocol schema and generates constants for client and server together.`, fit:`Typed clients that branch on codes and must stay in sync with the server.`, cost:`Adding a code becomes a schema change on a release cadence.`, alt:`Numeric codes with a documented table when the client tolerates unknown values.`},
    {n:'Panic and recover at the boundary', how:`Let genuinely unrecoverable states panic and convert them to a 500 in one recovery middleware.`, fit:`Programmer errors such as a nil map write, where continuing is worse than failing.`, cost:`Easy to abuse as control flow, and a panic inside a goroutine still takes the process down.`, alt:`Return errors for anything a caller could reasonably handle.`}] });

T('backend-data-access',{ d:'backend', t:'Transactions, query layers and delta state sync', tag:'Own your queries, scope transactions to the request, and send the client only what changed.',
  what:`Three decisions that travel together. How queries are written: raw SQL, a builder such as gocraft/dbr, typed functions generated from SQL by sqlc, or a full ORM such as GORM. How transactions are scoped: opened by the handler, passed down as a runner, committed or rolled back in one deferred place. And how state returns to the client: a full snapshot every time, or a delta driven by which tables the request actually dirtied.`,
  why:[`Query control is latency control. An ORM that chooses your joins will eventually choose your worst query, and you will meet it during an event.`,
    `Transaction scope decides correctness. If each interactor opens its own transaction, two interactors in one action can never be atomic together.`,
    `A live game writes across several schemas in one player action. Commit ordering and rollback have to be one rule, not a habit that varies per handler.`,
    `Full state responses grow with the account. Delta sync keeps the response proportional to what happened instead of to how long the player has played.`],
  think:{ q:[`Can I see the SQL this code will run without running it?`,
      `Who opens the transaction, and who is allowed to commit it?`,
      `Does a repository method behave identically against a session and against a transaction?`,
      `How does the client learn that its local copy is stale?`,
      `When one of two databases commits and the other fails, what is the player left with?`],
    trade:[`An ORM is fastest for the first fifty endpoints and slowest for the five that matter. A builder is more typing and no surprises.`,
      `Delta sync makes responses small and makes correctness depend on dirty tracking being right. A missed table is a client showing stale data with no error anywhere.`],
    traps:[`A repository that opens its own transaction, so nesting silently becomes two transactions.`,
      `Loading associations inside a loop, which is the N+1 that only appears at real data volume.`,
      `Committing in a defer without consulting the named return error, so a failed action commits anyway.`,
      `Holding a transaction open across a call to another service.`,
      `Registering dirty tables by hand at each call site, so the one path that forgot is the bug.`,
      `Using the main database as a queue with polling, which works right up until it is the hottest table you own.`],
    good:[`Every write repository method asserts it was handed a transaction.`,
      `The response after a small action stays small regardless of account age.`],
    bad:[`Nobody can say which queries run during a login.`,
      `A stale currency report comes in and the only suggested fix is a relog.`] },
  how:[`Give every repository method the shape (ctx, runner, args) where runner is an interface that both a session and a transaction satisfy. One method, both contexts.`,
    `Open transactions in the handler, for exactly the databases this action writes, then use a named return error with a deferred commit or rollback: commit when err is nil, roll back otherwise.`,
    `Make write repositories assert the runner is a transaction. A write on a bare session should fail loudly in development, not quietly in production.`,
    `Register the dirty table inside the repository write method rather than at the call site, so forgetting is not possible.`,
    `Run the delta reload after the handler succeeds: reload exactly the dirty tables, plus whatever the client says it is missing by generation counter.`,
    `Read the generated SQL during review. If the query is invisible in the diff, the diff is not reviewable.`,
    `Keep a migration and the code that uses it in separate pull requests, so either can be rolled back without the other.`,
    `Index for the query you actually run, then confirm with EXPLAIN against production-like row counts, not against a seeded test table.`],
  ai:{ yes:[`Turn a described read into a query, then critique its index usage and predict the plan.`,
      `Find N+1 patterns and unbounded result sets across a package.`,
      `Draft the row struct to entity mapping and the repository method signatures.`,
      `Review a transaction boundary for the commit-on-error bug and for calls made while a transaction is open.`],
    no:[`Decide the transaction boundary for a gameplay action. Only you know what has to be atomic for the player.`,
      `Design a schema change for a live table without the row count and the traffic shape in front of it.`,
      `Promise that a query is fast. Measure it.`] },
  prompts:[{l:'Query review',p:`Here are the queries one request runs, with table row counts and existing indexes: [PASTE]. Identify N+1 patterns, missing indexes, unbounded scans, and queries whose plan will change as the table grows. For each, give the smallest fix and the EXPLAIN output I should expect to see if the fix worked.`},
    {l:'Delta sync audit',p:`Our client keeps a local copy of these tables: [LIST]. Our server returns only the tables a request dirtied. Here are the write paths of one feature: [PASTE]. Find writes that would fail to register their table as dirty, and the client reads that would then show stale data. Describe the symptom a player would report for each one.`}],
  verify:[`Did it use the index list you gave it, or invent indexes that do not exist?`,
    `Does the transaction advice still hold when the action writes to two databases?`,
    `Is the delta audit tracing actual write methods, or guessing from names?`],
  test:[`Inject a failure between two writes and assert both stores are unchanged. A partial write is the bug this whole idiom exists to prevent.`,
    `Count queries per endpoint in a test and fail when the count grows. Query count is the cheapest regression alarm you own.`,
    `Measure response size for a brand new account and for your oldest account. The gap is the argument for delta sync.`],
  rel:[['backend-layering','The repository port is the boundary this topic lives on.'],
    ['economy-and-resources','Every currency change is a transaction, and a lost one becomes a support ticket.'],
    ['backend-migrations-config','A query change and a schema change are one design, deliberately shipped as two.'],
    ['backend-caching-redis','What you cache is decided by what these queries cost.'],
    ['server-state-sync','Delta sync on a request and state sync in a realtime session are the same problem at different tick rates.']],
  tech:[
    {n:'SQL builder (gocraft/dbr and similar)', how:`Compose queries in Go through a fluent API that produces SQL you can print and read.`, fit:`Teams that want typed arguments while keeping the query visible in review.`, cost:`More code than an ORM, plus the builder's own quirks to learn.`, alt:`sqlc when the queries are static enough to live in .sql files.`},
    {n:'Generated queries from SQL (sqlc)', how:`Write the SQL, generate typed Go functions and result structs from it at build time.`, fit:`Static query sets where the SQL itself is the artifact you want reviewed.`, cost:`Dynamic filters are awkward and end up hand written anyway.`, alt:`A builder for dynamic search, sqlc for everything else.`},
    {n:'Full ORM (GORM and similar)', how:`Map structs to tables with associations, hooks and generated queries.`, fit:`Admin tools and internal services where development speed beats query control.`, cost:`Hidden queries, surprising joins, and lazy loading that becomes N+1 under load.`, alt:`Use it for tooling and keep the player facing hot path explicit.`},
    {n:'Generated repositories from a schema descriptor', how:`Describe each table once in a machine readable file and generate entities, repository interfaces and implementations from it.`, fit:`Many tables with uniform CRUD, where hand writing them is pure repetition.`, cost:`You now own a generator, and anything unusual fights it.`, alt:`Generate the boring majority, hand write the rest and keep it outside the generator's path.`}] });

T('backend-caching-redis',{ d:'backend', t:'Caching tiers and Redis patterns', tag:'Three cache tiers answer three different questions, and Redis is three different tools wearing one name.',
  what:`Where a read is answered from, and what Redis is actually doing in a game backend. The tiers: an in-process cache for data that is immutable between releases, a distributed cache such as memcached or Redis for player and shared state, and a per request memo cache that removes duplicate reads inside one handler. Redis earns its place separately through sorted sets for leaderboards, a lock manager for sequencing, and pub/sub for fan-out between instances.`,
  why:[`Master data is read on nearly every request and changes only at a release. Fetching it from a database is paying for a query whose answer is frozen.`,
    `A cache tier you cannot invalidate is a bug generator. Each tier needs an invalidation story before it is added, not after the first stale report.`,
    `Ranking is where the data structure beats the query. A sorted set gives rank and a page around a player in log time, where SQL gives you a scan and a window function.`,
    `Fan-out across instances is a topology problem. Without pub/sub a chat message reaches a third of the room, because it reached one of three servers.`],
  think:{ q:[`Which data is immutable between deploys, which is per player, and which is shared and hot?`,
      `How is each tier invalidated, and which code is responsible for doing it?`,
      `What happens on a cold cache: a controlled miss, or a thundering herd?`,
      `Is this cache making the system faster, or hiding a query that should be fixed?`,
      `When the cache and the database disagree, which one is right, and who decides?`],
    trade:[`In-process caching is the fastest and the hardest to invalidate. You now hold one copy per instance, and a deploy has become your invalidation mechanism.`,
      `Caching player state saves reads and introduces a consistency bug class that only appears under concurrency.`],
    traps:[`A key that omits something the value depends on, such as locale, shard or master data version.`,
      `Stampede on expiry, where a thousand requests miss together and all query at once.`,
      `Using a cache as a database, so a flush loses state nobody can rebuild.`,
      `Caching a whole aggregate when one field is read, so every write invalidates everything.`,
      `A leaderboard score with no tiebreak, so equal scores order differently between two reads.`,
      `Treating Redis as always available with no written answer for what the game does while it is gone.`],
    good:[`Every cache key has a documented owner, window and invalidation trigger.`,
      `The service still serves, more slowly, with the distributed cache stopped.`],
    bad:[`Clearing a stale value requires a deploy.`,
      `Two players see different positions for the same score.`] },
  how:[`Key the master data cache by the master data version, so a release changes every key and invalidation costs nothing.`,
    `Put the per request memo cache on the context and flush it in the middleware that seeded it. It exists to remove duplicate reads inside one handler, and nothing else.`,
    `In the distributed tier, cache the narrow thing the read wants rather than the whole aggregate, and invalidate on the write path inside the same transaction boundary.`,
    `Prevent stampedes with jittered expiry plus a single flight guard, so one goroutine fills the value and the rest wait on its result.`,
    `For leaderboards use a sorted set with an add-if-higher update, and pack a timestamp into the score or a secondary key so an earlier achiever outranks a later one at equal score.`,
    `Give the lock manager a bounded retry and a lock TTL shorter than the request timeout, and release in a defer so a panic still frees it.`,
    `Shard pub/sub channels across N connections by a hash of the channel name, and handle resubscribe on reconnect, or one hot room pins one connection.`,
    `Write down the degraded behaviour per cache: serve stale, fall through to the database, or fail. Undecided means it will be decided during an incident.`],
  ai:{ yes:[`Propose cache keys for a described read path, including every dimension the value depends on.`,
      `Find write paths that fail to invalidate a cache the read path uses.`,
      `Compare sorted set designs for a leaderboard with a given tiebreak and score range, including how the tiebreak is encoded.`,
      `Draft the single flight and jitter wrapper around a cache fill.`],
    no:[`Decide what is allowed to be stale and for how long. That is a design and fairness call.`,
      `Promise a hit rate. Measure it against your own traffic.`,
      `Recommend a cache instead of fixing a query. Make it show you the query first.`] },
  prompts:[{l:'Cache tier design',p:`Here are our read paths with frequency, what each returns, and how often that data changes: [PASTE]. Assign each to one of three tiers: in-process (immutable between deploys), distributed (shared, invalidated on write), per request (dedupe only). For each, propose the key including every dimension the value depends on, an expiry, an invalidation trigger, and the behaviour when that cache is unavailable.`},
    {l:'Leaderboard design',p:`We need a leaderboard with [SIZE] entries, scores in range [RANGE], updated [FREQUENCY], ties broken by who reached the score first. Design it as a Redis sorted set: score encoding, update operation, how rank and a page around the player are read, how a season reset works, and what a player sees while the reset is in progress.`}],
  verify:[`Does every key include locale, shard, master version and anything else the value depends on?`,
    `Did it give an invalidation trigger for each value, or only an expiry time?`,
    `Does the tiebreak encoding survive floating point precision at your score range?`],
  test:[`Measure hit rate per tier and per key prefix. A prefix under half is either wrongly keyed or wrongly scoped.`,
    `Run the service with the distributed cache stopped and record what a player experiences. That is your real degraded mode, not the one in the document.`,
    `Hit one cold key with concurrent requests and count database queries. More than one per expiry means the stampede guard is missing.`],
  rel:[['backend-data-access','Caching is what you do after the query is as good as it is going to get.'],
    ['progression','Leaderboards and ladders are progression made visible and competitive.'],
    ['backend-request-context','The per request memo cache lives on the context and dies with it.'],
    ['infra-data-stores','Redis and memcached are operated resources with failure modes, capacity and a bill.'],
    ['server-scaling','Pub/sub fan-out is the mechanism that lets one room span more than one instance.']],
  tech:[
    {n:'In-process cache', how:`Hold immutable or slow changing data in a map inside the process, keyed by a version string.`, fit:`Master data, config, anything frozen between releases.`, cost:`One copy per instance, and no invalidation short of a deploy or a version bump.`, alt:`Distributed cache when the data changes while the process is running.`},
    {n:'Distributed cache (memcached or Redis)', how:`A shared store in front of the database, invalidated on the write path.`, fit:`Player state and hot shared reads across many instances.`, cost:`A network hop, a consistency story, and a new availability dependency.`, alt:`No cache at all until a measurement says the read is the problem.`},
    {n:'Per request memo cache', how:`A small map on the request context, flushed when the response is written.`, fit:`Removing duplicate reads inside a handler that calls several interactors.`, cost:`Nothing, as long as it is genuinely flushed.`, alt:`Pass the loaded entity down as an argument when the call chain is short.`},
    {n:'Redis sorted sets for ranking', how:`Score plus member, with add-if-higher, rank, range and range-by-score operations.`, fit:`Leaderboards, seasonal ladders, anything ordered and paged by rank.`, cost:`Memory grows with participants, and the tiebreak must be encoded into the score.`, alt:`A periodically materialized table when the ranking is allowed to be minutes stale.`}] });

T('backend-migrations-config',{ d:'backend', t:'Schema migrations, configuration and secrets', tag:'Schema changes ship separately from code, and secrets never ship at all.',
  what:`How the shape of the database changes over time, and how the service learns its settings. Migrations are versioned files applied by a tool such as goose, one directory per schema, run as an explicit deploy step with a named environment. Configuration is embedded in the binary, read from the environment, or fetched from a config service. Secrets are the part that must never be in version control, and the part that most often is.`,
  why:[`A migration is the only change you cannot undo by redeploying the previous build. It needs its own review, its own window and its own rollback plan.`,
    `Code and schema land at different moments. Any change that assumes they land together is broken for the minutes in between, which is exactly when traffic is highest.`,
    `Configuration decides behaviour, so a config difference between environments is a bug that exists only in production.`,
    `A credential in a repository is leaked the moment it is pushed. Rotation is the fix. Rewriting history is not.`],
  think:{ q:[`Can the current code run against the old schema, and the old code against the new one?`,
      `How long will this lock the table at production row counts, on the engine version we actually run?`,
      `What is the rollback: a down migration, a restore, or a forward fix?`,
      `Which settings differ per environment, and where does that difference physically live?`,
      `If this credential leaked today, what would we do, and how long would it take?`],
    trade:[`Embedded config makes the binary reproducible and makes a setting change a build. External config is flexible and lets someone change production behaviour with no review.`,
      `Expand and contract is safe and takes three deploys. One shot is one deploy and one bad minute.`],
    traps:[`A migration and the code that needs it in the same pull request, so rolling back one forces rolling back the other.`,
      `Down migrations nobody has ever executed, which are fiction until tested.`,
      `Adding a constrained column to a large table without checking how that engine version handles it.`,
      `Database credentials committed inside a migration config, which is the most common leak in this whole area.`,
      `Environment blocks that drift quietly, so CI tests a configuration nobody runs.`,
      `Renaming a column in one step, which breaks every instance still running the previous build.`],
    good:[`Migrations run as their own step, against a named environment, with an operator recorded.`,
      `A new environment is created by setting variables, not by editing code.`],
    bad:[`Deploys are held because a migration must go first and nobody is confident it is safe.`,
      `Rotating a secret means asking everyone to pull.`] },
  how:[`Keep one migration directory per schema, with a tool that records applied versions in the database, and one explicit target per schema per environment so running it is always deliberate.`,
    `Use expand and contract for anything beyond a trivially additive change: add the new column, write to both, backfill, switch reads, drop the old one in a later release.`,
    `Separate the migration pull request from the code pull request. They are reviewed against different questions and roll back independently.`,
    `Write the schema conventions down once: engine, charset and collation, naming, the timestamp type and precision used for mutable player timestamps, and how nullable is decided.`,
    `Embed the configuration that must not vary, and read the small set that must vary from environment variables listed in one place with defaults.`,
    `Keep secrets in a secret store injected at deploy time. The repository holds the name of the secret and never the value.`,
    `Run the migration against a restored copy of production sized data and record the duration before scheduling a window.`,
    `Have CI create every schema from zero and run the whole migration history on each push. That is how you find out a two year old migration no longer applies.`],
  ai:{ yes:[`Rewrite a risky migration as an expand and contract sequence and list what each deploy must contain.`,
      `Review a migration for locking behaviour, nullability and default choices, and index creation strategy at a stated row count.`,
      `Diff two environment configuration blocks and list every difference with its likely effect.`,
      `Draft the environment variable table with defaults and a required column.`],
    no:[`Decide the maintenance window. That is a player facing decision with a support cost.`,
      `Handle secrets. Never paste a credential into a prompt, not even to ask whether it is exposed.`,
      `Promise a migration is non blocking. Verify it against the documentation for the exact engine version you run.`] },
  prompts:[{l:'Migration risk review',p:`Here is a migration plus the table it touches, with row count, storage engine and current indexes: [PASTE]. State the expected lock behaviour on that engine version, an estimated duration, and whether the previous build can run against the new schema. If it cannot, rewrite it as an expand and contract sequence and say exactly what each deploy contains.`},
    {l:'Config drift audit',p:`Here are our environment configuration blocks with every secret value removed: [PASTE]. List every setting that differs between environments and the likely behavioural effect of each difference. Flag settings that exist in production but not in the CI environment, because those are untested in every single build.`}],
  verify:[`Did it check compatibility in both directions, old code against new schema and new code against old schema?`,
    `Are the locking claims tied to your engine and version, or generic advice?`,
    `Did any secret value reach the prompt? If so, treat it as leaked and rotate it.`],
  test:[`Run the full migration history against an empty database in CI on every push. A failure means a historical migration no longer applies.`,
    `Time the migration on a restored copy of production data and record the number before anything gets scheduled.`,
    `Boot the previous build against the new schema in a test environment. If it fails, your deploy has an ordering requirement nobody has written down.`],
  rel:[['backend-data-access','A schema change and the query change that needs it are one design, deliberately shipped as two.'],
    ['quality-and-build-health','A migration nobody can roll back is the kind of risk that stops a release.'],
    ['infra-secrets','Where the credential lives is the entire question here.'],
    ['infra-ci-pipelines','Building every schema from zero in CI is what keeps the migration history honest.'],
    ['pm-risk','The riskiest migration belongs on the risk register, not in a code comment.']],
  tech:[
    {n:'Versioned migration files (goose, golang-migrate)', how:`Numbered up and down files applied in order, with applied versions recorded in the database.`, fit:`Almost every service. Simple, inspectable, reviewable.`, cost:`Down migrations are only real once tested, and two branches adding a migration collide on ordering.`, alt:`Declarative tools when the team would rather review the target state than the steps.`},
    {n:'Declarative schema diffing', how:`Describe the desired schema and let the tool compute the plan to reach it.`, fit:`Many similar tables with a generated schema description.`, cost:`The generated plan still needs review, and destructive steps need a human gate.`, alt:`Versioned files where the step itself carries meaning, such as a backfill.`},
    {n:'Embedded configuration', how:`YAML compiled into the binary with go:embed, one block per environment, selected by an environment variable.`, fit:`Self contained deploys where a config change should be a reviewed build.`, cost:`Changing a value needs a rebuild, and blocks drift unless somebody diffs them.`, alt:`Environment variables for the few values that genuinely differ per host.`},
    {n:'External secret store', how:`Secrets held by a dedicated service, injected at deploy time or fetched at boot with a short lived token.`, fit:`Anything with a credential, which is every service.`, cost:`A dependency at startup and a bootstrap credential of its own to manage.`, alt:`Environment variables injected by the deploy system, which is the minimum acceptable version.`}] });

T('backend-observability',{ d:'backend', t:'Logging, tracing, profiling and action logs', tag:'Logs, traces, profiles and an event stream answer four different questions. None of them substitutes for another.',
  what:`The instrumentation that lets you answer questions about a running service. Structured logs split into named streams, traces showing where a request spent its time, profiles showing where CPU and allocations went, and an analytics event stream recording what players did. In Go that is slog, zap or logrus for logs, an APM or OpenTelemetry abstraction for traces, net/http/pprof for profiles, and a generated event type per game action.`,
  why:[`A log says what happened, a trace says where the time went, a profile says why the machine is busy. Reaching for the wrong one burns the first hour of an incident.`,
    `Unstructured logs cannot be queried. The moment you need a count per player or per endpoint, prose stops being evidence.`,
    `Engineering telemetry and game analytics are different consumers with different retention and different privacy rules, usually emitted by the same code.`,
    `Instrumentation that is not on by default does not exist during an incident. A profiler you have to deploy to enable arrives an hour late.`],
  think:{ q:[`If this endpoint got slow right now, what would I ask first, and can I answer it today?`,
      `Which fields must be on every line for logs to be joinable: request id, player, endpoint, code?`,
      `What is this stream's retention, and who actually reads it?`,
      `Is anything identifying in this event, and should it be hashed before it is written?`,
      `What does this instrumentation cost, in bytes, in latency and per month?`],
    trade:[`More spans give a sharper picture and cost latency and money. Sampling saves both and loses the rare slow request, which is the one you wanted.`,
      `Rich per request logs are wonderful in development and a bill in production. Level and sampling are design decisions, not defaults.`],
    traps:[`Logging whole request or response bodies, which puts player data and tokens into a store with the wrong retention.`,
      `One giant stream, so query chatter buries the errors.`,
      `Rotation that moves the file while the process holds the handle, so the disk never frees.`,
      `A trace that stops at the HTTP boundary, so every slow request looks like the database is innocent.`,
      `Timing with a wall clock at the call site instead of a span, so the numbers never aggregate.`,
      `Event names invented per feature, so every analysis starts with a translation table.`],
    good:[`Any log line joins to any other by request id.`,
      `A slow endpoint gets diagnosed from the trace waterfall before anyone opens the code.`],
    bad:[`The only way to know how long something takes is to reproduce it locally.`,
      `The error stream is empty because errors are being logged at info.`] },
  how:[`Split logs into named streams with their own level and destination: application, errors, queries, cache, the analytics action stream, and one per realtime server.`,
    `Put the logging handle on the request context in the first middleware, so every layer logs with the same request id and player without a logger being threaded through signatures.`,
    `Handle rotation properly: listen for the rotation signal in a goroutine and reopen every file handle, so the file the process writes to is the file that exists on disk.`,
    `Hide the APM behind one interface with span helpers for database, cache and outbound calls, so changing backend is a wiring change rather than a rewrite.`,
    `Name the trace transaction after the route pattern, not the resolved URL, or cardinality makes the dashboard useless.`,
    `Mount net/http/pprof behind an admin prefix in every environment, and keep a scripted way to pull a flame graph from a running instance.`,
    `Generate analytics event types from one description file so a field means the same thing everywhere, and hash anything identifying at the write site rather than downstream.`,
    `Define the four numbers you watch per endpoint: request rate, error rate by code, latency at a high percentile, and saturation of whatever it depends on.`],
  ai:{ yes:[`Given a trace, order spans by self time and name the two most likely causes of the latency.`,
      `Turn unstructured log lines into a structured schema and list the fields needed to join them.`,
      `Review a package for logs that contain player data or credentials.`,
      `Draft an event taxonomy for a feature: one event per meaningful action, with a field list.`],
    no:[`Decide retention and what may be recorded about a player. That is privacy policy.`,
      `Interpret a profile it cannot see. Give it the actual profile output.`,
      `Invent a latency target. That comes from the game, not from a benchmark.`] },
  prompts:[{l:'Trace reading',p:`Here is a trace for a slow request with span names, start times and durations: [PASTE]. Order the spans by self time rather than total time. Name the two most likely causes of the latency, and for each the single measurement that would confirm or eliminate it. State explicitly what this trace does not cover.`},
    {l:'Event taxonomy',p:`Here is a feature and the player actions inside it: [DESCRIBE]. Propose one analytics event per meaningful action, with a stable name, the fields it carries, and which fields identify a player and therefore must be hashed. Flag any event that would fire often enough to dominate the stream, and propose an aggregate instead.`}],
  verify:[`Did it read self time or total time? Total time makes every parent span look guilty.`,
    `Does any proposed field carry personal data your retention policy does not allow?`,
    `Are the event names stable enough to survive the feature being renamed?`],
  test:[`Take a real past incident and try to diagnose it using only what you log today. The gaps are your instrumentation backlog, in priority order.`,
    `Measure the latency instrumentation adds on a hot endpoint by running it with tracing and logging off. It is not free and you should know the number.`,
    `Search a day of logs for anything shaped like a token or an address. One hit is a policy failure, not a curiosity.`],
  rel:[['metrics-and-success','Instrumentation is what turns a success metric from an opinion into a number.'],
    ['ai-for-playtest-analysis','The event stream is the raw material analysis runs on, and a bad taxonomy poisons every conclusion.'],
    ['backend-errors','Codes and captured stacks are what make an error log searchable under pressure.'],
    ['infra-monitoring','Logs and traces feed the alerts, and an alert with no trace behind it wastes the page.'],
    ['server-anticheat','The action log is the evidence trail an abuse investigation runs on.']],
  tech:[
    {n:'Structured logging (slog, zap, logrus)', how:`Key value fields on every line, emitted as JSON or a structured text format, with a level per stream.`, fit:`Any service that will ever be queried by a log tool.`, cost:`Noisier call sites and a field naming convention somebody has to maintain.`, alt:`slog from the standard library when you do not need the extras, since it is one fewer dependency.`},
    {n:'Distributed tracing (OpenTelemetry or a vendor APM)', how:`Spans per unit of work, propagated on the context, aggregated into a waterfall per transaction.`, fit:`Anything with more than one hop, which includes a database and a cache.`, cost:`Latency per span, storage, sampling decisions, and lock-in unless abstracted.`, alt:`Manual timing on a handful of endpoints while the service is still small.`},
    {n:'Profiling endpoints (net/http/pprof)', how:`Expose profile endpoints and pull CPU, heap and goroutine profiles from live instances.`, fit:`Memory growth, CPU spikes, goroutine leaks, everything a trace cannot show.`, cost:`An admin surface that must be protected, and a small overhead while profiling.`, alt:`Local benchmarking when the problem reproduces off production.`},
    {n:'Generated analytics event stream', how:`One generated type per game event written to an append only stream, with identifying fields hashed at the write site.`, fit:`Live games where design decisions depend on what players actually did.`, cost:`Schema governance, volume cost, and a privacy review per field.`, alt:`Querying the operational database, which works until the query load becomes the problem.`}] });

T('backend-testing',{ d:'backend', t:'Testing tiers and test integrity', tag:'Three tiers answer three questions, and every expected value is derived independently rather than pasted from a run.',
  what:`The test pyramid for a game service, plus the discipline that keeps it honest. Pure unit tests for formulas, simulation and helpers. Interactor tests against generated mocks (mockery with testify) that check the rules with no infrastructure. Integration tests against a real database and cache, built through the same dependency graph the service uses. On top, an end to end suite talking to a running binary over the real protocol. The integrity rules matter as much as the tiers: expectations derived independently, setup failure is red and never skipped, and a previously green test going red means your change is wrong until proven otherwise.`,
  why:[`A rule test that needs a database is a test nobody runs while writing code, so rules stop being tested first and start being tested last.`,
    `Mocks prove the interactor asked for the right things. Only a real database proves the query parses, the index exists and the transaction commits.`,
    `An expectation pasted from observed output tests that the code still does what it did, bug included.`,
    `A test that skips when setup fails is a green build that tested nothing, and it stays green for months before anybody notices.`],
  think:{ q:[`What question does this test answer, and which tier is the cheapest place to answer it?`,
      `Where did this expected value come from: master data, the specification, arithmetic I can show, or a previous run?`,
      `When this fails, will the failure name the cause, or only say not equal?`,
      `What would a fully passing suite still miss?`,
      `Is this asserting behaviour, or asserting the current implementation?`],
    trade:[`Mocks make tests fast and let you assert interactions, and they drift from the real repository until an integration test catches it.`,
      `An end to end suite catches integration truth and is slow, order sensitive and expensive to keep meaningful.`],
    traps:[`Weakening an assertion to turn a red test green. That is deleting the test slowly.`,
      `Skipping when a container is missing, so CI is green on a machine with no database.`,
      `Tests that depend on execution order or on data a previous test left behind.`,
      `Regenerating a golden file whenever it differs, which turns a regression alarm into a rubber stamp.`,
      `Mocking the thing under test, so the assertion is about the mock.`,
      `One shared fixture every test mutates, so a single failure breaks six unrelated tests.`],
    good:[`A bug fix lands with a test that failed before the fix, and both log tails are in the pull request.`,
      `A failing test names the rule it broke.`],
    bad:[`The suite passes and the feature is broken in the first playtest.`,
      `A red end to end run is triaged as flaky by default, so nobody reads it.`] },
  how:[`Keep pure logic in packages with no infrastructure imports and test it with table driven tests. This tier should be enormous and instant.`,
    `Generate mocks selectively from a config file with an include pattern, so you get the one mock you need on demand instead of a directory of thousands.`,
    `Build integration tests through the same dependency graph the service uses, flush caches during setup, and register cleanup with t.Cleanup so a failure still closes the pool.`,
    `Derive every expected value independently, from master data, the specification, or arithmetic written into the test. Never from a previous run's output.`,
    `Make setup failure fail the test. A missing container is red, not skipped.`,
    `Write the failing test first for a bug fix, and keep the red and green log tails in the pull request body as evidence.`,
    `Run the linter through the same command CI runs, with an explicit enabled check list rather than defaults, so a local pass and a CI pass mean the same thing.`,
    `Inject the clock and the random source rather than reading globals, so a flaky test is a real signal instead of background noise.`],
  ai:{ yes:[`Generate table driven cases for a pure function, including boundaries and the cases a tired human skips.`,
      `Read a rule description and list the cases a suite would need, before any implementation exists.`,
      `Explain why a test is flaky, given the test body and several failure outputs.`,
      `Draft mock setup and assertions for an interactor test from the interface and the interactor code.`],
    no:[`Decide what is correct. If it writes the code and the expected value, the test only proves it agreed with itself.`,
      `Fix a red test by changing the assertion. Make it explain the failure first.`,
      `Judge whether the suite is sufficient. Coverage answers a different and smaller question.`] },
  prompts:[{l:'Case derivation',p:`Here is the rule as written in the design document, with the relevant master data rows: [PASTE]. Do not look at any implementation. List the test cases needed to cover it: normal cases, boundaries, invalid inputs, and interactions with adjacent rules. For each, state the expected result and show the arithmetic or the master data row you derived it from.`},
    {l:'Flake diagnosis',p:`This test fails roughly one run in twenty. Here is the test, the code under test, and three failure outputs: [PASTE]. Rank the possible causes: shared state, time dependence, ordering, concurrency, an unseeded random source, or a real bug that only manifests sometimes. For each, name the change that would confirm it.`}],
  verify:[`Did it derive the expected values, or read them out of the implementation you pasted?`,
    `Does every generated case have a distinct reason to exist, or are ten of them one case with different numbers?`,
    `Does the flake fix remove the nondeterminism, or hide it behind a retry?`],
  test:[`Delete a line of a rule and confirm a test goes red. A suite that stays green does not actually test that rule.`,
    `Measure wall time per tier. If the fast tier is not fast, people stop running it and the pyramid inverts.`,
    `Count how often a red end to end run turns out to be a real bug. Below about half, the suite is training the team to ignore it.`],
  rel:[['playtesting','A suite and a playtest answer different questions, and neither one covers the other.'],
    ['quality-and-build-health','Test integrity is what makes a green build mean anything.'],
    ['backend-go-idioms','An injected clock, a seeded random source and a race detector run are what make a Go suite trustworthy.'],
    ['infra-ci-pipelines','The pipeline decides which tiers run on which event, and therefore what green means.'],
    ['lead-code-review','Red before and green after in the pull request body is a review convention before it is a testing one.']],
  tech:[
    {n:'Generated mocks (mockery with testify)', how:`Generate a mock per interface from a config file, then assert calls and returns in the test.`, fit:`Interactor tests where the point is that the rule asked for the right things.`, cost:`Mocks drift from the real implementation, and over-asserted call expectations make refactoring painful.`, alt:`A hand written fake with real behaviour when the interface is small and used everywhere.`},
    {n:'Real dependencies in containers', how:`Start a real database and cache for the run, build the real graph, clean state between tests.`, fit:`Query validity, index usage, transaction behaviour, anything a mock cannot lie about.`, cost:`Slower, needs container infrastructure locally and in CI, and strict cleanup discipline.`, alt:`An in-memory implementation when the store is genuinely simple, which a SQL database is not.`},
    {n:'Golden file comparison', how:`Freeze a known good output and diff every future run against it.`, fit:`Deterministic simulation, serialization formats, generated code.`, cost:`Regenerating on every difference destroys the signal, so regeneration needs a deliberate gate.`, alt:`Property based assertions when the shape matters more than the exact bytes.`},
    {n:'End to end suite against a running binary', how:`A separate suite speaking the real protocol to a booted server with generated clients.`, fit:`Protocol compatibility, middleware behaviour, and the flows a player actually performs.`, cost:`Slow, order sensitive, and the most expensive tier to keep trustworthy.`, alt:`Handler level integration tests for most of it, end to end only for flows crossing process roles.`}] });

T('backend-go-idioms',{ d:'backend', t:'Go concurrency, lifecycle and module hygiene', tag:'Context first, errors wrapped, goroutines owned, shutdown deliberate. The idioms are what keep a large Go service readable.',
  what:`The Go specific habits that decide whether a service stays maintainable at size: context.Context as the first parameter on anything doing I/O, error wrapping matched with errors.Is and errors.As, one owner and one exit path per goroutine, explicit server timeouts, cleanup in reverse construction order at shutdown, generics kept to genuinely repeated shapes, and dependency hygiene enforced by a linter instead of by review comments.`,
  why:[`Goroutines with no owner are the leak class Go is known for. Every goroutine needs a reason to exit and something that waits for it.`,
    `A default HTTP server has no read, write or idle timeout, so one slow client can hold a connection indefinitely. The security linter flags it because it is a real availability bug.`,
    `Shutdown order decides whether in-flight requests finish. Cancel, stop accepting, drain, then close pools in reverse order of construction.`,
    `Dependency creep is invisible until an audit. An import allow list turns "should we add this library" into a conversation at the moment it happens rather than a year later.`],
  think:{ q:[`Who owns this goroutine, how does it learn to stop, and who waits for it?`,
      `Does this function need a context, or am I passing one because everything else does?`,
      `Is this a mutex problem or a channel problem: shared state, or handing ownership over?`,
      `What happens to an in-flight request during a deploy?`,
      `Is this generic because two things share a shape, or because three things share a word?`],
    trade:[`Channels express handoff clearly and cost more than a mutex around a small shared structure. Mutex when the data is shared, channel when ownership moves.`,
      `Generics remove duplication and make signatures harder to read. Worth it for numeric and slice helpers, rarely worth it for business rules.`],
    traps:[`Starting a goroutine inside a constructor, so a test that merely builds the object leaks one.`,
      `Ignoring the error from a deferred Close, which is exactly what errcheck exists to catch.`,
      `Calling WaitGroup Add inside the goroutine instead of before starting it, which races with Wait.`,
      `time.After inside a select loop, which allocates a timer per iteration that survives until it fires.`,
      `Package level state that makes two tests in the same package interfere.`,
      `Accepting a context and then never checking it, which looks idiomatic and cancels nothing.`],
    good:[`Every long lived goroutine is started by something that can also stop it.`,
      `Shutdown is one function, and it has a test.`],
    bad:[`The goroutine count climbs steadily across a day and nobody can name the source.`,
      `A deploy drops in-flight requests and the team has started calling that normal.`] },
  how:[`Take context.Context as the first parameter on anything that does I/O, and actually honour cancellation rather than accepting the parameter and ignoring it.`,
    `Create the root context in main with context.WithCancel, defer cancel, and pass it into every subsystem so one signal stops the whole process.`,
    `Construct HTTP servers explicitly with ReadTimeout, ReadHeaderTimeout, WriteTimeout and IdleTimeout set. Never serve from a default server value.`,
    `Pair every goroutine with its exit: a context, a done channel, or a WaitGroup the caller waits on. One goroutine per connection with a deferred close is the readable version.`,
    `Use errgroup for fan-out where the first error should cancel the rest, and a bounded worker pool where the fan-out is large enough to hurt a database.`,
    `Guard shared structures with sync.RWMutex when reads dominate, and use sync.Once for initialization that must happen exactly once and lazily.`,
    `Keep generics to constraint based utilities: clamp, min and max, slice helpers, a weighted picker, a chunker. If the constraint needs a paragraph of explanation, the generic is wrong.`,
    `Add a depguard section to golangci-lint with an import allow list, so adding a dependency becomes a deliberate edit to a reviewed file.`],
  ai:{ yes:[`Review a package for leaked goroutines, ignored cancellation and unchecked deferred errors.`,
      `Rewrite a fan-out loop as a bounded worker pool or an errgroup and explain which one the shape calls for.`,
      `Explain a race detector report and point at both access sites.`,
      `Draft a shutdown sequence for a listed set of resources in correct reverse order.`],
    no:[`Decide the concurrency model for a subsystem. That depends on failure behaviour you have to choose deliberately.`,
      `Add a dependency. Make it name the standard library alternative first.`,
      `Declare code race free because the detector was quiet. The detector only sees the paths the test exercised.`] },
  prompts:[{l:'Goroutine ownership review',p:`Here is a Go package that starts goroutines: [PASTE]. For each goroutine, state who starts it, how it learns to stop, who waits for it, and what happens if its work panics. List the leaks, and for each the smallest change that gives it an owner. Do not restructure anything that already has one.`},
    {l:'Shutdown sequence',p:`Our service holds these resources, constructed in this order: [LIST]. Write the shutdown sequence: what is cancelled, what stops accepting work, what drains, and what closes, in order. State what an in-flight request experiences at each step, and which step would drop a request if it were skipped.`}],
  verify:[`Did it point at the actual access sites in a race report, or just restate the report?`,
    `Does every goroutine in its proposal have a caller that waits for it?`,
    `Did it reach for a third party library where the standard library already covers the case?`],
  test:[`Run the race detector over the whole suite in CI, not only over the package you touched.`,
    `Watch the goroutine count on a live instance across a day. A sawtooth is healthy, a staircase is a leak.`,
    `Send a shutdown signal under load and count dropped requests. That number is your deploy cost per release.`],
  rel:[['backend-di-modes','Construction order decides shutdown order, and the wiring layer owns both.'],
    ['ai-for-implementation','Generated Go is where leaked goroutines and unchecked errors arrive fastest.'],
    ['backend-observability','Goroutine and heap profiles are how a leak gets named instead of guessed at.'],
    ['server-realtime-protocol','One goroutine per connection is where these idioms stop being theory.'],
    ['lead-code-review','Most of these are review habits before they are code.']],
  tech:[
    {n:'errgroup for fan-out', how:`Run a set of related tasks, cancel the group when the first returns an error, wait for the rest.`, fit:`A handful of parallel calls where any failure fails the whole action.`, cost:`Unbounded unless you set a limit, so a wide fan-out needs one.`, alt:`A bounded worker pool when the task count is large or unknown.`},
    {n:'Bounded worker pool', how:`A fixed number of workers reading from a channel, with a WaitGroup for completion.`, fit:`Batch jobs over many rows where concurrency must be capped to protect a database.`, cost:`More code than errgroup, and collecting errors is your problem.`, alt:`errgroup with a concurrency limit when you also want first-error cancellation.`},
    {n:'Mutex around shared state', how:`sync.Mutex or RWMutex guarding a structure several goroutines read and write.`, fit:`A matchmaking ticket list, a subscriber set, any small shared collection.`, cost:`Lock scope bugs, and contention under read heavy load if you pick the wrong one.`, alt:`Hand ownership over a channel when the data does not need to be shared at all.`},
    {n:'Generics for utility shapes', how:`Constraint based helpers over numeric or comparable types, written once and used everywhere.`, fit:`Clamp, min and max, slice utilities, weighted selection, chunking.`, cost:`Harder signatures, worse error messages, and a standing temptation to genericize business rules.`, alt:`Concrete versions for the first two call sites. Reach for a generic at the third.`}] });

/* ---------------- ENGINE: how the client consumes this ----------------
   Backend topics have no node or component of their own. The engine tabs
   show the client half of the same contract, because the decision is only
   finished when both ends of it are built. */

ENGINE('backend-layering',{
  godot:{ term:`Godot enforces no package boundary, so layering is a discipline plus a folder rule: one autoload owns the API, plain RefCounted classes hold rules and models, and scenes reach the service only through an injected reference.`,
    api:['Autoload singleton (Project Settings, Globals)','RefCounted','Resource','class_name','signal / await','Node._ready()'],
    snippet:`class_name PlayerGateway extends RefCounted

var _api: ApiClient                       # injected, never looked up

func _init(api: ApiClient) -> void:
\t_api = api

func fetch(id: int) -> Player:
\tvar body := await _api.post("/player/get", {"id": id})
\treturn Player.from_dict(body)         # rows stop here, the scene sees a Player`,
    pitfall:`Reaching for a service with get_node("/root/Api") inside a scene. That scene now depends on the scene tree path of a singleton, so it cannot be run alone in a test scene, and renaming the autoload breaks it at runtime with no compile error anywhere.`,
    map:`A Godot autoload is Unity's composition root, and a RefCounted class is a plain C# class with no engine dependency.` },
  unity:{ term:`Unity enforces layering for real with assembly definitions. Rules and models go in an asmdef that references nothing, the API client in another, MonoBehaviours in a third that references both. A backward reference is then a compile error.`,
    api:['Assembly Definition (.asmdef)','interface + constructor injection','ScriptableObject','MonoBehaviour as an adapter only','UnityWebRequest','RuntimeInitializeOnLoadMethod'],
    snippet:`// Assembly: Game.Domain - references no UnityEngine networking types
public interface IPlayerGateway { Task<Player> FetchAsync(int id, CancellationToken ct); }

public sealed class GetPlayer {
    readonly IPlayerGateway _gateway;
    public GetPlayer(IPlayerGateway gateway) => _gateway = gateway;
    public Task<Player> RunAsync(int id, CancellationToken ct) => _gateway.FetchAsync(id, ct);
}

// Assembly: Game.Infrastructure - implements IPlayerGateway over UnityWebRequest
// Assembly: Game.Presentation   - a MonoBehaviour calls GetPlayer and knows no transport`,
    pitfall:`Leaving everything in Assembly-CSharp, the default assembly. Every script then sees every other script, the layering exists only in folder names, and one edit recompiles the whole project. An asmdef is the only mechanism Unity gives you to make a direction violation fail.`,
    map:`A Unity asmdef reference graph is Go's import graph made explicit, and an asmdef violation is what a depguard lint rule catches server side.` },
  note:`On the server the direction is enforced by the import graph and a lint rule. The client needs the same rule for the same reason: the UI must not know whether a value came from the service, a local cache or a stub, or you cannot build a screen before the endpoint exists.` });

ENGINE('backend-di-modes',{
  godot:{ term:`One autoload is the composition root. It reads the build's feature tags, constructs the API client, the cache and the gateways once, and hands them out. Export presets carry the tags that separate a development build from a store build.`,
    api:['Autoload singleton','OS.has_feature() / OS.is_debug_build()','Export preset custom feature tags','ProjectSettings.get_setting()','Engine.is_editor_hint()','OS.get_environment()'],
    snippet:`extends Node                          # autoload: Boot

var gateway: PlayerGateway

func _ready() -> void:
\tvar base_url := "https://api.example.test"
\tif OS.has_feature("staging"):
\t\tbase_url = "https://staging.example.test"
\tvar api := ApiClient.new(base_url)
\tif OS.is_debug_build():
\t\tapi = LoggingApiClient.new(api)   # one decorator, decided once
\tgateway = PlayerGateway.new(api)`,
    pitfall:`Constructing services in each scene's _ready. Two scenes then hold two API clients with two token caches, and which one refreshed the session depends on load order. Build the graph once in a single autoload and pass it down.`,
    map:`A Godot autoload plus export feature tags is Unity's RuntimeInitializeOnLoadMethod plus scripting define symbols.` },
  unity:{ term:`The composition root is a static bootstrap that runs before the first scene, or a container such as VContainer or Zenject. Build modes come from scripting define symbols resolved at compile time, which is exactly what a Go build tag does.`,
    api:['RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)','Scripting Define Symbols and #if','ScriptableObject config asset','VContainer or Zenject LifetimeScope','Debug.isDebugBuild','Addressables.InitializeAsync()'],
    snippet:`public static class Boot {
    public static IPlayerGateway Gateway { get; private set; }

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
    static void Compose() {
        var cfg = Resources.Load<EnvConfig>("EnvConfig");   // one asset per build
        IApiClient api = new HttpApiClient(cfg.BaseUrl);
#if DEVELOPMENT_BUILD || UNITY_EDITOR
        api = new LoggingApiClient(api);                    // compile time, not runtime
#endif
        Gateway = new PlayerGateway(api);
    }
}`,
    pitfall:`Holding the graph in static fields with Enter Play Mode Options enabled and domain reload disabled. Statics are not reset, so the second play session reuses the first session's client and token. Reset them explicitly in the bootstrap instead of trusting the editor to do it.`,
    map:`Unity scripting define symbols are Go build tags, and a LifetimeScope is the injector that wire generates.` },
  note:`The server picks its graph per process role at build time so a missing binding cannot reach production. The client makes the same move with defines and one composition root, so a debug logger or a stub gateway cannot ship inside a store build by accident.` });

ENGINE('backend-api-protocol',{
  godot:{ term:`HTTPRequest is the node level API for one call at a time, and HTTPClient is the lower level one when you need connection reuse. Protobuf is not built in, so a response arrives as a PackedByteArray and is decoded by a generated script or a GDExtension you now maintain.`,
    api:['HTTPRequest.request_raw()','HTTPRequest.request_completed signal','HTTPClient.METHOD_POST','PackedByteArray','JSON.parse_string()','ProjectSettings.get_setting("application/config/version")'],
    snippet:`@onready var http: HTTPRequest = $HTTPRequest

func post_proto(path: String, payload: PackedByteArray) -> PackedByteArray:
\tvar headers := PackedStringArray([
\t\t"Content-Type: application/x-protobuf",
\t\t"X-Client-Version: " + ProjectSettings.get_setting("application/config/version"),
\t\t"X-Session: " + Session.token,
\t])
\thttp.request_raw("https://api.example.test" + path, headers, HTTPClient.METHOD_POST, payload)
\tvar r: Array = await http.request_completed
\tif r[1] != 200:
\t\tpush_error("api %s failed: %d" % [path, r[1]])
\treturn r[3]`,
    pitfall:`Reusing one HTTPRequest node for overlapping calls. A second request while one is in flight fails outright, and request_completed carries no correlation id, so two awaits on the same node can receive each other's responses. Pool one node per in-flight call, or serialize through a queue.`,
    map:`Godot HTTPRequest is Unity UnityWebRequest, and await request_completed is await SendWebRequest().` },
  unity:{ term:`UnityWebRequest is the transport, with UploadHandlerRaw for the body and DownloadHandlerBuffer for the response. Protobuf messages come from protoc with the C# plugin and the Google.Protobuf runtime, so one schema file generates both ends of the contract.`,
    api:['new UnityWebRequest(url, "POST")','UploadHandlerRaw / DownloadHandlerBuffer','SetRequestHeader()','UnityWebRequest.Result and responseCode','IMessage.ToByteArray() / MessageParser.ParseFrom()','Awaitable or UniTask'],
    snippet:`public async Awaitable<TRes> PostAsync<TRes>(string path, IMessage req,
        MessageParser<TRes> parser, CancellationToken ct) where TRes : IMessage<TRes> {
    using var www = new UnityWebRequest(_baseUrl + path, "POST") {
        uploadHandler = new UploadHandlerRaw(req.ToByteArray()),
        downloadHandler = new DownloadHandlerBuffer(),
        timeout = 15
    };
    www.SetRequestHeader("Content-Type", "application/x-protobuf");
    www.SetRequestHeader("X-Client-Version", Application.version);
    await www.SendWebRequest();
    if (www.result != UnityWebRequest.Result.Success)
        throw new ApiException(www.responseCode, www.error);
    return parser.ParseFrom(www.downloadHandler.data);
}`,
    pitfall:`Not disposing the UnityWebRequest, or letting one outlive the screen that awaited it. On IL2CPP the native handlers are not collected promptly, so a screen that fires a request per frame leaks native memory. Wrap it in using and pass destroyCancellationToken.`,
    map:`Unity UnityWebRequest is Godot HTTPRequest, and the Google.Protobuf generated messages are the same types the Go server marshals.` },
  note:`This is the client half of the protocol decision. One schema file generating the Go types and the C# types turns a renamed field into a build failure on both sides instead of a runtime mismatch. Godot has no first party protobuf, which is itself an argument for JSON on a Godot client, or for accepting a generator you now own.` });

ENGINE('backend-request-context',{
  godot:{ term:`The client side of the middleware chain is one request queue autoload. It attaches the standard headers, refuses to send a second copy of an intent already in flight, and routes maintenance and force update responses to the right screen before any caller sees them.`,
    api:['Autoload singleton','Dictionary of in-flight keys','signal + await','HTTPRequest.request_raw()','SceneTree.create_timer() for backoff','NOTIFICATION_APPLICATION_PAUSED'],
    snippet:`extends Node                              # autoload: Api

var _inflight := {}
signal finished(key: String, body: PackedByteArray)

func call_once(key: String, path: String, payload: PackedByteArray) -> PackedByteArray:
\twhile _inflight.has(key):             # a second tap joins, it does not resend
\t\tvar done: Array = await finished
\t\tif done[0] == key:
\t\t\treturn done[1]
\t_inflight[key] = true
\tvar res: PackedByteArray = await _request(path, payload)
\t_inflight.erase(key)
\tfinished.emit(key, res)
\treturn res`,
    pitfall:`Letting every screen build its own headers. The session token, client version and master version then drift between call sites, and the server's version gate rejects exactly the one screen somebody forgot to update. Attach them in one place at the bottom of the client.`,
    map:`A Godot request queue autoload is Unity's request pipeline class, and the in-flight dictionary is the server's duplicate gate moved one hop earlier.` },
  unity:{ term:`One API client owns the pipeline: headers, cancellation, retry with backoff, and a dictionary of in-flight keys so a double tap joins the running call instead of issuing a second one. CancellationToken is the client's context.`,
    api:['CancellationToken / MonoBehaviour.destroyCancellationToken','Dictionary<string, Task<T>>','CancellationTokenSource.CreateLinkedTokenSource()','UnityWebRequest.SetRequestHeader()','TaskScheduler.FromCurrentSynchronizationContext()','Application.version'],
    snippet:`readonly Dictionary<string, Task<byte[]>> _inflight = new();

public Task<byte[]> CallOnce(string key, string path, byte[] body, CancellationToken ct) {
    if (_inflight.TryGetValue(key, out var running)) return running;  // join, do not resend
    var task = SendAsync(path, body, ct);
    _inflight[key] = task;
    task.ContinueWith(_ => _inflight.Remove(key),
        TaskScheduler.FromCurrentSynchronizationContext());
    return task;
}`,
    pitfall:`Starting a request from a MonoBehaviour without passing destroyCancellationToken. The screen closes, the response arrives, the continuation touches a destroyed object, and you get a MissingReferenceException that only reproduces on a slow connection.`,
    map:`A Unity CancellationToken is Go's context.Context, and destroyCancellationToken is the request context cancelled when the caller hangs up.` },
  note:`The server gate is the last line of defence and the client gate is the cheap one. Deduplicating at the tap, attaching headers in one place and cancelling on screen close removes most duplicate requests before they cost a round trip, which matters more on a mobile network than it does on the server.` });

ENGINE('backend-errors',{
  godot:{ term:`request_completed hands back a transport result, an HTTP status and the body. The client's job is to turn the server's numeric code into one of a few outcomes: retry quietly, show a localized dialog, send the player to the store, or drop to the title screen.`,
    api:['HTTPRequest.request_completed(result, response_code, headers, body)','HTTPRequest.RESULT_SUCCESS / RESULT_CANT_CONNECT','match statement','push_error() / push_warning()','TranslationServer.translate()','AcceptDialog'],
    snippet:`func handle(transport: int, code: int) -> void:
\tif transport != HTTPRequest.RESULT_SUCCESS:
\t\t_retry_with_backoff()                  # a transport failure is worth retrying
\t\treturn
\tmatch code:
\t\t0:
\t\t\treturn
\t\t1001, 1002:                            # session gone
\t\t\tSession.clear()
\t\t\tget_tree().change_scene_to_file("res://ui/title.tscn")
\t\t4000:
\t\t\t_show_store_dialog()
\t\t_:
\t\t\t_dialog(TranslationServer.translate("err_%d" % code))`,
    pitfall:`Treating a transport failure and an application error as one case. A connection failure is worth retrying, while a 200 response carrying code 1001 means the session is gone and retrying loops forever. Branch on the transport result first, then on the domain code.`,
    map:`The Godot match on a domain code is the mirror of the table the Go handler uses to map that code to a status and a payload.` },
  unity:{ term:`UnityWebRequest.Result separates connection, protocol and data errors from a successful call carrying a domain error in its payload. The client keeps one table from code to behaviour, and throws a typed exception so callers catch only what they can handle.`,
    api:['UnityWebRequest.Result (ConnectionError, ProtocolError, Success)','UnityWebRequest.responseCode','a custom Exception subclass','catch ... when filters','LocalizationSettings.StringDatabase','Application.OpenURL()'],
    snippet:`try {
    var res = await _api.PostAsync("/shop/buy", req, Buy.Response.Parser, ct);
    _view.Apply(res);
} catch (ApiException e) when (e.Code == ErrorCode.ForceUpdate) {
    Application.OpenURL(_storeUrl);
} catch (ApiException e) when (e.Code == ErrorCode.SessionExpired) {
    await _session.ReloginAsync(ct);
} catch (ApiException e) {
    _dialog.Show(_strings.Localized("err_" + (int)e.Code));   // unknown codes still land
}`,
    pitfall:`Catching Exception around the whole call and showing one generic dialog. Every failure then looks identical to the player and to your crash reporting, so a session expiry and a server outage produce the same support ticket. Filter on the domain code and count what falls through.`,
    map:`A Unity exception filter on a domain code is Go's errors.As at the handler boundary.` },
  note:`The taxonomy the server designs is only worth anything if the client branches on it. Agreeing the code blocks and their client behaviour in one document is what stops the client from matching on error message text, which breaks the first time a string is localized.` });

ENGINE('backend-data-access',{
  godot:{ term:`The client's store is a dictionary of tables held in an autoload and persisted to user:// with FileAccess. A delta response replaces whole tables by name, so applying a response is a merge over keys rather than a field by field patch.`,
    api:['FileAccess.open("user://state.dat", FileAccess.WRITE)','FileAccess.store_var() / get_var()','var_to_bytes() / bytes_to_var()','DirAccess','ConfigFile','NOTIFICATION_APPLICATION_PAUSED'],
    snippet:`extends Node                          # autoload: Store
var tables := {}                      # table name -> Array of rows
var generation := 0
var _dirty := false

func apply_delta(delta: Dictionary, gen: int) -> void:
\tfor name in delta:
\t\ttables[name] = delta[name]    # the server sends whole tables, never patches
\tgeneration = gen
\t_dirty = true

func flush() -> void:                 # called on pause, not on every apply
\tif not _dirty: return
\tFileAccess.open("user://state.dat", FileAccess.WRITE).store_var(tables)
\t_dirty = false`,
    pitfall:`Saving on every apply. store_var writes synchronously, so a busy screen stutters on a phone's storage. Mark the store dirty and flush on a timer or when the app is backgrounded, and write to a temporary file before replacing the real one.`,
    map:`Godot user:// with store_var is Unity's Application.persistentDataPath with a binary writer.` },
  unity:{ term:`A local store keyed by table name, serialized into Application.persistentDataPath, plus the generation counter sent on every request so the server knows what this client is missing. PlayerPrefs is for settings, never for game state.`,
    api:['Application.persistentDataPath','File.WriteAllBytes / File.Replace','Dictionary<string, object> of tables','JsonUtility or Google.Protobuf serialization','OnApplicationPause / OnApplicationFocus','PlayerPrefs for settings only'],
    snippet:`public sealed class LocalStore {
    readonly Dictionary<string, object> _tables = new();
    public int Generation { get; private set; } bool _dirty;
    public void ApplyDelta(IReadOnlyDictionary<string, object> delta, int generation) {
        foreach (var pair in delta) _tables[pair.Key] = pair.Value;   // whole tables
        Generation = generation;
        _dirty = true;
    }
    public void FlushIfDirty() {                       // called from OnApplicationPause
        if (!_dirty) return;
        var tmp = Path.Combine(Application.persistentDataPath, "state.tmp");
        File.WriteAllBytes(tmp, Serialize());
        File.Replace(tmp, _statePath, _backupPath);    // atomic, with a fallback copy
        _dirty = false; }
}`,
    pitfall:`Writing the save file in place. A process kill during the write leaves a truncated file and the player loses everything local, including the generation counter, which turns the next login into a full resync at best.`,
    map:`Unity Application.persistentDataPath is Godot user://, and the generation counter is the same integer the Go handler reads out of the request header.` },
  note:`Delta sync only works when both ends agree what a table is and who owns the generation counter. The client sends what it has, the server returns exactly the tables that changed, and the client replaces them wholesale. Patching individual fields on the client is where the two copies quietly diverge.` });

ENGINE('backend-caching-redis',{
  godot:{ term:`Master data is downloaded once per version and cached in user://, keyed by the version string the server returns in a header. ResourceLoader's cache covers packed assets, but downloaded game data needs a keyed store you write yourself.`,
    api:['FileAccess.file_exists() / store_var() / get_var()','DirAccess.remove_absolute()','ResourceLoader.load() / has_cached()','HTTPRequest.download_file','user:// path','Time.get_unix_time_from_system()'],
    snippet:`func load_master(version: String) -> Dictionary:
\tvar path := "user://master_%s.dat" % version
\tif FileAccess.file_exists(path):
\t\treturn FileAccess.open(path, FileAccess.READ).get_var()
\tvar body := await Api.call_once("master", "/master/get", PackedByteArray())
\tvar data: Dictionary = bytes_to_var(body)
\tFileAccess.open(path, FileAccess.WRITE).store_var(data)
\t_prune_other_versions(version)     # older versions died the moment this landed
\treturn data`,
    pitfall:`Caching master data under a fixed filename. A new release then reads the previous version's tables with the new client's code, and the mismatch surfaces as a missing item id rather than as a cache problem. Put the version in the key so a new release is a miss by construction.`,
    map:`A version keyed file in user:// is the client's copy of the server's in-process master data cache, with the same invalidation rule.` },
  unity:{ term:`Addressables with a remote catalog is the built-in version of this: the catalog hash decides whether a cached bundle is reused, and Caching.ClearCache is the escape hatch. Downloaded data tables follow the same rule, keyed by the master version header.`,
    api:['Addressables.LoadContentCatalogAsync()','Addressables.GetDownloadSizeAsync() / DownloadDependenciesAsync()','Caching.ClearCache()','Application.persistentDataPath','Dictionary in-memory tier','File.Exists / ReadAllBytes'],
    snippet:`public async Awaitable<MasterData> LoadAsync(string version, CancellationToken ct) {
    if (_memory.TryGetValue(version, out var hot)) return hot;            // tier 1: process
    var path = Path.Combine(Application.persistentDataPath, "master_" + version + ".bin");
    if (File.Exists(path))
        return _memory[version] = Parse(File.ReadAllBytes(path));         // tier 2: disk
    var bytes = await _api.GetAsync("/master/get", ct);                   // tier 3: network
    File.WriteAllBytes(path, bytes);
    PruneOtherVersions(version);
    return _memory[version] = Parse(bytes);
}`,
    pitfall:`Assuming the device has room. Addressables and a hand rolled cache fail differently when storage is full, and on mobile that is common. Check the download size before starting, and let a failed write fall back to the network instead of throwing on the next read.`,
    map:`Unity Addressables catalog versioning is the same idea as keying a server side cache by the master data version.` },
  note:`The server caches master data in process because it is immutable between releases. The client does exactly the same thing one tier further out, for the same reason. The shared rule is that the version string is part of the key, so a release invalidates everything without anyone writing invalidation code.` });

ENGINE('backend-migrations-config',{
  godot:{ term:`The client's migration problem is the save file. Every persisted structure carries a version integer, and load runs the upgrade steps in order before the game sees the data. Environment settings live in an exported resource or a feature tag, and secrets live nowhere.`,
    api:['FileAccess.store_var() with a version field','ConfigFile.load() / set_value()','Resource with @export','ProjectSettings.get_setting()','OS.has_feature() export tags','DirAccess.copy_absolute() for the backup'],
    snippet:`const SAVE_VERSION := 4

func load_save() -> Dictionary:
\tvar f := FileAccess.open("user://save.dat", FileAccess.READ)
\tif f == null:
\t\treturn _new_save()
\tvar data: Dictionary = f.get_var()
\tvar v: int = data.get("version", 1)
\twhile v < SAVE_VERSION:
\t\tdata = _steps[v].call(data)       # one step per version, applied in order
\t\tv += 1
\tdata["version"] = SAVE_VERSION
\treturn data`,
    pitfall:`Overwriting the save with the migrated version before the game has proved it can load it. If step three has a bug the original is already gone. Keep the pre-migration file until a session completes, and ship the migration one release before the code that requires it.`,
    map:`The client's save version chain is the goose migration history with one user, no operator watching and no rollback window.` },
  unity:{ term:`The same shape: a version field on the serialized root, upgrade steps run on load, and an environment config as a ScriptableObject asset selected per build. Secrets do not belong in a client build at all, because an installable package is a zip file.`,
    api:['[Serializable] root with a version field','JsonUtility.FromJson / ToJson','ScriptableObject config asset per environment','File.Replace for atomic writes','Application.version / Application.buildGUID','ISerializationCallbackReceiver'],
    snippet:`public static SaveRoot Load(byte[] raw) {
    var node = JsonUtility.FromJson<SaveRoot>(Encoding.UTF8.GetString(raw));
    for (var v = node.version; v < SaveMigrations.Current; v++)
        node = SaveMigrations.Steps[v](node);      // one step per version, in order
    node.version = SaveMigrations.Current;
    return node;
}

// EnvConfig is a ScriptableObject: base url, log level, feature switches.
// It never holds a credential. The client receives a session token and nothing else.`,
    pitfall:`Shipping an API key inside a ScriptableObject or a const string. Anyone can unpack the build and read it, every installed copy carries the same key, and rotating it breaks every player at once. The client gets a short lived session token from the server and never a service credential.`,
    map:`A per environment ScriptableObject is the server's embedded YAML environment block, and the save version chain is its migration history.` },
  note:`The server migrates its schema once, in one place, with an operator watching. The client cannot: every device migrates itself, offline, once, with no rollback. That asymmetry is why client save formats grow additively and why a failed client migration must leave the previous file intact.` });

ENGINE('backend-observability',{
  godot:{ term:`The client's telemetry is a small autoload that batches structured events and posts the things the server cannot see: screen entries, failed requests, and frame time on the device the player actually owns.`,
    api:['print_debug() / push_warning() / push_error()','Performance.get_monitor(Performance.TIME_FPS)','OS.get_model_name() / OS.get_name()','OS.is_debug_build()','Time.get_unix_time_from_system()','FileAccess for a local log file'],
    snippet:`extends Node                        # autoload: Telemetry

var _buffer: Array[Dictionary] = []

func event(name: String, fields: Dictionary = {}) -> void:
\tfields["ev"] = name
\tfields["t"] = Time.get_unix_time_from_system()
\tfields["fps"] = Performance.get_monitor(Performance.TIME_FPS)
\tfields["dev"] = OS.get_model_name()
\tfields["req"] = Api.last_request_id     # joins this event to a server log line
\t_buffer.append(fields)
\tif _buffer.size() >= 50:
\t\t_flush()                            # batched, never one request per event`,
    pitfall:`Leaving print() calls in a release build. The string formatting and the operating system write still happen on every call, and on a phone that shows up as a frame spike in exactly the busy scene you were instrumenting. Gate verbose logging behind OS.is_debug_build().`,
    map:`A Godot telemetry autoload is Unity's log callback plus a batching event sender, and both are the client end of the server's action log stream.` },
  unity:{ term:`Unity gives you a log callback that fires for every Debug.Log and every unhandled exception, from whichever thread logged it. That hook, plus a batching event sender and the Profiler counters, is the client half of observability.`,
    api:['Application.logMessageReceivedThreaded','Debug.LogError / Debug.LogException','UnityEngine.Profiling.Profiler.BeginSample()','SystemInfo.deviceModel / graphicsDeviceName','Time.unscaledDeltaTime','Application.persistentDataPath for a local log'],
    snippet:`void OnEnable()  => Application.logMessageReceivedThreaded += OnLog;
void OnDisable() => Application.logMessageReceivedThreaded -= OnLog;

void OnLog(string message, string stack, LogType type) {
    if (type != LogType.Exception && type != LogType.Error) return;
    _queue.Enqueue(new CrashEvent {          // threaded: no Unity API calls in here
        Message = message, Stack = stack,
        Device = _deviceModel,               // cached earlier on the main thread
        Version = _appVersion,
        RequestId = _lastRequestId           // joins to the server's log line
    });
}`,
    pitfall:`Calling Unity API inside the threaded log callback. It runs on whichever thread logged, so touching SystemInfo, a GameObject or PlayerPrefs there throws or corrupts state, and the crash you were trying to report becomes a second crash.`,
    map:`Application.logMessageReceivedThreaded is the client's error log stream, and the request id field is what joins it to the server's.` },
  note:`Half of any production incident lives on the client. Putting the server's request id into the client's crash report, and the client's session id into the server's log, is what lets one query answer what the player saw and what the service did, instead of two teams comparing timestamps.` });

ENGINE('backend-testing',{
  godot:{ term:`Godot ships no official test framework, so teams use GUT or gdUnit4 and run them headless from the command line in CI. The structure is the same as the server's: pure logic tested directly, gateways replaced by a stub, scene tests only where the tree is the thing under test.`,
    api:['godot --headless --script for the CI entry point','GUT or gdUnit4 test scripts','assert_eq / assert_true','RefCounted doubles injected through _init','var_to_bytes() for fixtures','SceneTree.create_timer() for time control'],
    snippet:`extends GutTest

class StubApi extends RefCounted:
\tvar body: PackedByteArray
\tfunc post(_path: String, _payload: PackedByteArray) -> PackedByteArray:
\t\treturn body

func test_gateway_maps_rows_to_player() -> void:
\tvar stub := StubApi.new()
\tstub.body = var_to_bytes({"id": 7, "name": "ada"})
\tvar player: Player = await PlayerGateway.new(stub).fetch(7)
\tassert_eq(player.id, 7)
\tassert_eq(player.name, "ada")`,
    pitfall:`Writing every test as a scene test. Instancing scenes is slow, _ready side effects fire, and a failure tells you a node was null rather than which rule broke. Keep rules in RefCounted classes a test can construct in one line.`,
    map:`A RefCounted stub injected through _init is the same hand written fake a Go interactor test uses instead of a generated mock.` },
  unity:{ term:`Unity Test Framework with NUnit, split into EditMode tests for pure logic and PlayMode tests for anything that needs the player loop. If the rules assembly has no UnityEngine dependency, its tests run in milliseconds in EditMode.`,
    api:['[Test] and [UnityTest] attributes','Assert.That / Is.EqualTo','a test .asmdef referencing the rules asmdef','UnityEngine.TestTools.LogAssert','NSubstitute or a hand written fake','[SetUp] / [TearDown]'],
    snippet:`public class GetPlayerTests {
    sealed class StubGateway : IPlayerGateway {
        public Player Next;
        public Task<Player> FetchAsync(int id, CancellationToken ct) => Task.FromResult(Next);
    }

    [Test]
    public async Task Returns_the_player_the_gateway_gave() {
        var stub = new StubGateway { Next = new Player(7, "ada") };
        var result = await new GetPlayer(stub).RunAsync(7, CancellationToken.None);
        Assert.That(result.Id, Is.EqualTo(7));
    }
}`,
    pitfall:`Keeping the rules in Assembly-CSharp and then testing them from PlayMode. Every run boots the player loop and loads a scene, so a hundred rule tests take minutes and nobody runs them before pushing. The asmdef split is what makes the fast tier fast.`,
    map:`Unity EditMode tests are Go unit tests, PlayMode tests are the integration tier, and the protocol suite is the end to end tier on both sides.` },
  note:`Both clients face the server's integrity rule in a sharper form. A test whose expected value came from a recorded server response tests the recording, not the rule. Derive it from master data or from the specification, and keep a fake gateway a designer can point at a scenario file.` });

ENGINE('backend-go-idioms',{
  godot:{ term:`Godot's concurrency is coroutines over signals plus explicit threads. await suspends a function until a signal fires, WorkerThreadPool runs real work off the main thread, and anything touching the scene tree from a thread has to go back through call_deferred.`,
    api:['await signal / await get_tree().create_timer()','WorkerThreadPool.add_task() / wait_for_task_completion()','Thread and Mutex','Object.call_deferred()','is_instance_valid()','Node.queue_free()'],
    snippet:`var _cancelled := false

func load_and_show(path: String) -> void:
\tvar id := WorkerThreadPool.add_task(_parse.bind(path))
\tWorkerThreadPool.wait_for_task_completion(id)
\tif _cancelled or not is_instance_valid(self):   # the screen may already be gone
\t\treturn
\t_apply.call_deferred(_result)                   # tree work back on the main thread

func _exit_tree() -> void:
\t_cancelled = true                               # the only way the task learns to stop`,
    pitfall:`Awaiting a signal on a node that is freed while you are suspended. Execution resumes on a freed object and the error points at the resume site, nowhere near the cause. Check is_instance_valid after any await that can outlive the node.`,
    map:`Godot await on a signal is Go receiving on a channel, and is_instance_valid after an await is checking whether the context was cancelled while you were blocked.` },
  unity:{ term:`Unity 6 gives you Awaitable for main thread friendly async and destroyCancellationToken on every MonoBehaviour, so an await that outlives its object is cancelled rather than resuming into a destroyed reference. UniTask is the established alternative with allocation free awaiters.`,
    api:['Awaitable / Awaitable.MainThreadAsync() / NextFrameAsync()','MonoBehaviour.destroyCancellationToken','CancellationTokenSource.CreateLinkedTokenSource()','UniTask and UniTask.WhenAll','Task.Run for genuine background work','CancellationToken.ThrowIfCancellationRequested()'],
    snippet:`async Awaitable LoadAndShow(string path) {
    var ct = destroyCancellationToken;              // cancelled when this object dies
    var bytes = await Task.Run(() => File.ReadAllBytes(path), ct);
    ct.ThrowIfCancellationRequested();
    await Awaitable.MainThreadAsync();              // back before touching any Unity API
    _view.Apply(Parse(bytes));
}

// Never async void here. An exception inside async void cannot be caught by the
// caller, so the failure vanishes and the screen sits on a spinner forever.`,
    pitfall:`Using async void for anything but an event handler. The exception cannot be observed by the caller, so a failed request disappears with no log and no dialog, and the only symptom is a loading spinner that never ends.`,
    map:`destroyCancellationToken is Go's request context, and Awaitable.MainThreadAsync is posting a result back to the goroutine that owns the state.` },
  note:`Both sides solve goroutine ownership with different vocabulary. The server asks who waits for this goroutine, the client asks what cancels this await when the screen closes. A leaked coroutine on a phone shows up as a frozen UI rather than a climbing goroutine count, which makes it harder to see and no less common.` });

/* ---------------- INTERVIEW ---------------- */

INTERVIEW('backend-layering',{
  junior:[
    { q:`What does clean layering mean in a Go service, and which way do imports point?`,
      a:`Name the rings: entities and rules at the centre, use cases around them, adapters outside, wiring at the edge. Imports point inward only. Then name the consequence you actually care about, which is that a rule test runs with no database. Finish with the enforcement, an import graph check or a depguard rule in golangci-lint, because a rule nobody enforces is a diagram.`,
      follow:`Where does the interface live: next to the code that needs it, or next to the code that implements it?`,
      red:`Recites the ring diagram from a book and cannot say what breaks when the direction is violated.` },
    { q:`Your interactor needs to read a player row. Describe the shape of that dependency.`,
      a:`An interface declared in the use case package with only the methods this interactor calls, a struct field holding it, and a constructor that takes it. The adapter package implements it. The wiring package is the only place that knows both. Point out that the interface is small precisely because the consumer wrote it.`,
      follow:`The repository already exposes forty methods. Why not depend on that directly?`,
      red:`Imports the repository package and calls it injection because the struct has a field.` },
    { q:`What is wrong with letting the database row struct be your domain entity?`,
      a:`It drags storage tags and storage nullability into the rules, so a schema change reaches code that has nothing to do with storage, and a rule test now needs a row shape. Say the cost of the alternative honestly: a second struct and a mapping function per entity, which is real work.`,
      follow:`When would you accept the coupling anyway?`,
      red:`Says mapping is boilerplate and therefore always wrong, with no account of what the coupling costs.` }
  ],
  mid:[
    { q:`You join a service where handlers build SQL directly. How do you get to layering without a rewrite?`,
      a:`Do not rewrite. Take the next feature, define its port, implement one adapter, wire it, leave everything else alone. Add the lint rule scoped to the new packages so the boundary cannot regress. Convert opportunistically after that, and say what evidence would tell you to stop converting.`,
      follow:`How do you stop the two styles living side by side forever?`,
      red:`Proposes a big-bang refactor across the whole service, or adds a layer that only forwards.` },
    { q:`How do you tell a layer that earns its keep from one that does not?`,
      a:`Read the diffs. A real layer changes for its own reasons and translates something: types, errors, or a transaction boundary. A pass-through layer changes only when its neighbours change and carries the same signatures. Say you would look at the last ten commits rather than argue from principle.`,
      follow:`You find a pass-through layer spanning two hundred files. Do you delete it?`,
      red:`Defends the layer because the architecture calls for it, without looking at what it does.` },
    { q:`How would you make a layering rule survive a team of fifteen?`,
      a:`Write it once, short, next to the code. Encode it as an import allow list so a violation fails CI. Look at the import graph on a cadence. Say plainly that the enforcement matters more than the document, because a document loses to a deadline every time.`,
      follow:`Someone needs to violate it for a genuine reason. What is the process?`,
      red:`Answers with review vigilance and names no mechanism.` }
  ],
  senior:[
    { q:`When would you not use clean layering?`,
      a:`Small services, admin tools, anything under a dozen endpoints where a transaction script is the honest shape. Name the signal to switch: a rule implemented twice, or a test that needs infrastructure to check arithmetic. The answer should name a condition, not a preference.`,
      follow:`You chose transaction script and the service grew. What do you extract first?`,
      red:`Says clean architecture always, or never, with no condition attached.` },
    { q:`Tell me about a change where the layering paid off, or cost you.`,
      a:`Pick one concrete change: a storage swap, a protocol change, a cache inserted in front of a hot table. Say how many packages it touched and why. If it cost you, name the boundary that was ceremony and what you did about it. Either answer is fine. An answer with no number is not.`,
      follow:`What would you do differently at the start of that project?`,
      red:`Talks about maintainability in the abstract with no change they can point at.` }
  ] });

INTERVIEW('backend-di-modes',{
  junior:[
    { q:`What does google/wire do, and what does it not do?`,
      a:`It generates the constructor call graph at build time from provider sets you declare. Nothing runs at runtime, there is no reflection and no container object. Say the payoff, a missing binding is a compile error, and the cost, a generate step plus a large generated file in review.`,
      follow:`What happens if you edit the generated file by hand?`,
      red:`Calls it a dependency injection container and cannot say when the failure occurs.` },
    { q:`What is a provider, and why should a provider not open a database connection?`,
      a:`A provider is a constructor wire can call. If it opens a connection then building the graph does I/O, so a test that wants one interactor boots the world and a wiring failure is really an infrastructure failure. Return the struct, expose a start step and a cleanup func, and let main decide when to connect.`,
      follow:`Where does the connection actually open then?`,
      red:`Sees no difference between constructing an object and starting it.` },
    { q:`One binary boots as an API server or as a batch job depending on a flag. Why do that?`,
      a:`One module, one set of entities and interactors, so the nightly job and the request path cannot drift. Each role gets its own injector and builds only what it needs. Say the cost too: every image carries every role.`,
      follow:`When would you split them into separate binaries instead?`,
      red:`Thinks the flag changes behaviour inside a request rather than selecting a process role.` }
  ],
  mid:[
    { q:`How do you keep twenty batch binaries from becoming twenty mysteries?`,
      a:`A header comment on each stating its schedule, whether it is cron driven or manual recovery only, and whether it is safe to re-run. One injector per binary so its dependencies are visible. Startup logging listing what it opened. Say that the binary list is operational documentation and should be reviewed like one.`,
      follow:`One has been failing silently for a month. How would you have found out sooner?`,
      red:`Answers only about code structure and never mentions schedule, ownership or alerting.` },
    { q:`Your wire build fails with a terse error. Walk me through the diagnosis.`,
      a:`Read which type it cannot provide and which injector needed it. Find the provider set that should carry it. Check whether the binding is interface to implementation and whether the bind declaration is present. Fix the declaration file, never the generated one, regenerate, and keep the generate step in CI so a stale file cannot merge.`,
      follow:`Two providers return the same type. What now?`,
      red:`Edits the generated file to make the build pass.` },
    { q:`How does shutdown work in a service wired this way?`,
      a:`Every resource provider returns a cleanup func, the injector returns the server plus an aggregated cleanup, and main creates a cancellable context and defers both. Stop accepting before closing pools. Say that reverse construction order is the default you deviate from consciously, not by accident.`,
      follow:`What does an in-flight request experience at each step?`,
      red:`Relies on process exit to release resources.` }
  ],
  senior:[
    { q:`Compile-time DI or manual wiring for a new service. Argue both, then choose.`,
      a:`Manual wiring is fine up to roughly thirty dependencies with one or two roles, and it has no generate step. Codegen pays off with many roles and a graph nobody holds in their head, and it turns a runtime failure into a build failure. Choose by counting roles and asking who edits main, then say what would make you revisit.`,
      follow:`You chose manual. At what point do you migrate, and how painful is it?`,
      red:`Chooses by taste, or claims a reflection container is equivalent.` },
    { q:`You inherit a service where every role builds every dependency. What is the plan?`,
      a:`Measure first: what does each role open at startup that it never uses. Split provider sets by concern rather than by convenience. Move one role at a time, and assert startup connections in a test so the split cannot silently regress. Justify it with startup time, blast radius and the ability to reason about a batch job.`,
      follow:`How would you prove the split actually reduced anything?`,
      red:`Starts by rewriting the wiring layer wholesale with no measurement.` }
  ] });

INTERVIEW('backend-api-protocol',{
  junior:[
    { q:`REST with JSON, protobuf over HTTP, or gRPC. What are you choosing between?`,
      a:`Three axes: whether the schema is generated or merely documented, how large the payload is, and what the transport demands from your infrastructure. JSON is readable and untyped, protobuf over HTTP is typed and compact and still ordinary HTTP, gRPC adds streaming and deadlines and wants HTTP/2 end to end. Then pick one for a mobile client and say why.`,
      follow:`Which of the three is easiest to debug at 3am, and what do you build for the others?`,
      red:`Picks gRPC because it is modern, with no mention of client support or proxies.` },
    { q:`Why can you never reuse a protobuf field number?`,
      a:`The number is the wire identity. An old client decodes by number, so a reused number means bytes of one meaning are read as another, silently, with no error anywhere. State the rule: add fields, never renumber, mark removed numbers reserved.`,
      follow:`What does reserved actually protect you from?`,
      red:`Talks about field names and does not know the number is what travels.` },
    { q:`Where does the client version live in your protocol?`,
      a:`In a header, checked by middleware, with an allow list of paths that must work on an old client, starting with the force update endpoint itself. Say why not the URL: you would have to version every path, and a client that cannot reach the update prompt is a dead install.`,
      follow:`A client is three versions old and the update is not live in its region yet. Now what?`,
      red:`Has never considered which endpoints must survive the version gate.` }
  ],
  mid:[
    { q:`You need to add a field to a live response. Walk me through shipping it safely.`,
      a:`Add it as a new optional field with a new number, deploy the server first, let old clients ignore it, then ship the client that reads it. Nothing renumbered, nothing removed. Say how you verify: run the previous client build against the new server in CI.`,
      follow:`Now you need to remove a field instead. Same question.`,
      red:`Deploys client and server together and calls that the plan.` },
    { q:`Your payloads are binary and support cannot read them. What do you build?`,
      a:`A decoder tool checked into the repository that turns a captured payload into readable text, plus a JSON path through the same handlers for admin tooling. Say that this is a cost of the binary choice and should be budgeted when you make the choice, not after the first incident.`,
      follow:`Where do you capture the payload from, given it may contain player data?`,
      red:`Says they would attach a debugger, or that binary payloads are fine because tests pass.` },
    { q:`How do generated message types interact with your layering?`,
      a:`They stop at the boundary. The handler maps a generated message to a domain entity and back, so a protocol change never reaches an interactor. Name the cost, one mapping function per message, and the payoff, that the protocol and the rules version independently.`,
      follow:`Someone proposes using generated types as the domain model to skip the mapping. Your response?`,
      red:`Passes generated messages down into use cases and sees no problem with it.` }
  ],
  senior:[
    { q:`You are starting a new mobile title. Take me through the protocol decision.`,
      a:`Start from the client engine and its network stack, because that bounds the options before anything else. Then payload size on a mobile connection, then what operations can actually run, then debuggability. Land on a choice, name the cost you accepted and the tooling you will build to cover it, and say what evidence would make you revisit.`,
      follow:`The engine has no maintained protobuf plugin. Does that decide it?`,
      red:`Gives a general ranking of protocols and never mentions the client.` },
    { q:`Describe a compatibility break you shipped and what it cost.`,
      a:`One concrete break: a renumbered field, a narrowed enum, a removed endpoint. What players saw, how long the window was, how you detected it. Then the process change: the old-client test in CI, or a schema review checklist. An honest answer here beats a clean record.`,
      follow:`What would have caught it before release?`,
      red:`Claims to have never broken compatibility and cannot name the guard that prevents it.` }
  ] });

INTERVIEW('backend-request-context',{
  junior:[
    { q:`What goes on a context.Context, and what must never go on one?`,
      a:`Request scoped values: request id, player, session, locale, client version, a logging handle, a trace transaction, plus cancellation and deadlines. Never a database handle, an open transaction, or optional parameters you did not want to type. Say why: the context is copied and passed everywhere, so anything with a lifetime becomes uncontrolled.`,
      follow:`Why a private key type instead of a string?`,
      red:`Uses the context as a general purpose bag and cannot name something that does not belong.` },
    { q:`A player double taps buy on a bad connection. What happens in your service?`,
      a:`Describe the gate: an add-if-absent key of player plus method plus path with a short window, checked before the write. The first request wins, the rest get a defined answer, either a rejection or a replay of the stored result. Say which you would choose for a purchase and why.`,
      follow:`The first request commits and then times out before the response. What does the retry see?`,
      red:`Says the client should not retry, or places the check after the write.` },
    { q:`Give me the order of a middleware chain and defend two of the positions.`,
      a:`Recover, request id and logging, trace, maintenance gate, client version gate, session auth, ban check, duplicate gate, handler. Defend maintenance before auth, because an expired session should still see the maintenance screen. Defend version gate before auth, because an old client needs an update prompt rather than a login error.`,
      follow:`Which stages still have to run when an earlier one rejected?`,
      red:`Lists the stages with no reasoning about order.` }
  ],
  mid:[
    { q:`How do you pick the idempotency window?`,
      a:`From the client's retry policy and from what the action means. Too short and a genuine retry applies twice, too long and a legitimate repeat is blocked. Say it is per endpoint, that a purchase deserves a client supplied intent id rather than a time window, and that a unique constraint is the real guarantee wherever the action has a natural identity.`,
      follow:`The cache holding the gate goes down. What happens?`,
      red:`Proposes one global window for everything and never mentions the storage layer.` },
    { q:`What is a per request memo cache for, and how does it hurt you when it is wrong?`,
      a:`It removes duplicate reads inside one handler when several interactors want the same row. It must be created and flushed by the same middleware. If it is not flushed it becomes a process cache with no invalidation, and you get a request acting on another request's data.`,
      follow:`How would you measure whether it is earning anything?`,
      red:`Cannot distinguish it from the distributed cache.` },
    { q:`A client disconnects mid request. What should the server do?`,
      a:`The request context is cancelled, so queries that honour cancellation stop and the connection is released. Then say what is not automatic: a handler that ignores the context, and a write that already committed. Cancellation is a cost saving, not a correctness mechanism.`,
      follow:`Should a write in progress be rolled back because the client left?`,
      red:`Assumes cancellation undoes work that already committed.` }
  ],
  senior:[
    { q:`Design duplicate protection for a purchase flow across two devices.`,
      a:`A client supplied intent id, an outcome stored against it, and a replay on repeat. Add a unique constraint on the natural identity so the database is the final authority. Decide what the second device sees while the first is in flight. Name the failure you are accepting, because there is always one.`,
      follow:`What does the player see if the outcome store lost the record?`,
      red:`Relies on a cache alone and treats the database constraint as optional.` },
    { q:`Your team keeps adding context keys. How do you keep that under control?`,
      a:`Typed accessors in one package, one file listing every key with an owner, and a rule that a key needs a request scoped justification. Review the list on a cadence and delete what nothing reads. Name the real failure mode: a key nobody sets, and a zero value that looks plausible.`,
      follow:`How would you catch a key that a middleware quietly stopped setting?`,
      red:`Adds keys freely and relies on people remembering what is there.` }
  ] });

INTERVIEW('backend-errors',{
  junior:[
    { q:`Explain errors.Is versus errors.As.`,
      a:`errors.Is walks the wrap chain comparing against a sentinel value. errors.As walks it looking for a type it can assign into, which is how you pull a domain error out at the boundary. Both need the chain intact, so wrapping has to preserve the cause rather than formatting it into a string.`,
      follow:`Which one gets a code out of an error, and why not a plain type assertion?`,
      red:`Compares errors with equality or matches on the message text.` },
    { q:`What belongs in an error the client sees?`,
      a:`A stable numeric code, an HTTP status, and something the client can localize. Not the internal message, not a table name, not a file path. Say why: the wire error is part of your API, and a leaked internal string is a security problem and a compatibility problem at the same time.`,
      follow:`The client needs to tell the player which item failed. How does that travel?`,
      red:`Returns the raw error text to the client and calls it a message.` },
    { q:`Why capture a stack at the wrap site?`,
      a:`Because a log line tells you where the error was printed, not where it started. Capturing once, at the first wrap, gives you the origin. Name the cost, an allocation per wrapped error, and say why you capture at the first wrap rather than at every one.`,
      follow:`Where do you log it, and how many times?`,
      red:`Logs the error at every level on the way up and sees no problem.` }
  ],
  mid:[
    { q:`Design a code taxonomy for a game backend.`,
      a:`Blocks per subsystem, a thousand apart, with the table in one file. Each code carries a status, a client behaviour and a meaning. Mark which codes the client branches on. Then say what stops it rotting: an owner, a review rule, and a check that no number is ever reused.`,
      follow:`Two subsystems produce what feels like the same failure. One code or two?`,
      red:`Invents fine grained codes with no distinct client behaviour behind any of them.` },
    { q:`A handler returns 500 for something that is a normal outcome. How do you find and fix that class of bug?`,
      a:`Look at error rate broken down by code. A code that dominates is usually an expected outcome modelled as a failure, such as not found or already claimed. Turn it into a result the caller handles or a code the client treats as normal. Say why it matters: it poisons alerting.`,
      follow:`How would you know your alerting was already poisoned?`,
      red:`Raises the alert threshold instead of fixing the classification.` },
    { q:`Where do you translate a storage failure into a domain error?`,
      a:`At the layer where the meaning changes, which is usually the interactor. The repository says storage failed or no rows. The interactor knows that no rows means this quest was never started, which is a domain code with a player facing meaning. Say what goes wrong translating too early or too late.`,
      follow:`What does the handler do with an error it has never seen before?`,
      red:`Wraps with a domain code inside the repository, so storage now knows the game rules.` }
  ],
  senior:[
    { q:`The client is string matching on error messages. How did that happen, and how do you fix it?`,
      a:`It happened because codes were not designed with the client, or the messages shipped before the codes did. The fix is a code table agreed by both sides, a generic fallback branch the client can count, and a deprecation window. Ship the codes first and remove the string matching in the next client release.`,
      follow:`The messages get localized next sprint. What breaks first?`,
      red:`Blames the client team and offers no migration path.` },
    { q:`Talk me through an incident where the error taxonomy helped or failed you.`,
      a:`Name the shape: a spike on one code, a code that meant two things, a stack that pointed at a handler instead of an origin. Say how long it took to localize the cause and what changed afterwards. The question is whether the taxonomy made the first five minutes cheaper.`,
      follow:`What single change would most improve your next incident?`,
      red:`Describes the outage with no reference to what was observable at the time.` }
  ] });

INTERVIEW('backend-data-access',{
  junior:[
    { q:`Why pass a runner into a repository method instead of holding a database handle?`,
      a:`So the same method works against a session and against a transaction, and the caller decides the boundary. The consequence is that the repository never opens or commits anything, and a write method can assert it was handed a transaction rather than a bare session.`,
      follow:`What happens when a repository opens its own transaction?`,
      red:`Keeps a connection on the repository struct and cannot say who commits.` },
    { q:`Show me the Go idiom for commit or rollback.`,
      a:`A named return error plus a deferred closure that commits when the error is nil and rolls back otherwise. Point at the bug it prevents, which is committing regardless because the defer never looked at the error. With several databases the same closure commits them in order and rolls back the rest.`,
      follow:`The second commit fails and the first already succeeded. What now?`,
      red:`Defers a commit unconditionally, or commits inside each repository method.` },
    { q:`What is an N+1 query, and how do you notice one before production?`,
      a:`One query for a list and one per row afterwards, usually from loading an association inside a loop. You notice it by counting queries per endpoint in a test, not by reading code. The fix is one query with an IN clause or a join, plus a test that fails when the count grows.`,
      follow:`Your query layer hides the SQL. How do you count them?`,
      red:`Says they would spot it in review.` }
  ],
  mid:[
    { q:`ORM or SQL builder for a live game backend. Pick one and defend it.`,
      a:`Name the axis: query visibility against development speed. A builder or generated queries keep the SQL readable in review, which is what you want on the hot path. An ORM is fine for admin tooling. Point out that this can be decided per surface rather than once for the whole service.`,
      follow:`What is the first ORM behaviour that bites you at scale?`,
      red:`Argues from preference with no mention of what becomes invisible.` },
    { q:`Explain delta state sync and what makes it fragile.`,
      a:`Every write registers its table into a dirty set on the request context, and after the handler succeeds a post step reloads exactly those tables and returns them with a generation counter. It is fragile because a write that fails to register leaves the client showing stale data with no error anywhere. The guard is registering inside the repository, never at the call site.`,
      follow:`The client has been offline for a week. What does it receive?`,
      red:`Describes it as sending changed fields and cannot name the failure mode.` },
    { q:`An action writes to two databases. How do you keep it consistent?`,
      a:`Admit there is no distributed transaction here. Order the commits so the cheaper one to repair goes last, make the action idempotent so a retry converges, and record enough to reconcile afterwards. Say what the player sees in the window where one committed and the other did not.`,
      follow:`Which goes first, the currency spend or the item grant?`,
      red:`Claims two transactions across two databases are atomic together.` }
  ],
  senior:[
    { q:`You are handed a login that takes two seconds. Walk me through the investigation.`,
      a:`Trace first, ordered by self time rather than total. Then query count and plan for the worst spans. Separate one slow query from many fast ones. Check whether a proposed cache would be hiding a missing index. Say what you would change first and what measurement would prove it worked.`,
      follow:`The trace shows the time inside the application, not the database. Where do you look?`,
      red:`Adds a cache before looking at the queries.` },
    { q:`Design the data access layer for a service that will shard player data.`,
      a:`A shard id resolved once per request from the session and carried on the context, one code path where the shard selects both connection and schema, no cross shard queries on the request path, and reporting built from an export rather than from joins. Say what you give up: cross player queries become a batch job.`,
      follow:`A feature needs to compare two players on different shards. What do you do?`,
      red:`Plans cross shard joins, or defers sharding with no seam left for it.` }
  ] });

INTERVIEW('backend-caching-redis',{
  junior:[
    { q:`Name the cache tiers in a game backend and what belongs in each.`,
      a:`In-process for data that is immutable between releases, distributed for player and shared state, per request for deduplicating reads inside one handler. The rule that decides is how often the data changes and who else has to see the change.`,
      follow:`How do you invalidate the in-process tier?`,
      red:`Treats all caching as one thing with an expiry time.` },
    { q:`What must a cache key contain?`,
      a:`Everything the value depends on: the entity id, plus locale, shard and master data version wherever they matter. Name the failure when one is missing: a player in another locale or another shard reads a value that was never theirs, and it presents as a data bug rather than a cache bug.`,
      follow:`How does putting a version in the key make invalidation free?`,
      red:`Keys on the id alone and has never thought about the other dimensions.` },
    { q:`Why a sorted set for a leaderboard instead of a table with an ORDER BY?`,
      a:`Rank and a page around a player are log time operations and the structure stays ordered as scores change. A table needs an index scan or a window function per read. Name the cost: memory scales with participants, and a tiebreak has to be encoded into the score itself.`,
      follow:`Two players share a score. Who is first, and how did you make that deterministic?`,
      red:`Cannot say what the sorted set gives that a query does not.` }
  ],
  mid:[
    { q:`A key expires and a thousand requests miss at once. What did you build to prevent that?`,
      a:`Jittered expiry so keys do not die together, plus a single flight guard so one goroutine fills while the rest wait on its result. Where the value is expensive, refresh ahead of expiry in the background and serve the previous value meanwhile.`,
      follow:`The fill itself fails. What do the waiting requests get?`,
      red:`Sets a longer expiry and considers the problem solved.` },
    { q:`Redis is down. What does your game do?`,
      a:`It depends what Redis was doing. Leaderboards degrade to unavailable, the lock manager must fail closed or whatever it protected is now unprotected, and the cache tier falls through to the database only if the database survives the load. Say that this must be written down per use, because otherwise it gets decided during an incident.`,
      follow:`The duplicate request gate lives in that cache. Fail open or fail closed?`,
      red:`Says Redis is highly available and stops there.` },
    { q:`How do you know whether a cache is helping?`,
      a:`Hit rate per key prefix, plus the latency and load difference with it disabled. A prefix under half is either wrongly keyed or wrongly scoped. Name the trap: a high hit rate on a cheap query is not value, and a cache covering a missing index is debt with a dashboard.`,
      follow:`Hit rate is ninety percent and latency did not move. What does that tell you?`,
      red:`Reports one overall hit rate with no breakdown and no baseline.` }
  ],
  senior:[
    { q:`Design the caching for a seasonal leaderboard that resets.`,
      a:`A namespace per season so a reset is a new key rather than a delete, the previous season readable until rewards are distributed, an add-if-higher update, and a tiebreak encoded in the score. Say what the player sees during the changeover and how you avoid a window where nobody has a rank.`,
      follow:`Rewards are computed from the final ranking. How do you freeze it?`,
      red:`Deletes the key at reset time and has no answer for reward computation.` },
    { q:`When have you removed a cache, and why?`,
      a:`Give a concrete case: a cache that hid a query problem, or one whose invalidation cost more than the reads it saved. Say how you proved removal was safe, which is usually load and latency with it disabled in one environment first. Removing a cache is a senior move because it admits an earlier decision was wrong.`,
      follow:`What would have stopped you adding it in the first place?`,
      red:`Has only ever added caches.` }
  ] });

INTERVIEW('backend-migrations-config',{
  junior:[
    { q:`Why do migrations get their own pull request?`,
      a:`Because they are reviewed against different questions and roll back independently. Reverting code does not undo a schema change. The practical consequence is that the migration lands first, the code requiring it lands after, and either can be reverted alone.`,
      follow:`Which goes first for an added column, and which for a dropped one?`,
      red:`Bundles schema and code and assumes both revert together.` },
    { q:`What is expand and contract?`,
      a:`Add the new shape, write to both, backfill, switch reads, then drop the old shape in a later release. Three deploys instead of one, and at no point is a running build looking at a shape it does not understand. Say when you would skip it: a genuinely additive nullable column.`,
      follow:`Where in that sequence is it safe to roll back the code?`,
      red:`Renames a column in one step and does not see the problem.` },
    { q:`Where do database credentials live?`,
      a:`In a secret store injected at deploy time. The repository holds the name of the secret and never the value. If one is found committed, rotate immediately, because a push is the point of no return and rewriting history does not un-leak anything.`,
      follow:`A migration config needs the credential to run. How does it get it?`,
      red:`Proposes removing it from the file and rewriting history, with no rotation.` }
  ],
  mid:[
    { q:`A migration must run against a large live table. Walk me through it.`,
      a:`Check the lock behaviour for that exact engine version, time it against a restored copy of production data, decide whether it needs a window, and write the rollback down before scheduling anything. Say who is watching and how you would know within a minute that it went wrong.`,
      follow:`It is taking four times the estimate. What is your decision point?`,
      red:`Runs it and watches, with no estimate and no rollback plan.` },
    { q:`How do you stop environment configuration from drifting?`,
      a:`One file with a base block and per environment overrides, so a difference shows as a diff. A test environment inheriting from the same base as production. A periodic report of every setting that differs. Name the failure mode: a setting that exists in production and not in CI is untested in every single build.`,
      follow:`How would you find out that a production-only setting exists?`,
      red:`Keeps separate files per environment and relies on people syncing them.` },
    { q:`CI builds every schema from zero on each push. Why bother?`,
      a:`Because the migration history is code that runs once per environment, so it rots invisibly. Building from zero proves every migration still applies in order against the current engine version. It catches a migration that depended on data, or on an object a later migration dropped.`,
      follow:`The full history takes twenty minutes. Do you keep it?`,
      red:`Tests only the newest migration against an existing database.` }
  ],
  senior:[
    { q:`Your configuration is embedded in the binary. Defend that, then attack it.`,
      a:`Defend: reproducible builds, no runtime file to lose, a config change reviewed like code. Attack: every change needs a rebuild and a deploy, and an incident sometimes needs a knob you cannot turn. Land on a split, the stable majority embedded plus a small explicit set of environment variables, and name which settings you would keep dynamic.`,
      follow:`Which setting would you most want to change without a deploy, and why is it not embedded?`,
      red:`Argues for one extreme with no account of the incident case.` },
    { q:`A credential has been in the repository for a year. What do you do, in order?`,
      a:`Rotate first, because the exposure is already real. Then find every consumer, then remove it from the code, then decide whether a history rewrite is worth the cost across every clone and every build agent. Prevention is a scan in CI plus a secret store, so there is nothing left to commit.`,
      follow:`It is used by a batch job nobody owns. How do you rotate without breaking it?`,
      red:`Starts with a history rewrite and treats rotation as optional.` }
  ] });

INTERVIEW('backend-observability',{
  junior:[
    { q:`Logs, traces and profiles. What question does each answer?`,
      a:`A log says what happened, a trace says where the time went inside one request, a profile says why the process is busy. The practical consequence is that reaching for the wrong one costs the first stretch of an incident, so you decide which question you have before you open a tool.`,
      follow:`A request is slow but the database looks fine. Which do you reach for?`,
      red:`Treats logging as the answer to every question.` },
    { q:`What makes a log line useful six months later?`,
      a:`Structure and joinability: request id, player, endpoint and error code as fields, not as prose. Then say what stays out: request bodies, tokens, and anything personal you cannot justify keeping for the retention period.`,
      follow:`Your log bill doubled. What is the first thing you cut?`,
      red:`Formats a sentence and expects to grep it later.` },
    { q:`Why name a trace transaction after the route and not the URL?`,
      a:`Because a URL containing an id produces one transaction name per player, so the aggregate is meaningless and the storage cost explodes. The route pattern groups requests that share behaviour. The same rule applies to metric labels.`,
      follow:`Where else does high cardinality hurt you?`,
      red:`Has never thought about cardinality.` }
  ],
  mid:[
    { q:`Design the analytics event taxonomy for one feature.`,
      a:`One event per meaningful player action, names stable enough to survive a feature rename, a fixed field set, identifying fields hashed at the write site. Flag events that would dominate the stream and replace them with an aggregate. Name an owner, because a taxonomy without one drifts within a quarter.`,
      follow:`A designer wants a new field on an event that has been emitting for a year. What do you do?`,
      red:`Names events after screens or code paths and adds fields ad hoc.` },
    { q:`How do you profile a service that is only slow in production?`,
      a:`Profile endpoints mounted in every environment behind an admin prefix, pulled from a live instance and compared against a healthy one. The point is that it is already on: a profiler you have to deploy to enable arrives after the incident. Goroutine and heap profiles cover the leaks a trace cannot show.`,
      follow:`The profile shows time in garbage collection. What do you look at next?`,
      red:`Would reproduce locally and profile there, with no plan for when it does not reproduce.` },
    { q:`You are paged for a latency alert. What happens in the first five minutes?`,
      a:`Confirm the signal, look at error rate by code alongside latency, open a trace for a slow request and order spans by self time, then check whether a deploy or a config change lines up in time. Write the timeline down as you go, because that is the postmortem.`,
      follow:`Latency is up and error rate is flat. What does that combination suggest?`,
      red:`Starts reading code before looking at any signal.` }
  ],
  senior:[
    { q:`How much instrumentation is too much?`,
      a:`When it changes the thing it measures, or the bill exceeds the value. Give the test: measure latency on a hot endpoint with tracing and logging off, and know that number. Then discuss sampling honestly, because sampling loses the rare slow request, which is usually the one you wanted.`,
      follow:`How would you keep the rare slow requests while still sampling?`,
      red:`Instruments everything and has never measured the overhead.` },
    { q:`A player reports something the server logs do not show. How do you close that gap?`,
      a:`Correlate the two sides: the server's request id inside the client's crash and event reports, the client's session id inside the server log. Half of any production incident lives on the client, and without a shared id the investigation is two teams comparing timestamps.`,
      follow:`The client is offline when it fails. How does the report ever reach you?`,
      red:`Treats client telemetry as somebody else's problem.` }
  ] });

INTERVIEW('backend-testing',{
  junior:[
    { q:`What are the tiers of your suite and what does each prove?`,
      a:`Pure unit tests prove arithmetic and rules. Interactor tests with fakes or mocks prove the rule asked for the right things. Integration tests against a real database and cache prove the query parses, the index exists and the transaction commits. End to end proves the protocol and the flow. Say which tier should be biggest and why.`,
      follow:`Which tier catches a missing index, and which would miss it entirely?`,
      red:`Offers a coverage percentage as the measure of a suite.` },
    { q:`Where should an expected value in a test come from?`,
      a:`From master data, from the specification, or from arithmetic written into the test. Never from a previous run's output. A pasted expectation asserts only that the code still does what it did, bug included.`,
      follow:`You are testing a formula with fifteen inputs. Do you still derive by hand?`,
      red:`Runs the code, copies the output into the assertion and calls it a regression test.` },
    { q:`A test cannot start because a container is missing. Skip or fail?`,
      a:`Fail. A skip is a green build that tested nothing, and it stays green until somebody notices months later. The corollary is that setup failures have to be as loud as assertion failures.`,
      follow:`Developers without containers now cannot run the suite. How do you handle that?`,
      red:`Skips on missing infrastructure to keep the build green.` }
  ],
  mid:[
    { q:`Mocks or real dependencies for repository interaction. When each?`,
      a:`Mocks when the question is whether the interactor asked for the right things and you want the test in milliseconds. Real dependencies when the question is whether the query is valid and the transaction behaves. Name the drift risk: a mock cannot tell you the SQL stopped parsing.`,
      follow:`Your mocks are over-specified and every refactor breaks them. What went wrong?`,
      red:`Mocks everything, including the thing under test.` },
    { q:`A previously green test goes red after your change. What is your default assumption?`,
      a:`That the change is wrong. Investigate the behaviour before touching the test, because weakening an assertion is deleting the test slowly. Name the one legitimate case: the test encoded the old intended behaviour and the intent genuinely changed, which belongs in the pull request body.`,
      follow:`How do you tell that case apart from a rationalization?`,
      red:`Adjusts the assertion first and investigates if there is time left.` },
    { q:`How do you kill a flaky test?`,
      a:`Find the nondeterminism: shared state, ordering, time, an unseeded random source, or real concurrency. Inject the clock and the seed instead of reading globals. Say what you never do, which is wrap it in a retry, because that converts a real intermittent bug into silence.`,
      follow:`It fails only in CI, never locally. What does that narrow it to?`,
      red:`Adds a retry or a sleep and moves on.` }
  ],
  senior:[
    { q:`How do you know your suite is worth its runtime?`,
      a:`Delete a line of a rule and check that a test goes red. Measure wall time per tier, because a slow fast tier inverts the pyramid. Count how often a red end to end run turns out to be a real bug, and if it is under about half the suite is training people to ignore it. Say which you would fix first.`,
      follow:`Your end to end suite is red three days a week. What is the plan?`,
      red:`Answers with coverage numbers and no measure of trust or sensitivity.` },
    { q:`Describe the red-first workflow and why teams resist it.`,
      a:`Reproduce the bug as a failing test, keep the failing output, fix it, keep the passing output, and put both in the pull request. Teams resist because reproducing a hard bug is the expensive part. What it buys is proof that the fix addressed the reported behaviour and not an adjacent one.`,
      follow:`The bug cannot be reproduced in a test. What do you do instead?`,
      red:`Says tests get written after the fix if there is time.` }
  ] });

INTERVIEW('backend-go-idioms',{
  junior:[
    { q:`Why is context.Context the first parameter almost everywhere?`,
      a:`It carries cancellation, deadlines and request scoped values down the call chain without adding parameters. Then say the honest part: accepting it does nothing by itself, you have to pass it into the calls that block and check it inside loops.`,
      follow:`Show me a function that takes a context and ignores it. What breaks?`,
      red:`Takes a context everywhere as a convention and never uses it.` },
    { q:`You are about to start a goroutine. What three questions do you answer first?`,
      a:`Who owns it, how it learns to stop, and who waits for it. Give the concrete answers: a context or a done channel for stopping, a WaitGroup or an errgroup for waiting. Mention the connection pattern, one goroutine per connection with a deferred close.`,
      follow:`Where would you never start a goroutine, and why?`,
      red:`Starts goroutines for speed and has never had to stop one.` },
    { q:`What is wrong with serving from a default HTTP server?`,
      a:`No read, read header, write or idle timeout, so one slow client can hold a connection open indefinitely. That is an availability bug, which is why the security linter flags it. The fix is constructing the server explicitly with all four set.`,
      follow:`Which of those timeouts protects you from a slow request body?`,
      red:`Uses the default server and treats the lint warning as noise.` }
  ],
  mid:[
    { q:`errgroup or a bounded worker pool. How do you choose?`,
      a:`errgroup for a handful of related tasks where the first error should cancel the rest. A bounded pool when the fan-out is large enough to hurt a database or a downstream service. Note that errgroup is unbounded unless you set a limit, which is the mistake people make with it.`,
      follow:`Ten thousand rows to process nightly. Which one, and what bound?`,
      red:`Spawns a goroutine per item and expects the runtime to sort it out.` },
    { q:`Walk me through shutting a service down cleanly.`,
      a:`Cancel the root context, stop accepting new connections, drain in-flight work against a deadline, then close pools and clients in reverse construction order. Say what an in-flight request experiences at each step, and that this sequence deserves a test because it only runs at the worst possible moment.`,
      follow:`Something refuses to drain within the deadline. What then?`,
      red:`Relies on the process exiting and calls that shutdown.` },
    { q:`Mutex or channel for shared state?`,
      a:`Mutex when the data is genuinely shared and small, such as a ticket list or a subscriber set. Channel when ownership moves from one goroutine to another. Mention RWMutex for read heavy access, and the trap of holding a lock across a call that blocks.`,
      follow:`You hold a lock and call a repository method inside it. What is the risk?`,
      red:`Quotes the share-by-communicating slogan with no sense of when a mutex is simply simpler.` }
  ],
  senior:[
    { q:`The goroutine count climbs across a day. How do you find the source?`,
      a:`Pull a goroutine profile from a live instance and group by stack. Look for the creation site rather than the blocking site, then ask the ownership question for that site: what would ever cancel it. A heap profile alongside tells you whether the leak is also holding memory.`,
      follow:`The profile points into a library. What do you do?`,
      red:`Restarts instances on a schedule and calls it mitigated.` },
    { q:`How do you keep dependencies from creeping into a large Go module?`,
      a:`An import allow list enforced by a linter, so adding a library means editing a reviewed file. A rule that the standard library alternative has to be named before a dependency is accepted. The real value is that the conversation happens at the moment of the decision instead of at an audit a year later.`,
      follow:`A team needs a library that is not on the list and has a deadline. What is the process?`,
      red:`Relies on review vigilance, or bans dependencies outright with no path through.` }
  ] });
