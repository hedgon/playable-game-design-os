/* =====================================================================
   PROJECT SYSTEMS - A: the Go backend for a live mobile game
   Case: cs-go-game-backend (defined in 29-data-experience.js)

   Shape (full contract and field meanings live in 29-data-experience.js):

     SYSTEMS('cs-go-game-backend', [{
       id:'', t:'', kind:'', sum:'', stack:[''],
       parts:[{ id:'', t:'', what:'', how:[''], why:'', trade:'',
                rel:[['topic-id','why']], links:[['part-id','why']], story:'' }]
     }])

   Rules:
   - 6 to 8 systems, 2 to 5 parts each. Ids unique inside the project and
     every part id prefixed by its system id ("api-routing").
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

   Suggested breakdown for this project (adjust within 6 to 8 systems):
   public API server · realtime and matchmaking servers · simulation parity
   package · data layer (schemas, transactions, delta sync) · caching and
   Redis · config, secrets and observability · build, CI and deploy · batch
   jobs and admin tooling · engineering process (rules, red-first,
   migration PRs).
   ===================================================================== */

SYSTEMS('cs-go-game-backend', [
  {
    id:'api', t:'Public API server', kind:'backend',
    sum:`The process every player talks to. One router per process mode, a fixed middleware chain, protobuf over plain HTTP, and one error type that decides what the client sees.`,
    stack:['Go','net/http','gorilla/mux','protobuf','memcached'],
    parts:[
      {
        id:'api-routing', t:'Routing and the middleware chain',
        what:`Every request enters through one router built for the process mode the binary was started in, and passes through the same chain of middleware before any handler runs. A feature owns a path prefix and a subrouter, and the subrouter carries the authentication step for everything under it. Route registration goes through a tracing wrapper, so declaring a route and naming its monitoring transaction are one action rather than two.`,
        how:[
          `One routing file per server mode, around fifteen hundred lines, with a subrouter per feature and one registration line per endpoint.`,
          `The chain seeds the request context first, then logging, then the maintenance gate, then the client version gate, then session authentication, then a duplicate request lock.`,
          `The maintenance and version gates carry an allow list of exempt path prefixes, because the health check and the force update endpoint have to answer while the gate is closed.`,
          `Debug and end to end setup endpoints live under their own prefix on their own port, so they are excluded by address rather than by remembering to guard each one.`,
          `Administrative surfaces are a different mode of the same binary behind basic auth, not a set of privileged routes inside the player facing router.`
        ],
        why:`A fixed chain means a new endpoint inherits authentication, logging, tracing and the version gate simply by being registered in the right subrouter. Per handler opt in fails silently the first time somebody forgets, and silent is the worst failure mode for an auth check.`,
        trade:`Order inside the chain becomes load bearing and invisible. Context seeding has to run before anything reads the context, and that rule lives in one file nobody opens until it breaks.`,
        rel:[
          ['backend-request-context',`The chain exists to seed and then flush the request scoped bus that every layer below reads.`],
          ['backend-layering',`The router is the outermost ring: it knows about HTTP and about nothing else, and it hands work inward.`]
        ]
      },
      {
        id:'api-protocol', t:'Protobuf over HTTP and the header contract',
        what:`Requests are form encoded and bound to an input struct through a declarative field map. Responses are marshalled protobuf. The part that actually carries the protocol is the header set: session, platform, language, client version, master data version and a counter describing the player state the client already holds.`,
        how:[
          `A field map per input struct names each form key once, so binding is data instead of a hand written parse inside every handler.`,
          `Responses marshal generated protobuf messages. A JSON path exists, and only the web and admin surfaces use it.`,
          `Compatibility is handled by a client version header driving a force update decision, not by a version segment in the URL.`,
          `A master data version header tells the client whether the configuration it cached is still the one the server is running.`,
          `A generation counter on the player state lets a response carry only the rows that changed since the client last synced.`
        ],
        why:`Mobile clients keep ordinary HTTP semantics through proxies, load balancers and content delivery networks, and typed payloads stay small on a bad network. gRPC would have added streaming and generated stubs, and neither was worth giving up plain HTTP on the client side.`,
        trade:`The header set is a protocol that no tool validates. Both sides agree by documentation and review, so a header added on one side and missed on the other is a runtime surprise rather than a compile error.`,
        rel:[
          ['backend-api-protocol',`It is the middle option between REST with JSON and gRPC, chosen for a mobile client and paid for in tooling.`]
        ],
        story:`We argued about gRPC for a week. The thing that settled it was not performance, it was the list of places a request passes through before it reaches us: a carrier proxy, a content delivery network, a load balancer and a corporate firewall on the office network. Every one of those understands ordinary HTTP and some of them did not understand streaming. So I proposed protobuf bodies over plain HTTP and we wrote the header contract down as a document instead of letting a tool generate it. The cost showed up six months later, when a header added for a new platform was missing on one client build and nothing failed until a player on that platform logged in.`
      },
      {
        id:'api-errors', t:'Domain errors and idempotency',
        what:`One error type carries a numeric domain code, the HTTP status it maps to, the payload the client receives and the stack captured where the error was wrapped. Interactors wrap a cause with a code. The boundary unwraps once and writes the response. Duplicate submissions are stopped before the handler, not inside it.`,
        how:[
          `Codes are allocated in blocks of one thousand per subsystem, so a code names its owner before anybody opens a table.`,
          `Wrapping captures the stack at the wrap site, so the log points at the decision that failed and not at the handler that returned it.`,
          `Handlers never assemble an error response. One helper turns any error into a status, a code and a wire payload.`,
          `Expected outcomes are sentinel errors compared by identity, for example a cache write that lost a first writer wins race.`,
          `A duplicate request lock in the chain stores an add if absent key of player, method and path with a short expiry, and a second request inside that window is refused with a domain code instead of running twice.`
        ],
        why:`The client has to branch on why something failed, not on a message string. A numeric code with a block per subsystem gives every team room to add codes without editing a shared list that everybody conflicts on.`,
        trade:`Codes are a permanent public surface. A code that has shipped cannot be reused, and a subsystem that outgrows its block takes a second block rather than renumber the first.`,
        rel:[
          ['backend-errors',`A code taxonomy with status mapping and stack capture at the wrap site is the whole argument for a domain error type.`],
          ['backend-request-context',`The duplicate request key is built from values the context already carries, which is why it can sit in the chain instead of in the handler.`]
        ],
        links:[
          ['api-routing',`The idempotency lock is one link in the middleware chain, so the error it returns is produced before any handler runs.`]
        ]
      }
    ]
  },
  {
    id:'realtime', t:'Realtime and matchmaking servers', kind:'server',
    sum:`Two WebSocket processes and a matchmaker sitting behind the same binary as the API. Framed protobuf messages, an op-code dispatch loop per connection, and a ticket pool that hands matched peers to a session.`,
    stack:['Go','gobwas/ws','protobuf','Redis'],
    parts:[
      {
        id:'realtime-framing', t:'Framed protobuf and op-code dispatch',
        what:`Two independent WebSocket servers share one wire shape: a length prefixed frame carrying a message id, an op code and a protobuf payload. One server owns chat and presence, the other owns matched game sessions, but both decode the same envelope and dispatch on the same kind of switch.`,
        how:[
          `One goroutine per connection reads frames off the socket and switches on the op code, for example auth, subscribe, unsubscribe, publish, relay or a stat check.`,
          `Auth is enforced before any operation except the stat check, so an unauthenticated socket can be probed for health but cannot touch a channel.`,
          `The message id lets a reply correlate to the request that caused it, because a socket has no built in request and response pairing the way HTTP does.`,
          `Peers are hidden behind one interface, so a client connection and a connection representing another game server process share the same dispatch code.`
        ],
        why:`A hand rolled envelope keeps both realtime servers on the same wire format and the same protobuf tooling already used for the HTTP API, instead of adopting a second serialization format for one feature.`,
        trade:`The framing and the op-code switch are not covered by any library, so every new op code is a manual addition to the switch and to whatever client decodes it, and a malformed frame is a decode bug rather than something a library catches for you.`,
        rel:[
          ['server-realtime-protocol',`The framed envelope, the op-code switch and auth-before-anything-else are exactly this topic's worked example.`]
        ]
      },
      {
        id:'realtime-fanout', t:'Redis pub/sub fan-out across instances',
        what:`Chat and presence run on more than one instance, so a publish on one process has to reach subscribers connected to any other process. The fan-out layer sits between the WebSocket dispatch loop and Redis, and it is the reason a chat feature does not need its own message broker.`,
        how:[
          `A channel name is hashed and taken modulo the instance count to pick a Redis pub/sub shard, so each instance subscribes only to the shards it owns.`,
          `A reconnect and retry loop keeps the Redis subscription alive across a dropped connection without dropping the local WebSocket subscribers, who never touch Redis directly.`,
          `A stat repository tracks the subscriber set per channel, so room capacity and presence counts do not require asking every instance directly.`,
          `Room capacity itself is loaded from master data at boot rather than computed at runtime, so it cannot disagree with the number the client was already told.`
        ],
        why:`Sharding channels by hash spreads pub/sub load across instances without any one instance seeing every message in the system.`,
        trade:`A channel that changes name changes shard, so a rolling deploy that crosses a shard boundary can briefly split subscribers across two shards before every instance has restarted.`,
        rel:[
          ['server-scaling',`Sharded pub/sub fan-out across stateful instances is exactly the scaling question this topic asks.`],
          ['backend-caching-redis',`This is one of the three unrelated jobs the same Redis deployment does, worked through in the data layer.`]
        ],
        links:[
          ['data-redis-jobs',`The pub/sub channel this part fans out over is the same Redis deployment described there, sharing fate with the leaderboard and lock jobs.`]
        ]
      },
      {
        id:'realtime-matchmaking', t:'Ticket based matchmaking',
        what:`A dedicated endpoint upgrades to a WebSocket and creates a ticket carrying the capacity the caller wants and the rule predicates it must satisfy. A matchmaker scans the open ticket pool for a set of tickets that together satisfy every predicate, then hands the matched peers to a session.`,
        how:[
          `A ticket carries capacity and a set of predicates rather than a bare player id, so matching is a search over rules and not a fixed queue position.`,
          `The matchmaker holds the open ticket list behind a mutex and scans it for a satisfying set before removing every matched ticket together, so no ticket is claimed twice.`,
          `A satisfied set hands its peers to a game server object, which creates the session and takes over the connections from the matchmaking endpoint.`,
          `Peers are abstracted the same way as on the realtime server, so a client and a server process can both occupy a matched slot without separate code paths.`
        ],
        why:`Predicate matching lets the rules that define a good match evolve without redesigning the queue, and a mutex guarded scan is simple enough that its correctness can be reasoned about directly.`,
        trade:`A single mutex around the whole ticket list caps how many candidate matches can be evaluated at once, so the approach is sized for the volume it was built for and becomes the first thing a future scaling pass has to replace.`,
        rel:[
          ['server-matchmaking',`Capacity plus predicate tickets, a scanning matchmaker and session handoff are this topic's core mechanics.`]
        ],
        links:[
          ['realtime-framing',`A matched session hands its peers into the same peer interface the chat and presence server already dispatches through.`]
        ]
      }
    ]
  },
  {
    id:'simparity', t:'Simulation parity package', kind:'server',
    sum:`A deterministic reimplementation of the client's simulation, run again on the server so the result that counts is never only the one the client reported.`,
    stack:['Go','C#'],
    parts:[
      {
        id:'simparity-determinism', t:'Bit exact RNG port and FMA free math',
        what:`The client plays a match out for responsiveness and the server re-runs the same simulation to decide the real outcome, so both sides have to reach the identical last bit, not merely an equivalent answer. That requirement drove a hand ported random generator and hand written math helpers.`,
        how:[
          `The platform's own random generator is ported bit for bit rather than reimplemented from its documented behaviour, because two generators that only agree on distribution will still diverge step by step.`,
          `Shared math helpers for functions like power, exponent and logarithm are written by hand and marked to forbid the compiler from folding a multiply and an add into one fused instruction.`,
          `A command line tool on the client side exports a frozen trace fixture that the server engine consumes, so both runtimes start from exactly the same recorded input.`,
          `Every change to the simulation runs against the frozen traces before merge, comparing intermediate state rather than only the final result.`
        ],
        why:`Bit exactness is a property of the whole toolchain, not of the algorithm as written, so the only way to trust it is to compare every step, not the final score two implementations happen to agree on.`,
        trade:`Both implementations are now frozen against a specific compiler and runtime behaviour, so upgrading either toolchain is a re-verification project rather than a routine version bump, and the math helpers stay hand written instead of using the optimised standard library versions.`,
        rel:[
          ['server-determinism',`Bit-exact parity between a client simulation and a server re-simulation is this topic's central worked example.`]
        ],
        story:`The client and the server disagreed about who had won a match, rarely and only on some devices. I built a trace exporter on both sides that dumped every step of the simulation instead of only the final result, then diffed the traces step by step to find the first point where they split. It was one floating point expression the compiler was allowed to fold into a fused multiply add, so identical inputs produced different last bits depending on the build. I rewrote the shared math helpers to forbid that fold, ported the random generator bit for bit instead of matching its described behaviour, and froze a set of traces as a test that fails on any byte difference. Disagreements went to zero and the habit I kept from it is to compare traces, never final results, whenever two implementations are required to agree.`
      },
      {
        id:'simparity-trace-gate', t:'Golden trace test in CI',
        what:`A fixture set of recorded matches runs through the Go engine on every push, and the resulting trace is diffed step by step against a frozen trace exported from the client. The comparison is byte level against every recorded step, never against the final score alone.`,
        how:[
          `Fixtures cover a spread of match shapes rather than one canonical case, so a regression narrow to one input pattern is still caught.`,
          `The diff fails on the first differing step, so a single divergent instruction fails the whole test instead of being averaged away by a similar final score.`,
          `A command line tool regenerates the frozen traces only when the client's own reference implementation changes, keeping the two artefacts explicitly linked instead of silently drifting apart.`,
          `The test runs in the same push pipeline as every other integration check, so a regression is caught on the commit that introduced it rather than on a schedule.`
        ],
        why:`Comparing only final results would have let the exact bug through, because two different simulations can land on the same score while disagreeing about every step that produced it.`,
        trade:`The suite is only as good as its fixture coverage, and a fixture set assembled once has to be actively extended as the simulation gains new mechanics, or the gate quietly stops testing the newest code paths.`,
        rel:[
          ['server-determinism',`A CI gate that diffs traces rather than results is the enforcement mechanism this topic argues for.`],
          ['quality-and-build-health',`A gate that would have caught the actual bug, versus one that only checks the final score, is a build-health decision.`]
        ],
        links:[
          ['simparity-determinism',`The traces this test diffs are exactly the RNG and math output that part makes bit exact.`]
        ]
      },
      {
        id:'simparity-anticheat', t:'Re-simulation as anti-cheat',
        what:`Because the server re-runs the same simulation independent of what the client reports, that re-run doubles as an anti-cheat surface. A mismatch between a client's submitted result and the server's own re-simulation is the primary signal, backed by aggregation across matches, replay retention and batch sweeps for submissions that time out.`,
        how:[
          `An inspector step compares the client-submitted result against the server's own re-simulation and treats a mismatch as the primary cheat signal.`,
          `Suspicious patterns aggregate across matches rather than acting on one flagged submission, so an account is shadow-banned on a pattern rather than on a single noisy result.`,
          `Replays are retained past the match itself, so a flagged account can be reviewed against real gameplay and not only against the trace numbers.`,
          `Batch jobs sweep on a timeout for submissions that never arrived and for win streaks that are statistically implausible, both off the request path rather than inline with it.`
        ],
        why:`A cheat detector built on the same code path the parity test already trusts costs nothing extra to reimplement, and it catches manipulation the client could otherwise get away with by simply lying about the result.`,
        trade:`Aggregating before acting delays a ban past the first flagged match, which is deliberate to avoid punishing a false positive on one anomalous result, but it means a confirmed cheater keeps playing until the pattern is established.`,
        rel:[
          ['server-anticheat',`Server re-simulation as the anti-cheat mechanism, backed by aggregation and replay review, is this topic's central case.`]
        ],
        links:[
          ['simparity-trace-gate',`The same diff logic that gates a merge is repurposed at runtime to flag a mismatched submission.`]
        ]
      }
    ]
  },
  {
    id:'data', t:'Data layer, caching and Redis', kind:'data',
    sum:`Seven MySQL schemas behind one host abstraction, controller-scoped transactions, dirty-table delta sync back to the client, three cache tiers, and Redis doing three unrelated jobs.`,
    stack:['Go','MySQL','gocraft/dbr','goose','Redis','memcached'],
    parts:[
      {
        id:'data-schemas-transactions', t:'Multi-schema transactions',
        what:`Player data sits in one schema, master data in another, and several more cover chat, presence and smaller domains, each with its own replica pair behind one host abstraction. A handler that needs more than one schema opens each transaction it needs and commits or rolls back all of them as a single decision.`,
        how:[
          `Every schema exposes a session accessor and a begin-transaction accessor, so a repository method takes a runner and works the same whether it is handed a plain session or a transaction.`,
          `A handler opens the transactions it needs up front from a shared runner, then defers one commit-or-rollback step keyed off a named return error.`,
          `Write repositories assert they were handed a transaction rather than a plain session, because nothing at the type level tells the two apart, and a repository that skipped the check would happily write outside any transaction.`,
          `The query layer is a SQL builder rather than an ORM, so the generated code stays close to the SQL a reviewer would write by hand.`
        ],
        why:`Deciding commit or rollback once, at the top of the handler, means a request touching three schemas cannot commit two of them and roll back the third by accident at some early return nobody remembered to guard.`,
        trade:`The pattern reads as magic until someone explains the deferred function and the named return error together, and the runtime assertion that catches a plain session where a transaction was required stands in for something the type system cannot express.`,
        rel:[
          ['backend-data-access',`Controller-scoped multi-schema transactions via a deferred commit or rollback are exactly this topic's worked idiom.`]
        ],
        links:[
          ['api-errors',`A rollback surfaces to the client through the same domain error type the boundary already knows how to render.`]
        ]
      },
      {
        id:'data-delta-sync', t:'Dirty-table delta sync',
        what:`Every write repository call registers the name of the table it touched into a set carried on the request context. After a handler succeeds, one step reloads exactly those tables, checks them against the client's own generation counter, and returns only the slice that actually changed.`,
        how:[
          `The dirty set lives on the same request-scoped context the rest of the middleware chain already reads and writes.`,
          `A post-dispatch step runs after the handler returns success, reads the dirty set, and issues one reload per distinct table rather than one reload per write call.`,
          `The client's generation counter, sent as a header, is compared so a client already ahead on a given table is not sent data it already has.`,
          `The convention is enforced by review rather than by the compiler: a repository that writes without registering its table produces a client that silently believes the wrong thing about that table.`
        ],
        why:`A response that carries only what changed keeps mobile payloads small and lets the client's local state stay authoritative for everything it was not just told about.`,
        trade:`The rule is invisible at the call site. A new or copy-pasted repository that forgets to register its table does not fail loudly, it desyncs the client, so the convention survives only as a written rule and a review item.`,
        rel:[
          ['backend-data-access',`Dirty-table tracking with a post-dispatch reload is the delta-sync mechanism this topic covers.`],
          ['server-state-sync',`Sending only what changed, gated by a client-held generation counter, is a state-sync strategy in its own right.`]
        ],
        story:`A repository that had been copy-pasted from an older one kept the old table's write calls but never registered its own table in the dirty set. Nothing failed. The handler returned success, the response looked normal, and the only symptom was a slow trickle of support reports from players whose local state disagreed with what the server actually held for one specific screen. Once we knew to look for it, tracing which tables a handler wrote against which tables it registered was a few minutes of reading. The fix was one missing line. What stayed with me is that a convention enforced only by review has exactly the failure mode you would expect: it holds until the one time a reviewer is looking at something else.`,
        links:[
          ['api-routing',`The dirty set this part reads is only meaningful because the middleware chain seeded a clean request context first.`]
        ]
      },
      {
        id:'data-caching-tiers', t:'Three cache tiers',
        what:`Master data that almost never changes lives in a process-local cache. Player and other mutable state goes through a distributed cache shared across instances. A third, per-request cache is seeded and flushed by middleware so a single request never reads the same row from the database twice.`,
        how:[
          `The process-local tier holds config-like master data that is read constantly and only ever written by a deploy, never by a player action.`,
          `The distributed tier fronts anything mutable that more than one instance needs to agree on, with the database as the source of truth behind it.`,
          `The per-request tier is a plain in-memory cache scoped to the request context, created at the top of the middleware chain and discarded at the end, purely to collapse duplicate reads inside one handler.`,
          `Cache misses and writes go through the same repository interfaces as the database, so a handler does not know or care which tier actually answered it.`
        ],
        why:`Three tiers answer three different questions, whether this ever changes, whether instances need to agree, and whether this one request is reading the same thing twice, instead of asking one cache to serve all three at once.`,
        trade:`Three tiers are three places a stale read can hide, and a bug that looks like bad data can just as easily be an invalidation that only cleared one of them.`,
        rel:[
          ['backend-caching-redis',`Process-local, distributed and per-request tiers, each solving a different caching question, is exactly this topic's taxonomy.`]
        ]
      },
      {
        id:'data-redis-jobs', t:'Redis for leaderboards, locks and pub/sub',
        what:`One Redis deployment does three unrelated jobs: sorted-set leaderboards, a distributed lock with retry, and the pub/sub channel the realtime servers fan out through. None of the three was worth its own dedicated store early on.`,
        how:[
          `Leaderboards use a sorted set per leaderboard namespace, with an add-if-higher write so a lower score submitted late never overwrites a better one, plus rank, range and range-by-score reads and a timestamp tiebreak for equal scores.`,
          `The distributed lock manager wraps the same Redis instance with retry, used anywhere two processes could otherwise race on the same resource.`,
          `Pub/sub is the transport the realtime fan-out relies on, so a problem with the Redis instance is a leaderboard problem, a locking problem and a chat problem at the same time.`,
          `A separate queue product handles actual queued work, so Redis itself is never also asked to be a durable job queue on top of everything else.`
        ],
        why:`Reusing one deployment for three jobs was a real cost saving early on, and each job maps cleanly onto a Redis data structure that already does most of the work.`,
        trade:`The three jobs share fate. An operational incident on the Redis instance is a leaderboard incident, a locking incident and a chat incident simultaneously, and nothing at the infrastructure level isolates them from each other.`,
        rel:[
          ['backend-caching-redis',`Sorted-set leaderboards, a distributed lock and pub/sub on one Redis deployment are this topic's three Redis patterns.`],
          ['server-scaling',`Sharing one instance across unrelated jobs is a scaling and blast-radius trade-off in its own right.`]
        ],
        links:[
          ['realtime-fanout',`The pub/sub channel described there runs on the same Redis deployment as the leaderboard and lock jobs here.`]
        ]
      },
      {
        id:'data-migrations-sharding', t:'Migrations and shard selection',
        what:`Each schema has its own migration directory and its own tool configuration, run through the same migration tool across every environment. A shard id read from the environment selects both a configuration block and a numbered schema, so the same code path serves every shard.`,
        how:[
          `One migration directory and one config file per schema, with an environment key per deployment target inside that config, so an environment name is the only thing that changes between running a migration in review and in production.`,
          `A shard id from the environment fixes which numbered schema and which config block a process reads at start up, giving horizontal partitioning of player data without a second code path.`,
          `Schema conventions are written down and enforced by review: a consistent engine, charset and collation, and a higher-precision timestamp type for any mutable player timestamp to avoid a rounding bug at the boundary.`,
          `Migration changes are required to land in their own pull request, separate from the code that will use the new column, so a migration failure and a logic bug are never one diff to bisect.`
        ],
        why:`Splitting migrations by schema keeps a change to one domain from taking a lock on tables it has nothing to do with, and separating migration pull requests from code pull requests makes a bad migration cheap to revert on its own.`,
        trade:`A feature that needs a new column and the code that reads it now needs two pull requests in the right order, and a reviewer has to track that ordering by convention rather than by any automated check.`,
        rel:[
          ['backend-migrations-config',`Per-schema migration directories and shard selection from the environment are this topic's data-partitioning example.`],
          ['infra-data-stores',`Sharding player data by a shard id while keeping one code path is a managed-data-store question at its core.`]
        ]
      }
    ]
  },
  {
    id:'platform', t:'Config, secrets and observability', kind:'infra',
    sum:`Configuration compiled into the binary, environment variables as the only external knob, and the observability stack that makes a live process explainable after the fact.`,
    stack:['Go','viper','logrus'],
    parts:[
      {
        id:'platform-embedded-config', t:'Configuration embedded at build time',
        what:`Configuration is YAML compiled directly into the binary rather than read from a file at runtime, with one file per region using anchors and aliases so many environment blocks inherit from a shared base. Environment variables are the only thing that can change behaviour after the binary is built: environment name, region, shard id and a couple of flags.`,
        how:[
          `A single YAML file holds every environment as its own top-level block, roughly a dozen of them, using anchors and aliases so a lighter environment inherits most of a base block and overrides only what differs.`,
          `The file is embedded into the binary at compile time and read through a config library, keyed by an environment and section path, so there is no config file to lose or mismatch on a host.`,
          `Region, read from the environment, fixes timezone and language at process start, and shard id selects which numbered schema and config block this process instance uses.`,
          `Other static assets, such as certificates and resource manifests, are embedded the same way, so the shipped binary is self-contained.`
        ],
        why:`A build that carries its own configuration cannot be pointed at the wrong environment by a stray file left on a host, and the diff between two environments is visible as plain YAML in one file instead of scattered across servers.`,
        trade:`Changing a single value means a rebuild and a redeploy, and a file this central becomes the place everyone reaches for when something needs to be configurable, including values that should never have been compiled into a binary at all.`,
        rel:[
          ['backend-migrations-config',`Config compiled into the binary with environment variables as the only knob is this topic's configuration half.`],
          ['infra-deploy-models',`A self-describing build artefact is a deploy-model decision, not only a configuration one.`]
        ],
        links:[
          ['platform-secrets-lesson',`The same habit of reaching for this file for anything configurable is exactly how credentials ended up compiled into it.`]
        ]
      },
      {
        id:'platform-secrets-lesson', t:'Secrets ended up in version control',
        what:`Database credentials sat inside the committed migration configuration and the embedded YAML, and a separate CI file carried a plaintext API token and a chat webhook URL. All three were reachable to anyone with read access to the repository, forever, not just to whoever could see the current production values.`,
        how:[
          `The exposure was written up as facts rather than as a complaint: exactly who could read the values today, what an old clone or a departed teammate's checkout still holds, and how long a full rotation would take given the current layout.`,
          `The fix proposed was the smallest first step rather than a platform rewrite: move one environment's values to a secret store injected at deploy time, remove the committed copies, and rotate them.`,
          `Rotation time became the number worth tracking, because a secret that takes most of a day to rotate across every environment is a secret nobody actually rotates until forced to.`,
          `The lesson generalises past credentials: convenience for a build agent needing a file at a path is never a reason for version control to hold that file.`
        ],
        why:`A private repository is not a secret store. Everyone who ever had read access, every CI cache and every old clone keeps a plaintext credential indefinitely, so the only real fix is a store that injects the value at deploy time and never writes it into the repository's history.`,
        trade:`Moving one environment was the smallest possible ask and it worked, but the full history was never rewritten, so the old values stay reachable in git history even after rotation makes them useless as credentials.`,
        rel:[
          ['infra-secrets',`Committed credentials, the framing as facts rather than complaint, and rotation time as the metric are this topic's central case.`]
        ],
        story:`I found database passwords in migration configuration and a token and a webhook in the CI file. It predated me, everyone already knew, and the cleanup competed with feature deadlines, so an outraged message would have achieved nothing. I wrote the exposure as facts instead: who can read those values today, what an old clone gives someone who has left, and how long a full rotation takes with the current layout, which was most of a day across environments. Then I proposed the smallest first step rather than a platform project, moving one environment to values injected at deploy time from a secret store, with the committed copies removed and rotated. That environment's rotation time went from most of a day to one deploy. I did not get the history rewritten, and that is the part I quote in interviews: a pushed secret is compromised, the remedy is rotation, and the only real prevention is a check before the commit.`
      },
      {
        id:'platform-observability', t:'Multi-stream logging and an APM abstraction',
        what:`Named log streams, one each for the application, application errors, SQL, cache, Redis, the action log, execution time, and a pair per realtime server, each write to their own file with their own level and stack depth, all driven from the same config. Tracing sits behind an interface with two swappable backends, so a route registration and a transaction name are declared together instead of as two separate steps.`,
        how:[
          `Logging is context-propagated: the request-context middleware attaches the logging handle once, so every layer below logs through the same handle without importing a logging package directly.`,
          `Log rotation is signal-driven: a goroutine listens for the standard rotation signals and reopens every log file in place, handshaking with the external log rotation tool rather than the process owning its own rotation schedule.`,
          `The tracing abstraction exposes segment and span helpers for database, cache and Redis calls, and the router wrapper names a transaction per route at registration time, so tracing coverage tracks routing coverage automatically.`,
          `A generated action-log package, one type per game event built from a data descriptor, writes an append-only stream with personally identifying fields hashed before they leave the process.`
        ],
        why:`Splitting logs by concern turns a question like whether the database is slow into one file to open instead of a full text search across everything, and naming a tracing transaction at the same place a route is declared means tracing coverage cannot silently fall behind routing coverage.`,
        trade:`A dozen or more log files is more than one operator, so the split earns its keep only once someone has the muscle memory of which file answers which question, and it is a poor fit for search tooling that expects one stream.`,
        rel:[
          ['backend-observability',`Multi-stream logging, signal-driven rotation and a tracing abstraction named at routing time are this topic's core practices.`]
        ],
        links:[
          ['api-routing',`The transaction naming this part relies on happens at the same tracing wrapper that api-routing registers every endpoint through.`]
        ]
      }
    ]
  },
  {
    id:'cicd', t:'Build, CI and deploy', kind:'cicd',
    sum:`A pull request gate cheap enough to run on every review, a heavier push gate that proves the schema and every server mode actually boot, a build that stamps its own provenance, and a docker-compose stack for local development.`,
    stack:['Drone','Docker','MySQL','Redis','memcached'],
    parts:[
      {
        id:'cicd-pipeline-stages', t:'Two-speed CI: lint on PR, full provision on push',
        what:`A pull request runs lint and unit tests only, fast enough to give feedback inside a review cycle. A push to the integration branch runs a much heavier stage: creating every schema from zero, running every migration in order, seeding master data, building every server mode and running the full end to end suite against the running binaries.`,
        how:[
          `The lighter pull-request stage exists specifically because the heavy stage takes tens of minutes, too slow for how often a reviewer wants feedback during one review.`,
          `The heavy stage provisions every schema from nothing rather than reusing a persisted database, because migration order and seed drift are exactly the failures a pre-existing database would hide.`,
          `Ephemeral service containers back both stages, so the database, cache and Redis a test hits are the same version as production rather than whatever happens to be on a shared box.`,
          `A chat notification closes the push pipeline, so a broken push stage is visible immediately rather than discovered at the next person's pull request.`
        ],
        why:`Splitting the gate by cost buys fast per-review feedback without pretending that lint and unit tests are the same thing as proving the schema and the full binary actually boot together.`,
        trade:`The split has a real cost: a pull request can show green while the check that would actually catch a schema or wiring problem has not run yet, so a branch is not fully verified until after it merges.`,
        rel:[
          ['infra-ci-pipelines',`Gating differently on a pull request than on a push, and grading what each stage actually proves, is this topic's central trade-off.`],
          ['quality-and-build-health',`Naming out loud what a green tick did not cover, instead of letting it imply more than it proved, is build health as a practice.`]
        ],
        story:`As the person who owned the backend conventions, I had a main branch that went red on schema changes and a team that had learned to expect it. The pull request gate only ran lint and unit tests, so a branch was never actually proven until it merged. I moved the expensive verification into the push pipeline: create every schema from zero, run every migration in order, seed master data, build, start each server mode and run the end to end suite. Schema breakage moved out of the release window after that. I also said the part I had not fixed out loud in review, that pull request checks still only covered lint and unit tests, rather than letting a green tick on a pull request imply more than it actually proved.`,
        links:[
          ['data-migrations-sharding',`The full provisioning this stage runs is what actually exercises every schema and every migration directory.`]
        ]
      },
      {
        id:'cicd-build-and-deploy', t:'Build provenance and process-oriented deploy',
        what:`The build stamps the binary with its version, git hash, build date and Go toolchain version through linker flags, alongside a client-facing version value read from data already sitting in the master schema. Deploy is a shell supervisor running one process per server mode on consecutive ports, each writing to its own log file, rather than a container orchestrator.`,
        how:[
          `Version, commit hash, build date and Go version are injected at link time, so a running binary can report exactly what it was built from without a separate manifest file.`,
          `The client-facing version is read from master data rather than baked into the binary, so a version bump the client needs to see does not by itself require a server redeploy.`,
          `The build produces one main binary plus roughly twenty batch binaries from the same module, so a single build step covers every process role the mode flag can select.`,
          `The shell supervisor starts and stops each mode by name on its own port and log file, and migrations run as their own explicit step scoped per schema and per environment, kept separate from the application deploy.`
        ],
        why:`A binary that can name its own build is a debugging shortcut when a live incident starts with figuring out which version is running, and keeping migrations as their own step means a bad migration and a bad deploy are never the same rollback.`,
        trade:`There is no orchestrator managing process placement, restart policy or scaling, so all of that lives in shell scripts and in whoever operates them, a real capability gap against a platform that handles it natively.`,
        rel:[
          ['infra-artifacts-provenance',`Stamping a binary with its own version, commit and build date is exactly this topic's provenance practice.`],
          ['infra-deploy-models',`A shell supervisor running named processes on fixed ports is one deploy model among several this topic compares.`]
        ],
        links:[
          ['tooling-batch-binaries',`The roughly twenty batch binaries this build step produces are the same artefacts that part schedules and documents.`]
        ]
      },
      {
        id:'cicd-dev-environment', t:'Docker-compose development stack',
        what:`A local development environment brings up the same shape of dependencies the pipeline uses, MySQL, Redis and memcached, plus an application container holding the toolchain, on a user-defined bridge network, with source bind-mounted so editing happens on the host and building happens in the container.`,
        how:[
          `The application container's image is templated per host CPU architecture by a setup script, rather than committed as several fixed Dockerfiles.`,
          `MySQL gets an init script directory for seed data and bind-mounted data, log and configuration paths, so a fresh checkout can seed a working database without a manual step.`,
          `Redis persists to a volume so restarting the stack does not silently discard leaderboard or lock state a developer was relying on.`,
          `The setup script also collects developer identity and an SSH key as part of bringing the stack up, wiring source control access into the same one-command setup.`
        ],
        why:`Matching the pipeline's dependency versions locally means a bug that only reproduces against a specific MySQL or Redis version shows up on a laptop instead of only in CI.`,
        trade:`The compose file and the pipeline's service container definitions are two places describing similar dependencies, so a version bump in one has to be remembered in the other, and nothing enforces that they stay in sync.`,
        rel:[
          ['infra-containers',`A compose-based local stack matching the pipeline's own dependency versions is this topic's development-environment case.`]
        ]
      }
    ]
  },
  {
    id:'tooling', t:'Batch jobs and admin tooling', kind:'tooling',
    sum:`Everything that keeps the live product operable outside the player-facing path: scheduled batch binaries, an admin and debug server on its own mode, and the ops scripts that move code and data between environments.`,
    stack:['Go','MySQL'],
    parts:[
      {
        id:'tooling-batch-binaries', t:'Scheduled and manual-recovery batch binaries',
        what:`Around twenty small binaries build from the same module as the main server, each doing one scheduled or on-demand job: aggregating win streaks, sweeping orphaned submissions, syncing derived data, and similar maintenance work that does not belong inline in a request.`,
        how:[
          `Each batch binary carries a header comment documenting its own cron schedule, or stating plainly that it is manual-recovery-only and must never be put on a schedule.`,
          `Batches reuse the same dependency-injected graph pattern as the server modes, wired for a one-shot run instead of a long-lived process.`,
          `Aggregation jobs and timeout sweeps run here specifically because they need to scan across many rows, a bad shape for an inline request handler.`,
          `Deploy for a batch binary is the same build artefact as the server, just invoked differently, as a cron job or as a manual recovery command, never as a long-running mode.`
        ],
        why:`Pulling scan-and-aggregate work out of the request path keeps player-facing latency independent of maintenance work, and documenting schedule versus manual-only in the binary itself means the answer to whether it is safe to run right now travels with the code instead of living in someone's memory.`,
        trade:`Twenty small binaries from one module is twenty things that can silently stop being scheduled if a cron entry is lost, and nothing forces the header comment to stay honest once someone changes the schedule and not the file.`,
        rel:[
          ['server-liveops',`Cron-scheduled batches for aggregation and cleanup, separate from the request path, are this topic's live-operations mechanics.`],
          ['infra-deploy-models',`Reusing one build artefact for a server mode and for a scheduled batch job is a deploy-model decision.`]
        ],
        links:[
          ['cicd-build-and-deploy',`These binaries are produced by the same build step that stamps the main server with its version.`]
        ]
      },
      {
        id:'tooling-admin-debug-server', t:'Admin and debug surfaces as their own mode',
        what:`Administrative tooling and QA data setup are not privileged routes bundled into the player-facing router. They are a different mode of the same binary, serving server-rendered pages behind basic authentication, plus a family of debug endpoints under their own path prefix and port for setting up test data.`,
        how:[
          `The admin mode renders server-side HTML through a template engine, kept deliberately simple rather than shipping a separate frontend for internal tooling.`,
          `Basic authentication in front of the whole mode is judged sufficient because the mode listens on its own port, not the one a player-facing load balancer forwards.`,
          `Debug and end to end setup endpoints live under their own prefix and their own port as well, so they can be excluded from a public deployment by network policy rather than by trusting every handler to check its own guard.`,
          `The debug endpoints exist specifically to let the end to end suite and QA set up data states that would otherwise need many real requests to reach.`
        ],
        why:`Keeping admin and debug entirely out of the player-facing router means a bug in the route table cannot accidentally expose an administrative action to a player, because the code paths never share a listener.`,
        trade:`A second mode is a second thing to build, deploy and keep patched, and listening on a different port is a network-policy assumption that has to actually hold in every environment, including a developer's own laptop where ports are rarely firewalled.`,
        rel:[
          ['server-liveops',`Admin tooling as a separate mode behind basic auth, used for maintenance gates and data setup, sits inside this topic.`],
          ['infra-secrets',`Basic auth as the only barrier in front of an administrative mode is a secrets-and-access trade-off worth naming.`]
        ]
      },
      {
        id:'tooling-ops-toolbox', t:'Ops scripts: DDL diffing and cross-environment sync',
        what:`A dedicated scripts directory holds the day-to-day operational tools that do not belong in the application itself: comparing schema definitions between branches, syncing schema, master data or user data across environments with a cache flush, and wrapping the code and mock generation steps developers run by hand.`,
        how:[
          `A DDL diff tool compares the schema two branches would produce, catching a migration that silently reorders or drops a column before it reaches an environment that matters.`,
          `Cross-environment sync scripts move schema, master data or full user data snapshots between environments, always paired with a cache flush so a synced environment does not keep serving stale cached values afterward.`,
          `The same toolbox wraps proto generation, the entity and repository generator that reads database descriptors, and a selective mock generator invoked by interface name, so those generators have one documented entry point instead of being remembered as raw commands.`,
          `A stress-test harness and an error-report aggregator live alongside the sync scripts, treated as the same category of tool: operational, not shipped, but load-bearing.`
        ],
        why:`Centralising these as scripts instead of tribal-knowledge commands means the operation itself, not just its output, is reviewable and repeatable by the next person who needs to run it.`,
        trade:`The toolbox grows in step with the operational needs of the project and nobody owns pruning it, so a script needed once during a migration tends to outlive the migration and sit there unused but undeleted.`,
        rel:[
          ['infra-data-stores',`Cross-environment sync with a cache flush, and diffing schema between branches, are operational data-store practices this topic covers.`],
          ['backend-migrations-config',`A DDL diff tool exists to catch exactly the migration drift this topic's schema conventions are meant to prevent.`]
        ],
        links:[
          ['data-migrations-sharding',`The DDL diff tool exists specifically to catch drift between what the migration directories there should produce and what a branch actually produces.`]
        ]
      }
    ]
  },
  {
    id:'process', t:'Engineering process: rules, red-first, migration PRs, E2E integrity', kind:'process',
    sum:`The written rules that made the rest of this project maintainable: tests that fail before a fix exists, end to end expectations that owe nothing to the code under test, and migrations that never ride along with a feature.`,
    stack:['Go','TypeScript','Mocha'],
    parts:[
      {
        id:'process-red-first', t:'Red-first discipline as a written rule',
        what:`A bug fix or a feature is required to land its failing test first, shown red, before the change that makes it pass. The pull request body carries both the red pre-fix log tail and the green post-fix one, so a reviewer sees the failure the change actually addresses.`,
        how:[
          `The red log tail has to exist and be shown, not just claimed, so a reviewer can tell a real regression test from a test written to match whatever the fix happened to do.`,
          `The pull request template has a dedicated slot for pasting red and green evidence, making the discipline something the process asks for by default rather than something a reviewer has to remember to request.`,
          `The rule applies to bug fixes and features equally: a new feature's acceptance test is expected to fail against the code as it stood before the feature existed.`,
          `Golden-trace and other characterisation-style tests follow the same shape, a known-bad case has to be shown failing the check before the check is trusted to gate anything.`
        ],
        why:`A test written after the fix tends to test what the fix does, not what the bug was, and the difference only shows up the next time someone touches that code. Seeing the test fail first is the only proof it would have caught the original bug.`,
        trade:`The discipline depends entirely on the pull request template being filled in honestly, and it slows down a fix the author considers obvious, exactly the situation where the rule is easiest to skip.`,
        rel:[
          ['quality-and-build-health',`Requiring red-then-green evidence in every pull request is a concrete build-health practice, not just a testing habit.`],
          ['pm-postmortems',`Red-first is a standing answer to the same question a post-mortem asks after the fact: would this have been caught earlier.`]
        ],
        links:[
          ['process-e2e-integrity',`The same evidence-over-assertion principle governs how an end to end expectation gets written, not only how a fix gets proven.`]
        ]
      },
      {
        id:'process-e2e-integrity', t:'End to end integrity rules',
        what:`The end to end suite is a separate TypeScript test project hitting the running binaries over real HTTP with generated protobuf clients. A short set of rules governs what an expected value in that suite is allowed to be, because an end to end test is the easiest place in the whole project to accidentally test nothing.`,
        how:[
          `An expected value has to be derived independently, from master data or from the specification's own math, never pasted from what the code under test printed while the test was being written.`,
          `A setup step that fails must fail the test outright, never call skip, because a silently skipped setup makes every assertion after it vacuously true.`,
          `Weakening an assertion to make a test pass is forbidden outright, because the assertion existed to check something specific and a weaker one checks less than the thing it was named for.`,
          `A previously green case turning red is treated as the change being wrong by default, not as the test being outdated, until someone actively argues and shows why the test's assumption is what changed.`
        ],
        why:`An end to end suite this large is easy to keep green by accident, either by pasting observed output as the expectation or by quietly skipping a flaky setup, and both failure modes look identical to a passing suite from the outside.`,
        trade:`Deriving every expectation independently is slower to write than reading the output and pasting it, and treating a green-to-red flip as guilty until proven innocent means a legitimate intentional behaviour change has to argue its case in review rather than just updating the number.`,
        rel:[
          ['quality-and-build-health',`Rules that stop a large end to end suite from being green by accident are a direct build-health practice.`],
          ['pm-qa-release',`What an end to end suite is allowed to assert, and what makes its green tick trustworthy, is QA planning made concrete.`]
        ],
        story:`I found expected values in end to end tests that had been pasted from what the code printed when the test was written. That kind of test proves the code did something, not that it did the right thing, and it stops failing the moment a bug becomes consistent instead of getting fixed. I rewrote the rule as policy rather than as a one-time cleanup: expectations get derived from master data or from the specification's own math, a failing setup is red and never skipped, and a previously green case turning red means the change is wrong until someone shows otherwise. The habit I carry from it is to ask, of any end to end assertion, where the expected number actually came from before trusting that it ever tested anything.`
      },
      {
        id:'process-conventions', t:'Migration PR separation and rule files as memory',
        what:`A migration that changes a schema is required to land in its own pull request, separate from any code that reads the new column, and the project's conventions live as versioned rule files next to the code they govern rather than in one document nobody opens.`,
        how:[
          `Migration pull requests and code pull requests are kept apart so a migration failure or a bad migration rollback is never entangled with a logic change in the same diff.`,
          `Rule files sit next to what they govern, for example a controller-skeleton rule inside the controllers directory and the end to end conventions inside the end to end suite's own directory, so the rule is discovered by being in the way rather than by being remembered.`,
          `An index file names the rules that always apply across the whole project, with an explicit statement that a written project rule outranks whatever an individual contributor happens to remember from before.`,
          `The pull request template itself encodes policy: a purpose, a cause, a solution, a verification checklist expecting pasted red and green evidence, and references, written for readers in more than one language.`
        ],
        why:`A team that grows past the size where everyone remembers every decision needs the decision written down next to the code, or the same argument gets relitigated every time a new person touches that code.`,
        trade:`Rule files need someone to keep them current, and a stale rule file nobody prunes is worse than no rule file, because it is still read as authoritative after the practice it describes has changed.`,
        rel:[
          ['lead-conventions',`Written rule files next to the code they govern, with explicit precedence over memory, are this topic's central practice.`],
          ['team-and-collaboration',`Migration PR separation and a shared PR template are handoff artefacts that make collaboration on a live schema possible.`]
        ],
        links:[
          ['process-red-first',`The pull request template that carries red and green evidence is the same template this part's policy fields live in.`]
        ]
      }
    ]
  }
]);
