/* =====================================================================
   EXPERIENCE: ANONYMISED CASE STUDIES
   Shipped work told as shape, decision, trade-off and lesson. Never a name:
   no product, codename, employer, host, schema, internal path, colleague or
   business figure. Public library and vendor names are fine. Each case is a
   page under #/experience and its STAR stories are what an interview
   actually asks for.

   CASE({
     id:'',                                  // url slug, unique
     t:'',                                   // the case study title, anonymised
     role:'', period:'',                     // "Server engineer", "2 years"
     stack:[''],                             // public tech names only
     context:'',                             // what the thing was and what it had to do
     arch:[''],                              // the architecture, one line per piece
     decisions:[{d:'',why:'',trade:''}],      // 5-8 decisions, each with its cost
     lessons:[{what:'',lesson:''}],           // what went wrong, what it taught
     stories:[{s:'',t:'',a:'',r:''}],         // 3-5 STAR interview stories
     rel:[['topic-id','why this case is evidence for that topic']]
   })
   ===================================================================== */

const CASE_STUDIES = [];
function CASE(o){ CASE_STUDIES.push(o); }

/* ---------------------------------------------------------------------
   PROJECT SYSTEMS
   A case study is also a browsable project: its systems and the parts
   inside each, drawn as a mind map under #/experience/<cs>. Attached to an
   existing case the same way ENGINE and INTERVIEW attach to a topic, so
   the systems live in their own files (33-35) and the case stays readable.

   SYSTEMS('cs-id', [{
     id:'', t:'', kind:'',                  // kind is one of KIND_COLOR below
     sum:'',                                // one or two sentences: what this system is
     stack:[''],                            // public tech names only
     parts:[{
       id:'',                               // prefixed by the system id: "api-routing"
       t:'',
       what:'',                             // 2-4 sentences: what it is and how it fits
       how:[''],                            // 3-6 bullets: how it actually worked
       why:'',                              // the decision behind it, 1-3 sentences
       trade:'',                            // what it cost, 1-3 sentences
       rel:[['topic-id','why this part demonstrates that topic']],   // at least one
       links:[['part-id','why it depends on that part']],            // optional, same project
       story:''                             // optional first-person interview paragraph
     }]
   }])

   6 to 8 systems per project, 2 to 5 parts each. Ids unique within a
   project. The same anonymisation rule as the case itself applies to every
   string: the technique travels, the names do not.
   --------------------------------------------------------------------- */
const KIND_COLOR = {
  client:'var(--d-ux)', server:'var(--d-server)', backend:'var(--d-backend)', data:'var(--d-systems)',
  infra:'var(--d-infra)', cicd:'var(--d-production)', tooling:'var(--d-studio)', process:'var(--d-management)'
};
const KIND_LABEL = {
  client:'Client', server:'Game server', backend:'Backend', data:'Data',
  infra:'Infrastructure', cicd:'CI / CD', tooling:'Tooling', process:'Process'
};
function SYSTEMS(csId, arr){ const c = CASE_STUDIES.find(x => x.id === csId); if(!c) throw new Error('SYSTEMS: unknown case ' + csId); c.systems = arr; }

CASE({
  id:'cs-go-game-backend',
  t:'A Go backend for a live mobile game',
  role:'Server engineer, later backend lead',
  period:'3 years, live product',
  stack:['Go','protobuf','gorilla/mux','google/wire','MySQL','Redis','memcached','goose'],
  context:`One Go module produced every server process behind a live mobile game: the public API, an admin tool server, two WebSocket servers and about twenty scheduled batch binaries. Traffic was bursty around event starts and content drops, and the client shipped on a two week cadence while the server shipped continuously. The core mode was a simulation the client played out for responsiveness and the server re-ran to decide the real result. I joined as one of several server engineers and later owned the backend and its conventions.`,
  arch:[
    `Clean layering with one direction. HTTP controllers call interactors, interactors call repository interfaces they own, and concrete adapters for database, cache, queue and tracing are injected inward. Nothing in the business layer imports a driver.`,
    `Compile-time dependency injection. A code generator builds the object graph at build time, so a missing binding is a build failure rather than a nil pointer in production.`,
    `One binary, several modes. A mode flag selects which graph is built: public API, admin tool, chat and presence, matched sessions. Same module, different process roles, same deploy artefact.`,
    `Protobuf over plain HTTP rather than gRPC. Form encoded requests bound through a declarative field map, protobuf responses, and custom headers carrying session, platform, client version, master data version and a state generation counter.`,
    `Seven MySQL schemas behind one host abstraction, each with a replica and its own migration directory, plus a shard id taken from the environment that selects both a config block and a numbered schema.`,
    `Three cache tiers. A process local cache for immutable master data, a distributed cache for player state, and a per request memo cache seeded and flushed by middleware so one request never reads the same row twice.`,
    `Redis doing three unrelated jobs. Sorted set leaderboards, a distributed lock with retry, and pub/sub fanned out across instances by hashing the channel name.`,
    `Two WebSocket servers speaking length prefixed protobuf frames of message id, op code and payload. One carries chat and presence, the other owns matched sessions and hands peers to a session object.`,
    `A deterministic simulation package that re-runs on the server exactly what the client ran, down to the last bit, with a golden trace test standing between it and every merge.`,
    `A domain error type carrying a numeric code, an HTTP status, a wire payload and the stack captured at the wrap site, with code blocks of one thousand allocated per subsystem.`
  ],
  decisions:[
    { d:`Compile-time dependency injection instead of a runtime container.`,
      why:`Wiring errors surface at build time, and the generated graph is ordinary readable Go, so a new engineer can follow construction by reading one file instead of learning a framework.`,
      trade:`The generated graph is thousands of lines, every new provider needs a regeneration step, and merge conflicts inside generated code are a weekly tax. It also means adding a dependency is never a one line change.` },
    { d:`Protobuf over HTTP rather than gRPC.`,
      why:`Mobile clients keep ordinary HTTP semantics through proxies, load balancers and CDNs, payloads stay small and typed, and every existing middleware still applies.`,
      trade:`No streaming and no generated client stubs. The client hand writes thin wrappers over the generated message types, and both sides have to agree on a header contract that no tool validates.` },
    { d:`The client simulates, the server re-simulates and verifies.`,
      why:`The player sees the result immediately with no round trip, and the outcome that counts still comes from the server, so a tampered client cannot bank a win it did not earn.`,
      trade:`Two implementations of one algorithm have to stay bit exact forever. That cost a frozen random generator, hand written math helpers and a golden trace suite that every simulation change has to pass.` },
    { d:`Delta state sync driven by a dirty table set on the request context.`,
      why:`Every write repository call registers the table it touched. After the handler succeeds, one step reloads exactly those tables and returns them, so the response carries what changed instead of the whole player.`,
      trade:`The rule is invisible at the call site. A repository that writes without registering desyncs the client silently, so it survives only as a convention plus a review item.` },
    { d:`Controller scoped transactions across several schemas, using a named return error and a deferred commit or rollback.`,
      why:`A request that touches three schemas commits or rolls back as a single decision, written once at the top of the handler instead of at every early return.`,
      trade:`It is a Go idiom that reads as magic until someone explains it. Write repositories had to assert they were handed a transaction and not a plain session, because the compiler cannot tell the difference.` },
    { d:`Configuration compiled into the binary, with environment variables as the only external knob.`,
      why:`A build is self describing and cannot be pointed at the wrong environment by a stray file on the host. Region and shard come from the environment and fix timezone, language and schema selection at start up.`,
      trade:`Changing one value needs a rebuild and a redeploy. It also made the committed config file feel like the natural home for credentials, which is exactly the wrong lesson to draw.` },
    { d:`Idempotency enforced in middleware with an add if absent cache key scoped to player, method and path.`,
      why:`Mobile networks retry whether or not the API was designed for it, and a duplicated state change is indistinguishable from a bug to the player who paid for it twice.`,
      trade:`A short expiry window is a guess. Too long blocks legitimate rapid actions, too short lets a slow retry through, and genuinely repeatable endpoints have to be exempted by hand.` },
    { d:`Every push provisions all schemas from zero, migrates, seeds master data, boots every mode and runs the end to end suite.`,
      why:`Migration order and seed drift are the failures that hurt during a release window, and they only appear when a database is built from nothing.`,
      trade:`The pipeline takes tens of minutes, so the per pull request check was cut down to lint and unit tests. The real verification arrives after merge, which means the branch was never the thing that was proven.` }
  ],
  lessons:[
    { what:`Database credentials sat in committed migration configuration, and an API token and a chat webhook sat in the CI file.`,
      lesson:`A private repository is not a secret store. Every old clone, every CI cache and everyone who ever had read access holds those values forever, and rotation means touching every environment at once. Secrets belong in a store injected at deploy time, and the number worth measuring is how long a full rotation takes. Once a secret is pushed the fix is rotation, not deletion, so the guard has to sit at the moment of writing.` },
    { what:`Two copies of one simulation drifted after a compiler was free to contract a floating point expression.`,
      lesson:`Bit exactness is a property of the whole toolchain, not of the source you read. We wrote the math helpers to forbid fused multiply add, ported the random generator bit for bit rather than by behaviour, and froze traces in CI. When two implementations must agree, the test compares traces step by step, never final results.` },
    { what:`Expected values in end to end tests were sometimes pasted from what the code had printed.`,
      lesson:`A test built from observed output proves the code did something, not that it did the right thing. Expectations get derived from master data or from the specification maths, a failing setup is red and never skipped, and a previously green case turning red means the change is wrong until proven otherwise.` },
    { what:`Pull request checks were green while the branch was not verified.`,
      lesson:`A gate that runs a subset answers a subset, and the team reads the tick as if it answered everything. Either move the expensive truth before the merge or say out loud, in the review, what the green tick did not cover.` }
  ],
  stories:[
    { s:`The client and the server disagreed about who won a match, rarely, and only on some devices.`,
      t:`I owned the server side re-simulation. The contract was that the client plays the match out for responsiveness and the server re-runs the same inputs to decide the real result. A small number of matches came back with a different outcome. To a player that looks like the game taking a win away, so the acceptable rate was zero rather than low.`,
      a:`I built a trace exporter on both sides that dumped every step of the simulation rather than the final result, then diffed them step by step to find the first divergence. It was a floating point expression the compiler was allowed to contract into a fused multiply add, so identical inputs produced different last bits. I rewrote the shared math helpers to forbid contraction, ported the random generator bit for bit instead of reimplementing its behaviour, and froze a set of traces as a test that fails on any byte difference.`,
      r:`Disagreements went to zero and stayed there through two years of balance changes, because that test ran on every push and caught three later regressions inside branches. The habit I kept is to compare traces rather than results whenever two implementations have to agree.` },
    { s:`Players on unstable connections were having the same state change applied twice.`,
      t:`Duplicate requests from client retries were committing twice. I had to stop it without blocking players who legitimately tap quickly, and without rewriting every handler.`,
      a:`I put an add if absent lock in the distributed cache, keyed on player, method and path with a short expiry, taken in middleware before the handler ran. A second copy arriving inside the window got the stored response instead of a second commit. I went through the endpoint list and exempted the ones that are genuinely repeatable, because a blanket gate would have made rapid legitimate actions feel broken.`,
      r:`The duplicate reports stopped and the change was one middleware plus a table of exemptions. What I carry from it is that a mobile client retries whether or not you planned for it, so every state changing endpoint needs an answer to what happens when this arrives twice.` },
    { s:`Migrations kept breaking after the merge and never before it.`,
      t:`As the person who owned the backend conventions, I had a main branch that went red on schema changes and a team that had learned to expect it. The fix had to change where the truth ran, not just add more review.`,
      a:`I moved the expensive verification into the push pipeline: create every schema from zero, run every migration in order, seed master data, build, start each server mode and run the end to end suite. I wrote down two rules the team had been improvising, that migration changes go in their own pull request separate from code, and that an expected value in an end to end test comes from master data or the specification maths and never from observed output.`,
      r:`Schema breakage moved out of the release window. I also named the part I had not fixed. Pull request checks still ran only lint and unit tests, so a branch was not verified until it merged, and I said that in review rather than letting a green tick imply more than it proved.` },
    { s:`I found live credentials committed in the repository and had to decide how to raise it.`,
      t:`Database passwords were in migration configuration and a token and webhook were in the CI file. It predated me, everyone knew, and the cleanup competed with feature deadlines, so an outraged message would have achieved nothing.`,
      a:`I wrote the exposure as facts instead of as a complaint: who can read those values today, what an old clone gives someone who has left, and how long a full rotation takes with the current layout, which was most of a day across environments. Then I proposed the smallest first step rather than a platform project, moving one environment to values injected at deploy time from a secret store, with the committed copies removed and rotated.`,
      r:`That environment moved and its rotation went from most of a day to one deploy. I did not get the history rewritten, and that is the part I quote in interviews. A pushed secret is compromised, the remedy is rotation, and the only real prevention is a check before the commit.` }
  ],
  rel:[
    ['backend-layering',`This is the layering and the compile-time injection running at production scale, including what the generated graph costs day to day.`],
    ['backend-data-access',`Multi schema transactions, a SQL builder over an ORM and dirty table delta sync are all decisions in this case, each with its price.`],
    ['server-determinism',`The parity test between a client simulation and a server re-simulation is the worked example of why traces beat results.`],
    ['infra-secrets',`The plaintext credential story here is the concrete version of why a private repository is not a secret store.`],
    ['quality-and-build-health',`Provisioning every schema from zero on each push, and admitting what the pull request check did not cover, is build health as a practice.`],
    ['metrics-and-success',`The generated action log stream with hashed identifiers is how the live game was measured without shipping personal data into analytics.`]
  ]
});

CASE({
  id:'cs-unity-mobile-client-ci',
  t:'A Unity mobile client and its CI',
  role:'Unity client engineer, later owner of the build and CI',
  period:'3 years, live product',
  stack:['Unity','C#','Addressables','UniTask','protobuf','gRPC','Jenkins','PowerShell'],
  context:`One Unity codebase produced a mobile client, a desktop build, a WebGL build and a headless server process, all from the same source with content excluded per target. A second repository held the pipelines: declarative build definitions, reusable PowerShell modules and tests of the CI itself. I worked on client systems first and then took over the build and pipeline side, which is where most of the interesting failures lived.`,
  arch:[
    `Assemblies layered in one documented direction, entry point to app to game to shared to core, enforced by a written rule and by review rather than by a tool.`,
    `The largest assembly holds screen and feature logic. New feature folders join it through an assembly reference file instead of creating another compile unit.`,
    `Boot is one explicit sequence. Boot scene, serializer set up, an async bootstrap that registers services in a fixed order, an additive persistent scene, the first transition, then the boot scene unloads itself.`,
    `Dependency injection is a typed static service locator. One instance per type, duplicate registration throws, an unresolved lookup throws, and a scene object owns the disposable handles and unwinds them on destroy.`,
    `Assets go through Addressables behind a wrapper with a four value scope: resident, current base scene, current overlay, next scene. Scene transitions promote the next scope and release the rest.`,
    `Two asset channels, downloaded from a CDN or shipped inside the build, with a per platform resource list and a graphics tier fallback so low end devices fetch a smaller manifest from the same path.`,
    `Two network stacks. Request and response game traffic is protobuf over HTTP with a fluent header builder owning session, versions, platform and language. A separate HTTP/2 channel carries push notifications.`,
    `A realtime assembly with hand rolled binary framing of type, message id, op code and payload, reply correlation so request and response works over a push socket, and a compile-time transport swap for WebGL.`,
    `Test code lives in editor only assemblies gated by a test define so it cannot ship, with a third tier on real devices that walks every non debug scene and reports transition time, memory and frame rate.`,
    `Builds run through one editor entry point parameterised entirely by command line, with content exclusion declared in XML path lists that are mirrored as sparse checkout excludes on the agent.`
  ],
  decisions:[
    { d:`A one way assembly dependency chain, refused rather than negotiated when a feature wanted to invert it.`,
      why:`It is the only property that keeps a large client compiling in pieces and keeps core code reusable. Once one exception exists the direction stops being a fact and becomes a preference.`,
      trade:`It costs interfaces and events where a direct call would have been shorter, and it makes some features genuinely harder to place. You pay in ceremony to keep the graph acyclic.` },
    { d:`Fold new feature folders into an existing assembly with a reference file instead of adding assemblies.`,
      why:`Each new assembly is another compile unit, another set of references to maintain and another chance to reference the wrong way.`,
      trade:`The biggest assembly keeps growing, so its compile time is the one everybody waits on and nothing inside it is structurally prevented from touching anything else.` },
    { d:`Asset lifetime scoped to scene layers and released on transition events.`,
      why:`Bundle leaks are the default failure of a large Addressables project, and tying release to the transition that already exists means nobody has to remember a matching release call.`,
      trade:`A handle given the wrong scope survives until that scope changes, which shows up as memory rather than as an error, so it needs diagnostics under a debug define to be findable at all.` },
    { d:`A typed static service locator instead of a container framework.`,
      why:`No reflection cost on mobile, registration order visible in one bootstrap method, and both failure modes are loud. Registering twice throws and resolving something unregistered throws.`,
      trade:`It is global state with a nicer name. Ordering bugs concentrate in boot, and where a dependency is registered later in the same method we had to pass a resolver function rather than a value, which is a wart with a comment on it.` },
    { d:`Collapse eight near identical build jobs into one pipeline driven by a table keyed on the job name.`,
      why:`Eight copies had drifted, and the differences between them were four parameters. One pipeline makes the difference between targets readable in one file.`,
      trade:`One pipeline is now a single point of failure for every target, and a change made for one job has to be reasoned about for all of them.` },
    { d:`Detect engine build failure two ways, by a curated list of fatal log patterns and by the process exit code.`,
      why:`The editor can fail in ways that still exit zero, and it can also exit non zero after a successful build. Either signal alone had already let a broken artefact through.`,
      trade:`The pattern list is maintenance, and it is wrong by default after an engine upgrade. It is a list that has to be reviewed rather than trusted.` },
    { d:`Declare excluded content in XML path lists and mirror the same lists as sparse checkout excludes in CI.`,
      why:`Content that is not on the agent cannot be built into the player by accident, and the exclusion becomes reviewable text rather than a build script branch.`,
      trade:`Two lists that must agree. A folder renamed in one place and not the other either breaks the build or ships something that was meant to stay internal.` },
    { d:`Debug surfaces behind conditional attributes rather than preprocessor blocks.`,
      why:`On a release define the call site disappears along with its arguments, so an expensive interpolated string in a debug log costs nothing, and the source stays readable with no conditional noise.`,
      trade:`The behaviour now depends on a define set by the pipeline, so a mis-set parameter produces a build that is silently missing diagnostics, and people debugging get confused by code that visibly exists and demonstrably never runs.` }
  ],
  lessons:[
    { what:`Live secrets were committed in plaintext across the CI configuration, the build scripts and the client repository.`,
      lesson:`Bot tokens, a service account key file, a signing password in a build script and the signing key itself had all been committed because a pipeline needed them at a path. A build agent needing a file is not a reason for version control to hold it. Inject at build time from a credential store, and treat every one of those values as already compromised the day you find it.` },
    { what:`A UI test called the button handler directly and passed while the real button was unreachable.`,
      lesson:`A synthetic call proves the handler runs. It says nothing about whether a finger can reach it, because it skips the raycast, the blocking overlay and the capture that decide whether the press arrives at all. We moved those tests to push the press through the virtual input device with every other behaviour on the prefab disabled, which is the only version that catches a panel silently eating input.` },
    { what:`A build that had failed reported success, and the artefact it produced could not be installed.`,
      lesson:`Verify the verifier. The signal a pipeline trusts has to be checked against a build you know is broken, otherwise the check has never been observed failing and is decoration. We took two independent signals, and treated agreement as the only pass.` },
    { what:`A configuration test that could not fail passed for weeks.`,
      lesson:`Before deleting eight jobs, we asserted the new table matched the live configuration. The check tested nothing until we added a final case that feeds a deliberately corrupted table and requires a failure. Any test that exists to authorise a deletion needs that negative control.` }
  ],
  stories:[
    { s:`Eight near identical build jobs had drifted apart and nobody trusted any of them.`,
      t:`I took over a pipeline set where each target had its own job, configured through a web form, differing in four parameters and in whatever anyone had edited under deadline. My task was one maintainable pipeline without losing a working configuration that nobody had written down.`,
      a:`Before deleting anything I read the live configuration of all eight jobs and wrote it into a table keyed on job name, then wrote a test asserting my table matched the measured values field by field. The last case in that test feeds a deliberately corrupted table and requires the check to fail, so it cannot pass by testing nothing. Then I moved the targets one at a time and kept the old job until its replacement had produced a green artefact.`,
      r:`Eight jobs became one pipeline with a table anyone can read, and the migration produced no lost parameters. The practice I kept is that a test written to justify a deletion has to be shown failing before it is allowed to authorise anything.` },
    { s:`Memory climbed across scene transitions until mid tier phones killed the app.`,
      t:`Sessions that moved between several screens grew steadily. It reproduced only on real devices after a long session, which meant the usual profiler loop was too slow to iterate on.`,
      a:`I put asset handles behind a scope enum tied to the scene layers we already had, so a transition promotes the next scene scope and releases the current overlay. Then I added release diagnostics and pool double release detection under the debug define, warning rather than throwing so a pooling bug degrades instead of taking the session down, and compared memory snapshots before and after a fixed walk through the same screens.`,
      r:`The climb flattened and stayed flat, and the scope became the thing reviewers ask about when a new load call appears. The general lesson is to attach asset lifetime to an event the code already raises, because a release call that a human has to remember is a leak with a delay on it.` },
    { s:`A teammate asked me to let a lower layer reference the screen layer so a feature could ship on time.`,
      t:`The direction of dependencies was the one architectural rule we actually enforced, and it was one day before a milestone. Saying only no would have made me the obstacle, and saying yes once would have ended the rule.`,
      a:`I said no to the inversion and spent the next hour on the alternative rather than the argument. We declared the contract as an interface in the lower layer, implemented it in the screen layer and injected it at boot, which was about the same amount of code and took under a day. I wrote the reasoning into the rule file as a worked example so the next person meets the answer before they meet me.`,
      r:`The feature shipped on the milestone and the direction held. What I learned is that a boundary survives on the quality of the alternative you offer within the hour, not on the authority of the person defending it.` },
    { s:`A store upload failed at the end of a two hour build and took the whole run down with it.`,
      t:`Any network flake at the last stage discarded a valid artefact and the run had to start from checkout. I wanted the failure to keep costing attention without costing the build.`,
      a:`I graded the failures. A compile failure fails hard because the output is worthless, while a failed symbol or store upload marks the run unstable and keeps the artefact, so it can be uploaded by hand. I wrapped every network touching step in retry with backoff, checked native exit codes explicitly through one wrapper instead of trusting the shell, and put parameter validation in a cheap early stage so an invalid upload target fails in a minute rather than after the build.`,
      r:`Lost builds stopped and the unstable runs stayed visible in the pipeline notifications. The rule I apply now is to grade failures by what they destroy, and to validate free text parameters before anything expensive starts.` }
  ],
  rel:[
    ['infra-ci-pipelines',`Stage shape, retries, two way failure detection and graded outcomes are all decided here under real deadlines.`],
    ['infra-secrets',`The committed tokens, key file and signing password in this case are the anti-pattern that a credential store exists to end.`],
    ['pm-qa-release',`Three test tiers, a device smoke walk and a release gate that had to stay affordable is what QA planning looks like on a live client.`],
    ['quality-and-build-health',`A pipeline that reports success on a failed build is the clearest example of build health being about trustworthy signals, not green ticks.`],
    ['team-and-collaboration',`Refusing an inverted dependency while supplying the alternative within the hour is the collaboration half of an architectural rule.`],
    ['lead-conventions',`The assembly direction, the exclusion lists and the rule files are conventions written down because review memory does not scale.`]
  ]
});

CASE({
  id:'cs-unity-multiplatform-port',
  t:'Porting a console game to PC and mobile in Unity',
  role:'Client engineer on the port, later technical lead',
  period:'2 years, shipped port',
  stack:['Unity','C#','IL2CPP','Fusion','AssetBundles','Jenkins','Memory Profiler'],
  context:`A shipped console title had to run on desktop and on phones from one codebase, keeping its multiplayer and its content while fitting a fraction of the original memory budget. Most of the gameplay code was inherited, including a hand written authoritative network protocol and a large body of decompiler derived source in an older style. The port added touch input, a per platform online services layer and a mobile build and delivery pipeline.`,
  arch:[
    `Gameplay stays in the default assembly on purpose, because the code obfuscator selects its target assembly by name and splitting code out would quietly move it outside the protected set.`,
    `Three source roots coexist. An inherited legacy root in an older style, newer feature modules with namespaces, and a support layer for audio, localisation, memory, safe area and UI.`,
    `No container and no service locator. Prefab and singleton wiring, with every component lookup funnelled through two helpers, one for references that may legitimately be absent and one for references whose absence is a broken setup.`,
    `Netcode in two layers. A commercial tick based SDK provides transport, sessions and matchmaking, and the inherited authoritative protocol rides on top of it with its own message types and per entity synchronisers.`,
    `Host mode topology with lag compensation and host migration off. Remote entities use swappable interpolation strategies driven by messages, and latency is measured in the application with a rolling average rather than taken from the SDK.`,
    `Platform online services sit behind eleven coordinator interfaces chosen by a compile-time type alias, so session, invite, friends, privileges and notification code has no platform branch in it.`,
    `Hand managed encrypted asset bundles rather than Addressables, with reference counting by lifetime scope of boot, session, scene and screen, and the scope table generated from the enum so an entry cannot be forgotten.`,
    `Scenes are classified into dependency tiers with forbidden shared bundles per tier, so a shell UI scene that accidentally pulls character models fails the build instead of the memory budget.`,
    `Ten named desktop build pipelines behind one entry point, with phase traces written into a log and a one line status file, and failures re-prefixed with the phase that failed.`,
    `Three declarative CI pipelines sharing one stage shape, validating free text parameters in a cheap early stage and grading upload failures separately from build failures.`
  ],
  decisions:[
    { d:`Keep gameplay in the default assembly instead of splitting it into layered assemblies.`,
      why:`The obfuscator protects one assembly by name. A tidy split would have left most of the game outside the protected set without any error, which for an offline shippable binary is the threat we were paid to care about.`,
      trade:`No compile-time layering and no incremental compile win, and test assemblies cannot reference the game, so the test harness resolves types by name through reflection. We centralised that reflection in one file and accepted it.` },
    { d:`Two independent obfuscation layers, asset name hashing and code renaming, each switchable per pipeline.`,
      why:`They defend against two different threats, datamining of shipped assets and reverse engineering of the binary, and being able to turn one off is what makes a failure diagnosable.`,
      trade:`Everything that resolves a name at runtime breaks, and it breaks in the protected player build that the editor never produces. Each exemption is a hole in the protection that has to be justified in a comment.` },
    { d:`Interpolation with light local prediction, not rollback.`,
      why:`The inherited protocol was proven and the sessions are small and cooperative, so smooth remote motion mattered more than frame accurate contention. Local interaction uses a predicted target that the authoritative message reconciles.`,
      trade:`Competitive play would expose it immediately. A player with a poor connection sees their own action corrected, and there is no compensation layer to hide the correction.` },
    { d:`Treat an operating system suspend during a session as immediate session death.`,
      why:`A phone backgrounds for a call and the session is already gone. Ending it at once means there is no window in which a dead session can still be operated by the player or by the code.`,
      trade:`Anyone who takes a call loses the session with no reconnect path. We chose a loud honest failure over a silent inconsistent one, and it is a decision a live service game would revisit.` },
    { d:`Reference count assets by lifetime scope, with the scope table generated from the enum.`,
      why:`Manual load and unload bookkeeping across a ported codebase had already failed. Generating the table from the enum means adding a scope cannot silently skip its release path.`,
      trade:`A wrongly scoped load is invisible until memory says so, so we added a runtime flag that disables real unloading to bisect a leak on device without rebuilding.` },
    { d:`Classify scenes into dependency tiers with forbidden shared bundles, checked at build time.`,
      why:`Memory regressions from an accidental reference are the cheapest possible thing to catch and the most expensive to diagnose late. Making them a build failure moves them to the person who caused them.`,
      trade:`The tier table needs maintaining, and a legitimate new dependency turns into an argument about the table rather than a five minute change.` },
    { d:`Write down a build rationing ladder and make plans declare their build cost.`,
      why:`A protected player build takes hours. Static inspection, compile only, editor play mode, then one batched device build, with a second only if the first falsifies the hypothesis, keeps the expensive step for questions that only a device can answer.`,
      trade:`It slows down the cases that genuinely needed a device build first, and it can become a licence to guess. We required plans to record builds expected against builds used so the ladder stays honest.` },
    { d:`Concentrate every platform conditional for a module into one file and say so in its header.`,
      why:`Touch support landed as twelve files with exactly one branch point, so gameplay never learns which input device exists and a reviewer can see every platform decision in one place.`,
      trade:`That file becomes a hot spot everyone edits, and keeping the rule true occasionally costs an extra indirection where a local conditional would have been two lines.` }
  ],
  lessons:[
    { what:`Enabling obfuscation stopped remote players appearing, on device only, while the editor stayed healthy.`,
      lesson:`The netcode SDK resolves its generated network members by name at runtime, and the renaming pass had renamed them. Any tool that rewrites names is incompatible with name based lookup, and the failure surfaces only in the build the editor never produces. We exempted the whole weaved class rather than picking members, and wrote the reason next to the attribute so the next person does not remove it as clutter.` },
    { what:`A long headless build reported success through its exit code after failing.`,
      lesson:`The process exit code was unreliable in the way the pipeline launched the editor, so the wrapper reads a result marker the build itself writes. We also emitted a phase trace at the start and end of every stage into a status file, which turned an hour of log reading into one line. A signal you cannot show failing is not a check.` },
    { what:`Signing material and platform configuration lived in the repository because the pipeline needed them at a path.`,
      lesson:`Convenience for an agent is not a reason for version control to hold a credential. Keeping the files outside the asset tree made them easier to move later, but the fix is injection from a credential store at build time and treating the committed copies as compromised the moment they are found.` },
    { what:`A test that drove the on screen stick by calling the control directly passed while real touches did nothing.`,
      lesson:`Synthetic calls bypass the layer that decides whether a press ever arrives, which on a touch UI is capture, raycast blocking and ordering. The tests that earned their place push the press into the virtual input device with every other behaviour on the prefab disabled, so what they assert is that the input reached the device, not that a method can be called.` }
  ],
  stories:[
    { s:`Remote players stopped appearing on device the week we turned obfuscation on.`,
      t:`The protected build was the one we ship and the editor build was healthy, so every normal debugging loop was unavailable. I had a milestone build due and a multiplayer feature that worked everywhere except in the artefact that mattered.`,
      a:`I bisected by build configuration rather than by code, turning each protection layer off separately, which pointed at code renaming rather than at asset hashing. The networking SDK resolves its weaved members by name at runtime, so renaming them broke remote player registration silently. I exempted the whole weaved class instead of chasing individual members, because a partial exemption would fail again on the next generated member, and left a short post mortem in a comment at the attribute.`,
      r:`We shipped with both protection layers enabled and no further surprises from the netcode. The rule I now apply before enabling any renaming tool is to list everything in the project that resolves a name at runtime, because those are exactly the things that will fail in a build nobody runs in the editor.` },
    { s:`The port had to fit a memory budget a fraction of the original platform.`,
      t:`The inherited content assumed a console amount of memory. My job was to make the game fit on low end phones without cutting the content, and to make sure it stayed fitting after other people kept adding to it.`,
      a:`I set explicit budgets per device tier with a separate allowance for the spike during loading, and classified devices from installed memory at start up so quality defaults follow the hardware. Asset lifetime moved to reference counting by scope with the scope table generated from the enum. Then I made the regression a build failure by classifying scenes into dependency tiers with forbidden shared bundles, and added a runtime flag that disables real unloading so a leak can be bisected on a device without another build.`,
      r:`We shipped inside the budget on the lowest supported tier, and later regressions failed in CI rather than in a bug report. What I would repeat is making the limit a number per tier and making the violation a build error, because a budget nobody can fail is a wish.` },
    { s:`The game had never had a touch screen and the codebase had no abstraction for one.`,
      t:`Gameplay read a controller through a device and binding layer inherited from the console version. Adding touch by branching at every call site would have doubled the input paths in code we were not otherwise touching.`,
      a:`I bridged touch into the existing controller layer as a virtual device, so on screen sticks and buttons feed the same bindings the gameplay already reads. Every platform conditional lives in one file and the module header says so, and an editor only preview define lets the mobile UI be exercised on a desktop. The tests assert that pressing a widget reaches the virtual input device, with every other behaviour on the prefab disabled, because a test that calls the handler would have passed with the UI unreachable.`,
      r:`Gameplay code never learned that touch exists, and the whole port was twelve files with one branch point. It is the example I use for pushing a new input source into the existing abstraction rather than teaching the game about a second one.` },
    { s:`A two hour build failed and the log did not say which stage had failed.`,
      t:`Ten named pipelines shared one entry point and produced one enormous log. Diagnosing a failure meant reading it, and a wrong parameter typed into a form could waste the whole two hours before anyone found out.`,
      a:`I added a phase trace at the start and end of every stage, a one line status file for a glance, and re-prefixed failures with the failing phase so the first line names the stage. I moved parameter validation into the cheap setup stage so an invalid upload target or a missing editor version fails in the first minute. The wrapper now reads the result marker the build writes rather than the process exit code, which was unreliable in that launch mode.`,
      r:`Failure diagnosis went from reading a log to reading one line, and wasted long runs from bad parameters stopped. I carry two habits from it, validate free text input before anything expensive, and never trust a status signal you have not watched report a real failure.` }
  ],
  rel:[
    ['server-authority',`Host mode with an authoritative protocol over a commercial SDK is a real answer to who decides, and this case shows what it costs.`],
    ['server-state-sync',`Choosing interpolation and light local prediction over rollback, then measuring latency in the application, is the trade-off made concrete.`],
    ['platform-and-session',`A console title reshaped for phone sessions is where platform constraints stop being a checklist and start deciding the design.`],
    ['risk-and-dependencies',`The obfuscator, the netcode SDK and the inherited codebase were the three dependencies that could each have sunk the port.`],
    ['pm-estimation',`The build rationing ladder and recording builds expected against builds used is estimation under uncertainty with a feedback loop attached.`],
    ['scope-control',`Keeping the content and cutting elsewhere, including refusing a reconnect path, is what scope control looks like when the budget is memory rather than time.`]
  ]
});
